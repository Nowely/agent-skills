#!/usr/bin/env node
// Runs one external Claude agent, `claude -p`, for the shared entrust launcher, and publishes its report.
//
//   node driver.mjs --check-prompt-file FILE
//   node driver.mjs --prompt-file FILE --report-file ABS [--approval-dir ABS] [--timeout S] [--idle-timeout S] [--max-tool-calls N]
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
import { EXIT, canonical, flagValue, makeWorktree, passwdHome, resolveModel, resolveRights, rightsScope, standingRules, worktreeFacts, writeRootProblem } from "../../orchestrate/scripts/drivers.mjs";
import { mailboxProblem } from "../../orchestrate/scripts/mailbox.mjs";
import { stateDirectory } from "../../orchestrate/scripts/temp-dir.mjs";
import { checkSchemaSubset, validateOutput } from "../../orchestrate/scripts/json-schema.mjs";
import { admitRound } from "../../orchestrate/scripts/main-proxy.mjs";
import { TOOL } from "./approvals.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(HERE, "approvals.mjs");
const SERVER_NAME = "entrust-approvals";
const FIVE_FIELDS = path.join(HERE, "../../orchestrate/schemas/five-fields.schema.json");
const MODELS = JSON.parse(fs.readFileSync(path.join(HERE, "../adapter.json"), "utf8")).plan.models;
const EFFORTS = ["low", "medium", "high", "xhigh", "max"];
const HEADERS = new Set(["RIGHTS", "MODEL", "EFFORT", "OUTPUT_SCHEMA", "RESUME", "SAFE_MODE", "ALLOW_NO_COMMANDS", "PROFILE"]);
const PROTECTED = [{ dir: path.join(passwdHome(), ".claude"), label: "~/.claude", holds: "the settings, hooks and plugins every Claude Code session loads" }];
const READ_TOOLS = ["Read", "Grep", "Glob", "Bash"];
const WRITE_TOOLS = [...READ_TOOLS, "Edit", "Write"];
// What init must report for the rights asked for, measured on 2.1.295 (research/2026-10-09-step5-measurements):
// `--permission-mode manual` comes back as `default`, and the tools are exactly the ones `--tools` names, beside
// StructuredOutput, which `--json-schema` adds; MCP tools are the user's servers' and are named in `context`.
const MODES = { read: ["default", "manual"], write: ["acceptEdits"] };
// The sandbox the agent runs under is the one init reports: another mode, or another set of built-in tools,
// wider or narrower, stops the run rather than run it under rights nobody reasoned about.
const pluginName = (p) => (p && typeof p === "object" && typeof p.name === "string" ? p.name : String(p));
export function initProblem(init, kind, profile = "worker") {
  // A full session keeps Claude's own policy. Managed settings may replace the requested bypass with auto.
  if (profile === "proxy") return null;
  const level = kind === "read" ? "read" : "write";
  if (!MODES[level].includes(init.permissionMode))
    return `Claude Code reports permission mode ${init.permissionMode ?? "none"}, not this run's ${MODES[level][0]}`;
  const want = level === "read" ? READ_TOOLS : WRITE_TOOLS;
  const got = (init.tools ?? []).filter((t) => !t.startsWith("mcp__") && t !== "StructuredOutput");
  const extra = got.filter((t) => !want.includes(t)), missing = want.filter((t) => !got.includes(t));
  if (extra.length || missing.length)
    return `Claude Code reports the tools ${got.join(", ") || "none"}, not this run's ${want.join(", ")}`;
  return null;
}
// What bounds a run whose caller sized nothing, as a Codex agent's since 184bc339: silence and volume, and no wall
// clock unless the caller declares one. Silence is the stream's: an event of the run, a subagent's, a partial
// message's or a running tool's progress heartbeat included, is a sign of life. Claude Code writes that heartbeat every
// 30 s while a tool runs in the main conversation and none for a tool inside a subagent, so a subagent's long tool
// call is quiet, and no measurement yet bounds the quiet spans of a healthy run: this default is Codex's, not a
// proven one.
const DEFAULT_IDLE_TIMEOUT_S = 900;
// The envelopes a stream-json run writes: those 2.1.299 wrote with --include-partial-messages (system, stream_event,
// assistant, user, rate_limit_event, result) and the Agent SDK reference's tool_progress, tool_use_summary and
// auth_status (https://code.claude.com/docs/en/agent-sdk/typescript.md). Each is a sign of life; only whole
// assistant, user and result events are evidence. Another line, JSON or not, is neither.
const ENVELOPES = new Set(["system", "stream_event", "assistant", "user", "rate_limit_event", "result", "tool_progress", "tool_use_summary", "auth_status"]);
export const envelope = (e) => Boolean(e) && typeof e === "object" && !Array.isArray(e) && ENVELOPES.has(e.type);
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
  node driver.mjs --prompt-file FILE --report-file ABS [--approval-dir ABS] [--timeout S] [--idle-timeout S] [--max-tool-calls N]
      Run the prompt's TASK in one claude -p turn and publish the report JSON to stdout and,
      exclusively, to the report path. With --approval-dir every permission prompt is offered there;
      without it whatever would prompt is denied. No wall clock unless --timeout declares one: S
      seconds of work, 0 for none (the default). --idle-timeout cuts a run whose stream writes no
      event for S seconds (default ${DEFAULT_IDLE_TIMEOUT_S}, 0 disables). Both stand still while a request waits,
      and silence starts again from nothing once the last one is answered; work keeps its time.
      --max-tool-calls is the volume bound (default ${DEFAULT_MAX_TOOL_CALLS}). A cut or a stop ends the turn
      with exit 3 and a partial report whose cancellation.kind says which, and RESUME continues it.

  The prompt: header lines, then TASK: and the task.
    RIGHTS: read [dir] | write <dir> | worktree <repo>   first; the plan's writes when a plan pins them
    MODEL: ${MODELS.join(" | ")} | claude-<id>             the plan's model when a plan pins it
    EFFORT: ${EFFORTS.join(" | ")}
    OUTPUT_SCHEMA: <absolute path>                        default: the five-field schema
    RESUME: <absolute path of an earlier claude report>   continues its session, in its directory
    SAFE_MODE: yes                                        no CLAUDE.md, memory, skills, plugins, hooks
                                                          or MCP servers; and so no approvals
    PROFILE: proxy                                        the main proxy's full Claude Code session: native tools
                                                          and configuration, requests bypassPermissions, no idle
                                                          or volume bound, RESUME keeps its session id;
                                                          RIGHTS full names its directory
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
  const full = /^full (.+)$/.exec(headers.RIGHTS ?? "");
  if (full && env.ENTRUST_PLAN_WRITES) return refusal("RIGHTS full belongs to the main proxy, not a worker plan");
  let rights = full ? { kind: "full", path: full[1] }
    : headers.RESUME === undefined || headers.RIGHTS !== undefined || env.ENTRUST_PLAN_WRITES
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

  const subset = checkSchemaSubset(schema);
  if (!subset.ok) return refusal(`OUTPUT_SCHEMA: ${subset.errors.join("; ")}`);
  const submitted = { ...schema }, schemaTransform = [];
  if (schema.type === "object") for (const keyword of ["oneOf", "anyOf", "allOf"]) {
    if (Object.hasOwn(submitted, keyword)) { delete submitted[keyword]; schemaTransform.push(`dropped root ${keyword}`); }
  }
  if (submitted.type !== "object" || ["oneOf", "anyOf", "allOf"].some((k) => Object.hasOwn(submitted, k)))
    return refusal("OUTPUT_SCHEMA submission must be a root object without root combinators");
  const sha256 = (text) => crypto.createHash("sha256").update(text).digest("hex");
  const schemaText = JSON.stringify(submitted);
  const outputSchemaSha256 = sha256(fs.readFileSync(schemaPath));
  const submittedSchemaSha256 = sha256(schemaText);

  const safeFlag = headers.SAFE_MODE === undefined ? false : flagValue(headers.SAFE_MODE);
  if (safeFlag === null) return refusal("SAFE_MODE takes yes, true or 1, or no, false or 0");
  const allowFlag = headers.ALLOW_NO_COMMANDS === undefined ? false : flagValue(headers.ALLOW_NO_COMMANDS);
  if (allowFlag === null) return refusal("ALLOW_NO_COMMANDS takes yes, true or 1, or no, false or 0");
  if (headers.PROFILE !== undefined && headers.PROFILE !== "proxy")
    return refusal(`PROFILE must be proxy, not ${JSON.stringify(headers.PROFILE)}`);
  let profile = headers.PROFILE ?? null;

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
    // And its profile: a worker's report, or one from before profiles, never continues as the proxy; the removed
    // host-only coordinator's continues as nothing.
    const keptProfile = prior.profile ?? "worker";
    if (!["worker", "proxy"].includes(keptProfile)) return refusal(`RESUME ${at} is a ${keptProfile} run, a profile this driver no longer has; there is nothing to continue`);
    if (profile && profile !== keptProfile)
      return refusal(`RESUME: a continuation keeps its profile, ${keptProfile}; name the same or leave PROFILE out`);
    profile = keptProfile;
    resume = { report: at, prior };
  }
  profile ??= "worker";
  if ((profile === "proxy") !== (rights.kind === "full"))
    return refusal("PROFILE proxy requires RIGHTS full, which is reserved for the main proxy");
  if (profile === "proxy" && safeFlag) return refusal("PROFILE proxy loads Claude Code's own configuration; SAFE_MODE is incompatible");
  const safeMode = safeFlag, allowNoCommands = profile === "proxy" || allowFlag;

  return { task, rights, model, effort, schemaPath, schema, schemaText, outputSchemaSha256, submittedSchemaSha256, schemaTransform, safeMode, allowNoCommands, profile, resume };
}

// The rights a report's run had, as a RIGHTS line would name them; and whether a declared one names the same.
function keptRights(prior) {
  const kind = prior.rights?.kind;
  if (kind === "full") return { kind, path: prior.cwd };
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
  if (parsed.rights.kind === "full") {
    const cwd = canonical(parsed.rights.path);
    return isDir(cwd) ? { kind: "full", cwd, roots: [] } : { error: `RIGHTS full ${cwd} is not an existing directory` };
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
// The shared standing rules (orchestrate/scripts/drivers.mjs) in Claude Code's terms: a read run has no edit
// tools and runs the read-only commands unasked; a write run edits its directory unasked; every other call asks.
export function runRules({ kind, cwd, mailbox }) {
  return standingRules({
    rights: kind === "read"
      ? `Read and search any path available to Claude Code with Read, Grep and Glob, which need no approval; RIGHTS selects the working directory, not a read boundary. A shell command may need approval, and you have no edit tools.`
      : `Edits inside ${cwd} need no approval; an edit anywhere else, and a command outside the read-only set, needs one.`,
    network: "You have no web tools; a command that reaches the network needs approval.",
    mailbox,
    ask: "the call itself waits for that decision.",
  });
}

// The proxy is Claude Code as configured: no tool list, deny rule or rule text of the driver's, and its own
// permission policy. A continuation of it resumes the same session id; a worker's forks a new one.
export function claudeArgs(parsed, { kind, stateDir, box, sessionId, mcpConfig, cwd = process.cwd() }) {
  const proxy = parsed.profile === "proxy";
  const deny = proxy ? [] : mailboxRules(stateDir, box);
  // Partial messages are the stream's sign of life while a message is being written; only whole events are evidence.
  const args = ["-p", "--output-format", "stream-json", "--verbose", "--include-partial-messages", "--json-schema", parsed.schemaText,
    ...(proxy ? ["--dangerously-skip-permissions", "--chrome"] : [
    "--permission-mode", kind === "read" ? "manual" : "acceptEdits",
    "--tools", (kind === "read" ? READ_TOOLS : WRITE_TOOLS).join(","),
    ...(deny.length ? ["--disallowedTools", ...deny] : []),
    "--append-system-prompt", runRules({ kind, cwd, mailbox: Boolean(mcpConfig) })])];
  if (parsed.model) args.push("--model", parsed.model);
  if (parsed.effort) args.push("--effort", parsed.effort);
  if (parsed.resume) args.push("--resume", parsed.resume.prior.sessionID, ...(proxy ? [] : ["--fork-session"]));
  if (!proxy || !parsed.resume) args.push("--session-id", sessionId);
  if (parsed.safeMode) args.push("--safe-mode");
  if (mcpConfig) args.push("--mcp-config", mcpConfig, "--permission-prompt-tool", `mcp__${SERVER_NAME}__${TOOL}`);
  else if (!proxy) args.push("--permission-prompts", "none");
  return args;
}

export function childEnv(env) {
  const out = { ...env };
  for (const k of SESSION_VARS) delete out[k];
  return out;
}

const whole = (v) => (/^\d+$/.test(v ?? "") && Number.isSafeInteger(Number(v)) ? Number(v) : null);
function parseArgs(argv) {
  const o = { check: null, prompt: null, report: null, approvalDir: null, timeout: 0, idleTimeout: DEFAULT_IDLE_TIMEOUT_S, maxToolCalls: DEFAULT_MAX_TOOL_CALLS, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], v = argv[i + 1];
    if (a === "--help") o.help = true;
    else if (a === "--check-prompt-file" && v) { o.check = v; i++; }
    else if (a === "--prompt-file" && v) { o.prompt = v; i++; }
    else if (a === "--report-file" && v) { o.report = v; i++; }
    else if (a === "--approval-dir" && v) { o.approvalDir = v; i++; }
    // 0 is the documented "none" of both clocks; a count too large to be exact is no count.
    else if (a === "--timeout" && whole(v) !== null) { o.timeout = whole(v); i++; }
    else if (a === "--idle-timeout" && whole(v) !== null) { o.idleTimeout = whole(v); i++; }
    else if (a === "--max-tool-calls" && whole(v) > 0) { o.maxToolCalls = whole(v); i++; }
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

export function verdict({ result, stopped, wider, spawnError, exitCode, signal, box, denials, hasMailbox, observed = 1, allowNoCommands = false, unconfirmed = null }) {
  const asked = escalations(box);
  if (spawnError) return { exitCode: EXIT.TRANSPORT, error: `claude could not be started: ${spawnError}`, turnStatus: "failed" };
  if (wider) return { exitCode: EXIT.TRANSPORT, error: `${wider}; the run was stopped rather than run under rights nobody asked for`, turnStatus: "aborted", partial: true };
  if (stopped) return { exitCode: EXIT.TIMEOUT, error: stopped, turnStatus: "aborted", partial: true };
  if (!result) return { exitCode: EXIT.TRANSPORT, error: `claude ended without a result (${signal ? `signal ${signal}` : `exit ${exitCode}`})`, turnStatus: "failed" };
  if (result.is_error) return { exitCode: EXIT.MODEL, error: typeof result.result === "string" && result.result ? result.result : `the run ended ${result.subtype}`, turnStatus: "failed",
    turnError: { subtype: result.subtype ?? null, terminalReason: result.terminal_reason ?? null, apiErrorStatus: result.api_error_status ?? null } };
  if (unconfirmed) return { exitCode: EXIT.TRANSPORT, error: unconfirmed, turnStatus: "completed" };
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
    transcriptPath: null, answerPath: null, init: null, wider: null, unconfirmed: null, result: null, tools: new Map(), models: new Set(),
    stopped: null, cutKind: null, sentInt: false, child: null, longestSilenceMs: 0,
    limits: { timeoutS: o.timeout, idleTimeoutS: o.idleTimeout, maxToolCalls: o.maxToolCalls } };
  const publish = (facts) => {
    const r = buildReport(ctx, facts);
    atomicWrite(report, `${JSON.stringify(r, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
    return r.exitCode;
  };
  const refused = (error, exitCode = EXIT.USAGE) => publish({ exitCode, error, turnStatus: "failed" });
  // A stop before claude starts ends the run there; one after it is SIGINT, which ends the turn with a result.
  // `kind` names what stopped it: signal, wall, idle, volume or rights.
  const stop = (why, kind) => {
    const child = ctx.child;
    if (ctx.stopped || (child && child.exitCode !== null)) return;
    ctx.stopped = why; ctx.cutKind = kind;
    if (!child) return;
    ctx.sentInt = true;
    child.kill("SIGINT");
    setTimeout(() => { if (child.exitCode === null) child.kill("SIGTERM"); }, STOP_GRACE_MS).unref();
    setTimeout(() => { if (child.exitCode === null) child.kill("SIGKILL"); }, STOP_GRACE_MS + KILL_GRACE_MS).unref();
  };
  for (const s of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(s, () => stop(`stopped by ${s}`, "signal"));

  try {
    const parsed = parsePrompt(text);
    if (parsed.error) return refused(parsed.error, parsed.busy ? EXIT.BUSY : EXIT.USAGE);
    ctx.parsed = parsed;
    if (parsed.profile === "proxy") {
      if (parsed.resume) ctx.sessionId = parsed.resume.prior.sessionID;
      o.idleTimeout = 0; o.maxToolCalls = 0;
      Object.assign(ctx.limits, { idleTimeoutS: 0, maxToolCalls: null });
    }
    const stateDir = stateDirectory();
    const box = parsed.profile !== "proxy" && o.approvalDir ? path.resolve(o.approvalDir) : null;
    const misplaced = box && mailboxProblem(box, stateDir);
    if (misplaced) return refused(misplaced);
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
    // A proxy round starts only under its mode's consent as it stands now, and the admission saves the round's durable
    // claim under the mode's lock: an end before it refuses the round, and no new round starts from another host
    // session, a replaced mode or another route.
    if (parsed.profile === "proxy") {
      const why = admitRound(report, process.pid);
      if (why) return refused(why);
    }

    let mcpConfig = null;
    if (box && !parsed.safeMode) {
      mcpConfig = `${base}.mcp.json`;
      atomicWrite(mcpConfig, JSON.stringify({ mcpServers: { [SERVER_NAME]: { type: "stdio", command: process.execPath, args: [SERVER], timeout: SERVER_TIMEOUT_MS,
        env: { ENTRUST_APPROVAL_DIR: box, ENTRUST_RUN_PID: String(process.pid), ENTRUST_RUN_STARTED_MS: String(startedAtMs),
          ENTRUST_RUN_CWD: scope.cwd, ENTRUST_RUN_ROOTS: JSON.stringify(scope.roots),
          ENTRUST_RUN_STATE_DIR: stateDir, ENTRUST_RUN_PROTECTED: JSON.stringify(PROTECTED) } } } }));
    }

    const args = claudeArgs(parsed, { kind: scope.kind, stateDir, box, sessionId: ctx.sessionId, mcpConfig, cwd: scope.cwd });
    ctx.transcriptPath = `${base}.transcript.jsonl`;
    const transcript = fs.openSync(ctx.transcriptPath, "wx", 0o600);
    ctx.spawnedAt = new Date().toISOString();
    const child = ctx.child = spawn("claude", args, { cwd: scope.cwd, env: childEnv(process.env), stdio: ["pipe", "pipe", "inherit"] });
    // Both clocks count the run's own time: they stand still while a request waits in the mailbox, since that wait
    // is the coordinator's, and an approval given late must not find the run already cut. Once the last request is
    // settled, silence starts again from nothing, as Codex's does, while work keeps the time it had. The wall clock
    // runs only when declared; silence is reset by every event of the run.
    let worked = 0, quiet = 0, tick = Date.now(), waited = false;
    const waiting = () => { try { return box && fs.readFileSync(path.join(box, "pending"), "utf8").trim() !== ""; } catch { return false; } };
    const timer = setInterval(() => {
      const t = Date.now(), elapsed = t - tick;
      tick = t;
      if (waiting()) { waited = true; return; }
      if (waited) { waited = false; quiet = 0; return; }
      worked += elapsed; quiet += elapsed;
      ctx.longestSilenceMs = Math.max(ctx.longestSilenceMs, quiet);
      if (o.timeout && worked > o.timeout * 1000) stop(`timed out after ${o.timeout} s of work`, "wall");
      else if (o.idleTimeout && quiet > o.idleTimeout * 1000) stop(`stalled: claude wrote no event of the run for ${o.idleTimeout} s`, "idle");
    }, 250);

    const lines = readline.createInterface({ input: child.stdout });
    lines.on("line", (line) => {
      fs.writeSync(transcript, `${line}\n`);
      let e;
      try { e = JSON.parse(line); } catch { return; }
      if (!envelope(e)) return;
      quiet = 0;
      observe(ctx, e);
      if (e === ctx.init && !ctx.wider && (ctx.wider = initProblem(e, scope.kind, parsed.profile))) stop(ctx.wider, "rights");
      if (o.maxToolCalls && ctx.tools.size > o.maxToolCalls) stop(`cut at its volume bound: more than ${o.maxToolCalls} tool calls`, "volume");
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
    // A proxy session is attributed by its init; a stream that held none confirmed no session.
    if (parsed.profile === "proxy" && !ctx.init) ctx.unconfirmed = "Claude Code reported no init, so this proxy session was never confirmed";
    // A worker with no mailbox fails on a denied call. The proxy runs under Claude's own policy: a denied call is
    // Claude's to handle in its answer, and the report keeps every denial.
    const denials = parsed.profile === "proxy" ? [] : ctx.result?.permission_denials ?? [];
    return publish(verdict({ result: ctx.result, stopped: ctx.stopped, wider: ctx.wider, spawnError, exitCode, signal, box, denials, hasMailbox: Boolean(mcpConfig),
      observed: observations(ctx.tools), allowNoCommands: parsed.allowNoCommands, unconfirmed: ctx.unconfirmed }));
  } catch (e) {
    return publish({ exitCode: EXIT.TRANSPORT, error: `the driver failed: ${e.message}`, turnStatus: "failed" });
  }
}

// One stream event: the session's init, a tool call and its result, the model that answered, the run's result.
// A subagent's events carry a parent_tool_use_id and are not this run's own; a <synthetic> message no model wrote.
export function observe(ctx, e) {
  ctx.firstEventAt ??= new Date().toISOString();
  if (e.type === "system" && e.subtype === "init") ctx.init = e;
  else if (e.type === "result") { ctx.result = e; ctx.resultAt = new Date().toISOString(); }
  else if ((e.type === "assistant" || e.type === "user") && !e.parent_tool_use_id && Array.isArray(e.message?.content)) {
    if (e.type === "assistant" && typeof e.message.model === "string" && e.message.model !== "<synthetic>") ctx.models?.add(e.message.model);
    for (const b of e.message.content) {
      if (b.type === "tool_use") ctx.tools.set(b.id, { tool: b.name, input: b.input ?? {}, isError: null });
      if (b.type === "tool_result" && ctx.tools.has(b.tool_use_id)) ctx.tools.get(b.tool_use_id).isError = Boolean(b.is_error);
    }
  }
}

function buildReport(ctx, facts) {
  const { init, result, parsed, scope } = ctx;
  const tools = [...ctx.tools.values()];
  const rawAnswerJson = result?.structured_output ?? null;
  const checked = parsed?.schema && rawAnswerJson !== null ? validateOutput(parsed.schema, rawAnswerJson)
    : { ok: false, errors: ["no structured answer to validate"] };
  if (rawAnswerJson !== null && !checked.ok && !result.is_error && !facts.partial)
    facts = { ...facts, exitCode: EXIT.SCHEMA, error: checked.errors.join("; ") };
  const answerJson = checked.ok ? rawAnswerJson : null;
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
    threadId: ctx.sessionId, sessionID: ctx.sessionId, turnId: null,
    model: init?.model ?? Object.keys(result?.modelUsage ?? {})[0] ?? null,
    requestedModel: parsed?.model ?? null, effort: parsed?.effort ?? null,
    assistantModels: [...ctx.models], profile: parsed?.profile ?? null,
    claudeVersion: init?.claude_code_version ?? null,
    turnStatus: facts.turnStatus ?? null,
    receiptOk: result?.subtype === "success" && !result.is_error && answerJson !== null && !ctx.stopped && !ctx.wider && !ctx.unconfirmed,
    commands: tools.filter((t) => t.tool === "Bash").map((t) => ({ command: t.input.command ?? null, isError: t.isError })),
    tools: tools.map((t) => ({ tool: t.tool, isError: t.isError })),
    fileChanges: tools.filter((t) => ["Edit", "Write", "NotebookEdit"].includes(t.tool)).map((t) => ({ tool: t.tool, path: t.input.file_path ?? t.input.notebook_path ?? null, isError: t.isError })),
    usage: result?.usage ?? null, modelUsage: result?.modelUsage ?? null,
    cost: result?.total_cost_usd ?? null,
    spawnedAt: ctx.spawnedAt ?? null, firstEventAt: ctx.firstEventAt ?? null, resultAt: ctx.resultAt ?? null,
    durationMs: result?.duration_ms ?? null, durationApiMs: result?.duration_api_ms ?? null, numTurns: result?.num_turns ?? null,
    permissionDenials: result?.permission_denials ?? [],
    escalations: escalations(ctx.box),
    outputSchemaOk: checked.ok, schemaErrors: checked.errors,
    outputSchemaPath: parsed?.schemaPath ?? null, outputSchemaSha256: parsed?.outputSchemaSha256 ?? null,
    submittedSchemaSha256: parsed?.submittedSchemaSha256 ?? null, schemaTransform: parsed?.schemaTransform ?? [],
    partial: Boolean(facts.partial),
    cancellation: ctx.stopped ? { reason: ctx.stopped, kind: ctx.cutKind, signal: ctx.sentInt ? "SIGINT" : null } : null,
    // The longest span the stream wrote nothing, at the clocks' 250 ms grain and outside approval waits: what a
    // real run measures about the silence a healthy one has.
    limits: ctx.limits, longestSilenceMs: ctx.longestSilenceMs,
    cwd: scope?.cwd ?? null,
    rights: scope ? { kind: scope.kind, roots: scope.roots ?? [] } : null,
    resumedFromSession: parsed?.resume?.prior?.sessionID ?? null,
    resume: Boolean(parsed?.resume), resumedFrom: parsed?.resume?.report ?? null,
    context: init ? { permissionMode: init.permissionMode ?? null, tools: init.tools ?? [], plugins: (init.plugins ?? []).map(pluginName),
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
