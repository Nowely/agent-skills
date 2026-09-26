# Maestro README — process as the spine

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).

First need: choose an install route and complete one observable project run, not absorb a feature pitch.  
Therefore: the picture follows `fit → choose → install → teach → diagnose → next command → capture → recap/reflect`.  
Left out up front: philosophy, release news, promotion, deep configuration, and a full manual—material another reading would retain.

**Picture (opening device; 12 words):** horizontal arrow diagram of that sequence; `/teach-maestro` and `/diagnose` are the visual hinge.

| Stage / section (budget; device) | Purpose — deliberately excludes | Genre split / sub-blocks and what marks them | Rests on |
|---|---|---|---|
| **Maestro** (100; banner, live-badge row, plain paragraphs, count line, arrow diagram) | Establish identity and fit for developers building LLM features, agents, prompts, tools, RAG, or pipelines, then state `25 skills = 1 core + 24 commands`, seven references, and the session-memory promise; excludes origin claims, versions, release history, and a feature catalogue. | Banner alt: “Maestro — AI Workflow Fluency”; live VS Code Marketplace/Open VSX/npm badges; identity then count line then three same-page shortcuts (install, commands, source). | D01, D02, D13, D15; purpose §§1–2; answers-01 §5.1–2, §5.5; answers-02 §9; genre opening (7/7 G1 identity). |
| **Getting started** (585; one 3-row table, three H3s, five terminal/config code blocks, short notes) | Let an uncommitted reader select and install the route that fits before any command inventory; excludes ten duplicated agent procedures, badge-only installation, unverified extension shell syntax, and HTTP setup detail. | **Choose how to install**: need / route / prerequisite / next step table. **Skill files**: `npx skills add` plus clone/build alternative; named ten folders/tools. **VS Code extension**: ID, Marketplace/Open VSX click path, VS Code 1.95+ forks, full write-effects note. **MCP server**: Node 20+, local `npx -y` block, prompts/`maestro_run_command`, link for HTTP; note that active waves are lost on restart. H3s mark delivery routes; fences mark executable/config actions; bold-led “Writes to your project” marks consent-relevant effects. | D03–D05, D26, D28; purpose §1; answers-01 §5.3, §5.6–7, §5.9; answers-02 §§1,4,8,11a–b; genre setup (7/7 G1; route H3 precedent). |
| **First project** (90; numbered two-step list and one chat code block) | Convert successful installation into the shared first run—`/teach-maestro` once per project, then `/diagnose`—and show the checkable result; excludes route-agnostic slash-command claims for MCP and extended tutorials. | Step 1 creates `.maestro.md` (read legacy `.maestro/context.md` first if present); step 2 reports five dimensions, /25 score, and a next command per gap. The list, not a new route split, marks the two ordered actions; route-specific invocation wording refers back to the selected H3. | D06; purpose §1; answers-01 §5.4; answers-02 §11b–c; genre first executable action (4/4 H). |
| **Commands** (340; one visible 24-row Markdown table) | Give both new and returning readers a problem-to-command lookup immediately after the baseline; excludes the non-invocable core from the command count, collapsed reference UI, and model-facing “Use when” copy. | One table: group / command / reader-facing problem or outcome; rows ordered **Analysis**, **Fix & Improve**, **Enhancement**, **Utility**. Bold group labels or ordered group runs mark the four clusters; every command name appears. | D07; purpose §1; answers-02 §2; genre inventory after setup (7/7 G1), owner requirement overrides its no-large-table precedent. |
| **Session memory** (175; arrow diagram, compact list, labeled limit note) | Show the continuing loop—`/capture` → next session `/recap` → `/reflect`—and distinguish persistent project context from command logs and estimates; excludes a dated “new in” claim, generic configuration, and billing language. | Diagram carries the loop; list names `.maestro/`, `decisions.jsonl`, and command log (`audit.jsonl`); labeled note says costs/tokens are estimates (`~`), ±20% is for trends not invoicing, token figures are context-budget heuristics, and audit entries come from extension command use. | D15, D27; answers-01 §5.5, §5.8 and never-say 3; answers-02 §3; terms rows 34, 39, 42–43; genre feature-detail place (new: the owner’s cross-session loop needs a post-command stage). |
| **Documentation** (40; labeled link list) | Hand off route-specific depth without reprinting store/npm manuals; excludes a second channel map and full reference. | Four links: VS Code Marketplace, Open VSX, npm/MCP documentation, and `maestroskills.dev` labelled “Interactive showcase and documentation.” | D10; answers-01 §1, §2; answers-02 §10; genre documentation tail (4/7 G1). |
| **Support and contributing** (90; two short paragraphs / link line) | Give stuck readers the issues destination and contributors the safe edit/build/check boundary; excludes invented governance, Code of Conduct, support channels, or PR process. | **Support**: issues link. **Contributing**: edit only `source/skills/`; build and run `npm run check`; generated folders are not edit targets. Bold labels mark the two audiences. | D16, D17; purpose §1; answers-02 §§5,7; genre contributing tail (5/7 G1). |
| **License** (12; plain paragraph) | State and link the MIT terms; excludes status promises and legal exposition. | No sub-block. | D18; answers-02 §6; genre license tail (4/7 G1). |

**Total README budget: 1,432 words** (section budgets; badges/diagram carry no prose budget).

## Omitted genre kinds — accounted for

| Omitted kind | Count; top usage weight | Reader loses | Why cheaper than its words here |
|---|---|---|---|
| Authored table of contents | 2/7 G1; Superpowers 290,955 stars | A duplicate heading map. | GitHub’s outline plus three task shortcuts serve a one-page, process-ordered read; D14. |
| Sponsor/commercial block | 3/7 G1; Superpowers 290,955 | Funding/service discovery. | It delays fit and first run without serving the owner purpose; D23. |
| Standalone “How it works” / philosophy | rationale 4/7 G1; Superpowers 290,955 | A methodology argument. | The process picture and operational stages answer the needed mechanism without a pitch; D21. |
| Per-agent/client install variants | 3/7 G1; Superpowers 290,955 | Tool-specific installation detail. | Three route H3s avoid ten near-duplicate procedures; named folders and depth links preserve selection; D04–D05. |
| Full configuration/tool schema or collapsed deep reference | configuration/detail 3/7 G1; Spec Kit 138,668 stars | Exhaustive advanced controls. | The required 24-command table remains visible; route manuals hold depth; D09, D21. |
| Updating/uninstalling | present in the most-used G1 document, Superpowers 290,955 | Maintenance instructions. | No verified Maestro semantics; depth links cost less than unsafe cleanup advice; D22. |
| Community / full troubleshooting section | present in the most-used G1 document, Superpowers 290,955 | Community and diagnostic playbook. | One issues link preserves recovery without inventing channels or commands; D17. |
| Star history / social proof | 3/7 G1; Spec Kit 138,668 stars | Popularity signal. | It consumes tail space needed for source and terms, not a stated reader task; D23. |
