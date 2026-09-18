#!/usr/bin/env node
// experiment.mjs — the record of one experiment, kept under the plugin's data directory beside the
// orchestrate runs, written by this script and never by hand: a coordinator is refused every write
// under that directory, while a subprocess handed the path as an argument writes it unopposed.
//
//   node experiment.mjs init   --slug <slug> --protocol <file> [--date YYYY-MM-DD]
//   node experiment.mjs arm    --record <dir> --arm <name> [--report <report.json>] [--return <file>] [--brief <file>]
//   node experiment.mjs add    --record <dir> --name metrics.md|conclusion.md|verdict.md --from <file>
//   node experiment.mjs export --record <dir> --to <dir>
//   node experiment.mjs list
//
// A record is <state>/experiments/<date>-<slug>/ with protocol.md, arms/<arm>/{report.json,return.md,brief.txt},
// metrics.md, conclusion.md and verdict.md. Nothing in it is ever overwritten; once verdict.md is there the
// record is closed and every further write is refused. export copies a record, open or closed, unchanged to
// a destination outside the state directory; it never writes under the state directory itself.
//
// Environment: ENTRUST_STATE_DIR, else CLAUDE_PLUGIN_DATA (absolute; no default of its own). The records
// root <state>/experiments must be a real directory, never a symbolic link.
// Exit: 0 done; 2 usage, or no state directory, or a path that is not what the command needs; 10 refused —
// a record, arm or file that already exists, a record after its verdict, a verdict before a conclusion, a
// destination that exists or lies under the state directory; 1 a write failed.

import fs from "node:fs";
import path from "node:path";

const EXIT = { OK: 0, FAILED: 1, USAGE: 2, REFUSED: 10 };
const FILES = ["metrics.md", "conclusion.md", "verdict.md"];
const COMMANDS = ["init", "arm", "add", "export", "list"];
const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;

const usage = () => `experiment.mjs — the record of one experiment under the plugin's data directory

  init   --slug <slug> --protocol <file> [--date YYYY-MM-DD]   make <state>/experiments/<date>-<slug>/ with protocol.md and arms/
  arm    --record <dir> --arm <name> [--report <report.json>] [--return <file>] [--brief <file>]
                                                              copy an agent's report or returned text, and its brief, into arms/<name>/
  add    --record <dir> --name metrics.md|conclusion.md|verdict.md --from <file>
                                                              place one of the three; verdict.md needs conclusion.md first and closes the record
  export --record <dir> --to <dir>                            copy the record unchanged to <dir>/<record name>/, outside the state directory
  list                                                        every record under <state>/experiments/ with its state

Environment: ENTRUST_STATE_DIR, else CLAUDE_PLUGIN_DATA (absolute). Nothing is overwritten, ever.
Exit: 0 done; 2 usage, no state directory, or a wrong kind of path; 10 refused (exists, closed, out of order,
destination taken or under the state directory); 1 a write failed.
`;

function fail(code, msg) { process.stderr.write(`experiment: ${msg}\n`); process.exit(code); }

function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      if (key === "help") { out.help = true; continue; }
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) fail(EXIT.USAGE, `--${key} needs a value`);
      out[key] = v; i++;
    } else out._.push(a);
  }
  return out;
}

function stateDir() {
  const named = process.env.ENTRUST_STATE_DIR ? "ENTRUST_STATE_DIR" : process.env.CLAUDE_PLUGIN_DATA ? "CLAUDE_PLUGIN_DATA" : null;
  if (!named) fail(EXIT.USAGE, "no state directory: set ENTRUST_STATE_DIR, or pass CLAUDE_PLUGIN_DATA");
  const s = process.env[named];
  if (!path.isAbsolute(s)) fail(EXIT.USAGE, `${named} is not absolute: ${s}`);
  let st;
  try { st = fs.statSync(s); } catch { fail(EXIT.USAGE, `${named} does not exist: ${s}`); }
  if (!st.isDirectory()) fail(EXIT.USAGE, `${named} is not a directory: ${s}`);
  return fs.realpathSync(s);
}

// The records root is a real directory directly under the state directory; a symbolic link there would
// let a record land anywhere, so it is refused rather than followed.
function root(state) {
  const r = path.join(state, "experiments");
  let st = null;
  try { st = fs.lstatSync(r); } catch {}
  if (st && st.isSymbolicLink()) fail(EXIT.USAGE, `the records root is a symbolic link, which this script never follows: ${r}`);
  if (st && !st.isDirectory()) fail(EXIT.USAGE, `the records root is not a directory: ${r}`);
  return r;
}

const inside = (p, dir) => p === dir || p.startsWith(dir + path.sep);

// The record the caller names must be one this script would have made: a real directory one level under
// the records root, reached through no symbolic link.
function record(opt, state, { mustBeOpen }) {
  if (!opt.record) fail(EXIT.USAGE, "--record <dir> is required");
  if (!path.isAbsolute(opt.record)) fail(EXIT.USAGE, `--record is not absolute: ${opt.record}`);
  let real, st;
  try { real = fs.realpathSync(opt.record); st = fs.statSync(real); } catch { fail(EXIT.USAGE, `--record does not exist: ${opt.record}`); }
  if (!st.isDirectory()) fail(EXIT.USAGE, `--record is not a directory: ${opt.record}`);
  const r = root(state);
  if (path.dirname(real) !== r || path.resolve(opt.record) !== real) fail(EXIT.USAGE, `--record is not a record under ${r}: ${opt.record}`);
  if (mustBeOpen && fs.existsSync(path.join(real, "verdict.md"))) fail(EXIT.REFUSED, `the record is closed by its verdict: ${real}`);
  return real;
}

function readSource(p, what) {
  if (!p) fail(EXIT.USAGE, `${what} is required`);
  let st;
  try { st = fs.statSync(p); } catch { fail(EXIT.USAGE, `${what} does not exist: ${p}`); }
  if (!st.isFile()) fail(EXIT.USAGE, `${what} is not a regular file: ${p}`);
  try { return fs.readFileSync(p); } catch (e) { fail(EXIT.USAGE, `${what} cannot be read: ${p}: ${e.message}`); }
}

// Every write is create-only: an existing target is a refusal, never a rewrite.
function place(dst, body) {
  try { fs.writeFileSync(dst, body, { mode: 0o600, flag: "wx" }); }
  catch (e) {
    if (e.code === "EEXIST") fail(EXIT.REFUSED, `already there, not rewritten: ${dst}`);
    fail(EXIT.FAILED, `write failed: ${dst}: ${e.message}`);
  }
}

function init(opt, state) {
  if (!opt.slug || !NAME.test(opt.slug)) fail(EXIT.USAGE, "--slug <slug> is required: lower-case letters, digits and hyphens");
  const date = opt.date ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(EXIT.USAGE, `--date is not YYYY-MM-DD: ${date}`);
  const protocol = readSource(opt.protocol, "--protocol <file>");
  const r = root(state);
  const dir = path.join(r, `${date}-${opt.slug}`);
  if (fs.existsSync(dir)) fail(EXIT.REFUSED, `the record already exists: ${dir}`);
  try { fs.mkdirSync(r, { recursive: true, mode: 0o700 }); fs.mkdirSync(dir, { mode: 0o700 }); fs.mkdirSync(path.join(dir, "arms"), { mode: 0o700 }); }
  catch (e) { fail(EXIT.FAILED, `cannot make the record: ${dir}: ${e.message}`); }
  place(path.join(dir, "protocol.md"), protocol);
  process.stdout.write(`record=${dir}\n`);
}

function arm(opt, state) {
  const dir = record(opt, state, { mustBeOpen: true });
  if (!opt.arm || !NAME.test(opt.arm)) fail(EXIT.USAGE, "--arm <name> is required: lower-case letters, digits and hyphens");
  if (!opt.report && !opt.return) fail(EXIT.USAGE, "--report <report.json> or --return <file> is required");
  const bodies = [];
  if (opt.report) bodies.push(["report.json", readSource(opt.report, "--report")]);
  if (opt.return) bodies.push(["return.md", readSource(opt.return, "--return")]);
  if (opt.brief) bodies.push(["brief.txt", readSource(opt.brief, "--brief")]);
  const a = path.join(dir, "arms", opt.arm);
  if (fs.existsSync(a)) fail(EXIT.REFUSED, `the arm already exists: ${a}`);
  try { fs.mkdirSync(a, { recursive: true, mode: 0o700 }); } catch (e) { fail(EXIT.FAILED, `cannot make the arm: ${a}: ${e.message}`); }
  for (const [name, body] of bodies) place(path.join(a, name), body);
  process.stdout.write(`arm=${a}\n`);
}

function add(opt, state) {
  const dir = record(opt, state, { mustBeOpen: true });
  if (!FILES.includes(opt.name)) fail(EXIT.USAGE, `--name must be one of ${FILES.join(", ")}`);
  const body = readSource(opt.from, "--from <file>");
  if (opt.name === "verdict.md" && !fs.existsSync(path.join(dir, "conclusion.md"))) fail(EXIT.REFUSED, "a verdict needs the conclusion first");
  place(path.join(dir, opt.name), body);
  process.stdout.write(`${opt.name}=${path.join(dir, opt.name)}\n`);
}

function exportRecord(opt, state) {
  const real = record(opt, state, { mustBeOpen: false });
  if (!opt.to || !path.isAbsolute(opt.to)) fail(EXIT.USAGE, "--to <dir> is required and absolute");
  let to, st;
  try { to = fs.realpathSync(opt.to); st = fs.statSync(to); } catch { fail(EXIT.USAGE, `--to does not exist: ${opt.to}`); }
  if (!st.isDirectory()) fail(EXIT.USAGE, `--to is not a directory: ${opt.to}`);
  if (inside(to, state)) fail(EXIT.REFUSED, `--to lies under the state directory, where this script writes only records: ${to}`);
  const dst = path.join(to, path.basename(real));
  if (fs.existsSync(dst)) fail(EXIT.REFUSED, `the destination already exists: ${dst}`);
  try { fs.cpSync(real, dst, { recursive: true, errorOnExist: true, force: false }); }
  catch (e) { fail(EXIT.FAILED, `copy failed: ${dst}: ${e.message}`); }
  process.stdout.write(`exported=${dst}\n`);
}

function list(opt, state) {
  const r = root(state);
  let names = [];
  try { names = fs.readdirSync(r, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort(); }
  catch { process.stdout.write("no records\n"); return; }
  if (names.length === 0) { process.stdout.write("no records\n"); return; }
  for (const n of names) {
    const dir = path.join(r, n);
    const has = (f) => fs.existsSync(path.join(dir, f));
    let arms = 0;
    try { arms = fs.readdirSync(path.join(dir, "arms"), { withFileTypes: true }).filter((d) => d.isDirectory()).length; } catch {}
    const state_ = has("verdict.md") ? "verdict" : has("conclusion.md") ? "concluded" : has("metrics.md") ? "measured" : arms ? `arms ${arms}` : "protocol";
    process.stdout.write(`${n}\t${state_}\t${dir}\n`);
  }
}

const opt = args(process.argv.slice(2));
const cmd = opt._[0];
if (cmd !== undefined && !COMMANDS.includes(cmd)) fail(EXIT.USAGE, `unknown command: ${cmd}; one of ${COMMANDS.join(", ")}`);
if (opt.help || !cmd) { process.stdout.write(usage()); process.exit(opt.help ? EXIT.OK : EXIT.USAGE); }
if (opt._.length > 1) fail(EXIT.USAGE, `unexpected argument: ${opt._[1]}`);
const state = stateDir();
({ init, arm, add, export: exportRecord, list })[cmd](opt, state);
