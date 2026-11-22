# The plan

When to read each section:

- [The card](#the-card) and [composition](#composition): for every plan.
- [Larger teams and profiles](#larger-teams-and-profiles): when the work needs more than the default team, or a
  profile other than balanced.
- [Usage windows](#usage-windows): when the host reports a usage window.
- [Model fit](#model-fit-and-estimates): for a role/model pairing without comparable evidence, and for every batch.
- [Environment and worktrees](#environment-and-worktrees): when an agent works in a worktree or outside the
  coordinator's working directory.
- [A bulk row](#a-bulk-row): when independent units fan out on the bulk tier.
- [An experiment](#an-experiment-on-these-rules): when the user asks to measure a rule or a composition.
- [Skills per invocation](#skills-per-invocation): when the user asks for an invocation without skills.

## The card

Write four rows in the user's language. Recommend the balanced profile by default; name speed or
quality only when it materially changes the allocation, with the approval that selects it.

| Row | Contents |
| --- | --- |
| work | deliverables, ownership, interfaces and completion criteria |
| team | coordinator role and each agent's role, one model display name and policy coverage in one place; whether the architecture critic runs and which of its triggers holds; the plan critic, or why the plan is too small to need it; do not restate the coordinator's model or call it unknown; show the requested effort for each agent and continuation, chosen for its task under the orchestration policy; a provider ID only when it disambiguates, a route only when it differs from the host's native one |
| writes | allowed directories, temporary artifacts, any isolated worktrees and network constraints |
| checks | who verifies what and which evidence decides; only when the plan has an external route, or a usage window is near its limit: the adapter status's source and freshness, the OpenCode model list's source (Desktop or the whole catalogue), the quota windows and the exact launch validation |

Show worker concurrency only when it affects parallel work; count nested workers by the host's rules.

## Composition

Allocate by the work, not to fill a team size: the smallest team that meets the work and its verification.
Give each deliverable one owner, keep dependent execution together, and settle shared interfaces before parallel
writes; who verifies is the orchestrate page's [Verification](../SKILL.md#verification). Choose models and effort by
required quality, uncertainty, consequences, context and latency; use cost as a selection input when it can change
the choice, and leave cost estimates off the card.

Honour requested models, routes and exclusions. A tier does not select a model or authorize a fallback: an
unavailable model or unsupported effort goes to the user with the available alternatives, unless the approved
plan names that fallback. A setting is inherited only when the runtime resolves it and the approved plan covers
that exact allocation; otherwise it is `unknown` and needs a decision before launch. Existing authorization covers
continuations within its scope.

Take host identity, native model and effort choices, delegation features and read-only usage windows from the
active runtime; do not serialize them into a status-script input or infer them from another CLI, and a missing
fact stays `unknown`. An adapter owns its provider's model lookup, launch parameters and runtime metadata;
native delegation needs no external adapter merely because a model has the same vendor.

## Larger teams and profiles

Beyond the default team, a comparison or a design takes 2 to 4 agents, and complex work 5 or more, launched in
batches, all within the orchestrate page's alive-at-once bound. The card recommends one of these profiles:

| Profile | Allocation |
|---|---|
| balanced (default) | the default team, with the bulk tier for scouting |
| speed | For bounded, recoverable work with a proven model/task pairing: the bulk tier at a medium effort, one scout per independent unit, and a targeted check. If the pairing is unproven, keep its pilot and state that this limits the speed gain. Keep the review the consequences warrant. |
| quality | The top tier for consequential planning or architecture; independent bulk- and strong-tier reviewers on the same material when distinct perspectives can change the decision, and a separate strong judge for consequential disagreement. |

## Usage windows

Keep native host facts, adapter status and the plan's allowed-route policy separate. Preserve each usage
window's account/route/model scope, source and observation time; do not sum overlapping windows or infer remaining
calls from a percentage. Account windows include the coordinator and workers/proxies using that account, but do not
give per-model call counts. Missing telemetry is `unknown`; age an observation against the current time and treat
stale data as stale, never unlimited. At the configured near-limit threshold (default 99% used), hold large work
when its estimate is unknown; use the bulk tier only when its task fit and quota savings are evidenced.

## Model fit and estimates

For a role/model pairing without comparable evidence, define the acceptance rule and pilot representative work.
Compare the same inputs with a stronger reference; check omissions, incorrect results and usefulness. Expand
when the rule passes: give the remaining independent units to agents that run side by side within the alive
bound, each external one with its own proxy, unless usage rather than time is the limit. A continuation of the
pilot carries them one batch after another ([measured](../../claude/references/incidents.md#batches-in-turn)).
Estimate batches from comparable runs, including a rerun margin. When an agent's tokens per unit exceed three
times the pilot's median per unit, pause that batch and review its remaining scope with the user: an agent
given twelve units may spend up to 36 times a one-unit pilot. Count tokens, not a priced cost: the total an
external agent's report records (`tokenUsage` for Codex, `usage` for OpenCode and Claude), or the host's figure
for a native one. An approval given before the pause, a pre-approved team included, does not lift it unless it
names this limit.

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
scale improves throughput or cost under the model-fit rule, and within actual host limits. A unanimous
tally is read as the orchestrate page's [Verification](../SKILL.md#verification) says.

## An experiment on these rules

When the user asks to measure one of these rules or a composition rather than to finish a task, the
plan is a protocol written before any agent: a hypothesis that can be false; arms, one of them the
comparator the hypothesis needs; material with its ground truth or acceptance check, frozen before any
arm sees it; metrics, with n and an interval where n is under fifty; the user, or a judge the user names,
reading the returns by letter with each model's name removed; and a budget with a stop
rule. Arms get the same brief except the composition and never see each other's returns. Record a
failed arm with its reason; never rerun it for a better number. Write the metrics and a conclusion that
names n, what stayed unmeasured and the confounds; the user's verdict decides, and neither is rewritten.

## Skills per invocation

Workers use the skills their runtime makes available by default, subject to the adapter's documented limits.
If the user asks for an invocation without skills, put “Do not use skills in this invocation” in that
worker's brief. For a task-wide request, include it in every affected launch and continuation without asking
again; for a single invocation, do not carry it to another. An invocation with no such instruction uses the
ordinary settings. The coordinator carries the user's scope in the conversation; no skills mode is stored.

This is an instruction, not removal from the runtime's catalogue or a file-access restriction. A resumed
thread may still contain skills read earlier. If the user needs a history without them, start a new context
without inherited history: omit `RESUME:` for an external worker, and select the host's no-history fork for
a native worker when available ([Codex](../../codex/references/models.md#native-history)). If the host cannot
provide it, report the limitation. Claude's `SAFE_MODE` also suppresses other configuration and approvals, so choose it only when that broader
mode is explicitly requested.
