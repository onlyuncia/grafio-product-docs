(function (root, factory) {
  const api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  if (root) root.GrafioDashboard = api
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const SNAP_THRESHOLD = 6
  const MIN_WIDTH = 168
  const MIN_HEIGHT = 104
  // Пороги равных зазоров — из frontend/src/hooks/use-snap-guides.ts: зазор ловится в 6 px,
  // в эталонные зазоры сцены попадают только расстояния до 400 px. Иначе гигантский пропуск
  // между группами виджетов притягивал бы карточку к себе как «образцовый» интервал.
  const SPACING_SNAP_THRESHOLD = 6
  const MAX_REFERENCE_GAP = 400
  // KPI-карточка — стандарт из каталога, а не настройка пользователя: её размер не тянут.
  const KPI_WIDTH = 232
  const KPI_HEIGHT = 140
  const CHART_WIDTH = 352
  const CHART_HEIGHT = 220

  const metric = (group, title, unitTag, value, source, icon, note = '', tone = '') => ({
    group, title, unitTag, unit: unitTag === '₽' ? 'В РУБЛЯХ' : unitTag === '%' ? 'В ПРОЦЕНТАХ' : 'В ШТУКАХ',
    value, source, icon, note, tone,
  })

  // Каталог зеркалит frontend/src/pages/reports/metrics-catalog.ts (METRICS_CATALOG):
  // те же группы, названия (без юнит-суффикса), единицы ₽/шт/% и источники.
  // Пары ₽/%/шт склеиваются в одну строку через общий title+source (как METRIC_EQUIVALENTS).
  // Ключи revenue/buyouts/margin/expenses закреплены под 4 стартовые карточки (§8 handoff).
  // Каждая карточка несёт сравнение с прошлой неделей: ₽/шт — в процентах, метрики-проценты —
  // в пунктах. Тон (зелёный/красный) задаёт не знак числа, а направление для бизнеса:
  // расходы и возвраты снижаются — это плюс; структурные доли остаются нейтральными.
  // Доли от выручки/выкупов, которые раньше стояли в подписи, перенесены в KPI_METRIC_TIPS.
  const KPI_METRICS = Object.freeze({
    // Заказы
    ordersAmt: metric('Заказы', 'Заказы', '₽', '1 968 420 ₽', 'Статистика', 'i-chart', '+12,8% к прошлой неделе', 'positive'),
    ordersQty: metric('Заказы', 'Заказы', 'шт', '3 192 шт', 'Статистика', 'i-boxes', '+9,4% к прошлой неделе', 'positive'),
    saOrdersAmt: metric('Заказы', 'Заказы', '₽', '1 942 180 ₽', 'Аналитика', 'i-receipt', '+11,5% к прошлой неделе', 'positive'),
    saOrdersQty: metric('Заказы', 'Заказы', 'шт', '3 108 шт', 'Аналитика', 'i-doc', '+8,7% к прошлой неделе', 'positive'),

    // Выручка
    revenue: metric('Выручка', 'Выручка', '₽', '1 877 774 ₽', 'Фин. отчёт', 'i-landmark', '+48,5% к прошлой неделе', 'positive'),
    revenueQty: metric('Выручка', 'Выручка', 'шт', '2 403 шт', 'Фин. отчёт', 'i-boxes', '+41,2% к прошлой неделе', 'positive'),
    buyouts: metric('Выручка', 'Выкупы', '₽', '1 390 434 ₽', 'Статистика', 'i-package-check', '+18,6% к прошлой неделе', 'positive'),
    buyoutsQty: metric('Выручка', 'Выкупы', 'шт', '2 186 шт', 'Статистика', 'i-box', '+14,3% к прошлой неделе', 'positive'),
    buyoutsAmt: metric('Выручка', 'Выкупы по дате продажи', '₽', '1 372 905 ₽', 'Расчёт', 'i-package-check', '+16,9% к прошлой неделе', 'positive'),
    buyoutsSaleQty: metric('Выручка', 'Выкупы по дате продажи', 'шт', '2 160 шт', 'Расчёт', 'i-package-check', '+13,1% к прошлой неделе', 'positive'),
    buyoutsOrderAmt: metric('Выручка', 'Выкупы по дате заказа', '₽', '1 401 220 ₽', 'Расчёт', 'i-package-check', '+21,4% к прошлой неделе', 'positive'),
    buyoutsOrderQty: metric('Выручка', 'Выкупы по дате заказа', 'шт', '2 195 шт', 'Расчёт', 'i-package-check', '+15,8% к прошлой неделе', 'positive'),
    returnsAmt: metric('Выручка', 'Возвраты', '₽', '487 340 ₽', 'Фин. отчёт', 'i-rotate-ccw', '−4,8% к прошлой неделе', 'positive'),
    returnsQty: metric('Выручка', 'Возвраты', 'шт', '217 шт', 'Фин. отчёт', 'i-rotate-ccw', '−2,3% к прошлой неделе', 'positive'),

    // Расходы
    expenses: metric('Расходы', 'Расходы', '₽', '643 453 ₽', 'Фин. отчёт', 'i-receipt', '−3,4% к прошлой неделе', 'positive'),
    sppAmt: metric('Расходы', 'СПП', '₽', '96 480 ₽', 'Расчёт', 'i-chart', '+11,3% к прошлой неделе', 'negative'),
    logisticsCost: metric('Расходы', 'Логистика', '₽', '247 497 ₽', 'Фин. отчёт', 'i-box', '+5,8% к прошлой неделе', 'negative'),
    commissionAmt: metric('Расходы', 'Комиссия МП', '₽', '241 936 ₽', 'Фин. отчёт', 'i-banknote', '+6,3% к прошлой неделе', 'negative'),
    penaltiesAmt: metric('Расходы', 'Штрафы', '₽', '6 667 ₽', 'Фин. отчёт', 'i-alert', '−25,0% к прошлой неделе', 'positive'),

    // Реклама
    adSpend: metric('Реклама', 'Рекламные расходы', '₽', '102 892 ₽', 'Продвижение', 'i-target', '+8,9% к прошлой неделе', 'negative'),
    cpcSpend: metric('Реклама', 'Расходы CPC', '₽', '64 210 ₽', 'Продвижение', 'i-target', '+11,2% к прошлой неделе', 'negative'),
    cpcSpendPct: metric('Реклама', 'Расходы CPC', '%', '3,4%', 'Продвижение', 'i-target', '−0,9 п.п. к прошлой неделе', 'positive'),
    cpmSpend: metric('Реклама', 'Расходы CPM', '₽', '38 682 ₽', 'Продвижение', 'i-target', '−0,7% к прошлой неделе', 'positive'),
    cpmSpendPct: metric('Реклама', 'Расходы CPM', '%', '2,1%', 'Продвижение', 'i-target', '−1,1 п.п. к прошлой неделе', 'positive'),
    cpcOrdersAmt: metric('Реклама', 'Заказы CPC', '₽', '512 340 ₽', 'Продвижение', 'i-receipt', '+24,6% к прошлой неделе', 'positive'),
    cpcOrdersPct: metric('Реклама', 'Заказы CPC', '%', '26,4%', 'Продвижение', 'i-receipt', '+2,8 п.п. к прошлой неделе'),
    cpmOrdersAmt: metric('Реклама', 'Заказы CPM', '₽', '301 220 ₽', 'Продвижение', 'i-receipt', '+6,4% к прошлой неделе', 'positive'),
    cpmOrdersPct: metric('Реклама', 'Заказы CPM', '%', '15,5%', 'Продвижение', 'i-receipt', '−1,2 п.п. к прошлой неделе'),
    adImpressions: metric('Реклама', 'Показы рекламы', 'шт', '489 320 шт', 'Продвижение', 'i-chart', '+22,5% к прошлой неделе', 'positive'),

    // Трафик
    totalClicks: metric('Трафик', 'Переходы в карточку', 'шт', '42 680 шт', 'Аналитика', 'i-search', '+14,7% к прошлой неделе', 'positive'),
    adClicks: metric('Трафик', 'Рекламные переходы', 'шт', '18 420 шт', 'Продвижение', 'i-target', '+18,9% к прошлой неделе', 'positive'),
    adClicksPct: metric('Трафик', 'Доля рекламных переходов', '%', '43,2%', 'Расчёт', 'i-target', '+2,6 п.п. к прошлой неделе'),
    organicClicks: metric('Трафик', 'Органические переходы', 'шт', '24 260 шт', 'Расчёт', 'i-search', '+11,4% к прошлой неделе', 'positive'),
    organicClicksPct: metric('Трафик', 'Доля органических переходов', '%', '56,8%', 'Расчёт', 'i-search', '−2,6 п.п. к прошлой неделе'),

    // Расчётные
    buyoutRate: metric('Расчётные', 'Процент выкупа по дате продажи', '%', '68,4%', 'Статистика', 'i-chart', '+1,4 п.п. к прошлой неделе', 'positive'),
    buyoutRateSa: metric('Расчётные', 'Процент выкупа по дате продажи', '%', '69,1%', 'Аналитика', 'i-chart', '+1,1 п.п. к прошлой неделе', 'positive'),
    buyoutRateOrder: metric('Расчётные', 'Процент выкупа по дате заказа', '%', '68,9%', 'Статистика', 'i-chart', '+1,7 п.п. к прошлой неделе', 'positive'),
    buyoutRateOrderSa: metric('Расчётные', 'Процент выкупа по дате заказа', '%', '69,6%', 'Аналитика', 'i-chart', '+1,3 п.п. к прошлой неделе', 'positive'),
    margin: metric('Расчётные', 'Маржа', '₽', '324 875 ₽', 'Расчёт', 'i-banknote', '+21,7% к прошлой неделе', 'positive'),
    marginPct: metric('Расчётные', 'Маржинальность', '%', '23,4%', 'Расчёт', 'i-chart', '+5,1 п.п. к прошлой неделе', 'positive'),
    drrGmv: metric('Расчётные', 'ДРР (от GMV)', '%', '5,2%', 'Расчёт', 'i-chart', '−0,2 п.п. к прошлой неделе', 'positive'),
    drrRevenue: metric('Расчётные', 'ДРР (от выкупа)', '%', '7,4%', 'Расчёт', 'i-chart', '−0,6 п.п. к прошлой неделе', 'positive'),
    cpc: metric('Расчётные', 'CPC', '₽', '5,59 ₽', 'Расчёт', 'i-banknote', '−2,4% к прошлой неделе', 'positive'),
    ctr: metric('Расчётные', 'CTR', '%', '3,8%', 'Расчёт', 'i-chart', '−0,1 п.п. к прошлой неделе', 'negative'),
    gmvTrend: metric('Расчётные', 'Прогноз GMV', '₽', '2 410 000 ₽', 'Расчёт', 'i-chart', '+6,2% к прошлой неделе', 'positive'),
    planPace: metric('Расчётные', 'Прогноз GMV', '%', '96%', 'Расчёт', 'i-chart', '−2,0 п.п. к прошлой неделе', 'negative'),
    planCompletion: metric('Расчётные', 'Выполнение плана', '%', '88%', 'Расчёт', 'i-target', '+4,0 п.п. к прошлой неделе', 'positive'),
    gmvPlanDay: metric('Расчётные', 'План на день', '₽', '86 000 ₽', 'Расчёт', 'i-target', '+0,0% к прошлой неделе'),
  })

  // Tooltip-подсказки «как считается / откуда берётся» — зеркало поля `tooltip`
  // из frontend/src/pages/reports/metrics-catalog.ts (ключи — наши метрики).
  const KPI_METRIC_TIPS = Object.freeze({
    ordersAmt: 'Общая сумма заказанных товаров.\nМожет не учитывать часть заказов из-за задержек обновления.\n\nИсточник: Статистика (supplier/orders)',
    ordersQty: 'Количество заказанных товаров.\nМожет не учитывать часть заказов из-за задержек обновления.\n\nИсточник: Статистика (supplier/orders)',
    saOrdersAmt: 'Сумма заказов. Совпадает с кабинетом WB.\n\nИсточник: Аналитика (sales-funnel)',
    saOrdersQty: 'Количество заказов. Совпадает с кабинетом WB.\n\nИсточник: Аналитика (sales-funnel)',
    revenue: 'Выручка по розничной цене до вычета СПП.\n\nИсточник: Фин. отчёт (reportDetailByPeriod)',
    revenueQty: 'Количество проданных единиц.\n\nИсточник: Фин. отчёт (reportDetailByPeriod)',
    buyouts: 'Сумма выкупленных товаров.\n\nИсточник: Статистика (supplier/sales)',
    buyoutsQty: 'Количество выкупленных товаров.\n\nИсточник: Статистика (supplier/sales)',
    buyoutsAmt: 'Чистый доход после возвратов.\nВыручка, ₽ − Возвраты, ₽\n\nИсточник: Расчёт',
    buyoutsSaleQty: 'Количество проданных товаров после возвратов.\nВыручка, шт − Возвраты, шт\n\nИсточник: Расчёт',
    buyoutsOrderAmt: 'Сумма подтверждённых выкупов для заказов, сделанных в этот день.\nВыручка (по дате заказа) − Возвраты (по дате заказа)\n\nЗначение растёт по мере выкупа заказов.\n\nИсточник: Фин. отчёт (order_date)',
    buyoutsOrderQty: 'Количество подтверждённых выкупов для заказов, сделанных в этот день.\nВыручка шт (по дате заказа) − Возвраты шт (по дате заказа)\n\nЗначение растёт по мере выкупа заказов.\n\nИсточник: Фин. отчёт (order_date)',
    returnsAmt: 'Сумма возвращённых товаров по розничной цене.\nДоля от выручки: 26,0%\n\nИсточник: Фин. отчёт (reportDetailByPeriod)',
    returnsQty: 'Количество возвращённых единиц.\n\nИсточник: Фин. отчёт (reportDetailByPeriod)',
    expenses: 'Суммарные расходы: СПП, логистика, комиссия МП, штрафы и реклама.\nДоля от выкупов: 46,3%\n\nИсточник: Расчёт',
    sppAmt: 'Скидка постоянного покупателя.\nВыручка, ₽ − Сумма к перечислению\n\nИсточник: Расчёт',
    logisticsCost: 'Расходы на доставку и хранение.\nДоля от выкупов: 17,8%\n\nИсточник: Фин. отчёт (reportDetailByPeriod)',
    commissionAmt: 'Комиссия маркетплейса за продажу.\nДоля от выкупов: 17,4%\n\nИсточник: Фин. отчёт (reportDetailByPeriod)',
    penaltiesAmt: 'Штрафы и удержания маркетплейса.\n\nИсточник: Фин. отчёт (reportDetailByPeriod)',
    adSpend: 'Общая сумма расходов на рекламу.\nДоля от выкупов: 7,4%\n\nИсточник: Продвижение (fullstats)',
    cpcSpend: 'Расходы по кампаниям с оплатой за клик.\n\nИсточник: Продвижение (fullstats)',
    cpcSpendPct: 'Доля расходов CPC от выручки.\nРасходы CPC, ₽ / Выручка, ₽ × 100\n\nИсточник: Расчёт',
    cpmSpend: 'Расходы по кампаниям с оплатой за показы.\n\nИсточник: Продвижение (fullstats)',
    cpmSpendPct: 'Доля расходов CPM от выручки.\nРасходы CPM, ₽ / Выручка, ₽ × 100\n\nИсточник: Расчёт',
    cpcOrdersAmt: 'Сумма заказов из CPC-кампаний.\n\nИсточник: Продвижение (fullstats, orders_amount)',
    cpcOrdersPct: 'Доля заказов CPC от заказов Аналитики.\nЗаказы CPC, ₽ / Заказы (Аналитика), ₽ × 100\n\nИсточник: Расчёт',
    cpmOrdersAmt: 'Сумма заказов из CPM-кампаний.\n\nИсточник: Продвижение (fullstats, orders_amount)',
    cpmOrdersPct: 'Доля заказов CPM от заказов Аналитики.\nЗаказы CPM, ₽ / Заказы (Аналитика), ₽ × 100\n\nИсточник: Расчёт',
    adImpressions: 'Количество показов рекламных объявлений.\n\nИсточник: Продвижение (fullstats)',
    totalClicks: 'Переходы в карточку товара из поиска и каталога.\n\nИсточник: Аналитика (sales-funnel)',
    adClicks: 'Переходы из рекламных кампаний.\n\nИсточник: Продвижение (fullstats)',
    adClicksPct: 'Доля рекламных переходов от общих.\nРекламные переходы / Переходы в карточку × 100\n\nИсточник: Расчёт',
    organicClicks: 'Переходы без рекламы.\nПереходы в карточку − Рекламные переходы\n\nИсточник: Расчёт',
    organicClicksPct: 'Доля органических переходов от общих.\nОрганические переходы / Переходы в карточку × 100\n\nИсточник: Расчёт',
    buyoutRate: 'Доля выкупленных заказов по дате продажи (от заказов Статистики).\nВыкупы, шт / Заказы (Статистика), шт x 100\n\nИсточник: Расчёт',
    buyoutRateSa: 'Доля выкупленных заказов по дате продажи (от заказов Аналитики).\nВыкупы, шт / Заказы (Аналитика), шт x 100\n\nИсточник: Расчёт',
    buyoutRateOrder: 'Доля выкупленных заказов по дате заказа (от заказов Статистики).\nВыкупы по дате заказа, шт / Заказы (Статистика), шт x 100\n\nИсточник: Расчёт',
    buyoutRateOrderSa: 'Доля выкупленных заказов по дате заказа (от заказов Аналитики).\nВыкупы по дате заказа, шт / Заказы (Аналитика), шт x 100\n\nИсточник: Расчёт',
    margin: 'Прибыль после вычета всех расходов.\nВыкупы, ₽ − СПП, ₽ − Комиссия МП, ₽ − Логистика, ₽ − Штрафы, ₽ − Рекламные расходы, ₽\nМаржинальность: 23,4%\n\nИсточник: Расчёт',
    marginPct: 'Доля маржи от выкупов.\nМаржа, ₽ / Выкупы, ₽ × 100\n\nИсточник: Расчёт',
    drrGmv: 'Доля рекламных расходов от заказов.\nРекламные расходы, ₽ / Заказы, ₽ × 100\n\nИсточник: Расчёт',
    drrRevenue: 'Доля рекламных расходов от выкупов.\nРекламные расходы, ₽ / Выкупы, ₽ × 100\n\nИсточник: Расчёт',
    cpc: 'Средняя стоимость клика.\nРекламные расходы, ₽ / Рекламные переходы\n\nИсточник: Расчёт',
    ctr: 'Кликабельность рекламных объявлений.\nРекламные переходы / Показы рекламы × 100\n\nИсточник: Расчёт',
    gmvTrend: 'Ретроспективный прогноз GMV на конец месяца.\nПоказывает, какой был прогноз на каждый день.\nКумулятивный GMV / Прошедших дней × Дней в месяце\n\nИсточник: Расчёт',
    planPace: 'Прогноз выполнения плана относительно пропорционального графика.\nКумулятивный GMV / (План / Дней в месяце × Текущий день) × 100\n\nИсточник: Расчёт',
    planCompletion: 'Процент выполнения плана на текущий день.\nКумулятивный GMV / План × 100\n\nИсточник: Расчёт',
    gmvPlanDay: 'Пропорциональный план на день.\nПлан на месяц / Дней в месяце\n\nИсточник: Расчёт',
  })

  const cloneWidgets = widgets => widgets.map(widget => ({ ...widget }))

  // Детерминированный ряд за 14 недель: плавный тренд без повторов и изолированных пиков.
  // Случайный шум раньше давал плато на минимуме с отдельными «иглами» — спарклайн выглядел сломанным.
  // Направление задаёт подпись «к прошлой неделе»: карточка со знаком минус не может расти вверх.
  function sparklineSeries(metricKey) {
    const seed = [...String(metricKey)].reduce((sum, character) => sum + character.charCodeAt(0), 0)
    const phase = seed / 97 * Math.PI * 2
    const series = Array.from({ length: 14 }, (_, index) => (
      Math.round(28 + index * 2.4 + Math.sin(index * .55 + phase) * 6 + Math.sin(index * 1.28 + phase * .5) * 2.4)
    ))
    return String(KPI_METRICS[metricKey]?.note || '').startsWith('−') ? series.reverse() : series
  }

  function createKpiWidget(metricKey, overrides = {}) {
    const metric = KPI_METRICS[metricKey] || KPI_METRICS.revenue
    return {
      id: overrides.id || `dash-kpi-${Date.now()}`,
      kind: 'kpi',
      metricKey: KPI_METRICS[metricKey] ? metricKey : 'revenue',
      ...metric,
      x: 48,
      y: 72,
      w: KPI_WIDTH,
      h: KPI_HEIGHT,
      showSparkline: true,
      sparkline: sparklineSeries(metricKey),
      ...overrides,
    }
  }

  // Каталог графиков пуст на старте и наполняется приложением: dashboard-engine.js грузится
  // раньше weekly-analytics.js, поэтому справочник «Недельного отчёта» регистрирует карточки
  // здесь, а не наоборот. Ключ — id графика отчёта, значение — проекция его же конфигурации:
  // один график не может разойтись с карточкой библиотеки, потому что это один объект данных.
  const DASHBOARD_CHARTS = {}

  function registerDashboardChart(key, chart) {
    DASHBOARD_CHARTS[key] = chart
    return chart
  }

  // Неизвестный ключ возвращает null, а не подменяется первой карточкой: виджет обязан уходить
  // в ту же конфигурацию, что показана в библиотеке, иначе лист молча соврал бы о содержимом.
  function createChartWidget(chartKey, overrides = {}) {
    const chart = DASHBOARD_CHARTS[chartKey]
    if (!chart) return null
    return {
      id: overrides.id || `dash-chart-${Date.now()}`,
      kind: 'chart',
      chartKey,
      title: chart.title,
      group: chart.group,
      source: chart.source,
      icon: chart.icon,
      x: 48,
      y: 72,
      w: CHART_WIDTH,
      h: CHART_HEIGHT,
      chart,
      ...overrides,
    }
  }

  function computeMinimapGeometry(widgets, camera, viewport, options = {}) {
    const mapWidth = options.width || 192
    const mapHeight = options.height || 128
    const padding = options.padding ?? 40
    const zoom = camera.zoom || 1
    const visible = {
      x: -camera.x / zoom,
      y: -camera.y / zoom,
      w: viewport.width / zoom,
      h: viewport.height / zoom,
    }
    const rects = widgets.map(widget => ({ x: widget.x, y: widget.y, w: widget.w, h: widget.h }))
    const boundsRects = [...rects, visible]
    const minX = Math.min(...boundsRects.map(rect => rect.x))
    const minY = Math.min(...boundsRects.map(rect => rect.y))
    const maxX = Math.max(...boundsRects.map(rect => rect.x + rect.w))
    const maxY = Math.max(...boundsRects.map(rect => rect.y + rect.h))
    const paddedWidth = Math.max(1, maxX - minX + padding * 2)
    const paddedHeight = Math.max(1, maxY - minY + padding * 2)
    const scale = Math.min(mapWidth / paddedWidth, mapHeight / paddedHeight)
    const viewWidth = mapWidth / scale
    const viewHeight = mapHeight / scale
    const viewX = minX - padding - (viewWidth - paddedWidth) / 2
    const viewY = minY - padding - (viewHeight - paddedHeight) / 2
    return {
      mapWidth,
      mapHeight,
      viewBox: [viewX, viewY, viewWidth, viewHeight],
      viewport: visible,
      widgets: rects,
    }
  }

  function minimapPointToCamera(x, y, geometry, camera, viewport) {
    const [viewX, viewY, viewWidth, viewHeight] = geometry.viewBox
    const worldX = viewX + (x / geometry.mapWidth) * viewWidth
    const worldY = viewY + (y / geometry.mapHeight) * viewHeight
    const zoom = camera.zoom || 1
    return {
      x: viewport.width / 2 - worldX * zoom,
      y: viewport.height / 2 - worldY * zoom,
      zoom,
    }
  }

  function closestSnap(value, candidates) {
    let best = null
    for (const candidate of candidates) {
      const distance = Math.abs(value - candidate.position)
      if (distance <= SNAP_THRESHOLD && (!best || distance < best.distance)) best = { ...candidate, distance }
    }
    return best
  }

  const mainAxis = (widget, axis) => axis === 'x' ? widget.x : widget.y
  const sizeAxis = (widget, axis) => axis === 'x' ? widget.w : widget.h
  const endAxis = (widget, axis) => mainAxis(widget, axis) + sizeAxis(widget, axis)

  // Зазор осмыслен только между карточками одного ряда: их границы по перпендикулярной оси
  // должны пересекаться. Иначе подсказка меряет пустоту до объекта из соседнего ряда.
  function sharesRow(a, b, axis) {
    return axis === 'x'
      ? a.y < b.y + b.h && b.y < a.y + a.h
      : a.x < b.x + b.w && b.x < a.x + a.w
  }

  // Расстояния, которые уже есть в сцене: по ним проверяем одиночный зазор — карточка встаёт
  // в интервал, повторяющий ритм остальных рядов.
  function knownGaps(widgets, axis) {
    const gaps = []
    for (let i = 0; i < widgets.length; i += 1) {
      for (let j = i + 1; j < widgets.length; j += 1) {
        const a = widgets[i]
        const b = widgets[j]
        if (!sharesRow(a, b, axis)) continue
        const [first, second] = mainAxis(a, axis) <= mainAxis(b, axis) ? [a, b] : [b, a]
        const gap = mainAxis(second, axis) - endAxis(first, axis)
        if (gap >= 0 && gap <= MAX_REFERENCE_GAP) gaps.push(gap)
      }
    }
    return gaps
  }

  function matchGap(gap, gaps) {
    let best = null
    for (const candidate of gaps) {
      const distance = Math.abs(gap - candidate)
      if (distance <= SPACING_SNAP_THRESHOLD && (best === null || distance < Math.abs(gap - best))) best = candidate
    }
    return best
  }

  // Порт computeSpacingGuides: сначала равный зазор между двумя соседями ряда, затем
  // совпадение зазора с интервалом, который в сцене уже есть.
  function resolveSpacing(widget, others, axis) {
    const row = others.filter(other => sharesRow(widget, other, axis))
    const left = row.filter(node => endAxis(node, axis) <= mainAxis(widget, axis)).sort((a, b) => endAxis(b, axis) - endAxis(a, axis))[0] || null
    const right = row.filter(node => mainAxis(node, axis) >= endAxis(widget, axis)).sort((a, b) => mainAxis(a, axis) - mainAxis(b, axis))[0] || null
    const equal = { left: false, right: false }
    if (!left && !right) return { delta: 0, left, right, equal }
    const start = mainAxis(widget, axis)
    const finish = endAxis(widget, axis)
    const gaps = knownGaps(others, axis)
    if (left && right) {
      const room = mainAxis(right, axis) - endAxis(left, axis) - sizeAxis(widget, axis)
      const symmetric = (endAxis(left, axis) + mainAxis(right, axis)) / 2 - (start + sizeAxis(widget, axis) / 2)
      if (room >= 0 && Math.abs(symmetric) <= SPACING_SNAP_THRESHOLD) {
        equal.left = equal.right = true
        return { delta: symmetric, left, right, equal }
      }
      const gapLeft = start - endAxis(left, axis)
      const gapRight = mainAxis(right, axis) - finish
      const matchLeft = matchGap(gapLeft, gaps)
      const matchRight = matchGap(gapRight, gaps)
      equal.left = matchLeft !== null
      equal.right = matchRight !== null
      if (matchLeft !== null) return { delta: matchLeft - gapLeft, left, right, equal }
      if (matchRight !== null) return { delta: gapRight - matchRight, left, right, equal }
      return { delta: 0, left, right, equal }
    }
    const gap = left ? start - endAxis(left, axis) : mainAxis(right, axis) - finish
    const match = matchGap(gap, gaps)
    if (match === null) return { delta: 0, left, right, equal }
    if (left) equal.left = true
    else equal.right = true
    return { delta: left ? match - gap : gap - match, left, right, equal }
  }

  // Метки зазоров рисуем уже после смещения, чтобы число совпадало с итоговой позицией.
  function spacingLabels(widget, resolved, axis) {
    const { left, right, equal } = resolved
    const cross = axis === 'x' ? 'y' : 'x'
    const center = axis === 'x' ? widget.y + widget.h / 2 : widget.x + widget.w / 2
    const labels = []
    const push = (neighbor, from, to, isEqual) => {
      // Меньше пикселя — не измерение: карточки касаются, и чип «0» только шумит поверх
      // линии выравнивания, которая в этот момент и так нарисована.
      if (to - from < 1) return
      // Линия зазора живёт в общей полосе пересечения по перпендикулярной оси. Центр
      // карточки для виджетов на разных уровнях уводил бы её в пустоту за край соседа.
      const bandStart = Math.max(mainAxis(neighbor, cross), mainAxis(widget, cross))
      const bandEnd = Math.min(endAxis(neighbor, cross), endAxis(widget, cross))
      const at = Math.min(Math.max(center, bandStart), bandEnd)
      labels.push({ orientation: 'spacing', axis, from, to, at, gap: to - from, equal: isEqual })
    }
    if (left) push(left, endAxis(left, axis), mainAxis(widget, axis), equal.left)
    if (right) push(right, endAxis(widget, axis), mainAxis(right, axis), equal.right)
    return labels
  }

  class DashboardLayoutModel {
    constructor(widgets = []) {
      this.widgets = cloneWidgets(widgets)
      this.past = []
      this.future = []
    }

    getWidget(id) {
      return this.widgets.find(widget => widget.id === id)
    }

    snapshot() {
      return cloneWidgets(this.widgets)
    }

    commit() {
      this.past.push(this.snapshot())
      this.future = []
    }

    replace(widgets, record = true) {
      if (record) this.commit()
      this.widgets = cloneWidgets(widgets)
    }

    get canUndo() {
      return this.past.length > 0
    }

    get canRedo() {
      return this.future.length > 0
    }

    undo() {
      if (!this.canUndo) return false
      this.future.push(this.snapshot())
      this.widgets = this.past.pop()
      return true
    }

    redo() {
      if (!this.canRedo) return false
      this.past.push(this.snapshot())
      this.widgets = this.future.pop()
      return true
    }

    alignmentCandidates(widgetId, exclude = null) {
      const vertical = []
      const horizontal = []
      for (const other of this.widgets) {
        if (other.id === widgetId || exclude?.has(other.id)) continue
        vertical.push(
          { position: other.x, start: other.y, end: other.y + other.h },
          { position: other.x + other.w / 2, start: other.y, end: other.y + other.h },
          { position: other.x + other.w, start: other.y, end: other.y + other.h },
        )
        horizontal.push(
          { position: other.y, start: other.x, end: other.x + other.w },
          { position: other.y + other.h / 2, start: other.x, end: other.x + other.w },
          { position: other.y + other.h, start: other.x, end: other.x + other.w },
        )
      }
      return { vertical, horizontal }
    }

    // companions — остальные карточки той же группы: { id, dx, dy, w, h }, смещения от захваченной
    // карточки в её же системе координат. Снап и метки считаются по объединяющей рамке группы
    // (getGroupBoundingBox + nonSelected в FreeGrid.tsx:957-965), а сама группа исключена из
    // ориентиров — иначе карточки тянулись бы к равным зазорам друг между другом, и над рядом
    // появлялась пустая направляющая.
    moveWidget(id, x, y, { record = true, companions = [] } = {}) {
      const widget = this.getWidget(id)
      if (!widget) return { widget: null, guides: [] }
      if (record) this.commit()
      const moving = new Set([id, ...companions.map(part => part.id)])
      const box = { x, y, w: widget.w, h: widget.h }
      let boxRight = box.x + box.w
      let boxBottom = box.y + box.h
      for (const part of companions) {
        const left = x + part.dx
        const top = y + part.dy
        box.x = Math.min(box.x, left)
        box.y = Math.min(box.y, top)
        boxRight = Math.max(boxRight, left + part.w)
        boxBottom = Math.max(boxBottom, top + part.h)
      }
      box.w = boxRight - box.x
      box.h = boxBottom - box.y
      const candidates = this.alignmentCandidates(id, moving)
      const verticalPoints = [
        { value: box.x, offset: 0 },
        { value: box.x + box.w / 2, offset: box.w / 2 },
        { value: box.x + box.w, offset: box.w },
      ]
      const horizontalPoints = [
        { value: box.y, offset: 0 },
        { value: box.y + box.h / 2, offset: box.h / 2 },
        { value: box.y + box.h, offset: box.h },
      ]
      let verticalSnap = null
      let horizontalSnap = null
      for (const point of verticalPoints) {
        const snap = closestSnap(point.value, candidates.vertical)
        if (snap && (!verticalSnap || snap.distance < verticalSnap.distance)) verticalSnap = { ...snap, offset: point.offset }
      }
      for (const point of horizontalPoints) {
        const snap = closestSnap(point.value, candidates.horizontal)
        if (snap && (!horizontalSnap || snap.distance < horizontalSnap.distance)) horizontalSnap = { ...snap, offset: point.offset }
      }
      // Стен нет ни слева, ни сверху: канвас в оригинале конечен только справа (да и то за
      // пределами разумного), а по вертикали не ограничен вовсе — FreeGrid.tsx:1002-1011.
      // Без магнита рамка остаётся там, где её нарисовал жест, а не в позиции захвата.
      const origin = { x: box.x, y: box.y }
      box.x = verticalSnap ? verticalSnap.position - verticalSnap.offset : origin.x
      box.y = horizontalSnap ? horizontalSnap.position - horizontalSnap.offset : origin.y
      const guides = []
      if (verticalSnap) guides.push({ orientation: 'vertical', position: verticalSnap.position, start: Math.min(box.y, verticalSnap.start), end: Math.max(box.y + box.h, verticalSnap.end) })
      if (horizontalSnap) guides.push({ orientation: 'horizontal', position: horizontalSnap.position, start: Math.min(box.x, horizontalSnap.start), end: Math.max(box.x + box.w, horizontalSnap.end) })
      // Ритм ряда доводится поверх магнита к краям, как в оригинале: там snapping по краю
      // считается первым, а смещение по зазору прибавляется к уже пойманной позиции.
      const others = this.widgets.filter(node => !moving.has(node.id))
      const horizontalSpacing = resolveSpacing(box, others, 'x')
      box.x += horizontalSpacing.delta
      const verticalSpacing = resolveSpacing(box, others, 'y')
      box.y += verticalSpacing.delta
      guides.push(...spacingLabels(box, horizontalSpacing, 'x'), ...spacingLabels(box, verticalSpacing, 'y'))
      const shift = { x: box.x - origin.x, y: box.y - origin.y }
      widget.x = x + shift.x
      widget.y = y + shift.y
      return { widget, guides, shift }
    }

    resizeWidget(id, direction, point, { record = true } = {}) {
      const widget = this.getWidget(id)
      if (!widget) return { widget: null, guides: [] }
      // Стандарт KPI не меняется: ручек у такой карточки нет, но модель защищает себя сама,
      // чтобы размер не уехал от любого другого вызова. Остальные виджеты тянутся как раньше.
      if (widget.kind === 'kpi') return { widget, guides: [] }
      if (record) this.commit()
      const candidates = this.alignmentCandidates(id)
      const guides = []
      let horizontalPoint = point.x
      let verticalPoint = point.y
      if (direction.includes('Left') || direction.includes('Right')) {
        const snap = closestSnap(point.x, candidates.vertical)
        if (snap) {
          horizontalPoint = snap.position
          guides.push({ orientation: 'vertical', position: snap.position, start: Math.min(widget.y, snap.start), end: Math.max(widget.y + widget.h, snap.end) })
        }
      }
      if (direction.includes('top') || direction.includes('Top') || direction.includes('bottom') || direction.includes('Bottom')) {
        const snap = closestSnap(point.y, candidates.horizontal)
        if (snap) {
          verticalPoint = snap.position
          guides.push({ orientation: 'horizontal', position: snap.position, start: Math.min(widget.x, snap.start), end: Math.max(widget.x + widget.w, snap.end) })
        }
      }
      const right = widget.x + widget.w
      const bottom = widget.y + widget.h
      // Пол заметки — стандарт KPI-карточки: ниже неё карточка теряет и название, и комментарий.
      // Верхней границы нет: аннотацию тянут насколько нужно.
      const minWidth = widget.kind === 'note' ? KPI_WIDTH : MIN_WIDTH
      const minHeight = widget.kind === 'note' ? KPI_HEIGHT : MIN_HEIGHT
      if (direction.includes('Left')) {
        widget.x = Math.min(horizontalPoint, right - minWidth)
        widget.w = right - widget.x
      }
      if (direction.includes('Right')) widget.w = Math.max(minWidth, horizontalPoint - widget.x)
      if (direction.includes('top') || direction.includes('Top')) {
        widget.y = Math.min(verticalPoint, bottom - minHeight)
        widget.h = bottom - widget.y
      }
      if (direction.includes('bottom') || direction.includes('Bottom')) widget.h = Math.max(minHeight, verticalPoint - widget.y)
      return { widget, guides }
    }

    addWidget(widget, record = true) {
      if (record) this.commit()
      this.widgets.push({ ...widget })
      return widget
    }

    updateWidget(id, patch, record = true) {
      const widget = this.getWidget(id)
      if (!widget) return null
      if (record) this.commit()
      Object.assign(widget, patch)
      return widget
    }

    removeWidget(id) {
      if (!this.getWidget(id)) return false
      this.commit()
      this.widgets = this.widgets.filter(widget => widget.id !== id)
      return true
    }

    clear() {
      if (!this.widgets.length) return
      this.commit()
      this.widgets = []
    }
  }

  return {
    DashboardLayoutModel,
    KPI_METRICS,
    KPI_METRIC_TIPS,
    KPI_WIDTH,
    KPI_HEIGHT,
    CHART_WIDTH,
    CHART_HEIGHT,
    createKpiWidget,
    DASHBOARD_CHARTS,
    registerDashboardChart,
    createChartWidget,
    computeMinimapGeometry,
    minimapPointToCamera,
  }
})
