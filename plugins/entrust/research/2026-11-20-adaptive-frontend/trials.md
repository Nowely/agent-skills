# Trial protocols and observations

These are five local, task-specific studies, not a benchmark or a statistical estimate. A submission is a version presented for acceptance; a return is a consolidated request to correct observable failures. The acceptance rubric was fixed before each trial. Each comparison has one fresh worker per condition, so differences cannot establish a stable effect. The descriptions below generalize the product examples and omit private materials. Times are recorded agent-turn intervals, including waits for the agent's own tools, unless identified as calendar time; they are not human labor, billed cost, or necessarily CPU time.

## 1. Responsive card pilot

Two fresh workers of the same model and effort received the same historical source, brief, four design frames, tools and permissions. The ordinary brief in both arms explicitly requested preserving selection and continuation and showing the result at multiple widths; it did not name the hidden checks. The baseline ran first; only the other worker received the candidate skill. Both had a nominal 30 minutes after the stand became usable, excluding common infrastructure outages. The independent judge used anonymized endpoints and checks fixed before dispatch. Workers had separate directories on a shared filesystem; a trace audit found no direct references to the other copy or judging materials, which is not OS isolation.

| Observation | Baseline | Skill |
|---|---|---|
| Selection, same-document resize and continuation with expected ID | Pass | Pass |
| Hidden widths 337 and 537 CSS px | Content and action inside card | Same |
| 601 / 764 px | Labels wrap / a long label is clipped | Labels stay on one line / full label visible |
| 486 px | Price and remainder occupy final row, matching frame | Another row appears below price |
| Single-processor sample | Core count appears once | Core count appears twice |
| Three-disk narrow state | Demonstration showed only one disk row | Same |
| Recorded first-to-last activity | 8:51 | 10:12 |
| Tool calls | 63 | 63 |
| Uncached input / output tokens | 72,108 / 17,252 | 64,186 / 21,049 |

Both retained access to legacy detail and displayed a manufacturer name as text. Neither demonstrated the three-row disk state on comparable data: one example had been reused across frames. The baseline's stand lost connectivity at the end after screenshots had been saved; the treatment stand restarted, and its worker began edits before receiving a working address. Four external font requests were blocked in both checks, and exact font matching and a real downstream transition were not verified. No single overall winner, monetary saving, or repeatable speed advantage follows. This first-submission pilot did not measure returns to acceptance.

## 2. Adaptive filter delivery

Two fresh workers received the same historical project, dependencies, short product brief, three design frames and working browser demonstration. Only treatment received the skill. The brief did not identify the existing filter composition, its path, the period control, lifecycle checks or previously observed defects. Initial delivery had a 24-minute cap, followed by up to two eight-minute correction submissions. An independent judge used the same frozen rubric and opaque endpoints; each failed submission received all reproducible symptoms together, without implementation instructions. Discovery of a precedent was assessed separately after blind behavioral evaluation.

| Measure | Baseline | Skill |
|---|---:|---:|
| Submissions / returns | 2 / 1 | 2 / 1 |
| Initial worker turn | 10:38 | 10:33 |
| Repair worker turn | 3:28 | 3:30 |
| Worker total | 14:06 | 14:04 |
| Judge turns | 6:48 | 4:57 |
| Worker plus judge | 20:54 | 19:01 |

The precise worker difference was 2.57 seconds. Of the 113.73-second difference in combined turns, 111.15 seconds came from the judge, who checked the second result after already learning the reproduction. Order was fixed. Shared control preparation of 7:19, coordinator work, intervals between turns and the later diagnostic were excluded. Thus neither a twofold speedup nor a saved return was observed.

Both workers found an existing filter composition and supplied the period. On the first submission, after resizing the same open page from 1200 to 900 to 320 px, document width was 660 px and 582 px respectively, so a gesture over a card moved the whole page. Both repairs restored document width to 320 px while retaining independent chip-strip scrolling. Accepted checks covered wide-screen placement, wrapping chips, selection persistence, price filtering and reset, subject to the original callback contract; the two demonstrations implemented server-filter behavior differently. The real downstream application was not tested.

A later review exposed a rubric limitation: both accepted implementations required an extra step to reach accelerator models compared with the existing template interaction. The frozen rubric expressly excluded editor nesting and click count, so the pass stands under that rubric; time to matching that interaction was not measured. Historical user returns were not counted as saved experimental returns.

### Post-hoc resize signal and negative controls

After unblinding, five isolated reconstructions were made: historical control, each first submission and each repair. Recorded file deltas were checked against submission hashes. Each version was tested three times in fresh browser contexts in each mode; the same mounted page was resized from 1200×1081 to 900 and then 320 CSS px, or opened directly at 320. After fonts and first-card visibility, the resize test used fixed 550 ms waits and stable-geometry polling. All five versions measured correctly at 1200 and 900.

| Version | Resized document / viewport at 320 | Direct open at 320 | Mean resize sequence |
|---|---:|---:|---:|
| Historical control | 320 / 320 | 320 / 320 | 3.235 s |
| Baseline first / repaired | 660 / 320; 320 / 320 | 320 / 320 for both | 3.272 / 3.251 s |
| Skill first / repaired | 582 / 320; 320 / 320 | 320 / 320 for both | 3.239 / 3.251 s |

Each width reading was identical in 3/3 repeats. Timing columns are means of three elapsed durations. All 15 direct-open trials passed, including the two defective submissions. The historical control and both repairs are negative controls for the width signal. Timing excludes page load, includes deliberate waits and reflects this local setup. The probe measures document width, not the gesture itself; the original judge separately observed page displacement. It was designed after the defect was known, does not measure discovery time, cannot detect every nested overflow and cannot establish general responsive correctness. Installed dependencies were shared; their historical lockfile equivalence was not verified for this diagnostic.

## 3. Early observer on two selectors

This constructed request used two real public components with different adapters and completion rules: a single selection and a multiple-assignee selection. Both workers had the same skill, brief, source, fixtures and procedure. Each first delivered the single selector as a frozen slice; the control continued, while treatment received two visits by an independent early observer, one on the original and one on the slice. A separate judge evaluated anonymized outputs with the same suite. The mobile reference showed options first and allowed the user to tap search; a physical phone keyboard was not emulated. Each condition had a 32 agent-minute total cap including worker, observer, repairs and final judging.

| Measured role time | Baseline | Early observer |
|---|---:|---:|
| First worker slice | 4:06 | 3:18 |
| Remaining work to first complete submission | 7:59 | 4:31 |
| Worker repair | 2:32 | 1:19 |
| Observer's two visits | — | 4:46 |
| Allocated share of two judge checks | 2:15 | 2:15 |
| Total to acceptance | 16:52 | 16:08 |
| Submissions / returns | 2 / 1 | 2 / 1 |

Individual rows are rounded independently; unrounded totals differ by about 43 seconds. Judge checks took 145.208 and 124.461 seconds and were split equally. Both first submissions scored 52/54 automatically: both mobile components focused search immediately. The baseline also exposed localization keys in place of status text. Both repaired versions scored 54/54, with translations additionally checked visually; final checks covered selection, adding and removing assignees, reopening and desktop behavior.

The first observer visit (3:13) found neighboring examples but did not record opening and selection in the mobile reference. Its original screenshot was missing; the coordinator knew the export revision but omitted it from the initial observer brief, and the observer's attempt to obtain it from the export failed. The independent judge did have a baseline measurement. The second visit (1:32) opened and searched the first slice but selected the current value, leaving a changed-value confirmation unproved, and missed autofocus. After feedback, the worker demonstrated a different value; the selection code remained byte-identical between slice and second-screen submission. That is a change in evidence, not a demonstrated code change or causal transfer.

Including observer visits, treatment had cost about 30 seconds more by first complete submission; the eventual small difference appeared after the baseline also repaired translations, which the observer had not identified. Up to acceptance the compared costs exclude shared setup, queueing, coordinator effort and report writing; another 9:19 of shared task selection, stand preparation and accounting was recorded, but full overhead was not. Calendar time from scouting to both acceptances was 39:46; repairs overlapped by 1:18. This pair does not establish that an observer accelerates delivery or prevents a return.

## Full card trials

The full trials used independent fresh workers of the same model and effort, the same historical source and consumer context, brief, 26 visual references and local browser surface. The release implementation and hidden checks were withheld. The judge evaluated actual packaged public entry points, public flows, visual reference and a retained rubric; returns combined observable symptoms. These are one run per version, and updated v5 was prepared after inspecting v4. It bundles multiple ideas, so no single instruction's effect can be isolated. Before the new readiness rule, v3 and the earlier v5 had not separately undergone comparable behavioral trials.

The v5 run reused v4's prepared verification tools and release calibration. The eventual product decision about an explanatory discount was supplied correctly to v5; v4 first received an incorrect coordinator answer that was corrected before submission. The coordinator's mistake is an input difference, not a worker defect. Other final historical decisions were supplied to both. Both workers used separate copies on a shared filesystem; trace inspection is not a guarantee of physical isolation. The task was a local full-scope exercise, not a live deployment, real downstream integration or CI run.

| Measure | v4 | Updated v5 |
|---|---:|---:|
| Submissions / returns | 3 / 2 | 4 / 3 |
| Worker through first submission | 21:14 | 31:55 |
| Worker, all turns | 54:31 | 1:17:56 |
| Judge on submitted versions | 24:23 | 18:40 |
| Worker plus submission judging | 1:18:54 | 1:36:36 |
| Calendar from initial preparation to acceptance | 1:29:55 | 1:41:44 |

Receipt-level worker phases, in order, were v4: 109.264 s planning/questions, 1,164.200 s implementation, 1,729.652 s first repair, 267.847 s second repair; v5: 74.796 s planning/questions, 1,840.060 s implementation, 1,309.174 s first repair, 621.047 s second repair, 830.423 s third repair. Submission-judge turns were v4: 733.045, 389.596 and 340.337 s; v5: 357.421, 291.364, 281.862 and 189.744 s. Their separate initial judge setup/calibration turns were 1,111.745 s and 115.726 s, respectively, and are excluded from the judging totals above. Additional recorded v4 input/stand/inventory turns totaled about 10:13; together with judge setup this is about 28:44 of preparatory agent time, with possible overlap and without complete coordinator accounting. V5 stand preparation was 122.912 s, separate from its 115.726 s judge preparation. Calendar spans include preparation, handoffs and idle gaps; sums of agent turns need not equal elapsed time. The reused v4 calibration makes setup and calendar comparisons asymmetric.

### Returns and final observations

* **v4 submission 1: fail.** The built public entry point could not load a missing packaged image. A separately labeled diagnostic substitution exposed additional issues: separate template markup with missing data, disappearing header, reordered disk values, action overlap, label/discount errors and hints reopening. Selection and the actual ID after resize worked. The worker had already identified incomplete state coverage and separate markup before submitting.
* **v4 submission 2: fail.** Major packaging, shared-card, header, geometry and hint issues were repaired, but tapping a low-stock explanation on touch could select a card or show its action.
* **v4 submission 3: pass under the agreed rubric.** Touch explanation, selection, URL and callbacks passed in both modes, including a different previously selected item. Ready, ordered and template public inputs, the old site adapter and types were checked. The suite had 27 scenarios; two automated locator mismatches were checked separately through the UI.
* **Updated v5 submission 1: fail.** The worker itself found and repaired the missing packaged image and verified an actual import and selection from the built package. Nevertheless it submitted known separate ready/template markup; the judge found missing template data, price overlap, hints remaining open and labels losing meaning on valid inputs. Thus the package check succeeded in this run; the readiness decision did not ensure a complete first submission.
* **Updated v5 submission 2: fail.** Dense-data overlap was repaired, but at 601 px the price moved to a separate row and card height grew to about 207 px.
* **Updated v5 submission 3: fail.** Density improved, but neighboring rows used a shared header inconsistently: a core count appeared under a frequency heading. A mixed list checked against the release and accepted v4 was consistent there.
* **Updated v5 submission 4: pass under the agreed rubric.** Shared-header alignment at 601 and 624 px, no overlap at 11 widths, shared rendering for the three configuration types, legacy adapter, build, selection, touch explanation and public callbacks passed. Automated checks reported 24/27 in the main suite and 51/56 with extra cases; all five text/locator discrepancies were separately assessed against user-visible behavior. The last judge turn took about three minutes.

### Matched visual heights

These are CSS-pixel heights for comparable records, not image-file pixel counts. The historical release is a reference, and the agreed pass permits visible residual differences; neither accepted version achieved pixel parity.

| Card width | Design frame | Historical release | Accepted v4 | Accepted v5 |
|---:|---:|---:|---:|---:|
| 764 | 114 | 114 | 106 | 122 |
| 601 | 146 | 145 | 162 | 171 |
| 486 | 228 | 228 | 218 | 228 |
| 280 | 499 | 499.95 | 464 | 492 |

V5 was closer on these height measurements at 486 and 280 px; v4 was closer at 601 px, while both differed by 8 px at 764. Height is only one aspect of visual fidelity. The evidence supports retaining the successful package check as an observation in this case; it does not show which instruction caused it, prove an overall quality or speed advantage, or establish that these outcomes transfer to a new task.

## Reading the resource counters

[Role-level measurements](role-metrics.csv) includes 38 rows of numeric evidence. The card pilot records first-to-last worker activity. The later studies use completed agent turns, excluding the intervals between turns and counting waits for tools inside a turn. In the filter study, judge rows marked with the condition in the phase column belong to that condition; the setup row is shared. In the observer study the judge assessed both arms in the same session. Only the two active evaluation windows quoted above can be divided equally. The CSV omits judge turns for that study because including whole turns would charge preparation or idle time to the arms. Some preparatory agents are represented solely by the aggregate timings in the text. The CSV is not an exhaustive bill.

Each tool count is a top-level call; a call can wrap several commands. Cached input and uncached input are separate. Reasoning tokens are included in output; adding that column to output would double-count them. No token prices were established. For example, the two filter workers made 85 and 76 calls and produced 28,241 and 28,245 output tokens, respectively. Those differences coincided with practically identical worker time and one return for each arm.
