#!/usr/bin/env node
// Offline state loop through the real launcher and fake Claude; complete outcomes and fork lineage.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, EVALS, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";
import { readAgentOrders } from "../plugin/skills/orchestrate/scripts/agent-orders.mjs";
const { cases, test: register } = registry();
const test = (name, fn) => register(name, name, async () => { await fn(); return true; });
const HELPER = path.join(ROOT, "skills/orchestrate/scripts/main-proxy.mjs"), ENTRY = path.join(ROOT, "skills/orchestrate/scripts/agent-run.mjs");
const catalogue = () => ({ schemaVersion: 1, observedAt: new Date().toISOString(), source: "offline runtime fixture",
  capabilities: [{ id: "host.read", kind: "tool", description: "Read", authority: "host platform approval applies", runtimeAvailable: true,
    argumentsSchema: { type: "object", properties: { path: { type: "string", minLength: 1 } }, required: ["path"], additionalProperties: false } }],
  workerModels: [{ model: "gpt-6.1-sol", efforts: ["high"] }, { model: "gpt-6-luna", efforts: ["medium"] }], proxyModel: "gpt-6-luna", coordinatorModel: "opus" });
const delegate = { id: "d", action: "delegate", agent_id: "worker", task: "Implement approved task", scope: "isolated worktree", model: "gpt-6.1-sol", effort: "high" };
const collect = { id: "c", action: "collect", agent_ids: ["worker"] };
const invoke = { id: "i", action: "invoke", capability: "host.read", arguments: { path: "README.md" }, purpose: "inspect" };
const envelope = (requests = [], final_answer = "") => ({ plan: "", requests, final_answer });
const report = (answerJson) => ({ ok: true, receiptOk: true, outputSchemaOk: true, partial: false, sessionID: "session", answerJson });
function setup() {
  const dir = tempDir("entrust-main-proxy-"), state = path.join(dir, "mode"), work = path.join(dir, "work"), bin = path.join(dir, "bin");
  fs.mkdirSync(work); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, "claude"), `#!/bin/sh\nexec "${process.execPath}" "${path.join(EVALS, "fake-claude.mjs")}" "$@"\n`, { mode: 0o755 });
  const cat = path.join(dir, "catalogue.json"), message = path.join(dir, "message.txt"), facts = path.join(dir, "facts.txt");
  fs.writeFileSync(cat, JSON.stringify(catalogue())); fs.writeFileSync(facts, "Approved scope: " + work);
  const env = { PATH: `${bin}${path.delimiter}${process.env.PATH}`, ENTRUST_STATE_DIR: state,
    FAKE_CLAUDE_LOG: path.join(dir, "calls.jsonl"), FAKE_CLAUDE_MODE: "structured", AGENT_RUN_RETURN_MS: "10000" };
  const run = (command, args = [], input) => spawnSync(process.execPath, [HELPER, command, "--state", state, ...args], { encoding: "utf8", input, env: { ...process.env, ...env } });
  const ok = (command, args = [], input) => { const r = run(command, args, input); assert.equal(r.status, 0, r.stdout + r.stderr); return r.stdout; };
  ok("init", ["--adapter", "claude", "--model", "Opus", "--cwd", work, "--catalogue", cat]);
  return { dir, state, cat, message, facts, env, run, ok, mode: () => JSON.parse(fs.readFileSync(path.join(state, "mode.json"), "utf8")) };
}
async function round(s, message, answer, results, beforeFinish, rejected = false) {
  fs.writeFileSync(s.message, message);
  const command = s.ok("prepare", ["--message-file", s.message, "--host-facts", s.facts, ...(results ? ["--results", results] : [])]);
  const before = s.mode(); assert.ok(command.includes("--run --watch")); assert.ok(command.includes(before.currentReport));
  const terminal = await spawnNode([ENTRY, "--run", "--watch", "--report-file", before.currentReport], { env: { ...s.env, FAKE_CLAUDE_OUTPUT: JSON.stringify(answer) }, killAfterMs: 30000 }).done;
  assert.equal(terminal.code, 0, terminal.out + terminal.err); assert.match(terminal.out, /^EXIT=0$/m);
  if (beforeFinish) beforeFinish();
  if (rejected) { const r = s.run("finish"); assert.equal(r.status, 2); assert.match(r.stderr, /rejected without dispatch/); }
  else assert.deepEqual(JSON.parse(s.ok("finish")), answer);
  return JSON.parse(fs.readFileSync(before.currentReport, "utf8"));
}
test("offline round preserves user message, native JSON, whole collect/invoke outcomes and fork lineage", async () => {
  const s = setup(), user = 'Привет! @annotation\nВыбор: Sol\nApproval: да\r\n"$\\"\n';
  const first = await round(s, user, envelope([delegate, collect, invoke]));
  const reply = path.join(s.dir, "reply.md"), content = '## Полный ответ\n' + 'деталь "$\\"\n'.repeat(1000); fs.writeFileSync(reply, content);
  const native = '{ "agent_id": "/root/worker-123", "opaque": {"value": "unchanged"} }\n';
  s.ok("bind", ["--agent-id", "worker", "--native-json", "-", "--model", delegate.model, "--effort", delegate.effort, "--reply-path", reply], native);
  s.ok("record", ["--request-id", "c", "--outcome-json", "-"], '{ "status": "completed" }\n');
  const host = '{ "content": [{"type":"text","text":"tool result\\nwhole"}], "opaque": [1,2] }\n';
  s.ok("record", ["--request-id", "i", "--outcome-json", "-"], host);
  const results = s.ok("results"), value = JSON.parse(results);
  assert.deepEqual(value.AGENT_RESULTS.map((r) => r.id), ["d", "c"]); assert.equal(value.AGENT_RESULTS[0].outcomeJson, native);
  assert.equal(value.AGENT_RESULTS[1].replies[0].content, content);
  assert.equal(value.AGENT_RESULTS[1].replies[0].sha256, crypto.createHash("sha256").update(content).digest("hex"));
  assert.equal(value.REQUEST_RESULTS[0].outcomeJson, host); assert.equal(s.mode().agents.worker.nativeJson, native);
  const resultPath = path.join(s.dir, "results.json"); fs.writeFileSync(resultPath, results);
  const final = await round(s, "", envelope([], "Готово. Полный ответ."), resultPath);
  assert.equal(final.resumedFromSession, first.sessionID); assert.notEqual(final.sessionID, first.sessionID);
  assert.equal(s.mode().lineage[1].parentSession, first.sessionID); assert.equal(s.mode().lineage[1].evidence, "report-link");
  const calls = fs.readFileSync(s.env.FAKE_CLAUDE_LOG, "utf8").trim().split("\n").map(JSON.parse);
  assert.ok(calls[0].task.endsWith(`USER_MESSAGE (verbatim text encoded as a JSON string):\n${JSON.stringify(user)}`)); assert.ok(calls[0].task.includes("## Agent orders"));
  assert.ok(calls[1].task.includes(results)); assert.ok(calls[0].task.includes('"runtimeAvailable":true'));
});
test("terminal delegates deliver complete replies without collect into the next prompt", async () => {
  const s = setup(), second = { ...delegate, id: "e", agent_id: "second" };
  await round(s, "start", envelope([delegate, second, invoke]));
  const expected = new Map();
  for (const worker of [delegate, second]) {
    const reply = path.join(s.dir, `${worker.agent_id}.md`);
    const content = `Привет 🌍 "${worker.agent_id}"\r\n` + 'строка "quotes" \\ $\n'.repeat(6000) + "TAIL >64 KiB\r\nКонец 🐈\n";
    const bytes = Buffer.from(content); assert.ok(bytes.length > 65536);
    fs.writeFileSync(reply, bytes); expected.set(worker.id, { bytes, reply });
    const native = ` { "agent_id": "native-${worker.agent_id}", "status": "running" }\n`;
    s.ok("bind", ["--agent-id", worker.agent_id, "--native-json", "-", "--model", worker.model, "--effort", worker.effort, "--reply-path", reply], native);
    const outcome = ` { "status": "completed", "final": "[Reply](${reply})" }\n`;
    const recorded = s.run("record", ["--request-id", worker.id, "--outcome-json", "-"], outcome);
    assert.equal(recorded.status, 0, `terminal delegate record must finalize after spawn binding: ${recorded.stderr}`);
    assert.equal(s.mode().requests[worker.id].outcomeJson, outcome);
    assert.equal(s.mode().agents[worker.agent_id].nativeJson, native);
  }
  const tool = ' { "content": "полный invoke\\r\\n\\"quotes\\"" }\n';
  s.ok("record", ["--request-id", "i", "--outcome-json", "-"], tool);
  const results = s.ok("results"), value = JSON.parse(results);
  assert.deepEqual(value.AGENT_RESULTS.map((r) => r.id), ["d", "e"]);
  assert.equal(value.REQUEST_RESULTS[0].outcomeJson, tool);
  for (const result of value.AGENT_RESULTS) {
    const { bytes, reply } = expected.get(result.id), delivered = result.replies[0];
    assert.equal(delivered.agent_id, result.request.agent_id); assert.equal(delivered.replyPath, reply);
    assert.deepEqual(Buffer.from(delivered.content), bytes);
    assert.equal(delivered.sha256, crypto.createHash("sha256").update(bytes).digest("hex"));
    fs.writeFileSync(reply, "changed after publication");
    assert.match(s.run("record", ["--request-id", result.id, "--outcome-json", "-"], '{"status":"completed"}').stderr, /no pending request/);
  }
  assert.equal(s.ok("results"), results);
  const resultPath = path.join(s.dir, "results.json"); fs.writeFileSync(resultPath, results);
  await round(s, "", envelope([], "done"), resultPath);
  const prompt = fs.readFileSync(path.join(s.state, "round-2", "prompt.txt"), "utf8");
  const forwarded = JSON.parse(prompt.split("RESULTS:\n")[1].split("\nUSER_MESSAGE")[0]);
  for (const result of forwarded.AGENT_RESULTS) {
    const bytes = expected.get(result.id).bytes;
    assert.deepEqual(Buffer.from(result.replies[0].content), bytes);
    assert.equal(result.replies[0].sha256, crypto.createHash("sha256").update(bytes).digest("hex"));
  }
  assert.equal(forwarded.REQUEST_RESULTS[0].outcomeJson, tool);
});

test("spawn records do not read replies; terminal bind and continue publish once with delivery errors", async () => {
  const s = setup(), missing = path.join(s.dir, "missing.md");
  await round(s, "start", envelope([delegate]));
  const readLog = path.join(s.dir, "reply-reads.txt"), preload = path.join(s.dir, "reply-reads.cjs");
  fs.writeFileSync(preload, `const fs = require('node:fs'), read = fs.readFileSync;
fs.readFileSync = function(p, ...args) { if (String(p) === ${JSON.stringify(missing)}) fs.appendFileSync(${JSON.stringify(readLog)}, 'read\\n'); return read.call(this, p, ...args); };`);
  s.env.NODE_OPTIONS = `--require=${preload}`;
  s.ok("bind", ["--agent-id", "worker", "--native-json", "-", "--model", delegate.model, "--effort", delegate.effort, "--reply-path", missing], '{"agent_id":"native","status":"running"}');
  assert.equal(Object.hasOwn(s.mode().requests.d, "replies"), false);
  assert.equal(fs.existsSync(readLog), false, "non-terminal bind must not read the reply file");
  assert.match(s.run("record", ["--request-id", "d", "--outcome-json", "-"], '{"status":"running"}').stderr, /not terminal/);
  assert.equal(fs.existsSync(readLog), false, "non-terminal record must not read the reply file");
  const follow = { id: "next", action: "continue", agent_id: "worker", task: "Follow up" };
  await round(s, "follow up", envelope([follow]));
  const nextReply = path.join(s.dir, "next.md"); fs.writeFileSync(nextReply, "complete continuation\r\n🐈");
  s.ok("bind", ["--agent-id", "worker", "--native-json", "-", "--model", delegate.model, "--effort", delegate.effort, "--reply-path", nextReply], '{"agent_id":"native","status":"spawned"}');
  assert.equal(Object.hasOwn(s.mode().requests.next, "replies"), false);
  s.ok("record", ["--request-id", "d", "--outcome-json", "-"], '{"status":"failed","final":"missing reply"}');
  assert.equal(fs.readFileSync(readLog, "utf8"), "read\n");
  const failed = s.mode().requests.d;
  assert.equal(failed.replies[0].replyPath, missing); assert.match(failed.replies[0].delivery_error, /ENOENT/);
  s.ok("record", ["--request-id", "next", "--outcome-json", "-"], '{"status":"cancelled"}');
  assert.equal(s.mode().requests.next.replies[0].content, "complete continuation\r\n🐈");
  assert.match(s.run("record", ["--request-id", "next", "--outcome-json", "-"], '{"status":"completed"}').stderr, /no pending request/);
  const terminal = setup(); readyFinish(terminal, [delegate]); terminal.ok("finish");
  const reply = path.join(terminal.dir, "reply.md"); fs.writeFileSync(reply, "terminal bind reply");
  terminal.ok("bind", ["--agent-id", "worker", "--native-json", "-", "--model", delegate.model, "--effort", delegate.effort, "--reply-path", reply], '{ "agent_id":"native", "status":"completed" }\n');
  assert.equal(terminal.mode().requests.d.replies[0].content, "terminal bind reply");
});

test("unbound worker refusals preserve raw outcomes and permit the next prepare", async () => {
  const s = setup(), workers = [delegate, { ...delegate, id: "unsupported", agent_id: "unsupported" }, { ...delegate, id: "error", agent_id: "error" }];
  await round(s, "start", envelope(workers));
  const outcomes = [' { "status": "refused", "reason": "host denied spawn Привет" }\n',
    ' { "status": "unsupported", "reason": "route unavailable" }\n', ' { "error": { "message": "spawn failed before identity" } }\n'];
  for (let i = 0; i < workers.length; i++) {
    const id = workers[i].id, result = s.run("record", ["--request-id", id, "--outcome-json", "-"], outcomes[i]);
    assert.equal(result.status, 0, `unbound spawn outcome must be recorded: ${result.stderr}`);
    const saved = s.mode().requests[id];
    assert.equal(saved.state, "recorded"); assert.equal(saved.outcomeJson, outcomes[i]);
    assert.deepEqual(saved.outcome, JSON.parse(outcomes[i]));
    assert.equal(Object.hasOwn(saved, "replies"), false, "unbound outcome must not invent reply delivery");
    assert.match(s.run("record", ["--request-id", id, "--outcome-json", "-"], '{"status":"failed"}').stderr, /no pending request/);
  }
  const results = s.ok("results"), value = JSON.parse(results);
  assert.deepEqual(value.AGENT_RESULTS.map((r) => r.outcomeJson), outcomes);
  const resultPath = path.join(s.dir, "refusals.json"); fs.writeFileSync(resultPath, results);
  await round(s, "", envelope([], "refusals received"), resultPath);
});

test("unbound completed is refused and a refused continuation does not read its prior binding", async () => {
  const s = setup(); await round(s, "start", envelope([delegate]));
  assert.match(s.run("record", ["--request-id", "d", "--outcome-json", "-"], '{"status":"completed"}').stderr, /completed worker outcome requires a binding/);
  assert.equal(s.mode().requests.d.state, "dispatched_outcome_unknown");
  s.ok("record", ["--request-id", "d", "--outcome-json", "-"], '{"status":"refused"}');
  const mode = s.mode(); mode.agents.worker = { native_agent: "old-native", replyPath: path.join(s.dir, "old-missing.md"), model: delegate.model, effort: delegate.effort };
  fs.writeFileSync(path.join(s.state, "mode.json"), JSON.stringify(mode));
  const follow = { id: "next", action: "continue", agent_id: "worker", task: "Follow up" };
  await round(s, "follow up", envelope([follow]));
  const raw = ' { "status": "refused", "reason": "host denied continuation" }\n';
  s.ok("record", ["--request-id", "next", "--outcome-json", "-"], raw);
  const saved = s.mode().requests.next; assert.equal(saved.outcomeJson, raw); assert.equal(Object.hasOwn(saved, "replies"), false);
  assert.match(s.run("record", ["--request-id", "next", "--outcome-json", "-"], '{"status":"failed"}').stderr, /no pending request/);
  await round(s, "", envelope([], "continuation refused"));
});

test("catalogue refuses unknown capabilities, invalid arguments, inherited models and unlisted efforts", () => {
  const mode = { external_session: "session", agents: {} }, cat = catalogue();
  assert.equal(readAgentOrders(report(envelope([delegate, invoke])), mode, cat).requests.length, 2);
  for (const [request, why] of [[{ ...invoke, capability: "unknown" }, /unknown capability: unknown/], [{ ...invoke, arguments: { path: 1 } }, /host.read/],
    [{ ...delegate, model: null }, /explicit model/], [{ ...delegate, effort: null }, /explicit model/], [{ ...delegate, model: "inherit" }, /explicit model/],
    [{ ...delegate, effort: "max" }, /unsupported worker/]]) assert.throws(() => readAgentOrders(report(envelope([request])), mode, cat), why);
  assert.equal(readAgentOrders(report(envelope([{ ...delegate, model: null, effort: null }])), { ...mode, defaultWorker: { model: delegate.model, effort: delegate.effort } }, cat).requests.length, 1);
  assert.throws(() => readAgentOrders(report(envelope([invoke])), mode, { ...cat, capabilities: [{ ...cat.capabilities[0], argumentsSchema: { not: {} } }] }), /unsupported keyword/);
});
test("pending outcomes block continuation; missing reply files produce delivery_error", async () => {
  const s = setup(); await round(s, "start", envelope([delegate, collect]));
  assert.match(s.run("prepare", ["--message-file", s.message, "--host-facts", s.facts]).stderr, /record every dispatched outcome/);
  s.ok("bind", ["--agent-id", "worker", "--native-json", "-", "--model", delegate.model, "--effort", delegate.effort, "--reply-path", path.join(s.dir, "missing.md")], '{"agent_id":"native"}');
  s.ok("record", ["--request-id", "c", "--outcome-json", "-"], '{"status":"completed"}');
  assert.match(JSON.parse(s.ok("results")).AGENT_RESULTS[1].replies[0].delivery_error, /ENOENT/);
  assert.match(s.run("record", ["--request-id", "c", "--outcome-json", "-"], '{}').stderr, /no pending request/);
});
test("invalid finish and wrong worker model preserve the saved dispatch state", async () => {
  const s = setup(); await round(s, "start", envelope([delegate]));
  assert.match(s.run("bind", ["--agent-id", "worker", "--native-json", "-", "--model", "gpt-6-luna", "--effort", "medium", "--reply-path", "/tmp/reply"], '{"agent_id":"native"}').stderr, /differs from the order/);
  assert.deepEqual(s.mode().agents, {}); assert.equal(s.mode().requests.d.state, "dispatched_outcome_unknown");
  const fresh = setup(); fs.writeFileSync(fresh.message, "start"); fresh.ok("prepare", ["--message-file", fresh.message, "--host-facts", fresh.facts]);
  const before = fs.readFileSync(path.join(fresh.state, "mode.json"), "utf8");
  fs.writeFileSync(fresh.mode().currentReport, JSON.stringify({ ...report(envelope([], "done")), exitCode: 13, outputSchemaOk: false }));
  assert.match(fresh.run("finish").stderr, /not terminal, valid and attributed/);
  assert.equal(fs.readFileSync(path.join(fresh.state, "mode.json"), "utf8"), before);
});
test("finish validates the per-invocation catalogue snapshot, preserving refreshed metadata separately", async () => {
  const s = setup(); assert.equal(s.mode().model, "opus");
  await round(s, "inspect", envelope([invoke]), null, () => fs.writeFileSync(s.cat, JSON.stringify({ ...catalogue(), capabilities: [] })));
  assert.equal(s.mode().requests.i.request.capability, "host.read");
  assert.equal(JSON.parse(fs.readFileSync(s.mode().currentCataloguePath, "utf8")).capabilities[0].runtimeAvailable, true);
});
test("unknown capability rejects the whole batch and returns every id through the next RESUME", async () => {
  const s = setup();
  const first = await round(s, "inspect", envelope([delegate, { ...invoke, capability: "unavailable" }]), null, null, true);
  assert.deepEqual(s.mode().agents, {}); assert.deepEqual(s.mode().requests, {}); assert.equal(s.mode().ordersPath, null);
  const results = s.ok("results"), value = JSON.parse(results);
  assert.equal(value.REQUEST_RESULTS[0].id, "i"); assert.equal(value.REQUEST_RESULTS[0].outcome.status, "unsupported");
  assert.equal(value.AGENT_RESULTS[0].id, "d"); assert.equal(value.AGENT_RESULTS[0].rejected, true);
  const resultPath = path.join(s.dir, "rejections.json"); fs.writeFileSync(resultPath, results);
  const final = await round(s, "", envelope([], "Capability unavailable."), resultPath);
  assert.equal(final.resumedFromSession, first.sessionID);
});
test("init refuses a checkout state directory and mismatched model-family adapter", () => {
  const s = setup();
  const run = (state, adapter) => spawnSync(process.execPath, [HELPER, "init", "--state", state, "--adapter", adapter, "--model", "opus", "--cwd", ROOT, "--catalogue", s.cat], { encoding: "utf8" });
  assert.match(run(path.join(ROOT, "forbidden-state"), "claude").stderr, /outside the checkout/);
  assert.match(run(path.join(s.dir, "wrong"), "opencode").stderr, /requires adapter claude/);
  assert.equal(fs.existsSync(path.join(ROOT, "forbidden-state")), false);
});

function readyFinish(s, requests) {
  const mode = s.mode(), reportPath = path.join(s.state, "fixture-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ ...report(envelope(requests)), adapter: "claude", cwd: mode.cwd, requestedModel: "opus", exitCode: 0 }));
  fs.writeFileSync(path.join(s.state, "mode.json"), JSON.stringify({ ...mode, currentReport: reportPath }));
}
function barrier(s, command, args = [], crash = false) {
  const preload = path.join(s.dir, `barrier-${Math.random()}.cjs`), ready = preload + ".ready", go = preload + ".go", contended = preload + ".contended";
  fs.writeFileSync(preload, `const fs=require('node:fs');
const read=fs.readFileSync,open=fs.openSync,write=fs.writeSync;
fs.readFileSync=function(p,...a){const v=read.call(this,p,...a);if(String(p)===process.env.PAUSE_MODE&&process.env.PAUSE_READY){fs.writeFileSync(process.env.PAUSE_READY,'ready');while(!fs.existsSync(process.env.PAUSE_GO))Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,5);}return v;};
fs.openSync=function(p,...a){try{return open.call(this,p,...a);}catch(e){if(e.code==='EEXIST'&&String(p).endsWith('/state.lock')&&process.env.CONTENDED)fs.writeFileSync(process.env.CONTENDED,'contended');throw e;}};
fs.writeSync=function(fd,...a){if(fd===1&&process.env.CRASH_STDOUT)throw Error('simulated stdout crash');return write.call(this,fd,...a);};`);
  const launch = (paused) => spawnNode(["--require", preload, HELPER, command, "--state", s.state, ...args], {
    env: { ...s.env, PAUSE_MODE: path.join(s.state, "mode.json"), ...(paused ? { PAUSE_READY: ready, PAUSE_GO: go } : { CONTENDED: contended }), ...(crash ? { CRASH_STDOUT: "1" } : {}) }, killAfterMs: 10000 });
  return { launch, ready, go, contended };
}
async function until(predicate) {
  const end = Date.now() + 5000;
  while (!predicate()) { assert.ok(Date.now() < end, "barrier timed out"); await new Promise((r) => setTimeout(r, 5)); }
}

test("concurrent finish publishes once; status reconciles a stdout crash without republishing", async () => {
  const s = setup(); readyFinish(s, [invoke]);
  const b = barrier(s, "finish"), first = b.launch(true); await until(() => fs.existsSync(b.ready));
  const second = b.launch(false); await until(() => fs.existsSync(b.contended));
  fs.writeFileSync(b.go, "go"); const a = await first.done, c = await second.done;
  assert.equal(a.code, 0, a.err); assert.deepEqual(JSON.parse(a.out).requests, [invoke]);
  assert.equal(c.code, 2); assert.equal(c.out, ""); assert.match(c.err, /already finished; batch published at .*; reconcile via status/);
  assert.equal(s.mode().publications[s.mode().lastCompletedReport].published, true);
  const crashed = setup(); readyFinish(crashed, [invoke]);
  const inject = barrier(crashed, "finish", [], true); const lost = await inject.launch(false).done;
  assert.equal(lost.code, 2); assert.equal(lost.out, ""); assert.match(lost.err, /simulated stdout crash/);
  const status = JSON.parse(crashed.ok("status")); assert.equal(status.published, true); assert.ok(status.ordersPath);
  assert.equal(status.requests.i.state, "dispatched_outcome_unknown");
  const retry = crashed.run("finish"); assert.equal(retry.stdout, ""); assert.match(retry.stderr, /already finished/);
});

test("concurrent record re-reads state under the lock and keeps both complete outcomes", async () => {
  const s = setup(); readyFinish(s, [invoke, { ...invoke, id: "j" }]); s.ok("finish");
  const firstOutcome = path.join(s.dir, "first.json"), secondOutcome = path.join(s.dir, "second.json");
  fs.writeFileSync(firstOutcome, '{ "value": "first" }\n'); fs.writeFileSync(secondOutcome, '{ "value": "second" }\n');
  const b = barrier(s, "record", ["--request-id", "i", "--outcome-json", firstOutcome]);
  const a = b.launch(true); await until(() => fs.existsSync(b.ready));
  const c = spawnNode(["--require", b.ready.replace(/\.ready$/, ""), HELPER, "record", "--state", s.state, "--request-id", "j", "--outcome-json", secondOutcome],
    { env: { ...s.env, CONTENDED: b.contended }, killAfterMs: 10000 });
  await until(() => fs.existsSync(b.contended)); fs.writeFileSync(b.go, "go");
  assert.equal((await a.done).code, 0); assert.equal((await c.done).code, 0);
  assert.equal(s.mode().requests.i.outcome.value, "first"); assert.equal(s.mode().requests.j.outcome.value, "second");
  assert.match(s.run("record", ["--request-id", "i", "--outcome-json", firstOutcome]).stderr, /no pending request/);
});

test("stale dead-owner lock is reported without breaking it; read-only status remains available", () => {
  const s = setup(), dead = spawnSync(process.execPath, ["-e", "process.stdout.write(String(process.pid))"], { encoding: "utf8" });
  const lock = path.join(s.state, "state.lock"), text = JSON.stringify({ pid: Number(dead.stdout), startedAt: new Date().toISOString(), token: "old" }); fs.writeFileSync(lock, text);
  assert.match(s.run("finish").stderr, /stale state lock.*dead pid/);
  assert.equal(fs.readFileSync(lock, "utf8"), text); assert.deepEqual(JSON.parse(s.ok("status")).requests, {});
});

test("defaultWorker fills nulls but never bypasses the runtime model and effort catalogue", () => {
  const r = report(envelope([{ ...delegate, model: null, effort: null }]));
  const mode = { external_session: "session", agents: {}, defaultWorker: { model: delegate.model, effort: delegate.effort } };
  assert.equal(readAgentOrders(r, mode, catalogue()).requests.length, 1);
  for (const cat of [{ ...catalogue(), workerModels: [] }, { ...catalogue(), workerModels: [{ model: delegate.model, efforts: ["low"] }] }])
    assert.throws(() => readAgentOrders(r, mode, cat), /unsupported worker model\/effort/);
  assert.throws(() => readAgentOrders(r, { ...mode, defaultWorker: { model: "inherit", effort: "high" } }, catalogue()), /explicit model/);
});

test("raw string invoke round-trips patch bytes; catalogue kind mismatches are rejected", async () => {
  const s = setup(), patch = '*** Begin Patch\r\n+Привет "quotes" \\ $\n*** End Patch\r\n';
  const cat = catalogue(); cat.capabilities.push({ id: "apply_patch", kind: "tool", description: "Apply patch", inputKind: "string", inputDescription: "Raw patch", authority: "existing authority" });
  fs.writeFileSync(s.cat, JSON.stringify(cat));
  const raw = { id: "patch", action: "invoke", capability: "apply_patch", input: patch, purpose: "approved patch" };
  await round(s, "apply approved change", envelope([raw]));
  const validated = JSON.parse(fs.readFileSync(s.mode().ordersPath, "utf8")); assert.deepEqual(Buffer.from(validated.requests[0].input), Buffer.from(patch));
  const nativeResult = '{ "text": "verbatim result\\r\\nПривет \\"quote\\" \\\\" }\n';
  s.ok("record", ["--request-id", "patch", "--outcome-json", "-"], nativeResult);
  const delivered = JSON.parse(s.ok("results")).REQUEST_RESULTS[0];
  assert.deepEqual(Buffer.from(delivered.request.input), Buffer.from(patch)); assert.equal(delivered.outcomeJson, nativeResult);
  const mode = { external_session: "session", agents: {} };
  assert.throws(() => readAgentOrders(report(envelope([{ ...invoke, capability: "apply_patch" }])), mode, cat), /kind mismatch/);
  assert.throws(() => readAgentOrders(report(envelope([{ ...raw, capability: "host.read" }])), mode, cat), /kind mismatch/);
});

test("collect requires an observed terminal status before reading the canonical artifact", () => {
  const s = setup(), mode = s.mode(), reply = path.join(s.dir, "reply.md"); fs.writeFileSync(reply, "whole reply");
  mode.agents.worker = { native_agent: "worker", replyPath: reply };
  fs.writeFileSync(path.join(s.state, "mode.json"), JSON.stringify(mode)); readyFinish(s, [collect]); s.ok("finish");
  for (const outcome of [{}, { status: "running" }, { status: "unknown" }])
    assert.match(s.run("record", ["--request-id", "c", "--outcome-json", "-"], JSON.stringify(outcome)).stderr, /not terminal/);
  assert.equal(s.mode().requests.c.state, "dispatched_outcome_unknown");
  s.ok("record", ["--request-id", "c", "--outcome-json", "-"], '{"status":"failed"}');
  assert.equal(s.mode().requests.c.replies[0].content, "whole reply");
});

test("help needs no state; catalogue reads whole large runtime metadata, merges extras and preserves descriptions", () => {
  for (const help of ["help", "--help"]) {
    const r = spawnSync(process.execPath, [HELPER, help], { encoding: "utf8" }); assert.equal(r.status, 0);
    for (const subcommand of ["catalogue", "init", "prepare", "finish", "bind", "record", "results", "status"]) assert.ok(r.stdout.includes(subcommand));
  }
  const dir = tempDir("entrust-catalogue-"), from = path.join(dir, "tools.json"), extra = path.join(dir, "extra.json"), out = path.join(dir, "catalogue.json");
  const tools = Array.from({ length: 1200 }, (_, i) => ({ name: `runtime.${i}`, description: `whole ${i} ` + "description\n".repeat(50), parameters: { type: "object" } }));
  fs.writeFileSync(from, JSON.stringify(tools)); fs.writeFileSync(extra, JSON.stringify([{ name: "runtime.0", description: "duplicate" }, { id: "functions.exec", description: "JavaScript source", inputKind: "string", inputDescription: "raw source", kind: "tool" }]));
  const args = [HELPER, "catalogue", "--from", from, "--extra", extra, "--out", out, "--proxy-model", "gpt-6-luna", "--coordinator-model", "opus", "--worker-models", JSON.stringify(catalogue().workerModels)];
  assert.equal(spawnSync(process.execPath, args, { encoding: "utf8" }).status, 0);
  const c = JSON.parse(fs.readFileSync(out, "utf8")); assert.equal(c.capabilities.length, 1201);
  assert.equal(c.capabilities[0].description, tools[0].description); assert.equal(c.capabilities[0].inputKind, "object");
  assert.deepEqual(c.capabilities[0].argumentsSchema, { type: "object" }); assert.equal(c.capabilities.at(-1).inputKind, "string");
  const stdin = [...args]; stdin[stdin.indexOf("--from") + 1] = "-";
  assert.equal(spawnSync(process.execPath, stdin, { input: JSON.stringify(tools), encoding: "utf8" }).status, 0);
});

process.exit(summarize(await runCases(cases), cases.length));
