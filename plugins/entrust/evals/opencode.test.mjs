#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawnSync } from "node:child_process";
import { ROOT, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";
import { recentModels, splitModel, connection, digest } from "../plugin/skills/opencode/scripts/config.mjs";
import { Client } from "../plugin/skills/opencode/scripts/client.mjs";
import { V2Client, validateProfile, normalizeMessages } from "../plugin/skills/opencode/scripts/v2-client.mjs";
import { parsePrompt, FIVE_FIELDS_SCHEMA, checkSchemaSubset, validateOutput, decisionFits, extractJson } from "../plugin/skills/opencode/scripts/contract.mjs";
import { outOfScope } from "../plugin/skills/opencode/scripts/driver.mjs";
import { fakeOpenCode, fakeOpenCodeV2 } from "./fake-opencode.mjs";

const { cases, test: register } = registry();
const test = (name, fn) => register(name, name, async () => { await fn(); return true; });
const ENTRY = path.join(ROOT, "skills/opencode/scripts/agent-run.mjs");
const STATUS = path.join(ROOT, "skills/opencode/scripts/status.mjs");
const SHARED = path.join(ROOT, "skills/codex/scripts/agent-run.mjs");
const cwd = tempDir("entrust-opencode-cwd-");
const model = "router/deepseek/deepseek-flash";
const prompt = (extra = "", rights = `read ${cwd}`) => `RIGHTS: ${rights}\n${extra}TASK: inspect the supplied evidence\n`;
function invoke(args, input = "", env = {}) {
  const p = spawnNode(args, { env, stdio: ["pipe", "pipe", "pipe"], killAfterMs: 15000 });
  p.child.stdin.end(input);
  return p.done;
}
function recent(state) {
  const file = path.join(tempDir("entrust-opencode-models-"), "model.json");
  fs.writeFileSync(file, JSON.stringify(state));
  return { ENTRUST_OPENCODE_MODEL_STATE: file };
}
test("recent discovery returns only the first two distinct saved models and preserves router slashes", () => {
  const env = recent({ recent: [{ providerID: "router", modelID: "deepseek/flash" }, { providerID: "router", modelID: "deepseek/flash" },
    { providerID: "router", modelID: "z-ai/glm" }, { providerID: "router", modelID: "other" }], variant: { "router/deepseek/flash": "high" } });
  assert.deepEqual(recentModels({ env }), [{ providerID: "router", modelID: "deepseek/flash", variant: "high" }, { providerID: "router", modelID: "z-ai/glm", variant: null }]);
  assert.deepEqual(splitModel(model), { providerID: "router", modelID: "deepseek/deepseek-flash" });
});
test("malformed recent refs are skipped and malformed containers refuse", () => {
  const env = recent({ recent: [{ providerID: "bad/provider", modelID: "a" }, { providerID: "", modelID: "b" }, { providerID: "router", modelID: "good" }] });
  assert.equal(recentModels({ env }).length, 1);
  assert.throws(() => recentModels({ env: recent({ recent: {} }) }), /array/);
  assert.throws(() => recentModels({ env, limit: 0 }), /1\.\.100/);
});
test("server URL cannot carry credentials, redirects of ownership or query data", () => {
  for (const url of ["https://u:secret@localhost", "file:///tmp/server", "http://localhost?a=b", "http://localhost#x"])
    assert.throws(() => connection({ ENTRUST_OPENCODE_URL: url }));
  const file = path.join(tempDir("entrust-opencode-connection-"), "connection.json");
  fs.writeFileSync(file, JSON.stringify({ url: "http://localhost:80", password: "private" }));
  assert.equal(connection({ ENTRUST_OPENCODE_CONNECTION: file, ENTRUST_OPENCODE_URL: "http://localhost/" }).url, "http://localhost");
  assert.throws(() => connection({ ENTRUST_OPENCODE_CONNECTION: file, ENTRUST_OPENCODE_URL: "http://localhost:81" }), /another server/);
  assert.deepEqual(connection({}), { local: true });
});
test("default answer schema comes from the existing Codex contract", () => {
  assert.equal(FIVE_FIELDS_SCHEMA, path.join(ROOT, "skills/codex/schemas/five-fields.schema.json"));
  assert.equal(parsePrompt(prompt(), {}).error, undefined);
});
test("registered model cannot inherit or silently substitute", () => {
  const env = { ENTRUST_PLAN_MODEL: model };
  for (const header of ["", "MODEL: inherit\n", "MODEL: router/other\n"])
    assert.ok(parsePrompt(prompt(header), env).error);
  assert.equal(parsePrompt(prompt(`MODEL: ${model}\n`), env).error, undefined);
});
test("unsupported execution controls refuse before any HTTP call", () => {
  for (const header of ["NETWORK: no\n", "WEB_SEARCH: disabled\n", "UNKNOWN: yes\n", "VARIANT: low\nEFFORT: high\n"])
    assert.ok(parsePrompt(prompt(header), {}).error);
});
test("approved write root rejects another root even when rights kind matches", () => {
  const outside = tempDir("entrust-opencode-outside-");
  const error = parsePrompt(prompt("", `write ${outside}`), { ENTRUST_PLAN_WRITES: `write ${cwd}` }).error;
  assert.ok(error && !error.includes("schema"), String(error));
});
test("malformed schema branches are refused, and required fields are checked", () => {
  assert.equal(checkSchemaSubset({ type: "object", oneOf: [] }).ok, false);
  const s = JSON.parse(fs.readFileSync(path.join(ROOT, "skills/codex/schemas/five-fields.schema.json"), "utf8"));
  assert.equal(validateOutput(s, { status: "done" }).ok, false);
});
test("oneOf validates exactly one branch and checks every nested schema", () => {
  const schema = { oneOf: [{ type: "string" }, { type: "integer" }] };
  assert.equal(checkSchemaSubset(schema).ok, true);
  assert.equal(validateOutput(schema, "text").ok, true);
  assert.equal(validateOutput(schema, 2).ok, true);
  assert.equal(validateOutput(schema, null).ok, false);
  assert.equal(validateOutput({ oneOf: [{ type: "number" }, { type: "integer" }] }, 2).ok, false);
  for (const oneOf of [null, {}, [], [{ oneOf: [] }], [{ not: {} }]])
    assert.equal(checkSchemaSubset({ oneOf }).ok, false);
});
test("main proxy schema accepts calls or a full answer, rejects empty, mixed and mistyped replies", () => {
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, "skills/opencode/schemas/main-proxy.schema.json"), "utf8"));
  assert.equal(checkSchemaSubset(schema).ok, true);
  const call = { id: "a", tool: "spawn_agent", input: JSON.stringify({ task_name: "a" }) };
  assert.equal(validateOutput(schema, { plan: "delegate", calls: [call], final_answer: "" }).ok, true);
  assert.equal(validateOutput(schema, { plan: "", calls: [], final_answer: "complete reply" }).ok, true);
  for (const answer of [
    { plan: "", calls: [], final_answer: "" },
    { plan: "", calls: [call], final_answer: "reply" },
    { plan: "", calls: [], final_answer: "reply", kind: "calls" },
    { plan: "", calls: [{ ...call, input: {} }], final_answer: "" },
  ]) assert.equal(validateOutput(schema, answer).ok, false, JSON.stringify(answer));
});
test("schema bounds and prototype-named fields cannot bypass validation", () => {
  assert.equal(checkSchemaSubset({ type: "number", minimum: "bad" }).ok, false);
  assert.equal(checkSchemaSubset({ type: "array", minItems: -1 }).ok, false);
  assert.equal(validateOutput({ type: "object", required: ["toString"] }, {}).ok, false);
  assert.equal(validateOutput({ type: "object", properties: {}, additionalProperties: false }, JSON.parse('{"toString":"x"}')).ok, false);
});
test("wrapped JSON preserves escaped quotes, braces and nested objects", () => {
  for (const value of [{ result: 'a"b' }, { result: 'a"{b' }, { result: 'a\\\"{' }, { result: { nested: "}" } }])
    assert.deepEqual(extractJson('prefix\n' + JSON.stringify(value) + '\nsuffix'), value);
  assert.deepEqual(extractJson('{"old":true}\n{"new":{"value":1}}'), { new: { value: 1 } });
  assert.deepEqual(extractJson('He said "{oops" {"status":"done"}'), { status: "done" });
});
test("relative permission targets resolve from the session directory", () => {
  assert.equal(outOfScope({ roots: [cwd] }, { permission: "edit", metadata: { filePath: "file.txt" } }, cwd), null);
  assert.match(outOfScope({ roots: [cwd] }, { permission: "edit", metadata: { filePath: "../outside.txt" } }, cwd), /outside/);
});
test("OpenCode entrypoint rejects an appended Codex adapter", async () => {
  const r = await invoke([ENTRY, "--adapter", "codex", "--help"]);
  assert.equal(r.code, 2); assert.match(r.err, /only accepts adapter opencode/);
});
test("extended registry keeps explicit backend and full model ID", async () => {
  const run = tempDir("entrust-opencode-plan-");
  const r = await invoke([SHARED, "--plan", "--run-dir", run], `id | adapter | model | role | writes | tokens\na | opencode | ${model} | inspect | nothing | unknown\n`);
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(fs.readFileSync(path.join(run, "plan.txt"), "utf8"), /a \| opencode \| router\/deepseek\/deepseek-flash/);
});
test("an OpenCode registry row must pin a provider/model", async () => {
  const r = await invoke([SHARED, "--plan", "--run-dir", tempDir("entrust-opencode-plan-")], "a | opencode | inherit | inspect | nothing | unknown\n");
  assert.equal(r.code, 2); assert.match(r.out + r.err, /resolve and pin/);
});
test("new invocation persists its backend and server without copying credentials", async () => {
  const state = tempDir("entrust-opencode-new-");
  const report = path.join(state, "run/a/report.json"), connectionFile = path.join(state, "connection.json");
  fs.writeFileSync(connectionFile, JSON.stringify({ url: "http://localhost:4096", password: "private-secret" }));
  const env = { ENTRUST_STATE_DIR: state, ENTRUST_OPENCODE_CONNECTION: connectionFile, ENTRUST_OPENCODE_URL: undefined };
  const r = await invoke([ENTRY, "--new", "--report-file", report], prompt(`MODEL: ${model}\n`), env);
  assert.equal(r.code, 0, r.out + r.err);
  const saved = fs.readFileSync(path.join(path.dirname(report), "agent/backend.json"), "utf8");
  assert.equal(saved.includes("private-secret"), false);
  assert.deepEqual(JSON.parse(saved), { adapter: "opencode", planModel: null, planWrites: null, serverUrl: "http://localhost:4096", connectionFile });
  const mismatch = await invoke([SHARED, "--adapter", "codex", "--status", "--report-file", report], "", env);
  assert.equal(mismatch.code, 2); assert.match(mismatch.out + mismatch.err, /belongs to opencode/);
});
test("new invocation defaults to a managed local server without endpoint configuration", async () => {
  const state = tempDir("entrust-opencode-new-"); const report = path.join(state, "run/a/report.json");
  const r = await invoke([ENTRY, "--new", "--report-file", report], prompt(), { ENTRUST_STATE_DIR: state,
    ENTRUST_OPENCODE_CONNECTION: undefined, ENTRUST_OPENCODE_URL: undefined });
  assert.equal(r.code, 0, r.out + r.err);
  assert.equal(fs.existsSync(path.join(path.dirname(report), "agent/prompt.txt")), true);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(path.dirname(report), "agent/backend.json"), "utf8")),
    { adapter: "opencode", planModel: null, planWrites: null, localServer: true });
});
function mailbox(type = "opencode.permission") {
  const dir = tempDir("entrust-opencode-mailbox-");
  const box = path.join(dir, "approvals"); fs.mkdirSync(box);
  const id = "1-1234abcd";
  const payload = type.endsWith("question") ? { id: "que_native", sessionID: "ses_owned", questions: [{ header: "Mode", question: "Choose", options: [{ label: "Read" }], custom: false }] }
    : { id: "per_native", sessionID: "ses_owned", permission: "bash", patterns: ["node *"], metadata: { command: "node check.mjs" } };
  const q = { id, type, payload, presented: JSON.stringify(payload, null, 2), requestHash: digest(payload),
    remote: { serverURL: "http://localhost:4096", sessionID: payload.sessionID, requestID: payload.id, invocationId: "inv_owned" },
    run: { pid: process.pid, startedAtMs: Date.now(), threadId: payload.sessionID, turnId: "msg_owned" }, deadlineAt: new Date(Date.now() + 30000).toISOString(), settled: null };
  fs.writeFileSync(path.join(box, `${id}.request.json`), JSON.stringify(q));
  fs.writeFileSync(path.join(box, "pending"), id + "\n");
  return { dir, box, id, q, args: [ENTRY, "--dir", dir, "--report-file", path.join(dir, "report.json")] };
}
test("permission handback contains the full immutable native request", async () => {
  const m = mailbox(); const r = await invoke([...m.args, "--pending"]);
  assert.equal(r.code, 0); assert.ok(r.out.includes(m.q.presented)); assert.match(r.out, /TYPE=opencode.permission/);
});
test("once approval requires exact body and is published only once", async () => {
  const m = mailbox(); const a = [...m.args, "--decide", m.id, "--accept"];
  assert.equal((await invoke(a, m.q.payload.metadata.command)).code, 2);
  assert.equal((await invoke(a, m.q.presented + "\n")).code, 0);
  assert.equal((await invoke(a, m.q.presented)).code, 2);
  const decision = JSON.parse(fs.readFileSync(path.join(m.box, `${m.id}.decision.json`)));
  assert.equal(decision.requestHash, m.q.requestHash); assert.deepEqual(decision.remote, m.q.remote);
});
test("mutated native request is rejected before decision publication", async () => {
  const m = mailbox(); m.q.payload.metadata.command = "different command";
  fs.writeFileSync(path.join(m.box, `${m.id}.request.json`), JSON.stringify(m.q));
  assert.equal((await invoke([...m.args, "--decide", m.id, "--decline"])).code, 2);
  assert.equal(fs.existsSync(path.join(m.box, `${m.id}.decision.json`)), false);
});
test("question answer is typed, validated and cannot use permission accept", async () => {
  const m = mailbox("opencode.question"); const a = [...m.args, "--decide", m.id];
  assert.equal((await invoke([...a, "--accept"], m.q.presented)).code, 2);
  assert.equal((await invoke([...a, "--answer"], '{"answers":[["Write"]]}')).code, 2);
  assert.equal((await invoke([...a, "--answer"], '{"answers":[["Read"]]}')).code, 0);
});
test("driver refuses a decision belonging to the wrong callback type", () => {
  for (const type of ["opencode.question", "opencode.permission"]) {
    const m = mailbox(type);
    const d = { id: m.q.id, run: m.q.run, remote: m.q.remote, requestHash: m.q.requestHash,
      decision: type.endsWith("question") ? "accept" : "answer" };
    assert.equal(decisionFits(d, m.q), false);
    d.decision = "decline"; assert.equal(decisionFits(d, m.q), true);
  }
});
test("HTTP mutation is never retried after a response is lost", async () => {
  let count = 0;
  const server = http.createServer((req, res) => { count++; req.socket.destroy(); });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const client = new Client({ config: { url: `http://127.0.0.1:${server.address().port}` }, timeoutMs: 1000 });
    await assert.rejects(client.call("POST", "/session", { title: "one" }), /outcome unknown/);
    assert.equal(count, 1);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
test("catalogue needs positive connection evidence and never substitutes a model", async () => {
  const client = new Client({ config: { url: "http://localhost" } });
  let count = 0;
  client.call = async () => { count++; return { all: [{ id: "router", models: { "deepseek/deepseek-flash": {} } }] }; };
  await assert.rejects(client.model(splitModel(model)), /unavailable/);
  await assert.rejects(client.model(splitModel("router/other")), /no substitute/);
  assert.equal(count, 1);
});
const DRIVER = path.join(ROOT, "skills/opencode/scripts/driver.mjs");
function fakeCli(url, dir) {
  const bin = path.join(dir, "fake-bin"); fs.mkdirSync(bin, { recursive: true });
  const stopFile = path.join(dir, "opencode-stopped");
  const script = path.join(bin, "opencode");
  fs.writeFileSync(script, `#!/usr/bin/env node\nconst fs=require("node:fs");\nconsole.log("server listening on "+process.env.FAKE_OPENCODE_URL);\nprocess.on("SIGTERM",()=>{fs.writeFileSync(process.env.FAKE_OPENCODE_STOP_FILE,"stopped");process.exit(0)});\nsetInterval(()=>{},1000);\n`, { mode: 0o755 });
  return { stopFile, env: { PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`,
    FAKE_OPENCODE_URL: url, FAKE_OPENCODE_STOP_FILE: stopFile } };
}
async function driverRun(server, { headers = "", approval = null, resume = null, cancel = false, cancelWhenPending = false, pendingCount = 1, cancelOn = null, rights = `read ${cwd}`, savedModel = "deepseek/flash", localServer = false, localUrl = server.url } = {}) {
  const state = tempDir("entrust-opencode-driver-");
  const dir = path.join(state, "invocation"); fs.mkdirSync(dir);
  const input = path.join(dir, "prompt.txt"), report = path.join(dir, "report.json"), box = path.join(dir, "approvals");
  fs.writeFileSync(input, prompt(`ALLOW_NO_COMMANDS: yes\n${resume ? `RESUME: ${resume}\n` : ""}${headers}`, rights));
  const env = { ENTRUST_STATE_DIR: state, ENTRUST_OPENCODE_URL: localServer ? undefined : server.url, ENTRUST_OPENCODE_CONNECTION: undefined,
    ...recent({ recent: [{ providerID: "router", modelID: savedModel }], variant: { "router/deepseek/flash": "high" } }) };
  const cli = localServer ? fakeCli(localUrl, state) : null;
  if (cli) Object.assign(env, cli.env);
  const p = spawnNode([DRIVER, "--prompt-file", input, "--report-file", report, "--timeout", "9", "--idle-timeout", "4",
    ...(approval ? ["--approval-dir", box] : [])], { env, killAfterMs: 20000 });
  const promptsBefore = server.prompts;
  try {
    if (approval || cancel) {
      const end = Date.now() + 10000; let acted = false;
      while (Date.now() < end && !acted && p.child.exitCode === null) {
        if (cancel && !cancelWhenPending && server.prompts > promptsBefore) { p.child.kill("SIGTERM"); acted = true; }
        else if (fs.existsSync(box)) {
          const files = fs.readdirSync(box).filter((f) => f.endsWith(".request.json"));
          const file = files[0];
          if (file && files.length >= pendingCount) {
            if (cancel && cancelWhenPending) { p.child.kill("SIGTERM"); acted = true; break; }
            const q = JSON.parse(fs.readFileSync(path.join(box, file)));
            const r = await invoke([ENTRY, "--dir", dir, "--report-file", report, "--decide", q.id, approval === "answer" ? "--answer" : approval === "decline" ? "--decline" : "--accept"],
              approval === "answer" ? '{"answers":[["Read"]]}' : approval === "decline" ? "" : q.presented + "\n");
            assert.equal(r.code, 0, r.out + r.err); acted = true;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      assert.equal(acted, true, p.stderrSoFar());
    }
    if (cancelOn) {
      const end = Date.now() + 10000;
      while (!cancelOn() && Date.now() < end && p.child.exitCode === null)
        await new Promise((resolve) => setTimeout(resolve, 10));
      assert.equal(cancelOn(), true, "controlled cancellation boundary was not reached");
      p.child.kill("SIGTERM");
    }
    const result = await p.done;
    return { ...result, report: fs.existsSync(report) ? JSON.parse(fs.readFileSync(report)) : null, path: report, box, stopFile: cli?.stopFile };
  } finally { if (p.child.exitCode === null) p.child.kill("SIGKILL"); }
}
test("a default run starts and stops its private loopback server", async () => {
  const s = await fakeOpenCode();
  try {
    const r = await driverRun(s, { localServer: true });
    assert.equal(r.code, 0, r.err); assert.equal(r.report.serverMode, "local");
    assert.equal(fs.readFileSync(r.stopFile, "utf8"), "stopped");
  } finally { await s.close(); }
});
test("local continuation can reconnect through a fresh server URL", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s, { localServer: true }); assert.equal(first.code, 0, first.err);
    const second = await driverRun(s, { localServer: true, localUrl: s.url.replace("127.0.0.1", "localhost"), resume: first.path });
    assert.equal(second.code, 0, second.err); assert.equal(second.report.resume, true);
  } finally { await s.close(); }
});
test("driver uses first recent model and stays within one HTTP execution family", async () => {
  const s = await fakeOpenCode();
  try {
    const r = await driverRun(s); assert.equal(r.code, 0, r.err); assert.equal(r.report.receiptOk, true);
    assert.equal(r.report.model, "router/deepseek/flash");
    const post = s.calls.find((c) => c.path.endsWith("prompt_async"));
    assert.deepEqual(post.body.model, { providerID: "router", modelID: "deepseek/flash" }); assert.equal(post.body.variant, "high");
    assert.equal(s.calls.some((c) => c.path.startsWith("/api/")), false);
  } finally { await s.close(); }
});
test("missing required V1 route refuses before creating a session or submitting input", async () => {
  const s = await fakeOpenCode("missing-route");
  try { const r = await driverRun(s); assert.equal(r.code, 2, r.err); assert.equal(s.prompts, 0);
    assert.equal(s.calls.some((c) => c.path === "/session" && c.method === "POST"), false); }
  finally { await s.close(); }
});
test("native permission reaches mailbox, receives once, and foreign request remains untouched", async () => {
  const s = await fakeOpenCode("permission");
  try {
    const r = await driverRun(s, { approval: "accept" }); assert.equal(r.code, 0, r.err);
    assert.deepEqual(s.mutations.map((m) => m.body), [{ reply: "once" }]);
    assert.equal(s.replies.some((q) => q.id === "per_foreign"), true);
  } finally { await s.close(); }
});
test("native question receives a structured answer through its separate route", async () => {
  const s = await fakeOpenCode("question");
  try { const r = await driverRun(s, { approval: "answer" }); assert.equal(r.code, 0, r.err); assert.deepEqual(s.mutations[0].body, { answers: [["Read"]] }); }
  finally { await s.close(); }
});
test("lost prompt response is reconciled by input ID without resending", async () => {
  const s = await fakeOpenCode("lost-response");
  try { const r = await driverRun(s); assert.equal(r.code, 0, r.err); assert.equal(s.prompts, 1); }
  finally { await s.close(); }
});
test("one schema correction is included in invocation usage", async () => {
  const s = await fakeOpenCode("correction");
  try { const r = await driverRun(s); assert.equal(r.code, 0, r.err); assert.equal(s.prompts, 2); assert.ok(r.report.usage?.input >= 10, JSON.stringify(r.report.usage)); }
  finally { await s.close(); }
});
test("main proxy mixed reply is corrected by the driver before reaching the host", async () => {
  const s = await fakeOpenCode("main-proxy-correction");
  try {
    const schema = path.join(ROOT, "skills/opencode/schemas/main-proxy.schema.json");
    const r = await driverRun(s, { headers: `OUTPUT_SCHEMA: ${schema}\n` });
    assert.equal(r.code, 0, r.err);
    assert.equal(s.prompts, 2);
    assert.equal(r.report.receiptOk, true);
    assert.equal(r.report.outputSchemaOk, true);
    assert.deepEqual(r.report.answerJson, { plan: "", calls: [], final_answer: "Complete coordinator reply" });
    const submitted = s.calls.filter((c) => c.path.endsWith("prompt_async"));
    assert.equal(submitted[0].path, submitted[1].path);
    assert.match(JSON.stringify(submitted[1].body), /oneOf/);
  } finally { await s.close(); }
});
test("main proxy continuation repeats its schema and permits a host-only round", async () => {
  const s = await fakeOpenCode("main-proxy-correction");
  try {
    const headers = `OUTPUT_SCHEMA: ${path.join(ROOT, "skills/opencode/schemas/main-proxy.schema.json")}\n`;
    const first = await driverRun(s, { headers });
    assert.equal(first.code, 0, first.err);
    const next = await driverRun(s, { headers, resume: first.path });
    assert.equal(next.code, 0, next.err);
    assert.equal(next.report.sessionID, first.report.sessionID);
    assert.equal(next.report.outputSchemaOk, true);
    assert.equal(next.report.commands.length, 0);
    assert.equal(next.report.answerJson.final_answer, "Complete coordinator reply");
    assert.equal(s.prompts, 3);
  } finally { await s.close(); }
});
test("a failed schema correction retains the latest answer and its complete artifact", async () => {
  const s = await fakeOpenCode("invalid-correction");
  try {
    const r = await driverRun(s);
    assert.notEqual(r.code, 0);
    assert.equal(s.prompts, 2);
    assert.equal(r.report.outputSchemaOk, false);
    assert.equal(r.report.answerJson.result, "SECOND");
    assert.equal(r.report.answer, "SECOND");
    const latest = s.sessions.get(r.report.sessionID).messages.at(-1).parts[0].text;
    assert.equal(fs.readFileSync(r.report.answerPath, "utf8"), latest);
  } finally { await s.close(); }
});
test("a cut correction preserves its latest received answer as partial", async () => {
  const s = await fakeOpenCode("invalid-correction-busy");
  try {
    const r = await driverRun(s);
    assert.notEqual(r.code, 0);
    assert.equal(s.prompts, 2);
    assert.equal(r.report.partial, true);
    assert.equal(r.report.receiptOk, false);
    assert.equal(r.report.answerJson.result, "SECOND");
    const latest = s.sessions.get(r.report.sessionID).messages.at(-1).parts[0].text;
    assert.equal(r.report.answer, latest);
    assert.equal(fs.readFileSync(r.report.answerPath, "utf8"), latest);
  } finally { await s.close(); }
});
test("a cut keeps the latest partial text after an earlier completed assistant step", async () => {
  const s = await fakeOpenCode("partial-after-complete");
  try {
    const r = await driverRun(s);
    assert.notEqual(r.code, 0);
    assert.equal(s.prompts, 1);
    assert.equal(r.report.partial, true);
    assert.equal(r.report.answer, "Latest partial details");
    assert.equal(r.report.answerJson, null);
    assert.equal(fs.readFileSync(r.report.answerPath, "utf8"), "Latest partial details");
  } finally { await s.close(); }
});
test("the answer artifact preserves details outside the parsed JSON preview", async () => {
  const s = await fakeOpenCode("answer-context");
  try {
    const r = await driverRun(s);
    assert.equal(r.code, 0, r.err);
    assert.equal(s.prompts, 1);
    assert.equal(r.report.answer, "checked");
    const original = s.sessions.get(r.report.sessionID).messages.at(-1).parts[0].text;
    assert.equal(fs.readFileSync(r.report.answerPath, "utf8"), original);
    assert.ok(original.startsWith("Detail before the JSON.") && original.endsWith("Detail after the JSON."));
  } finally { await s.close(); }
});
test("continuation retains session and model but excludes old command evidence", async () => {
  const s = await fakeOpenCode("old-history");
  try {
    const first = await driverRun(s); assert.equal(first.code, 0, first.err);
    const second = await driverRun(s, { resume: first.path, savedModel: "glm/flash" }); assert.equal(second.code, 0, second.err);
    assert.equal(second.report.sessionID, first.report.sessionID); assert.equal(second.report.model, first.report.model);
    assert.deepEqual(second.report.commands, []); assert.equal(second.report.usage.input, 5);
    assert.equal(second.report.variant, "high"); assert.equal(s.calls.filter((c) => c.path.endsWith("prompt_async")).at(-1).body.variant, "high");
  } finally { await s.close(); }
});
test("cancelled report retains the selected model for continuation", async () => {
  const s = await fakeOpenCode("cancel");
  try {
    const first = await driverRun(s, { cancel: true });
    assert.equal(first.report.model, null); assert.equal(first.report.requestedModel, "router/deepseek/flash");
    assert.equal(first.report.variant, "high");
    const second = await driverRun(s, { resume: first.path, savedModel: "glm/flash", cancel: true });
    assert.equal(second.report.sessionID, first.report.sessionID);
    assert.equal(s.calls.filter((c) => c.path.endsWith("prompt_async")).at(-1).body.model.modelID, "deepseek/flash");
  } finally { await s.close(); }
});
test("worktree continuation reuses its checkout and refuses another repository", async () => {
  const s = await fakeOpenCode();
  const repo = tempDir("entrust-opencode-repo-");
  const git = (args) => { const r = spawnSync("git", ["-C", repo, ...args], { encoding: "utf8" }); assert.equal(r.status, 0, r.stderr); };
  git(["init"]); git(["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "--allow-empty", "-m", "fixture"]);
  try {
    const first = await driverRun(s, { rights: `worktree ${repo}` }); assert.equal(first.code, 0, first.err);
    const second = await driverRun(s, { rights: `worktree ${repo}`, resume: first.path });
    assert.equal(second.code, 0, second.err); assert.equal(second.report.sessionID, first.report.sessionID);
    assert.equal(second.report.worktreePath, first.report.worktreePath);
    const other = tempDir("entrust-opencode-other-repo-");
    const refused = await driverRun(s, { rights: `worktree ${other}`, resume: first.path });
    assert.equal(refused.code, 2); assert.equal(s.prompts, 2);
  } finally { await s.close(); }
});
test("missing actual model evidence cannot become a successful receipt", async () => {
  const s = await fakeOpenCode("unknown-model");
  try { const r = await driverRun(s); assert.notEqual(r.code, 0); assert.equal(r.report.receiptOk, false);
    assert.equal(r.report.model, null); assert.equal(r.report.requestedModel, "router/deepseek/flash"); }
  finally { await s.close(); }
});
test("a completed assistant step cannot finish an invocation while its runner is busy", async () => {
  const s = await fakeOpenCode("intermediate");
  try { const r = await driverRun(s); assert.equal(r.code, 0, r.err); assert.equal(r.report.answer, "checked"); }
  finally { await s.close(); }
});
test("status transport failure cannot be interpreted as idle success", async () => {
  const s = await fakeOpenCode("status-error");
  try { const r = await driverRun(s); assert.notEqual(r.code, 0); assert.notEqual(r.report.receiptOk, true); }
  finally { await s.close(); }
});
test("Stop preserves partial output and stops only this session", async () => {
  const s = await fakeOpenCode("cancel");
  try {
    const r = await driverRun(s, { cancel: true }); assert.notEqual(r.code, 0); assert.equal(r.report.partial, true);
    assert.match(r.report.answer ?? "", /partial work/); assert.deepEqual(s.aborts, [r.report.sessionID]);
    assert.equal(s.sessions.get("ses_foreign").busy, true);
  } finally { await s.close(); }
});
test("Stop aborts before rejecting its orphan question and observes cleared tools and callbacks", async () => {
  const s = await fakeOpenCode("cancel-question");
  try {
    const r = await driverRun(s, { cancel: true, cancelWhenPending: true, approval: "hold" });
    assert.equal(r.code, 3, r.err); assert.equal(r.report.cancellation.observed, "idle");
    assert.deepEqual(s.questions, []); assert.equal(r.report.cancellation.callbacks[0].outcome, "applied");
    const abort = s.calls.findIndex((c) => c.path.endsWith("/abort"));
    const reject = s.calls.findIndex((c) => c.path.startsWith("/question/") && c.path.endsWith("/reject"));
    assert.ok(abort >= 0 && reject > abort); assert.equal(s.replies.some((p) => p.id === "per_foreign"), true);
  } finally { await s.close(); }
});
test("Stop refuses session-wide permission rejection when an affected request is unowned", async () => {
  const s = await fakeOpenCode("cancel-foreign-same");
  try {
    const r = await driverRun(s, { cancel: true, cancelWhenPending: true, approval: "hold" });
    assert.equal(r.code, 3, r.err); assert.equal(r.report.cancellation.observed, "unknown");
    assert.equal(s.mutations.length, 0); assert.equal(s.replies.some((p) => p.id === "per_unowned_same"), true);
  } finally { await s.close(); }
});
test("idle with an unresolved running tool cannot establish cancellation or permit resume", async () => {
  const s = await fakeOpenCode("cancel-unknown-tool");
  try {
    const first = await driverRun(s, { cancel: true }); assert.equal(first.report.cancellation.observed, "unknown");
    const second = await driverRun(s, { resume: first.path });
    assert.equal(second.code, 2); assert.equal(s.prompts, 1);
  } finally { await s.close(); }
});
test("Stop during a request reread cannot reject the changed payload through decision settlement", async () => {
  const s = await fakeOpenCode("cancel-request-read"); s.permissionReads = 0;
  try {
    const r = await driverRun(s, { approval: "accept", cancelOn: () => s.requestReadInFlight });
    assert.equal(r.code, 3, r.err); assert.equal(r.report.cancellation.observed, "unknown");
    assert.equal(s.mutations.length, 0); assert.equal(s.replies.some((q) => q.id === "per_native_1"), true);
  } finally { await s.close(); }
});
test("Stop overlapping admission cancels the admitted work without resending its input", async () => {
  const s = await fakeOpenCode("cancel-before-admission");
  try {
    const r = await driverRun(s, { cancelOn: () => s.promptInFlight });
    assert.equal(r.code, 3, r.err); assert.equal(s.prompts, 1);
    assert.equal(s.sessions.get(r.report.sessionID).busy, false);
    assert.equal(r.report.cancellation.observed, "idle");
  } finally { await s.close(); }
});
test("failed child enumeration retains known descendants and cannot claim stopped execution", async () => {
  const s = await fakeOpenCode("cancel-child-scan");
  try {
    const r = await driverRun(s, { cancelOn: () => s.scanFailed });
    assert.equal(r.code, 3, r.err); assert.equal(r.report.cancellation.observed, "unknown");
    assert.equal(s.sessions.get("ses_child").busy, false); assert.ok(s.aborts.includes("ses_child"));
  } finally { await s.close(); }
});
test("Stop rejects a fully owned permission group once and leaves foreign permissions intact", async () => {
  const s = await fakeOpenCode("cancel-permission-group");
  try {
    const r = await driverRun(s, { cancel: true, cancelWhenPending: true, pendingCount: 2, approval: "hold" });
    assert.equal(r.report.cancellation.observed, "idle"); assert.equal(s.mutations.length, 1);
    assert.equal(r.report.cancellation.callbacks[0].requestIDs.length, 2);
    assert.deepEqual(s.replies.map((q) => q.id), ["per_foreign"]);
  } finally { await s.close(); }
});
test("Stop during the final idle snapshot cannot publish a success receipt", async () => {
  const s = await fakeOpenCode("cancel-final-snapshot");
  try {
    const r = await driverRun(s, { cancelOn: () => s.finalSnapshot });
    assert.equal(r.code, 3, r.err); assert.equal(r.report.partial, true); assert.equal(r.report.receiptOk, false);
  } finally { await s.close(); }
});
test("declining one owned permission records the native rejection of its siblings", async () => {
  const s = await fakeOpenCode("permission-group");
  try {
    const r = await driverRun(s, { approval: "decline", pendingCount: 2 });
    assert.equal(r.code, 6, r.err); assert.equal(s.mutations.length, 1);
    const requests = fs.readdirSync(r.box).filter((f) => f.endsWith(".request.json")).map((f) => JSON.parse(fs.readFileSync(path.join(r.box, f))));
    assert.equal(requests.length, 2); assert.ok(requests.every((q) => q.settled?.outcome === "applied"));
    assert.ok(requests.some((q) => q.settled?.by === "native" && q.settled.causedBy));
  } finally { await s.close(); }
});
test("unattended permission rejection waits for its whole discovery batch", async () => {
  const s = await fakeOpenCode("permission-group");
  try {
    const r = await driverRun(s); assert.equal(r.code, 7, r.err);
    assert.equal(s.mutations.length, 1); assert.deepEqual(s.replies.map((q) => q.id), ["per_foreign"]);
  } finally { await s.close(); }
});
test("lost group-rejection response remains unknown and is never resent", async () => {
  const s = await fakeOpenCode("permission-group-lost");
  try {
    const r = await driverRun(s, { approval: "decline", pendingCount: 2 });
    assert.equal(r.code, 4, r.err); assert.equal(r.report.receiptOk, false); assert.equal(s.mutations.length, 1);
    const requests = fs.readdirSync(r.box).filter((f) => f.endsWith(".request.json")).map((f) => JSON.parse(fs.readFileSync(path.join(r.box, f))));
    assert.ok(requests.every((q) => q.settled?.outcome === "unknown"));
  } finally { await s.close(); }
});
test("incomplete initial descendants refuse admission and preserve unknown cancellation", async () => {
  const s = await fakeOpenCode("child-scan-error");
  try {
    const r = await driverRun(s); assert.equal(r.code, 4, r.err); assert.equal(s.prompts, 0);
    assert.equal(r.report.cancellation.observed, "unknown");
  } finally { await s.close(); }
});
const V2 = "API_FAMILY: v2\nAGENT: bridge\n";
test("V2 status checks the chosen profile and only the two recent models", async () => {
  const s = await fakeOpenCodeV2();
  try {
    const r = await invoke([STATUS, "--api-family", "v2", "--directory", cwd, "--agent", "bridge"], "", {
      ENTRUST_OPENCODE_URL: s.url, ENTRUST_OPENCODE_CONNECTION: undefined,
      ...recent({ recent: [{ providerID: "router", modelID: "deepseek/flash" }, { providerID: "router", modelID: "glm" },
        { providerID: "router", modelID: "never-listed" }] }),
    });
    assert.equal(r.code, 0, r.err); assert.match(r.out, /apiFamily:v2/); assert.match(r.out, /AGENT=bridge/);
    assert.match(r.out, /UNAVAILABLE=router\/glm/); assert.equal(r.out.includes("never-listed"), false);
    assert.equal(s.prompts, 0); assert.ok(s.calls.every((c) => c.method === "GET"));
  } finally { await s.close(); }
});
test("status starts a private local server when no endpoint is configured", async () => {
  const s = await fakeOpenCode(), state = tempDir("entrust-opencode-status-local-");
  const cli = fakeCli(s.url, state);
  try {
    const r = await invoke([STATUS], "", { ...recent({ recent: [{ providerID: "router", modelID: "deepseek/flash" }] }), ...cli.env });
    assert.equal(r.code, 0, r.out + r.err); assert.match(r.out, /OPENCODE=ready/);
    assert.match(r.out, /MODEL=router\/deepseek\/flash/);
    assert.equal(fs.readFileSync(cli.stopFile, "utf8"), "stopped");
  } finally { await s.close(); }
});
test("V2 selection is explicit and a new invocation needs its native profile", () => {
  assert.match(parsePrompt(prompt("API_FAMILY: auto\n")).error, /v1 or v2/);
  assert.match(parsePrompt(prompt("API_FAMILY: v2\n")).error, /AGENT/);
  assert.match(parsePrompt(prompt("API_FAMILY: v1\nAGENT: bridge\n")).error, /requires/);
  assert.equal(parsePrompt(prompt(V2)).apiFamily, "v2");
});
test("V2 profile cannot widen default deny into a global allow", () => {
  const p = { mode: "primary", permissions: [{ action: "*", resource: "*", effect: "deny" }, { action: "bash", resource: "*", effect: "ask" }] };
  assert.equal(validateProfile(p), p);
  for (const rule of [{ action: "bash", resource: "*", effect: "allow" }, { action: "unknown-plugin", resource: "*", effect: "ask" }])
    assert.throws(() => validateProfile({ ...p, permissions: [...p.permissions, rule] }), /default deny/);
});
test("V2 attribution follows promotion sequence rather than an input admitted during a step", () => {
  const events = [
    { type: "session.next.prompted", data: { messageID: "msg_first" } },
    { type: "session.next.prompt.admitted", data: { messageID: "msg_later" } },
    { type: "session.next.step.started", data: { assistantMessageID: "msg_a" } },
    { type: "session.next.prompted", data: { messageID: "msg_later" } },
    { type: "session.next.step.started", data: { assistantMessageID: "msg_b" } },
  ].map((e, i) => ({ ...e, durable: { aggregateID: "ses_test", seq: i + 1 } }));
  const messages = ["msg_b", "msg_a", "msg_unbound"].map((id) => ({ id, type: "assistant", model: { providerID: "router", id: "deepseek/flash" }, content: [] }));
  const out = normalizeMessages(messages, events, "ses_test");
  assert.deepEqual(out.map((m) => m.info.parentID), ["msg_first", "msg_later", null]);
  assert.equal(out[0].info.attribution.promptSeq, 1); assert.equal(out[1].info.attribution.stepSeq, 5);
  assert.throws(() => normalizeMessages(messages, [...events].reverse(), "ses_test"), /sequence/);
});
test("native write resources all need an exact target inside the declared scope", () => {
  const scope = { roots: [cwd] };
  assert.equal(outOfScope(scope, { action: "write", resources: ["one", "two"] }, cwd), null);
  assert.match(outOfScope(scope, { action: "write", resources: ["one", "../outside"] }, cwd), /outside/);
  assert.match(outOfScope(scope, { action: "write", resources: ["**"] }, cwd), /exact/);
  assert.match(outOfScope(scope, { action: "write", resources: [] }, cwd), /target/);
});
test("V2 driver uses native bodies and all history pages without any V1 execution route", async () => {
  const s = await fakeOpenCodeV2();
  try {
    const r = await driverRun(s, { headers: V2 }); assert.equal(r.code, 0, r.err);
    assert.equal(r.report.apiFamily, "v2"); assert.equal(r.report.receiptOk, true); assert.equal(r.report.agent, "bridge");
    assert.deepEqual(Object.keys(s.calls.find((c) => c.path === "/api/session" && c.method === "POST").body).sort(),
      ["agent", "location", "model"]);
    assert.equal(s.calls.some((c) => c.path.startsWith("/session") || c.path === "/provider" || c.path === "/event"), false);
    const post = s.calls.find((c) => c.path.endsWith("/prompt"));
    assert.equal(post.body.delivery, "queue"); assert.equal(post.body.parts, undefined);
    assert.ok(s.calls.some((c) => c.path === "/api/agent"));
    assert.equal(s.calls.some((c) => c.path.startsWith("/api/agent/")), false);
    assert.ok(s.calls.some((c) => c.query.cursor)); assert.ok(s.calls.some((c) => Number(c.query.after) > 0));
    assert.ok(s.calls.filter((c) => c.path.endsWith("/history")).every((c) => Number(c.query.limit) <= 100));
    assert.ok(s.calls.filter((c) => c.path.endsWith("/message")).every((c) => Number(c.query.limit) <= 200));
  } finally { await s.close(); }
});
test("V2 continuation inherits family, profile, model and variant from its report", async () => {
  const s = await fakeOpenCodeV2();
  try {
    const first = await driverRun(s, { headers: V2 }); assert.equal(first.code, 0, first.err);
    const second = await driverRun(s, { resume: first.path }); assert.equal(second.code, 0, second.err);
    assert.equal(second.report.apiFamily, "v2"); assert.equal(second.report.sessionID, first.report.sessionID);
    assert.equal(second.report.model, first.report.model); assert.equal(second.report.variant, "high");
    assert.equal(s.calls.filter((c) => c.path.endsWith("/model") && c.method === "POST").length, 0);
    const rejected = await driverRun(s, { resume: second.path, headers: "API_FAMILY: v1\n" });
    assert.equal(rejected.code, 2); assert.match(rejected.report.error, /API family/); assert.equal(s.prompts, 2);
  } finally { await s.close(); }
});
test("V2 permissions preserve their native action/resources and reply once with 204", async () => {
  const s = await fakeOpenCodeV2("permission");
  try {
    const r = await driverRun(s, { headers: V2, approval: "accept" }); assert.equal(r.code, 0, r.err);
    assert.deepEqual(s.mutations.map((m) => m.body), [{ reply: "once" }]);
    assert.deepEqual(s.replies.map((q) => q.id), ["per_foreign"]);
    const q = JSON.parse(fs.readFileSync(path.join(r.box, fs.readdirSync(r.box).find((f) => f.endsWith(".request.json")))));
    assert.equal(q.payload.action, "bash"); assert.deepEqual(q.payload.resources, ["printf native"]);
    assert.equal(q.payload.permission, undefined); assert.equal(r.report.commands[0].exitCode, 0);
  } finally { await s.close(); }
});
test("V2 replies for an owned child use its session ID rather than the root", async () => {
  const s = await fakeOpenCodeV2("child-permission");
  try {
    const r = await driverRun(s, { headers: V2, approval: "accept" }); assert.equal(r.code, 0, r.err);
    assert.equal(s.mutations[0].sessionID, "ses_child"); assert.ok(r.report.childUsage.ses_child);
  } finally { await s.close(); }
});
test("V2 question round trip uses its session-scoped native route", async () => {
  const s = await fakeOpenCodeV2("question");
  try { const r = await driverRun(s, { headers: V2, approval: "answer" }); assert.equal(r.code, 0, r.err);
    assert.deepEqual(s.mutations.map((m) => m.body), [{ answers: [["Read"]] }]); }
  finally { await s.close(); }
});
test("V2 discovers a child and its callback in another native location", async () => {
  const s = await fakeOpenCodeV2("child-other-dir");
  try {
    const r = await driverRun(s, { headers: V2, approval: "accept" }); assert.equal(r.code, 0, r.err);
    assert.equal(s.mutations[0].sessionID, "ses_child"); assert.ok(r.report.childUsage.ses_child);
    assert.deepEqual(s.replies.map((q) => q.id), ["per_foreign"]);
    assert.ok(s.calls.some((c) => c.path === "/api/session/ses_child/permission"));
    assert.equal(s.calls.some((c) => c.path === "/api/session" && c.method === "GET" && c.query.directory), false);
  } finally { await s.close(); }
});
test("V2 Stop interrupts its session, clears its question and retains partial attribution", async () => {
  const s = await fakeOpenCodeV2("cancel-question");
  try {
    const r = await driverRun(s, { headers: V2, approval: "hold", cancel: true, cancelWhenPending: true });
    assert.equal(r.code, 3, r.err); assert.equal(r.report.cancellation.observed, "idle");
    assert.equal(r.report.cancellation.abort[0].ok, true); assert.equal(s.questions.length, 0);
    assert.equal(s.aborts.includes("ses_foreign"), false); assert.equal(r.report.receiptOk, false);
  } finally { await s.close(); }
});
test("V2 reconciles a lost or 503 prompt response from durable admission without resend", async () => {
  for (const mode of ["lost-response", "server-error-after-admission"]) {
    const s = await fakeOpenCodeV2(mode);
    try { const r = await driverRun(s, { headers: V2 }); assert.equal(r.code, 0, r.err); assert.equal(s.prompts, 1); }
    finally { await s.close(); }
  }
});
test("V2 refuses SDK substitution and an unsafe agent before creating a session", async () => {
  for (const mode of ["unsupported-sdk", "broad-profile"]) {
    const s = await fakeOpenCodeV2(mode);
    try { const r = await driverRun(s, { headers: V2 }); assert.equal(r.code, 2, r.err); assert.equal(s.prompts, 0);
      assert.equal(s.calls.some((c) => c.path === "/api/session" && c.method === "POST"), false); }
    finally { await s.close(); }
  }
});
test("V2 unexpected callback success status is unknown and not resent", async () => {
  const s = await fakeOpenCodeV2("unexpected-reply-status");
  try { const r = await driverRun(s, { headers: V2, approval: "accept" }); assert.equal(r.code, 4, r.err);
    assert.equal(r.report.receiptOk, false); assert.equal(s.mutations.length, 1); }
  finally { await s.close(); }
});
test("V2 refuses a changed session model before submitting any input", async () => {
  const s = await fakeOpenCodeV2("changed-created-model");
  try { const r = await driverRun(s, { headers: V2 }); assert.equal(r.code, 1, r.err);
    assert.equal(s.prompts, 0); assert.match(r.report.error, /selected model/); }
  finally { await s.close(); }
});
test("V2 malformed active state cannot be an idle success", async () => {
  const s = await fakeOpenCodeV2("malformed-active");
  try { const r = await driverRun(s, { headers: V2 }); assert.notEqual(r.code, 0); assert.equal(r.report.receiptOk, false); }
  finally { await s.close(); }
});
process.exitCode = summarize(await runCases(cases), cases.length);
