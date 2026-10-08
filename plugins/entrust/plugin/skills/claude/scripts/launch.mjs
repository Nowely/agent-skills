// What the shared launcher, orchestrate/scripts/agent-run.mjs, takes from the Claude adapter: its driver, the
// name a status line gives a Claude model, the plan's pins an invocation records, and the typed request
// `claude.permission` the approval server adds to the mailbox beside the launcher's command requests.
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const driver = path.join(path.dirname(fileURLToPath(import.meta.url)), "driver.mjs");

// A full model id such as claude-haiku-5-5 is shown by its family; any other model stays as written.
export const SHORT_NAMES = ["Opus", "Sonnet", "Haiku", "Fable"];
export const shortName = (slug) =>
  SHORT_NAMES.find((n) => new RegExp(`^claude-${n}\\b`, "i").test(slug)) ?? slug;

// --new: what an invocation records in agent/backend.json and keeps. The plan row, when there is one, pins
// the model and the writes, which the driver enforces at --check-prompt-file and again at launch.
export function prepare({ adapter, row, saved, refuse }) {
  const record = { adapter, planModel: row?.model ?? null, planWrites: row?.writes ?? null };
  if (saved && JSON.stringify(saved) !== JSON.stringify(record))
    refuse("the Claude backend and the approved plan are immutable for this invocation; use a fresh report path");
  return record;
}

export const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

// A permission prompt for a tool call that is not a plain Bash command: its body is the whole call, bound to
// the decision by its hash, and an accept restates the whole body, so no field of the call goes unseen.
export function typedRequest(q) {
  if (q?.type !== "claude.permission") return null;
  const presented = String(q.presented ?? JSON.stringify(q.payload, null, 2));
  return {
    presented,
    decisions: ["accept", "decline"],
    lines: (field, token) => [`REQUEST=${q.id}`, `TYPE=${q.type}`, `TOOL=${field(q.payload?.tool_name)}`,
      `CWD=${field(q.cwd)}`, `DEADLINE=${field(q.deadlineAt)}`,
      `REQUEST_BODY<<${token}`, presented, `REQUEST_BODY>>${token}`],
    fits: (d) => d?.requestHash === q.requestHash,
    envelopeError: () => (q.requestHash !== sha256(JSON.stringify(q.payload)) || q.presented !== JSON.stringify(q.payload, null, 2))
      ? "typed request content does not match its immutable envelope" : null,
    record: { requestHash: q.requestHash },
  };
}
