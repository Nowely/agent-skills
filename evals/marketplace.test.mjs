#!/usr/bin/env node
// Real Codex discovery and installation from a standalone marketplace snapshot. No model turns.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const probe = spawnSync("codex", ["--version"], { encoding: "utf8" });
if (probe.status !== 0) {
  console.log("SKIP: Codex CLI is unavailable; marketplace installation was not checked");
  process.exit(0);
}
const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "nowely-marketplace-")));
const staged = path.join(root, "source"), home = path.join(root, "home");
fs.mkdirSync(path.join(staged, ".claude-plugin"), { recursive: true });
fs.mkdirSync(home);
const catalogue = JSON.parse(fs.readFileSync(path.join(repo, ".claude-plugin/marketplace.json"), "utf8"));
fs.writeFileSync(path.join(staged, ".claude-plugin/marketplace.json"), JSON.stringify(catalogue));
for (const entry of catalogue.plugins) {
  const rel = typeof entry.source === "string" ? entry.source : entry.source.path;
  assert.ok(rel.startsWith("./") && !rel.split("/").includes(".."));
  fs.cpSync(path.join(repo, rel), path.join(staged, rel), { recursive: true });
}
const env = { ...process.env, CODEX_HOME: home };
const cli = (...args) => {
  const p = spawnSync("codex", [...args, "--json"], { env, cwd: root, encoding: "utf8", timeout: 30000 });
  assert.equal(p.status, 0, `${args.join(" ")}: ${p.stderr}`);
  return JSON.parse(p.stdout);
};

async function discover() {
  const child = spawn("codex", ["app-server"], { env, cwd: root, stdio: ["pipe", "pipe", "pipe"] });
  let buffer = "", err = "";
  const waiting = new Map();
  child.stderr.on("data", (s) => { err += s; });
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    while (buffer.includes("\n")) {
      const at = buffer.indexOf("\n"), line = buffer.slice(0, at); buffer = buffer.slice(at + 1);
      if (!line) continue;
      const msg = JSON.parse(line), callback = waiting.get(msg.id);
      if (callback) { waiting.delete(msg.id); callback(msg); }
    }
  });
  const request = (id, method, params) => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { waiting.delete(id); reject(new Error(`${method} timed out: ${err}`)); }, 20000);
    waiting.set(id, (msg) => { clearTimeout(timeout); msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result); });
    child.stdin.write(JSON.stringify({ id, method, params }) + "\n");
  });
  try {
    await request(1, "initialize", { clientInfo: { name: "marketplace-check", version: "1" }, capabilities: { experimentalApi: true } });
    child.stdin.write('{"method":"initialized"}\n');
    return await request(2, "skills/list", { cwds: [root], forceReload: true });
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => { child.once("exit", resolve); setTimeout(() => { child.kill("SIGKILL"); resolve(); }, 2000).unref(); });
  }
}

try {
  const added = cli("plugin", "marketplace", "add", staged);
  assert.equal(added.marketplaceName, catalogue.name);
  const listing = cli("plugin", "list", "--marketplace", catalogue.name, "--available");
  assert.deepEqual(listing.available.map((p) => p.name).sort(), catalogue.plugins.map((p) => p.name).sort());
  console.log(`PASS: ${probe.stdout.trim()} discovers ${listing.available.length} catalogue entries`);
  const installed = cli("plugin", "add", `entrust@${catalogue.name}`);
  assert.ok(installed.installedPath.startsWith(home + path.sep));
  // Discovery must use the installed cache, not silently fall back to the source tree.
  fs.rmSync(staged, { recursive: true, force: true });
  const result = await discover();
  const skills = result.data.flatMap((group) => group.skills).filter((s) => s.pluginId === `entrust@${catalogue.name}`);
  const payload = path.join(repo, "plugins/entrust/plugin");
  const expected = fs.readdirSync(path.join(payload, "skills"), { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => `entrust:${d.name}`).sort();
  assert.deepEqual(skills.map((s) => s.name).sort(), expected);
  assert.ok(skills.every((s) => s.enabled && s.path.startsWith(installed.installedPath + path.sep)));
  for (const skill of skills) {
    const rel = path.relative(installed.installedPath, skill.path);
    assert.equal(fs.readFileSync(skill.path, "utf8"), fs.readFileSync(path.join(payload, rel), "utf8"));
  }
  const policy = path.join(installed.installedPath, "skills/orchestrate/agents/openai.yaml");
  assert.equal(fs.readFileSync(policy, "utf8"), fs.readFileSync(path.join(payload, "skills/orchestrate/agents/openai.yaml"), "utf8"));
  console.log(`PASS: installed cache discovers all ${skills.length} entrust skills with source removed`);
  console.log("PASS: installed skill content and explicit invocation metadata match the payload");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
