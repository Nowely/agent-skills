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
  causes, compareFrame, contextTexts, joinContext, ledgerFaults, pageText, parseFigmaUrl, parseXml, ranges, renderReport,
  renderSummary, specFromMetadata, specFromRest, sweepIssues, switches,
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

// ------------------------------------------------------------------ Figma REST

const REST = {
  id: "1:1", name: "Card 280", type: "FRAME", absoluteBoundingBox: { x: 400, y: 900, width: 280, height: 200 },
  children: [
    { id: "1:2", type: "TEXT", name: "renamed layer", characters: "SKU  AUR-14P", absoluteBoundingBox: { x: 420, y: 920, width: 100, height: 16 },
      style: { fontSize: 12, fontWeight: 400, lineHeightPx: 16, textAlignHorizontal: "LEFT" }, fills: [{ type: "SOLID", color: { r: 0.478, g: 0.502, b: 0.549, a: 1 } }] },
    { id: "1:3", type: "INSTANCE", name: "Badge", absoluteBoundingBox: { x: 420, y: 942, width: 42, height: 22 }, children: [
      { id: "1:4", type: "TEXT", characters: "New", absoluteBoundingBox: { x: 428, y: 942, width: 26, height: 22 }, style: { fontSize: 13, fontWeight: 400, lineHeightPx: 22 } },
    ] },
    { id: "1:5", type: "TEXT", characters: "1 499 €", absoluteBoundingBox: { x: 560, y: 1020, width: 100, height: 28 },
      style: { fontSize: 22, fontWeight: 700, lineHeightPx: 28, textAlignHorizontal: "RIGHT" } },
    { id: "1:6", type: "TEXT", visible: false, characters: "hidden", absoluteBoundingBox: { x: 400, y: 900, width: 10, height: 10 } },
  ],
};

test("a Figma REST node becomes landmarks with the texts' characters, boxes, alignment, fonts and colours", () => {
  const spec = specFromRest(REST);
  assert.deepEqual(spec.frame, { id: "1:1", name: "Card 280", width: 280, height: 200 });
  assert.deepEqual(spec.landmarks.map(({ id, ...l }) => l), [
    { text: "SKU AUR-14P", box: box(20, 20, 100, 16), align: "left", font: { size: 12, weight: 400, lineHeight: 16, color: "#7a808c" } },
    { text: "New", box: box(28, 42, 26, 22), font: { size: 13, weight: 400, lineHeight: 22 } },
    { text: "1 499 €", box: box(160, 120, 100, 28), align: "right", font: { size: 22, weight: 700, lineHeight: 28 } },
  ]);
  assert.deepEqual(parseFigmaUrl("https://www.figma.com/design/AbC123/Shop?node-id=12-34&t=x"), { key: "AbC123", id: "12:34" });
  assert.throws(() => parseFigmaUrl("https://www.figma.com/design/AbC123/Shop"), /node-id/);
});

test("a selected text is its own landmark at the frame origin", () => {
  for (const coords of ["relative", "absolute"]) {
    assert.deepEqual(specFromMetadata(RELATIVE, { frame: "1:2", coords }).landmarks,
      [{ id: "1:2", text: "SKU & code", box: box(0, 0, 100, 16) }]);
  }
  assert.deepEqual(specFromRest(REST.children[0]).landmarks, [{
    id: "1:2", text: "SKU AUR-14P", box: box(0, 0, 100, 16), align: "left",
    font: { size: 12, weight: 400, lineHeight: 16, color: "#7a808c" },
  }]);
  assert.deepEqual(specFromMetadata(RELATIVE, { frame: "1:7" }).landmarks, []);
  assert.deepEqual(specFromRest(REST.children[3]).landmarks, []);
});

// ------------------------------------------------------------------ comparison

function box(x, y, width, height) { return { x, y, width, height }; }
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
// The page as the spec, with per-text shifts { dx, dy, dh } and the root's size.
const measured = (shift = {}, { height = 200, width = 300 } = {}) => ({
  root: { width, height },
  landmarks: SPEC.landmarks.map((l) => {
    const s = shift[l.text] ?? {};
    return { found: !s.missing, box: { ...l.box, x: l.box.x + (s.dx ?? 0), y: l.box.y + (s.dy ?? 0), height: l.box.height + (s.dh ?? 0) }, align: l.box.x >= 200 ? "right" : "left" };
  }),
});
const compare = (shift, root, ledger) => compareFrame({ frame: "f", spec: SPEC, measured: measured(shift, root), ledger });

test("an offset is traced to where it starts, column by column, and those below it are marked inherited", () => {
  const r = compare({ New: { dy: 6 }, Title: { dy: 6 }, Buy: { dy: -3 } }, { height: 206 });
  assert.equal(r.pass, false);
  assert.deepEqual(r.causes.map((c) => [c.after, c.before, c.step]), [["SKU", "New", 6], ["1 499 €", "Buy", -3]]);
  const y = Object.fromEntries(r.issues.filter((i) => i.property === "y").map((i) => [i.landmark, i.inherited]));
  assert.deepEqual(y, { New: false, Title: true, Buy: false });
});

test("the root comes first: a narrower root is its own finding, not one of every text anchored right", () => {
  const r = compare({ "1 499 €": { dx: -16 }, Buy: { dx: -16 } }, { width: 284 });
  assert.deepEqual(r.causes.map((c) => [c.after, c.before, c.step]), [["the design's width", "the root", -16]]);
  assert.deepEqual(r.issues.map((i) => [i.landmark, i.property]), [["root", "width"]]);
});

test("the root's bottom is read against the lowest landmark, so a changed bottom padding is a cause", () => {
  const r = compare({}, { height: 217 });
  assert.deepEqual(r.causes.map((c) => [c.before, c.step]), [["the bottom of the root", 17]]);
});

test("a text box drawn taller than its line moves nothing below it, and no cause is invented for that", () => {
  const r = compare({ New: { dh: -4 } });
  assert.equal(r.causes.length, 0, JSON.stringify(r.causes));
  assert.deepEqual(r.issues.map((i) => [i.landmark, i.property]), [["New", "height"]]);
});

test("an accepted change of size excuses everything it pushes down; a proposed one leaves it pending", () => {
  const entry = (status) => [{ landmark: ["New"], property: "height", category: "system", status, reason: "the kit's badge is 3 px lower" }];
  const shrunk = { New: { dh: -3 }, Title: { dy: -3 } };
  assert.equal(compare(shrunk, { height: 197 }).pass, false);
  const accepted = compare(shrunk, { height: 197 }, entry("accepted"));
  assert.equal(accepted.pass, true, JSON.stringify(accepted.issues));
  assert.deepEqual(accepted.issues.map((i) => [i.landmark, i.property, i.status]), [["New", "height", "accepted"], ["Title", "y", "accepted"], ["root", "height", "accepted"]]);
  const pending = compare(shrunk, { height: 197 }, entry("proposed"));
  assert.equal(pending.pass, false);
  assert.ok(pending.issues.every((i) => i.status === "pending"));
  const capped = compare(shrunk, { height: 197 }, [{ ...entry("accepted")[0], max: 2 }]);
  assert.equal(capped.pass, false, "an entry with max does not cover a larger change");
});

test("a text the ledger replaces is looked for as the page's text and reported", () => {
  const ledger = [{ landmark: "32 ядер", property: "text", actual: "32 ядра", category: "design-error", status: "accepted", decidedBy: "owner", reason: "plural form" }];
  assert.equal(pageText({ text: "32 ядер" }, "280", ledger), "32 ядра");
  assert.equal(pageText({ text: "32 ядер" }, "280", [{ ...ledger[0], frame: "601" }]), "32 ядер");
  const spec = { frame: { width: 100, height: 40 }, landmarks: [{ text: "32 ядер", box: box(0, 0, 50, 20) }] };
  const r = compareFrame({ frame: "280", spec, measured: { root: { width: 100, height: 40 }, landmarks: [{ found: true, box: box(0, 0, 50, 20), align: "left" }] }, ledger });
  assert.deepEqual(r.issues.map((i) => [i.property, i.status]), [["text", "accepted"]]);
});

test("a ledger entry needs a reason, a known category and status, and only an accepted one may use *", () => {
  assert.deepEqual(ledgerFaults([{ landmark: "New", property: "y", category: "owner", status: "accepted", decidedBy: "owner", reason: "x" }]), []);
  const faults = ledgerFaults([{ landmark: "New", property: "z", category: "taste", status: "rejected" }]).join("\n");
  for (const word of ["property", "category", "status", "reason"]) assert.match(faults, new RegExp(word));
  assert.match(ledgerFaults([{ landmark: "*", property: "*", category: "ux", status: "proposed", reason: "later" }]).join(), /only an accepted entry may use \*/);
  assert.match(ledgerFaults([{ property: "region", category: "system", status: "accepted", decidedBy: "owner", reason: "kit icon" }]).join(), /region/);
});

test("font size, weight, line height and colour are compared when the spec states them", () => {
  const spec = { frame: { width: 100, height: 40 }, landmarks: [{ text: "Price", box: box(0, 0, 50, 28), font: { size: 22, weight: 700, lineHeight: 28, color: "#1f2329" } }] };
  const r = compareFrame({ frame: "f", spec, measured: { root: { width: 100, height: 40 }, landmarks: [{ found: true, box: box(0, 0, 50, 28), align: "left", font: { size: 20, weight: 700, lineHeight: 28, color: "#2457c5" } }] } });
  assert.deepEqual(r.issues.map((i) => [i.property, i.expected, i.actual]), [["font", "size 22", "size 20"], ["font", "color #1f2329", "color #2457c5"]]);
});

test("a differing area outside the texts is a finding with its place, excused by a region entry; one that moved with a text is not", () => {
  const regions = [{ box: box(20, 20, 96, 96), area: 4000, near: "New" }, { box: box(200, 60, 80, 3), area: 240, near: "Buy", movedWith: "Buy" }];
  const r = compareFrame({ frame: "f", spec: SPEC, measured: measured(), regions });
  assert.deepEqual(r.issues.map((i) => [i.landmark, i.property, i.status]), [["region near “New”", "region", "fail"]]);
  assert.equal(r.moved, 1);
  const ok = compareFrame({ frame: "f", spec: SPEC, measured: measured(), regions,
    ledger: [{ property: "region", region: [16, 16, 104, 104], category: "system", status: "accepted", decidedBy: "owner", reason: "the kit's image" }] });
  assert.equal(ok.pass, true);
  const allProperties = { landmark: "New", property: "*", category: "system", status: "accepted", decidedBy: "owner", reason: "kit badge" };
  assert.equal(compareFrame({ frame: "f", spec: SPEC, measured: measured(), regions, ledger: [allProperties] }).pass, false);
  assert.equal(compareFrame({ frame: "f", spec: SPEC, measured: measured(), regions, ledger: [{ ...allProperties, landmark: "*" }] }).pass, true);
});

test("image-only root height respects each ledger status and measured limit", () => {
  const entry = { landmark: "root", property: "height", category: "owner", reason: "bottom padding", max: 8 };
  const height = (status, delta) => compareFrame({ frame: "f", spec: { frame: { width: 50, height: 40 }, landmarks: [] },
    measured: { root: { width: 50, height: 40 + delta }, landmarks: [] }, ledger: [{ ...entry, status }] });
  for (const [status, expected] of [["accepted", "accepted"], ["proposed", "pending"]]) {
    const r = height(status, 8);
    assert.equal(r.issues[0].status, expected);
    assert.equal(r.verdict, "incomplete");
    assert.equal(height(status, 8.01).verdict, "fail");
  }
});

test("layout changes are found between widths and held against the ones the design names", () => {
  const probes = [800, 640, 632, 420, 416, 300].map((width) => ({ width, rows: width >= 640 ? "v==" : width >= 420 ? "v=v" : "vvv" }));
  assert.deepEqual(switches(probes).seen, ["632–640", "416–420"]);
  assert.deepEqual(switches(probes, [640, 420], 8).issues, []);
  const late = switches(probes, [700, 420], 8).issues.map((i) => i.landmark);
  assert.deepEqual(late, ["at 700", "632–640"]);
});

test("widths become ranges and the reports lead with the root and where to start", () => {
  assert.equal(ranges([300, 308, 316, 500, 324]), "300–324, 500");
  const r = compare({ New: { dy: 6 } }, { height: 206 });
  assert.match(renderReport({ frames: [r] }), /Start here: between “SKU” and “New” vertically \+6 px/);
  const summary = renderSummary({ frames: [r] });
  assert.match(summary, /start here: between “SKU” and “New” vertically \+6 px/);
  assert.ok(summary.indexOf("root height") < summary.indexOf("New y"), "the root is listed first");
  assert.equal(causes([], SPEC, { root: { width: 300, height: 200 } }).length, 0);
});

test("a sweep entry bounded by max excuses the widths it covers and not a larger difference at another", () => {
  const ledger = [{ landmark: ".v", property: "align", max: 1.02, category: "platform", status: "accepted", decidedBy: "owner", reason: "subpixel" }];
  const probes = [
    { width: 601, issues: [{ landmark: ".v", property: "align", delta: 1.02, actual: "left edges 1.02 px apart" }] },
    { width: 624, issues: [{ landmark: ".v", property: "align", delta: 8, actual: "left edges 8 px apart" }] },
  ];
  assert.deepEqual(sweepIssues(probes, ledger).map((i) => [i.ranges, i.status, i.delta]), [["601", "accepted", 1.02], ["624", "fail", 8]]);
});

test("texts come from the design context by node id when the outline carries only layer names", () => {
  const code = `<div data-node-id="1:1" style={{ width: 280 }}>
  <p className="text-[12px]" data-node-id="1:2">SKU AUR-14P</p>
  <div data-node-id="1:3"><p className={cx("a", "b")}>{"New"}</p></div>
  <p data-node-id="1:5">125 898,00 ₽ <span>/ месяц</span></p>
  <img src={imgA} data-node-id="1:6" alt="" />
</div>`;
  assert.deepEqual(Object.fromEntries(contextTexts(code)), { "1:2": "SKU AUR-14P", "1:3": "New", "1:5": "125 898,00 ₽ / месяц", "1:1": "SKU AUR-14P New 125 898,00 ₽ / месяц" });
  const spec = { frame: { width: 280, height: 100 }, landmarks: [
    { text: "Value", id: "1:2", box: box(0, 0, 50, 16) }, { text: "Value", id: "1:5", nth: 1, box: box(0, 40, 90, 20) }, { text: "Description", id: "9:9", box: box(0, 70, 50, 16) },
  ] };
  const joined = joinContext(spec, code);
  assert.deepEqual(joined.spec.landmarks.map((l) => [l.text, l.nth]), [["SKU AUR-14P", undefined], ["125 898,00 ₽ / месяц", undefined], ["Description", undefined]]);
  assert.deepEqual([joined.joined, joined.missing], [["1:2", "1:5"], ["9:9"]]);
  // What the code does not state is not guessed: an expression, an unknown entity, code that does not parse.
  const doubtful = contextTexts(`<div style={{ a: { b: { c: 1 } } }}><p data-node-id="2:1">{count} cores</p><p data-node-id="2:2">{\`\${ram} GB\`}</p>
<p data-node-id="2:3">&quot;Pro&quot;&#8239;14</p><p data-node-id="2:4">x&weird;</p><p data-node-id="2:5">{\`Доступно 1\`}</p></div>`);
  assert.deepEqual(Object.fromEntries(doubtful), { "2:3": '"Pro" 14', "2:5": "Доступно 1" });
  assert.equal(contextTexts('<div data-node-id="1:1"><p data-node-id="1:2">A</p>').size, 0);
  // Code around the JSX is not markup; a literal is taken as written; an id seen twice or an escape is not guessed.
  const tricky = contextTexts(`function A() { return (<div><p data-node-id="3:1">New</p><p data-node-id="3:2">{"14\\" screen"}</p>
<p data-node-id="3:3">{"R&amp;D"}</p><p data-node-id="3:4">x&#99999999;</p><p title="data-node-id='9:9'" data-node-id="3:5">Five</p>
<p data-node-id="3:6">A</p><p data-node-id="3:6">B</p></div>); }
// <p data-node-id="3:1">Old</p>
const s = "<p data-node-id='3:5'>Str</p>";`);
  assert.deepEqual(Object.fromEntries(tricky), { "3:1": "New", "3:3": "R&amp;D", "3:5": "Five" });
});

test("an entry bounded by max covers only differences that have a size", () => {
  const probes = [{ width: 320, issues: [{ landmark: "A × B", property: "overlap", actual: "40 × 12 px" }] }];
  const ledger = [{ landmark: "A × B", property: "overlap", max: 1, category: "platform", status: "accepted", decidedBy: "owner", reason: "tiny" }];
  assert.equal(sweepIssues(probes, ledger)[0].status, "fail");
  assert.equal(sweepIssues(probes, [{ ...ledger[0], max: undefined }])[0].status, "accepted");
});

test("a frame's size is held to the ledger's max as measured, not as rounded for display", () => {
  const entry = (max) => [{ landmark: "root", property: "width", max, category: "platform", status: "accepted", decidedBy: "owner", reason: "subpixel" }];
  assert.equal(compare({}, { width: 301.004 }, entry(1)).issues.find((i) => i.property === "width").status, "fail");
  assert.equal(compare({}, { width: 301.015625 }, entry(1.019)).issues.find((i) => i.property === "width").status, "accepted");
});

test("a proposal still counts in the score: relabelling a failure is no progress", () => {
  const failing = compare({}, { height: 217 });
  const proposed = compare({}, { height: 217 }, [{ landmark: "root", property: "height", category: "owner", status: "proposed", reason: "more air" }]);
  const accepted = compare({}, { height: 217 }, [{ landmark: "root", property: "height", category: "owner", status: "accepted", decidedBy: "owner", reason: "more air" }]);
  assert.equal(proposed.score, failing.score);
  assert.equal(accepted.score, 0);
});

test("a frame waiting for a decision says so, not that it failed", () => {
  const r = compare({}, { height: 217 }, [{ landmark: "root", property: "height", category: "owner", status: "proposed", reason: "more air" }]);
  assert.match(renderSummary({ frames: [r] }), /f: awaiting a decision on 1/);
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
// Whether a family is installed here, as fontconfig reports it; a stack's fallback depends on it.
const hasFont = (family) => (spawnSync("fc-list", [":", "family"], { encoding: "utf8" }).stdout ?? "").includes(family);

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "design-test-"));
const cli = (...args) => spawnSync(process.execPath, [DESIGN, ...args], { encoding: "utf8" });
const CONFIG = JSON.parse(fs.readFileSync(path.join(CASE, "case.json"), "utf8"));

// The reference card rendered once as the design: its specs and 2× images, in a directory a test copies.
let design;
// What a check expects of every pack before it can pass: the acceptance list in review.md.
const REVIEW = "# Review\n\n## The acceptance list\n\n| Item | Checked by | Result |\n|---|---|---|\n| every frame | its frame | pass — reference captured |\n";
function designDir() {
  if (design) return design;
  design = tmp();
  fs.copyFileSync(path.join(CASE, "reference.html"), path.join(design, "page.html"));
  fs.writeFileSync(path.join(design, "design.json"), JSON.stringify({
    url: "page.html", root: CONFIG.root, host: CONFIG.host, ledger: "deviations.json",
    sweep: { ...CONFIG.sweep, stories: [{ name: "page", url: "page.html?dense" }] },
    frames: CONFIG.frames.map((f) => ({ ...f, spec: `design/${f.name}/spec.json`, reference: `design/${f.name}/reference.png` })),
  }));
  fs.writeFileSync(path.join(design, "review.md"), REVIEW);
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
// A complete check of the offer card with a coarse sweep: the gallery and the handoff come only from complete checks.
const quick = (dir) => {
  const file = path.join(dir, "design.json"), c = JSON.parse(fs.readFileSync(file, "utf8"));
  fs.writeFileSync(file, JSON.stringify({ ...c, sweep: { ...c.sweep, step: 240 } }));
  return dir;
};
const check = (dir, ...flags) => {
  const r = cli("check", path.join(dir, "design.json"), ...flags);
  const result = fs.existsSync(path.join(dir, "out/result.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "out/result.json"), "utf8")) : null;
  return { ...r, result, dir };
};

// A fixed-size frame keeps changes to text, pixels and the state that opens the frame independent.
function smallFrame(body = "<span>Ready</span>", frames = [{ name: "frame" }]) {
  const dir = tmp(), page = path.join(dir, "page.html"), config = path.join(dir, "design.json");
  const markup = (html) => `<!doctype html><style>body{margin:0}main{position:relative;width:300px;height:80px;background:white;font:20px/24px monospace}</style>${html}`;
  const write = (html) => fs.writeFileSync(page, markup(html));
  write(`<main>${body}</main>`);
  fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
  fs.writeFileSync(config, JSON.stringify({ url: "page.html", root: "main", ledger: "ledger.json",
    frames: frames.map((f, i) => ({ width: 300, spec: `${i}.json`, reference: `${i}.png`, ...f })),
    sweep: { from: 300, to: 300, stories: [{ name: "dense", url: "page.html?dense" }] } }));
  const snap = cli("snapshot", config, "--images");
  assert.equal(snap.status, 0, snap.stderr);
  return { dir, page, config, write };
}

test("extra text inside a matched node and text under an invisible parent cannot pass a full spec", browser, () => {
  const f = smallFrame();
  f.write("<main><span>Ready now</span></main>");
  let result = check(f.dir);
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.deepEqual(result.result.frames[0].unexpected, ["now"]);
  assert.match(result.stdout, /page text not in the design \(1\): “now”/);
  f.write('<main><div style="opacity:0"><span>Ready</span></div></main>');
  result = check(f.dir);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.ok(result.result.frames[0].issues.some((i) => i.landmark === "Ready" && i.actual === "missing"));
  f.write('<main><span style="color:transparent">Ready</span></main>');
  assert.ok(check(f.dir).result.frames[0].issues.some((i) => i.landmark === "Ready" && i.actual === "missing"));
  f.write('<main><div style="clip-path:inset(100%)"><span>Ready</span></div></main>');
  assert.ok(check(f.dir).result.frames[0].issues.some((i) => i.landmark === "Ready" && i.actual === "missing"));
  fs.writeFileSync(path.join(f.dir, "ledger.json"), JSON.stringify([{ landmark: "Ready", property: "presence",
    category: "owner", status: "accepted", decidedBy: "owner", reason: "omit the label" }]));
  const allowed = check(f.dir);
  assert.equal(allowed.status, 0, allowed.stdout + allowed.stderr);
  fs.writeFileSync(path.join(f.dir, "ledger.json"), "[]");
  f.write('<main><div style="width:30px;overflow:hidden;white-space:nowrap"><span>Ready</span></div></main>');
  const clipped = check(f.dir);
  assert.equal(clipped.status, 1, clipped.stdout + clipped.stderr);
  assert.ok(clipped.result.frames[0].issues.some((i) => i.landmark === "Ready" && i.property === "clipped" && i.delta > 0));
  f.write('<main><span>Ready&#8203;</span><span style="position:absolute;clip-path:inset(100%)">Hidden</span></main>');
  const unchanged = check(f.dir);
  assert.equal(unchanged.status, 0, unchanged.stdout + unchanged.stderr);
  assert.equal(unchanged.result.frames[0].pixels.ratio, 0);
});

test("an eleventh independent region still fails when the ledger accepts the ten larger regions", browser, () => {
  const f = smallFrame(), marks = [], ledger = [];
  for (let i = 0; i < 11; i++) {
    const x = 5 + i * 22, side = i === 10 ? 6 : 10;
    marks.push(`<i style="position:absolute;left:${x}px;top:40px;width:${side}px;height:${side}px;background:black"></i>`);
    if (i !== 10) ledger.push({ property: "region", region: [x, 40, side, side], category: "owner", status: "accepted", decidedBy: "owner", reason: "accepted mark" });
  }
  f.write(`<main><span>Ready</span>${marks.join("")}</main>`);
  fs.writeFileSync(path.join(f.dir, "ledger.json"), JSON.stringify(ledger));
  const r = check(f.dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  const regions = r.result.frames[0].issues.filter((i) => i.property === "region");
  assert.equal(regions.filter((i) => i.status === "accepted").length, 10);
  assert.deepEqual(regions.filter((i) => i.status === "fail").map((i) => i.box.x), [225]);
});

test("combining marks, soft hyphens and bidi controls alone do not implicate an installed font", browser, () => {
  const f = smallFrame();
  f.write('<style>@font-face{font-family:Probe;src:local("Arial"),local("Liberation Sans"),local("DejaVu Sans")}</style>'
    + '<main style="font-family:Probe, sans-serif"><span>Cafe\u0301 co\u00adoperate USD\u200e</span></main>');
  const r = check(f.dir);
  assert.deepEqual(r.result.frames[0].fontsMissing, [], r.stdout);
});

test("setup can create the root and lazy images beyond it do not block measurement", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config));
  cfg.frames[0].setup = [{ click: "button" }];
  cfg.frames[0].viewport = 640;
  fs.writeFileSync(f.config, JSON.stringify(cfg));
  f.write(`<style>@media(min-width:400px){main{background:red}}</style>
<button onclick="this.outerHTML='<main><span>Ready</span></main>'">Open</button>
<div style="height:18000px"></div><img loading="lazy" src="0.png">`);
  const run = spawnSync(process.execPath, [DESIGN, "check", f.config, "--no-sweep"], { encoding: "utf8", timeout: 25000 });
  assert.equal(run.status, 0, run.error?.message ?? run.stdout + run.stderr);
  cfg.frames[0].setup = [];
  fs.writeFileSync(f.config, JSON.stringify(cfg));
  f.write('<div style="height:18000px"></div><main><span>Ready</span><img loading="lazy" style="position:absolute;width:100px;height:20px;top:40px;left:0" src="0.png"></main>');
  const inside = spawnSync(process.execPath, [DESIGN, "check", f.config, "--no-sweep"], { encoding: "utf8", timeout: 25000 });
  assert.equal(inside.status, 1, inside.error?.message ?? inside.stdout + inside.stderr);
  assert.ok(JSON.parse(fs.readFileSync(path.join(f.dir, "out/result.json"))).frames[0].pixels.ratio > 0);
});

test("a root absent on the first check stays absent in Before after it is built", browser, () => {
  const f = smallFrame(), html = fs.readFileSync(f.page);
  f.write("<aside>Existing page</aside>");
  const initial = check(f.dir);
  assert.equal(initial.status, 2, initial.stdout + initial.stderr);
  assert.match(initial.result.frames[0].beforeUnavailable, /absent/);
  assert.equal(initial.result.score, null);
  fs.writeFileSync(f.page, html);
  const final = check(f.dir);
  assert.equal(final.status, 0, final.stdout + final.stderr);
  assert.equal(final.result.best.round, 2);
  assert.match(fs.readFileSync(path.join(f.dir, "out/gallery.html"), "utf8"), /<figcaption>Before<\/figcaption>Root main was absent[^<]*<\/figure>/);
});

test("Before retains the first image and labels changed or unrecorded capture settings", browser, () => {
  const f = smallFrame(), cfg = JSON.parse(fs.readFileSync(f.config));
  fs.appendFileSync(f.page, `<button id="other">Change state</button><script>
    const root = document.querySelector("main");
    if (location.search) root.textContent = "Other data";
    document.querySelector("#other").onclick = () => root.textContent = "Selected";
  </script>`);
  const out = path.join(f.dir, "out"), baseline = path.join(out, "before");
  const capture = (frame) => {
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, frames: [{ ...cfg.frames[0], ...frame }] }));
    const snap = cli("snapshot", f.config, "--images", "--force");
    assert.equal(snap.status, 0, snap.stderr);
    const checked = check(f.dir);
    assert.equal(checked.status, 0, checked.stdout + checked.stderr);
    return { frame: checked.result.frames[0], html: fs.readFileSync(path.join(out, "gallery.html"), "utf8"),
      handoff: fs.readFileSync(path.join(out, "handoff.md"), "utf8") };
  };
  capture({});
  const png = path.join(baseline, fs.readdirSync(baseline).find((file) => file.endsWith(".png")));
  const first = fs.readFileSync(png);
  for (const settings of [{ width: 460 }, { url: "page.html?other" }, { setup: [{ click: "#other" }] }]) {
    const changed = capture(settings);
    assert.match(changed.frame.beforeComparison, /different capture settings/);
    assert.match(changed.html, /<figcaption>Before — different capture settings, not comparable<\/figcaption>/);
    assert.match(changed.handoff, /Before: different capture settings, not comparable/);
    assert.ok(changed.html.includes(first.toString("base64")));
    assert.deepEqual(fs.readFileSync(png), first);
  }
  f.write("<main>Updated at the same URL</main>");
  const same = capture({});
  assert.equal(same.frame.beforeComparison, undefined);
  assert.match(same.html, /<figcaption>Before<\/figcaption>/);
  assert.match(same.handoff, /confirm the rendered data and theme/);
  assert.notDeepEqual(fs.readFileSync(path.join(out, same.frame.images.page)), first);
  fs.unlinkSync(png.replace(/\.png$/, ".sha256")); // A capture written by an older checker.
  const old = capture({});
  assert.match(old.html, /Before — capture settings unknown/);
  assert.match(old.handoff, /Before: capture settings unknown/);
  assert.deepEqual(fs.readFileSync(png), first);
});

test("state names keep separate captures", browser, () => {
  const f = smallFrame("Ready", [{ name: "Оплачен" }, { name: "Отменён" }, { name: "Old frame" }]);
  const cfg = JSON.parse(fs.readFileSync(f.config));
  cfg.frames[1].url = "other.html";
  fs.writeFileSync(f.config, JSON.stringify(cfg));
  fs.writeFileSync(path.join(f.dir, "other.html"), fs.readFileSync(f.page, "utf8").replace("background:white", "background:yellow"));
  const first = check(f.dir), frames = first.result.frames;
  assert.equal(new Set(frames.map((frame) => frame.images.page)).size, 3);
  const beforeTags = () => [...fs.readFileSync(path.join(f.dir, "out/gallery.html"), "utf8")
    .matchAll(/<figcaption>Before<\/figcaption><img src="([^"]+)"/g)].map((m) => m[1]);
  assert.notEqual(beforeTags()[0], beforeTags()[1]);
});

test("the reference passes against its own snapshot, with no pixel different", browser, () => {
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
  assert.match(fs.readFileSync(path.join(r.dir, "out/report.md"), "utf8"), /Start here: between “SKU AUR-14P-512” and “New” vertically \+6 px/);
});

test("when a neighbour grows, start here names its width, not the texts it pushes along", browser, () => {
  const r = check(variant(".badge.new { letter-spacing: 3px; }"), "--frame", "720");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /start here: the width of “New” changes by \+\d+(\.\d+)? px/);
});

test("a smaller font is found even where its line height keeps every position", browser, () => {
  const r = check(variant(".price { font-size: 20px; }"), "--frame", "720");
  assert.equal(r.status, 1);
  const font = r.result.frames[0].issues.find((i) => i.property === "font");
  assert.deepEqual([font.landmark, font.expected, font.actual], ["1 499 €", "size 22", "size 20"]);
});

test("an accepted deviation passes, a proposed one remains pending, an unlisted one fails", browser, () => {
  const css = ".card { padding-bottom: 28px; }";
  const entry = { landmark: "root", property: "height", category: "owner", reason: "the owner asked for more space below" };
  const accepted = check(variant(css, [{ ...entry, status: "accepted", decidedBy: "owner" }]), "--frame", "720");
  assert.equal(accepted.status, 0, accepted.stdout);
  const pending = check(variant(css, [{ ...entry, status: "proposed" }]), "--frame", "720");
  assert.equal(pending.status, 3);
  assert.match(pending.stdout, /pending: 1/);
  assert.equal(check(variant(css), "--frame", "720").status, 1);
});

test("a proposed text alternative reports what the page actually contains", browser, () => {
  const entry = { landmark: "New", property: "text", actual: "Fresh", category: "owner", status: "proposed", reason: "consider a different label" };
  const original = check(variant("", [entry]), "--frame", "720");
  assert.equal(original.status, 0, original.stdout + original.stderr);
  assert.ok(!original.result.frames[0].issues.some((issue) => issue.landmark === "New" && ["presence", "text"].includes(issue.property)));
  const changed = variant("", [entry]);
  const file = path.join(changed, "page.html");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(">New<", ">Fresh<"));
  const pending = check(changed, "--frame", "720");
  assert.notEqual(pending.status, 0, pending.stdout + pending.stderr);
  assert.ok(pending.result.frames[0].issues.some((issue) => issue.landmark === "New" && issue.property === "text" && issue.actual === "Fresh" && issue.status === "pending"));
});

test("a missing reference image makes the visual check incomplete", browser, () => {
  const dir = variant();
  fs.rmSync(path.join(dir, "design/720/reference.png"));
  const result = check(quick(dir));
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.equal(result.result.status, "incomplete");
  assert.deepEqual(result.result.missingReferences, ["720"]);
  assert.match(fs.readFileSync(path.join(dir, "out/report.md"), "utf8"), /Reference image not measured: 720/);
  assert.equal(result.result.frames.find((f) => f.frame === "720").pass, false);
  assert.match(result.stdout, /720: incomplete/);
  assert.match(fs.readFileSync(path.join(dir, "out/report.md"), "utf8"), /## 720 — incomplete/);
  assert.match(fs.readFileSync(path.join(dir, "out/gallery.html"), "utf8"), /<h2>720 <span class="incomplete">incomplete</);
});

test("an image-only reference requires visual text review, including when it matches", browser, () => {
  const dir = variant();
  const specFile = path.join(dir, "design/720/spec.json");
  const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
  fs.writeFileSync(specFile, JSON.stringify({ ...spec, landmarks: [] }));
  const same = check(dir, "--frame", "720");
  assert.equal(same.status, 2, same.stdout + same.stderr);
  assert.equal(same.result.status, "incomplete");
  assert.deepEqual(same.result.imageOnlyFrames, ["720"]);
  assert.match(same.stdout, /image-only reference: inspect text visually/);
  assert.match(fs.readFileSync(path.join(dir, "out/report.md"), "utf8"), /text was not measured/);
  const full = check(quick(dir));
  assert.equal(full.status, 2, full.stdout + full.stderr);
  assert.match(fs.readFileSync(path.join(dir, "out/gallery.html"), "utf8"), /Image-only reference: inspect text visually/);
  const page = path.join(dir, "page.html");
  fs.writeFileSync(page, fs.readFileSync(page, "utf8").replace(">New<", ">Old<"));
  const changed = check(dir, "--frame", "720");
  assert.notEqual(changed.status, 0, changed.stdout + changed.stderr);
  assert.equal(changed.result.frames[0].imageOnly, true);
  assert.ok(changed.result.frames[0].pixels.ratio > 0);
  // Outside the text an image-only difference still fails.
  fs.writeFileSync(page, fs.readFileSync(page, "utf8").replace("</style>", ".media { width: 72px; height: 72px; }\n</style>"));
  const media = check(dir, "--frame", "720");
  assert.equal(media.status, 1, media.stdout);
  assert.ok(media.result.frames[0].issues.some((i) => i.property === "region" && i.status === "fail"));
});

test("a font the page names first but cannot draw its text with is reported, and findings stay visible", browser, () => {
  const r = check(variant(".price { font-family: 'Design Font Nobody Has', 'DejaVu Sans', sans-serif; font-size: 20px; }"), "--frame", "720");
  assert.equal(r.status, 1, r.stdout);
  assert.deepEqual(r.result.frames[0].fontsMissing, ["Design Font Nobody Has"]);
  assert.match(r.stdout, /fonts not available: Design Font Nobody Has; their texts render in a fallback/);
  assert.match(r.stdout, /1 499 € font: size 22 → size 20/);
  const installed = hasFont("DejaVu Sans") ? check(variant(".price { font-family: 'DejaVu Sans', sans-serif; font-weight: 700; }"), "--frame", "720") : null;
  if (installed) assert.deepEqual(installed.result.frames[0].fontsMissing, []);
  // A stack that starts with a system family asks for nothing to load: no alarm on every round.
  const system = check(variant(".card { font-family: system-ui, -apple-system, 'Segoe UI', 'Apple Color Emoji', sans-serif; }"), "--frame", "720");
  assert.deepEqual(system.result.frames[0].fontsMissing, []);
});

test("a page snapshot matches repeated text in document order", browser, () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "page.html"), `<!doctype html><style>article { width: 280px; } p { margin: 12px; }</style><article><p>Disk, GB</p><p>One <span>GB</span> used</p><p>GB</p><p>Two <span>GB</span> free</p></article>`);
  fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify({
    url: "page.html", root: "article", frames: [{name: "280", width: 280, spec: "spec.json", reference: "reference.png"}]
  }));
  const snap = cli("snapshot", path.join(dir, "design.json"), "--images");
  assert.equal(snap.status, 0, snap.stderr);
  const result = check(dir, "--frame", "280");
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.deepEqual(result.result.frames[0].issues, []);
});

test("what is not text is checked too: an image's size and a background's colour are areas that differ", browser, () => {
  const r = check(variant(".media { width: 72px; height: 72px; } .add { background: #1a8a4a; }"), "--frame", "720");
  assert.equal(r.status, 1);
  const regions = r.result.frames[0].issues.filter((i) => i.property === "region");
  assert.ok(regions.some((i) => i.box.x === 20 && i.box.y === 20 && i.box.width === 96 && i.box.height === 96), JSON.stringify(regions));
  assert.ok(regions.some((i) => i.landmark === "region near “Add to cart”"), JSON.stringify(regions));
});

test("the kit's shorter badge, once accepted, excuses everything below it and the areas that moved with it", browser, () => {
  const entry = { landmark: ["New", "Bestseller"], property: "*", category: "system", status: "accepted", decidedBy: "owner", reason: "the kit's badge is 19 px high" };
  const r = check(variant(".badge { line-height: 19px; }", [entry]), "--no-sweep");
  assert.equal(r.status, 0, r.stdout);
  assert.equal(check(variant(".badge { line-height: 19px; }"), "--no-sweep").status, 1);
});

test("text is found across markup and case: a unit in its own span, a label whose case CSS changes", browser, () => {
  const dir = variant();
  const page = path.join(dir, "page.html");
  fs.writeFileSync(page, fs.readFileSync(page, "utf8")
    .replace('<span class="price">1 499 €</span>', '<span class="price">1 499 <span>€</span></span>')
    .replace('<span class="badge">Bestseller</span>', '<span class="badge" style="text-transform: lowercase">BESTSELLER</span>'));
  const r = check(dir, "--frame", "720");
  const presence = r.result.frames[0].issues.filter((i) => i.property === "presence");
  assert.deepEqual(presence, []);
});

test("the sweep finds a card that stops fitting between the frames, and a layout that changes at the wrong width", browser, () => {
  const r = check(variant("@container (max-width: 419px) { .specs { grid-template-columns: repeat(2, 150px); } }"));
  assert.equal(r.status, 1);
  const overflow = r.result.sweep.issues.find((i) => i.property === "overflow" && i.landmark === "root");
  assert.ok(overflow, JSON.stringify(r.result.sweep.issues));
  assert.match(overflow.ranges, /^280–/);
  assert.ok(!/4[2-9]\d|[5-7]\d\d/.test(overflow.ranges), `seen only below 420: ${overflow.ranges}`);
  const moved = variant();
  const cfg = JSON.parse(fs.readFileSync(path.join(moved, "design.json"), "utf8"));
  fs.writeFileSync(path.join(moved, "design.json"), JSON.stringify({ ...cfg, sweep: { ...cfg.sweep, switches: [640, 420] } }));
  assert.equal(check(moved).result.sweep.pass, true);
  const page = path.join(moved, "page.html");
  fs.writeFileSync(page, fs.readFileSync(page, "utf8").replace("@container (max-width: 639px)", "@container (max-width: 499px)"));
  const late = check(moved);
  assert.deepEqual(late.result.sweep.issues.filter((i) => i.property === "switch").map((i) => i.landmark).sort(), ["496–504", "at 640"]);
});

test("a check of one frame leaves the gallery of the last full check; a full check writes before, design and after", browser, () => {
  const dir = variant(".badges { margin-top: 12px; }");
  check(quick(dir));
  const gallery = path.join(dir, "out/gallery.html");
  const full = fs.readFileSync(gallery, "utf8");
  for (const caption of ["Design", "Before", "After", "Difference"]) assert.match(full, new RegExp(`<figcaption>${caption}</figcaption>`));
  // The three frames, the widths, and the story.
  assert.deepEqual([...full.matchAll(/<section><h2>([^<]+)/g)].map((m) => m[1].trim()), ["720", "480", "320", "Widths 280–760", "Story: page"]);
  check(dir, "--frame", "720");
  assert.equal(fs.readFileSync(gallery, "utf8"), full);
  check(dir, "--no-sweep");
  assert.equal(fs.readFileSync(gallery, "utf8"), full, "a check without the sweep is partial too");
});

test("each round's score is kept, and the summary shows the round before and the lowest", browser, () => {
  const dir = variant();
  const page = path.join(dir, "page.html"), original = fs.readFileSync(page, "utf8");
  for (const css of [".badges { margin-top: 8px; }", ".badges { margin-top: 20px; }"]) {
    fs.writeFileSync(page, original.replace("</style>", `${css}\n</style>`));
    check(dir, "--no-sweep");
  }
  fs.writeFileSync(page, original.replace("</style>", ".badges { margin-top: 10px; }\n</style>"));
  const third = check(dir, "--no-sweep");
  const history = fs.readFileSync(path.join(dir, "out/history.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  assert.deepEqual(history.map((h) => [h.round, h.status]), [[1, "fail"], [2, "fail"], [3, "fail"]]);
  assert.ok(history[0].score < history[1].score, JSON.stringify(history));
  assert.match(third.stdout, new RegExp(`previous round: ${history[1].score} · lowest: ${history[0].score} in round 1`));
  assert.ok(!fs.existsSync(path.join(dir, "out/rounds")), "no copies of the work: the project's version control keeps it");
});

test("alignment is the spread as laid out against the tolerance; a group short of two everywhere is not measured, at some widths only reported", browser, () => {
  const dir = tmp();
  const page = (second, hideBelow = 0) => `<!doctype html><style>body{margin:0} #root{position:relative;width:100%;height:90px} .v{position:absolute;width:40px;height:12px;background:#000}
@media (max-width: ${hideBelow}px) { .v + .v { display: none } }</style>
<div id="root"><div class="v" style="left:10px;top:0"></div><div class="v" style="left:${second}px;top:30px"></div><div class="w" style="position:absolute;top:60px">x</div></div>`;
  const run = (second, align, { tolerance, hideBelow } = {}) => {
    fs.writeFileSync(path.join(dir, "page.html"), page(second, hideBelow));
    fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
    fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify({ url: "page.html", root: "#root", frames: [], ...(tolerance ? { tolerance } : {}), sweep: { from: 300, to: 340, step: 20, align, stories: [{ name: "page", url: "page.html?dense" }] } }));
    return check(dir);
  };
  const v = [{ selector: ".v", edge: "left" }];
  const fraction = run(11.015625, v);
  assert.equal(fraction.status, 1, "1.015625 px is more than a tolerance of 1");
  assert.deepEqual(fraction.result.sweep.issues.filter((i) => !i.story).map((i) => [i.property, i.delta, i.actual]), [["align", 1.015625, "left edges 1.02 px apart"]]);
  assert.equal(run(11.015625, v, { tolerance: 1.5 }).status, 0);
  assert.equal(run(12, v, { tolerance: 1.5 }).status, 1);
  // E143: an entry's max is held to the measured spread on both sides of the bound, not to the rounded one.
  const bounded = (second, max) => {
    fs.writeFileSync(path.join(dir, "deviations.json"), JSON.stringify([{ landmark: ".v", property: "align", max, category: "platform", status: "accepted", decidedBy: "owner", reason: "subpixel" }]));
    fs.writeFileSync(path.join(dir, "page.html"), page(10).replace('left:10px;top:30px"', `left:10px;top:30px;transform:translateX(${second - 10}px)"`));
    fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
    fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify({ url: "page.html", root: "#root", ledger: "deviations.json", frames: [], sweep: { from: 300, to: 340, step: 20, align: v, stories: [{ name: "page", url: "page.html?dense" }] } }));
    const r = check(dir);
    fs.rmSync(path.join(dir, "deviations.json"));
    return r.result.sweep.issues.find((i) => i.property === "align");
  };
  assert.equal(bounded(11.004, 1).status, "fail", "1.004 px is more than a max of 1, though it rounds to 1");
  assert.equal(bounded(11.015625, 1.019).status, "accepted", "1.015625 px is within a max of 1.019, though it rounds to 1.02");
  const one = run(12, [{ selector: ".w", edge: "left" }]);
  assert.equal(one.status, 2, one.stdout);
  assert.match(one.stdout, /not measured: \.w matched at most 1 across the sweep/);
  const bothEdges = run(12, [{ selector: ".w2", edge: "left" }, { selector: ".w2", edge: "right" }]);
  assert.equal(bothEdges.status, 2, "two groups on one selector that never has two elements are not measured");
  const narrow = run(10, v, { hideBelow: 310 });
  assert.equal(narrow.status, 0, narrow.stdout);
  assert.match(narrow.stdout, /\.v matched fewer than two at 300: measured where it had two or more/);
});

test("a story reports the widths where a configured alignment has too few visible elements", browser, () => {
  const f = smallFrame(`<div class="value">One</div><div class="value second">Two</div>
    <style>.single .second { display:none } @media(max-width:300px) { .compact .second { display:none } }</style>
    <script>document.body.className = location.search.slice(1);</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const compact = { name: "compact", url: "page.html?compact" }, single = { name: "one value", url: "page.html?single" };
  const run = (stories, outcome) => {
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 320, step: 20, align: [{ selector: ".value", edge: "left" }], stories } }));
    fs.writeFileSync(path.join(f.dir, "review.md"), [
      "## Acceptance", "| Item | Checked by | Result |", "|---|---|---|",
      "| reference alignment | sweep | pass — reference has two aligned values |",
      `| other alignments | sweep.stories | ${outcome} |`,
    ].join("\n"));
    return check(f.dir);
  };
  const partial = run([compact], "pass — aligned where both values show");
  assert.equal(partial.status, 0, partial.stdout);
  assert.deepEqual(partial.result.sweep.partial.map((g) => [g.story, g.selector, g.ranges]), [["compact", ".value", "300"]]);

  const missing = run([compact, single], "pass — claimed alignment");
  assert.equal(missing.status, 2, missing.stdout);
  assert.deepEqual(missing.result.acceptance.map((r) => r.status), ["pass", "incomplete"]);
  assert.deepEqual(missing.result.sweep.unmeasured.map((g) => [g.story, g.edge, g.matched]), [["one value", "left", 1]]);
  const handoff = fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8");
  assert.match(handoff, /alignment \.value \(story one value\), left edge: not measured/);
  assert.match(handoff, /alignment \.value \(story compact\), left edge: fewer than two elements at 300 px/);

  const inapplicable = run([single], "N/A — this story contains one value");
  assert.equal(inapplicable.status, 0, inapplicable.stdout);
  assert.equal(inapplicable.result.sweep.unmeasured[0].story, "one value");
});

test("a prepared run scores the unstyled start as failing, the reference as passing, and ignores the implementer's ledger", browser, () => {
  const root = tmp(), dir = path.join(root, "run");
  const prep = spawnSync(process.execPath, [path.join(HERE, "design-to-code/prepare.mjs"), "offer-card", dir, "--arm", "plain"], { encoding: "utf8" });
  assert.equal(prep.status, 0, prep.stderr);
  assert.match(prep.stdout, /Lay out the offer card/);
  assert.ok(fs.existsSync(path.join(dir, "design.json")) && fs.existsSync(path.join(dir, "design/720/spec.json")), "both arms get the same design pack");
  assert.ok(fs.existsSync(path.join(dir, "design/720/reference.png")));
  assert.ok(!fs.readdirSync(dir, { recursive: true }).some((f) => /reference\.html$/.test(f)), "the answer stays out");
  const score = () => JSON.parse(spawnSync(process.execPath, [path.join(HERE, "design-to-code/score.mjs"), dir], { encoding: "utf8" }).stdout);
  fs.writeFileSync(path.join(dir, "deviations.json"), JSON.stringify([{ landmark: "*", property: "*", category: "owner", status: "accepted", decidedBy: "owner", reason: "everything" }]));
  const start = score();
  assert.equal(start.pass, false);
  assert.deepEqual(start.ledgerEntries, ["accepted owner: * * — everything"]);
  fs.copyFileSync(path.join(CASE, "reference.html"), path.join(dir, "index.html"));
  const done = score();
  assert.equal(done.pass, true);
  assert.equal(done.framesPassed, "3/3");
  const skill = path.join(root, "skill");
  assert.equal(spawnSync(process.execPath, [path.join(HERE, "design-to-code/prepare.mjs"), "offer-card", skill], { encoding: "utf8" }).status, 0);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, "design.json"), "utf8")), JSON.parse(fs.readFileSync(path.join(skill, "design.json"), "utf8")));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, "design/720/spec.json"), "utf8")), JSON.parse(fs.readFileSync(path.join(skill, "design/720/spec.json"), "utf8")));
  const given = JSON.parse(fs.readFileSync(path.join(skill, "design/720/spec.json"), "utf8"));
  assert.equal(given.widths, undefined, "the implementer's spec compares no text widths, as Figma's would not");
  assert.equal(JSON.parse(fs.readFileSync(`${skill}.judge/design/720/spec.json`, "utf8")).widths, true);
  fs.rmSync(path.join(`${dir}.judge`, "design/720/reference.png"));
  const partial = score();
  assert.deepEqual([partial.status, partial.missingReferences], ["incomplete", ["720"]], "a check that measured part of the run is still scored");
});

// ------------------------------------------------------------------ round 8: what the first real submission missed

test("a text deviation names one design text", () => {
  const base = { property: "text", actual: "Go", category: "owner", status: "accepted", decidedBy: "owner", reason: "the owner renamed it" };
  assert.match(ledgerFaults([{ ...base, landmark: ["Ready", "Steady"] }]).join(), /one design text/);
  assert.match(ledgerFaults([{ ...base, landmark: "*" }]).join(), /one design text/);
  assert.deepEqual(ledgerFaults([{ ...base, landmark: "Ready" }]), []);
});

test("content that fades in is present, and a text cut with an ellipsis is truncated on purpose", browser, () => {
  const fade = smallFrame();
  fade.write('<style>@keyframes in{from{opacity:0}to{opacity:1}}.pop{opacity:0;animation:in .15s forwards}</style><main><span class="pop">Ready</span></main>');
  const shown = check(fade.dir);
  assert.equal(shown.status, 0, shown.stdout + shown.stderr);
  const cut = smallFrame('<div style="width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Ready steady go</div>');
  const cfg = JSON.parse(fs.readFileSync(cut.config, "utf8"));
  fs.writeFileSync(cut.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 340, step: 40, stories: [{ name: "page", url: "page.html?dense" }] } }));
  const own = check(cut.dir);
  assert.equal(own.status, 0, own.stdout + own.stderr);
  assert.deepEqual(own.result.sweep.issues, []);
});

test("scores are compared only between rounds measured the same way, and two rounds without a new lowest say stop", browser, () => {
  const f = smallFrame();
  f.write('<main><span style="margin-left:20px">Ready</span></main>');
  check(f.dir);
  const second = check(f.dir);
  assert.match(second.stdout, /previous round: /);
  assert.doesNotMatch(second.stdout, /stop adjusting/);
  assert.match(check(f.dir).stdout, /2 rounds without a new lowest score: stop adjusting/);
  const spec = JSON.parse(fs.readFileSync(path.join(f.dir, "0.json"), "utf8"));
  fs.writeFileSync(path.join(f.dir, "0.json"), JSON.stringify({ ...spec, landmarks: [...spec.landmarks, { ...spec.landmarks[0], text: "Steady" }] }));
  assert.doesNotMatch(check(f.dir).stdout, /previous round|lowest|stop adjusting/);
});

test("a dense story is swept too: a text over a text, a control under another element, and its pictures", browser, () => {
  const f = smallFrame();
  fs.writeFileSync(path.join(f.dir, "dense.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0}main{position:relative;width:300px;height:80px;background:white;font:20px/24px monospace}</style>
<main><span>Ready</span><button aria-label="Help" style="position:absolute;left:0;top:30px;width:20px;height:20px"></button>
<span style="position:absolute;left:0;top:10px;background:white;padding:4px">Ready and waiting for a very long time</span></main>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 340, step: 40, stories: [{ name: "dense", url: "dense.html" }] } }));
  const r = check(f.dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  const story = r.result.sweep.issues.filter((i) => i.story === "dense");
  assert.ok(story.some((i) => i.property === "covered" && i.landmark === "Help"), JSON.stringify(story));
  assert.ok(story.some((i) => i.property === "overlap"), JSON.stringify(story));
  assert.ok(r.result.sweep.issues.every((i) => i.story === "dense"), "the frame's own story is clean");
  assert.match(r.stdout, /covered Help \(dense\)/);
  const gallery = fs.readFileSync(path.join(f.dir, "out/gallery.html"), "utf8");
  assert.match(gallery, /<h2>Story: dense<\/h2>/);
  assert.match(gallery, /<figcaption>300 px<\/figcaption><img src="data:image\/png/);
});

test("a frame of a state drawn outside the component names its own root", browser, () => {
  const dir = tmp(), config = path.join(dir, "design.json");
  const page = (pop) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:16px/20px monospace}main{width:300px;height:40px}
.pop{position:absolute;top:50px;left:0;width:200px;padding:8px;background:#eee}</style>
<main><button id="help" style="width:40px;height:20px">i</button></main><div class="pop" hidden>${pop}</div>
<script>help.onmouseenter = () => { document.querySelector(".pop").hidden = false; };
help.onmouseleave = () => { document.querySelector(".pop").hidden = true; };</script>`;
  fs.writeFileSync(path.join(dir, "page.html"), page("Was 10, now 8"));
  fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
  fs.writeFileSync(config, JSON.stringify({ url: "page.html", root: "main", frames: [
    { name: "popover", width: 300, root: ".pop", setup: [{ hover: "#help" }], spec: "pop.json", reference: "pop.png" }],
    sweep: { from: 300, to: 300, stories: [{ name: "dense", url: "page.html?dense" }] }, journeys: [{ name: "help opens and closes", steps: [{ hover: "#help" }, { visible: ".pop" }, { move: [290, 600] }, { hidden: ".pop" }] }] }));
  const snap = cli("snapshot", config, "--images");
  assert.equal(snap.status, 0, snap.stderr);
  const same = check(dir);
  assert.equal(same.status, 0, same.stdout + same.stderr);
  fs.writeFileSync(path.join(dir, "page.html"), page("Now 8"));
  const changed = check(dir);
  assert.equal(changed.status, 1, changed.stdout + changed.stderr);
  assert.ok(changed.result.frames[0].issues.some((i) => i.landmark === "Was 10, now 8" && i.actual === "missing"));
});

test("a story's file path keeps its query", browser, () => {
  const f = smallFrame();
  fs.writeFileSync(path.join(f.dir, "page.html"), fs.readFileSync(path.join(f.dir, "page.html"), "utf8") + '<script>if (!location.search.includes("data=x")) document.querySelector("main").remove();</script>');
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, url: "page.html?data=x", sweep: { ...cfg.sweep, stories: [{ name: "dense", url: "page.html?data=x&dense" }] } }));
  const r = check(f.dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

// ------------------------------------------------------------------ round 9: evidence the check can give

test("a covered control: part of it, below the fold, but not its own label or a disabled one", browser, () => {
  const f = smallFrame();
  const story = (body) => `<!doctype html><meta charset="utf-8"><style>body{margin:0}main{position:relative;width:300px;min-height:60px;background:white;font:16px/20px monospace}
.box{position:absolute;background:#eee}</style><main>${body}</main>`;
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const sweep = (name, body) => {
    fs.writeFileSync(path.join(f.dir, `${name}.html`), story(body));
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 340, step: 40, stories: [{ name, url: `${name}.html` }] } }));
    return check(f.dir).result.sweep.issues.filter((i) => i.story === name && i.property === "covered").map((i) => i.landmark);
  };
  assert.deepEqual(sweep("partial", '<button aria-label="Help" style="position:absolute;left:0;top:0;width:40px;height:40px"></button><div class="box" style="left:22px;top:0;width:60px;height:40px"></div>'), ["Help"]);
  assert.deepEqual(sweep("fold", '<div style="height:1400px"></div><button aria-label="Low" style="width:40px;height:20px"></button><div class="box" style="left:0;top:1400px;width:60px;height:20px"></div>'), ["Low"]);
  assert.deepEqual(sweep("label", '<label style="position:relative;display:block;width:40px;height:20px"><input type="checkbox" style="position:absolute;inset:0;margin:0"><span style="position:absolute;inset:0;background:#2457c5"></span></label>'), []);
  assert.deepEqual(sweep("disabled", '<button aria-disabled="true" aria-label="Off" style="width:40px;height:20px"></button><div class="box" style="left:0;top:0;width:60px;height:20px"></div><button disabled aria-label="Gone" style="width:40px;height:20px"></button>'), []);
});

test("journeys hold or fail step by step, by pointer and by touch", browser, () => {
  const f = smallFrame();
  fs.appendFileSync(f.page, `<button id="t" style="width:40px;height:20px">?</button><div id="pop" hidden style="position:absolute;top:120px;left:0;width:120px;height:40px;background:#eee">Help text</div>
<script>
  const t = document.getElementById("t"), pop = document.getElementById("pop");
  t.onpointerenter = (e) => { if (e.pointerType !== "touch") pop.hidden = false; };
  t.onclick = () => { pop.hidden = !pop.hidden; };
</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [
    { name: "hover opens and shows the text", steps: [{ hover: "#t" }, { visible: "#pop" }, { text: ["#pop", "Help text"] }] },
    { name: "leaving closes it", steps: [{ hover: "#t" }, { visible: "#pop" }, { move: "#pop" }, { move: [290, 890] }, { hidden: "#pop" }] },
    { name: "a tap toggles it", touch: true, steps: [{ tap: "#t" }, { visible: "#pop" }, { tap: "#t" }, { hidden: "#pop" }] },
  ] }));
  const r = check(f.dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.deepEqual(r.result.journeys.map((j) => [j.name, j.pass]), [["hover opens and shows the text", true], ["leaving closes it", false], ["a tap toggles it", true]]);
  assert.match(r.result.journeys[1].failed, /step 5.*#pop is still visible/);
  assert.match(r.stdout, /journeys: 2 of 3 hold/);
  assert.match(r.stdout, /journey fails: leaving closes it/);
  assert.match(fs.readFileSync(path.join(f.dir, "out/gallery.html"), "utf8"), /<h2>Journeys<\/h2>/);
});

test("a full check is incomplete without review.md's acceptance list or a frame for every reference", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 340, step: 40 } }));
  let r = check(f.dir);
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /Not checked: no dense story is swept/);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 340, step: 40, stories: [{ name: "page", url: "page.html?dense" }] } }));
  assert.equal(check(f.dir).status, 0);
  fs.mkdirSync(path.join(f.dir, "frames/popover"), { recursive: true });
  fs.copyFileSync(path.join(f.dir, "0.png"), path.join(f.dir, "frames/popover/reference.png"));
  r = check(f.dir);
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /references no frame checks: frames\/popover\/reference\.png/);
  fs.rmSync(path.join(f.dir, "frames"), { recursive: true });
  fs.rmSync(path.join(f.dir, "review.md"));
  r = check(f.dir);
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /review\.md has no acceptance list/);
  assert.equal(r.result.round, 4);
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.dir, "out/history.jsonl"), "utf8").trim().split("\n").at(-1)).review, false);
});

test("the listing judge measures the actual popup and distinguishes a broken journey from an unmeasured story", browser, () => {
  const LISTING = path.join(HERE, "design-to-code/cases/listing-card"), dir = tmp();
  const arm = path.join(dir, "arm");
  assert.equal(spawnSync(process.execPath, [path.join(LISTING, "make-arm.mjs"), arm], { encoding: "utf8" }).status, 0);
  for (const f of ["listing.js", "listing.css"]) fs.copyFileSync(path.join(LISTING, "reference", f), path.join(arm, f));
  const story = path.join(arm, "story.html"), reference = fs.readFileSync(story, "utf8").replace('id="host"', 'id="host" class="popover-wrapper"');
  const judge = (caseName, script) => {
    fs.writeFileSync(story, reference + script);
    const out = path.join(dir, caseName);
    const run = spawnSync(process.execPath, [path.join(LISTING, "judge/judge.mjs"), arm, out], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr + run.stdout);
    return JSON.parse(fs.readFileSync(path.join(out, "judge.json"), "utf8"));
  };
  const good = judge("reference", "");
  assert.equal(good.accepted, true, JSON.stringify(good.verdict));
  const missing = judge("hidden-story", '<script>if (location.search === "?data=dense") document.getElementById("host").style.visibility = "hidden";</script>');
  assert.deepEqual([missing.accepted, missing.verdict.dense], [false, null]);
  assert.match(missing.denseMissing, /not visible/);
  const escape = judge("broken-escape", '<script>document.addEventListener("keydown", (e) => e.stopImmediatePropagation(), true);</script>');
  assert.deepEqual(escape.verdict, { visual: true, dense: true, behaviour: false });
  assert.ok(escape.checks.some((c) => c.name === "help: Escape closes it" && !c.pass));
});

// ------------------------------------------------------------------ round 10: the verifier's findings

test("truncation drawn on purpose collides with nothing; one that draws no ellipsis is a cut", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const sweep = (name, body) => {
    fs.writeFileSync(path.join(f.dir, `${name}.html`), `<!doctype html><meta charset="utf-8"><style>body{margin:0}main{position:relative;width:300px;min-height:60px;background:white;font:16px/20px monospace}</style><main>${body}</main>`);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 340, step: 40, stories: [{ name, url: `${name}.html` }] } }));
    return check(f.dir).result.sweep.issues.filter((i) => i.story === name).map((i) => i.property);
  };
  assert.deepEqual(sweep("ellipsis", '<div style="display:flex;gap:8px"><div style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">A very long apartment title that cannot fit</div><b>€10</b></div>'), []);
  assert.deepEqual(sweep("clamp", '<p style="display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden;margin:0">Line one of a long text that wraps onto line two and three</p><a href="#">Read more</a>'), []);
  assert.deepEqual(sweep("wrapped", '<div style="width:120px;height:20px;overflow:hidden;text-overflow:ellipsis">A text that wraps and is cut below its first line</div>'), ["clipped"]);
});

test("covered leaves wrapped links, a transparent file input and a disabled fieldset alone", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(path.join(f.dir, "controls.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0}main{position:relative;width:300px;min-height:60px;background:white;font:16px/20px monospace}</style><main>
<p style="width:200px;margin:0">I agree to the <a href="#">terms of service</a> and <a href="#">privacy policy of the site</a>.</p>
<span style="position:relative;display:inline-block"><button style="width:80px;height:24px">Upload</button><input type="file" style="position:absolute;inset:0;opacity:0"></span>
<fieldset disabled style="position:relative;border:0;padding:0;margin:0"><button style="width:60px;height:20px">Send</button><span style="position:absolute;inset:0"></span></fieldset></main>`);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 340, step: 40, stories: [{ name: "controls", url: "controls.html" }] } }));
  const r = check(f.dir);
  assert.deepEqual(r.result.sweep.issues.filter((i) => i.property === "covered"), [], r.stdout);
});

test("a story that cannot be swept is a gap, and the frames' own sweep is kept", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(path.join(f.dir, "empty.html"), "<!doctype html><p>no root here</p>");
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 340, step: 40, stories: [{ name: "page", url: "page.html" }, { name: "empty", url: "empty.html" }] } }));
  const r = check(f.dir);
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /Not checked: the story empty was not swept: Root main was absent/);
  assert.equal(r.result.score, null, "a sweep missing a story is not scored against complete ones");
  assert.ok(r.result.sweep.stories.some((st) => st.name === "page" && !st.unmeasured));
});

test("the visible root is measured, a scripted animation is finished, and a change of tolerance starts a new series", browser, () => {
  const f = smallFrame();
  f.write('<main style="display:none"><span>Hidden</span></main><main><span id="r">Ready</span></main><script>document.getElementById("r").animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1000, fill: "both" });</script>');
  const first = check(f.dir);
  assert.equal(first.status, 0, first.stdout + first.stderr);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, tolerance: 30 }));
  assert.match(check(f.dir).stdout, /scores start a new series/);
});

// ------------------------------------------------------------------ round 10b: the second verifier's findings

test("a failing setup step leaves its frame unmeasured, in seconds, with the report written", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, frames: [...cfg.frames, { ...cfg.frames[0], name: "state", setup: [{ click: ".never" }] }] }));
  const start = Date.now();
  const r = check(f.dir);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.ok(Date.now() - start < 25000, "a step that cannot run fails in seconds");
  assert.match(r.result.frames[1].unmeasured, /A setup step failed/);
  assert.ok(fs.existsSync(path.join(f.dir, "out/report.md")));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, frames: [{ ...cfg.frames[0], setup: [{ jump: "main" }] }] }));
  assert.match(check(f.dir).stderr, /a step is one of/);
});

test("journeys see as a person does: a hidden text is not shown, one visible match of many is still visible", browser, () => {
  const f = smallFrame();
  fs.appendFileSync(f.page, '<div class="pop" style="display:none">Help</div><div class="pop">Other</div><div class="fade" style="opacity:0">Faded</div>');
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [
    { name: "hidden text", steps: [{ text: [".pop", "Help"] }] },
    { name: "one of two visible", steps: [{ hidden: ".pop" }] },
    { name: "transparent is hidden", steps: [{ hidden: ".fade" }] },
    { name: "Playwright selectors", steps: [{ visible: "text=Other" }, { text: ["text=Other", "Other"] }] },
  ] }));
  const r = check(f.dir);
  assert.deepEqual(r.result.journeys.map((j) => j.pass), [false, false, true, true], JSON.stringify(r.result.journeys));
  assert.match(r.stdout, /score: \d+/);
  assert.ok(r.result.score >= 20, "each failing journey adds 10");
});

test("covered: the centre or most of a control, inside the component, not a badge, a pinned bar or a label-drawn input", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const sweep = (name, body) => {
    fs.writeFileSync(path.join(f.dir, `${name}.html`), `<!doctype html><meta charset="utf-8"><style>body{margin:0}main{position:relative;width:300px;min-height:80px;background:white;font:16px/20px monospace}</style><main>${body}</main>`);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 340, step: 40, stories: [{ name, url: `${name}.html` }] } }));
    return check(f.dir).result.sweep.issues.filter((i) => i.story === name && i.property === "covered").map((i) => i.landmark);
  };
  assert.deepEqual(sweep("badge", '<span style="position:relative;display:inline-block"><button aria-label="Inbox" style="width:32px;height:32px"></button><span style="position:absolute;right:-6px;top:-6px;width:16px;height:16px;background:red;border-radius:8px">3</span></span>'), []);
  assert.deepEqual(sweep("btncheck", '<input type="radio" id="d" name="g" style="position:absolute;clip:rect(0,0,0,0);pointer-events:none"><label for="d" style="display:inline-block;width:60px;height:24px;background:#eee">Day</label><input type="radio" id="w" name="g" style="position:absolute;clip:rect(0,0,0,0);pointer-events:none"><label for="w" style="display:inline-block;width:60px;height:24px;background:#ddd">Week</label>'), []);
  assert.deepEqual(sweep("toast", '<button aria-label="Save" style="width:60px;height:24px"></button><div style="position:fixed;left:0;top:0;width:200px;height:40px;background:#333">Saved</div>'), []);
  assert.deepEqual(sweep("after", '<div class="card" style="position:relative;padding:8px"><button aria-label="More" style="width:40px;height:24px"></button><style>.card::after{content:"";position:absolute;inset:0}</style></div>'), ["More"]);
  assert.deepEqual(sweep("dropzone", '<div style="position:relative;width:280px;height:60px"><button aria-label="Remove" style="position:relative;width:60px;height:24px;margin:18px">x</button><input type="file" style="position:absolute;inset:0;opacity:0"></div>'), ["Remove"]);
});

test("the visible root is marked: a transparent first match is skipped for the picture and the numbers alike", browser, () => {
  const f = smallFrame();
  f.write('<main style="opacity:0;width:200px;height:50px"><span>Gone</span></main><main><span>Ready</span></main>');
  const r = check(f.dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.deepEqual(r.result.frames[0].root.page, { width: 300, height: 80 });
});

test("the pointer rests outside the page, and a change of journeys starts a new series", browser, () => {
  const f = smallFrame();
  f.write('<style>main:hover .tip{display:block}.tip{display:none}</style><main style="position:relative;width:100vw;height:100vh"><span>Ready</span><span class="tip">Tip</span></main>');
  const plain = check(f.dir);
  assert.deepEqual(plain.result.frames[0].unexpected, [], "nothing is hovered");
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "shown", steps: [{ visible: "main" }] }] }));
  assert.match(check(f.dir).stdout, /scores start a new series/);
});

test("the acceptance list is a heading with lines under it, not the word alone", browser, () => {
  const f = smallFrame();
  const review = path.join(f.dir, "review.md");
  for (const [text, status] of [["No acceptance list was written.\n", 2], ["## Acceptance\n\n| Item | Checked by | Result |\n|---|---|---|\n", 2],
    ["## Acceptance\n\n- every frame: pass — captured\n", 0], ["## The acceptance list\n\n| Item | Checked by | Result |\n|---|---|---|\n| frame | check | pass — captured |\n", 0], ["## Acceptance\n\n| frame | check | pass |\n|---|---|---|\n", 2]]) {
    fs.writeFileSync(review, text);
    assert.equal(check(f.dir).status, status, text);
  }
});

// ------------------------------------------------------------------ round 11: verification without a second agent

test("a full check writes the evidence a handoff quotes, and a journey that expects nothing is refused", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 340, step: 40, stories: [{ name: "page", url: "page.html?dense" }] },
    journeys: [{ name: "root shows", steps: [{ visible: "main" }] }] }));
  const r = check(f.dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const handoff = fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8");
  for (const line of [/^- frame: pass — no findings$/m, /^- story page: no findings$/m, /^- root shows \(300 px\): holds; checks opening only, not closing$/m,
    /^- every frame: pass · reported: pass — reference captured$/m, /## Not checked by the script/, /^Round \d+ · verdict: pass · score: 0 \(lower is better\) · 20\d\d-/m]) assert.match(handoff, line);
  assert.match(r.stdout, /evidence for the handoff: .*handoff\.md/);
  fs.rmSync(path.join(f.dir, "out/handoff.md"));
  check(f.dir, "--frame", "frame");
  assert.ok(!fs.existsSync(path.join(f.dir, "out/handoff.md")), "only a check of every frame writes it");
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "clicks", steps: [{ click: "main" }] }] }));
  assert.match(check(f.dir).stderr, /the journey "clicks" expects nothing/);
});

test("a static pack can omit the sweep and a story can enter its state on the frame's page", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (c) => { fs.writeFileSync(f.config, JSON.stringify(c)); return check(f.dir); };
  const { sweep, ...noSweep } = cfg;
  assert.match(run(noSweep).stdout, /Not checked: no sweep/, "without a reason, no sweep is a gap");
  const fixed = run({ ...noSweep, static: "a fixed frame, no data to stress" });
  assert.equal(fixed.status, 0, fixed.stdout);
  assert.match(fixed.stdout, /Width sweep and additional stories were not run/);
  assert.match(fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8"), /Width sweep and additional stories were not run/);
  fs.appendFileSync(f.page, '<button id="dense" onclick="document.querySelector(\'main\').style.width=\'480px\'">Load longer data</button>');
  const variant = run({ ...cfg, sweep: { ...sweep, stories: [{ name: "wide data", url: "page.html", setup: [{ click: "#dense" }] }] } });
  assert.equal(variant.status, 1, variant.stdout);
  assert.ok(variant.result.sweep.issues.some((i) => i.story === "wide data" && i.property === "overflow"), variant.stdout);
  f.write('<main><span>Ready</span><button aria-expanded="false" style="position:absolute;left:200px;top:0">More</button></main>');
  const opener = run(cfg);
  assert.match(opener.stdout, /1 control opens something with no journey that opens and closes it: “More”/);
  assert.equal(opener.status, 1, "the button is not in the spec either");
});

test("the handoff's evidence counts what the ledger excused, names unused entries and blank acceptance rows", browser, () => {
  const f = smallFrame();
  f.write('<main><span style="margin-left:9px">Ready</span></main>');
  fs.writeFileSync(path.join(f.dir, "ledger.json"), JSON.stringify([
    { landmark: "Ready", property: "x", category: "system", status: "accepted", reason: "the kit's padding", decidedBy: "owner" },
    { landmark: "Gone", property: "presence", category: "ux", status: "proposed", reason: "drop it", options: ["keep", "drop"] }]));
  fs.writeFileSync(path.join(f.dir, "review.md"), "## Acceptance\n\n| Item | Checked by | Result |\n|---|---|---|\n| frame | check | pass — captured |\n| popup | journey |  |\n");
  const r = check(f.dir);
  const handoff = fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8");
  assert.match(handoff, /^- frame: pass — no findings; 1 excused by the ledger$/m, handoff);
  assert.match(handoff, /accepted: Ready x — the kit's padding \(system · decided by owner · excuses 1\)/);
  assert.match(handoff, /proposed: Gone presence — drop it \(ux · matched nothing\); options: keep; drop/);
  assert.match(handoff, /^- popup: incomplete \(not checked\)$/m);
  assert.match(handoff, /^- frame~[0-9a-f]{8}\/side\.png$/m);
  assert.equal(r.status, 2, "a blank result leaves the check incomplete");
  assert.match(r.stdout, /acceptance “popup”: not checked/);
});

// ------------------------------------------------------------------ round 11c: the third verifier's findings

test("the handoff credits each ledger entry by itself, reads the result column and list items, and lists real pictures only", browser, () => {
  const f = smallFrame();
  f.write('<main><span style="margin-left:9px">Ready</span></main>');
  fs.writeFileSync(path.join(f.dir, "ledger.json"), JSON.stringify([
    { landmark: "Gone", property: "x", category: "system", status: "accepted", decidedBy: "owner", reason: "the kit" },
    { landmark: "Ready", property: "x", category: "system", status: "accepted", decidedBy: "owner", reason: "the kit" },
    { landmark: ["*"], property: "font", category: "platform", status: "accepted", decidedBy: "owner", reason: "smoothing" }]));
  fs.writeFileSync(path.join(f.dir, "review.md"), "## Критерии приёмки\n\n| Item | Result | Notes |\n|---|---|---|\n| frame | pass — captured | see later |\n| popup |  | later |\n\n### More\n\n- dense story: swept\n+ probe\n");
  check(f.dir);
  const handoff = fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8");
  assert.match(handoff, /accepted: Gone x — the kit \(system · decided by owner · matched nothing\)/);
  assert.match(handoff, /accepted: Ready x — the kit \(system · decided by owner · excuses 1\)/);
  assert.match(handoff, /\* font — smoothing \(platform · decided by owner · wildcard · matched nothing\)/);
  for (const line of [/^- frame: pass · reported: pass — captured$/m, /^- popup: incomplete \(not checked\)$/m, /^- dense story: incomplete \(no recognized result\) · reported: swept$/m, /^- probe: incomplete \(not checked\)$/m]) assert.match(handoff, line);
  assert.ok(handoff.indexOf("## Pictures to look at first") < handoff.indexOf("## Frames"), "pictures come before the numbers");
  for (const p of handoff.match(/^- (\S+\.png)$/gm).map((l) => l.slice(2))) assert.ok(fs.existsSync(path.join(f.dir, "out", p)), p);
});

test("journeys can change the width and expect the focus; a hidden step on what never opened is noted", browser, () => {
  const f = smallFrame();
  fs.appendFileSync(f.page, '<button id="a">A</button><button id="b">B</button>');
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [
    { name: "tab order", steps: [{ focus: "#a" }, { press: "Tab" }, { focused: "#b" }] },
    { name: "survives a resize", steps: [{ width: 280 }, { visible: "main" }] },
    { name: "closing what never opened", steps: [{ hidden: ".nothing" }] },
  ] }));
  const r = check(f.dir);
  assert.deepEqual(r.result.journeys.map((j) => j.pass), [true, true, true], JSON.stringify(r.result.journeys));
  const handoff = fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8");
  assert.match(handoff, /closing what never opened \(300 px\): holds; \.nothing was never seen open/);
  assert.match(handoff, /survives a resize \(300 → 280 px\): holds/);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "x", steps: [{ visible: "main" }] }, { name: "x", steps: [{ visible: "main" }] }] }));
  assert.match(check(f.dir).stderr, /journey names must be unique/);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, frames: [{ ...cfg.frames[0], setup: [{ width: 280 }] }] }));
  assert.match(check(f.dir).stderr, /a step is one of/);
});

test("only the owner accepts: an accepted entry without decidedBy is a ledger fault", () => {
  const entry = { landmark: "Ready", property: "x", category: "system", reason: "the kit" };
  assert.match(ledgerFaults([{ ...entry, status: "accepted" }]).join(), /names who decided it/);
  assert.deepEqual(ledgerFaults([{ ...entry, status: "accepted", decidedBy: "owner" }]), []);
  assert.deepEqual(ledgerFaults([{ ...entry, status: "proposed" }]), []);
});

test("opener coverage belongs to the control that exposed the observed content", browser, () => {
  const f = smallFrame(`<button id="a" aria-label="More" popovertarget="one">A</button>
    <button id="b" aria-label="More" popovertarget="two">B</button>
    <div popover id="one">First</div><div popover id="two">Second</div>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (...journeys) => { fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys })); return check(f.dir); };
  const journey = (name, ...steps) => ({ name, steps });
  const bogus = journey("unrelated", { click: "#a" }, { visible: "main" }, { hidden: ".gone" });
  assert.equal(run(bogus).status, 2);
  const onlyA = journey("A then B", { click: "#a" }, { visible: "#one" }, { click: "#b" }, { hidden: "#one" });
  const partial = run(onlyA);
  assert.equal(partial.status, 2, partial.stdout);
  assert.match(partial.stdout, /1 control opens something with no journey that opens and closes it: “More”/);
  const both = run(onlyA, journey("B with Escape", { click: "#b" }, { text: ["#two", "Second"] }, { press: "Escape" }, { hidden: "#two" }));
  assert.equal(both.status, 0, both.stdout);
});

test("a root opener needs an observed transition on its own content after a gesture", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  f.write(`<button id="trigger" aria-controls="pop" aria-expanded="false">More</button><div id="pop" hidden>Popup</div><div id="other" hidden>Other</div>
    <script>trigger.onclick = () => { pop.hidden = other.hidden = !pop.hidden; if (location.search.includes("timer")) setTimeout(() => { pop.hidden = true; }, 350); }</script>`);
  const config = { ...cfg, url: "page.html?timer", root: "#trigger", sweep: undefined, static: "a single trigger, no data to stress" };
  fs.writeFileSync(f.config, JSON.stringify(config));
  assert.equal(cli("snapshot", f.config, "--images", "--force").status, 0);
  const run = (...steps) => {
    fs.writeFileSync(f.config, JSON.stringify({ ...config, journeys: [{ name: "root", steps }] }));
    return check(f.dir);
  };
  const hidden = run({ click: "#trigger" }, { hidden: ".missing" });
  assert.equal(hidden.status, 2, hidden.stdout);
  assert.match(hidden.stdout, /no journey that opens and closes it: “More”/);
  const timer = run({ click: "#trigger" }, { visible: "#pop" }, { wait: 450 }, { hidden: "#pop" });
  assert.equal(timer.status, 2, timer.stdout);
  const other = run({ click: "#trigger" }, { visible: "#other" }, { click: "#trigger" }, { hidden: "#other" });
  assert.equal(other.status, 2, other.stdout);
  const real = run({ click: "#trigger" }, { visible: "#pop" }, { click: "#trigger" }, { hidden: "#pop" });
  assert.equal(real.status, 0, real.stdout);
});

test("a journey on another data variant covers the same explicitly linked control", browser, () => {
  const f = smallFrame('<button id="more" popovertarget="panel">More</button><div id="panel" popover>Details</div>');
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  function run(target) {
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "toggle", url: "page.html?variant", steps: [
      { click: "#more" }, { visible: target }, { click: "#more" }, { hidden: target },
    ] }] }));
    return check(f.dir);
  }
  let r = run("#panel");
  assert.equal(r.status, 0, r.stdout);
  fs.appendFileSync(f.page, '<script>if (location.search === "?variant") { panel.id = "other"; more.setAttribute("popovertarget", "other"); }</script>');
  r = run("#other");
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /no journey that opens and closes it: “More”/);
});

test("the acceptance verdict distinguishes evidence, missing measurements, decisions and failures", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  cfg.static = "a fixed label, no data to stress";
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: undefined }));
  const review = path.join(f.dir, "review.md");
  const run = (...rows) => {
    fs.writeFileSync(review, ["## Acceptance", "| Item | Checked by | Result |", "|---|---|---|", ...rows].join("\n"));
    return check(f.dir);
  };
  const manual = (result) => `| label | inspection | ${result} |`;
  const sweep = "| resizes | sweep | PASS — inspected the widths |";
  for (const [rows, code, status] of [
    [[manual("looks correct")], 2, "incomplete"], [[manual("pass")], 2, "incomplete"],
    [[manual("not checked")], 2, "incomplete"], [[manual("N/A")], 2, "incomplete"],
    [[manual("pending — owner decides")], 3, "pending"], [[manual("FAILED — cut"), manual("not checked")], 1, "fail"],
    [[manual("pending"), sweep], 2, "incomplete"], [[manual("N/A — no input field"), manual("PASS: read the rendered label")], 0, "pass"],
  ]) {
    const r = run(...rows);
    assert.deepEqual([r.status, r.result.status], [code, status], r.stdout);
  }
  assert.match(run(sweep).stdout, /the width sweep was not fully measured/);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 280, to: 300 } }));
  const overflow = run(sweep);
  assert.deepEqual([overflow.status, overflow.result.acceptance[0].status], [1, "fail"], overflow.stdout);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 320 } }));
  assert.equal(run(sweep).status, 0, "the requested width measurement ran");
  assert.equal(run("| data | sweep.stories | pass — measured dense data |").status, 2);
});

// ------------------------------------------------------------------ v21: what the five Terra iterations missed

test("v21: no sweep needs a stated reason, and a story is its own data", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (c) => { fs.writeFileSync(f.config, JSON.stringify(c)); return check(f.dir); };
  const { sweep, ...noSweep } = cfg;
  assert.equal(run(noSweep).status, 2);
  assert.match(cli("check", (fs.writeFileSync(f.config, JSON.stringify({ ...noSweep, static: "" })), f.config)).stderr, /"static" gives the reason/);
  assert.equal(run({ ...noSweep, static: "a fixed label" }).status, 0);
  assert.match(run({ ...cfg, sweep: { ...sweep, stories: [{ name: "same", url: "page.html" }] } }).stdout, /the story same is a frame's own page/);
  assert.doesNotMatch(run({ ...cfg, sweep: { ...sweep, stories: [{ name: "same", url: "page.html", setup: [{ click: "main" }] }] } }).stdout, /frame's own page/);
});

test("v21: an overlay frame needs a journey that acts on its opener, sees it open and then closed", browser, () => {
  const f = smallFrame();
  f.write(`<main><span>Ready</span><button class="help" style="position:absolute;left:200px;top:0">Help</button></main>
<div class="tip" hidden style="position:absolute;left:0;top:100px;width:120px;height:30px;background:#eee">Tip</div>
<script>const b = document.querySelector(".help"), t = document.querySelector(".tip");
b.onmouseenter = () => { t.hidden = false; }; b.onmouseleave = () => { t.hidden = true; };</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const frames = [...cfg.frames, { name: "tip", width: 300, root: ".tip", setup: [{ hover: ".help" }], spec: "tip.json", reference: "tip.png" }];
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, frames }));
  assert.equal(cli("snapshot", f.config, "--images", "--frame", "tip").status, 0);
  const run = (journeys) => { fs.writeFileSync(f.config, JSON.stringify({ ...cfg, frames, journeys })); return check(f.dir).stdout; };
  assert.match(run([]), /the overlay frame tip opens “\.help”, and no journey acts on it, sees it open and expects it closed/);
  assert.match(run([{ name: "opens only", steps: [{ hidden: ".tip" }, { hover: ".help" }, { visible: ".tip" }] }]), /overlay frame tip opens/);
  assert.doesNotMatch(run([{ name: "opens and closes", steps: [{ hover: "text=Help" }, { visible: ".tip" }, { move: [290, 600] }, { hidden: ".tip" }] }]), /overlay frame tip opens/,
    "the same element, named another way, with an action between open and closed");
});

test("v21: past returns are matched without case, emphasis, quotes or a final full stop, and escaped pipes stay in a cell", browser, () => {
  const f = smallFrame();
  fs.writeFileSync(path.join(f.dir, "..", "returns.md"), "# Past returns\n\n- Long price beside several disks.\n- **Popover** closes when the pointer leaves\n- A | B stays readable\n");
  fs.writeFileSync(path.join(f.dir, "review.md"), `${REVIEW}| long price beside several disks: the dense story | sweep.stories | pass — no overlap |\n| “popover closes when the pointer leaves” | journey | pass — journey holds |\n`);
  try {
    const r = check(f.dir);
    assert.match(r.stdout, /past returns not in the acceptance list: “A \| B stays readable”/);
    assert.doesNotMatch(r.stdout, /past returns not in the acceptance list: .*(Long price|Popover)/);
    fs.appendFileSync(path.join(f.dir, "review.md"), "| a \\| b stays readable | sweep.stories | pass — no overlap |\n");
    assert.doesNotMatch(check(f.dir).stdout, /past returns not in the acceptance list/);
  } finally { fs.rmSync(path.join(f.dir, "..", "returns.md")); }
});

test("v21: a story on a frame's page whose setup only waits is the frame again", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { ...cfg.sweep, stories: [{ name: "same", url: "page.html", setup: [{ wait: 1 }] }] } }));
  assert.match(check(f.dir).stdout, /the story same is a frame's own page/);
});

test("v21: the evidence file starts with the handover status, a fail says to keep working, and other data is named", browser, () => {
  const f = smallFrame('<span>Ready</span> <b>Steady</b> <i>Go</i>');
  f.write('<main><span>Alpha</span> <b>Beta</b> <i>Gamma</i></main>');
  const r = check(f.dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /A fail is not a state to hand over in: fix the first cause and check again/);
  assert.match(r.stdout, /3 of 3 design texts are missing: the page likely renders other data than this frame/);
  assert.match(fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8"), /^Status: fail — not a state to hand over in/);
});
