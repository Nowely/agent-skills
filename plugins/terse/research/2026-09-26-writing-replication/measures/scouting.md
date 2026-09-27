# Scouting (stage 0), from the coordinator's commands on 2026-09-26

All values are the printed output of commands run in the coordinator's session before the plan.

- `codex --version` → codex-cli 0.155.1.
- `nproc` → not found on macOS; `sysctl -n hw.ncpu` → 12 (hw.perflevel0.logicalcpu → 6). Concurrency cap used: 12
  Codex Luna at once (tools/batch.py runs with `-P 12`; every batch line in measures/batches/*.tsv came from such a run).
- `cleanupPeriodDays` → not set in ~/.claude/settings.json or settings.local.json (default 30 days).
- `codex debug models` (not the cache file) → listed slugs gpt-6-astra, gpt-6-sol, gpt-6-luna (also gpt-5.6-*, gpt-5.5);
  truncation_policy for all three gpt-6 models: {mode: tokens, limit: 10000}; context window 272,000.
  Pages were cut at ~18,000 characters (longest 17,517) to stay under 10,000 tokens.
- A probe Luna (report probe-luna) ran through the launch-only mode: exit 0, 25,733 tokens; its rollout showed the
  model choosing max_output_tokens: 1000 when unasked, which is why every Luna brief sets 10000.
- Codex quota at start: weekly window, usedPercent 1 (report field rateLimits; resets 2026-10-03).
- Project folders under ~/.claude/projects: 89. Top-level session files with at least one human message: 197; one more
  with none. 53 of the 197 are scripted test runs in temporary folders (/private/tmp, /private/var/folders/...), 1-2
  scripted messages each — excluded. The current session (261eafc8-…) excluded. Remaining: 144 sessions in five projects.
- Per project (sessions / human messages by the rough scouting filter / dialog characters): agent-skills 33 / 844 /
  3.26M; owner project A 58 / 423 / 1.31M; owner project B 18 / 382 / 1.58M; the work projects
  35 / 543 / 1.56M.
- Rough totals over the five projects: 2,192 human messages (the corpus's exact recount is 2,406 including mid-turn
  messages and resumed-session copies; 1,745 unique user turns), dialog text 7.7M characters, text written through
  tools ~8.9M, of which ~3.1M repeated across resumed sessions; oldest session start 2026-08-17.
