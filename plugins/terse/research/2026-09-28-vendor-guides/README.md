# The vendors' guidance on writing for a model, refreshed — 2026-09-28

The owner's view, which set the question: when a text is loaded and followed by an agent — a skill, a plugin's
instructions, a CLAUDE.md or AGENTS.md section, a brief — the model's vendor is the authority on how to write it,
because the reader is the model the vendor wrote for. The 2026-09-22 run
([2026-09-22-terse-process](../2026-09-22-terse-process/README.md#wave-4--the-vendor-sources-on-writing-for-a-model-mapped))
mapped OpenAI's and Anthropic's prompting guidance onto the pages; since then the pages were rewritten three times,
and that run never read Anthropic's "Skill authoring best practices". This run refreshes the map and turns it into a
draft genre note.

## Result

- **Nothing the vendors said on 2026-09-22 was withdrawn.** All 105 quotes of the old survey (59 OpenAI, 46
  Anthropic) are on today's pages. Five of the seven Anthropic prompting pages changed, by added text
  ([v1-verification.md](v1-verification.md)).
- **216 new rows** from four pages: the whole Opus 5.5 page, Skill authoring best practices beyond S1's 24 rows,
  the added text on the five changed pages, and Claude Code's skills page ([m1-map.md](m1-map.md) §1; 216 of 216
  quotes re-validated by the coordinator).
- **The 2026-09-22 candidates, re-judged:** of twelve, six still open, five whose target lines no longer exist, one
  changed by new evidence; of seventeen refusals, ten stand and seven changed — among them verification, which the
  vendor now splits by model (Fable 5 wants fresh verifiers, Opus 5 none) (§2).
- **This repository's skill pages against the vendors' skill rules** (§4): four defects, nine tensions with house
  rules. The heaviest is at level 3: `entrust`'s `codex/SKILL.md` (5,510 words) and `orchestrate/SKILL.md` exceed
  the 5,000 tokens Claude Code re-attaches after compaction, and in the session that ran this survey the codex page
  lost "Prompt shape", "What the user reads", "Traps" and "References". The others: `writing-rules.md` two links away
  from `rewrite/SKILL.md`, and five long reference files with no contents list.
- **Eighteen principles both vendors state** for text an agent executes (§5a), what only one states, where they
  conflict, and fourteen things a genre note would need that terse does not say (§5e).
- **A draft** of a genre note for skill pages and standing agent instructions, a sentence for `agent-brief.md` and
  the line in `clarity`'s genre list ([d1-genre-note-draft.md](d1-genre-note-draft.md)). The owner took it as it
  stands: `references/genres/skill-page.md`, with its example pointing to E77 instead of the finding's number.
- **Recorded, on the owner's word:** the four defects and eight of the nine tensions as E77–E83 (entrust) and E84–E88
  (terse), to be fixed in a separate audit. Tension 4.5 was left out: M1 decided a dated measurement is a record,
  not the time-sensitive instruction the vendor warns against, and the one line that is such an instruction is E80.

Nothing here shows that any practice improves a text for human readers, and no page was run against a model.

## How it ran

| Agent | Work | Cost | What went wrong |
|---|---|---|---|
| Codex Luna S1, `EFFORT: medium` | fetched 18 pages, drift of the old rows, 24 new rows | 8.5 min, 14 commands | `curl -k` after a TLS failure in the sandbox; Part 1 contradicts itself and marks quotes in markdown emphasis as gone; Part 2 partial, 0 rows from the Opus 5.5 page |
| coordinator | re-fetched all 18 pages with TLS verification (18/18 identical), recounted the drift ([v1-drift.py](v1-drift.py)), re-validated M1's quotes, confirmed 4.1 and 4.14 | — | a first hash loop in zsh reported every page identical by not splitting its arguments; redone |
| Fable M1 | the missing rows, the re-judged candidates, the map, the pages checked, the principles | 51 min, 605k tokens | extracted rows itself, against the method's split of surveyor and mapper, because S1's rows were partial |

Luna was the only Codex model with quota; Astra and Sol had none. Fetched pages stay out of the repository; the
manifest in `s1-sources.md` carries each page's URL, fetch time and SHA-256.

## Files

| File | Agent | What it is |
|---|---|---|
| `s1-sources.md`, `s1-extract-openai.py` | Codex Luna S1 | the fetch manifest and the new rows N-1..N-24, as returned; its Part 1 is superseded |
| `v1-verification.md`, `v1-drift.py`, `v1-drift.tsv` | coordinator | the checks on S1 and M1 |
| `m1-map.md` | Fable M1 | rows M-1..M-216, the re-judged candidates, the map, the pages checked, the principles |
| `d1-genre-note-draft.md` | coordinator | the draft for the owner |
