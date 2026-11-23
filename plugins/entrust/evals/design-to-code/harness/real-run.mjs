#!/usr/bin/env node
// The owner's real run of design-to-code, in one sitting and with no coordinator watching: run A on the project, then
// its replicate B on a second copy, each to Terra's first handover, with nothing lost to the environment.
//
//   node real-run.mjs setup <project> --skill <commit> --originals <path>... [--baseline <file>] [--run A|B] [--force]
//     installs the skill at <commit> as arm.mjs prepare does, hashes the owner's originals into a baseline kept outside
//     the project, checks the seeds, prints the Codex rule, starts Chromium from the project and prints the first
//     message to Terra
//   node real-run.mjs collect <project> [--rollout <rollout.jsonl>]... [--baseline <file>] [--run A|B] [--out <dir>]
//                                       [--wait <s>] [--quiet <s>]
//     waits until no check is in flight, freezes the run, diffs the originals against the baseline, reads the Codex
//     rollout log into the record's eight fields, and writes real-run-<run>.tar, record-<run>.json and form-<run>.md
//
// The baseline and the outputs go to ~/.entrust-real-run unless --baseline and --out say otherwise. Without --rollout,
// collect looks under $CODEX_HOME/sessions (~/.codex/sessions) for the session opened in <project> since setup; a
// second --rollout is a helper's log (a reviewer, a spawned agent), counted beside the worker's.
//
// The rollout format is read from Codex's source (codex-rs/history/src/lib.rs `RolloutLine`, rollout_payload.rs,
// codex-rs/protocol/src/models.rs `ResponseItem`, protocol.rs `EventMsg`, `TokenUsageRecord`, and
// codex-rs/code-mode-protocol for the code-mode `exec` tool): one JSON object a line, `{timestamp, type, payload}`.
// It has not yet been run on a real log: what it does not know it counts and reports, and never stops on.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ARM = path.join(HERE, "arm.mjs");
const REPO = path.resolve(HERE, "../../../../..");

// The current approved plan; setup records the exact line so collection can check a run against its own prompt.
export const APPROVAL = "The owner has approved this plan: run the check, fix what is fixable in the component's files, record ledger entries, hand over at `pass`, `pending` or the budget, or report an evidenced external blocker as blocked with the actual `fail` and without claiming done; the fixed inputs are not yours to change.";
// The brief's closing sentence (30-terra-run.md, section 3), up to its last word: a brief may go on after it, as the
// planted case's does.
const CLOSING = "Work on your own: there is no one to ask, so make reasonable decisions and note them. When you are done, your final message is your handoff to the product owner";
const SKILL_SCRIPT = ".skill/design-to-code/scripts/design.mjs";

// Never part of a hash or an archive: dependencies, history, the pinned skill, and what a file browser leaves behind.
const SKIP = new Set(["node_modules", ".git", ".skill"]);
const BUILT = new Set(["dist", "build", ".next", ".nuxt", ".cache", ".turbo", ".parcel-cache", "coverage", "storybook-static"]);
const NOISE = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);
const HARNESS = new Set([".brief.md", ".prompt.md", ".arm.json"]);

const sha = (data) => createHash("sha256").update(data).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeFile = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof data === "string" ? data : `${JSON.stringify(data, null, 2)}\n`); };
const real = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
const posix = (p) => p.split(path.sep).join("/");
const num = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : String(n ?? "—"));
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const quote = (p) => `'${String(p).replace(/'/g, "'\\''")}'`;

// A path inside the project as the project names it (posix, relative); one outside it, absolute.
export function keyOf(project, p) {
  const r = path.relative(project, p);
  return r && !r.startsWith("..") && !path.isAbsolute(r) ? posix(r) : (r === "" ? "." : p);
}
const fromKey = (project, key) => (path.isAbsolute(key) ? key : path.join(project, key));

// Every file under root (or root itself), sorted; skip(name, dir) leaves a directory out.
function walk(root, skip = () => false) {
  const out = [];
  const visit = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (!skip(e.name, p)) visit(p); }
      else if (!NOISE.has(e.name)) out.push(p);
    }
  };
  const st = fs.statSync(root);
  if (st.isDirectory()) visit(root); else out.push(root);
  return out.sort();
}
const fileHash = (p) => { const st = fs.lstatSync(p); return st.isSymbolicLink() ? `link:${fs.readlinkSync(p)}` : sha(fs.readFileSync(p)); };

// A file as text, if it is small UTF-8 text: a changed one can then say which lines changed.
function textOf(p) {
  const st = fs.statSync(p);
  if (st.size > 256 * 1024) return null;
  const buf = fs.readFileSync(p);
  if (buf.includes(0)) return null;
  const s = buf.toString("utf8");
  return Buffer.from(s, "utf8").equals(buf) ? s : null;
}

// The owner's originals: every file under each root, by its key, with its hash.
export function hashOriginals(project, roots) {
  const files = {}, missing = [], keys = [];
  for (const root of roots) {
    const abs = path.resolve(project, root), key = keyOf(project, abs);
    keys.push(key);
    if (!fs.existsSync(abs)) { missing.push(key); continue; }
    for (const f of walk(abs, (name) => SKIP.has(name))) {
      const k = keyOf(project, f);
      files[k] = fileHash(f);
    }
  }
  return { roots: keys, files, missing };
}
// Where a key's pristine copy lives under the baseline's copy of the originals.
const copyPath = (copy, key) => path.join(copy, path.isAbsolute(key) ? path.join("outside", key) : key);

// A copy of the originals beside the baseline, outside the project: the blind review reads these, never the
// builder's copies, and a changed text input is diffed against it.
function copyOriginals(project, files, copy) {
  fs.rmSync(copy, { recursive: true, force: true });
  for (const key of Object.keys(files)) {
    const to = copyPath(copy, key);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.cpSync(fromKey(project, key), to, { preserveTimestamps: true, verbatimSymlinks: true });
  }
}
export const inputsHash = (files) => sha(JSON.stringify(Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))));

export function diffFiles(before, after) {
  const changed = [], removed = [], added = [];
  for (const [k, h] of Object.entries(before)) { if (!(k in after)) removed.push(k); else if (after[k] !== h) changed.push(k); }
  for (const k of Object.keys(after)) if (!(k in before)) added.push(k);
  return { changed: changed.sort(), removed: removed.sort(), added: added.sort() };
}

// The lines a text lost and gained, as a multiset: enough to say what a changed input says now.
export function lineDelta(before, after) {
  const count = new Map();
  for (const l of before.split("\n")) count.set(l, (count.get(l) ?? 0) + 1);
  const added = [];
  for (const l of after.split("\n")) { const n = count.get(l) ?? 0; if (n > 0) count.set(l, n - 1); else added.push(l); }
  const removed = [...count].flatMap(([l, n]) => Array(n).fill(l));
  return { removed, added };
}

// ------------------------------------------------------------------ the check's files

// The check's folders: each design.json (outside dependencies, the skill and build output), with its out/ and ledger.
export function checks(project) {
  const found = [];
  const skip = (name) => SKIP.has(name) || BUILT.has(name);
  for (const f of walk(project, skip)) {
    if (path.basename(f) !== "design.json") continue;
    let cfg = null, error = null;
    try { cfg = readJson(f); } catch (e) { error = e.message; }
    if (cfg && !Array.isArray(cfg.frames) && !cfg.url) continue;
    const dir = path.dirname(f);
    found.push({ file: f, dir, cfg, error, out: path.join(dir, "out"), ledger: path.resolve(dir, cfg?.ledger ?? "deviations.json"), review: path.join(dir, "review.md") });
  }
  return found;
}

// The out/ folders a check writes into: beside a design.json, or wherever a history.jsonl is.
function outDirs(project) {
  const dirs = new Set(checks(project).map((c) => c.out).filter((d) => fs.existsSync(d)));
  for (const f of walk(project, (name) => SKIP.has(name) || BUILT.has(name))) if (path.basename(f) === "history.jsonl") dirs.add(path.dirname(f));
  return [...dirs];
}

const readLines = (file) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n").filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } }) : []);

// The rounds a check's history holds: quick and complete, the last status, and the rounds since the lowest score of
// the last series (rounds measured the same way, as the check itself reads them).
export function rounds(history, frames) {
  const quick = history.filter((h) => h.quick).length;
  const last = history.at(-1);
  const series = last ? history.filter((h) => h.basis === last.basis && h.score != null) : [];
  const lowest = series.reduce((a, h) => (!a || h.score < a.score ? h : a), null);
  const complete = history.filter((h) => !h.quick && (frames == null || (h.frames?.length ?? frames) >= frames)).length;
  return { total: history.length, quick, complete, partial: history.length - quick - complete, last: last ? { round: last.round, time: last.time, status: last.status, quick: Boolean(last.quick), score: last.score ?? null } : null,
    lowest: lowest ? { round: lowest.round, score: lowest.score } : null, afterLowest: lowest ? series.length - 1 - series.indexOf(lowest) : null };
}

// ------------------------------------------------------------------ a check in flight

function processCwd(pid) {
  try { return fs.readlinkSync(`/proc/${pid}/cwd`); } catch { /* not Linux, or not ours to read */ }
  const r = spawnSync("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"], { encoding: "utf8" });
  const line = r.status === 0 ? r.stdout.split("\n").find((l) => l.startsWith("n")) : null;
  return line ? line.slice(1) : null;
}

// The design.mjs processes running for this project: named by its path, or running inside it. One whose folder cannot
// be read is counted too: freezing beside a check is the mistake this guards against (39-terra-045-rerun.md).
export function runningChecks(project) {
  const r = spawnSync("ps", ["-A", "-o", "pid=,args="], { encoding: "utf8" });
  if (r.status !== 0 || r.error) return { procs: [], unknown: `ps failed: ${r.error?.message || r.stderr?.trim() || (r.signal ? `signal ${r.signal}` : `exit ${r.status}`)}` };
  const roots = [...new Set([path.resolve(project), real(project)])];
  const inside = (p) => roots.some((root) => p === root || p.startsWith(root + path.sep));
  const procs = [];
  for (const line of r.stdout.split("\n")) {
    const m = /^\s*(\d+)\s+(.*\S)\s*$/.exec(line);
    if (!m || Number(m[1]) === process.pid || !/design\.mjs/.test(m[2])) continue;
    const pid = Number(m[1]), args = m[2], cwd = processCwd(pid);
    if (roots.some((root) => args.includes(root + path.sep)) || (cwd ? inside(real(cwd)) || inside(cwd) : true)) procs.push({ pid, args: args.slice(0, 160), cwd: cwd ? keyOf(project, cwd) : "unknown" });
  }
  return { procs };
}

export function inFlight(project, quietSeconds) {
  const { procs, unknown } = runningChecks(project);
  let newest = 0, file = null;
  for (const d of outDirs(project)) for (const f of walk(d)) { const m = fs.statSync(f).mtimeMs; if (m > newest) { newest = m; file = f; } }
  const ago = (Date.now() - newest) / 1000;
  return { procs, unknown, recent: file && ago < quietSeconds ? { file: keyOf(project, file), ago: Math.round(ago * 10) / 10 } : null };
}

function waitQuiet(project, waitSeconds, quietSeconds) {
  const started = Date.now(), seen = new Map();
  let said = false;
  for (;;) {
    const state = inFlight(project, quietSeconds);
    for (const p of state.procs) seen.set(p.pid, p);
    if (state.unknown) return { ok: false, state };
    if (!state.procs.length && !state.recent) return { ok: true, waited: Math.round((Date.now() - started) / 100) / 10, seen: [...seen.values()] };
    if (Date.now() - started >= waitSeconds * 1000) return { ok: false, state };
    if (!said) { console.log(`A check is in flight (${describeFlight(state)}): waiting up to ${waitSeconds} s for it to end`); said = true; }
    sleep(1000);
  }
}
const describeFlight = (s) => [...s.procs.map((p) => `pid ${p.pid}, in ${p.cwd}: ${p.args}`), ...(s.recent ? [`${s.recent.file} written ${s.recent.ago} s ago`] : [])].join("; ");

// ------------------------------------------------------------------ the Codex rollout log

// Nested tool calls in a code-mode `exec` cell: each `tools.<name>(…)` site in the code (not in a string or a comment),
// with its argument's text. A site in a loop is counted once: this reads the source, not what it did.
export function nestedCalls(source) {
  const out = [], re = /\btools\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*(["'])([^"']+)\2\s*\])\s*\(/g, inert = inertRanges(source);
  let m;
  while ((m = re.exec(source))) {
    if (inert.some(([a, b]) => m.index >= a && m.index <= b)) continue;
    const open = re.lastIndex - 1, close = closing(source, open);
    out.push({ name: m[1] ?? m[3], arg: source.slice(open + 1, close < 0 ? source.length : close) });
  }
  return out;
}
// The strings, templates and comments of a source, as [start, end] ranges.
function inertRanges(s) {
  const ranges = [];
  for (let k = 0; k < s.length; k++) {
    const c = s[k];
    let e = -1;
    if (c === '"' || c === "'" || c === "`") e = stringEnd(s, k);
    else if (c === "/" && s[k + 1] === "/") { e = s.indexOf("\n", k); if (e < 0) e = s.length; }
    else if (c === "/" && s[k + 1] === "*") { e = s.indexOf("*/", k + 2); e = e < 0 ? s.length : e + 1; }
    if (e >= 0) { ranges.push([k, e]); k = e; }
  }
  return ranges;
}
// The index of the bracket closing the one at i, past strings, templates and comments; -1 if none.
function closing(s, i) {
  let depth = 0;
  for (let k = i; k < s.length; k++) {
    const c = s[k];
    if (c === '"' || c === "'" || c === "`") { k = stringEnd(s, k); continue; }
    if (c === "/" && s[k + 1] === "/") { k = s.indexOf("\n", k); if (k < 0) return -1; continue; }
    if (c === "/" && s[k + 1] === "*") { k = s.indexOf("*/", k + 2); if (k < 0) return -1; k++; continue; }
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c) && --depth === 0) return k;
  }
  return -1;
}
function stringEnd(s, k) {
  const q = s[k];
  for (let j = k + 1; j < s.length; j++) {
    if (s[j] === "\\") { j++; continue; }
    if (q === "`" && s[j] === "$" && s[j + 1] === "{") { const e = closing(s, j + 1); if (e < 0) return s.length; j = e; continue; }
    if (s[j] === q) return j;
  }
  return s.length;
}
function unquote(lit) {
  const q = lit[0], body = lit.slice(1, -1);
  if (q === '"') { try { return JSON.parse(lit); } catch { return body; } }
  if (q === "'") { try { return JSON.parse(`"${body.replace(/\\'/g, "'").replace(/(^|[^\\])"/g, '$1\\"')}"`); } catch { return body; } }
  return body;
}
// The value of key in an object literal's source: a string or number literal, or the expression's text.
export function literal(arg, key) {
  const m = new RegExp(`(?:^|[{,\\s])["']?${key}["']?\\s*:\\s*`).exec(arg);
  if (!m) return { present: false };
  const at = m.index + m[0].length, q = arg[at];
  if (q === '"' || q === "'" || q === "`") return { present: true, literal: true, value: unquote(arg.slice(at, stringEnd(arg, at) + 1)) };
  const n = /^-?\d+(?:\.\d+)?(?![\w.])/.exec(arg.slice(at));
  if (n) return { present: true, literal: true, value: Number(n[0]) };
  return { present: true, literal: false, expr: /^[^,}]*/.exec(arg.slice(at))[0].trim() };
}
const bareString = (arg) => { const t = arg.trim(); return /^["'`]/.test(t) ? unquote(t.slice(0, stringEnd(t, 0) + 1)) : null; };
const asked = (l) => (l.present ? (l.literal ? l.value : l.expr) : null);

const SHELL = new Set(["exec_command", "shell", "shell_command", "container.exec", "local_shell"]);

function nestedOp(name, arg, source) {
  const lit = (k) => literal(arg, k), bare = bareString(arg);
  if (name === "exec_command" || name === "shell_command") {
    const c = lit(name === "exec_command" ? "cmd" : "command"), cmd = c.literal ? String(c.value) : bare;
    // A command held in a variable is read from the whole cell.
    return { tool: name, nested: true, cmd, yield: asked(lit("yield_time_ms")), text: cmd ?? source };
  }
  if (name === "write_stdin") {
    const c = lit("chars");
    return { tool: name, nested: true, session: asked(lit("session_id")), empty: !c.present || (c.literal && c.value === ""), charsUnread: c.present && !c.literal, yield: asked(lit("yield_time_ms")), text: arg };
  }
  if (name === "wait") return { tool: name, nested: true, yield: asked(lit("yield_time_ms")), terminate: lit("terminate").value === true || /terminate\s*:\s*true/.test(arg), text: arg };
  if (name === "view_image") { const p = lit("path"), file = p.literal ? String(p.value) : bare; return { tool: name, nested: true, path: file, text: file ?? arg }; }
  if (name === "apply_patch") return { tool: name, nested: true, text: bare ?? (lit("input").literal ? String(lit("input").value) : arg) };
  return { tool: name, nested: true, text: arg };
}

export function execCellOps(source) {
  const sites = nestedCalls(source);
  if (!sites.length) return [{ tool: "exec", nested: false, cell: true, text: source }];
  return sites.map(({ name, arg }) => nestedOp(name, arg, source));
}

function functionOp(name, args) {
  const a = args && typeof args === "object" ? args : {};
  const raw = typeof args === "string" ? args : JSON.stringify(args ?? {});
  switch (name) {
    case "exec_command": return { tool: name, cmd: String(a.cmd ?? ""), yield: a.yield_time_ms ?? null, text: String(a.cmd ?? raw) };
    case "shell": case "container.exec": case "shell_command": {
      const c = Array.isArray(a.command) ? (a.command.length >= 3 && /^-l?c$/.test(a.command[1]) ? a.command.at(-1) : a.command.join(" ")) : String(a.command ?? raw);
      return { tool: name, cmd: c, text: c };
    }
    case "write_stdin": return { tool: name, session: a.session_id ?? null, empty: !a.chars, yield: a.yield_time_ms ?? null, text: raw };
    case "wait": return { tool: name, yield: a.yield_time_ms ?? null, terminate: a.terminate === true, text: raw };
    case "view_image": return { tool: name, path: a.path ?? null, text: String(a.path ?? raw) };
    case "apply_patch": return { tool: name, text: typeof args === "string" ? args : String(a.input ?? a.patch ?? raw) };
    default: return { tool: name, text: raw };
  }
}

function opsOf(item) {
  if (item.type === "local_shell_call") { const c = [].concat(item.action?.command ?? []).join(" "); return [{ tool: "local_shell", cmd: c, text: c }]; }
  if (item.type === "custom_tool_call") {
    const input = String(item.input ?? "");
    return item.name === "exec" ? execCellOps(input) : [{ ...functionOp(item.name, input), text: input }];
  }
  if (item.type === "function_call") {
    let args;
    try { args = JSON.parse(item.arguments ?? "{}"); } catch { args = String(item.arguments ?? ""); }
    if (item.name === "exec") return execCellOps(typeof args === "string" ? args : String(args.code ?? args.input ?? args.source ?? ""));
    return [functionOp(item.name, args)];
  }
  return [{ tool: item.name ?? item.type, text: JSON.stringify(item.action ?? item.arguments ?? "") }];
}

// What each operation did. A call is filed under the first of these its operations did; the rest are kept beside it.
export const CATEGORIES = ["check-complete", "check-quick", "ledger-write", "edit", "probe", "image-read", "file-read", "poll", "other"];
const CHECK_RUN = /design\.mjs['"]?\s+(?:[^\n;&|]*?\s)?check\b([^\n;&|]*)/;
const WRITES = [/\bsed\s+(?:-[a-zA-Z]+\s+)*-[a-zA-Z]*i\b/, /\bperl\s+-[a-zA-Z]*i/, /\b(?:cat|echo|printf)\b[^|;&\n]*?>{1,2}\s*(?!\/dev\/null)["']?[\w.~/$-]/, /\btee\s/, /\bapply_patch\b/,
  /(?:^|[\s;&|(])(?:cp|mv|rm|touch|mkdir|ln)\s/, /\b(?:writeFileSync|appendFileSync|writeFile)\s*\(/, /\bopen\([^)]*["'][wa]\+?["']/];
const PROBE = /\bnode\s+(?:-e|--eval|-p|--print|--input-type|-\s|<<)|\bnode\s+(?!\S*design\.mjs)\S+\.(?:m?js|cjs)\b|\bnpx\s+playwright\s+(?!install)|require\(["']playwright|from\s+["']playwright|chromium\.launch|\bpython3?\s|\bcurl\s|design\.mjs['"]?\s+(?:boxes|snapshot|spec|figma)\b/;
const READS = /(?:^|[\s;&|(])(?:cat|sed|head|tail|less|nl|rg|grep|ls|find|wc|jq|stat|file|tree|du|diff|xxd|od|git\s+(?:diff|status|log|show))\s/;
const CHECK_IMAGE = /(?:^|[/\s"'`])out\/\S*\.(?:png|jpe?g|webp)|boxes\.png/;
function verdict(text) {
  const match = /^Verdict: (pass|pending|fail|incomplete)\b([^\n]*)/m.exec(text);
  return match ? { status: match[1], complete: !/partial check/.test(match[2]) } : null;
}
const CHECK_TEXT = /^(?:Verdict: |Start here: )|Gallery \(design, before, after\)|A partial check \(/m;

export function classify(op) {
  const t = String(op.text ?? ""), cats = [], flags = {};
  if (op.tool === "write_stdin") cats.push(op.empty ? "poll" : "other");
  else if (op.tool === "wait") cats.push(op.terminate ? "other" : "poll");
  else if (op.tool === "view_image") { cats.push("image-read"); if (CHECK_IMAGE.test(t)) flags.checkImage = true; }
  else if (op.tool === "apply_patch") cats.push(/deviations\.json/.test(t) ? "ledger-write" : "edit");
  else if (SHELL.has(op.tool)) {
    const check = CHECK_RUN.exec(t);
    if (check) cats.push(/--quick|--frame|--no-sweep/.test(check[1]) ? "check-quick" : "check-complete");
    const writes = WRITES.some((re) => re.test(t));
    if (writes) cats.push(/deviations\.json/.test(t) ? "ledger-write" : "edit");
    if (!check && PROBE.test(t)) cats.push("probe");
    if (READS.test(` ${t}`)) { cats.push("file-read"); if (/\.skill\//.test(t)) flags.skillDocs = true; }
    if (!cats.length) cats.push("other");
  } else cats.push("other");
  return { cats, ...flags };
}

// Recognize the shell's own result, including a code cell that printed it as JSON.
function shellResult(value) {
  if (typeof value === "string") {
    const process = /^Process (?:running with session ID (\d+)|exited with code -?\d+)\n(?:Original token count: \d+\n)?(?:Final )?Output:\n?([\s\S]*)$/mi.exec(value);
    if (process) return { session: process[1] ? Number(process[1]) : null, ended: !process[1], output: process[2] };
    try { value = JSON.parse(value); } catch { return null; }
  }
  if (typeof value?.output !== "string") return null;
  const ended = value.exit_code != null || value.metadata?.exit_code != null ? true : value.session_id != null ? false : null;
  return { session: value.session_id ?? null, ended, output: value.output };
}

function shellOutput(call, output) {
  if (!Array.isArray(output)) return shellResult(output);
  const parts = output.map((p) => p?.text);
  if (parts.length === 1) return shellResult(parts[0]);
  if (!/^Script completed\nWall time [\d.]+ seconds\nOutput:\n$/.test(parts[0])) return null;
  if (parts.length === 2) {
    const wrapped = shellResult(parts[1]);
    if (wrapped) return wrapped;
  }
  // A cell may forward stdout and the still-running session separately. A silent cell tells us nothing.
  const forward = /\btext\(\s*([\w$]+)\.output\s*\)/.exec(call.source);
  if (!forward || typeof parts[1] !== "string") return null;
  if (parts.length === 2) {
    // If the cell prints the returned session id whenever it exists, its absence also reports exit.
    const marker = /if\s*\(\s*([\w$]+)\.session_id\s*\)\s*text\(\s*`SESSION_ID=\$\{\1\.session_id\}`\s*\)/.exec(call.source);
    return { session: null, ended: marker?.[1] === forward[1] ? true : null, output: parts[1] };
  }
  const id = parts.length === 3 && /^SESSION_ID=(\d+)$/.exec(parts[2]);
  return id ? { session: Number(id[1]), ended: false, output: parts[1] } : null;
}

// Count only waits for a full check whose own command or PTY returned a full verdict.
function polling(calls) {
  const list = [], completedChecks = [], active = new Map(), awaitingExit = new Set();
  for (const c of calls) for (const op of c.ops) {
    const result = c.shell, session = Number.isSafeInteger(op.session) ? op.session : null;
    let check = op.tool === "write_stdin" ? active.get(session) : null;
    if (op.cats.includes("check-complete")) {
      check = { startCall: c.n, session: result?.session ?? null, emptyWaits: 0 };
      if (result?.session != null) active.set(result.session, check);
    } else if (SHELL.has(op.tool) && result?.session != null) active.delete(result.session);

    if (op.cats.includes("poll")) {
      const wall = c.ops.length === 1 && /Wall time:? ([\d.]+) seconds/.exec(c.text);
      const newOutput = result ? result.output !== "" : null;
      const ended = result?.ended ?? null;
      list.push({ call: c.n, tool: op.tool, nested: Boolean(op.nested), session, waitAsked: op.yield ?? null, wall: wall ? Number(wall[1]) : null, newOutput, ended });
      if (check && newOutput !== true && ended !== true) {
        if (newOutput === null || ended === null) check.emptyWaits = null;
        else if (check.emptyWaits !== null) check.emptyWaits++;
      }
    }
    if (op.tool === "write_stdin" && (op.empty || op.charsUnread) && session === null) {
      for (const possible of active.values()) possible.emptyWaits = null;
    } else if (op.charsUnread && check) check.emptyWaits = null;
    if (!check || !result) continue;
    if (verdict(result.output)?.complete) {
      check.verdict = true;
      awaitingExit.add(check.startCall);
    }
    if (result.ended !== true) continue;
    if (check.verdict) {
      completedChecks.push({ startCall: check.startCall, endCall: c.n, session: check.session, emptyWaits: check.emptyWaits });
      awaitingExit.delete(check.startCall);
    }
    active.delete(check.session);
  }
  const stdin = list.filter((p) => p.tool === "write_stdin");
  // A compound cell can print a check's verdict without identifying which operation produced it.
  const unattributedVerdicts = calls.filter((c) => c.ops.length > 1 && c.ops.some((o) => o.cats.includes("check-complete") || o.tool === "write_stdin")
    && verdict(c.text)?.complete).map((c) => c.n);
  const perCompleteCheck = !awaitingExit.size && !unattributedVerdicts.length && completedChecks.length && completedChecks.every((c) => c.emptyWaits !== null)
    ? completedChecks.reduce((n, c) => n + c.emptyWaits, 0) / completedChecks.length : null;
  // "empty" is the historical count of all poll sites, including code-cell waits.
  return { empty: list.length, emptyStdin: stdin.length, noOutput: stdin.filter((p) => p.newOutput === false).length,
    exitOnly: stdin.filter((p) => p.newOutput === false && p.ended === true).length,
    unknownOutput: stdin.filter((p) => p.newOutput === null).length, completedChecks, unconfirmedExit: [...awaitingExit], unattributedVerdicts, perCompleteCheck, waitsAsked: list.map((p) => p.waitAsked), list };
}

function addOutput(call, output, at, note) {
  call.bytes += Buffer.byteLength(JSON.stringify(output ?? ""));
  if (call.ops.length === 1 && (SHELL.has(call.ops[0].tool) || call.ops[0].tool === "write_stdin")) call.shell = shellOutput(call, output);
  call.outputAt ??= at;
  const take = (o) => {
    if (typeof o === "string") {
      // Older shell outputs are a JSON string of { output, metadata }.
      if (o.startsWith("{")) { try { const j = JSON.parse(o); if (typeof j.output === "string") { call.text += j.output; return; } } catch { /* plain text */ } }
      call.text += o;
    } else if (Array.isArray(o)) {
      for (const it of o) {
        if (it && typeof it.text === "string") call.text += it.text;
        else if (it && /image/.test(it.type ?? "")) { call.images++; call.imageBytes += Buffer.byteLength(JSON.stringify(it)); }
        else note(`output item ${it?.type ?? typeof it}`);
      }
    } else if (o && typeof o === "object") {
      if (typeof o.content === "string") take(o.content);
      if (Array.isArray(o.content_items)) take(o.content_items);
      if (typeof o.output === "string") take(o.output);
    }
  };
  take(output);
}

const usageOf = (u) => (u && typeof u === "object" ? { input: u.input_tokens ?? 0, cached: u.cached_input_tokens ?? 0, output: u.output_tokens ?? 0, reasoning: u.reasoning_output_tokens ?? 0 } : null);
const OUTER = new Set(["function_call", "custom_tool_call", "local_shell_call", "web_search_call", "tool_search_call", "image_generation_call"]);
const OUTPUTS = new Set(["function_call_output", "custom_tool_call_output", "local_shell_call_output", "tool_search_output"]);
const QUIET_ITEMS = new Set(["message", "reasoning", "agent_message", "additional_tools", "configuration_update", "compaction", "context_compaction", "compaction_trigger", "other"]);
const QUIET_LINES = new Set(["compacted", "world_state", "retained_context", "security_risk_score", "dynamic_tools_updated", "inter_agent_communication", "inter_agent_communication_metadata", "realtime_item"]);
const textOfContent = (c) => (typeof c === "string" ? c : Array.isArray(c) ? c.map((p) => (typeof p?.text === "string" ? p.text : "")).join("") : "");

// One Codex rollout log, read into calls, polls, tokens and outputs. Each line is { timestamp, type, payload }
// (older logs: the item itself); a line it cannot read, or a shape it does not know, is counted and reported.
export function parseRollout(text) {
  const unknown = new Map(), note = (k) => unknown.set(k, (unknown.get(k) ?? 0) + 1);
  const calls = [], byId = new Map(), records = [], counts = [], userTexts = [], events = new Map();
  let first = null, last = null, broken = 0, lines = 0, session = {}, aborted = 0, assistant = null, complete = null, n = 0;
  for (const raw of String(text).split("\n")) {
    n++;
    if (!raw.trim()) continue;
    lines++;
    let r;
    try { r = JSON.parse(raw); } catch { broken++; continue; }
    if (!r || typeof r !== "object" || Array.isArray(r)) { note("a line that is not an object"); continue; }
    const at = Date.parse(r.timestamp ?? "");
    if (Number.isFinite(at)) { if (first === null || at < first) first = at; if (last === null || at > last) last = at; }
    const enveloped = typeof r.type === "string" && r.payload && typeof r.payload === "object";
    const kind = enveloped ? r.type : r.type ? "response_item" : r.id && r.timestamp ? "session_meta" : r.record_type ? "state" : "untyped";
    const item = enveloped ? r.payload : r;
    const time = Number.isFinite(at) ? at : null;
    if (kind === "session_meta") {
      session = { ...session, cliVersion: item.cli_version ?? session.cliVersion, originator: item.originator ?? session.originator, cwd: session.cwd ?? item.cwd,
        helper: isHelper(item) || session.helper || false };
    } else if (kind === "turn_context") {
      session.model ??= item.model; session.effort ??= item.effort ?? item.reasoning_effort; session.cwd ??= item.cwd;
    } else if (kind === "response_item") {
      const type = item.type;
      if (OUTER.has(type)) {
        const ops = opsOf(item).map((op) => ({ ...op, ...classify(op) }));
        const call = { n: calls.length + 1, line: n, at: time, name: type === "local_shell_call" ? "local_shell" : item.name ?? type, ops, source: item.input ?? item.arguments ?? "", bytes: 0, images: 0, imageBytes: 0, text: "", outputAt: null };
        calls.push(call);
        byId.set(item.call_id ?? item.id ?? `line ${n}`, call);
      } else if (OUTPUTS.has(type)) {
        const call = byId.get(item.call_id ?? item.id);
        if (call) addOutput(call, item.output ?? item.tools, time, note); else note(`${type} without its call`);
      } else if (type === "message") {
        if (item.role === "user") userTexts.push(textOfContent(item.content));
        if (item.role === "assistant") assistant = { line: n, at: time, text: textOfContent(item.content) };
      } else if (!QUIET_ITEMS.has(type)) note(`response_item ${type}`);
    } else if (kind === "event_msg") {
      const type = item.type;
      events.set(type, (events.get(type) ?? 0) + 1);
      if (type === "token_count") { if (item.info) counts.push({ line: n, at: time, total: item.info.total_token_usage, last: item.info.last_token_usage }); }
      else if (type === "user_message") userTexts.push({ event: String(item.message ?? "") });
      else if (type === "turn_aborted") aborted++;
      else if (type === "agent_message" && !assistant) assistant = { line: n, at: time, text: String(item.message ?? ""), event: true };
      else if (type === "task_complete" || type === "turn_complete") complete = { line: n, at: time, text: item.last_agent_message ?? null };
    } else if (kind === "token_usage_record") {
      records.push({ line: n, at: time, id: item.response_id, usage: usageOf(item.usage), thread: usageOf(item.thread_token_usage) });
    } else if (!QUIET_LINES.has(kind) && kind !== "state") note(`line type ${kind}`);
  }

  // One entry per model response: Codex's own per-response record when the log has it, else each token count that
  // moved the total (a rate-limit update repeats the last one).
  const ids = new Set();
  const unique = records.filter((r) => {
    if (r.id && ids.has(r.id)) return false;
    if (r.id) ids.add(r.id);
    return true;
  });
  const advances = counts.filter((c, i) => c.total && (!i || JSON.stringify(c.total) !== JSON.stringify(counts[i - 1].total)));
  const responses = unique.length
    ? unique.filter((r) => r.usage).map((r) => ({ line: r.line, at: r.at, ...r.usage }))
    : advances.filter((c) => c.last).map((c) => ({ line: c.line, at: c.at, ...usageOf(c.last) }));
  // A call's response is the first one recorded after it: the response that asked for it.
  let k = 0;
  for (const c of calls) { while (k < responses.length && responses[k].line < c.line) k++; c.usage = responses[k] ?? null; }

  // Both snapshots are cumulative. Only add distinct responses logged after the newest snapshot.
  const count = advances.at(-1), thread = unique.findLast((r) => r.thread);
  const snapshot = thread && (!count || thread.line > count.line) ? { line: thread.line, total: thread.thread }
    : count ? { line: count.line, total: usageOf(count.total) } : null;
  let total = snapshot?.total ?? null;
  for (const r of unique) {
    if (!r.usage || r.line <= (snapshot?.line ?? 0)) continue;
    total ??= { input: 0, cached: 0, output: 0, reasoning: 0 };
    for (const key of Object.keys(total)) total[key] += r.usage[key];
  }
  const byName = {}, nestedByName = {}, byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, { calls: 0, ops: 0, bytes: 0, images: 0 }]));
  const verdicts = [];
  let spawned = 0, skillDocs = 0, checkImages = 0, sideViews = 0;
  for (const c of calls) {
    byName[c.name] = (byName[c.name] ?? 0) + 1;
    const cats = new Set(c.ops.flatMap((o) => o.cats));
    if (c.images) cats.add("image-read");
    c.category = CATEGORIES.find((x) => cats.has(x)) ?? "other";
    c.also = CATEGORIES.filter((x) => cats.has(x) && x !== c.category);
    c.checkImage = c.ops.some((o) => o.checkImage);
    c.designMjs = c.ops.some((o) => /design\.mjs/.test(o.text ?? "")) || c.checkImage || CHECK_TEXT.test(c.text);
    const shown = c.ops.filter((o) => o.tool === "view_image").map((o) => path.basename(String(o.path ?? o.text ?? ""))).filter(Boolean);
    c.content = c.images ? `${c.checkImage ? "check image" : "image"}${shown.length ? ` ${shown.join(", ")}` : ""}` : CHECK_TEXT.test(c.text) ? "check text" : "text";
    const bucket = byCategory[c.category];
    bucket.calls++; bucket.bytes += c.bytes; bucket.images += c.images;
    for (const o of c.ops) {
      if (o.nested) nestedByName[o.tool] = (nestedByName[o.tool] ?? 0) + 1;
      for (const x of o.cats) byCategory[x].ops++;
      if (o.tool === "spawn_agent") spawned++;
      if (o.skillDocs) skillDocs++;
      if (o.checkImage) checkImages++;
      if (o.tool === "view_image" && /side\.png/.test(o.text ?? "")) sideViews++;
    }
    const v = verdict(c.shell?.output ?? c.text);
    if (v) verdicts.push({ call: c.n, ...v });
  }
  const started = { complete: 0, quick: 0 };
  for (const c of calls) for (const o of c.ops) { if (o.cats.includes("check-complete")) started.complete++; if (o.cats.includes("check-quick")) started.quick++; }
  const firstComplete = verdicts.find((v) => v.complete) ?? null;
  // A code-mode cell need not print what its nested check returned: the call that started it is kept too.
  const firstCompleteStarted = calls.find((c) => c.ops.some((o) => o.cats.includes("check-complete")))?.n ?? null;
  const lastCall = calls.at(-1) ?? null;
  const lastWithUsage = [...calls].reverse().find((c) => c.usage) ?? null;
  const at = (i) => { const c = calls[i - 1]; return c ? { call: i, ...(c.usage ? { input: c.usage.input, cached: c.usage.cached, uncached: c.usage.input - c.usage.cached, output: c.usage.output } : { unavailable: true }) } : null; };
  const inputAt = [1, 15, 30, 60].filter((i) => i <= calls.length).map(at);
  if (calls.length && ![1, 15, 30, 60].includes(calls.length)) inputAt.push({ ...at(calls.length), last: true });
  if (lastCall && !lastCall.usage && lastWithUsage) inputAt.push({ ...at(lastWithUsage.n), lastRecorded: true });
  const user = userTexts.map((u) => (typeof u === "string" ? u : u.event));
  // Event messages are what the person typed; response items also carry injected context (<environment_context>, AGENTS.md).
  const typed = userTexts.some((u) => typeof u !== "string") ? userTexts.filter((u) => typeof u !== "string").map((u) => u.event) : user.filter((t) => t.trim() && !/^\s*(<|# AGENTS\.md)/.test(t));
  // The worker's last word after its last call; a handover if its turn also ended there (not a stop mid-turn).
  const after = (x) => x && (!lastCall || x.line > lastCall.line);
  const said = after(assistant) ? assistant : after(complete) && complete.text ? complete : null;
  const final = said ? { at: said.at, text: said.text, turnComplete: Boolean(after(complete)) } : null;
  return {
    format: { lines, broken, unknown: Object.fromEntries(unknown), events: Object.fromEntries(events), tokens: records.length ? "token_usage_record" : counts.length ? "token_count" : "none" },
    session, wall: { first: iso(first), last: iso(last), seconds: first !== null ? Math.round(last - first) / 1000 : null },
    calls: { total: calls.length, byName, nestedByName, byCategory, skillDocReads: skillDocs, checkImageViews: checkImages, sidePngViews: sideViews,
      toHandover: final?.turnComplete ? calls.length : null },
    polls: polling(calls),
    spawnAgent: spawned,
    checks: { started, verdicts, firstComplete, firstCompleteStarted },
    tokens: { total: total ? { ...total, uncached: total.input - total.cached } : null, responses: responses.length, firstRequestInput: responses[0]?.input ?? null,
      peakInput: responses.length ? Math.max(...responses.map((r) => r.input)) : null, cachedPerCall: total && calls.length ? Math.round(total.cached / calls.length) : null,
      inputAt, lastCallUsageMissing: Boolean(lastCall && !lastCall.usage) },
    largest: [...calls].sort((a, b) => b.bytes - a.bytes).slice(0, 10).map((c) => ({ call: c.n, name: c.name, category: c.category, bytes: c.bytes, images: c.images, content: c.content, designMjs: c.designMjs })),
    user: { messages: typed.length, interventions: Math.max(0, typed.length - 1), aborted, first: typed[0] ?? null },
    final: final ? { ...final, at: iso(final.at) } : null,
    lastCall: lastCall ? { call: lastCall.n, at: iso(lastCall.at), outputAt: iso(lastCall.outputAt), category: lastCall.category } : null,
    list: calls.map((c) => ({ call: c.n, at: iso(c.at), name: c.name, category: c.category, ...(c.also.length ? { also: c.also } : {}),
      ops: c.ops.map((o) => `${o.nested ? "tools." : ""}${o.tool}${o.cats.length ? `:${o.cats.join("+")}` : ""}`), bytes: c.bytes, images: c.images,
      ...(c.usage ? { input: c.usage.input, cached: c.usage.cached, output: c.usage.output } : {}) })),
  };
}
// A session another one started: a spawned agent, or Codex's own (a permission reviewer), by its session_meta.
const isHelper = (meta) => Boolean(meta?.parent_thread_id || (meta?.source && typeof meta.source === "object" && ("subagent" in meta.source || "internal" in meta.source)));
const iso = (t) => (t === null || t === undefined || !Number.isFinite(t) ? null : new Date(t).toISOString());

// Where a phase starts, by what the calls did: before the first edit or check, the build, the check loop to the last
// check, and the handover after it. The environment's own setup is not in the log: it is setup's smoke test.
export function phases(list, responsesEnd) {
  const idx = (pred) => list.findIndex(pred), lastIdx = (pred) => list.length - 1 - [...list].reverse().findIndex(pred);
  const isCheck = (c) => c.category.startsWith("check-") || (c.also ?? []).some((x) => x.startsWith("check-"));
  const firstCheck = idx(isCheck), firstEdit = idx((c) => c.category === "edit" || (c.also ?? []).includes("edit"));
  const lastCheck = firstCheck < 0 ? -1 : lastIdx(isCheck);
  const starts = firstCheck < 0 ? (firstEdit < 0 ? [] : [["build", firstEdit]]) : [...(firstEdit >= 0 && firstEdit < firstCheck ? [["build", firstEdit]] : []), ["checkLoop", firstCheck], ...(lastCheck + 1 < list.length ? [["handover", lastCheck + 1]] : [])];
  const bounds = [["preparation", 0], ...starts].filter(([, s], i, a) => i === a.length - 1 || a[i + 1][1] > s);
  const out = { environment: null };
  bounds.forEach(([name, s], i) => {
    const e = i + 1 < bounds.length ? bounds[i + 1][1] : list.length;
    const part = list.slice(s, e);
    if (!part.length) return;
    const end = i + 1 < bounds.length ? list[e].at : responsesEnd;
    out[name] = { calls: part.length, from: part[0].call, to: part.at(-1).call, seconds: part[0].at && end ? (Date.parse(end) - Date.parse(part[0].at)) / 1000 : null,
      peakInput: Math.max(0, ...part.map((c) => c.input ?? 0)) || null };
  });
  return out;
}

// A rollout file as text, compressed (Codex compresses logs older than a week to .jsonl.zst) or not.
export function readRollout(file) {
  if (!file.endsWith(".zst")) return fs.readFileSync(file, "utf8");
  if (typeof zlib.zstdDecompressSync === "function") return zlib.zstdDecompressSync(fs.readFileSync(file)).toString("utf8");
  const r = spawnSync("zstd", ["-dc", file], { encoding: "utf8", maxBuffer: 1 << 30 });
  if (r.status === 0) return r.stdout;
  throw new Error(`${file} is compressed and neither this Node nor a zstd command can read it: zstd -d it first`);
}

function firstLine(file) {
  if (file.endsWith(".zst")) { try { return readRollout(file).split("\n")[0]; } catch { return ""; } }
  const fd = fs.openSync(file, "r"), chunk = Buffer.alloc(1 << 20), parts = [];
  try {
    for (let read, total = 0; (read = fs.readSync(fd, chunk, 0, chunk.length, total)) > 0 && total < 16 << 20; total += read) {
      const nl = chunk.subarray(0, read).indexOf(10);
      parts.push(Buffer.from(chunk.subarray(0, nl < 0 ? read : nl)));
      if (nl >= 0) break;
    }
  } finally { fs.closeSync(fd); }
  return Buffer.concat(parts).toString("utf8");
}

// The sessions opened in the project since setup: the worker's (no parent) and its helpers'.
export function findRollouts(project, since, codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex")) {
  const sessions = path.join(codexHome, "sessions"), found = [];
  if (!fs.existsSync(sessions)) return { sessions, worker: [], helpers: [] };
  const want = new Set([path.resolve(project), real(project)]);
  for (const f of walk(sessions)) {
    if (!/^rollout-.*\.jsonl(\.zst)?$/.test(path.basename(f)) || fs.statSync(f).mtimeMs < since - 60_000) continue;
    let meta;
    try { const r = JSON.parse(firstLine(f)); meta = r.payload ?? r; } catch { continue; }
    if (!meta?.cwd || !(want.has(meta.cwd) || want.has(real(meta.cwd)))) continue;
    found.push({ file: f, helper: isHelper(meta), started: meta.timestamp ?? null });
  }
  return { sessions, worker: found.filter((f) => !f.helper).map((f) => f.file), helpers: found.filter((f) => f.helper).map((f) => f.file) };
}

// ------------------------------------------------------------------ setup

function gitState(project) {
  const g = (...a) => spawnSync("git", ["-C", project, ...a], { encoding: "utf8" });
  if (g("rev-parse", "--is-inside-work-tree").stdout?.trim() !== "true") return null;
  const head = g("rev-parse", "HEAD");
  if (head.status !== 0) return null;
  return { head: head.stdout.trim(), g };
}
// The files that differ from HEAD (tracked) or are new (untracked, not ignored), relative to the project.
function gitChanged(project, git, head) {
  const list = (r) => (r.stdout ?? "").split("\0").filter(Boolean);
  return [...new Set([...list(git.g("diff", "--name-only", "--relative", "-z", head)), ...list(git.g("ls-files", "--others", "--exclude-standard", "-z"))])]
    .filter((rel) => !excluded(rel)).sort();
}
const excluded = (rel) => rel.split("/").some((part) => SKIP.has(part) || BUILT.has(part)) || HARNESS.has(rel);
// Without git: every file but dependencies, build output, the skill and the check's out/, by hash.
function tree(project) {
  const outs = new Set(outDirs(project));
  const files = {};
  for (const f of walk(project, (name, p) => SKIP.has(name) || BUILT.has(name) || outs.has(p))) { const k = keyOf(project, f); if (!HARNESS.has(k)) files[k] = fileHash(f); }
  return files;
}

function seeds(project) {
  const returns = path.join(project, ".design", "returns.md"), brief = path.join(project, ".brief.md");
  const r = fs.existsSync(returns) ? fs.readFileSync(returns, "utf8") : null, b = fs.existsSync(brief) ? fs.readFileSync(brief, "utf8") : null;
  const lines = r === null ? [] : r.split("\n").filter((l) => l.trim());
  // The check reads only list items ("- …", "1. …") of returns.md as acceptance rows.
  const items = lines.filter((l) => /^\s*(?:[-*+]|\d+[.)])\s+\S/.test(l));
  return {
    returns: { exists: r !== null, lines: lines.length, items: items.length },
    brief: { exists: b !== null && b.trim().length > 0, closing: b !== null && b.replace(/\s+/g, " ").includes(CLOSING) },
  };
}

export const defaultBaseline = (project, run) => path.join(os.homedir(), ".entrust-real-run", `${path.basename(project)}-${run}.baseline.json`);

export function codexRule(project, run) {
  const forms = [path.join(project, SKILL_SCRIPT), SKILL_SCRIPT, `../${SKILL_SCRIPT}`, `../../${SKILL_SCRIPT}`];
  return [`# design-to-code real run ${run}: the check in ${project} starts Chromium outside the sandbox`, "prefix_rule(", '    pattern = ["node", [',
    ...forms.map((f) => `        ${JSON.stringify(f)},`), "    ]],", '    decision = "allow",', '    justification = "The design-to-code check starts Chromium",', ")", ""].join("\n");
}

function setup(project, flags) {
  const run = flags.run ?? "A";
  if (!flags.skill) usage("setup needs --skill <commit>: the version under test, never a branch's head");
  if (!flags.originals.length) usage("setup needs --originals <path>...: the references, specs if given, the data contract and the frames' data");
  if (!fs.existsSync(project) || !fs.statSync(project).isDirectory()) usage(`${project} is not a folder`);
  const baselineFile = path.resolve(flags.baseline ?? defaultBaseline(project, run)), stem = baselineFile.replace(/\.baseline\.json$|\.json$/, "");
  const problems = [], say = (s = "") => console.log(s);
  const repo = path.resolve(flags.repo ?? REPO);
  const commit = spawnSync("git", ["-C", repo, "rev-parse", "--verify", `${flags.skill}^{commit}`], { encoding: "utf8" });
  if (commit.status !== 0) usage(`no commit ${flags.skill} in ${repo}`);
  const full = commit.stdout.trim();
  say(`Real run ${run} in ${project}, the skill at ${full.slice(0, 10)}`);

  // A baseline is recorded once per run: a second setup may only repeat it, unless the run has not started (--force).
  const originals = hashOriginals(project, flags.originals);
  const hash = inputsHash(originals.files);
  if (fs.existsSync(baselineFile) && !flags.force) {
    const old = readJson(baselineFile);
    if (old.inputsHash !== hash) usage(`${baselineFile} holds other originals (recorded ${old.recorded}): if run ${run} has not started, pass --force to record them again; otherwise collect it first`);
  }

  // 1. The skill, as arm.mjs prepare puts it. Its prompt is the brief plus the skill's paths, so without a brief it
  // would carry a placeholder: the skill waits for the brief.
  const seed = seeds(project);
  if (seed.brief.exists) {
    const r = spawnSync(process.execPath, [ARM, "prepare", project, "--skill", full, "--repo", repo], { encoding: "utf8" });
    if (r.status !== 0) { problems.push("the skill did not install"); say(`1. Skill: arm.mjs prepare failed: ${(r.stderr || r.stdout).trim()}`); }
    else say(`1. Skill: ${r.stdout.trim()}`);
  } else { problems.push(".brief.md"); say("1. Skill: not installed yet: its prompt is made from .brief.md, which is missing (write it, then run setup again)"); }

  // 2. The baseline, outside the project, so that nothing in the run can change it.
  for (const m of originals.missing) problems.push(`the original ${m}`);
  const git = gitState(project);
  const dirty = {};
  if (git) for (const rel of gitChanged(project, git, git.head)) { const f = path.join(project, rel); dirty[rel] = fs.existsSync(f) ? fileHash(f) : "deleted"; }
  const count = Object.keys(originals.files).length;
  say(`2. Baseline: ${count} files under ${originals.roots.join(", ")}${originals.missing.length ? ` (missing: ${originals.missing.join(", ")})` : ""}; inputs hash ${hash.slice(0, 12)}; ${git ? `git HEAD ${git.head.slice(0, 10)}${Object.keys(dirty).length ? `, ${Object.keys(dirty).length} files already changed or untracked` : ""}` : "not a git repository: the whole tree is hashed instead"}`);
  say(`   in ${baselineFile}, the originals copied to ${stem}.originals`);

  // 3. The seeds only the owner can write (30-terra-run.md, section 2): checked, never written.
  const seedLines = [];
  if (!seed.returns.exists) { problems.push(".design/returns.md"); seedLines.push("missing .design/returns.md: the owner's past returns, one per line, as said"); }
  else if (!seed.returns.lines) { problems.push(".design/returns.md is empty"); seedLines.push(".design/returns.md is empty"); }
  else seedLines.push(`.design/returns.md: ${plural(seed.returns.lines, "line", "lines")}, ${seed.returns.items === seed.returns.lines ? "each a list item" : `${seed.returns.items} of them list items (the check reads only list items, "- …", as acceptance rows)`}`);
  if (!seed.brief.exists) seedLines.push("missing .brief.md: the task as usually given, each field's longest value or \"unbounded\", the narrowest supported width, and the closing sentence");
  else {
    seedLines.push(`.brief.md: present${seed.brief.closing ? ", with the closing sentence" : ", without the closing sentence of 30-terra-run.md section 3"}; its bounds and narrowest width are not checked here`);
    if (!seed.brief.closing) problems.push("the brief's closing sentence");
    const prompt = path.join(project, ".prompt.md");
    seedLines.push(fs.existsSync(prompt) ? `.prompt.md: ${prompt}` : "missing .prompt.md");
  }
  say(`3. Seeds: ${seedLines.join("\n   ")}`);

  // 4. The Codex rule: appended, never written over (Codex keeps the owner's own allow-list in that file).
  const rule = codexRule(project, run), ruleFile = `${stem}.rules`, script = path.join(project, SKILL_SCRIPT);
  writeFile(ruleFile, rule);
  const rules = path.join(process.env.CODEX_HOME || path.join(os.homedir(), ".codex"), "rules", "default.rules");
  const present = fs.existsSync(rules) && fs.readFileSync(rules, "utf8").includes(JSON.stringify(script));
  say("4. The Codex rule, so that the check runs outside the sandbox without a prompt:");
  say(rule.trimEnd().split("\n").map((l) => `   ${l}`).join("\n"));
  say(present ? `   It is already in ${rules}: do not append it twice.` : `   Append it to ~/.codex/rules/default.rules, never overwrite that file:\n     cat ${quote(ruleFile)} >> ~/.codex/rules/default.rules`);
  say("   Test it, expecting allow for each, then restart Codex:");
  say(`     codex execpolicy check --pretty --rules ~/.codex/rules/default.rules -- node ${script} check design.json`);
  say(`     codex execpolicy check --pretty --rules ~/.codex/rules/default.rules -- node ../../${SKILL_SCRIPT} check design.json --quick`);
  say("   A command that starts with a variable or uses a redirection is matched whole and prompts: a prompt for the check means Terra wrote it another way; note how.");

  // 5. Chromium, from the project folder, as the check resolves Playwright. Not the check itself: its first round is Terra's.
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 20) problems.push(`Node ${process.versions.node} (20 or later)`);
  const t0 = Date.now();
  const smoke = spawnSync(process.execPath, ["-e", 'require("playwright").chromium.launch().then((b) => b.close()).then(() => console.log("Chromium starts"))'], { cwd: project, encoding: "utf8", timeout: 120_000 });
  const ok = smoke.status === 0 && /Chromium starts/.test(smoke.stdout);
  const seconds = Math.round((Date.now() - t0) / 100) / 10;
  const why = ok ? "" : (smoke.error?.message ?? smoke.stderr.trim().split("\n").find((l) => /Error|Cannot|not found|Executable/.test(l)) ?? smoke.stderr.trim().split("\n").at(-1) ?? `exit ${smoke.status}`);
  if (!ok) problems.push("Chromium");
  say(`5. Chromium: ${ok ? `starts from the project (${seconds} s), Node ${process.versions.node}` : `did not start from the project: ${why}\n   In ${project}: npm i -D playwright, then npx playwright install chromium; then run setup again`}`);

  // 6. The first message: the prompt, then the owner's approval line word for word.
  const firstMessage = `Read ${path.join(project, ".prompt.md")} and do the task it gives.\n\n${APPROVAL}\n`;
  writeFile(`${stem}.first-message.md`, firstMessage);
  say(`6. The first message to Terra, in a fresh Codex session opened in ${project} at your usual effort (also in ${stem}.first-message.md):`);
  say("   ---");
  say(firstMessage.trimEnd().split("\n").map((l) => (l ? `   ${l}` : "")).join("\n"));
  say("   ---");

  const copy = `${stem}.originals`;
  copyOriginals(project, originals.files, copy);
  writeFile(baselineFile, {
    kind: "design-to-code real-run baseline", run, project, recorded: new Date().toISOString(),
    skill: { commit: full, asked: flags.skill }, git: git ? { head: git.head, dirty } : null,
    originals: { roots: originals.roots, files: originals.files, copy: copy }, inputsHash: hash,
    tree: git ? null : tree(project), seeds: seed, smoke: { ok, seconds, ...(ok ? {} : { why }) }, node: process.versions.node,
    approval: APPROVAL, firstMessage, rule: ruleFile,
  });

  const self = path.relative(process.cwd(), fileURLToPath(import.meta.url)) || fileURLToPath(import.meta.url);
  say();
  if (run === "A") {
    const b = `${project}-B`;
    const roots = originals.roots.map(quote).join(" ");
    say(`Run B, the replicate: copy the project and set it up now, before you start run A, so that B starts where A does and both rules are in before the one restart of Codex (a restart during run A would stop it):\n  cp -R ${quote(project)} ${quote(b)}\n  node ${self} setup ${quote(b)} --skill ${full.slice(0, 10)} --originals ${roots} --run B`);
  }
  say(`When Terra hands over at pass or pending (or you stop it), and before you start anything else in the project:\n  node ${self} collect ${quote(project)} --run ${run}${flags.baseline ? ` --baseline ${quote(baselineFile)}` : ""}`);
  say("It finds the session's log under ~/.codex/sessions; pass --rollout <file> if it finds none or several.");
  if (problems.length) { say(`\nNot ready: ${problems.join("; ")}.`); process.exitCode = 1; }
  else say("\nReady.");
}

// ------------------------------------------------------------------ collect

// The evidence's timing against the worker's last call: a round or a handoff.md written after the log's last line
// was written by a check the worker never saw end (39-terra-045-rerun.md, "Frozen boundary and a late check").
export function boundary(parsed, latestRound, handoff, roundTimes = []) {
  const lastAt = parsed?.lastCall?.at ? Date.parse(parsed.lastCall.at) : null, outAt = parsed?.lastCall?.outputAt ? Date.parse(parsed.lastCall.outputAt) : null;
  const end = parsed?.wall?.last ? Date.parse(parsed.wall.last) : null;
  const read = (t) => {
    if (t === null || lastAt === null) return { olderThanLastCall: null, reading: lastAt === null ? "no call in the log to read it against" : null };
    if (t <= lastAt) return { olderThanLastCall: true, reading: "written before the worker's last call" };
    if (outAt !== null && t <= outAt) return { olderThanLastCall: false, reading: "written by the worker's last call, whose output the worker received" };
    if (end !== null && t > end) return { olderThanLastCall: false, reading: "checker-generated after the stop: written after the log's last line, not a worker handover" };
    return { olderThanLastCall: false, reading: "written during the worker's last call, whose output the log does not hold" };
  };
  return {
    lastCall: parsed?.lastCall ?? null, logEnd: parsed?.wall?.last ?? null, workerHandedOver: Boolean(parsed?.final?.turnComplete),
    roundsAfterLogEnd: end === null ? null : roundTimes.filter((t) => t > end).length,
    latestRound: latestRound ? { ...latestRound, ...read(latestRound.at) , at: iso(latestRound.at) } : null,
    handoff: handoff ? { ...handoff, ...read(handoff.mtime), mtime: iso(handoff.mtime) } : null,
  };
}

export function form(run, ledgerProposals) {
  const questions = ledgerProposals.length
    ? ledgerProposals.map((e) => `\n   - ${e}: fair / unfinished`).join("")
    : " (list each question the handover puts to you, each fair / unfinished)";
  return [`# Run ${run}: your verdict`, "",
    "1. The verdict as seen (the running component against the design): accepted / returned — why:",
    "2. The verdict as read (the handover and the code it points to): accepted / returned — why:",
    `3. Each question in the handover, fair (the design or the contract is silent or contradicts itself) or unfinished (the builder could have settled it):${questions}`,
    "4. Who found each defect (the checker, the builder's handover, the blind review, you):",
    "5. Your review minutes:", ""].join("\n");
}

function collect(project, flags) {
  const run = flags.run ?? "A";
  const baselineFile = path.resolve(flags.baseline ?? defaultBaseline(project, run));
  if (!fs.existsSync(baselineFile)) usage(`no baseline at ${baselineFile}: run setup first, or pass --baseline`);
  const baseline = readJson(baselineFile);
  const outDir = path.resolve(flags.out ?? path.dirname(baselineFile));
  const tarFile = path.join(outDir, `real-run-${run}.tar`);
  if (fs.existsSync(tarFile)) usage(`${tarFile} exists: a frozen run is not written over; pass another --out`);
  const say = (s = "") => console.log(s);

  // The logs: the worker's, and any helper's.
  let worker, helpers;
  if (flags.rollout.length) [worker, ...helpers] = flags.rollout.map((f) => path.resolve(f));
  else {
    const logs = findRollouts(project, Date.parse(baseline.recorded));
    if (logs.worker.length !== 1) usage(logs.worker.length ? `several sessions were opened in ${project} since setup; pass --rollout with the worker's:\n  ${logs.worker.join("\n  ")}`
      : `no session log under ${logs.sessions} was opened in ${project} since setup: pass --rollout <file> (ls -t ~/.codex/sessions/*/*/*/rollout-*.jsonl | head)`);
    [worker] = logs.worker; helpers = logs.helpers;
  }
  for (const f of [worker, ...helpers]) if (!fs.existsSync(f)) usage(`no rollout log at ${f}`);

  // 1. Nothing is frozen beside a check in flight.
  const quiet = waitQuiet(project, Number(flags.wait ?? 300), Number(flags.quiet ?? 10));
  if (!quiet.ok) {
    if (quiet.state.unknown) console.error(`Cannot verify whether a check is running: ${quiet.state.unknown}. Nothing was frozen.`);
    else console.error(`A design.mjs check is still running for ${project} (${describeFlight(quiet.state)}).\nNothing was frozen. Let it end, or stop it, then run collect again; a round it writes after the worker stopped is recorded as the checker's, not the worker's.`);
    process.exit(3);
  }
  if (quiet.waited) say(`The check ended; waited ${quiet.waited} s.`);
  const frozenAt = new Date().toISOString();

  // 2. The inputs against the baseline.
  const now = hashOriginals(project, baseline.originals.roots);
  const diff = diffFiles(baseline.originals.files, now.files);
  const changedInputs = diff.changed.length + diff.removed.length + diff.added.length > 0;
  const deltas = {};
  const copy = baseline.originals.copy;
  const pristine = copy && fs.existsSync(copy) ? Object.entries(baseline.originals.files).every(([k, h]) => fs.existsSync(copyPath(copy, k)) && fileHash(copyPath(copy, k)) === h) : false;
  for (const k of diff.changed) {
    const before = pristine ? textOf(copyPath(copy, k)) : null, after = textOf(fromKey(project, k));
    if (before === null || after === null) continue;
    const d = lineDelta(before, after);
    deltas[k] = { removed: d.removed.slice(0, 20), added: d.added.slice(0, 20), counts: [d.removed.length, d.added.length] };
  }
  const byHash = new Map(Object.entries(baseline.originals.files).map(([k, h]) => [h, k]));
  const found = checks(project);
  const builderMade = found.map((c) => {
    const at = (p) => (p ? path.resolve(c.dir, String(p).split(/[?#]/)[0]) : null);
    const frames = (c.cfg?.frames ?? []).map((f) => {
      const spec = at(f.spec), ref = at(f.reference);
      const refHash = ref && fs.existsSync(ref) ? fileHash(ref) : null;
      return { name: f.name, width: f.width ?? null, spec: spec ? keyOf(project, spec) : null, specExists: Boolean(spec && fs.existsSync(spec)), reference: ref ? keyOf(project, ref) : null,
        referenceIs: !ref ? "none" : !refHash ? "missing" : byHash.get(refHash) ? `byte-identical to the original ${byHash.get(refHash)} as recorded` : "not byte-identical to any original", ...(f.tolerance !== undefined ? { tolerance: f.tolerance } : {}) };
    });
    return { config: keyOf(project, c.file), ...(c.error ? { error: c.error } : {}), tolerance: c.cfg?.tolerance ?? null, toleranceDefault: 1, frames };
  });

  // 3. The check's state: rounds, the evidence file and the ledger.
  const states = found.map((c) => {
    const historyFile = path.join(c.out, "history.jsonl"), history = readLines(historyFile);
    const handoffFile = path.join(c.out, "handoff.md");
    const handoff = fs.existsSync(handoffFile) ? { file: keyOf(project, handoffFile), status: fs.readFileSync(handoffFile, "utf8").split("\n")[0], mtime: fs.statSync(handoffFile).mtimeMs } : null;
    let ledger = [];
    try { ledger = fs.existsSync(c.ledger) ? readJson(c.ledger) : []; } catch { ledger = null; }
    const r = rounds(history, c.cfg?.frames?.length ?? null);
    const lastAt = r.last ? Math.max(Date.parse(r.last.time) || 0, fs.statSync(historyFile).mtimeMs) : null;
    return { config: keyOf(project, c.file), rounds: r, roundTimes: history.map((h) => Date.parse(h.time)).filter(Number.isFinite), latestRound: r.last ? { round: r.last.round, status: r.last.status, quick: r.last.quick, at: lastAt } : null, handoff,
      ledgerFile: keyOf(project, c.ledger), ledger };
  });
  const main = [...states].sort((a, b) => (b.handoff?.mtime ?? b.latestRound?.at ?? 0) - (a.handoff?.mtime ?? a.latestRound?.at ?? 0))[0] ?? null;

  // 4. The logs.
  const parsed = parseRollout(readRollout(worker));
  const helperRuns = helpers.map((f) => { const p = parseRollout(readRollout(f)); return { file: path.basename(f), model: p.session.model ?? null, effort: p.session.effort ?? null, calls: p.calls.total, tokens: p.tokens.total, seconds: p.wall.seconds }; });
  const cwdMatches = parsed.session.cwd ? [path.resolve(project), real(project)].includes(parsed.session.cwd) || real(parsed.session.cwd) === real(project) : null;
  const expectedApproval = typeof baseline.approval === "string" && baseline.approval.trim() ? baseline.approval.replace(/\s+/g, " ").trim() : null;
  const sentApproval = parsed.user.first && expectedApproval ? parsed.user.first.replace(/\s+/g, " ").includes(expectedApproval) : null;
  const bound = boundary(parsed, main?.latestRound ?? null, main?.handoff ?? null, main?.roundTimes ?? []);
  const handoffReading = !main?.handoff ? "no evidence file: the complete check was not run last" : bound.handoff.reading;

  // 5. The component's changed files.
  let changed = [], removedFiles = [], headNow = null;
  const git = baseline.git ? gitState(project) : null;
  if (baseline.git && git) {
    headNow = git.head;
    for (const rel of gitChanged(project, git, baseline.git.head)) {
      const f = path.join(project, rel), h = fs.existsSync(f) ? fileHash(f) : "deleted";
      if (baseline.git.dirty?.[rel] === h) continue;
      (h === "deleted" ? removedFiles : changed).push(rel);
    }
  } else if (baseline.tree) {
    const d = diffFiles(baseline.tree, tree(project));
    changed = [...d.changed, ...d.added]; removedFiles = d.removed;
  }

  const ledgerEntries = Array.isArray(main?.ledger) ? main.ledger : [];
  const proposals = ledgerEntries.filter((e) => e?.status === "proposed").map((e) => `${[].concat(e.landmark ?? []).join(", ") || "?"}${e.property ? ` (${e.property})` : ""}: ${String(e.reason ?? "").replace(/\s+/g, " ").slice(0, 120)}`);
  const tally = (key) => ledgerEntries.reduce((a, e) => ({ ...a, [e?.[key] ?? "none"]: (a[e?.[key] ?? "none"] ?? 0) + 1 }), {});
  const callList = parsed.list;
  const record = {
    kind: "design-to-code real-run record", run, project: path.basename(project), collected: frozenAt,
    parser: "Codex rollout parser; unknown or unprinted poll results are reported as unknown",
    fields: {
      "1 revision": { skill: baseline.skill.commit, case: `${path.basename(project)}, run ${run}`, inputsHash: baseline.inputsHash, model: parsed.session.model ?? null, effort: parsed.session.effort ?? null, codex: parsed.session.cliVersion ?? null },
      "2 first checkpoint": { verdict: null, class: null, foundBy: null, from: `form-${run}.md` },
      "3 handover": { status: main?.handoff?.status ?? null, reading: handoffReading, workerHandedOver: Boolean(parsed.final?.turnComplete), checkerCausedFailures: null },
      "4 phases": phases(callList, parsed.wall.last),
      "5 check rounds": main ? main.rounds : null,
      "6 totals": { ...(parsed.tokens.total ?? {}), calls: parsed.calls.total, cachedPerCall: parsed.tokens.cachedPerCall },
      "7 interventions and helpers": { messagesAfterTheFirst: parsed.user.interventions, turnsAborted: parsed.user.aborted, approvalLineSent: sentApproval, spawnAgent: parsed.spawnAgent, helpers: helperRuns },
      "8 ledger": { file: main?.ledgerFile ?? null, entries: ledgerEntries.length, byStatus: tally("status"), byCategory: tally("category"), proposed: proposals },
    },
    inputs: { verdict: changedInputs ? "INPUTS CHANGED" : "INPUTS INTACT", ...diff, lines: deltas, builderMade },
    component: { git: baseline.git ? { head: baseline.git.head, headNow, moved: Boolean(headNow && headNow !== baseline.git.head) } : null, changed, removed: removedFiles },
    boundary: bound,
    originalsCopy: pristine ? "in the archive under originals/, byte-identical to the baseline's hashes" : "missing or altered: the archive carries no originals",
    freeze: { at: frozenAt, waitedSeconds: quiet.waited, checksSeen: quiet.seen.map((p) => p.pid) },
    checks: states.map(({ ledger, latestRound, handoff, roundTimes, ...s }) => ({ ...s, handoff: handoff ? { ...handoff, mtime: iso(handoff.mtime) } : null })),
    rollout: { file: path.basename(worker), cwdMatchesProject: cwdMatches, format: parsed.format, wall: parsed.wall, calls: parsed.calls, polls: parsed.polls, spawnAgent: parsed.spawnAgent,
      checks: parsed.checks, tokens: parsed.tokens, largest: parsed.largest, lastCall: parsed.lastCall, list: callList },
  };
  const blank = form(run, proposals);

  // 6. The archive: the check's folders whole, the component's changed files, the harness files, and the record.
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), "real-run-")), base = `real-run-${run}`, into = path.join(stage, base);
  let files = 0;
  try {
    const take = new Set();
    if (fs.existsSync(path.join(project, ".design"))) take.add(".design");
    for (const c of found) { take.add(keyOf(project, c.file)); for (const p of [c.out, c.ledger, c.review]) if (fs.existsSync(p)) take.add(keyOf(project, p)); }
    for (const rel of [...changed, ...HARNESS]) if (fs.existsSync(path.join(project, rel))) take.add(rel);
    const taken = [...take].filter((rel) => !path.isAbsolute(rel) && !rel.startsWith("..")).sort();
    for (const rel of taken) {
      if (taken.some((t) => rel.startsWith(`${t}/`))) continue;
      const from = path.join(project, rel), to = path.join(into, "project", rel);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.cpSync(from, to, { recursive: true, preserveTimestamps: true, force: true });
    }
    files = walk(path.join(into, "project")).length;
    if (pristine) fs.cpSync(copy, path.join(into, "originals"), { recursive: true, preserveTimestamps: true, verbatimSymlinks: true });
    record.archive = { file: path.basename(tarFile), projectFiles: files };
    writeFile(path.join(into, `record-${run}.json`), record);
    writeFile(path.join(into, `form-${run}.md`), blank);
    writeFile(path.join(into, `baseline-${run}.json`), baseline);
    if (parsed.final?.text) writeFile(path.join(into, `handover-${run}.md`), `${parsed.final.text.trimEnd()}\n`);
    fs.mkdirSync(outDir, { recursive: true });
    const tar = spawnSync("tar", ["-cf", tarFile, "-C", stage, base], { encoding: "utf8" });
    if (tar.status !== 0) throw new Error(`tar failed: ${tar.stderr}`);
  } finally { fs.rmSync(stage, { recursive: true, force: true }); }
  const tarHash = sha(fs.readFileSync(tarFile));
  writeFile(`${tarFile}.sha256`, `${tarHash}  ${path.basename(tarFile)}\n`);
  writeFile(path.join(outDir, `record-${run}.json`), record);
  writeFile(path.join(outDir, `form-${run}.md`), blank);
  if (parsed.final?.text) writeFile(path.join(outDir, `handover-${run}.md`), `${parsed.final.text.trimEnd()}\n`);

  // What the owner reads now.
  say(`Frozen: ${tarFile} · sha256 ${tarHash.slice(0, 12)} · ${files} project files${pristine ? `, ${Object.keys(baseline.originals.files).length} originals as recorded` : "; the originals' copy is missing or altered"}`);
  say(record.inputs.verdict);
  for (const [label, list] of [["changed", diff.changed], ["removed", diff.removed], ["added", diff.added]]) for (const k of list) say(`  ${label}: ${k}${deltas[k] ? ` (${deltas[k].counts[0]} lines removed, ${deltas[k].counts[1]} added)` : ""}`);
  say("Builder-made, outside the hash; the blind review covers them:");
  if (!builderMade.length) say("  no design.json in the project");
  for (const b of builderMade) {
    say(`  ${b.config}: tolerance ${b.tolerance ?? "unset"} (default 1)${b.error ? `; does not parse: ${b.error}` : ""}`);
    for (const f of b.frames) say(`    ${f.name}: spec ${f.spec ?? "none"}${f.specExists ? "" : " (missing)"}; reference ${f.reference ?? "none"}, ${f.referenceIs}${f.tolerance !== undefined ? `; tolerance ${f.tolerance}` : ""}`);
  }
  say(`Handover: ${main?.handoff ? `${main.handoff.status} (${handoffReading})` : handoffReading}; the worker's last message: ${!parsed.final ? "none after its last call" : parsed.final.turnComplete ? "its handover, the turn ended" : "after its last call, but the turn did not end"}`);
  if (main && !main.rounds.total) say(`Rounds: none; ledger: ${plural(ledgerEntries.length, "entry", "entries")}`);
  else if (main) say(`Rounds: ${main.rounds.total} (${main.rounds.quick} quick, ${main.rounds.complete} complete), the last ${main.rounds.last?.status ?? "—"}${bound.roundsAfterLogEnd ? `; ${bound.roundsAfterLogEnd} written after the log's last line, by a check the worker never saw end` : ""}; ledger: ${plural(ledgerEntries.length, "entry", "entries")}, ${proposals.length} proposed`);
  say(`Component: ${plural(changed.length, "file", "files")} changed${removedFiles.length ? `, ${removedFiles.length} removed` : ""}${record.component.git?.moved ? "; HEAD moved since setup" : ""}`);
  const cats = CATEGORIES.filter((c) => parsed.calls.byCategory[c].calls).map((c) => `${c} ${parsed.calls.byCategory[c].calls}`).join(", ");
  say(`Calls: ${parsed.calls.total} (${Object.entries(parsed.calls.byName).map(([k, v]) => `${k} ${v}`).join(", ")}${Object.keys(parsed.calls.nestedByName).length ? `; inside exec: ${Object.entries(parsed.calls.nestedByName).map(([k, v]) => `${k} ${v}`).join(", ")}` : ""})`);
  say(`  by what they did: ${cats || "—"}`);
  const waits = [...new Set(parsed.polls.waitsAsked.map(String))].map((w) => `${w === "null" ? "none asked" : `${w} ms`} ×${parsed.polls.waitsAsked.filter((x) => String(x) === w).length}`).join(", ");
  say(`  empty-stdin polls ${parsed.polls.emptyStdin}; no output ${parsed.polls.noOutput} (${parsed.polls.exitOnly} reported exit); unknown output ${parsed.polls.unknownOutput}`);
  say(`  still-running polls without output per completed full check: ${parsed.polls.perCompleteCheck ?? "unknown"} (${parsed.polls.completedChecks.length} matched; counts: ${parsed.polls.completedChecks.map((c) => c.emptyWaits ?? "?").join(", ") || "none"}; unmatched verdicts: ${parsed.polls.unattributedVerdicts.length}; unconfirmed exits: ${parsed.polls.unconfirmedExit.length})`);
  say(`  waits asked: ${waits || "none"}; spawn_agent ${parsed.spawnAgent}; the first complete check's status at call ${parsed.checks.firstComplete ? `${parsed.checks.firstComplete.call} (${parsed.checks.firstComplete.status})` : "— (none)"}`);
  const t = parsed.tokens.total;
  say(`Tokens: ${t ? `uncached ${num(t.uncached)}, cached ${num(t.cached)}, output ${num(t.output)}` : "no token count in the log"}${parsed.tokens.lastCallUsageMissing ? "; the last call's usage was not recorded" : ""}`);
  say(`  input per call: ${parsed.tokens.inputAt.map((i) => `${i.call}${i.last ? " (last)" : i.lastRecorded ? " (last recorded)" : ""}: ${i.unavailable ? "unavailable" : num(i.input)}`).join(", ") || "—"}; the first request ${num(parsed.tokens.firstRequestInput)}`);
  say(`Largest outputs: ${parsed.largest.slice(0, 10).map((o) => `call ${o.call} ${num(o.bytes)} B ${o.content}${o.designMjs ? " (design.mjs)" : ""}`).join("; ") || "—"}`);
  say(`Wall: ${clock(parsed.wall.seconds)}, ${parsed.wall.first ?? "?"} to ${parsed.wall.last ?? "?"}`);
  if (cwdMatches === false) say(`Warning: this log's session was opened in another folder than ${project}: is it the run's?`);
  if (sentApproval === false) say("Warning: the first message does not carry the approval line word for word.");
  const unknown = Object.entries(parsed.format.unknown);
  if (parsed.format.broken || unknown.length) say(`Not read from the log: ${[parsed.format.broken ? `${parsed.format.broken} lines that are not JSON` : null, ...unknown.map(([k, v]) => `${k} ×${v}`)].filter(Boolean).join(", ")}`);
  say(`\nWritten: ${path.join(outDir, `record-${run}.json`)}, ${path.join(outDir, `form-${run}.md`)}${parsed.final?.text ? `, ${path.join(outDir, `handover-${run}.md`)}` : ""}`);
  say(`Fill in ${path.join(outDir, `form-${run}.md`)} after your review, and send it with ${tarFile}.`);
}
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const clock = (s) => { if (s == null) return "—"; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = (s % 60).toFixed(1).padStart(4, "0"); return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`; };

// ------------------------------------------------------------------ the command line

const USAGE = "usage: real-run.mjs setup <project> --skill <commit> --originals <path>... [--baseline <file>] [--run A|B] [--force]\n       (each original relative to <project>, or absolute)\n       real-run.mjs collect <project> [--rollout <rollout.jsonl>]... [--baseline <file>] [--run A|B] [--out <dir>] [--wait <s>] [--quiet <s>]";
function usage(why) { console.error(`${why}\n${USAGE}`); process.exit(2); }

export function parseArgs(argv) {
  const [command, target, ...rest] = argv;
  const flags = { originals: [], rollout: [] };
  const known = new Set(["skill", "originals", "baseline", "run", "force", "rollout", "out", "wait", "quiet", "repo"]);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (!a.startsWith("--") || !known.has(a.slice(2))) throw new Error(`unknown argument ${a}`);
    const name = a.slice(2);
    if (name === "force") flags.force = true;
    else if (name === "originals") { while (i + 1 < rest.length && !rest[i + 1].startsWith("--")) flags.originals.push(rest[++i]); }
    else if (i + 1 >= rest.length) throw new Error(`${a} needs a value`);
    else if (name === "rollout") flags.rollout.push(rest[++i]);
    else flags[name] = rest[++i];
  }
  if (flags.run !== undefined && !/^[A-Za-z0-9_-]{1,20}$/.test(flags.run)) throw new Error(`--run ${flags.run}: a short name, A or B`);
  return { command, target, flags };
}

if (process.argv[1] && real(process.argv[1]) === real(fileURLToPath(import.meta.url))) {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) { console.log(USAGE); process.exit(0); }
  let args;
  try { args = parseArgs(argv); } catch (e) { usage(e.message); }
  if (!["setup", "collect"].includes(args.command) || !args.target) usage(args.command ? `no command ${args.command}, or no project` : "no command");
  const project = path.resolve(args.target);
  if (args.command === "setup") setup(project, args.flags); else collect(project, args.flags);
}
