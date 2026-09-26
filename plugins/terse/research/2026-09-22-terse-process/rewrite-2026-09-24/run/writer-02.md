# Writer report — round 02 (`02-grafts.md`), G4, 2026-09-24

The verifier sent the round back once. The second build changes only `asks` and `check`, and the text is
byte-identical. The sections down to *What I could not do* describe the build the verifier read; *Sent back*,
at the end, gives what changed and the counts now.

Run directory: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2`.
Code: `/Users/ruliny/Git/agent-skills`, HEAD `b5a082b`, whose only change after `f97eb4a` is under `research/`
(`git diff --stat f97eb4a HEAD` lists 17 research files, nothing under `plugins/`); `git status` empty before
and after. Built by `edits/02.build.mjs` from 01's own bytes; produced by
`round.mjs 01-candidate.md 02-grafts.md edits/02.json --ledger ledger.json`, exit 0 (`probe-02/round-02.log`).

Regenerated once before any critic: the first build's C01 check printed `plugin.json:4`, and the 600-character
description pushed its output past the ledger's 2000-character `saw`, which then lost the rethink lines the
claim rests on. `02-grafts.md` removed, `ledger.02.json` copied back over `ledger.json`, C01's run narrowed,
regenerated; the round file's bytes are the same (SHA-256 `b4b3802b…7e64f8` both times). First build's logs:
`probe-02/round-02.first-build.log`, `checks-02.first-build.log`.

## The edits (18; 10 re-pin a sentence round 02 leaves as it was, `old` = `new`)

| # | Edit | What and why | Claims | Level, check |
|---|---|---|---|---|
| 1 | C01 re-pinned | the opening sentence, unchanged | C01 | 2 — plugin.json name; audit:4, 25–28; rewrite:4, 50, 66; rethink:4–5, 55 |
| 2 | C19 re-pinned, C18 dropped | the install fence, unchanged; the in-app form it replaced is gone by the skeleton | C19 | 3 — `probe-02/install.sh`: both commands exit 0 from GitHub, signed out |
| 3 | R02a new | graft Fable 1 / Astra 1: "You need: Node 22 or newer, and a signed-in Claude Code." Fable's form, not C:14's: the device's one "You need" line, where the exemplar lists "`codex` installed and signed in" (`09-reduction.md:22–26`); C:14 adds a sentence and "session" (terms row 32). l3 F2; coordinator's note 4 | R02a | 3 — `install.sh`: signed out, each skill "Not logged in · Please run /login", exit 1; a skill script without node exit 127, with Node 24.11.0 exit 0; audit and rewrite run node, rethink none; engines `>=22` |
| 4 | R02b new | the excerpt (below) | R02b | 3 — `probe-02/excerpt.sh` |
| 5 | C09 re-pinned, R02c new | graft Astra 2: "…if not, run `/terse:rethink` first to decide a new one: a skeleton, an outline you agree to." Only the explicit agreement from C:28; the gloss "outline" sits here because this is now the first sentence holding "skeleton" (rule 7) | C09, R02c | 2 — audit:166–171; rewrite:14–16, 37; rethink:4–5, 13–15, 148–149 |
| 6 | R02d new | graft Fable 3 with Astra's shared fault, at the decision: "It hands back a new draft of your whole document and its diff, each change against the original, in the plugin's own folder outside your repository. You decide whether the draft replaces your document." "a new draft of your whole document", not the note's "a whole new draft": the idiom reads "an entirely new draft", which the page does not promise | R02d | 2 — rewrite:66, 76–82, 87–92, 221–223; audit:33, 36–38 |
| 7 | R02e new | Fable's observation: "Restart Claude Code to apply it." after the update fence, the one clause the §2.2 device allows, placed as the exemplar places its reload clause after the install fence (`09-reduction.md:19–20`); "Update:" stays one lead word. No clause at the install: its run printed none | R02e | 3 — `probe-02/update.sh` then `install.sh` |
| 8 | C03 re-pinned | the table, unchanged; pattern over its three command rows | C03 | 3 — `update.sh`: installed from a copy of this checkout, `claude plugin details` "Skills (3) audit, rethink, rewrite" |
| 9 | C10 re-pinned | rethink's row, unchanged | C10 | 2 — rethink:4–6, 13–17, 148–149 |
| 10 | C11 re-pinned | Astra's shared fault: rewrite's row "A new draft of the whole document, and its diff" — "beside yours" gone; the place stays out of Skills (§2.3 excludes where anything is written; Quick start and How it works carry it) | C11 | 2 — rewrite:14–16, 24–28, 221–223 |
| 11 | C05 re-pinned | graft Fable 2 / Astra 3, each route as the pages have it: "`/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions" and "`/terse:rethink` → `/terse:rewrite` → `/terse:audit` for the first time". "again with the same questions" on both (the skeleton's device and both grafts) is false for an order that starts at rethink, as `writer-opus.md` b.2 found: a new question set is a new measurement (`measure.md:108–109`); terms row 16 says "the first audit". No comma, so the concept "back to audit" has its home | C05 | 2 — measure.md:106–109; audit:100–102, 170–171; rewrite:24–28; rethink:4–6 |
| 12 | C06 re-pinned | How it works item 1, unchanged | C06 | 2 — audit:13–16, 28, 76, 88, 91–92, 96–97; measure.md:14, 40; truth-pass.md:73–77 |
| 13 | C07 re-pinned | item 2, unchanged | C07 | 2 — audit:125–133 |
| 14 | C15 re-pinned | item 7, the folder line, unchanged | C15 | 2 — audit:33, 36–38, 44; rethink:31–32, 46; rewrite:76–77, 88–89, 172–173, 222–223 |
| 15 | C33 re-pinned | "One small trial; the gain could be chance (*p* = 0.25).", unchanged | C33 | 3 — p computed from 3 improvements, 0 reversals; prior-art.md:92–95; research/README.md:9 |
| 16 | C44 re-pinned | "The same questions were not run without the text.", unchanged | C44 | 2 — research/README.md:10; prior-art.md:104, 107; audit.md:995 |
| 17 | C24 re-pinned | "The same run took that README from 2,725 words to 2,571.", unchanged | C24 | 3 — `wc -w` 2725 and 2571; chain README:16, 20, 24 |
| 18 | R02f new, C42 and C43 dropped | graft Fable 4: "Never measured: whether a person reads the improved text better — only whether a model does." | R02f | 2 — audit.md:993, 995; measure.md:40; prior-art.md:130–132; research/README.md:10 |

No edit adds a qualifying form (the build counts them as `round.mjs` does); no `qualifies` given, none needed.
No passage of twenty words or more was cut: the one 21-word sentence replaced (edit 6) keeps the draft,
the diff, the change and the decision.

## The excerpt

`audit.md:1014–1015`, the Q7 entry's `missing` finding under *What broke* (the task and Fable cite 1013–1014;
the finding starts at 1014):

```text
`missing`: the owner's intent — the method holds for any text
in any language, code or not — appears in no page
```

The report's sentence is "Beside it, `missing`: … appears in no page, and no question can be answered on it
from the documentation." "documentation" is on the must-not list, so the span stops at the last clause
boundary before it; "Beside it," is left off because it points at the report's previous sentence. 22
whitespace tokens, 20 words; each line found by `grep -F` (1014, 1015), the two joined found once in the
normalised report; must-not words 0, reader pairs 0; the lead-in "From its report on this plugin's README,
2026-09-22:" is unchanged and the report's Score line reads "2026-09-22, README at 1a24018".

## Fable's two observations

- Restart. `probe-02/help.sh` (isolated, `env -i`, signed out): `claude plugin update --help` prints
  "Update a plugin to the latest version (restart required to apply)", exit 0. Made to happen in
  `update.sh`: a copy of this checkout bumped to 0.1.2, the README's two update commands exit 0 and the second
  prints "✔ Plugin "terse" updated from 0.1.1 to 0.1.2 for scope user. Restart to apply changes." Against
  GitHub (`install.sh`) both exit 0, "terse is already at the latest version (0.1.1)". What an open session
  does without the restart was not run.
- `concepts.json`: "a fix is not undone — How it works" was `undo(?:es)? a fix|make it worse|checked true|found
  false`; "make it worse" also matched the opening's "touching it may make it worse". Now
  `undo(?:es)? a fix|checked true|found false`. On `01-candidate.md`: 2 sections (opening, How it works) with
  the old file, 1 (How it works) with the new. The old file is `concepts.01.json` (SHA-256 `b485661c…`), the new
  one `6c16daa4…`. `skeleton.md` part 3 rule 3 still prints the old block at line 219; it is not edited, since
  its SHA-256 is the one the owner's agreement records.

## The ledger

31 entries after the round, 28 before it (`ledger.02.json`, SHA-256 `f5fddeeb…`).

- **Re-pinned, 13**, each under its own name, pattern on the sentence that now carries it: C01, C03, C05, C06,
  C07, C09, C10, C11, C15, C19, C24, C33, C44. Content the skeleton deleted is not in their `asks`: C05 loses
  "what broke … did it hold" (skeleton.md:324), C24 the 105/105 passes (:332), C33 McNemar's name and design
  (:337). C03's sentence ":7 Three skills." is deleted (:323) at the cost "none the table does not carry", so
  the claim is still in the document and is re-pinned on the table.
- **New, 6**: R02a (3), R02b (3), R02c (2), R02d (2), R02e (3), R02f (2).
- **Dropped, 3**, for the coordinator's row in `rounds.md`:
  - C18 — skeleton.md:329, part 5 ":42–45, the untagged `/plugin` fence"; §2.2 excludes "The in-app `/plugin`
    form" (:101); rule 5 wants `grep -c '/plugin'` = 0 (:248).
  - C42 — its sentence, `00-original.md:78–79`, closes the bullet part 5 deletes as ":76–79 'Five published
    writing standards…'" (skeleton.md:340); §2.5 excludes "The writing-standards experiment" (:165).
  - C43 — skeleton.md:341, part 5 ":81 'Not measured: which of the four passes produced the gain…'"; §2.5
    excludes "which pass produced the gain" (:165).
- C23 untouched and present. The 11 retired phrasings (C12, C13, C16, C20, C21, C27, C30, C39, C41, C45, C46)
  are absent from 02.
- No `saw` clipped (the longest, R02e, 1910 characters); 0 provisional, 0 unrun, 0 qualified.

## The checks (`probe-02/checks.sh` → `probe-02/checks-02.log`)

| Check | Result | Exit |
|---|---|---|
| `rule1.mjs 02-grafts.md --cut "How it works" --except "Quick start"` | 0 violation(s), 0 excused | 0 |
| the same without `--except`, the skeleton's rule 1 form | 0 violation(s) | 0 |
| `dup.mjs 02-grafts.md concepts.json` | 0 concept(s) in three or more sections | 0 |
| `sections.mjs 02-grafts.md budgets.json` | 4 sections over, total 661 of 625 | 0 |
| `ledger.mjs ledger.json 00-original.md 01-candidate.md 02-grafts.md` | 0 failure(s) in 02-grafts.md | 0 |
| rules 2, 5, 6.11, 7 | headings exact; 2 `bash` + 3 `text` fences, all under Quick start; `/plugin` 0; qualifiers 0; must-not words 0; reader pairs 0; weight, meaning in the opening; first skeleton line 27 holds outline, shape line 27 holds order, diff line 33 holds change; score unused; "fresh AI reader" first; terse only as the name | — |

Words per section (`sections.mjs`):

| Section | 01 | 02 | Budget |
|---|---|---|---|
| (opening) | 68 | 68 | 70 |
| Quick start | 154 | 201 | 180 (+21) |
| Skills | 126 | 133 | 130 (+3) |
| How it works | 148 | 148 | 140 (+8, from 01) |
| What was measured | 105 | 111 | 105 (+6) |
| Total | 601 | 661 | 625 |

Quick start's +47: sign-in +5, excerpt +16 (22 tokens in place of 6), the skeleton agreement +7, the draft
sentence +13, the restart +6.

`diff -u 00-original.md 02-grafts.md > diff-02.patch`, 142 lines.

## What I could not do, and what is open

- No signed-in run, so the "until you say so" and "nothing in your repository changes" sentences (C15, R02c,
  R02d) stay at level 2, what the pages instruct. C15 is shaped like a guarantee; level 3 needs a model run.
- The Quick start's not-agreed branch is audit → rethink → rewrite → audit. There the closing audit is a
  re-measure with the same questions (`measure.md:106–109`). Neither route line names that order, and "for
  the first time" holds only for an order that starts at rethink.
- `skeleton.md:133–135` (§2.3 device) says both chains end "in audit again with the same questions" and
  gives rewrite "a new draft … beside the reader's". The round departs from the agreed text on both, to be
  true of the pages. A structural question for the owner.
- The excerpt brings "any language" onto the page through the quote. §2.1 keeps "any language … as verified"
  out of the opening, and part 7 item 2 leaves "nothing about language" to the owner. Part 7 item 5 makes
  the excerpt's source the owner's pick.
- C06's old clause "builds a profile of who reads this project" has no successor and is not in part 5. The
  must-use "a profile of who reads it" applies only where the idea appears.
- R02a's "signed-in" rests on a signed-out run of the default first-party host. Other providers and API keys
  were not run (l3 F2 says the same).
- Behaviour sentences of 01 that round 02 did not reword still carry no pin. Quick start: "It asks which
  files…waits until you say so" and "If every answer is already right, stop there. Otherwise say whether…
  stands." Skills: the audit row and "You start each one yourself". How it works: items 3–6. What was
  measured: item 1's first sentence and item 3.

## Sent back

`reviews/02/verifier-sol-v4.md` (Codex Sol V4, first read): 19 claims, 14 HOLD, 5 DOES NOT ANSWER, 0 REFUTED,
duty 1 clean. Regenerated by the page's recipe:
1. `02-grafts.md` removed.
2. `ledger.02.json` copied back over `ledger.json`.
3. The first build kept as `edits/02.sent-back.json` and `edits/02.sent-back.build.mjs`, with its logs as
   `probe-02/round-02.sent-back.log` and `checks-02.sent-back.log`.
4. The build fixed, then `round.mjs` (exit 0), the four checks and `diff-02.patch`.

`02-grafts.md` is byte-identical: SHA-256 `b4b3802b928677b45225b07e2178ce7afebf347ead4d17e851f47c7c4b7e64f8`
before and after. The second build has 19 edits (11 with `old` = `new`) and 20 claims (13 re-pinned, 7 new);
3 dropped, as before; the ledger holds 32 entries.

| Claim | The verifier | What changed | Level |
|---|---|---|---|
| C01 | the check omits "any text" and the reviewers | `asks`: the scope is the owner's stated aim, quoted in the run from `purpose.md:5–6, 12–13, 32–34, 43–45` and `audit.md:21–22`; the rest of the sentence at level 2 with its lines, the reviewers among them (`rewrite/SKILL.md:164–165`, `critic-briefs.md:1`) | 2 |
| R02d | a level-2 page read does not run a lifecycle or output-location claim | `probe-02/rundir-rewrite.sh rewrite` renders rewrite's run line as Claude Code hands it to the model, in three isolated, signed-out loads, then runs it by the shell: installed → `D="<config>/plugins/data/terse-nowely"`; `--plugin-dir` → `…/terse-inline`; the plain page of a checkout → `D` as written, falling back to `$TMPDIR/terse`, or `/tmp/terse` with TMPDIR unset. Each run folder is made outside the working directory, and 0 entries are added to that directory. `probe-02/record-run.sh` adds this run's directory, of the fallback's form, holding the whole `01-candidate.md` and `diff-01.patch` | 3 |
| C15 | none of the three pages' run paths was run | split at its semicolon into two edits with `old` = `new`. C15 keeps the folder half at level 3, by the same probe over all three pages (9 renders, 9 folders outside the working directory). The half "nothing in your repository changes until you say so" is R02g, new, level 2, in the page register: `audit/SKILL.md:44`, `rethink/SKILL.md:31–32, 46`, `rewrite/SKILL.md:88–89, 172–173, 222–223` | 3 and 2 |
| C11 | neither route was run through the hand-over | `probe-02/records.sh` prints both routes and the page's table (`rewrite/SKILL.md:14–16, 24–28, 221–223`). The skeleton route, in this run: `rounds.md:1` with the SHA, matching `skeleton.md`; `01-candidate.md`; `diff-01.patch`. The audit route, 2026-09-22/23, under the pages at 2f29a8f: `audit.md` in its run directory, identical to the report in the repository; `01-candidate.md`; `diff-01.patch`; round 04 with `diff-04.patch` handed to the owner | 3, by record |
| C05 | `saw` omits the rethink order's closing first audit | the run prints `measure.md:106–109` whole, and the lines that make an audit with no audit before it the first: `rewrite/SKILL.md:43–45, 112–113`; `audit/SKILL.md:73–77, 96–97, 100–102, 170–171`; `rethink/SKILL.md:5–6` | 2 |

- **No stub needed.** The ANTHROPIC_BASE_URL route was not used. Signed out, each invocation stops at "Not
  logged in" with cost 0, before any model call. The session record under the isolated configuration already
  holds the page as rendered, which is how the 2026-09-23 probe this one adapts read it. Nothing reached a
  model, and `--dangerously-skip-permissions` was not used.
- **`saw` fits.** `probe-02/quote.mjs` greps a line range and prints each literal as found. Every `saw` now
  stays under the 2000 characters the ledger keeps (the longest is C15, 1915). None is clipped and none holds
  NOT FOUND.
- **Checks** (`probe-02/checks-02.log`):
  - `rule1.mjs`: 0 violations, exit 0, both forms.
  - `dup.mjs`: 0, exit 0.
  - `sections.mjs`: 661 of 625, the same four sections over, exit 0.
  - `ledger.mjs`: 0 failures in `02-grafts.md` over 32 entries, exit 0.
  - The skeleton's rules 2, 5, 6.11 and 7 give the same results as before.
  - `diff-02.patch` is rewritten, 142 lines: the same hunks, with a new timestamp in its header.
- **Open, as this build leaves it:**
  - "Nothing … until you say so" is now R02g, at level 2 as the pages' instruction; the folder half is at
    level 3.
  - R02d is level 3, but its hand-over part ("applying … needs their word") stays at page level; its `asks`
    says which part is which.
  - C11's audit route ran under the pages at 2f29a8f, which predate the shape rule. Its `asks` says so.
