#!/usr/bin/env node
// The approval server of one external Claude run: a stdio MCP server that `claude -p` starts for
// --permission-prompt-tool. Each permission prompt becomes a request in the run's mailbox, and the decision
// the coordinator publishes there with the launcher's --decide becomes the prompt's answer. It is the only
// writer of the mailbox, so no other process can settle a request it is still waiting on.
//
// Its run comes from its environment, which the driver writes into the MCP config: ENTRUST_APPROVAL_DIR,
// ENTRUST_RUN_PID (the driver's pid, the identity the launcher compares), ENTRUST_RUN_STARTED_MS,
// ENTRUST_RUN_CWD and ENTRUST_RUN_ROOTS (JSON).
//
// A Bash call whose input is only a command and its description is a command request, the launcher's own
// kind; every other call is a typed `claude.permission` whose body is the whole call. An accept answers with
// the input as it was offered, never with anything the decision carries.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { sha256 } from "./launch.mjs";

export const TOOL = "decide";
export const DEADLINE_MS = 30 * 60 * 1000;
const POLL_MS = 500;
const COMMAND_KEYS = new Set(["command", "description"]);

const box = process.env.ENTRUST_APPROVAL_DIR;
const run = { pid: Number(process.env.ENTRUST_RUN_PID), startedAtMs: Number(process.env.ENTRUST_RUN_STARTED_MS), turnId: null };
const cwd = process.env.ENTRUST_RUN_CWD ?? null;
let roots = [];
try { roots = JSON.parse(process.env.ENTRUST_RUN_ROOTS ?? "[]"); } catch {}

const open = new Map(); // MCP request id -> { q, input }
let seq = 0;

const send = (o) => process.stdout.write(`${JSON.stringify(o)}\n`);
const answer = (rpcId, behavior) => send({ jsonrpc: "2.0", id: rpcId, result: { content: [{ type: "text", text: JSON.stringify(behavior) }] } });
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };

function writeFile(name, text) {
  const tmp = path.join(box, `.${name}.${crypto.randomBytes(4).toString("hex")}`);
  fs.writeFileSync(tmp, text, { mode: 0o600 });
  fs.renameSync(tmp, path.join(box, name));
}
const writeRequest = (q) => writeFile(`${q.id}.request.json`, `${JSON.stringify(q, null, 2)}\n`);
const writePending = () => writeFile("pending", [...open.values()].map(({ q }) => `${q.id}\n`).join(""));

export function requestOf({ tool_name, input }, id, now = Date.now()) {
  const common = { id, run, cause: "asked", cwd, roots, deadlineAt: new Date(now + DEADLINE_MS).toISOString(), settled: null };
  const keys = Object.keys(input ?? {});
  if (tool_name === "Bash" && typeof input?.command === "string" && keys.every((k) => COMMAND_KEYS.has(k)))
    return { ...common, method: "Bash", command: input.command, reason: typeof input.description === "string" ? input.description : null };
  const payload = { tool_name, input };
  return { ...common, type: "claude.permission", method: tool_name, reason: null,
    payload, presented: JSON.stringify(payload, null, 2), requestHash: sha256(JSON.stringify(payload)) };
}

// The decision is this request's when it carries the request's own identity, as the launcher's --decide
// copies it out, and for a typed request its hash.
export const fits = (d, q) => Boolean(d) && d.id === q.id && d.run?.pid === q.run.pid && d.run?.startedAtMs === q.run.startedAtMs
  && (d.run?.turnId ?? null) === null && ["accept", "decline"].includes(d.decision)
  && (q.type !== "claude.permission" || d.requestHash === q.requestHash);

function settle(rpcId, decision, by, why) {
  const entry = open.get(rpcId);
  if (!entry) return null;
  open.delete(rpcId);
  clearInterval(entry.timer);
  entry.q.settled = { decision, by, why: why ?? null, settledAt: new Date().toISOString() };
  try { writeRequest(entry.q); writePending(); } catch {}
  return entry;
}

function offer(rpcId, args) {
  let q;
  try {
    q = requestOf(args, `${++seq}-${crypto.randomBytes(4).toString("hex")}`);
    writeRequest(q);
  } catch (e) {
    return answer(rpcId, { behavior: "deny", message: `entrust could not offer this call for approval: ${e.code ?? e.message}` });
  }
  const timer = setInterval(() => poll(rpcId), POLL_MS);
  open.set(rpcId, { q, input: args.input, timer });
  try { writePending(); } catch (e) {
    settle(rpcId, "expired", "driver", `mailbox write failed: ${e.code ?? e.message}`);
    return answer(rpcId, { behavior: "deny", message: "entrust could not offer this call for approval" });
  }
}

function poll(rpcId) {
  const entry = open.get(rpcId);
  if (!entry) return;
  const { q, input } = entry;
  const d = readJson(path.join(box, `${q.id}.decision.json`));
  if (fits(d, q)) {
    settle(rpcId, d.decision === "accept" ? "accepted" : "declined", "coordinator", d.why);
    return answer(rpcId, d.decision === "accept" ? { behavior: "allow", updatedInput: input }
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
  if (!box || !path.isAbsolute(box) || !Number.isInteger(run.pid) || !Number.isFinite(run.startedAtMs)) {
    process.stderr.write("entrust approvals: ENTRUST_APPROVAL_DIR, ENTRUST_RUN_PID and ENTRUST_RUN_STARTED_MS are required\n");
    process.exit(2);
  }
  readline.createInterface({ input: process.stdin }).on("line", (line) => {
    let m;
    try { m = JSON.parse(line); } catch { return; }
    handle(m);
  }).on("close", () => { endAll("the run ended"); process.exit(0); });
  for (const s of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(s, () => { endAll("the run ended"); process.exit(0); });
}

