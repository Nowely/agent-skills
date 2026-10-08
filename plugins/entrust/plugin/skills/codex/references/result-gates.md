# How the result gates can be fooled, and how to check the end state

<!-- Extracted from SKILL.md: depth a caller does not need while deciding what to run.
     Read it when the pointer in SKILL.md sends you here. -->

## Bypasses of `--expect-command`

A plain probe answering "no" — `grep`/`rg`/`test`/`diff`/`cmp` exiting **1 exactly** — is not a failed
command; it is counted separately as `commandsProbeNegative`. The exemption is for a PLAIN command
only: a pipe, a compound, a substitution or a multi-line script keeps failure
semantics, because its exit 1 may belong to another command in the chain. A sandbox-declined command is
never a negative probe, whatever its text says.

Classification reads what the server parsed, not merely its reported wrapper. Live commands arrive as
`/bin/zsh -c 'grep -q zzz /dev/null'` (or `-lc`) with bare text in `commandActions`; the report's
`commands[].actions` preserves those parsed actions. The probe is judged from that action or the
unwrapped script. Several parsed actions have no single bare command, so the whole script keeps failure
semantics. This distinction matters: matching only the wrapper made the exemption dead in production
while fixture tests stayed green.

One accidental bypass is worth knowing, because it needs no intent: `pnpm -w exec vitest run | tail -5`
exits with `tail`'s status, so a failing suite reports success, and Codex pipes to `head`/`tail` routinely
just to cap output. The contrived bypass is real too — a command that is literally `true # vitest` scores
`commandsMatchingExpectation: 1`, measured — though it has not been observed in practice: asked directly to
claim work it had not done, Codex refused and said so.
The report counts sliced evidence as `commandsPipedToPager`, with `pipedToPagerHint` beside it.

### A failed command is not a verdict

A completed turn that produced an answer exits 0 however many of its commands failed: whether the
failures are the finding — a crashing environment probe, an intentionally broken build, a bisection
agent's red step — or a defect, the exit code cannot tell, so it does not try. What ran and how it ended
is in the report: `commandsFailed`, `commandsDeclined`, `commandsBlocked`, `commandsProbeNegative`,
`fileChangesFailed`, `commandsPipedToPager`. `commandsDeclined` counts commands an approval refusal
stopped before they ran, `commandsFailed` commands that ran and failed, and `escalations` the refused
approval requests themselves, so the first and the third can differ.
Read them before acting on the answer, and where an end state can be measured, check it yourself
([below](#checking-the-end-state)): a check asserts something rather than merely declining to assert its
opposite.

`--expect-command` still decides exit 5. Exit codes 9, 11 and 12 are retired, not free: they named a
failed-command verdict and the two outcomes of a verifier the driver no longer runs, and a caller that
recorded those meanings should not meet them again under another one.

### Unknown command verdicts

A command that reached the client without an exit code and was neither failed nor declined has an
unknown outcome. It is `commandsBlocked` in the report and no exit code of its own: only a declared gate
turns it into a verdict.

## Checking the end state

The driver runs no check of its own after the turn: a check that ships in a write agent's tree runs code
the agent wrote, with your rights and outside the host's own checks, and the one call could not pass one
anyway. Check the work yourself after reading the report, the way you run any command on it: keep the
check cheap and quiet (`test -f`, `grep -q`, a targeted test project), prefer one that executes nothing
the agent just wrote (`npm test` runs the agent's own `package.json` script), and judge it by its exit
status, not by its output alone.
