#!/usr/bin/env node
// The Codex adapter's entry to the shared launcher, orchestrate/scripts/agent-run.mjs: a directory that
// records no backend is a Codex agent's.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { main } from "../../orchestrate/scripts/agent-run.mjs";

export * from "../../orchestrate/scripts/agent-run.mjs";
export { SHORT_NAMES, shortName } from "./launch.mjs";

const isEntry = (() => { try { return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isEntry) main(process.argv.slice(2), { fallback: "codex" });
