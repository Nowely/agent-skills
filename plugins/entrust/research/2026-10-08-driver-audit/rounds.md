# Rounds

| Round | Document | Critic | Findings | Regressions from the previous round |
| --- | --- | --- | --- | --- |
| 1 | [07-proposal.md](07-proposal.md) | Opus, [08-critique-c1.md](08-critique-c1.md) | 4 blocking, 7 major, 8 minor | none (first round) |

## Before round 1

Four read-only auditors on Opus, in parallel, each on the suites' fakes only: A the Codex driver
([02](02-audit-codex.md)), B the OpenCode adapter ([03](03-audit-opencode.md)), C the call path and the proxy
([04](04-audit-call-path.md)), D rights ([05](05-audit-rights.md)). [06](06-findings.md) deduplicates them; seven
of its defects were re-run or re-read in this session before 07 was written (X1, X2, X3, X4, X5, X7, X8).

## Round 1

Every finding was taken into [09-proposal-v2.md](09-proposal-v2.md); its last table maps each to its change. The
critic re-ran X1, X2, X5 and X8 and found them as stated, and found one new defect, N1: an OpenCode write session
resumed as read reports read while the server keeps its write rules. Its claim that `GIT_SAFE` alone breaks the
shared diff was re-run here: `git -c diff.external= diff HEAD` exits 128 on git 2.43, and 0 with
`--no-ext-diff --no-textconv`.
