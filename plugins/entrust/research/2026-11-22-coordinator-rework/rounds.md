# Rounds

Labels are each round's own. The review's F1–F12, the verifier's F1–F11, the plan critic's N1–N5 and the
verifier's N1–N5 are different findings that share letters.

| Round | Input | Reader | Findings | Outcome | Regressions |
|---|---|---|---|---|---|
| 0 | `orchestrate` at `def9f23` | Fable, independent review ([01-review.md](01-review.md)) | F1–F12: an every-plan sweep of all adapters; inline work permitted; four default pull-ins of another provider; about 10k tokens of mandatory reading; the default team stated three ways; no critique of the approach before code | basis of [02-spec-v1.md](02-spec-v1.md) | — |
| 1 | [02-spec-v1.md](02-spec-v1.md) | Opus plan critic | C1–C7: the contract forbade commands the page needs; R4 deleted the only check of a kept rule; the split-critic gate broke; the size target was unreachable; the final read lost its cap and publications; facts moved instead of deleted; consumers unnamed | all folded into [04-spec-v2.md](04-spec-v2.md) | — |
| 2 | the draft roles | Opus surveyor ([03-survey.md](03-survey.md), 59 sources) | E1–E7: keep the fresh, execution-grounded verifier; plan critique on a trigger with grounded objections; no absolute ban on the lead reading; a fresh reader for consequential final answers; state the same-family bias | folded into [04-spec-v2.md](04-spec-v2.md). The owner kept the plan critic on by default, the coordinator rule unconditional and native-only defaults | — |
| 3 | [04-spec-v2.md](04-spec-v2.md) | the owner | the plan critic (local) and the architecture critic (top-level, on the chosen approach) are different roles | [05-spec-v3.md](05-spec-v3.md) | — |
| 4 | the v1 → v3 diff | Opus plan critic, continued | C1–C7 resolved; N1–N5: the `Open:` suffix after the last read; the final reader unnamed and the gate's keying; the coordinator rule without a gate check; handoffs without an owner; a shared page naming models | [06-spec-v4.md](06-spec-v4.md), approved ("Го") | — |
| 5 | `def9f23..44b1660` (5 commits) | Opus verifier | F1–F11: three references still had the coordinator apply diffs; `roleOf` misread realistic briefs; a circular "when to read"; a stale address; launcher calls not allowed; a codex tier note; duplicates; stale names; acceptance checks unhanded; a scout counted as a worker. 30 gate mutations, 4 survived | fix round 1 | none: the four red suites fail identically at `def9f23` |
| 5a | the page at `44b1660` | Sonnet live prober, two headless sessions on Claude Code 2.1.330 | P1: a top-tier architecture critic spent on one new function while the plan critic was skipped. P2: the invoked page came back whole after `/compact` in one process (7,998 characters), and not in a session resumed in a new process | P1 into fix round 1; P2 into `claude/references/incidents.md` | — |
| 6 | `44b1660..60cc10f` (8 commits) | Opus verifier, continued | F1–F6, F9–F11 and the tally duty held; F7 recorded as E156; F8 partly fixed. New N1–N5: the plan-critic pairing checked only on an asserted trigger; "module" ambiguous; a remaining coordinator harvest; the compaction record overstated; three untested branches. 13 mutations, 3 survived | fix round 2 | none |
| 7 | `60cc10f..504b800` (8 commits) | Opus verifier, continued | N1–N5 fixed; 10 mutations, none survived; ready for a PR | PR #110 | none |
| 8 | the PR body and the final answer | Opus final reader, two reads | read 1: 5 unbacked or overstated claims (a cost counted twice, the native route of a named model, a trigger shortened, the survey's support overstated, a cross-plugin edit left unnamed). Read 2: one wrong new line (which page the probe ran on) | each fixed with the reader's exact text | — |

Left open after the two fix rounds: live case 5 runs its plan-critic checks only if a plan critic ran, and
`advisor/SKILL.md:12` restates the substitution rule beside its link, a phrase `advisor.test` pins.
