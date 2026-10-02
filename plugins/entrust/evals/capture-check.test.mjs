#!/usr/bin/env node
// Does skills/orchestrate/scripts/capture-check.mjs keep a check's output out of the context and its exit
// status true?
//
//   node evals/capture-check.test.mjs
//
// Each case replays a shape #15 recorded: a flood (F9: 64, 31 and 23 MB inline), a `| tail` that turned a
// failing suite into exit 0 (F10), a compiler's error list, a signal. The runner is spawned as a coordinator
// would spawn it, with TMPDIR pointed at a scratch directory of this suite's, so every log it writes is
// swept with it and none reaches the machine's own temporary directory.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const RUNNER = path.join(ROOT, "skills", "orchestrate", "scripts", "capture-check.mjs");
const TMP = tempDir("capture-check-test-");

const runner = (args, { env = {}, killAfterMs = 60_000 } = {}) =>
  spawnNode([RUNNER, ...args], { env: { TMPDIR: TMP, ...env }, killAfterMs });
const run = async (args, opts) => {
  const r = await runner(args, opts).done;
  const lines = r.out.replace(/\n$/, "").split("\n");
  const field = (k) => lines.find((l) => l.startsWith(`${k}=`))?.slice(k.length + 1);
  return { ...r, lines, field, last: lines[lines.length - 1] };
};

test("a flood stays in the log: 100,000 lines logged, twenty lines read back in all, fifteen of them the tail",
  "F9: the coordinators of T3 and T8 read tens of megabytes inline, and every call after the read paid for it again; the page's bound is twenty lines read back, the receipt's own included",
  async () => {
    const r = await run(["--", "seq 1 100000"]);
    const problems = [];
    if (r.code !== 0) problems.push(`exit ${r.code}`);
    if (r.lines.length > 20) problems.push(`${r.lines.length} lines printed, more than twenty`);
    const tail = r.lines.filter((l) => /^\d+$/.test(l));
    if (tail.length !== 15 || tail[0] !== "99986") problems.push(`the tail is ${tail.length} lines from ${tail[0]}`);
    if (r.last !== "EXIT=0") problems.push(`last line ${JSON.stringify(r.last)}`);
    if (r.field("LINES") !== "100000") problems.push(`LINES=${r.field("LINES")}`);
    const log = r.field("LOG");
    const logged = log ? fs.readFileSync(log, "utf8").split("\n").filter(Boolean).length : 0;
    if (logged !== 100000) problems.push(`the log holds ${logged} lines`);
    if (r.lines[r.lines.length - 2] !== "100000") problems.push(`the tail ends ${JSON.stringify(r.lines[r.lines.length - 2])}`);
    return problems.length === 0 || problems.join("; ");
  });

test("a `| tail` cannot hide a failure: the pipeline's status is its failing stage's, and a plain bash -c of it says 0",
  "F10: result-gates.md documents `| tail` returning tail's status; a suite that failed under it was reported green",
  async () => {
    const pipeline = "sh -c 'echo failing; exit 1' | tail -1";
    const control = spawnSync("bash", ["-c", pipeline], { encoding: "utf8" });
    if (control.status !== 0) return `the control is not the masking shape: bash -c exits ${control.status}`;
    const r = await run(["--", pipeline]);
    return (r.last === "EXIT=1" && r.code === 1 && r.lines.includes("failing"))
      || `the runner printed ${JSON.stringify(r.last)} and exited ${r.code}: ${r.out.slice(0, 300)}`;
  });

test("a compiler's fourteen errors and exit 2: every line shown, EXIT=2 last, the runner's own exit 2",
  "the tail is the evidence the coordinator reads; a short failing output must arrive whole, with the status the command gave",
  async () => {
    const r = await run(["--label", "tsc", "--", "for i in $(seq 1 14); do echo \"src/x.ts($i,1): error TS2322: Type 'a' is not assignable\"; done; exit 2"]);
    const shown = r.lines.filter((l) => /error TS2322/.test(l)).length;
    return (shown === 14 && r.last === "EXIT=2" && r.code === 2) || `${shown} error lines, last ${JSON.stringify(r.last)}, exit ${r.code}`;
  });

test("the twenty-line bound holds at --lines 15 and for a multi-line command, whose label prints on one line",
  "the bound is a count a transcript reader can check; a label that spans lines, or a tail flag at its maximum, must not push the read-back past twenty",
  async () => {
    const a = await run(["--lines", "15", "--", "seq 1 1000"]);
    const b = await run(["--", "for i in $(seq 1 50); do\n  echo line $i\ndone"]);
    const problems = [];
    if (a.lines.length !== 20 || a.last !== "EXIT=0") problems.push(`--lines 15 printed ${a.lines.length} lines, last ${a.last}`);
    if (b.lines.length !== 20 || !/^LABEL=for i in \$\(seq 1 50\); do echo line \$i done$/.test(b.lines[0])) problems.push(`a multi-line command printed ${b.lines.length} lines, first ${JSON.stringify(b.lines[0])}`);
    return problems.length === 0 || problems.join("; ");
  });

test("a command a signal ends reads EXIT=signal SIGTERM, and the runner exits 143",
  "a killed check is neither a pass nor an ordinary failure; printing a number for it is how a signal becomes exit 0 or 1 in a report",
  async () => {
    const r = await run(["--", "kill -TERM $$"]);
    return (r.last === "EXIT=signal SIGTERM" && r.code === 143) || `last ${JSON.stringify(r.last)}, exit ${r.code}`;
  });

test("a SIGTERM to the runner reaches the command, and the receipt and EXIT still print",
  "the Bash tool's timeout signals the runner, not the check: a runner that died silently would leave the check running and no verdict",
  async () => {
    const h = runner(["--", "sleep 30"]);
    const t0 = Date.now();
    await new Promise((res) => setTimeout(res, 400));
    h.child.kill("SIGTERM");
    const r = await h.done;
    const last = r.out.replace(/\n$/, "").split("\n").pop();
    const ms = Date.now() - t0;
    return (last === "EXIT=signal SIGTERM" && r.code === 143 && ms < 10_000) || `last ${JSON.stringify(last)}, exit ${r.code}, after ${ms} ms`;
  });

test("the log is under $TMPDIR/entrust/checks, private, and holds stdout and stderr merged in order",
  "the page's own words say the runner writes only under $TMPDIR; a log elsewhere is a write the plan did not list",
  async () => {
    const r = await run(["--label", "order", "--", "echo one; echo two >&2; echo three"]);
    const log = r.field("LOG") ?? "";
    const problems = [];
    if (!fs.realpathSync(log).startsWith(fs.realpathSync(TMP) + path.sep)) problems.push(`the log is at ${log}, outside ${TMP}`);
    if (!/check-order\.[0-9a-f]{8}\.log$/.test(log)) problems.push(`the log is not named for its label: ${log}`);
    const dir = path.dirname(log);
    if (path.dirname(dir) !== path.join(fs.realpathSync(TMP), "entrust", "checks")) problems.push(`ungrouped directory: ${dir}`);
    if ((fs.statSync(dir).mode & 0o777) !== 0o700) problems.push("the check directory is not private");
    const mode = fs.statSync(log).mode & 0o777;
    if (mode !== 0o600) problems.push(`mode ${mode.toString(8)}`);
    const body = fs.readFileSync(log, "utf8");
    if (body !== "one\ntwo\nthree\n") problems.push(`the log reads ${JSON.stringify(body)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("a linked namespace, linked category or regular-file namespace refuses the check before its command runs",
  "a fixed shared name must not let a pre-existing link redirect the plugin's temporary writes",
  async () => {
    const problems = [];
    for (const shape of ["namespace-link", "category-link", "namespace-file"]) {
      const root = path.join(TMP, shape);
      const outside = path.join(TMP, `${shape}-outside`);
      fs.mkdirSync(root); fs.mkdirSync(outside);
      const base = path.join(root, "entrust");
      if (shape === "namespace-file") fs.writeFileSync(base, "file");
      else if (shape === "namespace-link") fs.symlinkSync(outside, base);
      else { fs.mkdirSync(base); fs.symlinkSync(outside, path.join(base, "checks")); }
      const marker = path.join(root, "ran");
      const r = await run(["--", `touch '${marker}'`], { env: { TMPDIR: root } });
      if (r.code !== 2 || !r.last.startsWith("ERROR=")) problems.push(`${shape}: exit ${r.code}, ${r.last}`);
      if (fs.existsSync(marker) || fs.readdirSync(outside).length) problems.push(`${shape}: wrote despite refusal`);
    }
    return problems.length === 0 || problems.join("; ");
  });

test("parallel checks use separate directories and retain both complete logs",
  "two coordinators can ask the same check question at once without sharing a temporary leaf",
  async () => {
    const results = await Promise.all([run(["--", "echo first"]), run(["--", "echo second"])]);
    const logs = results.map((r) => r.field("LOG"));
    return (results.every((r) => r.code === 0) && path.dirname(logs[0]) !== path.dirname(logs[1])
      && fs.readFileSync(logs[0], "utf8") === "first\n" && fs.readFileSync(logs[1], "utf8") === "second\n")
      || "parallel checks shared a directory or lost output";
  });

test("a long line is clipped to 200 characters, a carriage-return progress line shows its last state, a 2 MB unterminated line stays bounded",
  "a single minified bundle line or a progress bar is a flood in one line; a tail that prints it whole bounds nothing",
  async () => {
    const r = await run(["--", "printf '%0300d\\n' 0; printf 'progress 10%%\\rprogress 50%%\\rprogress 100%%\\n'; head -c 2097152 /dev/zero | tr '\\0' x"]);
    const problems = [];
    const clipped = r.lines.find((l) => /^0{200} …\(\+100 bytes\)$/.test(l));
    if (!clipped) problems.push("no line clipped to 200 characters with its count");
    if (!r.lines.includes("progress 100%")) problems.push("the progress line is not shown as its last state");
    if (!r.lines.some((l) => /^x{200} …\(\+2096952 bytes\)$/.test(l))) problems.push("the 2 MB line is not shown as 200 characters and the bytes cut");
    if (r.lines.some((l) => l.length > 260)) problems.push(`a printed line is ${Math.max(...r.lines.map((l) => l.length))} characters`);
    if (Buffer.byteLength(r.out) > 8000) problems.push(`${Buffer.byteLength(r.out)} bytes printed`);
    if (r.last !== "EXIT=0") problems.push(`last ${JSON.stringify(r.last)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--ledger: the receipt is recorded, a second command on the same question is refused and runs nothing, --summary charges both",
  "the page's bound is one command per question and the second one goes to an agent (#15 F15); a ledger that only counted would make that a sentence again",
  async () => {
    const ledger = path.join(TMP, "ledger.jsonl");
    const marker = path.join(TMP, "second-ran");
    const first = await run(["--ledger", ledger, "--label", "suite passes", "--", "echo 3 passed"]);
    const second = await run(["--ledger", ledger, "--label", "suite passes", "--", `touch ${marker}; echo 3 passed`]);
    const other = await run(["--ledger", ledger, "--label", "slug exported", "--", "echo yes"]);
    const sum = await run(["--summary", "--ledger", ledger]);
    const problems = [];
    if (first.code !== 0 || first.last !== "EXIT=0") problems.push(`the first check: exit ${first.code}, ${first.last}`);
    if (second.code !== 2 || !/^ERROR=.*second command on the same question goes to an agent/.test(second.last)) problems.push(`the second check was not refused: exit ${second.code}, ${second.last}`);
    if (fs.existsSync(marker)) problems.push("the refused command ran");
    if (other.code !== 0) problems.push(`another question was refused: ${other.last}`);
    const rows = fs.readFileSync(ledger, "utf8").trim().split("\n").map((l) => JSON.parse(l));
    const r0 = rows[0];
    if (!r0 || r0.shownBytes !== Buffer.byteLength(first.out)) problems.push(`the receipt's shownBytes ${r0?.shownBytes} is not the ${Buffer.byteLength(first.out)} bytes printed`);
    if (!rows[1]?.refused) problems.push("the refusal is not in the ledger");
    for (const want of ["CHECKS=2", "REFUSED=1", "QUESTION=1 1 suite passes", "QUESTION=1 0 slug exported", "LATER_READS=unknown"])
      if (!sum.lines.includes(want)) problems.push(`--summary lacks ${want}`);
    return problems.length === 0 || `${problems.join("; ")}\n${sum.out}`;
  });

test("refusals print ERROR= last and run nothing: no command, an unknown flag, --lines above fifteen",
  "a runner that guessed at a malformed call would run something the coordinator did not write, and a tail above fifteen breaks the twenty-line bound",
  async () => {
    const problems = [];
    for (const args of [["--label", "x"], ["--tail", "5", "--", "echo x"], ["--lines", "16", "--", "echo x"], ["--summary"]]) {
      const r = await run(args);
      if (r.code !== 2 || !r.last.startsWith("ERROR=") || r.lines.some((l) => l.startsWith("LOG="))) problems.push(`${args.join(" ")}: exit ${r.code}, ${r.out.trim()}`);
    }
    return problems.length === 0 || problems.join("; ");
  });

test("--help is the canonical reference: it names the output lines, pipefail, the ledger's refusal and the exit rule",
  "the pages point at --help instead of restating the details, so --help is where the details must be",
  async () => {
    const r = await run(["--help"]);
    const missing = ["pipefail", "LABEL=", "LOG=", "LINES=", "BYTES=", "EXIT=<status>", "signal <NAME>", "--ledger FILE", "refused", "--summary", "LATER_READS=unknown", "128 + the signal number", "20 lines at most in all", "default 15, at most 15"]
      .filter((s) => !r.out.includes(s));
    return (r.code === 0 && missing.length === 0) || `exit ${r.code}; --help lacks ${missing.join(", ")}`;
  });

const failed = await runCases(CASES);
process.exit(summarize(failed, CASES.length));
