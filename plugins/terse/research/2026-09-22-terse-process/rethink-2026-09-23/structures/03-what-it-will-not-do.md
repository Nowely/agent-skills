# Structure 03 — what it will not do (control before capability)

Lens: a reader who fears a tool that rewrites their text. The document is organised around control —
what it reads, what it writes, where, and when it asks — and the assurances for that reader come before
any capability is described.

## The owner's purpose statement, verbatim

Russian:

> в моем понимании, главная миссия - цель плагина. Это оценка и улучшение текста (чтобы это ни значило).
> Документация, комментарии, проза, текст и даже код, и тд - не важно. Плагин итеративно через пайплайн и
> мультиагентность, храня множество правил, бестпрактис и быть способными их найти, оценивает текст,
> делает его лучше итеративно. Для этого есть пайплайн. Без признака нейрослопа, неся истинную ценность.

English rendering:

> As I understand it, the main mission is the plugin's goal: assessing and improving text, whatever that
> means. Documentation, comments, prose, text, even code — it does not matter which. Iteratively, through a
> pipeline and multi-agency, holding many rules and best practices and being able to find them, the plugin
> evaluates text and makes it better, iteratively. The pipeline exists for that. Without the marks of AI
> slop, carrying real value.

## Reading

This reading takes the reader's first need as reassurance before commitment: before choosing a skill or
typing the install line, they need to know exactly what the plugin opens, what it writes on its own,
where, and the one thing that always waits for their word — their own words are "it rewrote everything
and made it worse," and that they "diff in the dark" (audit.md:38-39, 50-52).
It therefore promotes the file boundary and the text-preservation guarantees ahead of the skill-choice
table and Install, and gives each its own heading and device rather than the two closing sentences the
current draft spends on them.
It leaves out a longer benefit pitch, any early mechanism (rounds, ledger), and the evidence detail; a
benefit-first or choice-first reading would keep the sell or the skill table earlier than this one does,
and would not risk this section reading as a warning rather than a sell.

## Sections

| # | Section | Purpose | Excludes | Budget | Device | Rests on |
|---|---|---|---|---|---|---|
| 1 | `# terse` (title) | Name the product, nothing else. | Tagline, badge, subtitle. | 1 | plain heading | terms.md headings table, row 1 ("keep"). |
| 2 | (opening, no heading) | Say what it does and for what text, closing on the fact this reader checks first. | Install steps, skill names, "pipeline"/"agent"/"ledger", any hedge. | 55 | plain paragraph | purpose.md:5-9; synthesis A01/A06; audit.md:24-27 (the profile's own one-sentence gloss, which itself ends on the file boundary); O1/O3 in synthesis.md:11-13 ("the opening sells and does not warn"). |
| 3 | **Your files** | Before any skill is described, say which files it opens, what it writes on its own, where, and what always waits for the reader's word. | Install commands; agent/cost count (→ Quick start); content-preservation (→ What stays); the ledger mechanism (→ How it works). | 90 | table, 4 rows (Reads · Writes · Where · Needs your word) | audit.md Q2, 881-898 (named a control by the profile, "does not hold" — the current claim is refuted, C15/C16); synthesis A17, A19; terms.md heading-table row "Where it writes" ("title it … e.g. Your files — invented on purpose"). Placement ahead of Skills and Install is new to this lens: synthesis D.2 and A17 place this only before the first invocation, after purpose and skill choice; this reading moves it earlier because for this reader it outranks the choice of skill. |
| 4 | **What stays** | Say what a rewrite may not remove or weaken, against the fear that fixing one thing breaks another. | The write-location facts (→ Your files); the 6% figure (→ What was measured); the ledger mechanism (→ How it works). | 70 | list, 4 items | synthesis A12 (already present, reinforced); C27 (conditions/limits/warnings kept); audit.md Q5, 924-939, and Q6, 941-951; audit.md:34-39 ("each round of edits heals one thing and breaks another with nothing to say which"). |
| 5 | **Skills** | Match the reader's situation to one of three commands and say what each hands back. | Cost/agent detail (→ Quick start); the write boundary (already stated); the review mechanism (→ How it works). | 100 | table, 3 rows (Command · When to run it · What you get back) | synthesis A02; section C's table decision; D.1 (resolves table-vs-list for table); O5 in synthesis.md:15 (owner-readme-words:142, no table of skill commands). |
| 6 | (Workflow, no heading, under Skills) | Show the two orders the three skills chain in, including the return to audit. | A diagram, box/arrow art, a restated prose paragraph. | 25 | list, two arrow-joined lines | synthesis A20; section C's "Pipeline" device decision; terms.md heading-table row "route list (A20)" — chosen option "or no heading beside the Skills table." |
| 7 | **Install** | Give one copyable path in the environment the reader already has. | The update command (own section); a platform matrix; prose restating the commands. | 45 | code block (bash, 2 commands) + one prerequisite line | synthesis A05; A08 (prerequisite correction); O4 in synthesis.md:14 (owner-readme-words:130-136, language-tagged, full `claude plugin` form). |
| 8 | **Update** | Give the install command's twin so an already-installed reader is not left guessing. | Version/commit-pinning detail. | 20 | code block (bash, 1 command) | O4 (owner-readme-words:105-106, "не хватает такого же блока на обновление"); terms.md heading-table row 3 ("its twin … is Update"). |
| 9 | **Quick start** | Name the one safe first command, show a real excerpt of what it returns, and say what starts before it does. | The three-way skill comparison (already given); the file-write boundary (already given). | 90 | code block (command) + short excerpt | synthesis A03; A09 (real excerpt, not a fabricated transform); A18 ("before fan-out"); audit.md Q3, 899-910. |
| 10 | **How it works** | For a reader who wants to verify rather than take it on word, say what checks a round before hand-over and where the rules come from. | A rule catalogue; a configuration reference; any claim of a universal standard. | 110 | plain paragraph | audit.md:45-48 ("why this instead") and :54-56 ("what earns their trust"); synthesis A16; O3 in synthesis.md:13 (owner-readme-words:104, a separate "how it works" section for technical detail); purpose.md:7 ("быть способными их найти"); terms.md heading-table row "How it works" ("no 'Rules' heading; fold into How it works"). |
| 11 | **What was measured** | Let a reader who wants evidence reach it, sized honestly, without the full exposition here. | The full statistical write-up; the 2×5 bake-off detail; any figure without its pilot caveat. | 80 | list, 2–3 items + one link | synthesis A04; O6 in synthesis.md:16; terms.md row 56 (pilot/McNemar rename). |

## Total

686 words (1 + 55 + 90 + 70 + 100 + 25 + 45 + 20 + 90 + 110 + 80), against the current README's 933. The
cut is mostly What was measured (-200 against current:62-86) and Skills+Workflow replacing three prose
descriptions and the diagram (-295 against current:7-37); the growth is Your files+What stays running
above synthesis's own minimum estimate for that pot (+~90 over A19's ~30-word allowance, spent
deliberately because this lens makes the file boundary the reader's first question) and a new How it
works section (+~70 net new, an owner-requested section the current draft does not have).
