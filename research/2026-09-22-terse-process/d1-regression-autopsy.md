# Autopsy of the 25 regressions in `research/2026-09-11-markup-round-0/`

Opus D1, 2026-09-22. Read-only; nothing in the repository was modified.

Counts taken from `rounds.md:9-18` (table) and `rounds.md:154`: 02→1, 03→2, 04→1, 05→0, 06→6 (4 false
+ 2 overstated), 07→5, 08→10. Total 25.

## Method and the assignment rule for mechanisms a–e

Every quoted sentence below was located with `grep -n -F` in the round file named. Two are recoverable
only across a line break (noted); both were confirmed with whitespace-normalised matching, the same
normalisation `ledger.mjs:14` applies.

Provenance is level 3, not assertion: rounds 04–09 were replayed from `edits/NN.json` with
`round.mjs` into a temp dir and each came out **byte-identical** to the file in the record, so "edit X
introduced sentence Y" is a re-executed fact, not a reading. `wc -w` on every round file reproduces the
word column of `rounds.md:9-18` exactly. `selftest.mjs` passes (24/24).

Because (c) and (e) overlap for any lifecycle claim — the brief's rule *prescribes* running, and running
is (e)'s instrument — I fix a mechanical convention and apply it uniformly:

| Letter | Assigned when |
|---|---|
| **a** | the edit's own declared `check` string, read or executed faithfully, contains or points at the refutation |
| **b** | `ledger.mjs` on the shipped `ledger.json` flags it **prospectively** — i.e. a `want:true` claim goes LOST in that round (verified by running it) |
| **c** | the refutation sits in a *document* — the README itself or a repo `.md` — so a brief rule (contradiction / absolute words / accuracy floor) catches it at desk with no new evidence |
| **d** | a cap on words added per round would have caught it |
| **e** | new evidence was required: executing code or observing a machine |

**(d) is empty by construction.** `sections.mjs:25` is `process.exit(0)` unconditionally; its header
line 4 says "A report, not a gate: exit 0 either way", and `measurements.md:116-119` (M22) records the
decision that budgets never block. `dup.mjs` likewise has no `process.exit` at all. No cap exists to fire.

**Why the existing gate was silent almost everywhere.** `round.mjs:23-24` requires a `check` only when
`e.claims` is non-empty; it validates that `check.level ∈ {1,2,3}` and **never reads `check.how` and never
executes anything**. `edits/04.json`, `05.json`, `06.json`, `07.json` contain **zero** `"check"` keys and
**zero** `"claims"` keys (`grep -c '"check"' → 0` on all four). So for rounds 04–07 — 12 of the 25
regressions — the gate required no check, got none, and passed. Only `edits/08.json` (27 checks) and
`09.json` (15) declare any. `rounds.md:13` nevertheless describes round 04 as "4 fixes each at level 2
or 3"; that level was never written into the edits file.

**`ledger.json` was not produced by `round.mjs`.** 16 `want:false` entries carry `"level": 2`, a shape
`round.mjs:37` cannot emit (it writes only `{name, pattern, want:false}`). Zero entries carry
`provisional`, though `round.mjs:36` would mark level-2 lifecycle claims — the provisional rule is a
lesson *from* this run, written into the script afterwards (M7, `measurements.md:39-42`).

---

## The table

Columns: **#** | the sentence and where `grep -n -F` finds it | the edit and its declared check |
what the critic found, and the level the critic worked at | mechanism, and why the shipped gate did not fire

### Round 02 — 1 regression (+11 words; no `edits/02.json`, no `reviews/02/`)

**R02-1 — CHANGED text.**
> "turn rather than taken on its word: an agent that ran nothing comes back failed, not finished."
> — `02-revision.md:9`

- **Edit:** none exists. Round 02 was "2 Opus writers against a fix list" (`rounds.md:11`); no edits file.
- **Declared check:** none. Nothing to execute.
- **Critic:** `rounds.md` carries **no prose for round 02** — the "What each review found" section starts
  at `### 04` (`rounds.md:60`). The regression is therefore *reconstructed mechanically, not quoted from a
  critic*. Evidence that it is the one: `01-candidate.md:7` has "rather than taken on its word — **by
  default**, an agent that ran nothing comes back failed, not finished"; 02 drops the qualifier;
  `03-repair.md:9` restores it. `rounds.md:40` records the claim "the ran-nothing claim is qualified *by
  default*" with `driver.mjs:266`, level 2. Critic level: **neither** (no critic report survives).
- **Mechanism: b.** I ran `ledger.mjs ledger.json 00…09`: the row `ran-nothing qualified by default`
  reads `yes` at 01, **LOST** at 02, `yes` from 03 on. A prospective run of the shipped ledger at round
  02 exits 1 (`ledger.mjs:22`). **Why it did not fire:** `ledger.json` did not exist until round 04 —
  `rounds.md:13` first names the ledger at round 04.
- **Class:** the qualification that made a true claim true was compressed out — M3, `measurements.md:19-23`.

### Round 03 — 2 regressions (+30 words; no `edits/03.json`, no `reviews/03/`)

**R03-1 — CHANGED text.**
> "It reads anything you can read; the only thing it / may write is a scratch space of its own, which is
> enough for most test suites but not for browser tests." — `03-repair.md:81-82`

- **Edit:** none exists ("1 Opus writer, 9 verified fixes", `rounds.md:12`). Repaired by
  `edits/04.json[2]` ("§5 read grant"), whose `old` is this exact text.
- **Declared check:** none, in either direction — `edits/04.json` has no `check` key.
- **Critic:** no `reviews/03/`. `measurements.md:19-23` (M3) quotes it: a repair "turned 'your system temp
  directory is the only thing it may write' (**true**) into 'a scratch space of its own, one per agent' —
  shorter, cleaner, and **false** of `driver.mjs:2001-2015`, which grants exactly the caller's own shared
  `$TMPDIR`." Critic level: **read** (a code citation, no run reported).
- **Mechanism: b.** `ledger.mjs` row `read grant = a temp directory only`
  (pattern `(?:your system|one) temp directory is the only thing it may write`) reads `yes` at 02,
  **LOST** at 03, `yes` at 04. **Why it did not fire:** no ledger existed before round 04.

**R03-2 — CHANGED text.**
> "- **your system temp directory** — that scratch space, one per agent; your machine clears it."
> — `03-repair.md:105`

- **Edit:** none; repaired by `edits/04.json[3]` ("§6 temp directory"), whose `old` is this line.
- **Declared check:** none.
- **Critic:** no `reviews/03/`; `measurements.md:48-50` (M9) describes it — "a writer handed nine verified
  fixes applied all nine and, **rewriting one sentence for fix 5, made two neighbouring sentences
  false**; neither task in that round's gate touched storage layout, so the gate passed it." Critic
  level: **neither** for the round itself (the task gate passed; the defect surfaced later).
- **Mechanism: e.** Two false claims here — "one per agent" (the grant is the caller's *shared* `$TMPDIR`,
  `driver.mjs:2001-2015` per M3) and "your machine clears it" (an OS claim nothing in the repo settles;
  `reviews/08/astra-adversarial.md:75-79` later planted 30-day-old caller scratch and found it
  **remained**). **Why nothing fired:** no ledger pattern covers this line — `NEG 'scratch space of its
  own'` matches only the §5 phrasing, and `read grant = a temp directory only` is a §5 claim. The §6
  bullet was collateral damage of fix 5 and no pin, check or rule reached it.

### Round 04 — 1 regression (+15 words; `edits/04.json`, 4 edits, 0 checks)

**R04-1 — CHANGED text.**
> "You say what an agent may touch before it starts. The rights it got and whether it ran anything are
> read / from the record of the turn, not taken on its word" — `04-ratchet.md:8-9`

- **Edit:** `edits/04.json[0]`, `"name": "§1 trust claim"`.
- **Declared check:** **none** — the edit has no `check` and no `claims` key, so `round.mjs:23-24`
  required nothing.
- **Critic:** `rounds.md:62-65` — "the driver asserts them on the thread-start response, **before any
  turn runs**, and **§9 of the same document already said so**. Found by the Opus critic, **confirmed from
  the code**." Critic level: **read**.
- **Mechanism: c.** The refuting sentence is inside the same file: `04-ratchet.md:146` reads "The rights
  the server says it applied are checked against the ones asked for; a difference stops the run."
  `loop.md:117-122` is the rule — "take every claim the document makes about what cannot happen …and find
  the sentence elsewhere that says it can" — and no script implements it (`loop.md:119`: the duplication
  count "is blind to two statements that cannot both be true"). **Why the gate did not fire:** `dup.mjs`
  scores co-occurrence of an idea, not contradiction; `ledger.mjs` had no entry for either sentence yet
  (`NEG 04 'rights read from the turn'` was written *by the repair*, in round 05).

### Round 05 — 0 regressions (+4 words; 3 edits, 0 checks). Nothing to autopsy.

### Round 06 — 6 regressions (4 false + 2 overstated; **+135 words**, the largest growth; `edits/06.json`, 9 edits, **0 checks**)

Critic level for all six: **ran** — `rounds.md:82-83`, "The critic **ran** the driver, the CLI and
`codex exec`". All six sat in text the round **ADDED**.

**R06-1 (false) — ADDED.**
> "> on an empty diff. Commit first. A continued agent keeps the copy it had: to show it new commits,
> start a" — `06-preexisting.md:93`

- **Edit:** `edits/06.json[3]` "§5 warning: continuation"; `old` is "> on an empty diff. Commit first." —
  the clause is new. **Declared check:** none.
- **Critic:** `rounds.md:85-87` — "**false**. The tree is rebuilt at the recorded base from the last
  successful harvest (`driver.mjs:1746-1790`); after a cut, the harvest is absent and the real copy sits
  preserved for a human while the continuation gets an older one (`3505-3513`)."
- **Mechanism: e.** Two code paths and a cut-run state; only a run distinguishes them. **Why nothing
  fired:** no check was declared (`round.mjs` demands one only with `claims`); no ledger entry existed —
  `NEG 'keeps the copy it had'` was written by round 07's repair and shows its single `YES` at 06.

**R06-2 (false) — ADDED.**
> "turn's copy stay until you remove them" — `06-preexisting.md:120` (full sentence spans 119-121)

- **Edit:** `edits/06.json[4]` "§6 four places, locks, pruning". **Declared check:** none.
- **Critic:** `rounds.md:88-89` — "**false**. The next `--worktree` run removes a crashed run's clean
  tree, after saving its commits to `refs/codex-delegate/` (`1627-1682`)."
- **Mechanism: e.** **Why nothing fired:** as R06-1; `NEG 'failed turn's copy stay'` is a
  round-07 retirement, `YES` only at 06.

**R06-3 (false) — ADDED.**
> "`/codex-delegate:cleanup` lists what the plugin left" — `06-preexisting.md:120`

- **Edit:** `edits/06.json[4]`, same edit as R06-2. **Declared check:** none.
- **Critic:** `rounds.md:90-93` — "**false** for `reports/`, in the sentence that names them. Its
  subdirectory list is `answers, jobs, tmp, pasted, locks, worktrees, home` (`cleanup.mjs:256`); the
  critic **ran it** and got no reports row one minute after writing one."
- **Mechanism: c.** The refutation is a single enumerated list at `cleanup.mjs:256` — a desk read of the
  line the critic cites settles it; the run only confirmed it. The brief rule is the accuracy floor,
  `SKILL.md:44-46`. **Why the gate did not fire:** no check was declared, and `round.mjs` never reads a
  `how` string even when one exists. **This one also defeated the ledger later** — see the M8 note below.

**R06-4 (false) — ADDED.**
> "a report path already used" — `06-preexisting.md:187` (troubleshooting row 2)

- **Edit:** `edits/06.json[8]` "troubleshooting rows 2 and 3". **Declared check:** none.
- **Critic:** `rounds.md:94-96` — "**false**. That refusal happens one line before the report path is
  recorded (`driver.mjs:943-944`), so no report is written at all; the critic **measured it**, and the
  path still held the *other* run's report."
- **Mechanism: e.** An ordering fact between two adjacent lines that the writer had to observe, not
  guess; the critic measured it. (Desk-readable in principle at `:943-944`, but the round declared no
  citation at all, so there was nothing to read.) **Why nothing fired:** no check, no pin.

**R06-5 (overstated) — ADDED.**
> "A write lock / lasts as long as its run." — `06-preexisting.md:120-121` (spans the line break; `grep
> -n -F "lasts as long as its run"` → line 121)

- **Edit:** `edits/06.json[4]`. **Declared check:** none.
- **Critic:** `rounds.md:97-98` — "**overstated**; a killed run's stays and is reclaimed by the next
  (`1447`)."
- **Mechanism: e.** Requires killing a run. **Why nothing fired:** no check, no pin.

**R06-6 (overstated) — ADDED.**
> "a cut run continues from where it stopped" — `06-preexisting.md:188`

- **Edit:** `edits/06.json[8]`. **Declared check:** none.
- **Critic:** `rounds.md:99-100` — "**overstated**; `--resume` continues a thread with a new prompt, and a
  worktree seat's unsaved files do not come along."
- **Mechanism: e.** **Why nothing fired:** no check, no pin.

### Round 07 — 5 regressions (2 false, 3 overstated; +33 words; `edits/07.json`, 8 edits, **0 checks**)

Critic: `reviews/07/opus-a-code-with-execution.md`, level **ran** for all five (stub codex, killed
drivers, a seeded state directory). All five sat in text the round **ADDED**. `rounds.md:122-123` is the
round's own verdict: "Every one of the five is again a lifecycle sentence written from one line of code.
The rule recorded after 06 was not enough: I read the lines it named and still did not run them."

**R07-1 (false) — ADDED.**
> "turn's copy until you remove it or a later run finds it clean; a crashed run's commits are kept under"
> — `07-lifecycle.md:116`

- **Edit:** `edits/07.json[3]` "§6 worktrees bullet: lifecycle and refs". **Declared check:** none.
- **Critic:** `reviews/07/opus-a-code-with-execution.md:10-19` — "**FALSE as written** — the ref is
  created only when a *later `--worktree` run* reconciles and finds the tree otherwise **clean**. A
  crashed tree with a commit plus one untracked file keeps its commit only as the worktree's detached
  HEAD, with no ref anywhere", with the transcript and `driver.mjs:1663-1682`.
- **Mechanism: e.** **Why nothing fired:** no check declared; `NEG 'commits are kept under refs'
  unconditional` is a round-08 retirement whose single `YES` is at 07 — the pin could only be written
  after the critic found it.

**R07-2 (overstated) — ADDED.** (same sentence, second clause)
> "a later run finds it clean" — `07-lifecycle.md:116`

- **Edit:** `edits/07.json[3]`. **Declared check:** none.
- **Critic:** `reviews/07/opus-a-code-with-execution.md:39-40` — "**OVERSTATED** — only a later
  `--worktree` run reconciles. A read seat in the same repository left the stale tree untouched.
  `reconcileWorktreeLedgers` defined 1627, **called once, at 1689** inside `createWorktree`."
- **Mechanism: c.** A call-site count is a desk fact; the brief's accuracy floor (`SKILL.md:44-46`)
  covers it and no run is needed to establish "called once". **Why nothing fired:** no check was
  declared, so no citation existed to audit.

**R07-3 (false) — ADDED.**
> "worktree ledger, images you attached, the scratch of read-only agents started from a shell that names
> no" — `07-lifecycle.md:112`

- **Edit:** `edits/07.json[2]` "§6 data-dir bullet restructured". **Declared check:** none.
- **Critic:** `reviews/07/opus-a-code-with-execution.md:21-22` — "**FALSE on two counts**. `--attach`
  copies nothing into the state directory … (`grep -n "copyFileSync\|cpSync" driver.mjs` → **no hits**).
  What lands under `<state>/pasted/` are images the user **pasted** … **removed when that run ends**".
- **Mechanism: c.** The disproof is a one-line `grep` over a file already in the checkout, plus
  `attach-pasted.mjs:209,215-226`; the accuracy floor (`SKILL.md:44-46`) asks for exactly that. **Why
  nothing fired:** no check declared. `rounds.md:133-135` separately records that this claim entered from
  "a false open item … with no evidence beside it", and `reviews/07/fable-dedup-and-rank.md:119` (C8)
  resolves "rounds.md:126 vs opus-a's file:line — opus-a wins".

**R07-4 (overstated) — ADDED.**
> "you remove them. A write lock goes when its run ends, and one a killed run left behind is reclaimed by
> the" — `07-lifecycle.md:122`

- **Edit:** `edits/07.json[4]` "§6 closing: pruning, no cleanup promise, locks". **Declared check:** none.
- **Critic:** `reviews/07/opus-a-code-with-execution.md:26-34` — "Second half **OVERSTATED**: reclaimed
  only when the driver **and** its app-server process group are gone", proven with a stub codex and
  `driver.mjs:1365`.
- **Mechanism: e.** `kill -9` plus a surviving process group. **Why nothing fired:** no check declared.
  **This claim then became a ledger trap** — it was entered as `want:true` at level 2 and round 08
  retired it; see the M7 note below.

**R07-5 (overstated) — ADDED.**
> "| a run dies mid-way in a large fan-out, leaving no report | out of memory — runs are killed, not
> queued | ask for fewer at once |" — `07-lifecycle.md:190`

- **Edit:** `edits/07.json[7]` "row 3: the OOM symptom, no cut". **Declared check:** none.
- **Critic:** `reviews/07/opus-a-code-with-execution.md:42-43` — "**OVERSTATED/inconsistent**. parity.md
  says overshoot 'ends runs with SIGTERM' … and on SIGTERM the driver *does* write the report — proven: a
  driver SIGTERMed mid-run wrote `exitCode 4` … The 'no report' symptom fits only a SIGKILL."
- **Mechanism: e.** A SIGTERM'd driver had to be observed. (`parity.md:113` is a document and points the
  same way, so a (c) read would have raised the question; the *answer* needed the run.) **Why nothing
  fired:** no check declared.

### Round 08 — 10 regressions (4 false, 5 "overstated", 1 vaguer; **+100 words**; `edits/08.json`, 27 edits, **27 checks**)

Critics: `reviews/08/opus-code-with-execution.md` (**ran**, stub codex at
`evals/fake-app-server.mjs`), `reviews/08/astra-adversarial.md` (**ran**, six mock-driver probes),
`reviews/08/sol-naive-reader-would-you-ship.md` (**read** only). The ten are exactly the edits
`reviews/08/opus-code-with-execution.md:24` names: "Produced a false, overstated or vaguer sentence:
edits 1 (F-d), 7 (F-j), 8 (F-b), 11 (F-i), 12 (F-h), 14 (F-c, F-k), 15 (F-a), 17 (F-f, and retiring the
lock sentence left F-e), 25 (F-e), 27 (F-g)." (Opus numbers 1-indexed; `edits/08.json` indices below are
0-indexed.) `rounds.md:147` characterises all ten: "a qualification added to make a sentence truer that
the code then exceeded in detail".

**R08-1 (overstated) — CHANGED.**
> "You say what an agent may touch before it starts, and the run stops if Codex grants a different
> sandbox" — `08-review.md:8`

- **Edit:** `edits/08.json[0]`, retires `NEG 'grants anything else'`.
- **Declared check:** level **2**, how = "`driver.mjs:1991-2017` assertReadSandbox checks type, egress,
  workspace root, writable roots; **excludeSlashTmp not checked (ISSUES C5)**".
- **Critic:** `reviews/08/opus-code-with-execution.md:10` — "**OVERSTATED** … a fixture reporting
  `excludeSlashTmp: false` ran to completion, exit 0"; `reviews/08/astra-adversarial.md:21-34` (A2),
  confirmed by experiment.
- **Mechanism: a.** **The declared check states the counterexample in its own `how` string.** Reading the
  check refutes the sentence with no work at all. **Why the gate did not fire:** `round.mjs:23-24`
  validates only that `check.level ∈ {1,2,3}`; `check.how` is a free-text string the script never opens,
  never parses and never executes.

**R08-2 (vaguer) — CHANGED.** *(the single "vaguer" of the round)*
> "| `/codex-delegate:orchestrate` | Agrees a plan with you, then pushes the verbose steps — tests, greps,
> diffs, logs — onto Claude and Codex agents, so the main conversation stays small. |" — `08-review.md:58`

- **Edit:** `edits/08.json[6]` "commands: orchestrate row shorter (F71)".
- **Declared check:** level **1**, how = "water".
- **Critic:** `reviews/08/opus-code-with-execution.md:16` — "**vaguer and at odds with the skill (L2)** …
  `orchestrate/SKILL.md:23-27` keeps targeted greps with the coordinator and sends tree-wide greps and
  source reading to seats; **07's wording matched**." Critic level: **read**.
- **Mechanism: c.** The refutation is in a repo document (`orchestrate/SKILL.md:23-27`). The rule broken
  is the accuracy floor, `SKILL.md:44-46` — a sentence that states behaviour is not exempt because the
  edit was filed as "water"; `loop.md:74-76` (M9) says a repair is a new draft of every sentence it
  touches. **Why the gate did not fire:** a level-1 "water" check satisfies `round.mjs:23-24` as fully as
  a level-3 one; the script has no notion that the *sentence* makes a behavioural claim.

**R08-3 (false) — ADDED.**
> "| `/codex-delegate:cleanup` | Lists the scratch and run directories the plugin left on this machine —
> not your answers, run records or reports — suggests what to remove, deletes only what you pick. |"
> — `08-review.md:59`

- **Edit:** `edits/08.json[7]`, claims `cleanup row honest`, retires `NEG 'Lists what the plugin left on
  this machine'`.
- **Declared check:** level **3**, how = "`cleanup.mjs:846-847` rows; **measured 2026-09-12**: seeded
  answer and report, `--list --json` returned no rows (ISSUES C2)".
- **Critic:** `reviews/08/opus-code-with-execution.md:8` — "**FALSE (L3)** … seeded
  `<state>/orchestrate/<slug>/run-42/seat-a/report.json`, selected the run: 'I deleted the run 42',
  **report gone**"; `reviews/08/astra-adversarial.md:7-19` (A1) independently, with
  `cleanup.mjs:407,434,865,1024`.
- **Mechanism: e.** **This is one of the four checks `rounds.md:17` says did not hold** —
  `reviews/08/opus-code-with-execution.md:26`: "**Edit 8's check did not test its conclusion.**" The check
  was at level 3 and *was run*; it measured the **listing** while the sentence promises something about
  **deletion**. Executing the declared check (a) therefore catches nothing; only a new experiment — Astra's
  planted run directory — reaches it. **Why the gate did not fire:** `round.mjs` cannot tell whether a
  check's proposition is the sentence's proposition; there is no link between `check.how` and `claims[].pattern`.

**R08-4 (understated; counted by `rounds.md` among the five "overstated") — ADDED.**
> "saved — its edits and new files, not anything your `.gitignore` covers — and kept for you to look at"
> — `08-review.md:90`

- **Edit:** `edits/08.json[10]`, claims `failed copy kept` and `saved excludes ignored files`.
- **Declared check:** level **3**, how = "`driver.mjs:1854` **--exclude-standard**, 1863-1872 ignored
  counted not archived; opus-a: SIGTERM at 16 s and `--timeout 14` → 'worktree PRESERVED…'".
- **Critic:** `reviews/08/opus-code-with-execution.md:15` — "**F-i UNDERSTATED (L3).** L90-91 says what is
  not saved, not that ignored files are **deleted** with the copy"; `reviews/08/astra-adversarial.md:51-69`
  (A4) — "`--exclude-standard` … also excludes files through `.git/info/exclude` and global ignore
  configuration. Conversely, tracked changes are harvested even when their filenames match `.gitignore`",
  with `git check-ignore` output.
- **Mechanism: a.** The check's own citation names `--exclude-standard`; the sentence names
  "`.gitignore`". The two are not the same set, and that mismatch is visible in the `how` string without
  running anything. **Why the gate did not fire:** `round.mjs` never reads `how`.
- **Note on class:** the critic labels this **UNDERSTATED**, not overstated. `rounds.md:17` buckets the
  round as "4 false, 5 overstated, 1 vaguer"; the fifth "overstated" is this understatement.

**R08-5 (overstated) — CHANGED.**
> "daemon, a socket or a pid file there. The one thing it has that a native subagent does not is proof —"
> — `08-review.md:103`

- **Edit:** `edits/08.json[11]`, claims `parity: proof is what it adds`, retires `NEG 'one place the two
  differ'`.
- **Declared check:** level **2**, how = "`seat/SKILL.md:100-101` NETWORK: no leaves WEB_SEARCH;
  `driver.mjs:2155` web_search disabled unless set; `parity.md:15-16` committing: none".
- **Critic:** `reviews/08/opus-code-with-execution.md:14` — "**OVERSTATED (L1).** … the **decorrelated
  model, the document's opening premise, is the other thing**." Critic level: **read**.
- **Mechanism: c.** The refutation is the document's own opening (`08-review.md:5-6`, the
  one-model's-opinion-twice premise) and its own next section; `loop.md:117-122` prescribes exactly this
  hunt for absolute claims. **Why the gate did not fire — and this is the sharper point:** round 07's
  version of this claim had *already* been found false
  (`reviews/07/opus-a-code-with-execution.md:7-8`) and retired as `NEG 'one place the two differ'`. Round
  08 satisfied that pin by **paraphrase**: the pattern is the literal string `The one place the two differ
  is proof`, so "The one thing it has that a native subagent does not is proof" passes green while the
  same claim returns. `ledger.mjs:18-19` compiles `pattern` as a plain regex over normalised text; it pins
  phrasings, not propositions.

**R08-6 (false) — ADDED.**
> "ledger of throwaway copies, and a Codex home of the plugin's own, sharing only your sign-in and your"
> — `08-review.md:117`

- **Edit:** `edits/08.json[13]`, claims `private home shares sign-in and sessions`, retires `NEG 'images
  you attached'`.
- **Declared check:** level **2**, how = "`driver.mjs:1218-1228` links auth.json and sessions into the
  private home; `grep copyFileSync|cpSync driver.mjs` → none; `attach-pasted.mjs:207-226` removes
  `pasted/` at run end".
- **Critic:** `reviews/08/opus-code-with-execution.md:9` — "**FALSE in 'only' (L3).** `<state>/home/config.toml`
  after one run carries `model`, `model_reasoning_effort`, `personality`, `service_tier` from the caller";
  `reviews/08/astra-adversarial.md:124-132` (A9) — "`driver.mjs:1049` names the four keys; `:1094` returns
  them; `:1279-1281` writes them … **`environment-and-internals.md:74-78` explicitly documents this
  inheritance**."
- **Mechanism: c.** The word "only" is one of the five absolute words `loop.md:121` names, and the
  counter-sentence sits in the plugin's **own reference document**, `environment-and-internals.md:74-78`.
  No run required. **Why the gate did not fire:** no script implements `loop.md:121`; the declared check
  read `1218-1228` and stopped 50 lines short of `1279-1281`, and `round.mjs` neither widens nor audits a
  citation. **Also one of the four failed checks** —
  `reviews/08/opus-code-with-execution.md:26`: "Edit 14's check **misdescribes** `attach-pasted.mjs`."

**R08-7 (false) — ADDED.**
> "commits under `refs/codex-delegate/`; a copy with unsaved files is left as it is, commits and all."
> — `08-review.md:121`

- **Edit:** `edits/08.json[14]`, claims `crash refs only for a clean tree`, retires `NEG 'commits are kept
  under refs' unconditional`.
- **Declared check:** level **3**, how = "`driver.mjs:1650-1682` dirty tree → continue before the ref;
  reconcile called only from createWorktree `:1689`; opus-a: commit + untracked file → no
  `refs/codex-delegate/*` after a `--worktree` run".
- **Critic:** `reviews/08/opus-code-with-execution.md:7` — "**FALSE (L3).** Dirtiness is `git status
  --porcelain` (`driver.mjs:1650-1656`), **blind to ignored files**; a preserved copy holding only a
  `.gitignore`d file was judged clean, removed by the next `--worktree` run, the file destroyed";
  `reviews/08/astra-adversarial.md:36-49` (A3), which planted `valuable.log` and watched it go.
- **Mechanism: e.** The check was level 3 and *was run* — on an **untracked** file, the case that works
  ("The dirty case with an untracked file behaves as claimed"). Only a second experiment, with an
  *ignored* file, reaches the falsity. **Why the gate did not fire:** nothing in `round.mjs` asks whether
  a level-3 check covered the case the sentence generalises over.

**R08-8 (false) — ADDED.**
> "Answers, run records and a read-only agent's scratch age out — 14 days or 400 entries, trimmed when a /
> later run starts" — `08-review.md:124-125` *(spans the line break: `grep -n -F "trimmed when a later run
> starts"` fails; `grep -n -F "trimmed"` → 124, and whitespace-normalised matching finds it, as
> `ledger.mjs:14` would)*

- **Edit:** `edits/08.json[16]`, claims `retention numbers`, retires `killed run's lock reclaimed`.
- **Declared check:** level **2**, how = "`driver.mjs:80-81` PRUNE_DAYS 14, PRUNE_MAX_ENTRIES 400;
  pruneDir called at 1145, 1535, 2991, 3003 — **inside runs only**; `environment-and-internals.md:132-135`
  reports never pruned".
- **Critic:** `reviews/08/opus-code-with-execution.md:12` — "**FALSE for the scratch the document located;
  trigger imprecise (L3).** `pruneDir` runs only on `<state>/tmp`, `jobs`, `answers`; with `TMPDIR`
  exported **no `<state>/tmp` exists** and nothing in the system temp directory is pruned. Answers are
  pruned when a run *writes* one"; `reviews/08/astra-adversarial.md:71-81` (A5), which planted 30-day-old
  scratch and found it remained; `:192-199` (D5) notes the antecedent broadened from 07's "that scratch".
- **Mechanism: c.** A pruning claim — "what is removed and when" — carried at level **2**, against the
  brief's own floor: `SKILL.md:46-47`, "**A claim about a lifecycle (what stays, what is removed, what a
  continued or retried run sees) at level 2 is a guess: run it.**" The subject-widening ("that scratch" →
  "a read-only agent's scratch") is visible at desk against §6, which locates that scratch in the system
  temp directory the check never covers. **Why the gate did not fire:** `round.mjs:36`'s lifecycle
  heuristic is a word-list (`/lifecycle|stays|removed|continu|resum|reclaim|kept|prun/i`) tested against
  the claim's **name and pattern only** — here `"retention numbers"` + `"14 days or 400 entries"`, which
  match **none** of those words. A pruning claim named for its numbers slips the pruning heuristic. (And
  it would only have set a `provisional` flag, which nothing blocks on.)

**R08-9 (overstated) — ADDED.**
> "for quota, wait or use a Claude subagent; for a lock, wait for the run that holds it — or, when that run
> is dead, stop the Codex processes the refusal names — or give each run its own directory |"
> — `08-review.md:190`

- **Edit:** `edits/08.json[24]`, claims `lock cure names the process group`.
- **Declared check:** level **3**, how = "astra probe 'taken-report' …; **`driver.mjs:1447`** refusal names
  `kill -TERM -<pgid>`; opus-a reproduced with a stub codex".
- **Critic:** `reviews/08/opus-code-with-execution.md:11` — "**OVERSTATED, and a regression against the
  retired sentence (L3).** **Three cases** in `acquireLock` (`driver.mjs:1444-1456`): a live holder's
  refusal says **the opposite** ('leave it there, a lock whose holder is gone is reclaimed on the next
  attempt without your help'); only a dead driver with a live codex group names a process; a plain dead
  holder is reclaimed silently (planted, exit 0). **07's 'reclaimed by the next' was true and was
  retired.**"
- **Mechanism: a.** The declared check cites `:1447`, a single line inside the three-case block at
  `1444-1456`; reading the block the citation points into shows the other two cases and the opposite
  advice. **Why the gate did not fire:** `round.mjs` never opens the file a `how` names, let alone widens
  to the enclosing block.
- **Compound damage:** this edit's sibling (`edits/08.json[16]`) retired `killed run's lock reclaimed`,
  a **true** claim, so the round both added a wrong cure and deleted the right one.

**R08-10 (overstated) — CHANGED.**
> "Young code, but the test cases were mutation-checked on 2026-08-31 and the survivors listed"
> — `08-review.md:203`

- **Edit:** `edits/08.json[26]` "further reading: mutation claim dated (F40)".
- **Declared check:** level **2**, how = "`evals/README.md:174-177` nine mutants over 117 cases on
  2026-08-31; **twelve suites now**".
- **Critic:** `reviews/08/opus-code-with-execution.md:13` — "**OVERSTATED (L2).** … only the external audit
  is dated; **whole suites postdate it** (`agent-contract` 09-01, `orchestrate` 09-07, `cleanup` 09-10)."
  Critic level: **read**.
- **Mechanism: a.** The check's own `how` ends with "twelve suites now" — the writer recorded the
  refutation inside the check and shipped the claim regardless. **Why the gate did not fire:**
  `round.mjs:23-24` reads `level`, not `how`.

---

## Aggregate

### Per mechanism

| Mechanism | Count | Which |
|---|---|---|
| **a** — executing/reading the edit's own declared `check` | **4** | R08-1, R08-4, R08-9, R08-10 — all in round 08, the only critiqued round whose edits declare checks at all |
| **b** — a ledger pin, `ledger.mjs` as it is, firing *prospectively* | **2** | R02-1, R03-1 |
| **c** — a brief rule refutable at desk against a document | **7** | R04-1, R06-3, R07-2, R07-3, R08-2, R08-5, R08-6 |
| **d** — a cap on words added per round | **0** | no such gate exists: `sections.mjs:25` exits 0 unconditionally |
| **e** — only a reader or a run could | **12** | R03-2, R06-1, R06-2, R06-4, R06-5, R06-6, R07-1, R07-4, R07-5, R08-3, R08-7, R08-8 |
| **total** | **25** | |

Read the other way: **21 of 25 needed either new evidence (e, 12) or a judgement no script implements
(c, 7 — contradiction and absolute-word hunts that `loop.md:117-122` prescribes and nothing enforces).
Only 6 sat within reach of a running script (a 4 + b 2).**

### Per class

Only rounds 06, 07 and 08 are classified in the record; rounds 02–04 have no surviving critic report.

| Class | Count | Which |
|---|---|---|
| false | 10 | R06-1, R06-2, R06-3, R06-4 (`rounds.md:85-96`); R07-1, R07-3 (`rounds.md:114-117`); R08-3, R08-6, R08-7, R08-8 (`rounds.md:17`) |
| overstated | 10 | R06-5, R06-6 (`rounds.md:97-100`); R07-2, R07-4, R07-5 (`rounds.md:118-120`); R08-1, R08-4, R08-5, R08-9, R08-10 |
| vaguer | 1 | R08-2 |
| unclassified in the record | 4 | R02-1, R03-1, R03-2, R04-1 — M3 and `rounds.md:62-64` describe all four as *wrong*, none as merely overstated |
| **total** | **25** | |

One caveat, proven: the critic labels R08-4 **UNDERSTATED**
(`reviews/08/opus-code-with-execution.md:15`), so one of `rounds.md`'s five "overstated" for round 08 is
an understatement, not an overstatement.

### Claim (i) — `research/README.md:12`: "every one a lifecycle sentence written from reading, not running"

**Refuted, on both halves.**

*"a lifecycle sentence"* — using the record's own definition (`rounds.md:81`, "what stays, what is
removed, what a continuation sees"):

| Fits | Does not fit |
|---|---|
| R03-2 (partly: "your machine clears it"), R06-1, R06-2, R06-5, R06-6, R07-1, R07-2, R07-3, R07-4, R07-5, R08-3, R08-4, R08-7, R08-8, R08-9 = **15** | R02-1 (a default in a verdict), R03-1 (a write grant), R04-1 (when rights are asserted), R06-3 (what a command lists), R06-4 (a refusal cause), R08-1 (a sandbox comparison), R08-2 (what a skill delegates), R08-5 (a parity claim), R08-6 (what a config inherits), R08-10 (a test-suite date) = **10** |

**15 of 25 fit; 10 do not.** The claim is false as stated. `README.md:37` of the same run directory
already concedes the point for the naive reader's two findings — "Neither is a lifecycle sentence" — but
those were not counted as regressions at all.

*"written from reading, not running"* — false for at least **4 of 10** in round 08: edits
`[7]`, `[10]`, `[14]`, `[24]` (R08-3, R08-4, R08-7, R08-9) each declare `check.level: 3`, i.e. the writer
**did** run something, and the sentence regressed anyway. The failure there is not reading-instead-of-
running; it is a run that answered a narrower question than the sentence asked.

### Claim (ii) — `rounds.md:17`: "4 of the writer's 27 stated checks did not hold"

**Confirmed, and the four are named at `reviews/08/opus-code-with-execution.md:26`.** (Opus numbers are
1-indexed; `edits/08.json` indices are 0-indexed.)

| # | Opus's edit no. | `edits/08.json` index and name | Declared check | Why it did not hold (verbatim) |
|---|---|---|---|---|
| 1 | 19 | `[18]` "parity: declined approval, not 'sized too small'" | L2, "`driver.mjs:248` exit 6 …; **`:2360` stderr**; 'sized too small' only in comments" | "edit 19 cites `:2360` for a stderr notice on a declined approval — **there is none**; the recording is `report.escalations`." |
| 2 | 8 | `[7]` "commands: cleanup row honest (F4)" | L3, "`cleanup.mjs:846-847` rows; measured 2026-09-12 … `--list --json` returned no rows" | "**Edit 8's check did not test its conclusion.**" It measured what cleanup *lists*; the sentence promises what cleanup *does not delete*. Astra's A1 deleted a run and the report went with it. |
| 3 | 14 | `[13]` "stores: data directory bullet" | L2, "`driver.mjs:1218-1228` …; `attach-pasted.mjs:207-226` removes `pasted/` at run end" | "**Edit 14's check misdescribes `attach-pasted.mjs`.**" Per F-k, a SIGKILLed run leaves pasted images until a later run's `scavenge` (`:214-228`), so `pasted/` is not simply removed at run end. |
| 4 | 11 | `[10]` "rights: saved excludes ignored files; kept when cut short" | L3, "`driver.mjs:1854` …; opus-a: SIGTERM at 16 s and `--timeout 14` → 'worktree PRESERVED (run ended before disposition)'" | "Edit 11's check **cites the pre-turn path for a message the normal path never prints** (the claim is still true on the normal path: `worktreePreserved: 'turn interrupted'`)." |

**Three of the four (edits 8, 14, 11) belong to edits that also produced a regression** (R08-3, R08-6,
R08-4). **One (edit 19) produced a true sentence on a false citation** — it is in Opus's *confirmed* list
at `reviews/08/opus-code-with-execution.md:24`. So executing every declared check would have caught at
most 3 of the 10 regressions, and would additionally have caught one silent citation rot that no
regression count records.

### Per round: words added, and where the regressions sat

`wc -w` re-run on every file; matches `rounds.md:9-18` exactly.

| Round | Words | Δ words | Regressions | in text the round **ADDED** | in text it **CHANGED** |
|---|---|---|---|---|---|
| 02-revision | 1394 | +11 | 1 | 0 | 1 |
| 03-repair | 1424 | +30 | 2 | 0 | 2 |
| 04-ratchet | 1439 | +15 | 1 | 0 | 1 |
| 05-critics | 1443 | +4 | 0 | — | — |
| 06-preexisting | 1578 | **+135** | 6 | **6** | 0 |
| 07-lifecycle | 1611 | +33 | 5 | **5** | 0 |
| 08-review | 1711 | **+100** | 10 | **6** | 4 |
| 09-reduction | 1531 | **−180** | not critic-read | — | — |
| **total** | | | **25** | **17** | **8** |

The two rounds with the largest growth (06 at +135 and 08 at +100) carry **16 of 25** regressions, and
**12** of those sat in text those rounds added. Rounds 02–04, which grew by 11, 30 and 15 words, produced
4 regressions and **every one was in text they rewrote, not text they added** — the compression failure
mode (M3, `measurements.md:19-23`), not the accretion one. A word cap would have discriminated the second
group and been blind to the first. No cap exists: `sections.mjs:25` exits 0 unconditionally.

---

## Three further facts a gate designer should have, with file:line

1. **`round.mjs` validates the existence of a check and never its content.** `round.mjs:23-24` tests only
   `e.check && [1,2,3].includes(e.check.level)`, and only when `e.claims` is non-empty. `check.how` — the
   string that carries the whole evidential claim — is written into the ledger at `round.mjs:35` and read
   by nothing. Two of round 08's regressions (R08-1, R08-10) have their own refutation **inside** the
   `how` they shipped with.

2. **A retirement can never prevent the round that earns it.** `round.mjs:37` writes `retire` entries from
   the edit that removes a phrasing — always the *repairing* round, never the *introducing* one. Running
   `ledger.mjs` over all ten rounds shows every `NEG …` row with its single `YES` in the round that
   introduced it and the entry itself created one round later. Consequently the ledger's prospective power
   over these 25 is exactly **2** cases (R02-1, R03-1), both of them a `want:true` claim going **LOST** —
   the only failure mode `ledger.mjs:22` can see before a critic speaks.

3. **The pin is a phrase, so a paraphrase walks through it — twice, provably.**
   (a) M8, `measurements.md:44-46`: `NEG 'cleanup lists what the plugin left'` has pattern
   `` cleanup` lists what the plugin left `` (lower-case, backtick-anchored); `07-lifecycle.md:61` carries
   "**L**ists what the plugin left on this machine" in a table cell. The ledger was green for rounds 06 and
   07 while the retired claim stood; a second entry, `NEG 'Lists what the plugin left on this machine'`,
   had to be added in round 08 to catch it. (b) R08-5: round 07 retired `NEG 'one place the two differ'`,
   and round 08 restated the same claim as "The one thing it has that a native subagent does not is
   proof" — green pin, live claim.

Two more, recorded because they bear on any redesign:

4. **The provisional heuristic misses the claims it was written for.** `round.mjs:36` tests
   `/lifecycle|stays|removed|continu|resum|reclaim|kept|prun/i` against `c.name + " " + c.pattern` only.
   R08-8 is a pruning claim named `"retention numbers"` with pattern `"14 days or 400 entries"` — no word
   matches, no mark. And `ledger.json` contains **zero** provisional entries across 66, because the rule
   postdates the run (M7, `measurements.md:39-42`).

5. **A ratchet on this ledger would have blocked a correct fix — but not every one the record claims.**
   `rounds.md:127-130` says the three level-2 lifecycle entries "reclaimed by the next",
   "refs/codex-delegate/" and "leaving no report" each fell to a run, so "A ratchet on that ledger would
   have rejected the fixes." For one of the three the ratchet would have been **right**:
   `reviews/08/opus-code-with-execution.md:11` finds that "**07's 'reclaimed by the next' was true and was
   retired**", and round 08's replacement cure (R08-9) is the overstated one.

## What is not settled

- Rounds 02 and 03 have no `edits/`, no `reviews/` and no prose in `rounds.md` (its narrative starts at
  `### 04`, line 60). R02-1, R03-1 and R03-2 are identified by diff + the ledger matrix + M3/M9, at
  evidence level 2 — an independent reader of the same files would name the same sentences, but no critic
  report says so. R02-1 has one live alternative: round 02 also introduced "Restart Claude Code or run
  `/reload-plugins` to apply an update; it keeps your stored answers and run records **either way**"
  (`02-revision.md:73-74`), which round 03 cut back to "Restart Claude Code to apply an update". Either
  could be the counted regression; the ledger flags only the first.
- `rounds.md:17` counts 10 for round 08; `ledger.json` carries **11** `NEG` entries whose single `YES` is
  at 08, and the union of Opus's and Astra's findings on 08 is larger still. The 10 is Opus's tally
  (`reviews/08/opus-code-with-execution.md:24`); Astra's D1 ("pinned", `:164-169`), D7 and D8 (`:208-221`,
  both on `edits/08.json[20]`) are 08-introduced defects Opus listed as confirmed. Whether they are
  regressions by the loop's own definition (`loop.md:53-55`) is a judgement the record does not record.
