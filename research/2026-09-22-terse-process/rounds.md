# Rounds

One orchestrated round, three waves, the coordinator on Fable 5.1 (Opus 5 during scouting). The plan named
six agents and six ran; nothing was dropped. Agents read only; every artifact came back as text or a file
under the agent's own temporary directory and was copied here unchanged.

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

Codex tokens are not measured by the driver; commands and minutes are what its reports carry. Claude tokens
and minutes are the harness's task notifications. None of these figures is in the copied returns, so they
cannot be re-derived from this directory. The returns were copied with `cp` from the paths the agents named.

## The coordinator's own errors

- The wave-4 README section, first draft: per-target sums that did not reach 85, unlabelled subsets of the
  mapper's lists, three normalisation classes where the mapper named five. Fixed after K2.

- Scouting named the unrun declared check as the root cause of the regressions. D1 put it at 4 of 25.
- M1's brief listed files that were in a different directory.

## Regressions

None: no document of the plugin was revised in this round. The design is v1; a v2 written against the 34
findings would be the first round with a regression count.
