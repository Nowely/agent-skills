#!/usr/bin/env node
// Runs one external Claude agent, `claude -p`, for the shared entrust launcher, and publishes its report.
//
//   node driver.mjs --check-prompt-file FILE
//   node driver.mjs --prompt-file FILE --report-file ABS [--approval-dir ABS] [--timeout seconds]
//   node driver.mjs --help
//
// It uses Claude Code's documented print mode only: stream-json out and the task on stdin, --json-schema for
// the return, --session-id, --resume and --fork-session for continuation, --permission-prompt-tool for the
// approvals, and SIGINT to stop, which ends the turn with a result where SIGTERM records none.
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { EXIT, canonical, flagValue, makeWorktree, passwdHome, resolveModel, resolveRights, rightsScope, within, worktreeFacts, writeRootProblem } from "../../orchestrate/scripts/drivers.mjs";
import { stateDirectory } from "../../orchestrate/scripts/temp-dir.mjs";
import { TOOL } from "./approvals.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(HERE, "approvals.mjs");
const SERVER_NAME = "entrust-approvals";
const FIVE_FIELDS = path.join(HERE, "../../orchestrate/schemas/five-fields.schema.json");
const MODELS = JSON.parse(fs.readFileSync(path.join(HERE, "../adapter.json"), "utf8")).plan.models;
const EFFORTS = ["low", "medium", "high", "xhigh", "max"];
const HEADERS = new Set(["RIGHTS", "MODEL", "EFFORT", "OUTPUT_SCHEMA", "RESUME", "SAFE_MODE", "ALLOW_NO_COMMANDS"]);
const PROTECTED = [{ dir: path.join(passwdHome(), ".claude"), label: "~/.claude", holds: "the settings, hooks and plugins every Claude Code session loads" }];
const READ_TOOLS = ["Read", "Grep", "Glob", "Bash"];
const WRITE_TOOLS = [...READ_TOOLS, "Edit", "Write"];
const DEFAULT_TIMEOUT_S = 1800;
// The volume bound every adapter has: Codex cuts at 1,000 commands, this driver at 1,000 tool calls.
const DEFAULT_MAX_TOOL_CALLS = 1000;
const STOP_GRACE_MS = 10000, KILL_GRACE_MS = 5000;
// Above the approval deadline: without a per-server timeout an MCP_TOOL_TIMEOUT in the environment cuts the
// wait (60 s cut a 70 s wait, and Claude Code cancelled the call and retried it).
const SERVER_TIMEOUT_MS = 31 * 60 * 1000;
// What a Claude Code session sets for the processes it starts and that names that session; an external agent
// launched from inside one is not part of it.
const SESSION_VARS = ["CLAUDECODE", "CLAUDE_CODE_ENTRYPOINT", "CLAUDE_CODE_CHILD_SESSION", "CLAUDE_CODE_SESSION_ID",
  "CLAUDE_CODE_MESSAGING_SOCKET", "CLAUDE_CODE_MESSAGING_TOKEN", "CLAUDE_PID", "CLAUDE_EFFORT"];

const USAGE = `driver — run one external Claude agent (claude -p) for the shared entrust launcher.

  node driver.mjs --check-prompt-file FILE
      Parse and check the prompt offline. Exit 0 and nothing printed on a pass; exit 2 with
      "entrust: refused: <reason>" on stderr otherwise. No model is called.
  node driver.mjs --prompt-file FILE --report-file ABS [--approval-dir ABS] [--timeout seconds]
      Run the prompt's TASK in one claude -p turn and publish the report JSON to stdout and,
      exclusively, to the report path. With --approval-dir every permission prompt is offered there;
      without it whatever would prompt is denied. --timeout is the wall clock (default ${DEFAULT_TIMEOUT_S} s),
      paused while a request waits; --max-tool-calls the volume bound (default ${DEFAULT_MAX_TOOL_CALLS}).

  The prompt: header lines, then TASK: and the task.
    RIGHTS: read [dir] | write <dir> | worktree <repo>   first; the plan's writes when a plan pins them
    MODEL: ${MODELS.join(" | ")} | claude-<id>             the plan's model when a plan pins it
    EFFORT: ${EFFORTS.join(" | ")}
    OUTPUT_SCHEMA: <absolute path>                        default: the five-field schema
    RESUME: <absolute path of an earlier claude report>   continues its session, in its directory
    SAFE_MODE: yes                                        no CLAUDE.md, memory, skills, plugins, hooks
                                                          or MCP servers; and so no approvals
  Exit codes: 0 done; 1 the run ended in error; 2 usage or refused; 3 timed out or stopped;
  4 claude missing or ended without a result; 6 an approval was declined or expired; 7 a call
  needed approval and the run had no mailbox; 10 the resumed run is still running; 13 no
  structured answer.
`;

const refusal = (reason) => ({ error: reason });
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };

// The prompt: `KEY: value` header lines, then TASK:, whose value and every line after it are the task.
export function parsePrompt(text, env = process.env, cwd = process.cwd()) {
  const lines = String(text).split(/\r\n|\n|\r/);
  const headers = {}, order = [], body = [];
  let started = false;
  for (const line of lines) {
    if (started) { body.push(line); continue; }
    const m = /^([A-Z][A-Z0-9_]*):(?:[ \t](.*))?$/.exec(line);
    if (m) {
      const key = m[1], value = (m[2] ?? "").trim();
      if (key === "TASK") { started = true; if (value) body.push(value); continue; }
      if (!HEADERS.has(key)) return refusal(`unsupported header ${key}`);
      if (Object.hasOwn(headers, key)) return refusal(`duplicate header ${key}`);
      headers[key] = value;
      order.push(key);
      continue;
    }
    if (line.trim() !== "") return refusal(`unrecognized line before TASK: ${JSON.stringify(line)}`);
  }
  if (!started) return refusal("the prompt has no TASK: line");
  while (body.length && body.at(-1).trim() === "") body.pop();
  const task = body.join("\n");
  if (!task.trim()) return refusal("the TASK body is empty");
  if (headers.RIGHTS !== undefined && order[0] !== "RIGHTS") return refusal("RIGHTS must be the first header when present");

  // A continuation keeps its run's rights, which RESUME below supplies; any other run declares them.
  let rights = headers.RESUME === undefined || headers.RIGHTS !== undefined || env.ENTRUST_PLAN_WRITES
    ? resolveRights(headers.RIGHTS, env.ENTRUST_PLAN_WRITES, cwd) : null;
  if (rights?.error) return refusal(rights.error);

  const planModel = env.ENTRUST_PLAN_MODEL || null;
  const pinned = resolveModel(headers.MODEL, planModel);
  if (pinned.error) return refusal(pinned.error);
  // An alias is passed as Claude Code spells it; a full id as written.
  const model = pinned.model === null ? null : MODELS.includes(pinned.model.toLowerCase()) ? pinned.model.toLowerCase() : pinned.model;
  if (model !== null && !MODELS.includes(model.toLowerCase()) && !/^claude-[a-z0-9][a-z0-9.-]*$/i.test(model))
    return refusal(`MODEL must be ${MODELS.join(", ")} or a claude-… model id, not ${JSON.stringify(model)}`);

  const effort = headers.EFFORT ?? null;
  if (effort !== null && !EFFORTS.includes(effort)) return refusal(`EFFORT must be one of ${EFFORTS.join(", ")}`);

  let schemaPath = FIVE_FIELDS;
  if (headers.OUTPUT_SCHEMA !== undefined) {
    if (!path.isAbsolute(headers.OUTPUT_SCHEMA)) return refusal("OUTPUT_SCHEMA must be an absolute path");
    schemaPath = headers.OUTPUT_SCHEMA;
  }
  const schema = readJson(schemaPath);
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return refusal(`OUTPUT_SCHEMA ${schemaPath} is not a JSON object`);

  const safeMode = headers.SAFE_MODE === undefined ? false : flagValue(headers.SAFE_MODE);
  if (safeMode === null) return refusal("SAFE_MODE takes yes, true or 1, or no, false or 0");
  const allowNoCommands = headers.ALLOW_NO_COMMANDS === undefined ? false : flagValue(headers.ALLOW_NO_COMMANDS);
  if (allowNoCommands === null) return refusal("ALLOW_NO_COMMANDS takes yes, true or 1, or no, false or 0");

  let resume = null;
  if (headers.RESUME !== undefined) {
    const at = headers.RESUME;
    if (!path.isAbsolute(at)) return refusal("RESUME must be the absolute path of an earlier claude report");
    const prior = readJson(at);
    if (!prior || prior.adapter !== "claude") return refusal(`RESUME ${at} is not a claude report`);
    // A report without an exit code is a claim: its driver is still running, or died before it published.
    if (typeof prior.exitCode !== "number")
      return Number.isInteger(prior.pid) && alive(prior.pid) ? { error: `RESUME ${at} names a run that has not finished`, busy: true }
        : refusal(`RESUME ${at} names a run that ended without a report; there is nothing to continue`);
    if (typeof prior.sessionID !== "string" || !prior.cwd) return refusal(`RESUME ${at} records no session to continue`);
    // The session runs in the run's directory with the run's rights: a RIGHTS line names the same, or none.
    const kept = keptRights(prior);
    if (!kept) return refusal(`RESUME ${at} records no rights to keep`);
    if (rights && !sameRights(rights, kept, cwd))
      return refusal(`RESUME: a continuation keeps its rights, ${kept.kind} ${kept.path}; name the same or leave RIGHTS out`);
    rights = kept;
    resume = { report: at, prior };
  }

  return { task, rights, model, effort, schemaPath, schemaText: JSON.stringify(schema), safeMode, allowNoCommands, resume };
}

// The rights a report's run had, as a RIGHTS line would name them; and whether a declared one names the same.
function keptRights(prior) {
  const kind = prior.rights?.kind;
  if (kind === "read") return { kind, path: prior.cwd };
  if (kind === "write" && prior.rights.roots?.[0]) return { kind, path: prior.rights.roots[0] };
  if (kind === "worktree" && prior.worktreeRepo) return { kind, path: prior.worktreeRepo };
  return null;
}
const sameRights = (a, b, cwd) => a.kind === b.kind && canonical(a.path ?? cwd, cwd) === canonical(b.path, cwd);

// A run's working directory and the roots it may write without a prompt. A write root passes the shared check:
// not the home or above it, not over the state directory, where the mailboxes are, nor over ~/.claude, whose
// settings, hooks and plugins every later session loads; acceptEdits writes inside the working directory unasked.
// The run's directory must exist: claude is spawned in it, and a missing cwd fails the spawn with the ENOENT
// a missing claude gives.
export function scopeOf(parsed, stateDir) {
  if (parsed.resume) {
    const { prior } = parsed.resume;
    if (!isDir(prior.cwd)) return { error: `RESUME: the run's directory ${prior.cwd} no longer exists` };
    return { kind: prior.rights.kind, cwd: prior.cwd, roots: prior.rights.roots ?? [], worktree: prior.worktreePath ? prior : null };
  }
  const s = rightsScope(parsed.rights);
  if (s.kind === "write") {
    const root = s.roots[0];
    if (!isDir(root)) return { error: `RIGHTS write ${root} is not an existing directory` };
    const why = writeRootProblem(root, { stateDir, protectedDirs: PROTECTED });
    if (why) return { error: why };
    return { kind: "write", cwd: s.readDir, roots: s.roots };
  }
  if (s.kind === "worktree") return { kind: "worktree", repo: s.repo, roots: [] };
  if (!isDir(s.readDir)) return { error: `RIGHTS read ${s.readDir} is not an existing directory` };
  return { kind: "read", cwd: s.readDir, roots: [] };
}

// The deny rules that keep every file tool, redirect and tee out of the mailboxes: this run's own, and any
// under the state directory but in the worktrees, where an agent's own tree may hold an approvals/ of its own.
// A deny rule outranks every allow rule, the user's included; Claude Code checks file paths against Edit rules
// only. A rule matches the path as the agent writes it, so a directory reached through a link gets both spellings.
export function mailboxRules(stateDir, box) {
  const spell = (p) => [...new Set([path.resolve(p), canonical(p)])];
  let entries = [];
  try { entries = fs.readdirSync(stateDir).filter((n) => n !== "worktrees"); } catch {}
  return [...(box ? spell(box).map((b) => `Edit(/${b}/**)`) : []),
    ...spell(stateDir).flatMap((d) => entries.map((n) => `Edit(/${d}/${n}/**/approvals/**)`))];
}

// The flags of one run.
export function claudeArgs(parsed, { kind, stateDir, box, sessionId, mcpConfig }) {
  const deny = mailboxRules(stateDir, box);
  const args = ["-p", "--output-format", "stream-json", "--verbose", "--json-schema", parsed.schemaText,
    "--permission-mode", kind === "read" ? "manual" : "acceptEdits",
    "--tools", (kind === "read" ? READ_TOOLS : WRITE_TOOLS).join(","),
    ...(deny.length ? ["--disallowedTools", ...deny] : [])];
  if (parsed.model) args.push("--model", parsed.model);
  if (parsed.effort) args.push("--effort", parsed.effort);
  if (parsed.resume) args.push("--resume", parsed.resume.prior.sessionID, "--fork-session");
  args.push("--session-id", sessionId);
  if (parsed.safeMode) args.push("--safe-mode");
  if (mcpConfig) args.push("--mcp-config", mcpConfig, "--permission-prompt-tool", `mcp__${SERVER_NAME}__${TOOL}`);
  else args.push("--permission-prompts", "none");
  return args;
}

export function childEnv(env) {
  const out = { ...env };
  for (const k of SESSION_VARS) delete out[k];
  return out;
}

function parseArgs(argv) {
  const o = { check: null, prompt: null, report: null, approvalDir: null, timeout: DEFAULT_TIMEOUT_S, maxToolCalls: DEFAULT_MAX_TOOL_CALLS, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], v = argv[i + 1];
    if (a === "--help") o.help = true;
    else if (a === "--check-prompt-file" && v) { o.check = v; i++; }
    else if (a === "--prompt-file" && v) { o.prompt = v; i++; }
    else if (a === "--report-file" && v) { o.report = v; i++; }
    else if (a === "--approval-dir" && v) { o.approvalDir = v; i++; }
    else if (a === "--timeout" && /^\d+$/.test(v ?? "") && Number(v) > 0) { o.timeout = Number(v); i++; }
    else if (a === "--max-tool-calls" && /^\d+$/.test(v ?? "") && Number(v) > 0) { o.maxToolCalls = Number(v); i++; }
    else return { error: `unknown or incomplete argument ${a}` };
  }
  return o;
}

const atomicWrite = (file, text) => {
  const tmp = `${file}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, text, { mode: 0o600 });
  fs.renameSync(tmp, file);
};

// What the mailbox says about this run's requests; the approval server is its only writer.
function escalations(box) {
  if (!box) return [];
  let names = [];
  try { names = fs.readdirSync(box).filter((n) => n.endsWith(".request.json")); } catch { return []; }
  return names.map((n) => readJson(path.join(box, n))).filter(Boolean)
    .sort((a, b) => Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10))
    .map((q) => ({ id: q.id, type: q.type ?? "command", method: q.method, command: q.command ?? null,
      tool: q.payload?.tool_name ?? null, decision: q.settled?.decision ?? "open", by: q.settled?.by ?? null }));
}

// The facts of a finished run, from its stream.
// An observation is a command that ran or a file read: a turn with none answered from nothing, which every
// adapter fails with exit 5 unless the prompt says ALLOW_NO_COMMANDS.
const OBSERVING = new Set(["Bash", "Read", "Grep", "Glob"]);
export const observations = (tools) => [...tools.values()].filter((t) => OBSERVING.has(t.tool) && t.isError === false).length;

export function verdict({ result, stopped, spawnError, exitCode, signal, box, denials, hasMailbox, observed = 1, allowNoCommands = false }) {
  const asked = escalations(box);
  if (spawnError) return { exitCode: EXIT.TRANSPORT, error: `claude could not be started: ${spawnError}`, turnStatus: "failed" };
  if (stopped) return { exitCode: EXIT.TIMEOUT, error: stopped, turnStatus: "aborted", partial: true };
  if (!result) return { exitCode: EXIT.TRANSPORT, error: `claude ended without a result (${signal ? `signal ${signal}` : `exit ${exitCode}`})`, turnStatus: "failed" };
  if (result.is_error) return { exitCode: EXIT.MODEL, error: typeof result.result === "string" && result.result ? result.result : `the run ended ${result.subtype}`, turnStatus: "failed",
    turnError: { subtype: result.subtype ?? null, terminalReason: result.terminal_reason ?? null, apiErrorStatus: result.api_error_status ?? null } };
  if (result.structured_output == null) return { exitCode: EXIT.SCHEMA, error: "the run returned no structured answer", turnStatus: "completed" };
  if (!hasMailbox && denials.length) return { exitCode: EXIT.NEEDS_INPUT, error: "a call needed approval and the run had no mailbox", turnStatus: "completed" };
  if (asked.some((q) => q.decision === "declined" || q.decision === "expired"))
    return { exitCode: EXIT.APPROVAL, error: "an approval was declined or expired", turnStatus: "completed" };
  if (!allowNoCommands && observed === 0)
    return { exitCode: EXIT.COMMANDS, error: "the agent observed nothing: it ran no command and read no file, and ALLOW_NO_COMMANDS is not yes", turnStatus: "completed" };
  return { exitCode: EXIT.SUCCESS, error: null, turnStatus: "completed" };
}

// Claims the report first, so that every refusal after the claim is a published report whose reason the
// launcher's status read prints on ERROR=; only a claim that fails is reported on stderr alone.
async function run(o, text) {
  const startedAtMs = Date.now();
  const invocationId = `inv_${crypto.randomBytes(6).toString("hex")}`;
  const report = o.report;
  const base = report.replace(/\.json$/, "");
  try { const fd = fs.openSync(report, "wx", 0o600); fs.writeSync(fd, `${JSON.stringify({ adapter: "claude", ok: false, status: "starting", pid: process.pid })}\n`); fs.closeSync(fd); }
  catch (e) { return refuse(e.code === "EEXIST" ? `${report} already exists, or is a symbolic link` : `could not be published at ${report}`); }
  // The pid line the launcher owns this run by and forwards a Stop to.
  process.stderr.write(`entrust: pid=${process.pid} identity=${invocationId} reportPath=${report}\n`);

  const ctx = { report, base, box: null, startedAtMs, invocationId, parsed: null, scope: null, sessionId: crypto.randomUUID(),
    transcriptPath: null, answerPath: null, init: null, result: null, tools: new Map(), stopped: null, sentInt: false, child: null };
  const publish = (facts) => {
    const r = buildReport(ctx, facts);
    atomicWrite(report, `${JSON.stringify(r, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
    return r.exitCode;
  };
  const refused = (error, exitCode = EXIT.USAGE) => publish({ exitCode, error, turnStatus: "failed" });
  // A stop before claude starts ends the run there; one after it is SIGINT, which ends the turn with a result.
  const stop = (why) => {
    const child = ctx.child;
    if (ctx.stopped || (child && child.exitCode !== null)) return;
    ctx.stopped = why;
    if (!child) return;
    ctx.sentInt = true;
    child.kill("SIGINT");
    setTimeout(() => { if (child.exitCode === null) child.kill("SIGTERM"); }, STOP_GRACE_MS).unref();
    setTimeout(() => { if (child.exitCode === null) child.kill("SIGKILL"); }, STOP_GRACE_MS + KILL_GRACE_MS).unref();
  };
  for (const s of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(s, () => stop(`stopped by ${s}`));

  try {
    const parsed = parsePrompt(text);
    if (parsed.error) return refused(parsed.error, parsed.busy ? EXIT.BUSY : EXIT.USAGE);
    ctx.parsed = parsed;
    const stateDir = stateDirectory();
    const box = o.approvalDir ? path.resolve(o.approvalDir) : null;
    if (box && !within(canonical(box), canonical(stateDir))) return refused(`--approval-dir ${box} is outside the state directory ${stateDir}`);
    ctx.box = box;
    const scope = scopeOf(parsed, stateDir);
    if (scope.error) return refused(scope.error);
    ctx.scope = scope;
    if (scope.kind === "worktree" && !scope.worktree) {
      const wt = makeWorktree(scope.repo, stateDir, invocationId);
      if (wt.error) return refused(wt.error);
      Object.assign(scope, { cwd: wt.worktreePath, roots: [wt.worktreePath], worktree: { worktreePath: wt.worktreePath, worktreeRepo: wt.repo, worktreeBase: wt.base } });
    }
    if (ctx.stopped) return publish(verdict({ stopped: ctx.stopped }));

    let mcpConfig = null;
    if (box && !parsed.safeMode) {
      mcpConfig = `${base}.mcp.json`;
      atomicWrite(mcpConfig, JSON.stringify({ mcpServers: { [SERVER_NAME]: { type: "stdio", command: process.execPath, args: [SERVER], timeout: SERVER_TIMEOUT_MS,
        env: { ENTRUST_APPROVAL_DIR: box, ENTRUST_RUN_PID: String(process.pid), ENTRUST_RUN_STARTED_MS: String(startedAtMs),
          ENTRUST_RUN_CWD: scope.cwd, ENTRUST_RUN_ROOTS: JSON.stringify(scope.roots) } } } }));
    }

    const args = claudeArgs(parsed, { kind: scope.kind, stateDir, box, sessionId: ctx.sessionId, mcpConfig });
    ctx.transcriptPath = `${base}.transcript.jsonl`;
    const transcript = fs.openSync(ctx.transcriptPath, "wx", 0o600);
    const child = ctx.child = spawn("claude", args, { cwd: scope.cwd, env: childEnv(process.env), stdio: ["pipe", "pipe", "inherit"] });
    // The wall clock counts the agent's own time: it stands still while a request waits in the mailbox, since
    // that wait is the coordinator's, and an approval given late must not find the run already cut.
    let worked = 0, tick = Date.now();
    const waiting = () => { try { return box && fs.readFileSync(path.join(box, "pending"), "utf8").trim() !== ""; } catch { return false; } };
    const timer = setInterval(() => {
      const t = Date.now();
      if (!waiting()) worked += t - tick;
      tick = t;
      if (worked > o.timeout * 1000) stop(`timed out after ${o.timeout} s of work`);
    }, 250);

    const lines = readline.createInterface({ input: child.stdout });
    lines.on("line", (line) => {
      fs.writeSync(transcript, `${line}\n`);
      let e;
      try { e = JSON.parse(line); } catch { return; }
      observe(ctx, e);
      if (ctx.tools.size > o.maxToolCalls) stop(`cut at its volume bound: more than ${o.maxToolCalls} tool calls`);
    });
    child.stdin.on("error", () => {});
    child.stdin.end(parsed.task);

    const [exitCode, signal, spawnError] = await new Promise((resolve) => {
      let closed = false, exited = null;
      const done = () => { if (closed && exited) resolve(exited); };
      child.on("error", (e) => { closed = true; exited = [null, null, e.code === "ENOENT" ? "claude is not on PATH" : e.message]; done(); });
      child.on("exit", (code, sig) => { exited = [code, sig, null]; done(); });
      lines.on("close", () => { closed = true; done(); });
    });
    clearInterval(timer);
    fs.closeSync(transcript);
    const denials = ctx.result?.permission_denials ?? [];
    return publish(verdict({ result: ctx.result, stopped: ctx.stopped, spawnError, exitCode, signal, box, denials, hasMailbox: Boolean(mcpConfig),
      observed: observations(ctx.tools), allowNoCommands: parsed.allowNoCommands }));
  } catch (e) {
    return publish({ exitCode: EXIT.TRANSPORT, error: `the driver failed: ${e.message}`, turnStatus: "failed" });
  }
}

// One stream event: the session's init, a tool call and its result, the run's result. A subagent's events
// carry a parent_tool_use_id and are not this run's own.
export function observe(ctx, e) {
  if (e.type === "system" && e.subtype === "init") ctx.init = e;
  else if (e.type === "result") ctx.result = e;
  else if ((e.type === "assistant" || e.type === "user") && !e.parent_tool_use_id && Array.isArray(e.message?.content)) {
    for (const b of e.message.content) {
      if (b.type === "tool_use") ctx.tools.set(b.id, { tool: b.name, input: b.input ?? {}, isError: null });
      if (b.type === "tool_result" && ctx.tools.has(b.tool_use_id)) ctx.tools.get(b.tool_use_id).isError = Boolean(b.is_error);
    }
  }
}

function buildReport(ctx, facts) {
  const { init, result, parsed, scope } = ctx;
  const tools = [...ctx.tools.values()];
  const answerJson = result?.structured_output ?? null;
  const answer = typeof result?.result === "string" ? result.result : null;
  if (answer !== null || answerJson !== null) {
    ctx.answerPath = `${ctx.base}.answer.txt`;
    try { atomicWrite(ctx.answerPath, answerJson !== null ? `${JSON.stringify(answerJson, null, 2)}\n` : answer); } catch { ctx.answerPath = null; }
  }
  return {
    adapter: "claude",
    ok: facts.exitCode === EXIT.SUCCESS,
    exitCode: facts.exitCode,
    error: facts.error ?? null,
    answer, answerJson, answerPath: ctx.answerPath,
    threadId: ctx.sessionId, sessionID: ctx.sessionId, turnId: null, invocationId: ctx.invocationId,
    model: init?.model ?? Object.keys(result?.modelUsage ?? {})[0] ?? null,
    requestedModel: parsed?.model ?? null, effort: parsed?.effort ?? null,
    claudeVersion: init?.claude_code_version ?? null,
    turnStatus: facts.turnStatus ?? null,
    receiptOk: result?.subtype === "success" && !result.is_error && answerJson !== null && !ctx.stopped,
    commands: tools.filter((t) => t.tool === "Bash").map((t) => ({ command: t.input.command ?? null, isError: t.isError })),
    tools: tools.map((t) => ({ tool: t.tool, isError: t.isError })),
    fileChanges: tools.filter((t) => ["Edit", "Write", "NotebookEdit"].includes(t.tool)).map((t) => ({ tool: t.tool, path: t.input.file_path ?? t.input.notebook_path ?? null, isError: t.isError })),
    usage: result?.usage ?? null, modelUsage: result?.modelUsage ?? null,
    cost: result?.total_cost_usd ?? null, costSource: "claude_estimate",
    durationMs: result?.duration_ms ?? null, numTurns: result?.num_turns ?? null,
    permissionDenials: result?.permission_denials ?? [],
    escalations: escalations(ctx.box),
    outputSchemaOk: answerJson !== null,
    partial: Boolean(facts.partial),
    cancellation: ctx.stopped ? { reason: ctx.stopped, signal: ctx.sentInt ? "SIGINT" : null } : null,
    cwd: scope?.cwd ?? null,
    rights: scope ? { kind: scope.kind, roots: scope.roots ?? [] } : null,
    resume: Boolean(parsed?.resume), resumedFrom: parsed?.resume?.report ?? null,
    context: init ? { permissionMode: init.permissionMode ?? null, plugins: (init.plugins ?? []).map((p) => p.name),
      mcpServers: (init.mcp_servers ?? []).map((s) => ({ name: s.name, status: s.status })), memory: Boolean(init.memory_paths),
      safeMode: parsed?.safeMode ?? null } : null,
    transcriptPath: ctx.transcriptPath,
    startedAt: new Date(ctx.startedAtMs).toISOString(),
    endedAt: new Date().toISOString(),
    turnError: facts.turnError ?? null,
    schemaOverflow: false,
    approvalsAutoAccepted: 0,
    ...(scope?.worktree ? worktreeFacts(scope.worktree) : {}),
  };
}

function refuse(reason) {
  process.stderr.write(`entrust: refused: ${reason}\n`);
  return EXIT.USAGE;
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.error) { process.stderr.write(`driver: ${o.error}\n${USAGE}`); process.exit(EXIT.USAGE); }
  if (o.help) { process.stdout.write(USAGE); process.exit(0); }
  const file = o.check ?? o.prompt;
  if (!file) { process.stderr.write(`driver: --prompt-file or --check-prompt-file is required\n${USAGE}`); process.exit(EXIT.USAGE); }
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch (e) { process.exit(refuse(`the prompt ${file} cannot be read: ${e.code ?? e.message}`)); }
  if (o.check) {
    const parsed = parsePrompt(text);
    if (parsed.error) process.exit(refuse(parsed.error));
    let state;
    try { state = stateDirectory(); } catch (e) { process.exit(refuse(e.message)); }
    const scope = scopeOf(parsed, state);
    process.exit(scope.error ? refuse(scope.error) : 0);
  }
  if (!o.report || !path.isAbsolute(o.report)) process.exit(refuse("--report-file must be an absolute path"));
  process.exit(await run(o, text));
}

const isEntry = (() => { try { return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isEntry) main();
