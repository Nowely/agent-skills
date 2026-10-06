# The plan

## Composition

Allocate by the work, not to fill a team size. Give each deliverable one owner, keep dependent
execution together, settle shared interfaces before parallel writes, and verify with someone who did
not write the artifact. Honour requested models, routes and exclusions. A tier does not select a model
or authorize a fallback. If the chosen model is unavailable, show the available alternatives and wait
for approval unless the user's standing policy explicitly covers one.

Use the active host's capabilities. An adapter owns its provider's model lookup, launch parameters and
runtime metadata; native delegation needs no external adapter merely because a model has the same vendor.

## The card

Write four rows in the user's language. Recommend the balanced profile by default; name speed or
quality only when it materially changes the allocation.

| Row | Contents |
| --- | --- |
| work | deliverables, ownership, interfaces and completion criteria |
| team | coordinator role and each agent's role, one model display name and policy coverage in one place; do not restate the coordinator's model or call it unknown; show effort only when it departs from the profile default or needs a decision; do not repeat an equivalent model slug |
| writes | allowed directories, temporary artifacts, any isolated worktrees and network constraints |
| checks | who verifies what and which evidence decides; include host runtime facts, passive adapter-status source/freshness, recent-list scope, quota windows, allocation and exact launch validation |

Show the concrete team in every plan. Mark choices covered by the standing policy in
[Capacity and models](../SKILL.md#capacity-and-models). Approval covers the listed work and in-policy
allocations; ask separately before any model, route or fallback outside that policy. Show worker
concurrency only when it affects parallel work, and count nested workers by the host's actual rules.
It does not set an advisor question budget. Keep alternative profiles to choices that materially change
quality or speed, and state which approval selects each scope.

## Model fit and estimates

For a role/model pairing without comparable evidence, define the acceptance rule and pilot representative
work. Compare the same inputs with a stronger reference; check omissions, incorrect results and usefulness.
Expand when the rule passes. Estimate batches from comparable runs, including a rerun margin. When
observable usage exceeds three times the pilot's median per agent, pause that batch and review its
remaining scope with the user.

A model name does not establish price or quota consumption. Keep provider prices, measured usage and
account/route/model limit windows as separate sourced facts; unknown or stale values are not unlimited.

## Environment and worktrees

Check required commands, dependencies, writable roots and services in the agent's actual working
directory. A fresh worktree normally starts from a committed revision and lacks uncommitted files,
ignored dependencies and live daemons. Confirm the runtime's base and transfer mechanism; do not
use such a tree to verify live edits it cannot see. Testing uncommitted work requires an explicit
snapshot or access to that work, without implying authority to commit it.

## A bulk row

Define independent units and a fixed return shape. A verdict describes the subject, not a broken
input path. Keep a shared prerequisite's execution with one owner and supply its evidence to every
dependent brief. Announce the unit count and how it was derived. Use a bulk launcher only when its
scale improves throughput or cost under the model-fit rule, and within actual host limits.
