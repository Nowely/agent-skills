# C1 adversarial critique of D1's orchestrate design

Codex Astra C1: done, reviewed all eleven adopted deltas, the inherited contract and cited research, independently ran the evals, and recommend **2 keep / 9 fix / 0 drop**.

The proposal needs revision before the owner receives it as an evidence-backed design. Several useful rules are justified by local incidents; the largest problems are the scope of the single-agent rule, the automatic rights fallback, incompatible critic composition, and measurements copied from an internally inconsistent research summary. Passing pins establish that the proposed text is present. They do not settle those problems.

Numbering below follows the design's shortlist rows **1, 2, 4–11, D3**, not `apply.py`'s separate D1–D11 numbering. Row 10 also implements owner decision D2. Unadopted rows 3 and 12 and owner decision D1 are assessed in section 6. “Keep” means keep the substantive rule; the common recommendation to move incident parentheticals out of the page applies to all rows. Severity labels concern the design, not observed execution of this proposed page.

All O and C quotations below are from **git 7e7d9cc**, respectively `plugins/entrust/skills/orchestrate/SKILL.md` and `plugins/entrust/skills/codex/SKILL.md`. They were extracted with `git show` and verified with fixed-string `rg`. The worktree is at that revision. Contrary to the task's starting assumption, the main checkout was clean at **4f593a5f523464ce884bc9a40127198cb3ed5279**, so I did not take baseline quotes from its files. The research mapping uses dff2f0b; I translated its citations to 7e7d9cc.

## 1. Evidence

The repository's levels are: 1, a line resolves; 2, independent code reading supports the claim; 3, the behavior was made to happen. A transcript-backed incident is evidence of that event, not a controlled measurement that a new sentence prevents recurrence. C0 and R explicitly make the proposed prevention mechanisms hypotheses. D1 sometimes collapses those distinctions.

| Delta | Verdict | What the cited evidence supports, and where the design exceeds it | Severity |
|---|---|---|---|
| 1 | **fix** | S2-02 concerns tightly sequential constraint satisfaction; S2-03 is an associative tool-intensity result; S2-12/13 are narrow iso-call comparisons. T1-45 supports running a decisive check before spending on candidates. H1 explicitly tests **check before panel**, not **never panel**. T1-19 used two critics and T1-48 used three agents: neither is a no-review comparator. The universal whole-task ban exceeds both the studies and its local examples. | **blocks the proposal** |
| 2 | **keep** | S2-05 supports choosing width rather than maximizing it, not a universal best count. S1-14 and S3-59 supply heuristics. T1-01/53 justify stating the number and its reason before spending; T1-U2 leaves optimal width unknown. Unit-derived count is a reasonable local policy, not a measured yield improvement. T1-26 is documented successful coverage, not proof of wasted agents. | **note** |
| 4 | **fix** | T1-37/45 justify withholding an unsupported verdict; S1-40 and the sibling's evidence gate support an explicit decisive check. S2-37/38 concern self-preference and order bias, which `EXPECT:` does not repair. S2-46 is executor-specific authorization evidence, not a general guarantee that a matching command proves a judgment. The parenthetical's two overturned verdicts is contradicted by the underlying trace. | **blocks the proposal** for the measurement; **must fix before apply** for gate semantics |
| 5 | **fix** | M1/M2, S1-51 and T1-45 support noticing repeated blockers and replanning. S2-09 removes a bundle of ledgers; its −31% result does not isolate a threshold of two or the predicate “winner not adopted.” Lack of adoption can include useful rejection and learning, which C0 explicitly says is not waste. The exact threshold and human escalation are design choices. T1-46 is correctly acknowledged as unanswered. | **must fix before apply** |
| 6 | **fix** | S2-30 supports separating policy generation from permission audit under AuthBench's conditions; it did not test this command checklist. T1-44 supports an environment preflight; T1-51 records declined requests, not ten proven lost outcomes. No cited study or incident shows that write rights cure SSL failure, or authorizes broader rights after refusal. A command inventory alone does not establish executability. | **blocks the proposal** |
| 7 | **fix** | S1-08 and T1-05/09/39 are a strong local rationale for inspecting the assembled input. S3-09/19/46 describe input mechanisms, not effectiveness. Resolving paths addresses T1-09, but existing paths do not detect the wrong report/paragraph pairing in T1-05 or omitted items in T1-39. Make those checks explicit. Rejecting the quantity-range half is reasonable. | **must fix before apply** |
| 8 | **keep** | S1-37 directly supplies the bounded-finding rule. T1-50 is a plausible local anchor, although its regressions were the writer's qualifications, not proof that all 87 findings were bad. S2-08 evaluates structured verification, not this exact finding predicate. The independent-verification and conservative-refutation rules remain. | **note** |
| 9 | **fix** | S1-15 and T1-01/07/53 justify visible expected token accounting; S3-35 and S2-15/16 do not validate these estimates or require weights. The quoted medians mix roles, task shapes and continuations. Re-deriving all 78 reports gives Astra's conventional median **585,186**, not 903,705; the latter is the upper middle observation. The same convention error affects Sol's exact median. | **blocks the proposal** |
| 10 / D2 | **fix** | S1-44 is a rationale about a citation pass, not a test of a completeness critic. T1-49 and T1-50 supply local incidents, T1-20 supplies successful independent correction, and the owner explicitly authorizes the narrow reader. No evidence isolates Opus as the best tier. The owner supplies that preference; composition and publication timing still need a consistent contract. | **must fix before apply** |
| 11 | **fix** | T1-38 supports showing an option's real cost. T1-23 records three readings of ambiguous “go,” with no owner objection; it does not demonstrate a beneficial new approval convention. S1-50 is a rationale about irreversibility; S1-52 poses a human-intervention problem and its numerical claim was not audited by S2. Numbering and an automatic default are interface choices. Disclose the default to the person in the plan. | **must fix before apply** |
| D3 | **fix** | Removing “four times cheaper” follows T1-U3 and the owner's boundary. Keep the owner's Luna preference. The new wording changes “most candidate findings” into “most of the rest” of Haiku's returns, a different denominator. Unmatched Haiku discovery work and Luna quote/recognition work do not measure comparative intelligence. H3/H16–18 remain experiments. | **blocks the proposal** for the new measured wording |

**Which adopted deltas have no recorded incident?** None of the eleven is wholly incident-free: every one names at least one T1 event, and D3 answers T1-U3 plus the page's unsupported price assertion. However, the universal ban in row 1, the numerical stall predicate in row 5, automatic reassignment to a writer in row 6, the exact Opus choice in row 10, and “go selects the recommendation” in row 11 are not established by those incidents. Row 10's leading external claim is RA; its mandate comes from the owner and local publication failures, not a controlled comparison. Row 11's defaulting convention is a rationale/interface choice with no demonstrated prevented incident.

**Which do-not-adopt rows matter?** The direct violation is “measured without a trace behind each half”: D3 preserves a comparative measurement unsupported by a matched comparison and corrupts the denominator; rows 1/4/5 repeat an inaccurate naming narrative; row 9 mislabels an order statistic and role mix. Deferring calibration while retaining a broad Luna endorsement risks the prohibited extension to uncalibrated deep search (S2-06/S2-18), but the design does not explicitly instruct deep search. Do not claim it does. The proposal does not introduce debate, a standing advisor, handoffs, a phase-role catalogue, or majority-vote verification; those exclusions are sound.

## 2. Breakage and exact repairs

The old text in each replacement below is **D1's proposed text**, identified as such. Baseline quotations are separately labeled O/C and come only from 7e7d9cc. All replacements omit the new dated parenthetical; move the corrected incident and trace to the Unreleased changelog. Unchanged text surrounding the replacement stays intact.

### Delta 1 — fix the unit of non-delegation

Baseline O25: `| synthesise, attributing every finding to the agent that produced it | verify: you never grade your own work, a fresh agent does |`

Baseline O103 begins: `Allocate inside those bounds by judgement, not to fill a band. Several writers at once is how a task goes faster:`

Baseline C35: `4. Knowing the answer is not a reason to skip a requested second opinion.`

A task whose implementation is sequential can still require a fresh verifier or a requested panel. D1's “one agent's or your own and never a panel's” operates on the whole task, colliding with the design-panel bullet O122, the design band O97, and the owner's retained review rule. “Your own” also exceeds the existing allowance for a quick edit requiring no exploration (O23). This is a semantic weakening even though B5 and E6 remain green.

**Old → new:**

`A task that turns on one check, or whose steps each wait on the last, is one agent's or your own and never a panel's` → `Run a decisive check before commissioning a panel. Keep dependent execution in one agent; keep its verification independent.`

This follows H1, retains T1-19's two critics and T1-48's reviews, and leaves explicit user composition authoritative. Cost: one bounded check before a panel and the existing independent review, not a new standing panel. Actual saved turns are unknown.

### Delta 2 — keep the unit-derived count

Baseline O69: `count against the alive cap and never takes a top-row role; announce its count before spawning, like any other fan-out.`

The added rule preserves that count announcement and the separate bulk cap. No return, composition or permission change follows. Retain `a count derived from the units with the plan saying why that many`; remove the anecdote under the common lean treatment. Specify concurrency and total tasks separately in the actual plan where batches matter, rather than inventing another cap here.

Cost: one reason in a plan. The design's rationale says T1-01 preceded the cap, but T1-01 itself says the 0.13.0 page already had six alive. Correct that history in the design; the new count rule does not depend on claiming the cap was absent.

### Delta 4 — fix evidence semantics, not the return schema

Baseline O122: `- Judge panel for a design task.`

Baseline C187: `| `EXPECT:` | `<regex>` | the answer is only evidence if a command matching it ran AND succeeded; a matching command that exited non-zero does not count, and none matching is exit 5. Do not point it at a check whose failure IS the finding |`

Baseline O145: `    status:    done | partial | blocked`

The proposal need not change the schema: a judgment can be unknown while the agent has completed its assigned review. But it must not imply `status: unknown`, or that adding an `EXPECT:` header supplies the missing evidence. The gate is Codex-specific, checks execution/success, and cannot establish collision freedom from an arbitrary successful network query. `result-gates.md` documents the matching-comment and pipeline-status limitations. A negative check can be the finding; blindly success-gating it is wrong under C187.

**Old → new:**

`a verdict that rests on a check the judge could not run is `unknown`, or the brief gates that check with `EXPECT:`` → `a verdict missing its decisive check is `unknown` in `result`; name the missing check in `open`. Use the sibling's `EXPECT:` rule for a Codex check`

The status enum and gate-verdict handling remain intact. Cost: a real decisive check, or an honest unresolved result. Neither another judge nor a regex removes that cost.

### Delta 5 — distinguish selection stalls from repair escalation

Baseline O126–127: `Fix, then cross-review, at most two rounds; then escalate to the Fable agent or the `gpt-6-astra` agent, and to the user only when` / `that round fails too.`

D1's new clause applies “between rounds” without a clear domain boundary. Two repair rounds can produce no adopted winner and simultaneously require a top-row repair attempt and a stop for a new human-approved plan. Outside candidate selection, there may be no winner at all. Conversely, two rejected candidates can have yielded valuable elimination evidence.

**Old → new:**

`Between rounds, say what the last one adopted and what changed; two rounds whose winners were not adopted are a stall, and a stall is a new plan shown for the word, not a third round` → `Between selection rounds, record the candidates rejected, the evidence gained and the remaining blocker. Two rounds repeating the same blocker are a stall: show a new plan and wait for the word`

Keep O126–127 unchanged for fix/cross-review loops. The two-round selection threshold remains a policy to test in H6, not a measured optimum. Cost: short progress accounting and a human stop on an unchanged blocker; no automatic extra top-tier round. C0's definition of useful elimination evidence is preserved.

### Delta 6 — remove the automatic rights fallback

Baseline O37: `1. Load the sibling skill with the Skill tool if it is not loaded yet, scout, then decide the composition and the agents.`

Baseline O27: `Scouting is the only repository exploration you do, and targeted bounded checks stay allowed inline after it; report a failed agent and never backfill it. The run directory is`

Baseline C160–161: `widens a write agent, as does removing a `NETWORK: no` the user settled: settle each with the user before` / `adding it, and never translate a refusal into broader rights. Every field is in`

The clause “a command they refuse makes the check yours ... or a write agent's” can be read as post-refusal reassignment, contradicting no-backfill and the sibling's explicit refusal rule. Pre-launch selection of already approved write rights is legitimate, but that is not what this automatic wording cleanly says. Network access already exists at read level (C150/C157); wider filesystem rights are not an SSL repair. An exit-6 answer may remain useful (T1-27); a blanket “refused turn” account should not replace reading it.

**Old → new:**

`For each agent, list the commands its check needs against what its rights row and the sandbox allow: a command they refuse makes the check yours, under the redirect rule, or a write agent's, never a read agent's refused turn` → `For each agent, check the required commands against its planned rights and environment. Probe uncertain prerequisites cheaply; put unmet prerequisites in the plan`

C146's smallest-rights rule and the existing plan approval then decide the allocation. This avoids assuming a paper inventory proves SSL works. Cost: a cheap prerequisite probe where needed, not an attempted full expensive check for every agent. Unknown prerequisites stay explicit; no actual rights transition was exercised in this review.

### Delta 7 — inspect the input contract as well as paths

Baseline O118 begins: `- Critique the split before the fan-out: a top-row agent reads the decomposition, not the subject, for what the cut lost, what the wording added, which items are two and which the fan-out's rights cannot decide;`

Baseline O70 begins: `The unit of a bulk fan-out is one claim, one address, a verbatim quote, and a verdict from a closed set that describes the subject and never the brief:`

One sample is proportionate to these common generator failures. But “resolve every path it names” includes intended output paths and deliberate nonexistent-path probes (T1-28). The reading must use the agent's planned tree, since O46–48 says a worktree starts at HEAD and lacks live edits. Existing input paths still do not establish correct pairings or item counts.

**Old → new:**

`Open one assembled brief whole before the fan-out and resolve every path it names by a command: the critic reads the split, not the file your generator wrote, and a defect there reaches every agent` → `Open one assembled brief whole before the fan-out; check its input paths in the agent's planned tree, its item count and each quoted claim against its source`

This complements the paid split-critic rule rather than replacing it. Cost: reading one assembled brief and bounded input checks per fan-out. It detects sampled common defects; it does not prove every heterogeneous brief is correct. No extra mandatory paid critic is introduced.

### Delta 8 — keep the bounded finding

Baseline O119: `- Adversarial verify: a refuter defaults to `refuted` when it is uncertain.`

D1 preserves the refutation default and adds `a finding is one that changes correctness or a stated requirement, the rest its `open``. That fits O149's `open:      questions and risks` without altering the schema. “Correctness” includes material unrequested risks, so the rule does not suppress the cross-plugin break in T1-36 or grounded out-of-brief findings in T1-29. It also leaves dissent readable rather than silently discarding it.

Cost: no extra agent; some optional material still consumes `open`. The claim that this reduces regressions is H8, not established by the chronology of T1-50. Keep the rule, move the correctly stated incident counts to the changelog.

### Delta 9 — ask for estimates, not a permanent tariff

Baseline O41: `   Announce the composition here, and the caps beside it in a sentence: your own model, one Fable and one `gpt-6-astra` at a time, six alive. A cap the user overrides in words ("two Fable")`

Accounting fits the owner's boundary. The parenthetical does not: it offers pooled historical totals as “a Luna unit,” “an Astra judge” and “a Sol writer or reviewer.” Astra includes a critic; Sol includes proposals and continuations; Luna combines recognition with tree verification. Total tokens also include the token categories the reports count, not a monetary price or remaining quota.

**Old → new:**

`Beside them, what the run is expected to spend, by tier and role (measured over five runs to 2026-09-17, Codex tokens per agent at the median: a Luna unit 90 thousand, an Astra judge 900 thousand, a Sol writer or reviewer 3 million; a Claude agent's count is not recorded).` → `State expected tokens by tier and role in the plan; name the comparable runs behind each estimate and mark unmeasured roles `unknown`.`

Cost: retrieving and interpreting comparable reports. Where that cannot be done cheaply, `unknown` is the correct number. No weights, automatic admission price, or new cap follows. The existing caps stay unchanged.

### Delta 10 / D2 — make the narrow critic compatible with the plan

Baseline O123: `- Completeness critic at the end: what is missing, unverified, unread.`

Baseline O38 starts: `2. Show the plan and stop, in the user's own language and in ordinary words:`

Baseline O54 includes: `After any agent returns, Claude or Codex, write one short paragraph of your own, in the user's language and naming the agent by its model, in the same shape for both sides,`

Baseline C45: `| “only codex”, “all codex” | every agent, including a one-agent task |`

“Any text a human will read” literally includes the first plan and each return summary, while “at the end” and “never per return” do not. Do not spawn a critic to approve the plan before permission to spawn. Name the reader in the plan, give it the complete publication draft and its supporting evidence, and use its one review before publication. Do not replace the top row's substantive verdict with a strong-tier prose check. A fixed Opus conflicts with “only codex”; the default half-Codex judgment allocation must count this reader too, rather than silently excluding it.

**Old → new:**

`one Opus reader of any text a human will read, spawned once before it is published and never per return` → `one fresh strong-row reader selected by the agreed composition; include it in the plan and give it the complete publication text and its evidence once, before publication, never per return`

Here “publication text” means the human-facing deliverable—README, changelog, synthesis, proposal bundle—not coordination messages. This is the operational interpretation needed to satisfy the owner's narrow-spawn boundary. Keep Opus as the default where the agreed mix admits it; question 4 should settle the page's general wording. One reader can review the complete bundle; do not multiply readers by file or return. Cost: one paid read and one publication barrier per planned bundle. Its marginal benefit has not yet been measured (H12).

### Delta 11 — disclose what approval selects

Baseline O42–43: `One plan when there is one; when several approaches are viable, show them all with a` / `   recommendation and let the user pick.`

Baseline O44: `3. The user's "go" covers only what the plan listed. After it, live-tree implementers write in the live working directory and an`

Merely listing alternatives and marking a recommendation does not tell the owner that a generic approval settles every open fork. The proposal converts the near-miss's interpretation into a standing convention without requiring that convention to appear in the actual plan. It is a defensible UI choice if disclosed, not a result from S1-52.

**Old → new:**

`Every fork left in the plan is a numbered choice with its cost beside it and the recommendation marked, so that "go" alone takes the recommendation and a number takes another` → `Number each alternative, show its cost and mark the recommendation. State in the plan what "go" selects`

This retains the owner's choice and the separate live-commit authorization. Cost: one clear sentence in the plan, avoiding an extra question when the plan already makes approval unambiguous. T1-23 does not establish that any of its three interpretations was wrong; do not claim three adverse outcomes.

### Delta D3 — retain the preference, remove the manufactured comparison

Baseline O68: `**Prefer Luna to Haiku in the bulk row**: measured better and smarter, and four times cheaper. The bulk row does not`

**Old → new:**

`**Prefer Luna to Haiku in the bulk row**: measured better (2026-09-11 to 2026-09-13: four of fifty Haiku returns lost to the schema and most of the rest dead under refutation; twenty of twenty Luna quoted the right file under a broken path and thirteen of thirteen agreed with a judge who read the tree itself).` → `**Prefer Luna to Haiku in the bulk row**.`

The quality preference remains the owner's policy. Put the distinct, bounded observations in the changelog: four Haiku schema failures; the cheap-wave candidate findings mostly refuted; Luna's file recovery and agreement on the cited tasks. They do not form a matched quality or price experiment. This is a cut, not a qualification clause. Cost: none. Comparative price remains unknown, not replaced by an unrelated single-tier median. Develop mass, task forms and quota fallback in the revised design as section 6 describes.

### Rules paid for by earlier incidents

No literal delta deletes the independent-verification rule, file ownership, cross-review, result ladder, split critic, whole-return inspection, or “no silent caps.” Keep that fact distinct from the semantic weakening above. O103's ownership and final-verifier sentences survive; T1-24, T1-25 and T1-36 paid for those rules. O118 and O121 survive; T1-13/52 and T1-10/16 paid for them. The conservative refuter survives; T1-03 showed it firing. The result table is untouched; T1-27/28/43 paid for reading gate answers and the relaunch ladder. O124 survives; T1-29/47 paid for naming omissions.

The optional deletion of O117 would remove `- Scout inline first: the work-list is yours, before any fan-out.` T1-31 is a successful early scout refutation, so this is not valueless text. Its rule also remains at O22/O27/O37, hence deletion is not a complete semantic loss, but there is no evidence that losing the checklist reminder is free. Prefer the explicit one-line budget change after shortening the additions.

## 3. Budget and the eleven dated parentheticals

Independent reconstruction of `apply.py`'s literal replacements exactly reproduced both modified files without executing that mutating script.

| Measure | Baseline | Proposed | Change |
|---|---:|---:|---:|
| Lines | 155 | 156 | +1, 0.65% |
| Whitespace words | 3,138 | 3,672 | +534, **17.02%** |
| New dated parentheticals | 0 | 11 | 288 words, **53.93% of added words** |
| Lean proposal, deleting just those parentheticals | 3,138 | 3,384 | +246, **7.84%** |
| Verification bullets | 8 | 9 | +1 |

The accounting is disclosed, so it is not a hidden line-count deception. But calling ten expansions “zero lines” exploits a weak proxy: the added line has 74 words; the judge bullet grows from 7 to 45 words, completeness from 11 to 50, and plan step 1 from 23 to 86. O103 grows from 159 to 210 words. F2's own rationale says “a bullet that grew into a paragraph is a bullet that stops being read.” The design meets the rewritten literal ceiling while defeating that reading contract.

**Severity: must fix before apply** for the page-density/voice defect; the disclosed line ledger itself is not dishonest. **Budget verdict: choose the lean variant and explicitly approve 156 lines, retaining the scout bullet.** The exact repaired page should be recounted; 3,384 is the designer's rules with parentheticals removed, not a measurement of my proposed repairs. There is no supplied lean page or lean diff: `lean.txt` contains only `11 288 534`. Do not describe the lean wording as separately eval-verified. Moving faulty statements to CHANGELOG does not make them valid; correct or cut them first. Keep the changelog under **Unreleased**, with each change tied to its defect and trace.

M1/README says page text is only 2.1% of the measured context pool; I did not re-derive that analysis. The objection here is instruction density, the owner's terse voice and pin honesty, not a claim that 534 words consume the run's dominant resource.

| Delta / parenthetical | Trace assessment | Required disposition |
|---|---|---|
| 1: sixteen agents; each winner fell to collision checking | The 9+7 agent count is in transcript 426:973/1208. **The universal outcome is false:** 426:1005 confirms J2's “keep” verdict on stronger evidence; it does not kill it. T1-45 conflicts with T1-37 and the primary trace. | Drop the generalized outcome; retain the two-round count and late-check incidents separately in the changelog. |
| 2: eighty launched, twelve kept; fifty-one stopped | T1-01/03/53 provide trace locators and counts. This is historical observation, not verified marginal benefit or loss per agent. | Valid bounded incident account; move off page. Correct D1's separate “both preceded the cap” rationale. |
| 4: two of six judge verdicts overturned | T1 §2.4 repeats it, but T1-37 says “the conclusion held but on different evidence.” Primary 426:1005 explicitly confirms it. J3's proofbound verdict really was disqualified at 426:1208. | Cut “two of six”; describe one disqualification and one evidentiary repair. Do not infer a population error rate from this audit. |
| 5: three rounds each crowned a winner and adopted none; fourth yielded the name | T1-45 supplies this summary, but its round-one account is already inaccurate, and the cited primary lines do not establish three comparable judge rounds. A proposal was publicly agreed by the coordinator at 973 and later reopened. | Exact round/adoption count **unknown** under a consistent definition; reconstruct it before publication or drop it. |
| 6: 2.65M tokens on a sandbox-blocked collision check, coordinator redid it | Sol N2's report has 2,649,693 total tokens; T1-44 and 426:1005 locate the SSL problem and redo. This is the **whole review turn's** token count, not an isolated check cost. | Retain only “the review spent 2.65M tokens and left the check unrun”; move off page. It proves no benefit from write rights. |
| 7: twelve wrong joins, twenty doubled paths, three incomplete briefs | T1-05/09/39 provide explicit traces. These are distinct input defects. | Trace-backed historical facts; move off page and make input pairing/count checks part of the rule. |
| 8: 27 edits, 87 findings, 10 regressions | The round-07/08 rows of the markup ledger state these numbers; the 27 edits also incorporated five owner decisions. | Trace-backed chronology, not causation by the critic's scope; move off page. |
| 9: medians 90k / 900k / 3M | Recomputed from all 78 report files: Luna n=53 median 90,065; Astra n=6 median **585,186**; Sol n=18 median **2,996,466.5**. T1 used the upper middle observation for even n (903,705 and 3,032,161). The rounded Sol 3M survives; Astra 900k does not under the conventional median. Role labels also overstate the grouping. | Remove from page; correct and document the statistic in research/changelog before citing it. Values are pooled total tokens, not prices. |
| 10: no standalone completeness critic in seven runs; README inference | T1 §4 identifies the absence in its seven-column role inventory, and T1-49 cites the published confession. The wider ledger also includes earlier sessions, so keep the corpus boundary. | Trace-backed within that inventory; absence is not measured proof that a new Opus pass prevents the incident. Move off page. |
| 11: three ambiguous go events dated Sep 13–17; wait not free | Raw timestamps: 30a:204 is **Sep 12**, 30a:848 Sep 13, 426:92 Sep 16. T1-38 is the Sep 17 wait correction. The three events had no recorded owner objection. | Correct the date range to Sep 12–17, distinguish ambiguity from realized harm, move off page. |
| D3: four of fifty lost; “most of the rest” refuted; Luna 20/20 and 13/13 | Four schema losses, Luna file recovery and agreement have trace locators. “Most of the rest” implies the remaining 46 returns; T1-03 actually discusses ~36 candidate findings from 66 cheap extractors and says most survivors came from verifiers. No matched Haiku/Luna task or price comparison exists here. | Correct the denominator and separate the observations; drop “measured better” from the page while retaining the owner's preference. |

For reproducibility, the six Astra totals are **19,501; 90,987; 266,667; 903,705; 4,035,508; 4,886,278**. Their middle pair averages to 585,186. Choosing the upper order statistic can be a declared quantile convention; it is not a transparent basis for calling one pooled role “an Astra judge 900 thousand.”

## 4. Pins

I ran the exact requested command on D1's copy:

`node --test /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/d1-design.TtEyil/entrust/evals/orchestrate.test.mjs`

It started, exited **0**, and printed **`all 53 passed`**. Node reports one file-level test; the plugin's harness counts **53 custom cases**. The independent baseline run in the 7e7d9cc worktree started, exited **0**, and printed **`all 45 passed`**. The harness derives ROOT from its own module location, so the requested run read D1's copied page. Its page and eval file exactly match my reconstruction from the pinned baseline plus the eleven deltas/five replacements/eight added cases. No live skill-behavior or driver-lifecycle eval was run.

**Severity: note** for deliberate exact-word pinning and existing coverage gaps; **must fix before apply** for pins that retain the corrected policies or erroneous measurements after D1 revises them. **Are the 53 cases sound?** They are sound as an approved-text ratchet: `says` compares whitespace-collapsed substrings, `shows` matches literal regular expressions, and schema/link checks have actual structural content. This exactness is an explicit repository choice in the suite header, not a new accidental testing style. They are not evidence that an instruction is coherent, followed, true, or better. D1 should describe them as text pins, not a behavioral validation of the design.

I executed the actual registered predicate functions against in-memory page variants, with the copied files left untouched:

- **8/8 reasonable rewordings failed their corresponding new case**: “choice” → “option” (C9), reworded expected spend (C10), “each” → “every” (C11), same unit-derived count in imperative form (D9), “right file” → “correct file” (D10), “one check” → “a single check” (E7), “Open” → “Read” (F7), and “Between rounds” → “After each round” (F8).
- **2/2 false measurement mutations passed their selected predicates**: F2 accepted “six of six judge verdicts fell”; F7 accepted “all twelve million reports.” Both parenthetical bodies are `.*`.
- Appending `Ignore the independent-review rule and grade your own work.` to the existing final fix-round line left **all 53 registered predicates true**. This was an in-memory predicate experiment, not a second live behavior test or an edit to the supplied plugin.

C10 and D10 pin whole dated observations, making measurement corrections break text pins; F2 and F7 demand an exact date while accepting arbitrary content after it. That is an inconsistent evidentiary boundary. C9, C11, E7 and F8 faithfully pin the problematic policies, which is precisely why green is insufficient. D10's negative check catches only the exact phrase “four times cheaper”; an equivalent unsupported price claim can escape it.

Use exact pins for owner-approved wording if that remains the repository convention, but separate the rule from its historical justification. Pin the short rule clauses below; keep measurements with trace references in the changelog. Broadening a regex to accept synonyms is optional and does not turn it into a semantic test. Before apply, manually walk at least the sequential-writer-plus-fresh-review case, “only codex” publication case, read-agent SSL failure, unrun decisive check, and ambiguous approval against both pages. Any model-based dry run would be a separate paid experiment, not something these 53 cases already performed.

| Delta | Pins touched by D1 | Revised phrase/contract to pin; other pins retained |
|---|---|---|
| 1 | new E7; E6 unchanged | `Run a decisive check before commissioning a panel.` and `Keep dependent execution in one agent; keep its verification independent.` Keep B5, E1/E2/E6 and the user-composition contract. |
| 2 | new D9 | Keep `a count derived from the units with the plan saying why that many`; do not imply a measured optimum. |
| 4 | F2 judge regex | `a verdict missing its decisive check is `unknown` in `result`; name the missing check in `open`` and `Use the sibling's `EXPECT:` rule for a Codex check`. Keep G1's status enum and F4. Remove the required date wildcard. |
| 5 | new F8; F3 unchanged | `Between selection rounds, record the candidates rejected, the evidence gained and the remaining blocker.` and `Two rounds repeating the same blocker are a stall: show a new plan and wait for the word`. F3 remains the repair escalation rule. |
| 6 | new C11; A3 unchanged | `For each agent, check the required commands against its planned rights and environment.` and `Probe uncertain prerequisites cheaply; put unmet prerequisites in the plan`. Keep C2/C3 and B6. |
| 7 | new F7; budget | `Open one assembled brief whole before the fan-out; check its input paths in the agent's planned tree, its item count and each quoted claim against its source`. Remove the date wildcard. Budget 155 → 156 only with the recounted concise page. |
| 8 | F2 adversarial regex | Keep the original `refuted` default plus `a finding is one that changes correctness or a stated requirement, the rest its `open``; remove the date wildcard. |
| 9 | new C10; C6 unchanged | `State expected tokens by tier and role in the plan; name the comparable runs behind each estimate and mark unmeasured roles `unknown`.` No permanent numbers. |
| 10 | F2 completeness regex | `one fresh strong-row reader selected by the agreed composition` and `include it in the plan and give it the complete publication text and its evidence once, before publication, never per return`. Retain the missing/unverified/unread question. |
| 11 | new C9; C1/C3 unchanged | `Number each alternative, show its cost and mark the recommendation.` and `State in the plan what "go" selects`. Do not encode undisclosed assent. |
| D3 | new D10 | `**Prefer Luna to Haiku in the bulk row**.` Retire the unsupported price phrase; keep provenance outside this pin. |

**The missing-pin issue is real but partly mislabeled.** At baseline, F2 pins six of eight bullets; after this proposal it still pins six of nine, with F7 separately pinning the new one. The three existing unpinned rules—O70 bulk unit, O118 split critique, O121 whole-return inspection—have paid incidents. Record that gap separately under CLAUDE.md rather than silently widening this proposal. The F2 title/rationale inconsistency is now also directly touched by D1's growing bullets, so describe its retained limitation honestly. D1's §5 item 8 says “E2” (a label) and “evidence level 3,” but a grep returning zero proves string absence, not behavioral regression; deleting a rule in a scratch copy and observing the still-green suite would establish that stronger test-coverage claim. I did not run those three deletion mutations.

## 5. Recommendations on the owner's questions

1. **Parentheticals:** use the lean page; put corrected incidents and trace locators in the Unreleased changelog. Eleven inline histories add 288 words, several are inaccurate, and none proves the new rule's effect.
2. **The extra line:** approve **156** after shortening; keep O117's scout reminder. One explicitly bought line is preferable to deleting a paid checklist rule or hiding another paragraph on an existing line.
3. **The medians:** omit fixed numbers from the page; estimate tokens from comparable task/role reports in each plan and use `unknown` for missing data. Astra's published median is wrong under the conventional definition; all three are task-confounded.
4. **The critic's model:** use **one fresh strong-row reader chosen by the agreed composition**, with Opus the default where allowed. It obeys “only codex,” keeps one narrow reader, and avoids treating prose completeness as the top-tier technical verdict.
5. **The price half:** cut it; reject option B. Luna's 90,065 pooled median is not a relative price. Keep the Luna preference, separate the task-specific observations, and develop H16–18 without asserting their results.
6. **The command inventory:** keep it internal in step 1; show unmet prerequisites, necessary rights and their cost in ordinary words in step 2. A raw command inventory would conflict with O39's user-facing plan contract and obscure the decision.
7. **Stalls:** selection stalls go to a revised plan and the user's word; repair loops retain the existing two rounds → top row → user sequence. Do not spend another top-row round merely because the same decisive check is still unavailable.
8. **The issue for ISSUES.md:** record the unpinned-rule gap separately, with level 1/2 for source inspection and level 3 only for a demonstrated mutation passing. Preserve the existing paid rules now; repair coverage in its own named change. This critique remains read-only, so it supplies the issue evidence without editing ISSUES.md.

## 6. Omissions and implications of the contradictions

**Owner decisions.** Keeping O25 is correct. R §6.1 P1 and its mapping still call S1-39 a strict contradiction, but the later README and rounds correction resolve it: checking an agent's evidence inline is allowed, grading one's own work is not. The proposed row 1 must not accidentally reopen that settled boundary. Making the completeness reader an actual narrow planned spawn is also correct, with the scope/composition repair above. Cutting the unmeasured price is necessary; replacing it with an uncalibrated quality comparison and ignoring Luna's requested development is not a complete answer.

**H16–H18 need a concrete design, not new unmeasured page promises — must fix before apply as a scope omission.** The owner identified mass, quota fallback and task forms as the development direction. D1 defers all three in one sentence. Revision should specify: H16's matched 34-Luna versus one-Sol task and independent verification; H17's composition when Codex quota leaves only Luna, which tasks return to Claude and what happens under “only codex”; H18's bounded input and closed-answer contracts for quote checks, classification and recognition. Do this in the design/measurement plan, not as capacity weights or a claim that 34 Luna equals one Sol. Existing O70's universal one-claim/address/quote contract does not describe a recognition reader ranking several names; name how that task form is represented before claiming it is covered. A quota fallback must never quietly promote Luna into a top-row judgment role. Classification quality, optimal width and the fallback outcomes remain unknown.

**Row 3's deferral is reasonable, with a boundary.** S2-06/S2-18 and R §6.1 P2 prohibit assuming cheap-tier success transfers to deep search. They do not justify paying for an ad hoc calibration panel before every already bounded quote check. Keep H3/H18 as matched measurements; make new task forms and the acceptance check explicit in the design. The two Luna/Haiku historical cohorts are not that calibration.

**Row 8's scope half deserves a small adoption in briefs — note.** S1-40's early-victory warning is only partially covered by a `CHECK:` label and test count. A count does not identify the agreed target or suite. T1-30 successfully bounded a clipped report to the parts actually read; T1-08/12/49 show the danger of overclaiming from partial evidence. Name the verification target and completion criterion in each existing `CHECK:` brief, and distinguish checked from unverified in the existing five fields. This does not require a universal full-suite command, another agent, or another page paragraph. The design should not dismiss the scope requirement merely because the local overclaims belonged to the coordinator.

**Row 12 should be “no additional retry rule,” not “this Claude incident is fully solved by Codex.”** The driver does contain `if (errs.length && outputAttempts < 2) { startCorrectiveTurn(errs); return; }` at 2971; source inspection supports the existing corrective-turn mechanism. It does not establish the behavior of the Haiku Workflow that lost four returns. Independent Claude calls now avoid that specific Workflow path, but permitted scripted chains still use schemas, and S3-52 reports existing retries. An extra coordinator retry after runtime exhaustion can amplify cost. Keep no new retry rule, explicitly preserve failed-return content and omissions through O124/O137, and leave the old four missing returns' contribution unknown (T1-U1). No live schema-retry test was run here.

**R §6.1 P4/P10 and §6.3 R9 matter more than a generic rights checklist.** Quota at 1% (T1-07) makes automatic stronger-tier escalation a feasibility decision, not just an arithmetic estimate. Declined approvals are deliberate in this unattended driver; inventory cannot turn S3-24's pause-for-human mechanism into an available channel. T1-27 is successful handling of exit 6, so optimizing exit-6 count alone could reward hiding requests rather than better outcomes. Measure completed checks and useful outcomes alongside declined requests. Row 6 must retain reporting and the no-widening rule.

**R §6.1 P3/P5/P6/P7/P9 and §6.2 do not collapse to universal policies.** Closed-answer sampling (S2-19) is distinct from majority-pressure synthesis (S2-25); keep both possibilities separate in Luna's recognition experiments. The conservative refuter bias and bounded findings can coexist. Full trace sharing is a rationale for tightly coupled co-writers; it is not a reason to give every independent verifier the writer's whole reasoning. The large-team integrator/green-gate failures concern hundreds of workers, not a license to remove local paid cross-review. Conversely, calling every run “six alive” ignores the separately allowed bulk pool; distinguish worker writes from read-only bulk width when applying the scale argument. The current six-agent cap remains the owner's default, as the README resolves R10.

**Judge bias remains unaddressed — note, not a demand for another standing judge.** Rows S2-37/38 are cited for row 4 but its execution gate does not control self-preference, order or verbosity. Mandatory double judging is not established: S2-43 reports doubled cost without removing position bias. However, the primary naming transcript at 426:973 expressly says the existing name was first and the order was not shuffled; later rounds at 1208/1285 did shuffle. Thus “no local incident” is too broad if it means no local exposure at all. Keep evidence gating, record presentation order in future preference measurements, and avoid claiming judge validity has been solved. Whether order changed that outcome is **unknown**.

**No role catalogue or persistent advisor should be added now.** H10/H14 have no local incident attributed to their absence; S2-11's narrow result cannot displace the paid split critic in T1-13, and S2-29 is a multi-turn proxy rather than a direct advisor test. H9's continuation/fresh comparator and H15's single-agent/no-delegation comparator belong in the measurement phase. D1 correctly refrains from turning these hypotheses into a standing cost.

**Research corrections must precede promotion to page facts.** R11's trace rule applies to each newly dated sentence, not merely the old price half. The Astra quantile convention, T1-37 versus T1-45 verdict inconsistency, Sep-12 approval date, and Haiku-return versus finding denominator need correction in D1's evidence and changelog. Preserve the frozen research files; record these as issue-ready corrections for a later numbered revision under the repository's process. Do not fix the research corpus inside this page proposal.

### Verification record and limits

- Fully read: D1 `design.md` **300 lines**, `page.diff` **60**, `eval.diff` **76**, `apply.py` **99**, `lean.txt` **1**; baseline O **155**, C **321**, baseline eval **453**; modified page **156** and eval **491** (reconstructed exactly and read through their baseline plus complete deltas); worktree `CLAUDE.md` **24**.
- Research read: README **85 lines**; C0 **51**; T1 **349**, including **54 incidents and 4 unknowns**; S1 **133** with **60 claims**, S2 **86** with **48 claims**, S3 **161** with **80 claims**; rounds **20**. R-synthesis is **756 lines**: read mapping §2, contradictions §6, shortlist §7, hypotheses §8, audit/disagreements §1.1–1.3 and the applicability/theme material in §§3–5; the 185-row merged claim inventory was not needed as a second copy of the survey rows.
- Additional reads: result-gates **86 lines**, adversarial-review **37**; eval README **lines 1–110 of 250**; markup-round rounds **lines 1–28 of 226**; CHANGELOG **lines 1–25**; driver **2634–2646, 2955–2983, 3005–3020**. These are source inspections, not newly executed behavior claims.
- Independently read **78 `report.json` files' model/token/exit metadata** across the five named agent-skills runs; the 77 reports with model/token values are 53 Luna, 18 Sol, 6 Astra. Re-derived totals and medians are in `token-audit.json`.
- Read **9 specific transcript records**: 426:973/979/983/1005/1208/1285 and 30a:204/848 plus 426:92. The naming excerpts are saved in `naming-trace.json`; approval timestamps are reported above. No unrelated transcript content was used.
- Quote greps: `rg -n -F -f orchestrate-needles.txt orchestrate-7e7d9cc.txt` verified **31 phrases/31 matching lines**; the corresponding codex command verified **11/11**. Every old replacement anchor occurred **once** in the git-show baseline; **11/11** page anchors and all five pin-replacement anchors matched. Logs and reconstruction hashes are in this artifact directory.
- Evals observed this turn: modified **53/53 custom cases**, baseline **45/45**, both exit 0; no skipped custom cases reported. Ten selected in-memory pin probes and the separate 53-predicate contradictory-append check are recorded in `pin-probes.json` and reproduced by `pin-probes.mjs`.
- No external source was fetched, no web search used, no subagent spawned, and no file outside this C1 temporary directory was written. Primary papers were assessed through the supplied survey quotes, conditions and audit records, not independently re-fetched. Every shell command invoked in this critique started and exited 0; there is no failed-command diagnostic to report.
- Unknown: causal improvement from these edits; a consistent exact three/four-round naming count; comparative Haiku/Luna price or matched quality; per-role prospective token cost; the best stall threshold; quota fallback outcomes; the real effect of judge ordering; actual agent compliance with the revised prose. The role of a publication bundle in the owner's “any text” boundary is an operational interpretation, not a newly observed owner instruction.
