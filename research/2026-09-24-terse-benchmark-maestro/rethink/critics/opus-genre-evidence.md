# Critic: the genre and the evidence (Opus)

Run `20260924-125421-maestro-readme-rethink`, stage 3, 2026-09-24. Lens: does each section rest on a synthesis row, a survey count or a purpose clause; what does the genre have that each structure drops, at what weight and what cost.
Read: `purpose.md`, `standin/answers-01.md`, `standin/answers-02.md`, `survey/synthesis.md`, `terms.md`, `survey/s1.md`–`s3.md`, `structures/01`–`10`. To check every genre count below, I re-extracted the ATX headings outside fences from the seven G1 raw files in `survey/synthesis-sources/`, and recomputed every budget sum in the shell. Not read: the snapshot, the published README, the stage-3 brief.

Keys: D = synthesis row. A1 §5.n = answers-01 must-say n (never-n = never-say n). A2 §n = answers-02. T = terms row. P = purpose.md. G1 = the seven exact-genre READMEs. S = held by Superpowers, the most-used G1 document by stars (290,955). PM = held by Playwright MCP, the most-used G1 document by npm downloads (23,800,747 in 2026-08-23..09-21). The synthesis forbids comparing stars with downloads, so I read "most-used" both ways. Quoted lines resolve (L1). Hypotheses are marked.

## 1. Ranking

| # | Structure | Why it sits there |
|---|---|---|
| 1 | 09 claims-with-their-evidence | It is the only structure that accounts for all 12 qualifying genre kinds with correct counts, and the only one that checks the downloads leader's own kinds too ("Playwright MCP, first by downloads, adds only Requirements"). Every section is keyed to a row, and its two departures are labelled "New". Against it: three tables beyond the synthesis's two, and one printed "(hypothesis)". |
| 2 | 04 against-the-alternatives | It accounts for 11 of 12 kinds with correct counts (per-agent install appears only in an Excludes cell). Every section rests on a row except §2. §2's place and device come from the genre: the rationale slot, and the "vs" device of the exemplar Playwright MCP. But its "Maestro adds" column has no source. |
| 3 | 05 change-without-harm | It accounts for all 12 kinds, with one miscount. But §2 (130 words) rests "on no D row" in its own words, and it moves a post-install process before install, against D06's place. |
| 4 | 08 process-as-the-spine | Every section rests on a row. Its defining picture and a second diagram rest on none: the synthesis admits "0 images/screenshots/diagrams" and "no second graphic". It leaves 2 kinds unaccounted, Security (2/7) and telemetry (S). |
| 5 | 07 the-genres-shape | Its budgets are traced D-row by D-row, but the chooser's 100 words drop out and the total is mis-summed: the parts sum to 1,354 and the page states 1,454. It leaves 5 kinds unaccounted and 2 more named without count. |
| 6 | 02 what-do-i-type | It reproduces the synthesis's 1,454 words to the word. But it accounts for only 4 dropped kinds, leaving 7 unaccounted, and it sends per-route invocation to a section that does not carry it. |
| 7 | 01 decide-in-thirty-seconds | It leaves 5 kinds unaccounted. Its opening spends 35 words beyond D01+D02 on a value clause that no row admits, and it places memory before the command table, against D15's own place. |
| 8 | 10 the-shortest-that-serves | It cites a row for every section but sizes every section from a ≤400-word ceiling that nothing supports. One section provably cannot hold what the owner assigned it. |
| 9 | 03 what-it-will-not-do | The heading of its defining section rests on nothing. Its placement reads a count of the rationale slot as licence, though none of that slot's holders discloses anything; this goes against D26's place and against the one disclosure precedent in the corpus. It leaves 4 kinds unaccounted and 1 named without count. |
| 10 | 06 outside-the-field | It drops the D03 chooser on a count from the wrong population (1/7 G1), when D03 rests on P 2/5 and E 3/3. It drops D05's folder list against A1 §5.6, and it miscounts Community. |

## 2. Fatal flaws

- **09.** Its limit cells argue with the owner's must-say 8. The owner asks for "Costs are estimates" and "'Accuracy: ±20% — useful for trends, not invoicing.' (`packages/core/src/cost-estimator.ts:5`)" (A1 §5.8).
  - 09's numbers table prints that figure as "a comment, not a measurement".
  - Beside it, the same table prints "one default price". That is T42's L2 finding that every run is priced at one default rate because no model is passed: a wiring defect published as a documented limit.
  - Its Usage prints "the score is the coding agent's reading of a rubric (hypothesis)". That claim has neither a file nor a run behind it, and 09's own rule says such a claim "is cut".
- **04.** §2 "What Maestro adds" asks the writer to say what Maestro adds over "coding agent/editor", "loose skills/prompts" and "generic MCP/session notes". The owner's must-say list has nine items, each sourced to a line, and none is a comparative claim. Must-say 1 asks for "The identity, in the project's own words." The owner's only words on other skill collections are fences: "I don't want the README modelled on another skill project's README" (A1 §3), and never-1. The "adds" column would hold the writer's own unsourced claims, in the page's second slot, set beside other skill collections.
- **05.** §2 "How a change is checked" sits before any route. It walks four steps the reader cannot take yet: a baseline, the command the report names, a re-check, the record. Its middle step, the re-check that gives the section its title, is one that 05 itself excludes "until one real before/after pair is run (hypothesis)". What ships, then, is the first run shown twice (here and again in Usage), plus a line that the score is "the coding agent's own assessment". P §2 says the reader has "not picked an install route yet". A2 §11c ends the first run on the report: "the first-run block should end on something the reader can check."
- **08.** Its first-run step reads "Step 1 creates `.maestro.md` (read legacy `.maestro/context.md` first if present)". The owner states the rule without a label: "If `.maestro/context.md` exists, it is read first (`CHANGELOG.md:44`)" (A1 §5.4). T31 shows that the code labels `.maestro/context.md` "v2" and `.maestro.md` "v1 — backward compatible" (`agent-workflow/SKILL.md:14-15`). "Legacy" inverts the code, in the block the owner specified line by line. Beyond the shared failure in §3, it is the one owner-facing error I found in 08.
- **07.** It cites A2 §11b but carries only the caution D06 gives. Its first run is "one numbered list of two chat steps"; it excludes "route-specific UI claims not evidenced for every MCP client"; and its MCP H3 has no prompt line. So the MCP reader is told to type `/teach-maestro`. A2 §11b: "an MCP client shows the commands as prompts, not as the `/teach-maestro` a skills user types. The first-run block must not promise one interface for all three routes." The evidence 07 calls missing is the owner's (`mcp-server/README.md:90`; `mcp-server/src/tools.ts:154-157`).
- **02.** Its first project is a "numbered list, 2 steps, one shared code block" and excludes "per-route invocation syntax (see §3)". §3's three H3s carry install actions only and do not cite A2 §11b. No section tells the extension reader or the MCP reader how to run the two commands. A2 §11b: "The first-run block must not promise one interface for all three routes."
- **01.** It holds "the ten provider-folder names and per-tool compatibility" back from the first screen, and its chooser excludes "folder names". So the thirty-second verdict it exists for can answer "their problem" but not "their tool". P §1: "tell whether Maestro fits their tool and their problem". A2 §11a: "readers look for the name of their tool, not for a folder."
- **10.** Its opening says "exclude badges" and names no banner. A2 §9 is the owner's one decision marked "(not the default)": "the banner from `assets/` at the top, with alt text 'Maestro — AI Workflow Fluency'. Under it goes one row of live version badges for the VS Code Marketplace, Open VSX and npm". The owner's reason: "the front door should look like the same project."
- **03.** It takes the extension's writes out of the extension route and puts them in a pre-route table headed "What it will not do". Most of that table's rows are things Maestro does: writes on activation, writes on toggle, writes to `.maestro/`. A2 §4: "Default taken: the effects are listed in full beside the extension route." 03 names the terms.md default that it overrides, but not the owner's decision.
- **06.** It writes for "a reader who has never met 'MCP,' 'skills folder,' or 'slash command'". P §2: "They know their tool and what a slash command is." Its departures follow from that reader:
  - no route table;
  - no folder list, though A1 §5.6 requires "The ten provider folders: `.agents .claude .cursor .gemini .codex .kiro .trae .trae-cn .opencode .pi`";
  - the two chat commands inside the Skill files bash block. That is the mix s3 credits Spec Kit with preventing: "That exact distinction prevents a reader from treating slash commands as shell commands."

## 3. What all ten got wrong

All ten structures file the owner's headline under a heading the owner never used: an H2 "Session memory", in 10 of 10 structures, taken from T34.

- terms.md lists that rename second among "the five decisions I am least sure of". It "renames the owner's own 2.0 headline (answers-01 §5.5)", and "What would settle it: the owner's word on the rename, plus the same cold-read probe".
- Neither of those exists. owner-words.md is empty by rule, and the owner's latest word still says "the memory layer is presented as a capability of the product" (A2 §3; by file time, answers-02 is from 13:53, terms.md from 14:19, and the structures from 14:23 to 14:40).
- Some structures go further. 04 and 05 list "memory layer" in their Excludes. Five of them (04, 05, 08, 09, 10) also swap the owner's "audit trail" (A1 §5.8) for T39's "command log", which is terms.md's third least-sure decision.
- Ten writers with ten different first needs converged on the same unsettled word. That points to the brief, not to a writer. I infer that the brief handed them terms.md's headings table as settled vocabulary. This is a hypothesis: I did not read the brief. The evidence is the 10/10 convergence and the rests-on cells: "terms.md row 34 (rename to 'session memory')" in 02; "terms.md row 34 (rename); heading is terms.md's own recorded departure" and "heading per terms.md" in 03.

What the brief should have said: *terms.md's five least-sure decisions are open. Until the owner rules, headings and section names use the owner's words ("memory layer", "audit trail"). A structure that wants terms.md's alternative puts it in its rests-on cell as a question for the owner, beside the owner's word, and builds nothing on it.*

## 4. Grafts for 09

| Take | From | Displaces in 09 | Effect |
|---|---|---|---|
| The one plain estimate note, in the owner's words: `~`, ±20% for trends and not invoicing, context budget and not billing, entries from the extension | `04-against-the-alternatives.md`, §5 "Session memory": its "final plain note" | Session memory's "Numbers table × Made from · Stops at", including "(a comment, not a measurement)" and "one default price" | Removes the fatal flaw. Must-say 8 ships as the owner worded it, and one unadmitted table goes. |
| A first run that ends on the report: five dimensions, a score out of 25, a next command per gap | `08-the-process-as-the-spine.md`, the "First project" row | Usage's "New: a re-run line" and "Limit: the score is the coding agent's reading of a rubric (hypothesis)" | The first run ends where A2 §11c ends it, and 09 stops printing a hypothesis. |
| The ten folders with their tools, as an inline map inside the route that uses them | `04-against-the-alternatives.md`, §3 "Getting started": the `Skill files` sub-block | Installation's "Fit table (80): 9 tools, 10 folders × Checked by" | A2 §11a's pairs appear as the owner gave them, in the device the synthesis admits ("1 inline list of 10 provider paths"). A second unadmitted table goes. |

After these three grafts, 09 has three tables where the synthesis admits two: the chooser, the commands, and its own persistence-scope table. The scope table rests on the synthesis's "Separate three persistence scopes" need.

## 5. Sections that rest on nothing, and genre kinds dropped without accounting

**Which genre kinds qualify.** I apply the rule the structures apply: held by at least 2 of the 7 G1 documents, or held by the most-used one (06 calls it "≥2 or most-used"). Holders come from ATX headings outside fences in the raw files, plus the HTML sponsor blocks that the synthesis identifies.

| Kind | Holders (raw line) | N/7 | Top weight |
|---|---|---:|---|
| Sponsor or commercial aside | Superpowers "Commercial Services" :48; Cursor rules HTML `<h2>Sponsorships</h2>` :16, before Contents, and again at :363; Templates HTML `<h3>` "Sponsored by Bright Data" :39, before its H1 at :59 | 3 | S |
| Authored table of contents | Superpowers :5; Cursor rules :32 | 2 | S |
| Pre-install rationale (how it works, why, vs the sibling, key features) | Superpowers :36; Cursor rules :52; Playwright MCP :5, :13 (s1's 4/7 adds Spec Kit's chooser at :24) | 3 | S |
| Feature, configuration or customization | Spec Kit :162; Playwright MCP :401–802; Templates :98 | 3 | Spec Kit 138,668 |
| Star history | Spec Kit :187; agents :189; Templates :181 | 3 | Spec Kit 138,668 |
| Install subsections per agent or client | Superpowers :56–280 (16 H3s); agents :18–45; Playwright MCP :196–361 | 3 | S |
| Community | Superpowers :331; MCP servers :160 | 2 | S |
| Security | MCP servers :152; Playwright MCP :823 | 2 | MCP servers 90,570 |
| Philosophy | Superpowers :366 | 1 | S |
| When Something Goes Wrong | Superpowers :325 | 1 | S |
| Updating | Superpowers :389 | 1 | S |
| Visual companion telemetry | Superpowers :397 | 1 | S |

These do not qualify, because each is 1/7 and held by neither S nor PM: Releasing and Creating Your Own Server (MCP servers :148, :136); Multi-harness support, Quality evaluation, External Memory Integration and External Security Integration (agents :95, :120, :154, :168); Attribution and Links (Templates :144, :174); Directories (Cursor rules :321). Requirements (PM :19) qualifies, but nine of ten keep its content inline in the route sections; 06 is the exception (see its row).

Where Playwright MCP is a holder (rationale, feature/configuration, per-agent install, Security), it is also the top holder by downloads.

**Structure by structure.** "Rests on nothing" means that no row, count or clause supports the section, sub-block or device, or that the row it names says otherwise. "Unaccounted" means a qualifying kind that the structure drops but that its dropped-kinds table does not list. A kind named only in an Excludes cell or in the preamble, without count or weight, is counted as partial.

| Structure | Rests on nothing | Unaccounted kinds (N/7) | Count |
|---|---|---|---:|
| 01 | **Value clause.** The opening is 120 words. D01+D02 admit 85, and its 90-word fit/value paragraph alone exceeds D01's 60. No row admits value copy; D30 rejects "prolonged sales copy". **Placement of Session memory.** 01 puts it between the first run and Commands. D15 places "operational detail after inventory" and D07 places the table "after first run". 01 cites D15 and breaks D15's own place clause. | Feature/configuration 3; per-agent install 3; Security 2; When Something Goes Wrong 1 S; telemetry 1 S | 5 |
| 02 | **§4's "(see §3)".** §3 carries no invocation and does not cite A2 §11b, so §4's citation of §11b lands nowhere. | Pre-install rationale 3; feature/configuration 3; per-agent install 3; Community 2; Security 2; When Something Goes Wrong 1 S; telemetry 1 S | 7 |
| 03 | **§2's heading "What it will not do".** No row, count or clause states anything Maestro will not do, and §2 excludes the one candidate as unevidenced ("no telemetry/network line"). **§2's placement.** It cites "the genre's pre-setup rationale slot (4/7 G1)". That slot's four holders are a chooser, "How it works", "Why Cursor Rules" and "vs Playwright CLI", and none of them discloses a write. The one disclosure precedent, OpenHands, puts its warnings inside its route options (`all-hands-ai--openhands.md:63-66, 106-109`), and D26 places this content "extension route". **§1's fourth anchor** ("D13 + 1 anchor"; D13 admits three) has no row behind it. | Per-agent install 3; Community 2; Security 2; When Something Goes Wrong 1 S; partial: telemetry 1 S, named only in §2's Excludes | 4 + 1 partial |
| 04 | **§2's "Maestro adds" column.** No owner fact supports it, and neither do the rows it cites: D01's 60 words are spent in §1's "two plain fit paragraphs", D03's 100 words in §3's chooser, and no D row admits a rationale section (D21 rejects standalone philosophy). Only §2's boundary column has support, from T3–T5 (the genre's rival senses of "workflow" and "agent"). | Partial: per-agent install 3, named only in §3's Excludes ("ten repeated agent installs") | 0 + 1 partial |
| 05 | **§2 "How a change is checked" (130 words).** In 05's own words, "no D row carries it". Its re-check step is a hypothesis that 05 excludes. Its line on the score (L2) cites no row. Its place before install contradicts D06 ("after installation, before inventory"), and its genre precedent, Spec Kit's "Bug fixing", comes after that document's setup (:100, after "Get started" at :38). **§1's fourth shortcut** exists only to point at §2. | none | 0 |
| 06 | Nothing rests on nothing, but two departures rest on misread evidence. (a) It drops D03's table because "only 1/7 G1 (Spec Kit) has one". D03 rests on P 2/5 (Playwright, Cline) and E 3/3, and its P holder, Playwright, is the most-used document fetched (332,948,067 downloads). (b) It puts the chat commands in the Skill files bash block, against the synthesis devices row ("Label terminal versus chat") and T11 ("'Command' never names a terminal line"). | Per-agent install 3; Security 2; partial: Requirements 1 PM (it keeps the VS Code floor as "one version clause", but Node 20+ appears in no section, though A1 §5.6 requires it) | 2 + 1 partial |
| 07 | **The route matrix.** It cites D03 but has no budget: Getting started's 510 words = D04 250 + D05 100 + D26 135 + D28 25. The stated total, 1,454, would need D03's 100 words; the parts actually sum to 1,354. | Community 2; Security 2; Updating 1 S; When Something Goes Wrong 1 S; telemetry 1 S; partial: Philosophy 1 S (preamble only), per-agent install 3 (§2's exclusion only) | 5 + 2 partial |
| 08 | **The opening picture and the Session memory diagram.** The synthesis's devices table admits "0 images/screenshots/diagrams" and, for the loop, "no second graphic", and 08 cites no row for either. The picture's 12 words are left out of the budget ("badges/diagram carry no prose budget"), against the synthesis rule that visible text counts. **"Legacy"** rests on D06's word, which T31 overturned. | Security 2; telemetry 1 S | 2 |
| 09 | **Usage's "New: a re-run line"** rests on a reading of P1, with no row and no count. **Its limit "(hypothesis)"** rests on nothing by its own label, against 09's own rule. **The fit, scope and numbers tables** are three tables beyond the synthesis's two; their content rests on D05, D15, D27 and D28, but their table form rests on nothing. **Commands' link from each name to its SKILL.md** cites no row. 09's purpose cell says the link is there to "read what it tells the coding agent", while A2 §2 says the skills' own descriptions are "written for the model … not for the reader". | none | 0 |
| 10 | **Every section's budget.** The ≤400-word ceiling rests on no row, count or clause. The consequences are arithmetic: (a) Documentation's 8 words are exactly its five link labels (VS Code Marketplace 3, Open VSX 2, npm 1, maestroskills.dev 1, source 1), which leaves 0 words for A2 §10's "Interactive showcase and documentation". (b) Getting started gets 115 words where D26 alone admits 135 for the effects that A2 §4 wants "in full". (c) Commands gets 100 words: after 24 names, at least 6 group words and a 3-word header, at most 67 words remain for 24 descriptions, under 3 per row. Whether the owner's Marketplace one-liners fit is a hypothesis, because no stage measured them. **"Legacy"** rests on D06's word, as in 08. | Updating 1 S; telemetry 1 S; partial: Philosophy 1 S (named only in a loss cell), When Something Goes Wrong 1 S (folded into "Community / support" without its name) | 2 + 2 partial |

**Errors in the accounting that does exist.**

- **Star-history weight (01, 02).** They give its top weight as Superpowers 290,955. Superpowers has no star history; the holders are Spec Kit :187, agents :189 and Templates :181, so the top weight is Spec Kit's 138,668.
- **Per-agent install (05).** 05 counts it as "2". It is 3: Superpowers, agents and Playwright MCP.
- **Community (06).** 06 counts it as "1/7". It is 2/7: Superpowers :331 and MCP servers :160.
- **Inventory placement (04, 08).** 04 says "post-setup inventory (7/7)" and 08 says "inventory after setup (7/7 G1)". All 7 have an inventory, but s1 calls its place "the least consistent placement of any near-universal section": MCP servers' Reference Servers (:25) precedes its Getting Started (:55), and Cursor rules' Rules (:66) precedes its How to Use (:326).
- **Pre-install rationale (03, 06, 07, 08, 09, 10).** Each counts the dropped kind as 4/7 while keeping a route chooser. s1's 4/7 includes Spec Kit's chooser, so the kind these structures drop is 3/7. Only 01 says so.

**Two notes that apply to all ten.**

- **Updating.** Eight structures (01, 02, 03, 04, 05, 06, 08, 09) price the dropped Updating kind with D22's "No verified owner update/uninstall semantics were provided", and 07 and 10 do not account for it at all.
  - For updating, the owner did supply semantics: "'On every activation, Maestro syncs all 25 bundled skills into 10 AI provider directories' (`maestro-extension/README.md:50`)" (A1 §5.7). On the extension route, the skills come from the bundle at every activation. That is my reading (L2); nothing was run. Uninstall remains unknown.
  - At its top holder, the kind is one sentence of 10 words (Superpowers :389–391).
  - So the kind's weight is S, and its cost is one line of the owner's own fact, not the "invented" or "untested" steps that 04, 05 and 06 price it at.
- **Budgets.** Every budget in all ten rests either on the synthesis's "Admitted word budget" column or on the structure's own thesis. That column gives numbers with no count behind them: the surveys measured whole documents and first-150-word knowledge, never section lengths by kind. I do not count this against any one structure. It shows up wherever the content is fixed, as in 10's Documentation and 07's missing chooser.
