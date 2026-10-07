# The command gate, 2026-09-28

The question: under 0.21.0 a Codex agent asked for a VCS client's cache files one path at a time, and the VCS
client, half able to write its cache, deleted its own index (E77,
[the incident](../2026-09-27-approval-channel/21-vcs-measure.md)). The owner asked for the clean way, not a crutch,
for a Codex agent to run what its sandbox refuses, of two: the coordinator as the gate, where every refused command
is one escape request the coordinator reads and decides; or the same gate as a Claude agent's, a tool the client
executes through Codex's experimental `dynamicTools`, so that the owner's permission rules and the auto-mode
classifier judge the command itself.

The answer: the first way, with the accept restating the command. 0.21.0's widening layer went whole: the two Codex
features "under development", the instruction to ask for a failing tool's state files, the path handling and the
page rule approving cache writes. An accept now carries the command on stdin, compared byte for byte with the
request, so the classifier judges the command's text and not a request id. The second way was measured possible on
0.155.1 and is held: once the wrapper was withdrawn as its executor, the executor is the coordinator, which costs the
same turn per refused command and adds an experimental protocol field and hundreds of lines. It shipped in 0.22.0.

## Results

| Measurement | Result | Evidence |
|---|---|---|
| a client-run tool on 0.155.1 | the tool call arrives with the exact command; the model used it instead of its own escape in three of three turns; the turn continued on the client's output | 3 — [01-design-v1.md](01-design-v1.md), two dry handshakes and four Luna turns |
| an accept on a fixed heredoc delimiter | a model-written line equal to the delimiter ends the heredoc and runs the rest in the coordinator's shell before the launcher compares; both verifiers made it happen independently | 3 — [04-verify-c1.md](04-verify-c1.md), [04-verify-c2.md](04-verify-c2.md) |
| the plain escape, permission features off | the model asked for the escape three times and never for a path; three accepts, three VCS commands exit 0, run exit 0; the VCS client rebuilt its emptied index by appending and deleted nothing; 40–57 s per round trip | 3 — [06-vcs-escape.md](06-vcs-escape.md) |
| the implemented design, live | two plain command approvals, two restated accepts the classifier let through, both VCS commands exit 0, run exit 0, none of the removed fields in the report; 23 and 25 s per round trip | 3 — [07-live-gate.md](07-live-gate.md) |
| the review of the implementation | first pass: one medium finding, the pages copied the command from the relay the design excluded, and three low; second pass: one medium, an unquoted request ID that ran a command in a local check, and one low; all closed before the release | [08-review-r1.md](08-review-r1.md), [rounds.md](rounds.md) rows 12–15 |

## How the recommendation turned

The first design recommended the client-run tool with the wrapper as its executor. The two critics found 22 faults
in it: the gate judged a line's text, not the act; the composed line broke on `a; b`, a trailing comment, a heredoc
and `&`; the wrapper stopped being safe to rerun. With the wrapper withdrawn, the second design weighed both ways at
the same executor and turned to the first, restating the command in the accept. Its verifications found the fixed
delimiter; the design the round settled on, [05-decision.md](05-decision.md), takes the delimiter from the token
`--pending` prints for the request; after the review found the pages copying it from the wrapper's relay, the
coordinator builds the delimiter itself from `ACCEPT_`, the printed token and hex of its own.

## Open

- The client-run tool is worth reopening only if a measurement shows the owner's `Bash(...)` matcher sees through
  the grouped line it needs, and the owner wants rule-governed silence for Codex commands in default mode.
- In default permission mode no rule allows the launcher, so `--run` and every accept prompt; the plugin adds no
  allow rules on the owner's behalf.
- A long, silent accepted command may trip the idle guard (level 2).
- Whether Stop reaches an accepted command running outside the sandbox is E67.

## Files

- [rounds.md](rounds.md): each step, who ran it, what it cost and the faults it found.
- [00-brief.md](00-brief.md): the owner's words that bind the design, 0.21.0's shape, the incident and the two ways.
- [01-design-v1.md](01-design-v1.md), [03-design-v2.md](03-design-v2.md): the two designs.
- [02-critique-c1.md](02-critique-c1.md), [02-critique-c2.md](02-critique-c2.md): the critiques of the first, on
  safety and parity, and on simplicity and lifecycle.
- [04-verify-c1.md](04-verify-c1.md), [04-verify-c2.md](04-verify-c2.md): the same critics on the second.
- [05-decision.md](05-decision.md): the design the round settled on, what stays and what had to be measured.
- [06-vcs-escape.md](06-vcs-escape.md): the plain escape measured with the permission features off.
- [07-live-gate.md](07-live-gate.md): the implemented design, live.
- [08-review-r1.md](08-review-r1.md): the review of the implementation.
