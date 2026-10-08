# Measured interaction contract

The target is the [Codex adapter's interaction contract](../../codex/references/parity.md), with
sandbox excluded. Keep server, session, invocation and message separate: a Stop aborts the run's own
sessions, and its private server goes only when the run itself ends.

## Version 1.18.34

Live probes established:

- Legacy HTTP execution works with the configured router and DeepSeek. V2's session routes, which its
  docs call experimental, are present too; the adapter does not use them, and no V1 removal date was
  established.
- Legacy native `format: json_schema` made history return 400 `Expected OutputFormatJsonSchema`.
  The adapter therefore uses a JSON instruction, independent local validation and at most one
  corrective turn. Invalid output fails the schema gate; successful delivery is not assumed.
- Legacy async input can be consumed at the next model boundary. It does not offer an atomic
  `expectedTurnId` equivalent or immediate preemption.
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
The adapter runs V1 only. The V2 pilot (native API probes and adapter acceptance) and the V2 path it
had until 2026-10-08, its client, fake and cases, are in the repository's research
(`research/2026-10-02-opencode-v2-pilot/`); a report recorded as V2 is refused on continuation.

The installed server's `/doc`, actual responses and pinned upstream source take precedence over
examples for other versions: [server docs](https://opencode.ai/docs/server/),
[versioned SDK types](https://github.com/anomalyco/opencode/blob/v1.18.34/packages/sdk/js/src/v2/gen/types.gen.ts).

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
