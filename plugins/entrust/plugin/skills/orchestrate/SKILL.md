---
name: orchestrate
description: >-
  User-invoked orchestration mode: agree a plan, delegate substantial work to subagents,
  verify independently and synthesise their evidence while keeping the main context small.
disable-model-invocation: true
metadata:
  version: "0.24.0"
license: MIT
---

You own the work-list, the plan, the user conversation and the synthesis. Agents own bounded
deliverables. Use the host's native delegation capabilities. A native Codex subagent needs no
external launcher and does not activate the [codex adapter](../codex/SKILL.md); load that adapter
only when the plan calls for an external Codex run. For an external OpenCode worker, load the
[opencode adapter](../opencode/SKILL.md): it owns the shared server connection, recent-model selection,
session continuation and native callbacks. Other skills may supply task-specific guidance.

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

1. Read [plan.md](references/plan.md) before composing. Check which models, concurrency, context
   isolation, continuation and nested delegation the runtime actually exposes. Treat an unproven
   capability as unknown; put any unmet prerequisite or requested allocation in the plan.
2. Assign tasks by ownership and shared interfaces, using [roles.md](references/roles.md). Critique
   a nontrivial split before writing worker briefs; each brief names the corrected split and its
   owner's files. With several workers, consider the coordinator role in [foreman.md](references/foreman.md)
   when the runtime supports nested delegation and enough slots remain for its workers.
3. Show the plan's work, agents, writes, cost and checks, then wait for approval unless the user
   already authorised that concrete scope. An amendment that expands scope or rights needs a new
   decision. Approval covers the listed work; commits and publication need their own authority.
4. Launch within the approved ownership and the runtime's limits. Read [approvals.md](references/approvals.md)
   when an agent needs a decision, and [results.md](references/results.md) when work fails, a worktree
   needs landing or writers collide. Continue a worker to correct its own work; give verification
   a fresh agent with the raw artifacts and requirements, rather than the writer's conclusions.
5. Read every return, reconcile what actually ran with the plan, and synthesise attributable
   findings. At each phase report what is verified, pending and blocked in the user's language.
   Before drafting the final answer, read [answer.md](references/answer.md) whole. Lint the draft
   with `node "<skill-dir>/scripts/lint-draft.mjs" --agents "<Model> <id>, …" --receipts <ledger> <draft>`
   (its `--help` describes receipts and request vocabulary), then have a fresh completeness critic
   read the frozen draft and its evidence. Name every dropped task, agent or check.

## Capacity and models

Choose the smallest team that can do the work and verify it. A comparison may need independent
proposals; a complex task may need batches. Count the orchestrator, a delegated coordinator and
nested workers wherever the runtime counts them. A waiting thread frees a slot only if the
runtime says so. Model diversity is useful when available; a fresh same-model agent is a fresh
context, not evidence of a different model bias or of hidden project instructions.

| Tier | Work |
| --- | --- |
| top | design, split critique, judgement and a case stuck after two approaches |
| strong | implementation, nontrivial analysis and independent review |
| cheap | bounded mechanical work |
| bulk | independent shallow units after a pilot establishes quality and cost |

Map tiers to models the host actually permits; use inherited settings when selection is unavailable
and say so in the plan. Respect user-set model and effort choices. Bulk work consumes the runtime's
capacity too. Writers sharing a tree need explicit ownership and a settled interface; avoid shared
checkout mutations such as switching branches while another writer is active.

## Verification

Check one assembled brief's input paths, output rights and completion criteria before a fan-out.
Vary verifier perspectives rather than commissioning identical refuters. A decisive check that
could not run yields `unknown`, not a refutation. Open one complete return before trusting a
unanimous tally: agreement may be evidence of one broken prompt or prerequisite.

Fix and cross-review at most two rounds, then use a stronger available reviewer or return the
remaining blocker to the user. Two rounds repeating the same blocker require a revised plan.
Run checks when their results can change the next decision; verify the final combined tree once
with the relevant checks, independently of its writers.

## The agent's return

Ask every agent for these fields, in text or structured output supported by the host:

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
