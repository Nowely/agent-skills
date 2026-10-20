#!/usr/bin/env node
// Offline state loop of the main proxy through the real launcher, driver and fake Claude: one confirmed activation,
// full Claude Code rounds the host only relays, one Claude session across messages, every failed round closed
// without a replay, and states of the removed host-executed proxy refused.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { ROOT, EVALS, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";
const { cases, test: register } = registry();
const test = (name, fn) => register(name, name, async () => { await fn(); return true; });
const HELPER = path.join(ROOT, "skills/orchestrate/scripts/main-proxy.mjs"), ENTRY = path.join(ROOT, "skills/orchestrate/scripts/agent-run.mjs");
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const YES = "Подтвердить переключение";
// The host session every helper call of a case runs in, and nothing of this machine's own sessions or routes.
const HOST = "host-thread-1";
const baseEnv = () => {
  const e = { ...process.env };
  for (const k of Object.keys(e)) if (/^(CLAUDE_CODE_SESSION_ID|CODEX_THREAD_ID|CODEX_SANDBOX|ANTHROPIC_(?:[A-Z]+_)?BASE_URL)$/.test(k)) delete e[k];
  return e;
};
const defined = (env) => Object.fromEntries(Object.entries(env).filter(([, v]) => v !== undefined));
// A mode as a case needs it: confirmed by default, or only proposed.
function setup({ confirmed = true, model = "Opus" } = {}) {
  const dir = tempDir("entrust-main-proxy-"), state = path.join(dir, "mode"), work = path.join(dir, "work"), bin = path.join(dir, "bin");
  fs.mkdirSync(work); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, "claude"), `#!/bin/sh\nexec "${process.execPath}" "${path.join(EVALS, "fake-claude.mjs")}" "$@"\n`, { mode: 0o755 });
  const message = path.join(dir, "message.txt"), facts = path.join(dir, "facts.txt");
  fs.writeFileSync(facts, "Approved scope: " + work);
  // The launcher's calls inherit this process's environment: its own session, route and settings are named here so
  // none of them reaches a case, and the settings Claude Code would read are a synthetic directory's.
  const env = { PATH: `${bin}${path.delimiter}${process.env.PATH}`, ENTRUST_STATE_DIR: state, CODEX_THREAD_ID: HOST, CLAUDE_CODE_SESSION_ID: undefined,
    ANTHROPIC_BASE_URL: undefined, CLAUDE_CONFIG_DIR: path.join(dir, "claude-config"),
    FAKE_CLAUDE_LOG: path.join(dir, "calls.jsonl"), FAKE_CLAUDE_MODE: "proxy", AGENT_RUN_RETURN_MS: "10000" };
  const run = (command, args = [], input, more = {}) => spawnSync(process.execPath, [HELPER, command, ...(command === "help" ? [] : ["--state", state]), ...args],
    { encoding: "utf8", input, env: defined({ ...baseEnv(), ...env, ...more }) });
  const ok = (command, args = [], input, more) => { const r = run(command, args, input, more); assert.equal(r.status, 0, r.stdout + r.stderr); return r.stdout; };
  const modePath = path.join(state, "mode.json"), mode = () => JSON.parse(fs.readFileSync(modePath, "utf8"));
  const calls = () => fs.existsSync(env.FAKE_CLAUDE_LOG) ? fs.readFileSync(env.FAKE_CLAUDE_LOG, "utf8").trim().split("\n").map(JSON.parse) : [];
  const status = () => JSON.parse(ok("status"));
  const s = { dir, state, work: fs.realpathSync(work), message, facts, env, run, ok, modePath, mode, calls, status };
  s.proposal = JSON.parse(ok("propose", ["--adapter", "claude", "--model", model, "--cwd", work, "--language", "ru"]));
  if (confirmed) ok("confirm", ["--pending", s.proposal.pending, "--source", "user-choice", "--answer-file", "-"], YES);
  return s;
}
// One prepared round: the message saved, prepare's printed command checked; the report path it names.
function prepare(s, message, args = []) {
  fs.writeFileSync(s.message, message);
  const command = s.ok("prepare", ["--message-file", s.message, ...args]);
  const reportPath = s.mode().currentReport;
  assert.ok(command.includes("--run --watch") && command.includes(reportPath), command);
  return reportPath;
}
// The attached call the host makes, exactly as prepare printed it, to its terminal status.
async function watch(s, reportPath, more = {}) {
  const r = await spawnNode([ENTRY, "--run", "--watch", "--report-file", reportPath], { env: { ...s.env, ...more }, killAfterMs: 30000 }).done;
  assert.equal(r.code, 0, r.out + r.err);
  return { out: r.out, report: fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, "utf8")) : null };
}
const answer = (final_answer) => ({ FAKE_CLAUDE_OUTPUT: JSON.stringify({ final_answer }) });
// A whole round that ends in a delivered reply.
async function round(s, message, final, more = {}, args = []) {
  const reportPath = prepare(s, message, args), r = await watch(s, reportPath, { ...answer(final), ...more });
  assert.match(r.out, /^EXIT=0$/m, r.out);
  assert.deepEqual(JSON.parse(s.ok("finish")), { final_answer: final });
  return { reportPath, report: r.report };
}
// finish of a round that has no reply: exit 2 and the reason, and the round closed.
function failedFinish(s) {
  const r = s.run("finish"); assert.equal(r.status, 2, r.stdout + r.stderr); assert.equal(r.stdout, "");
  assert.equal(s.mode().currentReport, null, "finish closed the round");
  return r.stderr;
}
const argvOf = (call, flag) => call.argv.includes(flag) ? call.argv[call.argv.indexOf(flag) + 1] : null;
const deadPid = () => Number(spawnSync(process.execPath, ["-e", "process.stdout.write(String(process.pid))"], { encoding: "utf8" }).stdout);
async function until(predicate, what) {
  const end = Date.now() + 10000;
  while (!predicate()) { assert.ok(Date.now() < end, `waited 10 s for ${what}`); await new Promise((r) => setTimeout(r, 20)); }
}

// ------------------------------------------------------------------------------------------- activation

test("a proposal launches nothing and sends nothing; only the user's own answer in this session confirms it", async () => {
  const s = setup({ confirmed: false }), p = s.proposal;
  assert.deepEqual(p.choices, [YES, "Отмена"]);
  assert.ok(p.confirmation.startsWith("Вы переключаете основную сессию в режим прокси на **Claude Opus** через провайдера **Anthropic**."), p.confirmation);
  assert.ok(p.confirmation.includes("непосредственное выполнение работы через Claude Code"));
  assert.ok(p.confirmation.includes("рабочий контекст основной сессии, содержимое рабочих файлов и результаты инструментов"));
  assert.match(p.confirmation, /Запрашивается bypassPermissions.*фактический режим разрешений сохраняется в отчёте/);
  assert.equal(s.mode().lifecycle, "pending"); assert.equal(s.mode().consent, null);
  fs.writeFileSync(s.message, "Проверь ветки");
  assert.match(s.run("prepare", ["--message-file", s.message]).stderr, /has not confirmed this activation: nothing was launched and no context was sent/);
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
  // A typed reply is the trusted host's to judge: any explicit affirmative it received is recorded exactly as given.
  const typed = Buffer.from("Да, переключай на Claude Opus через Anthropic.\r\n");
  const consent = JSON.parse(s.ok("confirm", ["--pending", p.pending, "--source", "user-message", "--answer-file", "-"], typed));
  assert.equal(consent.answer, typed.toString()); assert.equal(consent.answerSha256, sha(typed));
  assert.deepEqual(consent.hostSession, { CODEX_THREAD_ID: HOST }); assert.equal(consent.source, "user-message");
  assert.equal(consent.provider, "Anthropic"); assert.equal(consent.route.apiProvider, "firstParty"); assert.equal(consent.display, "Claude Opus");
  assert.equal(consent.confirmation, p.confirmation); assert.equal(consent.confirmationSha256, sha(p.confirmation)); assert.equal(consent.model, "opus");
  assert.deepEqual(s.mode().consent, consent); assert.equal(s.status().lifecycle, "confirmed");
  // The same confirmation repeated, as after a lost stdout, prints the saved consent and asks nothing; another is refused.
  assert.deepEqual(JSON.parse(s.ok("confirm", ["--pending", p.pending, "--source", "user-message", "--answer-file", "-"], "другой текст")), consent);
  assert.match(s.run("confirm", ["--pending", crypto.randomUUID(), "--source", "user-message", "--answer-file", "-"], YES).stderr, /is confirmed, not pending/);
  assert.equal(s.calls().length, 0, "a confirmation alone launches nothing");
});

test("propose names the provider from the route, checks the launch offline, and refuses what it cannot run", () => {
  const s = setup({ confirmed: false }), fresh = (name) => path.join(s.dir, name);
  const propose = (state, args, more, cwd = s.work) => spawnSync(process.execPath, [HELPER, "propose", "--state", state, "--cwd", cwd, ...args],
    { encoding: "utf8", env: defined({ ...baseEnv(), ...s.env, ENTRUST_STATE_DIR: state, ...more }) });
  for (const [adapter, model] of [["opencode", "glm-5"], ["codex", "sol"]]) {
    const r = propose(fresh(adapter), ["--adapter", adapter, "--model", model, "--language", "ru"]);
    assert.equal(r.status, 2); assert.match(r.stderr, new RegExp(`no direct proxy is implemented for adapter ${adapter}`));
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
  const inCheckout = propose(path.join(ROOT, "forbidden-state"), ["--adapter", "claude", "--model", "opus", "--language", "ru"], {}, ROOT);
  assert.equal(inCheckout.status, 2); assert.match(inCheckout.stderr, /outside the checkout/);
  assert.equal(fs.existsSync(path.join(ROOT, "forbidden-state")), false);
  assert.equal(s.calls().length, 0);
});

test("cancel leaves the running mode as it was, and the cancelled one never launches", async () => {
  const old = setup(); await round(old, "start", "ready");
  const before = fs.readFileSync(old.modePath, "utf8"), next = path.join(old.dir, "next");
  const helper = (args, input) => spawnSync(process.execPath, [HELPER, ...args], { encoding: "utf8", input, env: defined({ ...baseEnv(), ...old.env, ENTRUST_STATE_DIR: next }) });
  const proposed = JSON.parse(helper(["propose", "--state", next, "--adapter", "claude", "--model", "sonnet", "--cwd", old.work, "--language", "ru", "--replaces", old.state]).stdout);
  assert.equal(helper(["cancel", "--state", next, "--pending", proposed.pending]).status, 0);
  assert.equal(fs.readFileSync(old.modePath, "utf8"), before, "the running mode is untouched");
  assert.match(helper(["confirm", "--state", next, "--pending", proposed.pending, "--source", "user-choice", "--answer-file", "-"], YES).stderr, /is cancelled, not pending/);
  fs.writeFileSync(old.message, "x");
  assert.match(helper(["prepare", "--state", next, "--message-file", old.message]).stderr, /was cancelled: nothing was launched/);
  await round(old, "go on", "still here");
  assert.equal(old.calls().filter((c) => argvOf(c, "--model") === "sonnet").length, 0);
  assert.equal(old.mode().lifecycle, "active");
});

test("a confirmed switch ends the replaced mode of this host session; another session's is not replaced; a crashed switch finishes on its repeat", async () => {
  const fresh = (name) => path.join(tempDir("entrust-switch-"), name);
  const helper = (s, state, args, input, more = {}) => spawnSync(process.execPath, [HELPER, ...args], { encoding: "utf8", input,
    env: defined({ ...baseEnv(), ...s.env, ENTRUST_STATE_DIR: state, ...more }) });
  const propose = (s, state, more) => helper(s, state, ["propose", "--state", state, "--adapter", "claude", "--model", "sonnet", "--cwd", s.work,
    "--language", "ru", "--replaces", s.state], undefined, more);
  const old = setup(); await round(old, "start", "ready");
  const next = fresh("next"), p = JSON.parse(propose(old, next).stdout);
  assert.equal(old.mode().lifecycle, "active", "a proposal ends nothing");
  assert.equal(helper(old, next, ["confirm", "--state", next, "--pending", p.pending, "--source", "user-choice", "--answer-file", "-"], YES).status, 0);
  assert.equal(old.mode().lifecycle, "ended"); assert.equal(old.mode().replacedBy, fs.realpathSync(next)); assert.equal(old.mode().endedBy, "replaced");
  fs.writeFileSync(old.message, "x");
  assert.match(old.run("prepare", ["--message-file", old.message]).stderr, /ended at .*: delegation has stopped/);
  const theirs = setup(); await round(theirs, "start", "ready");
  const r = propose(theirs, fresh("b"), { CODEX_THREAD_ID: "host-b" });
  assert.equal(r.status, 2); assert.match(r.stderr, /--replaces names a mode confirmed in another host session/);
  assert.equal(theirs.mode().lifecycle, "active");
  // A failure to write the replaced mode after the new consent was saved: the repeat of the same confirm finishes it.
  const target = path.join(theirs.dir, "after-crash"), preload = path.join(theirs.dir, "fail-once.cjs"), marker = path.join(theirs.dir, "failed-once");
  fs.writeFileSync(preload, `const fs=require('node:fs'),rename=fs.renameSync;fs.renameSync=function(a,b){if(String(b)===${JSON.stringify(theirs.modePath)}&&!fs.existsSync(${JSON.stringify(marker)})){fs.writeFileSync(${JSON.stringify(marker)},'1');throw Object.assign(new Error('injected write failure'),{code:'EIO'});}return rename.call(this,a,b);};`);
  const q = JSON.parse(propose(theirs, target).stdout);
  const crashed = helper(theirs, target, ["confirm", "--state", target, "--pending", q.pending, "--source", "user-message", "--answer-file", "-"], "Да, подтверждаю.", { NODE_OPTIONS: `--require=${preload}` });
  assert.equal(crashed.status, 2); assert.match(crashed.stderr, /injected write failure/);
  const saved = JSON.parse(fs.readFileSync(path.join(target, "mode.json"), "utf8"));
  assert.equal(saved.lifecycle, "confirmed"); assert.equal(saved.consent.answer, "Да, подтверждаю."); assert.equal(theirs.mode().lifecycle, "active");
  const repeated = helper(theirs, target, ["confirm", "--state", target, "--pending", q.pending, "--source", "user-message", "--answer-file", "-"], "anything");
  assert.equal(repeated.status, 0, repeated.stderr); assert.equal(JSON.parse(repeated.stdout).answer, "Да, подтверждаю.");
  assert.equal(theirs.mode().lifecycle, "ended"); assert.equal(theirs.mode().replacedBy, fs.realpathSync(target));
  assert.equal(helper(theirs, target, ["confirm", "--state", target, "--pending", q.pending, "--source", "user-message", "--answer-file", "-"], "again").status, 0, "a third repeat is as harmless");
});

test("a switch interrupted after the new consent is saved is finished by ending the new mode, and a confirm repeated after that changes nothing", async () => {
  const old = setup(); await round(old, "start", "ready");
  const target = path.join(tempDir("entrust-switch-"), "b"), preload = path.join(old.dir, "fail-once.cjs"), marker = path.join(old.dir, "failed-once");
  fs.writeFileSync(preload, `const fs=require('node:fs'),rename=fs.renameSync;fs.renameSync=function(a,b){if(String(b)===${JSON.stringify(old.modePath)}&&!fs.existsSync(${JSON.stringify(marker)})){fs.writeFileSync(${JSON.stringify(marker)},'1');throw Object.assign(new Error('injected write failure'),{code:'EIO'});}return rename.call(this,a,b);};`);
  const helper = (args, input, more = {}) => spawnSync(process.execPath, [HELPER, ...args], { encoding: "utf8", input,
    env: defined({ ...baseEnv(), ...old.env, ENTRUST_STATE_DIR: target, ...more }) });
  const q = JSON.parse(helper(["propose", "--state", target, "--adapter", "claude", "--model", "sonnet", "--cwd", old.work, "--language", "ru", "--replaces", old.state]).stdout);
  const crashed = helper(["confirm", "--state", target, "--pending", q.pending, "--source", "user-message", "--answer-file", "-"], "Да, переключай.", { NODE_OPTIONS: `--require=${preload}` });
  assert.equal(crashed.status, 2); assert.equal(old.mode().lifecycle, "active");
  const targetMode = path.join(target, "mode.json"), consent = JSON.parse(fs.readFileSync(targetMode, "utf8")).consent;
  assert.equal(helper(["end", "--state", target]).status, 0);
  assert.equal(old.mode().lifecycle, "ended"); assert.equal(old.mode().replacedBy, fs.realpathSync(target));
  const bytes = [fs.readFileSync(old.modePath, "utf8"), fs.readFileSync(targetMode, "utf8")];
  const retry = helper(["confirm", "--state", target, "--pending", q.pending, "--source", "user-message", "--answer-file", "-"], "что угодно");
  assert.equal(retry.status, 0, retry.stderr); assert.deepEqual(JSON.parse(retry.stdout), consent, "the receipt is the original consent");
  assert.deepEqual([fs.readFileSync(old.modePath, "utf8"), fs.readFileSync(targetMode, "utf8")], bytes, "no side effect, no new consent, no reactivation");
  assert.equal(old.calls().filter((c) => argvOf(c, "--model") === "sonnet").length, 0);
});

// ------------------------------------------------------------------------------------------- direct rounds

test("each message is one full Claude Code round the host only relays; the reply comes back verbatim and the next message continues the same session id", async () => {
  const s = setup(), user = 'Проверь всё.\r\n"$HOME" \\ `x`\n\n', reply = "Проверено.\r\nПолный ответ.\n\n";
  const first = await round(s, user, reply, { FAKE_CLAUDE_INIT: JSON.stringify({ permissionMode: "auto", mcp_servers: [{ name: "browser", status: "connected" }] }) },
    ["--host-facts", s.facts]);
  const [call] = s.calls();
  assert.equal(argvOf(call, "--model"), "opus"); assert.ok(call.argv.includes("--dangerously-skip-permissions"));
  assert.ok(call.task.startsWith("## Claude session\n") && call.task.includes("You are the user's primary agent"), call.task.slice(0, 80));
  assert.ok(call.task.includes(`HOST_FACTS:\nApproved scope: ${path.join(s.dir, "work")}\n`));
  assert.ok(call.task.endsWith(`USER_MESSAGE (verbatim text encoded as a JSON string):\n${JSON.stringify(user)}`));
  assert.equal(first.report.profile, "proxy"); assert.deepEqual(first.report.context.mcpServers, [{ name: "browser", status: "connected" }]);
  const after = s.status();
  assert.equal(after.lifecycle, "active"); assert.equal(after.effectiveModel, "claude-opus-5-5"); assert.equal(after.final_answer, reply);
  assert.equal(after.permissionMode, "auto", "the mode Claude's policy chose, not the requested one");
  assert.deepEqual(after.session, { report: first.reportPath, id: first.report.sessionID });
  for (const name of ["Write", "mcp__browser__navigate", "Agent", "tool_result"]) assert.ok(fs.readFileSync(after.transcriptPath, "utf8").includes(name), name);
  assert.match(s.run("finish").stderr, /no round is open: status repeats the last final_answer/);
  assert.equal(s.status().final_answer, reply, "a lost finish output is recovered from status");

  const second = await round(s, "Продолжай", "Продолжил");
  const next = s.calls()[1];
  assert.equal(argvOf(next, "--resume"), first.report.sessionID);
  for (const flag of ["--session-id", "--fork-session"]) assert.equal(next.argv.includes(flag), false, flag);
  assert.equal(argvOf(next, "--model"), "claude-opus-5-5", "a continuation runs the exact model first observed");
  assert.equal(next.task.includes("## Claude session"), false, "a resumed session already holds its instructions");
  assert.equal(next.task.includes("HOST_FACTS"), false);
  assert.equal(second.report.sessionID, first.report.sessionID); assert.equal(second.report.resumedFrom, first.reportPath);
  assert.equal(s.calls().length, 2, "one call per message");
});

test("a call Claude's policy denies does not hide a valid reply: it is delivered, and the denial stays in the report and status", async () => {
  const s = setup(), denied = [{ tool_name: "Bash", tool_use_id: "toolu_denied", tool_input: { command: "rm -rf build" } }];
  const { report } = await round(s, "Собери", "Собрано, кроме удаления build: оно запрещено политикой.",
    { FAKE_CLAUDE_INIT: JSON.stringify({ permissionMode: "auto" }), FAKE_CLAUDE_DENIALS: JSON.stringify(denied) });
  assert.equal(report.ok, true); assert.equal(report.exitCode, 0); assert.deepEqual(report.permissionDenials, denied);
  assert.equal(report.tools.find((t) => t.tool === "Bash").isError, true);
  const st = s.status(); assert.deepEqual(st.permissionDenials, denied); assert.equal(st.permissionMode, "auto"); assert.equal(st.lifecycle, "active");
});

test("a failed round after Claude started is closed without a reply or a replay, and the next message continues that same session", async () => {
  const s = setup(), first = await round(s, "Начни", "Предыдущий ответ");
  const failedPath = prepare(s, "Выполни");
  const failed = await watch(s, failedPath, { FAKE_CLAUDE_MODE: "proxy-error" });
  assert.match(failed.out, /^EXIT=1$/m);
  const why = failedFinish(s);
  assert.match(why, /the round failed after Claude started: its tools may already have executed \(exit 1: provider failed after executing\)/);
  assert.match(why, new RegExp(`Nothing is replayed; the next user message continues Claude session ${first.report.sessionID}\\.`));
  assert.ok(why.includes(`Transcript: ${failed.report.transcriptPath}`), why);
  const st = s.status();
  assert.equal(st.final_answer, null, "a failed round never redelivers an earlier reply");
  assert.deepEqual(st.session, { report: failedPath, id: first.report.sessionID });
  assert.equal(st.failures.at(-1).outcome, "failed"); assert.equal(st.lifecycle, "active");
  assert.equal(s.calls().length, 2, "nothing was sent again");
  const next = await round(s, "Проверь, что успел сделать", "Проверил");
  assert.equal(next.report.resumedFrom, failedPath); assert.equal(argvOf(s.calls()[2], "--resume"), first.report.sessionID);
});

test("a first round that fails after Claude started keeps its session: the next message resumes it without resending the instructions", async () => {
  const s = setup(), reportPath = prepare(s, "Начни");
  const failed = await watch(s, reportPath, { FAKE_CLAUDE_MODE: "proxy-error" });
  assert.match(failedFinish(s), /continues Claude session /);
  assert.equal(s.mode().lifecycle, "confirmed", "no reply has activated the mode");
  const next = await round(s, "Продолжай", "Готово");
  assert.equal(argvOf(s.calls()[1], "--resume"), failed.report.sessionID);
  assert.equal(s.calls()[1].task.includes("## Claude session"), false);
  assert.equal(next.report.sessionID, failed.report.sessionID); assert.equal(s.mode().lifecycle, "active");
});

test("a round refused before Claude started sends nothing, and the next message continues the earlier session", async () => {
  const s = setup(), first = await round(s, "start", "ready");
  const reportPath = prepare(s, "секретный рабочий контекст");
  const refused = await watch(s, reportPath, { FAKE_CLAUDE_API_PROVIDER: "bedrock" });
  assert.match(refused.out, /^EXIT=2$/m); assert.equal(refused.report.spawnedAt, null);
  const why = failedFinish(s);
  assert.match(why, /refused before Claude started: nothing was sent to Claude \(exit 2: the route changed since the confirmation/);
  assert.match(why, new RegExp(`continues Claude session ${first.report.sessionID}`));
  assert.equal(s.calls().length, 1); assert.equal(s.calls().some((c) => c.task.includes("секретный рабочий контекст")), false);
  assert.deepEqual(s.status().session, { report: first.reportPath, id: first.report.sessionID }, "the session is the one Claude last ran");
  await round(s, "next", "ok");
  assert.equal(argvOf(s.calls()[1], "--resume"), first.report.sessionID);
});

test("a run with no observed init leaves its outcome unknown: no session is adopted, nothing is replayed, and a new message starts a new session", async () => {
  const s = setup(), reportPath = prepare(s, "Выполни");
  const blind = await watch(s, reportPath, { ...answer("x"), FAKE_CLAUDE_NO_INIT: "1" });
  assert.match(blind.out, /^EXIT=4$/m); assert.equal(blind.report.context, null);
  const why = failedFinish(s);
  assert.match(why, /Claude was started but its session was never confirmed: whether it executed anything is unknown/);
  assert.match(why, /the next user message starts a new Claude session/);
  assert.equal(s.status().session, null); assert.equal(s.status().final_answer, null);
  assert.equal(s.calls().length, 1);
  await round(s, "Продолжай", "ok");
  const next = s.calls()[1];
  assert.equal(next.argv.includes("--resume"), false); assert.ok(argvOf(next, "--session-id"));
  assert.ok(next.task.startsWith("## Claude session\n"), "a new session gets its instructions");
  // On a resumed round the session is the one already observed, and stays.
  const known = s.status().session, again = prepare(s, "ещё");
  await watch(s, again, { ...answer("x"), FAKE_CLAUDE_NO_INIT: "1" });
  assert.match(failedFinish(s), new RegExp(`continues Claude session ${known.id}`));
  assert.deepEqual(s.status().session, known);
});

test("a driver that died without a report leaves the outcome unknown: finish closes the round once, and the next message continues the earlier session", async () => {
  const s = setup(), first = await round(s, "start", "ready");
  const reportPath = prepare(s, "next"), pid = deadPid(), m = s.mode();
  fs.writeFileSync(reportPath, JSON.stringify({ adapter: "claude", ok: false, status: "starting", pid }));
  m.launch = { report: fs.realpathSync(reportPath), pid, at: new Date().toISOString() }; fs.writeFileSync(s.modePath, JSON.stringify(m));
  const why = failedFinish(s);
  assert.match(why, /the driver died without a report: whether Claude executed anything is unknown/);
  assert.match(why, new RegExp(`continues Claude session ${first.report.sessionID}`));
  assert.equal(s.status().failures.at(-1).outcome, "lost"); assert.deepEqual(s.status().consent, m.consent);
  const again = await watch(s, reportPath, answer("x"));
  assert.equal(s.calls().length, 1, `the dead round is never started again: ${again.out}`);
  await round(s, "retry", "ok");
  assert.equal(argvOf(s.calls()[1], "--resume"), first.report.sessionID);
});

test("a round never started is closed by finish with nothing sent, and its printed command then launches nothing", async () => {
  const s = setup(), reportPath = prepare(s, "секрет");
  assert.match(failedFinish(s), /the round was never started: nothing was sent to Claude.*starts a new Claude session/);
  const late = await watch(s, reportPath, answer("x"));
  assert.match(late.out, /^EXIT=2$/m); assert.match(late.report.error, /this is not the round the mode prepared: nothing was launched/);
  assert.equal(s.calls().length, 0);
  await round(s, "start", "ready");
  assert.equal(s.mode().round, 2);
});

test("while a round runs, finish and end refuse and change nothing; after a stop, finish closes it and end ends the mode", async () => {
  const s = setup(), reportPath = prepare(s, "долгая работа");
  const running = spawnNode([ENTRY, "--run", "--watch", "--report-file", reportPath], { env: { ...s.env, FAKE_CLAUDE_MODE: "slow" }, killAfterMs: 30000 });
  await until(() => s.calls().length === 1 && s.mode().launch?.report === fs.realpathSync(reportPath), "the round to start");
  const before = fs.readFileSync(s.modePath, "utf8");
  for (const command of ["finish", "end"]) {
    const r = s.run(command); assert.equal(r.status, 2, command);
    assert.match(r.stderr, /a round is running \(driver pid \d+, report .*\): stop it with agent-run\.mjs --stop --report-file /, command);
  }
  fs.writeFileSync(s.message, "x"); assert.match(s.run("prepare", ["--message-file", s.message]).stderr, /round 1 is not closed: run finish/);
  assert.equal(fs.readFileSync(s.modePath, "utf8"), before, "refusals change nothing");
  const stop = spawnSync(process.execPath, [ENTRY, "--stop", "--report-file", reportPath], { encoding: "utf8", env: defined({ ...baseEnv(), ...s.env }) });
  assert.equal(stop.status, 0, stop.stdout + stop.stderr);
  const ended = await running.done; assert.match(ended.out, /^EXIT=3$/m, ended.out);
  assert.match(failedFinish(s), /the round failed after Claude started: its tools may already have executed/);
  s.ok("end"); assert.equal(s.status().lifecycle, "ended");
  assert.match(s.run("prepare", ["--message-file", s.message]).stderr, /ended at .*: delegation has stopped/);
  assert.match(s.run("end").stderr, /already ended/);
  assert.equal(s.calls().length, 1);
});

test("a reply from another model than the confirmed one is not delivered; the session continues on the confirmed model", async () => {
  const s = setup(), reportPath = prepare(s, "Проверь ветки");
  const swapped = await watch(s, reportPath, { ...answer("x"), FAKE_CLAUDE_INIT: JSON.stringify({ model: "claude-sonnet-5-5" }), FAKE_CLAUDE_ASSISTANT_MODEL: "claude-sonnet-5-5" });
  assert.match(swapped.out, /^EXIT=0$/m);
  assert.match(failedFinish(s), /Claude answered as claude-sonnet-5-5, not the confirmed Claude Opus/);
  assert.equal(s.status().final_answer, null); assert.equal(s.mode().lifecycle, "confirmed");
  await round(s, "Проверь ветки", "ready");
  assert.ok(s.calls().every((c) => argvOf(c, "--model") === "opus"), "every launch asked for the confirmed model");
  assert.equal(argvOf(s.calls()[1], "--resume"), swapped.report.sessionID);
  assert.equal(s.mode().effectiveModel, "claude-opus-5-5");
});

// ------------------------------------------------------------------------------------------- admission

test("a changed route or another host session stops the next launch before it starts", async () => {
  const s = setup(); await round(s, "start", "ready");
  const before = fs.readFileSync(s.modePath, "utf8"), launched = s.calls().length;
  fs.writeFileSync(s.message, "next");
  const attempt = (more) => s.run("prepare", ["--message-file", s.message], undefined, more);
  for (const [more, why] of [
    [{ FAKE_CLAUDE_API_PROVIDER: "bedrock" }, /route changed since the confirmation, from Anthropic to Amazon Bedrock: nothing was launched/],
    [{ ANTHROPIC_BASE_URL: "https://gateway.example" }, /from Anthropic to Anthropic \(ANTHROPIC_BASE_URL=https:\/\/gateway\.example\)/],
    [{ FAKE_CLAUDE_SIGNED_IN: "0" }, /route is signed-out; nothing was launched/],
    [{ CODEX_THREAD_ID: "another-thread" }, /consent was given in another host session: nothing was launched/],
  ]) { const r = attempt(more); assert.equal(r.status, 2); assert.match(r.stderr, why); }
  // A route set in a settings file Claude Code loads, the project's in Claude's directory or the user's, is the route too.
  const settings = (dir, url) => { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "settings.json"), JSON.stringify({ env: { ANTHROPIC_BASE_URL: url } })); };
  settings(path.join(s.work, ".claude"), "https://project.example/v1");
  assert.match(attempt({}).stderr, /names no provider for its route \(ANTHROPIC_BASE_URL \(project settings\) sets a base URL, and whether this run applies it is not measured/);
  fs.rmSync(path.join(s.work, ".claude"), { recursive: true });
  settings(s.env.CLAUDE_CONFIG_DIR, "https://user.example");
  assert.match(attempt({}).stderr, /ANTHROPIC_BASE_URL \(user settings\) sets a base URL/);
  fs.rmSync(s.env.CLAUDE_CONFIG_DIR, { recursive: true });
  assert.match(attempt({ ANTHROPIC_BASE_URL: "https://gw.example/team-a" }).stderr, /ANTHROPIC_BASE_URL=https:\/\/gw\.example\/team-a/);
  assert.equal(fs.readFileSync(s.modePath, "utf8"), before); assert.equal(s.calls().length, launched);
  assert.equal(fs.existsSync(path.join(s.state, "round-2")), false);
});

test("a prepared round is admitted again right before Claude starts: after an end, a switch, another session or route, nothing is sent", async () => {
  const cases = [
    ["ended", (s) => s.ok("end"), {}, /mode ended at .*: delegation has stopped and nothing was launched/],
    ["session", () => {}, { CODEX_THREAD_ID: "another-thread" }, /consent was given in another host session: nothing was launched/],
    ["route", () => {}, { FAKE_CLAUDE_API_PROVIDER: "bedrock" }, /route changed since the confirmation, from Anthropic to Amazon Bedrock: nothing was launched/],
    ["replaced", (s) => {
      const next = path.join(s.dir, "next"), env = defined({ ...baseEnv(), ...s.env, ENTRUST_STATE_DIR: next });
      const p = JSON.parse(spawnSync(process.execPath, [HELPER, "propose", "--state", next, "--adapter", "claude", "--model", "sonnet", "--cwd", s.work, "--language", "ru", "--replaces", s.state], { encoding: "utf8", env }).stdout);
      assert.equal(spawnSync(process.execPath, [HELPER, "confirm", "--state", next, "--pending", p.pending, "--source", "user-choice", "--answer-file", "-"], { encoding: "utf8", input: YES, env }).status, 0);
    }, {}, /mode ended at/],
  ];
  for (const [name, between, at, why] of cases) {
    const s = setup(); await round(s, "start", "ready");
    const reportPath = prepare(s, "секретный рабочий контекст"), sent = s.calls().length;
    between(s);
    const r = await watch(s, reportPath, { ...at, ...answer("x") });
    assert.match(r.out, /^EXIT=2$/m, `${name}: ${r.out}`); assert.match(r.report.error, why, name);
    assert.equal(s.calls().length, sent, `${name}: the provider was called`);
    assert.equal(s.calls().some((c) => c.task.includes("секретный рабочий контекст")), false, name);
  }
});

test("a round is claimed durably once at admission; an end that comes after the claim finds the round running and is refused", async () => {
  const admit = (s, report) => spawnSync(process.execPath, ["--input-type=module", "-e",
    `import { admitRound } from ${JSON.stringify(pathToFileURL(HELPER).href)}; process.stdout.write(JSON.stringify(admitRound(${JSON.stringify(report)}, process.pid)));`],
    { encoding: "utf8", env: defined({ ...baseEnv(), ...s.env }) });
  const s = setup(), report = prepare(s, "x");
  assert.equal(s.mode().launch, null, "prepare claims nothing");
  assert.equal(JSON.parse(admit(s, report).stdout), null);
  const claim = s.mode().launch; assert.equal(claim.report, fs.realpathSync(path.dirname(report)) + "/report.json"); assert.ok(claim.at);
  assert.match(JSON.parse(admit(s, report).stdout), /already started at .*: its message is not sent twice/);
  assert.deepEqual(s.mode().launch, claim, "a refused second admission leaves the first claim");
  // An end at the moment the real driver opens its transcript: the claim is durable, the end is refused, the round
  // finishes and is delivered, and the end then succeeds; the driver run again on the report sends nothing.
  const seam = setup(), reportPath = prepare(seam, "секретный контекст");
  const preload = path.join(seam.dir, "end-at-transcript.cjs"), endOut = path.join(seam.dir, "end.out");
  fs.writeFileSync(preload, `const cp=require('node:child_process'),fs=require('node:fs'),open=fs.openSync;
fs.openSync=function(p,...a){if(String(p).endsWith('.transcript.jsonl')&&process.env.END_AT_TRANSCRIPT&&!fs.existsSync(process.env.END_OUT)){const r=cp.spawnSync(process.execPath,JSON.parse(process.env.END_AT_TRANSCRIPT),{env:{...process.env,NODE_OPTIONS:''},encoding:'utf8'});
fs.writeFileSync(process.env.END_OUT,JSON.stringify({status:r.status,stderr:r.stderr,claimed:Boolean(JSON.parse(fs.readFileSync(process.env.MODE_PATH,'utf8')).launch)}));}return open.call(this,p,...a);};`);
  const run = await watch(seam, reportPath, { ...answer("готово"), NODE_OPTIONS: `--require=${preload}`,
    END_AT_TRANSCRIPT: JSON.stringify([HELPER, "end", "--state", seam.state]), END_OUT: endOut, MODE_PATH: seam.modePath });
  assert.match(run.out, /^EXIT=0$/m);
  const end = JSON.parse(fs.readFileSync(endOut, "utf8"));
  assert.equal(end.claimed, true); assert.equal(end.status, 2); assert.match(end.stderr, /a round is running .*; the mode was not ended/);
  assert.equal(seam.calls().length, 1); assert.equal(seam.mode().lifecycle, "confirmed");
  assert.deepEqual(JSON.parse(seam.ok("finish")), { final_answer: "готово" });
  seam.ok("end"); assert.equal(seam.mode().lifecycle, "ended");
  const again = await watch(seam, reportPath, answer("x"));
  assert.equal(seam.calls().length, 1, "nothing is sent again: " + again.out);
});

test("end belongs to the mode's host session, and an end before a prepared round starts refuses that round", async () => {
  const s = setup(); await round(s, "start", "ready");
  const before = fs.readFileSync(s.modePath, "utf8");
  const foreign = s.run("end", [], undefined, { CODEX_THREAD_ID: "host-B" });
  assert.equal(foreign.status, 2); assert.match(foreign.stderr, /another host session; only that session ends this mode/);
  assert.equal(fs.readFileSync(s.modePath, "utf8"), before, "a refused end changes nothing");
  const reportPath = prepare(s, "x");
  s.ok("end"); assert.equal(s.mode().lifecycle, "ended");
  const r = await watch(s, reportPath, answer("x"));
  assert.match(r.out, /^EXIT=2$/m); assert.equal(s.calls().length, 1);
  assert.match(failedFinish(s), /refused before Claude started: nothing was sent/);
});

// ------------------------------------------------------------------------------------------- old state

test("a state of the removed host-executed proxy is refused by every command and by the driver, left unchanged, and never replaced", async () => {
  const s = setup();
  const v1 = { schemaVersion: 1, adapter: "claude", model: "opus", cwd: s.work, catalogue: "/x/catalogue.json", agents: {}, requests: {}, lineage: [], round: 0, currentReport: null, lastCompletedReport: null, external_session: null };
  const v2 = { ...s.mode(), schemaVersion: 2, lifecycle: "active", catalogue: "/x/catalogue.json", agents: {}, requests: { i: { state: "published", request: { id: "i", action: "invoke" } } }, lineage: [] };
  for (const [name, old] of [["0.30", v1], ["0.31", v2]]) {
    const state = path.join(tempDir("entrust-old-"), "mode"); fs.mkdirSync(state);
    const modePath = path.join(state, "mode.json"), text = JSON.stringify(old); fs.writeFileSync(modePath, text);
    const helper = (args, input) => spawnSync(process.execPath, [HELPER, ...args], { encoding: "utf8", input, env: defined({ ...baseEnv(), ...s.env, ENTRUST_STATE_DIR: state }) });
    fs.writeFileSync(s.message, "x");
    for (const args of [["status"], ["prepare", "--message-file", s.message], ["finish"], ["end"], ["cancel", "--pending", "p"],
      ["confirm", "--pending", "p", "--source", "user-choice", "--answer-file", "-"]]) {
      const r = helper([args[0], "--state", state, ...args.slice(1)], YES);
      assert.equal(r.status, 2, `${name} ${args[0]}`); assert.match(r.stderr, /belongs to a removed host-executed proxy mode .*: nothing was launched and the file is left as it is; a new activation starts with propose/, `${name} ${args[0]}`);
    }
    const replace = helper(["propose", "--state", path.join(state, "..", "new"), "--adapter", "claude", "--model", "opus", "--cwd", s.work, "--language", "ru", "--replaces", state]);
    assert.equal(replace.status, 2); assert.match(replace.stderr, /--replaces names a state of the removed host-executed proxy, which this version never runs: propose without --replaces/);
    // A proxy round written under the old state's directory is refused before Claude starts.
    const round = path.join(state, "round-1"); fs.mkdirSync(round);
    const prompt = path.join(round, "prompt.txt"); fs.writeFileSync(prompt, `RIGHTS: full ${s.work}\nPROFILE: proxy\nTASK: execute\n`);
    const driven = await spawnNode([path.join(ROOT, "skills/claude/scripts/driver.mjs"), "--prompt-file", prompt, "--report-file", path.join(round, "report.json")],
      { env: { ...s.env, ENTRUST_STATE_DIR: state }, killAfterMs: 30000 }).done;
    assert.equal(driven.code, 2, name); assert.match(driven.out, /belongs to a removed host-executed proxy mode/);
    assert.equal(fs.readFileSync(modePath, "utf8"), text, `${name}: the old file is unchanged`);
  }
  assert.equal(s.calls().length, 0);
});

// ------------------------------------------------------------------------------------------- the state file

function barrier(s, command, crash = false) {
  const preload = path.join(s.dir, `barrier-${Math.random()}.cjs`), ready = preload + ".ready", go = preload + ".go", contended = preload + ".contended";
  fs.writeFileSync(preload, `const fs=require('node:fs');
const read=fs.readFileSync,open=fs.openSync,write=fs.writeSync;
fs.readFileSync=function(p,...a){const v=read.call(this,p,...a);if(String(p)===process.env.PAUSE_MODE&&process.env.PAUSE_READY){fs.writeFileSync(process.env.PAUSE_READY,'ready');while(!fs.existsSync(process.env.PAUSE_GO))Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,5);}return v;};
fs.openSync=function(p,...a){try{return open.call(this,p,...a);}catch(e){if(e.code==='EEXIST'&&String(p).endsWith('/state.lock')&&process.env.CONTENDED)fs.writeFileSync(process.env.CONTENDED,'contended');throw e;}};
fs.writeSync=function(fd,...a){if(fd===1&&process.env.CRASH_STDOUT)throw Error('simulated stdout crash');return write.call(this,fd,...a);};`);
  const launch = (paused) => spawnNode(["--require", preload, HELPER, command, "--state", s.state], {
    env: { ...s.env, PAUSE_MODE: s.modePath, ...(paused ? { PAUSE_READY: ready, PAUSE_GO: go } : { CONTENDED: contended }), ...(crash ? { CRASH_STDOUT: "1" } : {}) }, killAfterMs: 10000 });
  return { launch, ready, go, contended };
}

test("concurrent finish delivers once; a lost stdout is recovered from status without a second delivery", async () => {
  const s = setup(), reportPath = prepare(s, "x"); await watch(s, reportPath, answer("один раз"));
  const b = barrier(s, "finish"), first = b.launch(true); await until(() => fs.existsSync(b.ready), "the first finish");
  const second = b.launch(false); await until(() => fs.existsSync(b.contended), "the second finish to contend");
  fs.writeFileSync(b.go, "go"); const a = await first.done, c = await second.done;
  assert.equal(a.code, 0, a.err); assert.deepEqual(JSON.parse(a.out), { final_answer: "один раз" });
  assert.equal(c.code, 2); assert.equal(c.out, ""); assert.match(c.err, /no round is open: status repeats the last final_answer/);
  const crashed = setup(), crashedReport = prepare(crashed, "x"); await watch(crashed, crashedReport, answer("сохранён"));
  const lost = await barrier(crashed, "finish", true).launch(false).done;
  assert.equal(lost.code, 2); assert.equal(lost.out, ""); assert.match(lost.err, /simulated stdout crash/);
  const st = crashed.status(); assert.equal(st.final_answer, "сохранён"); assert.equal(st.lastCompletedReport, crashedReport);
  const retry = crashed.run("finish"); assert.equal(retry.stdout, ""); assert.match(retry.stderr, /no round is open/);
});

test("a stale dead-owner lock is reported without breaking it; read-only status remains available", () => {
  const s = setup(), lock = path.join(s.state, "state.lock");
  const text = JSON.stringify({ pid: deadPid(), startedAt: new Date().toISOString(), token: "old" }); fs.writeFileSync(lock, text);
  assert.match(s.run("finish").stderr, /stale state lock.*dead pid/);
  assert.equal(fs.readFileSync(lock, "utf8"), text); assert.equal(s.status().lifecycle, "confirmed");
});

test("help needs no state and names only the direct commands", () => {
  for (const help of ["help", "--help"]) {
    const r = spawnSync(process.execPath, [HELPER, help], { encoding: "utf8" }); assert.equal(r.status, 0);
    for (const command of ["propose", "confirm", "cancel", "prepare", "finish", "status", "end"]) assert.ok(r.stdout.includes(`  ${command} `), command);
    for (const removed of ["catalogue", "begin", "bind", "record", "results", "init"]) assert.equal(r.stdout.includes(`  ${removed} `), false, removed);
    assert.equal(r.stdout.includes("--results"), false);
  }
  for (const removed of ["catalogue", "begin", "bind", "record", "results"]) {
    const r = spawnSync(process.execPath, [HELPER, removed, "--state", "/nonexistent"], { encoding: "utf8" });
    assert.equal(r.status, 2, removed); assert.match(r.stderr, /^main-proxy — /, removed);
  }
});

process.exit(summarize(await runCases(cases), cases.length));
