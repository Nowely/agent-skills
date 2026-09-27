# Activation by command position (D18, #15 F2, P14a)

Does `/entrust:orchestrate` activate when it is the last thing in a message rather than the first? #15 left F2 as `unknown`: in T8 (`be1f1d1e:24`) the command stood at the end of the message and the coordinator reported the skill as absent. This note is the protocol that settles it, per client. The headless half ran once on 2026-09-28 through the live gate's case 9; the VS Code half has not run.

## What counts as activation

The session file says it, and the model's own account never does. Measured on a VS Code session of entrust 0.20.0 (`87619683…jsonl` under this repository's project directory, read 2026-09-27): a slash command leaves two records in the session file:

1. a user record whose text is `<command-message>entrust:orchestrate</command-message>` and `<command-name>/entrust:orchestrate</command-name>`;
2. the next user record, `isMeta: true`, whose text opens `Base directory for this skill: <install>/skills/orchestrate` and carries the page's body (`## Your own hands` among it).

The page's frontmatter is not in that record, so `grep -c disable-model-invocation <session>.jsonl`, the check 07b drafted for D18, measures something else: it gave 26 on that session file while the expansion record held no match. The check is the expansion record itself.

A refused Skill call is the other signal: the orchestrate page sets `disable-model-invocation: true`, and the Skill tool refuses to load such a page (E39, measured 2026-09-25), so a model that reaches for it that way is refused, and the refusal is recorded beside the expansion's absence. The refusal's own shape in a session file is unmeasured: the gate takes an error result or a result that names the reason.

## Headless half: the live gate's case 9

`ENTRUST_LIVE_ORCHESTRATE=1 node plugins/entrust/evals/orchestrate-live.test.mjs --only 9` runs two Sonnet sessions, four turns at most, persisted so their session files exist, on one trivial task:

- first: `/entrust:orchestrate RETURN: the number of entries in the current directory, as one number.`
- last: `RETURN: the number of entries in the current directory, as one number. /entrust:orchestrate`

For each it records, into `activation.json` in the case directory: whether the session file exists, the `<command-name>` record, the expansion record and its first 200 characters, every Skill call, every refusal, and the first action. The case fails only when the command-first session did not expand the page; the command-last session is a measurement, printed beside the case. `evals/gate-checks.test.mjs` runs the same reading on fixture records offline.

## VS Code half: by hand

The extension cannot be driven headless, so these runs are the owner's. Per position, three fresh sessions in a scratch directory holding one file:

1. Open a new Claude Code session in the VS Code extension, with the plugin installed from the marketplace.
2. Send the prompt exactly as above, first or last, and nothing else.
3. After the answer, find the session file: the newest `.jsonl` under `~/.claude/projects/<the scratch path with every non-alphanumeric character replaced by ->/`.
4. Record the expansion: `grep -c '"text":"Base directory for this skill: [^"]*/skills/orchestrate' <file>`; 1 is expanded, 0 is not (it gave 1 on the session file above).
5. Record the Skill calls and their results: `grep -o '"name":"Skill","input":{[^}]*}' <file>` and any `is_error` result after one.
6. Record the first action: the first `tool_use` name, or the first text, of the assistant after the prompt.

## Results

| Client | Position | Runs | Expanded | Skill calls refused | First action | Measured on |
| --- | --- | --- | --- | --- | --- | --- |
| headless `claude -p` | first | 1 | yes: the page's body follows the command in the session file | 0 | Bash | 2026-09-28, the live gate's case 9 (`orchestrate-live-2026-09-27T21-14-32-517Z/9-activation/activation.json`), one pair of Sonnet sessions |
| headless `claude -p` | last | 1 | no: no command record, plain text | 0 | Bash | the same record; the gate records this half and does not judge it |
| VS Code extension | first | 0 | unmeasured | unmeasured | unmeasured | — |
| VS Code extension | last | 0 | unmeasured | unmeasured | unmeasured | — |

A client not run stays `unmeasured`. The hypothesis the table settles: a client expands a slash command only at the start of the input, and at the end it is plain text the model cannot load, since the page forbids model invocation. Until a row is filled, no page sentence tells the user where to put the command.
