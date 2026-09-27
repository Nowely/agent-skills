#!/usr/bin/env node
// Runs one Codex agent's driver for the entrust wrapper in one foreground call, and reads its status back.
//
//   node agent-run.mjs --new --report-file REPORT  < prompt      make the agent's directory beside REPORT, prompt from stdin
//   node agent-run.mjs --plan --run-dir RUN < rows             register the approved agent rows
//   node agent-run.mjs --run --report-file REPORT                start the run, wait, print the status lines
//   node agent-run.mjs --status --report-file REPORT             the status lines of a run, whatever its state
//   node agent-run.mjs --report-file REPORT                      launch only (the exit status is the driver's)
//   node agent-run.mjs --orphan --dir DIR --report-file REPORT   --run's own step: launch only, outside its caller's tree
//   --dir DIR names the agent's directory explicitly; without it, it is `agent/` beside REPORT
//   node agent-run.mjs --help
//
// Why one call: the wrapper is what makes a Codex agent read like a native subagent, and a native
// subagent that runs one command shows one Bash card and its return. The earlier shape showed three
// (a background launch, a polling wait, a status read) because a foreground call has a ten-minute
// ceiling and agents longer than that were lost (incidents.md, "Five of seven agents lost to the wall
// clock"). `--run` keeps the ceiling from costing anything: it is idempotent, and it returns on its own
// before the ceiling. On a fresh directory it starts the launch-only mode as a keeper and waits; on a
// directory whose run is still going it waits; on a finished one it prints. A call that has waited
// RETURN_MS prints RUNNING= where REPORT= would be and exits 0, and the wrapper runs the same command
// again. Every path ends by printing the same nine lines to stdout, which is the tool result the wrapper
// hands back, so nothing has to open a file.
//
// Why a keeper, and why the early return: when a foreground subagent ends, the harness sends SIGTERM to
// its backgrounded command's process group and to every descendant it finds by ppid, then SIGKILL
// (measured 2026-09-26: a wrapper that handed back at the ceiling instead of rerunning ended, and the
// SIGTERM its launcher forwarded cut a ten-minute turn). Only a process in a session of its own whose
// parent has already exited is out of that reach, so the keeper is started through a step that exits at
// once, and the driver is the keeper's child. A launcher cannot tell that teardown from a Stop on the
// card, which it has to forward, so none may still be running when a teardown comes: RETURN_MS is below
// the tool's ten-minute timeout, and a signal after it is not forwarded.
//
// What it keeps: it NEVER opens prompt.txt except as the driver's argument, because a relay that reads a
// prompt can rewrite it (incidents.md, "A relay on a small model"); it passes the driver exactly the two
// flags the page used to and the environment as it found it, CLAUDE_PLUGIN_DATA included; the driver's
// own stderr is what lands in DIR/err.txt, its pid line the first line of the whole pid-line shape (a preload's
// output may stand before it). DIR is `agent/` beside the report, made
// by --new at 0700 with the prompt it read on stdin at 0600, so one run's four files (prompt.txt on
// entry, out.json, err.txt and exit on the way out) sit next to its report and nothing is left in
// $TMPDIR; exit is written last, after both output files are closed. --new puts the prompt through the
// driver's --check-prompt-file before it is prompt.txt, so a refusal the run would make offline reaches
// the coordinator before an agent is spawned. A coordinator may issue --new and the Agent call in one
// turn: --run waits a few seconds for the prompt to appear. One launch per DIR: a second launch into a
// directory that already ran is refused, because it would overwrite the first run's record (measured
// 2026-09-17 on the earlier shape), and a launch claims err.txt exclusively, so two racing for one
// directory start one driver; under --run a directory that ran for THIS report path is a status read,
// which the ceiling's second call needs, and one that ran for another path is refused. That refusal, and
// a launch's into a directory whose run has ended, goes to its caller alone: a line added to that run's
// err.txt is read by the run's own calls, which then printed PATH=none for a run that had published to
// its own path (measured 2026-09-27). Whose run a directory holds is decided on the driver's pid line,
// the first complete line of its whole shape wherever it stands in err.txt, by the whole path it names,
// so a call that comes while the run is being born, err.txt claimed and the line not yet there, waits
// for the line and forwards nothing to a driver that is not its own. A launch claims DIR by creating
// err.txt before it writes anything there: a refusal is recorded in DIR only under the refusing launch's
// own claim, and one made where the claim is another launch's, or where no DIR is named at all (a REPORT
// that is not absolute and no --dir), goes to stderr alone (measured 2026-09-27: a relative REPORT
// launched into a live run's directory appended to its err.txt and wrote its exit marker).

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRIVER = path.join(HERE, "driver.mjs");
const SELF = fileURLToPath(import.meta.url);

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
// How long --run waits for the run before it prints RUNNING= and exits 0: under the 600 s timeout the
// wrapper's message pins, with 30 s for the launcher's own start after the tool call. The variable is
// for the suites.
export const RETURN_MS = Number(process.env.AGENT_RUN_RETURN_MS) || 570000;
const SIGNALS = ["SIGTERM", "SIGINT", "SIGHUP"];
export const agentDirOf = (report) => path.join(path.dirname(report), "agent");

const USAGE = `agent-run — make, run or read one Codex agent for the wrapper.

  node agent-run.mjs --plan --run-dir RUN < rows
      Register rows id | model | role | writes | tokens in RUN/plan.txt at 0600; RUN is 0700.
      Models: astra, sol, terra, luna, opus, sonnet, haiku, fable. Writes: nothing,
      worktree, live tree, or write <absolute dir>. Ids start with a letter and then
      use letters, digits, _ or -; each is unique ignoring case and cannot end in -<digits>.
      Tokens are a nonnegative integer or unknown. classifyRole derives the
      WORKERS/CHECKING counts. --plan --amend appends new rows explicitly; show the
      amendment and wait for approval before launching them. Prints PLAN= and an
      AGENT= line per row and WORKERS=/CHECKING= totals, or AMENDED= for an amendment. A plan
      records declared scope; it does not certify actual cost or live caps.
  node agent-run.mjs --new --report-file REPORT  < prompt
      Makes the agent's directory, agent/ beside REPORT (or --dir DIR), at 0700, puts the prompt read on
      stdin through driver.mjs --check-prompt-file, and only on a pass makes it DIR/prompt.txt at 0600
      and prints PROMPT=<path>. A refusal prints ERROR=<the driver's reason> and no PROMPT= line, exits
      2 and leaves no prompt.txt: a --run finds nothing to start, and the same command with the prompt
      corrected is the retry. A check that neither passes nor refuses is a fault in the driver, and
      ERROR= says so, exit 2 the same way. Refuses (exit 2) a REPORT that is not absolute, an empty
      prompt, and a directory that already holds a prompt: a relaunch gets a fresh report path. A
      directory that holds a launch's exit, err.txt or out.json and no prompt (a --run came after a
      refused --new) is refused the same way, with ERROR= naming the file: the path is spent.
      When RUN/plan.txt exists, REPORT must be RUN/<id>/report.json for a listed agent.
      RUN/<id>-<n>/report.json, n from 2 with no leading zero, continues listed <id>
      (a RESUME:, relaunch, or advisor's next question) once the previous link's
      agent/exit exists. planRowOf matches the listed row and its continuation.
      A second agent needs a row of its own.
  node agent-run.mjs --run --report-file REPORT
      One foreground call, idempotent; DIR is agent/ beside REPORT unless --dir names it, and a prompt
      not there yet is waited for up to ${PROMPT_WAIT_MS / 1000} s (a --new issued in the same turn).
      A fresh DIR: starts the launch-only mode below as a keeper in a session of its own, outside this
      call's process tree, so the run outlives the call. Every call, the first and a rerun alike, then
      waits for DIR's run: for the driver's pid line (up to ${PROMPT_WAIT_MS / 1000} s, or the lines say
      ERROR=the driver did not start), then for the exit marker, and prints the status lines. A call
      that has waited ${RETURN_MS / 1000} s prints them with RUNNING=pid <pid>, <n> s so far; run the same
      command again in place of REPORT=, DRIVER_EXIT=running, and exits 0: this is the early return,
      before the tool's ten-minute ceiling, the run goes on, and the same command again waits for it.
      A DIR that already ran for this REPORT: prints. A DIR whose run is for another report path,
      being born, running or ended, is refused on this call's own lines, the reason on ERROR=, and
      nothing is written to DIR: the driver's pid line decides, by the whole path it names, and a run
      whose line is not there yet is waited for. Always exits 0 once the lines are printed, a missing
      DIR included; the driver's own status is the DRIVER_EXIT line. A signal it receives (SIGTERM,
      SIGINT, SIGHUP) goes to the driver, the pid on its pid line in DIR/err.txt, which cuts the turn
      and publishes; one that arrives before that line is delivered when it appears and names this
      REPORT, and is dropped when it names another; one after the early return's deadline is not
      forwarded.
  node agent-run.mjs --report-file REPORT [--dir DIR]
      Launch only, the keeper --run starts: the same run without the wait's printing, exiting with the
      driver's status. It claims DIR by creating DIR/err.txt before it writes anything there. Under its
      own claim it refuses, exit 2 with the reason in DIR/err.txt and a DIR/exit of 2: a prompt.txt
      that is not a regular file, and a REPORT that is not absolute (with --dir). Without a claim it
      refuses on stderr alone, exit 2, nothing written: a DIR that is not one; a DIR whose exit marker
      already exists, whose files are an earlier run's; and a DIR whose err.txt is already there, which
      is another launch's claim, with the reason this launch would have recorded, if it had one.
  node agent-run.mjs --orphan --dir DIR --report-file REPORT
      --run's own step: starts the launch-only mode in a session of its own and exits at once, so the
      keeper's parent is gone before anything looks for it.
  node agent-run.mjs --status --report-file REPORT [--dir DIR]
      Prints nine lines: ${STATUS_LINES.join(", ")}. PATH is own where the
      driver's pid line names REPORT, the whole path, taken where the driver refused a path already
      there or could not publish, none otherwise or where the launch was refused. ANSWER is the whole
      answer on one line when it is at most ${ANSWER_MAX} characters, else a pointer to the report; ERROR is the report's
      error, else its turnError, else the launcher's own refusal; RECEIPT is turnStatus, receiptOk and
      the model by its short name. Always exits 0; a missing report reads as unknown, never success.
  node agent-run.mjs --help

  A REPORT that is not absolute, in each form:
      without --dir it names no DIR, and every mode refuses it on stderr alone, exit 2, before anything
      is read or written: --run and --status print no lines. With --dir, --new refuses it the same way;
      launch-only refuses it as above, under its claim or on stderr alone; --run on a fresh DIR prints
      the lines of its keeper's recorded refusal, and on a DIR whose run is another's refuses it as
      another report path; --status prints DIR's lines for it.
`;

function parse(argv) {
  const o = { run: false, status: false, isNew: false, isPlan: false, amend: false, runDir: null, orphan: false, dir: null, report: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") o.help = true;
    else if (a === "--run") o.run = true;
    else if (a === "--new") o.isNew = true;
    else if (a === "--plan") o.isPlan = true;
    else if (a === "--amend") o.amend = true;
    else if (a === "--run-dir") o.runDir = argv[++i];
    else if (a === "--status") o.status = true;
    else if (a === "--orphan") o.orphan = true;
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
// The driver's pid line: the first complete line in err.txt, wherever it stands, of the whole shape
// `entrust: pid=<n> identity=<id> reportPath=<path>`. Taken as the first line, anything on stderr before
// the driver's own first write (a preload's line, a warning) made a run read PATH=none and stopped the
// forwarding of its signals (measured 2026-09-27); a line of the shape in part, or with no newline yet, is
// not it.
const PID_LINE = new RegExp(`^entrust: pid=(\\d+) identity=(\\S.*?) ${ACCEPTED}(.+)$`);
const pidLineIn = (err) => err.split("\n").slice(0, -1).map((l) => PID_LINE.exec(l)).find(Boolean) ?? null;
const pidIn = (err) => { const m = pidLineIn(err); return m ? Number(m[1]) : null; };
// The report path the driver accepted, compared whole: a substring test read REPORT as its own run in a
// directory that ran for REPORT.old.
const acceptedIn = (err) => pidLineIn(err)?.[3] ?? null;
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };

// This script again, in a session of its own with no stdio, and not waited for.
function spawnDetached(args) {
  const child = spawn(process.execPath, [SELF, ...args], { detached: true, stdio: "ignore", env: process.env });
  child.on("error", () => {});
  child.unref();
}

// Launch the driver on DIR/prompt.txt. `onExit(status)` runs after the marker is written; `onRefuse()`
// after a refusal. Neither returns.
function launch(dir, report, { onExit, onRefuse }) {
  // Without the claim DIR is not this launch's, and a refusal is said on stderr alone: a line added to
  // err.txt or a marker written there would be read by the run that holds the directory.
  const refuse = (why) => { process.stderr.write(`${REFUSED}: ${why}\n`); onRefuse(); };
  if (!dir || !isDirectory(dir)) return refuse(`--dir ${JSON.stringify(dir ?? "")} is not a directory`);
  // A marker already there makes DIR an earlier run's: its files are that run's record, and a line added
  // to its err.txt would turn the run's PATH=own into PATH=none on every later read.
  if (fs.existsSync(path.join(dir, "exit")))
    return refuse(`${path.join(dir, "exit")} already exists: one launch per directory, a relaunch gets a fresh one`);
  const promptPath = path.join(dir, "prompt.txt");
  const why = !isRegularFile(promptPath) ? `${promptPath} is not a regular file`
    : !report || !path.isAbsolute(report) ? `--report-file ${JSON.stringify(report ?? "")} is not an absolute path` : null;
  // The claim on DIR, before anything is written there: a second keeper racing this one (a --run and its
  // rerun each starting one) finds err.txt there and leaves with nothing written.
  let errFd;
  try { errFd = fs.openSync(path.join(dir, "err.txt"), "wx"); }
  catch (e) { if (e.code === "EEXIST") return refuse(why ?? `${path.join(dir, "err.txt")} already exists: another launch holds this directory`); throw e; }
  // Under its own claim a refusal is recorded beside the launch, with a marker, because the wrapper's wait
  // reads the marker and would otherwise wait for a driver that never started.
  if (why) {
    const line = `${REFUSED}: ${why}\n`;
    process.stderr.write(line);
    try { fs.writeSync(errFd, line); } catch {}
    try { fs.closeSync(errFd); } catch {}
    try { fs.writeFileSync(path.join(dir, "exit"), "2\n"); } catch {}
    return onRefuse();
  }
  const outFd = fs.openSync(path.join(dir, "out.json"), "w");
  const child = spawn(process.execPath, [DRIVER, "--prompt-file", promptPath, "--report-file", report],
    { stdio: ["ignore", outFd, errFd], env: process.env });
  for (const sig of SIGNALS) process.on(sig, () => { try { child.kill(sig); } catch {} });
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

const PLAN_MODELS = new Set(["astra", "sol", "terra", "luna", "opus", "sonnet", "haiku", "fable"]);
const CLAUDE_MODELS = new Set(["opus", "sonnet", "haiku", "fable"]);
const PLAN_HEADER = "id | model | role | writes | tokens";
const planError = (why) => { process.stdout.write(`ERROR=${why}\n`); process.exit(2); };
export function classifyRole(role) {
  const worker = /implement|writ|worker|build|fix|исполн|писат/i.test(role);
  const assurance = /critic|verif|review|refut|judge|check|test|advis|критик|провер|ревью/i.test(role);
  return worker && !assurance ? "worker" : assurance ? "checking" : null;
}
// Return the registered row and the preceding link for a launch, or null for an unlisted name.
// A gate may use the row without probing the marker; the launcher requires it before creating a prompt.
export function planRowOf(name, rows, runDir) {
  const exact = rows.find((r) => r.id.toLowerCase() === name.toLowerCase());
  if (exact) return { row: exact, previous: null, ended: true };
  const m = /^(.*)-([2-9]|[1-9][0-9]+)$/.exec(name);
  if (!m) return null;
  const row = rows.find((r) => r.id.toLowerCase() === m[1].toLowerCase());
  if (!row) return null;
  const number = Number(m[2]);
  const previous = number === 2 ? row.id : `${row.id}-${number - 1}`;
  return { row, previous, ended: !runDir || fs.existsSync(path.join(runDir, previous, "agent", "exit")) };
}
const planRows = (body) => {
  const lines = body.split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));
  if (lines[0] === PLAN_HEADER) lines.shift();
  if (!lines.length) planError("the plan has no agent rows");
  const rows = lines.map((line) => {
    const fields = line.split("|").map((s) => s.trim());
    if (fields.length !== 5) planError(`expected ${PLAN_HEADER}: ${line}`);
    const [id, model, role, writes, tokens] = fields;
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) planError(`invalid agent id: ${id}`);
    if (/-\d+$/.test(id)) planError(`invalid agent id ${id}: the -<n> form names a continuation`);
    if (!PLAN_MODELS.has(model.toLowerCase())) planError(`invalid model for ${id}: ${model}`);
    if (!classifyRole(role)) planError(`invalid role for ${id}: ${role}`);
    if (!/^(nothing|worktree|live tree|write \/\S.*)$/.test(writes)) planError(`invalid writes for ${id}: ${writes}`);
    if (!/^(unknown|0|[1-9]\d*)$/.test(tokens)) planError(`invalid tokens for ${id}: ${tokens}`);
    return { id, model, role, writes, tokens };
  });
  if (new Set(rows.map((r) => r.id.toLowerCase())).size !== rows.length) planError("duplicate agent id");
  return rows;
};

function registerPlan(runDir, amend) {
  if (!runDir || !path.isAbsolute(runDir)) planError("--run-dir must be absolute");
  const file = path.join(runDir, "plan.txt");
  let prior = [];
  if (amend) {
    if (!isRegularFile(file)) planError(`cannot amend missing plan at ${file}`);
    prior = planRows(read(file));
  } else if (fs.existsSync(file)) planError(`plan already exists at ${file}; use --plan --amend`);
  let body;
  try { body = fs.readFileSync(0, "utf8"); } catch (e) { planError(`could not read plan: ${e.message}`); }
  const rows = planRows(body);
  if (rows.some((r) => prior.some((p) => p.id.toLowerCase() === r.id.toLowerCase()))) planError("duplicate agent id in amendment");
  fs.mkdirSync(runDir, { recursive: true, mode: 0o700 });
  const all = [...prior, ...rows];
  const serialized = rows.map((r) => [r.id, r.model, r.role, r.writes, r.tokens].join(" | ")).join("\n");
  if (amend) fs.appendFileSync(file, `# amended ${new Date().toISOString()}\n${serialized}\n`);
  else fs.writeFileSync(file, `${PLAN_HEADER}\n${serialized}\n`, { mode: 0o600, flag: "wx" });
  process.stdout.write(`${amend ? "AMENDED" : "PLAN"}=${file}\n${rows.map((r) => `AGENT=${r.id} ${r.model} ${r.writes}`).join("\n")}\nWORKERS=${all.filter((r) => classifyRole(r.role) === "worker").length}\nCHECKING=${all.filter((r) => classifyRole(r.role) === "checking").length}\n`);
}

export function statusLines(dir, report) {
  const err = read(path.join(dir, "err.txt")) ?? "";
  let where = "none";
  if (acceptedIn(err) === report) where = "own";
  if (TAKEN.some((t) => err.includes(t))) where = "taken";
  if (err.includes(REFUSED)) where = "none";
  const lines = [`DRIVER_EXIT=${markerOf(dir) || "unknown"}`, `PATH=${where}`];
  let r = null;
  try { r = JSON.parse(read(report) ?? ""); } catch {}
  if (r && typeof r === "object") {
    const a = r.schemaOverflow ? r.answer
      : r.answerJson && typeof r.answerJson.result === "string" ? r.answerJson.result : r.answer;
    const s = String(a ?? "");
    const t = r.turnError;
    const e = r.error || (t && (typeof t === "string" ? t : (t.message || t.codexErrorInfo || JSON.stringify(t)))) || "";
    lines.push(`EXIT=${r.exitCode}`,
      `FIRST=${s.split("\n")[0].slice(0, FIRST_MAX)}`,
      `ANSWER=${s.length <= ANSWER_MAX ? oneLine(s) : `(long: ${s.length} chars, read the report)`}`,
      `ERROR=${oneLine(e).replace(/ \/ /g, " ").slice(0, ERROR_MAX)}`,
      `RECEIPT=turnStatus=${r.turnStatus ?? "null"} receiptOk=${r.receiptOk ?? "none"} model=${r.model ? shortName(r.model) : "none"}`);
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
function newAgent(report, dirOverride) {
  const refuse = (why) => { process.stderr.write(`${REFUSED}: ${why}\n`); process.exit(2); };
  if (!report || !path.isAbsolute(report)) refuse(`--report-file ${JSON.stringify(report ?? "")} is not an absolute path`);
  if (dirOverride !== null && dirOverride !== undefined && !path.isAbsolute(dirOverride)) refuse(`--dir ${JSON.stringify(dirOverride)} is not an absolute path`);
  const runDir = path.dirname(path.dirname(report));
  const id = path.basename(path.dirname(report));
  const ancestors = [path.dirname(report), runDir, path.dirname(runDir)];
  const planDir = ancestors.find((d) => fs.existsSync(path.join(d, "plan.txt")));
  if (planDir) {
    const plan = path.join(planDir, "plan.txt");
    if (path.basename(report) !== "report.json" || path.dirname(path.dirname(report)) !== planDir)
      planError(`REPORT must be ${planDir}/<row id or continuation>/report.json`);
    const rows = planRows(read(plan) ?? "");
    const matched = planRowOf(id, rows, planDir);
    if (!matched) planError(`${id} is not in the approved plan at ${plan}; amend it with --plan --amend and show the amendment`);
    if (CLAUDE_MODELS.has(matched.row.model.toLowerCase()))
      planError(`${id} is a Claude agent in the plan at ${plan}; a Codex agent needs a row of its own: amend it with --plan --amend and show the amendment`);
    if (!matched.ended)
      planError(`${id} continues ${matched.previous}, which has not ended; wait for it, or amend the plan and show the amendment`);
  }
  const dir = dirOverride ?? agentDirOf(report);
  const promptPath = path.join(dir, "prompt.txt");
  if (fs.existsSync(promptPath)) refuse(`${promptPath} already exists: one prompt per report path, a relaunch gets a fresh one`);
  // A launch's own files with no prompt beside them: a --run came to this path after a refused --new and
  // its keeper refused in turn. A prompt written here now would be read as that launch's, and the next
  // --run would print the old refusal as this prompt's result.
  const earlier = ["exit", "err.txt", "out.json"].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
  if (earlier) {
    process.stdout.write(`ERROR=${earlier} is an earlier launch's: this report path is spent, and a corrected prompt goes under a fresh report path\n`);
    process.exit(2);
  }
  let body;
  try { body = fs.readFileSync(0); } catch (e) { refuse(`could not read the prompt on stdin: ${e.message}`); }
  if (!body || body.length === 0) refuse("the prompt on stdin is empty");
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  // The driver's own offline check, run as the driver is, on the file under another name: a --run in the
  // same turn waits for prompt.txt, so the name appears only once the check has passed, and no driver
  // starts on a prompt the run would refuse. The refusal used to arrive at --run, after the agent was
  // spawned, and coordinators swapped in the mode it named (2026-09-17 and 2026-09-25).
  const checked = `${promptPath}.check`;
  fs.writeFileSync(checked, body, { mode: 0o600 });
  const c = spawnSync(process.execPath, [DRIVER, "--check-prompt-file", checked],
    { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", env: process.env, timeout: 30000 });
  if (c.status !== 0) {
    fs.rmSync(checked, { force: true });
    const said = String(c.stderr ?? "").trim();
    const refusal = /^entrust: refused: (.+)$/.exec(said);
    const how = c.error ? c.error.message : c.signal ? `signal ${c.signal}` : `exit ${c.status}`;
    process.stdout.write(`ERROR=${c.status === 2 && refusal ? refusal[1]
      : `the driver's --check-prompt-file ended with ${how}, a fault in the driver and no verdict on the prompt${said ? `: ${oneLine(said).slice(0, ERROR_MAX)}` : ""}`}\n`);
    process.exit(2);
  }
  fs.renameSync(checked, promptPath);
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

// The one foreground call. Ends, on every path, by printing nine lines and exiting 0: the wrapper runs
// the command again while a result has no REPORT= line, so a refusal that printed none would be an
// endless retry, and the early return prints RUNNING= in its place for exactly that rerun.
function run(dir, report) {
  const t0 = Date.now();
  let pid = null, kept = null;
  // A Stop on the card, whichever call is in flight: no call is the driver's parent, so the signal goes to
  // the pid on the driver's pid line. One that comes before that line is kept until it appears, and
  // dropped if the line names another report path; one after RETURN_MS is dropped, because a call past its
  // deadline can only be receiving the teardown the early return is there to keep away from the run.
  for (const sig of SIGNALS) process.on(sig, () => {
    if (Date.now() - t0 >= RETURN_MS) return;
    if (pid === null) kept = sig;
    else { try { process.kill(pid, sig); } catch {} }
  });
  const print = (lines) => { process.stdout.write(`${lines.join("\n")}\n`); process.exit(0); };
  const finish = () => print(statusLines(dir, report));
  // A refusal that reads no run: this call's own lines, and nothing written to DIR.
  const refused = (why) => print(["DRIVER_EXIT=unknown", "PATH=none", "EXIT=unknown", "FIRST=", "ANSWER=", `ERROR=${why.slice(0, ERROR_MAX)}`,
    "RECEIPT=", `FILE=${report && fs.existsSync(report) ? "exists" : "missing"}`, `REPORT=${report ?? ""}`]);
  const foreign = () => refused(`${REFUSED}: this directory's run is for another report path; a relaunch gets a fresh one`);
  waitForPrompt(dir, () => {
    if (!isDirectory(dir)) {
      const why = `${REFUSED}: ${JSON.stringify(dir)} is not a directory`;
      process.stderr.write(`${why}\n`);
      return refused(why);
    }
    const err = read(path.join(dir, "err.txt")) ?? "";
    // A directory whose driver started for ANOTHER report path, running or ended, is another run's:
    // reading it would print that run's lines as this call's, and a refusal added to its err.txt is read
    // by that run's own calls as theirs.
    if (pidIn(err) !== null && acceptedIn(err) !== report) return foreign();
    if (markerOf(dir)) return finish();
    // A fresh directory: the keeper, through the orphaning step. A directory whose err.txt exists has a
    // launch already, and a second keeper would only lose the claim on it.
    if (!fs.existsSync(path.join(dir, "err.txt"))) spawnDetached(["--orphan", "--dir", dir, "--report-file", report]);
    // Then the same wait for the first call and a rerun: the driver's pid line, then its marker. A driver
    // that died without one ends the wait too, and the lines then say DRIVER_EXIT=unknown.
    const startBy = Date.now() + PROMPT_WAIT_MS;
    let gone = 0;
    const tick = () => {
      // Until the pid line is there the run is being born and whose it is is unknown: the line decides,
      // read once for both, so a call for another path refuses on it with nothing forwarded, a signal kept
      // meanwhile included.
      const err = pid === null ? read(path.join(dir, "err.txt")) ?? "" : "";
      const born = pid === null ? pidIn(err) : null;
      if (born !== null && acceptedIn(err) !== report) return foreign();
      if (markerOf(dir)) return finish();
      if (pid === null) {
        pid = born;
        if (pid === null) {
          if (Date.now() < startBy) return setTimeout(tick, 100);
          const lines = statusLines(dir, report);
          lines[STATUS_LINES.indexOf("ERROR")] = "ERROR=the driver did not start";
          return print(lines);
        }
        if (kept) { try { process.kill(pid, kept); } catch {} }
      }
      if (!alive(pid) && ++gone > 4) return finish();
      if (Date.now() - t0 >= RETURN_MS) {
        const lines = statusLines(dir, report);
        lines[0] = "DRIVER_EXIT=running";
        lines[STATUS_LINES.indexOf("REPORT")] = `RUNNING=pid ${pid}, ${Math.round((Date.now() - t0) / 1000)} s so far; run the same command again`;
        return print(lines);
      }
      setTimeout(tick, POLL_MS);
    };
    tick();
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const o = parse(process.argv.slice(2));
  if (o.error) { process.stderr.write(`agent-run: ${o.error}\n${USAGE}`); process.exit(2); }
  if (o.help) { process.stdout.write(USAGE); process.exit(0); }
  if (o.isPlan) { if (o.report || o.dir || o.run || o.status || o.isNew || o.orphan) planError("--plan cannot be combined with agent modes"); registerPlan(o.runDir, o.amend); process.exit(0); }
  if (o.amend || o.runDir) { process.stderr.write("agent-run: --amend and --run-dir require --plan\n"); process.exit(2); }
  if (!o.report) { process.stderr.write(`agent-run: --report-file is required\n${USAGE}`); process.exit(2); }
  if (o.isNew) newAgent(o.report, o.dir);
  const dir = o.dir ?? (path.isAbsolute(o.report) ? agentDirOf(o.report) : null);
  if (dir === null) { process.stderr.write(`${REFUSED}: --report-file ${JSON.stringify(o.report)} is not an absolute path\n`); process.exit(2); }
  if (o.status) { process.stdout.write(`${statusLines(dir, o.report).join("\n")}\n`); process.exit(0); }
  // The orphaning step: its child's parent is gone as soon as it is started.
  if (o.orphan) { spawnDetached(["--dir", dir, "--report-file", o.report]); process.exit(0); }
  if (o.run) run(dir, o.report);
  else launch(dir, o.report, { onExit: (status) => process.exit(status), onRefuse: () => process.exit(2) });
}
