# Where this run went wrong (coordinator, 2026-11-26)

The run that designs skill-creator is itself a skill-creation run, so its own failures are observations for the
skill. Each row below is a decision the owner had to raise after a design existed. The owner's corrections are
paraphrased in neutral words; the messages themselves are private. Facts first, then my reading.

## Observations: decisions the owner had to raise after the design existed

The original table's first column gave the number of the owner's message in this run. It is dropped here, because
those numbers address private files; the rows keep their order.

| Owner's correction (paraphrased) | What the design had | When it could have been settled |
|---|---|---|
| The goal is a skill for creating and developing skills in general, not feedback collection | the coordinator offered prepare-feedback's scope and "a skill from one session" as readings | before any design: the goal in the owner's words |
| Experiment rationally; ask no questions that can be settled otherwise; use no crutches | none (this set the goal) | none |
| The agent can export the transcripts itself | the coordinator asked the owner to confirm in five sessions instead of using its own tool | at planning: what the agent can do itself |
| Use subagents and take the coordinator's role | the coordinator weighed cost instead of delegating | at planning |
| The skill belongs in the entrust plugin; test it fully, with the main spend on Sonnet | asked as Q1/Q2 (legitimate questions, asked late) | at the start, with the requirements |
| The skill must be universal, not bound to the Claude CLI; how to run a CLI is in the adapters | test and approach bound to `claude -p` | requirement "which hosts", and "reuse the repository's own mechanisms (adapters)" |
| The name is odd; use the one the standard uses | `develop-skill`; the standard name rejected for a clash | requirement "follow the standard / prior art naming" |
| An agent can invoke the skill; nobody needs to call it by hand | explicit-only, chosen to avoid trigger measurement | requirement "who invokes it" |
| For the tests, Fable should write the skill | the writer was a Sonnet worker | at planning: who writes what is tested |
| (first of the two messages) Does the skill really regulate how a skill is created and what text goes into it, as a procedure? Add an architecture critic | a change-management cycle; authoring left to a page the install cannot link; no architecture critic | requirement "what the skill must regulate", derived from the goal |
| (same message) Use critics of architecture, of approach and of quality here too, with a clean context, on Fable | one critic "of what can go" | requirement "which critics, when, which tier" |
| (same message) Even now the agent makes fundamental gaps; the skill must tell the agent to use references, to analyse the request correctly and to ask the right questions, and must say so in its text | no requirements step; references used in the run but not prescribed by the skill | none |

## My reading (level 2)

- **The design started from evidence of failures, not from the goal's requirements.** Two readers, one of the
  repository's records and one of the owner's sessions, were asked what went wrong before; nobody first wrote
  what the skill must make an agent do (create a skill: its job, its structure, its text; and develop it). The
  design then grew around the evidence it had (measurement, keep or revert), and the first ask, how to create and
  write a skill, became one sentence.
- **Each late correction is a requirement that a short list of questions at the start would have surfaced:** who
  invokes the skill; on which hosts and through which existing mechanisms; what name the standard uses; what the
  skill must regulate (creation, structure, text, evolution); which critics and which tier; who writes what is
  tested; what the agent can do itself versus what needs the owner.
- **References were used well in the run** (five skill-creators, the repository's own records) **but nothing in
  the skill prescribes it**, and the design rejected parts of them (the standard name, agent selection) on the
  designer's own reasoning against the convention.
- **The run anchored**: each round revised the previous design instead of re-deriving it from the requirements; a
  fresh critic with only the requirements was first used in round 5.
