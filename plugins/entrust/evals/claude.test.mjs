#!/usr/bin/env node
// Does the Claude adapter run an external Claude agent the way its page and the shared launcher say? The
// driver, its approval server and its launcher hooks, against fake-claude.mjs on PATH as `claude`: the flags
// each prompt becomes, the report, the refusals, a stop, a continuation and the mailbox round trip. One opt-in
// case, ENTRUST_LIVE_CLAUDE=1, runs the real `claude` on Haiku through the launcher and spends a few cents.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawn, spawnSync } from "node:child_process";
import { EVALS, ROOT, registry, runCases, skip, spawnNode, summarize, tempDir } from "./lib/harness.mjs";
import { childEnv, mailboxRules, parsePrompt } from "../plugin/skills/claude/scripts/driver.mjs";
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
  return { state, work, log, env: (more = {}) => ({ ENTRUST_STATE_DIR: state, PATH: PATH_WITH_FAKE, FAKE_CLAUDE_LOG: log, ...more }) };
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
  for (const [text, why] of [
    [`MODEL: haiku\nRIGHTS: read ${s.work}\nTASK: look\n`, /RIGHTS must be the first header/],
    [`RIGHTS: read ${s.work}\nNETWORK: on\nTASK: look\n`, /unsupported header NETWORK/],
    [`RIGHTS: read ${s.work}\nMODEL: gpt-5\nTASK: look\n`, /MODEL must be/],
    [`RIGHTS: read ${s.work}\nEFFORT: huge\nTASK: look\n`, /EFFORT must be/],
    [`RIGHTS: read ${s.work}\nSAFE_MODE: no\nTASK: look\n`, /SAFE_MODE takes only yes/],
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
  assert.deepEqual(j.cancellation, { reason: "stopped by SIGTERM", signal: "SIGINT" }); assert.equal(j.receiptOk, false);
  const t = await drive(s, `RIGHTS: read ${s.work}\nTASK: wait\n`, { mode: "slow", args: ["--timeout", "1"] });
  assert.equal(t.code, 3); assert.match(t.json.error, /timed out after 1 s/);
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
  assert.equal(fs.readFileSync(path.join(h.dir, "approvals", "pending"), "utf8"), "");
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
  const status = (more) => { const r = spawnSync(process.execPath, [STATUS, "--json"], { encoding: "utf8", env: { ...process.env, ...s.env(more) } }); assert.equal(r.status, 0); return JSON.parse(r.stdout); };
  assert.equal(status({}).status, "ready");
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
