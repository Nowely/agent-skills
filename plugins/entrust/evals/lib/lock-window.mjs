// Copies of a driver with pauses in its lock code, for the suite that lands a peer's file in a window
// (E44). instrumentLockWindow pauses updateLock and releaseLock; instrumentMarkerTakeover pauses
// takeReclaimMarker.
//
// The pause lives in the copy and never in the shipped driver. It is placed by text, in each of the two
// functions. A driver that checks its owner file (ownerFileIsOurs) is paused just before that check,
// which it makes under the reclaim marker in the release: no run that honours the marker can land between
// the check and the unlinks after it, so the last point a peer can land is before the check. A driver
// without that check (the ones before E44) is paused before its single rename or unlink of the lock, which
// comes right after its final ownership read. When the text shows neither shape exactly once, the copy is
// refused with the function's name, so a changed driver fails the case aloud instead of running unpaused.
// The copy runs from anywhere because the driver imports node: builtins only.
//
// The pause is a handshake, not a delay: the driver writes <lock>.window and waits for
// <lock>.window.go, and removes both when it goes on. A case reads a `.go` still present after the run
// as a pause that timed out before the peer was in place.

import fs from "node:fs";
import path from "node:path";
import { tempDir } from "./harness.mjs";

export const WINDOW_ENV = "ENTRUST_TEST_LOCK_WINDOW";
export const windowMark = (lock) => `${lock}.window`;
export const windowAck = (lock) => `${windowMark(lock)}.go`;

const FUNCTIONS = { update: "updateLock", release: "releaseLock" };
const CHECK = /\bownerFileIsOurs\(/g;
// The act on the lock in a driver without the check: a rename or an unlink whose target is the lock
// path, in the spellings those drivers used. A read of the lock does not match.
const ACT = /(?:fs\.(?:renameSync|rmSync|unlinkSync)|renameOver)\((?:tmp, )?lock(?:Owner)?Path\b/g;
const PAUSE = `
function __lockWindow(phase) {
  if (process.env.${WINDOW_ENV} !== phase) return;
  const mark = \`\${lockPath}.window\`, ack = \`\${mark}.go\`;
  fs.writeFileSync(mark, phase);
  for (const end = Date.now() + 20000; !fs.existsSync(ack) && Date.now() < end; )
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
  fs.rmSync(ack, { force: true });
  fs.rmSync(mark, { force: true });
}
`;

// Returns the path of the instrumented copy of `source`, in a temporary directory removed on exit.
export function instrumentLockWindow(source) {
  let text = fs.readFileSync(source, "utf8");
  for (const [phase, fn] of Object.entries(FUNCTIONS)) {
    const start = text.indexOf(`\nfunction ${fn}(`);
    const end = start < 0 ? -1 : text.indexOf("\n}\n", start);
    if (end < 0) throw new Error(`${source} has no function ${fn} to pause`);
    const body = text.slice(start, end);
    const checks = [...body.matchAll(CHECK)];
    if (checks.length > 1) throw new Error(`${fn} in ${source} checks its owner file ${checks.length} times where the pause expects one`);
    if (checks.length === 1) {
      // The callee is wrapped, not the statement, so the pause survives `!` and `if (` in front of it.
      const at = start + checks[0].index;
      text = `${text.slice(0, at)}(__lockWindow("${phase}"), ownerFileIsOurs)${text.slice(at + "ownerFileIsOurs".length)}`;
      continue;
    }
    const acts = [...body.matchAll(ACT)];
    if (acts.length !== 1)
      throw new Error(`${fn} in ${source} shows no owner check and ${acts.length} acts on the lock where the pause expects one`);
    const at = start + acts[0].index;
    text = `${text.slice(0, at)}__lockWindow("${phase}"), ${text.slice(at)}`;
  }
  const first = text.indexOf(`\nfunction ${FUNCTIONS.update}(`);
  text = `${text.slice(0, first)}${PAUSE}${text.slice(first)}`;
  const copy = path.join(tempDir("entrust-lock-window-"), "driver.mjs");
  fs.writeFileSync(copy, text);
  return copy;
}

// The reclaim marker's code, paused at named points for runs told apart by ENTRUST_TEST_MARKER_TAG, each
// once per run, with the same handshake, on <lock>.reclaim.<tag>.<point>. ENTRUST_TEST_MARKER_POINTS
// names the points a run pauses at (all when unset). The points:
//   judged     in takeReclaimMarker, after the marker was found abandoned, before it is moved or removed;
//   restoring  in takeReclaimMarker, before a moved marker that was not the one judged is linked back
//              (absent from drivers that never move one);
//   holding    in takeReclaimMarker, right after this run created its marker;
//   acting     in reclaimStale, immediately before the stale lock is unlinked;
//   dropping   in dropReclaimMarker, before the marker is removed or moved away.
// A driver whose text does not show a required point exactly once (holding: at least once) is refused.
export const MARKER_ENV = "ENTRUST_TEST_MARKER_TAG";
export const MARKER_POINTS_ENV = "ENTRUST_TEST_MARKER_POINTS";
export const markerMark = (lock, tag, point) => `${lock}.reclaim.${tag}.${point}`;
const POINTS = [
  { point: "judged", fn: "takeReclaimMarker", re: /fs\.(?:rmSync|renameSync)\(rp\b/g, at: "before", count: [1, 1] },
  { point: "restoring", fn: "takeReclaimMarker", re: /fs\.linkSync\(moved, rp\)/g, at: "before", count: [0, 1] },
  { point: "holding", fn: "takeReclaimMarker", re: /fs\.linkSync\(tmp, rp\)/g, at: "after", count: [1, Infinity] },
  { point: "acting", fn: "reclaimStale", re: /fs\.unlinkSync\(p\)/g, at: "before", count: [1, 1] },
  { point: "dropping", fn: "dropReclaimMarker", re: /fs\.(?:rmSync|renameSync)\(rp\b/g, at: "before", count: [1, 1] },
];
const MARKER_PAUSE = `
const __markerPaused = new Set();
function __markerPause(lock, point) {
  const tag = process.env.${MARKER_ENV}, only = process.env.${MARKER_POINTS_ENV};
  if (!tag || __markerPaused.has(point) || (only && !only.split(",").includes(point))) return;
  __markerPaused.add(point);
  const mark = \`\${lock}.reclaim.\${tag}.\${point}\`, ack = \`\${mark}.go\`;
  fs.writeFileSync(mark, String(process.pid));
  for (const end = Date.now() + 20000; !fs.existsSync(ack) && Date.now() < end; )
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
  fs.rmSync(ack, { force: true });
  fs.rmSync(mark, { force: true });
}
`;
export function instrumentMarkerTakeover(source) {
  let text = fs.readFileSync(source, "utf8");
  for (const { point, fn, re, at, count: [min, max] } of POINTS) {
    const start = text.indexOf(`\nfunction ${fn}(`);
    const end = start < 0 ? -1 : text.indexOf("\n}\n", start);
    if (end < 0) throw new Error(`${source} has no function ${fn} to pause`);
    let body = text.slice(start, end);
    const n = [...body.matchAll(re)].length;
    if (n < min || n > max) throw new Error(`${fn} in ${source} shows ${n} places for the pause "${point}" where it expects ${min === max ? min : `${min} to ${max}`}`);
    body = at === "before"
      ? body.replace(re, (m) => `__markerPause(p, "${point}"), ${m}`)
      : body.replace(re, (m) => `(${m}, __markerPause(p, "${point}"))`);
    text = `${text.slice(0, start)}${body}${text.slice(end)}`;
  }
  const first = text.indexOf("\nfunction takeReclaimMarker(");
  text = `${text.slice(0, first)}${MARKER_PAUSE}${text.slice(first)}`;
  const copy = path.join(tempDir("entrust-marker-takeover-"), "driver.mjs");
  fs.writeFileSync(copy, text);
  return copy;
}
