# Codex Astra J2 — three README judging sheets
Judging inputs: `judge-tail.md` in the supplied run was read in full; `candidates/what-broke.md`, `00-original.md`, and A/B/C were read. Candidate names are anonymous labels. No candidate/model mapping, current other-judge sheet, or writer-identity material was read. The two historical 2026-09-10 judging records were read only because audit C39–C42 cite them as evidence about that earlier experiment.

Checkout: branch `terse-process-2026-09-22`, HEAD `214fb0dfc796f0e3a666e0f8d0810168ffa8aca3`. The 24 implementation files (three skill pages, eleven references beside them, seven scripts, three manifests) are byte-identical to `2f29a8f`. The supplied original is byte-identical to the checkout README. The pre-existing dirty audit edit changes only “eight scripts” to “seven scripts” at audit:13; it does not alter a ledger verdict. No repository file was written.

Numbered candidate references, such as A:57–59, refer to the supplied A.md, not the old README. Absence judgments cite the corresponding surviving section. C01–C46 are the named audit’s entries, not claims created by this judge. L1 means the line exists; L2 means the code/instructions say it; L3 means a behavior was actually exercised. A quoted historical audit run is identified as supplied evidence, never as my new run. Normative descriptions of skill instructions remain L2. The explicit permission to retain an unconfirmed statement without strengthening it is applied; unchanged unconfirmed statements are not silently upgraded to confirmed.

Primary count: 17 distinct repair targets. Q2/C15/C16 are combined because the same write-boundary repair answers all three; C20/C21 are combined because installed Node is one prerequisite defect. TB remains separate because its criterion expressly requires executing the repaired recipe. The four adversarial findings are included, with the plausible staging finding labelled as such. Removing a refuted assertion counts as a textual repair; it is not evidence of improved reader performance. Partial targets earn no full repair point. This is a document/code judgment, not a fresh-reader re-audit.

No candidate-specific prerequisite inventory, author cut ledger, or author execution log was supplied with the three candidate files. Their completeness is unknown. I do not substitute guessed author reasons. Prerequisite rows below reconstruct only requirements visible in the supplied profile, failures, and code.

Sources: abbreviations below are repository-relative paths under `/Users/ruliny/Git/agent-skills`; all current code citations use the identical `2f29a8f` contents. `what-broke:N` is the supplied run’s `candidates/what-broke.md`. `8c041b7 RW:N` is the historical Git object, not current RW.
- `AU` = `plugins/terse/skills/audit/SKILL.md`
- `RW` = `plugins/terse/skills/rewrite/SKILL.md`
- `RT` = `plugins/terse/skills/rethink/SKILL.md`
- `TP` = `plugins/terse/skills/audit/references/truth-pass.md`
- `ME` = `plugins/terse/skills/audit/references/measure.md`
- `LE` = `plugins/terse/skills/audit/references/ledgers.md`
- `RP` = `plugins/terse/skills/audit/references/reader-profile.md`
- `BO` = `plugins/terse/skills/rewrite/references/bake-off.md`
- `WR` = `plugins/terse/skills/rewrite/references/writing-rules.md`
- `LO` = `plugins/terse/skills/rewrite/references/loop.md`
- `CB` = `plugins/terse/skills/rewrite/references/critic-briefs.md`
- `MS` = `plugins/terse/skills/rewrite/references/measurements.md`
- `ST` = `plugins/terse/skills/rethink/references/stages.md`
- `CK` = `plugins/terse/skills/rewrite/references/curse-of-knowledge.md`
- `ROUND` = `plugins/terse/skills/rewrite/scripts/round.mjs`
- `LEDGER` = `plugins/terse/skills/rewrite/scripts/ledger.mjs`
- `SEED` = `plugins/terse/skills/audit/scripts/ledger-seed.mjs`
- `RULE1` = `plugins/terse/skills/rewrite/scripts/rule1.mjs`
- `DUP` = `plugins/terse/skills/rewrite/scripts/dup.mjs`
- `SECTIONS` = `plugins/terse/skills/rewrite/scripts/sections.mjs`
- `SELF` = `plugins/terse/skills/rewrite/scripts/selftest.mjs`
- `PKG` = `plugins/terse/package.json`
- `PLUGIN` = `plugins/terse/.claude-plugin/plugin.json`
- `MARKET` = `.claude-plugin/marketplace.json`
- `PA` = `plugins/terse/references/prior-art.md`
- `CHAIN` = `research/2026-09-10-chain/README.md`
- `OLDJ2` = `research/2026-09-10-chain/run-2x5/o8eHzS6U.answer.md`
- `OLDJ1` = `research/2026-09-10-chain/run-2x5/v04PR6HL.answer.md`
- `DESIGN` = `research/2026-09-10-chain/run-2x5/v04PR6HL.prompt.txt`
- `CORPUS` = `research/2026-09-10-chain/run-2x5/zP378l2j.prompt.txt`
- `AUDIT` = `research/2026-09-22-terse-process/audit-2026-09-22/audit.md`

## Candidate A

| Row | Judgment, candidate lines, deciding evidence |
|---|---|
| new false claims | VETO — A:57–59 says every claim added by an edit gets an executed check. ROUND:66–67,85 skips undeclared claims; RW:132 permits no verifier; audit C14 explicitly records this hole. My claimless-edit probe wrote a new behavioral guarantee, exit 0, ledger []. A:26–36 with A:71–76 also leaves the installed-revision contradiction unresolved (what-broke:47; 8c041b7 RW:66–67,110–113). |
| protected passages | VETO for strengthened evidence ceiling at A:57–59 (audit C14; AUDIT:1036–1040; what-broke:60). The four working passage groups themselves survive: install A:26–31, pipeline A:14–16, outputs/word A:43–46,60–64, and non-compression/numbers A:82–84 (C05/C07/C14/C18/C19/C23/C24). |
| failures repaired | 14/17 documented targets repaired; 2 partial (TB A:71–76; temporary re-audit A:19–21), 1 not repaired (release A:26–36,71–76). Detailed source-by-source count below; no new reader score claimed. |
| prerequisites | Mixed at A:5–9,19–21,33–36,60–78,93–94: runtime/auth, scope, write location and exclusions answered; release identity and temporary re-audit unresolved. Original writer inventory unavailable; comparison below is reconstructed, not an invented author inventory. |
| cuts justified | Unknown for every cut: no author cut ledger supplied. A:48–51 omits original:27–29’s 44-word rethink anecdote; A:82–90 omits original:55–56’s 29-word predictions. Candidate text gives neither cut a stated author reason. Audit C25/C26 explains why the latter was eligible to cut, not what the author recorded. |
| length | Original:1–90 = 933 whitespace-delimited words; A:1–126 = 1,389 (+456). Reported only; no selection weight. |

### Repairs, one target at a time

| Target | Result and candidate line | Why | Deciding source |
|---|---|---|---|
| F01: Q2 + C15/C16: repository writes and directory position | repaired; A:71–76 | Checkout boundary now stated; release scope separately F14 | RW:66–79,149–154; LO:41 |
| F02: Q7 missing language/non-code scope | repaired; A:8–9,93–94 | Scope, weaker check, and English-only mechanical limit | AUDIT:19–22,1010–1018; AU:25–27; TP:73–80 |
| F03: TB harmful workflow: recipe repaired AND run end to end | partial; A:71–76 | Branch recipe described; directory formula tested, full rewrite task not run | what-broke:24–29; AU:131; RW:66–79,149–154 |
| F04: C12 stop rule, non-disjoint lenses, scoring | repaired; A:53–64 | Owner decides stop; lenses differ; skeleton purpose distinguished | RW:174–175,188–192; BO:128–129 |
| F05: C13 every attempted round retained | repaired; A:57–64 | Universal retention claim removed | RW:125–144; ROUND:38–40,54 |
| F06: C20/C21 Node dependency on both routes | repaired; A:33–35 | Installed and checkout routes named | PKG:4–6; AU:159–161; RW:83–87 |
| F07: C27 prohibition means no cut/weakening, not no edits | repaired; A:86–90 | Protects and permits false-claim correction | WR:21–23; BO:60–63,113–114 |
| F08: C30 two experiments and correct scope | repaired; A:98–101 | Two experiments, separate corpora | CHAIN:1,16; CORPUS:9–15 |
| F09: C39 actual 2×5 design | repaired; A:113–118 | Four standards including draft plus control pair | DESIGN:13–24 |
| F10: C41 opening tally | repaired; A:116–118 | 5/1/3/1, only shortened control | OLDJ2:6,10–19 |
| F11: C45 two benchmarks both large | repaired; A:120–122 | False claim cut | PA:104–107 |
| F12: C46 exhaustive review coverage | repaired; A:121–122 | Exhaustive claim narrowed | AUDIT:C46; PA:87–133 |
| F13: C44 limit before results | repaired; A:98–107 | No-document warning before counts | AUDIT:C44; ME:70–81 |
| F14: L3 actual installed revision and write boundary | not repaired; A:26–36,71–76 | Advertised commands and unconditional outside-repository promise have no version boundary | what-broke:47; 8c041b7 RW:66–67,110–113 |
| F15: L3 host authentication | repaired; A:33–34 | Signed-in host required | what-broke:48 (C20 supplement) |
| F16: L3 external-tool recipe exclusion | repaired; A:5–6 | Explicit exclusion at first truth-pass claim | TP:66–71; what-broke:49 (C02 supplement) |
| F17: L3 temporary candidate links and comparison staging | partial; A:19–21,64 | Apply-first route works after consent; no temporary-tree validation route | ME:35–37,49,108–115; what-broke:50–52 |

### Every original ledger claim, including removed and unconfirmed claims

| Entry and subject | Candidate disposition and line | Code and original evidence status |
|---|---|---|
| C01: Product measures answers and proposes repairs | A:3–6: retained, L2 | AU:69–100; RW:188–192; PLUGIN:1–10; confirmed L2 |
| C02: Fresh readers, truth coverage, line/cause | A:4–9: removes universal coverage and expressly excludes external recipes; still a described method, not proof of every run | AU:56–67,89–92,123–131; TP:66–80; unconfirmed L2 |
| C03: Three skills | A:11: retained | AU:1–11; RT:1–11; RW:1–12; confirmed L3 in supplied audit |
| C04: User invocation, none starts itself | A:11: same guarantee, not strengthened; runtime remains unknown | AU:7,164–165; RT:7,82–83; RW:8,21; unconfirmed L2 |
| C05: Skeleton/audit → rewrite → candidate/diff → audit | A:14–21: preserves pipeline; applies before re-audit; temporary validation still unspecified | RT:70–83; RW:14–21,188–192; ME:108–115; confirmed L2 |
| C06: Profile, code-derived key, one Markdown reader per question | A:40–43: retained; adds baseline arm accurately | AU:46–59,69–100; ME:28–60; confirmed L2 |
| C07: Score, failed questions, five causes | A:43–46: retained and explains score delta | AU:120–131,153–165; LE:7–41; confirmed L2 |
| C08: Audit proposes no wording | A:45: “never” retained, not upgraded to observed enforcement | AU:18–19; LE:113–114; unconfirmed L2 |
| C09: Rethink comparisons, terms, structure before prose | A:48–50: retained | RT:13–15,25–68; confirmed L2 |
| C10: Skeleton contents and wait | A:50–51,78: retained; storage unspecified is correctly disclosed | RT:70–83; confirmed L2 |
| C11: Rewrite accepts skeleton or audit | A:53–54: retained; does not claim these are the only routes | RW:14–30; confirmed L2 |
| C12: Pool, scoring, lenses and stop | A:53–60,63–64: repairs stop and disjoint-lens claim; distinguishes skeleton scoring | RW:54–62,131–175,188–192; BO:21–29,128–139; refuted old formulation |
| C13: Every attempted round retained | A:57–64: removes universal retention claim; no promise that failed attempts survive | RW:125–144; ROUND:38–40,54; refuted L3 |
| C14: Handover and evidence behind all claims | A:57–63: NEW OVERSTATEMENT: each added claim supposedly has an executed check. Undeclared additions bypass checks and ledger; reproduced, exit 0, ledger []. This strengthens C14 | RW:103–118,131–144,188–208; ROUND:66–67,85,107–119; unconfirmed (coverage only L2) |
| C15: Own run directory and its position | A:69–76: explicitly outside repository; correct for checkout, unqualified installed route remains F14 | RW:66–79; AU:30–44; confirmed with Position defect in old audit |
| C16: No repository writes without word | A:71–72: now matches branch instructions; advertised-install scope still false/unsupported at 26–36 | RW:66–79,149–154,191–192; LO:41; old refutation superseded by branch change |
| C17: All fan-outs announced with count/model, wait | A:66–67: retained general announcement claim, not evidence of enforcement on auxiliary spawns | AU:86–87; RT:30–31,56–57; RW:60–62,131–135; BO:22; LO:107–108; unconfirmed L2 |
| C18: Slash install commands | A:26–27: verbatim commands retained; revision distinction absent through 36 | MARKET:2,18–24; PLUGIN:1–10; audit C18 plus what-broke:47 |
| C19: Shell install commands | A:30–31: verbatim retained; same release gap | MARKET:2,18–24; audit C19 plus what-broke:47 |
| C20: Nothing else/dependencies/account | A:33–36: requires signed-in host and Node; no npm/config and optional entrust match evidence | PKG:1–7; AU:159–161; RW:83–87,147–148; what-broke:48; refuted old statement |
| C21: Node only for checkout | A:33–34: both routes, declared >=22; actual Node 22 execution unknown | PKG:4–6; AU:159–161; RW:83–87; refuted L3 |
| C22: General effect: truer and easier | A:82–90: generic effect guarantee cut | ME:3–6; PA:130–132; unconfirmed L2 |
| C23: Not a compressor, length not selection/gate | A:82–84: preserves point and expands correct selection/budget explanation | BO:113–118,136–139; RW:95–98,123; SECTIONS:4,25; confirmed L2 |
| C24: 2725 → 2571; second -105, third +105 | A:82–84,98–99: keeps all four numbers; date appears in measurement section | CHAIN:20–34; audit C24 confirmed L3 |
| C25: False long text necessarily shortens | A:82–90: removed | MS:109–119; audit C25 unconfirmed L2 |
| C26: Hard subject stays long and becomes right | A:82–90: removed | WR:21–23; BO:118; audit C26 unconfirmed L2 |
| C27: Never touch a condition/limit/warning | A:86–90: corrects to no cutting/weakening with correction of false statements | WR:21–23; BO:47,60–63,113–114; refuted L2 |
| C28: Preserve independent-decision repetition | A:86–90: states fixed rule, not measured enforcement | WR:21–22; DUP:4–6; LO:124–131; unconfirmed L2 |
| C29: Keep measurement date/numbers | A:88–90: states rule, not measured enforcement | WR:22–23; RW:212–215; unconfirmed L2 |
| C30: All data from one run/one README | A:98–101: explicitly distinguishes two experiments and corpora | CHAIN:1,16,36–48; CORPUS:9–15; refuted L2 |
| C31: 3/6 → 6/6, departures 1 → 0, controls | A:103–107: retains reported numbers, adds missing-reader-record warning; not independently confirmed | ME:125–128; audit C31 unconfirmed L1 |
| C32: Six questions, one trial each | A:105–107: retained, warning that raw reader answers absent | ME:3–6; audit C32 unconfirmed L1 |
| C33: Conditional McNemar p=.25 | A:105–107: correct conditional calculation; input counts remain unconfirmed | PA:92–95; audit C33 confirmed L3 computation |
| C34: Two of six failures were false claims | A:108–109: retained; no resolution of missing failure-to-question mapping | ME:125–128; audit C34 unconfirmed L2 |
| C35: Reader repeated two false guarantees | A:108–109: retained, still unconfirmed; underlying reader response and original software absent | TP:27–36; audit C35 unconfirmed L2 |
| C36: Clarity self-report ran against truth | A:110–112: retained, sized to three observations; no primary answers | AU:102–105; ME:62–65; PA:97–100; unconfirmed L1 |
| C37: Two confident wrong, one confused right | A:110–112: retains counts and limits to three observations | AU:102–105; PA:97–100; unconfirmed L1 |
| C38: Neither skill asks about clarity | A:112: retained absolute description, not strengthened or empirically verified | AU:102–105; ME:46–65; CB:135–166; unconfirmed L2 |
| C39: Five published standards vs controls | A:113–118: correct four standards plus control pair and draft status | DESIGN:13–24; audit C39 refuted L2 |
| C40: Both controls beat both standards universally | A:114–116: judge-specific result now matches both rankings | OLDJ2:3; OLDJ1:3; audit C40 unconfirmed L2 |
| C41: Seven unchanged, only control shortened | A:116–118: correct five unchanged, one punctuation, three longer, one control 116→97 | OLDJ2:6,10–19; audit C41 refuted L2 |
| C42: Ten agents, one run/passage, one per cell | A:118: sample limits retained | DESIGN:13–20; OLDJ2:6; confirmed L2 |
| C43: Pass attribution and bake-off advantage unmeasured | A:120: retained | ME:130–132; BO:8–11; confirmed L2 |
| C44: No no-document arm; qualification position | A:98–107: warning moved before numerical results | ME:70–81; PA:104–107; audit C44 confirmed + Position |
| C45: Both benchmarks found large prior knowledge | A:120–122: deletes unsupported benchmark generalization | PA:104–107; refuted L2 |
| C46: Prior art collects every criticism | A:121–122: narrows to records an adversarial review; no “every” | PA:87–133; audit C46 refuted L2 |

### Added or materially reframed claims

| ID | Candidate line and claim | Code / ledger | Judgment and evidence level |
|---|---|---|---|
| A-N01 | A:4: Readers are model agents that have not seen project | ME:40,46–50; C02/C06 | Supported L2 brief, not independently observed model history |
| A-N02 | A:19–21: Audit existing document, rethink missing/wrong shape, apply before re-audit | RW:14–21; RT:4–6; ME:108; C05 | Supported L2 route; temporary validation remains partial F17 |
| A-N03 | A:33–36: Host login, PATH, Node, no npm/config, entrust fallback | PKG:1–7; RW:83–87,147–148; BO:26–29; C20/C21 and what-broke:48 | Supported at source level; sign-in observation is supplied critic evidence, not my host run |
| A-N04 | A:42–46: First audit has no-document arm, score difference, perfect baseline stop, audit.md output | AU:94–100,120,149–165; ME:95–96; C06/C07 | Supported L2 when “readers get every answer right” means baseline; the candidate leaves baseline restriction implicit at 46 |
| A-N05 | A:54–55: Four ordered passes on audit route | RW:34–43; BO:47–49; C12 | Supported L2 writer brief |
| A-N06 | A:57–59: Each added claim has a run check; failed match refuses round | ROUND:66–67,85–95; RW:131–144; C14 | REFUTED coverage at 57–58; claimless addition ran with exit 0 and empty ledger. Failed-match behavior itself supported and self-tested |
| A-N07 | A:59–63: Ledger rejects dropped/false sentences; each entry carries evidence | LEDGER:18–27; SEED:12–17,60–62; ROUND:112–119; C14 | Supported only for declared/seeded regex entries. Does not establish semantic coverage of all verified sentences |
| A-N08 | A:62–63: Evidence levels line/code/run | TP:12–19; C14 | Accurate level definitions, L2 |
| A-N09 | A:73–78: Outside run locations, printed path, user supplies audit path, unspecified rethink storage | AU:33–44; RW:29,66–79; RT:70–83; C10/C15/C16 | Supported L2; two environment branches of directory formula exercised |
| A-N10 | A:75–76: Uninstall deletion, keep-data exception, temporary purge, copy durable runs | AU:39–42; RW:74–77; no original ledger entry | Skill pages say this, L2; actual host uninstall lifecycle UNKNOWN. This new lifecycle assertion cannot be promoted to tested behavior |
| A-N11 | A:82–84: Length never chooses; budgets report, do not block | BO:118,136–139; SECTIONS:4,25; C23 | Supported; shipped self-test exercised over-budget exit 0 |
| A-N12 | A:86–90: Fixed writing rules and veto | WR:6–23; BO:113–114; C27–C29 | Supported as rules, L2; not proof that every model follows them |
| A-N13 | A:92–94: Scripts self-tested and exit-code recognition is English-only | RW:86–87; SELF:11–138; RULE1:29; Q7 code finding | 45 shipped checks observed; English “exits 2” => 1, Russian equivalent => 0 in targeted probes |
| A-N14 | A:107: Historical reader answers not in repository | AUDIT:C31/C32; chain/validation.json:19–21 cited there | Supported by supplied audit's missing-record finding; not a new experiment |
| A-N15 | A:124–126: MIT license | PLUGIN:8; plugins/terse/LICENSE:1 | Supported L2 |

### Prerequisites at the decision

| Reconstructed inventory item | Candidate evidence |
|---|---|
| Skill choice and invocation | A:11,14–21: session and starting routes explicit |
| Markdown, language and no-code scope | A:8–9,93–94: scope plus mechanical-language limitation |
| Install authentication/runtime | A:33–36: answered adjacent to commands, after them |
| Which revision the commands deliver | A:26–36,71–76: unanswered; unconditional boundary misleading |
| What truth pass excludes | A:5–6: external recipes excluded immediately |
| Output, location and applying consent | A:60–78: outputs and outside locations stated; includes durability warning |
| Temporary re-audit and fixed comparison inputs | A:19–21: apply-first and same questions; temporary path/key/model unstated |
| Instructions versus executable coverage | A:57–59: overstates all-added-claim coverage (C14; ROUND:66–67) |
| Reading results at their evidence level | A:98–118: pilot size, no-document arm and missing-reader-record warning; C34–C38 remain unconfirmed |

## Candidate B

| Row | Judgment, candidate lines, deciding evidence |
|---|---|
| new false claims | PASS within checked evidence — B:40–43 scopes the check to declared/pinned claims (ROUND:66–67; LEDGER:18–27; C14); B:51–55 describes instructions, and B:73–76 bounds those instructions to checkout 2f29a8f versus recorded main 8c041b7 (what-broke:47; historical RW:66–67,110–113). B:92–96 attributes unconfirmed counts rather than presenting new measured evidence (C31–C33). No new contradiction found; runtime limits remain below. |
| protected passages | PASS — install commands B:66–71; pipeline B:14–16; audit/output/consent B:27–29,40–43,54–55; non-compression and 2725→2571, -105/+105 B:80–82; decision-point protection B:84–86. Deciding sources C05/C07/C14/C18/C19/C23/C24/C27 and what-broke:56–60. Unconfirmed claims are weakened, attributed, or cut, not strengthened. |
| failures repaired | 16/17 documented targets repaired; TB is partial at B:51–55,73–76 because full rewrite task execution is unknown. Temporary staging B:45–47 and release boundary B:73–76 repair both adversarial workflow gaps at their source. Detailed count below; no new reader score claimed. |
| prerequisites | Most observed gaps answered at B:5–7,9–16,29–30,40–61,73–76; runtime/auth precede install, copied-tree re-audit is explicit. B:51–56 omits run-retention/uninstall advice. Original writer inventory unavailable; reconstructed comparison below. |
| cuts justified | Unknown for every cut: no author cut ledger supplied. B:32–34 omits the 44-word anecdote (original:27–29); B:80–86 omits 29-word predictions (original:55–56); B:92–103 omits original:70–72’s 34-word false-guarantee bullet and :73–75’s 38-word clarity bullet. C25/C26/C34–C38 permit cutting unconfirmed assertions, but do not constitute a submitted author cut ledger. |
| length | Original:1–90 = 933 whitespace-delimited words; B:1–107 = 960 (+27). Reported only; no selection weight. |

### Repairs, one target at a time

| Target | Result and candidate line | Why | Deciding source |
|---|---|---|---|
| F01: Q2 + C15/C16: repository writes and directory position | repaired; B:51–56,73–76 | Instructions and applicable revision stated | RW:66–79,149–154; LO:41 |
| F02: Q7 missing language/non-code scope | repaired; B:5–7 | Intent, non-code source rule and unmeasured weaker check | AUDIT:19–22,1010–1018; AU:25–27; TP:73–80 |
| F03: TB harmful workflow: recipe repaired AND run end to end | partial; B:51–55,73–76 | Branch recipe and released exception described; full rewrite task not run | what-broke:24–29; AU:131; RW:66–79,149–154 |
| F04: C12 stop rule, non-disjoint lenses, scoring | repaired; B:36–38 | Owner decides; incorrect non-overlap claim removed | RW:174–175,188–192; BO:128–129 |
| F05: C13 every attempted round retained | repaired; B:36–43 | Universal retention claim removed | RW:125–144; ROUND:38–40,54 |
| F06: C20/C21 Node dependency on both routes | repaired; B:60–61 | Both routes before commands | PKG:4–6; AU:159–161; RW:83–87 |
| F07: C27 prohibition means no cut/weakening, not no edits | repaired; B:84–86 | Explicit veto plus reword/correct | WR:21–23; BO:60–63,113–114 |
| F08: C30 two experiments and correct scope | repaired; B:90–98 | Two experiments, chain scoped to README; no false bake-off corpus claim | CHAIN:1,16; CORPUS:9–15 |
| F09: C39 actual 2×5 design | repaired; B:97–98 | Correct design explicit | DESIGN:13–24 |
| F10: C41 opening tally | repaired; B:98–100 | 5/1/3/1, only shortened control | OLDJ2:6,10–19 |
| F11: C45 two benchmarks both large | repaired; B:90–103 | False claim cut | PA:104–107 |
| F12: C46 exhaustive review coverage | repaired; B:90–107 | Exhaustive claim cut | AUDIT:C46; PA:87–133 |
| F13: C44 limit before results | repaired; B:90–96 | No-document warning before counts | AUDIT:C44; ME:70–81 |
| F14: L3 actual installed revision and write boundary | repaired; B:73–76 | Names checkout commit, historical main revision, and different write behavior | what-broke:47; 8c041b7 RW:66–67,110–113 |
| F15: L3 host authentication | repaired; B:60–61 | Sign-in before commands | what-broke:48 (C20 supplement) |
| F16: L3 external-tool recipe exclusion | repaired; B:29–30 | Explicit list of exclusions | TP:66–71; what-broke:49 (C02 supplement) |
| F17: L3 temporary candidate links and comparison staging | repaired; B:45–47 | Same-relative-entry copied Markdown tree, same questions/key/model; link-layout mechanics checked | ME:35–37,49,108–115; what-broke:50–52 |

### Every original ledger claim, including removed and unconfirmed claims

| Entry and subject | Candidate disposition and line | Code and original evidence status |
|---|---|---|
| C01: Product measures answers and proposes repairs | B:3–4: retained measurement purpose, L2 | AU:69–100; RW:188–192; PLUGIN:1–10; confirmed L2 |
| C02: Fresh readers, truth coverage, line/cause | B:4–7,23–30: limits no-code evidence and states exclusions; no new coverage guarantee | AU:56–67,89–92,123–131; TP:66–80; unconfirmed L2 |
| C03: Three skills | B:19: retained | AU:1–11; RT:1–11; RW:1–12; confirmed L3 in supplied audit |
| C04: User invocation, none starts itself | B:19: “user-invoked” matches front matter without asserting all-run enforcement | AU:7,164–165; RT:7,82–83; RW:8,21; unconfirmed L2 |
| C05: Skeleton/audit → rewrite → candidate/diff → audit | B:9–16,40,45–47: preserves pipeline and adds a staging/comparison instruction | RT:70–83; RW:14–21,188–192; ME:108–115; confirmed L2 |
| C06: Profile, code-derived key, one Markdown reader per question | B:23–25: retained; includes baseline/task readers | AU:46–59,69–100; ME:28–60; confirmed L2 |
| C07: Score, failed questions, five causes | B:27–30: retained, including baseline delta and required output | AU:120–131,153–165; LE:7–41; confirmed L2 |
| C08: Audit proposes no wording | B:28–29: describes the required report without an absolute “never” | AU:18–19; LE:113–114; unconfirmed L2 |
| C09: Rethink comparisons, terms, structure before prose | B:32–33: retained | RT:13–15,25–68; confirmed L2 |
| C10: Skeleton contents and wait | B:33–34,55–56: retained; storage unspecified is correctly disclosed | RT:70–83; confirmed L2 |
| C11: Rewrite accepts skeleton or audit | B:36: retained; does not deny resume/declined-input route | RW:14–30; confirmed L2 |
| C12: Pool, scoring, lenses and stop | B:36–38: repairs stop and removes disjoint-lens claim; adversarial read is correctly first | RW:54–62,131–175,188–192; BO:21–29,128–139; refuted old formulation |
| C13: Every attempted round retained | B:36–43: removes universal retention claim; only selected/later rounds described | RW:125–144; ROUND:38–40,54; refuted L3 |
| C14: Handover and evidence behind all claims | B:40–43: says “instructions”, “return contract”, “declared” and “pinned”; supported L2/observed script scope; no all-claim guarantee | RW:103–118,131–144,188–208; ROUND:66–67,85,107–119; unconfirmed (coverage only L2) |
| C15: Own run directory and its position | B:49–56,73–76: explicitly outside, with checkout/release boundary | RW:66–79; AU:30–44; confirmed with Position defect in old audit |
| C16: No repository writes without word | B:51–55,73–76: explicitly describes instructions and limits boundary to checkout | RW:66–79,149–154,191–192; LO:41; old refutation superseded by branch change |
| C17: All fan-outs announced with count/model, wait | B:32–43: global announcement guarantee cut; local rethink wait and owner decision remain | AU:86–87; RT:30–31,56–57; RW:60–62,131–135; BO:22; LO:107–108; unconfirmed L2 |
| C18: Slash install commands | B:66–67: verbatim commands retained; 73–76 names recorded main revision and boundary | MARKET:2,18–24; PLUGIN:1–10; audit C18 plus what-broke:47 |
| C19: Shell install commands | B:70–71: verbatim retained; 73–76 limits delivered behavior | MARKET:2,18–24; audit C19 plus what-broke:47 |
| C20: Nothing else/dependencies/account | B:60–61: host, sign-in and Node appear before commands; refuted readiness promise removed | PKG:1–7; AU:159–161; RW:83–87,147–148; what-broke:48; refuted old statement |
| C21: Node only for checkout | B:60–61: both routes, >=22 as prerequisite; supported declared floor, actual Node 22 execution unknown | PKG:4–6; AU:159–161; RW:83–87; refuted L3 |
| C22: General effect: truer and easier | B:80–86: generic effect guarantee cut | ME:3–6; PA:130–132; unconfirmed L2 |
| C23: Not a compressor, length not selection/gate | B:80–82: preserves point and correct selection/budget explanation | BO:113–118,136–139; RW:95–98,123; SECTIONS:4,25; confirmed L2 |
| C24: 2725 → 2571; second -105, third +105 | B:80–82: keeps all four numbers and adds date locally | CHAIN:20–34; audit C24 confirmed L3 |
| C25: False long text necessarily shortens | B:80–86: removed | MS:109–119; audit C25 unconfirmed L2 |
| C26: Hard subject stays long and becomes right | B:80–86: removed | WR:21–23; BO:118; audit C26 unconfirmed L2 |
| C27: Never touch a condition/limit/warning | B:84–86: explicitly permits rewording/correction while retaining veto | WR:21–23; BO:47,60–63,113–114; refuted L2 |
| C28: Preserve independent-decision repetition | B:84–86: states rule, not all-run guarantee | WR:21–22; DUP:4–6; LO:124–131; unconfirmed L2 |
| C29: Keep measurement date/numbers | B:86: states rule, not measured enforcement | WR:22–23; RW:212–215; unconfirmed L2 |
| C30: All data from one run/one README | B:90–98: distinguishes chain README and separate bake-off; full bake-off corpus is omitted, not falsely narrowed | CHAIN:1,16,36–48; CORPUS:9–15; refuted L2 |
| C31: 3/6 → 6/6, departures 1 → 0, controls | B:92–96: expressly attributes 3/6 → 6/6 to pages; cuts departures/control outcomes rather than inventing evidence | ME:125–128; audit C31 unconfirmed L1 |
| C32: Six questions, one trial each | B:93–94: expressly reported, not promoted above L1 | ME:3–6; audit C32 unconfirmed L1 |
| C33: Conditional McNemar p=.25 | B:94–96: correctly conditions computation on reported counts | PA:92–95; audit C33 confirmed L3 computation |
| C34: Two of six failures were false claims | B:92–103: removed | ME:125–128; audit C34 unconfirmed L2 |
| C35: Reader repeated two false guarantees | B:92–103: removed | TP:27–36; audit C35 unconfirmed L2 |
| C36: Clarity self-report ran against truth | B:92–103: removed | AU:102–105; ME:62–65; PA:97–100; unconfirmed L1 |
| C37: Two confident wrong, one confused right | B:92–103: removed | AU:102–105; PA:97–100; unconfirmed L1 |
| C38: Neither skill asks about clarity | B:92–103: removed | AU:102–105; ME:46–65; CB:135–166; unconfirmed L2 |
| C39: Five published standards vs controls | B:97–98: correct 2×5, four standards incl. unpublished draft plus two controls | DESIGN:13–24; audit C39 refuted L2 |
| C40: Both controls beat both standards universally | B:100–101: says one judge yes, other not; matches both rankings | OLDJ2:3; OLDJ1:3; audit C40 unconfirmed L2 |
| C41: Seven unchanged, only control shortened | B:98–100: same correct tally and 97-word outcome | OLDJ2:6,10–19; audit C41 refuted L2 |
| C42: Ten agents, one run/passage, one per cell | B:90,97–100: pilot framing, 2×5 design and ten agents preserve size; wording “one observation per cell” omitted, not contradicted | DESIGN:13–20; OLDJ2:6; confirmed L2 |
| C43: Pass attribution and bake-off advantage unmeasured | B:103: retained | ME:130–132; BO:8–11; confirmed L2 |
| C44: No no-document arm; qualification position | B:90–96: warning before reported results | ME:70–81; PA:104–107; audit C44 confirmed + Position |
| C45: Both benchmarks found large prior knowledge | B:90–103: deletes unsupported benchmark generalization | PA:104–107; refuted L2 |
| C46: Prior art collects every criticism | B:90–107: removes exhaustive claim and reference link | PA:87–133; audit C46 refuted L2 |

### Added or materially reframed claims

| ID | Candidate line and claim | Code / ledger | Judgment and evidence level |
|---|---|---|---|
| B-N01 | B:5–7: Intended multilingual Markdown and non-code scope; source or weaker guarantee, unmeasured form | AUDIT:19–22; AU:25–27; TP:73–80; Q7 | Supported as intent and rule, not multilingual performance claim |
| B-N02 | B:9–11: Which skill to run first and re-audit | RW:14–21; RT:4–6; ME:108–115; C05 | Supported L2 |
| B-N03 | B:23–30: Ledger/key before fresh readers, baseline and task readers, five causes, exclusions | AU:46–59,69–100,107–131; TP:66–71; C02/C06/C07/C08 | Supported L2; baseline arm runs once, and candidate calls it a baseline |
| B-N04 | B:36–38: Adversarial read first, three writers/two judges, later rounds and owner stop | RW:54–62,179–192; BO:21–29; C12 | Supported default process, L2; refusal can reduce writers, candidate does not claim fan-out cannot be declined |
| B-N05 | B:40–43: Instruction/return contract vs pinned-sentence executable guard | RW:103–118,188–208; LEDGER:18–27; C14 | Supported scoped description. Lost-pin and restored-false-phrase probes each exited 1 |
| B-N06 | B:45–47: Temporary Markdown tree at same relative entry, fixed measurement inputs | ME:35–37,49,108–115; C05 and what-broke:50 | Reasonable manual staging recipe; copied 18 tracked Markdown files and preserved linked paths for A/C. B has zero local links. No live reader measurement run |
| B-N07 | B:51–56: Instructions' external run directory, code-defects proposal, ISSUES/application gate, rethink location unknown | AU:33–44; RW:66–79,149–154,191–192; RT:70–83; C10/C15/C16 | Supported L2 descriptions of instructions; formula exercised for checkout and installed-variable cases, not host integration |
| B-N08 | B:60–61: Claude Code installed and signed in; Node >=22 on PATH for both routes | PKG:4–6; AU:159–161; RW:83–87; C20/C21 + what-broke:48 | Supported prerequisite; Node floor declared, Node 22 runtime not exercised |
| B-N09 | B:63–71: Slash commands inside Claude Code and shell counterparts | MARKET:2,18–24; C18/C19 | Supported documented syntax; all four commands retained verbatim; no network install run this turn |
| B-N10 | B:73–76: 2f29a8f branch scope vs audited main 8c041b7 behavior | what-broke:47; local git object 8c041b7 RW:66–67,110–113; C18/C19 supplement | Supported historical/version boundary; today's remote main UNKNOWN |
| B-N11 | B:80–82: Length not selection and budgets reports | BO:118,136–139; SECTIONS:4,25; C23 | Supported; over-budget self-test passed |
| B-N12 | B:84–86: Veto, reword/correct exception, repetition/date rules | BO:47,60–63,113–114; WR:21–23; C27–C29 | Supported rule descriptions, L2 |
| B-N13 | B:92–96: Missing raw records, reported counts and conditional p | AUDIT:C31–C33; PA:92–95 | Preserves L1 status of counts by attributing them, while calculation remains conditional |
| B-N14 | B:97–101: Correct factorial allocation, hidden models, exact opening tally, judge-dependent ranking | DESIGN:13–24; OLDJ2:3,6,10–19; OLDJ1:3; C39–C42 | Supported L2 historical records; not a rate or new measured effect |
| B-N15 | B:105–107: MIT license | PLUGIN:8; plugins/terse/LICENSE:1 | Supported L2 |

### Prerequisites at the decision

| Reconstructed inventory item | Candidate evidence |
|---|---|
| Skill choice and invocation | B:9–19,63: routes explicit; install block labelled inside Claude Code |
| Markdown, language and no-code scope | B:5–7: intended scope and weaker source rule |
| Install authentication/runtime | B:60–61: answered before commands |
| Which revision the commands deliver | B:73–76: answered in install section, after commands |
| What truth pass excludes | B:29–30: exclusions enumerated in audit description |
| Output, location and applying consent | B:40–56: outputs and write gates stated; durability/uninstall warning not supplied |
| Temporary re-audit and fixed comparison inputs | B:45–47: copied tree and all four fixed inputs explicit |
| Instructions versus executable coverage | B:40–43: explicitly distinguishes contract from pinned-sentence check and limits guarantee |
| Reading results at their evidence level | B:90–103: pilot, missing raw records, attributed counts, judge-dependent results |

## Candidate C

| Row | Judgment, candidate lines, deciding evidence |
|---|---|
| new false claims | VETO — C:43–45 promises outside-repository/consent behavior without qualifying C:53–61’s advertised install route. what-broke:47 (C18/C19 supplement) identifies delivered main 8c041b7; that revision’s RW:66–67 writes inside the repository and RW:110–113 routes defects to ISSUES.md without the gate. Current checkout RW:66–79,149–154 supports the promise only for this checkout. C:4–7 also leaves the external-tool exclusion unstated (TP:69–71), scored partial rather than a second decisive veto. |
| protected passages | PASS — working install C:53–58, pipeline C:12–14, audit/output/consent C:21–25,41–45, non-compression/numbers C:65–68, and safeguard rules C:70–73 survive (C05/C07/C14/C18/C19/C23/C24/C27; what-broke:56–60). Unconfirmed effect and historical claims C:65–68,82–91 are retained without being newly confirmed or strengthened; see all 18 dispositions below. |
| failures repaired | 13/17 documented targets repaired; 3 partial (TB C:43–46; external-recipe exclusion C:4–7,19–25; temporary staging C:45–46), 1 not repaired (release C:43–45,53–61). Detailed count below; no new reader score claimed. |
| prerequisites | Mixed at C:6–14,19–25,41–61: scope, host auth, Node and checkout write boundary answered. Revision identity, explicit truth exclusion and temporary-tree validation remain unresolved; fixed comparison inputs are absent at C:45–46. Original writer inventory unavailable. |
| cuts justified | Unknown for every cut: no author cut ledger supplied. C:34–46 replaces original:31–36’s loop/retention explanation and C:92–106 rewrites original:76–86’s experiment/benchmark claims; these are substantive corrections rather than established wholesale information cuts. No omitted semantic passage of >=20 words was established here, but absence of a submitted cut ledger prevents certifying every cut. |
| length | Original:1–90 = 933 whitespace-delimited words; C:1–110 = 1,215 (+282). Reported only; no selection weight. |

### Repairs, one target at a time

| Target | Result and candidate line | Why | Deciding source |
|---|---|---|---|
| F01: Q2 + C15/C16: repository writes and directory position | repaired; C:24–25,43–45 | Checkout boundary now stated; release scope separately F14 | RW:66–79,149–154; LO:41 |
| F02: Q7 missing language/non-code scope | repaired; C:6–7 | Same reader brief across languages and unmeasured weaker no-code check; no equal-accuracy claim | AUDIT:19–22,1010–1018; AU:25–27; TP:73–80 |
| F03: TB harmful workflow: recipe repaired AND run end to end | partial; C:43–46 | Branch recipe described; full rewrite task not run and install caveat missing | what-broke:24–29; AU:131; RW:66–79,149–154 |
| F04: C12 stop rule, non-disjoint lenses, scoring | repaired; C:34–41 | Owner decides; lenses differ; skeleton route distinguished | RW:174–175,188–192; BO:128–129 |
| F05: C13 every attempted round retained | repaired; C:37–39 | File-per-round plus explicit regeneration, no “kept” promise | RW:125–144; ROUND:38–40,54 |
| F06: C20/C21 Node dependency on both routes | repaired; C:58–61 | Both routes named | PKG:4–6; AU:159–161; RW:83–87 |
| F07: C27 prohibition means no cut/weakening, not no edits | repaired; C:70–73 | Actual writing rule replaces false immutability | WR:21–23; BO:60–63,113–114 |
| F08: C30 two experiments and correct scope | repaired; C:77–80 | Two experiments, separate corpora | CHAIN:1,16; CORPUS:9–15 |
| F09: C39 actual 2×5 design | repaired; C:92–94 | Correct design explicit | DESIGN:13–24 |
| F10: C41 opening tally | repaired; C:95–98 | 5/1/3/1, only shortened control | OLDJ2:6,10–19 |
| F11: C45 two benchmarks both large | repaired; C:103–106 | Different benchmark outcomes stated | PA:104–107 |
| F12: C46 exhaustive review coverage | repaired; C:103–106 | Exhaustive claim narrowed | AUDIT:C46; PA:87–133 |
| F13: C44 limit before results | repaired; C:77–85 | No-document warning before counts | AUDIT:C44; ME:70–81 |
| F14: L3 actual installed revision and write boundary | not repaired; C:53–61,43–45 | Advertised commands and outside-repository promise have no version boundary | what-broke:47; 8c041b7 RW:66–67,110–113 |
| F15: L3 host authentication | repaired; C:60–61 | Logged-in host required | what-broke:48 (C20 supplement) |
| F16: L3 external-tool recipe exclusion | partial; C:4–7,19–25 | Narrows to own software but never states external-tool recipe exclusion | TP:66–71; what-broke:49 (C02 supplement) |
| F17: L3 temporary candidate links and comparison staging | partial; C:45–46 | Original entry location named; no temporary-copy route or fixed comparison inputs | ME:35–37,49,108–115; what-broke:50–52 |

### Every original ledger claim, including removed and unconfirmed claims

| Entry and subject | Candidate disposition and line | Code and original evidence status |
|---|---|---|
| C01: Product measures answers and proposes repairs | C:3–6: retained, L2 | AU:69–100; RW:188–192; PLUGIN:1–10; confirmed L2 |
| C02: Fresh readers, truth coverage, line/cause | C:4–7: removes “every” but still promises a line for a failure; missing answers have no document line (AU:128). Unconfirmed retained; external-recipe boundary remains unstated | AU:56–67,89–92,123–131; TP:66–80; unconfirmed L2 |
| C03: Three skills | C:9: retained | AU:1–11; RT:1–11; RW:1–12; confirmed L3 in supplied audit |
| C04: User invocation, none starts itself | C:9: same guarantee, not strengthened; runtime remains unknown | AU:7,164–165; RT:7,82–83; RW:8,21; unconfirmed L2 |
| C05: Skeleton/audit → rewrite → candidate/diff → audit | C:12–14,41–46: preserves pipeline and restores original entry location; no temporary-copy route | RT:70–83; RW:14–21,188–192; ME:108–115; confirmed L2 |
| C06: Profile, code-derived key, one Markdown reader per question | C:19–21: retained, same L2 | AU:46–59,69–100; ME:28–60; confirmed L2 |
| C07: Score, failed questions, five causes | C:21–25: retained; raw “score” is less explicit about delta but not contradictory | AU:120–131,153–165; LE:7–41; confirmed L2 |
| C08: Audit proposes no wording | C:23–24: “never” retained, not upgraded | AU:18–19; LE:113–114; unconfirmed L2 |
| C09: Rethink comparisons, terms, structure before prose | C:27–29: retained | RT:13–15,25–68; confirmed L2 |
| C10: Skeleton contents and wait | C:29–30: retained | RT:70–83; confirmed L2 |
| C11: Rewrite accepts skeleton or audit | C:34–35: retained; does not deny resume/declined-input route | RW:14–30; confirmed L2 |
| C12: Pool, scoring, lenses and stop | C:34–41: repairs stop and disjoint-lens claim; distinguishes skeleton route | RW:54–62,131–175,188–192; BO:21–29,128–139; refuted old formulation |
| C13: Every attempted round retained | C:37–39: “its own file” plus regeneration replaces “kept”; does not promise preservation of abandoned attempts | RW:125–144; ROUND:38–40,54; refuted L3 |
| C14: Handover and evidence behind all claims | C:41–43: narrows coverage to “each claim it checked”; output contract remains L2, no stronger completeness promise | RW:103–118,131–144,188–208; ROUND:66–67,85,107–119; unconfirmed (coverage only L2) |
| C15: Own run directory and its position | C:24–25,43–45: explicitly outside; correct for checkout, unqualified installed route remains F14 | RW:66–79; AU:30–44; confirmed with Position defect in old audit |
| C16: No repository writes without word | C:43–45: now matches branch instructions; advertised-install scope still false/unsupported at 53–61 | RW:66–79,149–154,191–192; LO:41; old refutation superseded by branch change |
| C17: All fan-outs announced with count/model, wait | C:48: retained unchanged general announcement claim, auxiliary-spawn uncertainty remains | AU:86–87; RT:30–31,56–57; RW:60–62,131–135; BO:22; LO:107–108; unconfirmed L2 |
| C18: Slash install commands | C:53–54: verbatim commands retained; revision distinction absent through 61 | MARKET:2,18–24; PLUGIN:1–10; audit C18 plus what-broke:47 |
| C19: Shell install commands | C:57–58: verbatim retained; same release gap | MARKET:2,18–24; audit C19 plus what-broke:47 |
| C20: Nothing else/dependencies/account | C:58–61: host sign-in and installed Node corrected; no npm/config/extra-account assertion bounded to plugin | PKG:1–7; AU:159–161; RW:83–87,147–148; what-broke:48; refuted old statement |
| C21: Node only for checkout | C:58–59: both routes, explicitly declared >=22; actual Node 22 execution unknown | PKG:4–6; AU:159–161; RW:83–87; refuted L3 |
| C22: General effect: truer and easier | C:65: retained unconfirmed effect claim, not strengthened or newly validated | ME:3–6; PA:130–132; unconfirmed L2 |
| C23: Not a compressor, length not selection/gate | C:65–68: “not a compressor” retained; no claim that length selects | BO:113–118,136–139; RW:95–98,123; SECTIONS:4,25; confirmed L2 |
| C24: 2725 → 2571; second -105, third +105 | C:65–67,77–78: keeps all four numbers; date appears in measurement section | CHAIN:20–34; audit C24 confirmed L3 |
| C25: False long text necessarily shortens | C:67: retained unchanged unconfirmed prediction | MS:109–119; audit C25 unconfirmed L2 |
| C26: Hard subject stays long and becomes right | C:68: retained unchanged unconfirmed prediction | WR:21–23; BO:118; audit C26 unconfirmed L2 |
| C27: Never touch a condition/limit/warning | C:70–73: describes actual overriding writing rules, not immutability; “weaken” is not stated but the false “never touch” claim is gone | WR:21–23; BO:47,60–63,113–114; refuted L2 |
| C28: Preserve independent-decision repetition | C:70–73: states rule, not all-run guarantee | WR:21–22; DUP:4–6; LO:124–131; unconfirmed L2 |
| C29: Keep measurement date/numbers | C:72–73: states rule, not measured enforcement | WR:22–23; RW:212–215; unconfirmed L2 |
| C30: All data from one run/one README | C:77–80: explicitly distinguishes two experiments and corpora | CHAIN:1,16,36–48; CORPUS:9–15; refuted L2 |
| C31: 3/6 → 6/6, departures 1 → 0, controls | C:82–85: retains original numerical claims; still unconfirmed L1, no new evidence | ME:125–128; audit C31 unconfirmed L1 |
| C32: Six questions, one trial each | C:83–85: retained, still L1 | ME:3–6; audit C32 unconfirmed L1 |
| C33: Conditional McNemar p=.25 | C:84–85: correct calculation; input counts remain unconfirmed | PA:92–95; audit C33 confirmed L3 computation |
| C34: Two of six failures were false claims | C:86–88: retained; mapping remains unconfirmed | ME:125–128; audit C34 unconfirmed L2 |
| C35: Reader repeated two false guarantees | C:86–88: retained, still unconfirmed; does not supply missing original evidence | TP:27–36; audit C35 unconfirmed L2 |
| C36: Clarity self-report ran against truth | C:89–91: retained, still unconfirmed L1 | AU:102–105; ME:62–65; PA:97–100; unconfirmed L1 |
| C37: Two confident wrong, one confused right | C:89–91: unchanged counts, still L1 | AU:102–105; PA:97–100; unconfirmed L1 |
| C38: Neither skill asks about clarity | C:90–91: retained unchanged; no stronger enforcement claim | AU:102–105; ME:46–65; CB:135–166; unconfirmed L2 |
| C39: Five published standards vs controls | C:92–94: correct four standards plus control pair and draft status | DESIGN:13–24; audit C39 refuted L2 |
| C40: Both controls beat both standards universally | C:94–98: names readability judge and other judge's verification winner; matches both rankings | OLDJ2:3; OLDJ1:3; audit C40 unconfirmed L2 |
| C41: Seven unchanged, only control shortened | C:95–98: same correct tally; does not invent final word count | OLDJ2:6,10–19; audit C41 refuted L2 |
| C42: Ten agents, one run/passage, one per cell | C:97–98: sample limits retained | DESIGN:13–20; OLDJ2:6; confirmed L2 |
| C43: Pass attribution and bake-off advantage unmeasured | C:100: retained | ME:130–132; BO:8–11; confirmed L2 |
| C44: No no-document arm; qualification position | C:77–85: warning before results; 101–103 also repeats it | ME:70–81; PA:104–107; audit C44 confirmed + Position |
| C45: Both benchmarks found large prior knowledge | C:103–106: distinguishes Code-QA-Bench .56–.68 from SWD chance; agrees with local record, external papers not fetched | PA:104–107; refuted L2 |
| C46: Prior art collects every criticism | C:103–106: narrows to summarizes an adversarial review; no “every” | PA:87–133; audit C46 refuted L2 |

### Added or materially reframed claims

| ID | Candidate line and claim | Code / ledger | Judgment and evidence level |
|---|---|---|---|
| C-N01 | C:6–7: Readers get same brief across languages; weaker unmeasured no-code check | ME:46–60; AU:25–27; TP:73–80; AUDIT:19–22; Q7 | Supported L2 method/intent; no claim of equal detection accuracy. English-only rule1 defect remains undisclosed here |
| C-N02 | C:24–25,43–45: External run path named, rewrite asks audit path, ISSUES/application need consent | AU:33–44; RW:29,66–79,149–154,191–192; C15/C16 | Supported for checkout; unsupported as unqualified advertised-install behavior (what-broke:47; 8c041b7 RW:66–67,110–113) |
| C-N03 | C:30–32: 2026-09-11 abandoned draft, third section, nine structural objections | RT:17–21; ST:39–56; no separate original ledger entry | Same anecdote as original 27–29, with date added from source; supported L2 record, not new reader trial |
| C-N04 | C:37–39: Own round file, failed pin/retirement regeneration before critics | RW:119–144; LEDGER:18–27; C13/C14 | Supported process with pattern-level guard, not retained history of abandoned attempts; shipped lifecycle checks exercised file/snapshot behavior |
| C-N05 | C:41–46: Owner decides stop, output for checked claims, re-audit at original entry | RW:188–208; ME:35–37,108–115; C05/C12/C14 | Supported L2 process; temporary staging and fixed comparison inputs not supplied |
| C-N06 | C:58–61: Node for both routes, declared floor, logged-in host, no npm/config/extra account | PKG:1–7; RW:83–87,147–148; C20/C21 + what-broke:48 | Supported prerequisites; actual Node 22 and fresh login workflow not run |
| C-N07 | C:70–73: Three safeguards override other rules | RW:212–215; WR:21–23; C27–C29 | Supported rule description; no new enforcement guarantee |
| C-N08 | C:92–98: 2×5 allocation, named judge, corrected tally, other judge verification winner | DESIGN:13–24; OLDJ2:3,6,10–19; OLDJ1:3; C39–C42 | Supported L2 historical records |
| C-N09 | C:103–106: Code-QA .56–.68 vs SWD chance; reference summarizes review | PA:87–107; C45/C46 | Matches checkout record; benchmark papers themselves not fetched, remains L2 relative to record |
| C-N10 | C:108–110: MIT license | PLUGIN:8; plugins/terse/LICENSE:1 | Supported L2 |
| C-N11 | C:86–88: A structural rewrite would carry the false guarantees forward | AU:133–134; original:70–72; related C34/C35 | Unchanged counterfactual rationale; no experiment isolates that alternative. Unconfirmed, not stronger than original and not newly validated |

### Prerequisites at the decision

| Reconstructed inventory item | Candidate evidence |
|---|---|
| Skill choice and invocation | C:9–14: user invocation and pipeline; session location less explicit |
| Markdown, language and no-code scope | C:6–7: scope and weaker pass; English-only checker not explained |
| Install authentication/runtime | C:58–61: answered adjacent to commands, after them |
| Which revision the commands deliver | C:53–61,43–45: unanswered; unconditional boundary misleading |
| What truth pass excludes | C:4–7,19–25: external recipes not named |
| Output, location and applying consent | C:24–25,41–46: outside locations and gate stated; durability/uninstall warning not supplied |
| Temporary re-audit and fixed comparison inputs | C:45–46: original entry placement only; temporary route and fixed key/model unstated |
| Instructions versus executable coverage | C:37–43: names guard and checked claims; does not promise all-claim coverage |
| Reading results at their evidence level | C:77–106: pilot and no-document limit; C31–C38 remain unconfirmed and missing records not stated |

## Execution and reproducibility record

- `node plugins/terse/skills/rewrite/scripts/selftest.mjs`: started, exit 0, **45 checks observed `ok`, 0 `MISS`**, Node v24.11.0. This exercises the shipped scripts, not model obedience to the skill pages. Full captured stdout/stderr: `selftest.log` beside this file.
- Ten targeted assertions ran and **10/10 matched expectations**. These deliberately confirm holes as well as safeguards; they do not mean the candidates passed a reader audit. Commands and exact stdout/stderr are in `probes.json` beside this file.
- The claimless edit used `old: "The tool runs."`, `new: "The tool runs and deletes nothing."`, and no `claims` or `check`. `node round.mjs 00.md 01.md edits.json --ledger ledger.json` started, exited 0, wrote the added guarantee, and produced `[]`. This is decisive against A:57–59 and corroborates C14.
- `node ledger.mjs pins.json lost.md` started, exited 1, printed `LOST` and `1 failure(s)`; `node ledger.mjs pins.json revived.md` started, exited 1, printed `YES` and `1 failure(s)`. These are expected refusals, supporting the bounded descriptions at B:42–43 and C:37–39.
- `node rule1.mjs English.md` started, exited 1, printed `exit code exits 2` and `1 violation(s), 0 excused`. `node rule1.mjs Russian.md` started, exited 0, printed `0 violation(s), 0 excused` for `Команда завершается с кодом 2.`. This supports A:93–94, not multilingual effectiveness generally.
- The literal RW:71 run-directory formula was executed twice under `/bin/sh`, with a safe literal slug, once with empty `CLAUDE_PLUGIN_DATA` and once with a supplied temporary plugin-data path. Both started, exited 0, and created their directories under this judge’s temporary directory, outside the checkout. This verifies formula branches used by A:73–76, B:51–53, C:43–45, not a real install or a complete TB workflow.
- A copy of the plugin’s 18 tracked Markdown files was staged at unchanged relative paths. Each candidate was placed at `plugins/terse/README.md`. A:121 and C:105 each have one relative Markdown target, and it resolved in the copied tree; B:1–107 has zero local Markdown links, so its own link check is vacuous. This demonstrates the mechanics of B:45–47’s proposed tree layout, not a full audit invocation.
- Six protected literal units were checked for each candidate: four install commands and two pipeline lines. **18/18 were present verbatim** (A:14–15,26–31; B:14–15,66–71; C:12–13,53–58). Hand-over, consent and non-compression passages were judged semantically, with citations in each sheet.
- Whitespace-delimited counts were recomputed from file contents: original:1–90 933; A:1–126 1389; B:1–107 960; C:1–110 1215. They never selected the winner.
- `rg --files --hidden -g AGENTS.md -g '!\.git/**'`: started, exit 1, diagnostic empty; this means no matching repository instruction file, not a tool that failed to start. No required command failed to start. Expected negative-test exits are recorded above and in the raw log.
- The first ad hoc citation-range validator started and exited 1 with `AssertionError`: its unbounded `A:` regular expression also matched source abbreviation `PA:`. This was a validator defect, corrected with a leading identifier boundary before rerunning; no candidate verdict was based on that failed validation.
- No network fetch, remote-main check, live host authentication, uninstall lifecycle, or paid reader/rewrite session was run. No current second-judge sheet was read. Candidate identities remain unknown.

## Selection and unresolved limits

B survives both vetoes (B:40–43,51–55,66–76,80–86); A is vetoed by the new coverage guarantee (A:57–59; ROUND:66–67,85; C14) and its evidence ceiling, and C is vetoed by the unqualified installed write boundary (C:43–45,53–61; what-broke:47; 8c041b7 RW:66–67,110–113). **B wins with 16/17 documented targets repaired (B:5–7,29–30,36–61,73–103), one partial. There is no tie among survivors.** A:19–21,26–36,57–59,71–76 and C:4–7,19–25,43–61 have the unresolved or vetoed points enumerated in their sheets; their repair totals are not used to override vetoes.

Unknown: whether any candidate’s author supplied an inventory, cut reasons, or lifecycle runs elsewhere; those were not provided for this judgment. Unknown: complete TB outcome under an actual model-driven rewrite, fresh-reader success rates after these edits, current remote main, host-uninstall behavior, and runtime on Node 22. Historical reader-answer records behind C31/C32/C34–C37 remain absent according to the named audit, so retained statements at A:103–112 and C:82–91 remain unconfirmed; B:92–96 expressly attributes the limited reported counts. The manual staging instruction at B:45–47 has been checked for file layout only, not accepted by a live audit session.
