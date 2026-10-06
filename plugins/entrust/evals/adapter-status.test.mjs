#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adapterRegistry, collectStatuses, parseArgs } from "../plugin/skills/orchestrate/scripts/adapter-status.mjs";
import { registry, runCases, summarize, spawnNode, tempDir } from "./lib/harness.mjs";
import { fakeOpenCode } from "./fake-opencode.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../plugin");
const SCRIPT = path.join(ROOT, "skills/orchestrate/scripts/adapter-status.mjs");
const { cases, test } = registry();
const add = (name, fn) => test(name, name, async () => { await fn(); return true; });

add("status collector returns adapter reports verbatim and skip avoids the selected probe", async () => {
  const manifest = [{ id: "codex", script: "../codex/scripts/status.mjs", args: ["--json"] },
    { id: "opencode", script: "../opencode/scripts/status.mjs", args: ["--format", "json"] }];
  const calls = [];
  const result = await collectStatuses({ manifest, skip: parseArgs(["--skip", "codex"], manifest), probe: async (entry) => {
    calls.push(entry.id);
    return { status: "ready", recent: { status: "available", models: [{ providerID: "router", modelID: "m1" }] } };
  } });
  assert.deepEqual(calls, ["opencode"]);
  assert.deepEqual(result.adapters, [
    { id: "codex", result: { status: "skipped" } },
    { id: "opencode", result: { status: "ready", recent: { status: "available", models: [{ providerID: "router", modelID: "m1" }] } } },
  ]);
});

add("the public skip flag accepts codex and rejects unknown adapters", () => {
  const manifest = adapterRegistry();
  assert.deepEqual([...parseArgs(["--skip", "codex"], manifest)], ["codex"]);
  assert.throws(() => parseArgs(["--skip", "codex-cli"], manifest), /usage/);
  assert.throws(() => parseArgs(["--skip", "not-registered"], manifest), /usage/);
});

add("the CLI applies --skip codex without host JSON or a Codex probe", async () => {
  const state = tempDir("entrust-adapter-status-state-");
  const { child, done } = spawnNode([SCRIPT, "--skip", "codex"], { stdio: ["ignore", "pipe", "pipe"], env: {
    ENTRUST_OPENCODE_URL: undefined, ENTRUST_OPENCODE_CONNECTION: undefined, ENTRUST_OPENCODE_LOCAL: undefined,
    ENTRUST_OPENCODE_MODEL_STATE: undefined, XDG_STATE_HOME: state,
  }, killAfterMs: 10000 });
  const r = await done;
  assert.equal(r.code, 0, r.out + r.err);
  const result = JSON.parse(r.out);
  assert.deepEqual(result.adapters.map(({ id, result }) => [id, result.status]), [["codex", "skipped"], ["opencode", "local_unprobed"]]);
  assert.equal(child.killed, false);
});

add("a failed OpenCode endpoint preserves its saved recent refs as unchecked", async () => {
  const server = await fakeOpenCode("health-error");
  const state = tempDir("entrust-adapter-status-recent-");
  const modelState = path.join(state, "model.json");
  fs.writeFileSync(modelState, JSON.stringify({ recent: [
    { providerID: "router", modelID: "first" }, { providerID: "router", modelID: "second" }, { providerID: "router", modelID: "third" },
  ] }));
  try {
    const { done } = spawnNode([SCRIPT, "--skip", "codex"], { stdio: ["ignore", "pipe", "pipe"], env: {
      ENTRUST_OPENCODE_URL: server.url, ENTRUST_OPENCODE_CONNECTION: undefined,
      ENTRUST_OPENCODE_LOCAL: undefined, ENTRUST_OPENCODE_MODEL_STATE: modelState,
    }, killAfterMs: 10000 });
    const r = await done;
    assert.equal(r.code, 0, r.out + r.err);
    const report = JSON.parse(r.out).adapters.find((adapter) => adapter.id === "opencode").result;
    assert.equal(report.status, "unchecked");
    assert.equal(report.recent.status, "available");
    assert.deepEqual(report.recent.models.map((model) => model.modelID), ["first", "second"]);
  } finally { await server.close(); }
});

add("the status collector has no host-context input or adapter skill loading", () => {
  const source = fs.readFileSync(path.join(ROOT, "skills/orchestrate/scripts/adapter-status.mjs"), "utf8");
  assert.equal(source.includes("host-context"), false);
  assert.equal(source.includes("SKILL.md"), false);
  assert.deepEqual(adapterRegistry().map((entry) => entry.id), ["codex", "opencode"]);
});

process.exit(summarize(await runCases(cases), cases.length));
