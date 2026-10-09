---
name: advisor
description: >-
  Runs one requested standing advisor for independent, evidence-based counsel
  through material decisions in the current task.
disable-model-invocation: true
metadata:
  version: "0.28.0"
license: MIT
---

1. Resolve a top-tier advisor through a route the host exposes, preferring the other model family when a route to it exists: in Claude Code, the [codex adapter](../codex/SKILL.md) after its status check; in Codex, the [claude adapter](../claude/references/external.md) after its status check; elsewhere, a native route or an adapter that can confirm the model. The route's model table names the top tier. If the chosen model is unavailable, offer supported alternatives and wait for approval. Show only the selected route and model, plus a constraint that changes the plan.
2. Treat an explicit consultation request, including this invocation, as authorization to launch and complete the advice. Honor a user-selected model. Show the advice scope, route and exact model, then proceed without another approval. Existing authorization covers all material questions within that scope. Get approval again only if the task scope, route or model changes.

Keep research and implementation in separate plans. Return findings, a recommendation and unresolved checks before proposing implementation. A consultation grants no implementation authority; use existing authority or obtain it before edits.

## The advisor

Start one standing advisor before the first material decision and continue the same thread through the task. Ask about every material decision in scope until it is resolved; there is no preset question count or advisor-specific cap. Continue without per-question approval. Stop when the work is resolved or the user says “no advisor”; “ask the advisor” resumes the same thread within scope.

Before each question, privately record the coordinator's provisional decision; do not include it in the advisor brief. Send a neutral question with relevant facts, sources, uncertainty and constraints. Ask one question at a time. The answer gives a recommendation, decisive reasons with premises marked checked or assumed, one alternative, and what evidence would change the recommendation. If a needed check cannot be made, mark it unknown and name the check.

After each answer, record whether the coordinator's decision changed and why. The advisor gives counsel only: it does not edit the repository, delegate work or judge an outcome it advised on. Use an independent reviewer for affected results. The final synthesis states the advice's effect on decisions and any open checks; omit turn counts, token totals, unused routes and private-note paths unless they change what the user should do.

For an external route, follow the adapter's model, effort, continuation and report protocol, including its output schema. Keep transport details out of the user-facing plan.
