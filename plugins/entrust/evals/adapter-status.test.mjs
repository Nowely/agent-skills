#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adapterRegistry, collectStatuses, parseArgs } from "../plugin/skills/orchestrate/scripts/adapter-status.mjs";
import { registry, runCases, summarize, spawnNode, tempDir } from "./lib/harness.mjs";
import { desktopStore, fakeCli, fakeOpenCode } from "./fake-opencode.mjs";

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
    return { status: "ready", models: { source: "desktop", note: null, list: [{ providerID: "router", modelID: "m1" }] } };
  } });
  assert.deepEqual(calls, ["opencode"]);
  assert.deepEqual(result.adapters, [
    { id: "codex", result: { status: "skipped" } },
    { id: "opencode", result: { status: "ready", models: { source: "desktop", note: null, list: [{ providerID: "router", modelID: "m1" }] } } },
  ]);
});

add("the public skip flag accepts codex and rejects unknown adapters", () => {
  const manifest = adapterRegistry();
  assert.deepEqual([...parseArgs(["--skip", "codex"], manifest)], ["codex"]);
  assert.throws(() => parseArgs(["--skip", "codex-cli"], manifest), /usage/);
  assert.throws(() => parseArgs(["--skip", "not-registered"], manifest), /usage/);
});

add("the CLI applies --skip codex without host JSON or a Codex probe", async () => {
  // An `opencode` that cannot serve: OpenCode's status reports itself unavailable rather than failing the collector.
  const bin = path.join(tempDir("entrust-adapter-status-state-"), "bin"); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, "opencode"), "#!/usr/bin/env node\nprocess.exit(1);\n", { mode: 0o755 });
  const { child, done } = spawnNode([SCRIPT, "--skip", "codex"], { stdio: ["ignore", "pipe", "pipe"], env: {
    PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`,
  }, killAfterMs: 10000 });
  const r = await done;
  assert.equal(r.code, 0, r.out + r.err);
  const result = JSON.parse(r.out);
  // The claude probe reads whatever `claude` this machine has, so only its shape is pinned here.
  const [claude, ...rest] = result.adapters;
  assert.equal(claude.id, "claude"); assert.ok(["ready", "signed-out", "outdated", "missing", "unchecked"].includes(claude.result.status), claude.result.status);
  assert.deepEqual(rest.map(({ id, result }) => [id, result.status]), [["codex", "skipped"], ["opencode", "unavailable"]]);
  assert.equal(child.killed, false);
});

add("OpenCode's status carries the models Desktop shows that its private server's catalogue offers", async () => {
  const server = await fakeOpenCode(), state = tempDir("entrust-adapter-status-models-");
  try {
    const desktop = await desktopStore(state, { user: [{ providerID: "router", modelID: "glm/flash", visibility: "show" },
      { providerID: "router", modelID: "gone", visibility: "show" }], recent: [], variant: {} });
    const { done } = spawnNode([SCRIPT, "--skip", "codex"], { stdio: ["ignore", "pipe", "pipe"], env: {
      ...fakeCli(server.url, state).env, ENTRUST_OPENCODE_DESKTOP_STATE: desktop,
    }, killAfterMs: 15000 });
    const r = await done;
    assert.equal(r.code, 0, r.out + r.err);
    const report = JSON.parse(r.out).adapters.find((adapter) => adapter.id === "opencode").result;
    assert.equal(report.status, "ready");
    assert.deepEqual(report.models.list.map((model) => model.modelID), ["glm/flash"]);
  } finally { await server.close(); }
});

add("the status collector has no host-context input or adapter skill loading", () => {
  const source = fs.readFileSync(path.join(ROOT, "skills/orchestrate/scripts/adapter-status.mjs"), "utf8");
  assert.equal(source.includes("host-context"), false);
  assert.equal(source.includes("SKILL.md"), false);
  assert.deepEqual(adapterRegistry().map((entry) => entry.id), ["claude", "codex", "opencode"]);
});

process.exit(summarize(await runCases(cases), cases.length));
