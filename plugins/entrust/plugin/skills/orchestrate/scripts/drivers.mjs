// What every external agent's driver shares beside the launcher's contract and the mailbox: the exit codes,
// the RIGHTS grammar and the scope it grants, the plan's model pin, the write-root check, and the worktree a
// `worktree` agent runs in. The Codex, OpenCode and Claude drivers import it; nothing here runs on import.
import fs from "node:fs";
import os from "node:os";
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
  BUSY: 10,
  SCHEMA: 13,
});

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

// A yes-or-no field: yes, true or 1; no, false or 0; anything else is null, a refusal.
export const flagValue = (v) => /^(yes|true|1)$/i.test(v ?? "") ? true : /^(no|false|0)$/i.test(v ?? "") ? false : null;

// The RIGHTS a prompt grants: the plan's writes when a registered plan pins them and the prompt names none, and
// read in the current directory, the narrowest grant, when neither does.
// A pinned plan holds the resolved write path, not only the kind: a same-kind RIGHTS that resolves outside the
// approved root, or a different worktree, is a widening and is refused.
export function resolveRights(value, planWrites, cwd = process.cwd()) {
  if (value === undefined) return planWrites ? planWritesToRights(planWrites, cwd) : { kind: "read", path: null };
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

// The MODEL a prompt runs on: the plan's when a registered plan pins one and the prompt names none, as RIGHTS takes
// the plan's writes. A prompt naming another model is refused; `same` says when two names are one model.
export function resolveModel(value, planModel, same = (a, b) => a.toLowerCase() === b.toLowerCase()) {
  if (!planModel || value === undefined) return { model: value ?? planModel ?? null };
  if (!same(value, planModel)) return { error: `MODEL ${value} does not match the approved plan's ${planModel}` };
  return { model: value };
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

// Why a directory may not be a write root, or null. Not the home directory or an ancestor of it (the passwd
// entry, and an absolute $HOME exactly), and not equal to, inside or above the state directory, where the
// mailboxes are, or a directory the adapter protects. Compared by dev:ino, not by spelling: a case variant, a
// link or an alias of the same directory is the same directory. `protectedDirs` is [{ dir, label, holds }].
export function writeRootProblem(dir, { stateDir, protectedDirs = [], home = passwdHome() }) {
  const statOf = (p) => { try { return fs.statSync(p); } catch { return null; } };
  const target = statOf(dir);
  if (!target) return `cannot stat ${dir}`;
  const same = (st) => Boolean(st) && st.dev === target.dev && st.ino === target.ino;
  const upward = (p) => { const out = [p]; while (path.dirname(out.at(-1)) !== out.at(-1)) out.push(path.dirname(out.at(-1))); return out; };
  const refuse = (why) => `refusing to grant write access to ${dir}: it is ${why}`;
  const h = canonical(home);
  for (const cur of upward(h)) if (same(statOf(cur))) return refuse(cur === h ? "your home directory" : `an ancestor of your home directory (${cur})`);
  const envHome = process.env.HOME;
  if (envHome && path.isAbsolute(envHome) && same(statOf(canonical(envHome)))) return refuse(`the directory $HOME points at (${envHome})`);
  for (const p of [{ dir: stateDir, label: "this driver's state directory", holds: "the run's approvals" }, ...protectedDirs]) {
    if (!p.dir) continue;
    const protSt = statOf(p.dir);
    if (protSt && upward(canonical(dir)).some((cur) => { const st = statOf(cur); return st && st.dev === protSt.dev && st.ino === protSt.ino; }))
      return refuse(`inside ${p.label}, which holds ${p.holds}`);
    const real = canonical(p.dir);
    for (const cur of upward(path.dirname(real))) if (same(statOf(cur))) return refuse(`an ancestor of ${p.label} (${real}), which holds ${p.holds}`);
  }
  return null;
}

// Whether `p` is `dir` or lies below it, compared by dev:ino along p's path, so a case variant, a link or an
// alias of `dir` is `dir`.
export function insideByInode(p, dir) {
  const statOf = (q) => { try { return fs.statSync(q); } catch { return null; } };
  const anc = statOf(dir);
  if (!anc) return false;
  for (let cur = p; ; cur = path.dirname(cur)) {
    const st = statOf(cur);
    if (st && st.dev === anc.dev && st.ino === anc.ino) return true;
    if (path.dirname(cur) === cur) return false;
  }
}

// Why an edit outside the run's roots is declined at once rather than offered, or null: its target is, or lies
// inside, the state directory, where the mailboxes are, or a directory the adapter protects (writeRootProblem's
// `protectedDirs`). By dev:ino along the target's path, so no spelling of one reaches the coordinator as a question.
export function guardedTarget(target, { stateDir, protectedDirs = [] }) {
  const real = canonical(target);
  for (const p of [{ dir: stateDir, label: "the state directory", holds: "the run's approvals" }, ...protectedDirs])
    if (p.dir && insideByInode(real, p.dir)) return `${target} lies inside ${p.label}, which holds ${p.holds}`;
  return null;
}

// The standing rules every external agent is given beside its task, so a wall is one it knows about: what its
// rights let it do (`rights`, and `network`, each CLI's own sentence), that what they do not cover is asked of the
// coordinator (`ask` says how, in that CLI) or, with no mailbox, refused, and that a refusal is recorded, not
// worked around. One string; Codex puts it on the thread, OpenCode before the task, Claude in its system prompt.
export function standingRules({ rights, network, mailbox, ask }) {
  return [
    "You run for a coordinating agent, unattended: nobody will answer a question.",
    rights,
    network,
    mailbox
      ? `An action your rights do not cover is asked of the coordinator, who approves or declines it: ${ask} Ask only for what the task needs, one action at a time, and say why.`
      : "Nothing beyond your rights can be granted in this run: an action they do not cover is refused.",
    "If an action is refused or declined, do not try to get around it with another tool or command: record the action, the refusal and what it blocked, finish what you can, and say what remains.",
  ].filter(Boolean).join(" ");
}

// The passwd home, which $HOME cannot move; $HOME's own value for a uid with no passwd entry.
export function passwdHome() {
  try { return os.userInfo().homedir; } catch { return os.homedir(); }
}

// Every git the driver runs: no fsmonitor, no hooks and no external diff, whatever the repository asks. A tree an
// agent wrote can name programs for git to run, with the caller's rights (codex/references/incidents.md, "Hooks
// run by the driver's own git"). A diff also takes `DIFF_SAFE`, since a gitattributes driver or a textconv is a
// second way to run one, and `diff.external=` alone makes git fail to run "".
const SAFE = ["-c", "core.fsmonitor=false", "-c", "core.hooksPath=/dev/null", "-c", "diff.external="];
const DIFF_SAFE = ["--no-ext-diff", "--no-textconv"];
export function git(args, cwd) {
  const r = spawnSync("git", [...SAFE, ...args], { cwd, encoding: "utf8", timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
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

// The git directory of `repo`'s worktree at `wt`, found from the repository, never from the tree: its `.git` file
// is the agent's to rewrite, and a rewritten one points every later git in the tree at a repository the agent
// made. git names the admin directory after the tree, with a number on a clash; its `gitdir` names the tree's
// `.git`. Null when no entry names it.
export function worktreeGitDir(repo, wt) {
  const common = git(["-C", repo, "rev-parse", "--git-common-dir"]);
  if (common.status !== 0) return null;
  const admin = path.resolve(repo, common.stdout.trim(), "worktrees");
  let names = [];
  try { names = fs.readdirSync(admin); } catch { return null; }
  const want = path.join(canonical(wt), ".git");
  for (const n of names) {
    let named = null;
    try { named = fs.readFileSync(path.join(admin, n, "gitdir"), "utf8").trim(); } catch {}
    if (named && canonical(named) === want) return path.join(admin, n);
  }
  return null;
}

// What a worktree run's report says about its tree; `ctx` holds worktreePath, worktreeRepo and worktreeBase.
// The diff is taken against the commit the tree started at, not the index: an agent that staged or committed
// its work would otherwise report none of it. Both read the tree through the git directory its repository
// records; a tree whose entry is gone reports no diff rather than one its own `.git` chose.
export function worktreeFacts(ctx) {
  if (!ctx.worktreePath) return {};
  const gitDir = ctx.worktreeRepo ? worktreeGitDir(ctx.worktreeRepo, ctx.worktreePath) : null;
  const inTree = (args) => gitDir ? git(["--git-dir", gitDir, "--work-tree", ctx.worktreePath, ...args], ctx.worktreePath) : null;
  const diff = inTree(["diff", ...DIFF_SAFE, ...(ctx.worktreeBase ? [ctx.worktreeBase] : [])]);
  const status = inTree(["status", "--porcelain"]);
  return {
    worktreePath: ctx.worktreePath,
    worktreeRepo: ctx.worktreeRepo,
    worktreeBase: ctx.worktreeBase ?? null,
    base: ctx.worktreeBase ?? null,
    diff: diff?.status === 0 ? diff.stdout : null,
    untracked: status?.status === 0 ? status.stdout.split("\n").filter(Boolean) : null,
  };
}
