# Catalogue card: one Terra gate at a21e92f

The hidden judge returned **ACCEPTED**, with width, choice and basics holding. Terra's own first and final handover was **`fail`**: in the consumer at a 375 px window, opening Filters leaves a 47 px card column, below the check's 288 px floor. The checker calculated that floor from a fresh page at the 320 px sweep start Terra chose because the contract gave no narrower bound; 288 px is not an owner-stated requirement, and the closed-page floor is not established as a product invariant for the open sidebar. The fixed page owns that sidebar; changing it was outside the brief. Both results can hold: the judge checks the card at several usable container widths, including the open sidebar at 700–960 px, while the skill's journey also checks the page at 375 px with the sidebar open. The judge does not establish that this page-level narrow state works. Nor is its ACCEPTED an acceptance by the owner. Under the PR request the gate also needs the owner's acceptance; that is still open.

The [card contract](../../evals/design-to-code/cases/catalogue-card/project/README.md) and its
[design context](../../evals/design-to-code/cases/catalogue-card/pack/context.md) do not specify a minimum supported
card width or what the consumer must do when the sidebar leaves too little room. A component `min-width` could protect
its internal layout at a chosen bound, but does not create room beside the sidebar and may cause overflow. Both that
bound and the consumer's narrow-space behavior remain an owner decision; 288 px is not that decision. A later
[post-gate probe](47-external-blocker-and-judge-scope.md#post-gate-width-probe) observed the same host and card widths
in the original and submitted pages and measured what temporary `min-width` and sidebar stacking styles changed.

## Conditions and boundary

The [registration](45-catalogue-terra-gate-registration.md) was committed before launch at `16c3975`; the tested case, skill, harness and judge are pinned to `a21e92f0a0b032f7b88e9ef111215cea703e96e3`. The registration records the Git tree and blob IDs, but the case project tree ID was transcribed incorrectly before launch: it says `a849249a0f7b48f1650e0f1978f7147ad9a7d`; the actual ID at the pinned revision is `a849249a0f7b48f1650e0cc0f1978f7147ad9a7d`. The original registration remains unchanged. The skill was installed from that commit by the case's `make-arm.mjs` and the PR's `real-run.mjs setup` (which invokes `arm.mjs prepare`). One fresh Codex 0.171.0-alpha.13 session used `gpt-6.1-terra`, `xhigh`, workspace-write and automatic approval review. The first message was the generated prompt and the PR's exact approval line. No follow-up messages, helper agents, baseline comparison, A/B or post-handoff fix were used. The owner allowed the case's absent `.design/returns.md`; it was not fabricated.

Setup initially exited 1 because Playwright was not in Node's module path and the returns file was absent. With an existing local Playwright supplied by `NODE_PATH`, Chromium started; setup still exited 1 solely on the permitted missing returns file. The builder's shell did not inherit that path and the builder found another existing local Playwright installation. Its search touched paths outside the arm, including a previous run's dependency directory, and it listed a shared scratch directory and searched the memory registry. The observed log does not show it reading the hidden judge or reference implementation, and the registry search returned no relevant case content; nevertheless, this was a fresh session, not filesystem-isolated from other local material. A hook blocked a later broad outside-project font search. No approval prompt was observed. The PR's proposed global allow rule was not installed; no global rules were changed. Inter was unavailable in the browser comparison, so the result used a fallback font.

The worker ended at its first handover, not at `pass` or `pending`; there was no arbitrary call limit. Before grading, process enumeration found no matching builder, checker, probe or browser process; the collector also found no design check in flight. This is evidence from process enumeration, not proof that every possible escaped process was absent. `collect` then froze the submission and originals with SHA-256 `51c97731ad5831414d7556309092c79c354442028b6e03e9fe9910c3635666e8`; the case's `arm.mjs freeze` separately archived the full arm with SHA-256 `a6572f1b029bb4ee423d7e7a3e3d83fce59d61f80a247929a7ab8d3ec4411df5`. Only after both freezes did the hidden judge run. Raw archives and logs remain local, not in this repository. The collector reports the 13 registered originals intact; all three references in the builder's configuration match those originals byte for byte. The builder's configured tolerance was 4, versus the check's default of 1.

## Width and choice, separately

| | What Terra named and did | What found the original defect | First-submission evidence |
|---|---|---|---|
| Width | Before implementation Terra said layout must follow the container after reading the task, context and start code. It replaced the window-dependent switch with a container query. Its final handover named the 639/640 px switch and the separate 47 px page failure, but did not explicitly name the planted `matchMedia` defect. | The first quick check on the start code failed frame comparisons and reported the sweep passing. The saved history does not attribute a specific finding to the window-bound switch. Terra read the starting code before changing it, but whether that reading, the design, or another inference exposed the planted defect is **unknown**. | The later Filters journey at a 764 px window checked the placement with a 436 px container; a separate Chromium probe checked 639/640 px. The judge's seven width checks held, including 375 and 520 px containers in a 1280 px window and open sidebar widths from 372 to 632 px. |
| Choice | Before implementation Terra said a selection must survive search re-renders and empty results; it stored it by host, item and size. Its handover named persistence, deselection and independent cards. | This is a new requirement rather than a pre-existing selection in the start card. The context explicitly requires persistence; Terra read it before implementation. No pre-fix failing choice journey was recorded, so a particular check revealing a lost choice is **unknown**. | The builder's `search and choice` journey selected a size, emptied and restored the list, then asserted the selection; it held in the full check. A separate probe also asserted selection through empty/refill and sidebar opening, deselection and independence. All six judge choice checks held, including re-render, empty/refill and sidebar. |

The first quick check had 0/3 frames passing, with typography and geometry findings; its sweep reported pass. The second quick check had 3/3 frames and sweep passing. Both full checks had 3/3 frames and sweep passing, but 13/15 journey results holding: the two failures were the same narrow Filters state at the top and bottom window edges. The final ledger had zero entries. Terra classified the page layout as out of scope and handed over on `fail`, with no independent review pass; the check's stated prerequisite for that pass had not been reached. The check also reported a standalone Details opener without a covering journey; the catalogue's Details journey held. This is a coverage limit distinct from the two recorded failures.

## Visual comparison

The attached synthetic case pictures show the original reference at left, the first-submission capture in the middle and a pixel difference at right. They are the check's captures, not a substitute for the owner's visual decision:

- [764 px](46-catalogue-gate-frames/card-764.png)
- [375 px](46-catalogue-gate-frames/card-375.png)
- [375 px, M selected](46-catalogue-gate-frames/size-chosen-375.png)
- [Judge capture: sidebar open at 960 px](46-catalogue-gate-frames/sidebar-960.png)

A [375 px open-Filters view](46-catalogue-gate-frames/reproduced-filters-open-375.png) was reproduced **after** the
gate from the frozen full-arm archive (SHA-256 `a6572f1b029bb4ee423d7e7a3e3d83fce59d61f80a247929a7ab8d3ec4411df5`);
it is not a historical gate frame. The six extracted page, card and data files match that archive byte for byte. The
PNG is 388 px wide; the reproduced viewport was configured at 375 px. It shows the synthetic case, not an owner verdict.

On visual inspection the wide and compact placements and the selected M state correspond to the references. The submitted text appears heavier and the compact price, stock and Details spacing differs; the pixel differences are visible in the attached comparisons. The checker reported unavailable Inter, and these pictures cannot distinguish font-substitution effects from other visual differences. The original reference/submission pairs and the 960 px sidebar capture do not show the failing 375 px open-sidebar state; the separately reproduced 375 px view above does. No owner visual or code verdict is claimed.

## Cost and limits

The collector recorded 34 outer calls, four rounds (two quick, two complete), zero ledger entries and zero helpers. The total was 61,723 uncached input tokens, 2,013,568 cached input tokens, 11,355 output tokens (3,367 reasoning tokens included in output), over 5:14.0 of session time. Ten empty-stdin polls were recorded, one with no output and two with output unknown; the per-completed-full-check no-output metric was **unknown** because the collector matched zero completed checks. These figures are from one synthetic run and are not a controlled comparison with the historical Sonnet arms.

The reported judge covers width, selection and basic interaction, not every visual detail or the owner's acceptance. The checker frames and sweep passed under the builder's tolerance and missing-font conditions; its narrow consumer journey failed. There was no owner verdict, no real-task A/B, and no causal proof that the skill's checks led Terra to discover both original defects before editing. The frozen materials retain the first submission and its complete collector record for independent verification.

## Reproduction

From `plugins/entrust` at the pinned revision, choose an empty private `ARM` and a separate private output directory. The commands are shown as a procedure, not as a recommendation to repeat the measured run:

```sh
node evals/design-to-code/cases/catalogue-card/make-arm.mjs "$ARM"
node evals/design-to-code/harness/real-run.mjs setup "$ARM" \
  --skill a21e92f0a0b032f7b88e9ef111215cea703e96e3 \
  --originals design README.md data.js index.html page.css page.js story.html \
  --run G --baseline "$BASELINE"
# In a fresh Codex session in ARM, send the generated first message at gpt-6.1-terra / xhigh.
# At the first handover, verify the session and checks have stopped, then:
node evals/design-to-code/harness/real-run.mjs collect "$ARM" --run G \
  --baseline "$BASELINE" --out "$OUT"
node evals/design-to-code/harness/arm.mjs freeze "$ARM"
NODE_PATH="$PLAYWRIGHT_MODULES" node evals/design-to-code/cases/catalogue-card/judge/judge.mjs "$ARM" "$JUDGE_OUT"
```

The collector's rollout parser provides the measurements above; its output explicitly retains unknowns. Use its baseline and archive to verify the originals and the result, and do not give the builder the judge or reference implementation. The generated setup warning about prior returns is a synthetic-case exception, not evidence of a new checker or harness defect.
