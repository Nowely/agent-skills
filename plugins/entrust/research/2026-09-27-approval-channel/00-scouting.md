# Scouting: the coordinator's account before the design

Run `2026-09-27-approval-channel`, coordinator Fable 5.1, branch `entrust-approval-channel` in a worktree under `.claude/worktrees/`, cut at c828b7f. Evidence levels as the repository defines them: 1 the line resolves, 2 an independent reader would say the same, 3 made to happen.

## The question

The owner asked (2026-09-26, translated): what does a Codex agent's escalation for approval do now, and how should it change so that the orchestrator itself approves an agent's action when one is needed. They pointed at the session transcripts as a source.

## Current behaviour

- **Nobody approves.** The driver starts every thread with `approvalPolicy: "on-request"` and `approvalsReviewer: "user"` and asserts both (`plugin/skills/codex/scripts/driver.mjs:4035-4059`); `auto_review` is refused on purpose because it disarms the refusal policy silently (`:4030-4034`). Every inbound approval request is answered with a schema-correct refusal and recorded in `escalations` (`:2729-2757`); exit 6 when that rung wins the ladder (`:253-254`). Level 1.
- **The turn goes on after a refusal.** The agent works around it or reports it. Level 3: run `2026-09-26-layout-bd/A1` (Astra, judge) had one declined request and `turnStatus: completed`, and delivered its verdict; `naming-20260917/sol-n2` had one and returned a 5054-character answer. The 0.155.1 schema says the same of `decline`: "The agent will continue the turn", where `cancel` interrupts it. Level 2.
- **A request follows a failed sandboxed attempt.** Codex asks to rerun outside the sandbox a command that failed inside it. Level 2, from the command lists in the reports: A1 ran `curl --head` twice with exit 60 (certificate) and then requested the same command; `branch-audit/a2` ran `vcs status` twice with exit 1 and then requested it.
- **Scale.** Of 914 reports under the plugin's data directory, 27 carry exit 6, all of them agents with no write rights; they hold 37 declined requests, every one tabulated in [00-escalations.md](00-escalations.md): 13 `vcs` reads in the monorepo checkout (the VCS client fails under the sandbox), 10 file edits attempted by read agents, 3 deletions of the agent's own temp directories, 2 `curl` after certificate failures, 2 nested `codex sandbox` launches, 3 `ps`/`kill`, 4 other. Level 1. (First written as 1 and 5: the table's clipped detail hid the second nested launch, and Fable D1 caught it.)
- **What the coordinator is told.** The codex page: an approval request "is declined and recorded", "never translate a refusal into broader rights", each widening is settled with the user; the orchestrate page's result table: any other non-zero exit with an answer is a gate verdict, do not retry, read the answer. So the user hears about it afterwards, as on 2026-09-26: "он попросил доступ, запрос был отклонён". Level 1.

## History

A reviewer channel was designed on 2026-09-10 and killed the same day: the driver would write each approval request to a file, block, and let the coordinator approve within a ceiling declared in the agent header. [00-history.md](00-history.md) holds the two agent returns verbatim: Astra A4's refutation C1–C25 (the structural defects C13–C20 among them) and Astra A5's protocol probe, which left "what accept grants" and the persistence of policy amendments **not established**. The plugin's memory note of that day says: do not re-propose that design. This run does not; it designs against the list.

## What changed since 2026-09-10

- The launcher (`agent-run.mjs --new`) writes the agent's directory and prompt under the plugin's data directory unopposed: a subprocess handed the path as an argument writes it, while the coordinator's own Write, `mkdir` and redirects there are refused in a headless session (orchestrate page, measured 2026-09-08). C19's "no authorised caller submission path" therefore has a candidate answer.
- The coordinator already polls a marker file in the agent's directory (`until [ -s "<DIR>/exit" ]; do sleep 5; done`) as a background task and blocks on it. C13's "no wake-up path" has a candidate answer.
- The wrapper's one command is idempotent: at the tool's ten-minute ceiling it runs again and waits for the run it started. A decision that takes minutes does not break the wrapper.
- The network is on by default at both levels (0.13.0); the two `curl` requests above are certificate failures, not egress denials. Level 2.
- The agent's directory `<DIR>` is made at 0700 under the data directory, and the driver refuses everything inside the state directory as a writable root (`driver.mjs:2310`, `--help` line 31). A decision file there is out of any Codex sandbox's reach. Level 1 for the refusal, level 2 for the consequence.
- `RESUME:` continues a thread; the codex page and the driver's help say nothing about changing the rights level on resume.
- The 0.155.1 response schema offers, beside `accept`: `acceptForSession` (the session-scoped approval cache stops prompting for it), `acceptWithExecpolicyAmendment` (a rule so future matching commands run without prompting), `applyNetworkPolicyAmendment` (a persistent allow/deny for one host), `decline` and `cancel`. A file-change request carries `grantRoot`, marked unstable in its own description. Level 2, Opus P1's schema reading.

## Unknown before the design

1. What `accept` grants: the command re-run outside the sandbox with the driver's (the user's) rights, or inside it. Opus P1 is probing this live (`01-probe.md` when it lands).
2. Whether the server bounds its own wait for a decision, and what an error response or a closed stdin does to a pending request. Same probe.
3. Whether the session-scoped and rule-scoped grants above behave as described, and where a rule persists. Schema only so far.

## What the design must answer

The mechanism: where a request lands, who wakes the coordinator, how a decision travels back, the deadline and its default, what happens on the deadline, and what the wrapper and the status lines show. Each of C13–C20 by name, plus C18's concurrency (per-request identity, single consumption, stale rejection), C17's lock interplay, headless `-p` sessions, the wrapper's ten-minute rerun, `RESUME:`, the report (an approved request recorded with who decided, and how the exit ladder treats it), and the coordinator's decision rule for the orchestrate page: what it approves on its own under the plan, what it never approves, and when it asks the user. Then the suites that pin it and an implementation estimate. No implementation in this run.
