# Incidents behind the rules

The measurements behind orchestrate's SKILL.md. A line there keeps its rule and the date of the measurement, or a
link to its section here; this file keeps what happened.

## Writes under the data directory

2026-09-08: a headless session refused a Write, a `mkdir` and a shell redirect under the plugin's data directory
as a sensitive file, with no prompt anyone could answer, so a coordinator told to make the run directory itself
stopped at the first agent. The driver, handed the same path as an argument, wrote it unopposed, and a Claude
agent pointed at that directory met the same refusal as the coordinator.

## A read agent asked for a file

2026-09-08: a read agent whose brief demanded a file spent its whole turn asking for an approval the driver
refused, and the run ended at exit 6 with nothing written and nothing answered.

## Nineteen of twenty on one broken path

2026-09-12: one broken path reached every brief of a twenty-agent fan-out, and nineteen of the twenty verdicts
answered that path. The page's bulk unit keeps the brief out of the verdict set for this reason, and a unanimous
fan-out is read as evidence about the prompt first.

## Waiting for background agents

- 2026-09-26: a background agent's return arrived as its message and then its completion notification, with no
  tool called to wait for it.
- 2026-09-27: a poll on the driver's `exit` marker woke with one line even after the wrapper had handed back
  `RUNNING=`.
- 2026-09-27: in an interactive session, agents left alive at the end of a turn went on, and each completion
  arrived as a turn of its own.
- 2026-09-08: a headless session killed its background tasks when its turn ended.
- 2026-09-17: a foreground call's hand-back arrived inside the same turn.

## A Workflow hid an early exit

2026-09-08: an agent in a Workflow exited at minute 9, and its exit surfaced only when the user asked, while its
sibling ran 18 minutes. A Workflow reports nothing until its last agent returns.

## The split critique

2026-09-12: the split critic caught two claims that were true at one release and false at the next, and they
never reached the fan-out.
