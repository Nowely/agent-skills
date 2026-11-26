# Роли по умолчанию в мультиагентной работе: что говорят опубликованная практика и данные

Дата обзора: 2026-11-22. Цитаты, названия и URL оставлены на языке оригинала.

**О точности цитат.** Большинство страниц читалось через инструмент извлечения, который пересказывает страницу и цитирует из неё. Дословно по сырому тексту сверены только S13, S14 (полный текст документации пришёл в выдаче) и S16 (PDF прогнан через pdftotext). Остальные цитаты почти наверняка точны, но в мелочах формулировки могут расходиться. Перед публикацией их стоит сверить с оригиналом.

**Метки силы доказательств:** [сильно] — несколько независимых источников или рецензируемая работа. [умеренно] — один контролируемый эксперимент или согласный опыт нескольких вендоров. [слабо] — единичный препринт, самоотчёт вендора или косвенный перенос. [суждение] — прямых данных нет, вывод мой.

---

## 0. Итог в пяти строках

1. Лучше всего подтверждён **верификатор**: свежий агент, который получает сырые артефакты и прогоняет проверки, дающие pass/fail. Это сильнейший элемент черновика. Не хватает только явных критериев приёмки и защиты от «ранней победы».
2. «Чистый координатор» поддержан как роль, но **абсолютные запреты против данных**. Мешают эффект «испорченного телефона», плохие результаты мультиагентности на последовательных задачах и наценка в 3–15× по токенам. Вдобавок текущая документация Claude Code прямо пишет, что нехватка контекста «rarely the problem anymore».
3. **Критик плана как обязательный участник по умолчанию не подтверждается.** Без внешней опоры LLM-критика ненадёжна, а данные о ней противоречивы. Рецензент «will always find something». Сам вендор сообщает, что ролевое разбиение planner/implementer/tester/reviewer расходует больше токенов на координацию, чем на работу. Критика стоит оставить, но включать его по триггеру.
4. **Продолжать тот же тред верификатора для проверки финального ответа** дёшево. Но против этого говорят якорение, предпочтение собственного текста и деградация в длинных диалогах. Прямых исследований именно этой схемы нет. Нужна оговорка в брифе, а для ответственных задач свежая проверка.
5. Модели одного семейства по умолчанию работают **с честно признанным смещением**: self-/family-bias и коррелированные ошибки задокументированы. Смягчают это проверки, основанные на исполнении, и опциональный кросс-семейный верификатор для ответственных задач.

---

## 1. Источники

### 1.1 Вендоры и практики (документация, блоги)

| ID | Название | URL | Владелец / автор | Дата | Тип | Чем релевантно |
|---|---|---|---|---|---|---|
| S1 | Building effective agents | https://www.anthropic.com/engineering/building-effective-agents | Anthropic (Erik S., Barry Zhang) | 2024-12-19 | блог вендора | «start simple», orchestrator-workers, evaluator-optimizer, ground truth из среды |
| S2 | How we built our multi-agent research system | https://www.anthropic.com/engineering/multi-agent-research-system | Anthropic | 2025-06-13 | блог вендора | лид + субагенты, 4×/15× токенов, кодинг плохо параллелится, Opus-лид + Sonnet-субагенты |
| S3 | Effective context engineering for AI agents | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | Anthropic | 2025-09-29 | блог вендора | context rot, компакция, сводки субагентов на 1–2 тыс. токенов |
| S4 | Building agents with the Claude Agent SDK | https://claude.com/blog/building-agents-with-the-claude-agent-sdk | Anthropic | 2025-09-29 | блог вендора | проверки по правилам лучше LLM-as-judge |
| S5 | Effective harnesses for long-running agents | https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents | Anthropic (Justin Young) | 2025-11-26 | блог вендора | агент объявляет «готово» без e2e-проверки, браузерные проверки |
| S6 | Building multi-agent systems: When and how to use them | https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them | Anthropic (Cara Phillips и др.) | 2026-01-23 | блог вендора | 3–10× токенов, ролевое разбиение проигрывает, паттерн verification subagent, «early victory» |
| S7 | Harness design for long-running apps (заголовок по slug) | https://www.anthropic.com/engineering/harness-design-long-running-apps | Anthropic (Prithvi Rajasekaran) | 2026-03-24 | блог вендора | отдельный evaluator против самооценки; evaluator лишний в пределах возможностей модели; 20× стоимость |
| S8 | How and when to use subagents in Claude Code | https://claude.com/blog/subagents-in-claude-code | Anthropic | 2026-04-07 | блог вендора | когда субагенты не нужны; свежий взгляд для верификации |
| S9 | The advisor strategy | https://claude.com/blog/the-advisor-strategy | Anthropic | 2026-04-09 | блог вендора | дешёвый исполнитель + сильный советник (инверсия оркестратора) |
| S10 | Multi-agent coordination patterns: Five approaches… | https://claude.com/blog/multi-agent-coordination-patterns | Anthropic (Cara Phillips и др.) | 2026-04-10 | блог вендора | оркестратор как бутылочное горлышко; верификатор без критериев штампует «ок» |
| S11 | Building agents: When to fold subagents into your main agent loop | https://claude.com/blog/building-agents-when-to-fold-subagents-into-your-main-agent-loop | Anthropic (Diane Sarkis) | 2026-10-22 | блог вендора | один цикл часто лучше по качеству, цене и задержке; субагенты остаются для верификации |
| S12 | Claude Code docs: Subagents | https://code.claude.com/docs/en/sub-agents | Anthropic | прочитано 2026-11-22 | док. вендора | когда работать в основной сессии; возобновление субагента; выбор модели |
| S13 | Claude Code docs: Best practices | https://code.claude.com/docs/en/best-practices | Anthropic | прочитано 2026-11-22 | док. вендора | «give Claude a check to run», свежий рецензент, «reviewer will always find something», устаревшие советы о контексте |
| S14 | Claude Code docs: Agent teams | https://code.claude.com/docs/en/agent-teams | Anthropic | прочитано 2026-11-22 | док. вендора | лид начинает работать сам; 3–5 участников; якорение при последовательном расследовании |
| S15 | Equipping agents for the real world with Agent Skills | https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills | Anthropic | 2025-10-16 | блог вендора (только сниппеты) | progressive disclosure: каталог читается по требованию |
| S16 | A practical guide to building agents | https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf | OpenAI | 2025 (в тексте даты нет) | гайд вендора | сначала выжать максимум из одного агента; manager pattern; сначала самая сильная модель |
| S17 | Codex: Subagents | https://developers.openai.com/codex/subagents (редирект на learn.chatgpt.com/docs/agent-configuration/subagents) | OpenAI | прочитано 2026-11-22 | док. вендора | параллелить чтение, осторожно с параллельной записью; context pollution/rot; та же модель для субагентов |
| S18 | Don't Build Multi-Agents | https://cognition.com/blog/dont-build-multi-agents | Cognition (Walden Yan) | 2025-06-12 | блог практика | неявные решения в действиях; однопоточный агент |
| S19 | Multi-Agents: What's Actually Working | https://cognition.com/blog/multi-agents-working | Cognition (Walden Yan) | 2026-04-22 | блог практика | запись в одном потоке; ревьюер без общего контекста; «smart friend»; слабый основной агент не работает |
| S20 | Benchmarking multi-agent architectures | https://www.langchain.com/blog/benchmarking-multi-agent-architectures | LangChain (Will Fu-Hinthorn) | 2025-06-10 | блог вендора + мини-бенчмарк | supervisor «испорченный телефон», почти +50% после пересылки ответов без пересказа |
| S21 | How and when to build multi-agent systems | https://www.langchain.com/blog/how-and-when-to-build-multi-agent-systems | LangChain (Harrison Chase) | 2025-06-16 | блог вендора | чтение параллелится, запись нет |
| S22 | The Orchestrator's Tax | https://martinfowler.com/articles/orchestrator-tax.html | Rahul Garg (Thoughtworks) на martinfowler.com | 2026-07-16 | эссе практика | внимание оркестратора как дефицитный ресурс; пересечение файлов как сигнал к объединению |
| S23 | Context Rot | https://www.trychroma.com/research/context-rot | Chroma (Hong, Troynikov, Huber) | 2025-07-14 | техотчёт | деградация с ростом длины входа у 18 моделей |

### 1.2 Исследования мультиагентных систем, самокоррекции и ролей

| ID | Название | URL | Авторы | Дата | Тип | Чем релевантно |
|---|---|---|---|---|---|---|
| S24 | Why Do Multi-Agent LLM Systems Fail? (MAST) | https://arxiv.org/abs/2503.13657 | Cemri et al. (UC Berkeley) | v1 2025-03-17, v3 2025-10-26 | препринт | таксономия 14 видов отказов; верификаторы поверхностны; одной финальной проверки мало |
| S25 | Towards a Science of Scaling Agent Systems (+ блог Google Research 2026-01-28) | https://arxiv.org/abs/2512.08296 ; https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/ | Kim et al. (Google и др.) | v1 2025-12-09, v3 2026-04-08 | препринт + блог | −39…−70% на последовательных задачах; порог около 45%; ошибки 17.2× против 4.4×; налог на инструменты |
| S26 | Rethinking the Bounds of LLM Reasoning: Are Multi-Agent Discussions the Key? | https://arxiv.org/abs/2402.18272 | Wang et al. | 2024-02-28 | препринт | один агент с сильным промптом примерно равен мультиагентной дискуссии |
| S27 | Agentless | https://arxiv.org/abs/2407.01489 | Xia et al. | 2024-07 (v2 2024-10) | препринт | простой конвейер с валидацией патча против сложных агентов |
| S28 | Can Small Agents Collaborate to Beat a Single LLM? | https://arxiv.org/abs/2601.11327 | Żywot et al. | 2026-01-16 (v2 2026-04-13) | препринт | качество системы определяется мощностью оркестратора |
| S29 | Large Language Models Cannot Self-Correct Reasoning Yet | https://arxiv.org/abs/2310.01798 | Huang et al. (Google DeepMind) | 2023-10 (v2 2024-03) | рецензир. (ICLR 2024) | внутренняя самокоррекция не работает; debate хуже self-consistency |
| S30 | Can LLMs Really Improve by Self-critiquing Their Own Plans? | https://arxiv.org/abs/2310.08118 | Valmeekam, Marquez, Kambhampati | 2023-10-12 | препринт | LLM-верификатор планов даёт ложные «ок» |
| S31 | On the Self-Verification Limitations of LLMs on Reasoning and Planning Tasks | https://arxiv.org/abs/2402.08115 | Stechly, Valmeekam, Kambhampati | 2024-02 (v2 2024-08) | препринт | самокритика проваливается, внешний верификатор даёт рост |
| S32 | When Can LLMs Actually Correct Their Own Mistakes? | https://arxiv.org/abs/2406.01297 | Kamoi et al. | 2024 | рецензир. (TACL 2024) | самокоррекция работает при надёжной внешней обратной связи |
| S33 | Self-Refine | https://arxiv.org/abs/2303.17651 | Madaan et al. | 2023-03 | препринт (известен как NeurIPS 2023; на странице не указано) | около +20% от самоотзыва; оспорено S29/S32 |
| S34 | Reflexion | https://arxiv.org/abs/2303.11366 | Shinn et al. | 2023-03 (v4 2023-10) | препринт (известен как NeurIPS 2023; на странице не указано) | 91% HumanEval с обратной связью от исполнения |
| S35 | CRITIC | https://arxiv.org/abs/2305.11738 | Gou et al. | 2023-05 (v4 2024-02) | рецензир. (ICLR 2024) | критика через инструменты; «crucial importance of external feedback» |
| S36 | LLMs cannot find reasoning errors, but can correct them given the error location | https://arxiv.org/abs/2311.08516 | Tyen et al. | 2023-11 (v3 2024-06) | рецензир. (ACL Findings 2024) | модели плохо находят ошибки |
| S37 | LLM Critics Help Catch LLM Bugs (CriticGPT) | https://arxiv.org/abs/2407.00215 | McAleese et al. (OpenAI) | 2024-06-28 | препринт | обученный критик ловит больше багов, чем люди, но галлюцинирует баги |
| S38 | Enhancing LLM Planning Capabilities through Intrinsic Self-Critique | https://arxiv.org/abs/2512.24103 | Bohnet et al. | 2025-12-30 | препринт | контрдовод: внутренняя самокритика улучшила планирование |
| S39 | Review Beats Planning: Dual-Model Interaction Patterns for Code Synthesis | https://arxiv.org/abs/2603.03406 | Jan Miller | 2026-03-03 | препринт, один автор | plan-then-code −2.4 п.п., review-after-code в плюсе |
| S40 | MetaGPT | https://arxiv.org/html/2308.00352v7 | Hong et al. | 2023 (v7 2024-11) | рецензир. (ICLR 2024; на странице не указано) | абляция ролей; исполняемая обратная связь +4.2/+5.4% |
| S41 | ChatDev | https://arxiv.org/html/2307.07924v5 | Qian et al. | 2023 (v5 2024-06) | рецензир. (ACL 2024; на странице не указано) | абляция фаз: тестирование важнее ревью; удаление ролей бьёт сильнее всего |
| S42 | AgentCoder | https://arxiv.org/html/2312.13010v3 | Huang et al. | 2023-12 (v3 2024-05) | препринт | отдельный дизайнер тестов, не видящий кода |
| S43 | Test-Driven Development for Code Generation | https://arxiv.org/abs/2402.13521 | Mathews, Nagappan | 2024-02 (v2 2024-06) | препринт | тесты в постановке задачи повышают успех |
| S44 | TDFlow: Agentic Workflows for Test Driven Development | https://arxiv.org/abs/2510.23761 | Han et al. | 2025-10 (v2 2026-01) | препринт | 88.8% SWE-Bench Lite с тестами, написанными людьми |

### 1.3 LLM-as-judge, смещения, якорение

| ID | Название | URL | Авторы | Дата | Тип | Чем релевантно |
|---|---|---|---|---|---|---|
| S45 | Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena | https://arxiv.org/abs/2306.05685 | Zheng et al. | 2023 | рецензир. (NeurIPS 2023 D&B) | self-enhancement, position- и verbosity-bias |
| S46 | LLM Evaluators Recognize and Favor Their Own Generations | https://arxiv.org/abs/2404.13076 | Panickssery, Bowman, Feng | 2024-04-15 | препринт (известен как NeurIPS 2024; на странице не указано) | self-preference растёт вместе со способностью узнать свой текст |
| S47 | Self-Preference Bias in LLM-as-a-Judge | https://arxiv.org/abs/2410.21819 | Wataoka et al. | 2024-10 (v2 2025-06) | воркшоп NeurIPS 2024 | смещение через «знакомость» (perplexity) |
| S48 | Play Favorites: A Statistical Method to Measure Self-Bias in LLM-as-a-Judge | https://arxiv.org/abs/2508.06709 | Spiliopoulou et al. | 2025-08-08 | препринт | self-bias и family-bias у GPT-4o и Claude 3.5 Sonnet |
| S49 | Do LLM Evaluators Prefer Themselves for a Reason? | https://arxiv.org/abs/2504.03846 | Chen et al. | 2025-04 (v3 2025-12) | препринт | у сильных моделей предпочтение во многом оправдано; вредное смещение остаётся; CoT его снижает |
| S50 | Preference Leakage: A Contamination Problem in LLM-as-a-judge | https://arxiv.org/abs/2502.01534 | Li et al. | 2025-02 (v3 2026-03) | рецензир. (ICLR 2026) | смещение у той же модели, при наследовании и внутри семейства; трудно обнаружить |
| S51 | Replacing Judges with Juries (PoLL) | https://arxiv.org/abs/2404.18796 | Verga et al. (Cohere) | 2024-04 | препринт | панель из разных семейств: меньше внутримодельного смещения, в 7× дешевле |
| S52 | When Does Verification Pay Off? A Closer Look at LLMs as Solution Verifiers | https://arxiv.org/abs/2512.02304 | Lu, Teehan, Jin, Ren | 2025-12 (v2 2026-04) | воркшоп ICLR 2026 | кросс-семейная верификация лучше, чем внутри семейства и самопроверка |
| S53 | Correlated Errors in Large Language Models | https://arxiv.org/abs/2506.07962 | Kim, Garg, Peng, Garg | 2025-06 | рецензир. (ICML 2025) | ошибки коррелируют, сильнее у одного провайдера; у сильных моделей даже между провайдерами |
| S54 | Anchoring Bias in LLM-as-a-Judge Systems: Prior Scores Compromise Evaluation Independence | https://arxiv.org/abs/2608.25869 | Kapetanovic et al. | 2026-08-26 | рецензир. (CIKM 2026, to appear) | прежние оценки в контексте якорят новые; CoT не помогает |
| S55 | LLMs Get Lost In Multi-Turn Conversation | https://arxiv.org/abs/2505.06120 | Laban et al. | 2025-05-09 | препринт | −39% в многоходовых диалогах; ранние допущения не пересматриваются |
| S56 | Are You Sure? Challenging LLMs… (FlipFlop) | https://arxiv.org/abs/2311.08596 | Laban et al. | 2023-11 | препринт (только сниппеты) | модели меняют ответ под нажимом (в среднем 46%) |

### 1.4 Практика людей: ревью и инспекции

| ID | Название | URL | Авторы | Дата | Тип | Чем релевантно |
|---|---|---|---|---|---|---|
| S57 | A Review of Software Inspections | https://drum.lib.umd.edu/handle/1903/770 | Porter, Siy, Votta | 1995/1998 (CS-TR-3552) | техотчёт | польза инспекций преувеличена, стоимость занижена |
| S58 | Expectations, Outcomes, and Challenges of Modern Code Review | https://2013.icse-conferences.org/content/expectations-outcomes-and-challenges-modern-code-review.html | Bacchelli, Bird (Microsoft) | 2013 | рецензир. (ICSE 2013), только сниппеты | ревью находит меньше дефектов, чем ожидают; основная польза в понимании кода |
| S59 | Automated Code Review In Practice | https://arxiv.org/abs/2412.18531 | Cihan et al. | 2024-12 | рецензир. (ICSE-SEIP 2025) | LLM-ревью: 73.8% замечаний закрыто, но закрытие PR медленнее; шумные замечания |

---

## 2. Утверждения по темам

Формат строки: утверждение | короткая цитата | при каких условиях верно | статус (supported / contested / unknown) | источник.

### Тема 1. Лид — чистый координатор или работающий лид; фрагментация контекста; когда один агент лучше; цена; последовательные и параллельные задачи

| # | Утверждение | Цитата | Условия | Статус | Ист. |
|---|---|---|---|---|---|
| 1.1 | Мультиагентность выигрывает на широком параллелизуемом чтении | "outperformed single-agent Claude Opus 4 by 90.2% on our internal research eval" | исследовательские запросы «в ширину», внутренний eval вендора, Opus-лид + Sonnet-субагенты | supported [умеренно] | S2 |
| 1.2 | В кодинге параллелизуемых задач мало; общий контекст и зависимости плохо подходят | "most coding tasks involve fewer truly parallelizable tasks than research" | текущие модели; S14: "For sequential tasks, same-file edits, or work with many dependencies, a single session or subagents are more effective." | supported [сильно] | S2, S14, S8 |
| 1.3 | На последовательных задачах мультиагентность вредит | "every multi-agent variant we tested degraded performance by 39-70%" | PlanCraft (последовательное планирование), 3 семейства моделей | supported [умеренно] | S25 |
| 1.4 | Если один агент уже силён, отдача от новых агентов отрицательная | "tasks where single-agent performance already exceeds 45% accuracy experience negative returns from additional agents" | бенчмарки S25; точное значение порога зависит от версии статьи | supported в одном исследовании, перенос unknown | S25 |
| 1.5 | Централизованный оркестратор сдерживает распространение ошибок | "independent multi-agent systems amplified errors by 17.2x" против "4.4x"; механизм: "enforcing validation bottlenecks that intercept errors before aggregation" | оркестратор **сам перепроверяет** рассуждения субагентов ("cross-checks reasoning steps before aggregation") | supported [умеренно] | S25 |
| 1.6 | Задачи с большим числом инструментов платят «налог на координацию» | "tool-rich environments amplify the coordination tax, making simpler architectures more effective" | у кодинг-агента 16+ инструментов | supported [умеренно] | S25 |
| 1.7 | Мультиагентность дорогая | "multi-agent systems use about 15× more tokens than chats"; "typically use 3-10x more tokens than single-agent approaches for equivalent tasks"; "1.6–6.2× token budgets relative to single-agent at matched performance"; харнесс "over 20x more expensive" | множитель сильно зависит от задачи | supported [сильно] | S2, S6, S25, S7 |
| 1.8 | Неявные решения расходятся между агентами | "Actions carry implicit decisions, and conflicting decisions carry bad results"; "Agents assume they share state with their children when they don't." | особенно при параллельной записи | supported [умеренно] | S18, S19 |
| 1.9 | Пересказ через координатора теряет информацию | "the sub agents cannot respond to the user directly in the supervisor architecture"; после пересылки без пересказа и других правок "nearly 50% increase in performance"; "The orchestrator becomes an information bottleneck… critical details are often lost or summarized away" | supervisor-архитектура; бенчмарк LangChain небольшой | supported [умеренно] | S20, S10 |
| 1.10 | Разбиение по ролям, а не по контексту, тратит токены на координацию | в эксперименте с "planner, implementer, tester, reviewer" субагенты "spent more tokens on coordination than on actual work"; совет: "an agent handling a feature should also handle its tests" | внутренний эксперимент вендора | supported [умеренно] | S6 |
| 1.11 | Один цикл часто лучше набора субагентов | "single agent with skills frequently outperformed both the one-prompt-for-everything design and the subagent design on quality", "often at a lower cost and latency per task"; "the model that writes the plan is also the one carrying it out, so it can change the plan mid-turn" | корпоративные агенты (не только код); полевой опыт вендора | supported [умеренно] | S11, S6, S26, S27 |
| 1.12 | Запись должна идти в одном потоке, а чтение можно параллелить | "multi-agent systems work best today when writes stay single-threaded"; "read actions are inherently more parallelizable than write actions"; "Be more careful with parallel write-heavy workflows" | согласны три независимых вендора | supported [сильно] | S19, S21, S17 |
| 1.13 | Довод «держать контекст маленьким, чтобы пережить компакцию» для Claude Code ослаб | "Running out of context is rarely the problem anymore."; но: "a focused context gets you better answers and costs less" и "the sentence can get lost when the conversation compacts" | текущие модели Claude с окном 1M и автокомпакцией; для Codex документация по-прежнему подчёркивает context rot | contested | S13, S17 |
| 1.14 | Качество падает с ростом контекста | "performance grows increasingly unreliable as input length grows"; "Context rot: performance degrades as the chat fills up with less relevant details." | 18 моделей 2025 года; простые задачи | supported [сильно] | S23, S17, S3 |
| 1.15 | Дефицитный ресурс — внимание оркестратора | "Every token in the orchestrator's context is competing for its attention" | эссе одного практика, оценки сделал сам оркестратор | supported [слабо] | S22 |
| 1.16 | Лид склонен сам браться за работу | "Sometimes the lead starts implementing tasks itself instead of waiting for teammates" | agent teams; вендор лечит инструкцией "Wait for your teammates…" | supported [умеренно] | S14 |
| 1.17 | Для фаз с общим контекстом и мелких правок лучше основная сессия | "Multiple phases share significant context, such as planning, implementation, and testing"; "For small tasks, the overhead of delegation outweighs the benefit." | официальная документация | supported [сильно] | S12, S8 |
| 1.18 | Делегирование само по себе ответ не улучшает | "Handing the same task to a subagent doesn't make the answer any better. A fresh reviewer does help" | по умолчанию субагент работает на той же или меньшей модели | supported [умеренно] | S13 |
| 1.19 | Если идти в мультиагентность, начинать с оркестратора и субагентов | "For most use cases, we recommend starting with orchestrator-subagent." | вендорская рекомендация | supported [умеренно] | S10, S16 |
| 1.20 | Брифы должны быть полными | "Each subagent needs an objective, an output format, guidance on the tools and sources to use, and clear task boundaries." | без этого агенты дублируют работу и оставляют пробелы | supported [умеренно] | S2 |

**Вывод по теме 1.** Литература поддерживает **лида-оркестратора в мультиагентном режиме**: S2, S10, S25, S14. Но она не поддерживает **обязательный мультиагентный режим и запрет лиду читать**. Данные указывают на три вещи. (а) Для последовательных и мелких задач, а также задач с общим контекстом, один агент лучше или не хуже (S11, S12, S25, S26). (б) Главный риск чистого координатора — «испорченный телефон» (S10, S20, S6). (в) Сдерживание ошибок в S25 возникает потому, что оркестратор **перепроверяет** выход субагентов, а не только раздаёт задачи. В черновике эту функцию несёт верификатор, но координатор должен уметь точечно смотреть первоисточник.

### Тема 2. Критика до реализации (ревью плана или дизайна)

| # | Утверждение | Цитата | Условия | Статус | Ист. |
|---|---|---|---|---|---|
| 2.1 | Без внешней обратной связи самокоррекция рассуждений не работает и может вредить | "LLMs struggle to self-correct their responses without external feedback" | одна модель правит себя, задачи на рассуждение, модели 2023 года | supported [сильно] | S29 |
| 2.2 | Прежние «успехи» самокоррекции опирались на оракула | "the improvements in these studies result from using oracle labels to guide the self-correction process" | — | supported | S29, S32 |
| 2.3 | LLM-критика промптом без внешнего сигнала не подтверждена | "no prior work demonstrates successful self-correction with feedback from prompted LLMs" (кроме задач, особо для этого удобных); "self-correction works well in tasks that can use reliable external feedback" | обзор работ до 2024 года | supported [сильно] | S32 |
| 2.4 | LLM-верификатор планов даёт ложные «ок» и ухудшает итог | "produce a notable number of false positives"; "significant performance collapse with self-critique" против "significant performance gains with sound external verification" | формальное планирование (Blocksworld и др.), модели уровня GPT-4 | contested (см. 2.5) | S30, S31 |
| 2.5 | Контрдовод: внутренняя самокритика улучшает планирование | "significant performance gains on planning datasets in the Blocksworld domain through intrinsic self-critique" | many-shot, итеративная правка, чекпойнты октября 2024; чисел в абстракте нет | contested [слабо] | S38 |
| 2.6 | Модели плохо находят ошибки, но хорошо их исправляют, если указать место | "LLMs' inability to find logical mistakes" | модели 2023–24 годов | supported [умеренно] | S36 |
| 2.7 | Внешние инструменты и исполнение делают критику полезной | CRITIC: "crucial importance of external feedback"; Reflexion "91% pass@1" (на обратной связи от тестов); Self-Refine "~20% absolute" (самоотзыв, оспорено в S29/S32) | — | supported для внешней опоры; contested для чистого самоотзыва | S35, S34, S33 |
| 2.8 | Отдельный оценщик лучше самооценки | "agents reliably skew positive when grading their own work"; "tuning a standalone evaluator to be skeptical turns out to be far more tractable"; "Separating the agent doing the work from the agent judging it proves to be a strong lever" | субъективные задачи (дизайн), оценщик кликает по живому приложению | supported [умеренно] | S7 |
| 2.9 | Но оценщик «из коробки» снисходителен и поверхностен | "Out of the box, Claude is a poor QA agent."; "identify legitimate issues, then talk itself into deciding they weren't a big deal"; "test superficially" | без калибровки few-shot | supported [умеренно] | S7 |
| 2.10 | Рецензент, которого попросили искать проблемы, всегда что-нибудь найдёт | "A reviewer that's asked to find problems will always find *something*. If you fix every finding, you end up with extra abstraction layers and tests for cases that can't happen." | рекомендация вендора; лечится формулой "report gaps that affect correctness and skip style" | supported [умеренно] | S13 |
| 2.11 | Обученные критики ловят баги, но выдумывают несуществующие | "models catch more bugs than human contractors"; "hallucinated bugs" | обученный CriticGPT, ревью **после** кода | supported [умеренно] | S37 |
| 2.12 | План перед кодом может проиграть ревью после кода | "plan-then-code degrades performance by 2.4 percentage points"; ревью после кода: +9.8 п.п. на хорошо специфицированных задачах | HumanEval+/MBPP+, маленькие модели, препринт одного автора | contested [слабо] | S39 |
| 2.13 | Планировщик предотвращает недоскоуп | "Without the planner, the generator under-scoped" | длинные сборки приложений | supported [слабо] | S7 |
| 2.14 | Планировать до реализации — для сложных и рискованных задач | "For complex or risky tasks, you can have teammates plan before implementing." | рекомендация, не измерение | supported [слабо] | S14 |
| 2.15 | Значительная доля отказов MAS — спецификация и системный дизайн; одной финальной проверки мало | доля категории system design ≈44% (сумма по видам отказов, подсчитана мной), из них FM-1.1 "disobey task spec" 11.8%; FM-2.2 "fail to ask for clarification" 6.8%; "sole reliance on final-stage, low-level checks is inadequate" | 7 фреймворков, более 1600 трасс | supported [умеренно]; что это аргумент за критика плана — моё суждение | S24 |
| 2.16 | В ролевых SE-агентах отдельный тест-дизайнер даёт больше, чем ревьюер | ChatDev: остановка после Review дала Executability 0.81 и Quality 0.3717; полный конвейер с Testing — 0.88 и 0.3953 ("testing critical for Executability"). AgentCoder: точность тестов 61.0 у одного агента против 87.8 у отдельного агента, итог 71.3 против 79.9 (HumanEval). MetaGPT: роли подняли исполнимость с 1.0 до 4.0 при росте цены с $0.915 до $1.385 | функции и мелкие приложения, модели GPT-3.5/4 | supported для этих условий; перенос на современные агенты unknown | S41, S42, S40 |
| 2.17 | У людей ревью и инспекции полезны, но их экономика спорна | "the benefits of inspections are often overstated" / "the costs … are understated"; ревью находит меньше дефектов, чем ожидают; LLM-ревью в индустрии: "73.8% of automated comments were resolved", но время закрытия PR выросло с 5 ч 52 мин до 8 ч 20 мин, плюс "faulty reviews, unnecessary corrections, and irrelevant comments" | инспекции 1990-х; Microsoft 2013; одна компания в 2024 году (Atlassian по сниппету сообщает обратный эффект) | contested | S57, S58, S59 |
| 2.18 | Ревью-агент после записи находит реальные баги | "Devin Review catches an average of 2 bugs per PR", "roughly 58% are severe" | самоотчёт вендора; ревью **после** кода, а не плана | supported [слабо] | S19 |

**Вывод по теме 2.** Сильных данных за **ревью плана LLM-критиком без внешней опоры** нет. Ближайшие данные смешанные (S30/S31 против S38; S39 против LPW/self-planning) или касаются ревью **после** кода (S19, S37). Есть надёжные данные против самокритики без внешнего сигнала (S29, S32, S36) и про шум рецензентов (S13, S59). Аргументы «за» косвенные: доля ошибок спецификации в MAST, опыт вендоров с отдельным оценщиком (S7) и советы планировать сложные задачи (S14). Ценность пре-критика у людей (S57) есть, но её цена занижена.

### Тема 3. Верификация: на исполнении против суждения; смещения судей; свежий против продолженного треда; якорение

| # | Утверждение | Цитата | Условия | Статус | Ист. |
|---|---|---|---|---|---|
| 3.1 | Истина берётся из среды | "it's crucial for the agents to gain “ground truth” from the environment at each step" | — | supported [сильно] | S1, S29, S32, S35 |
| 3.2 | Нужна проверка pass/fail и доказательство | "Give Claude something it can run that comes back pass or fail."; "“All tests pass” on its own tells you very little" | — | supported [сильно] | S13, S5 |
| 3.3 | LLM-as-judge ненадёжен как основной механизм | "This is generally not a very robust method, and can have heavy latency tradeoffs." | вендор | supported [умеренно] | S4 |
| 3.4 | Верификатор как субагент — паттерн, который работает | "Verification subagents succeed because they sidestep the telephone game problem."; верификатор "does not need to understand why the artifact was built as it was"; субагенты "effective at verification, parallel work, and modular permissioning" | нужны "clear success criteria, and tools to perform verification" | supported [сильно] | S6, S11, S8 |
| 3.5 | Типичный отказ верификатора — «ранняя победа» и поверхностность | "marking outputs as passing without thorough testing"; "many existing verifiers perform only superficial checks"; "the presence of a verifier is not a silver bullet"; "Claude's tendency to mark a feature as complete without proper testing" | лечится явным требованием "Run the full test suite and report all failures" | supported [сильно] | S6, S24, S5 |
| 3.6 | Верификатор без критериев штампует «ок» | "A verifier told only to check whether output is good, with no further criteria, will rubber-stamp the generator's output." | — | supported [умеренно] | S10 |
| 3.7 | Ревьюеру лучше чистый контекст | "the coding and review agents do not share any context beforehand"; /code-review "isn't swayed by the reasoning that produced the code"; субагент "doesn't inherit the assumptions, context, or blind spots" | практика вендоров; контролируемого исследования не нашёл | supported [умеренно] | S19, S13, S8 |
| 3.8 | Тесты, написанные рядом с кодом, смещены этим кодом | тесты "can be biased and affected by the code"; отдельный дизайнер тестов не видит кода | функции, GPT-3.5/4 | supported [слабо–умеренно] | S42 |
| 3.9 | Судьи предпочитают собственный текст | "linear correlation between self-recognition capability and the strength of self-preference bias"; "LLMs prefer texts more familiar to them"; MT-Bench фиксирует "self-enhancement" | парные сравнения, оценка текстов | supported [сильно] | S46, S47, S45 |
| 3.10 | Есть и смещение в пользу своего семейства | "some models, such as GPT-4o and Claude 3.5 Sonnet, systematically assign higher scores to their own outputs" и "also display family-bias" | 9 судей, экспертная разметка | supported [умеренно] | S48 |
| 3.11 | Родство генератора и судьи (та же модель, наследование, семейство) смещает оценку и плохо обнаруживается | "being the same model, having an inheritance relationship, and belonging to the same model family"; "is harder to detect compared to previously identified biases" | генератор синтетических данных против судьи; на агентов переношу я | supported [умеренно], перенос — суждение | S50 |
| 3.12 | Кросс-семейная верификация эффективнее | "verification across model families is more effective than either self-verification or verification within the same family"; "the benefits of verification decrease as the solver and verifier become more similar" | сильнее всего на математике и логике; работа с воркшопа | supported [умеренно] | S52 |
| 3.13 | Смена семейства — не панацея: ошибки коррелируют | факторы корреляции: "shared architectures and providers"; "larger and more accurate models have highly correlated errors, even with distinct architectures and providers" | более 350 моделей | supported [сильно] | S53 |
| 3.14 | Предпочтение себя у сильных моделей частично оправдано; CoT снижает вредную часть | "much of this preference aligns with objectively superior performance"; вредное смещение сохраняется, когда модель ошиблась | — | contested (нюанс) | S49 |
| 3.15 | Смягчение: панель из разных семейств | "exhibits less intra-model bias due to its composition of disjoint model families" | оценка генераций | supported [слабо–умеренно] | S51 |
| 3.16 | Прежние суждения в контексте якорят последующие; CoT и предупреждения не помогают | "prior scores, even when included only as context metadata, anchor judgments"; |d| до 0.71; якорные метаданные заблокировали 48% исправлений ошибок | судья с прежними оценками в контексте | supported [умеренно] | S54 |
| 3.17 | Последовательное расследование страдает от якорения | "Sequential investigation suffers from anchoring: once one theory is explored, subsequent investigation is biased toward it." | отладка | supported [слабо] | S14 |
| 3.18 | В длинных диалогах модели держатся за ранние допущения | "get lost and do not recover"; в среднем −39% | недоопределённые инструкции, раскрываемые по ходу | supported [умеренно], перенос частичный | S55 |
| 3.19 | Хост поддерживает продолжение субагента с полной историей | "Resumed subagents retain their full conversation history, including all previous tool calls, results, and reasoning." | о качестве ничего не утверждается | supported (как факт о функции) | S12 |

**Вывод по теме 3.** Верификация с опорой на исполнение — самый надёжный элемент всей литературы. Суждение одной модели о тексте той же модели или того же семейства смещено, и это задокументировано (S45–S50, S52, S53). Свежий контекст для ревью рекомендуют все вендоры, но контролируемого исследования «свежий против продолженного» я не нашёл. Для схемы «тот же верификатор потом читает финальный ответ» прямых данных нет. Косвенно против неё говорят якорение (S54, S14), деградация в многоходовом диалоге (S55) и предпочтение собственного текста (S46, S47).

### Тема 4. Минимальный состав

| # | Утверждение | Цитата | Условия | Статус | Ист. |
|---|---|---|---|---|---|
| 4.1 | Единственная роль, которую вендоры стабильно советуют выделять, — верификатор или независимый ревьюер | см. 3.4; "Getting a reviewer that hasn't seen how the code was written" | — | supported [сильно] | S6, S11, S13, S8, S19 |
| 4.2 | Отдельный оценщик избыточен там, где модель и так справляется | "for tasks within that boundary, the evaluator became unnecessary overhead"; "It is worth the cost when the task sits beyond what the current model does reliably solo." | один харнесс | supported [слабо–умеренно] | S7 |
| 4.3 | Тесты до кода повышают успех; узкое место — писать воспроизводящие тесты | "including test cases leads to higher success in solving programming challenges"; "88.8% pass rate on SWE-Bench Lite" с тестами от людей; "the primary obstacle … lies within writing successful reproduction tests"; S13: "write a failing test that reproduces it, then fix it" | функции и SWE-bench | supported [умеренно] | S43, S44, S13 |
| 4.4 | Одной финальной проверки мало, нужна многоуровневая | "sole reliance on final-stage, low-level checks is inadequate" | MAS-фреймворки | supported [умеренно] | S24 |
| 4.5 | Ролевое разбиение planner/implementer/tester/reviewer плохо окупается | см. 1.10 | — | supported [умеренно] | S6 |

**Вывод по теме 4.** Данные лучше всего поддерживают минимум «исполнитель + верификатор, у которого есть явные критерии приёмки, по возможности заданные до кода». Ранний критик полезен, когда задача на краю возможностей модели (S7) или ошибка спецификации дорога (S24). Это аргумент за **условный** критик, а не за критика по умолчанию. Точные триггеры — [суждение].

### Тема 5. Размер каталога ролей

| # | Утверждение | Цитата | Условия | Статус | Ист. |
|---|---|---|---|---|---|
| 5.1 | Начинать с простого | "finding the simplest solution possible, and only increasing complexity when needed"; "maximize a single agent’s capabilities first" | — | supported [сильно] | S1, S16 |
| 5.2 | Специализированные субагенты часто сворачивают обратно; выбор инструмента деградирует при большом их числе | "the dozen specialist subagents"; деградация после "30-50 tool definitions" | полевой опыт вендора | supported [умеренно] | S11 |
| 5.3 | Каталог, читаемый по требованию, не нагружает контекст | progressive disclosure: модель видит только имя и описание, полный текст — когда нужно | — | supported [умеренно] (S15 — только по сниппетам) | S15, S13 |
| 5.4 | Нарушение ролевой спецификации — редкий отказ | FM-1.2 "Disobey role spec" 1.5% | MAST | supported [умеренно] | S24 |
| 5.5 | Ролевые промпты при этом важны | удаление ролей дало "the most substantial impact on performance" | фиксированный конвейер ChatDev 2023 года | supported для этих условий | S41 |
| 5.6 | Команды разумного размера | "Start with 3-5 teammates"; "Three focused teammates often outperform five scattered ones"; "two to four agents per wave" | рекомендации, не измерения | supported [слабо] | S14, S22 |
| 5.7 | Debate и роли судей не обязательно окупаются | "multi-agent debate significantly underperforms simple self-consistency using majority voting"; но для отладки с конкурирующими гипотезами вендор советует спорящих участников | равное число ответов; задачи на рассуждение | contested | S29, S14 |

**Вывод по теме 5.** Держать каталог вне контекста и читать по имени — правильно (S15, S13, S11). Число 18 никакими данными не подтверждено и не опровергнуто. Есть только общий сигнал: специализированных ролей обычно больше, чем окупается (S6, S11). Нужен порог входа для каждой роли — [суждение].

### Тема 6. Распределение моделей по уровням

| # | Утверждение | Цитата | Условия | Статус | Ист. |
|---|---|---|---|---|---|
| 6.1 | Сильный лид + более дешёвые субагенты | "Claude Opus 4 as the lead agent and Claude Sonnet 4 subagents"; "upgrading to Claude Sonnet 4 is a larger performance gain than doubling the token budget" | исследовательские задачи | supported [умеренно] | S2 |
| 6.2 | Качество системы определяется мощностью оркестратора | "Overall system performance is driven primarily by orchestrator capacity rather than sub-agent capacity." | малые модели, препринт | supported [слабо–умеренно] | S28 |
| 6.3 | Обратная схема: дешёвый исполнитель + сильный советник | "pair Opus as an advisor with Sonnet or Haiku as an executor"; Sonnet+Opus: +2.7 п.п. на SWE-bench Multilingual при цене на 11.9% ниже; Haiku+Opus: 41.2% против 19.7% (BrowseComp) | данные вендора | supported [умеренно] | S9 |
| 6.4 | Смешанные конфигурации ведут себя непоследовательно | на BrowseComp-Plus централизованные смешанные конфигурации уступают однородной сильной модели; модели Anthropic выигрывают от смешения, OpenAI и Gemini проигрывают | S25, Appendix F, Fig. 4 | contested | S25 |
| 6.5 | Начинать с самой сильной модели везде и понижать по eval'ам | "build your agent prototype with the most capable model for every task to establish a performance baseline. From there, try swapping in smaller models" | — | supported [умеренно] | S16 |
| 6.6 | Субагентам по умолчанию — та же модель, что у родителя | Codex: "start with the same model and reasoning effort for its subagents"; Claude Code: "By default, a subagent you define runs on the same model as the conversation that starts it"; "Haiku is a good fit for subagents doing simple jobs" | — | supported [умеренно] | S17, S12, S13 |
| 6.7 | Слабый основной агент с сильным советником не работает | "SWE 1.5 was not good enough at being the primary model for this setup to really work."; "Where the pattern did work, and worked well, was across frontier models." | опыт практика | supported [слабо] | S19 |
| 6.8 | Сильнее проверяющий — выше отдача | reasoning post-training "weakens self-improvement abilities but strengthens cross-family improvement" | косвенно; прямого исследования «верификатор сильнее исполнителя» не нашёл | unknown [слабо] | S52, S37 |

**Вывод по теме 6.** Решающая роль у той, что держит план и синтез. Это поддержано (S2, S28) и в черновике закрыто тем, что координатор работает на модели хоста. «Сильная модель для критика и верификатора» правдоподобна, но прямых данных о том, что проверяющий должен быть сильнее исполнителя, мало. Понижать исполнителя по умолчанию данные не советуют (S16, S17, S19).

---

## 3. Вердикт по элементам черновика

| Элемент | Вердикт | Сила данных |
|---|---|---|
| E1. Основная сессия — чистый координатор (не читает целиком, не правит, не гоняет проверки) | **change** | умеренно; пороги — суждение |
| E2. Команда по умолчанию: исполнитель(и) + критик + верификатор | **change**: по умолчанию исполнитель + верификатор, критик по триггеру | умеренно |
| E2a. «Обычно один исполнитель» | **keep** | сильно |
| E3. Критик плана до записи (вердикт sound/change/stop, не более 5 замечаний; он же архитектурный критик; оценивает разбиение) | **keep** содержание, **change** условие запуска и требования к замечаниям | спорно; во многом суждение |
| E4. Свежий верификатор после записи: сырые артефакты и требования, не выводы исполнителя; прогон проверок | **keep** + критерии приёмки | сильно |
| E5. Тот же тред верификатора продолжается для проверки финального ответа (вместо свежего critic'а полноты) | **change**: оставить по умолчанию с жёстким протоколом; для ответственных задач — свежая проверка | слабо; во многом суждение |
| E6. Одно семейство моделей по умолчанию | **keep**, но признать смещение и опираться на исполнение; кросс-семейный верификатор по желанию для ответственных задач | умеренно–сильно (о смещении) |
| E6a. Уровни: сильная модель для критика и верификатора, топ — для необратимых решений | **keep**; добавить: исполнитель по умолчанию на модели хоста | слабо–умеренно |
| E7. Каталог около 18 ролей, читается по имени | **keep** ленивую загрузку; **change**: порог входа и слияние пересекающихся ролей | слабо; число — суждение |

### E1. Чистый координатор — change

**Что поддержано.** Если команда собрана, нужен один владелец плана, решений и диалога с пользователем. Это manager pattern (S16, S10) и лид в S2. Лиду нужно мешать «делать самому» (S14). Когда пишет один исполнитель, координатор не пишет, и запись остаётся однопоточной (S19, S21). Context rot реален (S23, S17), так что держать контекст координатора чистым разумно.

**Что против.** (1) Пересказ через координатора теряет детали. Это «испорченный телефон» (S20, S10, S6), а в S20 почти +50% дала именно пересылка ответа без пересказа. (2) На последовательных задачах мультиагентность проигрывает на 39–70% (S25). Кодинг редко параллелится (S2). Для мелких правок и фаз с общим контекстом основная сессия лучше (S12, S8). Один цикл часто лучше по качеству, цене и задержке (S11). (3) Наценка 3–15× по токенам (S2, S6, S25). (4) Довод «пережить компакцию» в Claude Code устарел: "Running out of context is rarely the problem anymore" (S13). Но компакция по-прежнему теряет инструкции (S13), а у Codex акцент на context rot (S17). (5) Выигрыш централизации в S25 появляется потому, что оркестратор **перепроверяет** выход субагентов.

**Минимальные изменения.**
1. **Сольный режим по размеру задачи.** Если задача мелкая или последовательная (один модуль, нет новой сущности, нет нескольких исполнителей), основная сессия работает как обычный агент: читает, правит, гоняет проверки. Команду она не поднимает, при желании зовёт только верификатора. Источники: S8, S11, S12, S25. Конкретный порог — [суждение].
2. **Вместо «никогда не читает» — «не читает целиком».** Координатору можно точечно читать строки, от которых зависит решение или бриф, и фрагменты diff'а, на которые ссылается замечание. Исполнители и верификатор возвращают указатели (`file:line`, команда и её вывод), а не пересказ. Координатор передаёт их дальше дословно. Источники: S20, S10, S2 («lightweight references»).
3. **Переформулировать довод и вынести состояние в файл.** Причина малого контекста — качество и цена (S23, S22, S13), а не выживание при компакции. План, брифы и журнал решений хранить в файле, а не только в контексте: это внешняя память по S2 и S5, и компакция его не затронет.

### E2 / E2a. Состав команды — change, «один исполнитель» — keep

**Против критика по умолчанию.** Вендор пишет, что ролевое разбиение planner/implementer/tester/reviewer "spent more tokens on coordination than on actual work" (S6). Отдельный оценщик в пределах возможностей модели — "unnecessary overhead" (S7). При высокой базовой точности одного агента новые агенты дают отрицательную отдачу (S25).

**За верификатора по умолчанию.** Это единственная роль, которую выделяют все вендоры (S6, S11, S13, S8, S19). Одной финальной проверки мало (S24), отсюда тесты до кода (S43, S44) и условный критик.

**Минимальное изменение.** Состав по умолчанию: исполнитель + верификатор. Критик подключается по триггеру: новая сущность или модуль, изменение публичного API или общих потребителей, несколько исполнителей, необратимые операции, неоднозначный запрос, явная просьба пользователя. Список триггеров — [суждение]: прямых данных о порогах нет.

### E3. Критик плана — keep содержание, change запуск и требования

**Что хорошо.** Мандат включает «более дешёвые альтернативы, в том числе не делать». Он противодействует известной склонности рецензентов раздувать решение (S13). Лимит в 5 ранжированных замечаний и вердикт sound/change/stop с этим согласуются. Оценка разбиения при нескольких исполнителях совпадает с «пересечение файлов — сигнал к объединению» (S22) и с разбиением по границам контекста (S6). Отдельный от автора критик лучше самокритики (S7). Ошибки спецификации — заметная доля отказов (S24).

**Против.** У LLM-критики без внешней опоры слабая доказательная база (S29, S32, S36). Ложные «ок» встречаются на планах (S30, S31), хотя S38 это оспаривает. Ревью после кода, возможно, полезнее плана до кода (S39, слабо; S19, S37 — данные о ревью после кода). Шум и цена ревью (S59, S57, S58).

**Минимальные изменения.**
1. Запуск по триггеру из E2.
2. Каждое замечание привязано к `file:line` или к названному потребителю и называет конкретную цену игнорирования. «sound, замечаний нет» — явно допустимый исход. Стиль пропускать: "report gaps that affect correctness and skip style" (S13).
3. Координатор может отклонить замечание, записав причину в журнал решений. Иначе «рецензент всегда что-то найдёт» превращается в усложнение (S13).
4. Критик получает запрос, план и места в коде, но не цепочку рассуждений координатора. Это тот же принцип свежего рецензента (S13, S19).
5. По возможности критик выдаёт и список проверок приёмки, которые потом прогонит верификатор. Так тесты появляются до кода (S43, S44) без отдельной роли. Это [суждение].

### E4. Свежий верификатор — keep, добавить критерии

Самый поддержанный элемент: S1, S13, S6, S11, S19, S42, S41 (тестирование важнее ревью), S29/S32/S35 (внешняя опора). Сырые артефакты вместо выводов автора совпадают с "does not need to understand why the artifact was built as it was" (S6) и с независимым тест-дизайнером (S42).

**Риски.** Ранняя победа и поверхностность (S6, S24, S5). Без критериев верификатор штампует «ок» (S10). Снисходительность «из коробки» (S7).

**Минимальные изменения.**
1. В брифе явные критерии приёмки и требование «прогнать весь релевантный набор и сообщить **все** падения, с командой и выводом» (S6, S13).
2. Вердикт строится как таблица «требование → доказательство (команда, вывод или `file:line`)». Если доказательства нет, по умолчанию «не доказано».
3. В частях, где нужно суждение (дизайн, читаемость, полнота доков), откалибровать скептицизм парой примеров (S7). Помнить, что здесь действует self- и family-bias (E6).

### E5. Продолжение треда верификатора для проверки финального ответа — change

**За.** Дёшево. Верификатор уже держит доказательства, а свежему агенту пришлось бы собирать контекст заново ("can end up *slower*", S13). Хост штатно поддерживает возобновление (S12). Сверка ответа с доказательствами требует мало передачи контекста (S6).

**Против (косвенно; прямых исследований этой схемы нет).** (1) Якорение. Прежние собственные суждения в контексте якорят новые, и CoT это не снимает (S54). Похожий эффект описан при последовательном расследовании (S14). (2) Предпочтение собственного текста и смещение через «знакомость» (S46, S47). Черновик ответа во многом пересказывает отчёт самого верификатора, и знакомый текст он склонен принять. (3) Ранние допущения в длинном диалоге не пересматриваются (S55). (4) Слепота к пропускам — [суждение]. Верификатор проверил то, что сам решил проверить. Черновик, верный его отчёту, пройдёт, даже если пункт запроса не проверял никто. (5) Все вендоры ценят ревьюера без общего контекста (S19, S13, S8).

**Минимальные изменения.**
1. Для рутинных задач продолжение треда оставить, но с жёстким протоколом. Верификатор заново читает **дословный** запрос. Перечисляет каждый пункт запроса. Каждое утверждение черновика помечает одной из трёх меток: (а) подтверждено сырым артефактом, который он сам видел; (б) опирается только на его же прежний отчёт; (в) не подтверждено. Отдельно перечисляет пункты запроса, которым в черновике не соответствует ни одно утверждение.
2. Для ответственных и необратимых задач (тот же триггер, что для топ-модели) — свежая короткая проверка полноты. Она получает только запрос, черновик и указатели на артефакты. Это [суждение]: цена одного дополнительного контекста оправдана там, где ошибка дорога.

### E6 / E6a. Одно семейство и уровни моделей — keep с оговорками

**Одно семейство.** Как операционный дефолт разумно: не нужны чужие ключи и согласие пользователя. Но об этом надо **честно сказать**. Судьи предпочитают свой текст и своё семейство (S46, S47, S48, S45). Родство судьи и генератора, включая семейство, даёт плохо обнаружимое смещение (S50). Кросс-семейная верификация эффективнее внутрисемейной (S52). Ошибки моделей одного провайдера коррелируют сильнее (S53). При этом у сильных моделей ошибки коррелируют и между провайдерами (S53), так что смена семейства не панацея. Часть самопредпочтения у сильных моделей оправдана качеством (S49).

**Минимальные изменения.**
1. Вердикт верификатора опирается на исполненные проверки везде, где это возможно. Pass/fail теста от смещения судьи не зависит.
2. Если доступна другая модель, а вердикт ответственный и держится только на суждении, предложить пользователю кросс-семейное второе мнение. Источники: S52, S51. По умолчанию не включать.
3. В брифе критика и верификатора не указывать, чей текст они проверяют. Это частично снимает self-recognition (S46). Насколько помогает, неизвестно — [суждение].

**Уровни моделей.** «Сильная модель для критика и верификатора, топ — для необратимых решений» не противоречит данным, но прямо подтверждена слабо (S52, S37 — косвенно). Главное поддержанное правило в другом: сильнее всего должен быть тот, кто держит план и синтез (S2, S28). Координатор на модели хоста это выполняет. **Добавить:** исполнитель по умолчанию работает на модели хоста. Понижать его стоит только на механических задачах (S16, S17, S12, S13). Слабый основной агент с сильным советником в практике не взлетел (S19). Смешанные конфигурации ведут себя непоследовательно (S25).

### E7. Каталог около 18 ролей — keep ленивую загрузку, change порог входа

Ленивая загрузка поддержана (S15, S13, S11). Число ролей данными не обосновано. Сигнал «специализаций больше, чем окупается» есть (S6, S11). Нарушение ролевой спецификации — редкий отказ (S24), то есть роли сами по себе не главная проблема. Debate и судьи не всегда окупаются (S29), но спорящие гипотезы полезны в отладке (S14).

**Минимальное изменение.** Для каждой роли каталога указать триггер, примерную цену и на что опирается её польза. Роли с пересекающимися функциями слить: refuter, judge и critic; scout и explorer; foreman и координатор. Если роль не вызывалась по триггеру в реальных задачах, кандидат на удаление. Всё это — [суждение].

---

## 4. Что не удалось получить или проверить

- **Старая версия Claude Code best practices** (блог Anthropic, апрель 2025, с советами "explore, plan, code" и «когда пропускать план») теперь редиректит на текущую документацию. Web Archive из этой среды недоступен. Цитаты о планировании из старой версии не использованы.
- **LangGraph supervisor:** документация библиотеки напрямую не читалась. Данные о supervisor-архитектуре взяты из бенчмарка LangChain (S20).
- **Cognition 2026 (S19):** сторонние пересказы приводят цифры сравнения моделей, которых в самом посте я не нашёл. Они не проверены и не использованы.
- **Только абстракт:** S30–S39, S43–S55, S57. S29 — абстракт плюс целевое извлечение из полного HTML. **Только сниппеты поиска:** S15, S56, S58. Работы Porter/Siy/Votta об экспериментах с инспекциями, Bradley 2024, Atlassian RovoDev (arXiv 2601.01129), Olewicki et al. (2411.07091) и LPW/self-planning известны только по сниппетам поиска и в выводах не использованы как основание.
- **Прочитаны не до конца:** MAST HTML (первые около 100 тыс. из 162 тыс. символов), MetaGPT HTML (около 100 тыс. из 111 тыс.), документация субагентов Claude Code (около 100 тыс. из 115 тыс.).
- **Прямых исследований не найдено:** (а) «свежий ревьюер против продолженного треда» в агентной разработке; (б) «тот же агент проверяет дерево, затем сводку о нём»; (в) контролируемая абляция «критик плана до записи против отсутствия критика» на современных кодинг-агентах; (г) «верификатор сильнее исполнителя». Выводы в E3, E5 и E6a в этих частях — моё суждение.
- **Даты и площадки** части работ (Self-Refine, Reflexion, MetaGPT, ChatDev, Panickssery) указаны по памяти: на странице arXiv площадка не значится. В таблице это помечено.
- Множество версий S25 (v1–v3) даёт разные цифры (80.8% против 80.9%, разные формулировки порога). Использованы v3 и блог Google.
