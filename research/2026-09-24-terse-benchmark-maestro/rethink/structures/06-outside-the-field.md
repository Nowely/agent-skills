# Outside the field

First need: a reader who has never met "MCP," "skills folder," or "slash command" judges the page by whether one copy makes something run — not by a taxonomy of Maestro's parts.
Device: every route ends in exactly one block — the install line(s), then the first-run commands — so picking a route and finishing it are the same read, not two.
Leaves out: a route-comparison table built on axes (skill files vs. extension vs. MCP) this reader can't yet judge; the choice is made for them, in three plain-word lines, before any table would be legible.

**Owner's purpose statement (verbatim, `purpose.md` §1):**

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).

## Section order and budgets

Budgets are visible README words (synthesis's counting convention: headings/cells/list text/command tokens count once; raw URLs and markup don't).

| Order / title | Purpose; excludes | Device; genre split | Budget | Rests on |
|---|---|---|---:|---|
| 1. `# Maestro` (opening, no H2) | State identity, let the reader confirm fit. Excludes: mechanism/philosophy prose, un-glossed terms, the ten literal `.claude`/`.cursor`/… paths — a name list answers "does my tool work," a path is implementation detail this reader can't act on. | H1 + tagline (plain text) precede the banner/badge row; one identity+fit sentence; one count line; one plain tool-name list. No sub-block — 7/7 G1 keep this place single. | 100 | purpose§1; answers-01§5.1–2; answers-02§9 read with terms:row1 (identity text precedes the banner — name collides with mobile-dev-inc/Maestro) and row2 (tagline verbatim); D01, D02; departs D05's folder-path list. |
| 2. `## Getting started` — lead-in | Send an undecided reader to the right block, no table first. Excludes: a need/route/outcome comparison table (D03's device) — this reader lacks the axis it asks them to judge by. | Three plain lines: a default ("don't know? use skill files") + two alternatives. Not a table. | 30 | purpose§1 item 2; answers-02§1 (skill files default); terms:heading "Before setup" (opens "Getting started"). Table dropped: only 1/7 G1 (Spec Kit) has one, below the "≥2 or most-used" bar. |
| → H3 `Skill files` | Install by the one route reaching all ten tools, run the bootstrap in the same read. Excludes: clone+build gets one comment, not a paragraph; no folder list (row 1 covers fit). | One bash block: install line, `npm run build` as a comment, a boundary comment, then the two chat commands. | 70 | answers-01§5.3 (command marked inferred/unrun); answers-02§11b; D04+D06 merged; terms:row16, 18–19. |
| → H3 `VS Code extension` | Name the one action (no terminal command exists) and disclose what installing writes, before the reader takes it. Excludes: full Marketplace content; sidebar/palette beyond one clause. | One action line (ID + both registries) + copyable `@maestro /teach-maestro` → `@maestro /diagnose` pair + 4-item bold-led write-effects list + one version clause. | 130 | answers-02§4 (effects listed in full — writes happen unasked), §11b/d; answers-01§5.6–7; D26. |
| → H3 `MCP server` | Start with the one stdio command, then name — not fake as a slash command — the two prompts to pick. Excludes: `--http`/port (linked out, answers-02§8); prompt-picker as typed syntax. | One bash block (the `npx` command) + one sentence naming the two prompts + one trailing comment for the wave note. | 70 | answers-01§5.3, §5.9; answers-02§8, §11b ("must not promise one interface for all three routes"); D28; terms:row25, 27, 40. |
| 3. `## Commands` | Let both reader groups find the next command in one scan. Excludes: model-facing frontmatter phrasing; a 25th row for the core skill (it runs itself). | One Markdown table, 24 rows, `Command \| Problem it answers`; the four categories are bold lead-in row-groups inside the one table, not four tables. | 300 | purpose§1 item 4 (verbatim "command table," overrides the genre's bullet preference — see drop-table row 3); answers-02§2; D07 overriding D08. |
| 4. `## Session memory` | Show the across-session loop as the headline capability, costs marked as estimates. Excludes: a "new in 2.0" frame or version number; a features/configuration chapter around it. | Short paragraph + one 3-line loop list (`capture` → next session `recap` → `reflect`) + one caveat sentence for `~`/estimate figures. | 100 | answers-01§5.5; answers-02§3 (no version); D15, D27; terms:rows 34, 37–39, 42–43. |
| 5. `## Documentation` | Point to the four deeper surfaces without restating them. Excludes: a second routing table; instructions that belong on those pages. | One four-line link list (VS Code Marketplace, Open VSX, npm, website), each labeled with what's there. | 35 | purpose§1 ("for depth rather than repeating them"); D10; terms:heading "Documentation". |
| 6. `## Support and contributing` | Say where source is edited, how it's built/checked, where a stuck reader goes — once. Excludes: an invented Code of Conduct, Good First Issues list, or PR template (none in the snapshot). | Two sentences (`source/skills/` boundary, `npm run build`/`check`) + one linked Issues line. | 80 | purpose§1 (source-of-truth clause); answers-02§5, §7; D16, D17; terms:heading renamed for the joined help line. |
| 7. `## License` | Answer, in one line, whether the reader may reuse the project. Excludes: licence text; MIT commentary. | One sentence + link to `LICENSE`. | 15 | answers-02§6; D18; terms:heading "License". |

**Total: 930 words** (opening 100 + Getting started 300 [lead-in 30, Skill files 70, VS Code extension 130, MCP server 70] + Commands 300 + Session memory 100 + Documentation 35 + Support and contributing 80 + License 15).

## Genre sections dropped

Counts are exact-genre G1 (7: Superpowers, Spec Kit, MCP servers, Cursor rules, agents, Playwright MCP, Templates); 1/7 still qualifies when the holder is Superpowers, the most-used (290,955 stars, fresh count per synthesis's ledger).

| Dropped kind | N of 7; top weight | Reader loses | Why cheaper than its words |
|---|---|---|---|
| Sponsor/commercial aside | 3/7; Superpowers, 290,955 | An enterprise-support contact. | No sponsor program in the owner's testimony (D23); a heading with nothing verified to say costs more than its absence. |
| Full table of contents | 2/7; Superpowers, 290,955 | Manual same-page jump links. | GitHub renders its own outline (D14); at 930 words there's little to jump past. |
| "How it works" / "Philosophy" / rationale | 4/7; Superpowers, 290,955 | The *why* before the *how*. | None of purpose§1's four capabilities is "understand the philosophy"; reference files carry mechanism depth later (D21). |
| Feature/configuration depth | 3/7; Spec Kit, 138,668 | An in-page customization reference. | maestroskills.dev is already named as documentation for this; repeating it makes a second place to go stale (D21). |
| Star history / social proof | 3/7; Spec Kit, 138,668 | A popularity signal. | Answers none of purpose§1's four capabilities; pure footer weight (D23). |
| "The Basic Workflow" (named) | 1/7; Superpowers, 290,955 | A numbered walkthrough of the tool's own process. | terms:row3 reserves "workflow" for the reader's own system and rules the heading out by name; the bootstrap already lives inside each route's block. |
| "When Something Goes Wrong" (named) | 1/7; Superpowers, 290,955 | A dedicated recovery heading. | Reduced to one linked Issues line inside Support and contributing (D17); the snapshot names no other channel (answers-02§7). |
| "Community" (named) | 1/7; Superpowers, 290,955 | A visible Discord/announcements presence. | Owner's answers-02§7: no discussions, chat, or support file beyond Issues exist. |
| "Updating" (named) | 1/7; Superpowers, 290,955 | Upgrade/repeat-install guidance. | No verified update semantics in the owner's testimony (D22); invented steps would cost more than the gap. |
| "Visual companion telemetry" (named) | 1/7; Superpowers, 290,955 | Nothing transferable. | One product's own feature notice, not a genre convention; no analogous telemetry in the owner's must-say list. |
