# Triage, handover, the healing loop, the survey: a design for `terse`

Fable A1, 2026-09-22. Read-only; nothing in the repository was touched. Inputs read whole: D1
(`regression-autopsy.md`, 613 lines), H1 (`codex-sol-h1-terse-survey-harvest.md`, 86 lines), M1
(`m1-two-surveys-compared.md`, 586 lines); `audit`, `rethink`, `rewrite` SKILL.md and their references
`loop.md`, `measurements.md`, `truth-pass.md`, `ledgers.md`, `measure.md`, `critic-briefs.md`,
`bake-off.md`, `stages.md` (stage 1–2); `round.mjs`, `ledger.mjs`, `sections.mjs`; `research/README.md`,
`research/2026-09-12-skill-review/README.md`, `research/2026-09-11-markup-round-0/README.md` and
`rounds.md`, `reviews/08/sol-naive-reader-would-you-ship.md`.

Conventions. Every rule is one sentence in bold, then *Refuted by* (the outcome that would kill it),
*Evidence* (D1/H1/M1 item with line, a repository file:line, `unmeasured`, or `one incident`), and
*Displaces* (the line in the current skills it replaces, or `grows`). Evidence levels as the repository
uses them: 1 resolves, 2 an independent reader agrees, 3 made to happen. Two measurements are my own,
made on the record today and reproducible with the commands in Appendix A: (i) two trigger-word regexes
hit 19 of D1's 25 regression sentences; (ii) the same regexes, applied to the `new` text of
`edits/04–09.json`, would have refused 3, 2, 6, 7, 9 and 2 edits per round for lacking an executed level-3
check.

A finding in passing on D1: its per-item line for R08-8 says "Mechanism: c" (`regression-autopsy.md:419`)
while its aggregate lists R08-8 under e (`:476`) and c without it (`:474`); 4+2+7+0+12 = 25 only with the
aggregate, so the aggregate is used below.

---

## Part 1 — Triage: the step before `audit`

### What it is

A fourth skill, `/terse:triage`, and the plugin grows by it: one `SKILL.md`, one script `triage.mjs`,
no reference file. It runs zero agents by default and at most one cheap reader per question when a prior
audit exists. It emits no score and never rates the text.

**Inputs.** The documentation files and the entry file (as `audit` step 1); the repository; optionally
the run directory of a prior `audit` (its `audit.md` with the claim ledger, questions, key, score and the
no-document arm).

### The signals, in the order the script reads them

| # | Signal | Reads | Costs | Evidence |
|---|---|---|---|---|
| S1 | resolution | every path, command and link in inline code or a link target: does it exist in the checkout; a path the sentence tells the reader to create, and a block that discloses its own pin, are exempt | 0 agents | H1 a#23 (two-layer split, asserted), a#26 (deterministic first, argued), a#24 (211-finding noise, measured), a#25 (pin exemption, argued) |
| S2 | trigger words | every sentence with a guarantee word (`every, always, never, cannot, guarantees, ensures, nothing, only, by default`; `read-only` excluded) or a lifecycle word (`stays, removed, kept, until, left, lasts, clears, trimmed, deletes, preserved, continues, resumes, reclaimed, pruned, killed, crashed, dead…`) | 0 agents | `truth-pass.md:23`, `loop.md:121`, `round.mjs:36` for the lists; Appendix A: 19 of the record's 25 regression sentences carry one |
| S3 | staleness | for each sentence the prior ledger backed with `file:lines`, whether those lines changed since the sentence's own last commit (`git log -L` on the source range, `git log` on the doc line); with no prior ledger, whether any tracked non-`.md` file changed since the doc's last commit | 0 agents | H1 a#4 (fingerprint, argued), a#5 (co-change mining, argued); `unmeasured` here |
| S4 | prior measurement | whether `audit.md` exists with a key, a score and the no-document arm | 0 agents | `ledgers.md:9-37` |
| S5 | re-score | only when S4 exists: the same questions, key, entry file and model, one fresh reader per question; the no-document arm is reused, not re-run | 5–8 Luna, ~1 min each | `measure.md:106-115`; cost `measurements.md` M21 |

**Rule T1. Triage asks no agent whether the text is clear, and its only agent signal is a keyed answer.**
*Refuted by:* a triage `no change` verdict later contradicted by an audit, where the contradicting
failure is one a clarity question would have flagged. *Evidence:* the measured failure — two readers with
no confusion answered wrong, the confused one answered right (`audit/SKILL.md:98-101`, `measure.md:62-65`);
H1 a#9 (LLM readability ratings uncorrelated with reading effort, measured). *Displaces:* nothing.

### The verdicts

| Verdict | Issued when | Hands to |
|---|---|---|
| `no change` | S1 clean; S3 shows no source change under any claim the prior ledger confirmed; S4 exists; S5 scores at or above the prior score with every control held and no reader departed | nobody; the owner sends |
| `broken` | S1 fired | `audit`, with the hits as ledger entries pre-filled `refuted`, level 3 |
| `stale` | S3 fired | `audit`, truth pass scoped to the sentences whose sources moved |
| `unbacked` | S2 fired and no prior ledger confirms those sentences at level 3 | `audit`, truth pass scoped to the S2 sentences first |
| `unmeasured` | S1–S3 clean and no S4 | the owner, with the audit's cost; triage cannot say `no change` |

Verdicts stack: a document can be `stale` and `unbacked`; the report lists every fired signal with its
line. `no change` is single and requires all its conditions.

**Rule T2. `no change` is issued only when a prior measurement exists and still holds; on a never-audited
document the verdict is `unmeasured`.** *Refuted by:* a document triaged `no change` on which a full
audit run the same day finds a `refuted`, `missing` or `harmful` failure, or a task reader fails.
*Evidence:* M12 — three task readers passed a round carrying four false sentences no task touched
(`measurements.md:63-66`); a question set alone cannot certify a document. H1 gap a#2 (nothing in the
survey says when "no change" is safe). `unmeasured` as a rate. *Displaces:* nothing; adds the honest
verdict the owner asked for.

**Rule T3. A sentence that carries a trigger word and no level-3 evidence is `unbacked`, whatever its
truth.** *Refuted by:* a corpus where S2-flagged sentences are refuted by the truth pass at no higher a
rate than unflagged ones. *Evidence:* Appendix A, 19/25 of the record's regressions carry a trigger word
(a hit rate on known defects, not a precision); both false claims of 2026-09-10 had guarantee shape
(`truth-pass.md:27-36`); D1 R08-5, R08-6 (`only`, `the one thing`). Precision `unmeasured`: on
`08-review.md` about 27 of ~48 sentence-sized units hit (Appendix A, crude splitter), so on a
mechanism-transcribing README the flag touches half the text. That is the price of transcription the owner's
rule already names (`rounds.md:154-157`). *Displaces:* nothing.

### What triage cannot decide

`missing`, `placement`, `findability`, `harmful` (`audit/SKILL.md:121-127`) — all four are reader or
task outcomes. And the sentence with no trigger word: 6 of the 25 (R04-1, R06-4, R07-2, R08-1, R08-5,
R08-10) carry none; R06-4 ("a report path already used") is reached by no signal here and by no gate in
Part 3. Triage says so in its footer, as H1 a#23 prescribes: "prose was not checked".

### How it relates to H1's findings

The two-layer split (a#23) is the shape: `triage.mjs` is the layer that judges existence and shape;
`audit` is the layer that judges truth and answerability. "Cheap deterministic pass first" (a#26) is the
order. Redish & Selzer (a#7) is the licence and the limit: a screening device for an old document, never
a measuring device — so triage emits verdicts and lines, never a number. H1 a#20 (paraphrase testing)
is deliberately not here: it needs a code-derived key, which is the audit's expensive step.

### How triage is measured (H1 gap a#1)

**Rule T4. For the first three documents triaged, a full `audit` runs after triage regardless of the
verdict, and the report carries a 2×2: `no change`/`unmeasured` × audit failure = false accept; flagged
line × no failure at that line = false alarm.** *Refuted by:* the 2×2 after three documents shows a
false-accept count above zero — then `no change` is withdrawn from the verdict set until the condition
that let it through is found. *Evidence:* `unmeasured`; the corpus at hand is this repository's two plugin
READMEs and the `codex` skill page; the pre-registered number is S2's 19/25 on the record. Cost: three
audits, ~10 agents each (`measurements.md` M21). *Displaces:* nothing.

---

## Part 2 — Handover: what the owner sees to decide

The loop's stop is the owner's read (`rewrite/SKILL.md:146-150`, `loop.md:83-88`). The record's only
measurement of a handover is one proxy reader's "not yet", with two content reasons and three cuts
(`reviews/08/sol-naive-reader-would-you-ship.md:1-15`; `markup-round-0/README.md:35-38`). The owner has
read no round since the draft (`measurements.md` M10). So the format below is designed to be measured
by refusals, and the measurement is written into it.

### The file, in reading order

`$RUN/handover-NN.md`, fixed headings, beside `candidate-NN.md` (the whole text) and `diff-NN.patch`.

1. **The effect, one line, a tuple.** `readers right a/n → b/n (no-document arm c/n); controls k/k held;
   tasks t/2 reached the goal, sections no task reached: …; regressions this round: 0 (ledger);
   behavioural claims at level 3: p of q; words W → W'`. No grade, no adjective.
   *Evidence:* H1 b#7 (Kimble four-tuple, measured), b#12 (Schriver: global quality and audience response
   together, argued); `audit/SKILL.md:116-117`; `loop.md:90-96`.
2. **The proxy reader's line.** "Would send: yes | not yet — reason, reason", from lens 7 (below).
3. **What changed for a reader, by where they notice it.** One sentence per hunk group, grouped by
   section: "In *Install*, a reader now learns which model an ordinary request gets; before, failure F3 —
   *quote of the line that misled*." The owner's plain-effect format (memory: effect on them, grouped by
   where they notice, one plain sentence, the incident in a clause). *Evidence:* H1 b#8 (`misled_quote`,
   measured, skillsbench), b#20 (a finding quotes its target, asserted).
4. **What is unchanged and checked.** The confirmed claims by count and level; the controls; the
   passages *What broke* marked must-not-damage, each with the check that says it still stands.
   *Evidence:* H1 b#1 (asserted: an audit that returns only defects trains distrust) — `one source`.
5. **The hunks.** One block each: id, section, `old → new` as the patch shows it, `why` (failure id,
   rule, or reader cut), `evidence` (level, the `run`, an excerpt of `saw`), `needs` (hunk ids whose
   `new` this hunk's `old` occurs in — computed by the script, not declared). *Evidence:* H1 b#6
   (`execution_evidence` field, asserted), b#22 (work list not grade, asserted).
6. **Not tested.** Sections no task reached; claims at level 1 only; whether the noise floor was measured
   (`measure.md:98-104`); the date of the no-document arm. *Evidence:* H1 b#23 (Checks Run / Not
   Tested, asserted); `loop.md:98-99`.

**Rule HO1. The owner sees the effect tuple and the proxy's line before any hunk, and the whole candidate
is a file beside the diff, because "send as is" is a whole-document judgement and a diff cannot be read as
a reader would.** *Refuted by:* three handovers in which the owner's refusals cite hunks they could not
locate in the candidate, or the effect line is contradicted by their own read. *Evidence:* the proxy
reader read the whole round and returned content gaps, not diff objections (`sol-naive-reader:13-15`);
order `unmeasured` (H1 gap b#1, b#3). *Displaces:* `rewrite/SKILL.md:148-149` "Hand over the round and
`diff-NN.patch`"; the return list at `:154-163` becomes the sections above; the cut ledger
(`ledgers.md:92-101`) folds into each hunk's `why` and is no longer a separate file.

### Partial acceptance

**Rule HO2. Every hunk is separately acceptable; `apply.mjs original.md edits/NN.json --accept ids`
writes the result into `$RUN`, refuses when an accepted hunk `needs` a refused one, and never writes into
the tree.** *Refuted by:* an accepted set that applies clean and produces a sentence no round carried
(a dependency the `old`-in-`new` rule did not see). *Evidence:* `round.mjs:25-27` already requires each
`old` to occur once, which is the dependency's mechanical trace; H1 gap b#4 (no entry studies selective
acceptance) — `unmeasured`. *Displaces:* nothing; `grows` by one script.

**Rule HO3. A refused hunk is recorded in `refused.json` with the owner's reason in one of four words —
`content`, `wording`, `unclear`, `other` — plus their text, and the next round may not re-propose it in
the same words.** *Refuted by:* a later round re-proposing a refused hunk verbatim, or the owner's
reasons not fitting the four words in more than a quarter of refusals. *Evidence:* the structure map
already records "what was deliberately refused, so the next round does not re-propose it"
(`loop.md:108-109`) — generalised from map to hunk; H1 gap b#6 (no protocol records refusal reasons in a
form that improves a second handover). *Displaces:* the map's refused list, for hunks.

### Lens 7, the proxy reader

The Sol brief that produced the record's one "not yet" becomes a fixed lens, run once before every
handover on the frozen round: (1) what would stop you sending it, quoted; (2) what you doubted, quoted;
(3) what you would cut, with word counts; (4) what you could not find and where you looked; (5) would
you send it; (6) what reads as written for the author. Model: Codex Sol, one agent, ~5 min (the record:
`rounds.md:17`). *Evidence:* `sol-naive-reader-would-you-ship.md:1-15` — `one incident`; its two content
findings were not lifecycle sentences and no other lens had raised them (`README.md:37`).

### How the handover is measured

**Rule HO4. The measurement of the handover is the owner's decision per hunk with its reason, and the
count of `unclear` refusals per handover is the format's score; the count of `content` refusals is the
loop's.** *Refuted by:* after three handovers `unclear` has not fallen while `content` has — then the
format, not the text, is what the rounds are failing on. *Evidence:* `unmeasured`; H1 gap b#2 (no entry
measures owner acceptance, review time or regret). Cost: the owner's one read, which the loop already
exists to prepare for (`loop.md:83-84`). *Displaces:* nothing.

---

## Part 3 — The healing loop: gates, restated from D1

D1's headline (`regression-autopsy.md:470-481`): of 25, executing the declared check reaches 4 (a), the
ledger 2 (b), a brief rule at desk 7 (c), a word cap 0 (d), new evidence 12 (e). Rounds 04–07 declared
zero checks (`:34-40`); `round.mjs:23-24` reads `level` and never `how` (`:563-567`); retirements are
written by the repairing round (`:569-574`); phrase pins are paraphrased through (`:576-583`).

The gates below run **before the round is frozen** — that is the whole change. Today the only thing
between the writer and the critics is four scripts (`rewrite/SKILL.md:96-103`), and the writer's own
edits are verified by nobody but the writer; step 4.6's "verify every finding yourself" applies to the
critics' findings, not to the edits (`:110-111`).

### G1 — the check runs, in the script

**Rule G1. An edit that carries claims declares `check.run` (a shell command; for level 1–2 a `sed -n
'A,Bp' file`) and `check.expect` (a regex over its output); `round.mjs` runs it, refuses the round when it
fails, and stores the output as `check.saw` — the writer pastes nothing.** *Refuted by:* a citation that
does not exist passing G1 (edit 19 of round 08 cited `driver.mjs:2360` for a stderr notice that is not
there, `regression-autopsy.md:526`; under G1 `expect: stderr` on `sed -n 2360p` fails). *Evidence:* D1
`:563-567` — `how` is read by nothing; R08-1 and R08-10 carry their refutation inside `how`. Catches
alone among the 25: **0**; it is the substrate G2 reads. *Displaces:* `round.mjs:23-24` and the schema
line `rewrite/SKILL.md:92-94` (`{"level","how"}` → `{"level","run","expect"}`, `saw` written back).

### G2 — the verifier of the edits, one agent, before the freeze

**Rule G2. Before the critics launch, one agent that is not the writer reads `edits/NN.json` and the code
and returns a verdict per claim — `holds`, `does not answer`, `refuted`, `unreachable` — and a round with
any `does not answer` or `refuted` is not frozen.** Its four duties:

- (i) every sentence in `new` that states behaviour has a claim; an edit filed as "water" whose sentence
  states behaviour is returned;
- (ii) each claim carries `asks:` — the proposition in the sentence's own scope words (what, for whom,
  under which condition) — and `run` answers `asks`, not a neighbour of it;
- (iii) the cited range is opened with its enclosing block, and any named function's call sites are
  grepped;
- (iv) for each guarantee word, the document and the repository's `.md` files are grepped for the
  sentence that says otherwise, and the result — a quote, or "none in <files>" — is written into the
  verdict.

*Refuted by:* a critic finding on a verified round that is refutable from the edit's own check or from a
document in the checkout (D1's classes a and c) — the verifier's claim is that those two classes stop
reaching the critics. *Evidence:* D1 per item, below. Model: Codex Sol (cross-family from the Claude
writer; critics that ran found what critics that read did not, `markup-round-0/README.md:29-33`). Cost
`unmeasured`; nearest measured, lens 1 Opus ~180k tokens, 17 min (`measurements.md` M21). Lens 2 already
carries the contradiction duty post-freeze (`critic-briefs.md:66-69`) and was not run on round 08
(`reviews/08/` holds three files, none lens 2); duty (iv) moves that hunt in front of the freeze and out
of the user's sizing. *Displaces:* nothing in the scripts; adds brief 0 to `critic-briefs.md` and a line
4b to `rewrite/SKILL.md` step 4; `grows` by one agent per round.

### G3 — trigger words demand an executed level 3

**Rule G3. A sentence in `new` text that carries a guarantee or lifecycle word (the S2 lists) is refused
by `round.mjs` unless a claim covers it with `check.level: 3` and a `run` that G1 executed.** The test is
over the sentence, not over the claim's name and pattern — the hole D1 fact 4 found (`:587-591`, R08-8
named "retention numbers"). *Refuted by:* over three rounds, the sentences G3 forced to a run are shown
false or overstated by critics at the same rate as the sentences it did not touch. *Evidence:* Appendix
A — 19/25 regression sentences hit; the gate's load on the record: rounds 04–09 would have had 3, 2, 6,
7, 9, 2 edits refused. `truth-pass.md:23-25` (guarantee words → level 3) and `rewrite/SKILL.md:46-47`
(lifecycle at level 2 is a guess) are the rules this makes mechanical. Catches alone: **0 certain**; a
refusal forces a run, and a run can exercise the wrong case — R08-3 and R08-7 were run at level 3 and
regressed (`regression-autopsy.md:320-325`, `:399-402`). *Displaces:* `round.mjs:36` (the provisional
heuristic on names, which nothing blocked on) and the `provisional` field.

### G4 — the ledger is seeded from the audit

**Rule G4. `ledger.json` starts as the audit's claim ledger — every `confirmed` claim as `want:true` with
its level, every `refuted` as `want:false` — so the ratchet exists at round 01.** *Refuted by:* a regression
in changed text (the compression class, M3) that critics show and the seeded ledger read green.
*Evidence:* D1 mechanism b — R02-1 and R03-1 go LOST at 02 and 03 when `ledger.mjs` is run over the
rounds (`:68-71`, `:87-89`; level 3, D1 ran it); the ledger did not exist until round 04 (`rounds.md:13`).
*Displaces:* `rewrite/SKILL.md:90` "`ledger.json` starts empty and grows from the rounds";
`audit/SKILL.md:149` gains a second output file; `ledgers.md` gains its format.

### G5 — propositions beside phrases

**Rule G5. A retired entry carries `proposition:` (one sentence) beside `pattern:`, and once per round
one cheap reader is given the frozen round and every retired proposition plus one planted proposition
the document never made, and returns for each: asserted (quote) or not; a `yes` on the plant discards the
run, a quote on a retired proposition fails the round.** *Refuted by:* on a self-test that plants three
paraphrases of retired claims, the reader finds fewer than the regex does. *Evidence:* D1 fact 3 —
`NEG 'one place the two differ'` passed green while "The one thing it has that a native subagent does not
is proof" stood (`:576-583`, R08-5); M8 (`measurements.md:44-46`). Cost: one Luna, ~1 min. Catches: R08-5
(also caught by G2 duty iv; counted once). *Displaces:* nothing in `ledger.mjs`; the regex stays as the
cheap first pass. `grows` by one field and one agent.

### G6 — the verdict is the ledger, charged to the round that earned it

**Rule G6. After the critics, every finding the coordinator verified as false or overstated is written as
a `want:false` entry before `rounds.md` gets the round's row; `ledger.mjs` is re-run on the frozen round;
its failure count on that round is the round's regression count, and the next round starts from a red
ledger.** Regressions(N) = rows whose first `YES` is at N + rows `LOST` at N. *Refuted by:* a critic-
confirmed false sentence that no pattern-plus-proposition entry can express — then the count undercounts,
and the ratio "pins written / findings verified" reports it. *Evidence:* D1 fact 2 (`:569-574`): the
retirement is written by the repairing round and "can never prevent the round that earns it" — it cannot
be written earlier, so it is charged later; and D1's open item (`:609-613`): 10 by Opus's tally, 11 NEG
entries with their single YES at 08, more in the union with Astra. Under G6 the count is the entries
written, and which findings become entries is decided by the verification step the skill already
requires (`rewrite/SKILL.md:110-111`). *Displaces:* `rewrite/SKILL.md:115-118` "regressions is the count
of sentences the round introduced that its critics showed false" — same definition, now computed.

### The word cap — not a gate, argued from D1's data

D1's column d is empty by construction (`sections.mjs:25` exits 0; M22). Its per-round table
(`regression-autopsy.md:541-557`): 06 (+135) and 08 (+100) carry 16 of 25, 12 in added text; 02–04
(+11, +30, +15) carry 4, all in changed text. A cap would have discriminated 06 and 08 and been blind to
02–04, and it would have refused round 06 outright — nine repairs of eight confirmed pre-existing defects
(`rounds.md:15`), which needed words. So:

**Rule G7. Words per section stay a report; the unit gated is the added sentence, through G2 duty (i).**
*Refuted by:* a round where every added sentence carried a verified claim and the critics still found
regressions concentrated in added text. *Evidence:* 17 of 25 sat in added text (`:551`); M22
(`measurements.md:116-119`). *Displaces:* nothing; keeps `sections.mjs` as is.

### The decisive table

"Caught" = refused before the freeze by a script (G1, G3, G4) or by the verifier's desk work (G2), using
D1's own mechanism assignment (a: the check refutes it; c: a document refutes it at desk; b: the ledger
goes LOST). "Forced" = G3 or G2(ii) refuses the edit until a level-3 run exists; whether that run finds
the defect is not claimed, because the record shows runs that missed (R08-3, R08-7).

| id | D1 mech. | caught by | forced by | note |
|---|---|---|---|---|
| R02-1 | b | G4 | — | LOST at 02 with a seeded ledger (D1 ran it) |
| R03-1 | b | G4 | — | LOST at 03 |
| R03-2 | e | — | G3 (`clears`) | |
| R04-1 | c | G2 (i,iii) | — | `:146` of the same file; needs the code path read |
| R06-1 | e | — | G3 (`keeps`) | |
| R06-2 | e | — | G3 (`stay`, `remove`) | |
| R06-3 | c | G2 (i,iii) | — | `cleanup.mjs:256` enumerated list |
| R06-4 | e | — | — | no trigger word, no citation; **untouched** |
| R06-5 | e | — | G3 (`lasts`) | |
| R06-6 | e | — | G3 (`continues`) | |
| R07-1 | e | — | G3 (`kept`, `remove`) | |
| R07-2 | c | G2 (iii) | — | call-site grep: "called once, at 1689" |
| R07-3 | c | G2 (i,iii) | — | `grep copyFileSync` → none |
| R07-4 | e | — | G3 (`reclaimed`, `left`) | |
| R07-5 | e | — | G3 (`killed`) | `parity.md:113` would raise the question at desk |
| R08-1 | a | G2 (ii) | — | the `how` names the unchecked field |
| R08-2 | c | G2 (i) | — | filed "water" at level 1; states behaviour |
| R08-3 | e | — | G2 (ii), G3 (`only`) | `asks` = deletion, `run` = listing |
| R08-4 | a | G2 (ii) | — | `--exclude-standard` ≠ `.gitignore` in the `how` |
| R08-5 | c | G2 (iv), G5 | — | the opening premise; paraphrased pin |
| R08-6 | c | G2 (iv) | — | `only` → `environment-and-internals.md:74-78` |
| R08-7 | e | — | G2 (ii), G3 (`left`) | ran untracked, not ignored |
| R08-8 | e (aggregate) | — | G3 (`trimmed`) | level 2 declared on a pruning sentence |
| R08-9 | a | G2 (iii) | — | the block `1444-1456` around the cited `:1447` |
| R08-10 | a | G2 (ii) | — | "twelve suites now" inside the `how` |

| Gate | caught | forced | agents per round |
|---|---|---|---|
| G1 executed check | 0 | — | 0 (script) |
| G2 verifier | **11** (a 4 + c 7) | 2 (R08-3, R08-7, both also in G3) | 1 Sol |
| G3 trigger words | 0 | **11** | 0 (script) |
| G4 seeded ledger | **2** | — | 0 (script; audit output) |
| G5 propositions | 1, already in G2 | — | 1 Luna |
| G6 ledger verdict | 0 (counting) | — | 0 |
| **total, distinct** | **13 of 25** | **11 of 25** | +2 agents |
| untouched | 1 (R06-4) | | |

**The design's claim: 13 of 25 refused before the freeze; 11 more refused until a run exists; 1 reached
by nothing.** 13 + 11 + 1 = 25. The 13 rests on D1's assignment of a and c, which by its own definition
(`:22-28`) is "refutable at desk against a document" — a definition of the verifier's work. The next
critic's attack surface is whether an agent given only the edits file does at desk what critics given the
whole document did after (Part 6, claim 1).

### The claim's own question (D1: round 08)

**Rule G8. `asks:` is written in the sentence's scope words before `run:`, and a `run` whose output does
not bear on every scope word in `asks` is `does not answer`.** R08-3's `asks` is "cleanup does not delete
answers, run records or reports"; its `run` (`--list --json`) has no deletion in it. R08-7's `asks` is
"a copy with unsaved files, of any kind git can leave, is left as it is"; its `run` names one kind.
*Refuted by:* a round where every `run` was judged to answer its `asks` and a critic then showed a
sentence false on a case the `asks` named. *Evidence:* D1 `:320-325`, `:399-402`, `:514-517` ("a run that
answered a narrower question than the sentence asked"). *Displaces:* the free-text `how`.

### Fit with the owner's rules

Per round, in sequence: the verifier (1 Sol) → the wave as the lens table sizes it (2 Opus, 1 Astra,
2 Sol, one Luna per question, 1 Fable) → the proposition reader (1 Luna) and the proxy reader (1 Sol).
The two Sol caps are met by the ordering; the wave is announced with count and model as now
(`rewrite/SKILL.md:104-105`).

---

## Part 4 — The survey method

M1's sixteen steps (`m1-two-surveys-compared.md:404-471`) against `rethink` step 1
(`rethink/SKILL.md:25-42`, `stages.md:66-108`), whose fifteen gaps M1 lists at `:511-527`.

| M1 step | `rethink` step 1 takes on | shared reference | dropped, and why |
|---|---|---|---|
| 1 freeze the subject | yes: the document is pinned at a commit; every line cited at it | | |
| 2 measure the constraint first | as a precondition: an `audit` run file exists or the report says none does | | the measurement is `audit`'s; `rethink` does not repeat it |
| 3 critique the split before the fan-out | yes: one Astra reads the slices, not the subject | the split critic's brief | |
| 4 one bounded claim per row, fetched | yes | the row schema | |
| 5 local incident record | yes, as *What broke* + the ledger's `want:false` rows | | no separate ledger for a document |
| 6 merge in one agent, separate passes | yes: the mapper | the mapper's brief | |
| 7 map with a six-value verdict | yes | the verdict set | |
| 8 hypotheses, never counterfactuals | yes, reduced: each adopted practice names the audit question it should move | | |
| 9 rank by study design; do-not-adopt with counters | yes, for effect claims; genre claims keep "weight by use" | | |
| 10 register hypotheses with metric and comparator | yes: the output of the synthesis | | |
| 11 answer the owner's themes separately | | | the skeleton's questions are the themes; step 4 hands them over |
| 12 record what the round got wrong per wave | yes: a "got wrong" cell in the announcement's table | | |
| 13 list the unsettled before anyone reads | yes: an *Open* heading in the skeleton | | |
| 14 redactions; revision drift | drift re-check only (step 1's pin, re-resolved at handover) | | redactions are a publication concern, not a document's |
| 15 design critique before applying | | | it is `rewrite`'s loop |
| 16 phase 3 | yes, as the re-audit (below) | | |

**Rule S1. Surveyors never map; the mapper never surveys; the split critic reads the cut before any
surveyor launches; the completeness critic reads everything after the map and greps the document and the
survey for what nobody mentioned.** *Refuted by:* three surveys where the split critic changes no brief
and the completeness critic names no gap — then two of the four roles are ballast. *Evidence:* M1 axis 4
(`:160-162`, no per-claim mapping existed when surveyors and curator were the same parties; `:175-179`
"Surveyors should not perform the page mapping"), axis 6 (`:237-248`, the completeness critic set the
next round's agenda; `:252-265`, neither run had both), axis 7 (`:271-277`, round one wrong five times
by dismissing; corrected only after). *Displaces:* `rethink/SKILL.md:40` "One synthesis decides what to
take"; `stages.md:102-105`.

Roles and pool: 4–6 surveyors (Terra; Luna where the slice is fetch-and-quote only), 1 split critic
(Astra, before), 1 mapper (Fable or Opus), 1 completeness critic (Opus, after). Nine at most, in three
waves; announced with count and model.

**Rule S2. A survey row is one bounded claim: id, source and version, verbatim quote (string-matched
against the fetch), stage, conditions, comparator, sample, outcome or cost, limitations, direction
(benefit / harm / null), fetch status; a row without a quote that matches is not a row.** *Refuted by:*
a mapper verdict later overturned because the row's quote was not in the source. *Evidence:* M1 axis 1
(`:39-54`), axis 2 (`:75-89`); `practices-full.md:9-12` has four fields and no quote (`:484`).
*Displaces:* `stages.md:102` "gaps as sections with a purpose and a place" — kept as the genre slice's
return form; the claim row is for practice slices.

**Rule S3. The mapper's verdict per claim is one of `present`, `partial`, `conditional`, `not located`,
`unknown`, `contradicts`, against the document pinned at its commit, with a line for each; for a harm
row `present` means the document already avoids it.** *Refuted by:* two independent mappers on the same
rows disagreeing on more than a quarter of verdicts — the set is then not reproducible. *Evidence:* M1
axis 4 (`:164-186`), 495 citations script-resolved (`:172-174`); `unmeasured` for documents.
*Displaces:* the absence grep with a binary outcome (`:489`).

**Rule S4. Effect claims are ranked by study design (controlled > varied-evidence > reasoned > mentioned)
and genre-convention claims by use; the two lists are not merged.** *Refuted by:* an effect claim adopted
on design strength failing phase 3 at the same rate as one adopted on use. *Evidence:* M1 axis 5
(`:208-213`); `stages.md:69-71` — convergence "is evidence of what readers are used to — not that the
shape made them succeed". *Displaces:* `rethink/SKILL.md:35` "weight by use, not by taste" for effect
claims only.

**Rule S5. Every adopted practice is registered as a hypothesis with the audit question or the regression
count it should move, and a practice whose number did not move across two documents is moved to the
do-not-adopt list with the two runs as its counter.** *Refuted by:* a practice demoted this way that a
later controlled run shows effective — then two documents were too few, and the threshold rises.
*Evidence:* M1 `:440-442`, `:734-736`; phase 3 never ran for the newer run (`:568-582`). *Displaces:*
nothing; `grows`.

### Phase 3, for a document

Phase 3 is the re-audit: same questions, same key, same entry file, same model, the no-document arm
reused (`measure.md:106-115`). It measures the document, not the practice; attribution to one practice
needs an arm per practice, which the record designed and did not run (`measure.md:130-132`). Cost per
document: one Luna per question plus two Sol task readers, ~8–10 agents, a few minutes. So a practice's
hypothesis is settled slowly, across documents, by S5 — not in the round that adopted it. What is not
claimed: that any adopted practice caused the movement.

Where the material lives: `rethink/references/survey.md` (new: roles, briefs, row schema, verdict set,
S1–S5); `stages.md` stage 1 keeps its why and its measured examples; `prior-art.md` and
`practices-full.md` stay as the older survey's product, with a header line saying which rules here they
predate.

---

## Part 5 — The pipeline and the skill set

```
/terse:triage → no change | broken | stale | unbacked | unmeasured
      ↓ (anything but no change, on the owner's word)
/terse:audit  → audit.md + ledger.json (seed)         ← re-run after apply: phase 3
      ↓
/terse:rethink (only when What broke routes to stages 1–3, or the document does not exist)
      ↓
/terse:rewrite → per round: verifier → scripts G1/G3/G4/G6 → wave → pins reader → proxy reader
              → handover-NN.md + candidate-NN.md + diff-NN.patch + refused.json
      ↓ owner's word, per hunk
apply.mjs → the tree
```

| Skill | Stays / merges / goes | What changes |
|---|---|---|
| `audit` | stays | step 6 writes `ledger.json` beside `audit.md` (G4); step 3 takes triage's flagged lines as the truth pass's order |
| `rethink` | stays | step 1 rebuilt on Part 4; new `references/survey.md` |
| `rewrite` | stays | step 4: G1–G3, G5, G6, the verifier; step 5–6: the handover; `apply.mjs`; `critic-briefs.md` gains brief 0 and lens 7 |
| `triage` | new — the plugin grows | `SKILL.md`, `scripts/triage.mjs` |

No merge: `audit` measures, `rewrite` writes, and the record's reason for the split stands
(`audit/SKILL.md:18-19`).

### Implementation, in order

| # | Item | Serves | Files | Cost | Why this position |
|---|---|---|---|---|---|
| 1 | G2 verifier: brief 0, `asks` field, step 4b | Q3 | `critic-briefs.md`, `rewrite/SKILL.md` step 4, `round.mjs` header | ~40 lines of text; +1 agent/round | 11 of 25 for no script work; the largest count at the least cost |
| 2 | G4 seed | Q3 | `audit/SKILL.md` step 6, `ledgers.md`, `rewrite/SKILL.md` 4.1, `audit/scripts/ledger-seed.mjs` (new) | ~30 lines JS + ~15 text | 2 of 25; makes the ratchet exist from round 01 |
| 3 | G1, G3 in `round.mjs`; G6 in `ledger.mjs` (`--judge N` prints regressions(N)); selftest cases | Q3 | `round.mjs`, `ledger.mjs`, `selftest.mjs`, `rewrite/SKILL.md` 4.2/4.4/4.7 | ~70 lines JS | forces 11 of 25 to a run; the count becomes a script's output |
| 4 | handover contract, `apply.mjs`, lens 7 | Q2 | `ledgers.md`, `rewrite/SKILL.md` steps 5–6, `critic-briefs.md`, `rewrite/scripts/apply.mjs` (new) | ~80 lines text + ~50 JS | the owner's read is the stop; every round before this ships into the old format |
| 5 | `triage` skill and script | Q1 | `skills/triage/SKILL.md`, `scripts/triage.mjs`, `README.md` | ~150 lines | pays back only after a first audit exists (T2); asked first, built fifth |
| 6 | `survey.md` and `rethink` step 1 | Q4 | `rethink/references/survey.md` (new), `rethink/SKILL.md` 25–42 | ~120 lines | used once per document; the loop runs every round |
| 7 | G5 propositions | Q3 | `ledger.json` field, a brief in `critic-briefs.md` | ~20 lines; +1 Luna/round | 1 of 25, already in G2's count |

Nothing is written into the tree without the word; each item is one commit theme; the version bump is
its own commit; CHANGELOG under Unreleased.

---

## Part 6 — What this does not settle, and what to attack first

**Not settled.**
- The verifier's cost and model: Sol is chosen for decorrelation from the Claude writer; Opus is the
  measured lens. `unmeasured`.
- G3's precision: ~half the sentences of a mechanism-transcribing README trip it (Appendix A). On a
  README that links rather than transcribes, `unmeasured`.
- Whether `asks` can be written by the writer honestly: R08-10's writer wrote the refutation into `how`
  and shipped. G2 reads it; whether a writer games `asks` narrower than the sentence is exactly what
  G2 duty (ii) exists for, and it is a judgement.
- The regression count still depends on which findings the coordinator verifies into pins (G6 moves the
  judgement, it does not remove it).
- Triage S3 without a prior ledger is coarse (any code change since the doc's last commit fires).
- R06-4's class — a plain false sentence with no trigger word and no citation — is reached only by
  G2 duty (i), which is a judgement that the sentence "states behaviour".
- No rule here has run; every count is a replay over D1's table.

**Attack these first.**
1. **"G2 catches 11 of 25."** It assumes an agent given `edits/NN.json` and the code finds at desk what
   critics given the whole document found after. Test: run the verifier brief blind on `edits/08.json`
   at the record's commit and count which of R08-1, R08-2, R08-4, R08-5, R08-6, R08-9, R08-10 it returns.
   Fewer than five and the claim falls to "forced", not "caught".
2. **"`no change` is safe when a prior audit still holds."** Six to eight questions and two tasks passed
   a round with four false sentences (M12). T2's `no change` rests on the fingerprint (S3) catching every
   code change under a confirmed claim; a claim confirmed against code that did not change is still
   true only if the claim's sources were complete. Test: the 2×2 of T4 on three documents.
3. **"The proxy reader's 'would you send it' predicts the owner's."** One reader, one round, and the
   owner has not read round 09. Test: the owner's read of 09 against the Sol items at
   `sol-naive-reader-would-you-ship.md:1-15`.

---

## Appendix A — the two measurements made today

Both run in `$TMPDIR`, read-only on the repository, 2026-09-22.

**(i) Trigger words over D1's 25 quoted sentences.** `ABS = \b(every|always|never|cannot|guarantees?|
ensures?|nothing|only|by default)\b`, `LIFE = \b(stays?|removed?|removes?|continu\w*|resum\w*|
reclaim\w*|ke(ep|pt)s?|prun\w*|until|left|lasts?|clears?|age out|trimmed|deletes?|preserved|goes
when|ends|killed|dies|crashed|dead)\b`, case-insensitive, `read-only` masked. Hits: ABS 6, LIFE 15, either
**19 of 25**. Misses: R04-1, R06-4, R07-2, R08-1, R08-5, R08-10. One known false alarm class in the hits:
R08-2 (`stays small`).

**(ii) Gate load over `edits/04–09.json`** (same regexes over each edit's `new`; refused = hit and
declared level below 3): 04: 3 of 4; 05: 2 of 3; 06: 6 of 9; 07: 7 of 8; 08: 9 of 27 (16 hit, 7 at
level 3); 09: 2 of 15 (8 hit, 8 at level 3). Density on whole rounds, crude sentence split on
`[.!?]` + capital: `08-review.md` ~27 of ~48 units, `09-reduction.md` ~27 of ~50. The splitter under-counts
sentences in tables and lists; the ratio, not the denominator, is the point.

Reproduce: `q.txt` (ids and D1's quotes) and `gateload.mjs` beside this file; the quotes are
D1's, at the lines D1 names.
