# Draft: contact-import evaluation, next version

Status: design draft. No fixture or tests have been changed or executed. Preserve the version and raw results used in prior rounds; this proposes a new version for future runs.

## Public task and input contract

The task remains importing contacts from CSV and returning counts and row-level rejections. Before any future comparison, the task must explicitly settle these points rather than having the reviewer infer them from a preferred implementation:

- A blank physical line is not a record. A nonblank record with missing columns is a row; missing `name` or `email` is treated as an empty value and rejected, including a quoted single empty field. The parser reports the starting physical line.
- Email validity is exactly the existing address-book validator's contract. The import must reuse its accepted/rejected behavior; the task does not demand a broader email standard.
- Rows that fail validation are reported and do not participate in choosing a winning row. For duplicate normalized emails, the last valid row wins; each normalized email counts once, based on whether it existed before the import.
- CSV parsing finishes before any writes. An invalid CSV document raises the existing parse error and writes nothing. The provided store and parser contracts specify error behavior; no retry or transaction is required beyond those contracts.

These are proposed fixture decisions, not statements about real user data or the previous task. The parser must be updated consistently in all three trees (`base`, `head` and `clean`), and the acceptance cases must reflect the chosen short-row contract; otherwise the clean variant remains defective or the diff gains an unintended parser change. Freeze the resulting brief and acceptance examples before running reviewers.

## Concrete evaluation examples

| Input / setup | Expected | What it distinguishes |
| --- | --- | --- |
| `name,email\n""\n` | One rejected row at physical line 2; no write | A quoted nonblank short row is not a physical blank line |
| `name,email\n\n` | No imported or rejected rows | Physical blank lines are ignored |
| `name,email\nAnn,ann@site.test\n"Bob,bob@site.test` | Parse error; no write for Ann or Bob | Whole-file parsing precedes effects |
| Existing `a@site.test` named `Old`; `name,email\nA,a@site.test\nB, A@SITE.TEST \n` | One update; final name B | Email normalization, last valid row and distinct counting |
| Existing `a@site.test` named `Old`; `name,email\nA,a@site.test\n,a@site.test\n` | One update to A; reject the last row | The proposed last-valid policy is observable |
| `name,email\nAnn,ann@site..test\n` | Follow existing address-book validation, not an independently invented grammar | Reuse actual contract, even if application-wide policy could be improved separately |

These tables are the proposed oracle; implementation and test syntax still need authoring and verification. `accept.mjs` passing alone must never be used as proof that every requirement is fulfilled.

## Revised review rubric

Keep the existing behavior, parser reuse, email reuse, unnecessary mode/retry and test-gap criteria distinct. Replace the current F1 design criterion and clean X2 as follows. Ratings are per axis, not a single quality percentage. The examples below calibrate interpretation; the reviewer does not see them.

### D1 — Design diagnosis (0/1/2)

- **0:** No concrete maintainability concern, or only a count of lines/functions, a style preference or a request for a pattern.
- **1:** Names relevant responsibilities or phases and calls the structure difficult, but does not explain the existing coupling or a concrete reading/change difficulty.
- **2:** Points to the existing parsing/row decisions/effects interaction and states a concrete difficulty, such as keeping whole-file parse failure and per-email counting correct while changing row-selection logic. Explains which parts/data must be traced together. A runtime defect counts separately; it is not automatically a maintainability diagnosis.

### D2 — Applicable target as a whole (0/1/2)

- **0:** No actionable target, or one that contradicts a stated behavior.
- **1:** Names phases or helpers but leaves their inputs/outputs, order or interaction unclear, so the author must reconstruct the design. Listing `parse / validate / plan / write` alone earns at most 1.
- **2:** Describes a coherent flow from the existing parser through validation and per-email selection to writes and counts, and shows how the decision/effect boundary is represented in the code. Identify the data handed across it, such as normalized email and last valid values, and explain where rejections and counts are produced; preserve all stated behavior. The proposal is concrete enough to act on, not necessarily a patch or exact names. Helpers, explicit local blocks or another understandable layout are acceptable; they are not scored by number of functions.

Calibration: review `r13` in the last round names the phases but its target assigns the decision and write work to the same importer. That wording must not receive D2=2 automatically; an independent judge should examine the entire review for an explicit, usable boundary. A single function can still earn 2 if the proposed local structure makes that boundary clear.

### D3 — Necessity and reuse (0/1/2)

- **0:** Recommends needless infrastructure or deletes a supported requirement.
- **1:** Names a reusable utility or unnecessary mechanism without establishing its applicability or the behavior to preserve.
- **2:** Identifies the existing parser and validator and their relevant contracts; explains which local reimplementation/mode/retry can be removed and which behavior must remain.

### Control safeguards

- Do not automatically penalize merging or retaining `planImport`: assess the resulting design and its actual consequences. A clear map-and-write flow may be a defensible alternative.
- Flag a recommendation to remove rejected-row reporting, normalized-email matching, last-valid selection or parse-before-write; each violates the proposed task.
- Flag unnecessary frameworks, retries, configurable modes or abstraction layers when no supported scenario requires them. Do not flag a named extraction merely for existing; assess its stated benefit.
- A new demonstrable defect in a variant called `clean` is evaluated on evidence. An unspecified contract stays `unresolved`; judges do not use the variant name as proof.

## Scope of the measurement

D1/D2 are expert judgments, not binary automated tests. Assess the explicit target and the proposed end state, not just a sentence or filename. Keep behavior checks, unsupported claims and unresolved assumptions separate; do not add all axes into a single success percentage. If the implementer stage is approved, independent implementers receive the task, head and one review (or no review for the control), never the rubric or the reference implementation. Behavioral checks and a blinded maintainability assessment are separate.
