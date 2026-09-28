# Command gate: the brief for the design round

2026-09-28. The owner's question after the arc incident ([21-arc-measure.md](../2026-09-27-approval-channel/21-arc-measure.md)):
compare two ways for a Codex agent to run what its sandbox refuses, and design the clean one. «Все-таки наша цель
чистое решение, а не костыль.»

## The owner's words that bind the design

- On approvals (2026-09-27): a request the agent's rights already cover never surfaces; a non-destructive request in
  the plan's direction the coordinator approves itself; a destructive or off-plan one goes to the owner while the
  turn waits; every approval that was needed is explained, with what avoids it next time. «Обычно апрувы для решения
  не нужны (с точки зрения пользователя).»
- On flags (repository CLAUDE.md): a flag, header field or option is born only with a sentence naming who sets it,
  why the default cannot decide and what breaks without it.
- On tools: «когда ты вызываешь, например, arc status, тебя вообще не должно волновать, какие оно под капотом
  спецэффекты вызывает. Не нужно думать о кеше и других по сути системных вспомогательных файлах и уж тем более их
  править. Нужно как с гитом или обычной cli командой, просто вызываешь и смотришь результат.» And: nothing
  arc-specific in the driver; arc exists only on this machine and is dead weight for everyone else.
- On this round: the goal is a clean solution; the widening by paths is judged a crutch; arc's damaged cache is to be
  left alone («По кешу ничего не стоит отдельно сейчас предпринимать»).

## What 0.21.0 is (level 1 unless marked)

- The driver, `plugins/entrust/plugin/skills/codex/scripts/driver.mjs`, runs `codex app-server` over JSON-RPC with
  `approvalPolicy: on-request`, `approvalsReviewer: user`, a Seatbelt sandbox at one of three levels (read: write only
  `$TMPDIR`; worktree; write), and `experimentalApi: true`.
- The launcher, `scripts/agent-run.mjs`: `--new` writes the prompt and makes the agent's mailbox
  `<DIR>/approvals/`; `--run` starts the driver under a detached keeper and returns either the nine status lines or a
  waiting result (the pending request, `REPORT=` last); `--pending` prints requests; `--decide ID --accept|--decline`
  publishes a decision file by link(2).
- The wrapper, `plugin/agents/codex-agent.md`: a Haiku subagent with the Bash tool only, that runs `--run`, hands its
  lines back with SubagentHandback and is continued by SendMessage with the same block. It exists because only a
  subagent appears on Claude Code's agent map, can be stopped from it and continued by a message; a Bash call has a
  ten-minute ceiling after which the harness moves it to the background.
- The coordinator decides a request under the orchestrate page's approval rule
  (`plugins/entrust/plugin/skills/orchestrate/SKILL.md`, the Approvals section).
- Three request kinds: an escape (a command approval without extra paths; `accept` re-runs the command with no
  Seatbelt at all, as the user: level 3, measured), a file change (the driver itself answers yes when every resolved
  path lies inside the agent's writable roots), and a widening (a permissions request, or a command approval carrying
  paths; `accept` adds exactly those paths for the turn and the command stays under Seatbelt).
- The widening exists only because the driver switches on two Codex features marked "under development",
  `request_permissions_tool` and `exec_permission_approvals`, where `codex features list` names both, and then sends
  the model this instruction, verbatim from the driver: "A tool failing with 'Operation not permitted' on its own
  state file is not an answer: you must make it succeed. When a tool you run fails because it cannot write its own
  state or cache files outside your writable roots, you MUST immediately issue a permissions request (…) asking for
  file_system write access to exactly the path in the error message, and after it is granted run the same command
  again inside the sandbox. Ask to run outside the sandbox only when no path would make the command succeed."
- An unanswered request expires as a decline after 30 minutes. The state directory, where the mailboxes live, is
  guarded: no writable root may be it, inside it or above it, and it may not lie under `$TMPDIR`.

## What happened (level 3)

- The 37 requests the driver declined on this machine before 0.21.0: 10 file changes into the agent's own
  `$TMPDIR` through Codex's edit tool, now answered by the driver; 13 `arc show`, `arc status`, `arc log` escapes, all
  command approvals; 14 others, escapes: `ps`, `kill`, `rm -rf` inside the agent's temp root, `codex sandbox`
  checks, `curl`, scripts. None needed a path widened for the agent's own work
  (`plugins/entrust/research/2026-09-27-approval-channel/00-escalations.md`).
- 2026-09-28: a Codex Luna read agent under 0.21.0 ran `arc status`; following the instruction above it asked for
  arc's cache files one request at a time; the coordinator accepted two; arc, half able to write its cache, took its
  own "server cache … will be re-created" path and deleted its index and lookup file. Ledger E77.
- The auto-mode classifier judged the coordinator's `--decide` calls, which carry a request id and never the command:
  it let today's two through, blocked one wrapper continuation as "Auto-Mode Bypass" in an earlier gate, and refused
  four runs that granted Codex write into arc's store.

## The two ways put to the owner

1. **The coordinator is the gate.** The escape already in 0.21.0. The widening layer goes: the two features, the
   instruction, the path handling, the page rule approving cache writes. Every command the sandbox refuses costs one
   round trip to the coordinator, who reads the command and decides under the page's rule.
2. **The same gate as Claude's.** Codex 0.155.1's protocol lets the client give the model a tool the client executes:
   `thread/start` takes `dynamicTools: DynamicToolSpec[]`, a function spec `{name, description, inputSchema,
   deferLoading}`, present only in the schema generated with `--experimental`; the server then sends `item/tool/call`
   `{threadId, turnId, callId, tool, namespace, arguments}`, which is in the stable schema. A "run as the user" tool
   executed through a Claude Code tool call would put the command itself in front of the owner's permission rules and
   the auto-mode classifier, as for any Claude agent. Unknown: who inside Claude Code executes it without a round trip
   to the coordinator; whether the model uses the tool instead of its own escape; how stable the experimental field is.

Generated schemas on this machine: `$TMPDIR/tmp.CaxPeUYNL9` (with `--experimental`) and `$TMPDIR/tmp.9adAXnaV8c`
(stable); codex-cli 0.155.1.
