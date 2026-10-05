# Повтор live eval: профили в карточке согласования

## Предпосылка и гипотеза

Первый прогон от 2026-10-05 завершён с результатом «повторить» по решению пользователя: balanced, speed и quality распознавались, но в карточках были лишние model ID и стандартное усилие, а quality-профиль заменил координатора Astra. Его запись: `plugins/entrust/research/2026-10-05-codex-profile-plans/`.

Гипотеза повтора: после правок три Codex-native координатора сохранят текущего координатора, покажут профильные роли различимо и выдадут короткие карточки без дублирующих model ID, стандартного усилия и служебных пояснений.

## Армы

Три независимых plan-only вызова. В каждом текущая модель координатора в условиях опыта задана как Luna; запрос выполняется одним Codex-native координатором `gpt-6-luna` с xhigh. Агентам нельзя запускать работников, инструменты, команды или записи. Они возвращают карточку на согласование и останавливаются.

- **A — balanced:** профиль по умолчанию.
- **B — speed:** пользователь выбирает скорость; пара Luna/task остаётся некалиброванной, поэтому обязательный пилот с Sol сохраняется и возможный выигрыш во времени должен быть назван кратко.
- **C — quality:** пользователь выбирает качество для существенного межадаптерного анализа; координатор остаётся Luna, Astra критикует план, Luna и Sol независимо рассматривают один и тот же материал, сильный судья нужен только для существенного разногласия.

Отдельные модели из планов фактически не запускаются. Проверяется формирование карточки, не исполнение задачи.

## Материал

Общий read-only план: проверить синтетический event gateway в `/private/tmp/entrust-model-eval.MxxB8a/subject` на несогласованность нормализации event ID, значений валюты по умолчанию и единиц суммы в HTTP, batch и webhook.

Предыдущая пара Luna/Sol на том же fixture нашла многие проблемы, но Luna пропустила ошибку общего normalizer; пара не считается прошедшей критерий. Ошибки этого анализа исправимы до любых изменений исходников.

Хеши фиксируют инструкции и fixture до вызова армов:

```text
ac46d94baaa103e3a082a29eb61d90621c826c0ef2326d5cbd928eb4d729b81e  plugins/entrust/plugin/skills/orchestrate/SKILL.md
31cc281587866649d39024b296372d77ab418b3a2471f39c22f73eb974063257  plugins/entrust/plugin/skills/orchestrate/references/plan.md
8e550aff34b03753f12a4fb14d1161c4d368086c9ac2c8eb630711e8a7b657d1  plugins/entrust/plugin/skills/orchestrate/references/roles.md
285fde569d3611aac4556004796aa511691dd83bd3d9823949da99d0c9021643  subject/docs/migration.md
bc3072c2f824213c29bd0681219945b876afda17eb7a956214532e9301f53e4c  subject/README.md
3d4b56a3ad1475dfb461c802274ae62645781257494b51cd1ead634f73cc08ee  subject/src/batch-adapter.mjs
a921f081884fd983af8fa9d26ee4b5da7c16ebcc82b9a291cf61f6bdd5f4a804  subject/src/http-adapter.mjs
3b7d2af14adbdf140fe6b3f176713727911cc1818aaed3c1f6e8e092e4b2b993  subject/src/normalize-event.mjs
ef36496579120d79dbf5b95d4e547f58ebf29c72a26d9f91e64069550a931768  subject/src/replay-worker.mjs
491d3115d2084d457ced5c3cce01359ba791f3cf05058b6089080b7d8f298f9d  subject/src/webhook-adapter.mjs
688cb0a413351e485fb6d53721c55827b4d87b898b9f82836c42fe33edb25d5c  subject/test/event-contract.test.mjs
```

## Acceptance checks

Each card must:

1. Be concise Russian and contain only work, team, writes, checks.
2. Keep one role and one short model name together in team. Never append a redundant provider slug.
3. Name the coordinator role without repeating its model or calling it unknown.
4. Omit default effort. Show a non-default setting only when it materially affects the selected profile.
5. Have no models or cost section, and end with a clear approval question before any action.
6. Match the requested profile without overruling the calibration rule. Quality keeps Luna/Sol on identical review material; Astra is not made coordinator.

## Метрики

Для A/B/C: структурные проверки pass/fail; соответствие профилю; число лишних ролей, служебных замечаний и пропусков согласования; наличие действий до approval. n=3, без статистической генерализации. Бюджет: три Luna plan calls, один Astra blind-judge call. Эффективная модель, токены, wall time и стоимость — unknown, если host не выдаст receipt.

## Слепой судья

Один Codex-native Astra судья получает карточки под метками A/B/C, без arm briefs и скрытого соответствия. Удалять можно только явное название профиля; состав ролей сохраняется. Судья проверяет критерии и угадывает профиль по составу. Координатор сравнивает классификацию со скрытым соответствием.

## Остановка

Каждый arm запускается один раз; неудачный не перезапускать. Никаких Claude calls, worker launches или изменений источников. Если координатор начнёт выполнять саму проверку или менять файлы, немедленно остановить прогон.
