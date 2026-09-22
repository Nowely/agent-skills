#!/usr/bin/env node
// Produce the next round from the previous one by asserted edits, and grow the ledger.
// Usage: node round.mjs FROM.md TO.md EDITS.json [--ledger LEDGER.json] [--allow-unrun]
// EDITS.json = [{"name": "...", "old": "...", "new": "...",
//                "check":  {"level": 1|2|3,
//                           "run":    "shell command",   // for levels 1-2, typically sed -n 'A,Bp' <file>
//                           "expect": "regex over what run printed"},
//                "claims": [{"name", "pattern",
//                            "asks": "what the sentence asserts, in its own scope words"}],
//                "retire": [{"name","pattern"}],  // phrasings this edit removes as false   (want: false)
//                "drop":   ["name", ...]}]         // ledger entries for claims the edit removes on purpose, recorded in rounds.md
// Every `old` must occur exactly once in FROM, or nothing is written. TO must not exist: a round is a
// new file, never an overwrite. With --ledger, claims and retirements are appended (deduplicated by name).
//
// An edit that declares claims carries a check, and the check runs. `run` is executed by /bin/sh with
// the run directory — the directory TO is written into — as its working directory, under a 60-second
// timeout; stdout and stderr together are matched against `expect`. One `expect` that does not match
// refuses the whole round: no TO, no ledger write. On success each claim's ledger entry keeps `run`,
// `expect`, `asks` and `saw`, the output clipped to 2000 characters. A non-zero exit is reported and
// does not by itself refuse the round: what was asked of the command is `expect`.
// Every claim states its `asks` — the proposition the sentence makes: what, for whom, under which
// condition. A run that answers a neighbour of `asks` is what the verifier of step 4b reads for.
//
// --allow-unrun accepts the schema that predates the running check: `check.how` with no `run`, and
// claims with no `asks`. Such entries are marked `unrun: true`. It exists to replay a recorded run;
// a round written today declares `run` and `expect`.
//
// A level-2 claim whose name or pattern mentions a lifecycle — stays, removed, continued, resumed,
// reclaimed, kept, pruned — is marked provisional in the ledger, because such claims have fallen to
// runs; ledger.mjs prints it as L2~. A `run` does not retire that mark: a sed over the source shows
// what a line says, not what a lifecycle does.
//
// Before the ledger is written it is copied to `ledger.NN.json` beside itself, NN from TO's name, so
// the state before this round is always on disk. A round the verifier sends back is undone by
// deleting TO and copying that file back over the ledger.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const TIMEOUT = 60_000, CLIP = 2000;
const argv = process.argv.slice(2);
let ledgerFile = null, allowUnrun = false; const pos = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--ledger") ledgerFile = argv[++i];
  else if (argv[i] === "--allow-unrun") allowUnrun = true;
  else pos.push(argv[i]);
}
const [from, to, editsFile] = pos;
if (!from || !to || !editsFile) { console.error("usage: node round.mjs FROM.md TO.md EDITS.json [--ledger LEDGER.json] [--allow-unrun]"); process.exit(2); }
if (fs.existsSync(to)) { console.error(`${to} exists; a round is a new file, never an overwrite`); process.exit(1); }
const edits = JSON.parse(fs.readFileSync(editsFile, "utf8"));
const refuse = (msg) => { console.error(`${msg}; nothing written, the ledger untouched`); process.exit(1); };

// 1. The schema, for every edit, before anything runs.
for (const e of edits) {
  if (!(e.claims ?? []).length) continue;
  const c = e.check;
  if (!(c && [1, 2, 3].includes(c.level))) refuse(`${e.name}: an edit that declares claims needs a check {level: 1|2|3, run, expect}`);
  if (c.run === undefined) {
    if (!allowUnrun) refuse(`${e.name}: check declares how and no run; a check that never runs proves nothing (G1) — give {run, expect}, or replay a recorded round with --allow-unrun`);
    continue;
  }
  if (typeof c.run !== "string" || !c.run.trim()) refuse(`${e.name}: check.run is the shell command to execute`);
  if (typeof c.expect !== "string" || !c.expect) refuse(`${e.name}: check.run needs a check.expect, a regex over what it prints`);
  try { new RegExp(c.expect); } catch (err) { refuse(`${e.name}: check.expect does not compile: ${err.message}`); }
  for (const cl of e.claims) if (!(typeof cl.asks === "string" && cl.asks.trim()))
    refuse(`${e.name}: claim ${JSON.stringify(cl.name)} needs asks — what the sentence asserts, in its own scope words`);
}

// 2. The checks, all of them, still before anything is written.
const cwd = path.dirname(path.resolve(to));
const saw = new Map();
for (const e of edits) {
  if (!(e.claims ?? []).length || e.check?.run === undefined) continue;
  const r = spawnSync("/bin/sh", ["-c", e.check.run], { cwd, timeout: TIMEOUT, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.error) refuse(`${e.name}: check.run did not run in ${cwd}: ${r.error.message}`);
  const out = (r.stdout ?? "") + (r.stderr ?? "");
  if (!new RegExp(e.check.expect).test(out)) {
    console.error(`${e.name}: check.expect /${e.check.expect}/ found nothing in what check.run printed (exit ${r.status}):`);
    console.error(out.slice(0, CLIP) || "  (no output)");
    refuse(`${e.name}: the check refuses this round`);
  }
  if (r.status !== 0) console.error(`${e.name}: check.run exited ${r.status}; expect matched, so the round stands`);
  saw.set(e.name, out.length > CLIP ? out.slice(0, CLIP) + `… [clipped at ${CLIP}]` : out);
  console.log("ran ", e.name);
}

// 3. The edits.
let t = fs.readFileSync(from, "utf8");
for (const e of edits) {
  const n = t.split(e.old).length - 1;
  if (n !== 1) refuse(`${e.name}: found ${n} time(s) in ${from}, expected exactly 1`);
  t = t.replace(e.old, e.new); console.log("ok ", e.name);
}
fs.writeFileSync(to, t);
if (ledgerFile) {
  const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, "utf8")) : [];
  const byName = new Map(ledger.map((c) => [c.name, c]));
  for (const e of edits) {
    const unrun = (e.claims ?? []).length > 0 && e.check?.run === undefined;
    for (const c of e.claims ?? []) byName.set(c.name, { name: c.name, pattern: c.pattern, want: true,
      level: e.check?.level ?? null,
      ...(c.asks ? { asks: c.asks } : {}),
      ...(unrun ? { ...(e.check?.how ? { how: e.check.how } : {}), unrun: true }
                : { run: e.check.run, expect: e.check.expect, saw: saw.get(e.name) ?? "" }),
      ...(e.check?.level === 2 && /lifecycle|stays|removed|continu|resum|reclaim|kept|prun/i.test(c.name + " " + c.pattern) ? { provisional: true } : {}) });
    for (const c of e.retire ?? []) byName.set(c.name, { name: c.name, pattern: c.pattern, want: false });
    for (const n of e.drop ?? []) { if (!byName.delete(n)) console.error(`${e.name}: drop names a ledger entry that does not exist: ${n}`); }
  }
  const nn = path.basename(to).match(/^\d+/)?.[0] ?? path.basename(to).replace(/\.[^.]*$/, "");
  const snapshot = path.join(path.dirname(ledgerFile), `ledger.${nn}.json`);
  fs.writeFileSync(snapshot, JSON.stringify(ledger, null, 1) + "\n");
  fs.writeFileSync(ledgerFile, JSON.stringify([...byName.values()], null, 1) + "\n");
  console.log(`ledger: ${byName.size} claim(s); the state before this round is in ${path.basename(snapshot)}`);
}
console.log(`wrote ${to}`);
