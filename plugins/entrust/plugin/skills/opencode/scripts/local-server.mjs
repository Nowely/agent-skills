import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { sleep } from "./config.mjs";

const LISTENING = /server\s+listening\s+(?:on|at)\s+(https?:\/\/[^\s]+)/i;

function localUrl(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new Error("OpenCode announced an invalid local server URL"); }
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || !url.port)
    throw new Error("OpenCode server did not bind to a loopback address and ephemeral port");
  return url.href.replace(/\/$/, "");
}

function authorization(config) {
  return `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
}

async function waitHealthy(config, child, timeoutMs) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (child.exitCode !== null || child.signalCode !== null)
      throw new Error("OpenCode server exited before it became healthy");
    try {
      const response = await fetch(`${config.url}/global/health`, {
        headers: { Authorization: authorization(config) }, signal: AbortSignal.timeout(750), redirect: "error",
      });
      if (response.ok) {
        const body = await response.json();
        if (body?.healthy === true && typeof body.version === "string") return;
      }
    } catch {}
    await sleep(100);
  }
  throw new Error("OpenCode server did not become healthy before the startup timeout");
}

export async function startLocalServer({ cwd = process.cwd(), env = process.env, timeoutMs = 15000 } = {}) {
  const config = {
    url: null,
    username: `entrust-${crypto.randomBytes(6).toString("hex")}`,
    password: crypto.randomBytes(32).toString("base64url"),
  };
  let child;
  try {
    child = spawn("opencode", ["serve", "--hostname", "127.0.0.1", "--port", "0"], {
      cwd, env: { ...env, OPENCODE_SERVER_USERNAME: config.username, OPENCODE_SERVER_PASSWORD: config.password },
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    throw new Error("OpenCode CLI could not be started; install it and make `opencode` available on PATH");
  }

  let closed = false, line = "", startError = null;
  child.once("error", (error) => { startError = error; });
  const exited = new Promise((resolve) => child.once("exit", (code, signal) => resolve({ code, signal })));
  const close = async () => {
    if (closed) return;
    closed = true;
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGTERM");
      await Promise.race([exited, sleep(2000)]);
      if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
    }
  };
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
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);

  try {
    const end = Date.now() + timeoutMs;
    while (!config.url && Date.now() < end) {
      if (startError) throw startError;
      if (child.exitCode !== null || child.signalCode !== null)
        throw new Error("OpenCode server exited before announcing its local URL");
      await Promise.race([sleep(50), exited]);
    }
    if (!config.url) throw new Error("OpenCode server did not announce its local URL before the startup timeout");
    await waitHealthy(config, child, Math.max(1000, end - Date.now()));
    return { config, close };
  } catch (error) {
    await close();
    if (error?.code === "ENOENT")
      throw new Error("OpenCode CLI is not on PATH; install it and make `opencode` available to this task");
    throw error;
  }
}
