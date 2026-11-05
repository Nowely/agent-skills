#!/usr/bin/env node
// A bounded, on-demand view of one driver's live state. Nothing is persisted by this channel.
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import crypto from "node:crypto";
import { StringDecoder } from "node:string_decoder";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

const MAX_REQUEST = 4096, MAX_REPLY = 512 * 1024, PAGE_SIZE = 50, FRAGMENT_BYTES = 128 * 1024;
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
const encodeCursor = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const cursorError = (code) => Object.assign(new Error(code), { code });
const messageIdentity = (message, data) => {
  const sessionID = message?._sessionID ?? data.sessionID;
  return typeof sessionID === "string" && typeof message?.id === "string" ? { sessionID, messageID: message.id } : null;
};
const sameIdentity = (left, right) => left?.sessionID === right?.sessionID && left?.messageID === right?.messageID;
const hashBytes = (value) => crypto.createHash("sha256").update(value).digest("hex");
const reportDigest = (report) => hashBytes(Buffer.from(report, "utf8"));
const bounded = (value) => {
  if (Buffer.byteLength(JSON.stringify(value)) + 1 > MAX_REPLY) throw cursorError("response_exceeds_limit");
  return value;
};
const hasKeys = (value, keys) => value && typeof value === "object" && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
function parseCursor(cursor, data, large) {
  if (cursor === null || cursor === undefined) return { offset: 0 };
  if (typeof cursor !== "string" || cursor.length > MAX_REQUEST || !/^[A-Za-z0-9_-]+$/.test(cursor)) throw cursorError("invalid_cursor");
  let c;
  try {
    const bytes = Buffer.from(cursor, "base64url");
    if (bytes.toString("base64url") !== cursor) throw new Error();
    c = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch { throw cursorError("invalid_cursor"); }
  const offset = (value) => Number.isSafeInteger(value) && value >= 0;
  if (hasKeys(c, ["report", "invocationId", "offset"])) {
    if (c.report !== data.report || c.invocationId !== data.invocationId || !offset(c.offset)) throw cursorError("invalid_cursor");
    return c;
  }
  const common = large && c?.reportHash === reportDigest(data.report) && c?.invocationId === data.invocationId;
  if (common && c.kind === "page" && hasKeys(c, ["reportHash", "invocationId", "kind", "offset", "after"])
    && offset(c.offset) && c.offset > 0 && hasKeys(c.after, ["sessionID", "messageID"])
    && typeof c.after.sessionID === "string" && typeof c.after.messageID === "string") return c;
  if (common && c.kind === "content" && hasKeys(c, ["reportHash", "invocationId", "kind", "sessionID", "messageID", "byteOffset", "totalBytes", "sha256"])
    && typeof c.sessionID === "string" && typeof c.messageID === "string" && offset(c.byteOffset)
    && c.byteOffset % FRAGMENT_BYTES === 0 && Number.isSafeInteger(c.totalBytes) && c.totalBytes > 0
    && c.byteOffset < c.totalBytes && /^[a-f0-9]{64}$/.test(c.sha256 ?? "")) return c;
  throw cursorError("invalid_cursor");
}
function page(data, cursor, large = false) {
  const c = parseCursor(cursor, data, large);
  const reportHash = reportDigest(data.report);
  const messages = data.messages ?? [];
  const base = { ...data, messages: [] }, pagination = "non-atomic; messages may change between pages";
  const contentBase = (() => {
    const hasTools = Object.prototype.hasOwnProperty.call(base, "tools");
    const { tools, ...rest } = base;
    return { ...rest, ...(hasTools ? { toolsOmitted: true } : {}), complete: false, partial: true, sourcePartial: base.partial ?? null };
  })();
  const cursorBase = large ? { reportHash, invocationId: data.invocationId } : { report: data.report, invocationId: data.invocationId };
  if (c.kind === "content") {
    const matches = messages.filter((message) => sameIdentity(messageIdentity(message, data), c));
    if (matches.length !== 1) throw cursorError("stale_cursor");
    const bytes = Buffer.from(JSON.stringify(matches[0]), "utf8");
    if (bytes.length !== c.totalBytes || hashBytes(bytes) !== c.sha256) throw cursorError("stale_cursor");
    const chunk = bytes.subarray(c.byteOffset, c.byteOffset + FRAGMENT_BYTES), next = c.byteOffset + chunk.length;
    return bounded({ ...contentBase, messagesComplete: false, fragment: { sessionID: c.sessionID, messageID: c.messageID, encoding: "base64",
      byteOffset: c.byteOffset, totalBytes: c.totalBytes, sha256: c.sha256, data: chunk.toString("base64") },
    cursor: next < bytes.length ? encodeCursor({ ...c, byteOffset: next }) : null, pagination });
  }
  let offset = c.offset;
  if (c.after !== undefined) {
    const hits = messages.map((message, index) => sameIdentity(messageIdentity(message, data), c.after) ? index : -1).filter((i) => i >= 0);
    if (hits.length !== 1) throw cursorError("stale_cursor");
    offset = hits[0] + 1;
  }
  if (offset > messages.length) throw cursorError("stale_cursor");
  const nextCursor = (at, after) => {
    if (at >= messages.length) return null;
    if (large && (!after || messages.filter((message) => sameIdentity(messageIdentity(message, data), after)).length !== 1))
      throw cursorError("invalid_identity");
    return encodeCursor({ ...cursorBase, offset: at, ...(large ? { kind: "page", after } : {}) });
  };
  const slice = [];
  for (let i = offset; i < messages.length && slice.length < PAGE_SIZE; i++) {
    const message = messages[i];
    if (Buffer.byteLength(JSON.stringify({ ...base, messages: [...slice, message] })) > MAX_REPLY - 4096) {
      if (slice.length) break;
      if (!large) throw cursorError("oversized");
      const identity = messageIdentity(message, data);
      if (!identity || messages.filter((m) => sameIdentity(messageIdentity(m, data), identity)).length !== 1) throw cursorError("invalid_identity");
      const bytes = Buffer.from(JSON.stringify(message), "utf8"), sha256 = hashBytes(bytes);
      const contentCursor = encodeCursor({ ...cursorBase, kind: "content", ...identity, byteOffset: 0, totalBytes: bytes.length, sha256 });
      return bounded({ ...contentBase, messagesComplete: false, oversized: { ...identity, messageIndex: i, totalBytes: bytes.length, sha256, contentCursor },
        cursor: nextCursor(i + 1, identity), pagination });
    }
    slice.push(message);
  }
  const after = slice.length ? messageIdentity(slice.at(-1), data) : null;
  return bounded({ ...base, messages: slice, cursor: nextCursor(offset + slice.length, after), pagination });
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
        const hasReport = Object.prototype.hasOwnProperty.call(q, "report"), hasHash = Object.prototype.hasOwnProperty.call(q, "reportHash");
        const addressMatches = hasReport && !hasHash ? q.report === ctx.report
          : !hasReport && hasHash && q.largeMessages === 1 && q.reportHash === reportDigest(ctx.report);
        if (!addressMatches || q.invocationId !== ctx.invocationId || !["status", "messages"].includes(q.kind)) throw new Error("identity or request mismatch");
        result = await observe(ctx, q.kind);
        if (q.kind === "messages") result = page(result, q.cursor, q.largeMessages === 1);
      } catch (e) { result = { error: ["stale_cursor", "oversized"].includes(e.code) ? e.code : "unavailable", report: ctx.report, invocationId: ctx.invocationId }; }
      const text = JSON.stringify(result);
      socket.end(Buffer.byteLength(text) + 1 <= MAX_REPLY ? text + "\n" : JSON.stringify({ error: "response exceeds limit", report: ctx.report, invocationId: ctx.invocationId }) + "\n");
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

export async function readObservation(report, kind = "status", cursor = null, { large = false } = {}) {
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
      parseCursor(cursor, base, large);
      if (claim.transcriptPath !== expected || fs.statSync(expected).size > 32 * 1024 * 1024) throw new Error();
      const transcript = JSON.parse(fs.readFileSync(expected, "utf8"));
      if (transcript.sessionID !== claim.sessionID || JSON.stringify(transcript.inputIds) !== JSON.stringify(claim.turnIds) || !Array.isArray(transcript.messages)) throw new Error();
      const messages = ownMessages(transcript.messages, transcript.sessionID, transcript.inputIds);
      return page({ ...base, messages, source: "transcript" }, cursor, large);
    } catch (e) { return e.code === "stale_cursor" ? { ...base, state: "stale", reason: "stale_cursor", messages: [], source: "transcript" }
      : e.code === "invalid_cursor" ? { ...base, state: "unavailable", messages: [], source: "unavailable" }
      : { ...base, messages: [], source: "unavailable", ...(e.code === "oversized" ? { reason: "oversized" } : {}) }; }
  }
  if (typeof claim.observer !== "string" || typeof claim.invocationId !== "string") return { report, state: "unavailable" };
  return await new Promise((resolve) => {
    const socket = net.createConnection(claim.observer);
    const decoder = new StringDecoder("utf8");
    let text = "", bytes = 0, done = false;
    const finish = (value) => { if (done) return; done = true; socket.destroy(); resolve(value); };
    const unavailable = () => finish({ report, invocationId: claim.invocationId, state: "unavailable" });
    socket.setTimeout(6000, unavailable); socket.on("error", unavailable);
    socket.on("connect", () => {
      const raw = { report, invocationId: claim.invocationId, kind, cursor, ...(large ? { largeMessages: 1 } : {}) };
      const request = large && Buffer.byteLength(JSON.stringify(raw)) + 1 > MAX_REQUEST
        ? { reportHash: reportDigest(report), invocationId: claim.invocationId, kind, cursor, largeMessages: 1 } : raw;
      socket.write(JSON.stringify(request) + "\n");
    });
    socket.on("data", (chunk) => { bytes += chunk.length; if (bytes > MAX_REPLY) return unavailable(); text += decoder.write(chunk); });
    socket.on("end", () => {
      try {
        const value = JSON.parse(text + decoder.end());
        if (value.report !== report || value.invocationId !== claim.invocationId) return unavailable();
        if (value.error === "stale_cursor") return finish({ report, invocationId: claim.invocationId, state: "stale", reason: "stale_cursor" });
        if (value.error === "oversized") return finish({ report, invocationId: claim.invocationId, state: "unavailable", reason: "oversized" });
        if (value.error) return unavailable();
        finish({ ...value, state: "live" });
      }
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
  if (args.includes("--large") && kind !== "messages") { process.stderr.write("--large requires --messages\n"); process.exit(2); }
  if (args.includes("--cursor") && !cursor) { process.stderr.write("--cursor requires a value\n"); process.exit(2); }
  const value = await readObservation(report, kind, cursor, { large: args.includes("--large") });
  if (value.reason === "oversized") value.hint = "repeat with --messages --large to read the message";
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
  if (value.state === "unavailable" || value.state === "stale" || value.reason === "oversized"
    || (kind === "messages" && value.source === "unavailable")) process.exitCode = 1;
}
