# Writer 02 — round 02 of arm B's rewrite, 2026-09-24

**Round:** `02-repairs.md`, SHA-256 `20b8ea66842cac9a9031c1a57c8818d61e0fcf7d7052475070c636aae82bae3b`, produced by
`round.mjs 01-candidate.md 02-repairs.md edits/02.json --ledger ledger.json` on the first run, with no refusal
(`probe-02/round.log`). Skeleton `skeleton.md` re-hashed: `c7c9a4f7…a46`, as `rounds.md` line 1 records.
`edits/02.json` `1afd842a…af13` (the version the verifier sent back is kept as `edits/02.sent-back.json`, `14ed550b…9d9f`); `ledger.json` `1870d7df…72b1` (the state before this round, `ledger.02.json`, is `[]`);
`diff-02.patch` `36206d63…9629`. `answers-07.md` was present when the round started.

## What the round changes: 6 edits, 10 claims, 4 retires, 0 drops, 0 qualifications

| Edit | Line in 01 | Claims (level) | Retires |
|---|---|---|---|
| (a) the `.maestro/` bullet: "`@maestro` commands write to its decision log and command log (`audit.jsonl`)" | X:57 | the extension writes `.maestro/` logs from `@maestro` commands (L3) | "each `@maestro` run adds a line" |
| (a) the command-log sentence: "Only the extension writes the command log (`audit.jsonl`): its lines come from commands run through `@maestro` in VS Code's chat, each with the command's duration, ~tokens and ~cost." | X:133 | only the extension writes the command log (L3); its lines come from `@maestro` commands (L3); each line holds duration, ~tokens, ~cost (L3) | "and the extension adds a line to the command log" |
| (b) "Costs and token counts are estimates (~): costs are useful for trends, not for invoicing; token counts are for the context budget, not for billing." — `answers-07.md`, word for word | X:135 | estimates (L2); trends, not invoicing (L2); context budget, not billing (L2) | "±20" |
| (c) First run, step 1: "asks your coding agent to interview you about the project and save the answers as `.maestro.md` in its root" | X:93 | /teach-maestro hands the coding agent the interview-and-save instruction on every route (L3) | "saves the answers as `.maestro.md`" |
| (d) "every command except `/teach-maestro` loads the core skill first" — `agent-workflow` named only in the opening | X:33 | 23 of 24 commands invoke the core skill first (L2) | — |
| (d) "a small program your MCP client — your coding agent, or an app such as Claude Desktop — starts on your machine" — "that" and "itself" cut | X:17 | the MCP server is a program the client starts locally (L2) | — |

Drops: none. The ledger was empty before the round, so no entry could be dropped. No edit adds a qualifying form:
`round.mjs` counted none, and rule 11 prints `0`.

## The evidence behind (a) and (c): the snapshot's code, run

`probe-02/participant-probe.mjs` copies the snapshot's `maestro-extension/src`, its bundler, `packages/core/src` and
`source/skills` into a fresh temp directory and runs the extension's own bundler there. It then loads `participant.ts`
unmodified, under `node --experimental-transform-types`, with a mock `vscode` module (`probe-02/vscode-mock.mjs`) and a
mock model, and drives the registered handler down 13 paths. The log is `probe-02/participant-probe.log`.

- Lines in both logs: a completed wave (S1), a failed one (S2), one that throws "cancelled" (S5), and single-shot
  runs that complete, fail, or are cancelled mid-stream (S6–S8; S8 is logged as `completed`).
- No lines: a wave cancelled through its token before phase 1 or mid-stream (S3, S4, `participant.ts:180-184`,
  `:199-202`), no model or a model-selection error (S9, S10), a plain `@maestro` message (S11), an unknown command (S12),
  and no folder open (S13).
- The Opus judge's repair, "a completed or failed `@maestro` run adds the lines", is false at S9, S10 and S11. So the
  sentence claims no line per run. It says only where the lines come from.

`probe-02/extension-probe.mjs` runs `extension.ts`'s `activate()` in the same kind of copy and fires each surface. Its log
is `probe-02/extension-probe.log`.

- In VS Code, the palette's "Maestro: Teach — Generate .maestro.md" sends
  `workbench.action.chat.open @maestro /teach-maestro`. So do the sidebar's `run-command` and `init-context`.
- Cursor sends a bare `/teach-maestro` to its own chat. Antigravity sends it to its agent panel.
- S6 shows what `@maestro /teach-maestro` does in VS Code. The model gets `options={}`, so no tools. The skill's "Save
  this file to the project root as `.maestro.md`" reaches it. No `.maestro.md` exists after the run.
- All 8 file writes in the extension and core sources are listed in the check. None writes `.maestro.md`.
- (c) is therefore settled: "saves the answers" is false on the extension route in VS Code. This is L3 in a mock editor
  with a mock model. The last link is L2: that VS Code hands a submitted `@maestro /teach-maestro` to the participant,
  and that a model given no tools cannot write a file. The sentence now says what is true on every route: the command
  asks the coding agent to interview and save. The MCP prompt is the skill text (`mcp-server/src/prompts.ts:28`), and
  the skill files carry it (`teach-maestro/SKILL.md:16, :53, :75`).

## Checks on 02-repairs.md (`probe-02/checks.log`)

- **Pass:**
  - V; S1: `0 violation(s), 0 excused`.
  - S2: `0 concept(s) in three or more sections`, every concept only in its named homes; the core skill is now in the
    opening only.
  - S3: `0 section(s) over budget`, TOTAL 1221.
  - Rules 1, 2, 4, 5, 7 (the five fence lines; the `json` diff is empty), 9 (`2`, `24`), 10, 11 (`0`), 12, 13/14 (`0`).
  - H: the eleven headings. T: `25`. L1, L2: nothing.
  - W1–W6 and W8–W11 pass. W9 prints `## Memory across sessions` and `(opening)`, which the check allows.
  - `ledger.mjs` over 00, 01 and 02: `0 failure(s)`, exit 0.
  - `selftest.mjs`: 50 ok, 0 MISS.
  - The six edit checks re-run after the round (`probe-02/edits-checks.mjs`): 6 of 6 match.
- **Fails:**
  - W7's third count, `grep -c '±20%'`, prints `0` against the skeleton's `1`. The owner decided this and the code
    forces it: see departure 3.
  - S3's block count for the lead-in and chooser is 169 against 150. It is reported, not a gate: see departure 5.

## Words per section (visible copy), against the budgets

| Section | 01 | 02 | Budget |
|---|---|---|---|
| (opening) | 112 | 112 | 120 |
| Getting started | 695 | 692 | 700 |
| — lead-in and chooser | 171 | **169** | 150 |
| — Skill files | 126 | 125 | 130 |
| — VS Code extension | 204 | 199 | 200 |
| — MCP server | 114 | 114 | 120 |
| — First run | 67 | 72 | 85 |
| Commands | 192 | 192 | 340 |
| Memory across sessions | 139 | 131 | 150 |
| Documentation | 37 | 37 | 40 |
| Support and contributing | 54 | 54 | 70 |
| License | 3 | 3 | 12 |
| Total | 1232 | 1221 | 1432 |

## Departures from the skeleton, with the evidence

1. **2.2c item 4 changed.** The skeleton says "with each `@maestro` run, a line in the decision log and in the command
   log". That is false. Wave-cancel paths S3 and S4, no-model paths S9 and S10, and the plain-message path S11 write no
   line (L3, `participant-probe.log`). The bullet now says `@maestro` commands write to the two logs.
2. **2.4 command-log sentence changed.** The skeleton says the command log "gets a line per command run through
   `@maestro`". It is false on the same paths. The sentence now says where the lines come from, and that every line
   holds duration, ~tokens and ~cost (L3). "Only the extension writes it" stays (L2). `appendAudit(` has two hits
   outside tests: its definition (`audit.ts:48`) and the call at `participant.ts:317`. The MCP server imports it and
   never calls it. `/reflect` reads the file (`reflect/SKILL.md:22`).
3. **2.4 "±20%" dropped, and W7's third count fails.** This follows `answers-07.md`: "Drop '±20%'. Keep the rest …
   word for word". The judges showed the figure false at L3 (`participant.ts:313-314`, `cost-estimator.ts:66`). W7's
   third count now prints `0`, and must be amended with the skeleton.
4. **2.2e "saves the answers as `.maestro.md`" changed.** It is false on the extension route in VS Code (see (c) above).
   The step now says `/teach-maestro` asks the coding agent to interview and save, which is true on every route. The
   rest of 2.2e stands.
5. **2.2a budget still exceeded.** The lead-in and chooser run 169 against 150. Only "that" and "itself" could go at no
   cost to the reader. The rest is the owner's four writes (A5), the glosses 2.2a requires, and the three rows' facts.
   The budget is reported, as the brief says, not met.

## Seen and not changed: outside this brief, for the next round

- **H1 (L2): `/diagnose` in VS Code.** Its report may never come on that route.
  - `diagnose/SKILL.md:12` demands `/teach-maestro` first when no context exists.
  - With no `.maestro.md`, the participant injects no context (`participant.ts:74`), and nothing in VS Code saves one.
  - So X:66, "See First run for what these two give you", is doubtful for step 2 there. A run with a real model would
    settle it.
- **H2 (L2): the interview in VS Code.** The participant ignores `chatContext` (`participant.ts:49`) and is not sticky
  (`maestro-extension/package.json:180`). The interview asks one section at a time (`teach-maestro/SKILL.md:20`), so it
  loses each earlier turn.
- **A palette label for part 6.** "Maestro: Teach — Generate .maestro.md" promises what the VS Code route does not do.
  The README quotes it as the owner's A2 §11b label. It is a code/UI question for part 6.
- **Cursor and Antigravity.** Whether their agents load the synced skills when the extension sends `/teach-maestro` is
  unknown. It is not probed.
- **Judge notes this brief did not list, untouched:**
  - bold route names at X:17 (Opus);
  - X:91's "except this one", which has no antecedent (Opus);
  - X:140's "command palette" label (Opus).

## Where things are

`probe-02/`:

- the three probes (`participant-probe`, `extension-probe`, `mcp-prompt-probe`) and their logs, with the `--figures` and `--synced` outputs in logs of their own;
- `hooks.mjs` and `vscode-mock.mjs`;
- `checks.sh` (part 3, verbatim) and `checks.log`, which is the regenerated round's; the first attempt's is `checks.sent-back.log`;
- `edits-checks.mjs`;
- `round.log`.

The probes copy into `mkdtemp` directories and delete them. `checks.sh` writes only `$TMPDIR/maestro-readme-checks`.
The generator of `edits/02.json` is outside R, at `$TMPDIR/writer02-gen/gen.mjs`.

One command broke the brief's rule: `cd "$R" 2>/dev/null; node …` put a `cd` inside a compound command. It ran a probe
that failed before writing anything, and nothing in the snapshot or R changed.

## Sent back by the verifier, and repaired (2026-09-24)

The verifier (Codex Sol, `reviews/02/verifier-sol-v02.md`) held 7 of the 10 claims. Three got "does not answer".

By the page:

1. `edits/02.json` was kept as `edits/02.sent-back.json`.
2. `02-repairs.md` was deleted, and `ledger.02.json` (`[]`) was copied back over `ledger.json`.
3. The three claims were fixed, and `round.mjs` was run again. It raised no refusal.

Field by field, only these changed:

- edit 3: `check.run`, `check.expect`, `claims[0].asks`;
- edit 4: `check.run`, `check.expect`, `claims[0].asks`;
- edit 6: `check.run`, `check.expect`.

Every `old` and `new` is unchanged. The round's text is byte-identical: SHA-256 `20b8ea66…ae3b` as before, and the
same `diff-02.patch` (`36206d63…9629`). Every check was re-run on the regenerated round. Part 3's output is identical
to the first run's. `ledger.mjs` gives 0 failures. `selftest.mjs` gives 50 ok. The edit checks match 6 of 6, and no
`saw` is clipped.

1. **(b) "costs and token counts are estimates": widened the check, and put the asks back in the sentence's scope.**
   - **The asks.** It now says "the cost and token figures Maestro records are estimates". These are the ~tokens and ~cost
     on the command-log lines, from which /reflect sums its ~cost. It also says a run that writes no line records no
     figure. The words "each @maestro run's cost" are gone.
   - **What the check adds.**
     - `participant-probe.mjs --figures` records S1's figures: `token_usage={"input":0,"output":260}`,
       `cost_estimate_usd=0.0021`, and the decision line's `token_cost`, the same.
     - It recomputes them from the streamed text: ceil(960 / 3.7) = 260 tokens, and 260 × $8 per 1M = 0.0021. The mock
       model reported no usage, so the recorded figures are the heuristic's.
     - S3 and S9 show that a pre-emission cancel and a no-model run record nothing.
     - `appendAudit(` is called outside tests only at `participant.ts:317` (the other hit is `audit.ts:48`, its
       definition). So every recorded figure is built at `participant.ts:311-314`.
     - The estimator and `answers-07.md` lines stay.
   - **Level.** The check stays at level 2, the level of the edit's other two claims, which rest on source lines. The
     estimates claim itself now has a level-3 run in its `saw`.
2. **(c) "/teach-maestro asks the coding agent to interview and save": widened the check. The sentence stands.**
   - **MCP prompt route.** `probe-02/mcp-prompt-probe.mjs` is new. It runs the repository's own
     `scripts/bundle-skills.js` in a temp copy. It loads `mcp-server/src/prompts.ts` unmodified, with stubs for the
     MCP SDK class and zod, and calls `registerPrompts`. 24 prompts are registered. The teach-maestro prompt's text
     holds the interview and the save instructions, and equals the body of `source/skills/teach-maestro/SKILL.md`.
   - **Skill-file route.** The check prints `source/skills/teach-maestro/SKILL.md:16` (the interview) and `:75` ("Save
     this file to the project root as `.maestro.md`."). That is the text an agent loads from a manual copy.
     `extension-probe.mjs --synced` adds the `SKILL.md` the extension syncs into `.claude/skills/teach-maestro/`. It
     holds both instructions, and so do the `.cursor` and `.agents` copies, in `extension-probe-synced.log`.
   - **Extension route.** The Cursor and Antigravity lines show that those editors send `/teach-maestro` to their own
     agents. The asks now names every route and what the check shows on each.
3. **(d) "the MCP server is a program the MCP client starts on your machine": widened the check. The claim stands.**
   The `sed` range is now `mcp-server/README.md:17-45`, which includes Cursor's configuration block (`:34-45`). The
   expect requires the `npx` command and its `-y maestro-workflow-mcp` arguments after Cursor's heading.

Findings 1, 2 and 3 were all fixed by widening the check. None was fixed by narrowing a sentence. The page text did not
change.

The verifier's duty-2 note on claim 1 (the asks' "from nothing else in the extension") came with a "holds" verdict. By
the coordinator's instruction, only the three findings were changed, so claim 1 is unchanged.
