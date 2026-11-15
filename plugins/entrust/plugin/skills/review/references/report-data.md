# Report data

The full record of a review: one `review.json` that the response is written from and the page is drawn from. Pictures follow [visual evidence](#visual-evidence).

## Making it

1. `node "<skill-dir>/scripts/report.mjs" scaffold <range> <out>/review.json`, in the reviewed repository, writes
   the record's mechanical part: the diff's base, head and digest, a copy of the diff beside the record, and one
   block per run of changed lines with its line numbers. It never replaces an existing record.
2. Fill in the rest from the analysis. A block that holds two decisions is divided: copy it and split its line
   ranges between the copies. `node "<skill-dir>/scripts/report.mjs" lines <range>` prints every changed line with
   the address a block uses.
3. `node "<skill-dir>/scripts/report.mjs" check <out>/review.json` until it passes. It checks the fields, the
   references between them and that every changed line belongs to exactly one block; its messages say what to fix.
   It cannot check that the words are true.
4. Read the record back as a whole: the verdict, `now`, `target`, units, mechanism decisions and steps describe one
   solution; a removal leaves no orphaned state; the target keeps every required rule; each block's `does` matches
   its lines. Binary changes and file modes are outside the blocks: review them and say so in `coverage`.
5. Where writes are not allowed, give the record inline and say which checks could not run.

A later page is drawn from the same bytes and the saved diff, with no new analysis. New evidence that changes a
conclusion makes a revised record, named as such.

## Format

    {
      "title": "a short name of the change", "language": "en",
      "range": "main...HEAD",
      "change": { "goal": "what the change is for, in a sentence", "why": "the reason, when a source gives one",
                  "parts": ["what it adds or alters, one line each"], "sources": ["the task text", "the commits"] },
      "verdict": "whether the change does its task\n- what decides that, a line each",
      "now": "the solution as written",
      "target": "the cleanest solution, by the design standard",
      "recommendation": "accept, fix in place or rewrite as the target, in a sentence",
      "steps": [{ "text": "what to do first", "findings": [1] }, { "text": "what to do next", "findings": [2] }],
      "requirements": [{ "id": 1, "text": "...", "source": "task" },
                       { "id": 2, "text": "...", "source": "discussion", "met": "read", "not_checked": "how it looks on screen",
                         "doubt": "what contradicts it" }],
      "findings": [{ "id": 1, "title": "what is wrong", "direction": "behavior", "evidence": "read",
                     "at": "path:line", "what": "...", "shown_by": "the caller at path:line", "fix": "...", "breaks": [1] },
                   { "id": 3, "title": "the import cannot take a rule without its writes", "direction": "design", "evidence": "judgment",
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
                  { "name": "a screen whose result is the mockup", "mockup": "mockup.png", "after": "after.png", "match": true }],
      "scenarios": [{ "id": 1, "change": "rows from a blocked domain are rejected with a reason", "requirements": [2],
                      "now": { "edit": ["src/import.js: importContacts, the loop"], "read": ["src/import.js: the counters and the writes in that loop"] },
                      "target": { "edit": ["src/import.js: planImport"], "read": [] } }],
      "units": [{ "name": "importContacts", "jobs": ["parses", "validates", "writes"], "uses": ["ContactStore"],
                  "verdict": "split", "findings": [3], "reason": "a rule cannot change without reading the writes around it" },
                { "name": "ContactStore", "existing": true, "jobs": ["keeps the contacts"] }],
      "mechanisms": [{ "name": "bounded import retries", "change": "added", "units": ["importContacts"],
                       "purpose": "retry transient writes", "basis": "task requirement 1",
                       "instead": "the shared writer retries already: src/store.js:40",
                       "benefit": "survive transient failures; frequency unknown", "cost": "duplicate retry state, latency and tests",
                       "decision": "remove local retries; retain the shared writer policy", "evidence": "judgment", "findings": [1] }],
      "target_units": [{ "name": "importContacts", "jobs": ["reads the rows", "applies the plan"],
                         "uses": ["planImport", "ContactStore"] },
                       { "name": "planImport", "jobs": ["decides what each row does"] },
                       { "name": "ContactStore", "existing": true, "jobs": ["keeps the contacts"] }],
      "blocks": [{ "path": "src/a.js", "added": "1-2, 10-16", "removed": "7", "unit": "importContacts",
                   "does": "...", "serves": [1], "verdict": "remove", "findings": [1] }],
      "questions": [{ "at": "path:line", "text": "what is unexplained, and what would settle it" }],
      "coverage": "what you read and could not check, and the contracts with where you read each",
      "labels": { "findings": "the report's own word, in the user's language" }
    }

## Fields

- **Requirements.** `source`: `task`, the task as given; `discussion`, a decision made while the work was discussed;
  `question`, a point left open; `assumption`, yours or the author's. `met`: `ran`, executed and seen, or `read`,
  followed in the code; left out when unchecked or broken by a finding. A part not checked, such as how it looks,
  goes in `not_checked`, not in `text`. `doubt` says what in the code or a contract contradicts a requirement.
- **Verdict, now, target.** A few lines each; a line starting `- ` is drawn as a list item.
- **Steps.** What to do, in order, each naming the findings it settles; left out when the recommendation is one thing.
- **Findings.** `direction`: `behavior`, `necessity`, `design` or `tests`. `evidence`: `ran`, `read` or `judgment`.
  `shown_by` is what shows it; a candidate with nothing to put there is a question. `breaks` lists requirements shown
  unmet; a finding about tests lists under `untested` the requirements whose regression no test would catch.
- **Checks.** Manual scenarios grounded in the code: `from`, `do`, `expect`, `requirements`. Proposals, not runs.
- **Ideas.** `title`, `text`, and `at` when the idea has a place.
- **Scenarios.** Optional: a change grounded in the task walked through the code and the target, with the places
  edited and read in each (`now`, `target`); a finding may name them in `scenarios`.
- **Units.** As written: `jobs`, `uses`, a `verdict` of `keep`, `fix`, `split`, `merge` or `remove`, its `reason`,
  and its findings unless kept. `"existing": true` marks untouched code listed because the change calls it or is
  called by it. **Target units** are the same for the target; a name that is neither carried over nor existing is to
  be written.
- **Mechanisms.** `name`, `change` (`added`, `reused`, `changed` or `removed`), `units`, `purpose`, `basis` (the
  requirements and contracts), `benefit`, `cost`, `decision` and `evidence`. An added or changed mechanism has
  `instead`, citing the `path:line` read. `benefit` names the scenario served, what is lost without it and how often,
  or that frequency is unknown. `blocks` may list the numbers of blocks wholly the mechanism's, each with a `kind` of
  `code`, `test` or `other`, to show its weight; leave it out when the blocks mix other work.
- **Blocks.** `path`, `added` and `removed` line ranges, `does`, `serves` (requirement ids), `verdict` (`keep`, `fix`
  or `remove`, the latter two naming findings) and `unit`. An empty `serves` is a lead, not proof of redundancy.
- **Screens.** Only for a visual question: the `mockup`, `before` and `after` pictures given, the `differences` with
  their `why` or `finding`, `"match": true` when compared and equal, or what was `missing`.
- **Questions, coverage.** What is unexplained and what would settle it; what was read, what was not, and where each
  contract was read.
- **Language.** `language` is the session's language code; built-in `en` and `ru` cover every control. Another
  language needs a complete `labels` catalog (`report.mjs labels en` prints one). Write the content in that language.

## Visual evidence

Start from the visual question. Use the pictures the task supplied first, checking they show this revision, state
and viewport. A data-flow problem established from code needs no picture. New screenshots or starting the
application must be in the approved plan; a needed picture that is missing leaves its conclusion unchecked.
