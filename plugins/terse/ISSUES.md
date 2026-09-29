# Defects found in passing: terse

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with entrust's ledger, `plugins/entrust/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E86. `clarity`'s description carries two sentences of instructions that load on every turn (tension)

**Evidence, level 1.** `plugins/terse/plugin/skills/clarity/SKILL.md:3-12`: "Apply the checks silently when asked for only
the finished text; keep the requested format." sits in the description, which Claude Code keeps in context for every
turn of every session, since `clarity` is the one terse skill Claude may choose itself. Anthropic's skill authoring page
puts what the skill does and when to use it in the description and the instructions in the body. House side: the
description was tuned against `plugins/terse/evals/clarity-trigger.*`, and a change to it changes that measurement.
Finding 4.3 of the same map.

**Issue text.** The description spends tokens on every turn on how to apply the checks, which the body could say. Moving
it needs a new trigger measurement.
