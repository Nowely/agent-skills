#!/usr/bin/env node
// Does scripts/agent-run.mjs launch and read a run the way the wrapper's message says it does?
//
//   node evals/agent-run.test.mjs
//
// The wrapper hands the launcher two paths and nothing else, so everything the page used to spell out
// in shell — the redirects, the exit marker written last, the three driver strings that sort a report,
// the fixed status lines — is now this script's promise, measured here against the fake app server.

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { EXIT, FAKE, SCRIPTS, codexShim, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";
import { ACCEPTED, REFUSED, STATUS_LINES, TAKEN, agentDirOf, shortName } from "../plugin/skills/codex/scripts/agent-run.mjs";

const LAUNCHER = path.join(SCRIPTS, "agent-run.mjs");
const DRIVER_SRC = fs.readFileSync(path.join(SCRIPTS, "driver.mjs"), "utf8");
const LAUNCHER_SRC = fs.readFileSync(LAUNCHER, "utf8");

const shimDir = tempDir("agent-run-shim.");
codexShim(shimDir, FAKE);
let seq = 0;
// One state root and one agent directory per case, as one coordinator launch has.
function fresh() {
  const dir = tempDir("codex-agent.");
  const state = tempDir("agent-run-state.");
  const report = path.join(tempDir("agent-run-report."), `run-${seq++}`, "report.json");
  fs.writeFileSync(path.join(dir, "prompt.txt"), `RIGHTS: read ${shimDir}\nTASK: irrelevant, the server is scripted\n`);
  return { dir, state, report };
}
const env = (state, scenario = "happy") => ({ PATH: `${shimDir}:${process.env.PATH}`, FAKE_SCENARIO: scenario, ENTRUST_STATE_DIR: state });
const launch = (dir, report, state, scenario) =>
  spawnNode([LAUNCHER, "--dir", dir, "--report-file", report], { env: env(state, scenario), killAfterMs: 60000 });
const status = async (dir, report) => {
  const { done } = await spawnNode([LAUNCHER, "--status", "--dir", dir, "--report-file", report], { killAfterMs: 20000 });
  const r = await done;
  return { ...r, lines: r.out.split("\n").filter(Boolean) };
};
const read = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return null; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// The driver's pid line wherever it stands in err.txt: the first complete line of its whole shape.
const pidOf = (dir) => {
  const m = (read(path.join(dir, "err.txt")) ?? "").split("\n").slice(0, -1).map((l) => /^entrust: pid=(\d+) identity=\S.*? reportPath=.+$/.exec(l)).find(Boolean);
  return m ? Number(m[1]) : null;
};
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
// The state that proves the driver is in its turn: turn/start in the fake server's own log. The pid line
// comes tens of milliseconds before it, and a case timed from that line had no margin of its own and
// failed on CI about one run in three.
const turnStarted = async (rpc) => {
  for (const until = Date.now() + 15000; Date.now() < until; await sleep(50)) if (/^turn\/start/m.test(read(rpc) ?? "")) return true;
  return false;
};
// A driver a failed case left in an idle-silence turn, which never ends on its own.
const stopRun = (dir) => { const pid = pidOf(dir); if (pid !== null) { try { process.kill(pid, "SIGKILL"); } catch {} } };
// Process inspection for the orphaning case. A command that could not run throws, so the case fails and
// says so: read as 0 or as no children, it would pass without observing anything. `none` admits pgrep's
// own "no process matched", status 1 with nothing printed.
const inspect = (cmd, args, { none = false } = {}) => {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  const out = String(r.stdout ?? "").trim();
  if (none && r.status === 1 && out === "") return [];
  if (r.error || r.status !== 0 || !/^\d+(\s+\d+)*$/.test(out))
    throw new Error(`process inspection could not run: ${cmd} ${args.join(" ")} gave status ${r.status}${r.error ? ` (${r.error.code})` : ""} and ${JSON.stringify(out.slice(0, 80))}`);
  return out.split(/\s+/).map(Number);
};
const descendants = (pid) => inspect("pgrep", ["-P", String(pid)], { none: true }).flatMap((k) => [k, ...descendants(k)]);
// Preloads for what a case cannot reach from outside, each by NODE_OPTIONS=--require: the driver held back
// 1.5 s (or 3 s) before its pid line, a line on the driver's stderr before its main, its
// --check-prompt-file held back 1 s, the check faulting, and a record of the checks --new ran.
const preloads = tempDir("agent-run-preload.");
const HOLD = path.join(preloads, "hold.cjs"), HOLD_LONG = path.join(preloads, "hold-long.cjs"), SLOW_CHECK = path.join(preloads, "slow-check.cjs");
const FAULT = path.join(preloads, "fault.cjs"), SPY = path.join(preloads, "spy.cjs"), NOISE = path.join(preloads, "noise.cjs");
const NOISE_LINE = "preload: a line before the driver's main";
fs.writeFileSync(NOISE, `if (/driver\\.mjs$/.test(process.argv[1] ?? "") && !process.argv.includes("--check-prompt-file"))
  require("node:fs").writeSync(2, ${JSON.stringify(NOISE_LINE + "\n")});\n`);
fs.writeFileSync(HOLD, `if (/driver\\.mjs$/.test(process.argv[1] ?? "") && !process.argv.includes("--check-prompt-file"))
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500);\n`);
fs.writeFileSync(HOLD_LONG, `if (/driver\\.mjs$/.test(process.argv[1] ?? "") && !process.argv.includes("--check-prompt-file"))
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3000);\n`);
fs.writeFileSync(SLOW_CHECK, `if (process.argv.includes("--check-prompt-file")) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);\n`);
fs.writeFileSync(FAULT, `if (process.argv.includes("--check-prompt-file")) { process.stderr.write("boom: the check broke\\n"); process.exit(3); }\n`);
fs.writeFileSync(SPY, `if (process.argv.includes("--check-prompt-file"))
  require("node:fs").appendFileSync(process.env.AGENT_RUN_SPY, process.argv.slice(2).join(" ") + "\\n");\n`);
const preload = (file) => ({ NODE_OPTIONS: `--require "${file}"` });

const { cases: CASES, test } = registry();

test("--help names both modes and exits 0",
  "the page sends a reader here for what the launcher does; a script with no help is a promise nobody can check",
  async () => {
    const { code, out } = await spawnNode([LAUNCHER, "--help"], { killAfterMs: 10000 }).done;
    if (code !== 0) return `--help exited ${code}`;
    for (const s of ["--new --report-file REPORT", "--run --report-file REPORT", "--status", "RUNNING=", "--check-prompt-file", ...STATUS_LINES]) if (!out.includes(s)) return `--help does not mention ${s}`;
    return true;
  });

test("a launch runs the driver on DIR/prompt.txt and REPORT, leaves out.json, err.txt and exit, and exits with the driver's status",
  "these four names are what both pages promise a DIR holds after a launch, and the wait in the wrapper reads the last of them",
  async () => {
    const { dir, state, report } = fresh();
    const { code, err } = await launch(dir, report, state).done;
    const problems = [];
    if (code !== EXIT.OK) problems.push(`the launch exited ${code}, not ${EXIT.OK}: ${err.slice(0, 200)}`);
    if ((read(path.join(dir, "exit")) ?? "").trim() !== String(EXIT.OK)) problems.push(`DIR/exit holds ${JSON.stringify(read(path.join(dir, "exit")))}`);
    const out = read(path.join(dir, "out.json"));
    let r = null; try { r = JSON.parse(out ?? ""); } catch {}
    if (!r) problems.push("DIR/out.json is not the JSON report");
    else if (out !== read(report)) problems.push("DIR/out.json and REPORT differ");
    const first = (read(path.join(dir, "err.txt")) ?? "").split("\n")[0];
    if (!new RegExp(`^entrust: pid=\\d+ identity=.* ${ACCEPTED}${report.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`).test(first))
      problems.push(`the first stderr line is not the driver's pid line naming REPORT: ${JSON.stringify(first)}`);
    if (err.trim() !== "") problems.push(`the launcher wrote to its own stderr: ${err.slice(0, 120)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--status prints the nine lines in order, PATH=own for the run's own report, the whole short answer and the receipt with the model's short name",
  "the hand-back is these lines and nothing else; a missing one, or one out of order, is a coordinator reading the wrong field",
  async () => {
    const { dir, state, report } = fresh();
    await launch(dir, report, state).done;
    const { code, lines } = await status(dir, report);
    const problems = [];
    if (code !== 0) problems.push(`--status exited ${code}`);
    if (lines.length !== STATUS_LINES.length) problems.push(`${lines.length} lines, not ${STATUS_LINES.length}: ${JSON.stringify(lines)}`);
    STATUS_LINES.forEach((name, i) => { if (!(lines[i] ?? "").startsWith(`${name}=`)) problems.push(`line ${i + 1} is ${JSON.stringify(lines[i])}, not ${name}=`); });
    const get = (name) => (lines.find((l) => l.startsWith(`${name}=`)) ?? "").slice(name.length + 1);
    if (get("DRIVER_EXIT") !== "0") problems.push(`DRIVER_EXIT=${get("DRIVER_EXIT")}`);
    if (get("PATH") !== "own") problems.push(`PATH=${get("PATH")}`);
    if (get("EXIT") !== "0") problems.push(`EXIT=${get("EXIT")}`);
    const r = JSON.parse(read(report));
    if (get("FIRST") !== String(r.answer).split("\n")[0].slice(0, 300)) problems.push(`FIRST is not the answer's first line: ${get("FIRST")}`);
    if (!get("ANSWER") || get("ANSWER").includes("\n")) problems.push(`ANSWER is empty or multi-line: ${JSON.stringify(get("ANSWER"))}`);
    if (get("ERROR") !== "") problems.push(`ERROR is not empty on a clean run: ${get("ERROR")}`);
    const model = shortName(r.model);
    if (get("RECEIPT") !== `turnStatus=${r.turnStatus} receiptOk=${r.receiptOk} model=${model}`) problems.push(`RECEIPT=${get("RECEIPT")}`);
    if (get("FILE") !== "exists") problems.push(`FILE=${get("FILE")}`);
    if (get("REPORT") !== report) problems.push(`REPORT=${get("REPORT")}`);
    return problems.length === 0 || problems.join("; ");
  });

test("a slug of any generation in the report becomes its short name on the RECEIPT line, and an unknown model stays as written",
  "the coordinator retold `model=gpt-5.6-terra` to the user twice (measured 2026-09-17); the slug it reads is the slug it writes, so the status line carries the name the page uses",
  async () => {
    const { dir, report } = fresh();
    fs.mkdirSync(path.dirname(report), { recursive: true });
    fs.writeFileSync(path.join(dir, "exit"), "0\n");
    fs.writeFileSync(path.join(dir, "err.txt"), `entrust: pid=1 identity=x ${ACCEPTED}${report}\n`);
    const problems = [];
    for (const [slug, name] of [["gpt-6-astra", "Astra"], ["gpt-6-sol", "Sol"], ["gpt-5.6-sol", "Sol"], ["gpt-5.6-terra", "Terra"],
                                ["gpt-6-luna", "Luna"], ["gpt-9-nova", "gpt-9-nova"], ["gpt-6-sol-mini", "gpt-6-sol-mini"]]) {
      fs.writeFileSync(report, JSON.stringify({ ok: true, exitCode: 0, turnStatus: "completed", receiptOk: true, model: slug, answer: "x" }));
      const { lines } = await status(dir, report);
      const receipt = lines.find((l) => l.startsWith("RECEIPT=")) ?? "";
      if (!receipt.endsWith(`model=${name}`)) problems.push(`${slug}: ${receipt}`);
    }
    return problems.length === 0 || problems.join("; ");
  });

test("a pre-turn refusal reaches the hand-back as ERROR=, a long answer as a pointer, and a missing report as unknown",
  "measured 2026-09-17: the five-line hand-back dropped the refusal reason and the second line of a two-line answer, and the coordinator spent one more turn on the file each time",
  async () => {
    const { dir, report } = fresh();
    fs.mkdirSync(path.dirname(report), { recursive: true });
    fs.writeFileSync(path.join(dir, "exit"), "2\n");
    fs.writeFileSync(path.join(dir, "err.txt"), `entrust: pid=1 identity=x ${ACCEPTED}${report}\n`);
    const problems = [];
    fs.writeFileSync(report, JSON.stringify({ ok: false, exitCode: 2, turnStatus: null, error: "--effort \"minimal\" is not advertised by model gpt-5.6-terra" }));
    let { lines } = await status(dir, report);
    const get = (name) => (lines.find((l) => l.startsWith(`${name}=`)) ?? "").slice(name.length + 1);
    if (!get("ERROR").includes("not advertised")) problems.push(`the refusal is not on the ERROR line: ${JSON.stringify(lines)}`);
    if (get("RECEIPT") !== "turnStatus=null receiptOk=none model=none") problems.push(`RECEIPT on a refusal: ${get("RECEIPT")}`);
    if (get("ANSWER") !== "") problems.push(`ANSWER on a refusal: ${get("ANSWER")}`);
    fs.writeFileSync(report, JSON.stringify({ ok: true, exitCode: 0, turnStatus: "completed", receiptOk: true, model: "gpt-5.6-luna", answer: "a\n".repeat(400) }));
    ({ lines } = await status(dir, report));
    if (!/^\(long: \d+ chars, read the report\)$/.test(get("ANSWER"))) problems.push(`a long answer is not a pointer: ${get("ANSWER").slice(0, 60)}`);
    fs.writeFileSync(report, JSON.stringify({ ok: false, exitCode: 2, turnStatus: "failed", turnError: { message: "server said no" } }));
    ({ lines } = await status(dir, report));
    if (get("ERROR") !== "server said no") problems.push(`turnError.message is not the ERROR line: ${get("ERROR")}`);
    fs.rmSync(report);
    ({ lines } = await status(dir, report));
    if (get("EXIT") !== "unknown" || get("FILE") !== "missing") problems.push(`a missing report reads as ${get("EXIT")}/${get("FILE")}`);
    if (lines.length !== STATUS_LINES.length) problems.push(`a missing report changed the line count to ${lines.length}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the three strings PATH is sorted by are the driver's own, and a taken path reads as taken",
  "a rewording of any of them in the driver would silently turn every report into PATH=own; the page used to grep them from its own text, and the guard moved here with the greps",
  async () => {
    const problems = [];
    for (const needle of [ACCEPTED, ...TAKEN]) if (!DRIVER_SRC.includes(needle)) problems.push(`the driver no longer prints ${JSON.stringify(needle)}`);
    const { dir, report } = fresh();
    fs.writeFileSync(path.join(dir, "exit"), "2\n");
    fs.writeFileSync(path.join(dir, "err.txt"), `entrust: --report-file ${report} ${TAKEN[0]}\n`);
    const { lines } = await status(dir, report);
    if (!lines.includes("PATH=taken")) problems.push(`a refused entry did not read as taken: ${JSON.stringify(lines)}`);
    fs.writeFileSync(path.join(dir, "err.txt"), `entrust: pid=1 identity=x ${ACCEPTED}/somewhere/else/report.json\n`);
    const other = await status(dir, report);
    if (!other.lines.includes("PATH=none")) problems.push(`another run's path did not read as none: ${JSON.stringify(other.lines)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("a refused launch leaves an exit marker of 2 and its reason in err.txt, and a reused directory is refused on stderr alone, without touching the earlier run's files",
  "the wrapper's wait reads the exit marker, so a refusal that left none would wait for a driver that never started; and the whole point of one launch per directory is that the earlier record survives, which a reason appended to its err.txt did not: the run read PATH=none after it",
  async () => {
    const problems = [];
    // No prompt file.
    let { dir, state, report } = fresh();
    fs.rmSync(path.join(dir, "prompt.txt"));
    let r = await launch(dir, report, state).done;
    if (r.code !== 2) problems.push(`no prompt.txt exited ${r.code}`);
    if ((read(path.join(dir, "exit")) ?? "").trim() !== "2") problems.push("no prompt.txt left no exit marker of 2");
    if (!(read(path.join(dir, "err.txt")) ?? "").includes(`${REFUSED}: ${path.join(dir, "prompt.txt")}`)) problems.push("no prompt.txt is not named in err.txt");
    let s = await status(dir, report);
    if (!s.lines.includes("PATH=none") || !s.lines.includes("DRIVER_EXIT=2")) problems.push(`a refused launch reads as ${JSON.stringify(s.lines.slice(0, 2))}`);
    // A relative report path.
    ({ dir, state, report } = fresh());
    r = await spawnNode([LAUNCHER, "--dir", dir, "--report-file", "reports/report.json"], { env: env(state), killAfterMs: 20000 }).done;
    if (r.code !== 2 || !(read(path.join(dir, "err.txt")) ?? "").includes("not an absolute path")) problems.push(`a relative report path: exit ${r.code}, ${JSON.stringify(read(path.join(dir, "err.txt")))}`);
    // A directory that is not one.
    r = await spawnNode([LAUNCHER, "--dir", path.join(dir, "nowhere"), "--report-file", report], { env: env(state), killAfterMs: 20000 }).done;
    if (r.code !== 2 || !/not a directory/.test(r.err)) problems.push(`a missing directory: exit ${r.code}, ${r.err.slice(0, 80)}`);
    // A reused directory: one real run, then a second launch with another report path.
    ({ dir, state, report } = fresh());
    await launch(dir, report, state).done;
    const before = { out: read(path.join(dir, "out.json")), exit: read(path.join(dir, "exit")), err: read(path.join(dir, "err.txt")) };
    const second = path.join(path.dirname(report), "second.json");
    for (const again of [second, report]) {
      r = await launch(dir, again, state).done;
      if (r.code !== 2) problems.push(`a reused directory exited ${r.code}`);
      if (!r.err.includes(`${REFUSED}: ${path.join(dir, "exit")} already exists`)) problems.push(`the reused-directory refusal is not on stderr: ${r.err.slice(0, 120)}`);
    }
    if (read(path.join(dir, "out.json")) !== before.out || read(path.join(dir, "exit")) !== before.exit) problems.push("a refused relaunch changed the earlier run's out.json or exit");
    if (read(path.join(dir, "err.txt")) !== before.err) problems.push(`a refused relaunch changed the earlier run's err.txt: ${JSON.stringify((read(path.join(dir, "err.txt")) ?? "").slice((before.err ?? "").length))}`);
    if (fs.existsSync(second)) problems.push("the refused relaunch produced a report");
    s = await status(dir, second);
    if (!s.lines.includes("PATH=none") || !s.lines.includes("FILE=missing")) problems.push(`the refused relaunch reads as ${JSON.stringify(s.lines)}`);
    s = await status(dir, report);
    if (!s.lines.includes("PATH=own")) problems.push(`the earlier run reads as ${JSON.stringify(s.lines.slice(0, 2))} after a refused relaunch`);
    return problems.length === 0 || problems.join("; ");
  });

test("SIGTERM to the launcher reaches the driver: the turn is interrupted, the report published, the marker written, nothing left running",
  "Stop on the agent map signals the wrapper's process tree; the launcher is one more process in it, and a launcher that swallowed the signal would leave a codex running with no card",
  async () => {
    const { dir, state, report } = fresh();
    const { child, done } = launch(dir, report, state, "slow-turn");
    const deadline = Date.now() + 15000;
    let pid = null;
    while (Date.now() < deadline) {
      const m = /^entrust: pid=(\d+) /.exec((read(path.join(dir, "err.txt")) ?? "").split("\n")[0]);
      if (m) { pid = Number(m[1]); break; }
      await sleep(100);
    }
    if (!pid) return "the driver never printed its pid line within 15 s";
    await sleep(500);
    child.kill("SIGTERM");
    const { code } = await done;
    const problems = [];
    if (code !== 1) problems.push(`the launcher exited ${code}, expected the driver's 1 for an interrupted turn`);
    if ((read(path.join(dir, "exit")) ?? "").trim() !== "1") problems.push(`DIR/exit holds ${JSON.stringify(read(path.join(dir, "exit")))}`);
    let r = null; try { r = JSON.parse(read(report) ?? ""); } catch {}
    if (!r) problems.push("no report was published");
    else if (r.turnStatus !== "interrupted") problems.push(`turnStatus=${r.turnStatus}`);
    await sleep(300);
    let alive = false; try { process.kill(pid, 0); alive = true; } catch {}
    if (alive) { problems.push(`the driver (pid ${pid}) is still alive`); try { process.kill(pid, "SIGKILL"); } catch {} }
    return problems.length === 0 || problems.join("; ");
  });

test("the launcher never opens prompt.txt except as the driver's argument, and hands the driver exactly --prompt-file and --report-file",
  "a relay that reads a prompt can rewrite it (incidents.md, \"A relay on a small model\"); the one guarantee the page gives about the file is that it reaches the driver verbatim",
  () => {
    const problems = [];
    if (/(readFileSync|openSync|createReadStream|readFile)\([^)]*prompt/i.test(LAUNCHER_SRC)) problems.push("the launcher reads prompt.txt");
    if (!/\[DRIVER, "--prompt-file", promptPath, "--report-file", report\]/.test(LAUNCHER_SRC)) problems.push("the driver is not spawned with exactly --prompt-file and --report-file");
    if (!/env: process\.env/.test(LAUNCHER_SRC)) problems.push("the driver does not get the launcher's environment untouched");
    return problems.length === 0 || problems.join("; ");
  });

test("--run on a fresh directory launches, waits and prints the nine lines, exit 0",
  "the one foreground call is the whole wrapper: a native subagent that runs one command shows one Bash card and its return, and this is that card",
  async () => {
    const { dir, state, report } = fresh();
    const { code, out, err } = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state), killAfterMs: 60000 }).done;
    const problems = [];
    if (code !== 0) problems.push(`--run exited ${code}: ${err.slice(0, 200)}`);
    const lines = out.split("\n").filter(Boolean);
    if (lines.length !== STATUS_LINES.length) problems.push(`${lines.length} lines, not ${STATUS_LINES.length}: ${JSON.stringify(lines)}`);
    STATUS_LINES.forEach((name, i) => { if (!(lines[i] ?? "").startsWith(`${name}=`)) problems.push(`line ${i + 1} is ${JSON.stringify(lines[i])}`); });
    for (const want of ["DRIVER_EXIT=0", "PATH=own", "EXIT=0", "FILE=exists"]) if (!lines.includes(want)) problems.push(`missing ${want}`);
    if ((read(path.join(dir, "exit")) ?? "").trim() !== "0") problems.push("no exit marker of 0");
    return problems.length === 0 || problems.join("; ");
  });

test("--run on a directory that already ran prints without launching, and on one whose driver is still running waits for it",
  "the harness moves a foreground call into the background at its ten-minute ceiling and the wrapper runs the same command again; a second launch would be a second paid turn and a PATH=taken, so the call has to be idempotent",
  async () => {
    const problems = [];
    // Already ran.
    let { dir, state, report } = fresh();
    await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state), killAfterMs: 60000 }).done;
    const before = { err: read(path.join(dir, "err.txt")), out: read(path.join(dir, "out.json")) };
    const again = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state), killAfterMs: 20000 }).done;
    if (again.code !== 0 || !again.out.includes("PATH=own")) problems.push(`a second --run on a finished directory: exit ${again.code}, ${again.out.slice(0, 80)}`);
    if (read(path.join(dir, "err.txt")) !== before.err || read(path.join(dir, "out.json")) !== before.out) problems.push("a second --run changed the finished run's files");
    if (again.ms > 5000) problems.push(`a second --run on a finished directory took ${again.ms} ms`);
    // Still running: a slow first run, and a second --run started while it is in flight.
    ({ dir, state, report } = fresh());
    const first = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state, "slow-turn"), killAfterMs: 60000 });
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline && !/^entrust: pid=/.test((read(path.join(dir, "err.txt")) ?? "").split("\n")[0])) await sleep(100);
    const second = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state, "slow-turn"), killAfterMs: 60000 });
    const [a, b] = await Promise.all([first.done, second.done]);
    if (a.code !== 0 || b.code !== 0) problems.push(`concurrent --run exited ${a.code} and ${b.code}`);
    if (a.out !== b.out) problems.push(`the two --run calls printed different lines: ${JSON.stringify([a.out, b.out])}`);
    const pidLines = (read(path.join(dir, "err.txt")) ?? "").split("\n").filter((l) => l.startsWith("entrust: pid=")).length;
    if (pidLines !== 1) problems.push(`${pidLines} pid lines in err.txt: the second --run launched a second driver`);
    if (!b.out.includes("PATH=own") || !b.out.includes("EXIT=0")) problems.push(`the waiting --run did not read the finished run: ${b.out.slice(0, 120)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--run on a refused launch still prints the nine lines, with the refusal on ERROR=, and exits 0",
  "the wrapper hands back whatever the one call printed; a refusal that printed nothing would be a hand-back with nothing in it",
  async () => {
    const { dir, state, report } = fresh();
    fs.rmSync(path.join(dir, "prompt.txt"));
    const { code, out } = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state), killAfterMs: 20000 }).done;
    const lines = out.split("\n").filter(Boolean);
    const problems = [];
    if (code !== 0) problems.push(`exited ${code}`);
    if (lines.length !== STATUS_LINES.length) problems.push(`${lines.length} lines`);
    if (!lines.includes("DRIVER_EXIT=2") || !lines.includes("PATH=none") || !lines.includes("FILE=missing")) problems.push(`lines: ${JSON.stringify(lines)}`);
    const error = lines.find((l) => l.startsWith("ERROR=")) ?? "";
    if (!error.includes("prompt.txt is not a regular file")) problems.push(`the refusal is not on the ERROR line: ${error}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--run refuses a directory that ran for another report path, prints the nine lines on a missing directory, and a rerun after the early return forwards SIGTERM to a driver it only waits for",
  "the same command again must read the run it started and nothing else: a reused directory would print an earlier run's success as this run's; a refusal that printed no REPORT= line would send the wrapper into an endless rerun; and a Stop on the card after the early return reaches only the rerun, which started nothing and has to forward to the driver it waits for",
  async () => {
    const problems = [];
    // Another report path in a directory that already ran.
    let { dir, state, report } = fresh();
    await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state), killAfterMs: 60000 }).done;
    const other = path.join(path.dirname(report), "other.json");
    const errBefore = read(path.join(dir, "err.txt"));
    const r = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", other], { env: env(state), killAfterMs: 20000 }).done;
    if (read(path.join(dir, "err.txt")) !== errBefore) problems.push("a foreign report path changed the ended run's err.txt");
    const lines = r.out.split("\n").filter(Boolean);
    if (r.code !== 0 || lines.length !== STATUS_LINES.length) problems.push(`a foreign report path: exit ${r.code}, ${lines.length} lines`);
    if (!lines.includes("PATH=none") || !lines.includes("FILE=missing")) problems.push(`a foreign report path read as ${JSON.stringify(lines.slice(0, 2))}`);
    if (!(lines.find((l) => l.startsWith("ERROR=")) ?? "").includes("another report path")) problems.push("the refusal is not on the ERROR line");
    if (fs.existsSync(other)) problems.push("a foreign report path launched a run");
    if ((read(path.join(dir, "err.txt")) ?? "").split("\n").filter((l) => l.startsWith("entrust: pid=")).length !== 1) problems.push("a second driver was started");
    // A directory that does not exist.
    const missing = await spawnNode([LAUNCHER, "--run", "--dir", path.join(dir, "nowhere"), "--report-file", report], { env: env(state), killAfterMs: 20000 }).done;
    const mlines = missing.out.split("\n").filter(Boolean);
    if (missing.code !== 0 || mlines.length !== STATUS_LINES.length || !mlines.some((l) => l.startsWith("REPORT="))) problems.push(`a missing directory: exit ${missing.code}, ${JSON.stringify(mlines)}`);
    if (!(mlines.find((l) => l.startsWith("ERROR=")) ?? "").includes("not a directory")) problems.push("a missing directory's refusal is not on the ERROR line");
    // SIGTERM to the rerun. The first call returns early; the fake turn never ends on its own, so only the
    // forwarded signal can end it, and the signal waits for turn/start, not for the pid line.
    ({ dir, state, report } = fresh());
    const rpc = path.join(dir, "rpc.log");
    const held = { ...env(state, "idle-silence"), FAKE_RPC_LOG: rpc };
    const a = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: { ...held, AGENT_RUN_RETURN_MS: "300" }, killAfterMs: 60000 }).done;
    if (!await turnStarted(rpc)) { stopRun(dir); return "the driver never started its turn"; }
    const pid = pidOf(dir);
    const second = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: held, killAfterMs: 60000 });
    await sleep(700);
    second.child.kill("SIGTERM");
    const b = await second.done;
    const alines = a.out.split("\n").filter(Boolean);
    if (a.code !== 0 || !(alines.at(-1) ?? "").startsWith("RUNNING=") || alines.some((l) => l.startsWith("REPORT=")))
      problems.push(`the first call did not return early with RUNNING= in place of REPORT=: exit ${a.code}, ${JSON.stringify(alines)}`);
    if (b.code !== 0 || !b.out.includes("DRIVER_EXIT=1") || !b.out.includes(`REPORT=${report}`)) problems.push(`after SIGTERM to the rerun it printed ${JSON.stringify(b.out.split("\n")[0])}, exit ${b.code}`);
    let rep = null; try { rep = JSON.parse(read(report) ?? ""); } catch {}
    if (!rep || rep.turnStatus !== "interrupted") problems.push(`the driver did not report an interrupted turn: ${rep && rep.turnStatus}`);
    await sleep(300);
    if (alive(pid)) { problems.push(`the driver (pid ${pid}) is still alive`); stopRun(dir); }
    return problems.length === 0 || problems.join("; ");
  });

test("--run for another report path while the directory's run is in flight prints its own nine lines with the refusal on ERROR=, exit 0, leaves err.txt byte for byte, and the run's rerun, its own call and the same command again read PATH=own",
  "the refusal used to be appended to the run's err.txt, which every call reads its lines from, so a rerun after the early return printed PATH=none for a run publishing to its own path, and the driver's next stderr line, written at its own offset, overwrote the appended one (measured 2026-09-27)",
  async () => {
    const { dir, state, report } = fresh();
    const rpc = path.join(dir, "rpc.log");
    const held = { ...env(state, "idle-silence"), FAKE_RPC_LOG: rpc };
    const h = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: held, killAfterMs: 60000 });
    if (!await turnStarted(rpc)) { h.child.kill("SIGKILL"); stopRun(dir); return "the driver never started its turn"; }
    const pid = pidOf(dir);
    const problems = [];
    // The foreign call, while the turn is held open: the driver writes nothing to err.txt until the turn
    // ends, so any byte that changes here is the foreign call's.
    const other = path.join(path.dirname(report), "other.json");
    const before = fs.readFileSync(path.join(dir, "err.txt"));
    const f = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", other], { env: held, killAfterMs: 20000 }).done;
    const after = fs.readFileSync(path.join(dir, "err.txt"));
    const flines = f.out.split("\n").filter(Boolean);
    if (f.code !== 0 || flines.length !== STATUS_LINES.length) problems.push(`the foreign call: exit ${f.code}, ${JSON.stringify(flines)}`);
    STATUS_LINES.forEach((name, i) => { if (!(flines[i] ?? "").startsWith(`${name}=`)) problems.push(`the foreign call's line ${i + 1} is ${JSON.stringify(flines[i])}, not ${name}=`); });
    for (const want of ["DRIVER_EXIT=unknown", "PATH=none", "FILE=missing", `REPORT=${other}`]) if (!flines.includes(want)) problems.push(`the foreign call lacks ${want}`);
    if (!(flines.find((l) => l.startsWith("ERROR=")) ?? "").includes("another report path")) problems.push("the foreign call's refusal is not on its ERROR line");
    if (!before.equals(after)) problems.push(`the foreign call changed the run's err.txt: ${JSON.stringify(after.subarray(before.length).toString())}`);
    if (!alive(pid)) problems.push("the run did not survive the foreign call");
    // The rerun after an early return, read while the turn is still held open.
    const early = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: { ...held, AGENT_RUN_RETURN_MS: "300" }, killAfterMs: 20000 }).done;
    const elines = early.out.split("\n").filter(Boolean);
    if (early.code !== 0 || elines[0] !== "DRIVER_EXIT=running" || elines[1] !== "PATH=own") problems.push(`the rerun in flight: exit ${early.code}, ${JSON.stringify(elines.slice(0, 2))}`);
    // The run's own call, ended by the Stop it forwards, and the same command again on the ended run.
    h.child.kill("SIGTERM");
    const r = await h.done;
    const lines = r.out.split("\n").filter(Boolean);
    if (r.code !== 0 || !lines.includes("PATH=own") || !lines.includes(`REPORT=${report}`)) problems.push(`the run's own call: exit ${r.code}, ${JSON.stringify(lines)}`);
    const again = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: held, killAfterMs: 20000 }).done;
    const alines = again.out.split("\n").filter(Boolean);
    if (again.code !== 0 || !alines.includes("PATH=own") || !alines.includes(`REPORT=${report}`)) problems.push(`the same command again: exit ${again.code}, ${JSON.stringify(alines.slice(0, 2))}`);
    if (fs.existsSync(other)) problems.push("the foreign call produced a report");
    await sleep(300);
    if (alive(pid)) { problems.push(`the driver (pid ${pid}) is still alive`); stopRun(dir); }
    return problems.length === 0 || problems.join("; ");
  });

test("--run for another report path that arrives while the directory's run is being born waits for the pid line, then refuses on its own nine lines, exit 0, forwarding nothing, a SIGTERM kept meanwhile included",
  "the ownership check read only a directory whose pid line was already there, so a call that came between the keeper's claim on err.txt and that line waited on the other run and forwarded its signals to that driver: a Stop on the stray card cut another report's run (measured 2026-09-27)",
  async () => {
    const { dir, state, report } = fresh();
    const rpc = path.join(dir, "rpc.log");
    // The run's own call, its driver held back 3 s before its pid line; the foreign call comes once the
    // keeper has claimed err.txt, and its SIGTERM a second later, after it has installed its handler.
    const h = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: { ...env(state, "idle-silence"), ...preload(HOLD_LONG), FAKE_RPC_LOG: rpc }, killAfterMs: 60000 });
    for (const until = Date.now() + 10000; Date.now() < until && !fs.existsSync(path.join(dir, "err.txt"));) await sleep(20);
    const problems = [];
    const other = path.join(path.dirname(report), "other.json");
    const f = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", other], { env: env(state, "idle-silence"), killAfterMs: 30000 });
    await sleep(1000);
    if (pidOf(dir) !== null) problems.push("the pid line was already there when the signal was sent: the case measured nothing");
    f.child.kill("SIGTERM");
    const fr = await f.done;
    const flines = fr.out.split("\n").filter(Boolean);
    if (fr.code !== 0 || flines.length !== STATUS_LINES.length) problems.push(`the foreign call: exit ${fr.code}, ${JSON.stringify(flines)}`);
    STATUS_LINES.forEach((name, i) => { if (!(flines[i] ?? "").startsWith(`${name}=`)) problems.push(`the foreign call's line ${i + 1} is ${JSON.stringify(flines[i])}, not ${name}=`); });
    for (const want of ["DRIVER_EXIT=unknown", "PATH=none", "FILE=missing", `REPORT=${other}`]) if (!flines.includes(want)) problems.push(`the foreign call lacks ${want}`);
    if (!(flines.find((l) => l.startsWith("ERROR=")) ?? "").includes("another report path")) problems.push("the foreign call's refusal is not on its ERROR line");
    // The run goes on: its turn starts, its driver is alive, and err.txt holds the driver's lines alone.
    if (!await turnStarted(rpc)) problems.push("the run never reached its turn");
    const pid = pidOf(dir);
    await sleep(300);
    if (pid === null || !alive(pid)) problems.push("the run did not go on");
    const err = read(path.join(dir, "err.txt")) ?? "";
    if (err.includes("interrupted by")) problems.push("the foreign call's SIGTERM reached the driver");
    const alien = err.split("\n").filter((l) => l && !l.startsWith("entrust: "));
    if (alien.length) problems.push(`err.txt holds lines that are not the driver's: ${JSON.stringify(alien)}`);
    // The run's own call, ended by the Stop it forwards.
    h.child.kill("SIGTERM");
    const r = await h.done;
    const lines = r.out.split("\n").filter(Boolean);
    if (r.code !== 0 || !lines.includes("PATH=own") || !lines.includes(`REPORT=${report}`)) problems.push(`the run's own call: exit ${r.code}, ${JSON.stringify(lines)}`);
    if (fs.existsSync(other)) problems.push("the foreign call produced a report");
    await sleep(300);
    if (pid !== null && alive(pid)) { problems.push(`the driver (pid ${pid}) is still alive`); stopRun(dir); }
    return problems.length === 0 || problems.join("; ");
  });

test("--run whose report path is a prefix of the one the directory ran for is refused, and --status reads it as none",
  "the ownership test was a substring match on the pid line, so REPORT read as its own run in a directory that ran for REPORT.old, PATH=own over a report that was never written",
  async () => {
    const { dir, state, report } = fresh();
    const old = `${report}.old`;
    await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", old], { env: env(state), killAfterMs: 60000 }).done;
    if (!fs.existsSync(old)) return "the run for REPORT.old published nothing";
    const problems = [];
    const before = read(path.join(dir, "err.txt"));
    const r = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state), killAfterMs: 20000 }).done;
    const lines = r.out.split("\n").filter(Boolean);
    if (r.code !== 0 || lines.length !== STATUS_LINES.length) problems.push(`exit ${r.code}, ${lines.length} lines`);
    for (const want of ["PATH=none", "FILE=missing", `REPORT=${report}`]) if (!lines.includes(want)) problems.push(`--run lacks ${want}: ${JSON.stringify(lines.slice(0, 2))}`);
    if (!(lines.find((l) => l.startsWith("ERROR=")) ?? "").includes("another report path")) problems.push("the refusal is not on the ERROR line");
    if (read(path.join(dir, "err.txt")) !== before) problems.push("err.txt changed");
    if (fs.existsSync(report)) problems.push("a report was published at the prefix path");
    const s = await status(dir, report);
    if (!s.lines.includes("PATH=none")) problems.push(`--status for the prefix path reads ${JSON.stringify(s.lines.slice(0, 2))}`);
    const own = await status(dir, old);
    if (!own.lines.includes("PATH=own")) problems.push(`--status for REPORT.old reads ${JSON.stringify(own.lines.slice(0, 2))}`);
    return problems.length === 0 || problems.join("; ");
  });

test("a launch with a relative REPORT into a directory whose run is in flight is refused on stderr alone: err.txt byte for byte, no exit marker, and the run ends PATH=own",
  "the prompt and report checks ran before the claim on err.txt, so a refused launch into a directory another run held appended to that run's err.txt and wrote its exit marker, and the run's own call printed DRIVER_EXIT=2 and PATH=none while its driver was still in its turn (measured 2026-09-27)",
  async () => {
    const { dir, state, report } = fresh();
    const rpc = path.join(dir, "rpc.log");
    const held = { ...env(state, "idle-silence"), FAKE_RPC_LOG: rpc };
    const h = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: held, killAfterMs: 60000 });
    if (!await turnStarted(rpc)) { h.child.kill("SIGKILL"); stopRun(dir); return "the driver never started its turn"; }
    const pid = pidOf(dir);
    const problems = [];
    const before = fs.readFileSync(path.join(dir, "err.txt"));
    const r = await spawnNode([LAUNCHER, "--dir", dir, "--report-file", "reports/report.json"], { env: held, killAfterMs: 20000 }).done;
    const after = fs.readFileSync(path.join(dir, "err.txt"));
    if (r.code !== 2) problems.push(`the relative-REPORT launch exited ${r.code}`);
    if (!r.err.includes(`${REFUSED}: --report-file "reports/report.json" is not an absolute path`)) problems.push(`the refusal is not on stderr: ${JSON.stringify(r.err.slice(0, 160))}`);
    if (!before.equals(after)) problems.push(`err.txt changed: ${JSON.stringify(after.subarray(before.length).toString())}`);
    if (fs.existsSync(path.join(dir, "exit"))) problems.push(`an exit marker was written: ${JSON.stringify(read(path.join(dir, "exit")))}`);
    // Longer than the run's own call polls, so a marker written by the refusal would have been read.
    await sleep(700);
    if (pid === null || !alive(pid)) problems.push("the run did not go on");
    h.child.kill("SIGTERM");
    const hr = await h.done;
    const lines = hr.out.split("\n").filter(Boolean);
    if (hr.code !== 0 || !lines.includes("DRIVER_EXIT=1") || !lines.includes("PATH=own") || !lines.includes(`REPORT=${report}`)) problems.push(`the run's own call: exit ${hr.code}, ${JSON.stringify(lines.slice(0, 2))}`);
    await sleep(300);
    if (pid !== null && alive(pid)) { problems.push(`the driver (pid ${pid}) is still alive`); stopRun(dir); }
    return problems.length === 0 || problems.join("; ");
  });

test("a run whose err.txt starts with a line written before the driver's main reads PATH=own and has its signals forwarded, and only a complete line of the whole pid-line shape counts",
  "the launcher took err.txt's first line for the pid line, so anything on stderr before the driver's own first write, a preload's line or a warning, made a finished run read PATH=none and left a Stop with no pid to go to (measured 2026-09-27)",
  async () => {
    const { dir, state, report } = fresh();
    const rpc = path.join(dir, "rpc.log");
    const h = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: { ...env(state, "idle-silence"), ...preload(NOISE), FAKE_RPC_LOG: rpc }, killAfterMs: 60000 });
    if (!await turnStarted(rpc)) { h.child.kill("SIGKILL"); stopRun(dir); return "the driver never started its turn"; }
    const problems = [];
    const first = (read(path.join(dir, "err.txt")) ?? "").split("\n")[0];
    if (first !== NOISE_LINE) problems.push(`err.txt's first line is ${JSON.stringify(first)}, not the preload's: the case measured nothing`);
    const pid = pidOf(dir);
    h.child.kill("SIGTERM");
    const r = await h.done;
    const lines = r.out.split("\n").filter(Boolean);
    if (r.code !== 0 || !lines.includes("DRIVER_EXIT=1") || !lines.includes("PATH=own") || !lines.includes(`REPORT=${report}`)) problems.push(`after SIGTERM: exit ${r.code}, ${JSON.stringify(lines)}`);
    let rep = null; try { rep = JSON.parse(read(report) ?? ""); } catch {}
    if (!rep || rep.turnStatus !== "interrupted") problems.push(`the driver did not report an interrupted turn: ${rep && rep.turnStatus}`);
    await sleep(300);
    if (pid === null || alive(pid)) { problems.push(`the driver (pid ${pid}) was not found or is still alive`); stopRun(dir); }
    // The shape, on lines handed to the status read: a line of it in part ahead of the whole one is passed
    // over, and a whole one with no newline after it is not a line yet.
    const d2 = tempDir("codex-agent.");
    fs.writeFileSync(path.join(d2, "exit"), "0\n");
    fs.writeFileSync(path.join(d2, "err.txt"), `entrust: pid=4000000 identity=x\nentrust: pid=4000001 identity=x ${ACCEPTED}${report}\n`);
    let s = await status(d2, report);
    if (!s.lines.includes("PATH=own")) problems.push(`a partial pid line ahead of the whole one: ${JSON.stringify(s.lines.slice(0, 2))}`);
    fs.writeFileSync(path.join(d2, "err.txt"), `${NOISE_LINE}\nentrust: pid=4000001 identity=x ${ACCEPTED}${report}`);
    s = await status(d2, report);
    if (!s.lines.includes("PATH=none")) problems.push(`a pid line with no newline yet: ${JSON.stringify(s.lines.slice(0, 2))}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--run that has waited its deadline prints RUNNING= in place of REPORT= and exits 0 while the run goes on, and the same command again prints the nine lines with REPORT=",
  "the harness moves a foreground command that reaches the tool's ten-minute ceiling into the background, where the wrapper's end tears it down; a call that returns before the ceiling is never moved, and a result with no REPORT= line still sends the wrapper to run the same command again",
  async () => {
    const { dir, state, report } = fresh();
    const first = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: { ...env(state, "slow-turn"), AGENT_RUN_RETURN_MS: "300" }, killAfterMs: 60000 }).done;
    const lines = first.out.split("\n").filter(Boolean);
    const problems = [];
    if (first.code !== 0) problems.push(`the early return exited ${first.code}`);
    const names = [...STATUS_LINES.slice(0, -1), "RUNNING"];
    if (lines.length !== names.length) problems.push(`${lines.length} lines, not ${names.length}: ${JSON.stringify(lines)}`);
    names.forEach((name, i) => { if (!(lines[i] ?? "").startsWith(`${name}=`)) problems.push(`line ${i + 1} is ${JSON.stringify(lines[i])}, not ${name}=`); });
    if (lines[0] !== "DRIVER_EXIT=running") problems.push(`the early return says ${lines[0]}`);
    const m = /^RUNNING=pid (\d+), \d+ s so far; run the same command again$/.exec(lines.at(-1) ?? "");
    if (!m || Number(m[1]) !== pidOf(dir)) problems.push(`the RUNNING= line does not name the driver's pid ${pidOf(dir)}: ${lines.at(-1)}`);
    // The run went on without the call that started it: the same command again finds it and waits for it.
    const again = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state, "slow-turn"), killAfterMs: 60000 }).done;
    const alines = again.out.split("\n").filter(Boolean);
    if (again.code !== 0 || alines.length !== STATUS_LINES.length) problems.push(`the same command again: exit ${again.code}, ${alines.length} lines`);
    for (const want of ["DRIVER_EXIT=0", "PATH=own", "EXIT=0", "FILE=exists", `REPORT=${report}`]) if (!alines.includes(want)) problems.push(`the same command again lacks ${want}`);
    const pidLines = (read(path.join(dir, "err.txt")) ?? "").split("\n").filter((l) => l.startsWith("entrust: pid=")).length;
    if (pidLines !== 1) problems.push(`${pidLines} pid lines in err.txt`);
    return problems.length === 0 || problems.join("; ");
  });

test("a run outlives the launcher that started it and the teardown of that launcher's tree",
  "when a foreground subagent ends, the harness sends SIGTERM to its leftover command's process group and to every descendant it finds by ppid, then SIGKILL (measured 2026-09-26): a wrapper that handed back at the ceiling took a ten-minute turn down with it, so the driver has to run outside the launcher's group and tree, and the report and the marker have to come without the launcher",
  async () => {
    const { dir, state, report } = fresh();
    const rpc = path.join(dir, "rpc.log");
    // A process group of its own, as the Bash tool's shell has, so the group kill below is aimed at the
    // launcher and not at this suite.
    const launcher = spawn(process.execPath, [LAUNCHER, "--run", "--dir", dir, "--report-file", report],
      { env: { ...process.env, ...env(state, "slow-turn"), FAKE_RPC_LOG: rpc, AGENT_RUN_RETURN_MS: "300" }, stdio: ["ignore", "pipe", "ignore"], detached: true });
    let out = "";
    launcher.stdout.setEncoding("utf8");
    launcher.stdout.on("data", (d) => { out += d; });
    const closed = new Promise((resolve) => launcher.on("close", (code) => resolve(code)));
    const problems = [];
    try {
      // The walk has to see what it is walking for: this suite's own child, the launcher, alive until its
      // driver's pid line and its deadline have both passed.
      if (!descendants(process.pid).includes(launcher.pid)) return `the ppid walk from this suite does not find the launcher ${launcher.pid}`;
      if (!await turnStarted(rpc)) return "the driver never started its turn";
      const pid = pidOf(dir);
      const [pgid] = inspect("ps", ["-o", "pgid=", "-p", String(pid)]), [ppid] = inspect("ps", ["-o", "ppid=", "-p", String(pid)]);
      if (pgid === launcher.pid || ppid === launcher.pid)
        problems.push(`the driver is in the launcher's group or is its child: pgid ${pgid}, ppid ${ppid}, launcher ${launcher.pid}`);
      const code = await Promise.race([closed, sleep(15000).then(() => "still running")]);
      const lines = out.split("\n").filter(Boolean);
      if (code !== 0 || lines[0] !== "DRIVER_EXIT=running" || !(lines.at(-1) ?? "").startsWith("RUNNING=") || lines.some((l) => l.startsWith("REPORT=")))
        problems.push(`the launcher did not return early: ${code}, ${JSON.stringify(lines)}`);
      // The teardown as measured: SIGTERM to the group and to every descendant by ppid, then SIGKILL.
      let group = "delivered";
      try { process.kill(-launcher.pid, "SIGTERM"); } catch (e) { group = e.code; }
      if (group !== "ESRCH") problems.push(`SIGTERM to the launcher's process group was ${group}: something is still in it`);
      const tree = descendants(launcher.pid);
      for (const p of tree) { try { process.kill(p, "SIGTERM"); } catch {} }
      await sleep(1300);
      for (const p of tree.filter(alive)) { try { process.kill(p, "SIGKILL"); } catch {} }
      for (const until = Date.now() + 15000; Date.now() < until && !(read(path.join(dir, "exit")) ?? "").trim();) await sleep(100);
      const marker = (read(path.join(dir, "exit")) ?? "").trim();
      let rep = null; try { rep = JSON.parse(read(report) ?? ""); } catch {}
      if (marker !== "0" || !rep || rep.turnStatus !== "completed" || rep.exitCode !== 0)
        problems.push(`after the teardown: marker ${JSON.stringify(marker)}, turnStatus ${rep && rep.turnStatus}, exitCode ${rep && rep.exitCode}`);
      const again = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state), killAfterMs: 20000 }).done;
      const alines = again.out.split("\n").filter(Boolean);
      if (again.code !== 0 || alines.length !== STATUS_LINES.length || !alines.includes("DRIVER_EXIT=0") || !alines.includes("PATH=own") || !alines.includes(`REPORT=${report}`))
        problems.push(`the same command again: exit ${again.code}, ${JSON.stringify(alines)}`);
      return problems.length === 0 || problems.join("; ");
    } finally {
      try { process.kill(-launcher.pid, "SIGKILL"); } catch {}
      if (problems.length) stopRun(dir);
    }
  });

test("SIGTERM to the --run that started the run interrupts the turn, and one that arrives before the driver's pid line is kept until the line appears",
  "no call is the driver's parent, so a Stop on the card reaches the driver only because the call in flight forwards to the pid in err.txt, and a Stop before that pid exists would be lost, the run going on with no card; delivered before the thread exists, it ends the run with exit 4 and turnStatus null, not interrupted (measured 2026-09-27, five of five)",
  async () => {
    const problems = [];
    // After turn/start: the call that started the run is the one a Stop reaches.
    let { dir, state, report } = fresh();
    const rpc = path.join(dir, "rpc.log");
    const h = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: { ...env(state, "idle-silence"), FAKE_RPC_LOG: rpc }, killAfterMs: 60000 });
    if (!await turnStarted(rpc)) { h.child.kill("SIGKILL"); stopRun(dir); return "the driver never started its turn"; }
    const pid = pidOf(dir);
    h.child.kill("SIGTERM");
    const r = await h.done;
    const lines = r.out.split("\n").filter(Boolean);
    if (r.code !== 0 || !lines.includes("DRIVER_EXIT=1") || !lines.includes(`REPORT=${report}`)) problems.push(`after SIGTERM: exit ${r.code}, ${JSON.stringify(lines)}`);
    let rep = null; try { rep = JSON.parse(read(report) ?? ""); } catch {}
    if (!rep || rep.turnStatus !== "interrupted") problems.push(`the driver did not report an interrupted turn: ${rep && rep.turnStatus}`);
    await sleep(300);
    if (alive(pid)) { problems.push(`the driver (pid ${pid}) is still alive`); stopRun(dir); }
    // Before the pid line: the driver held back 1.5 s by a preload, the signal sent once the keeper has
    // claimed err.txt, which is after the call installed its handler.
    ({ dir, state, report } = fresh());
    const k = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: { ...env(state, "idle-silence"), ...preload(HOLD) }, killAfterMs: 60000 });
    for (const until = Date.now() + 10000; Date.now() < until && !fs.existsSync(path.join(dir, "err.txt"));) await sleep(20);
    if (pidOf(dir) !== null) problems.push("the pid line was already there when the signal was sent: the case measured nothing");
    k.child.kill("SIGTERM");
    const kr = await k.done;
    const klines = kr.out.split("\n").filter(Boolean);
    const err = read(path.join(dir, "err.txt")) ?? "";
    if (kr.code !== 0 || !klines.some((l) => l.startsWith("REPORT=")) || klines.includes("DRIVER_EXIT=unknown")) problems.push(`the kept signal: exit ${kr.code}, ${JSON.stringify(klines)}`);
    if (!err.includes("entrust: interrupted by SIGTERM")) problems.push(`the kept signal never reached the driver: ${JSON.stringify(err.slice(0, 300))}`);
    const kpid = pidOf(dir);
    await sleep(300);
    if (kpid !== null && alive(kpid)) { problems.push(`the driver (pid ${kpid}) is still alive`); stopRun(dir); }
    return problems.length === 0 || problems.join("; ");
  });

test("a signal to a --run past its deadline is not forwarded, and the run goes on",
  "a call past its deadline is not a card anyone can Stop; the only signal it can still receive is the teardown of a wrapper that gave it a shorter timeout than the message pins, and forwarding that would cut the run the keeper is there to keep",
  async () => {
    const { dir, state, report } = fresh();
    // The deadline passes while the driver is held back 1.5 s before its pid line, and the signal comes
    // between the two: err.txt is the keeper's claim, made after the call started its clock, and the pid
    // line comes 1.5 s after it.
    const h = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: { ...env(state, "idle-silence"), ...preload(HOLD), AGENT_RUN_RETURN_MS: "300" }, killAfterMs: 60000 });
    for (const until = Date.now() + 10000; Date.now() < until && !fs.existsSync(path.join(dir, "err.txt"));) await sleep(20);
    await sleep(350);
    const problems = [];
    if (pidOf(dir) !== null) problems.push("the pid line was already there when the signal was sent: the case measured nothing");
    h.child.kill("SIGTERM");
    const r = await h.done;
    const lines = r.out.split("\n").filter(Boolean);
    if (r.code !== 0 || !(lines.at(-1) ?? "").startsWith("RUNNING=")) problems.push(`the call past its deadline: exit ${r.code}, ${JSON.stringify(lines)}`);
    await sleep(500);
    const pid = pidOf(dir);
    if (pid === null || !alive(pid)) problems.push("the run did not go on");
    if ((read(path.join(dir, "err.txt")) ?? "").includes("interrupted by")) problems.push("the signal reached the driver");
    stopRun(dir);
    return problems.length === 0 || problems.join("; ");
  });

test("a launch into a directory whose err.txt is already there exits 2 and writes nothing",
  "the claim that keeps one driver per directory: a --run and its rerun can each start a keeper before either has claimed err.txt, and the second keeper must neither start a driver nor truncate the first one's output and stderr",
  async () => {
    const { dir, state, report } = fresh();
    const claim = `entrust: pid=1 identity=x ${ACCEPTED}${report}\n`;
    fs.writeFileSync(path.join(dir, "err.txt"), claim);
    fs.writeFileSync(path.join(dir, "out.json"), "{\"partial\":");
    const r = await launch(dir, report, state).done;
    const problems = [];
    if (r.code !== 2) problems.push(`exited ${r.code}`);
    if (read(path.join(dir, "err.txt")) !== claim) problems.push("err.txt changed");
    if (read(path.join(dir, "out.json")) !== "{\"partial\":") problems.push("out.json changed");
    if (fs.existsSync(path.join(dir, "exit"))) problems.push("an exit marker was written");
    if (fs.existsSync(report)) problems.push("a report was published");
    return problems.length === 0 || problems.join("; ");
  });

const PROMPT = `RIGHTS: read ${shimDir}\nTASK: irrelevant, the server is scripted\n`;
const newAgent = (report, body = PROMPT, env = {}) => {
  const h = spawnNode([LAUNCHER, "--new", "--report-file", report], { env, stdio: ["pipe", "pipe", "pipe"], killAfterMs: 20000 });
  h.child.stdin.end(body);
  return h.done;
};

test("--new makes agent/ beside the report at 0700 with the prompt from stdin at 0600, and refuses a second prompt, an empty one and a relative report path",
  "the coordinator cannot expand $TMPDIR and cannot Write under the data directory; the launcher, handed the report path, is what makes the directory, and the prompt arrives byte for byte through stdin",
  async () => {
    const problems = [];
    const report = path.join(tempDir("agent-run-new."), "run", "report.json");
    const r = await newAgent(report);
    const dir = agentDirOf(report);
    if (r.code !== 0) problems.push(`--new exited ${r.code}: ${r.err.slice(0, 120)}`);
    if (!r.out.includes(`PROMPT=${path.join(dir, "prompt.txt")}`)) problems.push(`--new did not print the prompt path: ${r.out}`);
    if (read(path.join(dir, "prompt.txt")) !== PROMPT) problems.push("the prompt on disk is not the stdin bytes");
    if ((fs.statSync(dir).mode & 0o777) !== 0o700) problems.push(`agent/ mode is ${(fs.statSync(dir).mode & 0o777).toString(8)}`);
    if ((fs.statSync(path.join(dir, "prompt.txt")).mode & 0o777) !== 0o600) problems.push(`prompt.txt mode is ${(fs.statSync(path.join(dir, "prompt.txt")).mode & 0o777).toString(8)}`);
    const again = await newAgent(report, "TASK: other\n");
    if (again.code !== 2 || read(path.join(dir, "prompt.txt")) !== PROMPT) problems.push(`a second --new: exit ${again.code}, prompt ${read(path.join(dir, "prompt.txt")) === PROMPT ? "kept" : "REPLACED"}`);
    const empty = await newAgent(path.join(tempDir("agent-run-new."), "run", "report.json"), "");
    if (empty.code !== 2 || !/empty/.test(empty.err)) problems.push(`an empty prompt: exit ${empty.code}, ${empty.err.slice(0, 80)}`);
    const rel = await newAgent("reports/report.json");
    if (rel.code !== 2 || !/absolute/.test(rel.err)) problems.push(`a relative report path: exit ${rel.code}, ${rel.err.slice(0, 80)}`);
    const elsewhere = tempDir("agent-run-newdir.");
    const withDir = spawnNode([LAUNCHER, "--new", "--dir", elsewhere, "--report-file", path.join(tempDir("agent-run-new."), "run", "report.json")], { stdio: ["pipe", "pipe", "pipe"], killAfterMs: 20000 });
    withDir.child.stdin.end(PROMPT);
    const wd = await withDir.done;
    if (wd.code !== 0 || read(path.join(elsewhere, "prompt.txt")) !== PROMPT) problems.push(`--new --dir: exit ${wd.code}, prompt ${read(path.join(elsewhere, "prompt.txt")) === PROMPT ? "there" : "MISSING"}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--run and --status without --dir use agent/ beside the report, and a --run issued before its --new waits for the prompt",
  "the wrapper's command names only the report path, so the launcher has to find the directory itself; and a coordinator may issue --new and the Agent call in one turn, so the run must not refuse a prompt that is a second away",
  async () => {
    const problems = [];
    const state = tempDir("agent-run-state.");
    let report = path.join(tempDir("agent-run-derived."), "run", "report.json");
    await newAgent(report);
    const r = await spawnNode([LAUNCHER, "--run", "--report-file", report], { env: env(state), killAfterMs: 60000 }).done;
    const lines = r.out.split("\n").filter(Boolean);
    if (r.code !== 0 || !lines.includes("PATH=own") || !lines.includes("EXIT=0")) problems.push(`--run without --dir: exit ${r.code}, ${JSON.stringify(lines.slice(0, 3))}`);
    if (!fs.existsSync(path.join(agentDirOf(report), "exit"))) problems.push("the exit marker is not in agent/ beside the report");
    const s = await spawnNode([LAUNCHER, "--status", "--report-file", report], { killAfterMs: 20000 }).done;
    if (s.code !== 0 || !s.out.includes("PATH=own")) problems.push(`--status without --dir: ${s.out.slice(0, 60)}`);
    // The race: --run first, --new one second later.
    report = path.join(tempDir("agent-run-race."), "run", "report.json");
    const early = spawnNode([LAUNCHER, "--run", "--report-file", report], { env: env(state), killAfterMs: 60000 });
    await sleep(1000);
    await newAgent(report);
    const e = await early.done;
    const elines = e.out.split("\n").filter(Boolean);
    if (e.code !== 0 || !elines.includes("PATH=own") || !elines.includes("EXIT=0")) problems.push(`a --run one second ahead of its --new: exit ${e.code}, ${JSON.stringify(elines.slice(0, 6))}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--new puts a sound prompt through the driver's check, then prints PROMPT= alone and leaves the prompt and nothing else",
  "the check runs before every agent, so a pass must look to the coordinator like no check at all: one PROMPT= line, the prompt byte for byte at 0600, and no second copy beside it",
  async () => {
    const problems = [];
    const spy = path.join(tempDir("agent-run-spy."), "checks.log");
    const report = path.join(tempDir("agent-run-pass."), "run", "report.json");
    const dir = agentDirOf(report);
    const r = await newAgent(report, PROMPT, { ...preload(SPY), AGENT_RUN_SPY: spy });
    if (r.code !== 0 || r.out !== `PROMPT=${path.join(dir, "prompt.txt")}\n`) problems.push(`a sound prompt: exit ${r.code}, ${JSON.stringify(r.out)} ${r.err.slice(0, 120)}`);
    if (read(path.join(dir, "prompt.txt")) !== PROMPT) problems.push("the prompt on disk is not the stdin bytes");
    const left = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    if (JSON.stringify(left) !== JSON.stringify(["prompt.txt"])) problems.push(`the agent's directory holds ${JSON.stringify(left)}`);
    const checks = (read(spy) ?? "").split("\n").filter(Boolean);
    if (checks.length !== 1 || !checks[0].startsWith(`--check-prompt-file ${dir}${path.sep}`)) problems.push(`the checks --new ran: ${JSON.stringify(checks)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--new with a prompt the driver refuses prints the driver's reason on ERROR= and no PROMPT=, exits 2, gives a --run nothing to start, and takes the corrected prompt on the same report path",
  "the refusal used to arrive at --run, after the agent was spawned, and coordinators swapped in the mode it named (2026-09-17 and 2026-09-25); said at --new it goes back to the user before an agent exists, and a refused prompt left in place would be started by a --run issued in the same turn",
  async () => {
    const problems = [];
    // A policy allowing `cached` alone, read like the device's; a mode must pass both, so the seam
    // narrows the policy on any machine. WEB_SEARCH: live is then refused everywhere.
    const policy = path.join(tempDir("agent-run-policy."), "policy.plist");
    fs.writeFileSync(policy, `<?xml version="1.0" encoding="UTF-8"?>\n<plist version="1.0"><dict><key>requirements_toml_base64</key>`
      + `<string>${Buffer.from('allowed_web_search_modes = ["cached"]\n').toString("base64")}</string></dict></plist>\n`);
    const seam = { ENTRUST_POLICY_SEAM: policy };
    const refused = `RIGHTS: read ${shimDir}\nWEB_SEARCH: live\nTASK: find the release notes\n`;
    // The driver's own verdict on the same text, which the ERROR= line has to carry unchanged.
    const copy = path.join(tempDir("agent-run-check."), "prompt.txt");
    fs.writeFileSync(copy, refused);
    const own = spawnSync(process.execPath, [path.join(SCRIPTS, "driver.mjs"), "--check-prompt-file", copy], { env: { ...process.env, ...seam }, encoding: "utf8" });
    const reason = /^entrust: refused: (.+)\n$/.exec(String(own.stderr))?.[1];
    if (own.status !== 2 || !reason) return `the driver's own check did not refuse WEB_SEARCH: live: exit ${own.status}, ${String(own.stderr).slice(0, 200)}`;
    // Refused, corrected on the same report path, run.
    const report = path.join(tempDir("agent-run-refused."), "run", "report.json");
    const dir = agentDirOf(report);
    const r = await newAgent(report, refused, seam);
    if (r.code !== 2 || r.out !== `ERROR=${reason}\n`) problems.push(`a refused prompt: exit ${r.code}, ${JSON.stringify(r.out.slice(0, 200))}, not ERROR= with the driver's reason alone`);
    const left = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    if (left.length) problems.push(`a refused prompt left ${left.join(", ")} in the agent's directory`);
    const fixed = await newAgent(report, PROMPT, seam);
    if (fixed.code !== 0 || fixed.out !== `PROMPT=${path.join(dir, "prompt.txt")}\n`) problems.push(`the corrected prompt: exit ${fixed.code}, ${(fixed.out || fixed.err).trim().slice(0, 200)}`);
    const ran = await spawnNode([LAUNCHER, "--run", "--report-file", report], { env: env(tempDir("agent-run-state.")), killAfterMs: 60000 }).done;
    if (!ran.out.includes("PATH=own") || !ran.out.includes("EXIT=0")) problems.push(`the corrected prompt did not run: ${JSON.stringify(ran.out.split("\n").slice(0, 3))}`);
    // A --run issued in the same turn as a refused --new, and ahead of it; the check held back a second, so
    // a prompt visible while it runs would be one the --run's 200 ms poll finds.
    const report2 = path.join(tempDir("agent-run-refused."), "run", "report.json");
    const early = spawnNode([LAUNCHER, "--run", "--report-file", report2], { env: env(tempDir("agent-run-state.")), killAfterMs: 60000 });
    await sleep(500);
    const second = await newAgent(report2, refused, { ...seam, ...preload(SLOW_CHECK) });
    if (second.code !== 2) problems.push(`the refused --new beside a --run exited ${second.code}`);
    const e = await early.done;
    const elines = e.out.split("\n").filter(Boolean);
    if (/^entrust: pid=/m.test(read(path.join(agentDirOf(report2), "err.txt")) ?? "")) problems.push("a --run started a driver on a refused prompt");
    if (e.code !== 0 || !elines.includes("DRIVER_EXIT=2") || !elines.includes("FILE=missing") || !elines.includes(`REPORT=${report2}`))
      problems.push(`the --run beside a refused --new: exit ${e.code}, ${JSON.stringify(elines)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--new refuses a report path a --run has already launched in after a refused --new: ERROR= names the earlier launch's file, and no PROMPT=",
  "a refused --new, then a --run on the same path, leaves the keeper's refusal and a marker of 2 with no prompt beside them; a corrected --new there printed PROMPT=, and the next --run replayed the old refusal as the corrected prompt's result, a hand-back that looks final and ran nothing",
  async () => {
    const problems = [];
    const report = path.join(tempDir("agent-run-spent."), "run", "report.json");
    const dir = agentDirOf(report);
    const refused = await newAgent(report, `RIGHTS: read ${shimDir}\nBOGUS: x\nTASK: do it\n`);
    if (refused.code !== 2 || !refused.out.startsWith("ERROR=")) return `the refused --new: exit ${refused.code}, ${JSON.stringify(refused.out.slice(0, 120))}`;
    const state = tempDir("agent-run-state.");
    const ran = await spawnNode([LAUNCHER, "--run", "--report-file", report], { env: env(state), killAfterMs: 60000 }).done;
    if (!ran.out.includes("DRIVER_EXIT=2")) problems.push(`the --run after the refused --new: ${JSON.stringify(ran.out.split("\n").slice(0, 2))}`);
    const fixed = await newAgent(report);
    if (fixed.code !== 2) problems.push(`the corrected --new on the spent path exited ${fixed.code}`);
    if (fixed.out !== `ERROR=${path.join(dir, "exit")} is an earlier launch's: this report path is spent, and a corrected prompt goes under a fresh report path\n`)
      problems.push(`the corrected --new on the spent path printed ${JSON.stringify(fixed.out.slice(0, 200))}`);
    if (fs.existsSync(path.join(dir, "prompt.txt"))) problems.push("the corrected --new left a prompt.txt beside the earlier launch");
    // Nothing on the path reads as the corrected prompt's result: the next --run prints the old refusal.
    const again = await spawnNode([LAUNCHER, "--run", "--report-file", report], { env: env(state), killAfterMs: 20000 }).done;
    if (!again.out.includes("DRIVER_EXIT=2") || !again.out.includes("FILE=missing")) problems.push(`the next --run: ${JSON.stringify(again.out.split("\n").slice(0, 2))}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--new whose driver check neither passes nor refuses names a driver fault on ERROR=, prints no PROMPT= and leaves no prompt",
  "a check that crashed has said nothing about the prompt: read as a pass it would let a prompt through unchecked, and read as a refusal it would send the coordinator to the user with a crash for a reason",
  async () => {
    const problems = [];
    const report = path.join(tempDir("agent-run-fault."), "run", "report.json");
    const dir = agentDirOf(report);
    const r = await newAgent(report, PROMPT, preload(FAULT));
    if (r.code !== 2) problems.push(`exited ${r.code}`);
    const lines = r.out.split("\n").filter(Boolean);
    if (lines.length !== 1 || !lines[0].startsWith("ERROR=") || !/exit 3, a fault in the driver/.test(lines[0]) || !lines[0].includes("boom: the check broke"))
      problems.push(`printed ${JSON.stringify(lines)}`);
    const left = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    if (left.length) problems.push(`a faulted check left ${left.join(", ")} in the agent's directory`);
    return problems.length === 0 || problems.join("; ");
  });

process.exit(summarize(await runCases(CASES), CASES.length));
