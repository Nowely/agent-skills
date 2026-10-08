import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

export const modelKey = (m) => `${m.providerID}/${m.modelID}`;
export function splitModel(value) {
  const i = value.indexOf("/");
  if (i < 1 || i === value.length - 1 || /[\s\x00-\x1f]/.test(value)) throw new Error("MODEL needs provider/model, retaining slashes inside the model ID");
  return { providerID: value.slice(0, i), modelID: value.slice(i + 1) };
}
export function modelStateFile(env = process.env) {
  return env.ENTRUST_OPENCODE_MODEL_STATE || path.join(env.XDG_STATE_HOME || path.join(os.homedir(), ".local", "state"), "opencode", "model.json");
}
export function recentModels({ limit = 2, env = process.env } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("model limit must be 1..100");
  const file = modelStateFile(env);
  let state;
  try {
    if (fs.statSync(file).size > 1024 * 1024) throw new Error("model state exceeds 1 MiB");
    state = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) { throw new Error(`cannot read recent models at ${file}: ${e.message}`); }
  const result = [], seen = new Set();
  if (!Array.isArray(state.recent)) throw new Error("model state recent must be an array");
  for (const m of state.recent) {
    if (typeof m?.providerID !== "string" || typeof m?.modelID !== "string") continue;
    if (m.providerID.includes("/")) continue;
    const key = modelKey(m);
    try { splitModel(key); } catch { continue; }
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ providerID: m.providerID, modelID: m.modelID, variant: state.variant?.[key] ?? null });
    if (result.length === limit) break;
  }
  return result;
}
export const digest = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const id = (prefix) => `${prefix}_${Date.now().toString(16).padStart(12, "0")}${crypto.randomBytes(10).toString("hex")}`;
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export function atomicJson(file, value, { exclusive = false } = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = `${file}.${crypto.randomBytes(8).toString("hex")}.tmp`;
  try {
    fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    if (exclusive) fs.linkSync(tmp, file);
    else fs.renameSync(tmp, file);
  } finally { fs.rmSync(tmp, { force: true }); }
}
export const readJson = (file) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; } };
