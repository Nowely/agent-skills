# Rounds

Fable wrote the design in two threads: F1 (designs, claim lists, drafts of the page and test protocols, in
iterations), then F2, restarted from requirements after the owner's corrections. The design files, drafts and
critics' returns stay in the private run directory with the owner's messages they cite; this record carries their
verdicts. Commits are on `claude/wonderful-clarke-dcuqt2` over `aa40ba0` (entrust 0.47.3).

## Design

| Step | Input | Reader | Outcome |
|---|---|---|---|
| study | the repository's records; the owner's earlier sessions (private) | two Opus readers, one each | what went wrong in earlier skill work; the coordinator's own view frozen before any design was read |
| F1, first design | design and claims | the coordinator, against the frozen view | agreement on the observation gate, the order remove/move/reword/add and a rule before the edit; objections into the next iteration |
| F1, owner's corrections | designs and drafts | the owner | the goal restated as creating and developing skills in general; then plugin, test scope, hosts and adapters, the standard name, agent invocation and Fable as writer; then what the skill must regulate, its critics and the analysis and questions it must demand ([03-run-gaps.md](03-run-gaps.md)) |
| F1, last iteration | the page set | three fresh critics: requirements, architecture, quality | requirements: no step derives requirements or asks early; architecture: change approach; quality: change (the order of writing against measuring broken for a new skill) |
| F2 | requirements rebuilt ([01-requirements.md](01-requirements.md)), design, page set | three fresh critics (requirements: change, not redesign; architecture: keep; quality: change), then three Sonnet claim checkers with two planted false claims each | 143 real claims: 133 confirmed, 4 overstated, 0 contradicted, 6 unresolvable; all six plants caught; fixes into the build |

## Build and test

| Step | Commit or input | Reader | Outcome |
|---|---|---|---|
| build | `8f129c2`, `fee5448`, `3009133` | — | the skill folder, its suite, the README row and CHANGELOG entry; the repository suite imports `check.mjs`; E168 recorded |
| verifier | `8f129c2..3009133` | Sonnet, fresh | fixes in `8364481` |
| freeze of the protocol | [02-test-protocol.md](02-test-protocol.md) | — | frozen 2026-11-26T17:52:15Z; addendum 1: the skill under test is the committed tree; the relay is a Haiku subagent given the relay page, since the relay agent type was not offered |
| preflight | P1–P8 | — | launcher present; adapter ready (CLI 2.1.332); a resumed report's cost is cumulative; base and candidate suites green |
| C | create and change walks | Sonnet, external | create halted only at the plan's wait; change ended validly at step 2; halts on the skill into the fix round; E169 found in passing |
| S, architecture | the candidate | Fable, fresh | keep; five questions to the owner, unanswered, their recommendations applied as defaults |
| fix round | `a48a009` | — | eleven points; checker rule 12, no link leaves the installed files |
| S, quality 1 | `a48a009` | Fable, fresh; then a Sonnet verifier | change, 12 objections; all taken in `456a575` |
| S, quality 2 | `456a575` | Fable, fresh, second read | change, 10 objections (5 behavioural); fixed in `1ca6e90`; addendum 2 closes Part S without a third read |
| freeze of the candidate | `1ca6e90` | — | case drawn for Part A: E104 |
| A | 4 sessions on E104 | 4 Sonnet verifiers; Opus blind reader; the operator's grep | Back to design: both page sessions lost rows of `parity.md`'s effort table; settled questions asked 1 per page session, 2 per control; stops by the page 1, control 2; overhead 1.25 |
| R | 6 sessions on the run's opening | Opus blind reader; every mark opened by a Sonnet checker (58 of 62 confirmed) | Undecided (strictly counted: Back to design): page sessions 12 and 12, controls 10 and 10, vendor 10 and 10 of 13 |
| B | — | — | not run |

Deviations found by an audit of the run after the record was first written, each checked at its place:
Addendum 2 closed Part S after the second read's result was seen, under a protocol that says a result never
changes it, and no fresh agent read the last fixes; the protocol makes Part B's harness change part of the
candidate, and the candidate was frozen without it and without a decision recorded before the freeze; the delivery
record the protocol asks for (which skill files each page session read) was taken for Part R and not for Part A
until the digests supplied it; and Part R's reader counted a decision stated in part as shown, a convention the
protocol does not define (counted strictly, Part R is Back to design, see the README).

Part A's operator recorded three deviations: report paths under each session's own state directory, edits by
accepted Bash so stops were counted over answers, and Bash writes inside the clone accepted in every arm. Part R's
operator recorded that its relay missed heredoc-form requests, so the first read-only Bash expired in every
session, and that it ran the launcher from its own shell, having no agent tool.

## Defects found in passing

- E168 (`plugins/terse/ISSUES.md`): terse's skill-page genre note restates limits the checker now owns.
- E169 (`plugins/entrust/ISSUES.md`): the cleanup help gives a missing state directory as a usage exit; a listing
  without one exits 0 (level 3).
