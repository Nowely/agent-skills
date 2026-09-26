# Rationalizer: draft.md for the reader in purpose.md

Draft: 1,169 words (`wc -w`). The cuts below save **123 words** net (10.5 %). Line numbers are the draft's.

## Cuts

| Line | Words | Verdict and reason | Saved |
|---|---|---|---|
| 5 | "and every command ends with the one to run next" | cut: restates the bold lead; the `/diagnose` half stays as its evidence | 10 |
| 18 | "`--skill '*'` installs all 25 skills together; every command loads the core one first." | cut: the reader copies the command as it is, so the flag needs no gloss; line 87 carries the dependency | 14 |
| 26 | "asks about your models, workflow, quality checks, constraints and priorities, one section at a time," → "interviews you" | cut: line 6 already says what the interview records, and the pace shows at the first question | 13 |
| 45 | "from 1 to 5" | cut: line 32 gives the scale, and the scale does not separate `/diagnose` from `/evaluate` | 4 |
| 57 | "eight" | cut: the count does not affect the choice, and counts drift in this repo (package.json:4 still says "21 commands") | 1 |
| 82 | "to `.maestro/sessions/`" | cut: `/recap` finds the file itself (recap/SKILL.md:20); line 88 names `.maestro/` | 2 |
| 87 | ": prompt engineering, context management, tool orchestration, agent architecture, feedback loops, knowledge systems, guardrails" | cut: the reader acts on none of the seven names; the npm page lists them (mcp-server/README.md:94-105) | 13 |
| 90 | "25 `SKILL.md` files" → "skills" | cut: an internal file name, plus a third count the reader has to square with 24 | 2 |
| 90 | "(`.agents`, `.claude`, `.cursor`, `.gemini`, `.codex`, `.kiro`, `.trae`, `.trae-cn`, `.opencode`, `.pi`)" | cut: the reader weighs "ten folders", not their names; the Marketplace page lists them (maestro-extension/README.md:52) | 10 |
| 91 | "sends any command to chat and" | cut: line 36's "command sidebar" already says it | 6 |
| 92 | "`/diagnose`, `/evaluate`, `/fortify`, `/refine`, `/chain` and `/compose`" → "six commands" | cut: the reader types `@maestro` with any command, and knowing which six run in phases (wave-engine.ts:49-61) changes nothing they type | 5 |
| 93 | "24" | cut: no decision is made here; the table holds the set | 1 |
| 93 | ": list and run commands, read the project context, step through phased runs, read the logs and add to the decision log" | cut: the MCP reader configures the server, not its tools; line 37 links the npm page's tool table (mcp-server/README.md:73-86) | 21 |
| 99 | "The extension and the MCP server bundle that folder when they build, and the root scripts work from it:" | cut: this is the maintainer's view of the build; the contributor acts on "nowhere else", and the comment on line 102 carries the consequence | 19 |
| 102 | "from source/skills/," | cut: repeats the path from line 99 | 2 |
| | | **Total** | **123** |

## Keeps that carry a condition, a limit or a warning

| Line | Words | Verdict and reason |
|---|---|---|
| 12 | "From your project folder:" | keep: says where to run the install, next to the command |
| 18 | "To update, run the same command again." | keep: the one update line, which the reader needs once, later |
| 26 | "saves the answers as `.maestro.md`. Run it once per project." | keep: what comes back and how often, at the point where the reader acts |
| 57 | "for the rest of the session" | keep: the limit a reader weighs before invoking `/zero-defect` |
| 65 | "after checking one agent really fails" | keep: warns that `/compose` may decline to design several agents |
| 90 | "from the second start on it rewrites `.vscode/mcp.json` with Maestro's entry alone" | keep, **and move it to line 36**, where the reader chooses the extension: it deletes the reader's other servers in that file. Proven at level 3 on unmodified copies of mcp-config.ts and editor.ts, run with a `vscode` stub by /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/rationalizer-sim/run.mjs: after the first start the file held `my-own-server` and `maestro-workflow-mcp`, after the second only `maestro-workflow-mcp`. That this runs on every activation is read from extension.ts:42, not run. No other page says it |
| 90 | "On every start it writes [the skills] into ten agent folders in your workspace and adds its MCP server to the workspace's MCP config" | keep: side effects the reader weighs before installing; the MCP-config write is on no other page |
| 91 | "Turning that on writes the precision rules into `CLAUDE.md`, and also into `.cursorrules` in Cursor or a rule file in Antigravity." | keep: names the reader's own files that the toggle edits. `CLAUDE.md` is written in every editor (extension.ts:91). The same run showed that turning the mode off leaves the rules in a `CLAUDE.md` that held nothing else (editor.ts:68-74), which the draft does not say |
| 92 | "adds the precision rules to every request while Zero-Defect is on" | keep: the only statement of where the mode takes effect in VS Code, namely `@maestro` requests (participant.ts:57-63) |
| 92 | "and logs each command under `.maestro/`" | keep, **and state the limit it implies at line 47**: `/reflect` reads `.maestro/audit.jsonl` (reflect/SKILL.md:22-25), and only `@maestro` writes that file (participant.ts:317 is the only `appendAudit` call; mcp-server/src/tools.ts:521 says so too). A reader who installed by the Quick start route and runs `/reflect` has no audit data. Level 2: read, not run |
| 102 | "deleting what was in them" | keep: the warning sits on the command that deletes (build.js:77) |

## Other keeps

| Line | Words | Reason |
|---|---|---|
| 1 | "# Maestro" | the name |
| 3 | whole | states the job in the reader's words and lets them test the fit; "24" gives scale at that decision and matches the table's 24 rows |
| 5 | bold lead, "`/diagnose` maps each gap it finds to a command" | the advantage and its one piece of evidence |
| 6 | whole | an advantage, and the only statement of what the interview records, which the line 26 cut relies on |
| 7 | whole | the differentiator; two commands show a stance across the set rather than one command's feature |
| 8 | whole | the list the reader scans for their tool |
| 10, 14–16, 20–24, 28–30 | heading, install block, "Then, in your agent:", both command blocks | the Quick start itself; "Then, in your agent:" marks the switch from shell to agent |
| 32 | whole | what the first command returns, and the next action |
| 34–37 | "Other routes" and both route lines | one line per route: what it gives, the command or the name to search for, and a link for depth; "the commands arrive as prompts" tells the MCP reader where to find them |
| 39–83 | headings, header rows, every cell not cut above | the lookup the purpose requires: "What it does" separates neighbours (`/fortify` and `/guard`; `/streamline`, `/temper` and `/accelerate`), and "Use it when" is what the reader searches by; the four headings are the extension sidebar's own groups (maestro-extension/README.md:20) |
| 85, 87 (rest), 88 | "One core skill. `agent-workflow` holds the principles, a checklist of common workflow flaws and seven references. Every command except `/teach-maestro` loads it and reads `.maestro.md` before it starts." and the "What the skills write" line | explains why `/teach-maestro` comes first; gives the name the reader will see in their skills folder (the skill is `user-invocable: false`, so it is never typed); the one line on what the skills write |
| 89, 93 (rest) | "The extension."; "The commands as prompts, the core skill and its references as resources, and ten tools" | what each route adds to the reader's agent |
| 95 | the maestroskills.dev link | required by the purpose |
| 97–103 (rest) | "Skills live in `source/skills/`; edit them there and nowhere else." and both commands | the one instruction the purpose requires for contributors, and the two commands they run |

## Outside this lens, not counted

- Line 8 names nine tools and VS Code but not the MCP route, so a reader whose tool is missing from the list only learns at line 37 that Maestro fits it.
