# Draft 31: review and implementation pilot

## Question and candidate

Draft 30 made future-change scenarios mandatory and treated a lower number of edit or read locations as the gate for a design finding. Draft 31 makes grounded scenarios optional, asks for a concrete structural burden instead of a numeric proxy, and explicitly weighs an unestablished automated convenience against its benefit, cost and observable loss. The complete changed-line map remains; a mechanism's weight must not include mixed blocks without defensible attribution. See the [candidate notes](drafts/31-notes.md) and the three draft snapshots beside them. The working skill and checker in this PR contain the candidate, not a proven release.

The purpose is to improve reviews of decomposition and unnecessary mechanisms without forcing a split, losing needed behavior, or overclaiming exact mechanism weight. The pilot is a low-sample diagnostic, not a release gate or a reliability estimate.

## Review method and observations

One reviewer per candidate inspected each of three cases with the same task, source and constitution: one real change whose later simplification was a nonbinding reference, a behavior-correct tangled synthetic change, and a synthetic control that was intended to be clean. Two additional fresh reviews inspected a corrected version of the last control. The reviewers were Terra at observed `xhigh`; reviews were static, with no application, test or build execution. The full ponytail instruction was not observed being read in these review sessions, but its description may have been present in the host skill catalog. Structured reports passed their respective checks; that validates the format, not the semantic correctness of the review.

| Case | Draft 30 | Draft 31 | What this establishes |
| --- | --- | --- | --- |
| Real change | Found an unnecessary lookup and kept a time-based revalidation mechanism. | Found the same lookup and kept the same mechanism. | Neither proposed the desired deeper rule decomposition or presented the owner with the optional automation tradeoff. |
| Tangled synthetic change | Identified duplicated rules and effects. | Identified the same duplication and suggested simplification. | Both identified a structural concern; one sample does not establish a winner. |
| Original synthetic control | Flagged potential reuse of a scheduler handle; kept the required timer. | Flagged the same risk; kept the required timer. | Both preserved required behavior. Subsequent testing found a real defect, so this was not a clean negative control. |
| Corrected control | Kept the timer and structure; noted missing tests; included three scenarios. | Kept the timer and structure; noted missing tests; included no scenarios. | Both avoided unnecessary restructuring in this case. The optional-scenario format worked once; quality or repeatability is not established. |

On the real case, draft 31 left mechanism weight unassessed where blocks mixed the mechanism and shared code. That avoids a misleading exact number but does not give the owner a useful estimate. The weight diagnostic was added after the first reviewer was dispatched, so treat it as exploratory. Neither reviewer demonstrated that the unrequested automatic experience was required by the task; keeping or dropping it is a tradeoff, not an automatic consequence of an omitted requirement. A later owner decision to remove it is a reference, not a requirement known to the reviewers.

The originally clean control failed a later test in which an already queued callback runs after a scheduler handle has been reused. A corrected head prepared earlier by the case author passed the original acceptance tests and that additional test. It was selected only after seeing the first results and is **not** an independent held-out case. A fresh GLM Flash judge evaluated the two corrected-control reviews against the source and provided test results: it found the missing-test finding justified and no unjustified removal or forced split. The judge did not execute the tests, and report format could reveal the review arm despite neutral labels.

## Implementation comparison

Four independent implementations used the same task, baseline and constitution, two with ponytail and two without. All four put the rules in one schema callback; none produced the later reference's named rule functions, which were not themselves required. Each group had one implementation that added explicit UI error presentation and one that did not. Both ponytail implementations made the schema parameters required; both without ponytail made them optional. The observed page supplied both parameters, but other consumers and the need for the UI changes were not established from the incomplete historical context.

Two samples per arm do not show whether ponytail causes or prevents a structure. Its full instruction was observed in the two plus runs and not observed in the minus runs; skill descriptions could still have been visible to the latter. The constitution was held constant, so its independent effect was not measured. A short-diff preference potentially competing with a structural improvement remains a hypothesis, not a demonstrated cause.

An external GLM assessment treated the four required transitions as supported by the code; a separate native assessment left error visibility unknown in the two implementations without explicit UI changes because field components were unavailable. Neither establishes runtime behavior. GLM returned malformed JSON twice; a separately preserved derivative of the continuation was made schema-valid by inserting three closing braces, with the original outputs unchanged. The native response had valid per-candidate records but omitted two required root fields. These limitations are not votes that can be averaged into a passing result.

## Interpretation and next step

Draft 31 removes a mandatory reporting step on the corrected control, but the pilot does not demonstrate better decomposition on the real case. Both versions found the important lookup simplification; both missed the desired discussion of the time-based convenience. The ponytail comparison shows no clear advantage or disadvantage in this small sample, rather than proving no effect. My practical recommendation is to try working without its automatic instruction, while retaining the uncertainty about its causal impact.

Before promoting this candidate, refine how reviews show the cost and benefit of optional mechanisms and diagnose responsibility boundaries, then test against independently prepared, held-out changes with both tangled and already cohesive designs. Preserve source-grounded judging and distinguish behavior, architecture, false positives and review cost. More independent review/implementation samples can be more informative than multiple judges on a single sample; an additional judge is useful when a substantive disagreement remains.

The real-task materials and raw reports are private and intentionally not included here. This public record summarizes observations, not reproducible access to that task. The corrected synthetic control and its results are described above; their raw packets are not part of this PR.
