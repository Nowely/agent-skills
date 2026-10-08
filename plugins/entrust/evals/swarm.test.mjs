#!/usr/bin/env node
// Does skills/swarm/SKILL.md still say what the swarm mode was agreed to say, and does
// skills/swarm/scripts/swarm.mjs launch what it promises?
//
//   node evals/swarm.test.mjs
//
// The page cases check what a coordinator or a tool reads off the page: the frontmatter, the budget, the
// one skill it loads, the models a brief may carry, the schema line, the launch line and every link. What
// the page says in prose is not pinned sentence by sentence. The script cases launch swarms against
// the fake app server through the sibling launcher, with the shim `codex` on PATH and the state
// directory under one harness temp directory, so nothing reaches the machine's own data.

import fs from "node:fs";
import path from "node:path";
import { EXIT, FAKE, ROOT, codexShim, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const PAGE = "skills/swarm/SKILL.md";
const SCRIPT = path.join(ROOT, "skills", "swarm", "scripts", "swarm.mjs");
const text = read(PAGE);
const lines = text.replace(/\n+$/, "").split("\n");
const front = text.split("---")[1] ?? "";
const flat = text.replace(/\s+/g, " ");

const shows = (...res) => {
  const missing = res.filter((r) => !r.test(text));
  return missing.length === 0 || `no line matches: ${missing.map(String).join(" | ")}`;
};

// ------------------------------------------------------------------ the page

test("the page was read (every case below is sound)",
  "a page that shrank to a stub would pass every negative check; the floor says the file is the page",
  () => lines.length > 20 || `read ${lines.length} lines out of ${PAGE}`);

test("the frontmatter names the mode, forbids model invocation, and carries a version",
  "the owner asked for the swarm by a separate command; a skill the model could invoke would launch fifty agents on its own judgement",
  () => {
    const problems = [];
    for (const re of [/^name: swarm$/m, /^disable-model-invocation: true$/m, /^license: MIT$/m, /^  version: "\d+\.\d+\.\d+"$/m])
      if (!re.test(front)) problems.push(`frontmatter lacks ${re}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the page stays inside its budget: 60 lines, one heading level, no fence",
  "the mode is loaded on top of the codex page; the launch line is indented, never fenced, as the sibling's commands are",
  () => {
    const problems = [];
    if (lines.length > 60) problems.push(`${lines.length} lines`);
    if (/^###/m.test(text)) problems.push("a third heading level");
    if (/^```/m.test(text)) problems.push("a fence");
    return problems.length === 0 || problems.join("; ");
  });

test("A0 the page loads codex, and no sentence asks it to load orchestrate",
  "orchestrate is `disable-model-invocation`, so the Skill tool refuses to load it and a page that asks for that load does not start (E39)",
  () => {
    const problems = [];
    const asks = /\bload\b[^.;]*\borchestrate\b/i.exec(flat) ?? /`entrust:orchestrate`/.exec(flat);
    if (asks) problems.push(`a sentence asks to load orchestrate: ${asks[0].slice(0, 120)}`);
    const loads = [...flat.matchAll(/\(`entrust:([a-z-]+)`\)/g)].map((m) => m[1]);
    if (loads.join() !== "codex") problems.push(`the skill loads the page asks for: ${loads.join(", ") || "none"}`);
    return problems.length === 0 || problems.join("; ");
  });

test("U1 every brief takes its model from the bulk or cheap row of the adapter's table, and the page names no model",
  "a top-tier model in a swarm is the pool cap multiplied by fifty; a model named on the shared page is the adapter's table copied out of its owner",
  () => {
    if (!/bulk or cheap row of the adapter's model table/.test(flat)) return "the page does not send the brief's model to the bulk or cheap row";
    const named = /`MODEL: [a-z]/.exec(flat) ?? /\b(?:astra|sol|terra|luna|fable|opus|sonnet|haiku)\b/i.exec(flat);
    return !named || `the page names a model: ${named[0]}`;
  });

test("U2 the brief's OUTPUT_SCHEMA is the shipped five-field file, and that file parses, is strict and names the five fields in order",
  "a Codex agent's `OUTPUT_SCHEMA:` must be a strict JSON Schema file; a copy pasted onto the page drifts from the file the driver enforces",
  () => {
    const named = /`<skill-dir>\/\.\.\/(orchestrate\/schemas\/five-fields\.schema\.json)`/.exec(text)?.[1];
    if (!named) return "the page names no shipped five-field schema for the brief's OUTPUT_SCHEMA";
    if (/^ {4}\{"type":"object"/m.test(text)) return "the page still pastes a schema line of its own";
    let s;
    try { s = JSON.parse(fs.readFileSync(path.join(ROOT, "skills", named), "utf8")); } catch (e) { return `the schema does not parse: ${e.message}`; }
    const five = ["status", "result", "evidence", "artifacts", "open"];
    const problems = [];
    if (s.additionalProperties !== false) problems.push("additionalProperties is not false");
    if (JSON.stringify(s.required) !== JSON.stringify(five)) problems.push(`required is ${JSON.stringify(s.required)}`);
    if (JSON.stringify(Object.keys(s.properties ?? {})) !== JSON.stringify(five)) problems.push("properties differ from the five fields");
    if (JSON.stringify(s.properties?.status?.enum) !== JSON.stringify(["done", "partial", "blocked"])) problems.push("status is not done | partial | blocked");
    return problems.length === 0 || problems.join("; ");
  });

test("U3 the shipped five-field schema caps every free-text field",
  "#15 P11a: returns overran their bound, so the shipped schema caps each field and the driver enforces the caps (D16); a swarm whose schema caps nothing is a swarm whose returns nothing bounds",
  () => {
    const file = path.join(ROOT, "skills", "orchestrate", "schemas", "five-fields.schema.json");
    if (!fs.existsSync(file)) return `the shipped schema ${file} does not exist`;
    const props = JSON.parse(fs.readFileSync(file, "utf8")).properties ?? {};
    const uncapped = ["result", "evidence", "artifacts", "open"].filter((f) => !("maxLength" in (props[f] ?? {}) || "maxItems" in (props[f] ?? {})));
    return uncapped.length === 0 || `the schema caps no size on: ${uncapped.join(", ")}`;
  });

test("L1 the page hands over the launch line the script takes",
  "the line is copied into a Bash call as it stands; the run layout behind it is orchestrate's, carried here because the page loads codex alone",
  () => shows(/^ {4}node "<skill-dir>\/scripts\/swarm\.mjs" --adapter <codex\|opencode> --units <file> --brief <template> --run <run directory> --concurrency <n>$/m));

test("every relative link resolves, inside this repository, to a file and to a heading that exists",
  "the page delegates its whole mechanism to the codex page by link; a moved file turns the mode into a 404 only a reader notices",
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

// ------------------------------------------------------------------ the script, against the fake app server

const shimDir = tempDir("swarm-shim.");
codexShim(shimDir, FAKE);
const world = tempDir("swarm-world.");
const state = path.join(world, "state"); fs.mkdirSync(state);
const env = { PATH: `${shimDir}:${process.env.PATH}`, FAKE_SCENARIO: "happy", ENTRUST_STATE_DIR: state, TMPDIR: path.join(world, "tmp") };
fs.mkdirSync(env.TMPDIR);
const draft = (name, body) => { const p = path.join(world, name); fs.writeFileSync(p, body); return p; };
const start = (argv) => spawnNode([SCRIPT, ...(argv.includes("--adapter") ? [] : ["--adapter", "codex"]), ...argv], { env, killAfterMs: 240000 });
const run = (argv) => start(argv).done;
const template = draft("brief.txt", `RIGHTS: read ${shimDir}\nTASK: unit {{UNIT_ID}}: {{UNIT}}\nRETURN: the verdict\n`);
const unitsFile = draft("units.txt", "first claim\n\nsecond claim $' with a dollar quote\nthird claim\n");
const summaryOf = (r) => { const m = /^summary=(.+)$/m.exec(r.out); return m ? JSON.parse(fs.readFileSync(m[1], "utf8")) : null; };

test("S1 --help names both modes, the summary, the signal rule and the exit codes, and exits 0",
  "README says each script is self-describing under --help",
  async () => {
    const r = await run(["--help"]);
    const problems = [];
    if (r.code !== 0) problems.push(`exit ${r.code}`);
    for (const w of ["--units", "--agents", "--concurrency", "summary.json", "signal", "2 usage", "50 at most"]) if (!r.out.includes(w)) problems.push(`--help lacks ${w}`);
    return problems.length === 0 || problems.join("; ");
  });

test("S2 usage refusals: neither or both modes, a cap above fifty, fifty-one units, a units template without its placeholder, a queue template with one, a relative run, a summary under the run",
  "a swarm launched with a wrong template answers fifty times about nothing; the refusals are exit 2 before any launch, and the cap of fifty is the script's, not the page's word",
  async () => {
    const problems = [];
    const q = draft("q.txt", `RIGHTS: read ${shimDir}\nTASK: drain the queue\n`);
    const many = draft("many.txt", Array.from({ length: 51 }, (_, i) => `claim ${i + 1}`).join("\n") + "\n");
    const runDir = path.join(state, "r0");
    const cases = [
      [["--brief", template, "--run", runDir], "neither mode"],
      [["--units", unitsFile, "--agents", "2", "--brief", template, "--run", runDir], "both modes"],
      [["--units", unitsFile, "--brief", template, "--run", runDir, "--concurrency", "51"], "cap 51"],
      [["--units", many, "--brief", template, "--run", runDir], "51 units"],
      [["--agents", "51", "--brief", q, "--run", runDir], "51 agents"],
      [["--units", unitsFile, "--brief", q, "--run", runDir], "units without placeholder"],
      [["--agents", "2", "--brief", template, "--run", runDir], "queue with placeholder"],
      [["--units", unitsFile, "--brief", template, "--run", "relative/run"], "relative run"],
      [["--units", unitsFile, "--brief", template, "--run", runDir, "--summary", path.join(runDir, "summary.json")], "summary under run"],
    ];
    for (const [argv, name] of cases) { const r = await run(argv); if (r.code !== 2) problems.push(`${name}: exit ${r.code}`); }
    if (fs.existsSync(runDir)) problems.push("a refused launch made the run directory");
    return problems.length === 0 || problems.join("; ");
  });

test("S3 three units at concurrency two: each agent at <run>/<id>/report.json with agent/ beside it and the unit in its prompt, a dollar-quote unit substituted verbatim, the summary outside the run with PATH=own and exit 0 per agent",
  "this is the offload: one script call instead of three launches and three waits; the layout is the one the cleanup lists as a run; a string replacement would have eaten the unit's $' (shown 2026-09-18)",
  async () => {
    const runDir = path.join(state, "run-units");
    const r = await run(["--units", unitsFile, "--brief", template, "--run", runDir, "--concurrency", "2"]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = [];
    const s = summaryOf(r);
    if (!s) return `no summary: ${r.out.slice(0, 120)}`;
    const m = /^summary=(.+)$/m.exec(r.out)[1];
    if (m.startsWith(runDir + path.sep)) problems.push("the summary lies under the run");
    const dir = path.dirname(m);
    if (!/^[^/]+\/run-units-[a-f0-9]{12}\/swarm$/.test(path.relative(path.join(fs.realpathSync(env.TMPDIR), "entrust"), path.dirname(dir)))) problems.push(`the summary is not grouped by project/run/swarm: ${m}`);
    if ((fs.statSync(dir).mode & 0o777) !== 0o700) problems.push("the summary directory is not private");
    if (s.count !== 3 || s.agents.length !== 3 || s.concurrency !== 2 || s.mode !== "units" || s.stopped) problems.push("summary header wrong");
    const p2 = path.join(runDir, "002", "agent", "prompt.txt");
    if (!fs.existsSync(p2)) problems.push("no agent/prompt.txt for unit 002");
    else if (!fs.readFileSync(p2, "utf8").includes("unit 002: second claim $' with a dollar quote")) problems.push("unit 002's prompt lost its unit or its dollar quote");
    for (const a of s.agents) {
      if (a.report !== path.join(runDir, a.id, "report.json")) problems.push(`${a.id}'s report is not at <run>/<id>/report.json`);
      if (!fs.existsSync(a.report)) problems.push(`no report for ${a.id}`);
      if (a.path !== "own") problems.push(`${a.id} PATH=${a.path}`);
      if (a.exitCode !== EXIT.SUCCESS) problems.push(`${a.id} exitCode ${a.exitCode}, driver ${a.driverExit}`);
      if (typeof a.first !== "string" || !a.first) problems.push(`${a.id} has no first line`);
      if (!a.startedAt || !a.finishedAt) problems.push(`${a.id} has no timestamps`);
    }
    if (!/^launched=3 ok=3$/m.test(r.out)) problems.push(`stdout said: ${r.out.trim()}`);
    return problems.length === 0 || problems.join("; ");
  });

test("S4 --agents two on one identical brief: two prompts with the id substituted and no unit, two entries in the summary",
  "the queue arm of E4 needs n agents on one brief; the script must not demand a unit it has no line for",
  async () => {
    const runDir = path.join(state, "run-agents");
    const q = draft("queue.txt", `RIGHTS: read ${shimDir}\nTASK: agent {{UNIT_ID}} drains the queue\n`);
    const r = await run(["--agents", "2", "--brief", q, "--run", runDir, "--concurrency", "2"]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = [];
    const s = summaryOf(r);
    if (s.mode !== "agents" || s.count !== 2) problems.push(`summary mode ${s.mode}, count ${s.count}`);
    const p1 = fs.readFileSync(path.join(runDir, "001", "agent", "prompt.txt"), "utf8");
    if (!p1.includes("agent 001 drains the queue")) problems.push("agent 001's prompt lacks its id");
    if (s.agents.some((a) => a.unit !== null)) problems.push("a queue agent carries a unit");
    return problems.length === 0 || problems.join("; ");
  });

test("S5 --concurrency one runs the agents one after another: no two intervals overlap",
  "a launcher that ignored the cap would run fifty at once whatever the plan announced; the timestamps in the summary are the evidence",
  async () => {
    const runDir = path.join(state, "run-serial");
    const r = await run(["--units", unitsFile, "--brief", template, "--run", runDir, "--concurrency", "1"]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const s = summaryOf(r);
    const problems = [];
    for (let i = 1; i < s.agents.length; i++)
      if (new Date(s.agents[i].startedAt) < new Date(s.agents[i - 1].finishedAt)) problems.push(`${s.agents[i].id} started before ${s.agents[i - 1].id} finished`);
    return problems.length === 0 || problems.join("; ");
  });

test("S6 a stale report under an agent's path reads as PATH=taken with no exit code and no first line",
  "a summary that read a stale report as this run's outcome was shown on 2026-09-18; the launcher's PATH line is what tells them apart",
  async () => {
    const runDir = path.join(state, "run-stale");
    fs.mkdirSync(path.join(runDir, "001"), { recursive: true });
    fs.writeFileSync(path.join(runDir, "001", "report.json"), JSON.stringify({ ok: true, exitCode: 0, answer: "AN EARLIER RUN ANSWER" }));
    const r = await run(["--units", draft("one.txt", "only claim\n"), "--brief", template, "--run", runDir, "--concurrency", "1"]);
    const s = summaryOf(r);
    if (!s) return `no summary: ${r.out.slice(0, 120)} ${r.err.slice(0, 120)}`;
    const a = s.agents[0];
    const problems = [];
    if (a.path === "own") problems.push("a stale report read as this run's own");
    if (a.exitCode !== null || a.first !== null) problems.push(`stale report yielded exitCode ${a.exitCode}, first ${JSON.stringify(a.first)}`);
    if (fs.readFileSync(path.join(runDir, "001", "report.json"), "utf8").includes("AN EARLIER RUN ANSWER") === false) problems.push("the stale report was overwritten");
    return problems.length === 0 || problems.join("; ");
  });

test("S7 SIGTERM stops further launches, reaches the running agent, and the summary is still written with stopped set and exit 1",
  "Stop on the swarm's task must not let the wave finish behind the user's back: a launcher that killed the running agents and then launched the rest was shown on 2026-09-18",
  async () => {
    const runDir = path.join(state, "run-stop");
    const many = draft("twenty.txt", Array.from({ length: 20 }, (_, i) => `claim ${i + 1}`).join("\n") + "\n");
    const h = start(["--units", many, "--brief", template, "--run", runDir, "--concurrency", "1"]);
    await new Promise((res) => setTimeout(res, 600));
    h.child.kill("SIGTERM");
    const r = await h.done;
    const problems = [];
    if (r.code !== 1) problems.push(`exit ${r.code}${r.signal ? ` signal ${r.signal}` : ""}: ${r.err.slice(0, 120)}`);
    const s = summaryOf(r);
    if (!s) return `no summary after SIGTERM: ${r.out.slice(0, 160)}`;
    if (!s.stopped) problems.push("the summary does not say the swarm was stopped");
    const launched = s.agents.filter((a) => a.launched).length;
    if (launched >= 20) problems.push("every agent was launched despite the signal");
    return problems.length === 0 || problems.join("; ");
  });

process.exit(summarize(await runCases(CASES), CASES.length));
