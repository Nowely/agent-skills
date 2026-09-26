# Round 02 of arm B: the critics' findings, deduplicated and ranked (lens 6, Opus)

**Document.** `D` = `R/02-repairs.md`, SHA-256 `20b8ea66842cac9a9031c1a57c8818d61e0fcf7d7052475070c636aae82bae3b`, equal to `R/probe-02/freeze-02.sha` (`shasum -a 256 "$D"`).

**Paths.** `R` = `$TMPDIR/terse/runs/20260924-150946-maestro-readme-rewrite`. `S` = the snapshot, `$TMPDIR/terse-bench/snapshot`. `W` = lens 1's work directory, `$TMPDIR/lens1-opus-02`; its logs are in `$W/logs`. `C` = lens 2's directory, `$TMPDIR/terse-bench-lens2-opus-02`, which holds its `visible.md`, `run.sh`, `water-check.sh` and `sections-of.sh`.

**Read.**
- The reports in `R/reviews/02/`: lens 1 (`lens1-opus.md`, F1–F23); lens 2 (`lens2-opus.md`: 1.1, water rows 1–14, A1–A3, B1–B3, X1–X2); lens 7 (`lens7-opus.md`: 2.1–2.3, 3.1–3.2, 5.1); lens 4 (`c4-1.md`, `c4-2.md`); lens 5 (`c5-1.md` to `c5-8.md`).
- The verifier's three reads, as context. The last one, `verifier-sol-v02c.md`, holds 10 of 10 claims.
- The record: `skeleton.md`, `rounds.md`, `judges/*.md`, `edits/02*.json`, `ledger.json`, `writer-02.md`, and `diff -u 01-candidate.md 02-repairs.md`, which is identical to `R/diff-02.patch`.
- Beyond the listed record:
  - four files of `S`, for one scope note (01, marked YOURS);
  - the critics' own logs and scripts in `$W` and `C`, to confirm that every output line cited below exists;
  - one line of `R/probe-02/participant-probe-figures.log`. The same string is in `edits/02.json`, and it is cited from there.

**Quotes.** Each quote below was checked on its line of `D` with `sed -n '<n>p' "$D" | grep -F -- '<quote>'`. All 52 fragments matched.

**What round 02 changed.** Six sentences, at lines 17, 33, 57, 93, 133 and 135. It introduced none. Each entry's *Round* line says whether its sentence is one of the six and whether the fault sits in the changed words.

**Gate input, lens 4.** `c4-1`: `GOAL: achieved`. `c4-2`: `GOAL: achieved`. Neither reports an untrue sentence.

**Lens 5.** All 8 questions were answered, and no answer is marked GUESSED, so lens 5 adds no finding. Two of its answers corroborate findings 06 and 28.

**Order.**
- Findings raised by two or more lenses come first: 01–05.
- Then lens 1 (06–24), lens 7 (25–27), lens 4 (28–32), lens 2 (33–51) and METHOD (52–56).
- YOURS marks what no critic said but a critic's evidence directly implies.

**Checks' shorthand: lens 1's reproduction, as the critic gives it.**

```
S=$TMPDIR/terse-bench/snapshot
W=$TMPDIR/lens1-opus-02
export npm_config_cache=$W/npm-cache
cp -R $S $W/snap
npm --prefix $W/snap run check                    # C1: "Results: 0 errors, 0 warnings"
npm --prefix $W/snap run build                    # C1: "10 providers x 25 skills = 250 skill copies"
npm --prefix $W/snap/packages/core ci && npm --prefix $W/snap/packages/core run build
npm --prefix $W/snap/mcp-server ci && npm --prefix $W/snap/mcp-server run build
npm --prefix $W/snap/maestro-extension ci --ignore-scripts && npm --prefix $W/snap/maestro-extension run bundle-skills
node $W/harness/build-ext.cjs
M=$W/snap/mcp-server/dist/index.js
node $W/harness/mcp-wave.mjs $M "$(mktemp -d)" "$(mktemp -d)"                       # C2 ($W/logs/mcp-wave.txt)
node $W/harness/mcp-writes.mjs $M <empty dir> <dir holding only .maestro/context.md> <home>   # C3 ($W/logs/mcp-writes.txt)
node $W/harness/mcp-both.mjs $M <dir holding .maestro/context.md and .maestro.md> <home>     # C4 ($W/logs/mcp-both.txt)
bash $W/harness/run-ext-checks.sh $W              # C5, sections E1-E6 ($W/logs/ext-checks.txt)
bash $W/harness/run-ext-tokens.sh $W              # C6 ($W/logs/ext-tokens.txt)
```

**Lens 2's checks.**
- `bash C/run.sh` runs part 3's checks; the output is in `C/transcript.txt`.
- `bash C/water-check.sh` checks the water rows; the output is in `C/water-check.txt`.
- `bash C/sections-of.sh C/visible.md '<pattern>'` lists the sections a pattern appears in.

---

## The list

### L6.02-01 · SENTENCE · 3 lenses

- **Line 93.** "1. **`/teach-maestro`**, once per project: asks your coding agent to interview you about the project and save the answers as `.maestro.md` in its root; if `.maestro/context.md` already exists, that is read first instead."
- **Finding.** The last clause gives /teach-maestro a step it does not take: its skill text and its MCP prompt never mention `.maestro/context.md`, and both always interview and save `.maestro.md`. Its "first … instead" also leaves the reader unable to tell whether the interview still happens.
- **Raised by.**
  - Lens 1, F11: FALSE.
  - Lens 2, B1: the pair with line 91.
  - Lens 7, 2.3: rules 11 and 3; the page never says what `.maestro/context.md` is.
- **Check.**
  - Lens 1: `grep -rn 'context.md' $S/source/skills` finds only `agent-workflow/SKILL.md:14`.
  - Lens 1, C4 (`$W/logs/mcp-both.txt`): `teach-maestro prompt mentions ".maestro/context.md": false`, and `read_context with both files -> "# v2\nMARKER-A-CONTEXT-MD\n"`.
  - Lens 2: `sed -n '91p;93p' "$D"`.
- **Round.** The clause is unchanged since 01. The clause before it was reworded by 02 (edit c), and no critic faults those words.
- **Scope of F11 (YOURS, level 2).** On the `@maestro` route, the participant injects the matching sections of the context file before every slash command's skill, `/teach-maestro` included, and it reads `.maestro/context.md` first. For /teach-maestro the sections are the always-included ones and those matching "stack", "conventions", "architecture" and "overview". Sources: `S/maestro-extension/src/chat/participant.ts:69-91`, `S/maestro-extension/src/core/context.ts:11`, `S/maestro-extension/src/core/context-slicer.ts:48-58`, `S/packages/core/src/context-utils.ts:52, :92, :149-215`. There the clause holds. F11's "never reads" is proven for skill files and the MCP server only.
- **Edit.** Together with 02: take the clause out of step 1 and state the fact on line 91: "Every command but `/teach-maestro` needs `.maestro.md` first, or reads `.maestro/context.md` instead if it exists." That is 6 words fewer in *First run*. Lens 7's cut of the clause, without moving the fact, drops must-say 4 (A1 §5.4: "If `.maestro/context.md` exists, it is read first"), so it needs the owner's word.
- **Also.** Once `.maestro/context.md` exists, nothing reads the `.maestro.md` that /teach-maestro writes (lens 1, C4). That is a CODE matter, beside part 6's item on `context.ts:5-9`.

### L6.02-02 · SENTENCE · 3 lenses

- **Line 91.** "Every command needs `.maestro.md` in place first — except this one."
- **Finding.** Overstated and unanchored:
  - The core skill, the extension and the MCP server all take `.maestro/context.md` in place of `.maestro.md` and read it first.
  - Through `@maestro`, nothing checks for either file.
  - "This one" names a command the section only reaches on line 93.
- **Raised by.**
  - Lens 1, F10: OVERSTATED.
  - Lens 2, B1: the pair; "names no command".
  - Lens 7, 3.1: water; the reference is unclear.
  - The round-01 Opus judge noted the missing antecedent, and writer-02 left it "untouched".
- **Check.**
  - Lens 1, C3 (`$W/logs/mcp-writes.txt`): `read_context with only .maestro/context.md -> "# Ctx\n\n## Tech Stack\nMARKER-CONTEXT-MD-ONLY\n" isError= false` and `run_command diagnose includes context marker: true`.
  - Lens 1, C5/E4: /capture, /recap, /reflect and /diagnose each called the model with no context file.
  - Sources: `agent-workflow/SKILL.md:13-16`, `maestro-extension/src/core/context.ts:11`, `mcp-server/src/tools.ts:99-102`.
  - Lens 2: `sed -n '91p;93p' "$D"`.
- **Round.** Earlier.
- **Edit.** The line 91 given in 01, which names the exception and carries the context file.
- **Lens 7's cut is SUPERSEDED.**
  - Must-say 4 puts the line there (A1 §5.4; part 7, "Must say 1–9").
  - Part 5 names it as the stand-in for *When Something Goes Wrong*.
  - The three round-01 judges held lines 91–94 as a protected passage.
- **Also (framing YOURS).** With neither file, the core skill goes on with "Minimum viable context" questions (`agent-workflow/SKILL.md:17, 23-29`, per lens 1). Each command, though, says it MUST run /teach-maestro first (`diagnose/SKILL.md:12`). The two skill instructions disagree; this is CODE, for part 6.

### L6.02-03 · SENTENCE · 3 lenses

- **Line 142.** "- [Changelog](CHANGELOG.md) — what changed in each version"
- **Finding.** The label promises every version, but `CHANGELOG.md` has entries for 2.0.0, 1.4.2 and 1.3.1 only. It has none for 2.0.1, the version the extension and the MCP server ship. The extension's 1.0.0, 1.3.0, 1.4.0 and 1.4.1 appear only in `maestro-extension/CHANGELOG.md`.
- **Raised by.**
  - Lens 1, F21: OVERSTATED.
  - Lens 2, row 3: water, 6 words; the label repeats the link's name.
  - Lens 7, 3.2: no clause of the purpose needs version history.
- **Check.**
  - Lens 1: `grep -n '^## \[' $S/CHANGELOG.md` prints lines :5, :57 and :71. 2.0.1 is at `maestro-extension/package.json:5`, `mcp-server/package.json:3` and `mcp-server/src/version.ts:2`.
  - Lens 2: `bash C/water-check.sh` prints `r03 line 142 on-line=1 words 7 -> 1 saved 6`.
- **Round.** Earlier.
- **Edit.** A label that claims no completeness: "— release notes", 3 words fewer.
  - Lens 2's bare "[Changelog](CHANGELOG.md)" drops the label that 2.5's device requires, so it is UNSETTLED.
  - Lens 7's cut of the whole item is SUPERSEDED by A2 §3 ("`CHANGELOG.md` keeps the history"; part 7).

### L6.02-04 · SENTENCE · 2 lenses

- **Line 23.** "| [MCP server](#mcp-server) | Any MCP client | Node 20 or later | No skill files — it serves them on request |"
- **Line 21.** "The skill folders, into a skills folder of the project; `npx skills` also writes `skills-lock.json`"
- **Finding.** In the column readers choose a route by (A5), `.maestro/` appears only on the extension's row. Yet the MCP server itself creates `.maestro/`, `.maestro/sessions/`, `.maestro/.gitignore` and `decisions.jsonl` when the agent calls `maestro_write_decision`, as /capture asks. On skill files, the agent writes `.maestro/` and `.maestro.md` by following the same skill texts.
- **Raised by.**
  - Lens 1, F3: UNDERSTATED, level 3.
  - Lens 2, X1: the column as a whole.
- **Check.**
  - Lens 1, C3 (`$W/logs/mcp-writes.txt`): `before write_decision: []`, then `after write_decision: ["decision/.maestro/","decision/.maestro/.gitignore","decision/.maestro/decisions.jsonl","decision/.maestro/sessions/"]`.
  - The chain: `mcp-server/src/tools.ts:426-449`, then `packages/core/src/decisions.ts:42-61, 85-101`; the request is at `capture/SKILL.md:58`.
  - Lens 2: `for n in 21 22 23; do sed -n "${n}p" "$D" | grep -c -F '.maestro/'; done` prints `0`, `1`, `0`.
- **Round.** Earlier.
- **Edit.** Change the MCP cell to "No skill files — it serves them on request; `.maestro/` when your coding agent logs a decision". That adds 8 words to a block already 19 over its budget (33).
  - The owner's A3 (c) states this write: "Its one write into a project is not a skill. It writes `.maestro/` …".
  - The skeleton's cell (2.2a) left it out, which is why lens 2 sends X1 to the owner.
  - The skill-files half of X1 has no obvious edit.

### L6.02-05 · STRUCTURE · 2 lenses

- **Line 131.** "3. **`/reflect`** — scores Maestro's own commands from those logs: usage, completion rate, ~cost, and duration."
- **Finding.** No single route delivers this sentence as written:
  - Only the extension writes the command log (line 133), so on skill files and the MCP server there is no ~cost or duration to score.
  - Through `@maestro`, where the log is written, the model receives neither log.
- **Raised by.**
  - Lens 1, F15: OVERSTATED, the `@maestro` half.
  - Lens 2, B3: "Only" on line 133 against line 131; a hypothesis.
  - The combination is YOURS: the ~cost and duration reach /reflect only when `@maestro` commands write the log and /reflect then runs through a route whose agent can read files.
- **Check.**
  - Lens 1, C5/E4 (`$W/logs/ext-checks.txt`): `@maestro /reflect` gives `any message contains "a-33os2lkm": false` (the id of the first audit row) and `"DECISION-MARKER": false`.
  - Lens 2: `sed -n '131p;133p' "$D"`.
- **Round.** Earlier. Line 133, against which B3 reads it, was reworded by 02, but its "Only" is 01's ("only the extension writes this log").
- **Edit.** None obvious inside the sentence; see 11.

### L6.02-06 · STRUCTURE · 1 lens (the `@maestro` cluster)

- **Line 66.** "See [First run](#first-run) for what these two give you." It follows the fence `@maestro /teach-maestro` / `@maestro /diagnose` (lines 62–63).
- **Finding.** Through `@maestro`, /teach-maestro can neither carry the interview past its first turn nor save `.maestro.md`. The same holds for VS Code's palette and sidebar, which open `@maestro`. So *First run*'s result does not come on the surface this line sends the reader from.
- **Raised by.**
  - Lens 1, F8: OVERSTATED.
  - Also the round-01 Opus judge (S-a, level 2) and writer-02 (H1, H2).
  - Lens 5 corroborates: `c5-4` reads step 1 as "You know it worked when `.maestro.md` is saved".
- **Check.**
  - Lens 1, C5/E4, turn 1: `options passed: [{}] | messages per call: [2] | chars per call: [3106]`.
  - Turn 2: `messages per call: [1] | chars per call: [58]`, `"Interview Questions": false`, `"What AI model(s) are you using": false`.
  - Afterwards: `.maestro.md exists: no`.
  - Sources: `participant.ts:49, :119-122, :195, :268`; `maestro-extension/package.json:180` (`"isSticky": false`); `extension.ts:275-280`.
- **Round.** Earlier. F8 paraphrases line 93 in its pre-round form ("interviews you and saves"). The reworded step, "asks your coding agent to … save", did not change what the reader expects (`c5-4`).
- **Edit.** None obvious. The `@maestro` surface is the owner's (A2 §11b; part 7, "A first-use surface per route"). See 11.

### L6.02-07 · STRUCTURE · 1 lens (the `@maestro` cluster)

- **Line 9.** "The commands diagnose it, fix and improve it, or extend it, and Maestro carries a record of your sessions into the next one (see [Memory across sessions](#memory-across-sessions))."
- **Finding.** For "VS Code's own chat", which the sentence before lists, no record is carried into the next session, and fixes are only printed. The participant never reads `.maestro/sessions/` or `decisions.jsonl`, and it passes neither history nor tools.
- **Raised by.** Lens 1, F1: OVERSTATED.
- **Check.**
  - Lens 1, C5/E4, after seeding SESSION-MARKER and DECISION-MARKER: `@maestro /recap` gives `any message contains "SESSION-MARKER": false` and `"DECISION-MARKER": false`.
  - Every call shows `options passed: [{}]`.
  - Sources: `participant.ts:49, :57-122, :195, :268`; `core/context-slicer.ts:47-90`.
- **Round.** Earlier.
- **Edit.** None obvious. The tool list is P §2's, and the clause renders must-say 5 (2.1). See 11.

### L6.02-08 · STRUCTURE · 1 lens (the `@maestro` cluster)

- **Line 129.** "1. **`/capture`**, at the end of a session — saves a session summary to `.maestro/sessions/` and appends an entry to the decision log (`decisions.jsonl`)."
- **Finding.** Through `@maestro`, no summary is saved, because the model has no tools. The one decision line is the one the extension adds by itself after any command.
- **Raised by.** Lens 1, F13: OVERSTATED.
- **Check.**
  - Lens 1, C5/E4: `sessions after @maestro /capture: 2026-09-20_seed.md` (only the seeded file), and `decision written for /capture: /capture completed in 0.0s`.
  - Sources: `participant.ts:268, :329-338`.
- **Round.** Earlier.
- **Edit.** None obvious; see 11.

### L6.02-09 · STRUCTURE · 1 lens (the `@maestro` cluster)

- **Line 130.** "2. **`/recap`**, at the start of the next one — reads back the latest summary and the last five decisions."
- **Finding.** Through `@maestro`, the model receives neither the summary nor the decisions, only the sliced context file and the active file's imports, and it has no tools to fetch them.
- **Raised by.** Lens 1, F14: OVERSTATED.
- **Check.**
  - Lens 1, C5/E4: `@maestro /recap` gives `"SESSION-MARKER": false` and `"DECISION-MARKER": false`.
  - Sources: `participant.ts:69-91`; `context-slicer.ts:47-90`.
- **Round.** Earlier.
- **Edit.** None obvious; see 11.

### L6.02-10 · CODE · 1 lens (the `@maestro` cluster)

- **Line 107.** "| | [`/zero-defect`](source/skills/zero-defect/SKILL.md) | Activate maximum precision mode — zero mistakes allowed |"
- **Finding.** In the extension, running /zero-defect sends the rules with that one request and does not switch Zero-Defect mode on. This holds for the palette's "Maestro: Zero-Defect — Maximum precision" and for `@maestro /zero-defect`. The next turn carries neither the rules nor the history.
- **Raised by.** Lens 1, F12: OVERSTATED.
- **Check.**
  - Lens 1, C5/E5: `command maestro.zeroDefect` opens chat with `"@maestro /zero-defect"`, and that turn has `"The 8 Precision Rules": true`.
  - The next turn: `messages per call: [1] | chars per call: [23]`, `"The 8 Precision Rules": false`, `"Zero-Defect Mode Active": false`.
  - Afterwards: workspaceState holds no `maestro.zeroDefectActive`, and `CLAUDE.md written: no`.
  - Sources: `extension.ts:76-98, :114-125`; `participant.ts:49, :57-67`.
- **Round.** Earlier.
- **Why CODE.** The description is the owner's one-liner, word for word (A2 §2; part 7), so the page cannot reword it. The command and the mode share a name, and reconciling them is the extension's job (part 6).
- **Edit.** None in the page.

### L6.02-11 · CODE · YOURS, from lens 1's mechanism

- **Lines 59–66.** "Use it from the Command Center sidebar, from the command palette (…), or in VS Code's chat:", followed by the fence `@maestro /teach-maestro` / `@maestro /diagnose`.
- **Finding.** The `@maestro` participant gives the model no tools and no earlier turns, and it is not sticky. So any command whose skill writes or reads a file, or runs over several turns, fails on the surface these lines offer VS Code users. This one cause lies behind 06–10 and the `@maestro` half of 05.
- **Raised by.**
  - Lens 1 gives the mechanism in F1, F8 and F12–F15.
  - Writer-02 gives H1, H2 and "a palette label for part 6".
  - Framing it as a code question for part 6 is YOURS.
- **Check.**
  - Lens 1, C5/E4 and E5: `options passed: [{}]` on every call; follow-up turns show `messages per call: [1]`.
  - Sources: `participant.ts:49` (`chatContext` unused), `:195` and `:268` (`sendRequest(messages, {}, token)`); `maestro-extension/package.json:180`.
- **Round.** Earlier.
- **Edit.** None in the page; this is an item for part 6. The page-side choice, whether to say once what `@maestro` cannot do or to change the surface, is the owner's (A2 §11b).

### L6.02-12 · SENTENCE · 1 lens

- **Line 133.** "Only the extension writes the command log (`audit.jsonl`): its lines come from commands run through `@maestro` in VS Code's chat, each with the command's duration, ~tokens and ~cost."
- **Finding.** The ~tokens on each line are not the command's; the first clause holds.
  - The input count is only the estimate for the injected context slice. It was 0 or 1 in every run lens 1 measured, against 2,318 to 20,361 characters sent.
  - It leaves out the skill text, the Zero-Defect block, the prompt, and the repeat at each wave phase.
  - The ~cost is priced at the default rate, whatever model ran.
- **Raised by.** Lens 1, F17: OVERSTATED.
- **Check.**
  - Lens 1, C5/E4 audit rows (`$W/logs/ext-checks.txt:44-48`): `teach-maestro 0 84 0.0007 phases=1` for 3,106 characters sent, and `diagnose 0 252 0.002 phases=3` for 6,580 + 6,881 + 6,900.
  - C6 (`$W/logs/ext-tokens.txt`): `audit: diagnose input=1 output=252 cost=0.002 phases=3` and `audit: refine input=1 output=336 cost=0.0027 phases=4`.
  - Sources: `participant.ts:311-314`; `packages/core/src/cost-estimator.ts:66`.
  - The first clause: `grep -rn appendAudit $S/mcp-server/src` finds only `tools.ts:11`.
- **Round.** Reworded by 02 (edit a). The fault sits in "~tokens and ~cost": 01 had those words ("with its duration, ~tokens and ~cost"), and skeleton 2.4 prescribes them. "Each" and "the command's" restate 01's "its". Not a regression (see below).
- **Edit.** Drop "~tokens and ~cost" here, 3 words fewer. That departs from 2.4's device, so it needs the owner's word. The slice-only input count goes to part 6, beside the default-rate item (`participant.ts:314`).

### L6.02-13 · SUPERSEDED · 1 lens

- **Line 135.** "Costs and token counts are estimates (~): costs are useful for trends, not for invoicing; token counts are for the context budget, not for billing."
- **Finding.** With the input recorded as 0 or 1, the recorded cost is in effect the output tokens times the default $8 per million. A trend in it is therefore a trend in reply length. It does not change with the 3 or 4 model calls of a wave command, or with the model.
- **Raised by.** Lens 1, F18: OVERSTATED.
- **Check.**
  - Lens 1, C5/E4: `teach-maestro 0 84 0.0007` (84 × 8 / 1e6 = 0.000672) and `diagnose 0 252 0.002`.
  - C6: as in 12.
- **Round.** Reworded by 02 (edit b: "±20%" dropped by the owner's decision). The fault sits in "useful for trends", which are 01's words. Not a regression.
- **Why SUPERSEDED.** The owner kept these words "word for word" (answers-07; *Decisions after the agreement* 1). That decision cites `participant.ts:313-314` and `cost-estimator.ts:66`. F18's level-3 detail, input recorded as 0 or 1, goes further and can be put to the owner.
- **Edit.** None without the owner.

### L6.02-14 · SENTENCE · 1 lens

- **Line 55,** and line 22's "Also an MCP server entry". "**An MCP server entry** in the workspace's MCP config, so your coding agent can also reach the skills through the MCP server."
- **Finding.** Understated.
  - At every start, the extension adds its entry to each of `.vscode/mcp.json`, `.claude/mcp.json` and `.agents/mcp.json` that exists.
  - When no file gains a new entry at a start, it rewrites `.vscode/mcp.json` with Maestro's server alone and deletes every other server in it. That happens at the first start with no config, at every later start once the entry is present, and whenever `JSON.parse` rejects a config, for example one with `//` comments.
- **Raised by.** Lens 1, F4: UNDERSTATED, level 3 on a mocked host. Round 01 established the same: the Opus judge (E1) and Astra (checks 8–10).
- **Check.**
  - Lens 1, C5/E1 (`$W/logs/ext-checks.txt:2-7`): `after start 1 servers: github,maestro-workflow-mcp`; the user then adds `mine`; `after start 2 servers: maestro-workflow-mcp`.
  - A config with a comment: `commented config after start 1 servers: maestro-workflow-mcp`.
  - A project whose only config is `.claude/mcp.json`: `.vscode/mcp.json exists=no` after start 1, `exists=yes` after start 2.
  - Sources: `mcp-config.ts:20-27, 49-75, 97-104, 136-151`.
- **Round.** Earlier.
- **Edit.** Add to line 55: "; a start that adds no new entry rewrites `.vscode/mcp.json` to hold only Maestro's server".
  - That is 14 words, and the block is already at 199/200, so the budget needs the owner's word.
  - Naming `.vscode/mcp.json` also brushes 2.2's exclusion of the clients' files; the round-01 Opus judge counted it as borderline.
  - A2 §4 asks for the effects "in full".
  - The deletion itself is CODE, for part 6.

### L6.02-15 · SENTENCE · 1 lens

- **Line 55.** "so your coding agent can also reach the skills through the MCP server."
- **Finding.** Overstated for Cursor: the extension never writes `.cursor/mcp.json`, which this page (line 70) and `mcp-server/README.md:34` give as Cursor's MCP config.
- **Raised by.** Lens 1, F5: level 3 on a mocked host for what is written; level 2 for what Cursor reads.
- **Check.** Lens 1, C5/E1 with appName "Cursor" (`$W/logs/ext-checks.txt:6-7`): `.cursor/mcp.json exists=no` after start 1 and after start 2. Source: `mcp-config.ts:20-27`.
- **Round.** Earlier.
- **Edit.** None obvious.
  - The clause is the owner's A3 (c) "Also": "So an extension user's agent can also fetch the skills from the server".
  - Narrowing it needs to know which agents read `.claude/mcp.json` and `.agents/mcp.json`, and no critic established that (lens 1, level 1).

### L6.02-16 · SENTENCE · 1 lens

- **Line 56,** and line 22. "**Zero-Defect mode's rules**, when you switch it on: a marked block of 8 precision rules in `CLAUDE.md`, created if missing; also `.cursorrules` in Cursor, and `.agents/rules/maestro-zero-defect.md` in Antigravity."
- **Finding.** Understated: the block is not 8 rules but the whole /zero-defect skill body. It runs to 76 lines, with a Pre-Commit Gate, an Anti-Pattern Table, a Session Directive, and the standing instruction "Invoke /agent-workflow — … you MUST run /teach-maestro first".
- **Raised by.** Lens 1, F6. Also the round-01 Opus judge (S-d: "understates the block; … not false"). The round-01 Astra judge contests it; see the conflicts below.
- **Check.**
  - Lens 1, C5/E3: `after ON: 76 lines; headings: ## MANDATORY PREPARATION|### The 8 Precision Rules|### The Pre-Commit Gate|### Anti-Pattern Table|### Session Directive|### Recommended Next Step|**NEVER**:|` and `4:Invoke /agent-workflow — it contains workflow principles, ...`.
  - Sources: `extension.ts:81`, `adapters/editor.ts:64`, `zero-defect/SKILL.md:10-83`.
- **Round.** Earlier.
- **Edit.** "a marked block of 8 precision rules" → "a marked block holding the `/zero-defect` skill, its 8 precision rules included". That adds 5 words to a block at 199/200. It is the wording round 01's Z used and the Opus judge verified.

### L6.02-17 · SENTENCE · 1 lens

- **Line 56,** and line 22's "Zero-Defect's block in `CLAUDE.md`, when switched on". The sentence is quoted at 16.
- **Finding.** Understated: switching the mode off removes the block only from a file that holds other text.
  - A `CLAUDE.md` or `.cursorrules` that switching on created keeps the full block.
  - Antigravity's rule file stays, with `trigger: manual`.
- **Raised by.** Lens 1, F7: level 3 on a mocked host.
- **Check.**
  - Lens 1, C5/E3: `after OFF: state={"maestro.zeroDefectActive":false}; CLAUDE.md lines=76; markers=2`.
  - `Cursor ON+OFF: .cursorrules markers=2`; `Antigravity OFF: file kept=yes, trigger: manual`; `user CLAUDE.md after ON+OFF: # Mine|`.
  - Sources: `editor.ts:51-74` (the check at `:68`, `if (existing.trim())`) and `:114-120`.
- **Round.** Earlier.
- **Edit.** None within the budget. The write skipped on empty text is CODE, for part 6.

### L6.02-18 · SENTENCE · 1 lens

- **Line 22.** "| [VS Code extension](#vs-code-extension) | VS Code, and its forks Cursor, Antigravity, Windsurf | VS Code 1.95 or later |"
- **Finding.** The *Needs* cell leaves out a chat model reachable through VS Code's language-model API. Without one, every command in VS Code stops, including those run from the palette and the sidebar, since both open `@maestro`.
- **Raised by.** Lens 1, F2: UNDERSTATED.
- **Check.**
  - Lens 1, C5/E6: `chat shows: "*Maestro* — Applying **/diagnose** skill...\n\n---\n\n*Maestro* — No language model available. Ensure a model is configured in your editor.\n"` and `.maestro exists: false`.
  - Sources: `participant.ts:127-133`; `extension.ts:275-280`.
- **Round.** Earlier.
- **Edit.** "VS Code 1.95 or later" → "VS Code 1.95 or later, and a chat model". That adds 4 words to a block already over budget (33).

### L6.02-19 · SUPERSEDED · 1 lens

- **Line 83.** "For VS Code's `servers` form (also used by Antigravity), the other clients, and HTTP, see [`mcp-server/README.md`](mcp-server/README.md)."
- **Finding.** `mcp-server/README.md` configures three clients, two of which this page already covers, plus HTTP (:61), and no "other clients". The three are Claude Desktop (:21), Cursor (:34) and VS Code / Antigravity (:47).
- **Raised by.** Lens 1, F9: level 2. Also the round-01 Opus judge, on Z:81.
- **Check.** `grep -n '^\*\*.*\*\* (' $S/mcp-server/README.md` prints lines 21, 34 and 47 only.
- **Round.** Earlier.
- **Why SUPERSEDED.** A5, the owner's read of skeleton 01, keeps the link "for VS Code's `servers` form, the other clients, and HTTP" (part 7, "settles 2"). The evidence is new to that decision.
- **Edit.** Drop "the other clients," with the owner's word.

### L6.02-20 · SENTENCE · 1 lens

- **Line 141.** "- [MCP server](mcp-server/README.md) — each client's settings, HTTP, and everything the server offers"
- **Finding.** The linked page has settings for three clients only, not for each client.
- **Raised by.** Lens 1, F20: level 2.
- **Check.** As 19.
- **Round.** Earlier.
- **Edit.** "each client's settings" → "settings for three clients", one word more.

### L6.02-21 · SENTENCE · 1 lens

- **Line 140.** "- [Extension](maestro-extension/README.md) — its sidebar, command palette, and settings"
- **Finding.** `maestro-extension/README.md` says nothing about the command palette.
- **Raised by.** Lens 1, F19: level 2. Also the round-01 Opus judge ("X:140 promises 'command palette'"); writer-02 left it "untouched".
- **Check.** `grep -ci palette $S/maestro-extension/README.md` prints `0`. The sidebar is at :18-22 and the settings at :106-111.
- **Round.** Earlier.
- **Edit.** "its sidebar, command palette, and settings" → "its sidebar and settings", 2 words fewer.

### L6.02-22 · SENTENCE · 1 lens

- **Line 148.** "After a change, run `npm run check`, then `npm run build`, which copies the skills into the ten skills folders of this clone so you can try the change there with a coding agent — it installs into no other project."
- **Finding.** Understated: the build deletes each of the ten folders before it copies, so any other skill in the clone's `.claude/skills/`, or in the other nine folders, is lost.
- **Raised by.** Lens 1, F22: level 3.
- **Check.**
  - Lens 1, C1: seed `.claude/skills/my-own-skill/SKILL.md`, then run the build.
  - `ls $W/snap/.claude/skills | grep -c .` prints `26` before the build and `25` after it.
  - `ls -d .../my-own-skill` prints `No such file or directory`.
  - Sources: `scripts/build.js:46-50, 76-80` (`fs.rmSync(dir, { recursive: true, force: true })`).
- **Round.** Earlier.
- **Edit.** "which copies the skills into the ten skills folders of this clone" → "which empties the ten skills folders of this clone and copies the skills into them". That adds 3 words; the section is at 54/70.

### L6.02-23 · SUPERSEDED · 1 lens

- **Line 148.** "To contribute: `source/skills/` is the only place to edit."
- **Finding.** This is true of a skill's text. But a command added or renamed there does not reach the extension without edits elsewhere: its palette and `@maestro` command lists and the sidebar's names are kept by hand.
- **Raised by.** Lens 1, F23: level 2.
- **Check.** NO CHECK run. Sources: `maestro-extension/package.json:55-173, :181-278`; `webview-ui/src/components/command-list.tsx:7-49, :82-84`.
- **Round.** Earlier.
- **Why SUPERSEDED.** "The only place to edit" is the owner's own wording (P §1, quoted in skeleton 1.1). The hand-kept lists are a code question for part 6. Lens 2 found no sentence of the page that contradicts it.
- **Edit.** None without the owner.

### L6.02-24 · SENTENCE · 1 lens

- **Line 131,** quoted at 05.
- **Finding.** Understated: /reflect scores five dimensions, and the list leaves out command flow, meaning the common command sequences and each command's abandonment rate.
- **Raised by.** Lens 1, F16: level 2.
- **Check.** NO CHECK run. Sources: `reflect/SKILL.md:37-40`, "Most Abandoned" at :60, "STRONGEST PIPELINES" at :64-67.
- **Round.** Earlier.
- **Edit.** "usage, completion rate, ~cost, and duration" → "usage, completion rate, command flow, ~cost, and duration". That adds 2 words; the section is at 131/150.

### L6.02-25 · SENTENCE · 1 lens

- **Line 9, first sentence.** "Maestro gives your coding agent — Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity, or VS Code's own chat — commands for the AI workflow you're building: its prompts, context, tools, agents, retrieval, evaluation and guardrails."
- **Finding.** Rule 1: the sentence names no problem.
  - It opens on 21 words: "Maestro gives your coding agent" and ten tool names.
  - Its object only arrives at word 22.
  - So it answers "fits their tool" before "fits their problem" (P §1).
- **Raised by.** Lens 7, 5.1.
- **Check.** NO CHECK. Lens 7 counts word positions; 3.3's rule-1 check prints `ok`.
- **Round.** Earlier.
- **Edit.** Implied by lens 7 and by skeleton 2.1's device, which puts "then where it runs" last. Take the list out of the first sentence and close the paragraph with "It works in Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity, or VS Code's own chat." That adds 1 word; the opening is at 112/120.

### L6.02-26 · UNSETTLED · 1 lens

- **Line 33.** "Install all 25 — every command except `/teach-maestro` loads the core skill first."
- **Finding.** Rule 11: the reason needs "except `/teach-maestro`" to be true, while the instruction "Install all 25", A3 (a)'s decision, stands without it.
- **Raised by.** Lens 7, 2.2.
- **Check.** NO CHECK for the finding. The reason's truth is the verifier's claim 9 (HOLDS) and lens 2's scope check.
- **Round.** Reworded by 02 (edit d removed ", `agent-workflow`,"). The fault is in "except `/teach-maestro`", which are 01's words.
- **Why UNSETTLED.**
  - The reason is 2.2b's device, "install all 25, because every command loads the core skill first".
  - That device follows A3 (a): "Every command starts by invoking the core skill".
  - The exception that makes the reason true is recorded only as decision 2 after the agreement, which carries no owner's answer.
- **Edit.** Lens 7's: "Install all 25.", 9 words fewer.

### L6.02-27 · SUPERSEDED · 1 lens

- **Lines 104 and 116.**
  - "| | [`/streamline`](source/skills/streamline/SKILL.md) | Remove unnecessary complexity, flatten over-engineering |"
  - "| | [`/temper`](source/skills/temper/SKILL.md) | Reduce over-engineering, simplify overbuilt workflows |"
- **Finding.** Rule 9: the two rows say the same thing, so a reader whose workflow is overbuilt can choose between them only by the Group cell (P §1, ability 4).
- **Raised by.** Lens 7, 2.1.
- **Check.** NO CHECK.
- **Round.** Earlier.
- **Why SUPERSEDED.** The one-liners are the owner's, word for word (A2 §2; part 7). Lens 7 proposes no cut.
- **Edit.** None.

### L6.02-28 · SENTENCE · 1 lens

- **Lines 129–130,** quoted at 08 and 09.
- **Finding.** GUESSED: the page never says what the loop is for, which is keeping a new session from contradicting earlier decisions. The reader chose `/capture` and `/recap` by inference.
- **Raised by.**
  - Lens 4, `c4-2`, GUESSED point 1. Its wished-for sentence: "To prevent a new session from contradicting earlier decisions, run /capture before ending the old session and /recap when beginning the new one."
  - Lens 5's `c5-5`, on the same problem, answered with `/recap` alone and needed two sections. It is not marked GUESSED.
- **Check.** NO CHECK; this is the reader's report.
- **Round.** Earlier.
- **Edit.** Line 130 → "… reads back the latest summary and the last five decisions, so the new session starts from them." That adds 7 words; the section is at 131/150.

### L6.02-29 · SENTENCE · 1 lens

- **Lines 27–33.** "Run this in the root of the project you work in:", then `npx skills add sharpdeveye/maestro`, then "`npx skills` is a separate installer, not part of Maestro; …"
- **Finding.** GUESSED: npx asked "Need to install the following packages: skills@1.7.0 Ok to proceed? (y)", and the page does not say to answer yes.
- **Raised by.** Lens 4, `c4-1`, GUESSED point 1. `c4-2` met the same prompt (its command 3) and answered `y` without listing it as a guess.
- **Check.** `c4-1`'s command 7: `export npm_config_cache=$TMPDIR/…/npm-cache` and then `npx skills add sharpdeveye/maestro` in a scratch project. It shows the prompt and then `Installed 25 skills`. The run clones the upstream repository (see 55).
- **Round.** Line 33 was reworded by 02 (edit d); the gap is in no changed word.
- **Edit.** Add to line 33: "npx asks to install it first; answer `y`."
  - That adds 8 words to Skill files, at 125/130; rows 41 and 51 save 6.
  - Part 7's least-sure #1 says the block then says what the run showed.
  - The fence itself is the owner's (rule 7).

### L6.02-30 · SENTENCE · 1 lens

- **Lines 33 and 37.** "chooses your coding agent's folders itself"; "`.agents/skills/` (Antigravity) · `.claude/skills/` (Claude Code)"
- **Finding.** GUESSED: the installer put the skills in `.agents/skills/` and linked `.claude/skills/` to them. The page pairs `.agents/skills/` with Antigravity and says nothing of links, so a Claude Code reader has to guess that the layout is right.
- **Raised by.** Lens 4, `c4-1`, GUESSED point 2. Its wished-for sentence: "The installer may keep canonical files in `.agents/skills/` and symlink `.claude/skills/` to them."
- **Check.** `c4-1`'s commands 9–13:
  - `find .agents/skills -type f -name SKILL.md -print | wc -l` prints `25`.
  - `find .claude/skills -type l -print | wc -l` prints `25`.
  - `readlink .claude/skills/teach-maestro` prints `../../.agents/skills/teach-maestro`.
- **Round.** Line 33 was reworded by 02; the gap is in no changed word.
- **Edit.** Add "It may keep the skills in `.agents/skills/` and link your coding agent's folder to them."
  - That adds 15 words, over the block's 130.
  - It names no agent, as A3 (a) requires.
  - Part 7's least-sure #1 asks for what the run showed.

### L6.02-31 · SCOPE · 1 lens

- **Lines 129–130.**
- **Finding.** GUESSED, though the reader made no guess: the page does not say what becomes of the decisions of a session that ended without `/capture`.
- **Raised by.** Lens 4, `c4-2`, GUESSED point 2.
- **Check.** NO CHECK. No critic established the behaviour, and it differs by route: through `@maestro`, the extension adds a decision line after any command (lens 1, F13; `participant.ts:329-338`).
- **Round.** Earlier.
- **Why SCOPE.** 2.4 shows the loop after a capture, and part 5 refuses a *When Something Goes Wrong* section.

### L6.02-32 · SUPERSEDED · 1 lens

- **Line 114.** "| | [`/accelerate`](source/skills/accelerate/SKILL.md) | Optimize for speed, reduce latency and cost |"
- **Finding.** GUESSED, though the reader made no guess: the row does not say what `/accelerate` produces.
- **Raised by.** Lens 4, `c4-2`, GUESSED point 3.
- **Check.** NO CHECK.
- **Round.** Earlier.
- **Why SUPERSEDED.** The one-liners are the owner's (A2 §2). 2.3 excludes anything more, and part 5 refuses a sample output.

### L6.02-33 · UNSETTLED · 1 lens

- **Lines 15–23,** the lead-in and chooser.
- **Finding.** The block runs to 169 words against 2.2a's budget of 150. The water in it (46, 48) would save 5 words; 04 and 18 would add 12.
- **Raised by.** Lens 2, 1.1.
- **Check.** `awk '/^## /{b=$0;next} /^### /{b=$0;next} b!=""&&NF{w[b]+=NF} END{for(k in w)print w[k]"\t"k}' "C/visible.md"` prints `169	## Getting started` (`bash C/run.sh`; `C/transcript.txt`).
- **Round.** Earlier. 01 ran to 171 words, and 02's edit on line 17 cut 2.
- **Why UNSETTLED.**
  - Decision 3 after the agreement ("reported, not a gate") carries no owner's answer.
  - Skeleton 1.3.4 makes a budget overrun a question to the owner.
  - The extension block is at 199/200, so 14 and 16 run into the same question.

### L6.02-34 · SENTENCE · 1 lens

- **Line 54.** "…into the ten skills folders of the first folder in your workspace, rewritten at every start; edits to those copies are lost."
- **Line 148.** "…which copies the skills into the ten skills folders of this clone so you can try the change there with a coding agent…"
- **Finding.** Take a contributor whose editor runs the extension with the clone as its first workspace folder. By line 54, the next start rewrites the copies the build made, and the trial on line 148 does not allow for that. The page does not say whether the extension writes into a clone of its own repository.
- **Raised by.** Lens 2, B2: a hypothesis; nothing was run and the code was not opened.
- **Check.** `sed -n '54p;148p' "$D"`, which proves the quotes only.
- **Round.** Earlier.
- **Edit.** None obvious.

### L6.02-35 · UNSETTLED · 1 lens

- **Where.** Line 9, "Maestro carries a record of your sessions into the next one"; line 57, "Maestro session data — opt-in to version control"; lines 122–123, "Save a session summary — persist decisions and next steps" and "Quick summary of the last session"; line 127, "These are your own sessions, …"; line 129, "saves a session summary to `.maestro/sessions/`".
- **Finding.** The recorded sessions are stated in four sections. S2 passes only because its patterns miss these wordings.
- **Raised by.** Lens 2, A1.
- **Check.** `bash C/sections-of.sh C/visible.md 'session'` prints `4 section(s): (opening) [1]; Getting started [1]; Commands [2]; Memory across sessions [2]`; also `grep -n -i -E 'session' "$D"`.
- **Round.** Earlier. Line 57 was reworded by 02, but its "session" words are in the unchanged `.gitignore` header.
- **Why UNSETTLED.** The Commands occurrence is an owner-verbatim description (A2 §2), and S2's rule makes that "a question to the owner, not a rewrite".

### L6.02-36 · UNSETTLED · 1 lens

- **Where.** Line 22, "`.maestro/`, with the decision log and command log (`audit.jsonl`)"; line 57, "`@maestro` commands write to its decision log…"; line 122, "persist decisions and next steps"; line 129, "appends an entry to the decision log (`decisions.jsonl`)"; line 130, "the last five decisions".
- **Finding.** The decision log is stated in three sections.
- **Raised by.** Lens 2, A2.
- **Check.** `bash C/sections-of.sh C/visible.md 'decision'` prints `3 section(s): Getting started [2]; Commands [1]; Memory across sessions [2]`.
- **Round.** Earlier. Line 57 was reworded by 02, but 01's line 57 named the decision log too.
- **Why UNSETTLED.** As 35.

### L6.02-37 · UNSETTLED · 1 lens

- **Where.** "command log (`audit.jsonl`)" on lines 22, 57 and 133; "Analyze command history — which skills work, which fail" on line 102, the `/reflect` row; "from those logs" on line 131.
- **Finding.** The log `/reflect` reads is stated in three sections under two names, "command log (`audit.jsonl`)" and "command history", although A4 §7 wants it written "always with the file name".
- **Raised by.** Lens 2, A3.
- **Check.** `bash C/sections-of.sh C/visible.md 'command log|audit\.jsonl|command history'` prints `3 section(s): Getting started [2]; Commands [1]; Memory across sessions [1]`. W10 passes because it looks only for "command log".
- **Round.** Earlier. Lines 57 and 133 were reworded by 02, but 01's lines 57 and 133 named the command log too.
- **Why UNSETTLED.** "Command history" is in the owner's verbatim one-liner (A2 §2), which stands against A4 §7. Skeleton part 4 says "history" is the extension's own command history.

### L6.02-38 · UNSETTLED · 1 lens

- **Line 9,** the tool list quoted at 25.
- **Finding.** Windsurf, where the extension runs (lines 22 and 50), is missing from the opening's list, which is the list a reader uses to tell whether Maestro fits their tool.
- **Raised by.** Lens 2, X2.
- **Check.** `sed -n 9p "$D" | grep -c Windsurf` prints `0`; `grep -n -o Windsurf "$D"` prints lines 22 and 50.
- **Round.** Earlier.
- **Why UNSETTLED.** The list is P §2's, which is the owner's, rendered by 2.1.

### L6.02-39 to L6.02-51 · lens 2's water rows · 1 lens each

- **Finding, for each row.** The quoted words carry nothing the reader needs at that point; the reason is in lens 2's table.
- **Raised by.** Lens 2, water.
- **Check.** `bash C/water-check.sh` prints `on-line=1` and the word counts for each row (`C/water-check.txt`).
- **Round.** Earlier, for every row. Row 11's line 17 was reworded by 02, but elsewhere in the sentence.

| Id | Line | Quoted phrase | Keep instead (lens 2) | Saved | Category | Note |
|---|---|---|---|---|---|---|
| L6.02-39 | 50 | "get it from [Open VSX](…), the open registry VS Code forks install from." | "get it from [Open VSX](…)." | 8 | UNSETTLED | T22's gloss, which 2.2c prescribes |
| L6.02-40 | 46, 66, 87 | "See [First run](#first-run) for what these two give you." | "See [First run](#first-run) for what they give." | 6 | SENTENCE | on line 66, see 06 first |
| L6.02-41 | 27 | "Run this in the root of the project you work in:" | "Run this in your project's root:" | 5 | SENTENCE | lens 2 marks no owner's word, but the phrase is A3 (a)'s own (skeleton 1.1) |
| L6.02-42 | 85 | "The server serves the skills on request; unlike the other two routes, it installs none of them into your project." | "The server serves the skills on request and installs none of them into your project." | 5 | SENTENCE | |
| L6.02-43 | 127 | "These are your own sessions, with your coding agent — kept in the `.maestro/` folder of your project." | "Your sessions with your coding agent are kept in your project's `.maestro/` folder." | 5 | SENTENCE | keeps A4 §8's "whose sessions" |
| L6.02-44 | 9 | "carries a record of your sessions into the next one (see [Memory across sessions](#memory-across-sessions))." | "carries a [record of your sessions](#memory-across-sessions) into the next one." | 4 | SENTENCE | the clause is also 07's |
| L6.02-45 | 11 | "and 7 reference files the core skill reads when it needs them." | "and 7 reference files the core skill reads." | 4 | UNSETTLED | T13's gloss, which 2.1 prescribes |
| L6.02-46 | 21 | "The skill folders, into a skills folder of the project;" | "The skill folders, into a skills folder;" | 3 | SENTENCE | lens 2 marks no owner's word, yet these are 2.2a's cell words, which lens 2's own X1 sends to the owner |
| L6.02-47 | 9 | "The commands diagnose it, fix and improve it, or extend it," | "The commands diagnose, fix and improve, or extend it," | 2 | SENTENCE | |
| L6.02-48 | 17 | "Maestro reaches your coding agent by one of three routes:" | "Maestro reaches your coding agent by three routes:" | 2 | SENTENCE | the next sentence already says to pick one |
| L6.02-49 | 50 | "Install the extension `sharpdeveye.maestro-workflow` from" | "Install `sharpdeveye.maestro-workflow` from" | 2 | SENTENCE | |
| L6.02-50 | 9 | "or VS Code's own chat" | "or VS Code's chat", P §2's words | 1 | SENTENCE | |
| L6.02-51 | 35 | "into its skills folder in the project yourself:" | "into its skills folder in the project:" | 1 | SENTENCE | |

### L6.02-52 · METHOD · 1 lens

- **Where.** Skeleton 3.3, rule 11's check; lines 33 and 91 of `D`.
- **Finding.** Rule 11's check greps `unless|only if|except when|as long as|provided that`, so a bare "except" passes it. There are two: "except `/teach-maestro`" on line 33 and "except this one" on line 91.
- **Raised by.** Lens 7, 2.2 ("Missed by 3.3's check").
- **Check.** `grep -c -i -w -E 'unless|only if|except when|as long as|provided that' C/visible.md` prints `0`, while `grep -n -w 'except' "$D"` prints lines 33 and 91.
- **Round.** Earlier.
- **Edit.** Add `except` to the pattern. That changes the skeleton, so it needs the owner's word.

### L6.02-53 · METHOD · 1 lens

- **Where.** `R/skeleton.md`, lines 1023–1029, *Decisions after the agreement*.
- **Finding.** Decisions 2 and 3 carry no owner's answer, although the section's own header quotes rewrite step 6: "every structural decision after the agreement, with the user's answer". So the round's repairs of skeleton wording (decision 2) and its over-budget block (decision 3) stand without the owner's word.
- **Raised by.** Lens 2, in its reading of the younger decisions.
- **Check.** `sed -n '1023,1029p' "$R/skeleton.md"`.
- **Round.** Round 02's record.

### L6.02-54 · METHOD · YOURS, implied by lens 1 F17 and the record

- **Where.** `R/edits/02.json`, edit 2 (line 133), claim "(a) each command-log line holds duration, ~tokens, ~cost".
- **Finding.** The claim's check could not see 12's fault, so the verifier's HOLDS rests on it.
  - The claim asks that each line carry "the command's duration and its estimated token counts and estimated cost".
  - Its check matches only the field names `[duration_ms,token_usage,cost_estimate_usd]`.
  - Edit 3's own check printed `token_usage={"input":0,"output":260}` for the /diagnose wave S1 and passed it as the heuristic's figure.
- **Check.**
  - `jq -r '.[1].claims[2].asks' "$R/edits/02.json"`.
  - `jq -r '.[1].check.expect' "$R/edits/02.json" | tr ')' '\n' | grep 'S1 '` prints `… completed \[duration_ms,token_usage,cost_estimate_usd\]`.
  - `jq -r '.[2].check.expect' "$R/edits/02.json" | grep -o 'S1 figures: recorded token_usage=[^;]*'`.
- **Round.** Round 02's record.

### L6.02-55 · METHOD · YOURS, implied by `c4-2`, lens 1 and the judges

- **Where.** Lines 21 and 27–37; findings 29 and 30.
- **Finding.** The only level-3 evidence about the installer describes the upstream repository as it stood on 2026-09-24, not the snapshot.
  - That evidence comes from lens 4's runs of `npx skills add sharpdeveye/maestro`, which clone the upstream repository at run time. `c4-2` lists this as a harness departure.
  - Lens 1 and two round-01 judges, Astra and Sol, declined the same fetch under their briefs; the Opus judge left it unrun because part 7 accepts it unrun.
- **Check.**
  - `grep -n 'Allowed the installer to fetch' "$R/reviews/02/c4-2.md"`.
  - `grep -n 'Repository cloned' "$R/reviews/02/c4-1.md"`.
  - Lens 1's "Claims reached at level 1 only" (lines 21 and 33); `judges/astra.md`, "Open observations"; `judges/sol.md`, "Open verification".
- **Round.** —

### L6.02-56 · METHOD · YOURS, implied by lens 2's header and the record

- **Where.** `R/writer-02.md`, first paragraph.
- **Finding.** "Skeleton `skeleton.md` re-hashed: `c7c9a4f7…a46`" is true of the file's first 1,021 lines only. With *Decisions after the agreement* appended, the file hashes `28cb8478…`, the value lens 2 recorded. That was already its state when `writer-02.md` was last written: skeleton.md at 18:14, writer-02.md at 18:27.
- **Check.**
  - `head -n 1021 "$R/skeleton.md" | shasum -a 256` prints `c7bb7d0579d69dbc…`.
  - `shasum -a 256 "$R/skeleton.md"` prints `e7b27449ff8f2a3c…`.
  - `ls -l "$R/skeleton.md" "$R/writer-02.md"` shows the two times.
- **Round.** Round 02's record.

---

## Regressions of round 02

**None.** The record's definition: a sentence the round introduced or reworded, which a critic showed false or overstated, with the fault in the changed words. Round 02 reworded six sentences and introduced none. Each is considered below.

| Line | Edit | What changed | Findings on the sentence | Is the fault in the changed words? |
|---|---|---|---|---|
| 17 | (d) | "that" and "itself" cut from the MCP gloss | 48 (water in "one of three routes"); 33 (block budget) | No. Both findings sit in unchanged words, and 02 cut the block from 171 to 169 words. Verifier claim 10 holds. |
| 33 | (d) | ", `agent-workflow`," cut | 26 (rule 11, "except `/teach-maestro`"); 29 and 30 (the installer, GUESSED) | No. "Except" is 01's, and the installer gaps sit in no word. Verifier claim 9 holds, and lens 2 found the scope word uncontradicted. |
| 57 | (a) | "each `@maestro` run adds a line to the decision log and to the command log" became "`@maestro` commands write to its decision log and command log" | 35–37 (repetition across sections) | No. 01's line 57 carried the same concepts, and no critic shows the new words false. `c5-3` answered from them without a guess. Verifier claim 1 holds. |
| 93 | (c) | "interviews you … and saves the answers" became "asks your coding agent to interview you … and save the answers" | 01 (the clause after it); 06 (line 66, with `c5-4`) | No. F11, B1 and 2.3 fault the unchanged clause, and F8 faults line 66. The new words did not stop the reader expecting the file (`c5-4`: "You know it worked when `.maestro.md` is saved"); that is recorded at 06, and it is not a regression. |
| 133 | (a) | rebuilt around "Only the extension writes the command log", with "each with the command's" for 01's "with its" | 12 (F17); 05 (B3 reads its "Only") | No. F17's fault is in "~tokens and ~cost", 01's words, with the same referent. "Only" is 01's too. The verifier's three claims hold on the fields being present (see 54). |
| 135 | (b) | "within ±20%," cut, by the owner's decision 1 | 13 (F18) | No. The fault is in "useful for trends", 01's words, which the owner kept word for word. |

---

## Conflicts between critics

1. **Line 93, "read first instead" (01).**
   - Lens 1, F11: false. /teach-maestro's skill text never mentions `.maestro/context.md` (`grep` finds only `agent-workflow/SKILL.md:14`), and neither does its MCP prompt (C4: `teach-maestro prompt mentions ".maestro/context.md": false`).
   - The round-01 Opus judge: "X:93 'read first instead'" is true (`context.ts:4, :55-67`; `tools.ts:91-112`; `CHANGELOG.md:44`).
   - The round-01 Astra judge: the precedence belongs to the context readers, and step 1 is tied to it loosely.
   - The two sides cite different readers. YOURS, at level 2: the `@maestro` participant injects the matching sections of the context file, read from `.maestro/context.md` first, into every slash command, /teach-maestro included (`participant.ts:69-91`; `context.ts:11`; `context-slicer.ts:48-58`; `context-utils.ts:52, :92, :149-215`). So the clause holds on `@maestro` and fails on skill files and the MCP server.
2. **The remedy for lines 91 and 93 (01, 02).**
   - Lens 7: cut line 91 (3.1) and the clause on line 93 (2.3, with the owner's leave, A1 §5.4).
   - Lens 1: keep both facts and correct them. F10: `.maestro/context.md` also serves. F11: the clause is true of the other commands.
   - Lens 2: skips line 91's "in place first" as "inside the condition that every route leads to", and lets "instead" decide B1.
   - Skeleton part 5 names line 91 as the stand-in for *When Something Goes Wrong*, and the three round-01 judges held lines 91–94 as a protected passage.
3. **Line 142 (03).**
   - Lens 7, 3.2: cut the item; no clause of the purpose needs version history.
   - Lens 2, row 3: keep the link and drop the label, whose name already says it. That needs the owner's word, since 2.5's device prescribes a label.
   - Lens 1, F21: the label is false as worded.
   - A2 §3 names `CHANGELOG.md` as the home of the history.
4. **Line 56, "8 precision rules" (16).**
   - Lens 1, F6, and the round-01 Opus judge (S-d): understated. The block is the whole skill (C5/E3: 76 lines, with six headings besides the rules).
   - The round-01 Astra judge: acceptable, because "X/Y do not say 'only eight rules'" (`zero-defect/SKILL.md:20–33` holds the eight).
5. **Line 83, "the other clients" (19).**
   - Lens 1, F9, and the round-01 Opus judge: `mcp-server/README.md` configures no other clients (`:21, :34, :47`).
   - The round-01 Sol judge scored Z's *Getting started* "No" for dropping the same hand-off, because the chooser promises "Any MCP client".
   - The owner's A5 prescribes the words.
6. **Line 23, the MCP cell (04).**
   - Lens 1, F3, and lens 2, X1: understated, in a column readers choose by.
   - The round-01 Astra judge: the cell says "no skill files", not "no project writes" (it noted `tools.ts:426–465`).
7. **The installer (29, 30, 55).**
   - Lens 4 (`c4-1`, `c4-2`) ran `npx skills add sharpdeveye/maestro` and found no untrue sentence: `Installed 25 skills`, with 25 `SKILL.md`, 7 references and `skills-lock.json`.
   - Lens 1 and the round-01 judges Astra and Sol did not run it, because it fetches the upstream repository their briefs exclude; the Opus judge left it unrun, as part 7 allows. For them, lines 21 and 33 stay at level 1.
8. **The block budget (33).** This one sets a critic against the record.
   - Lens 2, 1.1: a violation, because decision 3 carries no owner's answer.
   - Writer-02 (departure 5) and decision 3: "reported, not a gate".
9. **Lens 2 against itself (41, 46).** Rows 4 and 9 are marked "no owner's word".
   - Row 4's phrase is A3 (a)'s own, "in the root of the project you work in" (skeleton 1.1).
   - Row 9's words are 2.2a's cell, and lens 2's own X1 sends that cell to the owner.
10. **Two readers on one problem (28).**
    - `c4-2`: `/capture` at the end of a session, then `/recap` at the start of the next, marked GUESSED.
    - `c5-5`: `/recap` alone, not marked GUESSED, with the answer drawn from two sections.

---

## What the wave did not cover

- **A real agent or editor.** No critic ran a Maestro command with a live coding agent or in a real VS Code.
  - On skill files and the MCP server, these rest on the skills' text, at level 2: /teach-maestro's interview and save (line 93), /diagnose's report (line 94), and /capture, /recap and /reflect (lines 129–131).
  - Lens 4 stopped at the chat boundary, and lens 1's `@maestro` runs used a mocked host and a mocked model.
  - Writer-02's H1 is unrun: whether `@maestro /diagnose` stops at "you MUST run /teach-maestro first" with a real model.
- **Cursor, Windsurf, Antigravity.** Nobody checked whether the extension runs there, whether it offers `@maestro`, or whether their agents load the synced skills (lens 1, level 1; writer-02, "not probed"). `c5-3` read line 57's logs as written in Cursor, and nothing checked that either.
- **Level 1 only, per lens 1.**
  - Which agent reads which folder (line 37).
  - Which registry each editor installs from (line 50).
  - Whether Claude Code reads `.claude/mcp.json` (line 55).
  - Claude Desktop's and Cursor's config files (line 70).
  - Antigravity's `servers` form (line 83).
  - What maestroskills.dev contains (line 139).
  - Also not opened: the badges (line 3) and the issues link (line 146).
- **The installer on the snapshot.** Only the upstream repository at run time was installed (55).
- **Line 85.** Lens 1's C2 log shows the wave lost after a restart, but its report gives no finding or verdict on the line. The log line in `$W/logs/mcp-wave.txt`: `status on server B -> Wave "w-mufpg9au-xtb7" not found. It may have expired or the server restarted. isError= true`.
- **An unexplained line in lens 1's own log.** With both context files present, `$W/logs/mcp-both.txt` prints `run_command diagnose: has A = false | has B = false`. F10's claim that the MCP server reads `.maestro/context.md` first rests on a project that holds that file alone (C3), and lens 1 does not say what this line means.
- **Device rules outside part 3's checks.** The skeleton allows bold lead-ins only in the extension's write list, in *First run*'s steps and in the memory loop (*Whole page*). Line 17 bolds the three route names: `sed -n 17p "$D" | grep -o '\*\*[^*]*\*\*'` prints `**skill files**`, `**VS Code extension**` and `**MCP server**`. The round-01 Opus judge flagged it, writer-02 left it "untouched", and no round-02 critic mentions it.
- **Lens 5's reach.** All eight questions were answered without a guess. None asked about the MCP route's first use, the manual folder list, Zero-Defect mode or the licence.
- **The verifier.** Its reads cover only the ten claims of the six edits (the final read: 10 of 10 hold); unchanged sentences were outside its brief. Its duty-4 note concerns the snapshot's other documents, not this page: `CHANGELOG.md:24, :32` and `reflect/SKILL.md:22` say "every command invocation", while the no-model and cancel paths log nothing.
- **Lens 7's reach.** It did not read `answers-07.md`, which was outside its brief, so it judged line 135 without knowing decision 1. It ran rule 7's fence check without the `json` diff; lens 2 ran both.

---

## Count by category

| Category | Count | Ids |
|---|---|---|
| SENTENCE | 30 | 01–04, 12, 14–18, 20–22, 24, 25, 28–30, 34, 40–44, 46–51 |
| STRUCTURE | 5 | 05–09 |
| CODE | 2 | 10, 11 |
| METHOD | 5 | 52–56 |
| SUPERSEDED | 5 | 13, 19, 23, 27, 32 |
| UNSETTLED | 8 | 26, 33, 35–39, 45 |
| SCOPE | 1 | 31 |
| **Total** | **56** | |

- **By lens count.** Three lenses: 01, 02, 03. Two lenses: 04, 05. One lens: the other 51.
- **YOURS.** Findings 11, 54, 55 and 56. Also, inside other entries: the scope note in 01, the combination in 05, the framing in 02's "Also", and the edit in 25.
