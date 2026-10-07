# Roles for research and feedback runs

Roles this repository's research runs and `/entrust:prepare-feedback` use beside orchestrate's
[roles](../plugin/skills/orchestrate/references/roles.md). They left the installed table because no other
plan uses them.

| Role | What it does | May write | Returns | Spawn it when | Tier |
|---|---|---|---|---|---|
| page dry run | walks one scenario through a plugin's pages as written, step by step, running nothing: the words to read, the coordinator's calls, the agents and the user's stops before the first action, and the step where a literal run halts | nothing | the steps with those counts, each with the page line it follows, and the step where the run halts | a report on how the pages drive a coordinator, one per scenario, when analysing session feedback | strong |
| recognition reader | a blind read of a frozen artifact; ranks or recognises | nothing | ranks or recognitions | a wording decision needs a measurement | cheap or bulk |
| retrospective analyst | a ledger of the coordinator's decisions and their consequences, from traces fixed by path and digest, each incident with its trace address, and `unknown` where the trace has none | its ledger in a temporary file | incidents with traces | a retrospective | strong |
