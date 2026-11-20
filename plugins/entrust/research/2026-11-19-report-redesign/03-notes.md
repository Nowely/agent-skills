# Review report: redesign prototype — notes

A clickable prototype, not a change to the renderer: `page.mjs` and the report's contract are untouched.

## Files

| File | What it is |
| --- | --- |
| `run38.html` | The real record (86 blocks, 35 files): the review of trial run 38, «OpenCode workers start a local server by default». |
| `themed.html` | The review suite's own `THEMED` fixture over the currency-contract case. Neither real record has decision variants, a conditional child or evidence zones, so this is the only page that shows them. |
| `prototype/build.mjs` | The generator: `node build.mjs <review.json> <out.html>`. It inlines `app.css`, `app.js`, the record as one JSON island and the syntax as class-based token spans. |
| `prototype/app.css`, `prototype/app.js` | The page's style and script, shared by every page. |
| `prototype/tools/themed.mjs` | Makes the THEMED record under the temp directory and prints its path. |
| `prototype/selfcheck.cjs` | The Playwright self-check. It writes its screenshots and result to a temp folder. |

`big.html` is not included: its record is synthetic, and it repeats strings of the diff it was laid over. The
README says how to rebuild it.

## Data and provenance

The generator imports the review skill's modules read-only, found from its own place
(`../../../plugin/skills/review/scripts/`): `parseDiff` (`diff.mjs`); `check`, which gives the owner map of every
changed line to its block; `modelOf`, `sourceOf` and `PURPOSES` (`review.mjs`); `labelsOf` for the record's
vocabulary (verdict, source, evidence and challenger words); and `createSyntax` (`highlight.mjs` with the vendored
Shiki). Nothing is written by hand. Places such as `path:line` resolve to diff rows by the same rule for
findings, questions, ideas and challenges. Only a path the diff holds, or a suffix that names exactly one touched
file, resolves. If the catalog loses a word the prototype borrows, the build stops and names it.

The design work was done against `4ad9147`, the brief's revision. The pages in this folder were rebuilt with
the packaged generator against the modules at `879f4e9`, after the commit that keeps the report to English and
Russian. No import changed, and the self-check passes 36 of 36 on those builds. A rebuild at `c523e1c` gave
byte-identical pages.

Syntax: Shiki's spans carry inline `color:…;--shiki-dark:…` styles. The generator turns each distinct pair into
a class: 8 classes for run38 and 9 for the big record. It re-checks every token colour to at least 4.6:1 against
this page's own code backgrounds (plain, added, removed) in both themes. A token in the default text colour gets
no span. The big page is 2.6 MB against the current renderer's 6.6 MB, and run38.html is 322 KB against 795 KB.

## What changed, per tab

**One frame for every tab.** A main column sits on the left and a sticky side panel on the right shows the
context of whatever is selected. Each tab keeps its own selection and scroll position. The tab bar is the only
sticky header. It carries the open counts (Decisions = open cards; Code = blocks with an open decision), a
"Decided n of N" bar, Shortcuts and a theme toggle (Auto, Light, Dark; Auto follows `prefers-color-scheme`).
Deep links: `#decisions/f3`, `#code/b12`, `#summary/r2`, `#details/mechanisms`.

**Summary** (was Overview, plus the requirement table from Checks):
- One status strip: files, ±lines, blocks with a bar of line shares by verdict, the open decisions and a «Decide» button.
- The verdict's first line as a lead, and its `- ` lines as a short list. The recommendation follows with its steps; each step is selectable and shows its findings and their code in the panel.
- The requirements table is now on the first tab: Met / Fails F2 / Not checked … / No test F5, the doubt as «To reconsider», and «N blocks», which opens Code filtered to that requirement. Selecting a row puts its findings, manual checks and code excerpts in the panel.
- Coverage limits: what was not checked (structured statements, or the requirements' `not_checked`), the open facts and evidence, and the coverage prose, clamped.
- Panel with nothing selected: the change (goal, why, parts, sources, tradeoffs).

**Decisions** (was Choices):
- The same sub-tabs, as one segmented control: All / Decisions / Findings / Ideas / Facts & evidence / Deferred / Done. They count open items, and Deferred and Done count totals.
- Cards fill the main column. The panel holds the selected card's context. «Where» is the diff excerpt at the card's `at`, with the line marked. The basis follows (what, shown by, evidence, the requirements it breaks or leaves untested, the step that settles it, the units and mechanisms that name it), then the code it links as diff excerpts. A card linking 21 blocks shows 3 excerpts and a «Show 18 more blocks» button. A finding and its code now stand side by side.
- The choice is one control: variants (with consequences and a «recommended by the reviewer» mark) plus «Other — your own answer». Picking Other opens a text field, and that text is the comment and the decision. Findings offer Fix / Do not fix / Other, and ideas Take / Do not take / Other. A decision with no variants, a fact or evidence shows just the answer field. Below the choice sit «Defer» and «Clear», both verbs. The separate «Comment» disclosure is gone.
- A decided card shrinks to one row (id, title, your answer, status) once you move on. It stays open while selected, so it never jumps away under the cursor. j / k move between open cards.
- A conditional child sits under its parent and reads «Not applicable» when the parent's variant excludes it. See themed.html.

**Code**:
- One toolbar row. «Files» toggles the tree. «Needs attention | All» is a segmented control. «Purpose: all ▾» is one menu with checkboxes, counts and the classification rules. A requirement select, a file filter (`/`), and «‹ 3 of 12 open ›» with j / k complete the row.
- Files are continuous diffs with a sticky file header (path, new/deleted, «2 of 3 open», ±, purpose).
- In «Needs attention», only files with an open item show. Everything around the framed blocks folds into one line, «⋯ 41 lines, kept · across 4 hunks · +11 −4 · B6, B7, B8 +2», which expands in place. Runs of folds and hunk gaps merge into that one line. Three lines of context stay around each frame. A footer says how many files hold only kept code and offers «Show all files».
- A block that is not kept gets a frame at its own changed lines, coloured by verdict, and a margin note above them. The note holds the verdict tag, the B id, what the block does, and per linked card the F/Q chip, the title, the fix and Fix / Do not fix / Other… as pressed buttons. A question without variants shows «Answer…», which opens the field in the panel. The state is shared with Decisions, and a decided frame turns grey. A block that resumes after other code gets «B12 continues».
- Clicking any block, kept ones included, selects it. The panel shows its place, unit, the requirements it serves and the full decision card, the same component as in Decisions, plus «the same decision covers B…».
- Line comments: click a line number to open an editor under the line. A saved comment shows in place, is listed in the panel with «Go», and is counted in the tab bar. `c` comments on the selected block's first line.
- The tree is a collapsible left column, 288 px at 1440. Folders compress single-child chains. File names wrap whole and are never cut in the middle; counts drop below the name when they do not fit. Each file has its ± counts and an attention mark: a count coloured by its worst open verdict, or grey once everything is decided. Files with nothing to attend to are dimmed and still clickable; a click shows that file. A scrollspy marks the current file. Below 1150 px the tree starts closed and opens as an overlay.
- Lazy rendering: file shells come with estimated heights, and a body is drawn when it comes within 1600 px of the viewport.

**Details** (was the rest of Overview, Checks and Materials), with the same segmented sub-tabs:
- Structure: «How it works now» and «Target solution» side by side. One units table follows: unit and jobs, verdict tag with F/Q chips, a small bar of keep/fix/remove/question line shares, lines, uses, reason and «Show in code», which filters Code to the unit with a removable «Unit: …» token. Then the target structure (from the change / to write / existing). A «Table | Graph» toggle keeps the who-uses-whom graph as an option. It is laid out to the available width, nodes are as wide as their names, and hovering or focusing a unit lights its edges and neighbours.
- Mechanisms: a table (name and purpose, change, decision, weight, findings) with the combined weight above it. The panel holds basis, already available, benefit, cost, decision, units and code.
- Checks by hand: numbered scenarios. The panel shows the requirements each checks, with their status.
- Challenges: a table of raised by, point and outcome. The panel holds the note and the code at the place that answers it.
- Coverage: the structured statements, the coverage prose, the scope, tradeoffs and screens.
- Report details: title, scope, passport, the saved diff with its sha256, the record's sha256 and the size.
- Each list sub-tab selects its first item, so the panel is never empty on arrival.

## Component inventory

1. **Tab bar**: four tabs (role tablist, arrow keys), open-count badges, progress, Shortcuts, Theme.
2. **Segmented control**: every mode switch and sub-tab. Used for the Decisions sub-tabs, the Details sub-tabs, «Needs attention | All» and «Table | Graph».
3. **Chip**: links only (`B12`, `F3`, `Q2`, `R5`, `M1`), monospace and bordered. Clicking one goes to the item: B opens Code, F/Q/I open Decisions, R opens Summary.
4. **Tag**: statuses only. Verdicts: Keep (neutral), Fix (amber), Remove (red), Question (indigo). Requirements: Met (green), Fails (red), No test (amber), Not checked (hollow), Permission (neutral). Cards: Open (hollow), and decided states (neutral: Fix / Do not fix / Selected / Own answer / Answer entered), Deferred and Not applicable (dashed). Amber appears only for a needed change.
5. **Button**: verbs only: Decide, Defer, Clear, Show in code, Open in Code, Expand, Save comment. Primary blue is used once, for «Decide»; a link-styled button marks navigation inside text.
6. **Card shell**: one shell for Q/F/I in the Decisions list, the Code panel and the mini cards in other panels. It has a head (id, type, status), the essence, the choice and the links, and a compact one-row form once decided.
7. **Choice**: radio options with consequences plus «Other — your own answer»; an answer field when there are no options. The compact pill form appears in code notes.
8. **Side panel**: a sticky head (kicker, title) and sections with small headings, the same in all four tabs.
9. **Diff excerpt**: a mini diff of a block or a place, with B chip, path, verdict tag, «Show all N lines» and «Open in Code».
10. **Diff view**: rows, frames, margin notes, fold lines, hunk gaps, «continues» marks and line comments.
11. **Table**: a dense table with selectable rows, used for requirements, units, mechanisms and challenges.
12. **Share bar**: line shares by verdict, in the status strip, the units table and the graph nodes.
13. **Tree**: folder and file rows, attention marks and the current file.
14. **Popover menu**: Purpose. **Dialog**: Shortcuts.

## Dropped, and why

- **The six simultaneous groupings in Code** (the files/units switch, a purpose button per purpose with «Files: N», two «Show:» rows, the verdict filter buttons, «↑ Top»). They become one toolbar row. The verdict filter is reduced to Attention/All. Units became a filter you reach from Details, and Top is the browser's own.
- **The SVG graph as the main structure element.** The units table replaces it, and the graph remains behind a toggle.
- **The separate «Comment» disclosure on cards and blocks.** «Other — your own answer» replaces it.
- **Free «select any text and comment» annotations**, as the brief says, along with the empty «Comments on passages» heading. Line comments stand in for them in the diff.
- **Statuses named like buttons** («Accepted» / «Deferred» on a decision without variants). The choice is now an answer field plus a «Defer» verb.
- **Clouds of B-chips.** A card shows at most 6 chips and «+N more», which selects it and shows the excerpts. Requirements show «N blocks» as one link to the filtered diff.
- **Materials as its own tab.** Coverage and report details move into Details, and coverage limits also appear in Summary. Print buttons and «Clear all decisions» are not in the prototype.
- **The «Need attention» count of 29 alongside «Files: 35» on a single tab badge.** The Code badge now counts open blocks.

## What the prototype does not do

- No persistence or export: decisions and comments live in memory, and a reload clears them. There is no
  schema-5 export, copy text, JSON download or print profile.
- Defer does not ask for a reason; the current page's contract requires one. An evidence answer moves the card to
  Done, though the contract keeps evidence open until a revised record; the tag reads «Answer entered», never
  «verified». Parent/child applicability is shown («Not applicable»), but drafts kept under a retired child are not
  modelled beyond keeping the stored choice.
- No no-JavaScript fallback; the current page degrades to static panels.
- No source popover with copyable `path:line (revision)`, and no hover cards on chips (a chip has a title tooltip).
- Line comments cannot be put on lines outside the diff, and hunk gaps cannot be expanded: the record holds only
  the diff, not the files.
- No Russian: the words the prototype adds are English only. The words it borrows (verdicts, sources,
  evidence) come from the report's catalog in the record's language.
- At ≤860 px the panel stacks under the main column. That is usable, but it is not designed for phones.
- The graph view is basic: there is no edge routing around nodes, and long rows wrap.

## Measurements (headless Chromium 1440×900 on the work machine, four self-check runs)

- big.html opens in 160–192 ms wall time. DOMContentLoaded comes at 126–149 ms, first paint at 52–72 ms, and the
  app script takes 47–60 ms (JSON parse plus Summary).
- The big Code tab, attention view, reaches its first frame in 68–98 ms. Two of 15 file bodies are drawn; the
  rest wait off-screen.
- j on big takes 32–67 ms per step.
- The big «All» view switches in 211–232 ms. Scrolling through the whole 7,213-row diff, drawing each file as it
  arrives, took 2.2–2.3 s.
- At 1024 px no tab of run38 or big scrolls horizontally.
- There are no console errors or warnings on any page.

## Open questions for the owner

1. Which tab should the page open on: Summary (the prototype) or Decisions (the current page)?
2. Should «Needs attention» also count kept blocks that serve no requirement, or only serve assumed ones? Today it is non-keep blocks only; the check's warnings about such kept blocks are not shown on the page.
3. Should a decided block stay framed (grey) in «Needs attention», or drop out of that view?
4. For a decision without variants, is a single answer field right, or should the reviewer always supply variants (Keep / Revert …) so «Other» is truly the other?
5. Should Defer require a reason, as the current contract does, or is a bare defer enough?
6. Line comments vs. free text selection: is the passage-comment mechanism missed?
7. The tree starts open at ≥1150 px and closed below. Should it remember its state, and should the file list show the full path on hover only (as now) or as a second line?
8. Is the optional graph worth keeping at all, given the units table?
9. Units and mechanisms are filters reached from Details, not toolbar controls. Is that enough for how you read by unit?
