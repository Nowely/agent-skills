# The plan

## Composition

Allocate by the work, not to fill a team size. One implementer owns each deliverable. Keep dependent
execution together, settle shared interfaces before parallel writes and verify with an agent that
did not write the artifact. Honour requested models, providers and exclusions; report a requested
capability that is unavailable rather than substituting silently. Independent context and model
diversity are separate properties: check what instructions and history a native agent inherits.

Use the capabilities and limits exposed by the current host. An external integration's model
selection, rights and lifecycle belong to its adapter. Native delegation needs no external
integration merely because the native model has the same vendor or name.

## The card

Write five rows in the user's language:

| Row | Contents |
| --- | --- |
| work | deliverables, ownership, interfaces and completion criteria |
| who | each agent's role and model, or inherited model when it cannot be selected; coordinator and verifier included |
| writes | allowed directories, temporary artifacts, any isolated worktrees and network constraints |
| cost | estimates by agent and your inline work; unknown for unmeasured roles |
| checks | who verifies what and which evidence decides; completeness critic and selection criterion where relevant |

State the available concurrency and any user cap. Count nested workers according to the host's
rules, reserving capacity for a delegated coordinator. Give viable alternatives when the choice
matters, with their costs and a recommendation; make clear which approval selects which scope.

## Estimates and the stop line

Base estimates on comparable runs, with their source and uncertainty. For a bulk batch, pilot a
few representative units and compare quality and cost against a stronger reader's marking before
launching the rest. Estimate per-unit usage times the unit count, with a rerun margin. When usage
is observable, a run exceeding three times its pilot's median per agent stops further launches
until the estimate and remaining scope have been reconsidered with the user. Unknown usage stays unknown.

## Environment and worktrees

Check required commands, dependencies, writable roots and services in the agent's actual working
directory. A fresh worktree normally starts from a committed revision and lacks uncommitted files,
ignored dependencies and live daemons. Confirm the runtime's base and transfer mechanism; do not
use such a tree to verify live edits it cannot see. Testing uncommitted work requires an explicit
snapshot or access to that work, without implying authority to commit it.

## A bulk row

Define independent units and a fixed return shape. A verdict describes the subject, not a broken
input path. Keep a shared prerequisite's execution with one owner and supply its evidence to
every dependent brief. Announce the unit count and how it was derived. A bulk launcher is an
optional integration for a batch whose scale warrants it, within its own and the host's limits.
