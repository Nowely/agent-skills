# skill-creator v1: the test, round 6 (Fable F2, 2026-11-26)

Rewritten for the tracked record without private material; the frozen original's SHA-256 is eaaa83c708abf5b33299b699829972d1a01042565d5d5325290ade50aee3799f, frozen 2026-11-26T17:52:15Z.

Rules, thresholds, measures and ceilings below are those of the frozen original. Three kinds of wording differ: the
test prompts and the scripted replies, which the original wrote in Russian, are given in English; the owner's
messages and the private corpora are named by description, never quoted; and local paths are replaced by
placeholders such as `<run-dir>`.

**This file replaces the earlier draft of the protocol; that draft was never frozen and is not to be run.** Nothing
below has been run. Against the draft: the skill is the round's page set; Part S briefs the judges from the skill's
own `critics.md`; Part C adds a walk of a one-line change; Part R's rule requires the three fundamental decisions
and gains D12 and D13; Part A counts the stops for the user; Part B2 has an undecided band; Codex is recorded as
uncovered. Freeze this file, by its SHA-256 in the run's `rounds.md`, before Part S starts. After that it changes
only by a numbered addendum that says what changed and why; a result never changes it (`RESEARCH.md:91-92`).

The skill under test is the round's page set, placed at `plugins/entrust/plugin/skills/skill-creator/`, with the
other changes of the design delta (section 2). The operator is the coordinator, in its host session. It starts
every session by entrust's own routes: an external run through the shared call page
(`plugins/entrust/plugin/skills/orchestrate/references/external.md`, "call page §n") with the adapter's page
(`plugins/entrust/plugin/skills/claude/references/external.md`), and native agents briefed with their roles by
path. It types no model CLI command itself.

## 0. The questions, the parts, the spend

Five questions, never pooled (`plugins/entrust/evals/review/protocol.md:65-69`):

| Part | Question | Sessions | On | Ceiling |
|---|---|---|---|---|
| S | Do the skill's own critics and verifier, run on the skill itself, leave an objection open? | 2 critics, 1 verifier; 1 more critic after fixes | Fable; the verifier on Sonnet | the agents named |
| C | Can a literal reader walk a creation request to the plan, and a one-line change to its end? | 2 read agents | Sonnet | two agents |
| R | Given the owner's first two goal messages, does a session with the skill raise the decisions the owner had to raise himself, against a session without it? | 6 sessions, 1 reader | Sonnet; the reader on the strong tier | 20 dollars |
| A | On a pending change to a skill, does a session that follows the page differ from one that does not, in outcomes the owner's corrections name, and at what overhead? | 4 sessions, 4 verifiers, 1 reader; a second case adds 2, 2 and a read | Sonnet; the reader on the strong tier | 60 dollars, then 30 |
| B | Is the skill selected for the requests it is for, alone and beside the vendor's `skill-creator`? | 60 eval sessions a run, at most 4 runs | Sonnet | 40 dollars |

Order: S and C on the candidate before it is frozen; then R, A and B on the frozen candidate. The top tier appears
only in Part S, one agent at a time; the strong tier only as the two readers. Every other token is Sonnet's. The
operator spends nothing beyond a ceiling without the owner's word. The ceilings are chosen, not measured.

**The landing rule.** v1 lands when all hold: Part S ends with no open objection that names a requirement; Part C
ends with no open halt; Part R is "Pass"; Part A is "Keep". Part B's failure blocks landing only by
its own rule (B4). Anything else goes to the owner with the records and no recommendation added after the fact.

## 1. Names and preflight

```bash
REPO=<the repository checkout>
RUN=<a new private directory, outside the repository and outside the state directory>
BASE=aa40ba0                  # main without the skill
CAND=<the commit of the frozen candidate: the skill and its three dependents>
PAGE=plugins/entrust/plugin/skills/skill-creator/SKILL.md
RIVAL=<the directory of the vendor's skill-creator as this machine holds it>
```

`<orchestrate>` and `<state>` are as the call page defines them (`external.md:14-19`). Record each result:

| # | Check | How | If it fails |
|---|---|---|---|
| P1 | the operator's host has entrust's relay and launcher | the `entrust:relay` agent type is offered; `<orchestrate>/scripts/agent-run.mjs` exists | stop and tell the owner: the route is not available here |
| P2 | the adapter is ready | `node <claude-skill-dir>/scripts/status.mjs --json` says `ready`; it calls no model (`claude/references/external.md:9-10`) | stop; report the status |
| P3 | an external run works | one read agent through call page §§1-4: `RIGHTS: read $REPO`, `MODEL: sonnet`, `TASK: Print the first line of $REPO/README.md.` | stop; report the launcher's lines |
| P4 | a continuation works, and how `cost` behaves across it | continue P3 with `RESUME:` and `TASK: Print its second line.`; note whether the second report's `cost` is that run's or the sum | if it is the sum, overhead takes each session's last report |
| P5 | the suites pass at both commits | in clean clones at `$BASE` and `$CAND`: `node scripts/skills.test.mjs`; from `plugins/entrust`, `node evals/package.test.mjs`, `node evals/orchestrate.test.mjs`, `node evals/fragments.test.mjs`; at `$CAND` also `node evals/skill-check.test.mjs` | a suite red at its commit is excluded for that arm and noted; `skill-check` red sends the candidate back |
| P6 | the candidate keeps its own rules | in the clone at `$CAND`: `node plugins/entrust/plugin/skills/skill-creator/scripts/check.mjs plugins/entrust/plugin/skills/skill-creator` exits 0 | back to the build |
| P7 | which skills the profile offers | P3's report `context` and transcript: every listed skill whose job is creating skills, by its full name | nothing: it is recorded; Part B2 needs at least one |
| P8 | the vendor's skill is on this machine | `$RIVAL/SKILL.md` exists | Part R's third arm and Part B2 use the profile's own copy, by the path P7 shows; with none, both are recorded as not run |

Not tried by anyone: P1 to P4, P7. `codex` and `opencode` are absent from this container.

No tokens, already done on the unfrozen candidate, in a copy of the tree (design delta, section 1): the suite's
rules 1 to 8 list the same violations on the repository and on a tree of planted violations before and after the
change; the candidate passes 11 of 11; `skill-check.test.mjs` passes 3 of 3. The rules' titles changed in round 6,
so "the same" holds for the violations listed, not for the titles.

## S. The skill's own judges, on the skill

This is Create's steps 4, 7 and 9 applied to skill-creator, which its own routes demand of any work on a skill
(R27). Each agent is native, fresh, and briefed by path with its section of the candidate's
`references/critics.md`, which now holds the whole brief.

| Agent | Model | Gets, by path | Returns |
|---|---|---|---|
| architecture critic | the strongest (Fable) | the file of the owner's messages in this run (private; entries from the first goal message to the last); `01-requirements.md` as the sheet; the sources tables (design, section 7, and design delta, section 4); the approach and layout (design, sections 1 to 3, as amended by design delta, section 1) | its verdict; the requirements and stages it derived that the sheet lacks; questions not asked; decisions filled against the sources |
| quality critic | the strongest (Fable) | the candidate's directory in a clone; the sheet; `structure.md`, `writing.md`; its section | `sound` or `change`; ranked objections, each with a file and line |
| verifier | the ordinary working model (Sonnet) | the messages file; the sheet with the traces of design section 6 and design delta section 5 as its `met at` column; the candidate; this protocol as the rule | one row per requirement and decision; each message with a requirement the sheet lacks |

The architecture critic runs first; on `change approach` or `stop` nothing else starts and the owner is told.
Objections are settled as `critics.md` says; a second fresh quality critic reads only after a fix that changed
what a step tells the agent to do. Recorded in `rounds.md`: each return as returned, each objection with how it
was settled and the place read, the regression count of a second read. Known limit: this is the third round of
fresh critics on a paper design, and the repository's record is that such rounds do not converge (the study of the
repository's records); the sessions of Parts R and A are the first evidence of another kind.

## C. A creation request, walked

One external read agent on Sonnet (`RIGHTS: read <a clone at the candidate>`), briefed with the "page dry run" row
of `plugins/entrust/research/roles.md` by path, walks this request through the skill's files and runs nothing (the
original request is in Russian; this is its English rendering):

```text
Make a skill that carries out a release of this repository's plugin by <clone>/RELEASING.md.
```

It reports each step of Create, up to and including the plan of step 3, where a literal run halts, must guess or
reads a line two ways, with the file and line. The request was fixed by F1 because the job is real here, has a
written procedure to draw on and has no skill today.

A second read agent, briefed the same way, walks a one-line change to the end of the Change route (again an English
rendering of a Russian request):

```text
In <clone>/plugins/entrust/plugin/skills/cleanup/SKILL.md the steps do not say what to do if the state directory is not found. Add that.
```

The premise of this request was not checked against the page; a walk that ends at "the rule is already stated"
is a valid walk. It reports the same, and also counts what the route would start for this request: stops for the user, sessions,
judges. Rule for both walks: every halt is fixed before the freeze, or recorded as a known gap with the reason;
the counts are recorded. A count above one stop, one case of two sessions and one judge for the second request
is a halt.

## R. The replay of this run

**What it asks.** In this run the owner stated the goal in two messages (the first two goal messages) and then
raised thirteen decisions himself, after designs existed. Does a session that follows the skill raise them at its
first stops?

**Arms**, two sessions each, all external Claude runs on Sonnet, started together:

| Arm | Tree | Added to the prompt |
|---|---|---|
| `s1`, `s2` | a clone at `$CAND` | the delivery line naming `<clone>/$PAGE` |
| `c1`, `c2` | a clone at `$BASE` | nothing |
| `v1`, `v2` | a clone at `$BASE` | the delivery line naming `$RIVAL/SKILL.md` |

**Material.** A private corpus folder in `$RUN` holds five corpora of the owner's earlier sessions on other
subjects (private; their file names are not given in this record). The file of this run's own messages is not
there: it holds the answers. One of the five files is left out of the corpus folder and placed in a separate
archive folder; the prompt names all five. This reproduces a source that did not load, which the owner raised
in this run, in every arm alike. All of it is private and stays in `$RUN`.

First invocation, the control (the original is in Russian; this is its English rendering):

```text
RIGHTS: write <the session's work directory>
MODEL: sonnet
EFFORT: <the operator's effort>
ALLOW_NO_COMMANDS: yes
TASK: Repository: <clone>. Its rules: <clone>/AGENT.md and <clone>/CONSTITUTION.md; read them before you work. I am the owner of the repository. Messages from my earlier sessions about skills are in <the corpus folder>: <the five file names>. Write working files in <the session's work directory>. I will answer your questions in the next message.
<the owner's first goal message, verbatim>
<the owner's second goal message, verbatim>
```

The other arms add one line before the owner's text:

```text
Work by the page <path>: read it whole and follow it; read the files it links at the step where it refers to them.
```

**The scripted owner.** After each answer the operator applies the first rule that fits and writes the
classification to the session's `replies.md` before sending:

| # | The answer | Reply |
|---|---|---|
| Q1 | asks questions and shows no plan, or names reader agents and waits | `Yes, read. I am not answering the questions for now: act on your own recommendation for each, and show the plan.` |
| Q2 | shows a plan, or reports work done, or asks nothing | none: the session ends |

A session also ends after its third invocation, when its summed `cost` passes 4 dollars, or when the launcher's
bounds cut it; such a session is kept and marked incomplete, never rerun for a better number. Requests (call page
§5): the operator accepts a command that only reads, and a write inside the session's `work` directory; it
declines the rest, the same in every arm. A session that the page tells to start reader agents cannot start
them in an external run; the page's standing rule has it say so and read what it can itself.

**The decisions**, fixed now. The original table also named, per decision, the owner's message where he raised it;
that column is dropped here because those messages are private.

| # | Decision |
|---|---|
| D1 | where the skill lives: which plugin or folder |
| D2 | how much is tested, and on which model the spend falls |
| D3 | which hosts or CLIs the skill is for, and that sessions go through the repository's adapters |
| D4 | the skill's name, by the standard |
| D5 | who invokes it: an agent, or the user by hand |
| D6 | which model writes the skill's text |
| D7 | that the skill must set out how a skill's text and files are written: a procedure, reference files, a limit on size |
| D8 | an architecture critic of the approach, as part of the procedure |
| D9 | which critics run, with a fresh context, and on which tier |
| D10 | that the skill itself must make its user analyse the request, ask early and use prior art |
| D11 | what the agent does with its own tools, such as reading the sessions with subagents, and does not hand to the owner |
| D12 | that a source which did not load is fetched another way and not passed over |
| D13 | how the finished skill is delivered, and who writes that text |

Left out: one message that was only an approval.

**The reader.** One strong-tier native agent, fresh, that has seen neither the design nor the pages. It gets the
table above and, per session, every answer in order and every file in `work`, under
letters A to F drawn by `shuf`; the key stays with the operator. For each decision and session it returns one
mark with the place that shows it:

- `asked`: put to the owner as a question;
- `shown`: stated as a requirement, a decision or an assumption the owner could overrule, with its value;
- `absent`: neither. A decision the session settled without showing it is `absent`.

D12 is marked by the operator from the session's commands and answers: `shown` when the session read the file
from the archive folder, or said it was missing and what it did about it; `absent` when it went on with four.

The operator opens every `asked` and `shown` at its place before counting; one it cannot confirm counts as
`absent`. Blinding is partial: a session's files can give its arm away.

**The measure and the rule.** A session's score is its count of `asked` and `shown`, of 13. D7, D8 and D10 are
the decisions the owner called fundamental (in his two later messages on the skill's content and on analysis).

- **Pass**: `s1` and `s2` each score 10 or more; each has D7, D8 and D10 `asked` or `shown`; and the lower of
  them exceeds the higher of `c1` and `c2` by 3 or more.
- **Back to design**: either skill session scores below 7, or below the higher control session; or D7 or D10 is
  `absent` in both skill sessions; or both skill sessions are incomplete.
- **Undecided** otherwise: reported; no second run.

Reported beside it and deciding nothing: the vendor arm's scores; for each `shown`, whether its value is the one
the owner later chose; the questions each session asked that the corpus or the repository settles, counted by the
reader with the place that settles each; each session's invocations and cost.

**What it cannot show.** The designer read the file of this run's messages before writing the sheet. D1, D3, D4, D5
and D13 are rows of its decisions table, D6 and D9 are lines its plan always shows, D11 and D12 are a standing rule
and a rule of the sources step. Those nine test that the page is followed. D7, D8 and D10 have no row: they can
appear only if the session walks the job and reads the sources, which is why the rule names them. All of it is a
regression check on one run, not held-out material (`RESEARCH.md:50-51`); with two sessions an arm it shows that
an event occurred, not a stable difference (`RESEARCH.md:89-90`). The owner's first goal message opens with a
reference to an earlier turn that the sessions do not have; every arm gets the same text.

## A. A pending change, with the page and without

### A1. Case selection

Rule: open ledger entries that change a skill's pages and whose issue text leaves a choice open. Pool, fixed by
F1: E117 (`plugins/entrust/ISSUES.md:473`) and E104 (`:374`). Second case: terse's E141
(`plugins/terse/ISSUES.md:10`).

```bash
D=$(git -C "$REPO" show "$CAND:$PAGE" | sha256sum | cut -c1)
case "$D" in [02468ace]) CASE=E117;; *) CASE=E104;; esac
```

Known limit: both designers read all three entries; the pages take no example from them.

### A2. Routes

| Decision | Choice | Evidence |
|---|---|---|
| how a session is started | an external Claude run, adapter `claude`, model `sonnet`, through `--new` and a relay | Its report carries `cost`, `usage`, `commands`, `fileChanges`, `transcriptPath` and `sessionID` (`claude/references/external.md:69-72`). A native subagent's token figure is its last call's context, not its total (E96, `plugins/entrust/ISSUES.md:279-283`), so overhead cannot be read from it. The same protocol runs on another adapter by changing one word |
| isolation | one clone per session, made by the operator, and `RIGHTS: write <clone>` | The arms need different commits: the control tree must not hold the skill. A clone at a chosen commit gives the prompt absolute paths, which the adapter asks for (`claude/references/external.md:28`) |
| the scripted replies | a new invocation with `RESUME: <the previous REPORT= path>`, under a fresh report path, model and effort set again | call page §6 (`external.md:338-344`) |
| delivery of the page | by path: the first prompt names the page's absolute path in the session's own clone | An external Claude run uses the user's configuration, and no field loads a plugin from a tree (`claude/references/external.md:18-28`); reading a page by path is the adapter's route for any turn that did not type the command (`claude/SKILL.md:82-85`), and it is the same on every host |
| the common endpoint | the operator starts one fresh verifier per final diff, the same brief in both arms | An external Claude run has no Agent tool (`claude/references/external.md:39`). The page's standing rules tell such a session to say so in its plan, do the steps that need no agent and name the rest in its result. Both arms end at "reports the change" |

By-path delivery means Part A measures the page as read and followed. Whether an agent would have chosen the skill
is Part B's.

### A3. Trees, prompts, replies

```bash
for id in c1 c2 s1 s2; do
  rev=$BASE; case $id in s*) rev=$CAND;; esac
  git clone -q --no-hardlinks "$REPO" "<run-dir>/a/$id/repo" && git -C "<run-dir>/a/$id/repo" checkout -q --detach "$rev"
  mkdir -p "<run-dir>/a/$id/tmp"
done
```

Here `<run-dir>` is the private directory `$RUN`. Each run gets its own `tmp` directory as `TMPDIR`, since a Claude
agent inherits the caller's temporary directory (`external.md:39-41`). The four first invocations start together.

First invocation, control; `<entry>` and `<plugin>` come from the case (English rendering of the Russian original):

```text
RIGHTS: write <clone>
MODEL: sonnet
EFFORT: <the operator's effort>
ALLOW_NO_COMMANDS: yes
TASK: Repository: <clone>. Its rules: <clone>/AGENT.md and <clone>/CONSTITUTION.md; read them before you work. I am the owner of the repository; I will answer your questions in the next message.
Fix <entry> from <clone>/plugins/<plugin>/ISSUES.md.
```

The skill arm adds, before the last line, the delivery line of Part R with `<clone>/$PAGE`. Later invocations, both
arms: `RESUME:`, `MODEL:`, `EFFORT:`, `ALLOW_NO_COMMANDS: yes` and `TASK: <the reply>`. No `CHECK:` or `RETURN:`
line is written: either would tell a session what is measured.

Requests: the operator accepts a command that only reads, a test suite of the repository, or the skill's
`scripts/check.mjs`, inside the session's clone; it declines a commit, a push, a network call and a write outside
the clone. The same in both arms; each request and decision is recorded.

The scripted owner; the classification is written to the session's `replies.md` before the reply is sent:

| # | The answer | Reply |
|---|---|---|
| R1 | proposes a plan or a change and asks for approval, for the first time in this session | `Yes.` |
| R2 | asks anything else: a choice, a clarification, a go-ahead, approval a second time | `Decide it yourself by the repository's principles; ask only what they do not settle.` |
| R3 | reports the change made | none: the session ends |
| R4 | reports that nothing was changed, and asks nothing | none: the session ends |

An answer that fits no rule, or two, takes R2; one that both reports and asks takes the question's rule.

### A4. Stop rule and measures

A session ends as incomplete when its summed `cost` passes 15 dollars, after its 8th invocation, or when the
launcher's bounds cut it (call page §8). Once the first control session has ended, any session whose cost passes 3
times that one's also ends as incomplete. An incomplete session is kept and reported, never rerun; a run refused
at launch or lost with no report is rerun once from a fresh clone, both attempts kept.

Collected per session: `diff.patch` (`git -C <clone> add -N . && git -C <clone> diff <rev>`), `answers.md` (each
invocation's five fields, in order, without the prompts), `replies.md`, every report, the requests and decisions.

The verifier, one per ended session: a fresh native agent on the executor model, briefed with the verifier's row
of `orchestrate/references/roles.md` by path, the entry's text verbatim as the requirement, the clone's path,
`diff.patch` and the suites to run. It writes nothing in the clone. The four briefs differ only in the path.

| Id | Measure | By | How |
|---|---|---|---|
| M0a | the suites pass on the final tree | verifier | `node scripts/skills.test.mjs`; for an entrust case `node evals/package.test.mjs`, `node evals/orchestrate.test.mjs`, `node evals/fragments.test.mjs` from `plugins/entrust`; for a terse case `node plugins/terse/evals/pages.test.mjs` |
| M0b | the change resolves the entry | verifier | its requirement to evidence table against the entry's "Issue text": yes, partly or no |
| M1 | questions the repository settles | reader | for each R2 question, the path:line that settles it, or "the owner's to answer"; the count of settled ones. The operator adds approvals asked more than once |
| M2 | facts lost | reader | for each sentence the diff removes or rewrites, the path:line in the final tree where a reader of that page still meets the fact with its conditions, or "lost" |
| M3 | unrequired additions | reader | for each sentence, option, file or test the diff adds, the words of the entry that require it, or "none" |
| M4 | a keep-or-revert rule, the unmeasured part and the checks still needed were stated | reader | yes or no, with the answer. Reported; gates nothing |
| M5 | the page checks ran after the last edit and before the answer that reports the change | operator | the reports' `commands` and `fileChanges`, in order; yes or no |
| M7 | stops for the user before the first edit | operator | the count of answers classified R1 or R2 before the first report with `fileChanges` |
| M6 | overhead | operator | each session's cost from its reports (P4 says whether to sum); the skill arm's median over the control's. Beside it, unadded: `usage` per report, invocations, requests asked, each verifier's tokens |

The reader: one strong-tier native agent, fresh, that has seen neither design nor page. It gets the entry's text,
a clean clone at `$BASE`, and per session `diff.patch`, `answers.md` and the R2 questions, under letters A to D
drawn by `shuf`. It is told only: "four attempts at the same ledger entry; answer each item for each attempt with
the place that shows it". Blinding is partial. The operator opens every "lost" and every "settled" at its place
before counting; one it cannot confirm is unresolved and counts for neither arm. On request the owner gets the
four diffs by letter, and his read replaces the reader's on M2 and M3 and the verifier's on M0b.

### A5. The rule

A session is **clean** when M0a and M0b are yes, M1 = 0, M2 = 0 and M5 is yes. An incomplete session is not clean.

- **Keep** when all hold: `s1` and `s2` are clean; each skill session's M3 is no greater than the larger of the
  two control sessions'; at least one control session is not clean, or has an M3 greater than both skill
  sessions'; overhead is at most 2.
- **Back to design** when any holds: a skill session has M2 > 0; a skill session has M0b "no" while a control
  session has "yes"; a skill session's M1 is greater than both control sessions'; a skill session's M7 is above
  1; overhead is above 3; both skill sessions are incomplete.
- **Undecided** otherwise, both controls clean included: the second case, E141, one session per arm, same
  prompts, replies and measures, the same rule with "both" read as "the one". Undecided again: nothing lands, and
  both records go to the owner.

The thresholds are F1's and are chosen, not measured. The measure of overhead rests on the study of the owner's
sessions: overhead, not speed, which depends on the task.

## B. Selection

Two runs of the same cases, which answer different questions.

**B1, the skill alone.** The repository's official trigger harness,
`plugins/terse/evals/clarity-trigger.official.mjs`, stages a `claude plugin eval` and grades whether the Skill tool
was called with the skill's name. Today it is bound to terse and to `clarity` (its lines 14-21 and 32), so the
build first gives it the plugin directory and the skill's name as arguments, with clarity's values as defaults;
that change has its own test and is part of the candidate. Preflight, no tokens: `claude plugin eval --help`
prints usage; the staged suite is inspected in the harness's default mode, which runs nothing.

**B2, the skill beside the vendor's.** The repository's live probe, `plugins/terse/evals/clarity-trigger.live.mjs`,
starts sessions in the owner's ordinary profile with the candidate loaded from a directory and the installed copy
of the plugin switched off (its lines 33-35). It needs the same two arguments, and its grader must record which
skill was called: `entrust:skill-creator`, another skill named `skill-creator` (the vendor's, by the full name P7
recorded), another skill, or none. B2 runs only when P7 found the vendor's skill listed in that profile; if it is
not listed, the operator loads `$RIVAL` as a second plugin directory, and if the CLI refuses a second one, B2 is
recorded as not run and the name clash stays unmeasured, which the release notes then say.

**B3. Cases.** One Sonnet agent that has seen neither the description nor any earlier case writes them, in the form
of `plugins/terse/evals/clarity-trigger/holdout.json`, from this brief only: "12 requests a person might type when
they want a skill for an agent created, or an existing skill rewritten, fixed, cut or improved, some after a
failure or feedback; and 8 near misses, two each: collect feedback on a skill from past sessions; improve a README
or another text for human readers; run or explain an existing skill; install or enable a skill. Each with the
facts it needs inside the prompt." Each case runs 3 times: 36 positive and 24 negative sessions a run. After any
change to the description a fresh set is written the same way (`plugins/terse/evals/clarity-trigger.live.md:13`).

**B4. The rules.** One run of three per case cannot separate descriptions that differ by a case or two: the same
description scored 24 of 36 and 29 of 36 in one day (the study of the repository's records). So the rules are
coarse.

- B1 **fails** when fewer than 18 of 36 positive sessions call the skill, or any near-miss kind calls it in 3 or
  more of its 6 sessions. The description is revised once, a fresh set is written, and the run repeated; a second
  failure goes to the owner as a blocker with both tables. Otherwise the fractions are reported and the owner sets
  the release threshold, as `RELEASING.md:116-117` has it for clarity.
- B2 compares, over the 36 positive sessions, the count that called `entrust:skill-creator` with the count that
  called the vendor's skill. The band is 5, the difference recorded between two runs of one description. This
  skill ahead by 6 or more: **passes**. The vendor's ahead by 6 or more: **fails**; the remedy is fixed now: one
  sentence in the description that says to use this skill where both are listed, as daymade's fork of
  skill-creator does, a fresh set, and one repeat; a second failure goes to the owner with both
  tables. Anything between is **undecided**: the three fractions go into the pull request and the release notes
  as an open risk, and the owner decides whether it blocks.

**B5. Cost and record.** About 6 dollars for a B1 run, scaled from the 4 dollars recorded for 14 cases run three
times, and about 21 for a B2 run, scaled from 15 (the study of the repository's records); at most two runs of each.
Recorded: the cases file and its writer's brief, the model and CLI version, the settings, the fractions per case,
where the traces are.

**B6. What Part B cannot show.** Selection on Codex, which the pull request and the release notes record as
uncovered, with the owner's first real Codex run as its measure; whether a selected page is then followed; selection in a
profile other than the owner's.

## D. The record

In `$RUN`, and, rewritten without private material, in `plugins/entrust/research/2026-11-26-skill-creator/`:

- this file's SHA-256 and freeze time; `BASE`, `CAND`, `D`, `CASE`; the preflight results;
- for every invocation: the adapter, the report path, the relay, the model and effort asked for and the model the
  report names, the report's `context`, the launcher's status lines;
- delivery, for each session given a page: which of the skill's seven text files its commands show read, and
  whether `SKILL.md` was read whole: yes, partly, no or unknown, with the report line; whether it ran `check.mjs`;
  for every session, any Skill-tool call and its name; for each control session, any read of a path under
  `skills/skill-creator`;
- per session: prompts, reports, `answers.md`, `replies.md` with each classification, requests and decisions,
  `diff.patch` or the `work` files, its status;
- the critics', verifiers' and readers' returns as returned; the letter keys; every count the operator could not
  confirm; the owner's read if he gave one;
- the tables of measures, each verdict and the clause that produced it;
- every deviation from this file with its reason, and what the run could not observe.

The transcripts, `answers.md`, the corpora and the owner's two goal messages stay in `$RUN`. The tracked record
carries counts, verdicts, prompts with paths shortened and the owner's text left out, and this protocol.

## E. What this says about universality

- **Can say.** How the pages work when a Sonnet session reads them by path and follows them, a route that is the
  same on every host. Whether an agent in Claude Code picks the skill, alone and beside the vendor's.
- **Cannot say.** Anything about a Codex or OpenCode model reading the pages; selection on Codex, where the skill
  ships no `agents/openai.yaml` and is offered automatically by Codex's documented default, and where OpenAI's
  "Build skills" page (https://learn.chatgpt.com/docs/build-skills) says two skills of one name both appear and
  that a `skill-creator` is built in; nobody here has seen either happen; the typed command on either host;
  behaviour after a compaction.
- **Cheapest later evidence for Codex**, on a machine that has the `codex` CLI: (1) no tokens: after
  `codex plugin add entrust@nowely` from the candidate, the plugin's skill list shows `entrust:skill-creator`;
  (2) Part C repeated by a Codex model, a read agent through the same call page with adapter `codex`; (3) if that
  is clean and the owner wants more, Part R's `s1` and `s2` repeated with adapter `codex` and read against the
  recorded Claude sessions. Until (2) has run, the entrust CHANGELOG's "Gate and limits" for the release names
  Codex as unmeasured.
