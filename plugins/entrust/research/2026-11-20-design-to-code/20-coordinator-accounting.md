# Coordination cost of the five-iteration turn

The original [five-iteration summary](17-iteration-summary.md) correctly excluded the coordinator because its measurement was not yet available. This subsequent audit adds what the local logs actually recorded; it does not change any outcome or imply that the user’s first-submission goal was reached.

The root log records one task from 2026-11-20 21:40:01.974 UTC to 23:51:08.331 UTC. Its event timestamps span 2 h 11 min 6.357 s. The runtime independently recorded 2 h 11 min 6.373 s for the turn. These elapsed times include concurrent work.

| Local journal group | Journals | Uncached input | Cached input | Output | Reasoning within output |
|---|---:|---:|---:|---:|---:|
| Coordinator | 1 | 1,061,729 | 267,968,256 | 133,400 | 48,799 |
| Five implementation workers | 5 | 418,359 | 43,572,096 | 114,541 | 26,345 |
| Permission reviews for those workers | 5 | 388,714 | 4,237,056 | 6,502 | 1,881 |
| Other linked permission reviews | 7 | 505,969 | 7,851,904 | 7,752 | 2,438 |
| Outcome analysis continuations | 1 | 144,728 | 13,407,744 | 26,580 | 2,883 |
| Checker implementation and follow-ups | 1 | 233,882 | 24,477,824 | 57,893 | 12,545 |
| Checker verification | 1 | 97,539 | 2,389,376 | 9,789 | 1,851 |
| Final verification and critic | 2 | 138,155 | 1,842,304 | 8,694 | 1,364 |
| **All linked journals with in-window usage** | **23** | **2,989,075** | **365,746,560** | **365,151** | **98,106** |

## Method

1. Match the root turn using its start and completion events and their common turn ID. Subtract the last cumulative token record strictly before the start (line 19517) from the last one inside the turn (line 23793). The task markers occur at lines 19522 and 23794. The following sample, line 23811, falls after the deadline.
2. Read Codex session headers for the three local calendar dates covering the root session and the turn. Follow explicit parent thread links recursively. Include only dated token samples within the same UTC interval. For earlier sessions continued inside the interval, subtract their last sample strictly before the start. For new sessions begin at zero.
3. For each journal verify that the cumulative counter difference equals the sum of last-usage vectors from advancing events. The root journal has 585 samples, including two repeated cumulative snapshots. Its 583 advancing samples match their last-usage vectors on every field. All 1,227 root item-completion events identify the same root thread and turn. Across all 23 journals the same arithmetic check passed on all 1,351 advances. Every sampled record flags reasoning as included.
4. Uncached input equals total input minus cached input. Output includes reasoning. The five independent worker logs reproduce each implementation row in experiment record 17 and total 418,359 uncached input, 43,572,096 cached input and 114,541 output. The [anonymized per-journal counts](20-coordinator-counts.json) preserve per-journal calculations and root boundary timestamps without raw messages, prior-session totals, account identities or thread IDs. The calculation can be repeated with access to the local session journals; the journals and raw messages are not published.

## Scope and independence

The worker logs carry explicit parent links and have their own monotonic counters. None of the five shares an identical advancing last-usage vector with the root. Across the lifetime of worker 5, root samples bracketing its entire run rose by 12,879 output tokens while this worker recorded 49,899. Each of the other four workers also recorded more output than the root across its respective bracketing samples. These observations support independent recorded streams and rule out treating the root count as an inclusive recursive total. The sum for the root and five worker journals alone is 1,480,088 uncached input and 247,941 output.

The role total is a sum of local linked journals with observed token counters in that interval. It includes early checker work inside the window and the measured continuation of earlier analysis. Work outside the UTC window, unattributed services, external browser or CI resources, billable amounts, and per-role cost in money are outside this measurement. Repeated prompt content can be included in several actual model requests.

The coordinator made 191 distinct `wait_agent` calls during this turn. Each call has a matching tool result. The 585 token-count events in the same turn contain usage and rate-limit information without a tool name or call ID. The available counters therefore provide a turn-level amount and no observed token charge per wait or causal estimate of savings from fewer waits.


## Practical consequences to test

The coordinator made 191 wait calls, but the log does not attribute token usage or elapsed time to each wait; it does not establish that shorter polling caused a particular token cost. A candidate improvement is to use fewer, bounded waits while keeping the owner informed, and compare total turn-level usage and elapsed time on a future authorized task. Similarly, read bounded artifacts instead of repeatedly expanding long histories, and use targeted checks during editing before one appropriate final suite. These are proposals, not measured savings.

The user allowed at most five implementation iterations; that limit was reached. This is an accounting audit of those completed runs, not a sixth iteration. The final skill draft still has no independent first-submission trial.
