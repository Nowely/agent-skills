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
  no `parentID` linking an assistant message to its input, and a reply is identified by order: an
  input's replies are the assistant messages after it and before the next user message. Pages come
  newest first unless the first asks for `order=asc`, and their cursor keeps the order; the driver reads
  back only to the first message older than its run. A message page is capped at 200 (`limit=1000`
  answers 400); a turn's completion timestamp is `time.completed` on the assistant message.
  `POST …/prompt` answers 409 for a busy session.
- The question callback is a form (`GET …/form`, `POST …/form/{id}/reply`, `DELETE …/form/{id}`):
  its text is `title`, its fields are keyed, and a coordinator's per-question answer lists map to
  fields by position. The server refuses a value of another type than its field's (a boolean, a
  number, a multiselect's list) and an option's label for its value (`FormInvalidAnswerError`, the
  form left pending), so the launcher checks each answer against its field and the driver converts it.
  A decline is the `DELETE`, its reason the `message` query parameter. Replies and acknowledgements
  answer 204 with no body; only the status acknowledges. `POST …/interrupt` answers
  `{ interrupted: true|false }` in the clear, `false` for a session with nothing running.
- A permission or form is listed only under its own session, a subagent's included. A permission reject
  clears the session's whole pending set.
- The `execute` tool (JavaScript) runs with no permission request under any ruleset, a `*: ask` one
  included. In probes it had no filesystem access; it is a second ungated path beside the shell, and adds
  nothing the allowed shell lacks.
- Busy is presence in `GET /api/session/active`; descendants come from `GET /api/session?parentID=`,
  fifty to a page, its cursor set until a page comes back empty (client-side recursion). The event
  stream is not used: a busy session is already progress.
- Models come from `GET /api/model` read for the run's directory (`location[directory]`): a model a
  project's own configuration declares is listed only there. `Model.Info` names a model by its catalogue
  `id`, which an alias (a `-fast` entry) does not share with its `modelID`; `enabled` and `variants[]` (an
  array of `{id}`) come with it. A provider that is disabled, denied by a `provider.use` policy or not
  connected is absent from the catalogue, and `GET /api/provider` answers `[]` on a directory's first
  read, so it is not consulted. The configuration's `model` is `GET /api/model/default`; with none set
  the server names a default nobody selected. The router provider's own models run without a transport
  override (a live `openrouter/z-ai/glm-5.3-flash` worker answered through the plain OpenRouter
  integration).

There is no steer: continue an agent with `RESUME:` after its turn. The V1 path this adapter ran
until 2026-10-21, and the 2026-10-02 pilot that first measured V2 (against OpenCode 1.18.34, whose
create ignored permissions and whose model resolver had no OpenRouter dispatch), are in the
repository's research (`research/2026-10-02-opencode-v2-pilot/`).

The installed server's `/openapi.json`, actual responses and pinned upstream source take precedence
over examples for other versions: [server docs](https://opencode.ai/v2/docs/api),
[the V2 migration guide](https://opencode.ai/v2/docs/migrate-v1).

## Model selection and evidence

No server route says which models a user prefers. OpenCode Desktop keeps the ones it shows in its
picker, and the variant chosen for each, in its own store (on macOS `~/Library/Application
Support/ai.opencode.desktop/drafts.sqlite`, read only); status lists those the catalogue still offers,
in Desktop's order, and without that store the whole catalogue, which the configuration can shorten with
`disabled` models and `provider.use` policies. It retains provider and model IDs separately; a router
display name is not the provider key. `MODEL: inherit` selects the configuration's `model` and is
refused when none is set; a plan pins its resolved ID. An explicit model is checked by exact catalogue ID.

Reports attribute only observed invocation messages and commands. Root and child usage are distinct.
Unknown command exit, usage, delivery or cancellation cannot become a fabricated zero or success.
OpenCode `cost` is its catalogue-based estimate, not the router's billing receipt.

Requested attachment formats, web-search modes, MCP selection, network restrictions and variant
controls require verified support. Reject unsupported controls before inference rather than quietly
ignoring them. A worktree artifact remains in its recorded location until landing is authorized.
