# Judging sheet — skeleton route, with an audit

Quoted from `plugins/terse/skills/rewrite/references/bake-off.md` at `78c17ef`: lines 31, 108–124 and 128–132. Filled: the skeleton is `skeleton.md` of the run directory `$TMPDIR/terse/runs/20260924-002235-terse-readme-rewrite2`, its five sections in part 2 (§2.1–§2.5), their numbers in `budgets.json` there; the candidates are A, B and C, each a whole file at the path the coordinator gives the judge; the code is the checkout at `~/Git/agent-skills`. The purpose row is one row per section, because the page counts the winner in sections.

## The page's rules

> Judges never learn which model wrote which candidate. Label candidates A, B, C. (bake-off.md:31)

> One sheet per candidate. The first two rows are vetoes: a candidate that fails either is out, whatever else it does well. (bake-off.md:108–109)

> On the skeleton route the first two rows stay vetoes and the primary row changes: **purpose met** — does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else; then **exclusions respected** — nothing the skeleton excluded was restored; then **budget** — words against the skeleton's number, reported and never selecting. Give the judges the skeleton and the candidate; the winner is the surviving candidate with the most sections meeting their purpose. (bake-off.md:128–132)

> Judges state a line number for every claim they make about a candidate. A judgement without a line is an opinion, and this sheet does not collect opinions. (bake-off.md:120–121)

> Do not give them the other judges' sheets. (bake-off.md:124)

## Candidate A — `<path of A>`

| Row | Question | Weight | Answer, with the candidate's line numbers |
|---|---|---|---|
| new false claims | does any behavioural claim contradict the code, or exceed the evidence level its source supports? | veto | |
| protected passages | was a condition, limit or warning at a decision point cut or weakened? was a passage the audit recorded as working damaged? | veto | |
| purpose met — `# terse` and the opening (§2.1) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — Quick start (§2.2) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — Skills (§2.3) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — How it works (§2.4) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — What was measured (§2.5) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| exclusions respected | nothing the skeleton excluded was restored | not given by the page | |
| budget | words against the skeleton's number — (opening) 70, Quick start 180, Skills 130, How it works 140, What was measured 105; total 625 | reported and never selecting | |

## Candidate B — `<path of B>`

| Row | Question | Weight | Answer, with the candidate's line numbers |
|---|---|---|---|
| new false claims | does any behavioural claim contradict the code, or exceed the evidence level its source supports? | veto | |
| protected passages | was a condition, limit or warning at a decision point cut or weakened? was a passage the audit recorded as working damaged? | veto | |
| purpose met — `# terse` and the opening (§2.1) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — Quick start (§2.2) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — Skills (§2.3) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — How it works (§2.4) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — What was measured (§2.5) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| exclusions respected | nothing the skeleton excluded was restored | not given by the page | |
| budget | words against the skeleton's number — (opening) 70, Quick start 180, Skills 130, How it works 140, What was measured 105; total 625 | reported and never selecting | |

## Candidate C — `<path of C>`

| Row | Question | Weight | Answer, with the candidate's line numbers |
|---|---|---|---|
| new false claims | does any behavioural claim contradict the code, or exceed the evidence level its source supports? | veto | |
| protected passages | was a condition, limit or warning at a decision point cut or weakened? was a passage the audit recorded as working damaged? | veto | |
| purpose met — `# terse` and the opening (§2.1) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — Quick start (§2.2) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — Skills (§2.3) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — How it works (§2.4) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| purpose met — What was measured (§2.5) | does the section do what the skeleton says it buys the reader, judged against that sentence and nothing else | primary | |
| exclusions respected | nothing the skeleton excluded was restored | not given by the page | |
| budget | words against the skeleton's number — (opening) 70, Quick start 180, Skills 130, How it works 140, What was measured 105; total 625 | reported and never selecting | |

## Coordinator's choices

1. **The general sheet's other rows.** On this route "the first two rows stay vetoes and the primary row changes", then the page names *exclusions respected* and *budget*. It does not say whether *prerequisites* ("does the text answer the inventory's items where the reader meets them?", secondary), *cuts justified* ("does every cut of twenty words or more carry a reason?", secondary) and *length* ("word count before and after", reported, never selects) stay (bake-off.md:116–118). They are not on the sheets above.
2. **The weight of *exclusions respected*.** The page gives none.
3. **What the judges are given.** This route: "Give the judges the skeleton and the candidate" (bake-off.md:131). The audit route: "Give the judges the audit's *What broke* section and the candidate" (bake-off.md:123). The first veto needs the code, and the second asks after "a passage the audit recorded as working"; the skeleton carries neither. The page does not say whether judges on this route, with an audit, also get part 5 of `brief.md` and the checkout.
4. **The second veto on this route.** The README passages the audit recorded as working are the quotes of the right answers in `audit.md` Reader results: README.md:47-48 (Q1), :11 (Q3), :35-36 (Q4), :53-56 (Q6); Q5's quote is from a skill page. Skeleton part 5 deletes :9–13 and parts of :53–56; part 3 rule 7 forbids "run directory" and "your word" (both in :35–36); §2.2 excludes "the commands again in prose" (:47–48). None of the four survives verbatim in a candidate that follows the skeleton; the answers they gave are what the question readers of step 5 are asked for again. Whether the veto reads the passage or the right answer the passage gave is not said.
5. **Judges: count and models.** "judges | 2 | a third only when the two split" (bake-off.md:22); "give one writer and one judge to Codex" when `entrust` is installed (bake-off.md:26–27); "The full form the author uses is three judges — Fable, Codex gpt-6-astra, and Opus — and two are usually enough." (bake-off.md:28–29).
6. **A tie, and grafting.** The page's tie rule is written for "the most failures repaired" (bake-off.md:136–139) and its graft for "where a loser repaired a failure the winner did not" (bake-off.md:141). For this route's winner, "the most sections meeting their purpose", it states neither.

## The coordinator's choices, 2026-09-24

1. "exclusions respected" is a veto: a candidate that restores what a section excludes is out, like one that damages a protected passage.
2. Two rows added, both primary: "conditions kept" — every condition, limit or warning at a decision point that the skeleton's sections carry is present; "words decided" — the terminology of the skeleton's part 4 is used and the dropped words do not appear.
3. Budget is reported, never selecting; length never selects.
4. The judges receive brief.md whole, the three candidates under blind labels A, B, C, and this sheet; nothing else. Two judges, Claude Fable and Codex Astra; on a split, a third, Claude Opus.
5. Ties on the primary rows go to the candidate with fewer vetoes-adjacent findings on "new false claims"; grafts for the winner are the sections or sentences the judges name from the losers, each with what it displaces.
