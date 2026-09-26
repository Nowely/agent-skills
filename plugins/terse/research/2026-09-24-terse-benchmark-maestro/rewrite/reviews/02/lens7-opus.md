# Lens 7: `02-repairs.md` against its purpose and skeleton part 3.3 (Opus)

**Read.** First the whole document, then each section: `02-repairs.md` (152 lines), `purpose.md` (P), `standin/answers-01.md` to `answers-06.md` (A1–A6), and `skeleton.md` part 3.3. The fourteen rules' own wording comes from `plugins/terse/skills/rethink/references/stages.md`.

**Not read.** `answers-07.md`, which falls outside the brief's `answers-0[1-6]`; the rewrite run's reviews and judges; the snapshot; the published README.

**3.3's checks, run on the document.** The checks 3.3 gives for rules 1, 2, 4, 5, 7, 9, 10, 11, 12 and 13–14 print what 3.3 says they print.
- For rule 7 only the fence-content check was run, not the json diff against the snapshot.
- Rule 1's `?` check and rule 2's word check each match only inside the badge URLs on line 3 (`?label=`, `maestro-workflow-mcp`). With link targets stripped, as in the visible copy, both print nothing.

The findings below are problems those checks miss.

**The middle.** It falls at a different line under each count:

| Count | Middle at line | Position |
|---|---|---|
| Visible words, fences out | 68 | 608 of 1,215 |
| Visible words | 70 | 619 of 1,238 |
| Lines | 76 | 76 of 152 |
| Raw tokens | 83 | 690 of 1,379 |

Lines 1–67 are above the middle on every count.

## 1. What each section buys — 0 findings

| Section | Lines | What it buys a reader who came for P §1 |
|---|---|---|
| Opening | 1–13 | Identity, in the project's own words (A1 §5.1). Whether Maestro fits the reader's tool and problem (P §1, ability 1: the tool list and "the AI workflow you're building", line 9). The size of the whole project (P §1's first sentence; line 11). Quick links for P §2's second group of readers (line 13). |
| Getting started | 15–94 | Abilities 2 and 3. The chooser (17–23) lets the reader pick a route by where it works, what it needs and what it writes. Each route block installs Maestro and runs the first two commands. *First run* says what those two commands give. |
| Commands | 96–123 | Ability 4, plus each command's source for P §2's second group (24 `SKILL.md` links). One pair of rows cannot be told apart: see 2.1. |
| Memory across sessions | 125–135 | The session loop in run order, which the owner leads with (A1 §5.5, A4 §8). The table's rows 122–123 name those commands but do not order them. Also the estimate rule (A1 §5.8, never-say 3). |
| Documentation | 137–142 | P §1's depth links: maestroskills.dev (139), the extension's page (140), the MCP server's page (141). For line 142, see 3.2. |
| Support and contributing | 144–148 | The one place a stuck reader can go (A2 §7), and P §1's contributor sentence (148). |
| License | 150–152 | Whether the project may be reused (A2 §6). |

No section buys nothing.

## 2. Rules broken — 3 findings

**2.1 — lines 104 and 116, rule 9.**

> `/streamline`: "Remove unnecessary complexity, flatten over-engineering"
> `/temper`: "Reduce over-engineering, simplify overbuilt workflows"

- **Rule 9's words:** "A table whose rows all say the same thing proves sameness by looking identical."
- **Why it applies here:** 3.3 adopts rule 9 on the premise that "the commands differ by row", and these two rows do not.
- **What it fails:** P §1, ability 4 ("find the command for their next problem in the command table"). A reader whose workflow is overbuilt gets two rows, and the only thing to choose by is the Group cell.
- **No cut.** A2 §2 puts all 24 names in the table, each with the owner's one-line description.

**2.2 — line 33, rule 11.**

> "Install all 25 — every command except `/teach-maestro` loads the core skill first."

- **The reason and its caveat:** the reason is A3 (a)'s ("Every command starts by invoking the core skill"). On the page it needs "except `/teach-maestro`" to be true. Rule 11 covers exactly this case: "A sentence that needs a caveat to be true says too much: say less".
- **The instruction stands alone:** "Install all 25 skills" is A3 (a)'s own decision. P §1, ability 2, needs the instruction, not its reason.
- **Missed by 3.3's check:** the rule-11 grep looks for `except when`, so a bare `except` passes it.
- **Cut:** "— every command except `/teach-maestro` loads the core skill first" (9 words). "Install all 25." remains.

**2.3 — line 93, rule 11, and rule 3 beyond the cases 3.3 exempts.**

> "if `.maestro/context.md` already exists, that is read first instead."

- **What the clause qualifies:** step 1 says `/teach-maestro` "asks your coding agent to interview you … and save the answers as `.maestro.md`".
- **Its two words disagree.** "First" reads as *before the interview*. "Instead" reads as *in place of the interview*, or *in place of `.maestro.md`*. The reader cannot tell whether step 1 still interviews them.
- **The reader cannot act on the condition.** The page never says what `.maestro/context.md` is or what writes it. Its only other mention, line 57, says just that it "stays versioned". P §1, ability 3, does not need the clause.
- **Rule 3:** 3.3 exempts only route consequences, the wave note and the estimate note from rule 3. This clause is none of them.
- **Cut:** "; if `.maestro/context.md` already exists, that is read first instead" (9 words). The owner has to allow this cut, because A1 §5.4 lists the fact ("If `.maestro/context.md` exists, it is read first").

## 3. Water at the paragraph level — 2 findings

**3.1 — line 91.**

> "Every command needs `.maestro.md` in place first — except this one."

- **Already carried elsewhere:** P §1, ability 3 ("run `/teach-maestro` once, then a first command such as `/diagnose`") is covered by the steps on lines 93–94 and by every route's first-use lines (41–44, 59, 61–64, 87). All of them put `/teach-maestro` first.
- **What the paragraph adds:** only the reason, and it needs a caveat to state it (rule 11).
- **Unclear reference:** "this one" points at a command the section has not named yet. It is named on line 93.
- **Cut:** the whole paragraph (10 words).

**3.2 — line 142.**

> "[Changelog](CHANGELOG.md) — what changed in each version"

- **No clause of the purpose needs version history.** P §1 "links to the Marketplace page, the npm page and maestroskills.dev for depth". P §2's second group comes "for the full command list, the source, or to contribute".
- **The one argument for keeping it:** A2 §3 names `CHANGELOG.md` as the place where history lives.
- **Cut:** the list item (6 words). Low stakes.

## 4. Technical detail above the middle — 0 findings

These are the technical details in lines 1–67, with the owner answer that places each one:

| Detail | Lines | Owner answer |
|---|---|---|
| The count line | 11 | Must-say 2, A1 §5.2 |
| The chooser's *Writes into your project* column | 21–23 | A5 asked for all four of the extension's writes here |
| The installer's lock file and its choice of folders | 33 | A3 (a) |
| The manual folder list | 35–37 | A3 (b), A2 §11a |
| The two registries | 50 | A2 §11d |
| The extension's four writes | 52–57 | A2 §4, A1 §5.7, A3 (c) |
| The command palette titles | 59 | A2 §11b |

Each is either an owner must-say or a route consequence placed where 3.3 puts it when it sets rule 3 aside ("The reader chooses a route by its consequences, so they sit where the choice is made"). One addition on line 33 has no owner answer behind it: "except `/teach-maestro`". It is counted once, at 2.2.

## 5. The opening's first sentence — 1 finding

**Line 7, "Workflow fluency for AI coding agents.": no finding.**
- It is must-say 1 (A1 §5.1), and the owner fixed it whatever the probe showed (A5: "If readers take it for a development method, fix the paragraph under it, not the tagline").
- It passes rule 2.
- 3.3's rule-1 check tests the line after the tagline, so rule 1's work falls to the first sentence of line 9.

**5.1 — line 9, first sentence, rule 1.**

> "Maestro gives your coding agent — Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity, or VS Code's own chat — commands for the AI workflow you're building: its prompts, context, tools, agents, retrieval, evaluation and guardrails."

- **Rule 1:** "Open with the problem and the goal." The sentence opens instead with a list:
  - Of its 37 words, the first 21 are "Maestro gives your coding agent" and ten tool names.
  - Its object, "commands for the AI workflow you're building", starts at word 22.
  - What the commands do ("diagnose it, fix and improve it, or extend it") waits for sentence 2.
  - The sentence names no problem.
- **Why it applies here:** A5 moved the fix for a misread tagline into this paragraph. The words that make that fix, "the AI workflow you're building", arrive only after 16 words of coding-tool names.
- **Against P §1, ability 1:** the sentence answers "fits their tool" before "fits their problem".
- It passes rule 2.
- **No cut.** The list is P §2's tool list, and the owner approved the opening's shape (skeleton 2.1, which lists the tools there; A5 as corrected by A6). The problem is where the list sits in the sentence, and a cut would lose it altogether.

---

Findings per item: 1 — 0 · 2 — 3 · 3 — 2 · 4 — 0 · 5 — 1.
