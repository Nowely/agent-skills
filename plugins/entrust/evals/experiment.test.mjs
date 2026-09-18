#!/usr/bin/env node
// Does skills/experiment/SKILL.md still say what the experiment mode was agreed to say, and does
// skills/experiment/scripts/experiment.mjs keep the record it promises?
//
//   node evals/experiment.test.mjs
//
// The page cases pin the rules by the words that carry them, with alternation where a rewording keeps
// the rule, and a negative case where a sentence could quietly undo one. The script cases run it against
// a scratch state directory under one harness temp directory: ENTRUST_STATE_DIR points there and
// CLAUDE_PLUGIN_DATA is unset, so nothing can reach the machine's own data directory.

import fs from "node:fs";
import path from "node:path";
import { ROOT, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const PAGE = "skills/experiment/SKILL.md";
const REF = "skills/experiment/references/protocols.md";
const SCRIPT = path.join(ROOT, "skills", "experiment", "scripts", "experiment.mjs");
const text = read(PAGE);
const lines = text.replace(/\n+$/, "").split("\n");
const front = text.split("---")[1] ?? "";
const flat = text.replace(/\s+/g, " ");

const says = (...res) => {
  const missing = res.filter((r) => !(r instanceof RegExp ? r.test(flat) : flat.includes(r)));
  return missing.length === 0 || `the page no longer says: ${missing.map(String).join(" | ")}`;
};
const shows = (...res) => {
  const missing = res.filter((r) => !r.test(text));
  return missing.length === 0 || `no line matches: ${missing.map(String).join(" | ")}`;
};

// ------------------------------------------------------------------ the page

test("the page was read (every case below is sound)",
  "a page that shrank to a stub would pass every negative check; the floor says the file is the page",
  () => lines.length > 20 || `read ${lines.length} lines out of ${PAGE}`);

test("the frontmatter names the mode, forbids model invocation, and carries a version",
  "a skill the model may invoke on its own would run experiments nobody registered; the version is what the package suite compares with plugin.json",
  () => {
    const problems = [];
    for (const re of [/^name: experiment$/m, /^disable-model-invocation: true$/m, /^license: MIT$/m, /^  version: "\d+\.\d+\.\d+"$/m])
      if (!re.test(front)) problems.push(`frontmatter lacks ${re}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the page stays inside its budget: 60 lines, one heading level, no fence",
  "the mode is loaded on top of two pages that already cost the coordinator its first minutes; a page that doubled, a third heading level or a fence is the mode spending what it should save",
  () => {
    const problems = [];
    if (lines.length > 60) problems.push(`${lines.length} lines`);
    if (/^###/m.test(text)) problems.push("a third heading level");
    if (/^```/m.test(text)) problems.push("a fence");
    return problems.length === 0 || problems.join("; ");
  });

test("A1 the orchestrate page is loaded first, the mode adds no driver change, and a run needs no checkout",
  "every arm is an orchestrated run; the owner runs some experiments on machines without the repository",
  () => says(
    "Load [orchestrate](../orchestrate/SKILL.md) now",
    /adds no driver change, no header field and no flag/,
    /A run (needs|requires) no checkout of the repository/,
  ));

test("P1 the protocol has its six fields: a falsifiable hypothesis, arms with a comparator and one \"go\", frozen material, the ruler's metrics per outcome, a judge that does not see the arm, a stop rule",
  "an experiment without a comparator or with material an arm has seen measures nothing (S2-48, S2-42, S2-44 in the 2026-09-17 research); a judge that knows the arm is the self-preference bias with a title; a metric per rollout instead of per outcome is what S2-48 rules out",
  () => says(
    /Hypothesis: an id and one sentence that can be (false|falsified|refuted)/,
    /one arm is the comparator the hypothesis calls for, a single agent or no delegation/,
    /one "go" covers every arm and no arm stops for a plan of its own/,
    /frozen before the run, with the ground truth or the acceptance check written (down )?before any arm sees it/,
    /unique coordinator incidents by stage with their severity, owner corrections, outcomes verified independently/,
    /agents and paid turns counted per outcome/,
    /n stated, with an interval where n is under fifty/,
    /returns with their first line removed, the line that names the agent's model and id, and the arms named by letters/,
    /Its verdict names the check it ran or is `unknown`/,
    /Stop rule and budget: the tokens and paid turns each arm may spend, and what ends the run early/,
  ));

test("P2 the protocol is shown and the run stops, and \"go\" covers the arms as listed",
  "the same gate the orchestrate page keeps: the user approves the arms and their cost before any agent runs",
  () => says(/Show the protocol(,| and) (then )?stop/, /"go" covers the arms as listed and nothing else/));

test("R1 each arm is its own orchestrated run with the same brief, and a failed arm is never re-run to a better number",
  "an arm re-run until it wins is the experiment choosing its result; a brief that differs between arms in more than the composition confounds the comparison",
  () => says(
    /Each arm is one orchestrated run with a run directory of its own, the same brief text in every arm except the composition/,
    /A failed arm is reported with its reason and (never|not) re-run to a better number; a repeat is a new experiment with the first in its record/,
  ));

test("V1 two verdicts: the orchestrator's conclusion states no cause the design cannot carry, the user's verdict decides, and neither is rewritten",
  "the 2026-09-17 round's own rule: a catalogue, a mapping or a metric table is not evidence that anything improved; the owner said the user concludes after the orchestrator, and a verdict rewritten later is not a record",
  () => {
    const prose = says(
      /The orchestrator writes the metric table and a conclusion that says what the numbers show and what they do not/,
      /a conclusion states no cause the design cannot carry/,
      /Then the user writes the verdict, kept, refuted, inconclusive or run again/,
      /the user's is the one that decides what changes/,
      /neither is rewritten afterwards/,
    );
    if (prose !== true) return prose;
    if (/\b(rewrit|replac|amend|overwrit)\w* (the|a) (verdict|conclusion|record)\b(?![^.]*\b(never|not|refuses)\b)/i.test(flat) && !/neither is rewritten afterwards/.test(flat)) return "the page allows a verdict or record to be rewritten";
    for (const m of flat.matchAll(/[^.]*\b(verdict|conclusion|record)\b[^.]*\b(rewrites|replaces|amends|overwrites)\b[^.]*\./g)) return `a sentence lets the record change after the fact: ${m[0].trim().slice(0, 120)}`;
    return true;
  });

test("E1 the record lives under the state directory, is written by the script and never by hand, closes at the verdict, and is exported as research/<date>-<slug>/ with a row in the index",
  "the owner chose the plugin's data directory as the one predictable place; a coordinator's write there is refused (measured 2026-09-08), so the script is the only pen; and the repository's research layout is research/<date>-<slug>/ with research/README.md as its index, not a second layout",
  () => {
    const prose = says(
      /`experiments\/<date>-<slug>\/` under the state directory, beside the orchestrate runs, written by `scripts\/experiment\.mjs` and never by hand/,
      /\(measured 2026-09-08\)/,
      /after `verdict\.md` the script refuses every change/,
      /copies the record unchanged, as `research\/<date>-<slug>\/` in a checkout, where a row goes into `research\/README\.md`/,
      /Codex reports stay where the driver put them and are copied in by path/,
      /Cleanup (neither lists nor removes|never lists or removes) a record/,
    );
    if (prose !== true) return prose;
    if (/research\/experiments\//.test(flat)) return "the page names a research/experiments/ layout the repository does not have";
    return shows(/^ {4}CLAUDE_PLUGIN_DATA="\$\{CLAUDE_PLUGIN_DATA\}" node "\$\{CLAUDE_SKILL_DIR\}\/scripts\/experiment\.mjs" <command>/m);
  });

test("F1 the protocols reference holds E1 to E5 with the seven fields each, and E2's escalation fires on `unknown` alone",
  "the hypotheses the research left first are the reason the mode exists; a reference missing a field is a protocol a run cannot fill, and a cascade that escalates on a non-empty `open` escalates every return",
  () => {
    let ref;
    try { ref = read(REF); } catch (e) { return `${REF} is missing: ${e.message}`; }
    const problems = [];
    for (const id of ["E1", "E2", "E3", "E4", "E5"]) {
      const m = new RegExp(`^## ${id} [^\\n]+\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, "m").exec(ref);
      if (!m) { problems.push(`no section for ${id}`); continue; }
      for (const f of ["Hypothesis", "Arms", "Material", "Metrics", "Judge", "Budget and stop rule", "What it cannot show"])
        if (!m[1].includes(`**${f}.**`)) problems.push(`${id} lacks ${f}`);
      if (id === "E2" && /non-empty `open`/.test(m[1])) problems.push("E2 escalates on a non-empty open");
    }
    return problems.length === 0 || problems.join("; ");
  });

test("every relative link resolves, inside this repository, to a file and to a heading that exists",
  "the page delegates its whole mechanism to the orchestrate page by link; a moved file turns the mode into a 404 only a reader notices",
  () => {
    const dir = path.dirname(path.join(ROOT, PAGE));
    const problems = [];
    const slug = (h) => h.toLowerCase().replace(/[^a-z0-9 -]/g, "").trim().replace(/ +/g, "-");
    for (const [, target] of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      if (/^[a-z]+:/.test(target)) continue;
      const [rel, anchor] = target.split("#");
      const abs = path.resolve(dir, rel);
      if (!abs.startsWith(ROOT + path.sep)) { problems.push(`${target} leaves the repository`); continue; }
      if (!fs.existsSync(abs)) { problems.push(`${target} resolves to nothing: ${abs}`); continue; }
      if (!anchor) continue;
      const headings = [...fs.readFileSync(abs, "utf8").matchAll(/^## (.+)$/gm)].map((m) => slug(m[1].trim()));
      if (!headings.includes(anchor)) problems.push(`${target}: no "## " heading slugs to #${anchor}`);
    }
    return problems.length === 0 || problems.join("; ");
  });

// ------------------------------------------------------------------ the script, in a scratch world

const world = tempDir("entrust-experiment-");
const state = path.join(world, "state"); fs.mkdirSync(state, { recursive: true });
const scratch = path.join(world, "scratch"); fs.mkdirSync(scratch);
const draft = (name, body) => { const p = path.join(scratch, name); fs.writeFileSync(p, body); return p; };
const run = (argv, env = {}) => spawnNode([SCRIPT, ...argv], { env: { ENTRUST_STATE_DIR: state, ...env }, unsetEnv: ["CLAUDE_PLUGIN_DATA"], killAfterMs: 20000 }).done;
const walk = (dir, base = dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p, base) : [[path.relative(base, p), fs.readFileSync(p, "utf8")]];
}).sort((a, b) => a[0].localeCompare(b[0]));
let record = null;

test("S1 --help exits 0 and names every command and every refusal code; an unknown command exits 2 even with --help",
  "README says each script is self-describing under --help; a coordinator reads this before the page's one-line summary",
  async () => {
    const r = await run(["--help"]);
    const problems = [];
    if (r.code !== 0) problems.push(`exit ${r.code}`);
    for (const w of ["init", "arm", "add", "export", "list", "ENTRUST_STATE_DIR", "CLAUDE_PLUGIN_DATA", "10 refused"]) if (!r.out.includes(w)) problems.push(`--help does not mention ${w}`);
    const bogus = await run(["bogus", "--help"]);
    if (bogus.code !== 2) problems.push(`bogus --help exit ${bogus.code}`);
    return problems.length === 0 || problems.join("; ");
  });

test("S2 without a state directory nothing runs: exit 2 and no file written",
  "the record's home is the data directory named by the environment; a script that invented a default would write somewhere the cleanup does not know",
  async () => {
    const r = await run(["init", "--slug", "x", "--protocol", draft("p0.md", "# p")], { ENTRUST_STATE_DIR: undefined });
    if (r.code !== 2) return `exit ${r.code}, stderr: ${r.err.slice(0, 120)}`;
    if (fs.readdirSync(state).length !== 0) return "something was written under the scratch state";
    return true;
  });

test("S3 init makes <state>/experiments/<date>-<slug>/ with protocol.md and arms/, prints the record, mode 0700",
  "the record is made once, by the script, from the protocol the coordinator drafted elsewhere",
  async () => {
    const r = await run(["init", "--slug", "width", "--date", "2026-09-18", "--protocol", draft("p1.md", "# E1 protocol\n")]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 160)}`;
    const m = /^record=(.+)$/m.exec(r.out);
    if (!m) return `no record= line: ${r.out}`;
    record = m[1];
    const problems = [];
    if (record !== path.join(fs.realpathSync(state), "experiments", "2026-09-18-width")) problems.push(`unexpected record path ${record}`);
    if (fs.readFileSync(path.join(record, "protocol.md"), "utf8") !== "# E1 protocol\n") problems.push("protocol.md differs from the draft");
    if (!fs.statSync(path.join(record, "arms")).isDirectory()) problems.push("no arms/");
    if (process.platform !== "win32" && (fs.statSync(record).mode & 0o777) !== 0o700) problems.push(`record mode ${(fs.statSync(record).mode & 0o777).toString(8)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("S4 init on an existing record is refused with exit 10 and the protocol untouched",
  "a repeat is a new experiment with the first in its record; a second init on the same name would be the first record rewritten",
  async () => {
    const r = await run(["init", "--slug", "width", "--date", "2026-09-18", "--protocol", draft("p2.md", "# other\n")]);
    if (r.code !== 10) return `exit ${r.code}`;
    return fs.readFileSync(path.join(record, "protocol.md"), "utf8") === "# E1 protocol\n" || "protocol.md was rewritten";
  });

test("S5 arm copies a report and a brief into arms/<arm>/, and a second arm of the same name is refused",
  "an arm's evidence is the driver's report and the brief that produced it; two arms under one name would be one arm's result overwriting the other's",
  async () => {
    const rep = draft("r.json", JSON.stringify({ ok: true, exitCode: 0, answer: "x" }));
    const r = await run(["arm", "--record", record, "--arm", "a-sol", "--report", rep, "--brief", draft("b.txt", "TASK: t\n")]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 160)}`;
    const problems = [];
    if (fs.readFileSync(path.join(record, "arms", "a-sol", "report.json"), "utf8") !== fs.readFileSync(rep, "utf8")) problems.push("report.json differs");
    if (fs.readFileSync(path.join(record, "arms", "a-sol", "brief.txt"), "utf8") !== "TASK: t\n") problems.push("brief.txt differs");
    const again = await run(["arm", "--record", record, "--arm", "a-sol", "--return", draft("ret.md", "done\n")]);
    if (again.code !== 10) problems.push(`second arm exit ${again.code}`);
    const r2 = await run(["arm", "--record", record, "--arm", "b-luna", "--return", draft("ret2.md", "done\n")]);
    if (r2.code !== 0) problems.push(`return-only arm exit ${r2.code}`);
    return problems.length === 0 || problems.join("; ");
  });

test("S6 add places metrics, refuses a verdict before the conclusion, closes the record at the verdict, and refuses every write after",
  "the order is the page's: the orchestrator concludes, then the user decides, and a record edited after the verdict is not a record",
  async () => {
    const problems = [];
    let r = await run(["add", "--record", record, "--name", "metrics.md", "--from", draft("m.md", "| a | b |\n")]);
    if (r.code !== 0) problems.push(`metrics exit ${r.code}: ${r.err.slice(0, 120)}`);
    r = await run(["add", "--record", record, "--name", "verdict.md", "--from", draft("v0.md", "kept\n")]);
    if (r.code !== 10) problems.push(`verdict before conclusion exit ${r.code}`);
    r = await run(["add", "--record", record, "--name", "conclusion.md", "--from", draft("c.md", "n=34\n")]);
    if (r.code !== 0) problems.push(`conclusion exit ${r.code}`);
    r = await run(["add", "--record", record, "--name", "metrics.md", "--from", draft("m2.md", "| x |\n")]);
    if (r.code !== 10) problems.push(`metrics rewrite exit ${r.code}`);
    if (fs.readFileSync(path.join(record, "metrics.md"), "utf8") !== "| a | b |\n") problems.push("metrics.md was rewritten");
    r = await run(["add", "--record", record, "--name", "verdict.md", "--from", draft("v.md", "kept\n")]);
    if (r.code !== 0) problems.push(`verdict exit ${r.code}`);
    r = await run(["arm", "--record", record, "--arm", "c-late", "--return", draft("late.md", "x\n")]);
    if (r.code !== 10) problems.push(`arm after verdict exit ${r.code}`);
    if (fs.existsSync(path.join(record, "arms", "c-late"))) problems.push("an arm was added after the verdict");
    r = await run(["add", "--record", record, "--name", "conclusion.md", "--from", draft("c2.md", "y\n")]);
    if (r.code !== 10) problems.push(`add after verdict exit ${r.code}`);
    return problems.length === 0 || problems.join("; ");
  });

test("S7 export copies the record unchanged into <to>/<name>/, refuses a second export, and refuses a destination under the state directory or inside a record",
  "the copy that reaches the repository is the record, byte for byte; a second export over the first would be the record rewritten in its public home; a destination under the state directory would be the script writing where it promised only records, and a closed record must not grow a copy inside it",
  async () => {
    const to = path.join(world, "research"); fs.mkdirSync(to);
    const r = await run(["export", "--record", record, "--to", to]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 160)}`;
    const dst = path.join(to, path.basename(record));
    const problems = [];
    if (JSON.stringify(walk(dst)) !== JSON.stringify(walk(record))) problems.push("the copy differs from the record");
    if (walk(record).length < 6) problems.push(`the record has only ${walk(record).length} files`);
    const again = await run(["export", "--record", record, "--to", to]);
    if (again.code !== 10) problems.push(`second export exit ${again.code}`);
    const before = walk(record).length;
    for (const [name, target] of [["the state directory", state], ["the records root", path.join(state, "experiments")], ["the closed record itself", record]]) {
      const x = await run(["export", "--record", record, "--to", target]);
      if (x.code !== 10) problems.push(`export to ${name}: exit ${x.code}`);
    }
    if (walk(record).length !== before) problems.push("a refused export wrote inside the record");
    if (fs.existsSync(path.join(state, path.basename(record))) || fs.readdirSync(path.join(state, "experiments")).length !== 1) problems.push("a refused export wrote under the state directory");
    return problems.length === 0 || problems.join("; ");
  });

test("S8 a --record outside <state>/experiments/, a --record that is a file, and a records root that is a symbolic link are refused with exit 2 and nothing written",
  "the script is the only pen under the data directory; a record path pointing anywhere else, or a root that leads out through a link, would make it a pen for anywhere",
  async () => {
    const problems = [];
    const elsewhere = path.join(world, "elsewhere"); fs.mkdirSync(elsewhere);
    let r = await run(["add", "--record", elsewhere, "--name", "metrics.md", "--from", draft("m3.md", "x\n")]);
    if (r.code !== 2) problems.push(`outside root: exit ${r.code}`);
    if (fs.readdirSync(elsewhere).length !== 0) problems.push("something was written outside the record root");
    r = await run(["add", "--record", path.join(record, "protocol.md"), "--name", "metrics.md", "--from", draft("m4.md", "x\n")]);
    if (r.code !== 2) problems.push(`record is a file: exit ${r.code}`);
    const state2 = path.join(world, "state2"); fs.mkdirSync(state2);
    const outside = path.join(world, "outside"); fs.mkdirSync(outside);
    fs.symlinkSync(outside, path.join(state2, "experiments"));
    r = await run(["init", "--slug", "leak", "--protocol", draft("p9.md", "# p\n")], { ENTRUST_STATE_DIR: state2 });
    if (r.code !== 2) problems.push(`symlinked root: exit ${r.code}`);
    if (fs.readdirSync(outside).length !== 0) problems.push("a symlinked root let a record land outside the state directory");
    return problems.length === 0 || problems.join("; ");
  });

test("S9 list names the record with its state",
  "a coordinator on a new session asks the script what records exist before it registers a repeat",
  async () => {
    const r = await run(["list"]);
    if (r.code !== 0) return `exit ${r.code}`;
    return /^2026-09-18-width\tverdict\t/m.test(r.out) || `list said: ${r.out.slice(0, 120)}`;
  });

process.exit(summarize(await runCases(CASES), CASES.length));
