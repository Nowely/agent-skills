<!-- rules; 7.1 min; 3 tool uses -->

Checked `01-draft.md` (the dust README) against all 23 numbered rules in `rules.md`, one by one. Two breaks found; the rest hold.

**Rule 4** — "The first lines name the thing and the job it does for the reader, in the reader's words; the mission, not a definition." Breaks.
Line 5: `> Because I want an easy way to see where my disk is being used.`
This is the first line of body text (after title/badge), and it states the *author's* own reason for building the tool, first person ("I want") — not the reader's words naming what the thing is or does for them. The actual mission sentence ("Dust is a more intuitive `du`...") only arrives on line 7, after it.

**Rule 6** — "The opening sells... It may name the reader's problem... in the reader's words — but never warns about the project itself... no talk about the document itself." Breaks (same line).
Line 5, same quote. The one exception the rule grants a non-mission opening line is the reader's problem stated in the reader's words; this line gives the author's problem in the author's words, so it doesn't fit that exception, and it states no benefit to the reader that would otherwise make it sell.

**Rule 14** — "Badges under the title where they carry live information the reader wants, such as the current version or where it installs from." Breaks, weaker case.
Line 3: `[![Build status](https://github.com/bootandy/dust/actions/workflows/CICD.yml/badge.svg?branch=master)](https://github.com/bootandy/dust/actions)`
Neither a version nor an install-source signal — the rule's two given examples. Cross-ref rule 3's noise test ("a fact ... the reader ... cannot act on ... is noise"): a reader deciding whether/how to use the tool can't act on CI build status. Flagged with less confidence than the other two: "such as" in rule 14 is non-exhaustive, and a build badge is common in the genre this text belongs to.

Everything else — rules 1, 2, 3 (elsewhere), 5, 7–13, 15–23 — holds against the text as given. Two notes on coverage, not breaks: rule 20 (truth against the code) was checked only for internal self-consistency across the draft's own sections (none found broken) — checking it against dust's actual source/behavior would need files outside the two the brief named, so that wasn't done. Rule 9 (update command) has no evidence either way: no update command appears in the draft, and there's no way from these two files to know whether dust has one.

No repository files modified; nothing written outside $TMPDIR; no `cd` used.
