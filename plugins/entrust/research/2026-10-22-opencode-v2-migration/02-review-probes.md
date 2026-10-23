# OpenCode V2 review probes — 2026-10-23

Record for the fixes that followed the review of the V2 switch. Sources: live probes against a private
`opencode serve` 2.1.2 (loopback, its own password), the server's OpenAPI document and the V2 models
docs. Evidence levels as in AGENT.md.

## Requests and sessions (level 3)

- A permission or form of a child session (made with `parentID`, or by the subagent tool in a live run)
  is listed under the child's own `GET …/permission` and `…/form` only, never under its parent's.
- A permission reject clears every pending permission of its session: two pending, one rejected, none
  left. The 2026-10-22 record left this unverified.
- `POST …/interrupt` on a session with nothing running answers `{"interrupted": false}`.
- `GET /api/session?parentID=` filters on the server and ignores the directory; a page holds fifty by
  default, and `cursor.next` stays set until a page comes back empty.
- Message pages come newest first by default; `order=asc` on the first page, then its cursor, keeps the
  ascending order; `next` stays set until an empty page.
- Right after `POST …/prompt` returns, `GET /api/session/active` lists the session (four reads, two turns).

## Forms (level 3; made with `POST …/form`)

- A reply value must have its field's type: `"true"` for a boolean answers 400 `FormInvalidAnswerError`
  ("Expected boolean"), an option's label for its value 400 ("Invalid option"); `true`, `3`, `["x"]` and
  the option's value answer 204.
- `DELETE …/form/{id}?message=…` answers 204; a live agent whose question was declined quoted the
  message's text in its reply.

## Catalogue and configuration (level 3)

- `GET /api/model` answers for the server's own directory unless `location[directory]` names another: a
  model a project's own `opencode.json` declares is listed only with it.
- `GET /api/provider` answers `[]` on the first read of a directory not yet loaded; `GET /api/model`
  loads it.
- A provider in `disabled_providers`, or denied by `policies: [{action: "provider.use", resource,
  effect: "deny"}]`, is absent from both lists. `provider.use` acts per provider only: a
  `provider/model` resource left no model at all.
- `providers.<p>.models.<m>.disabled: true` removes that model from the catalogue; a `*` key does not,
  and `disabled: false` does not override a provider deny. The V1 key `provider` is not read for it.
- A provider with `canonical: "<id>"` and an explicit `models` map lists exactly those models and runs
  them (one live turn).
- `Model.Info.id` is the catalogue id; an alias (a `-fast` entry) shares its `modelID` with the base model.
- `GET /api/model/default` names a model even when no configuration sets `model`; `GET /api/config`
  lists the configuration documents, and their `info.model` says whether one does.
- `OPENCODE_DISABLE_FREE_MODELS=1` in the server's environment removes the `opencode/*` models; other
  providers' `:free` models stay. Set on the background service, it reaches no private server.

## Clients (level 3, one macOS machine)

- No server route serves recent, favourite or shown models: none in the OpenAPI document, none in the
  V2 models docs, whose selector "only shows enabled models".
- OpenCode Desktop keeps its shown models (`visibility: show|hide`), its recents and a variant per model
  in its own SQLite store, table `state`, row `opencode.global.dat` / `model`; `node:sqlite` reads it
  read-only while Desktop runs.
- Each V2 session's model ref is in the shared database's `session_v2.model` and in `GET /api/session`.
  The V1 TUI's `model.json` was not rewritten by V2 clients in these probes (level 2).

## Events (level 3)

- `/api/event` frames are `{id, created, type, location?, data}`; a session's events carry
  `data.sessionID`, not `properties.sessionID`. The driver no longer reads the stream: a session that
  emits events is one `GET /api/session/active` already lists as busy.

## Not verified

- The Desktop store's location outside macOS.
- A `canonical` provider over an integration-backed provider (OpenAI's ChatGPT plan).
