// The checker's stateful bench: a consumer page (control/) whose defects show only after a state change, a
// transition, or in gaps the drift allowance can swallow; mutants of it, each with the class a correct checker raises.
// Judged as ../card/run.mjs judges: per build, the classes expected against the classes raised.
//   node run-stateful.mjs [--skill <dir>] [--label <name>] [name ...]
// It writes out/<label>/<name>/ (check.txt, out/result.json) and out/<label>.txt here.
// The control's frames are the page itself, written once, from control/:
//   node <skill>/design.mjs snapshot design.json --images --force
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
// The skill's checker, from this repository by default, or from the folder given with --skill.
const args = process.argv.slice(2);
const take = (flag) => { const i = args.indexOf(flag); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const SKILL = path.resolve(take("--skill") ?? path.join(HERE, "../../../../plugin/skills/design-to-code/scripts"));
const label = take("--label") ?? "run";
const only = args;
const design = path.join(SKILL, "design.mjs");
if (!fs.existsSync(design)) { console.error(`no design.mjs in ${SKILL}`); process.exit(2); }
// Playwright is resolved as the case tests resolve it: from the working directory, then from the checker. A global
// install is the last place, handed to the checker through NODE_PATH.
const env = { ...process.env };
const found = (base) => ["playwright", "@playwright/test", "playwright-core"].some((n) => { try { createRequire(base).resolve(n); return true; } catch { return false; } });
if (!found(path.join(HERE, "noop.js")) && !found(design)) {
  const root = spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout?.trim();
  if (root) env.NODE_PATH = [root, env.NODE_PATH].filter(Boolean).join(path.delimiter);
}

const OUT = path.join(HERE, "out", label);
const CONTROL = path.join(HERE, "control");
const PAGE = ["index.html", "cards.css", "cards.js", "data.js"];

const css = (rule) => ({ css: rule });
const js = (...pairs) => ({ js: pairs });
// A change to the stylesheet's own rules, where a rule added after them cannot take one back.
const restyle = (...pairs) => ({ restyle: pairs });
// The page's fix for its sidebar, as control/cards.css words it: below 640 px it stacks above the list.
const STACKED = "/* Below 640 px there is no room beside the list: the sidebar stacks above it, and the list keeps the window's width. */\n"
  + "@media (max-width: 639px) { .page { flex-direction: column; align-items: stretch; } .sidebar { flex: none; } }\n";
// A journey's class names the journey (the word before its colon), so that one journey failing for the checker's own
// reason does not count as another's catch. An expected entry that is a list is met by any one of its classes.
const SHEET = (j) => j.name.startsWith("sheet:");
const BUILDS = [
  { name: "control", expect: [] },
  // The clean sheet alone, closed by its transition, by button and by a tap on the backdrop: it must pass. With the
  // lifecycle journey and a coarse sweep, which a complete check asks for.
  { name: "transition-close", expect: [], config: (c) => ({ ...c, sweep: { ...c.sweep, step: 580 }, journeys: c.journeys.filter((j) => SHEET(j) || j.sameAsFresh) }) },
  // After the list is emptied and restored, the observers stay on the removed cards and the new ones are never
  // observed: at 375 px the card keeps its wide layout and its content runs past it. A journey, or a finding that the
  // page after the journey differs from a fresh load at that width; today's checker has neither.
  { name: "stale-observer", expect: [["journey:list", "fresh"]], change: js(
    ['  for (const card of host.querySelectorAll(".card")) unwatch(card); // let go of the cards leaving\n', ""],
    ['  for (const card of host.querySelectorAll(".card")) watch(card); // observe the cards mounted now\n', ""],
    ["renderCards(host, ITEMS);\n", 'renderCards(host, ITEMS);\nfor (const card of host.querySelectorAll(".card")) watch(card); // observed once, on the first mount\n']) },
  // The sheet waits for a transition it does not run (it slides, it does not fade): it never hides.
  { name: "broken-close", expect: ["journey:sheet"], change: js(['e.propertyName === "transform"', 'e.propertyName === "opacity"']) },
  // In the compact layout (the 375 frame), three 10 px sizes drawn at 0, 30, 48 render at 10, 49, 60: the 8 px gap
  // closes to 1 px while every offset stays within the drift allowance. The wide layout is untouched.
  { name: "collapsed-gap", expect: ["gap"], change: css('.card[data-layout="compact"] .sizes { padding-left: 10px; } .card[data-layout="compact"] .size:first-child { margin-right: 29px; } .card[data-layout="compact"] .size:nth-child(2) { margin-right: 1px; }') },
  // The control as it was until item 8 (research note 44): the open sidebar (280 px, not shrinking) stays beside the
  // list at every width, so at 375 px it leaves the list 47 px and the titles break letter by letter. The sidebar
  // journey asserted only that the sidebar shows and hides.
  { name: "squeezed-by-sidebar", expect: ["journey:sidebar"], change: restyle([STACKED, ""]) },
];

const control = JSON.parse(fs.readFileSync(path.join(CONTROL, "design.json"), "utf8"));
const benchConfig = { ...control, frames: control.frames.map((f) => ({ ...f, spec: path.join(CONTROL, f.spec), reference: path.join(CONTROL, f.reference) })) };

function prepare(b) {
  const dir = path.join(OUT, b.name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const f of PAGE) fs.copyFileSync(path.join(CONTROL, f), path.join(dir, f));
  for (const [name, pairs] of [["cards.css", b.change?.restyle], ["cards.js", b.change?.js]]) for (const [from, to] of pairs ?? []) {
    const file = path.join(dir, name), src = fs.readFileSync(file, "utf8");
    if (src.split(from).length !== 2) throw new Error(`${b.name}: the change does not apply once: ${from.trim()}`);
    fs.writeFileSync(file, src.replace(from, to));
  }
  if (b.change?.css) fs.appendFileSync(path.join(dir, "cards.css"), `\n${b.change.css}\n`);
  const config = path.join(dir, "design.json");
  fs.writeFileSync(config, JSON.stringify(b.config ? b.config(benchConfig) : benchConfig, null, 1));
  fs.writeFileSync(path.join(dir, "deviations.json"), "[]");
  fs.writeFileSync(path.join(dir, "review.md"), "## Acceptance\n\n- bench: pass — the bench's own config\n");
  return { dir, config };
}

// What a finding is, in the owner's classes, as ../run.mjs reads them. A finding that the page after a journey differs
// from a fresh load is "fresh", by whatever property name the checker gives it.
const classOf = (i) => (/fresh|remount|reload/i.test(i.property) ? "fresh" : ({ x: "offset", y: "offset", presence: "text", text: "text", line: "line", wrap: "wrap", overlap: "overlap",
  clipped: "cut", outside: "cut", covered: "cut", overflow: "cut", construct: "construct", align: "align", type: "type", width: "size",
  height: "size", gap: "gap", switch: "switch", resize: "resize" })[i.gap ? "gap" : i.property] ?? i.property);
const journeyClass = (j) => `journey:${j.name.split(":")[0]}`;

function run({ dir, config }) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [design, "check", config], { cwd: path.dirname(config), env, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (out += d));
    const t = setTimeout(() => p.kill("SIGKILL"), 20 * 60 * 1000);
    p.on("close", (code) => { clearTimeout(t); fs.writeFileSync(path.join(dir, "check.txt"), out); resolve(code); });
  });
}
function read(config, own) {
  const file = path.join(path.dirname(config), "out", "result.json");
  if (!fs.existsSync(file)) return { error: "no result" };
  const r = JSON.parse(fs.readFileSync(file, "utf8"));
  const found = new Map();
  const note = (cls, what) => { if (!found.has(cls)) found.set(cls, []); found.get(cls).push(what); };
  for (const f of r.frames ?? []) {
    for (const i of f.issues.filter((i) => i.status === "fail" && i.property !== "region")) note(classOf(i), `${f.frame} ${i.landmark} ${i.property}${i.delta !== undefined ? ` ${Math.round(i.delta)}` : ""}`);
    if ((f.unexpected ?? []).length) note("text", `${f.frame} not in the design: ${f.unexpected.slice(0, 3).join(" | ")}`);
  }
  for (const i of (r.sweep?.issues ?? []).filter((i) => i.status === "fail")) note(classOf(i), `sweep ${i.story ?? "page"} ${i.landmark} ${i.property} at ${i.ranges ?? ""}`);
  for (const j of (r.journeys ?? []).filter((j) => !j.pass)) note(journeyClass(j), `${j.name}: ${String(j.failed).slice(0, 90)}`);
  for (const i of (r.journeys ?? []).flatMap((j) => (j.issues ?? []).map((i) => ({ ...i, journey: j.name }))).filter((i) => i.status === "fail")) note(classOf(i), `${i.journey}: ${i.landmark} ${i.property}`);
  return { found, status: r.status, holds: holds(r, own) };
}
// What keeps a complete check from handing over, beyond the gaps a build's own config causes by design (`own`, a list
// of patterns): its status fail, or incomplete for a frame, the sweep, or another gap (an unanswered candidate, a story
// not swept). A clean build blocked this way is blocked as surely as by a finding.
function holds(r, own = []) {
  if (r.status === "fail") return ["status fail"];
  if (r.status !== "incomplete") return [];
  return [...(r.frames ?? []).filter((f) => f.verdict === "incomplete").map((f) => `frame ${f.frame} incomplete`),
    ...(r.sweep?.verdict === "incomplete" ? [`sweep: ${r.sweep.reason ?? "incomplete"}`] : []),
    ...(r.gaps ?? []).filter((g) => !own.some((re) => re.test(g))).map((g) => `gap: ${g.slice(0, 120)}`)];
}

const jobs = BUILDS.filter((b) => !only.length || only.includes(b.name)).map((b) => ({ ...b, ...prepare(b) }));
const results = [];
const queue = [...jobs];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) {
    const job = queue.shift();
    const started = Date.now();
    await run(job);
    results.push({ job, r: read(job.config, job.own) });
    process.stderr.write(`${job.name} done in ${Math.round((Date.now() - started) / 1000)} s\n`);
  }
}));
const shown = (e) => [].concat(e).join("|");
const met = (e, classes) => [].concat(e).some((c) => classes.includes(c));
let caught = 0, expected = 0, falseBlocks = 0;
const lines = [];
for (const { job, r } of results.sort((a, b) => jobs.indexOf(a.job) - jobs.indexOf(b.job))) {
  if (r.error) { lines.push(`${job.name}: ${r.error}`); continue; }
  const classes = [...r.found.keys()];
  const hit = job.expect.every((e) => met(e, classes));
  const extra = classes.filter((c) => !job.expect.some((e) => [].concat(e).includes(c)));
  if (job.expect.length) { expected++; if (hit) caught++; }
  // A clean build is blocked by a class it raises, or by a status that keeps it from handing over.
  const blocked = !job.expect.length && (classes.length > 0 || r.holds.length > 0);
  if (blocked) falseBlocks++;
  lines.push(`${job.name.padEnd(16)} expect [${job.expect.map(shown).join(", ")}] · ${job.expect.length ? (hit ? "CAUGHT" : "MISSED") : blocked ? "BLOCKED (false)" : "clean"} · raised [${classes.join(", ")}]${extra.length && job.expect.length ? ` (also ${extra.join(", ")})` : ""} · status ${r.status}`);
  for (const [cls, list] of r.found) lines.push(`    ${cls}: ${list.length} — ${list.slice(0, 2).join(" ; ")}`);
  if (!job.expect.length) for (const h of r.holds) lines.push(`    holds it: ${h}`);
}
lines.push(`\ncaught ${caught} of ${expected} expected classes; ${falseBlocks} clean builds blocked`);
console.log(lines.join("\n"));
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(HERE, "out", `${label}.txt`), `${lines.join("\n")}\n`);
