# Critic of prototype v1

An independent critic (Opus) did six review tasks on the current page and on the prototype, in Playwright Chromium at 1440×900 and 1280×800, light and dark. The counts are scripted actions, not human timings.

## Verdict

The structure is clearly better.
- **Panel and frame.** One frame on every tab, and a finding's code beside it in Decisions.
- **Code.** Decisions in the diff margin, and j/k with a position.
- **Speed and size.** The Code tab opens in about 0.1 s instead of 0.7 s; the large page is 2.6 MB instead of 6.6 MB.
- **Comments.** Line comments can be found again.

For «any size, convenient» it still fails in four places: a cramped code column, tree navigation on the large page, a keyboard flow that stops at every decision, and «open» counted in two units.

## Must change before the owner judges it

1. **The code column is too narrow.**
   - Three columns leave the code 578 px at 1440 (about 74 characters, half the rows wrap) and 482 px at 1280.
   - The panel repeats the margin's decision and block list.
   - Fix: in Code the panel is collapsible, closed by default; the margin decides and the panel only adds context.
2. **Tree clicks land on the wrong file** on the 274-block page (4 of 6). Row heights are estimated at 20 px, but wrapping makes the real height 263k px against 156k estimated, and the page scrolls before the files above are drawn.
   - Fix: re-scroll once the files are drawn, and estimate heights with wrapping.
3. **The keyboard flow breaks.**
   - j/k stop once a radio is chosen.
   - Code has no key to decide, and focus stays on the body.
   - The first margin control is 65–81 Tab presses away.
   - Line numbers cannot be reached by keyboard.
   - Fix: decision keys on the selected item, Ctrl/⌘+Enter to save and move on, focus on the note after j, and a «Skip to diff» link.
4. **«Open» means blocks in Code and decisions in Decisions.**
   - One margin decision moves «3 of 49 open» to «31 open».
   - File headers go stale after a decision.
   - Fix: count and step by decision («decision 2 of 4 · block 3 of 18»), and refresh the headers.
5. **Eleven status labels instead of four.** The owner's «Fix» sits next to the reviewer's «Fix» verdict.
   - Fix: Open, Decided, Deferred and Not applicable as tags; the answer as text; owner options worded so they do not collide with verdict names.
6. **The file-name filter dead-ends.** «No file matches.» for a file that holds only kept code, and the footer reads «1 file hold only kept code».
   - Fix: the filter shows any matching file, with its kept code folded.

## To decide with the owner

1. **Decisions without variants** became a bare text field. Either the reviewer always supplies variants, or the page offers derived options.
2. **Progress.** The prototype counts 11 items, including optional ideas and facts; the contract counts decisions and findings (7).
3. **«Other» and a variant.** Text typed for «Other» stays hidden when a variant is chosen afterwards. The contract also requires a reason to defer, and the prototype does not ask for one.
4. **Line comments.**
   - A comment inside an open item's block is not linked to the item.
   - Comments are invisible outside Code.
   - Export: undecided.
5. **Units table.** A unit's verdict can contradict its line shares (a «Fix» unit with no fix lines). Per-verdict numbers, sorting and «Used by» are missing.
6. **Requirement status** sits below the fold of Summary, and «Met» next to «Not checked» in one cell reads as a contradiction.
7. **The panel in Decisions** repeats the card.
8. **Rendered bodies are never removed** (88k DOM nodes after a full scroll). An unlimited size needs windowing.

## Polish

- Amber marks place highlights.
- «Kept in this page only» repeats on every card.
- At 1280 the segmented control wraps.
- Wording: «Show in code», «Show in Code» and «Open in Code»; a «Decisions» sub-tab inside «Decisions»; group headings that do not match the sub-tab names.
- Two primary buttons.
- Small tree badges and two dark badges fail contrast.
- «Copy path:line» is gone.

## Hard to carry into the implementation

- **No-JS reading.** The prototype shows a loading line only.
- **Print.** Lazily drawn files print blank.
- **Export and persistence.** None yet. Line comments need stable anchors in schema 5.
- **Labels.** Most UI words are English literals, so the Russian catalog needs them.
- **Contract gaps.** Defer has no reason, and an evidence answer moves the card to Done.

## Six tasks, current page against prototype

| Task | Current | Prototype v1 |
|---|---|---|
| What it does, requirements met | Verdict on Overview; requirements one tab away, behind 115 B-chips | Verdict and recommendation on the first screen; requirements one or two screens down |
| Decide all 11 cards with their code | 16 clicks, about 11 screens of scrolling, code never beside the card | 11 clicks plus 34 keys, no scrolling; code beside 9 of 11 cards |
| Large diff: walk the open items, decide 3 in the margin | No j/k, 49 blocks over about 36 screens, no controls in Code | 49 j presses at about 32 ms each, 3 margin clicks; the count jumps and a header goes stale |
| Find a file and read it | The tree filter narrows the tree only, and the click did not scroll | «/» plus the name; a file of kept code only dead-ends; tree clicks land wrong |
| The unit with the most fix work | Graph and table; the tiles invite a wrong answer | Table and panel; the wrong answer is still invited |
| Comment on a line, find it again | Block notes only | Two clicks; listed in Code, invisible elsewhere |
