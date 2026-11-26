# Analysing the request

A requirement missed here is missed by everything built on it: the approach, the text, and every judge that is
handed only that text.

## The sheet

Write the sheet as a file in the run directory. It has four parts. Beside it, save every message the user wrote
about this skill, corrections included, verbatim and in order; the judges are briefed from that file.

**The goal.** One sentence: who gets what from the skill, in the user's words where they gave them.

**The requirements.** One line for each thing the skill must do or be:

```text
R<n> | the requirement | the user's words, quoted | where they are | stated or inferred | met at
```

- Give every clause of the goal its own line. "Review and merge pull requests" is two lines.
- Mark a line `inferred` when the user did not say it, and name what the reading rests on.
- When a line reads two ways, write both readings. Do not narrow a requirement to the case the user gave as an
  example.
- What the user disliked in an earlier attempt at this job is a requirement: it says what must not happen again.
- Leave `met at` empty. Step 6 fills it with a file and line.

**The job, walked.** Walk the job the skill will serve once, from the request that starts it to the result its
user accepts. Write each stage as a line: what goes in, what comes out, and who judges it. A stage the user's
words do not mention is a line marked `inferred`. Two words in a goal can hide ten stages, and a stage that is on
no line gets no step.

**The decisions.** Every skill settles the decisions in this table, whether or not the user mentioned them. Fill
each from the first of these that answers it: the user's words; the repository's instructions and records; what
the sources of step 2 share; the default in the table. Write beside each answer which of the four gave it.

| Decision | Default |
|---|---|
| The job: which requests the skill serves, what the agent then produces, and what it leaves to other skills | none: it is a question |
| What it governs: for each stage of the walk, whether the skill gives steps for it or leaves it to the agent | steps for every stage; a stage left to the agent names the source that shows agents do it unprompted |
| Who invokes it | an agent selects it by its description, and the user can also call it by name |
| Which hosts and models load it. A host is a program that loads skills, such as Claude Code or Codex | any host of the open format: a fact that holds on one host only is written with that host's name, in one place |
| Its name | the name the sources use for this job; else a short name that starts with the action |
| Where it lives | where the user said; else beside the skills of the plugin or repository it belongs to; else the host's folder for personal skills |
| What it uses and touches outside its folder, and what in it is private | it uses what the repository already has for the purpose and adds nothing new; it changes nothing outside; whatever came from the user's sessions is private |
| How the result is delivered, and who writes that text | as the repository's instructions say; else the files in place and the result message |

A decision is open when none of the four answers it, when two of them disagree, or when the default would go
against a requirement or against what the sources share. An open decision whose answer would change the
approach, the layout or the check becomes a question. Any other takes the default, and the plan shows it.

## The sources

Read these before the approach is chosen.

1. Skills that already do this job or a neighbouring one: in the repository, among the skills installed on the
   host, its built-in ones included, and among the examples the host's vendor publishes.
   [hosts.md](hosts.md) says where each host keeps them.
2. What a skill is: the [open specification](https://agentskills.io/specification), and the guide of each host
   on the sheet, whose address is in [hosts.md](hosts.md).
3. The material the skill is to carry: the documents, schemas and procedures the user named. With them, the
   repository's instructions and its records of this job: what was tried, kept and reverted.
4. The user's own experience of the job. When the work was done in this conversation, the conversation is the
   first source. Otherwise it is the sessions where the job was done or went wrong.

Record one row for each source, in a table beside the sheet:

```text
source, with its path or URL and line | read whole or in part | taken | changed, and why | left out, and why
```

Then do four things with what you read.

- For each stage of the walk, write which sources give steps for it. A stage that a source regulates and the
  sheet lacks is added to the sheet.
- Write what the sources share, such as a name, a default or a layout. That is the convention, and it fills the
  decisions the user's words left empty. Departing from it takes a requirement that says so; without one, the
  departure is a question.
- Sort each skill you found into an owner of the job or a rival for it, as
  [structure.md](structure.md#the-approach) defines them.
- Where you copy text and do not adapt it, name the source's licence in its row and keep its notice with the
  copy.

A source that does not open is fetched another way: another tool, a copy in the repository or on disk, a reader
agent. Only when every way has failed is it recorded as `not read`, with the ways tried, and what it would have
settled goes into the plan as a question. A source is cited only after it was opened.

A source too wide to read in this session, such as a corpus of sessions, is read now by reader agents, not
later. Tell the user their number and their model before they start; they run on the host's ordinary working
model. Give each reader the messages file, the sheet and this question: "What did the user require, correct or
reject about this job? Quote each item and give its address." Have a stronger model read again any part whose
return contradicts the sheet. Step 3 waits for the readers.

## The questions

A question is an open decision, put inside the plan of step 3.

- Give the decision, what you read that did not settle it, your recommendation, and the alternatives, each with
  what it changes in the skill.
- Draw the plan under the recommendations, so that one word accepts all of them.
- Use a term the user has not used only with its meaning beside it.

A choice between two designs that both meet every requirement is not a question: recommend the one that serves
the goal better and show the other in the plan. Send a question alone, before any plan, only when the goal
sentence cannot be written without its answer.
