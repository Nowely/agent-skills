#!/usr/bin/env node
// Does the design check find what it is for, and only that?
//
//   node evals/design-to-code.test.mjs
//
// Reads plugin/skills/design-to-code/scripts/ and evals/design-to-code/ (the offer-card case, prepare.mjs and score.mjs). The
// cases on core.mjs need nothing; the browser cases render the offer card with defects put in on purpose and need
// Playwright with Chromium where this runs. Without it they are reported as skipped, not passed.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  causes, compareFrame, ledgerFaults, pageText, parseXml, ranges, renderReport, specFromMetadata,
} from "../plugin/skills/design-to-code/scripts/core.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESIGN = path.join(HERE, "../plugin/skills/design-to-code/scripts/design.mjs");
const CASE = path.join(HERE, "design-to-code/cases/offer-card");

// ------------------------------------------------------------------ Figma outline

const RELATIVE = `<?xml version="1.0"?>
<frame id="1:1" name="Card 280" x="400" y="900" width="280" height="200">
  <text id="1:2" name="SKU &amp; code" x="20" y="20" width="100" height="16" />
  <frame id="1:3" name="Badges" x="20" y="42" width="200" height="22">
    <text id="1:4" name="New" x="8" y="0" width="26" height="22" />
  </frame>
  <group id="1:5" name="Price group" x="20" y="120" width="120" height="28">
    <text id="1:6" name="1 499 €" x="20" y="120" width="70" height="28" />
  </group>
  <text id="1:7" name="hidden note" x="0" y="0" width="10" height="10" hidden="true" />
  <text id="1:8" name="New" x="20" y="160" width="26" height="22" />
</frame>`;

const ABSOLUTE = RELATIVE
  .replace('id="1:2" name="SKU &amp; code" x="20" y="20"', 'id="1:2" name="SKU &amp; code" x="420" y="920"')
  .replace('name="Badges" x="20" y="42"', 'name="Badges" x="420" y="942"')
  .replace('name="New" x="8" y="0"', 'name="New" x="428" y="942"')
  .replace('name="Price group" x="20" y="120"', 'name="Price group" x="420" y="1020"')
  .replace('name="1 499 €" x="20" y="120"', 'name="1 499 €" x="420" y="1020"')
  .replace('name="New" x="20" y="160"', 'name="New" x="420" y="1060"');

test("the XML reader keeps elements and attributes and refuses a broken nesting", () => {
  const tree = parseXml(RELATIVE);
  assert.equal(tree.children[0].attrs.name, "Card 280");
  assert.equal(tree.children[0].children[0].attrs.name, "SKU & code");
  assert.throws(() => parseXml("<a><b></a>"), /closes/);
  assert.throws(() => parseXml("<a>"), /never closed/);
});

test("a Figma outline becomes the frame's text landmarks, read relative or absolute alike", () => {
  const rel = specFromMetadata(RELATIVE), abs = specFromMetadata(ABSOLUTE);
  assert.match(rel.source, /relative/);
  assert.match(abs.source, /absolute/);
  assert.deepEqual(rel.frame, { id: "1:1", name: "Card 280", width: 280, height: 200 });
  const expected = [
    { text: "SKU & code", box: { x: 20, y: 20, width: 100, height: 16 } },
    { text: "New", box: { x: 28, y: 42, width: 26, height: 22 } },
    // A group has no coordinate space: its child is placed in the frame's.
    { text: "1 499 €", box: { x: 20, y: 120, width: 70, height: 28 } },
    { text: "New", nth: 1, box: { x: 20, y: 160, width: 26, height: 22 } },
  ];
  const strip = (s) => s.landmarks.map(({ id, ...l }) => l);
  assert.deepEqual(strip(rel), expected);
  assert.deepEqual(strip(abs), expected);
  assert.equal(specFromMetadata(RELATIVE, { frame: "Badges" }).landmarks[0].text, "New");
  assert.throws(() => specFromMetadata(RELATIVE, { frame: "nope" }), /no node/);
});

// ------------------------------------------------------------------ comparison

const box = (x, y, width, height) => ({ x, y, width, height });
const SPEC = {
  frame: { name: "f", width: 300, height: 200 },
  landmarks: [
    { text: "SKU", box: box(20, 20, 60, 16) },
    { text: "New", box: box(28, 42, 26, 22) },
    { text: "Title", box: box(20, 74, 120, 24) },
    { text: "1 499 €", box: box(200, 20, 80, 28) },
    { text: "Buy", box: box(200, 60, 80, 20) },
  ],
};
const measured = (shift = {}, rootHeight = 200) => ({
  root: { width: 300, height: rootHeight },
  landmarks: SPEC.landmarks.map((l) => {
    const s = shift[l.text] ?? {};
    return { found: !s.missing, box: { ...l.box, y: l.box.y + (s.dy ?? 0), x: l.box.x + (s.dx ?? 0) }, align: l.box.x >= 200 ? "right" : "left" };
  }),
});

test("an offset is traced to where it starts, column by column, and those below it are marked inherited", () => {
  const r = compareFrame({ frame: "f", spec: SPEC, measured: measured({ New: { dy: 6 }, Title: { dy: 6 }, Buy: { dy: -3 } }, 206) });
  assert.equal(r.pass, false);
  assert.deepEqual(r.causes.map((c) => [c.after, c.before, c.step]), [["SKU", "New", 6], ["1 499 €", "Buy", -3]]);
  const y = Object.fromEntries(r.issues.filter((i) => i.property === "y").map((i) => [i.landmark, i.inherited]));
  assert.deepEqual(y, { New: false, Title: true, Buy: false });
});

test("the root's bottom is read against the lowest landmark, so a changed bottom padding is a cause", () => {
  const r = compareFrame({ frame: "f", spec: SPEC, measured: measured({}, 217) });
  assert.deepEqual(r.causes.map((c) => [c.before, c.step]), [["the bottom of the root", 17]]);
});

test("the ledger excuses what it accepts, holds what it proposes and does not excuse what it rejects", () => {
  const entry = (status) => [{ landmark: "New", property: "y", category: "owner", status, reason: "asked for more air" }];
  const shifted = measured({ New: { dy: 6 } });
  const at = (status) => compareFrame({ frame: "f", spec: { ...SPEC, landmarks: SPEC.landmarks.slice(0, 2) }, measured: { ...shifted, landmarks: shifted.landmarks.slice(0, 2) }, ledger: entry(status) });
  assert.equal(at("accepted").pass, true);
  assert.equal(at("accepted").issues[0].status, "accepted");
  assert.equal(at("proposed").pass, true);
  assert.equal(at("proposed").issues[0].status, "pending");
  assert.equal(at("rejected").pass, false);
  const capped = compareFrame({ frame: "f", spec: SPEC, measured: shifted, ledger: [{ ...entry("accepted")[0], max: 4 }] });
  assert.equal(capped.pass, false, "an entry with max does not cover a larger offset");
});

test("a text the ledger replaces is looked for as the page's text and reported", () => {
  const ledger = [{ landmark: "32 ядер", property: "text", actual: "32 ядра", category: "design-error", status: "accepted", reason: "plural form" }];
  assert.equal(pageText({ text: "32 ядер" }, "280", ledger), "32 ядра");
  assert.equal(pageText({ text: "32 ядер" }, "280", [{ ...ledger[0], frame: "601" }]), "32 ядер");
  const spec = { frame: { width: 100, height: 40 }, landmarks: [{ text: "32 ядер", box: box(0, 0, 50, 20) }] };
  const r = compareFrame({ frame: "280", spec, measured: { root: { width: 100, height: 40 }, landmarks: [{ found: true, box: box(0, 0, 50, 20), align: "left" }] }, ledger });
  assert.deepEqual(r.issues.map((i) => [i.property, i.status]), [["text", "accepted"]]);
});

test("a ledger entry without a reason, a known category or a known status is a fault", () => {
  assert.deepEqual(ledgerFaults([{ landmark: "New", property: "y", category: "owner", status: "accepted", reason: "x" }]), []);
  const faults = ledgerFaults([{ landmark: "New", property: "z", category: "taste", status: "maybe" }]).join("\n");
  for (const word of ["property", "category", "status", "reason"]) assert.match(faults, new RegExp(word));
});

test("font size, weight and line height are compared when the spec states them", () => {
  const spec = { frame: { width: 100, height: 40 }, landmarks: [{ text: "Price", box: box(0, 0, 50, 28), font: { size: 22, weight: 700, lineHeight: 28 } }] };
  const r = compareFrame({ frame: "f", spec, measured: { root: { width: 100, height: 40 }, landmarks: [{ found: true, box: box(0, 0, 50, 28), align: "left", font: { size: 20, weight: 700, lineHeight: 28 } }] } });
  assert.deepEqual(r.issues.map((i) => [i.property, i.expected, i.actual]), [["font", "size 22", "size 20"]]);
});

test("widths become ranges and the report leads with where to start", () => {
  assert.equal(ranges([300, 308, 316, 500, 324]), "300–324, 500");
  const r = compareFrame({ frame: "f", spec: SPEC, measured: measured({ New: { dy: 6 } }) });
  assert.match(renderReport({ frames: [r] }), /Start here: between “SKU” and “New” the vertical offset changes by \+6 px/);
  assert.equal(causes([], SPEC, { root: { height: 200 } }).length, 0);
});

// ------------------------------------------------------------------ in the browser

const playwright = (() => {
  for (const base of [path.join(process.cwd(), "noop.js"), DESIGN]) {
    for (const name of ["playwright", "@playwright/test", "playwright-core"]) {
      try { createRequire(base).resolve(name); return true; } catch { /* next */ }
    }
  }
  return false;
})();
const browser = { skip: playwright ? false : "Playwright is not installed where this runs" };

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "design-test-"));
const cli = (...args) => spawnSync(process.execPath, [DESIGN, ...args], { encoding: "utf8" });
const CONFIG = JSON.parse(fs.readFileSync(path.join(CASE, "case.json"), "utf8"));

// The reference card rendered once as the design: its specs and 2× images, in a directory a test copies.
let design;
function designDir() {
  if (design) return design;
  design = tmp();
  fs.copyFileSync(path.join(CASE, "reference.html"), path.join(design, "page.html"));
  fs.writeFileSync(path.join(design, "design.json"), JSON.stringify({
    url: "page.html", root: CONFIG.root, host: CONFIG.host, ledger: "deviations.json", sweep: CONFIG.sweep,
    frames: CONFIG.frames.map((f) => ({ ...f, spec: `design/${f.name}/spec.json`, reference: `design/${f.name}/reference.png` })),
  }));
  const r = cli("snapshot", path.join(design, "design.json"), "--images", "--scale", "2");
  assert.equal(r.status, 0, r.stderr);
  return design;
}

// A copy of the design directory whose page carries extra CSS and whose ledger holds the given entries.
function variant(css = "", ledger = []) {
  const dir = tmp();
  fs.cpSync(designDir(), dir, { recursive: true });
  const page = path.join(dir, "page.html");
  fs.writeFileSync(page, fs.readFileSync(page, "utf8").replace("</style>", `${css}\n</style>`));
  fs.writeFileSync(path.join(dir, "deviations.json"), JSON.stringify(ledger));
  return dir;
}
const check = (dir, ...flags) => {
  const r = cli("check", path.join(dir, "design.json"), ...flags);
  const result = fs.existsSync(path.join(dir, "out/result.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "out/result.json"), "utf8")) : null;
  return { ...r, result, dir };
};

test("the reference passes against its own snapshot, pixel for pixel", browser, () => {
  const r = check(variant());
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const f of r.result.frames) {
    assert.equal(f.pass, true);
    assert.equal(f.pixels.ratio, 0);
    assert.equal(f.pixels.sizeMatch, true);
  }
  assert.equal(r.result.sweep.pass, true);
});

test("a changed spacing fails and is traced to the pair it separates, in every frame", browser, () => {
  const r = check(variant(".badges { margin-top: 12px; }"), "--no-sweep");
  assert.equal(r.status, 1);
  for (const f of r.result.frames) {
    assert.deepEqual([f.causes[0].after, f.causes[0].before, f.causes[0].step], ["SKU AUR-14P-512", "New", 6], f.frame);
  }
  assert.match(r.stdout, /start here: between “SKU AUR-14P-512” and “New” vertically \+6 px/);
  assert.match(fs.readFileSync(path.join(r.dir, "out/report.md"), "utf8"), /Start here: between “SKU AUR-14P-512” and “New” the vertical offset changes by \+6 px/);
});

test("a smaller font is found even where its line height keeps every position", browser, () => {
  const r = check(variant(".price { font-size: 20px; }"), "--frame", "720");
  assert.equal(r.status, 1);
  const font = r.result.frames[0].issues.find((i) => i.property === "font");
  assert.deepEqual([font.landmark, font.expected, font.actual], ["1 499 €", "size 22", "size 20"]);
});

test("an accepted deviation passes, a proposed one passes as pending, an unlisted one fails", browser, () => {
  const css = ".card { padding-bottom: 28px; }";
  const entry = { landmark: "root", property: "height", category: "owner", reason: "the owner asked for more space below" };
  const accepted = check(variant(css, [{ ...entry, status: "accepted" }]), "--frame", "720");
  assert.equal(accepted.status, 0, accepted.stdout);
  const pending = check(variant(css, [{ ...entry, status: "proposed" }]), "--frame", "720");
  assert.equal(pending.status, 0);
  assert.match(pending.stdout, /pending: 1/);
  assert.equal(check(variant(css), "--frame", "720").status, 1);
});

test("the sweep finds a card that stops fitting between the frames, and where", browser, () => {
  const r = check(variant("@container (max-width: 419px) { .specs { grid-template-columns: repeat(2, 150px); } }"));
  assert.equal(r.status, 1);
  const overflow = r.result.sweep.issues.find((i) => i.property === "overflow" && i.landmark === "root");
  assert.ok(overflow, JSON.stringify(r.result.sweep.issues));
  assert.match(overflow.ranges, /^280–/);
  assert.ok(!/4[2-9]\d|[5-7]\d\d/.test(overflow.ranges), `seen only below 420: ${overflow.ranges}`);
});

test("a prepared run scores the unstyled start as failing, the reference as passing, and ignores the implementer's ledger", browser, () => {
  const root = tmp(), dir = path.join(root, "run");
  const prep = spawnSync(process.execPath, [path.join(HERE, "design-to-code/prepare.mjs"), "offer-card", dir, "--arm", "plain"], { encoding: "utf8" });
  assert.equal(prep.status, 0, prep.stderr);
  assert.match(prep.stdout, /Lay out the offer card/);
  assert.ok(!fs.existsSync(path.join(dir, "design.json")) && !fs.existsSync(path.join(dir, "design/720/spec.json")), "the plain arm gets images only");
  assert.ok(fs.existsSync(path.join(dir, "design/720/reference.png")));
  assert.ok(!fs.readdirSync(dir, { recursive: true }).some((f) => /reference\.html$/.test(f)), "the answer stays out");
  const score = () => JSON.parse(spawnSync(process.execPath, [path.join(HERE, "design-to-code/score.mjs"), dir], { encoding: "utf8" }).stdout);
  fs.writeFileSync(path.join(dir, "deviations.json"), JSON.stringify([{ landmark: "*", property: "*", category: "owner", status: "accepted", reason: "everything" }]));
  const start = score();
  assert.equal(start.pass, false);
  assert.equal(start.ledgerEntries, 1);
  fs.copyFileSync(path.join(CASE, "reference.html"), path.join(dir, "index.html"));
  const done = score();
  assert.equal(done.pass, true);
  assert.equal(done.framesPassed, "3/3");
});
