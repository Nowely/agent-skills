# Form of three READMEs: P, Q, R (sharpdeveye/maestro at 00f9115)

|  | P | Q | R |
|---|---|---|---|
| Visible words | 2,104 | 1,001 | 1,175 |
| Water, words saved | 5 (0.2 %) | 87 (8.7 %) | 48 (4.1 %) |
| Facts in 3 or more sections | 12 | 11 | 7 |
| Contradictions | 0 | 2 | 0 |

No ranking, no verdict.

**Recognition.** I don't recognise any of the three as a text I have read. Q's opening block and section plan follow the README of pbakaus/impeccable as I remember it: "Without guidance, you get the same predictable mistakes: …", "… fights that … with:", "Curated anti-patterns that explicitly tell the AI what NOT to do", "The skill includes explicit guidance on what to avoid:", "# Full workflow: audit → … → polish", the Supported Tools table and the closing "Created by …". This comes from memory and was not checked (hypothesis). P L219 names "impeccable", "frontend-design" and "pbakaus" in its originality guard. Q's own text (version badge 2.0.0, "What's New in v2", "Created by sharpdeveye") reads like a maintainer's README. That is an inference from the text, not recognition.

**How it was measured.** Only the three texts and `genre-order.md` were read. Scripts are in `$TMPDIR/form-ruler-work/`:
- `measure.py` gives the words, headings and devices.
- `persection.py` gives the words per section.
- `verify.py` checks that every quoted water phrase, fact snippet and contradiction quote occurs on its stated line, maps each line to its section, and computes the words saved.
- `glosses.py` compares the command tables.

Per-line visible text is in `visible-{P,Q,R}.txt`.

- *Visible words.* Removed: fence lines, table-rule lines, HTML tags (`p img a div picture source br`), image and link targets, and heading and list markers. The bracket text of links and markdown images stays, so markdown alt text counts, while HTML `<img alt>` goes with its tag. Code inside fences stays. The count is the whitespace tokens that contain a letter or digit. A variant also drops markdown image alt text.
- *Section.* The block under the innermost heading. "(opening)" is everything before the first heading.
- *Water words* are counted the same way. Saved = phrase − shorter form.

## 1. Words and headings

| | P | Q | R |
|---|---|---|---|
| `wc -w` (raw) | 2,404 | 1,478 | 1,379 |
| Tokens after the removals (any) | 2,316 | 1,364 | 1,345 |
| **Visible words** (tokens with a letter or digit) | **2,104** | **1,001** | **1,175** |
| Visible, markdown image alt text also dropped | 2,104 | 989 | 1,165 |
| Lines | 250 | 346 | 152 |

The gap between the last two rows is badge and banner alt text. It is 12 words in Q (8 markdown badges) and 10 in R (banner plus 3 badges). P's badges are HTML, so its alt text is already out of the visible count.

**Headings in order** (line numbers):
- **P** (16 headings: 1 H1, 8 H2, 7 H3): H1 Maestro (12) · H2 Quick start (24) · H2 Commands (42) · H3 Analysis (44) · H3 Fix and improve (52) · H3 Enhancement (62) · H3 Utility (76) · H3 The core skill (88) · H2 Project files (92) · H2 MCP server (105) · H3 Waves (160) · H2 VS Code extension (172) · H3 Files the extension writes (186) · H2 Repository layout (195) · H2 Development (208) · H2 License (246)
- **Q** (24 headings: no H1, 12 H2, 12 H3): H2 What is Maestro? (28) · H2 Quick Start (43) · H3 Combine Commands (66) · H2 The Skill: agent-workflow (75) · H2 25 Commands (91) · H3 Analysis — read-only, generate reports (93) · H3 Fix & Improve — make targeted changes (101) · H3 Enhancement — add capabilities (111) · H3 Utility (125) · H2 What's New in v2 (139) · H3 Memory Layer (141) · H3 Audit Trail (158) · H3 Cost Estimation (166) · H3 `/reflect` — Effectiveness Scorecard (170) · H2 Anti-Patterns ("Workflow Slop") (187) · H2 Supported Tools (201) · H2 MCP Server (218) · H3 Local (stdio) (222) · H3 Remote (HTTP) (237) · H3 What the MCP Server Exposes (247) · H2 Manual Installation (257) · H2 Project Structure (271) · H2 Contributing (327) · H2 License (338)
- **R** (11 headings: 1 H1, 6 H2, 4 H3): H1 Maestro (5) · H2 Getting started (15) · H3 Skill files (25) · H3 VS Code extension (48) · H3 MCP server (68) · H3 First run (89) · H2 Commands (96) · H2 Memory across sessions (125) · H2 Documentation (137) · H2 Support and contributing (144) · H2 License (150)

**Visible words per top-level section** (`persection.py`; the sums match the totals):
- P: H1 block 178 · Quick start 183 · Commands 471 · Project files 130 · MCP server 350 · VS Code extension 470 · Repository layout 70 · Development 237 · License with the closing link row 15
- Q: opening 34 · What is Maestro? 112 · Quick Start 65 · The Skill 58 · 25 Commands 199 · What's New in v2 132 · Anti-Patterns 66 · Supported Tools 31 · MCP Server 99 · Manual Installation 35 · Project Structure 121 · Contributing 42 · License with the credit line 7
- R: before H1 10 · H1 block 105 · Getting started 656 · Commands 188 · Memory across sessions 126 · Documentation 30 · Support and contributing 56 · License 4

## 2. Devices (`measure.py`)

| | P | Q | R |
|---|---|---|---|
| Tables (body rows) | 9, with 44 rows: forms 3 · commands 3/5/9/7 · project files 4 · MCP tools 8 · waves 3 · settings 2 | 7, with 44 rows: references 7 · commands 3/5/9/7 · supported tools 10 · MCP exposes 3 | 2, with 27 rows: routes 3 (4 columns) · commands 24 (one table, group column) |
| Fenced blocks | 9: bash 6, json 2, text 1 | 11: text 6, bash 3, json 2 | 4: text 2, bash 1, json 1 |
| Bullet lists (items) | 3 (9): L145–147 ×3, L176–179 ×4, L190–191 ×2 | 4 (20): L34–39 ×6, L154–156 ×3, L191–197 ×7, L331–334 ×4 | 2 (8): L54–57 ×4, L139–142 ×4 |
| Numbered lists (items) | 1 (3): L26–36, with a fence and a paragraph inside item 1 | 0 | 2 (5): L93–94 ×2, L129–131 ×3 |
| Badges | 4, HTML (L6–9): MCP server/npm, VS Code, Open VSX, MIT | 8, markdown (L11–18): license, version 2.0.0, npm, VS Code, MCP, skills 25, commands 25, providers 10 | 3, markdown (L3): VS Code Marketplace, Open VSX, npm |
| Other images | 1: banner.png, HTML `<img>` (L2) | 1: banner.svg, HTML `<picture>` with two identical `<source>` (L3–7) | 1: banner.png, markdown (L1) |
| Links: in-page / relative / external | 20: 2 / 9 / 9 (4 wrap badges) | 58: 8 / 35 / 15 (8 wrap badges; 24 go to command SKILL.md files, 7 to reference files) | 47: 11 / 29 / 7 (3 wrap badges; 24 go to command SKILL.md files) |
| In-page anchors resolving to a heading | 2 of 2 | 8 of 8 | 11 of 11 |
| Other | 2 centred HTML `<p>` blocks; closing "·" link row (L250); 7 bold-led items | centred HTML `<div>` (L1–24, L342–346); 12 horizontal rules; "·" counts line (L20) and nav row (L22); 🆕 ×9 (3 in tables, 6 in the tree); 2 file trees and 1 ASCII box in text fences; 6 bold-led items | "·" nav row (L13) and inline folder list (L37); 9 bold-led items plus a bold label line (L52); no HTML, no rules |

## 3. Genre order (`genre-order.md`, place by place)

A peer section is an H2. The G1 figures quoted come from the survey table.

| Place | P | Q | R |
|---|---|---|---|
| **Opening**: identity; optional counts, badges, scope notes | **Follows.** Banner → 4 badges → H1 → identity paragraph with counts (L14: 24 commands, core skill, 7 references). | **Follows in content, departs in order.** Banner (the name appears only in the image) → 8 badges → counts line (L20) → nav row (L22) → the identity comes under its own first H2 "What is Maestro?". That section opens with a problem statement (L30), not a definition. There is no text title. The exemplars put identity right after the title or badges, before any TOC. | **Follows.** Banner → 3 badges → H1 → tagline (L7) → identity (L9) → counts (L11) → nav row (L13). This is Superpowers' title → identity → TOC. |
| **Before setup**: rationale or selection; table, bold-led comparison, TOC or note | **Follows.** A 3-row forms table (L18–22) comes before Quick start. No TOC. | **Follows.** A problem statement and 6 bold-led bullets (L30–39); the nav row serves as TOC. | **Follows.** Nav row (L13). A route chooser opens the setup H2: a paragraph with a default (L17), then a 3-row Route/Works in/Needs/Writes table (L19–23). This matches Spec Kit's "3 table rows → Get started". |
| **Setup**: command or config blocks; subdivisions by harness, method or environment. G1: 6 of 7 put it within the first four peer sections. | **Follows in position, departs in subdivision.** Quick start is H2 #1, with numbered steps and 1 bash fence. It covers only the skill-file route. MCP setup (per-client configs, HTTP) and the extension install are H2 #4 and #5, after Commands and Project files. A pointer at L40 leads to them. | **Follows in position, departs in subdivision.** Quick Start is H2 #2, with 1 bash and 3 text fences. Supported Tools (#7), MCP Server (#8, with H3 Local/Remote) and Manual Installation (#9) come after the inventory and "What's New in v2". Quick Start has no link to any of them. | **Follows.** Getting started is H2 #1, with one H3 per route (Skill files, VS Code extension, MCP server), each with its own block. This matches Superpowers' per-harness H3s. |
| **After setup**: first workflow, then inventory or feature detail | **Follows.** The first workflow is in Quick start steps 2–3 and L38. Then Commands (4 grouped tables plus the core skill), then Project files (a table). The MCP and VS Code sections that follow mix setup with reference (see Setup). | **Follows, then departs.** Usage and Combine Commands → The Skill (reference table) → 25 Commands (4 grouped tables). Then "What's New in v2": release notes in 4 H3s, 132 words, a block with no place in the genre table. Then Anti-Patterns, then setup material (see Setup). | **Follows.** First run (numbered, 2 stages) → Commands (one 24-row table) → Memory across sessions (numbered, 3 stages). |
| **Tail**: documentation, contributors, terms; link lists and brief paragraphs; sometimes promotion. G1: 4 of 7 have a docs or map section, 5 of 7 a contributing heading, 4 of 7 a license heading. | **Follows in function, departs in size and headings.** Repository layout (a map, 70 words) → Development (237 words, 3 bash fences) → License → a closing row of 4 links. There is no Contributing or Documentation heading. | **Follows in part.** Project Structure (a map: 121 words, a 49-line tree) → Contributing (4 bullets) → License (1 line) → credit line "Created by". There is no documentation link list. | **Follows.** Documentation (4-link list) → Support and contributing (2 short paragraphs) → License (1 line). This is Spec Kit's Documentation → … → Support and contributing → license. |
| Vendor flow | Not applied: the table calls it "not a README order recommendation". | Not applied. | Not applied. |

## 4. Water (`verify.py`: every phrase found on its line)

What counts as water:
- **Marketing**: evaluative or promotional words with no checkable content.
- **Restatement**: a phrase that repeats what its own sentence, list item, table cell or paragraph already says. Repetition across a heading belongs to §5.
- **Misplaced detail**: information that bears on no action at the place where it stands.
- **Never counted**: a condition, limit or warning. That is anything saying what is required, what fails, what is written or lost, or what is approximate.

**P: 5 words**

| L | Kind | Phrase | Shorter | Saved |
|---|---|---|---|---|
| 162 | restatement | "in stages, one phase at a time, with" | "in stages, with" | 5 |

**Q: 87 words**

| L | Kind | Phrase | Shorter | Saved |
|---|---|---|---|---|
| 30 | marketing | "AI agents are only as good as the workflows they operate in." | cut | 12 |
| 32 | marketing | "Maestro fights that pattern with:" | "Maestro provides:" | 3 |
| 34 | marketing | "A comprehensive **agent-workflow** skill" | "An **agent-workflow** skill" | 1 |
| 37 | marketing | "Curated **anti-patterns** that explicitly tell" | "**Anti-patterns** that tell" | 2 |
| 38 | marketing | "that ensures every command has project-specific awareness" | "that every command reads" | 3 |
| 39 | restatement | "— no dead ends" (after "Every command recommends a next step") | cut | 3 |
| 77 | marketing | "A comprehensive workflow design skill" | "A workflow design skill" | 1 |
| 97 | marketing | "Systematic workflow quality audit" | "Workflow quality audit" | 1 |
| 98 | marketing | "Holistic review of workflow" | "Review of workflow" | 1 |
| 106 | restatement | "Remove unnecessary complexity, flatten over-engineering" | "Remove unnecessary complexity" | 2 |
| 109 | marketing | "Activate maximum precision mode — zero mistakes allowed" | "Activate precision mode" | 4 |
| 115 | marketing | "Boost capabilities with better tools and context" | "Better tools and context" | 3 |
| 118 | restatement | "Optimize for speed, reduce latency and cost" | "Reduce latency and cost" | 3 |
| 119 | marketing | "Build effective tool chains" | "Build tool chains" | 1 |
| 122 | restatement | "Reduce over-engineering, simplify overbuilt workflows" | "Reduce over-engineering" | 3 |
| 123 | marketing | "Push past conventional limits — advanced techniques" | "Advanced techniques" | 4 |
| 134 | restatement | "Save a session summary — persist what happened" | "Save a session summary" | 3 |
| 189 | marketing | "includes explicit guidance" | "includes guidance" | 1 |
| 220 | restatement | "— no file copying required" (after "instead of static skill files") | cut | 4 |
| 278–301 | misplaced detail | the tree's 24 command folders with their group comments and 🆕 marks (39 words), repeating the command tables | "one folder per skill, named after it" on L275 | 32 |

**R: 48 words**

| L | Kind | Phrase | Shorter | Saved |
|---|---|---|---|---|
| 7 | marketing | tagline "Workflow fluency for AI coding agents." (L9 says what Maestro is) | cut | 6 |
| 50 | restatement | ", the open registry VS Code forks install from" (after "Cursor, Windsurf and Antigravity get it from Open VSX") | cut | 8 |
| 87 | misplaced detail | "See First run for what these two give you." (the next line is the First run heading) | cut | 9 |
| 100 | marketing | "Systematic workflow quality audit" | "Workflow quality audit" | 1 |
| 101 | marketing | "Holistic review of workflow" | "Review of workflow" | 1 |
| 104 | restatement | "Remove unnecessary complexity, flatten over-engineering" | "Remove unnecessary complexity" | 2 |
| 107 | marketing | "Activate maximum precision mode — zero mistakes allowed" | "Activate precision mode" | 4 |
| 108 | marketing | "Boost capabilities with better tools and context" | "Better tools and context" | 3 |
| 109 | marketing | "Build effective tool chains" | "Build tool chains" | 1 |
| 114 | restatement | "Optimize for speed, reduce latency and cost" | "Reduce latency and cost" | 3 |
| 115 | marketing | "Push past conventional limits — advanced techniques" | "Advanced techniques" | 4 |
| 116 | restatement | "Reduce over-engineering, simplify overbuilt workflows" | "Reduce over-engineering" | 3 |
| 139 | marketing | the website entry's gloss "Interactive showcase and documentation" | "Documentation" | 3 |

18 of R's 24 command glosses are word for word Q's, apart from the 🆕 marks (`glosses.py`). That is why nine table items recur in both texts.

**Checked, not counted:**
- **P**
  - L103: the cost mechanism ("characters ÷ 3.7", "$2 … $8 per million") is a limit on /reflect's costs.
  - L193 repeats L178's zero-defect file writes. They are warnings, and they carry the new ones about file creation and removal.
  - L141 "without `--port` the port is 3001" adds the default port.
- **Q**
  - L30's second sentence stays: its list names what Maestro targets.
  - L160 repeats L149 across a heading.
  - L154, L155 and L168 are conditions or limits.
  - The JSON sample (L162–164) and the scorecard (L174–183) show the output.
- **R**
  - L85 "it installs none of them into your project" repeats the L23 table cell across two headings. It appears in 2 sections, which is below §5's threshold.
  - L127 "These are your own sessions, with your coding agent" tells the reader's sessions apart from the state the MCP server holds.
  - L21/L33 (skills-lock.json), L22/L54–57 (what the extension writes) and L148 ("installs into no other project") are warnings.
  - L46 and L66 "See First run …" point past the sections in between.

## 5. Duplication and contradiction (`verify.py`)

A fact is one claim. The same claim in other words counts; a bare mention of a name does not. Sections are innermost headings.

**P: 12 facts in 3 or more sections**
1. 25 skills: Maestro (L20) · Files the extension writes (L190) · Repository layout (L198)
2. Seven reference documents: Maestro (L14) · The core skill (L90, all seven named) · MCP server (L146) · Repository layout (L199)
3. /teach-maestro writes `.maestro.md`: Quick start (L34) · Utility (L80) · Project files (L98)
4. Every command reads the context file first: Quick start (L34) · The core skill (L90) · Project files (L98)
5. /capture ends a session and /recap resumes it: Quick start (L38) · Utility (L85–86) · Project files (L101)
6. Maestro keeps a decision log and an audit log: Maestro (L21) · Project files (L99–100) · MCP server (L156, 158) · Repository layout (L203)
7. Cost of runs is estimated or reported: Analysis (L50) · Project files (L103) · MCP server (L158) · Repository layout (L203)
8. Commands run as staged waves: Maestro (L21) · MCP server (L155) · Waves (L162) · VS Code extension (L177)
9. The MCP server is the npm package `maestro-workflow-mcp`: (opening) badge (L6) · Maestro (L21) · Repository layout (L201) · Development (L244)
10. The extension is on the VS Code Marketplace and Open VSX: (opening) badges (L7–8) · VS Code extension (L174) · Development (L244)
11. Only the context-file sections that match the command and active file are sent: MCP server (L152–153) · VS Code extension (L177) · Repository layout (L203, "context slicing")
12. `source/skills/` is the one source of every form: Maestro (L16) · Repository layout (L198) · Development (L210)

**Q: 11 facts in 3 or more sections**
1. 25 commands: (opening) L20 · What is Maestro? (L35) · 25 Commands (L91) · What the MCP Server Exposes (L251) · Project Structure (L315)
2. 7 domain references: (opening) L20 · What is Maestro? (L34) · The Skill (L77) · What the MCP Server Exposes (L253) · Project Structure (L276)
3. Project context lives in `.maestro.md` or `.maestro/context.md`: What is Maestro? (L38) · Utility (L133) · Memory Layer (L147, 154)
4. Session memory survives across sessions (/capture, /recap): (opening) L20 · What is Maestro? (L36) · Utility (L134–135) · Memory Layer (L143) · Project Structure (L300–301)
5. Every command invocation is logged (audit trail): (opening) L20 · What is Maestro? (L36) · Memory Layer (L149) · Audit Trail (L160) · Project Structure (L307)
6. Cost is estimated per command: Memory Layer (L149) · Audit Trail (L160) · Cost Estimation (L168) · /reflect Scorecard (L181) · Project Structure (L308)
7. /reflect shows which skills work and which fail: Analysis (L99) · /reflect Scorecard (L172) · Project Structure (L280)
8. /diagnose finds issues ("audit"): Quick Start (L52) · Combine Commands (L69) · Analysis (L97)
9. /fortify adds error handling ("harden"): Quick Start (L54) · Combine Commands (L70) · Fix & Improve (L108)
10. /refine is the final quality pass ("polish"): Quick Start (L55) · Combine Commands (L69) · Fix & Improve (L105)
11. /reflect, /capture and /recap are new in v2 (🆕): Analysis (L99) · Utility (L134–135) · /reflect Scorecard, under What's New in v2 (L170) · Project Structure (L280, 300–301)

**R: 7 facts in 3 or more sections**
1. The supported agents are Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi and Antigravity: Maestro (L9) · Getting started (L21) · Skill files (L37)
2. There are ten skills folders: Getting started (L22) · Skill files (L37, listed) · VS Code extension (L54) · Support and contributing (L148)
3. The first run is /teach-maestro, then /diagnose: Skill files (L42–43) · VS Code extension (L62–63) · MCP server (L87) · First run (L93–94)
4. /teach-maestro generates `.maestro.md`: VS Code extension (L59, palette label) · First run (L93) · Commands (L117)
5. /diagnose is a workflow quality audit: VS Code extension (L59, palette label) · First run (L94) · Commands (L100)
6. A decision log and a command log (`audit.jsonl`) live in `.maestro/`: Getting started (L22) · VS Code extension (L57) · Memory across sessions (L129, 133)
7. Sessions carry into the next one (/capture, /recap): Maestro (L9) · Commands (L122–123) · Memory across sessions (L129–130)

**Contradictions**
- **P: 0. R: 0.**
- **Q: 2.**
  1. The command count (proven by count).
     - L20 says "1 core skill · 25 commands · 7 domain references · memory layer · audit trail". L35 says "**25 commands**" and the L91 heading is "25 Commands".
     - L275 says "source/skills/ # 25 source skill definitions". The tree under it lists 25 folders: `agent-workflow/` ("Core skill + 7 reference files", L276) and 24 command folders (L278–301).
     - One core skill plus 25 commands would need 26 definitions. The four tables under "25 Commands" list 3 + 5 + 9 + 7 = 24 commands.
  2. When `.maestro/` exists (holds if "every" is read as written).
     - L155 says "**Opt-in** — `.maestro/` is created only when you run `/capture` or use the extension".
     - L160 says "Every command invocation is logged with duration, token usage, and estimated cost:". The log is `audit.jsonl` inside `.maestro/` (L146, L149 "every command invocation with cost + duration").
     - Take a command run from the skill files, without the extension, before any /capture. By L160 it must be logged into `.maestro/audit.jsonl`, but by L155 that folder does not exist yet.

**Checked, not counted:**
- P L34 "sends you to `/teach-maestro` if it is missing" against L90 "or else ask for the model, task, and priorities": a command can do both.
- Q L147 "(replaces .maestro.md)" against L154 "`.maestro.md` users change nothing": both hold if the old file is still read.
- R L91 "Every command needs `.maestro.md` in place first — except this one." against L93 "if `.maestro/context.md` already exists, that is read first instead": L93's "instead" describes /teach-maestro's own run, so the two do not clash.
