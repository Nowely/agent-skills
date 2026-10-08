#!/usr/bin/env node
// The external Claude adapter's status: whether `claude` is installed and signed in. It calls no model,
// so the models are the ones adapter.json declares and their availability is unknown until a launch.
//
//   node scripts/status.mjs --json
//
// Every outcome prints one JSON object and exits 0, as the other adapters' probes do: ready, signed-out,
// missing, outdated or unchecked. `claude auth status` exits 1 when signed out and 0 when signed in. The
// driver needs 2.1.259 or later, the first build with --permission-prompts.

import { spawnSync } from "node:child_process";

const checkedAt = new Date().toISOString();
const say = (fields) => {
  process.stdout.write(`${JSON.stringify({ schemaVersion: 1, adapter: "claude", modelAvailability: "unknown", checkedAt,
    recent: { status: "unsupported", models: [] }, usage: { status: "unknown", scope: "account", windows: [] }, ...fields })}\n`);
  process.exit(0);
};
const run = (args) => spawnSync("claude", args, { encoding: "utf8", timeout: 15000, stdio: ["ignore", "pipe", "pipe"] });

const MINIMUM = [2, 1, 259];
const version = run(["--version"]);
if (version.error?.code === "ENOENT") say({ configured: false, status: "missing" });
if (version.status !== 0) say({ configured: null, status: "unchecked", error: "probe_unchecked" });
const found = version.stdout.trim().split(/\s/)[0] || null;
const below = (v) => {
  for (let i = 0; i < MINIMUM.length; i++) if ((v[i] ?? 0) !== MINIMUM[i]) return (v[i] ?? 0) < MINIMUM[i];
  return false;
};
const older = below((found ?? "").split(".").map(Number));
if (older) say({ configured: null, status: "outdated", version: found, minimum: MINIMUM.join(".") });
const auth = run(["auth", "status"]);
let signedIn = null;
try { signedIn = JSON.parse(auth.stdout).loggedIn === true; } catch {}
if (signedIn === null && auth.status !== 1) say({ configured: null, status: "unchecked", error: "probe_unchecked" });
say({ configured: signedIn === true, status: signedIn ? "ready" : "signed-out", version: found });
