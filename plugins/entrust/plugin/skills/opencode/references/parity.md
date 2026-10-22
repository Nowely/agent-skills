# Measured interaction contract

The target is the [Codex adapter's interaction contract](../../codex/references/parity.md), with
sandbox excluded. Keep server, session, invocation and message separate: a Stop aborts the run's own
sessions, and its private server goes only when the run itself ends.

## Version 2.1.2 / 2.1.3

Live probes established:

- The adapter speaks the V2 API. The V1 routes (`/session`, `/permission`, `/question`) answer
  with the web application's HTML, not JSON, so a V1-only driver fails loudly, not silently; a
  report recorded then is refused on continuation.
- `opencode serve --hostname 127.0.0.1 --port 0` still announces `server listening on <url>`.
  Basic auth takes the fixed username `opencode` and the password from `OPENCODE_SERVER_PASSWORD`;
  `OPENCODE_SERVER_USERNAME` is ignored. Health is `GET /api/info` (`/global/health` now serves
  HTML); the route table is `GET /openapi.json`, both behind the same basic auth.
- Session create (`POST /api/session`) takes `location.directory`, `model` (`Model.Ref`, named
  `id`) and `permissions` (`{action, resource, effect}` rules), and reports the rules back
  exactly as sent; the server evaluates them natively (`POST …/permission` answered `deny`, `allow`
  and `ask` exactly as the ruleset ordered in probes). Grammar: `bash` is now `shell`,
  `write`/`patch` fold into `edit`, `task` is `subagent`.
- The prompt body is `{ id, text }`: the message id is echoed as the user message's `id`, there is
  no `parentID` linking an assistant message to its input, and a reply is identified by order.
  A message page is capped at 200 (`limit=1000` answers 400); a turn's completion timestamp is
  `time.completed` on the assistant message. `POST …/prompt` answers 409 for a busy session.
- The question callback is a form (`GET …/form`, `POST …/form/{id}/reply`, `DELETE …/form/{id}`):
  its text is `title`, its fields are keyed, and a coordinator's per-question answer lists map to
  fields by position. Replies and acknowledgements answer 204 with no body; only the status
  acknowledges. `POST …/interrupt` answers `{ interrupted: true|false }` in the clear.
- Busy is presence in `GET /api/session/active`; descendants come from `GET /api/session?parentID=`
  (client-side recursion). Models come from `GET /api/model` (`Model.Info`: `modelID`, `providerID`,
  `enabled`, `variants[]` as an array of `{id}`) with `GET /api/provider` (`activation`), and the
  local recent-model state file keeps its `{recent, variant}` shape. The router provider's own
  models run without a transport override (a live `openrouter/z-ai/glm-5.3-flash` worker answered
  through the plain OpenRouter integration).

There is no steer: continue an agent with `RESUME:` after its turn. The V1 path this adapter ran
until 2026-10-21, and the 2026-10-02 pilot that first measured V2 (against OpenCode 1.18.34, whose
create ignored permissions and whose model resolver had no OpenRouter dispatch), are in the
repository's research (`research/2026-10-02-opencode-v2-pilot/`).

The installed server's `/openapi.json`, actual responses and pinned upstream source take precedence
over examples for other versions: [server docs](https://opencode.ai/v2/docs/api),
[the V2 migration guide](https://opencode.ai/v2/docs/migrate-v1).

## Model selection and evidence

Discovery reads the local OpenCode `model.json` recent list: two entries by default, saved order,
duplicates removed. It retains provider and model IDs separately. A router display name is not the
provider key. An ordinary new invocation selects the first entry; a plan pins its resolved ID.
Explicit models outside those two are checked by exact ID rather than expanding discovery.

Reports attribute only observed invocation messages and commands. Root and child usage are distinct.
Unknown command exit, usage, delivery or cancellation cannot become a fabricated zero or success.
OpenCode `cost` is its catalogue-based estimate, not the router's billing receipt.

Requested attachment formats, web-search modes, MCP selection, network restrictions and variant
controls require verified support. Reject unsupported controls before inference rather than quietly
ignoring them. A worktree artifact remains in its recorded location until landing is authorized.
