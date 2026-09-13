# ISSUES.md — разметка V2, 2026-09-12

Исходник: `/Users/ruliny/Git/agent-skills/ISSUES.md`. Исходные фрагменты ниже сохранены дословно. Редакторская команда дана ровно одна на C1..C9; предлагаемый английский текст можно переносить в ledger. Пути внутри фрагментов относительны к `plugins/codex-delegate/`, если явно не указано иное.

Проверенное дерево плагина совпадает с тегом codex-delegate@0.14.0: `09d5301f288f7752817c6e80148ef4102aeb12de`. Исходный ISSUES.md не изменён.

## C1 — REWRITE

ISSUES.md:17-19: заменить адреса 55 → 80, 70 → 114-116; убрать «README… no longer symlinks cleanup»: README.md:89 содержит ссылку. Плагинная установка не проверяет загрузку отдельной ссылки. Уровень 2.

Исходный текст:

> ### C1. `/cleanup` cannot run from a clone-and-symlink install
>
> `skills/cleanup/SKILL.md:29` and `:59` run `${CLAUDE_PLUGIN_ROOT}/skills/seat/scripts/cleanup.mjs`. That
> placeholder is substituted for installed plugins only; a skill symlinked into `~/.claude/skills` gets
> nothing, and the command resolves to `/skills/seat/scripts/cleanup.mjs`. The seat skill's own recipe uses
> `${CLAUDE_SKILL_DIR}` (`skills/seat/SKILL.md:55`) and is unaffected; `skills/seat/SKILL.md:70` already
> records that the clone route substitutes nothing for the sibling placeholder. Level 2, 2026-09-12. The
> README's clone route no longer symlinks `cleanup` from round 06 of the rewrite on.

Текст замены:

### C1. The clone-and-symlink cleanup recipe depends on a plugin-only root

`skills/cleanup/SKILL.md:29` and `:59` invoke
`${CLAUDE_PLUGIN_ROOT}/skills/seat/scripts/cleanup.mjs`. When the cleanup skill is loaded outside a plugin
and that variable is unset, the shell resolves this to `/skills/seat/scripts/cleanup.mjs`, rather than to
the checkout. The seat recipe uses `${CLAUDE_SKILL_DIR}` (`skills/seat/SKILL.md:80`). The clone route's
empty forwarded data placeholder is documented at `skills/seat/SKILL.md:114-116`; it is a different
placeholder, not a live test of cleanup loading. The shipped README DOES link cleanup (`README.md:89`),
so the unsupported command is part of the advertised clone route. This problem remains after correcting
that route's separate wrong `cd` command (N2). Level 2, verified by source reading on 2026-09-12; a fresh
native Claude Code invocation of the symlinked cleanup skill has not been reproduced by V2.

## C2 — REWRITE

ISSUES.md:27: неверно «every run»; новые адреса seat/SKILL.md:99-103 и orchestrate/SKILL.md:28,103. В ISSUES.md:30-31 слово «Lists» не обещает полноты само по себе; основание — README.md:109 и неотражённая передача ответственности за standalone reports. Answers имеют lazy pruning. Уровень 3 относится к измеренному отсутствию строк.

Исходный текст:

> ### C2. `cleanup.mjs` never lists `<state>/reports/` or `<state>/answers/`, and nothing prunes reports
>
> `skills/seat/scripts/cleanup.mjs:846-847` builds its rows from orchestrate runs, seat scratch, evals, test
> sessions, worktrees, locks, the home and data directories — never from `answers/` or `reports/`. Measured
> 2026-09-12 with a seeded answer and a seeded report: `--list --json` returned `rows: []` and "Nothing this
> cleanup covers is on this machine" while both files remained. `:256` names `answers` only as a guard.
> `skills/seat/SKILL.md:62-64` tells every run to write its report under `<state>/reports/<run>/`, and
> `skills/seat/references/environment-and-internals.md:132-135` says nothing prunes what `--report-file`
> makes. Measured 2026-09-12: `cleanup.mjs --list` printed six rows and no row for `reports/`, one minute
> after a report had been written there. Level 3. The cleanup skill's frontmatter, "Lists files left by
> codex-delegate", is therefore overstated.

Текст замены:

### C2. Cleanup omits standalone reports and does not surface their retention responsibility

`skills/seat/scripts/cleanup.mjs:846-847` creates no inventory rows for `<state>/reports/` or
`<state>/answers/`. Its `notCovered` inventory (`:874-887`) only searches the temporary directory, so it
also does not direct a caller to these state files. The standalone recipe sends reports to
`<state>/reports/<run>/report.json` (`skills/seat/SKILL.md:99-103`); orchestrate is an explicit exception,
using `<state>/orchestrate/<project-slug>/<run>/<seat>/report.json`
(`skills/orchestrate/SKILL.md:28,103`), inside the run directories cleanup does list.
`skills/seat/references/environment-and-internals.md:132-135` assigns report retention to the caller;
the driver does not prune those standalone reports. Answers have a separate lazy pruner
(`skills/seat/scripts/driver.mjs:2984-2991,3008-3021`) and are not an unbounded-retention claim.
`README.md:109` says cleanup lists what is in the state directory, while `README.md:29-33` defines a
narrower inventory. Measured by V2 on 2026-09-12: with only a seeded standalone report and answer,
`--list --json` returned `rows: []`, both files survived, and `notCovered.count` was 0. Level 3 for that
omission; the issue is the incomplete inventory/retention handoff, not a demand to delete every artifact.

## C3 — STRIKE

ISSUES.md:35-38: «only $TMPDIR» остаётся верным для окружения дочернего процесса. Подстановка уже описана в README.md:49-52 обоих релизов и driver.mjs:321-325; короткая помощь :299-301 отсылает к --help-all. Это недостаточная причина для самостоятельного дефекта. Ничем не заменять; поведение общего TMPDIR рассмотрено отдельно как R2.

Исходный текст:

> ### C3. The read level's writable root is described as `$TMPDIR` where the driver may substitute its own
>
> `skills/seat/SKILL.md:61` and `:96` say a read seat writes only `$TMPDIR`. When the caller exports no
> `TMPDIR`, `driver.mjs:2113-2114` sets one to `<state>/tmp/<runId>` (`:1139-1146`), and that is the root the
> sandbox is asserted against. The driver's own `--help` (`:322-325`) says so; the skill text does not.
> Level 2, found by two independent critics on 2026-09-12.

В предлагаемом ledger запись отсутствует.

## C4 — KEEP

Адрес why-not-the-plugin.md:69 действителен; «approval / sandbox: no» смешивает две оси. Локальный codex-cli 0.153.4 действительно показывает --sandbox (codex-exec-help.txt:53-59). Сохраняю консервативный уровень 2, без заявления о повторном измерении managed clamp.

Исходный текст:

> ### C4. The comparison table conflates approval policy and sandbox for `codex exec`
>
> `skills/seat/references/why-not-the-plugin.md:69` gives `codex exec` "per-call approval / sandbox: no —
> forces `never`". `codex exec --help` (0.153.4) offers `-s, --sandbox <read-only|workspace-write|…>` per
> call; what it lacks is a per-call approval policy that survives the managed clamp. The sentence at `:74`,
> "the only surface with both per-call rights and a machine-checkable execution signal", stands if "rights"
> means both together; the row should say which. Level 2.

## C5 — REWRITE

ISSUES.md:52: «every report records as true» опровергнуто живым read handshake (grant.json:50-57). ISSUES.md:55-56: цитата принадлежит research/2026-09-11-markup-round-0/06-preexisting.md:8, а не shipped README. Использовать действительное README.md:204-205. Сузить контрпример до дополнительного /tmp и назвать уровень 3 синтетическим; false у excludeTmpdirEnvVar сам по себе не ошибка.

Исходный текст:

> ### C5. The read-level sandbox assertion ignores `excludeSlashTmp` and `excludeTmpdirEnvVar`
>
> `assertReadSandbox` (`skills/seat/scripts/driver.mjs:1991-2017`) checks the sandbox type, egress, the
> workspace root and the writable roots, and never reads `excludeSlashTmp` or `excludeTmpdirEnvVar`, fields the pinned schema
> carries (`schema-0.153.4/v2/ThreadStartResponse.json:1086`) and every report records as `true`. A server
> that reported `false` — `/tmp` writable beside `$TMPDIR` — would pass the assertion. `grep -n
> excludeSlashTmp driver.mjs` returns nothing. Level 2; a synthetic response through the unchanged function
> was accepted either way (Astra, 2026-09-12). The README's "the run stops if the server grants anything
> else" is stronger than the check.

Текст замены:

### C5. The read-sandbox assertion accepts an additional implicit /tmp grant

`assertReadSandbox` (`skills/seat/scripts/driver.mjs:1991-2018`) verifies profile, type, egress, workspace
and explicit writable roots, but does not inspect the implicit `/tmp` grant described by
`excludeSlashTmp` (`schema-0.153.4/v2/ThreadStartResponse.json:1086-1092`). With `$TMPDIR` outside `/tmp`,
a response whose declared writable roots contain only `$TMPDIR` still passes when `excludeSlashTmp`
is false. That contradicts the shipped assurance that a sandbox mismatch refuses the run
(`README.md:204-205`) and the assertion's own stated boundary (`driver.mjs:1934-1938`).
V2 ran the unchanged assertion body on 2026-09-12: all four boolean combinations of `excludeSlashTmp`
and `excludeTmpdirEnvVar` were accepted; a control with the wrong explicit roots was rejected.
Level 3 for the synthetic acceptance, not for a live sandbox escape. A separate live 0.153.4 handshake
returned a correct read grant with `excludeSlashTmp: true` AND `excludeTmpdirEnvVar: false`; the latter
flag alone is not an additional grant when the same `$TMPDIR` is already allowed. Do not repair this
by blindly requiring both fields to be true. The supposed README quotation about “the run stops if the
server grants anything else” belonged to an unshipped research draft and is not evidence about shipped text.

## C6 — KEEP

Адрес cleanup.mjs:227-230 действителен; собственная проба c6-unset-tmpdir.json даёт exit 2 с точной диагностикой. Driver.mjs:2113-2114 допускает такую среду. Уровень 3.

Исходный текст:

> ### C6. `cleanup.mjs` refuses to run when `TMPDIR` is unset, which the driver itself tolerates
>
> `skills/seat/scripts/cleanup.mjs:227-230` dies with "TMPDIR is not set to an absolute path … Nothing was
> deleted", while the driver substitutes `<state>/tmp/<runId>` in that case (`driver.mjs:2113-2114`). A
> setup the seat supports cannot be cleaned up. Measured 2026-09-12 with `env -u TMPDIR`: exit 2. Level 3.

## C7 — REWRITE

ISSUES.md:68-70: разделить наблюдение login status и условный риск чужой квоты. Адреса: driver.mjs:1056-1058,1218-1228,2138,3692-3695; README.md:41-42. Два авторизованных аккаунта и списание квоты не измерены. Уровень 2 для дефекта выбора учётных данных.

Исходный текст:

> ### C7. The isolated home links `auth.json` from the passwd home, not from `CODEX_HOME`
>
> `isolatedHome()` (`skills/seat/scripts/driver.mjs:1218-1228`) links `auth.json` and `sessions` from
> `passwdHome()/.codex`, while the configuration probe inherits the caller's `CODEX_HOME`
> (`:1055-1058`) and `codex login status` reads `CODEX_HOME`. A user with a custom `CODEX_HOME` can pass
> the README's sign-in check under one account and have the driver spend another's quota. Level 2; not
> observed on a machine with a custom `CODEX_HOME`.

Текст замены:

### C7. The sign-in check and isolated driver can select different credential homes

The README asks users to check `codex login status`, then says credentials are linked from the real
`~/.codex` (`README.md:41-42`). `isolatedHome()` uses the passwd home for both `auth.json` and `sessions`
(`skills/seat/scripts/driver.mjs:1218-1228`), whereas the configuration probe inherits the caller's
`CODEX_HOME` (`:1056-1058`); the actual run receives the isolated home (`:2138,3692-3695`).
A caller whose custom `CODEX_HOME/auth.json` selects a different account is therefore not assured that
the driver uses the account checked by the prerequisite command. V2 observed `codex login status`
reporting “Logged in using ChatGPT” in the default environment and “Not logged in” with an empty custom
home on 2026-09-12. Level 2 for the account-selection defect; spending another account's quota was not
observed, and the live check was not a two-authenticated-account test.

## C8 — REWRITE

ISSUES.md:74: адрес 156 → seat/SKILL.md:200-204. ISSUES.md:75-78 уже ограничивает ситуацию child; SA не опроверг этот случай. Уточнить точное условие driver.mjs:1924-1931: удаление требует !child, успешного чистого status и успешного remove; иначе сохранение. Нужна инспекция/удаление дерева, но чистому дереву не обязательно есть что harvest. Уровень 3.

Исходный текст:

> ### C8. A pre-turn refusal's report never carries `worktreePreserved`, though the skill says to read it there
>
> `skills/seat/SKILL.md:156` tells the coordinator that a preserved tree is reported as `worktreePreserved`.
> The report a run publishes when it ends before a turn — killed or cut while the app-server process
> exists — is built at `skills/seat/scripts/driver.mjs:972-973` from `ok, exitCode, threadId,
> turnStatus, answer, error, reportPath` only, while `worktreeLastResort()` (`:1919-1932`) preserves
> the tree and announces it on stderr alone. A caller that reads only the report file learns nothing
> about a tree it must harvest. Measured 2026-09-12 with SIGTERM at 16 s and with `--timeout 14`: "worktree
> PRESERVED at … (run ended before disposition)" on stderr, no such field in the report. Level 3.

Текст замены:

### C8. A pre-thread cut can preserve a worktree without naming it in the report

`skills/seat/SKILL.md:200-204` sends the caller to `worktreePreserved` and `worktreePath`. A pre-turn
report only contains `ok, exitCode, threadId, turnStatus, answer, error, reportPath`
(`skills/seat/scripts/driver.mjs:970-973`). In the exit helper (`:1919-1932`), a worktree is removed only
if no child object was created, git status succeeds and is clean, and git worktree remove succeeds.
Otherwise it is preserved and announced on stderr. The test is the presence of the child object,
not whether its process is still alive; shutdown does not reset it (`:3692,3950-3955`).
V2 reproduced both branches with the released driver in a disposable repository on 2026-09-12: an
invalid extra root before child creation exited 2 and removed the clean tree and ledger; a stalled
app-server stub cut with `--timeout 2` exited 3, preserved the clean tree and ledger, and emitted
“worktree PRESERVED … (run ended before disposition)” only on stderr. Its report still had the seven
pre-turn fields. A report-only caller cannot discover the preserved path and inspect or remove it.
Level 3; the stub exercised startup/teardown, not a paid model turn.

## C9 — REWRITE

ISSUES.md:82-89: заменить формулировку противоречия на смешение файла отчёта и stdout. Вариант ремонта «flag parser only» неверен: --bogus также создаёт файл. Адреса driver.mjs:525-541,925-944,970-973,2036-2054 и seat/SKILL.md:208-211. Уровень 3.

Исходный текст:

> ### C9. `--help` says an argument error "prints none" while a no-state-directory refusal writes a report
>
> `driver.mjs --help` (source `skills/seat/scripts/driver.mjs:539`): "So 2 means either, and the report
> tells them apart: an argument error prints none." Measured twice on 2026-09-12: with no state directory
> and a fresh `--report-file`, the driver exits 2 and writes `{"ok":false,"exitCode":2,"turnStatus":null,
> "error":"no state directory: …"}` (`preTurnReport`, `:970-973`). The two pages a reader is told to trust
> disagree; either the help sentence is wrong or "argument error" needs to say it means the flag parser
> only. Level 3.

Текст замены:

### C9. Help conflates stdout delivery with the pre-turn report file

The exit-code help says “an argument error prints none” and also “like a 2 it then prints no report”
(`skills/seat/scripts/driver.mjs:525-541`). Both are defensible statements about stdout, but the skill
calls `<REPORT>` the report and says it is the same JSON as stdout (`skills/seat/SKILL.md:208-211`).
V2 measured both a missing-state refusal and a plain `--bogus` flag on 2026-09-12: each exited 2 with
empty stdout and a populated fresh `--report-file`, containing `turnStatus: null` and the refusal.
The file is opened before argument parsing (`driver.mjs:2036-2054`) and `preTurnReport` deliberately
publishes refusals there (`:970-973`). Thus narrowing “argument error” to the flag parser does not repair
the wording. Document the two delivery surfaces and their pre-turn exception; report-path validation
itself can fail before a report destination exists (`:925-944`). Level 3. This is separate from R5's
already-corrected claim that exit 2 always means no turn ran.

## Добавить после проверки

### R1. A write seat's declared directory does not bound its temporary-directory writes

The rights row promises “write under the live directory” and calls choosing that directory the blast
radius (`skills/seat/SKILL.md:142`; also `README.md:175`). The write setup only sets network access and
explicit extra roots (`skills/seat/scripts/driver.mjs:2171-2174`); it leaves the temporary-directory
exclusions at their false defaults (`schema-0.153.4/v2/ConfigReadResponse.json:990-996`). The assertion
checks explicit roots and workspace, not these implicit grants (`driver.mjs:1977-1988`). V2's live
0.153.4 `thread/start` probe with those write settings on 2026-09-12 returned `writableRoots: []`,
`excludeSlashTmp: false` and `excludeTmpdirEnvVar: false`: the write grant includes `/tmp` and `$TMPDIR`
beyond the named directory. Level 3 for the returned grant; V2 did not run a write outside the named
directory. The earlier audit reports that write at 0.13.0; these setup/assertion mechanisms are unchanged
at 0.14.0. The official-plugin comparison (`skills/seat/references/why-not-the-plugin.md:46-48`)
is background about another plugin, not the evidence establishing this driver's grant.

### R4. The result instructions do not explain declined approvals or their diagnostic limits

`skills/seat/SKILL.md:140` says a write outside the read grant asks approval and the run exits 6.
A refused sandbox operation need not generate an approval request: the driver records `escalations`
only on an inbound approval method (`skills/seat/scripts/driver.mjs:2545-2556`), and the exit-6 rung is
below timeout and other higher-priority outcomes (`:232-248`). Each entry's `detail` is at most 200
characters and can be empty (`:2554`). The published field (`:3436`) is named in none of the README,
three skill pages, six seat references, two help outputs or wrapper instructions (V2 searched all 13
surfaces on 2026-09-12). The timeout hint (`:3473-3479`) does not tell the reader to inspect it.
The release corrected the exit-6 explanation (`:247`) and added a guarded completed-answer notice
(`:2355-2361`), but the old insufficient-sandbox diagnosis remains in comments (`:20-22,2431`).
Document the field, its truncation/absence limits and the distinction between a denied command and a
declined request, including on a cut run. Do not infer that widening rights is the remedy or that work
was lost. Level 2; a V2 synthetic ladder probe also confirmed timeout plus an escalation selects exit 3,
but a live timeout following an approval request was not reproduced.

### N2. The clone recipe changes into the old repository directory

`README.md:84-91` clones `Nowely/agent-skills.git` and then runs `cd codex-delegate`. A fresh clone is
named `agent-skills`; this plugin is under `plugins/codex-delegate`
(repository `.claude-plugin/marketplace.json:16`). The directory change therefore fails on a fresh
installation, and continuing the subsequent `$PWD`-based symlink commands points them at the wrong
directory. Use `cd agent-skills/plugins/codex-delegate`. The old tag cloned `Nowely/codex-delegate.git`
(`codex-delegate@0.13.0:plugins/codex-delegate/README.md:84-85`); 0.14.0 changed the clone URL without
changing the following cd. Level 2, verified from both tags and the current tree on 2026-09-12; V2 did
not clone over the network. This is independent of the cleanup placeholder problem C1.

### N5. The wrapper treats an existing report as this invocation's result

The wrapper's fixed loop tests report existence before checking driver liveness, then reads that file's
exit code and answer (`skills/seat/SKILL.md:84,92-95`). If a retry accidentally reuses a previous report
path, the driver refuses it before assigning `reportFilePath` (`skills/seat/scripts/driver.mjs:940-944`)
and before printing its pid (`:3749-3755`). V2 ran those exact wrapper shell commands against a seeded
previous report on 2026-09-12: the new driver exited 2 without writing a report; the loop printed
`WAIT_DONE=report`, and the read command printed `EXIT=0` and `FIRST=PREVIOUS RUN ANSWER`.
Level 3 for the deterministic command protocol. This violates the recipe's fresh-path precondition
(`skills/seat/SKILL.md:101,214-216`), so it is a recovery robustness defect, not every correct continuation's outcome.
The coordinator CAN inspect stderr (`:208-211`); the fixed wrapper does not perform or relay that check.
Correlate the result to the current invocation before presenting its predecessor's evidence.

### N6. The wrapper cannot finish when startup fails before both report and pid

Report-path validation precedes pid publication (`skills/seat/scripts/driver.mjs:925-944,2036-2042,
3749-3755`). On a validation refusal there may be neither a report nor a pid line. The wrapper's loop
only exits when a report appears or a non-empty pid disappears (`skills/seat/SKILL.md:84`), and
`:86-88` mandates repeating the wait after each tool timeout without ending the turn.
V2 reproduced this with a fresh report path under a mode-0500 parent on 2026-09-12: the driver exited 2
with EACCES and no pid or report, while the unmodified wait command produced no WAIT_DONE line through
six seconds and was stopped by the probe watchdog. Under those fixed inputs the loop has no terminal
branch; no infinite wall-clock run is claimed. Level 3 for the shell protocol, not a live Haiku/UI test.
Give startup failure a terminal signal independent of report creation and the driver's stderr pid.

## Не переносить в отдельные записи

R2: общий унаследованный TMPDIR подтверждён (driver.mjs:2113-2114), но сам по себе соответствует явно сохраняемому пользовательскому выбору (README.md:49-52); оговорка о совместном использовании есть в seat/SKILL.md:155-157. Вред или обещание межагентной изоляции этим не установлены. Нужна воспроизводимая порча входов/результатов при штатном запуске.

R3: WRITABLE действительно повторяем и превращается в --writable (driver.mjs:614,642; seat/SKILL.md:172). Это не доказательство несанкционированного расширения. Нет показанного источника недоверенного значения, переходящего в header вопреки одобренным правам; прежняя проба P3 пишет в /tmp/probe-injected (/tmp/cdrefl/verdict/dossier.md:320-329), уже открытый R1. Нужны реальный путь внедрения и контрольная цель вне всех заранее разрешённых корней.

R5: исправлен и отмечен в CHANGELOG.md:77-81; прежнее seat/SKILL.md:147-148 в теге 0.13.0 («always… before the turn») заменено нынешним :219-222 («two shapes»). C9 — иной дефект описания каналов доставки, а не остаток этого утверждения.

R6: исторический случай упаковки шести запусков в одну задачу не является новой записью о текущем коде. Seat/SKILL.md:52-68 задаёт один Agent на seat, CHANGELOG.md:10-30 описывает изменение и его измерения. Слово W2 «wholly fixed» слишком сильно: новый механизм не доказывает, что координаторы всегда соблюдают рецепт.

R7: историческое нарушение пересказа не доказывает текущий дефект плагина. Seat/SKILL.md:22-23,245-247,257-263 различает машинный возврат и сообщение человеку; CHANGELOG.md:41-47 фиксирует изменения именования. Улучшение поведения координатора на 0.14.0 неизвестно; передача полей/путей по просьбе пользователя сама по себе не дефект.

N1: Sonnet в parity.md:17 против haiku в agents/codex-seat.md:4 — настоящая устаревшая подпись, но мелкая сопутствующая правка wrapper, без отдельного issue. N3: исторический комментарий evals/orchestrate-live.test.mjs:19-31 устарел, но действующая фильтрация :819-823 знает codex-seat; поломка тестов этим не доказана. N4: seat/SKILL.md:70 ошибочно считает четыре заполнителя; :78-95 содержит три разных <…> плюс две подстановки среды — опечатка, не отдельный issue.

N7: наличие пяти машинных строк в seat/SKILL.md:94-95 действительно; то, что они автоматически подменяют пользовательский пересказ, не проверено. Инструкция :104-105 и :245-247 адресует возврат координатору. Нельзя объявлять само наличие технического вывода дефектом UX. Нужен захват реальной карточки/уведомления и воспроизводимый путь к ошибочному пользовательскому выводу.

Две ошибочные атрибуции research-текста стоят ledger готовности к публикации, но не уничтожают независимо подтверждённые C1 и C5. Это исправление происхождения доказательств в ledger, а не отдельный дефект установленного плагина.
