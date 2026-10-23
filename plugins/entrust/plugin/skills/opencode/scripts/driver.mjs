#!/usr/bin/env node
// Run one invocation against a private local OpenCode server the driver starts and stops.
//
//   node driver.mjs --check-prompt-file FILE
//   node driver.mjs --prompt-file FILE --report-file ABS [--approval-dir ABS]
//                   [--timeout seconds] [--idle-timeout seconds] [--max-commands N] [--help]
//
// Native wait is not used; history and active state establish completion. There is no steer: a coordinator
// continues an agent with RESUME after its turn.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "./client.mjs";
import { recentModels, splitModel, modelKey, digest, id, sleep, atomicJson, readJson } from "./config.mjs";
import { startLocalServer } from "./local-server.mjs";
import { deadlineMs, mailboxProblem, openMailbox } from "../../orchestrate/scripts/mailbox.mjs";
import { stateDirectory } from "../../orchestrate/scripts/temp-dir.mjs";
import { git, guardedTarget, makeWorktree, passwdHome, rightsScope, scopeWithin, standingRules, worktreeFacts, writeRootProblem } from "../../orchestrate/scripts/drivers.mjs";
import {
  EXIT, parsePrompt, validateOutput, extractJson, envelope, decisionsOf, canonical, within,
  commandEvidence, expectation, READ_TOOLS,
  formValue,
} from "./contract.mjs";

const POLL_MS = 900;
// No wall clock unless the caller declares one, as a Codex and a Claude agent since 184bc339; silence and volume bound
// a run whose caller sized nothing. 600 s is this adapter's own idle default, kept: OpenCode reports busy sessions, so
// its silence is measured against the server, not the stream alone.
const DEFAULT_TIMEOUT_S = 0;
const DEFAULT_IDLE_S = 600;
// The volume bound every adapter has, as Codex's 1,000 commands.
const DEFAULT_MAX_COMMANDS = 1000;
const CLAIM_POLLS = 6;
const SIGNALS = ["SIGTERM", "SIGINT", "SIGHUP"];

const USAGE = `driver — run one OpenCode invocation for the shared entrust launcher.

  node driver.mjs --check-prompt-file FILE
      Parse and validate the prompt offline. Exit 0 on a pass, exit 2 with
      "entrust: refused: <reason>" on stderr, exactly. No server is contacted.
  node driver.mjs --prompt-file FILE --report-file ABS [--approval-dir ABS]
                  [--timeout seconds] [--idle-timeout seconds] [--max-commands N]
      Start a private local server, run one selected invocation and publish
      the report JSON to stdout and exclusively to the report path. No overwrite.
      --timeout is a wall clock of S seconds of work, declared only by the caller (default ${DEFAULT_TIMEOUT_S}: none);
      --idle-timeout the no-progress clock (default ${DEFAULT_IDLE_S}s, 0 disables); --max-commands a cap on executed
      bash commands (default ${DEFAULT_MAX_COMMANDS}, 0 unlimited). Both clocks stand still while a request waits for its
      decision, as the driver observes it, and silence starts again in full from the decision. A definite native response
      to the reply, a 4xx included, is liveness, not proof the answer was applied. The two clocks take whole seconds,
      --max-commands a whole count.
  node driver.mjs --help
`;

// ---------------------------------------------------------------------------------------------
// Small shared helpers

const read = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return null; } };
const now = () => Date.now();
const isRegularFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };

const fillRoute = (tpl, params) => tpl.replace(/\{([^}]+)\}/g, (_, k) => encodeURIComponent(params[k]));

// A whole number of seconds or commands, 0 meaning none: no fraction, sign, exponent, blank or unsafe-large value.
const whole = (v) => (/^\d+$/.test(v ?? "") && Number.isSafeInteger(Number(v)) ? Number(v) : null);

function parseArgs(argv) {
  const o = {
    check: null, prompt: null, report: null, approvalDir: null,
    timeout: DEFAULT_TIMEOUT_S, idle: DEFAULT_IDLE_S, maxCommands: DEFAULT_MAX_COMMANDS, help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") o.help = true;
    else if (a === "--check-prompt-file") o.check = argv[++i];
    else if (a === "--prompt-file") o.prompt = argv[++i];
    else if (a === "--report-file") o.report = argv[++i];
    else if (a === "--approval-dir") o.approvalDir = argv[++i];
    else if (a === "--timeout") o.timeout = whole(argv[++i]);
    else if (a === "--idle-timeout") o.idle = whole(argv[++i]);
    else if (a === "--max-commands") o.maxCommands = whole(argv[++i]);
    else return { error: `unknown argument: ${a}` };
  }
  for (const [k, v] of [["timeout", o.timeout], ["idle-timeout", o.idle], ["max-commands", o.maxCommands]])
    if (v === null) return { error: `--${k} must be a non-negative whole number` };
  return o;
}

function refuse(reason) {
  process.stderr.write(`entrust: refused: ${String(reason).replace(/\s*\n\s*/g, " ")}\n`);
  return EXIT.USAGE;
}

// The V2 routes this driver uses. Every list result arrives as { data: [...] }; replies that only
// acknowledge answer 204 with an empty body.
const ROUTES = Object.freeze({
    create: "/api/session",
    permissionList: "/api/session/{sessionID}/permission",
    permissionReply: "/api/session/{sessionID}/permission/{requestID}/reply",
    formList: "/api/session/{sessionID}/form",
    formReply: "/api/session/{sessionID}/form/{formID}/reply",
    formCancel: "/api/session/{sessionID}/form/{formID}",
    children: "/api/session?parentID={sessionID}",
    abort: "/api/session/{sessionID}/interrupt",
    prompt: "/api/session/{sessionID}/prompt",
    messages: "/api/session/{sessionID}/message",
    active: "/api/session/active",
    sessionGet: "/api/session/{sessionID}",
    model: "/api/session/{sessionID}/model",
});

function routeError(ctx) {
  const r = ctx.routes;
  const required = [[r.create, "post"], [r.prompt, "post"], [r.messages, "get"], [r.sessionGet, "get"],
    [r.active, "get"], [r.abort, "post"], [r.children.split("?")[0], "get"], [r.permissionList, "get"],
    [r.permissionReply, "post"], [r.formList, "get"], [r.formReply, "post"], [r.formCancel, "delete"]];
  return required.some(([route, method]) => !ctx.server.paths[route]?.[method])
    ? "server does not advertise the required V2 interaction routes" : null;
}

async function listOrEmpty(client, route) {
  const r = await client.call("GET", route, undefined, { unwrap: true });
  if (Array.isArray(r)) return r;
  throw new Error(`${route}: expected a native request array`);
}

// The permissions and forms pending in each of `sessions`, every list read at once. With `skipRefused`, a
// session the server refuses to list (a 4xx) contributes nothing; a transport failure or a 5xx always throws.
async function pendingIn(ctx, sessions, { skipRefused = false } = {}) {
  const list = (route, sid) => listOrEmpty(ctx.client, fillRoute(route, { sessionID: sid }))
    .catch((e) => { if (skipRefused && e.status != null && e.status < 500) return []; throw e; });
  const lists = await Promise.all([...sessions].flatMap((sid) => [list(ctx.routes.permissionList, sid), list(ctx.routes.formList, sid)]));
  return { permissions: lists.filter((_, i) => i % 2 === 0).flat(), forms: lists.filter((_, i) => i % 2 === 1).flat() };
}

// /api/session/active lists only the busy sessions: presence of the key means running.
const isBusy = (active, sid) => Boolean(active && typeof active === "object" && Object.prototype.hasOwnProperty.call(active, sid));

// A message's parts; a tool part is { type, id, name, state, time }.
const contentOf = (m) => m?.content ?? [];

function collectTools(messages) {
  const tools = [];
  for (const m of messages ?? []) for (const p of contentOf(m)) {
    if (p?.type !== "tool") continue;
    const state = p.state ?? {};
    const text = (state.content ?? []).filter((c) => c?.type === "text").map((c) => c.text ?? "").join("");
    tools.push({
      tool: p.name ?? null,
      callID: p.id ?? null,
      status: state.status ?? null,
      command: state.input?.command ?? null,
      description: state.input?.description ?? state.metadata?.description ?? null,
      exit: state.metadata?.exit ?? null,
      output: text || null,
      filePath: state.input?.filePath ?? state.input?.path ?? null,
    });
  }
  return tools;
}

const answerText = (reply) =>
  contentOf(reply).filter((p) => p?.type === "text").map((p) => p.text ?? "").join("");

function addTokens(acc, t) {
  if (!t || typeof t !== "object") return acc;
  for (const k of ["input", "output", "reasoning", "total"])
    if (typeof t[k] === "number") acc[k] = (acc[k] ?? 0) + t[k];
  if (t.cache && typeof t.cache === "object") {
    acc.cache = acc.cache ?? { read: 0, write: 0 };
    for (const k of ["read", "write"]) if (typeof t.cache[k] === "number") acc.cache[k] += t.cache[k];
  }
  return acc;
}

// ---------------------------------------------------------------------------------------------
// Rights and the worktree

// Session permission rules. V2's ordered array: { action, resource, effect }, last match wins.
// External paths do not gate reads. Shell is allowed without prompts; edit tools stay scoped separately,
// but those tool rules do not constrain shell effects.
function sessionPermissions(scope) {
  const rules = [
    { action: "*", resource: "*", effect: "ask" },
    { action: "read", resource: "*", effect: "allow" },
    { action: "list", resource: "*", effect: "allow" },
    { action: "glob", resource: "*", effect: "allow" },
    { action: "grep", resource: "*", effect: "allow" },
    { action: "external_directory", resource: "*", effect: "allow" },
    { action: "shell", resource: "*", effect: "allow" },
  ];
  if (scope.kind === "read") {
    rules.push({ action: "edit", resource: "*", effect: "deny" });
    return rules;
  }
  rules.push({ action: "edit", resource: "*", effect: "ask" });
  for (const root of scope.roots) {
    const p = root.replace(/\/+$/, "");
    rules.push({ action: "edit", resource: `${p}/**`, effect: "allow" });
  }
  // After the allows, so they win: what git and OpenCode load from a tree is never the agent's to write. A
  // rewritten .git file points every later git in the tree, the driver's diff included, at a repository the
  // agent made; hooks and config run with the caller's rights. A wildcard matches any character, `/` too.
  for (const root of scope.roots) {
    const p = root.replace(/\/+$/, "");
    for (const resource of [`${p}/.git`, `${p}/.git/*`, `${p}/*/.git`, `${p}/*/.git/*`, `${p}/.opencode/*`, `${p}/opencode.json*`])
      rules.push({ action: "edit", resource, effect: "deny" });
  }
  return rules;
}

// The rights a report's run had, as a RIGHTS line would name them.
function keptRights(prior) {
  const kind = prior.rights?.kind;
  if (kind === "read") return prior.cwd ? { kind, path: prior.cwd } : null;
  if (kind === "write" && prior.rights.roots?.[0]) return { kind, path: prior.rights.roots[0] };
  if (kind === "worktree" && prior.worktreeRepo) return { kind, path: prior.worktreeRepo };
  return null;
}
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };

// A write root must exist and pass the shared check: not the home or above it, not over the state directory,
// where the mailboxes are (an agent allowed to edit there could approve its own requests), nor over OpenCode's
// own configuration and data.
const XDG = (name, fallback) => process.env[name] && path.isAbsolute(process.env[name]) ? process.env[name] : path.join(passwdHome(), fallback);
const PROTECTED = [
  { dir: path.join(XDG("XDG_CONFIG_HOME", ".config"), "opencode"), label: "OpenCode's configuration", holds: "its plugins, agents and providers" },
  { dir: path.join(XDG("XDG_DATA_HOME", ".local/share"), "opencode"), label: "OpenCode's data directory", holds: "its credentials and sessions" },
];
function writeRootError(parsed) {
  if (parsed.rights?.kind !== "write") return null;
  const root = rightsScope(parsed.rights).roots[0];
  try { if (!fs.statSync(root).isDirectory()) return `RIGHTS write ${root} is not an existing directory`; }
  catch { return `RIGHTS write ${root} is not an existing directory`; }
  let stateDir;
  try { stateDir = stateDirectory(); } catch (e) { return e.message; }
  return writeRootProblem(root, { stateDir, protectedDirs: PROTECTED });
}

// The rules the server reports a session holds, against the ones this run's rights need. Those rules are all
// the enforcement OpenCode has, and a server can drop them silently, so a session holding others, wider or
// narrower, is not run, a resumed one too. One the server reports no rules for is said on stderr: their
// effect is then unverified.
function rulesProblem(session, scope) {
  if (!Array.isArray(session?.permissions)) {
    process.stderr.write(`entrust: the server reported no permission rules for session ${session?.id}; their effect is unverified\n`);
    return null;
  }
  return JSON.stringify(session.permissions) === JSON.stringify(sessionPermissions(scope)) ? null
    : `session ${session.id} holds permission rules other than the ones this run's ${scope.kind} rights need; refusing to run under rules nobody asked for`;
}

// What the driver decides about an edit request before any coordinator sees it. Inside the roots the session
// rules allow edits unasked. One outside them is offered (`outside`), the whole request the body the
// coordinator restates, unless it cannot be placed or aims inside the state directory or a directory OpenCode
// loads from (`decline`, the reason). A read run's rules deny edits, so none is asked.
function editScope(scope, payload, cwd, guard) {
  const kind = String(payload?.action ?? "").toLowerCase();
  if (!/edit|write|patch|create|delete|move|rename/.test(kind)) return {};
  const targets = payload?.resources ?? [];
  if (!scope.roots.length) return { decline: "the run has no declared writes scope" };
  if (!Array.isArray(targets) || !targets.length) return { decline: "the write request has no verifiable target" };
  let outside = false;
  for (const target of targets) {
    if (typeof target !== "string" || /[*?\[\]]/.test(target)) return { decline: "the write request has no exact target" };
    const abs = canonical(target, cwd);
    if (scope.roots.some((root) => within(abs, canonical(root, cwd)))) continue;
    const guarded = guardedTarget(abs, guard);
    if (guarded) return { decline: guarded };
    outside = true;
  }
  return { outside };
}

// ---------------------------------------------------------------------------------------------
// Approval mailbox

// Settles q, its record first (orchestrate/scripts/mailbox.mjs). Returns whether the record holds it; with no
// mailbox there is nothing to record.
function settleRequestFile(ctx, q, settlement) {
  if (ctx.box) { const held = ctx.box.settle(q, settlement); noteWait(ctx); return held; }
  q.settled = settlement;
  noteWait(ctx);
  return true;
}

// The time a request waits for the coordinator is counted at the transitions themselves, never at a poll. A request waits
// until its decision is known: the coordinator's answer, its deadline, or the driver's own refusal (decidedAt), whichever
// way the native reply to it then goes. The first waiting request starts the span; the decision of the last ends it, adds
// the span to waitedMs (work time excludes it) and starts silence again from that moment. The native call that follows is
// the driver's and the server's work, and its acknowledgement counts as progress.
export function noteWait(ctx) {
  const open = [...ctx.requests.values()].some((q) => !q.settled && q.decidedAt == null), t = now();
  ctx.waitedMs ??= 0;
  if (open && ctx.waitingSince == null) ctx.waitingSince = t;
  else if (!open && ctx.waitingSince != null) { ctx.waitedMs += t - ctx.waitingSince; ctx.waitingSince = null; ctx.lastProgressMs = t; }
}

// V2 lists a request only under its own session, a descendant's included.
async function currentServerRequest(ctx, q) {
  const route = q.type === "opencode.permission" ? ctx.routes.permissionList : ctx.routes.formList;
  const list = await listOrEmpty(ctx.client, fillRoute(route, { sessionID: q.payload.sessionID }));
  return list.find((r) => r?.id === q.payload.id) ?? null;
}

// V2 answers a permission reply and a form reply with 204 and no body: the acknowledgement is the
// status itself. A 4xx is a definite refusal of the reply; anything else is unknown. A form decline
// is the form's DELETE route, its reason (`body.message`) a query parameter.
async function respond(ctx, type, requestID, kind, body, sessionID) {
  const route = type === "opencode.permission"
    ? ctx.routes.permissionReply
    : kind === "answer" ? ctx.routes.formReply : ctx.routes.formCancel;
  const decline = kind === "decline" && type !== "opencode.permission";
  const url = fillRoute(route, { sessionID, requestID, formID: requestID })
    + (decline && body?.message ? `?message=${encodeURIComponent(body.message)}` : "");
  try {
    const result = await ctx.client.call(decline ? "DELETE" : "POST", url, decline ? undefined : body,
      { expectedStatus: 204 });
    ctx.lastProgressMs = now();
    return { outcome: result === null ? "applied" : "unknown" };
  } catch (e) {
    if (e.status != null && e.status < 500) ctx.lastProgressMs = now();
    return { outcome: e.status == null || e.status >= 500 ? "unknown" : "failed", error: e.message, status: e.status ?? null };
  }
}

function ownedRequest(ctx, type, payload) {
  return [...ctx.requests.values()].find((q) => !q.settled && q.type === type
    && q.payload.id === payload?.id && q.payload.sessionID === payload.sessionID
    && q.requestHash === digest(payload) && ctx.invocationSessions.has(payload.sessionID));
}

// processRequests serializes ordinary decisions; Stop drains it before callback cleanup.
export async function rejectTrackedRequest(ctx, q, settlement, counter) {
  decided(ctx, q);
  const permission = q.type === "opencode.permission";
  const listRoute = fillRoute(permission ? ctx.routes.permissionList : ctx.routes.formList, { sessionID: q.payload.sessionID });
  const native = await listOrEmpty(ctx.client, listRoute);
  if (ctx.abortRequested) return false;
  const affected = native.filter((p) => permission ? p.sessionID === q.payload.sessionID : p.id === q.payload.id);
  const group = affected.map((p) => ownedRequest(ctx, q.type, p));
  if (!group.includes(q) || group.some((r) => !r)) {
    settleRequestFile(ctx, q, { ...settlement, why: "not every affected native request matches its owned envelope",
      outcome: "unknown", settledAt: new Date(now()).toISOString() });
    ctx.requests.delete(q.id); ctx.unresolved = true;
    return true;
  }
  // Only a group this run owns whole is rejected together, so only then are its siblings' decisions known.
  for (const member of group) decided(ctx, member);
  // A reject with a message is OpenCode's corrected error: the tool fails with that feedback and the turn goes
  // on, so the agent can record the refusal and finish, as its standing rules say. A form cancel carries the
  // same message, and a sibling the server rejects with a permission is declined with it too.
  const told = `${settlement.why ?? "declined"}. Do not try to get around it: record it and what it blocked, finish what you can, and say what remains.`;
  const outcome = permission
    ? await respond(ctx, q.type, q.payload.id, "reject", { decision: "reject", message: told }, q.payload.sessionID)
    : await respond(ctx, q.type, q.payload.id, "decline", { message: told }, q.payload.sessionID);
  for (const member of group) {
    const own = member === q;
    settleRequestFile(ctx, member, { ...(own ? settlement : {
      decision: "declined", by: "native", why: "session-wide permission rejection", causedBy: q.id,
    }), outcome: outcome.outcome, settledAt: new Date(now()).toISOString() });
    ctx.requests.delete(member.id);
    if (counter === "autoDeclined") ctx.autoDeclined += 1;
    else if (own && counter === "expired") ctx.expired += 1;
    else ctx.declined += 1;
  }
  if (outcome.outcome !== "applied") ctx.unresolved = true;
  return true;
}

async function offerRequest(ctx, type, payload, method, reason, autoReason, cause) {
  ctx.seq += 1;
  const q = envelope({
    type, payload, seq: ctx.seq, method, reason, cause,
    cwd: ctx.cwd, roots: ctx.roots, deadlineAt: new Date(now() + deadlineMs()).toISOString(),
    run: {
      pid: process.pid, startedAtMs: ctx.startedAtMs,
      threadId: ctx.sessionID, turnId: ctx.rootInputID, invocationId: ctx.invocationId,
      serverURL: ctx.server.url,
    },
  });
  q.invocationId = ctx.invocationId;
  if (autoReason) q.decidedAt = now(); // nobody is asked: the driver refuses it itself
  ctx.requests.set(q.id, q);
  noteWait(ctx);
  ctx.escalations.push({ id: q.id, type, requestID: payload.id, method, reason, presented: q.presented });
  q.autoReason = autoReason;
  // A request the driver declines itself is recorded when it settles and never listed as waiting. One the
  // mailbox cannot hold would wait for a decision that cannot come: it expires at once.
  if (ctx.box && !autoReason) {
    try { ctx.box.offer(q); } catch (e) { q.mailboxFailure = `mailbox write failed: ${e.code ?? e.message}`; decided(ctx, q); }
  }
  return q;
}

const decided = (ctx, q) => { if (q.decidedAt == null) { q.decidedAt = now(); noteWait(ctx); } };
const acceptedDecision = (d) => (d === "decline" ? "declined" : "accepted");

// The coordinator answers a question as one list per field, which the launcher checked against the fields'
// types; V2's form reply is keyed by field, each value of the field's own type.
function formAnswers(payload, answer) {
  const out = {};
  (payload?.fields ?? []).forEach((f, i) => { if (typeof f?.key === "string") out[f.key] = formValue(f, answer.answers[i]).value; });
  return out;
}

async function settleOpenRequest(ctx, q) {
  if (ctx.abortRequested) return false;
  const { state, d } = ctx.box.decision(q, decisionsOf(q));
  if (state !== "valid") {
    if (now() > Date.parse(q.deadlineAt)) {
      return rejectTrackedRequest(ctx, q, { decision: "expired", by: "driver", why: "deadline passed unanswered" }, "expired");
    }
    return false;
  }
  decided(ctx, q);
  // Compare the current server content with the immutable envelope before acting. An absent
  // request is not evidence of acceptance.
  const present = await currentServerRequest(ctx, q);
  if (ctx.abortRequested) return false;
  if (!present) {
    settleRequestFile(ctx, q, {
      decision: acceptedDecision(d.decision), by: "coordinator",
      why: "request is no longer present on the server; the outcome is unconfirmed",
      settledAt: new Date(now()).toISOString(), outcome: "unknown",
    });
    ctx.unresolved = true;
    return true;
  }
  if (digest(present) !== q.requestHash || present.sessionID !== q.payload.sessionID) {
    settleRequestFile(ctx, q, {
      decision: "declined", by: "driver",
      why: "the server request changed before the decision could be applied",
      settledAt: new Date(now()).toISOString(), outcome: "unknown",
    });
    ctx.unresolved = true;
    return true;
  }
  if (ctx.abortRequested) return false;
  if (d.decision === "decline")
    return rejectTrackedRequest(ctx, q, { decision: "declined", by: "coordinator", why: d.why ?? null }, "declined");
  // The record before the answer: an accept the mailbox does not hold is one no coordinator can see was given,
  // so it is declined instead.
  const settled = {
    decision: acceptedDecision(d.decision), by: "coordinator", why: d.why ?? null,
    settledAt: new Date(now()).toISOString(), outcome: "pending",
  };
  if (d.decision === "answer") settled.answer = d.answer ?? null;
  if (!settleRequestFile(ctx, q, settled)) {
    q.settled = null; // still open, so the rejection finds it among the session's own requests
    return rejectTrackedRequest(ctx, q, { decision: "expired", by: "driver", why: "mailbox write failed: the decision could not be recorded" }, "expired");
  }
  const outcome = q.type === "opencode.permission"
    ? await respond(ctx, q.type, q.payload.id, "permission", { decision: "once" }, q.payload.sessionID)
    : await respond(ctx, q.type, q.payload.id, "answer", { answer: formAnswers(q.payload, d.answer) }, q.payload.sessionID);
  settled.outcome = outcome.outcome;
  ctx.box.rewrite(q);
  if (outcome.outcome === "unknown") ctx.unresolved = true;
  return true;
}

// A session's children into `kids`, every page: V2 lists fifty to a page, and its cursor stays set until a page
// comes back empty. A page that fails keeps the children the earlier pages named.
async function childrenOf(ctx, sid, kids) {
  let cursor = null;
  for (;;) {
    const r = await ctx.client.call("GET", `${fillRoute(ctx.routes.children, { sessionID: sid })}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
    if (!Array.isArray(r?.data)) throw new Error("session page: expected a data array");
    kids.push(...r.data.map((k) => k?.id).filter((k) => typeof k === "string"));
    if (!r.data.length || !r.cursor?.next) return;
    cursor = r.cursor.next;
  }
}

async function gatherOwned(ctx) {
  if (!ctx.client || !ctx.sessionID) return { sessions: new Set(), errors: [] };
  const owned = new Set([ctx.sessionID]);
  const errors = [];
  const queue = [ctx.sessionID];
  while (queue.length) {
    const sid = queue.shift();
    const kids = [];
    try { await childrenOf(ctx, sid, kids); }
    catch (e) { errors.push({ sessionID: sid, status: e.status ?? null }); }
    for (const kid of kids) if (!owned.has(kid)) { owned.add(kid); queue.push(kid); }
  }
  return { sessions: owned, errors };
}

async function updateOwned(ctx) {
  const discovery = await gatherOwned(ctx);
  ctx.owned = new Set([...(ctx.owned ?? []), ...discovery.sessions]);
  ctx.discoveryComplete = discovery.errors.length === 0;
  ctx.discoveryErrors = discovery.errors;
  const inv = new Set(ctx.invocationSessions ?? []);
  if (ctx.sessionID) inv.add(ctx.sessionID);
  for (const s of ctx.owned) if (!ctx.preexisting.has(s)) inv.add(s);
  ctx.invocationSessions = inv;
}

// Discover new requests (from this invocation's own sessions only) and settle decided ones. A
// request from a descendant that already existed before this invocation is never acted on.
async function processRequests(ctx) {
  if (ctx.abortRequested) return;
  const own = ctx.invocationSessions ?? new Set([ctx.sessionID]);
  const { permissions: perms, forms } = await pendingIn(ctx, own, { skipRefused: true });
  const fresh = [];
  for (const p of perms) if (own.has(p?.sessionID) && !ctx.seen.has(`p:${p.id}`)) fresh.push(["opencode.permission", p]);
  for (const f of forms) if (own.has(f?.sessionID) && !ctx.seen.has(`q:${f.id}`)) fresh.push(["opencode.question", f]);
  for (const [type, payload] of fresh) {
    if (ctx.abortRequested) return;
    if (typeof payload?.id !== "string") continue;
    ctx.seen.add(`${type === "opencode.permission" ? "p" : "q"}:${payload.id}`);
    const edit = type === "opencode.permission" ? editScope(ctx.scope, payload, ctx.cwd, { stateDir: ctx.stateDir, protectedDirs: PROTECTED }) : {};
    const method = type === "opencode.permission" ? (payload.action ?? "permission") : "question";
    const reason = type === "opencode.permission" ? (payload.metadata?.description ?? null) : (payload.title ?? null);
    const autoReason = edit.decline ? `refused by the driver: ${edit.decline}`
      : !ctx.box ? "no approval directory: unattended run" : null;
    await offerRequest(ctx, type, payload, method, reason, autoReason, edit.outside ? "outside" : "asked");
  }
  for (const [rid, q] of [...ctx.requests]) {
    if (ctx.abortRequested) return;
    if (q.settled) { ctx.requests.delete(rid); continue; }
    if (q.autoReason) {
      if (!ctx.box) ctx.needsInput = true;
      await rejectTrackedRequest(ctx, q, { decision: "declined", by: "driver", why: q.autoReason }, "autoDeclined");
    } else if (q.mailboxFailure) {
      await rejectTrackedRequest(ctx, q, { decision: "expired", by: "driver", why: q.mailboxFailure }, "expired");
    } else if (await settleOpenRequest(ctx, q)) ctx.requests.delete(rid);
  }
}

// ---------------------------------------------------------------------------------------------
// History: only this invocation's own messages

// The session's messages since this run started, oldest first. V2 caps a page at 200 (a larger limit is a
// 400) and pages newest first, its cursor keeping the order, so the walk ends at the first message older than
// the run: a resumed session's earlier turns are never fetched again on every poll.
async function sessionMessages(ctx, sid) {
  const out = [];
  let cursor = null;
  for (;;) {
    const q = cursor ? `?limit=200&cursor=${encodeURIComponent(cursor)}` : "?limit=200&order=desc";
    const r = await ctx.client.call("GET", `${fillRoute(ctx.routes.messages, { sessionID: sid })}${q}`);
    if (!Array.isArray(r?.data)) throw new Error("message page: expected a data array");
    const own = r.data.filter((m) => (m?.time?.created ?? 0) >= ctx.startedAtMs);
    out.push(...own);
    if (own.length < r.data.length || !r.data.length || !r.cursor?.next) break;
    cursor = r.cursor.next;
    if (out.length > 5000) throw new Error("this run's messages exceed a sane history bound");
  }
  return out.reverse();
}

async function refresh(ctx) {
  const sessions = ctx.invocationSessions ?? new Set([ctx.sessionID]);
  const all = [];
  for (const sid of sessions) {
    const ms = await sessionMessages(ctx, sid);
    for (const m of ms) all.push({ ...m, _sessionID: sid });
  }
  ctx.messages = all;
  try { ctx.active = await ctx.client.call("GET", ctx.routes.active, undefined, { unwrap: true }); ctx.statusKnown = true; }
  catch { ctx.active = null; ctx.statusKnown = false; ctx.statusUnknown = true; }
}

// Messages that belong to this invocation: the root session's own inputs and the assistant messages that
// follow the first of them, plus every message of a descendant session created during the invocation.
function invocationMessages(ctx) {
  const out = [];
  const created = (m) => m?.time?.created ?? 0;
  const own = (ctx.messages ?? []).filter((m) => m._sessionID === ctx.sessionID && ctx.invocationInputs.has(m.id));
  const firstAt = own.length ? Math.min(...own.map(created)) : 0;
  for (const m of ctx.messages ?? []) {
    if (m._sessionID !== ctx.sessionID) out.push(m);
    else if (ctx.invocationInputs.has(m.id) || (firstAt && created(m) >= firstAt && m.type === "assistant")) out.push(m);
  }
  return out;
}

// V2 links no assistant message to its input: the replies to an input are the root session's assistant
// messages after its user message and before the next one, so an earlier turn's reply is never this one's.
function repliesTo(ctx, inputID) {
  const root = (ctx.messages ?? []).filter((m) => m._sessionID === ctx.sessionID);
  const at = root.findIndex((m) => m.id === inputID);
  if (at < 0) return [];
  const next = root.findIndex((m, i) => i > at && m.type === "user");
  return root.slice(at + 1, next < 0 ? undefined : next).filter((m) => m.type === "assistant");
}

function finalReply(ctx, inputID) {
  const rs = repliesTo(ctx, inputID);
  const completed = rs.filter((r) => r.time?.completed);
  return (completed.length ? completed[completed.length - 1] : rs[rs.length - 1]) ?? null;
}

// ---------------------------------------------------------------------------------------------
// The turn

// The budget: a wall clock declared by the caller only, that stands still while a request waits for the coordinator, an
// idle bound that stands still then too, and a command count. A session the server reports busy is progress: a long quiet command is still work.
async function awaitTurn(ctx, inputID) {
  let stable = 0, lastSig = "";
  ctx.waitedMs ??= 0;
  while (true) {
    if (ctx.abortRequested) return { aborted: true };
    const t = now(), waiting = ctx.waitingSince == null ? 0 : t - ctx.waitingSince;
    if (ctx.timeoutMs > 0 && t - ctx.startedAtMs - ctx.waitedMs - waiting > ctx.timeoutMs) return { timedOut: true };
    await updateOwned(ctx);
    ctx.processingRequests = processRequests(ctx);
    try { await ctx.processingRequests; } finally { ctx.processingRequests = null; }
    let refreshFailed = false;
    try { await refresh(ctx); } catch { refreshFailed = true; }
    if (ctx.abortRequested) return { aborted: true };
    const sig = (ctx.messages ?? []).map((m) => `${m?.id}:${contentOf(m).length}`).join(",");
    if (sig !== lastSig) { lastSig = sig; ctx.lastProgressMs = now(); }
    const toolsNow = collectTools(invocationMessages(ctx));
    ctx.liveCommands = commandEvidence(toolsNow).commands.length;
    if (ctx.maxCommands > 0 && ctx.liveCommands > ctx.maxCommands) return { capped: true };
    const reply = finalReply(ctx, inputID);
    const replies = repliesTo(ctx, inputID);
    const busy = !refreshFailed && ctx.statusKnown && [...ctx.invocationSessions].some((sid) => isBusy(ctx.active, sid));
    if (busy) ctx.lastProgressMs = now();
    const idle = !refreshFailed && ctx.statusKnown && ctx.discoveryComplete && ctx.requests.size === 0 && !busy;
    if (idle && reply?.time?.completed) {
      if (++stable >= 2) return { reply, completed: true };
    } else if (idle && replies.length) {
      if (++stable >= 2) return { reply, completed: false };
    } else stable = 0;
    if (ctx.idleMs > 0 && ctx.requests.size === 0 && ctx.waitingSince == null && now() - ctx.lastProgressMs > ctx.idleMs) return { idleTimedOut: true };
    await sleep(POLL_MS);
  }
}

// The shared standing rules (orchestrate/scripts/drivers.mjs) in OpenCode's terms. Bash is allowed without
// approval and is not constrained by the edit/write tool rules or their roots.
function runRules(ctx) {
  const roots = ctx.roots ?? [];
  return standingRules({
    rights: ctx.scope?.kind === "read" || !roots.length
      ? "Read and search any paths the task needs that OpenCode can access; RIGHTS does not limit reads. Your edit and write tools are refused. Bash is allowed without approval and bypasses these file and network limits; it can write any file the process can access and access the network. Keep its use within the task and do not use it to write files or access beyond the task."
      : `Read and search any paths the task needs that OpenCode can access; RIGHTS does not limit reads. Edits inside ${roots.join(", ")} need no approval; edits elsewhere need approval. Bash is allowed without approval and bypasses these root, protected path and network limits; it can write anywhere the process can, including .git and OpenCode configuration paths, and access the network. Keep its use within the task, write only inside the approved roots, and never write protected paths.`,
    network: "The native fetch tool needs approval; Bash network commands are not checked.",
    mailbox: Boolean(ctx.box),
    ask: "the call itself waits for that decision.",
  });
}

function promptText(task, schema, brief, rules = null) {
  const instruction = [
    "",
    "---",
    "Finish by replying with a single JSON object and nothing else. It must match this JSON Schema:",
    JSON.stringify(schema),
    "Put the whole answer in the schema's fields; do not wrap the object in prose or a code fence.",
    ...(brief ? ["Keep the text fields brief."] : []),
  ].join("\n");
  return `${rules ? `${rules}\n\n` : ""}${task}${instruction}`;
}

// V2's prompt body: { id, text }; the model was pinned at session create, and a variant change goes
// through the session's model route, not the prompt.
async function postPrompt(ctx, messageID, text) {
  return ctx.client.call("POST", fillRoute(ctx.routes.prompt, { sessionID: ctx.sessionID }), { id: messageID, text });
}

// Post once and admit. An unknown transport outcome is reconciled by the known message id against
// history; the prompt is never blindly resent.
async function postAndReconcile(ctx, messageID, text) {
  if (ctx.abortRequested) return { cancelled: true };
  ctx.admissionInFlight = true;
  try { return await admitOnce(ctx, messageID, text); }
  finally {
    ctx.admissionInFlight = false;
    if (ctx.stopDuringAdmission) {
      ctx.stopDuringAdmission = false;
      await ctx.stopping;
      ctx.cancellation.admissionOverlap = true;
      ctx.stopping = stopOwned(ctx);
      await ctx.stopping;
    }
  }
}

async function admitOnce(ctx, messageID, text) {
  try {
    await postPrompt(ctx, messageID, text);
    return { admitted: true };
  } catch (e) {
    if (e.status != null && e.status < 500) {
      return { admitted: false, rejected: true, error: e.message, status: e.status };
    }
    for (let i = 0; i < CLAIM_POLLS; i++) {
      await sleep(POLL_MS);
      try {
        await updateOwned(ctx);
        await refresh(ctx);
        // V2 echoes the prompt's id as the user message's id.
        if (ctx.messages.some((m) => m?.id === messageID)) return { admitted: true };
      } catch {}
    }
    return { admitted: false, unknown: true };
  }
}

async function abortSessions(ctx) {
  await updateOwned(ctx).catch(() => { ctx.discoveryComplete = false; });
  const targets = ctx.invocationSessions ?? new Set(ctx.sessionID ? [ctx.sessionID] : []);
  const results = [];
  for (const sid of targets) {
    try {
      // V2's interrupt answers in the clear: { interrupted: true|false }, no .data wrapper. Either is a
      // definite answer; false is a session with nothing running, which is stopped already.
      const accepted = await ctx.client.call("POST", fillRoute(ctx.routes.abort, { sessionID: sid }), undefined, { unwrap: false });
      results.push({ sessionID: sid, ok: typeof accepted?.interrupted === "boolean", accepted });
    } catch (e) { results.push({ sessionID: sid, ok: false, error: e.message, status: e.status ?? null }); }
  }
  return results;
}

async function cancelPendingRequests(ctx) {
  const receipts = [];
  const settle = (q, outcome) => {
    settleRequestFile(ctx, q, { decision: "declined", cancelled: true, by: "driver", why: "run stopped",
      settledAt: new Date(now()).toISOString(), outcome: outcome.outcome });
    ctx.requests.delete(q.id);
    if (outcome.outcome === "unknown") ctx.unresolved = true;
  };
  const { permissions, forms } = await pendingIn(ctx, ctx.invocationSessions);
  for (const sid of ctx.invocationSessions) {
    const group = permissions.filter((p) => p.sessionID === sid);
    if (!group.length) continue;
    const owned = group.map((p) => ownedRequest(ctx, "opencode.permission", p));
    // Native permission rejection affects every pending permission in that session.
    if (owned.some((q) => !q)) {
      receipts.push({ type: "opencode.permission", sessionID: sid, outcome: "unknown", reason: "not every affected request is owned" });
      ctx.unresolved = true;
      continue;
    }
    const outcome = await respond(ctx, "opencode.permission", group[0].id, "reject", { decision: "reject" }, group[0].sessionID);
    receipts.push({ type: "opencode.permission", sessionID: sid, requestIDs: group.map((p) => p.id), ...outcome });
    for (const q of owned) settle(q, outcome);
  }
  for (const payload of forms) {
    const q = ownedRequest(ctx, "opencode.question", payload);
    if (!q) continue;
    const outcome = await respond(ctx, q.type, payload.id, "decline", {}, payload.sessionID);
    receipts.push({ type: q.type, sessionID: payload.sessionID, requestIDs: [payload.id], ...outcome });
    settle(q, outcome);
  }
  return receipts;
}

async function stopOwned(ctx) {
  ctx.cancellation.abort.push(...await abortSessions(ctx));
  if (ctx.processingRequests) await ctx.processingRequests;
  try { ctx.cancellation.callbacks = await cancelPendingRequests(ctx); }
  catch (e) { ctx.unresolved = true; ctx.cancellation.callbacks = [{ outcome: "unknown", error: e.message }]; }
  ctx.cancellation.observed = ctx.admissionInFlight || ctx.cancellation.abort.some((r) => !r.ok)
    ? "unknown" : await observeStop(ctx);
  ctx.cancellation.discoveryComplete = ctx.discoveryComplete;
  if (!ctx.discoveryComplete) ctx.cancellation.discoveryErrors = ctx.discoveryErrors ?? [];
  try { writeSessionRecord(ctx, { cancellation: ctx.cancellation }); } catch {}
}

// A status read that fails leaves the state unknown; it never reads as idle.
async function observeStop(ctx) {
  const deadline = now() + 10000;
  let stable = 0;
  while (now() < deadline) {
    let pending;
    try {
      await updateOwned(ctx);
      await refresh(ctx);
      const { permissions, forms } = await pendingIn(ctx, ctx.invocationSessions);
      pending = [...permissions, ...forms];
    }
    catch { return "unknown"; }
    if (!ctx.statusKnown || !ctx.discoveryComplete || ctx.unresolved) return "unknown";
    const idle = [...ctx.invocationSessions].every((sid) => !isBusy(ctx.active, sid));
    const hasCallbacks = pending.some((q) => ctx.invocationSessions.has(q.sessionID));
    const hasActiveTools = collectTools(invocationMessages(ctx)).some((t) => !["completed", "error"].includes(t.status));
    if (idle && !hasCallbacks && !hasActiveTools) { if (++stable >= 2) return "idle"; }
    else stable = 0;
    await sleep(POLL_MS);
  }
  return "unknown";
}

// ---------------------------------------------------------------------------------------------
// Resume and session ownership records

function stateDirOf(ctx) {
  try { return stateDirectory(); } catch { return path.join(path.dirname(ctx.report), "state"); }
}

const sessionRecordPath = (ctx, sid) => path.join(ctx.stateDir, "opencode-sessions", `${sid}.json`);

function writeSessionRecord(ctx, extra = {}) {
  atomicJson(sessionRecordPath(ctx, ctx.sessionID), {
    adapter: "opencode", apiFamily: "v2", sessionID: ctx.sessionID, serverMode: "local", cwd: ctx.cwd,
    model: ctx.ref ? modelKey(ctx.ref) : null, rights: ctx.scope, invocationId: ctx.invocationId,
    variant: ctx.variant ?? null,
    worktreePath: ctx.worktreePath ?? null, worktreeRepo: ctx.worktreeRepo ?? null,
    worktreeBase: ctx.worktreeBase ?? null,
    cancellation: null, at: new Date(now()).toISOString(), ...extra,
  });
}

const clientFor = (ctx) => new Client({ config: ctx.config });

function applyPrior(ctx, prior) {
  // An earlier release ran sessions through OpenCode's V1 API, which a V2 server no longer exposes; a report or
  // record written then names a session this driver cannot reach, and carries no apiFamily. Every one this
  // release writes says v2.
  if (prior.apiFamily !== "v2") return "the record is not a V2 session, and this adapter speaks OpenCode's V2 API only";
  ctx.client = clientFor(ctx);
  // An earlier release could attach to a remote server; a session there is not in the local server's store.
  if ((prior.serverMode ?? "remote") !== "local") return "the record belongs to a remote server, which this adapter no longer attaches to";
  if (ctx.scope?.kind === "worktree") {
    const root = prior.worktreePath;
    if (prior.rights?.kind !== "worktree" || prior.worktreeRepo !== ctx.worktreeRepo || !root
      || !prior.rights.roots?.includes(root)) return "the record does not own a worktree for this repository";
    const shared = (dir) => {
      const r = git(["-C", dir, "rev-parse", "--git-common-dir"]);
      return r.status === 0 ? canonical(r.stdout.trim(), dir) : null;
    };
    const original = shared(ctx.worktreeRepo);
    const top = git(["-C", root, "rev-parse", "--show-toplevel"]);
    if (!original || shared(root) !== original || top.status !== 0 || canonical(top.stdout.trim()) !== canonical(root))
      return "the recorded worktree is no longer attached to this repository";
    ctx.worktreePath = root; ctx.worktreeBase = prior.worktreeBase ?? prior.base ?? null;
    ctx.cwd = root; ctx.roots = [root]; ctx.scope = { kind: "worktree", roots: [root] };
  }
  if (prior.cwd && prior.cwd !== ctx.cwd) return "the record belongs to another working directory";
  const retainedModel = prior.requestedModel ?? prior.model;
  if (retainedModel) { try { ctx.priorModel = splitModel(retainedModel); } catch {} }
  ctx.priorVariant = prior.variant ?? null;
  ctx.priorRights = prior.rights ?? null;
  if (prior.cancellation?.observed === "unknown") return "the previous invocation's cancellation outcome is unknown; the session is not safely resumable";
  return null;
}

async function resolveResume(ctx) {
  const value = ctx.parsed.resume;
  if (value === undefined) return { ok: true };
  let sessionID = null, failure = null;
  if (path.isAbsolute(value)) {
    const prior = readJson(value);
    if (!prior || prior.adapter !== "opencode") return { error: `RESUME ${value}: not an OpenCode report` };
    // A report with no exit code is a claim: its driver still runs, or died before it published.
    if (typeof prior.exitCode !== "number")
      return Number.isInteger(prior.pid) && alive(prior.pid) ? { busy: true, sessionID: value }
        : { error: `RESUME ${value} names a run that ended without a report; there is nothing to continue` };
    sessionID = prior.sessionID;
    failure = applyPrior(ctx, prior);
  } else {
    sessionID = value;
    const rec = readJson(sessionRecordPath(ctx, sessionID));
    if (!rec || rec.adapter !== "opencode")
      return { error: `RESUME ${sessionID}: no recorded OpenCode invocation owns that session` };
    failure = applyPrior(ctx, rec);
  }
  if (failure) return { error: failure };
  if (!sessionID) return { error: "RESUME produced no session id" };
  let session = null;
  try { session = await ctx.client.call("GET", fillRoute(ctx.routes.sessionGet, { sessionID }), undefined, { unwrap: true }); }
  catch (e) { return { error: `RESUME session ${sessionID} is not reachable: ${e.message}` }; }
  if (!session?.id) return { error: `RESUME session ${sessionID} does not exist` };
  let active;
  try { active = await ctx.client.call("GET", ctx.routes.active, undefined, { unwrap: true }); }
  catch (e) { return { error: `RESUME session ${sessionID}: status is unknown (${e.message}); the session is not safely resumable` }; }
  if (isBusy(active, sessionID)) return { busy: true, sessionID };
  ctx.resume = true;
  ctx.sessionID = sessionID;
  ctx.resumedSession = session;
  return { ok: true };
}

// ---------------------------------------------------------------------------------------------
// Final report

function buildReport(ctx, base) {
  return {
    adapter: "opencode",
    apiFamily: "v2",
    ok: base.exitCode === EXIT.SUCCESS,
    exitCode: base.exitCode,
    error: base.error ?? null,
    answer: base.answer ?? null,
    answerJson: base.answerJson ?? null,
    answerPath: base.answerPath ?? null,
    threadId: ctx.sessionID ?? null,
    sessionID: ctx.sessionID ?? null,
    turnId: ctx.rootInputID ?? null,
    turnIds: [...(ctx.invocationInputs ?? [])],
    server: { url: ctx.server?.url ?? null, version: ctx.server?.version ?? null },
    model: base.model ?? null,
    requestedModel: ctx.ref ? modelKey(ctx.ref) : (ctx.requestedModel ?? null),
    variant: ctx.variant ?? null,
    turnStatus: base.turnStatus ?? null,
    receiptOk: base.receiptOk ?? false,
    commands: base.commands ?? [],
    tools: base.tools ?? [],
    fileChanges: base.fileChanges ?? [],
    usage: base.usage ?? null,
    cost: base.cost ?? null,
    childUsage: base.childUsage ?? null,
    transcriptPath: ctx.transcriptPath ?? null,
    escalations: ctx.escalations ?? [],
    outputSchemaOk: base.outputSchemaOk ?? null,
    schemaErrors: base.schemaErrors ?? [],
    partial: Boolean(base.partial),
    limits: ctx.opts ? { timeoutS: ctx.opts.timeout, idleTimeoutS: ctx.opts.idle, maxCommands: ctx.opts.maxCommands } : null,
    cancellation: base.cancellation ?? ctx.cancellation ?? null,
    cwd: ctx.cwd ?? null,
    serverMode: "local",
    rights: ctx.scope ? { kind: ctx.scope.kind, roots: ctx.scope.roots ?? [] } : null,
    resume: Boolean(ctx.resume),
    admission: base.admission ?? ctx.admission ?? null,
    correction: base.correction ?? null,
    startedAt: new Date(ctx.startedAtMs).toISOString(),
    endedAt: new Date(now()).toISOString(),
    turnError: base.turnError ?? null,
    approvalsAutoDeclined: ctx.autoDeclined ?? 0,
    ...worktreeFacts(ctx),
  };
}

function publish(ctx, base) {
  const final = buildReport(ctx, base);
  atomicJson(ctx.report, final);
  return final;
}

// Remove the signal listeners and, when asked, deliver an abort to this invocation's own sessions and wait
// (bounded) for it before the process exits. Idempotent.
async function cleanup(ctx, abortExecution) {
  if (ctx.cleaned) return;
  ctx.cleaned = true;
  if (ctx.onSignal) for (const s of SIGNALS) process.removeListener(s, ctx.onSignal);
  if (ctx.stopping) { try { await Promise.race([ctx.stopping, sleep(8000)]); } catch {} }
  if (abortExecution && ctx.client && ctx.sessionID && !ctx.abortRequested) {
    ctx.abortRequested = true;
    ctx.cancellation = ctx.cancellation ?? { reason: "driver failure", signal: ctx.signal ?? null, abort: [], observed: "unknown" };
    ctx.stopping = stopOwned(ctx);
    try { await Promise.race([ctx.stopping, sleep(8000)]); } catch {}
  }
}

// ---------------------------------------------------------------------------------------------
// The run

async function execute(opts, parsed) {
  const ctx = {
    opts, parsed,
    invocationId: id("inv"),
    startedAtMs: now(),
    timeoutMs: opts.timeout * 1000,
    idleMs: opts.idle * 1000,
    maxCommands: opts.maxCommands,
    report: opts.report,
    approvalDir: opts.approvalDir ? path.resolve(opts.approvalDir) : null,
    requests: new Map(), seen: new Set(), owned: new Set(), preexisting: new Set(),
    invocationInputs: new Set(), escalations: [],
    seq: 0, autoDeclined: 0, declined: 0, expired: 0, needsInput: false, unresolved: false,
    abortRequested: false, admission: "pending", lastProgressMs: now(),
  };
  ctx.stateDir = stateDirOf(ctx);
  // What the prompt named, kept apart from what was observed: an early cut has no resolved model, and the
  // selection is still the run's requested model. An inherited one is resolved later, and stays null until then.
  if (!parsed.model.inherit) ctx.requestedModel = modelKey({ providerID: parsed.model.providerID, modelID: parsed.model.modelID });

  // Claim the report path exclusively, before anything can refuse, so no refusal publishes over an earlier
  // report. A refusal of the claim itself publishes nothing. The claim's pid tells a live run from a dead one.
  const claim = (() => {
    try { const fd = fs.openSync(ctx.report, "wx", 0o600); fs.writeSync(fd, `${JSON.stringify({ adapter: "opencode", ok: false, status: "starting", pid: process.pid })}\n`); fs.closeSync(fd); return null; }
    catch (e) { return e.code === "EEXIST" ? `${ctx.report} already exists, or is a symbolic link` : `could not be published at ${ctx.report}`; }
  })();
  if (claim) { process.stderr.write(`entrust: refused: ${claim}\n`); return EXIT.USAGE; }

  // The Stop latch, installed before the pid line that admits a forwarded Stop. Until the owned resources exist
  // (`ownedReady`: a client, a session, its descendants enumerated) a Stop only records its reason and aborts
  // the startup in flight; each startup boundary below then ends the run in a terminal aborted report, with no
  // prompt ever submitted. Once they exist it stops them as before. Idempotent.
  ctx.startup = new AbortController();
  const stop = (reason) => {
    if (ctx.abortRequested) return ctx.stopping ?? Promise.resolve();
    ctx.abortRequested = true;
    ctx.stopDuringAdmission = Boolean(ctx.admissionInFlight);
    if (ctx.ownedReady) {
      ctx.cancellation = { reason, signal: ctx.signal ?? null, abort: [], observed: "unknown" };
      ctx.stopping = stopOwned(ctx);
    } else {
      ctx.cancellation = { reason, signal: ctx.signal ?? null, abort: [], observed: "idle", promptSubmitted: false, beforeAdmission: true };
      ctx.stopping = Promise.resolve();
      ctx.startup.abort();
    }
    return ctx.stopping;
  };
  ctx.onSignal = (sig) => { ctx.signal = sig; stop(`signal ${sig}`).catch(() => {}); };
  for (const s of SIGNALS) process.on(s, ctx.onSignal);
  ctx.stop = stop;
  const EARLY = "the run was cancelled before its prompt was admitted";
  // A refusal after a captured Stop is the Stop: the run ends cancelled, not refused.
  const bail = (reason, code, extra) => (ctx.abortRequested ? cutExit(ctx, EARLY) : fail(ctx, reason, code, extra));

  // The pid line the launcher uses to own this run and to forward a Stop.
  process.stderr.write(`entrust: pid=${process.pid} identity=${ctx.invocationId} reportPath=${ctx.report}\n`);

  if (ctx.approvalDir) {
    const misplaced = mailboxProblem(ctx.approvalDir, ctx.stateDir);
    if (misplaced) return fail(ctx, misplaced, EXIT.USAGE);
    try { fs.mkdirSync(ctx.approvalDir, { recursive: true, mode: 0o700 }); }
    catch (e) { return fail(ctx, `approval directory ${ctx.approvalDir} cannot be made: ${e.message}`, EXIT.USAGE); }
    ctx.box = openMailbox(ctx.approvalDir);
  }

  try {
  ctx.transcriptPath = sidecar(ctx, "transcript.json");

  try {
    ctx.localServer = await startLocalServer({ cwd: process.cwd(), signal: ctx.startup.signal });
    ctx.config = ctx.localServer.config;
    ctx.client = clientFor(ctx); ctx.server = await ctx.client.probe();
  } catch (e) { return bail(`the OpenCode server could not be started: ${e.message}`, EXIT.TRANSPORT); }
  if (ctx.abortRequested) return cutExit(ctx, EARLY);
  ctx.routes = ROUTES;
  const missing = routeError(ctx);
  if (missing) return fail(ctx, missing, EXIT.USAGE);

  // A continuation with no RIGHTS line keeps the rights its report recorded.
  if (!parsed.rights) {
    const prior = readJson(parsed.resume);
    const kept = prior?.adapter === "opencode" ? keptRights(prior) : null;
    if (!kept) return fail(ctx, `RESUME ${parsed.resume} records no rights to keep; name them with RIGHTS`, EXIT.USAGE);
    parsed.rights = kept;
  }

  // Rights → working directory and roots.
  const scope = rightsScope(parsed.rights);
  ctx.scope = scope;
  if (scope.kind === "worktree" && parsed.resume !== undefined) {
    ctx.worktreeRepo = scope.repo; ctx.cwd = scope.repo; ctx.roots = [];
  } else if (scope.kind === "worktree") {
    const wt = makeWorktree(scope.repo, ctx.stateDir, ctx.invocationId);
    if (wt.error) return fail(ctx, wt.error, EXIT.USAGE);
    ctx.worktreePath = wt.worktreePath; ctx.worktreeBase = wt.base; ctx.worktreeRepo = wt.repo;
    ctx.cwd = wt.worktreePath; ctx.roots = [wt.worktreePath];
    ctx.scope = { kind: "worktree", roots: [wt.worktreePath] };
  } else {
    ctx.cwd = scope.readDir; ctx.roots = scope.roots;
  }

  // Resume, if asked, before any new session is made.
  const resumed = await resolveResume(ctx);
  if (ctx.abortRequested) return cutExit(ctx, EARLY);
  if (resumed.busy) return fail(ctx, `session ${resumed.sessionID} is busy; a live invocation is not relaunched`, EXIT.BUSY);
  if (resumed.error) return fail(ctx, resumed.error, EXIT.USAGE);
  // The session keeps the permission rules it was created with, so a continuation keeps its rights: a resume
  // that names others would report them while the server enforces the old ones.
  if (ctx.resume && ctx.priorRights) {
    const roots = (r) => JSON.stringify((r.roots ?? []).map((p) => canonical(p)));
    if (ctx.priorRights.kind !== ctx.scope.kind || roots(ctx.priorRights) !== roots(ctx.scope))
      return fail(ctx, `a continuation keeps its rights (${ctx.priorRights.kind}${ctx.priorRights.roots?.length ? ` ${ctx.priorRights.roots.join(" ")}` : ""}); name the same or leave RIGHTS out`, EXIT.USAGE);
  }
  const resumedRules = ctx.resume ? rulesProblem(ctx.resumedSession, ctx.scope) : null;
  if (resumedRules) return fail(ctx, resumedRules, EXIT.TRANSPORT);

  // Model: pinned by the plan, inherited by a resume, else the first recent model. No fallback.
  const model = await resolveModel(ctx);
  if (ctx.abortRequested) return cutExit(ctx, EARLY);
  if (model.error) return fail(ctx, model.error, EXIT.USAGE);
  ctx.ref = model.ref; ctx.variant = model.variant;

  // Create the session (a resume reuses the existing one). V2 pins the model, the working directory
  // and the permission rules here: the prompt body carries none of them.
  if (!ctx.resume) {
    let session;
    try {
      session = await ctx.client.call("POST", ctx.routes.create, {
        title: `entrust ${ctx.invocationId}`,
        location: { directory: ctx.cwd },
        model: { id: ctx.ref.modelID, providerID: ctx.ref.providerID, ...(ctx.variant ? { variant: ctx.variant } : {}) },
        permissions: sessionPermissions(ctx.scope),
      }, { unwrap: true });
    } catch (e) { return bail(`could not create an OpenCode session: ${e.message}`, EXIT.MODEL); }
    if (!session?.id) return fail(ctx, "the server returned no session id", EXIT.MODEL);
    ctx.sessionID = session.id;
    const rules = rulesProblem(session, ctx.scope);
    if (rules) return bail(rules, EXIT.TRANSPORT);
  } else {
    // A resumed session keeps its model unless this run names another; V2 switches it natively.
    const current = ctx.resumedSession?.model;
    if (current?.providerID === ctx.ref.providerID && current?.id === ctx.ref.modelID) {
      if (ctx.variant && current.variant !== ctx.variant) {
        try {
          await ctx.client.call("POST", fillRoute(ctx.routes.model, { sessionID: ctx.sessionID }),
            { model: { id: ctx.ref.modelID, providerID: ctx.ref.providerID, variant: ctx.variant } }, { expectedStatus: 204 });
        } catch (e) { return fail(ctx, `the session's variant could not switch to ${ctx.variant}: ${e.message}`, EXIT.MODEL); }
      }
    } else {
      try {
        await ctx.client.call("POST", fillRoute(ctx.routes.model, { sessionID: ctx.sessionID }),
          { model: { id: ctx.ref.modelID, providerID: ctx.ref.providerID, ...(ctx.variant ? { variant: ctx.variant } : {}) } },
          { expectedStatus: 204 });
      } catch (e) { return fail(ctx, `the session's model could not switch to ${modelKey(ctx.ref)}: ${e.message}`, EXIT.MODEL); }
      const after = await ctx.client.call("GET", fillRoute(ctx.routes.sessionGet, { sessionID: ctx.sessionID }), undefined, { unwrap: true });
      if (after?.model?.providerID !== ctx.ref.providerID || after?.model?.id !== ctx.ref.modelID)
        return fail(ctx, "the session's model did not switch; the reply would not be the requested model's", EXIT.MODEL);
    }
  }
  writeSessionRecord(ctx);
  if (ctx.abortRequested) return cutExit(ctx, EARLY);

  // The descendants that already existed belong to earlier invocations and are never aborted.
  await updateOwned(ctx);
  if (ctx.abortRequested) return cutExit(ctx, EARLY);
  ctx.preexisting = new Set(ctx.owned);
  ctx.invocationSessions = new Set([ctx.sessionID]);
  if (!ctx.discoveryComplete)
    return fail(ctx, "session descendants could not be enumerated before admission", EXIT.TRANSPORT);

  // From here a Stop stops the owned session and its descendants, and no prompt is sent after one.
  ctx.ownedReady = true;
  if (ctx.abortRequested) return cutExit(ctx, EARLY);

  ctx.rootInputID = id("msg");
  ctx.invocationInputs.add(ctx.rootInputID);
  const inputText = promptText(parsed.task, parsed.outputSchema, parsed.brief, runRules(ctx));
  const admitted = await postAndReconcile(ctx, ctx.rootInputID, inputText);
  if (ctx.abortRequested) return cutExit(ctx, "the run was cancelled during admission");
  if (!admitted.admitted) {
    await (ctx.stopping ?? Promise.resolve());
    return fail(ctx, admitted.rejected ? `the prompt was rejected: ${admitted.error}`
      : "the prompt outcome could not be reconciled after an unknown transport result; it was not resent",
      admitted.rejected ? EXIT.MODEL : EXIT.TRANSPORT, { partial: !admitted.rejected });
  }
  ctx.admission = "admitted";

  const turn = await awaitTurn(ctx, ctx.rootInputID);
  if (ctx.stopping) await ctx.stopping;
  if (ctx.abortRequested || turn.aborted) return cutExit(ctx, "the run was cancelled");
  if (turn.timedOut) { await stop("wall timeout"); return cutExit(ctx, "the wall timeout was reached"); }
  if (turn.idleTimedOut) { await stop("idle timeout"); return cutExit(ctx, "no progress before the idle timeout"); }
  if (turn.capped) { await stop("command cap"); return cutExit(ctx, `more than ${ctx.maxCommands} commands were executed`); }
  if (!turn.reply) return fail(ctx, "the turn ended with no assistant reply", EXIT.NO_ANSWER, { partial: true });

  return await conclude(ctx, turn.reply, parsed);
  } catch (e) {
    return await fail(ctx, `invocation failed: ${e.message}`, EXIT.TRANSPORT, { partial: ctx.admission !== "pending" });
  } finally { await ctx.localServer?.close(); }
}

async function resolveModel(ctx) {
  let ref, variant = ctx.parsed.variant ?? null;
  if (ctx.parsed.model.inherit) {
    if (ctx.resume) {
      if (!ctx.priorModel) return { error: "the resumed invocation has no recorded model; set MODEL explicitly" };
      ref = ctx.priorModel; variant ??= ctx.priorVariant;
    }
    else {
      let recent = [];
      try { recent = recentModels({ limit: 1 }); } catch (e) { return { error: e.message }; }
      if (!recent.length) return { error: "no recent model is recorded; set MODEL to provider/model" };
      ref = { providerID: recent[0].providerID, modelID: recent[0].modelID };
      if (!variant && recent[0].variant) variant = recent[0].variant;
    }
  } else ref = { providerID: ctx.parsed.model.providerID, modelID: ctx.parsed.model.modelID };
  let info;
  try { info = await ctx.client.model(ref, ctx.cwd); } catch (e) { return { error: e.message }; }
  if (variant && !info.variants.includes(variant))
    return { error: `variant ${variant} is not advertised for ${modelKey(ref)}; refusing before the model call` };
  return { ref, variant: variant ?? null, info };
}

async function conclude(ctx, firstReply, parsed) {
  if (ctx.abortRequested) return cutExit(ctx, "the run was cancelled before completion");
  const invCheck = (reply) => {
    const info = reply ?? {};
    const providerID = info.model?.providerID ?? null, modelID = info.model?.id ?? null;
    const actual = providerID && modelID ? `${providerID}/${modelID}` : null;
    const matches = providerID != null && providerID === ctx.ref.providerID && modelID === ctx.ref.modelID;
    return { info, actual, matches, completed: Boolean(info.time?.completed) };
  };

  let reply = firstReply;
  let rawText = answerText(reply);
  let parsedJson = extractJson(rawText);
  let check = parsedJson === null ? { ok: false, errors: ["the reply contained no JSON object"] } : validateOutput(parsed.outputSchema, parsedJson);
  let correction = null;

  if (!check.ok) {
    const correctionText = [
      "Your previous reply did not satisfy the required JSON Schema. Reply with a single corrected JSON object and nothing else.",
      `Errors: ${check.errors.slice(0, 10).join("; ")}`,
      `Schema: ${JSON.stringify(parsed.outputSchema)}`,
    ].join("\n");
    const messageID = id("msg");
    ctx.invocationInputs.add(messageID);
    const admitted = await postAndReconcile(ctx, messageID, correctionText);
    if (ctx.abortRequested) return cutExit(ctx, "the correction was cancelled during admission");
    if (!admitted.admitted) {
      correction = { admitted: false, unknown: !admitted.rejected, rejected: Boolean(admitted.rejected), error: admitted.error ?? null };
      ctx.unresolved = ctx.unresolved || !admitted.rejected;
    } else {
      const second = await awaitTurn(ctx, messageID);
      if (ctx.stopping) await ctx.stopping;
      if (ctx.abortRequested || second.aborted || second.timedOut || second.idleTimedOut || second.capped) {
        await stopIfNeeded(ctx, second);
        return cutExit(ctx, "the correction turn did not finish");
      }
      correction = { admitted: true, timedOut: false };
      if (second.reply) {
        reply = second.reply;
        rawText = answerText(reply);
        const parsed2 = extractJson(rawText);
        const check2 = parsed2 === null ? { ok: false, errors: ["the corrected reply contained no JSON object"] } : validateOutput(parsed.outputSchema, parsed2);
        parsedJson = parsed2;
        if (check2.ok) check = check2;
        else check = { ok: false, errors: [...check.errors, ...check2.errors] };
      } else {
        correction.reply = null;
        check = { ok: false, errors: [...check.errors, "the correction produced no reply"] };
      }
    }
  }

  const inv = invocationMessages(ctx);
  const tools = collectTools(inv);
  const { commands, successful } = commandEvidence(tools);
  const v = invCheck(reply);
  const info = v.info;
  const aggregate = (messages) => {
    let u = null, cost = null;
    for (const m of messages) {
      if (m?.tokens) { u = u ?? {}; addTokens(u, m.tokens); }
      if (typeof m?.cost === "number") cost = (cost ?? 0) + m.cost;
    }
    return { usage: u, cost };
  };
  const usage = aggregate(inv.filter((m) => m._sessionID === ctx.sessionID));
  const childUsage = Object.fromEntries([...ctx.invocationSessions].filter((sid) => sid !== ctx.sessionID)
    .map((sid) => [sid, aggregate(inv.filter((m) => m._sessionID === sid))]));
  const turnStatus = info.error ? "error" : v.completed ? "completed" : "unknown";
  const receiptOk = Boolean(v.completed && v.matches && !info.error && !ctx.unresolved && !ctx.statusUnknown && ctx.discoveryComplete && ctx.admission === "admitted");

  atomicJson(ctx.transcriptPath, {
    sessionID: ctx.sessionID, inputIds: [...ctx.invocationInputs], messages: ctx.messages,
    tools, usage: usage.usage, cost: usage.cost, error: info.error ?? null,
  });

  const answerPath = saveAnswer(ctx, rawText);

  const reads = tools.filter((t) => READ_TOOLS.has(t.tool) && t.status === "completed").length;
  const expect = expectation({ expect: parsed.expect, successful, observations: successful.length + reads, allowNoCommands: parsed.allowNoCommands });
  const declined = ctx.declined > 0 || ctx.expired > 0;

  let exitCode = EXIT.SUCCESS, error = null;
  if (ctx.unresolved || ctx.statusUnknown || !ctx.discoveryComplete) {
    exitCode = EXIT.TRANSPORT;
    error = ctx.unresolved ? "an approval or admission outcome remained unknown"
      : !ctx.discoveryComplete ? "session descendants were unknown; success cannot be claimed"
      : "the session status was unknown; success cannot be claimed";
  }
  else if (info.error) { exitCode = EXIT.MODEL; error = info.error.message ?? info.error.name ?? String(info.error); }
  else if (!v.matches) {
    exitCode = EXIT.MODEL;
    error = "the reply's provider/model is missing or does not match the requested model";
  }
  else if (!v.completed) {
    exitCode = EXIT.NO_ANSWER;
    error = "the reply has no completion timestamp; the receipt is incomplete";
  }
  else if (!parsedJson || !check.ok) { exitCode = EXIT.SCHEMA; error = `the answer did not satisfy OUTPUT_SCHEMA (${check.errors.slice(0, 5).join("; ")})`; }
  else if (ctx.needsInput) { exitCode = EXIT.NEEDS_INPUT; error = "an approval was needed and no approval directory was configured"; }
  else if (declined) { exitCode = EXIT.APPROVAL; error = "an approval was declined or expired"; }
  else if (!expect.ok) { exitCode = EXIT.COMMANDS; error = expect.why; }

  const fileChanges = tools.filter((t) => /edit|write|patch/.test(String(t.tool))).map((t) => ({ tool: t.tool, path: t.filePath, status: t.status }));
  const answer = parsedJson && typeof parsedJson.result === "string" ? parsedJson.result : rawText;

  const base = {
    exitCode, error, answer, answerJson: parsedJson, answerPath,
    model: v.actual, turnStatus, receiptOk,
    commands, tools, fileChanges,
    usage: usage.usage, cost: usage.cost,
    childUsage,
    outputSchemaOk: check.ok, schemaErrors: check.ok ? [] : check.errors,
    partial: false, turnError: info.error ?? null,
    admission: ctx.admission,
    cancellation: ctx.cancellation ?? null,
    correction,
  };
  await cleanup(ctx, false);
  if (ctx.abortRequested) return cutExit(ctx, "the run was cancelled before publication");
  const final = publish(ctx, base);
  process.stdout.write(`${JSON.stringify(final, null, 2)}\n`);
  return exitCode;
}

async function stopIfNeeded(ctx, turn) {
  if (turn.timedOut) return ctx.stop ? ctx.stop("wall timeout") : Promise.resolve();
  if (turn.idleTimedOut) return ctx.stop ? ctx.stop("idle timeout") : Promise.resolve();
  if (turn.capped) return ctx.stop ? ctx.stop("command cap") : Promise.resolve();
  return Promise.resolve();
}

// A file beside the report is named after the report: a continuation's report shares the directory, and
// a fixed name there left the earlier report's paths showing the later invocation's files.
const sidecar = (ctx, name) => path.join(path.dirname(ctx.report), `${path.basename(ctx.report, ".json")}.${name}`);

function saveAnswer(ctx, text) {
  if (!text) return null;
  const answerPath = sidecar(ctx, "answer.txt");
  fs.writeFileSync(answerPath, text, { mode: 0o600 });
  return answerPath;
}

// The latest reply with text that this invocation already received, newest input first. A run cut or
// failed after admission reports it as partial instead of dropping it; nothing is guessed or fetched.
function receivedAnswer(ctx) {
  const reply = [...(ctx.invocationInputs ?? [])].reverse()
    .map((inputID) => repliesTo(ctx, inputID).filter((candidate) => answerText(candidate)).at(-1)).find(Boolean);
  const answer = answerText(reply) || null;
  return { answer, answerJson: answer ? extractJson(answer) : null, answerPath: saveAnswer(ctx, answer) };
}

async function cutExit(ctx, why) {
  await cleanup(ctx, false);
  const tools = collectTools(invocationMessages(ctx));
  const base = {
    exitCode: EXIT.TIMEOUT, error: why, partial: true,
    cancellation: ctx.cancellation ?? { reason: why, signal: ctx.signal ?? null, abort: [], observed: "unknown" },
    turnStatus: "aborted", receiptOk: false,
    commands: commandEvidence(tools).commands, tools,
    ...receivedAnswer(ctx),
    admission: ctx.admission,
  };
  const final = publish(ctx, base);
  process.stdout.write(`${JSON.stringify(final, null, 2)}\n`);
  return EXIT.TIMEOUT;
}

function finishFailure(ctx, exitCode, extra = {}) {
  const base = { exitCode, error: ctx.lastRefusal ?? "refused before the model call", ...extra };
  let final;
  try { final = publish(ctx, base.partial ? { ...base, ...receivedAnswer(ctx) } : base); }
  catch { final = { adapter: "opencode", ok: false, exitCode, error: base.error }; }
  process.stdout.write(`${JSON.stringify(final, null, 2)}\n`);
  return exitCode;
}

// A refusal before or around the model call: the reason on stderr exactly, a report with the matching
// exit code, and any owned execution aborted and awaited.
async function fail(ctx, reason, exitCode, extra = {}) {
  ctx.lastRefusal = reason;
  process.stderr.write(`entrust: refused: ${String(reason).replace(/\s*\n\s*/g, " ")}\n`);
  await cleanup(ctx, true);
  return finishFailure(ctx, exitCode, extra);
}

// ---------------------------------------------------------------------------------------------
// Entry

function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.error) { process.stderr.write(`driver: ${o.error}\n${USAGE}`); process.exit(EXIT.USAGE); }
  if (o.help) { process.stdout.write(USAGE); process.exit(0); }

  if (o.check !== null) {
    if (!o.check) process.exit(refuse("--check-prompt-file needs a file"));
    const text = read(o.check);
    if (text === null) process.exit(refuse(`cannot read ${o.check}`));
    const parsed = parsePrompt(text, process.env, process.cwd());
    if (parsed.error) process.exit(refuse(parsed.error));
    const root = writeRootError(parsed);
    if (root) process.exit(refuse(root));
    process.exit(0);
  }

  if (!o.prompt) { process.stderr.write(`driver: --prompt-file is required\n${USAGE}`); process.exit(EXIT.USAGE); }
  if (!o.report || !path.isAbsolute(o.report)) { process.stderr.write(`driver: --report-file must be an absolute path\n${USAGE}`); process.exit(EXIT.USAGE); }
  if (!isRegularFile(o.prompt)) process.exit(refuse(`${o.prompt} is not a regular file`));
  const text = read(o.prompt);
  if (text === null) process.exit(refuse(`cannot read ${o.prompt}`));
  const parsed = parsePrompt(text, process.env, process.cwd());
  if (parsed.error) process.exit(refuse(parsed.error));
  const root = writeRootError(parsed);
  if (root) process.exit(refuse(root));

  execute(o, parsed).then((code) => process.exit(code)).catch((e) => {
    process.stderr.write(`entrust: refused: ${e.message}\n`);
    process.exit(EXIT.MODEL);
  });
}

const isMain = (() => { try { return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isMain) main();

export { execute, sessionPermissions, editScope, rightsScope, scopeWithin, promptText, buildReport, invocationMessages };
