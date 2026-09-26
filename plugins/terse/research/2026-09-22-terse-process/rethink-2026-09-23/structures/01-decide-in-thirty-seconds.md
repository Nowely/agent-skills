# Decide in thirty seconds

> в моем понимании, главная миссия - цель плагина. Это оценка и улучшение текста (чтобы это ни значило).
> Документация, комментарии, проза, текст и даже код, и тд - не важно. Плагин итеративно через пайплайн и
> мультиагентность, храня множество правил, бестпрактис и быть способными их найти, оценивает текст,
> делает его лучше итеративно. Для этого есть пайплайн. Без признака нейрослопа, неся истинную ценность.

> As I understand it, the main mission is the plugin's goal: assessing and improving text, whatever that
> means. Documentation, comments, prose, text, even code — it does not matter which. Iteratively, through a
> pipeline and multi-agency, holding many rules and best practices and being able to find them, the plugin
> evaluates text and makes it better, iteratively. The pipeline exists for that. Without the marks of AI
> slop, carrying real value.

- First need: the first screen alone must let a reader decide whether this is for them — what it is, what happens to their text, why they'd want it — before anything else earns space.
- Order after that follows the decision itself, not the mechanism: choose, install, learn the boundary, try it, learn the fuller boundary, then mechanism and evidence for whoever keeps reading.
- Left out: mechanism, evidence, and comparison claims above that boundary — a trust-first reading would put "What was measured" near the top, a mechanism-first reading would open with the pipeline; both cost the 30-second reader more than they pay back.

## Sections

| # | Section | Purpose (one sentence) | Excludes | Budget | Device | Rests on |
|---|---|---|---|---|---|---|
| 1 | `# terse` | Name the plugin. | tagline, badges, version string | 1 word | bare H1 | terms.md heading table, `# terse` row (H1 naming the product in 9/9 G) |
| 2 | *(no heading — opening paragraph)* | Name the mission for any text, give one concrete reason to want it, end on the files boundary in one compressed clause. | skill names/commands; install steps; pipeline order; any number or date; terms like run/round/skeleton; rival-tool comparison; dependency/runtime reassurance (A13); a claim that every language or format is verified (A06, open item E3) | 55 words | one paragraph, no heading, no list | A01 (TAKE w/ CHANGE), A06 (TAKE w/ CHANGE); O1/O2 (owner-readme-words.md:45,58,83,86); purpose.md:5-9; reader profile "what brings them here" (audit.md:34-39); terms.md heading table — opening takes no heading |
| 3 | `## Skills` | Show the three things a reader can run, when each applies, what each hands back. | mechanism inside each skill (writers, judges, critics, rounds, ledger); agent count/cost; output excerpts; the route back to audit | 80 words | 3-row table — Command · When to run it · What you get back | A02 (TAKE); O5 (owner-readme-words.md:142); synthesis section C, "Skills — a three-row comparison table"; terms.md heading table, `## What each one does` → Skills |
| 4 | `## Install` | Give the one copyable install path, in-app and shell forms, plus any verified prerequisite. | platform/package-manager matrix (A07); source-checkout detail; the two commands repeated in prose; the current/rejected prerequisite wording, unverified and disputed (A08); commit-pinned install instructions (open item E5) | 20 words | one `bash`-fenced block, two lines, + room for one short prerequisite clause once confirmed | A05 (TAKE w/ CHANGE), A08 (TAKE w/ CHANGE, content pending verification); O4 (owner-readme-words.md:130,136); terms.md heading table, `## Install` |
| 5 | `## Update` | Answer the update question the owner named as missing. | version pinning; changelog; commit hashes | 10 words | one line, one command | owner-readme-words.md:105-106; synthesis open item E5; terms.md heading table, Install's "twin" |
| 6 | `## Your files` | State what gets written to the reader's repository, when their word is required, and that every skill announces its agents/model and waits — before anything runs. | retention/uninstall mechanics; the exact run-directory path; the code-defect→ISSUES.md flow's detail; a spending ceiling (open item E6, none exists) | 60 words | 2-3 plain sentences, no table | A17, A18, A19 (all TAKE w/ CHANGE); audit Q2 (audit.md:881-897 — current wording does not hold); heading is **new** — terms.md calls "Your files" invented on purpose, no genre convention exists for this function |
| 7 | `## Quick start` | Give the exact first command (the audit path) and a short real excerpt of what comes back; one clause for the rethink branch. | the other two skills' commands (already in Skills); round/ledger/critic mechanics; a fabricated or idealized example | 55 words | one short paragraph + one small authentic-excerpt fence (`text`, not shell) | A03 (TAKE), A09 (TAKE w/ CHANGE); audit Q1 (audit.md:867-879), Q3 (audit.md:899-910); terms.md heading table, "first run" → Quick start |
| 8 | `## What it will and will not do to your text` | Set the compression/preservation expectation the name invites doubt about, with only confirmed facts. | the two unconfirmed "if your text is long…" predictions (C25/C26); the overstated "will not touch" absolute (C27 — needs correcting, not repeating); measurement methodology | 75 words | 2 short plain paragraphs, current prose device kept | A12 (ALREADY PRESENT); audit Q6 (audit.md:941-951); terms.md heading table — keep, "departure defended" |
| 9 | `## How it works` | Show the two routes between the three skills once, and name what a judgment rests on. | critic/lens taxonomy; ledger/ratchet internals; any boxed, ASCII, or Mermaid diagram; re-describing each skill | 55 words | one short two-route list (plain arrows) + one sentence on the rule/evidence source | A20, A16 (both TAKE w/ CHANGE); purpose.md:24-28 (owner's rejected-round verdict); owner-readme-words.md:104; terms.md heading table, "How it works" — rules and evidence folded in |
| 10 | `## What was measured` | Give the evidence for the mission claim at its real size, linked rather than expanded. | a claim of a "rate" rather than a pilot; any number without its date and sample size; the full experimental narrative | 100 words | short paragraph/list (2-3 sized facts) + link to `references/prior-art.md` | A04 (TAKE); O6; audit.md:54-56 ("every number with its size, including *p* = 0.25…") |
| — | *(whole page)* | — a constraint, not a section | badges, images, testimonials, a table of contents, a component/metadata-count inventory, a file-layout or schema section, commented command blocks, a standalone Licence section | 0 words | n/a | A11, A15, A21, A22, A23, A24 (DO NOT TAKE / ALREADY PRESENT); A25 (CONTRADICTS — licence dropped entirely); synthesis section C, "Decoration/navigation" |

## Total

511 words (1 + 55 + 80 + 20 + 10 + 60 + 55 + 75 + 55 + 100), across the title and nine headed/unheaded sections; the whole-page row carries no budget of its own.
