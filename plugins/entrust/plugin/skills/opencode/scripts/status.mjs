#!/usr/bin/env node
import { Client } from "./client.mjs";
import { V2Client } from "./v2-client.mjs";
import { connection, recentModels, modelKey } from "./config.mjs";
import path from "node:path";

const args = process.argv.slice(2);
let apiFamily = null, cwd = null, agent = null, format = "text";
const flags = new Set();
for (let i = 0; i < args.length; i += 2) {
  const flag = args[i], value = args[i + 1];
  if (!["--api-family", "--directory", "--agent", "--format"].includes(flag) || !value || flags.has(flag)) {
    console.error("usage: status.mjs [--api-family v1|v2] [--directory ABS] [--agent NAME] [--format text|json]"); process.exit(2);
  }
  flags.add(flag);
  if (flag === "--api-family") apiFamily = value;
  if (flag === "--directory") cwd = value;
  if (flag === "--agent") agent = value;
  if (flag === "--format") format = value;
}
apiFamily ??= format === "json" ? "auto" : "v1";
if (!["v1", "v2", "auto"].includes(apiFamily) || (cwd && !path.isAbsolute(cwd))
  || (format === "text" && apiFamily === "auto")
  || (format === "json" && (apiFamily !== "auto" || agent))
  || (agent && (apiFamily !== "v2" || !/^[\w-]+$/.test(agent))) || !["text", "json"].includes(format)) {
  console.error("invalid API family, directory, native agent or format"); process.exit(2);
}

function recentState() {
  try {
    const models = recentModels({ limit: 2 });
    return { status: models.length ? "available" : "empty", source: "saved_recent", models };
  } catch { return { status: "unavailable", source: "saved_recent", models: [] }; }
}

function result({ status, configured, endpointStatus, connectionMode, routes = [], recent, checkedAt, error = null }) {
  return { schemaVersion: 1, adapter: "opencode", status, configured, endpointStatus, connectionMode,
    checkedAt, routes, recent, modelAvailability: "unknown",
    usage: { status: "unknown", scope: "route", source: "opencode-status", windows: [] },
    ...(error ? { error } : {}) };
}

function printRecent(recent) {
  if (recent.status === "available") {
    for (const model of recent.models) console.log(`MODEL=${modelKey(model)} variant=${model.variant ?? "none"} availability=unknown`);
  } else if (recent.status === "empty") console.log("MODEL=none (no saved recent model)");
  else console.log("MODEL=unknown (recent source unavailable)");
}

try {
  const recent = recentState();
  const configured = connection();
  const directory = cwd ?? process.cwd();
  if (configured.local) {
    const status = result({ status: "local_unprobed", configured: true, endpointStatus: "unknown", connectionMode: "local",
      recent, checkedAt: new Date().toISOString() });
    if (format === "json") console.log(JSON.stringify(status));
    else {
      console.log("OPENCODE=local-unprobed");
      console.log("ROUTES=v1:unknown v2:unknown");
      printRecent(recent);
    }
  } else {
    const client = new Client({ config: configured, cwd: directory });
    const server = await client.probe();
    const routes = [
      { apiFamily: "v1", status: server.legacy ? "available" : "unavailable" },
      { apiFamily: "v2", status: server.v2 ? "available" : "unavailable" },
    ];
    const status = result({ status: "ready", configured: true, endpointStatus: "ready", connectionMode: "remote",
      routes, recent, checkedAt: new Date().toISOString() });
    if (format === "json") console.log(JSON.stringify(status));
    else {
      console.log(`OPENCODE=ready version=${server.version}`);
      console.log(`ROUTES=v1:${server.legacy} v2:${server.v2}`);
      console.log(`ADAPTER=apiFamily:${apiFamily} strictSteer:unsupported`);
      if (agent) {
        const v2 = new V2Client({ config: configured, cwd: directory });
        await v2.profile(agent);
        console.log(`AGENT=${agent} profile:default-deny`);
      }
      printRecent(recent);
    }
  }
} catch (error) {
  const status = result({ status: "unchecked", configured: null, endpointStatus: "unknown", connectionMode: null,
    recent: recentState(), checkedAt: new Date().toISOString(), error: format === "json" ? "probe_unchecked" : undefined });
  if (format === "json") console.log(JSON.stringify(status));
  else console.log(`OPENCODE=unchecked ${String(error.message).replace(/[\r\n\x00-\x1f]/g, " ").slice(0, 300)}`);
  process.exitCode = format === "json" ? 0 : 1;
}
