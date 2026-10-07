# Incidents behind the rules

The measurements behind this adapter's rules.

## Writes under the data directory

2026-09-08: a headless session refused a Write, a `mkdir` and a shell redirect under the plugin's data directory
as a sensitive file, with no prompt anyone could answer, so a coordinator told to make the run directory itself
stopped at the first agent. The driver, handed the same path as an argument, wrote it unopposed, and a Claude
agent pointed at that directory met the same refusal as the coordinator.

## Waiting for background agents

- 2026-09-26: a background agent's return arrived as its message and then its completion notification, with no
  tool called to wait for it.
- 2026-09-27: in an interactive session, agents left alive at the end of a turn went on, and each completion
  arrived as a turn of its own.
- 2026-09-08: a headless session killed its background tasks when its turn ended.

## A Workflow hid an early exit

2026-09-08: an agent in a Workflow exited at minute 9, and its exit surfaced only when the user asked, while its
sibling ran 18 minutes. A Workflow reports nothing until its last agent returns.

## Explicit-only skills

2026-09-29: the Skill tool loaded an explicit-only skill in each of 13 turns whose user message typed its
command, and refused it in each of 6 that did not.
