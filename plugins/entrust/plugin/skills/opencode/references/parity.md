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
- On 1.18.35 a session keeps its permission rules exactly as sent, and reports them so on create and on read,
  which the driver checks. Its bash rules match a command's prefix and split it at `;`: under an allow for
  `git diff*`, `git diff > f1.txt` ran unasked and wrote the file, while `git diff; touch f3.txt` asked for
  each part. So the adapter allows no shell command unasked, and a read run with no mailbox that needs one
  exits 7.
- Legacy abort can leave a native question pending. After the driver's Stop, the live question-Stop
  probe observed an idle session, a rejected question tool and no own pending requests: snapshots, not a
  generation fence. [interactions.md](interactions.md) has the Stop procedure.

There is no steer: continue an agent with `RESUME:` after its turn. The adapter runs V1 only. The V2 pilot (native API probes and adapter acceptance) and the V2 path it
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
