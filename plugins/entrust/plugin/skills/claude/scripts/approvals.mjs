#!/usr/bin/env node
// The approval server of one external Claude run: a stdio MCP server that `claude -p` starts for
// --permission-prompt-tool. Each permission prompt becomes a request in the run's mailbox, and the decision
// the coordinator publishes there with the launcher's --decide becomes the prompt's answer. It is the only
// writer of the mailbox, so no other process can settle a request it is still waiting on.
//
// Its run comes from its environment, which the driver writes into the MCP config: ENTRUST_APPROVAL_DIR,
// ENTRUST_RUN_PID (the driver's pid, the identity the launcher compares), ENTRUST_RUN_STARTED_MS,
// ENTRUST_RUN_CWD, ENTRUST_RUN_ROOTS (JSON), ENTRUST_RUN_STATE_DIR and ENTRUST_RUN_PROTECTED (JSON, the
// driver's protected directories).
//
// A Bash call whose input is only a command and its description is a command request, the launcher's own
// kind; every other call is a typed `claude.permission` whose body is the whole call. An accept answers with
// the input as it was offered, never with anything the decision carries.
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { canonical, guardedTarget, within } from "../../orchestrate/scripts/drivers.mjs";
import { deadlineMs, openMailbox, requestId } from "../../orchestrate/scripts/mailbox.mjs";
import { sha256 } from "./launch.mjs";

export const TOOL = "decide";
const POLL_MS = 500;
const COMMAND_KEYS = new Set(["command", "description"]);

const run = { pid: Number(process.env.ENTRUST_RUN_PID), startedAtMs: Number(process.env.ENTRUST_RUN_STARTED_MS), turnId: null };
const cwd = process.env.ENTRUST_RUN_CWD ?? null;
let roots = [], protectedDirs = [];
try { roots = JSON.parse(process.env.ENTRUST_RUN_ROOTS ?? "[]"); } catch {}
try { protectedDirs = JSON.parse(process.env.ENTRUST_RUN_PROTECTED ?? "[]"); } catch {}
const guard = { stateDir: process.env.ENTRUST_RUN_STATE_DIR || null, protectedDirs };

let box = null;
const open = new Map(); // MCP request id -> { q, input, timer }
let seq = 0;

const send = (o) => process.stdout.write(`${JSON.stringify(o)}\n`);
const answer = (rpcId, behavior) => send({ jsonrpc: "2.0", id: rpcId, result: { content: [{ type: "text", text: JSON.stringify(behavior) }] } });

export function requestOf({ tool_name, input }, id, now = Date.now()) {
  const common = { id, run, cause: "asked", cwd, roots, deadlineAt: new Date(now + deadlineMs()).toISOString(), settled: null };
  const keys = Object.keys(input ?? {});
  if (tool_name === "Bash" && typeof input?.command === "string" && keys.every((k) => COMMAND_KEYS.has(k)))
    return { ...common, method: "Bash", command: input.command, reason: typeof input.description === "string" ? input.description : null };
  const payload = { tool_name, input };
  return { ...common, type: "claude.permission", method: tool_name, reason: null,
    payload, presented: JSON.stringify(payload, null, 2), requestHash: sha256(JSON.stringify(payload)) };
}

// An edit outside the run's roots aimed inside the state directory, where the mailboxes are, or a directory the
// driver protects is declined at once, never offered. Every other call is offered whole.
function declinedAtOnce({ tool_name, input }) {
  if ((tool_name !== "Edit" && tool_name !== "Write") || typeof input?.file_path !== "string") return null;
  const target = canonical(input.file_path, cwd ?? undefined);
  if (roots.some((r) => within(target, canonical(r)))) return null;
  return guardedTarget(target, guard);
}

// Settles the request the MCP call `rpcId` waits on. Returns whether its record now holds the settlement, or
// null for a call no longer open.
function settle(rpcId, decision, by, why) {
  const entry = open.get(rpcId);
  if (!entry) return null;
  open.delete(rpcId);
  clearInterval(entry.timer);
  return box.settle(entry.q, { decision, by, why: why ?? null, settledAt: new Date().toISOString() });
}

function offer(rpcId, args) {
  const q = requestOf(args, requestId(++seq));
  const guarded = declinedAtOnce(args);
  if (guarded) {
    box.settle(q, { decision: "declined", by: "driver", why: guarded, settledAt: new Date().toISOString() });
    return answer(rpcId, { behavior: "deny", message: `entrust declined this call: ${guarded}` });
  }
  try { box.offer(q); } catch (e) {
    box.settle(q, { decision: "expired", by: "driver", why: `mailbox write failed: ${e.code ?? e.message}`, settledAt: new Date().toISOString() });
    return answer(rpcId, { behavior: "deny", message: `entrust could not offer this call for approval: ${e.code ?? e.message}` });
  }
  open.set(rpcId, { q, input: args.input, timer: setInterval(() => poll(rpcId), POLL_MS) });
}

function poll(rpcId) {
  const entry = open.get(rpcId);
  if (!entry) return;
  const { q, input } = entry;
  const { state, d } = box.decision(q);
  if (state === "valid") {
    const accept = d.decision === "accept";
    const recorded = settle(rpcId, accept ? "accepted" : "declined", "coordinator", d.why);
    if (accept && !recorded) return answer(rpcId, { behavior: "deny", message: "entrust could not record the accept, so the call is declined" });
    return answer(rpcId, accept ? { behavior: "allow", updatedInput: input }
      : { behavior: "deny", message: d.why ? `declined by the coordinator: ${d.why}` : "declined by the coordinator" });
  }
  if (Date.now() > Date.parse(q.deadlineAt)) {
    settle(rpcId, "expired", "driver", "deadline passed unanswered");
    answer(rpcId, { behavior: "deny", message: "the approval deadline passed unanswered" });
  }
}

function endAll(why) {
  for (const rpcId of [...open.keys()]) settle(rpcId, "expired", "driver", why);
}

function handle(m) {
  if (m.method === "initialize")
    return send({ jsonrpc: "2.0", id: m.id, result: { protocolVersion: m.params?.protocolVersion ?? "2025-06-18",
      capabilities: { tools: {} }, serverInfo: { name: "entrust-approvals", version: "1" } } });
  if (m.method === "tools/list")
    return send({ jsonrpc: "2.0", id: m.id, result: { tools: [{ name: TOOL, description: "Asks the entrust coordinator to allow or deny one tool call",
      inputSchema: { type: "object", properties: { tool_name: { type: "string" }, input: { type: "object" }, tool_use_id: { type: "string" } }, required: ["tool_name", "input"] } }] } });
  if (m.method === "tools/call" && m.params?.name === TOOL) return offer(m.id, m.params.arguments ?? {});
  if (m.method === "notifications/cancelled") return void settle(m.params?.requestId, "expired", "driver", "Claude Code cancelled the call");
  if (m.method === "ping") return send({ jsonrpc: "2.0", id: m.id, result: {} });
  if (m.id !== undefined && m.method) send({ jsonrpc: "2.0", id: m.id, error: { code: -32601, message: `no method ${m.method}` } });
}

const isEntry = process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
if (isEntry) {
  const dir = process.env.ENTRUST_APPROVAL_DIR;
  if (!dir || !path.isAbsolute(dir) || !Number.isInteger(run.pid) || !Number.isFinite(run.startedAtMs)) {
    process.stderr.write("entrust approvals: ENTRUST_APPROVAL_DIR, ENTRUST_RUN_PID and ENTRUST_RUN_STARTED_MS are required\n");
    process.exit(2);
  }
  box = openMailbox(dir);
  readline.createInterface({ input: process.stdin }).on("line", (line) => {
    let m;
    try { m = JSON.parse(line); } catch { return; }
    handle(m);
  }).on("close", () => { endAll("the run ended"); process.exit(0); });
  for (const s of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(s, () => { endAll("the run ended"); process.exit(0); });
}

