# The owner's round: the principle that replaces v3's rule

2026-09-27, after the answer in [05-answer.md](05-answer.md). The owner's words, then what the coordinator found when it checked them against the reports, then what v4 must do. Evidence levels as the repository defines them.

## What the owner said

On the classification 8 approve / 19 decline / 9 read-whole-first / 1 ask: «Почему столько отказов. Будто бы если это недеструктивное действие и следует намеченной цели, то выполнить можно.»

On "coordinator-declined still exit 6": keep 6, «но хочется, чтобы таких ситуаций не было в идеале. То есть эскалировать до меня либо сам решал, если это в его возможностях и что-то типа от внуков» (the coordinator decides when it can, escalates to the owner otherwise, and nested agents get the same).

On file-change requests never offered: «Я думаю, ты имеешь в виду, что условный внук захочет изменить файл и что-то запретило ему. В таком случае координатор решает было ли это обосновано или нет и пытается ему разрешить, либо понимает, что что-то не так и предпринимает шаги. Просто отказ может привести к тому, что цель будет не выполнена либо ненадлежащим образом. Обычно апрувы для решения не нужны (с точки зрения пользователя). В крайнем случае хочется эскалировать почему нужны апрувы и как избежать их в будущем.»

On the deadline: «Что за дедлайн? Почему он вообще существует?»

On the VCS client: «Хотелось бы чтобы кодекс тоже могли пользоваться VCS-клиентом при возможности.»

On the second Astra round: not on the table now. On committing the run: the baseline, not a question; work in the worktree is committed there.

## What the reports say about the ten declined file changes

All ten were writes into the agent's own `$TMPDIR`, which the read sandbox allows; Codex's edit tool raised the request, the driver declined, and the agent wrote the same file through the shell. Level 3 that it happened, from the reports under the plugin's data directory:

- `2026-09-22-terse-process/V1` (verifier of a terse round): `fileChangesFailed` lists `/private/var/folders/…/T/terse/runs/20260922-233021-terse-readme/reviews/02-verifier-sol.md`, kind `add`, status `declined`, twice; `filesTouched` lists the same path and a `write-test.tmp` beside it, written through the shell.
- `practices-2026-09-17/s2-sol-2` (survey agent): `S2_comparative_effects_and_evaluator_validity.md` and `_patch_probe.md` under `$TMPDIR/s2-survey/`, both `declined`.
- `2026-09-26-writing-replication/A2d`: `$TMPDIR/a2d-episodes.json` declined; its answer says: «tools.apply_patch для временного JSON: вызов начался, статус выхода неизвестен, точная диагностика: "patch rejected by user". Запись через cat в $TMPDIR выполнена.»

Hypothesis (level 2, Opus P1 is measuring it as Q5): the edit tool asks for approval for any path outside the thread's cwd, whatever the sandbox allows, so a read agent writing its own temp files through that tool always asks.

The thirteen `vcs` requests are the sandbox, not rights: the VCS client exits 1 inside it (two attempts before each request in `branch-audit/a2`). Opus P1 is measuring what the VCS client needs (Q6) so that a Codex agent can use the VCS client when the plan allows.

## The principle for v4

1. A request the agent's rights already cover is answered yes by the driver and never shown to anyone: a file change whose every path lies inside the agent's writable roots ($TMPDIR at every level, cwd and each `WRITABLE:` root at write level, the worktree). The effect equals the shell write the sandbox would have allowed, so nothing is widened.
2. A non-destructive request in the plan's direction is approved by the coordinator. Approving runs the command unsandboxed as the user, which is what every Claude subagent's Bash already does in the same session; the line for Codex is not stricter than for Claude (parity, the plugin's fitness test).
3. A destructive or irreversible request, or one outside the plan, goes to the owner while the turn waits; a headless run declines it and names it.
4. Nested agents (Codex's own subagent threads) get the same treatment as the root thread.
5. No deadline: the request waits until answered or the agent is stopped; the idle guard stays paused meanwhile (v3). An abandoned run ends with its session (the wrapper's exit reaches the driver as `SIGTERM`, ISSUES E45, level 3 for that path).
6. Every approval that was needed is explained: the report carries a cause class per request (rights already covered it; the sandbox blocks a tool such as the VCS client or the certificate store; Codex's own policy asked, as for `rm -rf`; outside the rights), and the run's synthesis says why the agent needed approvals and what right or setting would avoid them next time.
7. `vcs` for Codex agents: from P1's measurement, the right or preset a plan grants so that the VCS client works inside the sandbox, at read level too if a narrow extra root is what it takes.

Of C1's findings, v3's answers to F1, F2, F6–F13 stand; F3 (config-driven execution under `git`) and F4 (a script replaced between reading and running) are hazards the owner accepts on the parity ground, and the rule names them as such instead of refusing the class; F5 (a clipped command) stays: nothing is approved unread.
