#!/usr/bin/env node
// prepare-feedback.mjs — the private folder of one /entrust:prepare-feedback run, kept under the plugin's data
// directory beside the orchestrate runs and written by this script alone: a coordinator is refused every write
// under that directory, while a subprocess handed the path as an argument writes it unopposed.
//
//   node prepare-feedback.mjs corpus   --slug <slug> [--plugin entrust|terse] [--version <v>|<v>..<v>|unknown]…
//                                      [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--project <cwd>]…
//                                      [--session <session-id>]… [--all-sessions]
//   node prepare-feedback.mjs parts    --run <run>
//   node prepare-feedback.mjs add      --run <run> --name <relative name> --from <file>
//   node prepare-feedback.mjs coverage --run <run> --map <tsv>
//   node prepare-feedback.mjs quotes   --run <run> --episodes <jsonl>
//   node prepare-feedback.mjs tokens   --run <run> --reports <dir> | --from <tsv> [--median <n>]
//   node prepare-feedback.mjs export   --run <run> --to <relative dir>
//
// A run is <state>/prepare-feedback/<date>-<slug>/ with corpus/index.json, corpus/turns.jsonl, corpus/parts/,
// corpus/pages/, corpus/parts.json, ledger/, measures/, drafts/, anonymized/ and rounds.md. The transcripts stay
// where Claude Code keeps them: the index maps each task to its files (T3, its forks T3.f1, its subagents T3.s2),
// and turns.jsonl holds the text of their turns, each addressed by a task and a line of its JSONL (T3:282).
// Events are read from parsed records, never from raw lines, so a quoted marker is not an event. Nothing in a
// run is overwritten: a scope narrowed after the plan is a new --slug. export copies what a report publishes to
// a new directory named relative to the working directory, never under the state directory, and nothing it
// copies was written with a machine path in it. Summary lines print last, RUN= the very last, so a runner's
// tail keeps them.
//
// Environment: ENTRUST_STATE_DIR, else CLAUDE_PLUGIN_DATA (absolute; no default of its own); transcripts under
// $CLAUDE_CONFIG_DIR/projects, else ~/.claude/projects; Codex rollouts under $CODEX_HOME/sessions, else
// ~/.codex/sessions. The runs root <state>/prepare-feedback must be a real directory, never a symbolic link.
// Exit: 0 done; 2 usage, or no state directory, or a path that is not what the command needs; 10 refused — a
// run, a cut or a file that already exists, a step before the one it needs, a destination that exists or lies
// under the state directory; 1 a write failed.

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const EXIT = { OK: 0, FAILED: 1, USAGE: 2, REFUSED: 10 };
const PLUGINS = ["entrust", "terse"];
const SELF = "prepare-feedback";
const PART_CHARS = 60000, PAGE_CHARS = 18000, OVERLAP_TURNS = 3, OVERLAP_CHARS = 6000;
const NEAR = 0.6, NEAR_WORDS = 300, NEAR_CANDIDATES = 20;
const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const ADDABLE = /^(?:(?:ledger|measures|anonymized)(?:\/[A-Za-z0-9_][A-Za-z0-9._-]*)+|drafts\/\d{2,}-report\.md|rounds\.md)$/;
const OPTIONS = {
  corpus: { one: ["slug", "plugin", "since", "until"], many: ["version", "project", "session"], flags: ["all-sessions"] },
  parts: { one: ["run"] },
  add: { one: ["run", "name", "from"] },
  coverage: { one: ["run", "map"] },
  quotes: { one: ["run", "episodes"] },
  tokens: { one: ["run", "reports", "from", "median"] },
  export: { one: ["run", "to"] },
};
const COMMANDS = Object.keys(OPTIONS);

// The records these are read from, as Claude Code and the entrust driver write them: a skill load is a meta
// user record whose text block starts with LOAD and the skill's directory; a refusal is an error tool_result
// that opens with the Skill tool's refusal; a Codex launch is a REPORT= line in the result of a command the
// session ran (LAUNCHERS), or before that epoch a threadId and a receiptPath there, never a quotation of them
// in a file read or an agent's return; a subagent's totals come in the Agent tool's return, or for a
// background agent in the task notification that reports it done.
const LOAD = "Base directory for this skill: ";
const REFUSAL = /^\s*<tool_use_error>Skill (\S+) cannot be used with Skill tool due to disable-model-invocation/;
const LAUNCHERS = new Set(["Bash", "BashOutput", "TaskOutput"]);
// A command whose first word is one of these reads a file, and a threadId it prints is a quotation, not a
// launch; words before it that only set up (cd, sleep, an assignment) are passed over. Reading back a background
// command's own .output file is that command's output, and stays a launch.
const READERS = new Set("cat head tail grep egrep fgrep rg sed awk jq yq less more nl wc cut sort uniq ls find diff cmp xxd od strings file stat tr column zcat zgrep".split(" "));
const PRELUDE = new Set(["cd", "sleep", "export", "set", "true"]);
const CACHED = /\/plugins\/cache\/nowely\/([^/]+)\/([^/]+)\/skills\/([^/]+)\/?$/;
const CHECKOUT = /\/plugins\/([^/]+)\/plugin\/skills\/([^/]+)\/?$/;
const NOT_HUMAN = /^\s*(?:<task-notification>|<local-command-(?:stdout|stderr|caveat)>|\[Request interrupted)/;
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const REPORT_LINE = /^REPORT=(\/\S+\.json)[ \t\r]*$/gm;
const THREAD = new RegExp(`\\bthreadId["']?\\s*[:=]\\s*["']?(${UUID})`, "g");
const RECEIPT = /\breceiptPath["']?\s*[:=]\s*["']?([^"'\s,]+\.jsonl)/g;
const ROLLOUT = new RegExp(`^rollout-.*-(${UUID})\\.jsonl$`);

const usage = () => `prepare-feedback.mjs — the private folder of one /entrust:prepare-feedback run, under the plugin's data directory

  corpus   --slug <slug> [--plugin entrust|terse] [--version <v>|<v>..<v>|unknown]... [--since YYYY-MM-DD]
           [--until YYYY-MM-DD] [--project <cwd>]... [--session <session-id>]... [--all-sessions]
                  make <state>/prepare-feedback/<date>-<slug>/ with corpus/index.json and corpus/turns.jsonl;
                  prints PROJECT= lines, then the counts, then RUN=
  parts    --run <run>
                  cut corpus/turns.jsonl into corpus/parts/P###.md of about 60,000 characters, each overlapping the
                  one before by up to three turns, and corpus/pages/P###-NN.md of at most 18,000; corpus/parts.json
                  lists each part's pages and their sha256
  add      --run <run> --name <relative name> --from <file>
                  place a file as rounds.md, drafts/NN-report.md, or under ledger/, measures/ or anonymized/
  coverage --run <run> --map <tsv>
                  lines agent-id<TAB>report.json<TAB>P###[,P###]; a page was read when its whole text is inside one
                  output the agent's model was shown (a *_output item of the rollout the report's threadId names),
                  raw or JSON-escaped; writes measures/coverage-<name>.json
  quotes   --run <run> --episodes <jsonl>
                  lines {"quote": ..., "id": ...}, other fields passed through; exact (the same words, whitespace
                  aside), near (at least 60 percent of the quote's words in order, with the closest text) or missing,
                  each with its turn as t:line; writes ledger/quotes-<name>.json
  tokens   --run <run> --reports <dir> | --from <tsv> [--median <n>]
                  <dir>/*/report.json (tokenUsage.total.totalTokens) or lines agent<TAB>tokens; the batch's median
                  and maximum, and with --median the agents above three times <n>; writes measures/tokens-<name>.json
  export   --run <run> --to <relative dir>
                  copy drafts/*.md, rounds.md, measures/ and anonymized/ unchanged into <dir>, which must not exist

Scope: corpus takes the sessions that loaded entrust or terse (--plugin: that one), or with --all-sessions every
session with a human message, and never one that loaded this skill's page, the current one included; --version
(repeatable; unknown matches a load from a checkout, whose path carries no version), --since and --until (UTC
dates) and --project (that directory and every directory below it) narrow them. --session restricts the scope to
the sessions it names and takes each one past every other option, this skill's runs included. Forks of one
conversation, the same human messages at the same times, are one task. PLUGINS= and HUMAN_SESSIONS= count tasks
before the scope, SELF_RUNS= the tasks that loaded this skill, which index.json lists; checkout= counts the
tasks with a checkout load that every option but --version keeps and no cache load in the --version range keeps
already, the ones a further --version unknown would add. CODEX_RUNS= counts a REPORT= line in a command's output,
or a threadId there when the command does not read a file (cat, grep, sed, head, tail, jq and the like; reading a
background command's .output file back is that command's output).
turns.jsonl holds one line per turn, {"t","line","role","text"}: user (a human message, or a subagent's brief),
assistant (its text blocks) and tool_error (a failed tool's result), from every task (T3), fork (T3.f1) and
subagent (T3.s2); thinking, tool calls and successful tool results stay in the transcript. A subagent is a
transcript directly under <session>/subagents/; workflow agents below it are not read. <name> is the input's
basename without its extension. coverage and tokens print their per-agent lines before their summary line.

Environment: ENTRUST_STATE_DIR, else CLAUDE_PLUGIN_DATA (absolute); CLAUDE_CONFIG_DIR, else ~/.claude, for the
transcripts; CODEX_HOME, else ~/.codex, for the rollouts. Nothing is overwritten, ever.
Exit: 0 done; 2 usage, no state directory, or a wrong kind of path; 10 refused (exists, out of order,
destination taken or under the state directory); 1 a write failed.
`;

function fail(code, msg) { process.stderr.write(`prepare-feedback: ${msg}\n`); process.exit(code); }
const say = (lines) => process.stdout.write(lines.map((l) => `${l}\n`).join(""));
const cmpStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const isFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const inside = (p, dir) => p === dir || p.startsWith(dir + path.sep);
const addr = (turn) => `${turn.t}:${turn.line}`;

function parse(cmd, argv) {
  const spec = OPTIONS[cmd];
  const out = {};
  for (const k of spec.many ?? []) out[k] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) fail(EXIT.USAGE, `unexpected argument: ${a}`);
    const key = a.slice(2);
    if ((spec.flags ?? []).includes(key)) { out[key] = true; continue; }
    const many = (spec.many ?? []).includes(key);
    if (!many && !spec.one.includes(key)) fail(EXIT.USAGE, `${cmd} has no --${key}; --help lists its options`);
    const v = argv[i + 1];
    if (v === undefined || v.startsWith("--")) fail(EXIT.USAGE, `--${key} needs a value`);
    if (many) out[key].push(v);
    else if (out[key] !== undefined) fail(EXIT.USAGE, `--${key} is given twice`);
    else out[key] = v;
    i++;
  }
  return out;
}

function stateDir() {
  const named = process.env.ENTRUST_STATE_DIR ? "ENTRUST_STATE_DIR" : process.env.CLAUDE_PLUGIN_DATA ? "CLAUDE_PLUGIN_DATA" : null;
  if (!named) fail(EXIT.USAGE, "no state directory: set ENTRUST_STATE_DIR, or pass CLAUDE_PLUGIN_DATA");
  const s = process.env[named];
  if (!path.isAbsolute(s)) fail(EXIT.USAGE, `${named} is not absolute: ${s}`);
  let st;
  try { st = fs.statSync(s); } catch { fail(EXIT.USAGE, `${named} does not exist: ${s}`); }
  if (!st.isDirectory()) fail(EXIT.USAGE, `${named} is not a directory: ${s}`);
  return fs.realpathSync(s);
}

// The runs root is a real directory directly under the state directory; a symbolic link there would let a run
// land anywhere, so it is refused rather than followed.
function root(state) {
  const r = path.join(state, "prepare-feedback");
  let st = null;
  try { st = fs.lstatSync(r); } catch {}
  if (st && st.isSymbolicLink()) fail(EXIT.USAGE, `the runs root is a symbolic link, which this script never follows: ${r}`);
  if (st && !st.isDirectory()) fail(EXIT.USAGE, `the runs root is not a directory: ${r}`);
  return r;
}

// The run the caller names must be one corpus made: a real directory one level under the runs root, reached
// through no symbolic link.
function runDir(opt, state) {
  if (!opt.run) fail(EXIT.USAGE, "--run <run> is required");
  if (!path.isAbsolute(opt.run)) fail(EXIT.USAGE, `--run is not absolute: ${opt.run}`);
  let real, st;
  try { real = fs.realpathSync(opt.run); st = fs.statSync(real); } catch { fail(EXIT.USAGE, `--run does not exist: ${opt.run}`); }
  if (!st.isDirectory()) fail(EXIT.USAGE, `--run is not a directory: ${opt.run}`);
  const r = root(state);
  if (path.dirname(real) !== r || path.resolve(opt.run) !== real) fail(EXIT.USAGE, `--run is not a run under ${r}: ${opt.run}`);
  return real;
}

function readSource(p, what) {
  if (!p) fail(EXIT.USAGE, `${what} is required`);
  let st;
  try { st = fs.statSync(p); } catch { fail(EXIT.USAGE, `${what} does not exist: ${p}`); }
  if (!st.isFile()) fail(EXIT.USAGE, `${what} is not a regular file: ${p}`);
  try { return fs.readFileSync(p); } catch (e) { fail(EXIT.USAGE, `${what} cannot be read: ${p}: ${e.message}`); }
}

function makeDir(dir) {
  try { fs.mkdirSync(dir, { recursive: true, mode: 0o700 }); } catch (e) { fail(EXIT.FAILED, `cannot make ${dir}: ${e.message}`); }
}

// Every write is create-only: an existing target is a refusal, never a rewrite.
function place(dst, body) {
  try { fs.writeFileSync(dst, body, { mode: 0o600, flag: "wx" }); }
  catch (e) {
    if (e.code === "EEXIST") fail(EXIT.REFUSED, `already there, not rewritten: ${dst}`);
    fail(EXIT.FAILED, `write failed: ${dst}: ${e.message}`);
  }
}

// The same for a file of lines too large to hold twice: written in slices as the lines are made.
function placeLines(dst, lines) {
  let fd;
  try { fd = fs.openSync(dst, "wx", 0o600); }
  catch (e) {
    if (e.code === "EEXIST") fail(EXIT.REFUSED, `already there, not rewritten: ${dst}`);
    fail(EXIT.FAILED, `write failed: ${dst}: ${e.message}`);
  }
  try {
    let buf = [], size = 0;
    for (const l of lines) {
      buf.push(`${l}\n`); size += l.length;
      if (size > 1 << 20) { fs.writeSync(fd, buf.join("")); buf = []; size = 0; }
    }
    if (buf.length) fs.writeSync(fd, buf.join(""));
    fs.closeSync(fd);
  } catch (e) { fail(EXIT.FAILED, `write failed: ${dst}: ${e.message}`); }
}

function* records(file) {
  let raw;
  try { raw = fs.readFileSync(file, "utf8"); } catch { return; }
  let line = 0;
  for (const l of raw.split("\n")) {
    line++;
    if (!l) continue;
    let r;
    try { r = JSON.parse(l); } catch { continue; }
    if (r && typeof r === "object" && !Array.isArray(r)) yield [line, r];
  }
}

const textOf = (c) => (typeof c === "string" ? c : Array.isArray(c)
  ? c.filter((b) => b && b.type === "text" && typeof b.text === "string").map((b) => b.text).join("\n\n") : "");
const resultText = (b) => (typeof b.content === "string" ? b.content : textOf(b.content));
const hasResult = (c) => Array.isArray(c) && c.some((b) => b && b.type === "tool_result");

// A person's message in a main transcript: not meta, not a compaction summary, not a tool result, and not
// the harness speaking in the user's place (a task notification, a local command's output, an interruption).
function humanText(r) {
  if (r.type !== "user" || r.isMeta || r.isCompactSummary || r.isSidechain) return null;
  if (r.origin && typeof r.origin === "object" && r.origin.kind !== "human") return null;
  const c = r.message?.content;
  if (hasResult(c)) return null;
  const text = textOf(c);
  return text.trim() && !NOT_HUMAN.test(text) ? text : null;
}

// In a subagent's transcript the user turns are its brief and the messages sent to it.
function briefText(r) {
  if (r.type !== "user" || r.isMeta || hasResult(r.message?.content)) return null;
  const text = textOf(r.message?.content);
  return text.trim() && !NOT_HUMAN.test(text) ? text : null;
}

function loadOf(dir) {
  let m = CACHED.exec(dir);
  if (m) return PLUGINS.includes(m[1]) ? { plugin: m[1], version: m[2], source: "cache", skill: m[3] } : null;
  m = CHECKOUT.exec(dir);
  if (m) return PLUGINS.includes(m[1]) ? { plugin: m[1], version: "unknown", source: "checkout", skill: m[2] } : null;
  return null;
}

function transcripts(home) {
  const out = [];
  for (const d of fs.readdirSync(home, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    let names = [];
    try { names = fs.readdirSync(path.join(home, d.name), { withFileTypes: true }); } catch { continue; }
    for (const f of names) if (f.isFile() && f.name.endsWith(".jsonl")) out.push(path.join(home, d.name, f.name));
  }
  return out.sort();
}

// What selection needs from one main transcript: its dates and directory, its human messages, the plugin
// loads and refusals, and whether it ran this skill.
function survey(file) {
  const s = { file, session: path.basename(file, ".jsonl"), cwd: null, first: null, last: null, humans: [], loads: [], refusals: [], self: false };
  try { s.born = fs.statSync(file).birthtimeMs; } catch { s.born = 0; }
  for (const [line, r] of records(file)) {
    const ts = typeof r.timestamp === "string" ? r.timestamp : null;
    if (ts && (!s.first || ts < s.first)) s.first = ts;
    if (ts && (!s.last || ts > s.last)) s.last = ts;
    if (!s.cwd && typeof r.cwd === "string") s.cwd = r.cwd;
    if (r.type !== "user") continue;
    const c = r.message?.content;
    if (r.isMeta) {
      if (Array.isArray(c)) for (const b of c) {
        if (!b || b.type !== "text" || typeof b.text !== "string" || !b.text.startsWith(LOAD)) continue;
        const l = loadOf(b.text.slice(LOAD.length).split("\n")[0].trim());
        if (!l) continue;
        if (l.plugin === "entrust" && l.skill === SELF) s.self = true;
        else s.loads.push({ line, ts, ...l });
      }
      continue;
    }
    if (Array.isArray(c)) for (const b of c) {
      if (!b || b.type !== "tool_result" || !b.is_error) continue;
      const skill = REFUSAL.exec(resultText(b))?.[1];
      if (!skill) continue;
      const plugin = skill && skill.includes(":") ? skill.split(":")[0] : null;
      if (PLUGINS.includes(plugin)) s.refusals.push({ line, ts, skill, plugin });
    }
    const h = humanText(r);
    if (h !== null) s.humans.push({ line, ts, text: h });
  }
  return s;
}

function readsFile(command) {
  if (/\.output\b/.test(command)) return false;
  for (const seg of command.split(/\n|&&|\|\||;/)) {
    const words = seg.trim().split(/\s+/).filter(Boolean);
    while (words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[0])) words.shift();
    if (!words.length) continue;
    const w = path.basename(words[0].replace(/^["']|["']$/g, ""));
    if (!PRELUDE.has(w)) return READERS.has(w);
  }
  return false;
}

function launchesIn(text) {
  const reports = [...new Set([...text.matchAll(REPORT_LINE)].map((m) => m[1]))];
  const threads = [...new Set([...text.matchAll(THREAD)].map((m) => m[1]))];
  const receipts = [...new Set([...text.matchAll(RECEIPT)].map((m) => m[1]))];
  if (reports.length) return reports.map((report) => ({ report, threadId: reports.length === 1 && threads.length === 1 ? threads[0] : null, receipt: null }));
  if (threads.length) return threads.map((threadId) => ({ report: null, threadId, receipt: receipts.find((p) => p.includes(threadId)) ?? null }));
  return receipts.map((receipt) => ({ report: null, threadId: ROLLOUT.exec(path.basename(receipt))?.[1] ?? null, receipt }));
}

// Every turn, usage record, Agent return and Codex launch one transcript holds, in line order.
function scan(file, sub) {
  const found = { first: null, turns: [], usage: [], agents: [], launches: [] };
  const tools = new Map();
  for (const [line, r] of records(file)) {
    const ts = typeof r.timestamp === "string" ? r.timestamp : "";
    if (ts && (!found.first || ts < found.first)) found.first = ts;
    const c = r.message?.content;
    if (r.type === "assistant") {
      if (Array.isArray(c)) for (const b of c) if (b && b.type === "tool_use")
        tools.set(b.id, { name: b.name, command: typeof b.input?.command === "string" ? b.input.command : "" });
      const text = textOf(c);
      if (text.trim()) found.turns.push({ line, ts, role: "assistant", text });
      if (r.message?.usage && typeof r.message.id === "string") found.usage.push([r.message.id, r.message.usage]);
      continue;
    }
    if (r.type !== "user") continue;
    if (Array.isArray(c)) for (const b of c) {
      if (!b || b.type !== "tool_result") continue;
      const text = resultText(b);
      if (b.is_error && text.trim()) found.turns.push({ line, ts, role: "tool_error", text });
      const tool = tools.get(b.tool_use_id);
      if (tool && LAUNCHERS.has(tool.name) && /REPORT=|threadId|receiptPath/.test(text)) {
        const read = readsFile(tool.command);
        for (const l of launchesIn(text)) if (l.report || !read) found.launches.push({ line, ...l });
      }
    }
    const u = r.toolUseResult;
    if (u && typeof u === "object" && typeof u.agentId === "string")
      found.agents.push({ agentId: u.agentId, tokens: u.totalTokens, durationMs: u.totalDurationMs, toolUses: u.totalToolUseCount, model: u.resolvedModel });
    const note = textOf(c);
    if (!sub && note.trimStart().startsWith("<task-notification>")) {
      const tag = (name) => new RegExp(`<${name}>([^<]*)</${name}>`).exec(note)?.[1];
      if (tag("task-id") && /^\d+$/.test(tag("subagent_tokens") ?? ""))
        found.agents.push({ agentId: tag("task-id"), tokens: Number(tag("subagent_tokens")), durationMs: Number(tag("duration_ms")) || undefined, toolUses: Number(tag("tool_uses")) || undefined });
    }
    const text = sub ? briefText(r) : humanText(r);
    if (text !== null) found.turns.push({ line, ts, role: "user", text });
  }
  return found;
}

// threadId -> rollout files under the Codex sessions directory, walked once and only when a launch needs it.
function rolloutIndex(dir) {
  let index = null;
  return () => {
    if (index) return index;
    index = new Map();
    const walk = (d) => {
      let entries;
      try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) { walk(p); continue; }
        const m = ROLLOUT.exec(e.name);
        if (m) { if (!index.has(m[1])) index.set(m[1], []); index.get(m[1]).push(p); }
      }
    };
    walk(dir);
    for (const v of index.values()) v.sort();
    return index;
  };
}

// One launch seen twice (a fork's copy, a status line printed again) is one run; a thread seen before its
// REPORT= line is the reported run.
function resolveRuns(launches, rollouts) {
  const runs = new Map();
  for (const l of launches) {
    const key = l.report ? `report\u0000${l.report}` : l.threadId ? `thread\u0000${l.threadId}` : `receipt\u0000${l.receipt}`;
    const r = runs.get(key);
    if (!r) runs.set(key, { at: l.at, report: l.report, threadId: l.threadId, receipt: l.receipt, reportFound: false });
    else { r.threadId ??= l.threadId; r.receipt ??= l.receipt; }
  }
  const all = [...runs.values()];
  for (const r of all) {
    if (!r.report) continue;
    const rep = readJson(r.report);
    r.reportFound = rep !== null;
    if (rep && typeof rep.threadId === "string") r.threadId = rep.threadId;
  }
  const reported = new Set(all.filter((r) => r.report && r.threadId).map((r) => r.threadId));
  return all.filter((r) => r.report || !reported.has(r.threadId)).map((r) => ({
    at: r.at, report: r.report, reportFound: r.reportFound, threadId: r.threadId, receipt: r.receipt,
    rollout: (r.threadId && rollouts().get(r.threadId)?.[0]) || (r.receipt && isFile(r.receipt) ? r.receipt : null),
  }));
}

// One task: its main transcript, its forks and every subagent under them, as an index entry and turns.
function gather(files, id, rollouts) {
  const [main, ...forks] = files;
  const entry = {
    id, session: main.session, path: main.file, cwd: main.cwd,
    first: main.first, last: files.map((s) => s.last).filter(Boolean).sort().at(-1) ?? null,
    self: files.some((s) => s.self),
    forks: forks.map((s, k) => ({ id: `${id}.f${k + 1}`, session: s.session, path: s.file })),
    humanMessages: 0, turns: 0, chars: 0,
    tokens: { input: 0, cacheWrite: 0, cacheRead: 0, output: 0 },
    loads: [], refusals: [], subagents: [], codex: [],
  };
  const turns = [], seen = new Set(), agents = new Map(), launches = [];
  const once = (key) => {
    const k = sha256(key);
    return seen.has(k) ? false : (seen.add(k), true);
  };
  const turn = (t, x) => {
    if (!once(`turn\u0000${x.role}\u0000${x.ts}\u0000${x.text}`)) return;
    turns.push({ t, line: x.line, role: x.role, text: x.text });
    entry.turns++; entry.chars += x.text.length;
    if (x.role === "user" && !t.includes(".s")) entry.humanMessages++;
  };
  files.forEach((s, k) => {
    const t = k === 0 ? id : entry.forks[k - 1].id;
    for (const l of s.loads) if (once(`load\u0000${l.ts}\u0000${l.plugin}\u0000${l.version}\u0000${l.skill}`))
      entry.loads.push({ at: `${t}:${l.line}`, plugin: l.plugin, version: l.version, source: l.source, skill: l.skill });
    for (const x of s.refusals) if (once(`refusal\u0000${x.ts}\u0000${x.skill}`))
      entry.refusals.push({ at: `${t}:${x.line}`, skill: x.skill, plugin: x.plugin });
    const found = scan(s.file, false);
    for (const x of found.turns) turn(t, x);
    for (const [mid, u] of found.usage) if (once(`usage\u0000${mid}`)) {
      entry.tokens.input += u.input_tokens ?? 0; entry.tokens.cacheWrite += u.cache_creation_input_tokens ?? 0;
      entry.tokens.cacheRead += u.cache_read_input_tokens ?? 0; entry.tokens.output += u.output_tokens ?? 0;
    }
    for (const a of found.agents) {
      const known = agents.get(a.agentId) ?? {};
      for (const [k, v] of Object.entries(a)) if (v !== undefined && v !== null) known[k] = v;
      agents.set(a.agentId, known);
    }
    for (const l of found.launches) launches.push({ ...l, at: `${t}:${l.line}` });
  });
  const subs = [], agentIds = new Set();
  for (const s of files) {
    const d = path.join(path.dirname(s.file), s.session, "subagents");
    let names = [];
    try { names = fs.readdirSync(d, { withFileTypes: true }).filter((e) => e.isFile() && /^agent-.+\.jsonl$/.test(e.name)).map((e) => e.name).sort(); } catch {}
    for (const n of names) {
      const agentId = n.slice("agent-".length, -".jsonl".length);
      if (agentIds.has(agentId)) continue;
      agentIds.add(agentId);
      subs.push({ file: path.join(d, n), agentId, found: scan(path.join(d, n), true) });
    }
  }
  subs.sort((a, b) => cmpStr(a.found.first ?? "", b.found.first ?? "") || cmpStr(a.file, b.file));
  subs.forEach((x, k) => {
    const t = `${id}.s${k + 1}`;
    const meta = readJson(x.file.replace(/\.jsonl$/, ".meta.json")) ?? {};
    const ret = agents.get(x.agentId);
    entry.subagents.push({
      id: t, path: x.file, agentId: x.agentId, type: meta.agentType ?? null, description: meta.description ?? null,
      tokens: ret?.tokens ?? null, durationMs: ret?.durationMs ?? null, toolUses: ret?.toolUses ?? null, model: ret?.model ?? null,
    });
    for (const y of x.found.turns) turn(t, y);
    for (const l of x.found.launches) launches.push({ ...l, at: `${t}:${l.line}` });
  });
  entry.codex = resolveRuns(launches, rollouts);
  return { entry, turns };
}

const header = (x) => `[${addr(x)} ${x.role}]\n`;
const blockOf = (x) => `${header(x)}${x.text}\n\n`;
const blockSize = (x) => header(x).length + x.text.length + 2;

// Parts of at most PART_CHARS, one turn longer than that alone excepted; each part after the first opens with
// up to OVERLAP_TURNS turns of the one before, when they fit in OVERLAP_CHARS and leave room for the next turn.
function cut(sizes) {
  const parts = [];
  let cur = [], size = 0, fresh = 0;
  for (let i = 0; i < sizes.length; i++) {
    const n = sizes[i];
    if (fresh && size + n > PART_CHARS) {
      parts.push(cur);
      let carry = [], c = 0;
      for (let j = cur.length - 1; j >= 0 && carry.length < OVERLAP_TURNS && c + sizes[cur[j]] <= OVERLAP_CHARS; j--) { carry.unshift(cur[j]); c += sizes[cur[j]]; }
      while (carry.length && c + n > PART_CHARS) c -= sizes[carry.shift()];
      cur = carry; size = c; fresh = 0;
    }
    cur.push(i); size += n; fresh++;
  }
  if (fresh) parts.push(cur);
  return parts;
}

function splitAt(s, max) {
  const nl = s.lastIndexOf("\n", max - 1);
  let k = nl >= max / 2 ? nl + 1 : max;
  const c = s.charCodeAt(k - 1);
  if (c >= 0xd800 && c <= 0xdbff) k--;
  return k;
}

// Pages of at most PAGE_CHARS, cut between turns, and inside a turn only when the turn alone is longer.
function paginate(blocks) {
  const pages = [];
  let cur = "";
  for (let b of blocks) {
    if (cur && cur.length + b.length > PAGE_CHARS) { pages.push(cur); cur = ""; }
    while (b.length > PAGE_CHARS) { const k = splitAt(b, PAGE_CHARS); pages.push(b.slice(0, k)); b = b.slice(k); }
    cur += b;
  }
  if (cur) pages.push(cur);
  return pages;
}

// Every --version value as one test of a load's version: X.Y.Z, X.Y.Z..X.Y.Z, or unknown for a load whose
// path carries none (a checkout); a load matches when any of them does.
function versionTest(values) {
  if (!values.length) return null;
  const tests = values.map((v) => {
    if (v === "unknown") return (x) => x === "unknown";
    const [a, b = a, ...rest] = v.split("..");
    if (rest.length || !SEMVER.test(a) || !SEMVER.test(b)) fail(EXIT.USAGE, `--version is <v>, <v>..<v> or unknown, each <v> X.Y.Z: ${v}`);
    const lo = a.split(".").map(Number), hi = b.split(".").map(Number);
    if (cmpVersion(lo, hi) > 0) fail(EXIT.USAGE, `--version runs backwards: ${v}`);
    return (x) => SEMVER.test(x) && cmpVersion(x.split(".").map(Number), lo) >= 0 && cmpVersion(x.split(".").map(Number), hi) <= 0;
  });
  return (x) => tests.some((t) => t(x));
}
const cmpVersion = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const isDay = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;

function corpus(opt, state) {
  if (!opt.slug || !NAME.test(opt.slug)) fail(EXIT.USAGE, "--slug <slug> is required: lower-case letters, digits and hyphens");
  if (opt.plugin !== undefined && !PLUGINS.includes(opt.plugin)) fail(EXIT.USAGE, `--plugin is one of ${PLUGINS.join(", ")}: ${opt.plugin}`);
  const versions = versionTest(opt.version);
  for (const k of ["since", "until"]) if (opt[k] !== undefined && !isDay(opt[k])) fail(EXIT.USAGE, `--${k} is not a YYYY-MM-DD date: ${opt[k]}`);
  if (opt.since && opt.until && opt.since > opt.until) fail(EXIT.USAGE, `--since ${opt.since} is after --until ${opt.until}`);
  const projects = opt.project.map((p) => path.resolve(p));
  const r = root(state);
  const dir = path.join(r, `${new Date().toISOString().slice(0, 10)}-${opt.slug}`);
  if (fs.existsSync(dir)) fail(EXIT.REFUSED, `the run already exists; a narrower scope is a new --slug: ${dir}`);
  const home = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude"), "projects");
  let st;
  try { st = fs.statSync(home); } catch { fail(EXIT.USAGE, `no transcripts directory: ${home}`); }
  if (!st.isDirectory()) fail(EXIT.USAGE, `the transcripts directory is not a directory: ${home}`);

  const all = transcripts(home).map((file, index) => ({ index, ...survey(file) }));
  const named = new Set(opt.session);
  const unknown = [...named].filter((id) => !all.some((s) => s.session === id));
  if (unknown.length) fail(EXIT.USAGE, `--session names no transcript under ${home}: ${unknown.join(", ")}`);

  // Forks: two transcripts holding the same human message at the same time are one conversation.
  const up = all.map((s) => s.index);
  const find = (i) => { while (up[i] !== i) i = up[i] = up[up[i]]; return i; };
  const firstSeen = new Map();
  for (const s of all) for (const h of s.humans) {
    const k = sha256(`${h.ts}\u0000${h.text}`);
    if (firstSeen.has(k)) up[find(s.index)] = find(firstSeen.get(k)); else firstSeen.set(k, s.index);
  }
  const tasksWhere = (pred) => new Set(all.filter(pred).map((s) => find(s.index))).size;
  const plugins = Object.fromEntries(PLUGINS.map((p) => [p, tasksWhere((s) => !s.self && s.loads.some((l) => l.plugin === p))]));
  const humanSessions = tasksWhere((s) => !s.self && s.humans.length > 0);
  const selfRuns = tasksWhere((s) => s.self);
  const oldest = all.map((s) => s.first).filter(Boolean).sort()[0]?.slice(0, 10) ?? "none";

  // --session is the whole scope: a named session is taken as named, past every other option. Without it, the
  // sessions that loaded the plugin (or, with --all-sessions, any with a human message), this skill's runs
  // left out, narrowed by each option given. checkout= counts the checkout-loaded tasks every option but
  // --version keeps, less those a cache load in the --version range keeps already.
  const ofPlugin = (l) => !opt.plugin || l.plugin === opt.plugin;
  const inScope = (s, byVersion) => {
    if (named.size) return named.has(s.session);
    if (s.self) return false;
    if (opt["all-sessions"] ? !s.humans.length : !s.loads.some(ofPlugin)) return false;
    if (byVersion && versions && !s.loads.some((l) => ofPlugin(l) && versions(l.version))) return false;
    if (opt.since && !(s.last && s.last.slice(0, 10) >= opt.since)) return false;
    if (opt.until && !(s.first && s.first.slice(0, 10) <= opt.until)) return false;
    return !projects.length || projects.some((p) => s.cwd === p || (s.cwd ?? "").startsWith(p + path.sep));
  };
  const picked = all.filter((s) => inScope(s, true));
  const cacheKept = new Set(picked.filter((s) => versions && s.loads.some((l) => ofPlugin(l) && l.source === "cache" && versions(l.version))).map((s) => find(s.index)));
  const checkout = new Set(all.filter((s) => inScope(s, false) && s.loads.some((l) => ofPlugin(l) && l.source === "checkout"))
    .map((s) => find(s.index)).filter((k) => !cacheKept.has(k))).size;
  const groups = new Map();
  for (const s of picked) { const k = find(s.index); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); }
  // A fork copies its original's first turns with their times; when the first times tie, the older file leads.
  const order = (a, b) => cmpStr(a.first ?? "", b.first ?? "") || a.born - b.born || cmpStr(a.file, b.file);
  const tasks = [...groups.values()].map((g) => g.sort(order)).sort((a, b) => order(a[0], b[0]));

  const rollouts = rolloutIndex(path.join(process.env.CODEX_HOME || path.join(os.homedir(), ".codex"), "sessions"));
  const sessions = [], turns = [];
  tasks.forEach((files, k) => {
    const g = gather(files, `T${k + 1}`, rollouts);
    sessions.push(g.entry);
    for (const t of g.turns) turns.push(t);
  });

  const loaded = tasks.filter((f) => f.some((s) => s.loads.some(ofPlugin))).length;
  const bySource = (src) => tasks.filter((f) => f.some((s) => s.loads.some((l) => ofPlugin(l) && l.source === src))).length;
  const refusals = sessions.reduce((n, e) => n + e.refusals.filter(ofPlugin).length, 0);
  const runs = sessions.flatMap((e) => e.codex);
  const projectCounts = new Map();
  for (const e of sessions) projectCounts.set(e.cwd ?? "unknown", (projectCounts.get(e.cwd ?? "unknown") ?? 0) + 1);
  const firsts = sessions.map((e) => e.first).filter(Boolean).sort(), lasts = sessions.map((e) => e.last).filter(Boolean).sort();
  const chars = turns.reduce((n, t) => n + t.text.length, 0);

  const index = {
    created: new Date().toISOString(),
    transcripts: home,
    scope: { plugin: opt.plugin ?? null, versions: opt.version, since: opt.since ?? null, until: opt.until ?? null,
             projects, sessions: [...named], allSessions: !!opt["all-sessions"] },
    beforeScope: { plugins, humanSessions, selfRuns, oldest },
    selfRuns: all.filter((s) => s.self).map((s) => ({ session: s.session, path: s.file, cwd: s.cwd, first: s.first, last: s.last })),
    sessions,
  };
  makeDir(r);
  try { fs.mkdirSync(dir, { mode: 0o700 }); }
  catch (e) { fail(e.code === "EEXIST" ? EXIT.REFUSED : EXIT.FAILED, `cannot make the run: ${dir}: ${e.message}`); }
  makeDir(path.join(dir, "corpus"));
  place(path.join(dir, "corpus", "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  placeLines(path.join(dir, "corpus", "turns.jsonl"), (function* () { for (const t of turns) yield JSON.stringify(t); })());

  // The per-project lines first and RUN= last: a runner's tail keeps the end.
  say([
    ...[...projectCounts].sort((a, b) => b[1] - a[1] || cmpStr(a[0], b[0])).map(([cwd, n]) => `PROJECT=${cwd} sessions=${n}`),
    `PLUGINS=${PLUGINS.map((p) => `${p}:${plugins[p]}`).join(" ")}`,
    `HUMAN_SESSIONS=${humanSessions}`,
    `PROJECTS=${projectCounts.size}`,
    `SESSIONS=${tasks.length} loaded=${loaded} cache=${bySource("cache")} checkout=${checkout} refusals=${refusals}`,
    `RANGE=${firsts.length ? `${firsts[0].slice(0, 10)}..${lasts.at(-1).slice(0, 10)}` : "none"}`,
    `OLDEST=${oldest}`,
    `SELF_RUNS=${selfRuns}`,
    `SUBAGENTS=${sessions.reduce((n, e) => n + e.subagents.length, 0)}`,
    `CODEX_RUNS=${runs.length} reports=${runs.filter((x) => x.reportFound).length} rollouts=${runs.filter((x) => x.rollout).length}`,
    `CHARS=${chars} MESSAGES=${turns.length}`,
    `PARTS_EST=${cut(turns.map(blockSize)).length}`,
    `RUN=${dir}`,
  ]);
}

function readTurns(dir) {
  const file = path.join(dir, "corpus", "turns.jsonl");
  let raw;
  try { raw = fs.readFileSync(file, "utf8"); } catch { fail(EXIT.USAGE, `the run has no corpus/turns.jsonl: ${dir}`); }
  return raw.split("\n").filter(Boolean).map((l, i) => {
    try { return JSON.parse(l); } catch { fail(EXIT.USAGE, `corpus/turns.jsonl line ${i + 1} does not parse`); }
  });
}

function parts(opt, state) {
  const dir = runDir(opt, state);
  const corpusDir = path.join(dir, "corpus");
  const listing = path.join(corpusDir, "parts.json");
  for (const p of [listing, path.join(corpusDir, "parts"), path.join(corpusDir, "pages")])
    if (fs.existsSync(p)) fail(EXIT.REFUSED, `the corpus is already cut, and a cut is never redone: ${p}`);
  const turns = readTurns(dir);
  const plan = cut(turns.map(blockSize));
  for (const d of ["parts", "pages"]) {
    try { fs.mkdirSync(path.join(corpusDir, d), { mode: 0o700 }); }
    catch (e) { fail(e.code === "EEXIST" ? EXIT.REFUSED : EXIT.FAILED, `cannot make ${path.join(corpusDir, d)}: ${e.message}`); }
  }
  const listed = [];
  let pages = 0, largest = 0;
  plan.forEach((idx, k) => {
    const id = `P${String(k + 1).padStart(3, "0")}`;
    const blocks = idx.map((i) => blockOf(turns[i]));
    const text = blocks.join("");
    place(path.join(corpusDir, "parts", `${id}.md`), text);
    const own = paginate(blocks).map((body, n) => {
      const pid = `${id}-${String(n + 1).padStart(2, "0")}`;
      place(path.join(corpusDir, "pages", `${pid}.md`), body);
      return { id: pid, file: `corpus/pages/${pid}.md`, chars: body.length, sha256: sha256(body) };
    });
    pages += own.length; largest = Math.max(largest, text.length);
    listed.push({ id, file: `corpus/parts/${id}.md`, chars: text.length, turns: idx.length, from: addr(turns[idx[0]]), to: addr(turns[idx.at(-1)]), pages: own });
  });
  place(listing, `${JSON.stringify({ partChars: PART_CHARS, pageChars: PAGE_CHARS, overlapTurns: OVERLAP_TURNS, parts: listed }, null, 2)}\n`);
  say([`PARTS=${listed.length} PAGES=${pages} LARGEST=${largest}`]);
}

function add(opt, state) {
  const dir = runDir(opt, state);
  if (!opt.name || !ADDABLE.test(opt.name)) fail(EXIT.USAGE, "--name must be rounds.md, drafts/NN-report.md, or a path under ledger/, measures/ or anonymized/");
  const body = readSource(opt.from, "--from <file>");
  const dst = path.join(dir, ...opt.name.split("/"));
  makeDir(path.dirname(dst));
  place(dst, body);
  say([`ADDED=${dst}`]);
}

// Every string of what the agent's model was shown of a command in one rollout: the *_output item of a tool
// call. The command's own record (exec_command_end, a CommandExecution item) holds what it printed, which
// Codex may cut before the model sees it, so it proves nothing about a read.
function outputs(file, into) {
  const collect = (v) => {
    if (typeof v === "string") into.push(v);
    else if (v && typeof v === "object") for (const x of Object.values(v)) collect(x);
  };
  for (const [, r] of records(file)) {
    const p = r.payload;
    if (p && typeof p === "object" && typeof p.type === "string" && p.type.endsWith("_output")) collect(p.output);
  }
  return into;
}

function coverage(opt, state) {
  const dir = runDir(opt, state);
  const listing = path.join(dir, "corpus", "parts.json");
  if (!fs.existsSync(listing)) fail(EXIT.REFUSED, "the corpus is not cut yet: run parts first");
  const cutList = readJson(listing);
  if (!cutList || !Array.isArray(cutList.parts)) fail(EXIT.USAGE, `corpus/parts.json does not parse: ${listing}`);
  const byPart = new Map(cutList.parts.map((p) => [p.id, p]));
  const rows = [];
  readSource(opt.map, "--map <tsv>").toString("utf8").split("\n").forEach((l, i) => {
    if (!l.trim()) return;
    const f = l.replace(/\r$/, "").split("\t");
    if (f.length !== 3 || f.some((x) => !x.trim())) fail(EXIT.USAGE, `--map line ${i + 1} is not agent-id<TAB>report.json<TAB>P###[,P###]`);
    const ids = f[2].split(",").map((s) => s.trim()).filter(Boolean);
    const unknown = ids.filter((p) => !byPart.has(p));
    if (unknown.length) fail(EXIT.USAGE, `--map line ${i + 1} names parts this run does not have: ${unknown.join(", ")}`);
    rows.push({ agent: f[0].trim(), report: path.resolve(f[1].trim()), parts: ids });
  });
  if (!rows.length) fail(EXIT.USAGE, "--map names no agent");
  const dst = path.join(dir, "measures", `coverage-${path.parse(opt.map).name}.json`);
  if (fs.existsSync(dst)) fail(EXIT.REFUSED, `already there, not rewritten: ${dst}`);
  const rollouts = rolloutIndex(path.join(process.env.CODEX_HOME || path.join(os.homedir(), ".codex"), "sessions"));
  const pageText = (p) => { try { return fs.readFileSync(path.join(dir, ...p.file.split("/")), "utf8"); } catch { return null; } };
  // What measures/ records names files by their last segments, never by a machine path: export publishes it.
  const agents = rows.map((row) => {
    const a = { agent: row.agent, report: `${path.basename(path.dirname(row.report))}/${path.basename(row.report)}`,
      parts: row.parts, read: [], unread: [], status: "unread", reason: null };
    const rep = readJson(row.report);
    let files = [];
    if (!rep) a.reason = "no report";
    else if (typeof rep.threadId !== "string") a.reason = "no threadId";
    else { files = rollouts().get(rep.threadId) ?? []; if (!files.length) a.reason = "no rollout"; }
    const seen = [];
    for (const f of files) outputs(f, seen);
    for (const p of row.parts.flatMap((id) => byPart.get(id).pages)) {
      const text = pageText(p)?.trimEnd();
      const escaped = text === undefined ? null : JSON.stringify(text).slice(1, -1);
      const whole = !!text && seen.some((o) => o.includes(text) || o.includes(escaped));
      (whole ? a.read : a.unread).push(p.id);
    }
    a.status = !a.unread.length ? "whole" : a.read.length ? "partial" : "unread";
    return a;
  });
  makeDir(path.dirname(dst));
  place(dst, `${JSON.stringify({ map: path.basename(opt.map), agents }, null, 2)}\n`);
  const n = (s) => agents.filter((a) => a.status === s).length;
  say([
    ...agents.filter((a) => a.unread.length).map((a) => `AGENT=${a.agent} unread=${a.unread.join(",")}${a.reason ? ` reason=${a.reason.replace(/ /g, "-")}` : ""}`),
    `AGENTS=${agents.length} WHOLE=${n("whole")} PARTIAL=${n("partial")} UNREAD=${n("unread")}`,
  ]);
}

function tokenize(s) {
  const text = s.normalize("NFKC");
  return { text, words: [...text.matchAll(/[\p{L}\p{N}]+/gu)].map((m) => ({ w: m[0].toLowerCase(), s: m.index, e: m.index + m[0].length })) };
}

function lcs(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) d[i][j] = a[i] === b[j] ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
  let i = 0, j = 0, first = -1, last = -1;
  while (i < m && j < n) {
    if (a[i] === b[j]) { if (first < 0) first = j; last = j; i++; j++; }
    else if (d[i + 1][j] >= d[i][j + 1]) i++;
    else j++;
  }
  return { n: d[0][0], first, last };
}

// The window of a turn, a quarter longer than the quote, that holds most of the quote's words.
function bestWindow(q, tw) {
  const w = Math.min(tw.length, Math.ceil(q.length * 1.25));
  const want = new Map();
  for (const x of q) want.set(x, (want.get(x) ?? 0) + 1);
  const have = new Map();
  let o = 0, best = -1, at = 0;
  for (let i = 0; i < tw.length; i++) {
    const x = tw[i].w, h = (have.get(x) ?? 0) + 1;
    have.set(x, h); if (h <= (want.get(x) ?? 0)) o++;
    if (i >= w) { const y = tw[i - w].w, hy = have.get(y); have.set(y, hy - 1); if (hy <= (want.get(y) ?? 0)) o--; }
    if (i >= w - 1 && o > best) { best = o; at = i - w + 1; }
  }
  return tw.slice(at, at + w);
}

// Near: the turn whose best window holds, in order, the largest share of the quote's words, when that share
// is at least NEAR; the words are compared after Unicode normalisation and lower-casing, punctuation aside.
function nearFinder(turns) {
  let index = null;
  const tokens = new Map();
  const tokensOf = (i) => { if (!tokens.has(i)) tokens.set(i, tokenize(turns[i].text)); return tokens.get(i); };
  return (quote) => {
    const q = tokenize(quote).words.slice(0, NEAR_WORDS).map((x) => x.w);
    if (!q.length) return null;
    if (!index) {
      index = new Map();
      turns.forEach((t, i) => {
        for (const x of new Set(tokenize(t.text).words.map((y) => y.w))) { let l = index.get(x); if (!l) index.set(x, l = []); l.push(i); }
      });
    }
    const distinct = [...new Set(q)];
    const hits = new Map();
    for (const x of distinct) for (const i of index.get(x) ?? []) hits.set(i, (hits.get(i) ?? 0) + 1);
    const need = Math.max(Math.min(2, distinct.length), Math.ceil(distinct.length * NEAR));
    const candidates = [...hits].filter(([, n]) => n >= need).sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, NEAR_CANDIDATES);
    let best = null;
    for (const [i] of candidates) {
      const tk = tokensOf(i);
      const win = bestWindow(q, tk.words);
      const m = lcs(q, win.map((x) => x.w));
      const score = m.n / q.length;
      if (m.n && (!best || score > best.score)) best = { turn: i, score, match: tk.text.slice(win[m.first].s, win[m.last].e) };
    }
    return best && best.score >= NEAR ? { ...best, score: Math.round(best.score * 100) / 100 } : null;
  };
}

function quotes(opt, state) {
  const dir = runDir(opt, state);
  const episodes = [];
  readSource(opt.episodes, "--episodes <jsonl>").toString("utf8").split("\n").forEach((l, i) => {
    if (!l.trim()) return;
    let e;
    try { e = JSON.parse(l); } catch { fail(EXIT.USAGE, `--episodes line ${i + 1} is not JSON`); }
    if (!e || typeof e !== "object" || Array.isArray(e) || typeof e.quote !== "string" || !e.quote.trim()) fail(EXIT.USAGE, `--episodes line ${i + 1} has no "quote" string`);
    if (e.id !== undefined && typeof e.id !== "string" && typeof e.id !== "number") fail(EXIT.USAGE, `--episodes line ${i + 1}: "id" is a string or a number`);
    episodes.push(e);
  });
  if (!episodes.length) fail(EXIT.USAGE, "--episodes holds no episode");
  const dst = path.join(dir, "ledger", `quotes-${path.parse(opt.episodes).name}.json`);
  if (fs.existsSync(dst)) fail(EXIT.REFUSED, `already there, not rewritten: ${dst}`);
  const turns = readTurns(dir);
  const collapse = (s) => s.replace(/\s+/g, " ").trim();
  const flat = turns.map((t) => collapse(t.text));
  const near = nearFinder(turns);
  const counts = { exact: 0, near: 0, missing: 0 };
  const results = episodes.map((e) => {
    const q = collapse(e.quote);
    const i = flat.findIndex((t) => t.includes(q));
    let v;
    if (i >= 0) v = { verdict: "exact", at: addr(turns[i]) };
    else {
      const n = near(e.quote);
      v = n ? { verdict: "near", at: addr(turns[n.turn]), match: n.match, score: n.score } : { verdict: "missing" };
    }
    counts[v.verdict]++;
    return { ...e, ...v };
  });
  makeDir(path.dirname(dst));
  place(dst, `${JSON.stringify({ episodes: path.basename(opt.episodes), results }, null, 2)}\n`);
  say([`QUOTES=${results.length} EXACT=${counts.exact} NEAR=${counts.near} MISSING=${counts.missing}`]);
}

function tokens(opt, state) {
  const dir = runDir(opt, state);
  if (!opt.reports === !opt.from) fail(EXIT.USAGE, "one of --reports <dir> or --from <tsv> is required, and only one");
  let median = null;
  if (opt.median !== undefined) {
    if (!/^\d+$/.test(opt.median) || Number(opt.median) === 0) fail(EXIT.USAGE, `--median is a positive whole number of tokens: ${opt.median}`);
    median = Number(opt.median);
  }
  let agents, name, source;
  if (opt.reports) {
    const d = path.resolve(opt.reports);
    let st;
    try { st = fs.statSync(d); } catch { fail(EXIT.USAGE, `--reports does not exist: ${opt.reports}`); }
    if (!st.isDirectory()) fail(EXIT.USAGE, `--reports is not a directory: ${opt.reports}`);
    agents = fs.readdirSync(d, { withFileTypes: true })
      .filter((e) => e.isDirectory() && isFile(path.join(d, e.name, "report.json"))).map((e) => e.name).sort()
      .map((agent) => {
        const t = readJson(path.join(d, agent, "report.json"))?.tokenUsage?.total?.totalTokens;
        return { agent, tokens: typeof t === "number" ? t : null };
      });
    if (!agents.length) fail(EXIT.USAGE, `no */report.json under ${d}`);
    name = path.basename(d); source = { reports: name };
  } else {
    agents = [];
    readSource(opt.from, "--from <tsv>").toString("utf8").split("\n").forEach((l, i) => {
      if (!l.trim()) return;
      const f = l.replace(/\r$/, "").split("\t");
      if (f.length !== 2 || !f[0].trim() || !/^\d+$/.test(f[1].trim())) fail(EXIT.USAGE, `--from line ${i + 1} is not agent<TAB>tokens`);
      agents.push({ agent: f[0].trim(), tokens: Number(f[1].trim()) });
    });
    if (!agents.length) fail(EXIT.USAGE, "--from names no agent");
    name = path.parse(opt.from).name; source = { from: path.basename(opt.from) };
  }
  const dst = path.join(dir, "measures", `tokens-${name}.json`);
  if (fs.existsSync(dst)) fail(EXIT.REFUSED, `already there, not rewritten: ${dst}`);
  const counted = agents.filter((a) => a.tokens !== null);
  const sorted = counted.map((a) => a.tokens).sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  const med = !sorted.length ? 0 : sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  const max = sorted.length ? sorted.at(-1) : 0;
  const line = median === null ? null : 3 * median;
  const over = line === null ? [] : counted.filter((a) => a.tokens > line).sort((a, b) => b.tokens - a.tokens || cmpStr(a.agent, b.agent));
  const missing = agents.filter((a) => a.tokens === null).map((a) => a.agent);
  if (missing.length) process.stderr.write(`prepare-feedback: no token count in the report of ${missing.join(", ")}\n`);
  makeDir(path.dirname(dst));
  place(dst, `${JSON.stringify({ ...source, agents, median: med, max, stopLine: line === null ? null : { median, line, over } }, null, 2)}\n`);
  say([
    ...over.map((a) => `AGENT=${a.agent} tokens=${a.tokens}`),
    ...(line === null ? [] : [`OVER=${over.length}`]),
    `AGENTS=${counted.length} MEDIAN=${med} MAX=${max}`,
  ]);
}

function exportRun(opt, state) {
  const dir = runDir(opt, state);
  if (!opt.to) fail(EXIT.USAGE, "--to <relative dir> is required");
  if (path.isAbsolute(opt.to)) fail(EXIT.USAGE, `--to is relative to the working directory, not absolute: ${opt.to}`);
  const to = path.resolve(opt.to);
  let parent;
  try { parent = fs.realpathSync(path.dirname(to)); if (!fs.statSync(parent).isDirectory()) throw new Error(); }
  catch { fail(EXIT.USAGE, `--to must name a new directory inside an existing one: ${opt.to}`); }
  const dest = path.join(parent, path.basename(to));
  if (inside(dest, state)) fail(EXIT.REFUSED, `--to lies under the state directory, where this script writes only runs: ${dest}`);
  let taken = true;
  try { fs.lstatSync(dest); } catch { taken = false; }
  if (taken) fail(EXIT.REFUSED, `the destination already exists: ${opt.to}`);
  const files = [];
  try {
    for (const n of fs.readdirSync(path.join(dir, "drafts")).sort())
      if (n.endsWith(".md") && isFile(path.join(dir, "drafts", n))) files.push([path.join(dir, "drafts", n), n]);
  } catch {}
  if (isFile(path.join(dir, "rounds.md"))) files.push([path.join(dir, "rounds.md"), "rounds.md"]);
  const walk = (abs, rel) => {
    let entries;
    try { entries = fs.readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const e of entries.sort((a, b) => cmpStr(a.name, b.name))) {
      if (e.isDirectory()) walk(path.join(abs, e.name), `${rel}/${e.name}`);
      else if (e.isFile()) files.push([path.join(abs, e.name), `${rel}/${e.name}`]);
    }
  };
  walk(path.join(dir, "measures"), "measures");
  walk(path.join(dir, "anonymized"), "anonymized");
  if (!files.length) fail(EXIT.REFUSED, "nothing to export yet: no drafts/*.md, rounds.md, measures/ or anonymized/");
  try { fs.mkdirSync(dest); } catch (e) { fail(e.code === "EEXIST" ? EXIT.REFUSED : EXIT.FAILED, `cannot make ${dest}: ${e.message}`); }
  for (const [src, rel] of files) {
    const d = path.join(dest, ...rel.split("/"));
    try { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.writeFileSync(d, fs.readFileSync(src), { flag: "wx" }); }
    catch (e) { fail(e.code === "EEXIST" ? EXIT.REFUSED : EXIT.FAILED, `copy failed: ${d}: ${e.message}`); }
  }
  say([`EXPORTED=${opt.to} FILES=${files.length}`]);
}

const argv = process.argv.slice(2);
const cmd = argv[0] !== undefined && !argv[0].startsWith("--") ? argv[0] : undefined;
if (cmd !== undefined && !COMMANDS.includes(cmd)) fail(EXIT.USAGE, `unknown command: ${cmd}; one of ${COMMANDS.join(", ")}`);
if (argv.includes("--help") || !cmd) { process.stdout.write(usage()); process.exit(argv.includes("--help") ? EXIT.OK : EXIT.USAGE); }
const opt = parse(cmd, argv.slice(1));
const state = stateDir();
({ corpus, parts, add, coverage, quotes, tokens, export: exportRun })[cmd](opt, state);
