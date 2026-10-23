#!/usr/bin/env node
// OpenCode status: the models to choose from and the configured default, as a private local server answers for
// the current directory's configuration, the way each run's server does. The list is the models OpenCode Desktop
// shows in its picker that the catalogue still offers; without Desktop's store, the whole catalogue.
import { Client } from "./client.mjs";
import { desktopModels, modelKey } from "./config.mjs";
import { startLocalServer } from "./local-server.mjs";

const args = process.argv.slice(2);
let format = "text";
for (let i = 0; i < args.length; i += 2) {
  if (args[i] !== "--format" || !["text", "json"].includes(args[i + 1]) || args.length > 2) {
    console.error("usage: status.mjs [--format text|json]"); process.exit(2);
  }
  format = args[i + 1];
}

async function observe(cwd) {
  let server;
  try { server = await startLocalServer({ cwd }); }
  catch (e) { return { status: "unavailable", error: e.message }; }
  try {
    const client = new Client({ config: server.config });
    const { version } = await client.probe();
    const catalogue = await client.models(cwd);
    const preset = await client.defaultModel(cwd);
    const desktop = await desktopModels();
    const offered = (m) => catalogue.find((c) => c.providerID === m.providerID && c.id === m.modelID);
    const entry = (c, variant = null) => {
      const variants = (c.variants ?? []).map((v) => v?.id).filter(Boolean);
      return { providerID: c.providerID, modelID: c.id, variant: variants.includes(variant) ? variant : null, variants };
    };
    const models = desktop.models
      ? { source: "desktop", note: null, list: desktop.models.filter(offered).map((m) => entry(offered(m), m.variant)) }
      : { source: "catalogue", note: desktop.absent ?? desktop.error, list: catalogue.map((c) => entry(c)) };
    if (desktop.error) process.stderr.write(`entrust: ${desktop.error}; listing the whole catalogue\n`);
    return { status: "ready", version, default: preset ? modelKey(preset) : null, models };
  } catch (e) { return { status: "unavailable", error: e.message }; }
  finally { await server.close(); }
}

const seen = await observe(process.cwd());
if (format === "json") {
  console.log(JSON.stringify({ schemaVersion: 2, adapter: "opencode", configured: true, connectionMode: "local",
    checkedAt: new Date().toISOString(), ...seen, usage: { status: "unknown", scope: "route", source: "opencode-status", windows: [] } }));
} else if (seen.status !== "ready") console.log(`OPENCODE=unavailable (${seen.error})`);
else {
  console.log(`OPENCODE=ready version=${seen.version}`);
  console.log(`DEFAULT=${seen.default ?? "none"}`);
  console.log(`SOURCE=${seen.models.source}${seen.models.note ? ` (${seen.models.note})` : ""}`);
  if (!seen.models.list.length) console.log("MODEL=none");
  for (const m of seen.models.list)
    console.log(`MODEL=${modelKey(m)} variant=${m.variant ?? "none"} variants=${m.variants.join(",") || "none"}`);
}
