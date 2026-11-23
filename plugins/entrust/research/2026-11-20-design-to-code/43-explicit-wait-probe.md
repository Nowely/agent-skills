# A short explicit-wait probe on the prebuilt card

## Question and result

Can Terra make one complete check return in the initial tool call when told the specific wait to use? In one short
probe, **yes**: Terra passed `yield_time_ms: 30000` to `exec_command`, the check returned after **25.115 seconds**,
and there were **zero `write_stdin` polls**. The check returned `fail` (exit 1), as expected for the uncorrected
fixture. This is evidence about waiting, not a successful design implementation.

## Setup and recorded observation

- Model: `gpt-6.1-terra`, xhigh, one fresh local Codex CLI session with workspace-write and approvals on request.
- Skill and checker: released 0.46.1, pinned at `bf6aafc75a10d823e4178987e7ca5adf6d04b654`. The same corrected,
  prebuilt planted-card fixture and Playwright 1.65.1 were used as in [P](42-collect-and-terra-p.md). Chromium
  started successfully in the temporary arm before the probe; the checker was not run before Terra.
- The first prompt explicitly authorized one full check and instructed Terra to start it with
  `tools.exec_command(..., yield_time_ms: 30000)`; if still running, to use
  `tools.write_stdin(..., yield_time_ms: 30000)`. It instructed no fixture or component edits and no repeated check.
- Terra read the skill, executed the full check with the requested 30-second initial wait, then read the last
  history row and handed over. These were three outer tool calls in total. The check returned in its starting call
  with exit code 1 and no session to poll. It reported a passing width sweep and 35/35 journeys, with frame findings.
- The worker interval was 41.0 seconds. Recorded model usage was **21,346 uncached input**, **87,552 cached input**
  and **392 output** tokens. These are session telemetry, not a cost estimate or a model of a full UI task.
- After the probe, `card.js`, `card.css`, `data.js`, `README.md` and `story.html` matched the supplied prebuilt
  files. The checker wrote its normal output; no product changes were part of the task.

In P's two full checks, Terra asked for 1,000 ms and then made two no-output polls per check. In this probe it obeyed
the explicit 30-second parameter and needed none. The model, skill, fixture and checker were held to the same
versions, but the work request was deliberately narrower and the explicit wait instruction changed. P's worker could
also do other work while its checker ran. This is not a controlled comparison of complete implementations and does
not establish a wall-time or token saving for a real task.

## What follows

An explicit, tool-specific wait is feasible on this host for a check shorter than 30 seconds. A future candidate
instruction may tell the agent to use the longest permitted initial wait and, if the command has not completed,
wait on its session without busy polling. The tool's host limits, the command's duration and whether the agent can
usefully work in parallel still matter. A short probe confirms neither general compliance nor the quality of a
future full-task first handover; those remain separate measurements.

## Collector corrections and replay

The collector now uses the newest cumulative token snapshot and distinct later response records, reports no-output
waits for the session of each completed full check, and stops without an archive when it cannot enumerate processes.
It distinguishes a terminal response with no stdout, which still delivers the exit status, from an empty wait while
the process is still running. Ambiguous or unprinted process states remain unknown instead of being counted as zero.

The targeted test suite passed **11/11**. Replaying the three real logs produced the following no-output waits per
completed full check: S `[2, 1, 2]`, P `[2, 2]`, and this probe `[0]`. The stopped 60-call S log now totals
**79,452 uncached / 4,048,000 cached input / 14,494 output**. A control in which `ps` exits 42 returned exit 3 and
did not create an archive. This control does not establish that arbitrary writers or escaped child processes can be
identified in every host environment.
