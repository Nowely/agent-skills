#!/usr/bin/env node
// Every check is tested against a planted violation before its output is believed. Exit 1 on any miss.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { execFileSync, spawnSync } from "node:child_process";
const here = path.dirname(new URL(import.meta.url).pathname);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "terse-selftest."));
const run = (script, args) => { try { return { code: 0, out: execFileSync("node", [path.join(here, script), ...args], { encoding: "utf8" }) }; }
                                catch (e) { return { code: e.status, out: String(e.stdout) }; } };
const runErr = (script, args) => { const r = spawnSync("node", [path.join(here, script), ...args], { encoding: "utf8" }); return { code: r.status, out: r.stdout ?? "", err: r.stderr ?? "" }; };
let failed = 0;
const check = (name, ok) => { console.log(`${ok ? "ok  " : "MISS"} ${name}`); if (!ok) failed++; };
// rule1: a flag and a tilde path before the cut must both be reported; the same path inside the exception must be excused
const r1 = path.join(tmp, "r1.md");
fs.writeFileSync(r1, "use --no-network and ~/.codex/sessions\n\n## What it stores\n\n~/.claude/plugins/data/x\n\n## How it works\n\n--help is fine here\n");
const a = run("rule1.mjs", [r1, "--except", "What it stores"]);
check("rule1 reports the planted flag", a.out.includes("--no-network"));
check("rule1 reports the planted tilde path", a.out.includes("~/.codex/sessions"));
check("rule1 excuses the path in the stated exception", /stated exception/.test(a.out) && a.out.includes("~/.claude/plugins/data/x"));
check("rule1 ignores the section after the cut", !a.out.includes("--help"));
check("rule1 exits 1 on a violation", a.code === 1);
// dup: a concept broken across a line still counts, and three sections are flagged
const d = path.join(tmp, "d.md"), c = path.join(tmp, "c.json");
fs.writeFileSync(d, "## A\nan agent that ran\nnothing\n## B\nran nothing\n## C\nran nothing\n## D\nunrelated\n");
fs.writeFileSync(c, JSON.stringify([{ name: "ran nothing", pattern: "ran nothing" }]));
const b = run("dup.mjs", [d, c]);
check("dup counts a phrase broken across a line", /^\s*3\s+ran nothing/m.test(b.out));
check("dup flags three sections", b.out.includes("<<<"));
// ledger: a lost claim, an unwanted phrase and a control
const l = path.join(tmp, "l.json"), f1 = path.join(tmp, "01.md"), f2 = path.join(tmp, "02.md");
fs.writeFileSync(l, JSON.stringify([{ name: "kept", pattern: "commit\\s+first", want: true }, { name: "bad", pattern: "Commit or stash", want: false }, { name: "control", pattern: "zzz", want: false }]));
fs.writeFileSync(f1, "Commit or stash. commit\nfirst.\n"); fs.writeFileSync(f2, "Nothing here.\n");
const g = run("ledger.mjs", [l, f1, f2]);
check("ledger sees a claim broken across a line", /kept\s+L\S*\s+yes/.test(g.out));
check("ledger reports an unwanted phrase", /bad\s+L\S*\s+YES/.test(g.out));
check("ledger reports a lost claim in the last file", /kept\s+L\S*\s+yes\s+LOST/.test(g.out));
check("ledger exits 1 when the last file fails", g.code === 1);
// round: refuses a non-unique anchor, refuses to overwrite, grows the ledger
const e = path.join(tmp, "e.json"), from = path.join(tmp, "from.md"), to = path.join(tmp, "to.md"), lg = path.join(tmp, "lg.json");
fs.writeFileSync(from, "alpha beta alpha\n");
fs.writeFileSync(e, JSON.stringify([{ name: "x", old: "alpha", new: "gamma" }]));
check("round refuses an anchor that occurs twice", run("round.mjs", [from, to, e]).code === 1 && !fs.existsSync(to));
fs.writeFileSync(e, JSON.stringify([{ name: "x", old: "beta", new: "gamma", claims: [{ name: "g stays", pattern: "gamma" }] }]));
check("round refuses claims without a check", run("round.mjs", [from, to, e]).code === 1 && !fs.existsSync(to));
fs.writeFileSync(e, JSON.stringify([{ name: "x", old: "beta", new: "gamma", check: { level: 2, how: "read" }, claims: [{ name: "g stays", pattern: "gamma" }], retire: [{ name: "b", pattern: "beta" }] }]));
const h = run("round.mjs", [from, to, e, "--ledger", lg]);
check("round writes the new file", h.code === 0 && fs.readFileSync(to, "utf8") === "alpha gamma alpha\n");
const grown = JSON.parse(fs.readFileSync(lg, "utf8"));
check("round grows the ledger with a claim and a retirement", grown.length === 2);
check("a claim inherits its edit's level", grown.find((c) => c.name === "g stays")?.level === 2);
check("a level-2 lifecycle claim is marked provisional", grown.find((c) => c.name === "g stays")?.provisional === true);
check("the ledger prints the level and the provisional mark", /g stays\s+L2~/.test(run("ledger.mjs", [lg, to]).out));
check("round refuses to overwrite a round", run("round.mjs", [from, to, e]).code === 1);
const to2 = path.join(tmp, "to2.md");
fs.writeFileSync(e, JSON.stringify([{ name: "y", old: "gamma", new: "delta", drop: ["g stays"] }]));
check("round drops a ledger entry on purpose", run("round.mjs", [to, to2, e, "--ledger", lg]).code === 0 && !JSON.parse(fs.readFileSync(lg, "utf8")).some((c) => c.name === "g stays"));
// sections
const s = run("sections.mjs", [d]);
check("sections counts per heading", /^\s*2 B$/m.test(s.out) && /TOTAL/.test(s.out));
const bj = path.join(tmp, "b.json"); fs.writeFileSync(bj, JSON.stringify({ A: 10, B: 1, C: 5, D: 5 }));
const sb = run("sections.mjs", [d, bj]);
check("sections reports a section over its budget and still exits 0", /\+1\s+B/.test(sb.out) && sb.code === 0);
// ledger-seed: the audit's confirmed and refuted claims become the ratchet; unconfirmed is seeded nowhere
const SEED = "../../audit/scripts/ledger-seed.mjs";
const aud = path.join(tmp, "audit.md"), seed = path.join(tmp, "seed.json");
const claims = [
  { id: "C01", where: "README.md:3", sentence: "It writes into your tree only\non your word.", claim: "writing needs the word", level: 3, verdict: "confirmed", sources: "apply.mjs:1-9" },
  { id: "C02", where: "README.md:9", sentence: "Every run leaves a receipt.", claim: "receipt on every run", level: 2, verdict: "refuted" },
  { id: "C03", where: "README.md:11", sentence: "The cache is pruned weekly.", claim: "weekly prune", level: 1, verdict: "unconfirmed" },
];
const auditMd = (cs) => "# Audit\n\n## Claim ledger\n\n" + cs.map((c) => `### ${c.id} — ${c.where}\n\nClaim: ${c.claim}.\n`).join("\n") +
  "\n```json claims\n" + JSON.stringify(cs) + "\n```\n";
fs.writeFileSync(aud, auditMd(claims));
const sd = runErr(SEED, [aud, seed]);
const seeded = fs.existsSync(seed) ? JSON.parse(fs.readFileSync(seed, "utf8")) : [];
check("seed takes the confirmed and the refuted and leaves the unconfirmed", sd.code === 0 && seeded.length === 2);
check("a confirmed claim is seeded want:true at its level", seeded[0]?.want === true && seeded[0]?.level === 3 && /^C01 /.test(seeded[0]?.name));
check("a refuted claim is seeded want:false at its level", seeded[1]?.want === false && seeded[1]?.level === 2);
check("the unconfirmed claim is named on stderr", /C03/.test(sd.err) && !seeded.some((c) => /^C03 /.test(c.name)));
const kept = path.join(tmp, "s-01.md"), dropped = path.join(tmp, "s-02.md");
fs.writeFileSync(kept, "It writes into your tree only on your word.\n");
fs.writeFileSync(dropped, "It writes into your tree.\n");
const sl = run("ledger.mjs", [seed, kept, dropped]);
check("a round that drops the seeded sentence fails the ledger", sl.code === 1 && /C01[^\n]*yes\s+LOST/.test(sl.out));
check("seed refuses to overwrite a ledger", runErr(SEED, [aud, seed]).code === 1);
const aud2 = path.join(tmp, "audit2.md"), seed2 = path.join(tmp, "seed2.json");
fs.writeFileSync(aud2, auditMd(claims).replace("### C02", "### C09"));
const sd2 = runErr(SEED, [aud2, seed2]);
check("seed refuses an audit whose prose and block disagree", sd2.code === 1 && /C09/.test(sd2.err) && !fs.existsSync(seed2));
fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `\n${failed} check(s) MISSED` : "\nall checks caught their planted violation");
process.exit(failed ? 1 : 0);
