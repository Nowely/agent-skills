# Part A: the four sessions on E104

Case E104 (`plugins/entrust/ISSUES.md`): two pages state which effort a role gets over the default and differ on
refutation; "decide which effort a refuter gets, then keep the rule in the model table and have the parity
reference link it". The pages are `plugins/entrust/plugin/skills/codex/references/parity.md` (an effort table,
lines 84-91 at the base commit `aa40ba0`) and `.../codex/references/models.md` (the tier table). The sessions
answered in Russian; their content is rendered here in English. Terms are those of
[02-test-protocol.md](02-test-protocol.md) part A (M0a to M7, R1 to R3, the reader's letters). The patches of the
four sessions are in `part-a/` (`c1.patch`, `c2.patch`, `s1.patch`, `s2.patch`).

How events are cited: a session's report names a stream file per invocation. "inv-1 event 7" is the 7th assistant
or tool-result record of that invocation's stream, counted from 1. The streams hold no readable reasoning (the
thinking blocks are empty), so what a session thought is known only from its text and its calls.

The reader's blind letters were drawn by `shuf`; the key is A = c2, B = c1, C = s2, D = s1 (matched by diff).

## Prompts and replies, common to the four

First invocation: write rights on the clone, Sonnet, effort high; "repository <clone>; its rules are `AGENT.md`
and `CONSTITUTION.md`, read them first; I am the owner and will answer your questions in the next message"; then
"Fix E104 from `plugins/entrust/ISSUES.md`". The s sessions had one more line before the last: work by the page
`skill-creator/SKILL.md` in the clone, read it whole and follow it, read the files it links at the step where it
refers to them. Later invocations resumed the session with the scripted reply or none.

Replies: after invocation 1 every session had proposed a plan and asked a choice, two rules, so all four got R2
("decide it yourself by the repository's principles; ask only what they do not settle"). After invocation 2, c1
and c2 reported the change and asked whether to commit: R2 again, same reply. After their invocation 3, and after
invocation 2 of s1 and s2 (a report with no question), R3: the session ended. R1 ("Yes.") was never sent.

## s1 (reader D)

**Read.** inv-1: both rule files (events 3, 5); `SKILL.md` whole (event 7); `references/analysis.md` whole
(event 12); the two effort pages (14, 16); `critics.md` lines 20-48 through a shell `sed` (event 29). Never opened:
`checks.md`, `writing.md`, `structure.md`, `hosts.md`. inv-2 opened no skill file.

**Decided and changed.** inv-1 took the Change route, wrote three requirement lines (R3: the other rows of the
effort table are not lost silently), put one question (which effort a refuter gets; options medium, high or
xhigh, per tier) and stopped at the plan (status partial), naming no judge because the owner's word for agents was
missing. After the reply it chose `medium` (inv-2 event 2) and edited: the table became a two-line paragraph
linking `models.md`, keeping the delegation note and the heading (event 5); `E104` removed from `ISSUES.md`
(event 7); a changelog bullet under Unreleased (event 12). It ran `scripts/skills.test.mjs` before and after, and
`check.mjs` once, before the edit, on the codex skill (it failed rule 12 there, a defect it did not touch).

**Verifier.** M0a yes, M0b yes, "nothing found". **Reader.** 2 questions (1 settled by the repository), 8 facts
lost (page 3, ledger 5), 3 additions required by nothing, no rule before the edit.

**Cost and invocations.** 0.477 USD, 2; M5 yes; M7 1.

## s2 (reader C)

**Read.** inv-1: both rule files; `SKILL.md` whole (event 6); `analysis.md` whole (event 12); the two effort
pages (14, 16); a grep for `#effort` (25); `environment-and-internals.md` lines 118-125 (28). Never opened:
`checks.md`, `writing.md`, `structure.md`, `critics.md`, `hosts.md`. inv-2 opened no skill file.

**Decided and changed.** Change route; stopped at a plan with one question and a recommendation of `medium`, and
stated what the cut costs (the `high`/`xhigh` refutation level and the competing-designs and second-implementation
wording). After the reply it deleted the whole `### Effort` section and its contents entry (inv-2 event 5, a shell
edit), added a changelog bullet and removed the ledger entry (event 8), ran `skills.test.mjs` and
`fragments.test.mjs`. No link to `models.md` was left on the parity page, which departs from the entry's last
clause.

**Verifier.** M0a yes, M0b partly (no link). It also said the `max`/`ultra` row and the delegation note were
dropped; the note survives at `environment-and-internals.md:121`, so that part of its report is wrong.
**Reader.** 3 questions (1 settled), 10 facts lost (page 4, ledger 6), no unrequired addition.

**Cost and invocations.** 0.369 USD, 2; M5 yes; M7 1.

## c1 (reader B)

No page. Read the two rule files, the entry, both effort pages; in inv-2 it also read
`environment-and-internals.md:117-125` (event 5) and found the delegation note's other home. Inv-1 asked the
refuter's effort and approval of a plan; after the reply it chose `medium`, deleted the section and its contents
entry by a shell edit (inv-2 event 11), kept no link, and said so as a departure from the entry. Its report lists
what went: `low`, `medium`, and `high`/`xhigh` for competing designs and a second implementation. It added a new
`Unreleased` section. `skills.test.mjs` 8 of 8. **Verifier:** M0b partly (no link); notes the delegation note and
the level guidance lost. **Reader:** 5 questions (2 settled), commit asked more than once, 10 facts lost (page 4,
ledger 6). **Cost** 0.348 USD, 3 invocations; M5 yes; M7 2 (D2 of the operator's record).

## c2 (reader A)

No page. Same reads. Inv-1 asked two questions (the effort; what to do with the rest of the table). After the
reply it kept `### Effort` as a one-sentence section linking `models.md` plus the delegation note, removed the
table and the ledger entry, added an `Unreleased` section, and ran `skills.test.mjs` and `fragments.test.mjs`;
inv-3 ran three more suites it found by grep. Its report says the competing-designs and second-implementation
rows were not carried over. **Verifier:** M0a yes, M0b yes. **Reader:** 5 questions (2 settled), commit asked
more than once, 11 facts lost (page 3, ledger 8), one unrequired addition. **Cost** 0.331 USD, 3 invocations; M5
yes; M7 2.

Overhead (M6, median of the page arm over the control arm, last cumulative cost of each session): 0.423 over
0.339, 1.25.

## What each final tree still holds of the parity table

| Row of the table at `parity.md:86-91` | s1 | s2 | c1 | c2 |
|---|---|---|---|---|
| `low`: fact lookup | gone | gone | gone | gone |
| `medium`: ordinary review | `models.md:12` | gone | gone | `models.md:12` |
| `high`/`xhigh`: refutation | decided `medium`, linked | decided `medium`, no link | same as s2 | decided `medium`, linked |
| `high`/`xhigh`: competing designs, a second implementation | gone | gone | gone | gone |
| `max`/`ultra`: the hardest problems | gone | gone | gone | gone |
| delegation note (measured on 0.153.4) | `parity.md:86-87` | `environment-and-internals.md:121-122` | same as s2 | `parity.md:86-87` |

A grep of each final tree outside `research/` finds "fact lookup" and "hardest problems" nowhere. In s1's changelog
bullet only the `high`/`xhigh` uses are named as dropped; its report says the bullet also names `low`, and the
bullet does not.

## Diagnostic: did s1 and s2 reach the step that checks that nothing was lost?

**Where the page puts the check.** Create step 3 (`SKILL.md:58-60`) says to choose the check by
`checks.md#choosing-the-check`, whose row at `checks.md:10` is "nothing was lost in a cut, a move, a merge or a
rewrite": each removed sentence is found where its fact is now defined, and one fresh reader answers scenarios
written from the old files. Step 5 (`SKILL.md:85-87`) tells the agent to write that check's cases before any text
exists, step 6 to write by `writing.md`, step 8 to run the plan's check. `writing.md:83-88` ("Rewriting an existing
skill") has the inventory of every fact before the edit and repeats the row at `:87`; the page reaches it only from
Create step 1 (`SKILL.md:52-53`), for "a rewrite of a skill's whole text". The Change route (`SKILL.md:101-123`)
names no check of its own: step 4 is "Create's step 3 with the change in place of the approach", step 5 is
"Create's steps 4 to 10". So for a merge inside an existing page, the row is two links away from the route.

**s1, step by step.**
1. The session read `SKILL.md` whole (inv-1 event 7) and chose Change. It reached Change step 1 and read
   `analysis.md` (event 12). It wrote its own line R3, that the other effort rows are not lost silently. The words are
   not in E104, and no event shows what prompted the line; it did not come from `checks.md`, which was unopened.
2. Change step 2 (find the place): it read both effort pages and searched for the row phrases elsewhere (events 14,
   16, 32, 36). That search shows `competing designs` and `ordinary review` are used elsewhere in other senses; it
   is not the row's check (no removed sentence was looked up where its fact now lives).
3. Change step 4 / Create step 3: it composed the plan and its check, "`skills.test.mjs` before and after, a grep,
   a read of the diff", without opening `checks.md` (no call names it in either invocation). The plan did say
   (point 1) that `max`/`ultra` or fact-lookup rows `models.md` lacks would be added there, not lost. It stopped
   at the plan, as step 3 asks.
4. After the reply (inv-2) it went to Change step 5. Event 2 gives its reasons for `medium` (the model table owns
   effort, no measurement on refuters, minimalism) and says no judge runs because the owner's word for agents is
   missing. Steps 5 and 6 were not done as the page words them: `checks.md` and `writing.md` unopened, no cases
   prepared; `check.mjs` was not run after the edit.
5. **Where the rows were dropped:** inv-2 event 5, one Edit replacing the four table rows (`low` fact lookup;
   `medium` ordinary review; `high`/`xhigh` refutation, competing designs, a second implementation; `max`/`ultra`
   the hardest problems with the delegation note) by a two-line paragraph. It had read lines 82-93 in event 3.
   No event between 3 and 5 compares the rows with `models.md`. Event 12 records the drop in the changelog for
   the `high`/`xhigh` row only. The plan's point 1 (add the rows `models.md` lacks) was not carried out and no event
   mentions it.

**s2, step by step.**
1. `SKILL.md` whole (inv-1 event 6); Change route; `analysis.md` (event 12). It wrote no requirement line about
   losing rows.
2. Change step 2: both effort pages, a grep for effort and one for `#effort` (events 14, 16, 18, 25), and
   `environment-and-internals.md:118-125` (events 28, 29), where the delegation note's second home is. That read is
   a check of one fact of one row, found by the session's own reasoning, not by the page.
3. Plan (event 31): it named the cost of option A as the loss of the `high`/`xhigh` level and of the two wordings,
   and said the `max`/`ultra` fact is not lost. It did not mention `low`, `medium` or the "hardest problems" use.
   `checks.md` unopened; its check was `skills.test.mjs` for anchors and links.
4. inv-2: no skill file read. It stated the choice and went straight to edits.
5. **Where the rows were dropped:** inv-2 event 5, a shell script that cut everything from `### Effort` to the next
   heading and removed the contents entry. Its last text (event 11) lists as lost the `high`/`xhigh` refutation
   level and the two wordings.

**c1 and c2, briefly.** Without the page, neither had a check to reach. Both read the two pages. c1 looked for the
delegation note's other home before cutting (inv-2 event 5) and found it; c2 judged the note to have no other home
and kept it on the parity page. Both named in their reports some of what went; neither tree's changelog bullet
names `low` or the hardest-problems use (c1's report names `low`). Their M2 counts
(c1 10, c2 11) are in the range of the page sessions' (s1 8, s2 10).

## What the trace shows, and what it cannot

It shows that both page sessions read `SKILL.md` and `analysis.md`, reached the plan step and stopped there, and
never opened `checks.md`, `writing.md` or `structure.md`; that the row "nothing was lost" sits in a file neither
opened; that in each, the four table rows were removed in one edit event (s1 inv-2 event 5, s2 inv-2 event 5) with
no event before it that sets the removed rows against where their facts would live; that s1 wrote the
requirement and a plan line against loss and did not apply them at the edit; and that s2 accounted for part of the
rows by its own search. It shows that the four sessions dropped the same rows (`low`, the competing-designs use,
the hardest-problems use) with or without the page, and that the page sessions' loss counts (8 and 10) are not
above the controls' (10 and 11).

It cannot show why. The reasoning blocks are empty, so whether the sessions judged the row irrelevant, forgot the
page after the resumed turn, or weighed the cost of an unmeasured fan-out is not in the stream. It cannot show
that opening `checks.md` would have changed an edit: no session did, and no run of this part varied that. It cannot
show whether the first-turn stop at the plan, which split the route across two invocations, mattered. Two sessions
an arm, one case.
