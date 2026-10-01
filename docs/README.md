# Путеводитель по кейсу Grafio

Основной маршрут состоит из 12 материалов. Он показывает задачу, аналитическое решение и демонстрационный интерфейс без необходимости читать все рабочие документы. Финансовый backend в кейсе спроектирован, а прототип работает на синтетических данных; статус реализации пояснён в [архитектуре Grafio](architecture/README.md).

## Основной маршрут

| Шаг | На какой вопрос отвечает | Материалы |
|---|---|---|
| 1. Контекст | Почему понадобилось менять ручной процесс? | [Кейс](../CASE-STUDY.md) → [AS-IS недельного отчёта](context/as-is-weekly-report.md) |
| 2. Поведение | Что должен делать Grafio и как проходит процесс? | [SRS](requirements/srs.md) → [BPMN AS-IS/TO-BE](processes/bpmn-index.md) |
| 3. Расчёт | Что означают показатели и как принять результат? | [Паспорта метрик](data/metric-passports.md) → [критерии приёмки](requirements/acceptance-criteria.md) |
| 4. Устройство | Как связаны компоненты и данные одного сервиса? | [Архитектура Grafio](architecture/README.md) → [единая ERD](data/target-erd.md) |
| 5. Контракт | Как клиент и сервер обмениваются данными? | [Описание API](api/contracts.md) → [OpenAPI 3.1](api/openapi.json) |
| 6. Демонстрация | Как выглядят основные пользовательские сценарии? | [Кликабельный прототип](../prototype/README.md) → [галерея экранов](../screenshots/README.md) |

## Когда нужна детализация

- **Существующая основа и проектное развитие:** [технический обзор реализации](architecture/implementation-baseline.md), [проектирование финансового контура](architecture/financial-contour-design.md), [C4](architecture/c4-model.md) и [ADR](architecture/adr/README.md).
- **Требования и проверяемость:** [функциональные требования](requirements/functional-requirements.md), [Use Cases](requirements/use-case-catalog.md), [матрица прослеживаемости](requirements/traceability-matrix.md) и [подробные приёмочные сценарии](validation/acceptance-scenarios.md).
- **Процессы и ответственность:** [операционные процессы](processes/operational-workflows.md) и [статусные модели](processes/status-models.md).
- **Источники и данные:** [разбор исходной книги](research/workbook-calculation-review.md), [контракт WB](data/wb-data-contract.md) и [логическая модель данных](data/logical-data-model.md).
- **Термины:** [словарь](context/glossary.md).

Остальные материалы в тематических папках служат исследовательской базой или детализацией отдельных решений. Их не требуется читать последовательно.
