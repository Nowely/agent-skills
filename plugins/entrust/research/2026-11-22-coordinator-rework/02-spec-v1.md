# Approved change: entrust `orchestrate` as a lean, native-only coordinator mode

Repository: /home/user/agent-skills, branch `claude/pensive-pascal-hpwkue`, HEAD `def9f23` (entrust 0.44.0).
Paths below are under `plugins/entrust/plugin/skills/` unless they start with `plugins/` or `scripts/`.
Input material: the independent review at
`/tmp/claude-0/-home-user-agent-skills/09d54ed5-0860-52ea-8562-75bff29ae4f6/scratchpad/fable-review.md`
(findings F1–F12 with file:line evidence, the test map in its section 5). Repository rules that bind every
edit: `/home/user/agent-skills/AGENT.md` and `CONSTITUTION.md`.

## Why

The owner's practice: most tasks need few agents, but always a coordinator, a critic and a verifier.
Other providers are often unavailable (quota, no sign-in), and pulling them in by default is costly.
The main session loses its coordinator role after a compaction. Claude Code re-attaches an invoked skill's
body after a compaction (`scripts/skills.test.mjs:243-256`, measured on 2.1.280), but not files read with
Read. Today that body permits inline work and buries the role among 15.8k characters of adapter detail.

## Owner decisions (2026-11-22)

- D1. Rework `/entrust:orchestrate` in place. Skill name and directory stay `orchestrate`.
- D2. The default team is the coordinator (the main session), worker(s) (usually one), one critic before any
  write, and one fresh verifier after the writes. The same verifier thread is continued to read the frozen
  final draft, which replaces the separate completeness critic.
- D3. The coordinator rule is unconditional. The one exception is the user's explicit word for a specific edit.
- D4. Another provider, model or route appears only when the user names it: in the conversation, or in the
  user's or project's instructions (CLAUDE.md, AGENTS.md). The user may name several at once ("use Qwen,
  Fable, Astra"). A named model the host runs natively is native (Fable under Claude Code, Astra under Codex).
  For any other, run `adapter-status.mjs` (skipping the host's own adapter) and route each named model through
  the adapter that lists it. Then follow `references/external.md` and that adapter's page.
- D5. `orchestrate/scripts/adapter-status.mjs` and its test stay, called only under D4.
- D6. No hook.
- D7. Simplify `references/answer.md`'s reading ritual (below).
- D8. A live compaction check runs after this change, as a separate step outside this spec.

## Requirements

### R1. Native-only defaults

a. `orchestrate/SKILL.md` has one owner rule for D4, in a short section (≤ 8 lines) that also gives the
   `adapter-status.mjs` command. Remove the planning-time collector step and the pre-dispatch "refresh passive
   adapter status" (F1). Move the named-model routing detail (a Claude model with no native or CLI route checked
   in OpenCode; an OpenCode model absent from Desktop's list checked in the full catalogue) to
   `references/external.md`, which already owns external calls.
b. `references/plan.md` card `checks` row: adapter status, the OpenCode list source and quota windows appear only
   when the plan has an external route or a usage window is near its limit.
c. `codex/references/orchestration.md:20`: delete the replacement of the "nothing" row ("half the agents … are
   Codex") and the reversed cross-review sentence. `codex/SKILL.md`: the "nothing" row (≈:57) becomes zero Codex
   agents; the description (:5-6) applies only when the user asks for Codex or names a Codex model; drop "shares
   one model bias" (:36, :47).
d. `advisor/SKILL.md:12`: with no model named, the host's native top-tier model through native delegation; an
   adapter only under D4. `plugins/entrust/plugin/README.md` advisor row: drop "of the other model family".
   `orchestrate/SKILL.md`: the top-tier bound loses "per model family"; "Model diversity is useful …" moves to
   `references/external.md`.
e. `references/plan.md` experiment section (≈:61): "a judge from the other model family or the user" becomes
   "the user, or a judge the user names".
f. Find any other plugin page that proposes or pulls in another provider by default. Search for codex,
   opencode, "model family", diversity, panel and cross-. Fix it, or name it in your return with the reason it
   stays. Keep `claude/SKILL.md:24-26` (it applies to a model the user named) and `review/SKILL.md:37`.

### R2. The coordinator contract and a lean SKILL.md

a. The body's first screen (≈ first 15 lines) is the contract, stated unconditionally:
   - The coordinator owns the plan, briefs, decisions, the user conversation and the synthesis.
   - It never reads sources whole, never edits the tree, and never runs project checks, tests or builds.
   - It may run short commands that name a brief's inputs (ls, git status/log/diff --stat, grep -l, wc), with
     output ≤ 20 lines, and read agents' returns and summary artifacts.
   - The D3 exception holds.
   - On a re-invocation, or when the approved card is no longer in context after a compaction: re-read this
     contract and continue the approved work; do not re-plan. Where the card is lost, ask the user, or say what
     is known.
b. Size target for the body: ≤ 90 lines and ≤ 7,000 characters (`wc`).
c. Move out of SKILL.md, each to its existing owner:
   - external workers, proxy and adapter text → `references/external.md`;
   - "Skills per invocation" → a section of `references/plan.md`. Update every link to `#skills-per-invocation`
     (`claude/SKILL.md`, `references/external.md`, and the test `plugins/entrust/evals/orchestrate.test.mjs:11-27`);
   - profiles, bounds beyond the default, pilots and usage windows → `references/plan.md`;
   - the `capture-check.mjs` and `temp-dir.mjs` recipe → where worker and verifier briefs get it (a "Briefs"
     section of `references/plan.md`, or `references/roles.md`). SKILL.md keeps a one-line pointer.
d. SKILL.md keeps the five-field return block (the schema and `orchestrate.test.mjs` read it), the tier table,
   the default team, the essentials of verification, and the `lint-draft.mjs` line (`orchestrate.test.mjs:134`).
e. Names: "coordinator" means only the main session. `references/foreman.md` is titled "Foreman" and calls its
   subagent the foreman throughout. `references/roles.md` "parent orchestrator" or "parent", where it means the
   main session, becomes "coordinator". Check the other pages for the same usage.
f. Mandatory reads: beyond SKILL.md (and, in Claude Code, `claude/SKILL.md`), a reference is read only when its
   step needs it, and the step says when. `orchestrate-live.test.mjs` case 6 (≈:971-972, "read plan.md before
   composing") changes with this.
g. One owner per fact. Resolve the duplicates of review F11 that touch the pages you edit. A fact left in two
   places is named in your return.

### R3. The default team and its roles

a. `references/roles.md` opens with a short table of the four core roles: coordinator (the main session), worker
   (implementer or researcher, by task), critic and verifier. Columns: what it does, may write, returns, when,
   tier. Every other role follows under a heading "Other roles", read when the plan names one.
b. The critic is the split critic widened into a plan critic:
   - When: before the first write, after the card is approved, once.
   - Reads: the request, the plan and the code locations it names.
   - Judges: the unit that owns the change and why; what already exists in code or contracts; each new concept
     (mechanism, flag, layer, state) and the requirement that justifies it; the consumers affected; a cheaper
     alternative, not doing it included.
   - With more than one worker, also judges the split, sequence and shared interfaces.
   - Measures against `review/references/design-standard.md`, by link, without restating it.
   - Writes nothing. Returns the five fields: `result` gives the verdict sound | change | stop and at most five
     ranked objections, each with path:line and the smallest plan fix.
   - Tier: strong; top when the plan adds a module or a public interface, or takes an irreversible action.
   - A finding that changes scope or allocation goes to the user for approval.
   - The name "split critic" disappears. Update `plugins/entrust/evals/lib/gate-checks.mjs`, its tests and
     `orchestrate-live.test.mjs` accordingly.
c. The verifier is a fresh agent after the writes:
   - Gets the raw artifacts and requirements, not the writer's conclusions.
   - Runs the relevant checks on the final combined tree.
   - Returns the five fields.
   - Its thread is continued to read the frozen final draft against the request and the evidence (R4).
   - Tier: strong; cheap when the check is mechanical.
d. The default team is stated in one place, SKILL.md. Remove the competing statements: the simple-task bound row
   (≈:141), the balanced profile's "independent verifier for material findings" (≈:158) and the Verification
   sentence (≈:188), whichever survive the move.
e. The completeness-critic row goes; its duty belongs to the verifier.

### R4. `references/answer.md`, simplified (D7)

- Keep: the answer names every agent that ran or was dropped; a success claim names its evidence or says it is
  unverified; the recommendation rule; and the rule that the user receives the text the verifier read. A
  shorter message sent instead quotes it and restates nothing; any change after the read is a new read.
- Replace the manifest/sha256 steps, the critic's copy with diff hunks and the three-read counting with this:
  the verifier continuation reads the linted draft and returns the gaps. The coordinator fixes them, or names
  them open. A changed draft gets one more read. After two reads that repeat the same gap, name it open and send.
- Update `gate-checks.mjs` (`criticDigestProblems` and the completeness-critic fixtures), its tests and
  `orchestrate-live.test.mjs` to the new rule. Remove checks of steps that no longer exist.

### R5. Dependent updates

- Tests and suites named above, plus `advisor.test.mjs` (pinned phrases, 30-line cap), and
  `plugins/entrust/evals/README.md` where a suite's description changes. `orchestrate.test.mjs:75-80` stays.
- `plugins/entrust/plugin/README.md` rows for orchestrate and advisor. The plugin.json description, only if it
  becomes false.
- `plugins/entrust/CHANGELOG.md` entries under an "Unreleased" heading (create it above 0.44.0), hand-written in
  the file's existing style. No version bump.
- `plugins/entrust/ISSUES.md`: two new entries, recorded and not fixed, in the file's format, with the next id
  free in both entrust's and terse's ledgers (`plugins/terse/ISSUES.md`):
  - (i) only `claude/adapter.json` declares `"native": true`, so a five-column plan row with a Codex model under a
    Codex host resolves to the external adapter (review F12; level 2 unless reproduced);
  - (ii) shared pages call the host "normally Luna" (`claude/SKILL.md:18`, `proxy/SKILL.md:12`,
    `orchestrate/references/main-proxy.md:4`), against CHANGELOG's "The shared skills name no model".
- Checks:
  - `node scripts/skills.test.mjs`;
  - every offline suite touched, then `node plugins/entrust/evals/run-all.mjs`. Before running it, read
    `orchestrate-live.test.mjs`'s header for how it is gated. Make no real model calls: if a suite would call a
    model, skip it and say so.

## Constraints

- AGENT.md design principles: removing beats adding; no crutches; one owner per fact; a page says what the code
  does. No new flag, script or file unless a requirement above needs it.
- Commits: one theme each; the message is a sentence saying what changed and why it was worth it; no
  attribution trailers (AGENT.md). Themes, in order: R1 native-only defaults; R2 coordinator contract and lean
  page; R3+R4 default team, critic, verifier and the answer; ISSUES entries; CHANGELOG. Tests go in the commit
  whose theme they follow. Do not push.
- Anything a requirement here cannot settle, and any change beyond it, goes in `open`, not into the tree.
