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
const noRun = runErr("round.mjs", [from, to, e, "--ledger", lg]);
check("round refuses a check that declares how and never runs", noRun.code === 1 && /G1/.test(noRun.err) && !fs.existsSync(to) && !fs.existsSync(lg));
const h = run("round.mjs", [from, to, e, "--ledger", lg, "--allow-unrun"]);
check("round writes the new file", h.code === 0 && fs.readFileSync(to, "utf8") === "alpha gamma alpha\n");
check("a recorded check with no run is accepted under the flag and marked unrun",
  JSON.parse(fs.readFileSync(lg, "utf8")).find((c) => c.name === "g stays")?.unrun === true);
const grown = JSON.parse(fs.readFileSync(lg, "utf8"));
check("round grows the ledger with a claim and a retirement", grown.length === 2);
check("a claim inherits its edit's level", grown.find((c) => c.name === "g stays")?.level === 2);
check("a level-2 lifecycle claim is marked provisional", grown.find((c) => c.name === "g stays")?.provisional === true);
check("the ledger prints the level and the provisional mark", /g stays\s+L2~/.test(run("ledger.mjs", [lg, to]).out));
check("round refuses to overwrite a round", run("round.mjs", [from, to, e, "--allow-unrun"]).code === 1);
const to2 = path.join(tmp, "to2.md");
fs.writeFileSync(e, JSON.stringify([{ name: "y", old: "gamma", new: "delta", drop: ["g stays"] }]));
check("round drops a ledger entry on purpose", run("round.mjs", [to, to2, e, "--ledger", lg]).code === 0 && !JSON.parse(fs.readFileSync(lg, "utf8")).some((c) => c.name === "g stays"));
// round: the check runs, its output is kept, and a check that does not match writes nothing
const from2 = path.join(tmp, "from2.md"), e2 = path.join(tmp, "e2.json"), lg2 = path.join(tmp, "lg2.json");
const to3 = path.join(tmp, "to3.md"), to4 = path.join(tmp, "to4.md"), to5 = path.join(tmp, "to5.md");
fs.writeFileSync(from2, "one two three\n");
const running = (expect, claim = { name: "TWO", pattern: "TWO", asks: "the second word of from2.md is two" }) =>
  [{ name: "r", old: "two", new: "TWO", check: { level: 1, run: "cat from2.md", expect }, claims: [claim] }];
fs.writeFileSync(e2, JSON.stringify(running("one two three")));
const rr = run("round.mjs", [from2, to3, e2, "--ledger", lg2]);
check("a check whose expect matches writes the round", rr.code === 0 && fs.readFileSync(to3, "utf8") === "one TWO three\n");
const withSaw = JSON.parse(fs.readFileSync(lg2, "utf8"))[0];
check("the entry keeps run, expect and asks", withSaw.run === "cat from2.md" && withSaw.expect === "one two three" && /second word/.test(withSaw.asks));
// the command is a relative path: it resolves only with the run directory as the working directory
check("saw is what the command printed, from the run directory", withSaw.saw === "one two three\n");
check("the state before the round is left beside the ledger", fs.readFileSync(path.join(tmp, "ledger.to3.json"), "utf8") === "[]\n");
const before = fs.readFileSync(lg2);
fs.writeFileSync(e2, JSON.stringify(running("four five six")));
const rn = runErr("round.mjs", [from2, to4, e2, "--ledger", lg2]);
check("a check whose expect does not match writes nothing", rn.code === 1 && !fs.existsSync(to4));
check("a refused round leaves the ledger byte-identical", Buffer.compare(before, fs.readFileSync(lg2)) === 0);
fs.writeFileSync(e2, JSON.stringify(running("one two three", { name: "no asks", pattern: "TWO" })));
const na = runErr("round.mjs", [from2, to5, e2, "--ledger", lg2]);
check("round refuses a claim that does not say what it asks", na.code === 1 && /asks/.test(na.err) && !fs.existsSync(to5));
const to7 = path.join(tmp, "to7.md");
fs.writeFileSync(e2, JSON.stringify([
  { name: "a", old: "one", new: "ONE", check: { level: 1, run: "cat from2.md", expect: "one" }, claims: [{ name: "same", pattern: "ONE", asks: "ONE stands first" }] },
  { name: "b", old: "three", new: "THREE", check: { level: 1, run: "cat from2.md", expect: "three" }, claims: [{ name: "same", pattern: "THREE", asks: "THREE stands last" }] }]));
const dup2 = runErr("round.mjs", [from2, to7, e2, "--ledger", lg2]);
check("round refuses one name declared twice in a round", dup2.code === 1 && /declared twice/.test(dup2.err) && !fs.existsSync(to7));
// the snapshot is a copy, not a re-serialisation: cp back must restore the bytes that were there
const to6 = path.join(tmp, "to6.md"), odd = '[{"name":"kept","pattern":"TWO","want":true}]';
fs.writeFileSync(lg2, odd);
fs.writeFileSync(e2, JSON.stringify(running("one two three", { name: "second", pattern: "TWO", asks: "TWO stands where two stood" })));
run("round.mjs", [from2, to6, e2, "--ledger", lg2]);
check("the snapshot holds the previous ledger byte for byte", fs.readFileSync(path.join(tmp, "ledger.to6.json"), "utf8") === odd);
// round: an edit that adds a qualification is refused unless it says why the clause is scope, not a caveat
const from3 = path.join(tmp, "from3.md"), e3 = path.join(tmp, "e3.json"), lg3 = path.join(tmp, "lg3.json");
const [to8, to9, to10, to11] = ["to8.md", "to9.md", "to10.md", "to11.md"].map((f) => path.join(tmp, f));
fs.writeFileSync(from3, "The run is kept.\nIt stops on a lock unless you wait.\n");
const caveat = (more = {}) => [{ name: "q", old: "The run is kept.", new: "The run is kept unless\nyou pass --prune.",
  check: { level: 1, run: "cat from3.md", expect: "kept" }, claims: [{ name: "kept", pattern: "kept", asks: "the run is kept" }], ...more }];
fs.writeFileSync(e3, JSON.stringify(caveat()));
const q1 = runErr("round.mjs", [from3, to8, e3, "--ledger", lg3]);
check("round refuses an edit that adds a qualification, quoting it",
  q1.code === 1 && /"unless you pass --prune"/.test(q1.err) && /qualification is not a fix/.test(q1.err) && !fs.existsSync(to8) && !fs.existsSync(lg3));
const why = "Pruning is the sentence's own subject.";
fs.writeFileSync(e3, JSON.stringify(caveat({ qualifies: why })));
const q2 = run("round.mjs", [from3, to9, e3, "--ledger", lg3]);
check("an edit that says why is written and its ledger entry keeps the reason",
  q2.code === 0 && fs.existsSync(to9) && JSON.parse(fs.readFileSync(lg3, "utf8")).find((c) => c.name === "kept")?.qualified === why);
fs.writeFileSync(e3, JSON.stringify([{ name: "k", old: "on a lock unless you wait", new: "on a held lock unless you wait" }]));
check("an edit that keeps a qualification its old text had needs no reason", run("round.mjs", [from3, to10, e3]).code === 0 && fs.existsSync(to10));
fs.writeFileSync(e3, JSON.stringify(caveat({ check: { level: 1, how: "read" } })));
const q4 = runErr("round.mjs", [from3, to11, e3, "--allow-unrun"]);
check("a recorded qualification is reported and let through under --allow-unrun", q4.code === 0 && fs.existsSync(to11) && /qualification is not a fix/.test(q4.err));
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
  { id: "C02", where: "README.md:9", sentence: "Every run leaves a receipt.", claim: "receipt on every run", level: 2, verdict: "refuted", sources: "driver.mjs:40-52" },
  { id: "C03", where: "README.md:11", sentence: "The cache is pruned weekly.", claim: "weekly prune", level: 1, verdict: "unconfirmed", sources: "cache.mjs:1-30" },
];
const prose = (cs) => cs.map((c) => `### ${c.id} — ${c.where}\n\nClaim: ${c.claim}.\n`).join("\n");
const block = (cs) => "```json claims\n" + JSON.stringify(cs) + "\n```\n";
const auditMd = (cs) => `# Audit\n\n## Claim ledger\n\n${prose(cs)}\n${block(cs)}`;
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
// every refusal the run-file contract asks for, each against its planted violation
const refuses = (name, body, needle) => {
  const f = path.join(tmp, `a-${name.replace(/\W+/g, "-")}.md`), o = path.join(tmp, `s-${name.replace(/\W+/g, "-")}.json`);
  fs.writeFileSync(f, body); const r = runErr(SEED, [f, o]);
  check(`seed refuses ${name}`, r.code === 1 && needle.test(r.err) && !fs.existsSync(o));
};
refuses("an audit whose prose and block disagree", auditMd(claims).replace("### C02", "### C09"), /C09/);
refuses("a json claims block under another heading",
  `# Audit\n\n## Claim ledger\n\n${prose(claims)}\n## Open\n\nnothing settled.\n\n${block(claims)}`, /another heading/);
refuses("a claim ledger with no entries under it", `# Audit\n\n## Claim ledger\n\n${block(claims)}`, /### C\.\. entries/);
refuses("an unconfirmed entry with no sources",
  auditMd(claims.map((c) => (c.id === "C03" ? { ...c, sources: undefined } : c))), /C03: every entry needs sources/);
refuses("an unconfirmed entry with no level",
  auditMd(claims.map((c) => (c.id === "C03" ? { ...c, level: undefined } : c))), /C03: every entry needs level/);
refuses("an entry with no claim of its own",
  auditMd(claims.map((c) => (c.id === "C02" ? { ...c, claim: undefined } : c))), /C02: every entry needs claim/);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `\n${failed} check(s) MISSED` : "\nall checks caught their planted violation");
process.exit(failed ? 1 : 0);
