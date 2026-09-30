# Карта документов

Документы сгруппированы по назначению. [Кейс](../CASE-STUDY.md) и [SRS](requirements/srs.md) служат входом в решение; исследовательские заметки ниже — доказательная база и история проработки, а не самостоятельные требования к реализации.

## Контекст и исследование

- [Бизнес-контекст](context/business-context.md), [исходная концепция Grafio](context/original-product-concept.md), [бизнес-вопросы](context/business-questions.md), [ручной процесс AS-IS](context/as-is-weekly-report.md), [исходные оценки](context/baseline-and-constraints.md), [границы кейса](context/case-scope.md) и [словарь](context/glossary.md).
- Исходный анализ: [структура недельных расходов](research/weekly-expense-analysis.md), [разбор книги WB](research/workbook-calculation-review.md), [реестр показателей](research/metric-inventory.md), [разбор существующего API](research/current-api-implementation-review.md), [оценка прежних графиков](research/weekly-chart-assessment.md).

## Требования и приёмка

- [Бизнес-требования](requirements/business-requirements.md), [пользовательские](requirements/user-requirements.md), [функциональные](requirements/functional-requirements.md), [бизнес-правила](requirements/business-rules.md), [NFR](requirements/non-functional-requirements.md), [ограничения и допущения](requirements/constraints-and-assumptions.md), [интерфейсы](requirements/interface-requirements.md).
- [SRS](requirements/srs.md), [User Stories](requirements/user-stories.md), [Use Cases и диаграммы](requirements/use-case-catalog.md), [критерии приёмки](requirements/acceptance-criteria.md), [матрица прослеживаемости](requirements/traceability-matrix.md).
- [Сценарий недельного анализа](requirements/weekly-expense-use-case.md) и [реестр требований первой версии](requirements/first-release-requirements-register.md) сохранены для трассировки исходных идентификаторов.
- [Подробные приёмочные сценарии](validation/acceptance-scenarios.md), [аудит интерфейса](validation/ui-quality-audit.md).

## Процессы, показатели и данные

- [BPMN AS-IS/TO-BE](processes/bpmn-index.md), [операционные процессы](processes/operational-workflows.md), [статусные модели](processes/status-models.md), [изменение правил расчёта](processes/to-be-calculation-rules.md), [жизненный цикл версий](processes/calculation-lifecycle.md).
- [Паспорта метрик](data/metric-passports.md), [концептуальная модель](data/conceptual-data-model.md), [логическая модель](data/logical-data-model.md), [единая целевая ERD](data/target-erd.md).
- [Контракт данных WB](data/wb-data-contract.md), [валидация полей](data/wb-field-mapping-validation.md), [интеграционная спецификация](data/integration-specification.md), [описание API](api/contracts.md), [OpenAPI 3.1 JSON](api/openapi.json).

## Продукт и архитектура

- [Рабочее место администратора](product/admin-quality-workspace.md), [планы и прогнозы](product/plans-and-forecasts.md), [сценарий управления планом](product/plan-management-use-case.md), [визуальная система прототипа](product/prototype-visual-system.md).
- [Архитектура Grafio](architecture/README.md) — основное описание одного сервиса с обозначением статусов. Приложения: [A — технический обзор реализации](architecture/implementation-baseline.md), [B — проектирование финансового контура](architecture/financial-contour-design.md); детализация: [C4](architecture/c4-model.md), [sequence-диаграммы](architecture/sequence-diagrams.md) и [ADR](architecture/adr/README.md).

[Решения по составу и переименованию](editorial-decisions.md) объясняют, какие рабочие файлы не попали в публичную подборку.
