# Anonymized episodes

One row per episode; see `episodes.jsonl` for all retained fields.

| id | dialog | kind | genre | audience | outcome | summary |
|---|---|---|---|---|---|---|
| E0001 | D001 | style_instruction | chat_reply | user_self | unclear | Пользователь попросил описать рабочий процесс в форме user story. |
| E0002 | D002 | complaint | plan_or_proposal | user_self | moved_on | Пользователь указал, что тип количества может быть числом, и попросил преобразование, принимающее и число, и строку. |
| E0003 | D003 | repeat_request | agent_brief | agents_models | unclear | Пользователь повторил запрос на результаты ревью, чтобы передать их агенту-исполнителю. |
| E0004 | D002 | complaint | code_comment_or_ui_string | other_humans | accepted_explicit | Пользователь попросил убрать комментарий, который пересказывает условие непосредственно перед ним. |
| E0005 | D002 | complaint | code_comment_or_ui_string | other_humans | accepted_explicit | Пользователь попросил убрать комментарий, который пересказывает результат следующего вызова. |
| E0006 | D002 | complaint | plan_or_proposal | user_self | moved_on | Пользователь указал, что шаблоны должны сохранять стандартное значение параметра. |
| E0007 | D002 | user_rewrite | commit_or_pr | other_humans | moved_on | Пользователь дал короткую версию сообщения коммита и попросил оставить в нём только заголовок. |
| E0008 | D004 | style_instruction | readme_or_doc | other_humans | moved_on | Для документа пользователь задал форму одного текстового файла с токенами, которые отображаются как виджеты. |
| E0009 | D004 | style_instruction | readme_or_doc | other_humans | moved_on | Пользователь задал структуру frontmatter: цельный блок properties, внутреннее содержимое которого компонент разбирает отдельно; позднее можно подключить YAML-парсер. |
| E0010 | D004 | complaint | other | unknown | accepted_explicit | Пользователь хотел яснее объяснить, почему элемент компактного списка не становится отдельной строкой при разделении абзацев. |
| E0011 | D004 | style_instruction | report_or_summary | user_self | moved_on | Пользователь попросил представить diff со счётчиками, сгруппированными по системным областям. |
| E0012 | D002 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь оспорил опасение, что значение по умолчанию затронет часть шаблонов до исправления бэкенда. |
| E0013 | D004 | complaint | other | unknown | moved_on | Пользователь указал, что документ без визуальных разделений труднее читать и он выглядит так, будто не поддерживает переносы строк. |
| E0014 | D004 | complaint | chat_reply | user_self | moved_on | Пользователь хотел ясное и собранное объяснение масштаба изменений публичного API. |
| E0015 | D004 | style_instruction | readme_or_doc | other_humans | moved_on | Пользователь попросил сохранить измерения и выводы в ADR как справочный материал для будущих обсуждений парсера. |
| E0016 | D004 | style_instruction | issue_or_ticket | other_humans | moved_on | Пользователь попросил включить в тикет оговорку о размене между редактируемостью ячеек и цельностью таблицы. |
| E0017 | D007 | complaint | other | user_self | moved_on | Пользователь попросил изложить предыдущий ответ по-русски естественным языком. |
| E0018 | D007 | complaint | skill_or_rules_page | agents_models | moved_on | Пользователь попросил убрать из текста правил явные упоминания конкретных инструментов управления версиями. |
| E0019 | D007 | complaint | skill_or_rules_page | agents_models | moved_on | Пользователь указал, что добавленный в файл правил текст не должен содержать русский язык. |
| E0020 | D007 | style_instruction | report_or_summary | user_self | unclear | Пользователь попросил сосредоточить ответ на делегировании и не отвлекаться на постороннюю находку. |
| E0021 | D007 | style_instruction | report_or_summary | user_self | unclear | Пользователь попросил представить в отчёте протестированные варианты решения. |
| E0022 | D007 | style_instruction | skill_or_rules_page | agents_models | unclear | Пользователь просил описать в навыке, как заранее выяснять применимость режима и получать от него нужные уточнения до начала работы. |
| E0023 | D007 | style_instruction | skill_or_rules_page | agents_models | unclear | Пользователь просил включить в навык перепроверяемую таблицу соответствия возможностей сабагентов Claude и Codex. |
| E0024 | D007 | repeat_request | chat_reply | user_self | moved_on | Пользователь повторно попросил проверить, существует ли аналогичный навык делегирования. |
| E0025 | D007 | complaint | report_or_summary | user_self | moved_on | Пользователь возразил против приписанного ему безусловного отказа и указал, что его цель — полный паритет двух видов субагентов. |
| E0026 | D007 | complaint | skill_or_rules_page | agents_models | moved_on | Пользователь хотел убрать из скилла жёсткую привязку к конкретной версии модели и использовать модель по умолчанию либо явно заданную в диалоге. |
| E0027 | D007 | style_instruction | readme_or_doc | other_humans | moved_on | Пользователь хотел, чтобы README объяснял цель скилла, недостатки стандартного плагина, необходимость скилла и его отличия от аналогов. |
| E0028 | D007 | style_instruction | skill_or_rules_page | agents_models | recorrected | Пользователь предложил доработать правила вызова скилла так, чтобы он автоматически подключался при ultracode и в режиме workflow. |
| E0029 | D007 | complaint | other | unknown | moved_on | Пользователь хотел, чтобы предложенный способ срабатывания скилла был переносимым и не требовал от каждого пользователя править личный CLAUDE.md. |
| E0030 | D007 | style_instruction | skill_or_rules_page | agents_models | moved_on | Пользователь хотел, чтобы триггер скилла учитывал прямое упоминание Codex и чтобы скилл можно было вызвать отдельной командой. |
| E0031 | D008 | style_instruction | other | user_self | moved_on | Пользователь задал для диаграммы высокий уровень детализации и попросил добавить понятные пояснения. |
| E0032 | D008 | style_instruction | other | user_self | moved_on | Пользователь попросил кратко показать на диаграмме точку входа пользовательского ввода. |
| E0033 | D009 | repeat_request | report_or_summary | user_self | moved_on | Пользователь попросил повторно проверить состояние памяти после перезагрузки и обновления системы. |
| E0034 | D009 | repeat_request | report_or_summary | user_self | unclear | Пользователь попросил ещё раз проверить оперативную память. |
| E0035 | D007 | style_instruction | skill_or_rules_page | agents_models | moved_on | Пользователь хочет внести инструкцию о запуске делегаций в скилл, где её увидят читатели в момент применения, а не оставлять её только в памяти ассистента. |
| E0036 | D007 | complaint | plan_or_proposal | user_self | moved_on | Пользователь хотел яснее понять, какое именно изменение предлагается и ограничивается ли оно скиллом. |
| E0037 | D009 | repeat_request | report_or_summary | user_self | moved_on | Пользователь снова попросил перепроверить оперативную память. |
| E0038 | D007 | style_instruction | skill_or_rules_page | agents_models | moved_on | Пользователь попросил добавить в скилл явное раскрытие состава Codex-агентов и возможность задавать их долю по непрерывной шкале. |
| E0039 | D007 | complaint | plan_or_proposal | user_self | unclear | Пользователь просит яснее объяснить, какую именно работу предлагает ассистент и как она повлияет. |
| E0040 | D007 | complaint | report_or_summary | user_self | unclear | Пользователь оспорил указанную низкую интенсивность рассуждения и уточнил, что по умолчанию хочет максимальную. |
| E0041 | D007 | complaint | commit_or_pr | other_humans | moved_on | Пользователь попросил убрать из текста коммита неуместное для проекта с одним недавним потребителем обозначение изменения как несовместимого. |
| E0042 | D007 | style_instruction | other | user_self | moved_on | Пользователь хочет, чтобы ответы Codex-субагентов возвращались в кратком саммари, как у Claude, либо это поведение можно было настроить с сохранением паритета. |
| E0043 | D007 | style_instruction | readme_or_doc | other_humans | moved_on | Пользователь просит зафиксировать в README цели, ради которых создавал навык. |
| E0044 | D007 | complaint | skill_or_rules_page | agents_models | moved_on | Пользователь считает, что раздел о делегировании нужно удалить из CLAUDE.md и оставить эти правила только в скилле. |
| E0045 | D007 | complaint | report_or_summary | user_self | moved_on | Пользователь указал, что объяснение высокой загрузки нехваткой памяти было неверным: её вызывали оставленные фоновые циклы. |
| E0046 | D007 | complaint | plan_or_proposal | user_self | moved_on | Пользователь поставил под сомнение предпосылку предложения заменить разбор TOML, указав на автоматическую загрузку конфига Codex. |
| E0047 | D017 | style_instruction | other | other_humans | unclear | Пользователь просил переработать README, чтобы он был понятнее и пригоднее для чтения людьми. |
| E0048 | D017 | style_instruction | readme_or_doc | other_humans | moved_on | Пользователь предпочёл вести сведения об изменениях в релизах, а не в отдельном файле changelog. |
| E0049 | D017 | repeat_request | other | user_self | moved_on | Пользователь повторил просьбу ответить на исходные вопросы о пунктах 1–5. |
| E0050 | D017 | complaint | agent_brief | agents_models | accepted_explicit | Пользователь хотел, чтобы предложение агента опиралось на отточенные существующие решения, а не выглядело самодельным костылём. |
| E0051 | D017 | style_instruction | report_or_summary | user_self | moved_on | Пользователь попросил оформить сравнение текущего решения с предлагаемым в виде таблицы. |
| E0052 | D028 | style_instruction | report_or_summary | user_self | moved_on | Пользователь задал структуру аудиторского отчёта: краткий вывод о пригодности для прода, таблицу проверенных утверждений, упорядоченные дефекты и список непроверенного. |
| E0053 | D028 | complaint | chat_reply | user_self | moved_on | Пользователь возразил против описания задания как связанного с кибер-темой и попросил поправить вызвавшую реакцию формулировку. |
| E0054 | D028 | complaint | readme_or_doc | other_humans | moved_on | Пользователь попросил исправить опубликованные заметки релизов с ошибочными счётчиками кейсов. |
| E0055 | D029 | complaint | plan_or_proposal | user_self | recorrected | Пользователь счёл предложение добавить автоматизацию CI и матрицу версий среды исполнения несоразмерным задаче. |
| E0056 | D029 | complaint | plan_or_proposal | user_self | moved_on | Пользователь указал, что заявленная зависимость от Node и утверждение о Node 18+ неверны: зависимость есть от Codex. |
| E0057 | D029 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь попросил сосредоточить план на практических проблемах, мешающих пользоваться агентами, и ограничить тестирование проверкой навыка и скриптов. |
| E0058 | D030 | style_instruction | message_to_others | other_humans | moved_on | В комментариях о найденных проблемах пользователь просил ограничиться констатацией и не включать поиск причин. |
| E0059 | D030 | style_instruction | readme_or_doc | user_self | recorrected | Пользователь просил оформить оставшиеся проверки чеклистом в Markdown-блоке. |
| E0060 | D030 | style_instruction | readme_or_doc | user_self | recorrected | Пользователь просил включить в чеклист также уже просмотренные страницы. |
| E0061 | D030 | style_instruction | readme_or_doc | user_self | recorrected | Пользователь просил оставить в чеклисте только страницы, убрав прочие сведения. |
| E0062 | D030 | style_instruction | readme_or_doc | user_self | moved_on | Пользователь попросил собрать разделы со страницами внутренней платформы в единый список. |
| E0063 | D029 | complaint | plan_or_proposal | user_self | moved_on | Пользователь указал, что предложение выбирать только последнее изображение не учитывает отправленную серию и не соответствует ожидаемому нативному поведению. |
| E0064 | D029 | complaint | other | user_self | moved_on | Пользователь хотел, чтобы ответ той сессии не перегружал его техническими деталями вроде идентификатора треда и кода выхода, согласуясь с тем, как говорит нативный агент. |
| E0065 | D029 | complaint | report_or_summary | user_self | unclear | Пользователь указал, что вывод о единственном оставшемся пути без защиты от зависания учитывал только git, хотя работа ведётся и с другими системами. |
| E0066 | D029 | complaint | skill_or_rules_page | agents_models | moved_on | Пользователь считает, что в скилле содержится несвязанная с ним информация. |
| E0067 | D035 | style_instruction | report_or_summary | user_self | moved_on | Пользователь попросил изложить отчёт на естественном русском языке. |
| E0068 | D035 | repeat_request | report_or_summary | user_self | unclear | Пользователь повторил просьбу применить все оставшиеся предложенные правки к документации. |
| E0069 | D051 | style_instruction | issue_or_ticket | other_humans | recorrected | Пользователь попросил подробный отзыв для issue с сопоставлением ожидаемого и фактического поведения, предложениями по исправлению и без прямого упоминания внутреннего инструмента. |
| E0070 | D051 | complaint | report_or_summary | user_self | moved_on | Пользователь оспорил рекомендацию вводить бюджеты времени и предложил ориентироваться на бюджетную модель нативных агентов. |
| E0071 | D051 | style_instruction | issue_or_ticket | other_humans | unclear | Пользователь попросил добавить в фидбек для issue версию плагина. |
| E0072 | D051 | style_instruction | issue_or_ticket | other_humans | accepted_explicit | Пользователь хотел, чтобы в отчёте коротко указали версию, без избыточных подробностей о состоянии репозитория. |
| E0073 | D051 | complaint | plan_or_proposal | user_self | moved_on | Пользователь считает предложение согласовывать новый дизайн лишним, поскольку дизайн уже стандартизирован. |
| E0074 | D036 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь хотел, чтобы предложение не добавляло координатору лишних настроек и обеспечивало простое, знакомое поведение по умолчанию. |
| E0075 | D036 | style_instruction | readme_or_doc | other_humans | unclear | Пользователь просит исправить документацию об оценках: указать, что CI запускает шесть бесплатных наборов, а проверка точности запускается локально перед релизом. |
| E0076 | D036 | praise | plan_or_proposal | user_self | not_applicable | Пользователь положительно оценил предложенный план упрощения. |
| E0077 | D036 | complaint | plan_or_proposal | user_self | moved_on | Пользователю было непонятно предложение D о разборе заголовка и тела драйвером. |
| E0078 | D036 | style_instruction | plan_or_proposal | agents_models | unclear | Пользователь просит переосмыслить описание и решение G с учётом естественности для координатора и нативных агентов. |
| E0079 | D036 | style_instruction | other | agents_models | unclear | Пользователь просит перенести таблицу полей из текста реле в SKILL.md, чтобы модель реле не копировала её. |
| E0080 | D060 | style_instruction | code_comment_or_ui_string | other_humans | recorrected | Пользователь сначала попросил оставить подписи табов без изменений. |
| E0081 | D061 | complaint | chat_reply | user_self | recorrected | Пользователь хотел яснее понять объяснение того, почему соседняя сессия в auto-режиме постоянно запрашивает разрешения. |
| E0082 | D060 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь указал, что план ошибочно предлагал добавить обёртку, хотя нужный div уже есть. |
| E0083 | D004 | style_instruction | chat_reply | user_self | moved_on | Пользователь попросил подробнее объяснить перечисленные решения и что требуется от него. |
| E0084 | D004 | style_instruction | commit_or_pr | other_humans | moved_on | Пользователь потребовал, чтобы текст PR содержал крайне подробный отчёт. |
| E0085 | D060 | style_instruction | commit_or_pr | other_humans | moved_on | Пользователь просит дать вариант названия коммита на английском. |
| E0086 | D061 | style_instruction | skill_or_rules_page | agents_models | unclear | Пользователь хотел оформить правило о составных Bash-командах и разместить его в пользовательском CLAUDE.md. |
| E0087 | D062 | complaint | commit_or_pr | other_humans | moved_on | Пользователь усомнился, что описанный риск для промо-блока действительно является проблемой, особенно когда необязательный обработчик не передан. |
| E0088 | D062 | complaint | code_comment_or_ui_string | other_humans | moved_on | Пользователь попросил убрать ненужный комментарий из кода. |
| E0089 | D036 | style_instruction | agent_brief | agents_models | accepted_explicit | Пользователь предпочитает жёсткий формат возврата сабагента, если он окажется эффективнее. |
| E0090 | D036 | style_instruction | plan_or_proposal | user_self | accepted_explicit | Пользователь просит показывать все жизнеспособные подходы, когда их несколько. |
| E0091 | D064 | style_instruction | code_comment_or_ui_string | other_humans | moved_on | Пользователь хочет показывать дробное количество как пришло и скрывать только единицу. |
| E0092 | D064 | style_instruction | code_comment_or_ui_string | other_humans | moved_on | Пользователь просит выбрать привычное расположение множителя относительно названия товара. |
| E0093 | D064 | approved | commit_or_pr | other_humans | not_applicable | Пользователь явно одобрил предложенное сообщение коммита командой commit. |
| E0094 | D036 | approved | skill_or_rules_page | agents_models | not_applicable | Пользователь явно одобрил предложенные правки страницы навыка. |
| E0095 | D067 | approved | commit_or_pr | other_humans | not_applicable | Пользователь явно согласился с предложенным текстом коммита. |
| E0096 | D067 | style_instruction | commit_or_pr | other_humans | moved_on | Пользователь попросил оформить сообщение коммита с типом feat по принятому соглашению. |
| E0097 | D067 | repeat_request | plan_or_proposal | user_self | recorrected | Пользователь повторно попросил вернуться к плану в новой ветке после выяснения, что первый PR уже в основной ветке. |
| E0098 | D067 | style_instruction | readme_or_doc | other_humans | moved_on | Пользователь потребовал описать ломающие изменения для внешних интеграторов в документации к релизу. |
| E0099 | D067 | complaint | plan_or_proposal | user_self | moved_on | Пользователь исправил в плане название внутреннего метода: речь о пользовательских шаблонах, а не обо всех. |
| E0100 | D069 | style_instruction | skill_or_rules_page | agents_models | accepted_explicit | Пользователь задал для навыка пул агентов и предел параллельных запусков, а также потребовал заранее согласовывать настройки и учитывать их словесные переопределения. |
| E0101 | D069 | complaint | report_or_summary | user_self | accepted_explicit | Пользователь исправил описание пула агентов, проверки настроек перед запуском и возможности переопределять их словами. |
| E0102 | D067 | user_rewrite | commit_or_pr | other_humans | moved_on | Пользователь предложил заголовок коммита без восклицательного знака. |
| E0103 | D036 | user_rewrite | skill_or_rules_page | agents_models | moved_on | Пользователь дал свою уточнённую формулировку правил пула агентов, последовательного использования другого агента и подтверждения и переопределения настроек оркестрации. |
| E0104 | D070 | style_instruction | report_or_summary | user_self | moved_on | Пользователь хотел получить этот итоговый отчёт по-русски естественной формулировкой, только в рамках текущего запроса. |
| E0105 | D070 | style_instruction | report_or_summary | user_self | moved_on | Пользователь попросил представить сводку проблем и идей таблицей с колонками о текущем состоянии, будущем изменении и его пользе. |
| E0106 | D070 | style_instruction | report_or_summary | user_self | recorrected | Пользователь попросил сформулировать по пунктам 19–27 конкретные вопросы с вариантами ответов и рекомендациями. |
| E0107 | D070 | repeat_request | other | user_self | moved_on | Пользователь повторно попросил ясно указать рекомендуемый вариант ответа, в частности по пункту 19. |
| E0108 | D060 | style_instruction | other | unknown | unclear | Пользователь просит оформить подписи сегмента в компактном режиме по показанному макету. |
| E0109 | D060 | approved | code_comment_or_ui_string | other_humans | not_applicable | Пользователь явно одобрил предложенные короткие английские подписи для вкладок. |
| E0110 | D070 | style_instruction | report_or_summary | user_self | unclear | Пользователь просил, чтобы сообщения и отчёты Codex-агентов и нативных агентов выглядели для него сходно и не выдавали служебный формат за ответ координатора. |
| E0111 | D060 | complaint | code_comment_or_ui_string | other_humans | moved_on | Пользователь указал, что подписи интерфейса тоже нужно обновить по макету. |
| E0112 | D060 | style_instruction | other | user_self | moved_on | Пользователь просил обосновывать предложение примерами из кодовой базы и не вводить ref без такого прецедента. |
| E0113 | D074 | style_instruction | skill_or_rules_page | user_self | unclear | Пользователь просит, чтобы сообщения нового навыка, видимые ему, звучали по-человечески, а не как машинный вывод. |
| E0114 | D074 | style_instruction | other | user_self | moved_on | Пользователь просил сделать человекочитаемый вывод достаточным и хорошо оформленным. |
| E0115 | D074 | complaint | agent_brief | agents_models | recorrected | Пользователь хотел ясного ограничения охвата проверки сессий и пояснил, что актуальность следует оценивать по артефактам проекта. |
| E0116 | D075 | approved | chat_reply | user_self | not_applicable | Пользователь явно согласился с объяснением причины, по которой адаптивность не работала в старом лейауте. |
| E0117 | D075 | style_instruction | code_comment_or_ui_string | other_humans | moved_on | Пользователь попросил сократить подробный комментарий в коде и избегать лишних странных комментариев. |
| E0118 | D075 | complaint | code_comment_or_ui_string | other_humans | moved_on | Пользователь попросил сократить подробный комментарий в коде и убрать из него лишние детали. |
| E0119 | D075 | style_instruction | code_comment_or_ui_string | other_humans | moved_on | Пользователь просит проверить комментарии, добавленные в ветку, на ясность и необходимость. |
| E0120 | D076 | complaint | other | user_self | unclear | Пользователь хотел заменить слово seat и протокольное SEAT в обращённом к нему тексте на простое обозначение агента или модели. |
| E0121 | D076 | complaint | skill_or_rules_page | agents_models | unclear | Пользователь предложил исправить правило навыка, предписывавшее дословно повторять примеры на английском. |
| E0122 | D076 | style_instruction | skill_or_rules_page | agents_models | unclear | Примеры фраз в навыке clear нужно подавать на языке пользователя, а не предписывать повторять дословно. |
| E0123 | D077 | complaint | plan_or_proposal | user_self | unclear | Пользователь просил яснее объяснить механизм предлагаемой правки и уточнить, исправит ли она проблему или лишь замаскирует её. |
| E0124 | D077 | repeat_request | plan_or_proposal | user_self | moved_on | Пользователь повторно просил объяснить миграцию на новую версию плагина. |
| E0125 | D078 | complaint | other | unknown | moved_on | Пользователь считает имеющееся качество документирования и комментирования неудовлетворительным и хочет его улучшить. |
| E0126 | D078 | complaint | chat_reply | user_self | unclear | Пользователь считает упоминание агента по непрозрачному ярлыку W2 малоинформативным и хочет, чтобы такие сообщения давали более понятный контекст о роли агента. |
| E0127 | D078 | complaint | chat_reply | user_self | moved_on | Пользователь поправил ответ, чтобы обсуждение касалось улучшения пользовательского опыта, а не поведения ассистента в текущей сессии. |
| E0128 | D078 | complaint | skill_or_rules_page | agents_models | unclear | Пользователь хотел короткое и симметричное имя модели вместо длинного сочетания с полным идентификатором. |
| E0129 | D078 | complaint | plan_or_proposal | user_self | moved_on | Пользователь указал, что короткие имена моделей однозначны и дополнительная приставка не нужна. |
| E0130 | D078 | complaint | report_or_summary | user_self | moved_on | Пользователь заметил, что в рекомендациях к сводке не включён конкретный пункт о правке правила именования. |
| E0131 | D078 | style_instruction | report_or_summary | user_self | unclear | Пользователь попросил оформить необходимую сводку находок в Markdown-блоке для переноса в чистый контекст. |
| E0132 | D078 | style_instruction | other | user_self | moved_on | Оценивать документацию по ясности формулировок, уместности и пользе для человека, а не только по фактическим ошибкам. |
| E0133 | D078 | style_instruction | readme_or_doc | mixed | moved_on | Сохранить в начале README цель проекта, чтобы она объясняла его назначение читателю и помогала агенту не терять контекст. |
| E0134 | D078 | style_instruction | readme_or_doc | other_humans | unclear | В начале README сначала нужно назвать предназначение плагина понятными человеку словами, не перегружая его терминами и техническими деталями. |
| E0135 | D078 | user_rewrite | readme_or_doc | other_humans | accepted_explicit | Сформулировать начало через то, что Codex можно использовать в Claude Code наряду с его родными агентами, и подкрепить это примерами совместной работы. |
| E0136 | D078 | approved | readme_or_doc | other_humans | not_applicable | Пользователь условно одобрил тезис о Codex как субагенте Claude Code наряду с родными агентами Claude. |
| E0137 | D078 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь хотел, чтобы план соответствовал обсуждению: провести новые запуски агентов для правки README и поиска подходящих навыков или руководств, а не закреплять цель в репозитории. |
| E0138 | D078 | style_instruction | chat_reply | user_self | moved_on | Пользователь уточнил, что набор правил должен приближать к читателю любые написанные тексты, включая комментарии и документы, а не только README. |
| E0139 | D078 | approved | agent_brief | agents_models | not_applicable | Пользователь явно принял предложенный профиль читателя как основу для последующей цепочки написания. |
| E0140 | D078 | complaint | chat_reply | user_self | moved_on | Пользователь сообщил, что предложенная ассистентом ссылка на README не открывается. |
| E0141 | D078 | complaint | readme_or_doc | other_humans | moved_on | Пользователь отметил, что переработанный README улучшился, но общее качество текста выросло недостаточно. |
| E0142 | D078 | style_instruction | plan_or_proposal | user_self | moved_on | Пользователь описал желаемое направление навыков для текста: приятная ему подача и более короткие, лаконичные и корректные слова. |
| E0143 | D078 | style_instruction | readme_or_doc | other_humans | moved_on | Пользователь попросил переписать README так, чтобы он был согласован с остальными изменениями. |
| E0144 | D075 | complaint | code_comment_or_ui_string | other_humans | accepted_explicit | Пользователь попросил упростить комментарий в коде. |
| E0145 | D078 | style_instruction | readme_or_doc | user_self | moved_on | Пользователь попросил строить миграционный гайд на процедуре с удалением маркетплейса. |
| E0146 | D078 | approved | other | other_humans | not_applicable | Пользователь одобрил предложенные заголовки релизов, равные тегам. |
| E0147 | D078 | style_instruction | report_or_summary | other_humans | moved_on | Пользователь попросил удалить указанную команду установки из заметок релизов. |
| E0148 | D078 | approved | report_or_summary | other_humans | not_applicable | Пользователь одобрил предложенную формулировку заметки о совместимости с экосистемой skills. |
| E0149 | D078 | repeat_request | plan_or_proposal | user_self | moved_on | Пользователь повторно запросил план и структуру плагина с учётом выбранного имени. |
| E0150 | D078 | style_instruction | agent_brief | agents_models | moved_on | Пользователь попросил собрать необходимый контекст и ссылки в Markdown-блок для передачи новой сессии. |
| E0151 | D081 | style_instruction | readme_or_doc | other_humans | unclear | Пользователь задал для документации ориентир на понятность, уместные формулировки и отсутствие лишнего. |
| E0152 | D078 | style_instruction | other | other_humans | unclear | Пользователь хочет типовой текст MIT-лицензии без нестандартно выглядящей формулировки об авторских правах. |
| E0153 | D081 | style_instruction | research_doc | user_self | recorrected | Пользователь попросил собрать широкий набор практик для улучшения текстов, допуская избыточность на первом этапе. |
| E0154 | D081 | repeat_request | research_doc | user_self | unclear | Пользователь повторил просьбу охватить все источники для библиотеки практик письма. |
| E0155 | D081 | approved | commit_or_pr | other_humans | not_applicable | Пользователь явно одобрил предложенную формулировку коммита. |
| E0156 | D081 | complaint | report_or_summary | user_self | moved_on | Пользователь усомнился в обоснованности утверждения, что Diataxis-скиллы являются дубликатами, поскольку их не сравнили с материалами проекта. |
| E0157 | D081 | style_instruction | research_doc | other_humans | moved_on | Пользователь хотел сохранить все 271 практику в материалах исследования, при необходимости вынеся их отдельно. |
| E0158 | D082 | style_instruction | report_or_summary | user_self | unclear | Пользователь попросил оформить результаты и выводы в отдельный блок Markdown для продолжения работы в другом контексте. |
| E0159 | D081 | repeat_request | report_or_summary | user_self | unclear | Пользователь повторно запросил отчёт о статусе исследования источников. |
| E0160 | D082 | complaint | report_or_summary | user_self | moved_on | Пользователь уточнил, содержит ли переданная сводка все результаты. |
| E0161 | D081 | complaint | report_or_summary | user_self | moved_on | Пользователь усомнился в неподтверждённом утверждении о потере стенограмм и попросил его перепроверить. |
| E0162 | D081 | style_instruction | other | user_self | unclear | Пользователь предпочёл проходить эту калибровку в виде HTML-артефакта. |
| E0163 | D081 | complaint | code_comment_or_ui_string | user_self | moved_on | Пользователь хотел, чтобы элементы интерфейса, включая футер и паузу, были расположены ближе друг к другу. |
| E0164 | D083 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь счёл предложенный план потенциально переусложнённым и предложил ограничиться пунктом 3. |
| E0165 | D081 | praise | plan_or_proposal | user_self | not_applicable | Пользователь положительно отозвался о предложенном редизайне интерфейса. |
| E0166 | D081 | repeat_request | code_comment_or_ui_string | user_self | unclear | Пользователь повторил просьбу явно указать в карточке, на что обратить внимание при сравнении. |
| E0167 | D081 | complaint | readme_or_doc | other_humans | moved_on | Пользователь хотел добавить к README блок обновления, аналогичный блоку установки. |
| E0168 | D081 | style_instruction | readme_or_doc | other_humans | unclear | Пользователь хочет, чтобы README начинался с цели и вводного раздела для читателя, а технические подробности были собраны отдельно; блок обновления должен быть устроен так же, как блок установки. |
| E0169 | D081 | style_instruction | plan_or_proposal | user_self | unclear | Пользователь предлагает сначала сравнить около десяти вариантов структуры README, а затем тщательно перебирать и переписывать каждый блок и предложение. |
| E0170 | D081 | style_instruction | skill_or_rules_page | agents_models | unclear | Пользователь просит закрепить в скилле описанный метод подготовки README, чтобы правила и техника не терялись. |
| E0171 | D081 | complaint | other | unknown | moved_on | Пользователь хотел, чтобы вступление убедительнее доносило философию и пользу плагина. |
| E0172 | D081 | user_rewrite | readme_or_doc | other_humans | moved_on | Пользователь дал пример команд для раздела установки и предложил заменить их на полные команды CLI. |
| E0173 | D081 | style_instruction | readme_or_doc | other_humans | moved_on | Пользователь хотел учитывать проверенные решения и лучшие практики популярных аналогов при разработке структуры документации плагина. |
| E0174 | D081 | complaint | readme_or_doc | other_humans | unclear | Пользователь указал, что оформление README уступает оформлению примеров коллег, которых он прислал. |
| E0175 | D081 | style_instruction | skill_or_rules_page | agents_models | moved_on | Пользователь хотел, чтобы метод письма включал анализ терминов, их значений и контекста употребления. |
| E0176 | D081 | style_instruction | skill_or_rules_page | agents_models | moved_on | Пользователь хотел циклическую многоагентную работу с итерациями как над каждым блоком, так и над документом целиком. |
| E0177 | D081 | style_instruction | skill_or_rules_page | agents_models | unclear | Пользователь хотел правило против повторения одной мысли в нескольких местах, с исключением для обоснованных случаев. |
| E0178 | D081 | complaint | readme_or_doc | other_humans | moved_on | Пользователь указал, что заголовок Install and first run расходится с принятой для этого блока терминологией Quick Start. |
| E0179 | D081 | style_instruction | chat_reply | user_self | moved_on | Пользователь подтвердил, что уместность терминов в данной области нужно перепроверять. |
| E0180 | D081 | style_instruction | report_or_summary | user_self | moved_on | Пользователь задал структуру и формат карты: раскрыть ценность и назначение каждого блока и оценить его понятность и лаконичность. |
| E0181 | D081 | complaint | report_or_summary | user_self | moved_on | Пользователь оспаривает негативную рамку вокруг появления новых классов дефектов и просит учитывать, что итерации нужны для улучшения и навыка, и документации, при контроле регрессий. |
| E0182 | D087 | complaint | chat_reply | user_self | moved_on | Пользователь просил изложить предыдущий ответ по-русски естественным языком. |
| E0183 | D087 | complaint | plan_or_proposal | user_self | moved_on | Пользователь хотел, чтобы варианты в таблице были понятнее сопоставлены по градации. |
| E0184 | D081 | complaint | readme_or_doc | agents_models | unclear | Пользователь счёл имя DEFECTS.md неудачным и предложил назвать документ ISSUES.md, а правила репозитория поместить в CLAUDE.md. |
| E0185 | D081 | user_rewrite | other | agents_models | unclear | Пользователь предложил заменить имя документа DEFECTS.md на ISSUES. |
| E0186 | D087 | style_instruction | report_or_summary | user_self | unclear | Пользователь попросил оформить итог выполнения пяти шагов как отчёт с результатами, выводами и предложениями. |
| E0187 | D081 | complaint | report_or_summary | user_self | accepted_explicit | Пользователь просит объяснить, зачем нужны бюджеты и как они могут улучшить текст. |
| E0188 | D081 | style_instruction | report_or_summary | user_self | moved_on | Пользователь считает оговорки антипаттерном и предлагает учитывать это при формулировке текста. |
| E0189 | D084 | complaint | research_doc | other_humans | moved_on | Пользователь сомневается, что часть утверждений в документе всё ещё актуальна, поскольку main обновился. |
| E0190 | D084 | style_instruction | agent_brief | agents_models | unclear | Пользователь попросил оформить в промт первые три предложения об усилении навыка оркестрации, чтобы передать его чистому агенту. |
| E0191 | D090 | style_instruction | commit_or_pr | other_humans | moved_on | Пользователь просил сформулировать тему коммита одним предложением о содержании и обосновании и не добавлять трейлеры авторства. |
| E0192 | D090 | style_instruction | other | unknown | moved_on | Пользователь указал разместить запись CHANGELOG под разделом Unreleased. |
| E0193 | D067 | style_instruction | report_or_summary | other_humans | moved_on | Пользователь попросил подготовить для бэкенда отчёт, зафиксировав неоднозначности и фронтенд-обходы, особенно для двух полей конфигурации. |
| E0194 | D093 | complaint | chat_reply | user_self | moved_on | Пользователь указал, что утверждение о непередаче нужного свойства устарело: он сам управляет миграцией и проверял локальную реализацию. |
| E0195 | D093 | complaint | report_or_summary | user_self | recorrected | Пользователь хотел, чтобы отчёт был короче и не перегружал лишними подробностями. |
| E0196 | D093 | complaint | report_or_summary | user_self | unclear | Пользователь хотел понять практическое влияние пунктов и нужно ли по ним что-либо делать. |
| E0197 | D093 | complaint | chat_reply | user_self | moved_on | Пользователь поправил неверное описание проблемы с одним полем: его отсутствие и было причиной предыдущей работы. |
| E0198 | D093 | style_instruction | message_to_others | other_humans | recorrected | Пользователь попросил сократить отзыв для бэкенда и оформить его в Markdown-блоке. |
| E0199 | D093 | complaint | message_to_others | other_humans | unclear | Пользователь хотел яснее обозначить, что одно поле задано не во всех конфигурациях и чем это мешает. |
| E0200 | D093 | complaint | message_to_others | other_humans | unclear | Пользователь повторно попросил убрать пункт об одном внутреннем методе, оставшийся в сокращённой редакции. |
| E0201 | D096 | complaint | report_or_summary | user_self | recorrected | Пользователь оспаривает рекомендацию не менять расчёт и указывает, что значение строят и проверяют на клиенте. |
| E0202 | D096 | complaint | chat_reply | user_self | recorrected | Пользователь указывает, что объяснение вырожденного значения через единственный вариант не согласуется со скриншотом без вариантов, где диапазон всё же показан. |
| E0203 | D097 | complaint | chat_reply | user_self | moved_on | Пользователь хотел заменить неестественный внутренний термин и исправить другие грамматически неудачные построения в статусном сообщении. |
| E0204 | D096 | complaint | report_or_summary | user_self | moved_on | Пользователь уточнил, что сужение выдачи активным фильтром до одной или нуля карточек не означает отсутствие карточек и не должно трактоваться как неактивный фильтр. |
| E0205 | D097 | complaint | chat_reply | user_self | moved_on | Пользователь поправил ассистента: решения оставить прежнее название owner's other project A не было. |
| E0206 | D097 | complaint | other | user_self | unclear | Пользователь возразил против совета отложить переименование, указав, что со временем оно усложнится. |
| E0207 | D097 | style_instruction | chat_reply | user_self | moved_on | Пользователь просит подкрепить выводы данными, а не одним мнением. |
| E0208 | D097 | complaint | plan_or_proposal | user_self | moved_on | Пользователя смутило упоминание в плане навыка, которого пока нет. |
| E0209 | D097 | style_instruction | code_comment_or_ui_string | user_self | moved_on | Пользователь разрешил единственное исключение для старых данных и попросил в cleanup пометить их прежнее расположение и дать возможность удалить. |
| E0210 | D085 | complaint | chat_reply | user_self | moved_on | Пользователь хотел, чтобы ответ по существу касался написания скилла и пользы skill-creator, а не уходил в широкий разбор. |
| E0211 | D101 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь просил не сводить цель ресерча к сокращению контекста и направить его на управленческую эффективность оркестратора. |
| E0212 | D103 | complaint | other | user_self | unclear | Пользователь хотела убрать из видимой переписки избыточные вызовы и технический шум. |
| E0213 | D103 | complaint | other | user_self | moved_on | Пользователь хотел увидеть конкретные изменения до и после, а не их предполагаемое влияние. |
| E0214 | D101 | complaint | plan_or_proposal | user_self | moved_on | Пользователь хотел понять, к чему относится предложенное исключение из правила и что оно должно делать. |
| E0215 | D103 | complaint | chat_reply | user_self | moved_on | Пользователь хотел упростить и убрать избыточную служебную строку в конце видимого диалога. |
| E0216 | D103 | complaint | chat_reply | user_self | moved_on | Пользователь просил не подавать инцидент как отговорку, а спроектировать решение, которое достигает заявленной цели и предотвращает повторение инцидента. |
| E0217 | D101 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь хотел, чтобы предложение объясняло простыми словами, что именно изменится и как это повлияет на него. |
| E0218 | D101 | praise | chat_reply | user_self | not_applicable | Пользователь похвалил ясный формат ответа, сгруппированный по тому, как изменения повлияют на него. |
| E0219 | D101 | style_instruction | report_or_summary | user_self | unclear | Пользователь попросил разложить объяснение выводов и оставшихся тезисов по отдельным пунктам, чтобы обсудить результаты сравнения с аналогами. |
| E0220 | D103 | complaint | chat_reply | user_self | moved_on | Пользователь поправил утверждение, что при этом харнессе нельзя свести завершение к одному сообщению: в нативной сессии после hand-back было одно результирующее сообщение. |
| E0221 | D101 | style_instruction | chat_reply | user_self | moved_on | Пользователь попросил кратко описать новые скиллы и их работу. |
| E0222 | D101 | repeat_request | chat_reply | user_self | moved_on | Пользователь повторил вопрос о том, умеет ли рой общаться. |
| E0223 | D098 | complaint | commit_or_pr | other_humans | moved_on | Пользователь хотел более простое и сфокусированное описание PR. |
| E0224 | D110 | complaint | report_or_summary | user_self | moved_on | Пользователь исправил утверждение ассистента, что консоль нельзя читать. |
| E0225 | D110 | style_instruction | plan_or_proposal | user_self | recorrected | Пользователь попросил сгруппировать задачи в логические блоки и указать предполагаемые оценки в story points. |
| E0226 | D110 | style_instruction | plan_or_proposal | user_self | moved_on | Пользователь попросил объединить блоки и представить план в виде трёх задач. |
| E0227 | D110 | style_instruction | issue_or_ticket | other_humans | accepted_explicit | Пользователь попросил не проставлять оценки и убрать упоминания зонтичного тикета и дизайн-задачи из описания рабочего тикета. |
| E0228 | D111 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь указал, что план неверно учитывает устройство интеграции, и предложил добавить свойства целей в корневой компонент настройки. |
| E0229 | D111 | complaint | readme_or_doc | other_humans | moved_on | Пользователь попросил убрать из changelog лишнюю фразу о поведении пропов одного компонента и прежнем изменении. |
| E0230 | D111 | complaint | readme_or_doc | other_humans | moved_on | Пользователь потребовал размещать новые записи changelog сверху файла, не разносить одно изменение по секциям в разных местах. |
| E0231 | D111 | user_rewrite | commit_or_pr | other_humans | recorrected | Пользователь задал точную новую формулировку заголовка коммита без знака несовместимого изменения. |
| E0232 | D111 | complaint | commit_or_pr | other_humans | moved_on | Пользователь хотел, чтобы после переименования коммита его сообщение состояло только из одной строки, без оставшегося старого тела. |
| E0233 | D111 | complaint | code_comment_or_ui_string | other_humans | moved_on | Пользователь счёл комментарий к пропу избыточным. |
| E0234 | D111 | complaint | commit_or_pr | other_humans | moved_on | Пользователь попросил укоротить описание PR и оформить его в Markdown-блоке. |
| E0235 | D113 | complaint | readme_or_doc | other_humans | moved_on | Пользователь хотел сократить многословную запись в чейнджлоге. |
| E0236 | D113 | approved | commit_or_pr | other_humans | not_applicable | Пользователь принял предложенное имя коммита, сразу попросив выполнить коммит. |
| E0237 | D114 | user_rewrite | message_to_others | other_humans | recorrected | Пользователь предложил свою редакцию комментария с рекомендацией целиться в определённую версию зависимости. |
| E0238 | D115 | complaint | other | other_humans | unclear | Пользователь хотел более краткий и простой RFC с корректной аргументацией и структурой из трёх блоков. |
| E0239 | D115 | style_instruction | readme_or_doc | other_humans | recorrected | Пользователь хотел markdown-разметку и раздел о том, почему описанная ситуация является проблемой. |
| E0240 | D115 | complaint | other | other_humans | recorrected | Пользователь хотел убрать из RFC ненужные технические детали и свериться с FAQ из документации. |
| E0241 | D115 | complaint | other | other_humans | recorrected | Пользователь хотел сделать RFC короче и добавить конкретные примеры проблем с CommonJS и инлайнингом. |
| E0242 | D115 | complaint | plan_or_proposal | other_humans | moved_on | Пользователь исправил неверную формулировку: один пакет собирается в двух форматах, а не релизится дважды. |
| E0243 | D115 | style_instruction | readme_or_doc | other_humans | recorrected | Пользователь хотел получить три отдельные части RFC в самостоятельных markdown-блоках. |
| E0244 | D115 | complaint | other | other_humans | recorrected | Пользователь хотел убрать неподтверждённое утверждение, что CommonJS приходится чинить: он просто присутствует в пакетах. |
| E0245 | D115 | complaint | plan_or_proposal | other_humans | recorrected | Пользователь счёл фразу о лишнем размере у каждого потребителя пустой и хотел убрать её. |
| E0246 | D115 | complaint | other | other_humans | recorrected | Пользователь хотел обобщить замечание: сломанными уже встречаются некоторые CommonJS-сборки, а не одна конкретная библиотека целиком. |
| E0247 | D115 | complaint | plan_or_proposal | other_humans | recorrected | Пользователь счёл текущий текст RFC похожим на нейросетевой слоп и хотел более естественную подачу. |
| E0248 | D115 | complaint | other | other_humans | moved_on | Пользователь счёл фиксацию версии Node ненужной для библиотек, предложил связывать её с потребностями потребителей и упомянуть примеры перехода на ESM-only. |
| E0249 | D112 | complaint | readme_or_doc | other_humans | moved_on | Пользователь хотел короткий README с ясным описанием миссии в начале, наглядной структурой и без лишней технической информации и шума. |
| E0250 | D112 | user_rewrite | skill_or_rules_page | agents_models | unclear | В описании workflow нужно зафиксировать разбор текста на структуру и смыслы, их оценку и сбор best practices для разных видов текста. |
| E0251 | D112 | complaint | other | unknown | accepted_explicit | Убрать Troubleshooting как бесполезную для пользователя секцию; редкие сложности агент должен разрешать или эскалировать. |
| E0252 | D112 | style_instruction | skill_or_rules_page | agents_models | unclear | Страницы навыка должны сохранять все обсуждённые выводы, чтобы последующие запуски учитывали их сразу. |
| E0253 | D112 | approved | plan_or_proposal | user_self | not_applicable | Пользователь явно принял скелет README версии 2. |
| E0254 | D112 | praise | readme_or_doc | other_humans | unclear | Пользователь похвалил новую редакцию README в целом. |
| E0255 | D112 | approved | readme_or_doc | other_humans | not_applicable | Пользователь явно принял показанную редакцию README. |
| E0256 | D112 | complaint | plan_or_proposal | user_self | moved_on | Пользователь возражает против представления памяти модели об эталоне как угрозы замеру: для сравнения это базовый результат, который скилл должен превзойти. |
| E0257 | D117 | complaint | chat_reply | user_self | moved_on | Пользователь указал на кажущееся противоречие в объяснении автоматической очистки и попросил согласовать его с предыдущим утверждением о новой версии тестового фреймворка. |
| E0258 | D117 | complaint | other | user_self | moved_on | Пользователю не хватало пояснения к X6 и таблицы экспериментов. |
| E0259 | D117 | style_instruction | commit_or_pr | other_humans | moved_on | Пользователь попросил оформить в черновике PR отчёт с показателями до и после каждого изменения. |
| E0260 | D117 | complaint | commit_or_pr | other_humans | accepted_explicit | Пользователь счёл заголовок PR неудачным и не соответствующим принятой конвенции. |
| E0261 | D117 | approved | commit_or_pr | other_humans | not_applicable | Пользователь выбрал предложенный вариант заголовка PR. |
| E0262 | D117 | complaint | commit_or_pr | other_humans | accepted_explicit | Пользователь попросил сделать описание PR более естественным и аккуратным. |
| E0263 | D117 | complaint | message_to_others | other_humans | moved_on | Пользователь хотел, чтобы комментарий ревьюеру состоял из двух коротких и предметных блоков. |
| E0264 | D117 | complaint | code_comment_or_ui_string | other_humans | moved_on | Пользователь счёл комментарий неестественным и хотел более естественную формулировку. |
| E0265 | D119 | style_instruction | chat_reply | user_self | unclear | Пользователь попросил сосредоточить мнение на дизайне будущего решения, а не на текущем состоянии. |
| E0266 | D117 | complaint | report_or_summary | user_self | moved_on | Пользователь попросил разъяснить неясную формулировку и основание для утверждения об узком месте. |
| E0267 | D117 | complaint | chat_reply | user_self | moved_on | Пользователь связал удаление ожидания с прежним заверением ассистента, что всё в порядке, и указал на необходимость исправить флейк. |
| E0268 | D117 | complaint | code_comment_or_ui_string | other_humans | moved_on | Пользователь хотел сократить и переписать комментарий у списка оптимизатора, который счёл многословным и неестественным. |
| E0269 | D112 | complaint | readme_or_doc | other_humans | unclear | Пользователь считает третий вариант README плохо оформленным и многословным. |
| E0270 | D112 | complaint | readme_or_doc | other_humans | unclear | Пользователь хотел видеть в README раздел быстрого старта и учёт прежнего отзыва по этому репозиторию. |
| E0271 | D112 | style_instruction | agent_brief | agents_models | moved_on | Пользователь предложил роль рационализатора, который проверяет необходимость деталей с учётом целевой аудитории документа. |
| E0272 | D112 | complaint | other | unknown | moved_on | Пользователь хотел обобщать фидбек и встраивать его в действующие правила, а не превращать в повсеместный набор умолчаний. |
| E0273 | D112 | complaint | plan_or_proposal | user_self | unclear | Пользователь хотел переосмыслить и упростить прежние системы, а не представлять предложение как отказ от них. |
| E0274 | D117 | complaint | report_or_summary | user_self | unclear | Пользователь хотел получить сводку текущего эксперимента с результатами отчётов и цифрами, прежде чем обсуждать дальнейшие шаги. |
| E0275 | D117 | complaint | report_or_summary | user_self | moved_on | Пользователь хотел ясную сводку с выводами и результатами вместо нечитаемой таблицы с множеством цифр. |
| E0276 | D117 | complaint | code_comment_or_ui_string | other_humans | accepted_explicit | Пользователь хотел, чтобы комментарии в конфиге не звучали как нейрослоп. |
| E0277 | D117 | complaint | chat_reply | user_self | moved_on | Пользователь выразил недовольство многословием ответа. |
| E0278 | D117 | complaint | code_comment_or_ui_string | other_humans | accepted_explicit | Пользователь счёл комментарий о сбросе состояния избыточным и попросил удалить его. |
| E0279 | D117 | user_rewrite | code_comment_or_ui_string | unknown | moved_on | Пользователь предложил заменить слишком точную числовую оценку на более общую формулировку о сильном замедлении. |
| E0280 | D117 | complaint | code_comment_or_ui_string | unknown | recorrected | Пользователь хотел, чтобы комментарий объяснял, что неограниченное число воркеров в CI замедляет прогон, без неподтверждённого фиксированного числа CPU. |
| E0281 | D117 | style_instruction | code_comment_or_ui_string | other_humans | recorrected | Пользователь обозначил направление про большое число CPU и попросил предложить дополнительные варианты комментария. |
| E0282 | D117 | style_instruction | code_comment_or_ui_string | other_humans | recorrected | Пользователь предложил упомянуть очень большое число ядер и то, что множество воркеров лишь замедляет прогон. |
| E0283 | D117 | complaint | code_comment_or_ui_string | unknown | accepted_explicit | Пользователь указал, что число CPU на CI-хосте не фиксировано, поэтому комментарий не должен привязываться к конкретному числу. |
| E0284 | D117 | approved | code_comment_or_ui_string | other_humans | not_applicable | Пользователь выбрал вариант комментария с диапазоном от десятков до 100+ CPU. |
| E0285 | D117 | complaint | code_comment_or_ui_string | unknown | recorrected | Пользователь хотел, чтобы комментарий объяснял назначение списка пакетов и причину его существования, а не выделял отдельный пакет. |
| E0286 | D117 | complaint | code_comment_or_ui_string | agents_models | accepted_explicit | Пользователь счёл комментарий противоречащим расположенному ниже списку оптимизатора и выбрал другую формулировку. |
| E0287 | D117 | approved | code_comment_or_ui_string | other_humans | not_applicable | Пользователь выбрал второй предложенный вариант комментария. |
| E0288 | D117 | complaint | code_comment_or_ui_string | agents_models | accepted_explicit | Пользователь хотел заменить непонятный термин pre-bundled ясным объяснением того, зачем пакеты загружаются через Vite. |
| E0289 | D117 | style_instruction | code_comment_or_ui_string | other_humans | accepted_explicit | Пользователь предложил прямо сказать, что соответствующие модули ниже загружаются через Vite, а не Node, и объяснить причину. |
| E0290 | D117 | approved | code_comment_or_ui_string | other_humans | not_applicable | Пользователь выбрал вариант о загрузке пакетов через Vite из-за CSS или CJS, которые Node не обрабатывает. |
| E0291 | D117 | style_instruction | code_comment_or_ui_string | other_humans | recorrected | Пользователь попросил переосмыслить комментарий по аналогии с предыдущим, объяснив назначение списка. |
| E0292 | D117 | style_instruction | code_comment_or_ui_string | unknown | accepted_explicit | Пользователь потребовал объяснить, зачем существует список пакетов и какую задачу он решает, без отвлекающего упоминания отдельного пакета. |
| E0293 | D117 | approved | code_comment_or_ui_string | other_humans | not_applicable | Пользователь выбрал вариант, объясняющий предварительную сборку UI-библиотек и загрузку нескольких чанков вместо множества модулей. |
| E0294 | D117 | approved | code_comment_or_ui_string | other_humans | not_applicable | Пользователь в целом одобрил оставшийся комментарий про mainFields. |
| E0295 | D117 | complaint | other | other_humans | recorrected | Пользователь хотел, чтобы описание PR было оформлено и читалось лучше, ориентируясь на предыдущий PR. |
| E0296 | D117 | style_instruction | research_doc | other_humans | recorrected | Пользователь попросил разместить в PR отчёт в читаемом и хорошо оформленном виде. |
| E0297 | D117 | complaint | readme_or_doc | other_humans | recorrected | Пользователь усомнился в сравнении скорости CI и попросил учесть, что замеры могли быть сделаны в разное время суток. |
| E0298 | D117 | complaint | other | other_humans | recorrected | Пользователь хотел явно показать локальные замеры и этапы тестового прогона в PR-описании. |
| E0299 | D117 | style_instruction | commit_or_pr | other_humans | recorrected | Пользователь попросил представить локальные цифры более явно в тексте PR. |
| E0300 | D117 | style_instruction | commit_or_pr | other_humans | recorrected | Пользователь попросил разбить в PR цифры по этапам тестов, включая старт, сами тесты и подготовку окружения. |
| E0301 | D117 | style_instruction | commit_or_pr | other_humans | moved_on | Пользователь уточнил, что заголовок PR должен оставаться общим, а корректировать нужно остальной текст. |
| E0302 | D112 | style_instruction | readme_or_doc | other_humans | recorrected | Пользователь хочет оценивать README по понятности и приятности чтения, а не только по техническому качеству. |
| E0303 | D112 | complaint | report_or_summary | user_self | moved_on | Пользователь не хотел, чтобы текущую итерацию называли финальной до его одобрения. |
| E0304 | D112 | style_instruction | readme_or_doc | other_humans | recorrected | Пользователь ставит приятность чтения на первое место, связывая её с вовлечением, удобством работы и оформлением. |
| E0305 | D112 | style_instruction | readme_or_doc | other_humans | moved_on | Пользователь просит естественно организовать README и не перегружать Quick start или читателя техническими подробностями. |
| E0306 | D112 | complaint | plan_or_proposal | user_self | moved_on | Пользователь не хотел перегружать Quick start техническими подробностями и считал важным, чтобы README звучал естественно и органично. |
| E0307 | D112 | style_instruction | report_or_summary | user_self | moved_on | Пользователь хочет отчёт о вкладе агентов с заменами текста, оформленный как HTML-артефакт для анализа. |
| E0308 | D120 | complaint | plan_or_proposal | user_self | moved_on | Пользователь счёл список пакетов для обновления непонятно оформленным и хотел более ясного представления. |
| E0309 | D112 | praise | readme_or_doc | other_humans | not_applicable | Пользователь явно хвалит текущую редакцию текста как значительно лучшую предыдущей. |
| E0310 | D112 | complaint | readme_or_doc | other_humans | moved_on | Пользователь хотел, чтобы начало README показывало, что предоставляет проект, а не повторяло действия из Quick start, и предлагало средний вариант. |
| E0311 | D112 | style_instruction | readme_or_doc | other_humans | moved_on | Пользователь хотел добавлять в README бейджи, когда они уместны и передают доступную информацию, но счёл, что в данном тексте они не нужны. |
| E0312 | D112 | complaint | readme_or_doc | other_humans | unclear | Пользователь хотел, чтобы README 1 сохранял ясную информацию о доступных способах установки утилиты. |
| E0313 | D112 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь хотел, чтобы правила направляли выбор структуры и формы, а не требовали конкретные разделы или содержание для любых текстов. |
| E0314 | D112 | complaint | plan_or_proposal | user_self | accepted_explicit | Пользователь хотел уточнить, что правдивость текста оценивается в пределах его мира или контекста, включая установленные правила вымышленного рассказа. |
| E0315 | D120 | complaint | report_or_summary | user_self | moved_on | Пользователь не понял формулировку о том, для какого изменения требуется отдельное подтверждение. |
| E0316 | D120 | complaint | commit_or_pr | other_humans | accepted_explicit | Пользователь хотел, чтобы название PR не перечисляло лишь часть обновлённых зависимостей и точнее отражало масштаб изменений. |
| E0317 | D120 | approved | commit_or_pr | other_humans | not_applicable | Пользователь явно одобрил предложенное короткое название PR. |
| E0318 | D112 | complaint | readme_or_doc | other_humans | unclear | Пользователь счёл раздел опций недостаточно подходящим: предложил упорядочить все опции по полезности и усомнился в одной из меток. |
| E0319 | D123 | complaint | report_or_summary | user_self | moved_on | Пользователь указал, что утверждение об отсутствии других моделей GPT-6 неверно. |
| E0320 | D112 | style_instruction | commit_or_pr | other_humans | moved_on | Пользователь попросил включить в описание PR отдельную информацию о том, что удалили и по какой причине. |
| E0321 | D118 | style_instruction | chat_reply | user_self | moved_on | Пользователь попросил ответить по-русски. |
| E0322 | D124 | complaint | plan_or_proposal | user_self | moved_on | Пользователь указал на неверное утверждение в сравнении: оценочные материалы и руководство по выпуску можно вынести из устанавливаемой папки и при одном из вариантов. |
| E0323 | D124 | repeat_request | plan_or_proposal | user_self | moved_on | Пользователь повторно попросил напомнить план переноса. |
