# The terse process: triage, handover, the healing loop, the survey — 2026-09-22

The owner returned to `terse` (0.1.1) with four questions: assess a text before changing anything, since it
may already be fine; how to present the text to them; how to iterate so that later rounds heal rather than
harm; how to collect and analyse best-practice material better. One orchestrated round, six agents in three
waves, nothing written into the plugin. Every file here is an agent's return, kept verbatim; the design is
`v1` and awaits its revision.

## Result

- **Why iterations harmed, settled at level 3** ([d1-regression-autopsy.md](d1-regression-autopsy.md)): of
  the 25 regressions in the nine-round record, executing the declared check would have caught 4, the
  existing ledger 2, a brief rule the writer broke 7, and 12 needed evidence nobody had produced. Rounds
  04–07 declared zero checks; retirements are written by the repairing round and so never block the
  introducing one; a phrase pin was walked through by paraphrase twice; in round 08 the writer ran checks,
  and the run answered a narrower question than the sentence. The index's "every one a lifecycle sentence
  written from reading, not running" is refuted: 15 of 25 fit. The coordinator's scouting diagnosis —
  "the check is never run" — explained 4 of 25 and is withdrawn.
- **What the field survey already says on triage and handover** ([h1-survey-harvest.md](h1-survey-harvest.md)):
  26 quotes on judging a text before touching it, 23 on handing changes to an owner, 49 of 49 grep-validated;
  none validates a cheap triage against full reader testing, none compares handover forms by owner acceptance.
- **The two survey methods** ([m1-two-surveys-compared.md](m1-two-surveys-compared.md)): the 2026-09-17
  method as a 16-step procedure with a file per step; 20 gaps in the 2026-09-11 survey and 15 in `rethink`
  step 1; the decisive difference is a mapper separate from the surveyors, six verdicts against frozen pages.
  Phase 3 — measuring that an adopted practice improved anything — never ran.
- **The design, v1** ([a1-design-v1.md](a1-design-v1.md)): a fourth skill `triage` with five verdicts and no
  `no change` for a never-audited document; a handover that opens with an effect tuple, a proxy reader's
  verdict and changes grouped by where a reader notices them; eight gate rules before the round is frozen, with a
  table claiming 13 of 25 caught, 11 forced to a run, 1 untouched; a survey procedure with separated roles.
- **The critique** ([c1-design-critique.md](c1-design-critique.md)): 34 findings, 132/132 quotes verified.
  The central number does not survive as a result: a blind verifier run on `edits/08.json` caught 6 of 10
  (5 under strict scoring), n = 1, on Astra. Eighteen contradictions with the evidence base or the record,
  among them: G6's regression formula misses a retired false sentence that returns (toy ledger,
  [c1-checks.log](c1-checks.log)); partial acceptance applies edits to the original while the edit files are
  incremental against the previous round (all 27 `old` strings of round 08 occur 0 times in the original);
  the pipeline orders a post-critic verdict before the critics; the trigger-word count is 18/25 with the
  stated mask, not 19/25; S4 relabels the cited evidence categories; the appendix script fails as `.mjs`.

- **The live round** ([audit-2026-09-22/](audit-2026-09-22/), [rewrite-2026-09-22/](rewrite-2026-09-22/),
  waves 7–10): the pages of this branch executed end to end on the plugin's own README — the audit (11
  refuted claims; readers 5 of 7 against 0 of 7 without the document), a bake-off, three rounds each under a
  verifier and a wave; regressions 3 → 0 → 2, four of the five at level 3 and one at level 2, every one a sentence written from a decision
  rather than a run; the task gate reached once, with the harness's route; the cap of four reached and round
  04 handed over with its two regressions named. On the four questions: (1) a text is judged before it is
  touched by the audit's refuted count and the reader delta, whose noise is now measured — two labels of seven
  flip on unchanged text at one trial each; (2) the hand-over is a round file, its diff against the original,
  the regressions charged, and the decisions the owner must take, in a run directory outside the repository;
  (3) rounds heal when every sentence carries an executed check that a verifier reads before the freeze, and
  the regressions that remain are the coordinator's decisions, not the writer's sentences; (4) the survey
  method's phase 3 still never ran.

- **The rethink, and the rewrite from an agreed skeleton** ([rethink-2026-09-23/](rethink-2026-09-23/),
  [rewrite-2026-09-24/](rewrite-2026-09-24/), waves 11–15): the owner rejected the audit route's round 04 for its
  shape and content, so the pages were changed first — the shape agreed before any round, lens 7 for purpose and
  content, a qualifying clause refused without a declared reason, the first clean round handed over — and then run
  again on the same README: a survey of 39 documents, ten structures under three critics, three skeletons each read
  by the owner (01 rejected on five sections, 02 agreed, 03 agreed after the read of round 03), a bake-off and
  three rounds with regressions 1 → 0 → 0. The owner sent round 04 as it is on 2026-09-24, and it is the plugin's
  README (`a613394`). On the four questions: (1) the shape is now judged before a sentence is touched, on the
  owner's word about a named file; (2) the hand-over the owner acted on was a round with its diff and the
  decisions with defaults; (3) as above, with the caveat signal added; (4) the survey method is on `rethink`'s
  pages, its phase 3 still unrun.

What survives as a hypothesis with a reproducible footing: the ledger seeded from the audit (2 of 25,
replayed by script); the executed check in `round.mjs` (catches nothing alone; the substrate a verifier
reads); a verifier of the edits before the freeze (6/10 blind, n = 1); triage that cannot say `no change`
without a prior measurement; the handover's reading order, unmeasured.

## What carried over, and what did not

Into `plugins/terse/`, by the wave that wrote it: the seeded ledger, the executed check and the verifier (wave 6);
the run directory outside the repository (wave 8); the shape agreement before any route, lens 7, the `qualifies`
signal and the first clean round handed over (wave 11); `rethink`'s briefs, its run directory and its hand-over
form, and rule 12 (waves 12–13); the README itself, on the owner's word (wave 15). Not: the designs v1 and v2 as
written — no `triage` skill, no effect tuple in the hand-over, no eight-rule gate — and the survey method's
phase 3, which has never run.

## Files

| File | Agent | What it is |
|---|---|---|
| `d1-regression-autopsy.md` | Opus D1 | 25 regressions: quote, edit, declared check, critic finding, mechanism |
| `h1-survey-harvest.md`, `h1-grep-validation.tsv` | Codex Sol H1 | 49 quotes on triage and handover, each grep-validated |
| `m1-two-surveys-compared.md` | Opus M1 | nine axes, the 16-step procedure, 20 + 15 gaps |
| `a1-design-v1.md`, `a1-q.txt`, `a1-gateload.mjs` | Fable A1 | the design and its appendix (the script runs only as `.cjs`, see the critique's F3.2) |
| `c1-design-critique.md`, `c1-blind-round08.md`, `c1-checks.log`, `c1-checks.cjs`, `c1-grep-validation.log` | Codex Astra C1 | 34 findings by front, the blind run frozen before reading, the executed checks |
| `k1-completeness.md` | Codex Sol K1 | the completeness verdict on the coordinator's answer |
| `rounds.md` | coordinator | the waves, costs, and what each agent got wrong |

## Wave 4 — the vendor sources on writing for a model, mapped

The owner asked for OpenAI's post "Rethinking skills and prompts for GPT-6 Astra" and Anthropic's
prompt-engineering section to be brought in, and added the local `writing-for-agents` skill as a third slice.
This is the first live run of the 16-step method M1 extracted: three surveyors (fetch, one bounded claim per
row, every quote grep-validated against the saved page), one mapper who never surveyed, one completeness
critic from the other family. The split critic was skipped for two named URLs and one local file; the
version-drift check it would have made went into the surveyors' briefs instead.

- **Sources** ([s1-openai-skills-and-prompting.md](s1-openai-skills-and-prompting.md),
  [s2-anthropic-prompting.md](s2-anthropic-prompting.md), [s3-writing-for-agents.md](s3-writing-for-agents.md)):
  59 + 46 + 68 = 173 rows, 173 of 173 grep-validated by their surveyors. The OpenAI post's article body links
  one page (agents.md); the six skills-and-prompting pages came from the site's navigation, and four of them
  now redirect to learn.chatgpt.com. The Anthropic section is unchanged since A10 read it on 2026-09-11:
  the same seven pages, the practices A10 recorded in the same words except the templates, generator and
  improver pages A10 already listed as redirects; the 3,326-line evaluation guide it links — the one vendor
  page on measurement — was fetched, hashed and read by nobody, and agents.md, the post's only inline link,
  was fetched by nobody. S2's table has 13 gaps in its numbering that no line accounts for, and its drift
  table cites two rows (S2-27, S2-56) it does not contain. `writing-for-agents` reports no measurement anywhere: 39 argued, 29 asserted.
  Fetched pages stay out of the repository; each row carries its URL, fetch time and the page's SHA-256.
- **The map** ([p1-mapping.md](p1-mapping.md), Codex Astra P1): 173 rows merged into 85 claims, 255 verdicts
  against three targets pinned at `21a225b`, every cited target line opened with `sed` and quoted. Target A,
  the writing rules for documents: present 8, partial 20, conditional 3, not located 2, unknown 51 (no
  counterpart expected), contradicts 1. Target B, the three SKILL.md as texts a model executes: present 21,
  partial 21, conditional 32 (pinned to one model by the source), not located 4, unknown 6, contradicts 1.
  Target C, entrust's brief shape: present 16, partial 21, conditional 27, not located 9, unknown 12,
  contradicts 0. Each sums to 85 (K2 recounted). So most of what the vendors say is about
  briefing a model and has no place in the rules for human-read documents; where it lands is the skill texts
  and the briefs.
- **Candidates** — twelve in the map, six here — ranked by the source's evidence type and never by vendor,
  each a hypothesis with the audit question it should move: query-last for long inputs (measured, all models; target C); ground every
  completion claim in this session's tool results (measured, Fable 5 only; C); constrain unrelated changes
  (measured, Fable 5.1 only; C); disclose one-time setup on resume (argued; B); strengthen reference
  triggers (argued; B); one for the writing rules — co-locate a concept's definition, rules and caveats
  (argued; A, `writing-rules.md:15` has the first-need half; the safeguard the mapper credits to that line is
  at `:21-23`, K2's finding). K2 also found candidate 10's pointer (`rewrite/SKILL.md:49`) differs from the
  line its verdict was rendered against (`audit/SKILL.md:90`); no verdict value changes.
- **Do not adopt** — seventeen in the map, five here — with counters: remove verification encouragement for self-verifying models
  (`rewrite/SKILL.md:96` and the 25 recorded regressions say otherwise); universal deduplication
  (`writing-rules.md:21` keeps repetition at independent decisions); relax ask-first because Astra is said
  to judge well (the only support is the vendor's description of the mapper's own model; the user's rights
  decision stands); delete discoverable facts (readers may not open the source); stronger exhortations as
  the remedy.
- **Gaps**: no source offers evidence that these practices improve human documentation tasks as distinct
  from model answerability; none carries documentation-specific evidence levels, lifecycle execution, or
  preservation of verified claims across revisions; none repeats conditions at independently entered
  decision points; the no-document baseline, control questions and the score ceiling are absent from the
  173 rows, and the mapper hedges that gap on the evaluation guide nobody decomposed. Two gaps neither the
  sources nor the mapper name (K2): the document's natural language — the owner asks in Russian, and the only
  rule on it in the targets is entrust's measured one — and writing that survives a hard clip, which the
  orchestrate page imposes on returns.
- **A contradiction inside the OpenAI sources**: the post says over-specific guidance now hinders; the API
  prompting guide says GPT models benefit from precise instructions. The mapper reads them as compatible
  (contracts explicit, method free) and reports that the saved pages do not settle their own GPT-versus-
  reasoning taxonomy.
- 45 of 173 quotes matched only after normalisation of the five kinds the mapper lists per quote. K2 checked
  five by eye: no word changed in any, but S2-15 is not typographic — it splices prose across a code-fence
  marker; a full pass over the 45 has not been made.

The owner's question — does this advice apply to text in general — is answered in the negative and located:
the mapper's transfer column grades plausibility, not transfer; its gap 1 names the missing evidence; the
record already says the local ruler measures model answerability. Verdict on the method's first live run
([k2-completeness.md](k2-completeness.md), Opus K2: partial): it produced a map with a verdict per claim per
target, which the 2026-09-11 survey never had; what it did not produce is any measurement that a candidate
improves a document, which is phase 3 and has still never run, and it left one vendor page unread.

## Wave 5 — the evaluation guide read, and the design's second round

Codex Terra S4 decomposed the Anthropic evaluation guide (33 rows) and agents.md (12), 45/45 grep-validated,
zero measured claims; the guide names baselines and earlier-version comparison and specifies no
no-document arm ([s4-evaluation-guide-and-agents-md.md](s4-evaluation-guide-and-agents-md.md)).

Fable A2 wrote [a2-design-v2.md](a2-design-v2.md) (674 lines) against C1's 34 findings, K2's four, P1's
candidates and S4's rows: a disposition table claiming 34 fixed / 0 rejected / 4 open; the central claim
re-derived as 2 replayed, 6 blind-caught, 4 blind-missed, 5 desk, 8 forced-only of 25; a transition
counting rule with [a2-regress.mjs](a2-regress.mjs), which over the record gives 2, 2, 1, 1, 6, 4, 11
against the recorded 1, 2, 1, 0, 6, 5, 10 ([a2-record-replay.txt](a2-record-replay.txt)); hunks as regions
of the original→candidate diff with provenance by replay; seven P1 candidates taken as hypotheses, five left
with entrust, six refusals carried.

Codex Astra C2 ([c2-design-critique.md](c2-design-critique.md), 25 findings, 126/126 quotes verified,
ten `regress.mjs` runs in [c2-regress-runs.log](c2-regress-runs.log)): of the 34 "fixed", 25 hold and 9 do
not (F3.5, F3.7, F3.8, F3.11, F3.12, F3.18, F4.2, K2-c, K2-d). The counting rule passes C1's four toy
cases and fails two new ones — a false sentence rewritten into a different false sentence is invisible to
a transition count, and a new false clause beside a newly added true pin is missed; the supplied record
command makes `--judge 9` select round 08; the replay's 02–08 total is 27 against the recorded 25. The
pre-registered verifier test is not blind: the checkout it names contains the critics' reviews, the strict
scorer's independence is unknown (C2-5.3), and 11/21 can pass while missing every round-08 case. The pipeline reads
`refused.json` before anything writes it, a pre-freeze rejection keeps its ledger mutations, and HO6
demands a verdict in files written before the verdict exists. On the question v2 left to the owner — charge
a regression to the introducing round or to the round whose critics found it — the record already settles
it: `loop.md:53-55` is conjunctive, introduced by the round *and* shown by its critics, so the replay's
numbers are a different metric, not a disagreement the owner must resolve. C2 divides its 25 into 21 defects of correctness, count or requirement and four carried owner gaps.
Verdict: not implementable as written. [k3-completeness.md](k3-completeness.md) (Codex Sol K3: partial, 70 of 75
numbers matched) corrected four statements in the coordinator's closing answer and two in this section.

Two design rounds is the bound this repository's orchestrate page sets before the question goes to the
owner. What the two rounds established: the loop's defects are settled at level 3 — D1 replayed rounds 04–09
byte-identical, C1 and C2 re-ran the counts, the toy ledgers and the hunk geometry on the record; none reran
the lifecycle experiments, and C2 says the individual disputed adjudications of the record stay unknown; what has footing and does not depend on the contested parts is the seeded ledger (2 of 25,
replayed), the executed check in `round.mjs`, and a pre-freeze verifier as a hypothesis whose test must run
on a checkout without the critics' answers; the regression count keeps the record's own conjunctive
definition and is computed from the pins the verification step writes, with no transition formula. What
paper rounds do not produce is a measurement that a round healed, and each critic found a class the
previous designer had not seen; the next unit of work is a small implemented step with its own test, not a
v3.

## Wave 6 — the implementation round

On the owner's word, the first implemented step instead of a third design: the three items with footing.
Opus W1 wrote in the live tree of the branch; Codex Sol R1 reviewed by running, twice; the coordinator
verified the last pass under the redirect rule. Fourteen commits on top of `63826f9`, `plugins/terse` and `ISSUES.md` only,
no version bump, the two frozen files untouched, `CHANGELOG.md` under Unreleased.

- **The ledger is seeded from the audit** (`audit/scripts/ledger-seed.mjs`, new). The claim-ledger contract
  in `ledgers.md` was not parseable — its `Claim:` line restates the sentence rather than quoting it — so
  `audit.md` now carries a fenced `json claims` block under *Claim ledger*, and the seed refuses a block
  elsewhere, a ledger with no `### C..` entry, and an entry missing any of its seven fields. On the record,
  a ledger seeded from its own `want:true` entries and run over rounds 00–03 shows exactly two yes→LOST
  transitions, at 02 and 03: D1's R02-1 and R03-1 (level 3, W1 and R1 each ran it).
- **The check runs** (`round.mjs`). An edit with claims declares `check.run`, `check.expect` and, per
  claim, `asks`; the command runs with the run directory as cwd, a failing `expect` refuses the round with
  nothing written and the ledger byte-identical, and a successful round writes `saw` into the ledger entry
  and a byte-copy snapshot `ledger.NN.json` beside the ledger so a round the verifier sends back is undone
  by `cp`. `--allow-unrun` accepts the record's `how`-only edits, marked `unrun`; under it rounds 04→09
  replay byte-identical (6/6, run by W1, R1 twice, and from a fresh `git archive`). A round declaring one
  claim name twice is refused. Selftest 22 → 45 `ok` lines (K4's count from a `git archive` of each end; W1 reported 24 before);
  the self-test's rule is a planted violation per gate, R1 broke five of the new ones and each failed as it
  should, and K4 notes positive-path assertions among the 45 too.
- **The verifier before the freeze** (brief 0 in `critic-briefs.md`, row 0 of the wave's table in
  `rewrite/SKILL.md`). One agent that is not the writer reads `edits/NN.json` and the ledger entries the
  round wrote, and returns `holds`, `does not answer`, `refuted` or `unreachable` per claim; the last three
  send the round back to regeneration. It is sized by the user like a lens, default one, and the least that
  counts as a round stays lenses 1 and 2. Its cost is unmeasured; the one blind run is M24 in
  `measurements.md`, on Astra, a hypothesis and no evidence about Sol.
- **Recorded, not fixed**: `ISSUES.md` E3 (the provisional mark reads the claim's name and pattern, never
  the sentence) and E4 (the record's ledger holds 26 entries no script wrote, and the page gives no
  procedure for a hand-written entry).
- **The review**: R1's first pass found all six runtime claims true and ten text-and-contract defects
  (the verifier's promised input did not exist; `unreachable` had no route; a "step 4b" that was not on
  the page; `drop` missing from the schema; the seed accepting what the contract forbade; a mandatory
  verifier against the page's announce-and-size rule). The second pass found the ten resolved and four
  new: duplicate claim names collapsing silently, the brief overstating which edits carry a check, a
  "ran best" cell naming an unmeasured model, and "catch rate" for a single run. The third fix pass was
  verified by the coordinator (selftest 45/0, forbidden strings absent, syntax, citations), not by a third
  paid review. R1's two reports are [r1-review.md](r1-review.md) and [r1b-re-review.md](r1b-re-review.md);
  K4's check of the closing answer is [k4-completeness.md](k4-completeness.md) (partial, 50 of 55 matched;
  its four corrections are applied here and in `rounds.md`).

Decisions the round surfaced for the owner: whether a name declared in `claims` and in `retire` within one
round should be refused (W1 widened the rule to that; the record has no such case); E4's procedure for a
hand-written ledger entry, which the seed makes more pressing; and that `ledger-seed.mjs` has never seeded a real
`audit.md`: the one audit run file in the repository, `research/2026-09-10-chain/chain/audit.md`, predates
the `json claims` contract, and the seed refuses it with exit 1 naming the missing heading (the coordinator
ran it); the first audit under the new contract is the seed's test. E3 adds a fourth decision
(`ISSUES.md`): inspect the edited sentence for the provisional mark, or make it writer-declared with the
regex as a warning.

## Wave 7 — the live round: the audit page executed on the plugin's own README

On the owner's word, the first half of a live round: `audit` run by the coordinator as the page on this
branch says, on `plugins/terse/README.md`, with the run file and every reader return under
[audit-2026-09-22/](audit-2026-09-22/) (`audit.md` per the run-file contract; `claim-ledger.md`,
`key-draft.md`, `ledger.json`, `docs.txt`; `readers.md`, the sixteen returns verbatim).

- **Profile** (Opus P0): built from the pages, the scripts and the manifests; the owner confirmed it and
  answered four questions — "their words" stand as constructed, since no issue tracker exists; the reader
  documents any document; `terse` is meant for any text in any language, code or not; the entry file is
  the plugin README, not the marketplace root.
- **Truth pass** (Opus T1): 46 entries — 17 confirmed, 11 refuted, 18 unconfirmed; levels L1 4, L2 35,
  L3 7. Refuted: the loop's stop rule (:31-34), "every round is kept" (:34, run), "applying anything to
  your files needs your word" (:35-36 — `rewrite` writes `research/<date>-<slug>/` and `ISSUES.md` into
  the repository unasked), "nothing else is needed" and "Node 22 … if you run the checkout directly"
  (:48-49, run: the installed copy's self-test exits 127 without node), "will not touch a condition"
  (:58), four numbers under *What was measured* (:64, :76, :77-78, :84) against the 2026-09-10 record, and
  "prior-art.md collects every finding against these numbers" (:84-86) — eleven in all.
  The seed ran on a real ledger for the first time: exit 0, 28 entries (17 `want:true`, 11 `want:false`),
  18 unconfirmed listed on stderr; `ledger.mjs` over the unchanged README is red by design (every refuted
  sentence present), which `ledgers.md` does not say. The pass cost 412k tokens and 36 minutes on a
  933-word README, twice the estimate.
- **Readers** (fourteen Codex gpt-5.6-luna, `EFFORT: low`, the `measure.md` brief verbatim; the
  no-document arm ran for the first time in this repository): docs 5/7, no-document 0/7, delta +5/7;
  steps 1,1,1,1,3,1,1; departures 0 and 0; controls Q1 and Q6 hold; the planted Q7 drew a confident "Yes"
  in the docs arm (a reader failure by the page) and "I do not know" without documents. Each reader took
  18–39 seconds and 0–3 commands. Q2 failed as the truth pass predicted: the reader quoted README:35-36
  and answered "No".
- **Task readers** (two Codex gpt-5.6-sol): TA installed the plugin in an isolated Claude configuration,
  launched a live session and reached `/terse:audit`'s first question — the page's step-1 exchange — at
  level 3, with nine forced guesses (the shell form of a slash invocation, the isolation mechanism, an
  authentication transfer that was wrong, the trust and permission prompts); TB planned the audit-to-
  candidate path and found no consent gate before the run directory is created inside the repository,
  concluding not to invoke `rewrite` at all — eleven forced guesses (invocation syntax, date and slug
  format, the round cap's default, the bridge from the bake-off winner to `01-candidate.md`, seven
  artifact filenames, the command that makes the diff). Eight of the eighteen files were reached by no
  task.
- **What broke**: Q2 `refuted` (README:35-36); Q7 a reader failure beside one `missing` entry (no page says
  the method holds for any language; found in passing at level 3, `rule1.mjs` passes a Russian line it
  flags in English); TB `harmful` (the rewrite page's sequence leaves a reader who wants nothing written
  worse off). Five defects went to `ISSUES.md` as E5–E9; `rewrite` was offered and not run.
- **What the page did not say, met while executing it**: how the planted question scores in the
  no-document arm (E9); that the ledger is red on the original; where `rethink` writes its skeleton. The
  coordinator's own error: a one-based array in zsh shifted the questions by one in the first fourteen
  reader prompts; caught by opening one assembled brief before the fan-out, rewritten under fresh paths,
  and the fourteen unrun directories stay in the data directory.

## Wave 8 — the live round's second half: `rewrite` executed on the same README

On the owner's word, E5 first: Opus W2 moved `rewrite`'s run directory outside the repository (five
commits; both pages now carry one run line, `D="${CLAUDE_PLUGIN_DATA}"; RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/…"`,
and a retention sentence; Codex Sol R2 reviewed it; E5 closed). Then the page as it stands on the branch,
run by the coordinator on `plugins/terse/README.md` from the audit's run file, every artefact under
[rewrite-2026-09-22/](rewrite-2026-09-22/): `brief.md`, the three candidates and the judges' sheets, and
`run/`, the run directory copied whole — rounds `00`–`02`, `edits/`, `ledger.json`, `reviews/02/`,
`probe-02/`, `code-defects.md`, `skeleton.md`, `rounds.md`.

- **Seed and pre-read**: `ledger-seed.mjs` seeded 28 entries from the audit's block; Codex Astra L3's
  adversarial read of the original added four findings, among them the re-audit of a candidate that
  stands outside the repository (D1 later).
- **Bake-off** (three writers under blind labels, two judges, a third on the split): Opus WB path-first,
  1389 words (A); Codex Sol WC frame-first, 960 (B); Opus WA repair-first, 1215 (C); judges Opus J1,
  Codex Astra J2, Fable J3. A vetoed by two judges (A:57-58 false about executed checks); B and C survived
  by majority, B ahead on repairs on two sheets and on level on one; B taken whole as `01-candidate.md`.
  `ledger.mjs` on it: 13 confirmed sentences reworded and lost, to be re-pinned.
- **Round 02** (Opus G1): the four grafts the judges named — announce-and-wait, the chain's departures and
  controls, the run lifetime, *Where it writes* moved below *Install* — and 13 re-pins; 23 edits, 23 claims,
  every check executed. **Sent back twice** by the verifier (Codex Sol V1, brief 0): C44's check counted a
  neighbour of its sentence and six behaviour sentences carried no claim; then R02f1 stated placement advice
  no page gives — cut, its gap routed as D1. Then 23 of 24 holding and the round frozen.
- **The wave** (twelve agents after the verifier): lens 1 Opus 14 findings, 2 FALSE; lens 2 Opus 22; Codex
  Astra C3 adversarial 3 CONFIRMED; Codex Sol task readers 0 of 2, both blocked at the isolated
  configuration's login; Codex Luna question readers 7 of 7; Fable dedup 35 from 49, 5 raised by two or
  more lenses. **Regressions(02) = 3** — sentences the round introduced and its critics showed false at
  level 3: the uninstall scope (G3a), the `--plugin-dir` route's location (G3b), the audit's no-write rule
  against `measure.md:117-121` (R02a, the pages' own contradiction, E12). Gate failed; the cap, missing from
  the first announcement, set at four rounds. Routed: 18 sentence findings to round 03, five code defects as
  proposals, E10–E13 to `ISSUES.md`, five questions to the owner. About 3.3M Claude tokens.

## Wave 9 — round 03: the first round in the plugin's record that harmed nothing

- **Round 03** (Opus G2, `edits/03.json` built from 02's bytes): 21 edits, 24 claims — 11 re-pins, 13 new;
  the coordinator's decisions (a)–(e) applied (the page-register frame, the before-readers named, no scope
  mechanics, the version boundary without editing history, the language sentence left); the three
  regressions of 02 corrected at level 3 (`probe-03/`: four lifetime cases, four run-directory cases) and
  level 2. **Sent back once** by the verifier (Codex Sol V2, a fresh thread): G3c, "the operating system may
  purge the runs", a lifecycle claim at level 2 and so a guess by the page's own rule, reworded to what the
  two pages warn; then 24 of 24 holding.
- **The wave** (nine agents after the verifier; lenses 3 and 4 sized to zero): lens 1 Opus 6 findings, 0
  FALSE; lens 2 Opus 12; Codex Luna readers 5 of 7 with two GUESSED on sentences byte-identical to round
  02's (Q5, Q7) — the instrument's noise at one trial per question, and Q7's guess is the key's own answer
  (E14); Fable dedup 29 from 33, 6 by two or more lenses. **Regressions(03) = 0**. The gate: no regression;
  the task gate not run; one clean round of the two the page asks for before a hand-over. Routed: 15 sentence
  findings to round 04, D7 and D8, E6 widened, six questions to the owner; recorded through `664f1c4`.

## Wave 10 — round 04, the last under the cap, and what the record says

- **Round 04** (Opus G3, four builds): 17 edits, 17 claims — 11 re-pins, 6 new, one drop; the 15 sentence
  findings of the round-03 wave applied, the coordinator's decisions (f)–(l), the install-from-a-clone line
  at level 3 (decision (k)), D7–D8, `cuts.md`. **Sent back twice** by the verifier (Codex Sol V3, three
  reads on one thread): first 9 of 16 claims, every one DOES NOT ANSWER — an `asks` phrased as a behaviour
  is not answered by a run that quotes a page, and the register frame makes every sentence of *What each one
  does* a claim about a page — then the frame sentence itself, then 17 of 17. The same model, in round 03's
  fresh thread, held 23 of 24 claims written in the same section register: whether the difference is the
  thread's or the two writers' `asks` wording is a hypothesis this run did not separate.
- **The wave** (eleven agents after the verifier): lens 1 Opus 10 findings — 1 FALSE (the clone line: the
  commit is on no remote, a fetch by hash refused), 4 OVERSTATED, 5 UNDERSTATED; lens 2 Opus 14, five of
  them misses of the shipped checks, each planted and run; task readers on Claude Sonnet — task 1
  **achieved**, the first time in this run: installed from the clone's path by the README's new line and
  reached `/terse:audit`'s first question in seven turns, on the machine's signed-in profile through
  `--plugin-dir` with five harness facts the document does not give, and the load left an empty data
  directory on the real profile; task 2 partly — the write and stop points explicit, the invocation syntax,
  the filenames and "send it" against "apply" guessed; Codex Luna readers 7 of 7 answered, 6 of 7 by the key
  (Q7's confident "Yes", the third label in three rounds on unchanged text); Fable dedup 32 from 42, 6 by
  two or more lenses.
- **Regressions(04) = 2**, both the coordinator's decisions: the ratchet sentence, reworded on the dedup's
  wording to promise a rejection the check does not make — a round that drops or re-pins an entry in its own
  edits passes, and this round's own G4 drop is the counter-example; and the install line, added under
  decision (k) over the writer's stated risk, naming a clone no reader can obtain. The dedup charged the
  first by the definition and gave the second as the count from the reader's seat.
- **The gate**: the cap of four reached; 03 = 0, 04 = 2; the task gate 1 achieved with the harness's route
  and 1 partly; readers 6 of 7. Handed over: round 04 and `diff-04.patch` with the two regressions named and
  their fixes, round 03 as the fallback.
- **The owner's read, the loop's stop**: round 04 rejected as a README, for content and shape and not for
  phrasing — the opening too long and tied to "README", no statement of what the plugin is for, the pipeline
  described twice, *Install* verbose, no table of the skills, water in paragraphs, technical detail, a licence
  line. No skeleton had been agreed: the audit route went straight into rounds, the failure `stages.md`
  records from 2026-09-11, repeated on the plugin's own README. The owner's purpose statement and their
  earlier words on READMEs, collected from the sessions since 2026-09-10, are in
  [owner-readme-words.md](owner-readme-words.md). Costs by round from `rounds.md`: about 1.0M, 1.2M and 1.6M
  Claude tokens.
- **Found in passing**: D9 — a pinned claim's citation rots silently (a commit moved the lines R02e cited,
  `ledger.mjs` never re-runs a check, and 40 of 41 matched when the coordinator re-ran them all); the shipped
  checks' misses (more evidence for D4; D11, D12); page gaps D10, D13.
- **What the live round measured about the loop**: rounds 02 → 03 → 04 = 3 → 0 → 2 regressions, four of the five at
  level 3, one at level 2, and every one a sentence written from a decision rather than a run — three lifecycle sentences in
  02, a wording taken from the dedup and a scope line taken by the coordinator in 04; the verifier before the
  freeze sent rounds back 2, 1 and 2 times, each time on a real defect of the edits' evidence; the question
  readers moved 7/7 → 5/7 → 7/7 at one trial each, two labels flipping on unchanged text; the task gate went
  0 of 2 → not run → 1 achieved and 1 partly, and the achieved one needed the harness's route. Claude tokens
  for the writer and the wave about 1.6M (G3 695k, lens 1 304k, lens 2 178k, Sonnet 171k, Fable 274k); the
  Sol thread's three reads report 6.6M tokens, most of them cached re-reads; Luna 7 × 12k.

## Wave 11 — the skills round after the owner's read

The owner's direction: the goal is the skills; the README is the test subject; the codex-delegate README
was never final, and its failure was the loop finding problems and the agent fixing them with caveats.
Five changes to the pages, then two critics on them, then a second pass — all on the branch, each change
its own commit, nothing released.

- **The five changes** (Opus W3, commits `0bdf880`–`c230b85`): `audit` asks what the document is for in
  the owner's words and returns `shape: agreed | not agreed`; `rewrite` starts no round on a shape not
  agreed and routes through `rethink`'s structure stage; a lens 7 reads the document against its purpose
  and the content rules; `round.mjs` refuses a fix by qualification unless the edit says why it is not one;
  the first clean round is handed over, and M25 records the live run.
- **Second opinion, Codex Astra A3** (22 findings, 17 CONFIRMED): the qualification check is a surface
  signal — it would have refused round 02's true `--keep-data` exception and neither round-04 regression,
  and `qualifies: "x"` admits anything — so the judgement belongs to the verifier; "read" is not "agreed";
  the shape check must precede every route, the resumed run included; the audit → rethink → skeleton path
  dropped the profile and the failures and skipped the terminology stage; the first-clean hand-over
  collided with a task gate a zero-sized lens can never pass; coordinator decisions in `skeleton.md` had
  stood in for agreement, and a sentence proposed by the dedup or the coordinator was never tested at the
  scope its new words added — which is how both round-04 regressions entered; the skeleton must open with
  the owner's purpose statement, and a read that rejects purpose or content routes to `rethink`, not to a
  round. **Codex Sol R3** (8 findings): the same on "agreed", the round-03 citation, the entry order, the
  regex's blind spots and the CHANGELOG's overclaims; nine `ISSUES.md` citations moved by the commits.
- **Second pass** (W3, commits `73afb01`–`6fc92ca`, then `ISSUES.md:73` by the coordinator): agreement is
  the user's word on a named skeleton, recorded with its path and SHA-256, and the check precedes every
  route; the brief carries the audit's profile and failures on every route; `rethink`'s entry runs the
  terminology stage; the skeleton opens with the purpose statement; a structural decision after agreement
  is the user's question, the coordinator's defaults cover sentences only; a rejected read routes to
  `rethink`; the first clean round is selected and its zero-sized lenses run on it before the hand-over;
  the regex is described as the signal it is, an edit adding a clause without a claim is refused too, and
  the verifier's fifth duty reads every `qualifies` reason as a claim; lens 7 applies the skeleton's own
  rules. Self-test 45 → 50; frozen blocks unchanged; the 2026-09-11 record still replays byte-identical.
- **Still open, from the critics and the writer**: no page says from whose starting state a scope risk is
  tested; caveats outside the regex's forms are seen only through the verifier; lens 7 can be sized to
  zero and proposes cuts only; the skeleton-route judging sheet does not give the judges *What broke*;
  `rethink`'s intro does not yet list the purpose statement; the format of a `skeleton.md` begun from "the
  current shape stands" is unspecified; the fifth duty and lens 7 have never been run. The next test is
  the same README from `rethink`, the skeleton to the owner before any round.

## Wave 12 — the test: `rethink` on the same README, the skeleton to the owner before any round

On the owner's word, the pages as changed in wave 11 run on the plugin's own README from the shape
decision, everything under [rethink-2026-09-23/](rethink-2026-09-23/) (the run directory outside the
repository, copied without the raw fetched READMEs): `purpose.md` (the owner's statement verbatim),
`owner-readme-words.md`, `survey/` (three surveys, the synthesis, the common brief), `terms.md`,
`structures/` (ten, with `readings.json`), `critics/` (three), `skeleton.md`, the fetched exemplar.

- **Step 1, the survey** (Sonnet S1, Sonnet S2, Codex Terra S3; synthesis Codex Astra P2): 17 + 10 + 17
  documents fetched with their URLs, headings, first hundred words, devices and star counts; 0 failures.
  S2 caught WebFetch returning paraphrases with invented headings for four of ten large READMEs and
  re-fetched all ten with curl — "fetch, do not recall" needs raw bytes, not a summariser. The synthesis:
  25 rows, TAKE 3, TAKE WITH CHANGE 10, ALREADY PRESENT 3, DO NOT TAKE 6, CONTRADICTS 3; devices decided
  — a three-row skills table, one install fence and a first invocation, a two-route list, one authentic
  excerpt, no badges or table of contents.
- **Step 2, the words** (Opus T2): 62 terms — keep 17, rename 24 toward plain words (AI reader, draft,
  reviewer, folder, report, workflow, "until you say so"), define 4, drop 17 to the pages.
- **Step 3, ten structures from ten readings of the purpose** (Sonnet ×4, Opus ×2, Codex Luna ×2, Sol,
  Terra; 300 to 778 words against 933 now) and **three critics on all ten at once** — Fable on the owner's
  calibration (07, 01, 10 …), Codex Astra on the reader's task (09, 05, 01), Opus on the genre and the
  evidence (01, 05, 09). The three shared failures, each a failure of the brief: the "can it change my
  files?" section planned on a fact the inputs leave split between the shipped version and the branch,
  which is the owner's decision; no structure with the whole path from an audit report to a reviewed draft
  without writing into the tree; the writers never accounted for the genre sections they dropped — none
  had Troubleshooting (3 of 9 plugin READMEs, the most-used among them) and no survey fetched the owner's
  exemplar sharpdeveye/maestro.
- **Step 4, the skeleton** (Opus S4): the rule "the owner's calibration's first unless the reader's-task
  critic shows a reader cannot reach an answer from it" retired 07 (no home for Q5 and Q7, task 2 needs
  backtracking) and took 01, the best average rank (2, 3, 1); grafts only from the critics' lists; the
  three shared failures repaired — the files boundary stated for the next release with the release
  question put to the owner, the audit-to-draft path in Quick start, Troubleshooting kept at its usage
  weight with Node 22 living there; maestro fetched (1,478 words, 593★) and accounted for section by
  section. Ten sections, 754 words against 909 by the same count: opening 57, Skills 130, Install 20,
  Update 12, Your files 60, Quick start 125, What it will and will not do to your text 90, How it works
  80 (the cut for rule 1), What was measured 100, Troubleshooting 80. Nine decisions are the owner's and
  five are marked least sure, each with what would settle it. Nothing is written against it before the
  owner's word on the file, recorded with its SHA-256.

## Wave 13 — the rewrite from the agreed skeleton, and the first clean round

On the owner's word, two fan-outs: the `rethink` method folded into its pages (Opus W4, Codex Sol R4 —
`briefs.md` new, the run directory that closes E13, the base rule with its weakness, twelve content
rules), and the rewrite of the README from skeleton 02 on the skeleton route, everything under
[rewrite-2026-09-24/run/](rewrite-2026-09-24/run/): the agreement line first in `rounds.md`, the brief
with the coordinator's note, the seeded ledger (17 confirmed, 11 refuted), the bake-off, rounds 02 and 03
with their edits, probes, verifier reads, waves, dedups and routings, `code-defects.md` D14–D20.

- **The bake-off** (Opus repair-first, Codex Sol frame-first, Sonnet path-first; judges Fable and Codex
  Astra): both judges chose the same candidate with no veto — the other two each fell on one sentence, a
  shape decision the page leaves to the user's word and a guarantee at level 2. Two shared faults were
  the coordinator's brief: the excerpt taken from a Score line in the dropped vocabulary, and "beside your
  document" for a draft that lives in a folder outside the repository. The ledger over the winner: 16 of
  17 pins lost by wording, as a new shape must; 0 retired phrasings revived.
- **Round 02** (Opus G4, 661 words): the judges' grafts, the `missing` finding as the excerpt, the restart
  clause after the update (level 3), the draft's folder said as the page says it. The verifier sent it
  back once on levels of evidence (three claims made level 3 by a run-line probe over the three pages,
  one by the record of both routes), then 20 of 20. The wave — lenses 1, 2 and 7, two task readers, seven
  question readers, the dedup: 45 findings from 57; **one regression**, the writer's own repair of a graft
  ("for the first time", false on the audit → rethink → rewrite → audit route); task 1 achieved with the
  harness's route, task 2 partly; readers 6 of 7 from one section each, Q7 guessed as the key requires.
- **Round 03** (G4, 687 words): the regression's clause cut; eleven sentence findings applied; the
  coordinator's decisions — the sign-in clause cut over the judges' graft (rule 4, the owner's words),
  "a README first" cut, one announcement sentence for the skills. The verifier refuted three sentences of
  the first build — "each skill … waits" against the page's own unannounced adversarial read (a page
  defect, D18), "three writers, two judges" against the user's refusal of the fan-out, "brings back one
  found false" against a paraphrase — all repaired before the freeze, then 18 of 18. The wave: 42 findings
  from 66; **no regression**; lens 1 0 FALSE; task 1 achieved, task 2 partly; readers 6 of 7 plus Q7
  guessed. The first round with no regression, handed to the owner with its diff by the page as changed
  on 2026-09-23.
- **What the run measured about the loop**: rounds 02 → 03 = 1 → 0; the verifier sent rounds back 1 and 1
  times, on levels of evidence and on three real overstatements, each caught before a wave; lens 7 found
  8 and 12; the seven readers answered from one section each on both rounds; the task gate stayed at 1
  achieved (with the harness's route) and 1 partly on both. Seven page and script defects found in passing
  (D14–D20): the shape verdict never written back into the run file, a re-audit with no way to reuse the
  first audit's questions, three blind spots of the checks, the adversarial read unannounced, the
  bake-off winner's sentences unpinned, the qualification signal English-only. The coordinator's own
  errors: two stale sentences in the lens briefs carried by `sed` from the previous run; a `git mv` staged
  while a writer was committing; the announcement sentence placed where a concept reached three sections.
- **Costs**: Claude about 5.6M tokens across the wave (writers 1.4M, verifier reads on Codex, lenses 1.9M,
  task readers 0.3M, dedups 0.6M, judges and setup 0.4M, the pages' writer 0.85M); Luna 14 × 12.5k.

## Wave 14 — the owner's read of round 03, skeleton 03, and round 04

The owner read the first clean round and did not send it: three objections, all about sections — Quick
start as one block, a report excerpt that read as an error, *What was measured* as a section a user has
no use for. By the pages as changed on 2026-09-23 the read went to `rethink`'s structure stage: the
words recorded verbatim (`rethink-2026-09-23/skeleton-read-02.md`), skeleton 03 written by the same
synthesis (Quick start in three headed blocks by the genre's count, the workflow block with the scope
explicit and no excerpt, *What was measured* replaced by *Checks and guarantees*, the route with one home;
645 words) and agreed the same day; then round 04 in the rewrite run against it.

- **Round 04** (Opus G4, 788 words): the restructuring — 19 edits, 25 claims, five drops by name for the
  removed section and the excerpt. The verifier sent it back twice: one real overstatement ("file and
  line" for every wrong answer, where a `missing` failure has no line), two page gaps the README had
  repeated (how `rewrite` receives the skeleton, D21; a folder form of the scope the audit page does not
  give), a guarantee word at level 2 relabelled as the pages' promise, and the chains named as the
  README's recommendation since no page orders the closing audit; then 25 of 25.
- **The wave**: 54 findings from 66; **no regression** — lens 1's three overstated verdicts on round-04
  sentences each restate a page at the page's level, and their faults are the pages' (`prior-art.md`
  overstating its own body, a cut ledger no step writes, a "byte for byte" note false by an indent:
  D22–D24); lens 7 found no section that buys nothing and a clean opening; task 1 achieved with the
  harness's route, task 2 partly on the pages' gaps; readers 6 of 7 from one section each, Q7 guessed as
  the key requires, now with no language sentence in the text. Handed to the owner with its diff: the
  second clean round of the run, the first under skeleton 03. Rounds 02 → 03 → 04 = 1 → 0 → 0.
- **What this wave measured about the loop**: a rejected read routed to the structure stage cost one
  skeleton and one round (about 2.4M Claude tokens) against the four rounds the audit route had cost
  before any skeleton existed; the verifier's send-backs (2, 1, 2 per round) each caught an overstatement
  or a page gap before a wave; the budget rule never blocked and the rounds grew (661, 687, 788) as the
  owner's content came in, which rule 4 leaves to the owner; the seven readers answered from one section
  on every round of the run.

## Wave 15 — the owner's word on round 04, the README replaced, and the reflection into the pages

The owner read round 04 and sent it as it is: «Да. Текущий вариант пока что лучший … Еще есть куда стремиться». By
the page's rule the loop stopped on that word; the read is recorded verbatim beside the round in
`rewrite-2026-09-24/run/rounds.md`, the decisions listed with defaults stand at the defaults, and `04-shape.md`
replaced `plugins/terse/README.md` byte for byte as commit `a613394`. The owner asked for three things — the
result fixed, the skills improved from what the run showed, the achievements recorded — and gave the word on the
proposal for the second. No release was asked for; the branch is not merged into `main`, from which the
marketplace installs 0.1.1.

- **The reflection** (`reflection-2026-09-24/reflect15.patch`, applied as `c1c30ed`, `2a88e3e` and `d7a1f37`):
  `stages.md` rules 13 and 14 from the owner's read of round 03 — a README carries no results; nothing from a
  run on the page — with lens 7's default at fourteen; the survey, the synthesis and the skeleton count a
  section's sub-blocks and what marks them; `rewrite` says what follows the user's word on a round.
- **Codex Sol R5** (`reflection-2026-09-24/r5-pages-review.md`): seven checks on the three commits, five
  holding — every owner quotation verbatim against `skeleton-read-02.md`, the round-03 phrases as written, the
  sub-block counts as `skeleton.03.md` states them, no page contradicting rules 13 or 14 in 22 hits — and two
  not: two earlier Unreleased bullets still said twelve rules, and the new paragraph said nothing else changes
  on the word while `a613394` also carried the changelog line. Both fixed in `d2fafd4`, the clause cut rather
  than qualified. In passing: the record of the owner's read of skeleton 01 carried a corrected spelling where
  it says verbatim; restored as typed in `f9987f1`, from the transcript. Resumed as the completeness critic of the
  closing message (`k7-closing-completeness.md`): two numbers corrected — the minutes were the wrappers', and the
  driver's reports do carry tokens — and one omission, the six scratch roots of the task readers still on the
  machine.
- **Codex Sol I1** (`reflection-2026-09-24/i1-verdicts.md`, `i1-issues-draft.md`): the 24 defects the two
  rewrite runs routed to the code, each check re-run on HEAD — 23 reproduce, none fixed, D24 unreachable in the
  sandbox (`<(...)` refused) and reproduced by the coordinator with files; D13 survives by half, its post-word
  half answered by `d7a1f37`. Entered in `ISSUES.md` as E15–E38 (`c28684f`), the probe scripts' repository copies
  named beside the checks that call them, since the scripts name the temporary run directory.
- **Open on the owner's side**: the release; the 15 SENTENCE findings and the STRUCTURE item (E15) for a next
  iteration; the naming convention the owner raised (`file-name.v1.md`) against the run's `NN-<pass>.md` and
  `skeleton.<NN>.md`; on the machine, `~/.claude/plugins/data/terse-inline`, the credential copy under
  `$TMPDIR/terse-ta.I7F5yq/`, and the task readers' scratch roots under `$TMPDIR` — `terse-fresh-reader-repo`,
  `terse-fresh-reader-config`, `terse-c4-1-repo`, `terse-c4-1-claude-config`, `terse-fresh-reader-t1r3`,
  `t1-r4-work`.
