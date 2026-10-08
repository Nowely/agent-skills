#!/usr/bin/env node
// cleanup — lists what entrust leaves behind that nothing else removes, and deletes only the
// numbers the user picked.
//
//   node cleanup.mjs --list [--json]
//   node cleanup.mjs --delete --from <listing.json> <number>...
//
// Removable artifacts include an orchestrate run directory and a standalone report run
// directory, each with the run's temporary folder under <tmp>/entrust, a temporary folder there whose
// run is gone, the folders an earlier driver kept under <state>/tmp, an agent's scratch directory, the
// suites' scratch directories, grouped check outputs and swarm summaries, the saved conversations the
// suites leave behind, and a write lock nobody holds any more. Cleanup snapshots are kept. Five more are REPORTED and never
// touched — the driver's saved answers, managed worktrees, write locks still held or in the previous
// shape, the shared Codex home and another copy's data directory — because another owner or retention
// policy is responsible for each of them. Nothing here runs git.
//
// Three rules decide the rest.
//   * Evidence, never age. An item is removable only when nothing THIS PLUGIN RECORDS under it is in
//     use and everything under it could be read. The claim is exactly as wide as the records named
//     under "in use": a process holding a directory open with no agent, job record or suite name
//     behind it is invisible here, and so is a record in another copy's data directory.
//   * A failure to read is never an absence. Every read goes through one helper that answers with a
//     value or with the reason it could not be had, and a reason keeps the item. ENOENT is the only
//     error that is a fact.
//   * What was shown is what is removed. --delete verifies every number against ONE inventory before
//     it touches anything, so the order the user typed cannot decide, and re-takes each item's
//     liveness immediately before that item goes.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { EXIT, VERSION, canonPath, dropReclaimMarker, holderAlive, holdsReclaimMarker, reclaimable,
         takeReclaimMarker } from "../../codex/scripts/driver.mjs";
import { TEMP_KINDS, TEMP_OWNER, TEMP_CONTEXT, PATH_KEY, STATE_DIR_NAME } from "../../orchestrate/scripts/temp-dir.mjs";

// A removal that was attempted and failed. The other three codes are the driver's own.
const EXIT_FAILED = 1;
// The driver's LIMITS.SPAWN_TIMEOUT_MS, which is not exported: a `ps` that never returns must not
// hang the listing.
const SPAWN_TIMEOUT_MS = 120_000;

const PLUGIN_NAME = "entrust";
const RIGHTS_RE = /^codex-agent\.[A-Za-z0-9]{8}$/;            // SKILL.md's mktemp template
const WT_RE = /^codex-[0-9a-z]+-[0-9a-f]{8}$/;             // driver.mjs's worktree names
const EVAL_KINDS = [["entrust-test-", "the delegation tests"],
                    ["codex-lock-", "the lock tests"],
                    ["codex-worktree-", "the worktree tests"]];
// The two shapes a suite itself writes under $TMPDIR. A slug replaces every separator with a dash, so
// where one component ends and the next begins is not recoverable from it; the shape is therefore
// matched against the WHOLE tail below the temp root, which is what a suite's own naming determines
// end to end.
//   orchestrate-live-<ISO stamp>/<n>-<case>[/scratch] — plugins/entrust/evals/orchestrate-live.test.mjs:87 builds the
//     artifact directory as `orchestrate-live-${new Date().toISOString().replace(/[:.]/g, "-")}`,
//     :88-89 the case directory inside it as `${n}-${slug}`, and :167-168 the git clone inside THAT
//     as `scratch`. All 43 of this machine's answer to this shape.
//   cdx-permprobe-<suffix> — Claude Code's own permission probe, which nothing in this repository
//     writes; the shape is pinned from what it has left here (`cdx-permprobe-r8K76l`): one bare word
//     with no separator of its own.
// Existence is deliberately NOT evidence: a suite deletes its scratch when it ends, so requiring the
// directory to still be there hid exactly the conversations worth removing. A directory a person
// named `my-orchestrate-live-notes` under the temp root has neither shape, which is what keeps the
// collision closed, and nothing outside the temp root is read at all.
const SESSION_MARKS = [
  [/^entrust-[A-Za-z0-9-]+-(?:run-[a-f0-9]{12}|[A-Za-z0-9-]+-[a-f0-9]{12})-evals-orchestrate-live-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[A-Za-z0-9]{6}-\d+-[A-Za-z0-9-]+-scratch$/,
   "the orchestration tests"],
  [/^entrust-evals-orchestrate-live-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[A-Za-z0-9]{6}-\d+-[A-Za-z0-9-]+$/,
   "the orchestration tests"],
  [/^orchestrate-live-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-\d+-[A-Za-z0-9-]+$/,
   "the orchestration tests"],
  [/^cdx-permprobe-[A-Za-z0-9]+$/, "a permission check"]];
const DATADIR_RE = /^entrust-.+$/;                  // <plugin>-<marketplace>, this plugin's ids
// The same directory under the name this plugin carried before the rename. No agent of this plugin
// writes there any more, so it is the one data directory this cleanup removes itself.
const PREVIOUS_DATADIR_RE = /^codex-delegate-.+$/;
const WIDTH_MAX = 76, WIDTH_MIN = 60;
// A bound on one item's recursive listing. Nothing the plugin writes approaches it; a tree that does
// is not measured but kept, so a size the user was shown cannot cover only part of what would go.
const MAX_WALK_ENTRIES = 200_000;

const USAGE = `cleanup — list what entrust left behind, and remove only what was chosen.

  node cleanup.mjs --list [--json]
  node cleanup.mjs --delete --from <listing.json> <number>...
  node cleanup.mjs --help

--list prints a numbered listing: what each item is, its size, when it last changed, whether it is
suggested, selectable by its number or kept, and why. It writes nothing at all. --delete takes the
numbers the user chose and the file --list --json wrote, and removes a number only when the row it
finds now is the row the listing showed — same kind, name, status, paths, identities, size and
last-change times. Everything else is refused untouched, and the fresh listing follows.

It removes orchestrate run directories and agent scratch directories of THIS project, published
standalone report run directories, legacy runs with their temporary folders under <tmp>/entrust, the
temporary folders there whose run is gone, the folders an earlier driver kept under <state>/tmp, the
suites' scratch directories, the saved conversations the suites leave behind, and write locks nobody
holds: a released lock's leftover link, an abandoned lock with its record, and a lock record no link
names. It only REPORTS the driver's saved answers, managed worktrees and their ledger, write locks
still held or in the previous shape, the shared Codex home, and another copy's data directory. It
never runs git, and never removes anything it could not fully read.

Check output, swarm summaries, test files and agent scratch are listed per invocation under
<tmp>/entrust/<project>/<run>/{checks,swarm,evals,agents}. Their recorded process must be gone
before deletion; missing or uncertain ownership keeps them. Project/run parents are never
selected. Snapshots under <tmp>/entrust/.cleanup are listed and
kept because approval may still refer to them. Earlier root-level scratch is still covered.

An item is in use when a live pid is recorded under it or names it: an agent's startup line, a run's
agent directory with no report, a standalone report run with no published report.json, a job record
under the state directory, a running test suite, the name of a temporary folder whose run wrote no
report, or an earlier driver's owner.json under <state>/tmp; a temporary folder whose run is still in
the state directory goes only with that run. That is the whole of what it can see — a process
with none of those behind it is invisible to it.

Environment: ENTRUST_STATE_DIR (absolute), else <tmp>/entrust-state; <tmp> is a non-empty TMPDIR,
else Node's os.tmpdir(); CLAUDE_CONFIG_DIR or ~/.claude. \`ps\` decides whether a
test suite is running, with a ${SPAWN_TIMEOUT_MS / 1000}s bound; without it every test row is kept.

Exit codes: 0 everything asked for was removed; ${EXIT_FAILED} a removal was attempted and failed;
${EXIT.USAGE} bad arguments, an unreadable or stale snapshot, or no state directory; ${EXIT.BUSY} something
was refused and nothing about it was touched. ${EXIT.BUSY} outranks ${EXIT_FAILED}, which outranks 0.
`;

class Usage extends Error {}
const die = (msg) => { throw new Usage(msg); };

// ---------------------------------------------------------------- small shapes

const slug = (p) => p.replace(/[^A-Za-z0-9]/g, "-");
const under = (child, parent) => child === parent || child.startsWith(parent + path.sep);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// ONE way to read anything, and one shape for the answer: `{ ok: true, value }`, or
// `{ ok: false, why }` with the reason it could not be had. ENOENT is the only error that becomes a
// value, because "it is not there" is a fact this program has; every other error is a fact it does
// NOT have. No call site may turn the second into the first — a permission error read as an empty
// directory is how a live job stopped protecting anything, and how a conversation was offered on a
// name resolution that had failed halfway. Callers answer an `ok: false` by keeping the item.
const got = (value) => ({ ok: true, value });
const lost = (why) => ({ ok: false, why });
const attempt = (fn, p, what) => {
  try { return got(fn(p)); }
  catch (e) { return e.code === "ENOENT" ? got(null) : lost(`${what} (${e.code})`); }
};
const entriesAt = (p) => attempt((x) => fs.readdirSync(x), p, "it could not be listed");
const statAt = (p) => attempt((x) => fs.lstatSync(x), p, "it could not be read");
// A regular file's text. It STATS FIRST and refuses anything that is not an ordinary file, so a
// named pipe standing where a record belongs cannot block the whole listing on an open that never
// returns — the walk already knows what kind of entry it is, and so must every read.
function textAt(p) {
  const st = statAt(p);
  if (!st.ok) return st;
  if (st.value === null) return got(null);
  if (!st.value.isFile()) return lost("it is not an ordinary file");
  return attempt((x) => fs.readFileSync(x, "utf8"), p, "it could not be read");
}
function jsonAt(p) {
  const t = textAt(p);
  if (!t.ok || t.value === null) return t;
  try { return got(JSON.parse(t.value)); } catch { return lost("it is not the JSON this expects"); }
}
// Enumerating a root this cannot list yields no rows, which removes nothing; the display helpers
// below answer 0, and whether an item may GO is never decided by either of them.
const namesIn = (p) => entriesAt(p).value ?? [];
const sizeOf = (p) => { const s = statAt(p); return s.ok && s.value !== null ? s.value.size : 0; };
const mtimeOf = (p) => { const s = statAt(p); return s.ok && s.value !== null ? Math.round(s.value.mtimeMs) : 0; };
const identOf = (st) => (st === null || st === undefined ? null : `${st.dev}:${st.ino}`);
const identAt = (p) => { const s = statAt(p); return s.ok ? identOf(s.value) : null; };
// Single quotes for a shell, the only quoting that holds for every byte but `'` itself. A path is
// data; nothing this tool prints may execute when it is pasted.
const shq = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;

// The nearest existing ancestor, canonicalised, with the missing tail appended lexically. An agent's
// recorded report path may name a file the agent never wrote, and canPath answers null for it; that
// must still resolve under the run it names rather than becoming nobody's.
function canonLoose(p) {
  const direct = canonPath(p);
  if (direct !== null) return direct;
  let anchor = path.resolve(p);
  const tail = [];
  while (!fs.existsSync(anchor) && path.dirname(anchor) !== anchor) {
    tail.unshift(path.basename(anchor));
    anchor = path.dirname(anchor);
  }
  const real = canonPath(anchor);
  return real === null ? null : path.join(real, ...tail);
}

// Every component from a canonical root down to the leaf, lstat'ed, plus the identity of the
// directory that holds the leaf. Canonicalising the leaf alone accepts a symlinked PARENT that
// points the whole chain out of the root.
function chainCheck(base, parts) {
  if (base === null) return { ok: false, why: "the directory it sits in could not be read" };
  const first = statAt(base);
  if (!first.ok || first.value === null) return { ok: false, why: "the directory it sits in could not be read" };
  let p = base, st = first.value, parentSt = null;
  for (const c of parts) {
    parentSt = st;
    p = path.join(p, c);
    const next = statAt(p);
    if (!next.ok) return { ok: false, path: p, why: next.why };
    if (next.value === null) return { ok: false, path: p, why: "it is no longer there" };
    st = next.value;
    if (st.isSymbolicLink()) return { ok: false, path: p, symlink: true, why: "it is a link to another location" };
    if (!st.isDirectory()) return { ok: false, path: p, why: "it is not an ordinary directory" };
  }
  return { ok: true, path: p, st, parentSt };
}

// One pass per item: the bytes shown, the last-change time shown, and whether everything under it
// could be accounted for. Every entry is classified — a directory that can be listed, a regular file
// that can be read, a symlink (an entry, never followed) — and anything else is not something this
// can claim to have read: a file whose read is refused, a FIFO, a socket or a device leaves the walk
// INCOMPLETE, which keeps the item.
function walk(root) {
  let bytes = 0, mtimeMs = 0, complete = true, seen = 0;
  const stack = [root];
  while (stack.length) {
    if (++seen > MAX_WALK_ENTRIES) { complete = false; break; }
    const p = stack.pop();
    const s = statAt(p);
    if (!s.ok || s.value === null) { complete = false; continue; }
    const st = s.value;
    bytes += st.size;
    if (st.mtimeMs > mtimeMs) mtimeMs = st.mtimeMs;
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) {
      const names = entriesAt(p);
      if (!names.ok || names.value === null) { complete = false; continue; }
      for (const n of names.value) stack.push(path.join(p, n));
    } else if (st.isFile()) {
      // A read that permissions refuse is not "nothing there": the item holds something this never
      // saw, and deleting on that is deleting what it never read.
      try { fs.accessSync(p, fs.constants.R_OK); } catch { complete = false; }
    } else complete = false;
  }
  return { bytes, mtimeMs: Math.round(mtimeMs), complete };
}

// ---------------------------------------------------------------- roots

function resolveRoots() {
  const tmpFallback = process.env.TMPDIR === undefined ? "unset"
    : process.env.TMPDIR === "" ? "empty" : null;
  const tmpFromEnv = tmpFallback === null;
  const tmp = tmpFromEnv ? process.env.TMPDIR : os.tmpdir();
  if (!path.isAbsolute(tmp))
    die(`TMPDIR must be an absolute path when set, and it is ${JSON.stringify(tmp)}. `
      + "Nothing was deleted.");
  // The driver's rule, read without making the directory: a listing writes nothing.
  const state = process.env.ENTRUST_STATE_DIR || path.join(tmp, STATE_DIR_NAME);
  if (!path.isAbsolute(state))
    die(`ENTRUST_STATE_DIR must be an absolute path, and it is ${JSON.stringify(state)}. Nothing was deleted.`);
  let home = null;
  try { home = os.homedir(); } catch { home = null; }
  const config = process.env.CLAUDE_CONFIG_DIR || (home ? path.join(home, ".claude") : null);
  const cwd = path.resolve(process.cwd());
  const project = canonPath(cwd) ?? cwd;
  const r = {
    state, tmp, tmpSource: tmpFromEnv ? "TMPDIR" : `os.tmpdir() (TMPDIR ${tmpFallback})`,
    tmpFallback, config, project,
    projectName: path.basename(project) || project,
    projectSlug: slug(project),
    projectsDir: config === null ? null : path.join(config, "projects"),
    dataDir: config === null ? null : path.join(config, "plugins", "data"),
    S: canonPath(state), T: canonPath(tmp),
    CFG: config === null ? null : canonPath(config),
  };
  // Where each kind is ENUMERATED. Whether an item may be removed is never decided here: every chain
  // starts at the outermost canonical root — `<state>` for a run, `<config>` for a conversation — so a
  // link at `orchestrate` or at `projects` is met on the way down and keeps everything beneath it.
  r.ORCH = canonPath(path.join(state, "orchestrate"));
  r.PROJECTS = config === null ? null : canonPath(path.join(config, "projects"));
  r.DATA = config === null ? null : canonPath(path.join(config, "plugins", "data"));
  // Both spellings the orchestrate page can assign: it slugs the working directory as the shell
  // reports it, which on macOS may be the symlinked /var form of the canonical /private/var one.
  r.slugs = new Set([slug(project), slug(cwd)]);
  // Never a removal target, whatever anything says. `tmp` is not among them: the driver no longer writes
  // there, and what an earlier version left is listed like any other leftover.
  r.guards = [r.S, r.T, r.CFG, r.PROJECTS, r.DATA, r.ORCH, r.project,
              ...["answers", "jobs", "pasted", "locks", "worktrees", "home"]
                .map((n) => (r.S === null ? null : path.join(r.S, n)))].filter(Boolean);
  return r;
}

// ---------------------------------------------------------------- the process scan
//
// One question only: is a test suite running. Nothing else here asks `ps` anything, and there is
// deliberately no scan of Claude Code sessions — a closed session can be resumed and go on
// orchestrating, so session liveness proves nothing and the price of the wrong answer is a run.
function suiteScan() {
  const seam = process.env.ENTRUST_CLEANUP_PS;
  let text;
  if (seam) {
    const t = textAt(seam);
    if (!t.ok || t.value === null) return { ok: false, suites: [] };
    text = t.value;
  } else {
    const r = spawnSync("ps", ["-axo", "pid=,command="],
      { encoding: "utf8", timeout: SPAWN_TIMEOUT_MS, killSignal: "SIGKILL" });
    if (r.error || r.status !== 0) return { ok: false, suites: [] };
    text = String(r.stdout ?? "");
  }
  const suites = [];
  for (const line of text.split("\n")) {
    const m = /^\s*(\d+)\s+(.*)$/.exec(line);
    if (!m) continue;
    // `ps` joins argv with spaces, so an executable whose own path holds a space is spread over
    // several words. Every leading run of words is tried, and any of them ending in `node` is taken
    // as one: over-matching only keeps more, and missing a running suite deletes its scratch.
    const words = m[2].split(/\s+/).filter(Boolean);
    let exeIsNode = false;
    for (let k = 1; k <= words.length && !exeIsNode; k++)
      exeIsNode = path.basename(words.slice(0, k).join(" ")) === "node";
    if (!exeIsNode) continue;
    // A suite file anywhere on that command line, whatever spaces its own path holds.
    if (/(?:^|[/ ])(?:[A-Za-z0-9_.-]+\.test\.mjs|run-all\.mjs)(?:$| )/.test(m[2])) suites.push(Number(m[1]));
  }
  return { ok: true, suites: [...new Set(suites)] };
}

// ---------------------------------------------------------------- the driver's own job records
//
// A record that cannot be fully understood is IN USE, never absent: a live record whose identity
// field is null is still a live record, and a file that does not parse at all leaves this scan
// incomplete, which keeps every removable row rather than only the one it might have named.
function readJobs(state) {
  const dir = path.join(state, "jobs");
  const names = entriesAt(dir);
  // A directory this could not LIST is not an empty one. Reading the two as the same fact is how a
  // state directory whose permissions were refused became "no job records", and everything a live
  // job protected was suggested and deleted.
  if (!names.ok) return { records: [], complete: false };
  if (names.value === null) return { records: [], complete: true };
  let complete = true;
  const records = [];
  for (const n of names.value.filter((x) => x.endsWith(".json"))) {
    const rec = jsonAt(path.join(dir, n)).value;
    // A record permissions refuse, one that is not an ordinary file, and one that will not parse are
    // all records this could not read — never records that are not there.
    if (!isObj(rec)) { complete = false; continue; }
    const hasPid = Number.isInteger(rec.pid) && rec.pid >= 1;
    const paths = [rec.cwd, rec.repo]
      .filter((v) => typeof v === "string" && v !== "")
      .map((v) => canonLoose(v)).filter((v) => v !== null);
    // No pid to judge and no directory it names: the record says something this cannot read.
    if (!hasPid && paths.length === 0) { complete = false; continue; }
    records.push({ pid: hasPid ? rec.pid : null,
                   identity: typeof rec.identity === "string" ? rec.identity : null, paths,
                   live: hasPid ? !rec.endedAt && !reclaimable(rec) : true });
  }
  return { records, complete };
}

const jobHolds = (jobs, itemPath) =>
  jobs.records.some((j) => j.live && j.paths.some((p) => under(p, itemPath)));

// ---------------------------------------------------------------- inventory: the removable kinds

// One removable directory under a canonical root: the chain from the root down, then the size and
// last-change time the listing shows and whether the walk finished.
function scratchRow(kind, base, parts, fallback, extra = {}) {
  const chk = chainCheck(base, parts);
  const name = parts[parts.length - 1];
  const row = { kind, key: name, base, parts, path: chk.ok ? chk.path : fallback,
                ident: chk.ok ? identOf(chk.st) : identAt(fallback),
                bytes: 0, mtimeMs: mtimeOf(fallback), inUse: false, readable: false,
                chainOk: chk.ok, cond: chk.symlink ? "link" : "unreadable", ours: false, ...extra };
  if (!chk.ok) return row;
  const w = walk(chk.path);
  row.bytes = w.bytes; row.mtimeMs = w.mtimeMs;
  if (w.complete) { row.readable = true; row.cond = "ok"; }
  return row;
}

// The agent's first stderr line, split at the FIRST " reportPath=": the identity holds spaces on
// macOS (`lstart:Wed Sep  9 11:42:35 2026`) and a report path may hold them too, so neither part can
// be matched with \S+.
const RIGHTS_LINE = /^entrust: pid=(\d+) identity=([\s\S]*)$/;
const REPORT_MARK = " reportPath=";

// Read WHATEVER the walk found. An unreadable file deep inside decides only whether this directory
// may go; it must never cancel the record that says an agent — and the run it is writing into — is
// still alive.
function agentRecord(dirPath) {
  const t = textAt(path.join(dirPath, "err.txt"));
  // The record is there and cannot be read — refused, or a named pipe where a file belongs. A record
  // you cannot read means in use, not absent, and this cannot tell WHICH run it names, so every run
  // is kept while it stands.
  if (!t.ok) return { inUse: true, opaque: true, reportPath: null };
  const m = RIGHTS_LINE.exec((t.value ?? "").split("\n")[0]);
  if (m === null) return { inUse: true, opaque: true, reportPath: null, absent: true };
  const rest = m[2];
  const i = rest.indexOf(REPORT_MARK);
  const identity = i < 0 ? rest : rest.slice(0, i);
  const held = { pid: Number(m[1]), ...(identity === "unknown" ? {} : { identity }) };
  return { inUse: holderAlive(held), opaque: false, pid: held.pid,
           identity: identity === "unknown" ? null : identity,
           reportPath: i < 0 ? null : rest.slice(i + REPORT_MARK.length) };
}

function listAgents(roots) {
  const rows = [];
  for (const name of namesIn(roots.tmp).filter((n) => RIGHTS_RE.test(n)).sort()) {
    const row = scratchRow("agent", roots.T, [name], path.join(roots.tmp, name),
      { reportPath: null, agentName: null, pid: null, identity: null, owner: null, opaque: false });
    rows.push(row);
    if (!row.chainOk) continue;         // nothing behind a link or a non-directory is ours to read
    const rec = agentRecord(row.path);
    Object.assign(row, { inUse: rec.inUse, opaque: rec.opaque, reportPath: rec.reportPath,
                         pid: rec.pid ?? null, identity: rec.identity ?? null });
    if (rec.opaque && !rec.absent) row.readable = false;
    row.cond = rec.inUse && !rec.opaque ? "live"
      : rec.opaque && rec.absent && row.readable ? "no-record"
      : !row.readable ? "unreadable" : "stopped";
  }
  return rows;
}

// The launcher's record beside a report: `agent/` under the agent's directory, holding prompt.txt and,
// once a run started, err.txt and exit. An agent directory with no report.json used to be the driver's
// admission marker alone, so it meant "not returned yet"; since the launcher makes that directory before
// any driver runs, the marker's meaning is read from these files. An exit marker is a run that ended
// without publishing (a refusal, or a cut before the report); an err.txt names the driver, whose liveness
// decides; a prompt with neither is a --new nobody ran; no `agent/` at all is the driver's own marker.
function launcherRecord(agentDir) {
  const dir = path.join(agentDir, "agent");
  const st = statAt(dir);
  if (!st.ok) return { known: true, readable: false, inUse: true };
  if (st.value === null || !st.value.isDirectory()) return { known: false, readable: true, inUse: true };
  const ex = statAt(path.join(dir, "exit"));
  if (!ex.ok) return { known: true, readable: false, inUse: true };
  if (ex.value !== null) return { known: true, readable: true, inUse: false };
  const et = statAt(path.join(dir, "err.txt"));
  if (!et.ok) return { known: true, readable: false, inUse: true };
  if (et.value === null) return { known: true, readable: true, inUse: false };
  const rec = agentRecord(dir);
  return { known: true, readable: !rec.opaque, inUse: rec.inUse };
}

// A run's own liveness, taken from the run directory and from the agent items that name it. Separate
// from the row so a removal can take it again immediately before it acts.
function runLiveness(runPath, agents) {
  const out = { inUse: false, readable: true, agents: 0, reports: 0, plan: false, liveAgent: null,
                liveAgentItem: false, cwds: [] };
  const plan = statAt(path.join(runPath, "plan.txt"));
  if (!plan.ok) out.readable = false;
  else if (plan.value !== null) {
    out.plan = plan.value.isFile() && !plan.value.isSymbolicLink();
    if (!out.plan) out.readable = false;
  }
  const kids = entriesAt(runPath);
  if (!kids.ok || kids.value === null) out.readable = false;
  else for (const s of kids.value.sort()) {
    const sst = statAt(path.join(runPath, s));
    if (!sst.ok) { out.readable = false; continue; }
    if (sst.value === null || !sst.value.isDirectory() || sst.value.isSymbolicLink()) continue;
    out.agents++;
    const rp = path.join(runPath, s, "report.json");
    const rst = statAt(rp);
    if (!rst.ok) { out.readable = false; continue; }
    // An agent directory with no report is an unfinished marker unless the launcher's own record beside
    // it says the run ended or never started; a record that cannot be read keeps the run.
    if (rst.value === null || !rst.value.isFile()) {
      const lr = launcherRecord(path.join(runPath, s));
      if (!lr.readable) out.readable = false;
      if (!lr.readable || lr.inUse) { out.inUse = true; out.liveAgent = out.liveAgent ?? s; }
      continue;
    }
    const rec = jsonAt(rp).value;
    // A report that will not parse keeps this run, and the loop goes on: what cannot be read must
    // never end the inspection before the records that say something is still running.
    if (!isObj(rec)) { out.readable = false; continue; }
    out.reports++;
    if (typeof rec.cwd === "string" && rec.cwd !== "") out.cwds.push(rec.cwd);
  }
  // EVERY agent item that names this run, never the first: a retried agent leaves an older directory
  // behind, and taking the first match reported a run finished while the live agent writing the same
  // report was still going. An agent whose own record cannot be read names no run this can see, so it
  // keeps all of them.
  for (const s of agents) {
    if (s.inUse && s.opaque && !s.absent) { out.inUse = true; out.liveAgentItem = true; continue; }
    if (s.reportPath === null || !s.inUse) continue;
    const rp = canonLoose(s.reportPath);
    if (rp === null || !under(rp, runPath)) continue;
    out.inUse = true; out.liveAgentItem = true;
  }
  return out;
}

function listRuns(roots, agents) {
  const rows = [];
  if (roots.ORCH === null) return rows;
  for (const slugName of namesIn(roots.ORCH).sort()) {
    for (const runName of namesIn(path.join(roots.ORCH, slugName)).sort()) {
      const row = scratchRow("run", roots.S, ["orchestrate", slugName, runName],
        path.join(roots.ORCH, slugName, runName),
        { key: `${slugName}/${runName}`, run: runName, named: false, agents: 0, reports: 0, plan: false,
          liveAgent: null, liveAgentItem: false });
      rows.push(row);
      if (!row.chainOk) continue;
      const live = runLiveness(row.path, agents);
      Object.assign(row, { inUse: live.inUse, readable: row.readable && live.readable,
                           agents: live.agents, reports: live.reports, plan: live.plan, liveAgent: live.liveAgent,
                           liveAgentItem: live.liveAgentItem });
      attachTemp(roots, row);
      // The slug says which project the coordinator ran in, and a slug is never proof: `a-b` and
      // `a_b` share one. A cwd a report actually carries is the proof, and every one of them must
      // resolve under this project.
      const canon = live.cwds.map((c) => canonLoose(c));
      row.named = canon.length > 0;
      row.ours = roots.slugs.has(slugName) && row.named
        && canon.every((c) => c !== null && under(c, roots.project));
      row.cond = row.inUse ? "live" : row.readable ? "finished" : "unreadable";
    }
  }
  return rows;
}

// Standalone agents write one report.json directly below `<state>/reports/<run>`. These directories
// carry no project slug or cwd that can establish ownership, so a finished one is available only by
// its number and is never suggested. A live agent whose startup line names it protects it exactly as
// it protects an orchestrate run; an opaque live agent conservatively protects every report directory.
function agentHolds(agents, itemPath) {
  return agents.some((s) => {
    if (!s.inUse) return false;
    if (s.opaque && !s.absent) return true;
    const rp = s.reportPath === null ? null : canonLoose(s.reportPath);
    return rp !== null && under(rp, itemPath);
  });
}

function reportPublication(reportDir) {
  const st = statAt(path.join(reportDir, "report.json"));
  return { readable: st.ok,
           published: st.ok && st.value !== null && st.value.isFile() && !st.value.isSymbolicLink() };
}

function listReports(roots, agents) {
  const dir = path.join(roots.state, "reports");
  const names = entriesAt(dir);
  if (!names.ok) return { rows: [], complete: false };
  if (names.value === null) return { rows: [], complete: true };
  const rows = [];
  for (const runName of names.value.sort()) {
    const row = scratchRow("report", roots.S, ["reports", runName], path.join(dir, runName),
      { run: runName });
    rows.push(row);
    if (!row.chainOk) continue;
    attachTemp(roots, row);
    const publication = reportPublication(row.path);
    if (!publication.readable) { row.readable = false; row.cond = "unreadable"; }
    else if (!publication.published) {
      // The launcher's record beside the report decides whether an unpublished run is still being written.
      const lr = launcherRecord(row.path);
      if (!lr.readable) { row.readable = false; row.cond = "unreadable"; }
      else if (lr.inUse) { row.inUse = true; row.cond = "unreported"; }
    }
    if (agentHolds(agents, row.path)) {
      row.inUse = true;
      if (row.readable && publication.published) row.cond = "live";
    }
  }
  return { rows, complete: true };
}

// A run's temporary folder. The driver gives every run one of its own in the temporary directory, named
// after the run's report under the state directory: <tmp>/entrust/<rel> for <state>/<rel>/report.json,
// and <tmp>/entrust/runs/<startedAtMs>-<pid> for a run with none. So a run or report row at
// <state>/<parts> has its folder at <tmp>/entrust/<parts>, and the folder goes with that row: in its
// size, in the paths its number consents to, and removed right after it under the liveness just taken
// for it. A folder that cannot be read whole keeps the row.
function attachTemp(roots, row) {
  const parts = ["entrust", ...row.parts];
  const at = path.join(roots.tmp, ...parts);
  const st = statAt(at);
  if (st.ok && st.value === null) return;
  const t = scratchRow("temp", roots.T, parts, at);
  row.twin = { base: roots.T, parts, ident: t.ident };
  row.alsoPaths = [t.path];
  row.bytes += t.bytes;
  row.mtimeMs = Math.max(row.mtimeMs, t.mtimeMs);
  if (!t.readable) { row.readable = false; row.cond = "unreadable"; }
}

function artifactUse(dir, kind, agents = []) {
  if (kind === "cleanup") return "snapshot";
  if (!TEMP_KINDS.includes(kind)) return "no-record";
  const rec = jsonAt(path.join(dir, TEMP_OWNER));
  const v = rec.value;
  if (!rec.ok || !isObj(v) || v.version !== 1 || v.kind !== kind
      || !Number.isInteger(v.pid) || v.pid < 1)
    return "no-record";
  try { process.kill(v.pid, 0); return "live"; }
  catch (e) { if (e.code !== "ESRCH") return e.code === "EPERM" ? "live" : "no-record"; }
  if (kind === "agents" && v.reportPath !== null && (typeof v.reportPath !== "string" || !path.isAbsolute(v.reportPath)))
    return "no-record";
  if (kind === "agents" && v.reportPath && agentHolds(agents, canonLoose(v.reportPath) ?? v.reportPath)) return "live";
  // A stopped driver can have a child check still running, or a cleanup snapshot awaiting approval.
  const descend = (at) => {
    const kids = entriesAt(at);
    if (!kids.ok || kids.value === null) return "no-record";
    for (const name of kids.value) {
      const child = path.join(at, name), st = statAt(child);
      if (!st.ok) return "no-record";
      if (!st.value?.isDirectory() || st.value.isSymbolicLink()) continue;
      const owner = statAt(path.join(child, TEMP_OWNER));
      if (!owner.ok) return "no-record";
      const use = owner.value === null ? descend(child)
        : artifactUse(child, jsonAt(path.join(child, TEMP_OWNER)).value?.kind, agents);
      if (use !== "free") return use;
    }
    return "free";
  };
  return descend(dir);
}

function groupedRun(dir) {
  const rec = statAt(path.join(dir, TEMP_CONTEXT));
  // The generated name also protects a run before its record is published.
  return !rec.ok || rec.value !== null || PATH_KEY.test(path.basename(dir));
}

function listProjects(roots) {
  const base = path.join(roots.tmp, "entrust");
  return new Set(namesIn(base).filter((project) => PATH_KEY.test(project)
    || (chainCheck(roots.T, ["entrust", project]).ok
      && namesIn(path.join(base, project)).some((run) =>
        chainCheck(roots.T, ["entrust", project, run]).ok && groupedRun(path.join(base, project, run))))));
}

function listArtifacts(roots, owned, ps, agents, projects) {
  const rows = [];
  const category = (parts, kind) => {
    const base = path.join(roots.tmp, "entrust", ...parts);
    if (!chainCheck(roots.T, ["entrust", ...parts]).ok) return;
    for (const name of namesIn(base).sort()) {
      if (parts.length === 1 && projects.has(parts[0]) && groupedRun(path.join(base, name))) continue;
      const rel = [...parts, name];
      if (owned.has(path.join(...rel))) continue;
      const row = scratchRow("artifact", roots.T, ["entrust", ...rel], path.join(base, name),
        { category: kind, ours: true, key: rel.join("/") });
      rows.push(row);
      if (!row.chainOk) continue;
      let use = artifactUse(row.path, kind, agents);
      if (kind === "evals" && use === "free" && (!ps.ok || ps.suites.length))
        use = ps.ok ? "suite" : "no-ps";
      row.inUse = use !== "free";
      if (row.readable) row.cond = use;
    }
  };
  // Keep recognizing leaves left by the earlier type-first layout.
  for (const kind of TEMP_KINDS) category([kind], kind);
  category([".cleanup"], "cleanup");
  category(["_global", "cleanup"], "cleanup");
  const base = path.join(roots.tmp, "entrust");
  for (const project of [...projects].sort()) {
    if (!chainCheck(roots.T, ["entrust", project]).ok) continue;
    for (const run of namesIn(path.join(base, project)).sort()) {
      if (!PATH_KEY.test(project) && !groupedRun(path.join(base, project, run))) continue;
      for (const kind of TEMP_KINDS) category([project, run, kind], kind);
    }
  }
  return rows;
}

// A folder under <tmp>/entrust that no listed run or report owns is in use while the pid its name
// carries is alive (runs/<startedAtMs>-<pid>), while the run it is named after is still in the state
// directory, or while an agent's report path lies in that run.
function tempInUse(roots, m, agents) {
  if (m.parts[1] === "runs") {
    const pid = /^\d+-(\d+)$/.exec(m.parts[2] ?? "")?.[1];
    return pid === undefined ? "free" : holderAlive({ pid: Number(pid) }) ? "live" : "free";
  }
  const run = path.join(roots.S ?? roots.state, ...m.parts.slice(1));
  const st = statAt(run);
  if (!st.ok || st.value !== null) return "present";
  return agentHolds(agents, run) ? "live" : "free";
}

function listTemps(roots, owned, agents, projects) {
  const rows = [];
  const base = path.join(roots.tmp, "entrust");
  const unit = (parts) => {
    const row = scratchRow("temp", roots.T, ["entrust", ...parts], path.join(base, ...parts),
      { top: parts[0], run: parts[parts.length - 1] });
    rows.push(row);
    if (!row.chainOk) return;
    const use = tempInUse(roots, row, agents);
    if (use !== "free") { row.inUse = true; if (row.readable) row.cond = use; }
  };
  for (const top of namesIn(base).sort()) {
    if (TEMP_KINDS.includes(top) || top === "_global" || top === ".cleanup") continue;
    if (top === "orchestrate") {
      for (const s of namesIn(path.join(base, top)).sort()) {
        if (groupedRun(path.join(base, top, s))) continue;
        for (const r of namesIn(path.join(base, top, s)).sort())
          if (!owned.has(path.join(top, s, r))) unit([top, s, r]);
      }
    } else if (top === "reports" || top === "runs") {
      for (const r of namesIn(path.join(base, top)).sort())
        if (!owned.has(path.join(top, r)) && !groupedRun(path.join(base, top, r))) unit([top, r]);
    } else if (!projects.has(top) && !owned.has(top)) unit([top]);
  }
  return rows;
}

// What an earlier driver kept under <state>/tmp, one folder per run with an owner.json naming the agent.
// The driver no longer writes there; one record naming a live process, or one that cannot be read,
// keeps the whole of it.
function oldTmpInUse(dir) {
  for (const n of namesIn(dir)) {
    const st = statAt(path.join(dir, n));
    if (!st.ok) return true;
    if (st.value === null || !st.value.isDirectory()) continue;
    const rec = jsonAt(path.join(dir, n, "owner.json"));
    if (!rec.ok || (rec.value !== null && holderAlive(rec.value))) return true;
  }
  return false;
}

function listOldTmp(roots) {
  const p = path.join(roots.state, "tmp");
  const st = statAt(p);
  if (st.ok && st.value === null) return [];
  const row = scratchRow("oldtmp", roots.S, ["tmp"], p);
  if (row.chainOk && oldTmpInUse(row.path)) { row.inUse = true; if (row.readable) row.cond = "live"; }
  return [row];
}

function listEvals(roots, ps) {
  const rows = [];
  for (const name of namesIn(roots.tmp).sort()) {
    const hit = EVAL_KINDS.find(([prefix]) => name.startsWith(prefix));
    if (!hit) continue;
    const row = scratchRow("eval", roots.T, [name], path.join(roots.tmp, name),
      { evalKind: hit[1], ours: true });
    rows.push(row);
    if (!row.chainOk) continue;
    // A process listing that failed or was refused keeps every one of these: it is not a listing
    // with no suites in it. Asked whatever the walk found, for the reason agentRecord gives.
    if (!ps.ok) { row.inUse = true; if (row.readable) row.cond = "no-ps"; }
    else if (ps.suites.length) { row.inUse = true; if (row.readable) row.cond = "suite"; }
  }
  return rows;
}

function listSessions(roots) {
  const rows = [];
  if (roots.PROJECTS === null || roots.T === null) return rows;
  const prefixes = [slug(roots.tmp), slug(roots.T)];
  for (const name of namesIn(roots.PROJECTS).sort()) {
    // A slug that does not begin with the temp root's own, followed by a separator, decodes to a path
    // somewhere else; and one whose tail is of another shape is somebody's own work under the temp
    // root. Neither is this cleanup's to name, and nothing here reads outside the temp root — nothing
    // here reads the filesystem at all.
    const p = prefixes.find((x) => name.startsWith(`${x}-`));
    if (p === undefined) continue;
    const kind = SESSION_MARKS.find(([re]) => re.test(name.slice(p.length + 1)));
    if (!kind) continue;
    // Chained from the CONFIG directory, not from `projects`: `<config>/projects` replaced by a link
    // elsewhere canonicalises to that elsewhere, and a chain that started there would never meet it.
    rows.push(scratchRow("session", roots.CFG, ["projects", name],
      path.join(roots.PROJECTS, name), { sessionKind: kind[1], ours: true }));
  }
  return rows;
}

// ---------------------------------------------------------------- inventory: the reported kinds
//
// Never removable, so none of them needs liveness machinery: a name, a size and one sentence saying
// whose job the removal is.

const reported = (kind, key, p, bytes, mtimeMs, extra = {}) =>
  ({ kind, key, path: p, ident: identAt(p), bytes, mtimeMs, inUse: true, readable: true,
     cond: "reported", ours: false, base: null, parts: [], alsoPaths: [], ...extra });

function listAnswers(roots) {
  const p = path.join(roots.state, "answers");
  const st = statAt(p);
  if (!st.ok) return { rows: [], complete: false };
  if (st.value === null) return { rows: [], complete: true };
  const w = walk(p);
  return { rows: [reported("answers", "answers", p, w.bytes, w.mtimeMs,
    { readable: w.complete, cond: w.complete ? "reported" : "unreadable" })], complete: true };
}

// One row per worktree, not one per artifact: a tree and the ledger entry that tracks it are two
// files describing ONE worktree, and counting rows counted it twice.
function listWorktrees(roots) {
  const byName = new Map();
  const ledger = path.join(roots.state, "worktrees");
  for (const f of namesIn(ledger).sort()) {
    if (!f.endsWith(".json") && !f.endsWith(".json.bad")) continue;
    const name = f.replace(/\.json(\.bad)?$/, "");
    const p = path.join(ledger, f);
    // Read for a NAME and nothing else: no ledger entry decides anything here.
    const e = jsonAt(p).value;
    byName.set(name, { entry: p,
                       where: isObj(e) && typeof e.repo === "string" && e.repo !== ""
                         ? path.basename(e.repo) : null });
  }
  const treeDir = path.join(roots.project, ".claude", "worktrees");
  for (const n of namesIn(treeDir).filter((x) => WT_RE.test(x)).sort()) {
    const g = byName.get(n) ?? { entry: null, where: roots.projectName };
    g.tree = path.join(treeDir, n);
    g.where = g.where ?? roots.projectName;
    byName.set(n, g);
  }
  const rows = [];
  for (const [name, g] of [...byName.entries()].sort()) {
    const w = g.tree ? walk(g.tree) : { bytes: 0, mtimeMs: 0 };
    const entryBytes = g.entry ? sizeOf(g.entry) : 0;
    const head = g.tree ?? g.entry;
    rows.push(reported("worktree", name, head, w.bytes + entryBytes,
      Math.max(w.mtimeMs, g.entry ? mtimeOf(g.entry) : 0),
      { where: g.where, alsoPaths: [g.tree, g.entry].filter((x) => x && x !== head) }));
  }
  return rows;
}

// The driver's write lock is two entries in `<state>/locks/`: `<key>.lock`, a symbolic link created
// exclusively, and the file it names beside it, `<key>.lock.<32 hex>.owner`, holding the pid, identity,
// cwd and start of the run that holds it. A normal release removes both; a release that meets a live peer
// on the reclaim marker, a crashed run and an older driver leave the link; only a later run in the same
// directory reclaims it, and a directory nobody runs in again — every `--worktree` run has a fresh one —
// keeps it for good. A regular file at `<key>.lock` is the lock's previous shape and keeps the reported
// row it always had.
//   held      the link names an owner file whose run is alive: reported;
//   released  the link names nothing: removable, suggested;
//   abandoned the link names an owner file whose run and codex group are both gone: removable with that
//             file, by number only, since the driver reclaims it on its own next run there;
//   stray     an owner file no link names, its run gone (a crash between writing it and linking it, or
//             a link removed by hand): removable, suggested; with its run alive it is `unlinked`, reported.
// An owner file that is not a regular file, a body with no pid, a link to anything but an owner file
// beside it, a record that is not the file its lstat saw: `other`, reported, never removed.
const OWNER_RE = /^(.+\.lock)\.[0-9a-f]{32}\.owner$/;
const lockHolder = (body) => (isObj(body) && Number.isInteger(body.pid) && body.pid >= 1 ? body : null);
const cwdName = (body) => (isObj(body) && typeof body.cwd === "string" && body.cwd !== ""
  ? path.basename(body.cwd) : null);

// An owner record, read by a name relative to the pinned locks directory: opened without following a
// link and without blocking on a pipe, and parsed from that descriptor only when it is the regular file
// the lstat `st` saw. A path read by name after its lstat reads whatever stands there by then — a link
// swapped in reads a file outside the directory, and that file's pid decided what was offered.
function readRecord(name, st) {
  let fd;
  try { fd = fs.openSync(name, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK); }
  catch (e) { return e.code === "ENOENT" ? { gone: true } : e.code === "ELOOP" ? { swapped: true } : { unreadable: true }; }
  try {
    const f = fs.fstatSync(fd);
    if (!f.isFile() || f.dev !== st.dev || f.ino !== st.ino) return { swapped: true };
    let text;
    try { text = fs.readFileSync(fd, "utf8"); } catch { return { unreadable: true }; }
    try { return { body: JSON.parse(text) }; } catch { return { unparsed: true }; }
  } finally { fs.closeSync(fd); }
}

// A reported lock entry, measured from the lstat its classification used.
const shownLock = (dir, n, st, extra = {}) => reported("lock", n, path.join(dir, n),
  st.ok && st.value ? st.value.size : 0, st.ok && st.value ? Math.round(st.value.mtimeMs) : 0,
  { ident: st.ok ? identOf(st.value) : null, ...extra });
// A removable lock entry: the chain a removal walks is `<state>/locks`, and the leaf is the entry.
const lockRow = (roots, dir, n, st, form, extra = {}) =>
  ({ kind: "lock", key: n, base: roots.S, parts: ["locks", n], path: path.join(dir, n),
     ident: identOf(st.value), bytes: st.value.size, mtimeMs: Math.round(st.value.mtimeMs), inUse: false,
     readable: true, chainOk: true, cond: "ok", ours: false, alsoPaths: [], form, where: null, ...extra });

// Every read that decides a lock row is made from a handle on `<state>/locks`, pinned as a removal pins
// its parent: reached from the canonical state directory with no link on the way, entered, and compared
// by dev:ino. A locks directory that cannot be pinned so has its entries named by their names alone,
// read for nothing, and never offered.
function listLocks(roots) {
  const dir = path.join(roots.state, "locks");
  const unjudged = () => namesIn(dir).sort().map((n) => {
    const p = path.join(dir, n);
    const form = /\.lock$/.test(n) ? "lock" : /\.reclaim$/.test(n) ? "reclaim"
      : /\.(?:[0-9a-f]+\.)?r?tmp$/.test(n) ? "tmp" : "other";
    return reported("lock", n, p, sizeOf(p), mtimeOf(p), { form, where: null });
  });
  const chk = chainCheck(roots.S, ["locks"]);
  if (!chk.ok) return unjudged();
  const prev = process.cwd();
  try {
    try { process.chdir(chk.path); } catch { return unjudged(); }
    const here = statAt(".");
    if (!here.ok || here.value === null || here.value.dev !== chk.st.dev || here.value.ino !== chk.st.ino)
      return unjudged();
    return lockRows(roots, dir);
  } finally { try { process.chdir(prev); } catch { /* the old cwd is gone; nothing here needs it */ } }
}

function lockRows(roots, dir) {
  const listed = entriesAt(".");
  if (!listed.ok || listed.value === null) return [];
  const names = listed.value.sort();
  const stats = new Map(names.map((n) => [n, statAt(n)]));
  // The owner files a well-formed link names: shown with their link, never as strays.
  const named = new Set();
  const links = new Map();
  for (const n of names) {
    const st = stats.get(n);
    if (!/\.lock$/.test(n) || !st.ok || st.value === null || !st.value.isSymbolicLink()) continue;
    const t = attempt((x) => fs.readlinkSync(x), n, "it could not be read");
    links.set(n, t);
    if (t.ok && t.value !== null && OWNER_RE.exec(t.value)?.[1] === n) named.add(t.value);
  }
  const rows = [];
  for (const n of names) {
    const st = stats.get(n);
    if (links.has(n)) { rows.push(...lockLink(roots, dir, n, st, links.get(n))); continue; }
    if (OWNER_RE.test(n)) {
      const row = named.has(n) ? null : strayRecord(roots, dir, n, st);
      if (row !== null) rows.push(row);
      continue;
    }
    const form = /\.lock$/.test(n) ? "lock" : /\.reclaim$/.test(n) ? "reclaim"
      : /\.(?:[0-9a-f]+\.)?r?tmp$/.test(n) ? "tmp" : "other";
    const body = form === "lock" ? jsonAt(n).value : null;
    rows.push(shownLock(dir, n, st, { form, where: cwdName(body) }));
  }
  return rows;
}

function lockLink(roots, dir, n, st, t) {
  const shown = (form, extra = {}) => shownLock(dir, n, st, { form, ...extra });
  if (!t.ok) return [shown("other", { readable: false, cond: "unreadable" })];
  if (t.value === null) return [];                      // released and reclaimed since it was listed
  if (OWNER_RE.exec(t.value)?.[1] !== n) return [shown("other")];
  const owner = path.join(dir, t.value);
  const ost = statAt(t.value);
  if (!ost.ok) return [shown("other", { readable: false, cond: "unreadable", alsoPaths: [owner] })];
  if (ost.value === null) return [lockRow(roots, dir, n, st, "released", { target: t.value })];
  // A link where the owner file belongs is refused by the driver, and so is anything but a file.
  if (!ost.value.isFile()) return [shown("other", { alsoPaths: [owner] })];
  const rec = readRecord(t.value, ost.value);
  if (rec.gone) return [lockRow(roots, dir, n, st, "released", { target: t.value })];
  if (rec.swapped) return [shown("other", { alsoPaths: [owner] })];
  if (!("body" in rec)) return [shown("other", { readable: false, cond: "unreadable", alsoPaths: [owner] })];
  const held = lockHolder(rec.body);
  if (held === null) return [shown("other", { alsoPaths: [owner] })];
  const extra = { where: cwdName(held), alsoPaths: [owner], bytes: st.value.size + ost.value.size,
                  mtimeMs: Math.max(Math.round(st.value.mtimeMs), Math.round(ost.value.mtimeMs)) };
  if (!reclaimable(held)) return [shown("held", extra)];
  return [lockRow(roots, dir, n, st, "abandoned", { ...extra, target: t.value, ownerIdent: identOf(ost.value) })];
}

function strayRecord(roots, dir, n, st) {
  const shown = (form, extra = {}) => shownLock(dir, n, st, { form, ...extra });
  if (!st.ok) return shown("other", { readable: false, cond: "unreadable" });
  if (st.value === null) return null;
  if (!st.value.isFile()) return shown("other");
  // An owner file is created before its body is written, so an empty one may be a run that is taking
  // its lock this instant: what does not parse is kept, never judged.
  const rec = readRecord(n, st.value);
  if (rec.gone) return null;
  if (rec.swapped) return shown("other");
  if (!("body" in rec)) return shown("other", { readable: false, cond: "unreadable" });
  const held = lockHolder(rec.body);
  if (held === null) return shown("other");
  if (!reclaimable(held)) return shown("unlinked", { where: cwdName(held) });
  return lockRow(roots, dir, n, st, "stray", { where: cwdName(held) });
}

function listHome(roots) {
  const p = path.join(roots.state, "home");
  const st = statAt(p);
  if (!st.ok || st.value === null) return [];
  const w = walk(p);
  return [reported("home", "home", p, w.bytes, w.mtimeMs)];
}

// Which plugins the registry says are installed, and whether that could be established at all. A
// registry that cannot be read is not an empty one, and the row's sentence then claims nothing.
function installedIds(roots) {
  if (roots.config === null) return null;
  const rec = jsonAt(path.join(roots.config, "plugins", "installed_plugins.json")).value;
  if (!isObj(rec) || !isObj(rec.plugins)) return null;
  return new Set(Object.keys(rec.plugins).map((k) => {
    const [name, market] = k.split("@");
    return `${name}-${market ?? ""}`;
  }));
}

function listDataDirs(roots) {
  const rows = [];
  if (roots.DATA === null) return rows;
  const installed = installedIds(roots);
  for (const n of namesIn(roots.DATA).filter((x) => DATADIR_RE.test(x) || PREVIOUS_DATADIR_RE.test(x)).sort()) {
    const p = path.join(roots.DATA, n);
    const canon = canonPath(p);
    // The current state directory may legally live here; it is not another copy's data.
    if (canon !== null && roots.S !== null && (canon === roots.S || under(roots.S, canon))) continue;
    // This plugin's own former data: removable, so it carries the chain a removal walks down.
    // The previous name's directory is proposed for removal only while no plugin of that name is installed:
    // installed, it is that plugin's live data and takes the datadir row like any other copy's.
    if (PREVIOUS_DATADIR_RE.test(n) && !(installed !== null && installed.has(n))) { rows.push(scratchRow("previous", roots.DATA, [n], p)); continue; }
    const w = walk(p);
    rows.push(reported("datadir", n, p, w.bytes, w.mtimeMs,
      { installed: installed === null ? null : installed.has(n) }));
  }
  return rows;
}

// ---------------------------------------------------------------- what a human reads

const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
                      "ten", "eleven", "twelve"];
const countWord = (n) => (n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n));
const cap = (s) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
                "October", "November", "December"];

function humanBytes(b) {
  if (!Number.isFinite(b)) return "size unknown";
  if (b < 1024) return `${b} bytes`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = b / 1024, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${Math.round(v)} ${units[i]}`;
}

// Coarse on purpose: age is displayed and never consulted, so a precise figure would only invite it
// to be read as evidence.
function humanAge(ms) {
  const min = Math.floor(ms / 60000);
  if (!Number.isFinite(ms) || min < 1) return "last changed just now";
  if (min < 60) return `last changed ${min} minute${min === 1 ? "" : "s"} ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `last changed ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `last changed ${days} day${days === 1 ? "" : "s"} ago`;
}

// A collapsed row's members were left at different moments, so its middle line says the span; the
// year appears only where the two ends disagree on it.
function humanSpan(fromMs, toMs) {
  const a = new Date(fromMs), b = new Date(toMs);
  const one = (d, withYear) => `${d.getDate()} ${MONTHS[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ""}`;
  return `last changed ${one(a, a.getFullYear() !== b.getFullYear())} to ${one(b, true)}`;
}

function wrap(text, width, indent) {
  const out = [];
  let line = "";
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    if (line === "") line = word;
    else if (indent.length + line.length + 1 + word.length <= width) line += ` ${word}`;
    else { out.push(indent + line); line = word; }
  }
  if (line !== "" || out.length === 0) out.push(indent + line);
  return out;
}

function columns() {
  const seam = Number(process.env.ENTRUST_CLEANUP_COLUMNS);
  if (Number.isInteger(seam) && seam > 0) return Math.max(WIDTH_MIN, seam);
  const term = process.stdout.columns;
  return Number.isInteger(term) && term > 0 ? Math.max(WIDTH_MIN, Math.min(WIDTH_MAX, term)) : WIDTH_MAX;
}

// ---------------------------------------------------------------- names
//
// From real paths and real records, never from a slug: a slug is not reversible, so a row that has
// only one says so rather than inventing a name. Each row also carries the plural it takes when
// identical rows collapse into one.

const dateInName = (s) => {
  const m = /^(.*?)[-_]?(\d{4})-(\d{2})-(\d{2})[-_]?([\s\S]*)$/.exec(s);
  if (!m || !MONTHS[Number(m[3]) - 1]) return null;
  return { date: `${Number(m[4])} ${MONTHS[Number(m[3]) - 1]} ${m[2]}`,
           rest: `${m[1]} ${m[5]}`.replace(/[-_]+/g, " ").trim() };
};

function nameRow(roots, row) {
  const many = (f) => { row.nameMany = f; };
  switch (row.kind) {
    case "report":
      return `the standalone report from run ${JSON.stringify(row.run)}`;
    case "run": {
      // Three answers, and the third is the honest one: a slug that matches proves nothing, so a run
      // no report names is not called another project's either.
      const where = row.ours ? roots.projectName
        : row.named ? "another project" : "a project it does not name";
      const numbered = /^run-(\d+)$/.exec(row.run);
      const d = numbered ? null : dateInName(row.run);
      const what = numbered ? `run ${numbered[1]}`
        : d ? `${d.date} ${d.rest || "run"}` : `run "${row.run}"`;
      many((n) => `${n} run directories called the ${what} in ${where}`);
      return `the ${what} in ${where}`;
    }
    case "agent": {
      const where = row.ours ? ` in ${roots.projectName}` : row.owner ? " in another project" : "";
      const who = row.agentName ? `agent ${row.agentName}` : "an agent";
      many((n) => `${n} sets of temporary files for ${who}${where}`);
      return `the temporary files for ${who}${where}`;
    }
    case "eval":
      many((n) => `${n} temporary directories from ${row.evalKind}`);
      return `the temporary directory from ${row.evalKind}`;
    case "artifact": {
      const what = { checks: "check output", swarm: "swarm summary", cleanup: "cleanup snapshot",
                     evals: "test files", agents: "agent scratch" }[row.category];
      return `the ${what} in ${JSON.stringify(row.key)}`;
    }
    case "temp": {
      const of = row.top === "runs" ? "a run that wrote no report"
        : row.top === "orchestrate" ? `run ${JSON.stringify(row.run)}`
        : row.top === "reports" ? `the standalone report from run ${JSON.stringify(row.run)}`
        : `the runs under ${JSON.stringify(row.top)}`;
      many((n) => `${n} temporary folders of ${row.top === "runs" ? "runs that wrote no report" : of}`);
      return `the temporary folder of ${of}`;
    }
    case "oldtmp":
      return "the temporary folders an earlier version of the driver kept in the plugin's data";
    case "session":
      many((n) => `${n} saved conversations from ${row.sessionKind}`);
      return `the saved conversation from ${row.sessionKind}`;
    case "answers":
      many((n) => `${n} collections of answers saved by the driver`);
      return "the answers saved by the driver";
    case "worktree": {
      const where = row.where ? ` in ${row.where}` : "";
      many((n) => `${n} saved worktrees${where}`);
      return `the saved worktree${where}`;
    }
    case "lock": {
      // Each form with its own plural: the noun takes it, never the end of the phrase.
      const at = row.where ? ` for ${row.where}` : "";
      const [one, more] = {
        lock: ["write lock", "write locks"],
        held: ["held write lock", "held write locks"],
        released: ["released write lock", "released write locks"],
        abandoned: ["abandoned write lock", "abandoned write locks"],
        stray: ["stray lock record", "stray lock records"],
        unlinked: ["unlinked lock record of a running agent", "unlinked lock records of running agents"],
        reclaim: ["lock-reclaim marker", "lock-reclaim markers"],
        tmp: ["temporary lock record", "temporary lock records"],
      }[row.form] ?? ["unrecognised entry among the write locks", "unrecognised entries among the write locks"];
      many((n) => `${n} ${more}${at}`);
      return `the ${one}${at}`;
    }
    case "home":
      many((n) => `${n} shared Codex homes`);
      return "the plugin's shared Codex files";
    case "previous":
      many((n) => `${n} data directories of this plugin under its previous name, codex-delegate`);
      return "the data directory of this plugin under its previous name, codex-delegate";
    default:
      many((n) => `${n} data directories of other copies of ${PLUGIN_NAME}`);
      return row.installed === true ? `the data from an installed copy of ${PLUGIN_NAME}`
        : row.installed === false ? `the data from a copy of ${PLUGIN_NAME} that is no longer installed`
        : `the data from another copy of ${PLUGIN_NAME}`;
  }
}

// ---------------------------------------------------------------- reasons
//
// One sentence a human reads, and it has to be true of the disk. No identifier, no path, no pid and
// no status word ever appears in it.

function reasonRow(row, many) {
  switch (row.cond) {
    case "link": return "This entry is a link to another location; review the link before removing it by hand.";
    case "unreadable": return many ? "Part of them could not be read, so they are being kept."
                                   : "Part of it could not be read, so it is being kept.";
    case "records": return "Some of the plugin's own records could not be read, so nothing is suggested until they can be.";
    case "job": return "A task recorded by the plugin is still working inside it.";
    case "holds-root": return "It holds one of the plugin's own directories, so this cleanup leaves it alone.";
    default: break;
  }
  switch (row.kind) {
    case "report":
      if (row.cond === "unreported") return "An agent has not published this report yet.";
      if (row.cond === "live") return "An agent is still writing this standalone report.";
      return "The coordinator decides how long to keep this report, so it is removed only by its number.";
    case "run":
      if (row.cond === "live")
        return row.liveAgent && !row.liveAgentItem
          ? `Agent ${row.liveAgent} has not returned a report, so this run is being kept.`
          : "An agent of this run is still running.";
      // Said of what this reads and of nothing else: a run's own notes may name agents this layout
      // does not, so the sentence speaks of agent directories and reports, never of all its contents.
      return (row.agents === 0 ? row.plan ? "The approved plan remains; no agent directory sits in it"
                                      : "No agent directory sits in it; only its own files remain"
        : row.reports === 1 ? "The one agent returned its report"
        : row.reports === 2 ? "Both agents returned reports"
        : `All ${countWord(row.reports)} agents returned reports`)
        + (row.ours ? "." : row.named ? ", and its agent reports name another project."
                                      : ", and no agent report in it names a project.");
    case "agent":
      if (row.cond === "live") return many ? "The agents using these files are still running."
                                           : "The agent using these files is still running.";
      if (row.cond === "no-record") return many ? "Nothing shows whether agents are still using these files."
                                                : "Nothing here shows whether an agent is still using these files.";
      if (row.ours) return many ? "Their agents' drivers have stopped." : "The agent's driver has stopped.";
      return row.owner ? "The agent belongs to another project."
                       : "These temporary prompt files remain; their agent and project could not be identified.";
    case "temp":
      if (row.cond === "present") return many ? "Their runs are still in the plugin's data directory."
                                              : "Its run is still in the plugin's data directory.";
      if (row.cond === "live") return many ? "The runs that made them are still running."
                                           : "The run that made it is still running.";
      return row.top === "runs"
        ? (many ? "The runs that made them have stopped, and the plugin removes these folders nowhere else."
                : "The run that made it has stopped, and the plugin removes this folder nowhere else.")
        : (many ? "Their runs are gone from the plugin's data directory, and the plugin removes these folders nowhere else."
                : "Its run is gone from the plugin's data directory, and the plugin removes this folder nowhere else.");
    case "oldtmp":
      if (row.cond === "live") return "An agent started by an earlier version of the driver is still using them.";
      return "The driver no longer writes or prunes these folders, and the plugin removes them nowhere else.";
    case "eval":
      if (row.cond === "no-ps") return "The running processes could not be listed, so these need your review.";
      if (row.cond === "suite") return `${cap(row.evalKind)} are running, so these are being kept.`;
      return "No test is running, and the tests leave these behind.";
    case "artifact":
      if (row.cond === "snapshot") return "Approval may still refer to this listing, so it is being kept.";
      if (row.cond === "no-record") return "Nothing here establishes whether these files are still being used.";
      if (row.cond === "live") return "The process that made these files is still running.";
      if (row.cond === "no-ps") return "The running processes could not be listed, so these files are being kept.";
      if (row.cond === "suite") return "Tests are running, so these files are being kept.";
      return "The process that made these files has stopped.";
    case "session":
      return many ? "The tests leave these saved conversations behind."
                  : "The tests leave this saved conversation behind.";
    case "answers": return "The driver prunes these answers itself, so this cleanup never removes them.";
    case "worktree": return "The driver reconciles and removes these itself on its next worktree run.";
    case "lock":
      if (row.form === "held") return many ? "Agents working in those directories hold them; each run releases its own when it ends."
                                           : "An agent working in that directory holds it; its run releases it when it ends.";
      if (row.form === "released") return many ? "Finished runs released these locks; only their empty links remain."
                                               : "A finished run released this lock; only its empty link remains.";
      if (row.form === "abandoned") return many ? "Their agents stopped without releasing them; the driver reclaims each the next time it works in that directory."
                                                : "Its agent stopped without releasing it; the driver reclaims it the next time it works in that directory.";
      if (row.form === "stray") return many ? "No lock names these records, and the agents that wrote them have stopped."
                                            : "No lock names this record, and the agent that wrote it has stopped.";
      if (row.form === "unlinked") return many ? "No lock names these records, but the agents that wrote them are still running."
                                               : "No lock names this record, but the agent that wrote it is still running.";
      return "The driver reclaims a lock it finds abandoned when it next needs that directory.";
    case "home": return "Every agent of this plugin shares these Codex files, so this cleanup never removes them.";
    case "previous": return many ? "The plugin was renamed, and nothing writes to them any more."
                                 : "The plugin was renamed, and nothing writes to it any more.";
    default:
      return row.installed === true
        ? `This data belongs to an installed copy of ${PLUGIN_NAME}; removing it is that copy's uninstall.`
        : row.installed === false
          ? "That copy of the plugin is not installed any more; remove this data yourself."
          : "It could not be established whether that copy is still installed, so it is left alone.";
  }
}

// ---------------------------------------------------------------- collapse, select, number
//
// Rows of the same kind whose displayed name is identical are one numbered row carrying a count, a
// total size, the span of their last-change times and all their paths. A collapsed row is removable
// only when every member is, and picking its number removes every member.
function collapse(rows) {
  const out = [], byKey = new Map();
  for (const row of rows) {
    const g = byKey.get(`${row.kind} ${row.name}`);
    if (g === undefined) { const fresh = { ...row, members: [row] }; byKey.set(`${row.kind} ${row.name}`, fresh); out.push(fresh); }
    else g.members.push(row);
  }
  for (const g of out) {
    const m = g.members;
    g.count = m.length;
    // Path and identity travel together, so the snapshot binds WHICH directory was shown and not only
    // where it sat. The identity is `dev:ino` and nothing more, which bounds the claim: a filesystem
    // that recycles inode numbers hands the freed one to the next create, so a replacement that also
    // matches the name, the paths, the count, the size and BOTH ends of the time span answers to the
    // old snapshot (measured on ext4, 2026-09-10; macOS gives a new inode). The times are what makes
    // that improbable outside a test, since a replacement made in the ordinary way carries the current
    // one. This is consent, not a security boundary. evals case 39 pins it on whichever platform runs.
    const pairs = m.flatMap((x) => [[x.path, x.ident],
                                    ...(x.alsoPaths ?? []).map((p) => [p, identAt(p)])])
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    g.paths = pairs.map((x) => x[0]);
    g.ids = pairs.map((x) => x[1]);
    g.bytes = m.reduce((n, x) => n + x.bytes, 0);
    g.mtimeMs = Math.max(...m.map((x) => x.mtimeMs));
    g.mtimeMin = Math.min(...m.map((x) => x.mtimeMs));
    if (m.length === 1) continue;
    // The representative is the worst member: one in use or unreadable keeps the whole row.
    const rep = m.find((x) => x.inUse) ?? m.find((x) => !x.readable) ?? m[0];
    g.cond = rep.cond;
    g.inUse = m.some((x) => x.inUse);
    g.readable = m.every((x) => x.readable);
    g.holdsRoot = m.some((x) => x.holdsRoot);
    g.ours = m.every((x) => x.ours);
    g.name = g.nameMany(m.length);
  }
  return out;
}

function inventory(roots) {
  const ps = suiteScan();
  const jobs = readJobs(roots.state);
  // Every liveness fact FIRST, then classification: a run was once judged before the job records
  // that protect its agents were consulted, so an agent a live task held was kept while the run it
  // writes into was deleted. Protection now travels one way — from any live evidence outward to
  // everything that contains it.
  const agents = listAgents(roots);
  for (const s of agents)
    if (!s.inUse && s.chainOk && (jobHolds(jobs, s.path) || !jobs.complete)) {
      s.inUse = true; s.cond = s.readable ? (jobs.complete ? "job" : "records") : s.cond;
    }
  const runs = listRuns(roots, agents);
  const reports = listReports(roots, agents);
  const answers = listAnswers(roots);
  // Where an agent belongs: the run its report path names, else the job record naming the same pid,
  // else nobody. An agent of unknown ownership is kept, never proposed.
  for (const s of agents) {
    const rp = s.reportPath === null ? null : canonLoose(s.reportPath);
    const run = rp === null ? undefined : runs.find((r) => r.chainOk !== false && under(rp, r.path));
    if (run !== undefined) {
      s.owner = run.path;
      s.ours = run.ours;
      const rel = path.relative(run.path, rp).split(path.sep);
      if (rel.length === 2 && rel[1] === "report.json") s.agentName = rel[0];
      continue;
    }
    if (s.pid === null) continue;
    const j = jobs.records.find((r) => r.pid === s.pid && r.paths.length > 0
      && (s.identity === null || r.identity === null || r.identity === s.identity));
    if (j === undefined) continue;
    s.owner = j.paths[0];
    s.ours = j.paths.every((p) => under(p, roots.project));
  }
  const owned = new Set([...runs, ...reports.rows].filter((r) => r.twin).map((r) => path.join(...r.parts)));
  const projects = listProjects(roots);
  const rows = [...runs, ...reports.rows, ...listTemps(roots, owned, agents, projects), ...listOldTmp(roots),
                ...agents, ...listArtifacts(roots, owned, ps, agents, projects), ...listEvals(roots, ps), ...listSessions(roots),
                ...answers.rows,
                ...listWorktrees(roots), ...listLocks(roots), ...listHome(roots), ...listDataDirs(roots)];
  for (const row of rows) {
    if (row.base !== null && !row.inUse) {
      if (jobHolds(jobs, row.path)) { row.inUse = true; if (row.readable) row.cond = "job"; }
      else if (!jobs.complete && row.readable) { row.inUse = true; row.cond = "records"; }
    }
    // Refused at the removal and therefore never offered: an item that holds one of the plugin's own
    // directories was proposed, then failed. Do not suggest what will be refused.
    if (row.base !== null && roots.guards.some((g) => g === row.path || under(g, row.path))) {
      row.holdsRoot = true; row.cond = "holds-root";
    }
    row.name = nameRow(roots, row);
  }
  const listed = collapse(rows);
  for (const row of listed) {
    row.removable = !row.inUse && row.readable && row.base !== null && !row.holdsRoot;
    row.proposed = row.removable && ((row.kind === "agent" && row.ours) || row.kind === "eval"
      || row.kind === "previous" || row.kind === "temp" || row.kind === "oldtmp"
      || row.kind === "artifact"
      || (row.kind === "lock" && (row.form === "released" || row.form === "stray")));
    row.selectable = row.proposed
      || (row.removable && ((row.kind === "run" && row.ours) || row.kind === "report"
        || row.kind === "session" || (row.kind === "lock" && row.form === "abandoned")));
    row.reason = reasonRow(row, row.count > 1);
    // Said wherever the number would take it: a run's temporary folder goes with the run.
    if (row.selectable && row.members.some((x) => x.twin))
      row.reason += row.count > 1 ? " Their temporary folders go with them." : " Its temporary folder goes with it.";
  }
  listed.forEach((row, i) => { row.n = i + 1; });
  return { roots, rows: listed,
           notCovered: notCovered(roots, { reports: reports.complete, answers: answers.complete }), ps };
}

// ---------------------------------------------------------------- what this cleanup does not cover

const OUTSIDE_FIND = (tmp) => `find ${shq(tmp)} -maxdepth 1 -name 'codex-*'`
  + ` ! -name 'codex-agent.*' ! -name 'entrust-test-*' ! -name 'codex-lock-*'`
  + ` ! -name 'codex-worktree-*' ! -name 'codex-clipboard-*'`;

function notCovered(roots, covered) {
  const skip = [RIGHTS_RE, /^entrust-test-/, /^codex-lock-/, /^codex-worktree-/, /^codex-clipboard-/];
  const names = entriesAt(roots.tmp);
  // A count this could not take is `null`, never 0: the sentence then says the directory could not
  // be listed instead of claiming there is nothing outside.
  const count = names.ok && names.value !== null
    ? names.value.filter((n) => n.startsWith("codex-") && !skip.some((re) => re.test(n))).length
    : null;
  return { count, scope: "coordinator temporary directory",
           listCommand: `${OUTSIDE_FIND(roots.tmp)} -print`,
           removeCommand: `${OUTSIDE_FIND(roots.tmp)} -exec rm -rf {} +`,
           state: {
             reports: { covered: covered.reports,
                        disposition: "listed; published runs are selectable by number, unpublished runs "
                          + "are kept; never proposed" },
             answers: { covered: covered.answers,
                        disposition: "listed and kept; the driver prunes these itself" },
           } };
}

// ---------------------------------------------------------------- the listing
//
// Three logical fields per item — number and name; size, last-change time and what may be done with
// it; the reason — each wrapped to the terminal's width.
const VERDICT = (row) => (row.proposed ? "suggested for deletion"
  : row.selectable ? "say its number to delete it" : "kept");
const members = (rows) => rows.reduce((n, r) => n + r.count, 0);

function formA(inv) {
  const width = columns();
  const out = [`The current project is ${inv.roots.projectName}.`, ""];
  if (inv.roots.tmpFallback !== null)
    out.push(...wrap(`TMPDIR was ${inv.roots.tmpFallback}, so the agent scan used Node's fallback `
      + "temporary directory; agent scratch elsewhere may not have been seen.", width, ""), "");
  if (inv.rows.length === 0) out.push("Nothing this cleanup covers is on this machine.", "");
  const numWidth = Math.max(2, String(inv.rows.length).length);
  for (const row of inv.rows) {
    const lead = `${String(row.n).padStart(numWidth)}  `;
    const indent = " ".repeat(lead.length);
    const name = wrap(row.name, width, indent);
    name[0] = lead + name[0].slice(indent.length);
    out.push(...name);
    const changed = row.count > 1 && new Date(row.mtimeMin).toDateString() !== new Date(row.mtimeMs).toDateString()
      ? humanSpan(row.mtimeMin, row.mtimeMs)
      : humanAge(Date.now() - row.mtimeMs);
    out.push(...wrap(`${humanBytes(row.bytes)} · ${changed} · ${VERDICT(row)}`, width, indent));
    out.push(...wrap(row.reason, width, indent), "");
  }
  // A row may stand for many directories, so a count of rows is never presented as a count of things.
  const suggested = inv.rows.filter((r) => r.proposed);
  const sm = members(suggested), bytes = suggested.reduce((n, r) => n + r.bytes, 0);
  // A row may stand for many directories, so a count of rows is never presented as a count of things.
  const what = suggested.length === sm ? `${cap(countWord(sm))} item${sm === 1 ? "" : "s"}`
    : `${cap(countWord(suggested.length))} row${suggested.length === 1 ? "" : "s"} above, `
      + `${sm} ${suggested.some((r) => r.kind === "lock") ? "entries" : "directories"} in all,`;
  out.push(...wrap(suggested.length === 0 ? "Nothing is suggested for deletion."
    : `${what} ${sm === 1 ? "is" : "are"} suggested for deletion, `
      + `totalling about ${humanBytes(bytes)}.`, width, ""));
  const extra = inv.rows.filter((r) => r.selectable && !r.proposed);
  if (extra.length) {
    const runs = members(extra.filter((r) => r.kind === "run"));
    const reports = members(extra.filter((r) => r.kind === "report"));
    const talks = members(extra.filter((r) => r.kind === "session"));
    const locks = members(extra.filter((r) => r.kind === "lock"));
    const parts = [];
    if (runs) parts.push(`${countWord(runs)} finished run${runs === 1 ? "" : "s"} of this project`);
    if (reports) parts.push(`${countWord(reports)} standalone report${reports === 1 ? "" : "s"}`);
    if (talks) parts.push(`${countWord(talks)} saved conversation${talks === 1 ? "" : "s"} from the tests`);
    if (locks) parts.push(`${countWord(locks)} abandoned write lock${locks === 1 ? "" : "s"}`);
    // The verb follows the things; the imperative follows the NUMBERS, and where one number stands
    // for several directories the sentence says so rather than mixing the two.
    const things = runs + reports + talks + locks, oneRow = extra.length === 1;
    out.push(...wrap(`${cap(parts.join(" and "))} ${things === 1 ? "is" : "are"} listed above`
      + `${oneRow && things > 1 ? " as one row" : ""}; say ${oneRow ? "its number" : "their numbers"} `
      + `to delete ${things === 1 ? "it" : "them"}.`, width, ""));
  }
  const n = inv.notCovered.count;
  out.push(...wrap(n === null
    ? "The temporary directory could not be listed, so what lies outside this cleanup is unknown."
    : n === 0 ? "Nothing else in the temporary directory is outside this cleanup."
    : `${cap(countWord(n))} other temporary entr${n === 1 ? "y needs" : "ies need"} a separate review; `
      + "they are outside this cleanup.", width, ""));
  const unknownState = Object.entries(inv.notCovered.state).filter(([, v]) => !v.covered).map(([k]) => k);
  if (unknownState.length)
    out.push(...wrap(`The state ${unknownState.join(" and ")} director${unknownState.length === 1 ? "y" : "ies"} `
      + "could not be inspected, so artifacts there may also be outside this listing.", width, ""));
  return `${out.join("\n")}\n`;
}

// ---------------------------------------------------------------- the JSON shape

const rowJson = (row) => ({
  n: row.n, kind: row.kind, name: row.name, reason: row.reason,
  status: row.removable ? "removable" : "kept",
  selectable: row.selectable, proposed: row.proposed,
  bytes: row.bytes, mtimeMs: row.mtimeMs, mtimeMin: row.mtimeMin, count: row.count,
  paths: row.paths, ids: row.ids,
});

const listJson = (inv, text) => ({
  version: VERSION,
  roots: { state: inv.roots.state, tmp: inv.roots.tmp, tmpSource: inv.roots.tmpSource,
           config: inv.roots.config,
           project: inv.roots.project, projectName: inv.roots.projectName,
           projectSlug: inv.roots.projectSlug },
  text,
  rows: inv.rows.map(rowJson),
  proposed: inv.rows.filter((x) => x.proposed).map((x) => x.n),
  selectable: inv.rows.filter((x) => x.selectable).map((x) => x.n),
  notCovered: inv.notCovered,
  // The reported kinds whose removal is the user's own, each with the command to run. The path is
  // shell-quoted: a directory named with a command substitution is data, never something to run.
  manual: inv.rows.filter((x) => x.kind === "datadir" && x.installed !== true)
    .flatMap((x) => x.paths.map((p) => ({ name: x.name, bytes: x.bytes, path: p,
                                          command: `rm -rf ${shq(p)}` }))),
});

// ---------------------------------------------------------------- removal
//
// The order: the snapshot re-verified, the item's liveness re-taken, the chain from the kind's
// canonical root down, then the removal itself performed RELATIVE to a directory handle.
//
// Node has no unlinkat, so rmSync(absolute) re-resolves every component and an ancestor renamed
// after the check redirects it out of the root — measured. process.chdir() resolves the parent ONCE
// and pins it to that inode: a relative name is then resolved by the kernel from that handle, and no
// later rename of an ancestor can move it. The parent's dev:ino is compared after the chdir, so a
// swap DURING it is caught too.

function removeOne(roots, m) {
  if (m.kind === "lock") return removeLock(roots, m);
  // Taken again here, immediately before this member and not once for its row: an agent admitted, a
  // job record written or a suite started since the batch began must still protect what it names.
  const out = removeDir(roots, m.base, m.parts, m.ident, (p) => stillFree(roots, { ...m, path: p }));
  // A run's temporary folder goes right after the run and only then: the run's liveness, just taken, is
  // the folder's too, since only that run's agents write there. One that cannot go is said, and the next
  // listing offers it on its own.
  if (out.refused || out.failed || !m.twin) return out;
  const t = removeDir(roots, m.twin.base, m.twin.parts, m.twin.ident, (p) => walk(p).complete);
  return t.refused || t.failed ? { failed: `its temporary folder was left, since ${t.refused ?? t.failed}` } : out;
}

// One directory, from its canonical root down, removed only while `free` says so of the path it
// resolved to.
function removeDir(roots, base, parts, ident, free) {
  const chk = chainCheck(base, parts);
  if (!chk.ok) return { refused: chk.why };
  if (parts.length === 0 || chk.path === base || !under(chk.path, base))
    return { failed: "it did not resolve inside the directory it was listed from" };
  if (roots.guards.some((g) => g === chk.path || under(g, chk.path)))
    return { failed: "it holds one of this cleanup's own directories" };
  // The directory the LISTING measured, not merely a directory of that name: one taken away and
  // another put in its place between the listing and this instant is a different item, and consent
  // was given for the first — as far as `dev:ino` can tell them apart, which on a filesystem that
  // recycles inode numbers is not always (see the identity note above).
  if (ident !== null && identOf(chk.st) !== ident)
    return { refused: "it changed since it was listed" };
  if (!free(chk.path))
    return { refused: "something started using it since it was listed" };
  const leaf = parts[parts.length - 1];
  const parentPath = path.dirname(chk.path);
  const prev = process.cwd();
  try {
    try { process.chdir(parentPath); }
    catch (e) { return { failed: `the directory holding it could not be entered (${e.code})` }; }
    const here = statAt(".");
    if (!here.ok || here.value === null
        || here.value.dev !== chk.parentSt.dev || here.value.ino !== chk.parentSt.ino)
      return { refused: "the directory holding it changed while it was being removed" };
    let st;
    try { st = fs.lstatSync(leaf); } catch (e) { return { refused: `it could not be read (${e.code})` }; }
    if (st.isSymbolicLink() || !st.isDirectory()) return { refused: "it is no longer an ordinary directory" };
    if (st.dev !== chk.st.dev || st.ino !== chk.st.ino) return { refused: "it changed since it was checked" };
    let fd;
    try { fd = fs.openSync(leaf, fs.constants.O_RDONLY | fs.constants.O_DIRECTORY); }
    catch (e) { return { failed: `it could not be opened (${e.code})` }; }
    let same = false;
    try { const f = fs.fstatSync(fd); same = f.dev === st.dev && f.ino === st.ino; }
    finally { fs.closeSync(fd); }
    if (!same) return { refused: "it changed while it was being removed" };
    try { fs.rmSync(leaf, { recursive: true }); }
    catch (e) { return { failed: `access was denied (${e.code})` }; }
    // Nothing else. An emptied slug directory is left where it is: sweeping it meant removing a
    // directory the user never chose, and once the pinned parent had been renamed away the sweep
    // removed whatever now stood in its place.
    return {};
  } finally { try { process.chdir(prev); } catch { /* the old cwd is gone; nothing here needs it */ } }
}

// A lock entry is one name in `<state>/locks`, removed from a handle on that directory as a scratch
// directory is from its parent, and judged again at the last moment. A link is removed only under the
// driver's own reclaim marker, `<link>.reclaim`, taken and dropped by the driver's own functions: a run
// removes a link only under that marker and creates one only where none stands, so while the marker is
// ours no run following those rules can change the link. The marker is not ours for good — a driver
// takes one older than its backstop — so ownership and the link's target are asked again immediately
// before each unlink, and a removal that finds either changed leaves the entry and says so.
function removeLock(roots, m) {
  const chk = chainCheck(m.base, m.parts.slice(0, -1));
  if (!chk.ok) return { refused: chk.why };
  if (roots.S === null || chk.path !== path.join(roots.S, "locks"))
    return { failed: "it did not resolve inside the directory it was listed from" };
  const leaf = m.parts[m.parts.length - 1];
  const prev = process.cwd();
  try {
    try { process.chdir(chk.path); }
    catch (e) { return { failed: `the directory holding it could not be entered (${e.code})` }; }
    const here = statAt(".");
    if (!here.ok || here.value === null || here.value.dev !== chk.st.dev || here.value.ino !== chk.st.ino)
      return { refused: "the directory holding it changed while it was being removed" };
    if (m.form === "stray") return removeStray(m, leaf);
    // Twice, as the driver's release tries: a marker released between the failed link and its read
    // answers false once. The name is relative to the pinned directory, as every name here is.
    let held = false;
    for (let attempt = 0; attempt < 2 && !held; attempt++) {
      try { held = takeReclaimMarker(leaf); }
      catch (e) { return { failed: `the reclaim marker could not be taken (${e.code ?? e.message})` }; }
    }
    if (!held) return { refused: "a run is reclaiming it right now" };
    try { return removeLink(m, leaf); } finally { dropReclaimMarker(leaf); }
  } finally { try { process.chdir(prev); } catch { /* the old cwd is gone; nothing here needs it */ } }
}

// The owner record read again, from the descriptor, and whether its run and codex group are both gone.
function recordGone(name, st) {
  const rec = readRecord(name, st);
  const held = "body" in rec ? lockHolder(rec.body) : null;
  return held !== null && reclaimable(held);
}

const MARKER_TAKEN = "another process took over its reclaim marker";
function removeLink(m, leaf) {
  const st = statAt(leaf);
  if (!st.ok) return { refused: st.why };
  if (st.value === null) return { refused: "it is no longer there" };
  if (!st.value.isSymbolicLink() || identOf(st.value) !== m.ident) return { refused: "it changed since it was listed" };
  const t = attempt((x) => fs.readlinkSync(x), leaf, "it could not be read");
  if (!t.ok) return { refused: t.why };
  if (t.value !== m.target) return { refused: "it changed since it was listed" };
  const owner = statAt(m.target);
  if (!owner.ok) return { refused: owner.why };
  if (m.form === "released" && owner.value !== null)
    return { refused: "something started using it since it was listed" };
  if (m.form === "abandoned") {
    if (owner.value === null || !owner.value.isFile() || identOf(owner.value) !== m.ownerIdent)
      return { refused: "it changed since it was listed" };
    if (!recordGone(m.target, owner.value)) return { refused: "something started using it since it was listed" };
  }
  // The last look before the link goes: the marker still the file this process created (its dev:ino, not
  // the pid it carries, which anyone can write), and the link still naming the record judged above.
  if (!holdsReclaimMarker(leaf)) return { refused: MARKER_TAKEN };
  const again = attempt((x) => fs.readlinkSync(x), leaf, "it could not be read");
  if (!again.ok || again.value !== m.target) return { refused: "it changed while it was being removed" };
  // The link first, as reclaimStale does: a removal cut between the two leaves a stray record, which
  // the next listing offers, never a link naming a record that is gone while its run was not.
  try { fs.unlinkSync(leaf); }
  catch (e) { if (e.code !== "ENOENT") return { failed: `access was denied (${e.code})` }; }
  if (m.form === "abandoned") {
    // And before the record goes, the same two questions of what is left: the marker, and the record
    // being the file that was judged. Either changed, the record stays, and the next listing names it.
    if (!holdsReclaimMarker(leaf)) return { refused: `${MARKER_TAKEN} after its link went, so its record was left` };
    const rst = statAt(m.target);
    if (!rst.ok || rst.value === null || !rst.value.isFile() || identOf(rst.value) !== m.ownerIdent)
      return { refused: "its record changed while it was being removed, so the record was left" };
    try { fs.unlinkSync(m.target); }
    catch (e) { if (e.code !== "ENOENT") return { failed: `access was denied (${e.code})` }; }
  }
  return {};
}

// A stray record has no link to take a marker for. Only the run that wrote it ever links it, and that
// run is gone; the one thing that could make it a lock again is a link naming it, looked for last.
function removeStray(m, leaf) {
  const st = statAt(leaf);
  if (!st.ok) return { refused: st.why };
  if (st.value === null) return { refused: "it is no longer there" };
  if (!st.value.isFile() || identOf(st.value) !== m.ident) return { refused: "it changed since it was listed" };
  if (!recordGone(leaf, st.value)) return { refused: "something started using it since it was listed" };
  const link = OWNER_RE.exec(leaf)[1];
  const lst = statAt(link);
  if (!lst.ok) return { refused: lst.why };
  if (lst.value !== null && lst.value.isSymbolicLink()) {
    const t = attempt((x) => fs.readlinkSync(x), link, "it could not be read");
    if (!t.ok || t.value === leaf) return { refused: "something started using it since it was listed" };
  }
  try { fs.unlinkSync(leaf); }
  catch (e) { if (e.code !== "ENOENT") return { failed: `access was denied (${e.code})` }; }
  return {};
}

// Is this one member still free to go, at this instant? The facts that could make it in use are
// re-derived, not read from the inventory the listing built.
function stillFree(roots, m) {
  const jobs = readJobs(roots.state);
  if (!jobs.complete || jobHolds(jobs, m.path)) return false;
  if (!walk(m.path).complete) return false;
  // A saved conversation has no liveness of its own, and neither has a data directory this plugin
  // stopped writing to when it was renamed.
  if (m.kind === "session" || m.kind === "previous") return true;
  // The process listing too, and per member: a suite that started while an earlier member of the
  // same row was being removed protects every member that has not gone yet.
  if (m.kind === "eval") { const ps = suiteScan(); return ps.ok && ps.suites.length === 0; }
  if (m.kind === "artifact") {
    const agents = listAgents(roots);
    for (const s of agents) if (!s.inUse && s.chainOk && jobHolds(jobs, s.path)) s.inUse = true;
    if (artifactUse(m.path, m.category, agents) !== "free") return false;
    if (m.category !== "evals") return true;
    const ps = suiteScan();
    return ps.ok && ps.suites.length === 0;
  }
  if (m.kind === "agent") {
    const rec = agentRecord(m.path);
    return !rec.inUse && !rec.opaque;
  }
  if (m.kind === "oldtmp") return !oldTmpInUse(m.path);
  // A run is protected by an agent, and an agent by a job record, so the job records have to reach the
  // agents before the run is judged — the same order the listing itself uses.
  const agents = listAgents(roots);
  for (const s of agents) if (!s.inUse && s.chainOk && jobHolds(jobs, s.path)) s.inUse = true;
  if (m.kind === "temp") return tempInUse(roots, m, agents) === "free";
  if (m.kind === "report") {
    const publication = reportPublication(m.path);
    return publication.readable && publication.published && !agentHolds(agents, m.path);
  }
  const live = runLiveness(m.path, agents);
  return !live.inUse && live.readable;
}

function removeRow(roots, row) {
  let removed = 0;
  const refusals = [], failures = [];
  for (const m of row.members) {
    const out = removeOne(roots, m);
    if (out.refused) refusals.push(out.refused);
    else if (out.failed) failures.push(out.failed);
    else removed++;
  }
  return { removed, refusals, failures };
}

// ---------------------------------------------------------------- --delete

const SNAP_FIELDS = ["kind", "name", "status", "bytes", "mtimeMs", "mtimeMin", "count"];

function readSnapshot(roots, p) {
  const t = textAt(p);
  if (!t.ok || t.value === null) die(`the listing file ${p} could not be read; nothing was deleted.`);
  let snap = null;
  try { snap = JSON.parse(t.value); } catch { snap = null; }
  if (!isObj(snap) || !Array.isArray(snap.rows) || !isObj(snap.roots))
    die("that file is not a listing this cleanup wrote; nothing was deleted. Run the listing again.");
  if (snap.version !== VERSION)
    die("that listing was written by a different version of this cleanup; nothing was deleted. "
      + "Run the listing again.");
  for (const k of ["state", "tmp", "project"])
    if (snap.roots[k] !== roots[k])
      die("that listing was written for a different project or state directory; nothing was "
        + "deleted. Run the listing again.");
  const byN = new Map();
  for (const row of snap.rows) if (isObj(row) && Number.isInteger(row.n)) byN.set(row.n, row);
  return byN;
}

const sameList = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length
  && a.every((v, i) => v === b[i]);
const sameRow = (want, have) => SNAP_FIELDS.every((k) => want[k] === have[k])
  && sameList(want.paths, have.paths) && sameList(want.ids, have.ids);

function runDelete(roots, snapPath, numbers) {
  const snap = readSnapshot(roots, snapPath);
  const said = [];
  // ONE inventory, and every number answered from it before anything is removed. Taking a fresh one
  // per number made the ORDER the user typed decide the outcome: removing a run renamed the agent that
  // pointed into it, and the agent's own number was then refused as changed. Freshness is not what an
  // inventory is for — stillFree() re-takes every liveness fact immediately before each member.
  const inv = inventory(roots);
  const plan = [];
  const seen = new Set();
  let refused = 0, failed = 0;
  for (const n of numbers) {
    if (seen.has(n)) continue;
    seen.add(n);
    const want = snap.get(n);
    if (want === undefined) {
      refused++;
      said.push("One of the numbers you gave is not in the listing you sent, so I left everything it "
        + "might have meant in place. List again before choosing.");
      continue;
    }
    // Found by WHAT it is, never by its number: one row per kind and name is what collapse
    // guarantees, and sameRow then checks the rest.
    const row = inv.rows.find((r) => r.kind === want.kind && r.name === want.name);
    if (row === undefined || !sameRow(want, rowJson(row))) {
      refused++;
      said.push(`I left ${want.name ?? "one of the items you chose"} in place because it changed `
        + "since it was listed. List again before choosing.");
      continue;
    }
    if (!row.selectable) {
      refused++;
      said.push(`I left ${row.name} in place because it is not one of the items you can choose. `
        + "The listing says why it is being kept.");
      continue;
    }
    plan.push(row);
  }
  for (const row of plan) {
    const out = removeRow(roots, row);
    const part = (k) => (k === row.count ? row.name : `${k} of ${row.name}`);
    if (out.removed > 0) said.push(`I deleted ${part(out.removed)}.`);
    if (out.refusals.length) {
      refused++;
      said.push(`I left ${part(out.refusals.length)} in place because ${out.refusals[0]}. `
        + "List again before choosing.");
    }
    if (out.failures.length) {
      failed++;
      said.push(`I could not remove ${part(out.failures.length)} because ${out.failures[0]}. `
        + "Check it by hand before trying again.");
    }
  }
  const width = columns();
  const lines = [];
  for (const s of said) lines.push(...wrap(s, width, ""), "");
  // The proof is in the same shape the user consented on, one blank line below the outcomes.
  process.stdout.write(`${lines.join("\n")}${lines.length ? "\n" : ""}${formA(inventory(roots))}`);
  // 10 outranks 1: a refusal is a decision this made, a failure is one it could not carry out.
  return refused ? EXIT.BUSY : failed ? EXIT_FAILED : EXIT.SUCCESS;
}

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const o = { list: false, del: false, json: false, from: null, numbers: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--list") o.list = true;
    else if (a === "--delete") o.del = true;
    else if (a === "--json") o.json = true;
    else if (a === "--from") {
      const v = argv[++i];
      if (v === undefined || v === "" || v.startsWith("--")) die("--from needs the listing file to read.");
      o.from = v;
    } else if (a === "-h" || a === "--help") { process.stdout.write(USAGE); return null; }
    else if (a.startsWith("--")) die(`unknown argument: ${a}`);
    else if (/^[1-9][0-9]*$/.test(a)) o.numbers.push(Number(a));
    else die(`${JSON.stringify(a)} is not a number from the listing; nothing was deleted.`);
  }
  if (o.list && o.del) die("--list and --delete are two different calls; pass one of them.");
  if (!o.list && !o.del) die("nothing to do: pass --list, or --delete with the numbers the user chose.");
  if (o.list && (o.numbers.length || o.from !== null)) die("--list takes no numbers and no --from.");
  if (o.del && o.from === null) die("--delete needs --from <listing.json>, the file --list --json wrote.");
  if (o.del && o.numbers.length === 0) die("--delete needs the numbers the user chose.");
  if (o.del && o.json) die("--delete prints the fresh listing itself; --json is for --list.");
  return o;
}

function main(argv) {
  const opts = parseArgs(argv);
  if (opts === null) return EXIT.SUCCESS;
  const roots = resolveRoots();
  if (opts.del) return runDelete(roots, opts.from, opts.numbers);
  const inv = inventory(roots);
  const text = formA(inv);
  // The same text, byte for byte, in both shapes: the block a coordinator shows and the numbers it
  // submits then come from one inventory.
  process.stdout.write(opts.json ? `${JSON.stringify(listJson(inv, text), null, 2)}\n` : text);
  return EXIT.SUCCESS;
}

// Imported by the suite for its constants; a direct invocation is the only thing that runs main.
const RUN_AS_MAIN = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  if (import.meta.url === pathToFileURL(entry).href) return true;
  try { return import.meta.url === pathToFileURL(fs.realpathSync(entry)).href; } catch { return false; }
})();

export { EVAL_KINDS, PLUGIN_NAME, RIGHTS_RE, SESSION_MARKS, WIDTH_MAX, WIDTH_MIN };

if (RUN_AS_MAIN) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (e) {
    if (!(e instanceof Usage)) throw e;
    process.stderr.write(`cleanup: ${e.message}\n`);
    process.exitCode = EXIT.USAGE;
  }
}
