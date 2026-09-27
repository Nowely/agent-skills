// Probe client for codex app-server approvals. One run = one app-server child, one thread, one turn.
// Usage: node probe.mjs <config.json>
// config: { name, dir, cwd, prompt, model, effort, mode: "accept"|"hold"|"error",
//           holdSec, allowCommand, allowFilePath, afterErrorWaitSec, maxRunSec, errorCap }
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const cfg = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const T0 = Date.now();
const transcript = path.join(cfg.dir, `transcript-${cfg.name}.jsonl`);
const log = (dir, data) => fs.appendFileSync(transcript,
  JSON.stringify({ t: new Date().toISOString(), dt: Date.now() - T0, dir, data }) + "\n");
const note = (s) => { log("note", s); process.stdout.write(`[${((Date.now() - T0) / 1000).toFixed(1)}s] ${s}\n`); };

// Private CODEX_HOME made the driver's way: auth.json and sessions linked to ~/.codex, own config.toml.
const home = path.join(cfg.dir, `home-${cfg.name}`);
fs.mkdirSync(home, { recursive: true, mode: 0o700 });
for (const n of ["auth.json", "sessions"]) {
  const link = path.join(home, n), target = path.join(os.homedir(), ".codex", n);
  if (!fs.existsSync(link)) fs.symlinkSync(target, link);
}
fs.writeFileSync(path.join(home, "config.toml"), `model = "${cfg.model}"\n`);

// The read level's -c overrides, as the driver sends them (network true, web search disabled).
const config = [
  ["web_search", "disabled"],
  ["permissions.entrust_read.extends", '":read-only"'],
  ["permissions.entrust_read.filesystem", '{":tmpdir"="write"}'],
  ["permissions.entrust_read.network", "{enabled=true}"],
  ["default_permissions", '"entrust_read"'],
  ["model_reasoning_effort", cfg.effort]
];
const args = ["--strict-config", ...config.flatMap(([k, v]) => ["-c", `${k}=${v}`]), "app-server"];
log("spawn", { cmd: "codex", args, CODEX_HOME: home });
const child = spawn("codex", args, { stdio: ["pipe", "pipe", "pipe"], detached: true,
  env: { ...process.env, CODEX_HOME: home } });
note(`app-server pid ${child.pid}`);
let exited = null;
child.on("exit", (code, signal) => { exited = { code, signal, at: Date.now() }; note(`app-server exit code=${code} signal=${signal}`); });
child.stderr.on("data", (d) => log("stderr", String(d)));

let buf = "", nextId = 1;
const pending = new Map();
const send = (msg) => { const line = JSON.stringify(msg); log(">", line); child.stdin.write(line + "\n"); };
const request = (method, params) => new Promise((res, rej) => {
  const id = nextId++; pending.set(id, { res, rej, method }); send({ jsonrpc: "2.0", id, method, params });
});
child.stdout.on("data", (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    log("<", line);
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    handle(msg);
  }
});

// Process-tree sampler: logs the app-server's descendants whenever the set changes.
let lastTree = "";
const seenPids = new Map();
function sampleTree() {
  let out;
  try { out = execFileSync("ps", ["-axo", "pid=,ppid=,pgid=,command="], { encoding: "utf8" }); } catch { return; }
  const rows = out.split("\n").filter(Boolean).map((l) => {
    const m = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/.exec(l); return m && { pid: +m[1], ppid: +m[2], pgid: +m[3], cmd: m[4] };
  }).filter(Boolean);
  const inTree = new Set([child.pid]);
  let grew = true;
  while (grew) { grew = false; for (const r of rows) if (!inTree.has(r.pid) && inTree.has(r.ppid)) { inTree.add(r.pid); grew = true; } }
  const tree = rows.filter((r) => inTree.has(r.pid) && r.pid !== child.pid)
    .map((r) => `${r.pid} ${r.ppid} ${r.cmd.slice(0, 400)}`).join("\n");
  for (const r of rows) if (inTree.has(r.pid) && r.pid !== child.pid) seenPids.set(r.pid, r.cmd.slice(0, 200));
  if (tree !== lastTree) { lastTree = tree; log("ps", tree); }
}
const sampler = setInterval(sampleTree, 500);

const items = new Map();      // itemId -> item (from item/started / item/completed)
let turnDone = null, errorsSent = 0, approvalsSeen = 0;
const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
function commandMatches(cmd) {
  const c = norm(cmd), want = norm(cfg.allowCommand);
  if (!want) return false;
  if (c === want) return true;
  const m = /^(?:\/bin\/|\/usr\/bin\/)?(?:ba|z)?sh -l?c (['"])(.*)\1$/.exec(c);
  return Boolean(m && norm(m[2]) === want);
}
const waitFor = (pred, ms) => new Promise((res) => {
  const t0 = Date.now(); const iv = setInterval(() => { const v = pred(); if (v || Date.now() - t0 > ms) { clearInterval(iv); res(v); } }, 100);
});
async function fileChangeMatches(itemId) {
  const item = await waitFor(() => items.get(itemId), 3000);
  const paths = (item?.changes ?? []).map((c) => c.path);
  note(`fileChange item ${itemId} paths ${JSON.stringify(paths)}`);
  if (!paths.length || !cfg.allowFilePath) return false;
  const ok = (p) => p === cfg.allowFilePath || p === "/private" + cfg.allowFilePath;
  return paths.every(ok);
}

async function handle(msg) {
  if (msg.id !== undefined && !msg.method) {
    const p = pending.get(msg.id); if (!p) return; pending.delete(msg.id);
    msg.error ? p.rej(Object.assign(new Error(JSON.stringify(msg.error)), { rpc: msg.error })) : p.res(msg.result);
    return;
  }
  if (msg.method && msg.id === undefined) {
    const it = msg.params?.item;
    if (it?.id && (msg.method === "item/started" || msg.method === "item/completed")) items.set(it.id, it);
    if (msg.method === "item/started" && it) note(`item/started ${it.type} ${it.command ?? ""}`);
    if (msg.method === "item/completed" && it?.type === "commandExecution")
      note(`item/completed commandExecution status=${it.status} exit=${it.exitCode} cmd=${it.command}`);
    if (msg.method === "item/completed" && it?.type === "fileChange") note(`item/completed fileChange status=${it.status}`);
    if (msg.method === "serverRequest/resolved") note(`serverRequest/resolved ${JSON.stringify(msg.params)}`);
    if (msg.method === "turn/completed") { turnDone = { at: Date.now(), turn: msg.params?.turn }; note(`turn/completed status=${msg.params?.turn?.status}`); }
    if (msg.method === "error") note(`error notification ${JSON.stringify(msg.params).slice(0, 300)}`);
    return;
  }
  // Server request.
  const reply = (result) => send({ jsonrpc: "2.0", id: msg.id, result });
  const replyError = (code, message) => send({ jsonrpc: "2.0", id: msg.id, error: { code, message } });
  note(`server request ${msg.method} id=${msg.id}`);
  if (msg.method === "item/commandExecution/requestApproval") {
    approvalsSeen++;
    if (cfg.closeOnCommand && norm(msg.params?.command).includes(cfg.closeOnCommand)) {
      note(`leaving request id=${msg.id} unanswered; closing stdin in ${cfg.closeDelaySec}s`);
      setTimeout(() => shutdown("stdin close with an approval request pending"), cfg.closeDelaySec * 1000);
      return;
    }
    if (!commandMatches(msg.params?.command)) { note(`declining unexpected command ${msg.params?.command}`); return reply({ decision: "decline" }); }
    if (cfg.mode === "accept") { note("accept"); return reply({ decision: "accept" }); }
    if (cfg.mode === "hold") {
      note(`holding ${cfg.holdSec}s`);
      setTimeout(() => { note("accept after hold"); reply({ decision: "accept" }); }, cfg.holdSec * 1000);
      return;
    }
    if (cfg.mode === "error") {
      if (errorsSent < (cfg.errorCap ?? 3)) { errorsSent++; note("replying with a JSON-RPC error"); return replyError(-32000, "probe: approval channel failed"); }
      note("error cap reached; declining"); return reply({ decision: "decline" });
    }
  }
  if (msg.method === "item/fileChange/requestApproval") {
    approvalsSeen++;
    if (cfg.mode === "accept" && await fileChangeMatches(msg.params?.itemId)) { note("accept fileChange"); return reply({ decision: "accept" }); }
    note("declining fileChange"); return reply({ decision: "decline" });
  }
  if (msg.method === "item/permissions/requestApproval") { note("declining permissions"); return reply({ permissions: { fileSystem: null, network: null } }); }
  if (msg.method === "applyPatchApproval" || msg.method === "execCommandApproval") return reply({ decision: "abort" });
  if (msg.method === "mcpServer/elicitation/request") return reply({ action: "decline" });
  replyError(-32601, `${msg.method} is not supported by the probe`);
}

let shuttingDown = false;
function survivors() {
  let out = ""; try { out = execFileSync("ps", ["-axo", "pid=,ppid=,pgid=,command="], { encoding: "utf8" }); } catch {}
  const alive = out.split("\n").map((l) => /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/.exec(l)).filter(Boolean)
    .filter((m) => seenPids.has(+m[1]) || +m[3] === child.pid).map((m) => `${m[1]} ppid=${m[2]} pgid=${m[3]} ${m[4].slice(0, 200)}`);
  log("survivors", alive); return alive;
}
async function shutdown(reason) {
  if (shuttingDown) return new Promise(() => {});
  shuttingDown = true;
  note(`shutdown: ${reason}; closing stdin`);
  const closedAt = Date.now();
  child.stdin.end();
  await waitFor(() => exited, 30000);
  if (exited) note(`exited ${exited.at - closedAt} ms after stdin close, code=${exited.code} signal=${exited.signal}`);
  else { note("still alive 30 s after stdin close; SIGKILL to the group"); try { process.kill(-child.pid, "SIGKILL"); } catch {} await waitFor(() => exited, 5000); }
  clearInterval(sampler);
  await new Promise((r) => setTimeout(r, 1000));
  note(`survivors after app-server exit: ${JSON.stringify(survivors())}`);
  try { process.kill(-child.pid, "SIGKILL"); } catch {}
  note(`summary approvalsSeen=${approvalsSeen} errorsSent=${errorsSent} turnStatus=${turnDone?.turn?.status ?? "none"}`);
  process.exit(0);
}

const hardStop = setTimeout(() => shutdown(`maxRunSec ${cfg.maxRunSec} reached`), cfg.maxRunSec * 1000);

try {
  const init = await request("initialize", {
    clientInfo: { name: "Claude Code", title: "entrust-probe", version: "0.0.0" },
    capabilities: { experimentalApi: false, requestAttestation: false,
      optOutNotificationMethods: ["item/reasoning/summaryTextDelta", "item/reasoning/summaryPartAdded", "item/reasoning/textDelta", "item/plan/delta"] }
  });
  note(`userAgent ${init?.userAgent}`);
  send({ jsonrpc: "2.0", method: "initialized" });
  const developerInstructions = [
    "You are being driven by a Claude Code coordinator, unattended.",
    "There is no wall-clock limit on this turn; it is cut only by the coordinator. Take the time the work needs, keep working visibly rather than pausing, and say what you did not get to if you are cut.",
    "Do not use web search.",
    "You have network access: use it for what is not in this checkout, keep to the hosts this task names, and cite what you fetched.",
    "If a command cannot run, record it in one line — the command, whether it started, its exit status if there was one, and the exact diagnostic — then continue. Write \"unknown\" for what you could not observe rather than inferring it.",
    "State uncertainty plainly rather than guessing; an honest 'I could not determine this' is useful."
  ].join(" ");
  const th = await request("thread/start", { cwd: cfg.cwd, model: cfg.model, approvalPolicy: "on-request",
    approvalsReviewer: "user", developerInstructions, serviceName: "claude-code-entrust-probe" });
  note(`thread ${th?.thread?.id} approvalPolicy=${th?.approvalPolicy} reviewer=${th?.approvalsReviewer} sandbox=${JSON.stringify(th?.sandbox)} profile=${JSON.stringify(th?.activePermissionProfile ?? null)}`);
  if (cfg.dryRun) { const ml = await request("model/list", {}); note("models " + JSON.stringify((ml?.data ?? ml?.models ?? []).map((m) => m.id ?? m.model))); await shutdown("dry run"); }
  await request("turn/start", { threadId: th.thread.id, input: [{ type: "text", text: cfg.prompt, text_elements: [] }],
    model: cfg.model, effort: null });
  note("turn started");
} catch (e) { note(`handshake failed: ${e.message}`); await shutdown("handshake failure"); }

// Wait for the turn; in error mode, give it afterErrorWaitSec after the first error before closing stdin.
await waitFor(() => turnDone || exited || (cfg.mode === "error" && errorsSent > 0), cfg.maxRunSec * 1000);
if (!turnDone && !exited && cfg.mode === "error") {
  note(`error sent; waiting up to ${cfg.afterErrorWaitSec}s for turn/completed`);
  await waitFor(() => turnDone || exited, cfg.afterErrorWaitSec * 1000);
}
clearTimeout(hardStop);
await new Promise((r) => setTimeout(r, 1500));
await shutdown(turnDone ? "turn completed" : exited ? "child exited" : "turn did not complete");
