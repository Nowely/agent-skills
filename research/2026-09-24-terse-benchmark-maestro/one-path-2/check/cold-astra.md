<!-- Codex Astra; 28 s; 29282 tokens; commands: /bin/zsh -lc 'cat /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/readme-review -->

1. The opening clearly explains the audience and purpose, although “hold up in production” promises more than the README demonstrates.
Quote: “**Maestro** helps you build LLM apps and agents that hold up in production. It gives your coding tool 24 slash commands. Together they check your prompts, context, tools and agent design, fix what is weak, and add what is missing.”

2. The first-run explanation is strong: readers learn what setup collects, where it saves the answers, and why that matters.
Quote: “It asks about your models, workflow, quality checks, constraints and priorities. Then it saves your answers to `.maestro.md` in your project. The other commands read this file first.”

3. The command tables help readers choose an action by describing concrete situations, rather than merely listing features.
Quote: “| `/accelerate` | Cuts latency, cost and tokens | Your app is too slow or too expensive |”

4. Installation is concise but underspecified. The README gives no Node.js/npm prerequisites or supported versions alongside its installation command.
Quote: “npx skills add sharpdeveye/maestro”

5. The diagnosis workflow is actionable, but naming the five areas and showing sample output would make its results easier to anticipate and interpret.
Quote: “It scores five areas from 1 to 5, lists the most serious findings and names the commands to run. Start with the one for your lowest score.”

6. The extension’s automatic changes are disclosed clearly. Explaining whether existing files are merged or overwritten, and how to disable this behavior, would improve reader confidence.
Quote: “Cursor and Antigravity get it from Open VSX. Each time you open a project, the extension writes Maestro's command files into it for every supported coding tool.”

7. The implementation explanation gives readers a useful, concrete understanding of what commands actually are.
Quote: “Each command is a skill: a Markdown file of instructions your coding tool follows. All but `/teach-maestro` tell it to load the core skill first. The core skill holds Maestro's principles and a checklist of common mistakes. It also holds seven reference guides: prompts, context, tools, agent architecture, feedback loops, retrieval and guardrails.”
