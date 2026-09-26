# The rules

What a text must do for its reader, in the order a writer meets the questions. Every writer and every
critic of the three skills works from this list; a run's owner may add a rule or set one aside, in
words, and the run records it. Sentence-level rules are a separate layer:
[writing-rules.md](../skills/rewrite/references/writing-rules.md).

Each rule names its source, so that a critic can weigh it and a later edit can see what it rests on:

- **owner** — said by the owner of this plugin, with the date; it is their judgement, not a count;
- **genre** — counted in documents of the kind, N of M, from a survey on the date given;
- **measured** — a failure recorded in `research/`, which the rule exists to stop.

A rule marked **ours** is a convenience this plugin adopted, not a norm of the genre: use it where it
helps the reader, never require it.

## The reader

1. **Every word carries weight for the reader who arrives here.** A sentence or a block earns its
   place by what it gives that reader; nothing stays "just in case". *owner, 2026-09-10 and 09-11: «В
   ней не должно содержаться нерелевантной информации и что-то просто на всякий случай»; «каждое
   слово … имеет вес … как в задаче о рюкзаке».*
2. **Write for the reader's actual experience.** Do not explain what that reader already knows — their
   own editor, their AI tool, what a command line or a slash command is — and do not assume they know
   the project's internals. *owner, 2026-09-24, on a README that explained setup «Будто он впервый раз в
   жизни открыл для себя ии, vs code и прочее»; 2026-09-10: «$TMPDIR - серьезно? Что это скажет человеку,
   который впервые сюда зашел».*
3. **A fact the reader already has, or cannot act on, is noise.** A runtime or editor version any
   reader of this audience has, `PATH`, credential files, internal paths, exit codes, protocol names.
   Keep a prerequisite only where a reader of this audience would otherwise fail and not know why.
   Check: every version, path and protocol name in the first two sections is questioned by the
   rationalizer. *owner, 2026-09-11: «Когда говорят как установить codex никто не говорит, что нужна
   нода и path»; 2026-09-24: «Зависимость от Node 20 и тд, тоже нелепа».*

## The opening

4. **Say what it is and what it is for.** The first lines name the thing and the job it does for the
   reader, in the reader's words; the mission, not a definition. *owner, 2026-09-10: «Вместо того,
   чтобы сказать самое важное - про его миссию, цель или задачу … ты начинаешь перегружать
   терминами»; 2026-09-23: «Оно неотвечает на вопрос об задаче этого плагина, его
   предназначении».*
5. **Then its advantages, as a short list.** What it does for the reader that its alternatives do not,
   one bold-led item each. *owner, 2026-09-24, of the README they ranked first: «отвечает что это за
   проект, и сразу подчеркивает конкурентные преимущества … используя форматирвание список».*
6. **The opening sells; it does not warn, define or ask.** No question as the first sentence, no
   failure modes, no protocol or process names, no talk about the document itself. *owner, 2026-09-11:
   «вводный блок призванный продать, а не напугать»; 2026-09-23: «Оно начинается с вопроса. Оно
   привязывется к readme».*

## Quick start

7. **A Quick start follows the opening: install, then the first use.** Install is a block to copy, in
   the form that runs; the first use is the workflow — what to type first and what comes back. Call it
   Quick start. *genre, 2026-09-23: install in 8 of 9 plugin READMEs, right after what it is in 4 of the
   8; the start section split into headed blocks in 4 of 8 plugin and 4 of 5 agent READMEs. owner,
   2026-09-11: «понавилось что есть Install and first run и сразу блок»; 2026-09-24: «в быстром старте
   сразу говорит как устаниваить, как начать пользоваться - workdlow».*
8. **Say what to do, not everything that is true.** One route by default; other routes one line each
   or a link. *owner, 2026-09-24: «Getting started честен, но бессмысленен … нужно просто сказать, что
   нужно сделать»; 2026-09-23: «крайне многословно идет описание секции install».*
9. **Update, where a command exists: one line or one block.** *ours, owner 2026-09-24: «Update это
   лишнее удобство, которое мы пришли сами».*

## The body

10. **The inventory is a table.** Commands, skills, options: name, what it does, when to reach for it.
    *genre, 2026-09-23: an inventory in 7 of 9 plugin READMEs. owner, 2026-09-12: «нет таблицы с
    командами скилов, хотя по сути эта база для плагина».*
11. **Rows that differ go in a table; rows that say the same thing do not.** *owner, 2026-09-11: «про паритет думаю, нужна таблица»;
    measured, 2026-09-11: a table whose rows were identical was cut.*
12. **Technical detail lives in one section below the middle.** How it works, for the reader who came
    for it; spread through the early sections it reads as a warning. *owner, 2026-09-11: «Если хочешь
    рассказать про технические детали, то нужна отдельная секция из разряда "как это работает"».*
13. **The order follows the genre, and a departure says why.** What it is, Quick start, the inventory,
    how it works. Look at what the most-used documents of the kind do before inventing a structure.
    *owner, 2026-09-12: «не всегда имеет смысл выдумывать структуру с нуля, всегда хорошо подглядеть у
    коллег»; genre, as in 7 and 10.*
14. **Formatting is the genre's.** Headings for sections, headed or bold-led sub-blocks, a fenced block
    with a language for every command, a list for parallel items. *owner, 2026-09-11: «удобно иметь их в
    codeblock … с укзанием языка»; 2026-09-24: «Оформление. В 2 оно все равно уступает».*

## What never appears

15. **No junk sections.** No licence line, troubleshooting, "your files", or where the tool keeps its
    data; the tool should just work, and what it writes is one line under How it works. *owner,
    2026-09-23: «упоминать лицензию не нужно. просто шум»; 2026-09-24: Your files: «Выглядит мусорной
    секцией»; Troubleshooting: «Плагин должен просто работать».*
16. **No results and nothing from a run.** No measured numbers, no dated report lines, no excerpts of a
    run's files. *owner, 2026-09-24: «What was measured … не нужна readme … Ему главное результат».*
17. **No binding to a version.** The document describes the code as it is now. *owner, 2026-09-24:
    «REAMDE всегда должен соответствовать коду».*
18. **No invented examples.** A fabricated path or command is water; use a real one or none. *measured,
    2026-09-11.*
19. **No narrative of how the text was made.** No section introduced by who asked for it. *owner,
    2026-09-11: «описываешь их с точки зрения наратива - почему ты их создал».*

## Truth and words

20. **Every claim is true of the code, at the level its words assert.** A guarantee word — every,
    always, never, only — is shown by a run or narrowed. *owner, 2026-09-10: «двадцать с лишним мест,
    где текст утверждает о поведении кода то, чего код не делает»; measured, 2026-09-10 and 09-22.*
21. **A qualification is not a fix.** A sentence that needs a caveat to be true says too much: say less,
    or link the source. *owner, 2026-09-12; measured: five rounds of caveats raised regressions from
    one to ten.*
22. **The vocabulary agrees with the claim.** The reader's word for a thing, not the project's internal
    one. *owner, 2026-09-11, on "seat".*
23. **The owner's requirements are claims too.** A behaviour the owner asks the text to state is checked
    against the code like any other sentence, and a false one goes back to them as a question.
    *measured, 2026-09-24: three of the six sentences round 02 of the maestro run repaired came from the
    owner's own answers.*
