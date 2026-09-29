const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const {
  WEEKLY_ANALYTICS_TABS,
  WEEKLY_ANALYTICS_CHARTS,
  chartsForTab,
  metricLabel,
  allowedUnits,
  summariesForChart,
  WEEKLY_CONTEXT_TRENDS,
} = require('./weekly-analytics.js')

function test(name, run) {
  try {
    run()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    throw error
  }
}

test('шрифты прототипа доступны по локальным стабильным путям', () => {
  const prototypeDir = __dirname
  const stylesheet = fs.readFileSync(path.join(prototypeDir, 'styles.css'), 'utf8')
  const fontUrls = [...stylesheet.matchAll(/src:url\('([^']+\.woff2)'\)/g)].map(match => match[1])
  assert.deepEqual(fontUrls, ['./fonts/Geist-Variable.woff2', './fonts/GeistMono-Variable.woff2'])
  assert.ok(fontUrls.every(url => fs.existsSync(path.resolve(prototypeDir, url))))
})

test('текст SVG-графиков не наследует обводку иконок', () => {
  const stylesheet = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8')
  assert.match(stylesheet, /\.analytics-svg text\{stroke:none/)
  assert.doesNotMatch(stylesheet, /\.analytics-point-value\{[^}]*paint-order:stroke/)
})

test('навигация недельной аналитики стоит в начале отчёта', () => {
  const markup = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
  assert.ok(markup.indexOf('class="weekly-analytics-heading"') < markup.indexOf('id="qualityStrip"'))
})

test('лента содержит весь расширенный набор графиков в утверждённом порядке', () => {
  assert.deepEqual(WEEKLY_ANALYTICS_TABS.map(tab => tab.id), ['feed', 'finance', 'orders', 'logistics', 'ads', 'search'])
  assert.deepEqual(chartsForTab('feed').map(chart => chart.id), [
    'structure',
    'margin-cost',
    'orders-money',
    'orders-qty',
    'buyout-rate',
    'delivery-time',
    'local-orders',
    'logistics-split',
    'organic-paid',
    'drr-bases',
    'drr-models',
    'search-cr',
    'average-values',
  ])
})

test('тематическая вкладка показывает только связанные с ней графики', () => {
  assert.deepEqual(chartsForTab('logistics').map(chart => chart.id), ['delivery-time', 'local-orders', 'logistics-split'])
  assert.deepEqual(chartsForTab('search').map(chart => chart.id), ['search-cr', 'average-values'])
})

test('маржа в процентах называется маржинальностью', () => {
  assert.equal(metricLabel('margin', 'money'), 'Маржа')
  assert.equal(metricLabel('margin', 'percent'), 'Маржинальность')
  assert.equal(metricLabel('cost', 'percent'), 'Доля себестоимости')
})

test('каждый график имеет пять согласованных недель и допустимую единицу по умолчанию', () => {
  for (const chart of WEEKLY_ANALYTICS_CHARTS.filter(chart => chart.id !== 'structure')) {
    assert.equal(chart.points.length, 5, chart.id)
    assert.ok(allowedUnits(chart).includes(chart.defaultUnit), chart.id)
    assert.ok(chart.series.length >= 1, chart.id)
    assert.ok(chart.points.every(point => typeof point.week === 'string'), chart.id)
  }
})

test('штрафы доступны как контекстная недельная динамика из детализации расходов', () => {
  assert.equal(WEEKLY_CONTEXT_TRENDS.penalties.title, 'Штрафы')
  assert.equal(WEEKLY_CONTEXT_TRENDS.penalties.points.length, 5)
  assert.ok(WEEKLY_CONTEXT_TRENDS.penalties.points.every(point => Number.isFinite(point.money) && Number.isFinite(point.percent)))
})

test('заказы, выкупы и маржа собраны в один график с тремя изменениями', () => {
  const chart = WEEKLY_ANALYTICS_CHARTS.find(item => item.id === 'orders-money')
  assert.equal(chart.type, 'line')
  assert.equal(chart.note, undefined)
  assert.equal(chart.series.length, 3)

  const summaries = summariesForChart(chart, 'money')
  assert.deepEqual(summaries.map(item => item.key), ['orders', 'buyouts', 'margin'])
  assert.deepEqual(summaries.map(item => item.delta), [138000, 183286, 103967])
  assert.ok(summaries.every(item => item.direction === 'up'))
})

test('графики используют линейный, площадной и столбчатый типы по смыслу метрик', () => {
  const types = Object.fromEntries(WEEKLY_ANALYTICS_CHARTS.map(chart => [chart.id, chart.type]))
  assert.equal(types['margin-cost'], 'area')
  assert.equal(types['orders-money'], 'line')
  assert.equal(types['orders-qty'], 'bars')
  assert.equal(types['logistics-split'], 'bars')
  assert.equal(types['organic-paid'], 'area')
  assert.equal(types['drr-models'], 'bars')
  assert.equal(types['average-values'], 'bars')
})
