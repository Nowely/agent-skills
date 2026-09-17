#!/usr/bin/env node
// Runs one Codex agent's driver for the entrust wrapper in one foreground call, and reads its status back.
//
//   node agent-run.mjs --new --report-file REPORT  < prompt      make the agent's directory beside REPORT, prompt from stdin
//   node agent-run.mjs --run --report-file REPORT                launch, wait, print the status lines
//   node agent-run.mjs --status --report-file REPORT             the status lines of a run, whatever its state
//   node agent-run.mjs --report-file REPORT                      launch only (the exit status is the driver's)
//   --dir DIR names the agent's directory explicitly; without it, it is `agent/` beside REPORT
//   node agent-run.mjs --help
//
// Why one call: the wrapper is what makes a Codex agent read like a native subagent, and a native
// subagent that runs one command shows one Bash card and its return. The earlier shape showed three
// (a background launch, a polling wait, a status read) because a foreground call has a ten-minute
// ceiling and agents longer than that were lost (incidents.md, "Five of seven agents lost to the wall
// clock"). `--run` keeps the ceiling from costing anything: it is idempotent. On a fresh directory it
// launches the driver and waits; on a directory whose driver is still running (the harness moved the
// first call into the background at the ceiling and the wrapper ran the same command again) it waits;
// on a finished one it prints. Every path ends by printing the same nine lines to stdout, which is the
// tool result the wrapper hands back, so nothing has to open a file.
//
// What it keeps: it NEVER opens prompt.txt except as the driver's --prompt-file argument, because a
// relay that reads a prompt can rewrite it (incidents.md, "A relay on a small model"); it passes the
// driver exactly the two flags the page used to and the environment as it found it, CLAUDE_PLUGIN_DATA
// included; the driver's own stderr, its pid line first, is what lands in DIR/err.txt. DIR is `agent/`
// beside the report, made by --new at 0700 with the prompt it read on stdin at 0600, so one run's four
// files (prompt.txt on entry, out.json, err.txt and exit on the way out) sit next to its report and
// nothing is left in $TMPDIR; exit is written last, after both output files are closed. A coordinator
// may issue --new and the Agent call in one turn: --run waits a few seconds for the prompt to appear. One launch per DIR: a second
// launch into a directory that already ran is refused, because it would overwrite the first run's record
// (measured 2026-09-17 on the earlier shape); under --run a directory that ran for THIS report path is a
// status read, which the ceiling's second call needs, and one that ran for another path is refused.

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRIVER = path.join(HERE, "driver.mjs");

// The driver's own words, looked for in DIR/err.txt to tell whose run the file at REPORT is: its pid
// line names the path it accepted, and its two refusals name a path it did not publish to.
// agent-contract.test.mjs checks that driver.mjs still prints all three.
export const ACCEPTED = "reportPath=";
export const TAKEN = ["already exists, or is a symbolic link", "could not be published at"];
// A launch this script refused never ran the driver; the marker keeps its lines from being read as a
// run's, whatever an earlier run left in the directory.
export const REFUSED = "entrust agent-run: refused";
// The short names the page uses for the catalogue's slugs: the status line says what the coordinator
// retells, and the slug stays in the report.
export const SHORT_NAMES = { "gpt-6-astra": "Astra", "gpt-5.6-sol": "Sol", "gpt-5.6-terra": "Terra", "gpt-5.6-luna": "Luna" };
export const FIRST_MAX = 300, ANSWER_MAX = 600, ERROR_MAX = 300;
// The status read prints these names, in this order, whatever it found.
export const STATUS_LINES = ["DRIVER_EXIT", "PATH", "EXIT", "FIRST", "ANSWER", "ERROR", "RECEIPT", "FILE", "REPORT"];
const POLL_MS = 500;
// How long --run waits for a prompt that a --new issued in the same turn has not written yet.
export const PROMPT_WAIT_MS = 10000;
export const agentDirOf = (report) => path.join(path.dirname(report), "agent");

const USAGE = `agent-run — make, run or read one Codex agent for the wrapper.

  node agent-run.mjs --new --report-file REPORT  < prompt
      Makes the agent's directory, agent/ beside REPORT, at 0700, and writes the prompt read on stdin
      to its prompt.txt at 0600. Refuses (exit 2) a REPORT that is not absolute, an empty prompt, and a
      directory that already holds a prompt: a relaunch gets a fresh report path.
  node agent-run.mjs --run --report-file REPORT
      One foreground call, idempotent; DIR is agent/ beside REPORT unless --dir names it, and a prompt
      not there yet is waited for up to ${PROMPT_WAIT_MS / 1000} s (a --new issued in the same turn).
      A fresh DIR: runs driver.mjs --prompt-file DIR/prompt.txt
      --report-file REPORT with stdout in DIR/out.json and stderr in DIR/err.txt, writes the driver's
      exit status to DIR/exit last, then prints the status lines. A DIR whose driver is still running
      (the harness moved the first call into the background at its ceiling and the wrapper ran the same
      command again): waits for the marker, then prints. A DIR that already ran for this REPORT: prints.
      A DIR that ran for another report path is refused and the lines say so. Always exits 0 once the
      lines are printed, a missing DIR included; the driver's own status is the DRIVER_EXIT line. A
      signal it receives (SIGTERM, SIGINT, SIGHUP) goes to the driver, its own or the one it waits for,
      which cuts the turn and publishes.
  node agent-run.mjs --report-file REPORT [--dir DIR]
      Launch only: the same run without the wait's printing, exiting with the driver's status. Refuses,
      exit 2 with the reason in DIR/err.txt and DIR/exit where DIR is a directory: a DIR that is not
      one, a prompt.txt that is not a regular file, a REPORT that is not absolute, and a DIR whose exit
      marker already exists (that refusal leaves the earlier run's files as they were and appends its
      reason to err.txt).
  node agent-run.mjs --status --report-file REPORT [--dir DIR]
      Prints nine lines: ${STATUS_LINES.join(", ")}. PATH is own where the
      driver's pid line names REPORT, taken where the driver refused a path already there or could not
      publish, none otherwise or where the launch was refused. ANSWER is the whole answer on one line
      when it is at most ${ANSWER_MAX} characters, else a pointer to the report; ERROR is the report's
      error, else its turnError, else the launcher's own refusal; RECEIPT is turnStatus, receiptOk and
      the model by its short name. Always exits 0; a missing report reads as unknown, never success.
  node agent-run.mjs --help
`;

function parse(argv) {
  const o = { run: false, status: false, isNew: false, dir: null, report: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") o.help = true;
    else if (a === "--run") o.run = true;
    else if (a === "--new") o.isNew = true;
    else if (a === "--status") o.status = true;
    else if (a === "--dir") o.dir = argv[++i];
    else if (a === "--report-file") o.report = argv[++i];
    else return { error: `unknown argument: ${a}` };
  }
  return o;
}

const isRegularFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const isDirectory = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const read = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return null; } };
const markerOf = (dir) => (read(path.join(dir, "exit")) ?? "").trim();
const pidOf = (dir) => { const m = /^entrust: pid=(\d+) /.exec((read(path.join(dir, "err.txt")) ?? "").split("\n")[0]); return m ? Number(m[1]) : null; };
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };

// Launch the driver on DIR/prompt.txt. `onExit(status)` runs after the marker is written; `onRefuse()`
// after a refusal has been recorded. Neither returns.
function launch(dir, report, { onExit, onRefuse }) {
  const refuse = (why, { marker = true } = {}) => {
    const line = `${REFUSED}: ${why}\n`;
    process.stderr.write(line);
    if (isDirectory(dir)) {
      // The reason goes beside the run it belongs to, appended so an earlier run's pid line stays first;
      // and the wrapper's wait reads the exit marker, so a refusal has to leave one or the wrapper waits
      // for a driver that never started — unless a marker is already there, which is the refusal that
      // must leave the earlier run's files as they were.
      try { fs.appendFileSync(path.join(dir, "err.txt"), line); } catch {}
      if (marker) { try { fs.writeFileSync(path.join(dir, "exit"), "2\n"); } catch {} }
    }
    onRefuse();
  };
  if (!dir || !isDirectory(dir)) return refuse(`--dir ${JSON.stringify(dir ?? "")} is not a directory`);
  if (fs.existsSync(path.join(dir, "exit")))
    return refuse(`${path.join(dir, "exit")} already exists: one launch per directory, a relaunch gets a fresh one`, { marker: false });
  const promptPath = path.join(dir, "prompt.txt");
  if (!isRegularFile(promptPath)) return refuse(`${promptPath} is not a regular file`);
  if (!report || !path.isAbsolute(report)) return refuse(`--report-file ${JSON.stringify(report ?? "")} is not an absolute path`);
  const outFd = fs.openSync(path.join(dir, "out.json"), "w");
  const errFd = fs.openSync(path.join(dir, "err.txt"), "w");
  const child = spawn(process.execPath, [DRIVER, "--prompt-file", promptPath, "--report-file", report],
    { stdio: ["ignore", outFd, errFd], env: process.env });
  for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(sig, () => { try { child.kill(sig); } catch {} });
  child.on("error", (e) => {
    fs.closeSync(outFd); fs.closeSync(errFd);
    fs.appendFileSync(path.join(dir, "err.txt"), `${REFUSED}: the driver could not be spawned: ${e.message}\n`);
    fs.writeFileSync(path.join(dir, "exit"), "2\n");
    onRefuse();
  });
  child.on("close", (code, signal) => {
    fs.closeSync(outFd); fs.closeSync(errFd);
    const status = code ?? 128 + (os.constants.signals[signal] ?? 0);
    fs.writeFileSync(path.join(dir, "exit"), `${status}\n`);
    onExit(status);
  });
}

const oneLine = (s) => String(s).replace(/\s*\n\s*/g, " / ");

export function statusLines(dir, report) {
  const err = read(path.join(dir, "err.txt")) ?? "";
  let where = "none";
  if (err.includes(ACCEPTED + report)) where = "own";
  if (TAKEN.some((t) => err.includes(t))) where = "taken";
  if (err.includes(REFUSED)) where = "none";
  const lines = [`DRIVER_EXIT=${markerOf(dir) || "unknown"}`, `PATH=${where}`];
  let r = null;
  try { r = JSON.parse(read(report) ?? ""); } catch {}
  if (r && typeof r === "object") {
    const a = r.answerJson && typeof r.answerJson.result === "string" ? r.answerJson.result : r.answer;
    const s = String(a ?? "");
    const t = r.turnError;
    const e = r.error || (t && (typeof t === "string" ? t : (t.message || t.codexErrorInfo || JSON.stringify(t)))) || "";
    lines.push(`EXIT=${r.exitCode}`,
      `FIRST=${s.split("\n")[0].slice(0, FIRST_MAX)}`,
      `ANSWER=${s.length <= ANSWER_MAX ? oneLine(s) : `(long: ${s.length} chars, read the report)`}`,
      `ERROR=${oneLine(e).replace(/ \/ /g, " ").slice(0, ERROR_MAX)}`,
      `RECEIPT=turnStatus=${r.turnStatus ?? "null"} receiptOk=${r.receiptOk ?? "none"} model=${r.model ? (SHORT_NAMES[r.model] ?? r.model) : "none"}`);
  } else {
    // No report: the one reason a coordinator can act on is the launcher's own refusal, if there was one.
    const refusal = err.split("\n").find((l) => l.startsWith(REFUSED)) ?? "";
    lines.push("EXIT=unknown", "FIRST=", "ANSWER=", `ERROR=${refusal.slice(0, ERROR_MAX)}`, "RECEIPT=");
  }
  lines.push(`FILE=${fs.existsSync(report) ? "exists" : "missing"}`, `REPORT=${report}`);
  return lines;
}

// --new: the agent's directory beside the report, the prompt from stdin. The prompt travels coordinator →
// stdin → file, never through the wrapper's model and never through this script's own reading of it as
// text: it is copied byte for byte.
function newAgent(report) {
  const refuse = (why) => { process.stderr.write(`${REFUSED}: ${why}\n`); process.exit(2); };
  if (!report || !path.isAbsolute(report)) refuse(`--report-file ${JSON.stringify(report ?? "")} is not an absolute path`);
  const dir = agentDirOf(report);
  const promptPath = path.join(dir, "prompt.txt");
  if (fs.existsSync(promptPath)) refuse(`${promptPath} already exists: one prompt per report path, a relaunch gets a fresh one`);
  let body;
  try { body = fs.readFileSync(0); } catch (e) { refuse(`could not read the prompt on stdin: ${e.message}`); }
  if (!body || body.length === 0) refuse("the prompt on stdin is empty");
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(promptPath, body, { mode: 0o600 });
  process.stdout.write(`PROMPT=${promptPath}\n`);
  process.exit(0);
}

// A prompt a --new in the same turn has not written yet: wait for it, bounded, before deciding.
function waitForPrompt(dir, cb) {
  const promptPath = path.join(dir, "prompt.txt");
  const deadline = Date.now() + PROMPT_WAIT_MS;
  const tick = () => {
    if (isRegularFile(promptPath) || fs.existsSync(path.join(dir, "err.txt")) || Date.now() > deadline) return cb();
    setTimeout(tick, 200);
  };
  tick();
}

// The one foreground call. Ends, on every path, by printing the status lines and exiting 0: the wrapper
// runs the command again while a result has no REPORT= line, so a refusal that printed none would be an
// endless retry.
function run(dir, report) {
  const finish = () => { process.stdout.write(`${statusLines(dir, report).join("\n")}\n`); process.exit(0); };
  if (!isDirectory(dir)) {
    const why = `${REFUSED}: ${JSON.stringify(dir)} is not a directory`;
    process.stderr.write(`${why}\n`);
    const lines = ["DRIVER_EXIT=unknown", "PATH=none", "EXIT=unknown", "FIRST=", "ANSWER=", `ERROR=${why.slice(0, ERROR_MAX)}`, "RECEIPT=",
      `FILE=${report && fs.existsSync(report) ? "exists" : "missing"}`, `REPORT=${report ?? ""}`];
    process.stdout.write(`${lines.join("\n")}\n`);
    process.exit(0);
  }
  const err = read(path.join(dir, "err.txt")) ?? "";
  const started = /^entrust: pid=/.test(err.split("\n")[0]);
  // A directory that already started a run for ANOTHER report path is a reused directory, which is the
  // one launch this script refuses: reading it would print the earlier run's lines as this run's.
  if (started && !err.includes(ACCEPTED + report) && !err.includes(REFUSED)) {
    try { fs.appendFileSync(path.join(dir, "err.txt"), `${REFUSED}: this directory already ran for another report path; a relaunch gets a fresh one\n`); } catch {}
    return finish();
  }
  if (markerOf(dir)) return finish();
  const pid = pidOf(dir);
  if (pid !== null) {
    // A driver this directory already started: the first call was moved into the background at the
    // tool's ceiling and this is the wrapper running the same command again. Wait for its marker; a
    // driver that died without one ends the wait too, and the lines then say DRIVER_EXIT=unknown. A
    // signal to this call is a Stop on the card, and it has to reach the driver it did not start.
    for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(sig, () => { try { process.kill(pid, sig); } catch {} });
    let gone = 0;
    const tick = () => {
      if (markerOf(dir)) return finish();
      if (!alive(pid) && ++gone > 4) return finish();
      setTimeout(tick, POLL_MS);
    };
    return tick();
  }
  launch(dir, report, { onExit: finish, onRefuse: finish });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const o = parse(process.argv.slice(2));
  if (o.error) { process.stderr.write(`agent-run: ${o.error}\n${USAGE}`); process.exit(2); }
  if (o.help) { process.stdout.write(USAGE); process.exit(0); }
  if (!o.report) { process.stderr.write(`agent-run: --report-file is required\n${USAGE}`); process.exit(2); }
  if (o.isNew) newAgent(o.report);
  const dir = o.dir ?? (path.isAbsolute(o.report) ? agentDirOf(o.report) : null);
  if (dir === null) { process.stderr.write(`${REFUSED}: --report-file ${JSON.stringify(o.report)} is not an absolute path\n`); process.exit(2); }
  if (o.status) { process.stdout.write(`${statusLines(dir, o.report).join("\n")}\n`); process.exit(0); }
  if (o.run) waitForPrompt(dir, () => run(dir, o.report));
  else launch(dir, o.report, { onExit: (status) => process.exit(status), onRefuse: () => process.exit(2) });
}
