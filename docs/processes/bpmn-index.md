# AS-IS и TO-BE: BPMN 2.0

Статус: строгие BPMN 2.0 диаграммы для бизнес- и системного анализа. Исходники содержат BPMN-модель и BPMN DI-разметку расположения элементов; их можно открыть без конвертации в Camunda Modeler, bpmn.io или другом совместимом редакторе.

| Диаграмма | Назначение | Исходник |
|---|---|---|
| AS-IS: ручной недельный анализ | Показывает ручную выгрузку, Excel, сверку, исследование расхождений и передачу результата. | [01-as-is-weekly-analysis.bpmn](bpmn/01-as-is-weekly-analysis.bpmn) |
| TO-BE: коллаборация участников | Показывает отдельные пулы клиента, Grafio, Admin Console и WB, message flows, обработку таймаута и объекты данных. | [02-to-be-collaboration.bpmn](bpmn/02-to-be-collaboration.bpmn) |
| TO-BE: оркестрация отчёта | Детализирует внутренний путь от загрузки до публикации и открытия кейса. | [02-to-be-weekly-report-and-methodology.bpmn](bpmn/02-to-be-weekly-report-and-methodology.bpmn) |
| Публикация методики | Детализирует свёрнутый подпроцесс Admin Console: область, контроль, публикация, пересчёт или применение вперёд. | [03-methodology-publication.bpmn](bpmn/03-methodology-publication.bpmn) |
| Жизненный цикл плана | Показывает черновик, проверку совместимости, активацию, факт-план и новую версию. | [04-plan-lifecycle.bpmn](bpmn/04-plan-lifecycle.bpmn) |
| Подключение организации и WB-кабинета | Показывает подключение, проверку токена, первую загрузку и готовность кабинета. | [05-organization-and-wb-onboarding.bpmn](bpmn/05-organization-and-wb-onboarding.bpmn) |
| Жизненный цикл доступа сотрудника | Показывает приглашение, роль, область, 2FA, отзыв доступа и завершение сессий. | [06-employee-access-lifecycle.bpmn](bpmn/06-employee-access-lifecycle.bpmn) |
| Закрытие клиента и удаление данных | Показывает выгрузку, остановку интеграций, архивирование, удержание и контролируемое удаление. | [07-client-offboarding-and-deletion.bpmn](bpmn/07-client-offboarding-and-deletion.bpmn) |

## Нотация

- пулы для независимых участников и дорожки для ролей внутри одного участника;
- start/end events — начало и завершение процесса;
- user, manual и service tasks — типы выполняемых работ;
- exclusive gateways — взаимоисключающие развилки;
- sequence flows — порядок выполнения внутри процесса; message flows — обмен между пулами;
- data objects — существенные входы и результаты процесса; boundary timer event — обработка таймаута или лимита WB.

AS-IS показывает реальный ручной путь, а TO-BE — целевое поведение. Детальные формулы, исключения, состояния качества и правила публикации не помещаются в диаграмму: их источники — [Паспорта показателей недельного отчёта](../data/metric-passports.md), [Жизненный цикл правил и версий отчёта](calculation-lifecycle.md), [Интеграционная спецификация Grafio](../data/integration-specification.md) и [Операционные процессы Grafio](operational-workflows.md).
