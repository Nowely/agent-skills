#!/usr/bin/env node
// Tests for scripts/status.mjs — what Codex the machine can run, printed into the codex and orchestrate
// pages as they load.
//
//   node evals/status.test.mjs
//
// Every case runs the script against the fake app-server through ENTRUST_CODEX, and every case checks the
// exit code: Claude Code cancels a page whose injected command exits non-zero, so 0 is the contract in each
// state. The last case reads the two pages: the line they inject, the script it names, and the
// allowed-tools pattern that lets it run outside auto mode. Whether Claude Code runs it under that pattern
// is a live question this suite cannot answer.

import fs from "node:fs";
import path from "node:path";
import { ROOT, SCRIPTS, codexShim, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";

const STATUS = path.join(SCRIPTS, "status.mjs");
const shim = codexShim(tempDir("entrust-status-shim-"));
const { cases: CASES, test } = registry();

async function status(env = {}) {
  const log = path.join(tempDir("entrust-status-log-"), "rpc.log");
  const { done } = spawnNode([STATUS], { env: { ENTRUST_CODEX: shim, FAKE_RPC_LOG: log, ...env }, killAfterMs: 20000 });
  const r = await done;
  let rpc = "";
  try { rpc = fs.readFileSync(log, "utf8"); } catch {}
  return { ...r, rpc };
}
const exitedZero = (r) => r.code === 0 || `exited ${r.code}: ${(r.out + r.err).trim().slice(0, 200)}`;

test("a signed-in account prints its plan and one MODEL line per short name, the newest listed of each",
  "the pages compose from these lines; a short name resolved by list order, or to a hidden model, names a model the driver would not run",
  async () => {
    const r = await status({ FAKE_MODEL_FAMILIES: "1" });
    const efforts = "none,low,medium,high,xhigh,max,ultra";
    const want = ["CODEX=ready PLAN=plus", `MODEL=astra gpt-6-astra efforts=${efforts}`,
      `MODEL=sol gpt-6-sol efforts=${efforts}`, `MODEL=luna gpt-6.10-luna efforts=${efforts}`].join("\n");
    if (exitedZero(r) !== true) return exitedZero(r);
    return r.out.trim() === want || `printed ${JSON.stringify(r.out.trim())}, want ${JSON.stringify(want)}`;
  });

test("signed out: one line, and the catalogue is never asked",
  "a signed-out server still lists Astra and Sol (measured 2026-09-29), so a catalogue read before the account would compose a plan the account cannot run",
  async () => {
    const r = await status({ FAKE_ACCOUNT: "signed-out", FAKE_MODEL_FAMILIES: "1" });
    if (exitedZero(r) !== true) return exitedZero(r);
    if (r.out.trim() !== "CODEX=signed-out") return `printed ${JSON.stringify(r.out.trim())}`;
    return !/^model\/list/m.test(r.rpc) || "model/list was asked of a signed-out server";
  });

test("no account where the provider needs none reads as ready",
  "requiresOpenaiAuth false is a provider with no OpenAI sign-in; calling it signed out drops Codex from a plan that can run it",
  async () => {
    const r = await status({ FAKE_ACCOUNT: "no-auth", FAKE_MODEL_FAMILIES: "1" });
    if (exitedZero(r) !== true) return exitedZero(r);
    return /^CODEX=ready$/m.test(r.out) || `printed ${JSON.stringify(r.out.trim())}`;
  });

test("a server that rejects account/read is unchecked, with the reason",
  "an older server or a managed device answers with an error; a page must still load and the plan must say Codex was not checked",
  async () => {
    const r = await status({ FAKE_ACCOUNT: "error" });
    if (exitedZero(r) !== true) return exitedZero(r);
    return /^CODEX=unchecked account\/read: Method not found$/.test(r.out.trim()) || `printed ${JSON.stringify(r.out.trim())}`;
  });

test("no runnable codex is missing",
  "an ENTRUST_CODEX that is not an executable is the one missing state a suite can make on a machine with codex installed",
  async () => {
    const r = await status({ ENTRUST_CODEX: path.join(tempDir("entrust-status-none-"), "codex") });
    if (exitedZero(r) !== true) return exitedZero(r);
    return r.out.trim() === "CODEX=missing" || `printed ${JSON.stringify(r.out.trim())}`;
  });

test("a codex that dies before answering is unchecked, with the last line it printed",
  "a broken install exits before initialize; a non-zero exit here would cancel the page instead of saying why",
  async () => {
    const dir = tempDir("entrust-status-dead-");
    const dead = path.join(dir, "codex");
    fs.writeFileSync(dead, "#!/bin/sh\necho 'config error: unknown key' >&2\nexit 3\n", { mode: 0o755 });
    const r = await status({ ENTRUST_CODEX: dead });
    if (exitedZero(r) !== true) return exitedZero(r);
    return /^CODEX=unchecked codex app-server exited \(3\) before it answered: config error: unknown key$/.test(r.out.trim())
      || `printed ${JSON.stringify(r.out.trim())}`;
  });

test("a catalogue with none of the four short names prints MODEL=none",
  "a ready line with no MODEL line reads as a status that was cut, not as an account with nothing to compose from",
  async () => {
    const r = await status();
    if (exitedZero(r) !== true) return exitedZero(r);
    return r.out.trim() === "CODEX=ready PLAN=plus\nMODEL=none" || `printed ${JSON.stringify(r.out.trim())}`;
  });

test("the codex and orchestrate pages inject the same line, it runs this script, and each page's allowed-tools covers it",
  "orchestrate plans before it loads the codex page, so a page without the line plans blind; a pattern that misses the command cancels the page outside auto mode",
  () => {
    const problems = [];
    for (const skill of ["codex", "orchestrate"]) {
      const page = fs.readFileSync(path.join(ROOT, "skills", skill, "SKILL.md"), "utf8");
      // At a line's start or after a space: Claude Code runs the form nowhere else.
      const line = /(?:^|\s)!`(node "\$\{CLAUDE_SKILL_DIR\}\/([^"]+)")`$/m.exec(page);
      if (!line) { problems.push(`${skill}: no line reads !\`node "\${CLAUDE_SKILL_DIR}/…"\``); continue; }
      const dir = path.join(ROOT, "skills", skill);
      if (path.resolve(dir, line[2]) !== STATUS) problems.push(`${skill}: the line runs ${line[2]}, not scripts/status.mjs`);
      const command = line[1].replace("${CLAUDE_SKILL_DIR}", dir);
      const front = page.split(/^---$/m)[1] ?? "";
      const patterns = [...(/^allowed-tools: (.+)$/m.exec(front)?.[1] ?? "").matchAll(/Bash\(([^)]+)\)/g)].map((m) => m[1]);
      const glob = (p) => new RegExp(`^${p.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
      if (!patterns.some((p) => glob(p).test(command))) problems.push(`${skill}: no allowed-tools Bash pattern matches ${command}`);
    }
    return problems.length === 0 || problems.join("; ");
  });

process.exit(summarize(await runCases(CASES), CASES.length));
