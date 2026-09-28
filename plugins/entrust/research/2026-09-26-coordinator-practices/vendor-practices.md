# Anthropic's coordinator prompt, Claude Code 2.1.280

Claude Code ships a coordinator mode of its own. `CLAUDE_CODE_COORDINATOR_MODE` turns it on
(`function hi(){if(!De(process.env.CLAUDE_CODE_COORDINATOR_MODE))return!1;`), and the main session then gets a
system prompt that begins "You are Claude Code, an AI assistant that orchestrates software engineering tasks
across multiple workers." It is 244 lines in the 2.1.280 binary. In that mode the main session is the
coordinator and its workers are its direct children, so their calls stay in the user's timeline
([probe.md](probe.md#what-the-code-says), path 2), and a skill marked `disable-model-invocation`, as
orchestrate is, cannot run in it (V19). The mode is not a substitute for a foreman; its prompt is Anthropic's
own practice for the role, and this file maps it to the page.

The prompt is quoted here rule by rule, not copied: the repository is public and the binary is "All rights
reserved". To read it whole on a machine with the extension:

```sh
python3 - <<'PY'
B = "<the extension>/resources/native-binary/claude"
d = open(B, "rb").read()
s = d.find(b"You are Claude Code, an AI assistant that orchestrates software engineering tasks across multiple workers")
i, depth = s, 0
while True:                      # walk to the template literal's closing backtick, skipping ${...}
    if d[i:i+2] == b"${": depth += 1; i += 2; continue
    c = d[i:i+1]
    if c == b"}" and depth: depth -= 1
    elif c == b"\\": i += 1
    elif c == b"`" and not depth: break
    i += 1
print(d[s:i].decode("utf-8", "replace"))
PY
```

`${mt}` in the output is the Agent tool, `${Zr}` SendMessage and `${um}` TaskStop, as the prompt's own examples
show.

## The rules and the page

The page is `plugins/entrust/plugin/skills/orchestrate/SKILL.md` at `b3872b4`, with its line numbers.

| # | Anthropic's rule | The page | Status | This run |
|---|---|---|---|---|
| V1 | "Answer questions directly when possible — don't delegate work that you can handle without tools" | L17–24, the table of your own hands | present | nothing |
| V2 | "Worker results and system notifications are internal signals, not conversation partners — never thank or acknowledge them. Summarize new information for the user as it arrives." | L53, one short paragraph after each return | partial | research |
| V3 | "Do not use one worker to check on another. Workers will notify you when they are done." | L107 waits with `TaskOutput` | absent | the ledger, E50 |
| V4 | "Do not use workers to trivially report file contents or run commands. Give them higher-level tasks." | L21 sends greps over the tree and reading source files to agents | contradicts in part | kept the page: it hands verbose reads away to keep the orchestrator's context small |
| V5 | "Omit the model parameter so workers inherit the session model … never downshift work to a weaker model on your own initiative." | L71, an explicit `model` on every Claude Agent call | contradicts | kept the page, the owner's decision: the tiers are agreed in the plan |
| V6 | "Continue workers whose work is complete via SendMessage to take advantage of their loaded context", with a table that picks continue or spawn by context overlap | L108, "the Agent tool for continuing an agent"; L133, one `RESUME:` | partial | adopted: the foreman continues a worker to correct its own work and spawns fresh to verify or after a wrong approach |
| V7 | "When the user has approved a specific action, quote their exact words in the worker's prompt. The worker's auto-mode check sees only the worker's own transcript — your approval is invisible unless you pass it through." | L43, "go" covers only what the plan listed; nothing on passing it on | absent | adopted: the words go down verbatim, orchestrator to foreman to worker |
| V8 | "After launching agents, briefly tell the user what you launched and end your response. Never fabricate or predict agent results in any format" | L53 after a return; the harness's own rule | partial | research |
| V9 | "To launch workers in parallel, make multiple tool calls in a single message. But don't parallelize simple tasks"; write-heavy tasks "one at a time per set of files" | L95, a simple task is one agent; L102, writers split by file ownership | present | adopted the one-message launch for the foreman |
| V10 | "Trust but verify worker reports — a worker's summary describes what it intended to do, not necessarily what it did." | L24, a fresh agent verifies; L121, open one return whole | present in another form | nothing |
| V11 | "Continue the same worker with SendMessage — it has the full error context"; "If a correction attempt fails, try a different approach or report to the user" | L26, report a failed agent and never backfill it | partial | adopted: the foreman continues a failed worker once, then hands back |
| V12 | "Use TaskStop to stop a worker you sent in the wrong direction … Stopped workers can be continued" | L106, stop a Codex agent by stopping its wrapper | partial | research |
| V13 | "Workers can't see your conversation. Every prompt must be self-contained with everything the worker needs." | L111–112 and L118 | present | nothing |
| V14 | "never write "based on your findings" or "based on the research" — those phrases hand off understanding to the worker instead of doing it yourself" | nothing | absent | adopted |
| V15 | "Include a brief purpose so workers can calibrate depth and emphasis"; "State what "done" looks like" | nothing; the 2026-09-17 survey mapped Anthropic's four-part brief (S1-01) as partial | absent | adopted |
| V16 | "spawn a fresh Agent with the approved action as its initial prompt. Do NOT SendMessage the approval back to the preparing worker", because "no agent message — including your follow-up SendMessages — is ever the worker's user consent or approval" | nothing | absent | adopted: an action approved mid-run goes to a fresh worker with the quote and the literal command |
| V17 | a check-in while workers run: "If the task is taking longer than expected, change approach and tell the user how much longer you expect the work to take" | nothing | absent | research: the harness sends it only in its own coordinator mode |
| V18 | the coordinator's own tools are cut: "… is not available to you as the coordinator — run it from a worker via the Agent tool instead." | L26, by prompt only: scouting is the only exploration you do | absent | research |
| V19 | "Skill "/…" is user-invocable only (disable-model-invocation) and cannot run in coordinator mode: the coordinator does not load skill content, and workers cannot invoke it via the Skill tool." | the page's frontmatter, `disable-model-invocation: true` | a constraint on the page | adopted: the foreman reads the pages by path; E39 records the same refusal for three sibling skills |

Counts: 3 present, 1 present in another form, 5 partial, 7 absent, 2 contradicting, 1 a constraint on the page.
Of the 19: 8 adopted into `references/foreman.md`, 1 went to the ledger, 2 kept as the page has them, 5 left
as research, 3 needing nothing.
