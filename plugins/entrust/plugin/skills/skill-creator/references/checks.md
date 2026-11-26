# The check

## Choosing the check

Take every row whose claim the user's request makes.

| The work claims | The check that can fail | It starts |
|---|---|---|
| a script now enforces a rule | a test that fails when the change is taken out | nothing |
| nothing was lost in a cut, a move, a merge or a rewrite | each removed sentence is found where its fact is now defined, in the same words, at the step where the reader meets it; and one fresh reader answers scenarios written from the old files | one agent |
| a literal reader can follow the skill: a route, a step, an order | a dry run: a fresh agent walks one request through the files as written, runs nothing, and reports each step where it halts or has to guess, with the file and line; for a change, once before and once after | one agent per run |
| an agent acts differently with the skill: a new skill, an instruction added or reworded | [test cases](#test-cases), with the skill and without | two sessions per case, and one reader |
| one of two approaches serves the goal better | the same test cases under each approach, the statements written first | two sessions per case, and one reader |
| the description selects the skill: a new skill that agents select, or a changed name or description | [a selection check](#a-selection-check) | about sixty sessions a run, for each host |

Size the check to the work. A change to one step takes one case. A new skill takes the dry run; it takes test
cases as well, one for each stage of the walk that its instructions cover, up to three, when the user asks for
them or when only a run can show that the agent acts differently. When the user caps the spend below that, keep every check in
the plan, in the order of the decision each can change, and say which ones the cap leaves unrun and what each
would have shown. With no run at all, the quality critic's read is the only evidence, and the result says so.

## The sessions

- Start each session as an agent of this host. Run every case on the cheapest model the sheet says will load
  the skill, and one case once more on each other model on the sheet. A model that got no session is named in
  the result as unmeasured. A
  session on a host this one cannot run is started only when the user named that host, through what the
  repository has for starting such a session; in entrust that is orchestrate's
  [call page](../../orchestrate/references/external.md). A host on the sheet that got no session is named in
  the result as unmeasured.
- The skill reaches a session as files: give it the path of `SKILL.md` and tell it to read the file whole and
  follow it. A session that runs without the skill gets neither the path nor the skill's name.
- Give each session its own copy of the working tree, so that nothing it writes enters the skill or the
  repository. No case performs an action that cannot be undone or that leaves the copy, such as a tag, a push,
  a release, a publication or a message sent: the case stops before it, and the plan says what the check
  therefore cannot show.
- No session receives the statements it is marked by or the finding you expect.
- A session has no user. A question it asks appears in its return; count it as an event and do not answer it.

## Test cases

1. Write each case as a request the way a user would type it: concrete, with the file names, the context and the
   detail a real request carries. Make one of them the request on which following the skill costs the agent
   most. Take none from the run that prompted the work.
2. Before any run, write for each case what a good result is, as statements a reader can mark true or false with
   a place. A statement is about the result. Where the claim is about what the agent does on the way, such as a
   question it asks or a step it skips, the statement names an event the transcript shows, never the agent's
   wording.
3. Run each case once with the skill and once without it, on the same model with the same inputs. For a change,
   "without" is the skill before the change.
4. Have one fresh reader mark each statement for each run, with the place that shows it, not knowing which run
   is which. Read the transcripts as well, for a file of the skill no session opened and a step every session
   skipped; each is a finding for the result.
5. A statement that every run passes measured nothing. Report it so and count it for neither side.
6. Code that every session wrote for itself is a finding for the result: a script the skill should carry.
7. A difference between two versions counts only when it is larger than the difference between two runs of the
   same version. Run the unchanged skill twice to learn that difference.

## A selection check

1. Have an agent that has seen neither the description nor any earlier case write the requests: about ten the
   skill is for, in varied wording, some that never name the skill, and about ten near misses, which share the
   skill's words and need something else. Fewer leaves each kind of request with one example.
2. Make the session's list of skills the one a real user has: this skill, and every rival that
   [structure.md](structure.md#the-approach) sorted out in step 2, the host's built-in ones included. A rival
   of the same name is the nearest. If the sessions cannot be given a rival to list, say in the result that
   selection beside it is unmeasured.
3. Run each request three times, because a single run of a request varies: about sixty sessions for each host. Use the host's own tool for this
   where [hosts.md](hosts.md) names one; otherwise start sessions as above, each given the request alone. Record
   which skill was loaded before the answer or the first action: this one, a rival by name, or none.
4. Report the fraction for each request, and every request a rival took. Run the same set a second time: a
   margin over a rival, or over an earlier description, that is smaller than the difference between those two
   runs is reported as undecided.
5. Requests the skill is for that did not select it are [a correction](../SKILL.md#a-correction): rewrite the
   description from them by [writing.md](writing.md#the-description), have a new set written, because a set its
   writer has seen no longer tests it, and run once more.
