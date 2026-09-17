#!/usr/bin/env node
// Launches one Codex agent's driver for the entrust wrapper, and reads its status back.
//
//   node agent-run.mjs --dir DIR --report-file REPORT            launch
//   node agent-run.mjs --status --dir DIR --report-file REPORT   the status lines
//   node agent-run.mjs --help
//
// Why a script: the wrapper's message used to carry the launch (four redirects and an exit marker) and
// the status read (two greps and a node program) in full, DIR nine times and REPORT five, about 2700
// characters a coordinator typed for every agent, measured 2026-09-17 at 14 to 16 seconds of each
// launch. Here the message names two paths and this script does the rest.
//
// What it keeps: it NEVER opens prompt.txt except as the driver's --prompt-file argument, because a
// relay that reads a prompt can rewrite it (incidents.md, "A relay on a small model"); it passes the
// driver exactly the two flags the page used to and the environment as it found it, CLAUDE_PLUGIN_DATA
// included; the driver's own stderr, its pid line first, is what lands in DIR/err.txt. DIR holds
// prompt.txt on entry and out.json, err.txt and exit on the way out, the four names both pages
// promise; exit is written last, after both output files are closed, so a wait on it never reads a
// half-written report. One launch per DIR: an exit marker already there is refused, because a second
// run there would overwrite the first run's record (measured 2026-09-17 on the earlier shape).

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

const USAGE = `agent-run — launch one Codex agent's driver for the wrapper, or read its status.

  node agent-run.mjs --dir DIR --report-file REPORT
      Runs driver.mjs --prompt-file DIR/prompt.txt --report-file REPORT with stdout in DIR/out.json
      and stderr in DIR/err.txt, then writes the driver's exit status to DIR/exit, last, and exits
      with it. A signal it receives (SIGTERM, SIGINT, SIGHUP) goes to the driver, which cuts the turn
      and publishes; the marker is still written. Refuses, exit 2 with the reason in DIR/err.txt and
      DIR/exit where DIR is a directory: a DIR that is not one, a prompt.txt that is not a regular
      file, a REPORT that is not absolute, and a DIR whose exit marker already exists (one launch per
      DIR; that refusal leaves the earlier run's files as they were and appends its reason to err.txt).
  node agent-run.mjs --status --dir DIR --report-file REPORT
      Prints nine lines: ${STATUS_LINES.join(", ")}. PATH is own where the
      driver's pid line names REPORT, taken where the driver refused a path already there or could not
      publish, none otherwise or where this launch was refused. ANSWER is the whole answer on one line
      when it is at most ${ANSWER_MAX} characters, else a pointer to the report; ERROR is the report's
      error, else its turnError; RECEIPT is turnStatus, receiptOk and the model by its short name.
      Always exits 0; a missing report reads as unknown, never success.
  node agent-run.mjs --help
`;

function parse(argv) {
  const o = { status: false, dir: null, report: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") o.help = true;
    else if (a === "--status") o.status = true;
    else if (a === "--dir") o.dir = argv[++i];
    else if (a === "--report-file") o.report = argv[++i];
    else return { error: `unknown argument: ${a}` };
  }
  return o;
}

const isRegularFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const isDirectory = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };

function launch(dir, report) {
  const refuse = (why, { marker = true } = {}) => {
    const line = `${REFUSED}: ${why}\n`;
    process.stderr.write(line);
    if (isDirectory(dir)) {
      // The reason goes beside the run it belongs to, appended so an earlier run's pid line stays first;
      // and the wait in the wrapper reads the exit marker, so a refusal has to leave one or the wrapper
      // waits for a driver that never started — unless a marker is already there, which is the refusal
      // that must leave the earlier run's files as they were.
      try { fs.appendFileSync(path.join(dir, "err.txt"), line); } catch {}
      if (marker) { try { fs.writeFileSync(path.join(dir, "exit"), "2\n"); } catch {} }
    }
    process.exit(2);
  };
  if (!dir || !isDirectory(dir)) refuse(`--dir ${JSON.stringify(dir ?? "")} is not a directory`);
  if (fs.existsSync(path.join(dir, "exit")))
    refuse(`${path.join(dir, "exit")} already exists: one launch per directory, a relaunch gets a fresh one`, { marker: false });
  const promptPath = path.join(dir, "prompt.txt");
  if (!isRegularFile(promptPath)) refuse(`${promptPath} is not a regular file`);
  if (!report || !path.isAbsolute(report)) refuse(`--report-file ${JSON.stringify(report ?? "")} is not an absolute path`);
  // The refusal above for a reused directory appended to err.txt; a launch that starts opens both
  // files fresh, which is the one moment the earlier run's record could be lost, and the refusal is
  // what keeps that moment from arriving.
  const outFd = fs.openSync(path.join(dir, "out.json"), "w");
  const errFd = fs.openSync(path.join(dir, "err.txt"), "w");
  const child = spawn(process.execPath, [DRIVER, "--prompt-file", promptPath, "--report-file", report],
    { stdio: ["ignore", outFd, errFd], env: process.env });
  for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(sig, () => { try { child.kill(sig); } catch {} });
  child.on("error", (e) => {
    fs.closeSync(outFd); fs.closeSync(errFd);
    fs.appendFileSync(path.join(dir, "err.txt"), `${REFUSED}: the driver could not be spawned: ${e.message}\n`);
    fs.writeFileSync(path.join(dir, "exit"), "2\n");
    process.exit(2);
  });
  child.on("close", (code, signal) => {
    fs.closeSync(outFd); fs.closeSync(errFd);
    const status = code ?? 128 + (os.constants.signals[signal] ?? 0);
    fs.writeFileSync(path.join(dir, "exit"), `${status}\n`);
    process.exit(status);
  });
}

const oneLine = (s) => String(s).replace(/\s*\n\s*/g, " / ");

export function statusLines(dir, report) {
  const read = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return null; } };
  const exitText = (read(path.join(dir, "exit")) ?? "").trim();
  const err = read(path.join(dir, "err.txt")) ?? "";
  let where = "none";
  if (err.includes(ACCEPTED + report)) where = "own";
  if (TAKEN.some((t) => err.includes(t))) where = "taken";
  if (err.includes(REFUSED)) where = "none";
  const lines = [`DRIVER_EXIT=${exitText || "unknown"}`, `PATH=${where}`];
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
    lines.push("EXIT=unknown", "FIRST=", "ANSWER=", "ERROR=", "RECEIPT=");
  }
  lines.push(`FILE=${fs.existsSync(report) ? "exists" : "missing"}`, `REPORT=${report}`);
  return lines;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const o = parse(process.argv.slice(2));
  if (o.error) { process.stderr.write(`agent-run: ${o.error}\n${USAGE}`); process.exit(2); }
  if (o.help) { process.stdout.write(USAGE); process.exit(0); }
  if (o.status) {
    if (!o.dir || !o.report) { process.stderr.write(`agent-run: --status needs --dir and --report-file\n`); process.exit(2); }
    process.stdout.write(`${statusLines(o.dir, o.report).join("\n")}\n`);
    process.exit(0);
  }
  launch(o.dir, o.report);
}
