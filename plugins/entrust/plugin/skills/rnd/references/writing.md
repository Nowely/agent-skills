# Writing the text

## The order

1. Start `SKILL.md` from [the skeleton](#the-skeleton).
2. Write the steps and the standing rules: one for each requirement and each stage the approach gave to
   instructions. Write beside it on the sheet, under `met at`, the file and line. Each line answers a failure
   that [the baseline](checks.md#the-baseline) or a session showed, or the user's words: a line with neither
   is not written.
3. Write each reference, and link it from the step of `SKILL.md` that needs it.
4. Write each script as [scripts](#scripts) says, and run it.
5. Write [the description](#the-description) last.
6. Read the sheet down its `met at` column. A requirement or a stage with no place is a gap: write its line.
   Then read the text for a line that meets none, and cut it.

## The lines

- Write each step as an instruction with what goes in and what must come out. Where several methods reach the
  result, leave the method to the agent.
- Fix the method only where a wrong one destroys something or the result must come out the same each time, and
  give the reason on that line.
- Name what to run, read or install by its exact command or path.
- State a fact in one file, at the step that uses it. Everywhere else, link it.
- Leave out what the agent does without being told. [The baseline](checks.md#the-baseline) of step 5 shows
  what that is.
- When a sentence is untrue in some case, cut it back, or make the case a condition the agent can observe. Add no
  tail such as "unless", "usually" or "where appropriate".
- Give a case that needs different steps its own route or its own reference. Do not hang it as a clause on a step
  written for another case.
- Put a rule that holds for the whole session with the other standing rules, before the steps.
- Use no capitals and no bold for emphasis; a rule's reason carries its weight.
- Give a term the reading agent may not know its meaning at first use, and use one word for one thing
  throughout.
- Keep out measurements with dates, the story of how the skill was made, and a rule fitted to one run's
  particulars, its names, files or figures, where the failure's kind has no second case.
- Keep out a value that was true when you read it and will change, such as a count or a latest
  number: give the command that reads it, or leave it out. Such a value goes on a page only on
  the user's word.
- Give an output's form as a template. Give one example only where a rule cannot say it, and take it from
  neither the check's cases nor the run that prompted the work.

## The description

Write it from the sheet's decision on the job. Say what the skill does and which requests it is for, in the
words a user would type, the main use first: [hosts.md](hosts.md) shows how each host cuts a description that
runs long. Write in the third person, because the description is placed in the agent's own instructions. Do not
summarise the steps: an agent that reads a summary follows it and leaves the skill unread. Name what the skill
is not for only where such a request is likely to be routed to it.

```yaml
description: Extracts text and tables from PDF files, fills PDF forms and merges PDFs. For work on PDF documents, forms or document extraction.
description: Helps with PDFs.
```

The first selects; the second gives an agent nothing to match a request against.

For a skill that only the user invokes, say what it does and stop, and set the field its host has for that,
from [hosts.md](hosts.md).

## Scripts

A script asks nothing while it runs, handles the errors it can and says what failed for the rest, and has
everything it needs installed named in `SKILL.md`.

## The skeleton

Start a new skill from this, and delete every line you do not fill:

```markdown
---
name: <skill-name>
description: <what it does, and the requests it is for>
---

<The result this skill produces, and what it leaves to others, in three sentences at most.>

## Standing rules

- <A rule that holds through the whole session, with its reason.>

## The steps

1. **<First step>.** <Instruction. What goes in, and the result it must produce.>
2. **<Next step>.** <Instruction.> For <a variant or a detail>, read [<topic>](references/<topic>.md).
3. **<A step with fixed work>.** Run `<command> scripts/<name>` with <inputs>.
```

## Rewriting an existing skill

Before the sheet of step 1, list every instruction, fact and case the skill's files handle, each with its file
and line, and mark each keep, move or cut; a move names the file that will own it. Every line marked keep or move
joins the sheet as a requirement. Write the scenarios of the "nothing was lost" row of
[checks.md](checks.md#choosing-the-check) from the old files now, before any edit.
