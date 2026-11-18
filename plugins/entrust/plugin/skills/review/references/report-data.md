# Report data

The full record of a review: one `review.json` that the response is written from and the page is drawn from. Pictures follow [visual evidence](#visual-evidence).

See [fields](#fields), [sources](#sources), [decision cards](#decision-cards), [the page](#the-page), and [optional fields](#optional-fields).

## Making it

1. Obtain the diff for the agreed scope, including new files where requested. At the start of the analysis,
   `node "<skill-dir>/scripts/report.mjs" scaffold <diff-file> <out>/review.json` saves a copy beside the record
   (`review.diff`) with its digest and creates one block per declaration-sized run of changed lines: in code a run
   ends at a declaration, in Markdown at a heading. The input is a two-sided text patch with `diff --git` file
   headers and unified hunks, without renames or quoted paths; a refusal names the file and the way out, and what
   is left out gets separate review. `range` says how the diff was obtained and the state its files are read at,
   such as the command with its two commits; the reviewer reads the files at that state and checks whether the diff
   includes the agreed changes. The saved diff does not establish either completeness or that a working tree stayed unchanged.
   Scaffold never replaces a record or saved diff: to start over, delete both.
2. Fill in the rest as the analysis goes. A block that holds two decisions is divided: copy it and split its line
   ranges between the copies; a copy left with only removed lines drops `added`, and one with only added lines drops
   `removed`. `node "<skill-dir>/scripts/report.mjs" lines <out>/review.json` prints every changed line of the saved
   diff with the address a block uses. Places cited anywhere in the record are at the state `range` names unless marked `(base)`.
3. `node "<skill-dir>/scripts/report.mjs" check <out>/review.json` until it passes. It checks the fields, the
   references between them, and that every nonblank changed line of the saved diff belongs to exactly one block. It warns
   about a large block given one verdict, about kept blocks that serve no requirement or only assumed ones, and
   about a kept unit holding an open block; for the decision-card fields, about a source named but unreachable, an
   external source without a quote, a historical picture without a revision, a `ran` statement on an external source without a revision, and a card thin without broken links.
   It cannot check that the words are true, nor that a place named to reject a challenge refutes it.
4. Read the record itself back as a whole, not the printout, which leaves kept blocks to the page: the verdict,
   `now`, `target`, units, mechanism decisions and steps describe one solution; a removal leaves no orphaned state;
   the target keeps every required rule; each `does` given matches its lines. Binary changes and file modes are outside the blocks: review them and say so in `coverage`.
5. `node "<skill-dir>/scripts/report.mjs" render <out>/review.json` checks the record again, writes `review.html`
   beside it and prints the report as text, with only the blocks not kept or not linked to a requirement; the JSON is
   not changed. Link the page. On it the user marks findings and
   ideas to apply or skip, decides the question cards, comments on any passage and copies those decisions back
   as text or downloads them as JSON: proposals for the next step, not edits to the source.

Where writes are not allowed, give the record inline, say which checks could not run, and make no page. A partial
review has no record and no page. A later page is drawn from the same bytes and the saved diff, with no new analysis;
new evidence that changes a conclusion makes a revised record, named as such.

## Format

    {
      "title": "a short name of the change", "language": "en",
      "range": "how the diff was obtained and the state its files are read at", "diff": { "file": "review.diff", "sha256": "the saved diff's digest" },
      "change": { "goal": "what the change is for, in a sentence", "why": "the reason, when a source gives one",
                  "parts": ["what it adds or alters, one line each"], "sources": ["the task text", "the change"] },
      "verdict": "whether the change does its task\n- what decides that, a line each",
      "now": "the solution as written",
      "target": "the cleanest solution, by the design standard",
      "recommendation": "accept, fix in place or rewrite as the target, in a sentence",
      "steps": [{ "text": "what to do first", "findings": [1] }, { "text": "what to do next", "findings": [2] }],
      "requirements": [{ "id": 1, "text": "...", "source": "task" },
                       { "id": 2, "text": "...", "source": "discussion", "met": "read", "not_checked": "how it looks on screen",
                         "doubt": "what contradicts it" },
                       { "id": 3, "text": "the contract may change outside legacy", "source": "discussion", "permission": true }],
      "findings": [{ "id": 1, "title": "what is wrong", "direction": "behavior", "evidence": "read",
                     "at": "path:line", "what": "...", "shown_by": "the caller at path:line", "fix": "...", "breaks": [1] },
                   { "id": 3, "title": "a size rule cannot change without reading the writes", "direction": "design", "evidence": "judgment",
                     "at": "path:line", "what": "...", "shown_by": "scenario 1", "fix": "...", "scenarios": [1] },
                   { "id": 2, "title": "what no test would catch", "direction": "tests", "evidence": "read",
                     "at": "path:line", "what": "...", "shown_by": "the regression that passes", "fix": "...", "untested": [2] }],
      "checks": [{ "from": "the state to start from", "do": ["the first step", "the next"], "expect": "what a person sees",
                   "requirements": [2] }],
      "ideas": [{ "title": "the idea", "at": "path:line", "text": "what it gains and what it costs" }],
      "screens": [{ "name": "the screen and its state", "mockup": "https://...", "before": "before.png", "after": "after.png",
                    "differences": [{ "what": "how the result differs from the mockup", "why": "the reason given" },
                                    { "what": "a difference nothing explains", "finding": 1 }],
                    "missing": "what you could not compare, and the picture that would settle it" },
                  { "name": "a screen whose result is the mockup", "mockup": "mockup.png", "after": "after.png", "match": true },
                  { "name": "a panel of another revision", "after": "old.png", "historical": true, "revision": "abc123",
                    "sources": [{ "at": "snapshots/README.md:4", "quote": "taken at abc123" }], "missing": "the current revision was not compared" }],
      "scenarios": [{ "id": 1, "change": "the gallery needs a wider thumbnail", "requirements": [2],
                      "now": { "edit": ["src/upload.js: storeUpload, the size loop"], "read": ["src/upload.js: the writes and the quota count in that loop"] },
                      "target": { "edit": ["src/upload.js: thumbnailSizes"], "read": [] } }],
      "units": [{ "name": "storeUpload", "jobs": ["checks the file", "picks the sizes", "writes"], "uses": ["Storage"],
                  "verdict": "split", "findings": [3], "reason": "a size rule cannot change without reading the writes around it" },
                { "name": "Storage", "existing": true, "jobs": ["keeps the files"] }],
      "mechanisms": [{ "name": "local thumbnail cache", "change": "added", "units": ["storeUpload"],
                       "purpose": "avoid reading a thumbnail twice", "basis": "assumption 3",
                       "instead": "the storage client caches reads already: src/storage.js:40",
                       "benefit": "one read saved per repeat view; frequency unknown", "cost": "a second cache to invalidate, and its tests",
                       "decision": "remove the local cache; keep the client's", "evidence": "read", "findings": [1], "blocks": [1] }],
      "target_units": [{ "name": "storeUpload", "jobs": ["checks the file", "writes each size"],
                         "uses": ["thumbnailSizes", "Storage"] },
                       { "name": "thumbnailSizes", "jobs": ["decides the sizes for an upload"] },
                       { "name": "Storage", "existing": true, "jobs": ["keeps the files"] }],
      "blocks": [{ "path": "src/a.js", "added": "1-2, 10-16", "removed": "7", "unit": "storeUpload", "kind": "code",
                   "does": "...", "serves": [1], "verdict": "remove", "findings": [1] },
                 { "path": "src/a.js", "added": "20-24", "unit": "storeUpload",
                   "does": "...", "serves": [], "verdict": "question", "questions": [1] }],
      "challenges": [{ "from": "critic", "point": "...", "outcome": "accepted", "note": "what it changed in the record" },
                     { "from": "target", "point": "...", "outcome": "rejected", "at": "path:line", "note": "what that place shows" },
                     { "from": "verifier", "point": "...", "outcome": "owner", "note": "what the owner decides" }],
      "questions": [{ "at": "path:line", "text": "what is unexplained, and what would settle it" },
                    { "at": "path:line", "text": "which behavior to keep", "kind": "decision", "resolver": "owner",
                      "context": [{ "text": "what the code does now", "sources": [{ "ref": "/blocks/0" }] }],
                      "variants": [{ "id": "keep", "text": "keep the new behavior",
                                     "consequences": [{ "text": "what changes and what stays", "sources": [{ "ref": "/mechanisms/0" }] }] },
                                   { "id": "revert", "text": "return to the old behavior",
                                     "consequences": [{ "text": "what is lost", "sources": [{ "at": "src/a.js:7", "quote": "the old guard" }] }] }],
                      "recommendation": { "text": "keep, for this scope", "variant": "keep", "sources": [{ "ref": "/requirements/0" }] },
                      "remainingEvidence": [3] },
                    { "at": "path:line", "text": "what the contract guarantees", "kind": "fact", "resolver": "author",
                      "parent": { "question": 2, "variants": ["keep"] } },
                    { "at": "path:line", "text": "the visual check this review could not run", "kind": "evidence",
                      "zones": [{ "text": "the narrow widths", "sources": [{ "ref": "/coverageStructured/0" }] }] }],
      "tradeoffs": [{ "text": "the omission the owner accepted", "consequence": "what remains unknown or lost",
                      "sources": [{ "at": "discussion.md:12", "quote": "the owner's word" }] }],
      "coverageStructured": [{ "kind": "ran", "text": "the tests, and what they showed", "revision": "abc123",
                               "sources": [{ "at": "logs/test.txt:12", "quote": "1 failed" }] },
                             { "kind": "read", "text": "the contracts read, with their places", "sources": [{ "ref": "/requirements/1" }] },
                             { "kind": "not_checked", "text": "what was not checked, and why", "sources": [{ "ref": "/questions/2" }] }],
      "passport": { "links": [{ "kind": "task", "label": "TASK-1", "url": "https://tracker.example/TASK-1" }],
                    "repository": "the repository", "base": "the base revision", "head": "the reviewed revision", "reviewedAt": "2026-01-01" },
      "coverage": "what you read and could not check, and the contracts with where you read each",
      "labels": { "findings": "the report's own word, in the user's language" }
    }

## Fields

- **Requirements.** `source`: `task`, what the task states; `discussion`, a decision made while the work was discussed;
  `project`, a rule of the project instructions named with its place, such as a version bump or docs that say what the code does;
  `question`, a point left open; `assumption`, yours or the author's. `met`: `ran`, executed and seen, or `read`,
  followed in the code; left out when unchecked or broken by a finding. A part not checked, such as how it looks,
  goes in `not_checked`, not in `text`. `doubt` says what in the code or a contract contradicts a requirement.
  `permission: true` marks a permission, not an obligation: the source alone does not express that difference,
  and a permission is never marked `met`.
- **Verdict, now, target.** A few lines each; a line starting `- ` is drawn as a list item.
- **Steps.** What to do, in order, each naming the findings it settles; left out when the recommendation is one thing.
- **Findings.** `id` is letters, digits, `_` or `-`: it travels into the page's anchors. `direction`: `behavior`, `necessity`, `design` or `tests`. `evidence`: `ran`, `read` or `judgment`.
  `shown_by` is what shows it; a candidate with nothing to put there is a question. `breaks` lists requirements shown
  unmet; a finding about tests lists under `untested` the requirements whose regression no test would catch.
- **Checks.** Manual scenarios grounded in the code: `from`, `do`, `expect`, `requirements`. Proposals, not runs.
- **Ideas.** `title`, `text`, and `at` when the idea has a place.
- **Scenarios.** Optional: a change grounded in the task walked through the code and the target, with the places
  edited and read in each (`now`, `target`); a finding may name them in `scenarios`.
- **Units.** As written: `jobs`, `uses`, a `verdict` of `keep`, `fix`, `split`, `merge`, `remove` or `question`, its
  `reason`, and its `findings`, or for a question its `questions`, unless kept. Each name in `uses` is a unit listed
  here; `"existing": true` marks untouched code listed because the change calls it or is called by it. **Target units** are the same for the target; a name that is neither carried over nor existing is to
  be written.
- **Mechanisms.** `name`, `change` (`added`, `reused`, `changed` or `removed`), `units`, `purpose`, `basis` (the
  requirements and contracts), `benefit`, `cost`, `decision` and `evidence`. An added or changed mechanism has
  `instead`, citing where the existing capability or its absence was read. `benefit` names the scenario served, what is lost without it and how often,
  or that frequency is unknown. `blocks` may list the numbers of the mechanism's blocks, to show its weight; each
  block listed then names its own `kind`: `code`, `test` or `other`; a block two mechanisms list is shown as shared, and a block that
  mixes other work, shared imports included, is left out. Weigh the mechanisms specified in [Analyse](../SKILL.md#analyse); with two or more weighed, the report
  also gives the lines they touch together, each block counted once.
- **Blocks.** `path`, `added` and `removed` line ranges, `serves` (requirement ids), `verdict`, `unit`, and `does`,
  which a kept block may leave out.
  `fix` and `remove` name `findings`; `question`, for a premise not settled, names `questions`, numbered from 1 in
  the list of questions. `remove` means the target has no such code: work that belongs in another change keeps its
  verdict, and a step moves it.
- **Challenges.** The points the review page says to record: `from` (`target`, `critic` or `verifier`; a difference
  between the two targets is from `target`; for a point two raise, the first, the note naming the other), `point`,
  `outcome` and `note`. `accepted` notes what it changed; `rejected` names in `at` the place that refutes it, and
  the note quotes it; `owner` is every other point, and the note says what the owner decides.
- **Screens.** Only for a visual question: the `mockup`, `before` and `after` pictures given, the `differences` with
  their `why` or `finding`, `"match": true` when compared and equal, or what was `missing`. `historical: true` marks
  a picture of another revision, with its `revision` and `sources`; without the mark the picture's revision is
  unknown, not the current one. A historical picture never establishes the current result.
- **Questions, coverage.** What is unexplained and what would settle it; what was read, what was not, where each
  contract was read, and any check that did not run. The optional fields of a question turn it into a card the
  owner can answer without opening the code; they are described under [Decision cards](#decision-cards).
  `coverageStructured` lists the same coverage as authored statements — `kind` of `ran`, `read` or `not_checked`,
  `text`, a `revision` for what was run (a `ran` statement on an external source without one is a warning: a claim
  about a checked version must name it), and `sources`; the page shows these words as written, and never
  reads a status such as "tests passed" or "merge-ready" out of the prose.
- **Tradeoffs.** Optional: an omission the owner accepted, with its `text`, its `consequence` (what remains unknown
  or lost) and `sources`. A proposal to drop a binding requirement stays a question until its owner accepts it.
- **Passport.** Optional: where the change lives — `links` (each a `kind`, a `label` and an http(s) `url`),
  `repository`, `base`, `head`, `reviewedAt`. `range` remains the source of the scope; the passport stores no copy
  of the diff digest or the record digest, which are computed from the bytes.
- **Language.** `language` is the session's language code; built-in `en` and `ru` cover every control. Another
  language needs a `labels` catalog (`report.mjs labels en` prints one). Write the content in that language.
  The catalog a record needs is the old base set plus, for a record that uses any new field, the chrome words
  (tabs, theme, map reader, filters, export, no-script notes) and the words of every capability it shows — the
  viewer for pictures, the cards, passport, coverage, tradeoffs, permission and historical marks — so a control
  is never silently left in English on a record authored for this version. An old record without the new fields
  still falls back to built-in words for the older chrome. **Breaking change:** every custom catalog, including
  one on an old record, must also translate the exact `code.requirement`, `code.all-requirements`, `code.files`,
  `code.units`, `code.select-requirement`, `code.no-related`, `code.no-visible`, `code.no-unit`, `code.linked`,
  `code.visible`, and `code.filters-cleared` keys. The v8 report also requires `tab.remaining`, `tree.filter`,
  `export.storage-explanation`, `decision.export-local-method`, `storage.failed`, `choice.count.decisions`,
  `choice.count.findings`, `choice.count.deferred`, `choice.dependent`, `choice.unanswered`,
  `choice.waiting-parent`, `choice.filter-editing`, `annotation.added`, `annotation.unverified`,
  `annotation.proof-note`, `tree.visible-files`, and `tree.files`
  for every custom catalog. Decision, dependent decision and fact/evidence capabilities respectively add
  `export.open-decisions`, `export.open-dependent`, and `export.open-requests`. Fact/evidence requests also
  require `answer.status.entered`; dependent requests require `answer.status.waiting-parent` and
  `answer.status.not-applicable`.
  Dependent decisions also require `decision.selection-waiting`. Decision variants and dependent
  variants respectively add `decision.draft-local` and `decision.gate-draft-local`. The old keys
  `export.dialog-note`, `decision.export-method`, `decision.draft-deferred`, and `decision.gate-draft` no longer
  control these messages; existing overrides must be translated under the new keys. Sources add the keys their
  fields use: `source.internal`, `source.self`, `source.quoted`, and/or `source.mention`. Self means a question's
  own `/questions/N` reference; a quote is supplied text, not a verified source. `check` lists all missing keys.
  `source.each` is required only if a context or one variant's consequences contain at least two claims with
  identical, nonempty, ordered source arrays. The page names that set once as the sources for each item; it does
  not combine different groups or sources with different fields, order, revisions, or quotations.
  Translate each distinction accurately; `annotation.added` describes an in-memory change, not a successful
  storage write. Built-in `en` and `ru` need no catalog updates. Invalid language tags are rejected by `check`
  using `Intl.getCanonicalLocales`; previously accepted invalid tags must be corrected.

  Schema 5 includes `waitingForParent`: entries `{question, parent, kind}` are applicable unanswered decisions or
  unanswered fact/evidence requests waiting for the named ancestor. Accepted or reasonedly deferred decisions
  and requests with an answer are excluded; their existing data remains in the export. The list does not change
  applicability or mean an answer is verified. A deferred parent retains its existing behavior. An accepted decision whose ancestor is still unresolved
  has an additive `waiting_parent: N` on its question entry: the choice remains recorded, not an unanswered
  item, but is conditional on QN. The `factAnswerStatuses` object maps each known
  fact/evidence answer ID with nonblank content to `{status: "entered"}`, `{status: "waiting-parent", parent: N}`,
  or `{status: "not-applicable"}`. It uses the same applicability and parent gate as the page. IDs that do not
  identify a known fact/evidence question, and blank answers, remain untouched in
  `factAnswers` without an invented status. The statuses never mean
  verified; raw answers and zones remain unchanged.
  A current passage contains `quote`, `where`, and `note`, and optionally a `proof` of kind `field`,
  `related-code`, `range`, or `code`. The report checks the document and relevant structure before locating a
  passage; unsupported or unconfirmed passages remain saved and exported without a location link. It does not
  guess a relocation. Old passage state and old anchors are not read.

## Sources

Every analytical claim added by the fields below carries `sources`, a list in one format:

- `{ "ref": "/requirements/0" }` — internal: a zero-based index into a list of this record (`/findings/1`,
  `/questions/2`, `/mechanisms/0`, `/blocks/3`, ...). The check resolves it mechanically; a ref that names nothing
  is a fault. There is no shared registry of sources.
- `{ "at": "logs/test.txt:12", "revision": "abc123", "quote": "..." }` — external: the place is required; the
  revision is required for a claim about a checked version, and the quote is what makes the claim travel without
  the file. A source named but unreachable, or external without a quote, is a warning, not a fault.

The check sees that a source is named and resolves; it does not prove that the text matches the source — that is
the verifier's work.

## Decision cards

A question is a card: `decision` (a choice), `fact` (a fact to settle) or `evidence` (evidence to
obtain). The required `kind` comes from what the question asks, never from its number. The required `text` and
`at` give the question and place; the card can also include:

- `resolver`: the role that answers, when naming one helps; questions group by kind first.
- `context`: self-contained facts — what happens now, what was before or in the mockup, what the owner already
  decided, the boundary (screen, state, width, consumer), what was read in code versus run. Each with `sources`.
- `variants`: the choices of a decision, each a local stable `id` (not a localized text), a `text`, and
  `consequences` with `sources`: behavior, code and PR size, tests and evidence needed, the fate of child
  questions, residual risk. Only confirmed consequences; no invented ones.
- `recommendation`: always the reviewer's opinion — `text`, an optional `variant` it recommends, and `sources`.
  Where the data is thin, say so and give the conditional rule instead of filling the field formally.
- `remainingEvidence`: the numbers of `evidence` questions this decision does not replace. A decision never closes
  an evidence question.
- `parent`: `{ "question": N, "variants": ["id", ...] }` — the child applies while the parent is undecided, and
  while the parent's accepted variant is one of those listed. Children are derived from `parent`; the parent
  stores none. An accepted variant outside the list makes the child not applicable; its answer leaves the active
  decisions and does not return silently when the parent changes again.
- `zones`: for evidence that may be closed in part, the zones to check, each with `sources`. A user's check mark
  on a zone is not evidence; closing it takes a revised record.

Numbering stays positional from 1 (`blocks.questions`, `units.questions`, the check). Decisions have three layers:
the review's verdicts in the record, the user's decisions on the page (stored and exported), and evidence obtained
in a later revision of the record. Accepting a decision needs a chosen variant, or — where there are no variants —
a substantive comment; deferring needs a reason in a comment; an evidence question cannot be closed as "decided".
On the page a variant radio is the decision on every screen size: picking it accepts at once, another pick changes
it, Reset clears it — one reversible choice, no separate mobile draft-and-confirm step. A made choice reads as a
neutral «Selected», never a success badge. Deferring keeps a picked variant as a draft, and a child retired by its
parent keeps its pick as a draft too — neither is in effect, and neither returns silently when the parent changes
again. A fact or evidence card carries an answer field on its surface: an entered answer reads «answer entered»
(amber), never «verified» — it is the owner's input, not a checked result, and a zone mark without evidence is not
a confirmation either. Where the data leaves no clear recommendation, the reviewer's `recommendation.text` opens
with «Однозначной рекомендации нет» / «No clear recommendation» and names no `variant`: the page shows that text
in the card's limit slot on the surface, not as a direction. The export (schema 5) carries the record and diff
digests, the question number, the variant id and text, the comment and the status; `variant_draft` marks a saved
variant that is not in effect (deferred or not applicable), `applyWithoutVariant` lists the questions accepted by
comment alone, and `factAnswers` carries the entered fact answers apart from the comments. Decisions are never
carried between revisions by question number.

## The page

One renderer draws the page; the v5 layout is presentation over the same record, and every part of it is derived,
never a new record field:

- **Tabs.** Overview, Choices, Code, Checks, Materials — the page starts at Choices. The Q decisions, F findings
  and I ideas stand in ONE list there (each card exactly once), grouped by the next action: the owner's choice
  (conditional children under their parent), the proposed fixes with the optional ideas, the facts and checks,
  and the settled group. Subtab filters (All / Decisions / Findings / Ideas / Facts·checks / Deferred / Done)
  filter that one list; settled cards move into compact expandable rows and return home when the choice reverts,
  with the focus on the row's summary. The read-only matter — passport, status, counters, verdict, now→target,
  structure, tradeoffs, mechanisms — lives in Overview; the requirements, manual checks and challenges in Checks;
  screens, coverage and the print controls in Materials. Per-tab scroll memory and deep links (`#qN`, `#fN`,
  `#iN`, `#bN`, `#mN`, `#shot-N`, `#panel-<id>`, `#qN-code`/`#fN-code`; the v4 `#panel-findings` aliases to
  Choices; a bare `#shotN` lands on the same shot). Without JavaScript the panels stack, the tabs are anchor
  links, the controls ship disabled, and the Choices badge is the static count of the open main decisions plus
  findings with a title that says saved answers are not counted.
- **Cards.** One shell for Q/F/I/fact: head (type, id, status) → essence → limit on the surface → choice →
  comment → disclosures (basis and sources, related code, checks). The limit slot shows the record's own words —
  the «no clear recommendation» text, the finding's evidence kind, the idea's explicit absence of limit data —
  never invented ones. Comments are one compact pattern on cards and blocks: closed by default, the saved text
  with «Edit» and «saved in this browser, not sent»; the export collects them from every tab.
- **Purpose.** Each touched file is classified by its path alone — `production`, `tests`, `styles`, `assets`,
  `docs`, `config` — and the purpose toggles hide groups (several at once) in the map AND the tree, with a
  «Hidden» chip; a reset or a deep link to a hidden block restores them. The rules, disclosed beside the filter:
  `__tests__/`, `*.test.*`, `*.spec.*`, `*.browser.mjs`, `__stories__/*.stories.*` are tests; `.scss/.css/.less/.sass/.styl` are
  styles; pictures, fonts and `assets/`, `icons/`, `keysets/` are assets; `.md/.mdx/.rst/.txt` and
  changelog/readme/license are docs; `package.json`, lock files, `tsconfig*`, `a.yaml`, `.eslintrc` and the like
  are config; the rest is production. A block whose own `kind` is `test` in a production file counts as tests.
  The counters are the model's; the lines are the sum of block sizes.
- **The tree and the map reader.** The tree opens statically, one line per file (the diff mark, the basename,
  +N/−M, the count not kept); the name filter highlights the match and Enter opens the first; a click reveals
  the file's blocks in any verdict mode through every ancestor, subject to the active requirement and purpose
  filters; the scrollspy marks the
  current file; the collapse persists. One line per fragment (verdict dot, B-permalink, what it does, verdict
  tag, F/Q links, source, details), the code in a disclosure, a popover with the fragment's sources: an added
  line at the head revision, a removed line at the base, each copyable as `path:line (revision)`; without a
  passport the copy is `path:line` alone. Kept fragments start collapsed; the default view shows what needs
  attention, the full audit is one click away.
- **Code by requirement.** The Code tab's requirement selector uses each block's recorded `serves` links;
  counts are unique blocks, not lines or fragments, and a block can serve more than one requirement. A
  requirement with no linked blocks is distinct from an empty intersection with the current filters.
  Selecting a requirement replaces the active question or finding context while keeping hidden purposes.
  Files and Units are navigation views of the same slice, not separate copies of the diff. Units group blocks
  by their recorded `unit`; they do not assert a parent-child relationship between blocks. Following a block
  opens the canonical fragment in the map. Without JavaScript the selector and unit navigation are disabled
  and the full static map remains available.
- **Syntax.** Code is highlighted at render time by a vendored Shiki bundle (`scripts/vendor/shiki.mjs`, pinned
  `@shikijs` 4.6.0, the JavaScript regex engine — no WASM, no network): both GitHub themes in every span, token
  colors pre-adjusted to ≥4.5:1 on the context, added and removed backgrounds of both themes. The old and the new
  line sequences are tokenized whole, so multi-line constructs keep their coloring. Without the bundle the
  built-in pattern highlighter draws the code; an unsupported language is escaped plain text. Rebuild the bundle
  as `scripts/vendor/README.md` says.
- **Export.** «Export answers» in the header above the tabs opens a native dialog from any tab. ONE model feeds
  the preview, the text and the JSON: all three are views of the SAME schema-5 payload «Download JSON» writes,
  never a second builder reading the state apart. It carries the accepted Q/F/I (including «Do not fix»/«Do not
  take»), the deferred with or without a variant, drafts, not-applicable children, fact answers, marked zones
  (a mark is never a confirmation) and comments with their context — card, block and selected text. Located
  comments have a «Go» link that opens the tab and target. «Copy text»
  says «Copied» only after the clipboard confirms, and on refusal selects the readonly text and says to press
  Ctrl/⌘+C. The popover's source copy is honest the same way. A partial export is acceptable; the counter of
  what remains travels with it.
- **Print.** The owner profile hides the map and the tree and prints the decisions complete — the lazy «related
  code» bodies are built first, then every nested disclosure opens; the auditor prints everything, every
  fragment. After printing, the page returns to what it was, lazy files and filter views included.

## Optional fields

`kind`, `at` and `text` are required for each question; the remaining card fields are optional. Without
`coverageStructured`, the page uses the `coverage` prose; without a passport, it uses the title, `change.sources`
and `range`. Without variants, accepting a decision requires a substantive comment.

## Visual evidence

Start from the visual question. Use the pictures the task supplied first, checking they show this revision, state
and viewport; one whose identity cannot be established is uncertain evidence. A difference alone is not a defect: it is
a supported requirement, an unexplained difference or an unspecified state. A data-flow problem established from code
needs no picture. New screenshots or starting the application must be in the approved plan; a needed picture that is
missing leaves its conclusion unchecked.
