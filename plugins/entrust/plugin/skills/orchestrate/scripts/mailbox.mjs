// The approval mailbox, the driver's side. The launcher's --new makes one per agent, DIR/approvals, and hands
// it to the driver as --approval-dir. It holds:
//   <id>.request.json  one per request the driver offers, rewritten once with `settled` when it ends;
//   pending            the ids still open, one per line, absent when none is;
//   <id>.decision.json what the launcher's --decide publishes, and nothing else writes.
// Every driver offers, reads and settles through this module. How a decision becomes the CLI's answer is each
// adapter's own; the rule they share is that the record comes first: an accept the request file does not hold
// is answered decline, since nobody could later see that it ran.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { canonical } from "./drivers.mjs";

// How long a request waits for a decision before it is declined as expired: three times the coordinator's
// longest blind spot. ENTRUST_APPROVAL_TIMEOUT_S, in seconds, is the suites' seam.
export const DEADLINE_MS = 30 * 60 * 1000;
export function deadlineMs(env = process.env) {
  const seam = Number(env.ENTRUST_APPROVAL_TIMEOUT_S);
  return seam > 0 ? seam * 1000 : DEADLINE_MS;
}

// A request id: the request's sequence number in its run and eight hex digits. It is also a file name, so
// nothing else in the mailbox may match it.
export const REQUEST_ID = /^\d+-[0-9a-f]{8}$/;
export const requestId = (seq, rand = crypto.randomBytes) => `${seq}-${rand(4).toString("hex")}`;

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

// Why `box` may not be a mailbox, or null. It must lie strictly inside the state directory, since no write
// root may be, hold or lie inside that directory (drivers.mjs writeRootProblem): no agent can then write a
// decision into it.
export const mailboxProblem = (box, stateDir) => (insideByInode(path.dirname(canonical(box)), stateDir) ? null
  : `--approval-dir ${box} is not inside the state directory ${stateDir}: anywhere else an agent could write a decision into it`);

// Whether decision `d` is the one --decide published for request `q`: q's own id and run (pid, start and turn),
// one of the decisions q takes, and for a typed request its hash and remote identity as q recorded them.
export function decisionFits(d, q, decisions = ["accept", "decline"]) {
  return Boolean(d) && d.id === q.id && d.run?.pid === q.run?.pid && d.run?.startedAtMs === q.run?.startedAtMs
    && (d.run?.turnId ?? null) === (q.run?.turnId ?? null) && decisions.includes(d.decision)
    && (q.requestHash === undefined || d.requestHash === q.requestHash)
    && (q.remote === undefined || JSON.stringify(d.remote) === JSON.stringify(q.remote));
}

// One run's mailbox. Each write is whole: a temporary file renamed over the name, mode 0600.
export function openMailbox(dir) {
  const open = new Set();
  const write = (name, text) => {
    const tmp = path.join(dir, `.${name}.${crypto.randomBytes(8).toString("hex")}.tmp`);
    try {
      fs.writeFileSync(tmp, text, { mode: 0o600 });
      fs.renameSync(tmp, path.join(dir, name));
    } finally { fs.rmSync(tmp, { force: true }); }
  };
  const writeRequest = (q) => write(`${q.id}.request.json`, `${JSON.stringify(q, null, 2)}\n`);
  const writePending = () => {
    if (open.size) write("pending", [...open].map((id) => `${id}\n`).join(""));
    else fs.rmSync(path.join(dir, "pending"), { force: true });
  };
  return {
    dir,
    isOpen: (q) => open.has(q.id),
    // Writes the request and lists it in `pending`. Throws when either cannot be written: a request nobody can
    // see would wait for a decision that cannot come, so the caller settles it at once and declines it.
    offer(q) {
      writeRequest(q);
      open.add(q.id);
      try { writePending(); } catch (e) { open.delete(q.id); throw e; }
    },
    // What q's decision file holds: { state: "none" }, { state: "stale" } for one that is not q's, or
    // { state: "valid", d }. A stale one is left where it is.
    decision(q, decisions) {
      let raw;
      try { raw = fs.readFileSync(path.join(dir, `${q.id}.decision.json`), "utf8"); } catch { return { state: "none" }; }
      let d = null;
      try { d = JSON.parse(raw); } catch {}
      return decisionFits(d, q, decisions) ? { state: "valid", d } : { state: "stale" };
    },
    // Settles q: its record first, then `pending`. Returns whether the record now holds the settlement; when it
    // does not, an accept is answered decline.
    settle(q, settled) {
      q.settled = settled;
      open.delete(q.id);
      let recorded = true;
      try { writeRequest(q); } catch { recorded = false; }
      try { writePending(); } catch {}
      return recorded;
    },
    // Rewrites a settled request, for what became of its answer. Returns whether it was written.
    rewrite(q) {
      try { writeRequest(q); return true; } catch { return false; }
    },
  };
}
