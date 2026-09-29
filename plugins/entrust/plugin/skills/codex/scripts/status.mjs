#!/usr/bin/env node
// What Codex this machine can run, asked of its own server while a skill page loads: whether codex is
// installed, whether an account is signed in, and which models the account lists under the four short
// names, with the efforts each one takes.
//
//   node scripts/status.mjs
//
// The codex and orchestrate pages run it through Claude Code's !`…` substitution. A non-zero exit there
// cancels the whole page, so every outcome prints one CODEX= line and exits 0:
//
//   CODEX=ready [PLAN=<plan>]     then one MODEL=<short name> <slug> efforts=<list> line per listed model,
//                                 or MODEL=none when none of astra, sol, terra, luna is listed
//   CODEX=signed-out              no account; `codex login` signs one in
//   CODEX=missing                 no codex on PATH, in ENTRUST_CODEX or in the driver's fallback dirs
//   CODEX=unchecked <reason>      the server could not be asked
//
// It asks account/read before model/list, because a signed-out server still lists Astra and Sol
// (measured 2026-09-29 against codex 0.155.1 with an empty CODEX_HOME). It starts no thread and no turn,
// and prints no usage figure: the page is rendered again whenever its text changes, and a percentage
// changes on every turn. It runs against the caller's own CODEX_HOME, whose auth.json is the one the
// driver's private home links to.

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CODEX_FALLBACK_DIRS, newestNamed } from "./driver.mjs";

const SHORT_NAMES = ["astra", "sol", "terra", "luna"];
const BUDGET_MS = 15000;

const say = (lines) => { process.stdout.write(lines.join("\n") + "\n"); process.exit(0); };
const unchecked = (why) => say([`CODEX=unchecked ${String(why).replace(/\s+/g, " ").trim().slice(0, 200)}`]);
process.on("uncaughtException", (e) => unchecked(e?.message ?? e));
process.on("unhandledRejection", (e) => unchecked(e?.message ?? e));

// ENTRUST_CODEX, then PATH, then the driver's fallback dirs: the order the driver resolves it in.
function codexBin() {
  const runnable = (p) => { try { fs.accessSync(p, fs.constants.X_OK); return fs.statSync(p).isFile(); } catch { return false; } };
  const override = process.env.ENTRUST_CODEX;
  if (override) return path.isAbsolute(override) && runnable(override) ? override : null;
  const dirs = [...(process.env.PATH ?? "").split(path.delimiter).filter(Boolean),
    ...CODEX_FALLBACK_DIRS.map((d) => (d.startsWith("~/") ? path.join(os.homedir(), d.slice(2)) : d))];
  for (const d of dirs) if (runnable(path.join(d, "codex"))) return path.join(d, "codex");
  return null;
}

const bin = codexBin();
if (!bin) say(["CODEX=missing"]);

// Detached, so the whole group goes when this ends: a child of the server must not keep its pipes open.
const server = spawn(bin, ["--strict-config", "app-server"], { stdio: ["pipe", "pipe", "pipe"], detached: true });
const stop = () => { try { process.kill(-server.pid, "SIGTERM"); } catch {} };
process.on("exit", stop);
let err = "";
server.stderr.on("data", (d) => { err = (err + d).slice(-400); });
const tail = () => err.trim().split("\n").pop() ?? "";
server.on("error", (e) => unchecked(`codex app-server did not start: ${e.message}`));
// A server that exits before reading fails the write with EPIPE, which would otherwise win the race against
// the close handler below and report the pipe instead of the server's own last line (seen on Linux CI).
server.stdin.on("error", () => {});
server.on("close", (code) => unchecked(`codex app-server exited (${code}) before it answered${tail() ? `: ${tail()}` : ""}`));
setTimeout(() => unchecked(`codex app-server did not answer within ${BUDGET_MS / 1000} s`), BUDGET_MS).unref();

let buf = "", nextId = 0;
const waiting = new Map();
server.stdout.setEncoding("utf8");
server.stdout.on("data", (d) => {
  buf += d;
  for (let i; (i = buf.indexOf("\n")) >= 0;) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    let m;
    try { m = JSON.parse(line); } catch { continue; }
    if (m && m.id != null && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); }
  }
});
const send = (msg) => server.stdin.write(JSON.stringify(msg) + "\n");
const request = (method, params) => new Promise((resolve) => {
  const id = ++nextId;
  waiting.set(id, (m) => (m.error ? unchecked(`${method}: ${m.error.message ?? JSON.stringify(m.error)}`) : resolve(m.result)));
  send({ id, method, params });
});

await request("initialize", { clientInfo: { name: "Claude Code", title: "entrust status", version: "0" },
  capabilities: { experimentalApi: false } });
send({ method: "initialized" });

const { account = null, requiresOpenaiAuth = true } = (await request("account/read", { refreshToken: false })) ?? {};
if (!account && requiresOpenaiAuth !== false) say(["CODEX=signed-out"]);

const models = [], cursors = new Set();
for (let cursor = null; ;) {
  const page = await request("model/list", { cursor, limit: null, includeHidden: false });
  if (!Array.isArray(page?.data)) unchecked("model/list returned no model catalogue");
  models.push(...page.data);
  if (page.nextCursor == null) break;
  if (cursors.has(page.nextCursor) || cursors.size >= 99) unchecked("model/list pagination did not end");
  cursors.add(page.nextCursor);
  cursor = page.nextCursor;
}

const lines = [`CODEX=ready${account?.planType ? ` PLAN=${account.planType}` : ""}`];
for (const name of SHORT_NAMES) {
  const m = newestNamed(models, name);
  if (!m) continue;
  const efforts = (m.supportedReasoningEfforts ?? []).map((e) => e?.reasoningEffort).filter(Boolean);
  lines.push(`MODEL=${name} ${m.model} efforts=${efforts.join(",")}`);
}
if (lines.length === 1) lines.push("MODEL=none");
say(lines);
