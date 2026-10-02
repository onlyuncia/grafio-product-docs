# Материалы кейса Grafio

Основная история и мой вклад описаны в [корневом README](../README.md). Здесь можно пройти проект по порядку или сразу открыть нужный артефакт.

## Основной маршрут

1. **Исходная задача:** [бизнес-контекст](context/business-context.md) и ручной процесс [AS-IS](context/as-is-weekly-report.md).
2. **Ожидаемое поведение:** [SRS](requirements/srs.md) и [критерии приёмки](requirements/acceptance-criteria.md).
3. **Работа участников:** [BPMN-процессы](processes/bpmn-index.md).
4. **Смысл чисел:** [паспорта показателей](data/metric-passports.md) и [ERD](data/target-erd.md).
5. **Устройство сервиса:** [архитектура Grafio](architecture/README.md) и [целевой OpenAPI](api/openapi.json).
6. **Интерфейс:** [кликабельный прототип](../prototype/README.md) и [экраны](../screenshots/README.md).

## Найти конкретный документ

- **Виды требований:** [бизнес-](requirements/business-requirements.md), [пользовательские](requirements/user-requirements.md), [функциональные](requirements/functional-requirements.md) и [нефункциональные](requirements/non-functional-requirements.md).
- **Правила и связи:** [бизнес-правила](requirements/business-rules.md), [ограничения и допущения](requirements/constraints-and-assumptions.md), [интерфейсные требования](requirements/interface-requirements.md), [матрица прослеживаемости](requirements/traceability-matrix.md).
- **Процессы:** [операционные сценарии](processes/operational-workflows.md), [статусные модели](processes/status-models.md), [жизненный цикл методики](processes/calculation-lifecycle.md).
- **Данные:** [контракт WB](data/wb-data-contract.md), [логическая модель](data/logical-data-model.md), [словарь](context/glossary.md).
- **Архитектура:** [интеграционная спецификация](architecture/integration-specification.md), [C4](architecture/c4-model.md), [sequence-диаграммы](architecture/sequence-diagrams.md), [ADR](architecture/adr/README.md), [обзор реализованной основы](architecture/implementation-baseline.md).
- **Продуктовые сценарии:** [планы](product/plans-and-forecasts.md), [интерфейс Admin Console](requirements/interface-requirements.md#admin-console-int-06).

Для финансового сценария подробно определены правила WB. Синхронизация Ozon реализована в Grafio, но целевые финансовые формулы для неё здесь не описаны.