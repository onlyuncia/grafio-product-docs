(function (root, factory) {
  const api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  else root.WeeklyAnalytics = api
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const weeks = ['30 мар. – 5 апр.', '6–12 апр.', '13–19 апр.', '20–26 апр.', '27 апр. – 3 мая']

  const WEEKLY_ANALYTICS_TABS = [
    { id: 'feed', label: 'Лента' },
    { id: 'finance', label: 'Финансы' },
    { id: 'orders', label: 'Заказы и выкупы' },
    { id: 'logistics', label: 'Логистика' },
    { id: 'ads', label: 'Реклама' },
    { id: 'search', label: 'Поиск' },
  ]

  const chart = (config, rows) => ({
    type: 'line',
    fullWidth: false,
    units: [{ id: 'percent', label: '%' }],
    defaultUnit: config.units?.[0]?.id || 'percent',
    ...config,
    points: rows.map((values, index) => ({ week: weeks[index], values })),
  })

  const WEEKLY_ANALYTICS_CHARTS = [
    { id: 'structure', tab: 'finance', title: 'Структура расходов по выкупам', type: 'structure', fullWidth: true },
    chart({
      id: 'margin-cost', tab: 'finance', title: 'Маржа и себестоимость',
      description: 'Абсолютный результат и его доля в выкупах', type: 'area', fullWidth: true,
      units: [{ id: 'money', label: '₽' }, { id: 'percent', label: '%' }],
      series: [{ key: 'margin', label: 'Маржа', color: 'var(--margin)' }, { key: 'cost', label: 'Себестоимость', color: 'var(--cost)' }],
      source: 'Финансовый отчёт · расчёт', formula: 'Маржа = выкупы − себестоимость − расходы. Доли считаются от выкупов.',
    }, [
      { money: { margin: 128300, cost: 255000 }, percent: { margin: 15.8, cost: 31.4 } },
      { money: { margin: 100449, cost: 231468 }, percent: { margin: 13.8, cost: 31.8 } },
      { money: { margin: 125369, cost: 245320 }, percent: { margin: 16.2, cost: 31.7 } },
      { money: { margin: 220908, cost: 374216 }, percent: { margin: 18.3, cost: 31.0 } },
      { money: { margin: 324875, cost: 422106 }, percent: { margin: 23.4, cost: 30.4 } },
    ]),
    chart({
      id: 'orders-money', tab: 'orders', title: 'Заказы, выкупы и маржа',
      description: 'Три метрики на одной временной оси', type: 'line', fullWidth: true,
      units: [{ id: 'money', label: '₽' }],
      series: [
        { key: 'orders', label: 'Заказано', color: '#8b93ff' },
        { key: 'buyouts', label: 'Выкупы', color: '#5cc98a' },
        { key: 'margin', label: 'Маржа', color: 'var(--margin)' },
      ],
      source: 'Заказы + финансовый отчёт', formula: 'Линии сравнивают недельную динамику. Разные периоды признания не образуют воронку.',
    }, [
      { money: { orders: 1040900, buyouts: 812023, margin: 128300 } },
      { money: { orders: 982400, buyouts: 727895, margin: 100449 } },
      { money: { orders: 1095600, buyouts: 773895, margin: 125369 } },
      { money: { orders: 1546200, buyouts: 1207148, margin: 220908 } },
      { money: { orders: 1684200, buyouts: 1390434, margin: 324875 } },
    ]),
    chart({
      id: 'orders-qty', tab: 'orders', title: 'Заказы и выкупы в штуках',
      description: 'Изменение товарного объёма без влияния цены', type: 'bars',
      units: [{ id: 'count', label: 'шт.' }],
      series: [{ key: 'orders', label: 'Заказы', color: '#8b93ff' }, { key: 'buyouts', label: 'Выкупы', color: '#5cc98a' }],
      source: 'Заказы + отчёт реализации', formula: 'Количество заказанных и выкупленных единиц за соответствующий период.',
    }, [
      { count: { orders: 1298, buyouts: 1004 } }, { count: { orders: 1216, buyouts: 914 } },
      { count: { orders: 1340, buyouts: 968 } }, { count: { orders: 1814, buyouts: 1438 } },
      { count: { orders: 1962, buyouts: 1612 } },
    ]),
    chart({
      id: 'buyout-rate', tab: 'orders', title: 'Процент выкупа',
      description: 'Стандартный ориентир и фактически созревшие когорты',
      series: [{ key: 'standard', label: 'Стандартный', color: '#8b93ff' }, { key: 'actual', label: 'Фактический', color: '#5cc98a' }],
      source: 'Когортный расчёт заказов', formula: 'Фактический процент = созревшие выкупленные единицы / созревшие заказанные единицы.',
      note: 'Последняя когорта ещё созревает', noteTone: 'warning',
    }, [
      { percent: { standard: 74, actual: 71.8 } }, { percent: { standard: 74, actual: 73.1 } },
      { percent: { standard: 75, actual: 72.6 } }, { percent: { standard: 76, actual: 75.4 } },
      { percent: { standard: 76, actual: 68.9 } },
    ]),
    chart({
      id: 'delivery-time', tab: 'logistics', title: 'Среднее время доставки',
      description: 'Средний срок от заказа до получения',
      units: [{ id: 'days', label: 'дни' }, { id: 'hours', label: 'часы' }],
      series: [{ key: 'delivery', label: 'Время доставки', color: '#d4a85c' }],
      source: 'Логистика WB', formula: 'Среднее календарное время между заказом и получением. Часы = дни × 24.',
      note: 'Среднее значение не показывает отдельные долгие доставки', noteTone: 'neutral',
    }, [
      { days: { delivery: 3.8 }, hours: { delivery: 91.2 } }, { days: { delivery: 4.1 }, hours: { delivery: 98.4 } },
      { days: { delivery: 3.6 }, hours: { delivery: 86.4 } }, { days: { delivery: 3.2 }, hours: { delivery: 76.8 } },
      { days: { delivery: 2.9 }, hours: { delivery: 69.6 } },
    ]),
    chart({
      id: 'local-orders', tab: 'logistics', title: 'Локальные заказы по регионам',
      description: 'Доля заказов, выполненных внутри выбранного региона', type: 'bars',
      series: [
        { key: 'central', label: 'Центр', color: '#8b93ff' }, { key: 'volga', label: 'Поволжье', color: '#5cc98a' },
        { key: 'south', label: 'Юг', color: '#d4a85c' },
      ],
      source: 'География заказов', formula: 'Для каждого региона: локальные заказы региона / все заказы этого региона.',
    }, [
      { percent: { central: 63, volga: 48, south: 42 } }, { percent: { central: 65, volga: 51, south: 44 } },
      { percent: { central: 67, volga: 50, south: 47 } }, { percent: { central: 70, volga: 54, south: 49 } },
      { percent: { central: 72, volga: 57, south: 53 } },
    ]),
    chart({
      id: 'logistics-split', tab: 'logistics', title: 'Прямая и обратная логистика',
      description: 'Стоимость доставки и возвратного потока', type: 'bars',
      units: [{ id: 'money', label: '₽' }, { id: 'percent', label: '%' }],
      series: [{ key: 'forward', label: 'Прямая', color: '#f15d54' }, { key: 'reverse', label: 'Обратная', color: '#d4a85c' }],
      source: 'Финансовый отчёт · логистика', formula: 'Доля рассчитывается от выкупов недели; сумма показывает начисления площадки.',
    }, [
      { money: { forward: 193262, reverse: 38200 }, percent: { forward: 23.8, reverse: 4.7 } },
      { money: { forward: 188526, reverse: 34940 }, percent: { forward: 25.9, reverse: 4.8 } },
      { money: { forward: 174899, reverse: 37120 }, percent: { forward: 22.6, reverse: 4.8 } },
      { money: { forward: 252293, reverse: 51870 }, percent: { forward: 20.9, reverse: 4.3 } },
      { money: { forward: 247498, reverse: 54227 }, percent: { forward: 17.8, reverse: 3.9 } },
    ]),
    chart({
      id: 'organic-paid', tab: 'ads', title: 'Органические и рекламные заказы',
      description: 'Вклад каналов в заказанную сумму', type: 'area',
      units: [{ id: 'money', label: '₽' }, { id: 'percent', label: '%' }],
      series: [{ key: 'organic', label: 'Органика', color: '#5cc98a' }, { key: 'paid', label: 'Реклама', color: '#8b93ff' }],
      source: 'Реклама + заказы', formula: 'Канал определяется моделью атрибуции WB; доли считаются от атрибутированной суммы.',
      note: 'Демонстрация полного рекламного источника', noteTone: 'info',
    }, [
      { money: { organic: 740200, paid: 300700 }, percent: { organic: 71.1, paid: 28.9 } },
      { money: { organic: 690100, paid: 292300 }, percent: { organic: 70.2, paid: 29.8 } },
      { money: { organic: 756600, paid: 339000 }, percent: { organic: 69.1, paid: 30.9 } },
      { money: { organic: 1043200, paid: 503000 }, percent: { organic: 67.5, paid: 32.5 } },
      { money: { organic: 1162100, paid: 522100 }, percent: { organic: 69.0, paid: 31.0 } },
    ]),
    chart({
      id: 'drr-bases', tab: 'ads', title: 'ДРР по разным базам',
      description: 'Три определения показателя показаны раздельно',
      series: [
        { key: 'orders', label: 'От заказов', color: '#8b93ff' }, { key: 'buyouts', label: 'От выкупов', color: '#5cc98a' },
        { key: 'paidOrders', label: 'От рекламных заказов', color: '#d4a85c' },
      ],
      source: 'Рекламные расходы + продажи', formula: 'Расходы на рекламу / выбранная база × 100. Базы не являются взаимозаменяемыми.',
      note: 'Сравнивайте линии только с учётом знаменателя', noteTone: 'warning',
    }, [
      { percent: { orders: 5.8, buyouts: 7.4, paidOrders: 20.1 } }, { percent: { orders: 6.1, buyouts: 8.2, paidOrders: 20.5 } },
      { percent: { orders: 6.4, buyouts: 9.0, paidOrders: 20.7 } }, { percent: { orders: 5.6, buyouts: 7.2, paidOrders: 17.1 } },
      { percent: { orders: 5.2, buyouts: 6.3, paidOrders: 16.8 } },
    ]),
    chart({
      id: 'drr-models', tab: 'ads', title: 'ДРР CPC и CPM',
      description: 'Эффективность кампаний по модели закупки', type: 'bars',
      series: [{ key: 'cpc', label: 'CPC', color: '#8b93ff' }, { key: 'cpm', label: 'CPM', color: '#d4a85c' }],
      source: 'Рекламные кампании', formula: 'Расходы кампаний модели / атрибутированные выкупы модели × 100.',
    }, [
      { percent: { cpc: 6.8, cpm: 9.4 } }, { percent: { cpc: 7.3, cpm: 10.1 } },
      { percent: { cpc: 7.1, cpm: 9.8 } }, { percent: { cpc: 6.2, cpm: 8.7 } },
      { percent: { cpc: 5.9, cpm: 8.1 } },
    ]),
    chart({
      id: 'search-cr', tab: 'search', title: 'CR из поиска',
      description: 'Конверсия из показа в корзину и заказ',
      series: [{ key: 'cart', label: 'В корзину', color: '#8b93ff' }, { key: 'order', label: 'В заказ', color: '#5cc98a' }],
      source: 'Поисковая аналитика', formula: 'Целевые действия / уникальные показы в поиске × 100 в пределах окна атрибуции.',
      note: 'Окно атрибуции: 7 дней', noteTone: 'info',
    }, [
      { percent: { cart: 8.1, order: 3.7 } }, { percent: { cart: 8.5, order: 3.9 } },
      { percent: { cart: 8.8, order: 4.0 } }, { percent: { cart: 9.4, order: 4.4 } },
      { percent: { cart: 10.2, order: 4.9 } },
    ]),
    chart({
      id: 'average-values', tab: 'search', title: 'Средние значения заказа и выкупа',
      description: 'Денежный результат на одну товарную единицу', type: 'bars',
      units: [{ id: 'money', label: '₽' }],
      series: [{ key: 'order', label: 'Заказ', color: '#8b93ff' }, { key: 'buyout', label: 'Выкуп', color: '#5cc98a' }],
      source: 'Заказы + отчёт реализации', formula: 'Сумма / количество товарных единиц. Показатель не является средним чеком.',
    }, [
      { money: { order: 802, buyout: 809 } }, { money: { order: 808, buyout: 796 } },
      { money: { order: 818, buyout: 799 } }, { money: { order: 852, buyout: 839 } },
      { money: { order: 858, buyout: 863 } },
    ]),
  ]

  function chartsForTab(tab) {
    return tab === 'feed' ? [...WEEKLY_ANALYTICS_CHARTS] : WEEKLY_ANALYTICS_CHARTS.filter(item => item.tab === tab)
  }

  function metricLabel(key, unit) {
    if (key === 'margin') return unit === 'percent' ? 'Маржинальность' : 'Маржа'
    if (key === 'cost') return unit === 'percent' ? 'Доля себестоимости' : 'Себестоимость'
    return key
  }

  function allowedUnits(config) {
    return (config.units || []).map(item => item.id)
  }

  function summariesForChart(config, unit = config.defaultUnit) {
    if (!config?.points || config.points.length < 2) return []
    const previous = config.points.at(-2).values[unit] || {}
    const current = config.points.at(-1).values[unit] || {}
    return (config.series || []).map(series => {
      const previousValue = Number(previous[series.key] ?? 0)
      const currentValue = Number(current[series.key] ?? 0)
      const delta = Number((currentValue - previousValue).toFixed(2))
      return {
        key: series.key,
        label: metricLabel(series.key, unit) === series.key ? series.label : metricLabel(series.key, unit),
        color: series.color,
        current: currentValue,
        delta,
        direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
        unit,
      }
    })
  }

  const WEEKLY_CONTEXT_TRENDS = {
    penalties: {
      title: 'Штрафы',
      color: '#9c92a8',
      points: [
        { week: weeks[0], money: 850, percent: .10 },
        { week: weeks[1], money: 0, percent: 0 },
        { week: weeks[2], money: 3120, percent: .40 },
        { week: weeks[3], money: 1040, percent: .09 },
        { week: weeks[4], money: 4920, percent: .35 },
      ],
    },
  }

  return { WEEKLY_ANALYTICS_TABS, WEEKLY_ANALYTICS_CHARTS, WEEKLY_CONTEXT_TRENDS, chartsForTab, metricLabel, allowedUnits, summariesForChart }
})
