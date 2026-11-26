# Iteration 3: the real library task with v17

## Outcome

The first submission is **not accepted**. The worker honestly reported visual differences, unmatched reference data and an untested built consumer. After the submission was frozen, an independent check built and packed the library successfully, but its public consumer could not load: the distributed JavaScript referred to three image resources absent from the package. The consumer's typecheck passed. The runner was stopped after the shared module-resolution failure was established; the remaining browser scenarios are **not checked**, not counted as independent product failures.

[Visual evidence: four references beside both recorded submissions](14-iteration-03-visual.html). Download the raw HTML and open it locally. The v17 images use different CPU, memory, disk, labels and prices from the design. They support inspection of broad layout only, not a pixel-parity verdict or a claim that missing reference data is a layout defect. The v14 images use data closer to the reference; the examples are not directly comparable as a single controlled before/after. The worker's own before/after captures used matching data to each other, but a different page/viewport from the individual reference frames.

## Inputs and cost

| | Previous real run, v14 | Iteration 3, v17 |
|---|---:|---:|
| Submission | not accepted | not accepted |
| Source tree | `405c875387e7cfd88bce45e57a125823a3fd93e2` | same |
| Storybook tree | `c5de90466a4e2f3fb26680f0237890c9aeefa623` | same |
| Provided design inputs | 28 files, including 26 images | byte-identical 28 files |
| Reported reference coverage | 4 card frames; 22 images not fully compared automatically | 4 card examples on another fixture; other GPU/popover target pairs not fully verified |
| Targeted tests reported | 100 in 12 files | 17 in 2 files |
| Worker thread | 25:10 | 15:14 |
| Worker tool calls | 167 | 91 |
| Input, uncached | 185,032 | 135,497 |
| Input, cached | 29,554,816 | 12,251,776 |
| Output (includes reasoning) | 56,551 | 33,235 |

Both workers were requested as native Terra xhigh, with effective model/effort not independently reported. Both had Figma and local exports. They shared a filesystem with prior research and were instructed not to read it; these are not blind runs. The temporary v17 Git baseline excludes the Storybook dependency cache, which the earlier baseline accidentally tracked. Output tokens include reasoning; times are worker-thread wall time, not coordinator, build, browser, judge or reviewer time. The v17 permission-review helper used a further 101,540 uncached input, 857,216 cached input and 1,500 output tokens. The smaller test count reflects different selected suites and is **not** a pass-rate comparison. Each version has one run; the difference in elapsed time and tokens does not establish an improvement caused by the skill.

## What was checked and what remained

The worker's recorded typecheck, stylelint, 17 targeted tests and reported nine resize points passed; ESLint had five warnings. It captured before and after on the same Storybook list, inspected ordered cards and template examples, and reported the package consumer, some GPU/popover pairs, the zero-speed case and external consumers as untested. Its honesty is an observation; without a no-skill control, attribution to the skill is unknown.

The four individual frame captures use an internal shared rendering component, not the full user-facing ready-card entry point. Their data differs from the references and they omit the price and availability supplied by the outer entry point. Thus these captures do not establish the layout or behaviour of the full user-facing card. A stable-data story is useful for testing resize, but is a different observation from matching a specific design fixture.

Independent source/design inspection found additional material differences without relying on measured sizes of unmatched examples: the disk count/size order is the same in every mode even though the wide and narrow reference orders differ; the low-stock mark is a text exclamation rather than the drawn mark; and the ordinary-discount trigger retains the old textual label rather than the referenced icon. These findings concern the observed change and references; they are not proof about all sizes or all user flows.

## Reflection and next change

The v17 skill already directed the worker to compare reference-matching data and load a built package in an actual consumer. The transcript shows the skill was available and read, and it shows Storybook, typecheck and tests; no build/pack/import attempt was found before the first submission. The worker reported that gap explicitly. The record does not establish why it skipped the step or whether more time, another agent or a different instruction would have prevented it.

An independent Astra reviewer recommended moving a minimal concrete check earlier, rather than adding another generic reminder: as soon as one target state renders, compare it through the entry point users receive with the visible reference data and state. When the task changes a distributed library, load its built public export in an existing consumer or minimal local host, exercising touched assets and an applicable action; repeat affected checks after changes. If the source, data or runtime is unavailable, record the attempt and specific blocker, continue independent work, and leave the condition unverified. A standalone screenshot-only task should not be forced to build a library or invent interaction and dense-data stories. This remains a hypothesis; a single import proves that selected loading path, not all consumers or interactions.

The independent Astra analysis of this run lasted 3:12 and used 33,374 uncached input, 3,358,976 cached input and 7,164 output tokens, as a continuation delta. These are separate from the worker, coordinator and judge.

The next draft places that check in the working path and retains an explicit final recheck. The next iteration uses a separate screenshot-only case, with the pre-existing fixture's accepted implementation, a wrong-text control and an independently shifted-layout control tested before the worker starts. Its frozen result will show whether the shorter path handles a simple task; it will **not** by itself demonstrate success on this library task.
