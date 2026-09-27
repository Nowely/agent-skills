# Pilot decision

Sources: measures/pilot-medium-compare.md (pilot 1), measures/pilot2-holdout-compare.md, pilot2-tuned-compare.md,
pilot2h-holdout-compare.md, pilot2h-tuned-compare.md, measures/batches/pilot2-all.tsv, measures/coverage/pilot2-all.json.

| level | holdout recall (G=21) | holdout extra | tuning-parts extra (G=2) | median tokens/run | mean | max | coverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| medium | 21/21 | 4/34 = 11.8 % | 7/19 = 36.8 % | 128,657 | 144,287 | 292,290 | 76/76 pages |
| high | 21/21 | 1/31 = 3.2 % | 4/13 = 30.8 % | 129,873 | 139,535 | 170,964 | 76/76 pages |

Decision: effort high for collection (holdout extra lower at equal recall; tokens equal). The nine pilot parts at high
(prefix pilot2h) are reused as their collection runs.

Forecast after pilot (Codex tokens): spent 16.8M; collection 178 parts x 2 x 139,535 x 1.15 = 57.1M; stress test 45M
(plan figure, recomputed after D1); remaining Sol/Astra ~18M; total ~137M = 1.19 x plan (115M). Stop threshold 230M.
Quota: 3 % used after 16.8M tokens.
Per-run stop threshold: 3 x pilot median = 3 x 129,873 = 389,619 tokens.
