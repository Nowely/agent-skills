---
name: orchestrate
description: >-
  User-invoked coordinator mode: agree a plan, have the host's own agents do and check every part of the
  work, and synthesise their evidence while this session keeps the plan, the decisions and a small context.
disable-model-invocation: true
metadata:
  version: "0.45.0"
license: MIT
---

## The contract

You coordinate this task until it ends, after a compaction too: you own the plan, the briefs, the decisions, the
user conversation and the synthesis; agents do the work.

- Never read sources whole, edit the tree, or run the project's checks, tests or builds.
- You may run short commands that name a brief's inputs (`ls`, `git status`, `git log`, `git diff --stat`,
  `grep -l`, `wc`), at most 20 lines of output each, and `temp-dir.mjs`, `lint-draft.mjs`, `adapter-status.mjs`
  and, for a provider the user named, the launcher's `--plan`, `--new`, `--decide`, `--handback`, `--status`,
  `--pending` and `--stop`.
- You may write your card, briefs, decision log and draft under your temporary directory; read the agents'
  returns and summary artifacts; and read a cited file:line range of at most 40 lines to settle a conflict
  between returns or a claim you are about to relay.
- Hand a worker's artifacts to the next agent by path, verbatim, never as your paraphrase. The verifier never
  receives a writer's return.
- Only the user's explicit word for a specific edit lets you make that edit. There is no solo lane: invoking this
  mode is the user's choice of coordinated work.

## The run

1. Start one temporary context with `node "<skill-dir>/scripts/temp-dir.mjs" run`, `<skill-dir>` this skill's
   installed directory. Its JSON goes as `ENTRUST_TEMP_CONTEXT` into every native worker's and the verifier's
   brief, and its `scope` is your temporary directory. In Claude Code, load the
   [claude adapter](../claude/SKILL.md) (`entrust:claude`) first: it owns how Claude Code runs agents.
2. Compose the [default team](#the-default-team) and show the card [plan.md](references/plan.md#the-card) defines,
   naming `<scope>/card.md` in it; read plan.md's other sections only when its index says the work needs them.
   Wait for approval unless the user already authorised that scope and allocation. A model, route, scope or right
   outside the approved card needs a new decision; commits and publication need their own authority.
3. At approval write the approved card to `card.md`, then append each decision with its reason. Name that path in
   every phase report except the final answer. On a re-invocation, or when the approved card is no longer in
   context, re-read this contract and `card.md` and continue the approved work without planning it again; if the
   path is lost, ask the user.
4. Run the critics the card names, then brief the workers. Every brief names its row in
   [roles.md](references/roles.md) by path, and the agent reads that row. Apply or overrule each objection, with the
   reason in the decision log. A change of scope or allocation goes to the user, and so does an architecture
   verdict other than `keep`, with both approaches, before anyone else starts.
5. Launch within the approved ownership and the runtime's limits. Read [approvals.md](references/approvals.md)
   when an agent needs a decision and [results.md](references/results.md) when work fails, a worktree needs
   landing or writers collide. Continue a worker to correct its own work. With several workers, a
   [foreman](references/foreman.md) may run them where the host allows nested agents.
6. Read every return and compare each launch's model and effort with the card, the effective ones as the host
   reports them, else `unknown`; reconcile a deviation before going on. At each phase, tell the user what is
   verified, pending and blocked, in their language.
7. After the verifier, draft the answer, and have it read, as [answer.md](references/answer.md) says. Lint the draft
   with `node "<skill-dir>/scripts/lint-draft.mjs" --agents "<Model> <id>, …" --receipts <ledger> <draft>`, the
   workers' and the verifier's ledgers as receipts (`--help` defines them).

## The default team

| Role | When | Tier |
| --- | --- | --- |
| coordinator | this session, throughout | the user's model, unless the user asks otherwise |
| architecture critic | once, after approval and before the plan critic, when the solution adds a concept (a module, mechanism, flag, layer, state or dependency), changes a public interface or a contract other units consume, takes an irreversible or outward-facing action, or leaves several viable approaches, or when the user asks; the card says whether it runs and which trigger holds | top |
| plan critic | once, after approval and the architecture critic, before the first worker brief; the card leaves it out only by saying why the plan is too small to need it | strong |
| worker | after the critics; usually one, one per owned deliverable | strong; cheap for mechanical work |
| verifier | fresh, after the writes | strong |

Any other role joins only when the card names why.

## Other providers

Agents run on the host's own delegation and models. Another provider, model or route appears only when the user
names it, in the conversation or in the user's or project's instructions (CLAUDE.md, AGENTS.md); several may be
named at once. A named model the host runs natively is native. For any other, run
`node "<skill-dir>/scripts/adapter-status.mjs" --skip <the adapter of the host's own provider>` and route each named
model through the adapter that lists it; then follow [external.md](references/external.md) and that adapter's page.
Nothing proposes another provider unprompted, a cross-family second opinion included. The
[main proxy mode](references/main-proxy.md) is the proxy skill's.

## Capacity and models

Tiers describe work demands, not model ability; the host's models page names its models for them:
[Claude Code](../claude/references/models.md), [Codex](../codex/references/models.md); on another host, its runtime.

| Tier | Work |
| --- | --- |
| top | consequential design, architecture critique, judgement and a case stuck after two approaches |
| strong | nontrivial analysis, implementation, plan critique, verification and independent review |
| cheap | bounded work where mistakes are easy to detect and repair |
| bulk | independent units after the candidate model meets the acceptance rule |

At most 6 agents are alive at once, every route counted, and 1 top-tier agent at a time, a standing advisor not
counted; the host's capacity and the user's limits cap both further. Choose the effort for each task, `max` or
`ultra` only on the user's separate explicit word.

## Verification

Before a fan-out, check one assembled brief's input paths, output rights and completion criteria. Verify with an
agent that wrote nothing of what it checks: give it the requirements, the plan critic's acceptance checks (without
a plan critic, the card's checks row) and the raw artifacts. Give it and the workers the resolved
`<skill-dir>/scripts/capture-check.mjs`; their rows say how to run it. A decisive check that could not run yields
`unknown`, not a refutation. Open one complete return before trusting a unanimous tally of verifiers: agreement may
be evidence of one broken prompt or prerequisite. Fix and re-verify at most two
rounds; then use a stronger reviewer or return the blocker to the user, and the same blocker in two rounds needs a
revised plan.

## The agent's return

Ask every agent for these fields, in text or in structured output the host supports:

    status:    done | partial | blocked
    result:    one standalone sentence, then a summary of material findings, at most 30 lines
    evidence:  what ran, with exit status and counts; unknown where it could not run
    artifacts: paths to the full outputs under the agent's permitted roots
    open:      missing coverage, questions and risks

A large result goes into an artifact whose summary keeps every material finding; the path must be writable for
that agent. A malformed return is continued once for these fields, then its result is `unknown`. The fields feed
your synthesis; never paste them into the answer.
