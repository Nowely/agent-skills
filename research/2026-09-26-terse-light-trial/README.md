# A light run on another project's README — 2026-09-26

The one path's first run outside maestro: light mode, on the README of
[bootandy/dust](https://github.com/bootandy/dust) at `ae5c770` (2026-09-16), a disk-usage tool for the
terminal written in Rust — another kind of text than maestro's skill library. dust is Apache-2.0; every text
here derives from its README. Every role `roles.md` gives to Claude Opus ran on Codex Sol, on the owner's word:
«вместо Claude Opus давай сол использовать». The pages were those of `5a38727` on `terse-process-2026-09-22`.

## Verdict

The owner read three texts blind (`blind/key.json`): 1 is ours (`03-fixed.md`), 2 a bare Codex Sol agent told
to improve the README (`control/README.md`), 3 the original (`00-original.md`). Their ranking: **2, 1, 3**.

> «3 файл на последнем месте. в 2м мне понравилось наличие демо, то что это du только написанное на расте -
> это очень важная информация на самом деле с точки зрения понимания сути, так и маркетинга. Понравилось, что
> сразу видится интерфейс благодаря демо, с чем столкнуешься. Понравилоась хайлайты. Установка опять же лучше.
> Там указывается, как ее установить куда угодно. в 1 эта информация потеряна и пост фактум где-то в конце
> указано карго. А ведь dust это улитарная утилита, которая должна ставится куда угодно и тебе не нужно было
> думать как именно. How it works в 1 тоже какой-то рудимент.
>
> Главный вывод, который я тебе скажу. Ты почему-то хочешь видеть универсальные правила, будто определенная
> секция должна быть вставлена. Но это так не работает. Нужно понимать контекст, собирать его. Понимать, что
> это за инструмент, целевая аудитория, какую мысль хочешь донести, приятность, продающий текст и понятная
> приятная документация. В 1м же все слишком урезано получилоась. Нет той самой полезности из 2»

By the benchmark's own premise (`plugins/terse/references/benchmark.md`), a bare agent beating the skill means
the skill failed its main task on this text.

## Where each thing the owner valued was lost

| Valued in the control | What our run did | Evidence |
|---|---|---|
| the demo: you see the interface you will meet | the writer dropped it from the draft; the output example both cold readers asked for was declined under rules 16 and 18, which are about results of a run and invented examples, not a real demo | `03-fixes.md` lines 8 and 13 |
| "du, written in Rust": the essence and the pitch | the rationalizer cut "more intuitive `du`" as a subjective comparison; "a `du` alternative" came back only after a reader could no longer answer the question; Rust was never said | `02-repairs.md` line 12; `check/Q3.md` |
| install anywhere, without thinking how | one route in Quick start (rule 8); the truth check narrowed "macOS or Linux" to "macOS"; Cargo went to a section of its own at the end, as a narrower route | `check/truth.md`; `03-fixes.md` lines 3 and 11 |
| no rudiment | How it works stayed because rules 12 and 13 name it, holding one sentence about `stdout` and `stderr` | `02-repairs.md` line 21 |

One finding never reached the writer. The genre scout counted eight READMEs of terminal tools: the familiar
command named in 8 of 8, visual proof in 7 of 8, package-manager choices in 8 of 8 (`genre.md`). The one path
sends a scout's table to the form critic alone, and the writer was told the genre was not yet counted
(`briefs/W1.codex.txt`). The advisor had named this gap on 2026-09-25.

## Timing and agents

34 minutes from the first agent to `03-fixed.md`, 13:06 to 13:40 (`timeline.tsv`): the draft 5.5, the critics
about 12, held by the Sonnet terms critic while the Codex critics took 1.4 to 4.5; the repair 5.0; the check
4.4; the fix 3.0. Twenty-one agents: Codex Sol in nine roles (writer, genre scout, control, two truth critics,
rationalizer, truth on the repair, a cold reader), Claude Sonnet ×4, Codex Luna ×8, Codex Astra ×1. Two truth
critics instead of the three announced: the draft had 542 words. The maestro runs took 70 and 93 minutes on
other models and a longer text, so the difference is not a measured speed-up of the method.

| Text | Visible words | Sentences | Median sentence |
|---|---|---|---|
| original | 1,020 | 55 | 8 |
| ours | 314 | 12 | 11 |
| control | 951 | 47 | 10 |

## Also found

- `rule1.mjs` reported 13 violations on `02-repaired.md`, every one a flag in the options table
  (`check/scripts.txt`): the inventory of a terminal tool is its flags, and the check counts them as mechanism
  before How it works.
- The truth brief's "shortest sentence that is true" produced replacements a reader cannot parse. Both cold
  readers stumbled on the two the repair adopted, "Flattens entries without children" and "Keeps directory
  child entries" (`check/cold-astra.md`, `check/cold-sol.md`); the fix then adopted a third, "Filters matching
  files" for `-v`, beside "Includes matching files" for `-e`.

## Limits

One text, one run, one read. Ours and the control both ran on Codex Sol. The scout's eight fetched READMEs
(bat, bottom, dua-cli, eza, fd, gdu, procs, ripgrep) are not kept here.
