# Report data

The full record of a review: one `review.json` that the response is written from and the page is drawn from. Pictures follow [visual evidence](#visual-evidence).

See the [comparison pass](#comparison-pass), [fields](#fields), [sources](#sources), [decision cards](#decision-cards), [the page](#the-page), [the next revision](#the-next-revision) and [generated files](#generated-files).

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
   What the review quotes from the conversation — the owner's task, a decision, the author's description or a
   session's hand-off — is saved beside the record (`task.md`, `discussion.md`, `description.md`) and quoted from there.
   A generated file is one block, as [generated files](#generated-files) says.
3. `node "<skill-dir>/scripts/report.mjs" check <out>/review.json` until it passes. It checks the fields, the
   references between them, and that every nonblank changed line of the saved diff belongs to exactly one block. It warns
   about a large block given one verdict, about kept blocks that serve no requirement or only requirements to confirm no
   question asks about, and about a kept unit holding an open block; for the decision-card fields, about an
   external source without a quote, a historical picture without a revision, a `ran` statement on an external source without a revision, and a card thin without broken links.
   It cannot check that the words are true, nor that a place named to reject a challenge refutes it.
4. Read the record itself back as a whole, not the printout, which leaves kept blocks to the page: the verdict,
   `now`, `target`, units, mechanism decisions and steps describe one solution; a removal leaves no orphaned state;
   the target keeps every required rule; each `does` given matches its lines. Binary changes and file modes are outside the blocks: review them and say so in `coverage`.
5. `node "<skill-dir>/scripts/report.mjs" render <out>/review.json` checks the record again, writes `review.html`
   beside it and prints the report as text, with only the blocks not kept or not linked to a requirement; the JSON is
   not changed. Link [the page](#the-page).

Where writes are not allowed, give the record inline, say which checks could not run, and make no page. A partial
review has no record and no page. A later page is drawn from the same bytes and the saved diff, with no new analysis;
new evidence that changes a conclusion makes a revised record, named as such, made as a [continuation](#the-next-revision)
of the same diff, so the owner's answers to the items it leaves unchanged come with it.

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
      "steps": [{ "text": "what to do first", "findings": [1] }],
      "requirements": [{ "id": 1, "text": "...", "source": "task", "sources": [{ "at": "task.md:3", "quote": "the task's sentence" }] },
                       { "id": 2, "text": "...", "source": "discussion", "met": "read", "not_checked": "how it looks on screen",
                         "doubt": "what contradicts it", "sources": [{ "at": "discussion.md:8", "quote": "the owner's word" }] },
                       { "id": 3, "text": "the contract may change outside legacy", "source": "discussion", "permission": true,
                         "sources": [{ "at": "discussion.md:12", "quote": "the owner's word" }] },
                       { "id": 4, "text": "older links keep working", "source": "author",
                         "sources": [{ "at": "description.md:5", "quote": "restores older links" }] }],
      "findings": [{ "id": 1, "title": "what is wrong, and no test would catch it", "direction": "behavior", "evidence": "read",
                     "at": "path:line", "what": "...", "shown_by": "the caller at path:line", "fix": "...", "breaks": [1], "untested": [1] },
                   { "id": 2, "title": "a size rule cannot change without reading the writes", "direction": "design", "evidence": "judgment",
                     "at": "path:line", "what": "...", "shown_by": "scenario 1", "fix": "...", "scenarios": [1] }],
      "checks": [{ "from": "the state to start from", "do": ["the first step", "the next"], "expect": "what a person sees",
                   "requirements": [2] }],
      "ideas": [{ "title": "the idea", "at": "path:line", "text": "what the code does now and why, what is proposed, the burden it removes and its cost",
                  "sources": [{ "ref": "/mechanisms/0" }] }],
      "screens": [{ "name": "the screen and its state", "mockup": "https://...", "before": "before.png", "after": "after.png",
                    "differences": [{ "what": "how the result differs from the mockup", "why": "the reason given" },
                                    { "what": "a difference nothing explains", "finding": 1 }],
                    "missing": "what you could not compare, and the picture that would settle it" },
                  { "name": "a panel of another revision", "mockup": "mockup.png", "after": "old.png", "match": true,
                    "historical": true, "revision": "abc123", "sources": [{ "at": "snapshots/README.md:4", "quote": "taken at abc123" }] }],
      "scenarios": [{ "id": 1, "change": "the gallery needs a wider thumbnail", "requirements": [2],
                      "now": { "edit": ["src/upload.js: storeUpload, the size loop"], "read": ["src/upload.js: the writes and the quota count in that loop"] },
                      "target": { "edit": ["src/upload.js: thumbnailSizes"], "read": [] } }],
      "units": [{ "name": "storeUpload", "jobs": ["checks the file", "picks the sizes", "writes"], "uses": ["Storage"],
                  "verdict": "split", "findings": [2], "reason": "a size rule cannot change without reading the writes around it" },
                { "name": "Storage", "existing": true, "jobs": ["keeps the files"] }],
      "mechanisms": [{ "name": "local thumbnail cache", "change": "added", "units": ["storeUpload"],
                       "purpose": "avoid reading a thumbnail twice", "basis": "assumption 3",
                       "instead": "the storage client caches reads already: src/storage.js:40",
                       "benefit": "one read saved per repeat view; frequency unknown", "cost": "a second cache to invalidate, and its tests",
                       "decision": "remove the local cache; keep the client's", "evidence": "read", "findings": [1], "blocks": [1] }],
      "target_units": [{ "name": "storeUpload", "jobs": ["checks the file", "writes each size"], "uses": ["thumbnailSizes"] },
                       { "name": "thumbnailSizes", "jobs": ["decides the sizes for an upload"] }],
      "blocks": [{ "path": "src/a.js", "added": "1-2, 10-16", "removed": "7", "unit": "storeUpload", "kind": "code",
                   "does": "...", "serves": [1], "verdict": "remove", "findings": [1] },
                 { "path": "src/a.js", "added": "20-24", "unit": "storeUpload",
                   "does": "...", "serves": [], "verdict": "question", "questions": [1] }],
      "routes": [{ "title": "an upload gets its thumbnails", "requirements": [2],
                   "steps": [{ "block": 1, "role": "picks the sizes" },
                             { "block": 2, "role": "writes each size", "via": "the sizes storeUpload returns, src/a.js:16" }] }],
      "challenges": [{ "from": "target", "point": "...", "outcome": "rejected", "at": "path:line", "note": "what that place shows" }],
      "questions": [{ "at": "path:line", "text": "which behavior to keep", "kind": "decision", "resolver": "owner",
                      "context": [{ "text": "what the code does now", "sources": [{ "ref": "/blocks/0" }] }],
                      "variants": [{ "id": "keep", "text": "keep the new behavior",
                                     "consequences": [{ "text": "what changes and what stays", "sources": [{ "ref": "/mechanisms/0" }] }] },
                                   { "id": "revert", "text": "return to the old behavior",
                                     "consequences": [{ "text": "what is lost", "sources": [{ "at": "src/a.js:7", "quote": "the old guard" }] }] }],
                      "recommendation": { "text": "keep, for this scope", "variant": "keep", "sources": [{ "ref": "/requirements/0" }] },
                      "remainingEvidence": [2] },
                    { "at": "path:line", "text": "the visual check this review could not run", "kind": "evidence", "resolver": "author",
                      "parent": { "question": 1, "variants": ["keep"] },
                      "zones": [{ "text": "the narrow widths", "sources": [{ "ref": "/coverageStructured/0" }] }] }],
      "tradeoffs": [{ "text": "the omission the owner accepted", "consequence": "what remains unknown or lost",
                      "sources": [{ "at": "discussion.md:12", "quote": "the owner's word" }] }],
      "previous": { "record": "previous/review.json", "sha256": "the previous record's digest" },
      "replies": [{ "comment": "the owner's comment, from the export", "place": "src/a.js:12, as the export named it",
                    "text": "the answer", "sources": [{ "at": "src/a.js:14", "quote": "the line" }] }],
      "coverageStructured": [{ "kind": "ran", "text": "the tests, and what they showed", "revision": "abc123",
                               "sources": [{ "at": "logs/test.txt:12", "quote": "1 failed" }] }],
      "passport": { "links": [{ "kind": "task", "label": "TASK-1", "url": "https://tracker.example/TASK-1" }],
                    "repository": "the repository", "base": "the base revision", "head": "the reviewed revision", "reviewedAt": "2026-01-01" },
      "coverage": "what you read and could not check, and the contracts with where you read each"
    }

## Comparison pass

Freeze the checked full draft and the saved diff before handing them to the reader. Without an approved reader the
reviewer is it, stage by stage — staged self-review — and keeps each stage's ledger itself. Run from the directory of the approved project toolchain:

    node "<skill-dir>/scripts/report.mjs" comparisons <out>/review.json <base-root> <head-root> > <out>/comparisons.json

The two roots contain the paths from the diff at their respective revisions. The command checks the patch lines against those files and reads installed TypeScript and PostCSS SCSS parsers when available. Use only trusted, in-scope toolchains. Without source trees, omit both roots to index two-sided replacements in the patch. Read `limits` for unsupported formats, missing sources and unindexed files. Add the evidenced comparisons the automated views miss, including one-sided changes with an unchanged peer or a consumer elsewhere. Freeze the resulting inventory before the reader sees it.

Each comparison has a unique `key`, a stage (`structure` or `paths`), a default `file`, the `property` being compared, and `left` and `right` witnesses. Each witness specifies `side` (`base` or `head`), one-based `line`, the observed `value` and optionally its own `file`. A `contrast` records additional facts measured by the parser. Use source addresses to read full expressions, context and contracts. A block description can help locate a decision; the pair's evidence comes from the sources.

The final record binds the reader's decisions to the frozen inventory with optional `comparisonReview`: `inventory` (filename beside the record), `sha256` (hash of that file's bytes), and `decisions` (one entry per issued key). For example, `{"key":"K","ref":"/ideas/0"}` links the comparison to the first idea. Use a zero-based reference to a finding, question or idea for points that reach the author. For other decisions give the key and either `settled` with a source-backed explanation, or `unchecked` with the missing evidence. A coverage count records how many pairs were decided; it does not certify the completeness of the inventory or the truth of the decisions.

Keep the stage ledgers beside the frozen draft for attribution and efficient replays. The main reviewer records the source limits and any unchecked comparisons in coverage, attaches `comparisonReview` to the reconciled record, and runs the ordinary check and render. If a stage changes, reuse earlier snapshots with matching source, inventory and instructions; label a replay from saved files when the reader's original context is unavailable.

## Fields

- **Requirements.** `source` is where it comes from, and that decides whether it binds. Established: `task`, what
  the task states; `discussion`, a decision the owner made while the work was discussed or answered on a page;
  `project`, a rule of the project instructions, such as a version bump or docs that say what the code does. To
  confirm: `author`, what only the author's account states — the description, commits or a session's hand-off;
  `contract`, an existing behaviour or interface the change may need to keep, such as a default a consumer relies on;
  `assumption`, your reading of the task's words; `question`, a point left open. Behaviour the code implements is
  never a requirement because the code implements it: what only the implementation shows is a mechanism whose
  `basis` says so. `sources`, in the [one format](#sources), show where it is stated; an established requirement
  quotes it — the task's sentence, the owner's word, the project's rule — or cites the screen it comes from, a
  mockup whose authority the task gives, and `check` refuses one that does neither. Kept code that serves only
  requirements to confirm is asked about: a question cites each of them, one decision whose variants combine
  asking for several, and `check` warns otherwise, as it does for kept code that serves no requirement. `met`: `ran`, executed and seen, or `read`,
  followed in the code; left out when unchecked or broken by a finding. A part not checked, such as how it looks,
  goes in `not_checked`, not in `text`. `doubt` says what in the code or a contract contradicts a requirement.
  `permission: true` marks a permission, not an obligation: the source alone does not express that difference,
  and a permission is never marked `met`.
- **Verdict, now, target.** A few lines each; a line starting `- ` is drawn as a list item.
- **Steps.** What to do, in order, each naming the findings it settles; left out when the recommendation is one thing.
- **Findings.** `id` is letters, digits, `_` or `-`: it travels into the page's anchors. `direction`: `behavior`, `necessity`, `design` or `tests`. `evidence`: `ran`, `read` or `judgment`.
  `shown_by` is the evidence. A candidate without evidence becomes a question only when settling it could change a conclusion or next action.
  `breaks` lists requirements shown unmet. For a test gap, `untested` lists the requirements whose regression no test would catch.
- **Checks.** Manual scenarios grounded in the code: `from`, `do`, `expect`, `requirements`. Proposals, not runs.
- **Ideas.** `title`, `text`, and `at` when the idea has a place. The text says what the code does now and why, with
  its place, what is proposed instead, the burden it removes and what it costs; an idea is optional and never a
  defect. `sources`, optional, cite what shows it, such as the mechanism it would replace.
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
- **Blocks.** `path`, `added` and `removed` line ranges, `serves` (requirement ids: a requirement the block implements
  or tests, never one it only wires to code that does — that code's route or unit carries the link), `verdict`,
  `unit`, and `does`:
  what the block does and why it is there, read from its lines and the code around them, with the reason the task, a
  requirement or the code gives — or the plain statement that no source gives one, never a guess. A kept block needs
  it as much as an open one: the owner reads it to understand the change, not only to decide.
  `fix` and `remove` name `findings`; `question`, for a premise not settled, names `questions`. `remove` means the
  target has no such code: work that belongs in another change keeps its verdict, and a step moves it.
- **Routes.** One for each behaviour the change adds or alters that runs through more than one block — where its
  data is produced, transformed and used, or how a request reaches its effect. `title` names the behaviour,
  `requirements` the ids it serves, and `steps` lists its blocks (numbers from 1) in the order the behaviour runs,
  each with its `role` there and, from the second step on, `via`: how it gets what the step before produced — a
  call, a return, an event, a stored value — with its place. Order, roles and connections are not in the diff, so the
  reviewer writes them; the page lets the owner walk a route with its code beside it.
- **Challenges.** The points the review page says to record: `from` (`target`, `critic` or `verifier`; a difference
  between the two targets is from `target`; for a point two raise, the first, the note naming the other; `reviewer`
  for a candidate of your own you set aside on a place in the code, always `rejected`, so the owner sees it was
  considered), `point`,
  `outcome` and `note`. `accepted` notes what it changed; `rejected` names in `at` the place that refutes it, and
  the note quotes it. For `owner`, the note names the fact, evidence or decision that would settle it and what depends on it.
- **Screens.** Only for a visual question: the `mockup`, `before` and `after` pictures given, the `differences` with
  their `why` or `finding`, `"match": true` when compared and equal, or what was `missing`. `historical: true` marks
  a picture of another revision, with its `revision` and `sources`; without the mark the picture's revision is
  unknown, not the current one. A historical picture never establishes the current result. Where the record's text
  already says which revision a picture shows, its mark and `revision` say the same.
- **Questions, coverage.** What is unexplained and what would settle it; what was read, what was not, where each
  contract was read, and any check that did not run. The optional fields of a question turn it into a card the
  owner can answer without opening the code; they are described under [Decision cards](#decision-cards).
  `coverageStructured`, optional, lists the same coverage as authored statements — `kind` of `ran`, `read` or
  `not_checked`, `text`, a `revision` for what was run (a `ran` statement on an external source without one is a
  warning: a claim about a checked version must name it), and `sources`; the page shows these words as written, and
  never reads a status such as "tests passed" or "merge-ready" out of the prose. Without it the page shows
  `coverage`.
- **Tradeoffs.** Optional: an omission the owner accepted, with its `text`, its `consequence` (what remains unknown
  or lost) and `sources`. A proposal to drop a binding requirement stays a question until its owner accepts it.
- **Passport.** Optional: where the change lives — `links` (each a `kind`, a `label` and an http(s) `url`),
  `repository`, `base`, `head`, `reviewedAt`; without it the page uses the title, `change.sources` and `range`.
  `range` remains the source of the scope; the passport stores no copy of the diff digest or the record digest,
  which are computed from the bytes.
- **Language.** `language` is the session's language tag, such as `en` or `ru-RU`; write the content in that
  language. The page's and the printout's own words are Russian for `ru` and `ru-*` and English for any other tag.

## Sources

Every analytical claim added by the fields below carries `sources`, a list in one format:

- `{ "ref": "/requirements/0" }` — internal: a zero-based index into a list of this record (`/findings/1`,
  `/questions/2`, `/mechanisms/0`, `/blocks/3`, ...). The check resolves it mechanically; a ref that names nothing
  is a fault. There is no shared registry of sources.
- `{ "at": "logs/test.txt:12", "revision": "abc123", "quote": "..." }` — external: the place is required, a file
  beside the record or a place in the repository at the state `range` names; the revision is required for a claim
  about a checked version, and the quote is what makes the claim travel without the file. A ref that names nothing is
  a fault; an external source without a quote is a warning.

A source shows the claim. A ref to the entry that makes it — a question cited for its own variant's consequence, a
screen for its own provenance — says only where the claim stands, and the check refuses it.

The check sees that a source is named and resolves; it does not prove that the text matches the source — that is
the verifier's work.

## Decision cards

A question is a card: `decision` (a choice), `fact` (a fact to settle) or `evidence` (evidence to
obtain). The required `kind` comes from what the question asks, never from its number. The required `text` and
`at` give the question and place; the card can also include:

- `resolver`: the role that answers, when naming one helps; questions group by kind first. Where you have a
  concrete reason to doubt that this analysis suffices — a dependency you could not read, a design judgement the
  targets or the critic dispute and the code does not settle — an `evidence` card whose resolver is another reviewer
  or model asks for one: what is uncertain, which code or question needs the look, and why it may help. Its return is
  evidence to check, never a verdict.
- `context`: self-contained facts — what happens now, how the state in question arises and what is known of how
  often, how the nearest comparable code behaves, what was before or in the mockup, what the owner already decided,
  the boundary (screen, state, width, consumer), what was read in code versus run. Each with `sources`. For a choice
  about an interface, how comparable products behave belongs here too when the plan allows the web, cited by URL;
  otherwise the context says that no comparison outside the project was made.
- `variants`: the choices of a decision, at least two, each a local stable `id` (not a localized text), a `text`,
  and `consequences` with `sources`: behavior and what the user sees, code and PR size, tests and evidence needed,
  the fate of child questions, residual risk. Only confirmed consequences; no invented ones. `check` refuses a decision with fewer
  than two variants or a variant without consequences.
- `multiple: true`: the variants combine, and the owner may take one or several; without it they exclude each other.
  Set it when one answer could not say the combination the owner may want, which they would otherwise write in their
  own words, unmatched to the variants.
- `recommendation`: always the reviewer's opinion — `text`, the `variant` it recommends (or, where the variants
  combine, the `variants` it recommends together), and `sources`; a decision needs one. Where the data leaves no
  clear recommendation, `text` opens with «Однозначной рекомендации нет» / «No clear recommendation» and gives the
  conditional rule, and no `variant` or `variants` is named; `check` refuses a decision's recommendation that does
  neither.
- `remainingEvidence`: the numbers of `evidence` questions this decision does not replace. A decision never closes
  an evidence question.
- `parent`: `{ "question": N, "variants": ["id", ...] }` — the child applies while the parent has no variant in
  effect (it is open, answered in the owner's words or deferred), and while a variant the parent's answer takes is
  one of those listed. Children are derived from `parent`; the parent stores none. An answer taking none of them makes the child not
  applicable; its answer becomes a draft and does not return silently when the parent changes again.
- `zones`: for evidence that may be closed in part, the zones to check, each with `sources`. A user's check mark
  on a zone is not evidence; closing it takes a revised record.

Numbering stays positional from 1 (`blocks.questions`, `units.questions`, the check). Decisions have three layers:
the review's verdicts in the record, the owner's answers on the page (kept in the browser and exported), and
evidence obtained in a later revision of the record. Each item takes one answer: a decision a variant — or several, where they combine — or the owner's
own words, a finding «Fix it», «Leave it» or own words, an idea «Take it», «Skip it» or own words, a fact or evidence
request the owner's answer; choosing one clears the other. Deferring needs a reason and keeps the answer it replaces
as a draft, not in effect. An answered fact or evidence request reads «Answered», never «decided» or «verified»: it
is the owner's input, not a checked result. Decisions are never carried between revisions by question number.

## The page

`report.mjs render` writes the page from the record and the saved diff alone, never a new record field. The owner
answers each item on it and exports the answers as schema 8: proposals for the next step, not edits to the source.

The export is one payload behind the page's preview, its text and its JSON: the record's and the diff's
digests, the key, the progress, and for each item its key, kind and status (`open`, `decided`, `answered`,
`deferred`, `not-applicable`) with the answer in effect — `variant` (id and text), or `variants` where they combine, `option` (`fix`, `leave`,
`take`, `skip`) or the owner's `text` — a deferral's `reason`, an answer not in effect as `draft`, marked evidence
`zones`, and `waiting_for_parent` while an ancestor whose answer decides whether the item applies is still open.
`lineComments` anchor a comment to a line of the saved diff the digest names (`path`, `side` `head` or `base`,
`line`), and `paragraphComments` to an item or a part of the report and its field (`item`, `field`). A comment made on
a selection also keeps what was selected: on several lines the last as `end`, the characters as `from` in the first
line, or in the field's text as the page shows it, and `to` in the last, and the words as `quote`. A comment never
answers an item.

The export is the owner's word for the next step. It goes, with the record, to whoever makes the change, such as the
owner's own session or orchestrate's fix round; the review applies none of it. A review of the next revision reads it as
[the next revision](#the-next-revision) says.

## The next revision

A review of a new revision of a change already reviewed and answered starts from three inputs its plan names: the
previous record with its saved diff, the owner's export of it, and the previous base and head. Without them the
review is a fresh one, and the plan says so. It is a new record, not a revised one, in a new `<out>`: copy the
previous record, its saved diff, its comparison inventory and the export into `<out>/previous/`, so what cites them resolves beside the record
and the checking agents can read them. Cite them by `at` with a quote, by file and line — `previous/export.json:14`,
`"item": "f2"` — because a `ref` resolves in this record. The export's
keys are places in the previous record — questions and ideas by number, findings by id — so it is read with it, and
only when its `record_sha256` is the sha256 of that `review.json`; otherwise ask for the matching pair. A key the
record does not hold is left out, and the response says so. A short review applies the same rules in its response.

- Read what changed since the previous head first — `git diff <previous head>..<head>` when the base stayed,
  `git range-diff <previous base>..<previous head> <base>..<head>` when it moved, the previous saved diff against
  this one when the old commits are gone — then the whole diff, and say in `coverage` how the change since was read.
  The record covers the whole diff, as any record does.
- **A continuation** reads only what changed. The plan offers it when the previous review was whole, the base stayed
  or the range-diff shows the change's own commits unaltered, no manifest or lock file changed since, and no answer
  changed a requirement the previous analysis rested on; the plan names what it skips, and anything else makes the
  review whole. After `scaffold`, `node "<skill-dir>/scripts/report.mjs" carry <out>/previous/review.json
  <out>/review.json` takes over each previous block whose changed lines read the same, in the same order and found
  once: a block the previous record kept stays kept, marked `carried`, not read again; one it did not keep keeps its
  description and is judged again. The previous requirements come with them, by their ids, so a carried block serves
  what it served; each is checked again, and the export's answers add their own. So do the units and target units,
  a unit the previous record did not keep left without a verdict to judge, the mechanisms with their carried blocks,
  and each route whose every step was carried, renumbered; what pointed at the previous findings and questions is
  this review's to write; a carried requirement's `met` and `doubt` and a unit's verdict are this review's to give
  again. The comparison inventory covers the whole diff: a key whose witnesses read as before keeps the previous
  decision, and one that pointed at a previous finding, question or idea by `ref` keeps it as `settled` text naming
  that item by its words. `previous` names the record they
  came from, and `check` proves each carried block against it; the printout and the page list the carried blocks. A
  block is kept for the code around it too, so `carry` and `check` carry it only while that stands: a block of a unit
  that changed — a block of it read again, changed or gone — or that uses one that did, at any remove through `uses`,
  is read again, its unit judged again with its reason; so is a block with no unit in a file that holds a block read
  again. Give a unit to code another file depends on, or it is carried by its own file alone. A carried requirement's
  source that pointed into the previous record by `ref` would name another entry here: `carry` leaves it out and says
  so, and a requirement left with no source is cited again. While
  the base and the requirements stand the independent target is not started again; the comparison pass, the critic
  and the verifier take the change since and the claims new or changed. A revised record at the same head — new
  evidence, the same diff — is a continuation whose change since is empty: there the page offers the answers this
  browser kept for the previous report on the items that read exactly the same in full — a conditional question under
  a parent that reads the same in full and the same variants — never by number; a record of
  a new revision takes the owner's answers through the export, as below.
- **Replies.** Each comment of the export is answered in `replies`: `comment` quoting it, `place` as the export named
  it, `text` and `sources`. Decisions › Comments lists them at the place the comment had, never placed in this diff.
- Each previous answer goes into this record's own fields; none is carried by number, and a previous item is named
  by its words — a question by its text, a finding or idea by its title — since its key names another item here:
  - an answer in effect that asks for something — a variant or several, «Fix it», «Take it» — is a requirement with
    `source: "discussion"`, its `text` naming the previous item and the answer, sourced at the export with the answer
    quoted: `met` when the new revision does it,
    and, when it does not, a finding that breaks it, or for a test still missing one that leaves it `untested`. Summary's requirements then say what the revision did with each
    decision;
  - «Leave it» or «Skip it» is a `tradeoff` with its `consequence`, sourced at the export with the answer quoted. The
    review does not raise that finding or idea again unless the new revision changes its premise, and then the
    finding says what changed;
  - own words are read for what they say: a request for a change is a requirement, an acceptance a tradeoff, and a
    question is answered in the response. A line or paragraph comment is read the same way, a requirement from it
    naming its place;
  - a question deferred or still open is asked again, its context citing the previous record and its consequences
    read at this revision; a finding or idea left open is raised again where it still holds. An answer marked
    `waiting_for_parent` is asked again with its parent, quoted in its context. A question not applicable stays
    retired while its parent's answer holds; a conditional question answered in effect is mapped like any other;
  - an answer to a fact request is the owner's statement: a requirement when it binds the change, otherwise a fact
    the analysis cites from the export, quoted — one or the other, not both. An answer to an evidence request is a claim to check, never
    evidence: what the review obtains settles it, and until then it stays an evidence question with the owner's
    answer in its context, as does a marked zone.

## Generated files

Two kinds of file are one block each, judged by their source rather than line by line: a package manager's lock
file beside its manifest, and a file the project marks generated — `linguist-generated` in `.gitattributes`, or a
header such as `@generated` or `Code generated … DO NOT EDIT`. No list names them all: the reviewer establishes from
the file and the project's tooling which tool writes it and from what, and names both in the block's `does`; a file
it cannot establish so is read. A mark counts only when the project's own tooling writes the file; a mark the change
adds is itself a change to judge, and the file is read.

- Replace the file's scaffolded blocks with one whose `added` and `removed` each span the file, such as `1-4210`:
  unchanged lines in a range are ignored, and `all` is only for a block to remove. It needs no unit. Skip its part of
  the `lines` printout. Its `does` names this section, which answers the check's warning about a large block.
- A lock file reflects each dependency the manifest adds, removes or moves to another range. A package fetched from
  outside the project's registries — a host in a field such as `resolved`, `tarball`, `source` or `remote`, a git,
  file or `http:` URL — or a hash (such as `integrity`, `checksum`, `h1:` or `hash`) changed while its version did
  not, is a finding. A package or version that neither the manifest change nor the task explains is a question, one
  listing them all. Search the lock file's diff for these rather than read it. The block is `fix` naming such
  findings, and names the question too; `question` when only the question stands; `keep` when the manifest explains
  it all.
- Another generated file: the generator or its input changed to match. Unless it is regenerated, its diff is read as
  any file's; only a lock file's searches stand in for reading.
- When the plan allows running the generator, regenerate with the project's pinned tool, lock file only and with
  install scripts off — `--ignore-scripts` beside npm's `--package-lock-only` (which alone still runs them) or pnpm's
  `--lockfile-only` — compare, and record it in `coverageStructured` as `ran`, with the command and its `revision`.
  Otherwise record it as `read`, of the manifest change and the searches. Content its source does not explain is never `keep`.

## Visual evidence

Start from the visual question. Use the pictures the task supplied first, checking they show this revision, state
and viewport; one whose identity cannot be established is uncertain evidence. A difference alone is not a defect: it is
a supported requirement, an unexplained difference or an unspecified state. A data-flow problem established from code
needs no picture. New screenshots or starting the application must be in the approved plan; a needed picture that is
missing leaves its conclusion unchecked.
