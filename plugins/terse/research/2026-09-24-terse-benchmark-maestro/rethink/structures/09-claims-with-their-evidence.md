# 09 · Claims with their evidence — a structure for Maestro's README

**First need:** to check Maestro's claims before trusting it with a project — where it runs, what it writes and keeps, what its numbers are worth — each beside its source and its limit.
**So** a claim with neither a file nor a run behind it is cut, the owner's tagline excepted.
**Left out, which another reading keeps:** an unbroken fast path, a how-it-works or benefits story, the memory loop as a headline near the top.

**Purpose** (purpose.md §1, verbatim):

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).

**Rules.** A claim's own words link to the file or folder that shows it (the file, not the line; 0 words); its limit is a clause in the same row or line, never a section or a box (D19). A fenced line ships only once the author has run it. Words per terms.md; the never-say list (answers-01 §5) holds.
**Keys:** P purpose bullet · A1 answers-01 §5 must-say · A2 answers-02 § · D synthesis row · T terms row · G s1 slice-1 place.

| Section · words | Purpose | Excludes | Device; sub-blocks (mark) | Rests on |
|---|---|---|---|---|
| `# Maestro` · 95 | Say what Maestro is and claims, each claim linked to its evidence. | Pitch; versions in prose; manifest counts. | Banner (alt "Maestro — AI Workflow Fluency"); one row of live badges, the only version marks; H1 and tagline verbatim; a paragraph defining "your AI workflow" (T3), its three claims — commands, reach, session memory — linked to their sections, and their limit: commands are instructions the reader's coding agent follows; a count line (1 core skill + 24 commands = 25 skills; 7 reference files) linked to `source/skills/`; a 3-link shortcut line. | D01, D02, D13; A2 §9 over D12; A1 1–2; G1 |
| `## Installation` · 460 | Let the reader choose a route by what it reaches, needs and writes, then install it. | Per-tool walk-throughs; client configs, HTTP, settings (linked); update, uninstall. | Chooser table (90): 3 routes in A2 §1 order × Reaches · Needs · Writes before any command. Fit table (80): 9 tools, 10 folders × Checked by: run, tool docs or folder name (T17). One `###` per route: Skill files (80) — two fences marked terminal; limits: a third-party installer, the build lands in the clone (T18–19). VS Code extension (150) — ID, two stores (A2 §11d); the 4 unasked writes, bold lead = trigger. MCP server (60) — local fence; 24 MCP prompts; HTTP link with its limit, no authentication (T28, L2). | D03–D05 (list → table: a check cell per tool), D26; P1–2; A1 3, 6, 7; A2 §1, §4, §8, §11; G3. Split from Usage: steps after the MCP H3 would read as MCP-only |
| `## Usage` · 120 | Take the reader to a first result they can check, on any route. | The other 22 commands; waves; UI tours. | Two numbered steps, one fence marked chat: `/teach-maestro` → `.maestro.md` (T31); `/diagnose` → five scores 1–5, a total out of 25, a command per gap. Bold-led list: how each route runs them (A2 §11b). Limit: the score is the coding agent's reading of a rubric (hypothesis). **New:** a re-run line — the command the report names, then `/diagnose` again; limit: the coding agent grades its own change. | D06; P3; A1 4; A2 §11c; G3. New: on the reader's own project, P1's "their problem" has no other measure |
| `## Commands` · 320 | Let the reader find the command for their next problem and read what it tells the coding agent. | "Use when…" text; 🆕; a count in the heading; MCP tools and resources. | One table, 24 rows: Group · Command · What it does; groups and order per A2 §2, each group named in its first row; each name links to its SKILL.md; one line: `/teach-maestro` first. | D07 (D08 rejected); P4; A2 §2; G4 |
| `## Session memory` · 160 | Say what Maestro keeps between sessions, where, how long, and what its numbers are worth. | Version history; memory for the agents the reader builds (T34). | Definition; chat fence `/capture` → `/recap` → `/reflect`. Scope table × Where · Lasts · In git: `.maestro.md`; `.maestro/` and its own `.gitignore`; MCP waves, lost on restart (moved here: the claim it limits). Numbers table × Made from · Stops at: cost ~, the estimator's own "±20%" (a comment, not a measurement), one default price (T42, L2); tokens ~, "not billing"; coverage: only extension runs reach the command log (A1 8; T38). | D15, D27, D28 (tables: a limit cell per row); A1 5, 8, 9; A2 §3; synthesis "three persistence scopes" |
| `## Documentation` · 40 | Send the reader to depth without repeating it. | Restated store content. | 6 labelled links: VS Code Marketplace, Open VSX, npm, maestroskills.dev, `mcp-server/README.md`, `CHANGELOG.md`. | D10; P "links"; A2 §10; G6 |
| `## Support and contributing` · 45 | Give a stuck reader the issues page, and a contributor the one place to edit and the check to run. | PR steps; code of conduct; absent files. | Two plain lines: issues; `source/skills/`, `npm run build`, `npm run check`. | D16, D17; P "contributors"; A2 §5, §7; G7 |
| `## License` · 8 | Say whether it may be reused. | Terms past the name. | One line: MIT, linked to `LICENSE`. | D18; A2 §6; G8 |

**Total: 1,248 words** (synthesis ceiling 1,454) · 5 tables · 5 fences, 3 terminal and 2 chat.

**Genre sections left out.** Top weights: Superpowers 290,955★, the most used by the surveys' star rank; Spec Kit 138,668★; MCP servers 90,570★. Playwright MCP, first by downloads, adds only Requirements, which the chooser's Needs column carries.

| Kind | N of 7 · top | The reader loses | Cheaper because |
|---|---|---|---|
| Table of contents | 2 · Superpowers | a map at the top | GitHub's outline is free (D14); the shortcut line costs 12 words |
| How it works / Why / Key Features | 4 · Superpowers | the mechanism as a story | its facts sit, sourced, in the count line and Usage; a story adds unmeasured claims (D21) |
| Sponsor, commercial services | 3 · Superpowers | nothing the purpose asks | the owner names neither (D23) |
| Configuration | 3 · Spec Kit | settings, flags, HTTP hosting | two linked pages hold them (D21; A2 §8) |
| Star history | 3 · Spec Kit | a popularity signal | it measures no claim here (D23) |
| Community | 2 · Superpowers | a place to talk | issues are the only place the owner names (A2 §7) |
| Security | 2 · MCP servers | one heading to scan | its content — unasked writes, HTTP without authentication — sits beside the routes |
| Install per coding agent | 3 · Superpowers | their tool's own steps | routes, not ten installs (D04); the fit table names each tool |
| When Something Goes Wrong | 1 · Superpowers | a recovery path | none is sourced (D17); Usage step 1 is the one stated precondition |
| Philosophy | 1 · Superpowers | the principles | principles are unmeasured claims (D21) |
| Updating | 1 · Superpowers | how to update | no verified steps (D22); the badges show the live version |
| Telemetry disclosure | 1 · Superpowers | "does it send data?" | no source either way; an unsourced answer is what this reading cuts |
