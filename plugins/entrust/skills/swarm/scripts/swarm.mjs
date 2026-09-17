#!/usr/bin/env node
// swarm.mjs — launch a swarm of bulk agents through the sibling launcher, at most --concurrency at once,
// and write one summary the reducer reads. The units, the brief template and the reducer are the
// coordinator's; this script only makes each agent through the launcher, runs it, waits for every one
// and writes the summary.
//
//   node swarm.mjs --units <file> --brief <template> --run <dir> [--concurrency <n>] [--summary <file>]
//   node swarm.mjs --agents <n> --brief <template> --run <dir> [--concurrency <n>] [--summary <file>]
//
// --units: one unit per line, fifty at most; the template must contain {{UNIT}} and may contain {{UNIT_ID}}.
// --agents: n identical briefs for a queue arm, fifty at most; the template must not contain {{UNIT}}.
// --run: absolute, the orchestrate run directory; agent <id> is <run>/<id>/report.json with the launcher's
//   agent/ beside it, which is what the cleanup expects of a run. --concurrency: 1 to 50, default 10.
// --summary: where summary.json goes, default a fresh codex-agent.* directory under the temporary directory,
//   the agent-scratch shape the cleanup lists; never under <run>, where only the launcher and the driver write.
// Environment: what the launcher needs, forwarded unchanged (CLAUDE_PLUGIN_DATA or ENTRUST_STATE_DIR).
// A signal (SIGTERM, SIGINT, SIGHUP) stops further launches, goes to every running launcher, and the
// summary is written for what ran; the exit is then 1.
// Exit: 0 the summary was written and every agent was launched (per-agent outcomes are inside it);
// 1 a signal cut the swarm or the summary could not be written; 2 usage.

import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXIT = { OK: 0, FAILED: 1, USAGE: 2 };
const MAX = 50;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const LAUNCHER = path.resolve(HERE, "..", "..", "codex", "scripts", "agent-run.mjs");

const usage = () => `swarm.mjs — launch a swarm of bulk agents through the sibling launcher and write one summary

  --units <file> --brief <template> --run <dir> [--concurrency <n>] [--summary <file>]
      one agent per line of <file>, ${MAX} at most; the template's {{UNIT}} takes the unit, {{UNIT_ID}} its number
  --agents <n> --brief <template> --run <dir> [--concurrency <n>] [--summary <file>]
      n agents on one identical brief (a queue arm), ${MAX} at most; the template has no {{UNIT}}

Agent <id> is <run>/<id>/report.json with the launcher's agent/ beside it, made by the launcher from the brief;
at most --concurrency (1 to ${MAX}, default 10) run at once. When every agent has finished the script writes
summary.json (default: a fresh codex-agent.* directory under the temporary directory, never under <run>): per
agent its id, unit, report path, the launcher's DRIVER_EXIT, PATH, EXIT and FIRST lines, and when it ran.
Environment is forwarded unchanged to the launcher (CLAUDE_PLUGIN_DATA or ENTRUST_STATE_DIR). A signal stops
further launches and reaches every running agent; the summary is still written.
Exit: 0 summary written, every agent launched; 1 cut by a signal, or the summary could not be written; 2 usage.
`;

function fail(code, msg) { process.stderr.write(`swarm: ${msg}\n`); process.exit(code); }

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) fail(EXIT.USAGE, `unexpected argument: ${a}`);
    const key = a.slice(2);
    if (key === "help") { out.help = true; continue; }
    const v = argv[i + 1];
    if (v === undefined || v.startsWith("--")) fail(EXIT.USAGE, `--${key} needs a value`);
    out[key] = v; i++;
  }
  return out;
}

const opt = args(process.argv.slice(2));
if (opt.help || process.argv.length === 2) { process.stdout.write(usage()); process.exit(opt.help ? EXIT.OK : EXIT.USAGE); }
if (!fs.existsSync(LAUNCHER)) fail(EXIT.USAGE, `the sibling launcher is missing: ${LAUNCHER}`);
if ((opt.units ? 1 : 0) + (opt.agents ? 1 : 0) !== 1) fail(EXIT.USAGE, "exactly one of --units <file> or --agents <n> is required");
if (!opt.brief) fail(EXIT.USAGE, "--brief <template> is required");
if (!opt.run || !path.isAbsolute(opt.run)) fail(EXIT.USAGE, "--run <dir> is required and absolute");
const concurrency = opt.concurrency === undefined ? 10 : Number(opt.concurrency);
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > MAX) fail(EXIT.USAGE, `--concurrency must be 1 to ${MAX}`);
let template;
try { template = fs.readFileSync(opt.brief, "utf8"); } catch (e) { fail(EXIT.USAGE, `--brief cannot be read: ${opt.brief}: ${e.message}`); }
if (template.trim() === "") fail(EXIT.USAGE, "--brief is empty");

let units;
if (opt.units) {
  let raw;
  try { raw = fs.readFileSync(opt.units, "utf8"); } catch (e) { fail(EXIT.USAGE, `--units cannot be read: ${opt.units}: ${e.message}`); }
  units = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (units.length === 0) fail(EXIT.USAGE, "--units has no units");
  if (units.length > MAX) fail(EXIT.USAGE, `--units has ${units.length} units; a swarm is ${MAX} at most`);
  if (!template.includes("{{UNIT}}")) fail(EXIT.USAGE, "the template has no {{UNIT}} placeholder");
} else {
  const n = Number(opt.agents);
  if (!Number.isInteger(n) || n < 1 || n > MAX) fail(EXIT.USAGE, `--agents must be 1 to ${MAX}`);
  if (template.includes("{{UNIT}}")) fail(EXIT.USAGE, "a queue arm's template must not contain {{UNIT}}");
  units = Array.from({ length: n }, () => null);
}
let summaryPath = opt.summary;
if (summaryPath) {
  if (!path.isAbsolute(summaryPath)) fail(EXIT.USAGE, "--summary must be absolute");
  const real = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
  if (real(path.dirname(summaryPath)).startsWith(real(opt.run))) fail(EXIT.USAGE, "--summary must not lie under --run, where only the launcher and the driver write");
} else {
  // The agent-scratch shape the cleanup lists is codex-agent. followed by eight characters, the page's own
  // mktemp template; mkdtemp would give six, so the name is drawn here and the directory made create-only.
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let dir = null;
  for (let tries = 0; tries < 20 && !dir; tries++) {
    const name = "codex-agent." + Array.from(crypto.randomBytes(8), (b) => alphabet[b % alphabet.length]).join("");
    const candidate = path.join(os.tmpdir(), name);
    try { fs.mkdirSync(candidate, { mode: 0o700 }); dir = candidate; } catch (e) { if (e.code !== "EEXIST") fail(EXIT.USAGE, `cannot make the summary directory: ${e.message}`); }
  }
  if (!dir) fail(EXIT.USAGE, "cannot make the summary directory under the temporary directory");
  summaryPath = path.join(dir, "summary.json");
}

// A function replacement: a string one would expand $&, $` and $' inside the unit.
const fill = (unit, id) => template.replace(/\{\{UNIT\}\}/g, () => unit ?? "").replace(/\{\{UNIT_ID\}\}/g, () => id);
const agents = units.map((unit, k) => {
  const id = String(k + 1).padStart(3, "0");
  return { id, unit, report: path.join(opt.run, id, "report.json"), launched: false, startedAt: null, finishedAt: null,
           driverExit: null, path: null, exitCode: null, first: null, launcherExit: null };
});

const runLauncher = (argv, input) => new Promise((resolve) => {
  const child = spawn(process.execPath, [LAUNCHER, ...argv], { stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"], env: process.env });
  let out = "", err = "";
  child.stdout.on("data", (d) => { out += d; }); child.stderr.on("data", (d) => { err += d; });
  child.on("error", (e) => resolve({ code: null, out, err: err + String(e), child }));
  child.on("close", (code) => resolve({ code, out, err, child }));
  if (input !== undefined) { child.stdin.end(input); }
  running.add(child); child.on("close", () => running.delete(child));
});

const running = new Set();
let stopped = false, next = 0, active = 0;
const startedAt = new Date().toISOString();

async function runOne(a) {
  a.startedAt = new Date().toISOString();
  const made = await runLauncher(["--new", "--report-file", a.report], fill(a.unit, a.id));
  if (made.code !== 0) { a.launcherExit = made.code; a.finishedAt = new Date().toISOString(); return; }
  a.launched = true;
  const ran = await runLauncher(["--report-file", a.report]);
  a.launcherExit = ran.code;
  const status = await runLauncher(["--status", "--report-file", a.report]);
  const line = (k) => { const m = new RegExp(`^${k}=(.*)$`, "m").exec(status.out); return m ? m[1] : null; };
  a.driverExit = line("DRIVER_EXIT") === null || line("DRIVER_EXIT") === "unknown" ? null : Number(line("DRIVER_EXIT"));
  a.path = line("PATH");
  a.exitCode = a.path === "own" && line("EXIT") !== null && line("EXIT") !== "unknown" ? Number(line("EXIT")) : null;
  a.first = a.path === "own" ? (line("FIRST") || null) : null;
  a.finishedAt = new Date().toISOString();
}

function finish() {
  const summary = { run: opt.run, mode: opt.units ? "units" : "agents", count: agents.length, concurrency, startedAt,
                    finishedAt: new Date().toISOString(), stopped, agents };
  try {
    fs.mkdirSync(path.dirname(summaryPath), { recursive: true, mode: 0o700 });
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + "\n", { mode: 0o600 });
  } catch (e) { fail(EXIT.FAILED, `cannot write the summary: ${summaryPath}: ${e.message}`); }
  const ok = agents.filter((a) => a.path === "own" && a.exitCode === 0).length;
  process.stdout.write(`summary=${summaryPath}\nlaunched=${agents.filter((a) => a.launched).length} ok=${ok}${stopped ? " stopped=1" : ""}\n`);
  process.exit(stopped || agents.some((a) => !a.launched) ? EXIT.FAILED : EXIT.OK);
}

function pump() {
  while (!stopped && active < concurrency && next < agents.length) {
    const a = agents[next++]; active++;
    runOne(a).then(() => { active--; if (active === 0 && (stopped || next >= agents.length)) finish(); else pump(); });
  }
  if (active === 0 && (stopped || next >= agents.length)) finish();
}
for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(sig, () => { stopped = true; for (const c of running) { try { c.kill(sig); } catch {} } if (active === 0) finish(); });
pump();
