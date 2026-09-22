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
