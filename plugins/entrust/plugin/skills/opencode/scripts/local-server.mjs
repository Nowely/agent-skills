import crypto from "node:crypto";
import { fork, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SERVER_USER, sleep } from "./config.mjs";

const LISTENING = /server\s+listening\s+(?:on|at)\s+(https?:\/\/[^\s]+)/i;

function localUrl(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new Error("OpenCode announced an invalid local server URL"); }
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || !url.port)
    throw new Error("OpenCode server did not bind to a loopback address and ephemeral port");
  return url.href.replace(/\/$/, "");
}

function authorization(config) {
  return `Basic ${Buffer.from(`${SERVER_USER}:${config.password}`).toString("base64")}`;
}

const cancelled = () => Object.assign(new Error("OpenCode server startup was cancelled"), { cancelled: true });
async function waitOrTimeout(promise, ms) {
  let timer;
  try { return await Promise.race([promise, new Promise((resolve) => { timer = setTimeout(resolve, ms); })]); }
  finally { clearTimeout(timer); }
}

async function waitHealthy(config, child, timeoutMs, gone, signal) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (signal?.aborted) throw cancelled();
    if (child.exitCode !== null || child.signalCode !== null) throw await gone("before it became healthy");
    try {
      const response = await fetch(`${config.url}/api/info`, {
        headers: { Authorization: authorization(config) }, signal: AbortSignal.timeout(750), redirect: "error",
      });
      if (response.ok) {
        const body = await response.json();
        if (typeof body?.version === "string" && typeof body?.pid === "number") return;
      }
    } catch {}
    await sleep(100);
  }
  throw new Error("OpenCode server did not become healthy before the startup timeout");
}

// `signal` ends a startup in flight: the server it had spawned is closed and the startup rejects as cancelled.
export async function startOwnedServer({ cwd = process.cwd(), env = process.env, timeoutMs = 15000, signal } = {}) {
  const config = {
    url: null,
    // The password is this server's own, never one the caller's environment holds for another.
    password: crypto.randomBytes(32).toString("base64url"),
  };
  let child;
  try {
    child = spawn("opencode", ["serve", "--hostname", "127.0.0.1", "--port", "0"], {
      cwd, env: { ...env, OPENCODE_SERVER_PASSWORD: config.password },
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    throw new Error("OpenCode CLI could not be started; install it and make `opencode` available on PATH");
  }

  let closed = null, line = "", startError = null;
  child.once("error", (error) => { startError = error; });
  let ended = false;
  const exited = new Promise((resolve) => {
    const finish = (code, signal) => { ended = true; resolve({ code, signal }); };
    // A descendant can hold inherited output pipes after this child exits; `close` alone is too late.
    child.once("exit", finish);
    child.once("close", finish);
  });
  const running = () => !ended && child.exitCode === null && child.signalCode === null;
  const close = () => closed ??= (async () => {
    if (running() && child.pid) {
      try { child.kill("SIGTERM"); } catch {}
      await waitOrTimeout(exited, 2000);
      if (running()) {
        try { child.kill("SIGKILL"); } catch {}
        await waitOrTimeout(exited, 2000);
      }
    } else if (running()) await waitOrTimeout(exited, 500);
    return { process: running() ? "unknown" : "exited" };
  })();
  const collect = (chunk) => {
    const value = chunk.toString("utf8").replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
    line = (line + value).slice(-8192);
    const match = LISTENING.exec(line);
    if (match) {
      try { config.url = localUrl(match[1].replace(/[),]+$/, "")); }
      catch (error) { startError = error; }
    }
    if (line.length > 4096) line = line.slice(-2048);
  };
  // Server output can contain credentials or request bodies; only the process outcome is diagnostic here.
  const drained = new Promise((resolve) => child.once("close", resolve));
  const gone = async (when) => {
    await waitOrTimeout(drained, 500);
    const how = child.signalCode !== null ? `was killed by ${child.signalCode}` : `exited with code ${child.exitCode}`;
    return new Error(`OpenCode server ${how} ${when}; its output is withheld`);
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);

  try {
    const end = Date.now() + timeoutMs;
    while (!config.url && Date.now() < end) {
      if (signal?.aborted) throw cancelled();
      if (startError) throw startError;
      if (child.exitCode !== null || child.signalCode !== null)
        throw await gone("before announcing its local URL");
      await Promise.race([sleep(50), exited]);
    }
    if (!config.url) throw new Error("OpenCode server did not announce its local URL before the startup timeout");
    await waitHealthy(config, child, Math.max(1000, end - Date.now()), gone, signal);
    return { config, close };
  } catch (error) {
    const serverCleanup = await close();
    if (error?.code === "ENOENT")
      throw Object.assign(new Error("OpenCode CLI is not on PATH; install it and make `opencode` available to this task"), { code: "ENOENT", serverCleanup });
    error.serverCleanup = serverCleanup;
    throw error;
  }
}

// The owner is the server's parent; its private IPC disconnects when this process dies. The server
// never inherits that IPC, and no password is written to a file or diagnostic stream.
export async function startLocalServer({ cwd = process.cwd(), env = process.env, timeoutMs = 15000, signal } = {}) {
  if (signal?.aborted) throw cancelled();
  const owner = fork(fileURLToPath(new URL("./server-owner.mjs", import.meta.url)), [], {
    cwd, env, execArgv: [], stdio: ["ignore", "ignore", "ignore", "ipc"],
  });
  let ownerEnded = false, closeResult = null;
  const exited = new Promise((resolve) => {
    owner.on("error", () => {});
    const ended = (code, sig) => { ownerEnded = true; resolve({ code, sig }); };
    // `exit` follows a normal disconnect; `close` also covers a spawn failure without an exit event.
    owner.once("exit", ended);
    owner.once("close", ended);
  });
  const send = (message) => new Promise((resolve) => {
    if (!owner.connected) return resolve(false);
    try { owner.send(message, (error) => resolve(!error)); } catch { resolve(false); }
  });
  let closePromise;
  const close = () => closePromise ??= (async () => {
    await waitOrTimeout(send({ type: "close" }), 1000);
    await waitOrTimeout(exited, 6000);
    if (!ownerEnded) {
      try { owner.kill("SIGTERM"); } catch {}
      await waitOrTimeout(exited, 1500);
    }
    if (!ownerEnded) {
      try { owner.kill("SIGKILL"); } catch {}
      await waitOrTimeout(exited, 1000);
    }
    return { process: closeResult?.process === "exited" ? "exited" : "unknown", owner: ownerEnded ? "exited" : "unknown" };
  })();
  let removeAbort = () => {}, startupTimer;
  const startup = new Promise((resolve, reject) => {
    const onMessage = (message) => {
      if (message?.type === "closed") { closeResult = message.result; return; }
      if (message?.type === "ready") { resolve(message.config); return; }
      if (message?.type === "error") reject(Object.assign(new Error(message.message), { code: message.code }));
    };
    owner.on("message", onMessage);
    exited.then(() => reject(new Error("OpenCode server owner exited before startup completed")));
    const budget = Number.isFinite(timeoutMs) ? Math.max(0, timeoutMs) + 1000 : 16000;
    startupTimer = setTimeout(() => reject(new Error("OpenCode server owner startup timed out")), Math.min(budget, 2147483647));
    if (signal) {
      const onAbort = () => reject(cancelled());
      signal.addEventListener("abort", onAbort, { once: true });
      removeAbort = () => signal.removeEventListener("abort", onAbort);
      if (signal.aborted) onAbort();
    }
  });
  // A synchronous abort or a failed send may settle startup before the send callback runs.
  startup.catch(() => {});
  try {
    const sendFailure = new Promise((_, reject) => {
      send({ type: "start", timeoutMs }).then((sent) => { if (!sent) reject(new Error("OpenCode server owner IPC is unavailable")); });
    });
    const config = await Promise.race([startup, sendFailure]);
    if (signal?.aborted) throw cancelled();
    return { config, close };
  } catch (error) { error.serverCleanup = await close(); throw error; }
  finally { clearTimeout(startupTimer); removeAbort(); }
}
