#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawnSync } from "node:child_process";
import { ROOT, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";
import { recentModels, splitModel, digest } from "../plugin/skills/opencode/scripts/config.mjs";
import { Client } from "../plugin/skills/opencode/scripts/client.mjs";
import { parsePrompt, FIVE_FIELDS_SCHEMA, checkSchemaSubset, validateOutput, decisionsOf, extractJson, expectation } from "../plugin/skills/opencode/scripts/contract.mjs";
import { decisionFits } from "../plugin/skills/orchestrate/scripts/mailbox.mjs";
import { editScope, sessionPermissions } from "../plugin/skills/opencode/scripts/driver.mjs";
import { readAgentOrders } from "../plugin/skills/orchestrate/scripts/agent-orders.mjs";
import { fakeOpenCode } from "./fake-opencode.mjs";
import { startLocalServer } from "../plugin/skills/opencode/scripts/local-server.mjs";

const { cases, test: register } = registry();
const test = (name, fn) => register(name, name, async () => { await fn(); return true; });
const ENTRY = path.join(ROOT, "skills/opencode/scripts/agent-run.mjs");
const STATUS = path.join(ROOT, "skills/opencode/scripts/status.mjs");
const SHARED = path.join(ROOT, "skills/codex/scripts/agent-run.mjs");
const cwd = tempDir("entrust-opencode-cwd-");
const model = "router/deepseek/deepseek-flash";
const prompt = (extra = "", rights = `read ${cwd}`) => `${rights === null ? "" : `RIGHTS: ${rights}\n`}${extra}TASK: inspect the supplied evidence\n`;
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
test("default answer schema comes from the existing Codex contract", () => {
  assert.equal(FIVE_FIELDS_SCHEMA, path.join(ROOT, "skills/orchestrate/schemas/five-fields.schema.json"));
  assert.equal(parsePrompt(prompt(), {}).error, undefined);
});
test("a registered model fills an absent MODEL and refuses inherit or another model", () => {
  const env = { ENTRUST_PLAN_MODEL: model };
  for (const header of ["MODEL: inherit\n", "MODEL: router/other\n"])
    assert.match(parsePrompt(prompt(header), env).error, /does not match the approved plan's/);
  for (const header of ["", `MODEL: ${model}\n`]) {
    const parsed = parsePrompt(prompt(header), env);
    assert.equal(parsed.error, undefined);
    assert.equal(`${parsed.model.providerID}/${parsed.model.modelID}`, model);
  }
});
test("unsupported execution controls refuse before any HTTP call", () => {
  for (const header of ["NETWORK: no\n", "WEB_SEARCH: disabled\n", "UNKNOWN: yes\n", "VARIANT: low\nEFFORT: high\n"])
    assert.ok(parsePrompt(prompt(header), {}).error);
});
test("a write root over the state directory is refused offline, before any server, as Claude and Codex refuse it", () => {
  const root = tempDir("entrust-opencode-over-state-"), state = path.join(root, "state");
  fs.mkdirSync(state);
  const file = path.join(root, "prompt.txt");
  fs.writeFileSync(file, prompt("", `write ${root}`));
  const r = spawnSync(process.execPath, [path.join(ROOT, "skills/opencode/scripts/driver.mjs"), "--check-prompt-file", file],
    { env: { ...process.env, ENTRUST_STATE_DIR: state }, encoding: "utf8" });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /^entrust: refused: refusing to grant write access to .*: it is an ancestor of this driver's state directory/);
});
test("a write session's rules deny .git and OpenCode's own files after the allows, since the last match wins", () => {
  const rules = sessionPermissions({ kind: "write", roots: [cwd] });
  const last = (pattern) => rules.findLast((r) => r.permission === "edit" && r.pattern === pattern)?.action;
  assert.equal(last(`${cwd}/**`), "allow");
  for (const pattern of [`${cwd}/.git`, `${cwd}/.git/*`, `${cwd}/*/.git/*`, `${cwd}/.opencode/*`, `${cwd}/opencode.json*`])
    assert.equal(last(pattern), "deny", pattern);
  assert.ok(rules.findIndex((r) => r.pattern === `${cwd}/.git`) > rules.findIndex((r) => r.pattern === `${cwd}/**`));
});
test("approved write root rejects another root even when rights kind matches", () => {
  const outside = tempDir("entrust-opencode-outside-");
  const error = parsePrompt(prompt("", `write ${outside}`), { ENTRUST_PLAN_WRITES: `write ${cwd}` }).error;
  assert.ok(error && !error.includes("schema"), String(error));
});
test("malformed schema branches are refused, and required fields are checked", () => {
  assert.equal(checkSchemaSubset({ type: "object", oneOf: [] }).ok, false);
  const s = JSON.parse(fs.readFileSync(path.join(ROOT, "skills/orchestrate/schemas/five-fields.schema.json"), "utf8"));
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
test("main proxy accepts concrete agent orders or a full answer, never host tool code", () => {
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, "skills/orchestrate/schemas/main-proxy.schema.json"), "utf8"));
  assert.equal(checkSchemaSubset(schema).ok, true);
  const order = { id: "a", action: "delegate", agent_id: "reviewer", task: "Review the diff: preserve \"quotes\", \\ and $ signs.", scope: "read-only", model: "Sol", effort: "high" };
  const reply = (requests) => ({ plan: "delegate", requests, final_answer: "" });
  assert.equal(validateOutput(schema, reply([order])).ok, true);
  assert.equal(validateOutput(schema, reply([{ ...order, model: null, effort: null }])).ok, true);
  for (const request of [
    { id: "b", action: "continue", agent_id: "reviewer", task: "Check the source again" },
    { id: "c", action: "collect", agent_ids: ["reviewer"] },
    { id: "d", action: "stop", agent_ids: ["reviewer"] },
  ]) assert.equal(validateOutput(schema, reply([request])).ok, true);
  assert.equal(validateOutput(schema, { plan: "", requests: [], final_answer: "complete reply" }).ok, true);
  for (const answer of [
    { plan: "", requests: [], final_answer: "" },
    { plan: "", requests: [order], final_answer: "reply" },
    { plan: "", calls: [], final_answer: "reply" },
    reply([{ id: "e", tool: "functions.exec", input: "dangerous code" }]),
    reply([{ id: "f", action: "execute", command: "arbitrary host command" }]),
    reply([{ ...order, task: "" }]),
    reply([{ ...order, scope: "" }]),
    reply([{ id: "g", action: "collect", agent_ids: [] }]),
    reply([{ id: "h", action: "continue", agent_id: "reviewer", task: "Next", model: "other" }]),
  ]) assert.equal(validateOutput(schema, answer).ok, false, JSON.stringify(answer));
});
test("schema bounds and prototype-named fields cannot bypass validation", () => {
  assert.equal(checkSchemaSubset({ type: "number", minimum: "bad" }).ok, false);
  assert.equal(checkSchemaSubset({ type: "array", minItems: -1 }).ok, false);
  assert.equal(validateOutput({ type: "object", required: ["toString"] }, {}).ok, false);
  assert.equal(validateOutput({ type: "object", properties: {}, additionalProperties: false }, JSON.parse('{"toString":"x"}')).ok, false);
});
test("agent order reader rejects the whole batch before unknown, repeated or partial actions", () => {
  const delegate = { id: "d", action: "delegate", agent_id: "a", task: 'Read \"quotes\", \\, $ and Unicode: мир', scope: "read-only", model: null, effort: null };
  const report = (requests) => ({ ok: true, receiptOk: true, outputSchemaOk: true, partial: false, sessionID: "coordinator", answerJson: { plan: "", requests, final_answer: "" } });
  const mode = (agents = {}) => ({ external_session: "coordinator", agents });
  const collect = { id: "c", action: "collect", agent_ids: ["a"] };
  const binding = { native_agent: "/root/worker-a", model: "Sol", effort: "high" };
  const batch = report([delegate, collect]);
  assert.strictEqual(readAgentOrders(batch, mode()).requests[0], delegate);
  assert.equal(readAgentOrders(batch, mode()).requests[0].task, delegate.task);
  for (const request of [{ ...delegate, task: " \n\t" }, { ...delegate, scope: " \t" }])
    assert.throws(() => readAgentOrders(report([request]), mode()), /nonblank text/);
  assert.throws(() => readAgentOrders(report([{ id: "n", action: "continue", agent_id: "a", task: " \n" }]), mode({ a: binding })), /nonblank text/);
  assert.throws(() => readAgentOrders({ ...batch, answerJson: { plan: "", requests: [], final_answer: " \n" } }, mode()), /nonblank text/);
  for (const request of [collect, { id: "s", action: "stop", agent_ids: ["a"] }, { id: "n", action: "continue", agent_id: "a", task: "Next" }]) {
    assert.strictEqual(readAgentOrders(report([request]), mode({ a: binding })).requests[0], request);
    const lostRequest = request.agent_ids ? { ...request, agent_ids: ["lost"] } : { ...request, agent_id: "lost" };
    for (const lost of [null, {}, "", "   ", [], { native_agent: "" }, { native_agent: "  " }, Object.create(binding)])
      assert.throws(() => readAgentOrders(report([delegate, lostRequest]), mode({ lost })), /missing native agent binding/);
  }
  assert.throws(() => readAgentOrders(report([collect]), mode()), /unknown agent/);
  assert.throws(() => readAgentOrders(report([delegate, { ...collect, id: "d" }]), mode()), /duplicate request/);
  assert.throws(() => readAgentOrders(report([delegate]), mode({ a: {} })), /already exists/);
  assert.throws(() => readAgentOrders(report([{ ...collect, agent_ids: ["a", "a"] }]), mode({ a: {} })), /repeated agent/);
  assert.throws(() => readAgentOrders({ ...batch, partial: true }, mode()), /complete coordinator reply/);
  assert.throws(() => readAgentOrders({ ...batch, receiptOk: false }, mode()), /attributed/);
  assert.throws(() => readAgentOrders({ ...batch, ok: false }, mode()), /successful/);
  assert.throws(() => readAgentOrders(batch, {}), /session binding/);
  assert.throws(() => readAgentOrders({ ...batch, sessionID: null }, mode()), /session binding/);
  assert.throws(() => readAgentOrders(batch, { ...mode(), external_session: "foreign" }), /another external session/);
  assert.throws(() => readAgentOrders(batch, { ...mode(), agents: null }), /agent bindings object/);
});
test("wrapped JSON preserves escaped quotes, braces and nested objects", () => {
  for (const value of [{ result: 'a"b' }, { result: 'a"{b' }, { result: 'a\\\"{' }, { result: { nested: "}" } }])
    assert.deepEqual(extractJson('prefix\n' + JSON.stringify(value) + '\nsuffix'), value);
  assert.deepEqual(extractJson('{"old":true}\n{"new":{"value":1}}'), { new: { value: 1 } });
  assert.deepEqual(extractJson('He said "{oops" {"status":"done"}'), { status: "done" });
});
test("relative permission targets resolve from the session directory", () => {
  const guard = { stateDir: tempDir("entrust-opencode-guard-") };
  assert.deepEqual(editScope({ roots: [cwd] }, { permission: "edit", metadata: { filePath: "file.txt" } }, cwd, guard), { outside: false });
  assert.deepEqual(editScope({ roots: [cwd] }, { permission: "edit", metadata: { filePath: "../outside.txt" } }, cwd, guard), { outside: true });
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
test("a new invocation records a private local server, and a remote endpoint in the environment is not read", async () => {
  const state = tempDir("entrust-opencode-new-"); const report = path.join(state, "run/a/report.json");
  const env = { ENTRUST_STATE_DIR: state, ENTRUST_OPENCODE_URL: "http://localhost:4096" };
  const r = await invoke([ENTRY, "--new", "--report-file", report], prompt(), env);
  assert.equal(r.code, 0, r.out + r.err);
  assert.equal(fs.existsSync(path.join(path.dirname(report), "agent/prompt.txt")), true);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(path.dirname(report), "agent/backend.json"), "utf8")),
    { adapter: "opencode", planModel: null, planWrites: null, localServer: true });
  const mismatch = await invoke([SHARED, "--adapter", "codex", "--status", "--report-file", report], "", env);
  assert.equal(mismatch.code, 2); assert.match(mismatch.out + mismatch.err, /belongs to opencode/);
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
  const commandOnly = await invoke(a, m.q.payload.metadata.command);
  assert.equal(commandOnly.code, 2);
  // The refusal names the frame this request was printed in, which for a typed request is never COMMAND.
  assert.match(commandOnly.out + commandOnly.err, /restated request body differs[^]*between REQUEST_BODY<<TOKEN and REQUEST_BODY>>TOKEN/);
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
    assert.equal(decisionFits(d, m.q, decisionsOf(m.q)), false);
    d.decision = "decline"; assert.equal(decisionFits(d, m.q, decisionsOf(m.q)), true);
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
  const startFile = path.join(dir, "opencode-started");
  const script = path.join(bin, "opencode");
  fs.writeFileSync(script, `#!/usr/bin/env node\nconst fs=require("node:fs");\nfs.writeFileSync(process.env.FAKE_OPENCODE_START_FILE,"started");\nconsole.log("server listening on "+process.env.FAKE_OPENCODE_URL);\nprocess.on("SIGTERM",()=>{fs.writeFileSync(process.env.FAKE_OPENCODE_STOP_FILE,"stopped");process.exit(0)});\nsetInterval(()=>{},1000);\n`, { mode: 0o755 });
  return { stopFile, env: { PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`,
    FAKE_OPENCODE_URL: url, FAKE_OPENCODE_START_FILE: startFile, FAKE_OPENCODE_STOP_FILE: stopFile }, startFile };
}
// `beside` is an earlier report: this run writes report-2.json into its directory, under the same state.
async function driverRun(server, { allowNoCommands = true, timeout = 9, idle = 4, approvalDelayMs = 0, headers = "", approval = null, resume = null, cancel = false, cancelWhenPending = false, pendingCount = 1, cancelOn = null, rights = `read ${cwd}`, savedModel = "deepseek/flash", localUrl = server.url, beside = null, more = {}, state: given = null } = {}) {
  const state = beside ? path.dirname(path.dirname(beside)) : given ?? tempDir("entrust-opencode-driver-");
  const dir = beside ? path.dirname(beside) : path.join(state, "invocation"); if (!beside) fs.mkdirSync(dir);
  const input = path.join(dir, "prompt.txt"), report = path.join(dir, beside ? "report-2.json" : "report.json"), box = path.join(dir, "approvals");
  fs.writeFileSync(input, prompt(`${allowNoCommands ? "ALLOW_NO_COMMANDS: yes\n" : ""}${resume ? `RESUME: ${resume}\n` : ""}${headers}`, rights));
  // The driver starts its own server; the fake CLI on PATH announces the fake one.
  const cli = fakeCli(localUrl, state);
  const env = { ENTRUST_STATE_DIR: state, ...cli.env, ...more,
    ...recent({ recent: [{ providerID: "router", modelID: savedModel }], variant: { "router/deepseek/flash": "high" } }) };
  const p = spawnNode([DRIVER, "--prompt-file", input, "--report-file", report, "--timeout", String(timeout), "--idle-timeout", String(idle),
    ...(approval ? ["--approval-dir", box] : [])], { env, killAfterMs: 20000 });
  const promptsBefore = server.prompts;
  try {
    if (approval || cancel) {
      const end = Date.now() + 10000; let acted = false;
      while (Date.now() < end && !acted && p.child.exitCode === null) {
        if (approval === "hold" && !cancel) { acted = true; break; } // armed, and nothing decided
        if (cancel && !cancelWhenPending && server.prompts > promptsBefore) { p.child.kill("SIGTERM"); acted = true; }
        else if (fs.existsSync(box)) {
          const files = fs.readdirSync(box).filter((f) => f.endsWith(".request.json"));
          const file = files[0];
          if (file && files.length >= pendingCount) {
            if (cancel && cancelWhenPending) { p.child.kill("SIGTERM"); acted = true; break; }
            const q = JSON.parse(fs.readFileSync(path.join(box, file)));
            if (approvalDelayMs) await new Promise((resolve) => setTimeout(resolve, approvalDelayMs));
            if (approval === "stale") {
              // A decision naming another run: it fits no request of this one.
              fs.writeFileSync(path.join(box, `${q.id}.decision.json`), JSON.stringify({ id: q.id, run: { ...q.run, pid: 1 }, requestHash: q.requestHash, remote: q.remote, decision: "accept" }));
              acted = true; continue;
            }
            if (approval === "unrecordable") {
              // The request's record cannot be rewritten, and an accept fitting it is published beside it.
              fs.rmSync(path.join(box, file)); fs.mkdirSync(path.join(box, file));
              fs.writeFileSync(path.join(box, `${q.id}.decision.json`), JSON.stringify({ id: q.id, run: q.run, requestHash: q.requestHash, remote: q.remote, decision: "accept" }));
              acted = true; continue;
            }
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
    return { ...result, report: fs.existsSync(report) ? JSON.parse(fs.readFileSync(report)) : null, path: report, box, stopFile: cli.stopFile };
  } finally { if (p.child.exitCode === null) p.child.kill("SIGKILL"); }
}
test("a server that exits before it serves is reported with its exit code and what it printed", async () => {
  const bin = path.join(tempDir("entrust-opencode-dying-"), "bin"); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, "opencode"), `#!/usr/bin/env node\nconsole.error("Error: EPERM: operation not permitted, open '/home/x/.local/share/opencode/log'");\nprocess.exit(3);\n`, { mode: 0o755 });
  await assert.rejects(startLocalServer({ env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}` } }),
    /exited with code 3 before announcing its local URL; it printed: Error: EPERM: operation not permitted/);
});
test("a default run starts and stops its private loopback server", async () => {
  const s = await fakeOpenCode();
  try {
    const r = await driverRun(s);
    assert.equal(r.code, 0, r.err); assert.equal(r.report.serverMode, "local");
    assert.equal(fs.readFileSync(r.stopFile, "utf8"), "stopped");
  } finally { await s.close(); }
});
test("local continuation can reconnect through a fresh server URL", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s); assert.equal(first.code, 0, first.err);
    const second = await driverRun(s, { localUrl: s.url.replace("127.0.0.1", "localhost"), resume: first.path });
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
test("an edit outside the roots is offered with its whole request and runs once on an accept; one into the state directory is declined unasked", async () => {
  const s = await fakeOpenCode("edit-outside");
  try {
    s.editTarget = path.join(tempDir("entrust-opencode-outside-"), "notes.txt");
    const r = await driverRun(s, { approval: "accept", rights: `write ${cwd}` });
    assert.equal(r.code, 0, r.err);
    const q = JSON.parse(fs.readFileSync(path.join(r.box, fs.readdirSync(r.box).find((n) => n.endsWith(".request.json"))), "utf8"));
    assert.equal(q.cause, "outside"); assert.equal(q.settled.decision, "accepted"); assert.equal(q.settled.by, "coordinator");
    assert.equal(JSON.parse(q.presented).metadata.filePath, s.editTarget);
    assert.deepEqual(s.mutations.map((m) => m.body?.reply).filter(Boolean), ["once"]);
  } finally { await s.close(); }
  const g = await fakeOpenCode("edit-outside");
  try {
    const state = tempDir("entrust-opencode-driver-");
    g.editTarget = path.join(state, "invocation", "approvals", "1-00000000.decision.json");
    const r = await driverRun(g, { state, approval: "hold", rights: `write ${cwd}`, timeout: 4 });
    assert.deepEqual(g.mutations.map((m) => m.body?.reply).filter(Boolean), ["reject"], r.err);
    const q = JSON.parse(fs.readFileSync(path.join(r.box, fs.readdirSync(r.box).find((n) => n.endsWith(".request.json"))), "utf8"));
    assert.equal(q.settled.by, "driver"); assert.match(q.settled.why, /inside the state directory/);
  } finally { await g.close(); }
});
test("a refused permission is rejected with a message, so the turn goes on and answers; a Stop's reject carries none", async () => {
  const s = await fakeOpenCode("permission");
  try {
    const r = await driverRun(s);
    const reject = s.mutations.find((m) => m.body?.reply === "reject");
    assert.ok(reject, JSON.stringify(s.mutations));
    assert.match(reject.body.message ?? "", /^no approval directory: unattended run\. Do not try to get around it: record it/, r.err);
  } finally { await s.close(); }
  const c = await fakeOpenCode("permission");
  try {
    await driverRun(c, { cancel: true, cancelWhenPending: true, approval: "hold" });
    const stopped = c.mutations.filter((m) => m.body?.reply === "reject");
    assert.ok(stopped.length >= 1, JSON.stringify(c.mutations));
    assert.equal(stopped.some((m) => "message" in m.body), false, JSON.stringify(stopped));
  } finally { await c.close(); }
});
test("an accept the mailbox cannot record is never answered once", async () => {
  const s = await fakeOpenCode("permission");
  try {
    await driverRun(s, { approval: "unrecordable" });
    assert.equal(s.mutations.some((m) => m.body?.reply === "once"), false, JSON.stringify(s.mutations));
    assert.equal(s.mutations.some((m) => m.body?.reply === "reject"), true, JSON.stringify(s.mutations));
  } finally { await s.close(); }
});
test("a stale decision file does not hold a request past its deadline", async () => {
  const s = await fakeOpenCode("permission");
  try {
    const r = await driverRun(s, { approval: "stale", more: { ENTRUST_APPROVAL_TIMEOUT_S: "1" } });
    const name = fs.readdirSync(r.box).find((n) => n.endsWith(".request.json"));
    const q = JSON.parse(fs.readFileSync(path.join(r.box, name), "utf8"));
    assert.equal(q.settled?.decision, "expired", r.err); assert.equal(q.settled.by, "driver");
    assert.equal(s.mutations.some((m) => m.body?.reply === "once"), false, JSON.stringify(s.mutations));
    assert.equal(fs.existsSync(path.join(r.box, "pending")), false);
  } finally { await s.close(); }
});
test("every prompt starts with the run's rules: its rights, that the rest needs approval, and not to work around a refusal", async () => {
  const s = await fakeOpenCode("normal");
  try {
    const bare = await driverRun(s, { rights: `read ${cwd}` }); assert.equal(bare.code, 0, bare.err);
    const first = s.calls.filter((c) => c.path.endsWith("prompt_async")).at(-1).body.parts[0].text;
    assert.match(first, /^You run for a coordinating agent, unattended/);
    assert.match(first, /your edit and write tools are refused, and every shell command needs approval/);
    assert.match(first, /Nothing beyond your rights can be granted in this run/);
    assert.match(first, /do not try to get around it with another tool or command/);
    const boxed = await driverRun(s, { rights: `write ${cwd}`, approval: "hold" }); assert.equal(boxed.code, 0, boxed.err);
    const second = s.calls.filter((c) => c.path.endsWith("prompt_async")).at(-1).body.parts[0].text;
    assert.match(second, /every shell command, and an edit anywhere else, needs one/);
    assert.match(second, /asked of the coordinator, who approves or declines it: the call itself waits for that decision/);
  } finally { await s.close(); }
});
test("a session whose reported rules differ from the ones sent is never prompted, exit 4; one reporting none runs and says so", async () => {
  for (const mode of ["rules-dropped", "rules-widened"]) {
    const s = await fakeOpenCode(mode);
    try {
      const r = await driverRun(s, { rights: `write ${cwd}` });
      assert.equal(r.code, 4, `${mode}: ${r.err}`); assert.match(r.report.error, /holds permission rules other than the ones this run's write rights need/);
      assert.equal(s.prompts, 0, mode);
    } finally { await s.close(); }
  }
  const silent = await fakeOpenCode("rules-silent");
  try {
    const r = await driverRun(silent);
    assert.equal(r.code, 0, r.err); assert.match(r.err, /reported no permission rules for session .*; their effect is unverified/);
  } finally { await silent.close(); }
});
test("a resumed session whose rules changed since is refused before any input", async () => {
  const s = await fakeOpenCode("normal");
  try {
    const first = await driverRun(s, { rights: `write ${cwd}` }); assert.equal(first.code, 0, first.err);
    s.sessions.get(first.report.threadId).permission.push({ permission: "bash", pattern: "*", action: "allow" });
    const prompts = s.prompts;
    const again = await driverRun(s, { resume: first.path, beside: first.path, rights: `write ${cwd}` });
    assert.equal(again.code, 4, again.err); assert.match(again.report.error, /holds permission rules other than/);
    assert.equal(s.prompts, prompts);
  } finally { await s.close(); }
});
test("a continuation keeps its rights: a write session resumed as read is refused, and one naming none stays write", async () => {
  const s = await fakeOpenCode("normal");
  try {
    const first = await driverRun(s, { rights: `write ${cwd}` }); assert.equal(first.code, 0, first.err);
    const narrowed = await driverRun(s, { rights: `read ${cwd}`, resume: first.path, beside: first.path });
    assert.equal(narrowed.code, 2, narrowed.err); assert.match(narrowed.err, /a continuation keeps its rights \(write /);
    const kept = await driverRun(s, { rights: null, resume: first.path });
    assert.equal(kept.code, 0, kept.err); assert.equal(kept.report.rights.kind, "write");
  } finally { await s.close(); }
});
test("RESUME of a run still going exits 10, and of one that died before it published exits 2", async () => {
  const s = await fakeOpenCode("normal");
  try {
    const claim = path.join(tempDir("entrust-opencode-claim-"), "report.json");
    fs.writeFileSync(claim, JSON.stringify({ adapter: "opencode", ok: false, status: "starting", pid: process.pid }));
    const live = await driverRun(s, { resume: claim }); assert.equal(live.code, 10, live.err);
    fs.writeFileSync(claim, JSON.stringify({ adapter: "opencode", ok: false, status: "starting", pid: spawnSync("true").pid }));
    const dead = await driverRun(s, { resume: claim }); assert.equal(dead.code, 2); assert.match(dead.err, /ended without a report/);
  } finally { await s.close(); }
});
test("no RIGHTS line is a read agent in the current directory, and yes-or-no fields read yes, true, 1 or no, false, 0", () => {
  assert.deepEqual(parsePrompt(prompt("", null), {}).rights, { kind: "read", path: null });
  assert.equal(parsePrompt(prompt("ALLOW_NO_COMMANDS: true\n"), {}).allowNoCommands, true);
  assert.equal(parsePrompt(prompt("ALLOW_NO_COMMANDS: 0\n"), {}).allowNoCommands, undefined);
  assert.match(parsePrompt(prompt("BRIEF: sure\n"), {}).error, /BRIEF takes yes, true or 1/);
});
test("a turn that read a file has observed something, as in every adapter; one that read nothing fails without ALLOW_NO_COMMANDS", () => {
  assert.equal(expectation({ successful: [], observations: 1 }).ok, true);
  assert.match(expectation({ successful: [], observations: 0 }).why, /observed nothing/);
  assert.equal(expectation({ successful: [], observations: 0, allowNoCommands: true }).ok, true);
});
test("the page's own template passes on a turn that only read, and fails exit 5 on one that observed nothing", async () => {
  for (const [mode, code] of [["read-only", 0], ["normal", 5]]) {
    const s = await fakeOpenCode(mode);
    try { const r = await driverRun(s, { allowNoCommands: false }); assert.equal(r.code, code, `${mode}: ${r.err}`); }
    finally { await s.close(); }
  }
});
test("RESUME last is refused: under a plan the newest report beside this one is another worker's", () => {
  assert.match(parsePrompt(prompt("RESUME: last\n"), {}).error, /RESUME last is not accepted/);
});
test("a run that cannot make its mailbox never writes over an earlier report at its path", () => {
  const dir = tempDir("entrust-opencode-earlier-"), report = path.join(dir, "report.json"), input = path.join(dir, "prompt.txt");
  fs.writeFileSync(report, '{"answer":"EARLIER"}\n'); fs.writeFileSync(path.join(dir, "notadir"), ""); fs.writeFileSync(input, prompt(`MODEL: ${model}\n`));
  const r = spawnSync(process.execPath, [path.join(ROOT, "skills/opencode/scripts/driver.mjs"), "--prompt-file", input, "--report-file", report,
    "--approval-dir", path.join(dir, "notadir", "approvals")], { env: { ...process.env, ENTRUST_STATE_DIR: dir }, encoding: "utf8" });
  assert.equal(r.status, 2, r.stderr);
  assert.equal(fs.readFileSync(report, "utf8"), '{"answer":"EARLIER"}\n');
});
test("a mailbox outside the state directory is refused before anything runs", () => {
  const state = tempDir("entrust-opencode-state-"), elsewhere = tempDir("entrust-opencode-elsewhere-");
  const report = path.join(state, "report.json"), input = path.join(state, "prompt.txt");
  fs.writeFileSync(input, prompt(`MODEL: ${model}\n`));
  const r = spawnSync(process.execPath, [path.join(ROOT, "skills/opencode/scripts/driver.mjs"), "--prompt-file", input, "--report-file", report,
    "--approval-dir", path.join(elsewhere, "approvals")], { env: { ...process.env, ENTRUST_STATE_DIR: state }, encoding: "utf8" });
  assert.equal(r.status, 2, r.stderr);
  assert.match(JSON.parse(fs.readFileSync(report, "utf8")).error, /is not inside the state directory/);
  assert.equal(fs.existsSync(path.join(elsewhere, "approvals")), false);
});
test("the budget: the wall clock stands still while a request waits, and a session the server reports busy is not idle", async () => {
  const waited = await fakeOpenCode("permission");
  try {
    const r = await driverRun(waited, { approval: "accept", timeout: 2, approvalDelayMs: 3000 });
    assert.equal(r.code, 0, r.err);
  } finally { await waited.close(); }
  const busy = await fakeOpenCode("intermediate");
  try { const r = await driverRun(busy, { idle: 2 }); assert.equal(r.code, 0, r.err); }
  finally { await busy.close(); }
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
  try {
    const r = await driverRun(s); assert.equal(r.code, 0, r.err); assert.equal(s.prompts, 2); assert.ok(r.report.usage?.input >= 10, JSON.stringify(r.report.usage));
    // The report says the corrective turn ran: it was computed and dropped before (03-audit-opencode, 4).
    assert.equal(r.report.correction?.admitted, true, JSON.stringify(r.report.correction));
  }
  finally { await s.close(); }
});
test("main proxy mixed reply is corrected by the driver before reaching the host", async () => {
  const s = await fakeOpenCode("main-proxy-correction");
  try {
    const schema = path.join(ROOT, "skills/orchestrate/schemas/main-proxy.schema.json");
    const r = await driverRun(s, { headers: `OUTPUT_SCHEMA: ${schema}\n` });
    assert.equal(r.code, 0, r.err);
    assert.equal(s.prompts, 2);
    assert.equal(r.report.receiptOk, true);
    assert.equal(r.report.outputSchemaOk, true);
    assert.deepEqual(r.report.answerJson, { plan: "", requests: [], final_answer: "Complete coordinator reply" });
    const submitted = s.calls.filter((c) => c.path.endsWith("prompt_async"));
    assert.equal(submitted[0].path, submitted[1].path);
    assert.match(JSON.stringify(submitted[1].body), /oneOf/);
  } finally { await s.close(); }
});
test("main proxy continuation repeats its schema and permits a host-only round", async () => {
  const s = await fakeOpenCode("main-proxy-correction");
  try {
    const headers = `OUTPUT_SCHEMA: ${path.join(ROOT, "skills/orchestrate/schemas/main-proxy.schema.json")}\n`;
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
test("a transport failure after admission keeps the partial answer it already received (E119)", async () => {
  const s = await fakeOpenCode("transport-after-partial");
  try {
    const r = await driverRun(s);
    assert.notEqual(r.code, 0);
    assert.equal(s.prompts, 1);
    assert.equal(r.report.ok, false);
    assert.equal(r.report.partial, true);
    assert.equal(r.report.receiptOk, false);
    assert.match(r.report.error, /^invocation failed: /);
    assert.equal(r.report.answer, "partial work");
    assert.equal(fs.readFileSync(r.report.answerPath, "utf8"), "partial work");
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
test("a report an earlier release recorded as V2 is refused on continuation, before any input", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s); assert.equal(first.code, 0, first.err);
    fs.chmodSync(first.path, 0o600);
    fs.writeFileSync(first.path, JSON.stringify({ ...first.report, apiFamily: "v2" }));
    const before = s.prompts;
    const second = await driverRun(s, { resume: first.path });
    assert.equal(second.code, 2, second.err); assert.match(second.err, /V2 session, which this adapter no longer runs/);
    assert.equal(s.prompts, before);
  } finally { await s.close(); }
});
test("a report an earlier release made on a remote server is refused on continuation, before any input", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s); assert.equal(first.code, 0, first.err);
    fs.chmodSync(first.path, 0o600);
    fs.writeFileSync(first.path, JSON.stringify({ ...first.report, serverMode: "remote" }));
    const before = s.prompts;
    const second = await driverRun(s, { resume: first.path });
    assert.equal(second.code, 2, second.err); assert.match(second.err, /remote server, which this adapter no longer attaches to/);
    assert.equal(s.prompts, before);
  } finally { await s.close(); }
});
test("a continuation's report beside the first keeps each one's answer and transcript files (E120)", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s); assert.equal(first.code, 0, first.err);
    const second = await driverRun(s, { resume: first.path, beside: first.path }); assert.equal(second.code, 0, second.err);
    assert.equal(path.dirname(second.path), path.dirname(first.path));
    assert.notDeepEqual(second.report.turnIds, first.report.turnIds);
    for (const r of [first, second]) {
      for (const k of ["answerPath", "transcriptPath"]) {
        assert.equal(path.dirname(r.report[k]), path.dirname(r.path), k);
        assert.notEqual(r.report[k], (r === first ? second : first).report[k], k);
      }
      assert.deepEqual(JSON.parse(fs.readFileSync(r.report.transcriptPath, "utf8")).inputIds, r.report.turnIds);
      assert.equal(fs.existsSync(r.path.replace(/\.json$/, ".runtime.json")), false);
      assert.equal(fs.readFileSync(r.report.answerPath, "utf8"), s.sessions.get(r.report.sessionID).messages
        .find((m) => m.info.role === "assistant" && m.info.parentID === r.report.turnId).parts[0].text);
    }
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
test("JSON status returns at most two saved recent refs, and reaches no server", async () => {
  const r = await invoke([STATUS, "--format", "json"], "", {
    ...recent({ recent: [{ providerID: "router", modelID: "deepseek/flash" }, { providerID: "router", modelID: "glm/flash" },
      { providerID: "router", modelID: "not-in-top-two" }], variant: { "router/deepseek/flash": "high" } }),
  });
  assert.equal(r.code, 0, r.out + r.err);
  const data = JSON.parse(r.out);
  assert.equal(data.adapter, "opencode"); assert.equal(data.configured, true); assert.equal(data.status, "local_unprobed");
  assert.deepEqual(data.recent.models.map((m) => `${m.providerID}/${m.modelID}`), ["router/deepseek/flash", "router/glm/flash"]);
  assert.equal(data.recent.models[0].variant, "high");
  assert.equal(data.modelAvailability, "unknown"); assert.equal(data.usage.status, "unknown");
});
test("passive status does not start a local server when none is configured", async () => {
  const s = await fakeOpenCode(), state = tempDir("entrust-opencode-status-local-");
  const cli = fakeCli(s.url, state);
  try {
    const r = await invoke([STATUS, "--format", "json"], "", { ...recent({ recent: [{ providerID: "router", modelID: "deepseek/flash" }] }), ...cli.env });
    assert.equal(r.code, 0, r.out + r.err);
    const data = JSON.parse(r.out);
    assert.equal(data.status, "local_unprobed"); assert.equal(data.modelAvailability, "unknown");
    assert.deepEqual(data.recent.models.map((m) => m.modelID), ["deepseek/flash"]);
    assert.equal(fs.existsSync(cli.startFile), false);
  } finally { await s.close(); }
});
test("text status distinguishes a missing recent source from an empty recent list", async () => {
  const r = await invoke([STATUS], "", {
    ENTRUST_OPENCODE_MODEL_STATE: undefined, XDG_STATE_HOME: tempDir("entrust-opencode-no-recent-text-"),
  });
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out, /MODEL=unknown \(recent source unavailable\)/);
  assert.equal(r.out.includes("MODEL=none"), false);
});
test("native write resources each need an exact target; one outside the roots is offered, one in the state or a protected directory declined", () => {
  const scope = { roots: [cwd] }, state = tempDir("entrust-opencode-guard-"), prot = tempDir("entrust-opencode-protected-");
  const guard = { stateDir: state, protectedDirs: [{ dir: prot, label: "OpenCode's configuration", holds: "its plugins" }] };
  assert.deepEqual(editScope(scope, { action: "write", resources: ["one", "two"] }, cwd, guard), { outside: false });
  assert.deepEqual(editScope(scope, { action: "write", resources: ["one", "../outside"] }, cwd, guard), { outside: true });
  assert.match(editScope(scope, { action: "write", resources: ["**"] }, cwd, guard).decline, /exact/);
  assert.match(editScope(scope, { action: "write", resources: [] }, cwd, guard).decline, /target/);
  assert.match(editScope(scope, { action: "write", resources: [path.join(state, "inv", "approvals", "1-aaaaaaaa.decision.json")] }, cwd, guard).decline, /inside the state directory/);
  assert.match(editScope(scope, { action: "edit", metadata: { filePath: path.join(prot, "new", "plugin.js") } }, cwd, guard).decline, /inside OpenCode's configuration/);
  assert.match(editScope({ roots: [] }, { action: "edit", metadata: { filePath: "x" } }, cwd, guard).decline, /no declared writes scope/);
});
process.exitCode = summarize(await runCases(cases), cases.length);
