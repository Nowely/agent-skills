---
name: orchestrate
description: >-
  User-invoked coordinator mode: agree a plan, have the host's own agents do and check every part of the
  work, and synthesise their evidence while this session keeps the plan, the decisions and a small context.
disable-model-invocation: true
metadata:
  version: "0.48.0"
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
  between returns, a claim you are about to relay or an objection you are about to apply or overrule.
- Hand a worker's artifacts to the next agent by path, verbatim, never as your paraphrase.
- Only the user's explicit word for a specific edit lets you make that edit. There is no solo lane: invoking this
  mode is the user's choice of coordinated work.

## The run

1. Start one temporary context with `node "<skill-dir>/scripts/temp-dir.mjs" run`, `<skill-dir>` this skill's
   installed directory. Its JSON goes as `ENTRUST_TEMP_CONTEXT` into every native worker's and the verifier's
   brief, and its `scope` is your temporary directory. In Claude Code, load the
   [claude adapter](../claude/SKILL.md) (`entrust:claude`) first.
2. Compose the [default team](#the-default-team) and show the card [plan.md](references/plan.md#the-card) defines,
   naming `<scope>/card.md` in it; plan.md's index says when to read its other sections.
   Wait for approval unless the user already authorised that scope and allocation. A model, route, scope or right
   outside the approved card needs a new decision; commits and publication need their own authority.
3. At approval write the card to `card.md`, then append each decision with its reason. On a re-invocation, or when
   the approved card is no longer in context, re-read this contract and `card.md` and continue the approved work
   without planning it again; if the path is lost, ask the user.
4. Run the card's critics, then brief the workers. Every brief names its row in
   [roles.md](references/roles.md) by path, and the agent reads that row; each worker's brief carries the user's
   words for its task verbatim, and a critic's and the verifier's brief carries the request verbatim. Your restatement never
   stands in for either. An objection counts when it cites a path:line, a named consumer or a failing check;
   drop one that cites none. Apply one that cites a place only after reading that place, and overrule one only by
   citing the place in the code or the request that refutes it, each with the reason in the decision log; one you
   can settle neither way stays a claim for the verifier, which marks whether its check failed. A change of scope or allocation goes to the user, and so does an architecture
   verdict other than `keep`, with both approaches, before anyone else starts.
5. Launch within the approved ownership and the runtime's limits. Read [approvals.md](references/approvals.md)
   when an agent needs a decision and [results.md](references/results.md) when work fails, a worktree needs
   landing or writers collide. Continue a worker to correct its own work. With several workers, a
   [foreman](references/foreman.md) may run them where the host allows nested agents.
6. Read every return and compare each launch's model and effort with the card, the effective ones as the host
   reports them, else `unknown`; reconcile a deviation before going on. When any worker's diff adds a concept,
   brief one fresh plan critic, never the thread that judged the plan, once the last worker has returned, for
   [its second read](references/roles.md#its-second-read) of the combined diff before the verifier. At each phase, tell the user what is
   verified, pending and blocked, in their language.
7. After the verifier, draft the answer and have it read as [answer.md](references/answer.md) says. Lint the draft
   with `node "<skill-dir>/scripts/lint-draft.mjs" --agents "<Model> <id>, …" --receipts <ledger> <draft>`, the
   workers' and the verifier's ledgers as receipts (`--help` defines them).

## The default team

| Role | When |
| --- | --- |
| coordinator | this session, throughout |
| architecture critic | once, after approval, when the solution adds a concept (a module, meaning a new unit with a responsibility others will depend on, not a new file for one function or helper; a mechanism, flag, layer, state or dependency), changes or removes an existing interface or contract other units consume (a new export or function does not), takes an irreversible or outward-facing action, or leaves several viable approaches, or the user asks |
| plan critic | with several workers, once, after approval and the architecture critic, before the first worker brief; with any team, one fresh critic after the last worker returns, when a diff adds a concept |
| worker | after the critics; usually one, one per owned deliverable |
| verifier | fresh, after the writes or a read-only task's findings |

You put the verifier on every card, and the plan critic on every card with several workers, as the minimum; only
the user's word drops or changes either, and an architecture critic stands in for neither. Any other role joins only when the card names why.

## Other providers

A provider, model or route other than the host's own appears only when the user names it, in the conversation or
the user's or project's instructions (CLAUDE.md, AGENTS.md). Each named model the host runs natively is native. For any other, run
`node "<skill-dir>/scripts/adapter-status.mjs" --skip <the adapter of the host's own provider>` and route each named
model through the adapter that lists it; then follow [external.md](references/external.md) and that adapter's page.
Nothing proposes another provider unprompted, a cross-family second opinion included. The
[main proxy mode](references/main-proxy.md) is the proxy skill's.

## Capacity and models

For every ordinary agent role except the plan critic, including the architecture critic, verifiers and a
foreman, use the host's executor model by default: Terra in Codex, Sonnet in Claude Code, regardless of the
coordinator's model. The plan critic, on both of its reads, uses the host's strong model by default: Sol in Codex,
Opus in Claude Code. An explicit user choice
of model or effort takes precedence for its stated scope. A transport relay is not an executor and keeps the
relay model and effort its adapter specifies. On another host use its runtime's model choices.

Use the coordinator's effort for each executor and continuation. Trust inheritance when the host confirms it;
when a launch needs an explicit value, pass the coordinator's value, not the CLI's own default. If the required
value is unknown or unsupported, use an approved fallback or ask the user before launching. This includes
`max` and `ultra` when inherited; selecting either otherwise requires the user's explicit word. A foreman uses
the coordinator's approved allocation, including effort, for its workers.

The models pages map tiers to models for explicit choices and the top-tier cap:
[Claude Code](../claude/references/models.md), [Codex](../codex/references/models.md).

At most 6 agents are alive at once, every route counted, and 1 top-tier agent at a time, a standing advisor not
counted; the host's capacity and the user's limits cap both further.

## Verification

Before a fan-out, check one assembled brief's input paths, output rights and completion criteria. Verify with an
agent that wrote nothing of what it checks: give it the requirements in the user's words, the plan critic's objections
and acceptance checks (without one, the card's checks row), and the raw artifacts. If a worker defended an addition
with a test, give the verifier the test and that defence as a claim to check, not the rest of the writer's return;
on read-only work, give it the workers' findings as claims to re-derive, never their judgement that they hold.
Give it and the workers the resolved
`<skill-dir>/scripts/capture-check.mjs`; their rows say how to run it. A decisive check that could not run yields
`unknown`, not a refutation. Open one complete return before trusting a unanimous tally of verifiers: agreement may
come from one broken prompt or prerequisite. After a fix, continue the verifier's thread with each fix as a claim
to check: what it changes, its test and the worker's ledger. Fix and re-verify at most two rounds; then use a stronger reviewer or
return the blocker to the user, and the same blocker in two rounds needs a revised plan. A stronger reviewer
uses a different model only when the user authorized it.

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
