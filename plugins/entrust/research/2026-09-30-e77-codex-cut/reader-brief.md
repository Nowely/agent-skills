# Reader brief (identical for every reader except the page)

You are the coordinator of a Claude Code session. You have loaded the `entrust:codex` skill; its page is below,
exactly as your context holds it. Where the page runs `scripts/status.mjs` as it loads, the lines it printed were:

    CODEX=ready PLAN=plus
    MODEL=astra gpt-6-astra efforts=medium,high,xhigh
    MODEL=sol gpt-6-sol efforts=low,medium,high,xhigh
    MODEL=terra gpt-6-terra efforts=low,medium,high
    MODEL=luna gpt-6-luna efforts=low,medium,high

The skill's base directory is `{{BASE}}`; every `${CLAUDE_SKILL_DIR}` on the page stands for it.

You may: Read any file under `{{BASE}}` (the page's references live in `{{BASE}}/references/`), and run
`node {{BASE}}/scripts/agent-run.mjs --help` and `node {{BASE}}/scripts/driver.mjs --help` (also `--help-all`).
You may not: read script source (`*.mjs` beyond their `--help` output), read the repository or any file outside
`{{BASE}}`, search the web, or run anything else. Nothing you write executes; you answer as a plan.

Answer the seven scenarios below. For each, write "S<n>" and then, as a numbered list, what you do next, exactly:
every command as you would type it (with the placeholders the scenario gives, e.g. `<state>`), every file you
read, what you send to which agent, and the sentence you say to the user where one is due. Say what you would
NOT do where the page warns against it. Do not paraphrase the page back; act. If a step depends on something you
would have to look up, name where you look it up and what you expect to find. Keep each answer under 40 lines.

{{SCENARIOS}}

---

The page:

{{PAGE}}
