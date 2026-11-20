#!/usr/bin/env node
// Prepares one run of a design-to-code case: a working directory for the implementer and, beside it, the judge's copy.
//
//   node evals/design-to-code/prepare.mjs <case> <dir> [--arm skill|plain]
//
// Both arms get the unstyled start.html as index.html, the same reference images, context and
// frame specs without exact text widths, plus design.json. Judge-only sweep expectations stay private.
// <dir>.judge/
// gets its own design.json and the full specs, pointing at <dir>/index.html, and the case's deviations.json as
// its ledger when the case has one, for score.mjs; the reference implementation never enters <dir>. Prints the
// brief to give the implementer.
//
// Run it from a directory where Playwright resolves (see the skill's design.mjs).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESIGN = path.resolve(HERE, "../../plugin/skills/design-to-code/scripts/design.mjs");

const [name, target, ...rest] = process.argv.slice(2);
const arm = rest[0] === "--arm" ? rest[1] : "skill";
if (!name || !target || !["skill", "plain"].includes(arm)) {
  console.error("usage: prepare.mjs <case> <dir> [--arm skill|plain]");
  process.exit(2);
}
const caseDir = path.join(HERE, "cases", name);
if (!fs.existsSync(path.join(caseDir, "case.json"))) { console.error(`no case ${name} under ${path.join(HERE, "cases")}`); process.exit(2); }
const dir = path.resolve(target), judge = `${dir}.judge`;
for (const d of [dir, judge]) if (fs.existsSync(d) && fs.readdirSync(d).length) { console.error(`${d} is not empty`); process.exit(2); }

const c = JSON.parse(fs.readFileSync(path.join(caseDir, "case.json"), "utf8"));
const config = (url, design) => ({
  url, root: c.root, ...(c.host ? { host: c.host } : {}),
  frames: c.frames.map((f) => ({ name: f.name, width: f.width, spec: `${design}/${f.name}/spec.json`, reference: `${design}/${f.name}/reference.png` })),
  // The case is one static page: it is its own story, as no data drives it.
  ...(c.sweep ? { sweep: { ...c.sweep, stories: [{ name: "page", url: `${url}?story=page` }] } } : {}),
});
const write = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof data === "string" || Buffer.isBuffer(data) ? data : `${JSON.stringify(data, null, 2)}\n`); };

// The design: the reference rendered in a scratch directory, of which only the specs and images are kept.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "design-case-"));
try {
  fs.copyFileSync(path.join(caseDir, "reference.html"), path.join(scratch, "reference.html"));
  write(path.join(scratch, "design.json"), config("reference.html", "design"));
  execFileSync(process.execPath, [DESIGN, "snapshot", path.join(scratch, "design.json"), "--images", "--scale", String(c.scale ?? 1)], { stdio: ["ignore", "ignore", "inherit"] });
  for (const f of c.frames) {
    for (const file of ["reference.png", "spec.json"]) {
      const from = path.join(scratch, "design", f.name, file);
      write(path.join(judge, "design", f.name, file), fs.readFileSync(from));
      if (file === "reference.png") write(path.join(dir, "design", f.name, file), fs.readFileSync(from));
      else {
        // A Figma text box is not the width of its glyphs, so the implementer's spec does not compare widths.
        const { widths, ...spec } = JSON.parse(fs.readFileSync(from, "utf8"));
        write(path.join(dir, "design", f.name, file), { ...spec, source: "design" });
      }
    }
  }
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
fs.copyFileSync(path.join(caseDir, "start.html"), path.join(dir, "index.html"));
fs.copyFileSync(path.join(caseDir, "context.md"), path.join(dir, "design", "context.md"));
// Give both arms the same observable design data. Keep judge-only assertions private.
const workerConfig = config("index.html", "design");
if (workerConfig.sweep) {
  const { switches, align, ...publicSweep } = workerConfig.sweep;
  workerConfig.sweep = publicSweep;
}
write(path.join(dir, "design.json"), workerConfig);
const answers = path.join(caseDir, "deviations.json");
if (fs.existsSync(answers)) fs.copyFileSync(answers, path.join(judge, "deviations.json"));
write(path.join(judge, "design.json"), {
  ...config(path.relative(judge, path.join(dir, "index.html")).split(path.sep).join("/"), "design"),
  ...(fs.existsSync(answers) ? { ledger: "deviations.json" } : {}),
});
// The judge's own pack needs no review of its own: its acceptance list is the case.
write(path.join(judge, "review.md"), "# Judge\n\n## Acceptance list\n\n- the case's frames, sweep and answer key: judged by score.mjs\n");
write(path.join(judge, "run.json"), { case: name, arm, dir, prepared: new Date().toISOString() });
console.log(fs.readFileSync(path.join(caseDir, "brief.md"), "utf8").trim());
