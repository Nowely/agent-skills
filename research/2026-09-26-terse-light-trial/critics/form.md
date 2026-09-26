<!-- form; 6.9 min; 4 tool uses -->

Reviewed 01-draft.md (Dust README) against rules.md's pleasant-read section + rules 4-16, and genre.md's order. No file modified.

## Direct answers

1. **Pleasant to scan** — yes, largely: title/badge/tagline/intro, 3-item bold-led list, Quick start with language-fenced code, an options table, closing "How it works." Two frictions below (findings 1, 2).
2. **Opening = what it is / what it's for / advantages list** — partial. Advantages list (9-11) is correctly formatted (rule 5). "What it is" (line 7) reads as mechanism, not mission (finding 3), and sits after an intervening tagline that splits the masthead (finding 1).
3. **Quick start right after opening, install + first use, common routes only** — yes for install (15-19) and first use (21-25). A third block (27-31) extends past "install, then first use" into generic syntax reference (finding 4).
4. **Inventory as a table, alike rows distinguished** — yes, clean. `-e`/`-v` (regex include/exclude) and `-F`/`-D` (file-only/dir-only) are the closest pairs; both are told apart in the "Reach for it when" column (43-44, 41-42). No rule 10/11 violation found.
5. **Sections/sub-blocks formatted as the genre formats them** — mostly. Headings, bold-led list, fenced bash blocks, table all match rule 14. One inconsistency (finding 5).
6. **Missing / extra / out of place** — no canonical section (opening, Quick start, inventory, How it works) is missing; the four appear in exactly rule 13's order. Extra: the badge (finding 2). Out of place: the tagline (finding 1).

## Findings

1. **Line 5** (`> Because I want an easy way to see where my disk is being used.`) vs **rule 4** and **rule 13** / genre.md row 1 — genre.md row 1: masthead is "Name, category, and the familiar command being replaced or improved," *then* the tagline. Here the `du`-comparison sentence is line 7, placed *after* the line-5 tagline — splits the masthead and pushes rule 4's "first lines name the thing and the job" past the quote. (evidence level 2)

2. **Line 3** (Build-status badge) vs **rule 14** — "Badges under the title where they carry live information the reader wants, such as the current version or where it installs from." A CI build-status badge is neither; no example in rule 14 covers it. (level 2)

3. **Line 7** ("it finds the largest files and directories beneath the paths you give it and lays them out as a size-sorted tree") vs **rule 4** — rule 4 wants "the mission, not a definition." This clause describes mechanism, and duplicates ground already covered by "How it works" (line 63: "reads directory entries and filesystem metadata, totals the children beneath each directory, and selects the largest entries"), which is where rule 12 says technical detail belongs. (level 2)

4. **Lines 27-31** (`dust PATH...` block) vs **rule 7** / **rule 8** — rule 7 defines Quick start's first use as a concrete workflow, "what to type first and what comes back." This block shows a placeholder syntax pattern with no output — reference material rather than a worked first use, borderline scope creep past install+first-use. (level 2, arguable)

5. **Line 29** (` ```text ` fencing `dust PATH...`) vs **rule 14** — "a fenced block with a language for every command." Lines 17 and 23 fence commands as ` ```bash `; this one switches to ` ```text ` for what is still a command line. (level 1 on the observation, level 2 on whether it counts as a violation, since `PATH...` is a placeholder rather than a literal command)

No violation found for rule 10/11 (inventory table) or rule 13 (major-section order) — both checked explicitly per the brief and passed.

