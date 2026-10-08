// What every external agent's driver shares beside the launcher's contract: the exit codes, the request id,
// the RIGHTS grammar and the scope it grants, and the worktree a `worktree` agent runs in. The OpenCode and
// Claude drivers import it; nothing here runs on import.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const firstLine = (s, n = 300) => String(s ?? "").split("\n")[0].slice(0, n);

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

// The RIGHTS a prompt grants, or the plan's writes when a registered plan pins them and the prompt names none.
// A pinned plan holds the resolved write path, not only the kind: a same-kind RIGHTS that resolves outside the
// approved root, or a different worktree, is a widening and is refused.
export function resolveRights(value, planWrites, cwd = process.cwd()) {
  if (value === undefined) {
    if (planWrites) return planWritesToRights(planWrites, cwd);
    return { error: "RIGHTS is required: read, write <dir> or worktree <repo>" };
  }
  const rights = parseRights(value);
  if (rights.error || !planWrites) return rights;
  const planned = planWritesToRights(planWrites, cwd);
  if (planned.error) return planned;
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
  return rights;
}

const resolveCwd = (p) => canonical(p ?? process.cwd());

export function rightsScope(rights) {
  if (rights.kind === "read") return { kind: "read", readDir: resolveCwd(rights.path ?? null), roots: [] };
  if (rights.kind === "write") {
    const p = resolveCwd(rights.path);
    return { kind: "write", readDir: p, roots: [p] };
  }
  return { kind: "worktree", repo: resolveCwd(rights.path), roots: [] };
}

// A resume may not widen the writes scope recorded for the session it rejoins.
export function scopeWithin(scope, prior) {
  if (!prior) return true;
  if (scope.kind === "read") return true;
  const priorRoots = prior.roots ?? [];
  if (!scope.roots?.length) return false;
  return scope.roots.every((r) => priorRoots.some((p) => within(r, p)));
}

export function git(args, cwd) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", error: r.error };
}

// A detached worktree of `repo` at its HEAD, named `name` under <stateDir>/worktrees.
export function makeWorktree(repo, stateDir, name) {
  const base = path.join(stateDir, "worktrees");
  const wt = path.join(base, name);
  if (fs.existsSync(wt)) return { error: `worktree path ${wt} already exists` };
  const head = git(["-C", repo, "rev-parse", "HEAD"]);
  if (head.status !== 0) return { error: `RIGHTS worktree: ${repo} is not a git repository (${firstLine(head.stderr, 200)})` };
  fs.mkdirSync(base, { recursive: true, mode: 0o700 });
  const add = git(["-C", repo, "worktree", "add", "--detach", wt, "HEAD"]);
  if (add.status !== 0) return { error: `RIGHTS worktree: git worktree add failed (${firstLine(add.stderr, 200)})` };
  return { worktreePath: wt, base: head.stdout.trim(), repo };
}

// What a worktree run's report says about its tree; `run` holds worktreePath, worktreeRepo and worktreeBase.
export function worktreeFacts(ctx) {
  if (!ctx.worktreePath) return {};
  const diff = git(["-C", ctx.worktreePath, "diff"]);
  const status = git(["-C", ctx.worktreePath, "status", "--porcelain"]);
  return {
    worktreePath: ctx.worktreePath,
    worktreeRepo: ctx.worktreeRepo,
    worktreeBase: ctx.worktreeBase ?? null,
    base: ctx.worktreeBase ?? null,
    diff: diff.status === 0 ? diff.stdout : null,
    untracked: status.status === 0 ? status.stdout.split("\n").filter(Boolean) : null,
  };
}
