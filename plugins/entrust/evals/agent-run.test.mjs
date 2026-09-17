#!/usr/bin/env node
// Does scripts/agent-run.mjs launch and read a run the way the wrapper's message says it does?
//
//   node evals/agent-run.test.mjs
//
// The wrapper hands the launcher two paths and nothing else, so everything the page used to spell out
// in shell — the redirects, the exit marker written last, the three driver strings that sort a report,
// the fixed status lines — is now this script's promise, measured here against the fake app server.

import fs from "node:fs";
import path from "node:path";
import { EXIT, FAKE, SCRIPTS, codexShim, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";
import { ACCEPTED, REFUSED, SHORT_NAMES, STATUS_LINES, TAKEN } from "../skills/codex/scripts/agent-run.mjs";

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

const { cases: CASES, test } = registry();

test("--help names both modes and exits 0",
  "the page sends a reader here for what the launcher does; a script with no help is a promise nobody can check",
  async () => {
    const { code, out } = await spawnNode([LAUNCHER, "--help"], { killAfterMs: 10000 }).done;
    if (code !== 0) return `--help exited ${code}`;
    for (const s of ["--run --dir DIR --report-file REPORT", "--status", ...STATUS_LINES]) if (!out.includes(s)) return `--help does not mention ${s}`;
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
    const model = SHORT_NAMES[r.model] ?? r.model;
    if (get("RECEIPT") !== `turnStatus=${r.turnStatus} receiptOk=${r.receiptOk} model=${model}`) problems.push(`RECEIPT=${get("RECEIPT")}`);
    if (get("FILE") !== "exists") problems.push(`FILE=${get("FILE")}`);
    if (get("REPORT") !== report) problems.push(`REPORT=${get("REPORT")}`);
    return problems.length === 0 || problems.join("; ");
  });

test("a slug in the report becomes its short name on the RECEIPT line, and an unknown model stays as written",
  "the coordinator retold `model=gpt-5.6-terra` to the user twice (measured 2026-09-17); the slug it reads is the slug it writes, so the status line carries the name the page uses",
  async () => {
    const { dir, report } = fresh();
    fs.mkdirSync(path.dirname(report), { recursive: true });
    fs.writeFileSync(path.join(dir, "exit"), "0\n");
    fs.writeFileSync(path.join(dir, "err.txt"), `entrust: pid=1 identity=x ${ACCEPTED}${report}\n`);
    const problems = [];
    for (const [slug, name] of [...Object.entries(SHORT_NAMES), ["gpt-9-nova", "gpt-9-nova"]]) {
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

test("a refused launch leaves an exit marker of 2 and its reason in err.txt, and a reused directory is refused without touching the earlier run's files",
  "the wrapper's wait reads the exit marker, so a refusal that left none would wait for a driver that never started; and the whole point of one launch per directory is that the earlier record survives",
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
    const before = { out: read(path.join(dir, "out.json")), exit: read(path.join(dir, "exit")), errFirst: (read(path.join(dir, "err.txt")) ?? "").split("\n")[0] };
    const second = path.join(path.dirname(report), "second.json");
    r = await launch(dir, second, state).done;
    if (r.code !== 2) problems.push(`a reused directory exited ${r.code}`);
    if (read(path.join(dir, "out.json")) !== before.out || read(path.join(dir, "exit")) !== before.exit) problems.push("a refused relaunch changed the earlier run's out.json or exit");
    const errNow = read(path.join(dir, "err.txt")) ?? "";
    if (errNow.split("\n")[0] !== before.errFirst) problems.push("a refused relaunch changed the earlier run's pid line");
    if (!errNow.includes(`${REFUSED}: ${path.join(dir, "exit")} already exists`)) problems.push("the reused-directory refusal is not in err.txt");
    if (fs.existsSync(second)) problems.push("the refused relaunch produced a report");
    s = await status(dir, second);
    if (!s.lines.includes("PATH=none") || !s.lines.includes("FILE=missing")) problems.push(`the refused relaunch reads as ${JSON.stringify(s.lines)}`);
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

test("--run refuses a directory that ran for another report path, prints the nine lines on a missing directory, and forwards SIGTERM to a driver it only waits for",
  "the same command again must read the run it started and nothing else: a reused directory would print an earlier run's success as this run's; a refusal that printed no REPORT= line would send the wrapper into an endless rerun; and a Stop on the card after the ceiling reaches a launcher that did not start the driver",
  async () => {
    const problems = [];
    // Another report path in a directory that already ran.
    let { dir, state, report } = fresh();
    await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state), killAfterMs: 60000 }).done;
    const other = path.join(path.dirname(report), "other.json");
    const r = await spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", other], { env: env(state), killAfterMs: 20000 }).done;
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
    // SIGTERM to the waiting call.
    ({ dir, state, report } = fresh());
    const first = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state, "slow-turn"), killAfterMs: 60000 });
    const deadline = Date.now() + 15000;
    let pid = null;
    while (Date.now() < deadline && pid === null) { const m = /^entrust: pid=(\d+) /.exec((read(path.join(dir, "err.txt")) ?? "").split("\n")[0]); if (m) pid = Number(m[1]); else await sleep(100); }
    if (pid === null) return "the driver never printed its pid line";
    await sleep(500);
    const second = spawnNode([LAUNCHER, "--run", "--dir", dir, "--report-file", report], { env: env(state, "slow-turn"), killAfterMs: 60000 });
    await sleep(700);
    second.child.kill("SIGTERM");
    const [a, b] = await Promise.all([first.done, second.done]);
    if (!a.out.includes("DRIVER_EXIT=1") || !b.out.includes("DRIVER_EXIT=1")) problems.push(`after SIGTERM to the waiting call the lines say ${JSON.stringify([a.out.split("\n")[0], b.out.split("\n")[0]])}`);
    let rep = null; try { rep = JSON.parse(read(report) ?? ""); } catch {}
    if (!rep || rep.turnStatus !== "interrupted") problems.push(`the driver did not report an interrupted turn: ${rep && rep.turnStatus}`);
    await sleep(300);
    let aliveStill = false; try { process.kill(pid, 0); aliveStill = true; } catch {}
    if (aliveStill) { problems.push(`the driver (pid ${pid}) is still alive`); try { process.kill(pid, "SIGKILL"); } catch {} }
    return problems.length === 0 || problems.join("; ");
  });

process.exit(summarize(await runCases(CASES), CASES.length));
