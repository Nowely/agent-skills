# The plan

## The composition

Your own model is in your system prompt ("You are powered by the model named ..."); nothing else carries it. You are outside the pool, and the pool is the same whatever you are: the top pair, each taking the top-row roles in turn, architect for one task and judge for the next, and the strong and cheap agents the alive cap admits. A model standing in for Astra under the composition rules' sixth rule is the top row's one Codex agent, counted as Astra is.

This mode replaces one row of the sibling's [composition table](../../codex/SKILL.md#composition), the "nothing" row: when the user states no allocation, half the agents beyond the implementers, rounded up, are Codex, in the judgement roles: plan critique, review, skeptics and refuters, judges. A one-agent task has no judgement agent beyond the completeness critic, and so no Codex agent unless cross-review adds one. Everything else there holds: an allocation or refusal the user states, the announcement, attribution, no backfill, no allow-rules. Implementers are not duplicated: one per task, split by ownership, and which side takes which is your call. Cross-review runs the other way round, a Claude implementer's diff to a Codex agent and a Codex agent's diff to a Claude agent.

Allocate inside the page's bounds by judgement, not to fill a band; [roles.md](roles.md) defines the responsibility, rights and return of each role seen so far, and a new one is named the same way. Run a decisive check before commissioning a panel. Keep dependent execution in one agent; keep its verification independent. Several writers at once is how a task goes faster: split by file ownership, as Claude agents on one live tree or as Codex agents in separate worktrees, never two Codex write agents on one directory. Disjoint filenames do not make work independent, so settle the contract between the owners before they start; work that collides anyway is repaired as [results.md](results.md#writers-collided) says.

## The card

Write the card's five rows in the user's own language and in ordinary words — work: what will be done; who: each agent by model name and role; writes: what each may write, that the agents reach the network and any you are keeping off it, and that reports and artifacts land outside the repository, except a worktree agent's own tree, which is made and removed inside the repository, in a hidden folder; cost: the tokens by agent, and your own inline work beside them; checks: which agent verifies what, the critic, and for a design round the criterion that picks the survivors. Name no path and no header field. A worktree agent is named as such, because a worktree will be made. Browser and end-to-end runs go to a Claude agent, or to a write agent with the grants parity.md's [Browser-mode sandbox](../../codex/references/parity.md#browser-mode-sandbox) section names; a read agent cannot, because that section's Chromium override is a file in the tree it may not write.

Announce the composition here, and the caps beside it in a sentence: your own model, one Fable and one Astra at a time, six alive. A cap the user sets in words ("two Fable"), or agrees to when the plan proposes one with its reason, replaces the default for this run; composition words ("only codex", "no codex") follow the sibling's table. One plan when there is one; when several approaches are viable, show them all with a recommendation and let the user pick. Number each alternative, show its cost and mark the recommendation; state in the plan what "go" selects.

## Estimates and the stop line

State expected tokens by tier and role in the plan; name the comparable runs behind each estimate and mark unmeasured roles `unknown`. Estimate the bulk row per unit: a comparable unit's tokens times the units, plus the pilot and a margin for re-runs, and estimate it again after the pilot. The plan states a stop line of three times the pilot's median tokens per agent: an agent whose report's `tokenUsage` total passes it stops further launches until the user has seen a new estimate.

## The environment check

For each agent, check the required commands against its planned rights and environment, and write what you found into a Codex agent's `ENVIRONMENT:` line: what is staged and where, and the daemon or socket a tool needs with the command to run instead. Probe uncertain prerequisites cheaply; put unmet prerequisites in the plan.

## A worktree agent

A new thread's worktree is cut at `HEAD`, so a worktree agent suits only work that starts there: competing implementations, a suite on committed code, atomically parallel work that must run its own tests. Never use one to test uncommitted live edits: it sees none of them and passes untouched code. When a plan needs both, the commit that feeds the worktree is a live-tree commit and goes into the plan; a stash feeds it nothing. Use one only where a fresh tree can run: dependencies installable inside it under the planned rights (the live checkout's are absent), no daemon or socket. You decide; ask when unsure.

## A bulk row

The unit of a bulk fan-out is either one part of the material for extraction, with a fixed answer schema, or one claim, one address, a verbatim quote, and a verdict from a closed set that describes the subject and never the brief: whether an address moved or was wrong is a judgement about your own input, and it stays out of the set ([measured 2026-09-12](incidents.md#nineteen-of-twenty-on-one-broken-path)). A bulk batch of either unit may run as a swarm the plan proposes: the card names it with its count and cost, and the user's "go" on the plan starts it, as a typed `/entrust:swarm` also does. State the bulk row's count, a count derived from the units with the plan saying why that many. Pilot every bulk fan-out before it launches: a stronger model marks a few units, the bulk model runs the same units, and recall, false positives and tokens against that marking decide the brief's fixes and its effort.

## Effort

Every Codex agent carries an `EFFORT:` line chosen for its work, as it carries its `MODEL:` line: `high` for the bulk row's extraction, classification and verification, `low` for mechanical work only, `medium` for review, refutation and judgement in the strong and cheap rows; only Astra in the top row goes without one and inherits the configured effort, and a model standing in for Astra carries `EFFORT: xhigh`. Measured 2026-09-17: two Luna read agents at an inherited `xhigh` took 480 and 557 seconds and 1.2M and 2.3M tokens for a ledger and a grep task. In a Workflow, `effort: 'low'` is for mechanical Claude Sonnet stages only.

## A Workflow

Your user's invocation of this skill authorises Workflow. A Workflow reports nothing until its last agent returns, so an agent that ends early stays invisible behind its siblings ([measured 2026-09-08](incidents.md#a-workflow-hid-an-early-exit)). Load the `workflow-authoring` skill before writing the script when the session lists it. In the script, a Codex agent's `agentType` is `entrust:codex-agent`.
