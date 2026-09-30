# Sequence-диаграммы финансового контура Grafio

Статус: проектные диаграммы, раскрывающие порядок взаимодействий в целевой архитектуре. Они не подтверждают реализацию процессов в текущем приложении.

| Сценарий | Диаграмма | Покрываемые требования |
|---|---|---|
| Просмотр недельного отчёта | [01](sequence/01-weekly-report-view.puml) | FR-01—FR-09 |
| Загрузка WB и публикация отчёта | [02](sequence/02-source-load-and-report-publication.puml) | FR-02—FR-10 |
| Кейс клиента, методика и пересчёт | [03](sequence/03-case-to-methodology.puml) | FR-11—FR-16 |
| Жизненный цикл плана | [04](sequence/04-plan-lifecycle.puml) | FR-17—FR-18 |
| Подключение организации и кабинета WB | [05](sequence/05-wb-account-onboarding.puml) | FR-01, FR-24—FR-27 |
| Жизненный цикл доступа сотрудника | [06](sequence/06-employee-access-lifecycle.puml) | FR-24—FR-27 |
| Закрытие организации | [07](sequence/07-organization-closure.puml) | FR-25—FR-27 |

Диаграммы написаны в PlantUML. Они дополняют, а не заменяют [BPMN-процессы](../processes/bpmn-index.md): BPMN показывает процесс и участников, sequence — сообщения между компонентами.
