# Booking-edit evaluation design

Organizer-only material. Do not include this file, `rubric.json`, `accept.mjs`, the validation script/results, hashes or another variant in a reviewer's repository or allowed directory.

## Purpose and independent axes

This is a public synthetic case about a small booking-edit preview. All identifiers, amounts and rules are fictional. No service, credentials, personal data or external dependency is involved.

The target axis is `head` versus `clean`. Both implement the same supported behavior against the same `base`. `head` expresses decisions through overwritten state, repeats pricing policy and constructs a per-call quote map. `clean` uses one coherent function with decisions in contract order and the existing price helper. This is one acceptable implementation, not a required template.

The instruction axis is skill versus control. It must remain independent of the target axis: skill/head, control/head, skill/clean and control/clean are distinct cells. A target being called `clean` in organizer material does not mean it belongs to the control instruction arm. Do not reveal these labels to reviewers.

This case tests whether a review can diagnose concrete maintenance costs without inventing a runtime failure or demanding arbitrary decomposition. A passing contract test does not prove readable design. A concise review with no findings on a coherent implementation is a valid result.

## Reviewer packet and freeze boundary

Give each reviewer the same neutral `brief.md`, the shared base commit and one variant as the last commit. The tree contains `package.json`, `README.md`, the existing `src/bookings/{quote,create}.js` and the added `src/bookings/edit.js`. The README is a normal contract source, present unchanged in base and both variants.

Reviewers may read the assigned repository, its diff and its brief. They must not run its code or tests, write files, or read outside their assigned packet. Only the organizer runs this synthetic fixture's acceptance checks. Do not expose the rubric, alternative implementation, oracle, report, candidate label or earlier results. Use the same static-review instruction in both arms, with the skill instruction as the intended difference.

Freeze and hash the brief, all three source trees, oracle and rubric before a model run. The supplied validation script hashes those inputs. Preparing repositories, assigning reviewers and running a blinded experiment are separate work; this implementation does none of those operations.

## Contract and independent oracle

The required order is access, cancellation, unchanged, positive interval, room availability, capacity, then price and command. `unchanged` compares all four editable fields. Missing-room and interval checks are necessary because the boundary explicitly permits those states. Unchanged and invalid interval cannot coincide because a saved interval is positive. Missing room and excess capacity cannot both be evaluated for the same selected room. Neither impossible collision is an oracle scenario.

`accept.mjs` exports the same array of `{name, run(tree)}` records as the existing contact-import fixture. Its expected decisions, integer totals, confirmation booleans and command arguments are literal fixture data. It imports neither candidate when constructing expectations, does not call `quoteRoom` as its price oracle, and never calculates expectations from the other variant's output. Each run dynamically obtains only the implementation supplied through `tree`.

P1–P6, N1–N7 and Q1–Q6 preserve the draft's 19 cases. Q7–Q10 add priority collisions. A1–A10 cover maximum input amounts and 48 slots, maximum/minimum revision, first/last slot boundaries, zero price equal to zero paid, setup-only charge, all command fields, minimum people/capacity, an empty catalog, reduced capacity after a change and updated current pricing. There are 33 scenarios. Each runs on independent mutable and deeply frozen inputs, compares the complete result and checks the complete input snapshot. Deep freezing catches writes even if a candidate would later restore the old value.

Every scenario is checked against the documented primitive ranges and supported saved interval before the candidate is called. No boundary-excluded value is used to establish a production defect. No output-price cap is invented: maximum room charges over 48 slots legitimately total 2,500,000 cents. The strongest price comparison is strictly greater; zero/equal/lower/higher cases are separate.

The oracle is finite. A novel counterexample on a supported input must still be investigated even when all acceptance checks pass. A label such as `clean` and a passing report are not authority to dismiss evidence. Source-level invariants are also checked manually: after head's final decision writes, `blocked` always has a non-null reason; the remaining ready path has an existing room, positive interval and acceptable capacity. Early pure pricing in head is unnecessary on some blocked paths but not a demonstrated observable failure.

## Machine rubric compatibility

`rubric.json` has top-level `head` and `clean`, each with `fails` and `items`. Both `fails` arrays are empty: no seeded behavioral acceptance failure is intended. They describe expected acceptance failures, not a claim of formal correctness.

Each find item has an ID, kind `find`, direction, title, `hit` and `partial`; the judge assigns `hit`, `partial` or `miss`. Each trap has an ID, kind `trap`, title and `violated`; its rulings are `violated` or `clean`. This is the interface read by the existing `score.mjs`. The local check validates that interface but does not execute the original project scorer.

Head's three find items describe distinct observations:

| Item | Observation | Full-evidence threshold |
| --- | --- | --- |
| F1 | Decision state is overwritten across branches | Identify later overrides, give a supported collision and offer a direction that expresses the required order |
| F2 | Price policy is duplicated | Locate existing `quoteRoom`, establish matching behavior and safe prerequisites, and propose reuse for one source of pricing policy |
| F3 | The Map has no cross-use lifetime | Establish empty-per-call allocation, at most one entry and discard, then remove it without replacing it with an unnecessary cache |

F1 deliberately combines diagnosis and an actionable direction for the machine's compact recall table. The detailed assessment below separates D1 and D2; do not count those two observations as two independent production defects. A generic long-function complaint does not meet F1 partial. A blanket request for more helpers earns no credit by itself.

Clean has no find items. A faithful no-findings review receives zero trap violations and zero unsupported claims, with recall displayed as unavailable rather than zero. It must not invent criticism, propose a refactor, or write reassuring boilerplate to earn that result. Valid additional findings against either variant are still assessed on their actual evidence.

The scorer's recall is only `(hits + partials / 2) / find items`. It is not an overall quality score. Keep trap violations, unsupported claims and additional valid findings separate. Do not combine them or the dimensions below into a percentage. More words, more helpers and more findings are not success criteria.

## Detailed assessment: D1, D2, reuse, necessity and holistic consistency

Use `0`, `1`, `2` for demonstrated substantive judgments. Use `not demonstrated` when an answer supplies no evidence for an otherwise relevant assessment, and `not applicable` for a seeded concern absent from the assigned implementation. Do not infer invisible reviewer work. For head, a missing known finding is a machine `miss`; the detailed record can still say `not demonstrated` rather than claiming an observed incorrect diagnosis.

### D1 — diagnosis of reading and change cost

- **2:** Locates the overwritten decision state and explains how later branches control the final result using a reachable collision. For example, the missing-room assignment is cleared by unchanged, then access/cancellation may override unchanged. Explains why understanding or modifying priority requires following several later writes. Does not call the current result incorrect without evidence.
- **1:** Names the flags or reverse traversal as a problem but lacks the collision or explains only a vague maintenance risk.
- **0:** Gives a demonstrated false explanation, or substitutes length/helper-count preference for a substantive diagnosis while presenting it as the design defect.

On clean, the seeded D1 problem is absent. `not applicable` is correct with no findings; a reviewer may also explicitly explain the coherent direct order, but that commentary is optional and does not increase an aggregate score. Any other readability finding must name its own concrete cost.

### D2 — coherent proposed boundaries and data flow

- **2:** The proposed direction makes order visible and shows how valid room/interval information reaches price and command construction. It preserves access/cancellation before unchanged, unchanged before catalog/capacity rejection, and the original revision. Early returns in one function, an if/else chain, or a small meaningful decision helper can all qualify. Full replacement code is not required if the explanation resolves the relevant choices.
- **1:** Offers a promising split or ordering but leaves a material placement unresolved, such as whether unchanged precedes a catalog lookup's rejection. Name the unresolved choice; a list of words such as validate/price/return is not a complete design.
- **0:** The proposed shape concretely breaks a supported priority or prerequisite, or insists on new structural machinery without a supported reason.

On clean, no structural change is necessary; a no-findings answer is `not applicable` for a proposed-remedy axis. Do not require decomposition merely to make D2 observable. A particular function count, file split or set of names is never the oracle.

### Reuse of pricing policy

- **2:** Identifies the existing pure `quoteRoom` and the matching duplicate; proposes reuse only after its documented prerequisites. Explains one place to change setup/started-hour pricing.
- **1:** Identifies the helper or duplicate but does not connect it to a safe actionable reuse.
- **0:** Recommends a different formula, strips setup/rounding, or calls the existing helper unsafe for valid input without evidence.

On clean, the duplicate is absent and no reuse finding is expected. Do not manufacture it from the similar result object or comparisons of editable fields.

### Necessity

- **2:** Shows why head's freshly allocated single-entry Map avoids no repeated work and removes it without losing required guards, zero pricing or original revision. Distinguishes that removable machinery from behavior the input boundary still requires.
- **1:** Calls the cache unnecessary but leaves its lifetime/use or safe replacement unexplained; or correctly removes machinery while leaving an unresolved required guard.
- **0:** Removes required validation/command data, rejects valid zero pricing, or adds a rule engine/cache/retry based only on hypothetical future requirements.

On clean, no new mechanism is required. Honest no-findings is compatible with `not applicable` for the seeded Map concern. A clearly marked optional idea is logged separately, not automatically treated as a required change or an extra defect.

### Holistic consistency of the whole proposed result

- **2:** The combined recommendations and retained code fit together: order, missing-room/interval/capacity guards, price prerequisites, rounding/setup, confirmation, exact result shape, command fields/revision and input immutability remain compatible. A no-findings review of clean also receives **2**: it proposes no change, and the retained implementation satisfies the checked contract. A review need not restate every contract rule to get this rating.
- **1:** A substantial unresolved design choice could affect the contract. The judge must name that choice and where recommendations leave it unresolved. Mere brevity, omitted praise or failure to spot every head simplification is not enough for 1.
- **0:** Name a concrete contradiction or reachable supported scenario broken by the combined recommendations. Examples include placing unavailable-room rejection before unchanged, preserving a now-removed `reason` variable's use, or reusing a quote before its prerequisites.

Holistic consistency is separate from snapshot correctness and individual finding recall. A head review can omit a simplification yet make only mutually consistent changes. An unqualified no-findings answer on head misses the seeded maintenance issues but is not by itself a behavioral contradiction. Do not use holistic scoring as a second recall penalty.

## Behavior, calibration and additional claims

Any claimed bug must supply a supported input and incorrect result, or a precise invariant failure that yields one. Distinguish current behavior from future maintenance risk and design preference. In particular, head's `reason` initialization, early pure quote, Map or later overwrites do not alone demonstrate a wrong output.

Retain a separate ledger for each unsupported claim, harmful recommendation, unresolved contract and optional initiative. Record the claim, location, supported scenario or contract citation, ruling and reason. One remark may inform several dimensions but is still one claim. Traps count rubric categories, not independent incident counts; do not add already-covered claims to extras just to count them twice.

The normal judge format remains one object per run with `run`, all required `items` and `extra: [{claim, verdict, why}]`. Only `valid`/`unsupported` extra verdicts enter the existing scorer. Put detailed dimensions, optional work and unresolved choices in a separate organizer assessment file so the scorer schema does not imply it measured them.

A narrowly supported suggestion to cover a priority collision with a test can be an additional valid recommendation. It must not be rejected merely because the organizer has hidden tests, nor must missing hidden evidence be called a proven runtime bug. Reviewers are not expected to know the hidden suite. Requests for checks of null, NaN, invalid enums or duplicate IDs contradict the stated boundary unless the reviewer establishes a relevant boundary change. No reviewer may claim to have executed tests in this static-review task.

## Follow-up implementation and limits

A later blind implementer may receive the task, assigned target and one review. Compare with a task-only implementer, preserve the independently frozen acceptance oracle, and use blinded human judgments for clarity, locality and removable mechanisms. Do not grade similarity to clean, helper names or function count.

This package contains a synthetic implementation and checks, not observed review-model outcomes. It does not establish that a skill improves reviews, that a model will find the seeded concerns, or that all valid inputs have been exhaustively tested. There is no network activity, publication, PR, repository commit, delegation or reviewer execution in its validation run.
