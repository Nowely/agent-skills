#!/usr/bin/env node
// Runs one check with its whole output in a log under $TMPDIR, and prints only its tail and its exit.
//
//   node capture-check.mjs [--lines N] [--label TEXT] [--ledger FILE] -- '<command>'
//   node capture-check.mjs --summary --ledger FILE
//   node capture-check.mjs --help
//
// Why a script and not a sentence: the orchestrate page asked the coordinator to redirect its own checks
// into a file and read back a short tail, and the floods still came (#15 F9: 64, 31 and 23 MB of inline
// output in three sessions), and a `| tail` written to bound one returned tail's status, not the check's
// (#15 F10: a failing suite read as exit 0). Here the bound and the exit do not depend on the command
// being written well: everything goes to the log, the tail is capped, and the command runs under
// pipefail, so a pipeline's status is its failing stage's.
//
// The receipt lines are what the coordinator's context is charged for, so they are few and fixed, and the
// ledger is what lets a run count them afterwards (#15 F21, F15: inline work was never priced, and
// "bounded" was never a number).

import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTempDir } from "./temp-dir.mjs";

// The page's bound is twenty lines read back in all: five of them are this script's own (LABEL, LOG,
// LINES, BYTES, EXIT), so the tail is fifteen at most.
export const READ_BACK = 20;
export const META_LINES = 5;
export const MAX_LINES = READ_BACK - META_LINES;
export const DEFAULT_LINES = MAX_LINES;
export const CLIP = 200;

const USAGE = `capture-check — run one check; its whole output goes to a log, its tail and exit come back.

  node capture-check.mjs [--lines N] [--label TEXT] [--ledger FILE] -- '<command>'
  node capture-check.mjs --summary --ledger FILE

The words after -- are joined with spaces into one command line and run by
\`bash -o pipefail -c\`, so a pipeline's status is its failing stage's and a
\`| tail\` of your own cannot hide a failure. Its stdout and stderr go, merged
in the order written, into a new file under <temp>/entrust/checks/check-<random>/:
check-<label>.<random>.log, mode 0600; the directory is 0700. <temp> is
Node's os.tmpdir(). None of it is printed but the tail,
so a pipe into head or tail is never needed; under pipefail a producer that
head cuts off exits 141 (SIGPIPE), and that is the status reported.

Printed, in this order, and nothing else: ${READ_BACK} lines at most in all,
${META_LINES} of them the receipt's own.
  LABEL=<the question the check answers: --label, else the command itself>
  LOG=<absolute path of the log>
  LINES=<lines in the log>
  BYTES=<bytes in the log>
  <the last N lines of the log, N from --lines, default ${DEFAULT_LINES}, at most ${MAX_LINES};
   each line clipped to ${CLIP} characters with the bytes cut counted, a
   carriage-return overwrite shown as its last state>
  EXIT=<status>              always the last line of a run: the command's exit
                             status, or "signal <NAME>" when a signal ended it

Exit status: the command's own; 128 + the signal number when a signal ended
it; 2 when nothing ran. A refusal prints ERROR=<reason> as its last line and
runs nothing: a bad flag, no command, --lines above ${MAX_LINES}, no bash.

--label TEXT   the one question this command answers, in a few words ("suite
               passes", "slug exported"). It names the log and the receipt.
--ledger FILE  append this run's receipt to FILE as one JSON line: label, log,
               lines, bytes, shownLines, shownBytes (what this call printed),
               exit, at. A label FILE already holds is a second command on the
               same question: it is refused with ERROR=, recorded in FILE as
               refused, and nothing runs; send that question to an agent.
--summary      read FILE and print CHECKS=, REFUSED=, LINES_LOGGED=,
               BYTES_LOGGED=, LINES_SHOWN=, BYTES_SHOWN=, one
               QUESTION=<runs> <refused> <label> line per label, and
               LATER_READS=unknown: what a shown tail costs is its size times
               the calls after it, and only the session transcript holds
               those.

A signal to this script (SIGTERM, SIGINT, SIGHUP) is passed to the command,
and the lines above are still printed. Writes nothing but the log and FILE.
`;

function parse(argv) {
  const o = { lines: DEFAULT_LINES, label: null, ledger: null, summary: false, help: false, command: null, error: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--") { o.command = argv.slice(i + 1).join(" "); break; }
    if (a === "--help" || a === "-h") o.help = true;
    else if (a === "--summary") o.summary = true;
    else if (a === "--lines" || a === "--label" || a === "--ledger") {
      const v = argv[++i];
      if (v === undefined) { o.error = `${a} needs a value`; break; }
      if (a === "--lines") {
        if (!/^\d+$/.test(v) || Number(v) < 1) { o.error = `--lines ${v}: a whole number from 1 to ${MAX_LINES}`; break; }
        if (Number(v) > MAX_LINES) { o.error = `--lines ${v}: at most ${MAX_LINES} tail lines, ${READ_BACK} with the receipt, are read back; read the log for more, or send the question to an agent`; break; }
        o.lines = Number(v);
      } else if (a === "--label") o.label = v;
      else o.ledger = path.resolve(v);
    } else { o.error = `unknown argument ${JSON.stringify(a)}; the command goes after --`; break; }
  }
  return o;
}

const slugOf = (label) => (label.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "check");

export function readLedger(file) {
  let text = "";
  try { text = fs.readFileSync(file, "utf8"); } catch { return []; }
  const out = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch {}
  }
  return out;
}

const appendLedger = (file, receipt) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(receipt)}\n`, { mode: 0o600 });
};

// One forward pass over the log: it counts the lines and keeps, for the last n of them, the first HEAD
// bytes and the length. A 64 MB flood, or one line of that size, is the case this exists for, and no step
// holds more of it than that.
const HEAD = 1024;
function logShape(file, n) {
  const fd = fs.openSync(file, "r");
  try {
    const size = fs.fstatSync(fd).size;
    const buf = Buffer.alloc(1 << 16);
    const ring = [];
    let lines = 0, head = [], headLen = 0, len = 0;
    const take = (slice) => {
      if (headLen < HEAD) {
        const part = slice.subarray(0, HEAD - headLen);
        head.push(Buffer.from(part));
        headLen += part.length;
      }
      len += slice.length;
    };
    const endLine = () => {
      ring.push({ head: Buffer.concat(head), len });
      if (ring.length > n) ring.shift();
      lines++;
      head = []; headLen = 0; len = 0;
    };
    for (let pos = 0; pos < size;) {
      const got = fs.readSync(fd, buf, 0, buf.length, pos);
      if (got <= 0) break;
      pos += got;
      let from = 0;
      for (let nl = buf.indexOf(10, from); nl !== -1 && nl < got; nl = buf.indexOf(10, from)) {
        take(buf.subarray(from, nl));
        endLine();
        from = nl + 1;
      }
      if (from < got) take(buf.subarray(from, got));
    }
    if (len > 0) endLine();
    const tail = ring.map(({ head: h, len: total }) => {
      let text = h.toString("utf8");
      if (text.includes("\r")) text = text.split("\r").filter((x) => x !== "").pop() ?? "";
      const shown = text.length > CLIP ? text.slice(0, CLIP) : text;
      const rest = total - Buffer.byteLength(shown);
      return rest > 0 && (text.length > CLIP || total > h.length) ? `${shown} …(+${rest} bytes)` : shown;
    });
    return { lines, bytes: size, tail };
  } finally { fs.closeSync(fd); }
}

function summary(file) {
  const rs = readLedger(file);
  const ran = rs.filter((r) => !r.refused);
  const sum = (k) => ran.reduce((n, r) => n + (Number(r[k]) || 0), 0);
  const by = new Map();
  for (const r of rs) {
    const q = by.get(r.label) ?? { runs: 0, refused: 0 };
    if (r.refused) q.refused++; else q.runs++;
    by.set(r.label, q);
  }
  const out = [
    `LEDGER=${file}`,
    `CHECKS=${ran.length}`,
    `REFUSED=${rs.length - ran.length}`,
    `LINES_LOGGED=${sum("lines")}`,
    `BYTES_LOGGED=${sum("bytes")}`,
    `LINES_SHOWN=${sum("shownLines")}`,
    `BYTES_SHOWN=${sum("shownBytes")}`,
    ...[...by].map(([label, q]) => `QUESTION=${q.runs} ${q.refused} ${label}`),
    "LATER_READS=unknown",
  ];
  process.stdout.write(`${out.join("\n")}\n`);
}

function refuse(why) {
  process.stdout.write(`ERROR=${why}\n`);
  process.exit(2);
}

function run(o) {
  // One line, whatever the command's shape: a newline in the label would be a line the bound does not count.
  const label = (o.label ?? o.command).replace(/\s*\n\s*/g, " ").trim();
  if (o.ledger) {
    const prior = readLedger(o.ledger).filter((r) => r.label === label && !r.refused).length;
    if (prior > 0) {
      appendLedger(o.ledger, { label, refused: true, at: new Date().toISOString() });
      refuse(`"${label}" already ran ${prior} time${prior === 1 ? "" : "s"} in this ledger: a second command on the same question goes to an agent`);
    }
  }
  let dir;
  try { dir = createTempDir("checks", "check-"); }
  catch (e) { refuse(`cannot create the check directory: ${e.message}`); }
  let log, fd;
  for (let tries = 0; ; tries++) {
    log = path.resolve(dir, `check-${slugOf(label)}.${crypto.randomBytes(4).toString("hex")}.log`);
    try { fd = fs.openSync(log, "wx", 0o600); break; }
    catch (e) { if (e.code !== "EEXIST" || tries > 8) refuse(`cannot create a log under ${dir}: ${e.message}`); }
  }
  const child = spawn("bash", ["-o", "pipefail", "-c", o.command], { stdio: ["ignore", fd, fd] });
  fs.closeSync(fd);
  const forward = (sig) => { try { child.kill(sig); } catch {} };
  for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(sig, () => forward(sig));
  let settled = false;
  child.on("error", (e) => {
    if (settled) return;
    settled = true;
    try { fs.unlinkSync(log); } catch {}
    refuse(`bash could not be started: ${e.message}`);
  });
  child.on("close", (code, signal) => {
    if (settled) return;
    settled = true;
    const shape = logShape(log, o.lines);
    const exit = signal ? `signal ${signal}` : String(code);
    const printed = [
      `LABEL=${label}`, `LOG=${log}`, `LINES=${shape.lines}`, `BYTES=${shape.bytes}`,
      ...shape.tail,
      `EXIT=${exit}`,
    ].join("\n") + "\n";
    if (o.ledger)
      appendLedger(o.ledger, { label, log, lines: shape.lines, bytes: shape.bytes, shownLines: shape.tail.length,
        shownBytes: Buffer.byteLength(printed), exit, at: new Date().toISOString() });
    process.stdout.write(printed, () => {
      process.exit(signal ? 128 + (os.constants.signals[signal] ?? 0) : code ?? 1);
    });
  });
}

const isMain = (() => {
  try { return fs.realpathSync(process.argv[1] ?? "") === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
})();

if (isMain) {
  const o = parse(process.argv.slice(2));
  if (o.help) { process.stdout.write(USAGE); process.exit(0); }
  if (o.error) refuse(o.error);
  if (o.summary) {
    if (!o.ledger) refuse("--summary needs --ledger FILE");
    summary(o.ledger);
    process.exit(0);
  }
  if (o.command === null || !o.command.trim()) refuse("no command: put it after --, quoted as one argument");
  run(o);
}
