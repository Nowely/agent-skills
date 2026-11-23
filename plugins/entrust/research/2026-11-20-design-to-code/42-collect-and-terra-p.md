# Collect on the prior log and Terra's prebuilt pass on 0.46.1

## Scope and result

This records steps S and P of [the sitting](41-the-sitting.md), plus an independent Astra reading of polling costs.
The real-task arms A and B were not requested for this sitting and were not started. [Machine-readable metrics](42-collect-terra-metrics.json)
and the [P ledger](42-terra-p-deviations.json) accompany this record. The unredacted session logs and archives remain
local: they contain host paths and task artifacts.

- **S:** `collect` reproduced 60 outer calls and 14 polls with empty stdin on the prior log, but its aggregate tokens
  omit the 60th model response even though the record includes that response's per-call usage. Its poll ratio is not
  a measure of outputless polls per completed full check.
- **P:** a fresh Terra worker using released 0.46.1 handed over at `pending` after 27 calls, three rounds and three
  proposed ledger entries. The planted grader returned `QUESTION SURFACED, INPUTS INTACT`. This is one synthetic
  prebuilt case, not acceptance of a real task or an independent visual/code review.
- **Poll rule:** P had four polls with no output, two for each of the two completed full checks. The registered
  threshold was at most one per complete check, so this run did **not** meet it. Its setup exception below limits
  comparison with a fully ready run; no rule was reverted in this reporting work.

## Conditions and preservation

The protocol came from PR #113 at `b5d671bf5bac616332a4e33f7d063919b2bd3e3f`. P's skill was pinned to the
released merge commit `bf6aafc75a10d823e4178987e7ca5adf6d04b654` (entrust 0.46.1), on a fresh fixed prebuilt arm.
The model was `gpt-6.1-terra` xhigh, in a fresh local Codex CLI session with workspace-write, approvals on request
and `network_access: true`. The existing broad `node` allow rule covered the checker; no global rules were added and
no user-facing approval prompt was answered. Chromium started in the arm before the worker was launched; the first
check was the worker's. The first prompt contained the registered approval line word for word.

For S the earlier five-round archive was extracted to a copy; the original archive and live arm were not changed.
Its original log was supplied explicitly. As a result the log's working directory differs from the copied project's
path, a warning expected for this parser-only replay. The S baseline was created from the copied **post-run** archive:
`INPUTS INTACT` compares against that later baseline and cannot independently certify the old run's original inputs.

Both S and P `setup` completed its baseline and Chromium smoke but exited 1 with `Not ready`: the supplied prebuilt
fixture has no `.design/returns.md`, while setup requires the owner's past returns. The owner explicitly chose to run
P without inventing the file and to record the warning. This is a protocol exception, not a successful readiness
check. P's initial baseline of 23 files was recorded before Terra started.

## S: the historical collector check

The collector reported the correct 60 calls, 14 empty-stdin `write_stdin` polls, 5 archived rounds and 9 proposed
ledger entries. Fourteen means calls with no input characters; **only five returned no new command output**. The
collector left `newOutput` unknown for all 14 because those nested tool results use a JSON output wrapper.

The last available `token_count` cumulative event ends after call 59. The log also has a 60th
`token_usage_record` with cumulative turn usage. They differ:

| Source | Uncached input | Cached input | Output |
|---|---:|---:|---:|
| Collector / last `token_count` | 78,832 | 3,954,176 | 14,101 |
| Last `token_usage_record` turn total | 79,452 | 4,048,000 | 14,494 |
| 60th response included by the latter | 620 | 93,824 | 393 |

The collector reported call 60's 94,444 input tokens and `lastCallUsageMissing: false` while its total still used
the older cumulative event. This corrects the limitation stated in [record 39](39-terra-045-rerun.md): that record
is retained as the historical observation, not overwritten. The discrepancy is E160.

The collector prints `14/4 = 3.5` polls per complete check by dividing all empty-stdin polls by full-check launches,
including an interrupted launch. The 14 also include quick checks and a consumer probe. Manual session matching finds
five no-output waits among three finished full checks (2, 1 and 2); three further polls retrieved their results.
Consequently `3.5` is not the pre-registered metric. This distinction is E161.

### Independent polling analysis

The five S polls without output occupied five model calls and about 25.0 seconds inside the tools. The model responses
that issued them recorded 10,932 uncached input, 357,248 cached input and 787 output tokens in total. Those are
**gross associated responses**, not the savings obtainable by deleting them: one response included a large new
context that a later useful response would still need, and the checker ran while the waits occurred. No claim of
saved wall time, cost or subscription usage follows from this accounting alone.

The three finished full checks took about 25 seconds each. A first wait of up to 30 seconds is a practical candidate
for this case; the P run below measures whether the released instruction caused the worker to do that. It is not a
measured guarantee for other commands.

## P: the 0.46.1 prebuilt pass

Terra finished in **3:40.0**, at 27 outer calls, before the 60-call cap. It ran two complete checks and one quick
check. The final complete check's generated handoff was `pending`, with three decisions: the unavailable delivery
data, footer typography and popover width. The worker's final message handed over those decisions. The grader said
`QUESTION SURFACED, INPUTS INTACT`; the collector's baseline diff also reported no changed inputs. The worker changed
the card stylesheet and two review/ledger files. The worker reported a sweep and 35 journeys; the grader and these
automatic checks do not replace the owner's visual or code acceptance.

The archive had 52 project files. Before grading the complete live project, all 52 archived project files were
compared byte for byte against it; they matched. The grader then ran on the complete live project because the
collector's archive stores changed files and originals, not every unchanged project file. The check handoff preceded
the worker's last call; that last call only viewed five generated page images, after which the worker handed over.

| Measurement | P |
|---|---:|
| Outer calls / checker history rounds | 27 / 3 |
| Full / quick checks | 2 / 1 |
| Empty-stdin polls / polls with no output | 8 / 4 |
| No-output polls for the two completed full checks | 2 and 2 |
| Checker durations for those two full checks | 25.2 s and 24.8 s |
| Ledger entries / proposals | 3 / 3 |
| Token totals, uncached / cached / output | 54,906 / 1,576,192 / 7,582 |
| Input context at calls 1 / 15 / 27 | 24,995 / 64,928 / 70,674 |
| Spawned reviewer | none observed |

All eight polls requested 1,000 ms. Four returned no output after about five seconds each; the other four retrieved
results. The two completed full checks each had two no-output polls before their result poll, exceeding the sitting's
limit of one. The four responses issuing the no-output polls recorded 8,246 uncached input, 224,256 cached input and
415 output tokens. As with S, those totals associate whole model responses with the poll and do not establish
incremental causal cost or a wall-time saving.

P's lower call/round counts than S are descriptive only: the skill version changed **and** the synthetic fixture's
misplaced footer boxes were fixed after S. S ended at the cap, while P handed over; the two are not a controlled
single-variable comparison. P also deliberately ran without the missing returns file after the setup warning.

## Check process uncertainty

As an isolated control on a copy, the coordinator supplied a temporary `ps` executable that exits 42 and ran
`collect` after the old files were quiet. The command exited 0, printed “The check ended” and froze an archive even
though its record contained `processList: "ps failed: "`. No real writer was running in this control. This shows
that process-list failure is recorded but does not prevent freezing; it does not prove that this particular P archive
was captured beside a writer. P's `ps` check succeeded and no in-flight checker was reported. The uncertainty is E162.

## Consequences for the next decision

- Before using poll numbers as a release gate, distinguish empty stdin from no output and associate polls with the
  actual full-check session. The P observations exceed the registered threshold without relying on the collector's
  misleading `8/2` ratio.
- Treat unknown process enumeration as unknown rather than evidence that a check ended; the isolated control does
  not itself establish signal propagation through Codex or the state of arbitrary non-checker writers.
- Correct total token accounting when a later `token_usage_record` exists, and reconcile the prebuilt fixture with
  setup's required owner-returns seed without inventing historical user feedback.
- The owner can decide whether the recorded missing-seed exception permits applying the pre-registered poll-wording
  rule. Neither the rule nor product code was changed in this reporting work.
