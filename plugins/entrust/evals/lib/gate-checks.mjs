// The live orchestrate gate's reading of a session, as pure functions over its stream and the files it left.
//
// orchestrate-live.test.mjs spends real sessions and cannot run in CI; what it concludes from a session
// is code, and code can be checked offline. Everything here takes a parsed stream-json transcript (the
// shape measured on Claude Code 2.1.2xx: tool_use blocks in assistant messages, tool_result blocks in
// user messages, a subagent's own traffic carrying its parent_tool_use_id) and returns the problems it
// found, one sentence each, or a measurement. gate-checks.test.mjs feeds each function a fixture stream
// built in the same shape, one that should pass and one that should not.
//
// A heuristic over free text says so where it is one: a plan can satisfy every line here and still be a
// bad plan, and the release reader judges the artifacts the gate saves.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { lintDraft } from "../../plugin/skills/orchestrate/scripts/lint-draft.mjs";
// The launcher's own matcher and classifier, not copies: a continuation it admits, or a role it counts as a
// worker, reads the same here.
import { classifyRole, planRowOf } from "../../plugin/skills/codex/scripts/agent-run.mjs";

// --------------------------------------------------------------- the stream

const blockText = (c) => (typeof c === "string" ? c
  : Array.isArray(c) ? c.map((b) => (typeof b === "string" ? b : b?.type === "text" ? b.text ?? "" : "")).join("\n") : "");

export function parseStream(text) {
  const msgs = [];
  for (const line of String(text).split("\n")) {
    if (!line.trim()) continue;
    // A killed run ends mid-line; a half-written object is not a parse failure worth aborting a case for.
    try { msgs.push(JSON.parse(line)); } catch {}
  }
  const init = msgs.find((m) => m.type === "system" && m.subtype === "init") ?? null;
  const result = [...msgs].reverse().find((m) => m.type === "result") ?? null;
  const events = [], toolUses = [], texts = [];
  const results = new Map();
  let seq = 0;
  for (const m of msgs) {
    const parent = m.parent_tool_use_id ?? null;
    const content = m.message?.content;
    if (m.type === "assistant") {
      for (const b of content ?? []) {
        if (b?.type === "tool_use") {
          const u = { seq: seq++, kind: "tool_use", id: b.id ?? null, name: b.name, input: b.input ?? {}, parent };
          toolUses.push(u);
          events.push(u);
        } else if (b?.type === "text" && typeof b.text === "string") {
          // The plan is what the coordinator SAID across its root-level messages, not the result line alone:
          // measured, one run put the plan in one message and a closing paragraph in the next.
          events.push({ seq: seq++, kind: "text", text: b.text, parent });
          if (parent === null) texts.push(b.text);
        }
      }
    } else if (m.type === "user" && Array.isArray(content)) {
      for (const b of content) {
        if (b?.type !== "tool_result") continue;
        const r = { seq: seq++, kind: "tool_result", id: b.tool_use_id ?? null, text: blockText(b.content), isError: b.is_error === true, parent };
        events.push(r);
        if (r.id) results.set(r.id, r);
      }
    }
  }
  return {
    msgs, init, result, events, results, toolUses,
    resultText: typeof result?.result === "string" ? result.result : "",
    planText: texts.join("\n\n"),
  };
}

// The subagent's own report out of the harness's frame: the frame's intro, then every line of the report
// indented by two spaces, then the harness's own unindented lines (agentId, usage). Measured on 2.1.280;
// a result with no frame is returned whole.
export function handBack(text) {
  const at = text.indexOf("The report follows:\n");
  if (at < 0) return text;
  const out = [];
  for (const line of text.slice(at + "The report follows:\n".length).split("\n")) {
    if (line !== "" && !line.startsWith("  ")) break;
    out.push(line.slice(2));
  }
  while (out.length && out[out.length - 1].trim() === "") out.pop();
  return out.join("\n");
}

// --------------------------------------------------------------- what a call is

export const AGENT_TOOLS = new Set(["Task", "Agent"]);
export const CODEX_SLUG = /\bgpt-\d+(?:\.\d+)*-(astra|sol|terra)\b/i;
export const isTierModel = (m) => typeof m === "string" && CODEX_SLUG.exec(m)?.[0] === m;
export const SIBLING_SKILLS = ["entrust:codex", "codex"];
const MODELS = "Fable|Opus|Sonnet|Haiku|Astra|Sol|Terra|Luna";
export const CHECK_COMMAND = /\bnode --test\b|\bnpm (?:run )?test\b|\bpnpm test\b|\byarn test\b|\bpytest\b|\btsc\b|\beslint\b|\bvitest\b|\bjest\b|\bcargo test\b|\bgo test\b/;

export const codexCommand = (u) => (AGENT_TOOLS.has(u.name) ? String(u.input.prompt ?? "") : "");
export const bashCommand = (u) => (u.name === "Bash" ? String(u.input.command ?? "") : "");
// A Codex agent is one Agent call: of the shipped wrapper's type, or whose message carries the launcher's
// command with --run and --report-file. The driver with --prompt-file, the shape before the wrapper, still
// counts, so an older transcript reads the same.
export const isCodexCall = (u) => {
  if (!AGENT_TOOLS.has(u.name)) return false;
  const c = codexCommand(u);
  return /^(entrust:)?codex-agent$/.test(String(u.input?.subagent_type ?? ""))
    || (/agent-run\.mjs/.test(c) && /--run\b/.test(c) && /--report-file/.test(c))
    || (/driver\.mjs/.test(c) && /--prompt-file/.test(c));
};
export const isLauncher = (u, mode) => /agent-run\.mjs/.test(bashCommand(u)) && new RegExp(`--${mode}\\b`).test(bashCommand(u));
export const codexCalls = (toolUses) => toolUses.filter(isCodexCall);
export const agentCalls = (toolUses) => toolUses.filter((u) => AGENT_TOOLS.has(u.name));
export const workflowCalls = (toolUses) => toolUses.filter((u) => u.name === "Workflow");
export const skillCalls = (toolUses) => toolUses.filter((u) => u.name === "Skill")
  .map((u) => String(u.input.skill ?? u.input.name ?? JSON.stringify(u.input)));
const root = (s) => s.events.filter((e) => e.parent === null);
const rootUses = (s) => root(s).filter((e) => e.kind === "tool_use");

export const heredoc = (cmd) => /<<-?\s*'?"?(\w+)'?"?[^\n]*\n([\s\S]*?)\n\s*\1\s*$/m.exec(cmd)?.[2] ?? null;
export const reportPathOf = (text) => /--report-file\s+"?([^"\s]+)"?/.exec(text)?.[1] ?? null;
const idOfReport = (p) => (p ? path.basename(path.dirname(p)) : null);
export const describedAgent = (u) => {
  const m = new RegExp(`^\\s*(?:Codex\\s+|Claude\\s+)?(${MODELS})\\s+([A-Za-z][\\w-]*)\\s*:`, "i").exec(String(u.input?.description ?? ""));
  return m ? { model: m[1], id: m[2] } : null;
};

// Every brief the session wrote, in order: a Claude agent's is its Agent prompt; a Codex agent's is the
// heredoc of its --new call, paired with the wrapper call that ran it by the report path both name.
export function briefs(s) {
  const out = [];
  const uses = rootUses(s);
  for (const u of uses) {
    if (u.name === "Bash" && isLauncher(u, "new")) {
      const report = reportPathOf(bashCommand(u));
      const run = uses.find((w) => isCodexCall(w) && reportPathOf(codexCommand(w)) === report && w.seq > u.seq) ?? null;
      const body = heredoc(bashCommand(u)) ?? "";
      out.push({ side: "codex", seq: u.seq, text: body, report, id: idOfReport(report), model: /^MODEL:\s*(\S+)/m.exec(body)?.[1] ?? null,
        call: run, done: run ? s.results.get(run.id)?.seq ?? null : null, description: run?.input?.description ?? null });
    } else if (AGENT_TOOLS.has(u.name) && !isCodexCall(u)) {
      const d = describedAgent(u);
      out.push({ side: "claude", seq: u.seq, text: String(u.input.prompt ?? ""), report: null, id: d?.id ?? null, model: u.input.model ?? null,
        call: u, done: s.results.get(u.id)?.seq ?? null, description: u.input.description ?? null });
    }
  }
  return out;
}

// --------------------------------------------------------------- five fields

// A Claude return, the harness frame removed, read into the five fields; `none` is an empty list.
export function parseFiveFields(text) {
  const body = handBack(text);
  const problems = [];
  const labels = ["status", "result", "evidence", "artifacts", "open"];
  const at = [];
  body.split("\n").forEach((l, i) => {
    const m = /^(status|result|evidence|artifacts|open):\s?(.*)$/.exec(l);
    if (m) at.push({ label: m[1], i, rest: m[2] });
  });
  const lines = body.split("\n");
  const fields = {};
  for (const [k, a] of at.entries()) {
    if (a.label in fields) { problems.push(`${a.label} appears twice`); continue; }
    const end = at[k + 1]?.i ?? lines.length;
    const more = lines.slice(a.i + 1, end);
    if (a.label === "status" || a.label === "result") {
      fields[a.label] = [a.rest, ...more].join("\n").trim();
    } else {
      const items = [a.rest, ...more].map((l) => l.trim()).filter(Boolean);
      fields[a.label] = items.length === 1 && /^none\.?$/i.test(items[0]) ? []
        : items.map((l) => l.replace(/^[-*]\s+/, ""));
    }
  }
  if (at.length && lines.slice(0, at[0].i).some((l) => l.trim())) problems.push("text before the first field");
  for (const l of labels) if (!(l in fields)) problems.push(`no ${l}:`);
  if (fields.status !== undefined) fields.status = fields.status.split(/\s+/)[0];
  return { fields, problems };
}

// The subset of JSON Schema the five-field file uses, checked the way the driver's strict mode reads it.
export function validate(schema, value, where = "$") {
  const errs = [];
  const type = (v) => (Array.isArray(v) ? "array" : v === null ? "null" : typeof v);
  if (schema.type && type(value) !== schema.type) return [`${where} is ${type(value)}, not ${schema.type}`];
  if (schema.enum && !schema.enum.includes(value)) errs.push(`${where} is ${JSON.stringify(value)}, not one of ${schema.enum.join("|")}`);
  if (typeof value === "string" && schema.maxLength !== undefined && value.length > schema.maxLength) errs.push(`${where} is ${value.length} characters, over ${schema.maxLength}`);
  if (Array.isArray(value)) {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errs.push(`${where} has ${value.length} items, over ${schema.maxItems}`);
    if (schema.items) value.forEach((v, i) => errs.push(...validate(schema.items, v, `${where}[${i}]`)));
  }
  if (type(value) === "object") {
    for (const k of schema.required ?? []) if (!(k in value)) errs.push(`${where}.${k} is missing`);
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties?.[k]) errs.push(...validate(schema.properties[k], v, `${where}.${k}`));
      else if (schema.additionalProperties === false) errs.push(`${where}.${k} is not in the schema`);
    }
  }
  return errs;
}

// --------------------------------------------------------------- the plan and the card

// plan.txt as the launcher's --plan writes it: `id | model | role | writes | tokens`, a header line first.
export function planRecord(text) {
  return String(text ?? "").split("\n").map((l) => l.trim()).filter((l) => l && l !== "id | model | role | writes | tokens")
    .map((l) => l.split("|").map((c) => c.trim())).filter((c) => c.length === 5)
    .map(([id, model, role, writes, tokens]) => ({ id, model, role, writes, tokens: Number(tokens) }));
}

const label = (alts) => new RegExp(`^(?:${alts})(?!\\p{L})`, "iu");
const CARD = {
  work: label("work|what will be done|работа|что будет сделано"),
  who: label("who|кто"),
  writes: label("writes?|writing|что пишет|пишет|запись|права"),
  cost: label("costs?|стоимость|цена|токены"),
  checks: label("checks?|verification|проверки|проверка"),
};
const NUMBER = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  один: 1, одна: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6 };
const countNear = (text, re) => {
  const m = new RegExp(`(?<![\\p{L}\\d])(\\d+|${Object.keys(NUMBER).join("|")})\\s+(?:${re.source})`, "iu").exec(text);
  return m ? Number(NUMBER[m[1].toLowerCase()] ?? m[1]) : null;
};

// The card's five rows by the labels the page names, and, against the registered plan, every agent on it
// and the workers and the checking agents counted as the plan counts them. Heuristic over free text.
export function cardProblems(text, rows = null) {
  const problems = [];
  const starts = String(text).split("\n").map((l) => l.replace(/^[\s>|#*_\-\d.]+/, "").replace(/^\*\*/, "").trim());
  const missing = Object.entries(CARD).filter(([, re]) => !starts.some((l) => re.test(l))).map(([k]) => k);
  if (missing.length) problems.push(`the card has no ${missing.join(", ")} row`);
  if (rows) {
    const absent = rows.filter((r) => !new RegExp(`(?<![A-Za-z0-9])${r.id}(?![A-Za-z0-9])`, "i").test(text)).map((r) => r.id);
    if (absent.length) problems.push(`the card does not show ${absent.join(", ")}, registered in the plan`);
    const workers = rows.filter((r) => classifyRole(r.role) === "worker").length;
    const checking = rows.filter((r) => classifyRole(r.role) === "checking").length;
    const saidWorkers = countNear(text, /workers?|implementers?|writers?|исполнител\p{L}*/u);
    const saidChecking = countNear(text, /checking agents?|checkers?|verifiers?|critics?|reviewers?|assurance|проверяющ\p{L}*/u);
    // A plan whose coordinator writes registers no worker, and its card may count the coordinator as one.
    if (saidWorkers !== null && workers > 0 && saidWorkers !== workers) problems.push(`the card counts ${saidWorkers} worker(s), the plan registers ${workers}`);
    if (saidChecking !== null && saidChecking !== checking) problems.push(`the card counts ${saidChecking} checking agent(s), the plan registers ${checking}`);
  }
  return problems;
}

// The sibling page is loaded before the first thing that needs it, and never by a plan that has no Codex
// agent: that is the whole of the deferred load (#15 F18).
// A turn after the plan turn passes loadedBefore: the page stays loaded for the session.
export function codexLoadProblems(s, { codexPlanned, loadedBefore = false }) {
  const uses = rootUses(s);
  const load = uses.find((u) => u.name === "Skill" && SIBLING_SKILLS.includes(String(u.input.skill ?? u.input.name ?? "")));
  const first = uses.find((u) => isCodexCall(u) || isLauncher(u, "new") || isLauncher(u, "plan"));
  const problems = [];
  if (!codexPlanned && (load || loadedBefore)) problems.push("a plan with no Codex agent loaded the codex page");
  if (first && !loadedBefore && (!load || load.seq > first.seq)) problems.push(`the codex page was ${load ? "loaded after" : "never loaded before"} the launcher's first call`);
  return problems;
}
export const loadedCodex = (s) => skillCalls(rootUses(s)).some((n) => SIBLING_SKILLS.includes(n));

// The registered plan and the launches, reconciled: every launch is on the plan by id and model, none was
// added and launched in the same turn, and a registered agent that never ran is named in the answer.
export function manifestProblems({ planTurn, runTurn, rows, finalText = "" }) {
  const problems = [];
  if (!rows?.length) return ["no plan was registered with the launcher"];
  if (planTurn) {
    const reg = rootUses(planTurn).find((u) => isLauncher(u, "plan") && !/--amend\b/.test(bashCommand(u)));
    if (!reg) problems.push("the plan turn made no --plan call");
  }
  // The row a name belongs to, a continuation (<id>-<n>) included, by the launcher's own rule.
  const rowOf = (name) => planRowOf(name, rows)?.row ?? null;
  const launched = new Set();
  const amended = new Map();
  for (const u of rootUses(runTurn)) {
    if (isLauncher(u, "plan") && /--amend\b/.test(bashCommand(u)))
      for (const r of planRecord(heredoc(bashCommand(u)) ?? "")) amended.set(r.id.toLowerCase(), r.id);
    if (isLauncher(u, "new")) {
      const id = idOfReport(reportPathOf(bashCommand(u)));
      const row = id ? rowOf(id) : null;
      if (id && !row) problems.push(`--new for ${id}, which the plan does not list`);
      if (row) launched.add(row.id.toLowerCase());
    }
    if (AGENT_TOOLS.has(u.name)) {
      const d = describedAgent(u);
      if (!d) { problems.push(`an Agent call's description names no "<Model> <id>": ${JSON.stringify(u.input.description ?? null)}`); continue; }
      const row = rowOf(d.id);
      if (!row) problems.push(`${d.model} ${d.id} ran and is not in the plan`);
      else {
        if (row.model.toLowerCase() !== d.model.toLowerCase()) problems.push(`${d.id} ran as ${d.model}, the plan says ${row.model}`);
        launched.add(row.id.toLowerCase());
      }
    }
  }
  for (const [id, shown] of amended) if (launched.has(id)) problems.push(`${shown} was added to the plan and launched in the same turn, with no word between`);
  for (const r of rows) if (!launched.has(r.id.toLowerCase()) && !new RegExp(`(?<![A-Za-z0-9])${r.id}(?![A-Za-z0-9])`, "i").test(finalText))
    problems.push(`${r.id} is registered, never ran, and the answer does not name it as dropped`);
  return problems;
}

// Every write an agent was seen to make, against the writes its row allows: `nothing`, `live tree` (under
// the working directory), `write <dir>` (under that directory), `worktree` (its own tree, under the
// repository's .claude directory). A write under the temporary directory is every agent's. A Claude
// agent's writes are the Write, Edit and NotebookEdit calls under its Agent call, however deep; a Codex
// agent's are its report's filesTouched. A write made through a shell command is not visible here.
export function writesProblems({ s, rows = [], reports = [], cwd, tmp = [] }) {
  const problems = [];
  if (!rows.length) return problems;
  // The real path of the longest part that exists, the rest joined on: a file an agent wrote may be gone.
  const real = (p) => {
    let head = path.resolve(p), tail = [];
    for (;;) {
      try { return path.join(fs.realpathSync(head), ...tail); } catch {}
      const up = path.dirname(head);
      if (up === head) return path.resolve(p);
      tail.unshift(path.basename(head));
      head = up;
    }
  };
  const under = (p, dir) => { const a = real(p), b = real(dir); return a === b || a.startsWith(`${b}${path.sep}`); };
  const temps = tmp.filter(Boolean);
  const allowed = (row, file) => {
    // The temporary directory is everyone's, except the working tree when the tree itself lies under it.
    if (!under(file, cwd) && temps.some((t) => under(file, t))) return true;
    const w = row.writes;
    if (w === "nothing") return false;
    if (w === "live tree") return under(file, cwd);
    if (w === "worktree") return under(file, path.join(cwd, ".claude"));
    const dir = /^write\s+(\S.*)$/.exec(w)?.[1];
    return dir ? under(file, dir) : false;
  };
  const byId = new Map(s.toolUses.filter((u) => u.id).map((u) => [u.id, u]));
  const top = (u) => { let x = u; while (x?.parent && byId.get(x.parent)) x = byId.get(x.parent); return x; };
  const seen = [];
  for (const u of s.toolUses.filter((x) => x.parent && ["Write", "Edit", "NotebookEdit", "MultiEdit"].includes(x.name))) {
    const t = top(u);
    const d = t && AGENT_TOOLS.has(t.name) ? describedAgent(t) : null;
    const file = String(u.input.file_path ?? u.input.notebook_path ?? "");
    if (d && file) seen.push({ id: d.id, file: path.isAbsolute(file) ? file : path.join(cwd, file) });
  }
  for (const r of reports)
    for (const f of r.report?.filesTouched ?? []) seen.push({ id: r.id, file: path.isAbsolute(f) ? f : path.join(cwd, f) });
  for (const w of seen) {
    const row = planRowOf(w.id, rows)?.row;
    if (!row) continue;
    if (!allowed(row, w.file)) problems.push(`${w.id} wrote ${path.relative(cwd, w.file) || w.file}, outside its row's writes (${row.writes})`);
  }
  return problems;
}

// --------------------------------------------------------------- the split critic

// No worker brief exists before the split critic returns; each names the critic's file; the shared
// interface has one owner among the briefs (#16's acceptance check, T5's bypass). The owner test reads a
// brief's lines for the shared path beside a verb of ownership, which is a heuristic.
const escapeRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const FILE_RE = /(?<![\w/.-])((?:[\w.-]+\/)*[\w-]+\.(?:mjs|cjs|js|jsx|ts|tsx|py|rb|go|rs|java|c|h|sh|md|json|ya?ml|toml|txt|css|html))(?![\w/])/g;
// A line of a brief that names the path beside a verb of ownership, and does not negate it.
const ownsPath = (text, file) => text.split("\n").some((l) => l.includes(file)
  && /\b(own|owns|owner|write|writes|edit|edits|change|changes|modify|rename|update)\b|владе|пиш|измен/i.test(l)
  && !/\b(do not|don't|never|not)\b[^.]*\b(own|write|edit|change|modify|rename|update)|не (?:пиш|измен|трог)/i.test(l));

// The corrected split as the critic wrote it: which worker id owns which path, and which paths are the
// interfaces units share. A line naming paths and one worker id gives it those paths; a line naming several
// gives them to the id after "owner" or "owned by"; a line that says interface or shared marks its paths as
// interfaces. Heuristic over free text: the page fixes no format for the file.
export function parseSplit(text, ids) {
  const owners = new Map();
  const interfaces = new Set();
  for (const line of String(text).split("\n")) {
    const files = [...line.matchAll(FILE_RE)].map((m) => m[1]);
    if (!files.length) continue;
    const named = ids.filter((id) => new RegExp(`(?<![A-Za-z0-9])${escapeRe(id)}(?![A-Za-z0-9-])`, "i").test(line));
    let owner = named.length === 1 ? named[0] : null;
    if (!owner && named.length > 1) {
      const m = new RegExp(`(?:owner|owned by|владелец)[:\\s]+(${named.map(escapeRe).join("|")})`, "i").exec(line);
      owner = m ? named.find((id) => id.toLowerCase() === m[1].toLowerCase()) : null;
    }
    const iface = /interface|shared|интерфейс|общ/i.test(line);
    for (const f of files) {
      if (iface) interfaces.add(f);
      if (owner) owners.set(f, new Set([...(owners.get(f) ?? []), owner]));
    }
  }
  return { owners, interfaces };
}

// No worker brief exists before the split critic returns; each names the critic's file; the corrected split,
// read from that file, gives every interface one owner, and each brief owns what the split gives it and
// nothing it gives another (#16's acceptance check, T5's bypass).
export function splitAdmissionProblems(s, { units, shared, reportOf = null, read = (p) => fs.readFileSync(p) }) {
  const bs = briefs(s);
  const problems = [];
  const isTop = (b) => (b.side === "claude" ? b.model === "fable" : /^astra$/i.test(b.model ?? ""));
  const critic = bs.find((b) => isTop(b) && /\bsplit\b|decomposition|разбиени|декомпоз/i.test(b.text));
  if (!critic) return ["no top-row agent was given the split to critique"];
  if (critic.done === null) problems.push("the split critic never returned");
  const workers = bs.filter((b) => b !== critic && !isTop(b) && [...units, shared].some((u) => b.text.includes(u))
    && !/completeness critic/i.test(b.text));
  if (!workers.length) problems.push("no worker brief names a unit of the task");
  const early = workers.filter((w) => critic.done === null || w.seq < critic.done);
  if (early.length) problems.push(`${early.length} worker brief(s) written before the split critic returned`);
  // A Codex critic's hand-back carries the answer's first line only when it is long; its report has the rest.
  const report = critic.side === "codex" && reportOf ? reportOf(critic.report) : null;
  const criticText = [s.results.get(critic.call?.id)?.text ?? "", JSON.stringify(report?.answerJson ?? report?.answer ?? "")].join("\n");
  const file = absolutePaths(criticText).find((p) => /\.(?:md|txt|json)$/.test(p)) ?? null;
  if (!file) problems.push("the split critic's return names no file for the corrected split");
  else {
    const without = workers.filter((w) => !w.text.includes(file));
    if (without.length) problems.push(`${without.length} worker brief(s) do not name the corrected split ${file}`);
    let text = null;
    try { text = read(file).toString("utf8"); } catch { problems.push(`the corrected split ${file} cannot be read`); }
    if (text !== null) {
      const ids = workers.map((w) => w.id).filter(Boolean);
      const { owners, interfaces } = parseSplit(text, ids);
      if (shared && !interfaces.has(shared)) problems.push(`the corrected split omits the shared interface ${shared}`);
      for (const f of interfaces) {
        const o = [...(owners.get(f) ?? [])];
        if (o.length !== 1) problems.push(`the corrected split gives the interface ${f} ${o.length} owners`);
      }
      for (const [f, o] of owners)
        for (const id of o) {
          const w = workers.find((x) => x.id?.toLowerCase() === id.toLowerCase());
          if (w && !ownsPath(w.text, f)) problems.push(`the corrected split gives ${f} to ${id}, whose brief does not own it`);
        }
      for (const w of workers)
        for (const [f, o] of owners)
          if (![...o].some((id) => id.toLowerCase() === w.id?.toLowerCase()) && ownsPath(w.text, f))
            problems.push(`${w.id}'s brief owns ${f}, which the corrected split gives to ${[...o].join(", ")}`);
    }
  }
  const owners = workers.filter((w) => ownsPath(w.text, shared));
  if (owners.length !== 1) problems.push(`${owners.length} worker briefs own ${shared}, and it has one owner`);
  return problems;
}

// --------------------------------------------------------------- the answer

// One paragraph per phase, not per return: the root texts after "go", counted. And none of them turns an
// unverified return into a success claim.
export function phaseProblems(s, { max, receipts = [] }) {
  const texts = root(s).filter((e) => e.kind === "text");
  const problems = [];
  if (texts.length > max) problems.push(`${texts.length} paragraphs of the coordinator's own after "go", more than ${max}`);
  for (const t of texts) {
    const hits = lintDraft(t.text, { receipts, maxWords: Infinity }).hits.filter((h) => h.rule === "unsupported-success");
    for (const h of hits) problems.push(`an update claims success with no receipt: ${JSON.stringify(h.text)}`);
  }
  return problems;
}

const collapse = (t) => String(t).replace(/\s+/g, " ").trim();
// Absolute paths under the roots a run writes to, a sentence's closing punctuation left off.
export const absolutePaths = (text) => [...String(text).matchAll(/(\/(?:private\/)?(?:var|tmp|Users|home)\/[^\s"'`)\]]+)/g)]
  .map((m) => m[1].replace(/[.,;:!?]+$/, ""));
export const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
export const shasumLines = (text) => String(text).split("\n").map((l) => /^([0-9a-f]{64})\s+\*?(.+)$/.exec(l.trim())).filter(Boolean)
  .map(([, digest, file]) => ({ digest, file }));

// The critic read a frozen draft: its prompt names a `shasum -a 256` manifest, its verdict returns the
// manifest's digest, every file in the manifest still has the digest it had, and what went out is one of
// those files (#15 F4: three answers changed after their critic read them).
export function criticDigestProblems(s, { finalText, read = (p) => fs.readFileSync(p), reportOf = null }) {
  const bs = briefs(s);
  const critics = bs.filter((b) => /completeness critic/i.test(`${b.description ?? ""}\n${b.text}`));
  if (!critics.length) return ["no completeness critic ran"];
  const c = critics[critics.length - 1];
  const problems = [];
  const paths = absolutePaths(c.text);
  let manifest = null, manifestPath = null;
  for (const p of paths) {
    let body = null;
    try { body = read(p); } catch { continue; }
    if (shasumLines(body.toString("utf8")).length) { manifest = body; manifestPath = p; break; }
  }
  if (!manifest) return [`the critic's brief names no shasum manifest (paths: ${paths.join(", ") || "none"})`];
  let returned = "";
  if (c.side === "claude") returned = parseFiveFields(s.results.get(c.call.id)?.text ?? "").fields.evidence?.[0] ?? "";
  else if (reportOf) returned = String(reportOf(c.report)?.answerJson?.evidence?.[0] ?? "");
  const digest = /\b[0-9a-f]{64}\b/.exec(returned)?.[0] ?? null;
  if (!digest) problems.push("the critic's first evidence line carries no sha256");
  else if (digest !== sha256(manifest)) problems.push(`the critic returned ${digest.slice(0, 12)}…, the manifest ${manifestPath} is ${sha256(manifest).slice(0, 12)}…`);
  const entries = shasumLines(manifest.toString("utf8"));
  let wentOut = false;
  for (const e of entries) {
    const file = path.isAbsolute(e.file) ? e.file : path.join(path.dirname(manifestPath), e.file);
    let body = null;
    try { body = read(file); } catch { problems.push(`${e.file} in the manifest is gone`); continue; }
    if (sha256(body) !== e.digest) problems.push(`${e.file} changed after the critic read it`);
    if (collapse(body.toString("utf8")) === collapse(finalText)) wentOut = true;
  }
  if (!wentOut) problems.push("the answer that went out is not a file the critic's manifest froze");
  return problems;
}

// The coordinator linted the draft before the critic read it, and the last lint before the critic passed.
export function lintCallProblems(s) {
  const uses = rootUses(s);
  const critic = briefs(s).filter((b) => /completeness critic/i.test(`${b.description ?? ""}\n${b.text}`)).pop();
  const lints = uses.filter((u) => /lint-draft\.mjs/.test(bashCommand(u)) && (!critic || u.seq < critic.seq));
  if (!lints.length) return ["the draft was never linted before the critic read it"];
  const last = s.results.get(lints[lints.length - 1].id)?.text ?? "";
  return /(^|\n)HITS=0\s*$/.test(last.trim()) ? [] : [`the last lint before the critic did not pass: ${JSON.stringify(last.trim().split("\n").pop())}`];
}

// "<Model> <id>" for every agent that ran: a Claude agent by its tag and its description's id, a Codex
// agent by its description.
export function agentsThatRan(s) {
  const out = new Set();
  for (const u of rootUses(s).filter((x) => AGENT_TOOLS.has(x.name))) {
    const d = describedAgent(u);
    if (!d) continue;
    out.add(isCodexCall(u) ? `Codex ${d.model[0].toUpperCase()}${d.model.slice(1).toLowerCase()} ${d.id}` : `${d.model[0].toUpperCase()}${d.model.slice(1).toLowerCase()} ${d.id}`);
  }
  return [...out];
}

// Each Codex command that exited 0 and each backquoted command in a Claude agent's evidence is a check the
// answer may cite; the runner's ledger adds the coordinator's own.
export function receiptsFrom(s, { reports = [], ledger = [] } = {}) {
  const out = new Set(ledger);
  for (const r of reports)
    for (const c of r?.commands ?? []) {
      if (c?.exitCode !== 0) continue;
      const cmd = String(c.command ?? "");
      const inner = (/^\S*sh\s+-l?c\s+(['"])([\s\S]*)\1$/.exec(cmd)?.[2] ?? cmd).trim();
      out.add(inner);
      // A check run through the runner is cited by its question or by the command it ran.
      const runner = /capture-check\.mjs\b(?:.*?--label\s+(?:"([^"]+)"|'([^']+)'|(\S+)))?.*?\s--\s+(.+)$/.exec(inner);
      if (runner) {
        const label = runner[1] ?? runner[2] ?? runner[3];
        if (label) out.add(label);
        out.add(runner[4].replace(/^\\?['"]|\\?['"]$/g, "").trim());
      }
    }
  for (const b of briefs(s).filter((x) => x.side === "claude" && x.call))
    for (const line of parseFiveFields(s.results.get(b.call.id)?.text ?? "").fields.evidence ?? [])
      for (const m of line.matchAll(/`([^`]{3,})`/g)) out.add(m[1]);
  return [...out];
}

// Every return in the five fields and valid against the shipped schema, before the synthesis started; a
// malformed Claude return is repaired by a later call with the same id or it is a failure named by agent;
// every agent the answer names is one that ran.
// A schema with its size caps (maxLength, maxItems) taken out, at every level.
const uncapped = (v) => (Array.isArray(v) ? v.map(uncapped)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).filter(([k]) => k !== "maxLength" && k !== "maxItems").map(([k, x]) => [k, uncapped(x)])) : v);
const canonical = (v) => (Array.isArray(v) ? v.map(canonical)
  : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])])) : v);

// The file an OUTPUT_SCHEMA: line names, accepted when it parses equal to the shipped five-field schema
// apart from its caps (the codex page's per-run copy for other caps), and returned with its own caps for
// validating the return.
export function schemaFileOf(file, { shipped, read = (p) => fs.readFileSync(p) }) {
  let parsed;
  try { parsed = JSON.parse(read(file).toString("utf8")); } catch (e) { return { problem: `${file} does not parse: ${e.message}` }; }
  if (JSON.stringify(canonical(uncapped(parsed))) !== JSON.stringify(canonical(uncapped(shipped))))
    return { problem: `${file} is not the shipped five-field schema apart from its caps` };
  return { schema: parsed };
}

// Every return in the five fields and valid against its schema (a Codex return against the file its prompt
// named, a Claude return against the shipped one), the completeness critic's included, and every one but
// the critic's in before the synthesis started; a malformed Claude return is repaired by a later call with
// the same id, or, once a repair was asked, named unknown in the answer, or it is a failure named by agent;
// every agent the answer names is one that ran.
export function fiveFieldProblems(s, { schema, reports = [], prompts = [], finalText = "", read = (p) => fs.readFileSync(p) }) {
  const problems = [];
  const declared = new Map();
  for (const p of prompts) {
    const file = /^OUTPUT_SCHEMA:\s*(\S+)/m.exec(p.text)?.[1];
    if (!file) { problems.push(`${p.id}'s prompt declares no OUTPUT_SCHEMA`); continue; }
    const got = schemaFileOf(file, { shipped: schema, read });
    if (got.problem) problems.push(`${p.id}'s OUTPUT_SCHEMA: ${got.problem}`);
    else declared.set(p.id, got.schema);
  }
  for (const r of reports) {
    if (!r.report?.answerJson) { problems.push(`${r.id}'s report has no answerJson`); continue; }
    for (const e of validate(declared.get(r.id) ?? schema, r.report.answerJson)) problems.push(`${r.id}: ${e}`);
  }
  const bs = briefs(s);
  const claude = bs.filter((b) => b.side === "claude" && b.call);
  const isCritic = (b) => /completeness critic/i.test(`${b.description ?? ""}\n${b.text}`);
  const synthesis = Math.min(...[bs.filter(isCritic).map((b) => b.seq)[0],
    root(s).filter((e) => e.kind === "text").pop()?.seq].filter((x) => x !== undefined));
  for (const b of claude) {
    const res = s.results.get(b.call.id);
    const name = b.description ?? b.id ?? "an agent";
    if (!res) { problems.push(`${name} never returned`); continue; }
    if (!isCritic(b) && Number.isFinite(synthesis) && res.seq > synthesis) problems.push(`${name} returned after the synthesis started`);
    const { fields, problems: p } = parseFiveFields(res.text);
    const errs = p.length ? p : validate(schema, fields);
    if (!errs.length) continue;
    const repaired = claude.some((o) => o !== b && o.id && o.id === b.id && o.seq > b.seq && (() => {
      const r2 = s.results.get(o.call.id);
      if (!r2) return false;
      const x = parseFiveFields(r2.text);
      return !x.problems.length && !validate(schema, x.fields).length;
    })());
    // The page continues a malformed return once, and after that its result is `unknown` in the answer.
    const attempted = claude.some((o) => o !== b && o.id && o.id === b.id);
    const markedUnknown = b.id && String(finalText).split(/(?<=[.!?])\s+/)
      .some((t) => new RegExp(`(?<![A-Za-z0-9])${b.id}(?![A-Za-z0-9])`).test(t) && /unknown|неизвестн/i.test(t));
    if (!repaired && !(attempted && markedUnknown)) problems.push(`${name}'s return does not parse into the five fields: ${errs.slice(0, 3).join("; ")}`);
  }
  const ran = new Set(agentsThatRan(s).map((a) => a.replace(/^Codex /, "").toLowerCase()));
  for (const m of String(finalText).matchAll(new RegExp(`(?<![A-Za-z])(?:Codex\\s+|Claude\\s+)?(${MODELS})\\s+([A-Z][A-Za-z]*\\d[\\w-]*)\\b`, "g")))
    if (!ran.has(`${m[1]} ${m[2]}`.toLowerCase())) problems.push(`the answer names ${m[1]} ${m[2]}, an agent that never ran`);
  return problems;
}

// What each agent returned, as one text per "<model> <id>": a Claude agent's five fields, a Codex agent's
// answerJson and answer. The origin a claim in the answer is checked against.
export function originsOf(s, { reports = [] } = {}) {
  const out = new Map();
  const add = (key, text) => out.set(key, `${out.get(key) ?? ""}\n${text}`);
  for (const u of rootUses(s).filter((x) => AGENT_TOOLS.has(x.name))) {
    const d = describedAgent(u);
    const res = s.results.get(u.id);
    if (!d || !res || isCodexCall(u)) continue;
    const { fields } = parseFiveFields(res.text);
    add(`${d.model} ${d.id}`.toLowerCase(), Object.keys(fields).length ? JSON.stringify(fields) : handBack(res.text));
  }
  for (const u of rootUses(s).filter(isCodexCall)) {
    const d = describedAgent(u);
    const id = idOfReport(reportPathOf(codexCommand(u)));
    const r = reports.find((x) => x.id?.toLowerCase() === id?.toLowerCase());
    if (d && r) add(`${d.model} ${d.id}`.toLowerCase(), `${JSON.stringify(r.report?.answerJson ?? "")}\n${r.report?.answer ?? ""}`);
  }
  return out;
}

// Each claim the answer credits to an agent holds only what that agent's admitted return holds: the answer
// is cut at every "<Model> <id>" into the stretch that agent is the subject of, and each fact in it (a
// backquoted span, a file path, an "N of M" count, a number of two digits or more) must be in that agent's
// return. A fact only another agent's return holds is misattributed; one no return holds is unsupported.
// Heuristic over free text: a claim with no such fact is not checked.
export function claimOriginProblems(s, { reports = [], finalText = "" }) {
  const origins = originsOf(s, { reports });
  const problems = [];
  const mention = new RegExp(`(?<![A-Za-z])(?:Codex\\s+|Claude\\s+)?(${MODELS})\\s+([A-Z][A-Za-z]*\\d[\\w-]*)\\b`, "g");
  const text = String(finalText);
  const marks = [...text.matchAll(mention)].map((m) => ({ at: m.index, end: m.index + m[0].length, key: `${m[1]} ${m[2]}`.toLowerCase(), name: `${m[1]} ${m[2]}` }));
  marks.forEach((m, i) => {
    const stop = Math.min(marks[i + 1]?.at ?? text.length, (() => { const j = text.slice(m.end).search(/[.!?](\s|$)/); return j < 0 ? text.length : m.end + j + 1; })());
    const stretch = text.slice(m.end, stop);
    const facts = [
      ...[...stretch.matchAll(/`([^`]+)`/g)].map((x) => [x[1]]),
      ...[...stretch.matchAll(FILE_RE)].map((x) => [x[1]]),
      ...[...stretch.matchAll(/\b(\d+)\s+(?:of|из)\s+(\d+)\b/g)].map((x) => [x[1], x[2]]),
      ...[...stretch.replace(/\b\d+\s+(?:of|из)\s+\d+\b/g, "").matchAll(/(?<![\w.-])(\d{2,})(?![\w-])/g)].map((x) => [x[1]]),
    ];
    const own = origins.get(m.key) ?? "";
    const has = (body, fact) => fact.every((f) => new RegExp(`(?<![\\w])${escapeRe(f)}(?![\\w])`).test(body));
    for (const f of facts) {
      if (has(own, f)) continue;
      const other = [...origins].find(([k, body]) => k !== m.key && has(body, f));
      problems.push(other
        ? `the answer credits ${m.name} with ${f.join(" of ")}, which only ${other[0]}'s return holds`
        : `the answer credits ${m.name} with ${f.join(" of ")}, which no admitted return holds`);
    }
  });
  return problems;
}

// --------------------------------------------------------------- the coordinator's own reads

// What the coordinator read inline, priced as the page prices it: each result's bytes times the calls after
// it. A check command whose output reached the context whole, not through the runner, is a flood.
export function inlineCost(s) {
  const r = root(s);
  const calls = r.filter((e) => e.kind === "tool_use");
  const rows = [];
  const floods = [];
  for (const res of r.filter((e) => e.kind === "tool_result")) {
    const use = calls.find((u) => u.id === res.id);
    const bytes = Buffer.byteLength(res.text);
    const later = calls.filter((u) => u.seq > res.seq).length;
    rows.push({ tool: use?.name ?? "?", bytes, later, cost: bytes * later });
    const cmd = use ? bashCommand(use) : "";
    if (cmd && CHECK_COMMAND.test(cmd) && !/capture-check\.mjs/.test(cmd) && res.text.split("\n").length > 20)
      floods.push(`${res.text.split("\n").length} lines of ${JSON.stringify(cmd.slice(0, 80))} read inline, not through the runner`);
  }
  return { rows, total: rows.reduce((n, x) => n + x.cost, 0), bytes: rows.reduce((n, x) => n + x.bytes, 0), floods };
}

// Every brief that asks for a check command names the runner (#15 F9: the floods of T2 and T7 were Claude
// subagents', and Codex agents were left out of the rule on an unmeasured guess).
// A brief asks for a check when a CHECK: line, or a verb of running, carries the command; a brief that only
// quotes one (a critic's evidence) does not. Heuristic over free text.
const ASKS_CHECK = new RegExp(`^CHECK:.*(?:${CHECK_COMMAND.source})|\\b(?:run|runs|execute|re-run|rerun)\\b[^\\n]{0,40}(?:${CHECK_COMMAND.source})`, "im");
export function runnerBriefProblems(prompts) {
  return prompts.filter((p) => ASKS_CHECK.test(p.text) && !/capture-check\.mjs/.test(p.text))
    .map((p) => `${p.id}'s brief asks for a check and does not name the runner`);
}

// A write or worktree agent's prompt carries an ENVIRONMENT: line with something in it, and every absolute
// path it names exists (#15 F11, F19: the capsule the driver cannot compute is the plan's to fill).
// staged: the inputs the run staged for the agent (the diff, trunk files), each of which the line must name;
// tools: the tools in the fixture that need a daemon or a socket, [{ name, instead }], each of which the
// line must name with what to run instead.
export function environmentProblems(promptText, { exists = fs.existsSync, staged = [], tools = [] } = {}) {
  if (!/^RIGHTS:\s*(worktree|write)\b/m.test(promptText)) return [];
  const line = /^ENVIRONMENT:\s*(.*)$/m.exec(promptText)?.[1]?.trim();
  if (line === undefined) return ["a write agent's prompt has no ENVIRONMENT: line"];
  if (line.length < 10 || /^(…|\.\.\.|tbd|todo|n\/a|none|-)$/i.test(line)) return [`the ENVIRONMENT: line says nothing: ${JSON.stringify(line)}`];
  const problems = absolutePaths(line).filter((p) => !exists(p)).map((p) => `the ENVIRONMENT: line names ${p}, which does not exist`);
  for (const p of staged) if (!line.includes(p)) problems.push(`the ENVIRONMENT: line does not name the staged ${p}`);
  for (const t of tools) {
    if (!new RegExp(`(?<![\\w-])${escapeRe(t.name)}(?![\\w-])`).test(line)) problems.push(`the ENVIRONMENT: line does not name ${t.name}, which needs a daemon here`);
    else if (!line.includes(t.instead)) problems.push(`the ENVIRONMENT: line names ${t.name} without what to run instead (${t.instead})`);
  }
  return problems;
}

// --------------------------------------------------------------- the advisor

// Each advisor prompt: MODEL: astra, the shipped five-field schema, no EFFORT:, and every continuation on
// the first thread (#15 F12c: an advisor prompt with an EFFORT line and no schema, 111 lines of prose back).
export function advisorPromptProblems(prompts, { threadId, shipped = null, read = (f) => fs.readFileSync(f) }) {
  const problems = [];
  prompts.forEach((p, i) => {
    if (!/^MODEL:\s*astra\s*$/mi.test(p)) problems.push(`advisor prompt ${i + 1} carries no MODEL: astra`);
    const file = /^OUTPUT_SCHEMA:\s*(\S+)\s*$/m.exec(p)?.[1];
    // The shipped file by its path, or, with the shipped schema at hand, any file equal to it apart from its caps.
    const named = file && (/\/schemas\/five-fields\.schema\.json$/.test(file) || (shipped && !schemaFileOf(file, { shipped, read }).problem));
    if (!named) problems.push(`advisor prompt ${i + 1} does not name the five-field schema`);
    if (/^EFFORT:/m.test(p)) problems.push(`advisor prompt ${i + 1} carries an EFFORT: line`);
    if (i > 0) {
      const resume = /^RESUME:\s*(\S+)/m.exec(p)?.[1];
      if (!resume) problems.push(`advisor prompt ${i + 1} opens a new thread instead of continuing the first`);
      else if (threadId && resume !== threadId && resume !== "last") problems.push(`advisor prompt ${i + 1} continues ${resume}, not the first thread ${threadId}`);
    }
  });
  return problems;
}

export const advisorBriefs = (s) => briefs(s).filter((b) => b.side === "codex" && /^astra$/i.test(b.model ?? ""));

// --------------------------------------------------------------- activation

// What a session shows of a slash command: the expansion Claude Code records in the session file (a
// <command-name> record, then an isMeta record opening "Base directory for this skill: …/skills/<name>"),
// the Skill calls and their refusals, and the first thing the session did. The stream alone does not
// carry the expansion (measured on the saved full-run sessions of 2026-09-27: the first event after init
// is the coordinator's own call), so the session file is read when there is one.
export function activationRecord({ transcript = "", stream, skill }) {
  const recs = [];
  for (const line of String(transcript).split("\n")) { if (!line.trim()) continue; try { recs.push(JSON.parse(line)); } catch {} }
  const textOf = (r) => blockText(r?.message?.content);
  const command = recs.some((r) => r.type === "user" && textOf(r).includes(`<command-name>/entrust:${skill}</command-name>`));
  const body = recs.find((r) => r.type === "user" && r.isMeta && new RegExp(`^Base directory for this skill: \\S*/skills/${skill}\\b`).test(textOf(r)));
  const skills = rootUses(stream).filter((u) => u.name === "Skill");
  // The refusal's shape is unmeasured: an error result, or a result whose text says why.
  const refusals = skills.map((u) => stream.results.get(u.id))
    .filter((r) => r && (r.isError || /disable-model-invocation|cannot be (?:used|invoked|loaded)|not (?:available|allowed)/i.test(r.text)))
    .map((r) => r.text.slice(0, 200));
  const first = root(stream).find((e) => e.kind === "tool_use" || e.kind === "text");
  return {
    transcript: recs.length > 0,
    command,
    expanded: Boolean(body),
    expandedHead: body ? textOf(body).slice(0, 200) : null,
    skillCalls: skills.map((u) => String(u.input.skill ?? u.input.name ?? "")),
    refusals,
    firstAction: first ? (first.kind === "text" ? `text: ${first.text.slice(0, 120)}` : `${first.name}`) : null,
  };
}

// --------------------------------------------------------------- a run, whole

// Everything after "go" that the answer and its evidence must show, one delta each, from the two turns'
// streams and what the run left (prompt files, reports, the registered plan, the runner's ledger). Pure
// over its inputs, so gate-checks.test.mjs can hand it one coherent good run and check that every check
// passes it at once: checks that no run could satisfy together would fail every live run.
export function runProblems({ s1, s2, prompts = [], reports = [], rows = [], ledger = [], schema, request = "", phases,
  read = (p) => fs.readFileSync(p), reportOf = () => null, cwd = null, tmp = [], staged = [], tools = [] }) {
  const problems = [];
  const finalText = s2.resultText;
  const receipts = receiptsFrom(s2, { reports: reports.map((r) => r.report), ledger });
  const agents = agentsThatRan(s2);
  for (const p of prompts) problems.push(...environmentProblems(p.text, { staged, tools }).map((e) => `${p.id}: ${e}`));
  problems.push(...codexLoadProblems(s2, { codexPlanned: true, loadedBefore: loadedCodex(s1) }));
  problems.push(...manifestProblems({ runTurn: s2, rows, finalText }));
  if (cwd) problems.push(...writesProblems({ s: s2, rows, reports, cwd, tmp }));
  const claudeBriefs = briefs(s2).filter((b) => b.side === "claude").map((b) => ({ id: b.id ?? b.description, text: b.text }));
  problems.push(...runnerBriefProblems([...prompts, ...claudeBriefs]));
  const cost = inlineCost(s2);
  problems.push(...cost.floods);
  problems.push(...criticDigestProblems(s2, { finalText, read, reportOf }));
  problems.push(...phaseProblems(s2, { max: phases, receipts }));
  problems.push(...lintCallProblems(s2));
  const lint = lintDraft(finalText, { agents, receipts, request });
  problems.push(...lint.hits.map((h) => `the answer lints red, ${h.rule}: ${h.text}`));
  if (!schema) problems.push("the shipped five-field schema does not parse");
  else problems.push(...fiveFieldProblems(s2, { schema, reports, prompts, finalText, read }));
  problems.push(...claimOriginProblems(s2, { reports, finalText }));
  return { problems, agents, receipts, cost, lint };
}
