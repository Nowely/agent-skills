# Analysing the request

A requirement missed here is missed by everything built on it: the approach, the text, and every judge that is
handed only that text. This page has [the sheet](#the-sheet), [the sources](#the-sources),
[a practice someone already performs](#a-practice-someone-already-performs) and [the questions](#the-questions).

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
- Leave `met at` empty until the text is written.
- A thought the user offers without asking for it, such as "maybe", "what if" or "a side idea", is a line too,
  marked `idea` in place of `stated`. [A close-out](../SKILL.md#a-close-out) gives it an outcome before delivery.

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
| Which hosts and models load it | any host of the open format: a fact that holds on one host only is written with that host's name, in one place |
| Its name | the name the sources use for this job; else a short name that starts with the action |
| Where it lives | where the user said; else beside the skills of the plugin or repository it belongs to; else the host's folder for personal skills |
| What it uses and touches outside its folder, and what in it is private | it uses what the repository already has for the purpose and adds nothing new; it changes nothing outside; it carries no private material |
| How the result is delivered, and who writes that text | as the repository's instructions say; else the files in place and the result message. The text is written by whoever writes the skill, unless the user names another |

A decision is open when none of the four answers it, when two of them disagree, or when the default would go
against a requirement or against what the sources share. An open decision whose answer would change the
approach, the layout or the check becomes a question. Any other takes the default, and the plan shows it.

## The sources

Read these before the approach is chosen.

1. Skills that already do this job or a neighbouring one: in the repository, among the skills installed on the
   host, its built-in ones included, and among the examples the host's vendor publishes.
   [hosts.md](hosts.md) says where each host keeps them and how a built-in one is read.
2. What a skill is: the [open specification](https://agentskills.io/specification), and the guide of each host
   on the sheet, whose address is in [hosts.md](hosts.md).
3. The material the skill is to carry: the documents, schemas and procedures the user named. With them, the
   repository's instructions and its records of this job: what was tried, kept and reverted.
4. The user's own experience of the job. When the work was done in this conversation, the conversation is the
   first source. Otherwise it is the sessions where the job was done or went wrong. When the user named none
   and the host has no tool that finds them, ask in the plan where they are and go on with the other three
   kinds.

Record one row for each source, in a table beside the sheet, and one line for each of the four kinds that says
what was read and what could not be:

```text
source, with its path or URL and line | its version or date | read on | read whole or in part | taken | changed, and why | left out, and why
```

Then do four things with what you read.

- For each stage of the walk, write which sources give steps for it. A stage that a source regulates and the
  sheet lacks is added to the sheet.
- Write what the sources share, such as a name, a default or a layout. That is the convention, and it fills the
  decisions the user's words left empty. Departing from it takes a requirement that says so; without one, the
  departure is a question.
- Sort each skill you found into an owner of the job or a rival for it, as
  [structure.md](structure.md#the-approach) defines them. Each part you carry over from such a skill gets a row
  of its own: the part, its place there, and what you changed.
- Where you copy text and do not adapt it, name the source's licence in its row and keep its notice with the
  copy.

A source that does not open is fetched another way: another tool, a copy in the repository or on disk, a reader
agent. Only when every way has failed is it recorded as `not read`, with the ways tried, and what it would have
settled goes into the plan as a question. A source is cited only after it was opened.

A source too wide to read in this session, such as a corpus of sessions, is read now by reader agents, not
later. Tell the user their number and their model before they start;
[critics.md](critics.md#which-model-and-how-many) gives their tier. Give each reader the messages file, the
sheet and this question: "What did the user require, correct or reject about this job? Quote each item and give
its address." Have a stronger model read again any part whose return contradicts the sheet. Step 3 waits for the
readers; with no user attached, step 3 names them in the plan and they run after it is accepted.

## A practice someone already performs

Sometimes the job the skill is to carry is already done well by a person or an agent, and the skill exists so
that others do it the same way. What they do is then a source, and it is not in their head or yours: someone who
does a thing well cannot list what a newcomer lacks. Take it from their runs.

Do this when the user asks for it or names the sessions, or when the practice is this run's own. Sessions are
the user's and private: read only the ones they named, and keep what you take in the run directory.

1. Collect, by a command and never from memory, every artifact of the practice from those sessions: each brief,
   each review, each message of the kind the skill is to produce, with what came back from it. Where a session
   cannot be read, record the gap and go on; do not widen the search to fill it.
2. Start one fresh reader, briefed as [every brief](critics.md#every-brief) with this section as its role. It
   reads the artifacts, what came back, and the skill's pages or the draft; nothing of your own account of the
   practice. It writes `practice.md` in the run directory, in four parts:
   - the catalogue: each thing the artifacts do, in how many of them, with one example and its place;
   - what each did, judged by what came back: the place that shows it and how sure that is (1, the text says
     so; 2, an independent reader would agree; 3, it was seen to happen), or `nothing visible`; and what went
     wrong where it was absent;
   - the gaps: for each thing, whether the pages state it, state it in part, lack it or contradict it, with the
     place on the page;
   - each gap written as a line for a reader who was not there: what to do, in the reader's own terms, with no
     name, event or reason that only the run explains.
3. Each gap the pages should close becomes a requirement line of the sheet, with `practice` as its source. On a
   sheet that will be tracked, name the source in neutral words and leave the session's place in the run
   directory. A contradiction between the practice and a page is a question for the plan, never settled
   silently.
4. The check for these lines is [a transfer test](checks.md#a-transfer-test), which step 5 prepares.

A thing in the catalogue with `nothing visible` is carried only when it costs one line; say in the sources
table that it rests on habit.

## The questions

A question is an open decision, put inside the plan of step 3.

- Give the decision, what you read that did not settle it, your recommendation, and the alternatives, each with
  what it changes in the skill.
- Draw the plan under the recommendations.
- Use a term the user has not used only with its meaning beside it.

A choice between two designs that both meet every requirement is not a question: step 3 says how it is
decided. Send a question alone, before any plan, only when the goal
sentence cannot be written without its answer.
