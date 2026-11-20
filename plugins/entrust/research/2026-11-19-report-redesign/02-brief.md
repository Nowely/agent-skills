# Brief: a clickable prototype of the redesigned review report

You are the designer-implementer of a PROTOTYPE. Do not edit, commit or push anything in the repository. Work only in
a scratch folder outside it (call it P).

## What the report is

`entrust:review` writes a review of a code change as data (`review.json`) next to the diff, and
`plugins/entrust/plugin/skills/review/scripts/report.mjs render review.json` draws a standalone offline HTML page for
the owner to review the change and make decisions. Repository: this one (branch at `origin/main`
`4ad9147`). The current page: `scripts/page.mjs` (STYLE and SCRIPT are template strings), labels in `labels.mjs`,
the model in `review.mjs` (`modelOf`), diff parsing in `diff.mjs`, syntax in `highlight.mjs` and the vendored Shiki.
The data contract: `references/report-data.md`.

Rendered current pages to study (open them in Chromium via Playwright; `require('playwright')` works from a .cjs
file; do not install browsers):
- real record, 86 blocks, 35 files: the review of trial run 38 («OpenCode workers start a local server by
  default»), its `review.json` with the saved `review.diff`, and the page the current renderer draws from it
- synthetic large record, 274 blocks, 31 files, 646 KB diff: synthetic verdicts over the PR #102 diff, and its
  current page
- screenshots of every tab of both current pages, first screen and full page

## The owner's goal, in their words (translated)

«I don't much like how the report looks and feels. The goal: a diff of ANY size can be inspected conveniently,
easily and simply, in a pleasant, consistent interface. Decisions have sub-tabs — maybe they belong elsewhere too.
The Code tab's filtering and file tree are inconvenient. In Overview it is unclear how to use data like the SVG
tiles.» And on comments: «A separate comment field on a decision is really the "Other" option of a choice — like
answering a question with your own text. On decision cards what matters is access to the context. Overall: make it
convenient; not every piece of information is needed, and its presentation matters.»

## Audit of the current page (coordinator's findings)

- The same blocks of code are grouped six ways (files, units, mechanisms, requirements, findings/questions, purpose);
  the Code tab exposes them all as filters at once: ~22 controls in 6 rows before the first code line, two rows
  labelled «Show:», «Files: N» on every purpose button, a separate «↑ Top» button.
- Overview: a long verdict paragraph, then an SVG «who uses whom» graph of 12 unit tiles (text cut with «…», arrows
  tangled; a tile is a link to the unit's first block but does not look like one), then a table with the same units,
  then mechanisms — another grouping of the same blocks.
- Decisions (tab «Choices»): the sub-tabs (All / Decisions / Findings / Ideas / Facts · checks / Deferred / Done) are the
  best element. Cards use ~800 of 1440 px; the right half is empty. A finding and its code are never side by side
  (code behind «Related code»). A decision without variants shows buttons named like statuses («Accepted» /
  «Deferred»). A question can carry a cloud of 21 B-chips. Each card has a separate «Comment» disclosure.
- Code: files as cards per block; the finding under a fix block is bare text; the tree is ~260 px, names cut in the
  middle (`review-an…rowser.mjs`); no «next open item».
- Checks: Requirements table with clouds of 20–30 B-chips, Check by hand, Challenges. The requirement status — the
  main «did the PR do its job» signal — lives here, not in Overview.
- Materials: a coverage paragraph (also a trust signal), print buttons, «Clear all decisions», an empty «Comments on
  passages» heading.

## The approved direction (build this)

1. **Four tabs with one logic:** «Summary» (verdict, requirement status, coverage limits, recommendation steps),
   «Decisions», «Code», «Details» (structure, mechanisms, checks by hand, challenges, coverage, report details) — Details
   uses the same sub-tab control as Decisions.
2. **One frame for every tab:** a main column on the left and a right side panel that shows the context of whatever is
   selected. In Decisions the panel shows the selected card's code (the blocks it links, as diff excerpts) and its
   sources/basis — so a finding and its code are finally side by side. In Code the panel shows the decision for the
   selected block (finding/question, fix, buttons).
3. **Code as a diff, like a PR's Files view.** One toolbar row: «Needs attention | All» (segmented), purpose (one
   compact control), requirement, file search. Files are continuous diffs; kept code folds to a line «… N lines, kept»
   that expands in place. A non-keep block gets a frame at its lines and a margin note (finding title, the fix,
   Fix / Do not fix / Other) that shares state with Decisions. Keyboard: j / k = next / previous open item, with a
   visible position («3 of 12 open»). The file tree is a collapsible left column that shows full names (wrap or a
   wider default; never cut in the middle) with per-file counts and an attention mark.
4. **Replace the SVG graph in Summary/Details with one units table:** unit, verdict, a small bar of kept/fix/remove
   line shares, lines, uses, reason, «Show in code». The graph may stay as an optional view behind a segmented toggle,
   interactive (hovering a unit highlights its edges), never the main element.
5. **One component vocabulary:** segmented sub-tabs for every mode switch; chips only for links (B/F/Q/R ids); tags
   only for statuses; buttons are verbs; one card shell.
6. **Comments as the owner described:** every decision offers its variants plus «Other — your own answer» (a text
   field that IS the comment; choosing it is a decision). Findings: Fix / Do not fix / Other. A comment can also be put
   on a code line (click the line number, like GitHub), shown in place and listed in the panel. Drop the free
   «select any text on the page and comment» mechanism from the prototype; the owner will judge whether it is missed.
7. **Big diffs:** the 274-block record must stay usable: fast first paint, attention view first, collapsed kept code,
   lazy rendering of off-screen files if needed.

## Constraints

- A standalone, offline HTML file: inline CSS and JS, no network, no external libraries (Shiki output may be reused
  as static spans; class-based token colours are preferred over inline style attributes).
- Real data: generate the prototype from the real records with a Node script in P that imports the repository's
  modules read-only (e.g. `review.mjs` `modelOf`/`check` inputs, `diff.mjs` parsing, `labels.mjs`, `highlight.mjs` or
  the Shiki helper) — do not hand-write data. Produce `P/run38.html` (from the run-38 record) and `P/big.html` (from the synthetic record).
- English labels (the records are English). Light and dark theme through colour tokens; respect
  `prefers-color-scheme` and offer a toggle. Desktop first (1280–1600 px); mobile is lower priority but nothing may
  break at 1024 px.
- State in memory is enough (no export); decisions made in Code show in Decisions and vice versa.
- Visual direction: a calm, dense, professional review tool — clear hierarchy, readable code, restrained colour
  (status colours only for statuses; amber only for a needed change), consistent spacing. Not a copy of GitHub's
  look; familiar patterns are welcome. Avoid generic «AI» looks (cream+serif+terracotta, purple gradients, emoji
  markers, rounded cards everywhere).
- Accessibility basics: keyboard reachable controls, visible focus, labelled controls, sufficient contrast.

## Deliverables in P

1. `run38.html`, `big.html` and the generator script.
2. `notes.md`: what changed versus the current page per tab; the component inventory; what was dropped and why; what
   the prototype does not do; open questions for the owner.
3. Screenshots (1440×900, light and dark) of each tab on run38, and the Code tab on big: `P/shots/`.
4. Self-check before reporting: no console errors; j/k works; a decision made in Code appears in Decisions; the
   side panel follows the selection; big.html opens in under ~2 s on this machine (measure and report).

Report back: file list, how to open, what works, measurements, known gaps, and open questions.
