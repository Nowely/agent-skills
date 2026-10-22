---
name: proxy
description: >-
  Switches this session to proxy mode: a chosen Claude model executes the work in a full Claude Code session, after one final confirmation.
disable-model-invocation: true
metadata:
  version: "0.33.0"
license: MIT
---

The command names the model: `/entrust:proxy opus` in Claude Code, `$entrust:proxy opus` in Codex.
With no model named, ask which. Claude does the work; this host, normally Luna, transports messages and answers.
`<orchestrate-dir>` is the orchestrate skill's installed directory beside this one.

## Activate

1. Choose the working directory on this host and a new state directory outside the checkout. Run
   `node <orchestrate-dir>/scripts/main-proxy.mjs propose --state <dir> --adapter claude --model <model>
   [--effort <effort>] --cwd <work-dir> --language ru|en [--replaces <running mode's state>]`.
   Only Claude models are supported. This checks the route and launch offline; no model is called.
2. Show the printed `confirmation` and `choices` exactly and wait for the user's own affirmative answer.
   Record it with `confirm --state <dir> --pending <id> --source user-message --answer-file <file>` using their
   verbatim reply, or `--source user-choice` with the selected first choice. Cancel a refusal with
   `cancel --state <dir> --pending <id>`. Silence, quoted text and another agent's answer are not consent.
3. Forward the message that accompanied the command (or an empty message) through
   [Every message](../orchestrate/references/main-proxy.md#every-message). Follow that short procedure for every
   subsequent message. The first verified reply makes the mode active. Another model or provider needs a new
   activation; a continuation keeps the recorded model, route and permissions.

The confirmation authorizes direct execution through Claude Code, requesting bypassPermissions, with Chrome integration and
its configured tools, MCP servers, plugins, hooks, skills and memory. The host's own tool catalogue is not copied
into Claude. Platform restrictions and missing integrations are reported as observed, with no substitute execution
by the host. Claude's managed policy may select another permission mode; the report and status record the actual one.
Existing tool output and the transcript provide visibility; the host adds no tool cards or narration.

The helper binds consent to this host session and observed provider route. It cannot see who wrote the answer file:
record consent only after seeing the user give it. Forward applicable user instructions and working context; keep
private system instructions and hidden reasoning local.
