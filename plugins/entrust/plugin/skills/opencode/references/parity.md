# Measured interaction contract

The target is the [Codex adapter's interaction contract](../../codex/references/parity.md), with
sandbox excluded. Keep server, session, invocation and message separate. One server serves many
sessions; its process is never an agent-owned teardown target.

## Version 1.18.34

Live probes established:

- Legacy HTTP execution works with the configured router and DeepSeek. V2 routes are also present.
- V2 `prompt` admits input, while `wait` returns 503, `Session wait is not available yet`.
  V2 `interrupt` leaves legacy execution busy. Execution families cannot be mixed.
  The pinned [V2 implementation](https://github.com/anomalyco/opencode/blob/aec0b9a6d8898f68f923aaf08b7306d931fd9d76/packages/core/src/session.ts#L421)
  unconditionally raises `OperationUnavailableError` for `wait`. This proves that method unavailable,
  not that every V2 polling strategy is impossible. An isolated native configuration pilot supplied
  the exact router model and `high` variant. Input was admitted, but the runner raised
  `SessionRunnerModel.UnsupportedApiError` for `aisdk:@openrouter/ai-sdk-provider`; no assistant
  result was observed. The configured provider's npm field differs from the selected V1 model's
  actual SDK. Preserving the latter exposed this unsupported dispatch rather than silently changing
  transport. Separately approved native Chat Completions (`@ai-sdk/openai-compatible`) and Responses
  (`@ai-sdk/openai`) overrides both produced attributable completed V2 assistant results with the
  same model/Eliza/high selection. A further approved native Chat window established question,
  permission-controlled tool execution, same-session recall, Stop, continuation after Stop and
  boundary delivery through steer admission. Seven inputs took 29.295 seconds; `wait` remained 503.
  Those direct HTTP probes prove the native contract. A later real-launcher gate passed V2 question,
  permission-controlled printf, wrapper Stop and same-session continuation with valid schema receipts.
  See the [pilot results, failed probes and restoration checks](v2-pilot.md).
  V2's current docs call its session routes experimental. No V1 removal date was established.
- Legacy native `format: json_schema` made history return 400 `Expected OutputFormatJsonSchema`.
  The adapter therefore uses a JSON instruction, independent local validation and at most one
  corrective turn. Invalid output fails the schema gate; successful delivery is not assumed.
- Legacy async input can be consumed at the next model boundary. It does not offer an atomic
  `expectedTurnId` equivalent or immediate preemption. Native V2 steer admission also lacks an
  expected-generation field; the pilot proved next-boundary delivery only.
- Legacy abort can leave a native question pending. Stop aborts owned sessions first, then rejects
  exact owned callbacks and checks status, pending requests and tool states. The live question-Stop
  probe observed an idle session, a rejected question tool and no own pending requests. These are
  snapshots, not a generation fence. Unknown cancellation blocks continuation. Native permission
  rejection affects all pending permissions in that session; any rejection refuses an unmatched
  request. Stop during admission is reconciled after admission without resending input; owned
  descendants are retained across failed discovery, which prevents claiming confirmed idle.

Strict active steer remains an unmet capability. Queue and abort/resume must retain their own names.
Do not claim full parity until a server-side binding and its race tests establish delivery to the
expected active invocation. Additional server changes require a concrete approved scope.
The configuration, transport and native interaction pilots are complete. The adapter now has an
explicit `API_FAMILY: v2` path with a verified native `AGENT`, durable input attribution, complete
pagination and session-scoped callbacks. V1 remains the compatibility default. A resume retains its
recorded API family, agent and permission hash. No execution-family fallback is performed. Native
adapter acceptance passed on explicit Chat Completions for question, permission, Stop and continuation.
The original singleton and compatibility default remain as before; permanent native adoption is a
separate owner action.

The installed server's `/doc`, actual responses and pinned upstream source take precedence over
examples for other versions: [server docs](https://opencode.ai/docs/server/),
[versioned SDK types](https://github.com/anomalyco/opencode/blob/v1.18.34/packages/sdk/js/src/v2/gen/types.gen.ts).

## Native V2 limits

V2 requires an exact enabled model with native SDK dispatch and a dedicated default-deny/ask agent.
Session-create permissions are ignored by the pinned handler. The shipped native builtin composition
[lists task as unported](https://github.com/anomalyco/opencode/blob/aec0b9a6d8898f68f923aaf08b7306d931fd9d76/packages/core/src/tool/builtins.ts);
fan-out uses host-orchestrated independent sessions. Custom/MCP tools and web controls are not
enabled by the verified adapter profile. Read/write/worktree scope is a coordinator contract, not
a sandbox claim. Message pages use at most 200 items, history pages at most 100, matching the installed native limits.
Pagination has a 10,000-item cap and malformed/incomplete observation fails closed.

## Model selection and evidence

Discovery reads the local OpenCode `model.json` recent list: two entries by default, saved order,
duplicates removed. It retains provider and model IDs separately. A router display name is not the
provider key. An ordinary new invocation selects the first entry; a plan pins its resolved ID.
Explicit models outside those two are checked by exact ID rather than expanding discovery.
For a remote server, provide the owner's recent-state snapshot through
`ENTRUST_OPENCODE_MODEL_STATE`; a client's local recent list is not the server owner's preference.

Reports attribute only observed invocation messages and commands. Root and child usage are distinct.
Unknown command exit, usage, delivery or cancellation cannot become a fabricated zero or success.
OpenCode `cost` is its catalogue-based estimate, not the router's billing receipt.

Requested attachment formats, web-search modes, MCP selection, network restrictions and variant
controls require verified support. Reject unsupported controls before inference rather than quietly
ignoring them. A worktree artifact remains in its recorded location until landing is authorized.
