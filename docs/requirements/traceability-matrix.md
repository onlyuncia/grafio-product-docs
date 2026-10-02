# Матрица прослеживаемости Grafio

Матрица связывает требования к сервису с проектными решениями и критериями приёмки. Она показывает **покрытие спецификации**, а не факт внедрения. Основные идентификаторы бизнес- и функциональных требований — `PBR-*` и `PFR-*`; `AR-*`, `IR-*`, `QR-*` и `NFR-*` обозначают права, данные и свойства качества, а не второй набор функций.

## Бизнес-результат → поведение

| Требование | Что обеспечивает | Поведение и критерий |
|---|---|---|
| PBR-01 | Недельный финансовый результат | PFR-01—PFR-06, PFR-28—PFR-29; AC-01—AC-09, AC-37—AC-38; [паспорта метрик](../data/metric-passports.md) |
| PBR-02 | Видимые ограничения данных и методики | PFR-02—PFR-03, PFR-05, PFR-09—PFR-10; AC-07—AC-09; [статусы](../processes/status-models.md) |
| PBR-03 | Объяснение суммы до записи | PFR-07, PFR-19; AC-10—AC-11, AC-25—AC-26; [модель данных](../data/logical-data-model.md) |
| PBR-04 | Сравнимая история при изменении правил | PFR-08, PFR-14—PFR-16; AC-12, AC-19—AC-21; [жизненный цикл](../processes/calculation-lifecycle.md) |
| PBR-05 | Несколько кабинетов одного юрлица | PFR-01, PFR-17; AC-01, AC-22; [модель данных](../data/logical-data-model.md) |
| PBR-06 | План отдельно от факта | PFR-17—PFR-18; AC-22—AC-24; [правила планов](../product/plans-and-forecasts.md) |
| PBR-07 | Единое рабочее пространство | PFR-19—PFR-23, PFR-30—PFR-34; AC-25—AC-31, AC-39—AC-43; [прототип](../../prototype/README.md) |
| PBR-08 | Управление методикой внутри Grafio | PFR-11—PFR-16, PFR-26; AC-13—AC-21; [операционные процессы](../processes/operational-workflows.md) |
| PBR-09 | Управление командой и безопасностью | PFR-24—PFR-25, PFR-27; AC-32—AC-36; [статусы доступа](../processes/status-models.md) |
| PBR-10 | Безопасный разбор и выпуск правил | PFR-13—PFR-16, PFR-26—PFR-27; AC-17—AC-21; [Admin Console](interface-requirements.md#admin-console-int-06) |

## Функциональные требования → решение

| Требования | Проектное решение | Критерии |
|---|---|---|
| PFR-01—PFR-03 | [Контекст отчёта и источников](srs.md#4-контекст-и-внешние-системы), [API](../api/contracts.md) | AC-01—AC-03, AC-07—AC-09 |
| PFR-04—PFR-06 | [Паспорта метрик](../data/metric-passports.md), [бизнес-правила](business-rules.md) | AC-04—AC-08 |
| PFR-07—PFR-08 | [Модель данных](../data/logical-data-model.md), [версии отчёта](../processes/calculation-lifecycle.md) | AC-10—AC-12 |
| PFR-09—PFR-10 | [Контракт WB](../data/wb-data-contract.md), [статусные модели](../processes/status-models.md) | AC-07—AC-08, AC-13 |
| PFR-11—PFR-16 | [Операционные процессы](../processes/operational-workflows.md), [Admin Console](interface-requirements.md#admin-console-int-06) | AC-13—AC-21 |
| PFR-17—PFR-18 | [Планы и прогнозы](../product/plans-and-forecasts.md) | AC-22—AC-24 |
| PFR-19—PFR-23 | [Требования к интерфейсам](interface-requirements.md), [прототип](../../prototype/README.md) | AC-25—AC-31 |
| PFR-24—PFR-27 | [Процессы доступа](../processes/operational-workflows.md), [статусные модели](../processes/status-models.md) | AC-32—AC-36 |
| PFR-28—PFR-29 | [Настройки финансового результата](../data/metric-passports.md), [права ролей](user-requirements.md) | US-20—US-21, AC-37—AC-38; [сквозные случаи](acceptance-criteria.md) |
| PFR-30—PFR-34 | [Интерфейсы РНП, Товаров и Студии](interface-requirements.md), [прототип](../../prototype/README.md) | US-22—US-24, AC-39—AC-43 |

## Права, данные и качество

| Идентификаторы | Источник решения | Условия проверки |
|---|---|---|
| AR-01—AR-03 | [Пользовательские требования](user-requirements.md), [операционные процессы](../processes/operational-workflows.md) | AC-03, AC-13—AC-21, AC-32—AC-36 |
| IR-01—IR-15 | [Логическая модель данных](../data/logical-data-model.md), [контракт WB](../data/wb-data-contract.md) | AC-04—AC-11; [примеры загрузки и пересчёта](acceptance-criteria.md) |
| QR-01—QR-09 | [Качество финансового результата](non-functional-requirements.md#качество-финансового-результата), [паспорта](../data/metric-passports.md) | AC-04—AC-12, AC-19—AC-21 |
| NFR-01—NFR-27 | [Нефункциональные требования](non-functional-requirements.md) | Условия измерения приведены рядом с каждым NFR; результаты испытаний не заявлены |

## Открытые зависимости

| Что ещё нужно подтвердить | Затронутое решение |
|---|---|
| Поля, знаки и типы операций нового финансового API WB на обезличенной неделе | PFR-04—PFR-05, PFR-10; IR-02, IR-06; [контракт WB](../data/wb-data-contract.md) |
| Полнота рекламного источника и отсутствие двойного учёта | PFR-04; IR-09; [контракт WB](../data/wb-data-contract.md) |
| Производительность, восстановление и эксплуатационная безопасность | NFR-01—NFR-27; [профиль качества](non-functional-requirements.md) |

Восемь [сквозных примеров](acceptance-criteria.md) иллюстрируют ключевые пути. Нормативные условия готовности остаются в [критериях приёмки](acceptance-criteria.md) и профильных требованиях.
