#!/usr/bin/env node
// Passive OpenCode status: the saved recent models, and no server. The driver starts a private local server for
// each invocation, so whether one is running now says nothing about the next run, and nothing is probed.
import { recentModels, modelKey } from "./config.mjs";

const args = process.argv.slice(2);
let format = "text";
for (let i = 0; i < args.length; i += 2) {
  if (args[i] !== "--format" || !["text", "json"].includes(args[i + 1]) || args.length > 2) {
    console.error("usage: status.mjs [--format text|json]"); process.exit(2);
  }
  format = args[i + 1];
}

function recentState() {
  try {
    const models = recentModels({ limit: 2 });
    return { status: models.length ? "available" : "empty", source: "saved_recent", models };
  } catch { return { status: "unavailable", source: "saved_recent", models: [] }; }
}

const recent = recentState();
if (format === "json") {
  console.log(JSON.stringify({ schemaVersion: 1, adapter: "opencode", status: "local_unprobed", configured: true,
    endpointStatus: "unknown", connectionMode: "local", checkedAt: new Date().toISOString(), routes: [], recent,
    modelAvailability: "unknown", usage: { status: "unknown", scope: "route", source: "opencode-status", windows: [] } }));
} else {
  console.log("OPENCODE=local-unprobed");
  if (recent.status === "available") {
    for (const model of recent.models) console.log(`MODEL=${modelKey(model)} variant=${model.variant ?? "none"} availability=unknown`);
  } else if (recent.status === "empty") console.log("MODEL=none (no saved recent model)");
  else console.log("MODEL=unknown (recent source unavailable)");
}
