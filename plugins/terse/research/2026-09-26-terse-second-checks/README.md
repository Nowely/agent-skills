# Two checks after the rules became advice — 2026-09-26

The owner's verdict on the first light run (`../2026-09-26-terse-light-trial/`) turned the rules into two
requirements and advice, made the writer start from the text's world, ran the genre scout before the writer,
had the critics argue from the reader and took `rule1.mjs` out of the path (`1580204` to `8bfdc3d` on
`terse-process-2026-09-22`). The plan the owner approved then named two checks, each with their blind read:
the same README of [bootandy/dust](https://github.com/bootandy/dust) at `ae5c770` against the same bare
control, and a text of another kind — the comments of dust's `src/dir_walker.rs`, for the developer who
maintains it. Both light; every role `roles.md` gives to Claude Opus ran on Codex Sol. dust is Apache-2.0;
every text here derives from its README or that file. The pages were those of `8bfdc3d`.

## Verdict

**The README** (`dust-readme/`). The owner read three texts blind (`dust-readme/blind/key.json`): 1 the
original (`../2026-09-26-terse-light-trial/00-original.md`), 2 ours (`dust-readme/03-fixed.md`), 3 the first
run's control (`../2026-09-26-terse-light-trial/control/README.md`). They named 2 as ours:

> «В целом твой новый вариант, это 2. Не сказать, что продано, но стало гораздо лучше. В целом есть два
> момента. хайлайты - почему именно мы - не раскрыта. Второй момент, это набор доступных опций Frequently used
> options из 3. Хотя не уверен, что Frequently уместно. Возможно, стоило бы их отсортировать по полезности и
> просто все расписать.»

They ranked no three; this record does not claim ours beat the control. What the first run lost and this one
kept, against the owner's words of the first run:

| Valued in the first run's control | This run | Where |
|---|---|---|
| the demo | kept from the draft on | `01-draft.md` lines 9-11 |
| "du, written in Rust" | the first line: "**`du` + Rust = `dust`.**" | `01-draft.md` line 5 |
| install anywhere | the shell installer, then seven package managers in a table, then release archives | `03-fixed.md`, Install |
| no rudiment | no How it works | — |

What the owner still found missing: the highlights say what dust does ("Focused", "Readable", "Ready
immediately"), not why a reader would choose it over what they use; and the control's reference of options
read better than our table of thirteen tasks.

**The comments** (`dir-walker-comments/`) have no owner read: the owner closed the wave before it —
«Предлагаю волну на этом закончить». Their evidence is the agents' alone: the question readers answered 3 of
3 on the draft and on the repair, and both cold readers found the comments clear, one calling them
"unusually clear and accurate" (`check/cold-sol.md`). The blind set's key is `dir-walker-comments/blind/key.json`.

## What went wrong

- **The writer took nearly every finding.** On the README it applied 87 of 88 in the repair and 22 of 23 in the
  fix; on the comments 79 of 80, then 6 of 9. "Applied" counts the critics' keep lines and the cold readers'
  praise, so the declines are the signal. The truth critics' replacements carried qualifications although brief
  3 now says a rare case is noted, not written in, and the repair took them: "proportional bars and percentages
  appear when the terminal is wide enough", "On a supported architecture, it downloads…", "The project warns
  that the Snap package may not be able to read…". The Astra cold reader then stumbled on two of them
  (`dust-readme/check/cold-astra.md`).
- **The coordinator's fix brief went past the page, as in the first run.** It passed the cold readers' findings,
  missing parts among them, while `rewrite` step 5 sends back only a refuted sentence, a contradiction or a
  question now answered wrong. The README grew from 575 to 695 words: the installer's architectures and
  destination, a route to review the script, "On Unix" on `-s`, "files are not merged", a Troubleshooting
  section. The coordinator checked those new statements against `install.sh:43-46, 74-103, 157-165, 188-196`,
  `main.rs:361-382` and `config.rs:289-296` (level 1); the sentence about the bar's lighter segments was not
  checked.
- **`sections.mjs` found no budget.** It looks a budget up by the heading's text (`sections.mjs:20`); brief 1
  says "every `## ` heading mapped to its words", and both writers keyed `budgets.json` as `"## Install"`. The
  script printed "(no budget)" for every section and "0 section(s) over budget" (`dust-readme/check/scripts.txt`
  holds both runs, as written and with the keys stripped). On a source file it sees one section: the budgets are
  a README's device.
- **The scout's brief is not yet general.** Brief 2 asks for "raw markdown"; for source files it was filled as
  "raw text" (`dir-walker-comments/briefs/G1.codex.txt`). The scout rebuilt its table for comments by itself.

## What the comments run showed

The writer wrote `context.md` first, then a module comment. It removed two statements of the original the code
does not hold: "trips a panic threshold if retries are runaway" — nothing panics there, the count past 999 only
prints (`00-original.rs:472-481`) — and "if there is no limit this results in infinite retrys and dust never
finishes", beside a loop that retries whatever the count (`00-original.rs:274-305`); and a test comment the code
had outgrown, "every file pushes into the same parent's `children` Mutex", beside a single batched `extend`
(`00-original.rs:323-336`). It sent the owner two questions about the code instead of writing either into a
comment: whether 999 interruptions should really skip the directory, and whether the recursive `clean_inodes`
should go the way of the flat walk. The truth critics found 6 and 5 overstated or refuted statements in the
draft and 3 in the repair's changed lines, "The directory algorithm makes no recursive calls" among them.
The code is byte-identical in all three versions: `code-same.mjs` strips the comments and compares the rest
(0 differing lines of 544). Every `///` block precedes a field, a struct or a function; no Rust toolchain was
at hand, so compilation is not checked. The original's comments were not put to the question readers, so the
3 of 3 says the new comments answer, not that the old ones mislead.

## Timing and agents

| | README | Comments |
|---|---|---|
| wall time | 45 min, 14:27 to 15:12 | 56 min, 14:27 to 15:23, beside the README run |
| writer | 7.0 | scout 2.9, control 2.6, writer 9.4 |
| Codex critics | truth 2.9 and 3.6, rationalizer 1.2, question readers 0.2-0.3 | truth 4.3 and 3.2, rationalizer 1.7, question readers 0.2 |
| Sonnet critics | form 18.3, terms 12.9, sentences 7.0 | form 8.9, terms 11.9, sentences 20.5 |
| repair | 4.7 | 9.1 |
| check | truth 5.3, cold readers 0.4 | truth 3.2, cold readers 0.3 and 0.6 |
| fix | 3.2, after one "Selected model is at capacity" of 45 s and a 90-second wait | 3.2 |

Minutes, from each report. The Sonnet critics held the critical path of both runs; the Codex critics took 0.2 to
5.3. Eighteen agents a run: on the README, Codex Sol in six roles (the writer over four turns, two truth
critics, the rationalizer, truth on the repair, a cold reader), Claude Sonnet ×3, Codex Luna ×8, Codex Astra ×1;
on the comments, Codex Sol in eight (the scout and the control added), Sonnet ×3, Luna ×6, Astra ×1.

| README | Words | Sentences | Median sentence | Over 25 words | Longest |
|---|---|---|---|---|---|
| original | 1,119 | 55 | 8 | 0 | 24 |
| ours, first run | 392 | 12 | 11 | 0 | 17 |
| ours, this run | 695 | 29 | 11 | 2 | 30 |
| control | 1,141 | 47 | 10 | 0 | 25 |

Words by `wc -w`, the rest by `../2026-09-24-terse-benchmark-maestro/one-path/sentences.mjs`
(`dust-readme/measures.txt`). Both sentences over 25 words were written by the fix: the one on the bar's
segments, which carries the truth critic's "with bars enabled and enough terminal width", and the first
Troubleshooting item.

## Limits

One text of each kind, one run each; one read, and none for the comments. Ours and both controls ran on Codex
Sol. The pages now quote the owner's advice from the first dust run, so the README check shows whether the
process carries that advice into the text, not whether it generalises; the comments were to show that, and
have no human verdict. The files the scouts fetched are not kept: the comments' eight are named with their URLs
in `dir-walker-comments/genre.md`, the README's in the first run's `genre.md`.
