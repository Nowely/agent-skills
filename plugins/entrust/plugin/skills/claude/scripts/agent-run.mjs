#!/usr/bin/env node
// The Claude adapter's entry to the shared launcher, orchestrate/scripts/agent-run.mjs: every call it
// takes is an external Claude agent's.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { REFUSED, main } from "../../orchestrate/scripts/agent-run.mjs";

const isEntry = (() => { try { return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isEntry) {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--adapter" && args[i + 1] !== "claude") {
      console.error(`${REFUSED}: the Claude entrypoint only accepts adapter claude`);
      process.exit(2);
    }
  }
  main([...args, "--adapter", "claude"], { fallback: "claude" });
}
