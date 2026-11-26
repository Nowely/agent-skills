# First-checkpoint cost and faster design-to-code iterations

## Decision this record supports

The objective is to reduce time to a **correct, reviewable first delivery**, not merely to make the checker green or to use fewer tokens. This record audits the existing draft-27 full-task run, its coordinator, the independent reviewer, permission-review helpers, the v19 full-task comparison and a narrow sample of the original product-work conversation. It also considers how to shorten the iteration cycle of the skill itself. No new UI implementation or checker experiment was run for this analysis.

The primary result was a returned first checkpoint; the reviewer found a lifecycle failure. Four major card references looked close, but that does not establish all visual or behavioural requirements. One subsequent correction was measured separately. [The run and visual evidence](31-terra-real-task.md) remain the source for functional outcomes. This analysis is not an owner acceptance or a success-rate estimate.

**Key observations:**

- The first documented post-change page capture with a target row visible completed by **6:27** and was opened at **6:32**; four widths were captured by **8:46**; the first completed full checker record appeared at **29:17**; the first checkpoint after **1:39:13** of worker time. These milestones do not represent equivalent levels of completeness.
- Worker v27 had **530 model responses**, versus **165** in v19. Average cached input per response rose from about **167,005** to **317,132** tokens. The **6.10×** growth in total cached input is arithmetically **3.21× responses × 1.90× cached input per response**. Inputs, feedback and scope differed, so this is not a causal effect of the skill.
- A single worker response accounted for **437,482 uncached input**, 53.96% of that worker's first-checkpoint uncached input. The immediately preceding request reused almost its entire prefix; the next request again reused almost all of it. A cache-miss or invalidated-prefix explanation is plausible, but the visible telemetry does not establish the cause or billing.
- The earlier record undercounted permission-review usage by omitting two visible compaction requests. The correction, methods and exact arithmetic follow below; the earlier record is preserved as a historical measurement under its original method.
- The interval between outer tool calls and matching outputs occupied **16:45.971 of 1:39:12.873** worker wall. Mechanically setting those observed intervals to zero while freezing everything else gives at most about **1.20×** for that model. This is not a bound on a different workflow: background processes, changes in context, parallel roles and changed decisions can cross those intervals. The remainder is not proven to be model reasoning or CPU time.
- **61 image blocks represented 59 distinct payloads.** Only two pairs were byte-identical. Reopened image paths often contained changed bytes. This does not prove each view was useful, but it does not support removing visual checks merely because a path was read again.
- Frozen replay can cheaply answer a narrow detector question; a short model task tests whether an instruction changes a decision; a full run tests the integrated workflow and first delivery. They answer different questions and should not be substituted for one another.

## Scope and measurement conventions

The first-checkpoint boundary is the first completed worker task. The correction, additional owner requests and later research are separated. The implementation tree and 28 supplied inputs matched the earlier v19 task, but the v27 run had a different skill/checker, prior returns in its input, a different review process, and two coordinator interventions. Each version was run once. Both workers shared a filesystem with previous materials and were instructed not to consult them; they were not physically blind. No new no-skill baseline was run, as the owner directed.

Input counts below are observed model-request usage. `cached input` is included in `input`, and `uncached = input − cached`; output includes reasoning. Cached input is repeatedly counted across requests, not unique document size or necessarily the size of a single context window. The record does not expose monetary cost, provider-side image tokenisation, exact model computation time, prefill latency or all possible hidden transformations.

For model usage, this audit sums distinct `response_id` records in `token_usage_record` and checks the corresponding thread totals. For calls it counts outer `response_item` tool calls; one `exec` may run multiple nested operations, spawn a background process or poll a previous session. Sequential association of a model response and its next visible call is descriptive, not a proven causal allocation of that response's entire context to one action. Wall intervals for worker, reviewer, coordinator and helpers can overlap and must not be added as elapsed time.

Detailed, anonymised data: [stage accounting](32-stage-accounting.json), [530 response groups](32-response-groups.json), [31 checker rounds](32-checker-rounds.json), [worker time windows](32-worker-phases.json), [cost of this forensic analysis through its snapshot](32-analysis-cost.json). These contain measurements and derived labels, not transcript text or source code.

## System timeline: request to useful result

All times are elapsed UTC intervals. The second checkpoint and later research were not the same deliverable as the first checkpoint.

| Point reached | Elapsed from owner approval | Cumulative model responses | Uncached input | Cached input | Output | Outer calls |
|---|---:|---:|---:|---:|---:|---:|
| Worker checkpoint before independent review | 1:43:19 | 827 | 2,005,095 | 224,760,320 | 242,198 | 719 |
| First independent verdict: return | 1:53:28 | 953 | 2,488,069 | 240,485,248 | 265,290 | 812 |
| Worker completed one correction | 2:10:43 | 1,174 | 2,867,612 | 314,373,760 | 330,525 | 994 |
| Research answer published | 2:32:10 | 1,413 | 3,271,101 | 376,480,768 | 407,569 | 1,187 |

The first interval includes initial setup and overlapping coordinator and permission-review work. The final interval additionally contains owner-requested Storybook access, code/release comparison, diagnostic investigation and publication. It is **not** the minimum cost of implementing the feature. Owner time and the time to owner acceptance were not measured. No full acceptance was recorded.

The reviewer began about 52 seconds after checkpoint; the correction began about 11 seconds after the reviewer verdict. Eliminating just those handoffs cannot account for an hour of implementation time. Earlier preparation and stable contract/reference discovery may still be candidates for parallel work; their incremental benefit and reviewer startup cost are unmeasured.

### Worker and helper accounting through the first independent verdict

| Role | Model responses | Uncached input | Cached input | Output | Outer calls |
|---|---:|---:|---:|---:|---:|
| Worker before first checkpoint | 530 | 810,733 | 168,079,744 | 197,341 | 527 |
| Worker's permission reviewer through checkpoint | 103 | 1,070,326 | 13,396,480 | 11,923 | 0 |
| Independent reviewer through first verdict | 70 | 119,445 | 7,449,728 | 14,864 | 68 |
| Reviewer's permission reviewer through first verdict | 30 | 102,047 | 1,718,016 | 2,636 | 0 |
| **These four roles** | **733** | **2,102,551** | **190,643,968** | **226,764** | **595** |

The four-role subtotal excludes the coordinator and its permission reviewer. The system timeline above includes all observed roles in each time window. The later correction and follow-up reviewer work are not included in this subtotal.

For the owner's requested separate view of the later work, the following are **incremental** role counters, not
additional first-checkpoint cost. The helper and reviewer windows are time-bounded continuations; they can include
other owner-requested follow-ups and cannot all be attributed to the correction itself.

| Later role/window | Responses | Uncached input | Cached input | Output | Outer calls |
|---|---:|---:|---:|---:|---:|
| Worker correction after verdict | 84 | 98,541 | 45,219,584 | 29,506 | 83 |
| Worker's permission reviewer after first checkpoint | 21 | 110,497 | 1,997,184 | 2,377 | 0 |
| Reviewer, subsequent turns | 85 | 122,107 | 18,860,928 | 29,414 | 80 |
| Reviewer's permission reviewer after verdict | 18 | 130,323 | 582,784 | 2,427 | 0 |

### Correction to record 31: compaction usage

[Record 31](31-terra-real-task.md) used the permission helper's `event_msg.token_count` aggregate: **623,508 uncached / 13,384,960 cached / 8,995 output** for the worker through the first checkpoint. Those are actual recorded values, but they omit two visible model requests immediately preceding `compacted` events. The distinct `token_usage_record` stream and its final `thread_token_usage` include those requests, yielding **1,070,326 / 13,396,480 / 11,923**. The difference is exactly **446,818 uncached / 11,520 cached / 2,928 output**. Therefore the previous four-role subtotal of **1,655,733 / 190,632,448 / 223,836** was incomplete under the full response-usage definition. The corrected subtotal is in the table. These are telemetry definitions, not an invoice; no separate compaction model or billing was established.

There were 101 completed permission turns for the worker before checkpoint: all were allowed, with 75 marked low and 26 medium risk in the recorded reviews. Their durations sum to **434.46 s**, median **3.18 s**, maximum **38.46 s**. The previously printed **1:35:49** is the span from first to last activity, not 95 minutes of continuous review. Even the 434.46 s overlaps worker activity and does not directly measure the added critical-path delay. The permission process remains mandatory; lower overhead is a hypothesis about batching already-authorised, compatible actions, not bypassing checks or widening access.

## How worker context and token usage grew

| Measurement | Earlier full-task v19 | Draft 27 first checkpoint |
|---|---:|---:|
| Wall | 23:47 | 1:39:13 |
| Model responses / outer calls | 165 / 164 | 530 / 527 |
| First request input | 30,706 | 30,698 |
| Median / maximum request input | 180,923 / 232,398 | 330,449 / 508,572 |
| Uncached input | 177,597 | 810,733 |
| Cached input | 27,555,840 | 168,079,744 |
| Output, including reasoning | 49,899 | 197,341 |
| Image blocks | 18 | 61 |

The v27 request input first exceeded 200,000 tokens at 19:04:30 UTC, 300,000 at 19:25:18 and 500,000 at 20:20:27. Its recorded per-request input never decreased across the first checkpoint; no explicit worker compaction event was observed. This does not exclude hidden transformations. Initial input was about the same as v19, but the requests and inputs grew later. A smaller skill page alone is therefore not proven to solve the overall cost.

The exceptional request at **20:03:26.846 UTC** had 444,010 input, of which 6,528 were cached and **437,482 uncached**. Immediately before it, a request had 443,358 input / 443,008 cached; the following request had 444,448 / 444,288 cached. The input length barely changed while the recorded reuse changed sharply. These observations do not establish expiration, prefix invalidation, a coordinator message, provider policy or another particular cause. Do not price this sample or assume every future run will repeat it.

Worker output was 197,341 tokens, including 77,089 recorded reasoning tokens. Outer tool responses had 937,395 characters of text and 61 image blocks; their compact JSON serialisation was 4,183,681 UTF-8 bytes, including encoded image references. Bytes or base64 characters are not model image tokens. Two image-payload pairs were identical; 59 of 61 were distinct. Seven repeatedly opened local paths contained different image bytes on repeat. Changed bytes are not proof of a visually meaningful difference, but they preclude classifying those repeated views as identical by filename alone.

## Worker phases: time windows, not exclusive work categories

The following non-overlapping windows are bounded by observed milestones. Setup, edits, browser work, checking and waiting are interleaved inside them; a model-request input contains previous history. Usage is allocated by request timestamp, not caused by the named phase. Boundary timestamps are rounded for readability; totals match 530 responses and 527 outer calls. The exceptional cache observation above falls in the final window.

| Window | Elapsed | Responses / calls | Uncached input | Cached input | Output | What is known |
|---|---:|---:|---:|---:|---:|---|
| Start → shared row reported | 5:45 | 37 / 37 | 98,924 | 2,907,008 | 12,219 | Task and source investigation, initial work; report of a row is not acceptance. |
| Shared row reported → first visible four-width render | 3:01 | 20 / 20 | 23,090 | 2,475,136 | 6,030 | One post-change page capture by 6:27, viewed at 6:32; four widths by 8:46. Interactions and parity were not established. |
| First render → first full checker result | 20:31 | 106 / 106 | 78,762 | 20,349,568 | 45,051 | Implementation, comparison setup and quick checks interleaved. |
| First full result → full round 28 recorded | 45:09 | 231 / 230 | 123,827 | 79,135,488 | 88,451 | Further product changes and checks; the scenario set changed. |
| Round 28 → checker transition cause identified | 3:12 | 21 / 21 | 8,539 | 9,116,928 | 4,674 | Four sheet-closing failures investigated. |
| Cause identified → first checkpoint | 21:35 | 115 / 113 | 477,591 | 54,095,616 | 40,916 | Independent gesture replay, product changes, builds, package, tests, i18n, evidence and repeated checks. |

The worker had 24 recorded quick and 7 full rounds. An additional launch failed on a selector before creating a history record. After the transition cause was identified, full rounds 29 and 31 repeated the same four sheet failures, with product edits and other verification between them. That demonstrates repeated failure, not that both runs or all 21:35 were unnecessary. The comparison basis/spec and scenario count changed during the run, so raw scores are not a single comparable quality series.

## Usage grouped by the next visible action

For each model response, outer calls recorded between the previous and current usage record are matched by order. This produced 527 intervals with one call and 3 with none; sums match the worker total. Direct `response_id` linkage is absent from the call payload, so hidden batching or log transformations cannot be excluded. A group describes **which action followed a model response**, not tokens caused by that action: its input includes the entire accumulated history, and the action's output normally enters a later request. `Mixed` and `unknown` are not redistributed. Heuristic labels indicate command text, not proof that a file was actually read or edited.

| Next visible action: heuristic group | Responses | Uncached input | Cached input | Output |
|---|---:|---:|---:|---:|
| Checker candidate | 21 | 11,206 | 7,271,040 | 9,678 |
| Environment and checks | 53 | 46,264 | 17,499,392 | 22,608 |
| Evidence references | 3 | 532 | 1,027,200 | 1,590 |
| Design source | 9 | 12,473 | 1,667,200 | 2,203 |
| Host wait | 2 | 335 | 753,792 | 111 |
| Image views | 26 | 22,659 | 7,560,576 | 5,045 |
| Messages | 17 | 10,771 | 5,424,640 | 4,469 |
| Mixed signals | 148 | 542,115 | 46,229,632 | 99,148 |
| No call in interval | 3 | 1,557 | 1,260,672 | 1,254 |
| Possible product edit | 5 | 5,194 | 614,144 | 5,408 |
| Possible product read | 65 | 57,108 | 17,841,152 | 18,595 |
| Checker result reference | 8 | 1,727 | 3,426,176 | 2,382 |
| Session read / polling | 134 | 46,107 | 45,915,776 | 15,915 |
| Skill reference | 12 | 9,075 | 3,889,792 | 1,995 |
| Unclassified | 24 | 43,610 | 7,698,560 | 6,940 |
| **Total** | **530** | **810,733** | **168,079,744** | **197,341** |

The worker made 508 outer `exec` calls, 17 messages and 2 host waits. Static inspection of embedded scripts found
392 syntactic mentions of command execution, 186 of session reads and 39 of image viewing; loops and parallel scripts
mean these are not counts of actual nested executions and must not be added to outer calls. Of 137 outer calls
containing a session-read operation, 136 contained an empty-input read; 134 were classified as read/poll-only by a
separate heuristic, and 28 of those had an empty or very short trailing result. Polls often returned useful output.
An audit of the matching commands distinguishes **33 actual checker invocations**: 31 recorded rounds, one
invalid-selector launch and one `check --help` launch that the CLI interpreted as a configuration filename and
returned as an error. Neither failed setup attempt created a history record. A further textual mention was a
Markdown write, not a checker invocation. The 31 recorded statuses were 29 `fail` and 2 `pending`.

56 of 393 identified command-execution operations contained inline browser scripts importing Playwright, totalling
55,489 characters of command text; the earlier run had 9 and 7,762. These are descriptive counts, not proof that
every line was redundant. One parameterised local probe could reduce repeated authoring and calls, but must preserve
independent states, actual consumer entry points and screenshots.

## Ten largest outer tool outputs

Size is compact JSON serialization of the recorded output, in UTF-8 bytes and characters; in these ten rows the two
counts coincide. Each includes encoded image references and is **not** a measurement of image tokens or price.
Purpose is inferred from the command; unknown details are not invented. Transcript line numbers are only local
evidence pointers; the underlying transcript is not published.

| Rank | Output / call line | Output purpose supported by the command | Bytes / characters | Image blocks |
|---:|---:|---|---:|---:|
| 1 | 314 / 311 | Full-page screenshot of the local result | 971,951 | 1 |
| 2 | 72 / 66 | Four supplied design images; precise states not established from the command alone | 240,135 | 4 |
| 3 | 693 / 686 | Five screenshots of responsive modes | 144,119 | 5 |
| 4 | 749 / 742 | Five screenshots of the same named modes; changed content was not determined from names | 140,759 | 5 |
| 5 | 1334 / 1331 | Screenshot labelled public; exact contents not established from this command | 136,991 | 1 |
| 6 | 414 / 407 | Four width references and one 601 px screenshot | 128,155 | 5 |
| 7 | 1115 / 1110 | Three supplied design images; precise states not established from the command alone | 125,455 | 3 |
| 8 | 2759 / 2756 | Local tooltip screenshot; exact contents not established from this command | 125,239 | 1 |
| 9 | 2326 / 2323 | Narrow-mode screenshot; exact contents not established | 119,451 | 1 |
| 10 | 2233 / 2230 | Narrow-mode screenshot; exact contents not established | 118,171 | 1 |

Large text responses included three mixed-file reads of about 40 kB each; the evidence does not show they were the
same file repeated. The main skill-page read produced about 14 kB of text including the tool wrapper. Nine literal
product paths were requested twice by a conservative `cat`-only search, but intervening edits and mixed outputs mean
that is not proof of redundant identical reads. Exactly one text output above 100 bytes was duplicated, at 147 bytes
each. The image payload hash result is given above.

## The 31 recorded checker rounds

The table records the first visible `start here` signal or first explicit journey failure in the output, not a
proven main cause of the whole round. `unknown` means that signal was absent, truncated or not matched. The input
columns describe the entire model request associated by event order with launching the check, including cached input;
they are not the isolated cost of the checker or of the round. The status is what history recorded.

| Round | Recorded UTC | Mode | Status | Basis | Request input | Cached | First visible signal |
|---:|---|---|---|---|---:|---:|---|
| 1 | 19:01:13 | quick | fail | 1dc5622e1f8e | 180,126 | 179,968 | Text width delta: -16.69 px. |
| 2 | 19:05:40 | quick | fail | 2c8c18590350 | 204,863 | 204,672 | Text width delta: -16.69 px. |
| 3 | 19:06:47 | quick | fail | 2c8c18590350 | 211,033 | 209,664 | Text width delta: -16.69 px. |
| 4 | 19:07:32 | quick | fail | 2c8c18590350 | 213,049 | 211,584 | Text width delta: -16.69 px. |
| 5 | 19:08:43 | quick | fail | 2c8c18590350 | 218,028 | 217,728 | Text width delta: -16.69 px. |
| 6 | 19:13:26 | full | fail | f868b68f772c | 241,326 | 241,152 | Text width delta: -16.69 px. |
| 7 | 19:15:50 | full | fail | 8d7d2b57d09d | 258,894 | 257,664 | Text width delta: -16.69 px. |
| 8 | 19:17:24 | quick | fail | 69bfcf4b78c5 | 267,315 | 267,136 | Text width delta: -16.69 px. |
| 9 | 19:21:47 | full | fail | 335dc64943ca | 280,829 | 280,704 | Text width delta: -16.69 px. |
| 10 | 19:27:23 | full | fail | a21c4f77e0dc | 302,621 | 302,080 | Text width delta: -16.69 px. |
| 11 | 19:35:30 | quick | fail | 7b13c0c782f2 | 340,271 | 339,328 | Text width delta: -16.69 px. |
| 12 | 19:36:10 | quick | fail | 3e025a33f2ea | 342,607 | 340,992 | unknown |
| 13 | 19:36:51 | quick | fail | 0f08bdfcd95d | 347,601 | 346,880 | Text width delta: -16.69 px. |
| 14 | 19:38:49 | quick | fail | 0f08bdfcd95d | 355,484 | 352,896 | unknown |
| 15 | 19:42:09 | quick | fail | 81b152196d1b | 372,627 | 372,480 | Text width delta: -16.69 px. |
| 16 | 19:43:10 | quick | fail | 81b152196d1b | 377,756 | 377,088 | unknown |
| 17 | 19:44:01 | quick | fail | 81b152196d1b | 380,051 | 379,264 | Text width delta: -16.69 px. |
| 18 | 19:45:10 | quick | fail | 81b152196d1b | 383,687 | 383,488 | Text width delta: -16.69 px. |
| 19 | 19:46:32 | quick | fail | 81b152196d1b | 388,385 | 388,096 | Text width delta: -16.69 px. |
| 20 | 19:48:17 | quick | fail | 81b152196d1b | 395,444 | 394,368 | Text width delta: -16.69 px. |
| 21 | 19:50:14 | quick | fail | 81b152196d1b | 401,788 | 401,536 | Text width delta: -16.69 px. |
| 22 | 19:51:32 | quick | fail | d61b06970118 | 405,629 | 404,992 | Text width delta: -5.69 px. |
| 23 | 19:52:26 | quick | fail | bc10bf8b5a46 | 409,892 | 408,704 | Text width delta: -5.69 px. |
| 24 | 19:54:27 | quick | fail | 1f16f2d02d9e | 415,111 | 414,720 | Text width delta: -5.69 px. |
| 25 | 19:55:11 | quick | fail | 1f16f2d02d9e | 417,001 | 416,640 | Text width delta: -5.69 px. |
| 26 | 19:55:35 | quick | fail | 1f16f2d02d9e | 419,076 | 418,432 | Text width delta: -5.69 px. |
| 27 | 19:56:46 | quick | pending | 1f16f2d02d9e | 424,515 | 424,448 | unknown |
| 28 | 19:58:35 | full | fail | 0eeb534d37c9 | 425,805 | 425,344 | A mobile network sheet did not close. |
| 29† | 20:18:04 | full | fail | 0eeb534d37c9 | 486,614 | 486,528 | A mobile network sheet did not close. |
| 30 | 20:19:05 | quick | pending | 1f16f2d02d9e | 495,799 | 494,976 | unknown |
| 31† | 20:22:03 | full | fail | 0eeb534d37c9 | 501,894 | 501,632 | A mobile network sheet did not close. |

† Full rounds 29 and 31 occurred after the worker identified the checker's transition conflict. Both reported the
same four sheet failures; product changes occurred between them. Round 28 had shown those failures before the cause
was established. Two setup/tooling attempts did not reach history: `check --help` at 19:00:28 UTC, whose associated request had
178,891 input / 178,432 cached, and an invalid-selector launch at 19:53:56 UTC, whose associated request had
414,238 input / 413,952 cached. Partial `pending` rounds are not acceptance of a complete product.

## Potentially separable stretches and evidence limits

These are candidates suggested by the recorded work, not measured benefits of a different team structure. A
worker's input tokens include its prior context, and elapsed windows include mixed activity. The full measurement
of a candidate role is unknown unless explicitly shown.

| Candidate | Observed effort and stage | Inputs → useful output | Dependency and limits |
|---|---|---|---|
| Reference, contract and consumer discovery | The whole first 8:46 had 57 outer calls, 122,014 uncached, 5,382,144 cached and 18,249 output. This includes implementation as well as reading; discovery alone is not isolated. | Owner decisions, design references, product contracts and entry points → a short state/data map and paths to reusable evidence. | Can begin on stable inputs alongside implementation. It cannot guarantee the behaviour of the later rendered code; a final consumer check is still required. |
| Diagnose a broken measurement | One observed contiguous sheet/checker investigation had 16 outer calls / 16 associated responses, 6,733 uncached, 7,000,704 cached and 3,056 output. A subsequent blocker-report write was one call associated with the 437,482-uncached outlier. Those are chronological request totals, **not** the causal price of the investigation or of the write. | An existing rendered consumer, gesture, frozen checker and observed failure → a controlled normal-versus-injected-transition reproduction and a short blocker report. | Requires a working consumer and the failing condition; a helper should not modify the product to force the checker green. Additional startup and handoff cost would need measuring. |
| Independent first-checkpoint review | The actual review took 9:17, 68 outer calls, 119,445 uncached, 7,449,728 cached and 14,864 output, plus its separately measured permission reviewer. | Frozen candidate, task, references and supported consumer paths → a reproducible lifecycle finding and visual evidence. | Depends on the final immutable checkpoint. Early fixture preparation can overlap, but a review of a moving candidate is not this independent verdict. |
| Browser probes and evidence assembly | 56 observed command executions contained inline browser scripts; 61 image blocks were supplied. Their input costs cannot be cleanly extracted from mixed model context. | Story, fixed data/state/width and target references → concise per-scenario results, reusable images and links. | Many probes depend on the current render. A helper can prepare generic routes, but must recheck after a relevant product change; avoid two writers on the same files. |

The log supports **at least three observed classes of product-facing edits** during the first run: responsive
layout/overlap under a chosen stress fixture, popup placement/closing behaviour, and visual asset/colour or tooltip
content corrections. The stress fixture's domain validity must be checked separately. There were also two tooling
setup errors and one reproduced checker-induced sheet failure; the worker did not change the sheet to force those
failures green. This is not a complete count of individual findings that changed code: outputs were grouped or
truncated, some edits addressed several causes, and the mapping from each finding to each diff was not reliably
recorded. In particular, the repeated first printed width finding alone does not prove the agent acted only on that
finding or that all other checks were wasted.

## The original product workflow: selected evidence, not a wall-time attribution

A narrow, keyword-assisted sample of the original multi-day product-work conversation and nearby replies shows why
examining only the worker transcript would miss relevant decisions. It is not an exhaustive reconstruction of all
agents or CI. Calendar gaps include unknown human availability and unrelated work; none is labelled active work by
default. In the sampled record:

- the owner clarified that the reference was a **group of designs**, including GPU, responsive widths and popovers;
later feedback caught missing mobile states, layout overlaps and a transient parent-width transition;
- changes to the availability rule, the scope of older consumers, and the mobile-sheet behaviour required preserving
the latest decision instead of treating an earlier plan as immutable;
- one implementation change created a state/price regression when its parent changed, illustrating why a static
screenshot or a passing build cannot cover selection, focus, mounting and user actions across a resize;
- the case's shared CI had a manually initiated, effectively serial check constraint at that time. A package build,
consumer update and verification depended on an exact published revision. Separate snapshots, unrelated flaky tests,
an upstream typecheck issue and an infrastructure scheduling failure had different causes. The sample does not
measure the fraction of elapsed time caused by any one of them.

The practical opportunity is to obtain owner decisions, the complete reference set, consumer paths and constraints
early; parallelise independent discovery and reusable fixture preparation; and connect the exact library revision to
the consumer, CI and saved evidence once it exists. A release artifact cannot be tested in the consumer before it
exists, and one case's temporary CI scheduling limit is not a universal platform rule. Authenticated verification
should follow the project's authorised persistent browser profile; a local unauthenticated component page can use a
clean profile. Permission checks must not be bypassed.

## Analysis work also has a cost

The owner asked for a multi-role forensic analysis. Through the recorded snapshot, the analysis itself consumed the
following observed usage; report writing and publication after the snapshot are excluded. The coordinator row covers
the conversation's work in this interval, including owner-directed follow-ups. The role sessions and any helper
sessions overlap in wall time; usage is not a money figure.

| Role | Responses | Uncached input | Cached input | Output | Outer calls |
|---|---:|---:|---:|---:|---:|
| coordinator | 145 | 351,931 | 70,430,848 | 65,085 | 127 |
| independent advisor permission reviewer | 1 | 8,239 | 5,888 | 144 | 0 |
| timeline analyst | 52 | 190,044 | 7,235,072 | 30,993 | 49 |
| usage analyst | 50 | 70,963 | 3,639,552 | 27,907 | 47 |
| independent advisor | 65 | 145,215 | 5,936,384 | 32,309 | 58 |
| **Observed total** | **313** | **766,392** | **87,247,744** | **156,438** | **281** |

Snapshot: 2026-11-21T21:43:47.535Z to 2026-11-21T22:13:59.925906+00:00. Later work and any unobserved roles are not included. The coordinator's long existing conversation is carried into its own requests even when subagents start
with fresh contexts. One coordinator request at 22:09:28 UTC had 530,890 total input / 251,520 cached / 279,370
uncached; its cause is not established. The coordinator's tokens are a real observed process cost, not worker
implementation cost. A smaller coordinator handoff or shorter fresh context is a hypothesis worth measuring; it
must retain owner decisions, safety boundaries and enough context to judge the result.

## Recommendations: accelerate the product implementation without losing quality

These are **hypotheses and priorities**, not measured speedups. The same first-handoff quality standard and total
cost of all roles must be compared when testing them.

1. **Preserve the complete task and use the real consumer early.** Identify the actual target/reference group,
state-dependent layout, legal data and affected public entry points. Check one representative mounted consumer and
its important state/parent-width transition early, then repeat affected checks after the last change. This can
find lifecycle and missing-asset failures before a full gallery is polished. It does not replace final visual or
interaction coverage.
2. **Separate product behaviour from the observer.** For interactions, preserve transitions and actual gestures;
stabilise animation only for captures where it does not change state. On a verified checker defect, record a
controlled positive and negative example and mark the affected instrument check blocked. Continue independent
checks; do not change the product merely to satisfy a broken instrument. The observed 21:35 after diagnosis is not
a measured saving, because useful work also occurred during it.
3. **Batch where inputs are stable.** Consider one parameterised browser probe for multiple independent states or
widths, reusable selectors and concise results, with full logs/artifacts available on demand. Avoid spinning up a
new process or polling repeatedly when an existing authorised session can return a completed result. The 134
poll-only calls include useful results; this is a candidate for measurement, not a count of wasted actions. Maintain
sandbox/network rules, permission decisions, ordering, failure visibility and the right to inspect full output.
4. **Use visuals selectively, not less accurately.** During iteration compare a relevant crop and its matching
reference when it answers the current question; before delivery inspect full comparable pairs and surrounding
context for each material state. Preserve width, data, state, theme and scale. Hash evidence before assuming two
path reads are the same image. A crop cannot establish that surrounding content or a dynamic transition is correct.
5. **Parallelise only independent work and account for it.** One role can investigate contracts, references and
consumer routes while the implementer works, if it has stable inputs and produces a compact handoff. A separate
reviewer can assess the frozen first checkpoint without the builder's defence. The reviewer in this run found one
material issue; one observation does not prove that a second early reviewer or multiple mandatory roles always pay
for themselves. Include duplicated reading, reviewer/helper tokens, coordination and owner wait in the comparison.
6. **Reduce long-context churn without suppressing useful progress.** Separate stable briefs from detailed artifacts,
return only needed findings plus paths, and test whether shorter coordinator/worker contexts or grouped waits reduce
repeated cached input. Keep explicit owner decisions, earlier returns and safety limits accessible. Do not call all
115 coordinator waits waste: they supported responsiveness and progress communication; measured benefit of another
scheduling method is unknown.
7. **Respect cross-project critical paths.** Prepare independent fixtures and downstream checks while a package is
building, but bind the final consumer to the actual published version and rerun affected checks on the final
revision. A failed shared or unrelated CI step should be distinguished from a change-induced regression. Do not
launch duplicate or concurrently prohibited checks just to create apparent parallelism.

## Recommendations: accelerate iterations of the skill

1. **One testable hypothesis and a stable input.** Record what changed, the result that would change the decision,
the input revision and the output to preserve. A changed detector does not automatically justify a new full UI
implementation; a change in how an agent decides or delegates needs a model-facing test.
2. **Replay known controls first.** Use an observed failing artifact and a valid neighbour/control against the same
version, data and entry point. For example: a working versus broken sheet close, and a preserved versus collapsed
gap. A preserved older dense submission and released control already show the checker distinguishing an overlap
at two widths. The released control's **sweep** passed while its deliberately narrow complete check was
`incomplete`; do not relabel it a full acceptance.
3. **Measure the whole cheap loop.** One prepared control replay took **6.38 s**, but independent work on the
frozen pair took **4:20**, 98,006 uncached input and a separate helper; coordinator and some setup were not fully
measured. Preparation, labelling, review and maintenance can dominate a fast command. Record first decisive result
and time to a confirmed decision, plus false-pass/false-fail controls and total role cost.
4. **Use a small fresh model task only when the agent's decision changed.** Test whether it selects the correct
next action or produces the required evidence without giving it the answer. This is a narrow behavioural probe; it
does not prove that a full library implementation will be accepted. Retain an independently checked reference and
record what the probe did not cover.
5. **Reserve full runs for integration claims.** Pin the skill, task inputs, environment and first checkpoint; keep
review feedback separate, measure the whole critical path and set a budget before launch. Use an additional
unseen task before claiming the skill generalises. Do not create a new no-skill baseline for every change; reuse an
existing valid control where it answers the question and ask the owner before adding a different comparison.

The draft-28 shortened page, two-tier findings and generated DOM checks already exist; their impact on actual
first-delivery speed and quality was not measured by this draft-27 run. A faster pass that hides a real visual,
accessibility or behaviour defect is not a successful optimisation.

## Open questions and privacy

The visible telemetry cannot prove why the exceptional request missed the cache, the model's internal image-token
calculation, actual billing, exact active human time, or the marginal token cost of one file or tool. The effect of
role splitting, grouping probes, shorter contexts and early independent review needs controlled measurement;
compaction may discard information, batching may mask failures, and a second agent adds coordination and duplicated
reading. This record recommends tests of those hypotheses, not a universal number of agents, calls or time limit.

The published datasets contain aggregated counters, temporal indices, anonymised categories and checkpoint
measurements only. They do not contain product source, private URLs, original transcript text, images, credentials,
account identifiers or local file paths. Raw telemetry and local analysis scripts remain private.
