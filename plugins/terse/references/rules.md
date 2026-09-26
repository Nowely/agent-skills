# The rules

Two things are required of every text, and everything else here is advice. The advice helps a writer find the
best structure, wording and form for the text in front of them: take what helps this text and leave the rest,
with no apology owed. Each piece says what it helps with, where it came from and, where that is known, when it
does not fit. Advice for one kind of text — the README of a plugin, of a terminal tool — is in
[genres/](genres/). The sentence layer, [writing-rules.md](writing-rules.md) and
[curse-of-knowledge.md](curse-of-knowledge.md), is a measured technique the writer and the sentence critic
apply as written. *owner, 2026-09-26: «Правила должны нести рекомендательный характер. Они должны направлять и
помогать найти и составить лучшую структуру, лучший текст, лучшее оформление. При этом стоит понимать, что нет
однозначных правил которые следует требовать (может за некоторыми исключениями как приятность)»; «Будем мы
писать код, комментарии, или поэму. Мы там тоже будем вставлять How it works? Это даже смешно».*

Each piece names its source, so that a later edit can see what it rests on:

- **owner** — said by the owner of this plugin, with the date; their judgement, not a count;
- **genre** — counted in documents of a kind, N of M, on the date given;
- **measured** — a failure recorded in `research/`, which the advice exists to prevent.

## Required of every text

### A pleasant read

The text is pleasant to read. A pleasant text sells: the reader settles into it and works with it gladly, and
it reads naturally, not as everything true about its subject. Formatting is one of its properties; so are
sentences taken in at one reading, the reader's own words, and no detail the reader does not need where they
are. It never excuses a false sentence: a hard one is said more simply, or cut. No model's score stands in for
it: on 2026-09-25 two cold readers gave the owner's first and second choice the same mark, so the owner's read
decides. *owner, 2026-09-25: «Текст должен быть приятным для чтения. На самом деле, это критерий номер 1.
Приятный текст - продающий текст. В него легче погрузиться, с ним приятнее работать. Одним из свойств такого
текста является оформление»; «весь текст должно смотреть естетственно и оганично»; earlier the same day:
«Текст должен быть легким для чтения и понимания».*

### True within its world

Every statement holds in the world the text describes: the code, for documentation; the facts, for an essay;
for a story, the rules the story has set — a sword may talk where the world allows it. The writer does not
widen that world alone: a fact, a feature or a rule the world has not set up goes to the user as a question,
and so does a requirement of the user's that the world does not hold, because what appears from nowhere — a
feature the code lacks, a rescue the plot never prepared — breaks the reader's trust. How a claim is checked
against its world, and when a guarantee word holds: [truth.md](truth.md). *owner, 2026-09-10: «двадцать с
лишним мест, где текст утверждает о поведении кода то, чего код не делает»; 2026-09-26: «в рамках мира или
контекста … Их можно расширять, но тут требуется взаимодействие с пользователем … защищало бы от роялей в
кустах». measured, 2026-09-10 and 09-22; 2026-09-24: three of the six sentences a round of the maestro run
repaired came from the owner's own answers.*

## Advice

### Start from the context

**Know the text's world before its form.** What the thing is and what it resembles; who reads it, and in what
situation; what they need first; what would make them want it and choose it over what it resembles; the one
thought the text carries. The structure follows from these: a part is there because this reader needs it
there, not because texts of the kind have it. *owner, 2026-09-26: «Нужно понимать контекст, собирать его. Понимать, что это за инструмент,
целевая аудитория, какую мысль хочешь донести, приятность, продающий текст и понятная приятная документация».
measured, 2026-09-26: on the README of a disk-usage tool a bare agent's text beat ours, which had dropped the
demo, the tool's one-line pitch and its install routes under rules applied as requirements.*

**Look at the best texts of the kind.** Before inventing a structure, see what the most-used texts of the same
kind do; their notes are in [genres/](genres/), or a scout counts them. It spares the reader a shape they did
not expect. Leave it where the context calls for what the kind does not do. *owner, 2026-09-12: «не всегда
имеет смысл выдумывать структуру с нуля, всегда хорошо подглядеть у коллег».*

### The reader

**Every word carries weight for the reader who arrives here.** A sentence or a block earns its place by what it
gives that reader; nothing stays "just in case". *owner, 2026-09-10 and 09-11: «В ней не должно содержаться
нерелевантной информации и что-то просто на всякий случай»; «каждое слово … имеет вес … как в задаче о
рюкзаке».*

**Write for the reader's actual experience.** Do not explain what that reader already knows, and do not
assume they know what only the author knows. In documentation for developers that means their own editor,
their AI tool, what a command line is — and, the other way, the project's internals. *owner, 2026-09-24, on a
README that explained setup «Будто он впервый раз в жизни открыл для себя ии, vs code и прочее»; 2026-09-10:
«$TMPDIR - серьезно? Что это скажет человеку, который впервые сюда зашел».*

**A fact the reader already has, or cannot act on, is noise.** In documentation: a runtime or editor version
any reader of this audience has, `PATH`, credential files, internal paths, exit codes, protocol names. Keep a
prerequisite where a reader of this audience would otherwise fail and not know why. *owner, 2026-09-11:
«Когда говорят как установить codex никто не говорит, что нужна нода и path»; 2026-09-24: «Зависимость от
Node 20 и тд, тоже нелепа».*

**The reader's word for a thing, not the author's.** A name only the project uses makes the reader translate.
*owner, 2026-09-11, on "seat".*

### Winning the reader

For a text that introduces something and must win its reader — a README, a proposal, a page that sells —
rather than tell a story or document an interface.

**Say early what it is and what it is for.** The first lines name the thing and the job it does for the
reader, in the reader's words; the mission, not a definition. A comparison with what the reader already knows
often says both at once. *owner, 2026-09-10: «Вместо того, чтобы сказать самое важное - про его миссию, цель
или задачу … ты начинаешь перегружать терминами»; 2026-09-23: «Оно неотвечает на вопрос об задаче этого
плагина, его предназначении»; 2026-09-26, of the text they ranked first: «то что это du только написанное на
расте - это очень важная информация на самом деле с точки зрения понимания сути, так и маркетинга».*

**Then what it gives, as a short list.** What the thing gives the reader that its alternatives do not — a
capability and what it means for them — reads fastest as one bold-led item each. A quality any thing of its
kind could claim does not say why this one; a list of its parts, or a walk through steps a later part
repeats, sells less. *owner, 2026-09-24, of the README they ranked first: «отвечает что это за проект, и сразу
подчеркивает конкурентные преимущества … используя форматирвание список»; 2026-09-25: «почему в самое начало
ты ввел действия пользователя, а не то, что предоставляет проект. Тот же самый workflow мы описываем в quick
start. Возможно, нужно что-то среднее между этими двумя вариантами»; 2026-09-26, of highlights that said what
dust does, "Focused" and "Readable": «хайлайты - почему именно мы - не раскрыта». measured, 2026-09-25: in a
blind read, 21 of 37 readers faulted the other README's items for listing its parts, while the draft's items
walked through the commands its Quick start repeats.*

**Show what the reader will meet.** A demo, a screenshot or real output lets the reader see the thing before
they install it. *owner, 2026-09-26: «Понравилось, что сразу видится интерфейс благодаря демо, с чем
столкнешься». genre, 2026-09-26: visual proof in 7 of 8 READMEs of terminal tools.*

**The opening sells; it does not warn or define.** It may name the reader's problem that the thing solves, in
the reader's words — that is a reason to read on — but a warning about the thing itself, a protocol's name or
talk about the document itself makes the reader hesitate. *owner, 2026-09-11: «вводный блок призванный
продать, а не напугать»; 2026-09-23: «Оно начинается с вопроса. Оно привязывется к readme»; 2026-09-25:
«Правило можно поправить». measured, 2026-09-25: in a blind read of two openings, a reader called the other
README's problem line «the strongest selling line in either file», and the rules critic had cut the draft's
own under "no failure modes".*

### Where the reader acts

**Say what to do, not everything that is true.** Give the routes this reader will take, in the form that
runs; which routes those are is the context's question — one line for a plugin, every common package manager
for a tool that installs anywhere. A route few readers take gets its own place further on, or a link. *owner,
2026-09-24: «Getting started честен, но бессмысленен … нужно просто сказать, что нужно сделать»; 2026-09-23:
«крайне многословно идет описание секции install»; 2026-09-25: «нет необходимости грузить пользователя
техническими деталями. Можно просто не использовать мсп в быстром старте»; 2026-09-26: «dust это улитарная
утилита, которая должна ставится куда угодно и тебе не нужно было думать как именно».*

**Detail waits for the reader who wants it.** Spread through the opening, mechanism reads as a warning; where
a text has technical detail worth telling, gather it for the reader who came for it. A part kept for its own
sake — a How it works with one sentence in it — is a rudiment. *owner, 2026-09-11: «Если хочешь рассказать
про технические детали, то нужна отдельная секция из разряда "как это работает"»; 2026-09-25: «Нет
потребности прям все донести до пользователя, всю техническую подноготную, каждый технический камушек»;
2026-09-26: «How it works в 1 тоже какой-то рудимент».*

### Form

**Formatting serves the reading.** Headings for parts a reader looks for; a list for parallel items; a table
where rows differ, each row saying what tells it from the one beside it; a fenced block with a language for
anything to copy. Rows that say the same thing need no table. *owner, 2026-09-11: «удобно иметь их в
codeblock … с укзанием языка»; «про паритет думаю, нужна таблица»; 2026-09-24: «Оформление. В 2 оно все
равно уступает». measured, 2026-09-11: a table whose rows were identical was cut; 2026-09-25: a cold reader
could not tell two neighbouring rows of a table apart.*

### What seldom helps

**The project's own history.** Measured numbers, dated report lines, excerpts of the project's records, and
the story of how the text was made rarely help a reader decide. *owner, 2026-09-24: «What was measured … не
нужна readme … Ему главное результат»; 2026-09-11: «описываешь их с точки зрения наратива - почему ты их
создал».*

**A text bound to a version.** A text about something real describes it as it is now. *owner, 2026-09-24:
«REAMDE всегда должен соответствовать коду».*

**An invented example in a text about something real.** A fabricated path or command is water: a real one, or
none. A story invents by right. *measured, 2026-09-11.*

**A qualification as a fix.** A sentence that needs a caveat to be true says too much: say less, or link the
source. *owner, 2026-09-12; measured: five rounds of caveats raised regressions from one to ten.*
