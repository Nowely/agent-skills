#!/usr/bin/env node
// Every suite under evals/, in one command.
//
//   node evals/run-all.mjs
//
// Suites run side by side, as many at once as the machine has cores. They spend most of their time
// waiting on the driver's real timers, not computing (worktree: 66 s wall, 11 s CPU), so one at a time left
// the cores idle and a full run took ten minutes. Each suite is its own process with its own $TMPDIR,
// so running them together shares nothing. Each suite's output is printed whole when it ends, so two
// suites never interleave; the last line here is the one to read.
//
// A red suite does not stop the run. Run one at a time, stopping saved minutes. Run side by side, the
// long suites are already running by then, so stopping saves little and hides every later result.
//
// Exit 0 only if every suite exited 0. A suite that needs a live binary or an opt-in variable exits 0
// without it and says so in its own last line; the summary repeats that as skipped or not run rather than
// counting it green. --require-live (or REQUIRE_LIVE_CODEX=1) turns fidelity's skip into a failure.

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { measured, parseCount } from "./lib/counts.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
// Hand-ordered, longest first, because the order is information: a run lasts at least as long as the
// longest suite, so starting the long ones first keeps them from becoming the tail. The order comes from a
// 4-core Linux run (protocol 131 s, opencode 105 s, agent-run 103 s, lock 84 s, worktree 66 s,
// conformance 61 s, cli 43 s, cleanup 14 s, the rest a few seconds). The list is checked against the
// directory, because a suite file nobody listed here would otherwise never run.
const SUITES = ["protocol", "opencode", "agent-run", "lock", "worktree", "conformance", "cli", "cleanup", "swarm", "prepare-feedback", "capture-check", "fidelity", "package", "agent-contract", "orchestrate", "attach-pasted", "status", "adapter-status", "advisor", "fragments", "lint-draft", "gate-checks", "orchestrate-live"];
const onDisk = fs.readdirSync(HERE).filter((f) => f.endsWith(".test.mjs")).map((f) => f.slice(0, -".test.mjs".length));
const unlisted = onDisk.filter((n) => !SUITES.includes(n)), missing = SUITES.filter((n) => !onDisk.includes(n));
if (unlisted.length || missing.length) {
  console.log(`run-all: SUITES disagrees with evals/: ${[...unlisted.map((n) => `${n}.test.mjs is not listed`),
    ...missing.map((n) => `${n}.test.mjs does not exist`)].join("; ")}`);
  process.exit(2);
}
const requireLive = process.argv.includes("--require-live") || process.env.REQUIRE_LIVE_CODEX === "1";
const JOBS = os.availableParallelism();

function runSuite(name) {
  return new Promise((resolve) => {
    const args = [path.join(HERE, `${name}.test.mjs`), ...(name === "fidelity" && requireLive ? ["--require-live"] : [])];
    const p = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    const started = Date.now();
    // One buffer for both streams, in arrival order, so the block printed at the end reads as the suite
    // printed it.
    p.stdout.on("data", (d) => { out += d; });
    p.stderr.on("data", (d) => { out += d; });
    p.on("close", (code, signal) => resolve({ code, signal, out, ms: Date.now() - started }));
  });
}

// Indexed by SUITES, so the summary lists suites in a fixed order whatever order they finished in.
const results = [];
let next = 0;
async function worker() {
  while (next < SUITES.length) {
    const i = next++, name = SUITES[i];
    const r = await runSuite(name);
    const count = parseCount(r.out);
    // A suite killed by a signal reports `code` null, and `process.exit(null)` exits 0: a killed suite
    // used to end the run green.
    const red = r.code !== 0 || r.signal;
    results[i] = { name, count, red, code: r.code ?? 1, why: r.signal ? `killed by ${r.signal}` : `exit ${r.code}`, ms: r.ms };
    process.stdout.write(`\n=== ${name} (${(r.ms / 1000).toFixed(0)}s) ===\n${r.out}`);
  }
}
console.log(`run-all: ${SUITES.length} suites, ${JOBS} at a time`);
const started = Date.now();
await Promise.all(Array.from({ length: Math.min(JOBS, SUITES.length) }, worker));

const failed = results.filter((r) => r.red);
// A red suite is not also counted as not run, and a suite that measured nothing is not green.
const notRun = results.filter((r) => !r.red && !measured(r.count)).length;
const green = SUITES.length - failed.length - notRun;
const listing = results.map((r) => `${r.name} ${r.count}${r.red ? " FAILED" : ""} (${(r.ms / 1000).toFixed(0)}s)`).join(", ");
const wall = `${((Date.now() - started) / 1000).toFixed(0)}s`;

console.log(failed.length
  ? `\nrun-all: ${failed.map((r) => `${r.name} FAILED (${r.why})`).join(", ")}; ${green}/${SUITES.length} suites green, ${notRun} not run, in ${wall}: ${listing}`
  : notRun
    ? `\nrun-all: ${green}/${SUITES.length} suites green, ${notRun} not run, in ${wall}: ${listing}`
    : `\nrun-all: all ${SUITES.length} suites green in ${wall}: ${listing}`);
process.exit(failed.length ? failed[0].code : 0);
