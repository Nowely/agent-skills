# Structure 05 — Change without harm

- **First need:** before Maestro changes their AI workflow or their repository, to see how a change is checked: its baseline, its record, what the score is worth.
- **Left out, which a fit-first reading keeps:** the route chooser right after the opening (D03); here the check comes first.
- **Left out, which a what's-new reading keeps:** session memory in the opening (D15); here it is the check's record.

**Purpose**, `purpose.md` §1, verbatim:

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).

D = row of `survey/synthesis.md` · A1 = `standin/answers-01.md` §5 · A2 = `standin/answers-02.md` § · T = row of `terms.md` · G1 = the 7 exact-genre READMEs. Budgets are maxima.

## Sections, in order

1. **`# Maestro`**, opening · **95 words** · banner, 3 live badges → tagline, then fit → count line → 4 shortcut links (D13's three, plus section 2). Sets it apart from mobile-dev-inc/Maestro (T1), says what it works on (T3) and counts it. *Excludes* improvement claims, versions, stale counts (A1 never-2), origins. *Rests on* genre place 1 (7/7 G1); D01, D02, D13; A2§9.
2. **`## How a change is checked`** · **130** · 4 numbered bold-led steps (Superpowers' mark), each a command and what the reader then sees; 1 line on the score. Before install, walks one change through a baseline (`/teach-maestro`, `/diagnose`), the command it names (checked phases where the route runs waves, T40), a re-check and the record, and says the score is the coding agent's own assessment (L2). *Excludes* install, promises of a better score, the re-check until one real before/after pair is run (hypothesis). *Rests on* **new**: to this reader, "fits … their problem" means "can a change be checked", and no D row carries it; genre place 2 (4/7 G1); Spec Kit's "Bug fixing"; A1 must-say 4; A2§11c.
3. **`## Installation`** → `### Skill files` · `### VS Code extension` · `### MCP server` · **475** (table 120; H3s 100, 170, 85) · 3-row table in A2§1 order: route, for, needs, **writes and records** (this reading's column), first step; then 2 terminal fences and the ten folders with tools · ID and stores, bold-led "What it writes" (A2§4) · 1 local fence, wave note (T40). Lets the reader choose a route knowing what it writes and records, then install it. *Excludes* HTTP (A2§8), per-agent steps, update and uninstall (D22), `npx skills add` shown as tested. *Rests on* the purpose's second capability; D03–D05, D26, D28.
4. **`## Usage`** · **100** · 2 numbered steps in a chat fence; 3 per-route bullets (A2§11b). Takes the reader from install to the baseline: `/teach-maestro` once, then `/diagnose` and its report (A2§11c). *Excludes* the change and record steps. *Rests on* the third capability; D06.
5. **`## Commands`** · **340** · one 24-row table: group, command, what it does (A2§2). Lets both readers find the command for their next problem. *Excludes* the core skill in the count, 🆕, "Use when…" text. *Rests on* the fourth capability; D07, not D08.
6. **`## Session memory`** · **150** · chat fence: capture, recap, reflect; 3 bullets: summaries, `decisions.jsonl` with files changed, command log `audit.jsonl` from `@maestro` only (T38); bold-led estimates note. Shows the check's record, which route writes it, and that costs and tokens are estimates. *Excludes* "memory layer", "audit trail" (T34, T39), figures without "~". *Rests on* D15, D27; A1 must-say 5, 8.
7. **`## Documentation`** · **40** · 5 links: VS Code Marketplace, Open VSX, npm, maestroskills.dev, `CHANGELOG.md` (A2§3). Sends readers to depth. *Excludes* a second route table (D10). *Rests on* the links clause; D10; A2§10.
8. **`## Support and contributing`** · **45** · 2 plain lines. Sends the stuck reader to issues, and contributors to `source/skills/`, `npm run build` and `npm run check`. *Excludes* a full guide (A2§5). *Rests on* the contributors clause; D16, D17; A2§7.
9. **`## License`** · **10** · 1 line. Names MIT and links `LICENSE`. *Excludes* the text. *Rests on* D18; A2§6.

**Total: 1,385 words**; the synthesis admits 1,454.

## Genre sections not kept

Top weight is Superpowers, 290,955★, unless a holder is named.

| Kind | N of 7 G1 · top weight | Reader loses | Why that is cheaper |
|---|---|---|---|
| Commercial aside; Star history | 3; 3 · Spec Kit 138,668★ for the second | paid support; popularity | the owner names no offer (A2§7); stars check no change (D23) |
| Table of contents | 2 | an outline | GitHub renders one (D14) |
| Customize, Configuration, Additional tools | 3 · Spec Kit 138,668★ | settings, UI, HTTP | the store page and `mcp-server/README.md` hold them (D21) |
| Requirements; Multi-harness support | 2 · agents 39,918★ | a "where it runs" heading | the chooser's "needs" column carries it (D05) |
| Per-agent install blocks | 2 | agent-by-agent steps | one route reaches all ten (A2§1) |
| Community; When Something Goes Wrong | 2; 1 | chat; recovery steps | neither exists or is verified (A2§7, D17); issues and the record cover it |
| Security | 2 · MCP servers 90,570★ | one trust section | each boundary sits beside its route; HTTP's missing authentication (T28, L2) goes with HTTP |
| Updating | 1 | an undo path | nothing is verified (D22), and an untested step is this reader's harm |
| Philosophy | 1 | the stance | section 2 shows it in commands (D21) |
| Visual companion telemetry | 1 | whether data leaves | the owner's material is silent: ask, don't guess |
