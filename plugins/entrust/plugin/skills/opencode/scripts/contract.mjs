// Shared parsing and validation for the OpenCode driver.
//
// Everything here is pure: the parser, the explicit JSON-Schema subset checker, the value
// validator and the callback-envelope builder. driver.mjs imports them and never runs anything
// here on import, so an independent test can import this module alone.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { digest, splitModel } from "./config.mjs";
import { SCHEMA_KEYWORDS, checkSchemaSubset, validateValue, validateOutput } from "../../orchestrate/scripts/json-schema.mjs";
import { EXIT, REQUEST_ID, REQUEST_ID_SOURCE, canonical, flagValue, parseRights, planWritesToRights, resolveModel, resolveRights, within } from "../../orchestrate/scripts/drivers.mjs";

export { EXIT, REQUEST_ID, REQUEST_ID_SOURCE, canonical, parseRights, planWritesToRights, within };

// The shared five-field answer schema lives with the other adapters; it is never duplicated here.
// From scripts/ the path is skills/codex/schemas, i.e. two levels up, not one.
export const FIVE_FIELDS_SCHEMA = fileURLToPath(new URL("../../orchestrate/schemas/five-fields.schema.json", import.meta.url));

// Header keys the driver understands. RIGHTS must be first if present; every other uppercase
// header is refused, and NETWORK/WEB_SEARCH are understood only to refuse them for the capability
// they need and this adapter does not have.
export const HEADER_KEYS = new Set([
  "RIGHTS", "MODEL", "VARIANT", "EFFORT", "RESUME", "OUTPUT_SCHEMA",
  "EXPECT", "ALLOW_NO_COMMANDS", "BRIEF", "NETWORK", "WEB_SEARCH", "API_FAMILY", "AGENT",
]);
export const CAPABILITY_HEADERS = new Set(["NETWORK", "WEB_SEARCH"]);

export function requestId(seq, rand = crypto.randomBytes) {
  if (!Number.isInteger(seq) || seq < 0) throw new Error("request sequence must be a non-negative integer");
  return `${seq}-${rand(4).toString("hex")}`;
}

export function isRequestId(value) { return typeof value === "string" && REQUEST_ID.test(value); }

// The prompt is a run of `KEY: value` header lines, then `TASK:` which begins the body. Blank
// lines before TASK are tolerated; anything else before TASK, an unknown uppercase header, a
// duplicate header, a bad RIGHTS, a bad MODEL or EXPECT, a relative OUTPUT_SCHEMA, a missing
// OUTPUT_SCHEMA file, a non-yes ALLOW_NO_COMMANDS/BRIEF, and NETWORK/WEB_SEARCH are refusals.
export function parsePrompt(text, env = process.env, cwd = process.cwd()) {
  if (typeof text !== "string") return { error: "the prompt is not text" };
  const lines = text.split(/\r\n|\n|\r/);
  const headers = {};
  const order = [];
  let i = 0;
  let started = false;
  let bodyLines = [];
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (started) { bodyLines.push(line); continue; }
    const m = /^([A-Z][A-Z0-9_]*):(?:[ \t](.*))?$/.exec(line);
    if (m) {
      const key = m[1], raw = (m[2] ?? "").trim();
      if (key === "TASK") {
        started = true;
        if (raw !== "") bodyLines.push(raw);
        continue;
      }
      if (!HEADER_KEYS.has(key)) return { error: `unsupported header ${key}` };
      if (Object.prototype.hasOwnProperty.call(headers, key)) return { error: `duplicate header ${key}` };
      if (CAPABILITY_HEADERS.has(key))
        return { error: `${key} needs a capability this adapter does not have; the run is refused rather than silently ignoring it` };
      headers[key] = raw;
      order.push(key);
      continue;
    }
    if (line === "" || line === undefined) continue;
    return { error: `unrecognized line before TASK: ${JSON.stringify(line)}` };
  }
  if (!started) return { error: "the prompt has no TASK: line" };
  // The line terminator that ends the file is not a blank body line.
  if (bodyLines.length && bodyLines[bodyLines.length - 1] === "") bodyLines.pop();
  const task = bodyLines.join("\n");
  if (task.trim() === "") return { error: "the TASK body is empty" };
  if (headers.RIGHTS && order[0] !== "RIGHTS") return { error: "RIGHTS must be the first header when present" };

  const out = { headers, order, task, taskSet: true };
  if (headers.API_FAMILY !== undefined) {
    if (!["v1", "v2"].includes(headers.API_FAMILY)) return { error: "API_FAMILY must be v1 or v2" };
    out.apiFamily = headers.API_FAMILY;
  }
  if (headers.AGENT !== undefined) {
    if (!/^[A-Za-z0-9_-]+$/.test(headers.AGENT)) return { error: "AGENT must be a native profile name" };
    if (out.apiFamily === "v1") return { error: "AGENT requires API_FAMILY v2" };
    out.agent = headers.AGENT;
  }
  if (headers.RESUME === undefined && out.apiFamily === "v2" && !out.agent)
    return { error: "API_FAMILY v2 requires AGENT naming a verified native ask profile" };
  if (headers.RESUME === undefined && out.agent && out.apiFamily !== "v2")
    return { error: "AGENT requires API_FAMILY v2" };

  // A continuation of a report keeps that run's rights, which the driver reads from it; any other run declares them.
  const kept = headers.RESUME !== undefined && path.isAbsolute(headers.RESUME) && headers.RIGHTS === undefined && !env.ENTRUST_PLAN_WRITES;
  const rights = kept ? null : resolveRights(headers.RIGHTS, env.ENTRUST_PLAN_WRITES, cwd);
  if (rights?.error) return { error: rights.error };
  out.rights = rights;

  // MODEL: inherit or provider/model; under a registered plan, its model, which `inherit` departs from.
  const pinned = resolveModel(headers.MODEL, env.ENTRUST_PLAN_MODEL, (value, planned) => value === planned);
  if (pinned.error) return { error: pinned.error };
  if (pinned.model === null || pinned.model === "inherit") out.model = { inherit: true };
  else {
    try {
      out.model = { inherit: false, ...splitModel(pinned.model) };
    } catch (e) { return { error: e.message }; }
  }

  // EFFORT is an alias of VARIANT when it is explicit; a disagreement is refused.
  if (headers.VARIANT !== undefined) {
    if (!/^\S+$/.test(headers.VARIANT)) return { error: "VARIANT must be one token" };
    out.variant = headers.VARIANT;
  }
  if (headers.EFFORT !== undefined) {
    if (!/^\S+$/.test(headers.EFFORT)) return { error: "EFFORT must be one token" };
    if (out.variant !== undefined && out.variant !== headers.EFFORT)
      return { error: `EFFORT ${headers.EFFORT} disagrees with VARIANT ${out.variant}` };
    out.variant = headers.EFFORT;
    out.effortAlias = true;
  }

  if (headers.RESUME !== undefined) {
    const r = headers.RESUME;
    // Not `last`: under a plan the newest report beside this one is another worker's.
    if (r === "last") return { error: "RESUME last is not accepted: name the earlier run's report path" };
    if (!path.isAbsolute(r) && !/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(r))
      return { error: "RESUME must be an absolute report path or a session id" };
    out.resume = r;
  }

  // OUTPUT_SCHEMA is an absolute path; absent means the shared five-field answer schema.
  if (headers.OUTPUT_SCHEMA !== undefined) {
    const p = headers.OUTPUT_SCHEMA;
    if (!path.isAbsolute(p)) return { error: "OUTPUT_SCHEMA must be an absolute path" };
    let schema;
    try { schema = JSON.parse(fs.readFileSync(p, "utf8")); }
    catch (e) { return { error: `OUTPUT_SCHEMA ${p} is not readable JSON: ${e.message}` }; }
    const sub = checkSchemaSubset(schema);
    if (!sub.ok) return { error: `OUTPUT_SCHEMA ${p} uses unsupported keywords: ${sub.errors.join("; ")}` };
    out.outputSchemaPath = p;
    out.outputSchema = schema;
  } else {
    let schema;
    try { schema = JSON.parse(fs.readFileSync(FIVE_FIELDS_SCHEMA, "utf8")); }
    catch (e) { return { error: `the shared five-field schema is unreadable: ${e.message}` }; }
    const sub = checkSchemaSubset(schema);
    if (!sub.ok) return { error: `the shared five-field schema uses unsupported keywords: ${sub.errors.join("; ")}` };
    out.outputSchemaPath = FIVE_FIELDS_SCHEMA;
    out.outputSchema = schema;
  }

  if (headers.EXPECT !== undefined) {
    try { out.expect = new RegExp(headers.EXPECT); }
    catch (e) { return { error: `EXPECT is not a valid regular expression: ${e.message}` }; }
    out.expectSource = headers.EXPECT;
  }
  for (const key of ["ALLOW_NO_COMMANDS", "BRIEF"]) {
    if (headers[key] === undefined) continue;
    const on = flagValue(headers[key]);
    if (on === null) return { error: `${key} takes yes, true or 1, or no, false or 0` };
    if (on) out[key === "ALLOW_NO_COMMANDS" ? "allowNoCommands" : "brief"] = true;
  }
  return out;
}

// The schema subset is orchestrate's; the driver and the suites import it from here.
export { SCHEMA_KEYWORDS, checkSchemaSubset, validateValue, validateOutput };

export function extractJson(text) {
  if (typeof text !== "string") return null;
  let end = -1, depth = 0, inString = false;
  for (let i = text.length - 1; i >= 0; i--) {
    const c = text[i];
    if (end < 0) {
      if (c === "}") { end = i + 1; depth = 1; }
      continue;
    }
    if (c === '"') {
      let slashes = 0;
      for (let j = i - 1; j >= 0 && text[j] === "\\"; j--) slashes++;
      if (slashes % 2 === 0) inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "}") depth++;
    else if (c === "{" && --depth === 0) {
      try { return JSON.parse(text.slice(i, end)); } catch {}
      end = -1;
    }
  }
  return null;
}

// The callback envelope shared with the launcher. The payload is the server's request verbatim;
// `presented` is exactly JSON.stringify(payload, null, 2), which the launcher re-derives and
// compares before it publishes an accept.
export function envelope({ type, payload, seq, run, method, cause = "asked", cwd, roots = [], reason, deadlineAt, rand }) {
  if (type !== "opencode.permission" && type !== "opencode.question") throw new Error(`unknown request type ${type}`);
  if (!payload || typeof payload.id !== "string") throw new Error("the server request has no id");
  const rid = requestId(seq, rand);
  return {
    id: rid,
    type,
    payload,
    presented: JSON.stringify(payload, null, 2),
    requestHash: digest(payload),
    // The remote identity mirrors the request's own session, which may be a child session, not the
    // root the invocation started in. The launcher re-checks remote.sessionID === payload.sessionID.
    remote: { serverURL: run.serverURL, sessionID: payload.sessionID ?? run.threadId, requestID: payload.id, invocationId: run.invocationId },
    run: { pid: run.pid, startedAtMs: run.startedAtMs, threadId: run.threadId, turnId: run.turnId },
    method,
    cause,
    cwd,
    roots,
    reason,
    deadlineAt,
    settled: null,
  };
}

// Whether a decision file is this request's, mirroring the launcher's own check. A driver never
// acts on a decision that does not match the immutable envelope it published.
export function decisionFits(d, q) {
  return Boolean(d) && d.id === q.id && d.run?.pid === q.run?.pid && d.run?.startedAtMs === q.run?.startedAtMs
    && (d.run?.turnId ?? null) === (q.run?.turnId ?? null)
    && d.requestHash === q.requestHash && JSON.stringify(d.remote) === JSON.stringify(q.remote)
    && (q.type === "opencode.question" ? ["answer", "decline"].includes(d.decision) : ["accept", "decline"].includes(d.decision));
}

// A successful command is a bash tool part whose state completed with an observed exit of 0.
// A completed tool with no exit is not success.
export function commandEvidence(tools) {
  const commands = [], successful = [];
  for (const t of tools) {
    if (t?.tool !== "bash") continue;
    const exitCode = t.exit ?? null;
    const c = { command: t.command ?? null, exitCode, output: t.output ?? null, description: t.description ?? null };
    commands.push(c);
    if (exitCode === 0) successful.push(c);
  }
  return { commands, successful };
}

// EXPECT is checked against the output of an actually successful command only. Without
// ALLOW_NO_COMMANDS, a run that produced no successful command is missing its evidence.
export function expectation({ expect, successful, allowNoCommands }) {
  if (expect) {
    const hit = successful.find((c) => expect.test(String(c.output ?? "")));
    return hit ? { ok: true } : { ok: false, why: "no successful command's output matched EXPECT" };
  }
  if (!allowNoCommands && successful.length === 0) return { ok: false, why: "no successful command was recorded and ALLOW_NO_COMMANDS is not yes" };
  return { ok: true };
}
