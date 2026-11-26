# Change spec v4: entrust `orchestrate` as a lean, native-only coordinator mode

v4 supersedes `spec-v3.md` (v1 → v2 → v3 → v4) and fixes the plan critic's diff-read objections N1–N5.
v3 separated the plan critic from the
architecture critic, at the owner's word (2026-11-22). v2 folded in the plan critic's seven objections (C1–C7) and the roles survey
(`roles-survey.md`, elements E1–E7). Both files sit in the same scratchpad directory as this one:
`/tmp/claude-0/-home-user-agent-skills/09d54ed5-0860-52ea-8562-75bff29ae4f6/scratchpad/`. The independent
review is `fable-review.md` there (findings F1–F12, test map in its section 5).

Repository: /home/user/agent-skills, branch `claude/pensive-pascal-hpwkue`, HEAD `def9f23` (entrust 0.44.0).
Paths are under `plugins/entrust/plugin/skills/` unless they start with `plugins/` or `scripts/`. Rules that
bind every edit: `/home/user/agent-skills/AGENT.md` and `CONSTITUTION.md`.

## Why

- **The owner's practice.** Most tasks need few agents. Every task needs a coordinator, plus an independent
  check of the result.
- **Other providers.** They are often unavailable (quota, no sign-in), and pulling them in by default is
  costly.
- **Compaction.** The main session loses its coordinator role after a compaction. Claude Code re-attaches an
  invoked skill's body after a compaction (`scripts/skills.test.mjs:243-256`, measured on 2.1.280), but not
  files read with Read. Today that body permits inline work and buries the role among 15.8k characters of
  adapter detail.
- **Published practice (survey).** It strongly supports a fresh, execution-grounded verifier. It supports
  plan review only for consequential or ambiguous work, with grounded objections. It warns against role
  splits that spend more on coordination than on work, and against paraphrasing results through the lead.

## Owner decisions (2026-11-22), as amended by the evidence

- D1. Rework `/entrust:orchestrate` in place. Skill name and directory stay `orchestrate`. A quality rework
  is wanted, not a minimal patch.
- D2. Default team:
  - the coordinator (the main session);
  - worker(s), usually one; a worker writes its own tests (survey 1.10);
  - the plan critic, before any write: a local critic of the plan as written; on by default (R3b);
  - the verifier, fresh, after the writes.
  The architecture critic, a top-level critic of the chosen approach, is a separate role. It runs when one of
  its triggers holds, and the card says so (R3c). The final draft is read as R4 says.
- D3. Inside the skill, the coordinator rule is unconditional. There is no solo lane inside the skill:
  invoking `orchestrate` is the user's choice of coordinated work. Small or sequential tasks are done in a
  session that does not invoke it. Exception: the user's explicit word for a specific edit.
- D4. Another provider, model or route appears only when the user names it, in the conversation or in the
  user's or project's instructions (CLAUDE.md, AGENTS.md). Several may be named at once ("use Qwen, Fable,
  Astra").
  - A named model the host runs natively is native (Fable under Claude Code, Astra under Codex).
  - For any other, run `adapter-status.mjs` (skipping the host's adapter) and route each named model through
    the adapter that lists it. Then follow `references/external.md` and that adapter's page.
  - Nothing proposes another provider unprompted, a cross-family second opinion included (survey E6: the
    same-family bias is real; the answer states it where it applies, R3d).
- D5. `orchestrate/scripts/adapter-status.mjs` and its test stay, called only under D4.
- D6. No hook.
- D7. Simplify `references/answer.md`'s reading ritual (R4).
- D8. A live compaction check runs after this change (step 5 of the execution plan, outside this spec).

## Requirements

### R1. Native-only defaults

a. **SKILL.md.**
   - One owner rule for D4, in a section of ≤ 8 lines that gives the `adapter-status.mjs` command.
   - Remove the planning-time collector step and the pre-dispatch "refresh passive adapter status" (F1).
   - Delete from SKILL.md what an adapter page or `references/external.md` already states (C6). This covers
     the named-Claude-model-via-OpenCode rule (`claude/SKILL.md:24-26`, `opencode/SKILL.md:30-31`, `:46-47`,
     `opencode/references/orchestration.md:28`), the OpenCode full-catalogue rule, and SKILL.md:39-42
     (= external.md:45-49).
   - Move only text with no other owner, to `references/external.md`. Check whether external.md states the
     data-transfer consent of SKILL.md:86-89 for every adapter before deleting it.
   - Delete "Model diversity is useful …" outright.
b. **The card's `checks` row (`references/plan.md`).** Adapter status, the OpenCode list source and quota
   windows appear only when the plan has an external route, or when a usage window is near its limit.
c. **Codex pages.**
   - `codex/references/orchestration.md:20`: delete the replacement of the "nothing" row ("half the agents …
     are Codex") and the reversed cross-review sentence.
   - `codex/SKILL.md`:
     - the "nothing" row (≈:57) becomes zero Codex agents;
     - the description (:5-6) applies only when the user asks for Codex or names a Codex model;
     - drop "shares one model bias" (:36, :47);
     - review :64 ("Add another model only when its perspective … can improve the result") under the same rule.
d. **Advisor and bounds.**
   - `advisor/SKILL.md:12`: with no model named, the host's native top-tier model through native delegation;
     an adapter only under D4.
   - `plugins/entrust/plugin/README.md`, advisor row: drop "of the other model family".
   - SKILL.md's top-tier bound loses "per model family".
e. **Experiments.** `references/plan.md` experiment section (≈:61): "a judge from the other model family or
   the user" becomes "the user, or a judge the user names".
f. **Sweep.** Search every plugin page for codex, opencode, "model family", diversity, panel and cross-. Fix
   each default pull-in, or name it in your return with the reason it stays. Keep `claude/SKILL.md:24-26`
   (user-named model) and `review/SKILL.md:37`.

### R2. The coordinator contract and a lean SKILL.md

a. **The contract.** The body's first screen (≈ first 15 lines) states it unconditionally:
   - The coordinator owns the plan, briefs, decisions, the user conversation and the synthesis.
   - It never reads sources whole, never edits the tree, and never runs project checks, tests or builds.
   - It may:
     - run short commands that name a brief's inputs (ls, git status/log/diff --stat, grep -l, wc), with
       output ≤ 20 lines;
     - run the scripts this page names (lint-draft, adapter-status, temp-dir, and the launcher's
       `--plan`/`--new`/`--decide` under D4) (C1);
     - write its card, briefs, decision log and draft under its temporary directory (C1);
     - read agents' returns and summary artifacts;
     - read a cited file:line range of at most 40 lines, to settle a conflict between returns or a claim it
       is about to relay. This is the lead's spot check, which contains error (survey E1b).
   - It hands a worker's artifacts to the next agent by path, verbatim, never as a paraphrase (survey E1).
     The verifier never receives a writer's return (R3d).
   - The D3 exception holds.
b. **Surviving a compaction.** At approval the coordinator writes the approved card and then a running
   decision log to `card.md` under the run's temporary directory (`temp-dir.mjs run`). It names that path in
   the card message and in every phase report except the final answer (lint-draft flags temporary paths).
   - On a re-invocation, or when the approved card is no longer in context, it re-reads this contract and that
     file and continues the approved work. It does not re-plan.
   - If the path is lost, it asks the user.
   - No new script.
c. **Size.** The body as `scripts/skills.test.mjs` counts it, measured after the last commit (C4): target
   ≤ 8,000 characters (today 15,513). Report the final lines and characters.
d. **What moves out of SKILL.md, each to its existing owner:**
   - external workers, proxy and adapter text → `references/external.md`, as far as R1a has not deleted it;
   - "Skills per invocation" → a section of `references/plan.md`, keeping the anchor `#skills-per-invocation`
     resolvable; update its links in `claude/SKILL.md` and `references/external.md`, and the test
     `plugins/entrust/evals/orchestrate.test.mjs:11-27`;
   - profiles, pilots and usage windows → `references/plan.md`;
   - the effort-recording sentences (SKILL.md:150-152) and the substitution rule (:166-170) → delete, since
     plan.md:21 and plan.md:7-8 already state them; merge any duty those lack (C4);
   - the `capture-check.mjs` recipe → the worker and verifier rows of `references/roles.md` (C6). Those
     rows return their capture ledger's path in `artifacts`, for lint-draft's `--receipts` (N4). SKILL.md
     keeps a one-line pointer containing the literal `<skill-dir>/scripts/capture-check.mjs`
     (`orchestrate.test.mjs:100`);
   - the shared temporary context stays with the coordinator, the only one who can hand it out. SKILL.md
     keeps: start one context with `temp-dir.mjs run`, and put its JSON as `ENTRUST_TEMP_CONTEXT` in every
     native worker's and the verifier's brief (N4).
e. **What SKILL.md keeps:**
   - the five-field return block;
   - the tier table;
   - the default team, with each core role's "when" and tier (C6);
   - under "Capacity and models": the alive-at-once and top-tier bounds (C7); anchors `#capacity-and-models`
     and `#the-agents-return` stay (C7);
   - the essentials of verification;
   - the `lint-draft.mjs` line, its `--receipts` taking the workers' and the verifier's ledgers (C1);
   - a direct link to every file it reaches: `scripts/skills.test.mjs` rule 6, main-proxy.md and foreman.md
     included (C7, `orchestrate.test.mjs:77`).
f. **Names.**
   - "Coordinator" means only the main session.
   - `references/foreman.md` is titled "Foreman" and calls its subagent the foreman throughout.
   - In `references/roles.md`, "parent orchestrator" or "parent" becomes "coordinator" where it means the main
     session. Check the other pages for the same usage.
g. **Mandatory reads.** A reference is read only when its step needs it, and the step says when.
   - Each core agent's brief names its `references/roles.md` row by path, and the agent reads it, so the
     coordinator does not read roles.md on a default run (C6).
   - `plugins/entrust/evals/orchestrate-live.test.mjs` case 6 (≈:971-972, "read plan.md before composing")
     changes with this.
h. **One owner per fact.** Resolve review F11's duplicates in the pages you edit, and name any left.

### R3. The default team and the role catalogue

a. **`references/roles.md` opens with a short table of the five core roles.** The roles are coordinator,
   worker, plan critic, architecture critic and verifier. Columns: what it does, may write, returns.
   - SKILL.md owns "when" and the tier (C6).
   - Every other role follows under "Other roles", read when the plan names one.
   - The two critics are different roles with different subjects (owner, 2026-11-22). Neither may absorb the
     other.
b. **The plan critic: local, an ordinary critic.** It replaces and widens the split critic. It judges the plan
   as written; it does not reopen the chosen approach.
   - *When.* Once, after the card is approved and the approach is settled (after the architecture critic, when
     that one runs), before the first worker brief.
   - *Default.* On by default. The card may leave it out only by stating why the plan is too small to need it,
     and the user approves the card.
   - *Reads.* The request, the card and the code locations it names.
   - *Judges:*
     - coverage of every requirement;
     - steps and their order;
     - ownership: one owner per deliverable;
     - with several workers, the split, the sequence and the shared interfaces;
     - the completion criteria of each brief;
     - missing work and risks;
     - the allocation of roles and models against the work.
   - *Objections.* Each cites path:line or a named consumer, states what ignoring it costs, and gives the
     smallest plan fix. Only gaps that affect correctness, ownership or cost count, never style (survey E3;
     Claude Code best practice "a reviewer … will always find something").
   - *Returns* the five fields. `result` holds:
     - the verdict `sound | change | stop`;
     - at most five ranked objections;
     - the acceptance checks the verifier should run.
     "Sound, no objections" is a valid verdict. Writes nothing.
   - *The coordinator* applies or overrules each objection, with the reason in the decision log. A change of
     scope or allocation goes to the user.
   - *Tier.* Strong.
   - *The name "split critic" disappears* (C3). In `plugins/entrust/evals/lib/gate-checks.mjs`:
     - keep "no worker brief before the plan critic returns" and "one writer of the shared file";
     - find the plan critic by role name at any tier;
     - drop the corrected-split-file assertions, saying so in live case 7's reason line
       (`orchestrate-live.test.mjs:1007-1008`);
     - update `gate-checks.test.mjs:223-258`.
c. **The architecture critic: top-level.** It challenges the chosen approach and the architecture of the
   solution, not the plan's details.
   - *When.* Once, after the card is approved and before the plan critic and any worker brief.
   - *Triggers*, any of:
     - the solution adds a concept (a module, mechanism, flag, layer, state or dependency);
     - it changes a public interface or a contract other units consume;
     - it takes an irreversible or outward-facing action;
     - several approaches are viable, or the request leaves the approach open;
     - the user asks for it.
     The card says whether it runs and which trigger holds; the user approves that with the card.
   - *Reads.* The request, the constraints, the approach the card chose with the coordinator's reasons, and the
     code locations involved. It does not read the detailed plan.
   - *Before judging the chosen approach,* it states the strongest alternative it sees: another owning unit,
     reuse of what exists, a different mechanism, or not doing it. This guards against anchoring (survey E5).
   - *Judges:*
     - whether the right problem is solved;
     - the unit that should own the change, and why;
     - what already exists that the approach duplicates or bypasses;
     - each new concept, and the requirement that justifies it;
     - coupling and the consumers affected;
     - reversibility and long-term cost;
     - fit with the repository's design principles.
     It measures against `review/references/design-standard.md`, by link.
   - *Objections.* The same grounding rule as the plan critic.
   - *Returns* the five fields. `result` holds:
     - the verdict `keep | change approach | stop`;
     - at most five ranked objections;
     - on `change approach`, the alternative in a few lines, with what it removes or moves and who relies on it;
     - what evidence would change its verdict.
     Writes nothing.
   - *A verdict other than `keep`* is a change of approach. It goes to the user with both approaches before
     the plan critic or any worker starts.
   - *Tier.* Top. The adapters' models pages map tiers to models; a shared page names no model (E144).
   - *Distinct from* the architect (who authors a design), the advisor (who answers a question it is asked),
     the judge (who picks among candidates) and review's design direction (which reads code already written).
d. **The verifier.** A fresh agent after the writes.
   - *Gets* the requirements, the plan critic's acceptance checks (without a plan critic, the card's checks
     row) and the writers' artifacts, never a writer's return or conclusions.
   - *Runs* the full relevant suite on the final combined tree, and reports every failure with its command and
     output.
   - *Returns* the five fields, with a requirement → evidence table in `evidence`. A requirement without
     executed evidence is `not proven`, never passed (survey E4). Where a verdict rests on judgement alone,
     with no executed check, it says so, and the answer carries that line.
   - *Tier.* Strong, since its thread may read the final draft (C5).
e. **The default team is stated in one place: SKILL.md** (survives compaction). Remove the competing
   statements: the simple-task bound row (≈:141), the balanced profile's verifier clause (≈:158) and the
   Verification sentence (≈:188), whichever survive R2.
f. **The catalogue.** Merge rows that share a responsibility, and give every remaining row a concrete
   "Spawn it when" trigger (survey E7). No new columns. Candidates — confirm each against its consumers
   (gate-checks, tests, other pages) before merging, and name any you reject:
   - advisor per call + advisor standing → one row with two modes;
   - final reviewer → the last cross-review, or the verifier;
   - bulk verifier + swarm → one row;
   - completeness critic → removed; its duty goes to the verifier's thread and to the final reader (R4);
   - final reviewer: choose "the last cross-review reads the whole change, consequences first" (fewest
     consumers: `roles.md:33`).
   Add one row under "Other roles": **final reader**. It is fresh and strong-tier, writes nothing, and returns
   the five fields with R4's three lists in `result` (N2). Rename every consumer of a removed name.

### R4. The final draft, and `references/answer.md` simplified (D7)

- **Keep:**
  - the answer names every agent that ran or was dropped;
  - a success claim names its evidence or says it is unverified;
  - the recommendation rule;
  - the user receives the text that was read; a shorter message sent instead quotes it and restates
    nothing; any change after the read is a new read;
  - a publication is read the same way (C5).
- **The reader:**
  - *Routine work.* The verifier's thread is continued (survey E5). Protocol:
    1. re-read the user's request verbatim;
    2. tag each claim of the draft as backed by a raw artifact, by its own earlier report only, or unbacked;
    3. list each request item the draft does not answer.
  - *The card decides, not a second judgement at draft time (N2).* When the card ran the architecture
    critic, or the answer is a publication, the final reader (R3f) reads only the request, the draft and the
    artifact paths, with the same protocol. Otherwise the verifier's thread reads it.
- **Reads.** At most two reads per answer. The coordinator fixes each gap or names it open. A changed draft
  gets the second read. After the second read, the only change allowed is an `Open:` list appended to the
  draft, quoting the reader's remaining gaps; the gate accepts exactly that suffix, as the old gate allowed
  one verdict line (`gate-checks.mjs:501-516`) (N1). Then it sends (C5).
- **Replaces** the manifest/sha256 steps, the critic's copy with diff hunks and the three-read count.
- **The gate keeps checking the kept rule without a manifest** (C2):
  - the gate takes the draft path and the time of the read from the message that starts the read, as
    `criticVerdict` does today (`gate-checks.mjs:486`) (N2);
  - no write to that path follows the read;
  - the text that went out equals that file;
  - the last lint comes before the read.
  Key `lintCallProblems`, `fiveFieldProblems` and `splitAdmissionProblems` (:403) to the new role names
  (verifier, final reader, plan critic). None may pass vacuously when the name is absent. The workers filter
  of `splitAdmissionProblems` excludes the architecture critic, the verifier and the final reader by role
  name, not by tier (`!isTop`, :402-403) (N2).
- **The coordinator rule gets a gate check (N3).** `runProblems` (`gate-checks.mjs:818-841`) adds:
  - no root Edit or Write under the working tree;
  - no root `CHECK_COMMAND` (:91), whether run through `capture-check.mjs` or not. Remove the exemption at
    :723 for the root.
  Pin it in the coherent-run fixture (`gate-checks.test.mjs:585-610`) with a red case for each. Update `gate-checks.test.mjs` (:201-215, :290-364,
  :588-610), `lint-draft.mjs --help` (:29-31), `lint-draft.test.mjs:147-175`, and `orchestrate-live.test.mjs`.

### R5. Dependent updates

- **Tests and suites.** All named above, plus:
  - `advisor.test.mjs` (pinned phrases, 30-line cap);
  - live case 8 (`orchestrate-live.test.mjs:1048-1049`, the advisor via Codex);
  - live cases 5 and 7 meet architecture-critic triggers (case 5 adds `lib/slug.mjs`; case 7 renames an
    export two files import). Update their expected phases (`phases: 4` at :941, `5` at :1034) and
    assertions for the architecture critic and the final reader (N2);
  - the comment at `orchestrate-live.test.mjs:467-468` ("lets the coordinator take a quick targeted edit");
  - `plugins/entrust/evals/README.md`, where a suite's description changes.
  `orchestrate.test.mjs:75-80` stays.
- **Inbound links and anchors.** Search the plugin for every link into the pages you edit. Known:
  - `#capacity-and-models` from `codex/SKILL.md:57`, `codex/references/orchestration.md:64` and
    `orchestrate/references/roles.md:4`;
  - `#the-agents-return` from `roles.md:24`;
  - `#skills-per-invocation` from `claude/SKILL.md:30` and `external.md`;
  - `prepare-feedback/SKILL.md:62` ("Orchestrate's completeness critic reads it first") (C5).
- **`plugins/entrust/plugin/README.md`.** The rows for orchestrate and advisor. The plugin.json description
  only if it becomes false.
- **`plugins/entrust/CHANGELOG.md`.** Entries under a new "Unreleased" heading above 0.44.0, in the file's
  style. No version bump.
- **`plugins/entrust/ISSUES.md`.** Recorded, not fixed (AGENT.md):
  - E143: only `claude/adapter.json` declares `"native": true`. A five-column plan row with a Codex model under
    a Codex host therefore resolves to the external adapter (F12; level 2 unless reproduced).
  - E144: `proxy/SKILL.md:12` and `orchestrate/references/main-proxy.md:4` call the host "normally Luna",
    against CHANGELOG's "The shared skills name no model". `claude/SKILL.md:18` is an adapter page and is
    excluded (C7).
- **Checks.**
  - `node scripts/skills.test.mjs`.
  - Each offline suite you touched.
  - `node plugins/entrust/evals/run-all.mjs`. First read `orchestrate-live.test.mjs`'s header for how it is
    gated. Make no real model calls; a suite that would call one is skipped and named.

## Constraints

- **Design principles (AGENT.md).** Removing beats adding; no crutches; one owner per fact; a page says what
  the code does. No new flag, script or file unless a requirement here needs it.
- **Commits.** One theme each; the message is a sentence saying what changed and why it was worth it; no
  attribution trailers (AGENT.md). Tests go in the commit whose theme they follow. Do not push. In order:
  1. R1;
  2. R2 (relocation plus the contract; the old team text may stand until 3);
  3. R3 + R4;
  4. ISSUES;
  5. CHANGELOG.
- **What is out of scope.** Anything a requirement here cannot settle, and any change beyond it, goes in your
  `open`, not into the tree.
