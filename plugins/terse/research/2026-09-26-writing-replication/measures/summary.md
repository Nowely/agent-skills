# Key numbers and where each one comes from

Every number below is in the file named beside it; agent answers are copied verbatim under agents/.

## Scope
- Session files with at least one human message: 197; 53 of them are scripted test runs in temporary folders, excluded;
  the current session excluded; 144 sessions in five projects remain. Oldest session start 2026-08-17. (measures/scouting.md;
  corpus/index.json lists the 144)

## Corpus (Codex Sol E1, rebuilt once after the split critique)
- 144 sessions, 125 independent dialogs; turns: 1,745 user (unique), 5,640 assistant, 2,992 assistant-tool;
  187 parts, 792 pages, longest page 17,517 characters. (corpus/measures/corpus-stats.md, corpus/index.json, agents/E1b.json)
- Human messages counted per session file by an independent script: 2,406, 0 mismatches with the build over 144 sessions
  (includes copies in resumed sessions; unique user turns are 1,745). (corpus/measures/human-count-crosscheck.md)
- Mid-turn human messages recovered: 278 unique; in-file duplicate records removed: 1,775. (agents/E1b.json)
- Split critique (Codex Astra J0): 24 findings; dispositions in measures/J0-dispositions.md. (agents/J0.json)

## Pilot
- Protocol fixed before running: measures/pilot-protocol.md (with the amendment after pilot 1).
- Pilot 1, medium: recall 2/2, extra 12/22. (measures/pilot-medium-compare.md)
- Pilot 2, holdout parts (reference high = 21): medium recall 21/21, extra 4/34; high recall 21/21, extra 1/31.
  (measures/pilot2-holdout-compare.md, measures/pilot2h-holdout-compare.md, measures/pilot-decision.md)
- Reference: Opus R, 25 episodes on six parts (2 high) + 44 on three holdout parts (21 high). (pilot/opus-R-*.json)

## Collection (Codex Luna, effort high, angles A and B per part)
- 374 agent runs (187 parts x 2), 1,584 of 1,584 page reads verified whole in the agents' own Codex logs; one agent
  relaunched once. (measures/coverage/col.json, colr1.json, pilot2-all.json; measures/batches/*.tsv)
- 499 raw episodes (A 227, B 272). (agents/E2.json)

## Summary (Codex Sol E2)
- 323 episodes from 51 independent dialogs; A+B agreement on 74 counted once; 100 quote repairs accepted, 33 quotes
  needs_review; 40 episodes carry an unverified quote and are not used as support. (episodes/measures/merge-stats.md,
  episodes/measures/quote-repairs.md, agents/E2.json)
- Five dialogs hold 148 of 323 episodes. (agents/J1.json evidence; analysis/opus-A1-principles.md)

## Analysis
- Opus A1 (bottom-up, episodes only): 31 candidates (20 strong / 9 moderate / 2 weak). (analysis/opus-A1-principles.md)
- Codex Sol A2 turn 1 claimed a full read but its log shows 419 of 1,745 human turns; kept as a keyword search, 12
  gap episodes. (measures/A2-1-reading-check.md, analysis/A2-gaps.json)
- Five Codex Sol readers A2a-A2e: 94 of 94 pages of all 1,745 human turns read whole; 16 gap episodes, all 46 quotes OK.
  Union with the keyword search: 20 human turns. (measures/coverage/A2readers.json, analysis/A2-gaps-readers.json)
- Codex Sol A2 turn 2: 66 stored rules, 58 about writing, from 21 files; origin user_words 12 / assistant_interpretation
  40 / unknown 14; 15 visibly written in the corpus. (analysis/A2-rules.json, agents/A2-2.json)
- Fable D1: 30 principles (21 strong / 9 moderate); 215 episodes in support. (principles/fable-D1-principles.md, .json)

## Stress test (Codex Luna, effort high)
- 313 principle x episode pairs: supports 280, contradicts 5, out_of_scope 17, insufficient_data 11; quotes exact 307/313.
  (stress/pairs-verdicts.json, stress/summary.md)
- 187 counterexample searches (13 relaunched once, one twice; all pages read at the end): 172 findings — supports_new
  151, narrows_scope 18, contradicts 3; user quotes exact 162/172. (stress/cx-findings.json, measures/coverage/stress-*.json)
- Of the 151 supports_new, 91 repeat turns already counted (not treated as independent). (agents/J1.json)

## Verdict (Codex Astra J1)
- keep 14 / revise 15 / merge 0 / drop 0 / unknown 1; template risk high on 15; 29 of 29 decisive quotes verified
  verbatim by the coordinator's script. (verdicts/J1-verdicts.json, agents/J1.json)

## Final principles and the comparison
- 29 principles (20 strong / 9 moderate) and 1 candidate after the judge's verdicts and the stress-test recount.
  (principles/final-principles.json, local)
- Against the first run's 23 principles: confirmed 9, partly confirmed 12, contradicted 0, not found 2; new here 15.
  (comparison/X1-comparison.json, local; agents/X1.json)

## Tokens
- Codex, all agents: measures/tokens.md (tokenUsage.total from every report).
- Claude agents: measures/claude-tokens.md (Opus R 0.42M, Opus A1 0.34M, Fable D1 0.35M after the draft and 0.59M after all three turns; wrappers 13-17k each).

## Limits recorded during the run
- Claude agents (Opus R, Opus A1, Fable D1) start with the owner's global CLAUDE.md and memory index loaded by the
  harness; Codex agents do not. A1 and D1 report not opening them and tracing every principle to episode ids.
- Outcomes are mostly moved_on (163 of 323); accepted_explicit 35.
