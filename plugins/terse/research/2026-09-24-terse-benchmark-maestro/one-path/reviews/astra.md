<!-- Codex Astra, briefs/review-astra-2.codex.txt, on a copy of 02-repaired.md; 26 s; 34358 tokens; commands: "pwd; rg --files -g 'AGENTS.md' -g 'README.md' -g '"'!node_modules'"' -g '"'!vendor'"'" | 'cat README.md' -->

This README is clear and useful as an introduction and command reference, but weaker as an installation guide. Its strongest features are the concrete opening, short quick start, and command tables that explain when to use each command. The advertised 24 commands match the tables; the additional core skill explains the 25 skill files.

The main issues are:

1. A significant configuration risk deserves more prominence. The README says the extension can rewrite .vscode/mcp.json to contain only Maestro’s server, including on subsequent starts. It discloses this behavior, but should explicitly explain that existing server entries can be lost and put that warning before the installation links.

2. The installation routes have materially different capabilities. The opening promises auditing and fixing workflows, but the “How it works” section says VS Code’s @maestro receives no tools or earlier turns and prints plans and files instead of applying them. Readers need this distinction where they choose an installation route.

3. Setup leaves practical questions unanswered. It does not state prerequisites, explain how to verify successful installation, or offer troubleshooting if slash commands do not appear. It also names nine coding tools initially but later refers to ten tool folders without explaining the difference.

4. Some commands are difficult to distinguish. In particular, /streamline and /temper both remove unnecessary complexity. A brief example showing which to choose would improve the otherwise helpful reference.

5. The quick start would benefit from one small worked example: a workflow problem, a sample /diagnose finding, and the next command. This would make the promised value more tangible.

The contributing section is concise and actionable, especially its instruction to edit source/skills/ and its explanations of build and check.

Overall, the writing is strong. The highest priority is making installation consequences and route limitations clear before users commit to a setup. This assessment concerns the README’s content; implementation accuracy and linked resources were not verified.
