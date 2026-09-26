<!-- rationalizer; 9.2 min; 7 tool uses -->

**Result.** I propose 25 cuts totalling 263 words. That is about a quarter of the draft's 1,037 prose words, counted with `wc -w` after dropping fenced code, table rules and pipes. None of the cuts removes a condition, limit or warning from a point where the reader decides. Two pieces of line 124 need to move rather than be deleted (see L124). The draft has no versions or prerequisites to cut.

Format: line — the words — verdict: reason — words saved.

**Top of the page: does it fit (L1–11)**
- L1 `# ![Maestro](assets/banner.png)` — keep: the name as the heading; the reader never reads the path — 0
- L3 "Maestro helps you build LLM apps and agents that hold up in production." — keep: the first test of fit, whether this is the reader's problem — 0
- L3 "It gives your coding agent 24 slash commands that check … fix what is weak, and add what is missing." — keep: says what the reader gets, and that it changes code rather than only reporting — 0
- L5 "**Made for LLM work.** It targets what breaks in AI systems: unstructured prompts, …, no guardrails." — keep: concrete failures the reader can match against their own. Together with L8's bold lead, the bold text a skimmer reads covers both fit tests (problem and tool) — 0
- L6 "**Starts from your project.** `/teach-maestro` asks once about your models, constraints and priorities, and the other commands build on the answers." — cut: this is the maintainer selling a feature; L39 says the same at the step where the reader runs it — 21
- L7 "**From finding to fix.** `/diagnose` names the command for each gap, and each command suggests the next." — cut: L47 and L57 say it where it is used, and it does not help decide fit — 17
- L8 "**Fits the tools you use.** Skills for Claude Code, … and an extension for VS Code." — keep: the tool-fit test, and the only list that L17's "any supported agent" points back to — 0
- L9 "**Picks up where you left off.** `/capture` saves a session's decisions and next steps, and `/recap` restores them." — cut: rows L94–95 cover it where a reader looks for it; it does not help decide fit — 18
- L11 "[Website] · [VS Code Marketplace]" — keep: where the depth lives, so this page does not repeat it — 0

**Quick start (L13–47)**
- L13, L15 headings — keep: where a reader without an install route looks first — 0
- L17 "**Skills**, the command files themselves, for any supported agent:" — keep: tells the reader which tools this route serves, at the point of choosing. The gloss is needed because this reader may not know what a skill is (purpose.md:18) — 0
- L20 `npx skills add sharpdeveye/maestro` — keep: the action — 0
- L23 "**VS Code extension**, for VS Code, Cursor and Antigravity:" — keep: which tools this route serves, at the point of choosing — 0
- L26 `code --install-extension sharpdeveye.maestro-workflow` — keep: the action; the extension ID is what the command needs — 0
- L29 "Cursor and Antigravity get it from Open VSX." — keep: a condition at the choice. `code` is VS Code's command-line tool, so without this sentence a Cursor or Antigravity user runs the wrong command — 0
- L29 "Each time you open a project, the extension writes Maestro's skills into it for every supported agent." — keep: a warning at the choice (files land in every project, for every agent). It also tells extension users not to run `npx skills add` as well — 0
- L29 "Its sidebar sends any command to the chat in one click." — keep here: the extension's visible difference from the skills route, stated where the route is chosen; its repeat at L120 is the one to cut — 0
- L33 "In your agent's chat," — cut: the reader already knows where a slash command goes (purpose.md:18) — 4
- L33 "once per project" — keep: a condition — 0
- L39 "about your models, workflow, quality checks, constraints and priorities," — cut: the reader answers the questions as they come, and the list changes nothing they do. The sentence needs a small repair, e.g. "It interviews you, then saves …" — 9 (about 7 after the repair)
- L39 "then saves the answers to `.maestro.md` in your project" — keep: a file appears in their repo at this step, and this is the one mention of that path the reader needs — 0
- L39 "The other commands read this file first." — keep: explains why this command runs first — 0
- L41, L44 "Then get a baseline:" and `/diagnose` — keep: the second action — 0
- L47 "for prompts, context, tools, architecture and safety," — cut: the area names only help judge fit, and L3 already gives that. The reader acts on the lowest score, not on the names — 7
- L47 "the most serious findings and" — cut: the reader reads the findings in the output, and there is nothing to act on here. Both L47 cuts need a few words of repair, e.g. "a score per area and the command for each gap" — 5
- L47 "Start with the one for your lowest score." — keep: the instruction at the point where the reader chooses — 0

**Commands (L49–95)**
- L51 "Each command ends by suggesting what to run next." — cut: it does not help anyone find a row, and the reader sees the suggestion at the end of their first command — 9
- L49, 53, 55, 61, 63, 73, 75, 85, 87 headings and table headers — keep: the reader finds their problem by group, then by the "Use it when" column — 0
- L57 "from 1 to 5" — cut: the scale does not change which command to pick, and L47 already has it — 4
- L58 "and grades them A to F" — cut: describes the output, not a reason to pick the command — 6
- L59 `/reflect` row, "You run commands through the extension's `@maestro` in VS Code" — keep: a limit at the choice; the command works on `@maestro`'s run logs (L121) — 0
- L67 "without changing behavior" — keep: a limit the reader relies on just before shipping — 0
- L68 "and records the conventions in `.maestro.md`" — cut: a file path, and the decision to run the command does not depend on where it writes — 6
- L71 "eight" — cut: the count says nothing about what the rules are — 1
- L71 "for the rest of the session" — keep: a limit on how long the rules hold — 0
- L79 "and the data passed between steps" — cut: explains a pipeline to people who build pipelines — 6
- L80 "once one agent proves not enough" — cut: repeats the row's own "Use it when" cell — 6
- L82 ", measured before and after" — cut: describes the method, not a reason to pick; the "Use it when" cell already covers the choice — 4
- L83 "and builds your pick" — keep: tells the reader they choose before anything is built — 0
- L89 "and saves the answers to `.maestro.md`" — cut: L39 says it at the step where it happens, and "Interviews you" is enough to pick the row — 6
- L65, 66, 69, 70, 77, 78, 81, 90–95 as written — keep: each row is how a reader finds the command for one problem, and readers who already use the extension or server come for the full list — 0

**MCP server (L97–112)**
- L97–99 "Maestro also runs as an MCP server. Add it to your client's configuration:" — keep: names the third route and its action — 0
- L101–110 JSON block — keep: the action — 0
- L112 "Your client then offers each command as a prompt" — keep: tells someone on this route how to run `/teach-maestro` — 0
- L112 ", and Maestro's principles and seven reference guides as resources" — cut: the maintainer's inventory. The model reads these resources; the reader never picks one — 9
- L112 "Ten tools let the model fetch a command's instructions, read your `.maestro.md` and keep a decision log." — cut: the model calls these tools, not the reader, and the npm link that follows lists them — 17
- L112 "The VS Code extension registers the server for you." — keep: a condition at the choice; extension users skip this configuration step — 0
- L112 "The [npm page] lists every tool and the HTTP mode for remote clients." — keep: the link to depth, plus a condition for remote clients — 0

**How it works (L114–124)**
- L116 "Each command is a skill: a Markdown file of instructions your agent follows with its own tools." — keep: the only plain answer to "what is a skill" for a reader who does not know. It is more useful at the install choice (L17) than here — 0
- L116 "All but `/teach-maestro` first load `agent-workflow`, the core skill, and read your `.maestro.md`." — cut: an internal name the reader never types, and the rest repeats L39 — 13
- L116 "The core skill holds Maestro's principles, a checklist of common mistakes and seven reference guides: prompts, context, tools, agent architecture, feedback loops, retrieval and guardrails." — cut: the maintainer's inventory; the reader never acts on a guide by name — 25
- L118 "The VS Code extension adds:" — keep — 0
- L120 "**A sidebar** that sends any command to your editor's chat." — cut: repeats L29, where the reader chooses a route — 10
- L121 "`@maestro` in VS Code's chat, which runs a command … and logs each run in `.maestro/` for `/reflect`." — keep: how a VS Code chat user runs a command, and the condition the L59 row depends on — 0
- L121 "on the editor's chat model with your project context" — cut: the reader knows which model their own chat uses — 9
- L122 "**Zero-Defect mode**, a switch that adds the `/zero-defect` rules to every `@maestro` request and to `CLAUDE.md`." — keep: a warning that it edits their CLAUDE.md — 0
- L124 "`.maestro.md` plus" — cut: L39 already names this file — 2
- L124 "Maestro writes … session notes and logs in `.maestro/`." — keep: the only place that says where session notes are saved, which the reader needs to decide whether to commit them — 0
- L124 "The extension also writes the skills into each agent's folder (`.claude/skills/`, `.cursor/skills/` and eight more), its server entry into your MCP config, and the Zero-Defect rules into `CLAUDE.md` and Cursor's or Antigravity's rules file." — cut: a late repeat of L29, L112 and L122, plus the maintainer's list of paths. Two pieces must move, not go. "Cursor's or Antigravity's rules file" moves into L122. The MCP-config write moves into L29 if extension installers should be warned about it; only readers of the MCP section see it now — 34

**Contributing (L126–133)**
- L128 "Edit skills only in `source/skills/`." — keep: the one rule a contributor needs; "only" is the limit — 0
- L128 "The agent folders, the extension and the MCP server all build their copies from there." — cut: "only" already sets the limit, and the comment on L132 says it where the contributor acts — 15
- L130–133 `npm run check` and `npm run build` with their comments — keep: the contributor's actions — 0

**Conditions missing where the reader decides** (these are gaps, not cut/keep calls; for the writer):
1. L8 is where the reader checks whether Maestro fits their tool, and it does not mention the MCP route. A reader whose tool supports MCP but is not listed will leave before reaching L97. Evidence: purpose.md:24 quotes mcp-server/README.md:11, "for any MCP-compatible AI client".
2. The MCP route is not in the Install section (L15), and L97–99 never says when to choose it over skills. This reader "has not picked an install route yet" and may not know what an MCP server is (purpose.md:18).
3. L33 tells every reader to type `/teach-maestro` in their chat, but L121 suggests VS Code's chat runs commands through `@maestro`. I did not check whether a bare `/teach-maestro` works there. Hypothesis.
4. If `npx skills add` lets the reader choose which skills to install, `agent-workflow` is a prerequisite and belongs at L20, not L116. This comes from my memory of how the skills tool works; not checked. Hypothesis.

**Scope.** I judged the draft only against purpose.md section 2 and did not check any of its facts against the snapshot. Word counts are `wc -w` on each cut phrase; I did not count a leading comma as a word.
