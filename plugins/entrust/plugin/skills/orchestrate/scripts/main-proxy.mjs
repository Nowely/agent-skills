#!/usr/bin/env node
// One saved mode owns its activation and the user's consent, prompts, coordinator reports, worker bindings and
// complete request outcomes.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readAgentOrders } from "./agent-orders.mjs";
import { adapters } from "./adapters.mjs";
import { canonical } from "./drivers.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, "agent-run.mjs");
const SCHEMA = path.join(HERE, "../schemas/main-proxy.schema.json");
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
const json = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const object = (v) => v && typeof v === "object" && !Array.isArray(v);
const quote = (s) => `'${s.replaceAll("'", "'\\''")}'`;
const now = () => new Date().toISOString();
const save = (p, value) => {
  const tmp = `${p}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try { fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "wx" }); fs.renameSync(tmp, p); }
  finally { fs.rmSync(tmp, { force: true }); }
};
const output = (text) => {
  const bytes = Buffer.from(text);
  for (let offset = 0; offset < bytes.length;) {
    try { offset += fs.writeSync(1, bytes, offset, bytes.length - offset); }
    catch (e) { if (e.code !== "EAGAIN") throw e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5); }
  }
};
const terminal = (outcome) => ["completed", "failed", "cancelled"].includes(outcome?.status);
const reply = (agent_id, replyPath) => {
  try { const bytes = fs.readFileSync(replyPath); return { agent_id, replyPath, content: bytes.toString("utf8"), sha256: hash(bytes) }; }
  catch (e) { return { agent_id, replyPath: replyPath ?? null, delivery_error: e.message }; }
};
function recordOutcome(record, outcome, mode) {
  Object.assign(record, { state: "recorded", outcome: outcome.value, outcomeJson: outcome.text });
  if (record.request.action === "collect")
    record.replies = record.request.agent_ids.map((id) => reply(id, mode.agents[id]?.replyPath));
  else if (["delegate", "continue"].includes(record.request.action) && record.replyPath && terminal(outcome.value))
    record.replies = [reply(record.request.agent_id, record.replyPath)];
}

// The adapters whose coordinator acts only through its host, with no tools, MCP servers or customizations of its
// own (measured for Claude on 2.1.299). Another family's coordinator would keep its CLI's own tools.
const HOST_ONLY = new Set(["claude"]);
// Who the host process runs for: Claude Code and Codex name their session in every command they start. Both
// are kept, so a session nested in another has an identity of its own.
const SESSION_KEYS = ["CLAUDE_CODE_SESSION_ID", "CODEX_THREAD_ID"];
// The user's own input: a message the user sent, or the user's own pick among the choices of the host's question tool.
const SOURCES = ["user-message", "user-choice"];
// The approved confirmation, in the user's language; its first choice confirms and its second cancels. A pick in a
// question tool confirms only as the first choice itself. A typed reply is the host's to judge: the helper records
// it as given and cannot tell an affirmative from a quote, a negative or a condition.
const CHOICES = { ru: ["Подтвердить переключение", "Отмена"], en: ["Confirm switch", "Cancel"] };
const plain = (text) => text.replace(/\r?\n$/, "").trim().replace(/[.!]+$/, "").toLocaleLowerCase();
// Images a native result carries, as the coordinator's CLI takes them: MCP ImageContent, an Anthropic image block or
// a data URL. They travel as image blocks beside RESULTS, which stays as recorded.
const MEDIA = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
const DATA_URL = /^data:([a-z]+\/[a-z0-9+.-]+);base64,([A-Za-z0-9+/=\r\n]+)$/;
// A native tool can label real image bytes with the generic application/octet-stream (view_image did, observed live). Such
// bytes count as an image only by their own signature, and only for the four supported rasters; anything else, SVG
// included, is left as text.
const GENERIC = "application/octet-stream";
function sniff(payload) {
  if (!/^[A-Za-z0-9+/]+=*$/.test(payload)) return null;
  const b = Buffer.from(payload.slice(0, 32), "base64");
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) return "image/png";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 6 && /^GIF8[79]a$/.test(b.subarray(0, 6).toString("latin1"))) return "image/gif";
  if (b.length >= 12 && b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
}
const CONFIRMATION = {
  ru: ({ display, short, provider }) => [
    `Вы переключаете основную сессию в режим прокси на **${display}** через провайдера **${provider}**.`,
    `Подтверждая переключение, вы делегируете ${display} принятие всех решений и разрешаете использовать все права и возможности основной сессии без ограничений.`,
    `Вы также разрешаете передавать этому провайдеру рабочий контекст основной сессии, содержимое рабочих файлов и результаты инструментов для выполнения ваших поручений моделью ${display}.`,
    "Делегируются полномочия основной сессии в их фактическом объёме; обязательные ограничения платформы и провайдера остаются в силе.",
    `После подтверждения ${short} ведёт работу, а хост исполняет его запросы без повторного согласования уже делегированных полномочий.`,
    `**Переключиться на ${display}?**`,
    "**Подтвердить переключение** / **Отмена**",
  ].join("\n\n"),
  en: ({ display, short, provider }) => [
    `You are switching the main session to proxy mode on **${display}** through the provider **${provider}**.`,
    `By confirming the switch, you delegate all decisions to ${display} and allow it to use every right and capability of the main session without restriction.`,
    `You also allow this provider to receive the main session's working context, the contents of working files and tool results, so that ${display} can carry out your instructions.`,
    "The main session's authority is delegated in its actual scope; mandatory platform and provider restrictions remain in force.",
    `After confirmation, ${short} leads the work, and the host carries out its requests without asking again for authority already delegated.`,
    `**Switch to ${display}?**`,
    "**Confirm switch** / **Cancel**",
  ].join("\n\n"),
};

const MUTATING = new Set(["propose", "confirm", "cancel", "end", "prepare", "finish", "begin", "bind", "record"]);
const USAGE = `main-proxy — the main session's proxy mode: one confirmed activation, coordinator rounds and complete host outcomes.

  help | --help
  catalogue --from <file|-> [--extra file] --out file --proxy-model model --coordinator-model model --worker-models '<JSON array>'
  propose --state dir --adapter claude --model model [--effort effort] --cwd dir --catalogue file --language ru|en [--replaces state]
  confirm --state dir --pending id --source user-message|user-choice --answer-file <file|->
  cancel --state dir --pending id
  end --state dir
  prepare --state dir --message-file file --host-facts file [--results file]
  finish --state dir
  begin --state dir --request-id id
  bind --state dir --agent-id id --native-json <file|-> --model model --effort effort --reply-path file
  record --state dir --request-id id --outcome-json <file|->
  results --state dir
  status --state dir

propose launches nothing: it checks the launch offline, names the provider from the adapter's route and prints the
pending id, the choices and the confirmation to show. confirm records the answer the host received from the user, a
pick only as the first choice; repeating it finishes a confirmation a crash interrupted. Nothing else admits a launch.
cancel leaves every other mode as it was; a confirmed --replaces ends the mode it names, which must be this host
session's. prepare, and the driver again right before it starts the coordinator, admit a launch only for the mode's
current round, not ended, in the host session and on the route the user confirmed; the first complete round makes the
mode active. A failed round dispatches nothing and closes, so the next prepare continues the same coordinator.
Admission is a round's durable start: the driver claims it under the lock before it spawns the CLI (status shows launch); an end before the claim refuses the round, one after finds it in flight, and its report is kept but an ended mode publishes none of its orders. A claimed round whose driver died is closed as failed by finish and restarted by prepare under the same consent, never claimed twice. end must come from the mode's own host session. A confirmed mode publishes orders unbegun: begin claims one right before the host executes it and prints the
justification a platform check of it is shown; end revokes every order not yet begun, and a begun one's outcome is
still recorded. Images in native results reach the coordinator as image blocks while RESULTS keeps them, and every string, exactly as recorded.
finish publishes once. After a lost stdout, reconcile saved orders and request states via status.
Orders are beside the report; status returns ordersPath. Bind native identity: agent_id, native_agent, id or task_name (e.g. {"agent_id":"worker-1"}).
Delegate/continue terminal bind or record reads the bound replyPath into replies with content and sha256 (or delivery_error).
Spawn bindings stay recorded and accept one later terminal record; terminal outcomes are immutable.
Unbound worker outcomes record once without replies; completed requires a binding.
Collect outcome JSON needs root status completed|failed|cancelled (e.g. {"status":"completed"}); replies use each agent's bound replyPath.
`;

function stateLock(state) {
  const lockPath = path.join(state, "state.lock"), token = crypto.randomUUID(), deadline = Date.now() + 30000;
  for (;;) {
    try {
      const fd = fs.openSync(lockPath, "wx", 0o600);
      try { fs.writeSync(fd, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString(), token })); }
      finally { fs.closeSync(fd); }
      return () => { if (json(lockPath).token === token) fs.unlinkSync(lockPath); };
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
      let owner;
      try { owner = json(lockPath); } catch (error) { if (error.code === "ENOENT") continue; }
      if (owner) {
        if (!Number.isInteger(owner.pid) || owner.pid <= 0 || !Number.isFinite(Date.parse(owner.startedAt))) throw new Error(`invalid state lock at ${lockPath}; reconcile it before mutation`);
        let alive = true;
        try { process.kill(owner.pid, 0); } catch (error) { if (error.code === "ESRCH") alive = false; else if (error.code !== "EPERM") throw error; }
        if (!alive) throw new Error(`stale state lock at ${lockPath}: dead pid ${owner.pid}, startedAt ${owner.startedAt}; reconcile it before mutation`);
      }
      if (Date.now() >= deadline) throw new Error(`state lock busy at ${lockPath}; reconcile via status`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
    }
  }
}

function stateLocation(cwd, state) {
  const root = spawnSync("git", ["-C", cwd, "rev-parse", "--show-toplevel"], { encoding: "utf8" });
  const checkout = root.status === 0 ? fs.realpathSync(root.stdout.trim()) : cwd;
  const resolvedState = canonical(state);
  if (resolvedState === checkout || resolvedState.startsWith(`${checkout}${path.sep}`)) throw new Error("mode state must be outside the checkout");
}
const put = (map, key, value) => Object.defineProperty(map, key, { value, enumerable: true, writable: true, configurable: true });
const required = (o, k) => { if (!o[k]) throw new Error(`--${k} is required`); return o[k]; };
const input = (p) => { const text = fs.readFileSync(p === "-" ? 0 : p, "utf8"); return { text, value: JSON.parse(text) }; };

// A capability's schema is the runtime's own: the host's native tool enforces it, so a keyword the local reader
// does not enforce keeps no capability out of the catalogue.
function validateCatalogue(c) {
  if (c.schemaVersion !== 1 || typeof c.observedAt !== "string" || !Number.isFinite(Date.parse(c.observedAt))
    || typeof c.source !== "string" || !c.source.trim() || !Array.isArray(c.capabilities) || !Array.isArray(c.workerModels)
    || typeof c.proxyModel !== "string" || !c.proxyModel.trim() || typeof c.coordinatorModel !== "string" || !c.coordinatorModel.trim())
    throw new Error("invalid runtime capability catalogue");
  const ids = new Set();
  for (const cap of c.capabilities) {
    if (!object(cap) || typeof cap.id !== "string" || !cap.id.trim() || ids.has(cap.id)
      || !["tool", "skill", "agent-route", "model"].includes(cap.kind) || typeof cap.description !== "string"
      || typeof cap.authority !== "string" || !cap.authority.trim()
      || !["object", "string"].includes(cap.inputKind ?? "object")
      || (cap.inputDescription !== undefined && typeof cap.inputDescription !== "string")
      || (cap.inputKind === "string" && cap.argumentsSchema !== undefined)
      || (cap.argumentsSchema !== undefined && !object(cap.argumentsSchema))) throw new Error(`invalid or duplicate capability: ${cap?.id ?? JSON.stringify(cap)}`);
    ids.add(cap.id);
  }
  for (const w of c.workerModels) if (!object(w) || typeof w.model !== "string" || !w.model.trim() || w.model === "inherit"
    || !Array.isArray(w.efforts) || !w.efforts.length || w.efforts.some((e) => typeof e !== "string" || !e.trim() || e === "inherit"))
    throw new Error("invalid explicit worker model/efforts");
  return c;
}
const catalogueOf = (p) => validateCatalogue(json(p));

function makeCatalogue(o) {
  const metadata = input(required(o, "from")).value;
  const extra = o.extra ? json(o.extra) : [];
  if (!Array.isArray(metadata) || !Array.isArray(extra)) throw new Error("catalogue inputs must be JSON arrays");
  const capabilities = new Map();
  for (const entry of [...metadata, ...extra]) {
    if (!object(entry)) throw new Error("invalid runtime tool metadata entry");
    const id = entry.id ?? entry.name;
    const inputKind = entry.inputKind ?? "object";
    const cap = { ...entry, id, kind: entry.kind ?? "tool", inputKind, description: entry.description ?? "",
      authority: entry.authority ?? "host platform approval applies" };
    if (entry.argumentsSchema !== undefined || entry.parameters !== undefined) cap.argumentsSchema = entry.argumentsSchema ?? entry.parameters;
    if (!capabilities.has(id)) capabilities.set(id, cap);
  }
  const result = { schemaVersion: 1, observedAt: new Date().toISOString(), source: "runtime-advertised metadata with directly declared extras",
    capabilities: [...capabilities.values()], workerModels: JSON.parse(required(o, "worker-models")),
    proxyModel: required(o, "proxy-model"), coordinatorModel: required(o, "coordinator-model") };
  const out = path.resolve(required(o, "out"));
  validateCatalogue(result); save(out, result);
}

// What changed in the catalogue since the prompt the coordinator's session holds last: entries added or changed in
// full, removed ids, and the other fields that differ. The session keeps the rest, so a large runtime is sent once.
function catalogueChanges(previous, current) {
  const before = new Map(previous.capabilities.map((c) => [c.id, JSON.stringify(c)]));
  const ids = new Set(current.capabilities.map((c) => c.id));
  return { since: previous.observedAt, observedAt: current.observedAt,
    added: current.capabilities.filter((c) => !before.has(c.id)),
    changed: current.capabilities.filter((c) => before.has(c.id) && before.get(c.id) !== JSON.stringify(c)),
    removed: [...before.keys()].filter((id) => !ids.has(id)),
    ...Object.fromEntries(["source", "workerModels", "proxyModel", "coordinatorModel"]
      .filter((k) => JSON.stringify(previous[k]) !== JSON.stringify(current[k])).map((k) => [k, current[k]])) };
}

const lifecycleOf = (mode) => mode.lifecycle ?? "legacy";
const familyOf = (model) => /^(claude-|opus$|sonnet$|haiku$|fable$)/i.test(model) ? "claude" : /^gpt-|^(sol|luna|astra)$/i.test(model) ? "codex" : "opencode";
// How the confirmation names a model: an alias by its family, a full id by its family and itself.
function modelNames(model) {
  const family = /(opus|sonnet|haiku|fable)/i.exec(model)?.[1]?.toLowerCase() ?? null;
  const short = family ? family[0].toUpperCase() + family.slice(1) : model;
  return { family, short, display: !family ? model : model === family ? `Claude ${short}` : `Claude ${short} (${model})` };
}
// Whether an observed model is the selected one: a model of an alias's family, or the full id itself.
function serves(observed, selector) {
  if (typeof observed !== "string") return false;
  const { family } = modelNames(selector);
  return family && selector === family ? /^claude-/i.test(observed) && modelNames(observed).family === family : observed === selector;
}
function hostSession(env = process.env) {
  const ids = Object.fromEntries(SESSION_KEYS.filter((k) => env[k]).map((k) => [k, env[k]]));
  if (!Object.keys(ids).length)
    throw new Error(`no host session identity in the environment (${SESSION_KEYS.join(" or ")}): the consent is bound to the session it is given in`);
  return ids;
}
const pidAlive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
const sameSession = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// A running mode is its own host session's to end: a confirmed one's consent names it; a legacy one names none, and
// the user's confirmed replacement in this session is then the only authority over it.
const ownedHere = (mode, session) => mode.schemaVersion !== 2 || sameSession(mode.consent?.hostSession, session);
// The route a launch would take now, from the adapter's passive status probe, which calls no model. It runs in the
// directory the coordinator runs in, whose project settings can route it.
function observedRoute(adapter, cwd) {
  const status = adapters().find((a) => a.id === adapter)?.status;
  if (!status?.script) throw new Error(`adapter ${adapter} has no status probe to name its route`);
  const r = spawnSync(process.execPath, [status.script, ...status.args], { cwd, encoding: "utf8", timeout: 30000 });
  let s = null;
  try { s = JSON.parse(r.stdout); } catch {}
  if (!object(s)) throw new Error(`the ${adapter} status probe printed no report${r.error ? `: ${r.error.message}` : ""}`);
  if (s.status !== "ready") throw new Error(`the ${adapter} route is ${s.status}${s.error ? ` (${s.error})` : ""}; nothing was launched`);
  if (!object(s.route) || typeof s.route.provider !== "string" || !s.route.provider.trim())
    throw new Error(`the ${adapter} status names no provider for its route${s.route?.problem ? ` (${s.route.problem})` : ""}; none is guessed from the model`);
  return s.route;
}
const routeKey = (r) => JSON.stringify({ apiProvider: r?.apiProvider ?? null, baseUrls: r?.baseUrls ?? {} });
// A round's header: a confirmed coordinator runs the host-only profile, on the exact model its activation observed;
// a legacy mode keeps the read run it was started with.
const headerOf = (mode, resume) => (mode.schemaVersion === 2
  ? `RIGHTS: read ${mode.cwd}\nPROFILE: coordinator\nMODEL: ${mode.effectiveModel ?? mode.model}\n${mode.effort ? `EFFORT: ${mode.effort}\n` : ""}OUTPUT_SCHEMA: ${SCHEMA}\n`
  : `RIGHTS: read ${mode.cwd}\nMODEL: ${mode.model}\nALLOW_NO_COMMANDS: yes\nOUTPUT_SCHEMA: ${SCHEMA}\n`) + (resume ? `RESUME: ${resume}\n` : "");

// The launch a confirmation offers, checked offline by the adapter's own driver before anyone is asked.
async function preflight(mode, state) {
  const { driver } = await import(pathToFileURL(adapters().find((a) => a.id === mode.adapter).launch).href);
  const file = path.join(state, `preflight-${crypto.randomUUID()}.txt`);
  fs.writeFileSync(file, `${headerOf(mode, null)}TASK:\npreflight\n`, { mode: 0o600, flag: "wx" });
  try {
    const r = spawnSync(process.execPath, [driver, "--check-prompt-file", file], { encoding: "utf8", timeout: 30000, env: { ...process.env, ENTRUST_STATE_DIR: state } });
    if (r.status !== 0) throw new Error(`the launch would be refused, so nothing was proposed: ${(r.stderr || r.error?.message || `exit ${r.status}`).trim()}`);
  } finally { fs.rmSync(file, { force: true }); }
}

// A launch rests on the consent: given by the user in this host session, not ended or replaced since, for the route
// the user was shown. prepare checks it, and the driver checks it again under the state lock right before it starts
// the coordinator, so an end, a replacement or a drift between the two sends nothing.
function admitLaunch(mode, state) {
  if (mode.lifecycle === "pending") throw new Error("the user has not confirmed this activation: nothing was launched and no context was sent");
  if (mode.lifecycle === "cancelled") throw new Error("this activation was cancelled: nothing was launched; a new activation starts with propose");
  if (mode.lifecycle === "ended") throw new Error(`this mode ended at ${mode.endedAt}: delegation has stopped and nothing was launched; a new activation starts with propose`);
  if (!sameSession(hostSession(), mode.consent.hostSession))
    throw new Error("the consent was given in another host session: nothing was launched; this session needs an activation of its own");
  completeReplacement(state, mode);
  const route = observedRoute(mode.adapter, mode.cwd);
  if (routeKey(route) !== routeKey(mode.consent.route))
    throw new Error(`the route changed since the confirmation, from ${mode.consent.provider} to ${route.provider}: nothing was launched, and another provider needs a new activation`);
}
// The driver's admission of a coordinator round, by its report path: a round of a mode this helper prepared is
// admitted only as that mode's current round, under its consent now; a report outside a mode state has no consent
// to check. Admission is also the round's durable logical start: under the same lock it saves the claim (report, pid,
// time) before the driver opens its transcript or spawns the CLI. An end that takes the lock first refuses the round;
// one that takes it after finds the claim, and the round is then in flight like a begun order: it may finish and its
// report is kept, but finish publishes no orders of an ended mode. A round is claimed once, so a driver run again on
// the same report is refused instead of sending the context twice. Returns the refusal, or null.
export function admitRound(report, pid = process.pid) {
  const state = path.dirname(path.dirname(path.resolve(report))), modePath = path.join(state, "mode.json");
  if (!fs.existsSync(modePath)) return null;
  const release = stateLock(state);
  try {
    const mode = json(modePath);
    if (mode.schemaVersion !== 2) return "a coordinator round needs a confirmed activation, and this legacy mode has none: nothing was launched";
    if (!mode.currentReport || canonical(mode.currentReport) !== canonical(report)) return "this is not the round the mode prepared: nothing was launched";
    if (mode.launch && canonical(mode.launch.report) === canonical(report))
      return `this round was already started at ${mode.launch.at}: its context is not sent twice; reconcile via status`;
    admitLaunch(mode, state);
    mode.launch = { report: canonical(report), pid, at: now() };
    save(modePath, mode);
    return null;
  } catch (e) { return e.message; }
  finally { release(); }
}
// Ending a mode stops what it would still do: an order the host has not begun is revoked, with that reason as its
// outcome, while a begun one keeps waiting for its real outcome.
function revoke(mode, at, endedBy) {
  for (const record of Object.values(mode.requests))
    if (record.state === "published") Object.assign(record, { state: "recorded", outcome: { status: "revoked", reason: `the mode ended before the host began this order (${endedBy})` }, outcomeJson: null });
  Object.assign(mode, { lifecycle: "ended", endedAt: at, endedBy });
}
// The replaced mode of a confirmed switch is ended by this switch, at any later step too, so a crash or a lost
// stdout after the consent was saved finishes the switch without a new question.
function completeReplacement(state, mode) {
  if (mode.consent?.replaces) endMode(mode.consent.replaces, { at: mode.consent.at, endedBy: "replaced", replacedBy: canonical(state), session: mode.consent.hostSession });
}
// Images in a native result are added to the prompt as image blocks. RESULTS and every outcomeJson stay exactly as
// recorded, the base64 included: no string is rewritten, so ordinary text, request arguments and replies that happen to
// hold the same characters are unchanged. Only structurally defined images count: MCP ImageContent, an Anthropic base64
// image block, or a string that is wholly a data URL; a generic application/octet-stream label is resolved by signature.
function attach(results) {
  const blocks = [], seen = new Set();
  const add = (media, data) => {
    const payload = data.replace(/\s+/g, "");
    if (media === GENERIC) media = sniff(payload);
    if (!MEDIA.has(media) || !payload || seen.has(payload)) return;
    seen.add(payload);
    blocks.push({ type: "image", source: { type: "base64", media_type: media, data: payload } });
  };
  const find = (v) => {
    if (typeof v === "string") { const m = DATA_URL.exec(v); if (m) add(m[1], m[2]); }
    else if (Array.isArray(v)) v.forEach(find);
    else if (object(v)) {
      if (v.type === "image" && typeof v.data === "string") add(v.mimeType ?? v.mime_type, v.data);
      if (v.type === "image" && v.source?.type === "base64" && typeof v.source.data === "string") add(v.source.media_type, v.source.data);
      for (const x of Object.values(v)) find(x);
    }
  };
  find(results);
  return { blocks };
}

// What makes a round the confirmed coordinator's: the host-only profile, no call of its own beside the structured
// answer, and every message from the model the user confirmed, the exact one once the activation observed it.
function coordinatorProblem(report, mode) {
  if (report.profile !== "coordinator") return "the round did not run the coordinator profile";
  if (!report.context) return "the round reported no init, so its profile was never confirmed";
  // The driver classifies plugins by provenance (builtinPlugin); anything it did not prove built-in fails the round here too.
  if (!Array.isArray(report.context.installedPlugins) || report.context.installedPlugins.length)
    return `the round reported plugins that are not proven platform built-ins: ${JSON.stringify(report.context.installedPlugins ?? "no classification")}`;
  const own = [...new Set((report.tools ?? []).map((t) => t.tool).filter((t) => t !== "StructuredOutput"))];
  if (own.length) return `the coordinator called ${own.join(", ")} itself`;
  const observed = [...new Set([report.model, ...(report.assistantModels ?? [])])];
  if (observed.some((m) => (mode.effectiveModel ? m !== mode.effectiveModel : !serves(m, mode.model))))
    return `the coordinator answered as ${observed.filter(Boolean).join(", ") || "no observed model"}, not the confirmed ${mode.effectiveModel ?? mode.consent.display}`;
  return null;
}
const coordinatorConsent = (c) => ({ confirmedAt: c.at, source: c.source, answer: c.answer, model: c.display, provider: c.provider, confirmation: c.confirmation });
// What the host shows a platform check of an action the coordinator requested.
const justification = (c) => `Requested by ${c.display}, the coordinator the user confirmed for this session at ${c.at} (${c.source}: ${JSON.stringify(c.answer)}), `
  + `with every right and capability of the session delegated to it and its working context sent to ${c.provider}.`;

// The replaced mode, under its own lock: one that already ended stays as it is, and a running one of another host
// session is not this switch's to end.
function endMode(dir, facts) {
  const modePath = path.join(dir, "mode.json"), release = stateLock(dir);
  try {
    const mode = json(modePath), lifecycle = lifecycleOf(mode);
    if (lifecycle === "ended") return;
    if (!ownedHere(mode, facts.session)) throw new Error(`the mode at ${dir} was confirmed in another host session; only that session ends it`);
    if (["pending", "cancelled"].includes(lifecycle)) throw new Error(`the mode at ${dir} is ${lifecycle}: nothing runs there to end`);
    revoke(mode, facts.at, facts.endedBy);
    if (facts.replacedBy) mode.replacedBy = facts.replacedBy;
    save(modePath, mode);
  } finally { release(); }
}

async function propose(o, state, modePath) {
  const cwd = fs.realpathSync(required(o, "cwd"));
  if (fs.existsSync(modePath)) throw new Error("mode already exists; a new activation uses a new state directory");
  const adapter = required(o, "adapter"), selected = required(o, "model");
  const model = /^(opus|sonnet|haiku|fable)$/i.test(selected) ? selected.toLowerCase() : selected;
  if (adapter !== familyOf(model)) throw new Error(`model ${model} requires adapter ${familyOf(model)}`);
  if (!HOST_ONLY.has(adapter))
    throw new Error(`no coordinator profile that acts only through the host is proven for adapter ${adapter}: the proxy activates Claude coordinators, and nothing was proposed`);
  const language = required(o, "language");
  if (!Object.hasOwn(CHOICES, language)) throw new Error(`--language must be ${Object.keys(CHOICES).join(" or ")}`);
  const catalogue = path.resolve(required(o, "catalogue")); catalogueOf(catalogue);
  const session = hostSession();
  const replaces = o.replaces ? canonical(o.replaces) : null;
  if (replaces) {
    if (replaces === canonical(state)) throw new Error("--replaces names this activation's own state");
    const old = json(path.join(replaces, "mode.json")), lifecycle = lifecycleOf(old);
    if (["pending", "cancelled", "ended"].includes(lifecycle)) throw new Error(`--replaces names a mode that is ${lifecycle}, not running`);
    if (!ownedHere(old, session)) throw new Error("--replaces names a mode confirmed in another host session; only that session ends it");
  }
  const route = observedRoute(adapter, cwd);
  const mode = { schemaVersion: 2, lifecycle: "pending", adapter, model, effort: o.effort ?? null, effectiveModel: null, cwd, catalogue,
    pending: null, consent: null, agents: {}, requests: {}, lineage: [], round: 0, currentReport: null, lastCompletedReport: null, external_session: null };
  await preflight(mode, state);
  const names = modelNames(model), confirmation = CONFIRMATION[language]({ ...names, provider: route.provider });
  mode.pending = { id: crypto.randomUUID(), createdAt: now(), hostSession: session, language, choices: CHOICES[language], display: names.display,
    provider: route.provider, route, confirmation, confirmationSha256: hash(confirmation), replaces };
  save(modePath, mode);
  output(`${JSON.stringify({ pending: mode.pending.id, choices: mode.pending.choices, confirmation })}\n`);
}

// The consent is saved before anything else changes; a repeat of the same confirmation, after a crash or a lost stdout,
// finishes what it began from the saved state and asks nothing.
function confirm(o, state, modePath, mode) {
  if (mode.schemaVersion !== 2) throw new Error("this legacy mode has no activation to confirm: a confirmed coordinator starts with propose");
  const session = hostSession();
  if (mode.lifecycle !== "pending") {
    if (mode.consent && required(o, "pending") === mode.consent.pending && sameSession(session, mode.consent.hostSession)) {
      // A repeat finishes an unfinished switch only while the mode runs; an ended one returns its receipt and changes nothing.
      if (mode.lifecycle !== "ended") completeReplacement(state, mode);
      output(`${JSON.stringify(mode.consent)}\n`);
      return;
    }
    throw new Error(`this activation is ${mode.lifecycle}, not pending; a new activation starts with propose`);
  }
  if (required(o, "pending") !== mode.pending.id) throw new Error("--pending names another activation than this state's: show its confirmation and ask again");
  if (!sameSession(session, mode.pending.hostSession)) throw new Error("this activation was proposed in another host session: only an answer given there confirms it");
  const source = required(o, "source");
  if (!SOURCES.includes(source)) throw new Error(`--source must be ${SOURCES.join(" or ")}: an answer from ${source} is not the user's`);
  const bytes = fs.readFileSync(required(o, "answer-file") === "-" ? 0 : o["answer-file"]);
  const answer = bytes.toString("utf8"), bare = answer.replace(/\r?\n$/, ""), [yes, no] = mode.pending.choices;
  if (!answer.trim()) throw new Error("the answer is empty: silence is not consent");
  if (plain(answer) === plain(no)) throw new Error(`the answer is ${JSON.stringify(no)}: record it with cancel`);
  if (source === "user-choice" && bare !== yes) throw new Error(`a choice confirms only as ${JSON.stringify(yes)}, not ${JSON.stringify(answer)}`);
  const p = mode.pending, consent = { pending: p.id, source, answer, answerSha256: hash(bytes), at: now(), hostSession: session,
    adapter: mode.adapter, model: mode.model, display: p.display, effort: mode.effort, provider: p.provider, route: p.route,
    language: p.language, confirmation: p.confirmation, confirmationSha256: p.confirmationSha256, cwd: mode.cwd, replaces: p.replaces };
  Object.assign(mode, { lifecycle: "confirmed", consent }); save(modePath, mode);
  completeReplacement(state, mode);
  output(`${JSON.stringify(consent)}\n`);
}

export async function main(argv = process.argv.slice(2)) {
  const command = argv.shift(), o = {};
  if (["help", "--help"].includes(command) || argv.includes("--help")) { output(USAGE); return; }
  while (argv.length) {
    const flag = argv.shift(), value = argv.shift();
    if (!flag.startsWith("--") || value === undefined || Object.hasOwn(o, flag.slice(2))) throw new Error(`invalid argument: ${flag}`);
    o[flag.slice(2)] = value;
  }
  if (command === "catalogue") return makeCatalogue(o);
  if (command === "init") throw new Error("init became propose and confirm: a coordinator starts only after the user's confirmation");
  if (!MUTATING.has(command) && !["status", "results"].includes(command)) throw new Error(USAGE);
  const state = path.resolve(required(o, "state")), modePath = path.join(state, "mode.json");
  if (command === "propose") { stateLocation(fs.realpathSync(required(o, "cwd")), state); fs.mkdirSync(state, { recursive: true }); }
  const release = MUTATING.has(command) ? stateLock(state) : null;
  try {
    if (command === "propose") return await propose(o, state, modePath);
    const mode = json(modePath), v2 = mode.schemaVersion === 2;
    if (command === "status") { output(`${JSON.stringify({ lifecycle: lifecycleOf(mode),
      pending: mode.lifecycle === "pending" ? { id: mode.pending.id, choices: mode.pending.choices, confirmation: mode.pending.confirmation } : null,
      consent: mode.consent ?? null, justification: mode.consent && mode.lifecycle !== "ended" ? justification(mode.consent) : null,
      effectiveModel: mode.effectiveModel ?? null, launch: mode.launch ?? null, failures: mode.failures ?? [], endedAt: mode.endedAt ?? null,
      currentReport: mode.currentReport, lastCompletedReport: mode.lastCompletedReport,
      published: Boolean(mode.publications?.[mode.lastCompletedReport]?.published), ordersPath: mode.ordersPath ?? null,
      publications: mode.publications ?? {}, requests: mode.requests, rejectedRequests: mode.rejectedRequests ?? [] })}\n`); return; }
    if (command === "confirm") return confirm(o, state, modePath, mode);
    if (command === "cancel") {
      if (!v2 || mode.lifecycle !== "pending") throw new Error(`nothing to cancel: this mode is ${lifecycleOf(mode)}`);
      if (required(o, "pending") !== mode.pending.id) throw new Error("--pending names another activation than this state's");
      Object.assign(mode, { lifecycle: "cancelled", cancelledAt: now() }); save(modePath, mode);
      return;
    }
    if (command === "end") {
      const lifecycle = lifecycleOf(mode);
      if (lifecycle === "ended") throw new Error(`already ended at ${mode.endedAt}`);
      if (["pending", "cancelled"].includes(lifecycle)) throw new Error(`nothing to end: this activation is ${lifecycle}`);
      // A mode is its own host session's to end; a legacy one records none, so any session of its user may.
      if (v2 && !ownedHere(mode, hostSession())) throw new Error("the consent was given in another host session; only that session ends this mode");
      // A confirmed switch the crash interrupted is finished first, so ending its new mode leaves no replaced one running.
      if (v2) completeReplacement(state, mode);
      revoke(mode, now(), "user"); save(modePath, mode);
      return;
    }
    if (command === "begin") {
      // The host's claim on one published order, right before it executes it: an order is begun once, never after the
      // mode ends, and a begun order's outcome is unknown until recorded, so it is reconciled, never replayed.
      if (!v2) throw new Error("a legacy mode publishes its orders as dispatched; it has no begin step");
      const id = required(o, "request-id"), record = Object.hasOwn(mode.requests, id) ? mode.requests[id] : null;
      if (!record) throw new Error(`no published request: ${id}`);
      if (mode.lifecycle === "ended") throw new Error(`this mode ended at ${mode.endedAt}: the host executes none of its orders`);
      if (!sameSession(hostSession(), mode.consent.hostSession)) throw new Error("the consent was given in another host session: this session executes none of its orders");
      if (record.state !== "published") throw new Error(`request ${id} is ${record.state}: an order is begun once, and an unknown outcome is reconciled, never replayed`);
      Object.assign(record, { state: "dispatched_outcome_unknown", begunAt: now() }); save(modePath, mode);
      output(`${JSON.stringify({ request: record.request, justification: justification(mode.consent) })}\n`);
      return;
    }
    if (command === "prepare") {
      if (mode.lifecycle === "ended") throw new Error(`this mode ended at ${mode.endedAt}: delegation has stopped; a new activation starts with propose`);
      if (v2) admitLaunch(mode, state);
      if (mode.currentReport) throw new Error("finish the current report before preparing another");
      if (Object.values(mode.requests).some((r) => ["published", "dispatched_outcome_unknown"].includes(r.state)))
        throw new Error("record every dispatched outcome before continuation");
      const catalogue = catalogueOf(mode.catalogue);
      const message = fs.readFileSync(required(o, "message-file"), "utf8");
      const facts = fs.readFileSync(required(o, "host-facts"), "utf8");
      const results = o.results ? fs.readFileSync(o.results, "utf8") : null;
      if (results) JSON.parse(results);
      const reference = fs.readFileSync(path.join(HERE, "../references/main-proxy.md"), "utf8");
      const orders = reference.split("## Agent orders\n")[1]?.split("\n## ")[0];
      if (!orders) throw new Error("main-proxy.md has no Agent orders section");
      const round = mode.round + 1, dir = path.join(state, `round-${round}`), report = path.join(dir, "report.json");
      fs.mkdirSync(dir);
      const cataloguePath = path.join(dir, "catalogue.json"); save(cataloguePath, catalogue);
      const seen = v2 && mode.lastCompletedReport ? path.join(path.dirname(mode.lastCompletedReport), "catalogue.json") : null;
      const capabilities = seen && fs.existsSync(seen) ? `CAPABILITY_CHANGES:\n${JSON.stringify(catalogueChanges(json(seen), catalogue))}\n`
        : `CAPABILITY_CATALOGUE:\n${JSON.stringify(catalogue)}\n`;
      const media = v2 && results ? attach(JSON.parse(results)) : { blocks: [] };
      const attachments = media.blocks.length ? path.join(dir, "attachments.json") : null;
      if (attachments) save(attachments, media.blocks);
      const prompt = headerOf(mode, mode.lastCompletedReport) + (attachments ? `ATTACHMENTS: ${attachments}\n` : "")
        + `TASK:\n${mode.lastCompletedReport ? "" : `## Agent orders\n${orders}\n${v2 ? `CONSENT:\n${JSON.stringify(coordinatorConsent(mode.consent))}\n` : ""}`}${capabilities}HOST_FACTS:\n${facts}\n`
        + (attachments ? `IMAGES: ${media.blocks.length} attached to this message as image blocks, in order of first appearance in RESULTS, where each stays in its original form.\n` : "")
        + (results ? `RESULTS:\n${results}\n` : "") + `USER_MESSAGE (verbatim text encoded as a JSON string):\n${JSON.stringify(message)}`;
      fs.writeFileSync(path.join(dir, "prompt.txt"), prompt, { mode: 0o600 });
      const prepared = spawnSync(process.execPath, [ENTRY, "--new", "--adapter", mode.adapter, "--report-file", report], { input: prompt, encoding: "utf8", env: { ...process.env, ENTRUST_STATE_DIR: state } });
      if (prepared.status !== 0 || /REFUSED=/.test(prepared.stdout)) {
        mode.round = round;
        mode.lastPreparationError = { report, stdout: prepared.stdout, stderr: prepared.stderr, exitCode: prepared.status };
        if (v2 && mode.lifecycle !== "active") mode.lifecycle = "failed";
        save(modePath, mode);
        throw new Error(`preparation failed: ${prepared.stdout}${prepared.stderr}`);
      }
      Object.assign(mode, { round, currentReport: report, currentCataloguePath: cataloguePath }); save(modePath, mode);
      output(`ENTRUST_STATE_DIR=${quote(state)} ${quote(process.execPath)} ${quote(ENTRY)} --run --watch --report-file ${quote(report)}\n`);
    } else if (command === "finish") {
      if (!mode.currentReport) {
        const published = mode.publications?.[mode.lastCompletedReport];
        if (published?.published) throw new Error(`already finished; batch published at ${published.ordersPath}; reconcile via status`);
        throw new Error("no prepared report");
      }
      if (mode.lifecycle === "ended") throw new Error(`this mode ended at ${mode.endedAt}: its round publishes no orders`);
      if (mode.publications?.[mode.currentReport]?.published)
        throw new Error(`already finished; batch published at ${mode.publications[mode.currentReport].ordersPath}; reconcile via status`);
      const catalogue = catalogueOf(mode.currentCataloguePath ?? mode.catalogue);
      const report = json(mode.currentReport);
      // A claimed round whose driver died without a report left its outcome unknown: the round closes as failed, the
      // coordinator stays, and the next prepare is a technical restart under the same consent.
      if (v2 && !Number.isInteger(report.exitCode) && mode.launch && canonical(mode.launch.report) === canonical(mode.currentReport) && !pidAlive(mode.launch.pid)) {
        mode.failures = [...(mode.failures ?? []), { report: mode.currentReport, exitCode: null, error: "the driver of this round died without a report; whether the coordinator received its context is unknown", at: now() }];
        Object.assign(mode, { currentReport: null, currentCataloguePath: null, lifecycle: mode.lifecycle === "active" ? "active" : "failed" });
        save(modePath, mode);
        throw new Error(`the driver of this round died without a report; nothing was dispatched, and the mode keeps ${mode.consent.display} via ${mode.consent.provider}`);
      }
      const failed = !report.ok || !report.receiptOk || !report.outputSchemaOk || report.partial;
      // A confirmed coordinator's failed round closes with its reason recorded: no orders, no other model, no host
      // takeover. The next prepare continues the same coordinator from its last complete round.
      const problem = v2 && Number.isInteger(report.exitCode)
        ? (failed ? `the coordinator round ended with exit ${report.exitCode}${report.error ? `: ${report.error}` : ""}` : coordinatorProblem(report, mode)) : null;
      if (problem) {
        mode.failures = [...(mode.failures ?? []), { report: mode.currentReport, exitCode: report.exitCode, error: problem, at: now() }];
        Object.assign(mode, { currentReport: null, currentCataloguePath: null, lifecycle: mode.lifecycle === "active" ? "active" : "failed" });
        save(modePath, mode);
        throw new Error(`${problem}; nothing was dispatched, and the mode keeps ${mode.consent.display} via ${mode.consent.provider}`);
      }
      if (!Number.isInteger(report.exitCode) || failed)
        throw new Error("coordinator report is not terminal, valid and attributed");
      const session = report.sessionID ?? report.threadId;
      const parentReport = mode.lastCompletedReport, parentSession = mode.external_session;
      if (report.adapter !== mode.adapter || canonical(report.cwd) !== canonical(mode.cwd) || report.requestedModel !== (mode.effectiveModel ?? mode.model))
        throw new Error("report does not match the prepared adapter/model/cwd");
      if (parentReport && report.resumedFrom !== parentReport && !(mode.adapter === "opencode" && report.resume && session === parentSession)) throw new Error("continuation does not link the last completed report");
      if (parentReport && report.resumedFromSession != null && report.resumedFromSession !== parentSession) throw new Error("continuation parent session mismatch");
      const next = { ...mode, external_session: session };
      // The first complete round is the activation: the coordinator is running, on the model now observed.
      if (v2 && mode.lifecycle !== "active") Object.assign(next, { lifecycle: "active", activatedAt: now(), effectiveModel: report.model,
        activation: { report: mode.currentReport, model: report.model, assistantModels: report.assistantModels ?? [], claudeVersion: report.claudeVersion ?? null } });
      let orders;
      try { orders = readAgentOrders(report, next, catalogue); }
      catch (e) {
        if (!Array.isArray(report.answerJson?.requests) || !report.answerJson.requests.length) throw e;
        const rejected = report.answerJson.requests.map((request) => ({ id: request.id, request, report: mode.currentReport,
          state: "recorded", rejected: true, outcome: { status: e.message.startsWith("unknown capability:") ? "unsupported" : "refused", error: e.message } }));
        next.rejectedRequests = [...(mode.rejectedRequests ?? []), ...rejected];
        next.lineage = [...mode.lineage, { report: mode.currentReport, parentReport, parentSession, session, evidence: "report-link" }];
        Object.assign(next, { lastCompletedReport: mode.currentReport, currentReport: null, ordersPath: null, final_answer: "" });
        save(modePath, next);
        throw new Error(`request batch rejected without dispatch: ${e.message}; return results to the coordinator`);
      }
      for (const request of orders.requests) if (Object.hasOwn(mode.requests, request.id)) throw new Error(`request id already dispatched: ${request.id}`);
      const ordersPath = path.join(path.dirname(mode.currentReport), "orders.json"); save(ordersPath, orders);
      next.lineage = [...mode.lineage, { report: mode.currentReport, parentReport, parentSession, session, evidence: "report-link" }];
      next.requests = { ...mode.requests };
      for (const request of orders.requests) put(next.requests, request.id, { request, report: mode.currentReport, state: v2 ? "published" : "dispatched_outcome_unknown" });
      next.publications = { ...mode.publications, [mode.currentReport]: { published: true, ordersPath } };
      Object.assign(next, { published: true, lastCompletedReport: mode.currentReport, currentReport: null, ordersPath, final_answer: orders.final_answer });
      save(modePath, next); output(`${JSON.stringify(orders)}\n`);
    } else if (command === "bind") {
      const id = required(o, "agent-id"), native = input(required(o, "native-json"));
      const order = Object.values(mode.requests).findLast((r) => r.request.agent_id === id && ["delegate", "continue"].includes(r.request.action) && r.state === "dispatched_outcome_unknown");
      if (!order) throw new Error(`no pending worker request: ${id}`);
      const model = required(o, "model"), effort = required(o, "effort");
      const expected = order.request.action === "delegate" ? order.request : mode.agents[id];
      if (model !== (expected.model ?? mode.defaultWorker?.model) || effort !== (expected.effort ?? mode.defaultWorker?.effort)) throw new Error("worker binding model/effort differs from the order");
      const identity = native.value.agent_id ?? native.value.native_agent ?? native.value.id ?? native.value.task_name;
      if (typeof identity !== "string" || !identity.trim()) throw new Error("native result has no observed worker identity");
      if (order.request.action === "continue" && identity !== mode.agents[id].native_agent) throw new Error("continuation must keep the bound native identity");
      put(mode.agents, id, { ...mode.agents[id], native_agent: identity, nativeResult: native.value, nativeJson: native.text, model, effort,
        replyPath: path.resolve(required(o, "reply-path")), scope: expected.scope ?? null });
      order.replyPath = mode.agents[id].replyPath;
      recordOutcome(order, native, mode); save(modePath, mode);
    } else if (command === "record") {
      const id = required(o, "request-id"), record = Object.hasOwn(mode.requests, id) ? mode.requests[id] : null;
      const worker = record && ["delegate", "continue"].includes(record.request.action);
      const awaitingTerminal = worker && record.replyPath && record.state === "recorded" && !Object.hasOwn(record, "replies");
      if (!record || (record.state !== "dispatched_outcome_unknown" && !awaitingTerminal)) throw new Error(`no pending request: ${id}`);
      const outcome = input(required(o, "outcome-json"));
      if ((record.request.action === "collect" || awaitingTerminal) && !terminal(outcome.value))
        throw new Error(`outcome is not terminal: ${id}`);
      if (worker && !record.replyPath && outcome.value?.status === "completed") throw new Error(`completed worker outcome requires a binding: ${id}`);
      recordOutcome(record, outcome, mode);
      save(modePath, mode);
    } else if (command === "results") {
      const results = [...Object.entries(mode.requests).map(([id, r]) => ({ id, ...r })), ...(mode.rejectedRequests ?? [])];
      output(`${JSON.stringify({ AGENT_RESULTS: results.filter((r) => r.request.action !== "invoke"), REQUEST_RESULTS: results.filter((r) => r.request.action === "invoke") })}\n`);
    } else throw new Error(USAGE);
  } finally { release?.(); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => { process.stderr.write(`${e.message}\n`); process.exitCode = 2; });
}
