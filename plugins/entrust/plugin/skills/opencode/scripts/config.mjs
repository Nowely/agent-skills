import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

// V2's basic auth takes this fixed username; OPENCODE_SERVER_USERNAME is ignored.
export const SERVER_USER = "opencode";
export const modelKey = (m) => `${m.providerID}/${m.modelID}`;
export function splitModel(value) {
  const i = value.indexOf("/");
  if (i < 1 || i === value.length - 1 || /[\s\x00-\x1f]/.test(value)) throw new Error("MODEL needs provider/model, retaining slashes inside the model ID");
  return { providerID: value.slice(0, i), modelID: value.slice(i + 1) };
}
// OpenCode Desktop keeps the models a user shows in its picker, and the variant chosen for each, in its own
// store, and no server route serves them. ENTRUST_OPENCODE_DESKTOP_STATE names another store: the suites set
// it to a fixture, since the default is the user's real one, and only the macOS location is known.
export function desktopStateFile(env = process.env) {
  return env.ENTRUST_OPENCODE_DESKTOP_STATE
    || path.join(os.homedir(), "Library", "Application Support", "ai.opencode.desktop", "drafts.sqlite");
}

// The models Desktop shows, in its order: { models: [{ providerID, modelID, variant }] }, or { absent } with no
// store, or { error } for one that cannot be read. A variant `default` is the provider's own, so none.
export async function desktopModels(env = process.env) {
  const file = desktopStateFile(env);
  if (!fs.existsSync(file)) return { absent: `no OpenCode Desktop store at ${file}` };
  let DatabaseSync;
  try { ({ DatabaseSync } = await import("node:sqlite")); }
  catch { return { error: "this Node has no node:sqlite, which reads OpenCode Desktop's store from 22.13 on" }; }
  let db;
  try {
    db = new DatabaseSync(file, { readOnly: true });
    const row = db.prepare("select value from state where name = ? and key = ?").get("opencode.global.dat", "model");
    const state = row ? JSON.parse(row.value) : null;
    if (!Array.isArray(state?.user)) return { error: "OpenCode Desktop's store holds no model list" };
    return { models: state.user.filter((u) => u?.visibility === "show" && typeof u.providerID === "string" && typeof u.modelID === "string")
      .map((u) => {
        const v = state.variant?.[modelKey(u)];
        return { providerID: u.providerID, modelID: u.modelID, variant: typeof v === "string" && v !== "default" ? v : null };
      }) };
  } catch (e) { return { error: `OpenCode Desktop's store could not be read: ${e.message}` }; }
  finally { try { db?.close(); } catch {} }
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
