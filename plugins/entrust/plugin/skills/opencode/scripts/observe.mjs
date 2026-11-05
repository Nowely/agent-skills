#!/usr/bin/env node
// A bounded, on-demand view of one driver's live state. Nothing is persisted by this channel.
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";
import { fileURLToPath } from "node:url";

const MAX_REQUEST = 4096, MAX_REPLY = 512 * 1024, PAGE_SIZE = 50;
export function ownMessages(messages, sessionID, inputIds) {
  const inputs = new Set(inputIds), out = [];
  let inTurn = false;
  for (const m of messages ?? []) {
    if (m._sessionID !== sessionID) { out.push(m); continue; }
    if (m.type === "user") { inTurn = inputs.has(m.id); if (inTurn) out.push(m); }
    else if (inTurn && m.type === "assistant") out.push(m);
  }
  return out;
}
const cursorFor = (report, invocationId, offset) => Buffer.from(JSON.stringify({ report, invocationId, offset })).toString("base64url");
function page(data, cursor) {
  let offset = 0;
  if (cursor) {
    let c;
    try { c = JSON.parse(Buffer.from(cursor, "base64url").toString()); } catch { throw new Error("invalid cursor"); }
    if (c?.report !== data.report || c?.invocationId !== data.invocationId || !Number.isSafeInteger(c.offset) || c.offset < 0) throw new Error("foreign or invalid cursor");
    offset = c.offset;
  }
  const messages = data.messages ?? [], slice = [];
  for (const message of messages.slice(offset, offset + PAGE_SIZE)) {
    if (Buffer.byteLength(JSON.stringify({ ...data, messages: [...slice, message] })) > MAX_REPLY - 4096) {
      if (!slice.length) throw new Error("one message exceeds the page limit");
      break;
    }
    slice.push(message);
  }
  return { ...data, messages: slice, cursor: offset + slice.length < messages.length ? cursorFor(data.report, data.invocationId, offset + slice.length) : null,
    pagination: "non-atomic; messages may change between pages" };
}

export async function startObserver(ctx, observe) {
  if (process.platform === "win32") throw new Error("Unix sockets unavailable");
  const dir = fs.mkdtempSync("/tmp/entrust-live-");
  fs.chmodSync(dir, 0o700);
  const address = path.join(dir, "s");
  const sockets = new Set();
  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
    socket.setTimeout(5000, () => socket.destroy());
    const decoder = new StringDecoder("utf8");
    let request = "", bytes = 0, handled = false;
    socket.on("error", () => {});
    socket.on("data", async (chunk) => {
      if (handled) return;
      bytes += chunk.length;
      if (bytes > MAX_REQUEST) return socket.destroy();
      request += decoder.write(chunk);
      if (!request.includes("\n")) return;
      handled = true;
      let result;
      try {
        const q = JSON.parse(request.slice(0, request.indexOf("\n")));
        if (q.report !== ctx.report || q.invocationId !== ctx.invocationId || !["status", "messages"].includes(q.kind)) throw new Error("identity or request mismatch");
        result = await observe(ctx, q.kind);
        if (q.kind === "messages") result = page(result, q.cursor);
      } catch { result = { error: "unavailable or invalid request", report: ctx.report, invocationId: ctx.invocationId }; }
      const text = JSON.stringify(result);
      socket.end(Buffer.byteLength(text) <= MAX_REPLY ? text + "\n" : JSON.stringify({ error: "response exceeds limit", report: ctx.report, invocationId: ctx.invocationId }) + "\n");
    });
  });
  try { await new Promise((resolve, reject) => { server.once("error", reject); server.listen(address, resolve); }); }
  catch (e) { fs.rmSync(dir, { recursive: true, force: true }); throw e; }
  let closing;
  return { address, close: () => closing ??= new Promise((resolve) => {
    server.close(resolve);
    for (const socket of sockets) socket.destroy();
  }).finally(() => fs.rmSync(dir, { recursive: true, force: true })) };
}

export async function readObservation(report, kind = "status", cursor = null) {
  let claim;
  try { claim = JSON.parse(fs.readFileSync(report, "utf8")); } catch { return { report, state: "unavailable" }; }
  if (claim?.adapter !== "opencode") return { report, state: "unavailable" };
  if (typeof claim.exitCode === "number") {
    const base = { report, invocationId: claim.invocationId ?? "unknown", sessionID: claim.sessionID ?? "unknown",
      inputIds: claim.turnIds ?? [], state: "terminal", serverStatus: "unknown", complete: false, exitCode: claim.exitCode,
      turnStatus: claim.turnStatus ?? "unknown", receiptOk: claim.receiptOk ?? false, partial: claim.partial ?? true };
    if (kind !== "messages") return base;
    const expected = path.join(path.dirname(report), `${path.basename(report, ".json")}.transcript.json`);
    try {
      if (claim.transcriptPath !== expected || fs.statSync(expected).size > 32 * 1024 * 1024) throw new Error();
      const transcript = JSON.parse(fs.readFileSync(expected, "utf8"));
      if (transcript.sessionID !== claim.sessionID || JSON.stringify(transcript.inputIds) !== JSON.stringify(claim.turnIds) || !Array.isArray(transcript.messages)) throw new Error();
      const messages = ownMessages(transcript.messages, transcript.sessionID, transcript.inputIds);
      return page({ ...base, messages, source: "transcript" }, cursor);
    } catch { return { ...base, messages: [], source: "unavailable" }; }
  }
  if (typeof claim.observer !== "string" || typeof claim.invocationId !== "string") return { report, state: "unavailable" };
  return await new Promise((resolve) => {
    const socket = net.createConnection(claim.observer);
    const decoder = new StringDecoder("utf8");
    let text = "", bytes = 0, done = false;
    const finish = (value) => { if (done) return; done = true; socket.destroy(); resolve(value); };
    const unavailable = () => finish({ report, invocationId: claim.invocationId, state: "unavailable" });
    socket.setTimeout(6000, unavailable); socket.on("error", unavailable);
    socket.on("connect", () => socket.write(JSON.stringify({ report, invocationId: claim.invocationId, kind, cursor }) + "\n"));
    socket.on("data", (chunk) => { bytes += chunk.length; if (bytes > MAX_REPLY) return unavailable(); text += decoder.write(chunk); });
    socket.on("end", () => {
      try { const value = JSON.parse(text + decoder.end()); if (value.report !== report || value.invocationId !== claim.invocationId || value.error) return unavailable(); finish({ ...value, state: "live" }); }
      catch { unavailable(); }
    });
  });
}

const isMain = (() => { try { return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isMain) {
  const args = process.argv.slice(2), report = args[args.indexOf("--report-file") + 1];
  if (!args.includes("--report-file") || !path.isAbsolute(report ?? "")) { process.stderr.write("--report-file requires an absolute path\n"); process.exit(2); }
  const kind = args.includes("--messages") ? "messages" : "status";
  const cursor = args.includes("--cursor") ? args[args.indexOf("--cursor") + 1] : null;
  const value = await readObservation(report, kind, cursor);
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
  if (value.state === "unavailable") process.exitCode = 1;
}
