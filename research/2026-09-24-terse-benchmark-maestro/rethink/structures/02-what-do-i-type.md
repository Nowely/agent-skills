# What do I type

First need: the exact next keystroke and the exact confirmation that it worked — at the route choice, the first run, and every later command lookup.
Every section that asks for an action pairs it with what comes back from it; prose survives only where it changes which of two actions is correct.
Left out: why Maestro is built this way and how it works internally — content a reading built around trust or mechanism would keep; this one shows only what appears on screen after a keystroke.

**Owner's purpose, verbatim (purpose.md §1):**

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).

`D##` cites a row of `survey/synthesis.md`'s Merged-decisions table. `capability N` cites purpose.md §1's four bullets, in order (1 fit, 2 route, 3 first-run, 4 table). `§N` cites `standin/answers-01.md` or `-02.md` by its own section number.

## Sections, in order

| # | Section | Purpose | Excludes | Budget | Device | Sub-blocks (mark) | Rests on |
|---|---|---|---|---|---|---|---|
| 1 | Maestro *(opening, no heading)* | Let the reader see in one glance what Maestro is and its size, before any action. | how-it-works rationale; ancestry/fork claims; a version number that can go stale | 97w | paragraph (title+tagline+count) + one-line link list; banner and live badge row are images, 0w | none — fixed order: banner, title+tagline, badges, count+shortcuts | D01, D02, D13; capability 1; answers-01 §5.1; answers-02 §9; terms.md row 1 (badges after the tagline, rejecting D30) |
| 2 | Choose your route | Let a reader who hasn't picked a route match their situation to one row and see the next keystroke before reading further. | prerequisites, effects, alternate commands — one row down, in §3 | 100w | table, 3 rows, columns "You have" · "Type this" · "You get" | none | D03; capability 1–2; answers-02 §1 (skill files ordered first) |
| 3 | Install and run | Give whichever route the reader picked the prerequisite, the exact action, and what happens on their machine. | a separate Requirements heading; the chooser restated; the HTTP command itself (link only) | 510w | 3×H3: code block for two routes, paragraph+list for the third | "Skill files" (command + build alternative + folder names) · "VS Code extension" (ID, no command + write-effects list) · "MCP server" (local-mode command + Node floor + wave note) — each marked by its own heading | D04, D05, D26, D28; capability 2; answers-01 §5.3/§5.6/§5.7; answers-02 §1/§4/§8/§11a/§11d; terms.md "Setup"/"Setup, route H3s" rows; D19 (note placement) |
| 4 | First project: teach, then diagnose | Walk every route through the one sequence every command needs first, ending on a result the reader can check. | per-route invocation syntax (see §3); what each of `/diagnose`'s five dimensions individually checks | 90w | numbered list, 2 steps, one shared code block | none — exactly teach, then diagnose | D06; capability 3; answers-01 §5.4; answers-02 §11b–c |
| 5 | Commands | Let a reader who already knows their problem find the one command to type, without reading anything else. | frontmatter "Use when…" text (model-facing, not reader-facing); a second table split by category | 340w | table, 24 rows, columns "Type this" · "What it's for" | 4 groups (Analysis, Fix & Improve, Enhancement, Utility), marked by row order under a bold group label, not separate tables | D07; capability 4; answers-02 §2; terms.md row 14 |
| 6 | Session memory | Show the loop that carries the reader's work into their next session, and how far to trust its numbers. | a dated account of what shipped in 2.0; any cost/token figure without "~"/"estimate" | 175w | code block (`capture` → `recap` → `reflect`) + paragraph (estimate note) | none | D15, D27; answers-01 §5.5/§5.8; terms.md row 34 (rename to "session memory"), rows 42–43 |
| 7 | Documentation | Point at the VS Code Marketplace, npm, and website pages for depth without repeating them. | restating any of those pages' own content | 40w | list, one labeled link per line | none | D10; purpose.md §1 closing sentence |
| 8 | Support and contributing | Tell a contributor where to edit and a stuck reader where to ask. | a Code of Conduct or Good First Issues file — neither exists in the snapshot | 90w | paragraph, two short blocks | none | D16, D17; answers-02 §5/§7 |
| 9 | License | Answer whether the reader may reuse the project, in one line. | reproducing license text | 12w | paragraph, one line | none | D18; answers-02 §6 |

## Total

**1,454 words across 9 sections** — equal to `survey/synthesis.md`'s admitted ceiling (D01–D07, D10, D13, D15–D18, D26–D28): nothing added beyond it, nothing cut from it, only reordered and re-framed as typed actions paired with what comes back.

## Genre sections this structure does not carry

| Dropped kind | Count; top holder | Reader loses | Cheaper because |
|---|---|---|---|
| Sponsor/commercial block + star-history | sponsors 3/7 G1 (Superpowers, Cursor rules, Templates); star-history 3/7 (Spec Kit, Templates, agents) — top: Superpowers, 290,955★ | a funding channel; a popularity chart | D23: answers neither "which route" nor "which command"; the attention it costs goes to §2's chooser instead |
| Hand-authored table of contents | 2/7 G1 (Superpowers, Cursor rules) — top: Superpowers, 290,955★ | a same-page jump list | D14; GitHub renders one from headings for free (vendor-github.md); a second, hand-kept one is one more place to go stale |
| Philosophy and Updating, as sections of their own | 1/7 G1 each, but the single most-used document by every signal fetched (Superpowers, 290,955★) | the project's stated values; its update cadence | D21, D22: no owner-verified update/uninstall behavior exists to write, and the values on offer are a different product's |
| Large reference collapsed behind per-client `<details>` toggles | 1/7 G1 (Playwright MCP: 33 toggles, 72 tools) — the highest-usage document in the exact genre by npm downloads (23.8M/month), though 6th of 7 by stars | nothing — Maestro's reference is 3 routes and 24 commands, not 20 clients and 72 tools | D09: one visible table already fits both at this size; a toggle adds a click §2's chooser and §5's table are built to avoid |
