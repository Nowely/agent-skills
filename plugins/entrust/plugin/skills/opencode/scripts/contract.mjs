// Shared parsing and validation for the OpenCode driver.
//
// Everything here is pure: the parser, the explicit JSON-Schema subset checker, the value
// validator and the callback-envelope builder. driver.mjs imports them and never runs anything
// here on import, so an independent test can import this module alone.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { digest, splitModel, modelKey } from "./config.mjs";

// The shared five-field answer schema lives with the other adapters; it is never duplicated here.
// From scripts/ the path is skills/codex/schemas, i.e. two levels up, not one.
export const FIVE_FIELDS_SCHEMA = fileURLToPath(new URL("../../codex/schemas/five-fields.schema.json", import.meta.url));

// Resolve a path through its longest existing prefix and then realpath, so a symlinked directory
// compares as the place a file will actually land. Mirrors the launcher's own resolveLoose.
export function canonical(p, base = process.cwd()) {
  const abs = path.isAbsolute(String(p)) ? String(p) : path.resolve(base, String(p));
  const rest = [];
  for (let cur = path.resolve(abs); ;) {
    try { return path.join(fs.realpathSync(cur), ...rest); } catch {}
    const parent = path.dirname(cur);
    if (parent === cur) return path.resolve(abs);
    rest.unshift(path.basename(cur));
    cur = parent;
  }
}

export function within(child, parent) {
  const rel = path.relative(parent, child);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel));
}

// Baseline exit codes. The numbering is a contract; 11 is left unused, as in the shared launcher.
export const EXIT = Object.freeze({
  SUCCESS: 0,
  MODEL: 1,
  USAGE: 2,
  TIMEOUT: 3,
  TRANSPORT: 4,
  COMMANDS: 5,
  APPROVAL: 6,
  NEEDS_INPUT: 7,
  NO_ANSWER: 8,
  VERIFY_FAILED: 9,
  BUSY: 10,
  VERIFY_UNMEASURED: 12,
  SCHEMA: 13,
});

// A request id is a sequence number and eight hex digits, and it is also a file name.
export const REQUEST_ID = /^\d+-[0-9a-f]{8}$/;
export const REQUEST_ID_SOURCE = "^\\d+-[0-9a-f]{8}$";

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

// RIGHTS: `read [cwd]`, `write <cwd>` or `worktree <repo>`. The path is kept as written; the
// driver resolves it against its own cwd.
export function parseRights(value) {
  if (typeof value !== "string") return { error: "RIGHTS needs read, write <dir> or worktree <repo>" };
  let m;
  if ((m = /^read(?:[ \t]+(\S.*))?$/.exec(value))) return { kind: "read", path: m[1] ?? null };
  if ((m = /^write[ \t]+(\S.*)$/.exec(value))) return { kind: "write", path: m[1] };
  if ((m = /^worktree[ \t]+(\S.*)$/.exec(value))) return { kind: "worktree", path: m[1] };
  return { error: `RIGHTS must be read, write <dir> or worktree <repo>, not ${JSON.stringify(value)}` };
}

// The writes column of a registered plan row, mapped to the same shapes.
export function planWritesToRights(writes, cwd) {
  if (writes === "nothing") return { kind: "read", path: null };
  if (writes === "live tree") return { kind: "write", path: cwd };
  if (writes === "worktree") return { kind: "worktree", path: cwd };
  const m = /^write[ \t]+(\S.*)$/.exec(writes ?? "");
  if (m) return { kind: "write", path: m[1] };
  return { error: `plan writes ${JSON.stringify(writes ?? null)} cannot be mapped to a rights scope` };
}

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

  // RIGHTS, or the plan's writes when a registered plan pins it. A registered plan pins the
  // resolved write PATH, not just the kind: a same-kind RIGHTS that resolves outside the approved
  // root (or a different worktree) is a widening attempt and is refused offline.
  const planWrites = env.ENTRUST_PLAN_WRITES;
  if (headers.RIGHTS !== undefined) {
    const rights = parseRights(headers.RIGHTS);
    if (rights.error) return { error: rights.error };
    out.rights = rights;
    if (planWrites) {
      const planned = planWritesToRights(planWrites, cwd);
      if (planned.error) return { error: planned.error };
      if (planned.kind !== rights.kind)
        return { error: `RIGHTS ${rights.kind} does not match the approved plan's ${planned.kind} writes scope` };
      if (planned.kind === "write") {
        const rp = canonical(rights.path ?? cwd, cwd), pp = canonical(planned.path, cwd);
        if (!within(rp, pp)) return { error: `RIGHTS write ${rp} widens past the approved plan write ${pp}` };
      }
      if (planned.kind === "worktree") {
        const rp = canonical(rights.path, cwd), pp = canonical(planned.path, cwd);
        if (rp !== pp) return { error: `RIGHTS worktree ${rp} is not the approved plan worktree ${pp}` };
      }
    }
  } else if (planWrites) {
    const rights = planWritesToRights(planWrites, cwd);
    if (rights.error) return { error: rights.error };
    out.rights = rights;
  } else {
    return { error: "RIGHTS is required: read, write <dir> or worktree <repo>" };
  }

  // MODEL: inherit or provider/model, with the plan's pin enforced offline.
  const planModel = env.ENTRUST_PLAN_MODEL;
  if (headers.MODEL === undefined || headers.MODEL === "inherit") {
    if (planModel) return { error: "a registered plan pins MODEL; inherit and an absent MODEL are refused" };
    out.model = { inherit: true };
  } else {
    try {
      out.model = { inherit: false, ...splitModel(headers.MODEL) };
    } catch (e) { return { error: e.message }; }
    if (planModel && modelKey(out.model) !== planModel)
      return { error: `MODEL ${headers.MODEL} does not match the approved plan's ${planModel}` };
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
    if (r === "") return { error: "RESUME must be a session id, an absolute report path or last" };
    if (r !== "last" && !path.isAbsolute(r) && !/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(r))
      return { error: "RESUME must be a session id, an absolute report path or last" };
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
    if (headers[key] !== undefined && headers[key].toLowerCase() !== "yes")
      return { error: `${key} takes only yes` };
    if (headers[key] !== undefined) out[key === "ALLOW_NO_COMMANDS" ? "allowNoCommands" : "brief"] = true;
  }
  return out;
}

// The JSON-Schema subset this driver validates. Every keyword here is actually enforced; a schema
// that uses any other keyword is refused rather than reported as validated.
export const SCHEMA_KEYWORDS = new Set([
  "type", "properties", "required", "additionalProperties", "enum", "items",
  "maxLength", "minLength", "maxItems", "minItems", "minimum", "maximum", "pattern",
  "oneOf", "description", "title", "default", "$schema",
]);
const ANNOTATION_KEYWORDS = new Set(["description", "title", "default", "$schema"]);
const TYPES = new Set(["string", "number", "integer", "boolean", "array", "object", "null"]);

export function checkSchemaSubset(schema, where = "$") {
  const errors = [];
  const walk = (s, at) => {
    if (typeof s !== "object" || s === null || Array.isArray(s)) { errors.push(`${at}: a schema must be an object`); return; }
    for (const k of Object.keys(s)) if (!SCHEMA_KEYWORDS.has(k)) errors.push(`${at}: unsupported keyword ${k}`);
    if (s.oneOf !== undefined) {
      if (!Array.isArray(s.oneOf) || s.oneOf.length === 0) errors.push(`${at}.oneOf: must be a non-empty array of schemas`);
      else s.oneOf.forEach((branch, i) => walk(branch, `${at}.oneOf[${i}]`));
    }
    if (s.type !== undefined) {
      const types = Array.isArray(s.type) ? s.type : [s.type];
      for (const t of types) if (!TYPES.has(t)) errors.push(`${at}: unsupported type ${JSON.stringify(t)}`);
    }
    if (s.properties !== undefined) {
      if (typeof s.properties !== "object" || s.properties === null || Array.isArray(s.properties)) errors.push(`${at}.properties: must be an object`);
      else for (const [k, v] of Object.entries(s.properties)) walk(v, `${at}.properties.${k}`);
    }
    if (s.items !== undefined) {
      if (Array.isArray(s.items)) errors.push(`${at}.items: tuple form is unsupported`);
      else walk(s.items, `${at}.items`);
    }
    if (s.additionalProperties !== undefined && typeof s.additionalProperties !== "boolean")
      errors.push(`${at}.additionalProperties: only a boolean is supported`);
    if (s.required !== undefined && !(Array.isArray(s.required) && s.required.every((x) => typeof x === "string")))
      errors.push(`${at}.required: must be an array of strings`);
    if (s.enum !== undefined && !Array.isArray(s.enum)) errors.push(`${at}.enum: must be an array`);
    for (const k of ["minimum", "maximum"])
      if (s[k] !== undefined && (typeof s[k] !== "number" || !Number.isFinite(s[k])))
        errors.push(`${at}.${k}: must be a finite number`);
    for (const k of ["minLength", "maxLength", "minItems", "maxItems"])
      if (s[k] !== undefined && (!Number.isInteger(s[k]) || s[k] < 0))
        errors.push(`${at}.${k}: must be a non-negative integer`);
    if (s.pattern !== undefined && typeof s.pattern !== "string") errors.push(`${at}.pattern: must be a string`);
    if (s.pattern !== undefined) { try { new RegExp(s.pattern); } catch { errors.push(`${at}.pattern: invalid regular expression`); } }
  };
  walk(schema, where);
  return { ok: errors.length === 0, errors };
}

const typeMatches = (type, value) => {
  switch (type) {
    case "string": return typeof value === "string";
    case "number": return typeof value === "number" && Number.isFinite(value);
    case "integer": return typeof value === "number" && Number.isInteger(value);
    case "boolean": return typeof value === "boolean";
    case "array": return Array.isArray(value);
    case "object": return typeof value === "object" && value !== null && !Array.isArray(value);
    case "null": return value === null;
    default: return true;
  }
};

export function validateValue(schema, value, where = "$", errors = []) {
  if (typeof schema !== "object" || schema === null) return errors;
  if (schema.oneOf !== undefined) {
    const matches = schema.oneOf.filter((branch) => validateValue(branch, value, where, []).length === 0).length;
    if (matches !== 1) errors.push(`${where}: oneOf requires exactly one matching branch, found ${matches}`);
  }
  const types = schema.type === undefined ? [] : Array.isArray(schema.type) ? schema.type : [schema.type];
  if (types.length && !types.some((t) => typeMatches(t, value))) {
    errors.push(`${where}: expected ${types.join(" or ")}`);
    return errors;
  }
  if (schema.enum !== undefined && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value)))
    errors.push(`${where}: not one of the permitted values`);
  if (typeof value === "string") {
    const n = [...value].length;
    if (schema.maxLength !== undefined && n > schema.maxLength) errors.push(`${where}: longer than ${schema.maxLength} characters`);
    if (schema.minLength !== undefined && n < schema.minLength) errors.push(`${where}: shorter than ${schema.minLength} characters`);
    if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(value)) errors.push(`${where}: does not match the pattern`);
  }
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${where}: below the minimum`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${where}: above the maximum`);
  }
  if (Array.isArray(value)) {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${where}: more than ${schema.maxItems} items`);
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${where}: fewer than ${schema.minItems} items`);
    if (schema.items !== undefined) value.forEach((v, i) => validateValue(schema.items, v, `${where}[${i}]`, errors));
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const props = schema.properties ?? {};
    for (const r of schema.required ?? []) if (!Object.hasOwn(value, r)) errors.push(`${where}: missing required ${r}`);
    if (schema.additionalProperties === false)
      for (const k of Object.keys(value)) if (!Object.hasOwn(props, k)) errors.push(`${where}: unexpected property ${k}`);
    for (const [k, s] of Object.entries(props)) if (Object.hasOwn(value, k)) validateValue(s, value[k], `${where}.${k}`, errors);
  }
  return errors;
}

export function validateOutput(schema, value) {
  const errors = validateValue(schema, value);
  return { ok: errors.length === 0, errors };
}

// The last balanced JSON object in a block of text, or null. Models wrap JSON in prose or fences;
// the answer is the object, not the wrapper.
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
