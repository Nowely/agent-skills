#!/usr/bin/env node
// Offline state loop through the real launcher and fake Claude: one confirmed activation and its consent, the
// host-only coordinator profile, complete outcomes, fork lineage and a legacy mode kept as it was.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { ROOT, EVALS, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";
import { readAgentOrders } from "../plugin/skills/orchestrate/scripts/agent-orders.mjs";
const { cases, test: register } = registry();
const test = (name, fn) => register(name, name, async () => { await fn(); return true; });
const HELPER = path.join(ROOT, "skills/orchestrate/scripts/main-proxy.mjs"), ENTRY = path.join(ROOT, "skills/orchestrate/scripts/agent-run.mjs");
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const catalogue = () => ({ schemaVersion: 1, observedAt: new Date().toISOString(), source: "offline runtime fixture",
  capabilities: [{ id: "host.read", kind: "tool", description: "Read", authority: "host platform approval applies", runtimeAvailable: true,
    argumentsSchema: { type: "object", properties: { path: { type: "string", minLength: 1 } }, required: ["path"], additionalProperties: false } }],
  workerModels: [{ model: "gpt-6.1-sol", efforts: ["high"] }, { model: "gpt-6-luna", efforts: ["medium"] }], proxyModel: "gpt-6-luna", coordinatorModel: "opus" });
const delegate = { id: "d", action: "delegate", agent_id: "worker", task: "Implement approved task", scope: "isolated worktree", model: "gpt-6.1-sol", effort: "high" };
const collect = { id: "c", action: "collect", agent_ids: ["worker"] };
const invoke = { id: "i", action: "invoke", capability: "host.read", arguments: { path: "README.md" }, purpose: "inspect" };
const envelope = (requests = [], final_answer = "") => ({ plan: "", requests, final_answer });
const report = (answerJson) => ({ ok: true, receiptOk: true, outputSchemaOk: true, partial: false, sessionID: "session", answerJson });
const YES = "Подтвердить переключение";
// The host session every helper call of a case runs in, and nothing of this machine's own sessions or routes.
const HOST = "host-thread-1";
const baseEnv = () => {
  const e = { ...process.env };
  for (const k of Object.keys(e)) if (/^(CLAUDE_CODE_SESSION_ID|CODEX_THREAD_ID|CODEX_SANDBOX|ANTHROPIC_(?:[A-Z]+_)?BASE_URL)$/.test(k)) delete e[k];
  return e;
};
// A mode as a case needs it: confirmed by default, only proposed, or a legacy mode as `init` wrote it before 0.31.
function setup({ legacy = false, confirmed = true, model = "Opus" } = {}) {
  const dir = tempDir("entrust-main-proxy-"), state = path.join(dir, "mode"), work = path.join(dir, "work"), bin = path.join(dir, "bin");
  fs.mkdirSync(work); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, "claude"), `#!/bin/sh\nexec "${process.execPath}" "${path.join(EVALS, "fake-claude.mjs")}" "$@"\n`, { mode: 0o755 });
  const cat = path.join(dir, "catalogue.json"), message = path.join(dir, "message.txt"), facts = path.join(dir, "facts.txt");
  fs.writeFileSync(cat, JSON.stringify(catalogue())); fs.writeFileSync(facts, "Approved scope: " + work);
  // The launcher's calls inherit this process's environment: its own session, route and settings are named here so
  // none of them reaches a case, and the settings Claude Code would read are a synthetic directory's.
  const env = { PATH: `${bin}${path.delimiter}${process.env.PATH}`, ENTRUST_STATE_DIR: state, CODEX_THREAD_ID: HOST, CLAUDE_CODE_SESSION_ID: undefined,
    ANTHROPIC_BASE_URL: undefined, CLAUDE_CONFIG_DIR: path.join(dir, "claude-config"),
    FAKE_CLAUDE_LOG: path.join(dir, "calls.jsonl"), FAKE_CLAUDE_MODE: "structured", AGENT_RUN_RETURN_MS: "10000" };
  const run = (command, args = [], input, more = {}) => spawnSync(process.execPath, [HELPER, command, ...(command === "help" ? [] : ["--state", state]), ...args],
    { encoding: "utf8", input, env: Object.fromEntries(Object.entries({ ...baseEnv(), ...env, ...more }).filter(([, v]) => v !== undefined)) });
  const ok = (command, args = [], input, more) => { const r = run(command, args, input, more); assert.equal(r.status, 0, r.stdout + r.stderr); return r.stdout; };
  const modePath = path.join(state, "mode.json"), mode = () => JSON.parse(fs.readFileSync(modePath, "utf8"));
  const calls = () => fs.existsSync(env.FAKE_CLAUDE_LOG) ? fs.readFileSync(env.FAKE_CLAUDE_LOG, "utf8").trim().split("\n").map(JSON.parse) : [];
  // The host's claim on each published order right before it executes it.
  const begin = (...ids) => ids.map((id) => JSON.parse(ok("begin", ["--request-id", id])));
  const s = { dir, state, work: fs.realpathSync(work), cat, message, facts, env, run, ok, begin, modePath, mode, calls };
  if (legacy) {
    fs.mkdirSync(state);
    fs.writeFileSync(modePath, JSON.stringify({ schemaVersion: 1, adapter: "claude", model: "opus", cwd: s.work, catalogue: cat, agents: {}, requests: {},
      lineage: [], round: 0, currentReport: null, lastCompletedReport: null, external_session: null }, null, 2));
    return s;
  }
  s.proposal = JSON.parse(ok("propose", ["--adapter", "claude", "--model", model, "--cwd", work, "--catalogue", cat, "--language", "ru"]));
  if (confirmed) ok("confirm", ["--pending", s.proposal.pending, "--source", "user-choice", "--answer-file", "-"], YES);
  return s;
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
// One launched round whose report a case reads before deciding what finish must say.
async function launch(s, message, answer, more = {}) {
  fs.writeFileSync(s.message, message);
  s.ok("prepare", ["--message-file", s.message, "--host-facts", s.facts]);
  const reportPath = s.mode().currentReport;
  const r = await spawnNode([ENTRY, "--run", "--watch", "--report-file", reportPath], { env: { ...s.env, FAKE_CLAUDE_OUTPUT: JSON.stringify(answer), ...more }, killAfterMs: 30000 }).done;
  assert.equal(r.code, 0, r.out + r.err);
  return { status: r.out, reportPath, report: JSON.parse(fs.readFileSync(reportPath, "utf8")) };
}
const argvOf = (call, flag) => call.argv[call.argv.indexOf(flag) + 1];

// ------------------------------------------------------------------------------------------- activation

test("a proposal launches nothing and sends nothing; only the user's own answer in this session confirms it", async () => {
  const s = setup({ confirmed: false }), p = s.proposal;
  assert.deepEqual(p.choices, [YES, "Отмена"]);
  assert.ok(p.confirmation.startsWith("Вы переключаете основную сессию в режим прокси на **Claude Opus** через провайдера **Anthropic**."), p.confirmation);
  assert.ok(p.confirmation.includes("все права и возможности основной сессии без ограничений"));
  assert.ok(p.confirmation.includes("рабочий контекст основной сессии, содержимое рабочих файлов и результаты инструментов"));
  assert.equal(s.mode().lifecycle, "pending"); assert.equal(s.mode().consent, null);
  fs.writeFileSync(s.message, "Проверь ветки");
  assert.match(s.run("prepare", ["--message-file", s.message, "--host-facts", s.facts]).stderr, /has not confirmed this activation: nothing was launched and no context was sent/);
  const quoted = path.join(s.dir, "quoted.txt"); fs.writeFileSync(quoted, `> ${YES}\n`);
  const attempt = (args, input = YES, more) => s.run("confirm", ["--pending", p.pending, ...args], input, more);
  for (const [args, input, more, why] of [
    [["--source", "quote", "--answer-file", "-"], YES, {}, /an answer from quote is not the user's/],
    [["--source", "tool-output", "--answer-file", "-"], YES, {}, /an answer from tool-output is not the user's/],
    [["--source", "assistant", "--answer-file", "-"], YES, {}, /an answer from assistant is not the user's/],
    [["--source", "document", "--answer-file", quoted], YES, {}, /an answer from document is not the user's/],
    [["--source", "user-choice", "--answer-file", quoted], YES, {}, /a choice confirms only as "Подтвердить переключение"/],
    [["--source", "user-choice", "--answer-file", "-"], "Да", {}, /a choice confirms only as/],
    [["--source", "user-message", "--answer-file", "-"], "  \n", {}, /silence is not consent/],
    [["--source", "user-message", "--answer-file", "-"], "Отмена\n", {}, /record it with cancel/],
    [["--source", "user-message", "--answer-file", "-"], YES, { CODEX_THREAD_ID: "another-thread" }, /proposed in another host session/],
    [["--source", "user-message", "--answer-file", "-"], YES, { CODEX_THREAD_ID: HOST, CLAUDE_CODE_SESSION_ID: "nested-session" }, /proposed in another host session/],
  ]) { const r = attempt(args, input, more); assert.equal(r.status, 2, `${args.join(" ")}: ${r.stdout}${r.stderr}`); assert.match(r.stderr, why); }
  assert.match(s.run("confirm", ["--pending", crypto.randomUUID(), "--source", "user-message", "--answer-file", "-"], YES).stderr, /another activation/);
  assert.equal(s.mode().lifecycle, "pending"); assert.equal(s.calls().length, 0, "nothing reached the provider before the answer");
  assert.equal(fs.readdirSync(s.state).some((n) => n.startsWith("round-")), false);
  // A typed reply is the trusted host's to judge: any explicit affirmative it received is recorded exactly as given,
  // with no closed list of yeses. (A negative, a quote or a condition never reaches confirm; the skill says so.)
  const answer = Buffer.from("Да, переключай на Claude Opus через Anthropic.\r\n");
  const consent = JSON.parse(s.ok("confirm", ["--pending", p.pending, "--source", "user-message", "--answer-file", "-"], answer));
  assert.equal(consent.answer, answer.toString()); assert.equal(consent.answerSha256, sha(answer));
  assert.deepEqual(consent.hostSession, { CODEX_THREAD_ID: HOST }); assert.equal(consent.source, "user-message");
  assert.equal(consent.provider, "Anthropic"); assert.equal(consent.route.apiProvider, "firstParty"); assert.equal(consent.display, "Claude Opus");
  assert.equal(consent.confirmation, p.confirmation); assert.equal(consent.confirmationSha256, sha(p.confirmation)); assert.equal(consent.model, "opus");
  assert.deepEqual(s.mode().consent, consent); assert.equal(s.mode().lifecycle, "confirmed");
  const status = JSON.parse(s.ok("status"));
  assert.equal(status.lifecycle, "confirmed"); assert.ok(status.justification.includes(JSON.stringify(answer.toString())), status.justification);
  assert.match(status.justification, /every right and capability of the session .* sent to Anthropic/);
  // The same confirmation repeated, as after a lost stdout, prints the saved consent and asks nothing; another is refused.
  assert.deepEqual(JSON.parse(s.ok("confirm", ["--pending", p.pending, "--source", "user-message", "--answer-file", "-"], "другой текст")), consent);
  assert.match(s.run("confirm", ["--pending", crypto.randomUUID(), "--source", "user-message", "--answer-file", "-"], YES).stderr, /is confirmed, not pending/);
  assert.equal(s.calls().length, 0, "a confirmation alone launches nothing");
});

test("propose names the provider from the route, checks the launch offline, and refuses a route without a host-only coordinator", () => {
  const s = setup({ confirmed: false }), fresh = (name) => path.join(s.dir, name);
  const propose = (state, args, more) => spawnSync(process.execPath, [HELPER, "propose", "--state", state, "--cwd", s.work, "--catalogue", s.cat, ...args],
    { encoding: "utf8", env: Object.fromEntries(Object.entries({ ...baseEnv(), ...s.env, ENTRUST_STATE_DIR: state, ...more }).filter(([, v]) => v !== undefined)) });
  for (const [adapter, model] of [["opencode", "glm-5"], ["codex", "sol"]]) {
    const r = propose(fresh(adapter), ["--adapter", adapter, "--model", model, "--language", "ru"]);
    assert.equal(r.status, 2); assert.match(r.stderr, new RegExp(`no coordinator profile that acts only through the host is proven for adapter ${adapter}`));
    assert.equal(fs.existsSync(path.join(fresh(adapter), "mode.json")), false);
  }
  for (const [args, more, why] of [
    [["--adapter", "opencode", "--model", "opus", "--language", "ru"], {}, /requires adapter claude/],
    [["--adapter", "claude", "--model", "opus", "--effort", "huge", "--language", "ru"], {}, /the launch would be refused, so nothing was proposed: .*EFFORT must be/],
    [["--adapter", "claude", "--model", "opus", "--language", "fr"], {}, /--language must be ru or en/],
    [["--adapter", "claude", "--model", "opus", "--language", "ru"], { FAKE_CLAUDE_SIGNED_IN: "0" }, /route is signed-out; nothing was launched/],
    [["--adapter", "claude", "--model", "opus", "--language", "ru"], { CODEX_THREAD_ID: undefined }, /no host session identity in the environment/],
    [["--adapter", "claude", "--model", "opus", "--language", "ru", "--replaces", s.state], {}, /--replaces names a mode that is pending, not running/],
    [["--adapter", "claude", "--model", "opus", "--language", "ru"], { ANTHROPIC_BASE_URL: "gateway token=sk-secret-123" }, /names no provider for its route \(ANTHROPIC_BASE_URL is not a valid URL/],
  ]) {
    const at = fresh(`refused-${crypto.randomUUID()}`), r = propose(at, args, more);
    assert.equal(r.status, 2, r.stdout); assert.match(r.stderr, why); assert.equal(fs.existsSync(path.join(at, "mode.json")), false);
    assert.equal(`${r.stdout}${r.stderr}`.includes("sk-secret-123"), false);
  }
  const bedrock = JSON.parse(propose(fresh("bedrock"), ["--adapter", "claude", "--model", "claude-sonnet-5-5", "--language", "en"], { FAKE_CLAUDE_API_PROVIDER: "bedrock" }).stdout);
  assert.deepEqual(bedrock.choices, ["Confirm switch", "Cancel"]);
  assert.ok(bedrock.confirmation.startsWith("You are switching the main session to proxy mode on **Claude Sonnet (claude-sonnet-5-5)** through the provider **Amazon Bedrock**."));
  const gateway = JSON.parse(propose(fresh("gateway"), ["--adapter", "claude", "--model", "fable", "--language", "ru"], { ANTHROPIC_BASE_URL: "https://user:secret@gateway.example:8443/v1/" }).stdout);
  assert.match(gateway.confirmation, /через провайдера \*\*Anthropic \(ANTHROPIC_BASE_URL=https:\/\/gateway\.example:8443\/v1\)\*\*/);
  assert.equal(gateway.confirmation.includes("secret"), false);
  const unknown = JSON.parse(propose(fresh("unknown"), ["--adapter", "claude", "--model", "haiku", "--language", "ru"], { FAKE_CLAUDE_API_PROVIDER: "acme" }).stdout);
  assert.match(unknown.confirmation, /через провайдера \*\*apiProvider acme\*\*/);
  assert.equal(s.calls().length, 0);
});

test("cancel leaves the running coordinator as it was, and the cancelled one never launches", async () => {
  const old = setup(); await round(old, "start", envelope([], "ready"));
  const before = fs.readFileSync(old.modePath, "utf8"), next = path.join(old.dir, "next");
  const env = Object.fromEntries(Object.entries({ ...baseEnv(), ...old.env, ENTRUST_STATE_DIR: next }));
  const helper = (args, input) => spawnSync(process.execPath, [HELPER, ...args], { encoding: "utf8", input, env });
  const proposed = JSON.parse(helper(["propose", "--state", next, "--adapter", "claude", "--model", "sonnet", "--cwd", old.work, "--catalogue", old.cat, "--language", "ru", "--replaces", old.state]).stdout);
  assert.equal(helper(["cancel", "--state", next, "--pending", proposed.pending]).status, 0);
  assert.equal(fs.readFileSync(old.modePath, "utf8"), before, "the running mode is untouched");
  assert.match(helper(["confirm", "--state", next, "--pending", proposed.pending, "--source", "user-choice", "--answer-file", "-"], YES).stderr, /is cancelled, not pending/);
  fs.writeFileSync(old.message, "x");
  assert.match(helper(["prepare", "--state", next, "--message-file", old.message, "--host-facts", old.facts]).stderr, /was cancelled: nothing was launched/);
  await round(old, "go on", envelope([], "still here"));
  assert.equal(old.calls().filter((c) => argvOf(c, "--model") === "sonnet").length, 0);
  assert.equal(old.mode().lifecycle, "active");
});

test("a confirmed switch ends the replaced coordinator: an order not begun is revoked, a begun one's outcome still recorded", async () => {
  const old = setup(); await round(old, "start", envelope([invoke, { ...invoke, id: "j" }]));
  old.begin("i");
  const next = path.join(old.dir, "next"), env = Object.fromEntries(Object.entries({ ...baseEnv(), ...old.env, ENTRUST_STATE_DIR: next }).filter(([, v]) => v !== undefined));
  const helper = (args, input) => spawnSync(process.execPath, [HELPER, ...args], { encoding: "utf8", input, env });
  const proposed = JSON.parse(helper(["propose", "--state", next, "--adapter", "claude", "--model", "sonnet", "--cwd", old.work, "--catalogue", old.cat, "--language", "ru", "--replaces", old.state]).stdout);
  assert.equal(old.mode().lifecycle, "active", "a proposal ends nothing");
  const confirmed = helper(["confirm", "--state", next, "--pending", proposed.pending, "--source", "user-choice", "--answer-file", "-"], YES);
  assert.equal(confirmed.status, 0, confirmed.stderr);
  assert.equal(old.mode().lifecycle, "ended"); assert.equal(old.mode().replacedBy, fs.realpathSync(next));
  fs.writeFileSync(old.message, "x");
  assert.match(old.run("prepare", ["--message-file", old.message, "--host-facts", old.facts]).stderr, /ended at .*: delegation has stopped/);
  assert.match(old.run("begin", ["--request-id", "j"]).stderr, /ended at .*: the host executes none of its orders/);
  const outcome = ' { "content": "результат после смены" }\n';
  old.ok("record", ["--request-id", "i", "--outcome-json", "-"], outcome);
  assert.match(old.run("record", ["--request-id", "j", "--outcome-json", "-"], '{"content":"late"}').stderr, /no pending request: j/);
  const results = JSON.parse(old.ok("results")).REQUEST_RESULTS;
  assert.equal(results.find((r) => r.id === "i").outcomeJson, outcome);
  assert.equal(results.find((r) => r.id === "j").outcome.status, "revoked");
  assert.equal(JSON.parse(old.ok("status")).justification, null);
});

test("another host session's mode is not replaced, a legacy one is, and a switch a crash interrupted finishes on its repeat", async () => {
  const fresh = (name) => path.join(tempDir("entrust-switch-"), name);
  const helper = (s, state, args, input, more = {}) => spawnSync(process.execPath, [HELPER, ...args], { encoding: "utf8", input,
    env: Object.fromEntries(Object.entries({ ...baseEnv(), ...s.env, ENTRUST_STATE_DIR: state, ...more }).filter(([, v]) => v !== undefined)) });
  const propose = (s, state, more) => helper(s, state, ["propose", "--state", state, "--adapter", "claude", "--model", "sonnet", "--cwd", s.work, "--catalogue", s.cat,
    "--language", "ru", "--replaces", s.state], undefined, more);
  const theirs = setup(); await round(theirs, "start", envelope([], "ready"));
  const r = propose(theirs, fresh("b"), { CODEX_THREAD_ID: "host-b" });
  assert.equal(r.status, 2); assert.match(r.stderr, /--replaces names a mode confirmed in another host session/);
  assert.equal(theirs.mode().lifecycle, "active");
  const legacy = setup({ legacy: true }), next = fresh("after-legacy");
  const p = JSON.parse(propose(legacy, next).stdout);
  assert.equal(helper(legacy, next, ["confirm", "--state", next, "--pending", p.pending, "--source", "user-choice", "--answer-file", "-"], YES).status, 0);
  assert.equal(legacy.mode().lifecycle, "ended", "a legacy mode records no session; the confirmed switch in this one ends it");
  // A failure to write the replaced mode after the new consent was saved: the repeat of the same confirm finishes it.
  const old = setup(); await round(old, "start", envelope([], "ready"));
  const target = path.join(old.dir, "after-crash"), preload = path.join(old.dir, "fail-once.cjs"), marker = path.join(old.dir, "failed-once");
  fs.writeFileSync(preload, `const fs=require('node:fs'),rename=fs.renameSync;fs.renameSync=function(a,b){if(String(b)===${JSON.stringify(old.modePath)}&&!fs.existsSync(${JSON.stringify(marker)})){fs.writeFileSync(${JSON.stringify(marker)},'1');throw Object.assign(new Error('injected write failure'),{code:'EIO'});}return rename.call(this,a,b);};`);
  const q = JSON.parse(propose(old, target).stdout);
  const crashed = helper(old, target, ["confirm", "--state", target, "--pending", q.pending, "--source", "user-message", "--answer-file", "-"], "Да, подтверждаю.", { NODE_OPTIONS: `--require=${preload}` });
  assert.equal(crashed.status, 2); assert.match(crashed.stderr, /injected write failure/);
  const saved = JSON.parse(fs.readFileSync(path.join(target, "mode.json"), "utf8"));
  assert.equal(saved.lifecycle, "confirmed"); assert.equal(saved.consent.answer, "Да, подтверждаю."); assert.equal(old.mode().lifecycle, "active");
  const repeated = helper(old, target, ["confirm", "--state", target, "--pending", q.pending, "--source", "user-message", "--answer-file", "-"], "anything");
  assert.equal(repeated.status, 0, repeated.stderr); assert.equal(JSON.parse(repeated.stdout).answer, "Да, подтверждаю.");
  assert.equal(old.mode().lifecycle, "ended"); assert.equal(old.mode().replacedBy, fs.realpathSync(target));
  assert.equal(helper(old, target, ["confirm", "--state", target, "--pending", q.pending, "--source", "user-message", "--answer-file", "-"], "again").status, 0, "a third repeat is as harmless");
});

test("the activation runs the host-only profile, active after its first complete round; continuations keep consent, model, provider and profile", async () => {
  const s = setup(), consent = s.mode().consent, user = 'Найди уникальную работу b0\r\nПривет "$\\"\n\n';
  const first = await round(s, user, envelope([invoke]));
  const [call] = s.calls();
  assert.equal(argvOf(call, "--tools"), ""); assert.equal(argvOf(call, "--model"), "opus"); assert.equal(argvOf(call, "--permission-prompts"), "none");
  for (const flag of ["--safe-mode", "--strict-mcp-config"]) assert.ok(call.argv.includes(flag), flag);
  for (const flag of ["--append-system-prompt", "--mcp-config", "--disallowedTools", "--fallback-model", "--dangerously-skip-permissions", "--resume"]) assert.equal(call.argv.includes(flag), false, flag);
  assert.ok(call.task.startsWith("## Agent orders\n")); assert.ok(call.task.endsWith(`USER_MESSAGE (verbatim text encoded as a JSON string):\n${JSON.stringify(user)}`));
  const sent = JSON.parse(call.task.split("CONSENT:\n")[1].split("\n")[0]);
  assert.deepEqual(sent, { confirmedAt: consent.at, source: "user-choice", answer: YES, model: "Claude Opus", provider: "Anthropic", confirmation: consent.confirmation });
  const prompt = fs.readFileSync(path.join(s.state, "round-1", "prompt.txt"), "utf8");
  assert.ok(prompt.startsWith(`RIGHTS: read ${s.work}\nPROFILE: coordinator\nMODEL: opus\nOUTPUT_SCHEMA: `), prompt.slice(0, 200));
  assert.equal(first.profile, "coordinator"); assert.deepEqual(first.context.tools, ["StructuredOutput"]);
  const active = s.mode();
  assert.equal(active.lifecycle, "active"); assert.equal(active.effectiveModel, "claude-opus-5-5"); assert.equal(active.activation.report, path.join(s.state, "round-1", "report.json"));
  assert.equal(s.mode().requests.i.state, "published");
  const [claim] = s.begin("i");
  assert.deepEqual(claim.request, invoke); assert.match(claim.justification, /^Requested by Claude Opus, the coordinator the user confirmed for this session/);
  assert.match(s.run("begin", ["--request-id", "i"]).stderr, /is dispatched_outcome_unknown: an order is begun once/);
  const tool = ' { "content": "полный результат\\r\\n\\"git\\"" }\n'; s.ok("record", ["--request-id", "i", "--outcome-json", "-"], tool);
  const results = path.join(s.dir, "results.json"); fs.writeFileSync(results, s.ok("results"));
  // Time alone ends nothing: a consent given long ago still admits the next round.
  const aged = s.mode(); aged.consent.at = "2001-01-01T00:00:00.000Z"; fs.writeFileSync(s.modePath, JSON.stringify(aged));
  fs.writeFileSync(s.cat, JSON.stringify({ ...catalogue(), capabilities: [...catalogue().capabilities, { id: "host.clock", kind: "tool", description: "UTC time", authority: "host" }] }));
  const final = "Готово.\r\nИтог: \"b0 без уникальных коммитов\"\n\n";
  const second = await round(s, "", envelope([], final), results);
  const later = s.calls()[1];
  assert.equal(argvOf(later, "--model"), "claude-opus-5-5"); assert.equal(argvOf(later, "--resume"), first.sessionID); assert.equal(argvOf(later, "--tools"), "");
  assert.equal(later.task.includes("## Agent orders"), false); assert.equal(later.task.includes("CONSENT:"), false); assert.ok(later.task.includes(tool.trim().slice(1, 20)) || later.task.includes(JSON.stringify(tool).slice(1, 20)));
  const changes = JSON.parse(later.task.split("CAPABILITY_CHANGES:\n")[1].split("\n")[0]);
  assert.deepEqual(changes.added.map((c) => c.id), ["host.clock"]); assert.deepEqual(changes.removed, []); assert.deepEqual(changes.changed, []);
  assert.equal(second.profile, "coordinator"); assert.equal(second.resumedFromSession, first.sessionID);
  const published = JSON.parse(fs.readFileSync(s.mode().ordersPath, "utf8"));
  assert.deepEqual(Buffer.from(published.final_answer), Buffer.from(final)); assert.deepEqual(Buffer.from(s.mode().final_answer), Buffer.from(final));
  assert.equal(s.mode().lifecycle, "active"); assert.deepEqual(s.mode().consent, aged.consent);
  assert.deepEqual(s.mode().lineage.map((l) => l.parentSession), [null, first.sessionID]);
});

test("a failed activation stays failed and dispatches nothing, with no other model or host takeover; a retry under the same consent continues", async () => {
  const s = setup();
  const crashed = await launch(s, "Проверь ветки", envelope([], "x"), { FAKE_CLAUDE_MODE: "error" });
  assert.match(crashed.status, /^EXIT=1$/m);
  const r = s.run("finish"); assert.equal(r.status, 2);
  assert.match(r.stderr, /the coordinator round ended with exit 1.*; nothing was dispatched, and the mode keeps Claude Opus via Anthropic/);
  let m = s.mode();
  assert.equal(m.lifecycle, "failed"); assert.equal(m.currentReport, null); assert.equal(m.failures[0].report, crashed.reportPath);
  assert.equal(m.ordersPath, undefined); assert.equal(m.final_answer, undefined); assert.equal(m.lastCompletedReport, null);
  const swapped = await launch(s, "Проверь ветки", envelope([invoke]), { FAKE_CLAUDE_INIT: JSON.stringify({ model: "claude-sonnet-5-5" }), FAKE_CLAUDE_ASSISTANT_MODEL: "claude-sonnet-5-5" });
  assert.match(swapped.status, /^EXIT=0$/m);
  assert.match(s.run("finish").stderr, /answered as claude-sonnet-5-5, not the confirmed Claude Opus; nothing was dispatched/);
  m = s.mode(); assert.equal(m.lifecycle, "failed"); assert.deepEqual(m.requests, {}); assert.equal(m.failures.length, 2);
  const mixed = await launch(s, "Проверь ветки", envelope([invoke]), { FAKE_CLAUDE_ASSISTANT_MODEL: "claude-sonnet-5-5" });
  assert.match(mixed.status, /^EXIT=0$/m); assert.match(s.run("finish").stderr, /answered as claude-opus-5-5, claude-sonnet-5-5/);
  assert.ok(s.calls().every((c) => argvOf(c, "--model") === "opus"), "every launch asked for the confirmed model");
  await round(s, "Проверь ветки", envelope([], "ready"));
  m = s.mode(); assert.equal(m.lifecycle, "active"); assert.equal(m.effectiveModel, "claude-opus-5-5"); assert.equal(m.round, 4);
  const late = await launch(s, "next", envelope([], "x"), { FAKE_CLAUDE_MODE: "error" });
  assert.match(late.status, /^EXIT=1$/m); assert.equal(s.run("finish").status, 2);
  assert.equal(s.mode().lifecycle, "active", "a failed round after the activation keeps the mode");
  await round(s, "next", envelope([], "recovered"));
  assert.equal(s.mode().lineage.at(-1).parentSession, s.mode().lineage.at(-2).session);
});

test("a changed route or another host session stops the next launch before it starts", async () => {
  const s = setup(); await round(s, "start", envelope([], "ready"));
  const before = fs.readFileSync(s.modePath, "utf8"), launched = s.calls().length;
  fs.writeFileSync(s.message, "next");
  const prepare = (more) => s.run("prepare", ["--message-file", s.message, "--host-facts", s.facts], undefined, more);
  for (const [more, why] of [
    [{ FAKE_CLAUDE_API_PROVIDER: "bedrock" }, /route changed since the confirmation, from Anthropic to Amazon Bedrock: nothing was launched/],
    [{ ANTHROPIC_BASE_URL: "https://gateway.example" }, /from Anthropic to Anthropic \(ANTHROPIC_BASE_URL=https:\/\/gateway\.example\)/],
    [{ FAKE_CLAUDE_SIGNED_IN: "0" }, /route is signed-out; nothing was launched/],
    [{ CODEX_THREAD_ID: "another-thread" }, /consent was given in another host session: nothing was launched/],
  ]) { const r = prepare(more); assert.equal(r.status, 2); assert.match(r.stderr, why); }
  // A route set in a settings file Claude Code loads, the project's in the coordinator's directory or the user's, is
  // the route too (synthetic files only).
  const settings = (dir, url) => { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "settings.json"), JSON.stringify({ env: { ANTHROPIC_BASE_URL: url } })); };
  settings(path.join(s.work, ".claude"), "https://project.example/v1");
  assert.match(prepare({}).stderr, /names no provider for its route \(ANTHROPIC_BASE_URL \(project settings\) sets a base URL, and whether this run applies it is not measured/);
  fs.rmSync(path.join(s.work, ".claude"), { recursive: true });
  settings(s.env.CLAUDE_CONFIG_DIR, "https://user.example");
  assert.match(prepare({}).stderr, /ANTHROPIC_BASE_URL \(user settings\) sets a base URL/);
  fs.rmSync(s.env.CLAUDE_CONFIG_DIR, { recursive: true });
  // A path-routed gateway in this environment is another route than the confirmed one, whatever its origin.
  assert.match(prepare({ ANTHROPIC_BASE_URL: "https://gw.example/team-a" }).stderr, /ANTHROPIC_BASE_URL=https:\/\/gw\.example\/team-a/);
  assert.equal(fs.readFileSync(s.modePath, "utf8"), before); assert.equal(s.calls().length, launched);
  assert.equal(fs.existsSync(path.join(s.state, "round-2")), false);
});

test("a prepared round is admitted again right before the coordinator starts: after an end, a switch, another session or route, nothing is sent", async () => {
  const cases = [
    ["ended", (s) => s.ok("end"), {}, /mode ended at .*: delegation has stopped and nothing was launched/],
    ["session", () => {}, { CODEX_THREAD_ID: "another-thread" }, /consent was given in another host session: nothing was launched/],
    ["route", () => {}, { FAKE_CLAUDE_API_PROVIDER: "bedrock" }, /route changed since the confirmation, from Anthropic to Amazon Bedrock: nothing was launched/],
    ["replaced", (s) => {
      const next = path.join(s.dir, "next"), env = Object.fromEntries(Object.entries({ ...baseEnv(), ...s.env, ENTRUST_STATE_DIR: next }).filter(([, v]) => v !== undefined));
      const p = JSON.parse(spawnSync(process.execPath, [HELPER, "propose", "--state", next, "--adapter", "claude", "--model", "sonnet", "--cwd", s.work, "--catalogue", s.cat, "--language", "ru", "--replaces", s.state], { encoding: "utf8", env }).stdout);
      assert.equal(spawnSync(process.execPath, [HELPER, "confirm", "--state", next, "--pending", p.pending, "--source", "user-choice", "--answer-file", "-"], { encoding: "utf8", input: YES, env }).status, 0);
    }, {}, /mode ended at/],
  ];
  for (const [name, between, at, why] of cases) {
    const s = setup(); await round(s, "start", envelope([], "ready"));
    fs.writeFileSync(s.message, "секретный рабочий контекст"); s.ok("prepare", ["--message-file", s.message, "--host-facts", s.facts]);
    const reportPath = s.mode().currentReport, sent = s.calls().length;
    between(s);
    const r = await spawnNode([ENTRY, "--run", "--watch", "--report-file", reportPath], { env: { ...s.env, ...at, FAKE_CLAUDE_OUTPUT: JSON.stringify(envelope([], "x")) }, killAfterMs: 30000 }).done;
    assert.equal(r.code, 0, r.out + r.err); assert.match(r.out, /^EXIT=2$/m, `${name}: ${r.out}`);
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    assert.match(report.error, why, name); assert.equal(s.calls().length, sent, `${name}: the provider was called`);
    assert.equal(s.calls().some((c) => c.task.includes("секретный рабочий контекст")), false, name);
  }
});

test("images in native results reach the coordinator as image blocks while RESULTS, text, arguments and outcomeJson stay exactly as recorded", async () => {
  const s = setup(); await round(s, "look", envelope([invoke, { ...invoke, id: "j" }, { ...invoke, id: "k" }]));
  s.begin("i", "j", "k");
  const png = Buffer.from("89504e470d0a1a0a0000000d49484452000000030000000108020000009497b31b", "hex").toString("base64");
  const jpeg = Buffer.from("ffd8ffe000104a46494600010100000100010000ffd9", "hex").toString("base64");
  // The ordinary text and a request argument hold the same characters as the image, with CRLF and trailing spaces.
  const evidence = `Exact base64 evidence: ${png}\r\n  `;
  const mcp = JSON.stringify({ content: [ { type: "text", text: evidence }, { type: "image", data: png, mimeType: "image/png" } ], isError: false }, null, 2) + "\n  \n";
  const dataUrl = `{ "type": "input_image", "image_url": "data:image/jpeg;base64,${jpeg}" }\n`;
  const svg = `{ "content": [ { "type": "image", "data": "PHN2Zz48L3N2Zz4=", "mimeType": "image/svg+xml" } ] }\n`;
  s.ok("record", ["--request-id", "i", "--outcome-json", "-"], mcp); s.ok("record", ["--request-id", "j", "--outcome-json", "-"], dataUrl);
  s.ok("record", ["--request-id", "k", "--outcome-json", "-"], svg);
  const saved = JSON.parse(s.ok("results")); saved.REQUEST_RESULTS.find((r) => r.id === "i").request.arguments = { expected: png };
  const results = path.join(s.dir, "results.json"); fs.writeFileSync(results, JSON.stringify(saved));
  await round(s, "что на картинках?", envelope([], "Жёлтый, фиолетовый, бирюзовый."), results);
  const call = s.calls().at(-1), digest = (b64) => crypto.createHash("sha256").update(Buffer.from(b64, "base64")).digest("hex");
  assert.ok(call.argv.includes("--input-format") && argvOf(call, "--input-format") === "stream-json");
  assert.deepEqual(call.images, [{ media_type: "image/png", sha256: digest(png) }, { media_type: "image/jpeg", sha256: digest(jpeg) }]);
  assert.equal(call.firstBlock, "image");
  assert.match(call.task, /IMAGES: 2 attached to this message as image blocks/);
  const delivered = JSON.parse(call.task.split("RESULTS:\n")[1].split("\nUSER_MESSAGE")[0]);
  assert.deepEqual(delivered, saved, "RESULTS is delivered whole and unchanged");
  const i = delivered.REQUEST_RESULTS.find((r) => r.id === "i");
  assert.equal(i.outcomeJson, mcp); assert.equal(i.outcome.content[0].text, evidence); assert.equal(i.request.arguments.expected, png);
  assert.equal(delivered.REQUEST_RESULTS.find((r) => r.id === "j").outcomeJson, dataUrl);
  assert.ok(call.task.includes("PHN2Zz48L3N2Zz4="), "an image type the CLI does not take stays as text");
  assert.equal(s.mode().requests.i.outcomeJson, mcp);
  const blocks = JSON.parse(fs.readFileSync(path.join(s.state, "round-2", "attachments.json"), "utf8"));
  assert.deepEqual(blocks.map((b) => b.source.data), [png, jpeg]);
});

test("a platform refusal returns to the coordinator with its id and text, unretried; end stops further dispatch", async () => {
  const s = setup(); await round(s, "start", envelope([invoke, { ...invoke, id: "j" }, { ...invoke, id: "k" }]));
  const refusal = ' { "status": "refused", "error": "rejected by the platform reviewer: \\"escalation denied\\"" }\n';
  assert.match(s.run("record", ["--request-id", "i", "--outcome-json", "-"], refusal).stderr, /no pending request: i/, "an order is begun before its outcome is recorded");
  s.begin("i", "j", "k");
  s.ok("record", ["--request-id", "i", "--outcome-json", "-"], refusal);
  s.ok("record", ["--request-id", "j", "--outcome-json", "-"], '{"content":"ok"}');
  assert.match(s.run("record", ["--request-id", "i", "--outcome-json", "-"], '{"content":"retried"}').stderr, /no pending request: i/);
  fs.writeFileSync(s.message, "x");
  assert.match(s.run("prepare", ["--message-file", s.message, "--host-facts", s.facts]).stderr, /record every dispatched outcome/);
  s.ok("record", ["--request-id", "k", "--outcome-json", "-"], '{"status":"unknown","note":"transport lost"}');
  const results = path.join(s.dir, "results.json"); fs.writeFileSync(results, s.ok("results"));
  assert.equal(JSON.parse(fs.readFileSync(results, "utf8")).REQUEST_RESULTS.find((r) => r.id === "i").outcomeJson, refusal);
  await round(s, "", envelope([], "Отказ платформы получен; продолжаю разрешённое."), results);
  assert.ok(s.calls()[1].task.includes(JSON.stringify(refusal).slice(1, -1).slice(0, 40)));
  assert.equal(s.calls().length, 2); assert.ok(s.calls().every((c) => argvOf(c, "--model") !== "sonnet"));
  s.ok("end");
  const ended = JSON.parse(s.ok("status")); assert.equal(ended.lifecycle, "ended"); assert.equal(ended.justification, null);
  assert.match(s.run("prepare", ["--message-file", s.message, "--host-facts", s.facts]).stderr, /ended at .*: delegation has stopped/);
  assert.match(s.run("end").stderr, /already ended/);
});

test("end belongs to the mode's host session; a legacy mode, which records none, ends without any identity", async () => {
  const s = setup(); await round(s, "start", envelope([invoke]));
  const before = fs.readFileSync(s.modePath, "utf8");
  const foreign = s.run("end", [], undefined, { CODEX_THREAD_ID: "host-B" });
  assert.equal(foreign.status, 2); assert.match(foreign.stderr, /another host session; only that session ends this mode/);
  assert.equal(fs.readFileSync(s.modePath, "utf8"), before, "a refused end changes nothing, published orders included");
  assert.equal(s.mode().requests.i.state, "published");
  s.ok("end"); assert.equal(s.mode().lifecycle, "ended");
  const legacy = setup({ legacy: true }), bare = { CODEX_THREAD_ID: undefined, CLAUDE_CODE_SESSION_ID: undefined };
  legacy.ok("end", [], undefined, bare); assert.equal(legacy.mode().lifecycle, "ended");
});

test("a round is claimed durably at admission: once, before the CLI starts; an end before refuses it, an end after finds it in flight", async () => {
  const admit = (s, report, extra = {}) => spawnSync(process.execPath, ["--input-type=module", "-e",
    `import { admitRound } from ${JSON.stringify(pathToFileURL(HELPER).href)}; process.stdout.write(JSON.stringify(admitRound(${JSON.stringify(report)}, 4242)));`],
    { encoding: "utf8", env: Object.fromEntries(Object.entries({ ...baseEnv(), ...s.env, ...extra }).filter(([, v]) => v !== undefined)) });
  const s = setup(); fs.writeFileSync(s.message, "x"); s.ok("prepare", ["--message-file", s.message, "--host-facts", s.facts]);
  const report = s.mode().currentReport;
  assert.equal(s.mode().launch ?? null, null, "prepare claims nothing");
  assert.equal(JSON.parse(admit(s, report).stdout), null);
  const claim = s.mode().launch; assert.equal(claim.report, path.join(fs.realpathSync(path.dirname(report)), "report.json")); assert.equal(claim.pid, 4242); assert.ok(claim.at);
  assert.equal(JSON.parse(s.ok("status")).launch.pid, 4242);
  assert.match(JSON.parse(admit(s, report).stdout), /already started at .*: its context is not sent twice/);
  assert.deepEqual(s.mode().launch, claim, "a refused second admission leaves the first claim");
  // An end before the claim refuses the round.
  const early = setup(); fs.writeFileSync(early.message, "x"); early.ok("prepare", ["--message-file", early.message, "--host-facts", early.facts]);
  early.ok("end"); assert.match(JSON.parse(admit(early, early.mode().currentReport).stdout), /mode ended at/); assert.equal(early.mode().launch ?? null, null);
  // An end after the claim, at the moment the real driver opens its transcript: the round is in flight and finishes, and
  // the ended mode publishes none of its orders; the driver run again on the report sends nothing.
  const seam = setup(); fs.writeFileSync(seam.message, "секретный контекст"); seam.ok("prepare", ["--message-file", seam.message, "--host-facts", seam.facts]);
  const reportPath = seam.mode().currentReport, preload = path.join(seam.dir, "end-at-transcript.cjs"), endOut = path.join(seam.dir, "end.out");
  fs.writeFileSync(preload, `const cp=require('node:child_process'),fs=require('node:fs'),open=fs.openSync;
fs.openSync=function(p,...a){if(String(p).endsWith('.transcript.jsonl')&&process.env.END_AT_TRANSCRIPT&&!fs.existsSync(process.env.END_OUT)){const r=cp.spawnSync(process.execPath,JSON.parse(process.env.END_AT_TRANSCRIPT),{env:{...process.env,NODE_OPTIONS:''}});
fs.writeFileSync(process.env.END_OUT,JSON.stringify({status:r.status,claimed:Boolean(JSON.parse(fs.readFileSync(process.env.MODE_PATH,'utf8')).launch)}));}return open.call(this,p,...a);};`);
  const run = await spawnNode([ENTRY, "--run", "--watch", "--report-file", reportPath], { env: { ...seam.env, FAKE_CLAUDE_OUTPUT: JSON.stringify(envelope([invoke])), NODE_OPTIONS: `--require=${preload}`,
    END_AT_TRANSCRIPT: JSON.stringify([HELPER, "end", "--state", seam.state]), END_OUT: endOut, MODE_PATH: seam.modePath }, killAfterMs: 30000 }).done;
  assert.equal(run.code, 0, run.out + run.err);
  assert.deepEqual(JSON.parse(fs.readFileSync(endOut, "utf8")), { status: 0, claimed: true }, "the claim was durable before the end ran, and the end succeeded");
  assert.equal(seam.calls().length, 1, "the claimed round was sent once"); assert.equal(seam.mode().lifecycle, "ended");
  assert.match(seam.run("finish").stderr, /ended at .*: its round publishes no orders/);
  assert.deepEqual(seam.mode().requests, {}); assert.equal(seam.mode().ordersPath, undefined);
  const again = await spawnNode([ENTRY, "--run", "--watch", "--report-file", reportPath], { env: seam.env, killAfterMs: 30000 }).done;
  assert.equal(seam.calls().length, 1, "nothing is sent again: " + again.out);
});

test("a claimed round whose driver died is closed by finish and restarted by prepare under the same consent, never claimed twice", async () => {
  const s = setup(); fs.writeFileSync(s.message, "start"); s.ok("prepare", ["--message-file", s.message, "--host-facts", s.facts]);
  const dead = spawnSync(process.execPath, ["-e", "process.stdout.write(String(process.pid))"], { encoding: "utf8" }), pid = Number(dead.stdout);
  const m = s.mode(); fs.writeFileSync(m.currentReport, JSON.stringify({ adapter: "claude", ok: false, status: "starting", pid }));
  m.launch = { report: fs.realpathSync(m.currentReport), pid, at: new Date().toISOString() }; fs.writeFileSync(s.modePath, JSON.stringify(m));
  const r = s.run("finish"); assert.equal(r.status, 2); assert.match(r.stderr, /driver of this round died without a report; nothing was dispatched, and the mode keeps Claude Opus via Anthropic/);
  const after = s.mode(); assert.equal(after.lifecycle, "failed"); assert.equal(after.currentReport, null); assert.match(after.failures[0].error, /whether the coordinator received its context is unknown/);
  assert.deepEqual(after.consent, m.consent, "the same consent");
  await round(s, "start", envelope([], "ready"));
  assert.equal(s.mode().lifecycle, "active"); assert.equal(s.mode().round, 2); assert.notEqual(s.mode().launch.report, m.launch.report);
});

test("a switch interrupted after the new consent is saved is finished by ending the new mode, and a confirm repeated after that changes nothing", async () => {
  const fresh = (name) => path.join(tempDir("entrust-switch-"), name);
  const old = setup(); await round(old, "start", envelope([], "ready"));
  const target = fresh("b"), preload = path.join(old.dir, "fail-once.cjs"), marker = path.join(old.dir, "failed-once");
  fs.writeFileSync(preload, `const fs=require('node:fs'),rename=fs.renameSync;fs.renameSync=function(a,b){if(String(b)===${JSON.stringify(old.modePath)}&&!fs.existsSync(${JSON.stringify(marker)})){fs.writeFileSync(${JSON.stringify(marker)},'1');throw Object.assign(new Error('injected write failure'),{code:'EIO'});}return rename.call(this,a,b);};`);
  const helper = (args, input, more = {}) => spawnSync(process.execPath, [HELPER, ...args], { encoding: "utf8", input,
    env: Object.fromEntries(Object.entries({ ...baseEnv(), ...old.env, ENTRUST_STATE_DIR: target, ...more }).filter(([, v]) => v !== undefined)) });
  const q = JSON.parse(helper(["propose", "--state", target, "--adapter", "claude", "--model", "sonnet", "--cwd", old.work, "--catalogue", old.cat, "--language", "ru", "--replaces", old.state]).stdout);
  const crashed = helper(["confirm", "--state", target, "--pending", q.pending, "--source", "user-message", "--answer-file", "-"], "Да, переключай.", { NODE_OPTIONS: `--require=${preload}` });
  assert.equal(crashed.status, 2); assert.equal(old.mode().lifecycle, "active");
  const targetMode = path.join(target, "mode.json"), consent = JSON.parse(fs.readFileSync(targetMode, "utf8")).consent;
  assert.equal(consent.answer, "Да, переключай.");
  // The user ends the new mode before any retry: ending finishes the switch first, so no replaced mode keeps running.
  assert.equal(helper(["end", "--state", target]).status, 0);
  assert.equal(old.mode().lifecycle, "ended"); assert.equal(old.mode().replacedBy, fs.realpathSync(target));
  const bytes = [fs.readFileSync(old.modePath, "utf8"), fs.readFileSync(targetMode, "utf8")];
  const retry = helper(["confirm", "--state", target, "--pending", q.pending, "--source", "user-message", "--answer-file", "-"], "что угодно");
  assert.equal(retry.status, 0, retry.stderr); assert.deepEqual(JSON.parse(retry.stdout), consent, "the receipt is the original consent");
  assert.deepEqual([fs.readFileSync(old.modePath, "utf8"), fs.readFileSync(targetMode, "utf8")], bytes, "no side effect, no new consent, no reactivation");
  assert.equal(JSON.parse(fs.readFileSync(targetMode, "utf8")).lifecycle, "ended"); assert.equal(old.calls().filter((c) => argvOf(c, "--model") === "sonnet").length, 0);
});

test("finish refuses a coordinator round whose plugins the driver did not prove built-in, or did not classify, and keeps the coordinator", () => {
  for (const [label, installed, why] of [["installed plugin", ["user-plugin"], /not proven platform built-ins: \["user-plugin"\]/], ["no classification (an older driver)", undefined, /not proven platform built-ins: "no classification"/]]) {
    const s = setup(); readyFinish(s, [invoke]);
    const m = s.mode(), r = JSON.parse(fs.readFileSync(m.currentReport, "utf8"));
    if (installed === undefined) delete r.context.installedPlugins; else r.context.installedPlugins = installed;
    fs.writeFileSync(m.currentReport, JSON.stringify(r));
    const out = s.run("finish"); assert.equal(out.status, 2, label); assert.match(out.stderr, why, label);
    assert.match(out.stderr, /nothing was dispatched, and the mode keeps Claude Opus via Anthropic/);
    const after = s.mode(); assert.deepEqual(after.requests, {}); assert.equal(after.currentReport, null); assert.equal(after.consent.display, "Claude Opus");
  }
  const s = setup(); readyFinish(s, [invoke]); s.ok("finish"); assert.equal(s.mode().lifecycle, "active", "built-in or no plugins: the round publishes");
});

test("a generic application/octet-stream data URL is an image only by its own signature, and the native result stays exactly as recorded", async () => {
  const s = setup(); await round(s, "look", envelope([invoke, { ...invoke, id: "j" }, { ...invoke, id: "k" }, { ...invoke, id: "l" }]));
  s.begin("i", "j", "k", "l");
  const b64 = (hex, pad = 0) => Buffer.concat([Buffer.from(hex, "hex"), Buffer.alloc(pad, 7)]).toString("base64");
  const png = b64("89504e470d0a1a0a0000000d49484452000000030000000108020000009497b31b"), jpeg = b64("ffd8ffe000104a46494600010100000100010000ffd9");
  const gif = b64("474946383961010001000000002c00000000010001000002024401003b"), webp = b64("52494646240000005745425056503820180000003001009d012a0100010002003425a400"), junk = b64("0001020304050607080910111213", 4);
  const octet = (b) => `data:application/octet-stream;base64,${b}`;
  // view_image's actual shape, with the same base64 also in ordinary text, with CRLF and trailing spaces.
  const outcomes = {
    i: JSON.stringify({ image_url: octet(png), note: `same bytes as text: ${png}\r\n  ` }) + "\n",
    j: JSON.stringify({ image_url: octet(jpeg) }) + "\n",
    k: JSON.stringify({ content: [{ type: "image", data: gif, mimeType: "application/octet-stream" }, { image_url: octet(webp) }] }) + "\n",
    l: JSON.stringify({ image_url: octet(junk), also: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=", plain: png.slice(0, 40) }) + "\n",
  };
  for (const [id, text] of Object.entries(outcomes)) s.ok("record", ["--request-id", id, "--outcome-json", "-"], text);
  const saved = JSON.parse(s.ok("results")); saved.REQUEST_RESULTS.find((r) => r.id === "i").request.arguments = { expected: png };
  const results = path.join(s.dir, "results.json"); fs.writeFileSync(results, JSON.stringify(saved));
  await round(s, "что на картинках?", envelope([], "ok"), results);
  const call = s.calls().at(-1), digest = (b) => crypto.createHash("sha256").update(Buffer.from(b, "base64")).digest("hex");
  assert.deepEqual(call.images, [{ media_type: "image/png", sha256: digest(png) }, { media_type: "image/jpeg", sha256: digest(jpeg) },
    { media_type: "image/gif", sha256: digest(gif) }, { media_type: "image/webp", sha256: digest(webp) }], "four rasters by signature, junk and SVG not");
  const delivered = JSON.parse(call.task.split("RESULTS:\n")[1].split("\nUSER_MESSAGE")[0]);
  assert.deepEqual(delivered, saved, "RESULTS is delivered whole");
  for (const [id, text] of Object.entries(outcomes)) assert.equal(delivered.REQUEST_RESULTS.find((r) => r.id === id).outcomeJson, text, id);
  assert.equal(delivered.REQUEST_RESULTS.find((r) => r.id === "i").request.arguments.expected, png);
  const blocks = JSON.parse(fs.readFileSync(path.join(s.state, "round-2", "attachments.json"), "utf8"));
  assert.deepEqual(blocks.map((b) => b.source.data), [png, jpeg, gif, webp]);
});

test("ordinary base64 text and a mislabelled non-image are never made into images", async () => {
  const s = setup(); await round(s, "look", envelope([invoke])); s.begin("i");
  const text = Buffer.from("just some ordinary text that is base64 encoded").toString("base64");
  s.ok("record", ["--request-id", "i", "--outcome-json", "-"], JSON.stringify({ stdout: text, image_url: `data:application/octet-stream;base64,${text}`, odd: "data:application/octet-stream;base64,@@@@" }));
  const results = path.join(s.dir, "plain.json"); fs.writeFileSync(results, s.ok("results"));
  await round(s, "x", envelope([], "ok"), results);
  const call = s.calls().at(-1);
  assert.deepEqual(call.images, []); assert.equal(call.firstBlock, null); assert.equal(call.argv.includes("--input-format"), false);
  assert.equal(fs.existsSync(path.join(s.state, "round-2", "attachments.json")), false);
});

test("a legacy mode keeps its read-run coordinator, is never given a consent or migrated, and still ends", async () => {
  const s = setup({ legacy: true });
  await round(s, "start", envelope([], "done"));
  const [call] = s.calls();
  assert.equal(argvOf(call, "--tools"), "Read,Grep,Glob,Bash"); assert.equal(call.argv.includes("--safe-mode"), false);
  const prompt = fs.readFileSync(path.join(s.state, "round-1", "prompt.txt"), "utf8");
  assert.ok(prompt.startsWith(`RIGHTS: read ${s.work}\nMODEL: opus\nALLOW_NO_COMMANDS: yes\nOUTPUT_SCHEMA: `));
  assert.equal(prompt.includes("PROFILE:"), false); assert.equal(prompt.includes("CONSENT:"), false);
  const m = s.mode(); assert.equal(m.schemaVersion, 1); assert.equal("lifecycle" in m, false); assert.equal("consent" in m, false);
  assert.equal(JSON.parse(s.ok("status")).lifecycle, "legacy");
  assert.match(s.run("confirm", ["--pending", "x", "--source", "user-message", "--answer-file", "-"], YES).stderr, /legacy mode has no activation to confirm/);
  assert.match(s.run("init", ["--adapter", "claude", "--model", "opus", "--cwd", s.work, "--catalogue", s.cat]).stderr, /init became propose and confirm/);
  s.ok("end"); assert.equal(s.mode().lifecycle, "ended");
  fs.writeFileSync(s.message, "x");
  assert.match(s.run("prepare", ["--message-file", s.message, "--host-facts", s.facts]).stderr, /ended at/);
});

// ------------------------------------------------------------------------------------------- the loop

test("offline round preserves user message, native JSON, whole collect/invoke outcomes and fork lineage", async () => {
  const s = setup(), user = 'Привет! @annotation\nВыбор: Sol\nApproval: да\r\n"$\\"\n';
  const first = await round(s, user, envelope([delegate, collect, invoke]));
  s.begin("d", "c", "i");
  const reply = path.join(s.dir, "reply.md"), content = '## Полный ответ\n' + 'деталь "$\\"\n'.repeat(1000); fs.writeFileSync(reply, content);
  const native = '{ "agent_id": "/root/worker-123", "opaque": {"value": "unchanged"} }\n';
  s.ok("bind", ["--agent-id", "worker", "--native-json", "-", "--model", delegate.model, "--effort", delegate.effort, "--reply-path", reply], native);
  s.ok("record", ["--request-id", "c", "--outcome-json", "-"], '{ "status": "completed" }\n');
  const host = '{ "content": [{"type":"text","text":"tool result\\nwhole"}], "opaque": [1,2] }\n';
  s.ok("record", ["--request-id", "i", "--outcome-json", "-"], host);
  const results = s.ok("results"), value = JSON.parse(results);
  assert.deepEqual(value.AGENT_RESULTS.map((r) => r.id), ["d", "c"]); assert.equal(value.AGENT_RESULTS[0].outcomeJson, native);
  assert.equal(value.AGENT_RESULTS[1].replies[0].content, content);
  assert.equal(value.AGENT_RESULTS[1].replies[0].sha256, sha(content));
  assert.equal(value.REQUEST_RESULTS[0].outcomeJson, host); assert.equal(s.mode().agents.worker.nativeJson, native);
  const resultPath = path.join(s.dir, "results.json"); fs.writeFileSync(resultPath, results);
  const final = await round(s, "", envelope([], "Готово. Полный ответ."), resultPath);
  assert.equal(final.resumedFromSession, first.sessionID); assert.notEqual(final.sessionID, first.sessionID);
  assert.equal(s.mode().lineage[1].parentSession, first.sessionID); assert.equal(s.mode().lineage[1].evidence, "report-link");
  const calls = s.calls();
  assert.ok(calls[0].task.endsWith(`USER_MESSAGE (verbatim text encoded as a JSON string):\n${JSON.stringify(user)}`)); assert.ok(calls[0].task.includes("## Agent orders"));
  assert.ok(calls[1].task.includes(results)); assert.ok(calls[0].task.includes('"runtimeAvailable":true'));
});
test("terminal delegates deliver complete replies without collect into the next prompt", async () => {
  const s = setup(), second = { ...delegate, id: "e", agent_id: "second" };
  await round(s, "start", envelope([delegate, second, invoke]));
  s.begin("d", "e", "i");
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
    assert.equal(delivered.sha256, sha(bytes));
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
    assert.equal(result.replies[0].sha256, sha(bytes));
  }
  assert.equal(forwarded.REQUEST_RESULTS[0].outcomeJson, tool);
});

test("spawn records do not read replies; terminal bind and continue publish once with delivery errors", async () => {
  const s = setup(), missing = path.join(s.dir, "missing.md");
  await round(s, "start", envelope([delegate]));
  s.begin("d");
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
  s.begin("next");
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
  const terminal = setup(); readyFinish(terminal, [delegate]); terminal.ok("finish"); terminal.begin("d");
  const reply = path.join(terminal.dir, "reply.md"); fs.writeFileSync(reply, "terminal bind reply");
  terminal.ok("bind", ["--agent-id", "worker", "--native-json", "-", "--model", delegate.model, "--effort", delegate.effort, "--reply-path", reply], '{ "agent_id":"native", "status":"completed" }\n');
  assert.equal(terminal.mode().requests.d.replies[0].content, "terminal bind reply");
});

test("unbound worker refusals preserve raw outcomes and permit the next prepare", async () => {
  const s = setup(), workers = [delegate, { ...delegate, id: "unsupported", agent_id: "unsupported" }, { ...delegate, id: "error", agent_id: "error" }];
  await round(s, "start", envelope(workers));
  s.begin(...workers.map((w) => w.id));
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
  const s = setup(); await round(s, "start", envelope([delegate])); s.begin("d");
  assert.match(s.run("record", ["--request-id", "d", "--outcome-json", "-"], '{"status":"completed"}').stderr, /completed worker outcome requires a binding/);
  assert.equal(s.mode().requests.d.state, "dispatched_outcome_unknown");
  s.ok("record", ["--request-id", "d", "--outcome-json", "-"], '{"status":"refused"}');
  const mode = s.mode(); mode.agents.worker = { native_agent: "old-native", replyPath: path.join(s.dir, "old-missing.md"), model: delegate.model, effort: delegate.effort };
  fs.writeFileSync(s.modePath, JSON.stringify(mode));
  const follow = { id: "next", action: "continue", agent_id: "worker", task: "Follow up" };
  await round(s, "follow up", envelope([follow])); s.begin("next");
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
});
test("a runtime schema outside the local subset keeps its capability, and its arguments go to the host's own validation", () => {
  // As MCP servers and zod- or pydantic-generated tools publish them.
  const real = { $schema: "https://json-schema.org/draft/2020-12/schema", type: "object", additionalProperties: { type: "string" },
    properties: { limit: { type: "integer", exclusiveMinimum: 0 }, url: { type: "string", format: "uri" }, options: { $ref: "#/$defs/Options" } },
    patternProperties: { "^x-": { type: "string" } }, required: ["url"], $defs: { Options: { type: "object" } } };
  const dir = tempDir("entrust-catalogue-real-"), from = path.join(dir, "tools.json"), out = path.join(dir, "catalogue.json");
  fs.writeFileSync(from, JSON.stringify([{ name: "mcp__server__fetch", description: "Fetch a URL", parameters: real }, { name: "undescribed" }]));
  const made = spawnSync(process.execPath, [HELPER, "catalogue", "--from", from, "--out", out, "--proxy-model", "gpt-6-luna", "--coordinator-model", "opus", "--worker-models", "[]"], { encoding: "utf8" });
  assert.equal(made.status, 0, made.stderr);
  const cat = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.deepEqual(cat.capabilities[0].argumentsSchema, real); assert.equal(cat.capabilities[1].description, "");
  const call = { id: "f", action: "invoke", capability: "mcp__server__fetch", arguments: { limit: 0, "x-trace": "1" }, purpose: "fetch" };
  assert.equal(readAgentOrders(report(envelope([call])), { external_session: "session", agents: {} }, cat).requests.length, 1);
  assert.equal(readAgentOrders(report(envelope([invoke])), { external_session: "session", agents: {} }, { ...catalogue(), capabilities: [{ ...catalogue().capabilities[0], argumentsSchema: { not: {} } }] }).requests.length, 1);
  assert.throws(() => readAgentOrders(report(envelope([{ ...invoke, arguments: {} }])), { external_session: "session", agents: {} }, catalogue()), /missing required path/);
  // A JSON value's members in another order are the same value, as JSON Schema's enum means it.
  const enumCat = { ...catalogue(), capabilities: [{ id: "native.enum", kind: "tool", description: "", authority: "host",
    argumentsSchema: { type: "object", properties: { value: { enum: [{ a: 1, b: [2, { c: 3, d: 4 }] }] } }, required: ["value"] } }] };
  const enumCall = (value) => report(envelope([{ id: "e", action: "invoke", capability: "native.enum", arguments: { value }, purpose: "p" }]));
  assert.equal(readAgentOrders(enumCall({ b: [2, { d: 4, c: 3 }], a: 1 }), { external_session: "session", agents: {} }, enumCat).requests.length, 1);
  for (const value of [{ a: 1 }, { a: 1, b: [{ c: 3, d: 4 }, 2] }, { a: 1, b: [2, { c: 3, d: 4 }], x: 0 }])
    assert.throws(() => readAgentOrders(enumCall(value), { external_session: "session", agents: {} }, enumCat), /not one of the permitted values/, JSON.stringify(value));
});
test("pending outcomes block continuation; missing reply files produce delivery_error", async () => {
  const s = setup(); await round(s, "start", envelope([delegate, collect]));
  assert.match(s.run("prepare", ["--message-file", s.message, "--host-facts", s.facts]).stderr, /record every dispatched outcome/);
  s.begin("d", "c");
  assert.match(s.run("prepare", ["--message-file", s.message, "--host-facts", s.facts]).stderr, /record every dispatched outcome/);
  s.ok("bind", ["--agent-id", "worker", "--native-json", "-", "--model", delegate.model, "--effort", delegate.effort, "--reply-path", path.join(s.dir, "missing.md")], '{"agent_id":"native"}');
  s.ok("record", ["--request-id", "c", "--outcome-json", "-"], '{"status":"completed"}');
  assert.match(JSON.parse(s.ok("results")).AGENT_RESULTS[1].replies[0].delivery_error, /ENOENT/);
  assert.match(s.run("record", ["--request-id", "c", "--outcome-json", "-"], '{}').stderr, /no pending request/);
});
test("invalid finish and wrong worker model preserve the saved dispatch state", async () => {
  const s = setup(); await round(s, "start", envelope([delegate])); s.begin("d");
  assert.match(s.run("bind", ["--agent-id", "worker", "--native-json", "-", "--model", "gpt-6-luna", "--effort", "medium", "--reply-path", "/tmp/reply"], '{"agent_id":"native"}').stderr, /differs from the order/);
  assert.deepEqual(s.mode().agents, {}); assert.equal(s.mode().requests.d.state, "dispatched_outcome_unknown");
  const fresh = setup({ legacy: true }); fs.writeFileSync(fresh.message, "start"); fresh.ok("prepare", ["--message-file", fresh.message, "--host-facts", fresh.facts]);
  const before = fs.readFileSync(fresh.modePath, "utf8");
  fs.writeFileSync(fresh.mode().currentReport, JSON.stringify({ ...report(envelope([], "done")), exitCode: 13, outputSchemaOk: false }));
  assert.match(fresh.run("finish").stderr, /not terminal, valid and attributed/);
  assert.equal(fs.readFileSync(fresh.modePath, "utf8"), before);
  const running = setup(); fs.writeFileSync(running.message, "start"); running.ok("prepare", ["--message-file", running.message, "--host-facts", running.facts]);
  const pending = fs.readFileSync(running.modePath, "utf8");
  fs.writeFileSync(running.mode().currentReport, JSON.stringify({ adapter: "claude", ok: false, status: "starting", pid: process.pid }));
  assert.match(running.run("finish").stderr, /not terminal, valid and attributed/);
  assert.equal(fs.readFileSync(running.modePath, "utf8"), pending, "a round still running is not closed as failed");
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
  assert.equal(s.mode().lifecycle, "active", "a rejected batch is still a running coordinator");
  const results = s.ok("results"), value = JSON.parse(results);
  assert.equal(value.REQUEST_RESULTS[0].id, "i"); assert.equal(value.REQUEST_RESULTS[0].outcome.status, "unsupported");
  assert.equal(value.AGENT_RESULTS[0].id, "d"); assert.equal(value.AGENT_RESULTS[0].rejected, true);
  const resultPath = path.join(s.dir, "rejections.json"); fs.writeFileSync(resultPath, results);
  const final = await round(s, "", envelope([], "Capability unavailable."), resultPath);
  assert.equal(final.resumedFromSession, first.sessionID);
});
test("propose refuses a checkout state directory and a mismatched model-family adapter", () => {
  const s = setup({ confirmed: false });
  const run = (state, adapter) => spawnSync(process.execPath, [HELPER, "propose", "--state", state, "--adapter", adapter, "--model", "opus", "--cwd", ROOT, "--catalogue", s.cat, "--language", "ru"],
    { encoding: "utf8", env: { ...baseEnv(), ...s.env } });
  assert.match(run(path.join(ROOT, "forbidden-state"), "claude").stderr, /outside the checkout/);
  assert.match(run(path.join(s.dir, "wrong"), "opencode").stderr, /requires adapter claude/);
  assert.equal(fs.existsSync(path.join(ROOT, "forbidden-state")), false);
});

// A coordinator's report as the driver writes one, for cases about finish alone.
function readyFinish(s, requests) {
  const mode = s.mode(), reportPath = path.join(s.state, "fixture-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ ...report(envelope(requests)), adapter: "claude", cwd: mode.cwd, requestedModel: "opus", exitCode: 0,
    profile: "coordinator", model: "claude-opus-5-5", assistantModels: ["claude-opus-5-5"], tools: [{ tool: "StructuredOutput", isError: false }],
    context: { tools: ["StructuredOutput"], installedPlugins: [] } }));
  fs.writeFileSync(s.modePath, JSON.stringify({ ...mode, currentReport: reportPath }));
}
function barrier(s, command, args = [], crash = false) {
  const preload = path.join(s.dir, `barrier-${Math.random()}.cjs`), ready = preload + ".ready", go = preload + ".go", contended = preload + ".contended";
  fs.writeFileSync(preload, `const fs=require('node:fs');
const read=fs.readFileSync,open=fs.openSync,write=fs.writeSync;
fs.readFileSync=function(p,...a){const v=read.call(this,p,...a);if(String(p)===process.env.PAUSE_MODE&&process.env.PAUSE_READY){fs.writeFileSync(process.env.PAUSE_READY,'ready');while(!fs.existsSync(process.env.PAUSE_GO))Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,5);}return v;};
fs.openSync=function(p,...a){try{return open.call(this,p,...a);}catch(e){if(e.code==='EEXIST'&&String(p).endsWith('/state.lock')&&process.env.CONTENDED)fs.writeFileSync(process.env.CONTENDED,'contended');throw e;}};
fs.writeSync=function(fd,...a){if(fd===1&&process.env.CRASH_STDOUT)throw Error('simulated stdout crash');return write.call(this,fd,...a);};`);
  const launch = (paused) => spawnNode(["--require", preload, HELPER, command, "--state", s.state, ...args], {
    env: { ...s.env, PAUSE_MODE: s.modePath, ...(paused ? { PAUSE_READY: ready, PAUSE_GO: go } : { CONTENDED: contended }), ...(crash ? { CRASH_STDOUT: "1" } : {}) }, killAfterMs: 10000 });
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
  assert.equal(status.requests.i.state, "published", "a lost stdout leaves the order unbegun, so the host begins it once from the saved state");
  const retry = crashed.run("finish"); assert.equal(retry.stdout, ""); assert.match(retry.stderr, /already finished/);
});

test("concurrent record re-reads state under the lock and keeps both complete outcomes", async () => {
  const s = setup(); readyFinish(s, [invoke, { ...invoke, id: "j" }]); s.ok("finish"); s.begin("i", "j");
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
  await round(s, "apply approved change", envelope([raw])); s.begin("patch");
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
  fs.writeFileSync(s.modePath, JSON.stringify(mode)); readyFinish(s, [collect]); s.ok("finish"); s.begin("c");
  for (const outcome of [{}, { status: "running" }, { status: "unknown" }])
    assert.match(s.run("record", ["--request-id", "c", "--outcome-json", "-"], JSON.stringify(outcome)).stderr, /not terminal/);
  assert.equal(s.mode().requests.c.state, "dispatched_outcome_unknown");
  s.ok("record", ["--request-id", "c", "--outcome-json", "-"], '{"status":"failed"}');
  assert.equal(s.mode().requests.c.replies[0].content, "whole reply");
});

test("help needs no state; catalogue reads whole large runtime metadata, merges extras and preserves descriptions", () => {
  for (const help of ["help", "--help"]) {
    const r = spawnSync(process.execPath, [HELPER, help], { encoding: "utf8" }); assert.equal(r.status, 0);
    for (const subcommand of ["catalogue", "propose", "confirm", "cancel", "end", "prepare", "finish", "bind", "record", "results", "status"]) assert.ok(r.stdout.includes(`  ${subcommand} `), subcommand);
    assert.equal(r.stdout.includes("  init "), false);
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
