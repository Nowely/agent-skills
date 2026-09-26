# Genre notes: the README of a plugin or skill library

What the most-used documents of the kind put where, counted from raw markdown, and the owner's advice for
READMEs of this kind. The writer reads these instead of running a genre scout; a scout's new count for the same
kind replaces a line here, with its date. A tool people install and run in a terminal is another kind:
[readme-terminal-tools.md](readme-terminal-tools.md).

| Place | What the genre puts there | Count | Formatting |
|---|---|---|---|
| 1 | what it is and the job it does | 9 of 9 plugin READMEs, 2026-09-23; 7 of 7 skill-library READMEs, 2026-09-24 | a title, one line of identity, often badges or a logo above |
| 2 | why it: a short list of what it does for the reader, or a chooser between ways of using it | 3 of 7 skill-library READMEs give a rationale before setup, 1 a chooser table, 2026-09-24 | a bullet or bold-led list; a table only for a real choice |
| 3 | Quick start: install, then the first use | install in 8 of 9 plugin READMEs, right after what it is in 4 of the 8, 2026-09-23; setup in 7 of 7 skill-library READMEs, within the first four sections in 6, 2026-09-24 | a fenced block to copy, with a language; headed or bold-led sub-blocks in 4 of 8 plugin and 4 of 5 agent READMEs, 2026-09-23 |
| 4 | the inventory: commands, skills, tools | 7 of 9 plugin READMEs, 2026-09-23; grouped inventories in 4 of 7 skill-library READMEs, 2026-09-24 | a table, or grouped bold-led lists |
| 5 | how it works, configuration | 4 of 9 plugin READMEs, 2026-09-23 | one section, below the middle |
| tail | documentation links, contributing | contributing in 5 of 7 skill-library READMEs, 2026-09-24 | a short list of links |

Sources: `plugins/terse/research/2026-09-22-terse-process/rethink-2026-09-23/survey/` (nine plugin READMEs) and
`plugins/terse/research/2026-09-24-terse-benchmark-maestro/rethink/survey/` (seven skill-library, five same-position, eight
most-used READMEs). What the genre does is a precedent, not a rule.

## Advice for this kind

**A Quick start after the opening: install, then the first use.** Install as a block to copy, in the form that
runs; the first use as the workflow — what to type first and what comes back. It spares a reader who has
decided to try it from hunting for the first step. *genre, as in place 3. owner, 2026-09-11: «понавилось что
есть Install and first run и сразу блок»; 2026-09-24: «в быстром старте сразу говорит как устаниваить, как
начать пользоваться - workdlow».*

**Update, where a command exists: one line or one block.** A convenience this plugin adopted, not a norm of the
genre. *owner, 2026-09-24: «Update это лишнее удобство, которое мы пришли сами».*

**The inventory as a table.** Commands, skills, options: name, what it does, when to reach for it. *genre, as in
place 4. owner, 2026-09-12: «нет таблицы с командами скилов, хотя по сути эта база для плагина».*

**The genre's order, unless the context says otherwise.** What it is, Quick start, the inventory, how it
works: the order readers of the kind expect. *genre, as in the table.*

**Badges where they carry live information.** The current version, or where it installs from; none that types
a value by hand, and no licence badge. *owner, 2026-09-25: «Бейджи. Нужно добавлять, если они уместны. Это
реадми, они могут быть уместны. Где-то нет информации, которую так можно предоставить или хотелось бы».*

**Sections the owner found to be noise in a plugin README.** A licence line, troubleshooting, "your files",
where the tool keeps its data: a plugin should just work, and what it writes is one line where the mechanism is
told. *owner, 2026-09-23: «упоминать лицензию не нужно. просто шум»; 2026-09-24: Your files: «Выглядит
мусорной секцией»; Troubleshooting: «Плагин должен просто работать».*
