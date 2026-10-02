#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import os from "node:os";

const launcher = fileURLToPath(new URL("../../codex/scripts/agent-run.mjs", import.meta.url));
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--adapter" && args[i + 1] !== "opencode") {
    console.error("entrust agent-run: refused: the OpenCode entrypoint only accepts adapter opencode");
    process.exit(2);
  }
}
const child = spawn(process.execPath, [launcher, ...args, "--adapter", "opencode"], { stdio: "inherit", env: process.env });
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => child.kill(signal));
child.on("error", (e) => { console.error(e.message); process.exitCode = 2; });
child.on("exit", (code, signal) => { process.exitCode = code ?? (128 + (os.constants.signals[signal] ?? 0)); });
