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

What survives as a hypothesis with a reproducible footing: the ledger seeded from the audit (2 of 25,
replayed by script); the executed check in `round.mjs` (catches nothing alone; the substrate a verifier
reads); a verifier of the edits before the freeze (6/10 blind, n = 1); triage that cannot say `no change`
without a prior measurement; the handover's reading order, unmeasured.

## What did not carry over

Nothing was written into `plugins/terse/`. The design is v1 and its critique names the revision.

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
  against three targets pinned at `8c041b7`, every cited target line opened with `sed` and quoted. Target A,
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
