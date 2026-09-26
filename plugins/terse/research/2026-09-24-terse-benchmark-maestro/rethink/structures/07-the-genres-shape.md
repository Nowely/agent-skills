# README structure — the genre’s shape

Reader’s first need: choose the route that fits, complete one first run, then find the next command.
Kept: identity, route choice, actionable setup, `/teach-maestro` → `/diagnose`, the full command lookup, and the owner’s stable limits.
Left out: a separate mechanism/philosophy pitch, full coding-agent/client manuals, promotion, changelog, social proof, and duplicated channel prose.

## Owner purpose (verbatim)

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).

## Structure in order

### 1. Maestro — AI Workflow Fluency (H1/opening)

- Purpose/exclusion: establish fit for prompts, context, tools, agents, retrieval, evaluation and guardrails; exclude history, ancestry, sales copy and a mechanism essay.
- Rests on: synthesis D01–D02 and D13; genre opening identity 7/7; purpose §1–2; answers-01 §5.1–2; answers-02 §9.
- Budget: 97 words (identity 60 + accurate count 25 + three task shortcuts 12); title, banner and live Marketplace/Open VSX/npm badges are zero-word devices.
- Device/sub-blocks: plain identity paragraph; one count line (`25 skills = 1 core + 24 commands; 7 reference files`); one navigation line linking route choice, commands and contribution; owner-mandated banner/badge row after identity.

### 2. Getting started — choose a route, then install

- Purpose/exclusion: let an undecided developer select skill files, the VS Code extension or the MCP server and act immediately; exclude ten duplicated coding-agent/client tutorials and publisher mechanics.
- Rests on: synthesis D03–D05, D26 and D28; genre chooser-before-setup and setup 7/7; purpose §1–2; answers-02 §1, §4, §8 and §11.
- Budget: 510 words (route install 250 + compatibility 100 + extension write effects 135 + MCP wave limit 25).
- Device/sub-blocks:
  - **Route matrix** — Markdown table: route / best fit / prerequisite / first action; three rows, ordered skill files → VS Code extension → MCP server.
  - **Skill files** — H3; short definition of a coding agent’s skills folder; fenced `npx skills add sharpdeveye/maestro` slot marked as inferred/unrun, plus clone → `npm run build` alternative.
  - **VS Code extension** — H3; click/install identifier `sharpdeveye.maestro-workflow`, VS Code 1.95+ and Cursor/Antigravity/Windsurf note; a compact effects list marks activation sync, MCP config, Zero-Defect files, and `.maestro/` git behavior.
  - **MCP server** — H3; define MCP client in plain language; local `npx -y maestro-workflow-mcp` fence, Node 20+ requirement, HTTP command only as a depth link; plain limit note: a wave is held by the running server and is lost on restart.
  - **Compatibility** — inline list of the ten skills folders with established tool labels only; no claim that folders are ten distinct tools.

### 3. First project: teach, then diagnose

- Purpose/exclusion: finish onboarding with one observable project context and baseline health check; exclude a generic workflow tutorial and route-specific UI claims not evidenced for every MCP client.
- Rests on: synthesis D06 and D31; genre first executable action 4/4 H documents; purpose §1; answers-01 §5.4; answers-02 §11b.
- Budget: 90 words.
- Device/sub-blocks: one numbered list of two chat steps, explicitly separated from terminal/configuration setup — 1) `/teach-maestro` once per project → `.maestro.md` (read `.maestro/context.md` first if present), 2) `/diagnose` → baseline result.

### 4. Commands

- Purpose/exclusion: let a returning reader map the next AI-workflow problem to every invocable command; exclude the non-invocable `agent-workflow` core skill, MCP tool/resource reference, and collapsed detail blocks.
- Rests on: synthesis D07–D09 and D24; genre inventory 7/7, but no complete table in 7/7 G1; purpose §1; answers-02 §2.
- Budget: 340 words.
- Device/sub-blocks: one searchable Markdown table with 24 rows and columns group / slash command / problem or outcome; ordered groups are **Analysis (3)**, **Fix & Improve (5)**, **Enhancement (9)**, **Utility (7)**, carrying the owner’s exact command names and one-line descriptions; group labels mark rows, not separate tables.

### 5. Session memory

- Purpose/exclusion: explain cross-session continuity and its limits as a stable capability, not a dated release announcement; exclude changelog history, quotas, model names and standalone philosophy/configuration.
- Rests on: synthesis D15 and D27; purpose §1; answers-01 §5.5 and §5.8; answers-02 §3; genre gap 0/8 for this exact spotlight, retained as a purpose-driven addition.
- Budget: 175 words (memory loop 110 + estimate/audit limits 65).
- Device/sub-blocks: one short plain paragraph plus one chat fence showing `/capture` → next session `/recap` → `/reflect`; define `.maestro/`, `decisions.jsonl` and `audit.jsonl`; mark costs and token counts with `~`/“estimate”, ±20% as trend-only/not invoicing, context tokens as not billing, and audit entries as extension-originated.

### 6. Documentation

- Purpose/exclusion: route readers to deeper channel and product material without repeating it; exclude a second full table of contents and copied Marketplace/npm/MCP manuals.
- Rests on: synthesis D10 and D14; genre documentation 4/7; purpose §1; answers-02 §7, §10.
- Budget: 40 words.
- Device: labeled link list for VS Code Marketplace, Open VSX, npm, `maestroskills.dev` (“Interactive showcase and documentation”), repository source and issues.

### 7. Contributing

- Purpose/exclusion: tell contributors where changes belong and where a stuck reader reports a problem; exclude invented PR, code-of-conduct, support-channel and release procedures.
- Rests on: synthesis D16–D17; genre contributing 5/7 and end-help precedents; purpose §1; answers-02 §5 and §7.
- Budget: 90 words (source boundary 60 + help pointer 30).
- Device/sub-blocks: one bold-led source-boundary paragraph/list — edit only `source/skills/`, then `npm run build` and `npm run check` — followed by one issue link and no troubleshooting FAQ.

### 8. License

- Purpose/exclusion: answer reuse terms at the tail; exclude legal commentary.
- Rests on: synthesis D18; genre License 4/7; answers-02 §6.
- Budget: 12 words.
- Device: one plain line naming MIT and linking `LICENSE`.

## Genre kinds deliberately dropped (not README sections)

Each row gives name — count, top observed usage weight — reader loss — cheaper choice.

- **Commercial/sponsor aside:** 3/7 G1; Superpowers 290,955 stars — loses promotional context — route choice needs the opening words.
- **Manual table of contents:** 2/7 G1; Superpowers 290,955 stars — loses jump navigation — GitHub’s automatic outline plus three task shortcuts costs less.
- **Standalone overview/rationale:** 4/7 G1; Superpowers 290,955 stars — loses a broad “how it works” pitch — identity, route matrix and first run establish fit faster.
- **Standalone feature/configuration section:** 3/7 G1; Spec Kit 138,668 stars — loses broad optional depth — owner-specific memory/effects/limits plus links cover only needed facts.
- **Category-led bullet inventory as the primary catalog:** 4/7 G1; Superpowers 290,955 stars — loses bullet-by-category scanability — the required 24-row problem table is directly searchable and preserves the four groups.
- **Social proof/star-history block:** 3/7 G1; Spec Kit 138,668 stars — loses popularity reassurance — stars do not help install, run or choose a command.
- **Collapsed client/tool reference:** 1/7 G1; Playwright MCP 23,800,747 npm downloads (37,534 stars) — loses optional per-client depth — route links preserve it without hiding the required lookup.

**Total README content budget: 1,454 words maximum** (97 + 510 + 90 + 340 + 175 + 40 + 90 + 12; zero-word title, banner, badges and navigation marks excluded).
