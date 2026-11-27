# The check

This page has [choosing the check](#choosing-the-check), [the sessions](#the-sessions),
[a dry run](#a-dry-run), [test cases](#test-cases), [a transfer test](#a-transfer-test) and
[a selection check](#a-selection-check).

## Choosing the check

Take every row whose claim the user's request makes.

| The work claims | The check that can fail | It starts |
|---|---|---|
| a script now enforces a rule | a test that fails when the change is taken out | nothing |
| nothing was lost in a cut, a move, a merge or a rewrite | [Change's step 8](../SKILL.md#change) exits 0; each fact its dispositions call moved is found, in the words the disposition quotes, at the step where the reader meets it; and one fresh reader answers scenarios written from the old files | one agent |
| a literal reader can follow the skill: a route, a step, an order | [a dry run](#a-dry-run); for a change, once before and once after | one agent per run |
| an agent acts differently with the skill: an instruction added or reworded, or a new skill when the user asks for runs | [test cases](#test-cases), with the skill and without | two sessions per case, and one reader |
| the skill carries a practice: an agent with only the pages does what the practitioner did | [a transfer test](#a-transfer-test), on the pages before and after | its sessions, one agent to build the material, and one confirmer |
| one of two approaches serves the goal better | the same test cases under each approach, the statements written first | two sessions per case, and one reader |
| the description selects the skill: a changed name or description, or a new skill when the user asks for it | [a selection check](#a-selection-check) | its sessions, for each host |

Size the check to the work. A change to one step takes one case. A new skill takes the dry run, and when the
user asks for runs, one test case for each stage of the walk that its instructions cover, up to three. A
selection check for a reworded description runs each request once, about twenty sessions for each host, and has
no second run. When the user caps the spend below that, keep every check in
the plan, in the order of the decision each can change, and say which ones the cap leaves unrun and what each
would have shown. With no run at all, the quality critic's read is the only evidence, and the result says so.

## The sessions

- Start each session through what the repository has for starting sessions, on this host too; in entrust that
  is orchestrate's [call page](../../orchestrate/references/external.md) with the host's adapter. Where the
  repository has nothing, start it as an agent of this host. The plan names which. Run every case on the
  cheapest model the sheet says will load the skill, and one case once more on each other model on the sheet.
  A session on a host this one cannot run is started only when the user named that host. A model or a host on
  the sheet that got no session is named in the result as unmeasured.
- The skill reaches a session as files: give it the path of `SKILL.md` and tell it to read the file whole and
  follow it. A session that runs without the skill gets neither the path nor the skill's name.
- Give each session its own copy of the working tree, so that nothing it writes enters the skill or the
  repository. No case performs an action that cannot be undone or that leaves the copy, such as a tag, a push,
  a release, a publication or a message sent: the case stops before it, and the plan says what the check
  therefore cannot show.
- No session receives the statements it is marked by or the finding you expect.
- A session has no user. A question it asks appears in its return; count it as an event and do not answer it.

## A dry run

1. At step 5, write one request the way a user would type it, from the middle of the sheet's job.
2. At step 8, start one fresh agent on the cheapest model the sheet says will load the skill, briefed by
   [the form](critics.md#every-brief) with this section as its role and the sheet under `Do not open`. Give it
   the path of `SKILL.md` and the request, in a file. Tell it to walk the request through the files as written, to run nothing, and
   to report each step where it halts, has to guess or can read a line two ways, with the file and line. For a
   change, start the same walk at step 5 as well, on the skill as it was, and compare the two reports.
3. The work is kept when the walk reaches the end with no halt and no guess at a stage the sheet's walk covers.

## Test cases

1. Write each case as a request the way a user would type it: concrete, with the file names, the context and the
   detail a real request carries. Make one of them the request on which following the skill costs the agent
   most. Take none from the run that prompted the work.
2. Before any run, write for each case what a good result is, as statements a reader can mark `true`, `part` or
   `false` with a place, and write in the plan's rule how `part` counts; unsaid, it counts as `false`. A
   statement is about the result. Where the claim is about what the agent does on the way, such as a
   question it asks or a step it skips, the statement names an event the transcript shows, never the agent's
   wording.
3. Run each case once with the skill and once without it, on the same model with the same inputs. For a change,
   "without" is the skill before the change.
4. Have one fresh reader mark each statement for each run, with the place that shows it, not knowing which run
   is which, briefed as [the check's reader](critics.md#the-checks-reader). Then have the marks confirmed and
   compute the verdict as [handling a return](critics.md#handling-a-return) says. Read the transcripts as well, for a file of the skill no session opened and a step every session
   skipped; each is a finding for the result.
5. A statement that every run passes measured nothing. Report it so and count it for neither side.
6. Code that every session wrote for itself is a finding for the result: a script the skill should carry.
7. A difference between two versions counts only when it is larger than the difference between two runs of the
   same version. Run the unchanged skill twice to learn that difference.

## A transfer test

It answers whether the pages carry a practice to a reader who was not there. It judges by what comes of the
reader's work, not by how far that work resembles the practitioner's: a page that holds a template is copied
by any model, and resemblance then measures copying.

1. At step 5, have a fresh agent that has seen neither the pages nor
   [the practice file](analysis.md#a-practice-someone-already-performs) build the material: for each kind of
   artifact, a small scenario with answers known in advance, such as a fault planted in a text, and a key that
   lists them. A second fresh agent, with the key, confirms each answer can be found from the scenario; one
   that cannot is replaced. Both write to files you pass on by path and do not open before step 8, since you
   may be the one who writes the pages; any other writer of the pages is not given them either.
2. Write the rule now: how many of the known answers each run must reach, and by how much the pages as they
   will be must beat the pages as they are.
3. At step 8, start sessions on the cheapest model the sheet says will load the skill. Each gets the path of
   `SKILL.md`, one scenario and one line: which step it is at, which artifact to write, and to start nothing.
   Two sessions for each scenario on the new pages, one on the pages as they were.
4. Use each artifact as it would be used: a brief is given, unedited, to a fresh agent with the scenario; a
   review is applied; a plan is carried out. Count the known answers that come back, each confirmed at its
   place as [handling a return](critics.md#handling-a-return) says.
5. Decide by the rule. A margin counts only above the difference between the two runs on the new pages. When
   the pages as they were already reach the rule, the result is `not needed`: the gaps were not gaps.
6. Report beside it, deciding nothing: which things of the catalogue each artifact holds, and what the
   sessions said they were unsure of. The second is where the next correction starts.

## A selection check

1. Have an agent that has seen neither the description nor any earlier case write the requests: about ten the
   skill is for, in varied wording, some that never name the skill, and about ten near misses, which share the
   skill's words and need something else. Fewer leaves each kind of request with one example.
2. Make the session's list of skills the one a real user has: this skill, and every rival that
   [structure.md](structure.md#the-approach) sorted out in step 2, the host's built-in ones included. A rival
   of the same name is the nearest. If the sessions cannot be given a rival to list, say in the result that
   selection beside it is unmeasured.
3. Run each request three times, because a single run of a request varies: about sixty sessions for each
   host. Use the host's own tool for this where [hosts.md](hosts.md) names one; otherwise start sessions as above, each given the request alone. Record
   which skill was loaded before the answer or the first action: this one, a rival by name, or none.
4. Report the fraction for each request, and every request a rival took. Run the same set a second time: a
   margin over a rival, or over an earlier description, that is smaller than the difference between those two
   runs is reported as undecided.
5. Requests the skill is for that did not select it are [a correction](../SKILL.md#a-correction): rewrite the
   description from them by [writing.md](writing.md#the-description), have a new set written, because a set its
   writer has seen no longer tests it, and run once more.
