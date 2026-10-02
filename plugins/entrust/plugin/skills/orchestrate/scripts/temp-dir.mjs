#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TEMP_KINDS = ["checks", "swarm", "cleanup", "evals", "agents"];
export const TEMP_OWNER = ".entrust-owner.json";
export const TEMP_CONTEXT = ".entrust-run.json";
export const PROJECT_KEY = /^[a-zA-Z0-9._-]+-[a-f0-9]{12}$/;
const CONTEXT_ENV = "ENTRUST_TEMP_CONTEXT";
const component = (s) => typeof s === "string" && s.length > 0 && !s.includes("\0")
  && path.basename(s) === s && s !== "." && s !== "..";
const under = (p, base) => p === base || p.startsWith(base + path.sep);
const key = (p, label = path.basename(p)) => `${label.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 24) || "project"}-${crypto.createHash("sha256").update(p).digest("hex").slice(0, 12)}`;

function privateDirectory(dir) {
  try { fs.lstatSync(dir); }
  catch (e) {
    if (e.code !== "ENOENT") throw e;
    try { fs.mkdirSync(dir, { mode: 0o700 }); }
    catch (made) { if (made.code !== "EEXIST") throw made; }
  }
  const st = fs.lstatSync(dir);
  const why = st.isSymbolicLink() ? "is a symbolic link" : !st.isDirectory() ? "is not a directory"
    : typeof process.getuid === "function" && st.uid !== process.getuid()
      ? `belongs to uid ${st.uid}, not to this user` : null;
  if (why) throw new Error(`temporary directory ${dir} ${why}`);
}

function directoryChain(base, parts) {
  let dir = base;
  for (const part of parts) {
    if (!component(part)) throw new Error("the temporary context contains an invalid path component");
    dir = path.join(dir, part); privateDirectory(dir);
  }
  return dir;
}

function canonicalPath(p) {
  let at = path.resolve(p);
  const tail = [];
  while (!fs.existsSync(at) && path.dirname(at) !== at) { tail.unshift(path.basename(at)); at = path.dirname(at); }
  return path.join(fs.realpathSync(at), ...tail);
}

function temporaryRoot(root) {
  if (!path.isAbsolute(root)) throw new Error("the temporary root must be absolute");
  let at = path.resolve(root);
  const tail = [];
  while (!fs.existsSync(at) && path.dirname(at) !== at) { tail.unshift(path.basename(at)); at = path.dirname(at); }
  return directoryChain(fs.realpathSync(at), tail);
}

function inheritedContext(root) {
  if (!process.env[CONTEXT_ENV]) return null;
  let c;
  try { c = JSON.parse(process.env[CONTEXT_ENV]); }
  catch { throw new Error("the temporary run context is not valid JSON"); }
  if (c?.version !== 1 || !path.isAbsolute(c.root ?? "") || !PROJECT_KEY.test(c.project)
      || !component(c.run) || !path.isAbsolute(c.scope ?? "") || !path.isAbsolute(c.projectRoot ?? "")
      || c.root !== path.resolve(c.root) || c.scope !== path.resolve(c.scope))
    throw new Error("the temporary run context is invalid");
  const runDir = path.join(c.root, "entrust", c.project, c.run);
  if (!under(c.scope, runDir)) throw new Error("the temporary scope is outside its run");
  // Marked child scratch narrows the scope; an unrelated TMPDIR starts a separate context.
  if (root !== c.root && root !== c.scope) {
    if (!under(root, c.scope)) return null;
    const marker = path.join(root, TEMP_OWNER);
    let owner;
    try {
      const st = fs.lstatSync(marker);
      if (!st.isFile() || (typeof process.getuid === "function" && st.uid !== process.getuid())) return null;
      owner = JSON.parse(fs.readFileSync(marker, "utf8"));
    } catch { return null; }
    if (owner?.version !== 1 || !["evals", "agents"].includes(owner.kind)
        || !Number.isInteger(owner.pid) || owner.pid < 1) return null;
    c = { ...c, scope: root };
  }
  directoryChain(c.root, path.relative(c.root, c.scope).split(path.sep));
  return c;
}

export function createTempContext({ root = os.tmpdir(), cwd = process.cwd(), runPath = null, inherit = true } = {}) {
  root = temporaryRoot(root);
  const prior = inherit ? inheritedContext(root) : null;
  if (prior) { process.env[CONTEXT_ENV] = JSON.stringify(prior); return prior; }
  cwd = fs.realpathSync(cwd);
  const git = spawnSync("git", ["-C", cwd, "rev-parse", "--show-toplevel"], { encoding: "utf8", timeout: 5000 });
  const projectRoot = git.status === 0 ? fs.realpathSync(git.stdout.trim()) : cwd;
  const project = key(projectRoot);
  runPath = runPath ? canonicalPath(runPath) : null;
  const run = runPath ? key(runPath) : `run-${crypto.randomBytes(6).toString("hex")}`;
  const scope = directoryChain(root, ["entrust", project, run]);
  const c = { version: 1, root, project, projectRoot, run, scope, runPath: runPath ? path.resolve(runPath) : null };
  try { fs.writeFileSync(path.join(scope, TEMP_CONTEXT), JSON.stringify(c) + "\n", { mode: 0o600, flag: "wx" }); }
  catch (e) {
    if (e.code !== "EEXIST") throw e;
    const st = fs.lstatSync(path.join(scope, TEMP_CONTEXT));
    if (!st.isFile() || st.isSymbolicLink()) throw new Error("the temporary run record is not an ordinary file");
    const old = JSON.parse(fs.readFileSync(path.join(scope, TEMP_CONTEXT), "utf8"));
    if (old.version !== 1 || old.root !== root || old.projectRoot !== projectRoot || old.runPath !== c.runPath)
      throw new Error("the temporary run record belongs to another context");
  }
  process.env[CONTEXT_ENV] = JSON.stringify(c);
  return c;
}

function writeOwner(dir, kind, extra = {}) {
  fs.writeFileSync(path.join(dir, TEMP_OWNER), JSON.stringify({
    version: 1, kind, pid: process.pid, ...extra,
  }) + "\n", { mode: 0o600, flag: "wx" });
}

export function createAgentTemp({ cwd, reportPath, runPath } = {}) {
  const c = createTempContext({ cwd, runPath });
  const base = directoryChain(c.scope, ["agents"]);
  const name = reportPath ? key(canonicalPath(reportPath), path.basename(path.dirname(reportPath))) : "agent";
  const dir = fs.mkdtempSync(path.join(base, `${name}-`));
  writeOwner(dir, "agents", { reportPath: reportPath ? path.resolve(reportPath) : null });
  process.env[CONTEXT_ENV] = JSON.stringify({ ...c, scope: dir });
  return { dir, bases: [base, path.join(fs.realpathSync(os.tmpdir()), "entrust")], namespace: path.join(c.root, "entrust") };
}

// Mailboxes may share evaluator storage, but no enclosing agent grant may cover a decision.
export function agentTempAncestor(candidate, namespace) {
  let possibleAgent = null;
  const known = new Set();
  for (let at = candidate; ; at = path.dirname(at)) {
    if (path.basename(path.dirname(at)) === "agents") possibleAgent = at;
    if (possibleAgent && PROJECT_KEY.test(path.basename(at)) && path.basename(path.dirname(at)) === "entrust")
      return possibleAgent;
    try {
      const owner = path.join(at, TEMP_OWNER);
      if (fs.lstatSync(owner).isFile() && JSON.parse(fs.readFileSync(owner, "utf8"))?.kind === "agents") return at;
    } catch { /* absent or opaque records are handled by the layout below */ }
    try {
      const record = path.join(at, TEMP_CONTEXT);
      if (fs.lstatSync(record).isFile()) {
        const c = JSON.parse(fs.readFileSync(record, "utf8"));
        if (c?.version === 1 && path.isAbsolute(c.root ?? "") && PROJECT_KEY.test(c.project)
            && component(c.run) && path.join(c.root, "entrust", c.project, c.run) === at) {
          if (possibleAgent) return possibleAgent;
          known.add(path.join(c.root, "entrust"));
        }
      }
    } catch { /* unknown ancestry retains the legacy exclusion */ }
    if (at === namespace && !known.has(at)) return at;
    if (path.dirname(at) === at) return null;
  }
}

export function createTempDir(kind, prefix, root = os.tmpdir()) {
  if (!TEMP_KINDS.includes(kind) || kind === "agents") throw new Error(`unknown temporary artifact kind ${kind}`);
  if (!prefix || path.basename(prefix) !== prefix || prefix === "." || prefix === "..")
    throw new Error("the temporary prefix must be one path component");
  root = temporaryRoot(root);
  const category = kind === "cleanup"
    ? directoryChain(root, ["entrust", "_global", "cleanup"])
    : directoryChain(createTempContext({ root }).scope, [kind]);
  const dir = fs.mkdtempSync(path.join(category, prefix));
  writeOwner(dir, kind);
  return dir;
}

const isMain = (() => {
  try { return fs.realpathSync(process.argv[1] ?? "") === fileURLToPath(import.meta.url); }
  catch { return false; }
})();

if (isMain) {
  try {
    if (process.argv.length !== 3 || !["cleanup", "run"].includes(process.argv[2]))
      throw new Error("usage: node temp-dir.mjs cleanup|run");
    if (process.argv[2] === "cleanup") console.log(path.join(createTempDir("cleanup", "snapshot-"), "listing.json"));
    else { createTempContext({ inherit: false }); console.log(process.env[CONTEXT_ENV]); }
  } catch (e) {
    process.stderr.write(`entrust: ${e.message}\n`);
    process.exitCode = 2;
  }
}
