---
name: advisor
description: >-
  Checks available resources, proposes a model roster for approval, then runs one standing advisor whose
  questions are independent of the coordinator's view and whose contribution is recorded.
disable-model-invocation: true
metadata:
  version: "0.24.2"
license: MIT
---

1. Identify the coordinator host from the runtime, then inventory the native models and limits it exposes. A driver status describes an external resource, not the host's identity.
   - Codex: use native subagents and their actual model list; do not load the external [Codex adapter](../codex/SKILL.md) or call its status. Claude/Fable is unavailable until a Claude adapter is exposed; if one appears, check it and propose Fable only when confirmed. Otherwise, propose Astra if the native model list includes it.
   - Claude: load the Codex adapter and use its current status, model catalogue and launch protocol. Use Fable only when the user's composition or Codex status rules out Codex.
   - Other or unclear host: use native resources only when exposed; check an external driver only when its adapter is available. Mark unobservable resources unknown.
2. Show the checked resource roster and proposed plan before launch: advisor, route, model, planned decision points, expected turns and applicable capacity. The invocation authorizes discovery and planning only. Wait for explicit approval of the plan and model roster; launch only after approval. A route or roster change needs approval again.

The mode is prompt only: no driver change, no new header field or flag.

## The advisor

After approval, use one standing top-row advisor from the accepted plan, beginning before the first decision, composition included. Keep one thread for the run and continue it through the host's native mechanism or the chosen adapter; count its active turns against that route's reported limit. "No advisor" (без советника) ends the thread for the run; "ask the advisor" (спроси советника) starts it again. The accepted plan authorizes its stated model and turns; a route or model change requires new approval.

## What it is asked, and what it never does

Consult at every material decision point named in the accepted plan, such as the split before a fan-out, the composition, a verdict to adopt or a stall. The plan assigns one advisor turn to each listed point; use every approved turn without asking again. Keep routine operational choices inline. A new point beyond the plan or a route/model change requires an amended plan and approval. Before each question, record the coordinator's provisional decision in a private notes file under its temporary directory, whose path the synthesis names. Send a neutral brief containing the decision to be made, relevant facts and sources, uncertainty and constraints; present real alternatives evenly. The brief carries no preferred answer or evaluative framing. Ask one question per message. Request a recommendation with deciding reasons, one alternative and what evidence would change the recommendation. Its return has five fields: `status` (done, partial or blocked), `result`, `evidence`, `artifacts` and `open`. Ask it to list each premise behind its recommendation in `evidence`, marked checked at a source or taken as given; count agreement as independent only on checked premises. The advisor never implements, never writes under the repository, never judges a result it advised on, and never spawns agents; if it cannot answer from the given material, it returns `unknown` and names the missing check.

For a Claude-hosted external Codex advisor, use the selected model and the sibling's five-field schema in the first prompt; continue that same thread with `RESUME: <threadId>` above it, writing successive answers under `<run>/<id>-2/report.json`, then `-3`:

    MODEL: <selected model short name>
    OUTPUT_SCHEMA: <the five-field schema file the sibling ships>
    TASK: <neutral question, relevant facts, uncertainty and constraints>

## The record, because the advisor is an experiment

After each answer, write what changed and why beside the private pre-question decision. The synthesis names the decisions the advisor changed, their outcomes, and the advisor's turns and tokens beside the run's. Protocol E3 of the experiment skill measures a standing advisor against per-call advice and no advice; until it runs, this page states no benefit: the 2026-09-17 research found no source measuring a standing advisor thread, and that round's retrospective priced a continued thread at 1.23 times a fresh agent.
