#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TEMP_KINDS = ["checks", "swarm", "cleanup", "evals"];
export const TEMP_OWNER = ".entrust-owner.json";

function privateDirectory(dir) {
  try { fs.mkdirSync(dir, { mode: 0o700 }); }
  catch (e) { if (e.code !== "EEXIST") throw e; }
  const st = fs.lstatSync(dir);
  if (!st.isDirectory() || st.isSymbolicLink()
      || (typeof process.getuid === "function" && st.uid !== process.getuid()))
    throw new Error(`temporary directory ${dir} is not an ordinary directory owned by this user`);
}

export function createTempDir(kind, prefix, root = os.tmpdir()) {
  if (!TEMP_KINDS.includes(kind)) throw new Error(`unknown temporary artifact kind ${kind}`);
  if (!path.isAbsolute(root)) throw new Error("the temporary root must be absolute");
  if (!prefix || path.basename(prefix) !== prefix || prefix === "." || prefix === "..")
    throw new Error("the temporary prefix must be one path component");
  const base = path.join(fs.realpathSync(root), "entrust");
  privateDirectory(base);
  const category = path.join(base, kind);
  privateDirectory(category);
  const dir = fs.mkdtempSync(path.join(category, prefix));
  if (kind !== "cleanup") {
    fs.writeFileSync(path.join(dir, TEMP_OWNER), JSON.stringify({
      version: 1, kind, pid: process.pid,
    }) + "\n", { mode: 0o600, flag: "wx" });
  }
  return dir;
}

const isMain = (() => {
  try { return fs.realpathSync(process.argv[1] ?? "") === fileURLToPath(import.meta.url); }
  catch { return false; }
})();

if (isMain) {
  try {
    if (process.argv.length !== 3 || process.argv[2] !== "cleanup")
      throw new Error("usage: node temp-dir.mjs cleanup");
    console.log(path.join(createTempDir("cleanup", "snapshot-"), "listing.json"));
  } catch (e) {
    process.stderr.write(`entrust: ${e.message}\n`);
    process.exitCode = 2;
  }
}
