# Timing and resource accounting

These are observations from five small local studies, with one worker per condition. They are not estimates of typical performance. A **worker turn** runs from the recorded start to completion and includes that agent's own tool waits; gaps between turns are excluded. The first card pilot instead uses first-to-last recorded action or message. **Role-time** adds intervals across agents, including overlapping work, and is not elapsed time or measured human labor. Calendar spans include idle periods and handoffs. Setup, coordinator and owner effort are incomplete unless expressly stated. All durations are minutes:seconds unless units are shown; rounded rows need not add exactly. No dollar cost was measured.

## Responsive card pilot: first submission only

| Measure | Baseline | Skill |
|---|---:|---:|
| First recorded action to last action/message | 530.829 s (8:50.829) | 611.641 s (10:11.641) |
| Nominal initial work limit | 30 min | 30 min |
| Returns / time to accepted result | Not measured | Not measured |

The protocol stopped at first submissions; both had observed defects. Therefore a ratio to acceptance cannot be computed. The skill/baseline recorded interval ratio was 1.152×, but two stand disruptions and the different activity-boundary method limit interpretation. The first-to-last span across both workers was 18:43.473, including an 18.997-second overlap; this is not full study or acceptance time. The baseline stand lost connection at the end after screenshots had been obtained; treatment began changes before its restarted stand had a working address. Common infrastructure outages were excluded by protocol from the nominal budget, but a precise adjusted per-worker net duration is not available.

## Adaptive filters: through acceptance

| Recorded turn, seconds | Baseline | Skill |
|---|---:|---:|
| Worker initial submission | 638.421 | 633.133 |
| Worker repair | 207.729 | 210.445 |
| Worker total | 846.150 | 843.578 |
| Judge, first submission | 287.279 | 190.370 |
| Judge, repair | 121.016 | 106.771 |
| Judge total | 408.295 | 297.141 |
| Worker + judge | 1,254.445 | 1,140.719 |
| Submissions / returns | 2 / 1 | 2 / 1 |

The shared judge preparation turn was 438.587 s and is excluded from each arm above. Caps were 24 minutes for initial delivery and up to two eight-minute repairs per worker. For this pair, baseline/skill was 1.003× in worker time and 1.100× in worker-plus-judge time. The absolute gaps are 2.572 s and 113.726 s; 111.154 s of the latter is judge time. The judge saw the baseline first and already knew the reproduction when evaluating the second result. One observation cannot attribute this difference to the skill.

The first observed judge-preparation start to the final judge turn's completion was 34:53.525; first worker start to that completion was 30:08.134. Both include overlapping work, pauses and serialized evaluation; the first does not establish the beginning of all stand preparation. An acceptance timestamp is the end of each relevant judge turn, not a measurement of an independent owner review. Shared stand preparation, coordinator work and the post-hoc diagnostic are outside per-arm totals.

The post-hoc width signal itself averaged 3.235–3.272 s for a warmed resize sequence and 1.065–1.067 s for direct-open controls. It included fixed waits and geometry polling, excluded page load and was designed after the defect was known. It is not a measured time to discover a new defect.

## Early observer on two selectors

| Role-time in seconds | Baseline | Early observer |
|---|---:|---:|
| Worker first slice | 245.874 | 198.059 |
| Worker continuation to complete first submission | 479.271 | 271.179 |
| Worker repair | 151.562 | 78.477 |
| Worker total | 876.707 | 547.715 |
| Observer original / slice visit | — | 193.540 / 92.200 |
| Observer total | — | 285.740 |
| Half of shared judge intervals | 134.8345 | 134.8345 |
| Total to common acceptance | 1,011.5415 | 968.2895 |
| Remaining from 32-minute cap | 908.4585 | 951.7105 |

Each condition's 32-minute cap included worker, own checks, observer if used, returns and allocated final judge time. The common judge's active intervals from first suite command to ready scorecard were 145.208 and 124.461 s, total 269.669 s, counted once overall and split equally. Their executable suites occupied 38.594 and 37.332 s within those intervals; adding them again would double-count. Sum across both arms is 1,979.831 s, while baseline/observer is 1.045× on the stated accounting; one pair and the unrelated localization repair prevent a causal speed claim.

A wider alternative starts at presentation of each pair and ends at the judge's result message: 164.999 and 144.910 s, total 309.909 s, or 154.9545 s allocated per arm. Under that alternative the totals are 1,031.6615 and 988.4095 s. This is a different boundary, not an extra charge. The judge's entire lifecycle turn was 2,217.345 s and includes setup and extended background waiting; it must not be treated as active assessment time.

From the scout's start to the final scorecard took 39:46.437; to the result message took 39:58.737. The first deliveries were deliberately sequential, while repair turns overlapped by about 1:18. These spans do not predict a parallel critical path. Another 9:19 of shared task selection, stand preparation and accounting was recorded beyond the compared budgets; complete setup, judge-test authoring, coordination and reporting effort were not measured.

## Full card task: v4 and updated v5

| Recorded phase, seconds | v4 | Updated v5 |
|---|---:|---:|
| Planning and questions | 109.264 | 74.796 |
| Implementation until first submission | 1,164.200 | 1,840.060 |
| Total worker to first submission | 1,273.464 | 1,914.856 |
| First repair | 1,729.652 | 1,309.174 |
| Second repair | 267.847 | 621.047 |
| Third repair | — | 830.423 |
| Total worker | 3,270.963 | 4,675.500 |
| Judge, first / second submission | 733.045 / 389.596 | 357.421 / 291.364 |
| Judge, third / fourth submission | 340.337 / — | 281.862 / 189.744 |
| Judge on submissions | 1,462.978 | 1,120.391 |
| Worker plus submission judging | 4,733.941 | 5,795.891 |
| Submissions / returns | 3 / 2 | 4 / 3 |
| Calendar from first preparation to accepted judge result | 1:29:54.937 | 1:41:43.789 |

The recorded v4 first-submission interval was 21:13.464, shown as 21:13 when rounded to seconds. An earlier summary displayed 21:14; the table here uses the lifecycle interval. For this one pair, v5/v4 was 1.504× in worker time to first submission, 1.429× in all worker time, and 1.224× in worker-plus-submission-judge time. V5 required one additional submission. These ratios do not isolate skill effects: the updated skill combined several changes; v5 used prepared v4 testing and calibration; and the coordinator first gave v4 a wrong product answer which was corrected before submission, whereas v5 received the corrected decision. Neither calendar interval measures complete labor or an equivalent setup cost.

Recorded preparation and support, separate from the table:

| Support turn | v4, seconds | v5, seconds |
|---|---:|---:|
| Judge initial calibration/setup | 1,111.745 | 115.726 |
| Historical input research, two turns | 193.962 + 168.946 | Reused inputs |
| Release-check inventory | 61.001 | Reused inventory |
| Stand engineering | 188.691 | 122.912 |
| Total separately recorded support above | 1,724.345 | 238.638 |

These support intervals can overlap each other and worker turns; they are role-time, not additive elapsed time. Some calibration was deliberately reused, so comparing the support sums as independent setup requirements is invalid. Neither total captures full coordinator effort. The v4 judge's first turn is setup, followed by the three submission turns; v5's first judge turn is setup, followed by four submission turns. This distinction explains why summing all judge turns would overstate submission judging.

## Worker token and call accounting

Input is partitioned into uncached and cached tokens; output includes the separately listed reasoning subset, so do not add reasoning again. Calls are recorded top-level tool calls; a call may contain multiple operations. Counters are provider-reported usage for the measured worker turns, not unique source-text sizes or prices. Card-pilot activity windows and counters use the saved cumulative worker receipts; later workers use lifecycle turns and recorded turn usage. Observer tokens are shown separately, not folded into its worker's count.

| Study / condition | Uncached input | Cached input | Output | Reasoning subset | Calls |
|---|---:|---:|---:|---:|---:|
| Card pilot baseline | 72,108 | 4,864,768 | 17,252 | 3,399 | 63 |
| Card pilot skill | 64,186 | 4,734,848 | 21,049 | 3,847 | 63 |
| Filters baseline | 120,162 | 8,919,936 | 28,241 | 6,474 | 85 |
| Filters skill | 96,199 | 7,874,304 | 28,245 | 8,387 | 76 |
| Selector baseline worker | 170,332 | 6,457,984 | 25,875 | 5,057 | 80 |
| Selector observer-arm worker | 69,340 | 3,572,608 | 15,223 | 2,777 | 53 |
| Selector observer, both visits | 45,495 | 1,254,016 | 5,403 | 693 | 26 |
| Full v4 worker | 222,101 | 59,303,552 | 105,934 | 25,386 | 310 |
| Full updated-v5 worker | 276,853 | 101,525,888 | 128,727 | 43,310 | 428 |

The filters judge's two submission turns per arm used 34 calls, 33,621 uncached input, 3,402,496 cached input and 7,995 output tokens for baseline; the corresponding skill-arm numbers were 24, 20,338, 3,015,168 and 6,730. Its common setup is excluded. Full-trial judge totals including their setup were 189 calls, 312,652 uncached input, 30,603,776 cached input, 76,349 output (9,223 reasoning) for v4; 87 calls, 150,133 uncached input, 10,166,784 cached input, 41,005 output (3,527 reasoning) for v5. These are not comparable measures of independent evaluation effort because setup was reused.

## Historical calendar context and missing measurements

In the historical card case, the first recorded request to the later message reporting that a release was started spans 9 days 5:53:26, rounded to seconds. That interval includes changed requirements, other work, external review and waiting; a release-start message is not proof of release completion or final acceptance. Consequently the full historical completion time is not established, and the interval is not a worker-speed comparison. In the historical filter case, an owner observation to an ensuing browser check spanned about 44 calendar minutes, not 44 minutes of active labor. These historical intervals must not be added to trial role-times or treated as measured savings.

Across studies, owner review time, complete coordinator and stand effort, clean model-compute time, actual billed amounts, release/CI waiting in a live environment and downstream integration are not comprehensively measured. Some logged turns include tool waits or overlap; partial or excluded time cannot be reconstructed as zero. The results do not establish a repeatable multiplier or financial return.
