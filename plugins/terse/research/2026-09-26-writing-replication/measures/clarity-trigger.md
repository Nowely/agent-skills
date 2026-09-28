# Does Claude choose `clarity`? Trigger runs, 2026-09-27

Every run asked whether a fresh Claude session calls `Skill terse:clarity` before it answers, on tasks
where the skill fits (positives) and on two or more where it does not (negatives). All ran on Claude Code
2.1.280 with terse 0.2.0; only the skill's `description` and `when_to_use` changed between runs.

## The three descriptions

- **first**: the fields at `970b31e` (`git show 970b31e:plugins/terse/plugin/skills/clarity/SKILL.md`).
  They ended with "Skip a one-word acknowledgement or a purely instrumental step".
- **second**: written by Codex Sol W6 and corrected by Codex Astra C4. It named short texts written
  during coding, from commit titles to review comments, and told the model to check silently when only
  the finished text is asked for. It never reached a commit; its fields were:
  > Reader-side checks when drafting or revising text for a person or another agent, even a single line
  > written during coding: commit titles, changelog entries, docstrings, code and review comments, PR
  > descriptions, captions, messages, plans, reports, and findings relayed from tools or agents. Claude
  > can choose it automatically, or you can call /terse:clarity. It starts no agents or run directory.
  > Apply the checks silently when asked for only the finished text; keep the requested format. Skip bare
  > acknowledgements and steps that only run tools, change identifiers, or copy existing output. For a
  > standalone document requested by its owner, suggest rethink, rewrite, or audit; the user starts them.
  >
  > *when_to_use:* Before drafting or revising words a reader will use to understand, decide, or act,
  > including within a code workflow or its output. Short artifacts and comments still qualify when the
  > reply must contain only the artifact. Check what the text says, what supports it, and how it fits its
  > destination. This includes feedback on a diff, text beside code, a change note, and a summary passed on
  > from an agent. Read a genre note only when that genre is at hand.
- **final**: the second, plus a reply to the user in chat that explains in the writer's own words what an
  agent, test or tool found (Codex Sol W7, corrected by Codex Astra C6). It is the text in
  `plugins/terse/plugin/skills/clarity/SKILL.md`.

## Environments

- **official**: `claude plugin eval` through `evals/clarity-trigger.official.mjs`, a clean configuration
  with no user instructions and terse as the only plugin, three runs per case. The kept traces of the
  evening runs name Claude Opus 5.5; the morning run kept none, so its model is not recorded.
- **live**: `evals/clarity-trigger.live.mjs` in the owner's ordinary profile, with their `CLAUDE.md` and 65
  other skills, hooks and MCP off, on Claude Fable 5.1. The main measure is a call before the answer or the
  first target action; a run is excluded when it tries a tool outside its case's policy.

## Results on the fourteen cases

A cell is calls before the answer over counted runs; for a negative, calls over runs.

| case | official, first (morning) | official, first (control) | official, second | official, final | live, first | live, second | live, final | live, no plugin |
|---|---|---|---|---|---|---|---|---|
| issue-answer | 3/3 | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/1 |
| failed-check | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/1 |
| plan | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/1 |
| owner-report | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/1 |
| commit-title | 0/3 | 0/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/1 |
| pr-diff | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/1 |
| code-comment | 0/3 | 2/3 | 3/3 | 3/3 | 3/3 | 2/3 | 3/3 | 0/1 |
| team-message | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/1 |
| agent-chat-brief | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2/2 (+1 excl.) | — (+3 excl.) | — (+1 excl.) |
| agent-task-file | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/1 |
| agent-result | 0/3 | 1/3 | 2/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/1 |
| review-comment | 0/3 | 2/3 | 3/3 | 3/3 | 3/3 | 2/3 | 2/3 | 0/1 |
| acknowledge (neg.) | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | — |
| status-done (neg.) | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | — |
| **positives** | 24/36 | 29/36 | 34/36 | 36/36 | 36/36 | 33/35 | 32/33 | 0/11 |
| **negatives called** | 0/6 | 0/6 | 0/6 | 0/6 | 0/6 | 0/6 | 0/6 | — |
| cost, USD | 4.01 | 4.04 | 4.44 | 4.34 | 14.62 | 15.11 | 15.19 | 3.63 |

The strict live measure, a call before any text at all, was 9/36, 6/35 and 10/33 for the first, second
and final descriptions: in most live runs the model writes a line before it calls the skill.

## Held-out cases

Codex Luna agents wrote them from genre names alone, without the descriptions or `cases.json`:
`evals/clarity-trigger/holdout.json` before the second description was measured, and
`holdout-relay.json`, relays to the user and to a named third person, before the final one was written.
The critic of the final wording read `holdout-relay.json` to check that no phrase was copied, so that set
is held out from the writer but not from the critic.

| holdout case | first | second | final |
|---|---|---|---|
| commit-title-h1 | 0/3 | 3/3 | 3/3 |
| commit-title-h2 | 0/3 | 3/3 | 3/3 |
| code-comment-h1 | 0/3 | 3/3 | 3/3 |
| code-comment-h2 | 1/3 | 3/3 | 3/3 |
| review-comment-h1 | 3/3 | 3/3 | 3/3 |
| review-comment-h2 | 3/3 | 3/3 | 3/3 |
| agent-result-h1 | 1/3 | 2/3 | 3/3 |
| agent-result-h2 | 2/3 | 1/3 | 3/3 |
| identifier-rename-h1 (neg.) | 0/3 | 0/3 | 0/3 |
| verbatim-output-h1 (neg.) | 0/3 | 0/3 | 0/3 |
| **positives** | 10/24 | 21/24 | 24/24 |
| cost, USD | 2.47 | 2.73 | 2.78 |

| relay case | first | second | final |
|---|---|---|---|
| relay-user-h1 | 3/3 | 3/3 | 3/3 |
| relay-user-h2 | 2/3 | 2/3 | 3/3 |
| relay-user-h3 | 2/3 | 2/3 | 3/3 |
| relay-third-h1 | 3/3 | 3/3 | 3/3 |
| relay-third-h2 | 3/3 | 3/3 | 3/3 |
| relay-third-h3 | 3/3 | 3/3 | 3/3 |
| **positives** | 16/18 | 16/18 | 18/18 |
| cost, USD | 1.78 | 1.79 | 1.83 |

## What this shows

- In the clean environment the final description was chosen in 78 of 78 positive runs across the three
  sets and in none of 12 negative runs. On held-out prompts the second description beat the first,
  21/24 against 10/24 (one-sided Fisher p = 0.001), so the gain is not a fit to the fourteen cases.
- The same description varies between runs: the first scored 24/36 in the morning and 29/36 in the evening
  on identical cases. A single run of three per case cannot separate descriptions that differ by a case or two.
- In the owner's environment the final description was chosen in 32 of 33 counted runs, and in none of 6
  negatives. The three `agent-chat-brief` runs are excluded because the model tried to message a real
  agent (E55); each had called the skill first.
- Relays addressed to a third person were chosen 18/18 under the first and second descriptions and those
  addressed to the user in chat 14/18. That supports, without proving, the reading that the model treated a
  reply to the user as outside "text for a person"; the final description names that reply and scored 9/9.

## Not measured

Whether the texts get better when `clarity` loads (a blind comparison is prepared, not yet read); other
models than Opus 5.5 and Fable 5.1; long sessions with compaction; how often the skill loads in real work.

The analyst's proposed release threshold was at least 33 of 36 in each environment, every positive case
at least 2 of 3, and no negative call.
