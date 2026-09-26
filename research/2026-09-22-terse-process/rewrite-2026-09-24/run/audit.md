# Audit of plugins/terse/README.md at 1a24018

Run by the coordinator following `plugins/terse/skills/audit/SKILL.md` as it is on branch
`terse-process-2026-09-22`, not the installed 0.1.1 page. Steps 2 and 3 were done by one agent each
(Opus P0, Opus T1), step 5 by fourteen Codex gpt-5.6-luna readers and step 5b by two Codex gpt-5.6-sol
task readers; steps 4 and 6 are the coordinator's. Nothing was written into the audited repository.

## Scope

Files audited: the eighteen tracked `.md` files under `plugins/terse/` (`docs.txt` beside this file).
Entry file: `plugins/terse/README.md` (90 lines, 933 words), confirmed by the owner over the marketplace
root README. Repository backing them: `~/Git/agent-skills` at `1a24018` — a plugin of skills,
so "the code" is the three skill pages with their references, the seven scripts, and the three manifests;
the README's numbers are claims about `research/2026-09-10-chain/`. Run directory:
`$TMPDIR/terse/runs/20260922-195101`.

## Reader profile

Built by Opus P0 from the plugin's pages, scripts, manifests and the owner's recorded words, per
`reader-profile.md`; confirmed by the owner with three answers: "their words" accepted as constructed
(no issue tracker exists); the target reader documents any document, not only code; and the owner's own
intent, not in any page, is that `terse` works on any text in any language, code or not.

**What it is, in one sentence, without jargon.** Three commands you run by hand inside Claude Code on your
own `.md` files — one measures whether readers get the right answer and whether each sentence is true of
the code, one decides what a document should be before it is written, one rewrites it in reviewed rounds;
nothing reaches your files without your word.

**The reader.** Writes and owns the documentation of a small project; nobody procures this, they install
it alone in about a minute; already suspects the text is bad and cannot prove it; reads Russian and
English. NOT NECESSARILY AN ENGINEER — the audited text need not be about code at all. The only
assumptions allowed: Claude Code is installed; Node 22 only when run from a checkout.

**What brings them here.** Cannot tell whether a document is already fine, and touching it may make it
worse. A draft was abandoned at its third section, and nine of nine objections were about what it
contained, where it sat and how much there was — none about phrasing. Each round of edits heals one thing
and breaks another with nothing to say which. Sentences that are simply false about the code. Their own
sense that it reads well is not evidence. Handing it to an AI means it rewrites everything and they diff in
the dark.

**What they would otherwise use.** Anthropic's own `doc-coauthoring` skill (fresh readers, but the key in
the author's head, the document pasted in, no controls); style linters (Vale, markdownlint); or asking
Claude to "improve my README".

**Why this instead.** The answer key comes from the code before the first reader exists; readers start at
the entry file instead of being handed the text; control questions are mandatory, so a repair cannot
silently break what worked; a ledger and an executed check refuse a round that got worse; nothing is
written to your tree without your word.

**Their words, not ours.** "is my README any good?", "does this even need rewriting?", "нормальный ли
README?", "it rewrote everything and made it worse", "readers never get past the install", "проверь, что в
доке правда", "перепиши README".

**What earns their trust.** A failure that arrives with a file, a line and the code behind it; every number
with its size, including *p* = 0.25 and the admission that no no-document arm ran; checks that ship with a
self-test against a planted violation; a default that writes nothing.

**Voice.** Short sentences, one decision each. No manifesto, no aphorism. Every number with its size. No
caveats — a sentence that needs one says too much. Never narrow the subject: this takes any documentation,
not only documentation of code.

## Claim ledger

plugins/terse/README.md at 1a24018 (branch terse-process-2026-09-22), against the plugin in the same checkout. Paths in Sources are from the repository root; short names in the verdicts are the same files. Runs named in a verdict were made under the run directory $TMPDIR/terse/runs/20260922-195101/probe, never in the checkout.

### C01 — README.md:3

Claim: terse is a Claude Code plugin whose `audit` measures whether fresh readers reach the right answers from a document and whose `rewrite` then produces a repair of what was measured.

Sources: plugins/terse/.claude-plugin/plugin.json:1-10; .claude-plugin/marketplace.json:18-25; plugins/terse/skills/audit/SKILL.md:65-88; plugins/terse/skills/rewrite/SKILL.md:14-21, 173-177.

Level: 2. Verdict: confirmed — the readers are model agents (measure.md:40), and the repair is a candidate and a diff that reach your file only on your word (rewrite/SKILL.md:173-177); the plugin itself loaded in an isolated install (C03).

### C02 — README.md:4

Claim: audit sends fresh readers who may open only the `.md` files, checks every behavioural claim in them against the code, and reports each failure with a line number and a cause.

Sources: plugins/terse/skills/audit/SKILL.md:25-28, 52-55, 85-88, 119-127; plugins/terse/skills/audit/references/measure.md:28-38, 44-68; plugins/terse/skills/audit/references/ledgers.md:43-63, 91-114; plugins/terse/skills/audit/references/truth-pass.md:21-25, 73-80.

Level: 2. Verdict: unconfirmed — "every" is a guarantee about all runs, and a page reaches level 2 at most (truth-pass.md:21-25). Level 2 supports: one ledger entry per sentence that states what the software does (audit/SKILL.md:52-55), readers held to `.md` from the entry file (audit/SKILL.md:85-88), a cause for every wrong answer (audit/SKILL.md:119). Narrower than stated: text with no code behind it gets the weaker truth pass (audit/SKILL.md:26-27; truth-pass.md:73-80), and a `missing` failure has no line in the text to arrive with; its repair is "write the answer, and say where it goes" (audit/SKILL.md:124).

### C03 — README.md:7

Claim: the plugin ships three skills.

Sources: plugins/terse/skills/audit/SKILL.md:1-11; plugins/terse/skills/rethink/SKILL.md:1-11; plugins/terse/skills/rewrite/SKILL.md:1-12.

Level: 3. Verdict: confirmed — installed from this checkout into an isolated `CLAUDE_CONFIG_DIR` under the run directory, `claude plugin details terse@nowely` printed "Skills (3) audit, rethink, rewrite" (exit 0).

### C04 — README.md:7

Claim: each skill starts only when the user invokes it, and no skill starts itself or another skill.

Sources: plugins/terse/skills/audit/SKILL.md:7, 160-161; plugins/terse/skills/rethink/SKILL.md:7, 82-83; plugins/terse/skills/rewrite/SKILL.md:8, 21; plugins/terse/skills/rewrite/references/loop.md:38.

Level: 2. Verdict: unconfirmed — "none" is a guarantee about all runs, and no session was run to watch a model refused. Level 2 supports: all three pages set `disable-model-invocation: true` (audit/SKILL.md:7; rethink/SKILL.md:7; rewrite/SKILL.md:8); audit offers `rewrite` and does not run it (audit/SKILL.md:161), rewrite offers `audit` or `rethink` (rewrite/SKILL.md:21), and a structural finding reaches `rethink` only after "the user is asked" (loop.md:38).

### C05 — README.md:10

Claim: `rethink` returns a skeleton that `rewrite` writes against; `audit` returns a run file that `rewrite` starts from; `rewrite` returns a candidate and a diff; `audit` can be run again to see whether the result held.

Sources: plugins/terse/skills/rethink/SKILL.md:13-21, 70-83; plugins/terse/skills/audit/SKILL.md:149-161; plugins/terse/skills/rewrite/SKILL.md:14-21, 173-177; plugins/terse/skills/audit/references/measure.md:106-115.

Level: 2. Verdict: confirmed.

### C06 — README.md:17

Claim: audit builds a profile of the project's readers, writes the answer key from the claim ledger it checks against the code, then sends one fresh reader per question who may open only `.md` files and starts at the entry file.

Sources: plugins/terse/skills/audit/SKILL.md:21-28, 42-48, 65-78, 80-88; plugins/terse/skills/audit/references/measure.md:8-18, 28-38; plugins/terse/skills/audit/references/reader-profile.md:7-24.

Level: 2. Verdict: confirmed — true as far as it goes; the baseline also runs every question with no documentation (audit/SKILL.md:90-96) and two task readers (audit/SKILL.md:103-112).

### C07 — README.md:19

Claim: audit returns a score, the questions that failed, and one of five causes for each failure: refuted, missing, placement, findability or harmful.

Sources: plugins/terse/skills/audit/SKILL.md:103-137, 149-161; plugins/terse/skills/audit/references/ledgers.md:7-41, 65-89, 102-114.

Level: 2. Verdict: confirmed — true as far as it goes. The score is a difference from the no-document arm (audit/SKILL.md:116); the run file also carries the reader profile and the claim ledger with its `json claims` block, which `ledger-seed.mjs` turns into the `ledger.json` rewrite starts from (audit/SKILL.md:149-158; ledgers.md:65-89), and the report names the refuted claims and the seed's count (audit/SKILL.md:160-161). The harmful cause is what the task readers find, "the failure a question cannot" (audit/SKILL.md:107-108).

### C08 — README.md:21

Claim: audit proposes no replacement wording.

Sources: plugins/terse/skills/audit/SKILL.md:1-6, 18-19; plugins/terse/skills/audit/references/ledgers.md:102-114.

Level: 2. Verdict: unconfirmed — "never" is a guarantee about all runs. Level 2 supports: "It never proposes wording" and "Do not say what to write instead" (audit/SKILL.md:6, 18), and a What broke entry states "what a repair must achieve, not how to word it" (ledgers.md:113-114).

### C09 — README.md:24

Claim: rethink decides, before any prose is written, what comparable documents already solved, what things are called, and what is said in what order.

Sources: plugins/terse/skills/rethink/SKILL.md:1-15, 25-68.

Level: 2. Verdict: confirmed.

### C10 — README.md:26

Claim: rethink hands over a skeleton, each section with a title, a purpose, what it leaves out and a word budget, and waits for the user's word.

Sources: plugins/terse/skills/rethink/SKILL.md:13-21, 70-83.

Level: 2. Verdict: confirmed — true as far as it goes; the skeleton also carries the mechanical rules, the terminology decisions, what was deleted and any edit needed in another file (rethink/SKILL.md:76-80), and the page does not say where the file is written.

### C11 — README.md:31

Claim: rewrite starts from a skeleton `rethink` agreed or from an audit's run file and writes the document against it.

Sources: plugins/terse/skills/rewrite/SKILL.md:14-21, 27-50.

Level: 2. Verdict: confirmed — true as far as it goes; it also resumes a run directory that already has rounds, and with neither input continues on its own guesses once the user declines both (rewrite/SKILL.md:18, 21).

### C12 — README.md:31

Claim: three writers produce candidates and two judges score them on the measured failures; the winner then goes through rounds of critics whose lenses do not overlap (code, rules, adversarial reader, task, reader's questions) until a round finds nothing new and nothing got worse.

Sources: plugins/terse/skills/rewrite/SKILL.md:52-62, 118-135, 146-160, 162-177; plugins/terse/skills/rewrite/references/bake-off.md:17-29, 106-132; plugins/terse/skills/rewrite/references/loop.md:81-88; plugins/terse/skills/rewrite/references/measurements.md:52-55.

Level: 2. Verdict: refuted — the lenses: "Lenses differ; they are not disjoint" (rewrite/SKILL.md:159). The stop: "The loop stops when the user reads the round and says whether they would send it as it is. Two consecutive rounds with no regression is the signal to hand a round over, not a finish" (rewrite/SKILL.md:173-174); "no count of them stops anything" (loop.md:86); M10 names the quiet-round rule as the earlier one that seven rounds never met (measurements.md:52-55). On the skeleton route the judges score "purpose met", not failures (bake-off.md:128-129). Left out besides: on an existing document the adversarial whole-document read runs before the writers (rewrite/SKILL.md:54-56), and a verifier reads each round's edits before its critics when the user sizes one (rewrite/SKILL.md:118-131).

### C13 — README.md:34

Claim: every round of a rewrite stays on disk as its own file.

Sources: plugins/terse/skills/rewrite/SKILL.md:68-69, 107-117, 123-131; plugins/terse/skills/rewrite/scripts/round.mjs:12-13, 38-40, 54; plugins/terse/skills/rewrite/references/loop.md:64-67.

Level: 3. Verdict: refuted — a round that fails its checks is removed and regenerated under the same number, "the abandoned attempt" (rewrite/SKILL.md:112-115), and so is a round the verifier sends back (rewrite/SKILL.md:126-128). Run under the run directory (probe/lifecycle): ledger.mjs read round 01 LOST (exit 1); after that recipe `grep -r` found its first attempt nowhere. What holds: round.mjs never overwrites a round (round.mjs:54; self-test "round refuses to overwrite a round" ok), and a round is kept once its critics launch (rewrite/SKILL.md:116-117).

### C14 — README.md:35

Claim: rewrite hands over the final text, its diff against the original, a list of every removal of twenty words or more with its reason, and the file, line and evidence level behind every behavioural claim.

Sources: plugins/terse/skills/rewrite/SKILL.md:88-105, 118-122, 173-193; plugins/terse/skills/rewrite/scripts/round.mjs:65-67, 107-118; plugins/terse/skills/audit/scripts/ledger-seed.mjs:12-14, 60; plugins/terse/skills/rewrite/references/critic-briefs.md:53-54; plugins/terse/skills/rewrite/references/measurements.md:127-131.

Level: 3. Verdict: unconfirmed — the round, `diff-NN.patch` and the cut ledger are in the hand-over (rewrite/SKILL.md:175-176, 188-189). File, line and level live in `ledger.json`, which holds the claims edits declare plus the audit's confirmed and refuted entries (rewrite/SKILL.md:90-93; ledger-seed.mjs:12-14, 60) and starts empty on the skeleton route (rewrite/SKILL.md:92-93). Nothing makes it cover every claim: run under the run directory (probe/round), round.mjs wrote a round that adds "and deletes nothing" with no claim declared, exit 0, `ledger.json` `[]` (round.mjs:66-67); the check for that is the verifier's duty 1 (critic-briefs.md:54), which the user may size to zero (rewrite/SKILL.md:119), and M24 records a real round in which one sentence "declared no claim at all" (measurements.md:130-131). No script produces the cut ledger; the model compiles it.

### C15 — README.md:35

Claim: rewrite writes its rounds and artefacts into a run directory of its own.

Sources: plugins/terse/skills/rewrite/SKILL.md:64-71, 179-193.

Level: 2. Verdict: confirmed.
Position: misleading where it stands. The run directory is "`research/<date>-<slug>/` at the root of the repository that holds the document" (rewrite/SKILL.md:66-67), inside the reader's own tree; the sentence does not say so, and beside "Applying anything to your files needs your word" it reads as a place outside their files. It is the sentence Q2 turns on.

### C16 — README.md:35

Claim: nothing rewrite does changes the user's files without the user's word.

Sources: plugins/terse/skills/rewrite/SKILL.md:6-7, 64-67, 136-140, 173-177; plugins/terse/skills/rewrite/references/loop.md:35-42.

Level: 2. Verdict: refuted — rewrite works in `research/<date>-<slug>/` at the root of the repository that holds the document (rewrite/SKILL.md:66-67) and routes a code defect "to the repository's `ISSUES.md`" (rewrite/SKILL.md:138-139; loop.md:41), neither behind a word of the user's; what waits for the word is applying the candidate to the user's files (rewrite/SKILL.md:176-177). The page's own summary, "writes into your tree only on your word" (rewrite/SKILL.md:6-7), is contradicted by the same two lines.

### C17 — README.md:38

Claim: every agent any of the three skills spawns is announced first with its count and model, and the skill waits for the user's word.

Sources: plugins/terse/skills/audit/SKILL.md:80-83; plugins/terse/skills/audit/references/measure.md:40-42; plugins/terse/skills/rethink/SKILL.md:30-31, 56-57; plugins/terse/skills/rewrite/SKILL.md:60-62, 118-122; plugins/terse/skills/rewrite/references/bake-off.md:19-22; plugins/terse/skills/rewrite/references/loop.md:103-108.

Level: 2. Verdict: unconfirmed — "All" is a guarantee about all runs. Level 2 supports: each skill's main fan-outs carry the instruction (the lines above). Not settled: two spawns sit outside those announcements, a third judge "only when the two split" (bake-off.md:22) and the structure map "Written by someone other than the writer" (loop.md:107-108; rewrite/SKILL.md:139-140).

### C18 — README.md:43

Claim: inside Claude Code, `/plugin marketplace add Nowely/agent-skills` then `/plugin install terse@nowely` install terse.

Sources: .claude-plugin/marketplace.json:1-27; plugins/terse/.claude-plugin/plugin.json:1-10.

Level: 2. Verdict: confirmed — the marketplace is named `nowely` and lists `terse` at `./plugins/terse` (marketplace.json:2, 18-25); `origin` is github.com/Nowely/agent-skills and `origin/main` (8c041b7) lists terse 0.1.1; `claude plugin validate` passed on both manifests; with the checkout's path in place of `Nowely/agent-skills`, the shell form added `nowely` and installed `terse@nowely` 0.1.1 into an isolated config (exit 0 each). The GitHub fetch and the slash form were not run, so the sentence as written stays at level 2.

### C19 — README.md:47

Claim: from a shell, `claude plugin marketplace add Nowely/agent-skills` then `claude plugin install terse@nowely` do the same.

Sources: .claude-plugin/marketplace.json:1-27; plugins/terse/.claude-plugin/plugin.json:1-10.

Level: 2. Verdict: confirmed — `claude plugin --help` (2.1.280) lists `marketplace add <source>`, "from a URL, path, or GitHub repo", and `install <plugin>`, "use plugin@marketplace"; both ran with the checkout's path as the source (C18); the GitHub source was not fetched.

### C20 — README.md:48

Claim: after the two install steps nothing else is required: no dependencies, no configuration file, no account.

Sources: plugins/terse/package.json:1-7; plugins/terse/skills/audit/SKILL.md:153-158; plugins/terse/skills/rewrite/SKILL.md:69-75, 106-111, 134-135.

Level: 3. Verdict: refuted — the installed skills run Node scripts, `node "$A/ledger-seed.mjs"` with `$A` at `$CLAUDE_PLUGIN_ROOT/skills/audit/scripts` (audit/SKILL.md:155-157) and `node "$S/…"` with `$S` at `$CLAUDE_PLUGIN_ROOT/skills/rewrite/scripts` (rewrite/SKILL.md:69-75, 106-111). The installed copy bundles no runtime (no `node`, no `node_modules` in the isolated install's cache), and run from there its self-test exited 127, "node: command not found", with node off `PATH` (exit 0 with Node 24.11.0). What holds: no npm dependencies (package.json:1-7; the self-test passes with nothing installed), no configuration file, and the Codex lenses that would need another account fall back to Claude agents (rewrite/SKILL.md:134-135).

### C21 — README.md:49

Claim: Node 22 or newer is needed only when running the plugin from a source checkout.

Sources: plugins/terse/package.json:4-6; plugins/terse/skills/audit/SKILL.md:153-158; plugins/terse/skills/rewrite/SKILL.md:69-75.

Level: 3. Verdict: refuted — both pages give the installed location of the scripts they run with `node`: "installed, $CLAUDE_PLUGIN_ROOT/skills/audit/scripts" (audit/SKILL.md:155) and "installed, it is `$CLAUDE_PLUGIN_ROOT/skills/rewrite/scripts`" (rewrite/SKILL.md:70); the installed copy failed with exit 127 without node (C20). The floor of 22 is `engines.node` ">=22" (package.json:4-6); no script checks the version, and only Node 24.11.0 was run.

### C22 — README.md:53

Claim: running terse makes a document more accurate and easier for its readers to answer from.

Sources: research/README.md:9-12; plugins/terse/skills/audit/references/measure.md:1-6; plugins/terse/references/prior-art.md:128-133.

Level: 2. Verdict: unconfirmed — the one measured run is "not distinguishable from chance" and had no no-document arm (measure.md:3-6; research/README.md:9-10); prior-art.md:131-132 records that the numbers "measure model answerability" and "are not valid evidence of human improvement yet"; the 2026-09-11 rounds introduced regressions "1, 2, 1, 0, 6, 5, 10" (research/README.md:12).

### C23 — README.md:53

Claim: shortening the text is not terse's aim: length never selects a candidate and budgets never block a round.

Sources: plugins/terse/skills/rewrite/references/bake-off.md:13-15, 118, 136-138; plugins/terse/skills/rewrite/SKILL.md:82-85, 110; plugins/terse/skills/rewrite/scripts/sections.mjs:4, 25; research/2026-09-10-chain/README.md:32-34.

Level: 2. Verdict: confirmed — length is "reported, never selects" (bake-off.md:118), budgets are "a report the owner reads, not a gate" (rewrite/SKILL.md:83-84), and sections.mjs exits 0 over budget (sections.mjs:4, 25; self-test "sections reports a section over its budget and still exits 0" ok); the record calls "the claim that this plugin compresses text" false (research/2026-09-10-chain/README.md:33-34).

### C24 — README.md:53

Claim: on the one 2026-09-10 README the chain went from 2,725 to 2,571 words, about six percent fewer, while pass two removed 105 words and pass three added 105 back as framing.

Sources: research/2026-09-10-chain/README.md:18-24, 32-34; research/2026-09-10-chain/chain/audit.md:15-25; research/2026-09-10-chain/chain/validation.json:3-4.

Level: 3. Verdict: confirmed — `wc -w` over chain/: 00-original 2725, 01 2482, 02 2377, 03 2482, README 2571; 2482 − 2377 = 105; 2725 − 2571 = 154 = 5.65%; "Added 105 words for missing framing" (chain/audit.md:25).

### C25 — README.md:55

Claim: a text that is long because its content is false comes out shorter.

Sources: research/2026-09-10-chain/chain/cut-ledger.md:1-8, 23; plugins/terse/skills/rewrite/references/measurements.md:109-119.

Level: 2. Verdict: unconfirmed — no run separates length that comes from falsehood. The one file lost 6% and its cut ledger counts false guarantees among the removals (cut-ledger.md:7, 23); the 2026-09-11 rounds grew from 1383 to 1611 words with "every one of them making a claim truer" (measurements.md:116-118), and round 09 then removed sentences instead (measurements.md:109-114).

### C26 — README.md:56

Claim: a text that is long because its subject is hard keeps its length and is made accurate.

Sources: plugins/terse/skills/rewrite/references/writing-rules.md:6-10, 21-23; plugins/terse/skills/rewrite/references/bake-off.md:118.

Level: 2. Verdict: unconfirmed — a prediction no recorded run tested; level 2 supports only that length never selects a candidate (bake-off.md:118) and that a condition, a limit or a warning where a reader decides is not cut (writing-rules.md:21).

### C27 — README.md:58

Claim: rewrite leaves every condition, limit and warning at a decision point unchanged.

Sources: plugins/terse/skills/rewrite/references/writing-rules.md:21-23; plugins/terse/skills/rewrite/references/bake-off.md:47, 60-63, 113-114; plugins/terse/skills/rewrite/references/critic-briefs.md:108-110; plugins/terse/skills/audit/SKILL.md:123; plugins/terse/skills/rewrite/SKILL.md:195-198.

Level: 2. Verdict: refuted — the rule is "Never cut a condition, a limit or a warning where a reader decides" (writing-rules.md:21; rewrite/SKILL.md:196-197) and the veto is "cut or weakened" (bake-off.md:114); each writer is told to "Rewrite the whole of <FILE>" (bake-off.md:47) and to "Correct what the current file gets wrong rather than carrying it forward" (bake-off.md:61-62), and a refuted claim is corrected "at its source" (audit/SKILL.md:123), so such a passage may be reworded or corrected, only not cut or weakened. "Never touch" is the water critic's brief alone (critic-briefs.md:109-110).

### C28 — README.md:58

Claim: rewrite never removes a repetition that sits at a decision point a reader reaches independently.

Sources: plugins/terse/skills/rewrite/references/writing-rules.md:21-22; plugins/terse/skills/rewrite/references/loop.md:124-131; plugins/terse/skills/rewrite/scripts/dup.mjs:4-6; plugins/terse/skills/rewrite/SKILL.md:195-198.

Level: 2. Verdict: unconfirmed — "will not" is a guarantee about all runs. Level 2 supports: such a repetition "is not redundancy" (writing-rules.md:21-22; rewrite/SKILL.md:197), judged by "whether the second reader plausibly skipped the first occurrence" (loop.md:130); dup.mjs flags every idea in three or more sections and leaves the exception to the reader (dup.mjs:4-6), so nothing mechanical keeps one.

### C29 — README.md:59

Claim: rewrite never removes the date or the numbers of a dated measurement, even where the code has since changed.

Sources: plugins/terse/skills/rewrite/references/writing-rules.md:21-23; plugins/terse/skills/rewrite/SKILL.md:195-198.

Level: 2. Verdict: unconfirmed — "will not" is a guarantee about all runs. Level 2 supports: "A dated measurement keeps its date and its numbers, including ones the code has since changed" (writing-rules.md:22-23; rewrite/SKILL.md:197-198); no check enforces it.

### C30 — README.md:64

Claim: everything under *What was measured* comes from a single run on 2026-09-10 over one README of one repository.

Sources: research/2026-09-10-chain/README.md:1, 14-16, 36-48; research/2026-09-10-chain/chain/audit.md:1-3; research/2026-09-10-chain/run-2x5/zP378l2j.prompt.txt:9-15; research/2026-09-10-chain/run-2x5/v04PR6HL.prompt.txt:8-11.

Level: 2. Verdict: refuted — the record holds two experiments that day, "The 2026-09-10 chain and bake-off" (research/2026-09-10-chain/README.md:1), and the bake-off's material was not one README: "The corpus is the whole of it: README.md, CHANGELOG.md, RELEASING.md, evals/README.md, every SKILL.md under skills/ together with the reference pages beside them, and the comments in the .mjs sources" (run-2x5/zP378l2j.prompt.txt:13-15). One repository holds (codex-delegate; chain/audit.md:3; v04PR6HL.prompt.txt:8), and the chain was one README (research/2026-09-10-chain/README.md:16).

### C31 — README.md:66

Claim: across the four-pass chain, six reader questions went from three right answers to six, readers leaving the documentation from one to zero, and both control questions stayed right.

Sources: research/README.md:9; plugins/terse/skills/audit/references/measure.md:3-6, 123-128; research/2026-09-10-chain/chain/return.json:3; research/2026-09-10-chain/chain/validation.json:19-21; plugins/terse/references/prior-art.md:908-912.

Level: 1. Verdict: unconfirmed — the numbers are stated by the research index (research/README.md:9, 3/6 → 6/6 only) and by the plugin's own page (measure.md:125-127, all three), but no reader's answer, departure or control result is in research/2026-09-10-chain/: the chain seat reports "No project tests, model calls or new reader experiment were run" (chain/return.json:3; validation.json:20, `live_reader_experiments_run: 0`), and the readers, Haiku (measure.md:40), are not among the forty Codex returns in run-2x5/. prior-art.md:911 says every 2026-09-10 number traces to that directory; this one does not.

### C32 — README.md:67

Claim: the reader measurement had six questions and one reader per question per version.

Sources: research/README.md:9; plugins/terse/skills/audit/references/measure.md:3-6.

Level: 1. Verdict: unconfirmed — stated by the index and the page; no per-reader record is in the repository (C31).

### C33 — README.md:68

Claim: three discordant pairs, all improvements, and none reversed give an exact two-sided McNemar p of 0.25, which does not clear a conventional significance threshold.

Sources: plugins/terse/references/prior-art.md:92-95; research/README.md:9.

Level: 3. Verdict: confirmed — computed under the run directory: 2 × C(3,0) × 0.5³ = 0.25; the counts it takes are C31's, which are unconfirmed.

### C34 — README.md:70

Claim: of the run's six reader failures, two came from false claims in the README rather than from an answer that was hard to find.

Sources: research/README.md:9; plugins/terse/skills/audit/references/measure.md:127-128; research/2026-09-10-chain/chain/audit.md:27-31, 60-62; research/2026-09-11-terse-survey/seat-returns/A5.md:30.

Level: 2. Verdict: unconfirmed — the index and the page state it (research/README.md:9; measure.md:127-128), and the chain checked "Six reader failures" and repaired reader 1 by removing "guaranteed-receipt and cannot-fake-success promises" (chain/audit.md:27, 62); the readers' answers and a cause per failure are not in the record, and the same README counts three wrong answers (C31). An earlier seat already found "The mapping between failure instances and questions is missing" (A5.md:30).

### C35 — README.md:70

Claim: one reader repeated two guarantees stated at lines 5-9 of the audited README, both false of its code.

Sources: research/2026-09-10-chain/chain/00-original.md:5-9; research/2026-09-10-chain/chain/audit.md:62; plugins/terse/skills/audit/references/truth-pass.md:27-36; plugins/terse/skills/audit/references/ledgers.md:105-110.

Level: 2. Verdict: unconfirmed — the two guarantees stand at chain/00-original.md:5-8 ("Every completed turn leaves a receipt", "a seat that did nothing cannot report as though it had") and reader 1's repair removed both (chain/audit.md:62); the reader's answer is not in the record, the code they are false of (codex-delegate) is not in this checkout, and truth-pass.md:33 counts differently: "Two readers repeated the guarantee back as the project's core promise."

### C36 — README.md:73

Claim: in that run, readers' own reports of clarity did not track whether their answers were right.

Sources: plugins/terse/skills/audit/SKILL.md:98-101; plugins/terse/skills/audit/references/measure.md:62-65; plugins/terse/references/prior-art.md:97-100.

Level: 1. Verdict: unconfirmed — stated by the pages only; the readers' self-reports are not in research/2026-09-10-chain/ (C31).

### C37 — README.md:73

Claim: two readers who reported no confusion answered wrong, and the one who called a section scattered and confusing answered right.

Sources: plugins/terse/skills/audit/SKILL.md:98-100; plugins/terse/skills/audit/references/measure.md:62-64; plugins/terse/references/prior-art.md:97-100.

Level: 1. Verdict: unconfirmed — as C36: the pages state it, prior-art.md:99 sizes it as "three observations", and no record of the readers is in the repository.

### C38 — README.md:74

Claim: no reader brief of audit or rewrite asks whether the text was clear.

Sources: plugins/terse/skills/audit/SKILL.md:98-101; plugins/terse/skills/audit/references/measure.md:44-65; plugins/terse/skills/rewrite/references/critic-briefs.md:117-166.

Level: 2. Verdict: unconfirmed — "Neither … asks" is a guarantee about all runs. Level 2 supports: `grep -i -E 'clear|confus|clarity'` over plugins/terse/skills finds only audit's prohibition (audit/SKILL.md:98; measure.md:62), and no brief of either page asks it (measure.md:46-60; critic-briefs.md:117-166); rewrite carries no prohibition of its own.

### C39 — README.md:76

Claim: the 2026-09-10 bake-off put five published writing standards against two unguided control agents, ten agents in all, with the models hidden from the judges.

Sources: research/2026-09-10-chain/run-2x5/v04PR6HL.prompt.txt:8-24; research/2026-09-10-chain/run-2x5/o8eHzS6U.prompt.txt:8-18; research/2026-09-10-chain/run-2x5/zP378l2j.prompt.txt:21; research/2026-09-10-chain/run-2x5/oRfBREBF.prompt.txt:21; research/2026-09-10-chain/run-2x5/rCYUALAd.prompt.txt:21.

Level: 2. Verdict: refuted — the judges' brief sets "a two-by-five factorial. Five standards, each given to two agents", the fifth "CONTROL, no standard given at all P9, P10" and the third "a draft rule block for the owner's CLAUDE.md" (v04PR6HL.prompt.txt:13-20): four standards, one an unpublished draft, and one control condition of two agents. Ten agents and hidden models hold (v04PR6HL.prompt.txt:8, 22-24).

### C40 — README.md:77

Claim: each control agent ranked above both agents of each of the two published standards.

Sources: research/2026-09-10-chain/run-2x5/o8eHzS6U.answer.md:3; research/2026-09-10-chain/run-2x5/v04PR6HL.answer.md:3; research/2026-09-10-chain/run-2x5/o8eHzS6U.prompt.txt:20-25.

Level: 2. Verdict: unconfirmed — true of the readability judge, J2: "Both controls beat both published on-axis standards’ entrants here", with P9 2nd and P10 3rd above Diataxis P2 5th and P1 10th and the house style P7 7th and P8 8th (o8eHzS6U.answer.md:3). False of the other judge, J1, whose ranking puts control P9 7th, below P7 4th and P2 6th (v04PR6HL.answer.md:3). The sentence names neither judge; on both, the draft rule block P6 beat both controls.

### C41 — README.md:77

Claim: on the audited README's first 116 words, seven of the ten agents proposed no change, and the only agent that shortened the passage was a control.

Sources: research/2026-09-10-chain/run-2x5/o8eHzS6U.answer.md:6, 10-19.

Level: 2. Verdict: refuted — the judge's own count for that passage (README.md:3-9, 116 words; o8eHzS6U.answer.md:6) has five entrants with no proposal (P1, P2, P4, P5, P6), one with a punctuation change that leaves 116 words (P8), and three that lengthened it, P3 116→126, P7 116→125 and P10 116→137 (o8eHzS6U.answer.md:10-19): six at most, not seven. The shortening holds: only P9, a control, 116→97 (o8eHzS6U.answer.md:18).

### C42 — README.md:78

Claim: the passage result rests on ten agents in one run on one passage, one agent in each cell of the design.

Sources: research/2026-09-10-chain/run-2x5/v04PR6HL.prompt.txt:13-20; research/2026-09-10-chain/run-2x5/o8eHzS6U.answer.md:6.

Level: 2. Verdict: confirmed — five standards × two model families, one agent each (v04PR6HL.prompt.txt:13-20), and one passage the judge chose (o8eHzS6U.answer.md:6).

### C43 — README.md:81

Claim: nothing in the record isolates which of the chain's passes produced the gain, or compares a bake-off with one careful pass.

Sources: research/README.md:7-16; plugins/terse/skills/audit/references/measure.md:130-132; plugins/terse/skills/rewrite/references/bake-off.md:8-11.

Level: 2. Verdict: confirmed — no run in the research index measures either (research/README.md:7-16); the isolating experiment "was designed and deliberately not run" (measure.md:131); "Not measured: that a bake-off beats a single careful pass" (bake-off.md:8-9).

### C44 — README.md:82

Claim: the 2026-09-10 measurement had no arm that ran the questions without the document, so it cannot separate what the text taught from what a reader already knew.

Sources: research/README.md:10; plugins/terse/references/prior-art.md:104-107; plugins/terse/skills/audit/references/measure.md:70-81.

Level: 2. Verdict: confirmed — "no arm ever ran without the document" (research/README.md:10); "Both ran the control. We did not." (prior-art.md:107).
Position: arrives after the four bullets it qualifies. By its own words it is "worth knowing before you trust any of the above" (README.md:82), and a reader who takes a number from README.md:66-79 has not met it yet.

### C45 — README.md:84

Claim: two published benchmarks that ran a no-document arm found what readers already knew to be large.

Sources: plugins/terse/references/prior-art.md:104-107; plugins/terse/skills/audit/references/measure.md:75-78.

Level: 2. Verdict: refuted — against the only record of them in the checkout: Code-QA-Bench's closed-book arm scores "0.56 to 0.68", large, but "SWD-Bench's no-document arm sits at chance (48.68 balanced accuracy, MCC −3.43)" (prior-art.md:104-107), so one of the two found prior knowledge near nothing. Read as the gap between the arms, SWD-Bench fits and Code-QA-Bench's gap is not given; under neither reading do both fit. The papers themselves were not read.

### C46 — README.md:84

Claim: the plugin's reference files state the missing no-document arm where it bears, and prior-art.md collects every finding against the numbers above.

Sources: plugins/terse/skills/audit/SKILL.md:90-96; plugins/terse/skills/audit/references/measure.md:70-81; plugins/terse/references/prior-art.md:87-133; research/2026-09-11-terse-survey/seat-returns/A5.md:1, 20, 30.

Level: 2. Verdict: refuted — prior-art.md's findings section summarises one adversarial seat's verdict (prior-art.md:89-90; the seat is A5, A5.md:1) and leaves out two of that seat's findings against these numbers: "The account names five standards but reports winners against “both standards”; allocation and per-standard sample sizes are unresolved" (A5.md:20) and "The mapping between failure instances and questions is missing" (A5.md:30); grep finds neither in prior-art.md. The first half holds: audit/SKILL.md:90-96 and measure.md:70-81 state the missing arm.

```json claims
[
 {
  "id": "C01",
  "where": "README.md:3",
  "sentence": "A Claude Code plugin that measures whether your documentation gives readers the right answer, and then\nrepairs what it measured.",
  "claim": "terse is a Claude Code plugin whose `audit` measures whether fresh readers reach the right answers from a document and whose `rewrite` then produces a repair of what was measured.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "plugins/terse/.claude-plugin/plugin.json:1-10; .claude-plugin/marketplace.json:18-25; plugins/terse/skills/audit/SKILL.md:65-88; plugins/terse/skills/rewrite/SKILL.md:14-21, 173-177"
 },
 {
  "id": "C02",
  "where": "README.md:4",
  "sentence": "It sends fresh readers through your `.md` files and checks every claim about\nbehaviour against the code, so a failure arrives with a line number and a cause rather than an opinion.",
  "claim": "audit sends fresh readers who may open only the `.md` files, checks every behavioural claim in them against the code, and reports each failure with a line number and a cause.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/audit/SKILL.md:25-28, 52-55, 85-88, 119-127; plugins/terse/skills/audit/references/measure.md:28-38, 44-68; plugins/terse/skills/audit/references/ledgers.md:43-63, 91-114; plugins/terse/skills/audit/references/truth-pass.md:21-25, 73-80"
 },
 {
  "id": "C03",
  "where": "README.md:7",
  "sentence": "Three skills.",
  "claim": "the plugin ships three skills.",
  "level": 3,
  "verdict": "confirmed",
  "sources": "plugins/terse/skills/audit/SKILL.md:1-11; plugins/terse/skills/rethink/SKILL.md:1-11; plugins/terse/skills/rewrite/SKILL.md:1-12"
 },
 {
  "id": "C04",
  "where": "README.md:7",
  "sentence": "You invoke all three; none starts on its own.",
  "claim": "each skill starts only when the user invokes it, and no skill starts itself or another skill.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/audit/SKILL.md:7, 160-161; plugins/terse/skills/rethink/SKILL.md:7, 82-83; plugins/terse/skills/rewrite/SKILL.md:8, 21; plugins/terse/skills/rewrite/references/loop.md:38"
 },
 {
  "id": "C05",
  "where": "README.md:10",
  "sentence": "/terse:rethink  →  skeleton  →  /terse:rewrite  →  candidate + diff  →  /terse:audit\n/terse:audit    →  run file  →  /terse:rewrite  →  candidate + diff  →  /terse:audit again\n   what broke                    what to write                          did it hold",
  "claim": "`rethink` returns a skeleton that `rewrite` writes against; `audit` returns a run file that `rewrite` starts from; `rewrite` returns a candidate and a diff; `audit` can be run again to see whether the result held.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "plugins/terse/skills/rethink/SKILL.md:13-21, 70-83; plugins/terse/skills/audit/SKILL.md:149-161; plugins/terse/skills/rewrite/SKILL.md:14-21, 173-177; plugins/terse/skills/audit/references/measure.md:106-115"
 },
 {
  "id": "C06",
  "where": "README.md:17",
  "sentence": "**`/terse:audit`** builds a profile of who reads this project, derives the correct answers from the\ncode, then sends one fresh reader per question through the documentation — `.md` only, starting where a\nreal reader starts.",
  "claim": "audit builds a profile of the project's readers, writes the answer key from the claim ledger it checks against the code, then sends one fresh reader per question who may open only `.md` files and starts at the entry file.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "plugins/terse/skills/audit/SKILL.md:21-28, 42-48, 65-78, 80-88; plugins/terse/skills/audit/references/measure.md:8-18, 28-38; plugins/terse/skills/audit/references/reader-profile.md:7-24"
 },
 {
  "id": "C07",
  "where": "README.md:19",
  "sentence": "It returns a score, the questions that failed, and why each failed: the text lied,\nthe answer was nowhere, the true sentence sat where it misleads, it was there and unfindable, or every\nsentence was true and the sequence left the reader worse off.",
  "claim": "audit returns a score, the questions that failed, and one of five causes for each failure: refuted, missing, placement, findability or harmful.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "plugins/terse/skills/audit/SKILL.md:103-137, 149-161; plugins/terse/skills/audit/references/ledgers.md:7-41, 65-89, 102-114"
 },
 {
  "id": "C08",
  "where": "README.md:21",
  "sentence": "It never suggests\nwording.",
  "claim": "audit proposes no replacement wording.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/audit/SKILL.md:1-6, 18-19; plugins/terse/skills/audit/references/ledgers.md:102-114"
 },
 {
  "id": "C09",
  "where": "README.md:24",
  "sentence": "**`/terse:rethink`** decides what a document should be before a sentence of it is written: what\ncomparable documents in the same genre already solved, what things should be called, and what is said in\nwhat order.",
  "claim": "rethink decides, before any prose is written, what comparable documents already solved, what things are called, and what is said in what order.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "plugins/terse/skills/rethink/SKILL.md:1-15, 25-68"
 },
 {
  "id": "C10",
  "where": "README.md:26",
  "sentence": "It returns a skeleton — section titles, what each is for, what each leaves out, a word budget\n— and stops there for your word.",
  "claim": "rethink hands over a skeleton, each section with a title, a purpose, what it leaves out and a word budget, and waits for the user's word.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "plugins/terse/skills/rethink/SKILL.md:13-21, 70-83"
 },
 {
  "id": "C11",
  "where": "README.md:31",
  "sentence": "**`/terse:rewrite`** takes a skeleton or an audit's run file and writes against it.",
  "claim": "rewrite starts from a skeleton `rethink` agreed or from an audit's run file and writes the document against it.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "plugins/terse/skills/rewrite/SKILL.md:14-21, 27-50"
 },
 {
  "id": "C12",
  "where": "README.md:31",
  "sentence": "Three writers produce\ncandidates and two judges score them on the failures rather than on taste; the winner then goes through\na loop of critics whose lenses do not overlap — the code, the rules, an adversarial reader, a task, a\nreader's questions — until a round finds nothing new and nothing got worse.",
  "claim": "three writers produce candidates and two judges score them on the measured failures; the winner then goes through rounds of critics whose lenses do not overlap (code, rules, adversarial reader, task, reader's questions) until a round finds nothing new and nothing got worse.",
  "level": 2,
  "verdict": "refuted",
  "sources": "plugins/terse/skills/rewrite/SKILL.md:52-62, 118-135, 146-160, 162-177; plugins/terse/skills/rewrite/references/bake-off.md:17-29, 106-132; plugins/terse/skills/rewrite/references/loop.md:81-88; plugins/terse/skills/rewrite/references/measurements.md:52-55"
 },
 {
  "id": "C13",
  "where": "README.md:34",
  "sentence": "Every round is kept as its\nown file.",
  "claim": "every round of a rewrite stays on disk as its own file.",
  "level": 3,
  "verdict": "refuted",
  "sources": "plugins/terse/skills/rewrite/SKILL.md:68-69, 107-117, 123-131; plugins/terse/skills/rewrite/scripts/round.mjs:12-13, 38-40, 54; plugins/terse/skills/rewrite/references/loop.md:64-67"
 },
 {
  "id": "C14",
  "where": "README.md:35",
  "sentence": "You get the winner, the diff, a list of every cut of twenty words or more with its reason, and the file, line and evidence level behind every behavioural claim.",
  "claim": "rewrite hands over the final text, its diff against the original, a list of every removal of twenty words or more with its reason, and the file, line and evidence level behind every behavioural claim.",
  "level": 3,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/rewrite/SKILL.md:88-105, 118-122, 173-193; plugins/terse/skills/rewrite/scripts/round.mjs:65-67, 107-118; plugins/terse/skills/audit/scripts/ledger-seed.mjs:12-14, 60; plugins/terse/skills/rewrite/references/critic-briefs.md:53-54; plugins/terse/skills/rewrite/references/measurements.md:127-131"
 },
 {
  "id": "C15",
  "where": "README.md:35",
  "sentence": "It writes into its own run directory.",
  "claim": "rewrite writes its rounds and artefacts into a run directory of its own.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "plugins/terse/skills/rewrite/SKILL.md:64-71, 179-193"
 },
 {
  "id": "C16",
  "where": "README.md:35",
  "sentence": "Applying\nanything to your files needs your word.",
  "claim": "nothing rewrite does changes the user's files without the user's word.",
  "level": 2,
  "verdict": "refuted",
  "sources": "plugins/terse/skills/rewrite/SKILL.md:6-7, 64-67, 136-140, 173-177; plugins/terse/skills/rewrite/references/loop.md:35-42"
 },
 {
  "id": "C17",
  "where": "README.md:38",
  "sentence": "All three skills announce how many agents they are about to spawn, on which model, and wait.",
  "claim": "every agent any of the three skills spawns is announced first with its count and model, and the skill waits for the user's word.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/audit/SKILL.md:80-83; plugins/terse/skills/audit/references/measure.md:40-42; plugins/terse/skills/rethink/SKILL.md:30-31, 56-57; plugins/terse/skills/rewrite/SKILL.md:60-62, 118-122; plugins/terse/skills/rewrite/references/bake-off.md:19-22; plugins/terse/skills/rewrite/references/loop.md:103-108"
 },
 {
  "id": "C18",
  "where": "README.md:43",
  "sentence": "/plugin marketplace add Nowely/agent-skills\n/plugin install terse@nowely",
  "claim": "inside Claude Code, `/plugin marketplace add Nowely/agent-skills` then `/plugin install terse@nowely` install terse.",
  "level": 2,
  "verdict": "confirmed",
  "sources": ".claude-plugin/marketplace.json:1-27; plugins/terse/.claude-plugin/plugin.json:1-10"
 },
 {
  "id": "C19",
  "where": "README.md:47",
  "sentence": "The same two steps from a shell: `claude plugin marketplace add Nowely/agent-skills`, then\n`claude plugin install terse@nowely`.",
  "claim": "from a shell, `claude plugin marketplace add Nowely/agent-skills` then `claude plugin install terse@nowely` do the same.",
  "level": 2,
  "verdict": "confirmed",
  "sources": ".claude-plugin/marketplace.json:1-27; plugins/terse/.claude-plugin/plugin.json:1-10"
 },
 {
  "id": "C20",
  "where": "README.md:48",
  "sentence": "Nothing else is needed — no dependencies, no configuration file,\nno account anywhere.",
  "claim": "after the two install steps nothing else is required: no dependencies, no configuration file, no account.",
  "level": 3,
  "verdict": "refuted",
  "sources": "plugins/terse/package.json:1-7; plugins/terse/skills/audit/SKILL.md:153-158; plugins/terse/skills/rewrite/SKILL.md:69-75, 106-111, 134-135"
 },
 {
  "id": "C21",
  "where": "README.md:49",
  "sentence": "Node 22 or newer if you run the checkout directly.",
  "claim": "Node 22 or newer is needed only when running the plugin from a source checkout.",
  "level": 3,
  "verdict": "refuted",
  "sources": "plugins/terse/package.json:4-6; plugins/terse/skills/audit/SKILL.md:153-158; plugins/terse/skills/rewrite/SKILL.md:69-75"
 },
 {
  "id": "C22",
  "where": "README.md:53",
  "sentence": "It makes documentation truer and easier to answer from.",
  "claim": "running terse makes a document more accurate and easier for its readers to answer from.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "research/README.md:9-12; plugins/terse/skills/audit/references/measure.md:1-6; plugins/terse/references/prior-art.md:128-133"
 },
 {
  "id": "C23",
  "where": "README.md:53",
  "sentence": "It is not a compressor.",
  "claim": "shortening the text is not terse's aim: length never selects a candidate and budgets never block a round.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "plugins/terse/skills/rewrite/references/bake-off.md:13-15, 118, 136-138; plugins/terse/skills/rewrite/SKILL.md:82-85, 110; plugins/terse/skills/rewrite/scripts/sections.mjs:4, 25; research/2026-09-10-chain/README.md:32-34"
 },
 {
  "id": "C24",
  "where": "README.md:53",
  "sentence": "On the one file\nmeasured, the chain moved 2,725 words to 2,571 — six percent — while the second pass cut 105 words and\nthe third added 105 back as missing framing.",
  "claim": "on the one 2026-09-10 README the chain went from 2,725 to 2,571 words, about six percent fewer, while pass two removed 105 words and pass three added 105 back as framing.",
  "level": 3,
  "verdict": "confirmed",
  "sources": "research/2026-09-10-chain/README.md:18-24, 32-34; research/2026-09-10-chain/chain/audit.md:15-25; research/2026-09-10-chain/chain/validation.json:3-4"
 },
 {
  "id": "C25",
  "where": "README.md:55",
  "sentence": "If your text is long because it is wrong, this shortens it.",
  "claim": "a text that is long because its content is false comes out shorter.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "research/2026-09-10-chain/chain/cut-ledger.md:1-8, 23; plugins/terse/skills/rewrite/references/measurements.md:109-119"
 },
 {
  "id": "C26",
  "where": "README.md:56",
  "sentence": "If it is long because it explains something hard, it will stay long and start being right.",
  "claim": "a text that is long because its subject is hard keeps its length and is made accurate.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/rewrite/references/writing-rules.md:6-10, 21-23; plugins/terse/skills/rewrite/references/bake-off.md:118"
 },
 {
  "id": "C27",
  "where": "README.md:58",
  "sentence": "It will not touch a condition, a limit or a warning at a point where you decide something.",
  "claim": "rewrite leaves every condition, limit and warning at a decision point unchanged.",
  "level": 2,
  "verdict": "refuted",
  "sources": "plugins/terse/skills/rewrite/references/writing-rules.md:21-23; plugins/terse/skills/rewrite/references/bake-off.md:47, 60-63, 113-114; plugins/terse/skills/rewrite/references/critic-briefs.md:108-110; plugins/terse/skills/audit/SKILL.md:123; plugins/terse/skills/rewrite/SKILL.md:195-198"
 },
 {
  "id": "C28",
  "where": "README.md:58",
  "sentence": "It will not\nstrip a repetition that sits at a decision a reader reaches independently.",
  "claim": "rewrite never removes a repetition that sits at a decision point a reader reaches independently.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/rewrite/references/writing-rules.md:21-22; plugins/terse/skills/rewrite/references/loop.md:124-131; plugins/terse/skills/rewrite/scripts/dup.mjs:4-6; plugins/terse/skills/rewrite/SKILL.md:195-198"
 },
 {
  "id": "C29",
  "where": "README.md:59",
  "sentence": "It will not drop the date or\nthe numbers from a measurement, including numbers the code has since changed.",
  "claim": "rewrite never removes the date or the numbers of a dated measurement, even where the code has since changed.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/rewrite/references/writing-rules.md:21-23; plugins/terse/skills/rewrite/SKILL.md:195-198"
 },
 {
  "id": "C30",
  "where": "README.md:64",
  "sentence": "One run, on 2026-09-10, on one README in one repository.",
  "claim": "everything under *What was measured* comes from a single run on 2026-09-10 over one README of one repository.",
  "level": 2,
  "verdict": "refuted",
  "sources": "research/2026-09-10-chain/README.md:1, 14-16, 36-48; research/2026-09-10-chain/chain/audit.md:1-3; research/2026-09-10-chain/run-2x5/zP378l2j.prompt.txt:9-15; research/2026-09-10-chain/run-2x5/v04PR6HL.prompt.txt:8-11"
 },
 {
  "id": "C31",
  "where": "README.md:66",
  "sentence": "The four-pass chain took six reader questions from three right answers to six, took readers leaving\n  the documentation from one to zero, and broke neither control question.",
  "claim": "across the four-pass chain, six reader questions went from three right answers to six, readers leaving the documentation from one to zero, and both control questions stayed right.",
  "level": 1,
  "verdict": "unconfirmed",
  "sources": "research/README.md:9; plugins/terse/skills/audit/references/measure.md:3-6, 123-128; research/2026-09-10-chain/chain/return.json:3; research/2026-09-10-chain/chain/validation.json:19-21; plugins/terse/references/prior-art.md:908-912"
 },
 {
  "id": "C32",
  "where": "README.md:67",
  "sentence": "**Six questions, one trial\n  each.**",
  "claim": "the reader measurement had six questions and one reader per question per version.",
  "level": 1,
  "verdict": "unconfirmed",
  "sources": "research/README.md:9; plugins/terse/skills/audit/references/measure.md:3-6"
 },
 {
  "id": "C33",
  "where": "README.md:68",
  "sentence": "Three improvements and no reversals over six paired items gives an exact two-sided McNemar\n  *p* = 0.25, so this result is not distinguishable from chance.",
  "claim": "three discordant pairs, all improvements, and none reversed give an exact two-sided McNemar p of 0.25, which does not clear a conventional significance threshold.",
  "level": 3,
  "verdict": "confirmed",
  "sources": "plugins/terse/references/prior-art.md:92-95; research/README.md:9"
 },
 {
  "id": "C34",
  "where": "README.md:70",
  "sentence": "Two of the six failures were lies rather than findability.",
  "claim": "of the run's six reader failures, two came from false claims in the README rather than from an answer that was hard to find.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "research/README.md:9; plugins/terse/skills/audit/references/measure.md:127-128; research/2026-09-10-chain/chain/audit.md:27-31, 60-62; research/2026-09-11-terse-survey/seat-returns/A5.md:30"
 },
 {
  "id": "C35",
  "where": "README.md:70",
  "sentence": "A reader repeated two guarantees from\n  `README.md:5-9` that the code does not make.",
  "claim": "one reader repeated two guarantees stated at lines 5-9 of the audited README, both false of its code.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "research/2026-09-10-chain/chain/00-original.md:5-9; research/2026-09-10-chain/chain/audit.md:62; plugins/terse/skills/audit/references/truth-pass.md:27-36; plugins/terse/skills/audit/references/ledgers.md:105-110"
 },
 {
  "id": "C36",
  "where": "README.md:73",
  "sentence": "A reader's own sense of clarity ran against the truth.",
  "claim": "in that run, readers' own reports of clarity did not track whether their answers were right.",
  "level": 1,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/audit/SKILL.md:98-101; plugins/terse/skills/audit/references/measure.md:62-65; plugins/terse/references/prior-art.md:97-100"
 },
 {
  "id": "C37",
  "where": "README.md:73",
  "sentence": "Two who reported no confusion answered wrong;\n  the one who called a section scattered and confusing answered right.",
  "claim": "two readers who reported no confusion answered wrong, and the one who called a section scattered and confusing answered right.",
  "level": 1,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/audit/SKILL.md:98-100; plugins/terse/skills/audit/references/measure.md:62-64; plugins/terse/references/prior-art.md:97-100"
 },
 {
  "id": "C38",
  "where": "README.md:74",
  "sentence": "Neither skill asks a reader\n  whether the text was clear.",
  "claim": "no reader brief of audit or rewrite asks whether the text was clear.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "plugins/terse/skills/audit/SKILL.md:98-101; plugins/terse/skills/audit/references/measure.md:44-65; plugins/terse/skills/rewrite/references/critic-briefs.md:117-166"
 },
 {
  "id": "C39",
  "where": "README.md:76",
  "sentence": "Five published writing standards were put against two unguided controls across ten agents, models\n  hidden from the judges.",
  "claim": "the 2026-09-10 bake-off put five published writing standards against two unguided control agents, ten agents in all, with the models hidden from the judges.",
  "level": 2,
  "verdict": "refuted",
  "sources": "research/2026-09-10-chain/run-2x5/v04PR6HL.prompt.txt:8-24; research/2026-09-10-chain/run-2x5/o8eHzS6U.prompt.txt:8-18; research/2026-09-10-chain/run-2x5/zP378l2j.prompt.txt:21; research/2026-09-10-chain/run-2x5/oRfBREBF.prompt.txt:21; research/2026-09-10-chain/run-2x5/rCYUALAd.prompt.txt:21"
 },
 {
  "id": "C40",
  "where": "README.md:77",
  "sentence": "Both controls beat both entries of both standards.",
  "claim": "each control agent ranked above both agents of each of the two published standards.",
  "level": 2,
  "verdict": "unconfirmed",
  "sources": "research/2026-09-10-chain/run-2x5/o8eHzS6U.answer.md:3; research/2026-09-10-chain/run-2x5/v04PR6HL.answer.md:3; research/2026-09-10-chain/run-2x5/o8eHzS6U.prompt.txt:20-25"
 },
 {
  "id": "C41",
  "where": "README.md:77",
  "sentence": "On the first 116 words,\n  seven of ten agents proposed nothing and the only agent that shortened the passage was a control.",
  "claim": "on the audited README's first 116 words, seven of the ten agents proposed no change, and the only agent that shortened the passage was a control.",
  "level": 2,
  "verdict": "refuted",
  "sources": "research/2026-09-10-chain/run-2x5/o8eHzS6U.answer.md:6, 10-19"
 },
 {
  "id": "C42",
  "where": "README.md:78",
  "sentence": "**Ten\n  agents, one run, one passage** — one observation per cell, not a rate.",
  "claim": "the passage result rests on ten agents in one run on one passage, one agent in each cell of the design.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "research/2026-09-10-chain/run-2x5/v04PR6HL.prompt.txt:13-20; research/2026-09-10-chain/run-2x5/o8eHzS6U.answer.md:6"
 },
 {
  "id": "C43",
  "where": "README.md:81",
  "sentence": "Not measured: which of the four passes produced the gain, and whether a bake-off beats one careful pass.",
  "claim": "nothing in the record isolates which of the chain's passes produced the gain, or compares a bake-off with one careful pass.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "research/README.md:7-16; plugins/terse/skills/audit/references/measure.md:130-132; plugins/terse/skills/rewrite/references/bake-off.md:8-11"
 },
 {
  "id": "C44",
  "where": "README.md:82",
  "sentence": "Also not measured, and worth knowing before you trust any of the above: there was no arm that ran the\nsame questions with no document at all, so none of this separates what the text taught a reader from what\nthe reader already knew.",
  "claim": "the 2026-09-10 measurement had no arm that ran the questions without the document, so it cannot separate what the text taught from what a reader already knew.",
  "level": 2,
  "verdict": "confirmed",
  "sources": "research/README.md:10; plugins/terse/references/prior-art.md:104-107; plugins/terse/skills/audit/references/measure.md:70-81"
 },
 {
  "id": "C45",
  "where": "README.md:84",
  "sentence": "Two published benchmarks that did run that arm found it large.",
  "claim": "two published benchmarks that ran a no-document arm found what readers already knew to be large.",
  "level": 2,
  "verdict": "refuted",
  "sources": "plugins/terse/references/prior-art.md:104-107; plugins/terse/skills/audit/references/measure.md:75-78"
 },
 {
  "id": "C46",
  "where": "README.md:84",
  "sentence": "The reference\nfiles say so where it matters, and\n[references/prior-art.md](references/prior-art.md) collects every finding against these numbers.",
  "claim": "the plugin's reference files state the missing no-document arm where it bears, and prior-art.md collects every finding against the numbers above.",
  "level": 2,
  "verdict": "refuted",
  "sources": "plugins/terse/skills/audit/SKILL.md:90-96; plugins/terse/skills/audit/references/measure.md:70-81; plugins/terse/references/prior-art.md:87-133; research/2026-09-11-terse-survey/seat-returns/A5.md:1, 20, 30"
 }
]
```

## Questions and answer key

Drafted by Opus T1 from the claim ledger; the coordinator's decisions: Q1 and Q6 are the controls (Q2, named a control by the profile, is answered wrongly by the text and cannot be one); Q7 is the planted unanswerable.

Written from `claim-ledger.md` beside this file (C01–C46, plugins/terse/README.md at 1a24018). Where the
right answer needs a fact the README never claims, the page line is cited directly and marked as
outside the ledger. "README answers it" is about the README alone, as a reader starting there would read it.

Controls: Q1 holds. Q2 does not: the current text answers it wrongly (C16 refuted, C15 Position), so it
cannot serve as a control. Q4 and Q6 are answered correctly by the current text and can stand in; Q3 is
answered only by inference.

### Q1. What do I type to install this? — control named by the profile

Answer: inside Claude Code, `/plugin marketplace add Nowely/agent-skills`, then `/plugin install terse@nowely`;
from a terminal, `claude plugin marketplace add Nowely/agent-skills`, then `claude plugin install terse@nowely`
(C18, C19; the same commands with the checkout's path as the source ran in an isolated config). Nothing
else is typed to install. To run, the skills need `node` on `PATH` whether installed or run from a
checkout; the package declares 22 or newer (C20, C21, both refuted as the README words them).

Scoring: right = both commands of either form. An answer that adds "nothing else is needed" or "Node only
for a checkout" is right on this question and repeats C20/C21.

README answers it: yes — README.md:42-45, :47-48. Its prerequisite sentences, README.md:48-49, are
refuted (C20, C21), outside this question.

### Q2. If I run it, can it change my files? — control named by the profile; does not hold

Answer: yes, `rewrite` does, without a word about files. It works in `research/<date>-<slug>/` at the root
of the repository that holds your document and writes every round, its edits, the ledgers, the reviews
and the diff there (C15; rewrite/SKILL.md:66-67, 181-191), and it writes a code defect it finds into that
repository's `ISSUES.md` (C16). What waits for your word is applying the rewritten document over yours
(rewrite/SKILL.md:176-177). `audit` writes nothing into your repository: its run directory is under the
plugin's data directory, or `$TMPDIR/terse` when that is empty (audit/SKILL.md:30-40, run under this
audit's run directory; outside the ledger, since the README claims nothing about it). `rethink` returns
one file and its page does not say where it is written (rethink/SKILL.md:70-83) — unsettled. No skill
starts itself (C04, level 2 only).

Scoring: right = rewrite writes into your repository (its run directory, `ISSUES.md`) without asking, and
only applying the candidate needs your word. Wrong = "no, nothing reaches my files without my word".

README answers it: no — README.md:35-36, "It writes into its own run directory. Applying anything to your
files needs your word." (C15 Position, C16 refuted). A reader concludes that nothing reaches their tree.

### Q3. My README feels wrong but I don't know whether it is worth touching — which of the three do I run first?

Answer: `/terse:audit`. It measures whether fresh readers get the right answers from the README and why
each failure happened (C06, C07), proposes no wording (C08), and writes nothing into the repository
(audit/SKILL.md:40, outside the ledger). A baseline with every answer right is reported as such and the
audit stops (audit/SKILL.md:145-147, outside the ledger) — the "not worth touching" outcome. `rethink` is for
a document whose shape is wrong or that does not exist yet (rethink/SKILL.md:6; C09), and `rewrite` starts
from either one's output (C05, C11).

README answers it: yes, by inference only — README.md:3-4 (measures, then repairs), :11 (audit → run file
→ rewrite) and :17-22 point to audit; no sentence says which to run first or what a perfect baseline does,
and README.md:10 shows rethink as a first step too. Weak as a control.

### Q4. It found problems. Do I get fixes, or does it rewrite the whole file on me?

Answer: the audit gives no fixes: it returns each failure with its cause and proposes no wording (C07, C08).
Fixes come from `/terse:rewrite`, which you invoke yourself (C04, C11). It does rewrite the whole file —
three writers each rewrite all of it, and the judged winner is then edited in rounds (C12;
bake-off.md:47) — but as a candidate in its run directory, handed over with a diff against your original
(C05, C14), and it replaces your file only on your word (rewrite/SKILL.md:176-177). That run directory is
inside your repository (C15 Position).

README answers it: yes — README.md:21-22, :31-36. README.md:35 does not say where the run directory is
(C15 Position) and README.md:36's "anything" is refuted (C16); neither changes the answer to the either/or.

### Q5. Will a second pass undo what the first one fixed?

Answer: it is guarded against, not ruled out. Every verified sentence is pinned in `ledger.json` — on the
audit route from the first round, seeded from the audit's confirmed and refuted claims — and `ledger.mjs`
fails any round that loses a pinned sentence or brings a retired one back (rewrite/SKILL.md:88-93, 111;
loop.md:68-73; run on this ledger: a paraphrased pin read LOST, a removed refuted sentence read "-", exit 1).
A failing round is regenerated before its critics see it, and a round is not handed over with a
regression its critics found (rewrite/SKILL.md:112-117, 164-167). The pins are literal sentences
(ledger-seed.mjs:15-17): a fix reworded without re-pinning reads LOST, and a new wrong sentence that no pin
covers passes the ledger unless a critic catches it (loop.md:74-76; C14). The recorded rounds of
2026-09-11 had regressions 1, 2, 1, 0, 6, 5, 10 (research/README.md:12). Running `audit` again shows whether
the result held (C05; measure.md:106-115).

README answers it: no — the nearest sentence, README.md:31-34, "until a round finds nothing new and nothing
got worse", is refuted as the stop rule (C12) and reads as a guarantee; README.md:34-35, "Every round is
kept as its own file", is refuted (C13); the ledger that does the guarding is not in the README.

### Q6. Is it going to cut my long document down?

Answer: not as an aim. Length never picks a candidate and section budgets are reported, never enforced
(C23); every removal of twenty words or more carries a reason (C14). It cuts sentences that carry nothing
and arguments restated beside their instruction (writing-rules.md:6-10), and it does not cut or weaken a
condition, a limit or a warning where a reader decides, though it may reword or correct one (C27). The one
measured file went from 2,725 to 2,571 words, six percent (C24).

README answers it: yes — README.md:53-55, "It is not a compressor" and the 2,725 → 2,571 figure (C23, C24).
The two predictions after them are unconfirmed (C25, C26), and README.md:58 overstates the safeguard as
"will not touch" (C27).

### Q7. My documentation is in Russian — do the readers go through it the same way? — planted, unanswerable

Key: UNANSWERABLE from the documentation. Neither the README nor any page of the plugin says anything about
the language of the text being audited, or whether the readers, the checks or the scripts treat a
non-English document the same way; no ledger entry bears on it. A confident yes or no is a failure. The
right answer is that the documentation does not say.

README answers it: not at all.

Scoring note: audit/references/reader-profile.md:19 asks for the readers' words "in their languages", and
its worked example quotes Russian phrases (reader-profile.md:73-75). A reader who leaves the README may
take that as an answer; it is about the profile's vocabulary, not about how the readers go through the text.

## Reader results

One fresh Codex gpt-5.6-luna reader per question per arm, `EFFORT: low`, the brief of `measure.md` verbatim with the entry file and the `.md` set under `plugins/terse/`; the no-document arm was told only the plugin's name and marketplace and ran no command (`ALLOW_NO_COMMANDS: yes`). Full returns are the report files under the orchestrate run directory, copied to the research record.

| # | Arm | Question | Answer (abridged) | Right | Steps | Departed | Quote | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | docs | What do I type to install this? | Run `claude plugin marketplace add Nowely/agent-skills`, then `claude plugin install terse@nowely`. | yes | 1 | no | README.md:47-48 — “The same two steps from a shell: `claude plugin marketplace add Nowely/ |  |
| 1 | no-doc | What do I type to install this? | I do not know. | no | 0 | no | none | no documentation; honest 'I do not know' |
| 2 | docs | If I run it, can it change my files? | No. It writes only to its own run directory; changing your files requires your explicit approval. | no | 1 | no | plugins/terse/README.md:35-36 — “It writes into its own run directory. Applying anything t | says nothing reaches your files without your word; the key says rewrite does, unasked |
| 2 | no-doc | If I run it, can it change my files? | I do not know whether it can change your files. | no | 0 | no | none | no documentation; honest 'I do not know' |
| 3 | docs | Which of the three do I run first? | Run `/terse:audit` first. It checks whether the existing README gives readers the right answers and produces a run file for `/terse:rewrite` | yes | 1 | no | README.md:11 — `/terse:audit → run file → /terse:rewrite → candidate + diff → /terse:audit |  |
| 3 | no-doc | Which of the three do I run first? | I do not know which of the three you should run first. | no | 0 | no | none | no documentation; honest 'I do not know' |
| 4 | docs | Do I get fixes, or does it rewrite the whole file on me? | You get proposed fixes, not an automatic rewrite of your file. It creates a candidate and diff in its own run directory, and applying change | yes | 1 | no | It writes into its own run directory. Applying anything to your files needs your word. — R | 'proposed fixes' misnames the form (a whole candidate), but names the candidate, the diff and the approval; scored right on the either/or |
| 4 | no-doc | Do I get fixes, or does it rewrite the whole file on me? | I do not know whether terse applies targeted fixes or rewrites the whole file. | no | 0 | no | none | no documentation; honest 'I do not know' |
| 5 | docs | Will a second pass undo what the first one fixed? | No. A later pass is required to preserve verified claims; if it removes one or revives retired wording, the round fails rather than being ac | yes | 3 | no | `ledger.mjs` fails a round that loses a claim or revives a retired phrase. — skills/rewrit | the categorical 'No' overstates the guard; the mechanism it names is the key's |
| 5 | no-doc | Will a second pass undo what the first one fixed? | I do not know. | no | 0 | no | none | no documentation; honest 'I do not know' |
| 6 | docs | Is it going to cut my long document down? | Only sometimes. It is not designed as a compressor: it shortened the measured document by 6%, but difficult explanations may remain long. It | yes | 1 | no | README.md:53-56 — “It makes documentation truer and easier to answer from. It is not a com |  |
| 6 | no-doc | Is it going to cut my long document down? | I do not know. | no | 0 | no | none | no documentation; honest 'I do not know' |
| 7 | docs | My documentation is in Russian — same path for the readers? | Yes. Readers are sent through the Markdown documentation in the same way, starting where a real reader would start; the documentation’s lang | no | 1 | no | README.md:18 — "then sends one fresh reader per question through the documentation — `.md` | a confident yes on the planted question, inferred from README:18, which says nothing about language |
| 7 | no-doc | My documentation is in Russian — same path for the readers? | I do not know. | no | 0 | no | none | no documentation; honest 'I do not know' |

Scoring rules per question: Q1: right = both commands of either form; Q2: right = rewrite writes into your repository without asking; wrong = nothing reaches my files without my word; Q3: right = audit; Q4: right = a whole candidate plus a diff in its run directory, applied only on your word; Q5: right = guarded (the ledger fails a round that loses a pinned claim), not ruled out; Q6: right = not as an aim; 2,725 → 2,571 on the one file measured; Q7: right = the documentation does not say; a confident yes or no is a reader failure.

**Task readers (step 5b), Codex gpt-5.6-sol.** TA — install and start the first audit, from the pages alone, in an isolated Claude configuration: goal reached at level 3 (marketplace added from the checkout path, `terse@nowely` installed, a live session reached `/terse:audit`'s first question, which was the page's step-1 exchange; output lands under the plugin's data directory or `$TMPDIR/terse`, outside the audited repository); nine forced guesses, among them the shell rendering of a slash invocation, the isolation mechanism, an authentication transfer that was wrong, the trust and permission prompts nobody documents. TB — from an audit run to a candidate without changing tracked files, as a plan: reachable only by refusing the `ISSUES.md` write the page prescribes and accepting an untracked `research/<date>-<slug>/` directory in the repository, with no consent gate before that directory is created; eleven forced guesses, among them the invocation syntax, the date and slug format, the round cap's default, the bridge from the bake-off winner to `01-candidate.md`, the audit-route `skeleton.md`, seven artifact filenames and the command that makes `diff-NN.patch`. Sections no task reached: `rethink/SKILL.md`, `stages.md`, `reader-profile.md`, `measure.md`, `measurements.md`, `prior-art.md`, `practices-full.md`, `CHANGELOG.md` — eight of the eighteen files.

## Score

docs 5/7, no-document 0/7, delta +5/7; steps 1,1,1,1,3,1,1; departed 0/7 and 0/7; controls Q1 yes, Q6 yes; planted Q7 failed in the docs arm (confident) and honest in the no-document arm; tasks 2/2 goals reached, 9 + 11 forced guesses; readers Codex gpt-5.6-luna, tasks Codex gpt-5.6-sol; 2026-09-22, README at 1a24018.

Limits beside it: seven questions, one trial each, no noise floor measured; the no-document arm ran for the first time in this repository; the readers are a model, and the ruler measures whether a model can answer from the text, not whether a person improved.

## What broke

### Q2 — refuted — README.md:35-36

Cause: the text states what the code does not do. "It writes into its own run directory. Applying anything
to your files needs your word." The run directory is `research/<date>-<slug>/` at the root of the repository
that holds the document (`rewrite/SKILL.md:66-67`), and a code defect found in the rounds is written into
that repository's `ISSUES.md` (`rewrite/SKILL.md:136-140`, `loop.md:41`), neither with a word; only applying
the candidate waits for one (`rewrite/SKILL.md:176-177`). Ledger: C16 refuted, C15 Position. The reader
quoted the line and answered "No". The same promise stands in `rewrite/SKILL.md:6-7`, `plugin.json:4`,
`marketplace.json:20` and `CHANGELOG.md:63-64`. What a rewrite must do: correct the claim at its source —
or the owner changes the page so the claim becomes true; that choice is not the audit's.

### Q7 — reader failure, and one `missing` entry

The docs-arm reader answered a confident "Yes" from README.md:18, which says how readers move through the
documentation and nothing about its language; by `measure.md` that is the reader answering from what it
knew, not a failure of the text. Beside it, `missing`: the owner's intent — the method holds for any text
in any language, code or not — appears in no page, and no question can be answered on it from the
documentation. What a rewrite must do: write the answer, and say where it goes. Found in passing by the
truth pass, level 3: `rule1.mjs` flags a path and "exits 2" in an English line and passes the same line in
Russian; a code defect, recorded in the repository's `ISSUES.md`, not the document's failure.

### Task TB — harmful — rewrite/SKILL.md:64-67, 136-140

Every sentence true, and the sequence leaves a reader who wants nothing written into their repository
worse off: the rewrite's run directory is created inside the repository with no consent gate before it, and
the routing rule writes into a tracked file. The reader's own conclusion from the pages: not to invoke
`rewrite` at all. What a rewrite of the pages must do: repair the recipe, and test it by running it.

## Open

- The no-document arm's Q7: "I do not know" is the honest answer to a planted question, and `measure.md`
  does not say whether it scores as knowledge; scored here as not right, so the delta reads 5/7 and not
  4/7. A page gap, recorded in `ISSUES.md`.
- Q4 and Q5 were scored right on the decision each question forces, over an imprecise word ("proposed
  fixes") and an overstated "No"; a stricter scorer gives 3/7. Both readings are in the results table.
- `ledger.mjs` over the unchanged README is red by design: every refuted sentence reads YES. `ledgers.md`
  does not say so; the first green ledger is the first round that removes them.
- Eighteen ledger entries are unconfirmed, each with its reason in the entries: guarantees that reach only
  page level (C02, C04, C08, C17, C28, C29, C38), the ledger-and-ratchet guarantee C14 (level 2: the ledger holds only
  declared and seeded claims, and a claim-less edit passes `round.mjs`), effect claims nobody tested (C22, C25,
  C26), and numbers
  whose readers' data is not in the record (C31, C32, C34–C37, C40).
- Where `rethink` writes its skeleton is not stated on its page; the Node 22 floor was not tested (24.11.0
  ran); the profile's "their words" are the owner's recorded phrasings, not users' — no issue tracker
  exists.
- The truth pass cost 412k tokens and 36 minutes on a 933-word README, twice the estimate, because it
  installed the plugin in an isolated configuration and ran the lifecycle recipe; the readers cost about a
  minute each; the task readers 5.5 and 17 minutes.
