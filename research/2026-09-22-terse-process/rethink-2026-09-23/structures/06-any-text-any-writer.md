# Structure 06 — lens: any text, any writer who is not a programmer

## Purpose statement, verbatim

Russian, as written:

> в моем понимании, главная миссия - цель плагина. Это оценка и улучшение текста (чтобы это ни значило).
> Документация, комментарии, проза, текст и даже код, и тд - не важно. Плагин итеративно через пайплайн и
> мультиагентность, храня множество правил, бестпрактис и быть способными их найти, оценивает текст,
> делает его лучше итеративно. Для этого есть пайплайн. Без признака нейрослопа, неся истинную ценность.

English rendering (the coordinator's; the Russian governs):

> As I understand it, the main mission is the plugin's goal: assessing and improving text, whatever that
> means. Documentation, comments, prose, text, even code — it does not matter which. Iteratively, through a
> pipeline and multi-agency, holding many rules and best practices and being able to find them, the plugin
> evaluates text and makes it better, iteratively. The pipeline exists for that. Without the marks of AI
> slop, carrying real value.

## The lens, in three lines

This reader's first need: see, before anything else, that "text" means what they write — prose, a
comment thread, a course, a policy — not code documentation, and that a Markdown file of theirs, not a
codebase, is what gets read.
My reading answers that by keeping every mechanism word (run, agent, folder) to the one clause that earns
trust and never a second, and by putting every command this reader will ever type into one block.
It leaves out what a programmer's lens would keep: exact CLI surface (flags, PATH, source-checkout
install, directory layout, retention/uninstall mechanics) and a multi-block walkthrough — this reader
never opens a terminal by choice.

## Sections, in order

### 1. Opening (no heading — the mission runs on under `# terse`)

- **Purpose:** say what the plugin is for and that "text" covers anything this reader writes, before any
  mechanism word appears.
- **Excludes:** the word "documentation" as the scope noun; any claim about how non-English text or a
  non-Markdown file is handled (the audit's own planted question found this unanswered — audit.md:953-964;
  synthesis E3).
- **Word budget:** 55
- **Device:** plain paragraph, 3–4 sentences, no list.
- **Rests on:** A01, A06 (synthesis.md:31,36 — purpose before mechanism, scope stated without a technical
  eligibility section); owner-readme-words.md:45 ("ты начинаешь перегружать терминами... вместо миссии"),
  :58 ("любой текст, любой комментарий, любой документ"); purpose.md:5-8; the Markdown-only scope fact
  placed here per terms.md:67 ("once, as the scope fact where the reader decides").

### 2. Skills (heading: "Skills")

- **Purpose:** let this reader see, in one glance, the three things they can ask for and what each hands
  back, without reading three paragraphs of mechanism.
- **Excludes:** the writer/judge/critic/lens internals of rewrite, and any standalone "rules" or
  "evidence" heading — folded here as one clause instead (A16 shares this section's retirement of the old
  prose descriptions rather than adding its own heading).
- **Word budget:** 95
- **Device:** table — Command · When to run it · What you get back (3 rows). Decided device, not a list.
- **Rests on:** A02 (synthesis.md:32 — table answers the owner's missing-command-table objection,
  owner-readme-words.md:142); A16 folded in (synthesis.md:46); table device per synthesis.md:89 ("only 1
  of 4 compact inventories is a table... the owner's explicit comparison need"); heading rename at
  terms.md:132.

### 3. Which to run first (no heading — sits directly under the Skills table)

- **Purpose:** tell this reader, who arrived unsure whether their document is even worth touching, which
  of the two starting points is theirs and what it leads to.
- **Excludes:** an ASCII/box/Mermaid diagram, and a second telling of the same route in prose (the owner's
  explicit objection to describing the pipeline twice).
- **Word budget:** 45
- **Device:** short two-item list (have a document vs. don't / shape feels wrong → each names its start),
  plus one trailing plain sentence on what starting one announces.
- **Rests on:** A20 (synthesis.md:50, list not diagram, purpose.md:24-26); audit.md:899-910 (Q3, weakly
  answered today — "which do I run first" needs a direct answer); A18 folded in here rather than given its
  own heading (synthesis.md:48 — the agent/model announcement belongs at the moment of running one, "new"
  placement by this lens, not synthesis's own Place).

### 4. Install (heading: "Install")

- **Purpose:** give this reader every command they will ever need to type, together, in the single gray
  box the whole document contains.
- **Excludes:** a platform/package-manager matrix (A07 does not apply — terse has one path); the
  Node/PATH prerequisite clause, left out rather than guessed — synthesis marks the installed requirement
  **unknown** (A08, synthesis.md:38), and this lens does not assert an unverified technical fact to a
  reader who could not check it anyway.
- **Word budget:** 50
- **Device:** one fenced `bash` block carrying marketplace-add, install, and — as this lens's own
  addition — an update line, so no second block appears later in the document; one lead sentence, one
  first-thing-to-try pointer as inline code (A03 folded here, not a separate Quick start heading/block).
- **Rests on:** A05 (synthesis.md:35, block device fixed at synthesis.md:91); owner-readme-words.md:105-106
  (explicit ask for a matching update step) — merging it into one block is this lens's own choice, marked
  "new": justified by the three-line reading's rule that every typed command lives in one place; A03
  (synthesis.md:33) for the post-install pointer, placed here per its own decided Place ("immediately
  after installation").

### 5. What it will and will not do to your text and your files (heading kept from terms.md:134)

- **Purpose:** answer, in the reader's own words, whether this shortens their writing and whether it can
  touch their files without asking.
- **Excludes:** run-directory location, retention-on-uninstall, and `ISSUES.md` mechanics as their own
  topic — folded to the one sentence that matters (drafts live outside the document until accepted) and no
  further, since this reader is not deciding where files are kept, only whether they are touched.
- **Word budget:** 85
- **Device:** one plain paragraph (the not-a-compressor fact) followed by a short list of three concrete
  boundaries, each independently quotable: not a compressor; keeps this reader's own voice rather than
  flattening it to generic AI text; does not touch a file without this reader's word.
- **Rests on:** A12 (synthesis.md:42, already present, non-compressor); A19 (synthesis.md:49, the refuted
  write-promise must be replaced with the verified one — audit.md:881-897, Q2, the control that does not
  hold today); the anti-slop bullet is "new" placement for the purpose's own words, owner-readme-words.md:83
  ("не просто находить ошибки"), purpose.md:8 ("без признака нейрослопа"); trust criteria from
  audit.md:54-56 ("a default that writes nothing").

### 6. What was measured (heading kept from terms.md:135)

- **Purpose:** give this reader one honestly sized number so they can calibrate trust without reading a
  statistics section.
- **Excludes:** the 2×5 standards bake-off, the four-pass breakdown, McNemar by name, any chart —
  everything synthesis E1 says is not established beyond one pilot.
- **Word budget:** 60
- **Device:** one plain paragraph plus one inline link to the fuller evidence file, rather than the
  exposition itself.
- **Rests on:** A04 (synthesis.md:34, linked detail pays for evidence without the limits); synthesis E1
  (synthesis.md:142 — no survey establishes human-benefit beyond answerability, state it bounded);
  audit.md:54-56 (what earns this reader's trust: every number with its size, the no-no-document-arm
  admission); plain-language rename at terms.md:116 (row 56, "one small trial; the gain could be chance").

## Cut entirely, and why

- **Licence** — A25 CONTRADICTS; owner-readme-words verdict on the rejected round: "the licence line is
  noise" (purpose.md:28).
- **How it works / a standalone Rules heading** — this lens's charter excludes mechanism exposition for a
  non-programmer; terms.md:140,142 keep it as an option for other lenses, folded out here entirely rather
  than deferred to a link, since this reader has no decision that needs it.
- **Where it writes, as its own heading** — collapses into section 5's one sentence; the fuller mechanics
  (folder location, purge on uninstall) serve a Dev reader this lens does not write for.
- **Installation matrix, product screenshot, TOC, Contributing** — A07, A10, A24 DO NOT TAKE; a
  Contributing section is out of scope for this document's task (synthesis.md:82).

## Total

390 words across 6 sections (4 headed: Skills, Install, What it will and will not do, What was measured;
2 unheaded: Opening, Which to run first). One command block in the whole document.
