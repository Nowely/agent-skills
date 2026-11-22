// The checker's card bench: mutants of an accepted control card, each carrying one return class the owner or the blind
// review named, and frozen submissions with their own packs. Judged by which blocking classes each one raises.
//   node run.mjs [--skill <dir>] [--label <name>] [name ...]
// It writes out/<label>/<name>/ (check.txt, out/result.json) and out/<label>.txt here.
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
const PACKS = path.join(HERE, "packs");
const CONTROL = path.join(PACKS, "control26"), JUDGE_DATA = path.join(HERE, "corpus/data.js");
const CORPUS = path.join(HERE, "corpus");

// The control's own type findings are the kit against the drawing: the price in its kit class at 764 and 601, and
// "Доступно 1" in t-body (the class context.md names for values) at 280. Fair questions, so the control carries them in
// its ledger as proposals, and a clean build reads pending, not blocked. Its mutants carry the same ledger; each bound
// sits 2 points above what the control measures.
const CARRIED = [["card-764", "125 898,00 ₽", 27], ["card-601", "125 898,00 ₽ / месяц", 25], ["card-280", "Доступно 1", 14]]
  .map(([frame, landmark, max]) => ({ frame, landmark, property: "type", max, status: "proposed", category: "system",
    reason: "The kit's class for this role is drawn at another size; the kit's size is kept.", options: "A: keep the kit's size. B: a raw size as drawn." }));
const css = (rule) => ({ css: rule });
const js = (from, to) => ({ js: [from, to] });
// Each mutant: what it changes, and the class a blocking finding must name. The control must raise none.
const MUTANTS = [
  { name: "control", expect: [] },
  { name: "price-capped", expect: ["wrap"], change: css(".offer .amount { white-space: normal !important; max-width: 150px; }") },
  { name: "popover-noflip", expect: ["journey"], files: path.join(PACKS, "v25a") },
  { name: "small-type", expect: ["type"], change: css(".offer .cpu-model, .offer .freq, .offer .cc, .offer .th, .offer .ram, .offer .disks { font-size: 13px !important; line-height: 18px !important; }") },
  { name: "dropped-disk", expect: ["text"], change: js("o.disks.map(dsk)", "o.disks.slice(0, 2).map(dsk)") },
  { name: "overlap", expect: ["overlap"], change: css(".offer .cpu-model { margin-left: -60px; }") },
  { name: "column-shift", expect: ["offset"], change: css("[data-mode=\"wide\"] .ram { margin-left: 30px; }") },
  // The column shift's clean twin (doc 44, item 6): the wide row's padding moved 10 px, every relation kept.
  { name: "common-shift", expect: [], change: css("[data-mode=\"wide\"] .card { padding-left: 26px; padding-right: 6px; }") },
  { name: "order-swap", expect: ["offset"], change: css("[data-mode=\"mid\"] .stock .kit-icon { order: 1 !important; }") },
  { name: "disk-format", expect: ["text"], change: js("${esc(d.size)} × ${esc(d.count)}</span> <span class=\"t-muted\">", "${esc(d.count)} × ${esc(d.size)}</span> <span class=\"t-muted\">") },
  { name: "cut-sku", expect: ["cut"], change: css(".offer .sku { overflow: hidden; max-width: 120px; white-space: nowrap !important; }") },
  // Draft 28.3: a submission the blind review returned for its price at 486 set about 2 px smaller than drawn (bold
  // body text, not the kit's price style). Its own markup, so the control's journeys do not apply.
  { name: "c282c-price", expect: ["type"], files: path.join(PACKS, "c282c"), root: ".card", journeys: [] },
  { name: "large-type", expect: ["type"], change: css(".offer .cpu-model, .offer .freq, .offer .cc, .offer .th, .offer .ram, .offer .disks { font-size: 18px !important; line-height: 22px !important; }") },
];
// Frozen submissions, each checked with its own pack as its builder left it; the expected classes are the reasons
// they were returned (the owner's where the owner ruled).
const FROZEN = [
  { name: "frozen-25.1A", pack: path.join(PACKS, "v25a"), config: "design.json", expect: ["journey"] },
  { name: "frozen-25.1B", pack: path.join(PACKS, "v25b"), config: "pack/design.json", expect: ["wrap"] },
  { name: "frozen-26.1", pack: path.join(PACKS, "v26"), config: "design.json", expect: ["wrap"] },
  { name: "frozen-27", pack: path.join(PACKS, "v27"), config: ".design/offer/design.json", expect: ["type"] },
  { name: "frozen-control", pack: CONTROL, config: "design.json", expect: [], carry: true },
];

// The bench judges the frames, the sweep and the journeys: a lifecycle is the builder's to take, not the bench's. The
// frozen packs predate the lifecycle journey, so they are held to it no more than to the narrower sweep.
const LIFECYCLE = "the bench judges the frames, the sweep and the journeys; a lifecycle is the builder's to take";
// What the bench's own config leaves unchecked on the control's builds, whatever the checker does: their journeys run
// on the frames' page without each frame's width in the url, so the openers the frames show read as unchecked.
const OWN_GAPS = [/^\d+ controls? opens? something with no journey that opens and closes/];

const control = JSON.parse(fs.readFileSync(path.join(CONTROL, "design.json"), "utf8"));
const benchConfig = {
  url: "story.html?data=card-764", root: control.root, host: control.host, viewport: control.viewport, tolerance: 1, ledger: "deviations.json",
  frames: ["card-764", "card-601", "card-486", "card-280"].map((f) => ({ name: f, width: Number(f.slice(5)), url: `story.html?data=${f}&w=${f.slice(5)}`,
    spec: path.join(CORPUS, f, "spec.json"), reference: path.join(CORPUS, f, "reference.png") })),
  sweep: { ...control.sweep, from: 280, stories: [{ name: "dense", url: "story.html?data=dense" }, { name: "many", url: "story.html?data=many" }] },
  // The journeys on the frames' page: the control's others open its own stories, whose data the judge's file lacks.
  journeys: control.journeys.filter((j) => !j.url),
  lifecycle: LIFECYCLE,
};

function prepareMutant(m) {
  const dir = path.join(OUT, m.name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const from = m.files ?? CONTROL;
  for (const f of ["card.js", "card.css", "story.html"]) fs.copyFileSync(path.join(from, f), path.join(dir, f));
  fs.cpSync(path.join(CONTROL, "kit"), path.join(dir, "kit"), { recursive: true });
  fs.copyFileSync(JUDGE_DATA, path.join(dir, "data.js"));
  if (m.change?.css) fs.appendFileSync(path.join(dir, "card.css"), `\n${m.change.css}\n`);
  if (m.change?.js) {
    const file = path.join(dir, "card.js"), src = fs.readFileSync(file, "utf8");
    if (!src.includes(m.change.js[0])) throw new Error(`${m.name}: the change does not apply`);
    fs.writeFileSync(file, src.replace(m.change.js[0], m.change.js[1]));
  }
  fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify({ ...benchConfig, ...(m.root ? { root: m.root } : {}), ...(m.journeys ? { journeys: m.journeys } : {}) }, null, 1));
  // A mutant of the control carries the control's ledger; one built from other files starts with none.
  fs.writeFileSync(path.join(dir, "deviations.json"), JSON.stringify(m.files ? [] : CARRIED, null, 1));
  fs.writeFileSync(path.join(dir, "review.md"), "## Acceptance\n\n- bench: pass — the bench's own config\n");
  return { dir, config: path.join(dir, "design.json") };
}
function prepareFrozen(f) {
  const dir = path.join(OUT, f.name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.cpSync(f.pack, dir, { recursive: true, filter: (p) => !p.includes(`${path.sep}.skill`) });
  // The contract's narrowest width is 280; a pack that swept below it is held to the contract.
  const config = path.join(dir, f.config), c = JSON.parse(fs.readFileSync(config, "utf8"));
  if (c.sweep) c.sweep.from = Math.max(280, c.sweep.from);
  c.lifecycle ??= LIFECYCLE;
  fs.writeFileSync(config, JSON.stringify(c, null, 1));
  if (f.carry) {
    const ledger = path.join(path.dirname(config), c.ledger ?? "deviations.json");
    const own = fs.existsSync(ledger) ? JSON.parse(fs.readFileSync(ledger, "utf8")) : [];
    fs.writeFileSync(ledger, JSON.stringify([...own, ...CARRIED], null, 1));
  }
  return { dir, config };
}

// What a finding is, in the owner's classes. Pixel regions and forecasts are notes, not classes.
const classOf = (i) => ({ x: "offset", y: "offset", presence: "text", text: "text", line: "line", wrap: "wrap", overlap: "overlap",
  clipped: "cut", outside: "cut", covered: "cut", overflow: "cut", construct: "construct", align: "align", type: "type", width: "size",
  height: "size", gap: "gap", switch: "switch", resize: "resize" })[i.gap ? "gap" : i.property] ?? i.property;

function run({ dir, config }) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [design, "check", config], { cwd: path.dirname(config), env, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (out += d));
    const t = setTimeout(() => p.kill("SIGKILL"), 20 * 60 * 1000);
    p.on("close", (code) => { clearTimeout(t); fs.writeFileSync(path.join(dir, "check.txt"), out); resolve(code); });
  });
}
// The corpus leaves stand-in icons unnamed ("AMD", "?"): their texts are not a finding here, nor what keeps a frame
// incomplete.
const STAND_IN = /^(AMD|\?)$/;
// What keeps a complete check from handing over, beyond what the bench's own corpus and config cause: its status fail,
// or incomplete for a frame, the sweep, or another gap (an unanswered candidate, a story not swept). A clean build
// blocked this way is blocked as surely as by a finding.
function holds(r, own = []) {
  if (r.status === "fail") return ["status fail"];
  if (r.status !== "incomplete") return [];
  const frameHeld = (f) => f.verdict === "incomplete" && (f.unmeasured || f.imageOnly || f.missingReference || f.uncovered?.length
    || (f.unexpected ?? []).some((t) => !STAND_IN.test(t)));
  return [...(r.frames ?? []).filter(frameHeld).map((f) => `frame ${f.frame} incomplete`),
    ...(r.sweep?.verdict === "incomplete" ? [`sweep: ${r.sweep.reason ?? "incomplete"}`] : []),
    ...(r.gaps ?? []).filter((g) => !own.some((re) => re.test(g))).map((g) => `gap: ${g.slice(0, 120)}`)];
}
function read(config, unexpectedIsText = true, own = []) {
  const file = path.join(path.dirname(config), "out", "result.json");
  if (!fs.existsSync(file)) return { error: "no result" };
  const r = JSON.parse(fs.readFileSync(file, "utf8"));
  const found = new Map();
  const note = (cls, what) => { if (!found.has(cls)) found.set(cls, []); found.get(cls).push(what); };
  for (const f of r.frames ?? []) {
    for (const i of f.issues.filter((i) => i.status === "fail" && i.property !== "region")) note(classOf(i), `${f.frame} ${i.landmark} ${i.property}${i.delta !== undefined ? ` ${Math.round(i.delta)}` : ""}`);
    const unexpected = (f.unexpected ?? []).filter((t) => !STAND_IN.test(t));
    if (unexpectedIsText && unexpected.length) note("text", `${f.frame} not in the design: ${unexpected.slice(0, 3).join(" | ")}`);
  }
  for (const i of (r.sweep?.issues ?? []).filter((i) => i.status === "fail")) note(classOf(i), `sweep ${i.story ?? "page"} ${i.landmark} ${i.property} at ${i.ranges ?? ""}`);
  for (const j of (r.journeys ?? []).filter((j) => !j.pass)) note("journey", `${j.name}: ${String(j.failed).slice(0, 90)}`);
  return { found, status: r.status, holds: holds(r, own) };
}

const jobs = [
  // A mutant of the control has the bench's journeys; one built from other files keeps its own pack's gaps in view.
  ...MUTANTS.filter((m) => !only.length || only.includes(m.name)).map((m) => ({ ...m, ...prepareMutant(m), unexpectedIsText: true, own: OWN_GAPS })),
  ...FROZEN.filter((f) => !only.length || only.includes(f.name)).map((f) => ({ ...f, ...prepareFrozen(f), unexpectedIsText: false })),
];
const results = [];
const queue = [...jobs];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) {
    const job = queue.shift();
    const started = Date.now();
    await run(job);
    const r = read(job.config, job.unexpectedIsText, job.own);
    results.push({ job, r, seconds: Math.round((Date.now() - started) / 1000) });
    process.stderr.write(`${job.name} done in ${Math.round((Date.now() - started) / 1000)} s\n`);
  }
}));
let caught = 0, expected = 0, falseBlocks = 0;
const lines = [];
for (const { job, r } of results.sort((a, b) => jobs.indexOf(a.job) - jobs.indexOf(b.job))) {
  if (r.error) { lines.push(`${job.name}: ${r.error}`); continue; }
  const classes = [...r.found.keys()];
  const hit = job.expect.every((c) => classes.includes(c));
  const extra = classes.filter((c) => !job.expect.includes(c));
  if (job.expect.length) { expected++; if (hit) caught++; }
  // A clean build is blocked by a class it raises, or by a status that keeps it from handing over.
  const blocked = !job.expect.length && (classes.length > 0 || r.holds.length > 0);
  if (blocked) falseBlocks++;
  lines.push(`${job.name.padEnd(16)} expect [${job.expect.join(", ")}] · ${job.expect.length ? (hit ? "CAUGHT" : "MISSED") : blocked ? "BLOCKED (false)" : "clean"} · raised [${classes.join(", ")}]${extra.length && job.expect.length ? ` (also ${extra.join(", ")})` : ""} · status ${r.status}`);
  for (const [cls, list] of r.found) lines.push(`    ${cls}: ${list.length} — ${list.slice(0, 2).join(" ; ")}`);
  if (!job.expect.length) for (const h of r.holds) lines.push(`    holds it: ${h}`);
}
lines.push(`\ncaught ${caught} of ${expected} expected classes; ${falseBlocks} clean builds blocked`);
console.log(lines.join("\n"));
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(HERE, "out", `${label}.txt`), `${lines.join("\n")}\n`);
