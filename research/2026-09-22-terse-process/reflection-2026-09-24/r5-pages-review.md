# Codex Sol R5 review — terse-process-2026-09-22

Branch HEAD reviewed: `d7a1f376ed3eb8454263488408b64e3792a717e8`.

Summary: review complete; 7 checks; 2 do not hold (checks 4 and 5).

## Verdicts

### (1) holds for the new text

The owner quotations added by these commits are at:

- `plugins/terse/skills/rethink/references/stages.md:364-369` (rule 13)
- `plugins/terse/skills/rethink/references/stages.md:375-378` (rule 14)
- `plugins/terse/skills/rethink/references/briefs.md:93-94` (section 1)

All 14 non-ellipsis chunks occur character-for-character in
`research/2026-09-22-terse-process/rethink-2026-09-23/skeleton-read-02.md:7-8,14-18,22-29`.
There are no differing characters. In particular, the source typos retained by the new text are
`прмименить`, `иехнического`, `дежржать`, and `пайлпана`.

Scope note: section 1 also has a pre-existing owner quote at `briefs.md:89-91` beginning
`нужно на уровне...`. Commit `2a88e3e` did not add or change it, and it is absent from the named
`skeleton-read-02.md` source (`rg` exit 1). Under the task's stated scope—claims made by the new text—it
is not part of this verdict. If “every quotation ... in briefs.md section 1” is instead intended to include
pre-existing text, that broader proposition does not hold.

Commands (all started):

- `nl -ba .../skeleton-read-02.md` — exit 0, 37 output lines.
- Fourteen exact `rg -nF` searches over the named source — aggregate shell exit 0, 14 output lines.
- The Python exact-chunk membership command — exit 0, output `chunks=14 matched=14 missing=0`.
- `git show --format= --unified=0 2a88e3e -- plugins/terse/skills/rethink/references/briefs.md` — exit 0; its hunk adds current lines 92-96, not current lines 89-91.
- `rg -nF 'нужно на уровне смыслов и идей понимать, предметную' .../skeleton-read-02.md` — started, exit 1, 0 output lines (ordinary no-match result).

### (2) holds

Both phrases in `stages.md:375-376` are present as written in
`research/2026-09-22-terse-process/rewrite-2026-09-24/run/03-routes.md:20,23`:
`Its report on this plugin's README, 2026-09-22:` and `` `missing`: the owner's intent ``.

Command: two exact `rg -nF` searches over `03-routes.md` — aggregate exit 0, 2 output lines.

### (3) holds

The count is stated in
`research/2026-09-22-terse-process/rethink-2026-09-23/skeleton.03.md:60-62,77-84` and repeated compactly
at `:324`. `G` means the nine exact-genre plugin READMEs (`:61-62`); eight have an install or quick-start
section, four of those split it with subheadings (`:77-79`). Five agent READMEs have such a section and
four use subheadings (`:79-80`). Thus the numbers and the restricted denominators match the wording at
`plugins/terse/skills/rethink/references/briefs.md:92-96` and `plugins/terse/CHANGELOG.md:120-124`:
“head the blocks inside their start section” means the record's “divide it with subheadings.”

Commands:

- `nl -ba .../skeleton.03.md | sed -n '60,90p;315,330p'` — exit 0, 47 output lines.
- `cmp -s .../skeleton.03.md .../skeleton.md` — exit 0, 0 direct output lines; the following status line was `cmp_skeleton_exit=0`.
- Focused `rg -n -C 3 'Inside Quick start|4 of 8 G and 4 of 5|Of the 8 G|Of the 5 agent' ...` — exit 0; the relevant source ranges above were returned.

### (4) does not hold

Two stale statements remain under `plugins/terse/`:

- `plugins/terse/CHANGELOG.md:91-94` says lens 7's default “is now twelve rules.”
- `plugins/terse/CHANGELOG.md:153-159` says the default rules “are the twelve of stages.md.”

The other subclaims hold:

- `stages.md:319-379` is numbered exactly 1 through 14, without a gap.
- The count sentence at `stages.md:311-317` says rules 1-11 and 12, then rules 12-14; it matches the list.
- `rewrite/SKILL.md:195` resolves through `../rethink/references/stages.md#the-rules-this-produced`.
- `rewrite/references/critic-briefs.md:192-196` resolves through
  `../../rethink/references/stages.md#the-rules-this-produced`.
- Both target files exist and contain `## The rules this produced` at `stages.md:311`, whose GitHub-style
  anchor is `the-rules-this-produced`.

Commands:

- `rg -n -i 'twelve|12[ -](content[ -])?rules|rules.{0,24}(twelve|12)' plugins/terse` — exit 0, 6 output lines: the 2 stale rule-count lines plus 4 unrelated uses of twelve in `prior-art.md`.
- The direct AWK rule-sequence validator — exit 0, output `1,2,...,14` and `count=14` (2 lines).
- Two `test -f` target checks — both exit 0, 0 direct output lines.
- `rg -n '^## The rules this produced$'` over both resolved paths — exit 0, 2 output lines.
- `rg -n '\]\([^)]*stages\.md#the-rules-this-produced\)'` over both referring pages — exit 0, 2 output lines.

One attempted alternative numbering command could not complete in the managed sandbox:
`awk ... stages.md | diff -u - <(seq 1 14)`; it started, `diff` exited 2, exact diagnostic
`diff: -: Operation not permitted`. The direct AWK validator above replaced it and exited 0.

### (5) does not hold

Two requested facts do hold:

- `a613394:plugins/terse/README.md` and
  `research/2026-09-22-terse-process/rewrite-2026-09-24/run/04-shape.md` have identical Git blob ID
  `c4297c4ceb91f544ecc6b9f604608e0d85fdc77a` and identical size 4,769 bytes.
- The owner's full row-04 read appears at
  `research/2026-09-22-terse-process/rewrite-2026-09-24/run/rounds.md:16-18`, including verbatim
  `Текущий вариант пока что лучший`, and it says the README was applied as `a613394`, byte-identical to
  `04-shape.md`, with no release asked for.

But `plugins/terse/skills/rewrite/SKILL.md:225-230` also says “nothing else in their repository changes on
that word.” The cited application commit `a613394` changed both `plugins/terse/README.md` and
`plugins/terse/CHANGELOG.md`, so that repository claim is false for the example used by the paragraph.

Commands:

- `git show --format=fuller --stat --name-status --no-renames a613394` — exit 0, 11 output lines; 2 modified files.
- `git rev-parse a613394:plugins/terse/README.md` — exit 0, 1 output line, blob ID above.
- `git hash-object .../04-shape.md` — exit 0, 1 output line, same blob ID.
- `git cat-file -s a613394:plugins/terse/README.md` — exit 0, 1 output line, `4769`.
- `wc -c .../04-shape.md` — exit 0, 1 output line, `4769`.
- `rg -nF 'Текущий вариант пока что лучший' .../rounds.md` — exit 0, 1 output line at line 18.
- `nl -ba .../rounds.md | sed -n '8,20p'` — exit 0, 11 output lines (the two very long table rows wrap only in display, not in the file).

### (6) holds

The requested combined case-insensitive pattern set produced 22 unique line hits. None tells a writer,
structure, or skeleton to put a run's register, dated report line, failure label, run-file excerpt, or
measured run numbers into the document being written. Hit-by-hit:

1. consistent — `plugins/terse/skills/rethink/SKILL.md:18`: internal history of a ten-section draft.
2. consistent — `plugins/terse/CHANGELOG.md:109`: records replacement of the rejected README section.
3. consistent — `plugins/terse/CHANGELOG.md:115`: states that measured development information stays inside the plugin.
4. consistent — `plugins/terse/CHANGELOG.md:117`: states the ban on a dated report line.
5. consistent — `plugins/terse/CHANGELOG.md:118`: states the ban on a ledger label or excerpt.
6. consistent — `plugins/terse/references/prior-art.md:166`: reports a study's 4,724 textual excerpts, not a run artifact for a document.
7. consistent — `plugins/terse/references/prior-art.md:317`: an internal method recommendation to publish an answer-key error rate, not to put this plugin run's measured numbers into the target document.
8. consistent — `plugins/terse/references/prior-art.md:511`: retrieval context excerpts between model calls, not prose for the target document.
9. consistent — `plugins/terse/skills/rethink/references/stages.md:360`: rule 13 itself.
10. consistent — `plugins/terse/skills/rethink/references/stages.md:364`: source history for rule 13.
11. consistent — `plugins/terse/skills/rethink/references/stages.md:373`: rule 14's dated-report-line prohibition.
12. consistent — `plugins/terse/skills/rethink/references/stages.md:374`: rule 14's run-file-excerpt prohibition.
13. consistent — `plugins/terse/skills/rethink/references/stages.md:385`: internal evidence about a skeleton's presentation.
14. consistent — `plugins/terse/skills/rethink/references/stages.md:391`: internal evidence about skeleton 01.
15. consistent — `plugins/terse/skills/rethink/references/briefs.md:135`: internal history explaining why a structure must reserve an unsettled section without writing it.
16. consistent — `plugins/terse/skills/rethink/references/briefs.md:304`: internal evidence about how skeleton 01 was handed over.
17. consistent — `plugins/terse/references/practices-full.md:1583`: an audit finding schema quotes the offending source sentence in the report; it does not place the run report in the target document.
18. consistent — `plugins/terse/references/practices-full.md:1584`: locus for that report-schema field.
19. consistent — `plugins/terse/references/practices-full.md:1585`: caveat about verifying that report field.
20. consistent — `plugins/terse/references/practices-full.md:1586`: cost of that report field.
21. consistent — `plugins/terse/references/practices-full.md:1595`: retrieved model context, not target-document prose.
22. consistent — `plugins/terse/references/practices-full.md:1598`: limits the previous item to audit input.

Commands:

- `rg -n -i -e 'excerpt' -e 'What was measured' -e 'report line' -e 'measured.{0,100}section' -e 'section.{0,100}measured' plugins/terse` — exit 0, 22 output lines.
- The same `rg` with `-C 2` — exit 0, 97 output lines.
- `nl -ba` context reads for `prior-art.md:156-174,308-322,502-518`,
  `practices-full.md:1568-1604`, `rethink/SKILL.md:12-24`, and
  `briefs.md:128-142,298-310` — aggregate shell exit 0, 129 output lines before the final count line.
- The combined-pattern result piped to `wc -l` — exit 0, output `22`.

### (7) holds

Each bullet describes its own commit's page diff and no other repository change:

- `c1c30ed` bullet at its `CHANGELOG.md:114-119`: the commit adds rules 13-14 to `stages.md` and updates
  lens 7's defaults from twelve to fourteen in `rewrite/SKILL.md` and `critic-briefs.md`. Its other changed
  file is the changelog itself.
- `2a88e3e` bullet at its `CHANGELOG.md:120-124`: the commit adds sub-block/mark counting to the survey,
  synthesis, and skeleton briefs in `briefs.md`, and to the skeleton hand-over contract in
  `rethink/SKILL.md`. Its other changed file is the changelog itself.
- `d7a1f37` bullet at its `CHANGELOG.md:125-129`: the commit adds exactly the post-`then stop` paragraph to
  `rewrite/SKILL.md`. Its only other changed file is the changelog itself.

This is a diff-scope verdict. It does not cure the false repository-history statement inside the d7a1f37
paragraph and changelog bullet; that substantive issue is check (5).

Commands:

- `git diff-tree --no-commit-id --name-only -r` for the three SHAs — aggregate exit 0, 9 output lines
  (4 + 3 + 2 files).
- `git show <sha>:plugins/terse/CHANGELOG.md | nl -ba | sed ...` for the three SHAs — aggregate exit 0,
  44 output lines.
- `git show --format= --unified=0` over every non-changelog file changed by each commit — aggregate exit 0;
  99 output lines.

## Initial repository and commit checks

- `pwd; git status --short --branch; git rev-parse --show-toplevel; git rev-parse c1c30ed 2a88e3e d7a1f37 HEAD; printenv TMPDIR` — exit 0, 8 output lines. Branch was clean; HEAD was d7a1f37; TMPDIR resolved under `/var/folders`.
- Three `git show --stat ...` plus three full `git show ...` commands — aggregate exit 0, 259 output lines. They established every diff under review.
- Numbered current-disk reads of all changed regions in the six unique changed files — aggregate exit 0, 335 output lines. These were `stages.md:306-390`, `briefs.md:40-130,250-280`, `rewrite/SKILL.md:180-240`, `critic-briefs.md:185-215`, and `CHANGELOG.md:100-135`; `rethink/SKILL.md:122-125` was also read in the commit and diff-context commands.

An exploratory broad `rg -n -C 4` over the research tree started and exited 0, but its output was too broad
(3,719 lines before tool truncation). It was replaced by the focused `skeleton.03.md` reads cited in check
(3); no verdict depends on truncated output.

Repository modifications made by this review: none.
