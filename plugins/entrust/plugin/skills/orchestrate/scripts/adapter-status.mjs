#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(SCRIPT_DIR, "..");
const SKILLS_ROOT = path.resolve(SKILL_DIR, "..");
const MANIFEST = path.join(SKILL_DIR, "adapters.json");
const MAX_OUTPUT = 1024 * 1024;
const TIMEOUT_MS = 30000;

export function adapterRegistry() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.adapters)) throw new Error("invalid adapter manifest");
  return manifest.adapters;
}

export function parseArgs(args, manifest = adapterRegistry()) {
  const skip = new Set();
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i], id = args[i + 1];
    if (flag !== "--skip" || !id || !manifest.some((entry) => entry.id === id) || skip.has(id))
      throw new Error("usage: adapter-status.mjs [--skip codex] [--skip adapter-id]");
    skip.add(id);
  }
  return skip;
}

function runProbe(entry, { timeoutMs = TIMEOUT_MS, maxOutputBytes = MAX_OUTPUT } = {}) {
  const script = path.resolve(SKILL_DIR, entry.script);
  if (!script.startsWith(SKILLS_ROOT + path.sep) || !fs.existsSync(script))
    return Promise.resolve({ status: "unchecked", error: "probe_script_unavailable" });
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script, ...entry.args], {
      cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "ignore"],
    });
    let stdout = "", settled = false, stopReason = null, killTimer = null;
    let timer;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(killTimer);
      resolve(result);
    };
    const stop = (reason) => {
      if (stopReason) return;
      stopReason = reason;
      child.kill("SIGTERM");
      killTimer = setTimeout(() => child.kill("SIGKILL"), 3000);
    };
    child.stdout.on("data", (chunk) => {
      if (stopReason) return;
      stdout += chunk;
      if (Buffer.byteLength(stdout) > maxOutputBytes) stop("probe_output_limit");
    });
    child.once("error", () => finish({ status: "unchecked", error: "probe_start_failed" }));
    timer = setTimeout(() => stop("probe_timeout"), timeoutMs);
    child.once("close", (code, signal) => {
      if (stopReason) return finish({ status: "unchecked", error: stopReason });
      if (code !== 0 || signal) return finish({ status: "unchecked", error: "probe_failed" });
      try {
        const status = JSON.parse(stdout);
        finish(status && typeof status === "object" && !Array.isArray(status)
          ? status : { status: "unchecked", error: "probe_invalid_shape" });
      } catch { finish({ status: "unchecked", error: "probe_invalid_json" }); }
    });
  });
}

export async function collectStatuses({ skip = new Set(), manifest = adapterRegistry(), probe = runProbe } = {}) {
  const adapters = [];
  for (const entry of manifest) {
    adapters.push({ id: entry.id, result: skip.has(entry.id) ? { status: "skipped" } : await probe(entry) });
  }
  return { schemaVersion: 1, adapters };
}

async function main() {
  try {
    const adapters = adapterRegistry();
    const result = await collectStatuses({ skip: parseArgs(process.argv.slice(2), adapters), manifest: adapters });
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`adapter status: ${error.message}\n`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
