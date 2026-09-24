# Structure 04 — Against the alternatives
**First need:** A developer already using a coding agent must see whether Maestro adds something their present setup lacks before being asked to install it.  
**Reading:** Fit is decided by a clean boundary—Maestro improves the AI workflow being built; it is not another coding agent, model, or development methodology.  
**Leaves out:** A feature-led or reference-led reading would retain philosophy, broad configuration, client-by-client setup, release/update material, social proof, and promotion.

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).

## Ordered structure

### 1. `Maestro` — 100 words

- **Purpose:** Establish the distinct product, define “AI workflow,” give the accurate 25-skill/24-command/7-reference taxonomy, and route readers to installation, commands, or source.
- **Basis:** synthesis D01, D02, D13; genre opening (identity 7/7); purpose §1/reader; answers-01 §5.1–2; terms 1–4, 9–13.
- **Excludes:** mechanism, origin, versions, feature parade, screenshots, locales, social badges, and pre-identity prose.
- **Device/sub-blocks:** owner-required banner image → H1/verbatim tagline → three live version badges → two plain fit paragraphs → count line → three inline task links; marks are image alt, H1, paragraphs, line, and links. Answers-02 §9 overrides synthesis D12 on banner/badges.

### 2. `What Maestro adds` — 100 words

- **Purpose:** Compare Maestro with what readers already use by separating their coding agent from the AI workflow Maestro helps diagnose, improve, and carry across sessions.
- **Basis:** synthesis D01/D03; genre pre-setup rationale (4/7, including the most-used); purpose §1 fit test; answers-01 §2; terms 3–5, 9–12, 23, 34; **new title**, because this reading requires an explicit alternatives boundary.
- **Excludes:** sales pitch, generic “How it works,” philosophy, competitor verdicts, replacement claims, and forbidden ancestry/origin comparisons (answers-01 §5).
- **Device/sub-blocks:** three-row table—**already used / Maestro adds / boundary**—with rows marked **coding agent/editor**, **loose skills/prompts**, and **generic MCP/session notes**.

### 3. `Getting started` — 520 words

- **Purpose:** Move an uncommitted reader from route choice through installation to an observable first project without implying identical interfaces.
- **Basis:** synthesis D03–D06, D10, D19, D26, D28; genre setup (7/7; 6/7 within four peer sections); purpose §1; answers-01 §5.3–4, 6–7, 9; answers-02 §§1, 4, 8, 11; terms 7–8, 15–32.
- **Excludes:** ten repeated agent installs, collapsed clients, HTTP syntax, extension UI tour, MCP reference, identical-slash claims, and claiming the inferred `npx skills` line was tested.
- **Device:** three-row chooser table; three H3 route blocks with action fences; four-bullet effects list; numbered two-step first run.
- **Sub-blocks:**
  - **Chooser — 80:** unheaded table, rows **Skill files → VS Code extension → MCP server**, columns **need / prerequisite / install / first-use surface**.
  - **`Skill files` — 95:** H3; define folders/separate installer; fences for the unrun owner-authorized CLI inference and clone/build; inline ten-folder/tool map.
  - **`VS Code extension` — 150:** H3; ID, two registries, requirements, install/invocation; four bullets marked by write target—skill sync, MCP entry, Zero-Defect files, `.maestro/` git behavior.
  - **`MCP server` — 75:** H3; define local server/client; Node 20+; local command; prompt-menu use; HTTP depth link; plain restart-loses-waves note.
  - **First project — 120:** bold lead, not heading; route-specific invocation labels; numbered `/teach-maestro` → `/diagnose`; observable `.maestro.md` and scored report; existing `.maestro/context.md` read rule without version labels.

### 4. `Commands` — 340 words

- **Purpose:** Give new and returning users a complete searchable problem-to-command lookup without leaving the page.
- **Basis:** synthesis D07/D08; genre post-setup inventory (7/7); purpose §1; answers-02 §2; terms 11–14, 29, 32, 36, 41.
- **Excludes:** core skill as command, MCP tools/resources, model-facing frontmatter, new marks, duplicate list, collapses, and forbidden stale counts.
- **Device/sub-blocks:** one visible 24-row table, **Group / Command / Problem or outcome**; contiguous repeated group cells mark **Analysis (3) / Fix & Improve (5) / Enhancement (9) / Utility (7)**; owner-designated Marketplace descriptions only.

### 5. `Session memory` — 150 words

- **Purpose:** Explain the cross-session loop and its storage/measurement limits without suggesting memory for the AI system being built.
- **Basis:** synthesis D15/D27; genre post-inventory feature detail; answers-01 §5.5/8; answers-02 §3; terms 33–43.
- **Excludes:** “new in 2.0,” “memory layer,” architecture/compliance-log implications, bare figures, billing claims, and general features.
- **Device/sub-blocks:** arrow diagram `/capture → next session /recap → /reflect`; bullet file list for `.maestro/`, summaries, `decisions.jsonl`, command log (`audit.jsonl`); final plain note marked with `~`, ±20%, context-budget/not-invoicing, and extension-origin limits.

### 6. `Documentation` — 40 words

- **Purpose:** Send readers to changing route depth while keeping the root sufficient for choice, install, and first use.
- **Basis:** synthesis D10; genre tail documentation (4/7); purpose close; answers-02 §§8/10; terms 47.
- **Excludes:** duplicated manuals, HTTP details, schemas, second route table.
- **Device:** four labeled links—VS Code Marketplace/Open VSX, npm/MCP details, maestroskills.dev, repository source.

### 7. `Support and contributing` — 60 words

- **Purpose:** Give one verified help destination and prevent contributors from editing generated copies.
- **Basis:** synthesis D16–D17; genre tail contributing (5/7); purpose close; answers-02 §§5/7; terms 46.
- **Excludes:** full workflow, invented community, copied PR policy, biographies, unsupported recovery commands.
- **Device:** two plain paragraphs—issues/help; then `source/skills/` source of truth with `npm run build` and `npm run check`.

### 8. `License` — 12 words

- **Purpose:** State reuse terms at the conventional tail.
- **Basis:** synthesis D18; genre tail license (4/7); answers-02 §6.
- **Excludes:** legal summary or copied text.
- **Device:** one plain linked line naming MIT and `LICENSE`.

## Dropped qualifying genre section kinds

Seven-document exact-genre slice; top weight is the highest observed GitHub-star count among holders.

| Omitted standalone kind | Count; top usage weight | What the reader loses | Why that loss is cheaper than the words |
|---|---:|---|---|
| Manual table of contents | 2/7; Superpowers, 290,955 | Duplicate heading map | GitHub outline plus three task links cover return paths (D13–D14). |
| Commercial services / sponsors | 3/7; Superpowers, 290,955 | Funding/support-sales visibility | It serves none of the four purpose tasks (D23). |
| Broad configuration/customization | 3/7; Spec Kit, 138,668 | Exhaustive tuning depth | Links preserve depth; only required writes/limits stay (D21). |
| `When Something Goes Wrong` / troubleshooting | 1/7, but in most-used; Superpowers, 290,955 | In-page recovery | No verified procedure; prerequisites plus issues avoid invention (D17). |
| Community | 2/7; Superpowers, 290,955 | Chat/announcement destinations | Owner established issues only (answers-02 §7). |
| Philosophy | 1/7, but in most-used; Superpowers, 290,955 | Operating principles | Boundary and outcomes answer fit more directly (D21). |
| `Updating` | 1/7, but in most-used; Superpowers, 290,955 | Update guidance | Semantics are unverified; links beat invented maintenance steps (D22). |
| Security | 2/7; MCP Servers, 90,570 | Dedicated threat scope | No owner contract; verified writes/persistence limits remain. |
| Star history/social proof | 3/7; Spec Kit, 138,668 | Popularity evidence | It changes no route or command decision (D23). |
| `Visual companion telemetry` | 1/7, but in most-used; Superpowers, 290,955 | Collection disclosure | No Maestro telemetry fact; verified command-log provenance remains (D27). |

## Total budget

**1,322 words maximum**: 100 + 100 + 520 + 340 + 150 + 40 + 60 + 12.
