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
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  causes, compareFrame, contextTexts, findingKeys, firstStreak, joinContext, ledgerFaults, pageText, parseFigmaUrl, parseXml, ranges, renderHandoff, renderReport,
  renderSummary, rerunNotice, snapshotIdentity, specFromMetadata, specFromRest, sweepIssues, switches,
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
  // Past the 12 px band: within it an offset is a note.
  const r = compare({ New: { dy: 16 }, Title: { dy: 16 }, Buy: { dy: -14 } }, { height: 216 });
  assert.equal(r.pass, false);
  assert.deepEqual(r.causes.map((c) => [c.after, c.before, c.step]), [["SKU", "New", 16], ["1 499 €", "Buy", -14]]);
  const y = Object.fromEntries(r.issues.filter((i) => i.property === "y").map((i) => [i.landmark, i.inherited]));
  assert.deepEqual(y, { New: false, Buy: false });
  // What "New" carries down is a drift, its own step none: a note (draft 28).
  assert.ok(r.notes?.some((n) => n.landmark === "Title" && n.property === "y"), JSON.stringify(r.notes));
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

test("a text box drawn taller than its line moves nothing below it, and a height within 24 px is a note", () => {
  const r = compare({ New: { dh: -4 } });
  assert.equal(r.causes.length, 0, JSON.stringify(r.causes));
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.notes.map((n) => [n.landmark, n.property]), [["New", "height"]]);
  assert.ok(compare({ New: { dh: 26 } }).issues.some((i) => i.landmark === "New" && i.property === "height" && i.status === "fail"), "past 24 px it is a finding");
});

test("an accepted change of size excuses everything it pushes down; a proposed one leaves it pending", () => {
  const entry = (status) => [{ landmark: ["New"], property: "height", category: "system", status, reason: "the kit's badge is 30 px taller" }];
  // Past 24 px, a height and the drift it carries are findings.
  const grown = { New: { dh: 30 }, Title: { dy: 30 } };
  assert.equal(compare(grown, { height: 230 }).pass, false);
  const accepted = compare(grown, { height: 230 }, entry("accepted"));
  assert.equal(accepted.pass, true, JSON.stringify(accepted.issues));
  assert.deepEqual(accepted.issues.map((i) => [i.landmark, i.property, i.status]), [["New", "height", "accepted"], ["Title", "y", "accepted"], ["root", "height", "accepted"]]);
  const pending = compare(grown, { height: 230 }, entry("proposed"));
  assert.equal(pending.pass, false);
  assert.ok(pending.issues.every((i) => i.status === "pending"));
  const capped = compare(grown, { height: 230 }, [{ ...entry("accepted")[0], max: 2 }]);
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

test("a differing area outside the texts is a note with its place; a region entry marks it accepted; one that moved with a text is neither", () => {
  const regions = [{ box: box(20, 20, 96, 96), area: 4000, near: "New" }, { box: box(200, 60, 80, 3), area: 240, near: "Buy", movedWith: "Buy" }];
  const r = compareFrame({ frame: "f", spec: SPEC, measured: measured(), regions });
  assert.equal(r.pass, true);
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.notes.map((n) => [n.landmark, n.property, n.box]), [["region near “New”", "region", box(20, 20, 96, 96)]]);
  assert.equal(r.moved, 1);
  assert.doesNotMatch(renderReport({ frames: [r] }), /NaN/);
  const ok = compareFrame({ frame: "f", spec: SPEC, measured: measured(), regions,
    ledger: [{ property: "region", region: [16, 16, 104, 104], category: "system", status: "accepted", decidedBy: "owner", reason: "the kit's image" }] });
  assert.deepEqual(ok.issues.map((i) => [i.property, i.status]), [["region", "accepted"]]);
});

test("image-only root height respects each ledger status and measured limit", () => {
  // Past 24 px, where a height is a finding.
  const entry = { landmark: "root", property: "height", category: "design-error", reason: "bottom padding", max: 30 };
  const height = (status, delta) => compareFrame({ frame: "f", spec: { frame: { width: 50, height: 40 }, landmarks: [] },
    measured: { root: { width: 50, height: 40 + delta }, landmarks: [] }, ledger: [{ ...entry, status }] });
  for (const [status, expected] of [["accepted", "accepted"], ["proposed", "pending"]]) {
    const r = height(status, 30);
    assert.equal(r.issues[0].status, expected);
    assert.equal(r.verdict, "incomplete");
    assert.equal(height(status, 30.01).verdict, "fail");
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
  const r = compare({ New: { dy: 30 } }, { height: 230 });
  assert.match(renderReport({ frames: [r] }), /Start here: between “SKU” and “New” vertically \+30 px/);
  const summary = renderSummary({ frames: [r] });
  assert.match(summary, /start here: between “SKU” and “New” vertically \+30 px/);
  assert.ok(summary.includes("root height"), summary);
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
  const failing = compare({}, { height: 230 });
  const proposed = compare({}, { height: 230 }, [{ landmark: "root", property: "height", category: "design-error", status: "proposed", reason: "more air" }]);
  const accepted = compare({}, { height: 230 }, [{ landmark: "root", property: "height", category: "owner", status: "accepted", decidedBy: "owner", reason: "more air" }]);
  assert.ok(failing.score > 0);
  assert.equal(proposed.score, failing.score);
  assert.equal(accepted.score, 0);
  assert.equal(compare({}, { height: 217 }).score, 0, "a note counts nothing");
});

test("a frame waiting for a decision says so, not that it failed", () => {
  const r = compare({}, { height: 230 }, [{ landmark: "root", property: "height", category: "design-error", status: "proposed", reason: "more air" }]);
  assert.match(renderSummary({ frames: [r] }), /f: awaiting a decision on 1/);
});

test("draft 28: a proposed entry of any category leaves a finding pending, for the owner", () => {
  const entry = (category) => ({ landmark: "New", property: "y", category, status: "proposed", reason: "the frame's spacing is off the scale" });
  for (const category of ["design-error", "missing-state", "platform", "system", "ux"]) {
    assert.deepEqual(ledgerFaults([entry(category)]), [], category);
    const r = compare({ New: { dy: 30 }, Title: { dy: 30 } }, { height: 230 }, [entry(category)]);
    assert.equal(r.verdict, "pending", `${category}: ${JSON.stringify(r.issues)}`);
    assert.deepEqual(r.issues.map((i) => [i.landmark, i.property, i.status]), [["New", "y", "pending"], ["Title", "y", "pending"], ["root", "height", "pending"]]);
  }
  // The owner's own call is recorded as accepted; a text entry names what the page shows.
  assert.match(ledgerFaults([entry("owner")]).join(), /"owner" is the owner's own call/);
  assert.match(ledgerFaults([{ landmark: "New", property: "text", category: "design-error", status: "proposed", reason: "a word form" }]).join(), /names the page's text in "actual"/);
});

test("ARIA snapshot identity uses the computed name and rejects unfamiliar output", () => {
  assert.deepEqual(snapshotIdentity('- button "Actual name" [expanded=false]: fallback'), { role: "button", name: "Actual name" });
  assert.deepEqual(snapshotIdentity(`- button ${JSON.stringify('Say "yes"')}`), { role: "button", name: 'Say "yes"' });
  assert.deepEqual(snapshotIdentity('- button'), { role: "button", name: "" });
  assert.equal(snapshotIdentity('unexpected'), null);
  assert.equal(snapshotIdentity('- button "unterminated'), null);
  assert.deepEqual(snapshotIdentity(`- 'button "Details: quantity"': More`), { role: "button", name: "Details: quantity" });
  assert.deepEqual(snapshotIdentity(`- 'button "Details: quantity" [expanded=false]': More`), { role: "button", name: "Details: quantity" });
  assert.deepEqual(snapshotIdentity(`- 'button "Bob''s: #1"': More`), { role: "button", name: "Bob's: #1" });
  assert.deepEqual(snapshotIdentity(`- 'button ${JSON.stringify(`Bob's: "quoted" #1`).replaceAll("'", "''")}': More`), { role: "button", name: `Bob's: "quoted" #1` });
  assert.equal(snapshotIdentity(`- 'button "unterminated': More`), null);
  assert.equal(snapshotIdentity(`- 'button "Details: quantity"' garbage`), null);
  assert.equal(snapshotIdentity(`- 'button "Bob's: #1"': More`), null);
});

// ------------------------------------------------------------------ in the browser

const playwright = (() => {
  for (const base of [path.join(process.cwd(), "noop.js"), DESIGN]) {
    for (const name of ["playwright", "@playwright/test", "playwright-core"]) {
      try { return createRequire(base).resolve(name); } catch { /* next */ }
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

// A launch that cannot start is not a verdict: it says why in one line and exits 2, before it reads a file. Asking for
// help is not a failure: the usage, exit 0, wherever --help stands.
test("a launch that cannot start says why in one line and exits 2; --help prints the usage and exits 0", () => {
  for (const args of [["check", "--help"], ["--help"], ["boxes", "ref.png", "--help"]]) {
    const r = cli(...args);
    assert.equal(r.status, 0, args.join(" "));
    assert.match(r.stdout, /node design\.mjs check <design\.json>/, args.join(" "));
  }
  const missing = path.join(os.tmpdir(), "no-such-dir-design-test", "design.json");
  for (const [args, reason] of [
    [["check"], /check needs a design\.json/],
    [["check", missing], /no file at .*no-such-dir-design-test/],
    [["check", "design.json", "--frame"], /--frame needs a value/],
    [["check", "design.json", "--quik"], /check does not take --quik/],
    [["check", "design.json", "--width", "300"], /check does not take --width/],
    [["bogus", "design.json"], /unknown command bogus/],
  ]) {
    const r = cli(...args);
    assert.equal(r.status, 2, args.join(" "));
    assert.equal(r.stderr.trim().split("\n").length, 1, `${args.join(" ")}: ${r.stderr}`);
    assert.match(r.stderr, reason, args.join(" "));
    assert.doesNotMatch(r.stderr, /ENOENT/, args.join(" "));
  }
});

// The reference card rendered once as the design: its specs and 2× images, in a directory a test copies.
let design;
// What a check expects of every pack before it can pass: the acceptance list in review.md.
// The layout model a complete check of a swept page requires, before the acceptance list as the page asks.
const MODEL = "## The layout model\n\n| Line | What shares it | Width | Below | Construct |\n|---|---|---|---|---|\n| top row | title, price | 400 px | price wraps | grid |\n\n";
const REVIEW = `# Review\n\n${MODEL}## The acceptance list\n\n| Item | Checked by | Result |\n|---|---|---|\n| every frame | its frame | pass — reference captured |\n`;
function designDir() {
  if (design) return design;
  design = tmp();
  fs.copyFileSync(path.join(CASE, "reference.html"), path.join(design, "page.html"));
  fs.writeFileSync(path.join(design, "design.json"), JSON.stringify({
    url: "page.html", root: CONFIG.root, host: CONFIG.host, ledger: "deviations.json", lifecycle: "a fixture: one render, no data changes",
    sweep: { ...CONFIG.sweep, stories: [{ name: "page", url: "page.html?dense" }], lines: [{ name: "badges", pieces: [".badge.new", ".badge:not(.new)"], from: 600 }] },
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
// Two transparent markers in every small page's root, so the fixture's sweep has a line of the model to measure.
const LINES = [{ name: "markers", pieces: [".row-a", ".row-b"] }];
const MARKERS = '<b class="row-a" style="display:inline-block;width:1px;height:1px;vertical-align:top"></b><b class="row-b" style="display:inline-block;width:1px;height:1px;vertical-align:top"></b>';
function smallFrame(body = "<span>Ready</span>", frames = [{ name: "frame" }]) {
  const dir = tmp(), page = path.join(dir, "page.html"), config = path.join(dir, "design.json");
  const markers = "<b class=row-a></b><b class=row-b></b>"; // no quotes: a test may put <main> inside an attribute
  const markup = (html) => `<!doctype html><style>body{margin:0}main{position:relative;width:300px;height:80px;background:white;font:20px/24px monospace}.row-a,.row-b{display:inline-block;width:1px;height:1px;vertical-align:top}</style>${html.replace(/<\/main>/g, `${markers}</main>`)}`;
  const write = (html) => fs.writeFileSync(page, markup(html));
  write(`<main>${body}</main>`);
  fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
  fs.writeFileSync(config, JSON.stringify({ url: "page.html", root: "main", ledger: "ledger.json", lifecycle: "a fixture: one render, no data changes",
    frames: frames.map((f, i) => ({ width: 300, spec: `${i}.json`, reference: `${i}.png`, ...f })),
    sweep: { from: 300, to: 300, stories: [{ name: "dense", url: "page.html?dense" }], lines: LINES } }));
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

test("each differing region stands alone: the ledger accepts ten, and the eleventh is a note of its own", browser, () => {
  const f = smallFrame(), marks = [], ledger = [];
  for (let i = 0; i < 11; i++) {
    const x = 5 + i * 22, side = i === 10 ? 6 : 10;
    marks.push(`<i style="position:absolute;left:${x}px;top:40px;width:${side}px;height:${side}px;background:black"></i>`);
    if (i !== 10) ledger.push({ property: "region", region: [x, 40, side, side], category: "owner", status: "accepted", decidedBy: "owner", reason: "accepted mark" });
  }
  f.write(`<main><span>Ready</span>${marks.join("")}</main>`);
  fs.writeFileSync(path.join(f.dir, "ledger.json"), JSON.stringify(ledger));
  const r = check(f.dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const regions = r.result.frames[0].issues.filter((i) => i.property === "region");
  assert.equal(regions.filter((i) => i.status === "accepted").length, 10);
  assert.deepEqual(r.result.frames[0].notes.filter((n) => n.property === "region").map((n) => n.box.x), [225]);
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
  // The image inside the root is measured: its pixels differ, a note.
  assert.equal(inside.status, 0, inside.error?.message ?? inside.stdout + inside.stderr);
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
  // 20 px, past the 12 px band.
  const r = check(variant(".badges { margin-top: 26px; }"), "--no-sweep");
  assert.equal(r.status, 1);
  for (const f of r.result.frames) {
    assert.deepEqual([f.causes[0].after, f.causes[0].before, f.causes[0].step], ["SKU AUR-14P-512", "New", 20], f.frame);
  }
  assert.match(r.stdout, /start here: between “SKU AUR-14P-512” and “New” vertically \+20 px/);
  assert.match(fs.readFileSync(path.join(r.dir, "out/report.md"), "utf8"), /Start here: between “SKU AUR-14P-512” and “New” vertically \+20 px/);
});

test("when a neighbour grows, start here names its width, not the texts it pushes along", browser, () => {
  // 30 px wider, so what it pushes along drifts past 24 px.
  const r = check(variant(".badge.new { letter-spacing: 10px; }"), "--frame", "720");
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
  // 30 px more, past the 24 px a height may differ by as a note.
  const css = ".card { padding-bottom: 50px; }";
  const entry = { landmark: "root", property: "height", category: "owner", reason: "the owner asked for more space below" };
  const accepted = check(variant(css, [{ ...entry, status: "accepted", decidedBy: "owner" }]), "--frame", "720");
  assert.equal(accepted.status, 0, accepted.stdout);
  // "owner" is the owner's own call: the implementer proposes under the cause it has.
  const pending = check(variant(css, [{ ...entry, category: "design-error", status: "proposed" }]), "--frame", "720");
  assert.equal(pending.status, 3);
  assert.match(pending.stdout, /pending: 1/);
  assert.equal(check(variant(css), "--frame", "720").status, 1);
});

test("a proposed text alternative reports what the page actually contains", browser, () => {
  const entry = { landmark: "New", property: "text", actual: "Fresh", category: "design-error", status: "proposed", reason: "consider a different label" };
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

test("what is not text is checked too: an image's size and a background's colour are areas that differ, as notes", browser, () => {
  const r = check(variant(".media { width: 72px; height: 72px; } .add { background: #1a8a4a; }"), "--frame", "720");
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /notes, the system's and not findings: .*\d+ pixel regions/);
  const regions = r.result.frames[0].notes.filter((i) => i.property === "region");
  assert.ok(regions.some((i) => i.box.x === 20 && i.box.y === 20 && i.box.width === 96 && i.box.height === 96), JSON.stringify(regions));
  assert.ok(regions.some((i) => i.landmark === "region near “Add to cart”"), JSON.stringify(regions));
});

test("the kit's taller badge, once accepted, excuses everything below it", browser, () => {
  // 26 px taller: past the 24 px a height, or a drift it carries, may differ by as a note.
  const entry = { landmark: ["New", "Bestseller"], property: "*", category: "system", status: "accepted", decidedBy: "owner", reason: "the kit's badge is 48 px high" };
  const r = check(variant(".badge { line-height: 48px; }", [entry]), "--no-sweep");
  assert.equal(r.status, 0, r.stdout);
  assert.equal(check(variant(".badge { line-height: 48px; }"), "--no-sweep").status, 1);
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
  // At 420 the reference's max-content specs run out of the card with longer texts, as the generated conditions
  // report there; this case is about the switches.
  fs.writeFileSync(path.join(moved, "design.json"), JSON.stringify({ ...cfg, sweep: { ...cfg.sweep, switches: [640, 420], generate: false } }));
  const named = check(moved);
  assert.equal(named.result.sweep.pass, true, named.stdout);
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
  // Steps of 14, 34 and 24 px: past the 12 px band, so each round fails.
  for (const css of [".badges { margin-top: 20px; }", ".badges { margin-top: 40px; }"]) {
    fs.writeFileSync(page, original.replace("</style>", `${css}\n</style>`));
    check(dir, "--no-sweep");
  }
  fs.writeFileSync(page, original.replace("</style>", ".badges { margin-top: 30px; }\n</style>"));
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
<div id="root">${MARKERS}<div class="v" style="left:10px;top:0"></div><div class="v" style="left:${second}px;top:30px"></div><div class="w" style="position:absolute;top:60px">x</div></div>`;
  const run = (second, align, { tolerance, hideBelow } = {}) => {
    fs.writeFileSync(path.join(dir, "page.html"), page(second, hideBelow));
    fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
    fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify({ url: "page.html", root: "#root", lifecycle: "a fixture: one render, no data changes", frames: [], ...(tolerance ? { tolerance } : {}), sweep: { from: 300, to: 340, step: 20, align, lines: LINES, stories: [{ name: "page", url: "page.html?dense" }] } }));
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
    fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify({ url: "page.html", root: "#root", ledger: "deviations.json", frames: [], sweep: { from: 300, to: 340, step: 20, align: v, lines: LINES, stories: [{ name: "page", url: "page.html?dense" }] } }));
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
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 320, step: 20, align: [{ selector: ".value", edge: "left" }], stories } }));
    fs.writeFileSync(path.join(f.dir, "review.md"), MODEL + [
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
  const cut = smallFrame('<div title="Ready steady go" style="width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Ready steady go</div>');
  const cfg = JSON.parse(fs.readFileSync(cut.config, "utf8"));
  fs.writeFileSync(cut.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40, stories: [{ name: "page", url: "page.html?dense" }] } }));
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
  assert.doesNotMatch(second.stdout, /stop/);
  // Draft 28.2: the verdict line itself says to stop, and each round records what it cost.
  const third = check(f.dir);
  assert.match(third.stdout, /^Verdict: fail — stop re-running: fix it, propose it with a reason, or report the check as blocked$/m);
  const history = fs.readFileSync(path.join(f.dir, "out/history.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  assert.deepEqual(history.map((h) => h.quick), [false, false, false]);
  assert.ok(history.every((h) => h.seconds > 0), JSON.stringify(history));
  assert.equal(history[2].bytes, Buffer.byteLength(third.stdout));
  check(f.dir, "--quick");
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.dir, "out/history.jsonl"), "utf8").trim().split("\n").at(-1)).quick, true);
  const spec = JSON.parse(fs.readFileSync(path.join(f.dir, "0.json"), "utf8"));
  fs.writeFileSync(path.join(f.dir, "0.json"), JSON.stringify({ ...spec, landmarks: [...spec.landmarks, { ...spec.landmarks[0], text: "Steady" }] }));
  // A changed spec starts a new series of scores; draft 28.3: the first finding, named by its key, is the same "Ready"
  // as before the change, and it has come first in every round since the first.
  const changed = check(f.dir).stdout;
  assert.doesNotMatch(changed, /previous round|lowest/);
  assert.match(changed, /^Verdict: fail — stop re-running/m);
});

test("a dense story is swept too: a text over a text, a control under another element, and its pictures", browser, () => {
  const f = smallFrame();
  fs.writeFileSync(path.join(f.dir, "dense.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0}main{position:relative;width:300px;height:80px;background:white;font:20px/24px monospace}</style>
<main><span>Ready</span><button aria-label="Help" style="position:absolute;left:0;top:30px;width:20px;height:20px"></button>
<span style="position:absolute;left:0;top:10px;background:white;padding:4px">Ready and waiting for a very long time</span></main>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40, stories: [{ name: "dense", url: "dense.html" }] } }));
  const r = check(f.dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  const story = r.result.sweep.issues.filter((i) => i.story === "dense");
  assert.ok(story.some((i) => i.property === "covered" && i.landmark === "Help"), JSON.stringify(story));
  assert.ok(story.some((i) => i.property === "overlap"), JSON.stringify(story));
  assert.ok(r.result.sweep.issues.every((i) => ["dense", "dense, texts stretched"].includes(i.story)), "the frame's own story is clean");
  assert.match(r.stdout, /covered Help \(dense\)/);
  const gallery = fs.readFileSync(path.join(f.dir, "out/gallery.html"), "utf8");
  assert.match(gallery, /<h2>Story: dense<\/h2>/);
  assert.match(gallery, /<figcaption>300 px<\/figcaption><img src="data:image\/png/);
});

test("a frame of a state drawn outside the component names its own root", browser, () => {
  const dir = tmp(), config = path.join(dir, "design.json");
  const page = (pop) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:16px/20px monospace}main{width:300px;height:40px}
.pop{position:fixed;top:50px;left:0;width:200px;padding:8px;background:#eee}</style>
<main>${MARKERS}<button id="help" style="width:40px;height:20px">i</button></main><div class="pop" hidden>${pop}</div>
<script>help.onmouseenter = () => { document.querySelector(".pop").hidden = false; };
help.onmouseleave = () => { document.querySelector(".pop").hidden = true; };</script>`;
  fs.writeFileSync(path.join(dir, "page.html"), page("Was 10, now 8"));
  fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
  fs.writeFileSync(config, JSON.stringify({ url: "page.html", root: "main", lifecycle: "a fixture: one render, no data changes", frames: [
    { name: "popover", width: 300, root: ".pop", setup: [{ hover: "#help" }], spec: "pop.json", reference: "pop.png" }],
    sweep: { from: 300, to: 300, lines: LINES, stories: [{ name: "dense", url: "page.html?dense" }] }, journeys: [{ name: "help opens and closes", steps: [{ hover: "#help" }, { visible: ".pop" }, { move: [290, 600] }, { hidden: ".pop" }] }] }));
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
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40, stories: [{ name, url: `${name}.html` }] } }));
    return check(f.dir).result.sweep.issues.filter((i) => i.story === name && i.property === "covered").map((i) => i.landmark);
  };
  assert.deepEqual(sweep("partial", '<button aria-label="Help" style="position:absolute;left:0;top:0;width:40px;height:40px"></button><div class="box" style="left:22px;top:0;width:60px;height:40px"></div>'), ["Help"]);
  assert.deepEqual(sweep("fold", '<div style="height:1400px"></div><button aria-label="Low" style="width:40px;height:20px"></button><div class="box" style="left:0;top:1400px;width:60px;height:20px"></div>'), ["Low"]);
  assert.deepEqual(sweep("label", '<label style="position:relative;display:block;width:40px;height:20px"><input type="checkbox" style="position:absolute;inset:0;margin:0"><span style="position:absolute;inset:0;background:#2457c5"></span></label>'), []);
  assert.deepEqual(sweep("disabled", '<button aria-disabled="true" aria-label="Off" style="width:40px;height:20px"></button><div class="box" style="left:0;top:0;width:60px;height:20px"></div><button disabled aria-label="Gone" style="width:40px;height:20px"></button>'), []);
});

test("journeys hold or fail step by step, by pointer and by touch", browser, () => {
  const f = smallFrame();
  fs.appendFileSync(f.page, `<button id="t" style="width:40px;height:20px">?</button><div id="pop" hidden style="position:fixed;top:120px;left:0;width:120px;height:40px;background:#eee">Help text</div>
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
  // Each opener's journey also runs at the window's top and bottom edges; the popover, fixed in the window, holds.
  const own = r.result.journeys.filter((j) => !/at the window's/.test(j.name));
  assert.deepEqual(own.map((j) => [j.name, j.pass]), [["hover opens and shows the text", true], ["leaving closes it", false], ["a tap toggles it", true]]);
  assert.ok(r.result.journeys.filter((j) => /at the window's/.test(j.name)).every((j) => j.pass), JSON.stringify(r.result.journeys));
  assert.match(own[1].failed, /step 5.*#pop is still visible/);
  assert.match(r.stdout, /journeys: 6 of 7 hold/);
  assert.match(r.stdout, /journey fails: leaving closes it/);
  assert.match(fs.readFileSync(path.join(f.dir, "out/gallery.html"), "utf8"), /<h2>Journeys<\/h2>/);
});

test("a full check is incomplete without a story or a frame for every reference; without review.md it can pass", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40 } }));
  let r = check(f.dir);
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /Not checked: no dense story is swept/);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40, stories: [{ name: "page", url: "page.html?dense" }] } }));
  assert.equal(check(f.dir).status, 0);
  fs.mkdirSync(path.join(f.dir, "frames/popover"), { recursive: true });
  fs.copyFileSync(path.join(f.dir, "0.png"), path.join(f.dir, "frames/popover/reference.png"));
  r = check(f.dir);
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /references no frame checks: frames\/popover\/reference\.png/);
  fs.rmSync(path.join(f.dir, "frames"), { recursive: true });
  fs.rmSync(path.join(f.dir, "review.md"));
  // Draft 28: the acceptance list is an aid, not a gate; its rows are assessed when it has them.
  r = check(f.dir);
  assert.equal(r.status, 0, r.stdout);
  assert.deepEqual(r.result.acceptance, []);
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
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40, stories: [{ name, url: `${name}.html` }] } }));
    return check(f.dir).result.sweep.issues.filter((i) => i.story === name).map((i) => i.property);
  };
  assert.deepEqual(sweep("ellipsis", '<div style="display:flex;gap:8px"><div title="A very long apartment title that cannot fit" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">A very long apartment title that cannot fit</div><b>€10</b></div>'), []);
  assert.deepEqual(sweep("clamp", '<p aria-label="Line one of a long text that wraps onto line two and three" style="display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden;margin:0">Line one of a long text that wraps onto line two and three</p><a href="#">Read more</a>'), []);
  // Cut on purpose with the full text nowhere to read is a finding with its action (draft 28.2), not a construct.
  assert.deepEqual(sweep("unreachable", '<div style="width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">A very long apartment title</div>'), ["truncated"]);
  const cut = check(f.dir).result.sweep.issues.find((i) => i.property === "truncated");
  assert.equal(cut.status, "fail");
  assert.match(cut.actual, /give it a title, an accessible name or a tooltip/);
  assert.deepEqual(sweep("wrapped", '<div style="width:120px;height:20px;overflow:hidden;text-overflow:ellipsis">A text that wraps and is cut below its first line</div>'), ["clipped"]);
});

test("covered leaves wrapped links, a transparent file input and a disabled fieldset alone", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(path.join(f.dir, "controls.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0}main{position:relative;width:300px;min-height:60px;background:white;font:16px/20px monospace}</style><main>
<p style="width:200px;margin:0">I agree to the <a href="#">terms of service</a> and <a href="#">privacy policy of the site</a>.</p>
<span style="position:relative;display:inline-block"><button style="height:24px">Upload</button><input type="file" style="position:absolute;inset:0;opacity:0"></span>
<fieldset disabled style="position:relative;border:0;padding:0;margin:0"><button style="width:60px;height:20px">Send</button><span style="position:absolute;inset:0"></span></fieldset></main>`);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40, stories: [{ name: "controls", url: "controls.html" }] } }));
  const r = check(f.dir);
  assert.deepEqual(r.result.sweep.issues.filter((i) => i.property === "covered"), [], r.stdout);
});

test("a story that cannot be swept is a gap, and the frames' own sweep is kept", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(path.join(f.dir, "empty.html"), "<!doctype html><p>no root here</p>");
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40, stories: [{ name: "page", url: "page.html" }, { name: "empty", url: "empty.html" }] } }));
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
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40, stories: [{ name, url: `${name}.html` }] } }));
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

test("the acceptance list is a heading with lines under it, not the word alone, and its rows are assessed when it has them", browser, () => {
  const f = smallFrame();
  const review = path.join(f.dir, "review.md");
  for (const [text, rows, status] of [["No acceptance list was written.\n", 0, 0], ["## Acceptance\n\n| Item | Checked by | Result |\n|---|---|---|\n", 0, 0],
    ["## Acceptance\n\n- every frame: pass — captured\n", 1, 0], ["## The acceptance list\n\n| Item | Checked by | Result |\n|---|---|---|\n| frame | check | pass — captured |\n", 1, 0],
    ["## Acceptance\n\n| frame | check | pass |\n|---|---|---|\n", 0, 0], ["## Acceptance\n\n- every frame: pass\n", 1, 2]]) {
    fs.writeFileSync(review, MODEL + text);
    const r = check(f.dir);
    assert.deepEqual([r.result.acceptance.length, r.status], [rows, status], text);
  }
});

// ------------------------------------------------------------------ round 11: verification without a second agent

test("a full check writes the evidence a handoff quotes, and a journey that expects nothing is refused", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40, stories: [{ name: "page", url: "page.html?dense" }] },
    journeys: [{ name: "root shows", steps: [{ visible: "main" }] }] }));
  const r = check(f.dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const handoff = fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8");
  for (const line of [/^- frame: pass — no findings$/m, /^- story page: no findings; its longest texts: “.*”$/m, /^- root shows \(300 px\): holds; checks opening only, not closing$/m,
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
  assert.match(opener.stdout, /page text not in the design \(1\): “More”/, "the button is not in the spec either");
  assert.equal(opener.status, 2);
});

test("the handoff's evidence counts what the ledger excused, names unused entries and blank acceptance rows", browser, () => {
  const f = smallFrame();
  f.write('<main><span style="margin-left:9px">Ready</span></main>');
  fs.writeFileSync(path.join(f.dir, "ledger.json"), JSON.stringify([
    { landmark: "Ready", property: "x", category: "system", status: "accepted", reason: "the kit's padding", decidedBy: "owner" },
    { landmark: "Gone", property: "presence", category: "ux", status: "proposed", reason: "drop it", options: ["keep", "drop"] }]));
  fs.writeFileSync(path.join(f.dir, "review.md"), `${MODEL}## Acceptance\n\n| Item | Checked by | Result |\n|---|---|---|\n| frame | check | pass — captured |\n| popup | journey |  |\n`);
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
  fs.writeFileSync(path.join(f.dir, "review.md"), MODEL + "## Критерии приёмки\n\n| Item | Result | Notes |\n|---|---|---|\n| frame | pass — captured | see later |\n| popup |  | later |\n\n### More\n\n- dense story: swept\n+ probe\n");
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

test("a journey on a data variant cannot cover an absent target on the measured page", browser, () => {
  const f = smallFrame('<button id="more" popovertarget="panel">More</button>');
  fs.appendFileSync(f.page, `<script>if (location.search) document.querySelector('main').insertAdjacentHTML('beforeend', '<div id="panel" popover>Details</div>');</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "variant", url: "page.html?variant", steps: [
    { click: "#more" }, { visible: "#panel" }, { click: "#more" }, { hidden: "#panel" },
  ] }] }));
  let r = check(f.dir);
  assert.ok(r.result.journeys.find((j) => j.name === "variant").pass, r.stdout);
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /no journey that opens and closes it: “More”/);
  fs.writeFileSync(f.page, fs.readFileSync(f.page, "utf8").replace("if (location.search)", "if (!location.search)"));
  const configured = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...configured, frames: [{ ...configured.frames[0], url: "page.html?variant" }],
    journeys: [{ ...configured.journeys[0], url: "page.html" }] }));
  r = check(f.dir);
  assert.ok(r.result.journeys.find((j) => j.name === "variant").pass, r.stdout);
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /no journey that opens and closes it: “More”/);
});

test("cross-page coverage uses the accessible name and an existing linked target", browser, () => {
  const f = smallFrame('<span id="a-name" hidden>Details</span><button class="d" aria-labelledby="a-name" popovertarget="panel">More</button><div id="panel" popover>Content</div>');
  const other = path.join(f.dir, "other.html"), cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const page = fs.readFileSync(f.page, "utf8").replaceAll("a-name", "different-internal-id");
  const run = (html, target = "#panel") => {
    fs.writeFileSync(other, html);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "toggle", url: "other.html", steps: [
      { click: ".d" }, { visible: target }, { click: ".d" }, { hidden: target },
    ] }] }));
    return check(f.dir);
  };
  let r = run(page);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.result.journeys[0].notes.join(), /covers “Details” on page.html, linked to #panel/);
  r = run(page.replace(">Details</span>", ">Other name</span>"));
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /no journey that opens and closes it: “Details”/);
  r = run(page.replaceAll('panel', 'other-panel'), '#other-panel');
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /no journey that opens and closes it: “Details”/);
  fs.appendFileSync(f.page, `<script>if (location.search === '?variant') document.getElementById('a-name').textContent = 'Other name';</script>`);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "variant", url: "page.html?variant", steps: [
    { click: ".d" }, { visible: "#panel" }, { click: ".d" }, { hidden: "#panel" },
  ] }] }));
  r = check(f.dir);
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /no journey that opens and closes it: “Details”/);
});

test("ARIA names with YAML punctuation keep identical and different controls distinct", browser, () => {
  const name = `Bob's: "volume" #1`;
  const f = smallFrame(`<span id="label" hidden>${name}</span><button id="more" aria-labelledby="label" popovertarget="panel">More</button><div id="panel" popover>Details</div>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const other = path.join(f.dir, "other.html"), original = fs.readFileSync(f.page, "utf8");
  const run = (html) => {
    fs.writeFileSync(other, html);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "open and close", url: "other.html", steps: [
      { click: "#more" }, { visible: "#panel" }, { click: "#more" }, { hidden: "#panel" },
    ] }] }));
    return check(f.dir);
  };
  let r = run(original.replaceAll('id="label"', 'id="other-label"').replaceAll('aria-labelledby="label"', 'aria-labelledby="other-label"'));
  assert.equal(r.status, 0, r.stdout);
  assert.equal(r.result.frames[0].openers[0].name, name);
  assert.equal(r.result.journeys[0].closers[0].name, name);
  r = run(original.replace(name, `Bob's: "other" #1`));
  assert.equal(r.status, 2, r.stdout);
  assert.ok(r.result.gaps.some((gap) => gap.includes(name)), r.stdout);
});

test("frame, quick and full never act on an unspecified opener; an explicit journey may open a lazy target", browser, async () => {
  const f = smallFrame(`<button class="d" aria-expanded="false" aria-controls="panel">Details</button>
<script>document.querySelector('.d').onclick = () => { fetch('/hit', { method: 'POST' }); let panel = document.getElementById('panel');
if (panel) { panel.remove(); } else { panel = document.createElement('div'); panel.id = 'panel'; panel.textContent = 'Panel'; document.body.append(panel); } };</script>`);
  const count = path.join(f.dir, "posts"), cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(count, "");
  const script = `const http = require('node:http'), fs = require('node:fs');
http.createServer((req, res) => { if (req.method === 'POST') { fs.appendFileSync(process.argv[2], 'x'); res.end('ok'); }
else { res.setHeader('content-type', 'text/html'); res.end(fs.readFileSync(process.argv[1])); } }).listen(0, '127.0.0.1', function () { console.log(this.address().port); });`;
  const server = spawn(process.execPath, ["-e", script, f.page, count], { stdio: ["ignore", "pipe", "pipe"] });
  try {
    const port = await new Promise((resolve, reject) => { server.stdout.once("data", (v) => resolve(Number(String(v).trim()))); server.once("error", reject); server.once("exit", (code) => reject(new Error(`server exited ${code}`))); });
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, url: `http://127.0.0.1:${port}/page`, sweep: { ...cfg.sweep, stories: [{ name: "dense", url: `http://127.0.0.1:${port}/page?dense` }] } }));
    for (const args of [["--frame", "frame"], ["--quick"], []]) {
      const r = check(f.dir, ...args);
      assert.ok(r.result, r.stderr);
      assert.equal(fs.readFileSync(count, "utf8"), "", args.join(" "));
      if (!args.length) assert.match(r.stdout, /no journey that opens and closes it: “Details”/);
    }
    const configured = JSON.parse(fs.readFileSync(f.config, "utf8"));
    fs.writeFileSync(f.config, JSON.stringify({ ...configured, journeys: [{ name: "lazy", steps: [
      { click: ".d" }, { visible: "#panel" }, { click: ".d" }, { hidden: "#panel" },
    ] }] }));
    const r = check(f.dir);
    assert.ok(r.result.journeys.find((j) => j.name === "lazy").pass, r.stdout);
    assert.ok(fs.readFileSync(count, "utf8").length >= 2);
    assert.doesNotMatch(r.stdout, /no journey that opens and closes it/);
  } finally { server.kill(); }
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
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 280, to: 300 } }));
  const overflow = run(sweep);
  assert.deepEqual([overflow.status, overflow.result.acceptance[0].status], [1, "fail"], overflow.stdout);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 320 } }));
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
<div class="tip" hidden style="position:fixed;left:0;top:100px;width:120px;height:30px;background:#eee">Tip</div>
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

test("v21: the evidence starts with the status, a fail can be reported as blocked, and other data is named", browser, () => {
  const f = smallFrame('<span>Ready</span> <b>Steady</b> <i>Go</i>');
  f.write('<main><span>Alpha</span> <b>Beta</b> <i>Gamma</i></main>');
  const r = check(f.dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /Fail: fix what is in scope; an evidenced external blocker may be handed over as blocked/);
  assert.match(r.stdout, /3 of 3 design texts are missing: the page likely renders other data than this frame/);
  assert.match(fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8"), /^Status: fail — fix what is in scope; an evidenced external blocker may be handed over as blocked/m);
});

// ------------------------------------------------------------------ v22: predicting where the layout breaks

test("v22, draft 28.2: the sweep measures the predicted switch widths exactly, and forecasts nothing: the generated conditions test other data", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(path.join(f.dir, "frail.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0}main{position:relative;width:300px;min-height:80px;background:white;font:16px/20px monospace}</style>
<main><span>Ready</span><span class="price" style="position:absolute;right:0;top:0">€ 1 250</span>
<div style="height:20px;width:120px">A label long enough to wrap onto lines</div><span style="display:inline-block;margin-left:-8px">Pulled</span></main>`);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { lines: LINES, from: 300, to: 340, step: 40, switches: [320], stories: [{ name: "frail", url: "frail.html" }] } }));
  const r = check(f.dir);
  assert.equal(r.result.sweep.fragile, undefined);
  assert.doesNotMatch(r.stdout, /fragile/);
  const handoff = fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8");
  assert.doesNotMatch(handoff, /fragile/);
  assert.match(handoff, /^- layout model: 1 row in review\.md, first seen in round 1 /m, handoff);
  assert.match(handoff, /^- predicted switches: 320; measured layout changes: /m, handoff);
  const pulled = r.result.sweep.issues.find((i) => i.property === "construct" && i.landmark === "Pulled");
  assert.ok(pulled, JSON.stringify(r.result.sweep.issues));
  assert.match(pulled.ranges, /319/, `measured a pixel either side of the predicted 320: ${pulled.ranges}`);
  assert.match(pulled.ranges, /321/, pulled.ranges);
});

test("v22, draft 28: the layout model is an aid, not a gate; the evidence counts its rows, and a header alone is none", browser, () => {
  const f = smallFrame();
  const review = path.join(f.dir, "review.md");
  const acceptance = REVIEW.slice(REVIEW.indexOf("## The acceptance list"));
  const handoff = () => fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8");
  const run = (text) => { fs.writeFileSync(review, text + acceptance); return check(f.dir); };
  let r = run("# Review\n\n");
  assert.equal(r.status, 0, r.stdout);
  assert.doesNotMatch(r.stdout, /layout model/);
  assert.match(handoff(), /^- layout model: none in review\.md$/m);
  r = run("## Layout model\n\n| Line | Shares | Width | Below | Construct |\n|---|---|---|---|---|\n\n");
  assert.match(handoff(), /^- layout model: none in review\.md$/m, "a header alone is not a model");
  r = run("## Модель раскладки\n\n- одна строка: метка, 12 символов по контракту; 140 px; ниже переносится; flex-wrap\n\n");
  assert.equal(r.status, 0, r.stdout);
  assert.match(handoff(), /^- layout model: 1 row in review\.md, first seen in round 3 /m);
});

// ------------------------------------------------------------------ draft 23: ink, lines, and a narrower ledger


test("v23: a line of the model holds its pieces in one row, in order, unwrapped, where its range and mode say", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const card = (extra = "") => `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px/18px sans-serif}
main{width:100%;display:flex;flex-wrap:wrap;gap:8px}.sku{white-space:nowrap}.price{white-space:nowrap}${extra}</style>
<main data-mode="wide"><span class="sku">BA-EDGE-2026-TRIPLE</span><span class="disks">2 × 838 SSD</span><span class="price">1 234 € / month</span></main>`;
  fs.writeFileSync(path.join(f.dir, "wrap.html"), card());
  const run = (lines, extra) => {
    fs.writeFileSync(path.join(f.dir, "wrap.html"), card(extra));
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 200, to: 500, step: 100, lines: [...LINES, ...lines], stories: [{ name: "wrap", url: "wrap.html" }] } }));
    return check(f.dir);
  };
  const row = { name: "top row", pieces: [".sku", ".disks", ".price"] };
  // Below its width the row wraps: the line says where it holds, and is held to it only there.
  let r = run([row]);
  const broke = r.result.sweep.issues.filter((i) => i.property === "line" && i.story === "wrap");
  assert.ok(broke.some((i) => /leaves the row/.test(i.actual) && /200|300/.test(i.ranges)), JSON.stringify(broke));
  assert.equal(r.status, 1);
  r = run([{ ...row, from: 400 }]);
  assert.deepEqual(r.result.sweep.issues.filter((i) => i.property === "line"), [], r.stdout);
  // A mode the page names: the line holds while the page says it is wide.
  r = run([{ ...row, when: "[data-mode=narrow]" }]);
  assert.match(r.stdout, /the line “top row” never showed two of its pieces/);
  // Order: the price before the disks.
  r = run([{ ...row, from: 400 }], ".disks{order:3}");
  assert.ok(r.result.sweep.issues.some((i) => i.property === "line" && /“\.price” stands before “\.disks”/.test(i.actual)), r.stdout);
  // A piece that wraps inside itself, unless it may.
  r = run([{ ...row, from: 400 }], ".disks{width:40px}");
  assert.ok(r.result.sweep.issues.some((i) => i.property === "line" && /“\.disks” wraps onto \d lines/.test(i.actual)), JSON.stringify(r.result.sweep.issues.filter((i) => i.property === "line")));
  r = run([{ ...row, from: 400, pieces: [".sku", { selector: ".disks", wraps: true }, ".price"] }], ".disks{width:40px}");
  assert.deepEqual(r.result.sweep.issues.filter((i) => i.property === "line"), [], r.stdout);
  // One element named twice is not a line.
  r = run([{ name: "twice", pieces: [".sku", "main > .sku"] }]);
  assert.match(r.stdout, /the line “twice” never showed two of its pieces/);
  // Draft 28: lines are checked when declared; a complete check needs none.
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 300, stories: [{ name: "wrap", url: "wrap.html" }] } }));
  r = check(f.dir);
  assert.equal(r.status, 0, r.stdout);
  assert.doesNotMatch(r.stdout, /sweep\.lines/);
});

test("v23: a broad excuse is named first", browser, () => {
  const f = smallFrame('<span style="margin-left:9px">A</span> <span>B</span> <span>C</span> <span>D</span>');
  // 30 px, past twice the band, so what B, C and D carry from A is no drift note either.
  f.write('<main><span style="margin-left:39px">A</span> <span>B</span> <span>C</span> <span>D</span></main>');
  fs.writeFileSync(path.join(f.dir, "ledger.json"), JSON.stringify([{ landmark: ["A", "B", "C", "D"], property: "x", category: "design-error", status: "proposed", reason: "the frame's padding is off the scale" }]));
  check(f.dir);
  const handoff = fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8");
  assert.match(handoff, /## Broad excuses\n\n- one entry covers 4 findings: A, B, C, D x — the frame's padding is off the scale \(design-error, proposed\)/, handoff);
  assert.ok(handoff.indexOf("## Broad excuses") < handoff.indexOf("## Pictures to look at first"));
});

// ------------------------------------------------------------------ draft 23.1: the critic's and verifier's cases

// A design page snapshot as an image, its named boxes made by `boxes` and named from the snapshot's own texts (a
// perfect transcription), then the page swapped and one frame checked.
function boxCase(design, page, width = 320, { ledger = [] } = {}) {
  const dir = tmp(), config = path.join(dir, "design.json"), file = path.join(dir, "page.html");
  const wrap = (body) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff}</style>${body}`;
  fs.writeFileSync(file, wrap(design));
  fs.writeFileSync(config, JSON.stringify({ url: "page.html", root: "main", ledger: "ledger.json", static: "one frame", lifecycle: "a fixture: one render, no data changes", frames: [{ name: "frame", width, spec: "snap.json", reference: "ref.png" }] }));
  fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
  fs.writeFileSync(path.join(dir, "ledger.json"), JSON.stringify(ledger));
  assert.equal(cli("snapshot", config, "--images", "--scale", "2").status, 0);
  const made = cli("boxes", path.join(dir, "ref.png"), "--width", String(width), "--out", path.join(dir, "spec.json"));
  assert.equal(made.status, 0, made.stderr);
  const snap = JSON.parse(fs.readFileSync(path.join(dir, "snap.json"), "utf8"));
  const spec = JSON.parse(fs.readFileSync(path.join(dir, "spec.json"), "utf8"));
  const inside = (p, b) => { const cx = p.box.x + p.box.width / 2, cy = p.box.y + p.box.height / 2; return cx >= b.x - 1 && cx <= b.x + b.width + 1 && cy >= b.y - 1 && cy <= b.y + b.height + 1; };
  spec.landmarks = snap.landmarks.filter((l) => l.text).map((l) => ({ text: l.text, pieces: spec.pieces.filter((p) => inside(p, l.box)).map((p) => p.n) })).filter((l) => l.pieces.length);
  const used = new Set(spec.landmarks.flatMap((l) => l.pieces));
  spec.skip = Object.fromEntries(spec.pieces.filter((p) => !used.has(p.n)).map((p) => [p.n, "not text: a box or a rule"]));
  fs.writeFileSync(path.join(dir, "spec.json"), JSON.stringify(spec));
  fs.writeFileSync(config, JSON.stringify({ ...JSON.parse(fs.readFileSync(config, "utf8")), frames: [{ name: "frame", width, spec: "spec.json", reference: "ref.png" }] }));
  fs.writeFileSync(file, wrap(page));
  const r = check(dir, "--frame", "frame");
  return { ...r, dir, spec, frame: r.result.frames[0] };
}


test("v23.1: a line reads what is seen: a hidden tip is not a wrap, a heading that wraps is, a right-to-left row keeps its order, and a bad selector is named", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (html, lines, extra = {}) => {
    fs.writeFileSync(path.join(f.dir, "row.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px/18px sans-serif}main{display:flex;gap:12px;padding:8px}.title{font-weight:600}.price{margin-inline-start:auto;white-space:nowrap}</style>${html}`);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, ...extra, sweep: { from: 240, to: 400, step: 80, lines: [...LINES, ...lines], stories: [{ name: "row", url: "row.html" }] } }));
    return check(f.dir);
  };
  const line = [{ name: "top row", pieces: [".title", ".price"] }];
  let r = run('<main><div class="title">Server BA</div><div class="price" style="position:relative">1 234 € <span style="position:absolute;bottom:100%;right:0;opacity:0;white-space:nowrap">Billed yearly</span></div></main>', line);
  assert.deepEqual(r.result.sweep.issues.filter((i) => i.property === "line"), [], r.stdout);
  r = run('<main><div class="title"><h3 style="margin:0;font-size:14px">Dedicated server with NVMe storage and backups</h3></div><div class="price">1 234 €</div></main>', line);
  assert.ok(r.result.sweep.issues.some((i) => i.property === "line" && /“\.title” wraps/.test(i.actual)), r.stdout);
  r = run('<main dir="rtl"><span class="tag">NVMe</span><span class="tag">10G</span><span class="price">1 234 €</span></main>', [{ name: "tags", pieces: [".tag", ".price"] }]);
  assert.deepEqual(r.result.sweep.issues.filter((i) => i.property === "line"), [], r.stdout);
  r = run('<main><div class="title">A</div><div class="price">B</div></main>', [{ name: "bad", pieces: ["text=A", ".price"] }]);
  assert.match(r.stdout, /the line bad: .*use a CSS selector/);
  assert.ok(fs.existsSync(path.join(f.dir, "out/report.md")), "the check still writes its report");
  // "static" is for one width.
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: undefined, static: "screenshots only", frames: [...cfg.frames, { ...cfg.frames[0], name: "narrow", width: 200 }] }));
  assert.match(check(f.dir).stdout, /"static" is for a page at one width; these frames have 2 widths/);
});

// ------------------------------------------------------------------ draft 24: an excuse is tested against what it claims


// ------------------------------------------------------------------ draft 25: named boxes, and logic over hacks

const CARD = ({ family = "sans-serif", sku = 16, col = 150, disk = "2 × 838", price = "font-size:14px", top = 52 } = {}) => `<main style="position:relative;width:420px;height:90px;font:14px/18px ${family};color:#111">
<div style="position:absolute;left:${sku}px;top:12px;font-weight:600">BA-i201-B</div>
<div style="position:absolute;left:${col}px;top:12px">32 ядер</div>
<div style="position:absolute;left:260px;top:12px">${disk}</div>
<div style="position:absolute;right:16px;top:${top}px;${price}">1 234 €</div></main>`;

test("v25: boxes proposes pieces to name; unnamed, the frame is not measured; named, it compares by place and its text exactly", browser, () => {
  let r = boxCase(CARD(), CARD(), 420);
  assert.equal(r.frame.verdict, "pass", r.stdout);
  assert.ok(r.spec.pieces.length >= 4 && fs.existsSync(path.join(r.dir, "boxes.png")));
  // Another font alone moves nothing; a shifted column and a changed format do; a wider text is a note.
  r = boxCase(CARD(), CARD({ family: "serif" }), 420);
  assert.deepEqual(r.frame.issues.filter((i) => i.status === "fail"), [], r.stdout);
  r = boxCase(CARD(), CARD({ col: 166 }), 420);
  assert.ok(r.frame.issues.some((i) => i.property === "x" && i.landmark === "32 ядер" && Math.round(i.delta) === 16), r.stdout);
  r = boxCase(CARD(), CARD({ disk: "838 × 2" }), 420);
  assert.ok(r.frame.issues.some((i) => i.property === "presence" && i.landmark === "2 × 838" && i.actual === "missing"), r.stdout);
  assert.match(r.stdout, /page text not in the design \(1\): “838 × 2”/);
  r = boxCase(CARD(), CARD({ price: "font-size:20px;font-weight:700" }), 420);
  assert.ok(!r.frame.issues.some((i) => i.property === "width"), r.stdout);
  assert.ok(r.frame.notes.some((n) => n.property === "width" && n.landmark === "1 234 €"), r.stdout);
  assert.match(r.stdout, /notes, the system's and not findings: .*1 texts wider or narrower than drawn/);
  // A piece left out of every landmark keeps the frame incomplete.
  const spec = path.join(r.dir, "spec.json");
  const s = JSON.parse(fs.readFileSync(spec, "utf8"));
  fs.writeFileSync(spec, JSON.stringify({ ...s, landmarks: s.landmarks.slice(1) }));
  const partial = check(r.dir, "--frame", "frame");
  assert.ok(partial.result.frames[0].uncovered?.length >= 1, partial.stdout);
  assert.match(partial.stdout, /pieces of the design's ink are in no named box/);
  fs.writeFileSync(spec, JSON.stringify({ ...s, landmarks: [] }));
  assert.match(check(r.dir, "--frame", "frame").stdout, /the named boxes are not ready: no landmark is named yet/);
});

test("v25, draft 28: within the band an offset is a note, proposed or not; past it, a proposal of any category leaves it pending", browser, () => {
  const entry = (landmark, property, category) => [{ landmark, property, category, status: "proposed", reason: "the kit's spacing token" }];
  let r = boxCase(CARD(), CARD({ col: 158 }), 420, { ledger: entry("32 ядер", "x", "system") });
  assert.ok(r.frame.notes?.some((n) => n.landmark === "32 ядер" && n.property === "x"), r.stdout);
  assert.equal(r.frame.verdict, "pass", r.stdout);
  r = boxCase(CARD(), CARD({ col: 170 }), 420);
  assert.equal(r.frame.issues.find((i) => i.landmark === "32 ядер" && i.property === "x").status, "fail", r.stdout);
  for (const category of ["system", "design-error"]) {
    r = boxCase(CARD(), CARD({ col: 170 }), 420, { ledger: entry("32 ядер", "x", category) });
    assert.equal(r.frame.issues.find((i) => i.landmark === "32 ядер" && i.property === "x").status, "pending", `${category}: ${r.stdout}`);
  }
});

test("v25, draft 28: a negative margin or a transform that moves text is a construct, a note for the owner's eye", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(path.join(f.dir, "hacks.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px/18px sans-serif}main{display:flex;gap:12px;padding:8px}</style>
<main><span class="a">Alpha</span><span class="b" style="margin-left:-6px">Beta</span><span class="c" style="transform:translateY(3px)">Gamma</span><span class="d" style="margin-left:-1px">Delta</span></main>`);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 300, lines: LINES, stories: [{ name: "hacks", url: "hacks.html" }] } }));
  const r = check(f.dir);
  const constructs = r.result.sweep.issues.filter((i) => i.property === "construct");
  assert.ok(constructs.some((i) => i.landmark === "Beta" && /negative margin \(left -6 px\)/.test(i.actual)), JSON.stringify(constructs));
  assert.ok(constructs.some((i) => i.landmark === "Gamma" && /a transform moves it 0, 3 px/.test(i.actual)), JSON.stringify(constructs));
  assert.ok(!constructs.some((i) => i.landmark === "Delta"), "a hairline is not a construct");
  assert.ok(constructs.every((i) => i.status === "note"), JSON.stringify(constructs));
  assert.equal(r.status, 0, r.stdout);
  assert.equal(r.result.sweep.score, 0, "a note counts nothing");
  assert.match(r.stdout, /2 notes, not findings: construct “Beta” \(hacks\), construct “Gamma” \(hacks\)/);
  const handoff = fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8");
  assert.match(handoff, /^- story hacks: no findings; 2 notes, not findings: construct “Beta”/m);
  // Draft 28.2: a construct is a note that needs its reason, and the evidence lists each for it.
  assert.match(handoff, /^## Constructs\n\nA construct is a note that needs its reason: fix it, or give the reason in the handoff\.\n\n- Beta \(hacks\) construct: a negative margin/m);
});

// ------------------------------------------------------------------ draft 25.1: the critic's and verifier's cases

test("v25.1: a relative nudge is a construct; centring, a slide and the kit's own classes are not; text over an icon is an overlap", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(path.join(f.dir, "c.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px/18px sans-serif}main{display:flex;gap:12px;padding:8px;position:relative;height:70px}</style>
<main><span style="position:relative;top:3px">Nudged</span><span style="position:absolute;left:50%;top:40px;transform:translate(-50%,0)">Centred</span>
<span class="kit-row" style="margin-left:-12px">Gutter</span><span>Label<svg style="margin-left:-20px" width="16" height="16"><rect width="16" height="16"/></svg></span></main>`);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, kit: ["kit-"], sweep: { from: 300, to: 300, lines: LINES, stories: [{ name: "c", url: "c.html" }] } }));
  const issues = check(f.dir).result.sweep.issues.filter((i) => i.story === "c");
  const say = JSON.stringify(issues.map((i) => [i.property, i.landmark, i.actual]));
  assert.ok(issues.some((i) => i.property === "construct" && i.landmark === "Nudged" && /a relative offset moves it 0, 3 px/.test(i.actual)), say);
  assert.ok(!issues.some((i) => i.landmark === "Centred" || i.landmark === "Gutter"), say);
  assert.ok(issues.some((i) => i.property === "overlap" && /^Label × svg$/.test(i.landmark)), say);
});

test("v25.1: named boxes take each piece once, refuse a box that swallows another's, and pair repeated texts by place", browser, () => {
  const row = (order) => `<main style="position:relative;width:420px;height:60px;font:14px/18px sans-serif;color:#111">
<div style="position:absolute;left:16px;top:12px;display:flex;gap:40px;flex-direction:${order}"><span>HDD</span><span>4 TB</span><span>HDD</span></div></main>`;
  let r = boxCase(row("row"), row("row-reverse"), 420);
  // The same texts in another DOM order, drawn by row-reverse: paired by place, not by the DOM's order.
  assert.ok(!r.frame.issues.some((i) => i.landmark === "HDD" && i.status === "fail"), r.stdout);
  const spec = path.join(r.dir, "spec.json"), s = JSON.parse(fs.readFileSync(spec, "utf8"));
  const twice = { ...s, landmarks: [...s.landmarks, { text: "4 TB", pieces: s.landmarks[1].pieces }] };
  fs.writeFileSync(spec, JSON.stringify(twice));
  assert.match(check(r.dir, "--frame", "frame").stdout, /piece \d+ is in landmark 2 .* and landmark 4/);
  const swallow = { ...s, landmarks: [{ text: "HDD", pieces: [...s.landmarks[0].pieces, ...s.landmarks[2].pieces] }, s.landmarks[1]] };
  fs.writeFileSync(spec, JSON.stringify(swallow));
  assert.match(check(r.dir, "--frame", "frame").stdout, /landmark 1 \(“HDD”\) takes in piece/);
});

test("v25.1: grey text on a dark card is its own piece, and a flex row in another font moves nothing of its own", browser, () => {
  const dark = `<main style="position:relative;width:320px;height:80px;background:#fff;font:14px/18px sans-serif"><div style="position:absolute;left:16px;top:16px;right:16px;height:48px;background:#1e1e2e;border-radius:8px"><span style="position:absolute;left:12px;top:15px;color:#adb5bd">без НДС</span></div></main>`;
  const r = boxCase(dark, dark, 320);
  assert.ok(r.spec.landmarks.some((l) => l.text === "без НДС"), JSON.stringify(r.spec.landmarks));
  assert.equal(r.frame.verdict, "pass", r.stdout);
  const flex = (family) => `<main style="position:relative;width:520px;height:60px;font:14px/18px ${family};color:#111">
<div style="position:absolute;left:16px;top:20px;display:flex;gap:20px;white-space:nowrap"><span>4 cores</span><span>64 GB RAM</span><span>2 × 1 TB NVMe</span><span>10 Gbit/s</span><span>Frankfurt</span></div></main>`;
  const font = boxCase(flex("DejaVu Sans"), flex("Liberation Sans"), 520);
  assert.deepEqual(font.frame.issues.filter((i) => i.status === "fail" && ["x", "y", "width"].includes(i.property)).map((i) => `${i.landmark} ${i.property} ${Math.round(i.delta ?? 0)}`), [], font.stdout);
});

// ------------------------------------------------------------------ draft 26: notes, gaps, what stays together, the window's edge

test("v26: a moderate offset is a note, also two of them the other way round; a piece past the band is the finding", browser, () => {
  let r = boxCase(CARD(), CARD({ col: 158 }), 420);
  assert.equal(r.frame.verdict, "pass", r.stdout);
  assert.ok(r.frame.notes?.some((n) => n.landmark === "32 ядер" && n.property === "x"), JSON.stringify(r.frame.notes));
  assert.match(r.stdout, /notes, the system's and not findings: \d+ offsets of 12 px or less, or drifts to 24 carried from the pieces before, at most \d+(\.\d+)? px/);
  // A proposal for it changes nothing: it needs no decision, and holds nothing pending.
  r = boxCase(CARD(), CARD({ col: 158 }), 420, { ledger: [{ frame: "frame", landmark: "32 ядер", property: "x", max: 12, category: "system", reason: "the kit's gap token", status: "proposed" }] });
  assert.equal(r.frame.verdict, "pass", r.stdout);
  // Each 8 px, the other way round: two notes, not a broken relation between them.
  r = boxCase(CARD(), CARD({ sku: 8, col: 158 }), 420);
  assert.equal(r.frame.verdict, "pass", r.stdout);
  // One piece past the band is the finding; the gap it changes is not a second one.
  r = boxCase(CARD(), CARD({ col: 166 }), 420);
  assert.ok(r.frame.issues.some((i) => i.property === "x" && !i.gap && i.landmark === "32 ядер" && i.status === "fail"), r.stdout);
  assert.ok(!r.frame.issues.some((i) => i.gap), r.stdout);
  // A right-aligned piece that grows keeps its right edge: the free space before it changes, no relation breaks.
  r = boxCase(CARD({ top: 12 }), CARD({ top: 12, price: "letter-spacing:2px" }), 420);
  assert.ok(!r.frame.issues.some((i) => i.gap), r.stdout);
  // Past the band, a system proposal leaves the finding pending, for the owner.
  r = boxCase(CARD(), CARD({ col: 170 }), 420, { ledger: [{ frame: "frame", landmark: "32 ядер", property: "x", category: "system", reason: "the kit's gap token", status: "proposed" }] });
  assert.equal(r.frame.verdict, "pending", r.stdout);
  // One above the other, a gap that closes up is a finding.
  const STACK = (a, b) => `<main style="position:relative;width:420px;height:120px;font:14px/18px sans-serif;color:#111"><div style="position:absolute;left:16px;top:${a}px">Title text</div><div style="position:absolute;left:16px;top:${b}px">Below text</div></main>`;
  r = boxCase(STACK(12, 40), STACK(20, 32), 420);
  assert.ok(r.frame.issues.some((i) => i.gap && i.property === "y" && /nearly touch/.test(i.actual)), r.stdout);
});

test("v26, draft 28: a value split from its period, “×” split from its numbers and a word broken between its letters are wraps; a number and its unit wrap with room", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (html) => {
    fs.writeFileSync(path.join(f.dir, "w.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px/18px sans-serif}main{padding:8px}</style><main>${html}</main>`);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 300, lines: LINES, stories: [{ name: "w", url: "w.html" }] } }));
    return check(f.dir).result.sweep.issues.filter((i) => i.story === "w" && i.property === "wrap").map((i) => i.actual);
  };
  const room = /wraps, though on one line it fits the component and runs into nothing/;
  assert.match(run('<div style="width:118px">1 234 567,00 ₽ / месяц</div>').join(), /a value split from its period: “₽ \/” \| “месяц”: white-space: nowrap on the amount and on the period \(a value and its unit\), an ordinary space between them, and no cap on their block; only a price wider than the component moves its period whole to the next line/);
  assert.match(run('<div style="width:30px;overflow-wrap:anywhere">потока</div>').join(), /a word broken between its letters: “потока”/);
  assert.match(run('<div style="width:40px">5587 × 4</div>').join(), /“×” split from its numbers/);
  assert.deepEqual(run('<div style="width:200px">1 234 567,00 ₽ / месяц</div>'), []);
  // What the unit list caught, a short text that wraps with room catches: no list of units to keep.
  for (const html of ['<div style="width:40px">12 345 ГБ</div>', '<div style="width:50px">12 345 ₽</div>', '<div style="width:40px">126,5 m²</div>',
    '<div style="width:96px">1 234 567,00 ₽ /&nbsp;месяц</div>']) assert.match(run(html).join(), room, html);
  // Prose of more than six words wraps where it wraps: a line may end on "5%", "Note:" or a list's "·".
  assert.deepEqual(run('<p style="width:90px;margin:0">Growth was 5% this year. Note: prices change.</p>'), []);
  assert.deepEqual(run('<p style="width:120px;margin:0">4 ядра · 16 ГБ · 512 ГБ</p>'), []);
  // Across elements and text nodes, as a component renders it: "{amount} ₽ / {period}".
  assert.match(run('<div style="width:118px"><span>1 234 567,00</span> <span>₽</span> <span>/</span> <span>месяц</span></div>').join(), /a value split from its period: “₽ \/” \| “месяц”/);
  assert.match(run('<div id="p" style="width:118px"></div><script>document.getElementById("p").append("1 234 567,00 ₽", " / ", "месяц")</script>').join(), /a value split from its period: “₽ \/” \| “месяц”/);
});

test("draft 28: a short text that wraps with room in the component is a wrap; one beside another text, or in a line clamp, is not", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (html) => {
    fs.writeFileSync(path.join(f.dir, "w.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px/18px sans-serif}main{padding:8px}</style><main>${html}</main>`);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 300, stories: [{ name: "w", url: "w.html" }] } }));
    return check(f.dir).result.sweep.issues.filter((i) => i.story === "w" && i.property === "wrap");
  };
  // A price of 155 px capped at 150, in a card of 284: it wraps, and on one line it fits.
  const capped = run('<div style="max-width:150px">12 345 678,00 ₽ / месяц</div>');
  assert.ok(capped.some((i) => i.kind === "wraps with room" && i.landmark === "12 345 678,00 ₽ / месяц" && i.status === "fail"
    && /keep it on one line: white-space: nowrap on the amount and on the period \(a value and its unit\), an ordinary space between them, and no cap on their block$/.test(i.actual)), JSON.stringify(capped));
  // A title of 130 px in a column of 90 beside another text: on one line it would run into its neighbour. Alone, it
  // wraps with room.
  const column = (next) => run(`<div style="display:grid;grid-template-columns:90px 1fr;gap:8px"><h3 style="margin:0;font-size:14px">Dedicated server pro</h3>${next}</div>`);
  assert.deepEqual(column('<p style="margin:0">Frankfurt, a ten gigabit uplink and backups every night</p>'), []);
  assert.ok(column("").some((i) => i.kind === "wraps with room"));
  // A line clamp is a choice, not a wrap.
  const clamp = "display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden";
  assert.deepEqual(run(`<p title="Dedicated server with NVMe" style="width:120px;margin:0;${clamp}">Dedicated server with NVMe</p>`), []);
  assert.ok(run('<p style="width:120px;margin:0">Dedicated server with NVMe</p>').some((i) => i.kind === "wraps with room"));
});

test("v26: a popover that opens above without flipping is cut at the window's top edge; one that flips holds", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const page = (flip) => `<button id="t" style="margin-top:100px;width:40px;height:20px">?</button><div id="pop" hidden style="position:absolute;left:0;width:120px;height:40px;background:#eee">Help</div>
<script>const t = document.getElementById("t"), pop = document.getElementById("pop");
t.onmouseenter = () => { pop.hidden = false; const r = t.getBoundingClientRect(); const above = ${flip ? "r.top > 50" : "true"};
  pop.style.top = (scrollY + (above ? r.top - 44 : r.bottom + 4)) + "px"; };
t.onmouseleave = () => { pop.hidden = true; };</script>`;
  const run = (flip) => {
    fs.writeFileSync(f.page, fs.readFileSync(f.page, "utf8").replace(/<button id="t"[\s\S]*$/, "") + page(flip));
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "help opens", steps: [{ hover: "#t" }, { visible: "#pop" }, { move: [290, 890] }, { hidden: "#pop" }] }] }));
    return check(f.dir).result.journeys;
  };
  const stuck = run(false);
  assert.ok(stuck.some((j) => /top edge/.test(j.name) && !j.pass && /outside the window.*flip or shift it/.test(j.failed)), JSON.stringify(stuck));
  const flips = run(true);
  assert.ok(flips.every((j) => j.pass), JSON.stringify(flips));
});

test("v26: --quick sweeps every story at the frames' widths only, and is a partial check", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 240, to: 400, step: 8, lines: LINES, stories: [{ name: "dense", url: "page.html?dense" }] } }));
  const r = check(f.dir, "--quick");
  assert.match(r.stdout, /partial check/i);
  assert.ok(!fs.existsSync(path.join(f.dir, "out/handoff.md")), "a partial check writes no evidence file");
  assert.equal(r.result.journeys.length, 0);
  // Quick rounds score in their own series: a complete check after them starts a series of its own.
  // Draft 28.3: the first finding is matched by its key whatever the series, so the same "Ready" first in quick
  // rounds says so on the quick round, and the complete check after them says stop.
  f.write("<main><span style=\"margin-left:30px\">Ready</span></main>");
  check(f.dir, "--quick");
  check(f.dir, "--quick");
  const q = check(f.dir, "--quick");
  assert.match(q.stdout, /^Verdict: fail — the first finding is unchanged for \d+ rounds: fix it or propose it on what this partial check measured$/m);
  assert.doesNotMatch(q.stdout, /stop re-running|check again/);
  const after = check(f.dir);
  assert.match(after.stdout, /scores start a new series here/);
  assert.match(after.stdout, /^Verdict: fail — stop re-running/m);
});

test("v26: an acceptance row that names its story answers for that story, and says what failed", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(path.join(f.dir, "split.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px/18px sans-serif}main{padding:8px}</style><main><div style="width:118px">1 234 567,00 ₽ / месяц</div></main>`);
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { ...cfg.sweep, stories: [...cfg.sweep.stories, { name: "split", url: "split.html" }] } }));
  fs.writeFileSync(path.join(f.dir, "review.md"), `${MODEL}## Acceptance\n\n| Item | Checked by | Result |\n|---|---|---|\n| frame | check | pass — captured |\n| \`dense\` keeps every line | sweep.stories | pass — clean |\n| \`split\` keeps the price whole | sweep.stories | pass — clean |\n`);
  const rows = check(f.dir).result.acceptance;
  assert.equal(rows.find((r) => /dense/.test(r.item)).status, "pass", JSON.stringify(rows));
  const split = rows.find((r) => /split/.test(r.item));
  assert.equal(split.status, "fail");
  assert.match(split.reason, /the sweep fails: wrap “.*” \(split\) at \d+/);
});

// ------------------------------------------------------------------ draft 26.1: the critic's and verifier's cases

test("v26.1: with no room, prose, dates, breadcrumbs and Chinese labels wrap freely; a word with its comma is still a word; a price wider than the component moves its period whole", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (html, main = "padding:8px") => {
    fs.writeFileSync(path.join(f.dir, "w.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px/18px sans-serif}main{${main}}</style><main>${html}</main>`);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 300, lines: LINES, stories: [{ name: "w", url: "w.html" }] } }));
    return check(f.dir).result.sweep;
  };
  const wraps = (sweep) => sweep.issues.filter((i) => i.story === "w" && i.property === "wrap").map((i) => i.actual);
  // A component of 80 px cannot hold them on one line.
  for (const html of ["<p style=\"margin:0\">Founded in 2020 and growing</p>", "<p style=\"margin:0\">On November 21, 2026</p>",
    "<p style=\"margin:0\">Home / Servers / Dedicated</p>", '<div lang="ja">専用サーバー構成管理画面</div>']) assert.deepEqual(wraps(run(html, "padding:8px;width:80px")), [], html);
  assert.match(wraps(run('<div style="width:60px;overflow-wrap:anywhere">Serverkonfiguration,</div>')).join(), /a word broken between its letters: “Serverkonfiguration”/);
  assert.deepEqual(wraps(run('<div style="font-size:24px;line-height:30px">1&nbsp;234&nbsp;567&nbsp;890,00&nbsp;₽ /&nbsp;месяц</div>')), []);
  assert.deepEqual(wraps(run('<div style="width:300px">1 234 ₽ / месяц</div>')), []);
});

test("v26.1: a gap the design sets that closes up is a finding, though the edges hold", browser, () => {
  const r = boxCase(CARD(), CARD().replace('font-weight:600">BA-i201-B', 'font-weight:600;letter-spacing:8.5px">BA-i201-B'), 420);
  assert.ok(r.frame.issues.some((i) => i.gap && /nearly touch/.test(i.actual)), r.stdout);
});

test("v26.1: an overlay cut by a box that scrolls fails; one in a sticky bar is not tried at the edges, and says so", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (html, steps) => {
    fs.writeFileSync(f.page, fs.readFileSync(f.page, "utf8").replace(/<div id="wrap"[\s\S]*$/, "") + `<div id="wrap">${html}</div>`);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "help opens", steps }] }));
    return check(f.dir).result.journeys;
  };
  const steps = [{ hover: "#t" }, { visible: "#pop span" }, { move: [290, 890] }, { hidden: "#pop" }];
  const script = `<script>const t = document.getElementById("t"), pop = document.getElementById("pop"); t.onmouseenter = () => { pop.hidden = false; }; t.onmouseleave = () => { pop.hidden = true; };</script>`;
  const clipped = run(`<div style="position:relative;height:120px;overflow:auto;margin-top:200px"><button id="t" style="margin-top:10px">?</button><div id="pop" hidden style="position:absolute;top:-60px;left:0;width:120px;height:50px;background:#eee"><span>Help</span></div><div style="height:400px"></div></div>${script}`, steps);
  assert.ok(clipped.some((j) => !/edge/.test(j.name) && !j.pass && /a box that clips it/.test(j.failed)), JSON.stringify(clipped));
  const sticky = run(`<div style="position:sticky;top:0;background:#fff"><button id="t">?</button><div id="pop" hidden style="position:absolute;top:24px;left:0;width:120px;height:50px;background:#eee"><span>Help</span></div></div><div style="height:2000px"></div>${script}`, steps);
  assert.ok(!sticky.some((j) => /edge/.test(j.name)), JSON.stringify(sticky));
  assert.ok(sticky.some((j) => j.notes?.some((n) => /not tried .* fixed or sticky bar/.test(n))), JSON.stringify(sticky));
});

test("v26.1: --quick with no frame inside the sweep still measures, and a row naming no configured story is incomplete", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { ...cfg.sweep, from: 320, to: 400 } }));
  const quick = check(f.dir, "--quick");
  assert.notEqual(quick.status, 2, quick.stdout + quick.stderr);
  assert.match(quick.stdout, /journeys: not run \(--quick\)/);
  fs.writeFileSync(f.config, JSON.stringify(cfg));
  fs.writeFileSync(path.join(f.dir, "review.md"), `${MODEL}## Acceptance\n\n| Item | Checked by | Result |\n|---|---|---|\n| frame | check | pass — captured |\n| \`dnese\` keeps every line | sweep.stories | pass — clean |\n`);
  const row = check(f.dir).result.acceptance.find((r) => /dnese/.test(r.item));
  assert.equal(row.status, "incomplete");
  assert.match(row.reason, /names no configured story \(`dnese`\); the stories are `dense`/);
});

// ------------------------------------------------------------------ draft 27: what iteration 3's run and review showed

test("v27: the evidence lists what each story tested", browser, () => {
  const f = smallFrame();
  check(f.dir);
  assert.match(fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8"), /- story dense: .*; its longest texts: “Ready”/);
});

// ------------------------------------------------------------------ draft 28: two tiers, the type's size, generated conditions

// Six texts at fixed places, so that only the type's size or family changes between the design and the page.
const TYPE = (size, family = "sans-serif") => `<main style="position:relative;width:420px;height:120px;font:${size}px/20px ${family};color:#111">
<div style="position:absolute;left:16px;top:12px">Server BA-i201</div><div style="position:absolute;left:220px;top:12px">32 cores</div>
<div style="position:absolute;left:16px;top:48px">128 GB RAM</div><div style="position:absolute;left:220px;top:48px">2 × 838 SSD</div>
<div style="position:absolute;left:16px;top:84px">Frankfurt</div><div style="position:absolute;left:220px;top:84px">1 234 € / month</div></main>`;

test("draft 28: a screenshot's type set at 13 px where 15 is drawn is a type finding; another font of the same size is not", browser, () => {
  let r = boxCase(TYPE(15), TYPE(13), 420);
  const type = r.frame.issues.find((i) => i.property === "type");
  assert.ok(type?.status === "fail" && /% smaller than drawn, by the ink heights of 6 texts/.test(type.actual), r.stdout);
  assert.ok(r.frame.type.ratio < 0.9, JSON.stringify(r.frame.type));
  r = boxCase(TYPE(15, "DejaVu Sans"), TYPE(15, "Liberation Sans"), 420);
  assert.ok(!r.frame.issues.some((i) => i.property === "type"), r.stdout);
  assert.ok(Math.abs(r.frame.type.ratio - 1) < 0.1, JSON.stringify(r.frame.type));
});

test("draft 28: the generated conditions find an overlap only longer texts cause and a fixed height only doubled entries overflow; a layout that grows passes them", browser, () => {
  // 20 px monospace is 12 px a letter: "Ready" ends at 60 and "Go" starts at 84; two fifths longer, "Ready Re" ends at 96.
  // What they find is a candidate: it leaves the check incomplete until answered, and fails nothing (draft 28.2).
  let r = check(smallFrame('<span style="position:absolute;left:0;top:0">Ready</span><span style="position:absolute;left:84px;top:0">Go</span>').dir);
  assert.equal(r.status, 2, r.stdout);
  assert.deepEqual(r.result.frames[0].issues, [], "the frame as drawn is clean");
  const overlaps = r.result.sweep.issues.filter((i) => i.property === "overlap");
  assert.deepEqual(overlaps.map((i) => [i.story, i.status]), [["the frames' page, texts stretched", "candidate"]], JSON.stringify(r.result.sweep.issues));
  assert.match(r.stdout, /unanswered: overlap “Ready Re × Go G” \(the frames' page, texts stretched, 300\)/);
  // Two entries fit a fixed height; doubled, they are cut. Only the entries are doubled: the total placed beside them
  // is not, or its copy would lie on it.
  const list = (css) => `<div style="${css}"><div class="entry">One</div><div class="entry">Two</div><b style="position:absolute;right:0;top:0">Total</b></div>`;
  r = check(smallFrame(list("height:56px;overflow:hidden")).dir);
  assert.equal(r.status, 2, r.stdout);
  assert.ok(r.result.sweep.issues.length && r.result.sweep.issues.every((i) => i.property === "clipped" && i.story === "the frames' page, entries doubled" && i.status === "candidate"), JSON.stringify(r.result.sweep.issues));
  // The same list in a root that grows passes every condition.
  r = check(smallFrame(`<style>main{height:auto;min-height:80px}</style>${list("")}`).dir);
  assert.equal(r.status, 0, r.stdout);
  assert.deepEqual(r.result.sweep.issues, []);
  assert.deepEqual(r.result.sweep.stories.filter((st) => st.generated).map((st) => st.name), ["the frames' page, texts stretched", "the frames' page, entries doubled", "the component's own width"]);
});

test("draft 28: a block as narrow as its longest word and a row of chips wrap as drawn; a block of a width of its own and a chip's own text wrap with room", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (html) => {
    fs.writeFileSync(path.join(f.dir, "w.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px/18px sans-serif}main{padding:8px}.chip{padding:0 4px;background:#eee}</style><main>${html}</main>`);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 300, stories: [{ name: "w", url: "w.html" }] } }));
    return check(f.dir).result.sweep.issues.filter((i) => i.story === "w" && i.property === "wrap");
  };
  const room = (issues, text) => issues.some((i) => i.kind === "wraps with room" && i.landmark === text && i.status === "fail");
  // "DDR3" over "ECC": the block narrowed to its longest word (width: min-content), alone or under its size, as the
  // control card draws it. Narrowed to a width of its own instead, wider or narrower than its longest word, it wraps
  // with room.
  const ram = (width) => `<div style="width:${width}"><span style="white-space:nowrap">256 ГБ</span> <span style="display:block">DDR3 ECC</span></div>`;
  assert.deepEqual(run('<div style="width:min-content">DDR3 ECC</div>'), []);
  assert.deepEqual(run(ram("min-content")), []);
  for (const html of ['<div style="width:56px">DDR3 ECC</div>', '<div style="width:30px">DDR3 ECC</div>', ram("60px")]) {
    const issues = run(html);
    assert.ok(room(issues, "DDR3 ECC"), `${html}: ${JSON.stringify(issues)}`);
  }
  // Badges wrap onto rows: the items of a flex row are held one by one (draft 28.2), with their boxes or without, and a
  // chip's own text still wraps with room.
  const row = (chip, third = `<span class="${chip}">IPMI</span>`) => `<div style="display:flex;flex-wrap:wrap;gap:4px;width:100px"><span class="${chip}">New</span><span class="${chip}">Hot swap</span>${third}</div>`;
  assert.deepEqual(run(row("chip")), []);
  assert.deepEqual(run(row("")), []);
  let issues = run(row("chip", '<span class="chip" style="max-width:80px">Hot swap bays</span>'));
  assert.ok(room(issues, "Hot swap bays") && !room(issues, "New Hot swap Hot swap bays"), JSON.stringify(issues));
});

test("draft 28: a layout a script picks from its content chooses again when the texts are stretched; one that does not adapt still runs out", browser, () => {
  // 20 px monospace is 12 px a letter: "Ready", "Steady" and "Going" take 216 px of the row's 300; two fifths longer,
  // 336. The script stacks them when the row overflows, on a resize, as a card that picks its layout from its content.
  const run = (adapts) => {
    const f = smallFrame();
    f.write(`<div id="host"><main style="width:auto"><div id="row" style="display:flex;column-gap:12px"><span style="flex:none">Ready</span><span style="flex:none">Steady</span><span style="flex:none">Going</span></div></main></div>
${adapts ? `<script>const row = document.getElementById("row");
const lay = () => { row.style.flexDirection = "row"; if (row.scrollWidth > row.clientWidth + 1) row.style.flexDirection = "column"; };
new ResizeObserver(lay).observe(row); lay();</script>` : ""}`);
    const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, host: "#host" }));
    const snap = cli("snapshot", f.config, "--images", "--force");
    assert.equal(snap.status, 0, snap.stderr);
    return check(f.dir).result.sweep.issues;
  };
  const adapts = run(true);
  assert.deepEqual(adapts.filter((i) => ["fail", "candidate"].includes(i.status)), [], JSON.stringify(adapts));
  const fixed = run(false);
  assert.ok(fixed.some((i) => i.property === "outside" && i.story === "the frames' page, texts stretched" && i.status === "candidate"), JSON.stringify(fixed));
});

// ------------------------------------------------------------------ draft 28.2, measurement: the critic's and the review's cases

// Three 10 px pieces in a row, as the design draws them and as the page puts them.
const row3 = (to, source) => compareFrame({ frame: "f",
  spec: { frame: { width: 100, height: 20 }, ...(source ? { source } : {}), landmarks: ["a", "b", "c"].map((text, i) => ({ text, box: box([0, 30, 48][i], 0, 10, 20) })) },
  measured: { root: { width: 100, height: 20 }, landmarks: to.map((x) => ({ found: true, box: box(x, 0, 10, 20), align: "left" })) } });

test("draft 28.2: a gap that closes up is a finding though each offset alone is a drift; a gap kept while everything moves is not", () => {
  // x 0, 30, 48 move to 10, 49, 60: each step is within the band, but the 8 px gap before "c" closes to 1.
  for (const source of [undefined, "image boxes", "page snapshot"]) {
    const collapsed = row3([10, 49, 60], source);
    assert.equal(collapsed.verdict, "fail", `${source}: ${JSON.stringify(collapsed.issues)}`);
    assert.ok(collapsed.issues.some((i) => i.gap && i.landmark === "c" && i.status === "fail" && /nearly touch/.test(i.actual)), JSON.stringify(collapsed.issues));
    const kept = row3([10, 40, 58], source);
    assert.equal(kept.verdict, "pass", `${source}: ${JSON.stringify(kept.issues)}`);
  }
});

// The card bench's 764 frame as the check measured it: each landmark's box in the design, then on the page of the
// control, of the column shift (a 30 px margin before the RAM column moves the four columns before it 15 px left,
// between the processor and the RAM) and of its clean twin (the row's padding moved 10 px right, every piece with it).
const CARD_764 = [
  ["BA-i201-B", [17, 16, 53, 9], [17, 16, 57, 9], [17, 16, 57, 9], [27, 16, 57, 9]],
  ["EPYC 9374F", [159, 16, 74, 10], [157, 17, 85, 10], [157, 17, 85, 10], [167, 17, 85, 10]],
  ["3.33", [277, 16, 26, 10], [275, 17, 27, 10], [261, 17, 27, 10], [285, 17, 27, 10]],
  ["16", [321, 16, 14, 10], [320, 17, 15, 10], [306, 17, 15, 10], [330, 17, 15, 10]],
  ["×2", [352, 15, 13, 10], [355, 17, 12, 9], [341, 17, 12, 9], [365, 17, 12, 9]],
  ["32 ядер", [388, 16, 48, 13], [387, 17, 53, 13], [373, 17, 53, 13], [397, 17, 53, 13]],
  ["64 потока", [387, 38, 62, 10], [387, 38, 66, 10], [373, 38, 66, 10], [397, 38, 66, 10]],
  ["256 ГБ", [474, 16, 42, 10], [470, 17, 46, 10], [470, 17, 46, 10], [480, 17, 46, 10]],
  ["DDR3", [475, 38, 35, 10], [471, 38, 39, 10], [471, 38, 39, 10], [481, 38, 39, 10]],
  ["ECC", [475, 56, 25, 10], [471, 56, 30, 10], [471, 56, 30, 10], [481, 56, 30, 10]],
  ["2 × 838", [542, 16, 46, 10], [542, 17, 48, 10], [542, 17, 48, 10], [552, 17, 48, 10]],
  ["SSD", [602, 16, 25, 10], [597, 16, 29, 11], [597, 16, 29, 11], [607, 16, 29, 11]],
  ["125 898,00 ₽", [663, 16, 82, 12], [648, 15, 99, 15], [648, 15, 99, 15], [658, 15, 99, 15]],
  ["High performance", [23, 41, 96, 11], [23, 41, 101, 11], [23, 41, 101, 11], [33, 41, 101, 11]],
  ["MC-LAG 25/25", [33, 88, 78, 12], [31, 91, 85, 9], [31, 91, 85, 9], [41, 91, 85, 9]],
  ["2+ PSU", [137, 88, 37, 12], [141, 91, 44, 9], [141, 91, 44, 9], [151, 91, 44, 9]],
  ["Доступно 1", [671, 88, 72, 13], [670, 91, 77, 13], [670, 91, 77, 13], [680, 91, 77, 13]],
];
const card764 = (page) => compareFrame({ frame: "card-764", tolerance: 4,
  ledger: [{ landmark: "125 898,00 ₽", property: "type", status: "proposed", category: "system", reason: "the kit's class for the price" }],
  spec: { frame: { width: 764, height: 114 }, source: "image boxes",
    landmarks: CARD_764.map(([text, b]) => ({ text, box: box(...b), ...(/MC-LAG|PSU/.test(text) ? { joined: true } : {}) })) },
  measured: { root: { width: 764, height: 118 }, landmarks: CARD_764.map((row) => ({ found: true, box: box(...row[page]), align: "left" })) } });

test("doc 44, item 6: columns moved together are read from their own edge, against the column they moved away from; a common shift is not a step", () => {
  const offsets = (r) => r.issues.filter((i) => ["x", "y"].includes(i.property) && i.status === "fail").map((i) => `${i.landmark} ${i.property} ${Math.round(i.delta)}`);
  const control = card764(2), shifted = card764(3), common = card764(4);
  assert.equal(control.verdict, "pending", JSON.stringify(control.issues));
  // The frequency is 16 px off from the root's left and 15 from its right. Read from the right on that pixel, the four
  // columns drifted with the page's wider texts, as notes; from its own left edge, it moved 14 px from the processor.
  assert.equal(shifted.verdict, "fail", JSON.stringify(shifted.notes));
  assert.deepEqual(offsets(shifted), ["3.33 x -16"]);
  assert.ok(shifted.causes.some((c) => c.axis === "x" && c.before === "3.33" && c.after === "EPYC 9374F" && Math.round(c.step) === -14), JSON.stringify(shifted.causes));
  // Every piece 10 px to the right keeps each relation between them: notes, and the verdict the control has.
  assert.equal(common.verdict, "pending", JSON.stringify(common.issues));
  assert.deepEqual(offsets(common), []);
  assert.ok(common.notes.some((n) => n.landmark === "2+ PSU" && n.property === "x" && n.delta === 14), JSON.stringify(common.notes));
});

// Six texts of a screenshot's spec, each with its ink height in the design and the page.
const inked = (heights, joined = []) => {
  const texts = ["Server", "32 cores", "128 GB", "2 × 838", "Frankfurt", "1 234 € / month"];
  const spec = { frame: { width: 420, height: 120 }, source: "image boxes",
    landmarks: texts.map((text, i) => ({ text, box: box(16, 12 + i * 16, 60, 10), ...(joined.includes(text) ? { joined: true } : {}) })) };
  const measured = { root: { width: 420, height: 120 }, landmarks: texts.map((text, i) => ({ found: true, box: box(16, 12 + i * 16, 60, heights[text] ?? 10), align: "left" })) };
  return compareFrame({ frame: "f", spec, measured });
};

test("draft 28.2: one text a fifth or more off its drawn ink height is a type finding, beside the frame's mean; a box joined to an icon is not", () => {
  const price = inked({ "1 234 € / month": 12.5 });
  assert.ok(price.type && Math.abs(price.type.ratio - 1) < 0.1, "the frame's mean holds");
  const type = price.issues.filter((i) => i.property === "type");
  assert.deepEqual(type.map((i) => [i.landmark, i.status, i.delta]), [["1 234 € / month", "fail", 25]], JSON.stringify(price.issues));
  assert.match(type[0].actual, /^25 % larger than drawn, by its ink height: a size of another class; set the size the frame draws, or, if this is the kit's class for the role, propose it$/);
  assert.deepEqual(inked({ "1 234 € / month": 11.5 }).issues.filter((i) => i.property === "type"), [], "15 % is another font's");
  assert.deepEqual(inked({ Frankfurt: 7.5 }, ["Frankfurt"]).issues.filter((i) => i.property === "type"), [], "a box given with an icon in it");
  // The frame's own finding names no token to propose.
  const small = inked(Object.fromEntries(["Server", "32 cores", "128 GB", "2 × 838", "Frankfurt", "1 234 € / month"].map((t) => [t, 8.5])));
  assert.ok(small.issues.some((i) => i.landmark === "the type" && /smaller than drawn/.test(i.actual) && !/token|propose/.test(i.actual)), JSON.stringify(small.issues));
});

// Draft 28.3: texts of a screenshot's spec with their drawn width and ink height, and the page's, in a font 8 % wider
// throughout. The price is c282c's at 486, which the blind review returned as set about 2 px smaller than drawn: ink
// 15 → 14 px, 154 → 146 px wide, where the font alone would make it 166.
const sized = (page) => {
  const drawn = { Server: [74, 10], "32 cores": [62, 10], "128 GB": [53, 9], "2 × 838": [46, 10], "×2": [13, 10], Frankfurt: [72, 13], "125 898,00 ₽ / месяц": [154, 15] };
  const texts = Object.keys(drawn);
  const spec = { frame: { width: 486, height: 228 }, source: "image boxes", landmarks: texts.map((text, i) => ({ text, box: box(16, 12 + i * 24, ...drawn[text]) })) };
  const measured = { root: { width: 486, height: 228 }, landmarks: texts.map((text, i) => {
    const [w, h] = page[text] ?? [drawn[text][0] * 1.08, drawn[text][1]];
    return { found: true, box: box(16, 12 + i * 24, w, h), align: "left" };
  }) };
  return compareFrame({ frame: "card-486", spec, measured }).issues.filter((i) => i.property === "type");
};

test("draft 28.3: one text a size off by its width against the frame's font, with its ink the same way, is a type finding", () => {
  const price = sized({ "125 898,00 ₽ / месяц": [146, 14] });
  assert.deepEqual(price.map((i) => [i.landmark, i.status, i.delta]), [["125 898,00 ₽ / месяц", "fail", -12]], JSON.stringify(price));
  assert.match(price[0].actual, /^12 % smaller than drawn, by its width against the frame's font and its ink height \(15 → 14 px\)/);
  assert.deepEqual(sized({ "125 898,00 ₽ / месяц": [182, 16] }), [], "9 % wider and taller: under the bar");
  assert.deepEqual(sized({ "125 898,00 ₽ / месяц": [186, 16] }).map((i) => i.delta), [12], "12 % wider and taller");
  // Not another size: narrower with the same ink (a narrower face, a letter-spacing); narrower but taller; a short
  // text whose few pixels of width are a tenth of it ("×2", 10 → 9 px of ink, 2 px narrower).
  assert.deepEqual(sized({ "125 898,00 ₽ / месяц": [146, 15] }), [], "the same ink height");
  assert.deepEqual(sized({ "125 898,00 ₽ / месяц": [146, 16] }), [], "narrower but taller");
  assert.deepEqual(sized({ "×2": [12, 9] }), [], "a short text");
  // A stand-in wordmark: the page sets "Server" in the kit's font where the frame draws a logo, 32 % narrower than the
  // font explains while its ink is a pixel lower: not a size the frame draws, and not the page's to match.
  assert.deepEqual(sized({ Server: [74 * 1.08 * 0.68, 9] }), [], "a wordmark");
});

test("draft 28.2: a spec with no font sizes says the type's size was not compared; the design context gives them by node id", () => {
  const spec = specFromMetadata(RELATIVE);
  const measuredHere = { root: { width: 280, height: 200 }, landmarks: spec.landmarks.map((l) => ({ found: true, box: l.box, align: "left", font: { size: 14 } })) };
  const r = compareFrame({ frame: "card", spec, measured: measuredHere });
  assert.equal(r.typeUnchecked, true);
  assert.match(renderSummary({ frames: [r] }), /type sizes not compared: the spec gives no font sizes/);
  assert.match(renderHandoff({ frames: [r], status: "pass" }), /^- type sizes in card: the spec gives no font sizes$/m);
  assert.equal(compareFrame({ frame: "card", spec: specFromRest(REST), measured: { root: { width: 280, height: 200 }, landmarks: [] } }).typeUnchecked, undefined);
  // Figma's code: the size on the layer, the line height on its paragraph; or both on one element; or the size inherited.
  const code = `<div data-node-id="1:1" className="text-[16px]">
  <div className="font-['Inter'] leading-[0] text-[#1f2329] text-[13px]" data-node-id="1:2"><p className="leading-[18px]">SKU & code</p></div>
  <p className="text-[22px] leading-[28px] font-bold" data-node-id="1:6">1 499 €</p>
  <p data-node-id="1:8">New</p>
</div>`;
  const fonts = new Map();
  contextTexts(code, fonts);
  assert.deepEqual(Object.fromEntries(fonts), { "1:2": { size: 13, lineHeight: 18 }, "1:6": { size: 22, lineHeight: 28 }, "1:8": { size: 16 }, "1:1": { size: 16, lineHeight: 18 } });
  const joined = joinContext(spec, code).spec;
  assert.deepEqual(joined.landmarks.map((l) => [l.text, l.font]), [["SKU & code", { size: 13, lineHeight: 18 }], ["New", undefined], ["1 499 €", { size: 22, lineHeight: 28 }], ["New", { size: 16 }]]);
  assert.equal(compareFrame({ frame: "card", spec: joined, measured: measuredHere }).typeUnchecked, undefined);
});

test("draft 28.2: a ledger entry's category is optional, and checked when given", () => {
  assert.deepEqual(ledgerFaults([{ landmark: "New", property: "y", status: "proposed", reason: "the frame's spacing is off the scale" }]), []);
  assert.match(ledgerFaults([{ landmark: "New", property: "y", category: "taste", status: "proposed", reason: "x" }]).join(), /category, when given, is one of/);
});

test("draft 28.2: a generated condition's collision is a candidate: no finding, no score, shown in the console and the evidence until answered", () => {
  const sweep = { from: 300, to: 300, step: 8, pass: true, switches: [], stories: [], score: 0, generate: true, issues: [
    { landmark: "Ready Re × Go G", property: "overlap", status: "candidate", story: "the frames' page, texts stretched", ranges: "300", actual: "12 × 24 px" },
    { landmark: "One", property: "clipped", status: "candidate", story: "the frames' page, entries doubled", ranges: "300", actual: "24 px cut off vertically", answer: "two entries at most (the contract)" },
  ] };
  const summary = renderSummary({ frames: [], sweep });
  assert.match(summary, /1 candidate from the generated conditions, unanswered: overlap “Ready Re × Go G” \(the frames' page, texts stretched, 300\)/);
  const handoff = renderHandoff({ frames: [], sweep, status: "incomplete" });
  assert.match(handoff, /^- unanswered: Ready Re × Go G \(the frames' page, texts stretched\) overlap: 12 × 24 px at 300$/m);
  assert.match(handoff, /^- answered: One .* — two entries at most \(the contract\)$/m);
  assert.doesNotMatch(renderHandoff({ frames: [], sweep: { ...sweep, issues: [], generate: false }, status: "pass" }), /fragile/);
  assert.match(renderHandoff({ frames: [], sweep: { ...sweep, issues: [], generate: false }, status: "pass" }), /^- the generated conditions \(sweep\.generate is false\)/m);
});

test("a passing journey's handoff names the gap in transition coverage", () => {
  const handoff = renderHandoff({ status: "pass", journeys: [{ name: "sheet closes", pass: true }] });
  const limits = handoff.slice(handoff.indexOf("## Not checked by the script"));
  assert.match(limits, /^- visual continuity during transitions, including brief flashes between sampled states$/m);
});

test("draft 28.2: a finding the check itself causes is proposed with cause checker, a journey too, and the evidence lists it as disputed with the check", () => {
  const entry = { landmark: "the sheet", property: "journey", cause: "checker", status: "proposed", reason: "the check's own style keeps the sheet from closing: review.md, Checker reproduction" };
  assert.deepEqual(ledgerFaults([entry]), []);
  assert.match(ledgerFaults([{ ...entry, cause: "font" }]).join(), /"cause", when given, is "checker"/);
  assert.match(ledgerFaults([{ ...entry, cause: undefined }]).join(), /a journey entry disputes a journey the check itself breaks/);
  const handoff = renderHandoff({ frames: [], journeys: [{ name: "the sheet", pass: false, failed: "step 4", status: "pending", entries: [0] }], ledger: [entry], status: "pending" });
  assert.match(handoff, /^## Disputed with the check$/m);
  assert.match(handoff, /^- proposed: the sheet journey — the check's own style .* \(matches the sheet\)$/m);
  assert.match(handoff, /^- the sheet: disputed with the check \(pending\), fails at step 4$/m);
  assert.match(handoff, /^- proposed: the sheet journey — .* \(awaits your decision on 1\)$/m);
});

// A story page of its own in a small frame's pack, swept at 300 px: what "wraps with room" says of it.
function roomCase() {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  return (html, main = "padding:8px") => {
    fs.writeFileSync(path.join(f.dir, "w.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px/18px sans-serif}main{${main}}</style><main>${html}</main>`);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { from: 300, to: 300, generate: false, stories: [{ name: "w", url: "w.html" }] } }));
    return check(f.dir).result.sweep.issues.filter((i) => i.story === "w" && i.kind === "wraps with room");
  };
}
const capped = (cap) => `<div style="max-width:${cap}px"><span style="white-space:nowrap">12 345 ₽</span> <span style="white-space:nowrap">/ месяц</span></div>`;

test("draft 28.2: wraps with room holds each flex item on its own, counts a group of digits as one word, and reads a line whose context is the root", browser, () => {
  const run = roomCase();
  const says = (issues, text) => issues.some((i) => i.landmark === text && i.status === "fail");
  // A title and a price capped at 90 px, flex items of one row: the price on its own wraps with room.
  let issues = run(`<div style="display:flex;gap:8px;align-items:baseline"><div style="flex:1;min-width:0">Server BA-i201</div>${capped(90)}</div>`);
  assert.ok(says(issues, "12 345 ₽ / месяц"), JSON.stringify(issues));
  // "1 234 567 890,00 ₽ / месяц" is four words, not seven.
  issues = run('<div style="display:grid;grid-template-columns:1fr auto;gap:8px"><div>Server</div><div style="max-width:150px"><span style="white-space:nowrap">1 234 567 890,00 ₽</span> <span style="white-space:nowrap">/ месяц</span></div></div>');
  assert.ok(says(issues, "1 234 567 890,00 ₽ / месяц"), JSON.stringify(issues));
  // The root itself a flex row of a title and a capped price; a capped inline block straight in the root.
  issues = run(`<b>Server</b><span style="max-width:90px">12 345 ₽ / месяц</span>`, "padding:8px;display:flex;gap:8px");
  assert.ok(says(issues, "12 345 ₽ / месяц"), JSON.stringify(issues));
  issues = run('<span style="display:inline-block;max-width:90px">12 345 ₽ / месяц</span>');
  assert.ok(says(issues, "12 345 ₽ / месяц"), JSON.stringify(issues));
});

test("draft 28.2: wraps with room needs the text on one line once lifted, inside the content box, clear of icons and controls", browser, () => {
  const run = roomCase();
  // A line break, and an item a flex row puts on its own row, stay where they are drawn.
  assert.deepEqual(run('<div><span style="font-weight:700">1 499 €</span><br><span>In stock</span></div>'), []);
  assert.deepEqual(run('<div style="display:flex;flex-wrap:wrap;column-gap:8px;align-items:baseline"><span style="font-weight:700">1 499 €</span><span style="flex-basis:100%">In stock: 12</span></div>'), []);
  // A title beside its icon: on one line it pushes the icon out of a card of 200 px.
  assert.deepEqual(run('<div style="display:grid;grid-template-columns:1fr 24px;gap:8px;align-items:start"><h3 style="margin:0;font-size:16px">Dedicated server BA-i201</h3><svg width="24" height="24"><circle cx="12" cy="12" r="10"/></svg></div>', "padding:8px;width:200px;box-sizing:border-box"), []);
  // 182 px of title in a card of 196 with 8 px of padding: inside the border, past the content box.
  assert.deepEqual(run('<h3 style="margin:0;font-size:16px;max-width:150px">Dedicated server BA-i201</h3>', "padding:8px;width:196px;box-sizing:border-box"), []);
  // On one line it would run under an icon placed beside it, or push a button out of the card.
  assert.deepEqual(run('<div style="position:relative"><div style="max-width:100px">Dedicated server BA-i201</div><svg style="position:absolute;left:140px;top:0" width="20" height="18"><rect width="20" height="18"/></svg></div>'), []);
  assert.deepEqual(run('<div style="display:grid;grid-template-columns:minmax(0,max-content) auto;gap:8px"><div style="max-width:120px">Dedicated server with eight drives</div><button style="white-space:nowrap">Order now</button></div>'), []);
  // With nothing in the way, the same title wraps with room.
  assert.ok(run('<div style="max-width:100px">Dedicated server BA-i201</div>').some((i) => i.landmark === "Dedicated server BA-i201"));
});

test("a width journey keeps the natural motion preference, animation clock and end event", browser, () => {
  const f = smallFrame(`<style>aside{position:fixed;top:0;left:0;width:2px;height:2px}
@media (min-width:400px) and (prefers-reduced-motion:no-preference){aside{animation:blink .3s}}
@keyframes blink{from{opacity:0}to{opacity:1}}</style>
<aside></aside><span>Ready</span><output></output><script>
let started;
const moving = document.querySelector("aside"), out = document.querySelector("output");
moving.onanimationstart = () => { started = performance.now(); };
moving.onanimationend = () => { out.textContent = performance.now() - started >= 200 ? "completed naturally" : "fast-forwarded"; };
</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "responsive transition", steps: [
    { width: 450 }, { text: ["output", "completed naturally"] },
  ] }] }));
  const journey = check(f.dir, "--no-sweep").result.journeys[0];
  assert.ok(journey.pass, JSON.stringify(journey));
});

test("geometry still moving at the journey timeout is incomplete", browser, () => {
  const f = smallFrame(`<style>@media (min-width:400px) {main{animation:grow 30s linear}}
@keyframes grow{from{height:80px}to{height:180px}}</style><span>Ready</span>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "growing", steps: [
    { width: 450 }, { visible: "main" },
  ] }] }));
  const r = check(f.dir, "--no-sweep");
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.result.journeys[0].unmeasured, /still running after 1.5 seconds/);
  assert.equal(r.result.journeys[0].failed, undefined);
});

test("a placement holds after both participants settle, while a text step can still observe the transition", browser, () => {
  const f = smallFrame(`<style>body:has(main.start){width:90%}.a,.b{position:relative;display:block;width:20px;height:15px}
main.start .a{animation:shift 1.35s steps(1,end) forwards}
@keyframes shift{from{top:0}to{top:40px}}
main[data-mode=temporary].start .a{animation-direction:reverse}
main[data-mode=anchor] .a{top:40px}
main[data-mode=anchor].start .a{animation:none}
main[data-mode=anchor].start .b{animation:shift .7s steps(1,end) forwards}
</style><i class="a">A</i><i class="b">B</i><output>Ready</output><script>
const root=document.querySelector('main'), out=document.querySelector('output');
root.dataset.mode = location.search.slice(1);
document.onkeydown=()=>{root.classList.add('start');out.textContent='Moving';};
root.onanimationend=()=>{out.textContent='Settled';};
</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const journeys = ["final", "temporary", "anchor"].map((mode) => ({ name: mode, url: "page.html?" + mode, steps: [
    { press: "Enter" }, { text: ["output", "Moving"] }, { visible: ".a:below(.b)" },
  ] }));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { ...cfg.sweep, from: 200 }, journeys }));
  const [final, temporary, anchor] = check(f.dir, "--no-sweep").result.journeys;
  assert.ok(final.pass, JSON.stringify(final));
  for (const wrong of [temporary, anchor]) assert.match(wrong.failed, /step 3.*no .a:below\(.b\) is visible/);
});

test("a placement waits for chained natural animations under one deadline and ignores a decorative loop", browser, () => {
  const f = smallFrame(`<style>.key,.anchor{position:relative;display:block;width:30px;height:10px}
.spark{position:absolute;width:2px;height:2px;animation:spin .2s linear infinite}@keyframes spin{to{transform:rotate(1turn)}}
</style><i class="key">A<b class="spark"></b></i><i class="anchor">B</i><script>
const key=document.querySelector(".key"), root=document.querySelector("main"), mode=location.search.slice(1);
const startsBelow=mode!=="correct";
key.style.top=startsBelow?"40px":"0px";
document.onkeydown=async()=>{
  for (let i=0;i<2;i++) await root.animate({opacity:[1,.99]},mode==="slow"?600:200).finished;
  key.animate({top:[key.style.top,startsBelow?"0px":"40px"]},{duration:550,easing:"steps(1,end)",fill:"forwards"});
};
</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const journeys = ["correct", "wrong", "slow"].map((mode) => ({ name: mode, url: "page.html?" + mode,
    steps: [{ press: "Enter" }, { visible: ".key:below(.anchor)" }] }));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys }));
  const [correct, wrong, slow] = check(f.dir, "--no-sweep").result.journeys;
  assert.ok(correct.pass, JSON.stringify(correct));
  assert.match(wrong.failed, /no .key:below\(.anchor\) is visible/);
  assert.equal(slow.failed, undefined);
  assert.match(slow.unmeasured, /after 1.5 seconds/);
});

test("a sheet may close on a slow transitionend; a finished broken close fails and unfinished motion is unmeasured", browser, () => {
  const f = smallFrame(`<style>aside{width:40px;height:20px;transition:opacity 1.35s}main.slow aside{transition-duration:30s}
aside b{display:inline-block;animation:turn .2s infinite}@keyframes turn{to{transform:rotate(1turn)}}</style>
<aside>Sheet<b>*</b></aside><script>
const sheet=document.querySelector('aside'), mode=location.search.slice(1);
document.querySelector('main').className=mode;
document.onkeydown=()=>{sheet.style.opacity='.4';};
sheet.ontransitionend=()=>{if(mode!=='broken')sheet.hidden=true;};
</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const journeys = ["closes", "broken", "slow"].map((mode) => ({ name: mode, url: "page.html?" + mode, steps: [
    { press: "Escape" }, { hidden: "aside" },
  ] }));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys }));
  const [closed, broken, slow] = check(f.dir, "--no-sweep").result.journeys;
  assert.ok(closed.pass, JSON.stringify(closed));
  assert.match(broken.failed, /aside is still visible/);
  assert.equal(slow.failed, undefined);
  assert.match(slow.unmeasured, /unfinished motion after 1.5 seconds/);
});

test("a focused screenshot distinguishes a temporary flash with identical settled frames", browser, async () => {
  const { chromium } = createRequire(import.meta.url)(playwright), browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const sample = async () => {
      const png = await page.screenshot({ clip: { x: 20, y: 20, width: 1, height: 1 }, animations: "allow" });
      return page.evaluate(async (base64) => {
        const image = new Image();
        image.src = "data:image/png;base64," + base64;
        await image.decode();
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.drawImage(image, 0, 0);
        return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3);
      }, png.toString("base64"));
    };
    // Bracket the screenshot with the chart's own clock. A white final frame cannot serve as an intermediate capture.
    const phase = () => {
      const chart = document.querySelector("#chart");
      const animation = chart.getAnimations().find((a) => a.animationName === "redraw");
      if (chart.dataset.done || animation?.currentTime >= 750) return "missed";
      return animation?.playState === "running" && animation.currentTime >= 150 ? "moving" : false;
    };
    const sampleMoving = async () => {
      const observed = await page.waitForFunction(phase, undefined, { polling: "raf", timeout: 2000 });
      if (await observed.jsonValue() !== "moving") return null;
      const pixel = await sample();
      return await page.evaluate(phase) === "moving" ? pixel : null;
    };
    for (const flash of [false, true]) {
      await page.setViewportSize({ width: 300, height: 100 });
      await page.setContent(`<style>body{margin:0}#chart{height:50px;background:white}
@keyframes redraw{0%,85%{background:${flash ? "red" : "white"}}100%{background:white}}
@media(min-width:400px) and (prefers-reduced-motion:no-preference){#chart{animation:redraw 1s steps(1,end)}}
</style><div id="chart"></div><script>
document.querySelector("#chart").addEventListener("animationend", (e) => { e.currentTarget.dataset.done = "yes"; }, { once: true });
</script>`);
      await page.setViewportSize({ width: 450, height: 100 });
      const moving = await sampleMoving();
      assert.notEqual(moving, null, "The intermediate PNG missed the capture window.");
      assert.deepEqual(moving, flash ? [255, 0, 0] : [255, 255, 255]);
      await page.waitForFunction(() => document.querySelector("#chart").dataset.done, undefined, { timeout: 2000 });
      assert.equal(await sampleMoving(), null, "A late capture must remain unmeasured.");
      assert.deepEqual(await sample(), [255, 255, 255]);
    }
  } finally { await browser.close(); }
});

test("draft 28.2: journeys keep the page's transitions: a sheet that hides itself when its closing transition ends closes; one that never closes fails", browser, () => {
  let f;
  const run = (closes, ledger = []) => {
    f = smallFrame(`<button id="open" aria-expanded="false" aria-controls="sheet">Menu</button><div id="sheet" hidden style="position:fixed;left:0;right:0;bottom:0;height:120px;background:#eee;transition:transform .3s"><button id="close">Close</button></div>
<script>const sheet = document.getElementById("sheet"), open = document.getElementById("open");
open.onclick = () => { sheet.hidden = false; sheet.style.transform = "none"; open.setAttribute("aria-expanded", "true"); };
document.getElementById("close").onclick = () => { ${closes ? 'sheet.addEventListener("transitionend", () => { sheet.hidden = true; open.setAttribute("aria-expanded", "false"); }, { once: true }); sheet.style.transform = "translateY(100%)";' : ""} };</script>`);
    const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "the sheet", steps: [{ click: "#open" }, { visible: "#sheet" }, { click: "#close" }, { hidden: "#sheet" }] }] }));
    fs.writeFileSync(path.join(f.dir, "ledger.json"), JSON.stringify(ledger));
    return check(f.dir);
  };
  const closing = run(true).result.journeys;
  assert.ok(closing.length && closing.every((j) => j.pass), JSON.stringify(closing));
  let r = run(false);
  assert.ok(r.result.journeys.some((j) => j.name === "the sheet" && !j.pass && /#sheet is still visible/.test(j.failed)), JSON.stringify(r.result.journeys));
  assert.equal(r.status, 1);
  // Shown by a reproduction to be the check's own doing, it is proposed with cause checker: pending, not failed.
  r = run(false, [{ landmark: "the sheet", property: "journey", cause: "checker", status: "proposed", reason: "reproduced in review.md: the check's own style keeps the sheet open" }]);
  assert.ok(r.result.journeys.some((j) => j.name === "the sheet" && j.status === "pending"), JSON.stringify(r.result.journeys));
  assert.notEqual(r.status, 1, r.stdout);
  assert.match(r.stdout, /journey disputed with the check \(pending\): the sheet/);
  assert.match(fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8"), /^## Disputed with the check\n\n- proposed: the sheet journey — reproduced in review\.md/m);
});

test("draft 28.2: the generated conditions double a list's rows, nested ones too, not buttons side by side; stretch the frames' page only; a text set not to wrap is no cut; each collision is a candidate until review.md answers it", browser, () => {
  // Buttons side by side are not a list: doubled, they would run out of the card.
  let r = check(smallFrame('<div style="display:flex;gap:8px"><button class="btn" style="white-space:nowrap">Configure</button><button class="btn" style="white-space:nowrap">Order</button></div>').dir);
  assert.deepEqual(r.result.sweep.issues.filter((i) => i.story === "the frames' page, entries doubled"), [], JSON.stringify(r.result.sweep.issues));
  assert.deepEqual(r.result.sweep.stories.filter((st) => st.generated).map((st) => st.name), ["the frames' page, texts stretched", "the frames' page, entries doubled", "the component's own width"]);
  // Rows of a list, each with its disks in a box of two lines: doubled, each row's disks are doubled too, and cut.
  const disks = '<div style="height:48px;overflow:hidden"><div class="disk">A</div><div class="disk">B</div></div>';
  r = check(smallFrame(`<style>main{height:auto;min-height:80px}</style><div class="row">${disks}</div><div class="row">${disks}</div>`).dir);
  assert.ok(r.result.sweep.issues.some((i) => i.property === "clipped" && i.story === "the frames' page, entries doubled" && i.status === "candidate"), JSON.stringify(r.result.sweep.issues));
  // Under longer texts, a text that may not wrap runs out by design; one that cannot shrink is a candidate, not a finding.
  const f = smallFrame('<div style="display:flex"><span style="flex:none">Ready steady go now</span></div><div style="white-space:nowrap">Alpha beta gamma go</div>');
  r = check(f.dir);
  const cand = r.result.sweep.issues.filter((i) => i.status === "candidate");
  assert.ok(cand.some((i) => i.property === "outside" && /^Ready steady go now/.test(i.landmark)), JSON.stringify(r.result.sweep.issues));
  assert.ok(!r.result.sweep.issues.some((i) => /^Alpha/.test(i.landmark)), JSON.stringify(r.result.sweep.issues));
  assert.equal(r.status, 2, `an unanswered candidate leaves the check incomplete: ${r.stdout}`);
  assert.equal(r.result.sweep.score, 0);
  assert.match(r.stdout, /candidates? from the generated conditions, unanswered: outside “Ready steady go now/);
  assert.match(fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8"), /^- unanswered: Ready steady go now/m);
  // Answered in review.md by the contract's bound, it no longer holds the check.
  fs.appendFileSync(path.join(f.dir, "review.md"), `\n## Candidates\n\n- ${cand[0].landmark}: the label is 19 characters at most (the contract's type)\n`);
  r = check(f.dir);
  assert.equal(r.status, 0, r.stdout);
  assert.match(fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8"), /^- answered: Ready steady go now.* — the label is 19 characters at most/m);
  // Without the generated conditions, the evidence says they were not checked.
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { ...cfg.sweep, generate: false } }));
  check(f.dir);
  assert.match(fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8"), /^- the generated conditions \(sweep\.generate is false\)/m);
});

test("draft 28.2: with no ledger named, deviations.json beside design.json is the ledger", browser, () => {
  const f = smallFrame('<span style="margin-left:30px">Ready</span>');
  const { ledger, ...cfg } = JSON.parse(fs.readFileSync(f.config, "utf8"));
  assert.equal(ledger, "ledger.json");
  fs.writeFileSync(f.config, JSON.stringify(cfg));
  f.write('<main><span style="margin-left:60px">Ready</span></main>');
  fs.writeFileSync(path.join(f.dir, "deviations.json"), JSON.stringify([{ landmark: "Ready", property: "x", status: "accepted", decidedBy: "owner", reason: "more air before the label" }]));
  const r = check(f.dir, "--frame", "frame");
  assert.deepEqual(r.result.frames[0].issues.map((i) => [i.landmark, i.property, i.status]), [["Ready", "x", "accepted"]], r.stdout);
});

test("draft 28.2: a journey with sameAsFresh ends as a fresh load draws the component; an observer left on removed elements does not", browser, () => {
  // A row that stacks below 400 px by a ResizeObserver; emptied and restored, it is observed again, or not. 44.3: the
  // kept build lets go of the row leaving (an observer left on it fails the journey, below).
  const run = (rewatch) => {
    const f = smallFrame(`<div id="host"></div><button id="toggle">Toggle</button>
<style>.row{display:flex;gap:8px}.row[data-mode=stack]{flex-direction:column}</style>
<script>const host = document.getElementById("host"); let shown = true, observer;
const render = () => { ${rewatch ? "observer?.disconnect(); " : ""}host.innerHTML = shown ? '<div class="row" data-mode="line"><span>Ready</span><span>Steady</span></div>' : "<p>None</p>"; };
const watch = () => { const row = host.querySelector(".row"); if (row) (observer = new ResizeObserver(() => { row.dataset.mode = row.clientWidth < 400 ? "stack" : "line"; })).observe(row); };
render(); watch();
document.getElementById("toggle").onclick = () => { shown = !shown; render(); ${rewatch ? "watch();" : ""} };</script>`);
    const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "emptied and restored", sameAsFresh: true, steps: [{ click: "#toggle" }, { visible: "main p" }, { click: "#toggle" }, { visible: ".row" }] }] }));
    return check(f.dir).result.journeys.filter((j) => j.name === "emptied and restored");
  };
  const kept = run(true);
  assert.ok(kept.length === 1 && kept[0].pass, JSON.stringify(kept));
  const stale = run(false);
  // The restored row is never observed, so it keeps the line where a fresh load stacks it; the observer left on the
  // removed row is a note beside it (44.3).
  assert.ok(!stale[0].pass && /^after its steps, the component differs from a fresh load at 300 px: div height 24, fresh 56/.test(stale[0].failed), JSON.stringify(stale));
  assert.deepEqual(stale[0].issues.map((i) => [i.landmark, i.kind, i.status]), [["div.row", "stale observer", "note"]]);
});

test("draft 28.2: the console is a digest of fifteen lines at most: what changed since the round before, each frame's new findings first, the rest as a count", () => {
  const r = compare({ New: { dy: 30 } }, { height: 230 });
  const frames = Array.from({ length: 20 }, (_, i) => ({ ...r, frame: `f${i}` }));
  const digest = renderSummary({ frames, gaps: ["one", "two"], round: 2 }, { file: "out/report.md" }).split("\n");
  assert.ok(digest.length <= 15, digest.join("\n"));
  assert.match(digest.at(-2), /^… \d+ more lines in out\/report\.md$/);
  assert.equal(digest.at(-1), "Full tables: out/report.md");
  // Against the round before: what was fixed and what is new; a finding seen before is counted, not listed.
  const before = { round: 1, score: 50, findings: ["f\u0000root\u0000height", "f\u0000Title\u0000y"] };
  const one = renderSummary({ frames: [r], round: 2, previous: before });
  assert.match(one, /^Since round 1: 1 fixed \(f: Title y\), 1 new \(f: New y\), 1 unchanged\.$/m);
  assert.match(one, /^f: fail, 2 findings; start here: between “SKU” and “New” vertically \+30 px; New y: 42 → 72 \(\+30\); 1 unchanged;/m);
});

test("draft 28.2: a first finding that stays first over two complete rounds stops the loop, though the score falls", browser, () => {
  // "Ready" stays 40, 30 and 20 px off: each round has a new lowest score, and the same first finding.
  const f = smallFrame('<span style="position:absolute;left:0;top:0">Ready</span><span style="position:absolute;left:0;top:40px">Go</span>');
  const round = (ready, go) => { f.write(`<main><span style="position:absolute;left:${ready}px;top:0">Ready</span><span style="position:absolute;left:${go}px;top:40px">Go</span></main>`); return check(f.dir); };
  round(40, 0);
  const second = round(30, 14);
  assert.match(second.stdout, /^Since round 1: 0 fixed, 1 new \(frame: Go x\), \d+ unchanged\.$/m);
  assert.doesNotMatch(second.stdout, /stop re-running/);
  const third = round(20, 0);
  assert.match(third.stdout, /^Since round 2: 1 fixed \(frame: Go x\), 0 new, \d+ unchanged\.$/m);
  assert.match(third.stdout, /^Verdict: fail — stop re-running: fix it, propose it with a reason, or report the check as blocked$/m);
  assert.ok(third.stdout.trimEnd().split("\n").length <= 15, third.stdout);
  const history = fs.readFileSync(path.join(f.dir, "out/history.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  assert.deepEqual(history.map((h) => h.first), ["frame\u0000Ready\u0000x", "frame\u0000Ready\u0000x", "frame\u0000Ready\u0000x"]);
  assert.ok(history[1].score < history[0].score && history[2].score < history[1].score, `each round a new lowest: ${history.map((h) => h.score)}`);
});

// Terra's 31 recorded rounds on draft 27 (research/…/32-checker-rounds.json): q quick, f complete; A the text width
// finding (-16.69 px) first in 19 of rounds 1–21, B the -5.69 px one, C the sheet journey the check's own
// transition:none broke, - where the record shows no first finding. Draft 28.2's rule matched the first finding only
// within one basis and only on complete rounds, so it first spoke at round 31.
test("draft 28.3: replayed on Terra's recorded rounds, an unchanged first finding speaks by round 4 and stops the first complete round after", () => {
  const rounds = "qA qA qA qA qA fA fA qA fA fA qA q- qA q- qA q- qA qA qA qA qA qB qB qB qB qB q- fC fC q- fC".split(" ");
  const history = [], said = [];
  for (const [i, r] of rounds.entries()) {
    const first = r[1] === "-" ? null : r[1], complete = r[0] === "f";
    const notice = rerunNotice({ complete, status: first ? "fail" : "pending", stalled: 0, streak: firstStreak(history, first) });
    if (notice) said.push([i + 1, /stop re-running/.test(notice) ? "stop" : "unchanged"]);
    history.push({ round: i + 1, first, quick: !complete });
  }
  assert.deepEqual(said[0], [3, "unchanged"]);
  assert.deepEqual(said.find(([, kind]) => kind === "stop"), [6, "stop"]);
  assert.ok(said.some(([n]) => n === 24), "the second finding, first from round 22, speaks at round 24");
  assert.equal(rerunNotice({ complete: true, status: "pass", stalled: 5, streak: 5 }), "");
  assert.equal(firstStreak([{ first: "a" }, { first: "b" }, { first: "b" }], "b"), 3);
  assert.equal(firstStreak([{ first: "b" }, {}], "b"), 1);
});

// The planted server card: the builder proposed the line the API does not send and the 30 px it moves the first row;
// the check went on leading with that step, which would drive the very loop the stop rule ends.
test("draft 28.3: a step the ledger settles is not where to start, nor the first finding; the next unsettled one is", () => {
  const frame = { frame: "card-764", pass: false, verdict: "fail", score: 3, images: {},
    root: { spec: { width: 764, height: 200 }, page: { width: 764, height: 170 } },
    issues: [
      { landmark: "BA-i201-B", property: "y", expected: 16, actual: -14, delta: -30, status: "pending", entries: [0] },
      { landmark: "EPYC 9374F", property: "y", expected: 40, actual: 10, delta: -30, status: "pending", inherited: true, entries: [0] },
      { landmark: "2+", property: "x", expected: 137, actual: 155, delta: 18, status: "fail" },
    ],
    causes: [
      { index: 1, axis: "y", after: "the top of the root", before: "BA-i201-B", step: -30, y: 16, x: 20 },
      { index: 7, axis: "x", after: "MC-LAG 25/25", before: "2+", step: 18, y: 120, x: 137 },
    ] };
  const digest = renderSummary({ frames: [frame] });
  assert.match(digest, /^card-764: fail, 1 findings, 2 awaiting a decision; start here: between “MC-LAG 25\/25” and “2\+” horizontally \+18 px/m, digest);
  assert.match(renderReport({ frames: [frame], status: "fail" }), /^Start here: between “MC-LAG 25\/25” and “2\+” horizontally \+18 px\.$/m);
  assert.deepEqual([...findingKeys({ frames: [frame] }).keys()], ["card-764\u00002+\u0000x"]);
  // Where every step found is settled, no step is named: the findings left are listed as they are.
  const settled = { ...frame, causes: frame.causes.slice(0, 1) };
  assert.doesNotMatch(renderSummary({ frames: [settled] }), /start here/);
  assert.match(renderSummary({ frames: [settled] }), /2\+ x: 137 → 155 \(\+18\)/);
});

// p2's footers, "MC-LAG 25/25" and "2+ PSU", set a class too large: 17–26 % wider in every frame. Their boxes are the
// builder's (an icon joined to its label), so their height is not ink and the per-text rule skipped them.
test("draft 28.5: a joined text a size larger is told by its width alone, wider only; narrower or a little wider stays silent", () => {
  const spec = { frame: { name: "f", width: 300, height: 200 }, source: "image boxes", landmarks: [
    { text: "SKU", box: box(20, 20, 60, 16) }, { text: "Title", box: box(20, 74, 120, 24) }, { text: "1 499 €", box: box(200, 20, 80, 28) },
    { text: "Buy", box: box(200, 60, 80, 20) }, { text: "MC-LAG 25/25", box: box(20, 150, 80, 14), joined: true }] };
  const page = (width) => ({ root: { width: 300, height: 200 }, landmarks: spec.landmarks.map((l) => ({ found: true, align: "left",
    box: l.text === "MC-LAG 25/25" ? { ...l.box, width, height: 30 } : { ...l.box } })) });
  const type = (width) => compareFrame({ frame: "f", spec, measured: page(width), tolerance: 4 }).issues.filter((i) => i.property === "type" && i.landmark === "MC-LAG 25/25");
  assert.equal(type(94).length, 1);
  assert.match(type(94)[0].actual, /^18 % larger than drawn, by its width against the frame's font: a size of another class/);
  assert.deepEqual(type(86), [], "8 % and 6 px wider: control26's footers");
  assert.deepEqual(type(64), [], "narrower: the box was drawn round an icon too");
});

// ------------------------------------------------------------------ 0.46.1: what a missing text carries

// The planted card in small: a line at the top no data supplies (13 px high, 17 px above the first row), two rows and a
// footer below it. A build without the line moves every row up by 30 px and the root by as much. The capped rerun wrote
// nine entries for this one question; the presence entry alone now carries the shift, and only that far.
const LINE = {
  frame: { name: "f", width: 300, height: 140 },
  landmarks: [
    { text: "Delivery in 15 minutes", box: box(20, 15, 120, 13) },
    { text: "SKU", box: box(20, 45, 60, 10) }, { text: "1 499 €", box: box(200, 45, 80, 12) },
    { text: "Title", box: box(20, 70, 120, 12) },
    { text: "Port", box: box(20, 110, 40, 10) }, { text: "In stock", box: box(200, 110, 60, 10) },
  ],
};
const lineShift = ({ rows = -30, footer = rows, height = 140 + footer } = {}) => ({
  root: { width: 300, height },
  landmarks: LINE.landmarks.map((l, i) => (i === 0 ? { found: false }
    : { found: true, align: l.box.x >= 200 ? "right" : "left", box: { ...l.box, y: l.box.y + (l.box.y >= 110 ? footer : rows) } })),
});
const lineEntry = (extra = {}) => ({ landmark: ["Delivery in 15 minutes", "Delivery in 2 hours"], property: "presence", category: "missing-state", status: "proposed",
  reason: "the frame draws a delivery time the API does not send", options: ["add the field to the API", "accept the card without it"], ...extra });
const withLine = (page, ledger = [lineEntry()]) => compareFrame({ frame: "f", spec: LINE, measured: page, ledger });

test("0.46.1: a presence entry for a text the page lacks carries the rows below it and the root's height, as notes naming it", () => {
  const without = withLine(lineShift(), []);
  assert.equal(without.verdict, "fail");
  assert.deepEqual(without.issues.filter((i) => i.status === "fail").map((i) => `${i.landmark} ${i.property}`).sort(),
    ["1 499 € y", "Delivery in 15 minutes presence", "In stock y", "Port y", "SKU y", "Title y", "root height"]);
  const r = withLine(lineShift());
  assert.equal(r.verdict, "pending", JSON.stringify(r.issues));
  assert.deepEqual(r.issues.map((i) => [i.landmark, i.property, i.status]), [["Delivery in 15 minutes", "presence", "pending"]]);
  assert.deepEqual(r.notes.filter((n) => n.carried).map((n) => `${n.landmark} ${n.property} ${n.delta}`),
    ["SKU y -30", "1 499 € y -30", "Title y -30", "Port y -30", "In stock y -30", "root height -30"]);
  assert.ok(r.notes.every((n) => n.entries[0] === 0 && n.carried[0] === "Delivery in 15 minutes"));
  assert.equal(r.score, 10, "the question counts once; what it carries counts nothing");
  const digest = renderSummary({ frames: [r] });
  assert.doesNotMatch(digest, /start here/, digest);
  assert.match(digest, /6 shifts carried by the missing “Delivery in 15 minutes” \(ledger entry 1, pending\), at most 30 px/, digest);
  assert.match(renderHandoff({ frames: [r], ledger: [lineEntry()], status: "pending" }), /awaits your decision on 1, and carries 6 shifts below the missing text, as notes/);
  // Accepted, the same: the owner's decision is the presence; the shift needs none of its own.
  const accepted = withLine(lineShift(), [lineEntry({ status: "accepted", decidedBy: "owner" })]);
  assert.equal(accepted.verdict, "pass", JSON.stringify(accepted.issues));
  // An entry for another frame carries nothing here.
  assert.equal(withLine(lineShift(), [lineEntry({ frame: "card-280" })]).verdict, "fail");
});

test("0.46.1: what a missing text carries is bounded by its height and its gap, upward only, and hides no other shift", () => {
  // A 20 px margin planted above the footer: the footer sits 10 px above the design, a note on its own, but 20 px below
  // where the missing line puts it: a finding, as the planted margin is.
  const masked = withLine(lineShift({ rows: -30, footer: -10 }));
  assert.equal(masked.verdict, "fail");
  assert.deepEqual(masked.issues.filter((i) => i.status === "fail").map((i) => [i.landmark, i.property, Math.round(i.delta), Math.round(i.unexcused)]),
    [["Port", "y", -10, 20], ["In stock", "y", -10, 20]]);
  assert.match(renderSummary({ frames: [masked] }), /Port y: 110 → 100 \(-10; \+20 after the ledger\)/);
  // Past the bound (13 px and its 17 px gap), what is left is judged as any offset: 20 px more is a finding at the row
  // it starts from; the rows below carry it as a drift.
  const far = withLine(lineShift({ rows: -50 }));
  assert.deepEqual(far.issues.filter((i) => i.status === "fail").map((i) => [i.landmark, Math.round(i.unexcused)]), [["SKU", -20], ["1 499 €", -20]]);
  assert.ok(far.notes.some((n) => n.landmark === "Title" && !n.carried && n.delta === -20), JSON.stringify(far.notes));
  // A row lower than drawn is no absence's doing: the entry carries nothing.
  const lower = withLine(lineShift({ rows: 30, height: 140 }));
  assert.ok(!lower.notes?.some((n) => n.carried), JSON.stringify(lower.notes));
  assert.deepEqual(lower.issues.filter((i) => i.status === "fail").map((i) => i.landmark), withLine(lineShift({ rows: 30, height: 140 }), []).issues.filter((i) => i.status === "fail" && i.property === "y").map((i) => i.landmark));
  // A missing text below every landmark carries the root's height alone: its height and its gap to the one above.
  const foot = { frame: { name: "f", width: 300, height: 150 }, landmarks: [{ text: "SKU", box: box(20, 20, 60, 10) }, { text: "Title", box: box(20, 60, 120, 20) }, { text: "Note", box: box(20, 100, 100, 12) }] };
  const page = (height) => ({ root: { width: 300, height }, landmarks: foot.landmarks.map((l, i) => (i === 2 ? { found: false } : { found: true, align: "left", box: { ...l.box } })) });
  const entry = [{ landmark: "Note", property: "presence", category: "missing-state", status: "proposed", reason: "no data for the note" }];
  const short = compareFrame({ frame: "f", spec: foot, measured: page(118), ledger: entry });
  assert.equal(short.verdict, "pending", JSON.stringify(short.issues));
  assert.deepEqual(short.notes.filter((n) => n.carried).map((n) => `${n.landmark} ${n.property} ${n.delta}`), ["root height -32"]);
  assert.equal(compareFrame({ frame: "f", spec: foot, measured: page(88), ledger: entry }).issues.find((i) => i.landmark === "root").status, "fail");
});

// The planted card prebuilt (iteration 6's build, which does not render the line), with one ledger entry: the line's
// presence, entry 1 of the capped rerun's frozen ledger (research note 39), naming the line in every frame.
const PLANTED = path.join(HERE, "design-to-code/cases/server-card-planted");
function plantedArm(css = "") {
  const arm = path.join(tmp(), "arm");
  assert.equal(spawnSync(process.execPath, [path.join(PLANTED, "make-arm.mjs"), arm, "--prebuilt"], { encoding: "utf8" }).status, 0);
  if (css) fs.appendFileSync(path.join(arm, "card.css"), `\n${css}\n`);
  fs.writeFileSync(path.join(arm, ".design/card/deviations.json"), JSON.stringify([{
    landmark: ["Выдача за 15 минут", "Выдача за 2 часа", "Выдача за 1 день", "Выдача за 3 дня"], property: "presence", category: "missing-state", status: "proposed",
    reason: "The frame shows a delivery time but README.md says the API sends exactly the listed fields and none supplies it.",
    options: ["Supply a delivery-time field and render it; requires an API contract change.", "Accept omission until the data is available; the card remains shorter than the frame."] }]));
  return path.join(arm, ".design/card");
}
const CARDS = ["card-764", "card-601", "card-486", "card-280"];

test("0.46.1, C1: on the planted card the line's presence entry alone carries every row it moves and the root's height", browser, () => {
  const r = check(plantedArm());
  // Before: exit 1, 81 findings, 76 of them the rows below the line and the root's height (y and height).
  assert.equal(r.status, 1, r.stdout);
  const cards = r.result.frames.filter((f) => CARDS.includes(f.frame));
  assert.equal(cards.length, 4);
  for (const f of cards) {
    assert.deepEqual(f.issues.filter((i) => i.status === "pending").map((i) => [i.property, i.entries]), [["presence", [0]]], f.frame);
    // What keeps the card from pending is the build's own: type sizes, nothing the line moves.
    assert.deepEqual(f.issues.filter((i) => i.status === "fail" && ["y", "height"].includes(i.property)), [], `${f.frame}: ${JSON.stringify(f.issues)}`);
    assert.ok(f.notes.filter((n) => n.carried).length >= 7, `${f.frame}: ${JSON.stringify(f.notes)}`);
  }
  // The root's height: carried at 764; at 280 the line's shift is carried and what is left (the stock line sits 12 px
  // closer to the price than drawn) is a note.
  assert.ok(cards[0].notes.some((n) => n.landmark === "root" && n.carried), JSON.stringify(cards[0].notes));
  assert.ok(cards[3].notes.some((n) => n.landmark === "root" && !n.carried && Math.abs(n.delta) <= 24), JSON.stringify(cards[3].notes));
  assert.deepEqual([...new Set(r.result.frames.flatMap((f) => f.issues.filter((i) => i.status === "fail").map((i) => i.property)))].sort(), ["type", "width"]);
  assert.match(r.stdout, /shifts carried by the missing “Выдача за 15 минут” \(ledger entry 1, pending\)/);
  assert.doesNotMatch(r.stdout, /start here: between “the top of the root”/);
  // One entry for the question in every frame is no broad excuse.
  assert.doesNotMatch(fs.readFileSync(path.join(r.dir, "out/handoff.md"), "utf8"), /## Broad excuses/);
});

test("0.46.1, C2: a 20 px margin planted above the planted card's footer, below the missing line, stays a finding", browser, () => {
  const r = check(plantedArm('.card[data-mode="wide"] .card__foot { margin-top: 20px; }'), "--frame", "card-764");
  assert.equal(r.status, 1, r.stdout);
  const f = r.result.frames[0];
  const moved = f.issues.filter((i) => i.status === "fail" && i.property === "y");
  // Without the entry these sit 7–8 px above the design: notes. The line takes 30 px; the 20 px margin is left.
  assert.deepEqual(moved.map((i) => i.landmark).sort(), [".ico--port", "1", "2+", "MC-LAG 25/25", "PSU", "Доступно"]);
  for (const i of moved) assert.ok(i.unexcused >= 18 && i.unexcused <= 24 && Math.abs(i.delta) <= 12, JSON.stringify(i));
  assert.match(r.stdout, /MC-LAG 25\/25 y: 118 → \d+ \(-\d+; \+\d+ after the ledger\)/);
});

// ------------------------------------------------------------------ 44, item 2: the component's own width

// The catalogue card with its frames sized by the window (no host): each frame on story.html in a container of its
// width, as a builder who sizes the frames by the window writes it. The start code picks its layout by matchMedia.
const CATALOGUE = path.join(HERE, "design-to-code/cases/catalogue-card");
function catalogueArm(build) {
  const dir = tmp();
  fs.cpSync(path.join(CATALOGUE, "project"), dir, { recursive: true });
  if (build === "reference") for (const f of ["card.js", "card.css"]) fs.copyFileSync(path.join(CATALOGUE, "reference", f), path.join(dir, f));
  const frames = [["card-764", 764], ["card-375", 375]].map(([name, width]) => ({ name, width, url: `story.html?w=${width}`,
    spec: path.join(CATALOGUE, "pack", name, "spec.json"), reference: path.join(CATALOGUE, "pack", name, "reference.png") }));
  fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify({ url: "story.html?w=764", root: ".card", frames, sweep: { from: 375, to: 764 } }));
  return dir;
}

test("44.2: the component's own width: the catalogue's start code, laid out by the window, is a candidate at 375 px; the reference, by its own width, is none", browser, () => {
  // Before: the start code raised no candidate with frames sized by the window, since the window and the card's
  // container are one there; in a 1280 px window with its container held at 375 px, matchMedia picks the wide layout.
  let r = check(catalogueArm("start"), "--quick");
  const own = r.result.sweep.issues.filter((i) => i.story === "the component's own width");
  assert.deepEqual(own.map((i) => [i.property, i.landmark, i.ranges, i.status]), [["window", "card-375", "375", "candidate"]], JSON.stringify(r.result.sweep.issues));
  assert.match(own[0].actual, /^laid out by the window, not by its own width: in a 1280 px window, its container held at the 375 px it had at 375, another layout/);
  assert.match(r.stdout, /unanswered: window “card-375” \(the component's own width, 375\)/);
  r = check(catalogueArm("reference"), "--quick");
  assert.deepEqual(r.result.sweep.issues.filter((i) => i.status === "candidate"), [], JSON.stringify(r.result.sweep.issues));
  assert.ok(r.result.sweep.stories.some((st) => st.name === "the component's own width" && st.generated && !st.unmeasured), JSON.stringify(r.result.sweep.stories));
});

// A page with frames at 900 and 375 px, named "wide" and "narrow", sized by the window; `html` is the body's content.
function windowFrames(html, { root = ".card", review = "" } = {}) {
  const dir = tmp(), config = path.join(dir, "design.json");
  fs.writeFileSync(path.join(dir, "page.html"), `<!doctype html><style>body{margin:0;font:20px/24px monospace}.card{background:white}.row{display:flex;gap:8px}</style>${html}`);
  fs.writeFileSync(path.join(dir, "review.md"), REVIEW + review);
  fs.writeFileSync(config, JSON.stringify({ url: "page.html", root, ledger: "ledger.json", lifecycle: "a fixture: one render, no data changes",
    frames: [["wide", 900], ["narrow", 375]].map(([name, width]) => ({ name, width, spec: `${name}.json`, reference: `${name}.png` })),
    sweep: { from: 375, to: 900, step: 100, stories: [{ name: "dense", url: "page.html?dense" }] } }));
  const snap = cli("snapshot", config, "--images");
  assert.equal(snap.status, 0, snap.stderr);
  return dir;
}
const MEDIA = "<style>@media (max-width: 600px) { .row { flex-direction: column } }</style>";
const ROW = '<div class="row"><span>Ready</span><span>Steady</span></div>';
const ownWidthOf = (r) => ({ candidates: r.result.sweep.issues.filter((i) => i.story === "the component's own width").map((i) => [i.property, i.landmark, i.status, i.answer ?? null]),
  notes: r.result.sweep.stories.find((st) => st.name === "the component's own width").notes ?? [] });

test("44.2: an own-width answer names its frame as the check prints it, window “<frame>”; a line that only holds the frame's name answers nothing", browser, () => {
  const answer = (line) => ownWidthOf(check(windowFrames(`<main><div class="card">${MEDIA}${ROW}</div></main>`, { review: `\n## Candidates\n\n${line}\n` }), "--quick")).candidates;
  // Before (the verifier): this answered the frame "narrow", the reason holding its name.
  assert.deepEqual(answer("- Ready Re × Go G: the label is at most 8 characters, so it holds in a narrow column (api/types.ts)"), [["window", "narrow", "candidate", null]]);
  for (const key of ["window “narrow”", 'window "narrow"', "`window “narrow”` (the component's own width, 375)"]) {
    assert.deepEqual(answer(`- ${key}: the card is shown only in the 375 px column (layout.ts)`), [["window", "narrow", "candidate", "the card is shown only in the 375 px column (layout.ts)"]], key);
  }
});

test("44.2: the generated conditions' answers name the candidate at the head of the line, not anywhere in it", browser, () => {
  // An answer for another text that holds the landmark in its reason. Before: it answered the candidate.
  const f = smallFrame('<div style="display:flex"><span style="flex:none">Ready steady go now</span></div>');
  let r = check(f.dir, "--quick");
  const [cand] = r.result.sweep.issues.filter((i) => i.status === "candidate" && i.property === "outside");
  assert.ok(cand, JSON.stringify(r.result.sweep.issues));
  const candidates = (line) => fs.writeFileSync(path.join(f.dir, "review.md"), `${REVIEW}\n## Candidates\n\n${line}\n`);
  candidates(`- Price: unlike ${cand.landmark}, the price is at most 9 characters (api/types.ts)`);
  r = check(f.dir, "--quick");
  assert.ok(r.result.sweep.issues.filter((i) => i.landmark === cand.landmark && i.status === "candidate").every((i) => !i.answer), JSON.stringify(r.result.sweep.issues));
  // The landmark at the head, or the property and the landmark as printed, with the condition in parentheses: answered.
  for (const head of [cand.landmark, `outside “${cand.landmark}” (the frames' page, texts stretched, 300)`]) {
    candidates(`- ${head}: the label is 19 characters at most (the contract's type)`);
    r = check(f.dir, "--quick");
    const answered = r.result.sweep.issues.find((i) => i.landmark === cand.landmark && i.status === "candidate");
    assert.equal(answered.answer, "the label is 19 characters at most (the contract's type)", head);
  }
});

test("44.2: the page itself in the page's body is not tried; where the hold cannot give the root its own width, the condition measures nothing there", browser, () => {
  // Before (the verifier): a page laid out by a media query, its root in the body, was a candidate at 375 px.
  let r = check(windowFrames(`<main class="card">${MEDIA}${ROW}</main>`, { root: "main" }), "--quick");
  assert.deepEqual(ownWidthOf(r), { candidates: [], notes: ["not tried at 900 and 375 px: the root is the page itself, main or what holds it in the page's body, and a page is laid out by the window"] });
  // Before (the verifier): a container-query component on a page whose sidebar hides below 700 px. Its container held
  // at 375 px in the wide window, the sidebar came back and the root went from 375 to 135 px: a candidate.
  const sidebar = "<style>.shell{display:flex}.side{width:240px;flex:none}@media (max-width: 700px){.side{display:none}}main{container-type:inline-size;flex:1;min-width:0}@container (width < 600px){.row{flex-direction:column}}</style>";
  r = check(windowFrames(`${sidebar}<div class="shell"><aside class="side">Filters</aside><main class="card">${ROW}</main></div>`, { root: "main" }), "--quick");
  assert.deepEqual(ownWidthOf(r), { candidates: [], notes: ["not measured at 375 px: with its container held at 375 px in a 1280 px window, the root is 135 px wide, not the 375 it has at 375; what else the container holds there (a sidebar the narrower window hides) takes the rest"] });
  assert.ok(!r.result.sweep.stories.find((st) => st.name === "the component's own width").unmeasured, "a note, not a story unmeasured: the page decides it");
  // The same component in a column of its own, laid out by the window: still a candidate.
  r = check(windowFrames(`<main><div class="card">${MEDIA}${ROW}</div></main>`), "--quick");
  assert.deepEqual(ownWidthOf(r), { candidates: [["window", "narrow", "candidate", null]], notes: [] });
});

test("44.2: a root whose own width follows the window is a candidate where the hold cannot give it its width; a component in the body is tried, the page itself is not", browser, () => {
  // Before (the verifier of doc 44): a card laid out by a media query that also sets its own width by the window
  // (600 px above 600, or at most 90vw) was not measured, as if a sidebar took its room. Nothing else is in its
  // container: the window sets its width, which is the defect.
  let r = check(windowFrames(`<main><div class="card">${MEDIA}<style>@media (min-width: 601px) { .card { width: 600px } }</style>${ROW}</div></main>`), "--quick");
  assert.deepEqual(ownWidthOf(r), { candidates: [["window", "narrow", "candidate", null]], notes: [] });
  r = check(windowFrames(`<main><div class="card" style="max-width: 90vw">${MEDIA}${ROW}</div></main>`), "--quick");
  assert.deepEqual(ownWidthOf(r), { candidates: [["window", "wide", "candidate", null], ["window", "narrow", "candidate", null]], notes: [] });
  // Before: a component placed directly in the body was not tried, as the page is not.
  r = check(windowFrames(`<div class="card">${MEDIA}${ROW}</div>`), "--quick");
  assert.deepEqual(ownWidthOf(r), { candidates: [["window", "narrow", "candidate", null]], notes: [] });
  // The page's top layout, which holds main, directly in the body: the page itself, not tried.
  r = check(windowFrames(`<div class="app"><main class="card">${MEDIA}${ROW}</main></div>`, { root: ".app" }), "--quick");
  assert.deepEqual(ownWidthOf(r), { candidates: [], notes: ["not tried at 900 and 375 px: the root is the page itself, main or what holds it in the page's body, and a page is laid out by the window"] });
});

// The limit: a text on the page in other words is unmatched, so its entry could carry a collapse with another cause.
// The reworded text is page text the spec lacks, which keeps the frame incomplete until an entry names it.
test("0.46.1: a missing text that is on the page in other words leaves the frame incomplete, whatever it carries", browser, () => {
  const f = smallFrame('<style>main{height:auto}</style><div>Delivery</div><div style="margin-top:12px">SKU</div><div>Title</div>');
  f.write('<main><style>main{height:auto}</style><div style="position:absolute;top:0;left:200px">Soon</div><div>SKU</div><div>Title</div></main>');
  fs.writeFileSync(path.join(f.dir, "ledger.json"), JSON.stringify([{ landmark: "Delivery", property: "presence", category: "missing-state", status: "proposed", reason: "no data for it" }]));
  const r = check(f.dir);
  const frame = r.result.frames[0];
  assert.ok(frame.notes?.some((n) => n.landmark === "SKU" && n.carried), JSON.stringify(frame));
  assert.deepEqual(frame.unexpected, ["Soon"]);
  assert.equal(frame.verdict, "incomplete");
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /page text not in the design \(1\): “Soon”/);
});

test("0.46.1: one entry for one question in every frame is not a broad excuse; four findings in one frame are", () => {
  const frames = ["card-764", "card-601", "card-486", "card-280"].map((frame) => ({ ...withLine(lineShift()), frame }));
  const handoff = renderHandoff({ frames, ledger: [lineEntry()], status: "pending" });
  assert.doesNotMatch(handoff, /## Broad excuses/, handoff);
  assert.match(handoff, /awaits your decision on 4, and carries 24 shifts below the missing text, as notes/);
  const one = { ...compare({ New: { dy: 30 }, Title: { dy: 30 }, SKU: { dy: 30 }, "1 499 €": { dy: 30 } }, { height: 230 }, [{ landmark: ["SKU", "New", "Title", "1 499 €"], property: "y", category: "design-error", status: "proposed", reason: "the frame's padding is off the scale" }]) };
  assert.match(renderHandoff({ frames: [one], ledger: [{ landmark: ["SKU", "New", "Title", "1 499 €"], property: "y", category: "design-error", status: "proposed", reason: "the frame's padding is off the scale" }], status: "pending" }), /## Broad excuses/);
});

// The verifier's probes on 0.46.1's first cut (4a6aada): a carry without evidence, ordinary entries judged by their rest,
// and a wildcard let through as one question per frame.
const accepted = (landmark, extra = {}) => ({ landmark, category: "missing-state", status: "accepted", decidedBy: "owner", reason: "r", ...extra });
const shifted = (spec, f, height = spec.frame.height) => ({ root: { width: spec.frame.width, height }, landmarks: spec.landmarks.map((l, i) => f(l, i)) });
const at = (l, dy = 0) => ({ found: true, align: "left", box: { ...l.box, y: l.box.y + dy } });

test("0.46.1: a missing text carries only what the page shows it moved: the column below it, not a shift in another", () => {
  const spec = { frame: { name: "f", width: 400, height: 200 }, landmarks: [
    { text: "L1", box: box(20, 20, 100, 12) }, { text: "L2", box: box(20, 80, 100, 12) }, { text: "L3", box: box(20, 120, 100, 12) },
    { text: "R1", box: box(250, 20, 100, 12) }, { text: "Badge", box: box(250, 40, 100, 20) }, { text: "R3", box: box(250, 160, 100, 12) }] };
  const ledger = [accepted("Badge", { property: "presence" })];
  // The badge is gone and the right column holds its place; the left column loses 20 px of its own.
  const other = compareFrame({ frame: "f", spec, measured: shifted(spec, (l, i) => (i === 4 ? { found: false } : at(l, i === 1 || i === 2 ? -20 : 0))), ledger });
  assert.equal(other.verdict, "fail", JSON.stringify(other.issues));
  assert.deepEqual(other.issues.filter((i) => i.status === "fail").map((i) => `${i.landmark} ${i.property}`), ["L2 y"]);
  assert.ok(!other.notes?.some((n) => n.carried), JSON.stringify(other.notes));
  // The right column closing up below the badge (by its bound, 20 px and the 20 px to L2) is the evidence; then what
  // passes its place is carried, the left column's too: the limit check.md names.
  const closed = compareFrame({ frame: "f", spec, measured: shifted(spec, (l, i) => (i === 4 ? { found: false } : at(l, i === 5 ? -40 : i === 1 || i === 2 ? -20 : 0))), ledger });
  assert.deepEqual(closed.notes.filter((n) => n.carried).map((n) => n.landmark), ["L2", "L3", "R3"]);
});

test("0.46.1: an ordinary entry excuses a whole offset or none of it, as before; only a carried shift leaves a rest to judge", () => {
  const line = (dy) => (l, i) => at(l, i === 0 ? 0 : i <= 2 ? 20 : dy);
  const entries = [accepted(["SKU", "1 499 €"], { property: "y" })];
  // A y entry on the first row (+20) and the row below 10 px further on its own: a drift of 30, a finding.
  const further = compareFrame({ frame: "f", spec: LINE, measured: shifted(LINE, line(30), 170), ledger: [...entries, accepted("root", { property: "height" })] });
  assert.equal(further.verdict, "fail");
  assert.ok(further.issues.some((i) => i.landmark === "Title" && i.status === "fail"), JSON.stringify(further.issues));
  assert.doesNotMatch(renderSummary({ frames: [further] }), /after the ledger/);
  // The row below 13 px back on its own: 7 px from the design, a note.
  const back = compareFrame({ frame: "f", spec: LINE, measured: shifted(LINE, line(7), 147), ledger: entries });
  assert.equal(back.verdict, "pass", JSON.stringify(back.issues));
});

test("0.46.1: a wildcard entry is counted over every frame for a broad excuse; one naming its landmarks, per frame", () => {
  const spec = { frame: { name: "f", width: 300, height: 200 }, landmarks: [
    { text: "A", box: box(20, 10, 100, 10) }, { text: "B", box: box(20, 60, 100, 10) }, { text: "C", box: box(20, 110, 100, 10) }, { text: "D", box: box(20, 160, 100, 10) }] };
  const page = { root: { width: 300, height: 200 }, landmarks: spec.landmarks.map((l, i) => ({ found: true, align: "left", box: { ...l.box, x: l.box.x + (i < 3 ? 40 + i * 30 : 0) } })) };
  const broad = (landmark) => {
    const ledger = [accepted(landmark, { property: "x", reason: "wild" })];
    const frames = "abcdefgh".split("").map((frame) => ({ ...compareFrame({ frame, spec, measured: page, ledger }), frame }));
    assert.equal(frames[0].issues.length, 3);
    return /## Broad excuses/.test(renderHandoff({ frames, ledger, status: "pass" }));
  };
  assert.equal(broad("*"), true, "3 findings in each of 8 frames: 24");
  assert.equal(broad(["A", "B", "C"]), false, "3 named landmarks in each frame");
});

// ------------------------------------------------------------------ draft 28.2, text: what the evidence and advice say

test("draft 28.2: pending means proposals wait for the owner; a page snapshot used as the spec is named as comparing the page with itself", () => {
  const pending = renderHandoff({ frames: [], status: "pending" });
  assert.match(pending, /^Status: pending — proposals wait for the owner: hand over, naming each$/m);
  const snap = compareFrame({ frame: "card", spec: { ...SPEC, source: "page snapshot" }, measured: measured() });
  assert.match(renderHandoff({ frames: [snap], status: "pass" }), /^- card: pass — no findings.*\n  Its spec is a snapshot of the page \(`design\.mjs snapshot`\): outside a review it compares the page with itself/m);
  assert.doesNotMatch(renderHandoff({ frames: [compare({})], status: "pass" }), /compares the page with itself/);
});

// ------------------------------------------------------------------ 44: the return classes into the checker

// Item 1: a complete check is incomplete until a journey on the consumer's page carries sameAsFresh and takes a
// lifecycle, or design.json gives the reason the product has none.
const LIFECYCLE = /no journey with "sameAsFresh": true runs on the consumer's page: take each lifecycle the product can cause \(mount and unmount, data emptied and refilled, the parent's width changed\) in one, on the page `url` names or a consumer page of its own `url`, or give "lifecycle" in design\.json with the reason the product can cause none/;
const STORY_URL = /no journey with "sameAsFresh": true runs on the consumer's page: .* in one, on a consumer page of its own `url` that no frame or story shows \(the page `url` names draws the frames, a story page\)/;
const UNTAKEN = /the journeys with "sameAsFresh": true on the consumer's page took no lifecycle \(“remounted”\): none of their steps observed changed data in a declared dataFields text expectation, mounted or unmounted the root, or changed its parent's width, and a width step is the window's/;
test("44.1: a complete check is incomplete until a journey on the consumer's page has sameAsFresh and takes a lifecycle, or design.json gives the reason there is none", browser, () => {
  // A button replaces the component root.
  const f = smallFrame('<div id="c"><span>Ready</span></div><button id="again">Again</button><script>document.getElementById("again").onclick = () => { const root = document.querySelector("main"); root.outerHTML = root.outerHTML; };</script>');
  const { lifecycle, ...cfg } = JSON.parse(fs.readFileSync(f.config, "utf8"));
  assert.equal(typeof lifecycle, "string", "the fixtures state their reason");
  for (const name of ["consumer.html", "host.html"]) fs.copyFileSync(f.page, path.join(f.dir, name));
  const run = (config) => { fs.writeFileSync(f.config, JSON.stringify(config)); return check(f.dir); };
  const fresh = (extra = {}) => ({ name: "remounted", sameAsFresh: true, steps: [{ width: 300 }, { click: "#again" }, { visible: "main span" }], ...extra });
  // None: incomplete, and the gap says what to do.
  const none = run(cfg);
  assert.equal(none.status, 2, none.stdout);
  assert.match(none.stdout, LIFECYCLE);
  assert.ok(none.result.gaps.some((g) => LIFECYCLE.test(g)), JSON.stringify(none.result.gaps));
  // A journey without sameAsFresh, or one that says false, is not one.
  assert.equal(run({ ...cfg, journeys: [{ ...fresh(), sameAsFresh: false }] }).status, 2);
  // On the page `url` names, whatever its query, taking a lifecycle: complete; the journey says what it took.
  const taken = run({ ...cfg, journeys: [fresh({ url: "page.html?other" })] });
  assert.equal(taken.status, 0, taken.stdout);
  assert.deepEqual(taken.result.journeys.find((j) => j.name === "remounted").lifecycle, ["mount"]);
  // Before (the verifier of doc 44): a journey that only sets the window's width and sees the component counted.
  const idle = run({ ...cfg, journeys: [fresh({ steps: [{ width: 300 }, { visible: "main" }] })] });
  assert.equal(idle.status, 2, idle.stdout);
  assert.deepEqual(idle.result.journeys[0].lifecycle, []);
  assert.ok(idle.result.gaps.some((g) => UNTAKEN.test(g)), JSON.stringify(idle.result.gaps));
  // The frames on a story page, `url` the consumer: a journey on the story page is not the consumer's; one on `url`,
  // or on a page of its own no frame or story shows, is.
  const story = { ...cfg, url: "consumer.html", frames: cfg.frames.map((fr) => ({ ...fr, url: "page.html" })) };
  assert.match(run({ ...story, journeys: [fresh({ url: "page.html" })] }).stdout, LIFECYCLE);
  assert.equal(run({ ...story, journeys: [fresh()] }).status, 0);
  assert.equal(run({ ...story, journeys: [fresh({ url: "host.html" })] }).status, 0);
  // Before (the verifier): `url` itself a story page, the frames drawn there by a url of their own or by a host, and a
  // journey on it counted. Now only a page of the journey's own that no frame or story shows does.
  for (const onStory of [{ ...cfg, host: "main" }, { ...cfg, host: "main", frames: cfg.frames.map((fr) => ({ ...fr, url: "page.html" })) }]) {
    const r = run({ ...onStory, journeys: [fresh()] });
    assert.equal(r.status, 2, r.stdout);
    assert.ok(r.result.gaps.some((g) => STORY_URL.test(g)), JSON.stringify(r.result.gaps));
    const own = run({ ...onStory, journeys: [fresh({ url: "host.html" })] });
    assert.equal(own.status, 0, own.stdout);
  }
  // An explicit frame URL equal to the inherited one does not change its meaning.
  assert.equal(run({ ...cfg, frames: cfg.frames.map((fr) => ({ ...fr, url: "page.html" })), journeys: [fresh()] }).status, 0);
  // The product has none: "lifecycle" gives the reason, and the handoff prints it for the owner.
  assert.equal(run({ ...cfg, lifecycle: "no data changes: the card renders once" }).status, 0);
  assert.match(fs.readFileSync(path.join(f.dir, "out/handoff.md"), "utf8"), /^- a lifecycle in a journey \(mount and unmount, data emptied and refilled, the parent's width changed\): design\.json says the product can cause none: “no data changes: the card renders once”$/m);
  // Before: "lifecycle": false was the exit, with no reason. Now it, true or an empty reason stops the launch.
  for (const value of [false, true, " "]) {
    const bad = run({ ...cfg, lifecycle: value });
    assert.equal(bad.status, 2);
    assert.match(bad.stderr, /"lifecycle" gives the reason the product can cause no lifecycle, as "static" gives its: "lifecycle": "no data changes: the card renders once"/);
  }
  // A partial check asks for none.
  fs.writeFileSync(f.config, JSON.stringify(cfg));
  assert.doesNotMatch(check(f.dir, "--quick").stdout, LIFECYCLE);
});

test("44.1: only a declared data field with changed text establishes a data lifecycle", browser, () => {
  const f = smallFrame(`<span id="record">Quantity <b>1</b></span><button id="refresh">Refresh</button><button id="tip">Show tip</button><span id="status">Idle</span>
<script>
const record = document.querySelector("#record b"), tip = document.getElementById("tip"), status = document.getElementById("status");
document.getElementById("refresh").onclick = () => { record.textContent = record.textContent === "1" ? "2" : "1"; };
tip.onclick = () => { const popup = document.getElementById("popup"); if (popup) { popup.remove(); tip.textContent = "Show tip"; status.textContent = "Idle"; } else { tip.insertAdjacentHTML("afterend", '<main id="popup">Hint</main>'); tip.textContent = "Hide tip"; status.textContent = "Showing"; } };
</script>`);
  const { lifecycle, ...cfg } = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (steps, dataFields) => { fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "change", sameAsFresh: true, steps, ...(dataFields ? { dataFields } : {}) }] })); return check(f.dir); };
  const tip = run([{ click: "#tip" }, { text: ["#tip", "Hide tip"] }, { text: ["#status", "Showing"] }, { visible: "#popup" }, { click: "#tip" }, { hidden: "#popup" }]);
  assert.equal(tip.status, 2, tip.stdout);
  assert.deepEqual(tip.result.journeys[0].lifecycle, []);
  const steps = [{ click: "#refresh" }, { text: ["#record", "Quantity 2"] }, { click: "#refresh" }, { text: ["#record", "Quantity 1"] }];
  const undeclared = run(steps);
  assert.equal(undeclared.status, 2, undeclared.stdout);
  assert.deepEqual(undeclared.result.journeys[0].lifecycle, []);
  const data = run(steps, ["#record"]);
  assert.equal(data.status, 0, data.stdout);
  assert.deepEqual(data.result.journeys[0].lifecycle, ["data"]);
  const html = fs.readFileSync(f.page, "utf8").replace('record.textContent = record.textContent === "1" ? "2" : "1";', 'record.innerHTML = record.innerHTML;');
  fs.writeFileSync(f.page, html);
  const noop = run([{ click: "#refresh" }, { text: ["#record", "Quantity 1"] }], ["#record"]);
  assert.equal(noop.status, 2, noop.stdout);
  assert.deepEqual(noop.result.journeys[0].lifecycle, []);
});

test("44.1: a data field with multiple matches observes the same elements without guessing identity", browser, () => {
  const f = smallFrame('<div class="number">Quantity 1</div><div class="number" id="n">Quantity 2</div>');
  fs.appendFileSync(f.page, `<button id="change">Change</button><button id="noop">Noop</button><button id="reorder">Reorder</button><button id="swap">Swap</button><button id="replace">Replace</button>
<script>
const rows = () => [...document.querySelectorAll(".number")];
document.getElementById("change").onclick = () => { const n = document.getElementById("n"); n.textContent = n.textContent === "Quantity 2" ? "Quantity 3" : "Quantity 2"; };
document.getElementById("noop").onclick = () => { const n = document.getElementById("n"); n.textContent = n.textContent; };
document.getElementById("reorder").onclick = () => { const [a, b] = rows(); a.before(b); };
document.getElementById("swap").onclick = () => { const [a, b] = rows(), x = a.textContent; a.textContent = b.textContent; b.textContent = x; };
document.getElementById("replace").onclick = () => { const n = document.getElementById("n"), next = n.cloneNode(true); next.textContent = n.textContent === "Quantity 2" ? "Quantity 3" : "Quantity 2"; n.replaceWith(next); };
</script>`);
  const { lifecycle, ...cfg } = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (steps) => { fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { ...cfg.sweep, generate: false }, journeys: [{ name: "rows", sameAsFresh: true, dataFields: [".number"], steps }] })); return check(f.dir); };
  const expect = (value) => ({ text: [".number", value] });
  const clean = run([expect("Quantity 2")]);
  assert.equal(clean.status, 2, clean.stdout);
  assert.deepEqual(clean.result.journeys[0].lifecycle, []);
  const changed = run([{ click: "#change" }, expect("Quantity 3"), { click: "#change" }, expect("Quantity 2")]);
  assert.equal(changed.status, 0, changed.stdout);
  assert.deepEqual(changed.result.journeys[0].lifecycle, ["data"]);
  for (const action of ["noop", "reorder", "swap", "replace"]) {
    const value = action === "replace" ? "Quantity 3" : "Quantity 2";
    const result = run([{ click: `#${action}` }, expect(value), { click: `#${action}` }, expect("Quantity 2")]);
    assert.equal(result.status, 2, `${action}: ${result.stdout}`);
    assert.deepEqual(result.result.journeys[0].lifecycle, [], action);
  }
});

test("44.1: visibility changes of the root count, and losing a choice fails its expectation", browser, () => {
  const f = smallFrame('<span>Ready</span>');
  f.write(`<main><span id="choice">Ready</span></main><button id="toggle">Toggle</button><button id="choose">Choose</button><button id="refresh">Refresh</button>
<script>
const root = document.querySelector("main"), choice = document.getElementById("choice");
document.getElementById("toggle").onclick = () => root.hidden = !root.hidden;
document.getElementById("choose").onclick = () => choice.textContent = "Selected";
document.getElementById("refresh").onclick = () => choice.textContent = "Ready";
</script>`);
  const { lifecycle, ...cfg } = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (steps) => { fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "change", sameAsFresh: true, steps }] })); return check(f.dir, "--no-sweep").result.journeys[0]; };
  const toggled = run([{ click: "#toggle" }, { hidden: "main" }, { click: "#toggle" }, { visible: "main" }]);
  assert.equal(toggled.pass, true, JSON.stringify(toggled));
  assert.deepEqual(toggled.lifecycle, ["mount"]);
  const lost = run([{ click: "#choose" }, { text: ["#choice", "Selected"] }, { click: "#refresh" }, { text: ["#choice", "Selected"] }]);
  assert.equal(lost.pass, false, JSON.stringify(lost));
  assert.match(lost.failed, /Selected/);
});

test("44.1: story host stays on the frame page; consumer journeys use their viewport", browser, () => {
  const f = smallFrame('<span>Ready</span><button id="again">Again</button><script>document.getElementById("again").onclick = () => { const root = document.querySelector("main"); root.outerHTML = root.outerHTML; };</script>');
  const consumer = fs.readFileSync(f.page, "utf8");
  fs.writeFileSync(path.join(f.dir, "consumer.html"), consumer);
  fs.writeFileSync(f.page, consumer.replace("<main>", '<div id="story-host"><main>').replace("</main>", "</main></div>"));
  const { lifecycle, ...cfg } = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const journey = { name: "consumer", url: "consumer.html", sameAsFresh: true, steps: [{ click: "#again" }, { visible: "main span" }] };
  const run = (c) => { fs.writeFileSync(f.config, JSON.stringify(c)); return check(f.dir); };
  const story = { ...cfg, host: "#story-host" };
  const result = run({ ...story, journeys: [journey] });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.deepEqual(result.result.journeys[0].lifecycle, ["mount"]);
  assert.equal(run({ ...story, journeys: [{ ...journey, url: "page.html" }] }).status, 2);
  // Hash and query can render a different route on the same HTML file.
  fs.writeFileSync(f.page, consumer.replace("</main>", `</main><script>if (location.hash !== "#consumer" && location.search !== "?consumer") { const host = document.createElement("div"); host.id = "story-host"; document.body.append(host); host.append(document.querySelector("main")); }</script>`));
  for (const url of ["page.html#consumer", "page.html?consumer"]) {
    const routed = run({ ...story, journeys: [{ ...journey, url, steps: [{ width: 300 }, ...journey.steps] }] });
    assert.equal(routed.status, 0, routed.stdout + routed.stderr);
    assert.deepEqual(routed.result.journeys[0].lifecycle, ["mount"]);
  }
});

test("a journey on a registered sweep URL sizes the host; separate consumer routes and clipped popovers retain their checks", browser, () => {
  const dir = tmp(), config = path.join(dir, "design.json"), story = "page.html?view=dense#story";
  fs.writeFileSync(path.join(dir, "page.html"), `<!doctype html><style>body{margin:0}#host{width:500px}
#tip{position:fixed;left:0;top:-16px;width:40px;height:32px}</style>
<div id="host"><main>Ready<output></output><aside role="tooltip" id="tip" hidden>Tip</aside></main></div>
<script>
if (location.hash === "#consumer" || location.search === "?view=consumer") document.querySelector("#host").removeAttribute("id");
document.onkeydown = (e) => {
  if (e.key === "c") document.querySelector("#tip").hidden = false;
  else document.querySelector("output").textContent = innerWidth + "/" + (document.querySelector("#host")?.clientWidth ?? "none");
};
</script>`);
  const size = (expected) => [{ press: "p" }, { text: ["output", expected] }];
  const journeys = [
    { name: "hosted story", url: story, steps: [...size("700/300"), { width: 400 }, ...size("700/400")] },
    ...["page.html?view=dense#consumer", "page.html?view=consumer#story"].map((url) => ({
      name: url, url, steps: [...size("300/none"), { width: 400 }, ...size("400/none")],
    })),
    { name: "clipped tooltip", url: story, steps: [{ press: "c" }, { visible: "#tip" }] },
  ];
  fs.writeFileSync(config, JSON.stringify({ url: "page.html", root: "main", host: "#host", viewport: 700,
    frames: [{ name: "default", width: 300, spec: "frame.json", reference: "frame.png" }],
    sweep: { from: 300, to: 400, stories: [{ name: "dense", url: story }] }, journeys }));
  const snap = cli("snapshot", config, "--images");
  assert.equal(snap.status, 0, snap.stderr);
  const r = check(dir, "--no-sweep");
  const [hosted, hashConsumer, queryConsumer, clipped] = r.result.journeys;
  for (const j of [hosted, hashConsumer, queryConsumer]) assert.ok(j.pass, JSON.stringify(j));
  assert.match(clipped.failed, /#tip is open but 16 px of it is outside the window/);
});

// Item 1: the parent's width changed by a step (a sidebar opened) is a lifecycle; the window's width is not.
test("44.1: a step that resizes the component's container takes a lifecycle; a width step alone does not", browser, () => {
  const f = smallFrame('<style>main{width:auto;max-width:300px}#col{width:100%}#col.narrow{width:150px}</style><div id="col"><div class="card"><span>Ready</span></div></div><button id="side">Side</button><script>document.getElementById("side").onclick = () => document.getElementById("col").classList.toggle("narrow");</script>');
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const took = (steps) => {
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, root: ".card", journeys: [{ name: "side", sameAsFresh: true, steps }] }));
    return check(f.dir, "--no-sweep").result.journeys.find((j) => j.name === "side").lifecycle;
  };
  assert.deepEqual(took([{ click: "#side" }, { visible: ".card" }, { click: "#side" }, { visible: ".card" }]), ["parent width"]);
  assert.deepEqual(took([{ width: 200 }, { visible: ".card" }, { width: 300 }, { visible: ".card" }]), []);
});

test("a viewport transition completing during a passive expectation cannot supply a parent lifecycle", browser, () => {
  const f = smallFrame();
  f.write(`<style>#column{width:300px;transition:width .6s linear .2s}@media(min-width:400px){#column{width:400px}}</style>
<div id="column"><main><span>Ready</span></main></div><button id="side">Side</button><button id="noop">No change</button>
<script>document.querySelector("#side").onclick = () => document.querySelector("#column").style.width = "380px";</script>`);
  const { lifecycle, ...cfg } = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (extra, first = [{ visible: "main" }]) => {
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "resize", sameAsFresh: true,
      steps: [{ width: 450 }, ...first, ...extra] }] }));
    return check(f.dir).result;
  };
  const viewport = run([]);
  assert.deepEqual(viewport.journeys[0].lifecycle, []);
  assert.ok(viewport.gaps.some((g) => /took no lifecycle/.test(g)), JSON.stringify(viewport.gaps));
  const noop = run([{ click: "#noop" }, { wait: 900 }, { visible: "main" }], []);
  assert.deepEqual(noop.journeys[0].lifecycle, []);
  const byUser = run([{ click: "#side" }, { visible: "main" }]);
  assert.ok(byUser.journeys[0].lifecycle.includes("parent width"), JSON.stringify(byUser.journeys[0]));
});

test("a flex sidebar can resize the column from the viewport or from a control; its decorative loop does neither", browser, () => {
  const f = smallFrame();
  f.write(`<style>.layout{display:flex}.column{flex:1;min-width:0}aside{flex:none;width:0;transition:width .4s linear .3s}
@media(min-width:400px){aside{width:60px}}aside.open{width:90px}
aside{animation:pulse .2s infinite alternate}@keyframes pulse{from{opacity:.8}to{opacity:1}}
main span{display:block;height:12px}</style><div class="layout"><div class="column"><main><span class="a">A</span>
<span class="b">B</span></main></div><aside></aside></div><button id="noop">Nothing</button><button id="side">Side</button>
<script>side.onclick=()=>document.querySelector("aside").classList.toggle("open")</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const atWidth = { width: 450 }, placement = { visible: ".b:below(.a)" };
  const journeys = [
    { name: "no independent resize", sameAsFresh: true, steps: [atWidth, { click: "#noop" }, { wait: 800 }, placement] },
    { name: "sidebar resized", sameAsFresh: true, steps: [atWidth, placement, { click: "#side" }, { wait: 800 }, placement,
      { click: "#side" }, { wait: 800 }, placement] },
  ];
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys }));
  const result = check(f.dir, "--no-sweep").result.journeys;
  const noop = result.find((j) => j.name === journeys[0].name), side = result.find((j) => j.name === journeys[1].name);
  assert.ok(noop.pass, JSON.stringify(noop));
  assert.deepEqual(noop.lifecycle, []);
  assert.ok(side.pass, JSON.stringify(side));
  assert.deepEqual(side.lifecycle, ["parent width"]);
});

test("nested sidebar content sets its intrinsic width; viewport-only, noop and actual toggles stay distinct", browser, () => {
  const f = smallFrame();
  f.write(`<style>.layout{display:flex}.col{flex:1;min-width:0}.sidebar{flex:none}.inner{width:50px;height:10px;transition:width .6s linear .2s}
@media(min-width:400px){.inner{width:150px}}.inner.open{width:200px}main{width:100%}main span{display:block}
.floating{position:absolute}.contained{contain:size;height:0;overflow:hidden}.decoration{height:1px;animation:pulse 20s linear infinite}
.spinner{display:inline-block;animation:spin 20s linear infinite}@keyframes spin{to{transform:rotate(1turn)}}
@keyframes pulse{from{width:1px}to{width:100px}}</style>
<div class="layout"><div class="col"><main><span class="a">One</span><span class="b">Two</span></main></div>
<aside class="sidebar"><div><div class="inner"></div><b class="spinner">*</b></div>
<div class="floating"><div class="decoration"></div></div><div class="contained"><div class="decoration"></div></div></aside></div>
<button id="noop">No change</button><button id="side">Side</button>
<script>side.onclick=()=>document.querySelector(".inner").classList.toggle("open")</script>`);
  const { frames, root, url } = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const cfg = { url, root, frames, static: "one reference" };
  fs.writeFileSync(f.config, JSON.stringify(cfg));
  const snap = cli("snapshot", f.config, "--images", "--force");
  assert.equal(snap.status, 0, snap.stderr);
  const placement = { visible: ".b:below(.a)" }, relax = { wait: 900 };
  const viewport = (after) => [{ width: 450 }, ...after, relax, placement, { width: 300 }, relax, placement];
  const cases = [
    ["viewport only", viewport([]), 2, []],
    ["viewport and noop", viewport([{ click: "#noop" }]), 2, []],
    ["real side change", [{ click: "#side" }, relax, placement, { click: "#side" }, relax, placement], 0, ["parent width"]],
  ];
  for (const [name, steps, status, lifecycle] of cases) {
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name, steps, sameAsFresh: true }] }));
    const r = check(f.dir);
    assert.equal(r.status, status, r.stdout);
    assert.ok(r.result.journeys[0].pass, JSON.stringify(r.result.journeys[0]));
    assert.deepEqual(r.result.journeys[0].lifecycle, lifecycle);
    if (status === 2) assert.match(r.result.gaps.join(" "), /took no lifecycle/);
  }
});

// A list a button empties and restores; its row stacks below 400 px by a ResizeObserver. `disconnect`: the observer
// lets go of the row leaving; `rewatch`: the row mounted again is observed.
function listPage({ disconnect, rewatch }) {
  const f = smallFrame(`<style>main{width:auto;max-width:600px;height:auto}.row{display:flex;gap:8px}.row[data-mode=stack]{flex-direction:column}</style>
<div id="host"></div><button id="toggle">Toggle</button>
<script>const host = document.getElementById("host"); let shown = true, observer;
const render = () => { ${disconnect ? "observer?.disconnect(); " : ""}host.innerHTML = shown ? '<div class="row" data-mode="line"><span>Ready</span><span>Steady</span></div>' : "<p>None</p>"; };
const watch = () => { const row = host.querySelector(".row"); if (row) (observer = new ResizeObserver(() => { row.dataset.mode = row.clientWidth < 400 ? "stack" : "line"; })).observe(row); };
render(); watch();
document.getElementById("toggle").onclick = () => { shown = !shown; render(); ${rewatch ? "watch();" : ""} };</script>`, [{ name: "wide", width: 500 }, { name: "narrow", width: 320 }]);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  return (journey) => {
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "emptied and restored", steps: [{ click: "#toggle" }, { visible: "main p" }, { click: "#toggle" }, { visible: ".row" }], ...journey }] }));
    return check(f.dir, "--no-sweep").result.journeys.find((j) => j.name === "emptied and restored");
  };
}

test("44.1: after a sameAsFresh journey the check resizes the page through the frames' widths, each held against a fresh load", browser, () => {
  // The restored row is not observed: at the journey's width (500) it is drawn as fresh; resized to 320 it stays a line.
  const once = listPage({ disconnect: true, rewatch: false })({ sameAsFresh: true });
  assert.equal(once.pass, false, JSON.stringify(once));
  assert.match(once.failed, /^after its steps and a resize to 320 px, the component differs from a fresh load at 320 px: /);
  const kept = listPage({ disconnect: true, rewatch: true })({ sameAsFresh: true });
  assert.ok(kept.pass, JSON.stringify(kept));
  assert.deepEqual(kept.asFresh, [500, 320], "the journey's own width, then each other frame's");
  // Without sameAsFresh, nothing is resized.
  const plain = listPage({ disconnect: true, rewatch: false })({});
  assert.ok(plain.pass && !plain.asFresh, JSON.stringify(plain));
});

// Item 3: ResizeObserver and matchMedia are wrapped in an init script on the checked pages.
const KEPT = "after its steps, a ResizeObserver still observes an element removed from the page: disconnect it on unmount, or give its reason";
test("44.3: an observer left on an element a journey removed is a construct note, not a finding; the layout it keeps fails the fresh comparison", browser, () => {
  // Before (the verifier): this failed the journey. The restored row is observed again, so the layout is right at
  // every width; the old observer still holds the old row: a note that needs its reason.
  const stale = listPage({ disconnect: false, rewatch: true })({});
  assert.ok(stale.pass, JSON.stringify(stale));
  assert.deepEqual(stale.issues, [{ landmark: "div.row", property: "construct", kind: "stale observer", status: "note", actual: KEPT }]);
  assert.ok(!listPage({ disconnect: true, rewatch: true })({}).issues);
  // The behaviour it hints at, the restored row never observed, is the fresh comparison's (item 1).
  const lost = listPage({ disconnect: false, rewatch: false })({ sameAsFresh: true });
  assert.equal(lost.pass, false, JSON.stringify(lost));
  assert.match(lost.failed, /^after its steps and a resize to 320 px, the component differs from a fresh load at 320 px: /);
  const journey = (body, steps) => {
    const f = smallFrame(body);
    const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "j", steps }] }));
    return check(f.dir, "--no-sweep").result.journeys.find((j) => j.name === "j");
  };
  // Before (the verifier): a keep-alive tab pane, detached and cached with its observer, failed; so did a cleanup
  // deferred 150 ms. Both hold, with the note.
  const tabs = `<div id="host"></div><button id="a">A</button><button id="b">B</button><style>.row{display:flex}.row[data-mode=stack]{flex-direction:column}</style>
<script>const host = document.getElementById("host"); const A = document.createElement("div"); A.className = "row pa"; A.innerHTML = "<span>Ready</span>";
const B = document.createElement("p"); B.className = "pb"; B.textContent = "Other";
new ResizeObserver(() => { A.dataset.mode = A.clientWidth < 200 ? "stack" : "line"; }).observe(A);
const show = (el) => host.replaceChildren(el); show(A); document.getElementById("a").onclick = () => show(A); document.getElementById("b").onclick = () => show(B);</script>`;
  for (const j of [journey(tabs, [{ click: "#b" }, { visible: ".pb" }, { hidden: ".pa" }]),
    journey(`<div id="host"></div><button id="toggle">Toggle</button><script>const host = document.getElementById("host"); let ob;
host.innerHTML = '<div class="row"><span>Ready</span></div>'; (ob = new ResizeObserver(() => {})).observe(host.firstChild);
document.getElementById("toggle").onclick = () => { const o = ob; host.innerHTML = "<p>None</p>"; setTimeout(() => o.disconnect(), 150); };</script>`, [{ click: "#toggle" }, { visible: "main p" }, { hidden: ".row" }])]) {
    assert.ok(j.pass, JSON.stringify(j));
    assert.deepEqual(j.issues?.map((i) => [i.kind, i.status, i.actual]), [["stale observer", "note", KEPT]], JSON.stringify(j));
  }
  // An observer on an element outside the component is not the component's.
  assert.ok(!journey(`<button id="drop">Drop</button><script>const aside = document.createElement("aside"); aside.textContent = "x"; document.body.append(aside);
new ResizeObserver(() => {}).observe(aside); document.getElementById("drop").onclick = () => aside.remove();</script>`, [{ click: "#drop" }, { hidden: "aside" }]).issues);
  // Before (the verifier, on check.md's "an element the steps removed"): an element the page itself removed while it
  // loaded counted as one the steps removed. Only what the steps remove counts.
  const early = journey(`<button id="noop">Noop</button><script>const r = document.createElement("div"); r.textContent = "x"; document.querySelector("main").append(r);
new ResizeObserver(() => {}).observe(r); r.remove();</script>`, [{ click: "#noop" }, { visible: "#noop" }]);
  assert.ok(early.pass && !early.issues, JSON.stringify(early));
});

test("44.3: a mode a ResizeObserver or a matchMedia change listener sets is a construct note that needs its reason; a one-shot read or a container query's is not", browser, () => {
  const modes = (script, style = "", sweep = {}) => {
    const f = smallFrame(`<style>.row{display:flex}${style}</style><div class="row"><span>Ready</span></div>${script ? `<script>const row = document.querySelector(".row");${script}</script>` : ""}`);
    const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { ...cfg.sweep, ...sweep } }));
    const r = check(f.dir);
    assert.equal(r.status, 0, r.stdout);
    // The frames' page; its dense story is the same page, with the same note.
    return r.result.sweep.issues.filter((i) => i.kind === "script-set mode" && !i.story).map((i) => [i.landmark, i.status, i.actual]);
  };
  // Before (the verifier): "switch it by a container query instead", wrong for a fit to content.
  const fits = "if it decides the layout, switch it by a container query; if it fits content, give its reason";
  assert.deepEqual(modes('new ResizeObserver(() => { row.dataset.mode = row.clientWidth < 400 ? "stack" : "line"; }).observe(row);'),
    [["Ready", "note", `a ResizeObserver callback sets its data-mode: ${fits}`]]);
  // A change listener, fired as the sweep crosses 400 px.
  assert.deepEqual(modes('const q = matchMedia("(min-width: 400px)"); const lay = () => { row.dataset.mode = q.matches ? "line" : "stack"; }; lay(); q.addEventListener("change", lay);', "", { to: 500, step: 100 }),
    [["Ready", "note", `a matchMedia("(min-width: 400px)") listener sets its data-mode: ${fits}`]]);
  // Before (the verifier): a one-shot read named the next class a script set as its mode. The component's own width
  // (item 2) shows a layout a read picks.
  assert.deepEqual(modes('window.isDesktop = matchMedia("(min-width: 1024px)").matches; row.classList.add("is-ready");'), []);
  assert.deepEqual(modes("", "main{container-type:inline-size}@container (width < 400px){.row{flex-direction:column}}"), []);
  // A query that is not the window's size decides no layout mode.
  assert.deepEqual(modes('row.classList.toggle("calm", matchMedia("(prefers-reduced-motion: reduce)").matches);'), []);
});

test("MediaQueryList.onchange keeps the callback the page assigned and removes it on null", browser, () => {
  const f = smallFrame(`<style>body{width:300px}</style><output>waiting</output><script>
const q = matchMedia("(min-width: 400px)"), out = document.querySelector("output");
function replaced() { out.textContent = "replaced callback ran"; }
function current(event) {
  if (this !== q || event.target !== q || event.type !== "change") return;
  if (q.onchange !== current) { out.textContent = "callback identity lost"; return; }
  q.onchange = null;
  out.textContent = q.onchange === null ? "clean" : "cleanup failed";
  if (!q.matches) out.textContent = "called after cleanup";
}
q.onchange = replaced;
if (q.onchange === replaced) q.onchange = current;
</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "change and clean up", steps: [
    { width: 450 }, { text: ["output", "clean"] }, { width: 300 }, { text: ["output", "clean"] },
  ] }] }));
  const result = check(f.dir, "--no-sweep").result.journeys[0];
  assert.ok(result.pass, JSON.stringify(result));
});

// The catalogue card's reference build, with the design.json a builder following the skill writes (research note 35):
// frames on the story page sized by the host, journeys on the consumer page.
function catalogueLifecycleArm(change = (js) => js) {
  const arm = path.join(tmp(), "arm");
  assert.equal(spawnSync(process.execPath, [path.join(CATALOGUE, "make-arm.mjs"), arm], { encoding: "utf8" }).status, 0);
  fs.writeFileSync(path.join(arm, "card.js"), change(fs.readFileSync(path.join(CATALOGUE, "reference/card.js"), "utf8")));
  fs.copyFileSync(path.join(CATALOGUE, "reference/card.css"), path.join(arm, "card.css"));
  const dir = path.join(arm, "check");
  fs.mkdirSync(dir);
  const frame = (name, width, extra = {}) => ({ name, width, spec: `../design/${name}/spec.json`, reference: `../design/${name}/reference.png`, ...extra });
  const list = { name: "list: emptied by the search and restored, the cards come back", url: "../index.html", sameAsFresh: true, steps: [
    { width: 375 }, { fill: ["#q", "zzz"] }, { hidden: ".card" }, { visible: ".empty" }, { fill: ["#q", ""] }, { visible: ".card" }, { hidden: ".empty" }] };
  fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify({ url: "../story.html", root: ".card", host: "#host", viewport: 1280,
    frames: [frame("card-764", 764), frame("card-375", 375), frame("size-chosen-375", 375, { setup: [{ click: ".card .size:nth-child(2)" }] })],
    sweep: { from: 320, to: 900, step: 40, switches: [640], stories: [{ name: "dense", url: "../story.html?data=dense" }, { name: "many", url: "../story.html?data=many" }] },
    journeys: [
      { name: "sheet: Details opens it, Close closes it", url: "../index.html", steps: [{ width: 375 }, { click: ".card .details" }, { visible: "#sheet" }, { click: ".sheet__close" }, { hidden: "#sheet" }] },
      list,
      { name: "sidebar: Filters opens it beside the list and closes it", url: "../index.html", sameAsFresh: true, steps: [{ width: 960 }, { click: "#filters" }, { visible: "#sidebar" }, compactCard, { click: "#filters" }, { hidden: "#sidebar" }, wideCard] }] }));
  fs.writeFileSync(path.join(dir, "deviations.json"), "[]");
  fs.writeFileSync(path.join(dir, "review.md"), "## Acceptance\n\n- frames: pass — the check\n");
  return dir;
}

test("44, controls: the catalogue card's absent target is incomplete; its observers left on removed cards are a note", browser, () => {
  const ref = check(catalogueLifecycleArm());
  // As before the change: every frame, the sweep and the journeys hold.
  assert.deepEqual([...ref.result.frames.flatMap((f) => f.issues), ...ref.result.sweep.issues].filter((i) => i.status === "fail"), [], ref.stdout);
  assert.ok(ref.result.journeys.every((j) => j.pass), JSON.stringify(ref.result.journeys.filter((j) => !j.pass)));
  // The story omits the target; without acting there the check cannot know whether it is mounted lazily.
  assert.deepEqual(ref.result.gaps, ["1 control opens something with no journey that opens and closes it: “Details”"]);
  assert.equal(ref.status, 2, ref.stdout);
  // Its two sameAsFresh journeys were resized through the frames' widths; its observer-set layout is a note.
  assert.deepEqual(ref.result.journeys.filter((j) => j.asFresh).map((j) => j.asFresh), [[375, 764, 375], [960, 764, 375]]);
  assert.ok(ref.result.sweep.issues.some((i) => i.kind === "script-set mode" && i.status === "note" && /^a ResizeObserver callback sets its data-layout/.test(i.actual)), JSON.stringify(ref.result.sweep.issues));
  // The list journey on the consumer page took its lifecycle: the cards unmounted and mounted again.
  assert.ok(ref.result.journeys.find((j) => j.name.startsWith("list:")).lifecycle.includes("mount"), JSON.stringify(ref.result.journeys));
  const edit = (js, from, to) => { assert.equal(js.split(from).length, 2, from); return js.replace(from, to); };
  const unwatch = "    for (const card of host.querySelectorAll(\".card\")) unwatch(card);\n";
  // The cards leaving keep their observers, and the cards mounted are observed: the layout is right, so it is a
  // construct note on the list journey. Before (the verifier of doc 44): it failed the journey.
  const kept = check(catalogueLifecycleArm((js) => edit(js, unwatch, "")), "--no-sweep");
  assert.ok(kept.result.journeys.every((j) => j.pass), JSON.stringify(kept.result.journeys.filter((j) => !j.pass)));
  assert.deepEqual(kept.result.journeys.filter((j) => j.issues).map((j) => [j.name, j.issues.map((i) => [i.landmark, i.status, i.actual])]), [["list: emptied by the search and restored, the cards come back",
    [["article.card", "note", "after its steps, a ResizeObserver still observes 3 elements removed from the page: disconnect it on unmount, or give its reason"]]]]);
  // The class where the cards mounted again are not observed is the fresh comparison's: the stateful bench's
  // stale-observer and 44.3's list page. Not here: the consumer page's host grows to fill its row (flex: 1), so the
  // journey's width steps and the resizes after it leave the cards at the row's width.
});

// E159: a one-digit landmark, the stock count "1", with the same digit inside a longer text drawn above it; two "HDD"
// beside "4 TB" for labels that do repeat.
const STOCK = ({ stock = 16, whole = false, order = "row" } = {}) => `<main style="position:relative;width:420px;height:90px;font:14px/18px sans-serif;color:#111">
<div style="position:absolute;left:16px;top:12px">Выдача за 1 день</div>
<div style="position:absolute;left:16px;top:40px;display:flex;gap:40px;flex-direction:${order}"><span>HDD</span><span>4 TB</span><span>HDD</span></div>
<div style="position:absolute;right:${stock}px;top:64px">${whole ? "Доступно 1" : "<span>Доступно</span> <span>1</span>"}</div></main>`;

test("doc 44, item 7 (E159): a text no other landmark repeats is the hit nearest its box, not the same digit inside a longer text; repeated labels pair by place", browser, () => {
  // Before, the "1" was paired with the delivery line's (x -307, y -51) and its own was page text not in the design.
  let r = boxCase(STOCK(), STOCK(), 420);
  assert.deepEqual(r.spec.landmarks.map((l) => l.text), ["Выдача за 1 день", "HDD", "4 TB", "HDD", "Доступно", "1"]);
  assert.equal(r.frame.verdict, "pass", r.stdout);
  // The page in one text node, "Доступно 1", where the design draws two pieces; the labels in another DOM order.
  for (const page of [STOCK({ whole: true }), STOCK({ order: "row-reverse" })]) {
    r = boxCase(STOCK(), page, 420);
    assert.equal(r.frame.verdict, "pass", r.stdout);
  }
  // A "1" that is displaced still fails, with its label.
  r = boxCase(STOCK(), STOCK({ stock: 76 }), 420);
  const moved = r.frame.issues.filter((i) => i.status === "fail" && i.property === "x");
  assert.deepEqual(moved.map((i) => i.landmark), ["Доступно", "1"], r.stdout);
  assert.ok(moved.every((i) => i.delta <= -50), JSON.stringify(moved));
  assert.deepEqual(r.frame.unexpected, []);
});

test("doc 44, item 7 (E159): on the prebuilt planted card with its delivery line rendered at 486, the stock's “1” is its own", browser, () => {
  const deliver = (dir) => {
    const arm = path.dirname(path.dirname(dir));
    const edit = (file, from, to) => { const f = path.join(arm, file), s = fs.readFileSync(f, "utf8"); assert.ok(s.includes(from), file); fs.writeFileSync(f, s.replace(from, to)); };
    edit("data.js", '"card-486": { id: "o-486",', '"card-486": { id: "o-486", delivery: "Выдача за 1 день",');
    edit("card.js", "return `<div class=\"card__grid\">", 'return `${o.delivery ? `<div class="delivery t-caption">${esc(o.delivery)}</div>` : ""}<div class="card__grid">');
    return dir;
  };
  // Before: "1" x -352 and y -212, paired with the delivery line's "1", and the stock's own "1" was page text not in
  // the design.
  let f = check(deliver(plantedArm()), "--frame", "card-486").result.frames[0];
  assert.deepEqual(f.issues.filter((i) => i.landmark === "1"), [], JSON.stringify(f.issues));
  assert.deepEqual(f.unexpected, []);
  // The stock 60 px from its place: its "1" goes with it, a finding.
  f = check(deliver(plantedArm('.card[data-mode="narrow"] .stock { margin-inline-end: 60px; }')), "--frame", "card-486").result.frames[0];
  const one = f.issues.find((i) => i.landmark === "1" && i.property === "x");
  assert.ok(one?.status === "fail" && one.delta <= -50, JSON.stringify(f.issues));
});


// ------------------------------------------------------------------ 44, item 8: the component's width inside a journey

// A page whose Filters button opens a 200 px sidebar beside the component's column (16 px of padding each side, a
// 16 px gap). The component is a row of two texts that stacks below 360 px: by a container query on its column
// (`own`), by a media query on the window that takes the column for the window less its padding (`window`), or once,
// from its own width on load (`once`). With `stacked` the sidebar stacks above the column below 600 px. `#more` adds a
// text to the row; `#wide` puts a 2000 px block on the page.
function sidebarPage({ mode = "own", stacked = false } = {}) {
  const f = smallFrame();
  const switched = { own: ".col{container-type:inline-size}@container (width < 360px){.row{flex-direction:column}}",
    window: "@media (max-width: 391px){.row{flex-direction:column}}", once: "main[data-mode=stack] .row{flex-direction:column}" }[mode];
  f.write(`<style>.page{display:flex;gap:16px;padding:0 16px}aside{flex:0 0 200px}aside[hidden]{display:none}.col{flex:1 1 auto;min-width:0}
main{width:auto;height:auto}.row{display:flex;gap:8px}${switched}${stacked ? "@media (max-width: 599px){.page{flex-direction:column}aside{flex:none}}" : ""}</style>
<button id="filters">Filters</button><button id="more">More</button><button id="wide">Wide</button>
<div class="page"><aside id="sidebar" hidden>Filters</aside><div class="col"><main><div class="row"><span>Ready</span><span>Steady</span></div></main></div></div>
<script>const main = document.querySelector("main"), sidebar = document.getElementById("sidebar");
${mode === "once" ? 'main.dataset.mode = main.clientWidth < 360 ? "stack" : "line";' : ""}
document.getElementById("filters").onclick = () => { sidebar.hidden = !sidebar.hidden; };
document.getElementById("more").onclick = () => main.querySelector(".row").insertAdjacentHTML("beforeend", "<span>Go</span>");
document.getElementById("wide").onclick = () => document.body.insertAdjacentHTML("beforeend", '<div style="width:2000px;height:1px"></div>');</script>`);
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  return (...steps) => {
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "sidebar", steps }] }));
    return check(f.dir, "--no-sweep").result.journeys.find((j) => j.name === "sidebar");
  };
}
const OPEN = [{ click: "#filters" }, { visible: "#sidebar" }];
const compactCard = { visible: ".card:first-child .sizes:below(.card:first-child .card__main)" };
const wideCard = { visible: ".card:first-child .sizes:right-of(.card:first-child .card__main)" };

test("44.8: after each step, a container narrower than at the sweep's from, or a page that starts to scroll sideways, fails the step", browser, () => {
  // At 400 px the column is 368 px; the sidebar leaves it 152, and a fresh load gives it 268 at the sweep's 300.
  const squeezed = sidebarPage()({ width: 400 }, ...OPEN);
  assert.equal(squeezed.pass, false, JSON.stringify(squeezed));
  assert.equal(squeezed.failed, 'step 2, {"click":"#filters"}: after it the component\'s container is 152 px wide (368 before), narrower than the 268 px measured on a fresh page at the sweep\'s starting width, 300 px: what it opened takes the component\'s room; check the supported minimum and the consumer\'s behavior against their source');
  // Stacked above the column there, the sidebar leaves it its width; below the sweep start nothing is held.
  const stacked = sidebarPage({ stacked: true })({ width: 400 }, ...OPEN);
  assert.ok(stacked.pass, JSON.stringify(stacked));
  assert.match(stacked.notes.join(" "), /368 px: layout was not measured/);
  assert.ok(sidebarPage()({ width: 280 }, ...OPEN).pass);
  const wide = sidebarPage()({ click: "#wide" }, { visible: "main" });
  assert.equal(wide.pass, false, JSON.stringify(wide));
  assert.match(wide.failed, /^step 1, \{"click":"#wide"\}: after it the page scrolls sideways, its content \d+ px wider than the window: keep what it opened inside the window, beside or over the component$/);
});

test("44.8: a width change and the open sidebar are checked in their own states", browser, () => {
  // At 600 px the column is 568; with the sidebar open, 352. A fresh load with its column held at 352 stacks the row.
  const stack = { visible: ".row span:last-child:below(.row span:first-child)" };
  const line = { visible: ".row span:last-child:right-of(.row span:first-child)" };
  const journey = [{ width: 600 }, line, ...OPEN, stack, { click: "#filters" }, { hidden: "#sidebar" }, line];
  const own = sidebarPage()(...journey);
  assert.ok(own.pass, JSON.stringify(own));
  assert.match(own.notes.join(" "), /568 px.*right-of/);
  assert.match(own.notes.join(" "), /352 px.*below/);
  // Bound to the window, the row stays on one line in the narrowed column.
  const bound = sidebarPage({ mode: "window" })(...journey);
  assert.equal(bound.pass, false, JSON.stringify(bound));
  assert.match(bound.failed, /no .*:below\(.* is visible/);
  // Chosen once on load, at the frame's 268 px, it stays stacked when the window widens.
  const once = sidebarPage({ mode: "once" })(...journey);
  assert.match(once.failed, /no .*:right-of\(.* is visible/);
  // The same interaction without a placement expectation cannot establish the state of the narrowed row.
  for (const steps of [[{ width: 600 }, ...OPEN], [{ width: 600 }, { click: "#more" }, ...OPEN]]) {
    const other = sidebarPage({ mode: "window" })(...steps);
    assert.equal(other.pass, false);
    assert.match(other.unmeasured, /352 px.*no established equivalent state/);
    assert.equal(other.failed, undefined);
  }
});

test("expanding a chart checks its specified height at the narrowed width, or reports the missing comparison", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (expands, expectation) => {
    f.write(`<style>#host{width:300px}main{width:100%;height:auto}#chart{height:40px;background:#ddd}
.axis{position:absolute;top:135px;width:1px;height:1px}.legend{display:block}</style>
<div id="host"><main><div id="chart"></div><span class="legend">Chart</span><i class="axis"></i><button id="expand">Expand</button></main></div>
<script>document.querySelector("#expand").onclick=()=>{
document.querySelector("#host").style.width="250px";document.querySelector("#chart").style.height="${expands ? 140 : 40}px";
};</script>`);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, sweep: { ...cfg.sweep, from: 200 },
      journeys: [{ name: "expanded", steps: [{ click: "#expand" }, expectation] }] }));
    const snap = cli("snapshot", f.config, "--images", "--force");
    assert.equal(snap.status, 0, snap.stderr);
    return check(f.dir, "--no-sweep");
  };
  const placement = { visible: ".legend:below(.axis)" };
  const clean = run(true, placement);
  assert.equal(clean.status, 0, clean.stdout);
  assert.match(clean.result.journeys[0].notes.join(" "), /250 px.*below/);
  const broken = run(false, placement);
  assert.equal(broken.status, 1);
  assert.match(broken.result.journeys[0].failed, /no .legend:below.* is visible/);
  for (const expands of [false, true]) {
    const unknown = run(expands, { visible: "#chart" });
    assert.equal(unknown.status, 2, unknown.stdout);
    assert.match(unknown.result.journeys[0].unmeasured, /250 px.*no established equivalent state/);
    assert.equal(unknown.result.journeys[0].failed, undefined);
  }
});

test("44.8: a container collapsed to no width, or a root clipped from view, is not held to the floor; the root measured is the one the journey started with", browser, () => {
  const f = smallFrame();
  const cfg = JSON.parse(fs.readFileSync(f.config, "utf8"));
  const run = (html, steps) => {
    f.write(html);
    fs.writeFileSync(f.config, JSON.stringify({ ...cfg, journeys: [{ name: "j", steps }] }));
    return check(f.dir, "--no-sweep").result.journeys.find((j) => j.name === "j");
  };
  // Before (the verifier of doc 44): a panel collapsed to width 0 with its overflow hidden, around the component that
  // keeps its 300 px, failed: "the component's container is 0 px wide (300 before), narrower than the 300 px".
  const panel = run(`<button id="b" onclick="p.classList.toggle('shut')">Panel</button><style>#p{overflow:hidden}#p.shut{width:0}</style><div id="p"><main><span>Ready</span></main></div><p class="o">Other</p>`,
    [{ click: "#b" }, { visible: ".o" }, { click: "#b" }, { visible: "main" }]);
  assert.equal(panel.failed, undefined, JSON.stringify(panel));
  // Before: a tab that hides the component and shows a second one in a 240 px column measured the second, the first
  // a person sees, and failed it as squeezed.
  const tab = run(`<button id="b" onclick="p.hidden=!p.hidden;q.hidden=!q.hidden">Tab</button><div id="p"><main><span>Ready</span></main></div><div id="q" hidden style="width:240px"><main style="width:auto"><span>Ready</span></main><p class="o">Other</p></div>`,
    [{ click: "#b" }, { visible: ".o" }, { click: "#b" }, { hidden: ".o" }]);
  assert.equal(tab.failed, undefined, JSON.stringify(tab));
});

// The catalogue page sized by the window, its sidebar opened at 960 px, where it leaves the list 632 px. Before item 8
// both builds held this journey: the start code keeps the wide layout matchMedia picks from the 960 px window.
function catalogueSidebarArm(build) {
  const dir = catalogueArm(build);
  const frames = [["card-764", 796], ["card-375", 407]].map(([name, width]) => ({ name, width,
    spec: path.join(CATALOGUE, "pack", name, "spec.json"), reference: path.join(CATALOGUE, "pack", name, "reference.png") }));
  fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify({ url: "index.html", root: ".card", frames, sweep: { from: 407, to: 1280 },
    journeys: [{ name: "sidebar: Filters opens it beside the list and closes it", steps: [{ width: 960 }, ...OPEN, compactCard, { click: "#filters" }, { hidden: "#sidebar" }, wideCard] }] }));
  return dir;
}

test("44.8, controls: the catalogue's start code fails its sidebar journey where the sidebar opens; the reference holds", browser, () => {
  const sidebar = "sidebar: Filters opens it beside the list and closes it";
  const start = check(catalogueSidebarArm("start"), "--no-sweep").result.journeys.find((j) => j.name === sidebar);
  assert.equal(start.pass, false, JSON.stringify(start));
  assert.match(start.failed, /no .*:below\(.* is visible/);
  const ref = check(catalogueSidebarArm("reference"), "--no-sweep");
  assert.deepEqual(ref.result.journeys.filter((j) => !j.pass), [], ref.stdout);
  assert.match(ref.result.journeys.find((j) => j.name === sidebar).notes.join(" "), /632 px: checked the placement .*:below/);
});

// ------------------------------------------------------------------ 44, item 9: an opener covered on another page

test("44.9: the story page's Details, whose sheet is only on the consumer's page, is not covered there by a same-named opener of another role or target", browser, () => {
  // The twins of the catalogue's reference arm: the story page's Details shares its text
  // with the consumer's, which the sheet's journey opens and closes, but not its role or its target.
  const twin = (attr, value) => {
    const dir = catalogueLifecycleArm();
    const story = path.join(dir, "../story.html"), render = '  renderCards(host, window.CATALOGUE[params.get("data") || "default"]);\n';
    const html = fs.readFileSync(story, "utf8");
    assert.equal(html.split(render).length, 2);
    fs.writeFileSync(story, html.replace(render, `${render}  for (const b of host.querySelectorAll(".details")) b.setAttribute("${attr}", "${value}");\n`));
    // What decides the cover only: the frames, the sheet's journey and a sweep of the frames' widths.
    const file = path.join(dir, "design.json"), c = JSON.parse(fs.readFileSync(file, "utf8"));
    fs.writeFileSync(file, JSON.stringify({ ...c, lifecycle: "a fixture: one render, no data changes", sweep: { ...c.sweep, from: 375, to: 764, step: 389, switches: [] }, journeys: [c.journeys[0]] }));
    return check(dir);
  };
  for (const [attr, value] of [["role", "link"], ["aria-controls", "notes"]]) {
    const r = twin(attr, value);
    const sheet = r.result.journeys.find((j) => j.name === "sheet: Details opens it, Close closes it");
    assert.ok(sheet.pass && sheet.closers.some((c) => c.name === "Details" && c.role === "button" && c.ids.join() === "sheet"), JSON.stringify(sheet));
    assert.ok(r.result.gaps.includes("1 control opens something with no journey that opens and closes it: “Details”"), `${attr}: ${JSON.stringify(r.result.gaps)}`);
    assert.ok(!r.result.journeys.some((j) => j.notes?.some((n) => n.startsWith("covers"))), JSON.stringify(r.result.journeys));
    assert.equal(r.status, 2, r.stdout);
  }
});

test("44.9: an absent target is not evidence of cross-page identity", browser, () => {
  // Page a mounts the sheet only on open ({open && <Sheet/>}), and its journey opens and closes it. Page b shows the
  // same card with the same Details opener, and `b` is its script.
  const card = `<div class="wrap"><div class="card"><span>Title here</span><button class="d" aria-expanded="false" aria-controls="sheet">Details</button>${MARKERS}</div></div>`;
  const mounts = `<script>const b = document.querySelector(".d"); b.onclick = () => { let s = document.getElementById("sheet");
if (s) { s.remove(); b.setAttribute("aria-expanded", "false"); } else { s = document.createElement("div"); s.id = "sheet"; s.textContent = "Sheet"; document.body.append(s); b.setAttribute("aria-expanded", "true"); } };</script>`;
  const run = (b) => {
    const dir = tmp(), config = path.join(dir, "design.json");
    const page = (html) => `<!doctype html><style>body{margin:0}.card{font:16px/20px monospace;background:#fff;display:flex;gap:8px}#sheet{position:fixed;left:20px;top:100px;background:#eee}</style>${html}`;
    fs.writeFileSync(path.join(dir, "a.html"), page(card + mounts));
    fs.writeFileSync(path.join(dir, "b.html"), page(card + b));
    fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
    fs.writeFileSync(config, JSON.stringify({ url: "a.html", root: ".card", ledger: "ledger.json", lifecycle: "a fixture: one render, no data changes",
      frames: [{ name: "a", width: 600, spec: "a.json", reference: "a.png" }, { name: "b", width: 600, url: "b.html", spec: "b.json", reference: "b.png" }],
      sweep: { from: 600, to: 600, stories: [{ name: "dense", url: "a.html?dense" }], lines: LINES },
      journeys: [{ name: "details", steps: [{ click: ".d" }, { visible: "#sheet" }, { click: ".d" }, { hidden: "#sheet" }] }] }));
    const snap = cli("snapshot", config, "--images");
    assert.equal(snap.status, 0, snap.stderr);
    return check(dir).result;
  };
  const gap = "1 control opens something with no journey that opens and closes it: “Details”";
  // Before (the verifier of doc 44): its target absent until a click, b's opener was covered by a's journey, also
  // where its handler throws (the consumer forgot the sheet's provider) or mounts the sheet as a's does.
  for (const [what, b] of [["throws", '<script>document.querySelector(".d").onclick = () => { throw new Error("no sheet provider"); };</script>'], ["mounts its target", mounts]]) {
    const r = run(b);
    assert.deepEqual(r.gaps, [gap], `${what}: ${JSON.stringify(r.gaps)}`);
    assert.ok(!r.journeys.some((j) => j.notes?.some((n) => n.startsWith("covers"))), `${what}: ${JSON.stringify(r.journeys)}`);
  }
  // Even an inert page cannot be classified without the unconfigured action.
  const r = run("");
  assert.deepEqual(r.gaps, [gap], JSON.stringify(r.gaps));
  assert.ok(!r.journeys.some((j) => j.notes?.some((n) => n.startsWith("covers"))));
});

test("44.9: an absent target remains unchecked regardless of what a click would do", browser, () => {
  // None of these possible effects can be observed without an explicit action on page b.
  const card = (x = "") => `<div class="wrap"><div class="card"><span>Title here</span><button class="d" aria-expanded="false" aria-controls="sheet">Details</button>${x}${MARKERS}</div></div>`;
  const css = ".card{font:16px/20px monospace;background:#fff;display:flex;gap:8px}#sheet{position:fixed;left:20px;top:100px;background:#eee}.tip{display:none;position:absolute}.d:focus+.tip{display:block}";
  const mounts = `<script>const b = document.querySelector(".d"); b.onclick = () => { let s = document.getElementById("sheet");
if (s) { s.remove(); b.setAttribute("aria-expanded", "false"); } else { s = document.createElement("div"); s.id = "sheet"; s.textContent = "Sheet"; document.body.append(s); b.setAttribute("aria-expanded", "true"); } };</script>`;
  const run = (b) => {
    const dir = tmp(), config = path.join(dir, "design.json");
    const page = (html) => `<!doctype html><style>body{margin:0}${css}</style>${html}`;
    fs.writeFileSync(path.join(dir, "a.html"), page(card() + mounts));
    fs.writeFileSync(path.join(dir, "b.html"), page(b));
    fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
    fs.writeFileSync(config, JSON.stringify({ url: "a.html", root: ".card", ledger: "ledger.json", lifecycle: "a fixture: one render, no data changes",
      frames: [{ name: "a", width: 600, spec: "a.json", reference: "a.png" }, { name: "b", width: 600, url: "b.html", spec: "b.json", reference: "b.png" }],
      sweep: { from: 600, to: 600, stories: [{ name: "dense", url: "a.html?dense" }], lines: LINES },
      journeys: [{ name: "details", steps: [{ click: ".d" }, { visible: "#sheet" }, { click: ".d" }, { hidden: "#sheet" }] }] }));
    const snap = cli("snapshot", config, "--images");
    assert.equal(snap.status, 0, snap.stderr);
    return check(dir).result;
  };
  const gap = ["1 control opens something with no journey that opens and closes it: “Details”"];
  for (const [what, b] of [["a :focus tooltip inside the root", card('<span class="tip">More about it</span>')],
    ["a callback log outside the root", card() + '<pre id="log"></pre><script>document.querySelector(".d").onclick = () => { log.textContent += "onDetails()\\n"; };</script>']]) {
    const r = run(b);
    assert.deepEqual(r.gaps, gap, `${what}: ${JSON.stringify(r.gaps)}`);
    assert.ok(!r.journeys.some((j) => j.notes?.some((n) => n.startsWith("covers"))), what);
  }
  // A dialog it would open is likewise unknown.
  const r = run(card() + '<script>document.querySelector(".d").onclick = () => { const d = document.createElement("div"); d.setAttribute("role", "dialog"); d.textContent = "Other"; document.body.append(d); };</script>');
  assert.deepEqual(r.gaps, ["1 control opens something with no journey that opens and closes it: “Details”"], JSON.stringify(r.gaps));
});

test("44.8: a window-bound component below the fold still fails its expected placement", browser, () => {
  // An app shell (`height:100vh; overflow:auto`) with the card below the fold: the card is scrolled out of view, not
  // gone. Before, it counted as unseen and a card squeezed by the sidebar, laid out by the window, passed.
  const dir = tmp(), config = path.join(dir, "design.json");
  fs.writeFileSync(path.join(dir, "page.html"), `<!doctype html><style>body{margin:0}html,body{height:100%}.shell{height:100vh;overflow:auto}
.page{display:flex}.side{width:0;overflow:hidden;flex:none}.page.open .side{width:300px}.col{flex:1;min-width:0}
.card{font:16px/20px monospace;background:#fff;display:flex;gap:8px}.thumb{width:200px;height:40px;background:#ccc;flex:none}.card{position:relative}.limit{position:absolute;left:150px;width:1px;height:1px}
@media (max-width:800px){.thumb{width:100px}}</style>
<div class="shell"><button id="tog" onclick="document.querySelector('.page').classList.toggle('open')">Filters</button><div style="height:3000px"></div>
<div class="page"><aside class="side"><p class="f">Filter</p></aside><div class="col"><div class="card"><div class="thumb"></div><i class="limit"></i><span class="t">Title here</span>${MARKERS}</div></div></div></div>`);
  fs.writeFileSync(path.join(dir, "review.md"), REVIEW);
  fs.writeFileSync(config, JSON.stringify({ url: "page.html", root: ".card", ledger: "ledger.json", lifecycle: "a fixture: one render, no data changes",
    frames: [{ name: "narrow", width: 400, spec: "0.json", reference: "0.png" }, { name: "wide", width: 1000, spec: "1.json", reference: "1.png" }],
    sweep: { from: 400, to: 1000, step: 100, stories: [{ name: "dense", url: "page.html?dense" }], lines: LINES },
    journeys: [{ name: "filters", steps: [{ click: "#tog" }, { visible: ".f" }, { visible: ".thumb:left-of(.limit)" }, { click: "#tog" }, { hidden: ".f" }] }] }));
  const snap = cli("snapshot", config, "--images");
  assert.equal(snap.status, 0, snap.stderr);
  const j = check(dir, "--no-sweep").result.journeys.find((x) => x.name === "filters");
  assert.equal(j.pass, false, JSON.stringify(j));
  assert.match(j.failed, /no .thumb:left-of.* is visible/);
});

// A second consumer, unrelated to the catalogue's selectors: a dock narrows a canvas, and a separate refresh
// journey can independently lose a chosen value. Both pages use the same inputs, viewport and action sequence.
function blockerConsumer() {
  const f = smallFrame();
  const page = (dock, losesChoice) => `<style>body{margin:0}.workspace{display:flex;width:100%}.dock{flex:0 0 ${dock}px}.dock[hidden]{display:none}
.stage{flex:1 1 auto;min-width:0}main{width:100%;height:80px}.choice{white-space:nowrap}</style>
<button id="dock-toggle">Dock</button><button id="refresh-view">Refresh</button>
<div class="workspace"><aside class="dock" hidden>Panel</aside><div class="stage"><main><span>Document</span>
<button id="select-choice">Choose</button><span class="choice">none</span></main></div></div>
<script>document.querySelector('#dock-toggle').onclick=()=>{const d=document.querySelector('.dock');d.hidden=!d.hidden};
document.querySelector('#select-choice').onclick=()=>{document.querySelector('.choice').textContent='selected'};
document.querySelector('#refresh-view').onclick=()=>{if(${losesChoice})document.querySelector('.choice').textContent='none'};</script>`;
  f.write(page(170, false));
  fs.copyFileSync(f.page, path.join(f.dir, 'original.html'));
  const original = fs.readFileSync(f.page, 'utf8');
  const config = JSON.parse(fs.readFileSync(f.config, 'utf8'));
  const squeeze = { name: 'open dock', width: 400, steps: [{ click: '#dock-toggle' }, { visible: '.dock' }] };
  const selection = { name: 'choice survives refresh', steps: [{ click: '#select-choice' }, { text: ['.choice', 'selected'] },
    { click: '#refresh-view' }, { text: ['.choice', 'selected'] }] };
  fs.writeFileSync(f.config, JSON.stringify({ ...config, url: 'original.html' }));
  const snap = cli('snapshot', f.config, '--images', '--force');
  assert.equal(snap.status, 0, snap.stderr);
  const run = ({ url = 'page.html', dock = 170, losesChoice = false, order = [squeeze, selection], minimum = 'unknown', baselineMissing = false, ledger = [], flags = [] } = {}) => {
    f.write(page(dock, losesChoice));
    const source = minimum === 'unknown' ? 'supported minimum: unknown; no owner or contract source' : `supported minimum: ${minimum} px; contract.md`;
    fs.writeFileSync(path.join(f.dir, 'contract.md'), minimum === 'unknown' ? 'No minimum supplied.\n' : `Supported component minimum: ${minimum} px.\n`);
    if (baselineMissing) fs.rmSync(path.join(f.dir, 'original.html'));
    fs.writeFileSync(path.join(f.dir, 'review.md'), REVIEW + `\n## External blocker\n\nopen dock: measured ${400 - dock} px; sweep start: 300 px in design.json; ${source}; baseline comparison not recorded, attribution unknown. The consumer page is outside the edit boundary.\n`);
    fs.writeFileSync(path.join(f.dir, 'ledger.json'), JSON.stringify(ledger));
    fs.writeFileSync(f.config, JSON.stringify({ ...config, url, journeys: order }));
    const result = check(f.dir, ...flags);
    if (!baselineMissing) assert.equal(fs.readFileSync(path.join(f.dir, 'original.html'), 'utf8'), original);
    return result;
  };
  return { ...f, run, squeeze, selection };
}

test('an external blocker preserves the measured failure across original and changed consumers', browser, () => {
  const f = blockerConsumer();
  const original = f.run({ url: 'original.html' });
  const same = f.run();
  const worsened = f.run({ dock: 210 });
  const failure = (r) => r.result.journeys.find((j) => j.name === 'open dock');
  for (const r of [original, same, worsened]) {
    assert.equal(r.status, 1, r.stdout);
    assert.equal(r.result.status, 'fail');
    assert.equal(r.result.pass, false);
    assert.match(r.stdout, /sweep's starting width, 300 px/);
    assert.doesNotMatch(failure(r).failed, /narrowest supported width/);
  }
  assert.match(failure(original).failed, /230 px wide/);
  assert.match(failure(same).failed, /230 px wide/);
  assert.match(failure(worsened).failed, /190 px wide/);
  assert.ok(same.result.journeys.find((j) => j.name === 'choice survives refresh').pass);
  assert.match(fs.readFileSync(path.join(f.dir, 'out/handoff.md'), 'utf8'), /^Status: fail —/);
});

test('a separate choice regression stays visible with an external blocker in either journey order', browser, () => {
  const f = blockerConsumer();
  for (const order of [[f.squeeze, f.selection], [f.selection, f.squeeze]]) {
    const r = f.run({ losesChoice: true, order });
    assert.equal(r.status, 1, r.stdout);
    assert.equal(r.result.status, 'fail');
    const dock = r.result.journeys.find((j) => j.name === 'open dock');
    const choice = r.result.journeys.find((j) => j.name === 'choice survives refresh');
    assert.match(dock.failed, /230 px wide/);
    assert.match(choice.failed, /no visible .* shows “selected”/);
    assert.match(r.stdout, /journey fails: .*open dock/);
    assert.match(r.stdout, /journey fails: .*choice survives refresh/);
    assert.match(fs.readFileSync(path.join(f.dir, 'out/handoff.md'), 'utf8'), /^Status: fail —/);
  }
});

test('an external journey cannot be converted to pending by an unclassified ledger entry', browser, () => {
  const f = blockerConsumer();
  const r = f.run({ ledger: [{ landmark: 'open dock', property: 'journey', status: 'proposed', reason: 'the page is outside the edit scope' }] });
  assert.equal(r.status, 1, r.stdout);
  assert.equal(r.result.status, 'fail');
  assert.match(r.result.ledgerProblems.join(' '), /a journey entry disputes a journey the check itself breaks/);
  assert.equal(r.result.journeys.find((j) => j.name === 'open dock').status, undefined);
});

test('invalid journey entries do not mark a failed journey, and a valid checker-tagged entry still matches', browser, () => {
  const f = blockerConsumer();
  const invalid = { landmark: 'open dock', property: 'journey', status: 'proposed', reason: 'outside the edit scope' };
  const valid = { ...invalid, cause: 'checker', reason: 'synthetic checker-tagged entry; this case tests matching only' };
  const acceptedWithoutOwner = { ...valid, status: 'accepted' };
  let r = f.run({ ledger: [acceptedWithoutOwner] });
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.result.ledgerProblems.join(' '), /an accepted entry names who decided it/);
  assert.equal(r.result.journeys.find((j) => j.name === 'open dock').status, undefined);
  r = f.run({ ledger: [invalid, valid] });
  assert.equal(r.status, 1, r.stdout); // the invalid entry is still a fault
  assert.equal(r.result.journeys.find((j) => j.name === 'open dock').status, 'pending');
  assert.deepEqual(r.result.journeys.find((j) => j.name === 'open dock').entries, [1]);
  r = f.run({ ledger: [valid] });
  assert.equal(r.status, 3, r.stdout);
  assert.equal(r.result.journeys.find((j) => j.name === 'open dock').status, 'pending');
  assert.deepEqual(r.result.ledgerProblems, []);
  // A valid owner-accepted wildcard has always matched journeys without a checker tag; preserve that behavior.
  const wildcard = { landmark: '*', property: '*', status: 'accepted', decidedBy: 'fixture owner', reason: 'synthetic owner decision' };
  r = f.run({ ledger: [wildcard] });
  assert.deepEqual(r.result.ledgerProblems, []);
  assert.equal(r.result.journeys.find((j) => j.name === 'open dock').status, 'accepted');
});

test('an unavailable baseline leaves attribution unknown and does not turn failure into pending', browser, () => {
  const f = blockerConsumer();
  const r = f.run({ baselineMissing: true });
  assert.equal(r.status, 1, r.stdout);
  assert.equal(r.result.status, 'fail');
  assert.match(r.result.journeys.find((j) => j.name === 'open dock').failed, /230 px wide/);
  assert.match(fs.readFileSync(path.join(f.dir, 'review.md'), 'utf8'), /baseline comparison not recorded, attribution unknown/);
  assert.match(fs.readFileSync(path.join(f.dir, 'out/handoff.md'), 'utf8'), /^Status: fail —/);
});

test('a test width does not establish an unknown or sourced product minimum; partial checks stay partial', browser, () => {
  const f = blockerConsumer();
  for (const minimum of ['unknown', 280]) {
    const r = f.run({ minimum });
    assert.equal(r.status, 1, r.stdout);
    const fail = r.result.journeys.find((j) => j.name === 'open dock');
    assert.match(fail.failed, /sweep's starting width, 300 px/);
    assert.doesNotMatch(fail.failed, /narrowest supported width/);
    const review = fs.readFileSync(path.join(f.dir, 'review.md'), 'utf8');
    assert.ok(review.includes(minimum === 'unknown' ? 'minimum: unknown' : '280 px; contract.md'));
    assert.match(fs.readFileSync(path.join(f.dir, 'out/handoff.md'), 'utf8'), /^Status: fail —/);
  }
  for (const flags of [['--quick'], ['--frame', 'frame'], ['--no-sweep']]) {
    const r = f.run({ flags });
    assert.match(r.stdout, /partial check/i);
    assert.ok(!fs.existsSync(path.join(f.dir, 'out/handoff.md')), flags.join(' '));
  }
});

test('the catalogue judge labels its card scope without changing the historic verdict and groups', browser, () => {
  const judge = path.join(CATALOGUE, 'judge/judge.mjs');
  const cases = [
    { name: 'reference', verdict: 'ACCEPTED', groups: { width: true, choice: true, basics: true } },
    { name: 'start', verdict: 'RETURNED', groups: { width: false, choice: false, basics: false } },
    { name: 'width only', verdict: 'RETURNED', groups: { width: false, choice: true, basics: true },
      from: 'card.dataset.layout = width >= WIDE ? "wide" : "compact"',
      to: 'card.dataset.layout = matchMedia("(min-width: 672px)").matches ? "wide" : "compact"' },
    { name: 'choice only', verdict: 'RETURNED', groups: { width: true, choice: false, basics: true },
      from: 'window.renderCards = function renderCards(host, items) {',
      to: 'window.renderCards = function renderCards(host, items) { chosen.clear();' },
  ];
  for (const c of cases) {
    const arm = catalogueArm(c.name === 'start' ? 'start' : 'reference'), out = path.join(tmp(), 'judge');
    if (c.from) {
      const file = path.join(arm, 'card.js'), source = fs.readFileSync(file, 'utf8');
      assert.equal(source.split(c.from).length, 2, c.name);
      fs.writeFileSync(file, source.replace(c.from, c.to));
    }
    const r = spawnSync(process.execPath, [judge, arm, out], { encoding: 'utf8', timeout: 120000 });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, new RegExp(`^${c.verdict} · width `));
    assert.match(r.stdout, /Scope: card contract only; consumer status: see the complete check's handoff; owner decision: see the existing verdict form, unknown if not recorded/);
    const result = JSON.parse(fs.readFileSync(path.join(out, 'judge.json'), 'utf8'));
    assert.equal(result.verdict, c.verdict, c.name);
    assert.deepEqual(Object.keys(result), ['verdict', 'groups', 'checks']);
    assert.deepEqual(Object.keys(result.groups), ['width', 'choice', 'basics']);
    assert.deepEqual(result.groups, c.groups, c.name);
    assert.equal(result.checks.length, 18);
    if (c.name === 'reference') assert.ok(result.checks.every((x) => x.pass), JSON.stringify(result));
  }
});

test('the review brief distinguishes the selected test width from an independently sourced minimum', () => {
  const file = path.join(HERE, '../plugin/skills/design-to-code/references/review-pass.md');
  const page = fs.readFileSync(file, 'utf8'), prompt = page.split('```text\n')[1]?.split('\n```')[0];
  assert.ok(prompt, 'the actual reviewer prompt exists');
  assert.match(prompt, /product contract or owner requirement for the component's minimum width: <source path, or unknown>/);
  assert.match(prompt, /sweep\.from.*test width/);
  assert.match(prompt, /if no source is available, say unknown/);
  assert.match(prompt, /Do not treat the builder's selected test width or\n  assertions as independently verified product requirements/);
  assert.match(page, /do not\s+give it `review\.md`'s reasons, the ledger's reasons or your notes/i);
});
