# Iteration 4: one screenshot and a misleading numeric failure

## First submission

A fresh Terra worker was given one screenshot at 480 CSS px (2× export), an existing unstyled HTML card and a visual-only task. It used v18, changed the card, and submitted a [side-by-side reference and result](15-iteration-04-visual.html). Download the raw HTML and open it locally. No Figma data, hidden CSS specification, responsive behaviour or new interaction was supplied as a requirement. The worker reported small differences in typography and colours and did not claim other widths or browsers had been tested.

The strict frozen checker scored the submission `fail` at its original 1 px settings. An independent Astra reviewer found that the most dramatic reported differences — button y +10 px and height −20 px, and badge text y +3/height −6 px — describe computed **text line boxes**, not visible button or badge geometry: both rendered buttons occupy the same 106×36 CSS-px box at the same position, and their visible text has the same vertical ink bounds. Some small visible colour, text, border and alignment differences do remain. The reviewer considered the result visually usable, with minor differences; the owner has not accepted it. Retain the strict failure and the human observation as different results, rather than changing the threshold after seeing the submission.

## Calibration of the observer

Before the worker began, the independent checker accepted the reference, returned an example with changed text, and returned a visible 16 px price displacement. Afterward, we added an equivalence control: the same card expressed with a different line-height and flex centring. Its 960×556 RGB pixels were **identical** to the reference, yet the checker returned `fail` with a 20 px line-box height delta. Therefore the pre-run controls were insufficient to establish that this judge makes valid visual-only decisions. This does not invalidate comparing a CSS line-height when a genuine supplied design specification requires it; screenshot-only input does not disclose that hidden CSS property.

The tool's 1.37% reported figure for the worker's screenshot is a masked/thresholded measure, not a general image similarity or owner-acceptance score. No universal visual tolerance has been established. The worker's own comparison remains available as evidence; the automatically reported `maxOffset` includes geometry sizes as well as positions and should not be read as a 20 px painted displacement.

## Inputs and cost

| Measure | v18 screenshot-only run |
|---|---:|
| Reference | one 2× image; 480 CSS px wide |
| Worker-reported time to submission | 2:28 |
| Worker-thread wall time | 2:43 |
| Worker tool calls | 17 |
| Worker input, uncached | 27,627 |
| Worker input, cached | 655,104 |
| Worker output, including reasoning | 6,464 |
| Permission-review helper input, uncached / cached | 24,288 / 86,016 |
| Permission-review helper output | 519 |
| First strict machine verdict | fail |
| Independent visual review | small visible differences; owner acceptance not obtained |

The model was requested as native Terra xhigh; the runtime did not independently confirm the effective model/effort. Worker output includes reasoning. Tokens exclude coordinator and browser costs. The separate Astra review lasted 1:56 and used 21,815 uncached input, 1,998,080 cached input and 4,166 output tokens (a continuation delta). The worker shared a filesystem with research and was told not to read the answer or judge, so this was not blind. There was one run with the skill and no new no-skill arm, by the owner's decision; this cannot establish an efficacy or speed comparison.

## Reflection and next version

Astra recommended keeping the strict checker as a diagnostic where actual typographic specifications exist, but not treating unobserved computed CSS/line-box values as a visible requirement derived from a screenshot. The [next skill draft](drafts/19-v19.md) makes that distinction without introducing a new agent, threshold or required workflow. The next evaluator must be calibrated on a known-good image, a truly different image **and** a pixel-equivalent alternate implementation before its visual verdict is used. The strict v18 result above is preserved; the equivalent control was added afterward and is reported as a limitation, not used to retroactively declare a pass.

The next planned case is the original adaptive library task with a fresh worker and previously supplied requirements. Its first submission will be frozen before feedback, then independently checked for a built public consumer, comparable actual-entry-point images and relevant interactions. The small screenshot-only run does not demonstrate success on that task.
