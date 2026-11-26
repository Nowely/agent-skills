# What the skill is made of

A host shows the agent every skill's name and description all the time, loads the body of `SKILL.md` when the
skill is selected, and opens any other file only when a step sends the agent to it. The approach, the layout
and the budgets follow from that.

## The approach

Go through the sheet's requirements and stages and give each one what meets it:

| The requirement needs | What meets it |
|---|---|
| a job that an existing skill owns | that skill, extended; no new skill |
| the same code on every use, or a result that must come out the same each time | a script the agent runs |
| knowledge the agent looks up while it works: a schema, an API, a policy | a reference file, and a line in `SKILL.md` that says when to read it |
| a sequence, or a judgement the agent gets wrong without help | instructions: steps in `SKILL.md` |
| something the agent already does unprompted | nothing: no line is written for it |

An existing skill owns the job when three things hold: it lives where this skill would live, the user can edit
it, and it serves the hosts on the sheet. Extend an owner when the requirement fits the job its description
states. Extending is the
Change route on the owner, or Create's rewrite when its text no longer fits. Create a new skill only when the
sheet shows a job the owner cannot do without taking on a second one. This holds for a request to make a skill
like the one you are reading. A skill the user cannot edit,
or one made for a single host when the sheet names more, is a rival: step 2 takes from it as a source, and
[a selection check](checks.md#a-selection-check) lists it beside the new skill.

Write the approach in ten lines at most: which requirements and stages go to which row, the reason, and the
strongest alternative you rejected. If every one lands in the last row, there is no skill to write; say so in
the plan.

## The layout

Decide the files before the sentences. Each requirement goes to exactly one file.

| File | Holds |
|---|---|
| `SKILL.md` | the steps in the order of the work, the rules that hold for the whole session, and the routing: which file to read or run at which step |
| `references/<topic>.md` | what one step needs and the others do not: a table, a schema, a long procedure, one variant of several. `SKILL.md` links it at that step and says when to read it |
| `scripts/` | work repeated on every use, or work that must come out the same each time. `SKILL.md` names the command; the agent runs the script and does not read it |
| `assets/` | files that go into the output: a template, an image, a starter project |

- A skill that serves several variants, such as providers, formats or domains, gives each its own reference,
  and `SKILL.md` chooses between them.
- A skill whose whole text fits the budgets and has no detail that only one step needs is a single `SKILL.md`.
- Create no file that no step reads or runs.
- Link only to files an install copies: the skill's folder and the skills beside it, and for a skill in a
  Claude Code plugin, at `<plugin>/skills/<name>/`, the rest of the plugin's folder. Nothing else of a
  repository arrives, so any other link is dead on arrival.
- Write the skill in a folder that has its final name, in the place the sheet gives it, so that its links to
  neighbouring files open.

## The budgets

| What is limited | Why |
|---|---|
| `name`: its characters, its length, and that it is the folder's name | the open specification; a host refuses or renames anything else |
| `description`: its length | the open specification sets a limit, and each host's listing has its own |
| the body of `SKILL.md`: its lines and its characters | it is loaded whole on every use, and a host that compacts a long session keeps only its start; a rule past that point is gone |
| a reference file: linked from `SKILL.md` itself | a file reached only through another file is often read in part, and one that nothing links is never read |
| a long reference: a contents list at its top | an agent previews the top of a file and must see what the rest holds |
| a link: forward slashes, and a file or heading that exists | a backslash fails outside Windows; a dead link stops the reader |

The check script of Create's step 6 owns the numbers. It checks every row of this table and prints each limit
with what the skill uses of it. [hosts.md](hosts.md) says which host each number comes from.
