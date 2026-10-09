#!/usr/bin/env node
// Step-5 probe for the owner's machine: Codex, with the user's own `codex` and default model, through the entrust
// Codex driver. Two short runs, each with a mailbox in a fresh state directory; every request that reaches the
// mailbox is declined at once, so nothing the agent asks for runs outside its sandbox.
//
//   G  a read agent with NETWORK: no runs one curl. Does the refused fetch come back as an approval request
//      (decision 1's premise: whether egress could default off without a request on every fetch)?
//   H  a write agent creates one file in its $TMPDIR and one in its directory with its edit tool. Does the driver
//      still auto-accept a file change inside the roots (`approvalsAutoAccepted`, the launcher's `auto=`), or does
//      the server no longer ask (finding 7 of the Codex audit)? On macOS, the platform the auto-accept was made for.
//
// Prints one JSON object.
//
//   node 05-codex-probe.mjs [scratch dir]
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRIVER = path.join(HERE, "../../plugin/skills/codex/scripts/driver.mjs");
const scratch = fs.realpathSync(fs.mkdtempSync(path.join(process.argv[2] ?? os.tmpdir(), "step5-codex-")));
const state = path.join(scratch, "state");
fs.mkdirSync(state);
const version = spawnSync(process.env.ENTRUST_CODEX ?? "codex", ["--version"], { encoding: "utf8" });
const out = { codexVersion: (version.stdout || version.stderr || "").trim() || null, platform: `${os.platform()} ${os.release()}`, G: null, H: null };

async function run(name, header, task) {
  const work = path.join(scratch, `${name}-work`), dir = path.join(state, name), box = path.join(dir, "approvals");
  fs.mkdirSync(work); fs.mkdirSync(box, { recursive: true });
  spawnSync("git", ["init", "-q"], { cwd: work });
  fs.writeFileSync(path.join(work, "note.txt"), "probe\n");
  fs.writeFileSync(path.join(dir, "prompt.txt"), `${header(work)}\nTASK: ${task}\n`);
  const child = spawn(process.execPath, [DRIVER, "--prompt-file", path.join(dir, "prompt.txt"), "--report-file", path.join(dir, "report.json"),
    "--approval-dir", box, "--timeout", "300"], { cwd: work, env: { ...process.env, ENTRUST_STATE_DIR: state }, stdio: ["ignore", "ignore", "pipe"] });
  let err = "";
  child.stderr.on("data", (b) => { err += b; });
  const offered = [];
  const timer = setInterval(() => {
    let names = [];
    try { names = fs.readdirSync(box).filter((f) => f.endsWith(".request.json")); } catch {}
    for (const n of names) {
      let q;
      try { q = JSON.parse(fs.readFileSync(path.join(box, n), "utf8")); } catch { continue; }
      if (q.settled || offered.some((o) => o.id === q.id)) continue;
      offered.push({ id: q.id, method: q.method, command: Array.isArray(q.command) ? q.command.join(" ") : q.command ?? null, cause: q.cause ?? null, fileChanges: q.fileChanges ?? null });
      // Declined, as --decide --decline would publish it.
      fs.writeFileSync(path.join(box, `${q.id}.decision.json`), JSON.stringify({ id: q.id, run: { pid: q.run.pid, startedAtMs: q.run.startedAtMs, turnId: q.run.turnId }, decision: "decline", why: "probe" }));
    }
  }, 250);
  const code = await new Promise((resolve) => child.on("exit", resolve));
  clearInterval(timer);
  let r = null;
  try { r = JSON.parse(fs.readFileSync(path.join(dir, "report.json"), "utf8")); } catch {}
  return { work, code, r, offered, err };
}

const g = await run("g", (work) => `RIGHTS: read ${work}\nNETWORK: no\nALLOW_NO_COMMANDS: yes`,
  "Run this exact shell command once and report its output and exit code: curl -sS -m 10 -o /dev/null -w '%{http_code}' https://example.com");
out.G = { driverExit: g.code, exitCode: g.r?.exitCode ?? null, error: g.r?.error ?? null, networkAccess: g.r?.sandbox?.networkAccess ?? null,
  offered: g.offered, escalations: (g.r?.escalations ?? []).map((e) => ({ method: e.method, kind: e.kind, cause: e.cause, decision: e.decision, by: e.by, detail: String(e.detail ?? "").slice(0, 160) })),
  commands: (g.r?.commands ?? []).map((c) => ({ command: String(c.command ?? "").slice(0, 160), exitCode: c.exitCode ?? null, status: c.status ?? null })) };

const h = await run("h", (work) => `RIGHTS: write ${work}\nALLOW_NO_COMMANDS: yes`,
  "With your file-editing tool (apply_patch), not the shell, create two files with the content probe: probe-tmp.txt in the " +
  "directory your TMPDIR environment variable names, and probe-root.txt in your working directory. Then report which exist.");
out.H = { driverExit: h.code, exitCode: h.r?.exitCode ?? null, error: h.r?.error ?? null, tmpDir: h.r?.tmpDir ?? null,
  approvalsAutoAccepted: h.r?.approvalsAutoAccepted ?? null, offered: h.offered,
  escalations: (h.r?.escalations ?? []).map((e) => ({ method: e.method, cause: e.cause, decision: e.decision, by: e.by, detail: String(e.detail ?? "").slice(0, 200) })),
  written: { root: fs.existsSync(path.join(h.work, "probe-root.txt")), tmp: h.r?.tmpDir ? fs.existsSync(path.join(h.r.tmpDir, "probe-tmp.txt")) : null },
  fileChanges: h.r?.fileChanges ?? null };
if ([g.code, h.code].some((c) => c === null)) out.stderrTail = (g.err + h.err).slice(-800);
console.log(JSON.stringify(out, null, 2));
