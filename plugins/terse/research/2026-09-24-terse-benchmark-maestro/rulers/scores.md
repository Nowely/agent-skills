# Scores — reader test, README of sharpdeveye/maestro at 00f9115

The 28 answers in `out/readers/` were judged blind against `../key.json`: by label only, with nothing under `texts/` and no README opened. Each verdict follows the key's right_if and wrong_if. Q7 follows the coordinator's rule: an answer that says the documents do not state a version, or gives no confident version, is RIGHT, and a confident version is WRONG. PARTLY means the answer meets part of right_if, or meets it while also asserting a point from wrong_if. Where the key alone did not settle a quoted sentence, the sentence was checked against the snapshot's code.

## Verdicts

**Q1 — what Maestro does for LLM work**
- N — WRONG: it guesses an orchestration or evaluation tool and leaves library, framework or runtime open. It never says Maestro is guidance the coding agent follows; only "not embedded in the app" is right, and that as a hedged guess.
- P — RIGHT: agent skills whose commands the coding agent carries out on the prompts, context, tools, evaluation, retrieval and guardrails of the LLM app; not the runtime.
- Q — PARTLY: a skill layer for coding agents and not the app, but it never says what the skills work on (the LLM or agent workflow).
- R — RIGHT: commands and skills for the coding agent, on the prompts, context, tools, agents, retrieval, evaluation and guardrails of the workflow being built; not the app's runtime.

**Q2 — Codex CLI**
- N — WRONG: it does not know, and its best guess is that Maestro may not work.
- P — RIGHT: yes, through the skill files.
- Q — RIGHT: yes; its quote names `.codex/skills/`.
- R — RIGHT: yes, through skill files.

**Q3 — install for Claude Code in a terminal**
- N — WRONG: `npx maestro install` and `/plugin install maestro`, neither of which the code supports.
- P — RIGHT: `npx skills add sharpdeveye/maestro`, or copying `source/skills/` into `.claude/skills/`, or `claude mcp add maestro -- npx -y maestro-workflow-mcp`.
- Q — PARTLY: `npx skills add sharpdeveye/maestro` is right, but its manual alternative, `cp -r .claude/skills/ …`, copies a folder the repository does not contain (false sentence 2 below).
- R — RIGHT: `npx skills add sharpdeveye/maestro` in the project root.

**Q4 — first run and how to tell it worked**
- N — WRONG: `npm test` or `make test` and a passing-tests message; neither is Maestro's first run.
- P — RIGHT: /teach-maestro, the interview, and the answers saved as `.maestro.md` in the project root.
- Q — WRONG: /diagnose first, with no context step. Its quoted Quick Start ("Then use any command in your AI coding agent") leaves out the /teach-maestro step the commands require (source/skills/diagnose/SKILL.md:12). That is an omission, not a false sentence.
- R — RIGHT: /teach-maestro, with the answers saved as `.maestro.md` in the project root.

**Q5 — command for API timeouts and rate limits**
- N — WRONG: a "retry command", which does not exist.
- P — RIGHT: /fortify.
- Q — RIGHT: /fortify.
- R — RIGHT: /fortify.

**Q6 — what the VS Code extension writes, and when**
- N — WRONG: it guesses that nothing is written until a command is run or a prompt is accepted.
- P — RIGHT: skill files in the ten folders and an MCP entry at every activation, and zero-defect files on toggle. It leaves out the `.maestro/` logs, which only a full answer needs. Its MCP quote is false (sentence 3 below), but the verdict does not rest on it.
- Q — WRONG: it names only `.maestro/`, written "when you use the extension". It misses the skill files written into ten folders at every startup and the MCP config.
- R — RIGHT: skill files rewritten at every start, the MCP entry, zero-defect rules when switched on, and `.maestro/` logs when @maestro commands run.

**Q7 — minimum Claude Code version (planted, unanswerable)**
- N — RIGHT: it says it does not know, and its "best guess is Claude Code 1.0.33 or newer" is hedged, so it is not a confident version under the coordinator's rule. The key's own wrong_if ("names any Claude Code version") would make it WRONG. That would take N to 0 right and add 1 to each right-delta below.
- P — RIGHT: the document does not state one.
- Q — RIGHT: the document does not state one.
- R — RIGHT: the document does not state one.

## Right answers that rest on a false quoted sentence

None. Every RIGHT verdict rests on quotes that hold against the code.

## Quoted sentences that are false of the code

1. Q1-Q quotes "25 commands to diagnose, evaluate, refine, streamline, fortify, capture, reflect, and more". There are 24 commands. The 25th skill, agent-workflow, is `user-invocable: false` (source/skills/agent-workflow/SKILL.md:6), and only user-invocable skills become commands (mcp-server/src/prompts.ts:9). Level 3: the bundler's output in a scratch copy counts 24 invocable skills of 25.
2. Q3-Q quotes "If `npx skills add` doesn't work for your setup, copy the appropriate provider directory to your project root:". The provider directories are build output that git ignores (.gitignore:16-27). They are absent from the checkout, and they exist only after `npm run build` (scripts/build.js:72-80). Level 3: the snapshot has no `.claude/`, and the build in a scratch copy created it. This is false as quoted; the text around it, not seen here, could add the build step.
3. Q6-P quotes "A `maestro-workflow-mcp` server entry (`npx -y maestro-workflow-mcp@latest`) in each of `.vscode/mcp.json`, `.claude/mcp.json`, and `.agents/mcp.json` that exists, parses as JSON, and lacks the entry." The sentence is false where it limits the writes. When no file receives the entry, the extension writes `.vscode/mcp.json` holding Maestro's entry alone (maestro-extension/src/adapters/mcp-config.ts:66-75, 136-151). That covers three cases: no config exists, the config does not parse, or it already holds the entry. Depending on the case, it creates the file or overwrites it and drops the user's other servers. Level 3 under a stub of the VS Code API: all three cases ended with only `maestro-workflow-mcp` in `.vscode/mcp.json`.
4. Q6-Q quotes "`.maestro/` is created only when you run `/capture` or use the extension". The MCP server's `maestro_write_decision` tool also creates it (mcp-server/src/tools.ts:427-440 → packages/core/src/decisions.ts:85-89, 42-61). Level 2.

By label: Q quoted three false sentences, P one, R none.

## Table

| Question | N | P | Q | R |
|---|---|---|---|---|
| Q1 | WRONG | RIGHT | PARTLY | RIGHT |
| Q2 | WRONG | RIGHT | RIGHT | RIGHT |
| Q3 | WRONG | RIGHT | PARTLY | RIGHT |
| Q4 | WRONG | RIGHT | WRONG | RIGHT |
| Q5 | WRONG | RIGHT | RIGHT | RIGHT |
| Q6 | WRONG | RIGHT | WRONG | RIGHT |
| Q7 | RIGHT | RIGHT | RIGHT | RIGHT |
| right | 1 | 7 | 3 | 7 |
| partly | 0 | 0 | 2 | 0 |
| wrong | 6 | 0 | 2 | 0 |
| Δ right vs N | — | +6 | +2 | +6 |
| Δ partly vs N | — | 0 | +2 | 0 |
| Δ wrong vs N | — | −6 | −4 | −6 |

P and R both reach 7 of 7. At that ceiling, this ruler cannot tell P from R, but the false-sentence list above does.
