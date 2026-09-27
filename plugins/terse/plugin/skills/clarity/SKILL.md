---
name: clarity
description: >-
  Reader-side checks Claude can apply while writing an answer, plan, report, commit, PR, code comment,
  team message, agent brief, or an agent's result for a person. It can be invoked automatically or as
  /terse:clarity. No agents or run directory. Skip a one-word acknowledgement or a purely instrumental
  step. For a standalone document requested by its owner, use rethink, rewrite, or audit.
when_to_use: >-
  Before writing or revising text for a person or another agent, including chat replies, plans,
  reports, code comments in files, commits, PRs, messages to colleagues, tasks for agents, and
  summaries of their results. Apply it to the next text without imposing a template; read a genre
  note only when that genre is at hand.
metadata:
  version: "0.2.0"
license: MIT
---

Use these questions while writing for someone else. This page starts no agents or run. Once loaded,
use it while it remains in context. The questions need not appear in the answer. Open a linked note
only when it helps the text at hand.

## Before writing

1. Who will read this, and what do they know? Use the actual recipient.
2. What will they do with it now: understand, decide, approve, act, or pass it on? A reply that merely
   confirms a tool step may need no prose.
3. Where will they read, render, copy, or paste it? The destination sets its context needs.

## While writing

Ask when it matters; no line has to satisfy all six.

1. **What will this reader do with this line?** Keep what helps them understand, decide or act. Use few words per thought without dropping a point. Say a thought once unless a separately read decision point needs it again; keep a needed deletion list. See [the reader](../../references/rules.md#the-reader).
2. **Was this checked, and against what?** Match a claim to its evidence and a warning to its actual consequence and required action. Keep a real limit at the decision; prefer an honest range to false precision. See [truth](../../references/truth.md) and [where the reader acts](../../references/rules.md#where-the-reader-acts).
3. **What does the reader need to judge this?** Give the reason, concrete change and effect when they matter. In reports and recommendations, put the conclusion before detailed evidence. A small real case can make an abstract claim useful. Offer options and a recommendation only for a real choice; ask directly for one missing fact. See [examples](../../references/examples.md).
4. **What do I hold that they do not?** Explain a label from earlier and use the reader's term; keep an exact technical term when they need it to search or act, and explain it. Make transferred text self-contained. Put a conclusion needed later in the artifact its next reader will open. See [the reader](../../references/rules.md#the-reader).
5. **How does this project already do it?** Start from good nearby examples for a commit, PR or comment, without copying their section lists. Will a number, version or comment still help the next reader? Name the scope of a fact likely to change.
6. **Would a colleague say this naturally?** Use phrasing and formatting that fit this language, reader and genre. A brief answer may stay brief; punctuation, emphasis and brevity are tools, not bans. See [a pleasant read](../../references/rules.md#a-pleasant-read).

## After writing

- Did I answer each point the person raised, whether by applying it, answering it, or declining it
  with a reason? Several points may fit in one short answer.
- Is the conclusion visible before the supporting detail when the reader needs a decision?
- Does each factual or numerical claim say no more than the evidence supports, with the comparison
  named where it changes the conclusion?
- Can the recipient tell what changed, from what to what, and why that matters to them?
- Is any warning proportional to the consequence and the action required of this recipient?
- Can this text be read, copied, or forwarded in its destination without missing context or an
  unexplained internal label?

For a later objection, follow the [owner-feedback brief](../../references/roles.md#13-owner-feedback).

## Genres and larger texts

Open the relevant note when writing a [code comment](../../references/genres/code-comments.md),
[commit title](../../references/genres/commit-title.md),
[PR description](../../references/genres/pr-description.md),
[team message](../../references/genres/team-message.md),
[relayed result](../../references/genres/relayed-result.md), or
[agent brief](../../references/genres/agent-brief.md).

For a standalone document, name the suitable deep skill: [rethink](../rethink/SKILL.md) agrees its shape,
[rewrite](../rewrite/SKILL.md) writes it, and [audit](../audit/SKILL.md) measures it. The user starts
those skills; clarity only points to them.
