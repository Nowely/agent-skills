# Genre notes: the README of a terminal tool

A tool people install through a package manager and run in a terminal — disk usage, file search, system
monitoring and the like. What the most-used READMEs of the kind put where, counted from raw markdown, and the
owner's advice for them. The writer reads these instead of running a genre scout; a scout's new count for the
same kind replaces a line here, with its date.

| Place | What the genre puts there | Count | Formatting |
|---|---|---|---|
| 1 | the name, what kind of tool it is, and the familiar command it replaces or improves | 8 of 8 | a title and a one-paragraph tagline |
| 2 | badges: build, release, package registry, packaging status | 8 of 8 | linked badge images below the title |
| 3 | jump links or a table of contents | 5 of 8 | a headed bullet list, or one inline row of links |
| 4 | what the reader will see: a screenshot, an animated demo, a terminal recording | 7 of 8 | an image, a linked recording card, or a centred `<img>` |
| 5 | what it does better: features, better defaults, speed, platforms, a comparison with the familiar command | 8 of 8 | a bullet list in 4; prose in 2; small headed features with images in 1; a benchmark table in 1 |
| 6 | installation: package-manager choices, binaries, building from source, platforms | 8 of 8 | a heading of its own in all 8; sub-headings by system or package manager, bold-led lines, a block per command; before detailed usage in 5 of 8 |
| 7 | the first use, then representative tasks | 8 of 8 | short paragraphs with a block per command, often followed by a screenshot; long lists of options deferred or folded |
| 8 | depth: configuration, customisation, integrations, completions | 7 of 8 | second-level headings, a fenced configuration file, sometimes `<details>` |
| 9 | limits, troubleshooting, reasons not to use it | 7 of 8 | question-style headings, lists, corrective commands |
| 10 | benchmarks, comparisons, alternatives | 6 of 8 | a table for measured comparisons, a list for alternatives |
| tail | building, tests, contributing, licence | 7 of 8 | headings and short lists of links |

The strongest openings — fd, dua-cli, gdu — say in about 150 words what the tool is, name the familiar command
it answers, give one concrete advantage, show the main command or a picture of its output, and move to
installation before any internals. The pattern: name and the familiar command, one sentence of what is
different, one command or picture, three to seven advantages, installation.

Source: eight READMEs counted by a scout on 2026-09-26 — bat, bottom, dua-cli, eza, fd, gdu, procs and
ripgrep — recorded in `plugins/terse/research/2026-09-26-terse-light-trial/genre.md`. What the genre does is a precedent,
not a rule.

## Advice for this kind

**Name the familiar command, and what is different.** "du, written in Rust" says what the tool is and why it
exists in five words. *owner, 2026-09-26: «то что это du только написанное на расте - это очень важная
информация на самом деле с точки зрения понимания сути, так и маркетинга». genre, place 1.*

**Show the interface.** A demo lets the reader see what they will meet before installing. *owner, 2026-09-26:
«Понравилось, что сразу видится интерфейс благодаря демо, с чем столкнешься». genre, place 4.*

**Installation for anywhere the reader works.** A utility is expected to install on any system without the
reader working out how: give the common package managers, each as a line to copy. *owner, 2026-09-26: «dust
это улитарная утилита, которая должна ставится куда угодно и тебе не нужно было думать как именно». genre,
place 6.*

**The options as one table, sorted by usefulness.** The flag with its long form and what it does, from the
one most readers reach for to the rarest — all of them, rather than a chosen few under a label such as
"Frequently used". Where a long list is folded or deferred, as the genre often does, the order still runs by
usefulness. *owner, 2026-09-26, of a control's option reference, beside our table of thirteen tasks: «Второй
момент, это набор доступных опций Frequently used options из 3. Хотя не уверен, что Frequently уместно.
Возможно, стоило бы их отсортировать по полезности и просто все расписать». genre, place 7.*
