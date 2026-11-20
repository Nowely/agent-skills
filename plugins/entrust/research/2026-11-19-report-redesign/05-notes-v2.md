# Review report redesign: prototype v2 — notes

v2 answers the critic's report ([04-critic.md](04-critic.md)), the owner's answers to four policy questions,
the accepted points of the external review on PR #106 and the coordinator's UX decisions. The aim is that even
a very large review is very easy to review. `app.js` and `app.css` were rewritten. `build.mjs` now also carries
scenarios, full screen provenance and each row's text length; `selfcheck.cjs` grew from 36 to 59 checks.
`run38.html` and `themed.html` were rebuilt with the packaged generator against the review skill's modules at
`1bfcb42`.

## The critic's «must change» items

1. **Code column.**
   - The context column in Code is closed by default; `i`, the «Context» button or Esc toggles it.
   - The margin note is the only place to answer in Code. The column adds sources, basis, related items and the
     file's line comments, with no choice control.
   - The block list the panel repeated is gone; related blocks appear once, as a «Related» list.
   - The code column is 1,152 px at 1440 (v1: 578 px).
   - A decision with several blocks shows its controls on one note: the selected block's, else its first. The
     others read «Answer here · one answer covers all 21 blocks».
2. **Tree navigation.**
   - Heights are now estimated with wrapping, using the code column's measured characters per line and each
     row's text length.
   - Every jump lands by correction: scroll, draw the files near the viewport, measure again, and stop once the
     target stays put.
   - On the 274-block page, 6 of 6 tree clicks land within 3 px of the toolbar, in both views (v1: 2 of 6).
3. **Keyboard.**
   - Radios and checkboxes no longer count as typing, so j / k work with a radio focused.
   - Decision keys act on the selected item: `1`–`9` choose an option; `f` / `n` mean Fix it / Leave it (Take it
     / Skip it on an idea); `o` your own answer; `d` defer; `x` clear. The keys show as hints on the focused note
     or the selected card, and in the `?` help.
   - `Ctrl/⌘+Enter` saves an answer or a defer reason and moves to the next open item.
   - j / k move focus to the note.
   - A «Skip to diff» link comes before the tree. From the selected tab, 13 Tab presses reach the first control
     in a margin note (v1: 65–81).
   - Line numbers have one Tab stop per file; ↑ / ↓ move between them, Enter or `c` comments, and `y` copies.
4. **One unit for «open».**
   - Code counts and steps by decision: «Decision 2 of 6 · block 3 of 21».
   - j / k walk the blocks of an open decision, then the next open decision; `]` / `[` jump a whole decision.
   - The index stays after a decision («Decision 2 of 6 · decided»), and j goes on to the next open one.
   - The Code badge counts open decisions with code. File headers («1 of 2 decisions open») and tree counts
     refresh on every decision.
5. **Four status tags.**
   - Open, Decided, Deferred and Not applicable are the only tags on items. The answer is text: «Your answer:
     Fix it», «Your own answer: …», «Deferred because: …», «Answer entered · not verified: …».
   - The reviewer's verdict tag reads «Reviewer: fix». The owner's options are «Fix it» / «Leave it» on findings
     and «Take it» / «Skip it» on ideas, everywhere.
6. **File filter.**
   - A name search shows every matching file, including one that holds only kept code, with that code folded.
   - The footer reads «1 file holds» or «N files hold only kept code».
   - «Show whole file» in each file header unfolds every line in one action.

## Design items from «to decide»

- **Units table (Details › Structure).**
  - It shows per-verdict line numbers (fix, remove, question, keep) with the bar, and total lines.
  - It sorts by fix lines by default; Unit and Lines also sort, with `aria-sort`.
  - It adds «uses» and «used by».
  - The unit verdict is labelled «Unit verdict, from the record». When it disagrees with its blocks, the row
    says so: for example «opencode tests», whose unit verdict is fix, reads «Its blocks: keep 50, no fix
    lines».
  - The graph names each node's lines by verdict instead of only the unit verdict.
- **Summary.**
  - The status strip has one line, «7 requirements: 4 met · 2 fail · 1 not checked», with a link to the
    table.
  - Each requirement cell has one status tag. Its limits are notes: «Not checked: …» and «No test: F5», which
    is amber because a test is needed.
- **Decisions panel.** It never repeats the card. The head reads «Context for F1», and the panel holds only
  what the card lacks:
  - the place as a diff excerpt;
  - «Shown by» for a finding, and context and the sources of variants for a question;
  - related items;
  - code excerpts.

## Polish

- Amber marks only a needed change; place highlights and selections use the accent tint.
- «Answers stay in this page only» appears once, in the Decisions header (and in the help), not on every card.
- At 1280 no segmented control wraps, and the Code toolbar is one row (checked).
- Wording:
  - «Show in Code» everywhere.
  - The Decisions sub-tabs are All · Choices · Findings · Ideas · Facts and evidence · Comments · Deferred · Done,
    and the group headings match them.
  - «and», not «&».
- There is one primary button, «Start review».
- Contrast: tree marks use the tag palette, and separators use the muted text colour. The critic's own scan
  finds no text below WCAG AA on any tab, in light or dark.
- «Copy path:line» is back. It names the base or head revision when the passport gives one. When the browser
  refuses the clipboard, a selected text field and «Press Ctrl/⌘+C» appear instead.

## The owner's answers, as built (switchable in one `POLICY` object at the top of `app.js`)

1. **Variants.** A choice shows its variants plus «Other — your own answer». Where the record has none (run38 Q2
   and Q3, big Q1), the page shows the text field and a quiet note that the next contract requires variants.
   No variant is invented.
2. **Progress.** «Decided N of M» counts every item: choices, findings, ideas, facts and evidence requests.
   - A not-applicable item leaves M.
   - A deferred item is not decided.
   - An entered fact or evidence answer counts, and is never shown as verified (`POLICY.progressKinds`).
3. **One answer in effect.**
   - A variant or your own answer: picking a variant clears the own text, and typing your own answer clears the
     variant (`POLICY.pickClearsOwnText`).
   - Defer opens a reason field and does nothing until a reason is written (`POLICY.deferNeedsReason`).
   - Deferring keeps the earlier pick as a draft, never in effect.
4. **Comments in Decisions.**
   - The Decisions › Comments sub-tab lists every line comment and paragraph comment, each with its place and a
     link.
   - A line comment inside the block of an open item says «A comment, not an answer to Q3».
   - Export is not built.

## The external review on PR #106 (accepted points)

5. **Selection follows navigation.**
   - «Show in Code» from a requirement sets its filter and selects that requirement's first block, preferring
     an open one; the URL, panel and position agree. Checked: R2 lands on B69, which serves R2, at
     `#code/b69`.
   - Following a place selects the block that owns the line, or nothing.
   - When a filter hides the selected block, the selection is cleared.
6. **The dependent question's first click.**
   - The cause in v1: selecting a card collapsed the previously selected decided card, which shifted the layout
     between mouse-down and mouse-up. A decided card now shrinks only on keyboard moves or a redraw.
   - A child retired by its parent keeps its pick as a draft. When it applies again it reads «Draft, not in
     effect: …» with «Apply it», following the draft rule in `decisions.mjs`.
7. **All record content, with provenance.**
   - Scenarios have their own Details tab and are linked from findings.
   - Screens show «Historical picture of revision abc123 … no evidence for this one», their sources, matches,
     differences with their findings, and what was not compared.
   - Coverage statements keep ran, read and not checked apart, with the revision and sources.
   - Also drawn: tradeoffs, the passport, a block's kind and purpose, shared mechanism blocks, and the evidence a
     decision does not replace.
8. **Whole file.** «Show whole file» unfolds a file in one action, and a search finds files of kept code only.
9. **«Copy path:line».** It is on every block note, excerpt and line comment, and `y` copies it.
10. **Theme.** The control is in the title header, and the choice is kept between visits (browser storage, with
    a fallback when storage is refused).
11. **Evidence.**
    - An evidence answer reads «Answer entered · not verified» and stays in «Facts and evidence», never in
      «Done».
    - It carries the tag Decided, the only state the four-tag rule leaves for an answered item. The contract's
      «an evidence question cannot be closed as decided» is in tension with that; the owner decides the word.
12. **Focused relations.** A selected requirement, finding, question or block lists its neighbours from
    explicit record fields only, each a link:
    - requirements, findings, questions and blocks;
    - units, mechanisms, steps, checks and scenarios;
    - the requirements, findings, questions and blocks its sources cite.

    It is a list, not a graph.
13. **Direct links.** These resolve to the item and its context: `#code/b69`, `#code/line/23:+102`,
    `#decisions/f3`, `#decisions/comments`, `#summary/r4` and `#details/mechanisms/mech:2`. A link to a line that
    does not exist opens Code without an error.

## The coordinator's UX decisions

14. **Start review.** The page opens on Summary with «Start review», which becomes «Continue review» once
    something is decided. It goes to the first open item in review order: Decisions for a choice without code
    (run38 Q2), Code for one with code (big Q1).
15. **Decided blocks.** In the attention view a decided block becomes one line, «Decided · B8 · F3: Fix it»,
    and its rows fold. Clicking it expands the note and its code; «Fold» puts it back.
16. **Viewed.** «Viewed» per file comes as a checkbox in the header and as the key `v`. A viewed file collapses,
    its tree row is struck through, and the tab bar reads «Files viewed N of 35» beside «Decided N of M».
17. **File order.** «Diff order» or «Needs attention first»; the tree becomes a flat list of full paths in the
    second order. `Shift+J` / `Shift+K` go to the next and previous file.
18. **What «Needs attention» holds.** Only blocks that wait for a decision. Kept blocks with no requirement link
    are listed in Details › Coverage as reviewer information.
19. **Paragraph comments.** On hover or focus, a «Comment» control appears on:
    - the verdict's paragraphs and points, the recommendation and the steps;
    - a finding's what, fix and «shown by»;
    - a question's text and context, and an idea's text;
    - a scenario, and a challenge's point and note.

    A comment is anchored to the item id and the field. There is no text-selection machinery.
20. **Graph and tree.** The units graph stays optional. The tree remembers whether it was open and which folders
    were closed. The full path is in the tooltip and in «Copy path:line».

## Measurements (headless Chromium 1440×900, final self-check, 59 of 59 checks pass)

- **big.html load.** It opens in 185 ms wall time: DOMContentLoaded at 137 ms, first paint at 76 ms, app script
  50 ms. Across runs the wall time was 175–209 ms.
- **big Code tab.** The first frame takes 78–98 ms. One j step takes 37–134 ms; each landing is corrected and
  the note is redrawn.
- **Tree clicks on big.** 6 of 6 within 3 px, in both views.
- **The DOM on big.**
  - Scrolling through all 7,213 rows in the All view peaks at 38,602 elements, against about 88,000 in v1.
  - Files more than 6,000 px from the viewport give their rows back.
  - The bound is the largest file near the viewport: one 1,768-row file is 21,475 elements alone.
- **run38.** The code column is 1,152 px. The first margin control is 13 Tab presses away. Nothing scrolls
  sideways at 1024 px, on run38 or on big.
- **Contrast.** The critic's scan finds no text below WCAG AA, in light or dark.

## Remaining gaps

- **One very long file.** It is drawn whole once it nears the viewport. A diff with single files of tens of
  thousands of lines needs row-level windowing inside a file.
- **Destructive choice.** Picking a variant clears the own text without an undo, as the owner asked.
- **«Decided» on an answered evidence request.** See point 11.
- **Narrow screens.** Below 860 px the layout stacks; it is not designed for phones.
- **Screen readers.** The roles, labels and live position were built in, but the page was not tested with a
  screen reader.
- **Prose without anchors.** The coverage prose and the change summary take no paragraph comments.

## Implementation requirements (not in the prototype)

- **Format.** One standalone offline HTML, as now.
- **Persistence and export.**
  - Local persistence of answers, drafts, deferral reasons, line and paragraph comments, «Viewed» and zone
    marks.
  - Honest handling when storage fails.
- **Export.** JSON and text export of the same schema-5 payload, plus line comments and paragraph comments
  with stable anchors.
  - A line anchor is file path, side and number, valid only for the digest of the saved diff.
  - A paragraph anchor is item id and field.
- **Without JavaScript.** A complete readable map: every file, block and verdict, with the decision cards as
  text.
- **Print.** Printing must include the lazily drawn files and the folded kept code.
- **Labels.** English and Russian wording for every new word. Most UI words in the prototype are English
  literals.
- **Contract.**
  - The contract text should match the built behaviour: Defer requires a reason, and an evidence answer is never
    «done».
  - The wording for an answered evidence request is still open.
- **Free text-selection comments.** They stay out pending the owner's judgment. The external review on PR #106
  argued for them; paragraph comments (point 19) are the prototype's narrower answer.
