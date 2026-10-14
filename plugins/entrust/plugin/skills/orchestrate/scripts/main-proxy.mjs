#!/usr/bin/env node
// One saved mode owns prompts, coordinator reports, worker bindings and complete request outcomes.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readAgentOrders } from "./agent-orders.mjs";
import { canonical } from "./drivers.mjs";
import { checkSchemaSubset } from "./json-schema.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, "agent-run.mjs");
const SCHEMA = path.join(HERE, "../schemas/main-proxy.schema.json");
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
const json = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const object = (v) => v && typeof v === "object" && !Array.isArray(v);
const quote = (s) => `'${s.replaceAll("'", "'\\''")}'`;
const save = (p, value) => {
  const tmp = `${p}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try { fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "wx" }); fs.renameSync(tmp, p); }
  finally { fs.rmSync(tmp, { force: true }); }
};
const output = (text) => {
  const bytes = Buffer.from(text);
  for (let offset = 0; offset < bytes.length;) {
    try { offset += fs.writeSync(1, bytes, offset, bytes.length - offset); }
    catch (e) { if (e.code !== "EAGAIN") throw e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5); }
  }
};
const MUTATING = new Set(["init", "prepare", "finish", "bind", "record"]);
const USAGE = `main-proxy — saved coordinator mode and complete host outcomes.

  help | --help
  catalogue --from <file|-> [--extra file] --out file --proxy-model model --coordinator-model model --worker-models '<JSON array>'
  init --state dir --adapter claude|opencode|codex --model model --cwd dir --catalogue file
  prepare --state dir --message-file file --host-facts file [--results file]
  finish --state dir
  bind --state dir --agent-id id --native-json <file|-> --model model --effort effort --reply-path file
  record --state dir --request-id id --outcome-json <file|->
  results --state dir
  status --state dir

finish publishes once. After a lost stdout, reconcile saved orders and request states via status.
Orders are beside the report; status returns ordersPath. Bind native identity: agent_id, native_agent, id or task_name (e.g. {"agent_id":"worker-1"}).
Collect outcome JSON needs root status completed|failed|cancelled (e.g. {"status":"completed"}); replies use each agent's bound replyPath.
`;

function stateLock(state) {
  const lockPath = path.join(state, "state.lock"), token = crypto.randomUUID(), deadline = Date.now() + 30000;
  for (;;) {
    try {
      const fd = fs.openSync(lockPath, "wx", 0o600);
      try { fs.writeSync(fd, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString(), token })); }
      finally { fs.closeSync(fd); }
      return () => { if (json(lockPath).token === token) fs.unlinkSync(lockPath); };
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
      let owner;
      try { owner = json(lockPath); } catch (error) { if (error.code === "ENOENT") continue; }
      if (owner) {
        if (!Number.isInteger(owner.pid) || owner.pid <= 0 || !Number.isFinite(Date.parse(owner.startedAt))) throw new Error(`invalid state lock at ${lockPath}; reconcile it before mutation`);
        let alive = true;
        try { process.kill(owner.pid, 0); } catch (error) { if (error.code === "ESRCH") alive = false; else if (error.code !== "EPERM") throw error; }
        if (!alive) throw new Error(`stale state lock at ${lockPath}: dead pid ${owner.pid}, startedAt ${owner.startedAt}; reconcile it before mutation`);
      }
      if (Date.now() >= deadline) throw new Error(`state lock busy at ${lockPath}; reconcile via status`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
    }
  }
}

function stateLocation(cwd, state) {
  const root = spawnSync("git", ["-C", cwd, "rev-parse", "--show-toplevel"], { encoding: "utf8" });
  const checkout = root.status === 0 ? fs.realpathSync(root.stdout.trim()) : cwd;
  const resolvedState = canonical(state);
  if (resolvedState === checkout || resolvedState.startsWith(`${checkout}${path.sep}`)) throw new Error("mode state must be outside the checkout");
}
const put = (map, key, value) => Object.defineProperty(map, key, { value, enumerable: true, writable: true, configurable: true });
const required = (o, k) => { if (!o[k]) throw new Error(`--${k} is required`); return o[k]; };
const input = (p) => { const text = fs.readFileSync(p === "-" ? 0 : p, "utf8"); return { text, value: JSON.parse(text) }; };

function validateCatalogue(c) {
  if (c.schemaVersion !== 1 || typeof c.observedAt !== "string" || !Number.isFinite(Date.parse(c.observedAt))
    || typeof c.source !== "string" || !c.source.trim() || !Array.isArray(c.capabilities) || !Array.isArray(c.workerModels)
    || typeof c.proxyModel !== "string" || !c.proxyModel.trim() || typeof c.coordinatorModel !== "string" || !c.coordinatorModel.trim())
    throw new Error("invalid runtime capability catalogue");
  const ids = new Set();
  for (const cap of c.capabilities) {
    if (!object(cap) || typeof cap.id !== "string" || !cap.id.trim() || ids.has(cap.id)
      || !["tool", "skill", "agent-route", "model"].includes(cap.kind) || typeof cap.description !== "string"
      || typeof cap.authority !== "string" || !cap.authority.trim()
      || !["object", "string"].includes(cap.inputKind ?? "object")
      || (cap.inputDescription !== undefined && typeof cap.inputDescription !== "string")
      || (cap.inputKind === "string" && cap.argumentsSchema !== undefined)) throw new Error("invalid or duplicate capability");
    ids.add(cap.id);
    if (cap.argumentsSchema) { const check = checkSchemaSubset(cap.argumentsSchema); if (!check.ok) throw new Error(check.errors.join("; ")); }
  }
  for (const w of c.workerModels) if (!object(w) || typeof w.model !== "string" || !w.model.trim() || w.model === "inherit"
    || !Array.isArray(w.efforts) || !w.efforts.length || w.efforts.some((e) => typeof e !== "string" || !e.trim() || e === "inherit"))
    throw new Error("invalid explicit worker model/efforts");
  return c;
}
const catalogueOf = (p) => validateCatalogue(json(p));

function makeCatalogue(o) {
  const metadata = input(required(o, "from")).value;
  const extra = o.extra ? json(o.extra) : [];
  if (!Array.isArray(metadata) || !Array.isArray(extra)) throw new Error("catalogue inputs must be JSON arrays");
  const capabilities = new Map();
  for (const entry of [...metadata, ...extra]) {
    if (!object(entry)) throw new Error("invalid runtime tool metadata entry");
    const id = entry.id ?? entry.name;
    const inputKind = entry.inputKind ?? "object";
    const cap = { ...entry, id, kind: entry.kind ?? "tool", inputKind,
      authority: entry.authority ?? "host platform approval applies" };
    if (entry.argumentsSchema !== undefined || entry.parameters !== undefined) cap.argumentsSchema = entry.argumentsSchema ?? entry.parameters;
    if (!capabilities.has(id)) capabilities.set(id, cap);
  }
  const result = { schemaVersion: 1, observedAt: new Date().toISOString(), source: "runtime-advertised metadata with directly declared extras",
    capabilities: [...capabilities.values()], workerModels: JSON.parse(required(o, "worker-models")),
    proxyModel: required(o, "proxy-model"), coordinatorModel: required(o, "coordinator-model") };
  const out = path.resolve(required(o, "out"));
  validateCatalogue(result); save(out, result);
}

export function main(argv = process.argv.slice(2)) {
  const command = argv.shift(), o = {};
  if (["help", "--help"].includes(command) || argv.includes("--help")) { output(USAGE); return; }
  while (argv.length) {
    const flag = argv.shift(), value = argv.shift();
    if (!flag.startsWith("--") || value === undefined || Object.hasOwn(o, flag.slice(2))) throw new Error(`invalid argument: ${flag}`);
    o[flag.slice(2)] = value;
  }
  if (command === "catalogue") return makeCatalogue(o);
  if (!MUTATING.has(command) && !["status", "results"].includes(command)) throw new Error(USAGE);
  const state = path.resolve(required(o, "state")), modePath = path.join(state, "mode.json");
  if (command === "init") { stateLocation(fs.realpathSync(required(o, "cwd")), state); fs.mkdirSync(state, { recursive: true }); }
  const release = MUTATING.has(command) ? stateLock(state) : null;
  try {
    if (command === "init") {
      const cwd = fs.realpathSync(required(o, "cwd"));
      if (fs.existsSync(modePath)) throw new Error("mode already exists");
      const adapter = required(o, "adapter"), selected = required(o, "model");
      const model = /^(opus|sonnet|haiku|fable)$/i.test(selected) ? selected.toLowerCase() : selected;
      const family = /^(claude-|opus$|sonnet$|haiku$|fable$)/i.test(model) ? "claude" : /^gpt-|^(sol|luna|astra)$/i.test(model) ? "codex" : "opencode";
      if (adapter !== family) throw new Error(`model ${model} requires adapter ${family}`);
      const catalogue = path.resolve(required(o, "catalogue")); catalogueOf(catalogue);
      fs.mkdirSync(state, { recursive: true });
      save(modePath, { schemaVersion: 1, adapter, model, cwd, catalogue, agents: {}, requests: {}, lineage: [], round: 0,
        currentReport: null, lastCompletedReport: null, external_session: null });
      return;
    }
    const mode = json(modePath);
    if (command === "status") { output(`${JSON.stringify({ currentReport: mode.currentReport, lastCompletedReport: mode.lastCompletedReport,
      published: Boolean(mode.publications?.[mode.lastCompletedReport]?.published), ordersPath: mode.ordersPath ?? null,
      publications: mode.publications ?? {}, requests: mode.requests, rejectedRequests: mode.rejectedRequests ?? [] })}\n`); return; }
    const catalogue = catalogueOf(command === "finish" ? mode.currentCataloguePath ?? mode.catalogue : mode.catalogue);
    if (command === "prepare") {
      if (mode.currentReport) throw new Error("finish the current report before preparing another");
      if (Object.values(mode.requests).some((r) => r.state === "dispatched_outcome_unknown")) throw new Error("record every dispatched outcome before continuation");
      const message = fs.readFileSync(required(o, "message-file"), "utf8");
      const facts = fs.readFileSync(required(o, "host-facts"), "utf8");
      const results = o.results ? fs.readFileSync(o.results, "utf8") : null;
      if (results) JSON.parse(results);
      const reference = fs.readFileSync(path.join(HERE, "../references/main-proxy.md"), "utf8");
      const orders = reference.split("## Agent orders\n")[1]?.split("\n## ")[0];
      if (!orders) throw new Error("main-proxy.md has no Agent orders section");
      const round = mode.round + 1, dir = path.join(state, `round-${round}`), report = path.join(dir, "report.json");
      fs.mkdirSync(dir);
      const cataloguePath = path.join(dir, "catalogue.json"); save(cataloguePath, catalogue);
      const prompt = `RIGHTS: read ${mode.cwd}\nMODEL: ${mode.model}\nALLOW_NO_COMMANDS: yes\nOUTPUT_SCHEMA: ${SCHEMA}\n`
        + (mode.lastCompletedReport ? `RESUME: ${mode.lastCompletedReport}\n` : "")
        + `TASK:\n${mode.lastCompletedReport ? "" : `## Agent orders\n${orders}\n`}CAPABILITY_CATALOGUE:\n${JSON.stringify(catalogue)}\nHOST_FACTS:\n${facts}\n`
        + (results ? `RESULTS:\n${results}\n` : "") + `USER_MESSAGE (verbatim text encoded as a JSON string):\n${JSON.stringify(message)}`;
      fs.writeFileSync(path.join(dir, "prompt.txt"), prompt, { mode: 0o600 });
      const prepared = spawnSync(process.execPath, [ENTRY, "--new", "--adapter", mode.adapter, "--report-file", report], { input: prompt, encoding: "utf8", env: { ...process.env, ENTRUST_STATE_DIR: state } });
      if (prepared.status !== 0 || /REFUSED=/.test(prepared.stdout)) {
        mode.round = round;
        mode.lastPreparationError = { report, stdout: prepared.stdout, stderr: prepared.stderr, exitCode: prepared.status };
        save(modePath, mode);
        throw new Error(`preparation failed: ${prepared.stdout}${prepared.stderr}`);
      }
      Object.assign(mode, { round, currentReport: report, currentCataloguePath: cataloguePath }); save(modePath, mode);
      output(`ENTRUST_STATE_DIR=${quote(state)} ${quote(process.execPath)} ${quote(ENTRY)} --run --watch --report-file ${quote(report)}\n`);
    } else if (command === "finish") {
      if (!mode.currentReport) {
        const published = mode.publications?.[mode.lastCompletedReport];
        if (published?.published) throw new Error(`already finished; batch published at ${published.ordersPath}; reconcile via status`);
        throw new Error("no prepared report");
      }
      if (mode.publications?.[mode.currentReport]?.published)
        throw new Error(`already finished; batch published at ${mode.publications[mode.currentReport].ordersPath}; reconcile via status`);
      const report = json(mode.currentReport);
      if (!Number.isInteger(report.exitCode) || !report.ok || !report.receiptOk || !report.outputSchemaOk || report.partial)
        throw new Error("coordinator report is not terminal, valid and attributed");
      const session = report.sessionID ?? report.threadId;
      const parentReport = mode.lastCompletedReport, parentSession = mode.external_session;
      if (report.adapter !== mode.adapter || canonical(report.cwd) !== canonical(mode.cwd) || report.requestedModel !== mode.model)
        throw new Error("report does not match the prepared adapter/model/cwd");
      if (parentReport && report.resumedFrom !== parentReport && !(mode.adapter === "opencode" && report.resume && session === parentSession)) throw new Error("continuation does not link the last completed report");
      if (parentReport && report.resumedFromSession != null && report.resumedFromSession !== parentSession) throw new Error("continuation parent session mismatch");
      const next = { ...mode, external_session: session };
      let orders;
      try { orders = readAgentOrders(report, next, catalogue); }
      catch (e) {
        if (!Array.isArray(report.answerJson?.requests) || !report.answerJson.requests.length) throw e;
        const rejected = report.answerJson.requests.map((request) => ({ id: request.id, request, report: mode.currentReport,
          state: "recorded", rejected: true, outcome: { status: e.message.startsWith("unknown capability:") ? "unsupported" : "refused", error: e.message } }));
        next.rejectedRequests = [...(mode.rejectedRequests ?? []), ...rejected];
        next.lineage = [...mode.lineage, { report: mode.currentReport, parentReport, parentSession, session, evidence: "report-link" }];
        Object.assign(next, { lastCompletedReport: mode.currentReport, currentReport: null, ordersPath: null, final_answer: "" });
        save(modePath, next);
        throw new Error(`request batch rejected without dispatch: ${e.message}; return results to the coordinator`);
      }
      for (const request of orders.requests) if (Object.hasOwn(mode.requests, request.id)) throw new Error(`request id already dispatched: ${request.id}`);
      const ordersPath = path.join(path.dirname(mode.currentReport), "orders.json"); save(ordersPath, orders);
      next.lineage = [...mode.lineage, { report: mode.currentReport, parentReport, parentSession, session, evidence: "report-link" }];
      next.requests = { ...mode.requests };
      for (const request of orders.requests) put(next.requests, request.id, { request, report: mode.currentReport, state: "dispatched_outcome_unknown" });
      next.publications = { ...mode.publications, [mode.currentReport]: { published: true, ordersPath } };
      Object.assign(next, { published: true, lastCompletedReport: mode.currentReport, currentReport: null, ordersPath, final_answer: orders.final_answer });
      save(modePath, next); output(`${JSON.stringify(orders)}\n`);
    } else if (command === "bind") {
      const id = required(o, "agent-id"), native = input(required(o, "native-json"));
      const order = Object.values(mode.requests).findLast((r) => r.request.agent_id === id && ["delegate", "continue"].includes(r.request.action) && r.state === "dispatched_outcome_unknown");
      if (!order) throw new Error(`no pending worker request: ${id}`);
      const model = required(o, "model"), effort = required(o, "effort");
      const expected = order.request.action === "delegate" ? order.request : mode.agents[id];
      if (model !== (expected.model ?? mode.defaultWorker?.model) || effort !== (expected.effort ?? mode.defaultWorker?.effort)) throw new Error("worker binding model/effort differs from the order");
      const identity = native.value.agent_id ?? native.value.native_agent ?? native.value.id ?? native.value.task_name;
      if (typeof identity !== "string" || !identity.trim()) throw new Error("native result has no observed worker identity");
      if (order.request.action === "continue" && identity !== mode.agents[id].native_agent) throw new Error("continuation must keep the bound native identity");
      put(mode.agents, id, { ...mode.agents[id], native_agent: identity, nativeResult: native.value, nativeJson: native.text, model, effort,
        replyPath: path.resolve(required(o, "reply-path")), scope: expected.scope ?? null });
      Object.assign(order, { state: "recorded", outcome: native.value, outcomeJson: native.text }); save(modePath, mode);
    } else if (command === "record") {
      const id = required(o, "request-id"), record = Object.hasOwn(mode.requests, id) ? mode.requests[id] : null;
      if (!record || record.state !== "dispatched_outcome_unknown") throw new Error(`no pending request: ${id}`);
      const outcome = input(required(o, "outcome-json"));
      if (record.request.action === "collect" && !["completed", "failed", "cancelled"].includes(outcome.value?.status))
        throw new Error(`collect outcome is not terminal: ${id}`);
      Object.assign(record, { state: "recorded", outcome: outcome.value, outcomeJson: outcome.text });
      if (record.request.action === "collect") record.replies = record.request.agent_ids.map((agent_id) => {
        const replyPath = mode.agents[agent_id]?.replyPath;
        try { const bytes = fs.readFileSync(replyPath); return { agent_id, replyPath, content: bytes.toString("utf8"), sha256: hash(bytes) }; }
        catch (e) { return { agent_id, replyPath: replyPath ?? null, delivery_error: e.message }; }
      });
      save(modePath, mode);
    } else if (command === "results") {
      const results = [...Object.entries(mode.requests).map(([id, r]) => ({ id, ...r })), ...(mode.rejectedRequests ?? [])];
      output(`${JSON.stringify({ AGENT_RESULTS: results.filter((r) => r.request.action !== "invoke"), REQUEST_RESULTS: results.filter((r) => r.request.action === "invoke") })}\n`);
    } else throw new Error(USAGE);
  } finally { release?.(); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { process.stderr.write(`${e.message}\n`); process.exitCode = 2; }
}
