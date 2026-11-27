# skill-creator v2: the test protocol (2026-11-26)

Rewritten for the tracked record without private material. The frozen original's SHA-256 is
`cb965cd3bf9de251e16d51be4165b471c14d9c54a370076f6001a653f3e4190a`; it was frozen before CP2's first session.
Rules, thresholds, measures and ceilings below are those of the frozen original. What differs: local paths are
replaced by placeholders (`<run-dir>`, `<clone>`); the prompts and scripted replies are given in
English; the fact lists and the 2a scenarios and key, which are private, are
named by description; references to v1's protocol point to [02-test-protocol.md](02-test-protocol.md).

This file is a delta against [02-test-protocol.md](02-test-protocol.md). What it does not restate holds as written
there: the routes (A2), the stop rule and what is collected (A4), the verifier's brief, the ceilings per session,
and the rule that an incomplete session is kept and never rerun. After the freeze it changed only by a numbered
addendum that says what changed and why; a result never changed it. (J) marks a threshold or rule that is chosen,
not measured.

| File | SHA-256 |
|---|---|
| the protocol, as frozen | `cb965cd3bf9de251e16d51be4165b471c14d9c54a370076f6001a653f3e4190a` |
| addendum A | `3f1509337255770312ef8993f6610863e051d3facf47d684e978d98501169fc3` |
| addendum B | `009a86a72c265f85062305feeb46724f04f8faad06fb06883bf147db81764ba9` |
| addendum C | `a8da5ed495704ba3b15fee5b30c50f243bbb16c2d331d2d8af5f61b367f68465` |
| addendum D | `19a8a20fde6990bebb96cbd3d379183dae67a5548579d66934f50ca7a84b8eaf` |
| addendum 1 (the slot of section 8) | `c2930f288ed5c3d876a109e9b7761306f84937aa6f0ea4acc9aaaf6d70a5cc2e` |
| the 2a key, frozen before the first 2a writer | `b4d69097004c130894c6b5f6f6ef4583c9c7a2eadf59d8c3dde18beaa4e13ae5` |

Each addendum's hash is that of its own text in the original files, which are private; the original wording of
each is reproduced in the addenda section below with its private paths replaced.

## 1. Names, trees and delivery

```bash
REPO=<the repository checkout>
BASE=aa40ba0f268fff6f4f114b8fa1bfaba35a9e586d      # main without the skill
CAND2=761d9dacc317358cf0cd5eaaada8b80078a1afd6     # stage 1, the candidate of CP2 (changed by addenda A and B)
CAND3=<the commit of stage 2, written into the decision log before CP3's first session; with no stage 2, CAND2>
SKILL=<run-dir>/skill-<cp>/skill-creator           # a git archive of the candidate's skill folder, unpacked
```

**Every arm of Parts A and R runs on a clone at `$BASE`.** The candidate's tree holds the record of version 1's
test, with the digests and patches of its Part A, so a clone at the candidate would hand a page session the
answer. The page reaches a session from outside its clone: `$SKILL/SKILL.md`, named by path. `check.mjs` is run
from `$SKILL/scripts/` against the clone.

A clone, one per session:

```bash
git clone -q --no-hardlinks "$REPO" "$D/repo" && cd "$D/repo" && git checkout -q --detach "$BASE"
git remote remove origin
git for-each-ref --format='delete %(refname)' | git update-ref --stdin
git reflog expire --expire=now --all && git gc -q --prune=now
mkdir -p "$D/work" "$D/tmp"
```

These lines were run once by the designer: the candidate's commit is then absent and `check.mjs --against aa40ba0`
resolves.

**Operator checks, before any session, each recorded with its output.** A failed one stops the part.

| # | Check |
|---|---|
| O1 | for every clone: the research folder of v1's test and the skill-creator folder do not exist under `repo/plugins/entrust/` |
| O2 | for every clone: `git cat-file -e $CAND2^{commit}` fails, and the same for `$CAND3`; `git status --short` prints nothing |
| O3 | `$SKILL` holds `SKILL.md`, `references/`, `scripts/` and nothing else; `node $SKILL/scripts/check.mjs <a clone>/plugins/entrust/plugin/skills/codex --against $BASE` exits 0 on an untouched clone |
| O4 | no file under the run directory that a session can be pointed to holds the fact lists, this protocol or v1's session digests |
| O5 | the relay preflight of section 2 |
| O6 | v1's P2, P3 and P5 (adapter ready; one external run works; the suites pass at `$BASE`) |

## 2. The relay preflight

v1's relay missed requests printed as a `COMMAND<<TOKEN … COMMAND>>TOKEN` block, so every session's first read-only
shell command expired. Before any session, one throwaway external run on Sonnet (`RIGHTS: read <a clone>`) is given
a task that makes it ask twice: once for a one-line command (`git -C <clone> log --oneline -1`) and once for a
command that contains a heredoc (`cat <<'EOF' … EOF` piped to `wc -l`). Passed when both requests are answered and
both results appear in the run's answer. Not passed: fix the relay and repeat. No test session starts on a relay
that has not passed.

## 3. Part A: prompts, replies, requests

First invocation, the control. Against v1 it gains the work directory, in every arm, because the dispositions file
and any sheet must stand outside the tree:

```text
RIGHTS: write <D>
MODEL: sonnet
EFFORT: <the operator's effort>
ALLOW_NO_COMMANDS: yes
TASK: Repository: <D>/repo. Its rules: <D>/repo/AGENT.md and <D>/repo/CONSTITUTION.md; read them before you work. Write working files in <D>/work, not in the repository. I am the owner of the repository; I will answer your questions in the next message.
Fix <entry> from <D>/repo/plugins/entrust/ISSUES.md.
```

The page arm adds, before the last line:

```text
Work by the page <SKILL>/SKILL.md: read it whole and follow it; read the files it links at the step where it refers to them. Its links to other skills resolve under <D>/repo/plugins/entrust/plugin/skills/.
```

The prompts and replies are the protocol's scripted texts, as in v1; the texts above are their renderings. No
`CHECK:` or `RETURN:` line is written.

**Requests.** Accepted: a command that only reads; a suite of the repository; `node <SKILL>/scripts/check.mjs …`; a
write inside `<D>/repo` or `<D>/work`. Declined: a commit, a push, a network call, a write anywhere else. The same
in every arm; each request and decision is recorded.

**The scripted owner.** The first rule that fits; the class is written to `replies.md` before the reply is sent.

| # | The answer | Reply |
|---|---|---|
| R0 | proposes to remove, or asks whether to remove, a sentence, a row or a section of a skill page, and does not say where every fact of it will stand afterwards | `Do not drop anything a reader of that page needs: keep it, or move it to the page that owns it. Decide the rest yourself by the repository's principles.` |
| R1 | proposes a plan or a change and asks for approval, for the first time in this session | `Yes.` |
| R2 | asks anything else: a choice, a clarification, a go-ahead, approval a second time | `Decide it yourself by the repository's principles; ask only what they do not settle.` |
| R3 | reports the change made | none: the session ends |
| R4 | reports that nothing was changed, and asks nothing | none: the session ends |

R0 is sent once a session; a later answer that fits it takes R2. An answer that fits no rule, or R1 and R2
together, takes R2; one that both reports and asks takes the question's rule. R0 is what v1 lacked: one page
session's plan named the loss and received a plain go-ahead.

## 4. Part A: the measures, as redefined

The key for each case is its fact list, written by a fresh strong-tier agent that opened only the base tree and kept
private until the test ended: the effort case (v1's Part A case: an effort rule stated twice, on two codex pages)
has 28 facts (13 S, 11 R, 4 U); the bulk-row case (a bulk row's unit, derived count and pilot written twice, on
orchestrate's plan page and on the swarm page) has 54 (39 S, 13 R, 2 U). S must survive, R is a removal a rule
requires, U may go or be reworded only on the user's word. Under this protocol the user's word never comes: R0
says keep. The lists are used as written.

| Id | Measure | By | How |
|---|---|---|---|
| M0a, M0b, M5, M7 | as v1 | | M7 counts answers classed R0, R1 or R2 before the first edit |
| M1 | questions the repository settles | reader | as v1, with two exclusions fixed now: a question about the fate of a U fact, and for the effort case the question which effort a refuter gets, are the owner's to answer and are never counted |
| M2 | facts lost | reader, from the fact list | an S fact counts when a reader of the final tree's pages no longer meets it: it is stated neither at the place the list names, nor at another place of the skill pages that the changed page states or links. An S fact the list marks "in place" counts when its value changed. A U fact counts unless (a) the final pages state it, or (b) the list names a line that may carry it by a reading, and the session's answer names that line for it. R facts never count |
| M3 | unrequired additions | reader | as v1, with two exclusions: a sentence that carries an S or U fact to another page is a move; a line a repository rule requires of every fix (the changelog entry that names the ledger entry) is required |
| M6 | overhead | operator | as v1 |
| M8 | the gate's events, page arm only, reported | operator, from the transcript | which files under `$SKILL` each invocation opened; whether `check.mjs --against` ran after the last edit to a skill page, and in which invocation; its exit status; whether a dispositions file exists and holds one line for each line the gate listed; whether a sheet or plan file was written in `work` |

The reader gets the entry's text, a clean clone at `$BASE`, the case's fact list without its reference fix, open
choice and could-get-wrong sections, and per session `diff.patch`, `answers.md` and the questions, under letters
drawn by `shuf`. It is told only: "attempts at the same ledger entry; mark each fact of the list for each attempt,
with the place that shows it". It gives every "lost" a place in the diff. The operator opens each "lost" and each
"settled" before counting; one that cannot be confirmed is unresolved and counts for neither arm. The delivery
record (M8's first item) is taken for every session before any count.

**A session is clean** when M0a and M0b are yes, M1 = 0, M2 = 0 and M5 is yes. **The rule for a case** is A5 of
v1, word for word, over these measures (A5, [02-test-protocol.md](02-test-protocol.md)):

- **Keep** when all hold: `s1` and `s2` are clean; each skill session's M3 is no greater than the larger of the two
  control sessions'; at least one control session is not clean, or has an M3 greater than both skill sessions';
  overhead is at most 2.
- **Back to design** when any holds: a skill session has M2 > 0; a skill session has M0b "no" while a control
  session has "yes"; a skill session's M1 is greater than both control sessions'; a skill session's M7 is above 1;
  overhead is above 3; both skill sessions are incomplete.
- **Undecided** otherwise.

**Part A's verdict** over two cases (J): Keep when both cases are Keep, or one is Keep and the other Undecided;
Back to design when either is; Undecided otherwise.

## 5. The desk check of the references (no tokens, done before the freeze)

Each reference fix was scored as if it were a session's final tree and answer.

| Case | Branch | M0a | M0b | M1 | M2 | M3 | Clean |
|---|---|---|---|---|---|---|---|
| effort | the fix with the lines under the model table (what R0 leads to) | yes: both suites green on the reference's copy | yes | 0: it asks only about U facts | 0, on one condition: fact 1 (`low` for a fact lookup) is not in the diff; it is met by clause (b), through `models.md:13`, which the list names | 0: the sentence under the table is a move, the link and the changelog entry are required | yes |
| effort | the fix without those lines and without the user's word | yes | yes | 0 | 4: facts 1, 4, 5, 6 | 0 | no, as the list intends |
| bulk row | the fix as written | yes: three suites green | yes | 0 | 0: facts 3, 5, 12, 13, 31, 32 are met through the link the changed page now carries; 23 and 24 stand unchanged | 0 | yes |

**Measures changed because of this check**, before the freeze:

1. M2's clause (b) was added. Without it the reference's own fix for the effort case loses fact 1, since its diff
   does not restate it and the reference lets the cheap row's "`low` for mechanical work only" carry it by a reading.
2. M2 counts a fact met through a link the changed page states. Without it the bulk-row fix loses six S facts that
   the reference marks as surviving at the owner's page.
3. M3 excludes the changelog entry. v1's M3 asked for "the words of the entry that require it", and no entry's
   words require a changelog line; the repository's rule does.
4. M1 excludes the refuter's effort for the effort case: the reference derives `medium` from the rules and also
   calls a session that asks correct.

With these, Keep is reachable in both cases: a session that reproduces the reference fix is clean. v1's measure
could not say that.

**Where the designer differs from the references, with no effect on a count:**

- Effort case, fact 1. The gate is stricter than the reference. `check.mjs` lists `parity.md:88` as lost, and a
  `moved` line that quotes `models.md:13` is refused, because the quote shares no word of four letters with the
  row. A page session must therefore restate the fact; a control may rely on the reading. Both are clean under M2.
  The asymmetry goes into the result.
- Effort case, fact 3 is R, yet the gate lists `parity.md:90`. A session answers it with a `moved` line quoting
  `models.md:12`, which holds the word "refutation". The gate has no disposition that says "removed because it
  contradicts its owner"; a session that finds none is a finding about the gate, counted in M8. (Addendum A closed
  this before any session.)
- Bulk-row case. Lines 24 and 45 of the swarm page are one long line each, so any fix lists them whole and the
  session must quote the rewritten line. That is the gate at its coarsest; M8 shows what sessions do with it.

## 6. CP2: the pilot

Two page sessions on the effort case, `p1` and `p2`, on `$CAND2`, by sections 1 to 4, started together. No control
and no reader: the operator marks M2 against the fact list itself, and a fresh Sonnet checker opens each mark at
its place.

**Continue** when all hold: in both sessions the turn that edits runs `check.mjs --against` after its last edit to
a skill page; in both, each line the gate listed has a line in a dispositions file, or was put back; M2 = 0 in
both, that is, no S or U fact is lost without a disposition the gate accepted; the mean cost of the two is at most
0.68 USD, twice the 0.34 mean of v1's two controls on this case.

**Rework** otherwise: one rework of stage 1, then two fresh sessions under this same section. A second failure goes
to the owner with both results. A session that never opens `$SKILL/SKILL.md` is a failed delivery: it is kept,
reported, and replaced once.

Reported beside the rule, deciding nothing: M8 whole; whether Change's wait at its plan split the work into two
turns, and what the second turn opened; M7; each session's invocations.

What CP2 cannot show: that a control under R0 would lose a fact. If CP3's fresh controls keep every S and U fact,
the reply, not the gate, is the fix, and Part A can return at most Undecided.

## 7. CP3

### 7.1 Part A

On `$CAND3`. The effort case and the bulk-row case, each with two page sessions and two controls, started together
per case. CP2's pair serves as the effort case's page arm only if `$CAND3`'s skill folder equals `$CAND2`'s;
otherwise two fresh ones. One blind strong-tier reader per case; one Sonnet verifier per session, as v1. Verdict by
section 4. The effort case is a regression case: the gate was calibrated on its four v1 trees. The bulk-row case was
never run, and the designer read its entry only through the reference answer, after stage 1 was built and committed.

### 7.2 Part R

Arms, two sessions each, on clones at `$BASE` made as in section 1: `s1`, `s2` with the delivery line naming
`$SKILL/SKILL.md`; `c1`, `c2` with nothing added. The vendor arm is not rerun; its 10 and 10 stay on record.
Prompt, corpus, the file left out of the corpus folder, the scripted owner Q1 and Q2, the ceilings: as v1 (Part R
of [02-test-protocol.md](02-test-protocol.md)).

The decisions are v1's thirteen (D1 to D13, same table), with two split by clause:

| # | Clause |
|---|---|
| D3a | which hosts or CLIs the skill is for |
| D3b | that the check's sessions go through the repository's adapters |
| D13a | how the finished skill is delivered |
| D13b | who writes that text |

A mark is `asked`, `shown` or `absent`, one per clause. **There is no partial mark**: a clause named without its
value is `absent`. D12 is `shown` only when the session obtained the missing file another way, or its answer lists
the ways it tried; saying it is missing and asking the owner is `absent`. The operator opens every `asked` and
`shown` at its place; one it cannot confirm is `absent`.

**The scored set**, fixed now: the eight clauses some v1 session missed, strictly read: D3a, D3b, D4, D6, D8, D11,
D12, D13b. The other seven are marked and reported as ceiling.

**The unseen request.** One page session `u1` and one control `u0` on Part C's request (v1's protocol), with
nothing from the corpus: `Make a skill that carries out a release of this repository's plugin by <clone>/RELEASING.md.`
Marked by the same reader on seven of the eight clauses; D12 has no staged source there and is left out.

**The rule** (thresholds J):

- **Pass**: `s1` and `s2` each have 6 of 8; D7, D8 and D10 are `asked` or `shown` in both; the lower of them
  exceeds the higher control by 3; and `u1` exceeds `u0` by 2 of 7.
- **Back to design**: D7 or D10 `absent` in both skill sessions; or a skill session below the higher control, or
  below 4 of 8; or both skill sessions incomplete.
- **Undecided** otherwise: reported; no second run.

### 7.3 The landing rule

v2 lands when Part A is Keep and Part R is Pass. Anything else goes to the owner with the records and no
recommendation added after the fact.

## 8. The slot for the curse-of-knowledge test

This section was left open for one addendum, to be filled before CP3's first session and not after: a model given
only the skill's pages writes the briefs for the judges, scored against known answers. It could add that test and
nothing else, and could not touch sections 1 to 7. Addendum 1 below filled it, before the test of slice 2a.

## 9. What this protocol cannot show

- Part R's scored set holds clauses that stage 2's plan form has slots for. A Pass shows that slots get filled and
  that the margin holds on one unseen request with one session an arm; it does not show that the page finds a
  decision nobody gave it.
- The effort case is regression. The bulk-row case is one case, chosen in v1's pool. Two sessions an arm show that an
  event occurred, not a stable difference (`RESEARCH.md`, Run and report).
- The fact lists are one agent's reading. Clause (b) of M2 and the link clause rest on level-2 judgements the lists
  themselves mark. On request the owner's read of the diffs replaces the reader's, as in v1.
- R0 tells every arm to keep what a reader needs. It is the owner's likely answer, and it is also most of what the
  gate enforces, so the controls may come out clean.
- The page is delivered by path. Whether an agent would select the skill is not measured; nor is any host but
  Claude Code, any model but Sonnet, or the creation of a new skill beyond its plan.
- Links from the copied skill folder to neighbouring skills do not resolve from the copy; the delivery line says
  where they are. A session that fails on such a link is recorded, not rerun.
- Blinding is partial: a dispositions file or a sheet in `work` gives the arm away, so the reader is not given
  `work`; M8 is the operator's.

## Addenda

Each was written before the sessions it governs and is reproduced with its private paths replaced.

### Addendum A (before any session)

CAND2 is `fe99909ea8615d75ed23a9a9eab9c9322670ce87`, not `761d9da`. Reason: after the freeze, the designer named a
gap the pilot would meet on the effort case's fact 3 (a removed copy that contradicts its owner had no stated
disposition); one clause in `SKILL.md` step 8 and a test fixture close it (no change to `check.mjs`). CP1 re-run on
the four v1 Part A trees: 3 of 3 rows, 4 candidates each, as before. Nothing else in the protocol changes.

### Addendum B (before CP2's second pair)

CP2's first pair (`p1`, `p2` on `fe99909`) returned Rework: mean cost 0.706 > 0.68, and M2 = 1 in `p1` (fact 7,
confirmed by a fresh checker). By section 6, one rework of stage 1 was built: commit
`e8b6e028105219eb6a32bd1b1122e7c47b780f20` (the four findings of the pilot's evidence lens, with a coverage rule for
dispositions). CAND2 for the second pair is that commit. The second pair, `p3` and `p4`, runs under section 6
unchanged: same rule, same threshold (0.68), same replies, two fresh sessions. A second failure goes to the owner
with both results. CP1 re-run on `e8b6e02`: the four v1 Part A trees flag 3 of 3 rows, 4 candidates each; typo and
link fixes list nothing; an untouched base codex skill passes plain mode and `--against`.

### Addendum C (before CP3's first session)

1. CAND3 for CP3's Part A is `d8cc78f82be8dac004eda5b858f908c49fa4944c` (stage 1 reworked, slice 2a and its
   correction). Its skill folder differs from CAND2's, so the effort case's page arm is two fresh sessions
   (section 7.1).
2. CP3 is split. Stage 2 was sliced (2a, then 2b) on the second architecture critic's advice, after this protocol
   was frozen; Part R's scored set rests on the plan form, which is 2b. So Part A runs now on CAND3, and Part R runs
   after 2b on the commit that holds it, written into the decision log before Part R's first session. Nothing
   else in sections 7.1 to 7.3 changes; the landing rule still needs both.
3. Sessions: effort case page `a1`, `a2`, control `b1`, `b2`; bulk-row case page `a3`, `a4`, control `b3`, `b4`; all started
   together per case, by sections 1 to 4. One Sonnet verifier per session and one blind strong-tier reader per
   case are started by the coordinator after the operator returns. (Five of these sessions were lost to a rate
   limit and rerun once, as `a1r`, `a2r`, `a3r`, `a4r`, `b3r`, by v1's A4.)

### Addendum D (before Part R's first session)

1. Part R runs on `a538316` (stage 1, slices 2a and 2b, the quality read's fix round), by section 7.2 unchanged:
   `s1`, `s2` with the delivery line naming the skill copied outside the clone; `c1`, `c2` with nothing added;
   `u1` (page) and `u0` (control) on the release request; every clone at BASE; the corpus and the archived file as
   v1's Part R.
2. It starts while the v2 verifier runs; a verifier finding that changes the pages does not change this run, which
   measures `a538316`.
3. The reader is one fresh native agent on the strong tier, briefed by the pages' own form for the check's reader
   (`critics.md`, "The check's reader"), given the split decision table of section 7.2 and the sessions under
   letters; every `asked` and `shown` is then confirmed at its place by a fresh executor agent before the count.

### Addendum 1 (section 8's slot, before the test of slice 2a)

The test of slice 2a is the outcome test below, taken whole with its pass rule, its handling probe, its "not
needed" and fail branches and its cost, with these settings:

- Arm S: the skill folder at `52f85967` (slice 2a). Arm C: the folder at `e8b6e028` (stage 1 reworked, before 2a),
  so the comparison isolates 2a. Each copied outside any tree.
- Scenarios and key: as frozen before the build (the key's SHA-256 is in the table at the top). Deviation: they
  were built from the coordinator's brief, not the design's one-page brief; the counts are the design's (verifier
  3, reader 4, quality critic 3), the kinds differ in part (verifier: a two-fact line merged to one, a requirement
  claimed met and not met, an unrequired addition; reader: a part-stated statement, a claimed step not done, a
  close-read trap, a leak; critic: a rule two links away, one rule with two values, an ambiguous step).
- Before any writer: a fresh Sonnet solver, with the key, confirms each answer is findable from the scenario's
  files; one that is not is replaced and the key re-hashed before the first writer.
- Writers, judges, confirmer, probe: native Sonnet subagents started by the coordinator, each fresh, each with an
  explicit list of what it may not open (the key, the other arm, the run directory beyond its folder, the record).
- The blind cell count is reported only, by a Sonnet reader below the top tier.

**The outcome test.** Question: does a judge briefed by a model that has only the pages catch what the record's
judges caught? The form is orchestrate's "An experiment on these rules": a hypothesis that can be false, frozen
material with its ground truth, a blind count, a stop rule, and a failed arm recorded, never rerun.

| | |
|---|---|
| arms | S: the pages after 2a. C: the pages before it. Each delivered as a copy of the skill's folder outside any tree that holds the record |
| scenarios | built before any brief by a fresh agent below the top tier that saw neither the analysis nor the design: **V**, a verifier on a change (a small skill, a diff that merges two tables, a dispositions file with which the gate exits 0, three known answers); **R**, the check's reader (four runs' outputs for six statements, four cells where a statement is stated in part, a rule that does not mention parts); **Q**, a quality critic (a draft skill with three planted defects) |
| the key | one file per scenario with its 3, 4 and 3 answers, ten in all, kept by the operator |
| writers | fresh Sonnet sessions, each given the arm's `SKILL.md` by path, the scenario's folder and one line: "you are at step N of the route; write the brief for this role to this file; start no agent". Two per role for S, one for C: 9 briefs |
| judges | each brief given, unedited, to a fresh Sonnet agent with the scenario's folder: 9 runs |
| the count | the operator marks each key answer `caught` or `missed` in each return, by the place the return cites; a fresh Sonnet confirmer opens every `caught`; one it cannot confirm is `missed`. A `part` mark on an R cell is `caught` only if the return does not count it as shown |
| the handling probe | two fresh Sonnet sessions, one per arm, given the pages, R's rule and a reader's return whose own total contradicts its marks, and asked for the verdict. Known answer: the verdict by the marks |
| reported, deciding nothing | the cell count of each core item of the analysis present in a brief, by a blind reader below the top tier; findings a judge returned that are not in the key; any brief that names an expected finding |

**Pass rule.** With `s1`, `s2` the two S runs and `c` the C run, each out of ten:

1. each of `s1` and `s2` catches at least 8, and at least 2 in every scenario;
2. the lower of `s1` and `s2` exceeds `c` by at least 3, and by more than the difference between `s1` and `s2`;
3. no S brief carries a key answer or names what to find.

- **Pass**: 1 to 3 hold. The six parts are adopted.
- **Not needed**: `c` catches 8 or more. The briefs' additions are dropped down to what a level-3 place in the
  record supports on its own, and the form is kept only if it shortens `critics.md`.
- **Fail** otherwise: a correction to the pages, the failed scenario's cells run once more with fresh sessions,
  then the user with both results.
- **Handling**, apart from the three: adopted if S's session gives the verdict by the marks. If C's does too, the
  section is kept on its record places only and marked untested by an outcome; if S's does not, the section is a
  correction.

Thresholds are the designer's choice (J). They follow `checks.md`, test cases, item 7: a margin counts only above
the difference between two runs of one version.

**Cost** (estimate, native tokens, no external spend): about 1.8M, of which about 1.5M on Sonnet; a rerun of one
scenario adds about 0.4M.

**What it cannot show.** One scenario a role and one model. Three roles: the architecture critic, the dry-run agent
and 2b's lenses use the same form and are not run. C has one run, so its own spread is unknown and rule 2 leans on
S's. The planted answers are of kinds the record already met; a judge that catches them may miss another kind.
