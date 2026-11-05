#!/usr/bin/env node
// The only parent of the OpenCode server. The driver owns this process through its IPC channel.
import { startOwnedServer } from "./local-server.mjs";

const controller = new AbortController();
let starting = null, stopping = null;
const send = (message) => new Promise((resolve) => {
  if (!process.connected) return resolve(false);
  try { process.send(message, (error) => resolve(!error)); } catch { resolve(false); }
});

function shutdown() {
  return stopping ??= (async () => {
    controller.abort();
    let result = { process: "unknown" };
    try {
      const server = starting ? await starting : null;
      result = server ? await server.close() : { process: "exited" };
    } catch (error) { result = error?.serverCleanup ?? { process: "unknown" }; }
    await send({ type: "closed", result });
    process.exit(0);
  })();
}

process.on("disconnect", shutdown);
for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(signal, shutdown);
process.on("message", (message) => {
  if (message?.type === "close") { shutdown(); return; }
  if (message?.type !== "start" || starting || stopping) return;
  starting = startOwnedServer({ cwd: process.cwd(), env: process.env, timeoutMs: message.timeoutMs, signal: controller.signal });
  starting.then(async (server) => {
    if (stopping) return;
    if (!await send({ type: "ready", config: server.config })) shutdown();
  }, async (error) => {
    if (!stopping) await send({ type: "error", message: error.message, code: error.code });
    await shutdown();
  });
});
