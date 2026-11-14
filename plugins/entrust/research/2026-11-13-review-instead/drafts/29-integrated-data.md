# Report data

Read this contract for every review. Save one canonical `review.json`; HTML is optional. [Lifecycle and verification](#lifecycle-and-verification) apply before returning the review.

## Format

    {
      "title": "a short name of the change", "language": "en",
      "range": "main...HEAD",
      "change": { "goal": "what the change is for, in a sentence", "why": "the reason, when a source gives one",
                  "parts": ["what it adds or alters, one line each"], "sources": ["the task text", "the commits"] },
      "verdict": "whether the change does its task\n- what decides that, a line each",
      "now": "the solution as written",
      "target": "the smallest clean solution",
      "recommendation": "accept, fix in place or rewrite as the target, in a sentence",
      "steps": [{ "text": "what to do first", "findings": [1] }, { "text": "what to do next", "findings": [2] }],
      "requirements": [{ "id": 1, "text": "...", "source": "task" },
                       { "id": 2, "text": "...", "source": "discussion", "met": "read", "not_checked": "how it looks on screen",
                         "doubt": "what contradicts it" }],
      "findings": [{ "id": 1, "title": "what is wrong", "direction": "behavior", "evidence": "read",
                     "at": "path:line", "what": "...", "shown_by": "the caller at path:line", "fix": "...", "breaks": [1] },
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
      "units": [{ "name": "importContacts", "jobs": ["parses", "validates", "writes"], "uses": ["ContactStore"],
                  "verdict": "split", "findings": [1] },
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

Each field holds what the same part of the report holds, and these rules are checked:

- **Requirements.** `source` says where the requirement comes from: `task`, the task as given; `discussion`, a decision made while the work was discussed; `question`, a point the discussion left open; `assumption`, yours or the author's. `met` says how you know the change meets it: `ran`, you executed it and saw the result, or `read`, you followed the code and did not run it. Leave it out for a requirement you did not check or that a finding breaks. `text` holds the requirement and nothing about your checking: a part of it you did not check, such as how it looks on screen, goes in `not_checked`. `doubt` is for a requirement you would not take as given: say what in the code or in a contract contradicts it, so that whoever decided it can decide again.
- **Verdict, now, target.** Each is a text of a few lines; a line that starts with `- ` is drawn as an item of a list.
- **Steps.** What to do, in order, a short line each, with the findings it settles. Leave the list out when the recommendation is one thing. Do not restate a finding: name it by its number.
- **Findings.** `direction` is one of `behavior`, `necessity`, `design`, `tests`; `evidence` one of `ran`, `read`, `judgment`. `shown_by` is the report's "Shown by" line, and a candidate with nothing to put there goes to `questions`. `breaks` lists the requirements the finding shows unmet. A finding about tests breaks none: it lists under `untested` the requirements a regression of which no test would catch. Leave either out when it is empty.
- **Checks.** The report's "Check by hand": `from`, the state to start from; `do`, the steps; `expect`, what a person sees; `requirements`, what it shows. Leave the list out when the report has no such section.
- **Ideas.** `title` and `text`; `at` when the idea has a place. Leave the list out when there are none.
- **Screens.** Optional, when a requested or material visual question needs image evidence; otherwise omit the section, even for a visible change. Follow [Visual evidence](#visual-evidence). `mockup`, `before` and `after` are each a supplied or authorized-scope picture: a file, by its path from the data's directory, which the page takes in whole, or an `https` link, which stays a link. A difference has `what`, and `why` or the `finding` it is. `"match": true` says you compared the result with the mockup and found no difference: it needs both pictures. A screen with no difference and no match was not compared, and says in `missing` what would settle it.
- **Blocks.** `added` and `removed` list the block's lines in one file as numbers and ranges; a decision that spans files is one block per file. Every changed line that is not blank belongs to exactly one block. `"all"` names every such line of the file, and only a block to remove may use it: code that stays is listed by its lines. `serves` lists requirement ids and is empty for a block that serves nothing. `verdict` is `keep`, `fix` or `remove`, and a block to fix or remove names its findings. `unit` names the unit the block is part of; leave it out for a test or for a line outside any unit.
- **Units.** The units as written: each has `jobs`, the units it `uses`, and a `verdict` of `keep`, `fix`, `split`, `merge` or `remove`, with its findings unless it is kept: `fix` is for a unit that stays one unit and changes inside. A unit of the change has at least one block. The requirements whose change touches a unit are read off its blocks, so do not write them. `"existing": true` marks code the change did not touch, listed because the change calls it or is called by it.
- **Target units.** The same for the target, when it differs. A name that is also a unit of the change is carried over; a name that is neither that nor existing is to be written. A unit to split has what it splits into here.
- **Mechanisms.** A compact inventory of meaningful behaviors/coordination concepts, not a count of functions. Each has `name`, `change` (`added`, `reused`, `changed`, `removed` relative to the base), `units` referring to the current map when applicable (empty or omitted for a file/config-level mechanism; cite its location in `basis`), `purpose`, `basis`, `benefit`, `cost`, `decision`, and `evidence` (`ran`, `read`, `judgment`); optional `findings` links relevant findings (omit or `[]` when none). Cite requirements and contracts in `basis`; their definitions stay in the existing map. A mechanism that is `added` or `changed` also has `instead`: where what it obtains or does is already available, with the `path:line` you read, or the places you read that do not supply it. It is answered from the code and the installed contracts, not from the change's own reason, and the check refuses an answer that cites no `path:line`. `decision` is the proposed disposition, distinct from what the diff currently does. Group one lifecycle as one mechanism even if it spans several units. Explain the cost dimensions that actually apply, and say what is unknown instead of inventing numbers. Use `judgment` for maintenance tradeoffs. Supply `mechanisms: []` when none are material. Legacy reports may omit the field.
- **Mechanism weight.** The reviewer may set `mechanism.blocks` to unique 1-based indices of existing `blocks` (the B numbers shown in the report). The renderer cannot infer attribution from unit membership: one unit can contain several mechanisms. Every referenced block needs explicit `kind: "code" | "test" | "other"`; `kind` is optional elsewhere and never inferred from a path or unit. This prevents test/config/generated lines being silently charged as production code. Reuse meaningful existing blocks; do not fragment code purely for a precise-looking count.
  - Omit `blocks` when attribution is unavailable and explain why in `basis` or `cost`. This is unassessed for that mechanism, not zero; partially mapped reports and legacy records stay valid. `blocks: []` is allowed only for `reused` without changed integration lines.
  - Counts are derived from the referenced nonblank diff lines, including comments, with additions/removals and code/test/other separate. No duplicated numeric totals in JSON, net-delta weight, AST analysis or score. Existing helpers are not charged as newly added code. Blocks referenced by several mechanisms are shared, displayed separately with their names, never divided arbitrarily or added to each mechanism's exclusive total. Counts are exact for the chosen mapping; attribution remains a review judgment and does not establish that every counted line can be deleted.
  - `benefit` states the scenario, observable loss without the mechanism, and frequency with its grounds or explicitly unknown. `cost` explains relevant lifecycle/coupling/reading and change burden, not just a defect or line count. `instead` supplies the alternative; `decision` weighs the evidence. Mandatory behavior stays binding. Unknown frequency alone does not prevent removing a proven duplicate while preserving the contract, and does not justify dropping required behavior. No new frequency or omission field is needed.
- **Language and labels.** The reviewer sets `language` to the session language code because the renderer cannot infer the reader's language from mixed code and prose. Built-in `en` and `ru`, including regional forms such as `en-US` and `ru-RU`, cover all controls, annotations and exports; omitted language preserves legacy English defaults. `labels` overrides individual built-in strings. For another language, provide a complete `labels` dictionary; the checker refuses missing entries instead of mixing languages. `node "<skill-dir>/scripts/report.mjs" labels [en|ru]` prints a catalog. Preserve `{n}` placeholders. Write report content in the session language too; keys, enums, paths and code remain unchanged.

Do not list the requirements no block serves, or which requirement fails or lacks a test: the script works these out.

## Lifecycle and verification

- Record immutable base/head revisions and diff identity in `change.sources` and `coverage`. For uncommitted inputs, preserve the exact diff and necessary source snapshot outside the project. Preserve referenced local images and their digests; identify HTTPS references as unarchived. Verify input identity before delayed rendering. A moving range alone is not a reproducible source.
- Finalize evidence and dispositions after refutation. Missing evidence stays unknown or in `not_checked`; empty findings/targets/mechanisms are valid. Writing artifacts is not permission to modify source or publish comments. If artifact writes are prohibited, return the complete JSON inline and name validation you could not run.
- Validate from the reviewed repository with `node "<skill-dir>/scripts/report.mjs" check /path/to/review.json`. This checks structure, references and changed-line ownership without writing HTML. Record what passed and what could not be checked. The reviewer chooses `check` when only data is requested: `render` would create an unrequested artifact.
- Read back the saved JSON itself. For each surviving finding, compare `now`, `target`, the current/target unit jobs, mechanism decisions and ordered recommendations. Resolve conflicting descriptions of the same behavior, orphaned state/effects after removal, and targets that silently drop a required rule. Check block descriptions against the actual ranges; covered lines alone do not prove that their descriptions are correct. Verify that `language` matches the session language and user-facing fields do not mix languages. A passed script cannot prove natural-language consistency or correctness.
- Trace every required scenario through the final target, including relevant timing and failure behavior. An owner-approved omission is recorded with its consequence and source; a newly suggested tradeoff remains a question or idea until accepted. Recheck claims of missing information against the supplied contracts, utilities and UI/input paths. A prior report or scout is evidence to verify, not an authority to copy.
- For visible behavior, include manual scenarios only when the starting state, actions and expected result are grounded in the implementation. Name the requirements they exercise. These are proposals, not executed checks. Follow Visual evidence below for image work; keep missing visual verification out of requirement text.
- Derive the short response from this record. Later HTML uses the same JSON bytes and source snapshot, without new analysis. If new evidence changes a conclusion, save an explicit revised review and identify the change rather than presenting it as display-only work.

## Visual evidence

- Identify the concrete visual question before opening or comparing images. Use images already supplied or collected during the task first, checking their source revision, screen/state and relevant viewport. If identity or relevance cannot be established, mark that evidence uncertain rather than treating it as the current result.
- When comparing images, distinguish supported requirements, unexplained visual differences and unspecified states; a difference alone is not a defect. Inspect only the images/states needed for the question. A data-flow issue established from code does not require screenshots; do not build a visual comparison merely to populate a report. Omit `screens` when no material visual question remains.
- If visual evidence is necessary but missing, say which conclusion remains unchecked. New capture, app startup or broader visual coverage must fit the user's authorized scope; request a scope decision only when the needed work would expand it. Existing authorization is not asked for again. Do not generate illustrative images as evidence of application behavior.
- Preserve the existing report/image identities for delayed HTML rendering. Rendering uses the already established evidence; it does not start a new screenshot hunt or substantive review.
