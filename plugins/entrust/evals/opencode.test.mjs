#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import net from "node:net";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { ROOT, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";
import { desktopModels, splitModel, digest } from "../plugin/skills/opencode/scripts/config.mjs";
import { Client } from "../plugin/skills/opencode/scripts/client.mjs";
import { parsePrompt, FIVE_FIELDS_SCHEMA, checkSchemaSubset, validateOutput, decisionsOf, extractJson, expectation } from "../plugin/skills/opencode/scripts/contract.mjs";
import { decisionFits } from "../plugin/skills/orchestrate/scripts/mailbox.mjs";
import { editScope, noteWait, rejectTrackedRequest, sessionPermissions, resolveModel, observe } from "../plugin/skills/opencode/scripts/driver.mjs";
import { desktopStore, fakeCli, fakeOpenCode } from "./fake-opencode.mjs";
import { typedRequest } from "../plugin/skills/opencode/scripts/launch.mjs";
import { startLocalServer } from "../plugin/skills/opencode/scripts/local-server.mjs";
import { startObserver, readObservation } from "../plugin/skills/opencode/scripts/observe.mjs";
import { statusLines } from "../plugin/skills/orchestrate/scripts/agent-run.mjs";

const { cases, test: register } = registry();
const test = (name, fn) => register(name, name, async () => { await fn(); return true; });
const ENTRY = path.join(ROOT, "skills/opencode/scripts/agent-run.mjs");
const STATUS = path.join(ROOT, "skills/opencode/scripts/status.mjs");
const OBSERVE = path.join(ROOT, "skills/opencode/scripts/observe.mjs");
const SHARED = path.join(ROOT, "skills/codex/scripts/agent-run.mjs");
const cwd = tempDir("entrust-opencode-cwd-");
const model = "router/deepseek/deepseek-flash";
const prompt = (extra = "", rights = `read ${cwd}`) => `${rights === null ? "" : `RIGHTS: ${rights}\n`}${extra}TASK: inspect the supplied evidence\n`;
function invoke(args, input = "", env = {}) {
  const p = spawnNode(args, { env, stdio: ["pipe", "pipe", "pipe"], killAfterMs: 15000 });
  p.child.stdin.end(input);
  return p.done;
}
test("Desktop's shown models are read in its order with its variants, a provider-default variant is none, and a missing or foreign store says so", async () => {
  const dir = tempDir("entrust-opencode-desktop-");
  const file = await desktopStore(dir, { user: [{ providerID: "router", modelID: "glm/flash", visibility: "show" },
    { providerID: "router", modelID: "hidden", visibility: "hide" }, { providerID: "router", modelID: "deepseek/flash", visibility: "show" }],
    recent: [], variant: { "router/deepseek/flash": "high", "router/glm/flash": "default" } });
  assert.deepEqual(await desktopModels({ ENTRUST_OPENCODE_DESKTOP_STATE: file }), { models: [
    { providerID: "router", modelID: "glm/flash", variant: null }, { providerID: "router", modelID: "deepseek/flash", variant: "high" }] });
  assert.match((await desktopModels({ ENTRUST_OPENCODE_DESKTOP_STATE: path.join(dir, "none.sqlite") })).absent, /no OpenCode Desktop store/);
  const foreign = path.join(dir, "foreign.sqlite"); fs.writeFileSync(foreign, "not a database");
  assert.match((await desktopModels({ ENTRUST_OPENCODE_DESKTOP_STATE: foreign })).error, /could not be read/);
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
test("pinned resume retains only its own model's variant and honours an explicit replacement", async () => {
  const priorModel = { providerID: "router", modelID: "deepseek/flash" };
  const client = { model: async (ref) => ({ ...ref, variants: ["high", "low"] }) };
  const ctx = { client, cwd, resume: true, priorModel, priorVariant: "high",
    parsed: { model: { inherit: false, ...priorModel } } };
  assert.equal((await resolveModel(ctx)).variant, "high");
  assert.equal((await resolveModel({ ...ctx, parsed: { ...ctx.parsed, variant: "low" } })).variant, "low");
  assert.equal((await resolveModel({ ...ctx, parsed: { model: { inherit: false, providerID: "router", modelID: "other" } } })).variant, null);
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
  const last = (resource) => rules.findLast((r) => r.action === "edit" && r.resource === resource)?.effect;
  assert.equal(last(`${cwd}/**`), "allow");
  for (const resource of [`${cwd}/.git`, `${cwd}/.git/*`, `${cwd}/*/.git/*`, `${cwd}/.opencode/*`, `${cwd}/opencode.json*`])
    assert.equal(last(resource), "deny", resource);
  assert.ok(rules.findIndex((r) => r.resource === `${cwd}/.git`) > rules.findIndex((r) => r.resource === `${cwd}/**`));
});
test("Shell is allowed without prompts for read and write sessions", () => {
  for (const scope of [{ kind: "read" }, { kind: "write", roots: [cwd] }]) {
    const rules = sessionPermissions(scope);
    const catchAll = rules.findLastIndex((r) => r.action === "*" && r.resource === "*");
    const shell = rules.findLastIndex((r) => r.action === "shell" && r.resource === "*");
    assert.ok(catchAll >= 0, `${scope.kind}: catch-all ask is present`);
    assert.equal(rules[catchAll].effect, "ask", scope.kind);
    assert.ok(shell > catchAll, `${scope.kind}: Shell override follows catch-all`);
    assert.equal(rules[shell].effect, "allow", scope.kind);
    assert.equal(rules.findLast((r) => r.action === "skill" && r.resource === "*")?.effect, "allow", scope.kind);
    const external = rules.findLastIndex((r) => r.action === "external_directory" && r.resource === "*");
    assert.ok(external > catchAll, `${scope.kind}: external-directory override follows catch-all`);
    assert.equal(rules[external].effect, "allow", scope.kind);
    if (scope.kind === "read")
      assert.equal(rules.findLast((r) => r.action === "edit" && r.resource === "*")?.effect, "deny");
  }
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
  const guard = { stateDir: tempDir("entrust-opencode-guard-") };
  assert.deepEqual(editScope({ roots: [cwd] }, { action: "edit", resources: ["file.txt"] }, cwd, guard), { outside: false });
  assert.deepEqual(editScope({ roots: [cwd] }, { action: "edit", resources: ["../outside.txt"] }, cwd, guard), { outside: true });
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
  const payload = type.endsWith("question") ? { id: "frm_native", sessionID: "ses_owned", title: "Choose", fields: [{ key: "q", type: "string", options: [{ value: "Read", label: "Read" }] }] }
    : { id: "per_native", sessionID: "ses_owned", action: "bash", resources: ["node *"], metadata: { command: "node check.mjs" } };
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
test("large permission bodies survive pending and an exact decision, while truncation is rejected", async () => {
  const m = mailbox();
  m.q.payload.metadata.command = "SYNTHETIC_START" + "x".repeat(220000) + "SYNTHETIC_END";
  m.q.presented = JSON.stringify(m.q.payload, null, 2); m.q.requestHash = digest(m.q.payload);
  fs.writeFileSync(path.join(m.box, `${m.id}.request.json`), JSON.stringify(m.q));
  const pending = await invoke([...m.args, "--pending"]);
  assert.equal(pending.code, 0); assert.ok(pending.out.includes(m.q.presented), `pending output=${Buffer.byteLength(pending.out)} bytes, expected body=${Buffer.byteLength(m.q.presented)} bytes`);
  const args = [...m.args, "--decide", m.id, "--accept"];
  assert.equal((await invoke(args, m.q.presented.slice(0, -100))).code, 2);
  assert.equal(fs.existsSync(path.join(m.box, `${m.id}.decision.json`)), false);
  assert.equal((await invoke(args, m.q.presented + "\n")).code, 0);
});
test("--handback renders a typed request with the message's own token, and tells a dropped trailer and an altered body from the exact copy", async () => {
  const m = mailbox(); const report = path.join(m.dir, "report.json");
  const printed = (await invoke([...m.args, "--pending"])).out.trimEnd();
  const message = `${printed}\nWAITING=${m.id}\nREPORT=${report}`;
  const check = (text) => invoke([...m.args, "--handback"], text);
  const exact = await check(`${message}\n`);
  assert.equal(exact.code, 0, exact.out + exact.err); assert.equal(exact.out, "HANDBACK=exact\n");
  const cut = await check(message.split("\n").slice(0, -1).join("\n"));
  assert.equal(cut.code, 3); assert.match(cut.out, /^HANDBACK=truncated missing=1 first=REPORT=/);
  const frame = /^CANONICAL<<([0-9a-f]{12})\n([^]*)\nCANONICAL>>\1\n$/m.exec(cut.out);
  assert.equal(frame?.[2], message);
  const altered = await check(message.replace("node check.mjs", "node other.mjs"));
  assert.equal(altered.code, 3); assert.match(altered.out, /^HANDBACK=differs line=\d+\n/);
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
test("the catalogue names a model by its catalogue id, lists only enabled models, is read for the run's directory once, and never substitutes", async () => {
  const client = new Client({ config: { url: "http://localhost" } });
  const routes = [];
  client.call = async (method, route) => { routes.push(route); return [
    { id: "deepseek/deepseek-flash", modelID: "deepseek/deepseek-flash", providerID: "router", enabled: false },
    { id: "glm/flash-fast", modelID: "glm/flash", providerID: "router", enabled: true, variants: [{ id: "high" }] }]; };
  await assert.rejects(client.model(splitModel(model), "/work"), /unavailable/);
  await assert.rejects(client.model(splitModel("router/glm/flash"), "/work"), /no substitute/);
  assert.deepEqual(await client.model(splitModel("router/glm/flash-fast"), "/work"), { providerID: "router", modelID: "glm/flash-fast", variants: ["high"] });
  assert.deepEqual(routes, ["/api/model?location[directory]=%2Fwork"]);
});
test("HTTP error bodies and query strings do not escape into diagnostics", async () => {
  const server = http.createServer((req, res) => { res.writeHead(503); res.end("SYNTHETIC_SECRET_BODY"); });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const client = new Client({ config: { url: `http://127.0.0.1:${server.address().port}` } });
    await assert.rejects(client.call("GET", "/bad?secret=SYNTHETIC_QUERY"), (e) =>
      e.message.includes("HTTP 503") && !e.message.includes("SYNTHETIC"));
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
test("provider error details stay out of the report and launcher diagnostics", async () => {
  const s = await fakeOpenCode("provider-error-marker");
  try {
    const r = await driverRun(s);
    assert.notEqual(r.code, 0);
    assert.equal(JSON.stringify(r.report).includes("SYNTHETIC_PROVIDER_SECRET"), false);
    assert.equal(r.out.includes("SYNTHETIC_PROVIDER_SECRET"), false);
    assert.equal(r.err.includes("SYNTHETIC_PROVIDER_SECRET"), false);
    assert.equal(statusLines(path.dirname(r.path), r.path).join("\n").includes("SYNTHETIC_PROVIDER_SECRET"), false);
    assert.deepEqual(r.report.turnError, { name: "ProviderError", status: 429 });
    assert.match(r.report.error, /ProviderError.*429/);
    assert.equal(fs.readFileSync(r.report.transcriptPath, "utf8").includes("SYNTHETIC_PROVIDER_SECRET"), true);
  } finally { await s.close(); }
});
test("the settled mailbox retains its exact synthetic callback while report and status omit it", async () => {
  const s = await fakeOpenCode("permission"); s.permissionCommand = `SYNTHETIC_CALLBACK_${"x".repeat(10000)}_END`;
  try {
    const r = await driverRun(s, { approval: "accept" });
    assert.equal(r.code, 0, r.err);
    const name = fs.readdirSync(r.box).find((n) => n.endsWith(".request.json"));
    const requestPath = path.join(r.box, name), request = JSON.parse(fs.readFileSync(requestPath, "utf8"));
    assert.equal(request.payload.metadata.command, s.permissionCommand);
    assert.equal(request.presented, JSON.stringify(request.payload, null, 2));
    assert.equal(request.settled.outcome, "applied");
    assert.equal(fs.statSync(requestPath).mode & 0o777, 0o600);
    assert.equal(fs.existsSync(path.join(r.box, "pending")), false);
    assert.equal(JSON.stringify(r.report).includes("SYNTHETIC_CALLBACK_"), false);
    assert.equal(r.out.includes("SYNTHETIC_CALLBACK_"), false);
    assert.equal(r.err.includes("SYNTHETIC_CALLBACK_"), false);
    assert.equal(statusLines(path.dirname(r.path), r.path).join("\n").includes("SYNTHETIC_CALLBACK_"), false);
    for (const p of [r.path, r.report.transcriptPath, r.report.answerPath]) assert.equal(fs.statSync(p).mode & 0o777, 0o600);
  } finally { await s.close(); }
});
test("observer is report-bound, pages current content, and becomes unavailable after its owner closes", async () => {
  const dir = tempDir("entrust-live-case-"), report = path.join(dir, "report.json");
  const ctx = { report, invocationId: "inv_test" };
  let messages = Array.from({ length: 205 }, (_, i) => ({ id: `m${i}`, text: `old ${i}` }));
  const owner = await startObserver(ctx, async (ownerCtx, kind) => ({ report: ownerCtx.report, invocationId: ownerCtx.invocationId,
    serverStatus: "busy", nonAtomic: true, complete: true, ...(kind === "messages" ? { messages } : {}) }));
  fs.writeFileSync(report, JSON.stringify({ adapter: "opencode", invocationId: ctx.invocationId, observer: owner.address }));
  try {
    assert.equal(fs.statSync(path.dirname(owner.address)).mode & 0o777, 0o700);
    assert.equal((await readObservation(report)).serverStatus, "busy");
    let p = await readObservation(report, "messages"), count = p.messages.length;
    assert.equal(count, 50); const foreign = p.cursor;
    messages[0] = { id: "m0", text: "updated" };
    assert.equal((await readObservation(report, "messages")).messages[0].text, "updated");
    while (p.cursor) { p = await readObservation(report, "messages", p.cursor); count += p.messages.length; }
    assert.equal(count, 205);
    const other = path.join(dir, "other.json");
    fs.writeFileSync(other, JSON.stringify({ adapter: "opencode", invocationId: ctx.invocationId, observer: owner.address }));
    assert.equal((await readObservation(other, "messages", foreign)).state, "unavailable");
  } finally { await owner.close(); }
  assert.equal((await readObservation(report)).state, "unavailable");
});
test("oversized observed messages have independent bounded content and next-page cursors", async () => {
  const dir = tempDir("entrust-large-observation-"), report = path.join(dir, "report.json");
  const ctx = { report, invocationId: "inv_large", sessionID: "ses_root" };
  const text = '🐈\\"\n'.repeat(140000);
  const messages = [{ id: "input", type: "user", _sessionID: "ses_root", time: { created: 1 }, text },
    ...Array.from({ length: 110 }, (_, i) => ({ id: `m${i}`, type: "assistant", _sessionID: "ses_root", time: { created: i + 2 },
      text: i === 55 ? text : `small ${i}` })),
    { id: "input", type: "assistant", _sessionID: "ses_child", time: { created: 200 }, text: "child" }];
  const owner = await startObserver(ctx, async (_owner, kind) => ({ ...ctx, inputIds: ["input"], complete: true, partial: false, tools: [],
    nonAtomic: true, ...(kind === "messages" ? { messages } : {}) }));
  fs.writeFileSync(report, JSON.stringify({ adapter: "opencode", invocationId: ctx.invocationId, observer: owner.address }));
  const options = { large: true };
  const readAll = async (expectedState) => {
    let cursor = null, pages = 0, fragments = 0; const collected = [];
    do {
      const p = await readObservation(report, "messages", cursor, options);
      assert.equal(p.state, expectedState); assert.ok(Buffer.byteLength(JSON.stringify(p)) <= 512 * 1024);
      collected.push(...p.messages); pages++;
      if (p.oversized) {
        const d = p.oversized; assert.equal(d.messageIndex, collected.length);
        assert.equal(p.complete, false); assert.equal(p.partial, true); assert.equal(p.sourcePartial, false);
        assert.equal(p.toolsOmitted, expectedState === "live" ? true : undefined);
        const parts = []; let position = 0, contentCursor = d.contentCursor;
        while (contentCursor) {
          const chunk = await readObservation(report, "messages", contentCursor, options);
          assert.equal(chunk.state, expectedState); assert.ok(Buffer.byteLength(JSON.stringify(chunk)) <= 512 * 1024);
          assert.equal(chunk.complete, false); assert.equal(chunk.partial, true); assert.equal(chunk.sourcePartial, false);
          assert.equal(chunk.toolsOmitted, expectedState === "live" ? true : undefined);
          assert.equal(chunk.fragment.encoding, "base64"); assert.equal(chunk.fragment.byteOffset, position);
          const bytes = Buffer.from(chunk.fragment.data, "base64"); assert.ok(bytes.length <= 128 * 1024);
          position += bytes.length; parts.push(bytes); fragments++; contentCursor = chunk.cursor;
        }
        const encoded = Buffer.concat(parts);
        assert.equal(encoded.length, d.totalBytes); assert.equal(crypto.createHash("sha256").update(encoded).digest("hex"), d.sha256);
        collected.push(JSON.parse(encoded.toString("utf8")));
      }
      cursor = p.cursor;
      assert.ok(pages < 20, "pagination did not advance");
    } while (cursor);
    assert.ok(pages >= 3); assert.ok(fragments > 2); assert.deepEqual(collected, messages);
  };
  let liveContentCursor;
  try {
    const first = await readObservation(report, "messages", null, options);
    assert.equal(first.state, "live"); assert.equal(first.messages.length, 0); assert.ok(first.oversized?.contentCursor); assert.ok(first.cursor);
    assert.equal(first.messagesComplete, false);
    liveContentCursor = first.oversized.contentCursor;
    assert.deepEqual([first.oversized.sessionID, first.oversized.messageID], ["ses_root", "input"]);
    const legacy = await readObservation(report, "messages");
    assert.equal(legacy.state, "unavailable"); assert.equal(legacy.reason, "oversized");
    const oldCursor = Buffer.from(JSON.stringify({ report, invocationId: ctx.invocationId, offset: 1 })).toString("base64url");
    assert.equal((await readObservation(report, "messages", oldCursor)).messages[0].id, "m0");
    const legacyCli = await invoke([OBSERVE, "--report-file", report, "--messages"]);
    assert.equal(legacyCli.code, 1); assert.equal(JSON.parse(legacyCli.out).reason, "oversized");
    assert.match(legacyCli.out, /--large/);
    const cli = await invoke([OBSERVE, "--report-file", report, "--messages", "--large"]);
    assert.equal(cli.code, 0, cli.err); assert.equal(JSON.parse(cli.out).oversized.messageID, "input");
    const cliPart = await invoke([OBSERVE, "--report-file", report, "--messages", "--large", "--cursor", liveContentCursor]);
    assert.equal(cliPart.code, 0, cliPart.err); assert.equal(JSON.parse(cliPart.out).fragment.byteOffset, 0);
    const same = await readObservation(report, "messages", null, options);
    assert.equal(same.oversized.sha256, first.oversized.sha256);
    const mixed = JSON.parse(Buffer.from(first.oversized.contentCursor, "base64url"));
    mixed.report = report; mixed.reportHash = "0".repeat(64);
    assert.equal((await readObservation(report, "messages", Buffer.from(JSON.stringify(mixed)).toString("base64url"), options)).state, "unavailable");
    mixed.reportHash = crypto.createHash("sha256").update(report).digest("hex");
    assert.equal((await readObservation(report, "messages", Buffer.from(JSON.stringify(mixed)).toString("base64url"), options)).state, "unavailable");
    messages[0].text += "changed";
    const after = await readObservation(report, "messages", first.cursor, options);
    assert.equal(after.state, "live"); assert.equal(after.messages[0].id, "m0");
    assert.equal((await readObservation(report, "messages", first.oversized.contentCursor, options)).state, "stale");
    messages[0].text = text;
    messages.push({ ...messages[0] });
    assert.equal((await readObservation(report, "messages", first.oversized.contentCursor, options)).state, "stale");
    messages.pop();
    const other = path.join(dir, "other.json");
    fs.writeFileSync(other, JSON.stringify({ adapter: "opencode", invocationId: ctx.invocationId, observer: owner.address }));
    assert.equal((await readObservation(other, "messages", first.oversized.contentCursor, options)).state, "unavailable");
    const otherCtx = { report: other, invocationId: "inv_other", sessionID: "ses_root" };
    const otherOwner = await startObserver(otherCtx, async () => ({ ...otherCtx, inputIds: ["input"], messages }));
    try {
      fs.writeFileSync(other, JSON.stringify({ adapter: "opencode", invocationId: otherCtx.invocationId, observer: otherOwner.address }));
      assert.equal((await readObservation(other, "messages", first.oversized.contentCursor, options)).state, "unavailable");
    } finally { await otherOwner.close(); }
    const saved = messages.shift();
    assert.equal((await readObservation(report, "messages", first.cursor, options)).state, "stale");
    messages.unshift(saved);
    await readAll("live");
  } finally { await owner.close(); }
  const transcript = path.join(dir, "report.transcript.json");
  fs.writeFileSync(transcript, JSON.stringify({ sessionID: "ses_root", inputIds: ["input"], messages }));
  const terminalReport = { adapter: "opencode", invocationId: ctx.invocationId, sessionID: "ses_root", turnIds: ["input"],
    exitCode: 0, partial: false, transcriptPath: transcript };
  fs.writeFileSync(report, JSON.stringify(terminalReport));
  const terminalPart = await readObservation(report, "messages", liveContentCursor, options);
  assert.equal(terminalPart.state, "terminal"); assert.equal(terminalPart.fragment.messageID, "input");
  const terminalContent = JSON.parse(Buffer.from(liveContentCursor, "base64url"));
  const terminalCursors = ["garbage", `${liveContentCursor}!`,
    Buffer.from(JSON.stringify({ ...terminalContent, offset: 1, after: { sessionID: "bogus", messageID: "foreign" } })).toString("base64url"),
    Buffer.from(JSON.stringify({ ...terminalContent, kind: "page", offset: 1 })).toString("base64url"),
    Buffer.from(JSON.stringify({ reportHash: terminalContent.reportHash, invocationId: ctx.invocationId, kind: "page", offset: 1 })).toString("base64url")];
  for (const invalidCursor of terminalCursors) {
    const invalid = await invoke([OBSERVE, "--report-file", report, "--messages", "--large", "--cursor", invalidCursor]);
    assert.equal(invalid.code, 1); assert.equal(JSON.parse(invalid.out).state, "unavailable");
  }
  messages[0].text += "new revision";
  fs.writeFileSync(transcript, JSON.stringify({ sessionID: "ses_root", inputIds: ["input"], messages }));
  assert.equal((await readObservation(report, "messages", liveContentCursor, options)).state, "stale");
  const staleCli = await invoke([OBSERVE, "--report-file", report, "--messages", "--large", "--cursor", liveContentCursor]);
  assert.equal(staleCli.code, 1); assert.equal(JSON.parse(staleCli.out).state, "stale");
  messages[0].text = text;
  fs.writeFileSync(transcript, JSON.stringify({ sessionID: "ses_root", inputIds: ["input"], messages }));
  await readAll("terminal");
  terminalReport.partial = true; fs.writeFileSync(report, JSON.stringify(terminalReport));
  const partialRun = await readObservation(report, "messages", null, options);
  assert.equal(partialRun.partial, true); assert.equal(partialRun.sourcePartial, true);
});
test("legacy shell pagination stops at an oversized message rather than skipping it", async () => {
  const dir = tempDir("entrust-legacy-page-"), report = path.join(dir, "report.json");
  const ctx = { report, invocationId: "inv_shell", sessionID: "ses_root" };
  const messages = [{ id: "before", _sessionID: "ses_root" }, { id: "large", _sessionID: "ses_root", text: "🐈".repeat(180000) },
    { id: "after", _sessionID: "ses_root" }];
  const owner = await startObserver(ctx, async () => ({ ...ctx, messages }));
  fs.writeFileSync(report, JSON.stringify({ adapter: "opencode", invocationId: ctx.invocationId, observer: owner.address }));
  try {
    const first = await invoke([OBSERVE, "--report-file", report, "--messages"]);
    assert.equal(first.code, 0, first.err); const page = JSON.parse(first.out);
    assert.deepEqual(page.messages.map((m) => m.id), ["before"]); assert.ok(page.cursor);
    const next = await invoke([OBSERVE, "--report-file", report, "--messages", "--cursor", page.cursor]);
    assert.equal(next.code, 1); assert.equal(JSON.parse(next.out).reason, "oversized"); assert.match(next.out, /--large/);
  } finally { await owner.close(); }
});
test("current CLI reads status and messages from a pre-capability owner", async () => {
  const dir = fs.mkdtempSync("/tmp/entrust-old-protocol-"), report = path.join(dir, "report.json"), address = path.join(dir, "socket");
  const ctx = { report, invocationId: "inv_old" };
  const server = net.createServer((socket) => {
    let request = ""; socket.on("error", () => {});
    socket.on("data", (chunk) => {
      request += chunk.toString("utf8"); if (!request.includes("\n")) return;
      const q = JSON.parse(request.slice(0, request.indexOf("\n")));
      const body = q.report === report && q.invocationId === ctx.invocationId
        ? { ...ctx, serverStatus: "busy", ...(q.kind === "messages" ? { messages: [{ id: "old-message" }], cursor: null } : {}) }
        : { ...ctx, error: "unavailable or invalid request" };
      socket.end(JSON.stringify(body) + "\n");
    });
  });
  await new Promise((resolve) => server.listen(address, resolve));
  fs.writeFileSync(report, JSON.stringify({ adapter: "opencode", invocationId: ctx.invocationId, observer: address }));
  try {
    for (const args of [[], ["--messages"], ["--messages", "--large"]]) {
      const r = await invoke([OBSERVE, "--report-file", report, ...args]);
      assert.equal(r.code, 0, r.err); const value = JSON.parse(r.out); assert.equal(value.state, "live");
      if (args.includes("--messages")) assert.equal(value.messages[0].id, "old-message");
      else assert.equal(value.serverStatus, "busy");
    }
  } finally { await new Promise((resolve) => server.close(resolve)); fs.rmSync(dir, { recursive: true, force: true }); }
});
test("oversized fragments do not duplicate a large tool list into every bounded reply", async () => {
  const dir = tempDir("entrust-large-tools-"), report = path.join(dir, "report.json");
  const ctx = { report, invocationId: "inv_tools", sessionID: "ses_root" };
  const tools = Array.from({ length: 7000 }, (_, i) => ({ tool: "shell", callID: `call_${i}`, status: "completed" }));
  const messages = [{ id: "large", _sessionID: "ses_root", text: "🐈".repeat(180000) }, { id: "after", _sessionID: "ses_root" }];
  const owner = await startObserver(ctx, async (_owner, kind) => ({ ...ctx, complete: true, tools, ...(kind === "messages" ? { messages } : {}) }));
  fs.writeFileSync(report, JSON.stringify({ adapter: "opencode", invocationId: ctx.invocationId, observer: owner.address }));
  try {
    const status = await readObservation(report);
    assert.equal(status.state, "live"); assert.equal(status.tools.length, tools.length); assert.equal(status.complete, true);
    const first = await readObservation(report, "messages", null, { large: true });
    assert.equal(first.state, "live"); assert.equal(first.toolsOmitted, true); assert.equal(first.tools, undefined); assert.equal(first.complete, false);
    const part = await readObservation(report, "messages", first.oversized.contentCursor, { large: true });
    assert.equal(part.state, "live"); assert.equal(part.toolsOmitted, true); assert.equal(part.tools, undefined); assert.equal(part.complete, false);
    assert.ok(Buffer.byteLength(JSON.stringify(part)) < 512 * 1024);
    const next = await readObservation(report, "messages", first.cursor, { large: true });
    assert.equal(next.state, "live"); assert.equal(next.messages[0].id, "after"); assert.equal(next.complete, true); assert.equal(next.tools.length, tools.length);
  } finally { await owner.close(); }
});
test("long report paths keep oversized cursors within the IPC request bound", async () => {
  const ctx = { report: `/tmp/${"deep/".repeat(760)}report.json`, invocationId: "inv_long", sessionID: "ses_root" };
  const messages = [{ id: "large", _sessionID: "ses_root", text: "🐈".repeat(180000) }, { id: "after", _sessionID: "ses_root" }];
  const owner = await startObserver(ctx, async () => ({ ...ctx, messages }));
  const reportHash = crypto.createHash("sha256").update(ctx.report).digest("hex");
  const request = (cursor, form = "hash") => new Promise((resolve, reject) => {
    const socket = net.createConnection(owner.address), chunks = [];
    const address = form === "raw" ? { report: ctx.report } : form === "mixed" ? { report: "/tmp/foreign", reportHash } : { reportHash };
    const payload = Buffer.from(JSON.stringify({ ...address, invocationId: ctx.invocationId, kind: "messages", largeMessages: 1, cursor }) + "\n");
    assert.ok(payload.length <= 4096, `request is ${payload.length} bytes`);
    socket.on("error", reject); socket.on("data", (chunk) => chunks.push(chunk));
    socket.on("end", () => resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))));
    socket.on("connect", () => socket.write(payload));
  });
  try {
    const first = await request(null);
    assert.ok(first.oversized?.contentCursor); assert.ok(first.cursor);
    assert.ok((await request(null, "raw")).oversized?.contentCursor);
    let contentCursor = first.oversized.contentCursor, offset = 0; const parts = [];
    while (contentCursor) {
      const part = await request(contentCursor);
      assert.equal(part.fragment.byteOffset, offset);
      const bytes = Buffer.from(part.fragment.data, "base64"); parts.push(bytes); offset += bytes.length;
      contentCursor = part.cursor;
    }
    const bytes = Buffer.concat(parts);
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), first.oversized.sha256);
    assert.deepEqual(JSON.parse(bytes.toString("utf8")), messages[0]);
    assert.equal((await request(first.cursor)).messages[0].id, "after");
    assert.equal((await request(null, "mixed")).error, "unavailable");
    const foreign = JSON.parse(Buffer.from(first.oversized.contentCursor, "base64url"));
    if ("reportHash" in foreign) foreign.reportHash = "0".repeat(64); else foreign.report = "/tmp/foreign.json";
    assert.equal((await request(Buffer.from(JSON.stringify(foreign)).toString("base64url"))).error, "unavailable");
    assert.equal((await request("not-valid-json")).error, "unavailable");
    const originalRead = fs.readFileSync, originalConnect = net.createConnection, sent = [];
    fs.readFileSync = function (file, ...args) {
      if (file === ctx.report) return JSON.stringify({ adapter: "opencode", invocationId: ctx.invocationId, observer: owner.address });
      return originalRead.call(this, file, ...args);
    };
    net.createConnection = function (...args) {
      const socket = originalConnect.apply(this, args), write = socket.write;
      socket.write = function (chunk, ...rest) { sent.push({ value: JSON.parse(String(chunk)), bytes: Buffer.byteLength(chunk) }); return write.call(this, chunk, ...rest); };
      return socket;
    };
    try {
      const selected = await readObservation(ctx.report, "messages", null, { large: true });
      assert.equal(selected.state, "live"); let cursor = selected.oversized.contentCursor, offset = 0;
      const chunks = [];
      while (cursor) {
        const part = await readObservation(ctx.report, "messages", cursor, { large: true });
        assert.equal(part.state, "live"); assert.equal(part.fragment.byteOffset, offset);
        const chunk = Buffer.from(part.fragment.data, "base64"); chunks.push(chunk); offset += chunk.length; cursor = part.cursor;
      }
      assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString("utf8")), messages[0]);
      assert.equal((await readObservation(ctx.report, "messages", selected.cursor, { large: true })).messages[0].id, "after");
      assert.equal(sent[0].value.report, ctx.report);
      assert.equal(sent[0].value.reportHash, undefined);
      assert.equal(sent[1].value.report, undefined);
      assert.equal(sent[1].value.reportHash, reportHash);
      assert.ok(sent.every((entry) => entry.bytes <= 4096));
    } finally { fs.readFileSync = originalRead; net.createConnection = originalConnect; }
  } finally { await owner.close(); }
});
test("observer validates report addressing and cursor identity for legacy and capability requests", async () => {
  const ctx = { report: "/tmp/отчёт.json", invocationId: "inv_matrix", sessionID: "ses_root" };
  const reportHash = crypto.createHash("sha256").update(ctx.report).digest("hex");
  const messages = [{ id: "large", _sessionID: "ses_root", text: "🐈\\\"".repeat(150000) }, { id: "after", _sessionID: "ses_root" }];
  const owner = await startObserver(ctx, async (_owner, kind) => ({ ...ctx, ...(kind === "messages" ? { messages } : {}) }));
  const request = (fields) => new Promise((resolve, reject) => {
    const socket = net.createConnection(owner.address), chunks = [];
    socket.on("error", reject); socket.on("data", (chunk) => chunks.push(chunk));
    socket.on("end", () => resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))));
    socket.on("connect", () => socket.write(JSON.stringify({ invocationId: ctx.invocationId, kind: "status", ...fields }) + "\n"));
  });
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  try {
    assert.equal((await request({ report: ctx.report })).report, ctx.report);
    assert.equal((await request({ reportHash, largeMessages: 1 })).report, ctx.report);
    for (const address of [
      {}, { report: "/tmp/foreign" }, { reportHash }, { reportHash: "0".repeat(64), largeMessages: 1 },
      { report: ctx.report, reportHash, largeMessages: 1 }, { report: "/tmp/foreign", reportHash, largeMessages: 1 },
    ]) assert.equal((await request(address)).error, "unavailable");
    assert.equal((await request({ report: ctx.report, invocationId: "foreign" })).error, "unavailable");
    const descriptor = await request({ reportHash, largeMessages: 1, kind: "messages" });
    assert.ok(descriptor.oversized?.contentCursor); assert.ok(descriptor.cursor);
    assert.equal((await request({ reportHash, largeMessages: 1, kind: "messages", cursor: descriptor.cursor })).messages[0].id, "after");
    assert.equal((await request({ reportHash, largeMessages: 1, kind: "messages", cursor: descriptor.oversized.contentCursor })).fragment.byteOffset, 0);
    const legacy = encode({ report: ctx.report, invocationId: ctx.invocationId, offset: 1 });
    assert.equal((await request({ reportHash, largeMessages: 1, kind: "messages", cursor: legacy })).messages[0].id, "after");
    const content = JSON.parse(Buffer.from(descriptor.oversized.contentCursor, "base64url"));
    for (const cursor of [
      "not-json", encode({ offset: 1 }), encode({ report: "/tmp/foreign", invocationId: ctx.invocationId, offset: 1 }),
      encode({ report: ctx.report, reportHash, invocationId: ctx.invocationId, offset: 1 }),
      encode({ reportHash: "0".repeat(64), invocationId: ctx.invocationId, offset: 1 }),
      encode({ reportHash, invocationId: "foreign", offset: 1 }), encode({ reportHash, invocationId: ctx.invocationId, offset: -1 }),
      encode({ reportHash, invocationId: ctx.invocationId, kind: "page", offset: 1 }),
      `${descriptor.oversized.contentCursor}!`, encode({ ...content, offset: 1, after: { sessionID: "bogus", messageID: "foreign" } }),
      encode({ ...content, kind: "page", offset: 1 }), encode({ report: ctx.report, invocationId: ctx.invocationId, offset: 1, extra: true }),
    ]) assert.equal((await request({ reportHash, largeMessages: 1, kind: "messages", cursor })).error, "unavailable");
    messages[0].text += "changed";
    assert.equal((await request({ reportHash, largeMessages: 1, kind: "messages", cursor: descriptor.oversized.contentCursor })).error, "stale_cursor");
    assert.equal((await request({ reportHash, largeMessages: 1, kind: "messages", cursor: descriptor.cursor })).messages[0].id, "after");
  } finally { await owner.close(); }
});
test("observer decodes UTF-8 split within a character on both socket directions", async () => {
  const dir = fs.mkdtempSync("/tmp/entrust-unicode-"), report = path.join(dir, "отчёт.json"), ctx = { report, invocationId: "inv_тест" };
  const owner = await startObserver(ctx, async () => ({ ...ctx, text: "ответ 🐈" }));
  try {
    const request = Buffer.from(JSON.stringify({ ...ctx, kind: "status" }) + "\n");
    const split = request.indexOf(Buffer.from("о")) + 1;
    const response = await new Promise((resolve, reject) => {
      const socket = net.createConnection(owner.address); const chunks = [];
      socket.on("error", reject); socket.on("data", (chunk) => chunks.push(chunk));
      socket.on("end", () => resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))));
      socket.on("connect", () => { socket.write(request.subarray(0, split)); setTimeout(() => socket.write(request.subarray(split)), 30); });
    });
    assert.equal(response.report, report); assert.equal(response.invocationId, ctx.invocationId); assert.equal(response.text, "ответ 🐈");
  } finally { await owner.close(); }
  const address = path.join(dir, "split.sock");
  const server = net.createServer((socket) => socket.once("data", () => {
    const output = Buffer.from(JSON.stringify({ ...ctx, text: "ответ 🐈" }) + "\n");
    const split = output.indexOf(Buffer.from("🐈")) + 2;
    socket.write(output.subarray(0, split)); setTimeout(() => socket.end(output.subarray(split)), 30);
  }));
  await new Promise((resolve) => server.listen(address, resolve));
  fs.writeFileSync(report, JSON.stringify({ adapter: "opencode", invocationId: ctx.invocationId, observer: address }));
  try { assert.equal((await readObservation(report)).text, "ответ 🐈"); }
  finally { await new Promise((resolve) => server.close(resolve)); fs.rmSync(dir, { recursive: true, force: true }); }
});
test("observer close terminates an accepted socket and is idempotent even with a stalled read", async () => {
  const ctx = { report: "/tmp/held.json", invocationId: "inv_hold" };
  let entered;
  const started = new Promise((resolve) => { entered = resolve; });
  const owner = await startObserver(ctx, async () => { entered(); return await new Promise(() => {}); });
  const socket = net.createConnection(owner.address);
  socket.on("error", () => {});
  await new Promise((resolve) => socket.once("connect", resolve));
  const closed = new Promise((resolve) => socket.once("close", resolve));
  socket.write(JSON.stringify({ ...ctx, kind: "status" }) + "\n");
  await started;
  const timer = new Promise((_, reject) => setTimeout(() => reject(new Error("close blocked on socket")), 1000).unref());
  await Promise.race([Promise.all([owner.close(), owner.close(), closed]), timer]);
  assert.equal(fs.existsSync(owner.address), false);
});
test("observer limits UTF-8 requests and replies by bytes, not characters", async () => {
  const dir = fs.mkdtempSync("/tmp/entrust-byte-limit-"), report = path.join(dir, "report.json"), ctx = { report, invocationId: "inv" };
  let observed = 0;
  const owner = await startObserver(ctx, async () => { observed++; return ctx; });
  try {
    const request = JSON.stringify({ ...ctx, kind: "status", padding: "я".repeat(2100) }) + "\n";
    assert.ok(request.length < 4096 && Buffer.byteLength(request) > 4096);
    await new Promise((resolve, reject) => {
      const socket = net.createConnection(owner.address);
      socket.on("error", () => {}); socket.on("close", resolve);
      socket.on("connect", () => socket.write(request));
      setTimeout(() => { socket.destroy(); reject(new Error("over-limit request was not closed")); }, 2000).unref();
    });
    assert.equal(observed, 0);
  } finally { await owner.close(); }
  const address = path.join(dir, "large.sock");
  const server = net.createServer((socket) => {
    socket.on("error", () => {});
    socket.once("data", () => socket.end(JSON.stringify({ ...ctx, text: "я".repeat(270000) }) + "\n"));
  });
  await new Promise((resolve) => server.listen(address, resolve));
  fs.writeFileSync(report, JSON.stringify({ adapter: "opencode", invocationId: ctx.invocationId, observer: address }));
  try { assert.equal((await readObservation(report)).state, "unavailable"); }
  finally { await new Promise((resolve) => server.close(resolve)); fs.rmSync(dir, { recursive: true, force: true }); }
});
test("observer counts the final newline when bounding the serialized socket response", async () => {
  const dir = tempDir("entrust-live-boundary-"), report = path.join(dir, "report.json"), ctx = { report, invocationId: "inv_limit" };
  const base = { ...ctx, payload: "" };
  const size = 512 * 1024 - Buffer.byteLength(JSON.stringify(base));
  const owner = await startObserver(ctx, async () => ({ ...base, payload: "x".repeat(size) }));
  try {
    const raw = await new Promise((resolve, reject) => {
      const socket = net.createConnection(owner.address), chunks = [];
      socket.on("error", reject); socket.on("data", (chunk) => chunks.push(chunk));
      socket.on("end", () => resolve(Buffer.concat(chunks)));
      socket.on("connect", () => socket.write(JSON.stringify({ ...ctx, kind: "status" }) + "\n"));
    });
    assert.ok(raw.length <= 512 * 1024); assert.equal(raw.at(-1), 10);
    assert.equal(JSON.parse(raw.toString("utf8")).error, "response exceeds limit");
  } finally { await owner.close(); }
});
test("owner observation distinguishes pending admission, callbacks, busy and invalid status without disclosing callback contents", async () => {
  const routes = { children: "/sessions?parentID={sessionID}", permissionList: "/session/{sessionID}/permission",
    formList: "/session/{sessionID}/form", messages: "/session/{sessionID}/message", active: "/active" };
  const startedAtMs = Date.now() - 1000;
  const rows = [ { id: "old", type: "user", time: { created: startedAtMs + 1 } },
    { id: "input", type: "user", time: { created: startedAtMs + 2 } },
    { id: "answer", type: "assistant", time: { created: startedAtMs + 3 }, content: [{ type: "tool", id: "call", name: "shell", state: { status: "running", input: { command: "PRIVATE_COMMAND", path: "PRIVATE_PATH" }, content: [{ type: "text", text: "PRIVATE_OUTPUT" }], metadata: { truncated: true, secret: "PRIVATE_SECRET" } } }] } ];
  let active = { ses_root: { type: "running" } };
  const client = { call: async (_method, route) => {
    if (route.startsWith("/sessions?")) return { data: [] };
    if (route.endsWith("/permission")) return [{ id: "p", sessionID: "ses_root", secret: "PRIVATE_CALLBACK" }];
    if (route.endsWith("/form")) return [];
    if (route.startsWith("/session/ses_root/message")) return { data: [...rows].reverse() };
    if (route === "/active") return active;
    throw new Error(route);
  } };
  const ctx = { report: "/tmp/report.json", invocationId: "inv", sessionID: "ses_root", invocationInputs: new Set(["input"]),
    admission: "pending", startedAtMs, preexisting: new Set(), ownedReady: true, routes, client };
  const status = await observe(ctx, "status");
  assert.equal(status.admission, "pending"); assert.equal(status.serverStatus, "busy");
  assert.deepEqual(status.callbacks, { permissions: 1, questions: 0 });
  assert.deepEqual(status.tools, [{ tool: "shell", callID: "call", status: "running", outputTruncated: true }]);
  assert.equal(JSON.stringify(status).includes("PRIVATE_"), false);
  rows[2].content[0].state.metadata.truncated = false;
  assert.equal((await observe(ctx, "status")).tools[0].outputTruncated, false);
  rows[2].content[0].state.metadata.truncated = "false";
  assert.equal((await observe(ctx, "status")).tools[0].outputTruncated, null);
  assert.deepEqual((await observe(ctx, "messages")).messages.map((m) => m.id), ["input", "answer"]);
  active = []; const unknown = await observe(ctx, "status");
  assert.equal(unknown.serverStatus, "unknown"); assert.equal(unknown.complete, false);
  for (const invalid of [{ error: "invalid active schema" }, { ses_root: {} }, { ses_root: { type: "idle" } }, { wrong: { type: "running" } }]) {
    active = invalid; const snapshot = await observe(ctx, "status");
    assert.equal(snapshot.serverStatus, "unknown"); assert.equal(snapshot.complete, false);
  }
});
test("owner observation snapshots input identity while a correction starts", async () => {
  const routes = { children: "/sessions?parentID={sessionID}", permissionList: "/session/{sessionID}/permission",
    formList: "/session/{sessionID}/form", messages: "/session/{sessionID}/message", active: "/active" };
  const startedAtMs = Date.now() - 1000;
  const rows = [{ id: "input", type: "user", time: { created: startedAtMs + 1 } },
    { id: "first", type: "assistant", time: { created: startedAtMs + 2 } },
    { id: "correction", type: "user", time: { created: startedAtMs + 3 } },
    { id: "second", type: "assistant", time: { created: startedAtMs + 4 } }];
  let release, entered;
  const blocked = new Promise((resolve) => { release = resolve; });
  const reached = new Promise((resolve) => { entered = resolve; });
  let first = true;
  const client = { call: async (_method, route) => {
    if (route.startsWith("/sessions?parentID=ses_root")) {
      if (first) { first = false; entered(); await blocked; }
      return { data: [{ id: "ses_new_child", parentID: "ses_root" }] };
    }
    if (route.startsWith("/sessions?")) return { data: [] };
    if (route.endsWith("/permission") || route.endsWith("/form")) return [];
    if (route.startsWith("/session/ses_root/message")) return { data: [...rows].reverse() };
    if (route.startsWith("/session/ses_new_child/message")) return { data: [{ id: "child-of-correction", type: "assistant",
      time: { created: startedAtMs + 5 }, content: [{ type: "tool", name: "from-correction", state: { status: "running" } }] }] };
    if (route === "/active") return { ses_root: { type: "running" } };
    throw new Error(route);
  } };
  const ctx = { report: "/tmp/report.json", invocationId: "inv", sessionID: "ses_root", invocationInputs: new Set(["input"]),
    admission: "admitted", startedAtMs, preexisting: new Set(), ownedReady: true, routes, client };
  const pending = observe(ctx, "messages"); await reached;
  ctx.invocationInputs.add("correction"); release();
  const snapshot = await pending;
  assert.deepEqual(snapshot.inputIds, ["input"]);
  assert.deepEqual(snapshot.messages.map((m) => m.id), ["input", "first"]);
  assert.equal(snapshot.complete, false); assert.equal(snapshot.partial, true);
  assert.equal(snapshot.tools.some((t) => t.tool === "from-correction"), false);
  const next = await observe(ctx, "messages");
  assert.deepEqual(next.inputIds, ["input", "correction"]);
  assert.deepEqual(next.messages.map((m) => m.id), ["input", "first", "correction", "second", "child-of-correction"]);
  assert.equal(next.tools.some((t) => t.tool === "from-correction"), true);
  assert.equal(next.complete, true);
});
test("owner observation reports partial during correction admission and while an input is absent", async () => {
  const routes = { children: "/sessions?parentID={sessionID}", permissionList: "/session/{sessionID}/permission",
    formList: "/session/{sessionID}/form", messages: "/session/{sessionID}/message", active: "/active" };
  const startedAtMs = Date.now() - 1000;
  const rows = [{ id: "input", type: "user", time: { created: startedAtMs + 1 } }];
  const client = { call: async (_method, route) => {
    if (route.startsWith("/sessions?parentID=ses_root")) return { data: [{ id: "ses_new_child", parentID: "ses_root" }] };
    if (route.startsWith("/sessions?")) return { data: [] };
    if (route.endsWith("/permission") || route.endsWith("/form")) return [];
    if (route.startsWith("/session/ses_root/message")) return { data: [...rows].reverse() };
    if (route.startsWith("/session/ses_new_child/message")) return { data: [{ id: "child-of-correction", type: "assistant",
      time: { created: startedAtMs + 3 }, content: [{ type: "tool", name: "from-correction", state: { status: "running" } }] }] };
    if (route === "/active") return { ses_root: { type: "running" } };
    throw new Error(route);
  } };
  const ctx = { report: "/tmp/report.json", invocationId: "inv", sessionID: "ses_root", invocationInputs: new Set(["input", "correction"]),
    admission: "admitted", admissionInFlight: true, startedAtMs, preexisting: new Set(), ownedReady: true, routes, client };
  const pending = await observe(ctx, "messages");
  assert.deepEqual(pending.inputIds, ["input", "correction"]); assert.deepEqual(pending.messages.map((m) => m.id), ["input"]);
  assert.equal(pending.complete, false); assert.equal(pending.partial, true); assert.equal(pending.tools.length, 0);
  ctx.admissionInFlight = false;
  assert.equal((await observe(ctx, "messages")).complete, false, "a missing declared input is incomplete even after admission");
  rows.push({ id: "correction", type: "user", time: { created: startedAtMs + 2 } });
  const complete = await observe(ctx, "messages");
  assert.equal(complete.complete, true); assert.equal(complete.messages.some((message) => message.id === "child-of-correction"), true);
});
test("owner observation stays partial when correction admission finishes during a read", async () => {
  const ctx = { report: "/tmp/view", invocationId: "inv", sessionID: "ses_root", admission: "admitted", admissionInFlight: true,
    invocationInputs: new Set(["first", "correction"]), preexisting: new Set(["ses_root"]), ownedReady: true, startedAtMs: 1,
    routes: { children: "/children", permissionList: "/permission", formList: "/form", messages: "/message", active: "/active" } };
  ctx.client = { call: async (_method, route) => {
    if (route === "/children") return { data: [] };
    if (route === "/active") return {};
    if (route.startsWith("/message")) { ctx.admissionInFlight = false; return { data: [{ id: "first", type: "user", time: { created: 2 } }] }; }
    return [];
  } };
  const snapshot = await observe(ctx, "messages");
  assert.deepEqual(snapshot.inputIds, ["first", "correction"]); assert.deepEqual(snapshot.messages.map((m) => m.id), ["first"]);
  assert.equal(snapshot.complete, false); assert.equal(snapshot.partial, true);
});
test("owner observation marks a changing admission state incomplete", async () => {
  const routes = { children: "/sessions?parentID={sessionID}", permissionList: "/session/{sessionID}/permission",
    formList: "/session/{sessionID}/form", messages: "/session/{sessionID}/message", active: "/active" };
  let release, entered;
  const blocked = new Promise((resolve) => { release = resolve; });
  const reached = new Promise((resolve) => { entered = resolve; });
  const client = { call: async (_method, route) => {
    if (route.startsWith("/sessions?")) { entered(); await blocked; return { data: [] }; }
    if (route.endsWith("/permission") || route.endsWith("/form")) return [];
    if (route.startsWith("/session/ses_root/message")) return { data: [] };
    if (route === "/active") return {};
    throw new Error(route);
  } };
  const ctx = { report: "/tmp/report.json", invocationId: "inv", sessionID: "ses_root", invocationInputs: new Set(["input"]),
    admission: "admitted", startedAtMs: Date.now() - 1000, preexisting: new Set(), ownedReady: true, routes, client };
  const pending = observe(ctx, "messages"); await reached;
  ctx.admission = "pending"; release();
  const snapshot = await pending;
  assert.equal(snapshot.admission, "admitted"); assert.deepEqual(snapshot.inputIds, ["input"]); assert.equal(snapshot.complete, false);
});
test("owner reads every message page and marks descendant discovery errors incomplete", async () => {
  const routes = { children: "/sessions?parentID={sessionID}", permissionList: "/session/{sessionID}/permission",
    formList: "/session/{sessionID}/form", messages: "/session/{sessionID}/message", active: "/active" };
  const startedAtMs = Date.now() - 1000;
  const rows = [{ id: "input", type: "user", time: { created: startedAtMs + 1 } },
    ...Array.from({ length: 230 }, (_, i) => ({ id: `m${i}`, type: "assistant", time: { created: startedAtMs + 2 + i }, content: [{ type: "text", text: `text ${i}` }] }))];
  let failChildren = false;
  const client = { call: async (_method, route) => {
    if (route.startsWith("/sessions?")) { if (failChildren) throw new Error("failed"); return { data: [] }; }
    if (route.endsWith("/permission") || route.endsWith("/form")) return [];
    if (route.startsWith("/session/ses_root/message")) {
      const reversed = [...rows].reverse();
      return route.includes("cursor=") ? { data: reversed.slice(200) } : { data: reversed.slice(0, 200), cursor: { next: "next" } };
    }
    if (route === "/active") return { ses_root: { type: "running" } };
    throw new Error(route);
  } };
  const ctx = { report: "/tmp/report.json", invocationId: "inv", sessionID: "ses_root", invocationInputs: new Set(["input"]),
    admission: "admitted", startedAtMs, preexisting: new Set(), ownedReady: true, routes, client };
  assert.equal((await observe(ctx, "messages")).messages.length, 231);
  rows[1].content[0].text = "changed";
  assert.equal((await observe(ctx, "messages")).messages[1].content[0].text, "changed");
  failChildren = true;
  const incomplete = await observe(ctx, "messages");
  assert.equal(incomplete.serverStatus, "unknown"); assert.equal(incomplete.complete, false);
});
test("terminal observation uses only the report's matching transcript and reports a missing one", async () => {
  const dir = tempDir("entrust-live-terminal-"), report = path.join(dir, "report.json"), transcript = path.join(dir, "report.transcript.json");
  const record = { adapter: "opencode", invocationId: "inv", sessionID: "root", turnIds: ["input"],
    exitCode: 0, partial: false, transcriptPath: transcript, receiptOk: true };
  fs.writeFileSync(report, JSON.stringify(record));
  assert.equal((await readObservation(report, "messages")).source, "unavailable");
  const missing = await invoke([OBSERVE, "--report-file", report, "--messages"]);
  assert.equal(missing.code, 1); assert.equal(JSON.parse(missing.out).source, "unavailable");
  fs.writeFileSync(transcript, JSON.stringify({ sessionID: "root", inputIds: ["input"], messages: [
    { id: "old", type: "user", _sessionID: "root", time: { created: 1 } },
    { id: "old-answer", type: "assistant", _sessionID: "root", time: { created: 2 } },
    { id: "input", type: "user", _sessionID: "root", time: { created: 2 } },
    { id: "answer", type: "assistant", _sessionID: "root", time: { created: 3 } },
    { id: "foreign-input", type: "user", _sessionID: "root", time: { created: 4 } },
    { id: "foreign-answer", type: "assistant", _sessionID: "root", time: { created: 5 } },
  ] }));
  const view = await readObservation(report, "messages");
  assert.equal(view.source, "transcript"); assert.equal(view.state, "terminal");
  assert.deepEqual(view.messages.map((m) => m.id), ["input", "answer"]);
  const invalid = await invoke([OBSERVE, "--report-file", report, "--messages", "--cursor", "garbage"]);
  assert.equal(invalid.code, 1); assert.equal(JSON.parse(invalid.out).state, "unavailable");
  record.sessionID = "other"; fs.writeFileSync(report, JSON.stringify(record));
  assert.equal((await readObservation(report, "messages")).source, "unavailable");
});
test("terminal duplicate message identity is unavailable and exits nonzero without content", async () => {
  const dir = tempDir("entrust-terminal-duplicate-"), report = path.join(dir, "report.json"), transcript = path.join(dir, "report.transcript.json");
  const sessionID = "ses_root", invocationId = "inv_duplicate";
  const large = { id: "big", type: "assistant", _sessionID: sessionID, text: `SYNTHETIC_PRIVATE_${"🐈".repeat(180000)}` };
  const messages = [{ id: "input", type: "user", _sessionID: sessionID }, large,
    { id: "after", type: "assistant", _sessionID: sessionID }, { ...large }];
  fs.writeFileSync(transcript, JSON.stringify({ sessionID, inputIds: ["input"], messages }));
  fs.writeFileSync(report, JSON.stringify({ adapter: "opencode", sessionID, turnIds: ["input"], invocationId, exitCode: 0, partial: false, transcriptPath: transcript }));
  const initial = await invoke([OBSERVE, "--report-file", report, "--messages", "--large"]);
  assert.equal(initial.code, 0, initial.err); assert.equal(JSON.parse(initial.out).source, "transcript");
  const cursor = Buffer.from(JSON.stringify({ report, invocationId, offset: 1 })).toString("base64url");
  const invalid = await invoke([OBSERVE, "--report-file", report, "--messages", "--large", "--cursor", cursor]);
  assert.equal(invalid.code, 1); assert.equal(JSON.parse(invalid.out).source, "unavailable");
  assert.equal(invalid.out.includes("SYNTHETIC_PRIVATE_"), false);
});
const DRIVER = path.join(ROOT, "skills/opencode/scripts/driver.mjs");
// `beside` is an earlier report: this run writes report-2.json into its directory, under the same state.
async function driverRun(server, { allowNoCommands = true, timeout = 9, idle = 4, approvalDelayMs = 0, headers = "", approval = null, resume = null, cancel = false, cancelWhenPending = false, pendingCount = 1, cancelOn = null, rights = `read ${cwd}`, defaultModel = "router/deepseek/flash", answer = '{"answers":[["Read"]]}', localUrl = server.url, beside = null, more = {}, state: given = null } = {}) {
  const state = beside ? path.dirname(path.dirname(beside)) : given ?? tempDir("entrust-opencode-driver-");
  const dir = beside ? path.dirname(beside) : path.join(state, "invocation"); if (!beside) fs.mkdirSync(dir);
  const input = path.join(dir, "prompt.txt"), report = path.join(dir, beside ? "report-2.json" : "report.json"), box = path.join(dir, "approvals");
  fs.writeFileSync(input, prompt(`${allowNoCommands ? "ALLOW_NO_COMMANDS: yes\n" : ""}${resume ? `RESUME: ${resume}\n` : ""}${headers}`, rights));
  // The driver starts its own server; the fake CLI on PATH announces the fake one.
  const cli = fakeCli(localUrl, state);
  const env = { ENTRUST_STATE_DIR: state, ...cli.env, ...more };
  server.defaultModel = defaultModel;
  const p = spawnNode([DRIVER, "--prompt-file", input, "--report-file", report, ...(timeout === null ? [] : ["--timeout", String(timeout)]), ...(idle === null ? [] : ["--idle-timeout", String(idle)]),
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
              approval === "answer" ? answer : approval === "decline" ? "" : q.presented + "\n");
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
test("advertised variants are passed to OpenCode without claiming provider-confirmed effort", async () => {
  const s = await fakeOpenCode();
  try {
    s.extraVariants = ["max", "ultra"];
    for (const [headers, variant] of [["", null], ["VARIANT: high\n", "high"], ["VARIANT: max\n", "max"], ["VARIANT: ultra\n", "ultra"]]) {
      const r = await driverRun(s, { headers });
      assert.equal(r.code, 0, r.err); assert.equal(r.report.variant, variant);
      assert.equal(r.report.confirmedEffort, null); assert.equal(r.report.effortCompliance, "unknown");
      assert.equal(s.sessions.get(r.report.sessionID).model.variant ?? null, variant);
    }
    assert.equal(s.prompts, 4);
  } finally { await s.close(); }
});
test("live observer reads pending POST and callback from the owner and falls back to its final transcript", async () => {
  const s = await fakeOpenCode("live-admission"), state = tempDir("entrust-live-admission-"), dir = path.join(state, "invocation");
  fs.mkdirSync(dir);
  const input = path.join(dir, "prompt.txt"), report = path.join(dir, "report.json"), box = path.join(dir, "approvals");
  fs.writeFileSync(input, prompt("ALLOW_NO_COMMANDS: yes\n"));
  const cli = fakeCli(s.url, state); s.defaultModel = "router/deepseek/flash";
  const run = spawnNode([DRIVER, "--prompt-file", input, "--report-file", report, "--approval-dir", box, "--idle-timeout", "4"],
    { env: { ...cli.env, ENTRUST_STATE_DIR: state }, killAfterMs: 15000 });
  try {
    const end = Date.now() + 8000;
    while (!s.releaseAdmission && Date.now() < end && run.child.exitCode === null) await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(typeof s.releaseAdmission, "function", run.stderrSoFar());
    const status = await readObservation(report);
    assert.equal(status.state, "live"); assert.equal(status.admission, "pending"); assert.equal(status.serverStatus, "busy");
    assert.deepEqual(status.callbacks, { permissions: 1, questions: 0 });
    assert.equal(JSON.stringify(status).includes("node check.mjs"), false);
    const live = await readObservation(report, "messages");
    assert.equal(live.sessionID, status.sessionID); assert.deepEqual(live.inputIds, status.inputIds);
    assert.ok(live.messages.some((m) => m.content?.some((p) => p.text === "Привет во время POST")));
    s.releaseAdmission();
    while ((!fs.existsSync(box) || !fs.readdirSync(box).some((name) => name.endsWith(".request.json"))) && Date.now() < end && run.child.exitCode === null)
      await new Promise((resolve) => setTimeout(resolve, 30));
    const requestFile = fs.readdirSync(box).find((name) => name.endsWith(".request.json"));
    const q = JSON.parse(fs.readFileSync(path.join(box, requestFile)));
    const decision = await invoke([ENTRY, "--dir", dir, "--report-file", report, "--decide", q.id, "--accept"], q.presented + "\n");
    assert.equal(decision.code, 0, decision.out + decision.err);
    const result = await run.done; assert.equal(result.code, 0, result.err);
    const terminal = await readObservation(report, "messages");
    assert.equal(terminal.state, "terminal"); assert.equal(terminal.source, "transcript");
    assert.equal(terminal.invocationId, status.invocationId); assert.deepEqual(terminal.inputIds, status.inputIds);
    assert.ok(terminal.messages.some((m) => m.content?.some((p) => p.text === "Привет во время POST")));
    assert.equal(s.mutations.filter((m) => m.id === q.payload.id).length, 1);
  } finally { s.releaseAdmission?.(); if (run.child.exitCode === null) run.child.kill("SIGKILL"); await run.done; await s.close(); }
});
test("live RESUME observer names the new input and excludes the earlier turn", async () => {
  const s = await fakeOpenCode("slow"); s.slowMs = 100;
  try {
    const first = await driverRun(s, { headers: "VARIANT: high\n" }); assert.equal(first.code, 0, first.err);
    s.slowMs = 2400;
    const state = path.dirname(path.dirname(first.path)), dir = path.dirname(first.path), report = path.join(dir, "live-resume.json");
    const input = path.join(dir, "resume-input.txt");
    fs.writeFileSync(input, prompt(`ALLOW_NO_COMMANDS: yes\nRESUME: ${first.path}\n`));
    const cli = fakeCli(s.url, state);
    const run = spawnNode([DRIVER, "--prompt-file", input, "--report-file", report, "--idle-timeout", "4"],
      { env: { ...cli.env, ENTRUST_STATE_DIR: state, ENTRUST_PLAN_MODEL: "router/deepseek/flash" }, killAfterMs: 12000 });
    try {
      const end = Date.now() + 7000;
      while (s.prompts < 2 && Date.now() < end && run.child.exitCode === null) await new Promise((resolve) => setTimeout(resolve, 20));
      assert.equal(s.prompts, 2, run.stderrSoFar());
      const live = await readObservation(report, "messages");
      assert.equal(live.state, "live"); assert.equal(live.sessionID, first.report.sessionID);
      assert.equal(live.inputIds.length, 1); assert.notEqual(live.inputIds[0], first.report.turnId);
      assert.equal(live.messages.some((m) => m.id === first.report.turnId || m.id === "msg_answer_1"), false);
      const result = await run.done; assert.equal(result.code, 0, result.err);
      const terminal = JSON.parse(fs.readFileSync(report));
      assert.equal(terminal.variant, "high"); assert.equal(terminal.sessionID, first.report.sessionID);
    } finally { if (run.child.exitCode === null) run.child.kill("SIGKILL"); await run.done; }
  } finally { await s.close(); }
});
test("repeated live observation does not renew the lost relay lease", async () => {
  const s = await fakeOpenCode("slow"); s.slowMs = 15000;
  const state = tempDir("entrust-observer-lease-"), report = path.join(state, "run", "report.json"), dir = path.join(state, "run", "agent");
  const cli = fakeCli(s.url, state), env = { ...cli.env, ENTRUST_STATE_DIR: state, AGENT_RUN_RETURN_MS: "900", AGENT_RUN_LEASE_MS: "2500" };
  s.defaultModel = "router/deepseek/flash";
  try {
    const made = await invoke([ENTRY, "--new", "--report-file", report], prompt("ALLOW_NO_COMMANDS: yes\n"), env);
    assert.equal(made.code, 0, made.out + made.err);
    const run = await invoke([ENTRY, "--run", "--report-file", report], "", env);
    assert.equal(run.code, 0, run.out + run.err); assert.match(run.out, /^DRIVER_EXIT=running$/m);
    let observations = 0; const end = Date.now() + 12000;
    while (!fs.existsSync(path.join(dir, "exit")) && Date.now() < end) {
      if ((await readObservation(report)).state === "live") observations++;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    assert.ok(observations > 0, "no live owner observation was obtained");
    assert.equal(fs.existsSync(path.join(dir, "exit")), true, "observer extended the lease or cleanup did not complete");
    const cancel = JSON.parse(fs.readFileSync(path.join(dir, "cancel.json")));
    const result = JSON.parse(fs.readFileSync(report));
    assert.equal(cancel.kind, "relay-lost"); assert.equal(result.turnStatus, "aborted");
    assert.equal(result.serverCleanup.process, "exited"); assert.equal(fs.existsSync(cli.stopFile), true);
  } finally {
    if (!fs.existsSync(path.join(dir, "exit"))) await invoke([ENTRY, "--stop", "--report-file", report], "", env);
    await s.close();
  }
});
test("a server that exits before it serves reports its exit code without its output", async () => {
  const bin = path.join(tempDir("entrust-opencode-dying-"), "bin"); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, "opencode"), `#!/usr/bin/env node\nconsole.error("Error: EPERM: operation not permitted, open '/home/x/.local/share/opencode/log'");\nprocess.exit(3);\n`, { mode: 0o755 });
  await assert.rejects(startLocalServer({ env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}` } }),
    /exited with code 3 before announcing its local URL; its output is withheld/);
});
test("the private server's password is its own, never one the caller's environment holds", async () => {
  const s = await fakeOpenCode(), dir = tempDir("entrust-opencode-password-"), seen = path.join(dir, "password");
  const bin = path.join(dir, "bin"); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, "opencode"), `#!/usr/bin/env node\nrequire("node:fs").writeFileSync(${JSON.stringify(seen)}, process.env.OPENCODE_SERVER_PASSWORD);\nconsole.log("server listening on ${s.url}");\nsetInterval(()=>{},1000);\n`, { mode: 0o755 });
  const server = await startLocalServer({ env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`, OPENCODE_SERVER_PASSWORD: "shared-secret" } });
  try {
    assert.notEqual(server.config.password, "shared-secret");
    assert.equal(fs.readFileSync(seen, "utf8"), server.config.password);
  } finally { await server.close(); await s.close(); }
});
test("a default run starts and stops its private loopback server", async () => {
  const s = await fakeOpenCode();
  try {
    const r = await driverRun(s);
    assert.equal(r.code, 0, r.err); assert.equal(r.report.serverMode, "local");
    assert.deepEqual(r.report.serverCleanup, { process: "exited", owner: "exited", listener: "unknown" });
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
test("MODEL: inherit takes the configuration's `model` and pins it at session create, checked against the run's directory, with no provider list and no event stream", async () => {
  const s = await fakeOpenCode();
  try {
    const r = await driverRun(s); assert.equal(r.code, 0, r.err); assert.equal(r.report.receiptOk, true);
    assert.equal(r.report.model, "router/deepseek/flash"); assert.equal(r.report.variant, null);
    const create = s.calls.find((c) => c.method === "POST" && c.path === "/api/session");
    assert.deepEqual(create.body.model, { id: "deepseek/flash", providerID: "router" });
    assert.deepEqual(s.calls.filter((c) => c.path === "/api/model").map((c) => c.query), [`?location[directory]=${encodeURIComponent(cwd)}`]);
    assert.equal(s.calls.some((c) => ["/api/provider", "/api/event"].includes(c.path)), false);
    assert.equal(s.calls.some((c) => !c.path.startsWith("/api/") && c.path !== "/openapi.json" && c.path !== "/api/info"), false);
  } finally { await s.close(); }
});
test("MODEL: inherit with no `model` in the configuration is refused before any session; a catalogue alias runs by its own id", async () => {
  const s = await fakeOpenCode();
  try {
    const none = await driverRun(s, { defaultModel: null });
    assert.equal(none.code, 2, none.err); assert.match(none.err, /MODEL: inherit takes the OpenCode configuration's `model`, and none is set/);
    assert.equal(s.calls.some((c) => c.method === "POST" && c.path === "/api/session"), false);
    const alias = await driverRun(s, { headers: "MODEL: router/glm/flash-fast\n" });
    assert.equal(alias.code, 0, alias.err); assert.equal(alias.report.model, "router/glm/flash-fast");
    assert.deepEqual(s.calls.find((c) => c.method === "POST" && c.path === "/api/session").body.model, { id: "glm/flash-fast", providerID: "router" });
  } finally { await s.close(); }
});
test("missing required V2 route refuses before creating a session or submitting input", async () => {
  const s = await fakeOpenCode("missing-route");
  try { const r = await driverRun(s); assert.equal(r.code, 2, r.err); assert.equal(s.prompts, 0);
    assert.equal(s.calls.some((c) => c.path === "/api/session" && c.method === "POST"), false); }
  finally { await s.close(); }
});
test("native permission reaches mailbox, receives once, and foreign request remains untouched", async () => {
  const s = await fakeOpenCode("permission");
  try {
    const r = await driverRun(s, { approval: "accept" }); assert.equal(r.code, 0, r.err);
    assert.deepEqual(s.mutations.map((m) => m.body), [{ decision: "once" }]);
    assert.equal(s.replies.some((q) => q.id === "per_foreign"), true);
  } finally { await s.close(); }
});
test("a descendant session's permission, which only its own session lists, is answered there", async () => {
  const s = await fakeOpenCode("child-permission");
  try {
    const r = await driverRun(s, { approval: "accept" }); assert.equal(r.code, 0, r.err);
    assert.deepEqual(s.mutations, [{ id: "per_child_1", body: { decision: "once" }, sessionID: "ses_child_1" }]);
  } finally { await s.close(); }
});
test("a subagent past the first page of children is found, and its permission answered on its own session", async () => {
  const s = await fakeOpenCode("many-children");
  try {
    const r = await driverRun(s, { approval: "accept" }); assert.equal(r.code, 0, r.err);
    assert.deepEqual(s.mutations, [{ id: "per_kid_51", body: { decision: "once" }, sessionID: "ses_kid_51" }]);
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
    assert.equal(JSON.parse(q.presented).resources[0], s.editTarget);
    assert.deepEqual(s.mutations.map((m) => m.body?.decision).filter(Boolean), ["once"]);
  } finally { await s.close(); }
  const g = await fakeOpenCode("edit-outside");
  try {
    const state = tempDir("entrust-opencode-driver-");
    g.editTarget = path.join(state, "invocation", "approvals", "1-00000000.decision.json");
    const r = await driverRun(g, { state, approval: "hold", rights: `write ${cwd}`, timeout: 4 });
    assert.deepEqual(g.mutations.map((m) => m.body?.decision).filter(Boolean), ["reject"], r.err);
    const q = JSON.parse(fs.readFileSync(path.join(r.box, fs.readdirSync(r.box).find((n) => n.endsWith(".request.json"))), "utf8"));
    assert.equal(q.settled.by, "driver"); assert.match(q.settled.why, /inside the state directory/);
  } finally { await g.close(); }
});
test("a refused permission is rejected with a message, so the turn goes on and answers; a Stop's reject carries none", async () => {
  const s = await fakeOpenCode("permission");
  try {
    const r = await driverRun(s);
    const reject = s.mutations.find((m) => m.body?.decision === "reject");
    assert.ok(reject, JSON.stringify(s.mutations));
    assert.match(reject.body.message ?? "", /^no approval directory: unattended run\. Do not try to get around it: record it/, r.err);
  } finally { await s.close(); }
  const c = await fakeOpenCode("permission");
  try {
    await driverRun(c, { cancel: true, cancelWhenPending: true, approval: "hold" });
    const stopped = c.mutations.filter((m) => m.body?.decision === "reject");
    assert.ok(stopped.length >= 1, JSON.stringify(c.mutations));
    assert.equal(stopped.some((m) => "message" in m.body), false, JSON.stringify(stopped));
  } finally { await c.close(); }
});
test("an accept the mailbox cannot record is never answered once", async () => {
  const s = await fakeOpenCode("permission");
  try {
    await driverRun(s, { approval: "unrecordable" });
    assert.equal(s.mutations.some((m) => m.body?.decision === "once"), false, JSON.stringify(s.mutations));
    assert.equal(s.mutations.some((m) => m.body?.decision === "reject"), true, JSON.stringify(s.mutations));
  } finally { await s.close(); }
});
test("a stale decision file does not hold a request past its deadline", async () => {
  const s = await fakeOpenCode("permission");
  try {
    const r = await driverRun(s, { approval: "stale", more: { ENTRUST_APPROVAL_TIMEOUT_S: "1" } });
    const name = fs.readdirSync(r.box).find((n) => n.endsWith(".request.json"));
    const q = JSON.parse(fs.readFileSync(path.join(r.box, name), "utf8"));
    assert.equal(q.settled?.decision, "expired", r.err); assert.equal(q.settled.by, "driver");
    assert.equal(s.mutations.some((m) => m.body?.decision === "once"), false, JSON.stringify(s.mutations));
    assert.equal(fs.existsSync(path.join(r.box, "pending")), false);
  } finally { await s.close(); }
});
test("every prompt states the run's rights, the shell's unprompted scope, and not to work around a refusal", async () => {
  const s = await fakeOpenCode("normal");
  try {
    const bare = await driverRun(s, { rights: `read ${cwd}` }); assert.equal(bare.code, 0, bare.err);
    const first = s.calls.filter((c) => c.path.endsWith("/prompt")).at(-1).body.text;
    assert.match(first, /^You run for a coordinating agent, unattended/);
    assert.match(first, /RIGHTS does not limit reads\. Your edit and write tools are refused/);
    assert.match(first, /The shell tool is allowed without approval and bypasses these file and network limits/);
    assert.match(first, /it can write any file the process can access and access the network/);
    assert.match(first, /The native fetch tool needs approval; shell network commands are not checked/);
    assert.match(first, /Nothing beyond your rights can be granted in this run/);
    assert.match(first, /do not try to get around it with another tool or command/);
    const boxed = await driverRun(s, { rights: `write ${cwd}`, approval: "hold" }); assert.equal(boxed.code, 0, boxed.err);
    const second = s.calls.filter((c) => c.path.endsWith("/prompt")).at(-1).body.text;
    assert.match(second, /RIGHTS does not limit reads\. Edits inside .* need no approval; edits elsewhere need approval/);
    assert.match(second, /The shell tool is allowed without approval and bypasses these root, protected path and network limits/);
    assert.match(second, /including \.git and OpenCode configuration paths/);
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
    s.sessions.get(first.report.threadId).permissions.push({ action: "shell", resource: "*", effect: "allow" });
    const prompts = s.prompts;
    const again = await driverRun(s, { resume: first.path, beside: first.path, rights: `write ${cwd}` });
    assert.equal(again.code, 4, again.err); assert.match(again.report.error, /holds permission rules other than/);
    assert.equal(s.prompts, prompts);
  } finally { await s.close(); }
});
test("a legacy continuation retains its original skill permission rules", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s); assert.equal(first.code, 0, first.err);
    const session = s.sessions.get(first.report.sessionID);
    session.permissions = session.permissions.filter((rule) => rule.action !== "skill");
    const again = await driverRun(s, { resume: first.path });
    assert.equal(again.code, 0, again.err); assert.match(again.err, /retains legacy skill permissions/);
    assert.equal(session.permissions.some((rule) => rule.action === "skill"), false);
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
test("EXPECT distinguishes proven matches, mismatches and unknown output", () => {
  const check = (regex, successful) => expectation({ expect: new RegExp(regex), successful });
  const cmd = (output, outputTruncated) => ({ output, outputTruncated });
  for (const flag of [true, null, undefined]) assert.match(check("hit", [cmd("hit", flag)]).why, /unknown/);
  assert.match(check("full output saved to", [cmd("full output saved to /PRIVATE_PATH", true)]).why, /unknown/);
  assert.equal(check("hit", [cmd("hit", false)]).ok, true);
  assert.equal(check("^$", [cmd("", false)]).ok, true);
  assert.match(check("hit", [cmd("miss", false)]).why, /no successful/);
  assert.match(check("hit", [cmd(null, false)]).why, /unknown/);
  assert.match(check("^$", [cmd("(no output)", false)]).why, /unknown/);
  assert.match(check("no output", [cmd("(no output)", false)]).why, /unknown/);
  assert.equal(check("^", [cmd("(no output)", false)]).ok, true);
  assert.match(check("hit", [cmd("(no output)", false)]).why, /no successful/);
  assert.equal(check("no output", [cmd("(no output)\n", false)]).ok, true);
  assert.equal(check("hit", [cmd("hit", true), cmd("hit", false)]).ok, true);
  assert.equal(check("hit", [cmd("hit", false), cmd("hit", true)]).ok, true);
  assert.match(check("hit", [cmd("miss", false), cmd("hit", null)]).why, /unknown/);
  assert.match(check("hit", []).why, /no successful/);
  assert.equal(expectation({ successful: [cmd("hit", null)] }).ok, true);
});
test("EXPECT unknown exits 5, reports native truncation and preserves higher priority errors", async () => {
  const parts = [true, false, "false", null].map((truncated, i) => ({ type: "tool", id: `call_${i}`, name: "shell",
    state: { status: "completed", input: { command: `cmd ${i}` }, content: [{ type: "text", text: "hit" }], metadata: { exit: 0, truncated } } }));
  for (const [mode, code] of [["normal", 5], ["provider-error-marker", 1]]) {
    const s = await fakeOpenCode(mode); s.toolParts = [parts[0], parts[2], parts[3]];
    try {
      const r = await driverRun(s, { headers: "EXPECT: hit\n" });
      assert.equal(r.code, code, r.err);
      assert.deepEqual(r.report.tools.map((t) => t.outputTruncated), [true, null, null]);
      assert.deepEqual(r.report.commands.map((c) => c.outputTruncated), [true, null, null]);
      const transcript = JSON.parse(fs.readFileSync(r.report.transcriptPath, "utf8"));
      assert.equal(transcript.messages.find((m) => m.type === "assistant").content[1].state.metadata.truncated, "false");
      if (mode === "normal") assert.match(r.report.error, /unknown/);
    } finally { await s.close(); }
  }
  const s = await fakeOpenCode(); s.toolParts = parts;
  try { const r = await driverRun(s, { headers: "EXPECT: hit\n" }); assert.equal(r.code, 0, r.err);
    assert.deepEqual(r.report.commands.map((c) => c.outputTruncated), [true, false, null, null]); }
  finally { await s.close(); }
  const mismatch = await fakeOpenCode(); mismatch.toolParts = [parts[1]];
  try { const r = await driverRun(mismatch, { headers: "EXPECT: absent\n" });
    assert.equal(r.code, 5, r.err); assert.match(r.report.error, /no successful/); }
  finally { await mismatch.close(); }
  const missing = await fakeOpenCode(); missing.toolParts = [
    { type: "tool", id: "missing_metadata", name: "shell", state: { status: "completed", content: [{ type: "text", text: "hit" }] } },
    { type: "tool", id: "missing_output", name: "shell", state: { status: "completed", metadata: { exit: 0, truncated: false } } },
    { type: "tool", id: "invalid_output", name: "shell", state: { status: "completed", content: [{ type: "text", text: null }], metadata: { exit: 0, truncated: false } } },
    { type: "tool", id: "missing_text", name: "shell", state: { status: "completed", content: [{ type: "text" }], metadata: { exit: 0, truncated: false } } },
    { type: "tool", id: "failed", name: "shell", state: { status: "completed", content: [{ type: "text", text: "hit" }], metadata: { exit: 1, truncated: false } } },
  ];
  try { const r = await driverRun(missing, { headers: "EXPECT: hit\n" });
    assert.equal(r.code, 5, r.err); assert.match(r.report.error, /unknown/);
    assert.deepEqual(r.report.commands.map((c) => c.outputTruncated), [null, false, false, false, false]);
    assert.equal(r.report.commands[1].output, null);
    assert.equal(r.report.commands[2].output, null);
    assert.equal(r.report.commands[3].output, null);
    const invalid = await driverRun(missing, { headers: "EXPECT: ^$\n" });
    assert.equal(invalid.code, 5, invalid.err); assert.match(invalid.report.error, /unknown/);
    const noExpect = await driverRun(missing); assert.equal(noExpect.code, 0, noExpect.err);
  } finally { await missing.close(); }
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
test("no wall clock unless declared: busy work outlives a declared one's span, 0 and the default run on, and a declared one aborts only this run's session", async () => {
  const s = await fakeOpenCode("slow"); s.slowMs = 3500;
  try {
    for (const timeout of [null, 0]) {
      const r = await driverRun(s, { timeout }); assert.equal(r.code, 0, `timeout ${timeout}: ${r.err}`);
      assert.ok(r.ms >= 3000, `the run lasted ${r.ms} ms, not the 3.5 s the work took`); assert.equal(r.report.partial, false);
    }
    assert.deepEqual(s.aborts, [], "nothing was aborted");
    const cut = await driverRun(s, { timeout: 2 });
    assert.equal(cut.code, 3, cut.err); assert.match(cut.report.error, /wall timeout/); assert.equal(cut.report.partial, true); assert.equal(cut.report.receiptOk, false);
    assert.deepEqual(cut.report.limits, { timeoutS: 2, idleTimeoutS: 4, maxCommands: 1000 });
    assert.equal(s.aborts.length, 1); assert.ok(s.aborts[0].startsWith("ses_owned_"), "only this run's own session is aborted"); assert.ok(!s.aborts.includes("ses_foreign"));
  } finally { await s.close(); }
});
test("silence is cut when the server reports nothing busy, --idle-timeout 0 disables it, and the default stays 600 s", async () => {
  const s = await fakeOpenCode("silent");
  try {
    const idle = await driverRun(s, { timeout: null, idle: 2 });
    assert.equal(idle.code, 3, idle.err); assert.match(idle.report.error, /idle timeout/); assert.equal(idle.report.partial, true);
    assert.ok(idle.ms < 8000, `cut after ${idle.ms} ms`);
    // With silence off, only the declared wall clock can end the same run, and it does so later than the idle bound would have.
    const off = await driverRun(s, { timeout: 4, idle: 0 });
    assert.equal(off.code, 3, off.err); assert.match(off.report.error, /wall timeout/); assert.deepEqual(off.report.limits, { timeoutS: 4, idleTimeoutS: 0, maxCommands: 1000 });
    assert.ok(off.ms >= 3500, `the idle-off run lasted ${off.ms} ms`);
    const dflt = await driverRun(s, { timeout: 2, idle: null });
    assert.match(dflt.report.error, /wall timeout/); assert.equal(dflt.report.limits.idleTimeoutS, 600);
  } finally { await s.close(); }
});
test("a Stop of a session with nothing running is a definite stop: the cut is observed idle and can continue", async () => {
  const s = await fakeOpenCode("silent");
  try {
    const first = await driverRun(s, { timeout: null, idle: 2 });
    assert.equal(first.code, 3, first.err); assert.equal(first.report.cancellation.observed, "idle");
    assert.deepEqual(first.report.cancellation.abort.map((a) => a.accepted), [{ interrupted: false }]);
    const second = await driverRun(s, { resume: first.path, timeout: null, idle: 2 });
    assert.equal(second.code, 3, second.err); assert.equal(s.prompts, 2);
  } finally { await s.close(); }
});
test("a request waiting longer than the idle bound is not silence: the wait ends at the settlement, silence starts in full from it, and the wall clock counts only the work", async () => {
  // 3 s of waiting against a 2 s idle bound, a slow native lookup while it waits and a slow native acknowledgement after
  // the decision, then 1.2 s of quiet work. Silence counted from the last poll before the answer would cut at once.
  for (const [mode, approval] of [["permission-slow", "accept"], ["permission-slow", "decline"], ["question-slow", "answer"]]) {
    const s = await fakeOpenCode(mode); s.slowMs = 1200; s.listDelayMs = 1500; s.replyDelayMs = 600;
    try {
      const r = await driverRun(s, { approval, timeout: null, idle: 2, approvalDelayMs: 3000 });
      // A decline ends the run with the approval exit by design; what matters is that no clock cut it.
      assert.equal(r.code, approval === "decline" ? 6 : 0, `${mode}/${approval}: ${r.err}`); assert.doesNotMatch(r.report.error ?? "", /timeout/); assert.equal(s.mutations.length, 1);
      assert.ok(r.ms >= 4000, `the run lasted ${r.ms} ms`);
      assert.deepEqual(r.report.limits, { timeoutS: 0, idleTimeoutS: 2, maxCommands: 1000 });
    } finally { await s.close(); }
  }
  // A declared 4 s wall clock and a coordinator who answers after 6 s: the wait alone is longer than the budget, the work
  // around it is short, so only a clock that stands still through the wait lets this run finish. The native answer was applied.
  const w = await fakeOpenCode("permission-slow"); w.slowMs = 300; w.replyDelayMs = 200;
  try {
    const wall = await driverRun(w, { approval: "accept", timeout: 4, idle: 0, approvalDelayMs: 6000 });
    assert.equal(wall.code, 0, `a declared 4 s wall clock stands still through a 6 s wait: ${wall.err}`); assert.equal(wall.report.partial, false);
    assert.equal(w.mutations.length, 1); assert.equal(w.mutations[0].body.decision, "once");
    assert.ok(wall.ms > 5500, `elapsed ${wall.ms} ms is strictly more than the 4 s budget by the wait`);
  } finally { await w.close(); }
  // And work after the answer is still bounded: the same wait, then a hang longer than the declared budget. The answer is applied
  // before the cut, and the cut comes after the budget's worth of work, not at the end of the wait.
  const h = await fakeOpenCode("permission-slow"); h.slowMs = 8000;
  try {
    const cut = await driverRun(h, { approval: "accept", timeout: 3, idle: 0, approvalDelayMs: 3000 });
    assert.equal(cut.code, 3, cut.err); assert.match(cut.report.error, /wall timeout/); assert.equal(h.mutations.length, 1); assert.equal(h.mutations[0].body.decision, "once");
    assert.ok(cut.ms >= 5000, `cut after ${cut.ms} ms: the 3 s wait is excluded and the work after it counts`);
  } finally { await h.close(); }
});
test("the native reply to a known decision is work for every outcome: accept and decline cut a declared wall clock alike", async () => {
  // 1 s of waiting, then 3 s of native acknowledgement against a 2 s wall clock: the 1 s is excluded, the 3 s counts.
  for (const approval of ["accept", "decline"]) {
    const s = await fakeOpenCode("permission-slow"); s.slowMs = 100; s.replyDelayMs = 3000;
    try {
      const r = await driverRun(s, { approval, timeout: 2, idle: 0, approvalDelayMs: 1000 });
      assert.equal(r.code, 3, `${approval}: ${r.err}`); assert.match(r.report.error, /wall timeout/, approval);
    } finally { await s.close(); }
  }
});
test("a rejected group decides its siblings only when this run owns every member; a refused group leaves them waiting", async () => {
  const mk = (id) => { const payload = { id, sessionID: "ses_a", action: "bash" }; return { id, type: "opencode.permission", payload, requestHash: digest(payload), settled: null, decidedAt: null }; };
  const run = async (extraNative) => {
    const [q1, q2] = [mk("per_1"), mk("per_2")], posts = [];
    const native = [q1.payload, q2.payload, ...extraNative];
    const ctx = { requests: new Map([[q1.id, q1], [q2.id, q2]]), waitedMs: 0, waitingSince: null, lastProgressMs: 1, invocationSessions: new Set(["ses_a"]), box: null,
      routes: { permissionList: "/api/session/{sessionID}/permission", formList: "/api/session/{sessionID}/form", permissionReply: "/api/session/{sessionID}/permission/{requestID}/reply" }, declined: 0, expired: 0, autoDeclined: 0,
      client: { call: async (method, route, body) => { if (method === "GET") return native; posts.push({ route, body }); return null; } } };
    noteWait(ctx);
    await new Promise((resolve) => setTimeout(resolve, 50));
    await rejectTrackedRequest(ctx, q1, { decision: "declined", by: "coordinator", why: null }, "declined");
    return { ctx, q1, q2, posts };
  };
  const owned = await run([]);
  assert.equal(owned.posts.length, 1); assert.ok(owned.q1.settled && owned.q2.settled, "both members of a wholly owned group are settled");
  assert.equal(owned.ctx.waitingSince, null); assert.ok(owned.ctx.waitedMs >= 45);
  const mixed = await run([{ id: "per_unknown", sessionID: "ses_a", permission: "bash" }]);
  assert.equal(mixed.posts.length, 0, "nothing is sent for a group with a member this run does not own");
  assert.ok(mixed.q1.settled && !mixed.q2.settled && mixed.q2.decidedAt == null, "the untouched sibling is still undecided");
  assert.notEqual(mixed.ctx.waitingSince, null, "and still waiting for the coordinator, so no clock runs through its wait");
});
test("waiting is accounted at the open and settle transitions: the last of several requests ends it, whatever the outcome", async () => {
  const q = (id, settled = null) => ({ id, settled });
  const ctx = { requests: new Map(), waitedMs: 0, waitingSince: null, lastProgressMs: 1 };
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [a, b, c] = [q("a"), q("b"), q("c")];
  ctx.requests.set("a", a); noteWait(ctx); const since = ctx.waitingSince; assert.notEqual(since, null);
  await sleep(80); ctx.requests.set("b", b); noteWait(ctx); assert.equal(ctx.waitingSince, since, "a second request does not restart the span");
  await sleep(80); a.settled = { decision: "accepted" }; noteWait(ctx);
  assert.equal(ctx.waitingSince, since, "one of two settled: still waiting"); assert.equal(ctx.lastProgressMs, 1, "silence is not restarted yet");
  await sleep(80); b.settled = { decision: "expired", outcome: "unknown" }; noteWait(ctx);
  assert.equal(ctx.waitingSince, null); assert.ok(ctx.waitedMs >= 230, `waited ${ctx.waitedMs} ms`); assert.ok(Date.now() - ctx.lastProgressMs < 50, "silence restarted at the last settlement");
  const waited = ctx.waitedMs; ctx.requests.set("c", c); noteWait(ctx); await sleep(60); c.decidedAt = Date.now(); noteWait(ctx);
  assert.ok(ctx.waitedMs >= waited + 55, "a later wait adds to the total, and ends when the decision is known"); assert.equal(ctx.waitingSince, null);
  const afterDecision = ctx.waitedMs; await sleep(60); c.settled = { decision: "declined" }; noteWait(ctx);
  assert.equal(ctx.waitedMs, afterDecision, "the native reply that follows a known decision is not waiting");
  const auto = { id: "d", settled: null, decidedAt: Date.now() }; ctx.requests.set("d", auto); noteWait(ctx);
  assert.equal(ctx.waitingSince, null, "a request the driver refuses itself never waits for anyone");
});
test("a wall-clock cut keeps the session for RESUME, and the numbers --timeout, --idle-timeout and --max-commands take are whole", async () => {
  const s = await fakeOpenCode("slow"); s.slowMs = 3500;
  try {
    const first = await driverRun(s, { timeout: 1 });
    assert.equal(first.code, 3, first.err); assert.equal(first.report.cancellation.observed, "idle");
    const again = await driverRun(s, { resume: first.path, timeout: null });
    assert.equal(again.code, 0, again.err); assert.equal(again.report.partial, false); assert.equal(again.report.sessionID, first.report.sessionID);
  } finally { await s.close(); }
  const dir = tempDir("entrust-opencode-numbers-"), file = path.join(dir, "prompt.txt"); fs.writeFileSync(file, prompt("", `read ${cwd}`));
  for (const [flag, value] of [["--timeout", "1.5"], ["--timeout", "-1"], ["--timeout", ""], ["--timeout", "1e3"], ["--timeout", "9".repeat(400)], ["--timeout", "abc"],
    ["--idle-timeout", "0.5"], ["--idle-timeout", " 5"], ["--max-commands", "2.5"], ["--max-commands", "-3"]]) {
    const r = spawnSync(process.execPath, [DRIVER, "--prompt-file", file, "--report-file", path.join(dir, "r.json"), flag, value], { encoding: "utf8", env: { ...process.env, ENTRUST_STATE_DIR: dir } });
    assert.equal(r.status, 2, `${flag} ${JSON.stringify(value)}: ${r.stderr}`); assert.match(r.stderr, new RegExp(`${flag} must be a non-negative whole number`));
  }
});
test("native question receives a structured answer through its separate route", async () => {
  const s = await fakeOpenCode("question");
  try { const r = await driverRun(s, { approval: "answer" }); assert.equal(r.code, 0, r.err); assert.deepEqual(s.mutations[0].body, { answer: { q: "read" } }); }
  finally { await s.close(); }
});
test("a question's answers take each field's own type: yes for a boolean, digits for a count, labels for their values; one the field cannot take is refused before publication", async () => {
  const s = await fakeOpenCode("question-typed");
  try {
    const r = await driverRun(s, { approval: "answer", answer: '{"answers":[["yes"],["3"],["Ex","Why"],["Read mode"]]}' });
    assert.equal(r.code, 0, r.err);
    assert.deepEqual(s.mutations[0].body, { answer: { on: true, count: 3, tags: ["x", "y"], mode: "read" } });
  } finally { await s.close(); }
  const read = (answers) => typedRequest({ type: "opencode.question", payload: { fields: [{ key: "on", type: "boolean" }, { key: "count", type: "integer" }] } })
    .readAnswer(JSON.stringify({ answers }));
  assert.deepEqual(read([["no"], ["12"]]), { answer: { answers: [["no"], ["12"]] } });
  assert.match(read([["maybe"], ["12"]]).error, /do not match/);
  assert.match(read([["yes"], ["1.5"]]).error, /do not match/);
});
test("a declined question is cancelled with the refusal and the standing instruction, as a rejected permission is", async () => {
  const s = await fakeOpenCode("question");
  try {
    const r = await driverRun(s, { approval: "decline" }); assert.equal(r.code, 6, r.err);
    assert.match(s.mutations[0].message, /^declined\. Do not try to get around it/);
  } finally { await s.close(); }
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
// A root oneOf: requests or a final answer, never both. The fake's first reply has both.
function rootOneOfSchema() {
  const file = path.join(tempDir("entrust-opencode-schema-"), "root-one-of.json");
  fs.writeFileSync(file, JSON.stringify({ type: "object", properties: { plan: { type: "string" },
    requests: { type: "array", items: { type: "object", properties: { id: { type: "string" }, action: { type: "string" }, agent_ids: { type: "array", items: { type: "string" } } } } },
    final_answer: { type: "string" } }, required: ["plan", "requests", "final_answer"], additionalProperties: false,
    oneOf: [{ properties: { requests: { minItems: 1 }, final_answer: { enum: [""] } } }, { properties: { requests: { maxItems: 0 }, final_answer: { minLength: 1 } } }] }));
  return file;
}
test("a reply outside a root oneOf is corrected by the driver before reaching the host", async () => {
  const s = await fakeOpenCode("oneof-correction");
  try {
    const schema = rootOneOfSchema();
    const r = await driverRun(s, { headers: `OUTPUT_SCHEMA: ${schema}\n` });
    assert.equal(r.code, 0, r.err);
    assert.equal(s.prompts, 2);
    assert.equal(r.report.receiptOk, true);
    assert.equal(r.report.outputSchemaOk, true);
    assert.deepEqual(r.report.answerJson, { plan: "", requests: [], final_answer: "Complete coordinator reply" });
    const submitted = s.calls.filter((c) => c.path.endsWith("/prompt"));
    assert.equal(submitted[0].path, submitted[1].path);
    assert.match(JSON.stringify(submitted[1].body), /oneOf/);
  } finally { await s.close(); }
});
test("a continuation repeats its root oneOf schema and permits a round that ran no command", async () => {
  const s = await fakeOpenCode("oneof-correction");
  try {
    const headers = `OUTPUT_SCHEMA: ${rootOneOfSchema()}\n`;
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
    const latest = s.sessions.get(r.report.sessionID).messages.at(-1).content[0].text;
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
    const latest = s.sessions.get(r.report.sessionID).messages.at(-1).content[0].text;
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
    const original = s.sessions.get(r.report.sessionID).messages.at(-1).content[0].text;
    assert.equal(fs.readFileSync(r.report.answerPath, "utf8"), original);
    assert.ok(original.startsWith("Detail before the JSON.") && original.endsWith("Detail after the JSON."));
  } finally { await s.close(); }
});
test("continuation retains session and model but excludes old command evidence", async () => {
  const s = await fakeOpenCode("old-history");
  try {
    const first = await driverRun(s, { headers: "VARIANT: high\n" }); assert.equal(first.code, 0, first.err);
    const second = await driverRun(s, { resume: first.path, defaultModel: "router/glm/flash" }); assert.equal(second.code, 0, second.err);
    assert.equal(second.report.sessionID, first.report.sessionID); assert.equal(second.report.model, first.report.model);
    assert.deepEqual(second.report.commands, []); assert.equal(second.report.usage.input, 5);
    assert.equal(second.report.variant, "high");
    assert.equal(s.calls.some((c) => c.method === "POST" && c.path.endsWith("/model")), false, "the session kept its model");
  } finally { await s.close(); }
});
test("a pinned MODEL on continuation preserves the previous variant", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s, { headers: "VARIANT: high\n" }); assert.equal(first.code, 0, first.err);
    const second = await driverRun(s, { resume: first.path, more: { ENTRUST_PLAN_MODEL: "router/deepseek/flash" } });
    assert.equal(second.code, 0, second.err); assert.equal(second.report.variant, "high");
    assert.equal(s.sessions.get(first.report.sessionID).model.variant, "high");
  } finally { await s.close(); }
});
test("a continuation reads only its own run's messages: a long earlier history is not fetched again on each poll", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s); assert.equal(first.code, 0, first.err);
    s.sessions.get(first.report.sessionID).messages.unshift(...Array.from({ length: 450 }, (_, i) =>
      ({ id: `msg_old_${i}`, type: "user", text: "old", time: { created: 1 + i } })));
    const before = s.calls.length;
    const second = await driverRun(s, { resume: first.path }); assert.equal(second.code, 0, second.err);
    const pages = s.calls.slice(before).filter((c) => c.path.endsWith("/message"));
    assert.ok(pages.length > 0); assert.equal(pages.some((c) => c.query.includes("cursor=")), false, "an earlier page was fetched");
    assert.deepEqual(JSON.parse(fs.readFileSync(second.report.transcriptPath, "utf8")).messages.map((m) => m.type), ["user", "assistant"]);
  } finally { await s.close(); }
});
test("a report an earlier release recorded as V1, which names no apiFamily, is refused on continuation, before any input", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s); assert.equal(first.code, 0, first.err);
    fs.chmodSync(first.path, 0o600);
    const { apiFamily, ...v1 } = first.report;
    fs.writeFileSync(first.path, JSON.stringify(v1));
    const before = s.prompts;
    const second = await driverRun(s, { resume: first.path });
    assert.equal(second.code, 2, second.err); assert.match(second.err, /not a V2 session, and this adapter speaks OpenCode's V2 API only/);
    assert.equal(s.prompts, before);
  } finally { await s.close(); }
});
test("a continuation whose turn wrote no reply never reports the earlier turn's answer as its own", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s); assert.equal(first.code, 0, first.err);
    s.silent = true;
    const second = await driverRun(s, { resume: first.path, idle: 2 });
    assert.equal(second.code, 3, second.err); assert.equal(second.report.receiptOk, false);
    assert.equal(second.report.answer, null);
  } finally { await s.close(); }
});
test("a continuation cut before its turn wrote text reports no answer, not the earlier turn's", async () => {
  const s = await fakeOpenCode("slow"); s.slowMs = 500;
  try {
    const first = await driverRun(s, { timeout: null }); assert.equal(first.code, 0, first.err);
    s.slowMs = 5000;
    const second = await driverRun(s, { resume: first.path, timeout: 2 });
    assert.equal(second.code, 3, second.err); assert.match(second.report.error, /wall timeout/);
    assert.equal(second.report.answer, null); assert.equal(second.report.answerPath, null);
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
  const s = await fakeOpenCode(); s.results = ["FIRST_TURN", "SECOND_TURN"];
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
      const messages = s.sessions.get(r.report.sessionID).messages;
      const reply = messages[messages.findIndex((m) => m.id === r.report.turnId) + 1];
      assert.equal(reply.type, "assistant");
      assert.equal(fs.readFileSync(r.report.answerPath, "utf8"), reply.content[0].text);
      assert.equal(r.report.answer, r === first ? "FIRST_TURN" : "SECOND_TURN");
    }
  } finally { await s.close(); }
});
test("cancelled report retains the selected model for continuation", async () => {
  const s = await fakeOpenCode("cancel");
  try {
    const first = await driverRun(s, { cancel: true, headers: "VARIANT: high\n" });
    assert.equal(first.report.model, null); assert.equal(first.report.requestedModel, "router/deepseek/flash");
    assert.equal(first.report.variant, "high");
    const second = await driverRun(s, { resume: first.path, defaultModel: "router/glm/flash", cancel: true });
    assert.equal(second.report.sessionID, first.report.sessionID);
    assert.equal(second.report.requestedModel, "router/deepseek/flash");
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
test("malformed active map cannot establish idle or permit RESUME", async () => {
  const s = await fakeOpenCode();
  try {
    const first = await driverRun(s); assert.equal(first.code, 0, first.err);
    const before = s.prompts;
    for (const value of [{ error: "invalid active schema" }, { ses_foreign: { type: "idle" } }]) {
      s.activeOverride = value;
      const again = await driverRun(s, { resume: first.path });
      assert.equal(again.code, 2, again.err); assert.match(again.err, /status is unknown/);
      assert.equal(s.prompts, before);
    }
    const fresh = await driverRun(s, { idle: 1 });
    assert.notEqual(fresh.code, 0); assert.equal(fresh.report.receiptOk, false);
    assert.equal(fresh.report.cancellation?.observed, "unknown");
  } finally { await s.close(); }
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
    const abort = s.calls.findIndex((c) => c.path.endsWith("/interrupt"));
    const reject = s.calls.findIndex((c) => c.path.includes("/form/") && c.method === "DELETE");
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
// Status asks a private server for the current directory, as a run does; the fake CLI on PATH announces the fake.
async function statusRun(server, { format = "json", desktop = undefined, catalogue = false } = {}) {
  const state = tempDir("entrust-opencode-status-"), cli = fakeCli(server.url, state);
  const r = await invoke([STATUS, ...(format === "json" ? ["--format", "json"] : []), ...(catalogue ? ["--catalogue"] : [])], "", {
    ...cli.env, ENTRUST_OPENCODE_DESKTOP_STATE: desktop ?? path.join(state, "no-desktop.sqlite") });
  assert.equal(r.code, 0, r.out + r.err);
  assert.equal(fs.readFileSync(cli.stopFile, "utf8"), "stopped", "status closes the server it started");
  return { ...r, data: format === "json" ? JSON.parse(r.out) : null };
}
test("status lists the models Desktop shows that the catalogue offers, in Desktop's order with its advertised variants, and the configured default", async () => {
  const s = await fakeOpenCode(); s.defaultModel = "router/glm/flash";
  try {
    const desktop = await desktopStore(tempDir("entrust-opencode-status-desktop-"), { user: [
      { providerID: "router", modelID: "glm/flash-fast", visibility: "show" }, { providerID: "router", modelID: "retired", visibility: "show" },
      { providerID: "router", modelID: "deepseek/flash", visibility: "show" }, { providerID: "router", modelID: "glm/flash", visibility: "hide" }],
      recent: [], variant: { "router/deepseek/flash": "high", "router/glm/flash-fast": "max" } });
    const { data } = await statusRun(s, { desktop });
    assert.equal(data.adapter, "opencode"); assert.equal(data.status, "ready"); assert.equal(data.configured, true); assert.equal(data.default, "router/glm/flash");
    assert.deepEqual(data.models, { source: "desktop", note: null, list: [
      { providerID: "router", modelID: "glm/flash-fast", variant: null, variants: [] },
      { providerID: "router", modelID: "deepseek/flash", variant: "high", variants: ["high"] }] });
  } finally { await s.close(); }
});
test("catalogue mode includes enabled models hidden or absent in Desktop without changing the default list", async () => {
  const s = await fakeOpenCode();
  try {
    const desktop = await desktopStore(tempDir("entrust-opencode-status-catalogue-"), { user: [
      { providerID: "router", modelID: "deepseek/flash", visibility: "show" },
      { providerID: "router", modelID: "glm/flash", visibility: "hide" }], recent: [], variant: {} });
    const normal = await statusRun(s, { desktop });
    assert.deepEqual(normal.data.models.list.map((m) => m.modelID), ["deepseek/flash"]);
    const full = await statusRun(s, { desktop, catalogue: true });
    assert.equal(full.data.models.source, "catalogue"); assert.equal(full.data.models.note, null);
    assert.deepEqual(full.data.models.list.map((m) => m.modelID), ["deepseek/flash", "glm/flash", "glm/flash-fast"]);
    assert.deepEqual(full.data.models.list[0].variants, ["high"]);
    const text = await statusRun(s, { format: "text", desktop, catalogue: true });
    assert.match(text.out, /SOURCE=catalogue\n/);
    assert.match(text.out, /MODEL=router\/glm\/flash variant=none/);
  } finally { await s.close(); }
});
test("status rejects duplicate and incomplete options before starting a server", async () => {
  for (const args of [["--catalogue", "--catalogue"], ["--format"], ["--format", "text", "--format", "json"]]) {
    const result = await invoke([STATUS, ...args]);
    assert.equal(result.code, 2); assert.match(result.err, /usage: status.mjs/);
  }
});
test("without Desktop's store status lists the whole catalogue and says why; with no default it says none, with no CLI missing and unconfigured, and with a CLI that cannot serve unavailable and unknown", async () => {
  const s = await fakeOpenCode();
  try {
    const { data } = await statusRun(s);
    assert.equal(data.models.source, "catalogue"); assert.match(data.models.note, /no OpenCode Desktop store/);
    assert.deepEqual(data.models.list.map((m) => m.modelID), ["deepseek/flash", "glm/flash", "glm/flash-fast"]);
    assert.equal(data.default, null);
    const text = await statusRun(s, { format: "text" });
    assert.match(text.out, /^OPENCODE=ready version=2\.1\.2\nDEFAULT=none\nSOURCE=catalogue \(no OpenCode Desktop store at [^)]+\)\nMODEL=router\/deepseek\/flash variant=none variants=high\n/);
  } finally { await s.close(); }
  const bin = path.join(tempDir("entrust-opencode-status-none-"), "bin"); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, "opencode"), "#!/usr/bin/env node\nprocess.exit(1);\n", { mode: 0o755 });
  const r = await invoke([STATUS, "--format", "json"], "", { PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}` });
  assert.equal(r.code, 0, r.out + r.err);
  assert.deepEqual([JSON.parse(r.out).status, JSON.parse(r.out).configured], ["unavailable", null]);
  const none = await invoke([STATUS, "--format", "json"], "", { PATH: tempDir("entrust-opencode-status-no-cli-") });
  assert.equal(none.code, 0, none.out + none.err);
  assert.deepEqual([JSON.parse(none.out).status, JSON.parse(none.out).configured], ["missing", false]);
  assert.match((await invoke([STATUS], "", { PATH: tempDir("entrust-opencode-status-no-cli-") })).out, /^OPENCODE=missing \(OpenCode CLI is not on PATH/);
});
test("native write resources each need an exact target; one outside the roots is offered, one in the state or a protected directory declined", () => {
  const scope = { roots: [cwd] }, state = tempDir("entrust-opencode-guard-"), prot = tempDir("entrust-opencode-protected-");
  const guard = { stateDir: state, protectedDirs: [{ dir: prot, label: "OpenCode's configuration", holds: "its plugins" }] };
  assert.deepEqual(editScope(scope, { action: "write", resources: ["one", "two"] }, cwd, guard), { outside: false });
  assert.deepEqual(editScope(scope, { action: "write", resources: ["one", "../outside"] }, cwd, guard), { outside: true });
  assert.match(editScope(scope, { action: "write", resources: ["**"] }, cwd, guard).decline, /exact/);
  assert.match(editScope(scope, { action: "write", resources: [] }, cwd, guard).decline, /target/);
  assert.match(editScope(scope, { action: "write", resources: [path.join(state, "inv", "approvals", "1-aaaaaaaa.decision.json")] }, cwd, guard).decline, /inside the state directory/);
  assert.match(editScope(scope, { action: "edit", resources: [path.join(prot, "new", "plugin.js")] }, cwd, guard).decline, /inside OpenCode's configuration/);
  assert.match(editScope({ roots: [] }, { action: "edit", resources: ["x"] }, cwd, guard).decline, /no declared writes scope/);
});
// The driver's pid line admits a forwarded Stop, so a Stop that comes before the private server is ready, or before
// the session exists, must end in a terminal aborted report, with nothing submitted and the server closed.
const sleepMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const PINNED = "MODEL: router/deepseek/flash\n";
test("Stop before the private server is ready ends in a terminal aborted report with nothing submitted and the server closed", async () => {
  const s = await fakeOpenCode();
  const state = tempDir("entrust-opencode-early-");
  try {
    const started = path.join(state, "opencode-started");
    const r = await driverRun(s, { state, headers: PINNED, more: { FAKE_OPENCODE_DELAY_MS: "6000" }, cancelOn: () => fs.existsSync(started) });
    assert.match(r.err, /^entrust: pid=\d+ identity=\S+ reportPath=/m, "the Stop must come after the announcement");
    assert.equal(r.code, 3, `exit ${r.code} signal ${r.signal}: ${r.err}`);
    assert.equal(r.report?.exitCode, 3); assert.equal(r.report.turnStatus, "aborted"); assert.equal(r.report.partial, true);
    assert.equal(r.report.receiptOk, false); assert.equal(r.report.ok, false);
    assert.equal(r.report.model, null); assert.equal(r.report.sessionID, null);
    assert.deepEqual(r.report.serverCleanup, { process: "exited", owner: "exited", listener: "unknown" });
    assert.equal(r.report.requestedModel, "router/deepseek/flash");
    assert.deepEqual(r.report.commands, []);
    assert.match(r.report.cancellation.reason, /SIGTERM/); assert.equal(r.report.cancellation.signal, "SIGTERM");
    assert.equal(s.prompts, 0); assert.equal(s.calls.some((c) => c.path.endsWith("/prompt")), false);
    assert.equal(fs.existsSync(r.stopFile), true, "the private server it had spawned was not closed");
  } finally { await s.close(); }
});
test("Stop before the session exists, with the server ready, ends in a terminal aborted report and creates no session", async () => {
  const s = await fakeOpenCode("slow-catalogue");
  const state = tempDir("entrust-opencode-early-");
  try {
    const r = await driverRun(s, { state, headers: PINNED, cancelOn: () => s.calls.some((c) => c.path === "/api/model") });
    assert.equal(r.code, 3, `exit ${r.code} signal ${r.signal}: ${r.err}`);
    assert.equal(r.report.turnStatus, "aborted"); assert.equal(r.report.partial, true); assert.equal(r.report.receiptOk, false);
    assert.equal(r.report.model, null); assert.equal(r.report.sessionID, null); assert.equal(r.report.requestedModel, "router/deepseek/flash");
    assert.equal(s.calls.some((c) => c.method === "POST" && c.path === "/api/session" && !c.path.includes("ses_")), false, "a session was created after the Stop");
    assert.equal(s.prompts, 0); assert.equal(fs.existsSync(r.stopFile), true);
  } finally { await s.close(); }
});
test("one official --stop at the OpenCode startup boundary returns the terminal lines, and --handback recovers them exactly", async () => {
  const s = await fakeOpenCode();
  const state = tempDir("entrust-opencode-early-launch-");
  const report = path.join(state, "run", "report.json"), agent = path.join(state, "run", "agent");
  const cli = fakeCli(s.url, state);
  const env = { ENTRUST_STATE_DIR: state, ...cli.env, FAKE_OPENCODE_DELAY_MS: "8000" };
  let run = null;
  try {
    const made = await invoke([ENTRY, "--new", "--report-file", report], prompt(PINNED), env);
    assert.equal(made.code, 0, made.out + made.err);
    run = spawnNode([ENTRY, "--run", "--report-file", report], { env, killAfterMs: 60000 });
    for (const until = Date.now() + 10000; Date.now() < until && !fs.existsSync(cli.startFile); await sleepMs(20)) {}
    assert.equal(fs.existsSync(cli.startFile), true, "the driver never started its server");
    assert.match(fs.readFileSync(path.join(agent, "err.txt"), "utf8"), /^entrust: pid=\d+ identity=\S+ reportPath=/m, "not announced");
    const stopped = await invoke([ENTRY, "--stop", "--report-file", report], "", env);
    const lines = stopped.out.split("\n").filter(Boolean);
    assert.equal(stopped.code, 0, stopped.out + stopped.err);
    assert.equal(lines.length, 9, stopped.out); assert.equal(lines[0], "DRIVER_EXIT=3"); assert.equal(lines[2], "EXIT=3");
    assert.match(lines[6], /^RECEIPT=turnStatus=aborted receiptOk=false model=none stopped=stop$/);
    assert.equal(s.prompts, 0); assert.equal(fs.existsSync(cli.stopFile), true);
    const back = await invoke([ENTRY, "--handback", "--report-file", report], stopped.out, env);
    assert.equal(back.code, 0, back.out); assert.equal(back.out, "HANDBACK=exact\n");
  } finally { if (run?.child.exitCode === null) run.child.kill("SIGTERM"); await run?.done; await s.close(); }
});
// A single case (or a /substring/ pattern) runs alone: `node opencode.test.mjs <name>`.
const only = process.argv[2];
const selected = only ? cases.filter((c) => c.name.includes(only)) : cases;
process.exitCode = summarize(await runCases(selected), selected.length);
