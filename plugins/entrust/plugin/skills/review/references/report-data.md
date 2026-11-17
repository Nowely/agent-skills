# Report data

The full record of a review: one `review.json` that the response is written from and the page is drawn from. Pictures follow [visual evidence](#visual-evidence).

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
   ideas to apply or skip, comments on any passage and copies those decisions back as text: proposals for the next
   step, not edits to the source.

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
  language needs a complete `labels` catalog (`report.mjs labels en` prints one). Write the content in that language.
  A record without the new fields needs only the catalog the report had before them; a record that uses them needs
  the new words too, so a new control is never silently left in English.

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

A question with a `kind` is a card: `decision` (a choice), `fact` (a fact to settle) or `evidence` (evidence to
obtain). The kind comes from what the question asks, never from its number. `text` and `at` remain the only
canonical text and place; the card adds:

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
The export carries the schema version, the record and diff digests, the question number, the variant id and text,
the comment and the status. Decisions are never carried between revisions by question number.

## Fallback

One renderer draws old and new records alike. A question without a `kind` keeps its place and text, with no
invented variants and no part in the decision counters; no context, no empty section; no `coverageStructured`, the
`coverage` prose; no passport, the title, `change.sources` and `range`; no variants, acceptance asks for a
substantive comment. The old findings, ideas and the apply/skip export stay. Missing optional fields are never a
warning: an old record is complete, not deficient. The content and semantics of the old report are kept, not its
exact layout.

## Visual evidence

Start from the visual question. Use the pictures the task supplied first, checking they show this revision, state
and viewport; one whose identity cannot be established is uncertain evidence. A difference alone is not a defect: it is
a supported requirement, an unexplained difference or an unspecified state. A data-flow problem established from code
needs no picture. New screenshots or starting the application must be in the approved plan; a needed picture that is
missing leaves its conclusion unchecked.
