# The nesting probe, 2026-09-26

Session `3a3ed58f`, the Cursor extension `anthropic.claude-code-2.1.280-darwin-arm64`, the main session on
Opus 5.5. Three Haiku agents, launched on the owner's "Давай сейчас попробуем вызвать внука" after the count
and the models were announced.

## The launch

The main session made one Agent call: `description: "Probe coordinator: nested agents"`,
`subagent_type: "general-purpose"`, `model: "haiku"`, `run_in_background: true`, and this brief:

```text
You are a probe coordinator. Your only job is to launch two nested subagents with the Agent tool and report what happened. Do not run Bash, Read or any other tool yourself. If you have no Agent tool, reply "no Agent tool" and stop.

Step 1. Call the Agent tool once with:
- description: "Probe grandchild BG"
- subagent_type: "general-purpose"
- model: "haiku"
- run_in_background: true
- prompt: "Run these two Bash commands as two separate Bash calls, in this order: `echo NESTPROBE-BG-1` then `echo NESTPROBE-BG-2`. Then reply with exactly the two output lines and nothing else."

Step 2. Right after step 1 returns, call the Agent tool once with:
- description: "Probe grandchild FG"
- subagent_type: "general-purpose"
- model: "haiku"
- run_in_background: false
- prompt: "Run these two Bash commands as two separate Bash calls, in this order: `echo NESTPROBE-FG-1` then `echo NESTPROBE-FG-2`. Then reply with exactly the two output lines and nothing else."

Step 3. Reply with exactly four lines:
1. BG launch: the first 120 characters of what the step-1 Agent call returned, or the error text.
2. FG result: what the step-2 Agent call returned, or the error text.
3. BG result: the background worker's reply if it reached you before you answer, and how it arrived (notification, message, other); otherwise "not received".
4. Errors or refusals: any tool error you saw, else "none".

Do not wait or poll for the background worker. Do not retry a failed call; report the error instead. Never quote an agent id.
```

## The transcripts

All three are flat in the session's `subagents/` directory
(`~/.claude/projects/-Users-user-Git-agent-skills/3a3ed58f-7e2a-431f-be65-5910bff7d130/subagents/`), each with
`isSidechain: true` and `version: 2.1.280`. Times are UTC.

| Time | Coordinator `abae31c4` | Background grandchild `a811873b` | Foreground grandchild `ae346dea` |
|---|---|---|---|
| 20:15:23 | brief received | | |
| 20:15:27 | Agent call, `run_in_background: true` | | |
| 20:15:30 | result "Async agent launched successfully" | brief received | |
| 20:15:33 | Agent call, `run_in_background: false` | | |
| 20:15:35 | | `echo NESTPROBE-BG-1` | |
| 20:15:36 | | | brief received |
| 20:15:38 | | `echo NESTPROBE-BG-2` | |
| 20:15:39 | | | `echo NESTPROBE-FG-1` |
| 20:15:41 | | SubagentHandback | `echo NESTPROBE-FG-2` |
| 20:15:43 | | the harness asks for a visible response | text; the harness: "[handback-send-enforce] Your report has not been delivered" |
| 20:15:45 | | | SubagentHandback |
| 20:15:46 | a queued task-notification for the background grandchild | text, the two lines | |
| 20:15:49 | a queued agent-message carrying the background report; the foreground call returns "This agent's report was delivered to you as a message" | | text, the two lines |
| 20:15:55 | SubagentHandback with the four lines | | |
| 20:15:58 | the harness asks for a visible response | | |
| 20:16:02 | text, the four lines again | | |

The coordinator's report named the background result as "received via agent-message notification from
background task after FG launched". The line could have been guessed from the brief, so the queued
agent-message in its transcript is the evidence, not the report. The main session received the coordinator's
report as a message, then its completion notification: 23,927 tokens, 3 tool uses, 39,178 ms. Nothing from
either grandchild reached the main session.

## What the owner saw

Five screenshots of the timeline, from the owner's message to their "Вообще отлично", in order:

- The coordinator's Agent card with its brief; a thinking row; its line "I'll launch the two nested subagents as
  instructed."; then the main session's own message, which split the coordinator's run.
- The card "Agent: Probe grandchild BG" with its brief; the line "Now launching the foreground agent:"; the card
  "Agent: Probe grandchild FG" with its brief.
- The background grandchild whole: Bash "First probe command" `echo NESTPROBE-BG-1`, Bash "Second probe
  command" `echo NESTPROBE-BG-2`, its SubagentHandback, its text "NESTPROBE-BG-1 NESTPROBE-BG-2".
- The coordinator's line "Now I'll compile the four-line report:", its SubagentHandback, the row "Message from
  @abae31c4…", its text "Probe coordination complete:" with the four lines, then "Agent "Probe coordinator:
  nested agents" finished".
- No card of the foreground grandchild anywhere: no `echo NESTPROBE-FG-…`, no hand-back, no text. Its two
  lines appear only inside the coordinator's report.

The agent map ("3 agents"): the main session (Opus 5.5 (1M), 162.5k tokens in context) → "Probe coordinator:
nested agents" (39 s, 23.9k tokens) → "Probe grandchild FG" (12 s, 21.9k tokens) and "Probe grandchild BG"
(15 s, 21.0k tokens).

## Earlier evidence

2026-09-10, session `c6aa24a3` on 2.1.266: a subagent launched three nested agents (two `Explore`, one
`general-purpose` in the background), and each call returned "Async agent launched successfully". Nobody
looked at the timeline then.

## What the code says

Read in the 2.1.280 binary,
`~/.cursor/extensions/anthropic.claude-code-2.1.280-darwin-arm64/resources/native-binary/claude`, before the
probe ran. Each quote is a search string for `grep -a -b`; level 1 for the lines, and the probe made the
first four happen.

1. The depth cap. `var o=3,_="tengu_hazel_trellis";function Vb(){let n=a.CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`
   reads the environment, then the server flag, then 3. A call at the cap is refused with "Subagent nesting
   limit reached (depth … of …). Complete this task directly using your tools instead of spawning another
   agent." This machine's `~/.claude.json` caches no `tengu_hazel_trellis`.
2. A foreground subagent drops its children's progress. In the progress callback of a foreground Agent call,
   `let Ee=[],Kt=e.options.forwardSubagentText` and then `if(hee(b)){if(Kt)f(d2t(b));return}`, where `hee` is
   true for `agent_progress` and `skill_progress`: what the subagent's own children report. Of the subagent's
   own messages only the tool calls and their results go up without the flag:
   `if(!Kt&&J.type!=="tool_use"&&J.type!=="tool_result")continue;`.
3. The extension never sets the flag. The running process had `--output-format stream-json --verbose
   --input-format stream-json --include-partial-messages` and no `--forward-subagent-text`, and no
   `CLAUDE_CODE_FORWARD_SUBAGENT_TEXT` in its environment; the extension's own query options in
   `extension.js` set `includePartialMessages` and `agentProgressSummaries: void 0` and never
   `forwardSubagentText`.
4. A background subagent writes past its parent. Its own assistant and user messages go straight into the
   session's stream as `agent_progress` (the path logs "bg-subagent progress write failed" on an error); its
   children's again only with the flag ("bg-subagent nested progress write failed").
5. A foreground agent is never moved to the background on its own:
   `function io(){if(De(process.env.CLAUDE_AUTO_BACKGROUND_TASKS))return 120000;return 0}`, and the variable is
   unset in the extension's process.
6. The agent map. The CLI emits `task_started` for every agent with its `spawn_depth`; neither `extension.js`
   nor `webview/index.js` contains `spawn_depth` or `owned_by_subagent`, so nothing filters a grandchild out.
