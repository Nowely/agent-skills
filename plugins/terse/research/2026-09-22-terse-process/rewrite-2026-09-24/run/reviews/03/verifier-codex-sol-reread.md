Codex Sol verifier: PASS, 18 claims, 0 not holding

Fresh read of the regenerated `03-routes.md`, `edits/03.json`, and current `ledger.json`. Verdicts follow edit order.

1. **C01 terse is a Claude Code plugin whose — HOLDS.** Opened `purpose.md:1-16`, `audit.md:18-24`, `audit/SKILL.md:1-28`, `rewrite/SKILL.md:1-7,47-57,62-72,164-165`, `rethink/SKILL.md:55-75`, `rethink/references/briefs.md:28-42`, `rethink/references/stages.md:37-50`, `references/prior-art.md:290-308`, and `references/practices-full.md:1-8`. The check now bears on the previously omitted “best practices”: it reaches the shipped curated forty, the complete 271-practice survey, rethink's slice survey, and the page's “gathers the best practices” principle. “Any text” remains explicitly the owner's stated aim, while the asks separately and accurately states the current Markdown-file operating scope. No function is named in these prose ranges. **Prior reason answered: yes.**

2. **R02a you need Node 22 or newer and a signed-in Claude Code: signed out no skill runs, audit and rewrite stop without Node — HOLDS.** Opened `package.json:1-7`, `audit/SKILL.md:155-164`, `rewrite/SKILL.md:91-100,108-146`, and `rethink/SKILL.md:1-10,55-64`. The revised asks now distinguishes the two Quick-start skills that invoke shipped Node scripts (audit at 163; rewrite at 97,116,138,140-143) from rethink, which invokes none, and states precisely that 22 is the package's declared floor while only 24.11.0 was exercised. `node.sh` reproduced exit 127 with no Node and success with 24.11.0. Call-site grep found `ledger-seed.mjs` at audit 163, rewrite 116, audit reference `ledgers.md:71,86,88`, and its selftest entry at `selftest.mjs:123`; rewrite script call sites are in the opened page block and selftest. **Prior reason answered: yes: the omitted skill and untested-floor boundary are now explicit rather than claimed as tested behavior.**

3. **R03a audit asks which files and where readers start, then waits — HOLDS.** Opened `audit/SKILL.md:21-44,86-102` and `reviews/02/c4-1.md:32-60`. The signed-in record proposes both the documentation files and entry file, requests confirmation, and ends the turn; the page says the same. No function is named in these prose ranges.

4. **R02b report excerpt — HOLDS.** Opened `audit.md:985-1025`. Lines 1014-1015 contain the excerpt verbatim beneath the Q7 missing finding, line 993 supplies the date and target, and 1015-1016 show the omitted continuation. The replay reports one normalized occurrence, 22 whitespace tokens/20 words, zero must-not words, and zero reader pairs. No function is named in the range.

5. **R02c audit routes by the shape verdict — HOLDS.** Opened `audit/SKILL.md:155-174` and `rewrite/SKILL.md:13-39,74-89`. The pages name the absolute audit path, offer rewrite only after agreement, route non-agreement to rethink, and have rewrite ask the user for that directory. The asks retains both branches and the user-supplied-folder condition. No function is named in these prose ranges.

6. **R02d rewrite returns a whole draft and original-based diff outside the repository — HOLDS.** Opened `rewrite/SKILL.md:74-100,200-238` and the run formula at 80-82. The loader replay reproduced installed, `--plugin-dir`, and plain-skill paths outside the working repository; the record contains `01-candidate.md` and `diff-01.patch`; the page hands both over and waits before applying. Probe functions `short`, `iso`, `mk`, `seen`, `page`, and `data` were opened at `rundir-rewrite.sh:27-59`; call-site grep found their calls at 40-68 and no alternate probe call site.

7. **R03i you decide whether the draft replaces your document — HOLDS.** Opened `rewrite/SKILL.md:74-89,200-223`. Lines 221-223 stop after handing over the round/diff and require the user's word to apply the candidate; 88-89 separately includes the candidate in the no-write-without-word rule. The formerly unclaimed duty-1 sentence now has its own claim. No function is named in these prose ranges.

8. **R03b audit announces its agents/model and waits; rewrite does so before writers, judges and round reviewers — HOLDS.** Opened `audit/SKILL.md:86-115` and `rewrite/SKILL.md:62-72,138-167`. Audit announces reader count/model before spawning and waits at 88-89; rewrite does so for writers/judges at 70-72 and the review wave at 150-151. The new sentence and asks expressly exclude the unannounced adversarial read at 64-66 and make no rethink claim. No function is named in these prose ranges. **Prior reason answered: yes; the sentence no longer quantifies over every agent or skill.**

9. **C10 rethink hands over a skeleton with section purpose and size before writing — HOLDS.** Opened `rethink/SKILL.md:1-23,91-110,138-151`. It defines the skeleton's titles, purposes, exclusions, word budgets and gates, then stops for agreement before rewrite starts. “Size” accurately glosses the word budget. No function is named in these prose ranges.

10. **C11 rewrite's audit/skeleton entry routes and draft/diff output — HOLDS.** Opened `rewrite/SKILL.md:13-39,200-223`, `audit/SKILL.md:155-174`, and the record named by `records.sh`. The claim is now correctly in the page-reporting register: current pages make “once you say the shape stands” the audit-route gate and also accept an agreed skeleton; current lines 221-223 promise the draft/diff. The level-3 records are used only for the hand-over portion, and the asks explicitly says the current gated audit route has not itself run to hand-over. The qualification reason is the sentence's own route condition at rewrite 14-20 and audit 166-171, not a lifecycle inference. No function is named in these prose ranges. **Prior reason answered: yes; the asks no longer presents the old audit execution as a run of the current gate.**

11. **C05 the two documented skill orders — HOLDS.** Opened `audit/SKILL.md:96-102,155-174`, `audit/references/measure.md:98-114`, `rethink/SKILL.md:1-17,148-151`, and `rewrite/SKILL.md:22-39`. The pages lay out both orders; same-question/key/entry/model remeasurement belongs only to audit-first, exactly as the asks scopes it. No function is named in these prose ranges.

12. **R03c by default three writers draft and two judges pick, followed by angled reviewers — HOLDS.** Opened `rewrite/SKILL.md:62-72,138-167,183-198`, `rewrite/references/bake-off.md:1-26,105-138`, and `rewrite/references/critic-briefs.md:100-116`. The pool table gives defaults of three writers and two judges, the page gives the one-writer refusal exception, and later rounds use one critic per differing, non-disjoint lens. The new “By default” qualification is exactly the page's boundary, demonstrated by both the default pool and refusal case. No function is named in these prose ranges. **Prior reason answered: yes; the unconditional count is now default-qualified.**

13. **R03d rules forbid filler and cutting/weakening decision-point protections — HOLDS.** Opened `rewrite/references/writing-rules.md:1-26`, `rewrite/references/bake-off.md:105-121`, and `rewrite/SKILL.md:240-245`. The fixed rules reject sentences carrying nothing and forbid cutting a condition, limit or warning; the judging sheet vetoes a cut or weakened protected passage. No function is named in these prose ranges.

14. **R03e rethink starts by surveying comparable documents with the agents the user allows — HOLDS.** Opened `rethink/SKILL.md:23-27,55-78` and `rethink/references/briefs.md:28-42`. The page waits for the user's word on the announced count, the brief expressly permits a smaller survey at two slices per surveyor, and audit entry accepts the user's size including zero. The qualification therefore describes step 1's own size across the stated cases and claims no finer-grained count control. No function is named in these prose ranges. **Prior reason answered: yes; the previously omitted direct-route smaller-sizing rule is now cited at briefs 37-38.**

15. **R03f word count never selects; cuts of twenty words or more carry reasons — HOLDS.** Opened `rewrite/references/bake-off.md:1-22,105-138` and `rewrite/SKILL.md:225-238`. Bake-off lines 14-15, 118, 131 and 136-138 say length is reported and never selects; rewrite 235-236 requires the cut ledger and reasons. No function is named in these prose ranges.

16. **R03g a round silently losing a checked-true sentence or repeating a found-false one is refused — HOLDS.** Opened `rewrite/SKILL.md:108-167,200-218`, `rewrite/scripts/ledger.mjs:1-27`, `rewrite/scripts/round.mjs:55-165`, and `guard.sh:18-27`. The new verb “repeats” matches the implementation's recorded phrasing boundary: exact retired phrasing fails, a different wording is not a repeat and passes; undeclared loss fails while a named drop passes. The “silently” qualification is the code's own declared-drop boundary at round 147-157 and guard cases a/d. Call-site grep found `ledger.mjs` at rewrite 143, `loop.md:70-71`, `ledger-seed.mjs:16`, and selftest 31,54,143; `round.mjs` at rewrite 127,137-146,188, `loop.md:70-71`, `CHANGELOG.md:21,31,57`, and selftest 40-114. Functions `refuse`, `flat`, `tally`, and `sum` at round 67,94-96 have all plugin calls at 72-140; `case1` at guard 18 is called by all cases at 23-27. **Prior reason answered: yes; it no longer claims semantic reintroduction is caught.**

17. **C24 the 2026-09-10 README changed from 2,725 to 2,571 words — HOLDS.** Opened `research/2026-09-10-chain/README.md:10-28`; fresh counts of the archived original and final are 2,725 and 2,571, matching lines 20 and 24. No function is named in the prose range.

18. **R03h the previous README scored 5/7 with text and 0/7 without — HOLDS.** Opened `audit.md:985-995`. The replay recounts the reader rows, matches score line 993, byte-compares README at `1a24018` to this run's `00-original.md`, and matches the report to the repository copy. No function is named in the range.

## Duty 1

No behavioural sentence in any current `new` field lacks a claim. In particular, “You decide whether the draft replaces your document.” is now edit R03i with its own claim.

## Duty 4 guarantee searches

Guarantee words in current `new` fields are R03c's **“By default”** and R03f's **“never.”** No sentence saying otherwise was found. The search covered these files, named: `03-routes.md`; `plugins/terse/CHANGELOG.md`; `plugins/terse/README.md`; `plugins/terse/references/practices-full.md`; `plugins/terse/references/prior-art.md`; `plugins/terse/skills/audit/SKILL.md`; audit references `ledgers.md`, `measure.md`, `reader-profile.md`, `truth-pass.md`; `plugins/terse/skills/rethink/SKILL.md`; rethink references `briefs.md`, `stages.md`; `plugins/terse/skills/rewrite/SKILL.md`; rewrite references `bake-off.md`, `critic-briefs.md`, `curse-of-knowledge.md`, `loop.md`, `measurements.md`, `writing-rules.md`. Supporting rather than contrary sentences: bake-off 19-22 gives the default 3/2 pool while rewrite 71-72 states the non-default refusal route; bake-off 14-15,118,131,136-138 says word count never selects.

## Commands and observed results

- Current-edit counter: 18 edits, 18 claims; exit 0.
- Full replay of all 18 current `check.run` commands plus their `check.expect` regexes: 18 MATCH, 0 MISS; every command exit 0; output-line counts per check were 19, 12, 13, 9, 6, 17, 2, 5, 6, 10, 8, 9, 4, 5, 2, 13, 6, 4.
- Guarantee extraction from all current `new` fields: 2 matching edits (`By default`, `never`); exit 0.
- Contrary-sentence search over `03-routes.md` and all 19 plugin Markdown files named above: none found; exit 0.
- Function/script call-site searches over `plugins/terse`, `guard.sh`, and `rundir-rewrite.sh`: call sites reported above; exit 0.

## Open

None. Every cited file, range, command, qualification reason, and named call site was reachable; no verdict is uncertain.
