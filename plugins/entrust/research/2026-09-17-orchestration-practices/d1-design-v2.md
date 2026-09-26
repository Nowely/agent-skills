# D1 design, revision 2: orchestrate-page edits from the 2026-09-17 research round, after Codex Astra C1

Fable D1, 2026-09-17, the one revision round. v1 (`design.md`, `page.diff`, `eval.diff`, `entrust/`) is untouched; this file and `page-v2.diff`, `eval-v2.diff`, `apply-v2.py`, `entrust-v2/`, `probes-v2.{mjs,json}`, `mutation-baseline.{mjs,json}` are the revision. Subject unchanged: `plugins/entrust/skills/orchestrate/SKILL.md` at `7e7d9cc` (155 lines, SHA-256 `51e04421…f5a0`, re-checked before this revision). Every old string below was asserted to occur exactly once in that file by `apply-v2.py`; the repository is untouched (`git status`: only the round's own untracked files).

C1's verdicts were keep 2 (rows 2, 8), fix 9 (rows 1, 4, 5, 6, 7, 9, 10, 11, D3), drop 0. This revision takes every fix, the lean variant (no dated parenthetical on the page; corrected facts and their locators go to the CHANGELOG entry), the 156-line budget with L117 kept, and rule-level pins where the words allow them. One point stays contested and goes to the owner (§5 Q1): D3's "measured better and smarter", which the owner's 2026-09-17 boundary keeps and C1 would cut.

Evidence terms as in v1: CC / CC-v / VE / RA / ME; T1-nn a local incident; `426:973` a transcript line of session `42691a3b…`, `30a:204` of session `30a03d40…`; H-nn a phase-3 hypothesis.

## §0 Summary

| item | v1 | v2 | words | lines | pins | deciding id |
|---|---|---|---|---|---|---|
| 1 | adopt | **fixed**: the decisive check first, dependent execution in one agent, verification independent; no ban on a panel | 18 | 0 | new E7 | H1; T1-19, T1-45, T1-48; C L35 |
| 2 | adopt | **kept**, anecdote off the page; history corrected (T1-01 breached an existing cap, T1-53 preceded any) | 13 | 0 | new D9 | S2-05; T1-01 "page then: 0.13.0 alive at once 6" |
| 3 | defer | **defer**, with the measurement plan in §6 | — | — | — | H3, H18 |
| 4 | adopt | **fixed**: `unknown` in `result`, the missing check in `open`, the sibling's `EXPECT:` rule for a Codex check; measurement corrected to one disqualified verdict | 25 | 0 | F2 judge regex | C L187; result-gates.md; 426:1005, 426:1208 |
| 5 | adopt | **fixed**: selection stalls re-plan on a repeated blocker; repair loops keep the top-row escalation | 32 | 0 | new F8 (pins F3's ladder too) | M2, S1-51; T1-45; C0 on useful elimination |
| 6 | adopt | **fixed**: prerequisite check and cheap probe before the plan; unmet prerequisites into the plan; no reassignment after a refusal | 23 | 0 | new C11 | C L160–161; T1-44, T1-51, T1-27 |
| 7 | adopt half | **fixed**: input paths in the planned tree, item count, each quoted claim against its source; range half still rejected | 28 | +1 | new F7; budget 155→156 | T1-05, T1-09, T1-39 |
| 8 | adopt half | **kept**; the scope half now **adopted** as one sentence in the return section | 16 + 26 | 0 | F2 adversarial regex; new G7 | S1-37; T1-50; S1-40; T1-30, T1-08, T1-12, T1-49 |
| 9 | adopt half | **fixed**: estimates from comparable runs, `unknown` where unmeasured; no tariff on the page | 22 | 0 | new C10 (with a no-number half) | S1-15; T1-53, T1-07, T1-01; the Astra median (§7) |
| 10 / D2 | adopt | **fixed**: one fresh strong-row reader by the agreed composition, named in the plan, the whole publication once | 35 | 0 | F2 completeness regex | owner D2; C L45 "only codex"; T1-49 |
| 11 | adopt | **fixed**: number, cost, recommendation, and the plan says what "go" selects; dates 2026-09-12 to 09-17 | 17 | 0 | new C9 | T1-23 (30a:204 ts 2026-09-12), T1-38 |
| 12 | reject | **reject**, reworded: no additional retry rule | — | — | — | driver.mjs:2641, 2971; O L109, L124, L137; T1-U1 |
| D1 | keep L25 | **keep**; plus a guard pin that fails if the page ever says the coordinator grades its own work | — | — | new B7 | C1 §4 probe |
| D3 | reword | **fixed in part**: the price half cut, no substitute; "measured better and smarter" kept on the owner's boundary — contested, §5 Q1 | -4 | 0 | new D10 (negative half) | T1-U3; README decision 3 |

Totals: 12 page deltas (11 at zero lines, 1 at +1); page 155 → 156 lines, 3,138 → 3,389 words (+251); eval 45 → 55 cases; v2 copy `all 55 passed`, unchanged tree `all 45 passed`; 15 predicate probes behaved as designed (§8).

## §1 Per item

### Row 1 — a decisive check before any panel; dependent execution in one agent; verification independent

C1: v1's "one agent's or your own and never a panel's" banned a panel for the whole task, exceeding S2-02 (sequential constraint work), S2-03 (associative), S2-12/13 (narrow iso-call) and the local record (T1-19 used two critics, T1-48 three agents: neither is a no-review comparator), and collided with O L25, O L122 and C L35 "Knowing the answer is not a reason to skip a requested second opinion". H1 tests check-before-panel, not never-panel. **Fixed** with C1's wording.

Delta, O L103 (first sentence extended, 0 lines):
- old: `Allocate inside those bounds by judgement, not to fill a band. Several writers at once is how a task goes faster:`
- new: `Allocate inside those bounds by judgement, not to fill a band. Run a decisive check before commissioning a panel. Keep dependent execution in one agent; keep its verification independent. Several writers at once is how a task goes faster:`

Pins: E6 unchanged; B5 unchanged; new **E7**: `shows(/(Run|Make|Do) (a|the) decisive check before (commissioning|launching|spawning) (a|any) panel/, /(Keep|Leave) dependent execution in one agent; keep its verification independent/)`. Phase 3: H1.

### Row 2 — the bulk count derived from the units, the plan saying why

C1: keep; remove the anecdote; correct v1's history. Corrected: T1-01's "page then" column reads `0.13.0 page: "alive at once 6"; bulk row ≤50`, so the 80-agent Workflow breached a cap that existed (30 non-bulk agents against six alive); T1-53 (2026-09-07) preceded any rule. The rule does not depend on the cap's absence. **Kept.**

Delta, O L69 (0 lines):
- old: `count against the alive cap and never takes a top-row role; announce its count before spawning, like any other fan-out.`
- new: `count against the alive cap and never takes a top-row role; announce its count before spawning, like any other fan-out, a count derived from the units with the plan saying why that many.`

Pins: tier-table pin unchanged; new **D9**: `shows(/a count (derived|taken|drawn) from the units with the plan (saying|stating) why that many/)`. Phase 3: H2, H16.

### Row 3 — calibrating the cheap tier: deferred, with the plan in §6

C1 agrees, with the boundary that S2-06/S2-18 forbid assuming bounded-task success transfers to deep search and do not justify a calibration panel before every bounded quote check. §6 gives H3/H18 as matched measurements and names the acceptance check per task form.

### Row 4 — a judge verdict without its decisive check is `unknown`

C1: v1 implied `status: unknown` (the five-field enum is done | partial | blocked, G1) and that an `EXPECT:` header supplies missing evidence; `EXPECT:` is Codex-only, checks that a matching command ran and succeeded (C L187), can be met by a pipeline whose status is `tail`'s (result-gates.md L21–26) and must not be pointed at a check whose failure is the finding. The measurement "two of six" was false (§7). **Fixed** with C1's wording; the count corrected.

Delta, O L122 (rewritten, 0 lines):
- old: `- Judge panel for a design task.`
- new: `- Judge panel for a design task: a verdict missing its decisive check is `unknown` in `result`; name the missing check in `open`. Use the sibling's `EXPECT:` rule for a Codex check.`

Pins: **F2** judge regex `/^- Judge panel for a design task\.$/m` → `/^- Judge panel for a design task: a verdict (missing|without|lacking) its decisive check is `unknown` in `result`; name the missing check in `open`\. Use the sibling's `EXPECT:` rule for a Codex check\.$/m`; G1's enum untouched.

Judge bias, acknowledged where the page relies on a judge: S2-37/38 (self-preference; order reversal flips 25 / 58 / 89 %) and S2-35/39 (length) are not controlled by an execution gate. Locally the first naming round's recognition was unshuffled ("нынешнее имя стояло первым в списке, порядок не перемешан", 426:973) and the later rounds were shuffled (426:1208, 426:1285); whether the order changed the round-1 outcome is unknown. S2-43: counterbalancing doubles cost and only reduces variance, so no double-judging rule; §6 records presentation order in every preference measurement, and §5 Q4 asks whether the judge bullet should say "shuffled order". Phase 3: H4.

### Row 5 — selection stalls re-plan; repair loops keep their ladder

C1: v1's "between rounds … winners not adopted" had no domain boundary and could fire on repair rounds, where O L126–127 already escalates to the top row; rejected candidates can be useful elimination evidence (C0). **Fixed** with C1's wording; F3's ladder is now pinned beside the stall rule.

Delta, O L127 (extended, 0 lines):
- old: `that round fails too.`
- new: `that round fails too. Between selection rounds, record the candidates rejected, the evidence gained and the remaining blocker. Two rounds repeating the same blocker are a stall: show a new plan and wait for the word.`

Pins: F3 unchanged; new **F8**: `shows(/Between selection rounds, (record|write|note) the candidates rejected, the evidence gained and the remaining blocker/, /Two rounds repeating the same blocker are a stall: show a new plan and wait for the word/, /Fix, then cross-review, at most two rounds; then escalate to the Fable agent or the `gpt-6-astra` agent/)`. T1-46 remains unanswered by this delta (a notification cost, O L107). Phase 3: H6; the threshold of two is a policy to test, not a measured optimum.

### Row 6 — prerequisites checked before the plan; nothing reassigned after a refusal

C1: v1's "a command they refuse makes the check yours … or a write agent's" read as post-refusal reassignment, against O L27 "never backfill" and C L160–161 "never translate a refusal into broader rights"; wider filesystem rights are not an SSL repair, and an exit-6 answer stays readable (T1-27). **Fixed** with C1's wording.

Delta, O L37 (extended, 0 lines):
- old: `1. Load the sibling skill with the Skill tool if it is not loaded yet, scout, then decide the composition and the agents.`
- new: the same sentence, then ` For each agent, check the required commands against its planned rights and environment. Probe uncertain prerequisites cheaply; put unmet prerequisites in the plan.`

Pins: A3 unchanged; new **C11**: `shows(/For (each|every) agent, (check|match|list) the required commands against its planned rights and environment/, /Probe uncertain prerequisites cheaply; put unmet prerequisites in the plan/)`. Step 2 then shows the unmet prerequisites, the rights and their cost in ordinary words (C1 Q6), which O L38's "what each may write" already asks for; no second sentence was added there. Phase 3: H7, measured beside completed checks and useful outcomes, not exit-6 counts alone.

### Row 7 — one assembled brief opened whole: input paths, item count, quoted claims

C1: a path-existence check catches T1-09 only; T1-05 was a wrong pairing and T1-39 a missing item; deliberate nonexistent-path probes (T1-28) and output paths must not be "resolved"; the check reads the agent's planned tree (a worktree starts at HEAD, O L46–48). **Fixed** with C1's wording. The range half (S1-09) stays rejected: one vendor report, low local confidence, and row 2's derived count answers the local quantity defect.

Delta, a new bullet after O L118 (+1 line, the one paid line):
`- Open one assembled brief whole before the fan-out; check its input paths in the agent's planned tree, its item count and each quoted claim against its source.`

Pins: F2's six regexes unaffected; new **F7**: `shows(/^- (Open|Read) one assembled brief whole before (the|any) fan-out; check its input paths in the agent's planned tree, its item count and each quoted claim against its source\.$/m)`. Phase 3: H5.

### Row 8 — a bounded finding (kept); the verifier's scope (now adopted)

C1: keep the bounded finding; "correctness" still admits material unrequested risks (T1-36, T1-29 are not suppressed), and dissent stays readable in `open`. On the scope half C1's note: S1-40's early-victory warning is only partly covered by a `CHECK:` label and a test count; T1-30 bounded a clipped report to the parts read; T1-08/12/49 overclaimed from partial evidence; "name the verification target and completion criterion in each brief, and distinguish checked from unverified" without a new page paragraph. **Adopted as one sentence** in the return section, because that section is where every brief's return contract is set (O L142) and a convention that lives nowhere on the page is one the next coordinator does not inherit; C1 read it as brief-level, so §5 Q2 asks.

Delta, O L119 (rewritten, 0 lines):
- old: `- Adversarial verify: a refuter defaults to `refuted` when it is uncertain.`
- new: `- Adversarial verify: a refuter defaults to `refuted` when it is uncertain, and a finding is one that changes correctness or a stated requirement, the rest its `open`.`

Delta, O L142 (extended, 0 lines):
- old: `… the template is the bound, and `BRIEF:` would clip the answer at 20 lines. The first line of `result` is one sentence a`
- new: `… the template is the bound, and `BRIEF:` would clip the answer at 20 lines. A verifier's brief names its target and the whole scope it must cover; its return says what it checked and, in `open`, what it did not. The first line of `result` is one sentence a`

Pins: **F2** adversarial regex → `/^- Adversarial verify: a refuter defaults to `refuted` when it is uncertain, and a finding is (one|what) that changes correctness or a stated requirement, the rest (its|in) `open`\.$/m`; G1 ("and send no `BRIEF:` line") and G4 unchanged; new **G7**: `shows(/A verifier's brief (names|states) its target and the (whole|full) scope it must cover/, /its return says what it checked and, in `open`, what it did not/)`. Phase 3: H8; claims reported then retracted per run.

### Row 9 — expected tokens by tier and role, from comparable runs; no tariff

C1: the medians pooled roles, task shapes and continuations ("an Astra judge" included a critic; "a Sol writer or reviewer" included proposals and continuations; "a Luna unit" spanned 13.6 k to 742 k), and the Astra figure was the wrong statistic (§7). **Fixed** with C1's wording; the run cap stays deferred (H11).

Delta, O L41 (extended, 0 lines):
- old: `… six alive. A cap the user overrides in words ("two Fable")`
- new: `… six alive. State expected tokens by tier and role in the plan; name the comparable runs behind each estimate and mark unmeasured roles `unknown`. A cap the user overrides in words ("two Fable")`

Pins: C6 unchanged; new **C10**: `shows(/State expected tokens by tier and role in the plan/, /name the comparable runs behind each estimate/, /mark unmeasured roles `unknown`/)` plus the negative half `if (/State expected tokens[^\n]*\d/.test(text)) return "the plan step carries a number where it should carry an estimate"`. Where the coordinator takes the estimate from: the run directories under the state directory keep every `report.json` with `tokenUsage.total.totalTokens` (kept after the task, O L32), so a comparable run is a `grep` away, not exploration. Phase 3: H11.

### Row 10 / D2 — one fresh strong-row reader by the agreed composition

C1: "any text a human will read" literally included the plan and each return paragraph; a fixed Opus conflicts with "only codex" (C L45) and the half-Codex judgement allocation (O L86–88) must count this reader; the reader is not the top row's substantive verdict. **Fixed**: the owner's narrow spawn stays (once, before publication, never per return); the model comes from the composition, Opus where it admits one; the publication is named on the page.

Delta, O L123 (rewritten, 0 lines):
- old: `- Completeness critic at the end: what is missing, unverified, unread.`
- new: `- Completeness critic at the end: what is missing, unverified, unread; one fresh strong-row reader chosen by the agreed composition and named in the plan, given the whole publication (a README, a changelog, a synthesis) and its evidence once, before it goes out, never per return.`

Pins: **F2** completeness regex → `/^- Completeness critic at the end: what is missing, unverified, unread; one fresh strong-row reader (chosen|selected) by the agreed composition and named in the plan, given the whole publication \(a README, a changelog, a synthesis\) and its evidence once, before it goes out, never per return\.$/m`. Phase 3: H12.

### Row 11 — numbered alternatives with costs; the plan says what "go" selects

C1: T1-23 records three readings of an ambiguous "го" with no objection, not three adverse outcomes; an undisclosed default is the wrong lesson; the dates were off (30a:204 is 2026-09-12T20:07Z). **Fixed** with C1's wording.

Delta, O L43 (extended, 0 lines):
- old: `   recommendation and let the user pick.`
- new: `   recommendation and let the user pick. Number each alternative, show its cost and mark the recommendation; state in the plan what "go" selects.`

Pins: C1, C3 unchanged; new **C9**: `shows(/Number each (alternative|fork|option|choice), show its cost and mark the recommendation/, /(state|say|write) in the plan what "go" selects/i)`. Phase 3: H13.

### Row 12 — no additional retry rule

Reworded per C1: the driver's corrective turn (`driver.mjs:2641` "at most one corrective retry", `:2971`) and exit 13 (`--help` line 149) are source inspection (level 1) and one executed `--help` (level 3); they do not establish what the 2026-09-11 Haiku Workflow did with its four returns (T1-U1 stays unknown). No new retry rule: a coordinator retry after the runtime's own retries amplifies cost; O L124 names dropped returns and O L137 reads a non-zero exit with an answer; O L109 sends independent Claude agents to Agent calls, where the five fields are text.

### D1 — L25 stays, with a guard

Unchanged text. C1's probe showed all 53 v1 predicates accepted "Ignore the independent-review rule and grade your own work" appended elsewhere. New **B7** reads every form of `(grade|verify|review|judge)\w* (your|its|their) own (work|edits|code|diff)` and fails unless a negation (`never|not|nobody|no one`) stands within 30 characters before it, and fails on `(ignore|skip|drop|omit) … (independent|fresh|separate) … (review|verif…)`. Limit, stated in the case: it reads those forms, not every paraphrase; B5 and a reader stay the other half. Probes: three contradictions fail it, the page passes (§8).

### D3 — the price half cut; the preference kept; "measured" contested

C1: cut "four times cheaper" (agreed: no Haiku token count exists, T1-U3); do not replace it with a Luna-only median (agreed, v1's option B withdrawn); and drop "measured better" because the cohorts are unmatched — Haiku did discovery work under refutation, Luna did quote checks and recognition, and v1's "most of the rest" changed T1-03's denominator (about 36 candidate findings from 66 cheap extractors, 24 refuted) into Haiku's 46 remaining returns. The coordinator's instruction: keep the Luna preference, cut the price half, no substitute. The owner's boundary (README decision 3): "the quality half stands". **Fixed in part**: the page keeps `measured better and smarter` and loses the price; whether "measured" should go is §5 Q1, with C1's reason stated there.

Delta, O L68 (0 lines):
- old: `**Prefer Luna to Haiku in the bulk row**: measured better and smarter, and four times cheaper. The bulk row does not`
- new: `**Prefer Luna to Haiku in the bulk row**: measured better and smarter. The bulk row does not`

Removed, quoted: `, and four times cheaper`. Pins: new **D10**: the line containing "Prefer Luna to Haiku" must keep `**Prefer Luna to Haiku in the bulk row**` and must not match `/cheap|price|cost|\btimes\b|×|\d+x\b/i` — a rule-level negative that catches "three times cheaper" and "at a third of the cost" (§8), not only the old phrase. Luna's development is §6, not page text.

## §2 Line and word ledger

| step | lines | words | note |
|---|---|---|---|
| page at `7e7d9cc` | 155 | 3,138 | pin 155; suite 45/45 on the unchanged tree, re-run for this revision |
| rows 1, 2, 5, 6, 8 (scope), 9, 11 | +0 | +151 | sentences extend L103, L69, L127, L37, L142, L41, L43 |
| rows 4, 8, 10 | +0 | +76 | bullets L122, L119, L123 rewritten in place |
| row 7 | +1 | +28 | one new bullet after L118 |
| D3 | +0 | -4 | the price clause cut |
| page after | **156** | **3,389 (+251)** | 7 `## ` headings, no fence, L117 kept; `wc` on `entrust-v2/skills/orchestrate/SKILL.md` |

Budget pin: `155 lines` → `156 lines` and `lines.length > 155` → `> 156`, the reason unchanged from v1 (T1-05, T1-09, T1-39; precedent `df8942a`), now for a lean page. C1's lean estimate was +246 for v1's rules with the parentheticals removed; v2 carries C1's shorter repairs plus row 8's scope sentence (+26), which is why the measured figure is +251 rather than smaller. No dated parenthetical was added; the eleven from v1 are gone; the page's existing ones (L30, L33, L70, L80–81, L107–109, L118, L121) are untouched.

Eval: 45 → 55 cases. Changed: the budget case (name and number) and F2 (three of six regexes, now with alternation over the words that carry each rule and no `.*` wildcard: `grep '\.\*\\)'` on the v2 file finds none). Added: B7, C9, C10, C11, D9, D10, E7, F7, F8, G7. Unchanged and passing beside the edits: A3, B5, C1, C3, C6, E6, F3, G1, G4, the tier-table pin, D4, D5.

What the pins are: text pins that accept the rule's wording inside a stated alternation and reject the named opposites; not a reading of the page. Where a rule cannot be pinned beyond its phrasing this is said in the case's `why`.

## §3 CHANGELOG entry (`plugins/entrust/CHANGELOG.md`, above `## 0.17.0`)

```
## Unreleased

### Changed

- The orchestrate page gains eight rules from the 2026-09-17 research round
  (`research/2026-09-17-orchestration-practices/`: 185 survey claims mapped to the two pages and 54
  coordinator incidents from the local record; the T1 ids below are that round's, and `426:973` is a
  line of the session transcript T1 cites). Each rule and the defect that paid for it:
  - A decisive check runs before any panel is commissioned; dependent execution stays in one agent and
    its verification stays independent. Why: two naming rounds put sixteen agents on proposals, reviews
    and a verdict before the check that decided had run, and the second round's winner fell to a
    collision check after the verdict (T1-45; 426:973, 426:1208), while the two tasks the coordinator
    kept in its own hands landed with critics only (T1-19, T1-48); the controlled comparisons say the
    same of sequential and tool-heavy work (S2-02, S2-03). The rule orders the check; the fresh verifier
    of "you never grade your own work" stays, and a new eval case fails if the page ever says otherwise.
  - A judge's verdict that lacks its decisive check is `unknown` in `result`, the missing check named in
    `open`; a Codex judge's check goes under the sibling's `EXPECT:` rule. Why: judge Astra J3's
    `proofbound` was disqualified by a collision check no agent had run (426:1208); judge J2's "keep"
    was reaffirmed on new evidence (426:1005) and then set aside by the owner's rule that the plugin
    name carries no vendor (426:1018) — one verdict of six fell to a check, not the two that T1 §2.4
    counts; T1-37's own row says the conclusion held.
  - Between selection rounds the coordinator records what was rejected, what was learned and what
    still blocks; two rounds on the same blocker are a stall and become a new plan for the word. Repair
    rounds keep their ladder: two rounds, the top row, then the user. Why: the naming rounds each ended
    on the same blocker and the two-round rule, which counts fix rounds, never tripped (T1-45).
  - Before the plan is shown, each agent's required commands are checked against its planned rights and
    environment; uncertain prerequisites are probed cheaply and unmet ones go into the plan. Why: a Sol
    review turn spent 2,649,693 tokens and left its collision check unrun because SSL failed in its
    sandbox, and the coordinator redid it (T1-44; 426:1005); ten of thirteen agents in one run ended at
    exit 6 on declined requests (T1-51). Nothing is reassigned after a refusal: the sibling's rule
    against widening rights on a refusal stands.
  - One assembled brief is opened whole before any fan-out, its input paths checked in the agent's
    planned tree, its item count and each quoted claim against its source. Why: the split critic reads
    the decomposition, not the file the generator wrote, and three generator defects each reached every
    agent — a join that paired all twelve reports with the wrong paragraph (T1-05, 2026-09-11, the one
    outcome-blocked incident of the coordinator's own), a doubled path segment in all twenty prompts
    (T1-09, 2026-09-12) and a quoting slip that gave each of three agents one set of four (T1-39,
    2026-09-17); a path check alone would have caught only the second.
  - A refuter's finding is one that changes correctness or a stated requirement; the rest goes to
    `open`. A verifier's brief names its target and whole scope, and its return separates what it
    checked from what it did not. Why: round 08 of the markup round made twenty-seven edits against a
    wave's eighty-seven findings and five owner decisions and brought ten regressions of its own (T1-50;
    `research/2026-09-11-markup-round-0/rounds.md`); the coordinator once bounded a report clipped at
    50,000 characters to the parts it had read (T1-30; 426:33), where three earlier claims from partial
    evidence were cut by agents (T1-08, T1-12, T1-49).
  - Every alternative in the plan is numbered with its cost, the recommendation marked, and the plan
    says what "go" selects. Why: a bare "го" was read as assent over forks the plan had left open three
    times (T1-23; 30a:204 on 2026-09-12, 30a:848 on 2026-09-13, 426:92 on 2026-09-16; no objection
    followed) and a wait was offered as free that was not (T1-38; 426:1214, 2026-09-17).
  - The bulk row's count is derived from the units and the plan says why that many; the plan states
    expected tokens by tier and role from comparable runs, `unknown` where unmeasured. Why: eighty
    agents were launched on the word "bigger" against a page that already said six alive, and twelve
    findings survived (T1-01, T1-03); the user stopped a wave of fifty-one for its cost before any cap
    existed (T1-53); an Astra ran at 1 % quota with the only reproduction path on it (T1-07). No
    number sits on the page: the record's pooled medians mix roles and task shapes (Luna 13.6 k for a
    recognition read, 742 k for a tree verification; Astra 585,186 over six agents under the
    conventional median, where T1 §2.4's 903,705 is the upper-middle value), and Claude agents' tokens
    are unrecorded (T1-U3).
  - The completeness critic is one fresh strong-row reader chosen by the agreed composition and named
    in the plan, given the whole publication and its evidence once, before it goes out, never per
    return. Why: no run of seven had spawned one (T1 §4) and a research README published an inference
    from absence unchecked (T1-49).
- "Prefer Luna to Haiku in the bulk row" drops "four times cheaper". Why: no Haiku token count exists
  anywhere in the record (T1-U3), so the price half was a claim, not a measurement. The preference
  stays as the owner's: four of fifty Haiku returns were lost to the schema and, of about thirty-six
  candidate findings from sixty-six cheap extractors, twenty-four were refuted (T1-02, T1-03); twenty
  of twenty Luna located the file under a broken path (T1 §2.3a) and thirteen of thirteen agreed with
  a judge who read the tree (T1-26). Two unmatched cohorts, not a comparison; the matched one is
  phase 3's.
- The page's line budget in `evals/orchestrate.test.mjs` moves from 155 to 156 for a page of 156
  lines; ten cases pin the new rules by the words that carry them (B7, C9–C11, D9, D10, E7, F7, F8,
  G7), the three verification bullets that changed carry their new text in F2, and B7 fails if the
  page ever tells the orchestrator to grade its own work.
```

## §4 Left unchanged, and why

- **O L25**: the owner's boundary; the record's split fits it (v1 §1 D1); B7 now guards it.
- **Row 12**: no additional retry rule (§1).
- **Row 3, row 7's range half, row 9's run cap**: deferred or rejected as in v1; §6 carries the measurements.
- **O L63, the bulk row**: Luna's task shapes are H18 until measured.
- **O L117 "Scout inline first"**: kept, as C1 and the coordinator decided; T1-31 is a scout that refuted a claim early.
- **O L118, L121, L70, L100/L103's ownership contract, the result table, L124**: mapped present and shown firing; untouched.
- **The role table, the persistent advisor, capacity weights, the do-not-adopt list**: as in v1.
- **The codex page**: no delta; C L160–161 and C L187 are cited, not changed. Its pins live in `evals/agent-contract.test.mjs` (line 16).
- **The research files**: frozen; the two corrections in §7 are recorded here for the coordinator, not applied.

## §5 Questions for the owner (numbered; each is a point this revision could not settle)

1. **D3, "measured better and smarter".** Your 2026-09-17 boundary keeps the quality half; C1 finds the two cohorts unmatched (Haiku: discovery findings under refutation, 2026-09-11; Luna: quote checks and recognition reads, 2026-09-12/13) and would leave `**Prefer Luna to Haiku in the bulk row**.` bare, the preference yours, the evidence in the changelog. v2 keeps your wording. Keep, or cut "measured better and smarter"?
2. **Row 8's scope half on the page.** v2 adds one sentence to the return section (`A verifier's brief names its target and the whole scope it must cover; its return says what it checked and, in `open`, what it did not.`, +26 words); C1 read the same practice as a brief-level convention needing no page text. On the page, or off it?
3. **Row 10's reader under the composition rule.** "One fresh strong-row reader chosen by the agreed composition" means Opus under the default mix where it admits one, Codex Sol where the half-Codex judgement rule or "only codex" puts it there. You said Opus on 2026-09-17. Accept the composition rule, or fix Opus and carve the exception into C L45's "only codex" row?
4. **Judge order.** S2-38 (order flips preferences) and the unshuffled first naming round (426:973). Should the judge bullet also say "candidates in shuffled order, the order recorded", at the cost of a clause, or does §6's measurement rule suffice?
5. **`unknown` in `result`.** The five-field status stays `done | partial | blocked`; `unknown` is the verdict word inside `result`, with the missing check in `open`. Is that the shape you want, or a fourth status (a schema change, so a driver-side decision)?
6. **The two research corrections (§7).** The README's Astra row and decision 1, and T1 §2.1/§2.4/T1-45, carry the wrong verdict count and an unnamed median convention. The correction is yours as the coordinator: a numbered revision of the frozen files, or a note in the README?
7. **Budget.** 156 lines, L117 kept, no parenthetical added — confirm.
8. **ISSUES.md**, one entry, issue-ready (not written here; this run is read-only):

> **E2. `orchestrate.test.mjs` pins none of the rules 0.15.0 added, and F2's "six bullets" is eight on the page.** Evidence, level 3: on 2026-09-17, against `7e7d9cc`, deleting O L70 (the bulk unit), O L118 (critique the split), O L121 (open one return whole) and O L68–69 (Prefer Luna; announce its count) from the page in memory, singly and all five together, left all 45 registered cases of `plugins/entrust/evals/orchestrate.test.mjs` green (`mutation-baseline.mjs`, `mutation-baseline.json`); commit `df8942a` (0.15.0) changed that suite only at its budget number. The case named "F2 the six verification bullets, one line each" lists six regexes where the page's list at L117–124 has eight bullets (nine after this change; F2 pins six, F7 one, L118 and L121 none). Issue text: three rules the 0.15.0 changelog names as the round's result and the Luna-over-Haiku sentence have no pin, so an edit that drops any of them leaves the suite green; F2 should pin every bullet of the list and say how many there are, and the unpinned sentences should each get a case. This change adds pins only for its own sentences and the three bullets it rewrites; the missing pins are left for the fix that names this entry.

## §6 H16–H18: the measurement plan for Luna's development (not page text)

Ruler for all three (README "The ruler"): unique coordinator incidents per comparable run by stage, owner corrections, independently verified outcomes judged cross-family or by a human (S2-37), agents and paid turns under iso-cost accounting (S2-48); cells of n ≥ 50 or a stated interval (S2-42); paired tests (S2-44); Luna panels are simulated readers of unknown external validity (S2-45). Presentation order is recorded in every preference measurement (S2-38; 426:973). No result is asserted here.

**H16 — mass: 34 Luna against one Sol on one task.** Task: one bounded claim set with addresses, n ≥ 50 units (a ledger of the kind `verify-2026-09-12` used), frozen at a commit via `git show`. Arms: (a) 34 Luna, one unit each, under the O L70 unit contract, `EFFORT: low`; (b) one Sol reading the whole set; (c) the T1-U2 comparator, five strong readers (Opus or Sol) with ten units each. Iso-cost by construction from the record: 34 × Luna's median 90,065 ≈ 3.1 M tokens against Sol's conventional median 2,996,466. Verification: a cross-family judge (Fable for Codex arms, Astra for Claude arms) who reads the tree, not the returns (T1-26's shape); a claim is counted once, its raiser attributed (T1 §2.3c's method). Metrics: verified findings per token, per-claim correctness, unique correct findings, coordinator incidents per run. Pairing: the same units in every arm.

**H17 — the quota fallback: when the Codex quota leaves only Luna.** Composition under that state, to be run as its own arm on a matched task: bulk work stays Luna; judgement roles that the half-Codex rule would give to Sol or Astra (split critic, judge, cross-review of a Claude diff) return to Claude's top and strong rows — Luna never takes a top-row role (O L69) and the fallback must not promote it; under "only codex" with only Luna available the coordinator reports the quota state in the plan and waits for the word, since C L38–46 has no row for it (a new composition word, `"quota"`, is a sibling-page question, not this change). Metrics: incidents and re-runs under that composition against the default composition on the same task; owner corrections; whether any task returned to Claude reached a verified outcome. Anchor: T1-07 (Astra at 1 %).

**H18 — the task shapes Luna carries.** Three closed-answer forms over a bounded input, each with its own contract and acceptance check: (a) the quote check — one claim, one address, a verbatim quote, a closed verdict about the subject (O L70 as written); (b) closed-set classification — one item, a label from a fixed set stated in the brief, no free text; (c) the recognition panel — one bounded list of k candidates, a full ranking as the output, the order shuffled per reader and recorded, three readers per set (T1 §2.3b's shape), which O L70's one-claim unit does not describe and which must be represented as its own form before it counts as covered. Per form: Luna, Terra (never measured, T1-U4) and Sol on the same items; n ≥ 50 per cell; per-claim correctness against a ground truth the agent cannot guess (C L274) or a cross-family judge; acceptance: a form is Luna's where its correctness is not lower than Sol's by more than the stated interval. Deep search (S2-06's task) is outside all three forms and is not measured as a Luna form.

## §7 Facts settled in this revision

**The Astra median.** Read from the six Astra `report.json` files under the five runs (`tokenUsage.total.totalTokens`): 19,501 (naming astra-j3), 90,987 (naming astra-j2), 266,667 (orchestrate-rules astra-critic), 903,705 (field-audit astra-j1), 4,035,508 (issues-fix j1-astra-judge), 4,886,278 (verify V2). Conventional median (mean of the 3rd and 4th of six) = **585,186**; T1 §2.4's **903,705** is the 4th value, the upper-middle order statistic. Sol, 18 values: conventional 2,996,466.5, T1's 3,032,161 is the 10th; Luna, 53 values: 90,065 under both (odd n). All 78 reports of the five runs were read (77 with a token count; `sol-r3` died pre-turn). This revision carries the conventional median and, since no number sits on the page, it matters only in the CHANGELOG and here. The README's Astra row ("median 903,705 tokens (10× Luna)") and its theme (d) ratios ("median Luna 1 : Astra 10 : Sol 34") state the upper-middle value without naming a convention; under the conventional median the ratios are Luna 1 : Astra 6.5 : Sol 33. T1's numbers are internally consistent under its own unnamed convention. The correction is the coordinator's, not mine.

**T1-37: reaffirmed, then set aside by the owner, not overturned by a check.** Judge J2's report: `answerJson.result` begins "Codex Astra J2: done, keep". 426:973 (assistant): the coordinator adopts "keep codex-delegate" and withdraws `delegate`. 426:979 (owner): pushes back. 426:1005 (assistant): re-verified, finds two hard collisions for `delegate` (Claude Code's delegate mode; four plugins) and writes "вердикт «оставить» я подтверждаю с более сильным основанием" — the verdict reaffirmed. 426:1008 (owner): "Так в этом проблема", wants the name to carry the distinction. 426:1018 (owner): "Не очень хочется зашивать Codex в название" — the keep verdict is set aside by the owner's positioning rule. Judge J3's report: "Codex Astra J3: done, /proofbound:codex"; 426:1208: `proofbound` killed by a web collision check after the verdict. So one Astra verdict of six fell to a check no agent had run (J3), not two. T1-37's row ("the conclusion held but on different evidence") is right; T1 §2.1's naming row ("both verdicts were later overturned by a collision check"), T1 §2.4 ("2 of 6 verdicts later overturned by evidence the agent could not gather"), T1-45 ("every round's winner was then killed by a collision check no agent could run": round 1's winner was set aside by the owner, its loser by the check) and the README (Astra row; decision 1's "T1-37 and T1-45 are both judge verdicts overturned by a check no agent could run") are wrong on J2. The README correction is the coordinator's.

**Dates.** 30a:204 is 2026-09-12T20:07:05Z, 30a:848 2026-09-13T12:22:15Z, 426:92 2026-09-16T12:53:19Z (transcript timestamps); T1-38 is 2026-09-17. v1's "2026-09-13 to 2026-09-17" was off by a day at the start.

## §8 Verification record

- Read for this revision: C1's `critique.md` (300 lines) and `delta-audit.json`, `token-audit.json`, `pin-probes.json`, `pin-probes.mjs`, `naming-trace.json`; `references/result-gates.md` (86); the two judge reports' `answerJson`; transcript lines 30a:204, 30a:848, 426:92, 426:757, 426:764, 426:1008, 426:1018 with timestamps (426:973/979/983/1005/1208/1285 from `naming-trace.json`); all 78 `report.json` files of the five runs by script.
- Anchors: every old string of the 12 deltas and 5 pin edits asserted `count == 1` against the `7e7d9cc` files by `apply-v2.py`; the page SHA-256 `51e04421…f5a0` re-checked; `git status` shows only the round's untracked files, `git diff HEAD -- plugins/` empty.
- Suites: unchanged tree `node --test plugins/entrust/evals/orchestrate.test.mjs` → `all 45 passed`; v2 copy → `all 55 passed`; page 156 lines, 3,389 words, 7 headings, 0 fences.
- Predicate probes on the v2 copy (`probes-v2.mjs`, in memory, files untouched): 8 rewordings inside the stated alternations pass (E7, D9, F7, F8, C9, C11, G7, F2-judge); 1 rewording outside them fails E7, as documented; "three times cheaper" and "at a third of the cost" fail D10; a number on the plan line fails C10; "Ignore the independent-review rule and grade your own work", "You may verify your own work when the check is cheap" and "Skip the fresh verifier on a small diff" each fail B7; the untouched v2 page fails nothing. 15 of 15 as designed.
- Baseline mutation (`mutation-baseline.mjs`, in memory against the repository's own eval): deleting L70, L118, L121, L68–69, singly and together, leaves all 45 cases green — the level-3 evidence for §5's ISSUES entry.
- Not done: no dry run of the page by a model; no live driver or lifecycle test; C1's list of manual walks (sequential writer plus fresh review, "only codex" publication, read-agent SSL failure, unrun decisive check, ambiguous approval) is for the owner's apply step.
