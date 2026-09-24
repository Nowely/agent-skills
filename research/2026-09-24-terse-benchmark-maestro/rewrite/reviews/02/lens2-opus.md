# Lens 2: the mechanical rules, the water, the contradictions. Critic: Claude Opus

**Document.** `D=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260924-150946-maestro-readme-rewrite/02-repairs.md`,
152 lines, SHA-256 `20b8ea66842cac9a9031c1a57c8818d61e0fcf7d7052475070c636aae82bae3b`. Line numbers are the
document's. **Rules:** `skeleton.md` beside it (SHA-256 `28cb8478e4083fc7a68d94bf474326861d08a481975931467b05b785224a5483`)
and `plugins/terse/skills/rewrite/references/writing-rules.md`.

**The younger decisions** ("Decisions after the agreement", at the end of the skeleton):

- **Applied: decision 1.** The owner's answer to question set 07: "Drop '±20%'". W7's third count therefore passes
  at `0`, not at the `1` that part 3.5 prints.
- **Not applied as governing: decision 3.** It reads "2.2a's block budget, 150 … reported, not a gate", but it records
  no answer from the owner. So the S3 block budget of 150 stands, and the draft's overrun is reported below as a
  violation. If decision 3 does govern, lens 1 is clean.
- **Decision 2** (wording repairs, no answer from the owner) collides with no part-3 command. Lens 3 reads the repaired
  wordings as they stand in the draft.

**How the checks ran.** I ran the 38 inline commands of part 3 and the visible-copy `sed` exactly as written. Each
command string appears verbatim in `skeleton.md` (`grep -c -F` prints `1` for all 38 and for both `sed` lines).
`concepts.json` and `budgets.json` were extracted from the skeleton's two fences. One change: `C` is
`$TMPDIR/terse-bench-lens2-opus-02`, not `$TMPDIR/maestro-readme-checks`, so that critics running at the same time
cannot overwrite each other's `visible.md`. R7b reads the snapshot's `mcp-server/README.md:24-31`, as the rule says. L2
only tests whether link targets exist.

To reproduce:

```bash
bash /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench-lens2-opus-02/run.sh          # lens 1; transcript.txt holds the last run
bash /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench-lens2-opus-02/water-check.sh  # lens 2; the rows are in water.txt
```

## Lens 1: the mechanical rules. 1 violation

**1.1 The block budget of the lead-in and chooser (lines 15–23): 169 words against 150, which is 19 over.**
The S3 check
`awk '/^## /{b=$0;next} /^### /{b=$0;next} b!=""&&NF{w[b]+=NF} END{for(k in w)print w[k]"\t"k}' "$C/visible.md"`
prints `169	## Getting started`. The rule is S3: "`## Getting started` (the lead-in and chooser) ≤ 150"; the
budget is in 2.2a.

- The water in this block (lens 2, rows 9 and 11) comes to 5 words, which does not close the gap. The rest is the
  extension's four writes (A5) and the lead-in's glosses (2.2a).
- The skeleton's item 1.3.4 makes a block over its budget a question for the owner.

**Every other check is clean:**

| Check | Output | Passes |
|---|---|---|
| V | nothing; `visible.md` exists | yes |
| S1 `rule1.mjs --cut "Getting started"` | `0 violation(s), 0 excused` | yes |
| S2 `dup.mjs` | `0 concept(s) in three or more sections`; every concept inside the homes its name gives | yes |
| S3 `sections.mjs` | `1221 TOTAL, 0 section(s) over budget` | yes |
| Rule 1 (two commands) | `ok`; nothing | yes |
| Rule 2 | `0` | yes |
| Rule 4 | `1 Node 20`, `1 VS Code 1.95`; `0` | yes |
| Rule 5 | `### Skill files: ok`, `### MCP server: ok` | yes |
| Rule 7 | the five fenced lines, in order; `diff` prints nothing | yes |
| Rule 9 | `2`; `24` | yes |
| Rule 10 | `` ```bash ``, `` ```text ``, `` ```text ``, `` ```json ``; nothing | yes |
| Rule 11 | `0` | yes |
| Rule 12 | nothing | yes |
| Rules 13–14 | `0` | yes |
| H | the eleven headings, in order | yes |
| T | `25` | yes |
| L1, L2 | nothing, nothing | yes |
| W1–W6 | nothing, each | yes |
| W7 | `1`, `1`, `0` (the third by decision 1) | yes |
| W8 | nothing; `1` `1` `1` | yes |
| W9 | `## Memory across sessions`, `(opening)` | yes |
| W10, W11 | nothing; nothing, `0` | yes |

**Words against budget.** Sections are counted by `sections.mjs`; the blocks of *Getting started* by the S3 `awk`.

| Section / block | Words | Budget | Difference |
|---|---|---|---|
| (opening) | 112 | 120 | −8 |
| Getting started | 692 | 700 | −8 |
| — lead-in and chooser | 169 | 150 | **+19** |
| — Skill files | 125 | 130 | −5 |
| — VS Code extension | 199 | 200 | −1 |
| — MCP server | 114 | 120 | −6 |
| — First run | 72 | 85 | −13 |
| Commands | 192 | 340 | −148 |
| Memory across sessions | 131 | 150 | −19 |
| Documentation | 37 | 40 | −3 |
| Support and contributing | 54 | 70 | −16 |
| License | 3 | 12 | −9 |
| Total | 1,221 | 1,432 | −211 |

## Lens 2: the water. 14 findings, 54 words

The rows are ranked by words saved. A word is a whitespace token, the unit `sections.mjs` counts. Link targets
contain no spaces, so the raw and visible counts agree.

**Check:** `water-check.sh` prints `on-line=1` for every row, meaning the quoted phrase is on that line, followed by
the two word counts. Its output is saved in `water-check.txt`.

The last column marks words the skeleton itself prescribes: cutting them changes the skeleton, not only the draft, so
they need the owner's word.

| # | Line | Quoted phrase | Keep instead | Saved | Owner's word |
|---|---|---|---|---|---|
| 1 | 50 | "get it from [Open VSX](…), the open registry VS Code forks install from." | "get it from [Open VSX](…)." The same sentence already says that Cursor, Windsurf and Antigravity get it there, and line 22 calls them VS Code's forks | 8 | yes: the gloss T22 prescribes |
| 2 | 46, 66, 87 | "See [First run](#first-run) for what these two give you." | "See [First run](#first-run) for what they give.", on each of the three lines | 6 (2 × 3) | no |
| 3 | 142 | "[Changelog](CHANGELOG.md) — what changed in each version" | "[Changelog](CHANGELOG.md)". The label already says what the page holds | 6 | yes: prescribed by the 2.5 device |
| 4 | 27 | "Run this in the root of the project you work in:" | "Run this in your project's root:". Where to run it stays | 5 | no |
| 5 | 85 | "The server serves the skills on request; unlike the other two routes, it installs none of them into your project." | "The server serves the skills on request and installs none of them into your project." The chooser already compares the routes; the limit stays word for word | 5 | no |
| 6 | 127 | "These are your own sessions, with your coding agent — kept in the `.maestro/` folder of your project." | "Your sessions with your coding agent are kept in your project's `.maestro/` folder." It still says whose sessions they are (A4 §8) | 5 | no |
| 7 | 9 | "carries a record of your sessions into the next one (see [Memory across sessions](#memory-across-sessions))." | "carries a [record of your sessions](#memory-across-sessions) into the next one." The link stays (2.1) | 4 | no |
| 8 | 11 | "and 7 reference files the core skill reads when it needs them." | "and 7 reference files the core skill reads." | 4 | yes: the gloss T13 prescribes |
| 9 | 21 | "The skill folders, into a skills folder of the project;" | "The skill folders, into a skills folder;". The column head already says "Writes into your project" | 3 | no |
| 10 | 9 | "The commands diagnose it, fix and improve it, or extend it," | "The commands diagnose, fix and improve, or extend it," | 2 | no |
| 11 | 17 | "Maestro reaches your coding agent by one of three routes:" | "Maestro reaches your coding agent by three routes:". The next sentence already says to pick one | 2 | no |
| 12 | 50 | "Install the extension `sharpdeveye.maestro-workflow` from" | "Install `sharpdeveye.maestro-workflow` from". It sits under `### VS Code extension` | 2 | no |
| 13 | 9 | "or VS Code's own chat" | "or VS Code's chat", the wording of P §2 | 1 | no |
| 14 | 35 | "into its skills folder in the project yourself:" | "into its skills folder in the project:" | 1 | no |

**Totals.**
- 36 words can go on the writer's decision alone; 18 need the owner's word (rows 1, 3 and 8).
- By block: opening 11 (rows 7, 8, 10, 13); lead-in and chooser 5 (rows 9, 11); Skill files 8 (rows 2, 4, 14); VS Code
  extension 12 (rows 1, 2, 12); MCP server 7 (rows 2, 5); Memory across sessions 5 (row 6); Documentation 6 (row 3).

**Skipped because each is a condition, a limit or a warning at a point where the reader decides.** I would otherwise
have cut each one. The check is the same `sed -n '<line>p' "$D" | grep -c -F -- '<phrase>'`, which prints `1` for
every row below.

| Line | Phrase | Why it is skipped | Words it would save |
|---|---|---|---|
| 133 | "its lines come from commands run through `@maestro` in VS Code's chat" | a limit on which runs are logged; it restates line 57 in another section | 12 |
| 33 | "it installs the skills into this project," | a limit: the install is per project, not global (A3 (a)). The line before says where to run the command, not where the skills land | 6 |
| 54 | "— and only that file —" | a limit on what the extension copies | 6 |
| 148 | "After a change," | a condition: when to run the checks | 3 |
| 91 | "in place first", in "Every command needs `.maestro.md` in place first — except this one." | inside the condition that every route leads to | 2 |
| 93 | "that is read first instead" | inside a condition; "first" and "instead" point in different directions (lens 3, pair B1) | 1 |
| 22 | "Also", in "Also an MCP server entry" | it marks where "At every start:" stops applying | 1 |

**Not proposed, because the words or their placement are the owner's:**
- the tagline;
- the 24 command descriptions (A2 §2);
- line 135 (decision 1: "word for word");
- "Interactive showcase and documentation" (A2 §10);
- the quoted `.gitignore` header and the palette titles;
- the chooser's extension cell, which restates the write list (A5, `answers-05.md:15–17`).

## Lens 3: duplication and contradiction. 6 findings

The checks prove the quotes. Each conflict is my reading of them, a hypothesis: nothing was run, and the code was not
opened.

### A. Facts stated in three or more sections: 3

S2 passes because its patterns do not match these wordings: "persist decisions", "command history", "record of your
sessions". In all three findings, the Commands occurrence is an owner-verbatim description (A2 §2). The skeleton's rule
under S2 makes such a case "a question to the owner, not a rewrite".

**Check:** `bash /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench-lens2-opus-02/sections-of.sh "$C/visible.md" '<pattern>'`
prints the sections whose visible lines match. `grep -n -i -E '<pattern>' "$D"` prints the lines.

**A1. Your sessions are recorded and carried into the next one.** Pattern `session` →
`4 section(s): (opening) [1]; Getting started [1]; Commands [2]; Memory across sessions [2]`.
- (opening), line 9: "Maestro carries a record of your sessions into the next one"
- Getting started, line 57: the `.gitignore` "is headed "Maestro session data — opt-in to version control,""
- Commands, lines 122–123: "Save a session summary — persist decisions and next steps"; "Quick summary of the last
  session"
- Memory across sessions, lines 127–129: "These are your own sessions, with your coding agent — kept in the `.maestro/`
  folder of your project."; "saves a session summary to `.maestro/sessions/`"

**A2. Decisions are kept in a decision log.** Pattern `decision` →
`3 section(s): Getting started [2]; Commands [1]; Memory across sessions [2]`.
- Getting started, line 22: "`.maestro/`, with the decision log and command log (`audit.jsonl`)"; line 57: "`@maestro`
  commands write to its decision log and command log (`audit.jsonl`)"
- Commands, line 122: "persist decisions and next steps"
- Memory across sessions, line 129: "appends an entry to the decision log (`decisions.jsonl`)"; line 130: "the last five
  decisions"

**A3. The log of command runs that `/reflect` reads, under two names.** Pattern
`command log|audit\.jsonl|command history` → `3 section(s): Getting started [2]; Commands [1]; Memory across sessions [1]`.
- Getting started, lines 22 and 57: "command log (`audit.jsonl`)"
- Commands, line 102: "Analyze command history — which skills work, which fail" (`/reflect`)
- Memory across sessions, line 131: "`/reflect` — scores Maestro's own commands from those logs"; line 133: "Only the
  extension writes the command log (`audit.jsonl`)"

On this page, "command history" can only mean these logs, yet A4 §7 says the log is written "always with the file name".
W10 passes because it only looks at the words "command log".

### B. A scope word, and a sentence elsewhere that says the thing can happen: 3

**Check:** `sed -n '<line>p' "$D"` for each line of the pair.

**B1. "Every" (line 91) against "instead" (line 93).**
- Line 91: "Every command needs `.maestro.md` in place first — except this one."
- Line 93: "if `.maestro/context.md` already exists, that is read first instead."

"Instead" can be read as `.maestro/context.md` taking the place of `.maestro.md`, or of the interview. Read that way, a
project whose context is in `.maestro/context.md` runs commands without `.maestro.md`, which line 91 rules out. Read as
"read first, then the interview", the two sentences agree. The word "instead" decides between the readings.

Line 91's exception, "this one", names no command either; the reader only meets `/teach-maestro` on the next line.

**B2. "Every start" (line 54) against the contributor's trial (line 148).**
- Line 54: "into the ten skills folders of the first folder in your workspace, rewritten at every start; edits to those
  copies are lost."
- Line 148: "`npm run build`, which copies the skills into the ten skills folders of this clone so you can try the change
  there with a coding agent"

Take a contributor whose editor runs the extension (VS Code, Cursor, Windsurf or Antigravity, per line 22) and whose
first workspace folder is the clone. By line 54, the next start of the editor rewrites the copies that the build made.
Line 148 says they stay there to be tried. The page does not say whether the extension writes into a clone of its own
repository.

**B3. "Only" (line 133) against the cost and duration that `/reflect` reports (line 131).**
- Line 133: "Only the extension writes the command log (`audit.jsonl`): its lines come from commands run through
  `@maestro` in VS Code's chat, each with the command's duration, ~tokens and ~cost."
- Line 131: "`/reflect` — scores Maestro's own commands from those logs: usage, completion rate, ~cost, and duration."

The command log is the only source of cost and duration the page names, and only the extension writes it. Yet line 131
promises cost and duration in a section addressed to the reader of every route (line 127: "These are your own sessions,
with your coding agent"). By line 133, a reader on skill files or the MCP server has no data for two of those four
measures.

**Scope claims I checked that no other sentence contradicts:**
- line 11 "you never run directly"
- line 22 "At every start"
- line 33 "every command except `/teach-maestro` loads the core skill first"
- line 54 "and only that file". Its tension with line 11's "7 reference files the core skill reads" was settled by the
  owner in decision 4 of the skeleton's part 7.
- line 85 "held only by the running server" and "installs none of them"
- line 141 "everything the server offers"
- line 148 "the only place to edit" and "installs into no other project"
- the default on line 17, "start with skill files"
- line 23 "Any MCP client"
- line 52 "without asking"

**Check:** `grep -n -o -i -w -E 'nothing|never|only|always|by default|every[a-z]*' "$D"` lists the brief's scope words:
lines 11, 22, 33, 54, 85, 91, 133, 141 and 148. `grep -n -o -i -w -E 'none|no other|all|any|each|without|except' "$D"`
lists the near variants.

## Outside the three lenses (not counted)

**X1. In the chooser's column of writes, `.maestro/` and the decision log appear only on the extension's row.**
- Check: `for n in 21 22 23; do sed -n "${n}p" "$D" | grep -c -F '.maestro/'; done` prints `0`, `1`, `0`.
- Line 129 has `/capture` append to the decision log with no route named, and line 93 has `/teach-maestro` write
  `.maestro.md` on every route.
- A5 says "readers choose a route by this column". Such a reader concludes that skill files and the MCP server write no
  `.maestro/`.

The cells are prescribed by 2.2a, so this is a question for the owner.

**X2. Windsurf is missing from the opening's list of tools.**
- Check: `sed -n 9p "$D" | grep -c Windsurf` prints `0`.
- The extension runs in Windsurf: `grep -n -o Windsurf "$D"` prints lines 22 and 50.
- The first ability in P §1 is to "tell whether Maestro fits their tool".

The list is the one in P §2, so this is a question for the owner.
