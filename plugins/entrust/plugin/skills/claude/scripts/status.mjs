#!/usr/bin/env node
// The external Claude adapter's status: whether `claude` is installed and signed in. It calls no model,
// so the models are the ones adapter.json declares and their availability is unknown until a launch.
//
//   node scripts/status.mjs --json
//
// Every outcome prints one JSON object and exits 0, as the other adapters' probes do: ready, signed-out,
// missing, outdated or unchecked. `claude auth status` exits 1 when signed out and 0 when signed in. The
// driver needs 2.1.259 or later, the first build with --permission-prompts.
//
// A ready report carries the route a run takes, which names the provider that receives its prompts. What is
// observed is the API provider `claude auth status` reports, run in the directory the coordinator runs in, and every
// ANTHROPIC_*BASE_URL in this environment, which the driver hands the CLI unchanged, each as origin plus path (a gateway
// can route by path), never a credential or query. Nothing is guessed from a model name; an unknown provider is shown
// as reported. A base URL that only a settings file the CLI loads there sets (the user's under CLAUDE_CONFIG_DIR or
// ~/.claude, the project's, its local one) is not observed as effective: whether a safe-mode run applies a settings
// file's env, and which level wins, is not measured. Such a route is reported as unproven (provider null, with the
// reason) and no activation is offered on it. Managed settings are not read and stay a stated limit of the report.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PROVIDERS = { firstParty: "Anthropic", bedrock: "Amazon Bedrock", vertex: "Google Vertex AI", foundry: "Microsoft Foundry" };
const BASE_URL = /^ANTHROPIC_(?:[A-Z]+_)?BASE_URL$/;
// Origin and path only; a value that is no URL is kept out of every output, since it may be one.
const locationOf = (url) => { try { const u = new URL(url); return u.origin === "null" ? null : u.origin + u.pathname.replace(/\/+$/, ""); } catch { return null; } };
const settingsUrls = (cwd) => [["user settings", path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude"), "settings.json")],
  ["project settings", path.join(cwd, ".claude", "settings.json")], ["local settings", path.join(cwd, ".claude", "settings.local.json")]]
  .flatMap(([source, file]) => {
    let s = null;
    try { s = JSON.parse(fs.readFileSync(file, "utf8")); } catch { return []; }
    return Object.entries(s?.env ?? {}).filter(([k, v]) => BASE_URL.test(k) && typeof v === "string" && v).map(([k]) => `${k} (${source})`);
  });
function routeOf(auth, env) {
  const apiProvider = typeof auth.apiProvider === "string" && auth.apiProvider ? auth.apiProvider : null;
  const set = Object.entries(env).filter(([k, v]) => BASE_URL.test(k) && v).sort(([a], [b]) => a.localeCompare(b));
  const invalid = set.filter(([, v]) => !locationOf(v)).map(([k]) => k);
  const baseUrls = Object.fromEntries(set.map(([k, v]) => [k, locationOf(v)]));
  const unproven = settingsUrls(process.cwd());
  const named = apiProvider && (Object.hasOwn(PROVIDERS, apiProvider) ? PROVIDERS[apiProvider] : `apiProvider ${apiProvider}`);
  const through = Object.entries(baseUrls).map(([k, v]) => `${k}=${v}`).join(", ");
  const route = { apiProvider, authMethod: typeof auth.authMethod === "string" ? auth.authMethod : null, baseUrls, settingsBaseUrls: unproven };
  if (invalid.length) return { ...route, provider: null, problem: `${invalid.join(", ")} is not a valid URL, so the provider it routes to cannot be named` };
  if (unproven.length) return { ...route, provider: null, problem: `${unproven.join(", ")} sets a base URL, and whether this run applies it is not measured, so its provider cannot be named` };
  return { ...route, provider: named ? (through ? `${named} (${through})` : named) : through || null };
}

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
let signedIn = null, reported = null;
try { reported = JSON.parse(auth.stdout); signedIn = reported.loggedIn === true; } catch {}
if (signedIn === null && auth.status !== 1) say({ configured: null, status: "unchecked", error: "probe_unchecked" });
say({ configured: signedIn === true, status: signedIn ? "ready" : "signed-out", version: found,
  ...(signedIn ? { route: routeOf(reported, process.env) } : {}) });
