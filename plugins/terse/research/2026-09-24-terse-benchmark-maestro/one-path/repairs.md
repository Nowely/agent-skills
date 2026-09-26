# Repairs: draft.md → final.md

One line per finding: report | draft line | applied or declined | reason. Where critics disagree, the line names the one I followed. Every changed sentence was re-checked against the snapshot. Runs are in copies under `$TMPDIR/terse-bench-D-scratch` (the extension under a mock `vscode`, the MCP server over stdio). Counts: 60 applied, 11 declined; 6 lines with no finding are not counted.

1. form | L3 | applied | Opens with the job (audit, fix, harden, speed up), then "24 slash commands". Followed form over rules.md, which let rule 4 pass: rule 4 asks for the mission, not a definition.
2. form | L34–37 | declined | Each route stays one bullet with a second sentence. The rationalizer asked for the `.vscode/mcp.json` loss to move into the extension line, and the MCP line has to say how the commands arrive. Followed the rationalizer.
3. form | L37 | declined | `npx -y maestro-workflow-mcp` is a setting the app runs, not a command the reader types. Rule 8 keeps other routes to one bullet, and the linked npm page has the config blocks.
4. form | L18, 26 vs 87–88 | applied | The core-skill loading order is gone from Quick start and now lives only in How it works. `.maestro.md` stays in Quick start, because rule 7 asks what the first command returns.
5. form | L95 | applied | The site link is no longer a bare sentence inside How it works' bullet list.
6. form | L95 | applied | The link has its own "Documentation" section before Contributing, the genre's tail order.
7. rationalizer | L5 | applied | Cut "and every command ends with the one to run next"; truth-1 refuted it too. The lead is now carried by `/fortify` suggesting `/evaluate`, fortify's own next step.
8. rationalizer | L18 | applied | Cut the `--skill '*'` gloss. This also removes the false "every command loads the core one first" (rules, truth-1).
9. rationalizer | L26 | applied | Now "It interviews you and saves your answers as `.maestro.md`." Line 6 already says what the interview records.
10. rationalizer | L45 | applied | Cut "from 1 to 5" from the `/diagnose` row; Quick start gives the scale.
11. rationalizer | L57 | applied | Cut "eight".
12. rationalizer | L82 | applied | Cut "to `.maestro/sessions/`"; How it works names `.maestro/`.
13. rationalizer | L87 | applied | Cut the seven reference names; "seven reference guides" stays.
14. rationalizer | L90 "25 SKILL.md files" → "skills" | declined | The extension writes SKILL.md only, not the core skill's references (truth-3 item 6; my run showed no `reference/` directory). "skills" would claim more than it writes. Followed truth-3.
15. rationalizer | L90 folder names | applied | Now "the skill folders of ten coding tools". This also drops terms' ambiguous "agent folders".
16. rationalizer | L91 | applied | Cut "sends any command to chat" from the Zero-Defect line. Where the sidebar sends commands in VS Code is said once, in the `@maestro` line, because it explains truth-2's one-reply limit.
17. rationalizer | L92 | applied | The six command names are now "six of the commands".
18. rationalizer | L93 "24" | applied | Cut.
19. rationalizer | L93 tool list | applied | Cut. Now "ten tools, listed on [npm]"; this also fixes rules' and truth-3's count mismatch.
20. rationalizer | L99 | applied | Cut the bundling sentence; this also removes truth-3 item 6's overstatement. "From the repository root:" says where to run the block.
21. rationalizer | L102 | applied | Cut "from source/skills/"; the comment was rewritten per truth-3 item 4.
22. rationalizer | L90 (keep and move) | applied | The extension route line now says it "rewrites `.vscode/mcp.json` to hold only its own server". The exact trigger stays in How it works (truth-3 item 2).
23. rationalizer | L91 (turning the mode off leaves the rules) | declined | That is a defect, not a behaviour to document. The text says only what turning the mode on writes; the defect was reported to the owner.
24. rationalizer | L92→L47 (/reflect has no audit data) | applied | The row says less instead of adding a caveat (rule 21): it no longer promises cost and time. It builds a scorecard from "Maestro's command history", and the `@maestro` line says who keeps the audit log.
25. rationalizer | L8 (outside its lens) | applied | Line 8 adds "a server for apps like Claude Desktop", with no protocol name in the opening (rule 6).
26. rules | L37 rule 3 | applied | The route is now "Claude Desktop and other MCP apps", anchoring MCP to an app the reader knows. "MCP" stays because only apps that speak it can use the route.
27. rules | L18 rule 12 | applied | The loading order is out of Quick start.
28. rules | L93 rule 20 | applied | The list that named fewer than ten tools is cut; the count links to npm's table.
29. rules | L18 vs L87 rule 20 | applied | The unnarrowed "every command loads the core one first" is gone. How it works says "Every command but `/teach-maestro`".
30. terms | L57 "the agent" | applied | Now "Tells your coding tool to follow…". "agent" now means only what the reader builds.
31. terms | L93 "tools" → "operations" | declined | The linked npm page and the reader's MCP app both call them tools. "ten tools, listed on npm" names what the reader will see there.
32. terms | L37, L93 "prompts" | applied | Now "prompt templates", the npm page's own words.
33. terms | L93 "references as resources" | applied | Now "the core skill and its references as documents to read".
34. terms | L93 "read the project context" | applied | Cut with the tool list.
35. terms | L47, L93 "logs" | applied | Now "Maestro's command history in `.maestro/`"; "read the logs" was cut.
36. terms | L8 etc. "skill files" → "command files" | declined | The installer prints "Found 25 skills", and the reader's tools list them as skills; renaming them would contradict what the reader sees. "Skill files" became "Skills".
37. terms | L37 "Any MCP client" / "a server" / "setup for each client" | applied | Now "Claude Desktop and other MCP apps", "add a server entry" and "[setup]". Not "your tool", because only apps that take MCP servers can use this route.
38. terms | L87 `agent-workflow` slug | declined | Followed the rationalizer: the installer lists the core skill by that name and it sits in the reader's skills folder. It is never typed, so the slug is how they will recognise it.
39. terms | L3, L20 "agent" vs "tool" | applied | The reader's assistant is "your (AI) coding tool" throughout; "agent" is kept for agents they build.
40. terms | L92, L93 "checked phases" / "phased runs" | applied | "phased runs" went with the MCP tool list; "checked phases" is the only name left.
41. task1 | npx's install prompt | declined | The reader knows npx; explaining its package prompt explains their own tool (rule 2).
42. task1 | "is Quick start the Claude Code route?" | applied | Quick start now opens "For any of the nine coding tools above". task1's GitHub install printed "Found 25 skills … Installing all 25 skills", which confirms line 15's GitHub form; I was not allowed to run that myself.
43. task1 | `.agents/skills` plus symlinks | declined | Where the installer keeps its files is noise for this reader (rules 3 and 15).
44. task1 | list of promises it could not check | no finding | The behaviour claims stay at the instruction level they were checked at. The update line was run on a local source.
45. reader-Q3 | L12–16 | no finding | Answered from Quick start.
46. reader-Q4 | L20–26 | no finding | Answered from Quick start.
47. reader-Q5 | L56 | no finding | Answered from the table.
48. reader-Q6 | L90–92 | no finding | Answered from How it works.
49. truth-1 | L5 "maps each gap" | applied | Now "`/diagnose` recommends its fixes as commands to run" (diagnose:97, 109–110).
50. truth-1 | L5 "every command ends with the next" | applied | Cut (see 7).
51. truth-1 | L6 "every command after it reads them first" | applied | Now "the other commands tell your coding tool to read them first". How it works says that `@maestro` sends only the matching sections instead (my run: `/refine` got 1 of 5 sections).
52. truth-1 | L18 | applied | Cut (see 8).
53. truth-1 | L32 | applied | Now "recommends a command for each fix. Start with the one for your lowest score." (diagnose:132)
54. truth-1 | L37 "Any … arrive as prompts" | applied | Re-run: `prompts/get` without `arguments` fails with -32602; with `{}` it works. The line now says the server lists the commands as prompt templates and returns any command's instructions through a tool.
55. truth-1 | L37 "setup for each client" | applied | Now "[setup]", with no claim that every client is covered.
56. truth-1 | L36 (Cursor and Antigravity vs the Marketplace link) | applied | Added the Open VSX link; its API returns `sharpdeveye/maestro-workflow` 2.0.1. The page URL follows Open VSX's pattern; the page itself was not opened.
57. truth-1 | L36 (the gaps in "writes the skills") | applied | The `.vscode/mcp.json` rewrite joins the route line. How it works keeps "SKILL.md files", which signals that the references are not written.
58. truth-2 | finding V (`@maestro`: one reply, no tools, no earlier turns) | applied | Stated once in How it works. Re-run: the history marker never reached the model, options were `{}`, and `/teach-maestro` through `@maestro` wrote no `.maestro.md`.
59. truth-2 | L57 | applied | Now "Tells your coding tool to follow … for the rest of the session".
60. truth-2 | L65 | applied | Now "after asking whether one agent was tried and failed".
61. truth-2 | L47 | applied | Dropped the cost and time claim (see 24).
62. truth-2 | L77 | applied | Handled once, not per row: the `@maestro` line says it prints files instead of writing them. Per-row caveats would add eight qualifications (rule 21).
63. truth-2 | L82 | applied | Same as 62.
64. truth-2 | L83 | applied | Same as 62.
65. truth-2 | L46 | applied | Same as 62.
66. truth-2 | L70 | applied | Same as 62.
67. truth-2 | L64 (chain omits "iterative") | declined | The cell names kinds of chains, not all of them; a fourth kind is not what the reader chooses by.
68. truth-2 | L82 (capture also records issues and a decision entry) | declined | The row does not claim a full list. The decision entry is in How it works' "What the skills write".
69. truth-3 | L87 | applied | Now "starts by telling your coding tool to load it and read `.maestro.md`". The `@maestro` line says it sends the command without the core skill (my run: the core text was never sent).
70. truth-3 | L90 trigger | applied | Now "On a start where it adds it nowhere, normally every start after the first", which is the code's own condition (mcp-config.ts:47-75). Re-run:
    - a commented `.vscode/mcp.json` was replaced at start 1;
    - a start that added the entry to a new `.agents/mcp.json` skipped the rewrite, and the next start did it;
    - `.cursor/mcp.json` is never touched, so the three files are now named.
71. truth-3 | L92 "logs each command" | applied | Now "keeps an audit log and a decision log in `.maestro/`", with no "each".
72. truth-3 | L102 | applied | Now "wipes and refills skills/ in all ten tool folders". Re-run: `.claude/settings.json` and `.cursor/rules/x.mdc` survived; `.claude/skills/mine` did not.
73. truth-3 | L103 | applied | Now "checks frontmatter for name: and description:, and (reference/…) links". Re-run: a missing `name` and a broken `(reference/…)` link failed; a broken `(./reference/…)` link passed.
74. truth-3 | L99 (bundling overstated for the extension) | applied | Sentence cut (see 20).
75. truth-3 | L88 (`/calibrate` also writes `.maestro.md`) | applied | Now "/calibrate adds your conventions to it" (calibrate:56).
76. truth-3 | L93 (`maestro_init` missing from the list) | applied | The list was cut (see 19).
77. truth-3 | seen in passing (Zero-Defect off, MCP build, template, dead setting) | no finding | None of these is a claim of the text. They are defects, already reported to the owner.

## Budgets

`budgets.json` holds the revised plan in raw `wc -w` words: opening 140, Quick start 165, Commands 590, How it works 255, Documentation 10, Contributing 45. The final counts 138, 161, 588, 252, 6 and 42, for 1,200 in all; the draft was 1,169 by the same count.

How it works grew by about 50 words over the first plan's 200 (prose basis). The cuts took about 120 words, but the truth fixes had to be stated somewhere:
- `@maestro` gets no tools and no earlier turns;
- the exact `.vscode/mcp.json` trigger;
- the three config files by name;
- the Open VSX link;
- the Documentation heading.
