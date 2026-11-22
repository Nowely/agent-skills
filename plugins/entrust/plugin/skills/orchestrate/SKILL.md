---
name: orchestrate
description: >-
  User-invoked orchestration mode: agree a plan, delegate substantial work to subagents,
  verify independently and synthesise their evidence while keeping the main context small.
disable-model-invocation: true
metadata:
  version: "0.45.0"
license: MIT
---

You own the work-list, the plan, the user conversation and the synthesis. Agents own bounded
deliverables. Use the host's native delegation capabilities; in Claude Code, load the [claude
adapter](../claude/SKILL.md) (`entrust:claude`) before composing, since it owns how Claude Code runs
agents.

## Other providers

Agents run on the host's own delegation and models. Another provider, model or route appears only when the user
names it, in the conversation or in the user's or project's instructions (CLAUDE.md, AGENTS.md); several may be
named at once. A named model the host runs natively is native. For any other, run
`node "<skill-dir>/scripts/adapter-status.mjs" --skip <the adapter of the host's own provider>` and route each named
model through the adapter that lists it; then follow [external.md](references/external.md) and that adapter's page.
Nothing proposes another provider unprompted, a cross-family second opinion included. In the
[main proxy mode](references/main-proxy.md), which the proxy skill starts, Claude executes and this conversation relays.

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
give a worker the resolved absolute script path and ask it to cite its exit status and counts.

Start one temporary context with `node "<skill-dir>/scripts/temp-dir.mjs" run`; it returns JSON.
Pass that JSON as `ENTRUST_TEMP_CONTEXT` on your check commands and a native worker's so they share the
initiating project and run even when their working directory changes. Without that context, separate commands
create separate runs.

## The plan

1. Read [plan.md](references/plan.md) before composing. Take host identity, native model/effort
   choices, delegation features and read-only usage windows directly from the active runtime. Do not
   serialize them into a status-script input or infer them from another CLI; missing facts stay
   `unknown`.

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

## Skills per invocation

Workers use the skills their runtime makes available by default, subject to the adapter's documented limits.
If the user asks for an invocation without skills, put “Do not use skills in this invocation” in that
worker's brief. For a task-wide request, include it in every affected launch and continuation without asking
again; for a single invocation, do not carry it to another. An invocation with no such instruction uses the
ordinary settings. The coordinator carries the user's scope in the conversation; no skills mode is stored.

This is an instruction, not removal from the runtime's catalogue or a file-access restriction. A resumed
thread may still contain skills read earlier. If the user needs a history without them, start a new context
without inherited history: omit `RESUME:` for an external worker, and select the host's no-history fork for
a native worker when available ([Codex](../codex/references/models.md#native-history)). If the host cannot
provide it, report the limitation. Claude's `SAFE_MODE` also suppresses other configuration and approvals, so choose it only when that broader
mode is explicitly requested.

## Capacity and models

Choose the smallest team that meets the work and verification needs. Tiers describe work demands, not
fixed model ability or a quality ranking. The host's models page names its models for them:
[Claude Code](../claude/references/models.md), [Codex](../codex/references/models.md); on another host, its runtime.

| Tier | Work |
| --- | --- |
| top | consequential design, plan critique, judgement and a case stuck after two approaches |
| strong | nontrivial analysis, implementation and independent review |
| cheap | bounded work where mistakes are easy to detect and repair |
| bulk | independent units after the candidate model meets the acceptance rule |

Default bounds, capped further by the host's capacity and the user's agreed limits:

| Bound | Default |
| --- | --- |
| simple task | 1 worker, with the completeness critic beside it, not counted |
| comparison or design | 2 to 4 agents |
| complex | 5 or more, launched in batches |
| alive at once | 6, every route counted |
| top tier | 1 alive at a time; a standing advisor is not counted |

Choose models and effort by required quality, uncertainty, consequences, context and latency. Use cost
as a selection input when it can change the choice; omit cost estimates from the approval plan. Choose
effort for each task. Use `max` or `ultra` only on the user's separate explicit instruction; never select
either automatically. Existing authorization applies to continuations in its scope. Record the requested
effort for every launch and continuation. Distinguish it from the provider-confirmed effective effort;
when the provider does not confirm it, mark the effective effort unknown.

Recommend one of these profiles:

| Profile | Allocation |
|---|---|
| balanced (default) | Keep the user's model as coordinator; the bulk tier for scouting, the top tier for consequential planning or architecture, and an independent verifier for material findings. |
| speed | For bounded, recoverable work with a proven model/task pairing: the bulk tier at a medium effort, one scout per independent unit, and a targeted check. If the pairing is unproven, keep its pilot and state that this limits the speed gain. Keep the review the consequences warrant. |
| quality | Keep the user's model as coordinator. The top tier for consequential planning or architecture; independent bulk- and strong-tier reviewers on the same material when distinct perspectives can change the decision, and a separate strong judge for consequential disagreement. |

A new model/task pairing gets a pilot ([model fit](references/plan.md#model-fit-and-estimates)); reuse
a successful result only for comparable work.

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

Fix and cross-review at most two rounds, then use a stronger available reviewer or return the
remaining blocker to the user. When the user answered a cross-review's page, the fix round's brief carries the
record and the export, and the next cross-review reads them as its
[next revision](../review/references/report-data.md#the-next-revision) says. Two rounds repeating the same blocker require a revised plan.
Run checks when their results can change the next decision; verify the final combined tree once
with the relevant checks, independently of its writers.

## The agent's return

Ask task and review agents for these fields, in text or structured output supported by the host:

    status:    done | partial | blocked
    result:    one standalone sentence, then a summary of material findings, at most 30 lines
    evidence:  what ran, with exit status and counts; unknown where it could not run
    artifacts: paths to the full outputs under the agent's permitted roots
    open:      missing coverage, questions and risks

A large result goes into an artifact with a summary retaining every material finding. An artifact
path must be writable for that agent; returning text requires no new filesystem grant. A verifier
names its target and whole scope, and reports unverified parts in `open`. A malformed return is
continued once for these fields, then treated as unknown if it still cannot be read. Keep the
fields as input to your synthesis rather than pasting the block into the user's answer.
