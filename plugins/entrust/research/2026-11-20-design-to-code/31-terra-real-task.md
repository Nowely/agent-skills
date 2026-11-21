# Draft 27 on the full responsive-card task: first checkpoint, independent review and cost

## Outcome

One fresh Terra worker used the frozen draft 27 on the original library task. Its first checkpoint was **returned** by an independent reviewer: after the list became empty and was restored, its width observer remained attached to the removed element. At a 375 px viewport, the card kept its compact layout and its content was 470 px wide. A second, separately saved version fixed that path after one review round. The owner later asked for no further changes to the experimental implementation; no further implementation was attempted.

The four main card captures looked close to their references, with small typography and alignment differences. This is an observation for those captures, not acceptance of every state or proof of pixel parity. Both frozen evidence files opened at `fail`: the checker itself prevented four mobile-sheet journeys from finishing. The owner has not accepted the complete submission.

[Visual evidence: design, first checkpoint, GPU, popovers and the later 375 px correction](31-terra-first-visual.html). Download the HTML and open it locally. Its images are embedded. The historical Before uses different data; the design alongside the filter-reset example is context, not a same-data comparison. The later correction is labelled and is not part of the first checkpoint.

## Question and setup

Can one fresh worker, using the current skill and actual task inputs, build the responsive library UI and supply sufficient evidence before its first user-facing handoff? A fresh reviewer was part of the agreed workflow, so we also froze the builder's version **before** review and measured the review and the single correction separately. This is one observed case, not an estimate of reliability or a causal comparison.

- Worker: requested native Terra `xhigh`; the runtime did not independently confirm effective model or effort. One implementer, one independent Terra reviewer, and one later Astra analyst. The Astra analyst read records; it did not run another implementation or re-review the image set.
- Treatment: draft 27, full commit `2437038fd602884bd8d21b3f20e42a3a417d1aa7`. Draft 28 work on the moving PR branch was not included.
- Product start: the same pre-change source tree, Storybook configuration, package metadata and 28 supplied material files as the earlier full-task runs. The starting source snapshot identified itself as package `30.24.0`; it was not the released control.
- Inputs: the supplied design group, four individual card references, other full-page and detail images, the owner's decisions, and limited consumer excerpts. Figma context for a specific frame was available; existing mappings were not requested. The owner-provided prior returns were explicitly supplied as Markdown list entries. This differs from the earlier real runs, so the results cannot be treated as a controlled skill-only A/B.
- The 375 px mobile **viewport** target and 280 px reference **card** width were recorded as different quantities. Unspecified data bounds were to be looked up, not silently treated as proven unbounded.
- The filesystem was shared with prior experiments. The worker was told not to consult prior solutions or the judge; this was not physically enforced. No new no-skill implementation was run, at the owner's direction.
- Chromium failed inside the macOS sandbox with a MachPort permission error. The pinned `v27` browser test then ran with an escalated local process: **1 passed, 0 failed, 0 skipped**. The failure and successful route are environment observations, not skill results.
- The developer was told to stop before the skill's review pass so the checkpoint could be archived. One external reviewer then reviewed without the builder's explanations. The skill was not edited to implement this split. The prompt's explicit split resolves a contradiction in the written run plan, but is an intervention in the experiment.

## Sequence and provenance

1. The input files and version were pinned before implementation; the local measurement manifest was written shortly after launch. The role used existing local dependencies and isolated its implementation in a temporary project.
2. Before the first checkpoint, the coordinator corrected an omission in the supplied brief: retain the existing mobile-sheet behaviour and do not add focus or Escape handling. This was owner intent but was communicated during the run. The coordinator also instructed the worker to document the reproduced checker/transition conflict without changing either the frozen checker or the sheet, and to continue independent checks. These communications mean the run was not unassisted.
3. The worker stopped at the pre-review boundary. Archive SHA-256: `ae75a569d954d253143d7a5c1596a9eb74f1bcd7c4d15c312c41e7afce6b9276`. The archived evidence's first line was `Status: fail`; the independent reviewer returned the checkpoint for a separate product defect.
4. The reviewer received the references and captures without the builder's reasons. A later audit compared code quality and the released control. A temporary uncertainty about which server served one capture was resolved by repeating the 375 px sequence against a server with its PID and working directory checked against the frozen archive. The new images were byte-identical to the earlier capture pair.
5. The worker received one review finding and performed one correction round. Archive SHA-256: `7f84c38be5a24aca8330cc2eccb5bf8145d697b7340aadb6d4a16cc0eb2ee3c3`. Its evidence also began with `fail`. An independent targeted replay confirmed the corrected filter-reset scenario; this is not another full independent review.
6. The owner used a Storybook served from the first extracted checkpoint and reported a short transition issue. The first server was stopped at the owner's request. A later, expressly authorised diagnostic used a separately identified frozen-checkpoint server; it and its browser were stopped after capture. No experimental product code was changed after the owner asked to stop making changes.

## First checkpoint: what was observed

### Static references and interactions

The independent reviewer captured the main card at 764, 601, 486 and 280 CSS px, in light theme at device scale 1, and compared each with its supplied design reference. Structure and principal values were close in the comparable examples; small differences in alignment and typography remained. The owner also described the visible result as looking good. Neither observation establishes full pixel-perfect parity for the complete design group.

The reviewer examined GPU examples at 486 and 280 px, network and power popovers, representative actions and hover interactions. For the wide GPU reference the values differed and parity was not assessed. The mobile sheet lacked a directly comparable reference; some discount data differed. The builder reported that full-page examples were not all captured with identical data and the product locale for the discount date remained unverified. These limits are not passes.

The worker's final check reported a width sweep of 280–800 px with no reported overlap on its dense story. That story combined a long model name, 192 threads and eight disk groups. The worker's exact dense amount was much shorter than the amount in the earlier independently reproduced price/disk overlap. The sweep therefore does **not** establish that the old long-price fixture has been fixed. The business maximum for that amount was not independently established. A fixture beyond a known contract cannot be called legal solely because it is useful for stress testing.

### Durable failure after the list becomes empty

On the first checkpoint, a real interaction with the list produced an empty filtered result; resetting filters re-mounted the card container. At 375 px, the reappeared card remained in compact mode, had `scrollWidth` 470 px, and content was cut. A fresh load at the same viewport used narrow mode, with `scrollWidth` 374 px. The reviewer repeated the sequence against the identified frozen server and recorded its PID and working directory. The first observation at 320 px also preceded the review feedback to the builder.

The observed cause was an object ref observed on its initial mount while the actual element could disappear and reappear. A similar lifecycle risk in the second consumer was inferred from the code; it was not separately reproduced in the first checkpoint. The second version instead observes the currently mounted element. The builder reported checks of initial loading and remount in both consumers and the built public entry point. The coordinator independently replayed the original filter/reset path at 375 px: narrow mode, card content width 374 px, with no document overflow. This proves the particular replay, not all responsive paths.

### Transient sidebar transition: separate owner finding

The owner observed a momentary mismatch as the right panel appeared near an apparent 730–731 px boundary. In a later instrumented run against the identified first-checkpoint server, the standalone page's root changed from 715 to 716 px: the panel appeared and the card shrank from 624 to 438 px while it still had compact mode and `scrollWidth` 470 px; the following measurement used card mode and `scrollWidth` 436 px. An analogous intermediate DOM state was recorded inside the tab container. At root/viewport 730 and 731 px, the panel was already present in both measurements.

These `requestAnimationFrame` measurements establish the intermediate DOM geometry, not that this exact frame was painted to the display. The owner's visual observation is separate evidence. The difference between the owner's apparent window width and the measured root boundary was not established. This transition is distinct from the durable empty-list/remount defect; its presence or absence in the second checkpoint was not established.

## Checker failure: the observer changed the behaviour

The unchanged mobile sheet completes closing on a CSS transition event. Draft 27's checker injects `transition: none !important` while measuring. In a controlled browser replay, all four sampled sheets closed by the normal touch/backdrop path without that injection; all four stayed visible with the checker injection. The worker preserved the existing sheet and documented the reproducer rather than changing the component or reporting those journeys as passed.

The final checker output was **50 of 54 journeys passed**, with four mobile-sheet closing journeys failing under the checker. This does not prove every product interaction is correct; it identifies a measurement-induced failure for those four. The four visual frames also carried owner decisions rather than `pass`: Russian word form, standard-label size, SVG rasterisation and a mobile colour. The report names 33 moderate offsets, at most 10.73 px. The unverified examples above remain separate.

A separate, synthetic draft-28 regression was reproduced independently by both coordinator and Astra: three 10 px-wide elements at x positions `0, 30, 48` move to `10, 49, 60`. The last gap shrinks from 8 to 1 px. Draft 27 fails the comparison, while both the later `ba7d146b` implementation and the subsequently published `e863f5b0` head report `pass` and no issues. This is not a claim that the exact synthetic defect occurred in the product. It shows that the checker's new inherited-drift allowance can mask a collapsed gap. Draft 28 was not the version run by the worker. The PR moved to `e863f5b0` after this run and substantially shortened the skill and changed the checker; the synthetic case was replayed on that head, but the full product task was not. The same transition-suppression rule remains in its source; its end-to-end mobile-sheet behaviour was not re-run on that head.

## Code quality versus the released control

The reviewer compared the first checkpoint with the published `30.30.0` package. The saved package integrity matched its registry record; 59 source-map entries in the reviewed areas matched the corresponding local source files byte for byte. This establishes the comparison for those files, not for an entire checkout or every runtime state.

Both implementations reuse a single visual row across the three consumers. The experimental version passes consumer actions in slots and retains the old public exports. It also reuses an existing network explanation and treats certain absent values more carefully, including an empty price calculation. Whether the empty price input occurs in the actual service contract was not checked.

On the inspected areas the release is stronger overall: both consumers share a price view; the resize observer follows the mounted element; and the old public implementation is more clearly isolated. It also preserves screen-reader units and a price period in code where the visual layout hides them; a screen-reader session was not run. The experiment had two price rendering paths and the lifecycle bug above.

Neither variant is architecture-free of debt. The common row remains inside a feature-specific area and reaches into another feature; both style sheets contain complex responsive rules and UI-kit internals. In the experiment, some rules for the same mode are overridden later and a broad pricing selector reaches outside the row. These are concrete maintenance risks, not separate demonstrated runtime failures. A total rewrite is not justified by line count alone. The release's later behaviour, all themes and the external site were not tested in this comparison.

## Time, tokens and calls

The counters below are cumulative usage deltas from the relevant role transcripts, not a single context-window size. Output includes reasoning. Wall time is elapsed time, not CPU time; helper wall times overlap with the corresponding worker. No money, browser/CI resource cost or per-feature token attribution is inferred. Earlier and current runs have different inputs and one sample each.

| Role and cutoff | Wall | Uncached input | Cached input | Output | Tool calls |
|---|---:|---:|---:|---:|---:|
| Earlier real task, v19 worker, first checkpoint | 23:47 | 177,597 | 27,555,840 | 49,899 | 164 |
| Draft 27 worker, before first checkpoint | 1:39:13 | 810,733 | 168,079,744 | 197,341 | 527 |
| Permission-review helper for that worker, first-checkpoint window | 1:35:49 | 623,508 | 13,384,960 | 8,995 | 0 |
| Independent reviewer, through first verdict | 9:17 | 119,445 | 7,449,728 | 14,864 | 68 |
| Permission-review helper for that reviewer, through first verdict | 7:25 | 102,047 | 1,718,016 | 2,636 | 0 |
| Worker correction after review, incremental | about 16:57 | 98,541 | 45,219,584 | 29,506 | 83 |
| Independent reviewer, total through code/release comparison and targeted follow-ups | 34:35 elapsed across continuations, including idle time | 241,552 | 26,310,656 | 44,278 | 148 |
| Astra initial analysis of this run | 5:56 | 125,677 | 2,777,088 | 13,617 | 28 |
| Astra total including the later draft-28 follow-up | 14:04 elapsed across continuations, including idle time | 151,138 | 3,594,368 | 16,063 | 33 |

The Astra total includes its initial analysis; do not add those two rows together. The four primary windows to the first independent verdict total **1,655,733 uncached input, 190,632,448 cached input, 223,836 output and 595 worker/reviewer tool calls**. They exclude the correction, later owner-requested checks, coordinator, later analysis and publication. For all observed permission-review sessions up to this report's accounting snapshot, the builder's four helper sessions total 734,005 uncached / 15,382,144 cached / 11,372 output; the reviewer's five helper sessions total 232,370 / 2,300,800 / 5,063. These totals include the primary helper windows above and must not be added to them again.

The coordinator's sampled cumulative counter from the owner's approval through 20:59:47 UTC was **417,722 uncached input, 89,522,048 cached input, 72,541 output and 337 tool calls**. The preceding sample was at 18:37:13, so this delta includes a small pre-approval interval and excludes later report preparation and publication. It also includes the owner's subsequent Storybook and code-quality requests. It is not billed cost. Counts for unobserved helpers or after the cutoff remain unknown.

For the worker before the first checkpoint, relative to v19 the observed wall time was 4.17×, uncached input 4.57×, cached input 6.10×, output 3.95× and tool calls 3.21×. The current run recorded 31 checker rounds before review and one separately recorded full round afterward. The earlier and current selected test suites were different: 43 versus 54 tests before review, and 56 afterward; their counts cannot be compared as quality rates.

## Earlier iterations and the current checkpoint

The earlier [five-iteration ledger](17-iteration-summary.md) records each case and its separate costs. The cases
are not interchangeable: the listing and screenshot-only cases are smaller than the full library task.

| Previous iteration | Skill | Case and first-checkpoint verdict | Worker wall | Uncached input | Output | Calls |
|---|---|---|---:|---:|---:|---:|
| 1 | v15 | Listing; returned for a 6 px mismatch | 5:22 | 38,081 | 13,023 | 25 |
| 2 | v16 | Same listing; returned for the same mismatch | 5:16 | 39,557 | 11,920 | 27 |
| 3 | v17 | Full library; package consumer failed to load assets | 15:14 | 135,497 | 33,235 | 91 |
| 4 | v18 | Screenshot-only; checker also failed an identical-pixel control, so owner acceptance was unknown | 2:43 | 27,627 | 6,464 | 17 |
| 5 | v19 | Full library; package smoke passed, dense content overlapped | 23:47 | 177,597 | 49,899 | 164 |
| Current full task | v27 | Independent pre-review checkpoint returned for remount/resize; later targeted correction | 1:39:13 before review | 810,733 | 197,341 | 527 |

In the intervening [server-card study](23-server-card-sonnet.md), one Sonnet run per draft used a smaller
screenshot-only project. Drafts 21.1 and 22.1 were returned visually after the automatic part passed; draft 23.1
was returned but described as closer. Draft 25.1's two card arms were returned for an edge-clipped popup and a
separated price period; a separate small listing case passed. Draft 26.1 cut checking and ledger work but was
returned for the price split. Draft 27's one Sonnet submission was accepted by the model reviewer, but its checker
status was `fail`; the owner later accepted the systematic column shift in that picture and noticed text was too
small. See [iteration 1](24-iteration-1.md), [iteration 2](27-iteration-2.md), [iteration 3](28-iteration-3.md)
and [iteration 4](29-iteration-4.md). A model-review verdict on that case is not the owner's acceptance of this run.

The criteria written for this run were owner acceptance after a review round, around 30 or fewer checks, fewer than
about 10 ledger entries and evidence `pass` or `pending`. The owner has not accepted the full result; the first
checkpoint had 31 checks and four decisions proposed; after correction one separately recorded full check ran. Both
evidence files said `fail`. Thus the ledger criterion held, while the handoff-state criterion did not; visual
closeness and the known checker defect do not turn the latter into a pass.

## The PR moved to draft 28 after the worker run

While this report was being prepared, the branch moved from `ba7d146b` to `e863f5b0`. A text-and-code review by
Astra found that the main skill page had already been shortened from 197 lines / 2,385 words to 84 lines / 804 words;
it introduced two tiers of findings and generated DOM stress conditions. A cheaper page and generated checks are
therefore **implemented changes**, not recommendations still to be implemented. Their effect on elapsed time,
tokens or first-submission acceptance has not been measured in a new full-task run. The meaning of `pass` also
changed: an empty acceptance list, missing layout model or absent declared lines no longer independently prevents it;
some size and image-region differences are notes. The screenshot path adds a font-size check when enough text samples
are available. A status must therefore be read with the exact revision and checks it actually performed.

The generated checks extend text and repeat selected adjacent content, then measure geometric conditions after the
page settles. They do not themselves exercise a framework's data lifecycle, the empty-to-populated consumer path,
the historical price fixture or the transient pre-settle sidebar state. Their domain validity and usefulness need
to be assessed on their own inputs; a generated DOM condition is not automatically a legal product value.

The `transition:none` injection is still in the new source, but the full sheet replay was not run against that
head. The synthetic collapsed-gap case above was replayed and still returned `pass`. The branch subsequently added
`477db313` (draft 28.1), changing generated-condition and wrap handling; its comparison core is byte-identical to
`e863f5b0`, and the same transition-suppression declaration remains. The full task and sheet journey were not
re-run on draft 28.1 either. The shortened page also asks
for hover, tap, focus and Escape for every opening control, which may exceed the existing control's supported
interaction and conflicts with the owner's instruction to retain the existing sheet behaviour here. Its absolute
wording about keeping a price and period on one line also omits the owner's last-resort wrap when the whole group
cannot fit; the checker describes a room-dependent wrap separately. These are instruction inconsistencies, not
newly reproduced product failures. No new implementation or full acceptance experiment was run for draft 28.

## Assessment: coordinator and Astra

**What worked.** A single worker made a visually close first checkpoint for the four main examples, found and fixed several concrete overlap and popup problems before the review, exercised the built public entry point, and produced paired design evidence. The independent reviewer then found a material lifecycle path the builder had missed. The specific correction was reproduced after review. Reusing the current product's kit, styles and explanatory text avoided inventing every interaction from scratch.

**What did not.** The worker did not reach an accepted first checkpoint; a real remount path and a transient sidebar transition remained. The current checker both broke an existing mobile-sheet gesture and consumed attention on distinctions that still require owner judgement. A full sweep with one self-selected fixture could not establish robustness to a different long value or to a parent remount. The owner's intervention corrected a missing input. Coordinator and role costs were substantial, and the execution took much longer than the previous sampled run.

**Astra's assessment.** The independent review found a meaningful missed consumer path, and the saved before/after checkpoints make its contribution observable. The checker-induced sheet failure is an observer defect; the collapsed-gap case in the later checker is a different, synthetic false pass. Neither should be hidden behind a single green/red outcome. Astra recommends correcting the measurement mechanics on frozen controls before paying for another full model run.

**Coordinator's assessment.** The visible card quality is promising, and the released-code comparison gives concrete reuse and maintainability lessons. The result did not meet the original aim of an acceptable first delivery at lower cost: the first checkpoint was returned, the later correction still has unresolved decisions and unverified states, and the comparable worker stage took substantially longer. The user's observation of the transient sidebar case is not erased by the remount fix. The report must preserve both the encouraging visuals and these limits.

**Shared judgement.** Keep draft 27 experimental. The closer screenshots and the useful review are encouraging on this case; neither proves first-submission readiness across projects. The experiment supports keeping one independent check available for consequential adaptive work, not a blanket requirement for several agents. A separate review costs time and tokens, and on this case found a material issue; a single run cannot establish its general return on investment.

**Recommendations, in order:**

1. Fix the checker's measurement mechanics before another expensive model run: preserve behaviour-dependent transitions for journeys while stabilising screenshots separately. On frozen synthetic controls, retain both an ordinary and a broken closing path. For the newer drift logic, retain a preserved-gap control and the independently reproduced collapsed-gap case.
2. Make acceptance cover a small number of actual consumer journeys, including mount/unmount and parent-size changes when the product can cause them. Exercise the same data through a transition. Avoid turning this one product's filters, prices, breakpoints or selectors into universal hard-coded skill rules.
3. Where a historical failure is claimed fixed, replay its actual fixture if still valid, or explicitly say why it is no longer applicable. Current dense coverage with a shorter price is useful but is not evidence for the former long-price case.
4. Keep comparable reference/result pairs for each material design state and label differing data, themes, width, scale and context. Screenshots alone remain valid input; use visual judgement when geometry or font extraction is incomplete. Keep owner decisions distinct from proposed deviations.
5. Preserve the release's shared price, element-lifecycle handling and legacy boundary as demonstrated precedents, while independently considering the experiment's treatment of missing values. Do not prescribe a project-wide rewrite or an extra framework from this case alone.
6. Fix the documented protocol ambiguity about when a review happens and what the reviewer can see. Record first builder checkpoint, review feedback, first user-facing handoff, screenshots and costs separately. A reviewer should receive evidence, not the author's defence, when the purpose is an independent verdict.
7. Before claiming a general effect, use consistent inputs and acceptance on additional, distinct tasks; only add a no-skill comparison if the owner chooses that question. Pre-register a sensible time/cost budget. This study did not set one, and its wall time is itself a finding.

## Boundaries of publication and remaining work

The public record contains anonymised descriptions, aggregate numbers and the owner-authorised original design/capture images. Product source code, private links, session transcripts, credentials and local file paths are not published. The original local archives, scripts, detailed execution logs and full role counters remain local.

Open: owner assessment of the complete result and the four proposed deviations; the locale/date and unmatched full-page states; the old long-price fixture; a paint-level account of the sidebar transition; production and external-site integration; validation of any future checker fix. The current experiment stops here; no further implementation or autonomous correction was requested.
