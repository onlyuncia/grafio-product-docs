const categories = [
  { key: 'margin', label: 'Маржа', color: 'var(--margin)' },
  { key: 'cost', label: 'Себестоимость', color: 'var(--cost)' },
  { key: 'commission', label: 'Комиссия', color: 'var(--commission)' },
  { key: 'logistics', label: 'Прямая логистика', color: 'var(--logistics)' },
  { key: 'marketing', label: 'Трейд-маркетинг', color: 'var(--marketing)' },
  { key: 'acquiring', label: 'Эквайринг', color: 'var(--acquiring)' },
  { key: 'other', label: 'Прочие расходы', color: 'var(--other)' },
]

const weeks = [
  { label: '30 мар. – 5 апр.', buyouts: 812023, margin: 15.8, cost: 31.4, commission: 18.0, logistics: 23.8, marketing: 7.1, acquiring: 2.7, other: 1.2 },
  { label: '6–12 апр.', buyouts: 727895, margin: 13.8, cost: 31.8, commission: 17.5, logistics: 25.9, marketing: 7.6, acquiring: 2.7, other: 0.7 },
  { label: '13–19 апр.', buyouts: 773895, margin: 16.2, cost: 31.7, commission: 17.5, logistics: 22.6, marketing: 7.9, acquiring: 2.7, other: 1.4 },
  { label: '20–26 апр.', buyouts: 1207148, margin: 18.3, cost: 31.0, commission: 17.4, logistics: 20.9, marketing: 5.8, acquiring: 2.9, other: 3.7 },
  { label: '27 апр. – 3 мая', buyouts: 1390434, margin: 23.4, cost: 30.4, commission: 17.4, logistics: 17.8, marketing: 7.4, acquiring: 3.0, other: 0.6 },
]

const categoryDetails = {
  margin: { title: 'Маржа', subtitle: '324 875 ₽ · 23,4% выкупов', rows: [['Платья', '—', '188 430 ₽', '+42,1%'], ['Блузы', '—', '64 210 ₽', '+18,7%'], ['Юбки', '—', '43 875 ₽', '+6,2%'], ['Прочие', '—', '28 360 ₽', '−1,8%']] },
  cost: { title: 'Себестоимость', subtitle: '422 106 ₽ · 30,4% выкупов', rows: [['Платье миди', '428', '138 204 ₽', '+8,1%'], ['Платье вечернее', '255', '96 180 ₽', '+12,4%'], ['Блуза базовая', '311', '74 640 ₽', '+3,7%'], ['Прочие товары', '614', '113 082 ₽', '+5,9%']] },
  commission: { title: 'Комиссия маркетплейса', subtitle: '241 936 ₽ · 17,4% выкупов', rows: [['Платья', '683', '130 476 ₽', '+17,2%'], ['Блузы', '311', '47 160 ₽', '+6,1%'], ['Юбки', '203', '32 850 ₽', '+4,2%'], ['Прочие', '415', '31 450 ₽', '+2,7%']] },
  logistics: { title: 'Прямая логистика', subtitle: '247 498 ₽ · 17,8% выкупов', rows: [['Платье миди', '428', '78 632 ₽', '−18,4%'], ['Платье вечернее', '255', '61 455 ₽', '−9,7%'], ['Блуза базовая', '311', '43 540 ₽', '−4,8%'], ['Прочие товары', '618', '63 871 ₽', '+1,2%']] },
  marketing: { title: 'Трейд-маркетинг', subtitle: '102 890 ₽ · 7,4% выкупов', rows: [['Платье миди', '164', '34 220 ₽', '+7,5%'], ['Платье вечернее', '108', '29 410 ₽', '+11,2%'], ['Блуза базовая', '95', '18 860 ₽', '−2,4%'], ['Прочие товары', '140', '20 400 ₽', '+3,1%']] },
  acquiring: { title: 'Эквайринг', subtitle: '41 713 ₽ · 3,0% выкупов', rows: [['Продажи', '1 612', '47 100 ₽', '+18,8%'], ['Возвраты', '364', '−5 387 ₽', '+9,2%']] },
  other: { title: 'Прочие расходы', subtitle: '8 344 ₽ · 0,6% выкупов', rows: [['Штрафы', '3', '4 920 ₽', 'Открыть динамику'], ['Хранение', '18', '1 660 ₽', 'Новая статья'], ['Платная приёмка', '4', '764 ₽', '0%'], ['Утилизация', '2', '1 000 ₽', '+2 операции']] },
  penalties: { title: 'Штрафы', subtitle: '4 920 ₽ · 0,35% выкупов', rows: [['Штраф МП', '1', '2 900 ₽', 'Новая операция'], ['Корректировка рейтинга', '1', '1 200 ₽', '+1 операция'], ['Прочие штрафы', '1', '820 ₽', '−26,8%']] },
}

let unit = 'percent'
let modalReturnFocus = null
let tooltipTimer = null

function formatMoney(value) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`
}

function categoryLabel(item) {
  return item.key === 'margin' && unit === 'percent' ? 'Маржинальность' : item.label
}

function renderLegend() {
  const legend = document.getElementById('chartLegend')
  legend.innerHTML = categories.map(item => `<button data-category="${item.key}"><i style="background:${item.color}"></i>${categoryLabel(item)}</button>`).join('')
  legend.querySelectorAll('button').forEach(button => button.addEventListener('click', () => openDetails(button.dataset.category)))
}

function renderChart() {
  const chart = document.getElementById('stackChart')
  chart.innerHTML = weeks.map((week, index) => {
    const segments = categories.map(item => {
      const share = week[item.key]
      const amount = week.buyouts * share / 100
      const label = unit === 'percent' ? `${share.toFixed(1).replace('.', ',')}%` : amount > 70000 ? `${Math.round(amount / 1000)}k` : ''
      return `<button class="bar-segment" data-category="${item.key}" data-tooltip="${categoryLabel(item)}: ${share.toFixed(1).replace('.', ',')}% · ${formatMoney(amount)}" style="height:${share}%;background:${item.color}">${share >= 7 ? `<span>${label}</span>` : ''}</button>`
    }).join('')
    return `<div class="week-column ${index === weeks.length - 1 ? 'current' : ''}"><div class="week-bar">${segments}</div><span class="week-label">${week.label}</span></div>`
  }).join('')
  chart.querySelectorAll('.bar-segment').forEach(segment => {
    segment.addEventListener('click', () => openDetails(segment.dataset.category))
    segment.addEventListener('pointerenter', () => showTooltip(segment))
    segment.addEventListener('pointerleave', hideTooltip)
    segment.addEventListener('focus', () => showTooltip(segment))
    segment.addEventListener('blur', hideTooltip)
  })
  document.getElementById('structureDescription').textContent = `${unit === 'percent' ? 'Маржинальность' : 'Маржа'}, себестоимость и расходы формируют 100% выкупов`
}

const weeklyAnalyticsState = {
  tab: 'feed',
  units: Object.fromEntries(WeeklyAnalytics.WEEKLY_ANALYTICS_CHARTS.map(chart => [chart.id, chart.defaultUnit || 'percent'])),
}

function analyticsEscape(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

function analyticsValue(value, currentUnit, compact = false) {
  if (!Number.isFinite(value)) return '—'
  if (currentUnit === 'money') {
    if (compact && Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1).replace('.', ',')} млн ₽`
    if (compact && Math.abs(value) >= 1000) return `${Math.round(value / 1000)} тыс. ₽`
    return formatMoney(value)
  }
  if (currentUnit === 'percent') return `${value.toFixed(1).replace('.', ',')}%`
  if (currentUnit === 'count') return `${Math.round(value).toLocaleString('ru-RU')} шт.`
  if (currentUnit === 'days') return `${value.toFixed(1).replace('.', ',')} дн.`
  if (currentUnit === 'hours') return `${value.toFixed(1).replace('.', ',')} ч`
  return String(value)
}

function analyticsPointValue(value, currentUnit) {
  if (currentUnit === 'money') {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1).replace('.', ',')} млн ₽`
    if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)} тыс. ₽`
  }
  if (currentUnit === 'percent') return `${Number(value.toFixed(1)).toLocaleString('ru-RU')}%`
  if (currentUnit === 'count') return Math.round(value).toLocaleString('ru-RU')
  if (currentUnit === 'days') return `${Number(value.toFixed(1)).toLocaleString('ru-RU')} дн.`
  if (currentUnit === 'hours') return `${Number(value.toFixed(1)).toLocaleString('ru-RU')} ч`
  return analyticsValue(value, currentUnit, true)
}

function analyticsDelta(value, currentUnit) {
  if (value === 0) return 'без изменений'
  const sign = value > 0 ? '+' : '−'
  const absolute = Math.abs(value)
  if (currentUnit === 'percent') return `${sign}${absolute.toFixed(1).replace('.', ',')} п.п.`
  return `${sign}${analyticsValue(absolute, currentUnit, currentUnit === 'money')}`
}

function analyticsSeriesLabel(series, currentUnit) {
  const corrected = WeeklyAnalytics.metricLabel(series.key, currentUnit)
  return corrected === series.key ? series.label : corrected
}

function analyticsPlot(chart, currentUnit, onlySeries = null) {
  const seriesList = onlySeries ? [onlySeries] : chart.series
  const width = 640
  const height = onlySeries ? 118 : 210
  const left = 36
  const right = 20
  const top = 30
  const bottom = 36
  const values = chart.points.flatMap(point => seriesList.map(series => Number(point.values[currentUnit]?.[series.key] ?? 0)))
  const ceiling = Math.max(...values, 1)
  const floor = Math.min(0, ...values)
  const span = ceiling - floor || 1
  const x = index => left + (width - left - right) * index / Math.max(1, chart.points.length - 1)
  const y = value => top + (height - top - bottom) * (ceiling - value) / span
  const grid = [0, .5, 1].map(ratio => {
    const yy = top + (height - top - bottom) * ratio
    const value = ceiling - span * ratio
    return `<g><line x1="${left}" y1="${yy}" x2="${width - right}" y2="${yy}"/><text x="${left - 6}" y="${yy - 5}" text-anchor="end">${analyticsValue(value, currentUnit, true)}</text></g>`
  }).join('')
  const paths = seriesList.map((series, seriesIndex) => {
    const points = chart.points.map((point, index) => `${x(index)},${y(Number(point.values[currentUnit]?.[series.key] ?? 0))}`).join(' ')
    const area = chart.type === 'area' ? `<polygon class="analytics-area" points="${x(0)},${height - bottom} ${points} ${x(chart.points.length - 1)},${height - bottom}" fill="${series.color}"/>` : ''
    const dots = chart.points.map((point, index) => {
      const value = Number(point.values[currentUnit]?.[series.key] ?? 0)
      const label = `${analyticsSeriesLabel(series, currentUnit)} · ${point.week}: ${analyticsValue(value, currentUnit)}`
      const anchor = index === 0 ? 'start' : index === chart.points.length - 1 ? 'end' : 'middle'
      const labelX = x(index) + (index === 0 ? 4 : index === chart.points.length - 1 ? -4 : 0)
      const offsets = [-9, 14, -20, 25]
      const labelY = y(value) + offsets[seriesIndex % offsets.length]
      return `<g class="analytics-point"><circle cx="${x(index)}" cy="${y(value)}" r="${index === chart.points.length - 1 ? 4.5 : 3.5}" fill="${series.color}" tabindex="0" data-tooltip="${analyticsEscape(label)}" data-tooltip-side="top"><title>${analyticsEscape(label)}</title></circle><text class="analytics-point-value" x="${labelX}" y="${labelY}" text-anchor="${anchor}" fill="${series.color}">${analyticsEscape(analyticsPointValue(value, currentUnit))}</text></g>`
    }).join('')
    return `${area}<polyline points="${points}" fill="none" stroke="${series.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>${dots}`
  }).join('')
  const labels = chart.points.map((point, index) => `<text class="analytics-week-label${index === chart.points.length - 1 ? ' is-current' : ''}" x="${x(index)}" y="${height - 8}" text-anchor="middle">${analyticsEscape(point.week.replace(' апр.', ' апр.').replace(' – ', '–'))}</text>`).join('')
  return `<svg class="analytics-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${analyticsEscape(chart.title)}"><g class="analytics-grid-lines">${grid}</g>${paths}${labels}</svg>`
}

function analyticsBars(chart, currentUnit) {
  const max = Math.max(...chart.points.flatMap(point => chart.series.map(series => Number(point.values[currentUnit]?.[series.key] ?? 0))), 1)
  return `<div class="analytics-bars">${chart.points.map((point, weekIndex) => `<div class="analytics-bar-week${weekIndex === chart.points.length - 1 ? ' is-current' : ''}"><div class="analytics-bar-group">${chart.series.map(series => {
    const value = Number(point.values[currentUnit]?.[series.key] ?? 0)
    const label = `${series.label} · ${point.week}: ${analyticsValue(value, currentUnit)}`
    return `<span style="height:${Math.max(4, value / max * 100)}%;background:${series.color};color:${series.color}" tabindex="0" data-tooltip="${analyticsEscape(label)}" data-tooltip-side="top"><em>${analyticsEscape(analyticsPointValue(value, currentUnit))}</em></span>`
  }).join('')}</div><small>${analyticsEscape(point.week)}</small></div>`).join('')}</div>`
}

function analyticsChartBody(chart, currentUnit) {
  if (chart.type === 'small-multiples') {
    return `<div class="analytics-small-multiples">${chart.series.map(series => `<section><header><i style="background:${series.color}"></i><strong>${analyticsEscape(analyticsSeriesLabel(series, currentUnit))}</strong><span>${analyticsValue(chart.points.at(-1).values[currentUnit][series.key], currentUnit)}</span></header>${analyticsPlot(chart, currentUnit, series)}</section>`).join('')}</div>`
  }
  if (chart.type === 'bars') return analyticsBars(chart, currentUnit)
  return analyticsPlot(chart, currentUnit)
}

function analyticsCardMarkup(chart) {
  const currentUnit = weeklyAnalyticsState.units[chart.id] || chart.defaultUnit
  const units = (chart.units || []).map(item => `<button type="button" class="${item.id === currentUnit ? 'is-active' : ''}" data-analytics-unit="${chart.id}:${item.id}" aria-pressed="${String(item.id === currentUnit)}">${item.label}</button>`).join('')
  const legend = chart.series.map(series => `<span><i style="background:${series.color}"></i>${analyticsEscape(analyticsSeriesLabel(series, currentUnit))}</span>`).join('')
  const note = chart.note ? `<div class="analytics-note is-${chart.noteTone || 'neutral'}"><svg><use href="#i-${chart.noteTone === 'warning' ? 'alert' : 'info'}"/></svg><span>${analyticsEscape(chart.note)}</span></div>` : ''
  const changes = WeeklyAnalytics.summariesForChart(chart, currentUnit)
  const changesMarkup = changes.map(item => `<div class="analytics-change-item"><i style="background:${item.color}"></i><span><strong>${analyticsEscape(item.label)} <em>${analyticsEscape(analyticsDelta(item.delta, currentUnit))}</em></strong><small>Сейчас ${analyticsEscape(analyticsValue(item.current, currentUnit))}</small></span></div>`).join('')
  return `<div class="analytics-row" data-analytics-row="${chart.id}"><article class="analytics-card card${chart.fullWidth ? ' is-wide' : ''}" data-analytics-chart="${chart.id}">
    <header class="analytics-card-header"><div><span class="analytics-card-source">${analyticsEscape(chart.source)}</span><h3>${analyticsEscape(chart.title)}</h3><p>${analyticsEscape(chart.description)}</p></div><div class="analytics-card-actions"><button class="analytics-info" type="button" aria-label="Как считается ${analyticsEscape(chart.title)}" data-tooltip="${analyticsEscape(chart.formula)}" data-tooltip-side="left"><svg><use href="#i-info"/></svg></button>${units.length > 0 ? `<div class="analytics-unit-toggle" role="group" aria-label="Единица графика ${analyticsEscape(chart.title)}">${units}</div>` : ''}</div></header>
    <div class="analytics-legend">${legend}</div>${note}<div class="analytics-plot">${analyticsChartBody(chart, currentUnit)}</div>
  </article><aside class="analytics-changes card" aria-label="Что изменилось: ${analyticsEscape(chart.title)}"><header><span>НЕДЕЛЯ К НЕДЕЛЕ</span><h3>Что изменилось</h3></header><div class="analytics-change-list">${changesMarkup}</div></aside></div>`
}

function bindWeeklyAnalyticsTooltips(root) {
  root.querySelectorAll('[data-tooltip]').forEach(node => {
    node.addEventListener('pointerenter', () => showTooltip(node))
    node.addEventListener('pointerleave', hideTooltip)
    node.addEventListener('focus', () => showTooltip(node))
    node.addEventListener('blur', hideTooltip)
  })
}

function renderWeeklyAnalytics() {
  const tabs = document.getElementById('weeklyAnalyticsTabs')
  const visible = WeeklyAnalytics.chartsForTab(weeklyAnalyticsState.tab)
  tabs.innerHTML = WeeklyAnalytics.WEEKLY_ANALYTICS_TABS.map(tab => `<button type="button" class="${tab.id === weeklyAnalyticsState.tab ? 'is-active' : ''}" data-analytics-tab="${tab.id}" aria-pressed="${String(tab.id === weeklyAnalyticsState.tab)}">${tab.label}<span>${WeeklyAnalytics.chartsForTab(tab.id).length}</span></button>`).join('')
  tabs.querySelectorAll('[data-analytics-tab]').forEach(button => button.addEventListener('click', () => {
    weeklyAnalyticsState.tab = button.dataset.analyticsTab
    renderWeeklyAnalytics()
    document.getElementById('weeklyAnalyticsTitle').scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }))
  const context = document.getElementById('weeklyAnalyticsContext')
  const contextualCopy = {
    feed: ['info', 'Лента объединяет утверждённые и демонстрационные источники', 'Рекламные и поисковые графики помечены в карточках и не меняют итоговые показатели текущего отчёта.'],
    ads: ['warning', 'Реклама в текущем отчёте отключена', 'Графики показывают согласованный вид полного демонстрационного источника и не входят в сверку этой недели.'],
    search: ['info', 'Демонстрационное окно атрибуции — 7 дней', 'CR и средние значения показаны как проектируемый сценарий до подключения поискового источника.'],
  }[weeklyAnalyticsState.tab]
  context.className = `weekly-analytics-context${contextualCopy ? ` is-${contextualCopy[0]}` : ' is-hidden'}`
  context.innerHTML = contextualCopy ? `<svg><use href="#i-${contextualCopy[0] === 'warning' ? 'alert' : 'info'}"/></svg><span><strong>${contextualCopy[1]}</strong><small>${contextualCopy[2]}</small></span>` : ''
  const structure = document.querySelector('[data-analytics-row="structure"]')
  structure.classList.toggle('is-hidden', !visible.some(chart => chart.id === 'structure'))
  const generated = document.getElementById('weeklyAnalyticsGenerated')
  generated.innerHTML = visible.filter(chart => chart.id !== 'structure').map(analyticsCardMarkup).join('')
  generated.querySelectorAll('[data-analytics-unit]').forEach(button => button.addEventListener('click', () => {
    const [chartId, nextUnit] = button.dataset.analyticsUnit.split(':')
    weeklyAnalyticsState.units[chartId] = nextUnit
    renderWeeklyAnalytics()
  }))
  bindWeeklyAnalyticsTooltips(generated)
}

function renderDrawerTrend(key) {
  const contextTrend = WeeklyAnalytics.WEEKLY_CONTEXT_TRENDS[key]
  const article = categories.find(item => item.key === key) || { key, label: contextTrend?.title || key, color: contextTrend?.color || 'var(--other)' }
  const values = contextTrend
    ? contextTrend.points.map(point => point[unit === 'percent' ? 'percent' : 'money'])
    : weeks.map(week => unit === 'percent' ? week[key] : week.buyouts * week[key] / 100)
  const chart = {
    title: `Динамика: ${categoryLabel(article)}`,
    series: [{ key, label: categoryLabel(article), color: article.color }],
    points: weeks.map((week, index) => ({ week: week.label, values: { [unit]: { [key]: values[index] } } })),
  }
  document.getElementById('drawerTrend').innerHTML = `<header><span>ДИНАМИКА ПО НЕДЕЛЯМ</span><strong>${analyticsValue(values.at(-1), unit === 'percent' ? 'percent' : 'money')}</strong></header>${analyticsPlot(chart, unit === 'percent' ? 'percent' : 'money')}`
  bindWeeklyAnalyticsTooltips(document.getElementById('drawerTrend'))
}

function openDetails(key = 'logistics') {
  const detail = categoryDetails[key] || categoryDetails.logistics
  document.getElementById('drawerTitle').textContent = key === 'margin' && unit === 'percent' ? 'Маржинальность' : detail.title
  document.getElementById('drawerSubtitle').textContent = detail.subtitle
  document.getElementById('drawerRows').innerHTML = detail.rows.map(row => `<tr>${row.map((cell, index) => `<td class="${index === 3 && String(cell).startsWith('−') ? 'positive' : ''}">${key === 'other' && index === 0 && row[0] === 'Штрафы' ? '<button class="drawer-row-link" type="button" data-detail-category="penalties">Штрафы<svg><use href="#i-chevron-right"/></svg></button>' : cell}</td>`).join('')}</tr>`).join('')
  document.querySelectorAll('[data-detail-category]').forEach(button => button.addEventListener('click', () => openDetails(button.dataset.detailCategory)))
  renderDrawerTrend(key)
  const drawer = document.getElementById('detailDrawer')
  drawer.classList.add('is-open')
  drawer.setAttribute('aria-hidden', 'false')
}

function closeDetails() {
  const drawer = document.getElementById('detailDrawer')
  drawer.classList.remove('is-open')
  drawer.setAttribute('aria-hidden', 'true')
}

// Цель активной версии плана задана недельным темпом по выкупам — из этих же значений берёт
// план блок РНП, чтобы на двух экранах не жило по своей цифры.
const planState = {
  screen: 'active', version: 3, target: '2 500 000 ₽',
  scope: { title: 'Май 2026 · недельный темп', context: '2 кабинета WB', since: '1 мая 2026', metric: 'выкупам' }
}

function planMetricCard(label, meta, value, note, state = '') {
  return `<div class="plan-metric ${state ? `is-${state}` : ''}"><span class="plan-metric-label">${label}</span><span class="plan-metric-meta">${meta}</span><strong>${value}</strong><small class="${state === 'warning' ? 'warning' : 'positive'}">${note}</small></div>`
}

function renderPlansActive() {
  const content = document.getElementById('plansContent')
  content.innerHTML = `<div class="plans-grid">
    <article class="plans-main-card card">
      <header class="plans-card-heading"><div><h2>${planState.scope.title}</h2><p>${planState.scope.context} · действует с ${planState.scope.since}</p></div><span class="plan-status"><span class="status-light good"></span>Активная версия v${planState.version}</span></header>
      <div class="plan-metrics">
        ${planMetricCard('Выкупы', 'цель · рубли', planState.target, '56% цели за 16 дней')}
        ${planMetricCard('Маржа', 'цель · рубли', '520 000 ₽', '62,5% цели')}
        ${planMetricCard('ДРР', 'цель · не выше 8%', '6,7%', 'лучше цели на 1,3 п.п.')}
      </div>
      <div class="plans-quality"><svg><use href="#i-alert"/></svg><span><strong>ДРР пока не прогнозируется.</strong> Рекламный источник неполон; выкупы и маржа продолжают сравниваться с планом.</span></div>
      <div class="plan-summary"><svg><use href="#i-target"/></svg><span>Факт и план сопоставляются в одной области: два выбранных кабинета WB. Подключение нового кабинета не изменит эту версию автоматически.</span></div>
    </article>
    <aside class="plans-history-card card">
      <div><h3>История плана</h3><p>Изменения сохраняются, чтобы объяснить прошлые решения.</p></div>
      <button class="plan-version is-current" data-plan-version="current"><span class="plan-version-top"><strong>v${planState.version} · текущая</strong><span>Активна</span></span><small>Сегодня, 09:18 · Аналитик</small><span class="plan-version-change">Цель выкупов · ${planState.target}</span></button>
      <button class="plan-version" data-plan-version="previous"><span class="plan-version-top"><strong>v2 · заменена</strong><span>Архив</span></span><small>1 мая · Аналитик</small><span class="plan-version-change">Цель выкупов · 2 200 000 ₽</span></button>
      <p class="plans-footer-note">Откройте версию, чтобы сравнить цели, область и причину изменения.</p>
    </aside>
  </div>`
  content.querySelectorAll('[data-plan-version]').forEach(button => button.addEventListener('click', () => {
    const current = button.dataset.planVersion === 'current'
    showToast(current ? 'Активная версия плана' : 'Исходная версия плана', current ? `v${planState.version} · действует сейчас` : 'v2 · цель выкупов 2 200 000 ₽')
  }))
}

function renderPlansEmpty() {
  document.getElementById('plansContent').innerHTML = `<div class="plan-empty card"><div><span class="plan-empty-icon"><svg><use href="#i-target"/></svg></span><h2>Планов пока нет</h2><p>Создайте первую цель по выкупам, марже или ДРР. В отчёте появится сравнение факта с активным планом.</p><button class="primary-button" id="emptyCreatePlan">Создать первый план</button></div></div>`
  document.getElementById('emptyCreatePlan').addEventListener('click', renderPlansForm)
}

function renderPlansForm() {
  planState.screen = 'form'
  document.getElementById('plansContent').innerHTML = `<article class="plan-form-card card">
    <header class="plan-form-header"><div><h2>Новый план</h2><p>Заполните контекст и только те показатели, которыми управляете.</p></div><button class="plan-form-close" id="cancelPlan">Отмена</button></header>
    <section class="plan-form-section"><h3>Контекст</h3><div class="plan-form-fields">
      <label class="plan-form-label">Область<div class="field-select plan-field-select"><button class="field-select-trigger" aria-haspopup="listbox" aria-expanded="false"><span>2 кабинета WB</span><svg><use href="#i-chevron-down"/></svg></button><div class="field-select-popover" role="listbox"><button role="option" aria-selected="true">2 кабинета WB<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">Основной кабинет WB<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">ООО «Верена» · все кабинеты<svg><use href="#i-check"/></svg></button></div></div></label>
      <label class="plan-form-label">Период<div class="field-select plan-field-select"><button class="field-select-trigger" aria-haspopup="listbox" aria-expanded="false"><span>Май 2026 · месяц</span><svg><use href="#i-chevron-down"/></svg></button><div class="field-select-popover" role="listbox"><button role="option" aria-selected="true">Май 2026 · месяц<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">4–10 мая · неделя<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">11–17 мая · неделя<svg><use href="#i-check"/></svg></button></div></div></label>
      <label class="plan-form-label">Дата начала<input id="planStartDate" type="hidden" value="2026-05-01"><button class="date-field" id="planStartDateTrigger" type="button" data-calendar="single" data-input="planStartDate" aria-haspopup="dialog" aria-expanded="false"><span>01.05.2026</span><svg><use href="#i-calendar"/></svg></button></label>
    </div></section>
    <section class="plan-form-section"><h3>Цели</h3><div class="plan-targets"><div class="plan-targets-head"><span>ПОКАЗАТЕЛЬ</span><span>ЕДИНИЦА</span><span>ЦЕЛЬ</span><span>СРАВНЕНИЕ</span><span>ОСНОВАНИЕ</span></div>
      <div class="plan-target-row"><strong>Выкупы</strong><span class="target-unit">₽</span><input id="planBuyoutTarget" type="text" value="2 500 000"><div class="field-select plan-inline-select"><button class="field-select-trigger" aria-haspopup="listbox" aria-expanded="false"><span>не ниже</span><svg><use href="#i-chevron-down"/></svg></button><div class="field-select-popover" role="listbox"><button role="option" aria-selected="true">не ниже<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">не выше<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">диапазон<svg><use href="#i-check"/></svg></button></div></div><span class="target-unit">—</span></div>
      <div class="plan-target-row"><strong>Маржа</strong><span class="target-unit">₽</span><input type="text" value="520 000"><div class="field-select plan-inline-select"><button class="field-select-trigger" aria-haspopup="listbox" aria-expanded="false"><span>не ниже</span><svg><use href="#i-chevron-down"/></svg></button><div class="field-select-popover" role="listbox"><button role="option" aria-selected="true">не ниже<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">не выше<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">диапазон<svg><use href="#i-check"/></svg></button></div></div><span class="target-unit">—</span></div>
      <div class="plan-target-row"><strong>ДРР</strong><span class="target-unit">%</span><input type="text" value="8"><div class="field-select plan-inline-select"><button class="field-select-trigger" aria-haspopup="listbox" aria-expanded="false"><span>не выше</span><svg><use href="#i-chevron-down"/></svg></button><div class="field-select-popover" role="listbox"><button role="option" aria-selected="true">не выше<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">не ниже<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">диапазон<svg><use href="#i-check"/></svg></button></div></div><div class="field-select plan-inline-select"><button class="field-select-trigger" aria-haspopup="listbox" aria-expanded="false"><span>выкупы</span><svg><use href="#i-chevron-down"/></svg></button><div class="field-select-popover" role="listbox"><button role="option" aria-selected="true">выкупы<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">заказы<svg><use href="#i-check"/></svg></button><button role="option" aria-selected="false">рекламные заказы<svg><use href="#i-check"/></svg></button></div></div></div>
    </div><label class="plan-form-check"><input type="checkbox" checked><span class="check-control" aria-hidden="true"><svg><use href="#i-check"/></svg></span><span>Показывать план в недельном и месячном отчётах</span></label></section>
    <section class="plan-form-section"><h3>Проверка перед активацией</h3><div class="plan-summary"><svg><use href="#i-check"/></svg><span>Будет создана версия для 2 кабинетов WB. Предыдущие цели останутся доступны в истории.</span></div></section>
    <footer class="plan-form-actions"><button class="secondary-button" id="cancelPlanBottom">Отмена</button><button class="primary-button" id="savePlanButton">Сохранить и активировать</button></footer>
  </article>`
  document.getElementById('cancelPlan').addEventListener('click', () => { planState.screen = 'active'; renderPlansActive() })
  document.getElementById('cancelPlanBottom').addEventListener('click', () => { planState.screen = 'active'; renderPlansActive() })
  bindFieldSelects(document.getElementById('plansContent'))
  bindDatePickers(document.getElementById('plansContent'))
  document.getElementById('savePlanButton').addEventListener('click', savePlan)
}

function savePlan() {
  const target = document.getElementById('planBuyoutTarget').value.trim() || '2 500 000'
  planState.target = `${target.replace(/\s+/g, ' ')} ₽`
  planState.version += 1
  planState.screen = 'active'
  renderPlansActive()
  showToast('План активирован', `Создана версия v${planState.version} · ${planState.target}`)
}

// Плашка общая для трёх экранов раздела и стоит вне #plansContent, поэтому обновляется
// своим вызовом — при входе в раздел и при смене юрлица в тулбаре, без пересборки формы.
function renderPlansContext() {
  const value = document.getElementById('plansCompanyValue')
  if (value) value.textContent = companyLabel()
}

function renderPlans(screen = planState.screen) {
  planState.screen = screen
  renderPlansContext()
  if (screen === 'empty') renderPlansEmpty()
  else if (screen === 'form') renderPlansForm()
  else renderPlansActive()
}

function showToast(title, text) {
  const toast = document.getElementById('toast')
  document.getElementById('toastTitle').textContent = title
  document.getElementById('toastText').textContent = text
  toast.classList.add('is-visible')
  window.clearTimeout(showToast.timer)
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 4200)
}

// Все рамки мокапа («Версия», рамки Студии и Настроек, выход) собраны из одних классов,
// поэтому открытие/закрытие общие: рамка своим кодом только дублировала бы возврат фокуса.
function openModal(id, focusSelector) {
  modalReturnFocus = document.activeElement
  const modal = document.getElementById(id)
  modal.classList.remove('is-hidden')
  requestAnimationFrame(() => modal.classList.add('is-open'))
  modal.querySelector(focusSelector).focus({ preventScroll: true })
}

function closeModal(id) {
  const modal = document.getElementById(id)
  if (modal.classList.contains('is-hidden')) return
  modal.classList.remove('is-open')
  window.setTimeout(() => modal.classList.add('is-hidden'), 160)
  modalReturnFocus?.focus?.({ preventScroll: true })
}

// Рамки могут лежать друг на друге (§5: подтверждение удаления поверх окна управления), а
// z-index у них общий, поэтому верхней считается последняя в DOM — Esc и Tab-ловушка обязаны
// работать именно с ней, иначе закрылся бы нижний слой. NodeList не имеет .at(), поэтому
// индекс считаем через length.
function openModalBackdrop() {
  const stack = document.querySelectorAll('.modal-backdrop.is-open')
  return stack.length ? stack[stack.length - 1] : null
}

// Esc сворачивает «ту, что открыта», а не каждую своим вызовом: ветка на каждую рамку
// только продублировала бы первую.
function closeOpenModal() {
  const backdrop = openModalBackdrop()
  if (backdrop) closeModal(backdrop.id)
}

// Разделы мокапа в одной таблице: nav, заголовок toolbar'а и флаг фиксированного экрана
// читаются отсюда, поэтому новый экран — это строка здесь плюс блок в CSS, а не ещё одна
// ветка в switchView. id секции = ключ + 'View', класс shell'а = 'is-' + ключ.
const VIEWS = {
  report: { title: 'НЕДЕЛЬНЫЙ ОТЧЁТ' },
  dashboard: { title: 'МОЙ ДАШБОРД' },
  rnp: { title: 'РНП', fixed: true, render: renderRnp },
  products: { title: 'ТОВАРЫ', fixed: true, render: renderProducts },
  // Карточка товара остаётся внутри «Товаров»: подсветка строки навигации берётся из nav, а не из ключа экрана.
  product: { title: 'ТОВАР', fixed: true, nav: 'products', render: renderProduct },
  studio: { title: 'СТУДИЯ', fixed: true, render: renderStudio },
  admin: { title: 'КОНТРОЛЬ РАСЧЁТОВ', render: renderAdmin },
  plans: { title: 'ПЛАНЫ' },
  settings: { title: 'НАСТРОЙКИ', fixed: true, render: renderSettings },
  account: { title: 'АККАУНТ', fixed: true, render: renderAccount }
}

function switchView(view) {
  const config = VIEWS[view]
  if (!config) return
  const dashboard = view === 'dashboard'
  if (dashboard) setWorkspaceMode('dashboard')
  else if (workspaceMode === 'dashboard') setWorkspaceMode('overview')
  Object.keys(VIEWS).forEach(name => shell.classList.toggle(`is-${name}`, name === view))
  shell.classList.toggle('is-fixed', Boolean(config.fixed))
  const section = document.getElementById(`${view}View`)
  document.querySelectorAll('.workspace > .view').forEach(candidate => candidate.classList.toggle('is-hidden', candidate !== section))
  document.getElementById('toolbarTitle').textContent = config.title
  document.querySelectorAll('.nav-item[data-view]').forEach(button => button.classList.toggle('is-active', button.dataset.view === (config.nav || view)))
  // Слой предыдущего раздела не должен пережить переход: с мыши его закрывает pointerdown
  // вне слоя, а с клавиатуры (⌘3) — только явный вызов здесь.
  closeScenario(); closeContextMenu(); closeFieldSelect(); closeAdminMenu(); closeDatePicker(); closeRnpExportMenu(); closeRnpMetrics(); closeDetails(); closeProductsDock(); closeStudioLayers(); closeSettingsLayers(); closeAccountLayers(); closeTeamPanel(); hideTooltip()
  // Панель KPI живёт вне секций (общий слой на весь workspace), поэтому уход из «Студии»
  // обязан свернуть её явно — на канвасе её закрывает смена экрана, а здесь она бы осталась.
  if (view !== 'studio' && kpiEditorState?.studio) closeDashboardKpiEditor()
  if (dashboard) renderDashboard()
  if (view === 'plans') renderPlans()
  if (config.render) config.render()
  // Вход в раздел начинается сверху, а не с того места, где остался прошлый заход.
  if (section) section.scrollTop = 0
}

// Раздел знает, как он выглядит, а не кто его вызвал: смена периода в тулбаре и смена
// кабинета обязаны перерисовать именно тот экран, что сейчас открыт.
function renderActiveView() {
  const view = Object.keys(VIEWS).find(name => shell.classList.contains(`is-${name}`))
  if (view) VIEWS[view].render?.()
}

// Кабинет и площадка — одно состояние на весь мокап (тулбарный [data-menu="account"]).
// Страница «Товары» показывает его вторым входом, поэтому перекраска подписей, метки
// площадки и всех фильтров собрана здесь, а не продублирована в двух обработчиках.
function chooseAccount(index) {
  menuData.account.forEach((entry, position) => entry.selected = position === index)
  const trigger = document.querySelector('.menu-trigger[data-menu="account"]')
  const entry = menuData.account[index]
  const labels = trigger.querySelectorAll('span')
  labels[labels.length - 1].textContent = entry.title
  const mark = trigger.querySelector('.mp-mark')
  if (mark) mark.textContent = entry.mark
  renderActiveView()
}

// ⌘/Ctrl+1…7 ведутся тем же порядком, что и rows в .nav-main, поэтому цель берётся из DOM:
// строка без data-view (её раздел ещё не собран) остаётся недоступной и для мыши, и для
// клавиатуры. Код клавиши вместо event.key — на русской раскладке '3' приходит только без
// Shift, а Digit3 не зависит от раскладки; тот же приём в frontend/src/hooks/use-global-shortcuts.ts.
function navigateByShortcut(event) {
  if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey) return
  // На экране входа shell'а нет (§12.8): переключать разделы негде и незачем — иначе ⌘2
  // сменил бы экран под скрытым сайдбаром, а «Войти в демо» вернул бы не туда.
  if (document.body.classList.contains('is-logged-out')) return
  // Под Admin Console (§4.1) рабочее пространство скрыто: переключение разделов наугад
  // выглядело бы потерянным нажатием, а возврат из консоли ведёт в «Контроль» сам.
  if (consoleState.open) return
  const tag = event.target.tagName
  // Цифра в поле — текст, а не команда: правка имени листа не должна выбрасывать с вкладки.
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable) return
  const digit = Number(/^Digit([1-7])$/.exec(event.code)?.[1])
  if (!digit) return
  const item = document.querySelectorAll('.nav-main .nav-item')[digit - 1]
  if (!item?.dataset.view) return
  event.preventDefault()
  switchView(item.dataset.view)
}

/* ── РНП ──────────────────────────────────────────────────────────────────────────── */
// Дни опубликованной недели 27.04–03.05 взяты из «Недельного отчёта» и сходятся с его
// KPI-карточками до рубля: выручка 1 877 774 ₽, возвраты 487 340 ₽, выкупы 1 390 434 ₽,
// себестоимость 422 106 ₽, расходы 643 453 ₽, маржа 324 875 ₽. Остальные даты считаются
// детерминированно из строки ISO: Math.random() менял бы вчерашние числа при каждом входе.
const RNP_PUBLISHED = {
  '2026-04-27': [241860, 61240, 54980, 30140, 31200, 19860],
  '2026-04-28': [268340, 66880, 60120, 33260, 33880, 21340],
  '2026-04-29': [279120, 70120, 63440, 34880, 35640, 22180],
  '2026-04-30': [262480, 68460, 62180, 33420, 34120, 21660],
  '2026-05-01': [288640, 74320, 66520, 36100, 36780, 23040],
  '2026-05-02': [271900, 72900, 63900, 37240, 38020, 23120],
  '2026-05-03': [265434, 73420, 50966, 36896, 37857, 22820]
}
const RNP_WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
// Демо-«сегодня» прототипа: 04.05.2026 — дата, с которой в «Контроле расчётов» применяется
// новое правило. Дни после неё существуют в календаре, но данных ещё нет — как в оригинале,
// где будущие дни месяца приглушены и пусты.
const RNP_DATA_THROUGH = '2026-05-03'
// Состав строк и единицы — из «Недельного отчёта»; доли считаются из сумм, а не хранятся
// отдельно, поэтому Σ недели и «Итого» периода не могут разойтись с телом таблицы.
// Строки вне RNP_DEFAULT_KEYS добавляет пикер метрик: каждая считается из той же дневной
// модели, поэтому новая строка появляется во всех колонках сразу, включая Σ и «Итого».
const RNP_METRICS = [
  // Заказы
  { key: 'ordersAmt', group: 'Заказы', label: 'Заказы', unit: '₽', source: 'Статистика', tip: 'Сумма заказанных товаров по розничной цене, до вычета возвратов.', value: agg => agg.ordersAmt },
  { key: 'ordersQty', group: 'Заказы', label: 'Заказы', unit: 'шт', source: 'Статистика', tip: 'Количество заказанных единиц.', value: agg => agg.ordersQty },

  // Выручка
  { key: 'revenue', group: 'Выручка', label: 'Выручка', unit: '₽', source: 'Статистика', tip: 'Оплаченные заказы дня до вычета возвратов.', value: agg => agg.revenue },
  { key: 'revenueQty', group: 'Выручка', label: 'Выручка', unit: 'шт', source: 'Фин. отчёт', tip: 'Количество проданных единиц.', value: agg => agg.revenueQty },
  { key: 'returns', group: 'Выручка', label: 'Возвраты', unit: '₽', source: 'Статистика', tip: 'Стоимость товаров, оформленных на возврат в этом дне.', value: agg => agg.returns },
  { key: 'returnsQty', group: 'Выручка', label: 'Возвраты', unit: 'шт', source: 'Фин. отчёт', tip: 'Количество возвращённых единиц.', value: agg => agg.returnsQty },
  { key: 'returnShare', group: 'Выручка', label: 'Доля возвратов', unit: '%', source: 'Расчёт', tip: 'Возвраты / выручка.', value: agg => agg.returnShare },
  { key: 'buyouts', group: 'Выручка', label: 'Выкупы', unit: '₽', source: 'Расчёт', tip: 'Выручка минус возвраты. База для всех долей таблицы.', value: agg => agg.buyouts },
  { key: 'buyoutsQty', group: 'Выручка', label: 'Выкупы', unit: 'шт', source: 'Расчёт', tip: 'Проданные единицы минус возвраты.', value: agg => agg.buyoutsQty },

  // Расходы
  { key: 'cost', group: 'Расходы', label: 'Себестоимость', unit: '₽', source: 'Аналитика', tip: 'Закупочная стоимость выкупленных товаров по последней версии себестоимости.', value: agg => agg.cost },
  { key: 'costShare', group: 'Расходы', label: 'Доля себестоимости', unit: '%', source: 'Расчёт', tip: 'Себестоимость / выкупы.', value: agg => agg.costShare },
  { key: 'commission', group: 'Расходы', label: 'Комиссия', unit: '₽', source: 'Статистика', tip: 'Комиссия маркетплейса с выкупов.', value: agg => agg.commission },
  { key: 'logistics', group: 'Расходы', label: 'Прямая логистика', unit: '₽', source: 'Расчёт', tip: 'Плечо доставки до клиента и обратно по operated-тарифам.', value: agg => agg.logistics },
  { key: 'spp', group: 'Расходы', label: 'СПП', unit: '₽', source: 'Расчёт', tip: 'Скидка постоянного покупателя. Часть прочих удержаний, поэтому в «Расходы» входит.', value: agg => agg.spp },
  { key: 'penalties', group: 'Расходы', label: 'Штрафы', unit: '₽', source: 'Фин. отчёт', tip: 'Штрафы и удержания маркетплейса. Часть прочих удержаний.', value: agg => agg.penalties },
  { key: 'withholdings', group: 'Расходы', label: 'Прочие удержания', unit: '₽', source: 'Фин. отчёт', tip: 'Эквайринг, трейд-маркетинг и прочие удержания сверх СПП и штрафов.', value: agg => agg.other },
  { key: 'expenses', group: 'Расходы', label: 'Расходы', unit: '₽', source: 'Фин. отчёт', tip: 'Комиссия, логистика, СПП, штрафы и прочие удержания.', value: agg => agg.expenses },
  { key: 'expensesShare', group: 'Расходы', label: 'Доля расходов', unit: '%', source: 'Расчёт', tip: 'Расходы / выкупы.', value: agg => agg.expensesShare },

  // Реклама
  { key: 'adSpend', group: 'Реклама', label: 'Рекламные расходы', unit: '₽', source: 'Продвижение', tip: 'Списания по всем кампаниям продвижения за день.', value: agg => agg.adSpend },
  { key: 'cpcSpend', group: 'Реклама', label: 'Расходы CPC', unit: '₽', source: 'Продвижение', tip: 'Оплата за клики по кампаниям с оплатой за переход.', value: agg => agg.cpcSpend },
  { key: 'cpmSpend', group: 'Реклама', label: 'Расходы CPM', unit: '₽', source: 'Продвижение', tip: 'Оплата за показы. Остаток рекламных расходов после CPC.', value: agg => agg.cpmSpend },
  { key: 'adImpressions', group: 'Реклама', label: 'Показы рекламы', unit: 'шт', source: 'Продвижение', tip: 'Количество показов рекламных объявлений.', value: agg => agg.adImpressions },

  // Трафик
  { key: 'totalClicks', group: 'Трафик', label: 'Переходы в карточку', unit: 'шт', source: 'Аналитика', tip: 'Переходы в карточку товара из поиска и каталога.', value: agg => agg.totalClicks },
  { key: 'adClicks', group: 'Трафик', label: 'Рекламные переходы', unit: 'шт', source: 'Продвижение', tip: 'Переходы, приведшие объявления из кампаний продвижения.', value: agg => agg.adClicks },
  { key: 'organicClicks', group: 'Трафик', label: 'Органические переходы', unit: 'шт', source: 'Расчёт', tip: 'Переходы в карточку минус рекламные переходы.', value: agg => agg.organicClicks },

  // Расчётные
  { key: 'margin', group: 'Расчётные', label: 'Маржа', unit: '₽', source: 'Расчёт', tip: 'Выкупы минус себестоимость и расходы.', value: agg => agg.margin },
  { key: 'marginability', group: 'Расчётные', label: 'Маржинальность', unit: '%', source: 'Расчёт', tip: 'Маржа / выкупы.', value: agg => agg.marginability },
  { key: 'buyoutRate', group: 'Расчётные', label: 'Процент выкупа', unit: '%', source: 'Расчёт', tip: 'Выкупы, шт / Заказы, шт.', value: agg => agg.buyoutRate },
  { key: 'avgCheck', group: 'Расчётные', label: 'Средний чек выкупа', unit: '₽', source: 'Расчёт', tip: 'Выкупы, ₽ / Выкупы, шт.', value: agg => agg.avgCheck },
  { key: 'conversion', group: 'Расчётные', label: 'Конверсия в выкуп', unit: '%', source: 'Расчёт', tip: 'Выкупы, шт / Переходы в карточку.', value: agg => agg.conversion },
  { key: 'adClicksShare', group: 'Расчётные', label: 'Доля рекламных переходов', unit: '%', source: 'Расчёт', tip: 'Рекламные переходы / все переходы в карточку.', value: agg => agg.adClicksShare },
  { key: 'ctr', group: 'Расчётные', label: 'CTR', unit: '%', source: 'Расчёт', tip: 'Рекламные переходы / показы рекламы.', value: agg => agg.ctr },
  { key: 'cpc', group: 'Расчётные', label: 'CPC', unit: '₽', source: 'Расчёт', tip: 'Рекламные расходы / рекламные переходы.', value: agg => agg.cpc },
  { key: 'drrGmv', group: 'Расчётные', label: 'ДРР (от GMV)', unit: '%', source: 'Расчёт', tip: 'Рекламные расходы / Заказы, ₽.', value: agg => agg.drrGmv },
  { key: 'drrRevenue', group: 'Расчётные', label: 'ДРР (от выкупа)', unit: '%', source: 'Расчёт', tip: 'Рекламные расходы / Выкупы, ₽.', value: agg => agg.drrRevenue }
]
const RNP_METRIC_BY_KEY = new Map(RNP_METRICS.map(row => [row.key, row]))
const RNP_METRIC_GROUPS = ['Заказы', 'Выручка', 'Расходы', 'Реклама', 'Трафик', 'Расчётные']
const RNP_DEFAULT_KEYS = ['revenue', 'returns', 'returnShare', 'buyouts', 'cost', 'commission', 'logistics', 'expenses', 'margin', 'marginability']
const rnpState = { collapsed: new Set(), selected: new Set(), weeks: [], format: 'png', metrics: [...RNP_DEFAULT_KEYS] }
const rnpNumber = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const rnpPercent = value => `${(value * 100).toFixed(1).replace('.', ',')}%`
// Оригинал печатает доли с точкой (17.4%), в мокапе все доли с запятой — как в легенде
// «Структуры расходов по выкупам».
function rnpCell(value, unit) {
  if (unit === '%') return rnpPercent(value)
  return `${rnpNumber.format(value)}\u00A0${unit === 'шт' ? 'шт' : '₽'}`
}

function rnpHash(text) {
  let hash = 2166136261
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return Math.abs(hash)
}

function rnpDay(iso) {
  if (iso > RNP_DATA_THROUGH) return null
  const published = RNP_PUBLISHED[iso]
  const money = published
    ? { revenue: published[0], returns: published[1], cost: published[2], commission: published[3], logistics: published[4], other: published[5] }
    : (() => {
        const season = [0.86, 1.07, 1.03, 1, 1.04, 1.09, 0.97][new Date(`${iso}T00:00:00`).getDay()]
        const revenue = Math.round(268253 * season * (1 + (rnpHash(iso) % 1000 - 500) / 5000))
        const returns = Math.round(revenue * (0.259 + (rnpHash(`r${iso}`) % 1000 - 500) / 25000))
        const part = ratio => Math.round((revenue - returns) * ratio)
        return { revenue, returns, cost: part(0.3036), commission: part(0.174), logistics: part(0.178), other: part(0.1107) }
      })()
  // Единицы, заказы и реклама — производные того же дня: хэш от даты вместо генератора
  // случайных чисел, чтобы повторная отрисовка не меняла отчёт. Без них метрики, которые
  // добавляет пикер (CTR, CPC, ДРР, доли переходов) были бы одной величиной во всех колонках.
  const wobble = salt => 1 + ((rnpHash(`${salt}${iso}`) % 1000) - 500) / 9000
  const ordersAmt = Math.round(money.revenue * 1.0483 * wobble('o'))
  const ordersQty = Math.round(ordersAmt / 616.6)
  const totalClicks = Math.round(ordersQty * 13.37 * wobble('c'))
  const adClicks = Math.round(totalClicks * 0.4317 * wobble('a'))
  const adSpend = Math.round(adClicks * 5.59 * wobble('s'))
  // Показы — единственный множитель с размахом шире ±5,5%: иначе CTR оставался бы ровно
  // 3,76% в каждой колонке, и строка выглядела бы склеенной.
  const impressionsWobble = 1 + ((rnpHash(`x${iso}`) % 1000) - 500) / 4200
  // «Прочее» раскладывается на СПП, штрафы и остаток так, что сумма трёх равна исходному
  // «прочему»: «Расходы» и «Маржа» от этого не меняются ни на рубль.
  const spp = Math.round(money.other * 0.6264)
  const penalties = Math.round(money.other * 0.0433)
  return {
    ...money, other: money.other - spp - penalties, spp, penalties,
    revenueQty: Math.round(money.revenue / 781.4),
    returnsQty: Math.round(money.returns / 2245),
    ordersAmt, ordersQty, totalClicks, adClicks,
    adImpressions: Math.round(adClicks / (0.03764 * impressionsWobble)),
    adSpend, cpcSpend: Math.round(adSpend * 0.624),
  }
}

// Форма возврата — те же сырые слагаемые, что и на входе: «Итого» периода строится
// агрегатом из уже агрегированных дней, и потерянное слагаемое уронило бы итог.
function rnpAggregate(days) {
  const filled = days.filter(Boolean)
  const total = key => filled.reduce((sum, day) => sum + day[key], 0)
  const revenue = total('revenue'), returns = total('returns'), buyouts = revenue - returns
  const cost = total('cost'), commission = total('commission'), logistics = total('logistics')
  const spp = total('spp'), penalties = total('penalties'), other = total('other')
  const expenses = commission + logistics + spp + penalties + other
  const margin = buyouts - cost - expenses
  const revenueQty = total('revenueQty'), returnsQty = total('returnsQty')
  const buyoutsQty = revenueQty - returnsQty
  const ordersAmt = total('ordersAmt'), ordersQty = total('ordersQty')
  const totalClicks = total('totalClicks'), adClicks = total('adClicks')
  const adImpressions = total('adImpressions')
  const adSpend = total('adSpend'), cpcSpend = total('cpcSpend')
  const ratio = (numerator, denominator) => denominator ? numerator / denominator : 0
  return {
    revenue, returns, buyouts, cost, commission, logistics, spp, penalties, other, expenses, margin,
    revenueQty, returnsQty, buyoutsQty, ordersAmt, ordersQty,
    totalClicks, adClicks, organicClicks: totalClicks - adClicks, adImpressions,
    adSpend, cpcSpend, cpmSpend: adSpend - cpcSpend,
    returnShare: ratio(returns, revenue),
    marginability: ratio(margin, buyouts),
    costShare: ratio(cost, buyouts),
    expensesShare: ratio(expenses, buyouts),
    buyoutRate: ratio(buyoutsQty, ordersQty),
    avgCheck: ratio(buyouts, buyoutsQty),
    conversion: ratio(buyoutsQty, totalClicks),
    adClicksShare: ratio(adClicks, totalClicks),
    ctr: ratio(adClicks, adImpressions),
    cpc: ratio(adSpend, adClicks),
    drrGmv: ratio(adSpend, ordersAmt),
    drrRevenue: ratio(adSpend, buyouts),
  }
}

function rnpIsoWeek(date) {
  const sample = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  sample.setUTCDate(sample.getUTCDate() + 4 - (sample.getUTCDay() || 7))
  return Math.ceil(((sample - Date.UTC(sample.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7)
}

// Период показан полными неделями пн–вс: внепериодные дни остаются в сетке и приглушаются,
// как в оригинале приглушаются будущие дни месяца.
function rnpWeeks(from, to) {
  const start = new Date(`${from}T00:00:00`)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const end = new Date(`${to}T00:00:00`)
  end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)))
  const weeks = []
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 7)) {
    const days = []
    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(cursor)
      date.setDate(cursor.getDate() + offset)
      const iso = isoDate(date)
      const raw = rnpDay(iso)
      // День прогоняется через тот же rnpAggregate, что и Σ: без этого производные метрики
      // (выкупы, расходы, маржа, доли) есть только в неделях и в «Итого», а в днях — NaN.
      days.push({ iso, date, inside: iso >= from && iso <= to, filled: Boolean(raw), values: raw && rnpAggregate([raw]) })
    }
    weeks.push({ number: rnpIsoWeek(days[0].date), days })
  }
  return weeks
}

const RNP_MARKETPLACES = { WB: 'Wildberries', OZ: 'Ozon', YM: 'Яндекс Маркет' }

// Юрлицо мокапа живёт одно — в подписи тулбарного триггера: её читают и подпись контекста
// РНП (§4.1), и плашка «Планов». Второго источника правды нет, поэтому и переключение
// «Все юридические лица», и переименование в «Организации» попадают на оба экрана бесплатно.
function companyLabel() {
  return document.querySelector('[data-menu="company"] span')?.textContent.trim() || ''
}

function rnpContextLabels() {
  const company = companyLabel()
  const account = document.querySelector('[data-menu="account"]')
  const mark = account?.querySelector('.mp-mark')?.textContent.trim() || ''
  const cabinet = [...(account ? account.querySelectorAll('span') : [])].at(-1)?.textContent.trim() || ''
  return [company, RNP_MARKETPLACES[mark] || mark, cabinet]
}

function renderRnp() {
  hideTooltip()
  const periodTrigger = document.getElementById('periodTrigger')
  const from = periodTrigger.dataset.from, to = periodTrigger.dataset.to
  const weeks = rnpState.weeks = rnpWeeks(from, to)
  const periodDays = weeks.flatMap(week => week.days.filter(day => day.inside))
  const filled = periodDays.filter(day => day.filled)
  const missing = periodDays.length - filled.length
  const period = rnpAggregate(filled.map(day => day.values))
  const periodLabel = rangeLabel(new Date(`${from}T00:00:00`), new Date(`${to}T00:00:00`))
  const collapsed = number => rnpState.collapsed.has(number)
  const isCollapsed = week => collapsed(week.number)
  const collapsedWeeks = weeks.filter(isCollapsed).length
  const activeWeek = weeks.filter(week => week.days.some(day => day.inside && day.filled)).at(-1)?.number
  const share = (value, base) => base ? rnpPercent(value / base) : '—'
  const rows = rnpState.metrics.map(key => RNP_METRIC_BY_KEY.get(key)).filter(Boolean)
  // Σ недель считаем один раз на отрисовку, а не на строку: метрик в таблице теперь больше десяти.
  const weekTotals = weeks.map(week => {
    const values = week.days.map(day => day.values)
    return week.days.some(day => day.filled) ? rnpAggregate(values) : null
  })

  const chip = document.getElementById('rnpDataChip')
  chip.className = `status-chip ${missing ? 'warning' : 'good'}`
  chip.querySelector('.status-light').className = `status-light ${missing ? 'warning' : 'good'}`
  document.getElementById('rnpDataChipText').textContent = missing ? `Данных нет: ${missing} дн.` : 'Данные полные'
  document.getElementById('rnpContextLine').innerHTML = [...rnpContextLabels(), periodLabel].map(value => `<b>${value}</b>`).join('<i>·</i>')
  document.getElementById('rnpStatusNote').textContent = `Обновлено сегодня в 08:42 · правила расчёта v3 · ${filled.length} дн. с данными из ${periodDays.length} в периоде`
  document.getElementById('rnpPeriodChip').textContent = periodLabel
  const customMix = rows.length !== RNP_DEFAULT_KEYS.length || rnpState.metrics.some((key, index) => key !== RNP_DEFAULT_KEYS[index])
  document.getElementById('rnpTableNote').textContent = [
    `Σ — неделя целиком, «Итого» — только ${periodLabel}`,
    missing ? `${missing} дн. ещё без данных — они прочеркнуты` : null,
    customMix ? (rows.length ? `состав изменён: ${rows.length} метрик` : 'метрики не выбраны') : null,
    collapsedWeeks ? `${collapsedWeeks} нед. свёрнуто` : 'Неделя сворачивается по шапке Σ'
  ].filter(Boolean).join(' · ') + '.'

  const kpi = [
    ['ВЫРУЧКА', 'i-landmark', period.revenue, `${filled.length} дн. с данными`, ''],
    ['ВОЗВРАТЫ', 'i-rotate-ccw', period.returns, `${rnpPercent(period.returnShare)} выручки`, ''],
    ['ВЫКУПЫ', 'i-package-check', period.buyouts, `в среднем ${rnpNumber.format(Math.round(period.buyouts / (filled.length || 1)))} ₽/день`, ''],
    ['РАСХОДЫ', 'i-receipt', period.expenses, `${share(period.expenses, period.buyouts)} выкупов`, ''],
    ['СЕБЕСТОИМОСТЬ', 'i-boxes', period.cost, `${share(period.cost, period.buyouts)} выкупов`, ''],
    ['МАРЖА', 'i-banknote', period.margin, `Маржинальность ${rnpPercent(period.marginability)}`, 'positive']
  ]
  document.getElementById('rnpKpiGrid').innerHTML = kpi.map(([label, icon, value, note, tone]) => `<article class="kpi card"><span class="kpi-label">${label}</span><span class="kpi-icon" aria-hidden="true"><svg><use href="#${icon}"/></svg></span><span class="kpi-unit">В РУБЛЯХ</span><strong>${rnpNumber.format(value)} ₽</strong><small${tone ? ` class="${tone}"` : ''}>${note}</small></article>`).join('')

  const classes = (...names) => { const list = names.filter(Boolean); return list.length ? ` class="${list.join(' ')}"` : '' }
  const head = ['<th scope="col" class="rnp-metric"><span>Метрика</span><small>источник данных</small></th>']
  weeks.forEach(week => {
    if (!isCollapsed(week)) week.days.forEach(day => head.push(`<th scope="col"${classes(!day.inside && 'rnp-outside', !day.filled && 'rnp-nodata')}><span>${day.date.getDate()}</span><small>${RNP_WEEKDAYS[day.date.getDay()]}</small></th>`))
    head.push(`<th scope="col" class="rnp-week${week.number === activeWeek ? ' rnp-selected' : ''}"><button class="rnp-week-toggle" type="button" data-rnp-week="${week.number}" aria-expanded="${String(!isCollapsed(week))}" aria-label="Свернуть или развернуть неделю ${week.number}"><svg><use href="#i-chevron-down"/></svg><span>Σ</span></button><small>Нед ${week.number}</small></th>`)
  })
  head.push('<th scope="col" class="rnp-total rnp-selected"><span>Итого</span><small>период</small></th>')

  const body = rows.map((row, index) => {
    const cells = [`<th scope="row" class="rnp-metric"><span class="rnp-metric-name">${row.label}</span><span class="rnp-badge">${row.source}</span><span class="rnp-info" tabindex="0" data-tooltip="${row.tip}" data-tooltip-side="right"><svg><use href="#i-info"/></svg></span></th>`]
    weeks.forEach((week, position) => {
      if (!isCollapsed(week)) week.days.forEach(day => cells.push(`<td${classes(!day.inside && 'rnp-outside', !day.filled && 'rnp-nodata')}>${day.filled ? rnpCell(row.value(day.values), row.unit) : '—'}</td>`))
      const total = weekTotals[position]
      cells.push(`<td class="rnp-week${total ? '' : ' rnp-nodata'}">${total ? rnpCell(row.value(total), row.unit) : '—'}</td>`)
    })
    cells.push(`<td class="rnp-total${filled.length ? '' : ' rnp-nodata'}">${filled.length ? rnpCell(row.value(period), row.unit) : '—'}</td>`)
    return `<tr${index % 2 ? ' class="rnp-alt"' : ''}>${cells.join('')}</tr>`
  }).join('') || `<tr><td class="rnp-empty" colspan="${head.length}">Метрики не выбраны — откройте «Метрики», включите нужные строки или верните стандартный состав</td></tr>`
  document.getElementById('rnpTable').innerHTML = `<thead><tr>${head.join('')}</tr></thead><tbody>${body}</tbody>`

  // Смена периода оставляет в selected номера недель прошлого периода: они не видны в списке,
  // но попали бы в файл и в счётчик. Оставляем только те, что есть в текущем периоде.
  const inPeriod = new Set(weeks.map(week => week.number))
  rnpState.selected.forEach(number => { if (!inPeriod.has(number)) rnpState.selected.delete(number) })
  document.getElementById('rnpExportWeeks').innerHTML = weeks.map(week => `<label class="check-row"><input type="checkbox" data-rnp-export-week="${week.number}"${rnpState.selected.has(week.number) ? ' checked' : ''}><span class="check-control" aria-hidden="true"><svg><use href="#i-check"/></svg></span><span>Нед ${week.number} · ${rangeLabel(week.days[0].date, week.days[6].date)}</span></label>`).join('')
  syncRnpExportSelection()

  // §4.1.5: план не выдумываем — читаем активную версию из «Планов». Цель там задана недельным
  // темпом по выкупам, поэтому факт сравниваем тоже с выкупами, а план периода = цель × дни / 7.
  const planTarget = Number(String(planState.target).replace(/\D/g, '')) || 0
  const plan = Math.round(planTarget * periodDays.length / 7)
  const planFact = period.buyouts
  const deviation = planFact - plan
  const planNote = `Активная версия v${planState.version} · ${planState.scope.title} · ${planState.scope.context} · цель по ${planState.scope.metric}: ${planState.target} в неделю`
  document.getElementById('rnpPlanSummary').innerHTML = planTarget ? [
    `<div class="plans-context-item"><span>ПЛАН НА ПЕРИОД</span><strong data-tooltip="${planNote}" data-tooltip-side="top" tabindex="0">${rnpNumber.format(plan)} ₽</strong></div>`,
    `<div class="plans-context-item"><span>ФАКТ · ВЫКУПЫ</span><strong>${rnpNumber.format(planFact)} ₽</strong></div>`,
    `<div class="plans-context-item"><span>ВЫПОЛНЕНИЕ ПЛАНА</span><strong>${share(planFact, plan)}</strong></div>`,
    `<div class="plans-context-item"><span>ОТКЛОНЕНИЕ</span><strong class="${deviation >= 0 ? 'positive' : 'negative'}">${deviation >= 0 ? '+' : '−'}${rnpNumber.format(Math.abs(deviation))} ₽</strong></div>`,
    `<div class="plans-context-item"><span>ДНЕЙ С ДАННЫМИ</span><strong>${filled.length} из ${periodDays.length}</strong></div>`,
    `<span class="status-chip ${deviation >= 0 ? 'good' : 'warning'}"><span class="status-light ${deviation >= 0 ? 'good' : 'warning'}"></span>${deviation >= 0 ? 'План выполняется' : 'Отставание от плана'}</span>`
  ].join('') : '<div class="plans-context-item"><span>ПЛАН НА ПЕРИОД</span><strong>не задан</strong></div><span class="status-chip muted"><span class="status-light"></span>В «Планах» нет активной версии</span>'
}

const rnpExportMenu = document.getElementById('rnpExportMenu')
const rnpExportButton = document.getElementById('rnpExportButton')

function closeRnpExportMenu({ restoreFocus = false } = {}) {
  const wasOpen = rnpExportMenu.classList.contains('is-open')
  rnpExportMenu.classList.remove('is-open')
  rnpExportMenu.setAttribute('aria-hidden', 'true')
  rnpExportButton.setAttribute('aria-expanded', 'false')
  if (restoreFocus && wasOpen) rnpExportButton.focus()
}

// Счётчик в заголовке группы — единственная подсказка о том, что кнопка «Экспортировать
// выбранные» соберёт пустой файл: сама она остаётся активной и честит себя тостом.
function syncRnpExportSelection() {
  const count = document.getElementById('rnpExportCount')
  if (!count) return
  count.textContent = `${rnpState.selected.size} из ${rnpState.weeks.length}`
  count.classList.toggle('is-empty', rnpState.selected.size === 0)
}

function openRnpExportMenu() {
  closeContextMenu()
  closeScenario()
  closeFieldSelect()
  closeDatePicker()
  closeRnpMetrics()
  hideTooltip()
  const workspace = document.querySelector('.workspace').getBoundingClientRect()
  const bounds = rnpExportButton.getBoundingClientRect()
  rnpExportMenu.style.left = `${Math.max(10, Math.min(bounds.left - workspace.left, workspace.width - 346))}px`
  rnpExportButton.setAttribute('aria-expanded', 'true')
  rnpExportMenu.setAttribute('aria-hidden', 'false')
  rnpExportMenu.classList.add('is-open')
}

function rnpExport(mode) {
  const weeks = mode === 'all' ? rnpState.weeks.map(week => week.number) : [...rnpState.selected]
  if (!weeks.length) {
    showToast('Выберите хотя бы одну неделю', 'Отметьте недели, которые должны войти в файл')
    return
  }
  showToast('Экспорт завершён', `РНП · ${weeks.length} нед. · ${rnpState.metrics.length} метрик · ${{ png: 'PNG', svg: 'SVG', pdf: 'PDF', xlsx: 'XLSX' }[rnpState.format]}`)
  closeRnpExportMenu({ restoreFocus: true })
}

document.getElementById('rnpTable').addEventListener('click', event => {
  const toggle = event.target.closest('[data-rnp-week]')
  if (!toggle) return
  const number = Number(toggle.dataset.rnpWeek)
  // Свёрнутая неделя не исчезает совсем — её Σ остаётся в сетке, поэтому сворачивать можно
  // любую, даже единственную: запрет превращал бы клик в мёртвую кнопку.
  if (rnpState.collapsed.has(number)) rnpState.collapsed.delete(number)
  else rnpState.collapsed.add(number)
  renderRnp()
})

rnpExportButton.addEventListener('click', () => rnpExportMenu.classList.contains('is-open') ? closeRnpExportMenu() : openRnpExportMenu())
rnpExportMenu.addEventListener('click', event => {
  const format = event.target.closest('[data-format]')
  if (format) {
    rnpState.format = format.dataset.format
    rnpExportMenu.querySelectorAll('[data-format]').forEach(button => {
      button.classList.toggle('is-active', button === format)
      button.setAttribute('aria-pressed', button === format ? 'true' : 'false')
    })
    return
  }
  const action = event.target.closest('[data-export]')
  if (action) rnpExport(action.dataset.export)
})
rnpExportMenu.addEventListener('change', event => {
  const number = Number(event.target.dataset.rnpExportWeek)
  if (!number) return
  if (event.target.checked) rnpState.selected.add(number)
  else rnpState.selected.delete(number)
  syncRnpExportSelection()
})
document.getElementById('rnpExportSelected').addEventListener('click', () => rnpExport('selected'))

// ── Пикер метрик таблицы РНП ────────────────────────────────────────────────────
// Механика — как у панели KPI в «Студии»: каталог по группам, мгновенное применение,
// порядок строк меняется стрелками, звезда и «Недавние» переживают перезагрузку.
// §1 держит демо-данные отчёта в памяти страницы (rnpState.metrics), а в localStorage
// уходят только отметки избранного: это настройка экрана, а не данные отчёта.
const rnpMetricsSheet = document.getElementById('rnpMetricsSheet')
const rnpMetricsButton = document.getElementById('rnpMetricsButton')
const rnpMetricsToolbarButton = document.getElementById('rnpMetricsToolbarButton')
const rnpMetricsSearch = document.getElementById('rnpMetricsSearch')
const rnpMetricsFilterBar = document.getElementById('rnpMetricsFilter')
const rnpMetricsFoot = document.getElementById('rnpMetricsFoot')
const rnpMetricsDefault = document.getElementById('rnpMetricsDefault')
// §10: второй вход в тот же слой, а не второй слой — общая функция и общая видимость.
const rnpMetricsTriggers = [rnpMetricsButton, rnpMetricsToolbarButton]
const isRnpMetricsOpen = () => rnpMetricsSheet.classList.contains('is-open')
const RNP_METRIC_FAV_STORE = 'grafio.rnpMetricFavorites'
const RNP_METRIC_RECENT_STORE = 'grafio.rnpMetricRecents'
const RNP_METRIC_RECENT_LIMIT = 6
let rnpMetricFilter = 'all'
let rnpMetricsOpener = rnpMetricsButton
let rnpFavoriteMetrics = readRnpStore(RNP_METRIC_FAV_STORE)
let rnpRecentMetrics = readRnpStore(RNP_METRIC_RECENT_STORE)

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch { return fallback }
}

function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* приватный режим — накопление только на эту сессию */ }
}

// То же, что readStore/writeStore, но живёт до конца вкладки: §4.2 просит помнить активную
// вкладку панели команды в течение сессии, а не между запусками мокапа.
function readSession(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch { return fallback }
}

function writeSession(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)) } catch { /* приватный режим — только на эту загрузку */ }
}

// Форма одна на все настройки экрана: список с валидацией элементов, словарь и объект
// настроек. Валидатор нужен, потому что в localStorage может лежать ключ из прошлой
// версии мокапа.
function readStoreList(key, isValid) {
  const raw = readStore(key, [])
  return Array.isArray(raw) ? raw.filter(isValid) : []
}

function readStoreMap(key) {
  const raw = readStore(key, {})
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
}

function readStoreObject(key, defaults) {
  const raw = readStore(key, {})
  return { ...defaults, ...raw && typeof raw === 'object' ? raw : {} }
}

function readRnpStore(key) { return readStoreList(key, id => RNP_METRIC_BY_KEY.has(id)) }

function writeRnpStore(key, ids) { writeStore(key, ids) }

function rememberRnpMetrics(key) {
  rnpRecentMetrics = [...new Set([key, ...rnpRecentMetrics])].slice(0, RNP_METRIC_RECENT_LIMIT)
  writeRnpStore(RNP_METRIC_RECENT_STORE, rnpRecentMetrics)
}

function toggleRnpFavorite(key) {
  const index = rnpFavoriteMetrics.indexOf(key)
  if (index >= 0) rnpFavoriteMetrics.splice(index, 1)
  else rnpFavoriteMetrics.push(key)
  writeRnpStore(RNP_METRIC_FAV_STORE, rnpFavoriteMetrics)
}

function renderRnpMetrics() {
  const query = rnpMetricsSearch.value.trim().toLowerCase()
  const ordered = rnpState.metrics.map(key => RNP_METRIC_BY_KEY.get(key)).filter(Boolean)
  document.getElementById('rnpMetricsOrder').innerHTML = ordered.length ? ordered.map((row, index) => `<div class="rnp-order-row" data-rnp-order="${row.key}"><span class="rnp-order-grip" aria-hidden="true"><i></i><i></i></span><span class="rnp-order-index">${index + 1}</span><span class="rnp-order-copy"><strong>${row.label}</strong><small>${row.group} · ${row.source}</small></span><span class="rnp-unit-chip">${row.unit}</span><span class="rnp-order-actions"><button class="rnp-order-button up" type="button" data-rnp-move="${row.key}" data-direction="-1" data-rnp-focus="up-${row.key}"${index === 0 ? ' disabled' : ''} aria-label="Поднять: ${row.label}"><svg><use href="#i-chevron-down"/></svg></button><button class="rnp-order-button" type="button" data-rnp-move="${row.key}" data-direction="1" data-rnp-focus="down-${row.key}"${index === ordered.length - 1 ? ' disabled' : ''} aria-label="Опустить: ${row.label}"><svg><use href="#i-chevron-down"/></svg></button><button class="rnp-order-button danger" type="button" data-rnp-drop="${row.key}" data-rnp-focus="drop-${row.key}" aria-label="Убрать: ${row.label}"><svg><use href="#i-close"/></svg></button></span></div>`).join('') : '<p class="rnp-metrics-none">Таблица пуста — включите метрику в каталоге ниже или верните стандартный состав.</p>'
  const favorites = new Set(rnpFavoriteMetrics)
  const recents = new Set(rnpRecentMetrics)
  const shown = rnpMetricFilter === 'fav' ? key => favorites.has(key) : rnpMetricFilter === 'recent' ? key => recents.has(key) : () => true
  const matches = row => shown(row.key) && `${row.label} ${row.group} ${row.source} ${row.unit}`.toLowerCase().includes(query)
  const catalog = RNP_METRIC_GROUPS.map(group => {
    const rows = RNP_METRICS.filter(row => row.group === group && matches(row))
    if (!rows.length) return ''
    return `<div class="rnp-metric-group"><h5>${group}</h5>${rows.map(row => {
      const isFavorite = favorites.has(row.key)
      return `<div class="rnp-metric-row"><label class="check-row rnp-metric-check"><input type="checkbox" data-rnp-metric="${row.key}" data-rnp-focus="metric-${row.key}"${rnpState.metrics.includes(row.key) ? ' checked' : ''}><span class="check-control" aria-hidden="true"><svg><use href="#i-check"/></svg></span><span class="rnp-order-copy"><strong>${row.label}</strong><small data-tooltip="${row.tip}" data-tooltip-side="left">${row.source}</small></span><span class="rnp-unit-chip">${row.unit}</span></label><button class="kpi-metric-star${isFavorite ? ' is-on' : ''}" type="button" data-rnp-fav="${row.key}" data-rnp-focus="fav-${row.key}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Убрать из избранного' : 'В избранное'}: ${row.label}" data-tooltip="${isFavorite ? 'В избранном · убрать' : 'В избранное'}"><svg><use href="#i-star"/></svg></button></div>`
    }).join('')}</div>`
  }).join('')
  // Подсказка про звезду уместна только на пустом фильтре: с запросом метрики нет ни в
  // избранном, ни в общем списке — тогда честнее «не найдена».
  const emptyHint = !query && rnpMetricFilter === 'fav' ? '<svg><use href="#i-star"/></svg> Отметьте метрики звездой — они появятся здесь'
    : !query && rnpMetricFilter === 'recent' ? '<svg><use href="#i-clock"/></svg> Включите строку в таблице — последние выбранные появятся здесь'
    : 'Метрика не найдена'
  document.getElementById('rnpMetricsCatalog').innerHTML = catalog || `<p class="rnp-metrics-none">${emptyHint}</p>`
  document.getElementById('rnpMetricsCount').textContent = `в таблице ${ordered.length} из ${RNP_METRICS.length}`
  const counts = { all: RNP_METRICS.length, fav: favorites.size, recent: recents.size }
  rnpMetricsFilterBar.querySelectorAll('[data-rnp-filter]').forEach(button => {
    const active = button.dataset.rnpFilter === rnpMetricFilter
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-pressed', String(active))
    button.querySelector('span').textContent = counts[button.dataset.rnpFilter]
  })
  const isDefault = rnpState.metrics.join() === RNP_DEFAULT_KEYS.join()
  rnpMetricsDefault.classList.toggle('is-hidden', isDefault)
  rnpMetricsFoot.textContent = !ordered.length ? 'таблица пуста' : isDefault ? 'состав по умолчанию' : 'состав изменён'
  rnpMetricsTriggers.forEach(button => { button.querySelector('b').textContent = ordered.length })
}

function rerenderRnpMetrics() {
  // Пересборка панели выбрасывает из DOM узел, который только что отработал событие:
  // без возврата фокуса клавиатура теряла бы строку после каждого включения/переноса.
  const focused = document.activeElement
  const keep = focused && rnpMetricsSheet.contains(focused) ? focused.dataset.rnpFocus : null
  renderRnpMetrics()
  if (!keep) return
  const next = rnpMetricsSheet.querySelector(`[data-rnp-focus="${keep}"]`)
  if (next && !next.disabled) next.focus()
  else if (isRnpMetricsOpen()) rnpMetricsSearch.focus()
}

function applyRnpMetrics() {
  rerenderRnpMetrics()
  renderRnp()
}

function setRnpMetric(key, on) {
  const index = rnpState.metrics.indexOf(key)
  if (index < 0 && on) {
    rnpState.metrics.push(key)
    rememberRnpMetrics(key)
  }
  else if (index >= 0 && !on) rnpState.metrics.splice(index, 1)
  else return
  applyRnpMetrics()
}

function moveRnpMetric(key, direction) {
  const from = rnpState.metrics.indexOf(key)
  const to = from + direction
  if (from < 0 || to < 0 || to >= rnpState.metrics.length) return
  rnpState.metrics.splice(to, 0, ...rnpState.metrics.splice(from, 1))
  applyRnpMetrics()
}

const rnpMetricsOrder = document.getElementById('rnpMetricsOrder')
const rnpMetricsScroller = document.querySelector('.rnp-metrics-body')

// Порядок метрик перетаскиванием собран в attachOrderDrag (ниже, в блоке дока «Товаров»):
// строка и её номер живут в DOM, поэтому коммит читает порядок прямо из разметки.
attachOrderDrag(rnpMetricsOrder, {
  row: '.rnp-order-row', grip: '.rnp-order-grip', index: '.rnp-order-index', key: 'rnpOrder', scroller: rnpMetricsScroller,
  commit: keys => { rnpState.metrics = keys; applyRnpMetrics() },
  cancel: rerenderRnpMetrics,
})

// «Сбросить» чистит таблицу, а стандартный состав — отдельная кнопка, иначе очищенный
// отчёт нельзя было бы вернуть одним нажатием.
function resetRnpMetrics() {
  if (!rnpState.metrics.length) return
  rnpState.metrics = []
  applyRnpMetrics()
  showToast('Таблица очищена', 'Включите метрики в каталоге или верните стандартный состав')
}

// Пресет не попадает в «Недавние»: это не выбор пользователя, а готовый состав отчёта.
function useDefaultRnpMetrics() {
  if (rnpState.metrics.join() === RNP_DEFAULT_KEYS.join()) return
  rnpState.metrics = [...RNP_DEFAULT_KEYS]
  applyRnpMetrics()
  showToast('Стандартный состав', `${RNP_DEFAULT_KEYS.length} метрик «Недельного отчёта»`)
}

function setRnpMetricsExpanded(open) {
  rnpMetricsTriggers.forEach(button => button.setAttribute('aria-expanded', String(open)))
}

function openRnpMetrics(trigger) {
  closeRnpExportMenu(); closeContextMenu(); closeScenario(); closeFieldSelect(); closeDatePicker(); hideTooltip()
  // Панель стартует нейтрально: и поиск, и фильтр прошлого захода, иначе повторное открытие
  // встречает пустое «Избранное».
  rnpMetricsSearch.value = ''
  rnpMetricFilter = 'all'
  rnpMetricsOpener = trigger || rnpMetricsButton
  renderRnpMetrics()
  rnpMetricsSheet.classList.add('is-open')
  rnpMetricsSheet.setAttribute('aria-hidden', 'false')
  // Слой перекрывает правый край карточки, а вместе с ним и кнопку в её шапке: мёртвый
  // триггер под панелью хуже отсутствующего, поэтому на время правки он уходит.
  shell.classList.add('is-rnp-picking')
  setRnpMetricsExpanded(true)
}

function closeRnpMetrics({ restoreFocus = false } = {}) {
  const wasOpen = isRnpMetricsOpen()
  rnpMetricsSheet.classList.remove('is-open')
  rnpMetricsSheet.setAttribute('aria-hidden', 'true')
  shell.classList.remove('is-rnp-picking')
  setRnpMetricsExpanded(false)
  rnpMetricsSearch.value = ''
  if (restoreFocus && wasOpen) rnpMetricsOpener.focus()
}

function toggleRnpMetrics(trigger) {
  isRnpMetricsOpen() ? closeRnpMetrics({ restoreFocus: true }) : openRnpMetrics(trigger)
}

rnpMetricsTriggers.forEach(button => button.addEventListener('click', () => toggleRnpMetrics(button)))
rnpMetricsSheet.addEventListener('change', event => {
  const box = event.target.closest('[data-rnp-metric]')
  if (box) setRnpMetric(box.dataset.rnpMetric, box.checked)
})
rnpMetricsSheet.addEventListener('click', event => {
  if (event.target.closest('#rnpMetricsClose')) return closeRnpMetrics({ restoreFocus: true })
  if (event.target.closest('#rnpMetricsReset')) return resetRnpMetrics()
  if (event.target.closest('#rnpMetricsDefault')) return useDefaultRnpMetrics()
  const filter = event.target.closest('[data-rnp-filter]')
  if (filter) { rnpMetricFilter = filter.dataset.rnpFilter; rerenderRnpMetrics(); return }
  const star = event.target.closest('[data-rnp-fav]')
  if (star) { toggleRnpFavorite(star.dataset.rnpFav); rerenderRnpMetrics(); return }
  const move = event.target.closest('[data-rnp-move]')
  if (move) return moveRnpMetric(move.dataset.rnpMove, Number(move.dataset.direction))
  const drop = event.target.closest('[data-rnp-drop]')
  if (drop) setRnpMetric(drop.dataset.rnpDrop, false)
})
rnpMetricsSearch.addEventListener('input', renderRnpMetrics)
renderRnpMetrics()

/* ── Товары ─────────────────────────────────────────────────────────────────────────── */
// Раздел не хранит вторую правду о деньгах: каждая строка — доля сводки текущего
// демо-периода, посчитанная через rnpWeeks/rnpAggregate. Поэтому «Итого» таблицы — сумма
// строк выборки, и на неделе 27.04–03.05 она сходится с KPI «Недельного отчёта» до рубля, а
// дубликаты чисел в мокапе остаются дубликатами: себестоимость «Платья миди» 138 204 ₽ и
// маржа категории «Платья» 188 430 ₽ (app.js:20, 21).
// Кабинет и площадка — один источник, тулбарный триггер [data-menu="account"]: как в РНП
// (§4.2), выбор кабинета меняет и подпись, и состав. Продажи ведутся в «Основном кабинете»,
// «Север» и Ozon подключены, но строк с данными в демо-периоде нет.
const PRODUCTS = [
  { key: 'midi', name: 'Платье миди', sku: 'SPR-203', barcode: '4620013558271', externalId: 'WB-8841203', category: 'Платья', brand: 'Svera', marketplace: 'WB', cabinet: 'Основной кабинет', revenue: 0.334318, returnRate: 0.316767, cost: 0.327415, margin: 0.332436, price: 6190, costState: 'manual', costFrom: '2026-04-12' },
  { key: 'evening', name: 'Платье вечернее', sku: 'SPR-318', barcode: '4620013558301', externalId: 'WB-8841277', category: 'Платья', brand: 'Svera', marketplace: 'WB', cabinet: 'Основной кабинет', revenue: 0.214083, returnRate: 0.262, cost: 0.227857, margin: 0.184686, price: 8900, costState: 'priced', costFrom: '2026-03-01' },
  { key: 'blouse', name: 'Блуза базовая', sku: 'BLZ-104', barcode: '4620013558418', externalId: 'WB-8841310', category: 'Блузы', brand: 'Svera', marketplace: 'WB', cabinet: 'Основной кабинет', revenue: 0.17574, returnRate: 0.228, cost: 0.176828, margin: 0.197645, price: 3650, costState: 'manual', costFrom: '2026-04-02' },
  { key: 'skirt', name: 'Юбка миди', sku: 'SKT-221', barcode: '4620013558524', externalId: 'WB-8841422', category: 'Юбки', brand: 'Svera', marketplace: 'WB', cabinet: 'Основной кабинет', revenue: 0.075089, returnRate: 0.246, cost: 0.074578, margin: 0.07843, price: 3900, costState: 'priced', costFrom: '2026-03-01' },
  { key: 'sundress', name: 'Сарафан джинсовый', sku: 'SRF-117', barcode: '4620013558630', externalId: 'WB-8841508', category: 'Платья', brand: 'Denimova', marketplace: 'WB', cabinet: 'Основной кабинет', revenue: 0.068166, returnRate: 0.233, cost: 0.050461, margin: 0.062886, price: 4450, costState: 'manual', costFrom: '2026-02-18' },
  { key: 'pleated', name: 'Юбка плиссе', sku: 'SKT-240', barcode: '4620013558746', externalId: 'WB-8841599', category: 'Юбки', brand: 'Svera', marketplace: 'WB', cabinet: 'Основной кабинет', revenue: 0.052189, returnRate: 0.219, cost: 0.052475, margin: 0.056622, price: 4200, costState: 'stale', costFrom: '2025-11-20' },
  { key: 'top', name: 'Топ летний', sku: 'TOP-052', barcode: '4620013558852', externalId: 'WB-8841640', category: 'Прочие', brand: 'Svera', marketplace: 'WB', cabinet: 'Основной кабинет', revenue: 0.044201, returnRate: 0.184, cost: 0.04596, margin: 0.037368, price: 2350, costState: 'manual', costFrom: '2026-04-12' },
  { key: 'belt', name: 'Ремень кожаный', sku: 'BLT-009', barcode: '4620013558968', externalId: 'WB-8841712', category: 'Прочие', brand: null, marketplace: 'WB', cabinet: 'Основной кабинет', revenue: 0.022367, returnRate: 0.071, cost: 0.03021, margin: 0.028503, price: 2800, costState: 'priced', costFrom: '2026-01-15' },
  { key: 'shorts', name: 'Шорты летние', sku: 'SHT-133', barcode: '4620013559070', externalId: 'WB-8841886', category: 'Прочие', brand: 'Denimova', marketplace: 'WB', cabinet: 'Основной кабинет', revenue: 0.013846, returnRate: 0.142, cost: 0.014214, margin: 0.021424, price: 2150, costState: 'manual', costFrom: '2026-03-27' },
  { key: 'pallantine', name: 'Палантин шёлковый', sku: 'PLN-027', barcode: '4620013559186', externalId: null, category: 'Прочие', brand: 'Svera', marketplace: 'WB', cabinet: 'Основной кабинет', revenue: 0, returnRate: 0, cost: 0, margin: 0, price: 5400, costState: 'missing', costFrom: null },
  { key: 'jacket', name: 'Куртка джинсовая', sku: 'JKT-410', barcode: '4620013559292', externalId: 'WB-9012044', category: 'Прочие', brand: 'Denimova', marketplace: 'WB', cabinet: 'Север', revenue: 0, returnRate: 0, cost: 0, margin: 0, price: 9700, costState: 'missing', costFrom: null },
  { key: 'socks', name: 'Носки базовые, 5 шт', sku: 'SCK-501', barcode: '4620013559308', externalId: 'OZ-3180244', category: 'Прочие', brand: 'Svera', marketplace: 'OZ', cabinet: 'Ozon · основной', revenue: 0, returnRate: 0, cost: 0, margin: 0, price: 1190, costState: 'missing', costFrom: null },
]
const PRODUCT_BY_KEY = new Map(PRODUCTS.map(product => [product.key, product]))
const PRODUCT_COST_LABEL = { manual: 'Задана вручную', priced: 'Из прайса', stale: 'Устарела', missing: 'Не задана' }
const PRODUCTS_LIMIT = 8
// ── Каталог столбцов ──────────────────────────────────────────────────────────────────
// Референс — таблица «Мои товары» аналитики площадки: 94 столбец в шести группах, сюда
// добавлена своя группа «Расчётные» (Выручка/Выкупы/Себестоимость/Маржа/Маржинальность из
// §9 и «Статус данных»), потому что на них держится числовой контракт раздела (§12.4).
// «Заказы, ₽» и «Выкупы, ₽» каталога считаются из значений той же строки, что и колонки
// Grafio: подписи разные, вторая правда о деньгах в таблице не появляется.
// Формат строки каталога: [ключ, подпись, тип, ширина, расчёт, сумма] — «сумма» ставит в
// «Итого» осмысленный итог (складываемые величины), остальное показывается прочерком.
const PCG = [
  ['Товар', [
    ['photo', 'Фото', 'photo', 62, () => null],
    ['name', 'Название', 'name', 236, p => p.row.name],
    ['sku', 'SKU', 'mono', 92, p => p.row.sku],
    ['subject', 'Предмет', 'text', 120, p => p.subject],
    ['seller', 'Продавец', 'text', 140, p => p.seller],
    ['brand', 'Бренд', 'text', 110, p => p.row.brand],
    ['link', 'Ссылка', 'link', 100, p => p.link],
    ['glueId', 'ID склейки', 'mono', 104, p => p.glueId],
    ['commFbo', 'Комиссия FBO, %', 'pct', 120, p => p.commFbo],
    ['commFbs', 'Комиссия FBS, %', 'pct', 120, p => p.commFbs],
    ['color', 'Цвет', 'text', 106, p => p.color],
    ['country', 'Страна', 'text', 118, p => p.country],
    ['gender', 'Пол', 'text', 88, p => p.gender],
    ['category', 'Категория', 'text', 110, p => p.row.category],
    ['packL', 'Длина упаковки, см', 'int', 100, p => p.packL],
    ['packW', 'Ширина упаковки, см', 'int', 106, p => p.packW],
    ['packH', 'Высота упаковки, см', 'int', 106, p => p.packH],
    ['groups', 'Группы', 'text', 176, p => p.groups],
  ]],
  ['Заказы', [
    ['ordersAmt', 'Заказы, ₽', 'money', 126, p => p.ordersAmt, 1],
    ['avgOrderDayAmt', 'Средняя сумма заказов за день, ₽', 'money', 156, p => p.avgOrderDayAmt],
    ['lostAmt', 'Упущено заказов на сумму, ₽', 'money', 158, p => p.lostAmt],
    ['lostPct', 'Упущено заказов на сумму, %', 'pct', 150, p => p.lostPct],
    ['ordersTopShare', 'Процент от суммы заказов (топ-100)', 'pct', 176, p => p.ordersTopShare],
    ['ordersQty', 'Заказы, шт.', 'int', 100, p => p.ordersQty, 1],
    ['avgOrderWithStock', 'Средние заказы при наличии, шт.', 'num', 158, p => p.avgOrderWithStock],
    ['buyoutRate', 'Средний процент выкупа', 'pct', 150, p => p.buyoutRate],
    ['buyoutRateReturns', 'Средний процент выкупа с возвратами', 'pct', 196, p => p.buyoutRateReturns],
    ['avgOrderDayQty', 'Средние заказы за день, шт.', 'num', 150, p => p.avgOrderDayQty],
    ['daysWithOrders', 'Дней с заказами', 'int', 126, p => p.daysWithOrders],
    ['potential', 'Потенциал, ₽', 'money', 120, p => p.potential],
    ['bestHourOrders', 'Заказы за лучший час', 'int', 150, p => p.bestHourOrders],
    ['bestHoursChart', 'График лучших часов заказов', 'chart', 124, p => p.bestHours],
    ['ordersChart', 'График заказов', 'chart', 110, p => p.ordersSeries],
  ]],
  ['Выкупы', [
    ['buyoutsQty', 'Выкупы, шт.', 'int', 108, p => p.buyoutsQty, 1],
    ['buyoutsAmt', 'Выкупы, ₽', 'money', 118, p => p.buyoutsAmt, 1],
    ['buyoutsChartQty', 'График выкупов, шт.', 'chart', 126, p => p.buyoutsQtySeries],
    ['buyoutsChartAmt', 'График выкупов, ₽', 'chart', 126, p => p.buyoutsAmtSeries],
  ]],
  ['Работа с остатками', [
    ['stock', 'Остаток, шт.', 'int', 110, p => p.stock, 1],
    ['stockFbs', 'Остаток FBS, шт.', 'int', 120, p => p.stockFbs, 1],
    ['fbs', 'FBS', 'bool', 76, p => p.fbs],
    ['turnover', 'Оборачиваемость, дн.', 'num', 138, p => p.turnover],
    ['daysInStock', 'Дней в наличии', 'int', 124, p => p.daysInStock],
    ['warehouses', 'Склады', 'int', 92, p => p.warehouses],
    ['frozenPct', 'Замороженный остаток, %', 'pct', 158, p => p.frozenPct],
    ['frozenQty', 'Замороженный остаток, шт.', 'int', 156, p => p.frozenQty],
    ['frozenAmt', 'Замороженный остаток, ₽', 'money', 156, p => p.frozenAmt],
    ['sizes', 'Размеры', 'int', 96, p => p.sizes],
    ['sizesInStock', 'Размеры в наличии', 'int', 134, p => p.sizesInStock],
    ['glueItems', 'Товары в склейке', 'int', 134, p => p.glueItems],
    ['glueInStock', 'Товары с остатком в склейке', 'int', 186, p => p.glueInStock],
    ['sizesChart', 'График количества размеров', 'chart', 162, p => p.sizesSeries],
    ['warehousesChart', 'График количества складов', 'chart', 162, p => p.warehousesSeries],
    ['stockChart', 'График остатков', 'chart', 120, p => p.stockSeries],
  ]],
  ['Ценообразование', [
    ['basePrice', 'Базовая цена, ₽', 'money', 126, p => p.basePrice],
    ['discount', 'Скидка, %', 'pct', 100, p => p.discount],
    ['walletPrice', 'Цена с WB Кошельком, ₽', 'money', 168, p => p.walletPrice],
    ['spp', 'СПП, %', 'pct', 86, p => p.spp],
    ['sppPrice', 'Цена СПП, ₽', 'money', 118, p => p.sppPrice],
    ['minPrice', 'Минимальная цена, ₽', 'money', 138, p => p.minPrice],
    ['maxPrice', 'Максимальная цена, ₽', 'money', 138, p => p.maxPrice],
    ['avgPrice', 'Средняя цена, ₽', 'money', 126, p => p.avgPrice],
    ['medianPrice', 'Медианная цена, ₽', 'money', 138, p => p.medianPrice],
    ['priceChart', 'График изменения цены', 'chart', 132, p => p.priceSeries],
  ]],
  ['Продвижение', [
    ['fracRating', 'Дробный рейтинг', 'num2', 118, p => p.fracRating],
    ['rating', 'Рейтинг', 'int', 92, p => p.rating],
    ['recentRating', 'Средний рейтинг последних отзывов', 'num2', 176, p => p.recentRating],
    ['negativeShare', 'Доля последних негативных отзывов, %', 'pct', 208, p => p.negativeShare],
    ['mpstatsRating', 'Рейтинг карточки MPSTATS', 'num0', 168, p => p.mpstatsRating],
    ['reviews', 'Отзывы, шт.', 'int', 110, p => p.reviews, 1],
    ['ordersPerReview', 'Заказов на 1 отзыв, шт.', 'num', 160, p => p.ordersPerReview],
    ['nameChars', 'Символов в названии', 'int', 150, p => p.nameChars],
    ['descChars', 'Символов в описании', 'int', 154, p => p.descChars],
    ['video', 'Видео', 'bool', 78, p => p.video],
    ['photos', 'Количество фото', 'int', 132, p => p.photos],
    ['daysOnMarket', 'Дней на маркетплейсе', 'int', 162, p => p.daysOnMarket],
    ['externalAd', 'Внешняя реклама', 'bool', 138, p => p.externalAd],
    ['queries', 'Количество поисковых запросов', 'int', 186, p => p.queries],
    ['queriesTop100', 'Количество поисковых запросов (топ-100)', 'int', 214, p => p.queriesTop100],
    ['organicPos', 'Средняя позиция в органике', 'num', 164, p => p.organicPos],
    ['searchPos', 'Средняя позиция в поиске', 'num', 158, p => p.searchPos],
    ['adQueries', 'Количество запросов в рекламе', 'int', 182, p => p.adQueries],
    ['adPos', 'Средняя позиция в рекламе', 'num', 164, p => p.adPos],
    ['adRate', 'Средняя рекламная ставка, ₽', 'money', 182, p => p.adRate],
    ['categoryPos', 'Позиция в категории', 'int', 138, p => p.categoryPos],
    ['categories', 'Категории', 'int', 108, p => p.categories],
    ['visibilityTop100', 'Видимость в категориях (топ-100)', 'int', 202, p => p.visibilityTop100],
    ['categoryPosAvg', 'Средняя позиция в категории', 'num', 182, p => p.categoryPosAvg],
    ['promos', 'Количество акций', 'int', 128, p => p.promos],
    ['discovered', 'Дата обнаружения', 'date', 142, p => p.discovered],
    ['firstReview', 'Дата первого отзыва', 'date', 152, p => p.firstReview],
    ['categoriesChart', 'График категорий', 'chart', 132, p => p.categoriesSeries],
    ['categoryPosChart', 'График позиции в категориях', 'chart', 168, p => p.categoryPosSeries],
    ['queriesChart', 'График запросов', 'chart', 122, p => p.queriesSeries],
    ['searchPosChart', 'График позиции в поиске', 'chart', 160, p => p.searchPosSeries],
  ]],
  ['Расчётные', [
    ['revenue', 'Выручка', 'money', 116, p => p.revenue, 1],
    ['buyouts', 'Выкупы', 'money', 116, p => p.buyouts, 1],
    ['cost', 'Себестоимость', 'money', 124, p => p.cost, 1],
    ['margin', 'Маржа', 'money', 112, p => p.margin, 1],
    ['marginability', 'Маржинальность', 'pct', 130, p => p.marginability],
    ['status', 'Статус данных', 'status', 156, p => p.row.key],
  ]],
]
const PRODUCT_COLUMNS = PCG.flatMap(([group, list]) => list.map(([key, label, type, width, get, sum]) => ({
  key, label, type, group, get, sum: Boolean(sum),
  // Заголовок не должен резаться чаще, чем это нужно: минимальная ширина считается по
  // подписи, но не больше 280 px — длинное название всё равно читается в подсказке.
  width: Math.max(width, Math.min(280, Math.round(label.length * 6.2) + 30)),
})))
const PRODUCT_COLUMN_BY_KEY = new Map(PRODUCT_COLUMNS.map(column => [column.key, column]))
const PRODUCT_GROUPS = PCG.map(([group]) => group)
// Подписи-ключи help-текста совпадают с референсными («Товар / Фото»), поэтому панель
// «Помощь» берёт описание по тому же ключу и не разъезжается с заголовком столбца.
const PRODUCT_HELP = {
  'Товар / Фото': 'Фотография товара',
  'Товар / Название': 'Название товара',
  'Товар / SKU': 'Идентификатор товарной позиции',
  'Товар / Предмет': 'Товарная категория на маркетплейсе, которую указывает продавец',
  'Товар / Продавец': 'Название продавца',
  'Товар / Бренд': 'Название бренда',
  'Товар / Ссылка': 'Ссылка на страницу товара на Wildberries',
  'Товар / ID склейки': 'Уникальный идентификатор товара, который помогает отследить все объединенные карточки',
  'Товар / Комиссия FBO, %': 'Средняя комиссия Wildberries по предмету на последний день отчета для товаров, которые продаются по схеме FBO (хранятся на складах площадки)',
  'Товар / Комиссия FBS, %': 'Средняя комиссия Wildberries по предмету на последний день отчета для товаров, которые продаются по схеме FBS (хранятся на складах продавца)',
  'Товар / Цвет': 'Цвет товара',
  'Товар / Страна': 'Страна-производитель товара',
  'Товар / Пол': 'Пол покупателя, для которого предназначен товар',
  'Товар / Категория': 'Категория маркетплейса, к которой относился товар в последний день выбранного периода',
  'Товар / Длина упаковки, см': 'Длина упаковки товара',
  'Товар / Ширина упаковки, см': 'Ширина упаковки товара',
  'Товар / Высота упаковки, см': 'Высота упаковки товара',
  'Товар / Группы': 'Группы в MPSTATS, в которые добавлен товар',
  'Заказы / Заказы, ₽': 'Общая стоимость заказов товара за выбранный период. Определяем по тому, как менялся остаток товара',
  'Заказы / Средняя сумма заказов за день, ₽': 'Какую сумму в среднем приносят заказы товара за день. Как считаем: Заказы, ₽ / Дней в отчете',
  'Заказы / Упущено заказов на сумму, ₽': 'Какую сумму могли принести заказы товара за те дни, когда его не было в наличии. Как считаем: Потенциал – Заказы, ₽',
  'Заказы / Упущено заказов на сумму, %': 'Доля упущенной суммы заказов от потенциальной суммы заказов. Как считаем: (Упущенная сумма заказов / Потенциал) * 100%',
  'Заказы / Процент от суммы заказов (топ-100)': 'Средний процент суммы заказов этого товара от суммы заказов 100 самых продаваемых товаров в предмете',
  'Заказы / Заказы, шт.': 'Сколько раз товар заказали за выбранный период. Определяем по тому, как менялся остаток товара',
  'Заказы / Средние заказы при наличии, шт.': 'Сколько раз за день в среднем заказывали товар, если он был в наличии на конец дня',
  'Заказы / Средний процент выкупа': 'Средний процент выкупленных заказов от общего числа заказов товара. Считаем по обезличенным заказам, которые получили по API Wildberries за последние 50 дней',
  'Заказы / Средний процент выкупа с возвратами': 'Средний процент выкупленных заказов от общего числа заказов товара. Учли возвраты. Считаем по обезличенным заказам, которые получили по API Wildberries за последние 50 дней',
  'Заказы / Средние заказы за день, шт.': 'Сколько раз за день в среднем заказывали товар за выбранный период. Как считаем: Заказы, шт. / Дней в отчете',
  'Заказы / Дней с заказами': 'Количество дней в выбранном периоде, когда товар заказали хотя бы 1 раз',
  'Заказы / Потенциал, ₽': 'Какую сумму принесли бы товары в отчете, если бы они всегда были в наличии. Как считаем: (Заказы, ₽ / Количество дней в наличии) * Дней в отчете',
  'Заказы / Заказы за лучший час': 'Сколько заказов было у товара в тот час, когда его заказывали больше всего',
  'Заказы / График лучших часов заказов': 'В какие часы товар заказывают больше всего. Рассчитываем средние заказы по часам за все дни выбранного периода',
  'Заказы / График заказов': 'Сколько раз в день покупали товар за выбранный период',
  'Выкупы / Выкупы, шт.': 'Сколько раз покупатели выкупили товар. Считаем по всем складам – FBO+FBS',
  'Выкупы / Выкупы, ₽': 'Общая стоимость выкупленных товаров. Считаем по всем складам – FBO+FBS',
  'Выкупы / График выкупов, шт.': 'Количество выкупов в выбранном периоде по дням. Считаем по всем складам – FBO+FBS',
  'Выкупы / График выкупов, ₽': 'Сумма выкупа в выбранном периоде по дням. Считаем по всем складам – FBO+FBS',
  'Работа с остатками / Остаток, шт.': 'Сколько товара было на складах в последний день отчета',
  'Работа с остатками / Остаток FBS, шт.': 'Сколько товара было на складах продавца в последний день выбранного периода',
  'Работа с остатками / FBS': 'Хранится ли товар на складах продавца',
  'Работа с остатками / Оборачиваемость, дн.': 'Показывает, сколько дней нужно, чтобы продать средний остаток товара. Чем меньше этот показатель, тем товар продается быстрее. Значит, быстрее окупаются вложения в товар. Как считаем: Работа с остатками > Наличие / Заказы > Среднее при наличии',
  'Работа с остатками / Дней в наличии': 'Количество дней, когда товар был в наличии на конец дня',
  'Работа с остатками / Склады': 'Количество складов, на которых в последний день отчета были остатки товара',
  'Работа с остатками / Замороженный остаток, %': 'Доля товара, который не будет продан за 45 дней, от общего количества товара. Как считаем: (Суммарные остатки / Замороженный остаток) * 100%',
  'Работа с остатками / Замороженный остаток, шт.': 'Товары, которые не будут проданы за 45 дней. Учитываем текущую скорость заказов. Как считаем: Суммарные остатки – (Среднее количество заказов при наличии * 45)',
  'Работа с остатками / Замороженный остаток, ₽': 'Общая стоимость товара, который не будет продан за 45 дней. Как считаем: Замороженный остаток * Цена со скидкой',
  'Работа с остатками / Размеры': 'Количество размеров товара',
  'Работа с остатками / Размеры в наличии': 'Сколько размеров товара было в наличии на последний день выбранного периода',
  'Работа с остатками / Товары в склейке': 'Сколько вариантов (объединенных карточек) было у товара на последний день выбранного периода',
  'Работа с остатками / Товары с остатком в склейке': 'Сколько вариантов товара (объединенных карточек) было в наличии на последний день выбранного периода',
  'Работа с остатками / График количества размеров': 'Сколько размеров товара было в наличии за каждый день выбранного периода',
  'Работа с остатками / График количества складов': 'Количество складов, на которых за выбранный период были остатки товара на конец дня',
  'Работа с остатками / График остатков': 'Сколько остатков товара было на конец дня за выбранный период. Учитываем все размеры',
  'Ценообразование / Базовая цена, ₽': 'Базовая цена товара. Эту цену на Wildberries покупатель видит зачеркнутой',
  'Ценообразование / Скидка, %': 'Размер скидки на последний день выбранного периода',
  'Ценообразование / Цена с WB Кошельком, ₽': 'Цена товара с дополнительной скидкой для покупателей, которые используют WB Кошелек',
  'Ценообразование / СПП, %': 'Размер скидки постоянного покупателя',
  'Ценообразование / Цена СПП, ₽': 'Цена товара с учетом скидки постоянного покупателя',
  'Ценообразование / Минимальная цена, ₽': 'Самая низкая цена товара за выбранный период',
  'Ценообразование / Максимальная цена, ₽': 'Самая высокая цена товара за выбранный период',
  'Ценообразование / Средняя цена, ₽': 'Сколько в среднем стоил товар в выбранном периоде. Как считаем: Заказы, ₽ / Заказы, шт.',
  'Ценообразование / Медианная цена, ₽': 'Цена, которая находится ровно посередине списка цен на товары с заказами: одна половина цен ниже этого значения, другая – выше',
  'Ценообразование / График изменения цены': 'Как менялась цена товара со скидкой по дням за выбранный период',
  'Продвижение / Дробный рейтинг': 'Оценка товара на маркетплейсе',
  'Продвижение / Рейтинг': 'Оценка товара на маркетплейсе, округленная до целого числа',
  'Продвижение / Средний рейтинг последних отзывов': 'Средняя оценка покупателей в последних 15 отзывах',
  'Продвижение / Доля последних негативных отзывов, %': 'Сколько отзывов из последних 15 были негативными. Негативными считаем отзывы, у которых 1, 2 и 3 звезды',
  'Продвижение / Рейтинг карточки MPSTATS': 'Рейтинг карточки по версии MPSTATS. Чем подробнее заполнена карточка, тем выше рейтинг',
  'Продвижение / Отзывы, шт.': 'Количество отзывов на товар',
  'Продвижение / Заказов на 1 отзыв, шт.': 'Сколько заказов приходится на 1 отзыв. Например, за выбранный период покупатели заказали товар 150 раз и оставили 10 отзывов. Получается, что на 1 отзыв приходится 15 заказов',
  'Продвижение / Символов в названии': 'Длина названия товара с учетом пробелов',
  'Продвижение / Символов в описании': 'Длина описания товара с учетом пробелов',
  'Продвижение / Видео': 'Есть ли видео в карточке товара',
  'Продвижение / Количество фото': 'Количество фотографий в карточке товара',
  'Продвижение / Дней на маркетплейсе': 'Сколько дней прошло с момента, когда мы обнаружили товар на маркетплейсе',
  'Продвижение / Внешняя реклама': 'Рекламировался ли товар на сторонних площадках',
  'Продвижение / Количество поисковых запросов': 'Количество поисковых запросов, по которым мы встретили товар за последний день выбранного периода',
  'Продвижение / Количество поисковых запросов (топ-100)': 'Количество поисковых запросов, по которым мы встретили товар на первой странице выдачи. Данные на последний день отчета',
  'Продвижение / Средняя позиция в органике': 'Средняя позиция товара по запросам в органической выдаче на последний день выбранного периода. Органическая выдача не содержит товаров, которые используют рекламу',
  'Продвижение / Средняя позиция в поиске': 'Средняя позиция товара по поисковым запросам на последний день выбранного периода. Как считаем: Сумма всех позиций в поисковой выдаче / Количество поисковых запросов в этот день',
  'Продвижение / Количество запросов в рекламе': 'Количество поисковых запросов, по которым мы встретили товар в рекламе',
  'Продвижение / Средняя позиция в рекламе': 'Средняя позиция товара на последний день отчета. Учитываем только те запросы, по которым встретили товар в рекламе',
  'Продвижение / Средняя рекламная ставка, ₽': 'Средняя ставка за 1 000 показов для рекламных запросов. Данные на последний день отчета (данные до 16.09.2025)',
  'Продвижение / Позиция в категории': 'Позиция товара в категории',
  'Продвижение / Категории': 'Количество категорий, к которым относился товар на последний день отчета',
  'Продвижение / Видимость в категориях (топ-100)': 'Количество категорий и подкатегорий, в которых мы встретили товар на первой странице (не дальше 100 позиции). Данные на последний день отчета',
  'Продвижение / Средняя позиция в категории': 'Средняя позиция товара во всех категориях в последний день выбранного периода',
  'Продвижение / Количество акций': 'Количество акций, в которых мы встретили товар на последний день отчета',
  'Продвижение / Дата обнаружения': 'Дата, когда роботы-парсеры MPSTATS впервые обнаружили товар на маркетплейсе',
  'Продвижение / Дата первого отзыва': 'Дата, когда покупатели оставили первый отзыв на товар',
  'Продвижение / График категорий': 'Как по дням менялось количество категорий, к которым относится товар',
  'Продвижение / График позиции в категориях': 'Как менялась средняя позиция товара в категориях за каждый день отчета',
  'Продвижение / График запросов': 'Как по дням менялось количество запросов, по которым мы встретили товар',
  'Продвижение / График позиции в поиске': 'Как по дням менялась средняя позиция товара в поисковой выдаче',
  'Расчётные / Выручка': 'Оплаченные заказы дня до вычета возвратов — та же строка, что в недельном отчёте и РНП.',
  'Расчётные / Выкупы': 'Выручка минус возвраты. База для маржи и маржинальности.',
  'Расчётные / Себестоимость': 'Закупочная стоимость выкупленных товаров: из прайса или заданная вручную в карточке товара.',
  'Расчётные / Маржа': 'Выкупы минус себестоимость и расходы.',
  'Расчётные / Маржинальность': 'Маржа / выкупы.',
  'Расчётные / Статус данных': 'Признак того, что себестоимость актуальна и маржа по товару рассчитывается.',
}
const PRODUCT_DEFAULT_COLUMNS = ['photo', 'name', 'sku', 'revenue', 'buyouts', 'cost', 'margin', 'marginability', 'status']
// Кластер «Товар» по умолчанию: чекбокс залипает всегда, эти три столбца — пока их не открепили.
const PRODUCT_PIN_DEFAULT = ['photo', 'name', 'sku']
// Ступени масштаба таблицы: ниже 80 % подписи сливаются, выше 130 % карточка перестаёт
// вмещать даже липкий кластер.
const PRODUCT_SCALES = [0.8, 0.9, 1, 1.1, 1.2, 1.3]
const productNumeric = type => type === 'money' || type === 'int' || type === 'pct' || type.startsWith('num')
const productSortable = column => column.type !== 'photo' && column.type !== 'chart'
// В строке фильтров шапки остаётся место только под текстовое поле: у булевой колонки значение
// выбирается условием в панели, а график и статус фильтруются только там же.
const productInlineFilter = column => productFilterable(column) && column.type !== 'bool'
const productAttr = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const productsState = {
  sort: { key: null, dir: 'asc' }, page: 1, screen: 'normal', product: 'midi', planMonth: '2026-05', costPage: 1, planPage: 1,
  columns: readStoreList('grafio.productsColumns', key => PRODUCT_COLUMN_BY_KEY.has(key)),
  widths: readStoreMap('grafio.productsWidths'),
  filters: new Map(), selected: new Set(), collapsed: new Set(), expanded: new Set(), dock: null,
  settings: readStoreObject('grafio.productsSettings', { autoHeight: false, scale: 1, pinned: [...PRODUCT_PIN_DEFAULT] }),
  views: readStoreList('grafio.productsViews', view => view && typeof view.name === 'string'),
  savedFilters: readStoreList('grafio.productsSavedFilters', filter => filter && typeof filter.name === 'string'),
}
if (!productsState.columns.length) productsState.columns = [...PRODUCT_DEFAULT_COLUMNS]
// В настройках лежит то, что пользователь накопил в localStorage: набор закрепления чистим по
// живым ключам столбцов, масштаб принимаем только со ступеней линейки.
productsState.settings.pinned = (Array.isArray(productsState.settings.pinned) ? productsState.settings.pinned : PRODUCT_PIN_DEFAULT).filter(key => PRODUCT_COLUMN_BY_KEY.has(key))
if (!PRODUCT_SCALES.includes(productsState.settings.scale)) productsState.settings.scale = 1
const productDate = iso => iso ? dayLabel(new Date(`${iso}T00:00:00`)) : '—'
const productMonthLabel = month => new Date(`${month}-01T00:00:00`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })


// Остаток от округления кладём на последнюю строку: она самая мелкая (26 000 ₽), и ±несколько
// рублей на ней не видны, зато сумма строк остаётся равной сводке периода.
const productsFixLast = (values, total) => {
  if (values.length) values[values.length - 1] += total - values.reduce((sum, value) => sum + value, 0)
  return values
}

function productsPeriod() {
  const trigger = document.getElementById('periodTrigger')
  const from = trigger.dataset.from, to = trigger.dataset.to
  const weeks = rnpWeeks(from, to)
  const filled = weeks.flatMap(week => week.days).filter(day => day.inside && day.filled).map(day => day.values)
  return {
    from, to, weeks, days: filled.length,
    label: rangeLabel(new Date(`${from}T00:00:00`), new Date(`${to}T00:00:00`)),
    aggregate: rnpAggregate(filled),
  }
}

// ── Сравнение выборки с предыдущим окном ────────────────────────────────────────────────
// Плитки сводки отвечают на вопрос «хорошо это или плохо», поэтому дельты считаются из тех
// же долей, что раскладывает по строкам productRows, а не сочиняются рядом с вёрсткой.
// Предыдущее окно — столько же заполненных дней, стоящих вплотную перед периодом.
function productsPrevWindow(period) {
  const to = new Date(`${period.from}T00:00:00`)
  to.setDate(to.getDate() - 1)
  const from = new Date(to)
  from.setDate(from.getDate() - (period.days - 1))
  const days = []
  for (let cursor = new Date(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
    const raw = rnpDay(isoDate(cursor))
    if (raw) days.push(raw)
  }
  return { from: isoDate(from), to: isoDate(to), label: rangeLabel(from, to), days: days.length, aggregate: rnpAggregate(days) }
}

// Итоги тех же строк для произвольного окна. На текущем агрегате даёт те же числа, что и
// totals в renderProducts, — сверено замером, а не на веру (расхождение только в округлении
// по строкам: здесь остаток на последнюю строку не кладём, для дельты важны доли).
function productsWindowTotals(rows, aggregate) {
  return rows.filter(row => row.values).reduce((acc, row) => {
    const base = PRODUCT_BY_KEY.get(row.key)
    const revenue = aggregate.revenue * base.revenue
    acc.revenue += revenue
    acc.buyouts += revenue * (1 - base.returnRate)
    acc.cost += row.cost
    // Маржа строки = базовые себестоимость и маржа окна минус заданная себестоимость — та же
    // поправка на ручную закупку, что в productRows, поэтому правка цены уезжает в оба окна.
    acc.margin += aggregate.cost * base.cost + aggregate.margin * base.margin - row.cost
    return acc
  }, { revenue: 0, buyouts: 0, cost: 0, margin: 0 })
}

// Тон дельты — по смыслу бизнеса, а не по математическому знаку: для выручки и маржи рост
// хорош, а для доли себестоимости — наоборот (worseWhenUp). Цвета берутся те же, что у KPI-
// карточек недельного отчёта (.positive/.negative). Нулевое прошлое окно — не «бесконечный
// рост», а прочерк: сравнивать не с чем.
const productDelta = (current, previous, worseWhenUp = false) => !previous || !Number.isFinite(current) ? null
  : { text: `${current >= previous ? '+' : '−'}${rnpPercent(Math.abs(current / previous - 1)).replace('%', '\u00A0%')}`, tone: (current >= previous) !== worseWhenUp ? 'positive' : 'negative' }
const productPointDelta = (current, previous, worseWhenUp = false) => current === null || previous === null || !Number.isFinite(current + previous) ? null
  : { text: `${current >= previous ? '+' : '−'}${(Math.abs(current - previous) * 100).toFixed(1).replace('.', ',')}\u00A0п.п.`, tone: (current >= previous) !== worseWhenUp ? 'positive' : 'negative' }

function productRows(period) {
  const sold = PRODUCTS.filter(product => product.revenue > 0)
  const share = key => productsFixLast(sold.map(product => Math.round(period.aggregate[key] * product[key])), period.aggregate[key])
  const revenue = share('revenue'), cost = share('cost'), margin = share('margin')
  const returns = productsFixLast(sold.map((product, index) => Math.round(revenue[index] * product.returnRate)), period.aggregate.returns)
  return PRODUCTS.map(product => {
    const index = sold.indexOf(product)
    if (index < 0) return { ...product, values: null }
    const buyouts = revenue[index] - returns[index]
    // Расходы не меняются вместе с себестоимостью: правка цены закупки должна двигать маржу,
    // а не «съедать» её расходами, как это делает родской расчёт.
    const expenses = buyouts - cost[index] - margin[index]
    const costValue = product.costValue ?? cost[index]
    const marginValue = buyouts - costValue - expenses
    return {
      ...product, values: true,
      revenue: revenue[index], returns: returns[index], buyouts, expenses,
      cost: costValue, margin: marginValue, marginability: buyouts ? marginValue / buyouts : null,
      orders: Math.round((revenue[index] + returns[index]) / product.price),
      qty: Math.round(buyouts / product.price),
      baselineCost: cost[index], baselineMargin: margin[index],
    }
  })
}

// ── Профиль строки для референсных столбцов ──────────────────────────────────────────
// Все 94 столбца площадки считаются из одного профиля, а не из независимых генераторов:
// «Потенциал» не может оказаться меньше «Заказов, ₽», «Минимальная цена» — больше средней,
// а «График выкупов, ₽» обязан суммироваться в «Выкупы, ₽» той же строки. Источник
// случайности — хеш ключа товара (rnpHash), поэтому набор чисел не гуляет между
// перерисовками и у разных товаров разный.
// Товары без продаж в периоде (pallantine, jacket, socks) получают прочерк во всех
// группах, кроме «Товар»: карточка существует, а наблюдений по периоду — нет.
function productProfile(row, period) {
  const salt = field => rnpHash(`${row.key}:${field}`)
  const int = (field, min, max) => min + salt(field) % (max - min + 1)
  const float = (field, min, max, digits = 3) => +(min + (salt(field) % 1000) / 999 * (max - min)).toFixed(digits)
  const pick = (field, list) => list[salt(field) % list.length]
  const sold = Boolean(row.values)
  const z = value => sold ? value : null
  // Разбивка величины по дням периода: веса из хеша, остаток округления на последнем дне,
  // поэтому сумма столбца-графика равна числу в соответствующей колонке.
  const spread = (field, total, points) => {
    if (!sold || total == null) return null
    const weights = Array.from({ length: points }, (_, index) => 0.45 + (rnpHash(`${row.key}:${field}:${index}`) % 110) / 100)
    const sum = weights.reduce((acc, weight) => acc + weight, 0)
    return productsFixLast(weights.map(weight => Math.round(total * weight / sum)), total)
  }
  const levels = (field, points, min, max) => sold ? Array.from({ length: points }, (_, index) => int(`${field}:${index}`, min, max)) : null
  const days = Math.max(1, period.days)
  const points = Math.min(days, 14)
  const price = row.price
  const revenue = sold ? row.revenue : null
  const orders = sold ? row.orders : null
  const daysInStock = z(int('daysInStock', Math.max(1, days - 3), days))
  const potential = z(Math.round(revenue / daysInStock * days))
  const avgOrderWithStock = z(+(orders / daysInStock).toFixed(1))
  const stock = z(Math.max(24, Math.round(orders * float('stock', 1.4, 6.2, 2))))
  const stockFbs = z(Math.round(stock * float('stockFbs', 0.08, 0.62, 2)))
  const sizes = z(int('sizes', 2, 8))
  const categories = z(int('categories', 1, 9))
  const queries = z(int('queries', 60, 4200))
  const avgPrice = z(orders ? Math.round(revenue / orders) : price)
  const daysOnMarket = z(int('daysOnMarket', 60, 940))
  const discovered = sold ? productShiftDate(period.to, -daysOnMarket) : null
  const frozenQty = z(Math.max(0, stock - Math.round(avgOrderWithStock * 45)))
  const groupNames = ['Летняя капсула', 'Бестселлеры', 'Планы на сезон', 'Брак 2025', 'Тест цен', 'Прайс 04.26']
  return {
    row, period, sold,
    // Товар: карточка есть у всех строк, включая те, что без продаж.
    subject: row.name.split(' ')[0],
    seller: 'ООО «Верена»',
    link: row.externalId ? `wb/${row.externalId.replace(/\D/g, '')}` : null,
    glueId: String(int('glueId', 1000000, 9000000)),
    commFbo: float('commFbo', 0.15, 0.25, 3),
    commFbs: float('commFbs', 0.19, 0.31, 3),
    color: pick('color', ['чёрный', 'молочный', 'бежевый', 'синий', 'красный', 'изумрудный', 'серый']),
    country: pick('country', ['Россия', 'Китай', 'Турция', 'Бангладеш', 'Италия', 'Узбекистан']),
    gender: row.category === 'Прочие' ? pick('gender', ['женский', 'унисекс', 'мужской']) : 'женский',
    packL: int('packL', 20, 62), packW: int('packW', 15, 48), packH: int('packH', 3, 14),
    groups: Array.from(new Set(Array.from({ length: int('groupCount', 1, 3) }, (_, index) => pick(`group${index}`, groupNames)))).join(', '),
    // Заказы и выкупы — из той же строки, что и колонки Grafio.
    ordersAmt: revenue, avgOrderDayAmt: z(Math.round(revenue / days)),
    lostAmt: z(potential - revenue), lostPct: z(+(potential ? (potential - revenue) / potential : 0).toFixed(3)),
    ordersTopShare: z(float('ordersTopShare', 0.004, 0.062)),
    ordersQty: orders, avgOrderWithStock,
    buyoutRate: z(+(1 - row.returnRate).toFixed(3)),
    buyoutRateReturns: z(+(1 - row.returnRate - float('buyoutReturns', 0.02, 0.12)).toFixed(3)),
    avgOrderDayQty: z(+(orders / days).toFixed(1)),
    daysWithOrders: z(int('daysWithOrders', Math.max(1, daysInStock - 2), daysInStock)),
    potential, bestHourOrders: z(int('bestHour', 2, Math.max(4, Math.ceil(orders / days * 2)))),
    bestHours: levels('bestHours', 12, 1, Math.max(3, Math.ceil(orders / 6))),
    ordersSeries: spread('ordersSeries', orders, points),
    buyoutsQty: sold ? row.qty : null, buyoutsAmt: sold ? row.buyouts : null,
    buyoutsQtySeries: spread('buyoutsQty', row.qty, points), buyoutsAmtSeries: spread('buyoutsAmt', row.buyouts, points),
    // Остатки
    stock, stockFbs, fbs: z(stockFbs > 0),
    turnover: z(Math.min(320, +(stock / Math.max(0.5, avgOrderWithStock)).toFixed(1))),
    daysInStock, warehouses: z(int('warehouses', 1, 6)),
    frozenQty,
    frozenAmt: z(frozenQty * price),
    frozenPct: z(+(frozenQty / stock).toFixed(3)),
    sizes, sizesInStock: z(int('sizesInStock', 1, sizes)),
    glueItems: z(int('glueItems', 1, 6)), glueInStock: z(int('glueInStock', 1, 6)),
    sizesSeries: levels('sizesSeries', points, 1, sizes), warehousesSeries: levels('warehousesSeries', points, 1, 6),
    stockSeries: spread('stockSeries', stock, points),
    // Цены: базовая — та, что покупатель видит зачёркнутой; средняя лежит между минимальной
    // и максимальной по построению, а не по случайной удаче.
    basePrice: z(Math.round(price / (1 - float('discount', 0.35, 0.72)))),
    discount: z(float('discount', 0.35, 0.72)),
    walletPrice: z(Math.round(price * 0.75)),
    spp: z(float('spp', 0.05, 0.24)), sppPrice: z(Math.round(price * (1 - float('spp', 0.05, 0.24)))),
    minPrice: z(Math.round(avgPrice * 0.88)), maxPrice: z(Math.round(avgPrice * 1.16)),
    avgPrice, medianPrice: z(Math.round(avgPrice * float('median', 0.94, 1.04, 2))),
    priceSeries: levels('priceSeries', points, Math.round(avgPrice * 0.9), Math.round(avgPrice * 1.12)),
    // Продвижение
    fracRating: z(float('fracRating', 4.1, 4.95, 2)), rating: z(Math.round(float('fracRating', 4.1, 4.95, 2))),
    recentRating: z(float('recentRating', 3.6, 5, 2)),
    negativeShare: z(float('negativeShare', 0, 0.28)),
    mpstatsRating: z(int('mpstatsRating', 62, 98)),
    reviews: z(Math.max(3, Math.round(orders * float('reviews', 0.05, 0.3, 2)))),
    ordersPerReview: z(+(orders / Math.max(1, Math.round(orders * float('reviews', 0.05, 0.3, 2)))).toFixed(1)),
    nameChars: z(row.name.length), descChars: z(int('descChars', 700, 2600)),
    video: z(salt('video') % 3 === 0), photos: z(int('photos', 4, 15)),
    daysOnMarket, externalAd: z(salt('externalAd') % 2 === 0),
    queries, queriesTop100: z(Math.round(queries * float('queriesTop100', 0.15, 0.7, 2))),
    organicPos: z(float('organicPos', 3, 90, 1)),
    searchPos: z(+(float('organicPos', 3, 90, 1) * float('searchPos', 1.02, 1.42, 2)).toFixed(1)),
    adQueries: z(Math.round(queries * float('adQueries', 0.1, 0.6, 2))),
    adPos: z(float('adPos', 2, 60, 1)), adRate: z(int('adRate', 280, 1900)),
    categoryPos: z(int('categoryPos', 3, 480)), categories,
    visibilityTop100: z(int('visibilityTop100', 0, 4)),
    categoryPosAvg: z(float('categoryPosAvg', 2, 60, 1)), promos: z(int('promos', 0, 7)),
    discovered, firstReview: sold ? productShiftDate(discovered, Math.min(int('firstReview', 20, 240), daysOnMarket - 5)) : null,
    categoriesSeries: levels('categoriesSeries', points, 1, categories),
    categoryPosSeries: levels('categoryPosSeries', points, 1, 60),
    queriesSeries: spread('queriesSeries', queries, points),
    searchPosSeries: levels('searchPosSeries', points, 1, 90),
    // Расчётные колонки Grafio — те же числа, что в строке таблицы и в «Итого».
    revenue: sold ? row.revenue : null, buyouts: sold ? row.buyouts : null,
    cost: sold ? row.cost : null, margin: sold ? row.margin : null, marginability: sold ? row.marginability : null,
  }
}

function productShiftDate(iso, offsetDays) {
  const date = new Date(`${iso}T00:00:00`)
  date.setDate(date.getDate() + offsetDays)
  return isoDate(date)
}

const PRODUCT_CELL_TEXT = {
  money: value => `${rnpNumber.format(value)} ₽`,
  int: value => rnpNumber.format(value),
  pct: value => rnpPercent(value),
  num: value => value.toFixed(1).replace('.', ','),
  num2: value => value.toFixed(2).replace('.', ','),
  num0: value => rnpNumber.format(value),
  date: value => productDate(value),
  bool: value => value ? 'Да' : 'Нет',
}

function productCellText(column, value) {
  if (value == null || value === '' || Array.isArray(value)) return null
  const format = PRODUCT_CELL_TEXT[column.type]
  return format ? format(value) : String(value)
}

function productStatus(row) {
  if (!row.values) return { tone: 'muted', text: 'Нет данных', note: 'Нет продаж в периоде и не задана себестоимость' }
  if (row.costState === 'missing') return { tone: 'warning', text: 'Нет себестоимости', note: 'Маржа по товару не рассчитывается' }
  if (row.costState === 'stale') return { tone: 'warning', text: 'Требует проверки', note: `Себестоимость от ${productDate(row.costFrom)} — прайс менялся с той даты` }
  return { tone: 'good', text: 'Данные полные', note: `${PRODUCT_COST_LABEL[row.costState]} · от ${productDate(row.costFrom)}` }
}

function productAccountIndex() {
  const index = menuData.account.findIndex(entry => entry.selected)
  return index < 0 ? 0 : index
}

// ── Отбор строк: фильтры по столбцам, сортировка ──────────────────────────────────────
// Операторы текстовых колонок — дословно из референса («Содержит … Заканчивается на»); для
// чисел, булевых и дат свои наборы, потому что «Содержит» в «Марже» смысла не имеет.
// Значение сравнивается с сырым числом из профиля, а не с отформатированной строкой: фильтр
// «234» должен ловить 234 875 ₽, несмотря на неразрывный пробел в подписи.
const PRODUCT_FILTER_OPERATORS = {
  text: [['contains', 'Содержит'], ['notContains', 'Не содержит'], ['eq', 'Равно'], ['ne', 'Не равно'], ['startsWith', 'Начинается с'], ['endsWith', 'Заканчивается на']],
  number: [['gte', 'Больше или равно'], ['gt', 'Больше'], ['lte', 'Меньше или равно'], ['lt', 'Меньше'], ['eq', 'Равно'], ['ne', 'Не равно']],
  bool: [['eq', 'Да'], ['ne', 'Нет']],
  date: [['gte', 'Не раньше'], ['lte', 'Не позже'], ['eq', 'Равно']],
}
const productFilterKind = column => productNumeric(column.type) ? 'number' : column.type === 'bool' ? 'bool' : column.type === 'date' ? 'date' : 'text'
const productFilterable = column => !['photo', 'chart', 'status'].includes(column.type)
const productOperators = column => PRODUCT_FILTER_OPERATORS[productFilterKind(column)]
const productDefaultOperator = column => productOperators(column)[0][0]
const productOperatorLabel = (column, op) => (productOperators(column).find(entry => entry[0] === op) || ['', ''])[1]
const productNumber = text => {
  const clean = String(text).replace(/[^\d.,-]/g, '').replace(',', '.')
  return clean && Number.isFinite(Number(clean)) ? Number(clean) : null
}
// Даты в таблице — «дд.мм.гггг», но поле принимает и ISO: условие могло прийти из панели,
// где значения лежат в состоянии сырыми.
const productIso = text => {
  const raw = String(text).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const parts = raw.match(/^(\d{1,2})[.](\d{1,2})[.](\d{4})$/)
  return parts ? `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}` : null
}

function productMatches(column, value, filter) {
  if (column.type === 'bool') return filter.op === 'eq' ? Boolean(value) : value === false
  if (value == null) return false
  if (productNumeric(column.type)) {
    const target = productNumber(filter.value)
    if (target == null) return true
    switch (filter.op) {
      case 'gt': return value > target
      case 'lt': return value < target
      case 'lte': return value <= target
      case 'eq': return value === target
      case 'ne': return value !== target
      default: return value >= target
    }
  }
  if (column.type === 'date') {
    const target = productIso(filter.value)
    if (!target) return true
    return filter.op === 'lte' ? value <= target : filter.op === 'eq' ? value === target : value >= target
  }
  const left = String(value).toLowerCase()
  const right = String(filter.value).trim().toLowerCase()
  if (!right) return true
  switch (filter.op) {
    case 'notContains': return !left.includes(right)
    case 'eq': return left === right
    case 'ne': return left !== right
    case 'startsWith': return left.startsWith(right)
    case 'endsWith': return left.endsWith(right)
    default: return left.includes(right)
  }
}

// Условие считается применённым только с флажка on: оператор в панели выбирается до того,
// как пользователь введёт значение, и черновик не должен резать выборку.
const activeProductFilters = () => [...productsState.filters].filter(([key, filter]) => PRODUCT_COLUMN_BY_KEY.has(key) && filter.on)

function productSortValue(column, profile) {
  if (column.type === 'status') return ['good', 'warning', 'muted'].indexOf(productStatus(profile.row).tone)
  if (column.type === 'chart') return null
  return column.get(profile)
}

function visibleProducts(rows, profiles) {
  const account = menuData.account[productAccountIndex()]
  const filters = activeProductFilters()
  const matched = rows.filter(row => {
    // Кабинет и период приходят из тулбара, остальное сужение — фильтры по столбцам.
    if (row.cabinet !== account.title) return false
    const profile = profiles.get(row.key)
    return filters.every(([key, filter]) => {
      const column = PRODUCT_COLUMN_BY_KEY.get(key)
      return productMatches(column, column.get(profile), filter)
    })
  })
  const { key, dir } = productsState.sort
  if (!key) return matched
  const column = PRODUCT_COLUMN_BY_KEY.get(key)
  const factor = dir === 'asc' ? 1 : -1
  return [...matched].sort((a, b) => {
    const left = column ? productSortValue(column, profiles.get(a.key)) : a[key]
    const right = column ? productSortValue(column, profiles.get(b.key)) : b[key]
    if (left == null || right == null) return (left == null ? 1 : 0) - (right == null ? 1 : 0)
    return (typeof left === 'string' ? left.localeCompare(right, 'ru') : left - right) * factor
  })
}

// ── Разметка таблицы ──────────────────────────────────────────────────────────────────
const PRODUCT_CHECK_WIDTH = 34
const productWidth = column => Math.max(56, Number(productsState.widths[column.key]) || column.width)
const productVisibleColumns = () => productsState.columns.map(key => PRODUCT_COLUMN_BY_KEY.get(key)).filter(Boolean)
// Липнет начало таблицы до последней закреплённой колонки включительно: пользователь держит
// в наборе только столбцы, а «дыра» между залипшими клетками физически невозможна — сетка
// закрепляется силком через соседей, как в табличных редакторах.
let productSticky = new Set(['check'])
function productSetupSticky(columns) {
  const keys = new Set(['check'])
  for (const column of columns) {
    if (!productsState.settings.pinned.includes(column.key)) break
    keys.add(column.key)
  }
  return productSticky = keys
}
function setProductPin(key) {
  const columns = productVisibleColumns()
  const index = columns.findIndex(column => column.key === key)
  if (index < 0) return
  const wasPinned = productSticky.has(key)
  const pinned = wasPinned ? columns.slice(0, index) : columns.slice(0, index + 1)
  // Ширины столбцов живут в собственной системе координат таблицы, а clientWidth прокрутки —
  // в экранных пикселях: на масштабе 0,8 в поле зрения влезает на четверть больше сетки.
  const scale = productsState.settings.scale || 1
  const width = pinned.reduce((sum, column) => sum + productWidth(column), 0) + PRODUCT_CHECK_WIDTH
  // Закреплять шире, чем видно, бессмысленно: под кластером не останется ни одного столбца,
  // который можно прочитать, а скролл перестанет что-то двигать.
  const room = Math.round(productsScroll.clientWidth / scale) - 120
  if (width > room) return showToast('Зона закрепления слишком широкая', `${width} px из ${room}`)
  productsState.settings.pinned = pinned.map(column => column.key)
  persistProductsSettings()
  renderProducts()
  showToast(wasPinned ? 'Столбцы откреплены' : 'Столбцы закреплены', `${productSticky.size} из ${columns.length + 1}`)
}
// Смещение пишут на клетку в applyProductStickyLeft: таблицу растягивает width:100%, и left из
// productsState.widths не совпал бы с фактической геометрией, а на масштабе — тем более.
const productAttrs = (key, ...classes) => ` class="${[...classes, productSticky.has(key) ? 'is-sticky' : ''].filter(Boolean).join(' ')}"`

// Кнопка закрепления одна на два входа: чип в углу заголовка и кнопка в строке панели
// «Столбцы». В шапке чип прячется, когда не хватает места (is-pin-tight), поэтому панель —
// гарантированный доступ к любому столбцу; обработчик у обоих один, [data-products-pin].
const productPinButton = (column, cls, focus) => {
  const pinned = productSticky.has(column.key)
  const hint = focus ? `data-products-focus="${focus}"` : `data-tooltip="${pinned ? 'Открепить этот столбец и все правее' : 'Закрепить этот столбец и все левее'}" data-tooltip-side="bottom"`
  return `<button type="button" class="${cls}${pinned ? ' is-on' : ''}" data-products-pin="${column.key}" ${hint} aria-pressed="${pinned}" aria-label="${pinned ? 'Открепить' : 'Закрепить'}: ${productAttr(column.label)}"><svg><use href="#i-pin"/></svg></button>`
}

// Масштаб — степпер в подвале карточки: он относится ко всей сетке, а не к одному столбцу,
// поэтому в доке «Настройки» ему тесно, а в шапке он спорил бы с вкладками панелей.
function productsZoomHTML() {
  const index = PRODUCT_SCALES.indexOf(productsState.settings.scale)
  const step = value => `<button type="button" class="products-zoom-btn" data-products-zoom="${value}" aria-label="${value < 0 ? 'Уменьшить масштаб таблицы' : 'Увеличить масштаб таблицы'}"${index + value < 0 || index + value > PRODUCT_SCALES.length - 1 ? ' disabled' : ''}><svg><use href="#i-${value < 0 ? 'minus' : 'plus'}"/></svg></button>`
  return `<span class="products-zoom" role="group" aria-label="Масштаб таблицы">${step(-1)}<button type="button" class="products-zoom-value" data-products-zoom="0" aria-label="Вернуть масштаб 100 %"${index === PRODUCT_SCALES.indexOf(1) ? ' disabled' : ''}>${Math.round(productsState.settings.scale * 100)} %</button>${step(1)}</span>`
}

function setProductScale(step) {
  const index = PRODUCT_SCALES.indexOf(productsState.settings.scale)
  const next = Number(step) === 0 ? PRODUCT_SCALES.indexOf(1) : Math.min(PRODUCT_SCALES.length - 1, Math.max(0, index + Number(step)))
  if (next === index) return
  productsState.settings.scale = PRODUCT_SCALES[next]
  persistProductsSettings()
  // Пересборка всей таблицы, а не правка одного style: zoom множит и sticky-смещения, и ручку
  // закрепления, и привязку поповера фильтра к воронке — всё это пересчитывается в renderProducts.
  renderProducts()
}
const productSpark = (values, column) => {
  if (!values || !values.length) return '<span class="products-cell-text products-hollow">—</span>'
  const max = Math.max(...values, 1)
  const min = Math.min(...values)
  const tip = productAttr(`${column.label}: от ${rnpNumber.format(min)} до ${rnpNumber.format(max)} за ${values.length} дн.`)
  return `<span class="products-spark" data-tooltip="${tip}" data-tooltip-side="top">${values.map(value => `<i style="height:${Math.max(10, Math.round(value / max * 100))}%"></i>`).join('')}</span>`
}

function productCellHTML(column, profile) {
  const value = column.get(profile)
  if (column.type === 'photo') return `<span class="products-thumb is-photo" style="--hue:${rnpHash(`${profile.row.key}:hue`) % 360}" aria-hidden="true"><svg><use href="#i-box"/></svg></span>`
  if (column.type === 'name') return `<span class="products-name"><strong>${profile.row.name}</strong><small>${profile.row.marketplace} · ${profile.row.cabinet}</small></span>`
  if (column.type === 'status') {
    const status = productStatus(profile.row)
    // Подпись чипа в обёртке: без неё текст вылезал бы за ячейку уже при «По ширине таблицы»,
    // и у последнего столбца появлялась лишняя горизонтальная прокрутка карточки.
    return `<span class="status-chip ${status.tone}" data-tooltip="${productAttr(status.note)}" data-tooltip-side="left"><span class="status-light ${status.tone}"></span><span class="products-cell-text">${status.text}</span></span>`
  }
  if (column.type === 'chart') return productSpark(value, column)
  const text = productCellText(column, value)
  if (text == null) return '<span class="products-cell-text products-hollow">—</span>'
  if (column.type === 'link') return `<span class="products-cell-text products-mono is-link"><svg><use href="#i-link"/></svg>${text}</span>`
  return `<span class="products-cell-text${column.type === 'mono' ? ' products-mono' : ''}">${productAttr(text)}</span>`
}

// Поле ряда фильтров пересобирается вместе с шапкой: без возврата каретки ввод условия
// обрывался бы на первом символе.
function restoreProductFilterCaret(key) {
  if (!key) return
  const input = document.querySelector(`#productsTable [data-products-col-filter="${key}"]`)
  if (!input) return
  input.focus()
  input.setSelectionRange(input.value.length, input.value.length)
}

function renderProducts() {
  hideTooltip()
  const typing = document.activeElement?.dataset?.productsColFilter || null
  const period = productsPeriod()
  // Демо-состояния §5.1: «пусто» обнуляет сам набор строк, а не только таблицу, — иначе
  // счётчики читались бы как 0 из 12 и противоречили бы пустому блоку ниже.
  const rows = productsState.screen === 'empty' ? [] : productRows(period)
  const profiles = new Map(rows.map(row => [row.key, productProfile(row, period)]))
  const visible = visibleProducts(rows, profiles)
  const account = menuData.account[productAccountIndex()]
  const pages = Math.max(1, Math.ceil(visible.length / PRODUCTS_LIMIT))
  productsState.page = Math.min(productsState.page, pages)
  const page = visible.slice((productsState.page - 1) * PRODUCTS_LIMIT, productsState.page * PRODUCTS_LIMIT)
  const money = value => `${rnpNumber.format(value)} ₽`
  const sold = visible.filter(row => row.values)
  const totals = sold.reduce((acc, row) => ({
    revenue: acc.revenue + row.revenue, buyouts: acc.buyouts + row.buyouts, cost: acc.cost + row.cost,
    margin: acc.margin + row.margin, expenses: acc.expenses + row.expenses,
  }), { revenue: 0, buyouts: 0, cost: 0, margin: 0, expenses: 0 })
  const attention = visible.filter(row => productStatus(row).tone === 'warning').length
  const loading = productsState.screen === 'loading'
  const columns = productVisibleColumns()
  const filters = activeProductFilters()
  syncProductScreenState()
  productSetupSticky(columns)

  document.getElementById('productsSubtitle').textContent = 'Управление каталогом товаров и себестоимостью'
  document.getElementById('productsPeriodChip').textContent = period.label
  // Скелет — только у тех чисел, что считаются из строк таблицы: кабинет и период приходят из
  // тулбара и во время загрузки тоже настоящие.
  const skw = (text, scale) => `<span class="products-skeleton" style="width:${Math.max(46, Math.min(132, Math.round(String(text).length * scale)))}px"></span>`
  // ── Сводка «Товаров»: контекст строкой + четыре плитки со сравнением (мокап E) ───────────
  // Дельты берутся из тех же долей, что раскладывают таблицу по строкам, поэтому «плюс» над
  // строкой и «Итого» под ней не могут разойтись. Окно сравнения — столько же заполненных
  // дней вплотную перед периодом, а не «та же дата прошлого года», которой в демо нет.
  const prevWindow = productsPrevWindow(period)
  const prevTotals = productsWindowTotals(sold, prevWindow.aggregate)
  const share = value => value === null || !Number.isFinite(value) ? '—' : rnpPercent(value).replace('%', '\u00A0%')
  const marginability = totals.buyouts ? totals.margin / totals.buyouts : null
  const costShare = totals.buyouts ? totals.cost / totals.buyouts : null
  const expensesShare = totals.buyouts ? totals.expenses / totals.buyouts : null
  const prevMarginability = prevTotals.buyouts ? prevTotals.margin / prevTotals.buyouts : null
  const prevCostShare = prevTotals.buyouts ? prevTotals.cost / prevTotals.buyouts : null
  // «К прошлой неделе» честно только тогда, когда период и есть одна полная неделя пн–вс,
  // и предыдущее окно тоже сложено из семи дней. Иначе — по числу дней, как оно есть.
  const wholeWeek = period.weeks.length === 1 && period.weeks[0].days.every(day => day.inside && day.filled)
  const vsCaption = wholeWeek && prevWindow.days === 7 ? 'к прошлой неделе' : `к предыдущим ${prevWindow.days} дн.`
  const compare = (delta, base) => delta
    ? `<span class="${delta.tone}" data-tooltip="${productAttr(`${vsCaption}: ${base}`)}" data-tooltip-side="top">${delta.text}</span>`
    : `<span class="products-hollow" data-tooltip="${prevWindow.days ? 'в окне сравнения нет выкупов — делить не на что' : 'предыдущих дней с данными нет'}" data-tooltip-side="top">—</span>`
  document.getElementById('productsCounters').innerHTML = `<div class="products-strip-line">
      <b data-tooltip="менется в тулбаре" data-tooltip-side="bottom">${account.title} · ${RNP_MARKETPLACES[account.mark] ?? account.mark}</b>
      <i>·</i><span>${period.label}</span>
      <i>·</i><span class="products-strip-dim">${period.days} дн. с данными</span>
      ${prevWindow.days ? `<i>·</i><span class="products-strip-dim">сравнение: ${prevWindow.label}</span>` : ''}
      ${// Чип держит слот и во время загрузки: без него строка на 12 px ниже, и таблица
        // подпрыгивает в момент, когда данные пришли. В «Пусто» он «Нет данных» — зелёная
        // «Данные полные» против «0 из 0» читалась бы как противоречие.
        loading ? '<span class="status-chip"><span class="products-skeleton" style="width:96px"></span></span>' : visible.length
        ? `<span class="status-chip ${attention ? 'warning' : 'good'}"><span class="status-light ${attention ? 'warning' : 'good'}"></span>${attention ? `Требуют внимания: ${attention}` : 'Данные полные'}</span>`
        : '<span class="status-chip muted"><span class="status-light"></span>Нет данных</span>'}
    </div>
    <div class="products-tiles">${[
      ['ВЫРУЧКА ВЫБОРКИ', money(totals.revenue), `${money(totals.buyouts)} выкупов`,
        compare(productDelta(totals.revenue, prevTotals.revenue), money(prevTotals.revenue)),
        `выкупы ${money(totals.buyouts)} · возвраты ${share(period.aggregate.returnShare)} выручки`],
      ['МАРЖА ВЫБОРКИ', money(totals.margin), `Маржинальность ${share(marginability)}`,
        compare(productDelta(totals.margin, prevTotals.margin), money(prevTotals.margin)),
        `маржа к выкупам ${share(marginability)}${prevMarginability === null ? '' : ` · было ${share(prevMarginability)}`}`],
      ['СЕБЕСТОИМОСТЬ ВЫБОРКИ', money(totals.cost), `Доля в выкупах ${share(costShare)}`,
        compare(productPointDelta(costShare, prevCostShare, true), `доля ${share(prevCostShare)}`),
        `расходы периода ${money(totals.expenses)} · ${share(expensesShare)} выкупов`],
      ['ТОВАРОВ В ВЫБОРКЕ', `${visible.length} из ${rows.length}`, `${sold.length} с продажами`, '',
        `фильтры таблицы сужают список`],
    ].map(([label, value, note, aside, tip]) => {
      // Во время загрузки скелет ставим и в правый слот строки: без него плитка на 12 px ниже,
      // и таблица под плашкой подпрыгивает в момент, когда данные пришли. Пустой слот не
      // заполняем — в плитке «Товаров» правого показателя нет никогда.
      const slot = aside ? (loading ? '<span class="products-skeleton" style="width:34px"></span>' : aside) : ''
      return `<div class="products-tile"><span>${label}</span><strong${loading ? '' : ` tabindex="0" data-tooltip="${productAttr(tip)}" data-tooltip-side="top"`}>${loading ? skw(value, 6.6) : value}</strong><div class="products-tile-row"><small>${loading ? skw(note, 4.8) : note}</small>${slot}</div></div>`
    }).join('')}</div>`
  bindTooltips(document.getElementById('productsCounters'))

  document.getElementById('productsTableNote').textContent = [
    'Строка товара открывает карточку',
    'Итого — сумма строк выборки, а не свода периода',
    `столбцов ${columns.length} из ${PRODUCT_COLUMNS.length}`,
    filters.length ? `фильтров: ${filters.length}` : null,
  ].filter(Boolean).join(' · ') + '.'
  renderProductsSelection()

  const table = document.getElementById('productsTable')
  table.classList.toggle('is-auto-height', productsState.settings.autoHeight)
  // Масштаб — на самом <table>: zoom множит и ширины colgroup, и высоты строк, и sticky-смещения
  // разом, поэтому сетка остаётся самой собой — только крупнее или мельче.
  table.style.zoom = productsState.settings.scale

  if (!columns.length) {
    // Пустой набор столбцов — не ошибка и не «нет данных»: сетку собирает панель «Столбцы»,
    // и пока там ничего не включено, показывать таблицу не из чего.
    table.innerHTML = ''
    document.getElementById('productsFoot').innerHTML = '<div class="products-empty"><span class="plan-empty-icon"><svg><use href="#i-layout"/></svg></span><h2>В таблице нет столбцов</h2><p>Включите столбцы в панели «Столбцы» в шапке таблицы — набор и порядок переживают перезагрузку.</p><button class="secondary-button" type="button" data-products-dock="columns"><svg><use href="#i-layout"/></svg><span>Открыть «Столбцы»</span></button></div>'
    syncProductsDock()
    return
  }

  const colgroup = `<colgroup><col class="products-check-col" style="width:${PRODUCT_CHECK_WIDTH}px">${columns.map(column => `<col data-products-col="${column.key}" style="width:${productWidth(column)}px">`).join('')}</colgroup>`
  const checkAll = page.length > 0 && page.every(row => productsState.selected.has(row.key))
  const headCheck = `<th${productAttrs('check', 'products-check-col')}><label class="check-row is-single"><input type="checkbox" data-products-check="all"${checkAll ? ' checked' : ''} aria-label="Выбрать товары на странице"><span class="check-control" aria-hidden="true"><svg><use href="#i-check"/></svg></span></label></th>`
  const groupRuns = []
  columns.forEach(column => {
    const last = groupRuns[groupRuns.length - 1]
    if (last && last.group === column.group) { last.span += 1; last.sticky += productSticky.has(column.key) ? 1 : 0 }
    else groupRuns.push({ group: column.group, span: 1, sticky: productSticky.has(column.key) ? 1 : 0 })
  })
  // Полоса группы тоже обязана залипать: без неё «Товар» уезжал из-под закреплённых столбцов.
  // Если группа шире кластера, режем её на границе — залипшая часть держит подпись, остаток
  // скроллится (приём из сеток с закреплёнными колонками; подпись повторяется намеренно).
  const groupCells = groupRuns.flatMap(run => {
    const cell = (span, sticky) => {
      const classes = [span === 1 ? 'is-single' : '', sticky ? 'is-sticky' : ''].filter(Boolean)
      return `<th colspan="${span}"${classes.length ? ` class="${classes.join(' ')}"` : ''}><span>${run.group}</span></th>`
    }
    return run.sticky && run.sticky < run.span ? [cell(run.sticky, true), cell(run.span - run.sticky, false)] : [cell(run.span, Boolean(run.sticky))]
  })
  const groupRow = `<tr class="products-head-group"><th${productAttrs('check', 'products-check-col')}></th>${groupCells.join('')}</tr>`
  const titleRow = `<tr class="products-head-title">${headCheck}${columns.map(column => {
    const active = productsState.sort.key === column.key
    const ariaSort = active ? (productsState.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
    const icon = active ? (productsState.sort.dir === 'asc' ? '#i-chevron' : '#i-chevron-down') : '#i-compare'
    const tip = productAttr(PRODUCT_HELP[`${column.group} / ${column.label}`] ?? column.label)
    const title = productSortable(column)
      ? `<button type="button" class="products-sort${active ? ' is-active' : ''}" data-products-sort="${column.key}" aria-label="Сортировать по «${productAttr(column.label)}»" data-tooltip="${tip}" data-tooltip-side="bottom"><span>${productAttr(column.label)}</span><svg class="products-sort-icon${active ? ` is-${productsState.sort.dir}` : ''}"><use href="${icon}"/></svg></button>`
      : `<span class="products-sort is-static" data-tooltip="${tip}" data-tooltip-side="bottom"><span>${productAttr(column.label)}</span></span>`
    // Кнопка закрепления — внутри той же клетки, что и сортировка: «придержать колонку слева»
    // пользователь ищет на её заголовке. Показана только на наведении или фокусе, а там, где
    // подпись доходит до уголка (фото 62 px, «Себестоимость» в 124 px), чип прячет
    // is-pin-tight из applyProductStickyLeft — иначе он лёг бы на текст. Постоянный признак
    // закрепления — правая граница кластера (.is-sticky-edge); тот же чип дублирует панель
    // «Столбцы», где места хватает всегда.
    const pin = productPinButton(column, 'products-pin')
    // data-products-col на самой клетке — точка попадания переноса: по ней bindProductColumnDrag
    // понимает, какой столбец зажали. Полосы групп и строка «Итого» остаются без признака:
    // их клетки накрывают по несколько столбцов, см. productColumnCells.
    return `<th scope="col" aria-sort="${ariaSort}" data-products-col="${column.key}"${productAttrs(column.key, productNumeric(column.type) ? 'products-num-col' : '', column.type === 'photo' ? 'is-center' : '')}>${title}${pin}<span class="products-resize" data-products-resize="${column.key}"></span></th>`
  }).join('')}</tr>`
  const filterRow = `<tr class="products-head-filter"><th${productAttrs('check', 'products-check-col')}></th>${columns.map(column => {
    const filter = productsState.filters.get(column.key)
    // Воронка открывает поповер своего столбца прямо над шапкой: путь «в панель Фильтры →
    // найти строку → развернуть» для одной колонки был длиннее самого фильтра.
    const funnel = `<button type="button" class="products-col-filter-open${filter?.on ? ' is-on' : ''}" data-products-filter-pop="${column.key}" aria-haspopup="dialog" aria-expanded="false" aria-label="Фильтр: ${productAttr(column.label)}"><svg><use href="#i-filter"/></svg></button>`
    // Столбцы без текстового отбора (график, фото, статус, «да/нет») остаются пустыми клетками
    // строки: без них ряд фильтров расползся бы относительно шапки.
    if (!productInlineFilter(column)) return `<th${productAttrs(column.key, 'products-filter-cell', productFilterable(column) ? 'is-quiet' : 'is-off')}>${productFilterable(column) ? funnel : ''}</th>`
    const kind = productFilterKind(column)
    return `<th${productAttrs(column.key, 'products-filter-cell')}><label class="products-col-filter"><input type="text" inputmode="${kind === 'number' ? 'decimal' : 'text'}" placeholder="Фильтровать..." value="${productAttr(filter?.value ?? '')}" data-products-col-filter="${column.key}" data-products-focus="filter-${column.key}" aria-label="Фильтр по «${productAttr(column.label)}»">${funnel}</label></th>`
  }).join('')}</tr>`

  const bodyRow = row => `<tr class="products-row${row.values ? '' : ' is-hollow'}${productsState.selected.has(row.key) ? ' is-selected' : ''}" data-product="${row.key}" tabindex="0">`
    + `<td${productAttrs('check', 'products-check-col')}><label class="check-row is-single"><input type="checkbox" data-products-check="${row.key}"${productsState.selected.has(row.key) ? ' checked' : ''} aria-label="Выбрать: ${productAttr(row.name)}"><span class="check-control" aria-hidden="true"><svg><use href="#i-check"/></svg></span></label></td>`
    + columns.map(column => `<td${productAttrs(column.key, productNumeric(column.type) ? 'products-num' : '', column.type === 'photo' ? 'is-center' : '', row.values ? '' : 'is-hollow')}>${productCellHTML(column, profiles.get(row.key))}</td>`).join('') + '</tr>'

  const totalCell = column => {
    if (column.key === 'marginability') return `<td class="products-num">${totals.buyouts ? rnpPercent(totals.margin / totals.buyouts) : '—'}</td>`
    if (column.key === 'status') return `<td>${attention ? `${attention} треб.` : 'полные'}</td>`
    if (!column.sum) return '<td class="products-hollow">—</td>'
    const values = sold.map(row => column.get(profiles.get(row.key))).filter(value => typeof value === 'number')
    if (!values.length) return '<td class="products-hollow">—</td>'
    const sum = values.reduce((acc, value) => acc + value, 0)
    return `<td class="products-num${column.key === 'buyouts' || column.key === 'buyoutsAmt' ? ' products-strong' : ''}">${productAttr(productCellText(column, sum))}</td>`
  }

  if (loading) {
    // Заголовки скелета — те же три строки и тот же липкий кластер, что в обычном состоянии:
    // иначе без кнопки-обводки колонки слипаются, а при горизонтальном скролле шапка стоит,
    // а плитки уезжают.
    const bar = width => `<span class="products-skeleton" style="width:${Math.max(40, Math.min(width - 24, 112))}px"></span>`
    const skelRow = () => `<tr class="products-skeleton-row"><td${productAttrs('check', 'products-check-col')}></td>${columns.map(column => {
      if (column.type === 'photo') return `<td${productAttrs(column.key, 'is-center')}><span class="products-skeleton products-skeleton-tile"></span></td>`
      if (column.type === 'name') return `<td${productAttrs(column.key, 'products-name-cell')}><span class="products-name">${bar(productWidth(column))}${bar(productWidth(column) - 40)}</span></td>`
      return `<td${productAttrs(column.key, productNumeric(column.type) ? 'products-num' : '')}>${bar(productWidth(column))}</td>`
    }).join('')}</tr>`
    const skelTitles = columns.map(column => `<th${productAttrs(column.key, productNumeric(column.type) ? 'products-num-col' : '', column.type === 'photo' ? 'is-center' : '')}><span class="products-sort" aria-hidden="true"><span>${bar(productWidth(column))}</span></span></th>`).join('')
    const skelGroup = () => {
      const sticky = productSticky.size - 1
      const bar = `<span class="products-skeleton" style="width:72px"></span>`
      return sticky && sticky < columns.length ? `<th colspan="${sticky}" class="is-sticky">${bar}</th><th colspan="${columns.length - sticky}">${bar}</th>`
        : `<th colspan="${columns.length}">${bar}</th>`
    }
    table.innerHTML = `${colgroup}<thead><tr class="products-head-group"><th${productAttrs('check', 'products-check-col')}></th>${skelGroup()}</tr><tr class="products-head-title">${headCheck}${skelTitles}</tr><tr class="products-head-filter"><th${productAttrs('check', 'products-check-col')}></th>${columns.map(column => `<th${productAttrs(column.key, 'products-filter-cell', 'is-off')}></th>`).join('')}</tr></thead><tbody>${Array.from({ length: PRODUCTS_LIMIT }, skelRow).join('')}</tbody>`
    document.getElementById('productsFoot').innerHTML = ''
    applyProductStickyLeft()
    syncProductsDock()
    return
  }

  if (!visible.length) {
    // Родской пустой блок (ProductsPage.tsx:31-42) остаётся текстом дословно; кнопку очистки
    // добавляем только когда есть что очищать — при пустом кабинете фильтры молчат.
    const filtered = Boolean(filters.length)
    // Под отбором сетку держим: ряд фильтров живёт в шапке, и без неё условие нельзя ни
    // поправить, ни снять — каретка терялась на символе, после которого совпадений нет.
    table.innerHTML = filtered ? `${colgroup}<thead>${groupRow}${titleRow}${filterRow}</thead><tbody></tbody>` : ''
    document.getElementById('productsFoot').innerHTML = `<div class="products-empty"><span class="plan-empty-icon"><svg><use href="#i-box"/></svg></span><h2>${filtered ? 'Ничего не найдено' : 'Товаров пока нет'}</h2><p>${filtered ? 'Ни одна строка не прошла отбор по столбцам. Измените условия или сбросьте их.' : 'Товары появятся автоматически после синхронизации данных с маркетплейса'}</p>${
      filters.length ? '<button class="secondary-button" type="button" data-products-clear-filters><svg><use href="#i-rotate-ccw"/></svg><span>Сбросить фильтры</span></button>' : ''}</div>`
    applyProductStickyLeft()
    syncProductsDock()
    restoreProductFilterCaret(typing)
    return
  }

  // Подпись «Итого» занимает ровно залипшую часть таблицы: иначе при скролле она уезжала бы
  // из-под кластера, а её место заползало бы поверх чисел. Одна клетка под неё нужна всегда:
  // при полностью откреплённой таблице colspan="0" ряд «Итого» становился длиннее сетки на
  // клетку, и все числа съезжали на столбец вправо.
  const labelSpan = Math.max(1, productSticky.size - 1)
  table.innerHTML = `${colgroup}<thead>${groupRow}${titleRow}${filterRow}</thead><tbody>${page.map(bodyRow).join('')}</tbody>`
    + `<tfoot><tr class="products-total"><td${productAttrs('check', 'products-check-col')}>Σ</td>`
    // Без кластера подпись залипать не на что — она едет вместе с таблицей.
    + `<td${productSticky.size > 1 ? ' class="is-sticky"' : ''} colspan="${labelSpan}">Итого · ${visible.length} товаров · ${sold.length} с продажами</td>`
    + columns.slice(labelSpan).map(column => totalCell(column)).join('') + '</tr></tfoot>'

  const pager = pages > 1 ? `<span class="products-pager"><button class="secondary-button" type="button" data-products-page="-1"${productsState.page === 1 ? ' disabled' : ''}><svg><use href="#i-chevron-left"/></svg><span>Назад</span></button><b>${productsState.page} / ${pages}</b><button class="secondary-button" type="button" data-products-page="1"${productsState.page === pages ? ' disabled' : ''}><span>Вперёд</span><svg><use href="#i-chevron"/></svg></button></span>` : ''
  document.getElementById('productsFoot').innerHTML = `<span>${(productsState.page - 1) * PRODUCTS_LIMIT + 1}–${Math.min(productsState.page * PRODUCTS_LIMIT, visible.length)} из ${visible.length}</span>`
    + `<span class="products-foot-side">${productsZoomHTML()}${pager}</span>`
  bindTooltips(table)
  applyProductStickyLeft()
  // Панель дока — зеркало состояния таблицы: счётчики, тумблеры и бейдж фильтров должны
  // перерисовываться вместе с ней, а не только там, где их породил клик.
  syncProductsDock()
  restoreProductFilterCaret(typing)
}


function bindTooltips(root) {
  root.querySelectorAll('[data-tooltip]').forEach(node => {
    node.addEventListener('pointerenter', () => showTooltip(node))
    node.addEventListener('pointerleave', hideTooltip)
    node.addEventListener('focus', () => showTooltip(node))
    node.addEventListener('blur', hideTooltip)
  })
}

// ── Демо-состояние списка ─────────────────────────────────────────────────────────────
// Переключатель сидит в правом конце общего тулбара, рядом с «Состоянием» недельного
// отчёта, и показывается только в «Товарах»: своего ряда фильтров на странице больше нет
// (кабинет и период — в тулбаре, сузение по колонке — в шапке таблицы), так что это
// единственный локальный переключатель экрана.
function syncProductScreenState() {
  document.querySelectorAll('#productsToolbarState [data-products-screen]').forEach(button => {
    const active = button.dataset.productsScreen === productsState.screen
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-pressed', String(active))
  })
}

function setProductScreen(screen) {
  productsState.screen = screen
  productsState.page = 1
  renderProducts()
}

function sortProducts(key) {
  const same = productsState.sort.key === key
  productsState.sort = { key, dir: same && productsState.sort.dir === 'asc' ? 'desc' : 'asc' }
  renderProducts()
}

// Выделение перекрашивает строку и чип, но не пересобирает таблицу: полный рендер на каждый
// клик уводил бы фокус из-под клавиатуры и сбрасывал прокрутку.
function toggleProductSelection(key, on) {
  if (on) productsState.selected.add(key)
  else productsState.selected.delete(key)
  const row = document.querySelector(`.products-row[data-product="${CSS.escape(key)}"]`)
  row?.classList.toggle('is-selected', on)
  renderProductsSelection()
}

function renderProductsSelection() {
  const count = productsState.selected.size
  document.getElementById('productsSelection').innerHTML = count
    ? `<span class="status-chip"><span class="status-light"></span>Выбрано ${count}</span><button type="button" data-products-clear-selection>Снять выделение</button>`
    : ''
}


// ── Док таблицы: Столбцы / Фильтры / Настройки / Помощь ───────────────────────────────
// Правый край экрана занят вертикальной полосой вкладок, а не кнопкой в шапке карточки:
// настройка относится к таблице, поэтому сидит рядом с ней и перекрывает только правый край
// прокрутки. Открытая вкладка живёт в productsState — перерисовка таблицы по смене периода
// не должна «забывать» панель.
const productsDock = document.getElementById('productsDock')
const productsDockPanel = document.getElementById('productsDockPanel')
const productsDockBody = document.getElementById('productsDockBody')
const productsDockFoot = document.getElementById('productsDockFoot')
const productsDockTitle = document.getElementById('productsDockTitle')
const productsDockNote = document.getElementById('productsDockNote')
const productsDockSearch = document.getElementById('productsDockSearch')
const productsDockBadge = document.getElementById('productsDockFilterCount')
// Вкладки переехали в шапку карточки, а productsDock остался подложкой панели: список
// берём по полосе вкладок, а не по доку, иначе syncProductsDock не нашёл бы ни одной кнопки.
const productsDockTabs = [...document.querySelectorAll('.products-dock-tabs [data-products-dock]')]
const productsScroll = document.getElementById('productsScroll')
let productsDockOpener = null

const PRODUCT_DOCK_TABS = {
  columns: { title: 'Столбцы', note: 'состав и порядок', search: 'Поиск по столбцам' },
  filters: { title: 'Фильтры', note: 'отбор по значениям', search: 'Поиск по столбцам фильтров' },
  settings: { title: 'Настройки', note: 'ширины, высота, представления', search: 'Поиск по настройкам' },
  help: { title: 'Помощь', note: 'что значит столбец', search: 'Поиск по описаниям' },
}
const isProductsDockOpen = () => Boolean(productsState.dock)
const productsDockHelp = column => PRODUCT_HELP[`${column.group} / ${column.label}`] || column.label

// Панель фильтров показывает и снятые со стола столбцы, если условие на них осталось: иначе
// фильтр продолжал бы резать выборку из-за строки, которой в таблице нет.
function productsFilterColumns() {
  const visible = productVisibleColumns().filter(productFilterable)
  const known = new Set(visible.map(column => column.key))
  const orphaned = activeProductFilters().map(([key]) => key).filter(key => !known.has(key))
    .map(key => PRODUCT_COLUMN_BY_KEY.get(key)).filter(column => column && productFilterable(column))
  return [...visible, ...orphaned]
}

// Условие булевой колонки — сам оператор («Да» / «Нет»), отдельного значения у неё нет,
// поэтому поле ввода рисуем только для остальных родов столбцов.
function productFilterSelect(column, filter) {
  const op = filter?.op || productDefaultOperator(column)
  return `<div class="field-select products-filter-op" data-products-filter-op="${column.key}" data-caption="Условие"><button class="field-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" data-products-focus="op-${column.key}"><span>${productOperatorLabel(column, op)}</span><svg><use href="#i-chevron-down"/></svg></button><div class="field-select-popover" role="listbox">${productOperators(column).map(([value, label]) => `<button type="button" role="option" data-value="${value}"${value === op ? ' aria-selected="true"' : ''}>${label}<svg><use href="#i-check"/></svg></button>`).join('')}</div></div>`
}

// Тело условия — общее для строки панели «Фильтры» и для поповера столбца: две копии ветки
// «условие + значение + Применить/Сбросить» разъехались бы по поведению.
function productFilterBody(column, filter) {
  const kind = productFilterKind(column)
  const text = kind === 'date' ? 'date' : 'text'
  return `${productFilterSelect(column, filter)}
    ${column.type === 'bool' ? '<p class="products-filter-hint">Значение выбирается условием выше</p>' : `<label class="products-filter-value"><span>Значение</span><input class="products-input" type="${text}" inputmode="${kind === 'number' ? 'decimal' : 'text'}" value="${productAttr(filter?.value ?? '')}" placeholder="${kind === 'date' ? '' : kind === 'number' ? 'например, 234875' : 'подстрока'}" data-products-filter-value="${column.key}" data-products-focus="value-${column.key}" aria-label="Значение фильтра: ${productAttr(column.label)}"></label>`}
    <div class="products-filter-actions"><button class="secondary-button" type="button" data-products-filter-clear="${column.key}" data-products-focus="clear-${column.key}"${filter?.on ? '' : ' disabled'}><svg><use href="#i-rotate-ccw"/></svg><span>Сбросить</span></button><button class="primary-button" type="button" data-products-filter-apply="${column.key}" data-products-focus="apply-${column.key}"><svg><use href="#i-check"/></svg><span>Применить</span></button></div>`
}

function productFilterRow(column, orphan) {
  const filter = productsState.filters.get(column.key)
  const open = productsState.expanded.has(column.key)
  return `<div class="products-filter-item${filter?.on ? ' is-on' : ''}${open ? ' is-open' : ''}">
    <button type="button" class="products-filter-head" data-products-filter-toggle="${column.key}" data-products-focus="toggle-${column.key}" aria-expanded="${open}"><span>${productAttr(column.label)}</span>${orphan ? '<i class="products-filter-orphan">столбец снят</i>' : ''}${filter?.on ? `<b>${productAttr(`${productOperatorLabel(column, filter.op)} · ${filter.value}`)}</b>` : ''}<svg class="products-filter-caret"><use href="#i-chevron"/></svg></button>
    ${open ? `<div class="products-filter-body">${productFilterBody(column, filter)}</div>` : ''}
  </div>`
}

const PRODUCT_SETTINGS = [
  ['Столбцы', [
    ['columns-reset', 'Сбросить столбцы', 'rotate-ccw', 'Вернуть состав, порядок и закрепление по умолчанию, без ширин и фильтров'],
    ['autosize', 'Автоширина', 'ruler', 'Подогнать каждый столбец под самое длинное значение и заголовок'],
    ['autosize-head', 'Автоширина (без учета заголовков)', 'ruler', 'Замерять только значения: короткий заголовок не должен тянуть столбец'],
    ['fit', 'По ширине таблицы', 'layout', 'Раздать всю ширину прокрутки между столбцами пропорционально их текущей ширине'],
    ['auto-height', 'Автовысота', 'menu', 'Строка растёт по содержимому: длинные значения переносятся, а не обрезаются', 'toggle'],
  ]],
  // Кнопка сохранения живёт только в своём списке ниже: две строки «Сохранить …» в одной
  // панели читались бы как два разных действия.
  ['Роли и доступ', [
    ['roles-reset', 'Сбросить настройки ролей', 'shield', 'Настройки по ролям требуют несколько профилей доступа — в демо профиль один', 'disabled'],
  ]],
  ['Настройки фильтров', [
    ['filters-reset', 'Сбросить фильтр', 'rotate-ccw', 'Снять все условия отбора по столбцам'],
  ]],
]

function renderProductsSettingsDock(query) {
  const draft = productsState.expanded
  const sections = PRODUCT_SETTINGS.map(([title, rows]) => {
    const list = rows.filter(row => !query || row[1].toLowerCase().includes(query))
    if (!list.length) return ''
    return `<div class="products-dock-section"><header><strong>${title}</strong></header>${list.map(([action, label, icon, tip, kind]) => {
      if (kind === 'toggle') return `<div class="products-setting-row"><span class="products-setting-icon"><svg><use href="#i-${icon}"/></svg></span><span class="products-col-copy"><strong>${label}</strong><small>${productAttr(tip)}</small></span><button type="button" class="products-switch${productsState.settings.autoHeight ? ' is-on' : ''}" data-products-setting="${action}" data-products-focus="${action}" role="switch" aria-checked="${Boolean(productsState.settings.autoHeight)}" aria-label="${label}"><span></span></button></div>`
      if (kind === 'disabled') return `<div class="products-setting-row is-off"><span class="products-setting-icon"><svg><use href="#i-${icon}"/></svg></span><span class="products-col-copy"><strong>${label}</strong><small>${productAttr(tip)}</small></span><svg class="products-setting-caret"><use href="#i-close"/></svg></div>`
      return `<button type="button" class="products-setting-row action" data-products-setting="${action}" data-products-focus="${action}"><span class="products-setting-icon"><svg><use href="#i-${icon}"/></svg></span><span class="products-col-copy"><strong>${label}</strong><small>${productAttr(tip)}</small></span><svg class="products-setting-caret"><use href="#i-chevron"/></svg></button>`
    }).join('')}</div>`
  }).join('')
  // Имя вводится прямо в панели: модалка поверх дока только затемнила бы таблицу, ширины
  // которой здесь и правят.
  const namingBlock = kind => {
    const view = kind === 'new-view'
    const items = view ? productsState.views : productsState.savedFilters
    const open = draft.has(kind)
    // Поиск по настройкам не должен оставлять оба списка висеть «для галочки»: блок показываем,
    // только если запрос относится к нему.
    if (query && !`сохранить ${view ? 'представление сохранённые представления' : 'фильтр сохранённые фильтры'}`.includes(query)) return ''
    return `<div class="products-dock-section"><header><strong>${view ? 'Сохранённые представления' : 'Сохранённые фильтры'}</strong><small>${items.length}</small></header>
      <button type="button" class="products-setting-row action${open ? ' is-open' : ''}" data-products-new="${kind}" data-products-focus="${kind}" aria-expanded="${open}"><span class="products-setting-icon"><svg><use href="#i-${view ? 'save' : 'filter'}"/></svg></span><span class="products-col-copy"><strong>${open ? (view ? 'Имя представления' : 'Имя фильтра') : view ? 'Сохранить представление' : 'Сохранить фильтр'}</strong><small>${open ? 'Enter — сохранить, Esc — закрыть' : view ? 'Запомнить состав, порядок, ширины, сортировку и фильтры' : 'Запомнить текущие условия отбора под своим именем'}</small></span><svg class="products-setting-caret"><use href="#i-chevron"/></svg></button>
      ${open ? `<label class="products-name-field"><input class="products-input" type="text" placeholder="${view ? 'Например, маржа и себестоимость' : 'Например, без себестоимости'}" data-products-name="${kind}" data-products-focus="name-${kind}" aria-label="Имя${view ? ' представления' : ' фильтра'}"><button class="primary-button" type="button" data-products-name-save="${kind}" data-products-focus="save-${kind}"><svg><use href="#i-check"/></svg><span>Сохранить</span></button></label>` : ''}
      ${items.length ? items.map((item, index) => `<div class="products-setting-row"><span class="products-setting-icon"><svg><use href="#i-${view ? 'layout' : 'filter'}"/></svg></span><span class="products-col-copy"><strong>${productAttr(item.name)}</strong><small>${productAttr(item.summary)}</small></span><span class="products-col-actions"><button class="products-col-button" type="button" data-products-apply="${kind}:${index}" data-products-focus="apply-${kind}-${index}" aria-label="Применить: ${productAttr(item.name)}"><svg><use href="#i-check"/></svg></button><button class="products-col-button danger" type="button" data-products-drop="${kind}:${index}" data-products-focus="drop-${kind}-${index}" aria-label="Удалить: ${productAttr(item.name)}"><svg><use href="#i-close"/></svg></button></span></div>`).join('')
        : `<p class="products-dock-none">${view ? 'Сохранённых представлений нет.' : 'Сохранённых фильтров нет.'}</p>`}
    </div>`
  }
  return (sections || '<p class="products-dock-none">Настройка не найдена.</p>') + namingBlock('new-view') + namingBlock('new-filter')
}

function renderProductsColumnsDock(query) {
  const ordered = productVisibleColumns()
  const matches = column => !query || `${column.label} ${column.group}`.toLowerCase().includes(query)
  const orderBlock = `<div class="products-dock-section"><header><strong>В таблице</strong><small>${ordered.length}</small></header><div class="products-col-order" id="productsColOrder">${ordered.length ? ordered.map((column, index) => `<div class="products-col-row" data-products-order="${column.key}"><span class="products-col-grip" aria-hidden="true"><i></i><i></i></span><span class="products-col-index">${index + 1}</span><span class="products-col-copy"><strong>${productAttr(column.label)}</strong><small>${productAttr(column.group)}</small></span><span class="products-col-actions">${productPinButton(column, 'products-col-button', `pin-${column.key}`)}<button class="products-col-button" type="button" data-products-move="${column.key}" data-direction="-1" data-products-focus="up-${column.key}"${index === 0 ? ' disabled' : ''} aria-label="Поднять: ${productAttr(column.label)}"><svg><use href="#i-chevron-down"/></svg></button><button class="products-col-button" type="button" data-products-move="${column.key}" data-direction="1" data-products-focus="down-${column.key}"${index === ordered.length - 1 ? ' disabled' : ''} aria-label="Опустить: ${productAttr(column.label)}"><svg><use href="#i-chevron-down"/></svg></button><button class="products-col-button danger" type="button" data-products-column-drop="${column.key}" data-products-focus="drop-${column.key}" aria-label="Убрать столбец: ${productAttr(column.label)}"><svg><use href="#i-close"/></svg></button></span></div>`).join('') : '<p class="products-dock-none">Ни одного столбца не включено — добавьте их в каталоге ниже.</p>'}</div></div>`
  const catalog = `<div class="products-dock-section"><header><strong>Каталог</strong><small>${PRODUCT_COLUMNS.length}</small></header>${PRODUCT_GROUPS.map(group => {
    const rows = PRODUCT_COLUMNS.filter(column => column.group === group && matches(column))
    if (!rows.length) return ''
    const on = rows.filter(column => productsState.columns.includes(column.key)).length
    const collapsed = productsState.collapsed.has(group) && !query
    return `<div class="products-dock-group"><button type="button" class="products-dock-group-head" data-products-group="${group}" data-products-focus="group-${group}" aria-expanded="${!collapsed}"><svg class="products-dock-group-caret"><use href="#i-chevron"/></svg><span>${group}</span><small>${on} / ${rows.length}</small></button>${collapsed ? '' : rows.map(column => `<label class="check-row products-dock-check"><input type="checkbox" data-products-column="${column.key}" data-products-focus="column-${column.key}"${productsState.columns.includes(column.key) ? ' checked' : ''}><span class="check-control" aria-hidden="true"><svg><use href="#i-check"/></svg></span><span class="products-dock-copy"><strong>${productAttr(column.label)}</strong><small>${productAttr(productsDockHelp(column))}</small></span></label>`).join('')}</div>`
  }).join('') || '<p class="products-dock-none">Столбец не найден.</p>'}</div>`
  return orderBlock + catalog
}

function renderProductsFiltersDock(query) {
  const inTable = new Set(productVisibleColumns().map(column => column.key))
  const columns = productsFilterColumns().filter(column => !query || `${column.label} ${column.group}`.toLowerCase().includes(query))
  if (!columns.length) return `<p class="products-dock-none">${query ? 'Столбец не найден.' : 'В таблице нет столбцов, которые можно фильтровать.'}</p>`
  return PRODUCT_GROUPS.map(group => {
    const rows = columns.filter(column => column.group === group)
    if (!rows.length) return ''
    const active = rows.filter(column => productsState.filters.get(column.key)?.on).length
    return `<div class="products-dock-section"><header><strong>${group}</strong><small>${active ? `${active} актив. из ${rows.length}` : rows.length}</small></header>${rows.map(column => productFilterRow(column, !inTable.has(column.key))).join('')}</div>`
  }).join('')
}

// «Помощь» — только читалка: состав столбцов правится в «Столбцах», и второй вход на то же
// действие (галочка в описании) только спорил бы с первым.
function renderProductsHelpDock(query) {
  const list = PRODUCT_COLUMNS.filter(column => !query || `${column.label} ${column.group} ${productsDockHelp(column)}`.toLowerCase().includes(query))
  if (!list.length) return '<p class="products-dock-none">Описание не найдено.</p>'
  return PRODUCT_GROUPS.map(group => {
    const rows = list.filter(column => column.group === group)
    if (!rows.length) return ''
    return `<div class="products-dock-section"><header><strong>${group}</strong><small>${rows.length}</small></header>${rows.map(column => `<div class="products-help-row"><strong>${productAttr(column.label)}</strong><small>${productAttr(productsDockHelp(column))}</small></div>`).join('')}</div>`
  }).join('')
}

function renderProductsDock(focusKey) {
  const tab = productsState.dock
  if (!tab) return
  // Пересборка выбрасывает из DOM узел, который только что отработал событие: без возврата
  // фокуса клавиатура теряла бы строку после каждого включения или переноса столбца. Каретку
  // вне панели не трогаем — поле ряда фильтров возвращает сам renderProducts.
  const wasInside = productsDockPanel.contains(document.activeElement)
  const keep = focusKey || (wasInside ? document.activeElement.dataset.productsFocus : null)
  const config = PRODUCT_DOCK_TABS[tab]
  const query = productsDockSearch.value.trim().toLowerCase()
  const count = activeProductFilters().length
  productsDockTitle.textContent = config.title
  productsDockNote.textContent = config.note
  productsDockSearch.placeholder = config.search
  productsDockSearch.closest('label').classList.toggle('is-hidden', tab === 'settings')
  productsDockBody.innerHTML = tab === 'columns' ? renderProductsColumnsDock(query)
    : tab === 'filters' ? renderProductsFiltersDock(query)
      : tab === 'help' ? renderProductsHelpDock(query) : renderProductsSettingsDock(query)
  productsDockFoot.innerHTML = tab === 'columns'
    ? `<span>в таблице ${productsState.columns.length} из ${PRODUCT_COLUMNS.length}</span><button class="secondary-button" type="button" data-products-setting="columns-default" data-products-focus="columns-default"><svg><use href="#i-rotate-ccw"/></svg><span>Стандартный состав</span></button>`
    : tab === 'filters'
      ? `<span>${count ? `активных фильтров: ${count}` : 'фильтров нет'}</span>${count ? '<button class="secondary-button" type="button" data-products-setting="filters-reset" data-products-focus="filters-reset"><svg><use href="#i-rotate-ccw"/></svg><span>Сбросить все</span></button>' : ''}`
      : `<span>${tab === 'help' ? 'описания столбцов таблицы товаров' : productWidthsSummary()}</span>`
  bindFieldSelects(productsDockPanel)
  if (tab === 'columns') bindProductsOrderDrag()
  if (!keep) return
  const next = productsDockPanel.querySelector(`[data-products-focus="${keep}"]`)
  if (next && !next.disabled) next.focus()
  else if (wasInside) productsDockSearch.focus()
}

function syncProductsDock() {
  const tab = productsState.dock
  productsDock.classList.toggle('is-open', Boolean(tab))
  productsDockPanel.setAttribute('aria-hidden', tab ? 'false' : 'true')
  productsDockTabs.forEach(button => {
    const active = button.dataset.productsDock === tab
    button.setAttribute('aria-expanded', String(active))
    button.classList.toggle('is-active', active)
  })
  productsDockBadge.textContent = String(activeProductFilters().length)
  productsDockBadge.classList.toggle('is-hidden', !activeProductFilters().length)
  if (tab) renderProductsDock()
}

function openProductsDock(tab, trigger, focusKey) {
  // Слой фильтра столбца закрываем здесь, а не только кликом мимо: с клавиатуры pointerdown
  // не бывает, и Enter по вкладке дока оставил бы оба слоя открытыми.
  closeProductsFilterPop()
  closeScenario(); closeContextMenu(); closeFieldSelect(); closeDatePicker(); closeRnpExportMenu(); closeRnpMetrics(); hideTooltip()
  // Панель стартует нейтрально: поиск прошлого захода встречал бы пустым списком.
  productsDockSearch.value = ''
  productsState.expanded.clear()
  productsState.dock = tab
  productsDockOpener = trigger || null
  // Один проход syncProductsDock: он ставит и is-open панели, и aria-expanded вкладок, и бейдж
  // фильтров — руками их перебирать значило бы держать три копии одного состояния.
  syncProductsDock()
  const target = focusKey && productsDockPanel.querySelector(`[data-products-focus="${focusKey}"]`)
  ;(target || productsDockSearch).focus()
}

function closeProductsDock({ restoreFocus = false } = {}) {
  if (!productsState.dock) return
  productsState.dock = null
  productsState.expanded.clear()
  syncProductsDock()
  if (restoreFocus && productsDockOpener) productsDockOpener.focus()
  productsDockOpener = null
}

function toggleProductsDock(tab, trigger, focusKey) {
  if (productsState.dock === tab) return closeProductsDock({ restoreFocus: true })
  if (productsState.dock) {
    // Переход между вкладками не должен гасить панель: она уже открыта, меняется только тело.
    const opener = trigger || productsDockOpener
    openProductsDock(tab, opener, focusKey)
    return
  }
  openProductsDock(tab, trigger, focusKey)
}

// ── Поповер фильтра столбца ───────────────────────────────────────────────────────────
// Слой лежит внутри карточки таблицы, а не в .workspace: вместе с карточкой он и прячется
// при уходе с «Товаров», поэтому отдельного хука на смену раздела не нужно.
const productsFilterPop = document.getElementById('productsFilterPop')
const productsTableCard = document.getElementById('productsTableCard')
let productsFilterPopKey = null

const productsFilterTrigger = () => productsTableCard.querySelector(`[data-products-filter-pop="${productsFilterPopKey}"]`)
const productsFilterPopHTML = column => `<header><span class="products-filter-pop-icon"><svg><use href="#i-filter"/></svg></span><div><strong>${productAttr(column.label)}</strong><small>${productAttr(column.group)}</small></div></header>
  <div class="products-filter-body">${productFilterBody(column, productsState.filters.get(column.key))}</div>`

// Координаты считаем от карточки: поповер позиционирован в её системе координат, а воронка
// сидит в прокручиваемой шапке, поэтому rect'ы вычитаем, а не берём напрямую. Заодно
// возвращаем aria-expanded — после renderProducts воронка новый узел, и флаг терялся.
function positionProductsFilterPop() {
  const trigger = productsFilterTrigger()
  if (!trigger) return false
  const card = productsTableCard.getBoundingClientRect()
  const bounds = trigger.getBoundingClientRect()
  productsFilterPop.style.left = `${Math.round(Math.max(8, Math.min(bounds.left - card.left, card.width - productsFilterPop.offsetWidth - 8)))}px`
  productsFilterPop.style.top = `${Math.round(bounds.bottom - card.top + 6)}px`
  trigger.setAttribute('aria-expanded', 'true')
  return true
}

function openProductsFilterPop(key, trigger) {
  const column = PRODUCT_COLUMN_BY_KEY.get(key)
  if (!column) return
  closeProductsDock()
  closeScenario(); closeContextMenu(); closeFieldSelect(); closeDatePicker(); closeRnpExportMenu(); closeRnpMetrics(); hideTooltip()
  productsFilterPopKey = key
  productsFilterPop.innerHTML = productsFilterPopHTML(column)
  productsFilterPop.classList.add('is-open')
  productsFilterPop.setAttribute('aria-hidden', 'false')
  bindFieldSelects(productsFilterPop)
  if (!positionProductsFilterPop()) return closeProductsFilterPop()
  trigger?.setAttribute('aria-expanded', 'true')
  productsFilterPop.querySelector('[data-products-filter-value]')?.focus()
}

function closeProductsFilterPop({ restoreFocus = false } = {}) {
  if (!productsFilterPopKey) return
  const trigger = productsFilterTrigger()
  productsFilterPopKey = null
  productsFilterPop.classList.remove('is-open')
  productsFilterPop.setAttribute('aria-hidden', 'true')
  productsFilterPop.innerHTML = ''
  trigger?.setAttribute('aria-expanded', 'false')
  if (restoreFocus) trigger?.focus()
}

function toggleProductsFilterPop(key, trigger) {
  if (productsFilterPopKey === key) return closeProductsFilterPop({ restoreFocus: true })
  openProductsFilterPop(key, trigger)
}

// Один обработчик на панель дока и на поповер: и там, и там те же data-атрибуты условия,
// и вторая копия ветки «Применить/Сбросить» разъехалась бы с первой при первой же правке.
function onProductsFilterClick(event) {
  const apply = event.target.closest('[data-products-filter-apply]')
  const clear = event.target.closest('[data-products-filter-clear]')
  const button = apply || clear
  if (!button) return false
  const key = apply ? apply.dataset.productsFilterApply : clear.dataset.productsFilterClear
  applyProductFilter(key, apply ? event.currentTarget.querySelector(`[data-products-filter-value="${key}"]`)?.value : '')
  // Строка дока перерисовывается вместе с таблицей, поповер — нет, поэтому его «Сбросить»
  // дочитывает состояние условия вручную.
  const inPop = event.currentTarget === productsFilterPop
  if (inPop) {
    productsFilterPop.querySelector('[data-products-filter-clear]').toggleAttribute('disabled', !productsState.filters.get(key)?.on)
    // Применённый фильтр — конец диалога: слой перестал быть нужен и только закрывает таблицу.
    if (apply) return closeProductsFilterPop({ restoreFocus: true })
  }
  return true
}

function onProductsFilterInput(event) {
  const field = event.target.closest('[data-products-filter-value]')
  if (!field) return
  // «Сбросить» гаснет сразу, как только поле опустело: иначе кнопка осталась бы
  // нажатоспособной и повесила бы пустой фильтр.
  field.closest('.products-filter-body')?.querySelector('[data-products-filter-clear]')?.toggleAttribute('disabled', !field.value.trim())
}

function onProductsFilterFieldSelect(event) {
  const key = event.target.dataset?.productsFilterOp
  if (key) setProductFilterOperator(key, event.detail.value)
}

productsFilterPop.addEventListener('click', onProductsFilterClick)
productsFilterPop.addEventListener('input', onProductsFilterInput)
productsFilterPop.addEventListener('fieldselect', onProductsFilterFieldSelect)
// Прокрутка таблицы уводит воронку из-под слоя (кластер липкий, остальное едет) — поповер
// следует за ней, а не остаётся висеть на прежнем месте.
document.getElementById('productsScroll').addEventListener('scroll', () => {
  if (productsFilterPopKey) positionProductsFilterPop()
}, { passive: true })
productsFilterPop.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    // Вложенный поповер условия сворачивается первым: иначе Esc выбрасывал бы из фильтра целиком.
    if (!productsFilterPop.querySelector('.field-select-popover.is-open')) {
      event.preventDefault()
      closeProductsFilterPop({ restoreFocus: true })
    }
    return
  }
  const field = event.target.closest('[data-products-filter-value]')
  if (field && event.key === 'Enter') {
    event.preventDefault()
    applyProductFilter(field.dataset.productsFilterValue, field.value)
    closeProductsFilterPop({ restoreFocus: true })
  }
}, true)

function persistProductsColumns() { writeStore('grafio.productsColumns', productsState.columns) }
function persistProductsWidths() { writeStore('grafio.productsWidths', productsState.widths) }
function persistProductsSettings() { writeStore('grafio.productsSettings', productsState.settings) }
function productWidthsSummary() {
  const custom = Object.keys(productsState.widths).length
  return custom ? `ширин заданы вручную: ${custom}` : 'ширины подобраны автоматически'
}

function setProductColumn(key, on) {
  const index = productsState.columns.indexOf(key)
  if (on && index < 0) {
    // Столбец вставляется в конец своей группы, а не в хвост списка: шапка референса собрана
    // полосами групп, и «Цвет» после «Маржи» разорвал бы первую же полосу.
    const column = PRODUCT_COLUMN_BY_KEY.get(key)
    let to = productsState.columns.length
    for (let position = productsState.columns.length - 1; position >= 0; position -= 1) {
      if (PRODUCT_COLUMN_BY_KEY.get(productsState.columns[position])?.group === column.group) { to = position + 1; break }
    }
    productsState.columns.splice(to, 0, key)
  } else if (!on && index >= 0) {
    productsState.columns.splice(index, 1)
    productsState.filters.delete(key)
  } else return
  persistProductsColumns()
  renderProducts()
}

function moveProductColumn(key, direction) {
  const from = productsState.columns.indexOf(key)
  const to = from + direction
  if (from < 0 || to < 0 || to >= productsState.columns.length) return
  productsState.columns.splice(to, 0, ...productsState.columns.splice(from, 1))
  persistProductsColumns()
  renderProducts()
}

function applyProductFilter(key, value) {
  const column = PRODUCT_COLUMN_BY_KEY.get(key)
  if (!column) return
  const current = productsState.filters.get(key)
  const text = column.type === 'bool' ? (current?.value || 'Да') : String(value ?? '').trim()
  if (text) productsState.filters.set(key, { op: current?.op || productDefaultOperator(column), value: text, on: true })
  else productsState.filters.delete(key)
  productsState.page = 1
  renderProducts()
}

// Смена оператора у уже применённого условия двигает таблицу; условие без значения остаётся
// черновиком и перерисовывает только панель.
function setProductFilterOperator(key, op) {
  const column = PRODUCT_COLUMN_BY_KEY.get(key)
  if (!column) return
  const current = productsState.filters.get(key)
  if (column.type === 'bool') {
    productsState.filters.set(key, { op, value: op === 'eq' ? 'Да' : 'Нет', on: true })
    productsState.page = 1
    renderProducts()
    return
  }
  productsState.filters.set(key, { op, value: current?.value || '', on: Boolean(current?.on) })
  if (current?.on) { productsState.page = 1; renderProducts() }
  else renderProductsDock(`op-${key}`)
}

function clearProductFilters() {
  if (!productsState.filters.size) return
  productsState.filters.clear()
  productsState.page = 1
  renderProducts()
}

// ── Ширины столбцов ───────────────────────────────────────────────────────────────────
// Замер идёт по scrollWidth обрезаемой обёртки: у неё overflow:hidden и многоточие, поэтому
// offsetWidth даёт срезанную ширину ячейки, а scrollWidth — длину всего содержимого.
const PRODUCT_MEASURE_SELECTOR = '.products-cell-text, .products-name strong, .products-name small'

function productsMeasure() {
  const widths = {}
  productVisibleColumns().forEach((column, index) => {
    let max = 0
    document.querySelectorAll(`#productsTable tbody .products-row`).forEach(row => {
      const cell = row.children[index + 1]
      if (!cell) return
      cell.querySelectorAll(PRODUCT_MEASURE_SELECTOR).forEach(leaf => { max = Math.max(max, leaf.scrollWidth) })
    })
    const head = document.querySelectorAll('#productsTable .products-head-title th')[index + 1]?.querySelector('.products-sort')
    widths[column.key] = { value: max, head: head ? head.scrollWidth : 0 }
  })
  return widths
}

function productsAutosize(includeHeaders) {
  const columns = productVisibleColumns()
  if (!columns.length) return
  const measured = productsMeasure()
  columns.forEach(column => {
    const entry = measured[column.key]
    // +24 px — горизонтальные отступы ячейки; заголовок добавляет ещё 18 px под иконку
    // сортировки, иначе подпись упирается в неё и многоточие съедает букву.
    // Чип статуса замеряется по одной подписи, поэтому его точку с полями (34 px) прибавляем
    // отдельно: иначе «Автоширина» подогнала бы столбец по тексту и обрезала сам чип.
    productsState.widths[column.key] = Math.max(56, entry.value + 24 + (column.type === 'status' ? 34 : 0), includeHeaders ? entry.head + 42 : 0)
  })
  persistProductsWidths()
  renderProducts()
  showToast('Автоширина', `Столбцы подогнаны по ${includeHeaders ? 'значениям и заголовкам' : 'значениям'}`)
}

function productsFitWidth() {
  const columns = productVisibleColumns()
  if (!columns.length) return
  // Прокрутка считается в экранных пикселях, а ширины столбцов — в собственных для таблицы:
  // на 80 % в поле зрения влезает больше сетки, и без пересчёта «по ширине» оставила бы хвост.
  const available = Math.round(productsScroll.clientWidth / (productsState.settings.scale || 1)) - PRODUCT_CHECK_WIDTH
  const current = columns.reduce((sum, column) => sum + productWidth(column), 0)
  // Дробную долю округляем вниз, а остаток раздаём по наибольшей дроби: Math.round на каждом
  // столбце прибавлял бы до пикселя на столбец, и «по ширине таблицы» оставляло бы фантомную
  // прокрутку в 1–2 px вместо точного совпадения с шириной карточки.
  const shares = columns.map(column => productWidth(column) * available / current)
  const widths = shares.map(share => Math.max(56, Math.floor(share)))
  let left = available - widths.reduce((sum, value) => sum + value, 0)
  const byRemainder = shares.map((share, index) => [share - Math.floor(share), index]).sort((a, b) => b[0] - a[0])
  for (let step = 0; left > 0 && byRemainder.length; step += 1, left -= 1) widths[byRemainder[step % byRemainder.length][1]] += 1
  columns.forEach((column, index) => { productsState.widths[column.key] = widths[index] })
  persistProductsWidths()
  renderProducts()
  // Итог считаем по факту, а не по цели: минимальная ширина в 56 px может не пустить столбцы
  // в отведённое место (на 130 % так и выходит), и «раздали ровно available» было бы неправдой.
  const result = columns.reduce((sum, column) => sum + productWidth(column), 0) + PRODUCT_CHECK_WIDTH
  showToast('По ширине таблицы', result > available ? `${columns.length} столбцов — узже нельзя (${result} px)` : `${columns.length} столбцов на ${result} px`)
}

function saveProductsView(name) {
  const view = {
    name, summary: `${productsState.columns.length} столбц. · ${activeProductFilters().length} фильтров · ${productWidthsSummary()}`,
    columns: [...productsState.columns], widths: { ...productsState.widths }, sort: { ...productsState.sort },
    filters: Object.fromEntries(productsState.filters), settings: { ...productsState.settings },
  }
  const index = productsState.views.findIndex(item => item.name === name)
  if (index >= 0) productsState.views[index] = view
  else productsState.views.push(view)
  writeStore('grafio.productsViews', productsState.views)
  productsState.expanded.delete('new-view')
  renderProducts()
  showToast('Представление сохранено', name)
}

function applyProductsView(index) {
  const view = productsState.views[index]
  if (!view) return
  productsState.columns = [...view.columns]
  productsState.widths = { ...view.widths }
  productsState.sort = { ...view.sort }
  productsState.filters = new Map(Object.entries(view.filters || {}))
  productsState.settings = { ...productsState.settings, ...view.settings }
  productsState.page = 1
  persistProductsColumns(); persistProductsWidths(); persistProductsSettings()
  renderProducts()
  showToast('Представление применено', view.name)
}

function saveProductsFilter(name) {
  const entries = activeProductFilters()
  if (!entries.length) { showToast('Фильтр не сохранён', 'Сначала задайте условие отбора'); return }
  const saved = { name, summary: `${entries.length} усл. · ${entries.map(([key]) => PRODUCT_COLUMN_BY_KEY.get(key).label).join(', ')}`, filters: Object.fromEntries(entries) }
  const index = productsState.savedFilters.findIndex(item => item.name === name)
  if (index >= 0) productsState.savedFilters[index] = saved
  else productsState.savedFilters.push(saved)
  writeStore('grafio.productsSavedFilters', productsState.savedFilters)
  productsState.expanded.delete('new-filter')
  renderProducts()
  showToast('Фильтр сохранён', name)
}

function applyProductsFilterSet(index) {
  const saved = productsState.savedFilters[index]
  if (!saved) return
  productsState.filters = new Map(Object.entries(saved.filters))
  productsState.page = 1
  renderProducts()
  showToast('Фильтр применён', saved.name)
}

function toggleProductsNaming(kind) {
  // Кнопка «Сохранить представление» живёт в своём списке, а поле имени — в секции
  // «Сохранённые…»: раскрытие одно на обоих, иначе открытость жила бы в двух обработчиках.
  const open = !productsState.expanded.has(kind)
  // Только одно имя за раз: два поля спорили бы за Enter.
  productsState.expanded.clear()
  if (open) productsState.expanded.add(kind)
  renderProductsDock(open ? `name-${kind}` : kind)
}

function commitProductsName(kind, rawName) {
  // Пустое имя не сохранится: поле ждёт, пока есть что вводить.
  const name = (rawName || '').trim()
  if (!name) return
  kind === 'new-view' ? saveProductsView(name) : saveProductsFilter(name)
}

function runProductsSetting(action) {
  if (action === 'columns-reset' || action === 'columns-default') {
    const changed = productsState.columns.join() !== PRODUCT_DEFAULT_COLUMNS.join()
    productsState.columns = [...PRODUCT_DEFAULT_COLUMNS]
    // Закрепление задано набором столбцов: вернуть состав и оставить старый pin-список — значит
    // незаметно залить половину таблицы чужими залипшими колонками.
    productsState.settings.pinned = [...PRODUCT_PIN_DEFAULT]
    persistProductsColumns()
    persistProductsSettings()
    renderProducts()
    showToast('Столбцы сброшены', changed ? `${PRODUCT_DEFAULT_COLUMNS.length} столбцов по умолчанию` : 'состав уже был стандартным')
    return
  }
  if (action === 'autosize') return productsAutosize(true)
  if (action === 'autosize-head') return productsAutosize(false)
  if (action === 'fit') return productsFitWidth()
  if (action === 'auto-height') {
    productsState.settings.autoHeight = !productsState.settings.autoHeight
    persistProductsSettings()
    renderProducts()
    return
  }
  if (action === 'filters-reset') return clearProductFilters()
}

productsDock.addEventListener('click', event => {
  if (event.target.closest('#productsDockClose')) closeProductsDock({ restoreFocus: true })
})

productsDockPanel.addEventListener('click', event => {
  const group = event.target.closest('[data-products-group]')
  if (group) {
    const name = group.dataset.productsGroup
    productsState.collapsed.has(name) ? productsState.collapsed.delete(name) : productsState.collapsed.add(name)
    renderProductsDock(`group-${name}`)
    return
  }
  const toggle = event.target.closest('[data-products-filter-toggle]')
  if (toggle) {
    const key = toggle.dataset.productsFilterToggle
    productsState.expanded.has(key) ? productsState.expanded.delete(key) : productsState.expanded.add(key)
    renderProductsDock(`toggle-${key}`)
    return
  }
  if (onProductsFilterClick(event)) return
  const move = event.target.closest('[data-products-move]')
  if (move) return moveProductColumn(move.dataset.productsMove, Number(move.dataset.direction))
  const drop = event.target.closest('[data-products-column-drop]')
  if (drop) return setProductColumn(drop.dataset.productsColumnDrop, false)
  const removeSet = event.target.closest('[data-products-drop]')
  if (removeSet) {
    const [kind, index] = removeSet.dataset.productsDrop.split(':')
    const view = kind === 'new-view'
    ;(view ? productsState.views : productsState.savedFilters).splice(Number(index), 1)
    writeStore(view ? 'grafio.productsViews' : 'grafio.productsSavedFilters', view ? productsState.views : productsState.savedFilters)
    return renderProductsDock()
  }
  const applySet = event.target.closest('[data-products-apply]')
  if (applySet) {
    const [kind, index] = applySet.dataset.productsApply.split(':')
    return kind === 'new-view' ? applyProductsView(Number(index)) : applyProductsFilterSet(Number(index))
  }
  const naming = event.target.closest('[data-products-new]')
  if (naming) return toggleProductsNaming(naming.dataset.productsNew)
  const nameSave = event.target.closest('[data-products-name-save]')
  if (nameSave) {
    const kind = nameSave.dataset.productsNameSave
    return commitProductsName(kind, productsDockPanel.querySelector(`[data-products-name="${kind}"]`)?.value)
  }
  const setting = event.target.closest('[data-products-setting]')
  if (setting) return runProductsSetting(setting.dataset.productsSetting)
})

productsDockPanel.addEventListener('change', event => {
  const box = event.target.closest('[data-products-column]')
  if (box) setProductColumn(box.dataset.productsColumn, box.checked)
})

productsDockPanel.addEventListener('input', onProductsFilterInput)

// Слушаем фазу capture: Esc должен долететь до панели раньше, чем его дочерний поповер
// успеет свернуться, — иначе проверка «открыт ли поповер» всегда давала бы ложное «нет».
productsDockPanel.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!productsDockPanel.querySelector('.field-select-popover.is-open')) {
      event.preventDefault()
      event.stopPropagation()
      closeProductsDock({ restoreFocus: true })
    }
    return
  }
  const field = event.target.closest('[data-products-filter-value], [data-products-name]')
  if (!field) return
  if (event.key === 'Enter') {
    event.preventDefault()
    if (field.dataset.productsName) commitProductsName(field.dataset.productsName, field.value)
    else applyProductFilter(field.dataset.productsFilterValue, field.value)
  }
}, true)

productsDockPanel.addEventListener('fieldselect', onProductsFilterFieldSelect)

productsDockSearch.addEventListener('input', () => renderProductsDock())

// Перенос строки зажатием — один приём на обе панели (метрики РНП и столбцы товаров): ряд
// идёт за курсором, соседи уступают место сдвигом, а порядок списка переписывается только
// на отпускании — пересборка на каждом кадре сорвала бы и захват, и анимацию.
function attachOrderDrag(container, config) {
  const forbid = event => event.preventDefault()
  container.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const row = event.target.closest(config.row)
    // Пальцем — только за грипп: тело строки оставляем прокрутке, иначе вертикальный жест
    // в панели спорил бы со скроллом. Мышью тянем за любое место, кроме кнопок.
    if (!row || event.target.closest('button')) return
    if (event.pointerType !== 'mouse' && !event.target.closest(config.grip)) return
    const rows = [...container.querySelectorAll(config.row)]
    const from = rows.indexOf(row)
    // Шаг = высота строки плюс зазор из CSS: зазор читаем, а не запоминаем, иначе правка
    // gap разъехалась бы с геометрией переноса.
    const step = row.offsetHeight + (parseFloat(getComputedStyle(container).rowGap) || 0)
    const drag = { row, rows, from, to: from, step, y: event.clientY, moved: false, frame: 0 }

    const paint = () => {
      drag.frame = 0
      // Смещение считаем от фактической позиции строки, а не от суммы «сколько прокрутили»:
      // прокрутка округляется до долей пикселя, и арифметика ушла бы от курсора.
      row.style.transform = ''
      const slot = row.getBoundingClientRect()
      const dy = drag.y - (slot.top + slot.height / 2)
      const to = Math.max(0, Math.min(rows.length - 1, from + Math.round(dy / step)))
      if (to !== drag.to) {
        drag.to = to
        rows.forEach((other, index) => {
          if (other === row) return
          const shift = index > from && index <= to ? -step : index < from && index >= to ? step : 0
          other.style.transform = shift ? `translateY(${shift}px)` : ''
        })
        // Номера читаются по итоговому порядку, иначе цифры отстают от картинки.
        const visual = rows.filter(other => other !== row)
        visual.splice(to, 0, row)
        visual.forEach((other, index) => {
          const cell = other.querySelector(config.index)
          if (cell) cell.textContent = String(index + 1)
        })
      }
      row.style.transform = `translateY(${dy}px)`
    }

    const tick = () => {
      // У края прокрутки докручиваем блок: на следующем кадре строка сама замерит новую
      // стартовую точку и останется под курсором.
      const box = config.scroller.getBoundingClientRect()
      const edge = 26
      const delta = Math.max(-edge, Math.min(edge, drag.y < box.top + edge ? (drag.y - box.top) - edge
        : drag.y > box.bottom - edge ? drag.y - (box.bottom - edge) : 0))
      if (delta) {
        const limit = config.scroller.scrollHeight - config.scroller.clientHeight
        const top = Math.max(0, Math.min(limit, config.scroller.scrollTop + delta * .3))
        if (top !== config.scroller.scrollTop) config.scroller.scrollTop = top
      }
      paint()
      if (drag.moved) drag.frame = requestAnimationFrame(tick)
    }

    const move = moveEvent => {
      if (moveEvent.pointerId !== event.pointerId) return
      drag.y = moveEvent.clientY
      if (!drag.moved && Math.abs(drag.y - event.clientY) < 3) return
      drag.moved = true
      row.classList.add('is-dragging')
      if (!drag.frame) drag.frame = requestAnimationFrame(tick)
    }

    const detach = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('dragstart', forbid)
      if (drag.frame) cancelAnimationFrame(drag.frame)
      drag.frame = 0
    }

    const finish = () => {
      detach()
      if (!drag.moved) return
      // Перенос «в своё же место» не трогает таблицу: пересборки достаточно, чтобы снять
      // сдвиги и номера.
      if (drag.to === from) return config.cancel()
      // Соседи сдвинуты только трансформом, DOM-порядок остаётся прежним — итог берём из
      // той же визуальной раскладки, что и номера в paint().
      const order = rows.filter(other => other !== row)
      order.splice(drag.to, 0, row)
      config.commit(order.map(other => other.dataset[config.key]))
    }

    // Жест оборвался (его перехватил браузер): коммитить нельзя, откатываем панель к
    // состоянию из данных — пересборка снимает и сдвиги, и переписанные номера.
    const cancel = () => {
      detach()
      row.classList.remove('is-dragging')
      if (drag.moved) config.cancel()
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', cancel)
    // Мышь, ушедшая дальше мёртвой зоны поверх текста, для браузера — начало переноса
    // выделения: dragstart срывает жест pointercancel, и порядок не доходил бы до отпускания.
    window.addEventListener('dragstart', forbid)
  })
}

function bindProductsOrderDrag() {
  const container = document.getElementById('productsColOrder')
  if (!container) return
  attachOrderDrag(container, {
    row: '.products-col-row', grip: '.products-col-grip', index: '.products-col-index', key: 'productsOrder', scroller: productsDockBody,
    commit: keys => { productsState.columns = keys; persistProductsColumns(); renderProducts() },
    cancel: () => renderProductsDock(),
  })
}

// ── Ручная ширина столбца и липкий кластер ────────────────────────────────────────────
function bindProductResize(event) {
  const handle = event.target.closest('[data-products-resize]')
  if (!handle || event.button !== 0) return
  const key = handle.dataset.productsResize
  const col = document.querySelector(`#productsTable colgroup col[data-products-col="${key}"]`)
  if (!col) return
  event.preventDefault()
  hideTooltip()
  // Перетаскивание приходит экранными пикселями, а colgroup мыслит собственными: без деления на
  // масштаб столбец на 130 % рос бы в 1,3 раза быстрее курсора и записывал бы ширину с ошибкой.
  const scale = productsState.settings.scale || 1
  const start = event.clientX
  const from = col.getBoundingClientRect().width / scale
  handle.setPointerCapture(event.pointerId)
  handle.classList.add('is-active')

  const move = moveEvent => {
    // Минимум 56 px оставляет в ячейке хотя бы три символа: столбец нулевой ширины нельзя
    // было бы поймать за ручку, чтобы растянуть обратно.
    col.style.width = `${Math.max(56, Math.round(from + (moveEvent.clientX - start) / scale))}px`
    applyProductStickyLeft()
  }
  const finish = () => {
    handle.removeEventListener('pointermove', move)
    handle.removeEventListener('pointerup', finish)
    handle.removeEventListener('pointercancel', finish)
    handle.classList.remove('is-active')
    productsState.widths[key] = Math.max(56, Math.round(col.getBoundingClientRect().width / scale))
    persistProductsWidths()
    syncProductsDock()
  }
  handle.addEventListener('pointermove', move)
  handle.addEventListener('pointerup', finish)
  handle.addEventListener('pointercancel', finish)
}

// Липкий кластер живёт на фактических ширинах колонок: сетка растягивается на всю ширину
// прокрутки, и смещение из productsState.widths ушло бы от границ ячеек.
function applyProductStickyLeft() {
  const table = document.getElementById('productsTable')
  const scale = productsState.settings.scale
  const offsets = []
  let left = 0
  // getBoundingClientRect возвращает уже отмасштабированные пиксели, а sticky-смещение внутри
  // zoom-узла Chrome тоже множит на scale — без деления кластер уезжал бы на scale².
  ;[...table.querySelectorAll('colgroup col')].forEach(col => {
    offsets.push(left)
    left += col.getBoundingClientRect().width / scale
  })
  // Смещение на самой клетке: залипшие — всегда начало строки, поэтому её номер в ряду и есть
  // номер столбца. Полоса групп и подпись «Итого» ложатся по тому же правилу.
  // Край кластера — последняя залипшая клетка ряда (обход в документном порядке: каждая
  // следующая перезаписывает предыдущую), иначе полоса тянулась бы через всю группу.
  const edge = new Map()
  table.querySelectorAll('.is-sticky').forEach(cell => {
    cell.classList.remove('is-sticky-edge')
    cell.style.left = `${Math.round(offsets[cell.cellIndex] || 0)}px`
    edge.set(cell.parentElement, cell)
  })
  edge.forEach(cell => cell.classList.add('is-sticky-edge'))
  // Чип закрепления лежит в углу клетки, а подпись вроде «Себестоимость» доходит до этого угла:
  // там, где они пересекаются, чип скрываем — закрепление остаётся в панели «Столбцы».
  // Мера настоящая и по «чернилам» (подпись + стрелка), а не по кнопке сортировки: та тянется
  // на всю ширину клетки и пересекалась бы с чипом всегда. Перетаскивание границы чип возвращает.
  table.querySelectorAll('.products-head-title th').forEach(th => {
    const pin = th.querySelector('.products-pin')
    const label = th.querySelector('.products-sort span')
    if (!pin || !label) return
    const ink = label.getBoundingClientRect()
    const arrow = th.querySelector('.products-sort-icon')?.getBoundingClientRect()
    const text = { left: Math.min(ink.left, arrow?.left ?? ink.left), right: Math.max(ink.right, arrow?.right ?? ink.right) }
    const chip = pin.getBoundingClientRect()
    th.classList.toggle('is-pin-tight', text.left < chip.right - 2 && chip.left < text.right - 2)
  })
  // Поповер фильтра привязан к воронке: её координаты меняются вместе с ширинами и при
  // пересборке шапки, поэтому переставляем его здесь же. Узел воронки мог исчезнуть
  // (скелет, пустой набор столбцов) — тогда слой закрываем.
  if (productsFilterPopKey && !positionProductsFilterPop()) closeProductsFilterPop()
}

// ── Перенос столбца зажатием ──────────────────────────────────────────────────────────
// Порядок столбцов тянут по тому же приёму, что и строки в панели «Столбцы»: колонка идёт
// за курсором трансформом, соседи уступают место, productsState переписывается один раз на
// отпускании — пересборка сетки в середине жеста сорвала бы и захват, и анимацию. Два
// ограничения, которых у строк нет:
//   1) только внутри своей группы — полоса над заголовками рисует colspan по фактическому
//      порядку, и перелетевший в чужую полосу столбец начал бы врать её подписи;
//   2) только по свою сторону закрепления — pinned является префиксом видимого порядка
//      (productSetupSticky), поэтому перенос незакреплённого столбца влево через край
//      кластера обнулил бы закрепление целиком.
let productColDragged = false   // глушит click сортировки после жеста
let productColDragging = false  // держит тултипы закрытыми, пока колонка летит

// Клетки столбца: у них нет признака колонки (productAttrs пишет только class), поэтому
// номер восстанавливаем обходом ряда — клетка с colspan съедает столько же позиций keys.
// Нулевой элемент — полоса чекбоксов: её не переносим, поэтому и ключа у неё нет.
function productColumnCells(table, keys) {
  const cells = new Map()
  table.querySelectorAll('tr').forEach(tr => {
    let cursor = 0
    ;[...tr.children].forEach(cell => {
      const span = cell.colSpan
      const key = keys[cursor]
      if (span === 1 && key) {
        if (!cells.has(key)) cells.set(key, [])
        cells.get(key).push(cell)
      }
      cursor += span
    })
  })
  return cells
}

function bindProductColumnDrag(event) {
  productColDragged = false
  // Мышь: пальцем порядок правят из панели «Столбцы», иначе горизонтальный свайп по шапке
  // споролся бы с прокруткой таблицы.
  if (event.pointerType !== 'mouse' || event.button !== 0) return
  const th = event.target.closest('.products-head-title th[data-products-col]')
  if (!th || event.target.closest('.products-resize, .products-pin')) return
  const table = document.getElementById('productsTable')
  const columns = productVisibleColumns()
  const from = columns.findIndex(column => column.key === th.dataset.productsCol)
  if (from < 0) return
  const group = columns[from].group
  let lo = from, hi = from
  while (lo > 0 && columns[lo - 1].group === group) lo -= 1
  while (hi + 1 < columns.length && columns[hi + 1].group === group) hi += 1
  // Индексы [0, pinned) — залипшие клетки, [pinned, ...) — скроллящиеся.
  const pinned = productSticky.size - 1
  if (productSticky.has(columns[from].key)) hi = Math.min(hi, pinned - 1)
  else lo = Math.max(lo, pinned)
  if (lo >= hi) return

  const run = columns.slice(lo, hi + 1)
  const fromL = from - lo
  const cells = productColumnCells(table, [null, ...columns.map(column => column.key)])
  const cellSet = column => cells.get(column.key) || []
  const dragged = cellSet(columns[from])
  const colOf = key => table.querySelector(`colgroup col[data-products-col="${key}"]`)
  // Масштаб: курсор приходит экранными пикселями, а transform внутри zoom-узла множит их
  // сам — без деления колонка на 130 % отставала бы от мыши.
  const scale = productsState.settings.scale || 1
  const startX = event.clientX
  const drag = { x: startX, to: fromL, moved: false, frame: 0 }
  const forbid = forbidEvent => forbidEvent.preventDefault()

  // Слоты полосы относительно места самой тянутой колонки: у sticky-клеток прокрутка не
  // отнимается, у обычных отнимается, и общая точка отсчёта от таблицы разъела бы их.
  const slots = () => {
    const origin = colOf(run[fromL].key).getBoundingClientRect().left
    return run.map(column => {
      const box = colOf(column.key).getBoundingClientRect()
      return { left: (box.left - origin) / scale, width: box.width / scale }
    })
  }

  const paint = () => {
    const boxes = slots()
    const centre = (drag.x - startX) / scale + boxes[fromL].width / 2
    // Слот, на который лёг центр колонки: полосы идут подряд, поэтому достаточно последнего
    // left <= centre.
    let to = 0
    for (let i = 1; i < boxes.length; i += 1) if (boxes[i].left <= centre) to = i
    if (to !== drag.to) {
      drag.to = to
      const visual = run.map((_, i) => i).filter(i => i !== fromL)
      visual.splice(to, 0, fromL)
      run.forEach((column, i) => {
        if (i === fromL) return
        // Координаты слотов от перестановки не меняются (набор ширин тот же), поэтому соседу
        // достаточно сдвинуться на разницу между своим местом и занятым в новом порядке.
        const delta = boxes[visual.indexOf(i)].left - boxes[i].left
        cellSet(column).forEach(cell => { cell.style.transform = delta ? `translateX(${delta}px)` : '' })
      })
    }
    const dx = (drag.x - startX) / scale
    dragged.forEach(cell => { cell.style.transform = `translateX(${dx}px)` })
  }

  const tick = () => {
    drag.frame = 0
    // У края докручиваем таблицу: полоса группы шире экрана, и без этого столбец нельзя было
    // бы утащить за видимую границу. Для залипшей колонки автопрокрутка выключена — она не
    // ездит вместе с нею, и курсор у левого края унёс бы столбец из кластера.
    if (pinned <= from) {
      const box = productsScroll.getBoundingClientRect()
      const edge = 26
      const delta = Math.max(-edge, Math.min(edge, drag.x < box.left + edge ? (drag.x - box.left) - edge
        : drag.x > box.right - edge ? drag.x - (box.right - edge) : 0))
      if (delta) {
        const limit = productsScroll.scrollWidth - productsScroll.clientWidth
        const next = Math.max(0, Math.min(limit, productsScroll.scrollLeft + delta * .3))
        if (next !== productsScroll.scrollLeft) productsScroll.scrollLeft = next
      }
    }
    paint()
    if (drag.moved) drag.frame = requestAnimationFrame(tick)
  }

  const move = moveEvent => {
    if (moveEvent.pointerId !== event.pointerId) return
    drag.x = moveEvent.clientX
    if (!drag.moved) {
      if (Math.abs(drag.x - startX) < 3) return
      drag.moved = true
      productColDragged = true
      productColDragging = true
      hideTooltip()
      table.classList.add('is-col-drag')
      document.body.classList.add('is-products-col-drag')
      run.forEach((column, i) => cellSet(column).forEach(cell => cell.classList.add(i === fromL ? 'is-col-dragging' : 'is-col-shift')))
    }
    if (!drag.frame) drag.frame = requestAnimationFrame(tick)
  }

  const detach = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', finish)
    window.removeEventListener('pointercancel', cancel)
    window.removeEventListener('dragstart', forbid)
    if (drag.frame) cancelAnimationFrame(drag.frame)
    drag.frame = 0
    productColDragging = false
    document.body.classList.remove('is-products-col-drag')
  }

  // Итоговый порядок всего набора: полоса переставляется на месте, остальное остаётся.
  const orderOf = to => {
    const order = columns.map(column => column.key)
    order.splice(from, 1)
    order.splice(lo + to, 0, columns[from].key)
    return order
  }

  const finish = () => {
    detach()
    // Без мёртвой зоны жест не начинался: обычный клик по заголовку идёт сортировкой.
    if (!drag.moved) return
    const boxes = slots()
    // Перенос «в свой же слот» разворачивает колонку назад тем же переходом, а не прыжком.
    const delta = drag.to === fromL ? 0 : boxes[drag.to].left - boxes[fromL].left
    dragged.forEach(cell => {
      cell.classList.remove('is-col-dragging')
      cell.classList.add('is-col-shift')
      cell.style.transform = delta ? `translateX(${delta}px)` : ''
    })
    if (drag.to !== fromL) {
      productsState.columns = orderOf(drag.to)
      persistProductsColumns()
    }
    // Сетка пересобирается после того, как колонка доедет до своего слота: иначе она
    // допрыгивала бы из-под курсора. Заодно пересборка снимает все сдвиги и с соседей.
    window.setTimeout(() => { table.classList.remove('is-col-drag'); renderProducts() }, 150)
  }

  // Жест оборвался: отпускаем без записи порядка, пересборка возвращает колонки на места.
  const cancel = () => {
    detach()
    if (!drag.moved) return
    table.classList.remove('is-col-drag')
    renderProducts()
  }

  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', finish)
  window.addEventListener('pointercancel', cancel)
  // Мышь, ушедшая дальше мёртвой зоны по подписи заголовка, для браузера — начало переноса
  // выделения: dragstart срывает жест pointercancel, и колонка не доходила бы до отпускания.
  window.addEventListener('dragstart', forbid)
}


// ── Карточка товара ───────────────────────────────────────────────────────────────────
// Отдельный фиксированный экран внутри shell'а (§5.2): не modal и не canvas-виджет, поэтому
// пользуется теми же карточками и формами, что «Планы» и «Контроль расчётов».
// Прошлые значения себестоимости — множители к расчётной цене товара: история остаётся в тех
// же рублях, что и строка таблицы, и не разъезжается между перерисовками. Даты — фиксированные
// якоря, а не «на N месяцев раньше действующей»: во втором случае правка «Даты начала» сдвигала
// всю историю разом, включая день месяца у каждой строки. Это только посевной набор — как у
// планов он живёт в товаре, так и здесь снимается один раз при первой правке и дальше растёт
// из productCostLog, иначе смена «Источника» пересевала бы историю заново.
const PRODUCT_COST_PAST = {
  manual: [{ from: '2025-12-05', factor: 0.94, label: 'Из прайса' }, { from: '2025-01-13', factor: 1.03, label: 'Ручная правка' }],
  priced: [{ from: '2025-06-02', factor: 0.97, label: 'Из прайса' }],
  stale: [{ from: '2025-02-17', factor: 1.08, label: 'Из прайса' }],
  missing: [],
}
const productPlanLog = new Map()
const productCostLog = new Map()
const productPrevDay = iso => { const day = new Date(`${iso}T00:00:00`); day.setDate(day.getDate() - 1); return isoDate(day) }

function productCostSeries(row) {
  const current = row.costValue ?? (row.values ? row.cost : null)
  if (current == null || !row.costFrom) return []
  const basis = row.baselineCost ?? current
  const log = productCostLog.get(row.key) || PRODUCT_COST_PAST[row.costState] || []
  // Запись не раньше действующей даты — это не история: иначе «предыдущая» цена оказалась бы
  // новее той, что применяется сейчас, и «Дата окончания» встала бы раньше «Даты начала».
  const entries = [{ from: row.costFrom, label: PRODUCT_COST_LABEL[row.costState], value: current },
    ...log.filter(entry => entry.from < row.costFrom)
      .map(entry => ({ from: entry.from, label: entry.label, value: entry.value ?? Math.round(basis * entry.factor) }))]
  entries.sort((a, b) => b.from.localeCompare(a.from))
  return entries.map((entry, index) => ({ ...entry, to: index ? productPrevDay(entries[index - 1].from) : null }))
}

// Пагинация историй карточки: записей себестоимости теперь столько, сколько правок сделал
// юзер, а панель и так выше экрана. Строки режем по 5, пагинатор — отдельной строкой внутри
// таблицы: так «Себестоимость» и «Месячный план» остаются одной высоты.
const HISTORY_ROWS = 5
function paginateHistory(entries, page) {
  const pages = Math.max(1, Math.ceil(entries.length / HISTORY_ROWS))
  const current = Math.min(page, pages)
  const first = (current - 1) * HISTORY_ROWS
  const last = Math.min(first + HISTORY_ROWS, entries.length)
  // «6–6 из 6» на последней странице читается как опечатка: один ряд называем одним числом.
  const range = last === first + 1 ? `${last} из ${entries.length}` : `${first + 1}–${last} из ${entries.length}`
  return { current, pages, rows: entries.slice(first, first + HISTORY_ROWS), range }
}

function historyPagerRow(kind, state) {
  if (state.pages === 1) return ''
  const button = (step, icon, label, disabled) => `<button class="secondary-button" type="button" aria-label="${label}" data-history-page="${kind}" data-step="${step}"${disabled ? ' disabled' : ''}><svg><use href="#${icon}"/></svg></button>`
  return `<tr class="products-history-pager"><td colspan="4"><div class="products-history-pager-bar"><span>${state.range}</span><span class="products-pager">${button(-1, 'i-chevron-left', 'Предыдущая страница', state.current === 1)}<b>${state.current} / ${state.pages}</b>${button(1, 'i-chevron', 'Следующая страница', state.current === state.pages)}</span></div></td></tr>`
}

function productPlanMonths(period) {
  const end = new Date(`${period.to}T00:00:00`)
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(end.getFullYear(), end.getMonth() - index, 1)
    return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
  })
}

function productPlans(row, months) {
  // Цели засевает сам товар, а не кабинет: «план привязан к кабинету, не к товару» —
  // известный дефект родного backend/, в мокапе он не повторяется. Журнал идёт после посева,
  // поэтому сохранённый месяц перекрывает посевной ряд за тот же месяц.
  // Маржа берётся из baselineMargin, а не из живой row.margin: цель на май не должна
  // переписываться задним числом из-за сегодняшней правки закупочной цены — фактическая
  // маржа с ручной ценой показан в плитке «МАРЖА» той же карточки.
  const seeded = row.values ? [
    { month: months[0], revenue: Math.round(row.revenue * 1.12), margin: Math.round(row.baselineMargin * 1.08), orders: Math.round(row.orders * 1.1) },
    { month: months[1], revenue: Math.round(row.revenue * 0.96), margin: Math.round(row.baselineMargin * 0.9), orders: row.orders },
  ] : []
  const byMonth = new Map()
  ;[...seeded, ...(productPlanLog.get(row.key) || [])].forEach(plan => byMonth.set(plan.month, plan))
  return [...byMonth.values()].sort((a, b) => b.month.localeCompare(a.month))
}

// Динамика — восемь полных недель до конца выбранного периода: недельный период даёт один
// столбец, и «к прошлой неделе» в нём не читается. Бар = недельные выкупы кабинета × доля
// товара в выкупках периода, поэтому ряд показывает те же числа, что и строка таблицы.
const PRODUCT_TREND_WEEKS = 8
// Наклон и фаза ряда — из хеша ключа товара: перерисовка не меняет график, а у разных
// товаров разные истории. Последний столбец жёстко равен выкупам строки, поэтому ряд
// расходится с таблицей не больше, чем на округление предыдущих недель.
function productWeekShape(key, count) {
  const hash = rnpHash(key)
  const slope = ((hash % 17) - 8) / 190
  const phase = (hash % 900) / 900 * Math.PI * 2
  return Array.from({ length: count }, (_, index) => index === count - 1 ? 1
    : 1 + slope * (index - count + 1) + 0.055 * Math.sin(phase + index * 1.7) + 0.03 * Math.sin(phase * 2 + index * 0.8))
}

function productTrend(row, period) {
  if (!row.values) return []
  const start = new Date(`${period.to}T00:00:00`)
  start.setDate(start.getDate() - PRODUCT_TREND_WEEKS * 7)
  const weeks = rnpWeeks(isoDate(start), period.to).filter(week => week.days.every(day => day.inside && day.filled)).slice(-PRODUCT_TREND_WEEKS)
  const shape = productWeekShape(row.key, weeks.length)
  return weeks.map((week, index) => ({ number: week.number, from: week.days[0].date, to: week.days[6].date, value: Math.round(row.buyouts * shape[index]) }))
}

const readProductNumber = id => {
  const raw = String(document.getElementById(id).value).replace(/[^\d.,]/g, '')
  if (!raw) return null
  const value = Number(raw.replace(',', '.'))
  return Number.isFinite(value) ? value : null
}

function openProduct(key) {
  productsState.product = key
  // История у товара своя, и открывать карточку на второй странице предыдущего не за чем.
  productsState.costPage = 1
  productsState.planPage = 1
  switchView('product')
}

function productCardRow() {
  const rows = productRows(productsPeriod())
  const row = rows.find(item => item.key === productsState.product) || rows[0]
  productsState.product = row.key
  return row
}

function renderProduct() {
  hideTooltip()
  const period = productsPeriod()
  const row = productCardRow()
  const account = menuData.account[productAccountIndex()]
  const status = productStatus(row)
  const months = productPlanMonths(period)
  const money = value => `${rnpNumber.format(value)} ₽`
  const trend = productTrend(row, period)
  // Черновик формы и чип в шапке берутся из полного списка, а не из страницы: иначе
  // перелистывание истории подменяло бы «последний план». Черновик при этом смотрит на
  // выбранный месяц, а не на самый свежий: сохранение декабря подставляло бы в поля числа мая,
  // и следующее сохранение копировало бы их уже в другой месяц.
  const costSeries = productCostSeries(row)
  const planSeries = productPlans(row, months)
  const costs = paginateHistory(costSeries, productsState.costPage)
  const plans = paginateHistory(planSeries, productsState.planPage)
  if (!months.includes(productsState.planMonth)) productsState.planMonth = months[0]
  const planDraft = planSeries.find(entry => entry.month === productsState.planMonth) ?? null

  document.getElementById('productBackNote').innerHTML = `<b>Товары</b><i>·</i><b>${account.title}</b><i>·</i><b>${RNP_MARKETPLACES[account.mark] ?? account.mark}</b><i>·</i><b>${period.label}</b>`

  document.getElementById('productHeader').innerHTML = `<div class="product-heading"><span class="products-thumb is-lg" aria-hidden="true"><svg><use href="#i-box"/></svg></span><div class="product-heading-copy"><span class="drawer-kicker">КАРТОЧКА ТОВАРА</span><h1>${row.name}</h1><div class="product-badges"><span class="status-chip">${row.category}</span>${row.brand ? `<span class="status-chip muted">${row.brand}</span>` : ''}<span class="status-chip ${status.tone}" data-tooltip="${status.note}" data-tooltip-side="bottom"><span class="status-light ${status.tone}"></span>${status.text}</span><span class="status-chip muted">${row.marketplace} · ${row.cabinet}</span></div></div></div>`
    + `<dl class="product-meta">${[['Артикул (SKU)', row.sku], ['Barcode', row.barcode ?? '—'], ['External ID', row.externalId ?? '—'], ['Себестоимость', row.costValue != null ? money(row.costValue) : row.values ? money(row.cost) : 'Не задана']].map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`

  const cards = [['ВЫРУЧКА', 'i-landmark', row.revenue], ['ВОЗВРАТЫ', 'i-rotate-ccw', row.returns], ['ВЫКУПЫ', 'i-package-check', row.buyouts], ['РАСХОДЫ', 'i-receipt', row.expenses], ['СЕБЕСТОИМОСТЬ', 'i-boxes', row.cost], ['МАРЖА', 'i-banknote', row.margin]]
  // Подписи считаются из тех же строк, что и сами карточки: доля выручки кабинета, штуки,
  // доля выкупов и маржинальность — второго источника чисел в карточке нет.
  const notes = row.values ? [
    `${rnpPercent(row.revenue / period.aggregate.revenue)} выручки кабинета`,
    `${rnpPercent(row.returns / row.revenue)} выручки`,
    `${rnpNumber.format(row.qty)} шт · ${rnpPercent(row.buyouts / row.revenue)} выручки`,
    `${rnpPercent(row.expenses / row.buyouts)} выкупов`,
    `${PRODUCT_COST_LABEL[row.costState]}${row.costFrom ? ` · от ${productDate(row.costFrom)}` : ''}`,
    `Маржинальность ${rnpPercent(row.marginability)}`,
  ] : cards.map(() => 'Нет продаж в периоде')
  document.getElementById('productKpiGrid').innerHTML = cards.map(([label, icon, value], index) => `<article class="kpi card"><span class="kpi-label">${label}</span><span class="kpi-icon" aria-hidden="true"><svg><use href="#${icon}"/></svg></span><span class="kpi-unit">В РУБЛЯХ</span><strong>${row.values ? money(value) : '—'}</strong><small${index === 5 && row.values ? ' class="positive"' : ''}>${notes[index]}</small></article>`).join('')

  document.getElementById('productCostPanel').innerHTML = `<header class="card-header"><div><h2>Себестоимость</h2><p id="productCostNote"></p></div><span class="status-chip ${status.tone}"><span class="status-light ${status.tone}"></span>${PRODUCT_COST_LABEL[row.costState]}</span></header>
    <div class="products-form">
      <label class="field-control"><span class="field-label">Себестоимость, руб.</span><input class="products-input" id="productCostInput" type="text" inputmode="decimal" placeholder="0.00" value="${row.costValue != null || row.values ? rnpNumber.format(row.costValue ?? row.cost) : ''}"></label>
      <label class="field-control"><span class="field-label">Дата начала</span><input id="productCostDate" type="hidden" value="${row.costFrom ?? ''}"><button class="date-field" type="button" data-calendar="single" data-input="productCostDate" aria-haspopup="dialog" aria-expanded="false"><span>${productDate(row.costFrom)}</span><svg><use href="#i-calendar"/></svg></button></label>
    </div>
    <button class="primary-button products-save" id="productSaveCost" type="button"><svg><use href="#i-check"/></svg><span>Сохранить</span></button>
    <h3 class="products-block-title">История себестоимости<small>последние изменения цены</small></h3>
    ${costSeries.length ? `<table class="products-history"><thead><tr><th>Дата начала</th><th>Дата окончания</th><th>Источник</th><th>Себестоимость</th></tr></thead><tbody>${costs.rows.map(entry => `<tr><td>${productDate(entry.from)}</td><td>${entry.to ? productDate(entry.to) : 'сейчас'}</td><td>${entry.label}</td><td class="products-num">${money(entry.value)}</td></tr>`).join('')}${historyPagerRow('cost', costs)}</tbody></table>` : '<p class="products-history-empty">История себестоимости пуста</p>'}`
  document.getElementById('productCostNote').textContent = row.costValue != null
    ? 'Значение задано вручную: маржа пересчитана, расходы остались расчётными'
    : 'Правка двигает маржу товара, расходы периода не меняются'
  bindDatePickers(document.getElementById('productCostPanel'))

  const plan = planSeries[0]
  document.getElementById('productPlanPanel').innerHTML = `<header class="card-header"><div><h2>Месячный план</h2><p id="productPlanNote"></p></div><span class="status-chip ${plan ? 'good' : 'muted'}"><span class="status-light ${plan ? 'good' : ''}"></span>${plan ? productMonthLabel(plan.month) : 'Планов нет'}</span></header>
    <div class="products-form">
      <label class="field-control"><span class="field-label">Месяц</span><div class="field-select" data-products-plan-month="true" data-caption="Месяц"><button class="field-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"><span>${productMonthLabel(productsState.planMonth)}</span><svg><use href="#i-chevron-down"/></svg></button><div class="field-select-popover" role="listbox">${months.map(month => `<button type="button" role="option" data-value="${month}"${month === productsState.planMonth ? ' aria-selected="true"' : ''}>${productMonthLabel(month)}<svg><use href="#i-check"/></svg></button>`).join('')}</div></div></label>
      ${[['План выручки, руб.', 'productPlanRevenue', planDraft?.revenue], ['План маржи, руб.', 'productPlanMargin', planDraft?.margin], ['План заказов, шт.', 'productPlanOrders', planDraft?.orders]].map(([label, id, value]) => `<label class="field-control"><span class="field-label">${label}</span><input class="products-input" id="${id}" type="text" inputmode="numeric" placeholder="0" value="${value == null ? '' : rnpNumber.format(value)}"></label>`).join('')}
    </div>
    <button class="primary-button products-save" id="productSavePlan" type="button"><svg><use href="#i-target"/></svg><span>Сохранить</span></button>
    <h3 class="products-block-title">История планов<small>версии, сохранённые в карточке</small></h3>
    ${planSeries.length ? `<table class="products-history"><thead><tr><th>Месяц</th><th>План выручки</th><th>План маржи</th><th>План заказов</th></tr></thead><tbody>${plans.rows.map(entry => `<tr><td>${productMonthLabel(entry.month)}</td><td class="products-num">${money(entry.revenue)}</td><td class="products-num">${money(entry.margin)}</td><td class="products-num">${rnpNumber.format(entry.orders)}</td></tr>`).join('')}${historyPagerRow('plan', plans)}</tbody></table>` : '<p class="products-history-empty">Планы ещё не заданы</p>'}`
  document.getElementById('productPlanNote').textContent = row.values
    ? `Факт периода: ${money(row.revenue)} выручки · ${rnpNumber.format(row.orders)} заказов`
    : 'Товар без продаж — план всё равно можно задать'
  bindFieldSelects(document.getElementById('productPlanPanel'))

  const max = Math.max(...trend.map(point => point.value), 1)
  const last = trend.at(-1), previous = trend.at(-2)
  document.getElementById('productTrendNote').textContent = trend.length
    ? `${trend.length} нед. до конца периода · последний столбец равен выкупам строки (${money(row.buyouts)}), остальные — недельная история товара`
    : 'Недель с данными в периоде нет'
  document.getElementById('productTrendChip').textContent = trend.length && previous
    ? `${last.value >= previous.value ? '+' : '−'}${money(Math.abs(last.value - previous.value))} к прошлой неделе`
    : 'к прошлой неделе —'
  document.getElementById('productTrend').innerHTML = trend.length
    ? `<div class="products-trend-bars">${trend.map((point, index) => `<div class="products-trend-col"><span class="products-trend-value">${rnpNumber.format(point.value)}</span><span class="products-trend-bar${index === trend.length - 1 ? ' is-last' : ''}" style="height:${Math.max(6, Math.round(point.value / max * 92))}px" tabindex="0" data-tooltip="${rangeLabel(point.from, point.to)} · ${money(point.value)}" data-tooltip-side="top"></span><small>Нед ${point.number}</small></div>`).join('')}</div>`
    : '<p class="products-history-empty">Нет недель с данными в выбранном периоде</p>'

  bindTooltips(document.getElementById('productView'))
}

function saveProductCost() {
  const product = PRODUCT_BY_KEY.get(productsState.product)
  const value = readProductNumber('productCostInput')
  const from = document.getElementById('productCostDate').value
  if (value == null || value < 0) return showToast('Введите корректную себестоимость', 'Ожидается число в рублях, например 138 204')
  if (!from) return showToast('Укажите дату начала', 'План и маржа пересчитываются от конкретной даты')
  // Правка не перезаписывает действующую цену, а сдвигает её в историю: записей столько же,
  // сколько сохранений, — как у планов. Сид снимается один раз, пока costState ещё родительский.
  const applied = productCardRow()
  const history = productCostLog.get(product.key) || (PRODUCT_COST_PAST[product.costState] || []).map(entry => ({ ...entry }))
  const previous = applied.costValue ?? (applied.values ? applied.cost : null)
  if (applied.costFrom && previous != null) {
    // Ручное число пишем как есть: оно не зависит от периода. Расчётное сохраняем множителем
    // к базовой себестоимости, иначе после смены периода история разошлась бы с рублями строки.
    const basis = applied.costValue == null ? applied.baselineCost : null
    history.push(basis
      ? { from: applied.costFrom, factor: previous / basis, label: PRODUCT_COST_LABEL[product.costState] }
      : { from: applied.costFrom, value: previous, label: PRODUCT_COST_LABEL[product.costState] })
  }
  productCostLog.set(product.key, history)
  Object.assign(product, { costValue: Math.round(value), costFrom: from, costState: 'manual' })
  productsState.costPage = 1
  renderProduct()
  showToast('Себестоимость сохранена', `Действует с ${productDate(from)} · маржа пересчитана`)
}

function saveProductPlan() {
  const product = PRODUCT_BY_KEY.get(productsState.product)
  const revenue = readProductNumber('productPlanRevenue')
  const margin = readProductNumber('productPlanMargin')
  const orders = readProductNumber('productPlanOrders')
  if (revenue == null && margin == null && orders == null) return showToast('Заполните хотя бы одну цель', 'План выручки, маржи или заказов — в рублях и штуках')
  const plan = { month: productsState.planMonth, revenue: Math.round(revenue ?? 0), margin: Math.round(margin ?? 0), orders: Math.round(orders ?? 0) }
  productPlanLog.set(product.key, [...(productPlanLog.get(product.key) || []), plan])
  // Страница истории подставляется под сохранённый месяц, а не сбрасывается на первую:
  // декабрь 2025 на второй странице исчезал из вида сразу после сохранения, и правка
  // выглядела потерянной — оставался только ряд с числами другого месяца.
  const savedIndex = productPlans(productCardRow(), productPlanMonths(productsPeriod())).findIndex(entry => entry.month === plan.month)
  productsState.planPage = Math.floor(Math.max(0, savedIndex) / HISTORY_ROWS) + 1
  renderProduct()
  showToast('План сохранён', `${productMonthLabel(plan.month)} · ${product.name}`)
}

// ── Переходы и слушатели ──────────────────────────────────────────────────────────────
const productsView = document.getElementById('productsView')
const productView = document.getElementById('productView')

productsView.addEventListener('input', event => {
  // Отбор в шапке применяется на каждое нажатие клавиши: это поле само по себе условие,
  // и второй кнопки «Применить» в ряду фильтров нет.
  const column = event.target.closest('[data-products-col-filter]')
  if (column) applyProductFilter(column.dataset.productsColFilter, event.target.value)
})
productsView.addEventListener('click', event => {
  // Перенос столбца отпускают поверх чужого заголовка или клетки: click после такого жеста
  // браузер шлёт по общему предку, и сортировка либо карточка сработали бы сами за нас.
  if (productColDragged) { productColDragged = false; return }
  if (event.target.closest('[data-products-clear-filters]')) return clearProductFilters()
  if (event.target.closest('[data-products-clear-selection]')) { productsState.selected.clear(); renderProducts(); return }
  const pop = event.target.closest('[data-products-filter-pop]')
  if (pop) { toggleProductsFilterPop(pop.dataset.productsFilterPop, pop); return }
  // Вкладки дока лежат в шапке карточки, кнопка «Открыть „Столбцы“» — в пустой таблице;
  // оба входа на одном обработчике, потому что внутри #productsDock их больше ничего нет.
  const dock = event.target.closest('[data-products-dock]')
  if (dock) { toggleProductsDock(dock.dataset.productsDock, dock, dock.dataset.productsDockFocus); return }
  // Чекбокс строки живёт внутри `[data-product]`: без раннего выхода клик по нему открывал
  // бы карточку товара вместо выделения.
  if (event.target.closest('.check-row')) return
  // Кнопка закрепления сидит в той же клетке шапки, что и сортировка: без проверки на неё раньше
  // заголовок колонки пересортировался бы вместо закрепа.
  const pin = event.target.closest('[data-products-pin]')
  if (pin) return setProductPin(pin.dataset.productsPin)
  const zoom = event.target.closest('[data-products-zoom]')
  if (zoom && !zoom.disabled) return setProductScale(zoom.dataset.productsZoom)
  const sort = event.target.closest('[data-products-sort]')
  if (sort) return sortProducts(sort.dataset.productsSort)
  const page = event.target.closest('[data-products-page]')
  if (page && !page.disabled) { productsState.page += Number(page.dataset.productsPage); renderProducts(); return }
  const row = event.target.closest('[data-product]')
  if (row) openProduct(row.dataset.product)
})
productsView.addEventListener('change', event => {
  const box = event.target.closest('[data-products-check]')
  if (!box) return
  const key = box.dataset.productsCheck
  if (key === 'all') {
    // «Выбрать все» живёт в шапке, то есть вне `<tbody>`, и пересобирает выделение страницы.
    productsView.querySelectorAll('.products-row [data-products-check]').forEach(row => {
      row.checked = box.checked
      toggleProductSelection(row.dataset.productsCheck, box.checked)
    })
    return
  }
  toggleProductSelection(key, box.checked)
})
productsView.addEventListener('pointerdown', bindProductResize)
// Оба жеста начинаются с заголовка: ресайц ловит ручку на границе, перенос — клетку
// целиком и на ручке выходит сам, поэтому порядок привязки значения не имеет.
productsView.addEventListener('pointerdown', bindProductColumnDrag)
productsView.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return
  // Пробел и Enter внутри поля (фильтр столбца, поиск в доке, чекбокс) заняты самим полем.
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable) return
  const row = event.target.closest('[data-product]')
  if (!row) return
  event.preventDefault()
  openProduct(row.dataset.product)
})
// Переключатель состояний переехал в тулбар, то есть вне #productsView, — слушатель тоже
// свой, иначе клик по нему не доходил бы до страницы.
document.getElementById('productsToolbarState').addEventListener('click', event => {
  const screen = event.target.closest('[data-products-screen]')
  if (screen) setProductScreen(screen.dataset.productsScreen)
})
productView.addEventListener('click', event => {
  if (event.target.closest('#productBack')) return switchView('products')
  if (event.target.closest('#productSaveCost')) return saveProductCost()
  if (event.target.closest('#productSavePlan')) return saveProductPlan()
  const pager = event.target.closest('[data-history-page]')
  if (pager && !pager.disabled) {
    productsState[pager.dataset.historyPage === 'cost' ? 'costPage' : 'planPage'] += Number(pager.dataset.step)
    renderProduct()
  }
})
productView.addEventListener('fieldselect', event => {
  if (!event.target.dataset.productsPlanMonth) return
  productsState.planMonth = event.detail.value
  // Поля формы — черновик выбранного месяца: подставляем сохранённое для него, иначе пустоту.
  const plan = productPlans(productCardRow(), productPlanMonths(productsPeriod())).find(entry => entry.month === event.detail.value)
  document.getElementById('productPlanRevenue').value = plan ? rnpNumber.format(plan.revenue) : ''
  document.getElementById('productPlanMargin').value = plan ? rnpNumber.format(plan.margin) : ''
  document.getElementById('productPlanOrders').value = plan ? rnpNumber.format(plan.orders) : ''
})
/* ── Студия: библиотека виджетов (§12.5) ─────────────────────────────────
   Карточка в библиотеке — источник, карточка на листе — её копия: правка в Студии уходит
   во все копии сразу, а лист при этом остаётся свободной сценой (копию можно двигать и убрать).
   Виджеты, добавленные на лист прямо с канваса, студийной карточки не имеют и не-syncятся. */
const STUDIO_ITEMS_STORE = 'grafio.studioItems'
// «Сегодня» в мокапе заморожено: относительные подписи посевных карточек («2 дн. назад»)
// обязаны повторяться от открытия к открытию, а не уплывать вместе с системными часами.
const STUDIO_NOW = new Date(2026, 4, 4, 9, 30)
const STUDIO_DAY = 86400000
// Название секции читается из типа виджета, как в оригинале: типы в библиотеке сегодня
// образуют одну группу, но заголовок рейса рисуется по данным, а не вшит в разметку.
const STUDIO_KIND_LABELS = { kpi: 'KPI', chart: 'ГРАФИКИ' }
const STUDIO_CHART_KIND_LABELS = { area: 'площадь', bars: 'столбцы', line: 'линия', stacked: 'стопка' }
// Группа карточки = вкладка отчёта, иконка — её знак: библиотека и отчёт называют один и тот
// же срез одними словами, иначе карточка «Финансы» и вкладка «Финансы» спорили бы о смысле.
const STUDIO_CHART_GROUPS = {
  finance: { label: 'Финансы', icon: 'i-banknote' },
  orders: { label: 'Заказы и выкупы', icon: 'i-boxes' },
  logistics: { label: 'Логистика', icon: 'i-package-check' },
  ads: { label: 'Реклама', icon: 'i-target' },
  search: { label: 'Поиск', icon: 'i-search' },
}

// Карточка библиотеки — проекция графика «Недельного отчёта», а не второй экземпляр данных:
// points и series передаются по ссылке, поэтому виджет, превью и отчёт расходятся только вместе.
// Компактный виджет не переключает единицы: он рисует базовую единицу самого графика.
function studioRegisterChart(config, extra = {}) {
  const unit = config.defaultUnit || 'percent'
  const group = STUDIO_CHART_GROUPS[config.tab]
  // Подпись серии берётся тем же правилом, что и в отчёте: generated-карточки переименовывают
  // метрику по единице («маржа» в долях — «маржинальность»), легенда стопки переименовывает
  // только маржу, поэтому ей подаёт подписи как есть.
  const labelOf = extra.labelOf || (series => {
    const renamed = WeeklyAnalytics.metricLabel(series.key, unit)
    return renamed === series.key ? series.label : renamed
  })
  const type = extra.type || config.type
  return registerDashboardChart(config.id, {
    title: config.title,
    group: group.label,
    source: config.source,
    icon: extra.icon || group.icon,
    type,
    // Формат графика живёт в справочнике: и карточка библиотеки, и строка панели графиков
    // подписывают его одним словом, а не вычисляют его двумя правилами.
    kindLabel: STUDIO_CHART_KIND_LABELS[type],
    unit,
    series: config.series.map(series => ({ key: series.key, color: series.color, label: labelOf(series) })),
    points: config.points,
    format: value => analyticsPointValue(value, unit),
  })
}

WeeklyAnalytics.WEEKLY_ANALYTICS_CHARTS.forEach(config => {
  if (config.id !== 'structure') studioRegisterChart(config)
})

// «Структура расходов по выкупам» собирается не из справочника, а из недельной сводки:
// в отчёте это отдельный блок stacked-столбцов. Легенда стопки переименовывает только маржу —
// в долях это «Маржинальность», остальные статьи называются как в самом отчёте.
studioRegisterChart({
  id: 'structure', tab: 'finance', title: 'Структура расходов по выкупам', source: 'Финансовый отчёт',
  defaultUnit: 'percent',
  series: categories.map(item => ({ key: item.key, color: item.color, label: item.key === 'margin' ? 'Маржинальность' : item.label })),
  points: weeks.map(week => ({ week: week.label, values: { percent: Object.fromEntries(categories.map(item => [item.key, week[item.key]])) } })),
}, { type: 'stacked', icon: 'i-receipt', labelOf: series => series.label })

// .v2: посев графиков сменился целиком (три вымышленные карточки ушли, пришли все тринадцать
// из отчёта). Старый флаг у уже открытого прототипа остался бы true и новых карточек бы не дал.
const STUDIO_CHARTS_SEEDED_STORE = 'grafio.studioChartsSeeded.v2'
// Четыре стартовых карточки листа появились раньше библиотеки и поля studioId не носят,
// поэтому их связь с каталогом задана таблицей id, а не признаком на виджете.
const STUDIO_DEFAULT_LINK = {
  'dash-revenue': 'studio-kpi-revenue',
  'dash-buyouts': 'studio-kpi-buyouts',
  'dash-margin': 'studio-kpi-margin',
  'dash-expenses': 'studio-kpi-expenses',
}

const studioState = { tab: 'all', sort: 'newest', view: 'grid', query: '' }
let studioMenuTargetId = null
let studioPinTargetId = null
let studioDeleteTargetId = null
let studioSeq = 0

function isStudioItem(item) {
  if (!item || typeof item !== 'object' || typeof item.id !== 'string') return false
  return (item.kind === 'kpi' && Boolean(KPI_METRICS[item.metricKey]))
    || (item.kind === 'chart' && Boolean(DASHBOARD_CHARTS[item.chartKey]))
}

// Утверждённые §6.2 четыре KPI: те же метрики, что стартуют на листе, поэтому связка
// «карточка ↔ виджет» у них сквозная с первого открытия.
function studioSeedItems() {
  return [['revenue', 4, 2], ['buyouts', 3, 2], ['margin', 2, 1], ['expenses', 1, 0]]
    .map(([metricKey, createdDays, updatedDays]) => ({
      id: `studio-kpi-${metricKey}`,
      kind: 'kpi',
      metricKey,
      title: '',
      showSparkline: true,
      archived: false,
      createdAt: STUDIO_NOW.getTime() - createdDays * STUDIO_DAY,
      updatedAt: STUDIO_NOW.getTime() - updatedDays * STUDIO_DAY,
    }))
}

function studioChartSeedItems() {
  // Порядок = порядок отчёта: карточка i стареет на день, поэтому сортировка «сначала новые»
  // даёт ровно ту последовательность, что идёт в «Недельном отчёте».
  return Object.keys(DASHBOARD_CHARTS).map((chartKey, index) => ({
    id: `studio-chart-${chartKey}`,
    kind: 'chart',
    chartKey,
    archived: false,
    createdAt: STUDIO_NOW.getTime() - index * STUDIO_DAY,
    updatedAt: STUDIO_NOW.getTime() - Math.floor(index / 3) * STUDIO_DAY,
  }))
}

// Карточки копят в localStorage, как избранное метрик и истории себестоимости: удаление
// виджета с листа не должно возвращать его в библиотеку при перезагрузке.
const studioItems = readStoreList(STUDIO_ITEMS_STORE, isStudioItem)
if (!studioItems.length) {
  studioItems.push(...studioSeedItems())
  writeStore(STUDIO_ITEMS_STORE, studioItems)
}
if (!readStore(STUDIO_CHARTS_SEEDED_STORE, false)) {
  studioItems.push(...studioChartSeedItems())
  writeStore(STUDIO_CHARTS_SEEDED_STORE, true)
  writeStore(STUDIO_ITEMS_STORE, studioItems)
}

function studioSaveItems() { writeStore(STUDIO_ITEMS_STORE, studioItems) }

function studioFindItem(id) { return studioItems.find(item => item.id === id) || null }

// Якорь копии на листе: ищем карточку того же графика, предпочитая неархивную. Архивная карточка
// остаётся законным якорем — копия честно ссылается на спрятанную карточку, а не повисает в пустоте.
function studioChartItemId(chartKey) {
  const item = studioItems.find(entry => entry.kind === 'chart' && entry.chartKey === chartKey && !entry.archived)
    || studioItems.find(entry => entry.kind === 'chart' && entry.chartKey === chartKey)
  return item ? item.id : null
}

function studioNextItemId() {
  studioSeq += 1
  return `studio-${Date.now().toString(36)}-${studioSeq}`
}

// Карточка разворачивается в виджет тем же createKpiWidget, что и лист: у библиотеки и у
// канваса один источник разметки и один набор полей метрики, разойтись они не могут.
function studioWidget(item) {
  if (item?.kind === 'chart') return createChartWidget(item.chartKey, { id: item.id, studioId: item.id })
  const metric = KPI_METRICS[item?.metricKey] || KPI_METRICS.revenue
  return createKpiWidget(item?.metricKey, {
    id: item?.id || 'studio-preview',
    title: item?.title || metric.title,
    showSparkline: item ? item.showSparkline !== false : true,
    studioId: item?.id,
  })
}

function studioLinkOf(widget) { return widget.studioId || STUDIO_DEFAULT_LINK[widget.id] || null }

// Копий на листах — сколько их сейчас на сценах, а не сколько раз нажали «Добавить»:
// виджет на листе можно убрать или задубликовать, и счётчик обязан показывать сцену.
function studioUsage(item) {
  let total = 0
  const names = []
  dashboardSheets.forEach(sheet => {
    const count = sheet.model.widgets.filter(widget => studioLinkOf(widget) === item.id).length
    if (!count) return
    total += count
    names.push(count === 1 ? sheet.name : `${sheet.name} ×${count}`)
  })
  return { total, label: names.length ? names.join(', ') : 'не добавлен' }
}

// Дубликат листа и «скопировать с листа» пересобирают id виджетов, а связь посевной
// четвёрки держится как раз на id (STUDIO_DEFAULT_LINK): копии повисают без карточки,
// и библиотека перестаёт видеть то, что уже лежит на листах. Перед показом ищем такой
// копии карточку по метрике и названию, а если карточки нет — заводим её. Метрику правят
// и на канвасе, id виджета при этом не меняется, поэтому под связку попадает и link,
// который указывает на карточку другой метрики.
// Не трогаем два случая: ссылка есть, а карточки нет (её удаляли намеренно — иначе
// удалённая воскресала бы при каждом входе в раздел) и архивные карточки в паре (иначе
// копия нового листа пряталась бы во вкладке «Архив» вместо библиотеки).
function studioAdoptSheetWidgets() {
  let changed = false
  dashboardSheets.forEach(sheet => {
    sheet.model.widgets.forEach(widget => {
      if (widget.kind !== 'kpi' || !KPI_METRICS[widget.metricKey]) return
      const link = studioLinkOf(widget)
      const linked = studioFindItem(link)
      if (link && !linked) return
      if (linked && linked.metricKey === widget.metricKey) return
      const metric = KPI_METRICS[widget.metricKey]
      let item = studioItems.find(candidate => !candidate.archived && candidate.metricKey === widget.metricKey
        && (candidate.title || metric.title) === widget.title)
      if (!item) {
        item = { id: studioNextItemId(), kind: 'kpi', metricKey: widget.metricKey, title: widget.title === metric.title ? '' : widget.title, showSparkline: widget.showSparkline !== false, archived: false, createdAt: Date.now(), updatedAt: Date.now() }
        studioItems.push(item)
      }
      sheet.model.updateWidget(widget.id, { studioId: item.id }, false)
      changed = true
    })
  })
  if (changed) studioSaveItems()
}

function studioRelativeTime(stamp) {
  const delta = STUDIO_NOW.getTime() - Number(stamp)
  if (!Number.isFinite(delta)) return '—'
  // Живые правки идут по Date.now(), который больше замороженного STUDIO_NOW: отрицательная
  // разница и есть честное «только что», а не ошибка знака.
  if (delta < 60000) return 'только что'
  const minutes = Math.floor(delta / 60000)
  if (minutes < 60) return `${minutes} мин. назад`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч. назад`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days} дн. назад` : new Date(Number(stamp)).toLocaleDateString('ru-RU')
}

function studioVisibleItems() {
  const query = studioState.query.trim().toLowerCase()
  const archived = studioState.tab === 'archived'
  const items = studioItems.filter(item => Boolean(item.archived) === archived
    && (!query || `${studioWidget(item).title} ${studioItemMeta(item).group}`.toLowerCase().includes(query)))
  if (studioState.sort === 'name') return items.sort((a, b) => studioWidget(a).title.localeCompare(studioWidget(b).title, 'ru'))
  return items.sort((a, b) => studioState.sort === 'oldest' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt)
}

function studioItemMeta(item) {
  if (item.kind === 'chart') {
    const chart = DASHBOARD_CHARTS[item.chartKey]
    return { group: chart.group, source: chart.source, unit: chart.kindLabel, icon: chart.icon }
  }
  const metric = KPI_METRICS[item.metricKey] || KPI_METRICS.revenue
  return { group: metric.group, source: metric.source, unit: metric.unitTag, icon: metric.icon }
}

function studioGroups(items) {
  return Object.entries(STUDIO_KIND_LABELS)
    .map(([kind, label]) => ({ label, items: items.filter(item => item.kind === kind) }))
    .filter(group => group.items.length)
}

// Кнопки быстрых действий общие для карточки и для строки списка: разный только контейнер.
function studioActionButtonsMarkup(item) {
  const edit = item.kind === 'kpi' ? `<button class="dashboard-widget-action" type="button" data-studio-edit="${item.id}" aria-label="Настроить виджет">${dashboardIcon('i-pencil')}</button>` : ''
  return `${edit}<button class="dashboard-widget-action" type="button" data-studio-menu="${item.id}" aria-haspopup="menu" aria-expanded="false" aria-label="Действия с виджетом">${dashboardIcon('i-more')}</button>`
}

function studioCardMarkup(item) {
  const widget = studioWidget(item)
  const meta = studioItemMeta(item)
  const usage = studioUsage(item)
  const cell = (label, value, modifier = '') => `<div${modifier === 'wide' ? ' class="is-wide"' : ''}><dt>${label}</dt><dd${modifier === 'mono' ? ' class="mono"' : ''}>${escapeDashboardText(value)}</dd></div>`
  return `<article class="studio-card${item.archived ? ' is-archived' : ''}${item.kind === 'chart' ? ' is-chart' : ''}" data-studio-card="${item.id}">
    <div class="studio-card-preview"><div class="dashboard-widget dashboard-widget-${widget.kind} studio-widget${widget.showSparkline ? ' has-sparkline' : ''}" style="width:${widget.w}px;height:${widget.h}px">${dashboardWidgetMarkup(widget)}<div class="dashboard-widget-actions ${widget.kind === 'kpi' ? 'dashboard-kpi-actions' : ''} studio-card-actions">${studioActionButtonsMarkup(item)}</div></div></div>
    <dl class="studio-card-meta">${cell('Виджет', widget.title)}${cell('Группа', meta.group)}${cell('Источник', `${meta.source} · ${meta.unit}`)}${cell('Обновлён', studioRelativeTime(item.updatedAt), 'mono')}${cell('На листах', usage.label, 'wide')}</dl>
  </article>`
}

function studioRowMarkup(item) {
  const widget = studioWidget(item)
  const meta = studioItemMeta(item)
  const spark = item.kind === 'chart'
    ? `<span class="studio-chart-kind">${escapeDashboardText(meta.unit)}</span>`
    : `<span class="dashboard-sparkline studio-spark${widget.showSparkline ? '' : ' is-off'}" aria-hidden="true">${dashboardSparklineSvg(widget, 74)}</span>`
  return `<tr data-studio-card="${item.id}">
    <td><span class="studio-name-cell">${dashboardIcon(meta.icon)}<strong>${escapeDashboardText(widget.title)}</strong></span></td>
    <td>${escapeDashboardText(meta.group)}</td>
    <td>${escapeDashboardText(`${meta.source} · ${meta.unit}`)}</td>
    <td>${spark}</td>
    <td>${escapeDashboardText(studioRelativeTime(item.updatedAt))}</td>
    <td>${escapeDashboardText(studioUsage(item).label)}</td>
    <td><span class="studio-row-actions">${studioActionButtonsMarkup(item)}</span></td>
  </tr>`
}

function studioEmptyMarkup() {
  const query = studioState.query.trim()
  const archived = studioState.tab === 'archived'
  const title = query ? 'Ничего не найдено' : archived ? 'Архив пуст' : 'Библиотека пуста'
  const note = query ? 'Измените запрос — в каталоге остаются виджеты других групп.'
    : archived ? 'В архив уходят виджеты, которые больше не нужны на листах; оттуда их можно восстановить.'
    : '«Новый виджет» собирает KPI из каталога метрик и сохраняет карточку здесь.'
  return `<div class="studio-empty">${dashboardIcon(query ? 'i-search' : 'i-plus')}<strong>${title}</strong><small>${note}</small></div>`
}

function renderStudio() {
  const content = document.getElementById('studioContent')
  if (!content) return
  studioAdoptSheetWidgets()
  const items = studioVisibleItems()
  const active = studioItems.filter(item => !item.archived).length
  document.getElementById('studioSubtitle').textContent = 'Карточка здесь — источник, карточка на листе — её копия'
  document.getElementById('studioTabCountAll').textContent = active
  document.getElementById('studioTabCountArchived').textContent = studioItems.length - active
  document.querySelectorAll('.studio-tab').forEach(tab => {
    const on = tab.dataset.studioTab === studioState.tab
    tab.classList.toggle('is-active', on)
    tab.setAttribute('aria-pressed', String(on))
  })
  document.querySelectorAll('#studioViewToggle button').forEach(button => {
    const on = button.dataset.studioView === studioState.view
    button.classList.toggle('is-active', on)
    button.setAttribute('aria-pressed', String(on))
  })
  if (!items.length) {
    content.innerHTML = studioEmptyMarkup()
    return
  }
  content.innerHTML = studioState.view === 'list'
    ? `<div class="card studio-table-card"><table class="studio-table"><thead><tr><th>Виджет</th><th>Группа</th><th>Источник</th><th>График</th><th>Обновлён</th><th>На листах</th><th></th></tr></thead><tbody>${items.map(studioRowMarkup).join('')}</tbody></table></div>`
    : studioGroups(items).map(group => `<section class="studio-section">
      <header class="studio-section-head"><h2>${escapeDashboardText(group.label)}</h2></header>
      <div class="studio-rail">${group.items.map(studioCardMarkup).join('')}</div>
    </section>`).join('')
}

// ── Слои: меню карточки и список листов ────────────────────────────────────

// Триггер живёт в пересобираемом #studioContent: после любой правки узел отсоединяется,
// а нулевой rect положил бы меню в левый верхний угол вьюпорта. Ищем живой узел карточки.
function studioTriggerNode(id) {
  const live = document.querySelector(`#studioView [data-studio-menu="${id}"]`)
  return live?.getClientRects().length ? live : null
}

function placeStudioMenu(menu, anchor) {
  const bounds = anchor.getBoundingClientRect()
  menu.style.left = `${Math.max(8, Math.min(window.innerWidth - menu.offsetWidth - 8, bounds.right - menu.offsetWidth))}px`
  menu.style.top = `${Math.max(8, Math.min(window.innerHeight - menu.offsetHeight - 8, bounds.bottom + 4))}px`
}

function closeStudioCardMenu() {
  const menu = document.getElementById('studioCardMenu')
  if (!menu) return
  menu.classList.remove('is-open')
  menu.setAttribute('aria-hidden', 'true')
  document.querySelectorAll('[data-studio-menu][aria-expanded="true"]').forEach(node => node.setAttribute('aria-expanded', 'false'))
  studioMenuTargetId = null
}

function closeStudioSheetMenu() {
  const menu = document.getElementById('studioSheetMenu')
  if (!menu) return
  menu.classList.remove('is-open')
  menu.setAttribute('aria-hidden', 'true')
  studioPinTargetId = null
}

function closeStudioLayers() {
  closeStudioCardMenu()
  closeStudioSheetMenu()
}

function openStudioCardMenu(id) {
  const menu = document.getElementById('studioCardMenu')
  const item = studioFindItem(id)
  const anchor = studioTriggerNode(id)
  if (!menu || !item || !anchor) return
  closeStudioSheetMenu()
  studioMenuTargetId = id
  // «Добавить на лист» нет смысла у архивной карточки: на сцену попадает только активная.
  menu.innerHTML = `${item.kind === 'kpi' ? `<button role="menuitem" data-studio-action="edit">${dashboardIcon('i-pencil')}Редактировать</button>` : ''}
    <button role="menuitem" data-studio-action="pin"${item.archived ? ' hidden' : ''}>${dashboardIcon('i-plus')}Добавить на лист…</button>
    <button role="menuitem" data-studio-action="duplicate">${dashboardIcon('i-copy')}Дублировать</button>
    <span class="menu-sep"></span>
    <button role="menuitem" data-studio-action="archive">${dashboardIcon(item.archived ? 'i-undo' : 'i-boxes')}${item.archived ? 'Восстановить' : 'В архив'}</button>
    <span class="menu-sep"></span>
    <button class="danger" role="menuitem" data-studio-action="delete">${dashboardIcon('i-trash')}Удалить виджет</button>`
  menu.classList.add('is-open')
  menu.setAttribute('aria-hidden', 'false')
  placeStudioMenu(menu, anchor)
  anchor.setAttribute('aria-expanded', 'true')
}

function openStudioSheetMenu(id) {
  const menu = document.getElementById('studioSheetMenu')
  const item = studioFindItem(id)
  // Якорь снимаем до закрытия первого меню: карточка остаётся на месте, но порядок важен,
  // если closeStudioCardMenu когда-нибудь начнёт триггер чистить.
  const anchor = studioTriggerNode(id)
  if (!menu || !item || !anchor) return
  closeStudioCardMenu()
  studioPinTargetId = id
  menu.innerHTML = `<div class="copy-source-scroll">${dashboardSheets.map(sheet => `<button type="button" role="menuitem" data-studio-sheet="${sheet.id}">${dashboardIcon(sheetIcon(sheet))}<span>${escapeDashboardText(sheet.name)}</span><em>${sheet.model.widgets.length}</em></button>`).join('')}</div>`
  const scroll = menu.firstElementChild
  menu.classList.add('is-open')
  menu.setAttribute('aria-hidden', 'false')
  scroll.scrollTop = 0
  scroll.style.maxHeight = `${copySourceMenuHeight(scroll.firstElementChild)}px`
  placeStudioMenu(menu, anchor)
  anchor.setAttribute('aria-expanded', 'true')
}

// ── Действия карточки ──────────────────────────────────────────────────────

function studioPinTo(id, sheetId) {
  const item = studioFindItem(id)
  const sheet = dashboardSheets.find(entry => entry.id === sheetId)
  if (!item || !sheet) return
  const widget = studioWidget(item)
  // Свободную позицию ищем по фактическому формату шаблона: KPI и графики не накладываются
  // друг на друга, даже если график добавляют на неактивный лист.
  const slot = findFreeDashboardSlot(widget, sheet.model)
  sheet.model.commit()
  sheet.model.addWidget({ ...widget, id: `dash-${item.kind}-${studioNextItemId()}`, studioId: item.id, x: slot.x, y: slot.y }, false)
  renderStudio()
  showToast(item.kind === 'chart' ? 'График добавлен' : 'KPI добавлен', `${widget.title} · лист «${sheet.name}»`)
}

function studioDuplicateItem(item) {
  const copy = { ...item, id: studioNextItemId(), createdAt: Date.now(), updatedAt: Date.now() }
  studioItems.push(copy)
  studioSaveItems()
  renderStudio()
  // Копия остаётся в том же разделе, откуда её взяли: из архива — в архиве.
  showToast('Карточка продублирована', studioWidget(copy).title)
}

function studioToggleArchive(item) {
  item.archived = !item.archived
  item.updatedAt = Date.now()
  studioSaveItems()
  renderStudio()
  showToast(item.archived ? 'Виджет в архиве' : 'Виджет восстановлен', `${studioWidget(item).title} · ${item.archived ? 'копии на листах остались' : 'снова доступен для листов'}`)
}

function openStudioDelete(id) {
  const item = studioFindItem(id)
  if (!item) return
  studioDeleteTargetId = id
  const usage = studioUsage(item)
  document.getElementById('studioDeleteTitle').textContent = `Удалить «${studioWidget(item).title}»?`
  document.getElementById('studioDeleteNote').textContent = usage.total
    ? `На листах ${usage.total} ${pluralizeDashboard(usage.total, ['копия', 'копии', 'копий'])}. Карточку удалим из библиотеки, копии останутся на сценах и перестанут обновляться вместе с ней.`
    : 'На листах копий нет — удаление затронет только библиотеку.'
  openModal('studioDeleteModal', '#studioDeleteClose')
}

function closeStudioDelete() {
  studioDeleteTargetId = null
  closeModal('studioDeleteModal')
}

function confirmStudioDelete() {
  const item = studioFindItem(studioDeleteTargetId)
  closeStudioDelete()
  if (!item) return
  studioItems.splice(studioItems.indexOf(item), 1)
  studioSaveItems()
  renderStudio()
  showToast('Виджет удалён', `${studioWidget(item).title} · карточка убрана из библиотеки`)
}

// Правка карточки уходит во все её копии на всех листах — в один шаг истории на лист,
// иначе Ctrl+Z на канвасе откатывал бы карточки по одной.
function studioSyncSheets(item) {
  const widget = studioWidget(item)
  const patch = { metricKey: widget.metricKey, ...KPI_METRICS[item.metricKey], title: widget.title, sparkline: widget.sparkline }
  dashboardSheets.forEach(sheet => {
    const copies = sheet.model.widgets.filter(entry => studioLinkOf(entry) === item.id)
    if (!copies.length) return
    sheet.model.commit()
    copies.forEach(entry => sheet.model.updateWidget(entry.id, patch, false))
  })
}

function runStudioAction(action, item) {
  if (action === 'edit') {
    closeStudioCardMenu()
    openDashboardKpiEditor(null, { studio: true, studioItem: item })
    return
  }
  // Второй слой открывается от того же триггера, поэтому первое меню закрывает сам
  // openStudioSheetMenu: закрыть его здесь значило бы потерять якорь.
  if (action === 'pin') {
    openStudioSheetMenu(item.id)
    return
  }
  closeStudioCardMenu()
  if (action === 'duplicate') studioDuplicateItem(item)
  if (action === 'archive') studioToggleArchive(item)
  if (action === 'delete') openStudioDelete(item.id)
}

// Ответ панели KPI, открытой из «Студии»: карточка, а не виджет листа.
function applyStudioKpiEditor() {
  const keys = kpiEditorState.selectedKeys
  if (!keys.length) {
    showToast('Метрика не выбрана', 'Отметьте хотя бы один показатель')
    return
  }
  const customTitle = keys.length === 1 ? document.getElementById('kpiCustomTitle').value.trim() : ''
  const base = studioFindItem(kpiEditorState.widgetId)
  if (base) {
    base.metricKey = keys[0]
    base.title = customTitle
    base.updatedAt = Date.now()
    studioSyncSheets(base)
  }
  // Лишние метрики из стопки создают отдельные карточки — как на листе, где множественный
  // выбор добавляет несколько виджетов.
  const created = keys.slice(base ? 1 : 0).map(key => {
    const item = { id: studioNextItemId(), kind: 'kpi', metricKey: key, title: '', showSparkline: true, archived: false, createdAt: Date.now(), updatedAt: Date.now() }
    studioItems.push(item)
    return item
  })
  studioSaveItems()
  rememberKpiRecents(keys)
  const extra = created.length ? `${created.length} ${pluralizeDashboard(created.length, ['карточка', 'карточки', 'карточек'])}` : ''
  closeDashboardKpiEditor()
  renderStudio()
  if (base) showToast('Виджет обновлён', extra ? `${studioWidget(base).title} · и ещё ${extra}` : `${studioWidget(base).title} · копии на листах обновлены`)
  else showToast(created.length > 1 ? 'Виджеты созданы' : 'Виджет создан', extra ? `${extra} в библиотеке` : studioWidget(created[0]).title)
}

// ── Слушатели раздела ──────────────────────────────────────────────────────

const studioView = document.getElementById('studioView')
const studioToolbar = document.getElementById('studioToolbarTools')

// Поиск, вкладки, сортировка и способ показа переехали в тулбар, поэтому их клики
// не проходят через #studioView — слушаем группу в тулбаре отдельно.
studioToolbar.addEventListener('click', event => {
  const tab = event.target.closest('[data-studio-tab]')
  if (tab) {
    studioState.tab = tab.dataset.studioTab
    closeStudioLayers()
    renderStudio()
    return
  }
  const view = event.target.closest('[data-studio-view]')
  if (view) {
    studioState.view = view.dataset.studioView
    closeStudioLayers()
    renderStudio()
  }
})

studioToolbar.addEventListener('input', event => {
  if (event.target.id !== 'studioSearch') return
  studioState.query = event.target.value
  closeStudioLayers()
  renderStudio()
})

studioToolbar.addEventListener('fieldselect', event => {
  if (!event.target.hasAttribute('data-studio-sort')) return
  studioState.sort = event.detail.value
  renderStudio()
})

studioView.addEventListener('click', event => {
  const edit = event.target.closest('[data-studio-edit]')
  if (edit) {
    const item = studioFindItem(edit.dataset.studioEdit)
    if (item) openDashboardKpiEditor(null, { studio: true, studioItem: item })
    return
  }
  const trigger = event.target.closest('[data-studio-menu]')
  if (trigger) {
    // Повторный клик по тому же триггеру сворачивает меню: на канвасе так работает ⋯ листа.
    if (studioMenuTargetId === trigger.dataset.studioMenu) closeStudioCardMenu()
    else openStudioCardMenu(trigger.dataset.studioMenu)
  }
})

// Меню карточки лежит на уровне вворкспейса (над канвасом), а не внутри #studioView,
// поэтому его клики не доходят до делегата раздела — слушаем сам слой.
document.getElementById('studioCardMenu').addEventListener('click', event => {
  const action = event.target.closest('[data-studio-action]')
  if (!action) return
  const item = studioFindItem(studioMenuTargetId)
  if (item) runStudioAction(action.dataset.studioAction, item)
  else closeStudioCardMenu()
})

document.getElementById('studioCreateButton').addEventListener('click', () => openDashboardKpiEditor(null, { studio: true }))
document.getElementById('studioSheetMenu').addEventListener('click', event => {
  const sheet = event.target.closest('[data-studio-sheet]')
  if (!sheet) return
  const id = studioPinTargetId
  closeStudioSheetMenu()
  studioPinTo(id, sheet.dataset.studioSheet)
})
document.getElementById('studioDeleteModal').addEventListener('click', event => {
  if (event.target.closest('#studioDeleteConfirm')) confirmStudioDelete()
  else if (event.target.closest('#studioDeleteClose,#studioDeleteCancel') || event.target.id === 'studioDeleteModal') closeStudioDelete()
})

// ── 12.6. Настройки: маркетплейс-аккаунты ─────────────────────────────────
// Зеркало frontend/src/pages/settings/SettingsPage.tsx: две колонки карточек без своей
// шапки, порядок по дате создания, статус и время последней синхронизации внутри карточки.
const SETTINGS_STORE = 'grafio.settingsAccounts.v2'
const SETTINGS_LIMIT = 10
const SETTINGS_MARKETS = {
  wildberries: { label: 'Wildberries', mark: 'WB' },
  ozon: { label: 'Ozon', mark: 'OZ' },
}
// Пункты меню площадки строятся из того же списка, что и карточки: «Все» плюс по одному
// входу на площадку. Отдельно держать названия было бы вторым источником правды.
const SETTINGS_MARKET_MENU = [
  { value: 'all', mark: 'ВСЕ', title: 'Все маркетплейсы', note: 'Кабинеты обеих площадок', selected: true },
  ...Object.entries(SETTINGS_MARKETS).map(([value, market]) => ({ value, mark: market.mark, title: market.label, note: `Только кабинеты ${market.label}` })),
]
// Набор полей ключа разный, как в оригинале: у WB один API-ключ, у Ozon три раздельных.
const SETTINGS_FIELDS = {
  wildberries: [{ key: 'key', label: 'API-ключ', placeholder: 'Вставьте API ключ', secret: true }],
  ozon: [
    { key: 'clientId', label: 'Client ID', placeholder: 'Client ID' },
    { key: 'perfClientId', label: 'Performance Client ID', placeholder: 'API-ключ сервиса продаж' },
    { key: 'perfSecret', label: 'Performance Client Secret', placeholder: 'Секретный ключ сервиса продаж', secret: true },
  ],
}
const SETTINGS_STATUS = {
  pending: { label: 'Ожидание', chip: 'muted', light: 'muted' },
  running: { label: 'Синхронизация', chip: 'warning', light: 'warning' },
  completed: { label: 'Завершено', chip: 'good', light: 'good' },
  partial: { label: 'Частично синхронизирован', chip: 'warning', light: 'warning' },
  failed: { label: 'Ошибка', chip: 'danger', light: 'bad' },
}
// Раздел смотрит на тот же замороженный момент, что и «Студия»: свежие штамп
// должны оставаться внутри демо-недели, иначе «04.05.2026» и сегодняшняя дата
// стояли бы в одной сетке.
const SETTINGS_STAMP = STUDIO_NOW.getTime()
const SETTINGS_MINUTE = 60000
// Автообновление раз в 3 часа — нативная формулировка лимитов WB (AccountCard.tsx:412:
// «заказы — раз в 3 часа»). В демо расписание одно на все маркетплейсы.
const SETTINGS_AUTO_SYNC = 3 * 60 * SETTINGS_MINUTE
// Пять разделов — нативные syncType оригинала (AccountCard.tsx:70). Один и тот же список
// держат карточка и модалка правки: иначе «что отдаёт ключ» и «что мы проверили» разойдутся.
const SETTINGS_SECTIONS = ['Статистика', 'Финансы', 'Контент', 'Продвижение', 'Аналитика']
// health и syncStatus — два разных сигнала, как в оригинале: статус про «когда и целиком ли»,
// health про жив ли ключ прямо сейчас.
const SETTINGS_HEALTH = {
  ok: { label: 'Норма', light: 'good' },
  throttled: { label: 'Замедление', light: 'warning' },
  penalty: { label: 'Превышен лимит', light: 'bad' },
  blocked: { label: 'Нет доступа', light: 'bad' },
}

function isSettingsAccount(account) {
  return Boolean(account) && typeof account === 'object' && typeof account.id === 'string'
    && Boolean(SETTINGS_MARKETS[account.marketplace]) && typeof account.name === 'string'
}

// Три карточке зеркалят menuData.account: тот же набор кабинетов, что переключается в тулбаре.
// denied — память о последней проверке ключа: у «Севера» право на аналитику не выдано,
// что и делает его статус «Частично синхронизирован» честным, а отозванный ключ Ozon
// не проходит ни одну проверку.
function settingsSeedAccounts() {
  return [
    {
      id: 'settings-wb-main', marketplace: 'wildberries', name: 'Основной кабинет', studioNo: '103287',
      creds: { key: 'wb-demo-8f2c41a953' }, status: 'completed', health: 'ok', retryAt: null, denied: [],
      syncedAt: SETTINGS_STAMP - 42 * SETTINGS_MINUTE, createdAt: SETTINGS_STAMP - 26 * 24 * 60 * SETTINGS_MINUTE,
    },
    {
      id: 'settings-wb-north', marketplace: 'wildberries', name: 'Север', studioNo: '118024',
      creds: { key: 'wb-demo-31c077be42' }, status: 'partial', health: 'throttled', retryAt: SETTINGS_STAMP + 3 * SETTINGS_MINUTE, denied: ['Аналитика'],
      syncedAt: SETTINGS_STAMP - 194 * SETTINGS_MINUTE, createdAt: SETTINGS_STAMP - 11 * 24 * 60 * SETTINGS_MINUTE,
    },
    {
      id: 'settings-ozon-main', marketplace: 'ozon', name: 'Ozon · основной', studioNo: null,
      creds: { clientId: 'oz-client-55210', perfClientId: 'oz-perf-8814', perfSecret: 'oz-secret-9f3c77' },
      status: 'failed', health: 'blocked', retryAt: null, denied: [...SETTINGS_SECTIONS],
      syncedAt: null, createdAt: SETTINGS_STAMP - 3 * 24 * 60 * SETTINGS_MINUTE,
    },
  ]
}

const settingsAccounts = readStoreList(SETTINGS_STORE, isSettingsAccount)
if (!settingsAccounts.length) {
  settingsAccounts.push(...settingsSeedAccounts())
  writeStore(SETTINGS_STORE, settingsAccounts)
}

const settingsState = { editId: null, deleteId: null, syncId: null, runningId: null, draft: null, perms: null, testing: false, saving: false, market: 'all' }
let settingsSyncTimer = null
let settingsSaveTimer = null
let settingsTestTimer = null

function settingsSave() { writeStore(SETTINGS_STORE, settingsAccounts) }
function settingsFind(id) { return settingsAccounts.find(account => account.id === id) || null }

// Ключ живёт замаскированным и в карточке, и в рамке (§7): настоящие значения мокап не
// хранит, поэтому маска — это то же самое, что показывает оригинал после подключения.
function settingsMask(value) {
  const text = String(value || '')
  if (!text) return '—'
  return text.length <= 6 ? '***' : `${text.slice(0, 3)}***${text.slice(-3)}`
}

function settingsStamp(ts) {
  const stamp = Number(ts)
  if (!Number.isFinite(stamp)) return '—'
  return new Date(stamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function settingsAlertMarkup(account) {
  if (account.health === 'throttled') {
    return `<p class="settings-alert">${dashboardIcon('i-alert')}<span><b>Замедление WB</b>Сервис ограничил частоту запросов. Быстрая синхронизация снова будет доступна после ${settingsStamp(account.retryAt)}.</span></p>`
  }
  if (account.health === 'blocked') {
    return `<p class="settings-alert is-danger">${dashboardIcon('i-alert')}<span><b>Нет доступа к кабинету</b>Ключ отозван или недействителен. Обновите его в карточке «Редактировать», затем запустите синхронизацию заново.</span></p>`
  }
  return ''
}

// Слот статуса обязателен у каждой карточки (перенос варианта L из mockup-settings-card-size):
// блок на две строки есть и у здоровых кабинетов, поэтому низы ряда сходятся без stretch
// и без констант высоты. Замер стенда: разброс 0, пустого пояса 0, раздел 725 px против 744.
function settingsStatusMarkup(account, running) {
  const alert = settingsAlertMarkup(account)
  if (alert) return alert
  if (running) {
    return `<p class="settings-alert is-calm">${dashboardIcon('i-refresh')}<span><b>Синхронизация выполняется</b>Загружаем разделы кабинета, это займёт пару секунд.</span></p>`
  }
  if (!account.syncedAt) {
    return `<p class="settings-alert is-calm">${dashboardIcon('i-clock')}<span><b>Синхронизация ещё не запускалась</b>Запустите её вручную, чтобы разделы сервиса наполнились данными.</span></p>`
  }
  return `<p class="settings-alert is-calm">${dashboardIcon('i-check')}<span><b>Данные актуальны</b>Следующая автоматическая синхронизация — ${settingsStamp(account.syncedAt + SETTINGS_AUTO_SYNC)}.</span></p>`
}

// Потолок контента (то же решение L): ключей показываем не больше двух, остальные сворачиваются
// в строку-счётчик со списком в подсказке. Высота карточки перестаёт зависеть от числа полей
// ключа, и ни одной фиксированной высоты под это не кладём.
const SETTINGS_KEY_ROWS = 2
function settingsRowsMarkup(account) {
  const fields = SETTINGS_FIELDS[account.marketplace]
  const keyRow = field => `<span class="settings-row">${dashboardIcon('i-key')}<span>${field.label}</span><code>${escapeDashboardText(settingsMask(account.creds?.[field.key]))}</code></span>`
  const rest = fields.slice(SETTINGS_KEY_ROWS)
  const restTip = rest.map(field => `${field.label} — ${settingsMask(account.creds?.[field.key])}`).join(', ')
  return `<div class="settings-rows">${fields.slice(0, SETTINGS_KEY_ROWS).map(keyRow).join('')}${rest.length ? `<span class="settings-row settings-more" tabindex="0" role="note" data-tooltip="${escapeDashboardText(restTip)}" data-tooltip-side="left">${dashboardIcon('i-key')}<span>Остальные ключи</span><code>+${rest.length}</code></span>` : ''}<span class="settings-row">${dashboardIcon('i-clock')}<span>Последняя синхронизация</span><time>${account.syncedAt ? `${settingsStamp(account.syncedAt)} <em>· авто</em>` : 'ещё не запускалась'}</time></span></div>`
}

function settingsSyncMenuMarkup() {
  return `<div class="settings-sync-menu" aria-label="Вид синхронизации">
    <button type="button" data-settings-sync-run="quick">${dashboardIcon('i-refresh')}<span><strong>Быстрая синхронизация</strong><small>Загрузить данные за последние 14 дней</small></span></button>
    <button type="button" data-settings-sync-run="full">${dashboardIcon('i-rotate-ccw')}<span><strong>Полная пересинхронизация</strong><small>Загрузить все данные за 90 дней</small></span></button>
  </div>`
}

function settingsCardMarkup(account) {
  const market = SETTINGS_MARKETS[account.marketplace]
  const running = settingsState.runningId === account.id
  const chip = running ? SETTINGS_STATUS.running : (SETTINGS_STATUS[account.status] || SETTINGS_STATUS.pending)
  const health = SETTINGS_HEALTH[account.health]
  const perms = settingsPerms(account)
  return `<article class="card settings-card" data-settings-card="${account.id}">
    <header class="settings-card-head"><span class="mp-mark">${market.mark}</span><div><div class="settings-card-title"><strong>${escapeDashboardText(account.name)}</strong>${health ? `<span class="settings-health"><span class="status-light ${health.light}"></span>${health.label}</span>` : ''}</div><small>${market.label}${account.studioNo ? ` · Кабинет № ${escapeDashboardText(account.studioNo)}` : ''}</small></div><span class="status-chip ${chip.chip}"><span class="status-light ${chip.light}"></span>${chip.label}</span></header>
    ${settingsRowsMarkup(account)}
    ${perms ? `<div class="settings-perms is-card">${settingsPermsMarkup(perms, 'Ключ раздаёт')}</div>` : ''}
    ${settingsStatusMarkup(account, running)}
    <div class="settings-actions">
      <span class="settings-sync"><button type="button" class="secondary-button" data-settings-sync="${account.id}" aria-haspopup="menu" aria-expanded="false"${running ? ' disabled' : ''}>${running ? `<span class="is-spinning">${dashboardIcon('i-refresh')}</span>` : dashboardIcon('i-refresh')}<span>${running ? 'Синхронизация…' : 'Синхронизация'}</span></button>${settingsSyncMenuMarkup()}</span>
      <button type="button" class="secondary-button" data-settings-edit="${account.id}"${running ? ' disabled' : ''}>${dashboardIcon('i-pencil')}Редактировать</button>
      <button type="button" class="secondary-button settings-remove" data-settings-delete="${account.id}"${running ? ' disabled' : ''}>${dashboardIcon('i-trash')}Удалить</button>
    </div>
  </article>`
}

function settingsEmptyMarkup(market) {
  if (!market) {
    return `<div class="settings-empty">${dashboardIcon('i-link')}<strong>Нет подключённых маркетплейсов</strong><small>Добавьте первый маркетплейс для начала работы. Поддерживаются Wildberries и Ozon.</small><button type="button" class="primary-button" data-settings-add>${dashboardIcon('i-plus')}Добавить маркетплейс</button></div>`
  }
  // Пусто по фильтру — не то же самое, что пусто вообще: здесь есть что показать, поэтому
  // первая кнопка снимает фильтр, а вторая добавляет кабинет именно этой площадки.
  return `<div class="settings-empty">${dashboardIcon('i-filter')}<strong>На ${market} кабинетов нет</strong><small>Ни один подключённый кабинет не относится к этой площадке. Добавьте подключение или покажите все маркетплейсы.</small><span class="settings-empty-actions"><button type="button" class="secondary-button" data-settings-market="all">Показать все маркетплейсы</button><button type="button" class="primary-button" data-settings-add>${dashboardIcon('i-plus')}Добавить ${market}</button></span></div>`
}

// Триггер живёт в статичном тулбаре, а состояние — в settingsState: когда фильтр меняется не
// кликом по меню (сброс после добавления кабинета другой площадки), и подпись, и отметка
// пункта возвращаются отсюда.
function syncSettingsMarketTrigger() {
  const chosen = SETTINGS_MARKET_MENU.find(entry => entry.value === settingsState.market)
  SETTINGS_MARKET_MENU.forEach(entry => entry.selected = entry === chosen)
  document.getElementById('settingsMarketTrigger').querySelector('span').textContent = chosen.title
}

function renderSettings() {
  const content = document.getElementById('settingsContent')
  if (!content) return
  const market = settingsState.market
  syncSettingsMarketTrigger()
  const visible = settingsAccounts.filter(account => market === 'all' || account.marketplace === market)
  const scope = market === 'all' ? '' : ` ${SETTINGS_MARKETS[market].label}`
  document.getElementById('settingsSubtitle').textContent = settingsAccounts.length
    ? `${visible.length} ${pluralizeDashboard(visible.length, ['аккаунт', 'аккаунта', 'аккаунтов'])}${scope} из ${SETTINGS_LIMIT} · ключи только для чтения, данные обновляются автоматически`
    : 'Ни один маркетплейс ещё не подключён'
  if (!settingsAccounts.length) {
    content.innerHTML = settingsEmptyMarkup(null)
    return
  }
  if (!visible.length) {
    content.innerHTML = settingsEmptyMarkup(SETTINGS_MARKETS[market].label)
    return
  }
  const ordered = [...visible].sort((a, b) => a.createdAt - b.createdAt)
  content.innerHTML = `<div class="settings-grid">${ordered.map(settingsCardMarkup).join('')}</div>`
}

// ── Слои раздела ───────────────────────────────────────────────────────────

function openSettingsSync(id) {
  const anchor = document.querySelector(`#settingsView [data-settings-sync="${id}"]`)
  const menu = anchor?.nextElementSibling
  if (!anchor || !menu) return
  closeSettingsSync()
  settingsState.syncId = id
  menu.classList.add('is-open')
  anchor.setAttribute('aria-expanded', 'true')
}

function closeSettingsSync() {
  if (!settingsState.syncId) return
  document.querySelectorAll('.settings-sync-menu.is-open').forEach(menu => menu.classList.remove('is-open'))
  document.querySelectorAll('[data-settings-sync][aria-expanded="true"]').forEach(node => node.setAttribute('aria-expanded', 'false'))
  settingsState.syncId = null
}

function closeSettingsLayers() {
  closeSettingsSync()
}

// ── Синхронизация ──────────────────────────────────────────────────────────

function runSettingsSync(id, mode) {
  const account = settingsFind(id)
  if (!account || settingsState.runningId) return
  if (account.health === 'blocked') {
    showToast('Нет доступа к кабинету', `${account.name} · ключ недействителен — обновите его в «Редактировать»`)
    return
  }
  settingsState.runningId = id
  renderSettings()
  showToast(mode === 'full' ? 'Полная синхронизация запущена' : 'Синхронизация запущена', `${account.name} · ${mode === 'full' ? 'все данные за 90 дней' : 'данные за последние 14 дней'}`)
  if (settingsSyncTimer) window.clearTimeout(settingsSyncTimer)
  settingsSyncTimer = window.setTimeout(() => {
    settingsSyncTimer = null
    settingsState.runningId = null
    // Исход задаётся состоянием ключа, а не случайностью: на замедлённом кабинете быстрая
    // загрузка падает, а полная пересинхронизация проходит и снимает и partial, и throttled.
    if (account.health === 'throttled' && mode === 'quick') {
      account.status = 'failed'
      settingsSave()
      renderSettings()
      showToast('Синхронизация заблокирована', `WB ограничил частоту запросов · повтор после ${settingsStamp(account.retryAt)}`)
      return
    }
    account.status = mode === 'full' ? 'completed' : account.status === 'partial' ? 'partial' : 'completed'
    if (account.status === 'completed') { account.health = 'ok'; account.retryAt = null }
    account.syncedAt = SETTINGS_STAMP
    settingsSave()
    renderSettings()
    showToast(account.status === 'completed' ? 'Данные обновлены' : 'Синхронизация прошла частично', `${account.name} · ${account.status === 'completed' ? 'все разделы сверены' : 'часть дней доступна только по полной загрузке'}`)
  }, 1400)
}

// ── Рамка подключения / правки ─────────────────────────────────────────────

function settingsDraftValid() {
  const draft = settingsState.draft
  if (!draft || !draft.name.trim()) return false
  // Правка ключа необязательна: пустые поля означают «оставить как было».
  if (settingsState.editId) return true
  return SETTINGS_FIELDS[draft.marketplace].every(field => String(draft.creds[field.key] || '').trim())
}

// Черновик рамки хранит только то, что введено: пустые поля ключа означают «оставить как
// было», поэтому для проверки прав считаем эффективный набор — ввод поверх сохранённого.
function settingsEffectiveCreds() {
  const draft = settingsState.draft
  const stored = settingsState.editId ? settingsFind(settingsState.editId)?.creds : null
  return Object.fromEntries(SETTINGS_FIELDS[draft.marketplace].map(field => [field.key, String(draft.creds[field.key] || stored?.[field.key] || '').trim()]))
}

// Проверка ключа демонстрационная (§7): длина ключа решает, проходит ли самое узкое право,
// поэтому оба исхода — и «все подтверждены», и «часть отсутствует» — достижимы с клавиатуры.
function settingsCheckPerms(creds) {
  const longest = Math.max(0, ...Object.values(creds).map(value => value.length))
  return SETTINGS_SECTIONS.map((label, index) => ({ label, ok: index === SETTINGS_SECTIONS.length - 1 ? longest >= 16 : longest >= 8 }))
}

// denied === null значит «ключ ещё не проверяли»: прав на карточке не показываем, как в
// оригинале, где permissionsState = null до первой синхронизации или проверки ключа.
function settingsPerms(account) {
  if (!Array.isArray(account.denied)) return null
  return SETTINGS_SECTIONS.map(label => ({ label, ok: !account.denied.includes(label) }))
}

// Один компонент на карточку и модалку (§11): подпись и строки ✓/✗. Обёртку каждая сторона
// приносит свою — в карточке она без верхнего отступа и списком в две колонки.
function settingsPermsMarkup(entries, title) {
  const rows = entries.map(entry => `<span class="settings-perm ${entry.ok ? 'is-ok' : 'is-bad'}">${dashboardIcon(entry.ok ? 'i-check' : 'i-close')}<span>${entry.label}</span></span>`).join('')
  return `<b>${title}</b><div class="settings-perm-list">${rows}</div>`
}

// Итог проверки ключа пишется в denied: в оригинале permissionsState обновляют и «Проверить
// ключ», и синхронизация (marketplace-account.service.ts:704, sync-helpers.ts:345).
function settingsDenied(creds) {
  return settingsCheckPerms(creds).filter(entry => !entry.ok).map(entry => entry.label)
}

// Esc закрывает рамку, не спрашивая разрешения, поэтому отменённая задача не должна
// коммититься: таймеры проверки ключа и сохранения сверяются с тем, что рамка ещё открыта.
function settingsModalOpen() {
  return document.getElementById('settingsModal').classList.contains('is-open')
}

function renderSettingsModal() {
  const draft = settingsState.draft
  if (!draft) return
  const account = settingsState.editId ? settingsFind(settingsState.editId) : null
  const box = document.getElementById('settingsForm')
  const options = Object.entries(SETTINGS_MARKETS)
    .map(([value, market]) => `<button type="button" role="option" data-value="${value}" aria-selected="${draft.marketplace === value}">${market.label}${dashboardIcon('i-check')}</button>`)
    .join('')
  box.innerHTML = `
    <label><span>Маркетплейс</span><div class="field-select"><button type="button" class="field-select-trigger" aria-haspopup="listbox" aria-expanded="false"><span>${SETTINGS_MARKETS[draft.marketplace].label}</span>${dashboardIcon('i-chevron-down')}</button><div class="field-select-popover" role="listbox">${options}</div></div></label>
    <label><span>Название кабинета</span><input type="text" data-settings-field="name" placeholder="Мой магазин WB" value="${escapeDashboardText(draft.name)}"></label>
    ${draft.marketplace === 'wildberries' ? `<label><span>Номер кабинета</span><input type="text" data-settings-field="studioNo" inputmode="numeric" placeholder="Например, 103287" value="${escapeDashboardText(draft.studioNo || '')}"></label>` : ''}
    ${SETTINGS_FIELDS[draft.marketplace].map(field => {
      const stored = account?.creds?.[field.key]
      const placeholder = stored ? 'Оставьте пустым, чтобы не менять' : field.placeholder
      return `<label><span>${field.label}</span><input type="${field.secret ? 'password' : 'text'}" data-settings-field="${field.key}" autocomplete="off" placeholder="${escapeDashboardText(placeholder)}" value="${escapeDashboardText(draft.creds[field.key] || '')}"></label>`
    }).join('')}
  `
  bindFieldSelects(box)
  const perms = document.getElementById('settingsPerms')
  perms.classList.toggle('is-hidden', !settingsState.perms)
  perms.innerHTML = settingsState.perms ? settingsPermsMarkup(settingsState.perms, 'Разрешения API-ключа') : ''
  const test = document.getElementById('settingsTestButton')
  test.classList.toggle('is-hidden', !account)
  test.disabled = settingsState.testing
  test.textContent = settingsState.testing ? 'Проверка…' : 'Проверить ключ'
  const save = document.getElementById('settingsSaveButton')
  save.textContent = settingsState.saving ? 'Сохранение…' : account ? 'Сохранить' : 'Подключить'
  save.disabled = settingsState.saving || !settingsDraftValid()
}

function openSettingsModal(id) {
  const account = id ? settingsFind(id) : null
  if (id && !account) return
  settingsState.editId = account?.id || null
  settingsState.perms = null
  settingsState.testing = false
  settingsState.saving = false
  settingsState.draft = {
    // Площадка из тулбарного фильтра предзаполняет модалку: иначе «Добавить Ozon», который
    // сам же раздел и предлагает, создал бы кабинет невидимый в текущем виде списка.
    marketplace: account?.marketplace || (settingsState.market === 'all' ? 'wildberries' : settingsState.market),
    name: account?.name || '',
    studioNo: account?.studioNo || '',
    // Старые ключи в поля не кладём: мокап показывает их только маской (§7).
    creds: {},
  }
  document.getElementById('settingsModalTitle').textContent = account ? 'Редактировать аккаунт' : 'Подключить маркетплейс'
  document.getElementById('settingsModalNote').textContent = account
    ? 'Измените настройки подключения к маркетплейсу'
    : 'Добавьте API ключ маркетплейса для начала синхронизации данных'
  renderSettingsModal()
  openModal('settingsModal', '#settingsForm input')
}

function closeSettingsModal() {
  if (settingsTestTimer) { window.clearTimeout(settingsTestTimer); settingsTestTimer = null }
  if (settingsSaveTimer) { window.clearTimeout(settingsSaveTimer); settingsSaveTimer = null }
  settingsState.editId = null
  settingsState.draft = null
  settingsState.perms = null
  settingsState.testing = false
  settingsState.saving = false
  closeModal('settingsModal')
}

function testSettingsKey() {
  const draft = settingsState.draft
  if (!draft || !settingsState.editId || settingsState.testing) return
  settingsState.testing = true
  renderSettingsModal()
  settingsTestTimer = window.setTimeout(() => {
    settingsTestTimer = null
    settingsState.testing = false
    if (!settingsModalOpen()) return
    settingsState.perms = settingsCheckPerms(settingsEffectiveCreds())
    const account = settingsFind(settingsState.editId)
    if (account) {
      account.denied = settingsDenied(settingsEffectiveCreds())
      settingsSave()
      renderSettings()
    }
    renderSettingsModal()
    const missing = settingsState.perms.filter(entry => !entry.ok)
    showToast(missing.length ? 'Часть разрешений отсутствует' : 'Все разрешения подтверждены', missing.length
      ? (missing.length === SETTINGS_SECTIONS.length ? 'Ключ не проходит ни одну проверку' : `${missing.map(entry => entry.label).join(', ')} — нужен расширенный ключ`)
      : 'Ключ даёт доступ ко всем разделам данных')
  }, 700)
}

function saveSettingsAccount() {
  const draft = settingsState.draft
  if (!draft || !settingsDraftValid() || settingsState.saving) return
  settingsState.saving = true
  renderSettingsModal()
  settingsSaveTimer = window.setTimeout(() => {
    settingsSaveTimer = null
    settingsState.saving = false
    if (!settingsModalOpen()) return
    const editing = settingsState.editId ? settingsFind(settingsState.editId) : null
    const name = draft.name.trim()
    const studioNo = draft.marketplace === 'wildberries' ? draft.studioNo.trim() : null
    if (editing) {
      const changedMarket = editing.marketplace !== draft.marketplace
      editing.name = name
      editing.studioNo = studioNo
      if (changedMarket) {
        editing.marketplace = draft.marketplace
        editing.creds = { ...draft.creds }
        editing.status = 'pending'
        editing.health = 'ok'
        editing.denied = null
      } else {
        // Пустое поле — «не менять»:.mask на карточке остаётся от прежнего ключа.
        let replaced = false
        SETTINGS_FIELDS[draft.marketplace].forEach(field => {
          const value = String(draft.creds[field.key] || '').trim()
          if (!value) return
          if (value !== editing.creds[field.key]) replaced = true
          editing.creds[field.key] = value
        })
        // Новый ключ — старые права больше не про него: снимаем блок до следующей
        // проверки или синхронизации, чтобы карточка не врала про другой ключ.
        if (replaced) editing.denied = null
      }
      // Кабинет уехал на другую площадку: в отфильтрованном виде он пропал бы без объяснений.
      if (changedMarket) settingsState.market = 'all'
      settingsSave()
      closeSettingsModal()
      renderSettings()
      showToast('Аккаунт обновлён', `${SETTINGS_MARKETS[editing.marketplace].label} · ${editing.name}`)
      return
    }
    const account = {
      id: `settings-${Date.now().toString(36)}`,
      marketplace: draft.marketplace,
      name,
      studioNo,
      creds: Object.fromEntries(SETTINGS_FIELDS[draft.marketplace].map(field => [field.key, String(draft.creds[field.key]).trim()])),
      status: 'pending',
      health: 'ok',
      retryAt: null,
      // Права пустые, а не «все на месте»: в оригинале permissionsState = null до первой
      // синхронизации или проверки ключа, и карточка прав не показывает.
      denied: null,
      syncedAt: null,
      createdAt: Date.now(),
    }
    // Тот же смысл, что у сброса при правке: сохранённый кабинет должен остаться в поле зрения.
    if (settingsState.market !== 'all' && settingsState.market !== draft.marketplace) settingsState.market = 'all'
    settingsAccounts.push(account)
    settingsSave()
    closeSettingsModal()
    renderSettings()
    showToast('Маркетплейс подключён', `${SETTINGS_MARKETS[account.marketplace].label} · ${account.name}`)
    runSettingsSync(account.id, 'quick')
  }, 600)
}

// ── Подтверждение удаления ─────────────────────────────────────────────────

function openSettingsDelete(id) {
  const account = settingsFind(id)
  if (!account) return
  settingsState.deleteId = account.id
  document.getElementById('settingsDeleteNote').textContent = `Аккаунт «${account.name}» (${SETTINGS_MARKETS[account.marketplace].label}) будет удалён без возможности восстановления.`
  openModal('settingsDeleteModal', '#settingsDeleteClose')
}

function closeSettingsDelete() {
  settingsState.deleteId = null
  closeModal('settingsDeleteModal')
}

function confirmSettingsDelete() {
  const account = settingsFind(settingsState.deleteId)
  closeSettingsDelete()
  if (!account) return
  if (settingsState.runningId === account.id && settingsSyncTimer) {
    window.clearTimeout(settingsSyncTimer)
    settingsSyncTimer = null
    settingsState.runningId = null
  }
  settingsAccounts.splice(settingsAccounts.indexOf(account), 1)
  settingsSave()
  renderSettings()
  showToast('Аккаунт удалён', `${SETTINGS_MARKETS[account.marketplace].label} · ${account.name}`)
}

// ── Слушатели раздела ──────────────────────────────────────────────────────

const settingsView = document.getElementById('settingsView')
const settingsModal = document.getElementById('settingsModal')

settingsView.addEventListener('click', event => {
  // «Показать все маркетплейсы» из пустого состояния по фильтру.
  const reset = event.target.closest('[data-settings-market]')
  if (reset) {
    closeSettingsLayers()
    settingsState.market = reset.dataset.settingsMarket
    renderSettings()
    return
  }
  if (event.target.closest('[data-settings-add]')) {
    openSettingsModal(null)
    return
  }
  const run = event.target.closest('[data-settings-sync-run]')
  if (run) {
    const id = settingsState.syncId
    closeSettingsSync()
    runSettingsSync(id, run.dataset.settingsSyncRun)
    return
  }
  const sync = event.target.closest('[data-settings-sync]')
  if (sync) {
    // Повторный клик по тому же триггеру сворачивает меню, как ⋯ в «Студии».
    if (settingsState.syncId === sync.dataset.settingsSync) closeSettingsSync()
    else openSettingsSync(sync.dataset.settingsSync)
    return
  }
  const edit = event.target.closest('[data-settings-edit]')
  if (edit) {
    closeSettingsLayers()
    openSettingsModal(edit.dataset.settingsEdit)
    return
  }
  const remove = event.target.closest('[data-settings-delete]')
  if (remove) {
    closeSettingsLayers()
    openSettingsDelete(remove.dataset.settingsDelete)
  }
})

settingsModal.addEventListener('input', event => {
  const field = event.target.closest('[data-settings-field]')
  if (!field || !settingsState.draft) return
  const key = field.dataset.settingsField
  if (key === 'name') settingsState.draft.name = field.value
  else if (key === 'studioNo') settingsState.draft.studioNo = field.value
  else settingsState.draft.creds[key] = field.value
  document.getElementById('settingsSaveButton').disabled = settingsState.saving || !settingsDraftValid()
})

// Смена маркетплейса меняет набор полей ключа, поэтому рамка пересобирается целиком.
// Черновик живёт в settingsState.draft, а не в DOM, — введённое не теряется.
settingsModal.addEventListener('fieldselect', event => {
  if (!event.target.classList.contains('field-select') || !settingsState.draft) return
  settingsState.draft.marketplace = event.detail.value
  settingsState.perms = null
  renderSettingsModal()
})

settingsModal.addEventListener('click', event => {
  if (event.target.closest('#settingsTestButton')) testSettingsKey()
  else if (event.target.closest('#settingsSaveButton')) saveSettingsAccount()
  else if (event.target.closest('#settingsModalClose') || event.target.id === 'settingsModal') closeSettingsModal()
})

document.getElementById('settingsDeleteModal').addEventListener('click', event => {
  if (event.target.closest('#settingsDeleteConfirm')) confirmSettingsDelete()
  else if (event.target.closest('#settingsDeleteClose,#settingsDeleteCancel') || event.target.id === 'settingsDeleteModal') closeSettingsDelete()
})

document.getElementById('settingsCreateButton').addEventListener('click', () => {
  if (settingsAccounts.length >= SETTINGS_LIMIT) {
    showToast('Лимит аккаунтов', `Достигнут лимит ${SETTINGS_LIMIT} маркетплейс-аккаунтов — удалите один из существующих.`)
    return
  }
  openSettingsModal(null)
})
document.getElementById('settingsButton').addEventListener('click', () => switchView('settings'))
document.getElementById('accountButton').addEventListener('click', () => switchView('account'))

/* ── 12.7. Аккаунт ──────────────────────────────────────────────────────────
   Зеркало frontend/src/pages/account: AccountPage.tsx даёт пять вкладок, остальные файлы —
   содержимое. Настоящих платежей и паролей в мокапе нет (§8.2): пароль живёт в памяти вкладки
   и не попадает ни в localStorage, ни в DOM других разделов. Порядок вкладок — по §8.1,
   в оригинале «Безопасность» идёт второй. */
const ACCOUNT_STORE = 'grafio.account.v1'
const ACCOUNT_APPEARANCE_STORE = 'grafio.accountAppearance.v1'
const ACCOUNT_PLAN_LABELS = { monthly: 'Месячный', yearly: 'Годовой' }
const ACCOUNT_STATUS = {
  trial: { label: 'Триал', chip: 'warning', light: 'warning' },
  active: { label: 'Активна', chip: 'good', light: 'good' },
  past_due: { label: 'Просрочена', chip: 'danger', light: 'bad' },
  cancelled: { label: 'Отменена', chip: 'danger', light: 'bad' },
}
const ACCOUNT_FEATURES = [
  'Подключение WB и Ozon',
  'Все KPI и графики',
  'P&L отчёты',
  'Управление себестоимостью',
  'Рекламная аналитика',
  'Неограниченное количество товаров',
]
const ACCOUNT_PLANS = [
  { id: 'monthly', name: 'Месячный', price: '2 990', period: '/мес', description: 'Гибкий вариант без долгосрочных обязательств' },
  { id: 'yearly', name: 'Годовой', price: '1 990', period: '/мес', description: 'Экономия 33% при оплате за год', savings: 'Выгода 12 000 ₽/год' },
]
const ACCOUNT_RULES = [
  { label: 'Минимум 8 символов', test: value => value.length >= 8 },
  { label: 'Строчная буква', test: value => /[a-z]/.test(value) },
  { label: 'Заглавная буква', test: value => /[A-Z]/.test(value) },
  { label: 'Цифра', test: value => /\d/.test(value) },
  { label: 'Спецсимвол', test: value => /[^a-zA-Z0-9]/.test(value) },
]
// Палитры и описания — из AppearanceTab.tsx. Все четыре темы тёмные, поэтому переключение
// безопасно для утверждённого вида: «Нейтральный» не переопределён в CSS и остаётся базой
// (§8.2). Выбор здесь не «намерение», а действие: applyAccountAppearance() перекрашивает
// мокап теми же токенами, что и нативный ThemeProvider.
const ACCOUNT_THEMES = [
  { id: 'baseline', title: 'Чёрный', description: 'Чистый чёрный. Максимум контраста.', canvas: '#000000', widget: '#1a1a1a', border: 'rgba(255,255,255,.04)' },
  { id: 'lifted', title: 'Нейтральный', description: 'Приподнятый нейтральный. По умолчанию.', canvas: '#0a0a0a', widget: '#1a1a1a', border: 'rgba(255,255,255,.06)' },
  { id: 'warm', title: 'Тёплый', description: 'Тёплый уголь. Editorial-настроение.', canvas: '#0d0c0a', widget: '#1c1a17', border: 'rgba(245,230,205,.07)' },
  { id: 'airy', title: 'Воздушный', description: 'Воздушный премиум.', canvas: '#111111', widget: '#1f1f1f', border: 'rgba(255,255,255,.08)' },
]
const ACCOUNT_MOODS = [
  { id: 'blank', title: 'Без сетки', description: 'Чистая рабочая область, без фонового паттерна.' },
  { id: 'minimal', title: 'Точки', description: 'Простая dot-сетка. Работает всегда.' },
  { id: 'crosses', title: 'Крестики', description: 'Тонкие плюсики — словно инженерный чертёж.' },
  { id: 'lines', title: 'Линии', description: 'Горизонтальные направляющие — как тетрадь в линию.' },
  { id: 'graph', title: 'Миллиметровка', description: 'Крупная сетка с мелкими точками внутри.' },
  { id: 'rings', title: 'Кольца', description: 'Концентрические окружности в каждой ячейке.' },
  { id: 'breathe', title: 'Дыхание', description: 'Точки мягко пульсируют. Выкл. при reduced-motion.' },
]
const ACCOUNT_SNAP_POINTS = [25, 50, 75, 100]
const ACCOUNT_SNAP_RADIUS = 3
const ACCOUNT_DAY = 86400000
const accountDateLabel = value => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
const accountSnap = value => ACCOUNT_SNAP_POINTS.find(point => Math.abs(value - point) <= ACCOUNT_SNAP_RADIUS) ?? value
// Профиль не подтверждён намеренно: в оригинале «Отправить повторно» появляется только в этом
// состоянии, иначе кнопка осталась бы мёртвой хромой ветвью.
// orgNames — словарь «метка юрлица → переименованное название». Пустой по умолчанию:
// имена читаются из menuData.company, и пока пользователь ничего не менял, источник один.
const ACCOUNT_SEED = {
  name: 'Анна Верена',
  email: 'analyst@grafio.ru',
  verified: false,
  createdAt: new Date(2026, 0, 12, 11, 24).getTime(),
  lastLoginAt: new Date(2026, 3, 30, 8, 12).getTime(),
  orgNames: {},
  plan: 'monthly',
  status: 'trial',
  trialEndsAt: STUDIO_NOW.getTime() + 9 * ACCOUNT_DAY,
}
const accountFreshPasswords = () => ({ current: '', next: '', confirm: '', showCurrent: false, showNext: false })

function accountAppearance() {
  const raw = readStoreObject(ACCOUNT_APPEARANCE_STORE, { theme: 'lifted', brightness: 33, mood: 'minimal' })
  return {
    theme: ACCOUNT_THEMES.some(entry => entry.id === raw.theme) ? raw.theme : 'lifted',
    mood: ACCOUNT_MOODS.some(entry => entry.id === raw.mood) ? raw.mood : 'minimal',
    brightness: Number.isFinite(raw.brightness) ? accountSnap(Math.min(100, Math.max(0, raw.brightness))) : 33,
  }
}

const accountState = {
  tab: 'profile',
  profile: readStoreObject(ACCOUNT_STORE, ACCOUNT_SEED),
  appearance: accountAppearance(),
  passwords: accountFreshPasswords(),
  saving: null,
}
let accountSaveTimer = null

// §8.2: выбор в «Оформлении» обязан менять интерфейс, а не только сохраняться. Тема и сетка
// ложатся на data-атрибуты <html> — ровно как ThemeProvider и CanvasMoodProvider в оригинале,
// где вся перекраска идёт селекторами по этим атрибутам.
function applyAccountAppearance() {
  const root = document.documentElement
  const { theme, mood, brightness } = accountState.appearance
  root.dataset.theme = theme
  root.dataset.canvasMood = mood
  // Яркость в оригинале = brightness × 0,15 % примеса белого к базовой палитре. Мокап
  // утверждён при 33 %, поэтому смещение считается от 33: выше — в white, ниже — в black.
  // На 33 amount равен 0 %, color-mix отдаёт базовый цвет, и вид §12.1–§12.6 не двигается.
  const delta = (brightness - 33) * 0.15
  root.style.setProperty('--brightness-amount', `${Math.abs(delta).toFixed(2)}%`)
  root.style.setProperty('--brightness-target', delta >= 0 ? 'white' : 'black')
}
applyAccountAppearance()

const accountPassKey = { current: 'current', next: 'next', confirm: 'confirm' }

// Юрлица мокапа живут в menuData.company: он кормит и переключатель в тулбаре, и подпись
// контекста РНП. Раздел «Организация» не заводит второй список — он переименоывает пункты
// того же меню, а выбранное имя переживает перезагрузку через профиль. Пункт «Все
// юридические лица» — область видимости, а не лицо, поэтому он отфильтрован.
const ACCOUNT_SCOPE_MARK = 'ВСЕ'
const accountOrgEntries = () => menuData.company.filter(entry => entry.mark !== ACCOUNT_SCOPE_MARK)
const accountOrgEntry = mark => accountOrgEntries().find(entry => entry.mark === mark)
const accountIsOrgKind = kind => kind.startsWith('org:')

// Значение, с которым сравнивается «грязное» поле: для профиля — строка в профиле, для
// юрлица — текущий заголовок пункта меню.
const accountOriginalValue = kind => accountIsOrgKind(kind)
  ? accountOrgEntry(kind.slice(4))?.title || ''
  : accountState.profile[kind] || ''

// Переименованное лицо должно читаться везде, где мокап показывает организацию: и в поповере
// тулбара (он рендерится из menuData), и в подписи триггера, если выбрано именно это лицо.
function accountSyncOrgNames() {
  accountOrgEntries().forEach(entry => {
    const saved = accountState.profile.orgNames[entry.mark]
    if (saved) entry.title = saved
  })
  const selected = accountOrgEntries().find(entry => entry.selected)
  const label = document.querySelector('[data-menu="company"] span')
  if (selected && label) label.textContent = selected.title
}

function accountInitials(profile) {
  return profile.name.trim()
    ? profile.name.trim().split(/\s+/).map(word => word[0]).join('').toUpperCase().slice(0, 2)
    : profile.email[0].toUpperCase()
}

function accountTrialDays(profile) {
  if (!profile.trialEndsAt) return null
  return Math.max(0, Math.ceil((profile.trialEndsAt - STUDIO_NOW.getTime()) / ACCOUNT_DAY))
}

const accountPasswordMatch = () => {
  const pass = accountState.passwords
  return pass.next === pass.confirm && pass.confirm.length > 0
}
const accountPasswordValid = () => accountState.passwords.current.length > 0
  && ACCOUNT_RULES.every(rule => rule.test(accountState.passwords.next)) && accountPasswordMatch()

function accountFieldMarkup({ id, label, key, value, placeholder, maxLength = 200, save, flag = '' }) {
  return `<div class="account-field">
    <div class="account-field-label"><label class="field-label" for="${id}">${label}</label>${flag}</div>
    <div class="account-field-row">
      <input id="${id}" type="text" data-account-field="${key}" placeholder="${placeholder}" maxlength="${maxLength}" value="${escapeDashboardText(value)}">
      ${save ? `<button class="primary-button" type="button" data-account-save="${save}" disabled>${dashboardIcon('i-save')}<span>Сохранить</span></button>` : ''}
    </div>
  </div>`
}

function accountProfilePanel() {
  const profile = accountState.profile
  const chip = `<span class="status-chip ${profile.verified ? 'good' : 'warning'}"><span class="status-light ${profile.verified ? 'good' : 'warning'}"></span>${profile.verified ? 'Подтверждён' : 'Не подтверждён'}</span>`
  return `<article class="card account-card">
    <div class="account-avatar-row">
      <span class="account-avatar">${escapeDashboardText(accountInitials(profile))}${dashboardIcon('i-camera')}</span>
      <div class="account-avatar-copy"><strong>Фото профиля</strong><small>Загрузка будет доступна позже</small></div>
    </div>
    ${accountFieldMarkup({ id: 'accountName', label: 'Имя', key: 'name', value: profile.name, placeholder: 'Ваше имя', save: 'name' })}
    <div class="account-field">
      <span class="field-label">Email</span>
      <div class="account-field-row">
        <input type="text" value="${escapeDashboardText(profile.email)}" readonly tabindex="-1">
        ${chip}
        ${profile.verified ? '' : '<button class="secondary-button" type="button" data-account-resend>Отправить повторно</button>'}
      </div>
    </div>
    <div class="account-meta">
      <span>${dashboardIcon('i-calendar')}Регистрация: ${accountDateLabel(profile.createdAt)}</span>
      <span>${dashboardIcon('i-clock')}Последний вход: ${profile.lastLoginAt ? accountDateLabel(profile.lastLoginAt) : '—'}</span>
    </div>
  </article>`
}

function accountOrganizationPanel() {
  const count = settingsAccounts.length
  const entities = accountOrgEntries().map(entry => accountFieldMarkup({
    id: `accountOrg${entry.mark}`,
    label: `Юридическое лицо · ${entry.mark}`,
    key: `org:${entry.mark}`,
    value: entry.title,
    placeholder: 'Название организации',
    save: `org:${entry.mark}`,
    flag: entry.selected ? '<span class="status-chip good"><span class="status-light good"></span>В контексте</span>' : '',
  })).join('')
  return `<article class="card account-card">
    <header class="card-header"><div><h2>Данные организации</h2><p>Названия видят все пользователи рабочего пространства</p></div><span class="account-card-icon">${dashboardIcon('i-building')}</span></header>
    ${entities}
  </article>
  <article class="card account-card">
    <div class="account-inline-row">
      <div class="account-inline-copy"><strong>Маркетплейсы</strong><small>${count ? `Подключено: ${count}` : 'Нет подключённых аккаунтов'}</small></div>
      <button class="secondary-button" type="button" data-account-settings>Управление</button>
    </div>
  </article>`
}

const accountPassToggle = key => {
  const shown = accountState.passwords[`show${key[0].toUpperCase()}${key.slice(1)}`]
  return `<button class="account-pass-toggle" type="button" data-account-show="${key}" aria-pressed="${shown}" aria-label="${shown ? 'Скрыть пароль' : 'Показать пароль'}">${dashboardIcon(shown ? 'i-eye-off' : 'i-eye')}</button>`
}

// §6.1: вкладка «Безопасность» больше не одна карточка с паролем. Порядок — от того, что
// закрывает вход (2FA, пароль), к тому, что показывает следствия (сессии, входы), и
// заканчивая ключами интеграций. Смена пароля осталась ровно той же, какой её приняли в §12.7.
function accountSecurityPanel() {
  // Черновик рамки живёт ровно пока рамка открыта. Esc и клик вне закрывают её мимо наших
  // close-функций, поэтому сброс сделан здесь: иначе набранный код и отложенное
  // подтверждение («что сделать») переживают закрытие окна (§9).
  if (!document.querySelector('#account2faModal.is-open,#accountKeyModal.is-open,#accountConfirmModal.is-open')) {
    accountPendingAction = null
    accountPendingKey = null
    accountSecurity.step = 'scan'
    accountSecurity.code = ''
  }
  return `${accountTwoFactorCard()}${accountPasswordCard()}${accountSessionsCard()}${accountHistoryCard()}${accountKeysCard()}`
}

function accountPasswordCard() {
  const pass = accountState.passwords
  return `<article class="card account-card account-security account-password-card">
    <header class="card-header">
      <div><h2>Смена пароля</h2><p>Пароль никуда не отправляется: мокап проверяет только правила ниже</p></div>
      <span class="account-card-icon">${dashboardIcon('i-lock')}</span>
    </header>
    <div class="account-field">
      <label class="field-label" for="accountPassCurrent">Текущий пароль</label>
      <div class="account-pass">
        <input id="accountPassCurrent" type="${pass.showCurrent ? 'text' : 'password'}" data-account-pass="current" placeholder="Введите текущий пароль" autocomplete="current-password" value="${escapeDashboardText(pass.current)}">
        ${accountPassToggle('Current')}
      </div>
    </div>
    <div class="account-field">
      <label class="field-label" for="accountPassNext">Новый пароль</label>
      <div class="account-pass">
        <input id="accountPassNext" type="${pass.showNext ? 'text' : 'password'}" data-account-pass="next" placeholder="Введите новый пароль" autocomplete="new-password" value="${escapeDashboardText(pass.next)}">
        ${accountPassToggle('Next')}
      </div>
      <div class="account-rules${pass.next ? ' is-visible' : ''}" id="accountPassRules">${ACCOUNT_RULES.map(rule => `<span class="account-rule${rule.test(pass.next) ? ' is-pass' : ''}"><i></i>${rule.label}</span>`).join('')}</div>
    </div>
    <div class="account-field">
      <label class="field-label" for="accountPassConfirm">Подтвердите пароль</label>
      <input id="accountPassConfirm" type="password" data-account-pass="confirm" placeholder="Повторите новый пароль" autocomplete="new-password" value="${escapeDashboardText(pass.confirm)}">
      <p class="account-error${pass.confirm && !accountPasswordMatch() ? ' is-visible' : ''}" id="accountPassError">Пароли не совпадают</p>
    </div>
    <button class="primary-button" type="button" data-account-apply disabled>${dashboardIcon('i-save')}<span>Сменить пароль</span></button>
  </article>`
}

function accountPlanMarkup(plan) {
  const badge = plan.savings ? `<span class="account-offer-badge">${dashboardIcon('i-sparkles')}${plan.savings}</span>` : ''
  return `<article class="card account-card account-offer">
    <div class="account-offer-head"><div class="account-offer-title"><strong>${plan.name}</strong>${badge}</div><small>${plan.description}</small></div>
    <div class="account-offer-price"><b>${plan.price} ₽</b><span>${plan.period}</span></div>
    <ul class="account-offer-features">${ACCOUNT_FEATURES.map(feature => `<li>${dashboardIcon('i-check')}${feature}</li>`).join('')}</ul>
    <button class="secondary-button" type="button" disabled>Оформить подписку</button>
    <p class="account-offer-note">Оплата скоро будет доступна</p>
  </article>`
}

// §8.2: в «Подписке» показываются текущий тариф и кабинеты. Кабинеты читаются из того же
// хранилища, что и «Настройки», — второй список кабинетов был бы вторым источником правды.
function accountSubscriptionPanel() {
  const profile = accountState.profile
  const status = ACCOUNT_STATUS[profile.status] || ACCOUNT_STATUS.trial
  const days = accountTrialDays(profile)
  const cabinets = settingsAccounts.length
    ? settingsAccounts.map(account => `<div class="account-cabinet"><span class="mp-mark">${SETTINGS_MARKETS[account.marketplace].mark}</span><strong>${escapeDashboardText(account.name)}</strong><span class="status-light ${SETTINGS_HEALTH[account.health].light}" title="${SETTINGS_HEALTH[account.health].label}"></span></div>`).join('')
    : '<p class="account-offer-note">Ни один маркетплейс ещё не подключён</p>'
  return `<article class="card account-card account-plan">
    <span class="account-plan-tile">${dashboardIcon('i-crown')}</span>
    <div class="account-plan-copy">
      <div class="account-plan-top"><strong>${profile.plan ? `План: ${ACCOUNT_PLAN_LABELS[profile.plan]}` : 'Текущий план'}</strong><span class="status-chip ${status.chip}"><span class="status-light ${status.light}"></span>${status.label}</span></div>
      ${profile.status === 'trial' && days !== null ? `<small class="account-plan-note">${dashboardIcon('i-clock')}${days > 0 ? `Осталось ${days} ${pluralizeDashboard(days, ['день', 'дня', 'дней'])} триала` : 'Триал завершён'}</small>` : ''}
    </div>
  </article>
  <div class="account-offers">${ACCOUNT_PLANS.map(accountPlanMarkup).join('')}</div>
  <article class="card account-card">
    <header class="card-header"><div><h2>Кабинеты</h2><p>${settingsAccounts.length} подключено · оплата не требуется</p></div><button class="secondary-button" type="button" data-account-settings>Управление</button></header>
    <div class="account-cabinets">${cabinets}</div>
  </article>`
}

const accountSwatch = entry => `<span class="account-preset-swatch" style="background:${entry.canvas}"><i style="background:${entry.widget};border-color:${entry.border}"></i><i style="background:${entry.widget};border-color:${entry.border}"></i></span>`

function accountAppearancePanel() {
  const appearance = accountState.appearance
  return `<article class="card account-card">
    <header class="card-header"><div><h2>Яркость интерфейса</h2><p>Управляет яркостью канваса, виджетов и панелей. Акценты, текст и статусные цвета не затрагиваются.</p></div></header>
    <div class="account-brightness">
      <input class="account-slider" type="range" min="0" max="100" step="1" value="${appearance.brightness}" data-account-brightness aria-label="Яркость интерфейса" aria-valuenow="${appearance.brightness}" aria-valuemin="0" aria-valuemax="100" aria-valuetext="${appearance.brightness}%">
      <span class="account-brightness-value" id="accountBrightnessValue">${appearance.brightness}%</span>
    </div>
  </article>
  <article class="card account-card">
    <header class="card-header"><div><h2>Тема</h2><p>Палитра канваса, виджетов и границ.</p></div></header>
    <div class="account-presets">${ACCOUNT_THEMES.map(entry => {
      const active = appearance.theme === entry.id
      return `<button class="account-preset${active ? ' is-active' : ''}" type="button" data-account-theme="${entry.id}" aria-pressed="${active}">${active ? `<span class="account-preset-check">${dashboardIcon('i-check')}</span>` : ''}${accountSwatch(entry)}<span class="account-preset-copy"><strong>${entry.title}</strong><small>${entry.description}</small></span></button>`
    }).join('')}</div>
  </article>
  <article class="card account-card">
    <header class="card-header"><div><h2>Сетка холста</h2><p>Стиль фоновой сетки рабочей области.</p></div></header>
    <div class="account-presets account-presets-moods">${ACCOUNT_MOODS.map(entry => {
      const active = appearance.mood === entry.id
      return `<button class="account-preset${active ? ' is-active' : ''}" type="button" data-account-mood="${entry.id}" aria-pressed="${active}">${active ? `<span class="account-preset-check">${dashboardIcon('i-check')}</span>` : ''}<span class="account-preset-swatch account-mood-swatch is-${entry.id}"></span><span class="account-preset-copy"><strong>${entry.title}</strong><small>${entry.description}</small></span></button>`
    }).join('')}</div>
  </article>`
}

const ACCOUNT_PANELS = {
  profile: accountProfilePanel,
  organization: accountOrganizationPanel,
  security: accountSecurityPanel,
  subscription: accountSubscriptionPanel,
  appearance: accountAppearancePanel,
}

function renderAccount() {
  const box = document.getElementById('accountContent')
  if (!box) return
  const tabs = [...document.querySelectorAll('#accountTabs [data-account-tab]')]
  tabs.forEach(tab => {
    const active = tab.dataset.accountTab === accountState.tab
    tab.classList.toggle('is-active', active)
    tab.setAttribute('aria-selected', String(active))
  })
  document.getElementById('accountSubtitle').textContent = 'Демонстрационные значения: сохранения видны только в этом браузере, платежи и пароли не отправляются'
  box.innerHTML = (ACCOUNT_PANELS[accountState.tab] || accountProfilePanel)()
  box.setAttribute('aria-labelledby', `accountTab-${accountState.tab}`)
  // Ширина колонки — по max-w оригинала: ProfileTab/OrganizationTab/SecurityTab идут в
  // max-w-sm, SubscriptionTab в max-w-2xl, AppearanceTab не ограничен. Без этого карточка
  // профиля растягивалась на 840 и оставляла мёртвую полосу справа от поля в 288 px.
  box.dataset.accountPanel = accountState.tab
  if (accountState.tab === 'security') accountRefreshPassword()
}

function chooseAccountTab(key) {
  if (!ACCOUNT_PANELS[key] || accountState.tab === key) return
  accountState.tab = key
  // В оригинале панель размонтируется при смене вкладки, поэтому введённые пароли уходят
  // вместе с ней. Здесь тот же эффект без React: состояние чистится до перерисовки.
  accountState.passwords = accountFreshPasswords()
  renderAccount()
}

// Только те элементы, которые меняются от набора текста: перерисовка всей панели сбросила бы
// каретку, как это уже учтено в форме подключения маркетплейса.
function accountRefreshDirty(field) {
  const button = field.closest('.account-field-row')?.querySelector('[data-account-save]')
  if (!button) return
  button.disabled = accountState.saving !== null || !field.value.trim() || field.value === accountOriginalValue(button.dataset.accountSave)
}

function accountRefreshPassword() {
  const pass = accountState.passwords
  const rules = document.getElementById('accountPassRules')
  if (rules) {
    rules.classList.toggle('is-visible', pass.next.length > 0)
    rules.querySelectorAll('.account-rule').forEach((node, index) => node.classList.toggle('is-pass', ACCOUNT_RULES[index].test(pass.next)))
  }
  const error = document.getElementById('accountPassError')
  if (error) error.classList.toggle('is-visible', pass.confirm.length > 0 && !accountPasswordMatch())
  const apply = document.querySelector('[data-account-apply]')
  if (apply && !accountState.saving) apply.disabled = !accountPasswordValid()
}

function accountSaveButtonMarkup(button, pending) {
  const label = button.querySelector('span')
  if (label) label.textContent = pending ? 'Сохранение…' : button.dataset.accountApply ? 'Сменить пароль' : 'Сохранить'
  button.disabled = pending
}

function saveAccountField(kind) {
  if (accountState.saving) return
  const button = document.querySelector(`[data-account-save="${kind}"]`)
  const field = document.querySelector(`[data-account-field="${kind}"]`)
  if (!button || !field) return
  const value = field.value.trim()
  if (!value || value === accountOriginalValue(kind)) return
  accountState.saving = kind
  accountSaveButtonMarkup(button, true)
  accountSaveTimer = window.setTimeout(() => {
    accountSaveTimer = null
    accountState.saving = null
    if (accountIsOrgKind(kind)) {
      const entry = accountOrgEntry(kind.slice(4))
      if (entry) {
        entry.title = value
        accountState.profile.orgNames[entry.mark] = value
      }
      accountSyncOrgNames()
    } else {
      accountState.profile[kind] = value
    }
    writeStore(ACCOUNT_STORE, accountState.profile)
    renderAccount()
    showToast(accountIsOrgKind(kind) ? 'Организация обновлена' : 'Профиль обновлён', accountIsOrgKind(kind)
      ? `${value} · название видят все пользователи рабочего пространства`
      : `${value} · инициалы в аватаре пересчитаны`)
  }, 420)
}

function accountApplyPassword() {
  const button = document.querySelector('[data-account-apply]')
  if (!button || accountState.saving || !accountPasswordValid()) return
  accountState.saving = 'password'
  accountSaveButtonMarkup(button, true)
  accountSaveTimer = window.setTimeout(() => {
    accountSaveTimer = null
    accountState.saving = null
    accountState.passwords = accountFreshPasswords()
    renderAccount()
    showToast('Пароль успешно изменён', 'Поля очищены: в демо пароль не сохраняется и не отправляется')
  }, 420)
}

function accountTogglePass(key) {
  const state = key === 'Current' ? 'showCurrent' : 'showNext'
  const shown = !accountState.passwords[state]
  accountState.passwords[state] = shown
  const field = document.querySelector(`#accountPass${key}`)
  const toggle = document.querySelector(`[data-account-show="${key}"]`)
  if (!field || !toggle) return
  field.type = shown ? 'text' : 'password'
  toggle.setAttribute('aria-pressed', String(shown))
  toggle.setAttribute('aria-label', shown ? 'Скрыть пароль' : 'Показать пароль')
  toggle.innerHTML = dashboardIcon(shown ? 'i-eye-off' : 'i-eye')
}

const accountSection = document.getElementById('accountView')

accountSection.addEventListener('click', event => {
  const tab = event.target.closest('[data-account-tab]')
  if (tab) { chooseAccountTab(tab.dataset.accountTab); return }
  if (event.target.closest('[data-account-resend]')) {
    showToast('Письмо отправлено', `${accountState.profile.email} · ссылка подтверждения в демо не приходит`)
    return
  }
  const save = event.target.closest('[data-account-save]')
  if (save) { saveAccountField(save.dataset.accountSave); return }
  const show = event.target.closest('[data-account-show]')
  if (show) { accountTogglePass(show.dataset.accountShow); return }
  if (event.target.closest('[data-account-apply]')) { accountApplyPassword(); return }
  if (event.target.closest('[data-account-settings]')) { switchView('settings'); return }
  const theme = event.target.closest('[data-account-theme]')
  const mood = event.target.closest('[data-account-mood]')
  if (theme || mood) {
    if (theme) accountState.appearance.theme = theme.dataset.accountTheme
    else accountState.appearance.mood = mood.dataset.accountMood
    writeStore(ACCOUNT_APPEARANCE_STORE, accountState.appearance)
    applyAccountAppearance()
    renderAccount()
  }
})

accountSection.addEventListener('input', event => {
  const field = event.target.closest('[data-account-field]')
  if (field) { accountRefreshDirty(field); return }
  const pass = event.target.closest('[data-account-pass]')
  if (pass) { accountState.passwords[accountPassKey[pass.dataset.accountPass]] = pass.value; accountRefreshPassword(); return }
  const slider = event.target.closest('[data-account-brightness]')
  if (slider) {
    // Магнитная засечка 25/50/75/100 (±3) — из AppearanceTab.tsx: без неё значение на середине
    // дорожки читалось бы как «28%», тогда как оригинал всегда отдаёт круглую точку.
    const value = accountSnap(Number(slider.value))
    accountState.appearance.brightness = value
    slider.value = value
    slider.setAttribute('aria-valuenow', String(value))
    slider.setAttribute('aria-valuetext', `${value}%`)
    document.getElementById('accountBrightnessValue').textContent = `${value}%`
    writeStore(ACCOUNT_APPEARANCE_STORE, accountState.appearance)
    applyAccountAppearance()
  }
})

// role="tablist" обязывает стрелки: в оригинале их даёт Radix, здесь — несколько строк.
accountSection.addEventListener('keydown', event => {
  const tab = event.target.closest('#accountTabs [data-account-tab]')
  if (!tab) return
  const tabs = [...document.querySelectorAll('#accountTabs [data-account-tab]')]
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
  if (!step && event.key !== 'Home' && event.key !== 'End') return
  event.preventDefault()
  const index = tabs.indexOf(tab)
  const next = event.key === 'Home' ? 0
    : event.key === 'End' ? tabs.length - 1
      : (index + step + tabs.length) % tabs.length
  tabs[next].focus()
  chooseAccountTab(tabs[next].dataset.accountTab)
})

// §9: незавершённое «Сохранение…» и набранный пароль не должны пережить выход из раздела.
// Рамки §6 принадлежат «Аккаунту»: ⌘-переключение раздела обязано убрать и их, иначе
// подтверждение на сессию осталось бы висеть над «Товарами».
function closeAccountLayers() {
  if (accountSaveTimer) { window.clearTimeout(accountSaveTimer); accountSaveTimer = null }
  accountState.saving = null
  accountState.passwords = accountFreshPasswords()
  if (document.querySelector('#account2faModal.is-open,#accountKeyModal.is-open,#accountConfirmModal.is-open')) {
    ['accountConfirmModal', 'accountKeyModal', 'account2faModal'].forEach(closeModal)
    accountPendingAction = null
    accountPendingKey = null
    accountSecurity.step = 'scan'
    accountSecurity.code = ''
  }
}

// ── §6.1: четыре блока безопасности ───────────────────────────────────────────
// Состояние живёт до перезагрузки и не попадает в localStorage: сохранённые «включённая
// 2FA», «свой вход» или выпущенный ключ выглядели бы как настоящие изменения аккаунта,
// которого у мокапа нет.
const SECURITY_MINUTE = 60000
const SECURITY_HOUR = 3600000
const SECURITY_DAY = 86400000
const ACCOUNT_2FA_SECRET = 'H7XQ 2M4K 9PRT 6BND'
const ACCOUNT_BACKUP_CODES = ['6H2K-9QF4', 'PT38-2MZ7', 'X4RD-7BWK', '9LQ2-DF6T', '3K8M-ZH2P', 'W7TC-49QD', 'B2PF-6KX9', '5ZDQ-T3M8']

const accountSecuritySeed = () => ({
  twoFactor: false,
  step: 'scan',
  code: '',
  sessions: [
    { id: 'session-current', device: 'Windows', client: 'Chrome', city: 'Москва', at: STUDIO_NOW.getTime() - 4 * SECURITY_MINUTE, current: true },
    { id: 'session-safari', device: 'macOS', client: 'Safari', city: 'Санкт-Петербург', at: STUDIO_NOW.getTime() - 26 * SECURITY_HOUR },
    { id: 'session-iphone', device: 'iPhone', client: 'Safari', city: 'Казань', at: STUDIO_NOW.getTime() - 31 * SECURITY_HOUR },
  ],
  // §6.1.3: Newest first, ровно одна запись с предупреждающим тоном — остальные спокойные,
  // иначе «реальный риск» и история успешных входов читаются одинаково.
  logins: [
    { id: 'login-current', device: 'Windows · Chrome', city: 'Москва', at: STUDIO_NOW.getTime() - 4 * SECURITY_MINUTE, status: 'current' },
    { id: 'login-morning', device: 'Windows · Chrome', city: 'Москва', at: STUDIO_NOW.getTime() - 6 * SECURITY_HOUR, status: 'ok' },
    { id: 'login-safari', device: 'macOS · Safari', city: 'Санкт-Петербург', at: STUDIO_NOW.getTime() - 26 * SECURITY_HOUR, status: 'ok' },
    { id: 'login-iphone', device: 'iPhone · Safari', city: 'Казань', at: STUDIO_NOW.getTime() - 31 * SECURITY_HOUR, status: 'new' },
    { id: 'login-edge', device: 'Windows · Edge', city: 'Москва', at: STUDIO_NOW.getTime() - 4 * SECURITY_DAY, status: 'ok' },
    { id: 'login-firefox', device: 'Linux · Firefox', city: 'Екатеринбург', at: STUDIO_NOW.getTime() - 9 * SECURITY_DAY, status: 'failed' },
  ],
  keys: [
    { id: 'key-wb', name: 'Выгрузки WB', value: 'grf_wb_8f2k4ad9', at: STUDIO_NOW.getTime() - 2 * SECURITY_DAY },
    { id: 'key-ozon', name: 'Ozon аналитика', value: 'grf_oz_1nc8r3qe', at: null },
    { id: 'key-import', name: 'Импорт складов', value: 'grf_im_5tp7w2db', at: STUDIO_NOW.getTime() - 12 * SECURITY_DAY },
  ],
})
const accountSecurity = accountSecuritySeed()
let accountKeySeq = 0
let accountPendingAction = null
// Черновик ключа: значение генерируется при открытии рамки, но в список попадает только
// после «Создать ключ» — иначе отменённое по Esc окно оставляло бы ключ с пустым названием.
let accountPendingKey = null

const SECURITY_LOGIN_STATUS = {
  current: { label: 'Текущий вход', tone: 'progress' },
  ok: { label: 'Успешно', tone: 'muted' },
  new: { label: 'Новый вход', tone: 'warning' },
  mine: { label: 'Подтверждён', tone: 'good' },
  guarded: { label: 'Обработано', tone: 'muted' },
  failed: { label: 'Неудачная попытка', tone: 'muted' },
}

const securityChip = status => {
  const entry = SECURITY_LOGIN_STATUS[status] || SECURITY_LOGIN_STATUS.ok
  return `<span class="status-chip ${entry.tone}">${entry.label}</span>`
}
const securitySessionLabel = session => `${session.device} · ${session.client} · ${session.city}`
const securityKeyLabel = key => `${key.name} · ${settingsMask(key.value)}`
const accountSecurityItem = (list, id) => list.find(item => item.id === id) || null

function accountTwoFactorCard() {
  const on = accountSecurity.twoFactor
  return `<article class="card account-card">
    <header class="card-header"><div><h2>Двухфакторная аутентификация</h2><p>Настоящий второй фактор мокап не подключает — рамка показывает только шаги включения</p></div><span class="account-card-icon">${dashboardIcon('i-shield')}</span></header>
    <div class="account-inline-row">
      <div class="account-inline-copy"><strong>Второй фактор при входе</strong><small>${on ? 'Резервные коды выдали один раз — второй раз они не покажутся' : 'На новом устройстве придётся ввести код из приложения'}</small></div>
      <span class="security-switch"><span class="status-chip ${on ? 'good' : 'muted'}">${on ? 'Включена' : 'Не настроена'}</span>
        <button class="member-switch${on ? ' is-on' : ''}" type="button" role="switch" aria-checked="${String(on)}" data-sec-toggle aria-label="Двухфакторная аутентификация"><span></span></button></span>
    </div>
  </article>`
}

function accountSessionsCard() {
  const others = accountSecurity.sessions.filter(session => !session.current)
  const rows = accountSecurity.sessions.map(session => `<div class="security-row">
      <span class="security-mark">${escapeDashboardText(session.device.slice(0, 1))}</span>
      <span class="security-copy"><strong>${escapeDashboardText(`${session.device} · ${session.client}`)}</strong><small>${escapeDashboardText(session.city)} · ${accountDateLabel(session.at)}</small></span>
      ${session.current
        ? '<span class="status-chip progress">Текущая сессия</span>'
        : `<button class="secondary-button" type="button" data-sec-end="${session.id}" aria-label="Завершить сессию: ${escapeDashboardText(securitySessionLabel(session))}">Завершить</button>`}
    </div>`).join('')
  return `<article class="card account-card">
    <header class="card-header"><div><h2>Активные сессии</h2><p>Устройства, которые держат вход в кабинет</p></div><span class="account-card-icon">${dashboardIcon('i-panel')}</span></header>
    <div class="security-list">${rows}</div>
    <div class="security-foot"><span>${others.length ? `Других сессий: ${others.length} · текущую завершить нельзя` : 'Других сессий нет'}</span>
      <button class="secondary-button" type="button" data-sec-end-others${others.length ? '' : ' disabled'}>Завершить все остальные</button></div>
  </article>`
}

function accountHistoryCard() {
  const rows = accountSecurity.logins.map(entry => {
    const risky = entry.status === 'new'
    return `<div class="security-row${risky ? ' is-risk' : ''}">
      <span class="security-mark${risky ? ' is-risk' : ''}">${dashboardIcon(risky ? 'i-alert' : 'i-clock')}</span>
      <span class="security-copy"><strong>${escapeDashboardText(entry.device)}</strong><small>${escapeDashboardText(entry.city)} · ${accountDateLabel(entry.at)}</small></span>
      ${securityChip(entry.status)}
      ${risky ? `<span class="security-actions">
        <button class="secondary-button" type="button" data-sec-mine="${entry.id}">Это был я</button>
        <button class="secondary-button" type="button" data-sec-protect="${entry.id}">Защитить аккаунт</button></span>` : ''}
    </div>`
  }).join('')
  return `<article class="card account-card">
    <header class="card-header"><div><h2>История входов</h2><p>Последние шесть попыток войти в аккаунт</p></div><span class="account-card-icon">${dashboardIcon('i-clock')}</span></header>
    <div class="security-list">${rows}</div>
    <p class="security-note">Кнопки меняют только статус записи: в демо вход ниоткуда не приходит и ничего не отменяется.</p>
  </article>`
}

function accountKeysCard() {
  const rows = accountSecurity.keys.map(key => `<div class="security-row">
      <span class="security-mark">${dashboardIcon('i-key')}</span>
      <span class="security-copy"><strong>${escapeDashboardText(key.name)}</strong><small><code class="security-mono">${settingsMask(key.value)}</code> · ${key.at ? `последний запрос ${accountDateLabel(key.at)}` : 'ещё не использовался'}</small></span>
      <span class="security-key-actions">
        <button class="secondary-button" type="button" data-sec-key-copy="${key.id}" aria-label="Скопировать ключ: ${escapeDashboardText(key.name)}">Скопировать</button>
        <button class="icon-button security-revoke" type="button" data-sec-key-revoke="${key.id}" aria-label="Отозвать ключ: ${escapeDashboardText(securityKeyLabel(key))}" data-tooltip="Отозвать">${dashboardIcon('i-trash')}</button>
      </span>
    </div>`).join('')
  const list = accountSecurity.keys.length
    ? `<div class="security-list">${rows}</div>`
    : '<p class="security-note">Ключей нет — создайте, если подключаете интеграцию впервые.</p>'
  return `<article class="card account-card">
    <header class="card-header"><div><h2>Ключи интеграций</h2><p>Доступ внешних сервисов к данным кабинета</p></div>
      <span class="account-card-actions"><button class="secondary-button" type="button" data-sec-key-create>${dashboardIcon('i-plus')}Создать ключ</button></span></header>
    ${list}
    <p class="security-note">Значение ключа показывают один раз при создании, дальше в списке остаётся маска. Настоящие ключи мокап не запрашивает и не хранит.</p>
  </article>`
}

// Демо-QR: узор 21×21 из хеша секретной строки, а не настоящий код. Детерминированность
// важна тестам и приёмке: рамка обязана выглядеть одинаково при каждом открытии.
function accountQrMarkup(seed) {
  const size = 21
  let hash = 2166136261
  for (let i = 0; i < seed.length; i += 1) hash = ((hash ^ seed.charCodeAt(i)) * 16777619) >>> 0
  const corners = [[0, 0], [0, size - 7], [size - 7, 0]]
  const cells = []
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const finder = corners.find(([top, left]) => y >= top && y < top + 7 && x >= left && x < left + 7)
      if (finder) {
        const r = y - finder[0]
        const c = x - finder[1]
        cells.push(r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
        continue
      }
      hash = (hash * 1103515245 + 12345) >>> 0
      cells.push(((hash >> 15) & 1) === 1)
    }
  }
  return `<span class="qr-pattern" role="img" aria-label="Демонстрационный QR-код для приложения-аутентификатора">${
    cells.map(on => `<i${on ? ' class="is-on"' : ''}></i>`).join('')}</span>`
}

const account2faValid = () => /^\d{6}$/.test(accountSecurity.code)
function account2faHint() {
  if (!accountSecurity.code) return 'Код любой: мокап проверяет только шесть цифр и никуда их не отправляет.'
  return account2faValid() ? 'Код принят — нажмите «Подтвердить и включить».' : 'Нужно шесть цифр из приложения.'
}

function renderAccount2fa() {
  const codes = accountSecurity.step === 'codes'
  document.getElementById('account2faNote').textContent = codes
    ? 'Сохраните коды до закрытия окна: этот список показывается один раз.'
    : 'Отсканируйте узор в приложении-аутентификаторе и введите код.'
  document.getElementById('account2faBody').innerHTML = codes
    ? `<div class="account-code-grid">${ACCOUNT_BACKUP_CODES.map(value => `<code>${value}</code>`).join('')}</div>
       <p class="team-form-state">Каждый код одноразовый в настоящем сервисе; здесь это список-демонстрация, ничего не отменяющий.</p>`
    : `<div class="account-2fa-scan">${accountQrMarkup(ACCOUNT_2FA_SECRET)}
        <div class="account-2fa-side">
          <ol class="account-2fa-steps"><li>Откройте приложение-аутентификатор и добавьте этот кабинет.</li><li>Введите шестизначный код и подтвердите включение.</li></ol>
          <span class="field-control"><span class="field-label">Ключ для ручного ввода</span><code class="security-mono">${ACCOUNT_2FA_SECRET}</code></span>
          <label class="field-control"><span class="field-label">Код из приложения</span>
            <input id="account2faCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" value="${escapeDashboardText(accountSecurity.code)}"></label>
          <p class="team-form-state${accountSecurity.code && !account2faValid() ? ' is-error' : ''}" role="status">${account2faHint()}</p>
        </div></div>`
  document.getElementById('account2faCancel').classList.toggle('is-hidden', codes)
  const confirm = document.getElementById('account2faConfirm')
  confirm.textContent = codes ? 'Готово' : 'Подтвердить и включить'
  confirm.disabled = !codes && !account2faValid()
}

function openAccount2fa(step) {
  accountSecurity.step = step
  if (step === 'scan') accountSecurity.code = ''
  renderAccount2fa()
  openModal('account2faModal', step === 'scan' ? '#account2faCode' : '#account2faConfirm')
}

function closeAccount2fa() {
  closeModal('account2faModal')
  accountSecurity.step = 'scan'
  accountSecurity.code = ''
}

function accountToggleTwoFactor() {
  if (accountSecurity.twoFactor) {
    accountSecurity.twoFactor = false
    renderAccount()
    showToast('2FA выключена', 'Второй фактор больше не запрашивается · демонстрационное переключение')
    return
  }
  openAccount2fa('scan')
}

function accountConfirmTwoFactor() {
  if (accountSecurity.step === 'codes') return closeAccount2fa()
  if (!account2faValid()) return
  accountSecurity.twoFactor = true
  accountSecurity.step = 'codes'
  renderAccount2fa()
  document.getElementById('account2faConfirm').focus()
  renderAccount()
  showToast('2FA включена', `Статус «Включена» · выдано ${ACCOUNT_BACKUP_CODES.length} резервных кодов`)
}

function openAccountConfirm(options) {
  accountPendingAction = options
  document.getElementById('accountConfirmTitle').textContent = options.title
  document.getElementById('accountConfirmNote').textContent = options.note
  document.getElementById('accountConfirmBody').innerHTML = `<ul>${options.lines.map(line => `<li>${line}</li>`).join('')}</ul>`
  document.getElementById('accountConfirmRun').textContent = options.label
  openModal('accountConfirmModal', '#accountConfirmCancel')
}

function closeAccountConfirm() {
  accountPendingAction = null
  closeModal('accountConfirmModal')
}

function runAccountConfirm() {
  const action = accountPendingAction
  accountPendingAction = null
  closeModal('accountConfirmModal')
  if (action) action.run()
}

function askEndSession(id) {
  const session = accountSecurityItem(accountSecurity.sessions, id)
  if (!session || session.current) return
  openAccountConfirm({
    title: 'Завершить сессию?',
    note: securitySessionLabel(session),
    lines: [`Активность: ${accountDateLabel(session.at)}`, 'Устройство закроет текущий вход и потребует пароль при следующем открытии.'],
    label: 'Завершить',
    run() {
      accountSecurity.sessions = accountSecurity.sessions.filter(item => item.id !== id)
      renderAccount()
      showToast('Сессия завершена', `${securitySessionLabel(session)} · вход на устройстве больше не активен`)
    },
  })
}

function askEndOtherSessions() {
  const others = accountSecurity.sessions.filter(session => !session.current)
  if (!others.length) return
  openAccountConfirm({
    title: 'Завершить все остальные сессии?',
    note: `Текущая сессия (${accountSecurityItem(accountSecurity.sessions, 'session-current').device}) останется открытой`,
    lines: [`Закроются ${others.length} ${pluralizeDashboard(others.length, ['сессия', 'сессии', 'сессий'])}: ${others.map(securitySessionLabel).join(', ')}.`,
      'Так поступают, если потеряли устройство или сомневаетесь во входе с чужого.'],
    label: 'Завершить остальные',
    run() {
      accountSecurity.sessions = accountSecurity.sessions.filter(session => session.current)
      renderAccount()
      showToast('Сессии завершены', `Закрыто ${others.length} ${pluralizeDashboard(others.length, ['сессия', 'сессии', 'сессий'])} · текущий вход остался открытым`)
    },
  })
}

function markLogin(id, status, title, text) {
  const entry = accountSecurityItem(accountSecurity.logins, id)
  if (!entry) return
  entry.status = status
  renderAccount()
  showToast(title, text)
}

function askRevokeKey(id) {
  const key = accountSecurityItem(accountSecurity.keys, id)
  if (!key) return
  openAccountConfirm({
    title: 'Отозвать ключ?',
    note: securityKeyLabel(key),
    lines: [`Ключ «${key.name}» перестанет получать данные кабинета.`,
      key.at ? `Последний запрос: ${accountDateLabel(key.at)}.` : 'Этот ключ ещё ни разу не использовался.'],
    label: 'Отозвать',
    run() {
      accountSecurity.keys = accountSecurity.keys.filter(item => item.id !== id)
      renderAccount()
      showToast('Ключ отозван', `${key.name} · запросы с этим ключом больше не проходят`)
    },
  })
}

const accountKeyValue = () => `grf_${Math.random().toString(36).slice(2, 11)}k7`
const accountPendingKeyId = () => `key-new-${accountKeySeq}`

// Рамка живёт в двух шагах: сначала название, потом значение один раз. Тело пересобирается
// только на смене шага — пересборка на каждую клавишу заменила бы input и уронила каретку
// в начало (см. историю с #account2faCode).
function renderAccountKeyModal() {
  const pending = accountPendingKey
  if (!pending) return
  const naming = pending.step === 'name'
  document.getElementById('accountKeyTitle').textContent = naming ? 'Новый ключ интеграций' : 'Ключ создан'
  document.getElementById('accountKeyNote').textContent = naming
    ? 'Название остаётся в списке ключей: по нему понимают, какой сервис что читает.'
    : 'Скопируйте сейчас: мокап больше не покажет это значение, в списке останется маска.'
  document.getElementById('accountKeyCopy').classList.toggle('is-hidden', naming)
  const done = document.getElementById('accountKeyDone')
  done.textContent = naming ? 'Создать ключ' : 'Понятно'
  done.disabled = naming && !pending.name.trim()
  document.getElementById('accountKeyBody').innerHTML = naming
    ? `<div class="field-control"><label class="field-label" for="accountKeyName">Название ключа</label>
        <input id="accountKeyName" type="text" maxlength="48" autocomplete="off" placeholder="Например: Выгрузки на сервер" value="${escapeDashboardText(pending.name)}"></div>
      <p class="team-form-state">Настоящие API-ключи не запрашиваются: значение будет выдумано и никуда не отправится.</p>`
    : `<div class="account-key-value"><span class="field-label">Ключ для ${escapeDashboardText(pending.name)}</span><code>${escapeDashboardText(pending.value)}</code></div>
      <p class="team-form-state">Значение показывают один раз: после закрытия в списке остаётся только маска.</p>`
}

function openAccountKey() {
  accountKeySeq += 1
  accountPendingKey = { step: 'name', name: '', value: accountKeyValue() }
  renderAccountKeyModal()
  openModal('accountKeyModal', '#accountKeyName')
}

function accountKeyCommit() {
  const pending = accountPendingKey
  if (!pending) return
  if (pending.step === 'value') { closeModal('accountKeyModal'); return }
  const name = pending.name.trim()
  if (!name) return
  accountSecurity.keys.push({ id: accountPendingKeyId(), name, value: pending.value, at: null })
  renderAccount()
  pending.step = 'value'
  renderAccountKeyModal()
  // После пересборки тела фокус остался бы на body, и Enter/Tab потерялись бы.
  document.getElementById('accountKeyDone').focus({ preventScroll: true })
}

function copyAccountKey(id) {
  const key = accountSecurityItem(accountSecurity.keys, id)
  if (!key) return
  // §6.1.4: настоящий буфер не обязателен — мокап отвечает состоянием toast, а не правами
  // браузера на clipboard, которые в песочнице страницы недоступны.
  showToast('Ключ скопирован', `${key.name} · ${settingsMask(key.value)} · в демо значение не попадает в буфер`)
}

// Клик по карточкам безопасности: действия разнесены по data-атрибутам, чтобы не заводить
// второй обработчик на каждую из пяти карточек.
accountSection.addEventListener('click', event => {
  if (event.target.closest('[data-sec-toggle]')) { accountToggleTwoFactor(); return }
  const end = event.target.closest('[data-sec-end]')
  if (end) { askEndSession(end.dataset.secEnd); return }
  if (event.target.closest('[data-sec-end-others]')) { askEndOtherSessions(); return }
  const mine = event.target.closest('[data-sec-mine]')
  if (mine) { markLogin(mine.dataset.secMine, 'mine', 'Спасибо, отметили', 'Запись получила статус «Подтверждён» · других действий демо не выполняет'); return }
  const protect = event.target.closest('[data-sec-protect]')
  if (protect) { markLogin(protect.dataset.secProtect, 'guarded', 'Отметили как подозрительный', 'В реальном сервисе здесь сменили бы пароль и завершили чужие сессии'); return }
  if (event.target.closest('[data-sec-key-create]')) { openAccountKey(); return }
  const copy = event.target.closest('[data-sec-key-copy]')
  if (copy) { copyAccountKey(copy.dataset.secKeyCopy); return }
  const revoke = event.target.closest('[data-sec-key-revoke]')
  if (revoke) askRevokeKey(revoke.dataset.secKeyRevoke)
})

document.getElementById('account2faModal').addEventListener('click', event => {
  if (event.target.closest('#account2faClose,#account2faCancel')) { closeAccount2fa(); return }
  if (event.target.closest('#account2faConfirm')) accountConfirmTwoFactor()
})
document.getElementById('account2faModal').addEventListener('input', event => {
  if (event.target.id !== 'account2faCode') return
  accountSecurity.code = event.target.value.replace(/\D/g, '').slice(0, 6)
  if (accountSecurity.code !== event.target.value) event.target.value = accountSecurity.code
  // Тело рамки не пересобирается: renderAccount2fa() заменил бы сам input, каретка
  // прыгнула бы в начало, и «142530» превратилось бы в «035241». Обновляем только
  // подсказку и состояние кнопки.
  const hint = document.querySelector('#account2faBody .team-form-state')
  hint.textContent = account2faHint()
  hint.classList.toggle('is-error', Boolean(accountSecurity.code) && !account2faValid())
  document.getElementById('account2faConfirm').disabled = !account2faValid()
})
document.getElementById('account2faModal').addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.target.id !== 'account2faCode') return
  // Без preventDefault Enter доживает до кнопки, на которую closeModal вернул фокус, и
  // рамка открылась бы заново сразу после подтверждения.
  event.preventDefault()
  accountConfirmTwoFactor()
})
document.getElementById('accountKeyModal').addEventListener('click', event => {
  if (event.target.closest('#accountKeyClose')) { closeModal('accountKeyModal'); return }
  if (event.target.closest('#accountKeyDone')) { accountKeyCommit(); return }
  if (event.target.closest('#accountKeyCopy')) copyAccountKey(accountPendingKeyId())
})
document.getElementById('accountKeyModal').addEventListener('input', event => {
  if (event.target.id !== 'accountKeyName' || !accountPendingKey) return
  accountPendingKey.name = event.target.value
  document.getElementById('accountKeyDone').disabled = !event.target.value.trim()
})
document.getElementById('accountKeyModal').addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.target.id !== 'accountKeyName') return
  event.preventDefault()
  accountKeyCommit()
})
document.getElementById('accountConfirmModal').addEventListener('click', event => {
  if (event.target.closest('#accountConfirmClose,#accountConfirmCancel')) closeAccountConfirm()
  if (event.target.closest('#accountConfirmRun')) runAccountConfirm()
})

function setScenario(value) {
  const strip = document.getElementById('qualityStrip')
  const summary = strip.querySelector('.quality-summary')
  const light = summary.querySelector('.status-light')
  const title = summary.querySelector('strong')
  const chip = document.getElementById('reconciliationChip')
  const notice = document.getElementById('scenarioNotice')
  const noticeTitle = document.getElementById('noticeTitle')
  const noticeText = document.getElementById('noticeText')
  const noticeAction = document.getElementById('noticeAction')

  notice.classList.toggle('is-hidden', value === 'normal')
  light.className = 'status-light good'
  chip.className = 'status-chip good'
  chip.textContent = 'Сверка 0 ₽'
  title.textContent = 'Отчёт готов'
  noticeAction.onclick = () => openModal('versionModal', '#versionClose')

  if (value === 'reconciliation') {
    light.className = 'status-light bad'
    chip.className = 'status-chip danger'
    chip.textContent = 'Сверка +842 ₽'
    title.textContent = 'Требует проверки'
    noticeTitle.textContent = 'Обнаружено расхождение 842 ₽'
    noticeText.textContent = 'Денежные суммы доступны, но отчёт нельзя считать полностью сверенным.'
    noticeAction.textContent = 'Разобрать'
    noticeAction.onclick = () => switchView('admin')
  } else if (value === 'unknown') {
    light.className = 'status-light bad'
    chip.className = 'status-chip warning'
    chip.textContent = '18 операций без категории'
    title.textContent = 'Методика проверяется'
    noticeTitle.textContent = 'WB передал новый вид операции'
    noticeText.textContent = 'Последняя опубликованная версия доступна. Новые операции ждут решения администратора.'
    noticeAction.textContent = 'К расследованию'
    noticeAction.onclick = () => switchView('admin')
  } else if (value === 'version') {
    noticeTitle.textContent = 'Методика обновлена до версии 3'
    noticeText.textContent = 'Пересчитаны три недели. Исходный отчёт и причины изменения доступны для сравнения.'
    noticeAction.textContent = 'Сравнить версии'
  }
}

/* ── §3–§5 Контроль расчётов: команда, права, очередь кейсов ───────────────────
   Демонстрационные состояния: ничего не пересчитывается по-настоящему (§3.3), меняются
   только статус, история и явно подписанный результат контроля. Данные живут в памяти
   страницы — перезагрузка возвращает исходную очередь. */

// Состав команды (§5.1) и роли (§5.2) объявлены здесь, а не в панели команды: очередь кейсов
// показывает ответственного аватаром, а «Управление командой» редактирует тех же людей.
const ADMIN_ROLES = {
  owner: { name: 'Владелец', note: 'Все юрлица, кабинеты, команда и расчёты' },
  finance: { name: 'Финансист', note: 'Контроль расчётов и сверки своих юрлиц' },
  analyst: { name: 'Аналитик', note: 'Дашборды, отчёты и решения по кейсам' },
  manager: { name: 'Менеджер', note: 'Задачи, планы и товары без смены правил' },
  viewer: { name: 'Просмотр', note: 'Только чтение статусов и истории' },
}

// Присутствие — демонстрационное и принадлежит составу, а не панели: «Участники» обязаны
// показывать тех же людей, что и меню назначения в кейсе. status (§5.1): active — в команде,
// invited — приглашение ещё не принято, disabled — доступ временно отключён.
const ADMIN_TEAM = [
  { id: 'daria', name: 'Дарья Лебедева', short: 'Дарья', initials: 'Д', email: 'daria@grafio.ru', role: 'owner', access: 'Все юрлица и кабинеты', presence: 'online', status: 'active' },
  { id: 'anna', name: 'Анна Соколова', short: 'Анна', initials: 'А', email: 'anna@grafio.ru', role: 'finance', access: 'ООО «Верена», контроль расчётов', presence: 'busy', status: 'active' },
  { id: 'mikhail', name: 'Михаил Орлов', short: 'Михаил', initials: 'М', email: 'mikhail@grafio.ru', role: 'analyst', access: 'Дашборды и отчёты', presence: 'online', status: 'active' },
  { id: 'irina', name: 'Ирина Белова', short: 'Ирина', initials: 'И', email: 'irina@grafio.ru', role: 'manager', access: 'Товары и планы', presence: 'off', status: 'active' },
]

// Профиль в сайдбаре — «Аналитик · analyst@grafio.ru», поэтому текущий пользователь демо
// подписан тем же аналитиком: «Взять в работу» и «Только мои» обязаны сходиться с профилем.
const CURRENT_MEMBER = 'mikhail'
let viewerRole = 'analyst'
const teamMember = id => ADMIN_TEAM.find(member => member.id === id) || null
const memberName = id => teamMember(id)?.name || 'Без ответственного'

// §6.2: «Просмотр» не видит кнопок назначения, отправки запроса и дополнения кейса; «Менеджер»
// работает с задачами, но не отправляет запросы в Grafio. Права читаются из роли, которую выбран
// селектор «Смотреть как», а не из CURRENT_MEMBER — иначе проверить механику было бы нельзя.
function adminCan(action) {
  if (viewerRole === 'viewer') return false
  return !(viewerRole === 'manager' && action === 'send')
}

const ADMIN_TYPES = {
  category: { label: 'Категоризация', icon: 'receipt' },
  reconcile: { label: 'Сверка', icon: 'compare' },
  data: { label: 'Данные', icon: 'alert' },
  rule: { label: 'Правило', icon: 'shield' },
}

// §3.1: набор статусов клиентской очереди. «В работе» в него не входит: взятие в работу
// назначает ответственного, а статус описывает путь запроса в Grafio. Тон чипа жёлтый только
// там, где кейс действительно заблокирован (§7.2 просит не красить в предупреждение спокойное).
const ADMIN_STATUSES = {
  new: { label: 'Новая', chip: '' },
  sent: { label: 'Отправлено Grafio', chip: 'progress' },
  blocked: { label: 'Нужны данные', chip: 'warning' },
  published: { label: 'Опубликовано', chip: 'good' },
  closed: { label: 'Закрыто', chip: 'muted' },
}
// Клиентская очередь завершена, только когда кейс закрыт у себя: «Опубликовано» ещё требует
// действия «Закрыть у себя» (§3.3), поэтому в счётчике открытых проблем оно остаётся.
const ADMIN_DONE = ['closed']

const ADMIN_PRIORITIES = { high: 'Высокий', normal: 'Обычный', low: 'Низкий' }

// Мокап живёт отчётной неделей 27 апр. – 3 мая: новые записи истории должны продолжаться
// по этому же календарю, а не показывать реальную дату приёмки.
const ADMIN_CLOCK = new Date('2026-05-03T15:10:00')
let adminClockStep = 0
const adminNow = () => new Date(ADMIN_CLOCK.getTime() + (adminClockStep += 7) * 6e4)
const adminDate = value => new Date(value)
// неразрывный перед ₽: в узкой колонке знак рубля не должен переезжать на вторую строку
const adminMoney = value => `${new Intl.NumberFormat('ru-RU').format(Math.abs(value))}\u00A0₽`
const adminStamp = date => `${new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date)}, ${new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date)}`

const ADMIN_ICON = name => `<svg><use href="#i-${name}"/></svg>`

// §3.2/§3.3: клиентский кейс описывает сигнал, доказательства и статус запроса. Глобального
// правила, способа применения и контрольного пересчёта здесь нет — proposal читается как
// предложение команды, а check.after и resolution приходят из Admin Console после публикации.
const ADMIN_CASES = [
  {
    id: 'Q-42', kind: 'category', priority: 'high', status: 'new', owner: null, comments: 2,
    title: 'Новая операция «Корректировка тарифа хранения»',
    summary: 'Обнаружена в 18 операциях на сумму 12 580\u00A0₽',
    signal: 'WB передал вид операции, которого нет в справочнике категорий',
    source: 'Основной кабинет · 27 апр. – 3 мая',
    updated: adminDate('2026-05-03T09:15:00'),
    amount: 12580,
    raw: 'supplierOperName = storage_tariff_correction',
    affected: [
      { name: 'Корректировка тарифа хранения', period: '20 апр. – 26 апр.', sum: -1240 },
      { name: 'Корректировка тарифа хранения', period: '27 апр. – 3 мая', sum: -8140 },
      { name: 'Частичное удержание за хранение', period: '27 апр. – 3 мая', sum: -3200 },
    ],
    operations: 18,
    weeks: ['20 апр. – 26 апр.', '27 апр. – 3 мая'],
    proposed: 'Хранение',
    rationale: '',
    proposal: {
      condition: 'supplierOperName = Корректировка тарифа хранения',
      note: 'Команда предлагает отнести операцию к расходам на хранение. Правило создаёт и публикует администратор Grafio.',
    },
    check: { beforeLabel: 'ДО ПРАВИЛА', before: '18 операций без категории', beforeCaption: 'Категоризация не завершена', after: null },
    resolution: null,
    history: [
      { at: adminDate('2026-05-03T08:40:00'), author: 'daria', action: 'Кейс создан', note: 'Сигнал получен из кабинета WB при загрузке недели' },
      { at: adminDate('2026-05-03T09:15:00'), author: 'anna', action: 'Комментарий', note: 'Похожая операция уже была в марте — стоит свериться с историей' },
    ],
  },
  {
    id: 'Q-41', kind: 'reconcile', priority: 'high', status: 'sent', owner: 'anna', comments: 4,
    title: 'Расхождение сверки WB · 12 580\u00A0₽',
    summary: 'Оборот кабинета и оборот Grafio разошлись на 12 580\u00A0₽',
    signal: 'Сводная сверка недели не сошлась с оборотом личного кабинета',
    source: 'Основной кабинет · 27 апр. – 3 мая',
    updated: adminDate('2026-05-03T11:05:00'),
    amount: 12580,
    compare: { left: { label: 'Оборот по кабинету WB', value: 1284560 }, right: { label: 'Оборот по данным Grafio', value: 1271980 } },
    methodology: 'v2 · свёрка по ставке комиссии 19%, допуск 0\u00A0₽',
    weeks: ['27 апр. – 3 мая'],
    proposal: {
      condition: 'Учесть корректировку тарифа хранения в свёрке недели',
      note: 'Команда предполагает, что расхождение — неотраженное удержание за хранение. Пересчёт по запросу клиента не выполняется.',
    },
    check: { beforeLabel: 'ДО СВЕРКИ', before: '+12 580,00\u00A0₽', beforeCaption: 'Расхождение недели', after: null },
    resolution: null,
    history: [
      { at: adminDate('2026-05-02T17:20:00'), author: 'daria', action: 'Кейс создан', note: 'Автоматическая сверка недели не сошлась' },
      { at: adminDate('2026-05-03T10:05:00'), author: 'anna', action: 'Назначение', note: 'Анна Соколова взяла кейс в работу' },
      { at: adminDate('2026-05-03T10:48:00'), author: 'anna', action: 'Комментарий', note: 'Сумма совпадает с корректировкой тарифа хранения из Q-42' },
      { at: adminDate('2026-05-03T11:05:00'), author: 'anna', action: 'Отправлено в Grafio', note: 'Запрос на проверку отправлен · пересчёт не выполнялся' },
    ],
  },
  {
    id: 'Q-39', kind: 'data', priority: 'normal', status: 'blocked', owner: 'mikhail', comments: 3,
    title: 'Неполные данные за период 13–19 апреля',
    summary: 'По 4 из 12 виджетов не пришли данные по возвратам',
    signal: 'Выгрузка недели пришла без столбца возвратов',
    source: 'Север · 13–19 апреля',
    updated: adminDate('2026-05-02T14:30:00'),
    amount: null,
    missing: [
      { name: 'Возвраты, ₽', detail: 'Пусто в 4 виджетах' },
      { name: 'Выкупы, шт.', detail: 'Нет разбивки по SKU' },
    ],
    weeks: ['13–19 апреля'],
    proposal: {
      condition: 'Источник данных · переписка выгрузки WB за 20 апреля',
      note: 'Команда просит подтянуть недостающий столбец из исходной выгрузки. После получения данных проверку запускает администратор Grafio.',
    },
    check: { beforeLabel: 'ДО ЗАПРОСА', before: '4 поля пустые', beforeCaption: 'Данные неполные', after: null },
    resolution: null,
    history: [
      { at: adminDate('2026-04-21T09:10:00'), author: 'daria', action: 'Кейс создан', note: 'Проверка полноты данных не пройдена' },
      { at: adminDate('2026-04-22T13:40:00'), author: 'mikhail', action: 'Назначение', note: 'Михаил Орлов взял кейс в работу' },
      { at: adminDate('2026-05-02T14:30:00'), author: 'mikhail', action: 'Запрос данных', note: 'Запрошена переписка выгрузки за 20 апреля' },
    ],
  },
  {
    id: 'Q-37', kind: 'reconcile', priority: 'normal', status: 'new', owner: null, comments: 1,
    title: 'Дублирующая операция за 29 апреля',
    summary: 'Одна и та же корректировка попала в неделю дважды: −2 480\u00A0₽',
    signal: 'Детализация недели содержит две одинаковые операции',
    source: 'Основной кабинет · 27 апр. – 3 мая',
    updated: adminDate('2026-05-01T18:05:00'),
    amount: 2480,
    compare: { left: { label: 'Сумма по выгрузке', value: -4960 }, right: { label: 'Сумма по детализации', value: -2480 } },
    methodology: 'v2 · дубликаты ищутся по «дата + сумма + тип операции»',
    weeks: ['27 апр. – 3 мая'],
    proposal: {
      condition: 'Пометить вторую операцию дубликатом в сверке недели',
      note: 'Команда просит исключить повтор из свёрки. Исходная выгрузка остаётся доступной для сравнения.',
    },
    check: { beforeLabel: 'ДО СВЕРКИ', before: '+2 480,00\u00A0₽', beforeCaption: 'Повтор операции', after: null },
    resolution: null,
    history: [
      { at: adminDate('2026-05-01T18:05:00'), author: 'irina', action: 'Кейс создан', note: 'Повтор операции найден при проверке детализации' },
    ],
  },
  {
    id: 'Q-35', kind: 'rule', priority: 'low', status: 'new', owner: 'irina', comments: 0,
    title: 'Обновление комиссии WB с 1 мая',
    summary: 'Ставка комиссии меняется с 19% на 20% — задним числом или вперёд',
    signal: 'WB опубликовал новую ставку комиссии',
    source: 'Все кабинеты WB · с 1 мая',
    updated: adminDate('2026-04-30T12:20:00'),
    amount: null,
    weeks: ['с 01.05.2026'],
    proposal: {
      condition: 'Комиссия WB = 20% · действует с 01.05.2026',
      note: 'Команда просит применить новую ставку. Способ применения — вперёд или с пересчётом истории — выбирает администратор Grafio.',
    },
    check: { beforeLabel: 'ДО ПРАВИЛА', before: 'Ставка 19%', beforeCaption: 'Ставка в истории', after: null },
    resolution: null,
    history: [
      { at: adminDate('2026-04-30T12:20:00'), author: 'daria', action: 'Кейс создан', note: 'Новая ставка комиссии в уведомлениях WB' },
    ],
  },
  {
    id: 'Q-31', kind: 'reconcile', priority: 'low', status: 'closed', owner: 'anna', comments: 5,
    title: 'Сверка недели 20–26 апреля',
    summary: 'Закрыта: расхождение 842\u00A0₽ разобрано как удержание за брак',
    signal: 'Сверка недели не сходилась на 842\u00A0₽',
    source: 'WB Север · 20–26 апреля',
    updated: adminDate('2026-04-29T16:45:00'),
    amount: 0,
    compare: { left: { label: 'Оборот по кабинету WB', value: 1193840 }, right: { label: 'Оборот по данным Grafio', value: 1193840 } },
    methodology: 'v3 · свёрка по удержаниям за брак, допуск 0\u00A0₽',
    weeks: ['20 апр. – 26 апр.'],
    proposal: {
      condition: 'Отнесть расхождение 842\u00A0₽ на удержание за брак',
      note: 'Историческая проверка: решение опубликовано администратором Grafio 29 апреля.',
    },
    check: { beforeLabel: 'ДО СВЕРКИ', before: '+842,00\u00A0₽', beforeCaption: 'Расхождение недели', after: { value: '0,00\u00A0₽', caption: 'Сверка пройдена · v3', passed: true } },
    resolution: {
      version: 'v3',
      at: adminDate('2026-04-29T16:30:00'),
      result: '0,00\u00A0₽',
      application: 'Пересчитать историю',
      note: 'Публикация касаются двух организаций и трёх недель. Отчётные значения мокапа не пересчитаны.',
    },
    history: [
      { at: adminDate('2026-04-27T10:00:00'), author: 'daria', action: 'Кейс создан', note: 'Автоматическая сверка недели не сошлась' },
      { at: adminDate('2026-04-27T11:20:00'), author: 'anna', action: 'Отправлено в Grafio', note: 'Запрос на проверку отправлен без пересчёта' },
      { at: adminDate('2026-04-28T09:40:00'), author: 'anna', action: 'Запрос данных', note: 'Запрошены первичные по удержанию за брак от 24 апреля' },
      { at: adminDate('2026-04-29T15:10:00'), author: 'daria', action: 'Публикация версии методики', note: 'Администратор Grafio опубликовал v3 · пересчитать историю' },
      { at: adminDate('2026-04-29T16:30:00'), author: 'daria', action: 'Результат сверки', note: 'Контрольная свёрка: разница 0\u00A0₽' },
      { at: adminDate('2026-04-29T16:45:00'), author: 'anna', action: 'Закрытие у себя', note: 'Кейс закрыт клиентской командой · расхождение 842\u00A0₽ отнесено на удержание' },
    ],
  },
]

const adminState = {
  selected: 'Q-42',
  search: '',
  filters: { status: '', kind: '', owner: '' },
  mineOnly: false,
  showArchived: false,
  historyOpen: true,
  composer: null,
  menu: null,
}

const adminTasks = []
const adminActivity = []

function adminVisibleCases() {
  const query = adminState.search.trim().toLowerCase()
  return ADMIN_CASES.filter(item => {
    if (item.archived && !adminState.showArchived) return false
    if (adminState.mineOnly && item.owner !== CURRENT_MEMBER) return false
    if (adminState.filters.status && item.status !== adminState.filters.status) return false
    if (adminState.filters.kind && item.kind !== adminState.filters.kind) return false
    if (adminState.filters.owner && (item.owner || 'none') !== adminState.filters.owner) return false
    if (query && !`${item.id} ${item.title}`.toLowerCase().includes(query)) return false
    return true
  })
}

const adminCaseById = id => ADMIN_CASES.find(item => item.id === id) || null
const adminSelectedCase = () => adminCaseById(adminState.selected)

// §3.1: выбранный кейс сохраняется, пока он не скрыт фильтром.
function adminSyncSelection(items) {
  if (!items.some(item => item.id === adminState.selected)) adminState.selected = items[0]?.id || null
  return items
}

function adminLog(item, action, note, author = CURRENT_MEMBER) {
  const at = adminNow()
  item.history.push({ at, author, action, note })
  item.updated = at
}

// Поле, которому вернуть фокус после перерисовки: узел уничтожается вместе с контейнером,
// поэтому возврат возможен только по стабильному ключу, а не по ссылке на элемент.
let adminFocusKey = null
// renderAdmin пересобирает очередь и карточку подряд, и каждая половина зовёт restoreFocus.
// Без разделения по контейнеру очередь перехватит ключ карточки (например, «composer»),
// сфокусирует устаревший узел и обнулит ключ — фокус уйдёт в body.
function adminRestoreFocus(inside) {
  if (!adminFocusKey) return
  const node = document.querySelector(`[data-admin-focus="${adminFocusKey}"]`)
  if (!node || Boolean(inside) !== Boolean(node.closest('#adminQueue'))) return
  adminFocusKey = null
  node.focus()
}

const adminSigned = value => `${value < 0 ? '−' : ''}${adminMoney(value)}`
// Разница считается по исходным значениям сверки и не меняется решением Grafio: публикуются
// только результат и версия, поэтому «ноль» возможен либо когда значения и так равны, либо
// когда администратор оставил объяснение (resolution.result) — он показан отдельной строкой.
const adminDelta = item => (item.compare ? Math.abs(item.compare.left.value - item.compare.right.value) : 0)
const adminDeltaNote = item => {
  if (!adminDelta(item)) return 'Разница сведена к нулю'
  if (item.resolution) return `Публикация ${item.resolution.version}: результат ${item.resolution.result}`
  return 'Кейс закрывается после публикации проверки Grafio'
}
const adminSendBlockers = item => {
  const blockers = []
  if (!item.owner) blockers.push('назначьте ответственного')
  if (item.kind === 'category' && !item.rationale.trim()) blockers.push('опишите, почему выбрана категория')
  return blockers
}

function adminFilterControl(key, label, options) {
  const current = adminState.filters[key] || ''
  const active = options.find(option => option.value === current) || options[0]
  return `<div class="field-control admin-filter"><span class="field-label">${label}</span>
    <div class="field-select" data-admin-filter="${key}">
      <button class="field-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" data-admin-focus="filter:${key}"><span>${active.label}</span>${ADMIN_ICON('chevron-down')}</button>
      <div class="field-select-popover" role="listbox" aria-label="${label}">${options.map(option => `<button type="button" role="option" data-value="${option.value}" aria-selected="${String(option.value === active.value)}">${option.label}${ADMIN_ICON('check')}</button>`).join('')}</div>
    </div></div>`
}

function adminQueueItem(item) {
  const member = teamMember(item.owner)
  return `<button class="queue-item${item.id === adminState.selected ? ' is-active' : ''}" type="button" data-admin-case="${item.id}" aria-current="${String(item.id === adminState.selected)}">
    <span class="queue-icon ${ADMIN_DONE.includes(item.status) ? 'good' : item.priority === 'high' ? 'danger' : 'warning'}">${ADMIN_ICON(ADMIN_TYPES[item.kind].icon)}</span>
    <span class="queue-copy"><strong>${item.id} · ${escapeDashboardText(item.title)}</strong>
      <small>${ADMIN_TYPES[item.kind].label} · ${adminStamp(item.updated)}</small></span>
    <span class="queue-badges">
      <span class="admin-badge is-${item.status}">${ADMIN_STATUSES[item.status].label}</span>
      <span class="admin-badge is-prio-${item.priority}">${ADMIN_PRIORITIES[item.priority]}</span>
      <span class="queue-comments">${ADMIN_ICON('doc')}<em>${item.comments}</em></span>
      ${member ? `<span class="queue-user"><span class="avatar is-mini">${member.initials}</span></span>` : `<span class="queue-user is-empty">${ADMIN_ICON('user')}</span>`}
    </span>
    <b>${item.archived ? 'архив' : item.amount === null ? '—' : adminMoney(item.amount)}</b>
  </button>`
}

function renderAdminQueue() {
  const box = document.getElementById('adminQueue')
  if (!box) return
  const items = adminSyncSelection(adminVisibleCases())
  const total = ADMIN_CASES.filter(item => !item.archived || adminState.showArchived).length
  const open = ADMIN_CASES.filter(item => !item.archived && !ADMIN_DONE.includes(item.status)).length
  const closed = ADMIN_CASES.filter(item => ADMIN_DONE.includes(item.status)).length
  // «Опубликовано» — не конец пути: клиент обязан закрыть кейс у себя (§3.3), поэтому такие
  // кейсы считаются открытыми и показываются отдельным счётчиком в шапке очереди.
  const awaiting = ADMIN_CASES.filter(item => !item.archived && item.status === 'published').length
  const archived = ADMIN_CASES.filter(item => item.archived).length
  const filtered = adminState.search || Object.values(adminState.filters).some(Boolean) || adminState.mineOnly
  // Поиск живёт в value поля: пересборка ряда фильтров не должна его обнулять, иначе
  // набранный запрос исчезает при первом же выборе статуса.
  const searchFocused = document.activeElement?.id === 'adminSearch'
  const ownerOptions = [{ value: '', label: 'Любой' }, ...ADMIN_TEAM.map(member => ({ value: member.id, label: member.short })), { value: 'none', label: 'Без ответственного' }]

  box.innerHTML = `
    <header class="card-header"><div><h2>Очередь проблем</h2><p>Открытых проблем — ${open}${awaiting ? ` · ждут закрытия: ${awaiting}` : ''}</p></div></header>
    <label class="kpi-search admin-search">${ADMIN_ICON('search')}<input id="adminSearch" type="search" value="${escapeDashboardText(adminState.search)}" placeholder="Поиск по очереди" aria-label="Поиск по очереди"></label>
    <div class="admin-filters">
      ${adminFilterControl('status', 'Статус', [{ value: '', label: 'Любой' }, ...Object.entries(ADMIN_STATUSES).map(([value, meta]) => ({ value, label: meta.label }))])}
      ${adminFilterControl('kind', 'Тип', [{ value: '', label: 'Любой' }, ...Object.entries(ADMIN_TYPES).map(([value, meta]) => ({ value, label: meta.label }))])}
    </div>
    <div class="admin-filters admin-filters-tail">
      ${adminFilterControl('owner', 'Ответственный', ownerOptions)}
      <label class="check-row admin-mine"><input id="adminMineOnly" type="checkbox" ${adminState.mineOnly ? 'checked' : ''}><span class="check-control" aria-hidden="true">${ADMIN_ICON('check')}</span><span>Только мои</span></label>
    </div>
    <div class="admin-queue-meta"><span>Показано ${items.length} из ${total}</span>${archived ? `<button class="admin-archive-toggle" id="adminArchiveToggle" type="button" data-admin-action="archive-toggle" data-admin-focus="archive-toggle" aria-pressed="${String(adminState.showArchived)}">${adminState.showArchived ? 'Скрыть архив' : `Архив · ${archived}`}</button>` : ''}</div>
    <div class="queue-scroll">${items.length ? items.map(adminQueueItem).join('') : `
      <div class="admin-empty"><span class="plan-empty-icon">${ADMIN_ICON('filter')}</span><h2>Ничего не найдено</h2><p>Под фильтр не попал ни один кейс. Измените условия или верните полный список.</p>
      <button class="secondary-button" id="adminResetFilters" type="button" data-admin-action="reset-filters">Сбросить фильтры</button></div>`}</div>
    <div class="queue-footer"><span class="status-light good"></span><span>${closed} ${pluralizeDashboard(closed, ['проверка закрыта', 'проверки закрыты', 'проверок закрыто'])} за 30 дней</span></div>`

  bindFieldSelects(box)
  if (searchFocused) {
    const input = document.getElementById('adminSearch')
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
  }
  adminRestoreFocus(true)
}

/* §3.2: маршрут клиентского кейса — «Сигнал → Доказательства → Проверка Grafio → Результат».
   Этапов «Правило / Контроль / Применение» здесь больше нет: они принадлежат Admin Console (§4),
   а клиент видит только отправленный запрос и то, что Grafio опубликовал в ответ. */
const ADMIN_STEPS = ['Сигнал', 'Доказательства', 'Проверка Grafio', 'Результат']
// Указатель этапа, а не навигация: элементы не кнопки, интерактивный шаг без действия выглядел
// бы на приёмке сломанным контролом. «Закрыто» даёт current=5, то есть все четыре шага done.
const ADMIN_STEP_BY_STATUS = { new: 2, blocked: 2, sent: 3, published: 4, closed: 5 }
const adminStep = item => ADMIN_STEP_BY_STATUS[item.status]

function adminSteps(item) {
  const current = adminStep(item)
  return `<div class="steps" role="list" aria-label="Этапы кейса">${ADMIN_STEPS.map((label, index) => {
    const n = index + 1
    const state = n < current ? 'done' : n === current ? 'active' : ''
    return `<span class="step ${state}" role="listitem" aria-current="${String(n === current)}"><span class="step-no">${n}</span>${label}</span>`
  }).join('')}</div>`
}

function adminCaseHeader(item) {
  const status = ADMIN_STATUSES[item.status]
  const member = teamMember(item.owner)
  const editable = adminCan('assign')
  // §3.3: «Добавить данные» и «Отправить в Grafio» живут до отправки запроса; опубликованный
  // и закрытый кейс их не показывает — дальше работает пара «Закрыть у себя» / «Открыть повторно».
  const canRequest = editable && (item.status === 'new' || item.status === 'blocked')
  // §6.2: «Менеджер» дополняет кейс, но не отправляет запрос в Grafio — кнопка и её гейт
  // снимаются вместе, иначе строка «Для отправки: …» обещала бы действие, которого нет.
  const canSend = canRequest && adminCan('send')
  return `<header class="case-title">
    <div class="case-row"><span class="case-id">${item.id} · ${ADMIN_TYPES[item.kind].label}</span>
      <div class="case-meta">
        <div class="case-badges"><span class="status-chip ${status.chip}">${status.label}</span><span class="admin-badge is-prio-${item.priority}">${ADMIN_PRIORITIES[item.priority]} приоритет</span></div>
        <div class="case-owner">${member
          ? `<span class="avatar">${member.initials}</span><span class="case-owner-copy"><strong>${member.name}</strong><small>${ADMIN_ROLES[member.role].name} · доступ: ${member.access.toLowerCase()}</small></span>`
          : `<span class="avatar is-empty">${ADMIN_ICON('user')}</span><span class="case-owner-copy"><strong>Без ответственного</strong><small>Кейс ещё не взят в работу</small></span>`}</div>
      </div>
    </div>
    <div class="case-row"><h1>${escapeDashboardText(item.title)}</h1>
      ${editable ? `<div class="case-header-actions">
        <button class="secondary-button" type="button" data-admin-menu="assign">${ADMIN_ICON('user')}<span>${member ? 'Сменить' : 'Назначить'}</span></button>
        ${canRequest ? `<button class="secondary-button" type="button" data-admin-action="request">${ADMIN_ICON('doc')}<span>Добавить данные</span></button>` : ''}
        ${canSend ? `<button class="primary-button" type="button" id="adminSendButton" data-admin-action="send">${ADMIN_ICON('chevron-right')}<span>Отправить в Grafio</span></button>` : ''}
        <button class="icon-button" type="button" data-admin-menu="case" aria-label="Действия с кейсом" data-tooltip="Действия с кейсом">${ADMIN_ICON('more')}</button>
      </div>` : ''}
    </div>
    <div class="case-row"><p>${escapeDashboardText(item.summary)}</p>
      ${editable ? (canSend ? `<p class="case-gate" id="adminSendNote">${ADMIN_ICON('info')}<span></span></p>` : canRequest ? `<p class="case-locked">${ADMIN_ICON('lock')}Роль «${ADMIN_ROLES[viewerRole].name}» готовит данные, но не отправляет запросы в Grafio.</p>` : '') : `<p class="case-locked">${ADMIN_ICON('lock')}Роль «${ADMIN_ROLES[viewerRole].name}» видит очередь и историю, но не меняет кейс.</p>`}
    </div>
    <p class="case-signal">${ADMIN_ICON('sparkles')}<span>${item.signal}</span><time>${adminStamp(item.updated)}</time></p>
  </header>`
}

function adminEvidence(item) {
  const tiles = [
    { label: 'Источник', value: item.source },
    { label: 'Обнаружено', value: adminStamp(item.history[0].at) },
  ]
  if (item.kind === 'category') tiles.push({ label: 'Поле WB', value: item.raw.split(' = ')[0], code: true }, { label: 'Исходная сумма', value: adminMoney(item.amount) })
  if (item.kind === 'reconcile') tiles.push({ label: 'Расхождение', value: adminMoney(adminDelta(item) || 0) }, { label: 'Последняя правка', value: adminStamp(item.updated) })
  if (item.kind === 'data') tiles.push({ label: 'Не заполнено', value: `${item.missing.length} поля` }, { label: 'Последняя правка', value: adminStamp(item.updated) })
  if (item.kind === 'rule') tiles.push({ label: 'Кабинеты', value: '2 кабинета WB' }, { label: 'Последняя правка', value: adminStamp(item.updated) })

  const raw = item.kind === 'category'
    ? `<div class="admin-raw"><span>Исходное имя операции WB</span><strong>${escapeDashboardText(item.title.match(/«(.+?)»/)?.[1] || '')}</strong><code>${escapeDashboardText(item.raw)}</code></div>`
    : ''
  // §3.2: для сверки обязательны два сравниваемых значения, разница и текущая методика.
  const compare = item.compare ? `<div class="admin-compare">
      <div class="admin-compare-cell"><span>${item.compare.left.label}</span><strong>${adminSigned(item.compare.left.value)}</strong></div>
      <span class="admin-compare-op">−</span>
      <div class="admin-compare-cell"><span>${item.compare.right.label}</span><strong>${adminSigned(item.compare.right.value)}</strong></div>
    </div>
    <div class="admin-delta${adminDelta(item) ? ' is-risk' : ' is-clear'}"><span>Разница</span><strong>${adminMoney(adminDelta(item) || 0)}</strong><small>${adminDeltaNote(item)}</small></div>
    ${item.methodology ? `<div class="admin-method"><span>Текущая методика</span><strong>${escapeDashboardText(item.methodology)}</strong>${item.resolution ? `<em>опубликована ${item.resolution.version}</em>` : ''}</div>` : ''}`
    : ''
  const affected = item.affected ? `<div class="admin-block"><span class="admin-block-label">Затронутые операции · ${item.affected.length} из ${item.operations}</span>
      <ul class="admin-rows">${item.affected.map(row => `<li><span>${row.name}</span><em>${row.period}</em><b>${adminSigned(row.sum)}</b></li>`).join('')}</ul>
      </div>`
    : ''
  const missing = item.missing ? `<div class="admin-block"><span class="admin-block-label">Чего не хватает</span>
      <ul class="admin-rows">${item.missing.map(row => `<li><span>${row.name}</span><em>Источник</em><b>${row.detail}</b></li>`).join('')}</ul></div>`
    : ''

  return `<section class="case-section"><h3>Доказательства</h3>
    <div class="evidence-grid">${tiles.map(tile => `<div><span>${tile.label}</span>${tile.code ? `<code>${tile.value}</code>` : `<strong>${tile.value}</strong>`}</div>`).join('')}</div>
    ${raw}${compare}${affected}${missing}</section>`
}

// §3.2: для новой операции поле «Почему категория выбрана» и блок «Что увидит Grafio»
// с количеством операций и затронутыми неделями. Без пояснения запрос не уходит (§3.3).
function adminRationaleSection(item) {
  if (item.kind !== 'category') return ''
  return `<section class="case-section"><h3>Почему категория выбрана</h3>
    <label class="field-control"><span class="field-label">Пояснение для Grafio</span>
      <textarea id="adminRationale" rows="2" data-admin-focus="rationale" ${adminCan('comment') ? '' : 'disabled'} placeholder="Например: удержание начислено за хранение на складе WB — расход, который уменьшает маржу">${escapeDashboardText(item.rationale)}</textarea></label>
    <div class="admin-block"><span class="admin-block-label">Что увидит Grafio</span>
      <div class="evidence-grid">
        <div><span>Операций</span><strong>${item.operations}</strong></div>
        <div><span>Затронутые недели</span><strong>${item.weeks.join(', ')}</strong></div>
        <div><span>Категория</span><strong>${escapeDashboardText(item.proposed)}</strong></div>
        <div><span>Сумма</span><strong>${adminMoney(item.amount)}</strong></div>
      </div>
      <p class="admin-note">Отправка фиксирует запрос и контекст. Пересчёт недель выполняет администратор Grafio после публикации правила.</p></div></section>`
}

// Предложение команды читается как текст: редактор глобального правила живёт в Admin Console,
// поэтому поля здесь намеренно readonly — их нельзя ни выбрать, ни переключить.
function adminProposalSection(item) {
  const title = item.kind === 'reconcile' ? 'Предложение по сверке' : item.kind === 'data' ? 'Запрос данных' : item.kind === 'rule' ? 'Предложение по правилу' : 'Предложение команды'
  return `<section class="case-section"><h3>${title}</h3>
    <label>Условие<input value="${escapeDashboardText(item.proposal.condition)}" readonly></label>
    ${item.proposed ? `<p class="admin-proposed">${ADMIN_ICON('sparkles')}Предложенная категория: <strong>${escapeDashboardText(item.proposed)}</strong></p>` : ''}
    <p class="case-rule-note">${escapeDashboardText(item.proposal.note)}</p></section>`
}

function adminGrafioPanel(item) {
  const after = item.check.after
  const sent = item.history.find(entry => entry.action === 'Отправлено в Grafio')
  const r = item.resolution
  const stateText = {
    new: 'Запрос ещё не отправлен: соберите контекст и отправьте кейс в Grafio.',
    blocked: 'Команда собирает недостающие данные — после этого запрос можно отправить.',
    sent: `Запрос отправлен ${sent ? adminStamp(sent.at) : 'ранее'} · проверка выполняется в Grafio.`,
    published: `Опубликовано ${r?.version || ''} · ${r ? adminStamp(r.at) : ''} — закройте кейс у себя.`,
    closed: `Итог зафиксирован версией ${r?.version || ''} · ${r ? adminStamp(r.at) : ''}.`,
  }[item.status]
  return `<aside class="validation-panel">
    <h3>Проверка Grafio</h3>
    <div class="validation-state before"><span>${item.check.beforeLabel}</span><strong>${item.check.before}</strong><small>${item.check.beforeCaption}</small></div>
    <div class="validation-arrow">↓</div>
    <div class="validation-state after${after?.passed ? ' is-passed' : ''}"><span>ПОСЛЕ ПУБЛИКАЦИИ</span><strong>${after ? after.value : 'Не опубликовано'}</strong><small>${after ? after.caption : 'Решение администратора Grafio'}</small></div>
    <p class="publish-note${after?.passed ? ' is-passed' : ''}">${ADMIN_ICON(after?.passed ? 'check' : 'clock')}<span>${stateText}</span></p>
    <p class="case-locked">${ADMIN_ICON('lock')}Раздел не меняет глобальные правила, не публикует методику и не запускает пересчёт — это делает администратор Grafio.</p>
  </aside>`
}

// §3.3: после публикации администратором карточка показывает номер версии, результат сверки
// и выбранный администратором способ применения.
function adminResultSection(item) {
  const r = item.resolution
  if (!r) return ''
  return `<section class="case-section"><h3>Результат</h3>
    <div class="evidence-grid">
      <div><span>Версия методики</span><strong>${r.version}</strong></div>
      <div><span>Результат сверки</span><strong>${escapeDashboardText(r.result)}</strong></div>
      <div><span>Способ применения</span><strong>${escapeDashboardText(r.application)}</strong></div>
      <div><span>Опубликовано</span><strong>${adminStamp(r.at)}</strong></div>
    </div>
    <p class="case-rule-note">${escapeDashboardText(r.note)}</p></section>`
}

function adminActionsRow(item) {
  const buttons = []
  const done = ADMIN_DONE.includes(item.status)
  if (adminCan('assign') && !done && item.owner !== CURRENT_MEMBER) {
    buttons.push(`<button class="secondary-button" type="button" data-admin-action="take">${ADMIN_ICON('shield')}<span>Взять в работу</span></button>`)
  }
  if (adminCan('comment')) {
    buttons.push(`<button class="secondary-button" type="button" data-admin-action="comment">${ADMIN_ICON('sticky')}<span>Добавить комментарий</span></button>`)
  }
  if (adminCan('task') && !done) {
    buttons.push(`<button class="secondary-button" type="button" data-admin-action="task">${ADMIN_ICON('check')}<span>Создать задачу</span></button>`)
  }
  // §3.3: «Закрыть у себя» — только у опубликованного кейса, «Открыть повторно» — у закрытого,
  // и повторный запрос не меняет опубликованную версию методики.
  if (item.status === 'published') {
    buttons.push(`<button class="primary-button" type="button" data-admin-action="close-own">${ADMIN_ICON('check')}<span>Закрыть у себя</span></button>`)
  }
  if (item.status === 'closed' && adminCan('assign')) {
    buttons.push(`<button class="secondary-button" type="button" data-admin-action="reopen">${ADMIN_ICON('rotate-ccw')}<span>Открыть повторно</span></button>`)
  }
  const note = item.status === 'closed' ? `Кейс закрыт ${adminStamp(item.updated)}`
    : item.status === 'published' ? `Опубликовано ${item.resolution.version} · можно закрыть у себя` : ''
  return `<footer class="case-actions">${buttons.join('')}
    ${note ? `<span class="case-actions-note">${ADMIN_ICON('check')}<span>${note}</span></span>` : ''}</footer>`
}

function adminComposer(item) {
  const mode = adminState.composer
  if (!mode || !adminCan('comment', item)) return ''
  const mentions = teamAssignable().filter(member => member.id !== CURRENT_MEMBER)
  return `<div class="admin-composer">
    <label class="field-control"><span class="field-label">${mode === 'data' ? 'Запрос данных · комментарий для команды' : 'Комментарий к кейсу'}</span>
      <textarea id="adminComment" rows="2" data-admin-focus="composer" placeholder="Например: нужны первичные документы по удержанию за 28 апреля">${escapeDashboardText(item.draft || '')}</textarea></label>
    <div class="admin-mentions">${mentions.map(member => `<button type="button" data-admin-mention="${member.id}">@${member.short}</button>`).join('')}<span>упоминание попадёт во вкладку «Активность»</span></div>
    <div class="admin-composer-actions"><button class="secondary-button" type="button" data-admin-action="composer-cancel">Отмена</button><button class="primary-button" type="button" data-admin-action="composer-save">${mode === 'data' ? 'Отправить запрос' : 'Сохранить комментарий'}</button></div>
  </div>`
}

function adminHistory(item) {
  const entries = [...item.history].reverse()
  return `<section class="case-history">
    <button class="case-history-toggle" type="button" data-admin-action="history" aria-expanded="${String(adminState.historyOpen)}">${ADMIN_ICON('clock')}<span>История кейса</span><em>${entries.length}</em>${ADMIN_ICON('chevron-down')}</button>
    <ol class="history-list"${adminState.historyOpen ? '' : ' hidden'}>${entries.map(entry => {
    // §4.5: запись могла прийти из Admin Console — у Grafio нет участника клиентской команды,
    // поэтому подпись и инициал читаются из самой записи.
    const member = teamMember(entry.author)
    return `<li><span class="avatar is-mini">${entry.initials || member?.initials || '—'}</span><div class="history-copy"><strong>${escapeDashboardText(entry.who || memberName(entry.author))}<time>${adminStamp(entry.at)}</time></strong><p><b>${entry.action}</b><span>${escapeDashboardText(entry.note)}</span></p></div></li>`
  }).join('')}</ol>
  </section>`
}

function renderAdminCase() {
  const box = document.getElementById('adminCase')
  if (!box) return
  const item = adminSelectedCase()
  if (!item) {
    box.innerHTML = `<div class="admin-empty case-empty"><span class="plan-empty-icon">${ADMIN_ICON('shield')}</span><h2>Кейс не выбран</h2><p>В очереди нет кейсов под текущий фильтр. Сбросьте фильтры или откройте архив.</p></div>`
    return
  }
  box.innerHTML = `${adminCaseHeader(item)}
    ${adminSteps(item)}
    <div class="case-columns">
      <div class="case-main">${adminEvidence(item)}${adminRationaleSection(item)}${adminProposalSection(item)}${adminResultSection(item)}</div>
      ${adminGrafioPanel(item)}
    </div>
    ${adminActionsRow(item)}${adminComposer(item)}${adminHistory(item)}`
  bindFieldSelects(box)
  // Кнопка «⋯» пересоздаётся вместе с шапкой, а стартовая привязка [data-tooltip] видит
  // только узлы, которые были в DOM на загрузке.
  bindTooltips(box)
  adminUpdateSendGate()
  adminRestoreFocus(false)
}

// Гейт отправки: кнопка «Отправить в Grafio» включается, только когда кейс кому-то назначен и
// (для категоризации) заполнено пояснение. Проверка живёт в одном месте — и в обработчике
// действия, и здесь, — чтобы поле, набранное после отрисовки, не разошлось с состоянием кнопки.
function adminUpdateSendGate() {
  const item = adminSelectedCase()
  const note = document.getElementById('adminSendNote')
  const button = document.getElementById('adminSendButton')
  if (!item || !note || !button) return
  const blockers = adminSendBlockers(item)
  note.classList.toggle('is-passed', blockers.length === 0)
  note.querySelector('span').textContent = blockers.length
    ? `Для отправки: ${blockers.join('; ')}`
    : 'Все данные собраны — запрос можно отправить в Grafio'
  button.disabled = blockers.length > 0
}

function renderAdmin() {
  renderAdminQueue()
  renderAdminCase()
  // Панель команды показывает тот же поток задач и активности, что и очередь кейсов, поэтому
  // любое действие по кейсу перерисовывает её, а не ждёт повторного открытия. Счётчик в тулбаре
  // обязан обновляться и при закрытой панели: иначе действие в очереди не двигает бейдж, и
  // пользователь узнаёт о новой задаче только после того, как сам откроет панель.
  renderTeamBadges()
  if (teamState.open) renderTeamPanel()
}

let adminMenuTrigger = null
// Сущность открытого меню: задача панели команды не лежит в состоянии очереди, и пункты
// вложенного меню «Назначить на…» должны относиться именно к ней.
let adminMenuSubject = null

function closeAdminMenu({ restoreFocus = false } = {}) {
  const menu = document.getElementById('adminActionMenu')
  if (!menu) return
  const wasOpen = menu.classList.contains('is-open')
  menu.classList.remove('is-open')
  menu.setAttribute('aria-hidden', 'true')
  document.querySelectorAll('[data-admin-menu][aria-expanded="true"]').forEach(node => node.setAttribute('aria-expanded', 'false'))
  // Триггер живёт в перерисованном контейнере и мог быть заменён: старый узел detached,
  // и focus() на нём вернул бы фокус в никуда.
  if (restoreFocus && wasOpen && adminMenuTrigger?.isConnected) adminMenuTrigger.focus()
  adminMenuTrigger = null
  adminState.menu = null
}

function adminMenuMarkup(rows) {
  return `<header class="popover-header"><span>${rows.kicker}</span><strong>${rows.title}</strong></header><div class="popover-options">${rows.items.join('')}</div>`
}

// Один слой меню обслуживает очередь кейсов (§3.2) и панель команды (§4.3), поэтому сущность
// берётся из атрибута триггера, а не из состояния очереди: у задачи и участника свой id.
function adminMenuEntity(kind, trigger) {
  if (kind === 'team-member') return teamMember(trigger.dataset.teamMember)
  if (kind === 'team-task' || kind === 'task-owner') return adminTaskById(trigger.dataset.teamTask)
  return adminSelectedCase()
}

// «Тот же самый триггер» тоже определяется сущностью: два ⋯ на разных строках задач — разные
// слои, и повторный клик обязан переносить меню, а не сворачивать чужое.
const adminMenuKey = (kind, trigger) => `${kind}:${trigger.dataset.teamTask || trigger.dataset.teamMember || adminState.selected || ''}`

function adminMenuContent(kind, item) {
  const row = ({ value, label, note, current, mark }) => `<button role="menuitemradio" aria-checked="${String(Boolean(current))}" data-admin-pick="${kind}:${value}">${mark}<span>${label}</span>${note ? `<em>${note}</em>` : ''}${current ? ADMIN_ICON('check') : ''}</button>`
  if (kind === 'assign') {
    return adminMenuMarkup({
      kicker: 'ОТВЕТСТВЕННЫЙ',
      title: 'Назначить участника',
      items: teamAssignable().map(member => row({ value: member.id, label: member.name, note: ADMIN_ROLES[member.role].name, current: item.owner === member.id, mark: `<span class="avatar is-mini">${member.initials}</span>` })),
    })
  }
  // Меню «Статус» из шапки убрано по §3.3: статус клиентского кейса — следствие действий
  // (назначение, запрос данных, отправка, публикация Grafio), а не переключатель.
  if (kind === 'team-member') {
    return adminMenuMarkup({
      kicker: 'УЧАСТНИК',
      title: item.name,
      // Значения пика различают пункты: у row() kind один и тот же, и обе строки свернулись бы
      // в «member-cases:<id>» — «Показать задачи» тогда молча фильтровал бы очередь.
      items: [
        `<button role="menuitem" data-admin-pick="member-cases:${item.id}">${ADMIN_ICON('compare')}Показать кейсы в очереди</button>`,
        `<button role="menuitem" data-admin-pick="member-tasks:${item.id}">${ADMIN_ICON('check')}Показать задачи участника</button>`,
      ],
    })
  }
  if (kind === 'team-task') {
    return adminMenuMarkup({
      kicker: 'ЗАДАЧА',
      title: `${item.id} · ${item.done ? 'выполнена' : 'в работе'}`,
      items: [
        `<button role="menuitem" data-admin-action="task-toggle" data-team-task="${item.id}">${ADMIN_ICON('check')}${item.done ? 'Вернуть в работу' : 'Отметить выполненной'}</button>`,
        `<button role="menuitem" data-admin-menu="task-owner" data-team-task="${item.id}" aria-haspopup="menu" aria-expanded="false">${ADMIN_ICON('user')}Назначить на…${ADMIN_ICON('chevron-down')}</button>`,
        `<span class="menu-sep"></span>`,
        item.caseId
          ? `<button role="menuitem" data-admin-action="task-case" data-team-task="${item.id}">${ADMIN_ICON('shield')}Открыть кейс ${item.caseId}</button>`
          : `<button role="menuitem" data-admin-action="task-source" data-team-task="${item.id}">${ADMIN_ICON('layout')}Открыть лист «${escapeDashboardText(item.sheetName)}»</button>`,
      ],
    })
  }
  if (kind === 'task-owner') {
    return adminMenuMarkup({
      kicker: 'ОТВЕТСТВЕННЫЙ',
      title: `Задача ${item.id}`,
      items: teamAssignable().map(member => row({ value: member.id, label: member.name, note: ADMIN_ROLES[member.role].name, current: item.assignee === member.id, mark: `<span class="avatar is-mini">${member.initials}</span>` })),
    })
  }
  return `<button role="menuitem" data-admin-action="link">${ADMIN_ICON('link')}Скопировать ссылку</button>
    <button role="menuitem" data-admin-action="duplicate">${ADMIN_ICON('copy')}Пометить как дубликат</button>
    <span class="menu-sep"></span>
    <button class="danger" role="menuitem" data-admin-action="archive">${ADMIN_ICON('trash')}Архивировать</button>`
}

function openAdminMenu(kind, trigger) {
  const menu = document.getElementById('adminActionMenu')
  const item = adminMenuEntity(kind, trigger)
  if (!menu || !item) return
  closeAdminMenu()
  closeFieldSelect()
  closeContextMenu()
  closeStudioLayers()
  adminMenuTrigger = trigger
  adminMenuSubject = item
  adminState.menu = adminMenuKey(kind, trigger)
  menu.innerHTML = adminMenuContent(kind, item)
  menu.setAttribute('aria-hidden', 'false')
  menu.classList.add('is-open')
  placeStudioMenu(menu, trigger)
  trigger.setAttribute('aria-expanded', 'true')
}

const ADMIN_ACTIONS = {
  take(item) {
    if (!item) return
    // §3.3: «Взять в работу» назначает текущего сотрудника клиентской команды и не меняет
    // статус: путь кейса описывает запрос в Grafio, а не факт, что кейс кто-то открыл.
    item.owner = CURRENT_MEMBER
    adminLog(item, 'Назначение', `${memberName(CURRENT_MEMBER)} взял(а) кейс в работу`)
    adminActivityPush('assign', `Кейс ${item.id} взят в работу`, item)
    renderAdmin()
    showToast('Кейс взят в работу', `Ответственный — ${memberName(CURRENT_MEMBER)}`)
  },
  request(item) {
    if (!item) return
    adminState.composer = 'data'
    if (item.status === 'new') {
      item.status = 'blocked'
      adminLog(item, 'Запрос данных', 'Кейс переведён в «Нужны данные» внутри команды клиента')
      adminActivityPush('data', `Запрошены данные по кейсу ${item.id}`, item)
    }
    // Фокус возвращаем до перерисовки: renderAdminCase сам вызывает adminRestoreFocus.
    adminFocusKey = 'composer'
    renderAdmin()
  },
  send(item) {
    if (!item) return
    const blockers = adminSendBlockers(item)
    if (blockers.length) {
      showToast('Запрос не отправлен', `Для отправки: ${blockers.join('; ')}`)
      return
    }
    item.status = 'sent'
    adminLog(item, 'Отправлено в Grafio', 'Запрос с контекстом команды отправлен на проверку · пересчёт не выполнялся')
    adminActivityPush('status', `Кейс ${item.id} отправлен в Grafio`, item)
    renderAdmin()
    showToast('Запрос отправлен', `${item.id} · «Отправлено Grafio» видно в очереди и в истории`)
  },
  'close-own'(item) {
    if (!item || item.status !== 'published') return
    item.status = 'closed'
    adminLog(item, 'Закрытие у себя', `Кейс закрыт клиентской командой · опубликовано ${item.resolution.version}`)
    adminActivityPush('resolve', `Кейс ${item.id} закрыт у себя`, item)
    renderAdmin()
    showToast('Кейс закрыт у себя', `${item.id} · версия методики ${item.resolution.version} не менялась`)
  },
  reopen(item) {
    if (!item || item.status !== 'closed') return
    // Повторный запрос — не откат публикации: версия методики остаётся прежней, а кейс снова
    // уходит в Grafio с тем же контекстом команды.
    item.status = 'sent'
    adminLog(item, 'Повторный запрос', 'Открыт повторный запрос в Grafio · опубликованная версия методики не изменена')
    adminActivityPush('status', `Кейс ${item.id} открыт повторно`, item)
    consoleOnReopen(item)
    renderAdmin()
    showToast('Повторный запрос отправлен', `${item.id} · «Отправлено Grafio», правило не менялось`)
  },
  task(item) {
    if (!item) return
    const assignee = item.owner || CURRENT_MEMBER
    const task = { id: `T-${adminTaskSeq++}`, title: item.title, caseId: item.id, assignee, due: 'Сегодня', done: false, seen: teamWatched('tasks'), at: adminNow() }
    adminTasks.unshift(task)
    adminLog(item, 'Задача', `Создана задача по кейсу · срок «сегодня», ответственный ${memberName(assignee)}`)
    adminActivityPush('task', `Задача «${task.title}» назначена ${memberName(assignee)}`, item)
    renderAdmin()
    showToast('Задача создана', `Срок — сегодня · ${memberName(assignee)} · ${task.id}`)
  },
  'task-toggle'(task) {
    if (!task) return
    task.done = !task.done
    task.seen = true
    const item = adminCaseById(task.caseId)
    if (item) adminLog(item, 'Задача', `Задача ${task.id} ${task.done ? 'отмечена выполненной' : 'вернута в работу'}`)
    adminActivityPush('task', `Задача «${task.title}» ${task.done ? 'выполнена' : 'снова в работе'}`, item)
    closeAdminMenu()
    renderAdmin()
    showToast(task.done ? 'Задача выполнена' : 'Задача в работе', `${task.id} · ${task.title}`)
  },
  'task-case'(task) {
    if (!task?.caseId) return
    closeAdminMenu()
    teamOpenCase(task.caseId)
  },
  'task-source'(task) {
    if (!task) return
    closeAdminMenu()
    teamOpenSource(task)
  },
  link(item) {
    if (!item) return
    closeAdminMenu()
    showToast('Ссылка скопирована', `#admin/${item.id} · демонстрационная ссылка кейса`)
  },
  duplicate(item) {
    if (!item) return
    const other = ADMIN_CASES.find(candidate => candidate.id !== item.id && candidate.kind === item.kind && !candidate.archived)
    item.duplicateOf = other?.id || null
    item.archived = true
    adminLog(item, 'Дубликат', other ? `Кейс помечен как дубликат ${other.id} и убран из очереди` : 'Кейс помечен как дубликат и убран из очереди')
    closeAdminMenu()
    adminState.selected = adminVisibleCases()[0]?.id || null
    renderAdmin()
    showToast('Помечен как дубликат', other ? `Оригинал — ${other.id}, кейс перенесён в архив` : 'Кейс перенесён в архив')
  },
  archive(item) {
    if (!item) return
    item.archived = true
    adminLog(item, 'Архив', 'Кейс убран из очереди')
    closeAdminMenu()
    adminState.selected = adminVisibleCases()[0]?.id || null
    renderAdmin()
    showToast('Кейс в архиве', 'Очередь обновлена · архив доступен переключателем')
  },
  'archive-toggle'() {
    adminState.showArchived = !adminState.showArchived
    adminFocusKey = 'archive-toggle'
    renderAdmin()
  },
  'reset-filters'() {
    adminResetFilters()
    showToast('Фильтры сброшены', 'В очереди снова все кейсы отчётной недели')
  },
  history() {
    adminState.historyOpen = !adminState.historyOpen
    renderAdminCase()
  },
  comment(item) {
    if (!item) return
    adminState.composer = 'comment'
    adminFocusKey = 'composer'
    renderAdminCase()
  },
  'composer-cancel'() {
    const item = adminSelectedCase()
    if (item) item.draft = ''
    adminState.composer = null
    renderAdminCase()
  },
  'composer-save'(item) {
    if (!item) return
    const text = (item.draft || '').trim()
    if (!text) {
      showToast('Комментарий пустой', 'Введите текст или отмените добавление')
      return
    }
    const mentioned = ADMIN_TEAM.filter(member => text.includes(`@${member.short}`)).map(member => member.id)
    item.comments += 1
    adminLog(item, 'Комментарий', text)
    adminActivityPush('comment', text, item, mentioned)
    item.draft = ''
    adminState.composer = null
    renderAdmin()
    showToast('Комментарий добавлен', mentioned.length ? `Упомянуты: ${mentioned.map(memberName).join(', ')}` : 'Он виден в истории кейса и в «Активности»')
  },
}

function adminActivityPush(kind, text, item = null, mentioned = []) {
  adminActivity.unshift({ at: adminNow(), kind, text, author: CURRENT_MEMBER, caseId: item?.id || null, mentioned, seen: teamWatched('activity') })
}

function adminPick(pick) {
  const [kind, value] = pick.split(':')
  // Командные пункты меню относятся к задаче или участнику, а не к выбранному кейсу очереди.
  if (kind === 'task-owner') {
    const task = adminMenuSubject
    if (!task || !adminTaskById(task.id)) { closeAdminMenu(); return }
    if (task.assignee === value) {
      closeAdminMenu({ restoreFocus: true })
      return
    }
    task.assignee = value
    task.seen = false
    const item = adminCaseById(task.caseId)
    if (item) adminLog(item, 'Задача', `Задача ${task.id} переназначена на ${memberName(value)}`)
    adminActivityPush('assign', `Задача «${task.title}» переназначена на ${memberName(value)}`, item)
    closeAdminMenu()
    renderAdmin()
    showToast('Задача переназначена', `${task.id} · ${memberName(value)}`)
    return
  }
  if (kind === 'member-cases') {
    adminState.filters.owner = value
    adminState.mineOnly = false
    closeAdminMenu()
    switchView('admin')
    renderAdmin()
    showToast('Очередь отфильтрована', `Кейсы ${memberName(value)} · сброс — кнопкой «Сбросить фильтры»`)
    return
  }
  if (kind === 'member-tasks') {
    closeAdminMenu()
    openTeamPanel()
    teamState.owner = value
    setTeamTab('tasks')
    return
  }

  const item = adminSelectedCase()
  if (!item) return
  // В очереди кейсов из pick-слоёв осталось только назначение: статуса-переключателя больше нет.
  if (kind === 'assign') {
    item.owner = value
    adminLog(item, 'Назначение', `Ответственный — ${memberName(value)}`)
    adminActivityPush('assign', `Кейс ${item.id} назначен ${memberName(value)}`, item)
    adminFocusKey = null
  }
  closeAdminMenu()
  renderAdmin()
}

function adminResetFilters() {
  adminState.search = ''
  adminState.filters = { status: '', kind: '', owner: '' }
  adminState.mineOnly = false
  renderAdmin()
}

const adminView = document.getElementById('adminView')

function adminClick(event) {
  const row = event.target.closest('[data-admin-case]')
  if (row) {
    adminState.selected = row.dataset.adminCase
    adminState.composer = null
    renderAdmin()
    return
  }
  const menuTrigger = event.target.closest('[data-admin-menu]')
  if (menuTrigger) {
    const key = adminMenuKey(menuTrigger.dataset.adminMenu, menuTrigger)
    if (adminState.menu === key) closeAdminMenu({ restoreFocus: true })
    else openAdminMenu(menuTrigger.dataset.adminMenu, menuTrigger)
    return
  }
  const pick = event.target.closest('[data-admin-pick]')
  if (pick) {
    adminPick(pick.dataset.adminPick)
    return
  }
  const mention = event.target.closest('[data-admin-mention]')
  if (mention) {
    const item = adminSelectedCase()
    const area = document.getElementById('adminComment')
    const member = teamMember(mention.dataset.adminMention)
    if (item && area && member) {
      area.value = `${area.value.replace(/\s+$/, '')}${area.value.trim() ? ' ' : ''}@${member.short} `
      item.draft = area.value
      area.focus()
      area.setSelectionRange(area.value.length, area.value.length)
    }
    return
  }
  const action = event.target.closest('[data-admin-action]')
  if (!action) return
  // Действие относится либо к кейсу очереди, либо к задаче панели команды: сущность берётся из
  // атрибута строки меню, а не из состояния очереди.
  ADMIN_ACTIONS[action.dataset.adminAction]?.(action.dataset.teamTask ? adminTaskById(action.dataset.teamTask) : adminSelectedCase(), action)
}

adminView.addEventListener('click', adminClick)
document.getElementById('adminActionMenu').addEventListener('click', adminClick)

adminView.addEventListener('input', event => {
  const item = adminSelectedCase()
  if (event.target.id === 'adminSearch') {
    adminState.search = event.target.value
    renderAdmin()
  } else if (event.target.id === 'adminRationale' && item) {
    // Пересобирать карточку на каждый символ нельзя — поле потеряло бы фокус, поэтому
    // обновляется только состояние и гейт кнопки «Отправить в Grafio».
    item.rationale = event.target.value
    adminUpdateSendGate()
  } else if (event.target.id === 'adminComment' && item) {
    item.draft = event.target.value
  }
})

adminView.addEventListener('change', event => {
  if (event.target.id !== 'adminMineOnly') return
  adminState.mineOnly = event.target.checked
  renderAdmin()
})

// Выбор фильтра приходит событием от общего примитива .field-select (§3.1). Полей правила
// здесь больше нет: редактор глобального правила — в Admin Console (§4.4).
adminView.addEventListener('fieldselect', event => {
  const filter = event.target.closest('[data-admin-filter]')
  if (!filter) return
  adminState.filters[filter.dataset.adminFilter] = event.detail.value
  adminFocusKey = `filter:${filter.dataset.adminFilter}`
  closeFieldSelect()
  renderAdmin()
})

/* ── §4 Внутренняя Admin Console Grafio ────────────────────────────────────────
   Отдельная полноэкранная среда администрации: не раздел sidebar и не canvas
   (§4.1–§4.2). Очередь консоли выводится из клиентских кейсов — запрос, отправленный
   в «Контроле расчётов», обязан появиться у администратора без отдельных вызовов,
   поэтому запись консоли создаётся лениво по id кейса и дальше живёт своей жизнью.
   Настоящих пересчётов нет (§4.5): меняются статус, черновик правила и явно
   подписанный демонстрационный результат сверки. */

const AC_CATEGORIES = ['Хранение', 'Логистика', 'Комиссия WB', 'Штрафы и удержания', 'Возвраты', 'Прочее']
const AC_CALC_TYPES = ['Расход', 'Доход', 'Техническая операция', 'Компенсация']
const AC_APPLICATIONS = { history: 'Пересчитать историю', forward: 'Применять вперёд' }
const AC_AUTHOR = 'Администратор Grafio'
// Версия методики на момент демо: v3 закрыла кейс Q-31 (§3.3), следующая публикация — v4.
const AC_METHOD = { version: 3 }
const AC_DATE_DEFAULT = '2026-05-04'

// Набор статусов консоли (§4.3) отличается от клиентского: администратор видит очередь
// заявок, а не путь запроса в Grafio, — «В работе» здесь заменяет «Проверяется».
const CONSOLE_STATUSES = {
  new: { label: 'Новая', badge: 'is-new' },
  checking: { label: 'Проверяется', badge: 'is-checking' },
  'need-data': { label: 'Нужны данные от клиента', badge: 'is-blocked' },
  ready: { label: 'Готово к публикации', badge: 'is-ready' },
  published: { label: 'Опубликовано', badge: 'is-published' },
}
// Клиентский кейс попадает в очередь Grafio только после отправки запроса (§3.3).
const CONSOLE_FROM_CLIENT = { sent: 'new', published: 'published', closed: 'published' }
// Юрлицо очереди: поиск §4.3 обязан находить заятку и по операции, и по организации.
const AC_COMPANY_BY_SOURCE = {
  'Основной кабинет': 'ИП Верена А. В.',
  'Север': 'ООО «Верена»',
  'Все кабинеты WB': 'ИП Верена А. В. и ООО «Верена»',
}
const AC_SIMILAR = {
  category: [
    { name: 'Корректировка тарифа хранения', period: '2–8 марта', sum: -1180 },
    { name: 'Корректировка тарифа хранения', period: '9–15 марта', sum: -2140 },
  ],
  reconcile: [
    { name: 'Расхождение по комиссии', period: '13–19 апреля', sum: 4120 },
    { name: 'Корректировка хранения', period: '20 апр. – 26 апр.', sum: -840 },
  ],
  rule: [
    { name: 'Комиссия WB 19%', period: 'март 2026', sum: -289400 },
    { name: 'Комиссия WB 19%', period: 'апрель 2026', sum: -311240 },
  ],
  data: [],
}

const consoleState = { open: false, selected: null, search: '', filters: { status: '', kind: '', priority: '' }, needPublish: false, historyOpen: true, queueCollapsed: false }
const consoleStore = {}
let consoleFocusKey = null

// Одна форма записи у клиентских и системных заявок: работа администратора не должна
// ветвиться по происхождению запроса.
function acBlank(over) {
  return Object.assign({
    id: '', origin: 'system', caseId: null, kind: 'category', priority: 'normal', status: 'new',
    title: '', company: '', source: '', operations: 0, amount: null, fields: [], affected: [], weeks: [],
    compare: null, currentCategory: 'Без категории', proposedCategory: '', checked: false,
    rule: { name: '', category: '', calcType: AC_CALC_TYPES[0], comment: '' },
    scope: 'all', market: 'WB', application: '', effectiveDate: AC_DATE_DEFAULT, refusal: '',
    published: null, history: [],
  }, over)
}

const acCompanyOf = item => AC_COMPANY_BY_SOURCE[item.source.split(' · ')[0]] || 'ИП Верена А. В.'

function acFieldsOf(item) {
  const fields = [{ label: 'Источник', value: item.source }]
  if (item.raw) {
    const [key, value] = item.raw.split(' = ')
    fields.push({ label: key, value, code: true })
  }
  if (item.missing) fields.push({ label: 'Не заполнено', value: item.missing.map(row => row.name).join(', ') })
  fields.push({ label: 'Операций', value: String(item.operations || item.affected?.length || 1) })
  fields.push({ label: 'Недель', value: String((item.weeks || []).length) })
  return fields
}

// Заявка консоли из клиентского кейса. Сверка берётся из compare клиента, а для кейсов без
// сравнения считается «выгрузка ↔ расчёт по правилу»: до публикации Grafio не видит этих
// операций вообще, поэтому вторая сторона равна нулю. pre хранит значение «до проверки» —
// повторный запрос клиента откатывает сверку, но не опубликованную версию методики.
function acRecordOfCase(item) {
  if (consoleStore[item.id]) return consoleStore[item.id]
  const published = item.resolution
  const base = item.compare
    ? { wbLabel: item.compare.left.label, wb: item.compare.left.value, grafioLabel: item.compare.right.label, pre: item.compare.right.value }
    : item.kind === 'rule'
      // Правило без денежной суммы тоже должно сводиться: иначе «Опубликовать» не открылась бы никогда.
      ? { wbLabel: 'Комиссия по выгрузке WB', wb: -326780, grafioLabel: 'Комиссия в расчёте Grafio', pre: -310440 }
      : item.amount === null
        ? null
        : { wbLabel: 'Сумма по выгрузке WB', wb: -Math.abs(item.amount), grafioLabel: 'Расчёт Grafio по правилу', pre: 0 }
  const compare = base ? { ...base, grafio: published ? base.wb : base.pre } : null
  const sent = item.history.find(entry => entry.action === 'Отправлено в Grafio')
  const member = teamMember(item.owner)
  consoleStore[item.id] = acBlank({
    id: item.id,
    origin: 'client',
    caseId: item.id,
    kind: item.kind,
    priority: item.priority,
    status: published ? 'published' : CONSOLE_FROM_CLIENT[item.status] || 'new',
    title: item.title,
    company: acCompanyOf(item),
    source: item.source,
    operations: item.operations || (item.affected?.length || (item.missing?.length ? 12 : 1)),
    amount: item.amount,
    fields: acFieldsOf(item),
    affected: item.affected || [],
    weeks: [...(item.weeks || [])],
    compare,
    currentCategory: item.kind === 'category' ? 'Без категории' : item.kind === 'rule' ? 'Комиссия WB' : 'Действующее правило',
    proposedCategory: item.proposed || '',
    checked: Boolean(published),
    rule: {
      name: item.kind === 'category' ? (item.title.match(/«(.+?)»/)?.[1] || item.title) : item.title,
      category: item.proposed || (item.kind === 'rule' ? 'Комиссия WB' : ''),
      calcType: item.kind === 'category' ? 'Расход' : AC_CALC_TYPES[0],
      comment: item.rationale || item.proposal.note,
    },
    application: published && item.resolution.application === 'Применять вперёд' ? 'forward' : published ? 'history' : '',
    published: published ? { version: published.version, at: published.at, result: published.result } : null,
    history: [{
      at: sent ? sent.at : item.updated,
      who: member ? member.name : 'Клиент',
      initials: member ? member.initials : 'К',
      action: 'Запрос получен',
      note: `${item.id} · ${ADMIN_TYPES[item.kind].label} · ${acCompanyOf(item)}`,
    }],
  })
  return consoleStore[item.id]
}

const AC_SYSTEM = [
  acBlank({
    id: 'S-14', kind: 'reconcile', priority: 'high', status: 'ready',
    title: 'Расхождение по удержанию за брак',
    company: 'ИП Верена А. В.', source: 'Автопроверка Grafio · 27 апр. – 3 мая',
    operations: 7, amount: 3260,
    fields: [{ label: 'Источник', value: 'Автопроверка Grafio' }, { label: 'Признак', value: 'defect_retention_hold', code: true }, { label: 'Операций', value: '7' }, { label: 'Недель', value: '1' }],
    affected: [{ name: 'Удержание за брак', period: '27 апр. – 3 мая', sum: -3260 }],
    weeks: ['27 апр. – 3 мая'],
    compare: { wbLabel: 'Оборот по кабинету WB', wb: 1284560, grafioLabel: 'Оборот по данным Grafio', pre: 1281300, grafio: 1284560 },
    currentCategory: 'Штрафы и удержания', proposedCategory: 'Удержание за брак', checked: true,
    rule: { name: 'Удержание за брак', category: 'Штрафы и удержания', calcType: 'Расход', comment: 'Удержание начислено WB, подтверждается детализацией недели.' },
    scope: 'market', application: 'history',
    history: [
      { at: adminDate('2026-05-02T11:20:00'), who: 'Сверка Grafio', initials: 'ГР', action: 'Заявка создана', note: 'Автоматическая сверка недели нашла unmatched-удержание' },
      { at: adminDate('2026-05-02T11:45:00'), who: AC_AUTHOR, initials: 'ГР', action: 'Черновик правила сохранён', note: 'Категория «Штрафы и удержания», пересчёт истории' },
      { at: adminDate('2026-05-02T12:05:00'), who: AC_AUTHOR, initials: 'ГР', action: 'Контрольная сверка выполнена', note: 'Разница 0\u00A0₽ · расчёт Grafio совпал с выгрузкой' },
    ],
  }),
  acBlank({
    id: 'S-11', kind: 'category', priority: 'normal', status: 'new',
    title: 'Новое удержание WB «Обратная логистика»',
    company: 'ООО «Верена»', source: 'Кабинет WB № 103287 · 20 апр. – 26 апр.',
    operations: 11, amount: 5410,
    fields: [{ label: 'Источник', value: 'Кабинет WB № 103287' }, { label: 'supplierOperName', value: 'reverse_logistics_charge', code: true }, { label: 'Операций', value: '11' }, { label: 'Недель', value: '2' }],
    affected: [{ name: 'Обратная логистика', period: '20 апр. – 26 апр.', sum: -3180 }, { name: 'Обратная логистика', period: '13–19 апреля', sum: -2230 }],
    weeks: ['13–19 апреля', '20 апр. – 26 апр.'],
    compare: { wbLabel: 'Сумма по выгрузке WB', wb: -5410, grafioLabel: 'Расчёт Grafio по правилу', pre: 0, grafio: 0 },
    currentCategory: 'Без категории',
    rule: { name: 'Обратная логистика', category: '', calcType: 'Расход', comment: '' },
    history: [{ at: adminDate('2026-04-27T08:05:00'), who: 'Сверка Grafio', initials: 'ГР', action: 'Заявка создана', note: 'Вид операции отсутствует в справочнике категорий' }],
  }),
  acBlank({
    id: 'S-08', kind: 'rule', priority: 'low', status: 'checking',
    title: 'Ставка комиссии WB с 1 мая',
    company: 'ИП Верена А. В. и ООО «Верена»', source: 'Все кабинеты WB · с 01.05.2026',
    operations: 426, amount: null,
    fields: [{ label: 'Источник', value: 'Все кабинеты WB' }, { label: 'Параметр', value: 'commission_rate', code: true }, { label: 'Операций', value: '426' }, { label: 'Недель', value: '5' }],
    affected: [{ name: 'Комиссия WB', period: 'март 2026', sum: -289400 }, { name: 'Комиссия WB', period: 'апрель 2026', sum: -311240 }],
    weeks: ['с 01.05.2026', '04–10 мая', '11–17 мая', '18–24 мая', '25–31 мая'],
    compare: { wbLabel: 'Комиссия по выгрузке WB', wb: -326780, grafioLabel: 'Комиссия в расчёте Grafio', pre: -310440, grafio: -310440 },
    currentCategory: 'Комиссия WB', proposedCategory: 'Комиссия WB',
    rule: { name: 'Комиссия WB', category: 'Комиссия WB', calcType: 'Расход', comment: 'WB опубликовал ставку 20% с 01.05.2026.' },
    scope: 'all', application: 'forward', effectiveDate: '2026-05-01',
    refusal: 'Новая ставка действует с 01.05.2026: апрельские недели закрыты актом сверки, пересчёт задним числом невозможен.',
    history: [
      { at: adminDate('2026-04-30T10:10:00'), who: 'Сверка Grafio', initials: 'ГР', action: 'Заявка создана', note: 'Новая ставка комиссии в справочнике WB' },
      { at: adminDate('2026-04-30T14:30:00'), who: AC_AUTHOR, initials: 'ГР', action: 'Черновик правила сохранён', note: 'Применять вперёд с 01.05.2026' },
    ],
  }),
]

const consoleRecords = () => [
  ...ADMIN_CASES.filter(item => !item.archived && (consoleStore[item.id] || CONSOLE_FROM_CLIENT[item.status])).map(acRecordOfCase),
  ...AC_SYSTEM,
]

const acSelected = () => consoleRecords().find(record => record.id === consoleState.selected) || null
const acDelta = record => (record.compare ? Math.abs(record.compare.wb - record.compare.grafio) : 0)
// §4.4: «Опубликовать» остаётся недоступной, пока есть хоть одно незакрытое условие,
// и объяснение показывается рядом с кнопкой, а не спрятано в toast.
const acBlockers = record => {
  const blockers = []
  if (!record.rule.category) blockers.push('не выбрана категория операции')
  if (!record.application) blockers.push('не выбран способ применения')
  if (record.application === 'forward' && !record.refusal.trim()) blockers.push('нет причины отказа от пересчёта истории')
  if (!record.compare) blockers.push('данных для контрольной сверки нет')
  else if (acDelta(record)) blockers.push(`сверка не сошлась: разница ${adminMoney(acDelta(record))}`)
  return blockers
}
const acNeedsPublish = record => record.status !== 'published' && acBlockers(record).length === 0
const acPush = (record, action, note) => record.history.push({ at: adminNow(), who: AC_AUTHOR, initials: 'ГР', action, note })

function acVisibleRecords() {
  const query = consoleState.search.trim().toLowerCase()
  return consoleRecords().filter(record => {
    if (consoleState.needPublish && !acNeedsPublish(record)) return false
    if (consoleState.filters.status && record.status !== consoleState.filters.status) return false
    if (consoleState.filters.kind && record.kind !== consoleState.filters.kind) return false
    if (consoleState.filters.priority && record.priority !== consoleState.filters.priority) return false
    if (query && !`${record.id} ${record.title} ${record.company}`.toLowerCase().includes(query)) return false
    return true
  })
}

function acFilterControl(key, label, options) {
  const current = consoleState.filters[key] || ''
  const active = options.find(option => option.value === current) || options[0]
  return `<div class="field-control admin-filter"><span class="field-label">${label}</span>
    <div class="field-select" data-ac-filter="${key}">
      <button class="field-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" data-ac-focus="filter:${key}"><span>${active.label}</span>${ADMIN_ICON('chevron-down')}</button>
      <div class="field-select-popover" role="listbox" aria-label="${label}">${options.map(option => `<button type="button" role="option" data-value="${option.value}" aria-selected="${String(option.value === active.value)}">${option.label}${ADMIN_ICON('check')}</button>`).join('')}</div>
    </div></div>`
}

const acFilterOptions = values => [{ value: '', label: 'Любой' }, ...values]

function acQueueItem(record) {
  const status = CONSOLE_STATUSES[record.status]
  return `<button class="queue-item${record.id === consoleState.selected ? ' is-active' : ''}" type="button" data-ac-record="${record.id}" aria-current="${String(record.id === consoleState.selected)}">
    <span class="queue-icon ${record.status === 'published' ? 'good' : record.priority === 'high' ? 'danger' : 'warning'}">${ADMIN_ICON(ADMIN_TYPES[record.kind].icon)}</span>
    <span class="queue-copy"><strong>${record.id} · ${escapeDashboardText(record.title)}</strong>
      <small>${ADMIN_TYPES[record.kind].label} · ${escapeDashboardText(record.company)}</small></span>
    <span class="queue-badges">
      <span class="admin-badge ${status.badge}">${status.label}</span>
      <span class="admin-badge is-prio-${record.priority}">${ADMIN_PRIORITIES[record.priority]}</span>
      <span class="admin-badge ${record.origin === 'client' ? 'is-client' : 'is-system'}">${record.origin === 'client' ? `из ${record.caseId}` : 'Система'}</span>
    </span>
    <b>${record.amount === null ? '—' : adminMoney(record.amount)}</b>
  </button>`
}

const acGateText = record => {
  const blockers = acBlockers(record)
  return blockers.length ? `Для публикации: ${blockers.join('; ')}` : 'Все условия выполнены — правило можно опубликовать'
}

function renderAcFilters() {
  const box = document.getElementById('acFilters')
  box.innerHTML = [
    acFilterControl('status', 'Статус', acFilterOptions(Object.entries(CONSOLE_STATUSES).map(([value, meta]) => ({ value, label: meta.label })))),
    acFilterControl('kind', 'Тип', acFilterOptions(Object.entries(ADMIN_TYPES).map(([value, meta]) => ({ value, label: meta.label })))),
    acFilterControl('priority', 'Приоритет', acFilterOptions(Object.entries(ADMIN_PRIORITIES).map(([value, label]) => ({ value, label })))),
  ].join('')
  bindFieldSelects(box)
}

// Поиск печатается по полю в шапке консоли, поэтому список перерисовывается отдельно от
// фильтров: перестановка поповеров на каждый символ уносила бы открытый список.
function renderAcQueueList() {
  const list = document.getElementById('acQueueList')
  if (!list) return
  const records = acVisibleRecords()
  const total = consoleRecords().length
  const ready = consoleRecords().filter(acNeedsPublish).length
  const published = consoleRecords().filter(record => record.status === 'published').length
  document.getElementById('acQueueMeta').textContent = `Показано ${records.length} из ${total}`
  document.getElementById('acNeedCount').textContent = String(ready)
  document.getElementById('acQueueFoot').innerHTML = `<span class="status-light good"></span><span>${published} ${pluralizeDashboard(published, ['заявка опубликована', 'заявки опубликованы', 'заявок опубликовано'])} · ${ready} ${pluralizeDashboard(ready, ['требует публикации', 'требуют публикации', 'требуют публикации'])}</span>`
  list.innerHTML = records.length ? records.map(acQueueItem).join('') : `<div class="admin-empty"><span class="plan-empty-icon">${ADMIN_ICON('filter')}</span><h2>Ничего не найдено</h2><p>Под фильтр очереди не попал ни один запрос. Измените условия или сбросьте фильтры.</p><button class="secondary-button" type="button" data-ac-action="reset-filters">Сбросить фильтры</button></div>`
  if (consoleFocusKey) {
    const node = document.querySelector(`[data-ac-focus="${consoleFocusKey}"]`)
    if (node) { consoleFocusKey = null; node.focus() }
  }
}

function renderAcQueue() {
  renderAcFilters()
  renderAcQueueList()
}

function acSection(title, icon, body, note) {
  return `<section class="case-section"><h3>${ADMIN_ICON(icon)}${title}</h3>${body}${note ? `<p class="case-rule-note">${note}</p>` : ''}</section>`
}

const acRows = rows => `<ul class="admin-rows">${rows.map(row => `<li><span>${escapeDashboardText(row.name)}</span><em>${escapeDashboardText(row.period)}</em><b>${adminSigned(row.sum)}</b></li>`).join('')}</ul>`

// §4.4: доказательства — исходные поля WB, затронутые операции, история похожих операций
// и пара «текущая категория ↔ предложил клиент».
function acEvidenceSection(record) {
  const fields = `<div class="evidence-grid">${record.fields.map(field => `<div><span>${escapeDashboardText(field.label)}</span>${field.code ? `<code>${escapeDashboardText(field.value)}</code>` : `<strong>${escapeDashboardText(field.value)}</strong>`}</div>`).join('')}</div>`
  const affected = `<div class="admin-block"><span class="admin-block-label">Затронутые операции · ${record.operations}</span>${record.affected.length ? acRows(record.affected) : `<p class="case-rule-note">Отдельные операции не выделяются: правило меняет расчёт всего периода.</p>`}</div>`
  const similar = AC_SIMILAR[record.kind] || []
  const similarBlock = `<div class="admin-block"><span class="admin-block-label">История похожих операций</span>${similar.length ? acRows(similar) : `<p class="case-rule-note">Похожих операций в предыдущих неделях не найдено.</p>`}</div>`
  const cats = `<div class="ac-cats"><div><span>Текущая категория</span><strong>${escapeDashboardText(record.currentCategory)}</strong></div>${ADMIN_ICON('chevron-right')}<div><span>Предложил клиент</span><strong>${escapeDashboardText(record.proposedCategory || '—')}</strong></div></div>`
  return acSection('Доказательства', 'doc', `${fields}${affected}${similarBlock}${cats}`)
}

function acSelect(path, label, options, value) {
  const active = options.find(option => option.value === value) || options[0]
  return `<div class="field-control"><span class="field-label">${label}</span>
    <div class="field-select" data-ac-select="${path}">
      <button class="field-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"><span>${escapeDashboardText(active.label)}</span>${ADMIN_ICON('chevron-down')}</button>
      <div class="field-select-popover" role="listbox" aria-label="${label}">${options.map(option => `<button type="button" role="option" data-value="${escapeDashboardText(option.value)}" aria-selected="${String(option.value === value)}">${escapeDashboardText(option.label)}${ADMIN_ICON('check')}</button>`).join('')}</div>
    </div></div>`
}

// §4.4: редактор глобального правила — название, категория, тип расчёта, приоритет, комментарий.
function acRuleSection(record) {
  return acSection('Редактор правила', 'shield', `
    <label class="field-control"><span class="field-label">Название операции</span><input data-ac-field="rule.name" value="${escapeDashboardText(record.rule.name)}"></label>
    <div class="field-row">
      ${acSelect('rule.category', 'Категория', [{ value: '', label: 'Не выбрана' }, ...AC_CATEGORIES.map(value => ({ value, label: value }))], record.rule.category)}
      ${acSelect('rule.calcType', 'Тип расчёта', AC_CALC_TYPES.map(value => ({ value, label: value })), record.rule.calcType)}
    </div>
    <div class="field-row">
      ${acSelect('priority', 'Приоритет', Object.entries(ADMIN_PRIORITIES).map(([value, label]) => ({ value, label })), record.priority)}
      <label class="field-control"><span class="field-label">Комментарий</span><textarea data-ac-field="rule.comment" rows="2" placeholder="Основание правила для команды клиента">${escapeDashboardText(record.rule.comment)}</textarea></label>
    </div>`)
}

// §4.4: область действия, способ применения, дата начала и причина отказа от пересчёта —
// всё, что §3.2 запрещает показывать в клиентской карточке.
function acScopeSection(record) {
  const published = record.status === 'published'
  const options = (key, values) => values.map(([value, title, note]) => `<button class="option${record[key] === value ? ' is-active' : ''}" type="button" data-ac-action="${key}" data-ac-value="${value}" aria-pressed="${String(record[key] === value)}" ${published ? 'disabled' : ''}><strong>${title}</strong><small>${note}</small></button>`).join('')
  return acSection('Область действия и применение', 'building', `
    <div class="option-grid">${options('scope', [['all', 'Все организации', 'Оба юридических лица аккаунта'], ['market', 'Выбранный marketplace', record.market === 'WB' ? 'Только кабинеты WB' : 'Только кабинеты Ozon']])}</div>
    <div class="option-grid ac-application">${options('application', [['history', 'Пересчитать историю', 'Правило применится задним числом к перечисленным неделям'], ['forward', 'Применять вперёд', 'Только новые операции с даты начала действия']])}</div>
    <div class="field-row forward-settings">
      <label class="field-control"><span class="field-label">Дата начала действия</span>
        <input id="acEffectiveDate" type="hidden" value="${record.effectiveDate}">
        <button class="date-field" type="button" data-calendar="single" data-input="acEffectiveDate" aria-haspopup="dialog" aria-expanded="false" ${published ? 'disabled' : ''}><span>${productDate(record.effectiveDate)}</span>${ADMIN_ICON('calendar')}</button></label>
      <label class="field-control"><span class="field-label">Причина отказа от пересчёта истории</span><textarea data-ac-field="refusal" rows="2" placeholder="Например: история закрыта актом, пересчёт невозможен" ${record.application === 'forward' && !published ? '' : 'disabled'}>${escapeDashboardText(record.refusal)}</textarea></label>
    </div>
    <p class="application-summary">${ADMIN_ICON('info')}<span>Публикация создаст версию <strong>v${record.published ? record.published.version.slice(1) : AC_METHOD.version + 1}</strong> и применит правило: ${escapeDashboardText(record.application ? AC_APPLICATIONS[record.application] : 'способ применения не выбран')} · ${record.scope === 'all' ? 'все организации' : 'выбранный marketplace'} · недель: ${record.weeks.length}.</span></p>`)
}

function acWeeksSection(record) {
  const mode = record.application === 'history' ? 'пересчёт' : record.application === 'forward' ? 'только новые операции' : 'способ не выбран'
  return acSection('Недели, которые затронет публикация', 'calendar', `
    <ul class="admin-rows">${record.weeks.map(week => `<li><span>${escapeDashboardText(week)}</span><em>${mode}</em><b>${record.published ? escapeDashboardText(record.published.version) : `v${AC_METHOD.version + 1}`}</b></li>`).join('')}</ul>`,
    'Список предварительный: какие строки изменит правило, решает публикация в Grafio, а не этот мокап.')
}

// §4.4: контрольная сверка «данные WB ↔ расчёт Grafio». Несведённая разница блокирует
// публикацию и объясняется прямо под значениями.
function acCheckSection(record) {
  if (!record.compare) {
    return acSection('Контрольная сверка', 'compare', `<p class="case-locked">${ADMIN_ICON('lock')}Клиент ещё не передал недостающие данные — сверку запустить нельзя.</p>`)
  }
  const delta = acDelta(record)
  const note = record.published
    ? `Публикация ${record.published.version}: результат ${record.published.result}`
    : delta ? 'Публикация недоступна: сначала выполните проверку и сведите разницу к 0\u00A0₽' : 'Разница сведена к нулю — публикация доступна'
  return acSection('Контрольная сверка', 'compare', `
    <div class="admin-compare">
      <div class="admin-compare-cell"><span>${escapeDashboardText(record.compare.wbLabel)}</span><strong>${adminSigned(record.compare.wb)}</strong></div>
      <span class="admin-compare-op">−</span>
      <div class="admin-compare-cell"><span>${escapeDashboardText(record.compare.grafioLabel)}</span><strong>${adminSigned(record.compare.grafio)}</strong></div>
    </div>
    <div class="admin-delta${delta ? ' is-risk' : ' is-clear'}"><span>Разница</span><strong>${adminMoney(delta || 0)}</strong><small>${note}</small></div>
    ${record.checked ? `<div class="admin-method"><span>Результат проверки</span><strong>${escapeDashboardText(record.rule.name)} · ${escapeDashboardText(record.rule.category || 'без категории')}</strong><em>сверка выполнена</em></div>` : ''}`)
}

function acActions(record) {
  const blockers = acBlockers(record)
  const published = record.status === 'published'
  return `<div class="case-actions ac-actions">
    <button class="secondary-button" type="button" data-ac-action="draft" ${published ? 'disabled' : ''}>${ADMIN_ICON('save')}<span>Сохранить черновик</span></button>
    <button class="secondary-button" type="button" data-ac-action="check" ${published || !record.compare ? 'disabled' : ''}>${ADMIN_ICON('refresh')}<span>Проверить</span></button>
    ${record.compare ? '' : `<button class="secondary-button" type="button" data-ac-action="ask-data" ${published ? 'disabled' : ''}>${ADMIN_ICON('doc')}<span>Запросить данные у клиента</span></button>`}
    <button class="primary-button" type="button" id="acPublishButton" data-ac-action="publish" ${blockers.length || published ? 'disabled' : ''}>${ADMIN_ICON('shield')}<span>${published ? `Опубликовано ${record.published.version}` : 'Опубликовать правило'}</span></button>
    <p class="case-gate ac-publish-gate${blockers.length || published ? '' : ' is-passed'}" id="acPublishNote">${ADMIN_ICON(blockers.length ? 'info' : 'check')}<span>${published ? `Запрос отработан · ${record.published.version}` : acGateText(record)}</span></p>
  </div>`
}

function acHistorySection(record) {
  const entries = [...record.history].reverse()
  return `<section class="case-history">
    <button class="case-history-toggle" type="button" data-ac-action="history" aria-expanded="${String(consoleState.historyOpen)}">${ADMIN_ICON('clock')}<span>История запроса</span><em>${entries.length}</em>${ADMIN_ICON('chevron-down')}</button>
    <ol class="history-list"${consoleState.historyOpen ? '' : ' hidden'}>${entries.map(entry => `<li><span class="avatar is-mini">${escapeDashboardText(entry.initials)}</span><div class="history-copy"><strong>${escapeDashboardText(entry.who)}<time>${adminStamp(entry.at)}</time></strong><p><b>${escapeDashboardText(entry.action)}</b><span>${escapeDashboardText(entry.note)}</span></p></div></li>`).join('')}</ol>
  </section>`
}

function renderAcWork() {
  const box = document.getElementById('acWork')
  if (!box) return
  const record = acSelected()
  if (!record) {
    box.innerHTML = `<div class="admin-empty ac-empty"><span class="plan-empty-icon">${ADMIN_ICON('shield')}</span><h2>Запрос не выбран</h2><p>Выберите заявку в очереди слева — здесь появятся доказательства, редактор правила и контрольная сверка.</p></div>`
    return
  }
  const status = CONSOLE_STATUSES[record.status]
  box.innerHTML = `<header class="case-title">
      <div class="case-row"><span class="case-id">${record.id} · ${ADMIN_TYPES[record.kind].label} · ${escapeDashboardText(record.company)}</span>
        <div class="case-meta">
          <div class="case-badges"><span class="status-chip ${record.status === 'published' ? 'good' : record.status === 'need-data' ? 'warning' : record.status === 'new' ? 'muted' : 'progress'}">${status.label}</span><span class="admin-badge is-prio-${record.priority}">${ADMIN_PRIORITIES[record.priority]} приоритет</span></div>
          <div class="case-owner"><span class="avatar is-mini">ГР</span><span class="case-owner-copy"><strong>${AC_AUTHOR}</strong><small>внутренний доступ Grafio</small></span></div>
        </div>
      </div>
      <div class="case-row"><h1>${escapeDashboardText(record.title)}</h1></div>
      <div class="case-row"><p>${escapeDashboardText(record.source)}</p></div>
    </header>
    <div class="ac-columns">
      <div class="ac-main">${acEvidenceSection(record)}${acRuleSection(record)}${acScopeSection(record)}${acWeeksSection(record)}</div>
      <aside class="ac-side">${acCheckSection(record)}</aside>
    </div>
    ${acActions(record)}${acHistorySection(record)}`
  bindFieldSelects(box)
  bindDatePickers(box)
  bindTooltips(box)
}

function renderAdminConsole() {
  renderAcQueue()
  renderAcWork()
  acSyncScroll()
}

// Прокрутка очереди и работы живёт независимо: длинный текст правила не должен
// выбрасывать список заявок из вида.
function acSyncScroll() {
  const list = document.getElementById('acQueueList')
  const active = list?.querySelector('.queue-item.is-active')
  if (active) active.scrollIntoView({ block: 'nearest' })
}

const AC_OVERLAYS = ['tooltip', 'datePicker', 'toast']
const acOverlayHome = new Map(AC_OVERLAYS.map(id => [id, document.getElementById(id).parentElement]))

// §4.2: app-shell убирается из вёрстки вместе со своими плавающими слоями — тултип,
// календарь и тост лежат внутри .workspace, поэтому на время консоли переезжают в сам
// слой и возвращаются домой тем же списком.
function acParkOverlays(host) {
  AC_OVERLAYS.forEach(id => {
    const node = document.getElementById(id)
    const home = host || acOverlayHome.get(id)
    if (node && node.parentElement !== home) home.appendChild(node)
  })
}

function openAdminConsole() {
  closeFieldSelect()
  closeDatePicker()
  closeContextMenu()
  closeScenario()
  const screen = document.getElementById('adminConsole')
  const records = consoleRecords()
  if (!records.some(record => record.id === consoleState.selected)) {
    consoleState.selected = (records.find(record => record.status !== 'published') || records[0] || {}).id || null
  }
  document.body.classList.add('is-admin-console')
  screen.hidden = false
  acParkOverlays(screen)
  consoleState.open = true
  renderAdminConsole()
  document.getElementById('acSearch').focus({ preventScroll: true })
}

function closeAdminConsole() {
  const screen = document.getElementById('adminConsole')
  closeModal('acPublishModal')
  acParkOverlays(null)
  document.body.classList.remove('is-admin-console')
  screen.hidden = true
  consoleState.open = false
  // §4.1: возврат ведёт на последний открытый клиентский кейс — выбор очереди не сбрасываем,
  // а карточку клиента подводим к той заявке, с которой работал администратор.
  const record = acSelected()
  if (record?.caseId && ADMIN_CASES.some(item => item.id === record.caseId && !item.archived)) adminState.selected = record.caseId
  switchView('admin')
  renderAdmin()
  document.getElementById('adminConsoleButton').focus({ preventScroll: true })
}

// §4.1: второй вход в консоль — клавиатурный. В полях набора литера остаётся текстом,
// поэтому проверка цели здесь обязательна (тот же приём, что у ⌘/Ctrl+1…7).
function adminConsoleShortcut(event) {
  if (!((event.metaKey || event.ctrlKey) && event.shiftKey && !event.altKey)) return
  if (event.code !== 'KeyA') return
  if (document.body.classList.contains('is-logged-out')) return
  const tag = event.target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable) return
  event.preventDefault()
  if (consoleState.open) closeAdminConsole()
  else openAdminConsole()
}

function acUpdateGates() {
  const record = acSelected()
  const note = document.getElementById('acPublishNote')
  const button = document.getElementById('acPublishButton')
  if (!record || !note || !button) return
  const blockers = acBlockers(record)
  const published = record.status === 'published'
  note.classList.toggle('is-passed', !blockers.length && !published)
  note.querySelector('use').setAttribute('href', `#i-${blockers.length || published ? 'info' : 'check'}`)
  note.querySelector('span').textContent = published ? `Запрос отработан · ${record.published.version}` : acGateText(record)
  button.disabled = published || blockers.length > 0
}

// §4.3: «Готово к публикации» — не отдельная кнопка, а следствие закрытых условий
// публикации. Статусы «Новая», «Нужны данные» и «Опубликовано» назначает процесс, а не
// форма, поэтому их не трогаем; между «Проверяется» и «Готово» заявка ходит в обе стороны.
const acSyncStatus = record => {
  if (!record || (record.status !== 'checking' && record.status !== 'ready')) return record?.status
  const before = record.status
  record.status = acBlockers(record).length ? 'checking' : 'ready'
  if (before !== record.status) acPaintStatus(record)
  return record.status
}

// Перекраска без пересборки карточки: в момент смены статуса в поле правила стоит каретка,
// а renderAcWork() выбросил бы её вместе с введённым текстом.
function acPaintStatus(record) {
  const chip = document.querySelector('#acWork .status-chip')
  if (chip) {
    chip.textContent = CONSOLE_STATUSES[record.status].label
    chip.className = `status-chip ${record.status === 'published' ? 'good' : record.status === 'need-data' ? 'warning' : record.status === 'new' ? 'muted' : 'progress'}`
  }
  renderAcQueueList()
}

function acSetField(path, value) {
  const record = acSelected()
  if (!record) return
  if (path.includes('.')) {
    const [owner, key] = path.split('.')
    record[owner][key] = value
  } else {
    record[path] = value
  }
  acSyncStatus(record)
}

const AC_ACTIONS = {
  // §4.5: черновик меняет статус на «Проверяется», публикация остаётся отдельным шагом.
  draft(record) {
    record.status = 'checking'
    acPush(record, 'Черновик правила сохранён', `${record.rule.name} · ${record.rule.category || 'без категории'}`)
    showToast('Черновик сохранён', 'Заявка переведена в статус «Проверяется»')
  },
  // «Проверить» генерирует демонстрационный результат: расчёт Grafio догоняет выгрузку,
  // разница сводится к 0 ₽, но реальные строки недели не пересчитываются.
  check(record) {
    if (!record.compare) return
    record.compare.grafio = record.compare.wb
    record.checked = true
    record.status = acBlockers(record).length ? 'checking' : 'ready'
    acPush(record, 'Контрольная сверка выполнена', 'Разница 0\u00A0₽ · расчёт Grafio совпал с выгрузкой')
    showToast('Сверка выполнена', 'Демонстрационный результат: разница сведена к 0\u00A0₽')
  },
  'ask-data'(record) {
    record.status = 'need-data'
    acPush(record, 'Данные запрошены у клиента', record.caseId ? `${record.caseId} переведён в «Нужны данные»` : 'Ожидаем дополнения от клиента')
    const caseItem = ADMIN_CASES.find(item => item.id === record.caseId)
    if (caseItem && caseItem.status !== 'closed') {
      caseItem.status = 'blocked'
      caseItem.history.push({ at: adminNow(), author: 'grafio', who: AC_AUTHOR, action: 'Запрос данных от Grafio', note: 'Администратору не хватает данных для контрольной сверки' })
    }
    showToast('Запрос отправлен клиенту', 'Кейс в «Контроле расчётов» переведён в «Нужны данные»')
  },
  history() { consoleState.historyOpen = !consoleState.historyOpen },
  'reset-filters'() {
    consoleState.filters = { status: '', kind: '', priority: '' }
    consoleState.needPublish = false
    // Пустой список мог получиться только из-за поиска: сброс обязан возвращать и его,
    // иначе кнопка под надписью «Ничего не найдено» чистит не всё.
    consoleState.search = ''
    document.getElementById('acSearch').value = ''
    document.getElementById('acNeedPublish').checked = false
  },
}

// §3.3/§4.3: повторный запрос клиента для Grafio — новая заявка. Опубликованную версию
// методики это не отменяет, но сверку нужно пройти заново, поэтому запись возвращается
// в «Новая», а результат проверки откатывается к значению «до проверки».
function consoleOnReopen(item) {
  const record = consoleStore[item.id]
  if (!record) return
  record.status = 'new'
  record.checked = false
  record.published = null
  if (record.compare) record.compare.grafio = record.compare.pre
  acPush(record, 'Повторный запрос от клиента', `${item.id} снова в очереди Grafio · опубликованная версия методики не отменена`)
}

function acPublishConfirm() {
  const record = acSelected()
  if (!record || acBlockers(record).length) return
  const version = `v${AC_METHOD.version + 1}`
  const at = adminNow()
  const result = adminMoney(acDelta(record))
  const application = AC_APPLICATIONS[record.application]
  record.published = { version, at, result }
  record.status = 'published'
  AC_METHOD.version += 1
  acPush(record, 'Правило опубликовано', `${version} · ${application} · недель: ${record.weeks.length}`)
  const caseItem = ADMIN_CASES.find(item => item.id === record.caseId)
  if (caseItem) {
    // §4.5: публикация администратора закрывает путь запроса на стороне клиента —
    // кейс получает «Опубликовано», версию методики и результат сверки.
    caseItem.status = 'published'
    caseItem.check.after = { value: result, caption: `Сверка пройдена · ${version}`, passed: true }
    caseItem.resolution = { version, at, result, application, note: `Публикация Grafio: ${application.toLowerCase()} с ${productDate(record.effectiveDate)} · ${record.scope === 'all' ? 'все организации' : 'выбранный marketplace'}` }
    caseItem.history.push({ at, author: 'grafio', who: AC_AUTHOR, action: 'Публикация версии', note: `${version} · ${record.rule.name} → ${record.rule.category}` })
  }
  showToast('Правило опубликовано', `${version} · клиентский кейс переведён в «Опубликовано»`)
}

function acOpenPublishModal() {
  const record = acSelected()
  if (!record || acBlockers(record).length) return
  const organizations = record.scope === 'all' ? 2 : 1
  document.getElementById('acPublishSub').textContent = `${record.id} · ${record.rule.name} → ${record.rule.category}`
  document.getElementById('acPublishBody').innerHTML = `
    <div class="evidence-grid">
      <div><span>Версия методики</span><strong>v${AC_METHOD.version + 1}</strong></div>
      <div><span>Организаций</span><strong>${organizations}</strong></div>
      <div><span>Недель</span><strong>${record.weeks.length}</strong></div>
      <div><span>Способ применения</span><strong>${escapeDashboardText(AC_APPLICATIONS[record.application])}</strong></div>
    </div>
    <ul class="admin-rows">${record.weeks.map(week => `<li><span>${escapeDashboardText(week)}</span><em>${record.application === 'history' ? 'пересчёт' : 'только новые операции'}</em><b>v${AC_METHOD.version + 1}</b></li>`).join('')}</ul>`
  openModal('acPublishModal', '#acPublishConfirm')
}

const adminConsoleScreen = document.getElementById('adminConsole')

// Сворачивание очереди — один класс на слое и две кнопки (в шапке очереди и в шапке консоли),
// которые только меняют этот класс. Отдельного рендера нет: очередь никуда не перестраивается,
// а выбранная заявка обязана пережить и сворачивание, и разворачивание.
function acSetQueueCollapsed(collapsed) {
  consoleState.queueCollapsed = collapsed
  adminConsoleScreen.classList.toggle('is-queue-collapsed', collapsed)
  document.querySelectorAll('[data-ac-queue-toggle]').forEach(button => {
    button.setAttribute('aria-expanded', String(!collapsed))
    button.dataset.tooltip = collapsed ? 'Развернуть очередь' : 'Свернуть очередь'
  })
}

adminConsoleScreen.addEventListener('click', event => {
  const toggle = event.target.closest('[data-ac-queue-toggle]')
  if (toggle) {
    acSetQueueCollapsed(!consoleState.queueCollapsed)
    return
  }
  const row = event.target.closest('[data-ac-record]')
  if (row) {
    consoleState.selected = row.dataset.acRecord
    renderAdminConsole()
    return
  }
  const option = event.target.closest('[data-ac-action="scope"], [data-ac-action="application"]')
  if (option && !option.disabled) {
    const record = acSelected()
    if (record) {
      record[option.dataset.acAction] = option.dataset.acValue
      acSyncStatus(record)
      renderAcWork()
    }
    return
  }
  const action = event.target.closest('[data-ac-action]')
  if (action && !action.disabled) {
    const record = acSelected()
    // Публикация открывает рамку, а не меняет запись, поэтому обработчика в AC_ACTIONS у неё
    // нет: проверка «есть ли handler» обязана идти после этого выхода, иначе кнопка молчала.
    if (action.dataset.acAction === 'publish') { acOpenPublishModal(); return }
    const handler = AC_ACTIONS[action.dataset.acAction]
    if (!handler || (!record && action.dataset.acAction !== 'reset-filters')) return
    handler(record)
    renderAdminConsole()
    return
  }
})

adminConsoleScreen.addEventListener('fieldselect', event => {
  const filter = event.target.closest('[data-ac-filter]')
  if (filter) {
    consoleState.filters[filter.dataset.acFilter] = event.detail.value
    consoleFocusKey = `filter:${filter.dataset.acFilter}`
    closeFieldSelect()
    renderAcQueue()
    return
  }
  const select = event.target.closest('[data-ac-select]')
  if (!select) return
  closeFieldSelect()
  acSetField(select.dataset.acSelect, event.detail.value)
  renderAcWork()
})

adminConsoleScreen.addEventListener('input', event => {
  const field = event.target.closest('[data-ac-field]')
  if (field) {
    acSetField(field.dataset.acField, event.target.value)
    acUpdateGates()
    return
  }
  if (event.target.id === 'acSearch') {
    consoleState.search = event.target.value
    renderAcQueueList()
  }
})

adminConsoleScreen.addEventListener('change', event => {
  if (event.target.id !== 'acNeedPublish') return
  consoleState.needPublish = event.target.checked
  renderAcQueueList()
})

// Календарь пишет в скрытое поле, а карточка пересобирается по событию datecommit:
// дата начала и подпись способа применения должны сойтись с перечнем недель.
adminConsoleScreen.addEventListener('datecommit', event => {
  if (event.target.id !== 'acEffectiveDate') return
  const record = acSelected()
  if (!record) return
  record.effectiveDate = event.target.value
  renderAcWork()
})

document.getElementById('acSearch').addEventListener('keydown', event => {
  if (event.key === 'Escape' && event.target.value) {
    event.stopPropagation()
    event.target.value = ''
    consoleState.search = ''
    renderAcQueueList()
  }
})

document.getElementById('acReturn').addEventListener('click', closeAdminConsole)
document.getElementById('adminConsoleButton').addEventListener('click', openAdminConsole)
document.getElementById('acPublishClose').addEventListener('click', () => closeModal('acPublishModal'))
document.getElementById('acPublishCancel').addEventListener('click', () => closeModal('acPublishModal'))
document.getElementById('acPublishConfirm').addEventListener('click', () => {
  closeModal('acPublishModal')
  acPublishConfirm()
  renderAdminConsole()
})

/* ── §4 Панель команды: один общий правый слой на все разделы ────────────────────
   Не ещё один раздел сайдбара и не canvas: aside живёт внутри .workspace под тулбаром
   (z 57), поэтому тулбар и боковая панель остаются открытыми, а modal (z 80) перекрывает
   панель, как требует §4.1. Посев задач и активности взять из состояний очереди кейсов —
   иначе «Открыть кейс» из панели вёл бы на несуществующий кейс. */

const TEAM_TABS = ['members', 'tasks', 'activity']
const TEAM_TAB_STORE = 'grafio.team.tab'
// Присутствие принадлежит составу (§4.2), а не панели: «Участники» обязаны показывать тех же
// людей, что и меню назначения в карточке кейса.
const TEAM_PRESENCE = {
  online: { label: 'В сети', tone: 'good' },
  busy: { label: 'Занят(а)', tone: 'warning' },
  off: { label: 'Не в сети', tone: 'muted' },
}
const TEAM_ACTIVITY_ICONS = { assign: 'user', comment: 'doc', data: 'alert', rule: 'shield', status: 'clock', task: 'check', resolve: 'check', member: 'users' }

const teamPanel = document.getElementById('teamPanel')
const teamScrim = document.getElementById('teamScrim')
const teamPanelButton = document.getElementById('teamPanelButton')
const teamPanelBody = document.getElementById('teamPanelBody')

const teamState = {
  open: false,
  // §4.2 просит помнить вкладку в течение сессии: sessionStorage живёт до закрытия вкладки,
  // но, в отличие от избранного в панелях виджетов, не переживает новый сеанс.
  tab: TEAM_TABS.includes(readSession(TEAM_TAB_STORE, '')) ? readSession(TEAM_TAB_STORE, '') : 'members',
  owner: null,
}

// Посев занимает T-105…T-101, генератор из кейса продолжает счёт: иначе новая задача получила
// бы id уже существующей, и «Отметить выполненной» выбрала бы не её.
let adminTaskSeq = 106
const adminTaskById = id => adminTasks.find(task => task.id === id) || null

adminTasks.push(
  { id: 'T-105', title: 'Проверить карточку выручки после смены правила', sheet: 'main', sheetName: 'Основной', widgetTitle: 'Выручка', assignee: 'mikhail', due: '6 мая', done: false, seen: true, at: adminDate('2026-05-02T10:15:00') },
  { id: 'T-104', title: 'Дозапросить выгрузку возвратов за 13–19 апреля', caseId: 'Q-39', assignee: 'mikhail', due: 'Сегодня', late: true, done: false, seen: false, at: adminDate('2026-05-03T09:40:00') },
  { id: 'T-103', title: 'Найти дублирующую операцию за 29 апреля', caseId: 'Q-37', assignee: 'anna', due: 'Сегодня', done: false, seen: false, at: adminDate('2026-05-03T08:25:00') },
  { id: 'T-102', title: 'Согласовать категорию «Платная приёмка»', caseId: 'Q-42', assignee: 'daria', due: '5 мая', done: false, seen: true, at: adminDate('2026-05-02T17:20:00') },
  { id: 'T-101', title: 'Применить ставку комиссии 20% с 1 мая', caseId: 'Q-35', assignee: 'irina', due: '4 мая', done: true, seen: true, at: adminDate('2026-05-01T11:05:00') },
)

adminActivity.push(
  { at: adminDate('2026-05-03T11:05:00'), kind: 'rule', text: 'Правило кейса Q-41: база сверки — комиссия WB, допуск 0\u00A0₽', author: 'anna', caseId: 'Q-41', mentioned: [], seen: false },
  { at: adminDate('2026-05-03T09:40:00'), kind: 'task', text: 'Задача «Дозапросить выгрузку возвратов» назначена на Михаила Орлова', author: 'daria', caseId: 'Q-39', mentioned: ['mikhail'], seen: false },
  { at: adminDate('2026-05-02T18:10:00'), kind: 'comment', text: 'По приёмке не хватает акта, запрошу у менеджера склада @Ирина', author: 'mikhail', caseId: 'Q-39', mentioned: ['irina'], seen: false },
  { at: adminDate('2026-04-29T16:45:00'), kind: 'resolve', text: 'Кейс Q-31 решён: разница сведена к 0\u00A0₽', author: 'anna', caseId: 'Q-31', mentioned: [], seen: true },
)

const teamStream = tab => tab === 'tasks' ? adminTasks : tab === 'activity' ? adminActivity : ADMIN_TEAM
const teamUnread = tab => teamStream(tab).filter(entry => entry.seen === false).length

// Запись, появившаяся, пока пользователь уже смотрит на нужную вкладку, не имеет права
// становиться «новой»: иначе бейдж (§4.2) рос бы от его собственных действий.
function teamWatched(tab) { return teamState.open && teamState.tab === tab }

// Бейдж — счётчик непрочитанного (§4.2): вкладка считается просмотренной с момента открытия,
// поэтому отметить можно только ту, что пользователь реально видит.
function markTeamSeen(tab) { teamStream(tab).forEach(entry => { entry.seen = true }) }

function renderTeamBadges() {
  TEAM_TABS.forEach(tab => {
    const node = document.querySelector(`[data-team-tab="${tab}"] b`)
    if (!node) return
    const count = teamUnread(tab)
    node.textContent = count
    node.classList.toggle('is-hidden', count === 0)
  })
  const total = teamUnread('tasks') + teamUnread('activity')
  const chip = document.getElementById('teamToolbarCount')
  chip.textContent = total
  chip.classList.toggle('is-hidden', total === 0)
  teamPanelButton.setAttribute('aria-label', total ? `Команда · ${total} ${pluralizeDashboard(total, ['новое', 'новых', 'новых'])}` : 'Команда')
}

// §5.2: роль «Просмотр» не получает кнопок назначения и решений — в панели она читает состав,
// задачи и активность без действий.
const teamMenuButton = (kind, attrs, label) => adminCan('assign')
  ? `<button class="team-row-menu" type="button" data-admin-menu="${kind}" ${attrs} aria-haspopup="menu" aria-expanded="false" aria-label="${label}" data-tooltip="${label}">${ADMIN_ICON('more')}</button>`
  : ''

function teamMembersTab() {
  const rows = ADMIN_TEAM.map(member => {
    const presence = TEAM_PRESENCE[member.presence] || TEAM_PRESENCE.off
    // Активный участник показывает присутствие, приглашённый и отключённый — свой статус:
    // зелёная точка рядом со словом «Приглашён» читалась бы как «в сети».
    const state = member.status === 'active'
      ? `<span class="team-presence is-${presence.tone}"><i></i>${presence.label}</span>`
      : `<span class="member-state is-${teamStatus(member).tone}">${teamStatus(member).label}</span>`
    return `<div class="team-row member${member.id === CURRENT_MEMBER ? ' is-me' : ''}">
      <span class="avatar">${member.initials}</span>
      <span class="team-row-copy"><strong>${member.name}${member.id === CURRENT_MEMBER ? '<em>это вы</em>' : ''}</strong><small>${ADMIN_ROLES[member.role].name} · ${member.access}</small></span>
      ${state}
      ${teamMenuButton('team-member', `data-team-member="${member.id}"`, `Действия: ${member.short}`)}
    </div>`
  }).join('')
  // §5: окно управления доступно и «Просмотру» — иначе из демо-режима нельзя было бы вернуться
  // к другой роли. Внутри окна роль только читает состав, а селектор прав остаётся рабочим.
  const foot = `<button class="team-manage-open" type="button" data-team-action="manage">${ADMIN_ICON('users')}Управлять командой и ролями</button>`
  return `<div class="team-list">${rows}</div>${foot}<p class="team-hint">${ADMIN_ICON('info')}Состав, роли и области доступа — демонстрационные.</p>`
}

function teamTaskRow(task) {
  const source = task.caseId ? `Кейс ${task.caseId}` : `Лист «${escapeDashboardText(task.sheetName)}» · ${escapeDashboardText(task.widgetTitle)}`
  return `<div class="team-row task${task.done ? ' is-done' : ''}${task.seen === false ? ' is-new' : ''}">
    ${adminCan('assign') ? `<button class="team-check" type="button" data-team-action="toggle-task" data-team-task="${task.id}" aria-pressed="${String(Boolean(task.done))}" aria-label="${task.done ? 'Вернуть в работу' : 'Отметить выполненной'}" data-tooltip="${task.done ? 'Вернуть в работу' : 'Выполнено'}">${ADMIN_ICON('check')}</button>` : `<span class="team-check is-locked">${ADMIN_ICON('check')}</span>`}
    <span class="team-row-copy"><strong>${escapeDashboardText(task.title)}</strong><small>${source} · ${memberName(task.assignee)}</small></span>
    <span class="team-due${task.done ? ' is-done' : task.late ? ' is-late' : ''}">${task.due}</span>
    ${teamMenuButton('team-task', `data-team-task="${task.id}"`, `Действия: ${task.id}`)}
  </div>`
}

function teamTasksTab() {
  const scope = teamState.owner
  const scopeNote = scope
    ? `<div class="team-scope"><span>${ADMIN_ICON('user')}Задачи: ${memberName(scope)}</span><button type="button" data-team-action="clear-scope">Показать все${ADMIN_ICON('close')}</button></div>`
    : ''
  const list = adminTasks.filter(task => !scope || task.assignee === scope)
  if (!list.length) return `${scopeNote}<div class="admin-empty"><span class="plan-empty-icon">${ADMIN_ICON('check')}</span><h2>Задач нет</h2><p>${scope ? `${memberName(scope)} не назначено ни одной задачи.` : 'Задачу создают из карточки кейса или из виджета на листе.'}</p></div>`
  const open = list.filter(task => !task.done)
  const done = list.filter(task => task.done)
  return `${scopeNote}${open.length ? `<div class="team-list">${open.map(teamTaskRow).join('')}</div>` : ''}
    ${done.length ? `<p class="team-group">Выполнено · ${done.length}</p><div class="team-list">${done.map(teamTaskRow).join('')}</div>` : ''}`
}

function teamActivityTab() {
  if (!adminActivity.length) return `<div class="admin-empty"><span class="plan-empty-icon">${ADMIN_ICON('clock')}</span><h2>Активности нет</h2><p>Назначения, комментарии и смена правил появятся здесь.</p></div>`
  return `<div class="team-list">${adminActivity.map(entry => {
    const member = teamMember(entry.author)
    return `<div class="team-row activity${entry.seen === false ? ' is-new' : ''}">
      <span class="team-activity-icon">${ADMIN_ICON(TEAM_ACTIVITY_ICONS[entry.kind] || 'doc')}</span>
      <span class="team-row-copy"><strong>${escapeDashboardText(entry.text)}</strong><small>${member ? member.name : 'Система'} · ${adminStamp(entry.at)}</small></span>
      ${entry.caseId ? `<button class="team-link" type="button" data-team-action="open-case" data-team-case="${entry.caseId}">${entry.caseId}</button>` : ''}
    </div>`
  }).join('')}</div>`
}

function renderTeamPanel() {
  if (!teamPanelBody) return
  const tab = teamState.tab
  document.querySelectorAll('[data-team-tab]').forEach(button => {
    const active = button.dataset.teamTab === tab
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-selected', String(active))
  })
  teamPanelBody.setAttribute('aria-labelledby', `teamTab${tab[0].toUpperCase()}${tab.slice(1)}`)
  teamPanelBody.innerHTML = tab === 'members' ? teamMembersTab() : tab === 'tasks' ? teamTasksTab() : teamActivityTab()
  teamPanelBody.scrollTop = 0
  const open = adminTasks.filter(task => !task.done).length
  const done = adminTasks.length - open
  document.getElementById('teamPanelNote').textContent = tab === 'members'
    ? `${ADMIN_TEAM.length} ${pluralizeDashboard(ADMIN_TEAM.length, ['участник', 'участника', 'участников'])} · смотреть как: ${ADMIN_ROLES[viewerRole].name}`
    : tab === 'tasks' ? `${open} ${pluralizeDashboard(open, ['задача', 'задачи', 'задач'])} в работе · ${done} выполнено`
      : `${adminActivity.length} ${pluralizeDashboard(adminActivity.length, ['запись', 'записи', 'записей'])} за отчётную неделю`
  bindTooltips(teamPanelBody)
  renderTeamBadges()
}

function setTeamTab(tab) {
  if (!TEAM_TABS.includes(tab)) return
  teamState.tab = tab
  writeSession(TEAM_TAB_STORE, tab)
  markTeamSeen(tab)
  renderTeamPanel()
}

const isTeamPanelOpen = () => teamState.open

function openTeamPanel() {
  // §4.1: панель не показывается поверх модального окна — у modal z-index выше.
  if (document.querySelector('.modal-backdrop:not(.is-hidden)')) return
  // Панель — единственный правый слой на все разделы, поэтому док предыдущего экрана обязан
  // уйти вместе с ней: два правых дока ложатся друг на друга.
  if (kpiEditorState) closeDashboardKpiEditor()
  closeAdminMenu(); closeFieldSelect(); closeContextMenu(); closeScenario(); closeDatePicker()
  closeDetails(); closeStudioLayers(); closeSettingsLayers(); closeAccountLayers(); closeProductsDock(); closeRnpMetrics()
  hideTooltip()
  teamState.open = true
  teamPanel.classList.add('is-open')
  teamPanel.setAttribute('aria-hidden', 'false')
  teamScrim.classList.add('is-open')
  teamPanelButton.setAttribute('aria-expanded', 'true')
  markTeamSeen(teamState.tab)
  renderTeamPanel()
  teamPanelBody.focus()
}

function closeTeamPanel({ restoreFocus = false } = {}) {
  if (!teamState.open) return
  teamState.open = false
  teamPanel.classList.remove('is-open')
  teamPanel.setAttribute('aria-hidden', 'true')
  teamScrim.classList.remove('is-open')
  teamPanelButton.setAttribute('aria-expanded', 'false')
  // Меню кейса и меню задачи якорятся внутри панели: без этого шага под слоем остались бы
  // пункты уже закрытой задачи.
  closeAdminMenu()
  // §7: рамки §5 принадлежат панели, поэтому уходят вместе с ней — иначе ⌘-переключение
  // раздела закрыло бы панель, а окно управления осталось бы висеть над другим экраном.
  if (document.querySelector('#teamManageModal.is-open,#teamInviteModal.is-open,#teamRemoveModal.is-open')) {
    ['teamRemoveModal', 'teamInviteModal', 'teamManageModal'].forEach(closeModal)
  }
  if (restoreFocus) teamPanelButton.focus()
}

function toggleTeamPanel() {
  if (teamState.open) closeTeamPanel({ restoreFocus: true })
  else openTeamPanel()
}

function teamOpenCase(id) {
  const item = adminCaseById(id)
  if (!item) return
  adminState.selected = id
  adminState.composer = null
  closeTeamPanel()
  switchView('admin')
  renderAdmin()
}

function teamOpenSource(task) {
  if (!task) return
  closeTeamPanel()
  switchView('dashboard')
  if (task.sheet) selectDashboardSheet(task.sheet)
  // Виджет ищем по названию в момент клика: за время демо его могли переименовать или удалить,
  // ссылки на id в задаче нет.
  const widget = activeDashboardModel().widgets.find(candidate => candidate.title === task.widgetTitle)
  if (widget) {
    // setDashboardSelection только меняет множество — класс is-selected появляется после сборки
    // канваса, поэтому переход обязан перерисовать лист, иначе выделение невидимо.
    selectDashboardWidget(widget.id)
    renderDashboard()
    showToast('Виджет выбран', `«${widget.title}» выделен на листе «${task.sheetName}»`)
  } else showToast('Лист открыт', 'Этого виджета на листе уже нет — задача осталась как память')
}

// §4.3: задача привязывается к листу и виджету, поэтому действием служит кнопка в рельсе
// виджета. Возврат в «Мой дашборд» идёт по sheetName/widgetTitle, а не по id — виджет могли
// удалить, и тогда ссылка обязана остаться памятью, а не битым кликом.
function createTaskFromWidget(id) {
  const sheet = dashboardSheets.find(candidate => candidate.id === activeDashboardSheet)
  const widget = activeDashboardModel().widgets.find(candidate => candidate.id === id)
  if (!sheet || !widget) return
  const title = `Проверить виджет «${widget.title || 'Заметка'}» на листе «${sheet.name}»`
  const task = {
    id: `T-${adminTaskSeq++}`,
    title,
    sheet: sheet.id,
    sheetName: sheet.name,
    widgetTitle: widget.title || 'Заметка',
    assignee: CURRENT_MEMBER,
    due: 'Сегодня',
    done: false,
    seen: teamWatched('tasks'),
    at: adminNow(),
  }
  adminTasks.unshift(task)
  adminActivityPush('task', `Задача «${title}» создана из виджета`, null)
  renderTeamBadges()
  if (teamState.open) renderTeamPanel()
  showToast('Задача создана', `${task.id} · лист «${sheet.name}»`)
}

const TEAM_ACTIONS = {
  'toggle-task'(node) { ADMIN_ACTIONS['task-toggle'](adminTaskById(node.dataset.teamTask)) },
  'open-case'(node) { teamOpenCase(node.dataset.teamCase) },
  'open-source'(node) { teamOpenSource(adminTaskById(node.dataset.teamTask)) },
  'clear-scope'() { teamState.owner = null; renderTeamPanel() },
  'manage'() { openTeamManage() },
}

function teamClick(event) {
  if (event.target.closest('#teamPanelClose')) {
    closeTeamPanel({ restoreFocus: true })
    return
  }
  const tab = event.target.closest('[data-team-tab]')
  if (tab) {
    setTeamTab(tab.dataset.teamTab)
    return
  }
  const trigger = event.target.closest('[data-admin-menu]')
  if (trigger) {
    const key = adminMenuKey(trigger.dataset.adminMenu, trigger)
    if (adminState.menu === key) closeAdminMenu({ restoreFocus: true })
    else openAdminMenu(trigger.dataset.adminMenu, trigger)
    return
  }
  const action = event.target.closest('[data-team-action]')
  if (action) TEAM_ACTIONS[action.dataset.teamAction]?.(action)
}

teamPanelButton.addEventListener('click', toggleTeamPanel)
teamScrim.addEventListener('click', () => closeTeamPanel())
teamPanel.addEventListener('click', teamClick)

/* ── §5: управление составом, ролями и приглашениями ──────────────────────────────────
   Окно лежит над панелью команды (modal z 80 > panel z 57) и правит тот же ADMIN_TEAM,
   который читают очередь, меню назначения и вкладка «Участники»: второго состава для
   модалки нет — иначе «Показать задачи участника» разошёлся бы с очередью кейсов. */

// Области доступа (§5.1): строки совпадают с теми, что уже показывает вкладка «Участники»,
// поэтому смена области в окне управления видна в панели без пересборка словаря.
const TEAM_ACCESS_AREAS = [
  'Все юрлица и кабинеты',
  'ООО «Верена», контроль расчётов',
  'Дашборды и отчёты',
  'Товары и планы',
  'ООО «Верена»',
  'ИП Верена А. В.',
  'Основной кабинет WB',
  'Кабинет WB «Север»',
]
// Кабинеты для «выбранных областей» приглашения — те же подключения, что в меню площадки.
const TEAM_CABINETS = ['Основной кабинет WB', 'Кабинет WB «Север»', 'Кабинет Ozon']
const TEAM_STATUS = {
  active: { label: 'В команде', tone: 'good' },
  invited: { label: 'Приглашён', tone: 'warning' },
  disabled: { label: 'Отключён', tone: 'muted' },
}

const teamStatus = member => TEAM_STATUS[member.status] || TEAM_STATUS.active
const TEAM_EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-zА-Яа-яЁё]{2,}$/
// Состояние рамки читаем из DOM, как в Настройках: Esc закрывает её через общий closeModal,
// и собственный флаг разошёлся бы с тем, что на экране.
const isTeamManageOpen = () => document.getElementById('teamManageModal').classList.contains('is-open')
const isDashboardView = () => shell.classList.contains('is-dashboard')
// Приглашённый ещё не принял приглашение, отключённый не работает: ни тот, ни другой не может
// быть ответственным, поэтому меню назначения и упоминания читают только этот список.
const teamAssignable = () => ADMIN_TEAM.filter(member => member.status === 'active')
const teamOwners = () => ADMIN_TEAM.filter(member => member.role === 'owner')
// Права на управление составом совпадают с правами назначения (§5.2); окно при этом остаётся
// доступным для «Просмотра» — только как читатель, иначе из демо-режима не было бы возврата.
const teamCanManage = () => adminCan('assign')

const teamManageBody = document.getElementById('teamManageBody')
const teamViewSelect = document.querySelector('[data-team-view-as]')
const teamInviteRoleSelect = document.querySelector('[data-team-invite-role]')
const teamInvite = { role: 'analyst', scope: 'all', areas: [TEAM_CABINETS[0]], send: true, touched: false }
let teamInviteSeq = 1
let teamPendingRemove = null

function teamRoleOptions(current) {
  return Object.entries(ADMIN_ROLES).map(([value, role]) => `<button type="button" role="option" data-value="${value}" data-label="${role.name}" aria-selected="${String(value === current)}"><span>${role.name}</span><small>${role.note}</small>${ADMIN_ICON('check')}</button>`).join('')
}

function teamAccessOptions(current) {
  const areas = TEAM_ACCESS_AREAS.includes(current) ? TEAM_ACCESS_AREAS : [current, ...TEAM_ACCESS_AREAS]
  return areas.map(area => `<button type="button" role="option" data-value="${escapeDashboardText(area)}" aria-selected="${String(area === current)}">${escapeDashboardText(area)}${ADMIN_ICON('check')}</button>`).join('')
}

// Для «Просмотра» поле — статичный текст, а не выключенный контрол: серая заглушка выглядела
// бы поломкой, хотя роль по §5.2 просто не имеет права менять доступы.
function teamMemberField(kind, member, label, value, options) {
  if (!teamCanManage()) return `<div class="field-control"><span class="field-label">${label}</span><strong class="member-static">${escapeDashboardText(value)}</strong></div>`
  return `<div class="field-control"><span class="field-label">${label}</span>
    <div class="field-select" data-team-${kind}="${member.id}">
      <button class="field-select-trigger" type="button" id="team-${kind}-${member.id}" aria-haspopup="listbox" aria-expanded="false"><span>${escapeDashboardText(value)}</span>${ADMIN_ICON('chevron-down')}</button>
      <div class="field-select-popover team-option-list" role="listbox" aria-label="${label}">${options}</div>
    </div></div>`
}

function teamManageRow(member) {
  const editable = teamCanManage()
  const status = teamStatus(member)
  const reason = member.role === 'owner' ? 'Владелец не удаляется — он всегда остаётся в команде'
    : member.id === CURRENT_MEMBER ? 'Нельзя удалить себя из команды' : ''
  return `<div class="member-card${member.status !== 'active' ? ` is-${member.status}` : ''}" role="listitem">
    <div class="member-card-top">
      <span class="avatar">${member.initials}</span>
      <span class="member-id"><strong>${escapeDashboardText(member.name)}${member.id === CURRENT_MEMBER ? '<em>это вы</em>' : ''}</strong><small>${escapeDashboardText(member.email)}</small></span>
      <span class="member-state is-${status.tone}">${status.label}</span>
      ${editable ? (reason
        ? `<span class="member-lock" data-tooltip="${reason}">${ADMIN_ICON('lock')}</span>`
        : `<button class="member-remove" type="button" data-team-remove="${member.id}" aria-label="Удалить из команды: ${escapeDashboardText(member.name)}" data-tooltip="Удалить из команды">${ADMIN_ICON('trash')}</button>`) : ''}
    </div>
    <div class="member-card-fields">
      ${teamMemberField('role', member, 'Роль', ADMIN_ROLES[member.role].name, teamRoleOptions(member.role))}
      ${teamMemberField('access', member, 'Область доступа', member.access, teamAccessOptions(member.access))}
      ${editable && member.status !== 'invited' ? `<div class="field-control member-switch-cell"><span class="field-label">Временное отключение</span>
        <button class="member-switch${member.status === 'disabled' ? ' is-on' : ''}" type="button" role="switch" aria-checked="${String(member.status === 'disabled')}" data-team-switch="${member.id}" aria-label="Временное отключение: ${escapeDashboardText(member.short)}"><span></span></button></div>` : ''}
    </div>
  </div>`
}

function renderTeamManage() {
  if (!teamManageBody) return
  teamManageBody.innerHTML = ADMIN_TEAM.map(teamManageRow).join('')
  bindFieldSelects(teamManageBody)
  bindTooltips(teamManageBody)
  const editable = teamCanManage()
  const role = ADMIN_ROLES[viewerRole]
  document.getElementById('teamManageNote').textContent = editable
    ? 'Состав, роли и области доступа демонстрационные: изменения живут только в этом мокапе.'
    : `Роль «${role.name}» видит состав, но не меняет доступы. Верните другую роль в селекторе выше.`
  const active = teamAssignable().length
  document.getElementById('teamManageFoot').textContent = `${ADMIN_TEAM.length} ${pluralizeDashboard(ADMIN_TEAM.length, ['участник', 'участника', 'участников'])} · активных ${active} · владельца ${teamOwners().length}`
  document.getElementById('teamInviteButton').classList.toggle('is-hidden', !editable)
}

function syncTeamViewSelect() {
  const role = ADMIN_ROLES[viewerRole]
  teamViewSelect.querySelector('.field-select-trigger span').textContent = role.name
  teamViewSelect.querySelectorAll('[role="option"]').forEach(option => option.setAttribute('aria-selected', String(option.dataset.value === viewerRole)))
  document.getElementById('teamViewNote').textContent = `Демонстрационный режим прав: меняет доступные действия во всём мокапе — очередь, панель команды и рельс виджетов. «${role.name}»: ${role.note}.`
}

// Селектор «Смотреть как» (§5.2) — единственный способ проверить механику прав, поэтому он
// перекрашивает не только очередь, но и панель, и окно управления, и рельс виджета.
function setViewerRole(role) {
  if (!ADMIN_ROLES[role] || role === viewerRole) return
  viewerRole = role
  syncTeamViewSelect()
  refreshTeamViews()
  if (isDashboardView()) renderDashboard()
  showToast('Режим просмотра', `Действия доступны как роли «${ADMIN_ROLES[role].name}»`)
}

// Состав видят четыре места: панель, окно управления, очередь кейсов и бейдж тулбара.
// renderAdmin обновляет последние два сам, поэтому здесь остаются панель и окно.
function refreshTeamViews() {
  renderAdmin()
  if (isTeamManageOpen()) renderTeamManage()
}

// Изменение, сделанное пока пользователь смотрит на вкладку «Участники», не имеет права
// становиться непрочитанным — то же правило, что для задач и активности (§4.2).
const teamSeen = () => teamWatched('members')

function setTeamRole(id, role) {
  const member = teamMember(id)
  if (!member || member.role === role) return
  // §5.2: владелец не может исчезнуть из команды, поэтому последнее владельческое назначение
  // отклоняется с объяснением, а селектор возвращается к прежнему значению.
  if (member.role === 'owner' && role !== 'owner' && teamOwners().length === 1) {
    showToast('Роль не снята', 'В команде должен остаться хотя бы один Владелец')
    renderTeamManage()
    focusTeamField(`team-role-${id}`)
    return
  }
  member.role = role
  member.seen = teamSeen()
  adminActivityPush('member', `${member.name}: роль изменена на «${ADMIN_ROLES[role].name}»`, null)
  refreshTeamViews()
  showToast('Роль обновлена', `${member.short} · ${ADMIN_ROLES[role].name} — ${ADMIN_ROLES[role].note}`)
}

function setTeamAccess(id, area) {
  const member = teamMember(id)
  if (!member || member.access === area) return
  member.access = area
  member.seen = teamSeen()
  adminActivityPush('member', `${member.name}: область доступа — ${area}`, null)
  refreshTeamViews()
  showToast('Область доступа изменена', `${member.short} · ${area}`)
}

function toggleTeamDisabled(id) {
  const member = teamMember(id)
  if (!member || member.status === 'invited') return
  member.status = member.status === 'disabled' ? 'active' : 'disabled'
  member.seen = teamSeen()
  adminActivityPush('member', member.status === 'disabled'
    ? `${member.name}: доступ временно отключён`
    : `${member.name}: доступ восстановлен`, null)
  refreshTeamViews()
  showToast(member.status === 'disabled' ? 'Доступ отключён' : 'Доступ восстановлен', member.status === 'disabled'
    ? `${member.short} не видит разделы и не может быть ответственным`
    : `${member.short} снова в команде`)
}

// Закрытие селектора фокусирует тот триггер, который пересборка карточек уже заменила,
// поэтому возврат фокуса идёт отложенным вызовом.
function focusTeamField(id) {
  window.setTimeout(() => document.getElementById(id)?.focus?.({ preventScroll: true }), 0)
}

function openTeamManage() {
  renderTeamManage()
  syncTeamViewSelect()
  openModal('teamManageModal', '.team-view-select .field-select-trigger')
}

function closeTeamManage() {
  if (!isTeamManageOpen()) return
  closeModal('teamManageModal')
  // Кнопка открытия принадлежит панели, а панель за время окна могла пересобраться,
  // поэтому фокус возвращается на тело вкладки, а не на откреплённый узел.
  if (teamState.open) window.setTimeout(() => teamPanelBody.focus({ preventScroll: true }), 0)
}

function openTeamInvite() {
  teamInvite.role = 'analyst'
  teamInvite.scope = 'all'
  teamInvite.areas = [TEAM_CABINETS[0]]
  teamInvite.send = true
  teamInvite.touched = false
  document.getElementById('teamInviteEmail').value = ''
  renderTeamInvite()
  openModal('teamInviteModal', '#teamInviteEmail')
}

function renderTeamInvite() {
  teamInviteRoleSelect.querySelector('.field-select-trigger span').textContent = ADMIN_ROLES[teamInvite.role].name
  teamInviteRoleSelect.querySelectorAll('[role="option"]').forEach(option => option.setAttribute('aria-selected', String(option.dataset.value === teamInvite.role)))
  document.querySelectorAll('[data-team-invite-scope]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.teamInviteScope === teamInvite.scope)))
  const areas = document.getElementById('teamInviteAreas')
  areas.classList.toggle('is-hidden', teamInvite.scope !== 'picked')
  areas.innerHTML = TEAM_CABINETS.map(cabinet => `<button type="button" class="team-pick${teamInvite.areas.includes(cabinet) ? ' is-on' : ''}" data-team-invite-area="${escapeDashboardText(cabinet)}" aria-pressed="${String(teamInvite.areas.includes(cabinet))}"><span class="check-control">${ADMIN_ICON('check')}</span>${cabinet}</button>`).join('')
  document.getElementById('teamInviteSend').setAttribute('aria-checked', String(teamInvite.send))
  updateTeamInvite()
}

function teamInviteError() {
  const email = document.getElementById('teamInviteEmail').value.trim()
  if (!email) return 'Укажите email участника'
  if (!TEAM_EMAIL.test(email)) return 'Нужен адрес вида name@company.ru'
  if (ADMIN_TEAM.some(member => member.email.toLowerCase() === email.toLowerCase())) return 'Такой email уже в команде'
  if (teamInvite.scope === 'picked' && !teamInvite.areas.length) return 'Выберите хотя бы один кабинет'
  return ''
}

function updateTeamInvite() {
  const error = teamInviteError()
  const email = document.getElementById('teamInviteEmail').value.trim()
  const state = document.getElementById('teamInviteState')
  state.textContent = error && teamInvite.touched ? error
    : !email ? 'Демо: письмо никуда не уходит, участник появится в составе сразу после сохранения.'
      : `${email} · ${ADMIN_ROLES[teamInvite.role].name} · ${teamInvite.scope === 'all' ? 'все кабинеты' : teamInvite.areas.join(', ')} · ${teamInvite.send ? 'приглашение будет отправлено' : 'без письма'}`
  state.classList.toggle('is-error', Boolean(error) && teamInvite.touched)
  document.getElementById('teamInviteSave').disabled = Boolean(error)
}

function saveTeamInvite() {
  if (teamInviteError()) return
  const email = document.getElementById('teamInviteEmail').value.trim()
  const local = email.split('@')[0]
  const member = {
    id: `invited-${teamInviteSeq++}`,
    name: email,
    short: local,
    initials: local[0].toUpperCase(),
    email,
    role: teamInvite.role,
    access: teamInvite.scope === 'all' ? 'Все кабинеты' : teamInvite.areas.join(', '),
    presence: 'off',
    status: 'invited',
    seen: teamSeen(),
  }
  ADMIN_TEAM.push(member)
  adminActivityPush('member', teamInvite.send
    ? `Приглашение отправлено на ${email} (${ADMIN_ROLES[member.role].name})`
    : `${email} добавлен(а) в команду без письма (${ADMIN_ROLES[member.role].name})`, null)
  closeModal('teamInviteModal')
  refreshTeamViews()
  showToast(teamInvite.send ? 'Приглашение создано' : 'Участник добавлен', `${email} · статус «Приглашён» · ${ADMIN_ROLES[member.role].name}`)
}

function openTeamRemove(id) {
  const member = teamMember(id)
  if (!member) return
  teamPendingRemove = id
  const cases = ADMIN_CASES.filter(item => item.owner === id && !ADMIN_DONE.includes(item.status)).length
  const tasks = adminTasks.filter(task => task.assignee === id && !task.done).length
  // Имя в кавычках, а не в винительном падеже: §6.2 требует точный объект, а склонять
  // «Удалить Анна Соколова…» демо-имена (и email приглашённого) мы не умеем.
  document.getElementById('teamRemoveTitle').textContent = `Удалить участника «${member.name}»?`
  document.getElementById('teamRemoveNote').textContent = `${member.email} · ${ADMIN_ROLES[member.role].name} · ${member.access}`
  document.getElementById('teamRemoveBody').innerHTML = `<ul>${
    [
      member.status === 'invited' ? 'Приглашение будет отозвано.' : 'Участник потеряет доступ к кабинентам команды.',
      cases ? `Откроет ${cases} ${pluralizeDashboard(cases, ['кейс', 'кейса', 'кейсов'])} без ответственного.` : 'Открытых кейсов за ним нет.',
      tasks ? `Снимет ${tasks} ${pluralizeDashboard(tasks, ['задачу', 'задачи', 'задач'])} с исполнения.` : 'Невыполненных задач за ним нет.',
    ].map(line => `<li>${line}</li>`).join('')
  }</ul>`
  openModal('teamRemoveModal', '#teamRemoveCancel')
}

function closeTeamRemove() {
  teamPendingRemove = null
  closeModal('teamRemoveModal')
}

function confirmTeamRemove() {
  const member = teamMember(teamPendingRemove)
  if (!member) return closeTeamRemove()
  ADMIN_TEAM.splice(ADMIN_TEAM.indexOf(member), 1)
  // Поручения не переназначаются молча: очередь обязана показать «Без ответственного»,
  // иначе кейс выглядел бы решённым тем, кого в команде уже нет.
  adminTasks.forEach(task => { if (task.assignee === member.id) task.assignee = null })
  ADMIN_CASES.forEach(item => { if (item.owner === member.id) item.owner = null })
  if (adminState.filters.owner === member.id) adminState.filters.owner = ''
  teamPendingRemove = null
  adminActivityPush('member', `${member.name} удалён(а) из команды`, null)
  closeModal('teamRemoveModal')
  refreshTeamViews()
  showToast('Участник удалён', `${member.name} · поручения остались без ответственного`)
}

document.getElementById('teamManageModal').addEventListener('click', event => {
  if (event.target.closest('#teamManageClose,#teamManageDone')) { closeTeamManage(); return }
  if (event.target.closest('#teamInviteButton')) { openTeamInvite(); return }
  const remove = event.target.closest('[data-team-remove]')
  if (remove) { openTeamRemove(remove.dataset.teamRemove); return }
  const toggle = event.target.closest('[data-team-switch]')
  if (toggle) toggleTeamDisabled(toggle.dataset.teamSwitch)
})

document.getElementById('teamInviteModal').addEventListener('click', event => {
  if (event.target.closest('#teamInviteClose,#teamInviteCancel')) { closeModal('teamInviteModal'); return }
  if (event.target.closest('#teamInviteSave')) { saveTeamInvite(); return }
  const mode = event.target.closest('[data-team-invite-scope]')
  if (mode) { teamInvite.scope = mode.dataset.teamInviteScope; renderTeamInvite(); return }
  const area = event.target.closest('[data-team-invite-area]')
  if (area) {
    const value = area.dataset.teamInviteArea
    teamInvite.areas = teamInvite.areas.includes(value) ? teamInvite.areas.filter(item => item !== value) : [...teamInvite.areas, value]
    renderTeamInvite()
    return
  }
  if (event.target.closest('#teamInviteSend')) { teamInvite.send = !teamInvite.send; renderTeamInvite() }
})
document.getElementById('teamInviteModal').addEventListener('input', event => {
  if (event.target.id === 'teamInviteEmail') { teamInvite.touched = true; updateTeamInvite() }
})
document.getElementById('teamInviteModal').addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.target.id !== 'teamInviteEmail' || teamInviteError()) return
  // Без preventDefault Enter доживает до кнопки, на которую closeModal вернул фокус, и модалка
  // открывается заново сразу после сохранения.
  event.preventDefault()
  saveTeamInvite()
})

// Выбор в селекторе приходит событием от bindFieldSelects, поэтому окно правит данные,
// а не перехватывает клики по пунктам списка.
document.getElementById('teamManageModal').addEventListener('fieldselect', event => {
  const select = event.target.closest('.field-select')
  if (!select) return
  // У «Смотреть как» атрибут без значения, поэтому проверяем его наличие: dataset прочитал бы
  // пустую строку и выбор роли молча провалился бы.
  if (select.hasAttribute('data-team-view-as')) { setViewerRole(event.detail.value); return }
  if (select.dataset.teamRole) setTeamRole(select.dataset.teamRole, event.detail.value)
  if (select.dataset.teamAccess) setTeamAccess(select.dataset.teamAccess, event.detail.value)
})
document.getElementById('teamInviteModal').addEventListener('fieldselect', event => {
  if (event.target.closest('[data-team-invite-role]')) {
    teamInvite.role = event.detail.value
    renderTeamInvite()
  }
})
document.getElementById('teamRemoveModal').addEventListener('click', event => {
  if (event.target.closest('#teamRemoveClose,#teamRemoveCancel')) closeTeamRemove()
  if (event.target.closest('#teamRemoveConfirm')) confirmTeamRemove()
})

// Пункты «Смотреть как» и «Роль» приглашения живут в статичном остове, поэтому их список
// заполняется до bindFieldSelects() — иначе привязка не увидела бы ни одного option.
teamViewSelect.querySelector('.field-select-popover').innerHTML = teamRoleOptions(viewerRole)
teamInviteRoleSelect.querySelector('.field-select-popover').innerHTML = teamRoleOptions(teamInvite.role)

const shell = document.getElementById('appShell')
const sidebar = document.querySelector('.sidebar')
const collapseButton = document.getElementById('sidebarCollapse')
let workspaceMode = 'overview'
let presentationReturnMode = 'overview'

function setDashboardZoom(value) {
  dashboardCamera.zoom = Math.max(.5, Math.min(2, value / 100))
  renderDashboard()
}

function fitDashboard() {
  const viewport = document.querySelector('.dashboard-stage-wrap')
  const widgets = activeDashboardLayout()
  if (!viewport || !widgets.length) return setDashboardZoom(100)
  const rect = viewport.getBoundingClientRect()
  const minX = Math.min(...widgets.map(widget => widget.x))
  const minY = Math.min(...widgets.map(widget => widget.y))
  const maxX = Math.max(...widgets.map(widget => widget.x + widget.w))
  const maxY = Math.max(...widgets.map(widget => widget.y + widget.h))
  const zoom = Math.max(.5, Math.min(1.35, Math.min((rect.width - 96) / (maxX - minX), (rect.height - 160) / (maxY - minY))))
  dashboardCamera.zoom = zoom
  dashboardCamera.x = (rect.width - (maxX - minX) * zoom) / 2 - minX * zoom
  dashboardCamera.y = 76 - minY * zoom
  renderDashboard()
}

function setWorkspaceMode(mode) {
  if (mode === 'presentation') presentationReturnMode = workspaceMode === 'dashboard' ? 'dashboard' : 'overview'
  workspaceMode = ['overview', 'dashboard', 'presentation'].includes(mode) ? mode : 'overview'
  menuData.mode.forEach(item => { item.selected = item.value === workspaceMode })
  shell.classList.remove('mode-overview', 'mode-dashboard', 'mode-presentation')
  shell.classList.add(`mode-${workspaceMode}`)
  const labels = { overview: 'Обзор недели', dashboard: 'Мой дашборд', presentation: 'Презентация' }
  document.getElementById('modeValue').textContent = labels[workspaceMode]
  closeDetails()
  hideTooltip()
}

function setSidebarCollapsed(collapsed) {
  if (shell.classList.contains('is-collapsed') === collapsed) return false
  shell.classList.toggle('is-collapsed', collapsed)
  collapseButton.setAttribute('aria-label', collapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель')
  collapseButton.dataset.tooltip = collapsed ? 'Развернуть панель' : 'Свернуть панель'
  hideTooltip()
  document.getElementById('tooltip').textContent = collapseButton.dataset.tooltip
  return true
}

collapseButton.addEventListener('click', () => setSidebarCollapsed(!shell.classList.contains('is-collapsed')))

// Пока открыта форма KPI, сайдбар сворачивается, чтобы превью-стопка влезла слева.
// Прежнее состояние запоминаем и возвращаем при закрытии — вручную его не трогаем.
let kpiEditorSidebarMemory = null
function setKpiEditorSidebar(open) {
  if (open) {
    if (kpiEditorSidebarMemory === null) kpiEditorSidebarMemory = shell.classList.contains('is-collapsed')
    setSidebarCollapsed(true)
  } else if (kpiEditorSidebarMemory !== null) {
    setSidebarCollapsed(kpiEditorSidebarMemory)
    kpiEditorSidebarMemory = null
  }
}
function bindEdgeGlow(el) {
  if (!el) return
  el.addEventListener('pointermove', event => {
    const bounds = el.getBoundingClientRect()
    el.style.setProperty('--rail-x', `${event.clientX - bounds.left}px`)
    el.style.setProperty('--rail-y', `${event.clientY - bounds.top}px`)
    el.style.setProperty('--rail-active', '1')
  })
  el.addEventListener('pointerleave', () => el.style.setProperty('--rail-active', '0'))
}
[sidebar, ...document.querySelectorAll('.toolbar,.sheet-chrome,.zoom-control,.dashboard-kpi-settings,.dashboard-minimap')].forEach(bindEdgeGlow)
document.querySelectorAll('.nav-item[data-view]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)))
document.getElementById('newPlanButton').addEventListener('click', renderPlansForm)
document.getElementById('zoomOut').addEventListener('click', () => setDashboardZoom(dashboardCamera.zoom * 100 - 10))
document.getElementById('zoomIn').addEventListener('click', () => setDashboardZoom(dashboardCamera.zoom * 100 + 10))
document.getElementById('zoomFit').addEventListener('click', fitDashboard)
document.getElementById('presentationExit').addEventListener('click', () => setWorkspaceMode(presentationReturnMode))

function selectDashboardSheet(id) {
  if (!dashboardSheets.some(sheet => sheet.id === id)) return
  activeDashboardSheet = id
  dashboardEditing = false
  clearDashboardSelection()
  renamingDashboardSheet = null
  closeDashboardKpiEditor()
  closeSheetContextMenu()
  // Оба слоя значка крепятся к конкретной вкладке или строке — смена листа снимает раскрытие.
  closeSheetIconPopover()
  closeAllSheetsPanel()
  renderDashboard()
}

// Панель «Все листы» закрывают четыре места, разворот значка обязан гаснуть вместе с ней.
function closeAllSheetsPanel() {
  const popover = document.getElementById('allSheetsPopover')
  popover.classList.remove('is-open')
  popover.setAttribute('aria-hidden', 'true')
  document.getElementById('allSheetsButton').setAttribute('aria-expanded', 'false')
  closeSheetIconFold()
  // ⋯-меню, открытое из строки панели, принадлежит этой панели: иначе оно повисало бы
  // раскрытым (а пункт «Значок» — ещё и своим drill-сеткой) над уже закрытым списком.
  if (sheetMenuScope === '#allSheetsList') closeSheetContextMenu()
}

function createDashboardSheet() {
  dashboardSheetIndex += 1
  const id = `sheet-${dashboardSheetIndex}`
  dashboardSheets.push({ id, name: `Лист ${dashboardSheetIndex}`, isDefault: false, model: new DashboardLayoutModel([]) })
  selectDashboardSheet(id)
}

let lastScrolledActiveSheet = null
function scrollActiveSheetIntoView() {
  const scroll = document.getElementById('sheetScroll')
  const active = scroll?.querySelector('.sheet-tab.is-active')
  if (!active) return
  // Подтягиваем рельс только когда сменился активный лист: перерисовка из-за
  // изменения счётчика виджетов не должна возвращать пользователя к началу.
  if (active.dataset.sheet === lastScrolledActiveSheet) return
  lastScrolledActiveSheet = active.dataset.sheet
  const box = scroll.getBoundingClientRect(), tab = active.getBoundingClientRect()
  if (tab.left < box.left) scroll.scrollLeft -= box.left - tab.left + 12
  else if (tab.right > box.right) scroll.scrollLeft += tab.right - box.right + 12
}

function updateSheetScrollButtons() {
  const scroll = document.getElementById('sheetScroll')
  if (!scroll) return
  document.getElementById('sheetsScrollLeft').disabled = scroll.scrollLeft <= 1
  document.getElementById('sheetsScrollRight').disabled = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 1
}

let dashboardSheetClickTimer = null
document.getElementById('sheetTabs').addEventListener('click', event => {
  const menu = event.target.closest('[data-sheet-menu]')
  if (menu) {
    event.stopPropagation()
    openSheetContextMenu(menu.dataset.sheetMenu, menu)
    return
  }
  // Значок стоит левее кнопки выбора и обязан открывать свой слой, а не переключать лист.
  // stopPropagation тут не нужен: наружный «клик вне поповера» ищет [data-sheet-icon],
  // а атрибут остаётся на мишени, даже когда вкладка пересобрана, — в отличие от «кликов вне панели».
  const icon = event.target.closest('[data-sheet-icon]')
  if (icon) {
    toggleSheetIconPopover(icon.dataset.sheetIcon)
    return
  }
  const button = event.target.closest('[data-sheet-select]')
  if (button) {
    window.clearTimeout(dashboardSheetClickTimer)
    dashboardSheetClickTimer = window.setTimeout(() => selectDashboardSheet(button.dataset.sheetSelect), 190)
  }
})
document.getElementById('sheetTabs').addEventListener('dblclick', event => {
  const button = event.target.closest('[data-sheet-select]')
  if (button) {
    window.clearTimeout(dashboardSheetClickTimer)
    startDashboardSheetRename(button.dataset.sheetSelect)
  }
})
document.getElementById('sheetTabs').addEventListener('keydown', event => {
  const input = event.target.closest('[data-sheet-rename]')
  if (!input) return
  if (event.key === 'Enter') { event.preventDefault(); commitDashboardSheetRename(input.dataset.sheetRename, input.value) }
  if (event.key === 'Escape') { event.preventDefault(); cancelDashboardSheetRename() }
})
document.getElementById('sheetTabs').addEventListener('focusout', event => {
  const input = event.target.closest('[data-sheet-rename]')
  // Отмена по Esc сбрасывает флаг и пересобирает рельс, а снятие узла с фокусом рождает
  // focusout уже после этого. В оригинале onBlur не стреляет — React снимает input вместе с
  // правкой, — поэтому здесь отменённая правка коммитилась бы набранным текстом.
  if (input && renamingDashboardSheet === input.dataset.sheetRename) commitDashboardSheetRename(input.dataset.sheetRename, input.value)
})
document.getElementById('allSheetsList').addEventListener('click', event => {
  const menu = event.target.closest('[data-sheet-menu]')
  if (menu) {
    event.stopPropagation()
    openSheetContextMenu(menu.dataset.sheetMenu, menu)
    return
  }
  const icon = event.target.closest('[data-sheet-icon]')
  if (icon) {
    // Разворот пересобирает список, и мишень выпадает из DOM: наружный «клик вне панели»
    // по отсоединённой кнопке панель не узнает и свернул бы её вместе с полосой.
    event.stopPropagation()
    toggleSheetIconFold(icon.dataset.sheetIcon)
    return
  }
  const button = event.target.closest('[data-sheet-select]')
  if (button) selectDashboardSheet(button.dataset.sheetSelect)
})
document.querySelector('.add-sheet').addEventListener('click', createDashboardSheet)
// Вкладки и строки списка листов перерисовываются целиком, как и сетка значков, а привязка
// [data-tooltip] на старте находит только уже существующие узлы — подсказку держим делегированием.
// Таблица РНП пересобирается в renderRnp() при каждой смене периода, поэтому и она здесь.
const delegatedTooltipBoxes = [document.getElementById('sheetTabs'), document.getElementById('allSheetsList'), document.getElementById('sheetContextMenu'), document.getElementById('sheetIconPopover'), document.getElementById('rnpTable'), document.getElementById('rnpPlanSummary'), document.getElementById('rnpMetricsSheet'), document.getElementById('settingsContent')]
delegatedTooltipBoxes.forEach(box => {
  const tipOf = event => event.target.closest('[data-tooltip]')
  box.addEventListener('pointerover', event => {
    const tip = tipOf(event)
    if (!tip) return
    // Раскрытый триггер подсказку не просит: под курсором уже его собственный слой,
    // и «Сменить значок» лёг бы поверх той же вкладки.
    if (tip.getAttribute('aria-expanded') === 'true') { hideTooltip(); return }
    showTooltip(tip)
  })
  box.addEventListener('pointerout', event => { const tip = tipOf(event); if (tip && !tip.contains(event.relatedTarget)) hideTooltip() })
  box.addEventListener('focusin', event => { const tip = tipOf(event); if (tip) showTooltip(tip) })
  box.addEventListener('focusout', hideTooltip)
})
document.getElementById('allSheetsCreate').addEventListener('click', createDashboardSheet)
document.getElementById('sheetCollapse').addEventListener('click', () => {
  const panel = document.querySelector('.bottom-panel')
  const collapsed = panel.classList.toggle('is-collapsed')
  const button = document.getElementById('sheetCollapse')
  button.dataset.tooltip = collapsed ? 'Показать листы' : 'Скрыть листы'
  button.setAttribute('aria-label', button.dataset.tooltip)
  // Панель масштаба должна опуститься/подняться вместе с анимацией сворачивания листов.
  requestAnimationFrame(() => refreshFloatingDashboardPanels(true))
})
document.getElementById('allSheetsButton').addEventListener('click', () => {
  const popover = document.getElementById('allSheetsPopover')
  if (popover.classList.contains('is-open')) { closeAllSheetsPanel(); return }
  popover.classList.add('is-open')
  popover.setAttribute('aria-hidden', 'false')
  document.getElementById('allSheetsButton').setAttribute('aria-expanded', 'true')
})
document.getElementById('allSheetsClose').addEventListener('click', closeAllSheetsPanel)
document.getElementById('sheetsScrollLeft').addEventListener('click', () => document.getElementById('sheetScroll').scrollBy({ left: -200, behavior: 'smooth' }))
document.getElementById('sheetsScrollRight').addEventListener('click', () => document.getElementById('sheetScroll').scrollBy({ left: 200, behavior: 'smooth' }))
// Прокрутка рельса уносит вкладку из-под поповера, а крепится он один раз на открытии.
document.getElementById('sheetScroll').addEventListener('scroll', () => { updateSheetScrollButtons(); closeSheetIconPopover() })
// Полоса «Все листы» — слой вне списка: строка уезжает при прокрутке, слой должен следовать за ней.
// Места под строку при прокрутке не высвобождаем (makeRoom=false): растягивать список отступом —
// дело открытия, иначе прокрутка вверх спорит с авторастяжением.
document.getElementById('allSheetsList').addEventListener('scroll', () => positionSheetIconBand(false))

document.getElementById('dashboardEditToggle').addEventListener('click', () => {
  dashboardEditing = true
  renderDashboard()
})
document.getElementById('dashboardDone').addEventListener('click', () => {
  dashboardEditing = false
  clearDashboardSelection()
  closeDashboardKpiEditor()
  renderDashboard()
})
document.getElementById('dashboardUndo').addEventListener('click', () => { activeDashboardModel().undo(); renderDashboard() })
document.getElementById('dashboardRedo').addEventListener('click', () => { activeDashboardModel().redo(); renderDashboard() })
document.getElementById('dashboardReset').addEventListener('click', resetDashboardLayout)
document.getElementById('dashboardDeleteAll').addEventListener('click', () => { activeDashboardModel().clear(); clearDashboardSelection(); renderDashboard() })
document.getElementById('dashboardRuler').addEventListener('click', () => {
  dashboardRulerEnabled = !dashboardRulerEnabled
  dashboardMeasure = null
  renderDashboard()
})
document.querySelectorAll('.dashboard-minimap-toggle').forEach(button => button.addEventListener('click', () => { dashboardMinimapOpen = !dashboardMinimapOpen; renderDashboardMinimap() }))
document.getElementById('dashboardMinimapClose').addEventListener('click', () => { dashboardMinimapOpen = false; renderDashboardMinimap() })
document.querySelectorAll('.dashboard-grid-toggle').forEach(button => button.addEventListener('click', () => {
  dashboardGridVisible = !dashboardGridVisible
  shell.classList.toggle('dashboard-grid-hidden', !dashboardGridVisible)
  updateDashboardToolbar()
}))
document.getElementById('dashboardQuickNote').addEventListener('click', () => addDashboardWidget('note'))
document.getElementById('dashboardPresentation').addEventListener('click', () => setWorkspaceMode('presentation'))
// «Добавить» на листе больше не означает «KPI»: кнопка раскрывает меню выбора формата.
// Развилки в приложении нет (AddWidgetPanel знает только «Свой виджет», «Быстрый KPI» и
// «Заметку», а графики создают в Студии) — это нововведение мокапа, согласованное отдельно.
document.getElementById('dashboardAddWidget').addEventListener('click', () => {
  const menu = document.getElementById('dashboardAddMenu')
  if (menu.classList.contains('is-open')) closeDashboardAddMenu()
  else openDashboardAddMenu()
})
document.getElementById('dashboardAddMenu').addEventListener('click', event => {
  const choice = event.target.closest('[data-add-widget]')?.dataset.addWidget
  if (!choice) return
  // Меню складываем до открытия панели: редактор сам ставит aria-expanded на кнопку,
  // и раскрытое меню осталось бы вторым раскрытым состоянием одной кнопки.
  closeDashboardAddMenu()
  if (choice === 'chart') openDashboardChartEditor()
  else openDashboardKpiEditor()
})
document.addEventListener('click', event => {
  // Полоса значка — отдельный слой вне панели: клик по её сетке обязан оставлять открытой и панель.
  if (!event.target.closest('#allSheetsPopover,#allSheetsButton,#sheetIconBand')) closeAllSheetsPanel()
  if (!event.target.closest('#sheetContextMenu,[data-sheet-menu]')) closeSheetContextMenu()
  if (!event.target.closest('#sheetIconPopover,[data-sheet-icon]')) closeSheetIconPopover()
  // Полоса разворота живёт, только пока курсор в её области: клик по другой строке, шапке
  // панели или «Новому листу» складывает её, не трогая саму панель.
  if (!event.target.closest('#sheetIconBand,[data-sheet-icon]')) closeSheetIconFold()
  if (!event.target.closest('#copySourceMenu,[data-empty-action="copy"]')) closeCopySourceMenu()
  if (!event.target.closest('#dashboardAddMenu,#dashboardAddWidget')) closeDashboardAddMenu()
})
bindDashboardInteractions()
bindDashboardAdvancedInteractions()
document.querySelectorAll('.segmented button').forEach(button => button.addEventListener('click', () => {
  unit = button.dataset.unit
  document.querySelectorAll('.segmented button').forEach(item => item.classList.toggle('is-active', item === button))
  renderLegend()
  renderChart()
}))
document.querySelectorAll('.insight').forEach(button => button.addEventListener('click', () => openDetails(button.dataset.category)))
// «Способ применения», контроль и решение кейса переехали в делегирование adminClick:
// карточка пересобирается под каждый выбранный кейс (§3.2), поэтому слушатели по id здесь
// работали бы по узлам, которых больше нет.
document.getElementById('drawerClose').addEventListener('click', closeDetails)
document.getElementById('versionButton').addEventListener('click', () => openModal('versionModal', '#versionClose'))
document.getElementById('versionClose').addEventListener('click', () => closeModal('versionModal'))
document.getElementById('versionDone').addEventListener('click', () => closeModal('versionModal'))
document.getElementById('versionModal').addEventListener('click', event => { if (event.target.id === 'versionModal') closeModal('versionModal') })

const scenarioTrigger = document.getElementById('scenarioTrigger')
const scenarioPopover = document.getElementById('scenarioPopover')
const scenarioOptions = [...scenarioPopover.querySelectorAll('[role="option"]')]

function closeScenario({ restoreFocus = false } = {}) {
  const wasOpen = scenarioPopover.classList.contains('is-open')
  scenarioPopover.classList.remove('is-open')
  scenarioTrigger.setAttribute('aria-expanded', 'false')
  if (restoreFocus && wasOpen) scenarioTrigger.focus()
}

function openScenario() {
  closeContextMenu()
  hideTooltip()
  const workspace = document.querySelector('.workspace').getBoundingClientRect()
  const bounds = scenarioTrigger.getBoundingClientRect()
  const width = 330
  scenarioPopover.style.left = `${Math.max(10, Math.min(bounds.right - workspace.left - width, workspace.width - width - 10))}px`
  scenarioPopover.style.top = `${bounds.bottom - workspace.top + 6}px`
  scenarioPopover.classList.add('is-open')
  scenarioTrigger.setAttribute('aria-expanded', 'true')
  const selected = scenarioOptions.find(option => option.getAttribute('aria-selected') === 'true') || scenarioOptions[0]
  scenarioOptions.forEach(option => option.classList.toggle('is-focused', option === selected))
}

function chooseScenario(option) {
  scenarioOptions.forEach(item => item.setAttribute('aria-selected', String(item === option)))
  document.getElementById('scenarioValue').textContent = option.querySelector('strong').textContent
  setScenario(option.dataset.value)
  closeScenario({ restoreFocus: true })
}

scenarioTrigger.addEventListener('click', () => scenarioPopover.classList.contains('is-open') ? closeScenario() : openScenario())
scenarioOptions.forEach(option => option.addEventListener('click', () => chooseScenario(option)))
scenarioTrigger.addEventListener('keydown', event => {
  if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault()
    openScenario()
    scenarioOptions.find(option => option.getAttribute('aria-selected') === 'true')?.focus()
  }
})
scenarioPopover.addEventListener('keydown', event => {
  const active = document.activeElement
  const index = scenarioOptions.indexOf(active)
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    scenarioOptions[(index + step + scenarioOptions.length) % scenarioOptions.length].focus()
  }
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); chooseScenario(active) }
  if (event.key === 'Escape') { event.preventDefault(); closeScenario({ restoreFocus: true }) }
})

let activeFieldSelect = null
function closeFieldSelect({ restoreFocus = false } = {}) {
  if (!activeFieldSelect) return
  const trigger = activeFieldSelect.querySelector('.field-select-trigger')
  activeFieldSelect.querySelector('.field-select-popover').classList.remove('is-open')
  trigger.setAttribute('aria-expanded', 'false')
  activeFieldSelect = null
  if (restoreFocus) trigger.focus()
}

function bindFieldSelects(root = document) {
  root.querySelectorAll('.field-select:not([data-field-bound])').forEach(select => {
    select.dataset.fieldBound = 'true'
    const trigger = select.querySelector('.field-select-trigger')
    const popover = select.querySelector('.field-select-popover')
    const options = [...popover.querySelectorAll('[role="option"]')]
    const open = ({ focus = false, last = false } = {}) => {
      closeFieldSelect()
      closeScenario()
      closeContextMenu()
      activeFieldSelect = select
      popover.classList.add('is-open')
      trigger.setAttribute('aria-expanded', 'true')
      if (focus) (last ? options.at(-1) : options.find(option => option.getAttribute('aria-selected') === 'true') || options[0]).focus()
    }
    const choose = option => {
      options.forEach(item => item.setAttribute('aria-selected', String(item === option)))
      // data-label нужен пунктам с описанием (§5.2: роль показывается с подписью
      // разрешений) — иначе first child схлопнул бы название и описание в одну строку.
      trigger.querySelector('span').textContent = option.dataset.label || option.childNodes[0].textContent.trim()
      // Состояния у мокапа нет, поэтому выбор фильтра сообщается событием: «Товары»
      // перерисовывают таблицу, остальные экраны слушателя не навешивают.
      select.dispatchEvent(new CustomEvent('fieldselect', { bubbles: true, detail: { value: option.dataset.value } }))
      closeFieldSelect({ restoreFocus: true })
    }
    trigger.addEventListener('click', () => activeFieldSelect === select ? closeFieldSelect() : open())
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        open({ focus: true, last: event.key === 'ArrowUp' })
      }
    })
    options.forEach(option => option.addEventListener('click', () => choose(option)))
    popover.addEventListener('keydown', event => {
      const index = options.indexOf(document.activeElement)
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const step = event.key === 'ArrowDown' ? 1 : -1
        options[(index + step + options.length) % options.length].focus()
      }
      // Поповер съедает нажатие целиком: иначе Esc одновременно свернул бы и его, и док.
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeFieldSelect({ restoreFocus: true }) }
    })
  })
}

bindFieldSelects()

const menuData = {
  mode: [
    { value: 'overview', mark: '01', title: 'Обзор недели', note: 'Готовый системный отчёт', selected: true },
    { value: 'presentation', mark: '02', title: 'Презентация', note: 'Просмотр без редакторских элементов' },
  ],
  company: [
    { mark: 'ВСЕ', title: 'Все юридические лица', note: 'Обе организации аккаунта', selected: true },
    { mark: 'ООО', title: 'ООО «Верена»', note: 'Активное юридическое лицо' },
    { mark: 'ИП', title: 'ИП Верена А. В.', note: 'Второе юридическое лицо' },
  ],
  market: SETTINGS_MARKET_MENU,
  account: [
    { mark: 'WB', title: 'Основной кабинет', note: 'Кабинет № 103287', selected: true },
    { mark: 'WB', title: 'Север', note: 'Кабинет № 118024' },
    { mark: 'OZ', title: 'Ozon · основной', note: 'Подключение запланировано' },
  ],
  period: [
    { mark: 'W18', title: '27 апр. – 3 мая', note: 'Текущая отчётная неделя', selected: true },
    { mark: 'W17', title: '20–26 апреля', note: 'Предыдущая неделя' },
    { mark: 'W16', title: '13–19 апреля', note: 'Историческая версия доступна' },
  ],
}

// menuData появляется только здесь, поэтому сохранённые в «Организации» имена накладываются
// на меню сейчас, а не в модуле аккаунта: иначе юрлицо стартовало бы с дефолтом оригинала.
accountSyncOrgNames()

const menuMeta = {
  mode: { kicker: 'РЕЖИМ РАБОТЫ', title: 'Представление', footer: 'Расчётные значения остаются неизменными' },
  company: { kicker: 'ЮРИДИЧЕСКОЕ ЛИЦО', title: 'Организация', footer: 'Доступно 2 юридических лица' },
  market: { kicker: 'ПЛОЩАДКА', title: 'Маркетплейс', footer: `Доступно ${Object.keys(SETTINGS_MARKETS).length} ${pluralizeDashboard(Object.keys(SETTINGS_MARKETS).length, ['маркетплейс', 'маркетплейса', 'маркетплейсов'])}` },
  account: { kicker: 'КАБИНЕТ МАРКЕТПЛЕЙСА', title: 'Кабинет', footer: 'Доступно 3 кабинета' },
  period: { kicker: 'ОТЧЁТНЫЙ ПЕРИОД', title: 'Неделя', footer: 'Доступно 3 отчётные недели' },
}

const contextMenu = document.getElementById('contextMenu')
let activeMenuTrigger = null

function closeContextMenu({ restoreFocus = false } = {}) {
  const wasOpen = contextMenu.classList.contains('is-open')
  contextMenu.classList.remove('is-open')
  contextMenu.setAttribute('aria-hidden', 'true')
  document.querySelectorAll('.menu-trigger').forEach(trigger => trigger.setAttribute('aria-expanded', 'false'))
  if (restoreFocus && wasOpen) activeMenuTrigger?.focus()
  activeMenuTrigger = null
}

function openContextMenu(trigger) {
  closeScenario()
  hideTooltip()
  const entries = menuData[trigger.dataset.menu]
  const meta = menuMeta[trigger.dataset.menu]
  contextMenu.innerHTML = `<header class="popover-header"><span>${meta.kicker}</span><strong>${meta.title}</strong></header><div class="popover-options">${entries.map((item, index) => `<button role="menuitemradio" aria-checked="${Boolean(item.selected)}" data-index="${index}"><span class="menu-mark">${item.mark}</span><span class="popover-copy"><strong>${item.title}</strong><small>${item.note}</small></span><svg class="menu-check"><use href="#i-check"/></svg></button>`).join('')}</div><footer class="popover-footer">${meta.footer}</footer>`
  const workspace = document.querySelector('.workspace').getBoundingClientRect()
  const bounds = trigger.getBoundingClientRect()
  const desiredLeft = bounds.left - workspace.left
  contextMenu.style.left = `${Math.max(10, Math.min(desiredLeft, workspace.width - 346))}px`
  activeMenuTrigger = trigger
  trigger.setAttribute('aria-expanded', 'true')
  contextMenu.setAttribute('aria-hidden', 'false')
  contextMenu.classList.add('is-open')
  contextMenu.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    const selectedIndex = Number(button.dataset.index)
    entries.forEach((entry, index) => entry.selected = index === selectedIndex)
    if (activeMenuTrigger.dataset.menu === 'mode') {
      closeContextMenu()
      setWorkspaceMode(entries[selectedIndex].value)
      return
    }
    // Кабинет — одно состояние на весь мокап, а подпись и метка площадки у его триггера
    // свои, поэтому ветка account уходит в chooseAccount(), а не дублирует присваивания.
    if (activeMenuTrigger.dataset.menu === 'account') {
      closeContextMenu({ restoreFocus: true })
      chooseAccount(selectedIndex)
      return
    }
    // Площадка — фильтр раздела, а не подпись триггера: состояние живёт в settingsState,
    // и его отдаёт сетке renderSettings(), который заодно возвращает подпись и отметку пункта.
    if (activeMenuTrigger.dataset.menu === 'market') {
      closeContextMenu({ restoreFocus: true })
      settingsState.market = entries[selectedIndex].value
      renderSettings()
      return
    }
    const labels = activeMenuTrigger.querySelectorAll('span')
    const targetLabel = activeMenuTrigger.dataset.menu === 'account' ? labels[labels.length - 1] : labels[0]
    if (targetLabel) targetLabel.textContent = entries[selectedIndex].title
    // Кабинет принадлежит площадке: раньше метка «WB» не менялась даже при выборе Ozon-кабинета,
    // а подпись контекста РНП (§4.2) читает именно её.
    const mark = activeMenuTrigger.querySelector('.mp-mark')
    if (mark) mark.textContent = entries[selectedIndex].mark
    // Смена юрлица касается открытого раздела: РНП перерисовывает и таблицу, и строку
    // контекста, «Планы» — только плашку, чтобы не сбрасывать открытую форму нового плана.
    if (shell.classList.contains('is-rnp')) renderRnp()
    if (shell.classList.contains('is-plans')) renderPlansContext()
    closeContextMenu({ restoreFocus: true })
  }))
}

document.querySelectorAll('.menu-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    if (activeMenuTrigger === trigger && contextMenu.classList.contains('is-open')) closeContextMenu()
    else openContextMenu(trigger)
  })
  trigger.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      openContextMenu(trigger)
      const items = [...contextMenu.querySelectorAll('button')]
      ;(event.key === 'ArrowDown' ? items[0] : items.at(-1))?.focus()
    }
  })
})
contextMenu.addEventListener('keydown', event => {
  const items = [...contextMenu.querySelectorAll('button')]
  const index = items.indexOf(document.activeElement)
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    items[(index + step + items.length) % items.length].focus()
  }
  if (event.key === 'Escape') { event.preventDefault(); closeContextMenu({ restoreFocus: true }) }
})

const datePicker = document.getElementById('datePicker')
const calendarMonths = document.getElementById('calendarMonths')
const datePickerTitle = document.getElementById('datePickerTitle')
const datePickerPresets = document.getElementById('datePickerPresets')
const datePrev = document.getElementById('datePrev')
const dateNext = document.getElementById('dateNext')
let activeDatePickerTarget = null
let datePickerMonth = new Date(2026, 3, 1)
let dateDraftFrom = null
let dateDraftTo = null

const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const weekdayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseIsoDate(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (![year, month, day].every(Number.isFinite)) return null
  return new Date(year, month - 1, day)
}

function dayLabel(date) {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
}

// Даты диапазона — в родительном падеже и с точкой, как подписано в самом макете
// («27 апр. – 3 мая»); именительный («27 апр») читался бы как обрывок.
const monthRanges = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.']

function rangeLabel(from, to) {
  return `${from.getDate()} ${monthRanges[from.getMonth()]} – ${to.getDate()} ${monthRanges[to.getMonth()]}`
}

function sameDay(left, right) {
  return Boolean(left && right && left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate())
}

function dayBetween(day, from, to) {
  return Boolean(day && from && to && day >= from && day <= to)
}

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function renderCalendarMonth(month, from, to, kind) {
  const offset = (month.getDay() + 6) % 7
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = []
  for (let index = 0; index < 42; index += 1) {
    const dayNumber = index - offset + 1
    const day = new Date(month.getFullYear(), month.getMonth(), dayNumber)
    const isOutside = day.getMonth() !== month.getMonth()
    const isStart = sameDay(day, from)
    const isEnd = sameDay(day, to)
    const isSelected = kind === 'single' ? isStart : isStart || isEnd
    const isMiddle = kind === 'range' && dayBetween(day, from, to) && !isStart && !isEnd
    const classes = ['calendar-day']
    if (isOutside) classes.push('is-outside')
    if (sameDay(day, new Date(2026, 8, 20))) classes.push('is-today')
    if (isSelected) classes.push('is-selected')
    if (kind === 'single' && isSelected) classes.push('is-single-selected')
    if (isMiddle) classes.push('is-range')
    if (kind === 'range' && isStart) classes.push('is-range-start')
    if (kind === 'range' && isEnd) classes.push('is-range-end')
    cells.push(`<button class="${classes.join(' ')}" type="button" data-day="${isoDate(day)}" aria-label="${dayLabel(day)}" ${isOutside || day.getFullYear() < 2025 ? 'tabindex="-1"' : ''}>${day.getDate()}</button>`)
  }
  return `<section class="calendar-month"><header><strong>${monthNames[month.getMonth()]} ${month.getFullYear()}</strong></header><div class="calendar-weekdays">${weekdayNames.map(day => `<span>${day}</span>`).join('')}</div><div class="calendar-grid">${cells.join('')}</div></section>`
}

function renderDatePicker() {
  if (!activeDatePickerTarget) return
  const kind = activeDatePickerTarget.dataset.calendar
  // Вне РНП триггер периода — это выбор недели: отчёт существует по изолированным неделям.
  // В РНП период может быть длиннее недели, поэтому там тот же триггер работает как диапазон
  // (два клика) и показывает все быстрые пресеты.
  const weekOnly = activeDatePickerTarget.id === 'periodTrigger' && !shell.classList.contains('is-rnp')
  const months = kind === 'range' ? [datePickerMonth, new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1, 1)] : [datePickerMonth]
  calendarMonths.innerHTML = months.map(month => renderCalendarMonth(month, dateDraftFrom, dateDraftTo, kind)).join('')
  const draftTitle = dateDraftTo ? 'Выберите период' : dateDraftFrom ? 'Выберите дату окончания' : 'Выберите дату начала'
  datePickerTitle.textContent = kind === 'range' ? (weekOnly ? 'Выберите неделю' : draftTitle) : 'Дата начала'
  datePickerPresets.classList.toggle('is-hidden', kind !== 'range')
  datePickerPresets.querySelectorAll('[data-preset]').forEach(button => {
    button.style.display = weekOnly && button.dataset.preset !== 'week' ? 'none' : ''
  })
}

function positionDatePicker(trigger) {
  // Под Admin Console (§4.1) .workspace скрыта вместе с shell'ом, и её rect даёт нули:
  // формула ниже отправила бы календарь в левый верхний угол. Пока слой консоли — дом для
  // поповера, его fixed-прямоугольник и есть вьюпорт, поэтому берём геометрию окна.
  const workspace = document.body.classList.contains('is-admin-console')
    ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
    : document.querySelector('.workspace').getBoundingClientRect()
  const bounds = trigger.getBoundingClientRect()
  const width = activeDatePickerTarget.dataset.calendar === 'range' ? 560 : 270
  const height = activeDatePickerTarget.dataset.calendar === 'range' ? 330 : 285
  const anchorLeft = trigger.id === 'periodTrigger'
    ? bounds.left - workspace.left + (bounds.width / 2) - (width / 2)
    : bounds.left - workspace.left
  const left = Math.max(10, Math.min(anchorLeft, workspace.width - width - 10))
  const below = bounds.bottom - workspace.top + 7
  const top = below + height <= workspace.height ? below : Math.max(10, bounds.top - workspace.top - height - 7)
  datePicker.style.width = `${width}px`
  datePicker.style.left = `${left}px`
  datePicker.style.top = `${top}px`
}

function closeDatePicker({ restoreFocus = false } = {}) {
  if (!activeDatePickerTarget) return
  const target = activeDatePickerTarget
  datePicker.classList.remove('is-open')
  datePicker.setAttribute('aria-hidden', 'true')
  target.setAttribute('aria-expanded', 'false')
  activeDatePickerTarget = null
  if (restoreFocus) target.focus()
}

function openDatePicker(trigger) {
  closeContextMenu()
  closeScenario()
  closeFieldSelect()
  hideTooltip()
  activeDatePickerTarget = trigger
  const kind = trigger.dataset.calendar
  const input = trigger.dataset.input ? document.getElementById(trigger.dataset.input) : null
  if (kind === 'range') {
    dateDraftFrom = parseIsoDate(trigger.dataset.from) || new Date(2026, 3, 27)
    dateDraftTo = parseIsoDate(trigger.dataset.to) || new Date(2026, 4, 3)
  } else {
    dateDraftFrom = parseIsoDate(input?.value) || new Date(2026, 4, 1)
    dateDraftTo = null
  }
  datePickerMonth = monthStart(dateDraftFrom)
  renderDatePicker()
  positionDatePicker(trigger)
  datePicker.classList.add('is-open')
  datePicker.setAttribute('aria-hidden', 'false')
  trigger.setAttribute('aria-expanded', 'true')
}

// Три пути выбора периода (клик по неделе, два клика по дням, быстрый пресет) пишут одно и то
// же: data-from/data-to на триггере и подпись в toolbar'е. Точка сборки одна — поэтому здесь же
// пересобирается РНП, который читает период именно из этих атрибутов.
function setPeriodRange(trigger, from, to) {
  trigger.dataset.from = isoDate(from)
  trigger.dataset.to = isoDate(to)
  document.getElementById('periodValue').textContent = rangeLabel(from, to)
  renderActiveView()
}

function commitDate(day) {
  const trigger = activeDatePickerTarget
  if (!trigger) return
  if (trigger.id === 'periodTrigger' && !shell.classList.contains('is-rnp')) {
    const monday = new Date(day)
    monday.setDate(day.getDate() - ((day.getDay() + 6) % 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    setPeriodRange(trigger, monday, sunday)
    closeDatePicker({ restoreFocus: true })
    return
  }
  if (trigger.dataset.calendar === 'single') {
    const input = document.getElementById(trigger.dataset.input)
    if (input) input.value = isoDate(day)
    trigger.querySelector('span').textContent = dayLabel(day)
    closeDatePicker({ restoreFocus: true })
    // Экран выбирает, что делать с новой датой: «Контроль расчётов» пересчитывает блокировку
    // публикации. Собственных веток под каждый id здесь больше нет.
    input?.dispatchEvent(new CustomEvent('datecommit', { bubbles: true }))
    return
  }
  if (!dateDraftFrom || dateDraftTo) {
    dateDraftFrom = day
    dateDraftTo = null
    renderDatePicker()
    return
  }
  const [from, to] = day < dateDraftFrom ? [day, dateDraftFrom] : [dateDraftFrom, day]
  setPeriodRange(trigger, from, to)
  dateDraftFrom = from
  dateDraftTo = to
  closeDatePicker({ restoreFocus: true })
}

function applyDatePreset(preset) {
  if (!activeDatePickerTarget || activeDatePickerTarget.dataset.calendar !== 'range') return
  const ranges = {
    week: [new Date(2026, 3, 27), new Date(2026, 4, 3)],
    month: [new Date(2026, 4, 1), new Date(2026, 4, 31)],
    '30': [new Date(2026, 3, 4), new Date(2026, 4, 3)],
  }
  const range = ranges[preset]
  if (!range) return
  dateDraftFrom = range[0]
  dateDraftTo = range[1]
  setPeriodRange(activeDatePickerTarget, range[0], range[1])
  closeDatePicker({ restoreFocus: true })
}

calendarMonths.addEventListener('click', event => {
  const day = event.target.closest('[data-day]')
  if (day && !day.classList.contains('is-outside')) commitDate(parseIsoDate(day.dataset.day))
})
datePrev.addEventListener('click', () => { datePickerMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() - 1, 1); renderDatePicker() })
dateNext.addEventListener('click', () => { datePickerMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1, 1); renderDatePicker() })
datePickerPresets.addEventListener('click', event => { const button = event.target.closest('[data-preset]'); if (button) applyDatePreset(button.dataset.preset) })

function bindDatePickers(root = document) {
  root.querySelectorAll('[data-calendar]:not([data-calendar-bound])').forEach(trigger => {
    trigger.dataset.calendarBound = 'true'
    trigger.addEventListener('click', () => activeDatePickerTarget === trigger ? closeDatePicker() : openDatePicker(trigger))
  })
}

bindDatePickers()

const tooltip = document.getElementById('tooltip')
function hideTooltip() {
  clearTimeout(tooltipTimer)
  tooltip.classList.remove('is-visible')
}
function showTooltip(trigger) {
  // Снимаем предыдущий таймер: внутри одной вкладки pointerover срабатывает на каждой
  // дочерней иконке/подписи, а hideTooltip знает только о последнем id — «отменённый»
  // тултип вспыхивал уже после того, как курсор ушёл.
  clearTimeout(tooltipTimer)
  if (scenarioPopover.classList.contains('is-open') || contextMenu.classList.contains('is-open') || openModalBackdrop()) return
  // Под курсором переноса по очереди проезжают заголовки: их подсказки вспыхивали бы на
  // летящей колонке одна за другой.
  if (productColDragging) return
  if (trigger.classList.contains('nav-item') && !shell.classList.contains('is-collapsed')) return
  tooltip.textContent = trigger.dataset.tooltip
  const bounds = trigger.getBoundingClientRect()
  tooltip.dataset.side = ''
  // Ширину меряем при left:0: shrink-to-fit фиксированного элемента считается от
  // левого края до правой границы вьюпорта, поэтому «старое» left дал бы заниженную
  // ширину и placeRight выбрался бы неверно у правого края экрана.
  tooltip.style.left = '0px'
  const tipBounds = tooltip.getBoundingClientRect()
  const preferredSide = trigger.dataset.tooltipSide
  const placeRight = trigger.closest('.sidebar') || bounds.right + tipBounds.width + 18 < window.innerWidth
  if (preferredSide === 'bottom') {
    tooltip.dataset.side = 'bottom'
    tooltip.style.left = `${Math.max(8, Math.min(bounds.left + bounds.width / 2 - tipBounds.width / 2, window.innerWidth - tipBounds.width - 8))}px`
    tooltip.style.top = `${bounds.bottom + 9}px`
  } else if (placeRight) {
    tooltip.dataset.side = 'right'
    tooltip.style.left = `${bounds.right + 9}px`
    tooltip.style.top = `${Math.max(8, Math.min(bounds.top + bounds.height / 2 - tipBounds.height / 2, window.innerHeight - tipBounds.height - 8))}px`
  } else {
    tooltip.dataset.side = 'top'
    tooltip.style.left = `${Math.max(8, Math.min(bounds.left + bounds.width / 2 - tipBounds.width / 2, window.innerWidth - tipBounds.width - 8))}px`
    tooltip.style.top = `${bounds.top - tipBounds.height - 9}px`
  }
  tooltipTimer = window.setTimeout(() => {
    tooltip.classList.add('is-visible')
  }, 350)
}
document.querySelectorAll('[data-tooltip]').forEach(trigger => {
  trigger.addEventListener('pointerenter', () => showTooltip(trigger))
  trigger.addEventListener('pointerleave', hideTooltip)
  trigger.addEventListener('focus', () => showTooltip(trigger))
  trigger.addEventListener('blur', hideTooltip)
})
document.querySelectorAll('.canvas').forEach(canvas => canvas.addEventListener('scroll', hideTooltip, { passive: true }))
document.addEventListener('pointerdown', event => {
  if (!scenarioPopover.contains(event.target) && !scenarioTrigger.contains(event.target)) closeScenario()
  if (!contextMenu.contains(event.target) && !event.target.closest('.menu-trigger')) closeContextMenu()
  if (!event.target.closest('.field-select')) closeFieldSelect()
  if (!datePicker.contains(event.target) && !event.target.closest('[data-calendar]')) closeDatePicker()
  if (!rnpExportMenu.contains(event.target) && !event.target.closest('#rnpExportButton')) closeRnpExportMenu()
  if (!rnpMetricsSheet.contains(event.target) && !event.target.closest('#rnpMetricsButton,#rnpMetricsToolbarButton')) closeRnpMetrics()
  //Tab-кликер живёт вне панели, поэтому клик по нему не «внешний»: иначе pointerdown закрыл бы
  //док раньше, чем click успеет переключить вкладку, и вторая вкладка не открылась бы.
  if (!productsDockPanel.contains(event.target) && !event.target.closest('[data-products-dock]')) closeProductsDock()
  if (!productsFilterPop.contains(event.target) && !event.target.closest('[data-products-filter-pop]')) closeProductsFilterPop()
  if (!event.target.closest('#studioCardMenu,[data-studio-menu],[data-studio-action]')) closeStudioCardMenu()
  if (!event.target.closest('#studioSheetMenu,[data-studio-sheet],[data-studio-action="pin"]')) closeStudioSheetMenu()
  // Меню кейса якорится на кнопках шапки, которые пересобираются вместе с карточкой,
  // поэтому признак «свой» — дата-атрибут триггера, а не ссылка на узел.
  if (!event.target.closest('#adminActionMenu,[data-admin-menu]')) closeAdminMenu()
  // Панель команды лежит вне секций разделов, и её меню — fixed слой поверх неё, поэтому
  // «свой» для панели и триггер тулбара, и само меню, и её крестик.
  // Окно управления, приглашение и подтверждение стоят над панелью и кликаются сквозь неё:
  // без этих id клик по своей же модалке свернул бы панель под ней.
  if (!event.target.closest('#teamPanel,#teamPanelButton,#adminActionMenu,#teamManageModal,#teamInviteModal,#teamRemoveModal')) closeTeamPanel()
  // Меню вида синхронизации якорится на своей кнопке внутри карточки, поэтому «вне слоя»
  // означает «вне обёртки .settings-sync», а не вне конкретного поповера.
  if (!event.target.closest('.settings-sync')) closeSettingsSync()
})
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    // §4.1/§8: над консолью лежит только её рамка публикации, поэтому Esc в ней не должен
    // уходить в цепочку рабочего пространства — те слои скрыты вместе с shell'ом, и закрытие
    // «невидимого» слоя сработало бы как пропавшее нажатие.
    if (consoleState.open) {
      event.stopPropagation()
      if (openModalBackdrop()) closeOpenModal()
      else closeAdminConsole()
      return
    }
    if (workspaceMode === 'presentation') setWorkspaceMode(presentationReturnMode)
    // Вложенный слой закрывается первым: Esc в сетке значка возвращает к списку действий,
    // а не выбрасывает из меню целиком.
    if (sheetIconMenuDrill) { hideTooltip(); showSheetMenuDrill(false); return }
    if (sheetIconPickerId) { hideTooltip(); closeSheetIconPopover(); return }
    // Полоса значка — не отдельный слой, а часть силуэта панели (batch #23), и в оригинале
    // «Все листы» это один Popover, который Esc сворачивает целиком за одно нажатие. Поэтому
    // раскрытая полоса не имеет права съедать нажатие: её закрывает closeAllSheetsPanel().
    // §7: Esc снимает ровно один слой, а меню панели команды живёт над самой панелью, — признак
    // «что было сверху» снимаем до цепочки, иначе closeAdminMenu() стёр бы его раньше времени.
    // Рамка (§5) лежит над панелью, поэтому её присутствие тоже запрещает цепочке трогать панель:
    // иначе Esc из окна управления закрывал и окно, и панель под ним.
    const topLayerWasMenu = document.getElementById('adminActionMenu')?.classList.contains('is-open')
    const topLayerWasModal = Boolean(openModalBackdrop())
    closeDetails(); closeStudioLayers(); closeSettingsLayers(); closeOpenModal(); closeScenario({ restoreFocus: true }); closeContextMenu({ restoreFocus: true }); closeAdminMenu({ restoreFocus: true }); closeFieldSelect({ restoreFocus: true }); closeDatePicker({ restoreFocus: true }); closeRnpMetrics({ restoreFocus: true }); closeRnpExportMenu({ restoreFocus: true }); closeProductsFilterPop({ restoreFocus: true }); closeProductsDock({ restoreFocus: true }); closeSheetContextMenu(); closeCopySourceMenu(); closeDashboardAddMenu(); if (!topLayerWasMenu && !topLayerWasModal) closeTeamPanel({ restoreFocus: true }); hideTooltip()
    // Панель «Все листы» — самый внешний из листовых слоёв, поэтому её Esc добирается только
    // когда вложенный слой значка уже свёрнут. В поле переименования Esc занят отменой правки
    // (обработчик поля гасит renaming-флаг до того, как дойдёт до нас), поэтому проверяем цель.
    if (!event.target.closest?.('[data-sheet-rename]')) closeAllSheetsPanel()
  }
  navigateByShortcut(event)
  adminConsoleShortcut(event)
  // Ловушка общая для всех рамок: в мокапе их две, и вторая своим блоком только
  // продублировала бы обход кнопок.
  const modal = openModalBackdrop()
  if (event.key === 'Tab' && modal) {
    const focusable = [...modal.querySelectorAll('button:not(:disabled)')]
    const first = focusable[0]
    const last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
})

/* ── §12.8 Выход и экран входа ──────────────────────────────────────────────────────
   Оригинал завершает сеанс сразу по клику: в frontend/src/components/sidebar/Sidebar.tsx
   на кнопке стоит logout.mutate() без подтверждения, а страницу входа отдаёт GuestGuard.
   Подтверждение здесь — требование документа мокапа (§3.2), а не перенос из сервиса.
   Настоящего auth нет: экран входа — статичный слой, «Войти в демо» возвращает в
   «Недельный отчёт». Состояние выхода в localStorage не кладём: перезагрузка демо не
   должна попадать на экран входа, где нечего проверять. */
function showLoginScreen() {
  document.body.classList.add('is-logged-out')
  // reset() возвращает поля к разметке: email снова демонстрационный, пароль пустой.
  // Без этого набранный пароль переживал бы выход — в оригинале страница входа
  // монтируется заново и состояние формы начинается с нуля.
  document.getElementById('demoLoginForm').reset()
  document.getElementById('loginEmail').focus({ preventScroll: true })
}

function logoutDemo() {
  closeModal('logoutModal')
  showLoginScreen()
}

function enterDemo() {
  document.body.classList.remove('is-logged-out')
  switchView('report')
  showToast('Демо-вход выполнен', 'Показаны демонстрационные данные недели')
}

document.getElementById('logoutButton').addEventListener('click', () => openModal('logoutModal', '#logoutClose'))
document.getElementById('logoutClose').addEventListener('click', () => closeModal('logoutModal'))
document.getElementById('logoutCancel').addEventListener('click', () => closeModal('logoutModal'))
// Клик по затемнению — отмена, как в рамке «Версия»: выход подтверждает только кнопка.
document.getElementById('logoutModal').addEventListener('click', event => { if (event.target.id === 'logoutModal') closeModal('logoutModal') })
document.getElementById('logoutConfirm').addEventListener('click', logoutDemo)
// Отправка формы, а не click по кнопке: Enter в поле пароля работает как в LoginPage.tsx.
document.getElementById('demoLoginForm').addEventListener('submit', event => { event.preventDefault(); enterDemo() })

renderDashboard()
renderLegend()
renderChart()
renderWeeklyAnalytics()
// Очередь и карточка собираются сразу: раздел не должен показывать пустые контейнеры,
// если в него входят не через switchView (например, замером в проверке).
renderAdmin()
// Бейдж в тулбаре (§4.2) считается сразу от посева: панель могли ещё ни разу не открывать,
// а счётчик новых задач и записей активности виден на иконке «Команда».
renderTeamBadges()
openDetails('logistics')
closeDetails()
// Переключатель состояний — статичная разметка тулбара, подсвечиваем текущее состояние.
syncProductScreenState()
