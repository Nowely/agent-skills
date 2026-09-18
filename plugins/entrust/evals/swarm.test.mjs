#!/usr/bin/env node
// Does skills/swarm/SKILL.md still say what the swarm mode was agreed to say, and does
// skills/swarm/scripts/swarm.mjs launch what it promises?
//
//   node evals/swarm.test.mjs
//
// The page cases pin the rules by the words that carry them, with a negative case where a sentence
// could quietly widen the swarm to a model it must never carry. The script cases launch swarms against
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
  "the owner asked for the swarm by a separate command; a skill the model could invoke would launch fifty agents on its own judgement",
  () => {
    const problems = [];
    for (const re of [/^name: swarm$/m, /^disable-model-invocation: true$/m, /^license: MIT$/m, /^  version: "\d+\.\d+\.\d+"$/m])
      if (!re.test(front)) problems.push(`frontmatter lacks ${re}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the page stays inside its budget: 60 lines, one heading level, no fence",
  "the mode is loaded on top of two pages; the launch line is indented, never fenced, as the sibling's commands are",
  () => {
    const problems = [];
    if (lines.length > 60) problems.push(`${lines.length} lines`);
    if (/^###/m.test(text)) problems.push("a third heading level");
    if (/^```/m.test(text)) problems.push("a fence");
    return problems.length === 0 || problems.join("; ");
  });

test("A1 the orchestrate page is loaded first, the swarm is the bulk row at its widest, the mode adds no driver change, and a Terra swarm counts against the swarm's cap alone",
  "a swarm that re-defined the unit or the pool would drift from the page that owns them; the orchestrate page exempts the bulk row from the alive cap, and the owner named Terra swarms, so the exemption is stated here as this mode's one override",
  () => says(
    "Load [orchestrate](../orchestrate/SKILL.md) now",
    /A swarm is the orchestrate page's bulk row at its widest/,
    /adds no driver change, no header field and no flag/,
    /a Terra swarm counts as the bulk row does, against the swarm's own cap and never against the alive cap of six, and the plan says so/,
  ));

test("U1 a unit is the bulk row's unit, fifty at most, the template has its placeholders, every brief is a read agent on a bulk or cheap model at the page's effort, and no strong or top model is admitted",
  "the 2026-09-12 round's lesson: a broken path in every brief drew the same verdict from nineteen of twenty agents, so one assembled brief is opened whole; a top-row model in a swarm is the pool cap multiplied by fifty",
  () => {
    const prose = says(
      /one claim, one address, a verbatim quote, and a verdict from a closed set that describes the subject and never the brief/,
      /one per line, fifty at most/,
      /one brief template with `\{\{UNIT\}\}` where the unit goes and `\{\{UNIT_ID\}\}` where its number goes/,
      /assemble one brief and open it whole before the launch/,
      /Every brief carries `MODEL: gpt-5\.6-luna` or `gpt-5\.6-terra`, `EFFORT: low` for Luna and `medium` for Terra/,
      /a swarm never carries a top-row or strong-row model, and it never writes: every agent is a read agent/,
      /Announce the count, derived from the units with the plan saying why that many, before the launch/,
    );
    if (prose !== true) return prose;
    const models = [...flat.matchAll(/`MODEL: ([^`]+)`/g)].map((m) => m[1]);
    const bad = models.filter((m) => !/^gpt-5\.6-(luna|terra)$/.test(m));
    if (bad.length) return `the page admits a swarm model outside the bulk and cheap rows: ${bad.join(", ")}`;
    if (/(gpt-6-astra|gpt-5\.6-sol|\bOpus\b|\bFable\b)/.test(flat)) return "the page names a strong or top model";
    return true;
  });

test("L1 the launch line, the run layout the cleanup expects, the summary outside the run, the cap of fifty, the background task off the agent map, and the queue mode",
  "a swarm whose agents sat one level below the run left the run kept forever by the cleanup, and a summary inside the run broke the orchestrate page's promise that only the launcher and the driver write there (both shown 2026-09-18)",
  () => {
    const prose = says(
      /The run directory is the orchestrate run directory/,
      /make agent `<id>` at `<run directory>\/<id>\/report\.json` with its `agent\/` beside it, the shape the cleanup expects of a run/,
      /at most `--concurrency` at once, fifty at most/,
      /writes `summary\.json` outside the run, in an agent-scratch directory under your temporary directory/,
      /the swarm's agents are not on the agent map, the task is, and Stop on it stops further launches and reaches every running agent, the summary still written/,
      /`--agents <n>` in place of `--units` launches n agents on one identical brief, for the queue arm below/,
    );
    if (prose !== true) return prose;
    return shows(/^ {4}CLAUDE_PLUGIN_DATA="\$\{CLAUDE_PLUGIN_DATA\}" node "\$\{CLAUDE_SKILL_DIR\}\/scripts\/swarm\.mjs" --units <file> --brief <template> --run <run directory> --concurrency <n>$/m);
  });

test("R1 one cheap reducer reads the reports that are this run's own, opens one return whole, tallies, and the coordinator reads one return itself",
  "the orchestrate page's unanimity rule, kept at swarm width: a tally nobody opened is a tally about the prompt; a stale report under a taken path is not this run's evidence",
  () => says(
    /one cheap agent, the reducer of roles\.md, gets the summary path: it reads every report whose status line says the report is this run's own, opens one return whole, tallies the verdicts by unit/,
    /names the units whose answer did not parse, whose exit was not zero or whose report was not this run's/,
    /Read one return whole yourself before trusting the tally/,
    /a unanimous tally is evidence about the brief first/,
  ));

test("C1 sharing nothing is the default, shared state and free messaging are E4 arms, and peer messaging is named as the research's do-not-adopt",
  "the 2026-09-17 research put peer messaging and debate as verification on its do-not-adopt list (S2-21, S2-24, S1-58) and found shared state supported by mechanism rationale only; an arm that became the default before E4 would be the claim the research refused",
  () => says(
    /The default swarm shares nothing: each agent has its unit and returns its verdict/,
    /Two arms run only under protocol E4 of the experiment skill/,
    /put peer messaging and debate as verification on its do-not-adopt list/,
    /the arm that E4 measures as better becomes the default, and the other stays an arm/,
  ));

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

// ------------------------------------------------------------------ the script, against the fake app server

const shimDir = tempDir("swarm-shim.");
codexShim(shimDir, FAKE);
const world = tempDir("swarm-world.");
const state = path.join(world, "state"); fs.mkdirSync(state);
const env = { PATH: `${shimDir}:${process.env.PATH}`, FAKE_SCENARIO: "happy", ENTRUST_STATE_DIR: state, TMPDIR: path.join(world, "tmp") };
fs.mkdirSync(env.TMPDIR);
const draft = (name, body) => { const p = path.join(world, name); fs.writeFileSync(p, body); return p; };
const start = (argv) => spawnNode([SCRIPT, ...argv], { env, unsetEnv: ["CLAUDE_PLUGIN_DATA"], killAfterMs: 240000 });
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
    const runDir = path.join(world, "r0");
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
    const runDir = path.join(world, "run-units");
    const r = await run(["--units", unitsFile, "--brief", template, "--run", runDir, "--concurrency", "2"]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = [];
    const s = summaryOf(r);
    if (!s) return `no summary: ${r.out.slice(0, 120)}`;
    const m = /^summary=(.+)$/m.exec(r.out)[1];
    if (m.startsWith(runDir + path.sep)) problems.push("the summary lies under the run");
    if (!/codex-agent\.[A-Za-z0-9]{8}/.test(m)) problems.push(`the summary is not in an agent-scratch directory: ${m}`);
    if (s.count !== 3 || s.agents.length !== 3 || s.concurrency !== 2 || s.mode !== "units" || s.stopped) problems.push("summary header wrong");
    const p2 = path.join(runDir, "002", "agent", "prompt.txt");
    if (!fs.existsSync(p2)) problems.push("no agent/prompt.txt for unit 002");
    else if (!fs.readFileSync(p2, "utf8").includes("unit 002: second claim $' with a dollar quote")) problems.push("unit 002's prompt lost its unit or its dollar quote");
    for (const a of s.agents) {
      if (a.report !== path.join(runDir, a.id, "report.json")) problems.push(`${a.id}'s report is not at <run>/<id>/report.json`);
      if (!fs.existsSync(a.report)) problems.push(`no report for ${a.id}`);
      if (a.path !== "own") problems.push(`${a.id} PATH=${a.path}`);
      if (a.exitCode !== EXIT.OK) problems.push(`${a.id} exitCode ${a.exitCode}, driver ${a.driverExit}`);
      if (typeof a.first !== "string" || !a.first) problems.push(`${a.id} has no first line`);
      if (!a.startedAt || !a.finishedAt) problems.push(`${a.id} has no timestamps`);
    }
    if (!/^launched=3 ok=3$/m.test(r.out)) problems.push(`stdout said: ${r.out.trim()}`);
    return problems.length === 0 || problems.join("; ");
  });

test("S4 --agents two on one identical brief: two prompts with the id substituted and no unit, two entries in the summary",
  "the queue arm of E4 needs n agents on one brief; the script must not demand a unit it has no line for",
  async () => {
    const runDir = path.join(world, "run-agents");
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
    const runDir = path.join(world, "run-serial");
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
    const runDir = path.join(world, "run-stale");
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
    const runDir = path.join(world, "run-stop");
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
