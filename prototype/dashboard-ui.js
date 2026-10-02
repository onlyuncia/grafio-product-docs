const {
  DashboardLayoutModel,
  KPI_METRICS,
  KPI_METRIC_TIPS,
  KPI_WIDTH,
  KPI_HEIGHT,
  CHART_WIDTH,
  CHART_HEIGHT,
  DASHBOARD_CHARTS,
  // Сам здесь не вызывается: деструктурируем, чтобы app.js увидел его как глобальную привязку
  // скрипта — каталог графиков наполняется приложением, а не движком.
  registerDashboardChart,
  createKpiWidget,
  createChartWidget,
  computeMinimapGeometry,
  minimapPointToCamera,
} = window.GrafioDashboard

const dashboardSheets = [
  { id: 'main', name: 'Основной', isDefault: true, model: new DashboardLayoutModel([]) },
]
let activeDashboardSheet = 'main'
let dashboardEditing = false
// Выделение — множество, как selectedIds в SelectionContext оригинала. Якорь держим отдельно:
// ручки ресайза и кнопки виджета в оригинале показываются только на одном виджете, группой тянут.
let selectedDashboardWidget = null
const dashboardSelection = new Set()
let dashboardGuides = []
let dashboardMeasure = null
let dashboardRulerEnabled = false
let dashboardMinimapOpen = false
let dashboardGridVisible = true
let dashboardCamera = { x: 36, y: 34, zoom: 1 }
let dashboardSheetIndex = 1
let renamingDashboardSheet = null
let sheetMenuTargetId = null
let dashboardMinimapGeometry = null
let kpiEditorState = null
const dashboardFloatingRefreshers = []

// Избранное и история применений живут в слое панели, а не в модели листа: порядок массива
// = порядок показа, и он переживает смену и дублирование листа.
const KPI_FAV_STORE = 'grafio.kpiFavorites'
const KPI_RECENT_STORE = 'grafio.kpiRecents'
const KPI_RECENT_LIMIT = 6
const KPI_CLUSTER_IDS = new Set(Object.values(KPI_METRICS).map(metric => `${metric.title}|${metric.source}`))
let kpiMetricFilter = 'all'
let kpiFavoriteIds = readKpiStore(KPI_FAV_STORE)
let kpiRecentIds = readKpiStore(KPI_RECENT_STORE)

// Звезда на графике не подсвечивает метрику: у редакторов свои накопители.
const CHART_FAV_STORE = 'grafio.chartFavorites'
const CHART_RECENT_STORE = 'grafio.chartRecents'
const CHART_RECENT_LIMIT = 6
let chartMetricFilter = 'all'
let chartFavoriteIds = readKpiStore(CHART_FAV_STORE)
let chartRecentIds = readKpiStore(CHART_RECENT_STORE)

// Два редактора — метрики и графики — ездят на одной машине состояния: одна стопка
// предпросмотра, одно затемнение, один Esc. Различается только оболочка, поэтому она в одном
// справочнике: иначе правка одной панели молча разошлась бы с другой.
const EDITOR_CHROME = {
  kpi: {
    panel: 'dashboardKpiSettings', heading: 'kpiSettingsTitle', hint: 'kpiSettingsHint',
    search: 'kpiMetricSearch', name: 'kpiCustomTitle', apply: 'kpiSettingsApply',
    addVerb: 'Добавить KPI', namePlaceholder: 'Название метрики',
    addHeading: 'Добавить виджет', editHeading: 'Настроить показатель',
    pickHint: 'Выберите метрику для карточки', emptyPreview: 'Выберите метрику',
  },
  chart: {
    panel: 'dashboardChartSettings', heading: 'chartSettingsTitle', hint: 'chartSettingsHint',
    search: 'chartMetricSearch', name: 'chartCustomTitle', apply: 'chartSettingsApply',
    addVerb: 'Добавить график', namePlaceholder: 'Название графика',
    addHeading: 'Добавить график', editHeading: 'Настроить график',
    pickHint: 'Выберите график для карточки', emptyPreview: 'Выберите график',
  },
}

function editorChrome() {
  return EDITOR_CHROME[kpiEditorState?.kind || 'kpi']
}

function activeDashboardModel() {
  return dashboardSheets.find(sheet => sheet.id === activeDashboardSheet)?.model || dashboardSheets[0].model
}

function activeDashboardLayout() {
  return activeDashboardModel().widgets
}

function escapeDashboardText(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

const SOFT_HYPHEN = '\u00AD'
const DASHBOARD_VOWEL = /[аеёиоуыэюяaeiouy]/i
const DASHBOARD_WORD = /[а-яёa-z]+/gi

// Знак переноса вставляет сам браузер только когда у него есть словарь переносов для языка,
// а в Chromium этого словаря нет ни для русского, ни для немецкого — hyphens:auto рвёт слово
// молча, без дефиса. Поэтому точки переноса считаем здесь: гласная + согласные + гласная,
// перенос после первого согласного кластера (кластер из одной буквы уходит вниз строки).
// Мягкий перенос невидим, пока строка не оборвалась именно на нём, и ровняет правый край.
// Метку ставим, только если по обе стороны от неё в слове остаётся не меньше двух букв:
// однобуквенный остаток («бы|ло», «ов|ки») правилами типографики запрещён.
function hyphenateDashboardText(value) {
  const text = String(value ?? '')
  return text.replace(DASHBOARD_WORD, word => {
    const marks = new Set()
    for (let i = 0; i < word.length; i++) {
      if (!DASHBOARD_VOWEL.test(word[i])) continue
      let end = i + 1
      while (end < word.length && !DASHBOARD_VOWEL.test(word[end])) end += 1
      if (end >= word.length || !DASHBOARD_VOWEL.test(word[end])) continue
      const at = end - i === 2 ? i + 1 : i + 2
      if (at >= 2 && word.length - at >= 2) marks.add(at)
    }
    if (!marks.size) return word
    let out = ''
    for (let i = 0; i < word.length; i++) {
      if (marks.has(i)) out += SOFT_HYPHEN
      out += word[i]
    }
    return out
  })
}

function stripDashboardHyphens(value) {
  return String(value ?? '').replace(/\u00AD/g, '')
}

function dashboardIcon(icon) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#${icon}"></use></svg>`
}

const dashboardSparkHeight = 22
const dashboardSparkSideBudget = 66

function dashboardSparklineSvg(widget, width) {
  const height = dashboardSparkHeight
  const min = Math.min(...widget.sparkline)
  const max = Math.max(...widget.sparkline)
  const range = Math.max(1, max - min)
  const points = widget.sparkline.map((value, index) => {
    const x = index / (widget.sparkline.length - 1) * width
    const y = height - 2 - (value - min) / range * (height - 4)
    return { x, y }
  })
  const previous = points.at(-2)
  const last = points.at(-1)
  const dotX = width - 2
  const segment = Math.max(1, last.x - previous.x)
  const t = (dotX - previous.x) / segment
  const dotY = previous.y + (last.y - previous.y) * t
  const line = points.slice(0, -1).map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).concat(`L ${dotX.toFixed(2)} ${dotY.toFixed(2)}`).join(' ')
  const area = `${points.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')} L ${width} ${height} L 0 ${height} Z`
  const gradientId = `dashboard-spark-${String(widget.id).replace(/[^a-z0-9_-]/gi, '')}`
  return `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><defs><linearGradient id="${gradientId}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity=".25"/><stop offset="100%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path class="sparkline-area" d="${area}" fill="url(#${gradientId})"/><path class="sparkline-line" d="${line}"/><circle cx="${dotX}" cy="${dotY.toFixed(2)}" r="2"/></svg>`
}

function dashboardSparklineMarkup(widget) {
  if (!Array.isArray(widget.sparkline) || widget.sparkline.length < 2) return ''
  const width = Math.max(80, widget.w - dashboardSparkSideBudget)
  return `<span class="dashboard-spark-wrap ${widget.showSparkline ? 'is-open' : ''}" aria-hidden="true"><span class="dashboard-sparkline">${dashboardSparklineSvg(widget, width)}</span></span>`
}

function dashboardChartSeriesValues(chart) {
  return chart.series.map(series => chart.points.map(point => Number(point.values[chart.unit]?.[series.key] ?? 0)))
}

// Компактный график рисует тот же ряд, что и карточка отчёта: те же точки, те же цвета,
// тот же тип. Оси, сетки и подписей значений здесь нет по определению — виджет показывает
// форму, а числа остаются в отчёте. Одиночная серия получает последнее значение в легенду,
// двум и больше числа негде встать, и в отчёте они живут в отдельной панели.
function dashboardChartSvg(chart) {
  const width = 312
  const height = 112
  const top = 10
  const bottom = 8
  const plotHeight = height - top - bottom
  const values = dashboardChartSeriesValues(chart)
  const flat = values.flat()
  const axis = `<line x1="0" y1="${height - bottom}" x2="${width}" y2="${height - bottom}"/>`
  const groupWidth = width / chart.points.length

  if (chart.type === 'stacked') {
    const totals = chart.points.map((_, index) => values.reduce((sum, series) => sum + Math.max(series[index], 0), 0))
    const ceiling = Math.max(...totals, 1)
    // 0.58 — измеренная доля столбца в отчёте (week-bar 78 px в колонке 133.6 px). Правило
    // min(78px, 80%) здесь не воспроизводится буквально: карточка вдвое уже, и 80% группы
    // слили бы столбцы в сплошную полосу. Стопки остаются разреженными, как в оригинале.
    const barWidth = groupWidth * .58
    const columns = chart.points.map((_, index) => {
      let base = height - bottom
      const segments = values.map(series => {
        const segmentHeight = Math.max(1.2, series[index] / ceiling * plotHeight)
        base -= segmentHeight
        return { y: base, height: segmentHeight }
      })
      return `<g transform="translate(${(index * groupWidth + groupWidth / 2 - barWidth / 2).toFixed(1)} 0)">${segments.map((segment, seriesIndex) => `<rect y="${segment.y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${segment.height.toFixed(1)}" fill="${chart.series[seriesIndex].color}"/>`).join('')}</g>`
    }).join('')
    return `<svg class="dashboard-chart-svg is-stacked" viewBox="0 0 ${width} ${height}" aria-hidden="true">${axis}${columns}</svg>`
  }

  if (chart.type === 'bars') {
    const ceiling = Math.max(...flat, 1)
    // 0.16 — доля столбца от ширины недели в отчёте (22 px в колонке 139.2 px). Вторым
    // слагаемым кластер ограничен на случай плотной серии, чтобы столбцы не слились.
    const barWidth = Math.min(groupWidth * .16, (groupWidth * .62 - (chart.series.length - 1) * 2) / chart.series.length)
    const clusterWidth = chart.series.length * barWidth + (chart.series.length - 1) * 2
    const bars = chart.points.map((_, index) => values.map((series, seriesIndex) => {
      const barHeight = Math.max(4, series[index] / ceiling * plotHeight)
      const x = index * groupWidth + groupWidth / 2 - clusterWidth / 2 + seriesIndex * (barWidth + 2)
      return `<rect x="${x.toFixed(1)}" y="${(height - bottom - barHeight).toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="2" fill="${chart.series[seriesIndex].color}"/>`
    }).join('')).join('')
    return `<svg class="dashboard-chart-svg is-bars" viewBox="0 0 ${width} ${height}" aria-hidden="true">${axis}${bars}</svg>`
  }

  const ceiling = Math.max(...flat, 1)
  const floor = Math.min(0, ...flat)
  const span = ceiling - floor || 1
  const stepX = chart.points.length > 1 ? width / (chart.points.length - 1) : 0
  const x = index => index * stepX
  const y = value => top + plotHeight * (ceiling - value) / span
  const paths = chart.series.map((series, seriesIndex) => {
    const points = values[seriesIndex].map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(' ')
    const area = chart.type === 'area' ? `<path class="dashboard-chart-area" d="M${x(0).toFixed(1)},${height - bottom} L${points.split(' ').join(' L')} L${x(chart.points.length - 1).toFixed(1)},${height - bottom} Z" fill="${series.color}" fill-opacity=".09"/>` : ''
    const dots = values[seriesIndex].map((value, index) => `<circle cx="${x(index).toFixed(1)}" cy="${y(value).toFixed(1)}" r="3" fill="${series.color}"/>`).join('')
    return `${area}<polyline class="dashboard-chart-line" points="${points}" stroke="${series.color}"/>${dots}`
  }).join('')
  return `<svg class="dashboard-chart-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">${axis}${paths}</svg>`
}

function dashboardChartMarkup(widget) {
  const chart = widget.chart
  const last = chart.points.at(-1).values[chart.unit]
  const legend = chart.series.map(series => `<span><i style="background:${series.color}"></i>${escapeDashboardText(series.label)}</span>`).join('')
  const value = chart.series.length === 1 ? `<b>${escapeDashboardText(chart.format(Number(last[chart.series[0].key])))}</b>` : ''
  return `<span class="dashboard-widget-kicker">${escapeDashboardText(chart.group)}</span><span class="dashboard-widget-icon">${dashboardIcon(chart.icon)}</span><strong class="dashboard-chart-title">${escapeDashboardText(chart.title)}</strong><span class="dashboard-chart-meta">${legend}${value}</span><span class="dashboard-chart-plot">${dashboardChartSvg(chart)}</span><span class="dashboard-chart-labels">${chart.points.map(point => `<small>${escapeDashboardText(point.week)}</small>`).join('')}</span>`
}

// Во время live-resize карточки SVG не пересобирается, и фиксированный viewBox растягивает
// конечную точку в эллипс. Пересчитываем геометрию только этой карточки в такт ширине (без полного re-render).
function refreshWidgetSparklineGeometry(node, widget) {
  if (!node || !Array.isArray(widget.sparkline) || widget.sparkline.length < 2) return
  const spark = node.querySelector('.dashboard-sparkline')
  if (!spark) return
  spark.innerHTML = dashboardSparklineSvg(widget, Math.max(80, widget.w - dashboardSparkSideBudget))
}

function dashboardWidgetMarkup(widget) {
  if (widget.kind === 'chart') return dashboardChartMarkup(widget)
  if (widget.kind === 'note') {
    // Карандаш — сосед редактируемого поля, а не его потомок: иначе он попал бы в textContent
    // при коммите и осел текстом внутри названия.
    const field = (tag, key, value) => `<span class="dashboard-note-row${key === 'body' ? ' is-note-body' : ''}"><${tag} data-note-field="${key}">${escapeDashboardText(hyphenateDashboardText(value))}</${tag}><i class="dashboard-note-edit" aria-hidden="true">${dashboardIcon('i-pencil')}</i></span>`
    return `<span class="dashboard-widget-icon">${dashboardIcon(widget.icon || 'i-sticky')}</span>${field('strong', 'title', widget.title || 'Заметка')}${field('p', 'body', widget.body || '')}`
  }
  return `<span class="dashboard-widget-kicker">${escapeDashboardText(widget.title)}</span><span class="dashboard-widget-icon">${dashboardIcon(widget.icon)}</span><span class="dashboard-widget-unit">${escapeDashboardText(widget.unit || '')}</span><strong>${escapeDashboardText(widget.value)}</strong>${dashboardSparklineMarkup(widget)}<small class="${widget.tone || ''}">${escapeDashboardText(widget.note || '')}</small>`
}

function dashboardWidgetActionsMarkup(widget) {
  const sparkline = widget.kind === 'kpi'
    ? `<button class="dashboard-widget-action dashboard-sparkline-toggle ${widget.showSparkline ? 'is-active' : ''}" data-toggle-sparkline="${widget.id}" aria-label="${widget.showSparkline ? 'Скрыть' : 'Показать'} динамику" aria-pressed="${String(Boolean(widget.showSparkline))}">${dashboardIcon('i-chart')}</button>`
    : ''
  if (!dashboardEditing) return sparkline ? `<div class="dashboard-widget-actions dashboard-kpi-actions is-view">${sparkline}</div>` : ''
  // Карандаш есть у обоих настраиваемых форматов: у графика своя панель, зеркальная панели KPI.
  const edit = widget.kind === 'kpi' || widget.kind === 'chart'
    ? `<button class="dashboard-widget-action" data-edit-widget="${widget.id}" aria-label="Настроить ${widget.kind === 'chart' ? 'график' : 'KPI'}">${dashboardIcon('i-pencil')}</button>`
    : ''
  // §4.3: задача привязывается к листу и виджету. Комментарии поверх canvas спека запрещает,
  // поэтому действием становится кнопка в рельсе виджета, а не оверлей на карточке.
  const task = adminCan('assign') ? `<button class="dashboard-widget-action" data-widget-task="${widget.id}" aria-label="Создать задачу по виджету">${dashboardIcon('i-check')}</button>` : ''
  return `<div class="dashboard-widget-actions ${widget.kind === 'kpi' ? 'dashboard-kpi-actions' : ''}">${sparkline}${edit}${task}<button class="dashboard-widget-action dashboard-widget-remove" data-remove-widget="${widget.id}" aria-label="Убрать виджет">${dashboardIcon('i-close')}</button></div>`
}

function resizeHandlesMarkup(widget) {
  // Ручек нет у KPI-карточки: её размер — стандарт каталога. Механика ресайза остаётся
  // для остальных виджетов (заметка тянется за любой угол).
  if (!dashboardEditing || widget.kind === 'kpi' || widget.kind === 'chart') return ''
  return ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
    .map(direction => `<span class="dashboard-resize-handle" data-direction="${direction}" aria-hidden="true"><i></i></span>`)
    .join('')
}

function renderDashboardGuides() {
  const canvas = document.getElementById('dashboardCanvas')
  if (!canvas) return
  canvas.querySelectorAll('.dashboard-snap-guide,.dashboard-spacing-hint,.dashboard-measure-line,.dashboard-measure-projection').forEach(node => node.remove())
  dashboardGuides.forEach(guide => {
    if (guide.orientation === 'spacing') {
      // Метка зазора между карточкой и соседом ряда: линия с штрихами на концах и числом по центру.
      const hint = document.createElement('span')
      const label = String(Math.round(guide.gap))
      hint.className = `dashboard-spacing-hint ${guide.axis === 'x' ? 'horizontal' : 'vertical'}${guide.equal ? ' is-equal' : ''}`
      Object.assign(hint.style, guide.axis === 'x'
        ? { left: `${guide.from}px`, top: `${guide.at}px`, width: `${guide.to - guide.from}px` }
        : { left: `${guide.at}px`, top: `${guide.from}px`, height: `${guide.to - guide.from}px` })
      hint.innerHTML = `<i class="spacing-line"></i><i class="spacing-tick start"></i><i class="spacing-tick end"></i><b>${label}</b>`
      canvas.append(hint)
      return
    }
    const line = document.createElement('span')
    line.className = `dashboard-snap-guide ${guide.orientation}`
    if (guide.orientation === 'vertical') {
      Object.assign(line.style, { left: `${guide.position}px`, top: `${guide.start}px`, height: `${guide.end - guide.start}px` })
    } else {
      Object.assign(line.style, { top: `${guide.position}px`, left: `${guide.start}px`, width: `${guide.end - guide.start}px` })
    }
    canvas.append(line)
  })
  if (dashboardMeasure) {
    const dx = dashboardMeasure.toX - dashboardMeasure.fromX
    const dy = dashboardMeasure.toY - dashboardMeasure.fromY
    const length = Math.hypot(dx, dy)
    const angle = Math.atan2(dy, dx)
    if (Math.abs(dx) > 3 && Math.abs(dy) > 3) {
      const horizontal = document.createElement('span')
      horizontal.className = 'dashboard-measure-projection horizontal'
      Object.assign(horizontal.style, { left: `${Math.min(dashboardMeasure.fromX, dashboardMeasure.toX)}px`, top: `${dashboardMeasure.fromY}px`, width: `${Math.abs(dx)}px` })
      const vertical = document.createElement('span')
      vertical.className = 'dashboard-measure-projection vertical'
      Object.assign(vertical.style, { left: `${dashboardMeasure.toX}px`, top: `${Math.min(dashboardMeasure.fromY, dashboardMeasure.toY)}px`, height: `${Math.abs(dy)}px` })
      canvas.append(horizontal, vertical)
    }
    const line = document.createElement('span')
    line.className = 'dashboard-measure-line'
    line.innerHTML = `<i class="measure-start"></i><i class="measure-end"></i><b><strong>${Math.round(length)}</strong><span>px</span><em>${Math.round(Math.abs(angle * 180 / Math.PI))}°</em></b>`
    Object.assign(line.style, {
      left: `${dashboardMeasure.fromX}px`, top: `${dashboardMeasure.fromY}px`, width: `${length}px`,
      transform: `rotate(${angle}rad)`,
    })
    line.style.setProperty('--measure-counter-rotation', `${-angle}rad`)
    canvas.append(line)
  }
}

function dashboardViewportSize() {
  // stage, а не stage-wrap: обрезающая рамка выпущена под плавающие панели, а «видимая»
  // область для миникарты и камеры — по-прежнему рабочая область.
  const bounds = document.getElementById('dashboardStage')?.getBoundingClientRect()
  return { width: Math.max(1, bounds?.width || 960), height: Math.max(1, bounds?.height || 600) }
}

function renderDashboardMinimap() {
  const panel = document.getElementById('dashboardMinimapPanel')
  const map = document.getElementById('dashboardMinimapMap')
  if (!panel || !map) return
  panel.classList.toggle('is-open', dashboardMinimapOpen)
  panel.setAttribute('aria-hidden', String(!dashboardMinimapOpen))
  document.querySelectorAll('.dashboard-minimap-toggle').forEach(button => button.classList.toggle('is-active', dashboardMinimapOpen))
  if (!dashboardMinimapOpen) return
  requestAnimationFrame(() => dashboardFloatingRefreshers.forEach(refresh => refresh()))
  dashboardMinimapGeometry = computeMinimapGeometry(activeDashboardLayout(), dashboardCamera, dashboardViewportSize())
  map.setAttribute('viewBox', dashboardMinimapGeometry.viewBox.join(' '))
  const widgets = activeDashboardLayout().map(widget => `<rect class="dashboard-minimap-widget ${dashboardSelection.has(widget.id) ? 'is-selected' : ''}" x="${widget.x}" y="${widget.y}" width="${widget.w}" height="${widget.h}" rx="8"/>`).join('')
  const viewport = dashboardMinimapGeometry.viewport
  map.innerHTML = `${widgets}<rect id="dashboardMinimapViewport" class="dashboard-minimap-viewport" x="${viewport.x}" y="${viewport.y}" width="${viewport.w}" height="${viewport.h}" rx="5"/>`
}

function applyDashboardCamera() {
  const canvas = document.getElementById('dashboardCanvas')
  if (!canvas) return
  canvas.style.transform = `translate3d(${dashboardCamera.x}px,${dashboardCamera.y}px,0) scale(${dashboardCamera.zoom})`
  document.getElementById('zoomValue').textContent = `${Math.round(dashboardCamera.zoom * 100)}%`
  document.querySelectorAll('[data-zoom-preset]').forEach(button => button.classList.toggle('is-selected', Math.abs(Number(button.dataset.zoomPreset) - dashboardCamera.zoom * 100) < 1))
  renderDashboardMinimap()
}

// Кандидаты на копирование — как в оригинале: любой лист кроме текущего, у которого есть виджеты.
function copySourceSheets() {
  return dashboardSheets.filter(sheet => sheet.id !== activeDashboardSheet && sheet.model.widgets.length)
}

const COPY_MENU_ROWS = 6

// Потолок считаем по фактической высоте строки, а не по 30 px из CSS: на реальном Chrome при
// масштабе Windows строка дробная, и «ровно 6 листов» превращались в 6 + полоска седьмого.
// Берём getComputedStyle, а не getBoundingClientRect: меню открывается с scale(.985), и до конца
// перехода линейка даёт заниженную высоту — потолок выходил коротче на полстроки.
// Прокручивает внутренний слой, а не само меню: у скролл-контейнера нижний padding уходит
// вместе с контентом, поэтому при обрезке одиннадцатая строка влезала в эту полоску.
function copySourceMenuHeight(row) {
  return Math.round(COPY_MENU_ROWS * parseFloat(getComputedStyle(row).height))
}

function closeCopySourceMenu() {
  const menu = document.getElementById('copySourceMenu')
  if (!menu) return
  menu.classList.remove('is-open')
  menu.setAttribute('aria-hidden', 'true')
}

function openCopySourceMenu(anchor) {
  const menu = document.getElementById('copySourceMenu')
  const sources = copySourceSheets()
  if (!menu || !anchor || !sources.length) return
  menu.innerHTML = `<div class="copy-source-scroll">${sources.map(sheet => `<button type="button" role="menuitem" data-copy-source="${sheet.id}">${dashboardIcon(sheetIcon(sheet))}<span>${escapeDashboardText(sheet.name)}</span><em>${sheet.model.widgets.length}</em></button>`).join('')}</div>`
  const scroll = menu.firstElementChild
  menu.classList.add('is-open')
  menu.setAttribute('aria-hidden', 'false')
  // Прокрутка переживает закрытие: без сброса повторное открытие стартует с середины списка.
  scroll.scrollTop = 0
  scroll.style.maxHeight = `${copySourceMenuHeight(scroll.firstElementChild)}px`
  // Размеры снимаем только после is-open: до этого меню visibility:hidden и нулевой высоты.
  const bounds = anchor.getBoundingClientRect()
  menu.style.left = `${Math.max(8, Math.min(window.innerWidth - menu.offsetWidth - 8, bounds.left))}px`
  menu.style.top = `${Math.max(8, Math.min(window.innerHeight - menu.offsetHeight - 8, bounds.bottom + 4))}px`
}

// ── Меню «Добавить» ───────────────────────────────────────────────────────────────────
// Кнопка лежит на правом краю тулбара, поэтому меню выравнивается по её правому краю, как
// контекстное меню листа, а не по левому, как полоса копирования в центре экрана.
function closeDashboardAddMenu() {
  const menu = document.getElementById('dashboardAddMenu')
  if (!menu || !menu.classList.contains('is-open')) return
  menu.classList.remove('is-open')
  menu.setAttribute('aria-hidden', 'true')
  document.getElementById('dashboardAddWidget')?.setAttribute('aria-expanded', 'false')
}

function openDashboardAddMenu() {
  const menu = document.getElementById('dashboardAddMenu')
  const trigger = document.getElementById('dashboardAddWidget')
  if (!menu || !trigger) return
  menu.classList.add('is-open')
  menu.setAttribute('aria-hidden', 'false')
  trigger.setAttribute('aria-expanded', 'true')
  const bounds = trigger.getBoundingClientRect()
  menu.style.left = `${Math.max(8, Math.min(window.innerWidth - menu.offsetWidth - 8, bounds.right - menu.offsetWidth))}px`
  menu.style.top = `${Math.max(8, Math.min(window.innerHeight - menu.offsetHeight - 8, bounds.bottom + 4))}px`
}

function renderDashboardEmptyState() {
  const empty = document.getElementById('dashboardEmptyState')
  if (!empty) return
  const sheet = dashboardSheets.find(item => item.id === activeDashboardSheet)
  const open = activeDashboardLayout().length === 0
  empty.classList.toggle('is-open', open)
  empty.setAttribute('aria-hidden', String(!open))
  if (!open) return
  const sources = copySourceSheets()
  // Как в оригинале: карточку подписывает лист с максимумом виджетов, а не первый попавшийся.
  const copySource = sources.reduce((max, item) => (!max || item.model.widgets.length > max.model.widgets.length ? item : max), null)
  const canCopy = Boolean(copySource)
  const widgetWord = n => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'виджет' : n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14) ? 'виджета' : 'виджетов'}`
  empty.innerHTML = `<h2>С чего начать «${escapeDashboardText(sheet?.name || 'Лист')}»?</h2><p>Выберите быстрый старт или создайте виджет с нуля</p><div class="empty-start-grid"><button class="empty-start-card" data-empty-action="kpi"><span class="empty-start-icon">${dashboardIcon('i-target')}</span><strong>Виджет KPI</strong><small>Карточка с одной метрикой</small><span class="empty-start-cta">↗ Создать</span></button><button class="empty-start-card" data-empty-action="chart"><span class="empty-start-icon">${dashboardIcon('i-chart')}</span><strong>График</strong><small>Линия, столбцы, площадь, стопка</small><span class="empty-start-cta">↗ Создать</span></button><button class="empty-start-card" data-empty-action="copy" ${canCopy ? '' : 'disabled'}><span class="empty-start-icon">${dashboardIcon('i-copy')}</span><strong>Скопировать с листа</strong><small>Полная копия виджетов</small><span class="empty-start-cta">${canCopy ? widgetWord(copySource.model.widgets.length) : 'Нет листа-источника'}</span></button></div><span class="empty-start-footer">Или начните без виджетов — canvas готов к работе</span>`
}

// ── Значок листа ─────────────────────────────────────────────────────────────────────
// Поле модели наравне с name. В оригинале своего поля нет: квадрат 12×12 вшит SVG-разметкой
// в SheetPill.tsx:122-139 и продублирован в AllSheetsPopover.tsx:265-282, поэтому дефолт
// совпадает с оригинальным значком и листы без icon мигрируют сами.
const DEFAULT_SHEET_ICON = 'i-layout'
// Отбор по читаемости в 12 px; служебные стрелки, крестики и «ещё» в набор не входят.
const SHEET_ICONS = [
  ['i-layout', 'Макет'], ['i-doc', 'Отчёт'], ['i-chart', 'Динамика'], ['i-target', 'План'],
  ['i-banknote', 'Выручка'], ['i-receipt', 'Чеки'], ['i-boxes', 'Товары'], ['i-calendar', 'Неделя'],
  ['i-star', 'Важное'], ['i-shield', 'Проверка'], ['i-map', 'География'], ['i-grid', 'Сетка'],
  ['i-panel', 'Панель'], ['i-package-check', 'Приёмка'], ['i-rotate-ccw', 'Возвраты'], ['i-building', 'Склады'],
  ['i-landmark', 'Финансы'], ['i-clock', 'Хронология'], ['i-bell', 'Сигналы'], ['i-alert', 'Проблемы'],
  ['i-search', 'Поиск'], ['i-compare', 'Сравнение'], ['i-sticky', 'Заметка'], ['i-sparkles', 'Новинки'],
]
// Страница по 12: ровно закрывает и 4-колонную сетку drill-меню (три ряда), и 6-колонную
// сетку поповера/полосы (два ряда) — высота слоя от листания не меняется.
const SHEET_ICON_PAGE_SIZE = 12
const SHEET_ICON_PAGES = Math.ceil(SHEET_ICONS.length / SHEET_ICON_PAGE_SIZE)
const sheetIconLabel = icon => (SHEET_ICONS.find(item => item[0] === icon) || ['', ''])[1]
const sheetIcon = sheet => (sheet && sheet.icon) || DEFAULT_SHEET_ICON
const sheetIconPageIndex = icon => Math.floor(Math.max(0, SHEET_ICONS.findIndex(item => item[0] === icon)) / SHEET_ICON_PAGE_SIZE)
// Слой открывает либо меню ⋯ (свой drill-in), либо вкладка (поповер), либо строка «Все листы»
// (полоса под строкой). Все три показывают одну и ту же сетку и живут в одном состоянии,
// но одновременно работать может только один: слои крепятся к разным узлам и иначе
// ложатся друг на друга.
let sheetIconMenuDrill = false
let sheetIconPickerId = null
let sheetIconFoldId = null
let sheetMenuAnchor = null
let sheetMenuScope = '#sheetTabs'
let sheetIconPage = 0
// Слой значка и холст — соседи, и у тачпада из-за этого конфликт: Chrome ещё полсекунды выдаёт
// затухающие wheel-события после того, как пальцы убрались, и стоит курсору за это время уехать
// на холст — хвост того же взмаха начинает катать канвас.
let wheelBurstAt = 0
let wheelBurstOverSheetIcon = false
// Лечим тем, что жест принадлежит узлу, НАД КОТОРЫМ ОН НАЧАЛСЯ, а не тому, под чем курсор в
// момент каждого события: метка держится, пока события идут чаще чем раз в 250 мс, а пауза
// длиннее — это уже новый жест. Считаем по всем wheel страницы, потому что курсор едет со слоя
// на холст не мгновенно и по дороге цепляет события на рельсе вкладок и панели.
const WHEEL_BURST_TAIL = 250
document.addEventListener('wheel', event => {
  const now = performance.now()
  // Событие после паузы — это начало нового жеста: помечаем, над чем оно случилось.
  if (now - wheelBurstAt > WHEEL_BURST_TAIL) {
    wheelBurstOverSheetIcon = !!event.target.closest?.('#sheetIconBand,#sheetIconPopover,#sheetMenuIcons')
  }
  wheelBurstAt = now
}, { capture: true, passive: true })

// Событие долетело до канваса, а жест начат над слоем значка → это его инерция, не прокрутка.
function isSheetIconWheelTail() {
  return wheelBurstOverSheetIcon
}

function sheetIconCapMarkup(id) {
  const sheet = dashboardSheets.find(item => item.id === id)
  return `<div class="sheet-icon-cap">ЗНАЧОК ЛИСТА<b>${escapeDashboardText(sheet ? sheet.name : '')}</b></div>`
}

// Подсказки сервиса на тайлах нет: имя значка пишет сама шапка слоя (см. paintSheetIconLayerName).
function sheetIconGridMarkup(id) {
  const current = sheetIcon(dashboardSheets.find(sheet => sheet.id === id))
  const from = sheetIconPage * SHEET_ICON_PAGE_SIZE
  // data-icon-sheet дублирует id в каждом тайле: полоса «Все листы» лежит вне строки,
  // поэтому обработчик не может достать лист восходящим поиском. aria-label обязателен:
  // без data-tooltip доступного имени тайлу даёт только оно.
  return `<div class="sheet-icon-grid">${SHEET_ICONS.slice(from, from + SHEET_ICON_PAGE_SIZE).map(([icon, label]) => `<button type="button" role="menuitemradio" class="sheet-icon-tile ${icon === current ? 'is-current' : ''}" data-icon-sheet="${id}" data-icon-choice="${icon}" aria-label="${escapeDashboardText(label)}" aria-checked="${icon === current}">${dashboardIcon(icon)}</button>`).join('')}</div>`
}

/* Точки-пагинация как в iOS: активная плотная и светлая, остальные приглушены. */
function sheetIconDotsMarkup() {
  if (SHEET_ICON_PAGES < 2) return ''
  return `<div class="sheet-icon-dots">${Array.from({ length: SHEET_ICON_PAGES }, (_, index) => `<button type="button" class="sheet-icon-dot ${index === sheetIconPage ? 'is-current' : ''}" data-icon-page="${index}" aria-label="Страница ${index + 1} из ${SHEET_ICON_PAGES}" aria-current="${index === sheetIconPage}"></button>`).join('')}</div>`
}

const sheetIconBlockMarkup = id => `${sheetIconGridMarkup(id)}${sheetIconDotsMarkup()}`

function setDashboardSheetIcon(id, icon) {
  const sheet = dashboardSheets.find(item => item.id === id)
  if (!sheet || sheet.icon === icon) return
  sheet.icon = icon
  // Пересобираются оба списка: значок обязан синхронно меняться и во вкладке, и в «Все листы».
  renderDashboardSheets()
  updateSheetIconPreview()
  if (sheetIconMenuDrill) { renderSheetMenuIcons(); positionSheetContextMenu() }
  // Слой не закрываем: подсветка выбранного тайла и есть отклик. Страницу не трогаем —
  // выбранный значок всегда на текущей, а узел вкладки пересобран и крепить надо заново.
  if (sheetIconPickerId === id) { renderSheetIconPopover(); positionSheetIconPopover() }
  if (sheetIconFoldId === id) renderSheetIconFold()
}

// Живой слой значка ровно один (см. exclusive-вызовы в openSheet*/toggleSheetIconFold),
// поэтому пересборка после листания страницы идёт по первому совпадению.
function renderSheetIconLayer(shift) {
  if (sheetIconMenuDrill) { renderSheetMenuIcons(); positionSheetContextMenu() }
  else if (sheetIconPickerId) { renderSheetIconPopover(); positionSheetIconPopover() }
  else if (sheetIconFoldId) renderSheetIconFold()
  if (!shift) return
  // Новая сетка въезжает со стороны, куда тянули свайп, — иначе листание выглядит склейкой.
  const host = sheetIconMenuDrill ? document.getElementById('sheetMenuIcons') : sheetIconPickerId ? document.getElementById('sheetIconPopover') : document.getElementById('sheetIconBand')
  const grid = host?.querySelector('.sheet-icon-grid')
  if (!grid) return
  grid.style.setProperty('--sheet-page-shift', `${shift * 26}px`)
  grid.classList.add('is-turning')
}
// Возвращает false, если страница не изменилась: свайп по краям клампеся, и сетку всё равно
// надо пересобрать, чтобы клик по оторванному жесту не выбрал значок.
function setSheetIconPage(page, shift = 0) {
  const next = Math.max(0, Math.min(page, SHEET_ICON_PAGES - 1))
  if (next === sheetIconPage) return false
  sheetIconPage = next
  renderSheetIconLayer(shift)
  return true
}

function updateSheetIconPreview() {
  const host = document.getElementById('sheetIconPreview')
  if (!host) return
  const icon = sheetIcon(dashboardSheets.find(sheet => sheet.id === sheetMenuTargetId))
  host.innerHTML = `${dashboardIcon(icon)}${escapeDashboardText(sheetIconLabel(icon))}`
}

/* A — сетка разворачивается внутри тех же 178 px вместо списка действий. */
function renderSheetMenuIcons() {
  const host = document.getElementById('sheetMenuIcons')
  if (!host) return
  const focus = sheetIconLayerFocus(host)
  // В футере остаётся только возврат к списку: имя значка с #26 показывает шапка, и второй
  // экземпляр имени («текущий» значок) читался как противоречие наведению.
  host.innerHTML = `${sheetIconCapMarkup(sheetMenuTargetId)}${sheetIconBlockMarkup(sheetMenuTargetId)}<div class="sheet-icon-foot"><button type="button" data-sheet-action="icon-back"><span aria-hidden="true">←</span>К списку</button></div>`
  restoreSheetIconLayerFocus(host, focus)
  repaintAfterSheetIconRender(host)
}

function showSheetMenuDrill(drill) {
  sheetIconMenuDrill = drill
  document.getElementById('sheetMenuActions').hidden = drill
  document.getElementById('sheetMenuIcons').hidden = !drill
  if (drill) {
    const sheet = dashboardSheets.find(item => item.id === sheetMenuTargetId)
    sheetIconPage = sheetIconPageIndex(sheetIcon(sheet))
    renderSheetMenuIcons()
  }
  // Высота слоя меняется вместе с видом, а низ меню прижат к вкладке: координату пересчитываем
  // каждый раз, иначе drill-сетка встала бы там, где у списка действий был низ.
  positionSheetContextMenu()
}

/* B — поповер над кнопкой-иконкой вкладки. */
function renderSheetIconPopover() {
  const popover = document.getElementById('sheetIconPopover')
  if (!popover || !sheetIconPickerId) return
  const focus = sheetIconLayerFocus(popover)
  popover.innerHTML = `${sheetIconCapMarkup(sheetIconPickerId)}${sheetIconBlockMarkup(sheetIconPickerId)}`
  restoreSheetIconLayerFocus(popover, focus)
  repaintAfterSheetIconRender(popover)
}

function positionSheetIconPopover() {
  const popover = document.getElementById('sheetIconPopover')
  const trigger = document.querySelector(`#sheetTabs [data-sheet-icon="${sheetIconPickerId}"]`)
  if (!popover || !trigger) return
  const bounds = trigger.getBoundingClientRect()
  popover.style.left = `${Math.max(8, Math.min(bounds.left + bounds.width / 2 - popover.offsetWidth / 2, window.innerWidth - popover.offsetWidth - 8))}px`
  // Панель листов прижата к низу окна, поэтому слой всегда над вкладкой — вниз ему негде расти.
  popover.style.top = `${Math.max(8, bounds.top - popover.offsetHeight - 8)}px`
}

function openSheetIconPopover(id) {
  const sheet = dashboardSheets.find(item => item.id === id)
  if (!sheet) { closeSheetIconPopover(); return }
  // Соседние слои закрываем до своего: drill-меню и полоса «Все листы» стоят в той же зоне
  // и при двух открытых слоях ложились бы один на другой.
  closeSheetContextMenu()
  closeSheetIconFold()
  sheetIconPickerId = id
  sheetIconPage = sheetIconPageIndex(sheetIcon(sheet))
  renderDashboardSheets()
  renderSheetIconPopover()
  const popover = document.getElementById('sheetIconPopover')
  popover.classList.add('is-open')
  popover.setAttribute('aria-hidden', 'false')
  // Слой открыт — подсказка самого триггера уже мешает: снимаем её вручную, курсор может не сдвинуться.
  if (typeof hideTooltip === 'function') hideTooltip()
  positionSheetIconPopover()
}

function closeSheetIconPopover() {
  const popover = document.getElementById('sheetIconPopover')
  if (!sheetIconPickerId && (!popover || !popover.classList.contains('is-open'))) return
  sheetIconPickerId = null
  if (popover) {
    popover.classList.remove('is-open')
    popover.setAttribute('aria-hidden', 'true')
    popover.innerHTML = ''
  }
  renderDashboardSheets()
}

function closeSheetIconFold() {
  const band = document.getElementById('sheetIconBand')
  // Гасим по факту раскрытого слоя, а не по id: сворачивание от повторного клика по
  // триггеру оставляет id пустым, и guard по одному только id оставил бы полосу висеть
  // над закрытой панелью — её больше нечем было бы закрыть.
  if (!sheetIconFoldId && (!band || !band.classList.contains('is-open'))) return
  sheetIconFoldId = null
  if (band) {
    band.classList.remove('is-open')
    band.setAttribute('aria-hidden', 'true')
  }
  // Отступ, которым полоса растянула список под себя, больше не нужен.
  const list = document.getElementById('allSheetsList')
  if (list) list.style.paddingBottom = ''
  renderDashboardSheets()
}

/* Имя значка показывает шапка слоя — в A, B и C одинаково. Подсказка сервиса на тайлах
   не работала ни в одном из них: в узких сетках она ложилась ровно на соседние тайлы,
   а в drill устаревала за пересборкой сетки и показывала имя прежнего значка. */
function sheetIconLayerName(host) {
  const id = host.id === 'sheetMenuIcons' ? sheetMenuTargetId : host.id === 'sheetIconPopover' ? sheetIconPickerId : sheetIconFoldId
  const sheet = dashboardSheets.find(item => item.id === id)
  return sheet ? sheet.name : ''
}

// Кому принадлежит имя после пересборки сетки: курсор и фокус никуда не уходили, а узел
// тайла уже другой, поэтому события наведения не будет — состояние :hover/:focus-visible
// Chrome проставляет по новому узлу, и этого достаточно.
function sheetIconLayerTile(host) {
  return host.querySelector('.sheet-icon-tile:hover') || host.querySelector('.sheet-icon-tile:focus-visible')
}

function paintSheetIconLayerName(host, tile) {
  const cap = host.querySelector('.sheet-icon-cap b')
  if (!cap) return
  const choice = tile && tile.dataset.iconChoice
  cap.textContent = (choice && sheetIconLabel(choice)) || sheetIconLayerName(host)
}

// Выбор значка и листание страницы пересобирают слой целиком: без этого шага подпись
// вернулась бы к имени листа, хотя курсор стоит на тайле и не двигался.
function repaintAfterSheetIconRender(host) {
  requestAnimationFrame(() => paintSheetIconLayerName(host, sheetIconLayerTile(host)))
}

/* Пересборка слоя убивает и узел с фокусом, поэтому клавиатурный выбор сбрасывал фокус на
   <body>: следующий Tab поехал бы по всему документу, а имя в шапке — к имени листа.
   Запоминаем значок (или точку пагинации) по его data-атрибуту, чтобы вернуть фокус туда же. */
function sheetIconLayerFocus(host) {
  if (!host.contains(document.activeElement)) return null
  const el = document.activeElement
  const key = el.dataset.iconChoice ? 'iconChoice' : el.dataset.iconPage ? 'iconPage' : null
  return key && { key, value: el.dataset[key] }
}

function restoreSheetIconLayerFocus(host, focus) {
  if (!focus) return
  const tile = [...host.querySelectorAll('button')].find(item => item.dataset[focus.key] === focus.value)
  // preventScroll: у списка «Все листы» overflow-y:auto, и фокус по умолчанию докрутил бы
  // список так, что строка с полосой встала бы ровно по край бокса.
  tile?.focus({ preventScroll: true })
}

/* C — полоса «Все листы». Слой вынесен из строки и из #allSheetsList только по одной
   причине: у списка overflow-y:auto, и внутри него полоса обрезалась бы по границе
   прокрутки. Координаты при этом совпадают с силуэтом панели — слой не должен торчать
   ни за левый край «ВСЕ ЛИСТЫ», ни за её низ. */
function renderSheetIconFold() {
  const band = document.getElementById('sheetIconBand')
  if (!band || !sheetIconFoldId) return
  const focus = sheetIconLayerFocus(band)
  band.innerHTML = `${sheetIconCapMarkup(sheetIconFoldId)}${sheetIconBlockMarkup(sheetIconFoldId)}`
  positionSheetIconBand()
  restoreSheetIconLayerFocus(band, focus)
  repaintAfterSheetIconRender(band)
}

// Край в край со строкой-триггером: ширина и левый край берутся у неё, поэтому полоса
// стоит ровно под списком листов и повторяет его форму — ни за левый край «ВСЕ ЛИСТЫ»,
// ни за её низ слой не выходит. Разворота вверх больше нет: над списком полоса читалась
// как отдельный поповер вне панели.
// makeRoom=true (открытие и пересборка) — добиваемся места под строкой: сначала прокручиваем
// список, а если крутить нечего, растягиваем его отступом снизу. Панель прижата к низу окна,
// поэтому растёт её верх, низ списка остаётся на месте и полоса встаёт внутрь бокса.
// makeRoom=false (прокрутка) — только следуем за строкой и прижимаем полосу к низу бокса.
function positionSheetIconBand(makeRoom = true) {
  const band = document.getElementById('sheetIconBand')
  if (!band || !sheetIconFoldId) return
  const row = document.querySelector(`#allSheetsList [data-sheet="${sheetIconFoldId}"]`)
  const list = document.getElementById('allSheetsList')
  if (!row || !list) return
  const placed = () => row.getBoundingClientRect()
  const box = () => list.getBoundingClientRect()
  // Размер берём до показа слоя: offsetHeight не зависит от transform, а rect в момент
  // scale(.985) был бы занижен.
  const height = band.offsetHeight
  const gap = 4
  if (makeRoom) {
    band.style.width = `${Math.round(placed().width)}px`
    band.style.left = `${Math.round(placed().left)}px`
    const lack = () => placed().bottom + gap + height + gap - box().bottom
    const room = () => Math.max(0, list.scrollHeight - list.clientHeight - list.scrollTop)
    if (lack() > 0 && room() > 0) list.scrollTop += Math.min(lack(), room())
    if (lack() > 0) {
      const pad = parseFloat(getComputedStyle(list).paddingBottom) || 0
      list.style.paddingBottom = `${Math.round(pad + lack())}px`
    }
    // Отступ растянул только прокрутку (список упёрся в max-height) — доматываем её.
    if (lack() > 0) list.scrollTop += lack()
  }
  const bounds = placed()
  const listBox = box()
  // Строка ушла за границу прокрутки — висящий в пустоте слой не нужен.
  if (bounds.bottom <= listBox.top || bounds.top >= listBox.bottom) { closeSheetIconFold(); return }
  let top = bounds.bottom + gap
  if (top + height > listBox.bottom - gap) top = listBox.bottom - gap - height
  // Даже с прижимом ниже строки не влезает — сворачиваем, а не ложимся на самого листа.
  if (top < bounds.top) { closeSheetIconFold(); return }
  band.style.top = `${Math.round(top)}px`
}

function toggleSheetIconFold(id) {
  closeSheetIconPopover()
  closeSheetContextMenu()
  // Повторный клик по тому же триггеру — то же сворачивание, что и у всех closers:
  // иначе полоса теряет id, но сохраняет is-open и остаётся висеть навсегда.
  if (sheetIconFoldId === id) { closeSheetIconFold(); return }
  sheetIconFoldId = id
  sheetIconPage = sheetIconPageIndex(sheetIcon(dashboardSheets.find(sheet => sheet.id === id)))
  renderDashboardSheets()
  const band = document.getElementById('sheetIconBand')
  if (!band) return
  renderSheetIconFold()
  band.classList.add('is-open')
  band.setAttribute('aria-hidden', 'false')
  // Слой открыт — подсказка триггера под курсором больше не нужна.
  if (typeof hideTooltip === 'function') hideTooltip()
}

function toggleSheetIconPopover(id) {
  if (sheetIconPickerId === id) closeSheetIconPopover()
  else openSheetIconPopover(id)
}

function sheetTabMarkup(sheet) {
  const active = sheet.id === activeDashboardSheet
  const count = sheet.model.widgets.length
  const icon = sheetIcon(sheet)
  if (renamingDashboardSheet === sheet.id) {
    return `<div class="sheet-tab is-renaming" data-sheet="${sheet.id}">${dashboardIcon(icon)}<input class="sheet-rename-input" data-sheet-rename="${sheet.id}" value="${escapeDashboardText(sheet.name)}" maxlength="32" aria-label="Название листа"></div>`
  }
  // Значок — сосед кнопки выбора, а не её потомок: вложенных <button> HTML не допускает,
  // и клик по иконке не должен попадать в «выбрать лист / двойной клик = переименовать».
  return `<div class="sheet-tab ${active ? 'is-active' : ''}" data-sheet="${sheet.id}"><button type="button" class="sheet-tab-icon" data-sheet-icon="${sheet.id}" aria-haspopup="menu" aria-expanded="${sheetIconPickerId === sheet.id}" aria-label="Значок листа: ${escapeDashboardText(sheetIconLabel(icon))}" data-tooltip="Сменить значок">${dashboardIcon(icon)}</button><button class="sheet-tab-main" data-sheet-select="${sheet.id}" data-tooltip="Дважды нажмите, чтобы переименовать"><span class="sheet-tab-name">${escapeDashboardText(sheet.name)}</span><span class="sheet-tab-count">${count}</span></button><button class="sheet-menu-button" data-sheet-menu="${sheet.id}" aria-label="Действия с листом">${dashboardIcon('i-more')}</button></div>`
}

/* C — строка «Все листы»: её значок открывает вынесенный слой сетки. */
function allSheetMarkup(sheet) {
  const active = sheet.id === activeDashboardSheet
  const icon = sheetIcon(sheet)
  return `<div class="all-sheet-row ${active ? 'is-active' : ''}${sheetIconFoldId === sheet.id ? ' is-folded' : ''}" data-sheet="${sheet.id}"><button type="button" class="sheet-tab-icon" data-sheet-icon="${sheet.id}" aria-haspopup="menu" aria-expanded="${sheetIconFoldId === sheet.id}" aria-label="Значок листа: ${escapeDashboardText(sheetIconLabel(icon))}" data-tooltip="Сменить значок">${dashboardIcon(icon)}</button><button class="all-sheet-main" data-sheet-select="${sheet.id}"><span class="sheet-tab-name">${escapeDashboardText(sheet.name)}</span><span class="all-sheet-count">${sheet.model.widgets.length}</span>${sheet.isDefault ? '<i class="sheet-current" data-tooltip="Основной лист"></i>' : ''}</button><button class="sheet-menu-button" data-sheet-menu="${sheet.id}" aria-label="Действия с листом">${dashboardIcon('i-more')}</button></div>`
}

function renderDashboardSheets() {
  const tabs = document.getElementById('sheetTabs')
  const list = document.getElementById('allSheetsList')
  if (!tabs || !list) return
  tabs.innerHTML = dashboardSheets.map(sheetTabMarkup).join('')
  list.innerHTML = dashboardSheets.map(allSheetMarkup).join('')
  if (typeof updateSheetScrollButtons === 'function') updateSheetScrollButtons()
  if (typeof scrollActiveSheetIntoView === 'function') scrollActiveSheetIntoView()
  if (renamingDashboardSheet) {
    requestAnimationFrame(() => {
      const input = document.querySelector(`[data-sheet-rename="${renamingDashboardSheet}"]`)
      input?.focus()
      input?.select()
    })
  }
}

function startDashboardSheetRename(id) {
  if (!dashboardSheets.some(sheet => sheet.id === id)) return
  renamingDashboardSheet = id
  closeSheetContextMenu()
  renderDashboardSheets()
}

function commitDashboardSheetRename(id, value) {
  const sheet = dashboardSheets.find(item => item.id === id)
  const nextName = String(value || '').trim()
  if (sheet && nextName) sheet.name = nextName
  renamingDashboardSheet = null
  renderDashboardSheets()
  renderDashboardEmptyState()
  // Подпись слоя зеркалит имя строки: без пересборки слой висел бы с прежним именем,
  // пока его не свернёшь — тот же класс рассогласования, что и зависшая полоса.
  if (sheetIconFoldId === id) renderSheetIconFold()
  if (sheetIconPickerId === id) renderSheetIconPopover()
}

function cancelDashboardSheetRename() {
  renamingDashboardSheet = null
  renderDashboardSheets()
}

function closeSheetContextMenu() {
  const menu = document.getElementById('sheetContextMenu')
  if (!menu) return
  menu.classList.remove('is-open')
  menu.setAttribute('aria-hidden', 'true')
  if (sheetIconMenuDrill) showSheetMenuDrill(false)
  sheetMenuTargetId = null
  sheetMenuAnchor = null
}

// Кнопка ⋯ живёт в пересобираемом списке: выбор значка заменяет её новым узлом, а отключённый
// элемент даёт нулевой rect, и меню уезжало бы в левый верхний угол вьюпорта. Ищем живой
// триггер в том же списке, где был клик, — у вкладок и у «Все листы» свои координаты.
function sheetMenuTrigger() {
  if (sheetMenuAnchor?.getClientRects().length) return sheetMenuAnchor
  const live = document.querySelector(`${sheetMenuScope} [data-sheet-menu="${sheetMenuTargetId}"]`)
  if (live?.getClientRects().length) sheetMenuAnchor = live
  return sheetMenuAnchor
}

// Верх меню поднят на 8 px от верхнего края кнопки: слой растёт вверх, а его нижний край
// остаётся там, где был до появления drill-сетки, иначе меню тонуло бы в панели листов.
// Размер берём по offsetWidth/offsetHeight: rect слоя в момент открытия уменьшен scale-анимацией.
function positionSheetContextMenu() {
  const menu = document.getElementById('sheetContextMenu')
  const trigger = sheetMenuTrigger()
  if (!menu || !trigger) return
  const bounds = trigger.getBoundingClientRect()
  menu.style.left = `${Math.min(window.innerWidth - menu.offsetWidth - 10, Math.max(8, bounds.right - menu.offsetWidth))}px`
  menu.style.top = `${Math.max(8, bounds.top + 8 - menu.offsetHeight)}px`
}

function openSheetContextMenu(id, anchor) {
  const menu = document.getElementById('sheetContextMenu')
  const sheet = dashboardSheets.find(item => item.id === id)
  if (!menu || !sheet || !anchor) return
  // Тот же контракт взаимоисключения: поповер вкладки и полоса «Все листы» перекрывали бы
  // drill-сетку, а их триггеры при этом оставались бы раскрытыми.
  const scope = anchor.closest('#allSheetsList') ? '#allSheetsList' : '#sheetTabs'
  closeSheetIconPopover()
  closeSheetIconFold()
  sheetMenuTargetId = id
  // Скоуп объявляем до закрытия панели: его же читает guard в closeAllSheetsPanel(), чтобы
  // не загасить этим же кликом меню, которое только что открыли.
  sheetMenuScope = scope
  // Меню из рельса вкладок обязано убрать панель: обработчик вкладки делает stopPropagation
  // (иначе «клик вне меню» закрыл бы меню в тот же момент), и из-за этого до наружного
  // «клика вне панели» событие не доходит — меню ложилось поверх «Все листы», 27 056 px²
  // при двух листах, а следом и drill. Своему скоупу (строка панели) панель не трогаем.
  if (scope === '#sheetTabs') closeAllSheetsPanel()
  // Закрытия пересобирают списки листов: триггер берём уже живой, иначе нулевой rect
  // уводил бы меню в левый верхний угол вьюпорта.
  sheetMenuAnchor = document.querySelector(`${scope} [data-sheet-menu="${id}"]`) || anchor
  showSheetMenuDrill(false)
  updateSheetIconPreview()
  menu.querySelector('[data-sheet-action="default"]').hidden = sheet.isDefault
  menu.querySelector('[data-sheet-action="delete"]').disabled = dashboardSheets.length === 1
  // В панели «Все листы» пункта «Значок» нет: у строки уже есть своя кнопка значка, и она
  // открывает полосу под этой же строкой. Второй вход в панели только закрывал бы саму панель
  // (клик по пункту — вне панели), и drill повисал бы сиротой над закрытым списком.
  const iconItem = menu.querySelector('[data-sheet-action="icon"]')
  iconItem.hidden = scope === '#allSheetsList'
  iconItem.previousElementSibling.hidden = iconItem.hidden
  menu.classList.add('is-open')
  menu.setAttribute('aria-hidden', 'false')
}

function duplicateDashboardSheet(id) {
  const source = dashboardSheets.find(sheet => sheet.id === id)
  if (!source) return
  dashboardSheetIndex += 1
  const stamp = Date.now()
  // Копия получает собственные id виджетов — тем же способом, что и «скопировать с листа»:
  // с общими id выделение, заметки и Undo на одном листе указывали бы на карточку другого.
  const widgets = source.model.widgets.map((widget, index) => ({ ...widget, id: `dash-copy-${stamp}-${index}` }))
  const duplicate = { id: `sheet-${dashboardSheetIndex}`, name: `${source.name} копия`, isDefault: false, icon: source.icon, model: new DashboardLayoutModel(widgets) }
  dashboardSheets.push(duplicate)
  selectDashboardSheet(duplicate.id)
}

function deleteDashboardSheet(id) {
  if (dashboardSheets.length === 1) return
  const index = dashboardSheets.findIndex(sheet => sheet.id === id)
  if (index < 0) return
  const [removed] = dashboardSheets.splice(index, 1)
  if (removed.isDefault) dashboardSheets[0].isDefault = true
  if (activeDashboardSheet === id) activeDashboardSheet = dashboardSheets[Math.max(0, index - 1)].id
  clearDashboardSelection()
  closeSheetContextMenu()
  renderDashboard()
}

function makeDashboardSheetDefault(id) {
  dashboardSheets.forEach(sheet => { sheet.isDefault = sheet.id === id })
  closeSheetContextMenu()
  renderDashboardSheets()
}

function updateDashboardToolbar() {
  const model = activeDashboardModel()
  document.getElementById('appShell').classList.toggle('dashboard-editing', dashboardEditing)
  document.querySelector('.dashboard-view-tools').setAttribute('aria-hidden', String(dashboardEditing))
  document.querySelector('.dashboard-edit-tools').setAttribute('aria-hidden', String(!dashboardEditing))
  document.getElementById('dashboardCanvas').dataset.editing = String(dashboardEditing)
  document.getElementById('dashboardUndo').disabled = !model.canUndo
  document.getElementById('dashboardRedo').disabled = !model.canRedo
  document.getElementById('dashboardDeleteAll').disabled = model.widgets.length === 0
  document.querySelectorAll('.dashboard-grid-toggle').forEach(button => {
    button.classList.toggle('is-active', !dashboardGridVisible)
    button.dataset.tooltip = dashboardGridVisible ? 'Скрыть сетку' : 'Показать сетку'
    button.setAttribute('aria-label', button.dataset.tooltip)
  })
  document.getElementById('dashboardRuler').classList.toggle('is-active', dashboardRulerEnabled)
  document.getElementById('dashboardRulerReadout').classList.toggle('is-open', dashboardRulerEnabled)
  document.getElementById('dashboardRulerReadout').setAttribute('aria-hidden', String(!dashboardRulerEnabled))
}

function renderDashboard() {
  const canvas = document.getElementById('dashboardCanvas')
  if (!canvas) return
  // preventDefault на pointerdown держит каретку в поле заметки, и blur догоняет её только
  // внутри присваивания innerHTML — синхронно, когда разметка уже собрана из старой модели:
  // вложенный рендер из blur рисовал новое, а внешний дописывал поверх него старое. Отпускаем
  // поле до снимка модели, чтобы коммит попал в разметку этого же рендера.
  const editor = document.activeElement
  if (editor?.isContentEditable && canvas.contains(editor)) editor.blur()
  canvas.dataset.editing = String(dashboardEditing)
  canvas.dataset.measuring = String(dashboardRulerEnabled)
  canvas.innerHTML = activeDashboardLayout().map(widget => `
    <article class="dashboard-widget dashboard-widget-${widget.kind} ${widget.showSparkline ? 'has-sparkline' : ''} ${dashboardSelection.has(widget.id) ? 'is-selected' : ''}" data-dashboard-widget="${widget.id}" style="left:${widget.x}px;top:${widget.y}px;width:${widget.w}px;height:${widget.h}px">
      ${dashboardWidgetMarkup(widget)}
      ${dashboardWidgetActionsMarkup(widget)}
      ${resizeHandlesMarkup(widget)}
    </article>
  `).join('')
  applyDashboardCamera()
  renderDashboardGuides()
  renderDashboardSheets()
  renderDashboardEmptyState()
  updateDashboardToolbar()
  requestAnimationFrame(() => dashboardFloatingRefreshers.forEach(refresh => refresh()))
}

function resetDashboardLayout() {
  activeDashboardModel().replace([])
  clearDashboardSelection()
  renderDashboard()
  showToast('Раскладка сброшена', 'Лист очищен')
}

function addDashboardWidget(kind) {
  if (kind === 'kpi') {
    openDashboardKpiEditor()
    return
  }
  const model = activeDashboardModel()
  const sequence = model.widgets.length + 1
  const widget = { id: `dash-note-${Date.now()}`, kind: 'note', title: 'Заметка', body: 'Комментарий для созвона', icon: 'i-sticky', x: 56 + (sequence % 3) * 34, y: 248 + (sequence % 4) * 26, w: KPI_WIDTH, h: KPI_HEIGHT }
  model.addWidget(widget)
  dashboardEditing = true
  selectDashboardWidget(widget.id)
  renderDashboard()
  showToast('Заметка добавлена', 'Переместите карточку и нажмите «Готово»')
}

// Окно колонки точек — как в --kpi-dot-window в styles.css: больше восьми меток не показываем.
const KPI_PREVIEW_DOT_WINDOW = 8

function pluralizeDashboard(count, forms) {
  const n = Math.abs(count) % 100
  const tail = n % 10
  if (n > 4 && n < 21) return forms[2]
  if (tail > 1 && tail < 5) return forms[1]
  if (tail === 1) return forms[0]
  return forms[2]
}

function readKpiStore(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(raw) ? raw.filter(id => typeof id === 'string') : []
  } catch { return [] }
}

function writeKpiStore(key, ids) {
  try { localStorage.setItem(key, JSON.stringify(ids)) } catch { /* приватный режим — накопление только на эту сессию */ }
}

// Единица избранного — кластер (title + source), а не ключ единицы: «Выручка ₽» и «Выручка шт»
// в списке одна строка, иначе метрика занимала бы два места.
function kpiClusterId(metric) {
  return `${metric.title}|${metric.source}`
}

function toggleKpiFavorite(baseKey) {
  const metric = KPI_METRICS[baseKey]
  if (!metric) return
  const id = kpiClusterId(metric)
  const index = kpiFavoriteIds.indexOf(id)
  if (index >= 0) kpiFavoriteIds.splice(index, 1)
  else kpiFavoriteIds.push(id)
  writeKpiStore(KPI_FAV_STORE, kpiFavoriteIds)
  renderKpiMetricList(document.getElementById('kpiMetricSearch').value)
}

function rememberKpiRecents(metricKeys) {
  const ids = metricKeys.map(key => KPI_METRICS[key]).filter(Boolean).map(kpiClusterId)
  if (!ids.length) return
  kpiRecentIds = [...new Set([...ids, ...kpiRecentIds])].slice(0, KPI_RECENT_LIMIT)
  writeKpiStore(KPI_RECENT_STORE, kpiRecentIds)
}

function syncKpiMetricFilter(favoriteCount, recentCount) {
  const bar = document.getElementById('kpiMetricFilter')
  if (!bar) return
  const counts = { all: KPI_CLUSTER_IDS.size, fav: favoriteCount, recent: recentCount }
  bar.querySelectorAll('[data-kpi-filter]').forEach(button => {
    const active = button.dataset.kpiFilter === kpiMetricFilter
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-pressed', String(active))
    button.querySelector('span').textContent = counts[button.dataset.kpiFilter]
  })
}

function renderKpiMetricList(query = '') {
  if (kpiEditorState?.kind === 'chart') return renderChartMetricList(query)
  const list = document.getElementById('kpiMetricList')
  if (!list || !kpiEditorState) return
  hideTooltip()
  const selected = kpiEditorState.selectedKeys
  const normalized = query.trim().toLowerCase()
  const matches = Object.entries(KPI_METRICS).filter(([, metric]) => `${metric.title} ${metric.source} ${metric.unitTag}`.toLowerCase().includes(normalized))
  const favorites = new Set(kpiFavoriteIds.filter(id => KPI_CLUSTER_IDS.has(id)))
  const recents = new Set(kpiRecentIds.filter(id => KPI_CLUSTER_IDS.has(id)))
  const shown = kpiMetricFilter === 'fav' ? id => favorites.has(id) : kpiMetricFilter === 'recent' ? id => recents.has(id) : () => true
  const groups = ['Заказы', 'Выручка', 'Расходы', 'Реклама', 'Трафик', 'Расчётные']
  // Подсказка «отметьте звездой» уместна только на пустом фильтре: с запросом метрики нет
  // и в избранном, и в общем списке — тогда честнее «не найдена».
  const emptyHint = !normalized && kpiMetricFilter === 'fav' ? `${dashboardIcon('i-star')} Отметьте метрики звездой — они появятся здесь`
    : !normalized && kpiMetricFilter === 'recent' ? `${dashboardIcon('i-clock')} Добавьте карточку — последние выбранные метрики появятся здесь`
    : 'Метрика не найдена'
  syncKpiMetricFilter(favorites.size, recents.size)
  list.innerHTML = groups.map(group => {
    const clusters = new Map()
    matches.forEach(([key, metric]) => {
      const id = kpiClusterId(metric)
      if (metric.group !== group || !shown(id)) return
      if (!clusters.has(id)) clusters.set(id, [])
      clusters.get(id).push([key, metric])
    })
    if (!clusters.size) return ''
    return `<section class="kpi-metric-group"><h4>${group}</h4>${[...clusters.values()].map(cluster => {
      const [baseKey, base] = cluster[0]
      const pickedHere = cluster.filter(([key]) => selected.includes(key)).length
      const baseTip = KPI_METRIC_TIPS[baseKey] ? ` data-tooltip="${escapeDashboardText(KPI_METRIC_TIPS[baseKey])}" tabindex="0" role="note" aria-label="Как считается метрика"` : ''
      const tags = cluster.map(([key, item]) => `<button class="kpi-unit-tag ${selected.includes(key) ? 'is-active' : ''}" data-kpi-metric="${key}"${KPI_METRIC_TIPS[key] ? ` data-tooltip="${escapeDashboardText(KPI_METRIC_TIPS[key])}"` : ''} type="button">${item.unitTag}</button>`).join('')
      const isFavorite = favorites.has(kpiClusterId(base))
      const star = `<button class="kpi-metric-star ${isFavorite ? 'is-on' : ''}" type="button" data-kpi-fav="${baseKey}" aria-pressed="${isFavorite}" data-tooltip="${isFavorite ? 'В избранном · убрать' : 'В избранное'}">${dashboardIcon('i-star')}</button>`
      return `<div class="kpi-metric-option ${pickedHere ? 'is-selected' : ''}" data-kpi-base="${baseKey}" role="group" aria-label="${escapeDashboardText(base.title)}"><span class="kpi-metric-icon">${dashboardIcon(base.icon)}</span><div><strong>${escapeDashboardText(base.title)}${KPI_METRIC_TIPS[baseKey] ? `<span class="kpi-metric-info"${baseTip}>${dashboardIcon('i-info')}</span>` : ''}</strong><small>${escapeDashboardText(base.source)}</small></div><span class="kpi-unit-variants">${tags}</span>${star}</div>`
    }).join('')}</section>`
  }).join('') || `<div class="kpi-metric-empty">${emptyHint}</div>`
}

// ── Список графиков в панели «Виджет графика» ──────────────────────────────────────────
// Строка = один график: кластеров единиц у него нет, поэтому выбор ложится прямо на строку,
// а пилюля типа только поясняет формат и ничего не переключает.

function syncChartFilter(favoriteCount, recentCount) {
  const bar = document.getElementById('chartMetricFilter')
  if (!bar) return
  const counts = { all: Object.keys(DASHBOARD_CHARTS).length, fav: favoriteCount, recent: recentCount }
  bar.querySelectorAll('[data-chart-filter]').forEach(button => {
    const active = button.dataset.chartFilter === chartMetricFilter
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-pressed', String(active))
    button.querySelector('span').textContent = counts[button.dataset.chartFilter]
  })
}

function toggleChartFavorite(chartKey) {
  if (!DASHBOARD_CHARTS[chartKey]) return
  const index = chartFavoriteIds.indexOf(chartKey)
  if (index >= 0) chartFavoriteIds.splice(index, 1)
  else chartFavoriteIds.push(chartKey)
  writeKpiStore(CHART_FAV_STORE, chartFavoriteIds)
  renderChartMetricList(document.getElementById('chartMetricSearch').value)
}

function rememberChartRecents(chartKeys) {
  if (!chartKeys.length) return
  chartRecentIds = [...new Set([...chartKeys, ...chartRecentIds])].filter(key => DASHBOARD_CHARTS[key]).slice(0, CHART_RECENT_LIMIT)
  writeKpiStore(CHART_RECENT_STORE, chartRecentIds)
}

function renderChartMetricList(query = '') {
  const list = document.getElementById('chartMetricList')
  if (!list || !kpiEditorState) return
  // Пересборка списка срывает якорь тултипа звезды — прячем его, как в панели метрик.
  hideTooltip()
  const normalized = query.trim().toLowerCase()
  const selected = kpiEditorState.selectedKeys
  const favorites = new Set(chartFavoriteIds.filter(key => DASHBOARD_CHARTS[key]))
  const recents = new Set(chartRecentIds.filter(key => DASHBOARD_CHARTS[key]))
  const shown = chartMetricFilter === 'fav' ? key => favorites.has(key) : chartMetricFilter === 'recent' ? key => recents.has(key) : () => true
  const matches = Object.entries(DASHBOARD_CHARTS).filter(([key, chart]) => shown(key)
    && `${chart.title} ${chart.group} ${chart.source} ${chart.kindLabel}`.toLowerCase().includes(normalized))
  // Порядок групп = порядок вкладок отчёта: карточки регистрируются в нём же, поэтому второго
  // справочника графикам не нужно.
  const groups = [...new Set(Object.values(DASHBOARD_CHARTS).map(chart => chart.group))]
  const emptyHint = !normalized && chartMetricFilter === 'fav' ? `${dashboardIcon('i-star')} Отметьте графики звездой — они появятся здесь`
    : !normalized && chartMetricFilter === 'recent' ? `${dashboardIcon('i-clock')} Добавьте карточку — последние выбранные графики появятся здесь`
    : 'График не найден'
  syncChartFilter(favorites.size, recents.size)
  list.innerHTML = groups.map(group => {
    const items = matches.filter(([, chart]) => chart.group === group)
    if (!items.length) return ''
    return `<section class="kpi-metric-group"><h4>${escapeDashboardText(group)}</h4>${items.map(([key, chart]) => {
      const isSelected = selected.includes(key)
      const isFavorite = favorites.has(key)
      const star = `<button class="kpi-metric-star ${isFavorite ? 'is-on' : ''}" type="button" data-chart-fav="${key}" aria-pressed="${isFavorite}" data-tooltip="${isFavorite ? 'В избранном · убрать' : 'В избранное'}">${dashboardIcon('i-star')}</button>`
      return `<div class="kpi-metric-option ${isSelected ? 'is-selected' : ''}" data-chart-key="${key}" role="group" aria-label="${escapeDashboardText(chart.title)}"><span class="kpi-metric-icon">${dashboardIcon(chart.icon)}</span><div><strong>${escapeDashboardText(chart.title)}</strong><small>${escapeDashboardText(chart.source)}</small></div><span class="kpi-unit-variants"><span class="kpi-unit-tag is-static">${escapeDashboardText(chart.kindLabel)}</span></span>${star}</div>`
    }).join('')}</section>`
  }).join('') || `<div class="kpi-metric-empty">${emptyHint}</div>`
}

// Множественный выбор, как у метрик: стопка слева, сколько строк отмечено — столько карточек
// ляжет на лист. Якорь правки (индекс 0) выбирается тем же правилом, что и в панели KPI.
function toggleChartSelection(chartKey) {
  if (!kpiEditorState || !DASHBOARD_CHARTS[chartKey]) return
  const index = kpiEditorState.selectedKeys.indexOf(chartKey)
  if (index >= 0) {
    kpiEditorState.selectedKeys.splice(index, 1)
    kpiEditorState.activeIndex = Math.min(kpiEditorState.activeIndex, Math.max(0, kpiEditorState.selectedKeys.length - 1))
  } else {
    kpiEditorState.selectedKeys.push(chartKey)
    kpiEditorState.activeIndex = kpiEditorState.selectedKeys.length - 1
  }
  syncKpiEditorSelection()
}

function pushKpiMetric(metricKey) {
  kpiEditorState.selectedKeys.push(metricKey)
  kpiEditorState.activeIndex = kpiEditorState.selectedKeys.length - 1
}

function toggleKpiMetric(metricKey) {
  if (!kpiEditorState || !KPI_METRICS[metricKey]) return
  const index = kpiEditorState.selectedKeys.indexOf(metricKey)
  if (index >= 0) {
    kpiEditorState.selectedKeys.splice(index, 1)
    kpiEditorState.activeIndex = Math.min(kpiEditorState.activeIndex, Math.max(0, kpiEditorState.selectedKeys.length - 1))
  } else pushKpiMetric(metricKey)
  syncKpiEditorSelection()
}

function kpiClusterKeys(baseKey) {
  const base = KPI_METRICS[baseKey]
  if (!base) return []
  const id = `${base.title}|${base.source}`
  return Object.keys(KPI_METRICS).filter(key => {
    const item = KPI_METRICS[key]
    return `${item.title}|${item.source}` === id
  })
}

// Строка отвечает за весь набор карточек метрики, пилюли единиц — за свою.
// Как в оригинале: в строке есть хоть одна карточка — снять все, нет — добавить базовую.
function toggleKpiCluster(baseKey) {
  if (!kpiEditorState) return
  const keys = kpiClusterKeys(baseKey)
  if (!keys.some(key => kpiEditorState.selectedKeys.includes(key))) {
    toggleKpiMetric(baseKey)
    return
  }
  for (let i = kpiEditorState.selectedKeys.length - 1; i >= 0; i -= 1) {
    if (keys.includes(kpiEditorState.selectedKeys[i])) kpiEditorState.selectedKeys.splice(i, 1)
  }
  syncKpiEditorSelection()
}

function syncKpiEditorSelection() {
  if (!kpiEditorState) return
  const total = kpiEditorState.selectedKeys.length
  kpiEditorState.activeIndex = Math.min(kpiEditorState.activeIndex, Math.max(0, total - 1))
  renderKpiMetricList(document.getElementById(editorChrome().search).value)
  updateKpiEditorPreview()
  syncKpiEditorChrome()
}

function syncKpiEditorChrome() {
  if (!kpiEditorState) return
  const chrome = editorChrome()
  const total = kpiEditorState.selectedKeys.length
  const apply = document.getElementById(chrome.apply)
  const title = document.getElementById(chrome.name)
  const hint = document.getElementById(chrome.hint)
  // В библиотеке панель создаёт карточку каталога, а не карточку на листе: глагол это различает.
  const verb = kpiEditorState.mode === 'edit' ? 'Сохранить' : (kpiEditorState.studio ? 'Создать виджет' : chrome.addVerb)
  apply.disabled = total === 0
  apply.textContent = total > 1 ? `${verb} · ${total}` : verb
  title.disabled = total > 1
  title.placeholder = total > 1 ? 'Общее название доступно для одной карточки' : chrome.namePlaceholder
  hint.textContent = total === 0
    ? chrome.pickHint
    : (total === 1 ? 'Слева — как карточка будет выглядеть на листе' : `Стопка из ${total} карточек — листайте её слева`)
}

function kpiPreviewWidget(metricKey, index) {
  const metric = KPI_METRICS[metricKey]
  const custom = kpiEditorState.selectedKeys.length === 1 ? document.getElementById(editorChrome().name).value.trim() : ''
  const existing = kpiEditorState.mode === 'edit' && index === 0 ? kpiEditorState.baseWidget : null
  return {
    id: `kpi-preview-${metricKey}`,
    kind: 'kpi',
    ...metric,
    title: custom || metric.title,
    showSparkline: existing ? Boolean(existing.showSparkline) : true,
    sparkline: existing?.sparkline || createKpiWidget(metricKey).sparkline,
    w: KPI_WIDTH,
    h: KPI_HEIGHT,
  }
}

// Превью графика — тот же createChartWidget, что кладёт виджет на лист, поэтому стопка
// показывает настоящую карточку, а не её описание. Копия конфигурации появляется только ради
// переименования: поля points и series остаются общими с отчётом и библиотекой.
function chartPreviewWidget(chartKey) {
  const chart = DASHBOARD_CHARTS[chartKey]
  const custom = kpiEditorState.selectedKeys.length === 1 ? document.getElementById(editorChrome().name).value.trim() : ''
  const widget = createChartWidget(chartKey, { id: `chart-preview-${chartKey}`, title: custom || chart.title })
  if (custom) widget.chart = { ...widget.chart, title: custom }
  return widget
}

function updateKpiEditorPreview() {
  if (!kpiEditorState) return
  const chrome = editorChrome()
  const frame = document.getElementById('kpiPreviewFrame')
  const stack = document.getElementById('kpiPreviewStack')
  const dots = document.getElementById('kpiPreviewDots')
  if (!frame || !stack || !dots) return
  const isChart = kpiEditorState.kind === 'chart'
  const cardKind = isChart ? 'chart' : 'kpi'
  const keys = kpiEditorState.selectedKeys
  const custom = keys.length === 1 ? document.getElementById(chrome.name).value.trim() : ''
  const signature = `${kpiEditorState.kind}::${keys.join('|')}::${custom}`
  if (frame.dataset.signature !== signature) {
    frame.dataset.signature = signature
    if (!keys.length) {
      stack.innerHTML = `<article class="dashboard-widget dashboard-widget-${cardKind} kpi-preview-card kpi-preview-empty"><span>${chrome.emptyPreview}</span></article>`
      dots.innerHTML = ''
    } else {
      stack.innerHTML = keys.map((key, index) => {
        const widget = isChart ? chartPreviewWidget(key) : kpiPreviewWidget(key, index)
        const hasSpark = !isChart && widget.showSparkline && Array.isArray(widget.sparkline) && widget.sparkline.length > 1
        return `<article class="dashboard-widget dashboard-widget-${cardKind} kpi-preview-card ${hasSpark ? 'has-sparkline' : ''}" data-preview-index="${index}" aria-hidden="true">${dashboardWidgetMarkup(widget)}</article>`
      }).join('')
      dots.innerHTML = `<div class="kpi-preview-dot-track">${keys.map((_, index) => `<button type="button" class="kpi-preview-dot" data-preview-dot="${index}" aria-label="Показать карточку ${index + 1}"></button>`).join('')}</div>`
      dots.classList.toggle('is-scrollable', keys.length > KPI_PREVIEW_DOT_WINDOW)
    }
    frame.classList.toggle('is-stacked', keys.length > 1)
    frame.classList.toggle('is-chart', isChart)
  }
  applyKpiPreviewTransform()
}

// Колонка показывает восемь меток, остальные догоняют её сдвигом трека.
let kpiPreviewShownIndex = 0

function isKpiPreviewDotVisible(dot) {
  const dotBox = dot.getBoundingClientRect()
  const clipBox = document.getElementById('kpiPreviewDots').getBoundingClientRect()
  return dotBox.top >= clipBox.top - 1 && dotBox.bottom <= clipBox.bottom + 1
}

function moveKpiPreviewDotsTo(index, { glide } = {}) {
  const column = document.getElementById('kpiPreviewDots')
  const track = column.firstElementChild
  const dot = track?.children[index]
  if (!dot || !column.clientHeight) return
  const room = track.offsetHeight - column.clientHeight
  const centered = dot.offsetTop + dot.offsetHeight / 2 - column.clientHeight / 2
  track.classList.toggle('is-glide', Boolean(glide))
  track.style.transform = `translateY(${-Math.max(0, Math.min(centered, room))}px)`
  kpiPreviewShownIndex = index
}

function applyKpiPreviewTransform() {
  const frame = document.getElementById('kpiPreviewFrame')
  if (!frame || !kpiEditorState) return
  const cards = [...frame.querySelectorAll('[data-preview-index]')]
  const total = kpiEditorState.selectedKeys.length
  const active = kpiEditorState.activeIndex
  cards.forEach(node => {
    const dist = Number(node.dataset.previewIndex) - active
    if (total < 2 || dist === 0) {
      node.style.transform = total < 2 ? 'translateX(-50%)' : 'translateX(-50%) rotateX(0deg) translateY(0) scale(.9) translateZ(80px)'
    } else {
      node.style.transform = `translateX(-50%) rotateX(${dist < 0 ? '-30deg' : '30deg'}) translateY(${dist < 0 ? '-60%' : '60%'}) scale(.85)`
    }
    node.style.opacity = dist === 0 ? '1' : (Math.abs(dist) === 1 ? '.35' : '0')
    node.style.zIndex = String(dist === 0 ? 10 : 5 - Math.abs(dist))
  })
  const dotList = frame.querySelectorAll('[data-preview-dot]')
  dotList.forEach(node => node.classList.toggle('is-active', Number(node.dataset.previewDot) === active))
  moveKpiPreviewDotsTo(active, { glide: Math.abs(active - kpiPreviewShownIndex) > 1 })
  const hint = document.getElementById('kpiPreviewHint')
  hint.textContent = total > 1 ? `${active + 1} из ${total} · листайте ↑/↓, колесом или свайпом` : ''
  hint.classList.toggle('is-visible', total > 1)
}

function stepKpiPreview(delta) {
  if (!kpiEditorState) return
  const total = kpiEditorState.selectedKeys.length
  if (total < 2) return
  const next = Math.max(0, Math.min(total - 1, kpiEditorState.activeIndex + delta))
  if (next === kpiEditorState.activeIndex) return
  kpiEditorState.activeIndex = next
  applyKpiPreviewTransform()
}

function setKpiEditorOverlay(open) {
  const scrim = document.getElementById('kpiEditorScrim')
  const area = document.getElementById('kpiPreviewArea')
  scrim.classList.toggle('is-open', open)
  scrim.setAttribute('aria-hidden', String(!open))
  area.classList.toggle('is-open', open)
  area.setAttribute('aria-hidden', String(!open))
  // На время предпросмотра панель масштаба и кнопка сворачивания листов уходят: под затемнением
  // они читаются как осиротевший интерфейс чужого экрана. Оба элемента живут вне #dashboardView,
  // поэтому состояние вешаем на body.
  document.body.classList.toggle('is-kpi-preview', open)
  if (typeof setKpiEditorSidebar === 'function') setKpiEditorSidebar(open)
}

// Один редактор на два формата. Панели различаются только справочником элементов, потому что
// состояние, стопка предпросмотра, затемнение и глаголы у них общие: второй экземпляр машины
// разъехался бы с первым за первую же правку.
function openDashboardEditor(kind, widgetId = null, options = {}) {
  const chrome = EDITOR_CHROME[kind]
  const isChart = kind === 'chart'
  const catalog = isChart ? DASHBOARD_CHARTS : KPI_METRICS
  // Панель одна на лист и на библиотеку (§6.1): студийная карточка разворачивается в
  // widget-объект, и панель не знает, чей именно виджет она открыла — только бы base-объект
  // не попал на canvas: его id принадлежит библиотеке, а не листу.
  const studio = isChart ? false : Boolean(options.studio)
  const base = options.studioItem ? studioWidget(options.studioItem) : (widgetId ? activeDashboardModel().getWidget(widgetId) : null)
  const baseKey = isChart ? base?.chartKey : base?.metricKey
  const selectedKey = catalog[baseKey] ? baseKey : (isChart ? Object.keys(catalog)[0] : 'revenue')
  // Форма добавления стартует пустой: стопка появляется только после выбора карточки.
  kpiEditorState = { kind, mode: base ? 'edit' : 'add', widgetId: base?.id || null, baseWidget: base, studio, selectedKeys: base ? [selectedKey] : [], activeIndex: 0 }
  if (!studio) {
    dashboardEditing = true
    if (base) selectDashboardWidget(base.id)
  }
  document.getElementById(chrome.heading).textContent = base ? chrome.editHeading : chrome.addHeading
  // Панель стартует нейтрально: и поиск, и фильтр, иначе повторное открытие попадает в пустой «Избранное».
  document.getElementById(chrome.search).value = ''
  if (isChart) chartMetricFilter = 'all'
  else kpiMetricFilter = 'all'
  document.getElementById(chrome.name).value = base && base.title !== catalog[selectedKey].title ? (base.title || '') : ''
  renderKpiMetricList()
  updateKpiEditorPreview()
  syncKpiEditorChrome()
  const panel = document.getElementById(chrome.panel)
  panel.classList.add('is-open')
  panel.setAttribute('aria-hidden', 'false')
  setKpiEditorOverlay(true)
  // Раскрытой показывает себя только та кнопка, что открыла панель: с листа это «Добавить
  // виджет», из библиотеки «Новый виджет».
  document.getElementById(studio ? 'studioCreateButton' : 'dashboardAddWidget')
    .setAttribute('aria-expanded', String(!base))
  requestAnimationFrame(() => dashboardFloatingRefreshers.forEach(refresh => refresh()))
  if (!studio) {
    updateDashboardToolbar()
    updateDashboardSelection()
  }
  requestAnimationFrame(() => document.getElementById(chrome.search).focus())
}

function openDashboardKpiEditor(widgetId = null, options = {}) {
  openDashboardEditor('kpi', widgetId, options)
}

function openDashboardChartEditor(widgetId = null) {
  openDashboardEditor('chart', widgetId)
}

// Карандаш и двойной клик выбирают редактора по формату виджета, а не по тому, какая панель
// была открыта последней: на одном листе KPI и графики соседствуют.
function openDashboardWidgetEditor(widgetId) {
  const widget = activeDashboardModel().getWidget(widgetId)
  if (widget?.kind === 'chart') openDashboardChartEditor(widgetId)
  else openDashboardKpiEditor(widgetId)
}

function closeDashboardKpiEditor() {
  const panel = document.getElementById(kpiEditorState ? editorChrome().panel : EDITOR_CHROME.kpi.panel)
  kpiEditorState = null
  panel.classList.remove('is-open')
  panel.setAttribute('aria-hidden', 'true')
  setKpiEditorOverlay(false)
  closeDashboardAddMenu()
  document.querySelectorAll('#dashboardAddWidget,#studioCreateButton').forEach(node => node.setAttribute('aria-expanded', 'false'))
  requestAnimationFrame(() => dashboardFloatingRefreshers.forEach(refresh => refresh()))
}

// Новая карточка ищёт свободную ячейку своего формата, а не накладывается каскадом:
// при множественном выборе добавляется сразу несколько виджетов. Модель передаётся аргументом,
// потому что в библиотеке виджет кладут и на неактивный лист.
function findFreeDashboardSlot(widget, model = activeDashboardModel()) {
  const padding = 16
  const occupied = model.widgets.map(item => ({ x: item.x, y: item.y, w: item.w, h: item.h }))
  for (let y = 72; y + widget.h <= 800; y += 24) {
    for (let x = 48; x + widget.w <= 1200; x += 24) {
      const clash = occupied.some(other => x < other.x + other.w + padding && x + widget.w + padding > other.x && y < other.y + other.h + padding && y + widget.h + padding > other.y)
      if (!clash) return { x, y }
    }
  }
  return { x: 48, y: 72 }
}

// Формат виджета задаёт размер ячейки: KPI и график занимают разные площадки, и поиск свободной
// клетки параметризован шириной-высотой, а не зашит в 232×140. Иначе график встал бы в щель,
// из которой выросла карточка вдвое меньше него.
function findFreeWidgetSlots(count, width, height, model = activeDashboardModel()) {
  const step = width + 16
  const rowStep = height + 16
  const occupied = model.widgets.map(widget => ({ x: widget.x, y: widget.y, w: widget.w, h: widget.h }))
  const slots = []
  for (let y = 72; y + height <= 800 && slots.length < count; y += rowStep) {
    for (let x = 48; x + width <= 1200 && slots.length < count; x += step) {
      const clash = occupied.some(other => x < other.x + other.w + 16 && x + width + 16 > other.x && y < other.y + other.h + 16 && y + height + 16 > other.y)
      if (clash) continue
      slots.push({ x, y })
      occupied.push({ x, y, w: width, h: height })
    }
  }
  // Ячеек сетки может не хватить: свободных мест на листе 1200×800 конечное число.
  // Лишние карточки кладём каскадом, иначе они встанут строго одна на другую и их не найти.
  const placed = slots.length
  for (let index = placed; index < count; index += 1) {
    const offset = (index - placed) * 20
    slots.push({
      x: Math.min(48 + offset, 1200 - width),
      y: Math.min(72 + offset, 800 - height),
    })
  }
  return slots
}

function findFreeKpiSlots(count, model = activeDashboardModel()) {
  return findFreeWidgetSlots(count, KPI_WIDTH, KPI_HEIGHT, model)
}

function applyDashboardKpiEditor() {
  if (!kpiEditorState) return
  // У панели два получателя — лист и библиотека. Развилка одна и на входе, поэтому слушатель
  // «Применить» остаётся единственным на всю форму.
  if (kpiEditorState.studio) {
    applyStudioKpiEditor()
    return
  }
  if (kpiEditorState.kind === 'chart') {
    applyDashboardChartEditor()
    return
  }
  const keys = kpiEditorState.selectedKeys
  if (!keys.length) {
    showToast('Метрика не выбрана', 'Отметьте хотя бы один показатель')
    return
  }
  const model = activeDashboardModel()
  const isEdit = kpiEditorState.mode === 'edit'
  const customTitle = keys.length === 1 ? document.getElementById('kpiCustomTitle').value.trim() : ''
  const addedCount = isEdit ? keys.length - 1 : keys.length
  const slots = findFreeKpiSlots(addedCount)
  let lastId = null
  // Одна транзакция истории на всё применение: иначе Ctrl+Z откатывает по одной карточке.
  model.commit()
  keys.forEach((key, index) => {
    const metric = KPI_METRICS[key]
    const title = customTitle || metric.title
    if (isEdit && index === 0) {
      model.updateWidget(kpiEditorState.widgetId, { metricKey: key, ...metric, title }, false)
      lastId = kpiEditorState.widgetId
      return
    }
    const slot = slots[index - (isEdit ? 1 : 0)]
    const widget = createKpiWidget(key, { id: `dash-kpi-${Date.now()}-${index}`, title, x: slot.x, y: slot.y })
    model.addWidget(widget, false)
    lastId = widget.id
  })
  const firstName = KPI_METRICS[keys[0]].title
  rememberKpiRecents(keys)
  const addedLabel = addedCount ? `${addedCount} ${pluralizeDashboard(addedCount, ['карточка', 'карточки', 'карточек'])}` : ''
  if (isEdit) showToast('KPI обновлён', addedCount ? `${firstName} · и ещё ${addedLabel}` : firstName)
  else showToast(addedCount > 1 ? 'KPI добавлены' : 'KPI добавлен', addedCount > 1 ? `${addedLabel} на листе · переместите и нажмите «Готово»` : (customTitle || firstName))
  selectDashboardWidget(lastId)
  closeDashboardKpiEditor()
  renderDashboard()
}

// График с листа — та же карточка библиотеки, что разворачивает studioWidget, поэтому связку
// проставляем на месте: studioAdoptSheetWidgets занимается только KPI, и без этой строки копия,
// добавленная панелью, осталась бы невидимой для счётчика «На листах».
function applyDashboardChartEditor() {
  const keys = kpiEditorState.selectedKeys
  if (!keys.length) {
    showToast('График не выбран', 'Отметьте хотя бы один график')
    return
  }
  const model = activeDashboardModel()
  const isEdit = kpiEditorState.mode === 'edit'
  const customTitle = keys.length === 1 ? document.getElementById('chartCustomTitle').value.trim() : ''
  const addedCount = isEdit ? keys.length - 1 : keys.length
  const slots = findFreeWidgetSlots(addedCount, CHART_WIDTH, CHART_HEIGHT)
  let lastId = null
  // Одна транзакция истории на всё применение: иначе Ctrl+Z снимает по одному графику.
  model.commit()
  keys.forEach((key, index) => {
    const chart = DASHBOARD_CHARTS[key]
    const title = customTitle || chart.title
    // dashboardChartMarkup рисует widget.chart, а не справочник, поэтому переименованный виджет
    // носит копию конфигурации. points и series остаются общими с отчётом.
    const own = customTitle ? { ...chart, title } : chart
    const link = { chartKey: key, title, group: chart.group, source: chart.source, icon: chart.icon, chart: own, studioId: studioChartItemId(key) }
    if (isEdit && index === 0) {
      model.updateWidget(kpiEditorState.widgetId, link, false)
      lastId = kpiEditorState.widgetId
      return
    }
    const slot = slots[index - (isEdit ? 1 : 0)]
    const widget = createChartWidget(key, { id: `dash-chart-${Date.now()}-${index}`, ...link, x: slot.x, y: slot.y })
    model.addWidget(widget, false)
    lastId = widget.id
  })
  const firstName = DASHBOARD_CHARTS[keys[0]].title
  rememberChartRecents(keys)
  const addedLabel = addedCount ? `${addedCount} ${pluralizeDashboard(addedCount, ['график', 'графика', 'графиков'])}` : ''
  if (isEdit) showToast('График обновлён', addedCount ? `${firstName} · и ещё ${addedLabel}` : firstName)
  else showToast(addedCount > 1 ? 'Графики добавлены' : 'График добавлен', addedCount > 1 ? `${addedLabel} на листе · переместите и нажмите «Готово»` : (customTitle || firstName))
  selectDashboardWidget(lastId)
  closeDashboardKpiEditor()
  renderDashboard()
}

function screenToDashboard(clientX, clientY) {
  const rect = document.getElementById('dashboardStage').getBoundingClientRect()
  return { x: (clientX - rect.left - dashboardCamera.x) / dashboardCamera.zoom, y: (clientY - rect.top - dashboardCamera.y) / dashboardCamera.zoom }
}

function updateDashboardSelection() {
  document.querySelectorAll('[data-dashboard-widget]').forEach(node => node.classList.toggle('is-selected', dashboardSelection.has(node.dataset.dashboardWidget)))
  renderDashboardMinimap()
}

function setDashboardSelection(ids) {
  const next = [...new Set(ids)]
  dashboardSelection.clear()
  next.forEach(id => dashboardSelection.add(id))
  // Якорь всегда один: группового ресайза в оригинале нет, поэтому при двух и более
  // выделенных карточках ручки и кнопки виджета просто исчезают.
  selectedDashboardWidget = next.length === 1 ? next[0] : null
}

function selectDashboardWidget(id) {
  setDashboardSelection(id ? [id] : [])
}

function clearDashboardSelection() {
  setDashboardSelection([])
}

// Ctrl+Click работает как toggleSelection в SelectionContext оригинала: модификатор меняет
// состав группы, но перетаскивание с него не начинается.
function toggleDashboardSelection(id) {
  const next = new Set(dashboardSelection)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  setDashboardSelection(next)
}

// Рамка накрывает карточку любым касанием, а не только полным попаданием — как rectsOverlap
// в оригинале: достаточно углу рамки зайти за край.
function dashboardWidgetsInRect(rect) {
  return activeDashboardLayout().filter(widget => widget.x < rect.x + rect.w && rect.x < widget.x + widget.w
    && widget.y < rect.y + rect.h && rect.y < widget.y + widget.h)
}

function renderDashboardMarquee(rect) {
  const canvas = document.getElementById('dashboardCanvas')
  if (!canvas) return
  const existing = canvas.querySelector('.dashboard-marquee')
  if (!rect) { existing?.remove(); return }
  const node = existing || document.createElement('span')
  if (!existing) node.className = 'dashboard-marquee'
  Object.assign(node.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` })
  canvas.append(node)
}

function markDashboardMarqueeHits(hits) {
  document.querySelectorAll('[data-dashboard-widget]').forEach(node => {
    node.classList.toggle('is-marquee-hit', hits.has(node.dataset.dashboardWidget) && !dashboardSelection.has(node.dataset.dashboardWidget))
  })
}

function bindDashboardInteractions() {
  const canvas = document.getElementById('dashboardCanvas')
  const viewport = document.querySelector('.dashboard-stage-wrap')
  if (!canvas || !viewport) return
  let interaction = null
  let spacePressed = false
  let marqueeFrame = 0

  window.addEventListener('keydown', event => {
    // Под Admin Console (§4.1) рабочее пространство убрано из вёрстки, но его обработчики
    // живы: пробел-панорама, Delete и отмена не должны срабатывать «в пустоту» — тот же
    // класс ловушек, что и с экраном входа (§12.8).
    if (document.body.classList.contains('is-admin-console')) return
    // Пробел панорамирует холст, но не там, где он остаётся вводом: в полях ввода — та же
    // оговорка, что у стрелок ниже, — и на экране входа (§12.8), где shell скрыт, хотя
    // is-hidden у #dashboardView снят.
    if (event.code === 'Space' && !event.repeat && !document.activeElement?.isContentEditable && !document.activeElement?.closest('input,textarea,[contenteditable]')) {
      spacePressed = true
      if (document.body.classList.contains('is-logged-out') || document.getElementById('dashboardView').classList.contains('is-hidden')) return
      event.preventDefault()
      viewport.classList.add('is-pan-ready')
    }
    if (event.key === 'Escape' && kpiEditorState) {
      event.preventDefault()
      closeDashboardKpiEditor()
    }
    // ↑/↓ листают стопку предпросмотра. В полях ввода (поиск метрик, название) стрелки
    // остаются кареткой: иначе набрать «-» или перейти по истории поиска не выйдет.
    if (kpiEditorState && (event.key === 'ArrowUp' || event.key === 'ArrowDown') && !document.activeElement?.closest('input,textarea,[contenteditable]')) {
      event.preventDefault()
      stepKpiPreview(event.key === 'ArrowUp' ? -1 : 1)
    }
    if (event.key === 'Delete' && dashboardSelection.size && dashboardEditing && !kpiEditorState && !document.activeElement?.isContentEditable) {
      const model = activeDashboardModel()
      // Один шаг отмены на всю группу: replace() пишет историю сам, поштучный removeWidget
      // оставил бы столько же шагов, сколько карточек в выделении.
      model.replace(model.widgets.filter(widget => !dashboardSelection.has(widget.id)))
      clearDashboardSelection()
      renderDashboard()
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && dashboardEditing && !document.activeElement?.isContentEditable) {
      event.preventDefault()
      if (event.shiftKey) activeDashboardModel().redo()
      else activeDashboardModel().undo()
      renderDashboard()
    }
  })
  window.addEventListener('keyup', event => {
    if (event.code === 'Space') {
      spacePressed = false
      viewport.classList.remove('is-pan-ready')
    }
  })

  viewport.addEventListener('wheel', event => {
    if (document.getElementById('dashboardView').classList.contains('is-hidden')) return
    event.preventDefault()
    // Хвост инерции свайпа, начатого над слоем значка: курсор уже на холсте, а события ещё идут.
    // Без этой проверки канвас дёргается в ту же сторону, куда листали страницы. Пинч (ctrl+wheel)
    // не глушим: это очевидно другое намерение, и ждать паузу в 250 мс, чтобы раззумить, — плохо.
    if (isSheetIconWheelTail() && !event.ctrlKey) return
    if (event.ctrlKey) {
      // Начало отсчёта камеры — stage: wrap выпущен за панели, и от его левого края пинч
      // уводил бы точку зума на ширину сайдбара.
      const rect = document.getElementById('dashboardStage').getBoundingClientRect()
      const cursorX = event.clientX - rect.left
      const cursorY = event.clientY - rect.top
      const worldX = (cursorX - dashboardCamera.x) / dashboardCamera.zoom
      const worldY = (cursorY - dashboardCamera.y) / dashboardCamera.zoom
      const nextZoom = Math.max(.5, Math.min(2, dashboardCamera.zoom * Math.exp(-event.deltaY * .002)))
      dashboardCamera.x = cursorX - worldX * nextZoom
      dashboardCamera.y = cursorY - worldY * nextZoom
      dashboardCamera.zoom = nextZoom
    } else {
      dashboardCamera.x -= event.deltaX
      dashboardCamera.y -= event.deltaY
    }
    applyDashboardCamera()
  }, { passive: false })

  viewport.addEventListener('pointerdown', event => {
    const widgetNode = event.target.closest('[data-dashboard-widget]')
    const panGesture = event.button === 1 || spacePressed
    if (panGesture) {
      interaction = { type: 'pan', startX: event.clientX, startY: event.clientY, cameraX: dashboardCamera.x, cameraY: dashboardCamera.y }
      viewport.classList.add('is-panning')
      viewport.setPointerCapture?.(event.pointerId)
      event.preventDefault()
      return
    }
    if (dashboardRulerEnabled && !widgetNode) {
      const point = screenToDashboard(event.clientX, event.clientY)
      dashboardMeasure = { fromX: point.x, fromY: point.y, toX: point.x, toY: point.y }
      interaction = { type: 'measure' }
      viewport.setPointerCapture?.(event.pointerId)
      renderDashboardGuides()
      event.preventDefault()
      return
    }
    if (!widgetNode) {
      // Пока открыта форма KPI, карточки на холсте спрятаны — рамка выделения там не нужна,
      // и выделение за закрытой формой тоже ни о чём хорошем не договорится.
      if (kpiEditorState) return
      // Рамка выделения. Мёртвые 5 px отделяют жест от клика, как в оригинале, и выделение
      // снимаем не на нажатии, а на отпускании: иначе короткий тычок по пустому месту
      // схлопнул бы группу до того, как стало понятно, что это было.
      interaction = {
        type: 'marquee',
        startX: event.clientX,
        startY: event.clientY,
        base: new Set(event.ctrlKey || event.metaKey ? dashboardSelection : []),
        hits: new Set(),
        pending: true,
      }
      try { viewport.setPointerCapture?.(event.pointerId) } catch (_) {}
      return
    }
    const id = widgetNode.dataset.dashboardWidget
    const onControl = event.target.closest('button') || event.target.isContentEditable
    if ((event.ctrlKey || event.metaKey) && !onControl) {
      event.preventDefault()
      toggleDashboardSelection(id)
      updateDashboardSelection()
      return
    }
    // Клик по карточке внутри группы не распускает группу — дальше она тянется целиком.
    if (!(dashboardSelection.has(id) && dashboardSelection.size > 1)) selectDashboardWidget(id)
    updateDashboardSelection()
    // Пара кликов по карточке. Ниже pointerdown завершается preventDefault (без него
    // карточка тянется за курсором), а он подавляет нативный dblclick — поэтому в режиме правки
    // пару считаем по времени и цели, как в оригинале (FreeGrid.tsx:1449-1515). Оригинал
    // доверяет этот жест только аннотациям; здесь тем же окном открыты и настраиваемые
    // форматы, иначе надпись «двойной клик настраивает карточку» была бы пустой.
    const pressedKind = activeDashboardModel().getWidget(id)?.kind
    const pairable = pressedKind === 'note' || (dashboardEditing && (pressedKind === 'kpi' || pressedKind === 'chart'))
    if (!onControl && pairable) {
      const now = Date.now()
      const isPair = lastCardPair?.id === id && now - lastCardPair.time < CARD_DBLCLICK_WINDOW
      lastCardPair = { id, time: now }
      if (isPair) {
        lastCardPair = null
        if (pressedKind === 'note') startDashboardNoteEdit(widgetNode, id, dashboardNoteField(event))
        else openDashboardWidgetEditor(id)
        return
      }
    }
    if (!dashboardEditing || onControl) return
    const model = activeDashboardModel()
    const widget = model.getWidget(id)
    const direction = event.target.closest('.dashboard-resize-handle')?.dataset.direction
    const group = direction ? null : [...dashboardSelection].filter(partId => partId !== id).map(partId => {
      const part = model.getWidget(partId)
      const node = canvas.querySelector(`[data-dashboard-widget="${partId}"]`)
      return part && node ? { widget: part, node, start: { x: part.x, y: part.y } } : null
    }).filter(Boolean)
    interaction = { type: direction ? 'resize' : 'drag', direction, group, target: widgetNode, widget, startX: event.clientX, startY: event.clientY, start: { ...widget }, committed: false }
    widgetNode.classList.add(direction ? 'is-resizing' : 'is-dragging')
    group?.forEach(part => part.node.classList.add('is-dragging'))
    try { viewport.setPointerCapture?.(event.pointerId) } catch (_) {}
    event.preventDefault()
  })

  viewport.addEventListener('pointermove', event => {
    if (!interaction) return
    if (interaction.type === 'pan') {
      dashboardCamera.x = interaction.cameraX + event.clientX - interaction.startX
      dashboardCamera.y = interaction.cameraY + event.clientY - interaction.startY
      applyDashboardCamera()
      return
    }
    if (interaction.type === 'marquee') {
      if (interaction.pending) {
        // Мёртвая зона: пока указатель не ушёл на 5 px, это считается кликом, а не рамкой.
        if (Math.hypot(event.clientX - interaction.startX, event.clientY - interaction.startY) < 5) return
        const origin = screenToDashboard(interaction.startX, interaction.startY)
        interaction.pending = false
        interaction.origin = origin
      }
      const point = screenToDashboard(event.clientX, event.clientY)
      interaction.rect = {
        x: Math.min(interaction.origin.x, point.x),
        y: Math.min(interaction.origin.y, point.y),
        w: Math.abs(point.x - interaction.origin.x),
        h: Math.abs(point.y - interaction.origin.y),
      }
      interaction.hits = new Set(dashboardWidgetsInRect(interaction.rect).map(widget => widget.id))
      if (!marqueeFrame) marqueeFrame = requestAnimationFrame(() => {
        marqueeFrame = 0
        if (!interaction) return
        renderDashboardMarquee(interaction.rect)
        markDashboardMarqueeHits(interaction.hits)
      })
      return
    }
    if (interaction.type === 'measure') {
      const point = screenToDashboard(event.clientX, event.clientY)
      dashboardMeasure.toX = point.x
      dashboardMeasure.toY = point.y
      renderDashboardGuides()
      return
    }
    const dx = (event.clientX - interaction.startX) / dashboardCamera.zoom
    const dy = (event.clientY - interaction.startY) / dashboardCamera.zoom
    // Снимок «до» пишем только на реальное движение: клик по карточке тоже проходит через
    // pointerdown, и прежний коммит оставлял в истории пустой шаг — «Отменить» после правки
    // заметки сжигал два нажатия впустую.
    if (!interaction.committed && (dx || dy)) { activeDashboardModel().commit(); interaction.committed = true }
    Object.assign(interaction.widget, interaction.start)
    if (interaction.type === 'drag') {
      // Смещения спутников считаем от старта захвата: модель по ним собирает объединяющую
      // рамку группы и снапит её, а не отдельную карточку.
      const companions = (interaction.group || []).map(part => ({
        id: part.widget.id,
        dx: part.start.x - interaction.start.x,
        dy: part.start.y - interaction.start.y,
        w: part.widget.w,
        h: part.widget.h,
      }))
      dashboardGuides = activeDashboardModel().moveWidget(interaction.widget.id, interaction.start.x + dx, interaction.start.y + dy, { record: false, companions }).guides
      // Группа едет на тот же сдвиг, что получил захваченный виджет со снапом: иначе карточки
      // разъехались бы друг от друга, и смысл мультивыделения пропал.
      const shiftX = interaction.widget.x - interaction.start.x
      const shiftY = interaction.widget.y - interaction.start.y
      interaction.group?.forEach(part => {
        part.widget.x = part.start.x + shiftX
        part.widget.y = part.start.y + shiftY
        Object.assign(part.node.style, { left: `${part.widget.x}px`, top: `${part.widget.y}px` })
      })
    } else {
      const direction = interaction.direction
      const point = {
        x: direction.includes('Left') ? interaction.start.x + dx : interaction.start.x + interaction.start.w + dx,
        y: direction.includes('top') || direction.includes('Top') ? interaction.start.y + dy : interaction.start.y + interaction.start.h + dy,
      }
      dashboardGuides = activeDashboardModel().resizeWidget(interaction.widget.id, direction, point, { record: false }).guides
    }
    Object.assign(interaction.target.style, { left: `${interaction.widget.x}px`, top: `${interaction.widget.y}px`, width: `${interaction.widget.w}px`, height: `${interaction.widget.h}px` })
    if (interaction.type === 'resize') refreshWidgetSparklineGeometry(interaction.target, interaction.widget)
    renderDashboardGuides()
    renderDashboardMinimap()
  })

  const finish = () => {
    if (!interaction) return
    const { type, base, hits, group } = interaction
    if (marqueeFrame) { cancelAnimationFrame(marqueeFrame); marqueeFrame = 0 }
    viewport.classList.remove('is-panning')
    interaction.target?.classList.remove('is-dragging', 'is-resizing')
    group?.forEach(part => part.node.classList.remove('is-dragging'))
    interaction = null
    markDashboardMarqueeHits(new Set())
    if (type === 'pan') {
      renderDashboardMinimap()
      return
    }
    dashboardGuides = []
    if (type === 'measure') dashboardMeasure = null
    if (type === 'marquee') {
      renderDashboardMarquee(null)
      // base пуст для клика без Ctrl и равен текущему выделению для клика с Ctrl, поэтому
      // одно и то же правило закрывает оба случая: клик по пустому месту снимает выделение,
      // клик с Ctrl оставляет группу, рамка — дополняет её до base ∪ hits.
      setDashboardSelection([...base, ...hits])
      updateDashboardSelection()
    }
    renderDashboard()
  }
  viewport.addEventListener('pointerup', finish)
  viewport.addEventListener('pointercancel', finish)

  canvas.addEventListener('click', event => {
    const sparkline = event.target.closest('[data-toggle-sparkline]')
    if (sparkline) {
      const widget = activeDashboardModel().getWidget(sparkline.dataset.toggleSparkline)
      if (widget) {
        const visible = !widget.showSparkline
        activeDashboardModel().updateWidget(widget.id, { showSparkline: visible })
        const card = sparkline.closest('[data-dashboard-widget]')
        card?.classList.toggle('has-sparkline', visible)
        card?.querySelector('.dashboard-spark-wrap')?.classList.toggle('is-open', visible)
        sparkline.classList.toggle('is-active', visible)
        sparkline.setAttribute('aria-pressed', String(visible))
        sparkline.setAttribute('aria-label', visible ? 'Скрыть динамику' : 'Показать динамику')
        updateDashboardToolbar()
      }
      return
    }
    const edit = event.target.closest('[data-edit-widget]')
    if (edit && dashboardEditing) {
      openDashboardWidgetEditor(edit.dataset.editWidget)
      return
    }
    const widgetTask = event.target.closest('[data-widget-task]')
    if (widgetTask && dashboardEditing) {
      createTaskFromWidget(widgetTask.dataset.widgetTask)
      return
    }
    const remove = event.target.closest('[data-remove-widget]')
    if (remove && dashboardEditing) {
      const id = remove.dataset.removeWidget
      activeDashboardModel().removeWidget(id)
      // Крестик снимает одну карточку, группу он трогать не должен.
      setDashboardSelection([...dashboardSelection].filter(widget => widget !== id))
      renderDashboard()
    }
  })
}

// Окно пары кликов — как в оригинале (FreeGrid.tsx:1505: те же 500 ms на тот же виджет).
const CARD_DBLCLICK_WINDOW = 500
let lastCardPair = null

// Карандаш лежит рядом с полем, а не внутри него, поэтому кликабельная область строки шире
// текста: поле берём из строки-контейнера, иначе клик по иконке раскрывал комментарий.
function dashboardNoteField(event) {
  const row = event.target.closest('.dashboard-note-row')
  return row?.querySelector('[data-note-field]')?.dataset.noteField
    ?? event.target.closest('[data-note-field]')?.dataset.noteField
}

function startDashboardNoteEdit(card, id, field) {
  const key = field === 'title' ? 'title' : 'body'
  // Каждый pointerup в режиме правки перерисовывает холст, поэтому узел из события уже мёртвый.
  const node = (document.querySelector(`[data-dashboard-widget="${id}"]`) || card).querySelector(`[data-note-field="${key}"]`)
  if (!node || node.isContentEditable) return
  // В DOM поле лежит с мягкими переносами — в редакторе их быть не должно: каретка считала бы
  // их символами, а коммит вернул бы в модель невидимые U+00AD. Берем сырой текст из модели.
  const original = activeDashboardModel().getWidget(id)?.[key] ?? stripDashboardHyphens(node.textContent)
  node.textContent = original
  node.setAttribute('contenteditable', 'plaintext-only')
  if (node.contentEditable !== 'plaintext-only') node.setAttribute('contenteditable', 'true')
  node.focus()
  const range = document.createRange()
  range.selectNodeContents(node)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  node.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      node.blur()
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      node.textContent = original
      node.blur()
    }
  })
  node.addEventListener('blur', () => {
    node.removeAttribute('contenteditable')
    const text = stripDashboardHyphens(node.textContent).trim()
    // Комментарий имеет право остаться пустым — тогда виден подсказчик. Название без текста
    // вернулось бы к «Заметка», иначе карточка теряет подпись в шапке и на мини-карте.
    const next = key === 'title' ? (text || 'Заметка') : text
    if (next !== (activeDashboardModel().getWidget(id)?.[key] || '')) {
      activeDashboardModel().updateWidget(id, { [key]: next })
    }
    renderDashboard()
  }, { once: true })
}

function bindFloatingDashboardPanel(panel, handle, storageKey, defaultPosition) {
  if (!panel || !handle) return
  const insets = { top: 58, right: 12, bottom: 49, left: 12 }
  const gap = 10
  const effectiveInsets = () => {
    const kpiPanel = document.getElementById('dashboardKpiSettings')
    const kpiOpen = kpiPanel?.classList.contains('is-open')
    const sheetsCollapsed = document.querySelector('.bottom-panel')?.classList.contains('is-collapsed')
    // Форма KPI перекрывает правый край холста: панель масштаба должна вставать слева от неё,
    // иначе на узких экранах она уходит под форму и становится недостижимой.
    const right = kpiOpen ? Math.round(kpiPanel.getBoundingClientRect().width) + insets.right + gap : insets.right
    return { ...insets, right, bottom: sheetsCollapsed ? 5 : insets.bottom }
  }
  let drag = null
  let position = { ...defaultPosition }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null')
    if (['top', 'right', 'bottom', 'left'].includes(saved?.edge) && Number.isFinite(saved?.offset)) {
      position = { edge: saved.edge, offset: Math.max(0, Math.min(1, saved.offset)) }
    }
  } catch (_) {}

  const parentBounds = () => panel.parentElement?.getBoundingClientRect()
  const dimensionsFor = edge => {
    const vertical = edge === 'left' || edge === 'right'
    panel.classList.toggle('is-vertical', vertical)
    panel.classList.remove('dock-top', 'dock-right', 'dock-bottom', 'dock-left')
    panel.classList.add(`dock-${edge}`)
    return { width: panel.offsetWidth, height: panel.offsetHeight }
  }
  const coordinatesFor = (nextPosition, parent, dimensions) => {
    const safe = effectiveInsets()
    const horizontal = nextPosition.edge === 'top' || nextPosition.edge === 'bottom'
    const range = horizontal
      ? Math.max(0, parent.width - safe.left - safe.right - dimensions.width)
      : Math.max(0, parent.height - safe.top - safe.bottom - dimensions.height)
    const clamp = (value, min, max) => Math.min(Math.max(min, value), max)
    if (horizontal) return {
      x: clamp(safe.left + range * nextPosition.offset, safe.left, parent.width - safe.right - dimensions.width),
      y: nextPosition.edge === 'top' ? safe.top : parent.height - safe.bottom - dimensions.height,
    }
    return {
      x: nextPosition.edge === 'left' ? safe.left : parent.width - safe.right - dimensions.width,
      y: clamp(safe.top + range * nextPosition.offset, safe.top, parent.height - safe.bottom - dimensions.height),
    }
  }
  const overlaps = (a, b) => a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y
  const toLocal = (rect, parent) => ({ x: rect.left - parent.left, y: rect.top - parent.top, width: rect.width, height: rect.height })
  // Статичные запрещённые зоны, применимые к данному краю. Кнопка «Скрыть листы» стоит на bottom:49 и перекрывается
  // нижней панелью в обоих состояниях листов; панель листов смещает только left/right (у bottom её отнимает инсет).
  const forbiddenZones = (parent, edge, safe) => {
    const zones = []
    const visible = el => el && el.offsetWidth && getComputedStyle(el).display !== 'none'
    const rect = el => toLocal(el.getBoundingClientRect(), parent)
    if (edge !== 'top') {
      const collapse = document.getElementById('sheetCollapse')
      if (visible(collapse)) zones.push(rect(collapse))
    }
    if (edge === 'left' || edge === 'right') {
      const chrome = document.querySelector('.sheet-chrome')
      const sheetsCollapsed = document.querySelector('.bottom-panel')?.classList.contains('is-collapsed')
      if (!sheetsCollapsed && visible(chrome) && rect(chrome).y + rect(chrome).height > safe.top) zones.push(rect(chrome))
    }
    return zones
  }
  const avoidForbidden = (resolved, edge, parent, dimensions, safe) => {
    for (const zone of forbiddenZones(parent, edge, safe)) {
      if (!overlaps(resolved, zone)) continue
      if (edge === 'top' || edge === 'bottom') {
        const min = safe.left
        const max = parent.width - safe.right - dimensions.width
        const before = zone.x - gap - dimensions.width
        const after = zone.x + zone.width + gap
        const choices = resolved.x < zone.x + zone.width / 2 ? [before, after] : [after, before]
        resolved.x = Math.max(min, Math.min(max, choices.find(value => value >= min && value <= max) ?? min))
      } else {
        const min = safe.top
        const max = parent.height - safe.bottom - dimensions.height
        const before = zone.y - gap - dimensions.height
        const after = zone.y + zone.height + gap
        const choices = resolved.y < zone.y + zone.height / 2 ? [before, after] : [after, before]
        resolved.y = Math.max(min, Math.min(max, choices.find(value => value >= min && value <= max) ?? min))
      }
    }
    return resolved
  }
  const resolvePanelCollision = (candidate, edge, cursor, parent, dimensions) => {
    const safe = effectiveInsets()
    const siblings = ['dashboardMinimapPanel', 'dashboardZoomPanel']
      .map(id => document.getElementById(id))
      .filter(item => item && item !== panel && item.offsetWidth && getComputedStyle(item).display !== 'none' && getComputedStyle(item).visibility !== 'hidden')
      .map(item => toLocal(item.getBoundingClientRect(), parent))
    const kpiPanel = document.getElementById('dashboardKpiSettings')
    if (panel.id !== 'dashboardKpiSettings' && kpiPanel?.classList.contains('is-open') && kpiPanel.offsetWidth) {
      siblings.push(toLocal(kpiPanel.getBoundingClientRect(), parent))
    }
    let resolved = { ...candidate, width: dimensions.width, height: dimensions.height }
    siblings.forEach(siblingRect => {
      if (!overlaps(resolved, siblingRect)) return
      if (edge === 'top' || edge === 'bottom') {
        const before = siblingRect.x - gap - dimensions.width
        const after = siblingRect.x + siblingRect.width + gap
        const min = safe.left
        const max = parent.width - safe.right - dimensions.width
        const preferBefore = cursor.x < siblingRect.x + siblingRect.width / 2
        const choices = preferBefore ? [before, after] : [after, before]
        resolved.x = Math.max(min, Math.min(max, choices.find(value => value >= min && value <= max) ?? min))
      } else {
        const before = siblingRect.y - gap - dimensions.height
        const after = siblingRect.y + siblingRect.height + gap
        const min = safe.top
        const max = parent.height - safe.bottom - dimensions.height
        const preferBefore = cursor.y < siblingRect.y + siblingRect.height / 2
        const choices = preferBefore ? [before, after] : [after, before]
        resolved.y = Math.max(min, Math.min(max, choices.find(value => value >= min && value <= max) ?? min))
      }
    })
    return avoidForbidden(resolved, edge, parent, dimensions, safe)
  }
  const offsetFromCoordinates = (edge, coords, parent, dimensions) => {
    const safe = effectiveInsets()
    const horizontal = edge === 'top' || edge === 'bottom'
    const range = horizontal
      ? parent.width - safe.left - safe.right - dimensions.width
      : parent.height - safe.top - safe.bottom - dimensions.height
    if (range <= 0) return 0
    return Math.max(0, Math.min(1, ((horizontal ? coords.x : coords.y) - (horizontal ? safe.left : safe.top)) / range))
  }
  const applyPosition = (animate = false) => {
    const parent = parentBounds()
    if (!parent || !panel.offsetWidth) return
    const dimensions = dimensionsFor(position.edge)
    const coords = coordinatesFor(position, parent, dimensions)
    const cursor = { x: coords.x + dimensions.width / 2, y: coords.y + dimensions.height / 2 }
    const resolved = resolvePanelCollision(coords, position.edge, cursor, parent, dimensions)
    panel.style.transition = animate ? 'left 160ms ease-out,top 160ms ease-out,opacity 120ms ease' : ''
    Object.assign(panel.style, { left: `${resolved.x}px`, top: `${resolved.y}px`, right: 'auto', bottom: 'auto' })
  }
  const move = event => {
    if (!drag) return
    const safe = effectiveInsets()
    const relX = event.clientX - drag.parent.left
    const relY = event.clientY - drag.parent.top
    const distances = {
      top: Math.abs(relY - safe.top),
      right: Math.abs(drag.parent.width - safe.right - relX),
      bottom: Math.abs(drag.parent.height - safe.bottom - relY),
      left: Math.abs(relX - safe.left),
    }
    const previewEdge = Object.entries(distances).sort((a, b) => a[1] - b[1])[0][0]
    const horizontalEdge = previewEdge === 'top' || previewEdge === 'bottom'
    const availableDimension = horizontalEdge
      ? drag.parent.height - safe.top - safe.bottom
      : drag.parent.width - safe.left - safe.right
    const inOrientationZone = distances[previewEdge] < availableDimension * .3
    const displayEdge = panel.id === 'dashboardZoomPanel' && inOrientationZone ? previewEdge : position.edge
    if (displayEdge !== drag.previewEdge) {
      drag.previewEdge = displayEdge
      const dimensions = dimensionsFor(displayEdge)
      drag.width = dimensions.width
      drag.height = dimensions.height
      drag.offsetX = dimensions.width / 2
      drag.offsetY = dimensions.height / 2
      panel.classList.remove('is-orientation-changing')
      void panel.offsetWidth
      panel.classList.add('is-orientation-changing')
    }
    let x = Math.max(safe.left, Math.min(drag.parent.width - safe.right - drag.width, relX - drag.offsetX))
    let y = Math.max(safe.top, Math.min(drag.parent.height - safe.bottom - drag.height, relY - drag.offsetY))
    // Во время перетаскивания панель идёт за курсором; расхождение с соседями решаем только на отпускании (finish).
    Object.assign(panel.style, { left: `${x}px`, top: `${y}px`, right: 'auto', bottom: 'auto' })
  }
  const finish = event => {
    if (!drag) return
    const safe = effectiveInsets()
    const relX = event.clientX - drag.parent.left
    const relY = event.clientY - drag.parent.top
    const distances = {
      top: Math.abs(relY - safe.top),
      right: Math.abs(drag.parent.width - safe.right - relX),
      bottom: Math.abs(drag.parent.height - safe.bottom - relY),
      left: Math.abs(relX - safe.left),
    }
    const edge = Object.entries(distances).sort((a, b) => a[1] - b[1])[0][0]
    const dimensions = dimensionsFor(edge)
    const rawPosition = { edge, offset: edge === 'top' || edge === 'bottom'
      ? Math.max(0, Math.min(1, (relX - dimensions.width / 2 - safe.left) / Math.max(1, drag.parent.width - safe.left - safe.right - dimensions.width)))
      : Math.max(0, Math.min(1, (relY - dimensions.height / 2 - safe.top) / Math.max(1, drag.parent.height - safe.top - safe.bottom - dimensions.height))) }
    const candidate = coordinatesFor(rawPosition, drag.parent, dimensions)
    const resolved = resolvePanelCollision(candidate, edge, { x: relX, y: relY }, drag.parent, dimensions)
    position = { edge, offset: offsetFromCoordinates(edge, resolved, drag.parent, dimensions) }
    try { handle.releasePointerCapture?.(event.pointerId) } catch (_) {}
    panel.classList.remove('is-moving', 'is-orientation-changing')
    applyPosition(true)
    try { localStorage.setItem(storageKey, JSON.stringify(position)) } catch (_) {}
    drag = null
  }
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button')) return
    const parent = parentBounds()
    const bounds = panel.getBoundingClientRect()
    if (!parent || !bounds.width) return
    panel.style.transition = ''
    drag = { parent, width: bounds.width, height: bounds.height, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top, previewEdge: position.edge }
    panel.classList.add('is-moving')
    if (panel.id === 'dashboardZoomPanel') {
      document.getElementById('zoomPopover')?.classList.remove('is-open')
      document.getElementById('zoomPopover')?.setAttribute('aria-hidden', 'true')
      document.getElementById('zoomMenuTrigger')?.setAttribute('aria-expanded', 'false')
    }
    try { handle.setPointerCapture?.(event.pointerId) } catch (_) {}
    event.preventDefault()
  })
  handle.addEventListener('pointermove', move)
  handle.addEventListener('pointerup', finish)
  handle.addEventListener('pointercancel', event => {
    if (!drag) return
    try { handle.releasePointerCapture?.(event.pointerId) } catch (_) {}
    panel.classList.remove('is-moving', 'is-orientation-changing')
    drag = null
    applyPosition(true)
  })
  dashboardFloatingRefreshers.push(animate => applyPosition(animate))
  if (panel.parentElement) new ResizeObserver(() => applyPosition(false)).observe(panel.parentElement)
}

// Перепозиционировать плавающие панели (например, когда панель масштаба должна опуститься после сворачивания листов).
function refreshFloatingDashboardPanels(animate = false) {
  dashboardFloatingRefreshers.forEach(refresh => refresh(animate))
}

function bindDashboardAdvancedInteractions() {
  const minimap = document.getElementById('dashboardMinimapMap')
  bindFloatingDashboardPanel(document.getElementById('dashboardMinimapPanel'), document.querySelector('#dashboardMinimapPanel [data-floating-drag-handle]'), 'grafio-dashboard-minimap-position-v2', { edge: 'right', offset: .66 })
  bindFloatingDashboardPanel(document.getElementById('dashboardZoomPanel'), document.querySelector('#dashboardZoomPanel [data-floating-drag-handle]'), 'grafio-dashboard-zoom-position-v2', { edge: 'bottom', offset: .96 })
  let minimapDrag = null
  minimap.addEventListener('pointerdown', event => {
    if (!event.target.closest('#dashboardMinimapViewport')) return
    minimapDrag = { x: event.clientX, y: event.clientY, camera: { ...dashboardCamera }, geometry: dashboardMinimapGeometry }
    try { minimap.setPointerCapture?.(event.pointerId) } catch (_) {}
    event.preventDefault()
  })
  minimap.addEventListener('pointermove', event => {
    if (!minimapDrag) return
    const bounds = minimap.getBoundingClientRect()
    const [, , viewWidth, viewHeight] = minimapDrag.geometry.viewBox
    const worldDx = (event.clientX - minimapDrag.x) / bounds.width * viewWidth
    const worldDy = (event.clientY - minimapDrag.y) / bounds.height * viewHeight
    dashboardCamera.x = minimapDrag.camera.x - worldDx * dashboardCamera.zoom
    dashboardCamera.y = minimapDrag.camera.y - worldDy * dashboardCamera.zoom
    applyDashboardCamera()
  })
  minimap.addEventListener('pointerup', () => { minimapDrag = null })
  minimap.addEventListener('pointercancel', () => { minimapDrag = null })
  minimap.addEventListener('click', event => {
    if (!dashboardMinimapGeometry || event.target.closest('#dashboardMinimapViewport')) return
    const bounds = minimap.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width * dashboardMinimapGeometry.mapWidth
    const y = (event.clientY - bounds.top) / bounds.height * dashboardMinimapGeometry.mapHeight
    dashboardCamera = minimapPointToCamera(x, y, dashboardMinimapGeometry, dashboardCamera, dashboardViewportSize())
    applyDashboardCamera()
  })

  document.getElementById('dashboardEmptyState').addEventListener('click', event => {
    const action = event.target.closest('[data-empty-action]')?.dataset.emptyAction
    if (action === 'kpi') openDashboardKpiEditor()
    if (action === 'chart') openDashboardChartEditor()
    if (action === 'copy') {
      const menu = document.getElementById('copySourceMenu')
      if (menu.classList.contains('is-open')) closeCopySourceMenu()
      else openCopySourceMenu(event.target.closest('[data-empty-action="copy"]'))
    }
  })

  document.getElementById('copySourceMenu').addEventListener('click', event => {
    const button = event.target.closest('[data-copy-source]')
    if (!button) return
    const source = dashboardSheets.find(sheet => sheet.id === button.dataset.copySource)
    closeCopySourceMenu()
    if (!source) return
    const count = source.model.widgets.length
    const stamp = Date.now()
    // Копия получает собственные id: виджеты двух листов не должны скрещиваться, иначе
    // выделение, заметки и Undo будут указывать на карточку другого листа.
    activeDashboardModel().replace(source.model.widgets.map((widget, index) => ({ ...widget, id: `dash-copy-${stamp}-${index}` })))
    clearDashboardSelection()
    renderDashboard()
    showToast('Виджеты скопированы', `${count} ${pluralizeDashboard(count, ['виджет', 'виджета', 'виджетов'])} с листа «${source.name}»`)
  })

  const kpiMetricListEl = document.getElementById('kpiMetricList')
  kpiMetricListEl.addEventListener('click', event => {
    if (!kpiEditorState) return
    const favorite = event.target.closest('[data-kpi-fav]')
    if (favorite) {
      toggleKpiFavorite(favorite.dataset.kpiFav)
      return
    }
    const tag = event.target.closest('[data-kpi-metric]')
    if (tag) {
      if (!tag.disabled) toggleKpiMetric(tag.dataset.kpiMetric)
      return
    }
    const option = event.target.closest('.kpi-metric-option')
    if (option?.dataset.kpiBase) toggleKpiCluster(option.dataset.kpiBase)
  })
  kpiMetricListEl.addEventListener('pointerover', event => {
    const tip = event.target.closest('[data-tooltip]')
    if (tip) showTooltip(tip)
  })
  kpiMetricListEl.addEventListener('pointerout', event => {
    const tip = event.target.closest('[data-tooltip]')
    if (tip && !tip.contains(event.relatedTarget)) hideTooltip()
  })
  kpiMetricListEl.addEventListener('focusin', event => {
    const tip = event.target.closest('[data-tooltip]')
    if (tip) showTooltip(tip)
  })
  kpiMetricListEl.addEventListener('focusout', hideTooltip)
  document.getElementById('kpiMetricSearch').addEventListener('input', event => renderKpiMetricList(event.target.value))
  document.getElementById('kpiMetricFilter').addEventListener('click', event => {
    const button = event.target.closest('[data-kpi-filter]')
    if (!button) return
    kpiMetricFilter = button.dataset.kpiFilter
    renderKpiMetricList(document.getElementById('kpiMetricSearch').value)
  })
  document.getElementById('kpiCustomTitle').addEventListener('input', updateKpiEditorPreview)
  document.getElementById('kpiSettingsApply').addEventListener('click', applyDashboardKpiEditor)
  document.getElementById('kpiSettingsClose').addEventListener('click', closeDashboardKpiEditor)
  document.getElementById('kpiSettingsCancel').addEventListener('click', closeDashboardKpiEditor)

  // Панель графиков — близнец панели KPI: свои строки, свой фильтр и своё поле названия, а
  // предпросмотр, закрытие и «Применить» общие — открыта всегда только одна из двух панелей.
  const chartMetricListEl = document.getElementById('chartMetricList')
  chartMetricListEl.addEventListener('click', event => {
    if (!kpiEditorState) return
    const favorite = event.target.closest('[data-chart-fav]')
    if (favorite) {
      toggleChartFavorite(favorite.dataset.chartFav)
      return
    }
    const option = event.target.closest('[data-chart-key]')
    if (option) toggleChartSelection(option.dataset.chartKey)
  })
  chartMetricListEl.addEventListener('pointerover', event => {
    const tip = event.target.closest('[data-tooltip]')
    if (tip) showTooltip(tip)
  })
  chartMetricListEl.addEventListener('pointerout', event => {
    const tip = event.target.closest('[data-tooltip]')
    if (tip && !tip.contains(event.relatedTarget)) hideTooltip()
  })
  chartMetricListEl.addEventListener('focusin', event => {
    const tip = event.target.closest('[data-tooltip]')
    if (tip) showTooltip(tip)
  })
  chartMetricListEl.addEventListener('focusout', hideTooltip)
  document.getElementById('chartMetricSearch').addEventListener('input', event => renderChartMetricList(event.target.value))
  document.getElementById('chartMetricFilter').addEventListener('click', event => {
    const button = event.target.closest('[data-chart-filter]')
    if (!button) return
    chartMetricFilter = button.dataset.chartFilter
    renderChartMetricList(document.getElementById('chartMetricSearch').value)
  })
  document.getElementById('chartCustomTitle').addEventListener('input', updateKpiEditorPreview)
  document.getElementById('chartSettingsApply').addEventListener('click', applyDashboardKpiEditor)
  document.getElementById('chartSettingsClose').addEventListener('click', closeDashboardKpiEditor)
  document.getElementById('chartSettingsCancel').addEventListener('click', closeDashboardKpiEditor)

  // Превью-стопка: затемнение закрывает редактор, лист — свайп и колесо (как в BuilderPreview).
  const kpiPreviewArea = document.getElementById('kpiPreviewArea')
  const kpiPreviewDrag = { startY: 0, currentY: 0, active: false }
  let kpiPreviewWheelAt = 0
  document.getElementById('kpiEditorScrim').addEventListener('click', closeDashboardKpiEditor)
  document.getElementById('kpiPreviewDots').addEventListener('click', event => {
    const dot = event.target.closest('[data-preview-dot]')
    if (!dot || !kpiEditorState) return
    kpiEditorState.activeIndex = Number(dot.dataset.previewDot)
    applyKpiPreviewTransform()
  })
  // Колонка обрезана overflow:clip — не скролл-контейнер, так что окно за фокусом само не
  // подводится и делаем это мы. Но только когда метка и правда не влезает: окно, сдвинутое между
  // mousedown и mouseup, уходит из-под указателя, и клик по метке перестаёт регистрироваться.
  document.getElementById('kpiPreviewDots').addEventListener('focusin', event => {
    const dot = event.target.closest('[data-preview-dot]')
    if (dot && !isKpiPreviewDotVisible(dot)) moveKpiPreviewDotsTo(Number(dot.dataset.previewDot), { glide: true })
  })
  kpiPreviewArea.addEventListener('pointerdown', event => {
    if (!kpiEditorState || kpiEditorState.selectedKeys.length < 2 || event.target.closest('[data-preview-dot]')) return
    kpiPreviewDrag.active = true
    kpiPreviewDrag.startY = event.clientY
    kpiPreviewDrag.currentY = event.clientY
    kpiPreviewArea.classList.add('is-dragging')
    try { kpiPreviewArea.setPointerCapture(event.pointerId) } catch { /* синтетический указатель без активного pointerId */ }
  })
  kpiPreviewArea.addEventListener('pointermove', event => {
    if (kpiPreviewDrag.active) kpiPreviewDrag.currentY = event.clientY
  })
  const endKpiPreviewDrag = event => {
    if (!kpiPreviewDrag.active) return
    kpiPreviewDrag.active = false
    kpiPreviewArea.classList.remove('is-dragging')
    if (kpiPreviewArea.hasPointerCapture(event.pointerId)) kpiPreviewArea.releasePointerCapture(event.pointerId)
    const delta = kpiPreviewDrag.startY - kpiPreviewDrag.currentY
    if (delta > 30) stepKpiPreview(1)
    else if (delta < -30) stepKpiPreview(-1)
  }
  kpiPreviewArea.addEventListener('pointerup', endKpiPreviewDrag)
  kpiPreviewArea.addEventListener('pointercancel', endKpiPreviewDrag)
  kpiPreviewArea.addEventListener('lostpointercapture', endKpiPreviewDrag)
  kpiPreviewArea.addEventListener('wheel', event => {
    if (!kpiEditorState || kpiEditorState.selectedKeys.length < 2) return
    event.preventDefault()
    if (Math.abs(event.deltaY) < 10 || Date.now() - kpiPreviewWheelAt < 150) return
    kpiPreviewWheelAt = Date.now()
    stepKpiPreview(event.deltaY > 0 ? 1 : -1)
  }, { passive: false })

  const zoomTrigger = document.getElementById('zoomMenuTrigger')
  const zoomPopover = document.getElementById('zoomPopover')
  const closeZoomPopover = () => {
    zoomPopover.classList.remove('is-open')
    zoomPopover.setAttribute('aria-hidden', 'true')
    zoomTrigger.setAttribute('aria-expanded', 'false')
  }
  zoomTrigger.addEventListener('click', event => {
    event.stopPropagation()
    const open = !zoomPopover.classList.contains('is-open')
    closeZoomPopover()
    if (open) {
      zoomPopover.classList.add('is-open')
      zoomPopover.setAttribute('aria-hidden', 'false')
      zoomTrigger.setAttribute('aria-expanded', 'true')
    }
  })
  zoomPopover.addEventListener('click', event => {
    const preset = event.target.closest('[data-zoom-preset]')
    const action = event.target.closest('[data-zoom-action]')?.dataset.zoomAction
    if (preset) setDashboardZoom(Number(preset.dataset.zoomPreset))
    if (action === 'fit') fitDashboard()
    if (action === 'reset') setDashboardZoom(100)
    if (preset || action) closeZoomPopover()
  })
  document.addEventListener('click', event => {
    if (!event.target.closest('#zoomPopover,#zoomMenuTrigger')) closeZoomPopover()
  })

  const iconPageHandler = event => {
    const dot = event.target.closest('[data-icon-page]')
    if (!dot) return false
    if (!event.target.isConnected) return true
    // Сетка перерисовывается на месте, мишень выпадает из DOM — наружный «клик вне слоя»
    // по отсоединённой точке не узнал бы слой и закрыл бы его вместе с листанием.
    event.stopPropagation()
    setSheetIconPage(Number(dot.dataset.iconPage))
    return true
  }

  const iconChoiceHandler = event => {
    const tile = event.target.closest('[data-icon-choice]')
    if (!tile) return false
    if (!event.target.isConnected) return true
    // Тайл после выбора перерисовывается и выпадает из DOM: наружный «клик вне слоя»
    // по отсоединённой мишени свернул бы слой вместе с выбором.
    event.stopPropagation()
    setDashboardSheetIcon(tile.dataset.iconSheet, tile.dataset.iconChoice)
    return true
  }

  // Свайп по слою листает страницы тем же жестом, что и в оригинальных каруселях.
  // Временные слушатели висят только на время жеста и снимаются на pointerup/cancel (§10),
  // смещение считается в rAF, а по итогам сетка пересобирается в любом случае — иначе
  // клик, сорванный на боковом движении, выбрал бы значок.
  let sheetIconDragged = false
  // Отпущенный после свайпа указатель даёт «клик» там, где он оказался: по пустому месту
  // слоя, по соседней строке списка или вне слоя вовсе — и наружные «клики вне панели»
  // свернули бы слой вместе с листанием. Снимаем этот клик на захвате document, раньше
  // любого обработчика слоёв и наружных closers; следующий pointerdown флаг гасит, если
  // жест закончился за пределами документа и клика не было вовсе.
  document.addEventListener('pointerdown', () => { sheetIconDragged = false }, true)
  document.addEventListener('click', event => {
    if (!sheetIconDragged) return
    sheetIconDragged = false
    event.stopPropagation()
  }, true)
  const bindSheetIconSwipe = host => {
    host.addEventListener('pointerdown', event => {
      if (event.button || SHEET_ICON_PAGES < 2) return
      // Тянем за любой участок слоя, а не только за сетку: между тайлами, по шапке и по
      // точкам жест тот же.
      const grid = host.querySelector('.sheet-icon-grid')
      if (!grid) return
      const startX = event.clientX
      const startY = event.clientY
      let offset = 0
      let frame = 0
      let axis = 0
      let moved = false
      const forbidDrag = event => event.preventDefault()
      const move = pointer => {
        const dx = pointer.clientX - startX
        const dy = pointer.clientY - startY
        if (!moved && Math.max(Math.abs(dx), Math.abs(dy)) > 10) moved = true
        // Направление фиксируем один раз, но не по первому движению: первые пиксели реального
        // жеста почти всегда косые, и блокировка на выборке 6×8 убила бы весь свайп (жест
        // ушёл бы в прокрутку и больше не переспрашивал). Ждём выборку, где одна ось ведёт
        // в полтора раза, а после 24 px берём что есть — иначе диагональный жест так и не
        // определился бы никогда.
        if (!axis) {
          const x = Math.abs(dx)
          const y = Math.abs(dy)
          if (x < 5 && y < 5) return
          if (x >= y * 1.5) axis = 1
          else if (y >= x * 1.5) axis = -1
          else if (x > 24 || y > 24) axis = x > y ? 1 : -1
          else return
        }
        // Вертикаль — прокрутка списка: сетку не двигаем, но жест не бросаем, чтобы в up()
        // увидеть, как далеко уходил курсор, и не считать такое движение кликом.
        if (axis < 0) return
        const first = sheetIconPage === 0
        const last = sheetIconPage === SHEET_ICON_PAGES - 1
        offset = (first && dx > 0) || (last && dx < 0) ? dx * 0.35 : dx
        if (frame) return
        frame = requestAnimationFrame(() => {
          frame = 0
          grid.style.transform = `translateX(${offset}px)`
        })
      }
      const finish = upEvent => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', cancel)
        window.removeEventListener('dragstart', forbidDrag)
        if (frame) cancelAnimationFrame(frame)
        grid.classList.remove('is-dragging')
        grid.style.transform = ''
        // Клик (указатель не уходил дальше 10 px) не пересобираем: сетка перерисованная,
        // мишень отсоединена — и выбор значка не дошёл бы до обработчика слоя. А любое
        // движение поверх клика пересобираем: оно снимает выбор с оторванной мишени (см.
        // isConnected в обработчиках слоя) и, если сетку дотянули до порога, листает страницу.
        if (!moved) return
        sheetIconDragged = true
        // Быстрый жест обрывается рывком: последний pointermove может отстать от указателя на
        // десятки пикселей, поэтому финальное смещение добираем из события отпускания.
        const dx = upEvent && axis > 0 ? upEvent.clientX - startX : offset
        // Порог — 10 % ширины сетки, но не меньше 16 px, плюс отдельная ветка по скорости:
        // взмах в 400 px/с с 15 px пути листает, а медленное движение на тех же 15 px — нет.
        // Скорость берём средняя за весь жест (px/мс): мгновенная по первому movement делится
        // на почти нулевой интервал и завышается так, что листал бы даже медленный drag.
        const reach = Math.max(16, grid.clientWidth * 0.1)
        const span = Math.max(1, ((upEvent && upEvent.timeStamp) || performance.now()) - event.timeStamp)
        const flicked = Math.abs(dx) / span > 0.4 && Math.abs(dx) > 12
        const shift = (Math.abs(dx) > reach || flicked) ? (dx < 0 ? 1 : -1) : 0
        if (!setSheetIconPage(sheetIconPage + shift, shift)) renderSheetIconLayer(0)
      }
      // pointercancel — жест оборвался (его перехватил браузер): листок отправлять нельзя,
      // поэтому offset обнуляем до finish(), а пересборка всё равно решает moved.
      const cancel = () => {
        offset = 0
        finish()
      }
      const up = finish
      grid.classList.add('is-dragging')
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', cancel)
      // Движение мышью поверх оставленного ранее выделения браузер читает как «перенос
      // текста»: даёт dragstart и срывает наш жест pointercancel — листания не происходит.
      // Пока жест наш, нативный перенос запрещаем.
      window.addEventListener('dragstart', forbidDrag)
    })

    // Тачпад отдаёт взмах горсткой мелких wheel-событий: дельты копим, а листок отправляем
    // один раз на жест и замолкаем на 300 мс, иначе длинное движение промотало бы страницы.
    // Вертикальное колесо не перехватываем — под слоем прокручивается то, что и так крутится.
    // Знак берём как у прокрутки, а не как у перетаскивания: deltaX>0 означает «крутим
    // вправо», то есть к следующей странице, — системная «естественная прокрутка» разворачивает
    // его сама, и свайп перестаёт быть инвертированным относительно жеста мышью.
    let wheelX = 0
    let wheelIdle = 0
    let wheelLock = 0
    host.addEventListener('wheel', event => {
      if (SHEET_ICON_PAGES < 2 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      const now = performance.now()
      if (now < wheelLock) return
      if (now > wheelIdle) wheelX = 0
      wheelIdle = now + 180
      wheelX += event.deltaX
      if (Math.abs(wheelX) < 45) return
      const shift = wheelX > 0 ? 1 : -1
      wheelX = 0
      wheelLock = now + 300
      setSheetIconPage(sheetIconPage + shift, shift)
    }, { passive: false })
  }
  /* Имя значка пишет шапка слоя — при наведении мышью и при фокусе с клавиатуры, в трёх
     слоях одинаково. Делегированием на слое: сетка пересобирается на каждый выбор и
     перелистывание, и навешивать слушатели на тайлы пришлось бы заново после пересборки. */
  const bindSheetIconLayerName = host => {
    const fromEvent = event => paintSheetIconLayerName(host, event.target.closest('[data-icon-choice]'))
    host.addEventListener('pointerover', fromEvent)
    host.addEventListener('focusin', fromEvent)
    // Уход курсора и уход фокуса сбрасывают подпись в имя листа без пересчёта по :hover:
    // в момент pointerleave состояние наведения ещё может принадлежать старому тайлу.
    host.addEventListener('pointerleave', () => paintSheetIconLayerName(host))
    host.addEventListener('focusout', () => paintSheetIconLayerName(host))
  }
  ;['#sheetMenuIcons', '#sheetIconPopover', '#sheetIconBand'].forEach(selector => {
    const host = document.querySelector(selector)
    if (!host) return
    bindSheetIconSwipe(host)
    bindSheetIconLayerName(host)
  })

  document.getElementById('sheetContextMenu').addEventListener('click', event => {
    if (iconPageHandler(event) || iconChoiceHandler(event)) return
    const action = event.target.closest('[data-sheet-action]')?.dataset.sheetAction
    const id = sheetMenuTargetId
    if (!action || !id) return
    if (action === 'rename') startDashboardSheetRename(id)
    if (action === 'duplicate') duplicateDashboardSheet(id)
    if (action === 'default') makeDashboardSheetDefault(id)
    if (action === 'delete') deleteDashboardSheet(id)
    if (action === 'icon') showSheetMenuDrill(true)
    if (action === 'icon-back') showSheetMenuDrill(false)
  })

  document.getElementById('sheetIconPopover').addEventListener('click', (event => {
    iconPageHandler(event)
    iconChoiceHandler(event)
  }))

  const band = document.getElementById('sheetIconBand')
  band.addEventListener('click', event => {
    if (iconPageHandler(event) || iconChoiceHandler(event)) return
    // Полоса накрывает строки списка ниже триггера: пока она открыта, до них не достучаться.
    // Клик по пустому месту слоя сворачивает полосу — иначе список кажется нерабочим, пока
    // не нажмёшь Esc.
    if (!event.target.closest('.sheet-icon-grid')) closeSheetIconFold()
  })
}
