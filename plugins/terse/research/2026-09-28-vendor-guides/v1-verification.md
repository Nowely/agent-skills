# The coordinator's checks on S1 — 2026-09-28

Codex Luna S1 (`EFFORT: medium`) fetched 18 of 18 pages in 8.5 minutes and wrote `s1-sources.md`, kept
here as it returned. Three things in it did not hold up as written; this file records what was checked
and what to use instead.

## The pages are what the vendors serve

S1's `curl` failed with exit 60 in the Codex sandbox (no local issuer certificate) and retried with `-k`,
so its copies were fetched without TLS verification. All 18 final URLs were fetched again from the host
with verification on: **18 of 18 raw SHA-256 identical** to S1's saved bytes. The copies are authentic.

## Every 2026-09-22 quote still stands

S1's Part 1 is not to be used. Its summary line gives Anthropic 0 present, 10 present-normalised, 36 gone,
while its own table marks S2-3 and S2-5 `present`; and it marks as gone quotes that are on the page inside
markdown emphasis (S2-12, "Put longform data at the top", is `**Put longform data at the top:**`).

Recount with [v1-drift.py](v1-drift.py) over today's saved texts, output in [v1-drift.tsv](v1-drift.tsv).
Both sides are normalised (HTML entities, markdown emphasis, backticks, link targets, list markers, curly
quotes, dashes, whitespace, case), and a quote with an ellipsis is searched as ordered fragments.

| Rows | Found by the script | Found by fragment | Not found |
|---|---:|---:|---:|
| S1-1..S1-59, OpenAI | 57 | 2 | 0 |
| S2-*, 46 rows, Anthropic | 44 | 2 | 0 |

The four found by fragment, each checked with `grep`: S1-21 (build-skills) and S1-51 (prompt-engineering),
where S1's HTML extraction puts a space before a comma after an inline tag; S2-1 (overview), whose quote
carries the list numbering inline; S2-15 (best-practices), whose quote spans a code fence, as K2 found on
2026-09-22. **105 of 105 old quotes are on today's pages.**

## What changed since 2026-09-22

The Anthropic `.md` pages are served as markdown, so the 2026-09-22 survey's text hash and today's raw hash
are comparable:

| Page | Since 2026-09-22 |
|---|---|
| overview | identical |
| claude-prompting-best-practices | changed |
| prompting-claude-fable-5-1 | changed |
| prompting-claude-fable-5 | changed |
| prompting-claude-opus-4-8 | changed |
| prompting-claude-opus-5 | changed |
| prompting-claude-sonnet-5 | identical |

Since every old quote still stands, the changes are text added or edited outside the quoted passages. The
2026-09-22 copies were not kept (their directories under `$TMPDIR` are empty), so the added text cannot be
located by a diff. The OpenAI pages' 2026-09-22 hashes were taken over a different extraction and were not
compared.

## S1's new rows are partial

S1 says so itself: 24 rows, "targeted", not exhaustive — 15 from Skill authoring best practices, **0 from the
Opus 5.5 page**, 2 from the skills overview, 7 from Claude Code's skills page, and none from pages 1–14. The
mapper M1 therefore extracts the missing rows from the saved pages itself, which departs from the method's
rule that the mapper never surveys; the Luna quota was all the Codex capacity there was.

## The coordinator's checks on M1

- **Quotes.** M1's own check was not kept, so it was run again independently: every M row's quote, split at
  ellipses, searched as fixed strings (whitespace collapsed, `\|` unescaped) in its page's saved text —
  **216 of 216 found**.
- **4.1** holds: `writing-rules.md` is linked from `README.md`, `references/roles.md`, `references/rules.md` and
  `references/practices-full.md`, and from no SKILL.md; `rewrite/SKILL.md:16-17` links `rules.md` and `roles.md`.
- **4.14 is level 3.** It happened in the session that ran this survey. After the conversation was compacted,
  Claude Code re-attached the two entrust skills invoked earlier, each marked "skill content truncated for
  compaction". `codex/SKILL.md` (0.21.0, 414 lines, 5,510 words) ended mid-sentence at line 269, after 3,415
  words, so "Prompt shape" (`:357`), "What the user reads" (`:380`), "Traps" (`:390`) and "References" (`:398`)
  were not in context. `orchestrate/SKILL.md` (0.20.0, 156 lines, 3,546 words) ended at line 143, after 3,416
  words. The two cuts fall at the same word count, as a fixed budget of the first 5,000 tokens per skill would
  (Claude Code's skills page, M-210).
