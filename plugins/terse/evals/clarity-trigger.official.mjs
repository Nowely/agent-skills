#!/usr/bin/env node
// H3: stage an official claude plugin eval under $TMPDIR, then run it only with --run.
// The run spends Claude tokens. Do not include it in CI or pages.test.mjs.
// Usage: node evals/clarity-trigger.official.mjs [--run]
// Source for case layout and grader syntax: code.claude.com/docs/en/plugin-evals.md,
// "Create your first eval suite" and "Grader types", read 2026-09-27.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stage = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), "terse-clarity-eval-"));
const plugin = path.join(stage, "plugin");
fs.cpSync(path.join(root, "plugin"), plugin, { recursive: true });
const manifestPath = path.join(plugin, ".claude-plugin", "plugin.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.experimental = { ...manifest.experimental, evals: "evals/clarity-trigger" };
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

const cases = JSON.parse(fs.readFileSync(path.join(root, "evals", "clarity-trigger", "cases.json"), "utf8"));
for (const { id, prompt, positive } of cases) {
  const dir = path.join(plugin, "evals", "clarity-trigger", id);
  fs.mkdirSync(path.join(dir, "graders"), { recursive: true });
  const allowedTools = id === "status-done" ? "[Skill, Bash]" : id === "agent-task-file" ? "[Skill, Write]" : "[Skill]";
  fs.writeFileSync(path.join(dir, "prompt.md"), `---\nmax_turns: 5\nallowed_tools: ${allowedTools}\n---\n\n${prompt}\n`);
  fs.writeFileSync(path.join(dir, "graders", "invoked.md"),
    `---\ntype: tool_used\ntool: Skill\ninput_match: '\"skill\"\\s*:\\s*\"(?:terse:)?clarity\"'\n${positive ? "" : "min: 0\nmax: 0\n"}---\n`);
}
console.log(`Staged official eval: ${plugin}`);
if (!process.argv.includes("--run")) {
  console.log("Not run. Pass --run for the token-spending official eval; inspect the staged suite first.");
  process.exit(0);
}
const result = spawnSync("claude", ["plugin", "eval", plugin, "--trust-plugin", "--ablation", "none", "--no-publish",
  "--allow-tools", "Bash(pwd)", "Write", "--output-dir", path.join(stage, "results"),
  "--json", path.join(stage, "result.json")],
  { stdio: "inherit" });
if (result.error) { console.error(result.error.message); process.exit(2); }
process.exit(result.status ?? 2);
