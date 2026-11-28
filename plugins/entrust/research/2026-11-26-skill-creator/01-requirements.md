# skill-creator: the requirements, round 6 (Fable F2, 2026-11-26)

Rewritten for the tracked record without private material. Section 1 states each owner requirement in neutral
words; no message of the owner is quoted. Citations of the owner's messages and of the studies are described, not
addressed, because those sources are private.

This sheet replaces the one of round 5. Against it: the owner's lines gain R71 to R75; R5, R12, R13 and R20 are
corrected; the twenty lines that were mechanisms and not requirements (R30 to R49) are moved to section 4 as design
decisions, M30 to M49, so that the design is no longer traced against itself; the decisions table loses its
constants and gains delivery. `CR2`, `CA2`, `CQ2` are the three critics of round 5.

`skill-creator` is a planned skill of the `entrust` plugin in this repository (main at `aa40ba0`): an agent loads
it to create a skill or to develop one. This file lists what it must do or be, each line with its source, and then
the decisions that any request to create a skill has to settle, with the default a standard or prior art gives. The
round's design delta (not kept in this record) traces every requirement to a step, a line or a check of the skill
under design.

Sources, as they are named below:

- "The owner's messages in this run" are private. Each row says which message or topic it means.
- "The study of the owner's sessions" and "the study of the repository's records" are two private readings. One
  collected what the owner required, corrected or rejected in six earlier sessions; the other read the
  repository's research records. `[S]` marks an item a model summarised, which may paraphrase.
- `CR`, `CA`, `CQ`: the three critics of round 4 (requirements, architecture, quality).
- "The run gaps" is `03-run-gaps.md` in this record.
- Repository paths are relative to the repository root. `orch/` is `plugins/entrust/plugin/skills/orchestrate/`.
- Prior art: Anthropic's example skill-creator; the sample skill-creator of OpenAI's Codex; obra's writing-skills;
  daymade's skill-creator.

"Stated" means the source says it. "Inferred" means I read it out of the source; the line says what the reading
rests on.

## 1. From the owner

| # | The skill must | Source | Stated or inferred |
|---|---|---|---|
| R1 | be one skill for creating skills and for developing them, in general, not a skill made from one session or one piece of feedback | the owner's second message in this run | stated |
| R2 | rest on best practice and on the owner's own experience of making skills, read from the transcripts | the owner's second message in this run; a later message asking whether the sessions had been read attentively | stated |
| R3 | let the agent run experiments sensibly | the owner's third message in this run | stated. Reading, inferred from the study of the owner's sessions (three places): bounded runs whose cost is stated first, evidence that already exists read cheaply, the measure fixed before the run, and under a quota the checks put in order, not struck out |
| R4 | let the agent choose concrete approaches | the owner's third message in this run | stated. Reading, inferred from the study of the owner's sessions (two places): one approach recommended, with its alternatives |
| R5 | work without clarifying questions | the owner's third message in this run; a later message asking for a procedure and not endless caveats | stated, and it reads two ways; both are requirements. (a) No question that the records, a convention or the goal settles, and no waiting for a go-ahead already given: six verbatim entries and three `[S]` in the other sessions. (b) No qualifying clauses in a skill's text: the later message in this run says it. The previous sheet wrongly said nothing supported (b) |
| R6 | work without crutches | the owner's third message in this run | stated. Reading, inferred from `AGENT.md:53-55`: the cause is fixed in the unit that produces it, never compensated with a special case, a retry or one more instruction |
| R7 | live in the entrust plugin | the owner's answer on where the skill lives | stated (decision) |
| R8 | be tested in full, with the bulk of the spend on Sonnet | the same answer | stated, for this build. As a rule the skill teaches: the cheapest evidence that can fail (inferred, from the study of the owner's sessions, two places) |
| R9 | be universal: bound to no single CLI or host; how a CLI is run is in entrust's adapters | the owner's answer on hosts | stated (decision) |
| R10 | carry the name the standard uses, `skill-creator` | the owner's answer on the name | stated (decision) |
| R11 | be selectable by an agent; nobody has to call it by hand | the owner's answer on who invokes it | stated (decision) |
| R12 | end, for this build, in a pull request | the owner's answer on delivery | stated, about the build. As a rule the skill teaches: how a finished skill is delivered and who writes that text is a decision of every request (R72) |
| R13 | be written by Fable, the pages that are tested included | the owner's answer on who writes the text | stated, about the build, and it reads two ways: Fable writes the skill and the PR text, or the skill only. The skill is Fable's under both; who writes the PR text is the owner's to say when the PR is opened. As a rule: the plan says who writes the text that is tested |
| R14 | set out how a skill is created, what text goes into it and how that text is written, as a procedure and not as caveats | the owner's message after the first design | stated |
| R15 | include an architecture critic that challenges the approach | the same message; the study of the owner's sessions (one `[S]` item) | stated |
| R16 | allow parts of existing skill-creators to be carried over | the same message | stated |
| R17 | never produce what the owner met before: a skill "created" as about ten thousand tokens of text on one page, with no reference files or other supporting files | the same message | stated |
| R18 | run its critics of architecture, of approach and of quality with a fresh context, on the top tier (Fable in the owner's account) | the owner's message on critics | stated (decision) |
| R19 | account in its design for this: an agent building a skill makes fundamental gaps and omissions even while it is reviewed | the owner's last message in this run | stated; the mechanism is mine to design |
| R20 | make developing a skill refer to references and use them | the last message in this run; the study of the owner's sessions (one earlier session) | stated. Two senses, both required: prior art and guidance read before the design, and reference files inside a skill (the message of R14). "Developing" covers a change to an existing skill as much as a new one, so the Change route needs its own reading of sources |
| R21 | make the agent analyse the request correctly and ask the right questions, and declare both in its text. The owner calls this the most important | the owner's last message in this run | stated |
| R22 | accept sessions and transcripts as material for a skill | the owner's first questions in this run | inferred: the owner's first question was where to build a skill from transcripts |
| R23 | have the agent do what its own tools can do (an export, subagents, a coordinator's role, a model chosen by need), not hand it to the owner as a question | three of the owner's messages in this run, on exporting transcripts, on using subagents and on the coordinator's role | stated for the build; inferred as a rule of the skill |
| R24 | have the approach agreed before the first version is built | the owner's message on agreeing the approach | inferred |
| R25 | keep the owner's goal as wide as he stated it, not narrow it into options | the owner's second message in this run, against the a/b/c options the coordinator had offered; the study of the owner's sessions | inferred |
| R26 | judge a proposal by the goal of the skill it changes | the study of the owner's sessions (two sessions, each with a message asking for the goal) | inferred from two sessions |
| R27 | do itself what it prescribes: its own change goes through its own critics and checks | the study of the owner's sessions (three entries) | inferred |
| R28 | cite a source only when it was opened | the study of the owner's sessions (one entry: a reference had been cited and not read) | inferred, one entry |
| R29 | speak to the user in plain words, the bottom line first | the study of the owner's sessions (four verbatim entries) | inferred |
| R71 | fetch a source that failed to load by another route before going on, because the evidence is needed | the owner's message on a failed export | inferred as a rule; the previous sheet read that message only as "use your own tools" |
| R72 | settle how the finished skill is delivered and who writes that text | the owner's answer on delivery | stated for the build; inferred as a decision of every request |
| R73 | read the user's sessions attentively: the reader is asked what the user required, corrected or rejected, and the reading can be checked by its quotes | the owner's message asking whether the sessions had been read attentively; the run gaps, "My reading" | inferred |
| R74 | choose the model each agent runs on by what its work needs | the owner's message on models (Sonnet, Opus or Fable by need) | stated for the build; inferred as a rule |
| R75 | say where the experience comes from when it is in a session: this conversation, or another session read from its transcript | the owner's first messages in this run | inferred |

R5 and R21 do not conflict. Together they say: few questions, the right ones, early, once; nothing asked that the
records, a convention or the goal settles.

## 2. From the repository's rules

| # | The skill must | Source |
|---|---|---|
| R50 | leave approval to its owner: a task request is not approval; a plan is proposed and waited on once, then carried through without asking at each step; blockers go in one message | `CONSTITUTION.md:10-13` |
| R51 | state the agent count and the models before any agents start | `AGENT.md:48` |
| R52 | list the requirements and their source; resolve from the records what they answer; present the remaining readings | `CONSTITUTION.md:17` |
| R53 | fix a cause in its unit; give each rule one owner; add no flag without the sentence that justifies it | `CONSTITUTION.md:21`; `AGENT.md:49-56` |
| R54 | look for prior work before settling the design of a new skill, and record what is reused, adapted or done differently | `RESEARCH.md:37-46` |
| R55 | fix the measure and its rule before the runs, and pick no favourable result afterwards | `RESEARCH.md:17-27`, `:91-92`; the study of the repository's records |
| R56 | keep what was gathered from sessions private | `AGENT.md:28-30` |
| R57 | keep the mechanical limits of a skill page, and survive Claude Code's compaction whole | `plugins/terse/plugin/references/genres/skill-page.md:5-12`; `scripts/skills.test.mjs:175-240` |
| R58 | restate nothing a model does unprompted, turn no dated measurement into an instruction, use no capitals for emphasis | `skill-page.md:16` |
| R59 | be complete inside entrust's installed directory: an install copies only a plugin's `plugin/` | `README.md:48` |
| R60 | carry `metadata.version` equal to the plugin's, and `license` | `plugins/entrust/evals/package.test.mjs:33-46` |

## 3. From prior art

Read as data. Each line is a default or a method the sources give, which the design takes unless a requirement
above says otherwise. What was taken, changed and left out was recorded per source in the design (section 7) and,
for the four pages read in round 6, in the design delta (section 4); neither file is kept in this record. The four
pages are public: `spec` is the open Agent Skills specification (https://agentskills.io/specification), `bp` is
Anthropic's skill authoring best practices
(https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), `cc` is Claude Code's skills
docs (https://code.claude.com/docs/en/skills) and `oai` is OpenAI's "Build skills"
(https://learn.chatgpt.com/docs/build-skills). The local copies' line addresses are dropped.

| # | The skill should | Source |
|---|---|---|
| R61 | take what the conversation already holds before asking, and ask only when the missing fact matters and cannot be inferred | Anthropic's example skill-creator; Codex's sample skill-creator |
| R62 | keep automatic selection as the default and make a skill explicit-only only on the user's request | Codex's sample skill-creator |
| R63 | respect a location the user gave; otherwise use the host's place for skills | Codex's sample skill-creator |
| R64 | find an existing owner of the job before creating a skill | daymade's skill-creator; obra's writing-skills |
| R65 | disclose detail progressively: metadata, then the body, then files read or run when needed | Anthropic's example skill-creator; Codex's sample skill-creator |
| R66 | write a description that says what and when, and does not summarise the workflow | obra's writing-skills; Codex's sample skill-creator |
| R67 | write a condition as something the agent can observe, with no nuance clause | obra's writing-skills |
| R68 | test with an independent agent given a realistic request and the raw artifacts, never the expected answer, in an isolated workspace, with the user's approval for a live system or a substantial cost | Codex's sample skill-creator |
| R69 | compare with a run without the skill, read the transcripts, and move code every run rewrote into a script | Anthropic's example skill-creator |
| R70 | check selection with near misses that share the skill's words | Anthropic's example skill-creator |
| R76 | keep the body within what the open format recommends: under 5,000 tokens and 500 lines, references one level from `SKILL.md` | `spec` |
| R77 | put the main use first in a description, because a host that lists many skills shortens descriptions | `oai`; `cc` |
| R78 | write a description in the third person, because it is placed in the agent's own instructions | `bp` |
| R79 | make a script self-contained, with its dependencies stated and errors it explains | `spec`; `bp` |
| R80 | test a skill with every model that will load it, starting from runs without it | `bp` |
| R81 | use one term for one thing, and keep time-bound facts out of the instructions | `bp` |

## 4. Design decisions, and the finding each comes from

These are mechanisms, not requirements: each is an answer a critic proposed and the design took. They are listed
so that a reader can see where a mechanism came from, and they are not rows of the verifier's table. M30 to M49
were R30 to R49 on the previous sheet; M82 to M95 come from the critics of round 5.

| # | The design | Source |
|---|---|---|
| M30 | open with the requirements: a sheet written from every message of the user, each line marked stated or inferred, before anything else is decided | CR gap 1, change 1; CA objection 2 |
| M31 | trace every later line to a requirement of the sheet: a requirement no line meets is a gap, a line that meets none is cut | CR gap 3, change 1 |
| M32 | settle explicitly the decisions every skill needs (hosts, invocation, name, place and the rest of section 5), from the request, the records, the sources' convention or a stated default | CR gap 6; the run gaps |
| M33 | survey sources as a step and record what was taken, changed and left out; a source not opened is written as not read | CR gap 2, change 2 |
| M34 | ask what the evidence cannot settle once, early, before the approach, each question with a recommendation | CR gap 1; CA objection 2 |
| M35 | give the architecture critic and the verifier every message of the user verbatim and the sheet; the critic derives the requirements itself before it opens the approach; the verifier returns one row per requirement | CR change 3 |
| M36 | treat a correction from the user as a step that re-derives from the sheet | CR gap 4, change 4 |
| M37 | have one route for creating or rewriting and one for a change, chosen at the top of the page | CA "the strongest alternative" |
| M38 | fix the order of the create route so that the plan, with every agent and its spend, precedes every agent, and the text is written once, after the measure | CA objection 1; CQ findings 1, 3; CR gap 5; `AGENT.md:48` |
| M39 | state each critic's tier once, in agreement with orchestrate, or change orchestrate | CA objection 3; CQ finding 4 |
| M40 | have one owner for the mechanical rules: the checker exports them and the repository's suite imports them; its command line runs only when the file is run directly; no number differs between the two | CA objection 4; CQ 3.3 |
| M41 | cover the open specification's limits: a `name` of at most 64 characters, a `description` of at most 1,024 | CQ 3.2 |
| M42 | measure selection with the vendor's own `skill-creator` among the candidates | CA objection 5 |
| M43 | have a step that runs the chosen check after the edit, and say who runs it | CQ finding 2 |
| M44 | choose the check by one rule, and be able to measure a failure of process (a question asked, a step skipped) | CQ finding 5 |
| M45 | say what the user is told at the end, and what follows a result that fails its rule | CQ finding 8, walk a.15 |
| M46 | state each fact once across its pages, and keep in its own text the rules it gives a writer | CQ findings 7, 9; `AGENT.md:55-56` |
| M47 | say where the run's working files are kept, and how a test session is kept from touching the skill, the repository or a live system | CQ section 4 |
| M48 | use only words its reader will know, and no enumeration where a principle serves | CQ section 2; the study of the owner's sessions (one `[S]` item: not everything can be listed) |
| M49 | have a test that can fail on the analysis: a replay of this run, against a control | CR gap 7, change 6 |
| M82 | runs the quality critic before the check, so that the check runs on the final text | CA2 objection 1; CQ2 walk a.11 |
| M83 | puts the rule that keeps or drops the work into the plan the user approves | CQ2 "Order" |
| M84 | sends the questions inside the plan, one message | CR2 change 7 |
| M85 | sizes the judges and the check to the route and the change, and says what a session with no user does | CA2 objection 2; CQ2 fix 7 |
| M86 | has the job walked stage by stage on the sheet, held against the sources and walked again by the architecture critic | CR2 gap 1 |
| M87 | has wide sources read by reader agents inside step 2, with a fixed question | CR2 gap 2 |
| M88 | gives the Change route its own sheet, sources, questions and observation | CR2 gap 4; CQ2 fix 1 |
| M89 | routes a failed check, a `stop` verdict and under-selection through the correction step | CQ2 fix 5, section 4 |
| M90 | defines when an existing skill owns a job and when it is a rival | CQ2 fix 3 |
| M91 | owns the three judges' briefs itself and keeps every host-bound fact in one file | CQ2 "Coupling"; CA2 objection 3 |
| M92 | names in each rule of the checker what the rule rests on, and leaves the repository's own walk in the repository's suite | CA2 objection 4 |
| M93 | reports a selection margin inside the run-to-run noise as undecided | CA2 objection 5 |
| M94 | decides a disputed approach by the sheet, and offers a check that compares two approaches | CR2 change 5 |
| M95 | states each fact of its own pages once, with its standing rules before the steps | CQ2 section 2 |

## 5. The decisions any request to create a skill must settle

The skill's first step fills each of these, in this order of sources: the user's words; the repository's
instructions and records; the convention the surveyed sources share; the default in the second column. Against
the previous sheet the table has eight rows where it had thirteen. Five were constants of the procedure and never
opened (CQ2): what the skill draws on, its structure and budgets, who writes its text, who checks it, and what the
agent does itself. The first two are now what steps 2 and 3 do; who writes and who checks are lines of the plan,
where the owner sees them (the owner's messages on the writer and on the critics); the last is a standing rule.

The previous table's column that named the owner's messages settling each decision is dropped here, because those
messages are private. The decisions and their values stand.

| Decision | Default from a standard or prior art | For this skill |
|---|---|---|
| The job, and what it leaves to others | none: it is a question | create a skill and develop one; collecting feedback from sessions stays with prepare-feedback |
| What it governs: each stage of the job as walked, with steps or left to the agent | steps for every stage; a stage left to the agent names the source that shows agents do it unprompted | analysis and questions, sources, structure, text, judges, checks, corrections, delivery |
| Who invokes it | an agent selects it by its description; the user can also name it (Codex's sample skill-creator; `oai`) | agent-selected |
| Which hosts and models load it | any host of the open format; a fact true of one host is written with that host's name, in one place | host-neutral; host facts in `references/hosts.md` |
| Its name | the name the sources use for the job, within the open specification's syntax (`spec`); else a short action-first name | `skill-creator`; the clash with the vendors' own skill is measured, not avoided |
| Where it lives | where the user said; else beside the skills of the plugin or repository it belongs to; else the host's personal skills folder (Codex's sample skill-creator; `cc`; `oai`) | `plugins/entrust/plugin/skills/skill-creator/` |
| What it uses and touches outside its folder, and what in it is private | it uses what the repository already has and adds nothing new; it changes nothing outside; session material is private (`CONSTITUTION.md:21`; `AGENT.md:28-30`) | sessions through orchestrate's call page and the adapters; it writes only the skill being made and the run's files |
| How the result is delivered, and who writes that text | as the repository's instructions say; else the files in place and the result message | a pull request |

Lines of the plan, shown on every run and not decisions of the sheet: who writes the text and on which model
(the owner's message on the writer: Fable); every judge and session with its model (the owner's message on
critics: the two critics on the strongest model); the check and the rule that keeps or drops the work (the owner's
message on testing: the full test, the bulk on Sonnet).

## 6. Conflicts found while listing, and how each is held

- **R18 against an earlier preference.** An earlier preference for cheaper defaults (the study of the owner's
  sessions, `[S]`) is overridden by the later explicit decision on critics for this skill, so R18 stands. The design keeps the cost visible:
  the plan names every agent with its model before one starts, and a model the user names replaces the default.
- **R50 against an earlier item.** One `[S]` item in the study of the owner's sessions pulls against a plan gate;
  its context is not in the corpus. `CONSTITUTION.md:10-13` is the owner's written
  rule, and he kept a plan gate in the review skill after it had stopped four of four pilot reviews (the study of
  the repository's records). This is question Q3; the design (section 9) settled it, and the coordinator let that
  stand in round 6.
- **R8 against an earlier waiver.** An earlier session deferred evals. For this build
  he ordered the full test (the owner's answer on testing). The skill's rule is the check for the claim, with the
  spend in the plan, so the user can cap it there.

## 7. What these requirements do not cover

- Whether a skill made with this procedure is better than one made without it. No source demands a number; the
  owner's first real creation is the measure, and the test protocol (`02-test-protocol.md`) says what v1 can show
  before that.
- Hosts other than Claude Code and Codex. The open format is the only claim.
- 61 requirements: R1 to R29 and R71 to R75 from the owner (34), R50 to R60 from the repository (11), R61 to R70
  and R76 to R81 from prior art (16). Of the owner's 34: 16 stated, 5 stated with a reading I inferred (R3 to R6,
  R20), 13 inferred (R22 to R29, R71 to R75). Beside them, 34 design decisions (M30 to M49, M82 to M95), which the
  verifier's table leaves out.
