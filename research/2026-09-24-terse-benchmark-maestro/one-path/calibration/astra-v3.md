<!-- Codex astra, calibration/prompts/astra-v3.codex.txt; 21 s; 32130 tokens; commands: 'cat /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/visit/v3/README.md' -->

1. The opening was pleasant because it explained what I would actually get: “Each command is a Markdown instruction set that the agent carries out on your project — what to check, what to change, how to report, and which command to run next.” The quick start gave me a clear first result: “Run `/diagnose`. It scores the workflow on five dimensions, lists the critical findings, and names the command that fixes each gap.”

It became tiring in the command catalog. “Makes a working workflow handle harder cases through better prompts, tools, context, or models.” is broad enough that I struggled to distinguish it from neighboring commands. By the MCP tools and waves sections, I was reading a reference manual before seeing a concrete example of an improved workflow.

2. Maestro is a collection of instructions, available as skills, an MCP server, or an editor extension, for developers using coding agents to build and improve LLM applications.

3. Yes, I would try the skills and run `/diagnose`: the installation and first steps are clear, and the checks concern problems I work on. Whether its recommendations are useful remains unknown without an example. I would avoid the extension after reading: “That happens when none of the files exists, but also on every startup after the first and whenever `.vscode/mcp.json` contains comments; any other servers in that file are then lost.” That disclosure is helpful, but the behavior undermines confidence.

4. Replace the long middle reference material with one worked example immediately after the quick start: a small LLM workflow, an actual diagnostic finding, the suggested command, and the resulting change. Link out to the complete command and integration references. That would make the benefit concrete and give the page a more satisfying progression.

PLEASANT: 6
