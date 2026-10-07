---
name: orchestrate
description: >-
  User-invoked orchestration mode: agree a plan, delegate substantial work to subagents,
  verify independently and synthesise their evidence while keeping the main context small.
disable-model-invocation: true
metadata:
  version: "0.25.1"
license: MIT
---

You own the work-list, the plan, the user conversation and the synthesis. Agents own bounded
deliverables. Use the host's native delegation capabilities; in Claude Code, load the
[claude adapter](../claude/SKILL.md) (`entrust:claude`) before composing, since it owns how Claude Code
runs agents. An external worker needs its adapter: [codex](../codex/SKILL.md) for an external Codex run
(a native Codex subagent needs none), [opencode](../opencode/SKILL.md) for an OpenCode worker, which owns
the server connection, model selection, session continuation and callbacks. Do not load adapter skill
text for capability discovery; use the capability snapshot below, then load only the selected worker's
adapter.

## Your own hands

Scout inline with cheap, targeted commands before delegating. Keep a quick edit that needs no
exploration inline; delegate substantial source reads, tree-wide searches, diffs, logs, tests and
edits that need exploration. Keep dependent execution together and its verification independent.
Do not grade your own implementation.

An inline check answers one question in at most twenty lines. Capture larger output with
`node "<skill-dir>/scripts/capture-check.mjs" --label <question> --ledger <file> -- '<command>'`:
the full log and ledger go under the runtime's temporary directory, and the real exit status is
reported even when a pipeline fails. Put the ledger under an approved temporary root; set
`TMPDIR` to that root when the default temp directory is outside the approved scope. Resolve
`<skill-dir>` from this skill's installed location;
give workers the resolved absolute script path and ask them to cite its exit status and counts.

Start one temporary context with `node "<skill-dir>/scripts/temp-dir.mjs" run`; it returns JSON.
Pass that JSON as `ENTRUST_TEMP_CONTEXT` on check and worker commands so they share the initiating
project and run even when their working directory changes. Without that context, separate commands
create separate runs. External drivers and swarms establish and forward the context themselves.
An external agent scopes child checks to its own `TMPDIR`, so they cannot write into another agent's files.

## The plan

1. Read [plan.md](references/plan.md) before composing. Take host identity, native model/effort
   choices, delegation features and read-only usage windows directly from the active runtime. Do not
   serialize them into a status-script input or infer them from another CLI; missing facts stay
   `unknown`. Then run the read-only adapter collector:
   `node <skill-dir>/scripts/adapter-status.mjs`. Pass `--skip codex` when Codex is the active native
   host, so its external adapter status is not queried a second time. The collector returns registered
   adapter reports without host JSON, loading adapter skill pages, normalizing a plan or launching a
   worker. Use only recent model references with an adapter-sourced recent state; absent or unsupported
   sources remain `unknown`/`unsupported`. A recent reference is not proof it is currently runnable; the
   chosen adapter validates the exact model and variant before execution. If an explicit model family
   has no recent candidate, report that gap.

   Keep native host facts, adapter status and the plan's allowed-route policy separate. Preserve each
   usage window's account/route/model scope, source and observation time; do not sum overlapping
   windows or infer remaining calls from a percentage. Account windows include the coordinator and
   workers/proxies using that account, but do not give per-model call counts. Missing telemetry is
   `unknown`; age an observation against the current time and treat stale data as stale, never
   unlimited. At the configured near-limit threshold (default 99% used), hold large work when its
   estimate is unknown; use the bulk tier only when its task fit and quota savings are evidenced.
2. Assign tasks by ownership and shared interfaces, using [roles.md](references/roles.md). For a
   nontrivial split, include the split critic and its exact model in the proposed plan. Launch it only
   after the allocation is covered by the approved policy or the user approves the plan. Apply its
   findings before worker briefs; if they change scope or model allocation, get approval for the change.
   With several workers, consider the coordinator role in [foreman.md](references/foreman.md) when the
   runtime supports nested delegation and enough slots remain for its workers.
3. Show the card [plan.md](references/plan.md#the-card) defines, with a profile from
   [Capacity and models](#capacity-and-models). Wait for approval unless the user already authorised
   that concrete scope and allocation. A model or route outside the approved policy needs approval
   before launch. Scope or rights changes need a new decision; commits and publication need their own
   authority.
4. Launch within the approved ownership and the runtime's limits. Read [approvals.md](references/approvals.md)
   when an agent needs a decision, and [results.md](references/results.md) when work fails, a worktree
   needs landing or writers collide. Continue a worker to correct its own work; give verification
   a fresh agent with the raw artifacts and requirements, rather than the writer's conclusions.
5. Read every return and compare each launch's requested model and effort with the approved plan.
   Use host-reported effective-model data when available; otherwise mark effective use unknown.
   Reconcile deviations before continuing, then synthesise attributable findings. At each phase report
   what is verified, pending and blocked in the user's language.
   Before drafting the final answer, read [answer.md](references/answer.md) whole. Lint the draft
   with `node "<skill-dir>/scripts/lint-draft.mjs" --agents "<Model> <id>, …" --receipts <ledger> <draft>`
   (its `--help` describes receipts and request vocabulary), then have a fresh completeness critic
   read the frozen draft and its evidence. Name every dropped task, agent or check.

## Capacity and models

Choose the smallest team that meets the work and verification needs. Tiers describe work demands, not
fixed model ability or a quality ranking. Each adapter names its models for them:
[Claude Code](../claude/references/models.md), [Codex](../codex/references/models.md), and OpenCode's
recent models ([opencode](../opencode/SKILL.md)). On another host, take the models from its runtime.

| Tier | Work |
| --- | --- |
| top | consequential design, plan critique, judgement and a case stuck after two approaches |
| strong | nontrivial analysis, implementation and independent review |
| cheap | bounded work where mistakes are easy to detect and repair |
| bulk | independent units after the candidate model meets the acceptance rule |

Choose models and effort by required quality, uncertainty, consequences, context and latency. Use cost
as a selection input when it can change the choice; omit cost estimates from the approval plan. Use the
host's highest supported effort, or a stronger configured setting, unless the user selects the speed
profile.

Recommend one of these profiles:

| Profile | Allocation |
|---|---|
| balanced (default) | Keep the user's model as coordinator; the bulk tier for scouting, the top tier for consequential planning or architecture, and an independent verifier for material findings. |
| speed | For bounded, recoverable work with a proven model/task pairing: the bulk tier at a medium effort, one scout per independent unit, and a targeted check. If the pairing is unproven, keep its pilot and state that this limits the speed gain. Keep the review the consequences warrant. |
| quality | Keep the user's model as coordinator. The top tier for consequential planning or architecture; independent bulk- and strong-tier reviewers on the same material when distinct perspectives can change the decision, and a separate strong judge for consequential disagreement. |

A new model/task pairing gets a pilot ([model fit](references/plan.md#model-fit-and-estimates)); reuse
a successful result only for comparable work. Model diversity is useful when it can change a decision;
a fresh same-model context does not prove a different model perspective.

The user's model remains coordinator unless the user requests otherwise. An unavailable model or
unsupported effort is a proposal to resolve, not permission to substitute: show the available
alternatives and wait for approval unless the approved policy names that fallback. Inherit settings
only when the runtime resolves them and the approved policy covers that exact allocation; otherwise
mark them unknown and obtain a decision before launch.

## Verification

Check one assembled brief's input paths, output rights and completion criteria before a fan-out.
Vary verifier perspectives rather than commissioning identical refuters. A decisive check that
could not run yields `unknown`, not a refutation. Open one complete return before trusting a
unanimous tally: agreement may be evidence of one broken prompt or prerequisite.

Before dispatch, refresh passive adapter status and the relevant usage observations. The adapter's
launch path validates the exact chosen model/variant/profile before creating a worker or submitting
its task. That check is not a planning catalog: if it fails, stop and amend the plan. Availability,
authorization and budget remain separate coordinator decisions.

Fix and cross-review at most two rounds, then use a stronger available reviewer or return the
remaining blocker to the user. Two rounds repeating the same blocker require a revised plan.
Run checks when their results can change the next decision; verify the final combined tree once
with the relevant checks, independently of its writers.

## The agent's return

Ask task and review agents for these fields, in text or structured output supported by the host:

    status:    done | partial | blocked
    result:    one standalone sentence, then a summary of material findings, at most 30 lines
    evidence:  what ran, with exit status and counts; unknown where it could not run
    artifacts: paths to the full outputs under the agent's permitted roots
    open:      missing coverage, questions and risks

A proxy forwards the worker's complete return, with transport status separate; an artifact replaces
clipped display, not the worker's answer with a summary.

A large result goes into an artifact with a summary retaining every material finding. An artifact
path must be writable for that agent; returning text requires no new filesystem grant. A verifier
names its target and whole scope, and reports unverified parts in `open`. A malformed return is
continued once for these fields, then treated as unknown if it still cannot be read. Keep the
fields as input to your synthesis rather than pasting the block into the user's answer.
