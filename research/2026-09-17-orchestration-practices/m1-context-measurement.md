# Where the orchestrator's context goes — 46 orchestrated sessions

Measured 46 root transcripts (50,456 lines, 184.3 MB). Unparsable lines: 0. Lines with `isSidechain:true`: 0 (this Claude Code version keeps subagent turns out of the root file entirely).

## Method

- An **API turn** = one distinct `message.id`. Several assistant lines share it (one per content block, `apiBlockIndex`); `usage` is byte-identical on every line of a turn (0 mismatches in 18,068 usage lines), so the turn's usage is read once.
- `context_i = input_tokens + cache_creation_input_tokens + cache_read_input_tokens`; `growth_i = context_i - context_{i-1}`.
- Growth is split into two pools, not one:
  - **assistant pool** = `output_tokens` of turn i-1. This is measured, not assumed: on 2,325 turns where the user side contributed under 300 chars, `growth / prev output_tokens` has median 1.08 (q1 1.04, q3 1.17).
  - **user pool** = `growth_i - output_tokens_{i-1}`, split across the user-side blocks in proportion to chars.
- Assistant verbatim blocks (text, tool_use inputs) are priced at **2.9 chars/token** (p90–p95 of 1,926 turns whose only output was tool_use). The remainder of `output_tokens` is booked as **thinking**: 5,638 of the 6,014 stored thinking blocks have an **empty** `thinking` field and carry only a ~2,028-char encrypted `signature`, so reasoning text is not in the transcript and `output_tokens` is its only measure.
- User-side blocks are priced at **2.5 chars/token** (median of 797 turns dominated by a single block over 5,000 chars; IQR 2.26-2.71). Growth beyond that is booked as **unexplained_growth** rather than inflating whichever small block happened to be present.
- `<system-reminder>` spans are split out of user text. System reminders, the skill listing, queued user prompts and CLAUDE.md injections arrive as separate `attachment` lines, not inline, and are treated as user-side blocks. `prompt_snapshot` attachments (system prompt + tool schemas) are excluded from growth and reported separately. Images are priced at a flat 6,000 chars; their base64 would otherwise dominate.
- Turn 0: the part of the initial context not explained by its own blocks at 2.5 chars/token is booked as `system_prompt_baseline`.
- `toolUseResult` is client-side bookkeeping (for Edit/Write it holds whole files, for TaskOutput 35x the message) and is **not** what was sent; only `message.content` is the API message, and only it is counted.

## Per session

| session | project | date | turns | init_ctx | peak_ctx | final_ctx | compact_marks | ctx_drops | user chars/token | attributed_tok | blocks unattributed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| eab0cdb0 | codex-delegate | 2026-09-01 | 423 | 31,801 | 834,950 | 664,225 | 2 | 2 | 1.88 | 1,640,108 | 38 |
| 73ed8645 | arcadia | 2026-09-03 | 499 | 32,875 | 818,303 | 818,303 | 0 | 2 | 1.21 | 1,275,338 | 12 |
| fd3bbe62 | arcadia | 2026-09-03 | 382 | 32,875 | 675,041 | 675,041 | 0 | 2 | 1.11 | 1,132,076 | 12 |
| 3251fa94 | headless-gate | 2026-09-07 | 9 | 28,483 | 67,380 | 67,380 | 0 | 0 | 2.79 | 67,380 | 0 |
| 52259b1f | headless-gate | 2026-09-07 | 3 | 30,016 | 37,966 | 37,966 | 0 | 0 | 2.94 | 37,966 | 0 |
| 58f659a9 | headless-gate | 2026-09-07 | 10 | 30,015 | 56,759 | 56,759 | 0 | 0 | 3.51 | 56,759 | 0 |
| b2d5773e | codex-delegate | 2026-09-07 | 70 | 34,992 | 425,906 | 425,906 | 0 | 0 | 2.50 | 425,907 | 10 |
| d7cc77e7 | codex-delegate | 2026-09-07 | 123 | 32,334 | 294,091 | 294,091 | 0 | 0 | 2.42 | 294,092 | 2 |
| 08a43de9 | codex-delegate | 2026-09-08 | 229 | 33,050 | 622,325 | 622,325 | 0 | 0 | 2.28 | 623,678 | 16 |
| 099f69cc | headless-gate | 2026-09-08 | 3 | 30,025 | 37,953 | 37,953 | 0 | 0 | 2.96 | 37,953 | 0 |
| 47703c0c | headless-gate | 2026-09-08 | 11 | 30,236 | 49,261 | 49,261 | 0 | 0 | 3.60 | 49,261 | 0 |
| 826bad2b | codex-delegate | 2026-09-08 | 269 | 33,050 | 685,411 | 685,411 | 0 | 0 | 2.28 | 685,424 | 18 |
| c0138a46 | headless-gate | 2026-09-08 | 9 | 30,065 | 49,084 | 49,084 | 0 | 0 | 2.96 | 49,084 | 0 |
| d46c4813 | codex-delegate | 2026-09-08 | 65 | 34,375 | 284,418 | 284,418 | 0 | 0 | 2.43 | 284,420 | 2 |
| f9492b6f | codex-delegate | 2026-09-08 | 33 | 27,307 | 152,947 | 152,947 | 0 | 0 | 2.50 | 152,948 | 4 |
| fc25a59e | headless-gate | 2026-09-08 | 6 | 30,054 | 41,497 | 41,497 | 0 | 0 | 2.44 | 41,497 | 0 |
| 1e226d56 | codex-delegate | 2026-09-09 | 89 | 0 | 175,554 | 175,554 | 0 | 0 | 1.71 | 175,554 | 0 |
| 3254e0db | codex-delegate | 2026-09-09 | 183 | 27,942 | 315,977 | 315,977 | 0 | 0 | 2.21 | 313,485 | 0 |
| 47e83390 | codex-delegate | 2026-09-09 | 178 | 34,169 | 536,390 | 536,390 | 0 | 1 | 2.38 | 605,610 | 5 |
| 66940b3c | headless-gate | 2026-09-09 | 11 | 30,261 | 54,723 | 54,723 | 0 | 0 | 3.10 | 54,723 | 0 |
| 6d147622 | headless-gate | 2026-09-09 | 11 | 30,501 | 51,302 | 51,302 | 0 | 0 | 3.15 | 51,302 | 0 |
| c407c061 | arcadia | 2026-09-09 | 520 | 34,278 | 698,162 | 698,162 | 0 | 0 | 6.13 | 698,162 | 0 |
| 5890e172 | codex-delegate | 2026-09-10 | 170 | 27,831 | 403,054 | 403,054 | 0 | 0 | 2.28 | 403,054 | 0 |
| 64f6a7d8 | agent-skills | 2026-09-10 | 147 | 0 | 255,962 | 255,962 | 0 | 0 | 1.91 | 255,962 | 0 |
| 64f6a7d8 | codex-delegate | 2026-09-10 | 51 | 0 | 168,106 | 168,106 | 0 | 0 | 1.53 | 168,106 | 0 |
| c6aa24a3 | agent-skills | 2026-09-10 | 414 | 27,831 | 667,488 | 154,401 | 0 | 1 | 2.26 | 781,613 | 19 |
| c6aa24a3 | codex-delegate | 2026-09-10 | 348 | 27,831 | 667,488 | 667,488 | 0 | 0 | 2.30 | 671,199 | 5 |
| 0e2d84bf | agent-skills | 2026-09-11 | 127 | 34,832 | 396,575 | 396,575 | 0 | 0 | 1.87 | 396,575 | 0 |
| 6b7a0680 | agent-skills | 2026-09-11 | 807 | 38,565 | 876,637 | 765,916 | 2 | 2 | 1.95 | 1,758,344 | 26 |
| b1e2a3a5 | agent-skills | 2026-09-11 | 199 | 34,832 | 581,947 | 581,947 | 0 | 0 | 2.08 | 581,947 | 0 |
| d737ff38 | agent-skills | 2026-09-11 | 931 | 38,565 | 876,637 | 753,830 | 4 | 3 | 2.10 | 2,445,007 | 52 |
| f527a795 | agent-skills | 2026-09-11 | 1150 | 38,565 | 876,637 | 54,537 | 4 | 5 | 1.84 | 2,746,866 | 73 |
| 1b4d11e7 | headless-gate | 2026-09-12 | 3 | 31,135 | 45,894 | 45,894 | 0 | 0 | 2.84 | 45,894 | 0 |
| 22f6e0a9 | headless-gate | 2026-09-12 | 11 | 31,135 | 63,176 | 63,176 | 0 | 0 | 3.15 | 63,176 | 0 |
| 2687e41f | headless-gate | 2026-09-12 | 11 | 31,135 | 58,888 | 58,888 | 0 | 0 | 3.18 | 58,888 | 0 |
| 30805d36 | agent-skills | 2026-09-12 | 22 | 33,282 | 141,616 | 141,616 | 0 | 0 | 2.61 | 141,616 | 2 |
| 30a03d40 | agent-skills | 2026-09-12 | 185 | 33,036 | 821,246 | 821,246 | 0 | 0 | 2.15 | 821,251 | 8 |
| 54916180 | headless-gate | 2026-09-12 | 11 | 31,134 | 61,607 | 61,607 | 0 | 0 | 3.12 | 61,607 | 0 |
| 74a14ec2 | agent-skills | 2026-09-12 | 129 | 31,404 | 439,618 | 439,618 | 0 | 0 | 2.39 | 439,618 | 0 |
| 909909cc | headless-gate | 2026-09-12 | 13 | 31,134 | 72,632 | 72,632 | 0 | 0 | 3.02 | 72,632 | 0 |
| 9c3cc822 | headless-gate | 2026-09-12 | 3 | 31,133 | 46,094 | 46,094 | 0 | 0 | 2.84 | 46,094 | 0 |
| f7ab0fca | headless-gate | 2026-09-12 | 17 | 31,133 | 73,499 | 73,499 | 0 | 0 | 2.85 | 73,499 | 0 |
| da50f730 | arcadia | 2026-09-14 | 150 | 29,327 | 467,162 | 467,162 | 0 | 0 | 5.87 | 467,162 | 0 |
| 1fe60ced | arcadia | 2026-09-16 | 191 | 29,218 | 310,774 | 310,774 | 0 | 0 | 7.77 | 310,774 | 0 |
| 42691a3b | agent-skills | 2026-09-16 | 209 | 49,817 | 649,022 | 649,022 | 0 | 1 | 0.80 | 1,219,437 | 15 |
| 035850d2 | agent-skills | 2026-09-17 | 11 | 33,405 | 134,774 | 134,774 | 0 | 0 | 2.49 | 134,774 | 0 |

## Category share of attributed context, per session (tokens, % of that session)

| session | project | total | thinking | bash_result | unexplained_growth | tool_use_input_other | user_text | write_edit_input | system_reminder | assistant_text | system_prompt_baseline | read_result | skill_load | taskoutput | other_tool_result | agent_return | workflow |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| eab0cdb0 | codex-delegate | 1,640,108 | 375,612 (22.9%) | 296,299 (18.1%) | 238,981 (14.6%) | 255,068 (15.6%) | 212,676 (13.0%) | 16,678 (1.0%) | 46,051 (2.8%) | 55,716 (3.4%) | 15,174 (0.9%) | 68,743 (4.2%) | 292 (0.0%) | 0 (0.0%) | 29,243 (1.8%) | 23,762 (1.4%) | 5,812 (0.4%) |
| 73ed8645 | arcadia | 1,275,338 | 263,987 (20.7%) | 88,149 (6.9%) | 498,250 (39.1%) | 78,606 (6.2%) | 49,164 (3.9%) | 30,515 (2.4%) | 45,768 (3.6%) | 38,449 (3.0%) | 16,086 (1.3%) | 92,218 (7.2%) | 25,116 (2.0%) | 0 (0.0%) | 43,289 (3.4%) | 4,723 (0.4%) | 1,019 (0.1%) |
| fd3bbe62 | arcadia | 1,132,076 | 216,162 (19.1%) | 60,219 (5.3%) | 491,203 (43.4%) | 51,464 (4.5%) | 48,436 (4.3%) | 25,309 (2.2%) | 33,172 (2.9%) | 31,721 (2.8%) | 16,086 (1.4%) | 86,406 (7.6%) | 25,118 (2.2%) | 0 (0.0%) | 41,038 (3.6%) | 4,723 (0.4%) | 1,019 (0.1%) |
| 3251fa94 | headless-gate | 67,380 | 26,102 (38.7%) | 538 (0.8%) | 280 (0.4%) | 2,689 (4.0%) | 1 (0.0%) | 292 (0.4%) | 9,274 (13.8%) | 1,518 (2.3%) | 17,245 (25.6%) | 0 (0.0%) | 8,648 (12.8%) | 0 (0.0%) | 134 (0.2%) | 644 (1.0%) | 15 (0.0%) |
| 52259b1f | headless-gate | 37,966 | 716 (1.9%) | 404 (1.1%) | 54 (0.1%) | 177 (0.5%) | 0 (0.0%) | 0 (0.0%) | 9,151 (24.1%) | 37 (0.1%) | 18,803 (49.5%) | 0 (0.0%) | 8,623 (22.7%) | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) |
| 58f659a9 | headless-gate | 56,759 | 12,275 (21.6%) | 431 (0.8%) | 651 (1.1%) | 2,441 (4.3%) | 760 (1.3%) | 221 (0.4%) | 10,700 (18.9%) | 934 (1.6%) | 18,802 (33.1%) | 315 (0.6%) | 8,611 (15.2%) | 0 (0.0%) | 31 (0.1%) | 0 (0.0%) | 589 (1.0%) |
| b2d5773e | codex-delegate | 425,907 | 99,781 (23.4%) | 123,815 (29.1%) | 10,718 (2.5%) | 50,560 (11.9%) | 7,947 (1.9%) | 2,777 (0.7%) | 30,177 (7.1%) | 4,453 (1.0%) | 15,241 (3.6%) | 75,252 (17.7%) | 4,049 (1.0%) | 0 (0.0%) | 604 (0.1%) | 0 (0.0%) | 532 (0.1%) |
| d7cc77e7 | codex-delegate | 294,092 | 81,832 (27.8%) | 105,323 (35.8%) | 10,958 (3.7%) | 31,808 (10.8%) | 10,210 (3.5%) | 5,911 (2.0%) | 21,710 (7.4%) | 5,226 (1.8%) | 15,372 (5.2%) | 692 (0.2%) | 4,106 (1.4%) | 0 (0.0%) | 421 (0.1%) | 0 (0.0%) | 524 (0.2%) |
| 08a43de9 | codex-delegate | 623,678 | 198,708 (31.9%) | 86,272 (13.8%) | 26,194 (4.2%) | 108,263 (17.4%) | 100,512 (16.1%) | 1,532 (0.2%) | 26,007 (4.2%) | 29,076 (4.7%) | 16,004 (2.6%) | 12,580 (2.0%) | 8,506 (1.4%) | 0 (0.0%) | 411 (0.1%) | 9,097 (1.5%) | 516 (0.1%) |
| 099f69cc | headless-gate | 37,953 | 643 (1.7%) | 272 (0.7%) | 31 (0.1%) | 387 (1.0%) | 0 (0.0%) | 0 (0.0%) | 9,151 (24.1%) | 34 (0.1%) | 18,801 (49.5%) | 0 (0.0%) | 8,634 (22.7%) | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) |
| 47703c0c | headless-gate | 49,261 | 5,533 (11.2%) | 839 (1.7%) | 441 (0.9%) | 820 (1.7%) | 0 (0.0%) | 1,214 (2.5%) | 10,794 (21.9%) | 937 (1.9%) | 18,092 (36.7%) | 0 (0.0%) | 10,159 (20.6%) | 0 (0.0%) | 432 (0.9%) | 0 (0.0%) | 0 (0.0%) |
| 826bad2b | codex-delegate | 685,424 | 226,896 (33.1%) | 102,601 (15.0%) | 28,724 (4.2%) | 119,510 (17.4%) | 99,504 (14.5%) | 1,038 (0.2%) | 27,851 (4.1%) | 31,800 (4.6%) | 16,004 (2.3%) | 12,580 (1.8%) | 8,506 (1.2%) | 0 (0.0%) | 375 (0.1%) | 9,519 (1.4%) | 516 (0.1%) |
| c0138a46 | headless-gate | 49,084 | 6,410 (13.1%) | 490 (1.0%) | 314 (0.6%) | 1,621 (3.3%) | 699 (1.4%) | 220 (0.4%) | 10,449 (21.3%) | 711 (1.4%) | 18,754 (38.2%) | 81 (0.2%) | 8,721 (17.8%) | 0 (0.0%) | 24 (0.0%) | 0 (0.0%) | 589 (1.2%) |
| d46c4813 | codex-delegate | 284,420 | 102,802 (36.1%) | 75,161 (26.4%) | 6,744 (2.4%) | 28,863 (10.1%) | 10,370 (3.6%) | 1,531 (0.5%) | 18,869 (6.6%) | 8,141 (2.9%) | 16,893 (5.9%) | 0 (0.0%) | 8,680 (3.1%) | 0 (0.0%) | 217 (0.1%) | 6,150 (2.2%) | 0 (0.0%) |
| f9492b6f | codex-delegate | 152,948 | 39,933 (26.1%) | 45,231 (29.6%) | 2,059 (1.3%) | 16,290 (10.7%) | 395 (0.3%) | 0 (0.0%) | 20,687 (13.5%) | 4,081 (2.7%) | 17,134 (11.2%) | 0 (0.0%) | 3,903 (2.6%) | 0 (0.0%) | 0 (0.0%) | 3,236 (2.1%) | 0 (0.0%) |
| fc25a59e | headless-gate | 41,497 | 2,822 (6.8%) | 440 (1.1%) | 477 (1.2%) | 720 (1.7%) | 1 (0.0%) | 562 (1.4%) | 7,720 (18.6%) | 687 (1.7%) | 18,791 (45.3%) | 110 (0.3%) | 8,673 (20.9%) | 0 (0.0%) | 228 (0.5%) | 266 (0.6%) | 0 (0.0%) |
| 1e226d56 | codex-delegate | 175,554 | 46,578 (26.5%) | 44,792 (25.5%) | 35,526 (20.2%) | 7,625 (4.3%) | 504 (0.3%) | 11,278 (6.4%) | 4,693 (2.7%) | 6,205 (3.5%) | 0 (0.0%) | 0 (0.0%) | 4,730 (2.7%) | 11,324 (6.5%) | 1,479 (0.8%) | 821 (0.5%) | 0 (0.0%) |
| 3254e0db | codex-delegate | 313,485 | 118,078 (37.7%) | 66,813 (21.3%) | 16,200 (5.2%) | 20,770 (6.6%) | 2,269 (0.7%) | 11,562 (3.7%) | 22,140 (7.1%) | 16,523 (5.3%) | 15,822 (5.0%) | 16,487 (5.3%) | 4,674 (1.5%) | 0 (0.0%) | 2,148 (0.7%) | 0 (0.0%) | 0 (0.0%) |
| 47e83390 | codex-delegate | 605,610 | 135,799 (22.4%) | 91,632 (15.1%) | 46,730 (7.7%) | 60,343 (10.0%) | 134,976 (22.3%) | 25,797 (4.3%) | 19,685 (3.3%) | 18,020 (3.0%) | 16,758 (2.8%) | 440 (0.1%) | 5,649 (0.9%) | 44,658 (7.4%) | 2,274 (0.4%) | 2,850 (0.5%) | 0 (0.0%) |
| 66940b3c | headless-gate | 54,723 | 8,269 (15.1%) | 427 (0.8%) | 1,768 (3.2%) | 824 (1.5%) | 202 (0.4%) | 812 (1.5%) | 10,349 (18.9%) | 584 (1.1%) | 18,027 (32.9%) | 2,168 (4.0%) | 10,883 (19.9%) | 65 (0.1%) | 345 (0.6%) | 0 (0.0%) | 0 (0.0%) |
| 6d147622 | headless-gate | 51,302 | 5,095 (9.9%) | 611 (1.2%) | 1,603 (3.1%) | 688 (1.3%) | 197 (0.4%) | 664 (1.3%) | 10,603 (20.7%) | 960 (1.9%) | 18,053 (35.2%) | 1,845 (3.6%) | 10,571 (20.6%) | 65 (0.1%) | 345 (0.7%) | 0 (0.0%) | 0 (0.0%) |
| c407c061 | arcadia | 698,162 | 225,233 (32.3%) | 78,927 (11.3%) | 46,103 (6.6%) | 60,191 (8.6%) | 33,238 (4.8%) | 34,119 (4.9%) | 34,780 (5.0%) | 36,786 (5.3%) | 16,918 (2.4%) | 32,586 (4.7%) | 13,671 (2.0%) | 3,600 (0.5%) | 79,034 (11.3%) | 2,976 (0.4%) | 0 (0.0%) |
| 5890e172 | codex-delegate | 403,054 | 117,022 (29.0%) | 93,749 (23.3%) | 20,692 (5.1%) | 25,220 (6.3%) | 15,767 (3.9%) | 22,439 (5.6%) | 14,722 (3.7%) | 37,213 (9.2%) | 16,000 (4.0%) | 12,352 (3.1%) | 12,425 (3.1%) | 12,985 (3.2%) | 1,654 (0.4%) | 816 (0.2%) | 0 (0.0%) |
| 64f6a7d8 | agent-skills | 255,962 | 67,584 (26.4%) | 48,074 (18.8%) | 37,550 (14.7%) | 21,088 (8.2%) | 4,766 (1.9%) | 34,737 (13.6%) | 12,811 (5.0%) | 10,318 (4.0%) | 0 (0.0%) | 5,218 (2.0%) | 10,209 (4.0%) | 246 (0.1%) | 2,975 (1.2%) | 387 (0.2%) | 0 (0.0%) |
| 64f6a7d8 | codex-delegate | 168,106 | 41,735 (24.8%) | 32,107 (19.1%) | 36,000 (21.4%) | 6,027 (3.6%) | 4,766 (2.8%) | 26,412 (15.7%) | 961 (0.6%) | 8,610 (5.1%) | 0 (0.0%) | 0 (0.0%) | 10,209 (6.1%) | 246 (0.1%) | 646 (0.4%) | 387 (0.2%) | 0 (0.0%) |
| c6aa24a3 | agent-skills | 781,613 | 253,295 (32.4%) | 146,831 (18.8%) | 37,966 (4.9%) | 60,818 (7.8%) | 66,557 (8.5%) | 54,629 (7.0%) | 23,806 (3.0%) | 77,076 (9.9%) | 16,000 (2.0%) | 19,558 (2.5%) | 11,745 (1.5%) | 0 (0.0%) | 6,482 (0.8%) | 6,851 (0.9%) | 0 (0.0%) |
| c6aa24a3 | codex-delegate | 671,199 | 204,027 (30.4%) | 124,225 (18.5%) | 28,985 (4.3%) | 52,230 (7.8%) | 66,188 (9.9%) | 54,629 (8.1%) | 21,488 (3.2%) | 65,325 (9.7%) | 16,000 (2.4%) | 13,273 (2.0%) | 11,745 (1.7%) | 0 (0.0%) | 6,235 (0.9%) | 6,851 (1.0%) | 0 (0.0%) |
| 0e2d84bf | agent-skills | 396,575 | 121,365 (30.6%) | 85,808 (21.6%) | 41,338 (10.4%) | 58,754 (14.8%) | 17,394 (4.4%) | 3,652 (0.9%) | 18,680 (4.7%) | 20,177 (5.1%) | 11,957 (3.0%) | 9,955 (2.5%) | 5,218 (1.3%) | 0 (0.0%) | 739 (0.2%) | 0 (0.0%) | 1,538 (0.4%) |
| 6b7a0680 | agent-skills | 1,758,344 | 487,872 (27.7%) | 317,052 (18.0%) | 224,867 (12.8%) | 187,921 (10.7%) | 83,514 (4.7%) | 185,673 (10.6%) | 92,487 (5.3%) | 93,406 (5.3%) | 12,394 (0.7%) | 39,910 (2.3%) | 54 (0.0%) | 0 (0.0%) | 24,664 (1.4%) | 1,273 (0.1%) | 7,256 (0.4%) |
| b1e2a3a5 | agent-skills | 581,947 | 176,340 (30.3%) | 135,595 (23.3%) | 43,169 (7.4%) | 82,757 (14.2%) | 31,680 (5.4%) | 12,019 (2.1%) | 23,819 (4.1%) | 40,239 (6.9%) | 11,957 (2.1%) | 9,955 (1.7%) | 10,310 (1.8%) | 0 (0.0%) | 1,275 (0.2%) | 1,294 (0.2%) | 1,538 (0.3%) |
| d737ff38 | agent-skills | 2,445,007 | 706,856 (28.9%) | 478,732 (19.6%) | 233,267 (9.5%) | 329,261 (13.5%) | 155,511 (6.4%) | 221,669 (9.1%) | 111,696 (4.6%) | 110,872 (4.5%) | 12,394 (0.5%) | 39,910 (1.6%) | 6,292 (0.3%) | 0 (0.0%) | 26,304 (1.1%) | 4,986 (0.2%) | 7,256 (0.3%) |
| f527a795 | agent-skills | 2,746,866 | 729,441 (26.6%) | 536,655 (19.5%) | 404,441 (14.7%) | 276,706 (10.1%) | 110,773 (4.0%) | 292,488 (10.6%) | 129,082 (4.7%) | 145,883 (5.3%) | 12,394 (0.5%) | 58,956 (2.1%) | 54 (0.0%) | 0 (0.0%) | 38,636 (1.4%) | 2,547 (0.1%) | 8,811 (0.3%) |
| 1b4d11e7 | headless-gate | 45,894 | 3,604 (7.9%) | 271 (0.6%) | 0 (0.0%) | 419 (0.9%) | 0 (0.0%) | 0 (0.0%) | 9,007 (19.6%) | 52 (0.1%) | 18,039 (39.3%) | 76 (0.2%) | 14,390 (31.4%) | 0 (0.0%) | 35 (0.1%) | 0 (0.0%) | 0 (0.0%) |
| 22f6e0a9 | headless-gate | 63,176 | 13,396 (21.2%) | 560 (0.9%) | 1,386 (2.2%) | 1,722 (2.7%) | 505 (0.8%) | 899 (1.4%) | 10,321 (16.3%) | 787 (1.2%) | 18,039 (28.6%) | 75 (0.1%) | 14,444 (22.9%) | 330 (0.5%) | 346 (0.5%) | 365 (0.6%) | 0 (0.0%) |
| 2687e41f | headless-gate | 58,888 | 9,691 (16.5%) | 594 (1.0%) | 1,411 (2.4%) | 1,656 (2.8%) | 360 (0.6%) | 775 (1.3%) | 10,307 (17.5%) | 757 (1.3%) | 18,039 (30.6%) | 75 (0.1%) | 14,328 (24.3%) | 187 (0.3%) | 345 (0.6%) | 363 (0.6%) | 0 (0.0%) |
| 30805d36 | agent-skills | 141,616 | 38,151 (26.9%) | 34,433 (24.3%) | 1,472 (1.0%) | 11,474 (8.1%) | 4,578 (3.2%) | 1,918 (1.4%) | 18,538 (13.1%) | 2,089 (1.5%) | 14,290 (10.1%) | 0 (0.0%) | 13,225 (9.3%) | 479 (0.3%) | 118 (0.1%) | 850 (0.6%) | 0 (0.0%) |
| 30a03d40 | agent-skills | 821,251 | 162,995 (19.8%) | 128,465 (15.6%) | 83,893 (10.2%) | 90,880 (11.1%) | 58,668 (7.1%) | 24,728 (3.0%) | 29,083 (3.5%) | 9,506 (1.2%) | 14,258 (1.7%) | 0 (0.0%) | 13,246 (1.6%) | 193,389 (23.5%) | 1,302 (0.2%) | 10,838 (1.3%) | 0 (0.0%) |
| 54916180 | headless-gate | 61,607 | 11,358 (18.4%) | 882 (1.4%) | 1,465 (2.4%) | 1,723 (2.8%) | 564 (0.9%) | 846 (1.4%) | 10,467 (17.0%) | 822 (1.3%) | 18,038 (29.3%) | 0 (0.0%) | 14,359 (23.3%) | 385 (0.6%) | 345 (0.6%) | 353 (0.6%) | 0 (0.0%) |
| 74a14ec2 | agent-skills | 439,618 | 173,233 (39.4%) | 99,379 (22.6%) | 15,850 (3.6%) | 69,875 (15.9%) | 7,847 (1.8%) | 0 (0.0%) | 34,030 (7.7%) | 12,441 (2.8%) | 13,010 (3.0%) | 0 (0.0%) | 0 (0.0%) | 2,540 (0.6%) | 6,963 (1.6%) | 4,450 (1.0%) | 0 (0.0%) |
| 909909cc | headless-gate | 72,632 | 20,509 (28.2%) | 451 (0.6%) | 1,833 (2.5%) | 1,942 (2.7%) | 427 (0.6%) | 774 (1.1%) | 10,487 (14.4%) | 1,128 (1.6%) | 18,038 (24.8%) | 1,871 (2.6%) | 14,215 (19.6%) | 250 (0.3%) | 346 (0.5%) | 363 (0.5%) | 0 (0.0%) |
| 9c3cc822 | headless-gate | 46,094 | 3,892 (8.4%) | 375 (0.8%) | 0 (0.0%) | 257 (0.6%) | 0 (0.0%) | 0 (0.0%) | 8,952 (19.4%) | 104 (0.2%) | 18,037 (39.1%) | 75 (0.2%) | 14,402 (31.2%) | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) |
| f7ab0fca | headless-gate | 73,499 | 16,484 (22.4%) | 685 (0.9%) | 2,591 (3.5%) | 3,174 (4.3%) | 939 (1.3%) | 1,747 (2.4%) | 10,319 (14.0%) | 1,017 (1.4%) | 18,037 (24.5%) | 2,262 (3.1%) | 14,440 (19.6%) | 586 (0.8%) | 485 (0.7%) | 731 (1.0%) | 0 (0.0%) |
| da50f730 | arcadia | 467,162 | 108,875 (23.3%) | 65,550 (14.0%) | 38,336 (8.2%) | 39,081 (8.4%) | 16,194 (3.5%) | 30,575 (6.5%) | 22,630 (4.8%) | 21,411 (4.6%) | 13,019 (2.8%) | 15,051 (3.2%) | 18,620 (4.0%) | 65,368 (14.0%) | 4,592 (1.0%) | 7,861 (1.7%) | 0 (0.0%) |
| 1fe60ced | arcadia | 310,774 | 80,651 (26.0%) | 50,430 (16.2%) | 12,480 (4.0%) | 19,549 (6.3%) | 23,053 (7.4%) | 22,059 (7.1%) | 38,154 (12.3%) | 14,623 (4.7%) | 13,033 (4.2%) | 12,538 (4.0%) | 18,601 (6.0%) | 422 (0.1%) | 3,622 (1.2%) | 1,559 (0.5%) | 0 (0.0%) |
| 42691a3b | agent-skills | 1,219,437 | 131,239 (10.8%) | 66,724 (5.5%) | 627,775 (51.5%) | 104,130 (8.5%) | 72,201 (5.9%) | 1,775 (0.1%) | 41,215 (3.4%) | 22,532 (1.8%) | 14,598 (1.2%) | 0 (0.0%) | 14,318 (1.2%) | 92,469 (7.6%) | 14,147 (1.2%) | 16,315 (1.3%) | 0 (0.0%) |
| 035850d2 | agent-skills | 134,774 | 39,878 (29.6%) | 35,318 (26.2%) | 2,531 (1.9%) | 3,900 (2.9%) | 246 (0.2%) | 0 (0.0%) | 19,927 (14.8%) | 2,793 (2.1%) | 14,469 (10.7%) | 0 (0.0%) | 15,338 (11.4%) | 0 (0.0%) | 0 (0.0%) | 373 (0.3%) | 0 (0.0%) |

## Skill loads per session

The orchestrate page and the codex/seat page are named separately where the load text identified them. `codex-delegate:orchestrate` rows are the small `<command-name>` invocation headers, not the page body.

| session | project | skill page | loads | chars | attributed_tok |
|---|---|---|---|---|---|
| eab0cdb0 | codex-delegate | Skill | 2 | 367 | 146 |
| eab0cdb0 | codex-delegate | grill-me | 1 | 172 | 55 |
| eab0cdb0 | codex-delegate | workflow-authoring | 1 | 135 | 54 |
| eab0cdb0 | codex-delegate | mattpocock-skills:grill-me | 1 | 118 | 38 |
| 73ed8645 | arcadia | arc | 1 | 26,718 | 10,155 |
| 73ed8645 | arcadia | arcanum | 1 | 18,314 | 6,905 |
| 73ed8645 | arcadia | codex-delegate | 1 | 10,132 | 3,960 |
| 73ed8645 | arcadia | tracker-mcp | 1 | 9,674 | 3,870 |
| 73ed8645 | arcadia | model | 2 | 274 | 110 |
| 73ed8645 | arcadia | Skill | 5 | 159 | 62 |
| 73ed8645 | arcadia | workflow-authoring | 1 | 135 | 54 |
| fd3bbe62 | arcadia | arc | 1 | 26,718 | 10,155 |
| fd3bbe62 | arcadia | arcanum | 1 | 18,314 | 6,907 |
| fd3bbe62 | arcadia | codex-delegate | 1 | 10,132 | 3,960 |
| fd3bbe62 | arcadia | tracker-mcp | 1 | 9,674 | 3,870 |
| fd3bbe62 | arcadia | model | 2 | 274 | 110 |
| fd3bbe62 | arcadia | Skill | 5 | 159 | 62 |
| fd3bbe62 | arcadia | workflow-authoring | 1 | 135 | 54 |
| 3251fa94 | headless-gate | orchestrate | 1 | 11,072 | 4,429 |
| 3251fa94 | headless-gate | codex-delegate | 1 | 10,156 | 4,062 |
| 3251fa94 | headless-gate | codex-delegate:orchestrate | 1 | 347 | 139 |
| 3251fa94 | headless-gate | Skill | 1 | 46 | 18 |
| 52259b1f | headless-gate | orchestrate | 1 | 11,009 | 4,404 |
| 52259b1f | headless-gate | codex-delegate | 1 | 10,156 | 4,062 |
| 52259b1f | headless-gate | codex-delegate:orchestrate | 1 | 347 | 139 |
| 52259b1f | headless-gate | Skill | 1 | 46 | 18 |
| 58f659a9 | headless-gate | orchestrate | 1 | 11,009 | 4,404 |
| 58f659a9 | headless-gate | codex-delegate | 1 | 10,156 | 4,050 |
| 58f659a9 | headless-gate | codex-delegate:orchestrate | 1 | 347 | 139 |
| 58f659a9 | headless-gate | Skill | 1 | 46 | 18 |
| b2d5773e | codex-delegate | codex-delegate | 1 | 10,112 | 3,983 |
| b2d5773e | codex-delegate | workflow-authoring | 1 | 135 | 54 |
| b2d5773e | codex-delegate | Skill | 1 | 31 | 12 |
| d7cc77e7 | codex-delegate | codex-delegate | 1 | 10,017 | 4,007 |
| d7cc77e7 | codex-delegate | workflow-authoring | 1 | 135 | 50 |
| d7cc77e7 | codex-delegate | codex-delegate:codex-delegate | 1 | 124 | 50 |
| 08a43de9 | codex-delegate | orchestrate | 1 | 10,983 | 4,393 |
| 08a43de9 | codex-delegate | codex-delegate | 1 | 10,316 | 4,035 |
| 08a43de9 | codex-delegate | codex-delegate:orchestrate | 1 | 118 | 47 |
| 08a43de9 | codex-delegate | Skill | 2 | 81 | 31 |
| 099f69cc | headless-gate | orchestrate | 1 | 11,035 | 4,414 |
| 099f69cc | headless-gate | codex-delegate | 1 | 10,156 | 4,062 |
| 099f69cc | headless-gate | codex-delegate:orchestrate | 1 | 347 | 139 |
| 099f69cc | headless-gate | Skill | 1 | 46 | 18 |
| 47703c0c | headless-gate | orchestrate | 1 | 13,287 | 5,315 |
| 47703c0c | headless-gate | codex-delegate | 1 | 11,742 | 4,667 |
| 47703c0c | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| 47703c0c | headless-gate | Skill | 1 | 46 | 18 |
| 826bad2b | codex-delegate | orchestrate | 1 | 10,983 | 4,393 |
| 826bad2b | codex-delegate | codex-delegate | 1 | 10,316 | 4,035 |
| 826bad2b | codex-delegate | codex-delegate:orchestrate | 1 | 118 | 47 |
| 826bad2b | codex-delegate | Skill | 2 | 81 | 31 |
| c0138a46 | headless-gate | orchestrate | 1 | 11,204 | 4,482 |
| c0138a46 | headless-gate | codex-delegate | 1 | 10,156 | 4,062 |
| c0138a46 | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| c0138a46 | headless-gate | Skill | 1 | 46 | 18 |
| d46c4813 | codex-delegate | orchestrate | 1 | 11,322 | 4,529 |
| d46c4813 | codex-delegate | codex-delegate | 1 | 10,316 | 4,035 |
| d46c4813 | codex-delegate | workflow-authoring | 1 | 135 | 51 |
| d46c4813 | codex-delegate | codex-delegate:orchestrate | 1 | 118 | 47 |
| d46c4813 | codex-delegate | Skill | 1 | 46 | 18 |
| f9492b6f | codex-delegate | codex-delegate | 1 | 10,017 | 3,885 |
| f9492b6f | codex-delegate | Skill | 1 | 46 | 18 |
| fc25a59e | headless-gate | orchestrate | 1 | 11,084 | 4,434 |
| fc25a59e | headless-gate | codex-delegate | 1 | 10,156 | 4,062 |
| fc25a59e | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| fc25a59e | headless-gate | Skill | 1 | 46 | 18 |
| 1e226d56 | codex-delegate | codex-delegate | 1 | 12,066 | 4,657 |
| 1e226d56 | codex-delegate | model | 1 | 138 | 55 |
| 1e226d56 | codex-delegate | Skill | 1 | 46 | 18 |
| 3254e0db | codex-delegate | codex-delegate | 1 | 12,066 | 4,657 |
| 3254e0db | codex-delegate | Skill | 1 | 46 | 18 |
| 47e83390 | codex-delegate | codex-delegate | 1 | 12,066 | 4,826 |
| 47e83390 | codex-delegate | grilling | 1 | 1,811 | 724 |
| 47e83390 | codex-delegate | workflow-authoring | 1 | 135 | 54 |
| 47e83390 | codex-delegate | Skill | 3 | 119 | 45 |
| 66940b3c | headless-gate | orchestrate | 1 | 14,182 | 5,673 |
| 66940b3c | headless-gate | seat | 1 | 12,641 | 5,037 |
| 66940b3c | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| 66940b3c | headless-gate | Skill | 1 | 36 | 14 |
| 6d147622 | headless-gate | orchestrate | 1 | 14,048 | 5,619 |
| 6d147622 | headless-gate | codex-delegate | 1 | 11,938 | 4,775 |
| 6d147622 | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| 6d147622 | headless-gate | Skill | 1 | 46 | 18 |
| c407c061 | arcadia | orchestrate | 1 | 14,029 | 5,062 |
| c407c061 | arcadia | codex-delegate | 1 | 12,066 | 4,657 |
| c407c061 | arcadia | tracker-mcp | 1 | 9,715 | 3,855 |
| c407c061 | arcadia | workflow-authoring | 1 | 135 | 54 |
| c407c061 | arcadia | Skill | 3 | 117 | 44 |
| 5890e172 | codex-delegate | orchestrate | 1 | 14,098 | 5,003 |
| 5890e172 | codex-delegate | seat | 1 | 12,854 | 4,911 |
| 5890e172 | codex-delegate | find-skills | 1 | 4,490 | 1,786 |
| 5890e172 | codex-delegate | grilling | 1 | 1,886 | 669 |
| 5890e172 | codex-delegate | Skill | 4 | 150 | 55 |
| 64f6a7d8 | agent-skills | orchestrate | 1 | 13,984 | 4,956 |
| 64f6a7d8 | agent-skills | seat | 1 | 13,148 | 5,009 |
| 64f6a7d8 | agent-skills | Skill | 2 | 368 | 147 |
| 64f6a7d8 | agent-skills | model | 1 | 138 | 55 |
| 64f6a7d8 | agent-skills | codex-delegate:orchestrate | 1 | 118 | 42 |
| 64f6a7d8 | codex-delegate | orchestrate | 1 | 13,984 | 4,956 |
| 64f6a7d8 | codex-delegate | seat | 1 | 13,148 | 5,009 |
| 64f6a7d8 | codex-delegate | Skill | 2 | 368 | 147 |
| 64f6a7d8 | codex-delegate | model | 1 | 138 | 55 |
| 64f6a7d8 | codex-delegate | codex-delegate:orchestrate | 1 | 118 | 42 |
| c6aa24a3 | agent-skills | orchestrate | 1 | 14,094 | 5,007 |
| c6aa24a3 | agent-skills | seat | 1 | 12,854 | 4,911 |
| c6aa24a3 | agent-skills | find-skills | 1 | 4,490 | 1,786 |
| c6aa24a3 | agent-skills | Skill | 3 | 107 | 40 |
| c6aa24a3 | codex-delegate | orchestrate | 1 | 14,094 | 5,007 |
| c6aa24a3 | codex-delegate | seat | 1 | 12,854 | 4,911 |
| c6aa24a3 | codex-delegate | find-skills | 1 | 4,490 | 1,786 |
| c6aa24a3 | codex-delegate | Skill | 3 | 107 | 40 |
| 0e2d84bf | agent-skills | seat | 1 | 13,500 | 5,150 |
| 0e2d84bf | agent-skills | workflow-authoring | 1 | 135 | 54 |
| 0e2d84bf | agent-skills | Skill | 1 | 36 | 14 |
| 6b7a0680 | agent-skills | workflow-authoring | 1 | 135 | 54 |
| b1e2a3a5 | agent-skills | orchestrate | 1 | 14,329 | 5,077 |
| b1e2a3a5 | agent-skills | seat | 1 | 13,500 | 5,150 |
| b1e2a3a5 | agent-skills | workflow-authoring | 1 | 135 | 54 |
| b1e2a3a5 | agent-skills | Skill | 2 | 79 | 29 |
| d737ff38 | agent-skills | ? | 1 | 15,595 | 6,238 |
| d737ff38 | agent-skills | workflow-authoring | 1 | 135 | 54 |
| f527a795 | agent-skills | workflow-authoring | 1 | 135 | 54 |
| 1b4d11e7 | headless-gate | seat | 1 | 19,884 | 7,698 |
| 1b4d11e7 | headless-gate | orchestrate | 1 | 16,299 | 6,520 |
| 1b4d11e7 | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| 1b4d11e7 | headless-gate | Skill | 1 | 36 | 14 |
| 22f6e0a9 | headless-gate | seat | 1 | 19,935 | 7,752 |
| 22f6e0a9 | headless-gate | orchestrate | 1 | 16,299 | 6,520 |
| 22f6e0a9 | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| 22f6e0a9 | headless-gate | Skill | 1 | 36 | 14 |
| 2687e41f | headless-gate | seat | 1 | 19,814 | 7,636 |
| 2687e41f | headless-gate | orchestrate | 1 | 16,299 | 6,520 |
| 2687e41f | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| 2687e41f | headless-gate | Skill | 1 | 36 | 14 |
| 30805d36 | agent-skills | seat | 1 | 19,941 | 7,548 |
| 30805d36 | agent-skills | orchestrate | 1 | 16,040 | 5,649 |
| 30805d36 | agent-skills | Skill | 2 | 79 | 29 |
| 30a03d40 | agent-skills | seat | 1 | 19,941 | 7,458 |
| 30a03d40 | agent-skills | orchestrate | 1 | 16,040 | 5,611 |
| 30a03d40 | agent-skills | Skill | 2 | 368 | 136 |
| 30a03d40 | agent-skills | codex-delegate:orchestrate | 1 | 118 | 41 |
| 54916180 | headless-gate | seat | 1 | 19,884 | 7,667 |
| 54916180 | headless-gate | orchestrate | 1 | 16,299 | 6,520 |
| 54916180 | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| 54916180 | headless-gate | Skill | 1 | 36 | 14 |
| 909909cc | headless-gate | seat | 1 | 19,624 | 7,524 |
| 909909cc | headless-gate | orchestrate | 1 | 16,299 | 6,520 |
| 909909cc | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| 909909cc | headless-gate | Skill | 1 | 36 | 14 |
| 9c3cc822 | headless-gate | seat | 1 | 19,814 | 7,710 |
| 9c3cc822 | headless-gate | orchestrate | 1 | 16,299 | 6,520 |
| 9c3cc822 | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| 9c3cc822 | headless-gate | Skill | 1 | 36 | 14 |
| f7ab0fca | headless-gate | seat | 1 | 19,935 | 7,748 |
| f7ab0fca | headless-gate | orchestrate | 1 | 16,299 | 6,520 |
| f7ab0fca | headless-gate | codex-delegate:orchestrate | 1 | 396 | 158 |
| f7ab0fca | headless-gate | Skill | 1 | 36 | 14 |
| da50f730 | arcadia | seat | 1 | 22,547 | 8,533 |
| da50f730 | arcadia | orchestrate | 1 | 17,478 | 6,464 |
| da50f730 | arcadia | tracker-mcp | 1 | 9,691 | 3,584 |
| da50f730 | arcadia | Skill | 3 | 107 | 40 |
| 1fe60ced | arcadia | seat | 1 | 22,547 | 8,416 |
| 1fe60ced | arcadia | orchestrate | 1 | 17,478 | 6,146 |
| 1fe60ced | arcadia | tracker-mcp | 1 | 9,674 | 3,840 |
| 1fe60ced | arcadia | Skill | 3 | 396 | 157 |
| 1fe60ced | arcadia | codex-delegate:orchestrate | 1 | 118 | 41 |
| 42691a3b | agent-skills | seat | 1 | 22,547 | 8,417 |
| 42691a3b | agent-skills | orchestrate | 1 | 17,478 | 5,848 |
| 42691a3b | agent-skills | codex-delegate:orchestrate | 1 | 118 | 39 |
| 42691a3b | agent-skills | Skill | 1 | 36 | 13 |
| 035850d2 | agent-skills | codex | 1 | 23,024 | 8,693 |
| 035850d2 | agent-skills | orchestrate | 1 | 18,079 | 5,796 |
| 035850d2 | agent-skills | grilling | 1 | 1,811 | 594 |
| 035850d2 | agent-skills | Skill | 4 | 441 | 162 |
| 035850d2 | agent-skills | grill-me | 1 | 172 | 55 |
| 035850d2 | agent-skills | mattpocock-skills:grill-me | 1 | 118 | 38 |

## Five largest single blocks per session

| session | project | category | tool | description | chars | attributed_tok |
|---|---|---|---|---|---|---|
| eab0cdb0 | codex-delegate | read_result | Read | result of Read | 47,688 | 19,075 |
| eab0cdb0 | codex-delegate | read_result | Read | result of Read | 40,231 | 16,092 |
| eab0cdb0 | codex-delegate | other_tool_result | WebFetch | result of WebFetch | 41,943 | 15,234 |
| eab0cdb0 | codex-delegate | read_result | Read | result of Read | 34,580 | 13,302 |
| eab0cdb0 | codex-delegate | read_result | Read | result of Read | 32,605 | 13,042 |
| 73ed8645 | arcadia | thinking | assistant:thinking(encrypted) | [redacted: work project] | 0 | 12,046 |
| 73ed8645 | arcadia | read_result | Read | [redacted: work project] | 25,516 | 10,206 |
| 73ed8645 | arcadia | skill_load | skill:arc | [redacted: work project] | 26,718 | 10,155 |
| 73ed8645 | arcadia | system_reminder | attachment:skill_listing | [redacted: work project] | 17,543 | 7,017 |
| 73ed8645 | arcadia | skill_load | skill:arcanum | [redacted: work project] | 18,314 | 6,905 |
| fd3bbe62 | arcadia | thinking | assistant:thinking(encrypted) | [redacted: work project] | 0 | 12,046 |
| fd3bbe62 | arcadia | read_result | Read | [redacted: work project] | 25,516 | 10,206 |
| fd3bbe62 | arcadia | skill_load | skill:arc | [redacted: work project] | 26,718 | 10,155 |
| fd3bbe62 | arcadia | system_reminder | attachment:skill_listing | [redacted: work project] | 17,543 | 7,017 |
| fd3bbe62 | arcadia | skill_load | skill:arcanum | [redacted: work project] | 18,314 | 6,907 |
| 3251fa94 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 6,501 |
| 3251fa94 | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 16,118 | 6,447 |
| 3251fa94 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 5,053 |
| 3251fa94 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 4,450 |
| 3251fa94 | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 11,072 | 4,429 |
| 52259b1f | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 16,118 | 6,447 |
| 52259b1f | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 11,009 | 4,404 |
| 52259b1f | headless-gate | skill_load | skill:codex-delegate | skill page codex-delegate | 10,156 | 4,062 |
| 52259b1f | headless-gate | system_reminder | attachment:deferred_tools_delta | deferred_tools_delta | 7,131 | 1,892 |
| 52259b1f | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 633 |
| 58f659a9 | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 16,118 | 6,447 |
| 58f659a9 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 4,673 |
| 58f659a9 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 4,463 |
| 58f659a9 | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 11,009 | 4,404 |
| 58f659a9 | headless-gate | skill_load | skill:codex-delegate | skill page codex-delegate | 10,156 | 4,050 |
| b2d5773e | codex-delegate | read_result | Read | result of Read | 58,848 | 22,317 |
| b2d5773e | codex-delegate | read_result | Read | result of Read | 51,975 | 20,790 |
| b2d5773e | codex-delegate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 14,629 |
| b2d5773e | codex-delegate | read_result | Read | result of Read | 41,484 | 14,176 |
| b2d5773e | codex-delegate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 12,968 |
| d7cc77e7 | codex-delegate | system_reminder | attachment:skill_listing | skill_listing | 17,543 | 7,017 |
| d7cc77e7 | codex-delegate | tool_use_input_other | Workflow | Workflow | 18,450 | 6,362 |
| d7cc77e7 | codex-delegate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 6,181 |
| d7cc77e7 | codex-delegate | user_text | user:text | # Workflow authoring reference  A workflow structures work across many agents —  | 16,705 | 6,145 |
| d7cc77e7 | codex-delegate | bash_result | Bash | result of Bash | 14,682 | 5,686 |
| 08a43de9 | codex-delegate | read_result | Read | result of Read | 31,449 | 12,580 |
| 08a43de9 | codex-delegate | bash_result | Bash | result of Bash | 29,413 | 11,765 |
| 08a43de9 | codex-delegate | system_reminder | attachment:skill_listing | skill_listing | 17,543 | 7,017 |
| 08a43de9 | codex-delegate | user_text | user:text | <task-notification> <task-id>aacd6512f2b7157de</task-id> <tool-use-id>toolu_01Fj | 15,990 | 6,396 |
| 08a43de9 | codex-delegate | user_text | attachment:queued_command | queued_command | 15,908 | 6,363 |
| 099f69cc | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 16,118 | 6,447 |
| 099f69cc | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 11,035 | 4,414 |
| 099f69cc | headless-gate | skill_load | skill:codex-delegate | skill page codex-delegate | 10,156 | 4,062 |
| 099f69cc | headless-gate | system_reminder | attachment:deferred_tools_delta | deferred_tools_delta | 7,131 | 1,892 |
| 099f69cc | headless-gate | system_reminder | attachment:mcp_instructions_delta | mcp_instructions_delta | 2,187 | 580 |
| 47703c0c | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 16,118 | 6,447 |
| 47703c0c | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 13,287 | 5,315 |
| 47703c0c | headless-gate | skill_load | skill:codex-delegate | skill page codex-delegate | 11,742 | 4,667 |
| 47703c0c | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 2,387 |
| 47703c0c | headless-gate | system_reminder | attachment:deferred_tools_delta | deferred_tools_delta | 7,131 | 1,908 |
| 826bad2b | codex-delegate | read_result | Read | result of Read | 31,449 | 12,580 |
| 826bad2b | codex-delegate | bash_result | Bash | result of Bash | 29,413 | 11,765 |
| 826bad2b | codex-delegate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 7,677 |
| 826bad2b | codex-delegate | system_reminder | attachment:skill_listing | skill_listing | 17,543 | 7,017 |
| 826bad2b | codex-delegate | user_text | user:text | <task-notification> <task-id>aacd6512f2b7157de</task-id> <tool-use-id>toolu_01Fj | 15,990 | 6,396 |
| c0138a46 | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 16,118 | 6,447 |
| c0138a46 | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 11,204 | 4,482 |
| c0138a46 | headless-gate | skill_load | skill:codex-delegate | skill page codex-delegate | 10,156 | 4,062 |
| c0138a46 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 3,435 |
| c0138a46 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 1,747 |
| d46c4813 | codex-delegate | bash_result | Bash | result of Bash | 22,393 | 8,957 |
| d46c4813 | codex-delegate | bash_result | Bash | result of Bash | 22,335 | 8,934 |
| d46c4813 | codex-delegate | system_reminder | attachment:skill_listing | skill_listing | 17,543 | 7,017 |
| d46c4813 | codex-delegate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 6,489 |
| d46c4813 | codex-delegate | user_text | user:text | # Workflow authoring reference  A workflow structures work across many agents —  | 16,705 | 6,255 |
| f9492b6f | codex-delegate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 10,125 |
| f9492b6f | codex-delegate | system_reminder | attachment:skill_listing | skill_listing | 17,543 | 7,017 |
| f9492b6f | codex-delegate | tool_use_input_other | Bash | Apply the drafted edits in the scratch copy and check the page's line budget and | 17,368 | 5,989 |
| f9492b6f | codex-delegate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 5,416 |
| f9492b6f | codex-delegate | bash_result | Bash | result of Bash | 13,321 | 5,328 |
| fc25a59e | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 16,118 | 6,447 |
| fc25a59e | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 11,084 | 4,434 |
| fc25a59e | headless-gate | skill_load | skill:codex-delegate | skill page codex-delegate | 10,156 | 4,062 |
| fc25a59e | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 1,728 |
| fc25a59e | headless-gate | system_reminder | attachment:deferred_tools_delta | deferred_tools_delta | 3,223 | 1,029 |
| 1e226d56 | codex-delegate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 7,075 |
| 1e226d56 | codex-delegate | taskoutput | TaskOutput | result of TaskOutput | 17,418 | 6,967 |
| 1e226d56 | codex-delegate | bash_result | Bash | result of Bash | 15,079 | 5,522 |
| 1e226d56 | codex-delegate | bash_result | Bash | result of Bash | 13,914 | 5,432 |
| 1e226d56 | codex-delegate | skill_load | skill:codex-delegate | skill page codex-delegate | 12,066 | 4,657 |
| 3254e0db | codex-delegate | bash_result | Bash | result of Bash | 19,461 | 7,784 |
| 3254e0db | codex-delegate | read_result | Read | result of Read | 19,493 | 7,323 |
| 3254e0db | codex-delegate | system_reminder | attachment:skill_listing | skill_listing | 17,543 | 7,017 |
| 3254e0db | codex-delegate | bash_result | Bash | result of Bash | 14,969 | 5,988 |
| 3254e0db | codex-delegate | skill_load | skill:codex-delegate | skill page codex-delegate | 12,066 | 4,657 |
| 47e83390 | codex-delegate | user_text | user:text | # Update Config Skill  Modify Claude Code configuration by updating settings.jso | 256,932 | 76,409 |
| 47e83390 | codex-delegate | taskoutput | TaskOutput | result of TaskOutput | 32,164 | 12,866 |
| 47e83390 | codex-delegate | taskoutput | TaskOutput | result of TaskOutput | 32,164 | 12,866 |
| 47e83390 | codex-delegate | taskoutput | TaskOutput | result of TaskOutput | 32,164 | 12,866 |
| 47e83390 | codex-delegate | system_reminder | attachment:skill_listing | skill_listing | 17,543 | 7,017 |
| 66940b3c | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 15,448 | 6,179 |
| 66940b3c | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 14,182 | 5,673 |
| 66940b3c | headless-gate | skill_load | skill:seat | skill page seat | 12,641 | 5,037 |
| 66940b3c | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 2,492 |
| 66940b3c | headless-gate | read_result | Read | result of Read | 5,142 | 2,057 |
| 6d147622 | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 16,118 | 6,447 |
| 6d147622 | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 14,048 | 5,619 |
| 6d147622 | headless-gate | skill_load | skill:codex-delegate | skill page codex-delegate | 11,938 | 4,775 |
| 6d147622 | headless-gate | system_reminder | attachment:deferred_tools_delta | deferred_tools_delta | 7,131 | 1,892 |
| 6d147622 | headless-gate | read_result | Read | result of Read | 4,613 | 1,845 |
| c407c061 | arcadia | other_tool_result | mcp__playwright__browser_snapshot | [redacted: work project] | 43,351 | 17,340 |
| c407c061 | arcadia | system_reminder | attachment:skill_listing | [redacted: work project] | 17,543 | 7,017 |
| c407c061 | arcadia | user_text | user:text | [redacted: work project] | 16,966 | 6,786 |
| c407c061 | arcadia | user_text | attachment:queued_command | [redacted: work project] | 880,371 | 6,514 |
| c407c061 | arcadia | skill_load | skill:orchestrate | [redacted: work project] | 14,029 | 5,062 |
| 5890e172 | codex-delegate | taskoutput | TaskOutput | result of TaskOutput | 32,164 | 12,866 |
| 5890e172 | codex-delegate | bash_result | Bash | result of Bash | 28,083 | 10,972 |
| 5890e172 | codex-delegate | bash_result | Bash | result of Bash | 27,876 | 10,529 |
| 5890e172 | codex-delegate | read_result | Read | result of Read | 21,457 | 8,583 |
| 5890e172 | codex-delegate | system_reminder | attachment:skill_listing | skill_listing | 16,873 | 6,749 |
| 64f6a7d8 | agent-skills | write_edit_input | Write | Write | 28,336 | 9,771 |
| 64f6a7d8 | agent-skills | write_edit_input | Write | Write | 28,336 | 9,771 |
| 64f6a7d8 | agent-skills | write_edit_input | Write | Write | 17,957 | 6,192 |
| 64f6a7d8 | agent-skills | write_edit_input | Write | Write | 17,957 | 6,192 |
| 64f6a7d8 | agent-skills | bash_result | Bash | result of Bash | 15,678 | 5,289 |
| 64f6a7d8 | codex-delegate | write_edit_input | Write | Write | 28,336 | 9,771 |
| 64f6a7d8 | codex-delegate | write_edit_input | Write | Write | 28,336 | 9,771 |
| 64f6a7d8 | codex-delegate | write_edit_input | Write | Write | 17,957 | 6,192 |
| 64f6a7d8 | codex-delegate | write_edit_input | Write | Write | 17,957 | 6,192 |
| 64f6a7d8 | codex-delegate | bash_result | Bash | result of Bash | 15,678 | 5,289 |
| c6aa24a3 | agent-skills | write_edit_input | Write | Write | 42,042 | 14,497 |
| c6aa24a3 | agent-skills | write_edit_input | Write | Write | 42,042 | 14,497 |
| c6aa24a3 | agent-skills | user_text | attachment:queued_command | queued_command | 29,778 | 11,911 |
| c6aa24a3 | agent-skills | user_text | attachment:queued_command | queued_command | 29,778 | 11,911 |
| c6aa24a3 | agent-skills | bash_result | Bash | result of Bash | 29,168 | 11,667 |
| c6aa24a3 | codex-delegate | write_edit_input | Write | Write | 42,042 | 14,497 |
| c6aa24a3 | codex-delegate | write_edit_input | Write | Write | 42,042 | 14,497 |
| c6aa24a3 | codex-delegate | user_text | attachment:queued_command | queued_command | 29,778 | 11,911 |
| c6aa24a3 | codex-delegate | user_text | attachment:queued_command | queued_command | 29,778 | 11,911 |
| c6aa24a3 | codex-delegate | bash_result | Bash | result of Bash | 29,168 | 11,667 |
| 0e2d84bf | agent-skills | tool_use_input_other | Workflow | Workflow | 27,616 | 9,523 |
| 0e2d84bf | agent-skills | bash_result | Bash | result of Bash | 19,401 | 7,760 |
| 0e2d84bf | agent-skills | read_result | Read | result of Read | 18,323 | 7,329 |
| 0e2d84bf | agent-skills | user_text | user:text | # Workflow authoring reference  A workflow structures work across many agents —  | 16,966 | 6,786 |
| 0e2d84bf | agent-skills | system_reminder | attachment:skill_listing | skill_listing | 16,911 | 6,764 |
| 6b7a0680 | agent-skills | write_edit_input | Write | Write | 42,980 | 14,821 |
| 6b7a0680 | agent-skills | bash_result | Bash | result of Bash | 26,519 | 9,811 |
| 6b7a0680 | agent-skills | bash_result | Bash | result of Bash | 23,570 | 9,428 |
| 6b7a0680 | agent-skills | bash_result | Bash | result of Bash | 23,751 | 9,158 |
| 6b7a0680 | agent-skills | bash_result | Bash | result of Bash | 22,956 | 8,316 |
| b1e2a3a5 | agent-skills | tool_use_input_other | Workflow | Workflow | 27,616 | 9,523 |
| b1e2a3a5 | agent-skills | bash_result | Bash | result of Bash | 19,401 | 7,760 |
| b1e2a3a5 | agent-skills | read_result | Read | result of Read | 18,323 | 7,329 |
| b1e2a3a5 | agent-skills | user_text | user:text | # Workflow authoring reference  A workflow structures work across many agents —  | 16,966 | 6,786 |
| b1e2a3a5 | agent-skills | system_reminder | attachment:skill_listing | skill_listing | 16,911 | 6,764 |
| d737ff38 | agent-skills | user_text | user:text | <task-notification> <task-id>a1ef1baac8da60212</task-id> <tool-use-id>toolu_01RS | 46,200 | 18,480 |
| d737ff38 | agent-skills | write_edit_input | Write | Write | 42,980 | 14,821 |
| d737ff38 | agent-skills | user_text | user:text | <task-notification> <task-id>a657e578148417e50</task-id> <tool-use-id>toolu_01Dx | 26,385 | 10,554 |
| d737ff38 | agent-skills | bash_result | Bash | result of Bash | 26,519 | 9,811 |
| d737ff38 | agent-skills | bash_result | Bash | result of Bash | 23,570 | 9,428 |
| f527a795 | agent-skills | write_edit_input | Write | Write | 42,980 | 14,821 |
| f527a795 | agent-skills | write_edit_input | Write | Write | 42,980 | 14,821 |
| f527a795 | agent-skills | bash_result | Bash | result of Bash | 26,519 | 9,811 |
| f527a795 | agent-skills | bash_result | Bash | result of Bash | 26,519 | 9,811 |
| f527a795 | agent-skills | bash_result | Bash | result of Bash | 23,570 | 9,428 |
| 1b4d11e7 | headless-gate | skill_load | skill:seat | skill page seat | 19,884 | 7,698 |
| 1b4d11e7 | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 16,299 | 6,520 |
| 1b4d11e7 | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 15,486 | 6,194 |
| 1b4d11e7 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 3,344 |
| 1b4d11e7 | headless-gate | system_reminder | attachment:deferred_tools_delta | deferred_tools_delta | 7,131 | 1,975 |
| 22f6e0a9 | headless-gate | skill_load | skill:seat | skill page seat | 19,935 | 7,752 |
| 22f6e0a9 | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 16,299 | 6,520 |
| 22f6e0a9 | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 15,486 | 6,194 |
| 22f6e0a9 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 4,595 |
| 22f6e0a9 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 3,653 |
| 2687e41f | headless-gate | skill_load | skill:seat | skill page seat | 19,814 | 7,636 |
| 2687e41f | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 16,299 | 6,520 |
| 2687e41f | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 15,486 | 6,194 |
| 2687e41f | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 3,022 |
| 2687e41f | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 2,013 |
| 30805d36 | agent-skills | skill_load | skill:seat | skill page seat | 19,941 | 7,548 |
| 30805d36 | agent-skills | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 6,887 |
| 30805d36 | agent-skills | system_reminder | attachment:skill_listing | skill_listing | 16,911 | 6,764 |
| 30805d36 | agent-skills | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 6,664 |
| 30805d36 | agent-skills | bash_result | Bash | result of Bash | 17,293 | 6,256 |
| 30a03d40 | agent-skills | taskoutput | TaskOutput | result of TaskOutput | 32,180 | 12,872 |
| 30a03d40 | agent-skills | taskoutput | TaskOutput | result of TaskOutput | 32,176 | 12,870 |
| 30a03d40 | agent-skills | taskoutput | TaskOutput | result of TaskOutput | 32,176 | 12,870 |
| 30a03d40 | agent-skills | taskoutput | TaskOutput | result of TaskOutput | 32,174 | 12,870 |
| 30a03d40 | agent-skills | taskoutput | TaskOutput | result of TaskOutput | 32,174 | 12,870 |
| 54916180 | headless-gate | skill_load | skill:seat | skill page seat | 19,884 | 7,667 |
| 54916180 | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 16,299 | 6,520 |
| 54916180 | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 15,486 | 6,194 |
| 54916180 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 2,932 |
| 54916180 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 2,492 |
| 74a14ec2 | agent-skills | bash_result | Bash | result of Bash | 28,305 | 9,466 |
| 74a14ec2 | agent-skills | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 7,249 |
| 74a14ec2 | agent-skills | system_reminder | attachment:skill_listing | skill_listing | 16,911 | 6,764 |
| 74a14ec2 | agent-skills | bash_result | Bash | result of Bash | 16,747 | 6,699 |
| 74a14ec2 | agent-skills | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 5,184 |
| 909909cc | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 8,086 |
| 909909cc | headless-gate | skill_load | skill:seat | skill page seat | 19,624 | 7,524 |
| 909909cc | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 16,299 | 6,520 |
| 909909cc | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 15,486 | 6,194 |
| 909909cc | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 4,108 |
| 9c3cc822 | headless-gate | skill_load | skill:seat | skill page seat | 19,814 | 7,710 |
| 9c3cc822 | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 16,299 | 6,520 |
| 9c3cc822 | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 15,486 | 6,194 |
| 9c3cc822 | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 3,252 |
| 9c3cc822 | headless-gate | system_reminder | attachment:deferred_tools_delta | deferred_tools_delta | 7,131 | 1,933 |
| f7ab0fca | headless-gate | skill_load | skill:seat | skill page seat | 19,935 | 7,748 |
| f7ab0fca | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 6,699 |
| f7ab0fca | headless-gate | skill_load | skill:orchestrate | skill page orchestrate | 16,299 | 6,520 |
| f7ab0fca | headless-gate | system_reminder | attachment:skill_listing | skill_listing | 15,486 | 6,194 |
| f7ab0fca | headless-gate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 2,587 |
| da50f730 | arcadia | taskoutput | TaskOutput | [redacted: work project] | 32,172 | 12,869 |
| da50f730 | arcadia | taskoutput | TaskOutput | [redacted: work project] | 32,168 | 12,867 |
| da50f730 | arcadia | taskoutput | TaskOutput | [redacted: work project] | 32,166 | 12,866 |
| da50f730 | arcadia | skill_load | skill:seat | [redacted: work project] | 22,547 | 8,533 |
| da50f730 | arcadia | system_reminder | attachment:skill_listing | [redacted: work project] | 16,946 | 6,778 |
| 1fe60ced | arcadia | skill_load | skill:seat | [redacted: work project] | 22,547 | 8,416 |
| 1fe60ced | arcadia | system_reminder | attachment:skill_listing | [redacted: work project] | 16,946 | 6,778 |
| 1fe60ced | arcadia | user_text | attachment:queued_command | [redacted: work project] | 191,231 | 6,718 |
| 1fe60ced | arcadia | skill_load | skill:orchestrate | [redacted: work project] | 17,478 | 6,146 |
| 1fe60ced | arcadia | user_text | attachment:queued_command | [redacted: work project] | 617,784 | 5,180 |
| 42691a3b | agent-skills | user_text | user:text | Посмотри отчет ниже. Полезен ли он?   # codex-delegate 0.15.0: field audit of fo | 50,055 | 20,022 |
| 42691a3b | agent-skills | taskoutput | TaskOutput | result of TaskOutput | 32,188 | 12,875 |
| 42691a3b | agent-skills | taskoutput | TaskOutput | result of TaskOutput | 32,178 | 12,871 |
| 42691a3b | agent-skills | taskoutput | TaskOutput | result of TaskOutput | 32,178 | 12,871 |
| 42691a3b | agent-skills | taskoutput | TaskOutput | result of TaskOutput | 32,176 | 12,870 |
| 035850d2 | agent-skills | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 9,827 |
| 035850d2 | agent-skills | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 9,173 |
| 035850d2 | agent-skills | skill_load | skill:codex | skill page codex | 23,024 | 8,693 |
| 035850d2 | agent-skills | bash_result | Bash | result of Bash | 19,531 | 7,812 |
| 035850d2 | agent-skills | bash_result | Bash | result of Bash | 18,396 | 7,358 |

## Cross-session category table

| category | pooled % | median % | max % | max session | tokens |
|---|---|---|---|---|---|
| thinking | 25.8% | 25.4% | 39.4% | 74a14ec2 | 5,918,752 |
| bash_result | 16.4% | 15.0% | 35.8% | d7cc77e7 | 3,752,632 |
| unexplained_growth | 14.7% | 3.9% | 51.5% | 42691a3b | 3,363,306 |
| tool_use_input_other | 10.3% | 6.5% | 17.4% | 826bad2b | 2,350,294 |
| user_text | 6.3% | 2.4% | 22.3% | 47e83390 | 1,454,559 |
| write_edit_input | 5.1% | 1.4% | 15.7% | 64f6a7d8 | 1,166,476 |
| system_reminder | 5.1% | 7.1% | 24.1% | 099f69cc | 1,162,771 |
| assistant_text | 4.3% | 2.7% | 9.9% | c6aa24a3 | 991,779 |
| system_prompt_baseline | 3.0% | 4.1% | 49.5% | 099f69cc | 690,899 |
| read_result | 2.8% | 1.1% | 17.7% | b2d5773e | 643,613 |
| skill_load | 2.1% | 3.1% | 31.4% | 1b4d11e7 | 472,709 |
| taskoutput | 1.9% | 0.0% | 23.5% | 30a03d40 | 429,595 |
| other_tool_result | 1.5% | 0.5% | 11.3% | c407c061 | 344,325 |
| agent_return | 0.6% | 0.4% | 2.2% | d46c4813 | 138,581 |
| workflow | 0.2% | 0.0% | 1.2% | c0138a46 | 37,531 |

## Date groups

| group | sessions | turns | compaction markers | large ctx drops | median peak | max peak |
|---|---|---|---|---|---|---|
| A: before 09-12 | 32 | 7480 | 12 | 18 | 356,276 | 876,637 |
| B: 09-12..09-15 | 11 | 555 | 0 | 0 | 72,632 | 821,246 |
| C: 09-16+ | 3 | 411 | 0 | 1 | 310,774 | 649,022 |

| category | A: before 09-12 | B: 09-12..09-15 | C: 09-16+ |
|---|---|---|---|
| thinking | 26.9% | 24.5% | 15.1% | 
| bash_result | 17.2% | 14.5% | 9.2% | 
| unexplained_growth | 13.6% | 6.5% | 38.6% | 
| tool_use_input_other | 10.6% | 9.7% | 7.7% | 
| user_text | 6.7% | 3.9% | 5.7% | 
| write_edit_input | 5.7% | 2.7% | 1.4% | 
| system_reminder | 4.7% | 7.6% | 6.0% | 
| assistant_text | 4.8% | 2.2% | 2.4% | 
| system_prompt_baseline | 2.5% | 7.9% | 2.5% | 
| read_result | 3.2% | 0.9% | 0.8% | 
| skill_load | 1.5% | 6.4% | 2.9% | 
| taskoutput | 0.4% | 11.5% | 5.6% | 
| other_tool_result | 1.6% | 0.6% | 1.1% | 
| agent_return | 0.5% | 1.1% | 1.1% | 
| workflow | 0.2% | 0.0% | 0.0% | 

## Fifteen largest single blocks overall

| # | session | project | category | tool | description | chars | attributed_tok |
|---|---|---|---|---|---|---|---|
| 1 | 47e83390 | codex-delegate | user_text | user:text | # Update Config Skill  Modify Claude Code configuration by updating settings.jso | 256,932 | 76,409 |
| 2 | b2d5773e | codex-delegate | read_result | Read | result of Read | 58,848 | 22,317 |
| 3 | b2d5773e | codex-delegate | read_result | Read | result of Read | 51,975 | 20,790 |
| 4 | 42691a3b | agent-skills | user_text | user:text | Посмотри отчет ниже. Полезен ли он?   # codex-delegate 0.15.0: field audit of fo | 50,055 | 20,022 |
| 5 | eab0cdb0 | codex-delegate | read_result | Read | result of Read | 47,688 | 19,075 |
| 6 | d737ff38 | agent-skills | user_text | user:text | <task-notification> <task-id>a1ef1baac8da60212</task-id> <tool-use-id>toolu_01RS | 46,200 | 18,480 |
| 7 | c407c061 | arcadia | other_tool_result | mcp__playwright__browser_snapshot | [redacted: work project] | 43,351 | 17,340 |
| 8 | eab0cdb0 | codex-delegate | read_result | Read | result of Read | 40,231 | 16,092 |
| 9 | eab0cdb0 | codex-delegate | other_tool_result | WebFetch | result of WebFetch | 41,943 | 15,234 |
| 10 | 6b7a0680 | agent-skills | write_edit_input | Write | Write | 42,980 | 14,821 |
| 11 | d737ff38 | agent-skills | write_edit_input | Write | Write | 42,980 | 14,821 |
| 12 | f527a795 | agent-skills | write_edit_input | Write | Write | 42,980 | 14,821 |
| 13 | f527a795 | agent-skills | write_edit_input | Write | Write | 42,980 | 14,821 |
| 14 | b2d5773e | codex-delegate | thinking | assistant:thinking(encrypted) | reasoning, text not stored | 0 | 14,629 |
| 15 | c6aa24a3 | agent-skills | write_edit_input | Write | Write | 42,042 | 14,497 |

## Sensitivity to the one assumed constant

| assistant verbatim rate | thinking | assistant_text | tool_use_input_other | write_edit_input |
|---|---|---|---|---|
| 2.2 chars/token | 20.4% | 5.6% | 13.3% | 6.1% |
| 2.9 chars/token (used) | 25.8% | 4.3% | 10.3% | 5.1% |
| 3.6 chars/token | 29.6% | 3.5% | 8.3% | 4.1% |

Assumption-free split of all attributed context: assistant pool (sum of `output_tokens`) 10,427,301 = 45.5%; everything user-side plus the turn-0 baseline = 54.5%.
