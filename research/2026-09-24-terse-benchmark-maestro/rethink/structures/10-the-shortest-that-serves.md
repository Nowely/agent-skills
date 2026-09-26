# README structure — the shortest that serves

First need: choose the route that fits the reader’s coding agent and problem, then reach a verified first run.
Keeps: fit, three routes, teach → diagnose, the complete next-problem lookup, concrete limits, and source links.
Leaves out: philosophy, a full contents map, repeated client manuals, promotion, and deep reference material another reading would keep.

**Owner’s purpose statement (verbatim from `purpose.md`):**

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).

## Section order and budgets

Each row is one section; its purpose/exclusion is one sentence. Budgets are visible README words, excluding raw URLs and markup.

| Order / title | Purpose; deliberate exclusion | Device and genre split | Budget | Rests on |
|---|---|---|---:|---|
| 1. `# Maestro` | Establish fit for AI workflows and distinguish the product; exclude badges, history, origin stories, and a full TOC. | H1, tagline, count line, and one three-link shortcut line; opening identity (7/7 G1). | 40 | Synthesis D01–D02, D13; purpose §1; answers-01 §5.1–2, §5.5; terms 1–4, 9–14. |
| 2. `## Choose how to use Maestro` | Let an undecided reader choose skill files, the extension, or MCP by need, prerequisite, and consequence; exclude marketing and repeated command lists. | One three-row Markdown table: need → route → prerequisite/next action; pre-setup chooser (Spec Kit and Playwright MCP exemplars). | 35 | Synthesis D03; genre order “before setup”; answers-01 §5.3; answers-02 §1; terms 7, 15–16. |
| 3. `## Getting started` | Make all three routes actionable and disclose what installation writes; exclude ten duplicated provider/client procedures and full HTTP configuration. | Three H3 blocks marked `Skill files`, `VS Code extension`, `MCP server`; five terminal/action slots, a four-bullet effects list, and inline requirements. | 115 | Synthesis D04–D05, D26, D28; genre setup (7/7 G1); purpose §1–2; answers-01 §5.3, §5.6–7, §5.9; answers-02 §1, §4, §8; terms 7–8, 16–18, 28, 40–41. |
| 4. `## First project: teach, then diagnose` | Separate setup from the first observable chat result; exclude a general workflow tutorial and unverified client-specific invocation promises. | One numbered two-step sequence: chat `/teach-maestro` → `.maestro.md`, then `/diagnose`; legacy `.maestro/context.md` note. | 25 | Synthesis D06; genre first executable action (4/4 H); purpose §1; answers-01 §5.4; answers-02 §11b; terms 11–12. |
| 5. `## Commands` | Let a returning reader map the next problem to every invocable command; exclude the non-invocable core skill and reference-file manual. | One searchable Markdown table with `Group | Command | Problem/outcome`; group values, in order, are Analysis (3), Fix & Improve (5), Enhancement (9), Utility (7). | 100 | Synthesis D07–D08; genre inventory place; purpose §1; answers-02 §2; terms 9–14, 36. |
| 6. `## Session memory` | Show continuity across projects and sessions while limiting claims about estimates and logs; exclude dated release notes and a generic feature/philosophy chapter. | New owner-required block after inventory: one flow diagram `capture → next session: recap → reflect`, followed by a compact file/limit list: `.maestro/`, `decisions.jsonl`, `audit.jsonl`, `~` cost/tokens, extension-only command log. | 45 | Synthesis D15, D27; owner needs in synthesis because purpose requires continuity and bounded claims; answers-01 §5.5, §5.8; answers-02 §3; terms 34, 37–39, 42–43. |
| 7. `## Documentation` | Send readers to the four deeper surfaces without repeating them; exclude a second navigation table. | One plain link line: VS Code Marketplace, Open VSX, npm, maestroskills.dev, and source. | 8 | Synthesis D10; genre tail documentation (4/7 G1); purpose §1; answers-02 §10; terms 47. |
| 8. `## Contributing` | Tell contributors to edit only `source/skills/`, run build/check, and use Issues for help; exclude invented contributor programs or a support forum. | One short paragraph with two commands and one Issues link. | 20 | Synthesis D16–D17; genre contributing (5/7 G1); purpose §1; answers-02 §5, §7; terms 46. |
| 9. `## License` | State the reuse term; exclude legal commentary. | One plain line linking `LICENSE` and naming MIT. | 4 | Synthesis D18; genre license (4/7 G1); answers-02 §6. |

**Total README budget: 392 words (≤400).**

## Genre sections deliberately dropped

Counts are exact-genre G1 documents unless noted; the top usage weight is the highest observed holder in that kind. The loss is accepted because the right-hand device already serves the stated purpose more cheaply.

| Dropped kind | Count; top weight | Reader loses | Why cheaper than its words |
|---|---|---|---|
| Overview / “How it works” | 4/7; Superpowers, 290,955 stars | A longer mental model. | Fit is defined in 40 words and route choice follows immediately. |
| Full table of contents | 2/7; Superpowers, 290,955 | Manual heading navigation. | GitHub supplies the outline; three task shortcuts suffice. |
| Per-agent/client installation subsections | 3/7; Superpowers, 290,955 | Harness-specific click and restart detail. | One files command plus three route blocks avoids ten near-duplicates. |
| “What’s inside” / Skills Library / Additional Tools | 3/7; Superpowers, 290,955 | Separate core/reference inventory detail. | The count line, command table, and depth links cover the reader’s decisions. |
| Standalone feature/configuration detail | 3/7; Spec Kit, 138,668 stars | Deep options and philosophy. | Only owner-mandated memory, writes, and limits earn space; manuals are linked. |
| Security chapter | 2/7; MCP servers, 90,570 stars | General security guidance. | Concrete workspace-write and wave-lifetime limits sit beside their routes. |
| Community / support chapter | 2/7; Superpowers, 290,955 | Community context and extra contact paths. | The owner named Issues only; one pointer is enough. |
| Sponsor/commercial/funding block | 3/7; Superpowers, 290,955 | Funding or service context. | It does not help fit, install, run, or choose a command. |
| Star-history / social-proof block | 3/7; Spec Kit, 138,668 stars | Popularity reassurance. | Popularity cannot answer the owner’s four reader tasks. |
