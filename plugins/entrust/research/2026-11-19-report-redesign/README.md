# Review report redesign: a clickable prototype (2026-11-19)

Research for the `entrust:review` page, not a change to it. The prototype redraws the report from the same
`review.json` and saved diff, using the review skill's own modules. `page.mjs` and the data contract are
untouched.

**The owner's goal:** a diff of any size, even a very large review, is easy to inspect and decide in one
calm, consistent interface. You always know where you are, what is left, and which key to press next.

**What v2 shows:**
- **Four tabs.** Summary opens with «Start review»; then Decisions, Code and Details. Each tab has a side panel
  that adds the context of the selection and never repeats the card.
- **Code as a continuous diff.**
  - The margin note is where you answer. The context column is closed by default.
  - j / k walk the decisions and their blocks («Decision 2 of 6 · block 3 of 21»).
  - A decided block shrinks to one line.
  - «Viewed» works per file. «Show whole file» unfolds a file in one action.
  - Any line can take a comment, and line numbers can be reached by keyboard.
- **Four states:** Open, Decided, Deferred, Not applicable. The answer is shown as text.
  - The reviewer's verdict reads «Reviewer: fix»; the owner answers «Fix it» or «Leave it».
  - A choice offers its variants plus «Other — your own answer». Defer asks for a reason.
- **Details:** a units table sorted by fix lines; scenarios, screens with their provenance, coverage and report
  details.

Read [02-brief.md](02-brief.md) for the brief and [03-notes.md](03-notes.md) for v1. For what each version
changed, item by item, with measurements, proof and what remains, read [05-notes-v2.md](05-notes-v2.md) for v2
and [07-notes-v3.md](07-notes-v3.md) for v3.

## Open

Open `run38.html` (a real review: 86 blocks, 35 files) or `themed.html` (the review suite's fixture, with
decision variants, a conditional child and evidence zones) in a browser. Both are offline and standalone.
Press `?` for the keys:

- **Moving:** `j` / `k` next or previous block of an open decision; `]` / `[` next or previous decision;
  `Shift+J` / `Shift+K` next or previous file; `g` then `s`, `d`, `c` or `t` switch tabs.
- **Answering:** `1`–`9` or `f` / `n` choose; `o` your own answer; `d` defer; `Ctrl/⌘+Enter` save and move on;
  `u` undo. A key answers only the focused or selected item, and only while it is in view.
- **Code:** `Ctrl/⌘+F` find in every file; `c` comment; `y` copy path:line; `v` mark the file viewed; `i` show
  the context column.

## Rebuild

From the repository root, with Node 22:

    R=plugins/entrust/research/2026-11-19-report-redesign
    node $R/prototype/build.mjs <run-38 record>/review.json $R/run38.html
    node $R/prototype/build.mjs "$(node $R/prototype/tools/themed.mjs)" $R/themed.html
    node $R/prototype/build.mjs <big record>/review.json big.html

`build.mjs` takes a record and reads its saved diff beside it, as `report.mjs render` does. It finds the review
skill's modules from its own location. `tools/themed.mjs` builds the fixture record under the temp directory
and prints its path.

Two records are not in the repository:
- **Run 38:** the trial-run review behind `run38.html`.
- **The big record:** synthetic, with 274 blocks of made-up verdicts over the PR #102 diff
  (`git diff 012475e 9dfe0ba` without the vendored Shiki bundle). Its page is about 2.6 MB, and the Shiki pass
  takes about 14 s.

Self-check: `node $R/prototype/selfcheck.cjs [folder with the pages]` runs 77 checks; add `--only=v3` to run just
the seven that prove the v3 fixes. It needs Playwright with
Chromium. If `big.html` is in the folder, it also runs the large-record checks. Screenshots and the result go
to a temp folder.

## What it does not do

- Answers, comments and «Viewed» live in page memory only. There is no export, print profile or no-JavaScript
  fallback.
- The prototype's own words are English only.
- Code outside the diff cannot be expanded or commented on.
- A single very long file is drawn whole once it is near the viewport.
- Below 860 px the layout stacks; it is not designed for phones.

## Files

- [01-audit.md](01-audit.md): the audit of the page before the redesign, and the direction the owner approved.
- [02-brief.md](02-brief.md): the designer's brief.
- [03-notes.md](03-notes.md), [05-notes-v2.md](05-notes-v2.md), [07-notes-v3.md](07-notes-v3.md): the three prototype versions.
- [04-critic.md](04-critic.md), [06-critic-v2.md](06-critic-v2.md): the critic's runs on v1 and v2, six review tasks timed against the current page.
- [rounds.md](rounds.md): the rounds and their findings.
