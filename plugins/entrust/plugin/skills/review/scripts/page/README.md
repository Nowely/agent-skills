# The review page

A developer's note on the page `report.mjs render` writes: one standalone, offline file in four tabs, drawn from the
record and its saved diff alone, never a new record field. The reviewer's contract is
`../../references/report-data.md`, which says only that the page is written, that the owner answers on it and what
its export returns; the skill does not link this note, since the reviewer only renders the page and gives it to the
owner.

`../page.mjs` writes the file: the record's data as one JSON island, each file's rows once in a `<noscript>` the
runtime reads back, and the report as a document (`document.mjs`) in two more. `runtime.js` and `page.css` are its
client, inlined at render; `../decisions.mjs` keeps the owner's answers and builds the export, and `../labels.mjs`
holds every word in English and Russian. A fact derived from the record — a requirement's state, a unit's and the
change's lines by verdict, a screen's provenance in `../review.mjs`'s model, a mechanism's weight and the variants a
child question applies under in the page's data — has that one owner; the runtime, the document and the printout
only word it. `evals/review-page.test.mjs` checks what the file carries, and `evals/review-page-browser.test.mjs`
drives it in Chromium, locally only.

- **Summary** opens the page: the verdict, the recommendation and its steps, the requirements with one status each,
  the coverage limits and «Start review», which goes to the first open item.
- **Decisions** shows every question, finding and idea as one card, with sub-tabs by kind, by state (deferred,
  done) and for the comments; a side panel adds the card's place, sources and related items.
- **Code** is the diff with the open decisions in its margin and kept code folded: j and k walk the open decisions,
  a decided block shrinks to one line, a file can be marked «Viewed», and the code can be filtered by requirement,
  unit and purpose and searched in every file. Purpose comes from the path alone: `__tests__/`, `*.test.*`,
  `*.spec.*`, `*.browser.mjs`, `__stories__/*.stories.*` are tests; `.scss/.css/.less/.sass/.styl` styles;
  pictures, fonts and `assets/`, `icons/`, `keysets/` assets; `.md/.mdx/.rst/.txt` and changelog/readme/license
  docs; `package.json`, lock files, `tsconfig*`, `a.yaml`, `.eslintrc` and the like config; the rest production. A
  block whose own `kind` is `test` in a production file counts as tests.
- **Details** holds the structure, mechanisms, scenarios, checks by hand, challenges, screens with their
  provenance, coverage — with the check's warnings about kept blocks that serve no requirement or only assumed
  ones — and the report's details, with the two print profiles.
- **Answering.** By click or key, in Decisions or in the code's margin, one answer per item as the data contract's
  decision cards say; a key answers only the item in view, and Undo takes its answer back. «Decided N of M» counts
  the applicable choices — decisions, findings and ideas: an item its parent makes not applicable leaves M, and a
  deferred item is not decided. An answer to a fact or evidence request is the owner's input, never a decision, so the
  requests are counted apart («requests answered N of M, not verified»); the Done sub-tab lists the decided choices
  and the answered requests. `decisions.mjs` owns these counts and what Done lists. The answers, comments,
  «Viewed» and view choices are kept in the browser under `review-report:6:<key>`; the page says when the browser
  keeps nothing for it, cannot read what it kept, or refuses a save. What it kept and cannot read is never written
  over unasked: the first save that would replace it opens it, as it is, to copy, once the action is complete and no
  field is being typed in, and only «Save this page's answers over it» replaces it; until then the answers live in the
  page's memory.
- **Comments.** On any line of the diff, and on the paragraphs of the verdict, the recommendation, a step, a card's
  fields, a scenario and a challenge; listed in Decisions › Comments and exported. One paragraph editor is open at a
  time: opening another keeps the first one's text as that paragraph's unsaved draft.
- **Export.** «Export answers» opens the preview with «Copy text», which says «Copied» only once the clipboard
  confirms and otherwise selects the text, and «Download JSON».
- **Without JavaScript, and in print.** The page holds the report as a document: the summary, every card as text,
  each file's whole diff with every block's verdict, and the details; the diff's code is in the page once. It prints
  for the owner (the summary and every decision with its answer) or for audit (also every file whole and the
  details).
- **Links** reach a tab and an item: `#summary/r1`, `#decisions/f3`, `#decisions/comments`, `#code/b12`,
  `#code/line/<file index>:<+new or -old line>`, `#details/<tab>/<row>`.
- **Syntax.** Code is highlighted at render time by a vendored Shiki bundle (`scripts/vendor/shiki.mjs`, pinned
  `@shikijs` 4.6.0, the JavaScript regex engine — no WASM, no network): each token's pair of GitHub theme colours is
  a class, pre-adjusted to ≥4.5:1 on the page's code, added and removed backgrounds of both themes. The old and the
  new line sequences are tokenized whole, so multi-line constructs keep their colouring. Without the bundle the
  built-in pattern highlighter draws the code; an unsupported language is escaped plain text. Rebuild the bundle
  as `../vendor/README.md` says.
