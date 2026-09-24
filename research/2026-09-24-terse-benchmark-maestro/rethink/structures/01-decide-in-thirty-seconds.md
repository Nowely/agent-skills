# Decide in thirty seconds

This reading takes the reader's first need as a fit-and-value verdict — is Maestro worth a closer look — reached inside the first visible screen, before any route, command, or folder name.
It spends the larger share of the opening's budget on that verdict (a value clause beyond the bare tagline), and keeps the route chooser and the command table as terse lookups rather than persuasive prose.
What it leaves out of the first screen, that an install-first reading would keep there: the ten provider-folder names and per-tool compatibility, held back for Getting started, where the choice is actionable.

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).
>
> — purpose.md §1

D-codes cite `survey/synthesis.md`'s Merged-decisions table. `purpose:` tags cite purpose.md §1: its four bullets in order (fit / route / first-run / table), then its two closing sentences (links / contrib).

## Sections, in order

| # | Section | Purpose | Excludes | Budget | Device | Sub-blocks (mark) | Rests on |
|---|---|---|---|---|---|---|---|
| 1 | Opening: identity *(no heading)* | Let the reader judge what Maestro is, what it does, and whether it fits their problem, inside the first screen. | routes; folders; commands; install syntax | 120w | paragraph, under a heading | banner+badges (images, 0w) · title+tagline (H1, 10w) · count line (bold lead-in, 20w — wshobson precedent) · fit/value paragraph (90w) | D01, D02; purpose:fit; answers-01 must-say 1–2; answers-02 §9 |
| 2 | Choose your route | Let an uncommitted reader match their situation to one of the three delivery routes at a glance. | commands; write-effects; folder names | 90w | table (3 rows) | none — genre leaves this table unsplit (spec-kit) | D03; purpose:route; s1.md genre order (spec-kit) |
| 3 | Getting started | Make each of the three routes actionable: exact command, prerequisite, effect. | MCP tool/resource list; extension UI names; HTTP detail beyond a link | 340w | 3×H3, fence + paragraph (+list) | "Skill files" H3 (90w) · "VS Code extension" H3 (150w, +4-item write-effects list) · "MCP server" H3 (90w, +wave-lifetime note) — each marked by its own heading | D04, D05, D26, D28; purpose:route; answers-01 §5.3/5.6/5.7; answers-02 §1/8/11a/11d |
| 4 | First project: teach, then diagnose *(no heading, closes Getting started)* | Leave every reader, whichever route they took, with one completed action and a visible result. | MCP prompt-picker UI detail; a third command | 90w | numbered list (2 steps) | none | D06; purpose:first-run; answers-01 §5.4; answers-02 §11b–c |
| 5 | Session memory | Show the capture/recap/reflect loop that carries a project's history to the next session. | decisions.jsonl/audit.jsonl schema; .gitignore mechanics | 175w | paragraph, with inline commands | estimate/token caveat, marked by a short parenthetical "~ / estimate" (65w) | D15, D27; answers-01 must-say 5, never-say 3; answers-02 §3 |
| 6 | Commands | Let a reader find the command for their next problem without leaving the page. | MCP prompt/tool names; model-facing frontmatter text | 340w | table (24 rows) | 4 category groups (Analysis / Fix & Improve / Enhancement / Utility), marked by a Group column in the one table | D07; purpose:table; answers-02 §2; terms.md row 14 |
| 7 | Documentation | Point to the Marketplace, Open VSX, npm, and website pages for depth without repeating them. | content only those pages carry | 40w | list (labeled links) | none | D10; purpose:links; answers-02 §10 |
| 8 | Support and contributing | Tell a stuck reader where to go, and a contributor the one place to edit. | a Code of Conduct or Good First Issues file — neither exists in the snapshot | 90w | paragraph | none | D16, D17; purpose:contrib; answers-02 §5/7 |
| 9 | License | Answer whether the reader may reuse the project, in one line. | license text itself | 12w | paragraph (1 line) | none | D18; answers-02 §6 |

## Genre sections this structure does not take

| Genre section | N of 7 G1 (top holder) | Reader loses | Cheaper because |
|---|---|---|---|
| Sponsor pitch + star-history chart | sponsor 3/7 (superpowers, cursorrules, templates); star-history 3/7 (spec-kit, templates, agents) — top: superpowers, 290,955★ | a funding channel; a popularity chart | purpose names no sponsor; D23: costs orientation attention and tells the reader neither route nor command |
| Table of contents | 2/7 (superpowers, cursorrules) — top: superpowers | a same-page jump list | D14; GitHub auto-generates one from headings (vendor evidence, s3.md slice 4); this structure's 9 sections need it far less than superpowers' 33 |
| Pre-install rationale (mechanism narrative / vs-sibling comparison) | 3/7 (superpowers "How it works", playwright-mcp "vs Playwright CLI", cursorrules "Why Cursor Rules") — top: superpowers | a mechanism narrative, or a why-not-a-sibling-tool comparison, before setup | the "why want it" verdict already lands in the opening's value clause; a second prose block spends the 30 seconds this reading protects. Spec-kit's version of this slot is already taken, as Choose your route |
| Community (chat / release-announcement channel) | 2/7 (superpowers, mcp-servers) — top: superpowers | a social channel and a release-announcement signup | answers-02 §7: the snapshot names none; the one real channel, issues, is already the Support line (cf. D17, narrower, which this structure does take) |
| Philosophy (closing principles) | 1/7, but the most-used (superpowers) | a stated creed (TDD, evidence-over-claims) | D21; Maestro's principles already surface at point of use (/diagnose's 5 scored dimensions, /zero-defect's 8 rules); restating them duplicates the Commands table for a heading's cost |
| Updating / uninstalling | 1/7, but the most-used (superpowers) | upgrade/removal steps for a returning reader | D22; no route's update/uninstall behavior is in evidence (synthesis: none verified); each route's own installer or extension host already owns this |

## Total

1,297 words across 9 sections (plus one 0-word image block).
