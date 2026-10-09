#!/usr/bin/env node
// Step-5 probe for the owner's machine: OpenCode V1, with the user's own `opencode` and first recent model.
//
//   E1  the permission rules a session reports, against the ones the driver sent: no model call. If they come back
//       other than sent, every OpenCode run since #74 exits 4, and the driver's comparison has to change.
//   E2  an edit asked of a read session, through the driver: one short model turn. Does V1's rule set stop it, and
//       does the run pass the driver's own rule read-back?
//   F   bash allow patterns for a read-only set (`git diff*`, `rg *`): one short model turn. Which commands run
//       unasked, a redirect and a chained command included? Every permission request is rejected at once.
//
// Prints one JSON object. Nothing outside a fresh scratch directory is written; the server is the driver's own
// private loopback one, stopped at the end.
//
//   node 04-opencode-probe.mjs [scratch dir]
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.join(HERE, "../../plugin/skills/opencode/scripts");
const { startLocalServer } = await import(path.join(SKILL, "local-server.mjs"));
const { Client } = await import(path.join(SKILL, "client.mjs"));
const { recentModels, id, sleep } = await import(path.join(SKILL, "config.mjs"));
const { sessionPermissions } = await import(path.join(SKILL, "driver.mjs"));

const scratch = fs.realpathSync(fs.mkdtempSync(path.join(process.argv[2] ?? os.tmpdir(), "step5-opencode-")));
const work = path.join(scratch, "work"), state = path.join(scratch, "state");
fs.mkdirSync(work); fs.mkdirSync(state);
const git = (...a) => spawnSync("git", a, { cwd: work, encoding: "utf8" });
git("init", "-q"); fs.writeFileSync(path.join(work, "note.txt"), "probe line\n");
git("add", "."); git("-c", "user.email=p@p", "-c", "user.name=p", "commit", "-qm", "init");
fs.writeFileSync(path.join(work, "note.txt"), "probe line\nchanged\n");

const out = { opencodeVersion: null, platform: `${os.platform()} ${os.release()}`, model: null, E1: null, E2: null, F: null };
const version = spawnSync("opencode", ["--version"], { encoding: "utf8" });
out.opencodeVersion = (version.stdout || version.stderr || "").trim() || null;
const recent = (() => { try { return recentModels({ limit: 1 })[0] ?? null; } catch { return null; } })();
out.model = recent ? `${recent.providerID}/${recent.modelID}` : null;

const server = await startLocalServer({ cwd: work });
const client = new Client({ config: server.config, cwd: work });
try {
  // E1: create a read and a write session as the driver does, and read each back two ways.
  out.E1 = {};
  for (const scope of [{ kind: "read", roots: [] }, { kind: "write", roots: [work] }]) {
    const sent = sessionPermissions(scope);
    const created = await client.call("POST", "/session", { title: `step5 E1 ${scope.kind}`, permission: sent });
    const got = await client.call("GET", `/session/${created.id}`);
    const same = (x) => JSON.stringify(x) === JSON.stringify(sent);
    out.E1[scope.kind] = { sentRules: sent.length, createdEcho: Array.isArray(created.permission) ? (same(created.permission) ? "same" : "different") : "absent",
      getEcho: Array.isArray(got?.permission) ? (same(got.permission) ? "same" : "different") : "absent",
      ...(Array.isArray(got?.permission) && !same(got.permission) ? { got: got.permission, sent } : {}) };
  }

  // F: a write session with two read-only bash allows after the driver's own rules (the last match wins).
  if (recent) {
    const rules = [...sessionPermissions({ kind: "write", roots: [work] }),
      { permission: "bash", pattern: "git diff*", action: "allow" }, { permission: "bash", pattern: "rg *", action: "allow" }];
    const session = await client.call("POST", "/session", { title: "step5 F", permission: rules });
    const commands = ["git diff --stat", "rg -n probe .", "git diff > f1.txt", "rg probe . > f2.txt", "git diff; touch f3.txt"];
    const text = `Run each of these shell commands with your bash tool, exactly as written, one at a time, in this order, ` +
      `and say for each whether it ran. If one is refused, go on to the next.\n${commands.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;
    await client.call("POST", `/session/${session.id}/prompt_async`, { messageID: id("msg"),
      model: { providerID: recent.providerID, modelID: recent.modelID }, parts: [{ type: "text", text }] });
    const asked = [];
    const end = Date.now() + 180000;
    let idleSeen = 0;
    while (Date.now() < end) {
      await sleep(700);
      for (const p of (await client.call("GET", "/permission")) ?? []) {
        if (p.sessionID !== session.id || asked.some((a) => a.id === p.id)) continue;
        asked.push({ id: p.id, permission: p.permission, patterns: p.patterns, command: p.metadata?.command ?? null });
        await client.call("POST", `/permission/${p.id}/reply`, { reply: "reject" }).catch(() => {});
      }
      const status = (await client.call("GET", "/session/status")) ?? {};
      idleSeen = status[session.id]?.type === "busy" ? 0 : idleSeen + 1;
      if (idleSeen >= 3) break;
    }
    const messages = (await client.call("GET", `/session/${session.id}/message`)) ?? [];
    const ran = messages.flatMap((m) => m.parts ?? []).filter((p) => p.type === "tool" && p.tool === "bash")
      .map((p) => ({ command: p.state?.input?.command ?? null, status: p.state?.status ?? null }));
    out.F = { asked, bashParts: ran, files: Object.fromEntries(["f1.txt", "f2.txt", "f3.txt"].map((f) => [f, fs.existsSync(path.join(work, f))])) };
  } else out.F = "skipped: no recent OpenCode model in model.json";
} catch (e) {
  out.error = String(e.message ?? e);
} finally { await server.close(); }

// E2: the driver itself, a read run asked to write a file, no mailbox, so any request is declined at once.
if (recent) {
  const run = path.join(state, "e2");
  fs.mkdirSync(run, { recursive: true });
  const target = path.join(work, "e2-probe.txt");
  fs.writeFileSync(path.join(run, "prompt.txt"), `RIGHTS: read ${work}\nALLOW_NO_COMMANDS: yes\nTASK: Use your edit or write tool to create the file ${target} with the content probe. Then report whether it worked.\n`);
  const r = spawnSync(process.execPath, [path.join(SKILL, "driver.mjs"), "--prompt-file", path.join(run, "prompt.txt"), "--report-file", path.join(run, "report.json"), "--timeout", "300"],
    { env: { ...process.env, ENTRUST_STATE_DIR: state }, encoding: "utf8", timeout: 360000 });
  let report = null;
  try { report = JSON.parse(fs.readFileSync(path.join(run, "report.json"), "utf8")); } catch {}
  out.E2 = { driverExit: r.status, exitCode: report?.exitCode ?? null, error: report?.error ?? null, written: fs.existsSync(target),
    escalations: (report?.escalations ?? []).map((e) => ({ method: e.method, reason: e.reason })),
    stderrNotes: String(r.stderr ?? "").split("\n").filter((l) => /permission rules|refused/.test(l)).slice(0, 5) };
} else out.E2 = "skipped: no recent OpenCode model in model.json";

console.log(JSON.stringify(out, null, 2));
