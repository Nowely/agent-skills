# OpenCode V2 migration probes — 2026-10-22

Record for switching the `opencode` adapter from the V1 API to the V2 API wholesale (the option the
2026-10-08 driver audit left for exactly this case: V1 gone, no second family). Sources: live
probes against `opencode serve` 2.1.2 (private, loopback) and the user's shared background service
2.1.3; the V2 OpenAPI document served by the server; the V2 docs. Evidence levels as in AGENT.md.

## Why now (level 3)

- The installed `opencode` is 2.1.2; `opencode serve --hostname 127.0.0.1 --port 0` still prints
  `server listening on http://127.0.0.1:<port>`.
- `GET /session`, `GET /permission`, `GET /question`, `GET /session/status` on the V2 server return
  the web application's HTML with status 200. The V1 API is not present behind a fallback: the
  current driver's `listOrEmpty` fails loudly (`response is not JSON`).

## Auth and health (level 3)

- Basic auth on the V2 server takes the fixed username `opencode` with the password from
  `OPENCODE_SERVER_PASSWORD`; a custom `OPENCODE_SERVER_USERNAME` value is ignored (user
  `u-test` → 401, `opencode` → 200, same password).
- `GET /api/info` answers without a `data` wrapper: `{version, pid, urls, paths, capabilities}`.
  `/global/health` and `/doc` now serve HTML; the route table moved to `GET /openapi.json`
  (behind the same auth).
- The background service registers at `~/.local/state/opencode/service.json` with a `password`
  field; the same basic scheme works against it.

## Session, permissions, prompt (level 3)

- `POST /api/session` with `{location: {directory}, model: {id, providerID, variant?},
  permissions: [{action, resource, effect}]}` answers `{data: Session.Info}`; the response
  reports `permissions` exactly as sent.
- The server evaluates the rules natively: `POST /api/session/{id}/permission` with
  `{action: "edit", resources: [...]}` answered `{"data":{"effect":"deny"}}` under a deny rule,
  `allow` under an allow rule, and `ask` under the catch-all, with the request then listed under
  `GET /api/session/{id}/permission`. The 2026-10-02 pilot's blocker (create-time permissions
  ignored on 1.18.34) no longer reproduces on 2.1.2.
- The prompt body is `{id, text}`; the answer's `data.id` echoes the sent id, and the user message
  carries that id. Assistant messages carry no `parentID`: a turn's reply is identified by order.
  Completion is `time.completed` on the assistant message. `GET …/message?limit=1000` answers
  400; the page cap is 200 (`limit=200` → 200).
- A live worker on `openrouter/z-ai/glm-5.3-flash` ran a shell command and answered through the
  plain OpenRouter integration, with `shell` tool evidence (`state.input.command`,
  `state.metadata.exit`, `state.content[].text`). The pilot's second blocker — no dispatch for the
  owner's OpenRouter models, transport override required — no longer reproduces. (A wrong modelID
  fails with `provider.no-route`, so exact IDs remain mandatory.)

## Questions, replies, busy, children (levels 1 and 3)

- The question callback is a form: `GET …/form`, `POST …/form/{id}/reply` (`{answer: {key: value}}`,
  204), `DELETE …/form/{id}` (204, reason as a `message` query parameter). Its text is `title`,
  its fields are keyed (spec, level 1; create/reply/cancel exercised live, level 3).
- Permission replies are `POST …/permission/{requestID}/reply` with `{decision: "once"|"always"|
  "reject", message?}`; a definite acknowledgement is 204 with no body.
- Busy is presence in `GET /api/session/active` (`{"data": {"<ses…>": {"type": "running"}}}`);
  interrupt is `POST …/interrupt` answering `{"interrupted": bool}` without a wrapper.
- There is no children route: descendants are `GET /api/session?parentID=<id>` (spec, level 1).
- `GET /api/model` returns `{data: [Model.Info]}` with `modelID`, `providerID`, `enabled` and
  `variants` as an array of `{id}`; `GET /api/provider` carries `activation` (no `connected`).
- The local recent-model state file keeps the `{recent, variant}` shape the adapter reads.

## Not verified

- SSE event payloads on `/api/event` (the stream is advisory in the driver; the frame parse
  tolerates the spec's JSON-encoded string).
- Session-wide effect of a permission `reject` on siblings: the adapter still rejects each owned
  request and records the group, as under V1; the fake models it, the live server was not probed
  for it.
- Native enforcement of every individual action name beyond `edit`, `shell` and `*` (the `read`
  group follows the V1 names and the docs' rename list).
