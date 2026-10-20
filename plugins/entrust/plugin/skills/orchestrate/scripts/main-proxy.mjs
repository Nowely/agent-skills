#!/usr/bin/env node
// One saved mode owns its activation, the user's consent, its Claude session and the outcome of every round.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { adapters } from "./adapters.mjs";
import { canonical } from "./drivers.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, "agent-run.mjs");
const REPLY_SCHEMA = path.join(HERE, "../schemas/proxy-reply.schema.json");
const SCHEMA_VERSION = 3;
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

const PROXY_ADAPTERS = new Set(["claude"]);
// A state an earlier release wrote: its host-executed protocol is gone, so it is refused as it is, never migrated.
const oldState = (modePath) => `${modePath} belongs to a removed host-executed proxy mode (entrust 0.31 or earlier): nothing was launched and the file is left as it is; a new activation starts with propose in a new state directory`;
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
const CONFIRMATION = {
  ru: ({ display, short, provider, cwd }) => [
    `Вы переключаете основную сессию в режим прокси на **${display}** через провайдера **${provider}**.`,
    `Подтверждая переключение, вы делегируете ${display} принятие решений и непосредственное выполнение работы через Claude Code со всеми доступными ему инструментами и настройками.`,
    `Вы также разрешаете передавать этому провайдеру рабочий контекст основной сессии, содержимое рабочих файлов и результаты инструментов для выполнения ваших поручений моделью ${display}.`,
    `Claude Code запускается на машине хоста, рабочий каталог: ${JSON.stringify(cwd)}. Запрашивается bypassPermissions, включена интеграция Chrome; загружаются настроенные MCP, плагины, навыки, hooks и память. Каталог не ограничивает доступ к файлам. Политики Claude, ОС и провайдера остаются в силе; фактический режим разрешений сохраняется в отчёте.`,
    `После подтверждения ${short} сам вызывает инструменты и проверяет результат. Хост передаёт сообщения и ответы; вызовы и результаты доступны в журнале.`,
    `**Переключиться на ${display}?**`,
    "**Подтвердить переключение** / **Отмена**",
  ].join("\n\n"),
  en: ({ display, short, provider, cwd }) => [
    `You are switching the main session to proxy mode on **${display}** through the provider **${provider}**.`,
    `By confirming the switch, you delegate decisions and execution to ${display} through Claude Code with all its available tools and configuration.`,
    `You also allow this provider to receive the main session's working context, the contents of working files and tool results, so that ${display} can carry out your instructions.`,
    `Claude Code runs on the host machine in ${JSON.stringify(cwd)}, requesting bypassPermissions and enabling Chrome integration, loading configured MCP servers, plugins, skills, hooks and memory. The working directory is not a file access boundary. Claude, OS and provider policies remain in force; the actual permission mode is recorded in the report.`,
    `After confirmation, ${short} calls tools and verifies results itself. The host relays messages and answers; tool calls and results remain in the transcript.`,
    `**Switch to ${display}?**`,
    "**Confirm switch** / **Cancel**",
  ].join("\n\n"),
};

const MUTATING = new Set(["propose", "confirm", "cancel", "end", "prepare", "finish"]);
const USAGE = `main-proxy — the main session's proxy mode: one confirmed activation of a full Claude Code session, whose
messages and replies the host relays.

  help | --help
  propose --state dir --adapter claude --model model [--effort effort] --cwd dir --language ru|en [--replaces state]
  confirm --state dir --pending id --source user-message|user-choice --answer-file <file|->
  cancel --state dir --pending id
  prepare --state dir --message-file file [--host-facts file]
  finish --state dir
  status --state dir
  end --state dir

propose checks the route and launch offline and prints the confirmation; confirm records the user's answer.
prepare prints one --run --watch command; RUNNING= repeats that exact command and sends nothing new.
finish closes the round whatever its outcome and prints {"final_answer"} or the reason it has none; it never
replays a message. The next prepare continues the same Claude session when one was observed. status repeats the
saved answer and the transcript path. end refuses while a round runs and names the stop command.
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
const required = (o, k) => { if (!o[k]) throw new Error(`--${k} is required`); return o[k]; };

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
// The route a launch would take now, from the adapter's passive status probe, which calls no model. It runs in the
// directory Claude runs in, whose project settings can route it.
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
// A round runs the proxy profile on the exact model first observed, and resumes the mode's session when it has one.
const headerOf = (mode, resume) => `RIGHTS: full ${mode.cwd}\nPROFILE: proxy\nMODEL: ${mode.effectiveModel ?? mode.model}\n`
  + `${mode.effort ? `EFFORT: ${mode.effort}\n` : ""}OUTPUT_SCHEMA: ${REPLY_SCHEMA}\n${resume ? `RESUME: ${resume}\n` : ""}`;

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
// Claude, so an end, a replacement or a drift between the two sends nothing.
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
// The driver's admission of a proxy round, by its report path: only the mode's current round, under its consent now.
// Admission is also the round's durable start: under the same lock it saves the claim (report, pid, time) before the
// driver opens its transcript or spawns Claude. An end that takes the lock first refuses the round; one that comes
// after finds the round running and refuses itself. A round is claimed once, so a driver run again on the same report
// is refused instead of sending the message twice. Returns the refusal, or null.
export function admitRound(report, pid = process.pid) {
  const state = path.dirname(path.dirname(path.resolve(report))), modePath = path.join(state, "mode.json");
  if (!fs.existsSync(modePath)) return "a proxy round needs its confirmed main-proxy activation: nothing was launched";
  const release = stateLock(state);
  try {
    const mode = json(modePath);
    if (mode.schemaVersion !== SCHEMA_VERSION) return oldState(modePath);
    if (!mode.currentReport || canonical(mode.currentReport) !== canonical(report)) return "this is not the round the mode prepared: nothing was launched";
    if (mode.launch && canonical(mode.launch.report) === canonical(report))
      return `this round was already started at ${mode.launch.at}: its message is not sent twice; finish closes it`;
    admitLaunch(mode, state);
    mode.launch = { report: canonical(report), pid, at: now() };
    save(modePath, mode);
    return null;
  } catch (e) { return e.message; }
  finally { release(); }
}
// The current round's driver, while it runs: no end, replacement or second round goes past it.
function running(mode) {
  const l = mode.launch;
  if (!mode.currentReport || !l || canonical(l.report) !== canonical(mode.currentReport) || !pidAlive(l.pid)) return null;
  return `a round is running (driver pid ${l.pid}, report ${mode.currentReport}): stop it with agent-run.mjs --stop --report-file ${quote(mode.currentReport)}, or wait for its result, then finish`;
}
// The replaced mode of a confirmed switch is ended by this switch, at any later step too, so a crash or a lost
// stdout after the consent was saved finishes the switch without a new question.
function completeReplacement(state, mode) {
  if (mode.consent?.replaces) endMode(mode.consent.replaces, { at: mode.consent.at, endedBy: "replaced", replacedBy: canonical(state), session: mode.consent.hostSession });
}
// The replaced mode, under its own lock: one that already ended stays as it is, a running one of another host
// session is not this switch's to end, and one whose round runs ends after that round.
function endMode(dir, facts) {
  const modePath = path.join(dir, "mode.json"), release = stateLock(dir);
  try {
    const mode = json(modePath);
    if (mode.schemaVersion !== SCHEMA_VERSION) throw new Error(oldState(modePath));
    if (mode.lifecycle === "ended") return;
    if (["pending", "cancelled"].includes(mode.lifecycle)) throw new Error(`the mode at ${dir} is ${mode.lifecycle}: nothing runs there to end`);
    if (!sameSession(mode.consent.hostSession, facts.session)) throw new Error(`the mode at ${dir} was confirmed in another host session; only that session ends it`);
    const busy = running(mode);
    if (busy) throw new Error(`the replaced mode at ${dir} is not ended yet: ${busy}`);
    Object.assign(mode, { lifecycle: "ended", endedAt: facts.at, endedBy: facts.endedBy, replacedBy: facts.replacedBy });
    save(modePath, mode);
  } finally { release(); }
}

async function propose(o, state, modePath) {
  const cwd = fs.realpathSync(required(o, "cwd"));
  if (fs.existsSync(modePath)) throw new Error("mode already exists; a new activation uses a new state directory");
  const adapter = required(o, "adapter"), selected = required(o, "model");
  const model = /^(opus|sonnet|haiku|fable)$/i.test(selected) ? selected.toLowerCase() : selected;
  if (adapter !== familyOf(model)) throw new Error(`model ${model} requires adapter ${familyOf(model)}`);
  if (!PROXY_ADAPTERS.has(adapter))
    throw new Error(`no direct proxy is implemented for adapter ${adapter}: the proxy activates Claude, and nothing was proposed`);
  const language = required(o, "language");
  if (!Object.hasOwn(CHOICES, language)) throw new Error(`--language must be ${Object.keys(CHOICES).join(" or ")}`);
  const session = hostSession();
  const replaces = o.replaces ? canonical(o.replaces) : null;
  if (replaces) {
    if (replaces === canonical(state)) throw new Error("--replaces names this activation's own state");
    const old = json(path.join(replaces, "mode.json"));
    if (old.schemaVersion !== SCHEMA_VERSION) throw new Error(`--replaces names a state of the removed host-executed proxy, which this version never runs: propose without --replaces`);
    if (["pending", "cancelled", "ended"].includes(old.lifecycle)) throw new Error(`--replaces names a mode that is ${old.lifecycle}, not running`);
    if (!sameSession(old.consent.hostSession, session)) throw new Error("--replaces names a mode confirmed in another host session; only that session ends it");
  }
  const route = observedRoute(adapter, cwd);
  const mode = { schemaVersion: SCHEMA_VERSION, lifecycle: "pending", adapter, model, effort: o.effort ?? null, effectiveModel: null, cwd,
    pending: null, consent: null, round: 0, currentReport: null, launch: null, session: null, lastCompletedReport: null,
    final_answer: null, transcriptPath: null, permissionMode: null, permissionDenials: [], failures: [] };
  await preflight(mode, state);
  const names = modelNames(model), confirmation = CONFIRMATION[language]({ ...names, provider: route.provider, cwd });
  mode.pending = { id: crypto.randomUUID(), createdAt: now(), hostSession: session, language, choices: CHOICES[language], display: names.display,
    provider: route.provider, route, confirmation, confirmationSha256: hash(confirmation), replaces };
  save(modePath, mode);
  output(`${JSON.stringify({ pending: mode.pending.id, choices: mode.pending.choices, confirmation })}\n`);
}

// The consent is saved before anything else changes; a repeat of the same confirmation, after a crash or a lost stdout,
// finishes what it began from the saved state and asks nothing.
function confirm(o, state, modePath, mode) {
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

function prepare(o, state, modePath, mode) {
  admitLaunch(mode, state);
  if (mode.currentReport) throw new Error(`round ${mode.round} is not closed: run finish, which closes it whatever its outcome`);
  const message = fs.readFileSync(required(o, "message-file"), "utf8");
  const facts = o["host-facts"] ? fs.readFileSync(o["host-facts"], "utf8") : null;
  const reference = fs.readFileSync(path.join(HERE, "../references/main-proxy.md"), "utf8");
  const instructions = reference.split("## Claude session\n")[1]?.split("\n## ")[0];
  if (!instructions) throw new Error("main-proxy.md has no Claude session section");
  // A resumed session already holds the instructions it was started with.
  const resume = mode.session?.report ?? null;
  const round = mode.round + 1, dir = path.join(state, `round-${round}`), report = path.join(dir, "report.json");
  fs.mkdirSync(dir);
  const prompt = `${headerOf(mode, resume)}TASK:\n${resume ? "" : `## Claude session\n${instructions}\n`}${facts === null ? "" : `HOST_FACTS:\n${facts}\n`}`
    + `USER_MESSAGE (verbatim text encoded as a JSON string):\n${JSON.stringify(message)}`;
  fs.writeFileSync(path.join(dir, "prompt.txt"), prompt, { mode: 0o600 });
  const prepared = spawnSync(process.execPath, [ENTRY, "--new", "--adapter", mode.adapter, "--report-file", report], { input: prompt, encoding: "utf8", env: { ...process.env, ENTRUST_STATE_DIR: state } });
  if (prepared.status !== 0 || /REFUSED=/.test(prepared.stdout)) {
    mode.round = round;
    mode.failures.push({ report, outcome: "not-launched", exitCode: prepared.status, error: `${prepared.stdout}${prepared.stderr}`.trim(), at: now() });
    save(modePath, mode);
    throw new Error(`preparation failed, nothing was sent: ${prepared.stdout}${prepared.stderr}`);
  }
  Object.assign(mode, { round, currentReport: report, final_answer: null }); save(modePath, mode);
  output(`ENTRUST_STATE_DIR=${quote(state)} ${quote(process.execPath)} ${quote(ENTRY)} --run --watch --report-file ${quote(report)}\n`);
}

// What finish knows of a closed round: whether Claude was reached, and whether the session it ran in continues.
const OUTCOMES = {
  "not-launched": "the round was never started: nothing was sent to Claude",
  refused: "the round was refused before Claude started: nothing was sent to Claude",
  unconfirmed: "Claude was started but its session was never confirmed: whether it executed anything is unknown",
  lost: "the driver died without a report: whether Claude executed anything is unknown",
  failed: "the round failed after Claude started: its tools may already have executed",
};
function finish(state, modePath, mode) {
  if (!mode.currentReport) throw new Error(`no round is open: ${mode.lastCompletedReport ? "status repeats the last final_answer" : "nothing was prepared"}`);
  const reportPath = mode.currentReport, transcript = reportPath.replace(/\.json$/, ".transcript.jsonl");
  let report = null;
  try { report = json(reportPath); } catch (e) { if (e.code !== "ENOENT") throw new Error(`the round's report is not readable yet (${e.message}); nothing changed`); }
  const launched = Boolean(mode.launch) && canonical(mode.launch.report) === canonical(reportPath);
  const busy = running(mode);
  if (busy && !Number.isInteger(report?.exitCode)) throw new Error(`${busy}; nothing changed`);
  if (!launched && Number.isInteger(report?.pid) && !Number.isInteger(report.exitCode) && pidAlive(report.pid))
    throw new Error(`the round's driver (pid ${report.pid}) is starting; finish again after it reports; nothing changed`);
  const terminal = Number.isInteger(report?.exitCode);
  // Claude's session is known only from an observed init in this mode's directory, and a continuation keeps its id.
  const session = terminal && report.profile === "proxy" && report.context && typeof report.sessionID === "string"
    && canonical(report.cwd) === canonical(mode.cwd) && (!mode.session || report.sessionID === mode.session.id);
  const observed = [...new Set([report?.model, ...(report?.assistantModels ?? [])])];
  const problem = !terminal ? null
    : !report.ok || !report.receiptOk || !report.outputSchemaOk || report.partial ? `exit ${report.exitCode}${report.error ? `: ${report.error}` : ""}`
    : !session ? "the report names no session of this mode"
    : report.adapter !== mode.adapter || report.requestedModel !== (mode.effectiveModel ?? mode.model) ? "the report does not match the prepared adapter and model"
    : (report.resumedFrom ?? null) !== (mode.session?.report ?? null) ? "the report does not continue the mode's session"
    : observed.some((m) => (mode.effectiveModel ? m !== mode.effectiveModel : !serves(m, mode.model))) ? `Claude answered as ${observed.filter(Boolean).join(", ") || "no observed model"}, not the confirmed ${mode.effectiveModel ?? mode.consent.display}`
    : typeof report.answerJson?.final_answer !== "string" || !report.answerJson.final_answer.trim() ? "the reply has no final_answer" : null;
  Object.assign(mode, { currentReport: null, transcriptPath: fs.existsSync(transcript) ? transcript : null,
    permissionMode: report?.context?.permissionMode ?? null, permissionDenials: report?.permissionDenials ?? [] });
  if (session) mode.session = { report: reportPath, id: report.sessionID };
  if (terminal && !problem) {
    if (mode.lifecycle === "confirmed") Object.assign(mode, { lifecycle: "active", activatedAt: now(), effectiveModel: report.model,
      activation: { report: reportPath, model: report.model, assistantModels: report.assistantModels ?? [], claudeVersion: report.claudeVersion ?? null } });
    Object.assign(mode, { lastCompletedReport: reportPath, final_answer: report.answerJson.final_answer });
    save(modePath, mode);
    output(`${JSON.stringify({ final_answer: mode.final_answer })}\n`);
    return;
  }
  const outcome = !report ? "not-launched" : !terminal ? (launched ? "lost" : "not-launched")
    : !report.spawnedAt ? "refused" : !report.context ? "unconfirmed" : "failed";
  mode.failures.push({ report: reportPath, outcome, exitCode: report?.exitCode ?? null, error: problem, transcriptPath: mode.transcriptPath, at: now() });
  save(modePath, mode);
  throw new Error(`${OUTCOMES[outcome]}${problem ? ` (${problem})` : ""}. Nothing is replayed; the next user message `
    + `${mode.session ? `continues Claude session ${mode.session.id}` : "starts a new Claude session"}.${mode.transcriptPath ? ` Transcript: ${mode.transcriptPath}` : ""}`);
}

function status(mode) {
  const transcript = mode.currentReport?.replace(/\.json$/, ".transcript.jsonl");
  return { lifecycle: mode.lifecycle,
    pending: mode.lifecycle === "pending" ? { id: mode.pending.id, choices: mode.pending.choices, confirmation: mode.pending.confirmation } : null,
    consent: mode.consent, effectiveModel: mode.effectiveModel, permissionMode: mode.permissionMode, permissionDenials: mode.permissionDenials,
    round: mode.round, currentReport: mode.currentReport, launch: mode.launch, session: mode.session, lastCompletedReport: mode.lastCompletedReport,
    final_answer: mode.final_answer, transcriptPath: transcript ? (fs.existsSync(transcript) ? transcript : null) : mode.transcriptPath,
    failures: mode.failures, endedAt: mode.endedAt ?? null };
}

export async function main(argv = process.argv.slice(2)) {
  const command = argv.shift(), o = {};
  if (["help", "--help"].includes(command) || argv.includes("--help")) { output(USAGE); return; }
  while (argv.length) {
    const flag = argv.shift(), value = argv.shift();
    if (!flag.startsWith("--") || value === undefined || Object.hasOwn(o, flag.slice(2))) throw new Error(`invalid argument: ${flag}`);
    o[flag.slice(2)] = value;
  }
  if (!MUTATING.has(command) && command !== "status") throw new Error(USAGE);
  const state = path.resolve(required(o, "state")), modePath = path.join(state, "mode.json");
  if (command === "propose") { stateLocation(fs.realpathSync(required(o, "cwd")), state); fs.mkdirSync(state, { recursive: true }); }
  const release = MUTATING.has(command) ? stateLock(state) : null;
  try {
    if (command === "propose") return await propose(o, state, modePath);
    const mode = json(modePath);
    if (mode.schemaVersion !== SCHEMA_VERSION) throw new Error(oldState(modePath));
    if (command === "status") return output(`${JSON.stringify(status(mode))}\n`);
    if (command === "confirm") return confirm(o, state, modePath, mode);
    if (command === "prepare") return prepare(o, state, modePath, mode);
    if (command === "finish") return finish(state, modePath, mode);
    if (command === "cancel") {
      if (mode.lifecycle !== "pending") throw new Error(`nothing to cancel: this mode is ${mode.lifecycle}`);
      if (required(o, "pending") !== mode.pending.id) throw new Error("--pending names another activation than this state's");
      Object.assign(mode, { lifecycle: "cancelled", cancelledAt: now() }); save(modePath, mode);
      return;
    }
    // end: this mode's own lock is held, so its record is changed here; a confirmed switch the crash interrupted is
    // finished first, so ending its new mode leaves no replaced one running.
    if (mode.lifecycle === "ended") throw new Error(`already ended at ${mode.endedAt}`);
    if (["pending", "cancelled"].includes(mode.lifecycle)) throw new Error(`nothing to end: this activation is ${mode.lifecycle}`);
    if (!sameSession(hostSession(), mode.consent.hostSession)) throw new Error("the consent was given in another host session; only that session ends this mode");
    completeReplacement(state, mode);
    const busy = running(mode);
    if (busy) throw new Error(`${busy}; the mode was not ended`);
    Object.assign(mode, { lifecycle: "ended", endedAt: now(), endedBy: "user" }); save(modePath, mode);
  } finally { release?.(); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => { process.stderr.write(`${e.message}\n`); process.exitCode = 2; });
}
