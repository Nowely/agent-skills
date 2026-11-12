# Interactive report trial

Can a review be written as data, checked against the diff, and drawn as a page on which the author decides what to apply? A trial, not part of the installed skill.

## What was tried

- [`report.mjs`](report.mjs) runs in the repository under review. `lines <range>` prints every changed line with its address. `render <review.json>` checks the review against the diff, refuses it with the list of faults, and otherwise writes `review.html` beside the data and prints the review as markdown in the skill's report shape.
- [`../drafts/14-report.md`](../drafts/14-report.md) is draft 13 with one added section, "Interactive report": the data format and the three steps.

The check makes one rule of draft 13 mechanical: every changed line, added or removed, belongs to exactly one block. It also refuses an unknown requirement or finding id, and a block to fix or remove that names no finding. Blank lines need no block. The requirements no block serves are worked out from the blocks, so the reviewer does not write them twice.

The page is one file with no dependencies. It reads without scripts. With them, each finding takes Apply or Skip, each finding and block takes a note, a block whose findings are all skipped shows as kept, and the decisions come out as text to hand back to whoever makes the change. Its parts: the verdict and target; the share of changed lines the reviewer would keep, fix and remove; a table of what each requirement gets and which blocks serve nothing; the diff cut into blocks, each with its verdict, what it does, what it serves and its findings; the findings; the decisions.

## Runs

| Target | Who wrote the data | Tool calls | Render attempts | Blocks | Lines: keep / fix / remove | Words |
|---|---|---|---|---|---|---|
| `overdue-notice/head` | Sonnet, a fresh review with draft 14 | 7 | 1 | 12 | 0 / 35 / 303 | 910 |
| `contact-import/head` | Haiku, converting the Sonnet review of [the second pilot](../sonnet-pilot-2/returns/s1.md) | 12 | 1 | 14 | 15 / 47 / 68 | 1374 |

Each directory holds its run's `review.json`, `review.html` and the printout as `review.md`. The first reviewer was a Claude Code subagent on Sonnet at default effort, given the prompt of `evals/review/prepare.mjs` with two changes: it was told the user asked for the interactive report, and it was allowed to write the data file and run the script. No judge graded the review. By its author's reading it names all six find items of the case's rubric and violates no trap. The second run reviewed nothing: a Haiku subagent carried a finished prose review into the format, told to keep its content, to split the test file by test and to put a function's framing lines in a block of their own.

## What it showed

- A Sonnet reviewer wrote valid data on the first attempt, in about a minute, using the `lines` listing as its reading of the diff.
- Nine of its twelve blocks are a whole file each, written as `"all"`. For a framework that goes entirely that is one decision per file, but it also means the check passed without the reviewer looking inside those files line by line. `"all"` makes the rule easy to satisfy; whether to keep it, or allow it only for a block to remove, is open.
- Converting the prose review exposed what prose lets through. Its line numbers were off in two places (a test at line 65 cited as 69, a skip at 72-75 cited as 75-79); the listing gives a block its lines exactly. Two of its findings had no fix and one no place; the format asks for both. Its map left 12 of the 118 non-blank changed lines in no block; the check lets none out.
- The format has one gap. The prose review called requirements 2 and 4 unserved while blocks "serve them badly". Data derives "unserved" from `serves`, so the table shows both as served, by blocks to fix or remove. A requirement that has code and still fails is said only in a finding; the table cannot show it.
- The rendering changed after the reviewer got its copy of the script: unchanged lines inside a block stay in it, long blocks fold. The check did not change.

## What it did not show

One run on one case, by the same author as the case, with no comparison arm and no judge. Nothing was run on the target model. Whether writing data instead of prose changes what a reviewer finds is not measured. The page was looked at in a headless browser at desktop and phone width in both themes; no person has decided a real review with it.

## Second pass: draft 15, the script in the skill

After the trial the script moved into the skill, `plugin/skills/review/scripts/`, with a suite, `evals/review-report.test.mjs`. [`../drafts/15-structure.md`](../drafts/15-structure.md) is the page it ran with. What changed:

- **Data.** `change` (goal, why, parts, sources); `units` and `target_units`, each unit with its jobs and the units it uses; `unit` on a block; `breaks` on a finding, the requirements it shows unmet. `"all"` is refused on a block to keep or fix. A unit of the change with no block, and a name nothing lists, are faults.
- **Page.** The change's summary first. A status for each requirement: met, fails with its findings, or no block serves it, which closes the gap the first pass found. Two diagrams of who uses whom, as written and for the target, each unit with the share of its lines to keep, fix and remove. Code with comments, strings, numbers and keywords marked.

| Target | Who wrote the data | Tool calls | Render attempts | Blocks | Lines: keep / fix / remove | Units: written / target | Words |
|---|---|---|---|---|---|---|---|
| `overdue-notice/head` | Sonnet, a fresh review with draft 15 and the skill as installed | 8 | 1 | 14 | 0 / 20 / 316 | 10 / 2 | 1364 |
| `contact-import/head` | Haiku, adding the new fields to the first pass's data | 14 | 1 | 14 | 15 / 47 / 68 | 1 / 1 | 1507 |

`draft-15/` holds both runs' data, pages and printouts. The Sonnet reviewer got the first pass's prompt with the skill directory in place of the single instructions file. No judge graded it; by its author's reading it again names all six find items of the rubric and violates no trap.

- The larger format did not cost the Sonnet reviewer an attempt: valid on the first render, in about eighty seconds.
- With `"all"` refused for code that stays, it split `nightly.js` into four blocks where the first pass had one; the files that go entirely are still one block each.
- Its structure is ten units as written against two in the target, with four existing units both use. `breaks` put a finding on every requirement: 1 on the email's text, 2 on repeats and retries, 3 on the due date.
- The printout of the same case grew from 910 words to 1364. The two new sections, the change and the structure, are most of that.
- The converted review shows a fault the check does not catch: its one unit is to split, and its target has one unit. The prose review named no function to split it into, and the converter invented none.

One run per case again, same author, no judge, nothing on the target model. Whether stating the structure changes what a reviewer finds, or only adds words, needs the judged round.

## Third pass: draft 16, the recommendation and the ideas

[`../drafts/16-ideas.md`](../drafts/16-ideas.md) adds a recommendation under the verdict and a section of ideas kept apart from the findings; the page sets the recommendation off and gives each idea the same Apply and Skip as a finding. Two fresh Sonnet reviews, each with the skill as installed and the interactive report asked for; `draft-16/` holds their data, pages and printouts.

| Target | Tool calls | Render attempts | Blocks | Lines: keep / fix / remove | Findings | Ideas | Words |
|---|---|---|---|---|---|---|---|
| `contact-import/head` | 9 | 2 | 19 | 4 / 45 / 70 | 7 | 1 | 1368 |
| `currency-contract/clean` | 8 | 1 | 2 | 11 / 0 / 0 | 0 | 2 | 383 |

- On `contact-import/head` the check did its work for the first time: the first render was refused with "no block covers added 71", and the second passed.
- On the clean change the review found nothing, recommended accepting it as is, and by its author's reading violated no trap. It offered two ideas, an end-to-end test and a refresh of the stale document. Its printout is shorter than the prose review of the same target in the second pilot, 383 words against 480.
- The idea on the bloated change is a faster rename in the store, outside the change and with no load named. Whether a judge counts such ideas as unsupported claims is what the judged round has to show.
- The clean run exposed a fault of the page, fixed since: a requirement that needs no change, with no block and no finding against it, was shown as a failure.

No judge, one run per target, nothing on the target model. Draft 17, the comparison of screens with a mockup, came after these runs and has not been run: no case has pictures.

## Fourth pass: the page after the user read one

The second Terra round ([rounds.md](../rounds.md#round-17-terra-round-2)) rendered four reviews written with draft 17, and the user read one of them. Three states of the page misled, and the user asked for a clearer order of things. The script changed; the skill's page did not, so the reference page for the data is for now ahead of the report shape in `SKILL.md`.

- **A requirement is met only on the reviewer's word.** The page used to read "met" off a block that names the requirement. A requirement now carries `met`, as `ran` or `traced`, and without it reads "not checked". A finding about tests lists requirements under `untested` and no longer turns them to "fails"; a requirement both marked met and broken by a finding is refused.
- **A screen nobody compared says so.** "No difference from the mockup" was printed for an empty list. A match is now a claim, `"match": true`, which needs the mockup and the result; a screen with neither a difference nor a match is shown as not compared.
- **Decisions belong to one review.** They were stored under the title and the range, which two reviews of one change share. The page's name for them is now a digest of the review's content.
- **Where a requirement comes from.** `source` is the task, a decision in discussion, an open question or an assumption; `doubt` holds what contradicts a requirement the reviewer would not take as given.
- **Four parts, four labels.** The task, the review's conclusion, what to do and the target solution each stand under a label of their own; the recommendation is one sentence and an ordered list of steps that name findings by number; the range moved from the header to the foot.
- **The reader's language.** A review carries the report's own words under `labels`, and `report.mjs labels` prints them to translate.
- **Layout.** The diagram's boxes are markup, so their text wraps and is cut by the browser in any language; a tree shows the changed files with the units and blocks in each; the type is 13px against 15.
- **A word the reviewer reached for.** One Terra render was refused for a unit verdict outside keep, split, merge and remove. A unit that stays one unit and changes inside had no word; it is now `fix`. A unit to split must have what it splits into in the target.

[`after-round-2/contact-import-head`](after-round-2/contact-import-head/) is Terra's first review of that round, `terra-round-2/interactive/i01`, carried into this format by the page's author: the same findings, blocks and units, in Russian, each requirement given the source "task", the tests finding's requirements moved to `untested`, and the one-paragraph recommendation cut into five steps. It is there so that the user can read the same review on the new page; it measures nothing.
