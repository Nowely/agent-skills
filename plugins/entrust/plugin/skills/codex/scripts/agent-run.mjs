#!/usr/bin/env node
// Runs one Codex agent's driver for the entrust wrapper in one foreground call, and reads its status back.
//
//   node agent-run.mjs --new --report-file REPORT  < prompt      make the agent's directory and mailbox beside REPORT, prompt from stdin
//   node agent-run.mjs --run --report-file REPORT                launch, wait, print the status lines or the request waiting
//   node agent-run.mjs --status --report-file REPORT             the status lines of a run, whatever its state
//   node agent-run.mjs --pending --report-file REPORT            the approval requests waiting on a decision
//   node agent-run.mjs --decide ID --accept|--decline [--why TEXT] --report-file REPORT   answer one
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
// on a finished one it prints. It ends by printing the nine status lines to stdout, or, while the run
// waits on a decision, the request itself; either is the tool result the wrapper hands back, and both
// end in a REPORT= line, so nothing has to open a file and the wrapper's rerun step never loops. The
// driver it launches runs under a detached shell that writes the exit marker, because a call that hands
// a request back ends while the run goes on.
//
// What it keeps: it NEVER opens prompt.txt except as the driver's --prompt-file argument, because a
// relay that reads a prompt can rewrite it (incidents.md, "A relay on a small model"); it passes the
// driver exactly the two flags the page used to, plus the mailbox under --run, and the environment as
// it found it, CLAUDE_PLUGIN_DATA included; the driver's own stderr, its pid line first, is what lands
// in DIR/err.txt. DIR is `agent/`
// beside the report, made by --new at 0700 with the prompt it read on stdin at 0600, so one run's four
// files (prompt.txt on entry, out.json, err.txt and exit on the way out) sit next to its report and
// nothing is left in $TMPDIR; exit is written last, after both output files are closed. A coordinator
// may issue --new and the Agent call in one turn: --run waits a few seconds for the prompt to appear. One launch per DIR: a second
// launch into a directory that already ran is refused, because it would overwrite the first run's record
// (measured 2026-09-17 on the earlier shape); under --run a directory that ran for THIS report path is a
// status read, which the ceiling's second call needs, and one that ran for another path is refused.
//
// Every agent has a mailbox, DIR/approvals/, made by --new beside the prompt and handed to the driver by
// --run; no flag arms it, because nobody could say who would leave one off. The launch-only form hands it
// no mailbox: its caller (swarm) runs agents nobody is there to answer, so their requests are declined at
// once as before. --pending and --decide
// are the caller's two hands on it, because a coordinator cannot write under the data directory itself
// and must never hand-write a decision: --decide copies the run's identity out of the request file,
// publishes by link(2) so one decision per request is all there can be, and reads the request again
// afterwards to say whether the driver still took it.

import { spawn } from "node:child_process";
import crypto from "node:crypto";
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
// The short names the page uses for the catalogue's slugs, whatever the generation: the status line says
// what the coordinator retells, and the slug stays in the report. Any other model stays as written.
export const SHORT_NAMES = ["Astra", "Sol", "Terra", "Luna"];
export const shortName = (slug) =>
  SHORT_NAMES.find((n) => new RegExp(`^gpt-\\d+(?:\\.\\d+)*-${n}$`, "i").test(slug)) ?? slug;
export const FIRST_MAX = 300, ANSWER_MAX = 600, ERROR_MAX = 300;
// The status read prints these names, in this order, whatever it found.
export const STATUS_LINES = ["DRIVER_EXIT", "PATH", "EXIT", "FIRST", "ANSWER", "ERROR", "RECEIPT", "FILE", "REPORT"];
const POLL_MS = 500;
// How long --run waits for a prompt that a --new issued in the same turn has not written yet.
export const PROMPT_WAIT_MS = 10000;
export const agentDirOf = (report) => path.join(path.dirname(report), "agent");

const USAGE = `agent-run — make, run or read one Codex agent for the wrapper.

  node agent-run.mjs --new --report-file REPORT  < prompt
      Makes the agent's directory, agent/ beside REPORT (or --dir DIR), at 0700, writes the prompt read on
      stdin to its prompt.txt at 0600, and makes its mailbox, DIR/approvals/, at 0700; prints PROMPT= and
      APPROVALS=. Needs the driver's state directory in ENTRUST_STATE_DIR, else CLAUDE_PLUGIN_DATA,
      absolute, and REPORT and DIR both inside it, where no agent's sandbox can write a decision.
      Refuses (exit 2) a REPORT that is not absolute, no state directory, a REPORT or a DIR outside it,
      an empty prompt, and a directory that already holds a prompt: a relaunch gets a fresh report path.
  node agent-run.mjs --run --report-file REPORT
      One foreground call, idempotent; DIR is agent/ beside REPORT unless --dir names it, and a prompt
      not there yet is waited for up to ${PROMPT_WAIT_MS / 1000} s (a --new issued in the same turn).
      A fresh DIR: runs driver.mjs --prompt-file DIR/prompt.txt --report-file REPORT --approval-dir
      DIR/approvals (made here if an older --new left none), under a detached shell so the run outlives
      this call, with stdout in DIR/out.json and stderr in DIR/err.txt and the driver's exit status
      written to DIR/exit last. A DIR whose driver is still running (the harness moved the first call
      into the background at its ceiling, or you are continuing after a decision): waits the same way.
      It prints one of three results, and the last line of each is REPORT=:
        waiting — the run waits on your decision: for each request waiting, the lines --pending prints
          for it (first line REQUEST=), then REQUESTS=<n>, WAITING=<id>[,<id>] and REPORT=<REPORT>.
          The run goes on. Decide each with --decide, then run the same --run again: it waits for the
          next result. A request whose decision is published and not yet taken is not handed back.
        ended — the run is over: the nine status lines --status prints, first line DRIVER_EXIT=.
        refused — the directory, the launch or the driver's own checks refused the run before a turn
          (a mailbox outside the state directory among them): the nine lines, DRIVER_EXIT=2 or unknown,
          the reason on ERROR=.
      Always exits 0 once the lines are printed, a missing DIR included; the driver's own status is the
      DRIVER_EXIT line. A signal it receives (SIGTERM, SIGINT, SIGHUP) goes to the driver, which cuts the
      turn and publishes; after a waiting result nothing holds the driver, so stop it with --decide
      --decline and the same --run, or kill -TERM the pid on the first line of DIR/err.txt.
  node agent-run.mjs --report-file REPORT [--dir DIR]
      Launch only: the same run without the wait's printing, exiting with the driver's status, and with no
      mailbox: every approval request is declined at once, since no caller is waiting to answer. Refuses,
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
      the model by its short name, then, read from DIR/approvals with or without a report,
      approvals=A/D/E/O (accepted, declined, expired, still open or orphaned) when any request was
      offered, auto=N when the driver accepted file changes its rights covered, late=N for valid
      decisions nobody took (its request was settled first, or the run ended with it open) and stale=N
      for decision files that are not their request's, whenever they came. Always exits 0; a missing
      report reads as unknown, never success.
  node agent-run.mjs --pending --report-file REPORT [--dir DIR]
      Prints each request waiting on a decision — one DIR/approvals/pending lists — as REQUEST=<id>,
      THREAD=root or the subagent's path, METHOD=, KIND=, CAUSE= (sandbox: the same command had just
      failed inside the sandbox, or the request is a widening; policy: no attempt was seen; outside: a
      file change not shown inside the agent's roots), CWD=, REASON= (the agent's own), ROOTS= (the roots
      the agent may write, "; " between them), DEADLINE= (an ISO time, or none), REPEAT_OF=<id> where a
      command widening follows a permissions request you declined in the same turn, then FILES= for a
      file change ("add /a; update /b -> /c", or unknown where no item named them) or the command: whole,
      newlines kept, on the lines between COMMAND<<TOKEN and COMMAND>>TOKEN, TOKEN drawn fresh for each
      print and never in the command. A widening — a permissions request (no command block), or a
      command carrying the paths it would add — then prints one ACCESS=<access> <type>:<value> per entry
      (write path:/abs, read glob_pattern:<pattern>, write special:project_roots) and NETWORK=on, off or
      none: a yes grants exactly those, the command running inside the sandbox with them added, for the
      rest of the turn for a permissions request and for that command for the other. Every value outside
      that block is one line: a backslash, a line break and every other control character in it written
      as \\\\, \\n, \\r, \\t or \\uXXXX, and a ; inside a ROOTS or FILES item as \\;. Then LATE=<id> and
      STALE=<id> as counted above and, once DIR/exit exists, ORPHANED=<id> for each request the run left
      unanswered, then REQUESTS=<n>, the number still waiting. Always exits 0.
  node agent-run.mjs --decide ID --accept|--decline [--why TEXT] --report-file REPORT [--dir DIR]
      Publishes the decision for request ID as DIR/approvals/ID.decision.json at 0600, by link(2) over a
      temp file, carrying the run identity copied from the request. Refuses (exit 2, REFUSED=ID and the
      reason) an ID with no request, a run that is over, a request already settled, a request pending
      does not list, a request already decided, naming that decision, and one with a stale decision in
      the way. Then reads the request again: DECIDED=ID accept|decline and exit 0 while it was still
      open, or LATE=ID and exit 3 when the driver settled it first — nothing ran on your word.
  node agent-run.mjs --help
`;

function parse(argv) {
  const o = { run: false, status: false, isNew: false, dir: null, report: null, help: false,
              pending: false, decide: null, decision: null, why: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") o.help = true;
    else if (a === "--run") o.run = true;
    else if (a === "--new") o.isNew = true;
    else if (a === "--status") o.status = true;
    else if (a === "--dir") o.dir = argv[++i];
    else if (a === "--report-file") o.report = argv[++i];
    else if (a === "--pending") o.pending = true;
    else if (a === "--decide") o.decide = argv[++i] ?? "";
    else if (a === "--accept" || a === "--decline") {
      if (o.decision !== null) return { error: "--accept and --decline: one decision per call" };
      o.decision = a === "--accept" ? "accept" : "decline";
    }
    else if (a === "--why") o.why = argv[++i] ?? "";
    else return { error: `unknown argument: ${a}` };
  }
  if (o.decide !== null && o.decision === null) return { error: "--decide needs --accept or --decline" };
  if (o.decide === null && (o.decision !== null || o.why !== null)) return { error: "--accept, --decline and --why belong to --decide" };
  return o;
}

const isRegularFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const isDirectory = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const read = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return null; } };
const markerOf = (dir) => (read(path.join(dir, "exit")) ?? "").trim();
const pidOf = (dir) => { const m = /^entrust: pid=(\d+) /.exec((read(path.join(dir, "err.txt")) ?? "").split("\n")[0]); return m ? Number(m[1]) : null; };
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };

const readJsonFile = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
// A path resolved through its longest existing prefix, so a directory --new is about to make is compared
// where it will actually be.
function resolveLoose(p) {
  const rest = [];
  for (let cur = path.resolve(p); ; ) {
    try { return path.join(fs.realpathSync(cur), ...rest); } catch {}
    const parent = path.dirname(cur);
    if (parent === cur) return path.resolve(p);
    rest.unshift(path.basename(cur));
    cur = parent;
  }
}
const within = (child, parent) => {
  const rel = path.relative(parent, child);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel));
};

// The shape of a request id the driver makes: a sequence number and eight hex digits. Anything else in the
// mailbox is not a request of any run, and an id is also a file name, so nothing else may name one.
const REQUEST_ID = /^\d+-[0-9a-f]{8}$/;
// Whether a decision file is the one for this request of this run: the identity --decide copies out of the
// request, and the one the driver checks before it takes a decision.
const decisionFits = (d, q) => d?.id === q.id && d?.run?.pid === q.run?.pid && d?.run?.startedAtMs === q.run?.startedAtMs
  && (d?.run?.turnId ?? null) === (q.run?.turnId ?? null) && (d?.decision === "accept" || d?.decision === "decline");

// What DIR/approvals holds, read from the files alone: every request in the order the driver offered them,
// the ids `pending` lists, and the decisions nobody took. A decision whose identity is not its request's is
// stale, whenever it came; a valid one is late when the driver settled the request without it, or the run
// ended with the request still open. `over` is the run's own exit marker.
function mailbox(dir) {
  const box = path.join(dir, "approvals");
  const over = fs.existsSync(path.join(dir, "exit"));
  let names = [];
  try { names = fs.readdirSync(box); } catch { return { box, armed: false, requests: [], pending: [], late: [], stale: [], over }; }
  const seqOf = (id) => Number.parseInt(String(id), 10) || 0;
  const requests = names.filter((n) => n.endsWith(".request.json")).map((n) => [n, readJsonFile(path.join(box, n))])
    .filter(([n, q]) => q && typeof q.id === "string" && REQUEST_ID.test(q.id) && n === `${q.id}.request.json`)
    .map(([, q]) => q).sort((a, b) => seqOf(a.id) - seqOf(b.id));
  const pending = (read(path.join(box, "pending")) ?? "").split("\n").filter((l) => REQUEST_ID.test(l));
  const late = [], stale = [];
  for (const q of requests) {
    if (!names.includes(`${q.id}.decision.json`)) continue;
    if (!decisionFits(readJsonFile(path.join(box, `${q.id}.decision.json`)), q)) stale.push(q.id);
    else if (q.settled ? q.settled.by !== "coordinator" : over) late.push(q.id);
  }
  return { box, armed: true, requests, pending, late, stale, over };
}

// One value on one line, whatever it holds: a backslash, a line break of any kind and every other control
// character escaped, so no value can end its own line and forge the next field. In a list, a ; inside an
// item is escaped too, so no item can forge another.
const ESCAPED = { "\\": "\\\\", "\n": "\\n", "\r": "\\r", "\t": "\\t" };
const field = (s) => [...String(s ?? "")].map((c) => {
  const n = c.codePointAt(0);
  if (ESCAPED[c]) return ESCAPED[c];
  return n < 0x20 || n === 0x7f || n === 0x85 || n === 0x2028 || n === 0x2029 ? `\\u${n.toString(16).padStart(4, "0")}` : c;
}).join("");
const item = (s) => field(s).replace(/;/g, "\\;");

// The shell a --run launch runs the driver under: its redirections close both output files when the driver
// exits, and only then does it write the exit status, 128 plus the signal for a killed driver as the
// in-process launch computes it. Paths arrive as arguments, never spliced into the script.
const KEEPER = 'out=$1 err=$2 ex=$3; shift 3; "$@" >"$out" 2>"$err"; printf "%s\\n" "$?" >"$ex"';

// Launch the driver on DIR/prompt.txt. Launch-only: in this process, `onExit(status)` after the marker is
// written. Under --run (`onStarted`): under the detached KEEPER, so the run outlives a call that hands a
// request back, and `onStarted(keeperPid)` at once. `onRefuse()` after a refusal has been recorded. None
// returns.
function launch(dir, report, { onExit, onRefuse, onStarted = null }) {
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
  // The mailbox --new made, handed over under --run; a directory an older --new left without one gets it
  // here. The driver checks where it lies.
  const box = path.join(dir, "approvals");
  if (onStarted) { try { fs.mkdirSync(box, { mode: 0o700 }); } catch (e) { if (e.code !== "EEXIST") return refuse(`${box} cannot be made: ${e.message}`); } }
  const approvalArgs = onStarted ? ["--approval-dir", box] : [];
  const driverArgv = [DRIVER, "--prompt-file", promptPath, "--report-file", report, ...approvalArgs];
  if (onStarted) {
    const keeper = spawn("/bin/sh", ["-c", KEEPER, "entrust-keeper", path.join(dir, "out.json"), path.join(dir, "err.txt"),
      path.join(dir, "exit"), process.execPath, ...driverArgv], { stdio: "ignore", detached: true, env: process.env });
    keeper.on("error", (e) => {
      fs.appendFileSync(path.join(dir, "err.txt"), `${REFUSED}: the driver could not be spawned: ${e.message}\n`);
      fs.writeFileSync(path.join(dir, "exit"), "2\n");
      onRefuse();
    });
    keeper.unref();
    return onStarted(keeper.pid);
  }
  const outFd = fs.openSync(path.join(dir, "out.json"), "w");
  const errFd = fs.openSync(path.join(dir, "err.txt"), "w");
  const child = spawn(process.execPath, driverArgv, { stdio: ["ignore", outFd, errFd], env: process.env });
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
  if (!r || typeof r !== "object") r = null;
  // Read from the request files, which the driver settles before it answers, so a run whose report was
  // lost still says whether a command ran with your rights; the driver's own acceptances never touch the
  // mailbox and come from the report.
  const box = mailbox(dir);
  const count = (d) => box.requests.filter((q) => q.settled?.decision === d).length;
  const approvals = [
    ...(box.requests.length ? [`approvals=${count("accepted")}/${count("declined")}/${count("expired")}/${box.requests.filter((q) => !q.settled).length}`] : []),
    ...(r && r.approvalsAutoAccepted > 0 ? [`auto=${r.approvalsAutoAccepted}`] : []),
    ...(box.late.length ? [`late=${box.late.length}`] : []),
    ...(box.stale.length ? [`stale=${box.stale.length}`] : []),
  ].join(" ");
  if (r) {
    const a = r.answerJson && typeof r.answerJson.result === "string" ? r.answerJson.result : r.answer;
    const s = String(a ?? "");
    const t = r.turnError;
    const e = r.error || (t && (typeof t === "string" ? t : (t.message || t.codexErrorInfo || JSON.stringify(t)))) || "";
    lines.push(`EXIT=${r.exitCode}`,
      `FIRST=${s.split("\n")[0].slice(0, FIRST_MAX)}`,
      `ANSWER=${s.length <= ANSWER_MAX ? oneLine(s) : `(long: ${s.length} chars, read the report)`}`,
      `ERROR=${oneLine(e).replace(/ \/ /g, " ").slice(0, ERROR_MAX)}`,
      `RECEIPT=turnStatus=${r.turnStatus ?? "null"} receiptOk=${r.receiptOk ?? "none"} model=${r.model ? shortName(r.model) : "none"}${approvals ? ` ${approvals}` : ""}`);
  } else {
    // No report: the one reason a coordinator can act on is the launcher's own refusal, if there was one.
    const refusal = err.split("\n").find((l) => l.startsWith(REFUSED)) ?? "";
    lines.push("EXIT=unknown", "FIRST=", "ANSWER=", `ERROR=${refusal.slice(0, ERROR_MAX)}`, `RECEIPT=${approvals}`);
  }
  lines.push(`FILE=${fs.existsSync(report) ? "exists" : "missing"}`, `REPORT=${report}`);
  return lines;
}

// --new: the agent's directory beside the report, the prompt from stdin. The prompt travels coordinator →
// stdin → file, never through the wrapper's model and never through this script's own reading of it as
// text: it is copied byte for byte.
function newAgent(report, dirOverride) {
  const refuse = (why) => { process.stderr.write(`${REFUSED}: ${why}\n`); process.exit(2); };
  if (!report || !path.isAbsolute(report)) refuse(`--report-file ${JSON.stringify(report ?? "")} is not an absolute path`);
  if (dirOverride !== null && dirOverride !== undefined && !path.isAbsolute(dirOverride)) refuse(`--dir ${JSON.stringify(dirOverride)} is not an absolute path`);
  const dir = dirOverride ?? agentDirOf(report);
  const promptPath = path.join(dir, "prompt.txt");
  if (fs.existsSync(promptPath)) refuse(`${promptPath} already exists: one prompt per report path, a relaunch gets a fresh one`);
  // Every agent gets a mailbox, and a mailbox is only safe inside the driver's state directory, which no
  // agent's sandbox can write: so the variable that names it is needed here, the same one the run call
  // carries, and nothing is guessed without it — the driver keeps no default either. An early refusal in
  // the caller's own call; the driver's inode check on the mailbox is the wall. The report is checked as
  // well as the directory: --dir can put the mailbox under the state directory while the report, which a
  // relaunch reads the run back from, lands anywhere.
  const state = process.env.ENTRUST_STATE_DIR || process.env.CLAUDE_PLUGIN_DATA || "";
  if (!path.isAbsolute(state))
    refuse(`--new needs the driver's state directory, where the agent's mailbox goes: pass CLAUDE_PLUGIN_DATA on this call as the run call does, or export ENTRUST_STATE_DIR, as an absolute path (got ${JSON.stringify(state)})`);
  const stateReal = resolveLoose(state);
  for (const [what, p] of [["report", report], ["agent's directory", dir]])
    if (!within(resolveLoose(p), stateReal) || resolveLoose(p) === stateReal)
      refuse(`--new needs the ${what} inside the state directory ${stateReal}, where no agent's sandbox can write a decision; ${p} is not (name a report path under it)`);
  let body;
  try { body = fs.readFileSync(0); } catch (e) { refuse(`could not read the prompt on stdin: ${e.message}`); }
  if (!body || body.length === 0) refuse("the prompt on stdin is empty");
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(promptPath, body, { mode: 0o600 });
  const box = path.join(dir, "approvals");
  fs.mkdirSync(box, { recursive: true, mode: 0o700 });
  process.stdout.write(`PROMPT=${promptPath}\nAPPROVALS=${box}\n`);
  process.exit(0);
}

// --pending: what a coordinator reads before it decides, every word of it. Each field is one escaped line,
// and the command goes whole, newlines kept, between two marker lines carrying a token drawn fresh for
// this print and absent from the command, so no command can end its own block or forge a field after it:
// a script-shaped command read on one clipped line is a command approved unread. A request is waiting when
// `pending` lists it, the driver's own open set.
// A widening's profile as the lines the coordinator reads: one ACCESS= per filesystem entry, `write
// path:/abs`, `read glob_pattern:**/*.lock` or `write special:project_roots`, the legacy read and write
// lists standing in only where `entries` is absent, then NETWORK= on, off or none.
function accessLines(perm) {
  const fsys = perm?.fileSystem ?? null;
  const entries = Array.isArray(fsys?.entries) && fsys.entries.length ? fsys.entries.map((e) => [e?.access, e?.path])
    : [...(fsys?.write ?? []).map((x) => ["write", { type: "path", path: x }]), ...(fsys?.read ?? []).map((x) => ["read", { type: "path", path: x }])];
  const where = (x) => x?.type === "path" ? `path:${x.path}` : x?.type === "glob_pattern" ? `glob_pattern:${x.pattern}`
    : x?.type === "special" ? `special:${x?.value?.kind ?? "unknown"}${x?.value?.subpath ? `:${x.value.subpath}` : x?.value?.path ? `:${x.value.path}` : ""}`
    : `${x?.type ?? "unknown"}:${JSON.stringify(x)}`;
  const net = perm?.network == null || perm.network.enabled == null ? "none" : perm.network.enabled ? "on" : "off";
  return [...entries.map(([access, x]) => `ACCESS=${field(access)} ${field(where(x))}`), `NETWORK=${net}`];
}

function requestLines(q) {
  const out = [`REQUEST=${q.id}`, `THREAD=${q.subagent ? field(q.agentPath ?? q.run?.threadId ?? "unknown") : "root"}`,
    `METHOD=${field(q.method)}`, `KIND=${field(q.kind ?? "none")}`, `CAUSE=${field(q.cause ?? "unknown")}`, `CWD=${field(q.cwd)}`,
    `REASON=${field(q.reason)}`, `ROOTS=${(q.roots ?? []).map(item).join("; ")}`, `DEADLINE=${field(q.deadlineAt ?? "none")}`,
    ...(q.repeatOf ? [`REPEAT_OF=${field(q.repeatOf)}`] : [])];
  if (q.method === "item/fileChange/requestApproval") out.push(`FILES=${Array.isArray(q.fileChanges)
    ? q.fileChanges.map((c) => `${item(c.kind)} ${item(c.path)}${c.move ? ` -> ${item(c.move)}` : ""}`).join("; ") : "unknown"}`);
  else if (q.method !== "item/permissions/requestApproval") {
    const command = String(q.command ?? "");
    let token;
    do token = crypto.randomBytes(6).toString("hex"); while (command.includes(token));
    out.push(`COMMAND<<${token}`, command, `COMMAND>>${token}`);
  }
  if (q.permissions) out.push(...accessLines(q.permissions));
  return out;
}

function pendingRequests(dir) {
  const box = mailbox(dir);
  const out = [];
  let waiting = 0;
  for (const q of box.requests) {
    if (q.settled) continue;
    if (box.over) { out.push(`ORPHANED=${q.id}`); continue; }
    if (!box.pending.includes(q.id)) continue;
    waiting++;
    out.push(...requestLines(q));
  }
  for (const id of box.late) out.push(`LATE=${id}`);
  for (const id of box.stale) out.push(`STALE=${id}`);
  out.push(`REQUESTS=${waiting}`);
  process.stdout.write(`${out.join("\n")}\n`);
  process.exit(0);
}

// The requests --run hands back: open, listed in `pending`, and with no decision file yet. One with a
// decision on disk is decided, and the driver takes it within APPROVAL_POLL_MS, so a --run continued a
// moment after --decide waits for that instead of handing the same request back.
function waitingRequests(dir) {
  const box = mailbox(dir);
  if (box.over) return [];
  return box.requests.filter((q) => !q.settled && box.pending.includes(q.id)
    && !fs.existsSync(path.join(box.box, `${q.id}.decision.json`)));
}

// --decide: one decision per request, published whole or not at all, never over another one.
function decideRequest(dir, id, decision, why) {
  const refuse = (msg) => { process.stdout.write(`REFUSED=${id} ${msg}\n`); process.exit(2); };
  // The id names a file, so it is held to the driver's own shape: nothing else can walk out of the mailbox.
  if (!REQUEST_ID.test(id)) refuse("is not a request id");
  const box = path.join(dir, "approvals");
  const requestPath = path.join(box, `${id}.request.json`);
  const q = readJsonFile(requestPath);
  if (!q || q.id !== id) refuse(`has no request in ${box}`);
  if (fs.existsSync(path.join(dir, "exit"))) refuse("belongs to a run that is over; nothing can take a decision now");
  if (q.settled) refuse(`was already settled: ${q.settled.decision} by ${q.settled.by}${q.settled.why ? ` (${q.settled.why})` : ""} at ${q.settled.settledAt}`);
  // `pending` is the driver's own list of what it is waiting on; a request file it does not list is not
  // one it will read a decision for.
  if (!mailbox(dir).pending.includes(id)) refuse(`is not waiting: ${path.join(box, "pending")} does not list it`);
  const target = path.join(box, `${id}.decision.json`);
  const tmp = `${target}.${crypto.randomBytes(8).toString("hex")}.tmp`;
  const record = { id: q.id, run: { pid: q.run?.pid ?? null, startedAtMs: q.run?.startedAtMs ?? null, turnId: q.run?.turnId ?? null },
                   decision, by: "coordinator", why, decidedAt: new Date().toISOString() };
  let failure = null;
  try {
    fs.writeFileSync(tmp, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    fs.linkSync(tmp, target);
  } catch (e) { failure = e; }
  fs.rmSync(tmp, { force: true });
  if (failure?.code === "EEXIST") {
    const prior = readJsonFile(target);
    if (!decisionFits(prior, q))
      refuse(`has a stale decision in the way at ${target}, one that is not this run's or not this request's; the driver will not take it, and the request waits until the run ends it`);
    refuse(`was already decided: ${prior.decision}${prior.why ? ` (${field(prior.why)})` : ""}`);
  }
  if (failure) refuse(`could not be published: ${failure.message}`);
  // A test seam and nothing else: a pause between the publication and the re-read, the window in which the
  // driver can settle the request first. The launcher suite lands a settlement there; nothing else sets it.
  const seamMs = Number(process.env.ENTRUST_DECIDE_SEAM_MS);
  if (seamMs > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, seamMs);
  const after = readJsonFile(requestPath);
  if (after?.settled?.by === "coordinator" || (!after?.settled && !fs.existsSync(path.join(dir, "exit")))) {
    process.stdout.write(`DECIDED=${id} ${decision}\n`);
    process.exit(0);
  }
  process.stdout.write(`LATE=${id} ${decision}: ${after?.settled
    ? `the driver settled this request as ${after.settled.decision} (${after.settled.why}) at ${after.settled.settledAt}`
    : "the run ended with it unanswered"}; nothing ran on this decision\n`);
  process.exit(3);
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

// The one foreground call. Ends, on every path, by printing the status lines or the waiting requests and
// exiting 0, the last line REPORT= either way: the wrapper runs the command again while a result has no
// REPORT= line, so a refusal that printed none would be an endless retry.
function run(dir, report) {
  const finish = () => { process.stdout.write(`${statusLines(dir, report).join("\n")}\n`); process.exit(0); };
  const handBack = (waiting) => {
    const lines = [...waiting.flatMap(requestLines), `REQUESTS=${waiting.length}`,
                   `WAITING=${waiting.map((q) => q.id).join(",")}`, `REPORT=${report}`];
    process.stdout.write(`${lines.join("\n")}\n`);
    process.exit(0);
  };
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
  // One wait for every way in: a driver this call launches, one an earlier call launched (moved into the
  // background at the tool's ceiling, or handed a request back and now continued). It ends at the exit
  // marker, at a request waiting on a decision, or at a driver that died without a marker, and the lines
  // then say DRIVER_EXIT=unknown. A signal to this call is a Stop on the card, and it has to reach the
  // driver, whose pid is on the first line of err.txt; one that lands before that line exists is
  // delivered as soon as it does.
  let pid = pidOf(dir), keeperPid = null, heldSignal = null;
  for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(sig, () => {
    if (pid !== null) { try { process.kill(pid, sig); } catch {} } else heldSignal = sig;
  });
  const wait = () => {
    let gone = 0;
    const tick = () => {
      if (markerOf(dir)) return finish();
      const waiting = waitingRequests(dir);
      if (waiting.length) return handBack(waiting);
      if (pid === null) pid = pidOf(dir);
      if (pid !== null && heldSignal) { try { process.kill(pid, heldSignal); } catch {} heldSignal = null; }
      const watched = pid ?? keeperPid;
      if (watched !== null && !alive(watched) && ++gone > 4) return finish();
      setTimeout(tick, POLL_MS);
    };
    tick();
  };
  if (pid !== null) return wait();
  launch(dir, report, { onRefuse: finish, onStarted: (kp) => { keeperPid = kp ?? null; wait(); } });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const o = parse(process.argv.slice(2));
  if (o.error) { process.stderr.write(`agent-run: ${o.error}\n${USAGE}`); process.exit(2); }
  if (o.help) { process.stdout.write(USAGE); process.exit(0); }
  if (!o.report) { process.stderr.write(`agent-run: --report-file is required\n${USAGE}`); process.exit(2); }
  if (o.isNew) newAgent(o.report, o.dir);
  const dir = o.dir ?? (path.isAbsolute(o.report) ? agentDirOf(o.report) : null);
  if (dir === null) { process.stderr.write(`${REFUSED}: --report-file ${JSON.stringify(o.report)} is not an absolute path\n`); process.exit(2); }
  if (o.status) { process.stdout.write(`${statusLines(dir, o.report).join("\n")}\n`); process.exit(0); }
  if (o.pending) pendingRequests(dir);
  if (o.decide !== null) decideRequest(dir, o.decide, o.decision, o.why);
  if (o.run) waitForPrompt(dir, () => run(dir, o.report));
  else launch(dir, o.report, { onExit: (status) => process.exit(status), onRefuse: () => process.exit(2) });
}
