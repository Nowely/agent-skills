# Two surveys of "what the field already knows", compared as methods

Opus M1, 2026-09-22. Repository `~/Git/agent-skills`, read-only. Every claim below carries a
file:line or a command. A step with no file that shows it is written **not evidenced**; it is not inferred
from a result.

Older run — `research/2026-09-11-terse-survey/`, curated into `plugins/terse/references/prior-art.md`
and `practices-full.md`, procedure shipped as `plugins/terse/skills/rethink/SKILL.md` step 1 with
`references/stages.md` stage 1.
Newer run — `research/2026-09-17-orchestration-practices/`.

**Correction to the brief.** The newer directory contains no `critic-completeness.json` and no `.json`
files at all: `find research/2026-09-17-orchestration-practices/ -name "*.json" | wc -l` → `0`; the
directory's thirteen files are README.md, rounds.md, c0-split-critique.md, s1/s2/s3, t1, r-synthesis.md,
d1-design-v1/v2.md, c1-design-critique.md, m1-context-measurement.md, presentation.html. This is not an
oversight in the brief alone — the newer run's own record says no completeness critic was spawned
(rounds.md:8, README.md:72). See axis 6.

---

## Axis 1 — the unit of collection and its fields

**Older: two units, neither of them a claim.**
- Round one collects a **source record**. Fields, from
  `round1-returns/_workflow-result.json` (`/records[0]`): `id`, `url`, `exists`, `activity`, `license`,
  `whatItIs`, `method`, `measures`, `verdict`, `weaknesses`, `artifacts[]`, `transferable[]`,
  `confidence`. Beside it the workflow keeps `notRead[]` (33 entries: `id`, `url`, `kind`, `oneLine`,
  `whyRelevant`) and `coverage[]` (`angle`, `notes`, `dropped`).
- Round two collects a **source item containing practices**. Item fields, `round2-returns/craft-sentence.json:4-10`:
  `id`, `url`, `opened`, `evidence`, `whatItIs`, `measures`, `method`, then `practices[]`. Each practice
  carries exactly four fields — `practice`, `locus`, `evidenceForIt`, `costAndCollision`
  (craft-sentence.json:13-16), restated for the reader at `plugins/terse/references/practices-full.md:9-12`.
- Volume: 70 source items across the round-2 returns, 271 practice bullets
  (`grep -c "^  - \*Locus:\*" practices-full.md` → 271; asserted at practices-full.md:3 and prior-art.md:902).
- Round three collects **prose**: eleven Codex seat reports, no schema
  (`research/2026-09-11-terse-survey/README.md:12`, `round3-seats/README.md:6-19`).
- There is no comparator field, no sample field, no limitation field, no stage code, and no claim id.

**Newer: one bounded claim per row, with a stable id, and the schema is a decision of the split critic.**
- The rule: `c0-split-critique.md:16` — "one bounded claim per row, including no-benefit or harmful
  findings; source/version, contextual quote, mechanism, conditions, comparator, sample, outcome/cost and
  limitations where reported. Separate source type from study design".
- S1 row, 11 columns (`s1-vendor-experience.md:7`): id, source URL, version/date, verbatim quote with
  context, stage, practice, conditions the authors state, what they report observing, claim type,
  direction, fetch.
- S2 row, 14 columns (`s2-comparative-effects.md:9`): + comparator, sample (tasks, models, n), outcome and
  cost, limitations the source states.
- S3 row, 11 columns (`s3-framework-mechanisms.md:13`): + guarantees versus enables, published
  measurement.
- T1's unit is an **incident** with a trace (`t1-retrospective-ledger.md:3-12`): primary stage 1–8,
  severity, confidence, transcript line.
- The merged unit (`r-synthesis.md:52`): `id`, `source (short)`, `stage`, `claim (as the lens bounded it)`,
  `dir.`, `strength`, `dup / xref`.
- Volume: 188 rows (60+48+80) → 185 merged claims (`r-synthesis.md:31`, README.md:11).

---

## Axis 2 — opened vs reached by search vs recalled, and how it was marked

**Older: a boolean plus prose, and the marking is a published discipline.**
- `prior-art.md:14-18`: "Every entry says what was *opened* against what was reached by search only.
  Practices are marked **measured**, **argued**, or **asserted** … A line reference is a place to look, not
  a proven fact."
- Machine-readable marking: `opened: true|false` per source item. Counted across `round2-returns/*.json`:
  **70 items, 59 `true`, 11 `false`.** Restated for the reader at `practices-full.md:11-12` — "An entry
  marked `opened: false` was reached by search only, and its locus is a place to look rather than a place
  someone looked."
- Round one keeps the unopened candidates as data: 33 entries in `_workflow-result.json` `/notRead`.
- Round one also records reaching-by-search inside the evidence field, e.g.
  `round1-returns/find-measurement.json:49` — "WebSearch summaries … I did not open the RAGAS GitHub repo
  or docs directly."
- Unopened material is carried forward as a standing list: `prior-art.md:839-853` ("Still unread or
  unverified": books, abstract-only papers, unobtained standards).

**Newer: fetched is a precondition, not a marking, and the quote is machine-checked.**
- `s1-vendor-experience.md:3`: "Every row below was fetched in this run and every quote was checked to
  appear verbatim in the fetched text by an automated string match".
- `s2-comparative-effects.md:5`: "All 48 counted rows below use sources fetched in this run and quotes
  present in the fetched text."
- `s3-framework-mechanisms.md:5`: raw GitHub links commit-pinned; live docs rows state the fetch date.
- Every row still carries a `fetch`/`fetch status` column; tallying it across the three files
  (`awk -F'|' '/^\| S[0-9]-/ {print $(NF-1)}'`) gives **60 / 48 / 80 = 188 rows, all the single value
  `fetched`** — the column has no second value in this run, so it records a precondition rather than
  discriminating.
- What is *not* opened is scoped explicitly instead: `r-synthesis.md:3` lists the six reference files under
  `codex/references/` whose **headings only** were read, and binds every absence claim to "not located in
  the two pages"; README.md:89 repeats it.
- Recall is excluded by the same fetch rule; two S1 statements that live in theme text with no row are
  flagged as unverified (`r-synthesis.md:33`).
- Independent re-fetch exists as its own pass — see axis 3.

---

## Axis 3 — merge and dedup, and by whom

**Older: curation by the authors, no dedup arithmetic, and a second independent writing as the check.**
- Who: `prior-art.md:820` — "Two writers built this survey independently from the same returns, and a
  third round is still arriving." The second writing is a Codex seat:
  `prior-art.md:896-900` — "one more `gpt-6-astra` that rewrote this entire survey independently from the
  same inputs so the two could be compared. That second writing found an arithmetic error neither the
  first writer nor the returning agent had caught"; the artifact is
  `round3-seats/S1-independent-survey-FULL.md` (697 lines).
- What the merge produced: `prior-art.md:902` — "Round two's structured returns hold **271 practices**;
  about forty are ranked above and all 271 are kept in practices-full.md". So the merge is a **selection**
  (271 → ~40), not a dedup: `practices-full.md:5-7` keeps all 271 "unedited and unranked".
- No stable claim id exists. Practices are addressed by **source** id only
  (`practices-full.md:22` `### gopen-swan-1990`), so no row can be collapsed against another row by id.
- The nearest dedup artefact is produced by the completeness critic, not the merger:
  `round2-returns/critic-completeness.json:80-89` `convergent` (9 statements each naming the independent
  sources that converge) and `:91-99` `singletons` (8 practices no second source proposes). It is a
  convergence census, not a merge.
- Disagreements are kept rather than resolved, by policy: `prior-art.md:818-822`, table at `:824-833`.
- First-draft merge defect, recorded: `prior-art.md:918-920` — "The first draft of this file dropped five
  of round two's sixteen returns outright … because it was written from a truncated digest rather than
  from the returns themselves".

**Newer: one named agent merges, with an explicit collapse rule and an arithmetic that closes.**
- Who: one Fable agent, R (`rounds.md:12`; `r-synthesis.md:1` "R — merge, audit, mapping and ranking of
  the four survey returns (Fable R, 2026-09-17)"). Inputs read in full and sized: `r-synthesis.md:5`.
- The rule came from the split critic: `c0-split-critique.md:13` — "Give each source/claim an owner and
  shared identifier; cross-reference overlapping measurements instead of counting them twice."
- The arithmetic: `r-synthesis.md:31` — "188 lens rows (60 + 48 + 80). Three pairs describe one claim from
  the same system in two lenses and are **collapsed** into one merged claim each … **185 merged claims.**
  Duplicate *sources* across lenses … are cross-referenced in the table, not collapsed" (the nine
  cross-referenced source families are listed on that line).
- A pre-merge audit pass exists and is separate: `r-synthesis.md:15` — 7 sources re-fetched with curl,
  normalisation rules stated; `:19-25` the seven checks; `:27` "22 checks, 0 misses", with the fetched
  copies' path named.
- Handoffs that did not happen are recorded as such: `r-synthesis.md:33` — S1-16 and S1-52 were handed to
  S2 for audit and S2 has no row for either; both stay `VE-n`, un-audited.
- Disagreement is kept as a numbered table: `r-synthesis.md:35-48`, D1–D10, each with "conditions that
  separate them".
- The merge's own errors are recorded beside its product: `rounds.md:12` (four, including a §7 count of
  seven where its own table had nine, and §1.4 totals first typed from an estimate then replaced by a
  script count).

---

## Axis 4 — checking each claim against the thing it was meant to improve

**Older: an absence grep over the plugin's files, binary, run by the completeness critic; plus a separate
adversarial refutation of the plugin's conclusions.**
- Verdict set: **zero hits / not zero hits**, plus a hand-built `contradictsUs` list. Evidence:
  `round2-returns/critic-completeness.json:2` — "Proven absences from the plugin's own files (grep over
  ~/Git/agent-skills/plugins/terse/**/*.md): non-native / translation (0 hits), aviation and
  procedure design (0), center-embedding and Gibson (0), easy-to-read and intellectual disability (0),
  PEMAT and actionability (0), … tree testing (0 — round 2 found it and it did not survive into
  prior-art.md), verbosity bias (0) …".
- Who applied it: the sixteenth round-two agent, `prior-art.md:857` — "A sixteenth round-two agent read
  everything the other fifteen returned and then grepped this plugin's own files for what nobody had
  mentioned. Its absences are proven, not suspected"; restated `prior-art.md:893-894`.
- The nearest thing to a per-claim verdict is `critic-completeness.json:101-110` `contradictsUs`, nine
  statements each naming the plugin line it contradicts (e.g. `:104` against `writing-rules.md:35-37`;
  `:108` against `prior-art.md:88-91`; `:71-72` cites `measure.md:3-5`, `:93-98`, `revise/SKILL.md:15-16`,
  `bake-off.md:7-10`).
- A second, independent check on the *claims of the plugin* rather than its coverage: an adversarial Codex
  seat (`research/2026-09-11-terse-survey/README.md:21` A5) told to refute, not balance; its verdict at
  `prior-art.md:87-126` — "**none of our six conclusions survives as stated**; all six are weakened, none
  refuted", with the McNemar recomputation at `:92-95`.
- **No claim-by-claim mapping of the 271 practices onto the plugin's pages exists.** Not evidenced: no
  file in the older corpus carries a per-practice page verdict. The surveyors and the curator are the same
  parties (`prior-art.md:820`), so the separation the newer run enforces is absent.

**Newer: a six-value verdict set applied to every merged claim by the merge agent, script-verified.**
- The set, and its author: `r-synthesis.md:9` — "**Mapping values** (C0's set): `present` = the pages
  instruct the practice; `partial` = part of it, or a different mechanism aimed at the same failure;
  `conditional` = the pages have it or avoid it only under a condition the claim does not share (width,
  mode, rights level); `not located` = not in the two pages as read; `unknown` = no page counterpart is
  expected (measurement-method claims); `contradicts` = incompatible instructions under the same
  conditions." The same line defines **strength** (CC / CC-v / VE / VE-n / RA / ME), also C0's.
- The brief that reports present/partial/not located/contradicts is reporting four of six; the run's own
  tally is six-valued: README.md:13 — "72 present, 69 partial, 27 not located, 5 conditional, 11 unknown,
  1 contradicts (S1-39 vs O L25); 495 line citations, 148 page quotes", evidence level 1, "a script
  resolved every citation and quote against `dff2f0b`".
- Who applied it, and the separation that made it possible: `c0-split-critique.md:16` — "Surveyors should
  not perform the page mapping"; `:17` — "R should read both complete, frozen pages … Record file,
  revision, lines and scope; allow partial, conditional, not located and unknown. Unread references prevent
  whole-plugin absence claims." Applied at `r-synthesis.md:244` ("both pages read whole at `dff2f0b`; every
  row cites a line read"), rows from `:248`.
- Polarity is handled: `r-synthesis.md:9` — "For a claim whose direction is harm or no-benefit, `present`
  means the pages already avoid the practice the source warns against" (worked at `:254`, S1-04 "present
  (avoided)").
- `contradicts` was given a definition before the fan-out: `c0-split-critique.md:18` — "'Contradicts'
  requires incompatible instructions under the same conditions, not mere differences." The single
  contradiction it admitted was then downgraded on re-reading: README.md:71, rounds.md:12.
- "Nearest place" convention for absence claims: `r-synthesis.md:246`.

---

## Axis 5 — shortlist, "not to adopt", and what a hypothesis was

**Older.**
- Shortlist: `prior-art.md:297-304` "What is worth taking" — "Ranked within each group by what it buys.
  Every line names where it lives and what it costs. The numbers are labels for reference; ranking runs
  within a group, not across the whole list." Nine groups (`:306`, `:332`, `:367`, `:389`, `:439`, `:473`,
  `:566`, `:593`, `:633`), "the curated forty" (`:302`). The ranking key is **value to us**, not study
  design.
- Do-not-adopt: `prior-art.md:770-799` "Rejected on evidence, and independently reconfirmed" — eight prose
  bullets, each naming the reconfirming source but not a counter-claim id and not the candidate it kills
  in a table; plus `:798-799` one thing to keep from the rejected sources.
- Hypothesis: the analogue is `prior-art.md:728-731` "Candidates to test — Text held here because it is not
  yet evidence. Each says what would settle it." Two entries only, each with a `**Settled by:**` clause
  and a cost (`:746-747`, `:760-761`). No metric, no comparator, no local anchor, no id.
- Standing limits that no reading can close: `prior-art.md:877-879` — "no human readers, no repeat arm,
  no held-out questions, no proficiency axis in the reader profile, and no actionability dimension".

**Newer.**
- Shortlist: `r-synthesis.md:697-699` — "Ranking key: study-design strength first (CC > VE > RA > ME),
  then a linked T1 incident, then not already `present`. Change type: prompt-only / mechanism / harness.
  'Phase 3 measures' is the metric; none of these rows claims the change improves management." Twelve rows,
  `:702-713`; the composition of the list is itself reported (`:716`: rows 1–6 controlled comparisons, four
  of them adverse or null findings turned into a when-*not*-to rule; 9 prompt-only, 3 mechanisms, 0
  harness). Republished at README.md:38-53.
- Do-not-adopt: `r-synthesis.md:718` and README.md:55-67 — a table with columns *candidate practice*,
  *strongest counter* (a claim id), *other counters* (ids), *note*. Nine rows. One row is not a practice at
  all but a page sentence to re-measure (README.md:67, "'measured' on a page without a trace behind each
  half (O L68)", counter = "C0's rule").
- Hypothesis is a defined object, and the word was imposed by the split critic:
  `c0-split-critique.md:15` — "Return plausible mechanisms connecting practices to incidents, with
  uncertainty; replace 'would have prevented' rankings with hypotheses for later testing."
  Implemented twice:
  - §3, applicability: `r-synthesis.md:440-442` — "Every row is a **hypothesis**: 'bears on' means a
    plausible mechanism links the claim to the incident, with a confidence (high / medium / low) and the
    measurement phase 3 would need. No row says the practice would have prevented anything." 78 rows over
    the 102 claims not valued `present`.
  - §8, the register: `r-synthesis.md:734-736` — fifteen hypotheses, each with *stage*, *metric*,
    *comparator*, *local anchor*; "Where the evidence calls for it, the comparator is a single agent or no
    delegation. Each names a T1 incident or says 'no local counterpart'." Three more added from the owner's
    reading at README.md:85 (H16–H18).
- The rule that nothing here is an improvement claim is stated three times:
  `r-synthesis.md:7`, README.md:5, README.md:38.

---

## Axis 6 — the completeness critic: what it was given, what it found

**Older: one ran, and it was the pivot of the whole run.**
- Given: the other fifteen round-two returns, plus read access to the plugin's own files.
  `prior-art.md:857` — "A sixteenth round-two agent read everything the other fifteen returned and then
  grepped this plugin's own files for what nobody had mentioned."
- Found: fifteen gaps, `round2-returns/critic-completeness.json:3-79` (fifteen objects, each with `what`,
  `why`, `whereToLook`), plus `convergent` (`:80-89`), `singletons` (`:91-99`), `contradictsUs`
  (`:101-110`), and a verdict paragraph (`:2`). Its own summary of the shape of the hole, quoted into the
  plugin at `prior-art.md:863-867`: the survey "missed **the entire branch of technical writing where a
  misread sentence injures someone** … Its highest-value gap is the provenance of the questions".
- Consequence: round three was commissioned against ten of its gaps — `prior-art.md:869-875`, seat-by-seat
  at `round3-seats/README.md:8-19` (eleven seats, models and exit codes named). Five gaps it named were
  recorded as standing limits instead (`prior-art.md:877-879`).
- It also applied the plugin's own publication gate to the plugin
  (`critic-completeness.json:71-72`) and recomputed the headline's statistics.

**Newer: none ran. The run says so and calls it its own defect.**
- `rounds.md:8` (Planning wave, "Got wrong") — "no completeness critic was spawned in this round either,
  the omission R12 records for every earlier run".
- `rounds.md:22` — "Awaiting the owner: … the completeness critic named at O L120 and never spawned".
- README.md:72 — "**R12, the completeness critic.** O L120 names it; no run in the corpus spawned one
  (T1 §4: 'never assigned anywhere') … this round spawned none either".
- Proven mechanically: `find research/2026-09-17-orchestration-practices/ -name "*.json" | wc -l` → 0; no
  file in the directory is a completeness return.
- What ran instead was a **design** critic on phase 2, not a completeness critic on phase 1:
  `rounds.md:14` — Codex Astra C1, "2 keep / 9 fix / 0 drop; three blocks named; the pins probed (8 of 8
  rewordings failed, 2 of 2 false measurements passed); the two false facts found by a recount over 78
  reports and the transcript"; artifact `c1-design-critique.md`.
- Net: the older run has the completeness check and lacks the split check; the newer has the split check
  and lacks the completeness check. Neither run had both.

---

## Axis 7 — was the split critiqued before the fan-out

**Older: not evidenced.** `grep -rniE "critique of the (split|decomposition)|split critic|before the fan-?out"`
over `research/2026-09-11-terse-survey/` and `prior-art.md` returns no methodological hit (the only
"decomposition" hits are descriptions of surveyed tools, e.g. `round2-returns/protocol-benchmarks.json:104`).
The round-one cut is four search angles and eight per-repository readers
(`research/2026-09-11-terse-survey/README.md:36-39`); it was corrected only *after* it ran, by round two —
`prior-art.md:801-816`, "Round one was wrong five times, always by dismissing", a five-row table of verdicts
issued without opening the file, closing with "'Not relevant' and 'duplicate' are verdicts like any other."

**Newer: yes — wave 3 of six, by a Codex Astra (C0), read-only, before any survey launched.**
- `c0-split-critique.md:3` — "The split critic read the decomposition of phase 1 (three survey lenses, the
  retrospective, the merge, a seven-class taxonomy of coordinator mistakes), **not the subject, before the
  fan-out**; its verdict reshaped the briefs. Status: done. Nine read-only commands, no external source
  fetched." Command record at `:43`.
- `:8` — verdict "accept with corrections; do not launch the briefs unchanged. The source survey is useful,
  but its present outputs cannot establish improved management."
- What it caught, each with its line:
  - `:9` source genres do not guarantee coverage of the decisions; demand a coverage matrix — implemented
    as `r-synthesis.md:553` (stage × evidence-strength matrix).
  - `:10` overlap and doubled deliverables across S1/S3 and S2/S3; every survey was combining evidence
    extraction with a local policy audit.
  - `:11-15` per-lens corrections, model kept in each case (S1 scope narrowed, framework docs moved to S3;
    S2 split effects from evaluator validity; S3 given owners and shared identifiers; T1 told that "three
    sessions after 2026-09-16" is not a reproducible corpus; R told to audit, dedup, map and assess in
    separate passes).
  - `:16` the row schema and the separation of source type from study design, and "Surveyors should not
    perform the page mapping".
  - `:17` the mapping method: read both frozen pages whole, record file/revision/lines/scope, the value
    vocabulary, and "Unread references prevent whole-plugin absence claims".
  - `:18` wording fixes, including the definition of `contradicts`.
  - `:19` the taxonomy: not exhaustive or disjoint — broaden class 1, separate agent errors from coordinator
    decisions, one primary stage plus secondary tags, count each incident once. This is the seven-mistake →
    eight-stage change (`rounds.md:9`).
  - `:20`, `:21` operational definitions of "wasted agent" and "unfaithful synthesis".
  - `:22` the ruler, and the warning that practice counts and mappings are intermediate outputs.
  - `:23` the direct naming of the older run's error — "It repeats the terse-survey ruler mistake if
    catalogue quality is presented as managerial improvement."
  - `:25` the phase boundary: adoption, execution and causal claims move later, with "matched tasks and
    budgets with independent outcome assessment, including a single-agent/no-delegation comparator".
  - `:26-34` reclassification of the 2026-09-12 round's "Got wrong" cells: two coordinator errors, three
    agent errors, two caught (`rounds.md:9`).
- The taxonomy correction is visible in the product: T1 reports by eight stages
  (`t1-retrospective-ledger.md:7-8`), and every shortlist row carries a stage (`r-synthesis.md:703-714`).

---

## Axis 8 — cost, from each run's own record

**Older** (`prior-art.md:881-901`, with the per-seat detail in `round3-seats/README.md:6-19` and
`calibration-review/README.md:7-11`):
- Round 1: 12 agents in one workflow — 4 scouts on Sonnet, 8 readers on Opus — **966,000 agent tokens,
  401 tool calls, 15 minutes**, plus 1 Codex seat killed by a usage limit after 34 commands
  (`prior-art.md:883-886`; the seat is `seat-returns/A0-commentary.md`, `README.md:16`).
- Round 2: **16 Claude agents on Opus and Sonnet, and 10 Codex `gpt-6-astra` seats. 1.79 million agent
  tokens, 780 tool calls, 62 minutes.** Four of ten seats exited 6 after completing their turns, answers
  used (`prior-art.md:888-891`).
- Round 3: **11 Codex seats** — 1 `gpt-6-astra` on ruler validity, 1 `gpt-5.6-sol` on procedure writing,
  8 `gpt-5.6-terra`, plus 1 more `gpt-6-astra` that rewrote the survey independently
  (`prior-art.md:896-900`); per-seat exit codes and command counts at `round3-seats/README.md:8-19`
  (76, 178, 76, 96, 29, 49, 17, 49, 37, 44, 97 commands).
- Whole run as the index states it: `research/README.md` row 2026-09-11-terse-survey — "three rounds, 37
  agents, 108 ranked practices".
- No per-agent token figure, no wall-clock per agent, no per-model spend table.

**Newer** (`rounds.md:3-14`, "Times and token counts are the coordinator's from the agent reports"):
- **7 agents in six waves**, plus the coordinator's own planning, 2026-09-17. Per agent:
  M1 Opus 17 min / 131k; C0 Codex Astra 4 min / 182k; S1 Opus 26 min / 257k; S2 Codex Sol 27 min / 17.8M
  (mostly cached input, exit 6 with a complete answer); S3 Codex Sol 16 min / 7.9M (exit 6);
  T1 Opus 20 min / 292k; R Fable 30 min / 297k.
- Phase 2 adds: D1 Fable 20 min / 272k then a 13-minute revision / 386k; C1 Codex Astra 12 min / 3.6M
  (`rounds.md:13-14`).
- The wave table has a **"Got wrong" column for every wave** (`rounds.md:5` header; the rationale at `:3`
  — "Errors each wave made are recorded beside what it produced, because a round that only records its
  findings cannot be weighed"). Recorded failures include: two agents relaunched for a forbidden
  web-search header, a shell-substitution slip costing one retry, S2/S3 sandbox write refusals, and the
  merge's and designer's own errors.
- The run also priced the *subject's* history rather than only itself: T1's per-model tables
  (README.md:15-21) give agents, documented-use rate, median tokens and share of Codex spend for Luna,
  Sol, Terra, Sonnet, Haiku, Astra, Fable — 103 agents identified (README.md:14).

---

## Axis 9 — what each produced that then changed a shipped page

**Older — the survey became two shipped reference pages; no rule page changed from it with a commit that
shows the transfer.**
- `a5a7e2c` (2026-09-11) "The survey of the field is in the repository, and two of its findings are against
  us" — `plugins/terse/references/prior-art.md` **+262**, CHANGELOG +5. (`git show --stat a5a7e2c`)
- `8ad5121` (2026-09-11) "The survey of the field grows to three rounds, and keeps every practice it found"
  — `practices-full.md` **+1834 (new)**, `prior-art.md` **+1101 / −224**.
- `b9bba48` (2026-09-11) "Round one's returns were never lost, and this file said they were" —
  `prior-art.md` 4 lines changed, round-one returns added; the correction is visible in the shipped text at
  `research/2026-09-11-terse-survey/README.md:41-45`.
- Both pages ship inside the plugin payload (`plugins/terse/references/`) and are linked from a skill:
  `plugins/terse/skills/rethink/SKILL.md:89` — "What the field already says about all of this:
  [prior-art.md](../../references/prior-art.md)". Squashed onto `main` as `b29e921` (2026-09-12).
- One survey finding reached a **rule** page: the over-formatting caution at
  `plugins/terse/skills/rethink/references/stages.md:140-144` ("in Morkes & Nielsen 1997 the 'scannable'
  arm … was the only version that did **worse** than the promotional control"), whose source is the
  survey's own formatting section, `prior-art.md:669` ("**The one real measurement.** Morkes and Nielsen
  1997, study 3: 51 participants across five between-subject …"). Evidence level 2: `git log -S "Morkes &
  Nielsen 1997" -- .../stages.md` returns only the squash `b29e921`, so no commit isolates the transfer.
- Not found: any commit in which a survey finding rewrote `writing-rules.md`'s rules. `56c9105` touches
  `writing-rules.md` (+8) and `curse-of-knowledge.md` (+7) but the hunks are **Provenance/SHA-256 blocks**,
  not rules (`git show 56c9105 -- .../curse-of-knowledge.md`, added §"Provenance" with the digest).

**Newer — eleven sentences on the orchestrate page, one new reference file, in one commit that names the
directory.**
Commit `8983268` (2026-09-18), "The orchestrator as a manager: the 2026-09-17 research round, eleven page
rules …" — `plugins/entrust/skills/orchestrate/SKILL.md` **+33/−…**, new
`plugins/entrust/skills/orchestrate/references/roles.md` **+29**, CHANGELOG +137, research directory added.
Shortlist row → shipped line (current `main`, `git show 8983268 -- .../orchestrate/SKILL.md` for the diff):

| shortlist | shipped line |
|---|---|
| 6 (rights/prerequisites) | `orchestrate/SKILL.md:37` "For each agent, check the required commands against its planned rights and environment. Probe uncertain prerequisites cheaply" |
| 9 (token estimate + cap) | `:41` "State expected tokens by tier and role in the plan; name the comparable runs behind each estimate and mark unmeasured roles `unknown`." |
| 11 (no open fork after "go") | `:43` "Number each alternative, show its cost and mark the recommendation; state in the plan what 'go' selects." |
| 10 (completeness critic) | `:54` "Then the completeness critic reads the answer before it goes out." and `:124` (its full definition) |
| decision 3 (O L68) | `:68` "**Prefer Luna to Haiku in the bulk row**: measured better." — "and smarter, and four times cheaper" deleted; CHANGELOG:131-137 gives the reason |
| 2 (bulk width from units) | `:68-69` "a count derived from the units with the plan saying why that many" |
| 1 (decisive check before a panel) + roles | `:103` "Run a decisive check before commissioning a panel. Keep dependent execution in one agent; keep its verification independent." and the link to `references/roles.md` |
| 7 (one assembled brief) | `:119` "Open one assembled brief whole before the fan-out; check its input paths in the agent's planned tree, its item count and each quoted claim against its source." |
| 8 (verifier scope / findings) | `:120` "a finding is one that changes correctness or a stated requirement, the rest its `open`" and `:143` "A verifier's brief names its target and the whole scope it must cover" |
| 4 (judge returns `unknown`) | `:123` "a verdict missing its decisive check is `unknown` in `result`; name the missing check in `open`. Use the sibling's `EXPECT:` rule" |
| 5 (stall rule) | `:128` "Two rounds repeating the same blocker are a stall: show a new plan and wait for the word." |
| pool correction (README.md:75) | `:67` "The caps count turns in progress" |
| theme (a), roles table | `references/roles.md:3-5`, whose second paragraph cites S1-04 and S2-11 as the reason no role is a phase of one piece of work |

The eleven rules are also pinned in the eval suite: CHANGELOG.md:138-140 — line budget 155 → 156, ten cases
(B7, C9–C11, D9, D10, E7, F7, F8, G7) pinning the new rules by the words that carry them.

---

## The newer method as a numbered, repeatable procedure — as it actually ran

Each step: what it took in, what it put out, and the file that shows it happened.

1. **Fix the subject and freeze it.** In: the owner's question and his four themes. Out: two named pages at
   one pinned revision, and the rule that every line number in the round is at that revision.
   Shown by README.md:3 ("Subject: … at `dff2f0b`; every line number below is at that revision") and
   `r-synthesis.md:3` (both pages sized: 152 and 315 lines).
2. **Measure the constraint before designing for it, and let the measurement delete a goal.** In: 46 root
   transcripts. Out: the context breakdown — pages 2.1 %, agent returns 0.6 %, own output 45.5 % — and
   with it "Reducing the orchestrator's context is not the goal" (README.md:3, :5, :24).
   Shown by `m1-context-measurement.md:3` and its stated method at `:5-14`; wave row `rounds.md:7`.
3. **Critique the decomposition before any fan-out, with an agent of a different family that reads the
   split and not the subject.** In: the draft cut (three lenses, a retrospective, a merge, a seven-class
   mistake taxonomy). Out: "accept with corrections", eight decision stages, the row schema, the mapping
   vocabulary, the separation of surveying from mapping, the ruler, and the phase boundary.
   Shown by `c0-split-critique.md:3, 8-26`; the taxonomy change recorded at `rounds.md:9`.
4. **Fan out disjoint survey lenses; one bounded claim per row; fetched or not at all.** In: the corrected
   briefs. Out: 188 rows with quote, conditions, comparator, sample, outcome/cost, limitations, stage,
   claim type, direction, fetch status (60 + 48 + 80).
   Shown by `s1-vendor-experience.md:3, 7`; `s2-comparative-effects.md:3, 5, 9`;
   `s3-framework-mechanisms.md:3, 5, 7, 13`; wave row `rounds.md:10`.
5. **Build the local record from traces in parallel with the field survey.** In: 5 orchestrate runs, 2
   work-project runs, 3 earlier sessions. Out: 54 incidents with a transcript line each, by stage and
   severity; 27 owner corrections; 103 agents identified; four named unknowns.
   Shown by `t1-retrospective-ledger.md:3-12`; README.md:14; wave row `rounds.md:11`.
6. **Merge in one agent, in separate passes: audit, dedup, then map.** In: S1, S2, S3, T1 and C0's report,
   read in full and sized. Out: 22 quotes re-fetched and string-matched (0 misses); 185 merged claims from
   188 rows with three collapsed pairs and nine cross-referenced source families; ten lens-vs-lens
   disagreements kept with the conditions that separate them; un-audited handoffs named.
   Shown by `r-synthesis.md:5, 15-27, 29-33, 35-48, 50-52`.
7. **Map every merged claim onto the frozen pages with a six-value verdict set, and cite a line for each.**
   In: both pages read whole at `dff2f0b`. Out: 72 present / 69 partial / 27 not located / 5 conditional /
   11 unknown / 1 contradicts; 495 line citations and 148 page quotes, every one script-resolved; absence
   claims bounded to the two pages because six references were read by headings only.
   Shown by `r-synthesis.md:9, 244-246, 250+`; README.md:13; `r-synthesis.md:3`.
8. **Attach the local record to the map as hypotheses, never as counterfactuals.** In: the 102 claims not
   valued `present`, plus the 54 incidents. Out: 78 rows, each a mechanism with a confidence and the
   measurement phase 3 would need; separately, the page rules the record shows firing.
   Shown by `r-synthesis.md:440-442, 444, 531`.
9. **Rank into a shortlist and a do-not-adopt list by study design first.** In: merged claims + map +
   ledger. Out: 12 shortlist rows (stage, implication, change type, linked incidents, phase-3 metric) and
   9 do-not-adopt rows (strongest counter id, other counters, note); the list's own composition reported.
   Shown by `r-synthesis.md:697-699, 703-714, 716, 718`; README.md:38-67.
10. **Register everything unsettled as hypotheses with metrics and comparators, and state the ruler.**
    Out: 15 hypotheses with stage, metric, comparator and local anchor, plus a ruler that names iso-cost
    accounting, cross-family judging, n ≥ 50 or an interval, and paired tests.
    Shown by `r-synthesis.md:734-736, 740+`; README.md:83-85.
11. **Answer the owner's themes separately from the shortlist, and mark each contested or untested.**
    Out: (a) contested, (b) untested, (c) contested, (d) untested, each with the for/against ids and the
    local counterpart. Shown by README.md:26-34; `r-synthesis.md:573-650`.
12. **Record what the round got wrong, wave by wave, beside what each wave produced.**
    Out: a "Got wrong" cell per wave, including the coordinator's own. Shown by `rounds.md:3, 5-14`.
13. **State what the round did not settle, as a list, before anyone reads the result.**
    Out: the untested themes, the un-run comparisons, the spot-check coverage, the unrecorded costs, the
    twelve incidents no claim bears on. Shown by `rounds.md:20-22` and README.md:87-89.
14. **Publish with the redactions named and the revision drift re-checked.** Out: two mechanical
    redactions declared; the page lines re-resolved at the revision `main` had moved to.
    Shown by `rounds.md:18`; README.md:77.
15. **Phase 2 (separate, under the owner's word): turn the shortlist into page sentences, have a
    cross-family critic grill the design, revise once, then apply.** In: shortlist + three decisions. Out:
    eleven page deltas, ten new pins and two rewritten, a changelog entry, a line ledger; critic verdict
    2 keep / 9 fix / 0 drop, which also corrected two numbers in the phase-1 README.
    Shown by README.md:81; `d1-design-v1.md`, `c1-design-critique.md`, `d1-design-v2.md`;
    `rounds.md:13-14`; commit `8983268`.
16. **Phase 3: do not claim improvement; register the protocols and stop.** Out: 15 + 3 hypotheses and,
    the next day, five registered protocols. Shown by README.md:5, :85;
    `plugins/entrust/skills/experiment/references/protocols.md:3-53`. **Not run** — see the last section.

---

## What the older survey lacks against that procedure — one line each

| step | older run's gap | file:line |
|---|---|---|
| 1 | no frozen revision for the subject; page citations are bare line numbers with no commit | `critic-completeness.json:71-72` cites `measure.md:3-5`, `revise/SKILL.md:15-16` with no revision; `prior-art.md:14-18` marks opened-vs-searched but not a revision |
| 2 | no measurement of the constraint before designing; no M1 analogue anywhere in the corpus | not evidenced — `find research/2026-09-11-terse-survey/ -type f` lists only returns, seats, and READMEs |
| 3 | no critique of the split before the fan-out | not evidenced; the cut is stated at `research/2026-09-11-terse-survey/README.md:36-39` and corrected only afterwards at `prior-art.md:801-816` |
| 4 | the unit is a source, not a claim; no comparator, sample, limitation or stage field | `round1-returns/_workflow-result.json` `/records[0]`; `practices-full.md:9-12` (four fields only) |
| 4 | claim direction is not carried, so an adverse finding is not a first-class row | `practices-full.md:9-12` — `evidenceForIt` grades strength, nothing grades direction |
| 4 | no verbatim-quote requirement and no automated quote match | `round2-returns/craft-sentence.json:14` — `locus` is a line range in a scratch file, not a quote |
| 5 | no local incident ledger to test a practice against | not evidenced; nothing in the corpus corresponds to `t1-retrospective-ledger.md` |
| 6 | no stable claim ids, so no dedup arithmetic is possible | `practices-full.md:22` addresses practices by source id (`### gopen-swan-1990`) only |
| 6 | no independent re-fetch pass over another agent's quotes | `prior-art.md:915` — "The Codex seats were single-pass and unreplicated" |
| 6 | merger and surveyor are not separated | `prior-art.md:820` — "Two writers built this survey independently from the same returns" |
| 7 | the page check is an absence grep with a binary outcome, not a per-claim verdict set | `critic-completeness.json:2` (12 topics at "0 hits") |
| 7 | no claim-by-claim mapping of the 271 practices to the plugin's pages | not evidenced; `prior-art.md:302` says forty are ranked, 271 kept "unedited and unranked" (`practices-full.md:5-7`) |
| 8 | applicability is asserted per practice as "cost and collision", not as a hypothesis with a confidence | `practices-full.md:9-12`, `craft-sentence.json:16` |
| 9 | the shortlist ranks by "what it buys", not by study design | `prior-art.md:299-300` |
| 9 | the do-not-adopt list carries no counter-claim id per row and is prose, not a table | `prior-art.md:770-799` |
| 10 | only two hypotheses, with a "settled by" clause but no metric, comparator or local anchor | `prior-art.md:728-731, 746-747, 760-761` |
| 12 | errors are recorded in aggregate, not wave by wave beside each wave's product | `prior-art.md:801-816`, `:915-922`; no `rounds.md` exists in the directory |
| 14 | no redaction or revision-drift statement at publication | not evidenced |
| 15 | no critique of the design before the findings reached the shipped pages | `git show --stat a5a7e2c 8ad5121` — prior-art.md and practices-full.md changed with no critic commit between |
| 16 | the improvement question is named as a standing flaw but no protocol is registered | `prior-art.md:920-922` — "it is a retrospective reading of what other people wrote, not a measurement of anything" |

**What the older run has that the newer lacks:** a completeness critic that ran, proved its absences by
grep, and set the next round's agenda (`critic-completeness.json:2`, `prior-art.md:855-875`); an
adversarial seat aimed at the run's own conclusions (`prior-art.md:87-126`); and a full independent second
writing of the survey from the same inputs (`prior-art.md:896-900`,
`round3-seats/S1-independent-survey-FULL.md`, 697 lines).

## What `rethink` step 1 lacks against that procedure — one line each

The shipped procedure is `plugins/terse/skills/rethink/SKILL.md:25-42` with
`references/stages.md:66-108`.

| step | gap | file:line |
|---|---|---|
| 1 | no frozen subject and no revision: the document under improvement is never pinned | `SKILL.md:25-42` — the subject appears only as "this document" at `:40` |
| 2 | no measurement before the design | absent from `SKILL.md:25-42` and `stages.md:66-108` |
| 3 | no critique of the six slices before the fan-out; the only pre-launch act is announcing the count | `SKILL.md:30-31` "Announce the count and the models before spawning, and wait for the user's word" |
| 4 | no row and no fields: a return is "gaps as **sections with a purpose and a place**" | `SKILL.md:41`; `stages.md:102` |
| 4 | the one axis that matches the newer method: fetch, do not recall, with URL and headings in order | `SKILL.md:34-35`; `stages.md:95-96` — but no fetch-status field on the return |
| 4 | the strength axis is usage, not study design | `SKILL.md:35` "weight by use, not by taste"; `stages.md:98-100` |
| 5 | no local record: nothing links a surveyed practice to a recorded failure of this document | absent from `SKILL.md:25-42` |
| 6 | no dedup rule, no ids, no arithmetic: "One synthesis decides what to take" | `SKILL.md:40` |
| 6 | no spot-check of a surveyor's quote by a second party | absent; `stages.md:95-96` asks the surveyor to self-certify |
| 7 | no mapping to the document with a verdict set; the only test is a word budget | `SKILL.md:40-42` "it names what it displaces, or admits the document grows"; `stages.md:102-105` |
| 9 | no do-not-adopt list with counters: the adopt-nothing slice is a *collection angle*, not a ranked output | `SKILL.md:32`; `stages.md:91` |
| 10 | no hypotheses, no metrics, no comparators, no next phase | absent from `SKILL.md:25-42` |
| 12 | no requirement to record what the round got wrong | absent; `stages.md:133-138` records one past error as narrative, not as a per-wave column |
| 6 | the completeness critic is absent from step 1 | not in `SKILL.md:25-42` nor `stages.md:66-108` |
| 8 | cost is announced, never recorded | `SKILL.md:30`, `:57` announce counts and models; no tokens, time or per-agent record is asked for |

`rethink` step 1 does keep two things the newer method also has, both stated as learned by getting them
wrong: fetch-don't-recall (`stages.md:95-96`) and a displacement bar on adoption (`stages.md:102-105`,
"A survey concluding 'add nine sections' has weighed nothing").

---

## What the newer method still lacks, by its own record

- **No completeness critic.** Its own shortlist row 10 and decision 2 demand one; none ran.
  `rounds.md:8`, `:22`, README.md:72; and `find … -name "*.json" | wc -l` → 0.
- **Spot-check coverage is 7 of 97 sources** (22 quotes); the remaining 90 are trusted on the surveyors'
  own fetch records. README.md:89; `r-synthesis.md:15-27`.
- **Absence claims are bounded to two pages.** Six reference files were read by headings only, and six
  claims sit under those headings. `r-synthesis.md:3`; README.md:89.
- **The context measurement is unre-derived and 14.7 % of growth is unexplained**; the two-pool split is
  M1's own method, adopted after the brief's method failed. `rounds.md:7`; README.md:24, :89.
- **Cross-lens audit did not happen where the surveys handed it off**: S1-16 and S1-52 stay un-audited.
  `r-synthesis.md:33`; `rounds.md:10`.
- **The merge cited page lines without naming the revision beside them**, and the numbers landed on
  different lines in the working tree. `rounds.md:12`.
- **Claude agents' token costs are unrecorded, Terra was never measured, the width comparison never ran.**
  README.md:89 (T1-U1 … T1-U4).
- **No dry-run of the edited page, and nothing in the round measures improvement.** README.md:87.

## Phase 3: what it is, and whether it ran

**What it is.** README.md:5 — "Only phase 3 — matched tasks, independent outcome assessment, a
no-delegation comparator — measures improvement." Its ruler is specified at README.md:83-85: per matched
task, unique coordinator incidents per comparable run by stage with severity; owner corrections;
independently verified outcomes judged cross-family or by a human (S2-37); agents and paid turns under
iso-cost accounting rather than equal rollouts (S2-48); every hypothesis carries a comparator, and where
the evidence calls for it the comparator is a single agent or no delegation (H1, H15); cells need n ≥ 50 or
a stated interval (S2-42) and paired tests (S2-44); Luna or Sonnet reader panels are simulated readers of
unknown external validity (S2-45). The boundary was drawn by the split critic before the surveys ran:
`c0-split-critique.md:25` — "Move later: adopting or editing the skill, executing changes, testing
rights/lifecycle behavior …, choosing optimal models/team width/escalation thresholds, and claiming causal
improvement. Use matched tasks and budgets with independent outcome assessment, including a
single-agent/no-delegation comparator."

**Whether it ran: no.** Proven at level 3:
- A vehicle was built the next day, not a run: commit `8983268` adds
  `plugins/entrust/skills/experiment/SKILL.md`, its script, and five registered protocols E1–E5
  (`plugins/entrust/skills/experiment/references/protocols.md:5-53`) — the commit message says the round's
  "fifteen hypotheses stay opinions without a vehicle".
- The plugin's own export route for a finished experiment is `research/<date>-<slug>/` plus a row in
  `research/README.md` (`experiment/SKILL.md:38`). `ls research/` shows no directory after
  `2026-09-17-orchestration-practices`, and `research/README.md`'s table has no row after it.
- On this machine the experiment record directory holds exactly one entry,
  `~/.claude/plugins/data/entrust-nowely/experiments/2026-09-18-probe/`, whose `protocol.md` reads
  "A probe of the record mechanism on this machine, 2026-09-18" and whose `arms/` is empty; there is no
  `metrics.md`, `conclusion.md` or `verdict.md`.
- The page that the round produced still says the comparison is owed:
  `plugins/entrust/CHANGELOG.md:136-137` — "Two unmatched cohorts, not a comparison; the matched one is
  phase 3's."

So both runs end in the same place by different routes: the older says it "is a retrospective reading of
what other people wrote, not a measurement of anything" (`prior-art.md:920-922`); the newer says the same
thing in advance, three times, and registers the protocols that would settle it — and then stops.
