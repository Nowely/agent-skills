# Proposed sixth iteration: turn observed gaps into a finished first submission

## Scope and authorization

The owner asked for a plan after five iterations; this document is **not** authorization to run another implementation. In this record, “iteration 6” means the next experiment; it is not a request to rename draft v20 to the historical v6. The fifth submission was returned, and v20 was revised afterward but not tested by another implementer. See the [postmortem](21-fifth-submission-postmortem.md) and the [five-run results and costs](17-iteration-summary.md).

If the owner approves one additional run, the question is: can a fresh agent use the current skill plus a precise completion boundary to resolve the applicable visual and behavioural requirements **before its first handoff**, rather than merely describe known gaps? A single outcome is a case study, not evidence of a general success rate or a causal improvement.

## Alternatives

| Approach | What it tests | Cost and limitation |
|---|---|---|
| Current v20, one worker | Whether the already-written readability instruction is sufficient. | Cheapest change, but it leaves the observed gap between naming an outstanding requirement and acting on it as a hypothesis. |
| **Recommended: one worker, clearer completion boundary** | Whether requiring an observed outcome for each applicable requirement and continuing to fix recoverable failures improves its first submission. | Changes the skill wording as well as adding another sampled run; any result remains non-causal at n=1. |
| One early independent prober, then the worker | Whether independent feedback on the first functional slice reveals misses before the human handoff. | Costs another role, a handoff and retest. The earlier small pilot added 4:46 for two visits, both arms still needed a return and both missed autofocus; it was a different task, not a prediction for this one. Combining this role with a new completion rule in the same arm would not identify which helped. |
| Two independent specialists | Separate visual/adaptive and interaction/consumer perspectives. | More coordination and tokens. No evidence yet establishes that the second role is worth making mandatory. |

Do not add a mandatory second agent or extra tool to the general skill from one outcome. An optional early-prober experiment can be proposed separately with fixed aggregate time/token budget and its own comparison. The final independent assessment below is **not** feedback to the implementer before the first submission.

## Proposed skill change

Keep the current short reference, layout, real-entry-point, packaged-consumer and visual-pair workflow. Change the handoff boundary rather than append another generic “be thorough” instruction:

1. Derive applicable outcomes from the owner's request, the design states and existing consumer behaviour. For each, record the source, real entry point, data/state/width, observation and result. The existing `pass / fail / incomplete / pending` record can express these; do not create a new mandatory schema, selector language or agent.
2. A **recoverable failed requirement** or a mandatory state the worker has identified but not yet exercised remains work: fix or perform the check, then repeat the affected observation after the last change. A green test whose expected value merely mirrors the new code, a passing scroll-width assertion, and a screenshot of a different state cannot close a richer requirement.
3. End without claiming acceptance only for a concrete blocker after a recorded attempt, a pending decision the owner must make, or the experiment's agreed limit. Record what was attempted and keep independent work moving. Do not invent blockers or present a proposed deviation as accepted. A small kit-based visual trade-off remains possible when it materially simplifies the solution and is shown to the owner.
4. For an adaptive content surface, make the stress case a **legal combination** derived from the actual data contract and supported actions; hold it fixed through relevant transitions and observe readability and hit targets. Do not require every theoretically possible label/action simultaneously when the domain prohibits it. The existing checker may be used when its measurement answers that question; its result is not the owner's decision.
5. Produce a final reference/result pair for each applicable visual state at comparable data, interaction state, host width, scale and theme. Mark a missing pair as unverified with the reason; do not reuse another state as proof. An ordinary-data reference beside a dense fixture can illustrate the latter, but cannot establish pixel parity for it. A screenshot-only task may use visual inspection; unprovided CSS internals are diagnostic. Preserve a `Before` only with honest capture-condition and data/theme caveats.

This is a proposed refinement, not an implemented revision or a claim that the rule will work. The individual cases remain ordinary task evidence rather than text, labels, dimensions, prices or selectors to hardcode in the skill.

## Proposed preparation and run

**One implementer.** Request a fresh Terra xhigh worker, recording requested and, if available, effective model and effort. It gets the original full task, source snapshot, 28 supplied input files, consolidated owner decisions, the skill under test and the same Figma/screenshot access used for the prior real runs. Existing kit, public contracts and consumer excerpts are available. The worker does not receive the prior diagnosis, the judge, exact hidden stress values or expected defects. The shared filesystem means the run cannot be called blind even if the worker is instructed not to consult those files. An unauthenticated local component environment uses a clean browser; an authenticated page uses the already authorized persistent Playwright profile if available. External deployment or production writes are not part of this experiment.

**One independent assessment after the first submission.** Freeze the worker's files, package, own handoff and visual report before any feedback. A separate reviewer reads the task and criteria, not the worker's prior instructions; it evaluates the frozen result and verifies reproduced symptoms. No coaching or return is given to obtain the measured first submission. A baseline with *no skill* is not requested or required for this run.

Before dispatch:

- Pin the exact skill, starting source tree, relevant reference exports, current Figma state if available, task and owner decisions; record differences from prior runs. Keep inputs and time budget fixed after launch.
- Reuse the [existing observer calibration](18-frozen-dense-calibration.md) when checker, consumer, fixture and configuration are unchanged; it already distinguishes the released control from the frozen fifth submission. If an input or relevant checker behaviour changes, rerun only the affected controls. Preserve the original judge results. A broken locator or unavailable measurement is `indeterminate`, not a product return.
- Independently register the applicable targets: the four principal card widths; relevant GPU, stock, price/discount, assembly, network and power states; the ordered/template consumers and their relevant interactions. Classify context and detail images instead of demanding 26 duplicate page screenshots. Derive expected behaviour from the task, prior owner decisions and product contract, not from the implementation under evaluation.
- Record the proposed worker budget before launch if the owner chooses one; measure independent assessment and coordination separately. The last real worker took 23:47, which does not by itself justify a new numerical limit. If a budget expires before a declared submission, record **no first submission within budget**. Freeze that state for separate diagnosis; it is neither a first submission nor an external blocker.

During the run, the worker may build, check and fix on its own. A user-facing status update or a tool result is not a repair instruction. The coordinator does not disclose the closed judge's values or earlier failure. At the worker's first declared handoff, freeze the state and stop the measured arm. If an agreed budget expires first, freeze the incomplete state separately and record that no first submission occurred within budget.

## Independent verdict

- **Accepted:** the applicable target states and consumers have evidence, the built public export and affected resources/actions work, material visual and behaviour requirements hold, and no unaccepted material deviation remains.
- **Returned:** at least one reproducible material product/behaviour/visual defect is present. Attribute only what was reproduced; a stale locator or a runner exit code alone is not proof.
- **Indeterminate:** no material defect has been established, but an applicable condition cannot be observed, the evaluator or environment fails, reference data/state are not comparable, or an owner decision is needed. A documented limitation is honest but is not a passing acceptance result. A confirmed material defect takes precedence: it remains a return even if another condition is unmeasured.

Assess the four principal widths with the real ready-card entry and appropriate reference data; exercise additional applicable states separately so a failed stock assertion does not prevent evaluating GPU. Use at least one ordinary reference-matched case and one legal combined-content case held fixed across relevant width transitions. Check actual readability and target usability, not only container width, text presence or selection persistence. Verify the real packaged entry and affected assets/actions. For popups, exercise the supported interaction path, including moving from trigger to content and away where relevant, plus touch/keyboard where the product requires them; a failure to observe a state is reported separately.

Every screenshot shown in a comparison has its reference or is explicitly labelled as a different-data contextual example. Prefer direct side-by-side images in the PR and a self-contained downloadable HTML for full context. Preserve the worker's original report, first-submission artefact, independent screenshots, evaluator outputs and all uncertainties. Public reporting uses only the already-approved images and sanitized aggregate observations; no internal product name, private URL or product source code is published.

## Stop and report

For this proposed single additional arm, stop after its independent first-submission verdict, including a return or indeterminate result; if a budget expires first, record no first submission within budget and assess the frozen partial state separately. Record material unique defects and unmeasured requirements, whether a recoverable known failure was fixed before handoff, and where the self-check agreed or disagreed with the assessor. Record wall time, uncached/cached input, output and tool calls separately for worker, verifier, coordinator and permission reviews when available; browser/CI resource costs and unknown billing remain unknown. Include side-by-side visual evidence and explain fixture differences. Do not run automatic further iterations or claim general effectiveness from one result.
