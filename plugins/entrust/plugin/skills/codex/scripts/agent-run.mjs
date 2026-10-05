#!/usr/bin/env node
// Runs one Codex agent's driver for the entrust wrapper in one foreground call, and reads its status back.
//
//   node agent-run.mjs --new --report-file REPORT  < prompt      make the agent's directory and mailbox beside REPORT, prompt from stdin
//   node agent-run.mjs --plan --run-dir RUN < rows             register the approved agent rows
//   node agent-run.mjs --run --report-file REPORT                start the run, wait, print the status lines or the request waiting
//   node agent-run.mjs --status --report-file REPORT             the status lines of a run, whatever its state
//   node agent-run.mjs --pending --report-file REPORT            the approval requests waiting on a decision
//   node agent-run.mjs --decide ID --accept|--decline [--why TEXT] --report-file REPORT   answer one (--accept: the command on stdin)
//   node agent-run.mjs --report-file REPORT                      launch only (the exit status is the driver's)
//   node agent-run.mjs --orphan --dir DIR --report-file REPORT   --run's own step: launch only, with the mailbox, outside its caller's tree
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
// again. Every other path ends by printing to stdout the nine status lines or, while the run waits on a
// decision, the request itself; either is the tool result the wrapper hands back, and both end in a
// REPORT= line, so nothing has to open a file. A call that hands a request back ends while the run goes
// on under its keeper.
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
// flags the page used to, plus the mailbox under --run, and the environment as it found it,
// CLAUDE_PLUGIN_DATA included; the driver's
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
//
// Every agent has a mailbox, DIR/approvals/, made by --new beside the prompt and handed to the driver by
// --run's keeper; no flag a caller sets arms it, because nobody could say who would leave one off. The
// launch-only form a caller runs itself hands it no mailbox: that caller (swarm) runs agents nobody is
// there to answer, so their requests are declined at once as before. The keeper is the same launch-only
// form, and --keeper, which only the orphan step passes, is what tells the two apart. --pending and --decide
// are the caller's two hands on it, because a coordinator cannot write under the data directory itself
// and must never hand-write a decision: --decide copies the run's identity out of the request file,
// publishes by link(2) so one decision per request is all there can be, and reads the request again
// afterwards to say whether the driver still took it.

import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRIVER = path.join(HERE, "driver.mjs");
const OPENCODE_DRIVER = path.resolve(HERE, "../../opencode/scripts/driver.mjs");
const SELF = fileURLToPath(import.meta.url);
const ADAPTERS = new Set(["codex", "opencode"]);

function backendOf(dir, requested = null) {
  const file = path.join(dir, "backend.json");
  const saved = readJsonFile(file);
  if (fs.existsSync(file) && (!saved || !ADAPTERS.has(saved.adapter))) throw new Error("invalid backend.json; refusing to guess the adapter");
  const adapter = saved?.adapter ?? requested ?? "codex";
  if (saved && requested && adapter !== requested) throw new Error(`this invocation belongs to ${adapter}, not ${requested}`);
  return { adapter, driver: adapter === "opencode" ? OPENCODE_DRIVER : DRIVER, saved };
}
function backendEnv(backend) {
  const env = { ...process.env,
    ...(backend.saved?.serverUrl ? { ENTRUST_OPENCODE_URL: backend.saved.serverUrl } : {}),
    ...(backend.saved?.connectionFile ? { ENTRUST_OPENCODE_CONNECTION: backend.saved.connectionFile } : {}),
    ...(backend.saved?.planModel ? { ENTRUST_PLAN_MODEL: backend.saved.planModel } : {}),
    ...(backend.saved?.planWrites ? { ENTRUST_PLAN_WRITES: backend.saved.planWrites } : {}) };
  if (backend.saved?.localServer) {
    env.ENTRUST_OPENCODE_LOCAL = "1";
    delete env.ENTRUST_OPENCODE_URL;
    delete env.ENTRUST_OPENCODE_CONNECTION;
  }
  return env;
}

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

  --adapter codex|opencode selects the backend at --new and is pinned in agent/backend.json.
  OpenCode starts a private loopback server automatically; ENTRUST_OPENCODE_URL or ENTRUST_OPENCODE_CONNECTION selects a remote server.
  Extended plan rows: id | adapter | model | role | writes | tokens; adapter is native, codex or
  opencode. An OpenCode row pins its full provider/model ID. Existing five-column plans still work.
  Typed OpenCode requests print REQUEST_BODY<<TOKEN / REQUEST_BODY>>TOKEN. --accept restates that
  JSON on stdin and grants once. Questions use --decide ID --answer with {answers: string[][]} on
  stdin, or --decline. --answer is never a command or permission approval.

  node agent-run.mjs --plan --run-dir RUN < rows
      Register rows id | model | role | writes | tokens in RUN/plan.txt at 0600; RUN is 0700.
      Models: astra, sol, terra, luna, opus, sonnet, haiku, fable. Writes: nothing,
      worktree, live tree, or write <absolute dir>. Ids start with a letter and then
      use letters, digits, _ or -; each is unique ignoring case and cannot end in -<digits>.
      Tokens are a nonnegative integer or unknown; the role is any non-empty text. --plan --amend
      appends new rows explicitly; show the amendment and wait for approval before launching
      them. Prints PLAN=, or AMENDED= for an amendment, and an AGENT= line per row it adds. A
      plan records declared scope; it does not certify actual cost or live caps.
  node agent-run.mjs --new --report-file REPORT  < prompt
      Makes the agent's directory, agent/ beside REPORT (or --dir DIR), at 0700, puts the prompt read on
      stdin through driver.mjs --check-prompt-file, and only on a pass makes it DIR/prompt.txt at 0600,
      makes its mailbox, DIR/approvals/, at 0700, and prints PROMPT=<path> and APPROVALS=<path>. A
      refusal prints ERROR=<the driver's reason> and no PROMPT= line, exits 2 and leaves no prompt.txt:
      a --run finds nothing to start, and the same command with the prompt corrected is the retry. A
      check that neither passes nor refuses is a fault in the driver, and ERROR= says so, exit 2 the same
      way. Needs the driver's state directory in ENTRUST_STATE_DIR, else CLAUDE_PLUGIN_DATA, absolute,
      and REPORT and DIR both inside it, where no agent's sandbox can write a decision. Refuses (exit 2)
      a REPORT that is not absolute, no state directory, a REPORT or a DIR outside it, an empty prompt,
      and a directory that already holds a prompt: a relaunch gets a fresh report path. A directory that
      holds a launch's exit, err.txt or out.json and no prompt (a --run came after a refused --new) is
      refused the same way, with ERROR= naming the file: the path is spent.
      When RUN/plan.txt exists, REPORT must be RUN/<id>/report.json for a listed agent.
      RUN/<id>-<n>/report.json, n from 2 with no leading zero, continues listed <id>
      (a RESUME:, relaunch, or advisor's next question) once the previous link's
      agent/exit exists. planRowOf matches the listed row and its continuation.
      A second agent needs a row of its own.
  node agent-run.mjs --run --report-file REPORT
      With --watch, newly pending requests are emitted once as EVENT=waiting frames between
      EVENT<<TOKEN and EVENT>>TOKEN. The call keeps waiting, including while a decision is pending;
      --decide may run separately. Signals still reach this run's driver. Terminal status and the
      RUNNING= checkpoint retain their existing meaning. --watch requires --run alone.
      One foreground call, idempotent; DIR is agent/ beside REPORT unless --dir names it, and a prompt
      not there yet is waited for up to ${PROMPT_WAIT_MS / 1000} s (a --new issued in the same turn).
      A fresh DIR: starts the launch-only mode below as a keeper in a session of its own, outside this
      call's process tree, so the run outlives the call; the keeper hands the driver the mailbox,
      --approval-dir DIR/approvals (made there if an older --new left none). Every call, the first, a
      rerun and a call continuing after a decision alike, then waits for DIR's run: for the driver's pid
      line (up to ${PROMPT_WAIT_MS / 1000} s, or the lines say ERROR=the driver did not start), then for
      the exit marker or a request waiting on a decision. It prints one of four results:
        waiting — the run waits on your decision: for each request waiting, the lines --pending prints
          for it (first line REQUEST=), then REQUESTS=<n>, WAITING=<id>[,<id>] and REPORT=<REPORT>.
          The run goes on. Decide each with --decide, then run the same --run again: it waits for the
          next result. A request whose decision is published and not yet taken is not handed back.
        ended — the run is over: the nine status lines --status prints, first line DRIVER_EXIT=.
        refused — the directory, the launch or the driver's own checks refused the run before a turn
          (a mailbox outside the state directory among them): the nine lines, DRIVER_EXIT=2 or unknown,
          the reason on ERROR=.
        running — the call has waited ${RETURN_MS / 1000} s: the nine lines with DRIVER_EXIT=running and
          RUNNING=pid <pid>, <n> s so far; run the same command again in place of REPORT=. This is the
          early return, before the tool's ten-minute ceiling; the run goes on, and the same command
          again waits for it.
      The last line of the first three is REPORT=. A DIR that already ran for this REPORT: prints. A
      DIR whose run is for another report path, being born, running or ended, is refused on this call's
      own lines, the reason on ERROR=, and nothing is written to DIR: the driver's pid line decides, by
      the whole path it names, and a run whose line is not there yet is waited for. Always exits 0 once
      the lines are printed, a missing DIR included; the driver's own status is the DRIVER_EXIT line. A
      signal it receives (SIGTERM, SIGINT, SIGHUP) goes to the driver, the pid on its pid line in
      DIR/err.txt, which cuts the turn and publishes; one that arrives before that line is delivered
      when it appears and names this REPORT, and is dropped when it names another; one after the early
      return's deadline is not forwarded. After a waiting result no call holds the driver, so stop it
      with --decide --decline and the same --run, or kill -TERM the pid on its pid line in DIR/err.txt.
  node agent-run.mjs --report-file REPORT [--dir DIR]
      Launch only: the same run without the wait's printing, exiting with the driver's status. Run by a
      caller itself, it hands the driver no mailbox: every approval request is declined at once, since
      no caller is waiting to answer. The keeper --run starts is this mode marked --keeper by the orphan
      step, and hands the driver DIR/approvals. It claims DIR by creating DIR/err.txt before it writes
      anything there. Under its own claim it refuses, exit 2 with the reason in DIR/err.txt and a
      DIR/exit of 2: a prompt.txt that is not a regular file, a REPORT that is not absolute (with
      --dir), and, for the keeper, a mailbox that cannot be made. Without a claim it refuses on stderr
      alone, exit 2, nothing written: a DIR that is not one; a DIR whose exit marker already exists,
      whose files are an earlier run's; and a DIR whose err.txt is already there, which is another
      launch's claim, with the reason this launch would have recorded, if it had one.
  node agent-run.mjs --orphan --dir DIR --report-file REPORT
      --run's own step: starts the launch-only mode, marked --keeper, in a session of its own and exits
      at once, so the keeper's parent is gone before anything looks for it. --keeper is set by this step
      alone: the launch-only default has to stay without a mailbox for the callers nobody answers, and
      without the mark the keeper's driver would decline every request of a --run agent at once.
  node agent-run.mjs --status --report-file REPORT [--dir DIR]
      Prints nine lines: ${STATUS_LINES.join(", ")}. PATH is own where the
      driver's pid line names REPORT, the whole path, taken where the driver refused a path already
      there or could not publish, none otherwise or where the launch was refused. EXIT is the exitCode
      in the file at REPORT, whichever run wrote it (PATH says), where DRIVER_EXIT is this launch's
      driver's own; unknown where no report parses there. ANSWER is the whole
      answer on one line when it is at most ${ANSWER_MAX} characters, else a pointer to the report; ERROR is the report's
      error, else its turnError, else the launcher's own refusal; RECEIPT is turnStatus, receiptOk and
      the model by its short name, then, read from DIR/approvals with or without a report,
      approvals=A/D/E/O (accepted, declined, expired, still open or orphaned) when any request was
      offered, auto=N when the driver accepted file changes its rights covered, late=N for valid
      decisions nobody took (its request was settled first, or the run ended with it open) and stale=N
      for decision files that are not their request's, whenever they came. Always exits 0; a missing
      report reads as unknown, never success.
  node agent-run.mjs --pending --report-file REPORT [--dir DIR]
      Prints each request waiting on a decision — one DIR/approvals/pending lists — as REQUEST=<id>,
      THREAD=root or the subagent's path, METHOD=, CAUSE= (asked: Codex asked before running the
      command, and nothing on our side changes it), CWD=, REASON= (the agent's own), ROOTS= (the
      roots the agent may write, "; " between them), DEADLINE= (an ISO time, or none), then the command:
      whole, newlines kept, on the lines between COMMAND<<TOKEN and COMMAND>>TOKEN, TOKEN drawn fresh for
      each print and never in the command. Every value outside that block is one line: a backslash, a
      line break and every other control character in it written as \\\\, \\n, \\r, \\t or \\uXXXX, and a
      ; inside a ROOTS item as \\;. Then LATE=<id> and STALE=<id> as counted above and, once DIR/exit
      exists, ORPHANED=<id> for each request the run left unanswered, then REQUESTS=<n>, the number still
      waiting. Always exits 0.
  node agent-run.mjs --decide ID --accept|--decline [--why TEXT] --report-file REPORT [--dir DIR]
      --accept reads on stdin the command it approves, restated: the lines between COMMAND<<TOKEN and
      COMMAND>>TOKEN as the waiting result or --pending printed them for ID, in a quoted heredoc whose
      delimiter you build at that moment from ACCEPT_, the printed token and hex of your own and check
      is no line of the command, never a fixed word and never the printed token alone, since a line of
      the command equal to the delimiter would end the heredoc and run the rest in your shell, and a
      printed token may have passed through a relay; quote the ID for the same reason:
        node agent-run.mjs --decide 'ID' --accept --report-file REPORT <<'ACCEPT_<token><hex of yours>'
        <the command, as printed>
        ACCEPT_<token><hex of yours>
      It is compared with the request's command byte for byte, one trailing newline tolerated and nothing
      else normalised; an empty stdin or any difference is refused, REFUSED=ID with the two lengths and
      the first byte where they differ, and nothing is published. --decline reads no stdin.
      Publishes the decision for request ID as DIR/approvals/ID.decision.json at 0600, by link(2) over a
      temp file, carrying the run identity copied from the request. Refuses (exit 2, REFUSED=ID and the
      reason) an ID with no request, a run that is over, a request already settled, a request pending
      does not list, an accept whose restatement is empty or differs, a request already decided, naming
      that decision, and one with a stale decision in the way. Then reads the request again:
      DECIDED=ID accept|decline and exit 0 while it was still open, or LATE=ID and exit 3 when the
      driver settled it first — nothing ran on your word.
  node agent-run.mjs --help

  A REPORT that is not absolute, in each form:
      without --dir it names no DIR, and every mode refuses it on stderr alone, exit 2, before anything
      is read or written: --run and --status print no lines. With --dir, --new refuses it the same way;
      launch-only refuses it as above, under its claim or on stderr alone; --run on a fresh DIR prints
      the lines of its keeper's recorded refusal, and on a DIR whose run is another's refuses it as
      another report path; --status prints DIR's lines for it.
`;

function parse(argv) {
  const o = { run: false, status: false, isNew: false, isPlan: false, amend: false, runDir: null, orphan: false, keeper: false,
              dir: null, report: null, help: false, pending: false, decide: null, decision: null, why: null, adapter: null, watch: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") o.help = true;
    else if (a === "--run") o.run = true;
    else if (a === "--watch") o.watch = true;
    else if (a === "--new") o.isNew = true;
    else if (a === "--plan") o.isPlan = true;
    else if (a === "--amend") o.amend = true;
    else if (a === "--run-dir") o.runDir = argv[++i];
    else if (a === "--status") o.status = true;
    else if (a === "--orphan") o.orphan = true;
    else if (a === "--keeper") o.keeper = true;
    else if (a === "--dir") o.dir = argv[++i];
    else if (a === "--report-file") o.report = argv[++i];
    else if (a === "--adapter") o.adapter = argv[++i];
    else if (a === "--pending") o.pending = true;
    else if (a === "--decide") o.decide = argv[++i] ?? "";
    else if (a === "--accept" || a === "--decline" || a === "--answer") {
      if (o.decision !== null) return { error: "--accept, --decline and --answer: one decision per call" };
      o.decision = a === "--answer" ? "answer" : a === "--accept" ? "accept" : "decline";
    }
    else if (a === "--why") o.why = argv[++i] ?? "";
    else return { error: `unknown argument: ${a}` };
  }
  if (o.decide !== null && o.decision === null) return { error: "--decide needs --accept or --decline" };
  if (o.decide === null && (o.decision !== null || o.why !== null)) return { error: "--accept, --decline and --why belong to --decide" };
  if (o.adapter !== null && !ADAPTERS.has(o.adapter)) return { error: "--adapter must be codex or opencode" };
  if (o.watch && (!o.run || o.isNew || o.isPlan || o.status || o.orphan || o.pending || o.decide !== null))
    return { error: "--watch requires --run alone" };
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
  && (d?.run?.turnId ?? null) === (q.run?.turnId ?? null)
  && (q.type?.startsWith("opencode.")
    ? d?.requestHash === q.requestHash && JSON.stringify(d?.remote) === JSON.stringify(q.remote)
      && (q.type === "opencode.question" ? ["answer", "decline"].includes(d?.decision) : ["accept", "decline"].includes(d?.decision))
    : d?.decision === "accept" || d?.decision === "decline");

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

// This script again, in a session of its own with no stdio, and not waited for.
function spawnDetached(args) {
  const child = spawn(process.execPath, [SELF, ...args], { detached: true, stdio: "ignore", env: process.env });
  child.on("error", () => {});
  child.unref();
}

// Launch the driver on DIR/prompt.txt. `onExit(status)` runs after the marker is written; `onRefuse()`
// after a refusal. Neither returns. `mailbox` is the keeper's: the driver gets DIR/approvals, and a
// launch-only call its own caller made gets none, so every request of its agent is declined at once.
function launch(dir, report, { onExit, onRefuse, mailbox = false }) {
  // Without the claim DIR is not this launch's, and a refusal is said on stderr alone: a line added to
  // err.txt or a marker written there would be read by the run that holds the directory.
  const refuse = (why) => { process.stderr.write(`${REFUSED}: ${why}\n`); onRefuse(); };
  if (!dir || !isDirectory(dir)) return refuse(`--dir ${JSON.stringify(dir ?? "")} is not a directory`);
  let backend;
  try { backend = backendOf(dir); } catch (e) { return refuse(e.message); }
  // A marker already there makes DIR an earlier run's: its files are that run's record, and a line added
  // to its err.txt would turn the run's PATH=own into PATH=none on every later read.
  if (fs.existsSync(path.join(dir, "exit")))
    return refuse(`${path.join(dir, "exit")} already exists: one launch per directory, a relaunch gets a fresh one`);
  const promptPath = path.join(dir, "prompt.txt");
  let why = !isRegularFile(promptPath) ? `${promptPath} is not a regular file`
    : !report || !path.isAbsolute(report) ? `--report-file ${JSON.stringify(report ?? "")} is not an absolute path` : null;
  // The claim on DIR, before anything is written there: a second keeper racing this one (a --run and its
  // rerun each starting one) finds err.txt there and leaves with nothing written.
  let errFd;
  try { errFd = fs.openSync(path.join(dir, "err.txt"), "wx"); }
  catch (e) { if (e.code === "EEXIST") return refuse(why ?? `${path.join(dir, "err.txt")} already exists: another launch holds this directory`); throw e; }
  // The mailbox --new made, handed over by the keeper; a directory an older --new left without one gets
  // it here, under the claim. The driver checks where it lies.
  const box = path.join(dir, "approvals");
  if (!why && mailbox) {
    try { fs.mkdirSync(box, { mode: 0o700 }); } catch (e) { if (e.code !== "EEXIST") why = `${box} cannot be made: ${e.message}`; }
  }
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
  const approvalArgs = mailbox ? ["--approval-dir", box] : [];
  const DRIVER = backend.driver;
  const child = spawn(process.execPath, [DRIVER, "--prompt-file", promptPath, "--report-file", report, ...approvalArgs],
    { stdio: ["ignore", outFd, errFd], env: backendEnv(backend) });
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
const ADAPTER_PLAN_HEADER = "id | adapter | model | role | writes | tokens";
const planError = (why) => { process.stdout.write(`ERROR=${why}\n`); process.exit(2); };
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
  if ([PLAN_HEADER, ADAPTER_PLAN_HEADER].includes(lines[0])) lines.shift();
  if (!lines.length) planError("the plan has no agent rows");
  const rows = lines.map((line) => {
    const fields = line.split("|").map((s) => s.trim());
    if (![5, 6].includes(fields.length)) planError(`expected ${PLAN_HEADER} or ${ADAPTER_PLAN_HEADER}: ${line}`);
    const extended = fields.length === 6;
    const [id, declaredAdapter, model, role, writes, tokens] = extended ? fields : [fields[0], null, ...fields.slice(1)];
    const adapter = declaredAdapter ?? (CLAUDE_MODELS.has(model.toLowerCase()) ? "native" : "codex");
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) planError(`invalid agent id: ${id}`);
    if (/-\d+$/.test(id)) planError(`invalid agent id ${id}: the -<n> form names a continuation`);
    if (!["native", "codex", "opencode"].includes(adapter)) planError(`invalid adapter for ${id}: ${adapter}`);
    if (adapter === "opencode" ? !/^[^\s/|]+\/[^\s|]+$/.test(model) : !PLAN_MODELS.has(model.toLowerCase()))
      planError(`invalid model for ${id}: ${model}${adapter === "opencode" ? "; resolve and pin provider/model before registering" : ""}`);
    if (!role) planError(`missing role for ${id}`);
    if (!/^(nothing|worktree|live tree|write \/\S.*)$/.test(writes)) planError(`invalid writes for ${id}: ${writes}`);
    if (!/^(unknown|0|[1-9]\d*)$/.test(tokens)) planError(`invalid tokens for ${id}: ${tokens}`);
    return { id, adapter, model, role, writes, tokens, extended };
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
  const serialized = rows.map((r) => (r.extended ? [r.id, r.adapter, r.model, r.role, r.writes, r.tokens] : [r.id, r.model, r.role, r.writes, r.tokens]).join(" | ")).join("\n");
  if (amend) fs.appendFileSync(file, `# amended ${new Date().toISOString()}\n${serialized}\n`);
  else fs.writeFileSync(file, `${PLAN_HEADER}\n${serialized}\n`, { mode: 0o600, flag: "wx" });
  process.stdout.write(`${amend ? "AMENDED" : "PLAN"}=${file}\n${rows.map((r) => `AGENT=${r.id} ${r.model} ${r.writes}`).join("\n")}\n`);
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
    const a = r.schemaOverflow ? r.answer
      : r.answerJson && typeof r.answerJson.result === "string" ? r.answerJson.result : r.answer;
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
function newAgent(report, dirOverride, adapter = "codex") {
  const refuse = (why) => { process.stderr.write(`${REFUSED}: ${why}\n`); process.exit(2); };
  if (!report || !path.isAbsolute(report)) refuse(`--report-file ${JSON.stringify(report ?? "")} is not an absolute path`);
  if (dirOverride !== null && dirOverride !== undefined && !path.isAbsolute(dirOverride)) refuse(`--dir ${JSON.stringify(dirOverride)} is not an absolute path`);
  const runDir = path.dirname(path.dirname(report));
  const id = path.basename(path.dirname(report));
  const ancestors = [path.dirname(report), runDir, path.dirname(runDir)];
  const planDir = ancestors.find((d) => fs.existsSync(path.join(d, "plan.txt")));
  let planModel = null;
  let planWrites = null;
  if (planDir) {
    const plan = path.join(planDir, "plan.txt");
    if (path.basename(report) !== "report.json" || path.dirname(path.dirname(report)) !== planDir)
      planError(`REPORT must be ${planDir}/<row id or continuation>/report.json`);
    const rows = planRows(read(plan) ?? "");
    const matched = planRowOf(id, rows, planDir);
    if (!matched) planError(`${id} is not in the approved plan at ${plan}; amend it with --plan --amend and show the amendment`);
    if (matched.row.adapter === "native")
      planError(`${id} is a Claude agent in the plan at ${plan}; a Codex agent needs a row of its own: amend it with --plan --amend and show the amendment`);
    if (matched.row.adapter !== adapter) planError(`${id} belongs to adapter ${matched.row.adapter}, not ${adapter}`);
    if (adapter === "opencode") { planModel = matched.row.model; planWrites = matched.row.writes; }
    if (!matched.ended)
      planError(`${id} continues ${matched.previous}, which has not ended; wait for it, or amend the plan and show the amendment`);
  }
  const dir = dirOverride ?? agentDirOf(report);
  let backend;
  try { backend = backendOf(dir, adapter); } catch (e) { refuse(e.message); }
  let backendRecord = null;
  if (adapter === "opencode") {
    const connectionFile = process.env.ENTRUST_OPENCODE_CONNECTION ?? null;
    if (connectionFile && !path.isAbsolute(connectionFile)) refuse("ENTRUST_OPENCODE_CONNECTION must be absolute");
    let savedConnection = null;
    try { savedConnection = connectionFile ? readJsonFile(connectionFile) : null; }
    catch { refuse("ENTRUST_OPENCODE_CONNECTION could not be read as JSON"); }
    if (connectionFile && !savedConnection) refuse("ENTRUST_OPENCODE_CONNECTION could not be read as JSON");
    const raw = process.env.ENTRUST_OPENCODE_URL || savedConnection?.url;
    if (raw) {
      let serverUrl;
      try {
        const u = new URL(raw);
        if (!["http:", "https:"].includes(u.protocol) || u.username || u.password || u.search || u.hash) throw new Error();
        serverUrl = u.href.replace(/\/$/, "");
        if (savedConnection?.url && new URL(savedConnection.url).href.replace(/\/$/, "") !== serverUrl) throw new Error();
      } catch { refuse("OpenCode remote server URL must be http(s), without credentials, query or fragment; connection and URL must agree"); }
      backendRecord = { adapter, planModel, planWrites, serverUrl, connectionFile };
    } else {
      if (connectionFile) refuse("ENTRUST_OPENCODE_CONNECTION does not contain a server URL");
      backendRecord = { adapter, planModel, planWrites, localServer: true };
    }
    if (backend.saved && JSON.stringify(backend.saved) !== JSON.stringify(backendRecord))
      refuse("OpenCode backend, endpoint and approved plan are immutable for this invocation; use a fresh report path");
  }
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
  const c = spawnSync(process.execPath, [backend.driver, "--check-prompt-file", checked],
    { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", env: { ...process.env, ...(planModel ? { ENTRUST_PLAN_MODEL: planModel } : {}), ...(planWrites ? { ENTRUST_PLAN_WRITES: planWrites } : {}) }, timeout: 30000 });
  if (c.status !== 0) {
    fs.rmSync(checked, { force: true });
    const said = String(c.stderr ?? "").trim();
    const refusal = /^entrust: refused: (.+)$/.exec(said);
    const how = c.error ? c.error.message : c.signal ? `signal ${c.signal}` : `exit ${c.status}`;
    process.stdout.write(`ERROR=${c.status === 2 && refusal ? refusal[1]
      : `the driver's --check-prompt-file ended with ${how}, a fault in the driver and no verdict on the prompt${said ? `: ${oneLine(said).slice(0, ERROR_MAX)}` : ""}`}\n`);
    process.exit(2);
  }
  // The mailbox before the prompt's name appears, so a --run in the same turn finds both.
  const box = path.join(dir, "approvals");
  fs.mkdirSync(box, { recursive: true, mode: 0o700 });
  if (adapter === "opencode" && !backend.saved) {
    fs.writeFileSync(path.join(dir, "backend.json"), `${JSON.stringify(backendRecord)}\n`, { mode: 0o600, flag: "wx" });
  }
  fs.renameSync(checked, promptPath);
  process.stdout.write(`PROMPT=${promptPath}\nAPPROVALS=${box}\n`);
  process.exit(0);
}

// --pending: what a coordinator reads before it decides, every word of it. Each field is one escaped line,
// and the command goes whole, newlines kept, between two marker lines carrying a token drawn fresh for
// this print and absent from the command, so no command can end its own block or forge a field after it:
// a script-shaped command read on one clipped line is a command approved unread. A request is waiting when
// `pending` lists it, the driver's own open set.
function requestLines(q) {
  if (q.type === "opencode.permission" || q.type === "opencode.question") {
    const body = String(q.presented ?? JSON.stringify(q.payload, null, 2));
    let token;
    do token = crypto.randomBytes(6).toString("hex"); while (body.includes(token));
    return [`REQUEST=${q.id}`, `TYPE=${q.type}`, `SERVER=${field(q.remote?.serverURL)}`,
      `SESSION=${field(q.remote?.sessionID)}`, `INVOCATION=${field(q.remote?.invocationId)}`,
      `METHOD=${field(q.method)}`, `CAUSE=${field(q.cause)}`, `CWD=${field(q.cwd)}`, `REASON=${field(q.reason)}`,
      `DEADLINE=${field(q.deadlineAt)}`, `REQUEST_BODY<<${token}`, body, `REQUEST_BODY>>${token}`];
  }
  const command = String(q.command ?? "");
  let token;
  do token = crypto.randomBytes(6).toString("hex"); while (command.includes(token));
  return [`REQUEST=${q.id}`, `THREAD=${q.subagent ? field(q.agentPath ?? q.run?.threadId ?? "unknown") : "root"}`,
    `METHOD=${field(q.method)}`, `CAUSE=${field(q.cause ?? "unknown")}`, `CWD=${field(q.cwd)}`,
    `REASON=${field(q.reason)}`, `ROOTS=${(q.roots ?? []).map(item).join("; ")}`, `DEADLINE=${field(q.deadlineAt ?? "none")}`,
    `COMMAND<<${token}`, command, `COMMAND>>${token}`];
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
  const typed = q.type === "opencode.permission" || q.type === "opencode.question";
  if (typed && (q.requestHash !== crypto.createHash("sha256").update(JSON.stringify(q.payload)).digest("hex")
    || q.presented !== JSON.stringify(q.payload, null, 2) || q.remote?.requestID !== q.payload?.id
    || q.remote?.sessionID !== q.payload?.sessionID)) refuse("typed request content or remote identity does not match its immutable envelope");
  let answer;
  if (typed && q.type === "opencode.question") {
    if (decision === "accept") refuse("a question needs --answer (JSON answers on stdin) or --decline");
    if (decision === "answer") {
      try { answer = JSON.parse(fs.readFileSync(0, "utf8")); } catch { refuse("--answer expects JSON {answers: string[][]} on stdin"); }
      const questions = q.payload?.questions;
      if (!answer || Object.keys(answer).some((k) => k !== "answers") || !Array.isArray(answer.answers)
        || !Array.isArray(questions) || answer.answers.length !== questions.length
        || answer.answers.some((a, i) => !Array.isArray(a) || !a.length || a.some((s) => typeof s !== "string" || !s.trim())
          || (!questions[i].multiple && a.length !== 1)
          || (questions[i].custom === false && a.some((s) => !(questions[i].options ?? []).some((o) => o.label === s)))))
        refuse("answers do not match the pending questions");
    }
  } else if (decision === "answer") refuse("--answer is only for an OpenCode question");
  // An accept restates the command it approves, so the call a classifier or the owner judges carries the
  // command and not an id. What runs is the request's own command, never stdin: so the comparison is on
  // bytes and exact, the heredoc's one trailing newline aside. A decline restates nothing and never reads
  // stdin.
  if (decision === "accept") {
    let said = Buffer.alloc(0);
    try { said = fs.readFileSync(0); } catch {}
    const want = Buffer.from(String(typed ? q.presented ?? JSON.stringify(q.payload, null, 2) : q.command ?? ""), "utf8");
    // A request with no command has nothing to restate, and an accept of it would carry no command to judge.
    if (want.length === 0) refuse("the request carries no command to restate: decline it with --decline; nothing was published");
    if (said.length === 0) refuse("the restated command is empty: an accept reads the command it approves on stdin, a quoted heredoc whose delimiter you build from ACCEPT_, the printed token and hex of your own and check is no line of the command; nothing was published");
    if (!said.equals(want) && !said.equals(Buffer.concat([want, Buffer.from("\n")]))) {
      const body = said.at(-1) === 0x0a ? said.subarray(0, -1) : said;
      let at = 0;
      while (at < body.length && at < want.length && body[at] === want[at]) at++;
      refuse(`the restated command differs from the request's: ${body.length} bytes against ${want.length}, the first difference at byte ${at + 1}; copy the lines between COMMAND<<TOKEN and COMMAND>>TOKEN as printed, or print --pending and copy from that; nothing was published`);
    }
  }
  const target = path.join(box, `${id}.decision.json`);
  const tmp = `${target}.${crypto.randomBytes(8).toString("hex")}.tmp`;
  const record = { id: q.id, run: { pid: q.run?.pid ?? null, startedAtMs: q.run?.startedAtMs ?? null, turnId: q.run?.turnId ?? null },
                   decision, by: "coordinator", why, decidedAt: new Date().toISOString(),
                   ...(typed ? { requestHash: q.requestHash, remote: q.remote } : {}), ...(answer ? { answer } : {}) };
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

// The one foreground call. Ends, on every path, by printing nine lines or the requests waiting on a
// decision, and exiting 0: the wrapper runs the command again only on a result that ends in RUNNING=,
// which the early return prints in place of REPORT=, and hands every other result back as it is.
function run(dir, report, watch = false) {
  const t0 = Date.now();
  let pid = null, kept = null;
  const emitted = new Set();
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
  // The requests the run waits on, for the coordinator to decide; the run goes on under its keeper.
  const requestBatch = (waiting) => [...waiting.flatMap(requestLines), `REQUESTS=${waiting.length}`,
    `WAITING=${waiting.map((q) => q.id).join(",")}`, `REPORT=${report}`];
  const handBack = (waiting) => print(requestBatch(waiting));
  const emit = (waiting) => {
    const body = requestBatch(waiting).join("\n");
    let token;
    do token = crypto.randomBytes(6).toString("hex"); while (body.includes(token));
    process.stdout.write(`EVENT=waiting\nEVENT<<${token}\n${body}\nEVENT>>${token}\n`);
  };
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
    // A fresh directory: the keeper, through the orphaning step, which marks it --keeper so that it hands
    // the driver the mailbox. A directory whose err.txt exists has a launch already, and a second keeper
    // would only lose the claim on it.
    if (!fs.existsSync(path.join(dir, "err.txt"))) spawnDetached(["--orphan", "--dir", dir, "--report-file", report]);
    // Then the same wait for the first call, a rerun and a call continuing after a decision: the driver's
    // pid line, then its marker or a request waiting on a decision. A driver that died without a marker
    // ends the wait too, and the lines then say DRIVER_EXIT=unknown.
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
      const waiting = waitingRequests(dir);
      if (waiting.length) {
        if (!watch) return handBack(waiting);
        const fresh = waiting.filter((q) => !emitted.has(q.id));
        if (fresh.length) {
          fresh.forEach((q) => emitted.add(q.id));
          emit(fresh);
        }
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

const isMain = (() => { try { return fs.realpathSync(process.argv[1]) === fs.realpathSync(SELF); } catch { return false; } })();
if (isMain) {
  const o = parse(process.argv.slice(2));
  if (o.error) { process.stderr.write(`agent-run: ${o.error}\n${USAGE}`); process.exit(2); }
  if (o.help) { process.stdout.write(USAGE); process.exit(0); }
  if (o.isPlan) { if (o.report || o.dir || o.run || o.status || o.isNew || o.orphan) planError("--plan cannot be combined with agent modes"); registerPlan(o.runDir, o.amend); process.exit(0); }
  if (o.amend || o.runDir) { process.stderr.write("agent-run: --amend and --run-dir require --plan\n"); process.exit(2); }
  if (!o.report) { process.stderr.write(`agent-run: --report-file is required\n${USAGE}`); process.exit(2); }
  if (o.isNew) newAgent(o.report, o.dir, o.adapter ?? "codex");
  const dir = o.dir ?? (path.isAbsolute(o.report) ? agentDirOf(o.report) : null);
  if (dir === null) { process.stderr.write(`${REFUSED}: --report-file ${JSON.stringify(o.report)} is not an absolute path\n`); process.exit(2); }
  if (o.adapter) { try { backendOf(dir, o.adapter); } catch (e) { process.stderr.write(`${REFUSED}: ${e.message}\n`); process.exit(2); } }
  if (o.status) { process.stdout.write(`${statusLines(dir, o.report).join("\n")}\n`); process.exit(0); }
  if (o.pending) pendingRequests(dir);
  if (o.decide !== null) decideRequest(dir, o.decide, o.decision, o.why);
  // The orphaning step: its child's parent is gone as soon as it is started, and --keeper tells that
  // child it is --run's keeper, the one launch-only form that hands the driver the mailbox.
  if (o.orphan) { spawnDetached(["--keeper", "--dir", dir, "--report-file", o.report]); process.exit(0); }
  if (o.run) run(dir, o.report, o.watch);
  else launch(dir, o.report, { onExit: (status) => process.exit(status), onRefuse: () => process.exit(2), mailbox: o.keeper });
}
