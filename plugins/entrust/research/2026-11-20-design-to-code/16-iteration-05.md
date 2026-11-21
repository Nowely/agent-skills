# Iteration 5: the real library task after moving the delivery check earlier

## First submission and independent verdict

The first submission with v19 was **returned**. The worker reported that it built the package, loaded the public import, ran 43 targeted tests, typecheck and stylelint, and checked interaction/resize samples. It also reported visual differences and incomplete coverage instead of claiming full design parity. The coordinator froze the submission before any feedback, rebuilt and packed it, then independently confirmed the public consumer loaded: `ready-native` and `site-280` smoke checks passed. Unlike the previous full run, the packaged images no longer prevented the app loading.

That improvement was not enough for acceptance. A legal synthetic combined-content fixture with a long price and several disk rows visibly overlaps adjacent RAM and disk text. This occurs at more than one width, including 601 and 624 CSS px. The independent `resize` case was marked PASS because it checks container width and presence of text; it does not establish non-overlap or readability. The saved screenshots and independent geometry measurement establish the overlap separately. The existing PASS is preserved with its actual scope, not rewritten as a pass for readability.

[Visual report: references beside the first submission and the dense-data case](16-iteration-05-visual.html). Download the raw HTML and open it locally. The rendered report crops full-page captures in HTML only; original PNGs remain unchanged. Four sections pair each available card reference with the submitted card at the same nominal width. Some data and indicators differ, as labelled in the report, so those pairs cannot establish full pixel parity. The dense 601 px pair puts an ordinary-data reference beside a different-data stress case to make the overlap visible; it is not a pixel comparison of identical content.

## Known results and their scope

- A low-stock fixture displays the translated low-stock text in place of the availability count, rather than the separate availability and indicator shown by the reference and the owner's decision. This is established by the submitted conditional and the captured consumer content.
- In the independent pointer tests, network, power and assembly content opened but remained visible after the pointer moved away. The observed behaviour does not by itself establish whether it was introduced by this change; earlier-source behaviour was not re-established in this run.
- The worker's 26-reference HTML reused seven distinct implementation screenshots across those references. It explicitly marked some states as not reproduced and some examples as having different data. The four main examples use the actual ready-card entry point, unlike v17's direct shared-row screenshots. At 764 the data is close; at 601 the disk differs, and indicators are not present in the 601/486/280 examples. GPU and several discount/mobile-popover states were not matched against their exact reference data.
- With the same three disks at 486 and 280, the submitted values use a different alignment from the visible shared left edge in the reference. The worker measured card heights of 121/151/240/480 px versus reference heights of 114/146/228/499 px at 764/601/486/280; differing contents/states mean those height deltas cannot all be attributed to layout.
- The discount scenario's exact-text locator did not find the expected text; the captured control and existing component show a textual trigger where the reference shows an icon. The edit scenario timed out looking for one label while the page exposed another; that locator timeout does **not** by itself prove the action is broken. The GPU assertion stopped at the preceding stock assertion, so it did not independently establish GPU correctness.

The main independent suite recorded 19 PASS and 8 BLOCKED_OR_FAIL, with no uncaught page errors. Its four `fig-*` passes check width/text conditions, not visual parity. Additional probes recorded 11 PASS and 1 BLOCKED_OR_FAIL; edge checks 8 PASS; the two selection-preservation attempts could not locate the missing low-stock control. These are the raw records, not a count of distinct regressions. The full runner exited 0 because it completed; that is not an acceptance verdict.

## Comparison and costs

The source tree, Storybook configuration, package metadata and 28 supplied files were verified identical to iteration 3. Both runs had Figma access and used the same owner decisions. Both used a fresh requested Terra xhigh worker; the host did not independently report effective model/effort. They shared a filesystem with earlier research and were instructed not to consult it, so neither run was blind. No new no-skill baseline was run, by the owner's decision.

| Measure | Iteration 3 · v17 | Iteration 5 · v19 |
|---|---:|---:|
| First submission | returned | returned |
| Package consumer | independently failed to load missing assets | independent smoke 2/2 passed |
| Main target captures | internal row; data differs | actual ready-card entry; some data/states differ |
| Targeted tests reported by worker | 17 | 43 |
| Worker-thread wall time | 15:14 | 23:47 |
| Worker tool calls | 91 | 164 |
| Input tokens, uncached | 135,497 | 177,597 |
| Input tokens, cached | 12,251,776 | 27,555,840 |
| Output tokens, including reasoning | 33,235 | 49,899 |
| Permission-review helper input, uncached / cached | 101,540 / 857,216 | 183,125 / 2,957,056 |
| Permission-review helper output | 1,500 | 2,844 |

Worker elapsed time is full thread wall time; it excludes independent acceptance, coordinator and analysis. A different test selection is not a comparable pass rate. Reasoning is included in output, not added again. The independent Astra analysis of iteration 5 used 42,591 uncached input, 6,264,704 cached input and 9,511 output tokens across two continuations, lasting about 4:16 in total; further reflection is separate. One run per version cannot establish that the instruction caused the package improvement or the increased cost.

## Reflection and remaining uncertainty

The v19 worker noticed and repaired missing packaged assets before submission and used the user-facing ready-card component for its primary reference examples. Those are observations of the run, consistent with the early entry-point/consumer instruction, but causality is unproven. Important state/data and visual-relationship coverage remained incomplete; the independently observed dense-content overlap and the low-stock behaviour make the first submission unready. The worker did not claim full design parity.

The skill already asked for a legal stressed-data case and state preservation across resize. The evaluator's successful resize assertion only checked width and text presence. An independent Astra reviewer recommended sharpening the existing step to name the actual outcome: inspect rendered values together for readability and keep relevant controls visible and usable at representative widths, with data fixed during resizing. The [v20 draft](drafts/20-v20.md) makes this small general change; it does not mandate a particular set of widths, data, tool, agent or CSS strategy, and allows intentional overlays.

The owner authorized at most five implementation iterations. No sixth worker run was made to validate v20. Its improvement to first-submission quality remains a hypothesis; completed unit and checker tests cannot prove that an independent agent will now deliver an acceptable complex UI. The user-facing goal must not be declared achieved on the basis of this iteration.
