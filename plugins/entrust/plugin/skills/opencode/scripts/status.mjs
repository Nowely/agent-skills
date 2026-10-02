#!/usr/bin/env node
import { Client } from "./client.mjs";
import { V2Client } from "./v2-client.mjs";
import { recentModels, modelKey } from "./config.mjs";
import path from "node:path";

const args = process.argv.slice(2);
let limit = 2, apiFamily = "v1", cwd = null, agent = null;
const flags = new Set();
for (let i = 0; i < args.length; i += 2) {
  const flag = args[i], value = args[i + 1];
  if (!["--limit", "--api-family", "--directory", "--agent"].includes(flag) || !value || flags.has(flag)) {
    console.error("usage: status.mjs [--limit 1..100] [--api-family v1|v2] [--directory ABS] [--agent NAME]"); process.exit(2);
  }
  flags.add(flag);
  if (flag === "--limit") limit = Number(value);
  if (flag === "--api-family") apiFamily = value;
  if (flag === "--directory") cwd = value;
  if (flag === "--agent") agent = value;
}
if (!["v1", "v2"].includes(apiFamily) || (cwd && !path.isAbsolute(cwd))
  || (agent && (apiFamily !== "v2" || !/^[\w-]+$/.test(agent)))) { console.error("invalid API family, directory or native agent"); process.exit(2); }
try {
  const models = recentModels({ limit });
  const client = new (apiFamily === "v2" ? V2Client : Client)({ cwd }), server = await client.probe();
  console.log(`OPENCODE=ready version=${server.version} url=${server.url}`);
  console.log(`ROUTES=v1:${server.legacy} v2:${server.v2}`);
  console.log(`ADAPTER=apiFamily:${apiFamily} strictSteer:unsupported`);
  if (agent) { await client.profile(agent); console.log(`AGENT=${agent} profile:default-deny`); }
  for (const ref of models) {
    try { const m = await client.model(ref); console.log(`MODEL=${modelKey(m)} name=${JSON.stringify(m.name)} variants=${m.variants.join(",")}`); }
    catch { console.log(`UNAVAILABLE=${modelKey(ref)}`); }
  }
  if (!models.length) console.log("MODEL=none (recent list is empty; choose an explicit provider/model)");
} catch (e) { console.log(`OPENCODE=unchecked ${e.message}`); process.exitCode = 1; }
