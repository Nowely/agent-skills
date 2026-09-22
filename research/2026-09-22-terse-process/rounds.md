# Rounds

One orchestrated round in seven waves, the coordinator on Fable 5.1 (Opus 5 during scouting). Waves 1–3 were
the plan's six agents; wave 4 the owner's five for the vendor sources; wave 5 four more for the evaluation
guide and the design's second round; wave 6 the implementation, one writer and one reviewer resumed once:
seventeen agent runs, none dropped. The split critic was skipped in
wave 4, and one surveyor dropped fourteen draft rows of its own. Agents read only through wave 5; in wave 6 the writer committed in the live tree of the branch. Every read
agent's artifact came back as text or a file under its own temporary directory and was copied here unchanged.

| Wave | Agent | Task | Cost | Produced | Got wrong, or was told wrong |
|---|---|---|---|---|---|
| 1 | Opus D1 | autopsy of the 25 regressions | 164k tokens, 12 min | `d1-regression-autopsy.md`, 613 lines; rounds 04–09 replayed byte-identical | per-item R08-8 says `c`, the aggregate `e`; "21 needed new evidence or judgement" where its own columns give 12 + 7 = 19; R02-1's identity has a live alternative (its own open item) |
| 1 | Codex Sol H1 | harvest of the survey on triage and handover | 42 commands, 18 min | `h1-survey-harvest.md`, 49 quotes, 49/49 grep-validated | one scratch script failed on an apostrophe and was rerun; nothing found wrong in the return |
| 1 | Opus M1 | the two survey methods compared | 164k tokens, 9 min | `m1-two-surveys-compared.md`, 586 lines | the coordinator's brief named `.json` files in the 2026-09-17 directory that do not exist; the agent said so and worked without them |
| 2 | Fable A1 | the design | 186k tokens, 13 min | `a1-design-v1.md`, 550 lines, 21 rules | 34 findings against it (wave 3); 18 contradictions with its evidence base; 19/25 is 18/25 under its own mask; `M1:734-736` cites lines M1 does not have; `gateload.mjs` uses `require` and exits 1 as written |
| 3 | Codex Astra C1 | the attack, six fronts, one blind run | 53 commands, 19 min | `c1-design-critique.md`, 34 findings; `c1-blind-round08.md`, frozen by SHA-256 before reading | not cross-checked by anyone in this round; its blind run is n = 1 on Astra, which it says |
| 3 | Codex Sol K1 | completeness critic on the coordinator's draft answer | 13 commands, 8 min | `k1-completeness.md`: partial — 57 numbers checked, 49 matched, 8 not; "24 rules" was 21, "seven gates" eight, two levels the coordinator assigned without evidence, an estimate without its comparable run | — |
| 4 | Sonnet S1 | the OpenAI post and six skills-and-prompting pages | 193k tokens, 15 min (two calls) | `s1-openai-skills-and-prompting.md`, 59 rows, 59/59 grep-validated | read the brief strictly and fetched no satellite page at first; the coordinator named six and it added 39 rows; its first extraction would have broken sentences wrapped across HTML lines and was rewritten before the six pages |
| 4 | Codex Terra S2 | the Anthropic prompt-engineering section, with drift since A10 | 14 commands, 5.5 min | `s2-anthropic-prompting.md`, 46 rows, 46/46 grep-validated; `s2-manifest.tsv` | partial: the linked 3,326-line evaluation guide was fetched and not decomposed; 14 draft rows dropped as unverifiable by its own return, 13 gaps in its table's numbering, none recorded (K2); its drift table cites two rows it does not contain; strict `curl` failed on a self-signed certificate in the chain and the pages were fetched with verification off; one stray non-Latin token in its evidence |
| 4 | Sonnet S3 | the local `writing-for-agents` skill | 94k tokens, 7 min | `s3-writing-for-agents.md`, 68 rows, 68/68 | five false grep failures from bullet-prefixed patterns read as options, fixed with `--`; audience judged by literal words, which it says shifts several calls |
| 4 | Codex Astra P1 | mapper: 173 rows → 85 claims, 255 verdicts on three targets at `8c041b7` | 33 commands, 24 min | `p1-mapping.md`, `p1-validation.json`, `p1-sed-log.json` | 45 quotes matched only after typographic normalisation; two build-script anchors were ambiguous and fixed; declared and handled its bias as the model the OpenAI post describes |
| 4 | Opus K2 | completeness critic on wave 4 | 136k tokens, 10 min | `k2-completeness.md`: partial — 29/30 quotes literal, 30/30 by words; every mapper count exact; 15/15 target verdicts hold; the README's per-target sums dropped a value each, listed 6 of 12 candidates and 5 of 17 rejections without saying so, and narrowed five normalisation classes to three; one vendor page unread | — |
| 5 | Codex Terra S4 | the Anthropic evaluation guide (3,326 lines, already fetched) and agents.md | 11 commands, 4 min | `s4-evaluation-guide-and-agents-md.md`, 33 + 12 rows, 45/45 grep-validated; `s4-grep-checks.tsv` | 0 measured claims in either; the guide names baselines and earlier-version comparison but no no-document arm; one verification script tripped on a zsh read-only variable and was rerun |
| 5 | Fable A2 | design v2 against C1's 34 findings, K2's four, P1's candidates and S4's rows | 263k tokens, 14 min | `a2-design-v2.md`, 674 lines; `a2-regress.mjs`, `a2-record-replay.txt` | disposition claims 34 fixed / 0 rejected / 4 open — C2 recounts it; the counting rule's replay over the record gives 2,2,1,1,6,4,11 against rounds.md's 1,2,1,0,6,5,10, a charging question it leaves to the owner |
| 5 | Codex Astra C2 | the attack on v2, seven fronts, ten counting runs, hunk geometry on the record | 29 commands, 26 min | `c2-design-critique.md`, 25 findings; `c2-regress-runs.log`, `c2-geometry-summary.txt`, `c2-geometry-commands.log` | not cross-checked in this round; ran no live model trial, which it says |
| 5 | Codex Sol K3 | completeness critic on the coordinator's second closing answer | 10 commands, 8 min | `k3-completeness.md`: partial — 75 numbers checked, 70 matched; "C1 replayed the record" overstated, "nothing dropped" overbroad, "strict scoring not independent" stronger than C2's finding, an agent-per-step estimate with no source, and the agent total miscounted | — |
| 6 | Opus W1 | implement the seed, the executed check and the verifier brief; then two fix passes | 246k tokens, 26 min (three calls) | 14 commits on `plugins/terse` + `ISSUES.md`: `audit/scripts/ledger-seed.mjs`, `round.mjs`, `selftest.mjs` (22→45 `ok` lines), `ledgers.md`, `audit/SKILL.md`, `rewrite/SKILL.md`, `critic-briefs.md`, `measurements.md` M24, `CHANGELOG.md`, E3 and E4 | first pass: promised the verifier a file that did not exist, cited a step not on the page, dropped `drop` from the schema, let the seed accept what the contract forbade, made the verifier mandatory; one commit fixed its own wrong line number in E4 |
| 6 | Codex Sol R1 | review by running: six runtime claims, five planted breaks, text and contract | 32 commands, 13.5 min | all six runtime claims pass; ten text/contract findings; verdict not mergeable | — |
| 6 | Codex Sol R1 (resumed) | re-review after the fixes | 17 commands, 8 min | ten resolved, four new; verdict not mergeable | — |
| 6 | coordinator | verification of the last fix pass under the redirect rule | — | selftest 45/0, no "catch rate" or "step 4b", 14 commits, plugin tree clean before this record was written, syntax, E4 citations | not an independent agent; the skill allows it for a bounded check |
| 6 | Codex Sol K4 | completeness critic on the third closing answer | 24 commands, 10 min | `k4-completeness.md`: partial — 55 checked, 50 matched; "clean tree" while the record was unstaged, 24→45 where the archive gives 22→45, "every check a planted violation" against positive-path assertions, "no audit run file" against the 2026-09-10 one; E3's stale `round.mjs:105` | — |
| 7 | Opus P0 | the reader profile and the seven questions | 61k tokens, 2.5 min | the profile in `audit-2026-09-22/audit.md`; two controls, one planted unanswerable; four questions for the owner | named Q2 a control; the truth pass showed the text answers it wrongly, and Q6 took its place as P0 itself anticipated |
| 7 | Opus T1 | the truth pass and the key draft | 412k tokens, 36 min | `audit-2026-09-22/claim-ledger.md` (46 entries + `json claims`), `key-draft.md`; the seed's first live run | twice the estimated cost: installed the plugin in an isolated configuration and ran the lifecycle recipe; the coordinator's brief expected `-` for refuted rows on the original, which is backwards, and T1 said so |
| 7 | Codex Luna Q1d–Q7n | fourteen readers, seven with the documentation and seven without | 0–3 commands, 18–39 s each | `audit-2026-09-22/readers.md` | Q7d answered the planted question with a confident yes; the wrapper's tokens (≈12k each) are the wrapper's, not Codex's |
| 7 | Codex Sol TA | task reader: install and start the first audit | 24 commands, 17 min | `readers.md`, TA | copied the machine's `~/.claude.json` into its scratch configuration to transfer authentication (wrong, and its scratch directory holds the copy until deleted); ran a live Claude session with the machine's profile through `--plugin-dir` |
| 7 | Codex Sol TB | task reader: audit to candidate, as a plan | 12 commands, 5.5 min | `readers.md`, TB | — |
| 7 | coordinator | steps 1, 4 and 6: scope, the key's decisions, the score, the run file, E5–E9 | — | `audit-2026-09-22/audit.md`, `ISSUES.md` E5–E9 | the zsh one-based array shifted the first fourteen reader prompts by one question; caught before the fan-out |
| 7 | Codex Sol K5 | completeness critic on the closing answer | see `k5-completeness.md` | `k5-completeness.md` | — |

Codex tokens are not measured by the driver; commands and minutes are what its reports carry. Claude tokens
and minutes are the harness's task notifications. None of these figures is in the copied returns, so they
cannot be re-derived from this directory. The returns were copied with `cp` from the paths the agents named.

## The coordinator's own errors

- Wave 7: the reader prompts were generated from a zsh array indexed as if zero-based; question 1 was
  empty and question 7 unassigned. Caught by reading one brief whole before spawning; fourteen unrun
  prompt directories remain in the data directory.
- Wave 7: the truth-pass brief expected refuted rows to read `-` on the original; T1 corrected it.

- The third closing answer, first draft: the four K4 lists in its row above. Fixed before it went out;
  E3's line number fixed in its own commit.

- The second closing answer, first draft: four overstatements K3 lists in its row above, and seventeen agents
  where the rows count fifteen. Fixed before the answer went out.

- The wave-4 README section, first draft: per-target sums that did not reach 85, unlabelled subsets of the
  mapper's lists, three normalisation classes where the mapper named five. Fixed after K2.

- Scouting named the unrun declared check as the root cause of the regressions. D1 put it at 4 of 25.
- M1's brief listed files that were in a different directory.

## Regressions

Not computed: no document of the plugin was revised, and the two design documents were not run through the
ledger. The nearest figure is C2's recount of v2's disposition table — of 34 fixes claimed, 9 do not hold.
