#!/usr/bin/env node
// Does the Claude adapter run an external Claude agent the way its page and the shared launcher say? The
// driver, its approval server and its launcher hooks, against fake-claude.mjs on PATH as `claude`: the flags
// each prompt becomes, the report, the refusals, a stop, a continuation and the mailbox round trip. One opt-in
// case, ENTRUST_LIVE_CLAUDE=1, runs the real `claude` on Haiku through the launcher and spends a few cents.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawn, spawnSync } from "node:child_process";
import { EVALS, ROOT, registry, runCases, skip, spawnNode, summarize, tempDir } from "./lib/harness.mjs";
import { childEnv, claudeArgs, envelope, mailboxRules, parsePrompt } from "../plugin/skills/claude/scripts/driver.mjs";
import { requestOf } from "../plugin/skills/claude/scripts/approvals.mjs";
import { shortName, typedRequest } from "../plugin/skills/claude/scripts/launch.mjs";

const { cases, test: register } = registry();
const test = (name, fn) => register(name, name, async () => { const r = await fn(); return r ?? true; });
const SKILL = path.join(ROOT, "skills/claude");
const DRIVER = path.join(SKILL, "scripts/driver.mjs");
const ENTRY = path.join(SKILL, "scripts/agent-run.mjs");
const STATUS = path.join(SKILL, "scripts/status.mjs");
const FAKE = path.join(EVALS, "fake-claude.mjs");

const bin = tempDir("entrust-claude-bin-");
fs.writeFileSync(path.join(bin, "claude"), `#!/bin/sh\nexec "${process.execPath}" "${FAKE}" "$@"\n`, { mode: 0o755 });
const PATH_WITH_FAKE = `${bin}${path.delimiter}${process.env.PATH}`;

// A fresh state directory, a working directory and a log of what the fake was handed.
function setup() {
  const state = tempDir("entrust-claude-state-"), work = tempDir("entrust-claude-work-");
  const log = path.join(state, "fake.jsonl");
  // The settings a status probe would read are a synthetic directory's, never this machine's.
  return { state, work, log, env: (more = {}) => ({ ENTRUST_STATE_DIR: state, PATH: PATH_WITH_FAKE, FAKE_CLAUDE_LOG: log, CLAUDE_CONFIG_DIR: path.join(state, "claude-config"), ...more }) };
}
const lastCall = (log) => JSON.parse(fs.readFileSync(log, "utf8").trim().split("\n").at(-1));
const flagOf = (argv, name) => argv[argv.indexOf(name) + 1];
function prompt(dir, text) {
  const p = path.join(dir, `prompt-${Math.random().toString(16).slice(2)}.txt`);
  fs.writeFileSync(p, text);
  return p;
}
async function drive(s, text, { mode = "ok", report, approvals = null, more = {}, args = [] } = {}) {
  report ??= path.join(s.state, `r-${Math.random().toString(16).slice(2)}`, "report.json");
  fs.mkdirSync(path.dirname(report), { recursive: true });
  const r = await spawnNode([DRIVER, "--prompt-file", prompt(s.state, text), "--report-file", report,
    ...(approvals ? ["--approval-dir", approvals] : []), ...args], { env: s.env({ FAKE_CLAUDE_MODE: mode, ...more }), killAfterMs: 30000 }).done;
  return { ...r, report, json: (() => { try { return JSON.parse(fs.readFileSync(report, "utf8")); } catch { return null; } })() };
}
const check = (s, text, more = {}) => spawnSync(process.execPath, [DRIVER, "--check-prompt-file", prompt(s.state, text)],
  { encoding: "utf8", env: { ...process.env, ...s.env(more) } });

// ------------------------------------------------------------------------------------------- the prompt

test("--check-prompt-file passes silently and refuses with one entrust: refused line", () => {
  const s = setup();
  const ok = check(s, `RIGHTS: read ${s.work}\nMODEL: haiku\nEFFORT: low\nTASK: look\n`);
  assert.equal(ok.status, 0); assert.equal(ok.stdout + ok.stderr, "");
  // No RIGHTS line is a read agent in the current directory, as in every adapter; booleans read alike.
  assert.deepEqual(parsePrompt("TASK: look\n", {}, s.work).rights, { kind: "read", path: null });
  for (const v of ["true", "1", "no"]) assert.equal(check(s, `RIGHTS: read ${s.work}\nSAFE_MODE: ${v}\nTASK: look\n`).status, 0, v);
  for (const [text, why] of [
    [`MODEL: haiku\nRIGHTS: read ${s.work}\nTASK: look\n`, /RIGHTS must be the first header/],
    [`RIGHTS: read ${s.work}\nNETWORK: on\nTASK: look\n`, /unsupported header NETWORK/],
    [`RIGHTS: read ${s.work}\nMODEL: gpt-5\nTASK: look\n`, /MODEL must be/],
    [`RIGHTS: read ${s.work}\nEFFORT: huge\nTASK: look\n`, /EFFORT must be/],
    [`RIGHTS: read ${s.work}\nSAFE_MODE: maybe\nTASK: look\n`, /SAFE_MODE takes yes, true or 1, or no, false or 0/],
    [`RIGHTS: read ${s.work}\nRESUME: relative/report.json\nTASK: look\n`, /RESUME must be the absolute path/],
    [`RIGHTS: write ${s.state}\nTASK: look\n`, /refusing to grant write access to .*: it is inside this driver's state directory/],
    [`RIGHTS: read ${s.work}/missing\nTASK: look\n`, /is not an existing directory/],
    [`RIGHTS: write ${s.work}/missing\nTASK: look\n`, /is not an existing directory/],
    [`RIGHTS: read ${s.work}\nTASK:\n`, /TASK body is empty/],
  ]) {
    const r = check(s, text);
    assert.equal(r.status, 2, text); assert.match(r.stderr, /^entrust: refused: /); assert.match(r.stderr, why);
    assert.equal(r.stderr.trim().split("\n").length, 1);
  }
});

test("a registered plan's model and writes fill an absent field and refuse another, offline", () => {
  const s = setup();
  const pinned = { ENTRUST_PLAN_MODEL: "opus", ENTRUST_PLAN_WRITES: "nothing" };
  assert.equal(check(s, `RIGHTS: read ${s.work}\nMODEL: opus\nTASK: look\n`, pinned).status, 0);
  assert.match(check(s, `RIGHTS: read ${s.work}\nMODEL: haiku\nTASK: look\n`, pinned).stderr, /does not match the approved plan's opus/);
  assert.equal(parsePrompt(`RIGHTS: read ${s.work}\nTASK: look\n`, pinned, s.work).model, "opus");
  assert.equal(check(s, "TASK: look\n", pinned).status, 0);
  assert.match(check(s, `RIGHTS: write ${s.work}\nMODEL: opus\nTASK: look\n`, pinned).stderr, /does not match the approved plan's read/);
});

test("RESUME of a run whose driver still runs is refused, exit 10 at launch; one whose driver died is refused as over", async () => {
  const s = setup();
  const stub = (pid) => {
    const p = path.join(s.state, `old-${pid}`, "report.json"); fs.mkdirSync(path.dirname(p));
    fs.writeFileSync(p, JSON.stringify({ adapter: "claude", ok: false, status: "starting", pid }));
    return `RIGHTS: read ${s.work}\nRESUME: ${p}\nTASK: go on\n`;
  };
  const live = stub(process.pid);
  assert.match(check(s, live).stderr, /has not finished/);
  const r = await drive(s, live);
  assert.equal(r.code, 10); assert.equal(r.json.exitCode, 10); assert.match(r.json.error, /has not finished/);
  const dead = spawnSync(process.execPath, ["-e", "process.stdout.write(String(process.pid))"], { encoding: "utf8" });
  assert.match(check(s, stub(Number(dead.stdout))).stderr, /ended without a report/);
});

test("a refusal at launch is a published report, so --run prints its reason on ERROR=", async () => {
  const s = setup();
  const gone = tempDir("entrust-claude-vanishing-");
  const h = await launched(s, `RIGHTS: read ${gone}\nTASK: look\n`, "ok");
  fs.rmSync(gone, { recursive: true });
  const end = await go(h);
  assert.match(end.out, /^EXIT=2$/m); assert.match(end.out, /^ERROR=RIGHTS read .* is not an existing directory$/m);
});

// A root oneOf the API refuses (incidents.md, 2026-10-14): requests or a final answer, never both or neither.
const ROOT_ONE_OF = { type: "object", properties: { requests: { type: "array", items: { oneOf: [
  { type: "object", properties: { id: { type: "string", minLength: 1 } }, required: ["id"], additionalProperties: false }, { type: "string", minLength: 1 }] } },
  final_answer: { type: "string" } }, required: ["requests", "final_answer"], additionalProperties: false,
  oneOf: [{ properties: { requests: { minItems: 1 }, final_answer: { enum: [""] } } }, { properties: { requests: { maxItems: 0 }, final_answer: { minLength: 1 } } }] };
test("a schema with a root combinator is submitted without it and validated whole, including on RESUME", async () => {
  const s = setup(), schemaPath = path.join(s.state, "root-one-of.json");
  fs.writeFileSync(schemaPath, JSON.stringify(ROOT_ONE_OF));
  const original = fs.readFileSync(schemaPath, "utf8");
  const headers = `RIGHTS: read ${s.work}\nOUTPUT_SCHEMA: ${schemaPath}\nALLOW_NO_COMMANDS: yes\n`;
  assert.equal(check(s, `${headers}TASK: coordinate\n`).status, 0);
  const final = { requests: [], final_answer: "Done" }, orders = { requests: [{ id: "d" }, "raw \"$\\"], final_answer: "" };
  let prior = null;
  for (const envelope of [final, orders, { requests: [{ id: "i" }], final_answer: "mixed" }, { requests: [], final_answer: "" }]) {
    const valid = envelope === final || envelope === orders;
    const r = await drive(s, `${headers}${prior ? `RESUME: ${prior.report}\n` : ""}TASK: coordinate\n`,
      { mode: "structured", more: { FAKE_CLAUDE_OUTPUT: JSON.stringify(envelope) } });
    assert.equal(r.code, valid ? 0 : 13, r.err); assert.equal(r.json.outputSchemaOk, valid);
    assert.deepEqual(r.json.schemaTransform, ["dropped root oneOf"]);
    assert.equal(r.json.outputSchemaPath, schemaPath); assert.match(r.json.outputSchemaSha256, /^[a-f0-9]{64}$/);
    assert.notEqual(r.json.outputSchemaSha256, r.json.submittedSchemaSha256);
    if (valid) assert.deepEqual(r.json.answerJson, envelope);
    else { assert.equal(r.json.answerJson, null); assert.ok(r.json.schemaErrors.length); }
    const submitted = JSON.parse(flagOf(lastCall(s.log).argv, "--json-schema"));
    assert.equal(submitted.oneOf, undefined); assert.ok(submitted.properties.requests.items.oneOf);
    assert.ok(Date.parse(r.json.spawnedAt) <= Date.parse(r.json.firstEventAt));
    assert.ok(Date.parse(r.json.firstEventAt) <= Date.parse(r.json.resultAt));
    if (prior) assert.equal(r.json.resumedFromSession, prior.json.sessionID);
    if (valid) prior = r;
  }
  assert.equal(fs.readFileSync(schemaPath, "utf8"), original);
});

test("unsupported schemas and non-object submission fail preflight without spawning Claude", () => {
  const s = setup(), schema = path.join(s.state, "unsupported.json");
  for (const value of [{ type: "object", not: {} }, { type: "array", items: { type: "string" } }]) {
    fs.writeFileSync(schema, JSON.stringify(value));
    assert.equal(check(s, `RIGHTS: read ${s.work}\nOUTPUT_SCHEMA: ${schema}\nTASK: test\n`).status, 2);
    assert.equal(fs.existsSync(s.log), false);
  }
});

test("root anyOf/allOf retain original validation and nested constraints", () => {
  const s = setup(), schema = path.join(s.state, "combinators.json");
  for (const keyword of ["anyOf", "allOf"]) {
    fs.writeFileSync(schema, JSON.stringify({ type: "object", [keyword]: [{ required: ["value"] }],
      properties: { value: { type: "string", oneOf: [{ enum: ["a"] }, { enum: ["b"] }] } } }));
    const parsed = parsePrompt(`OUTPUT_SCHEMA: ${schema}\nTASK: test\n`, {}, s.work);
    assert.equal(parsed.error, undefined); assert.deepEqual(parsed.schemaTransform, [`dropped root ${keyword}`]);
    assert.ok(JSON.parse(parsed.schemaText).properties.value.oneOf);
  }
});

// ------------------------------------------------------------------------------------------- the run

test("a read run: manual mode, read tools, the mailbox denied rules, no approvals, the report's fields", async () => {
  const s = setup();
  const r = await drive(s, `RIGHTS: read ${s.work}\nMODEL: haiku\nEFFORT: low\nTASK: look around\n`);
  assert.equal(r.code, 0, r.err);
  assert.match(r.err, /^entrust: pid=\d+ identity=inv_[0-9a-f]+ reportPath=/m);
  const call = lastCall(s.log), argv = call.argv;
  assert.equal(call.cwd, fs.realpathSync(s.work)); assert.equal(call.task, "look around");
  assert.equal(flagOf(argv, "--permission-mode"), "manual"); assert.equal(flagOf(argv, "--tools"), "Read,Grep,Glob,Bash");
  assert.equal(flagOf(argv, "--model"), "haiku"); assert.equal(flagOf(argv, "--effort"), "low");
  assert.equal(flagOf(argv, "--permission-prompts"), "none"); assert.equal(argv.includes("--mcp-config"), false);
  assert.ok(argv.includes(`Edit(/${fs.realpathSync(s.state)}/${path.basename(path.dirname(r.report))}/**/approvals/**)`), argv.join(" "));
  assert.equal(argv.some((a) => /^Write\(/.test(a)), false);
  JSON.parse(flagOf(argv, "--json-schema"));
  const j = r.json;
  assert.equal(j.adapter, "claude"); assert.equal(j.exitCode, 0); assert.equal(j.ok, true);
  assert.equal(j.sessionID, flagOf(argv, "--session-id")); assert.equal(j.threadId, j.sessionID);
  assert.equal(j.model, "claude-haiku-5-5"); assert.equal(j.turnStatus, "completed"); assert.equal(j.receiptOk, true);
  assert.deepEqual(j.answerJson.status, "done"); assert.deepEqual(j.commands, [{ command: "ls", isError: false }]);
  assert.equal(j.cost, 0.0042); assert.deepEqual(j.rights, { kind: "read", roots: [] });
  assert.equal(JSON.parse(fs.readFileSync(j.answerPath, "utf8")).status, "done");
  assert.ok(fs.readFileSync(j.transcriptPath, "utf8").includes('"type":"result"'));
  for (const k of ["error", "turnError", "schemaOverflow", "approvalsAutoAccepted"]) assert.ok(k in j, k);
});

test("the mailbox rules cover this run's mailbox and every one under the state directory but the worktrees", () => {
  const state = tempDir("entrust-claude-rules-"), real = fs.realpathSync(state);
  for (const d of ["worktrees/inv_1/src/approvals", "orchestrate/p/run/a/agent/approvals"]) fs.mkdirSync(path.join(state, d), { recursive: true });
  const box = path.join(state, "orchestrate/p/run/a/agent/approvals");
  const rules = mailboxRules(state, box);
  assert.ok(rules.includes(`Edit(/${box}/**)`)); assert.ok(rules.includes(`Edit(/${real}/orchestrate/**/approvals/**)`));
  assert.equal(rules.some((r) => r.includes("worktrees") || r === `Edit(/${real}/**/approvals/**)`), false, rules.join(" "));
  assert.equal(rules.every((r) => r.startsWith("Edit(//")), true);
});

test("the session variables of a parent Claude Code session are not handed on, the rest are", async () => {
  const s = setup();
  await drive(s, `RIGHTS: read ${s.work}\nTASK: look\n`, { more: { CLAUDECODE: "1", CLAUDE_CODE_SESSION_ID: "parent", CLAUDE_EFFORT: "xhigh", ANTHROPIC_API_KEY: "key" } });
  assert.deepEqual(lastCall(s.log).vars, { CLAUDECODE: null, CLAUDE_CODE_SESSION_ID: null, CLAUDE_EFFORT: null, ANTHROPIC_API_KEY: "key" });
  assert.equal(childEnv({ CLAUDE_CODE_OAUTH_TOKEN: "t" }).CLAUDE_CODE_OAUTH_TOKEN, "t");
});

test("write and worktree runs: acceptEdits, edit tools, the right working directory and the worktree facts", async () => {
  const s = setup();
  const w = await drive(s, `RIGHTS: write ${s.work}\nTASK: write\n`, { mode: "write" });
  assert.equal(w.code, 0, w.err);
  let argv = lastCall(s.log).argv;
  assert.equal(flagOf(argv, "--permission-mode"), "acceptEdits"); assert.equal(flagOf(argv, "--tools"), "Read,Grep,Glob,Bash,Edit,Write");
  assert.deepEqual(w.json.rights, { kind: "write", roots: [fs.realpathSync(s.work)] });
  assert.equal(w.json.fileChanges[0].tool, "Write");
  const repo = tempDir("entrust-claude-repo-");
  const git = (...a) => spawnSync("git", ["-C", repo, "-c", "user.name=t", "-c", "user.email=t@example.invalid", ...a], { encoding: "utf8" });
  if (git("init").status !== 0) return skip("no git");
  git("commit", "--allow-empty", "-m", "base");
  const t = await drive(s, `RIGHTS: worktree ${repo}\nTASK: change\n`, { mode: "commit" });
  assert.equal(t.code, 0, t.err);
  // The agent committed its work, so a diff against the index would be empty; the report's is against the base.
  assert.match(t.json.diff, /committed\.txt/);
  const cwd = lastCall(s.log).cwd;
  assert.ok(cwd.startsWith(path.join(fs.realpathSync(s.state), "worktrees")), cwd);
  assert.equal(t.json.worktreePath, cwd); assert.equal(t.json.worktreeRepo, fs.realpathSync(repo)); assert.match(t.json.base, /^[0-9a-f]{40}$/);
});

test("a worktree's report is read through the git directory its repository records, not the tree's own .git", async () => {
  const s = setup();
  const repo = tempDir("entrust-claude-repo-");
  const git = (...a) => spawnSync("git", ["-C", repo, "-c", "user.name=t", "-c", "user.email=t@example.invalid", ...a], { encoding: "utf8" });
  if (git("init").status !== 0) return skip("no git");
  git("commit", "--allow-empty", "-m", "base");
  const fake = path.join(tempDir("entrust-claude-gitlink-"), "fake");
  const t = await drive(s, `RIGHTS: worktree ${repo}\nTASK: change\n`, { mode: "gitlink", more: { FAKE_CLAUDE_GITLINK: fake } });
  assert.equal(t.code, 0, t.err);
  assert.equal(fs.existsSync(`${fake}.ran`), false, "the agent's fsmonitor ran under the driver's git");
  assert.deepEqual(t.json.untracked, ["?? planted.txt"]);
});

test("every run is told its rights, how to ask for more and not to work around a refusal; a run with no mailbox is told nothing more can be granted", async () => {
  const s = setup();
  const read = await drive(s, `RIGHTS: read ${s.work}\nTASK: look around\n`);
  const told = flagOf(lastCall(s.log).argv, "--append-system-prompt") ?? "";
  assert.equal(read.code, 0, read.err);
  assert.match(told, /Read and search any path available to Claude Code with Read, Grep and Glob, which need no approval; RIGHTS selects the working directory, not a read boundary\. A shell command may need approval, and you have no edit tools/);
  assert.match(told, /Nothing beyond your rights can be granted in this run/);
  assert.match(told, /do not try to get around it with another tool or command/);
  const box = path.join(s.state, "boxed", "approvals"); fs.mkdirSync(box, { recursive: true });
  const write = await drive(s, `RIGHTS: write ${s.work}\nTASK: make\n`, { approvals: box });
  const asked = flagOf(lastCall(s.log).argv, "--append-system-prompt") ?? "";
  assert.equal(write.code, 0, write.err);
  assert.match(asked, new RegExp(`Edits inside ${fs.realpathSync(s.work).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} need no approval`));
  assert.match(asked, /asked of the coordinator, who approves or declines it: the call itself waits for that decision/);
});

test("an init reporting another mode or another set of tools than the rights asked for stops the run, exit 4", async () => {
  const s = setup();
  const mode = await drive(s, `RIGHTS: read ${s.work}\nTASK: judge\n`, { more: { FAKE_CLAUDE_INIT: JSON.stringify({ permissionMode: "bypassPermissions" }) } });
  assert.equal(mode.code, 4, mode.err); assert.match(mode.json.error, /permission mode bypassPermissions, not this run's default/);
  const wider = await drive(s, `RIGHTS: write ${s.work}\nTASK: make\n`, { more: { FAKE_CLAUDE_INIT: JSON.stringify({ tools: ["Bash", "Edit", "Glob", "Grep", "Read", "Write", "WebFetch"] }) } });
  assert.equal(wider.code, 4, wider.err); assert.match(wider.json.error, /reports the tools .*WebFetch, not this run's/);
  const narrower = await drive(s, `RIGHTS: write ${s.work}\nTASK: make\n`, { more: { FAKE_CLAUDE_INIT: JSON.stringify({ tools: ["Bash", "Glob", "Grep", "Read"] }) } });
  assert.equal(narrower.code, 4, narrower.err);
  // As 2.1.295 reports a read run: manual comes back as default, StructuredOutput and the user's MCP tools beside the granted ones.
  const echoed = await drive(s, `RIGHTS: read ${s.work}\nTASK: judge\n`, { more: { FAKE_CLAUDE_INIT: JSON.stringify({ permissionMode: "default", tools: ["Bash", "Glob", "Grep", "Read", "StructuredOutput", "mcp__user__thing"] }) } });
  assert.equal(echoed.code, 0, echoed.err);
});

test("an accept the mailbox cannot record is answered deny, never allow", async () => {
  const box = tempDir("entrust-claude-box-");
  const server = spawn(process.execPath, [path.join(ROOT, "skills/claude/scripts/approvals.mjs")], {
    env: { ...process.env, ENTRUST_APPROVAL_DIR: box, ENTRUST_RUN_PID: "4242", ENTRUST_RUN_STARTED_MS: "1", ENTRUST_RUN_CWD: box, ENTRUST_RUN_ROOTS: "[]" },
    stdio: ["pipe", "pipe", "inherit"] });
  const replies = [];
  readline.createInterface({ input: server.stdout }).on("line", (l) => replies.push(JSON.parse(l)));
  const call = (id, method, params) => server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  call(1, "initialize", { protocolVersion: "2025-06-18" });
  call(2, "tools/call", { name: "decide", arguments: { tool_name: "Bash", input: { command: "touch /x/y" } } });
  const until = async (ok) => { for (let i = 0; i < 100 && !ok(); i++) await new Promise((r) => setTimeout(r, 50)); };
  await until(() => fs.readdirSync(box).some((n) => n.endsWith(".request.json")));
  const name = fs.readdirSync(box).find((n) => n.endsWith(".request.json"));
  const q = JSON.parse(fs.readFileSync(path.join(box, name), "utf8"));
  fs.rmSync(path.join(box, name)); fs.mkdirSync(path.join(box, name));
  fs.writeFileSync(path.join(box, `${q.id}.decision.json`), JSON.stringify({ id: q.id, run: q.run, decision: "accept" }));
  await until(() => replies.some((m) => m.id === 2));
  server.kill();
  const answer = JSON.parse(replies.find((m) => m.id === 2).result.content[0].text);
  assert.equal(answer.behavior, "deny");
});

test("an edit outside the roots is offered whole; one into the state directory or ~/.claude is declined unasked", async () => {
  const state = tempDir("entrust-claude-guard-"), work = tempDir("entrust-claude-work-"), elsewhere = tempDir("entrust-claude-elsewhere-");
  const prot = tempDir("entrust-claude-protected-"), box = path.join(state, "run", "agent", "approvals");
  fs.mkdirSync(box, { recursive: true });
  const server = spawn(process.execPath, [path.join(ROOT, "skills/claude/scripts/approvals.mjs")], {
    env: { ...process.env, ENTRUST_APPROVAL_DIR: box, ENTRUST_RUN_PID: "4242", ENTRUST_RUN_STARTED_MS: "1", ENTRUST_RUN_CWD: work,
      ENTRUST_RUN_ROOTS: JSON.stringify([work]), ENTRUST_RUN_STATE_DIR: state,
      ENTRUST_RUN_PROTECTED: JSON.stringify([{ dir: prot, label: "~/.claude", holds: "the settings" }]) },
    stdio: ["pipe", "pipe", "inherit"] });
  const replies = [];
  readline.createInterface({ input: server.stdout }).on("line", (l) => replies.push(JSON.parse(l)));
  const call = (id, method, params) => server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  const until = async (ok) => { for (let i = 0; i < 100 && !ok(); i++) await new Promise((r) => setTimeout(r, 50)); };
  call(1, "initialize", { protocolVersion: "2025-06-18" });
  call(2, "tools/call", { name: "decide", arguments: { tool_name: "Write", input: { file_path: path.join(box, "1-00000000.decision.json"), content: "{}" } } });
  call(3, "tools/call", { name: "decide", arguments: { tool_name: "Edit", input: { file_path: path.join(prot, "settings.json"), old_string: "a", new_string: "b" } } });
  call(4, "tools/call", { name: "decide", arguments: { tool_name: "Write", input: { file_path: path.join(elsewhere, "notes.txt"), content: "x" } } });
  await until(() => replies.some((m) => m.id === 3) && fs.existsSync(path.join(box, "pending")));
  // Read `pending` before the server stops: its shutdown settles the request still open and removes the file.
  const pending = fs.existsSync(path.join(box, "pending")) ? fs.readFileSync(path.join(box, "pending"), "utf8") : "";
  server.kill();
  for (const id of [2, 3]) {
    const answer = JSON.parse(replies.find((m) => m.id === id).result.content[0].text);
    assert.equal(answer.behavior, "deny"); assert.match(answer.message, id === 2 ? /inside the state directory/ : /inside ~\/\.claude/);
  }
  assert.equal(replies.some((m) => m.id === 4), false, "the edit elsewhere was answered without a decision");
  const records = fs.readdirSync(box).filter((n) => n.endsWith(".request.json")).map((n) => JSON.parse(fs.readFileSync(path.join(box, n), "utf8")));
  const offered = records.find((q) => q.payload.input.file_path === path.join(elsewhere, "notes.txt"));
  assert.deepEqual(pending.trim().split("\n"), [offered.id]);
  assert.equal(records.filter((q) => q.settled?.by === "driver" && q.settled.decision === "declined").length, 2);
});

test("the budget: a volume bound of tool calls cuts the turn with exit 3, and the wall clock stands still while a request waits", async () => {
  const s = setup();
  const many = await drive(s, `RIGHTS: read ${s.work}\nTASK: loop\n`, { mode: "many", more: { FAKE_CLAUDE_TOOLS: "6" }, args: ["--max-tool-calls", "3"] });
  assert.equal(many.code, 3, many.err); assert.match(many.json.error, /volume bound: more than 3 tool calls/);
  // A request offered at once and accepted after 2.5 s, under a 1 s wall clock and a 1 s silence bound: the wait is
  // the coordinator's, and neither clock runs through it.
  const box = path.join(s.state, `box-${Date.now()}`); fs.mkdirSync(box);
  const run = drive(s, `RIGHTS: read ${s.work}\nTASK: make\n`, { mode: "ask", approvals: box, args: ["--timeout", "1", "--idle-timeout", "1"] });
  let q = null;
  for (let i = 0; i < 100 && !q; i++) {
    await new Promise((r) => setTimeout(r, 50));
    const name = fs.readdirSync(box).find((n) => n.endsWith(".request.json"));
    if (name) q = JSON.parse(fs.readFileSync(path.join(box, name), "utf8"));
  }
  assert.ok(q, "no request was offered");
  await new Promise((r) => setTimeout(r, 2500));
  fs.writeFileSync(path.join(box, `${q.id}.decision.json`), JSON.stringify({ id: q.id, run: q.run, decision: "accept" }));
  const done = await run;
  assert.equal(done.code, 0, done.err); assert.equal(done.json.cancellation, null);
});

test("a turn that observed nothing exits 5, as in every adapter, unless ALLOW_NO_COMMANDS says so", async () => {
  const s = setup();
  const bare = await drive(s, `RIGHTS: read ${s.work}\nTASK: recall\n`, { mode: "recall" });
  assert.equal(bare.code, 5, bare.err); assert.match(bare.json.error, /observed nothing/);
  const allowed = await drive(s, `RIGHTS: read ${s.work}\nALLOW_NO_COMMANDS: yes\nTASK: recall\n`, { mode: "recall" });
  assert.equal(allowed.code, 0, allowed.err);
  assert.equal((await drive(s, `RIGHTS: read ${s.work}\nTASK: look\n`)).code, 0);
});

test("an error result exits 1, no structured answer 13, a dead claude 4, a missing one 4", async () => {
  const s = setup();
  const text = `RIGHTS: read ${s.work}\nTASK: look\n`;
  const e = await drive(s, text, { mode: "error" });
  assert.equal(e.code, 1); assert.equal(e.json.turnError.subtype, "error_max_turns");
  assert.equal((await drive(s, text, { mode: "noschema" })).code, 13);
  const d = await drive(s, text, { mode: "die" });
  assert.equal(d.code, 4); assert.match(d.json.error, /without a result/);
  const nodeOnly = tempDir("entrust-claude-noclaude-");
  fs.symlinkSync(process.execPath, path.join(nodeOnly, "node"));
  const m = await drive(s, text, { more: { PATH: nodeOnly } });
  assert.equal(m.code, 4); assert.match(m.json.error, /claude is not on PATH/);
});

test("a stop is SIGINT to claude: the turn ends with a result, the report is partial, exit 3", async () => {
  const s = setup();
  const report = path.join(s.state, "stop", "report.json"); fs.mkdirSync(path.dirname(report));
  const p = spawnNode([DRIVER, "--prompt-file", prompt(s.state, `RIGHTS: read ${s.work}\nTASK: wait\n`), "--report-file", report],
    { env: s.env({ FAKE_CLAUDE_MODE: "slow" }), killAfterMs: 30000 });
  for (let i = 0; i < 100 && !fs.existsSync(s.log); i++) await new Promise((r) => setTimeout(r, 100));
  await new Promise((r) => setTimeout(r, 300));
  p.child.kill("SIGTERM");
  const r = await p.done;
  const j = JSON.parse(fs.readFileSync(report, "utf8"));
  assert.equal(r.code, 3); assert.equal(j.turnStatus, "aborted"); assert.equal(j.partial, true);
  assert.deepEqual(j.cancellation, { reason: "stopped by SIGTERM", kind: "signal", signal: "SIGINT" }); assert.equal(j.receiptOk, false);
  assert.equal(j.answer, "", "the stopped turn's own result is kept, not invented");
  const t = await drive(s, `RIGHTS: read ${s.work}\nTASK: wait\n`, { mode: "slow", args: ["--timeout", "1", "--idle-timeout", "0"] });
  assert.equal(t.code, 3); assert.match(t.json.error, /timed out after 1 s/); assert.equal(t.json.cancellation.kind, "wall");
});

// ------------------------------------------------------------------------------------------- the clocks

test("no wall clock unless declared: talking work outlives a declared clock's span, silence is cut, a declared clock cuts, and a cut run resumes", async () => {
  const s = setup(), text = `RIGHTS: read ${s.work}\nTASK: work\n`;
  const plain = await drive(s, text, { mode: "active", more: { FAKE_CLAUDE_ACTIVE_MS: "300" } });
  assert.equal(plain.code, 0, plain.err); assert.deepEqual(plain.json.limits, { timeoutS: 0, idleTimeoutS: 900, maxToolCalls: 1000 });
  // 2.5 s of work that writes a line every 100 ms, half of them a subagent's, against a 1 s silence bound.
  const busy = await drive(s, text, { mode: "active", args: ["--idle-timeout", "1"], more: { FAKE_CLAUDE_ACTIVE_MS: "2500" } });
  assert.equal(busy.code, 0, busy.err); assert.equal(busy.json.cancellation, null); assert.equal(busy.json.receiptOk, true);
  assert.ok(Date.parse(busy.json.endedAt) - Date.parse(busy.json.startedAt) >= 2500, "the run outlived the silence bound by working");
  assert.ok(busy.json.longestSilenceMs < 1000, `longest silence ${busy.json.longestSilenceMs} ms`);
  const clocked = await drive(s, text, { mode: "active", args: ["--timeout", "1", "--idle-timeout", "0"], more: { FAKE_CLAUDE_ACTIVE_MS: "20000" } });
  assert.equal(clocked.code, 3, clocked.err); assert.match(clocked.json.error, /timed out after 1 s of work/);
  assert.equal(clocked.json.cancellation.kind, "wall"); assert.equal(clocked.json.partial, true); assert.equal(clocked.json.receiptOk, false);
  const silent = await drive(s, text, { mode: "slow", args: ["--idle-timeout", "1"] });
  assert.equal(silent.code, 3, silent.err); assert.match(silent.json.error, /stalled: claude wrote no event of the run for 1 s/);
  assert.equal(silent.json.cancellation.kind, "idle"); assert.equal(silent.json.turnStatus, "aborted"); assert.ok(silent.json.longestSilenceMs > 1000);
  // A cut is a partial report like a stop's, so RESUME continues its session under the same rights.
  const resumed = await drive(s, `RESUME: ${silent.report}\nTASK: go on\n`);
  assert.equal(resumed.code, 0, resumed.err); assert.equal(flagOf(lastCall(s.log).argv, "--resume"), silent.json.sessionID);
  assert.deepEqual(resumed.json.limits, { timeoutS: 0, idleTimeoutS: 900, maxToolCalls: 1000 });
  for (const [flags, code] of [[["--timeout", "0"], 0], [["--idle-timeout", "0"], 0], [["--timeout", "-1"], 2], [["--idle-timeout", "x"], 2], [["--idle-timeout"], 2],
    [["--idle-timeout", "9".repeat(400)], 2], [["--timeout", "9".repeat(400)], 2], [["--max-tool-calls", "9".repeat(400)], 2], [["--max-tool-calls", "0"], 2]]) {
    const r = spawnSync(process.execPath, [DRIVER, "--check-prompt-file", prompt(s.state, text), ...flags], { encoding: "utf8", env: { ...process.env, ...s.env() } });
    assert.equal(r.status, code, `${flags.join(" ")}: ${r.stderr}`);
  }
});

test("an answered request restarts silence in full and keeps the run's work time: accepted, declined or expired", async () => {
  const s = setup(), text = `RIGHTS: read ${s.work}\nTASK: make\n`;
  // 1.6 s of silence before the request and 1.2 s after its answer, each inside a 2 s silence bound, together past it.
  const quiet = { FAKE_CLAUDE_QUIET_BEFORE_MS: "1600", FAKE_CLAUDE_QUIET_AFTER_MS: "1200" };
  const answered = async (mode, decision, args, more = {}) => {
    const box = path.join(s.state, `box-${Math.random().toString(16).slice(2)}`); fs.mkdirSync(box);
    const run = drive(s, text, { mode, approvals: box, args, more: { ...quiet, ...more } });
    if (decision) {
      let q = null;
      for (let i = 0; i < 400 && !q; i++) {
        await new Promise((r) => setTimeout(r, 25));
        const name = fs.readdirSync(box).find((n) => n.endsWith(".request.json"));
        if (name) q = JSON.parse(fs.readFileSync(path.join(box, name), "utf8"));
      }
      assert.ok(q, "no request was offered");
      await new Promise((r) => setTimeout(r, 1400));
      fs.writeFileSync(path.join(box, `${q.id}.decision.json`), JSON.stringify({ id: q.id, run: q.run, decision }));
    }
    return run;
  };
  const accepted = await answered("ask", "accept", ["--idle-timeout", "2"]);
  assert.equal(accepted.code, 0, accepted.err); assert.equal(accepted.json.cancellation, null);
  const declined = await answered("ask", "decline", ["--idle-timeout", "2"]);
  assert.equal(declined.code, 6, declined.err); assert.equal(declined.json.cancellation, null);
  const expired = await answered("ask-cancel", null, ["--idle-timeout", "2"], { FAKE_CLAUDE_CANCEL_MS: "1400" });
  assert.equal(expired.code, 6, expired.err); assert.equal(expired.json.cancellation, null); assert.equal(expired.json.escalations[0].decision, "expired");
  // The wait restarts silence, never work: the same 1.6 s and 1.2 s pass a declared 2 s wall clock.
  const clocked = await answered("ask", "accept", ["--timeout", "2", "--idle-timeout", "0"]);
  assert.equal(clocked.code, 3, clocked.err); assert.equal(clocked.json.cancellation.kind, "wall");
});

test("only the run's own events are signs of life: noise is cut, and partial messages keep a writing run alive without counting as calls or evidence", async () => {
  const s = setup(), text = `RIGHTS: read ${s.work}\nTASK: write\n`;
  const noise = await drive(s, text, { mode: "noise", args: ["--idle-timeout", "1"], more: { FAKE_CLAUDE_ACTIVE_MS: "2550" } });
  assert.equal(noise.code, 3, noise.err); assert.equal(noise.json.cancellation.kind, "idle");
  const writing = await drive(s, text, { mode: "streaming", args: ["--idle-timeout", "1"], more: { FAKE_CLAUDE_ACTIVE_MS: "2500" } });
  assert.equal(writing.code, 0, writing.err); assert.ok(lastCall(s.log).argv.includes("--include-partial-messages"));
  assert.deepEqual(writing.json.tools.map((t) => t.tool), ["Read", "StructuredOutput"], "a partial tool_use is no call");
  assert.deepEqual(writing.json.commands, []); assert.equal(writing.json.receiptOk, true); assert.ok(writing.json.longestSilenceMs < 1000);
  const unfinished = await drive(s, text, { mode: "streaming", more: { FAKE_CLAUDE_ACTIVE_MS: "300", FAKE_CLAUDE_STREAM_ONLY: "1" } });
  assert.equal(unfinished.code, 4, unfinished.err); assert.equal(unfinished.json.receiptOk, false); assert.equal(unfinished.json.answerJson, null);
});

test("a running tool's progress heartbeats are signs of life and no call; the reference's other envelopes are life alone", async () => {
  const s = setup();
  // 2.5 s of a Bash call whose only lines are SDKToolProgressMessage every 150 ms, under a 1 s silence bound.
  const r = await drive(s, `RIGHTS: read ${s.work}\nTASK: build\n`, { mode: "progress", args: ["--idle-timeout", "1"], more: { FAKE_CLAUDE_ACTIVE_MS: "2500" } });
  assert.equal(r.code, 0, r.err); assert.equal(r.json.cancellation, null); assert.ok(r.json.longestSilenceMs < 1000, `${r.json.longestSilenceMs} ms`);
  assert.deepEqual(r.json.tools.map((t) => t.tool), ["Read", "Bash", "StructuredOutput"], "a heartbeat is no call of its own");
  assert.deepEqual(r.json.commands, [{ command: "npm run build", isError: false }]);
  for (const type of ["tool_progress", "tool_use_summary", "auth_status", "stream_event", "rate_limit_event", "system", "assistant", "user", "result"])
    assert.equal(envelope({ type, session_id: "s" }), true, type);
  for (const line of [{ type: "not-an-event" }, { type: "tool_progressx" }, [], "tool_progress", null]) assert.equal(envelope(line), false, JSON.stringify(line));
});

// ------------------------------------------------------------------------------------------- the main proxy

test("PROFILE proxy and RIGHTS full go together, never in a plan, safe mode or a worker's continuation; the removed coordinator profile is refused", async () => {
  const s = setup(), full = `RIGHTS: full ${s.work}\nPROFILE: proxy\n`;
  assert.equal(check(s, `${full}TASK: work\n`).status, 0);
  const parsed = parsePrompt(`${full}TASK: work\n`, {}, s.work);
  assert.equal(parsed.profile, "proxy"); assert.equal(parsed.safeMode, false); assert.equal(parsed.allowNoCommands, true);
  const worker = await drive(s, `RIGHTS: read ${s.work}\nTASK: look\n`);
  const coordinator = path.join(s.state, "coordinator-report.json");
  fs.writeFileSync(coordinator, JSON.stringify({ ...worker.json, profile: "coordinator" }));
  for (const [text, why, more] of [
    [`RIGHTS: full ${s.work}\nTASK: x\n`, /PROFILE proxy requires RIGHTS full/],
    [`RIGHTS: read ${s.work}\nPROFILE: proxy\nTASK: x\n`, /PROFILE proxy requires RIGHTS full/],
    [`${full}SAFE_MODE: yes\nTASK: x\n`, /SAFE_MODE is incompatible/],
    [`${full}TASK: x\n`, /RIGHTS full belongs to the main proxy, not a worker plan/, { ENTRUST_PLAN_WRITES: "nothing" }],
    [`RIGHTS: read ${s.work}\nPROFILE: coordinator\nTASK: x\n`, /PROFILE must be proxy, not "coordinator"/],
    [`PROFILE: proxy\nRESUME: ${worker.report}\nTASK: go on\n`, /keeps its profile, worker/],
    [`RESUME: ${coordinator}\nTASK: go on\n`, /is a coordinator run, a profile this driver no longer has/],
  ]) { const r = check(s, text, more); assert.equal(r.status, 2, text); assert.match(r.stderr, why); }
});

test("the proxy's command line keeps Claude Code's own tools, configuration and permission policy, and a continuation resumes the same session id", () => {
  const s = setup(), first = parsePrompt(`RIGHTS: full ${s.work}\nPROFILE: proxy\nMODEL: opus\nTASK: work\n`, {}, s.work);
  const args = claudeArgs(first, { kind: "full", stateDir: s.state, box: null, sessionId: "s-1", mcpConfig: null, cwd: s.work });
  for (const f of ["--dangerously-skip-permissions", "--chrome", "--json-schema"]) assert.ok(args.includes(f), f);
  for (const f of ["--tools", "--allowedTools", "--disallowedTools", "--permission-mode", "--permission-prompts", "--permission-prompt-tool",
    "--safe-mode", "--strict-mcp-config", "--mcp-config", "--append-system-prompt", "--fork-session", "--resume"]) assert.equal(args.includes(f), false, f);
  assert.equal(flagOf(args, "--session-id"), "s-1");
  const prior = path.join(s.state, "proxy-report.json");
  fs.writeFileSync(prior, JSON.stringify({ adapter: "claude", exitCode: 1, sessionID: "s-1", cwd: s.work, rights: { kind: "full", roots: [] }, profile: "proxy" }));
  const next = parsePrompt(`RIGHTS: full ${s.work}\nPROFILE: proxy\nRESUME: ${prior}\nTASK: go on\n`, {}, s.work);
  assert.equal(next.error, undefined, next.error); assert.equal(next.profile, "proxy");
  const resumed = claudeArgs(next, { kind: "full", stateDir: s.state, box: null, sessionId: "unused", mcpConfig: null, cwd: s.work });
  assert.equal(flagOf(resumed, "--resume"), "s-1");
  for (const f of ["--fork-session", "--session-id"]) assert.equal(resumed.includes(f), false, f);
});

test("a proxy run outside its confirmed activation is refused before Claude starts, and its report says so", async () => {
  const s = setup();
  const r = await drive(s, `RIGHTS: full ${s.work}\nPROFILE: proxy\nTASK: work\n`, { mode: "proxy", more: { FAKE_CLAUDE_OUTPUT: JSON.stringify({ final_answer: "x" }) } });
  assert.equal(r.code, 2, r.err); assert.match(r.json.error, /needs its confirmed main-proxy activation: nothing was launched/);
  assert.equal(r.json.spawnedAt, null); assert.equal(fs.existsSync(s.log), false, "claude was never started");
});

test("a continuation forks the earlier session into a new id, in the earlier run's directory, and keeps its rights", async () => {
  const s = setup();
  const first = await drive(s, `RIGHTS: write ${s.work}\nTASK: start\n`);
  const elsewhere = tempDir("entrust-claude-elsewhere-");
  const next = await drive(s, `RIGHTS: write ${s.work}\nRESUME: ${first.report}\nTASK: go on\n`);
  assert.equal(next.code, 0, next.err);
  const call = lastCall(s.log);
  assert.equal(flagOf(call.argv, "--resume"), first.json.sessionID); assert.ok(call.argv.includes("--fork-session"));
  assert.notEqual(flagOf(call.argv, "--session-id"), first.json.sessionID); assert.equal(next.json.sessionID, flagOf(call.argv, "--session-id"));
  assert.equal(call.cwd, first.json.cwd); assert.equal(next.json.resumedFrom, first.report);
  // A RIGHTS line names the run's own rights or nothing: a narrower kind, another directory and a wider kind
  // are each refused, so the session never runs in a directory nobody checked under rights it did not have.
  for (const other of [`read ${s.work}`, `write ${elsewhere}`])
    assert.match(check(s, `RIGHTS: ${other}\nRESUME: ${first.report}\nTASK: go on\n`).stderr, /keeps its rights, write /);
  const reader = await drive(s, `RIGHTS: read ${elsewhere}\nTASK: look\n`);
  assert.match(check(s, `RIGHTS: write ${s.work}\nRESUME: ${reader.report}\nTASK: go on\n`).stderr, /keeps its rights, read /);
  const kept = await drive(s, `RESUME: ${first.report}\nTASK: go on\n`);
  assert.equal(kept.code, 0, kept.err); assert.deepEqual(kept.json.rights, first.json.rights);
  const gone = tempDir("entrust-claude-gone-");
  const earlier = await drive(s, `RIGHTS: read ${gone}\nTASK: start\n`);
  fs.rmSync(gone, { recursive: true });
  assert.match(check(s, `RESUME: ${earlier.report}\nTASK: go on\n`).stderr, /no longer exists/);
});

test("SAFE_MODE runs with --safe-mode and no mailbox, even when one is given", async () => {
  const s = setup();
  const box = path.join(s.state, "box"); fs.mkdirSync(box);
  const r = await drive(s, `RIGHTS: read ${s.work}\nSAFE_MODE: yes\nTASK: judge\n`, { approvals: box });
  assert.equal(r.code, 0, r.err);
  const argv = lastCall(s.log).argv;
  assert.ok(argv.includes("--safe-mode")); assert.equal(argv.includes("--mcp-config"), false); assert.equal(flagOf(argv, "--permission-prompts"), "none");
  assert.equal(r.json.context.safeMode, true); assert.equal(r.json.context.memory, false);
  const asked = await drive(s, `RIGHTS: read ${s.work}\nSAFE_MODE: yes\nTASK: judge\n`, { mode: "ask", approvals: box });
  assert.equal(asked.code, 7); assert.equal(asked.json.permissionDenials.length, 1);
});

// ------------------------------------------------------------------------------------------- approvals

test("a Bash call with a command and a description is a command request; any other call is claude.permission", () => {
  const q = requestOf({ tool_name: "Bash", input: { command: "touch x", description: "make x" } }, "1-0000abcd");
  assert.equal(q.command, "touch x"); assert.equal(q.reason, "make x"); assert.equal(q.type, undefined); assert.equal(q.method, "Bash");
  assert.deepEqual(q.run.turnId, null); assert.equal(q.settled, null);
  for (const call of [{ tool_name: "Bash", input: { command: "npm test", timeout: 600000 } }, { tool_name: "Write", input: { file_path: "/x", content: "y" } }]) {
    const t = requestOf(call, "2-0000abcd");
    assert.equal(t.type, "claude.permission"); assert.equal(t.presented, JSON.stringify(call, null, 2));
    const hook = typedRequest(t);
    assert.equal(hook.envelopeError(), null); assert.equal(hook.fits({ requestHash: t.requestHash }), true);
    assert.equal(typedRequest({ ...t, presented: "{}" }).envelopeError() !== null, true);
  }
  assert.equal(shortName("claude-haiku-5-5"), "Haiku"); assert.equal(shortName("other"), "other");
});

// A run under the launcher, as the keeper starts it: the mailbox armed, the request handed back by --run.
async function launched(s, text, mode, more = {}) {
  const report = path.join(s.state, `run-${Math.random().toString(16).slice(2)}`, "a", "report.json");
  fs.mkdirSync(path.dirname(report), { recursive: true });
  const env = s.env({ FAKE_CLAUDE_MODE: mode, AGENT_RUN_RETURN_MS: "20000", ...more });
  const n = await spawnNode([ENTRY, "--new", "--report-file", report], { env, stdio: ["pipe", "pipe", "pipe"], killAfterMs: 20000 });
  n.child.stdin.end(text);
  const made = await n.done;
  assert.equal(made.code, 0, made.out + made.err);
  const run = (args = []) => spawnNode([ENTRY, ...args, "--report-file", report], { env, stdio: ["pipe", "pipe", "pipe"], killAfterMs: 40000 });
  return { report, env, run, dir: path.join(path.dirname(report), "agent") };
}
const go = async (h) => { const p = h.run(["--run"]); p.child.stdin.end(); return p.done; };
const decide = async (h, id, how, body = null) => { const p = h.run(["--decide", id, how]); p.child.stdin.end(body ?? ""); return p.done; };

test("the mailbox round trip: --run hands the Bash request back, an accept runs it, the report counts it", async () => {
  const s = setup();
  const h = await launched(s, `RIGHTS: write ${s.work}\nMODEL: sonnet\nTASK: make a file\n`, "ask");
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(h.dir, "backend.json"), "utf8")), { adapter: "claude", planModel: null, planWrites: null });
  const back = await go(h);
  assert.match(back.out, /^REQUEST=1-[0-9a-f]{8}$/m); assert.match(back.out, /^METHOD=Bash$/m); assert.match(back.out, /^REASON=make a file$/m);
  const id = /^REQUEST=(\S+)$/m.exec(back.out)[1];
  const d = await decide(h, id, "--accept", "touch made.txt\n");
  assert.match(d.out, new RegExp(`^DECIDED=${id} accept`, "m"));
  const end = await go(h);
  assert.match(end.out, /^EXIT=0$/m); assert.match(end.out, /approvals=1\/0\/0\/0/); assert.match(end.out, /model=Sonnet/);
  const q = JSON.parse(fs.readFileSync(path.join(h.dir, "approvals", `${id}.request.json`), "utf8"));
  assert.equal(q.settled.decision, "accepted"); assert.equal(q.settled.by, "coordinator");
  assert.equal(JSON.parse(fs.readFileSync(h.report, "utf8")).escalations[0].decision, "accepted");
  assert.equal(fs.existsSync(path.join(h.dir, "approvals", "pending")), false, "pending outlived the last open request");
});

test("a decline denies the call and exits 6", async () => {
  const s = setup();
  const h = await launched(s, `RIGHTS: write ${s.work}\nTASK: make a file\n`, "ask");
  const id = /^REQUEST=(\S+)$/m.exec((await go(h)).out)[1];
  await decide(h, id, "--decline");
  const end = await go(h);
  assert.match(end.out, /^EXIT=6$/m); assert.match(end.out, /approvals=0\/1\/0\/0/);
  assert.match(JSON.parse(fs.readFileSync(h.report, "utf8")).answerJson.result, /declined by the coordinator/);
});

test("a typed request prints its whole call, and an accept restates the body", async () => {
  const s = setup();
  const h = await launched(s, `RIGHTS: write ${s.work}\nTASK: run the tests\n`, "ask", { FAKE_CLAUDE_TOOL: "BashTimeout" });
  const back = await go(h);
  assert.match(back.out, /^TYPE=claude.permission$/m); assert.match(back.out, /"timeout": 600000/);
  const id = /^REQUEST=(\S+)$/m.exec(back.out)[1];
  const body = JSON.parse(fs.readFileSync(path.join(h.dir, "approvals", `${id}.request.json`), "utf8")).presented;
  assert.match((await decide(h, id, "--accept", "npm test\n")).out, /REFUSED=.*differs/);
  assert.match((await decide(h, id, "--accept", `${body}\n`)).out, /DECIDED=/);
  assert.match((await go(h)).out, /^EXIT=0$/m);
});

test("a call Claude Code cancels, or a run that ends while waiting, settles its request expired by the driver", async () => {
  const s = setup();
  for (const mode of ["ask-cancel", "ask-die"]) {
    const h = await launched(s, `RIGHTS: write ${s.work}\nTASK: make a file\n`, mode);
    // --run hands the request back while it waits; nobody decides it, and the next --run waits for the end.
    let end = await go(h);
    for (let i = 0; i < 50 && /^WAITING=/m.test(end.out); i++) { await new Promise((r) => setTimeout(r, 200)); end = await go(h); }
    const box = path.join(h.dir, "approvals");
    const req = fs.readdirSync(box).find((n) => n.endsWith(".request.json"));
    const q = JSON.parse(fs.readFileSync(path.join(box, req), "utf8"));
    assert.equal(q.settled?.decision, "expired", `${mode}: ${end.out}`); assert.equal(q.settled.by, "driver");
    assert.match(q.settled.why, mode === "ask-cancel" ? /cancelled/ : /run ended/);
  }
});

test("a plan row naming claude is an external run; a five-column opus row stays native", async () => {
  const s = setup();
  const runDir = path.join(s.state, "planned"); fs.mkdirSync(runDir);
  const p = spawnNode([ENTRY, "--plan", "--run-dir", runDir], { env: s.env(), stdio: ["pipe", "pipe", "pipe"] });
  p.child.stdin.end("id | adapter | model | role | writes | tokens\nc1 | claude | opus | reviewer | nothing | unknown\nn1 | native | sonnet | implementer | live tree | unknown\n");
  assert.equal((await p.done).code, 0);
  const newAgent = async (id, text) => { const n = spawnNode([ENTRY, "--new", "--report-file", path.join(runDir, id, "report.json")], { env: s.env(), stdio: ["pipe", "pipe", "pipe"] }); n.child.stdin.end(text); return n.done; };
  const ok = await newAgent("c1", `RIGHTS: read ${s.work}\nMODEL: opus\nTASK: review\n`);
  assert.equal(ok.code, 0, ok.out + ok.err);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(runDir, "c1", "agent", "backend.json"), "utf8")), { adapter: "claude", planModel: "opus", planWrites: "nothing" });
  assert.match((await newAgent("n1", `RIGHTS: write ${s.work}\nMODEL: sonnet\nTASK: build\n`)).out, /is a native agent in the plan/);
});

// ------------------------------------------------------------------------------------------- status

test("status: ready, signed-out, outdated and missing, each one JSON line and exit 0", () => {
  const s = setup();
  const quiet = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^ANTHROPIC_(?:[A-Z]+_)?BASE_URL$/.test(k)));
  const raw = (more) => { const r = spawnSync(process.execPath, [STATUS, "--json"], { encoding: "utf8", env: { ...quiet, ...s.env(more) } }); assert.equal(r.status, 0); return r.stdout; };
  const status = (more) => JSON.parse(raw(more));
  assert.equal(status({}).status, "ready");
  // The route names the provider that receives a run's prompts, from what the CLI reports and this environment sets.
  assert.deepEqual(status({}).route, { apiProvider: "firstParty", authMethod: "claude.ai", baseUrls: {}, settingsBaseUrls: [], provider: "Anthropic" });
  assert.equal(status({ FAKE_CLAUDE_API_PROVIDER: "vertex" }).route.provider, "Google Vertex AI");
  assert.equal(status({ FAKE_CLAUDE_API_PROVIDER: "acme" }).route.provider, "apiProvider acme");
  const gateway = status({ ANTHROPIC_BASE_URL: "https://user:pw-secret@gw.example:8443/v1?key=q-secret" }).route;
  assert.deepEqual(gateway.baseUrls, { ANTHROPIC_BASE_URL: "https://gw.example:8443/v1" }); assert.equal(gateway.provider, "Anthropic (ANTHROPIC_BASE_URL=https://gw.example:8443/v1)");
  // The path is part of the route: a gateway can route by it, so two paths on one origin are two routes.
  assert.notEqual(status({ ANTHROPIC_BASE_URL: "https://gw.example/a" }).route.provider, status({ ANTHROPIC_BASE_URL: "https://gw.example/b/" }).route.provider);
  assert.equal(status({ ANTHROPIC_BASE_URL: "https://gw.example/b/" }).route.baseUrls.ANTHROPIC_BASE_URL, "https://gw.example/b");
  for (const value of ["gw token=sk-secret-1", "https://user:sk-secret-1@[bad"]) {
    const text = raw({ ANTHROPIC_BASE_URL: value }), route = JSON.parse(text).route;
    assert.equal(text.includes("sk-secret-1"), false, value); assert.equal(route.provider, null); assert.match(route.problem, /ANTHROPIC_BASE_URL is not a valid URL/);
  }
  assert.equal(status({ FAKE_CLAUDE_SIGNED_IN: "0" }).route, undefined);
  // A base URL only a settings file sets is not observed as effective (safe-mode application and precedence are not
  // measured): the route is unproven, names no provider and says why; the secret-bearing values never appear.
  const config = path.join(s.state, "claude-config"); fs.mkdirSync(config, { recursive: true });
  fs.writeFileSync(path.join(config, "settings.json"), JSON.stringify({ env: { ANTHROPIC_BASE_URL: "https://user:pw-secret@user.example/x" } }));
  fs.mkdirSync(path.join(s.work, ".claude"));
  fs.writeFileSync(path.join(s.work, ".claude", "settings.local.json"), JSON.stringify({ env: { ANTHROPIC_VERTEX_BASE_URL: "not a url sk-secret-2" } }));
  const here = spawnSync(process.execPath, [STATUS, "--json"], { cwd: s.work, encoding: "utf8", env: { ...quiet, ...s.env() } });
  assert.equal(here.stdout.includes("secret"), false); assert.equal(here.stdout.includes("user.example"), false);
  const route = JSON.parse(here.stdout).route;
  assert.equal(route.provider, null); assert.deepEqual(route.settingsBaseUrls, ["ANTHROPIC_BASE_URL (user settings)", "ANTHROPIC_VERTEX_BASE_URL (local settings)"]);
  assert.match(route.problem, /sets a base URL, and whether this run applies it is not measured/); assert.deepEqual(route.baseUrls, {});
  // An observed environment route is still named beside a stated settings one only as unproven: nothing is activated on it.
  fs.rmSync(path.join(s.work, ".claude"), { recursive: true }); fs.rmSync(config, { recursive: true });
  assert.equal(JSON.parse(spawnSync(process.execPath, [STATUS, "--json"], { cwd: s.work, encoding: "utf8", env: { ...quiet, ...s.env() } }).stdout).route.provider, "Anthropic");
  assert.equal(status({ FAKE_CLAUDE_SIGNED_IN: "0" }).status, "signed-out");
  assert.equal(status({ FAKE_CLAUDE_VERSION: "2.1.258" }).status, "outdated");
  const nodeOnly = tempDir("entrust-claude-nobin-");
  fs.symlinkSync(process.execPath, path.join(nodeOnly, "node"));
  assert.equal(status({ PATH: nodeOnly }).status, "missing");
});

// ------------------------------------------------------------------------------------------- live

test("live, opt-in: the real claude on Haiku through the launcher, an approval accepted", async () => {
  if (process.env.ENTRUST_LIVE_CLAUDE !== "1") return skip("set ENTRUST_LIVE_CLAUDE=1 to spend a real Haiku run");
  const s = setup();
  const work = tempDir("entrust-claude-live-");
  const h = await launched({ ...s, env: (more) => ({ ENTRUST_STATE_DIR: s.state, AGENT_RUN_RETURN_MS: "120000", ...more }) },
    `RIGHTS: read ${work}\nMODEL: haiku\nEFFORT: low\nTASK: Run exactly this shell command with the Bash tool: touch ${work}/made-live.txt\nThen report whether the file exists.\n`, "live");
  // In manual mode a touch is not in the read-only set, so it reaches the mailbox.
  const back = await go(h);
  const id = /^REQUEST=(\S+)$/m.exec(back.out)?.[1];
  assert.ok(id, back.out);
  const command = /COMMAND<<(\w+)\n([\s\S]*?)\nCOMMAND>>\1/.exec(back.out)?.[2];
  const body = command ?? JSON.parse(fs.readFileSync(path.join(h.dir, "approvals", `${id}.request.json`), "utf8")).presented;
  assert.match((await decide(h, id, "--accept", `${body}\n`)).out, /DECIDED=/);
  const end = await go(h);
  assert.match(end.out, /^EXIT=0$/m, end.out); assert.match(end.out, /approvals=1\/0\/0\/0/); assert.match(end.out, /model=Haiku/);
  assert.equal(fs.existsSync(path.join(work, "made-live.txt")), true);
});

process.exit(summarize(await runCases(cases), cases.length));
