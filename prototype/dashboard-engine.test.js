const assert = require('node:assert/strict')

const {
  DashboardLayoutModel,
  createDefaultDashboardWidgets,
  createKpiWidget,
  createChartWidget,
  registerDashboardChart,
  computeMinimapGeometry,
  minimapPointToCamera,
} = require('./dashboard-engine.js')

function test(name, run) {
  try {
    run()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    throw error
  }
}

test('шаблон быстрого старта содержит четыре утверждённых KPI', () => {
  const widgets = createDefaultDashboardWidgets()

  assert.equal(widgets.length, 4)
  assert.deepEqual(widgets.map(widget => widget.title), ['Выручка', 'Выкупы', 'Маржа', 'Расходы'])
  assert.ok(widgets.every(widget => widget.kind === 'kpi'))
})

test('модель дашборда изначально пуста', () => {
  const model = new DashboardLayoutModel()

  assert.equal(model.widgets.length, 0)
})

test('шаблон графика имеет фиксированный формат карточки дашборда', () => {
  registerDashboardChart('fixture-chart', { title: 'Фикстура', group: 'Группа', source: 'Источник', icon: 'i-chart', type: 'area' })

  const widget = createChartWidget('fixture-chart')

  assert.equal(widget.kind, 'chart')
  assert.equal(widget.title, 'Фикстура')
  assert.deepEqual({ w: widget.w, h: widget.h }, { w: 352, h: 220 })
  assert.equal(widget.chart.type, 'area')
})

// Подмены «первой карточкой» нет: лист не должен показывать другой график вместо того,
// карточка которого умерла в библиотеке.
test('неизвестный ключ графика не собирает виджет', () => {
  assert.equal(createChartWidget('chart-that-never-existed'), null)
})

test('перемещение привязывает карточку к близкой границе другой карточки и возвращает направляющие', () => {
  const model = new DashboardLayoutModel(createDefaultDashboardWidgets())

  const result = model.moveWidget('dash-revenue', 295, 71)

  assert.deepEqual({ x: result.widget.x, y: result.widget.y }, { x: 296, y: 72 })
  assert.deepEqual(result.guides.filter(guide => guide.orientation !== 'spacing').map(guide => [guide.orientation, guide.position]), [
    ['vertical', 296],
    ['horizontal', 72],
  ])
})

// Три заметки в одном ряду: средняя встаёт в равный зазор между крайними, а не туда, где её отпустили.
test('карточка встаёт в равный зазор между соседями ряда и отдаёт две метки', () => {
  const model = new DashboardLayoutModel([
    { id: 'note-a', kind: 'note', title: 'Заметка', x: 48, y: 72, w: 232, h: 140 },
    { id: 'note-b', kind: 'note', title: 'Заметка 2', x: 304, y: 72, w: 232, h: 140 },
    { id: 'note-c', kind: 'note', title: 'Заметка 3', x: 560, y: 72, w: 232, h: 140 },
  ])

  const result = model.moveWidget('note-b', 300, 72)

  assert.equal(result.widget.x, 304)
  assert.deepEqual(
    result.guides.filter(guide => guide.orientation === 'spacing').map(guide => [guide.axis, Math.round(guide.gap), guide.equal]),
    [['x', 24, true], ['x', 24, true]],
  )
})

// Интервал в 40 px уже есть в верхнем ряду — карточка в нижнем ряду дотягивается до него,
// хотя рядом с ней по вертикали никого нет: ориентируемся на ритм сцены, а не на пустоту.
test('одиночный зазор подтягивается к интервалу, который уже есть в другом ряду', () => {
  const model = new DashboardLayoutModel([
    { id: 'note-a', kind: 'note', title: 'Заметка', x: 48, y: 72, w: 232, h: 140 },
    { id: 'note-b', kind: 'note', title: 'Заметка 2', x: 320, y: 72, w: 232, h: 140 },
    { id: 'note-c', kind: 'note', title: 'Заметка 3', x: 700, y: 300, w: 232, h: 140 },
    { id: 'note-d', kind: 'note', title: 'Заметка 4', x: 1000, y: 600, w: 232, h: 140 },
  ])

  const result = model.moveWidget('note-d', 424, 300)

  assert.equal(result.widget.x, 428)
  const hint = result.guides.find(guide => guide.orientation === 'spacing' && guide.axis === 'x')
  assert.deepEqual([Math.round(hint.gap), hint.equal, hint.from, hint.to], [40, true, 660, 700])
})

// Группа тянется как единая рамка: карточки внутри неё не становятся ориентирами друг для
// друга, иначе над рядом появлялась пустая направляющая и чип.
test('внутри группы нет ориентиров: все карточки листа тянутся без направляющих', () => {
  const model = new DashboardLayoutModel(createDefaultDashboardWidgets())
  const [anchor, ...parts] = model.widgets
  const companions = parts.map(part => ({ id: part.id, dx: part.x - anchor.x, dy: part.y - anchor.y, w: part.w, h: part.h }))

  const result = model.moveWidget(anchor.id, anchor.x + 40, anchor.y + 12, { companions })

  assert.deepEqual(result.guides, [])
  assert.deepEqual(result.shift, { x: 0, y: 0 })
  assert.deepEqual({ x: result.widget.x, y: result.widget.y }, { x: 88, y: 84 })
})

// Снап считается по объединяющей рамке группы (getGroupBoundingBox в оригинале), поэтому
// дальний край рамки ловит внешнего соседа — захваченная карточка до него не дотягивается.
// Захват намеренно у правого карточки ряда: сдвиг обязан считаться от рамки, а не от точки захвата.
test('объединяющая рамка группы ловит край внешнего ориентира', () => {
  const model = new DashboardLayoutModel([
    { id: 'note-a', kind: 'note', title: 'Заметка', x: 48, y: 72, w: 232, h: 140 },
    { id: 'note-b', kind: 'note', title: 'Заметка 2', x: 320, y: 72, w: 232, h: 140 },
    { id: 'note-c', kind: 'note', title: 'Заметка 3', x: 900, y: 300, w: 232, h: 140 },
  ])

  const result = model.moveWidget('note-b', 664, 72, { companions: [{ id: 'note-a', dx: -272, dy: 0, w: 232, h: 140 }] })

  assert.deepEqual(result.shift, { x: 4, y: 0 })
  assert.deepEqual({ x: result.widget.x, y: result.widget.y }, { x: 668, y: 72 })
  assert.deepEqual(result.guides.map(guide => [guide.orientation, guide.position]), [['vertical', 900]])
})

// Карточки на разных уровнях: метка зазора остаётся в общей полосе пересечения, а не улетает
// к центру той карточки, которую тянут.
test('метка зазора не уходит в воздух, когда карточки на разных уровнях', () => {
  const model = new DashboardLayoutModel([
    { id: 'note-a', kind: 'note', title: 'Заметка', x: 48, y: 72, w: 232, h: 140 },
    { id: 'note-b', kind: 'note', title: 'Заметка 2', x: 320, y: 192, w: 232, h: 140 },
  ])

  const result = model.moveWidget('note-b', 320, 192)
  const hint = result.guides.find(guide => guide.orientation === 'spacing' && guide.axis === 'x')

  assert.deepEqual([Math.round(hint.gap), hint.at], [40, 212])
})

// Стен нет: канвас в оригинале конечен только справа, по вертикали не ограничен вовсе.
test('карточку можно увести за левый и верхний край листа', () => {
  const model = new DashboardLayoutModel(createDefaultDashboardWidgets())

  const result = model.moveWidget('dash-revenue', -140, -96)

  assert.deepEqual({ x: result.widget.x, y: result.widget.y }, { x: -140, y: -96 })
})

// Пара заметок вместо KPI-карточек: у KPI стандарт зафиксирован, ресайз к нему не применяется.
const resizablePair = () => new DashboardLayoutModel([
  { id: 'note-a', kind: 'note', title: 'Заметка', x: 48, y: 72, w: 232, h: 140 },
  { id: 'note-b', kind: 'note', title: 'Заметка 2', x: 296, y: 72, w: 232, h: 140 },
])

test('четыре угловые ручки меняют соответствующие стороны карточки', () => {
  const model = new DashboardLayoutModel([
    { id: 'note-a', kind: 'note', title: 'Заметка', x: 48, y: 72, w: 400, h: 300 },
    { id: 'note-b', kind: 'note', title: 'Заметка 2', x: 600, y: 72, w: 232, h: 140 },
  ])

  model.resizeWidget('note-a', 'topLeft', { x: 64, y: 88 })
  const widget = model.getWidget('note-a')

  assert.deepEqual(
    { x: widget.x, y: widget.y, width: widget.w, height: widget.h },
    { x: 64, y: 88, width: 384, height: 284 },
  )
})

// Нижняя граница заметки — стандарт KPI: ниже карточка теряет и название, и комментарий.
// Верхней границы нет — аннотацию растягивают на сколько нужно.
test('заметку нельзя сжать ниже стандарта KPI, но можно растянуть без потолка', () => {
  const model = resizablePair()

  const shrunk = model.resizeWidget('note-a', 'bottomRight', { x: 120, y: 90 })
  assert.deepEqual({ width: shrunk.widget.w, height: shrunk.widget.h }, { width: 232, height: 140 })

  const grown = model.resizeWidget('note-a', 'bottomRight', { x: 1400, y: 900 })
  assert.deepEqual({ width: grown.widget.w, height: grown.widget.h }, { width: 1352, height: 828 })
})

test('изменяемая граница прилипает к соседней карточке и показывает направляющую', () => {
  const model = resizablePair()

  // Нижний край соседней карточки находится на y = 72 + 140, поэтому тянем за 214, чтобы попасть в порог прилипания.
  const result = model.resizeWidget('note-a', 'bottomRight', { x: 294, y: 214 })

  assert.deepEqual({ width: result.widget.w, height: result.widget.h }, { width: 248, height: 140 })
  assert.deepEqual(result.guides.map(guide => [guide.orientation, guide.position]), [
    ['vertical', 296],
    ['horizontal', 212],
  ])
})

test('KPI-карточка держит стандарт каталога и не меняет размер', () => {
  const model = new DashboardLayoutModel(createDefaultDashboardWidgets())

  const result = model.resizeWidget('dash-revenue', 'bottomRight', { x: 400, y: 300 })

  assert.deepEqual({ width: result.widget.w, height: result.widget.h }, { width: 232, height: 140 })
  assert.equal(result.guides.length, 0)
  assert.equal(model.canUndo, false)
})

test('изменение раскладки можно отменить и повторить', () => {
  const model = new DashboardLayoutModel(createDefaultDashboardWidgets())

  model.moveWidget('dash-revenue', 96, 112)
  assert.deepEqual({ x: model.getWidget('dash-revenue').x, y: model.getWidget('dash-revenue').y }, { x: 96, y: 112 })

  model.undo()
  assert.deepEqual({ x: model.getWidget('dash-revenue').x, y: model.getWidget('dash-revenue').y }, { x: 48, y: 72 })

  model.redo()
  assert.deepEqual({ x: model.getWidget('dash-revenue').x, y: model.getWidget('dash-revenue').y }, { x: 96, y: 112 })
})

test('мини-карта включает все виджеты и текущую видимую область', () => {
  const geometry = computeMinimapGeometry(
    [
      { x: 100, y: 80, w: 200, h: 100 },
      { x: 900, y: 500, w: 200, h: 100 },
    ],
    { x: -400, y: -240, zoom: 1 },
    { width: 600, height: 400 },
  )

  assert.deepEqual(geometry.viewBox.map(value => Math.round(value)), [60, 0, 1080, 720])
  assert.deepEqual(geometry.viewport, { x: 400, y: 240, w: 600, h: 400 })
  assert.ok(geometry.widgets.every(rect => rect.x >= 60 && rect.y >= 0))
  assert.ok(geometry.widgets.every(rect => rect.x + rect.w <= 1140 && rect.y + rect.h <= 720))
})

test('клик по мини-карте центрирует canvas на выбранной точке', () => {
  const geometry = {
    mapWidth: 192,
    mapHeight: 128,
    viewBox: [60, 0, 1080, 720],
  }

  const camera = minimapPointToCamera(96, 64, geometry, { zoom: 1 }, { width: 600, height: 400 })

  assert.deepEqual(camera, { x: -300, y: -160, zoom: 1 })
})

test('KPI создаётся из каталога метрик и принимает пользовательское название', () => {
  const widget = createKpiWidget('margin', { id: 'custom-margin', title: 'Вклад', x: 320, y: 240 })

  assert.deepEqual(
    { id: widget.id, metricKey: widget.metricKey, title: widget.title, value: widget.value, icon: widget.icon, x: widget.x, y: widget.y },
    { id: 'custom-margin', metricKey: 'margin', title: 'Вклад', value: '324 875 ₽', icon: 'i-banknote', x: 320, y: 240 },
  )
})

test('настройку KPI можно изменить с сохранением истории', () => {
  const model = new DashboardLayoutModel(createDefaultDashboardWidgets())

  model.updateWidget('dash-margin', { title: 'Вклад', note: 'Новая подпись' })
  assert.equal(model.getWidget('dash-margin').title, 'Вклад')

  model.undo()
  assert.equal(model.getWidget('dash-margin').title, 'Маржа')
})
