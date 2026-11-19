// The review page as plugins/entrust/plugin/skills/review/scripts/page.mjs writes it: one standalone file with its
// runtime (page/runtime.js) and styles (page/page.css) inline, the record as a JSON island, and each file's diff once,
// as rows in a <noscript> that the runtime reads back. Run it after an edit to page.mjs, page/, highlight.mjs or the
// data the page carries; review-page-browser.test.mjs drives the page itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { page } from "../plugin/skills/review/scripts/page.mjs";
import { check, modelOf } from "../plugin/skills/review/scripts/review.mjs";
import { parseDiff } from "../plugin/skills/review/scripts/diff.mjs";
import { createSyntax } from "../plugin/skills/review/scripts/highlight.mjs";
import { decisionRuntime } from "../plugin/skills/review/scripts/decisions.mjs";
import { CATALOGS } from "../plugin/skills/review/scripts/labels.mjs";
import { prepare } from "./review/prepare.mjs";
import { reportFixtures, hostileFixture, HOSTILE_PATH } from "./review/report-fixtures.mjs";

const SCRIPTS = new URL("../plugin/skills/review/scripts/", import.meta.url);
const RUNTIME = fileURLToPath(new URL("page/runtime.js", SCRIPTS)), CSS = fs.readFileSync(new URL("page/page.css", SCRIPTS), "utf8");
const { run } = prepare("currency-contract", "clean");
const diffText = spawnSync("git", ["-c", "core.quotepath=off", "diff", "--no-color", "--no-ext-diff", "--no-renames", "-U3", "HEAD~1..HEAD", "--"], { cwd: `${run}/repo`, encoding: "utf8" }).stdout;
const { THEMED } = reportFixtures(createHash("sha256").update(diffText).digest("hex"));
// The two pictures the record names, beside it: one pixel each.
for (const name of ["before.png", "after.png"]) fs.writeFileSync(`${run}/${name}`, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64"));
// Shiki's syntax knows lines by identity: a render with it draws the files it was built from.
const draw = (record, diff, options, files = parseDiff(diff)) => {
  const { errors, owner } = check(record, files, run);
  assert.deepEqual(errors, []);
  const model = modelOf(record, files, owner, run);
  return { html: page(record, files, model, options), files, model };
};
const islandOf = (html) => JSON.parse(html.match(/<script type="application\/json" id="data">(.*?)<\/script>/s)[1]);
const markupOf = (html) => html.replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/<style>[\s\S]*?<\/style>/, "");

test("the runtime is a file Node can parse, and the page hands it decisions.mjs's runtime whole", () => {
  const parsed = spawnSync(process.execPath, ["--check", RUNTIME], { encoding: "utf8" });
  assert.equal(parsed.status, 0, parsed.stderr);
  const { html } = draw(THEMED, diffText), source = fs.readFileSync(RUNTIME, "utf8").trim();
  assert.ok(html.includes(`${source}(${decisionRuntime.toString()});`), "the page does not call its runtime with the decision runtime");
  assert.equal(html.split(decisionRuntime.toString()).length, 2, "the decision runtime is in the page other than once");
});

test("the page is standalone: inline styles and scripts, nothing loaded or linked, the record's language and its catalog", () => {
  for (const language of ["en", "ru-RU"]) {
    const { html } = draw({ ...structuredClone(THEMED), language }, diffText), island = islandOf(html);
    assert.match(html, new RegExp(`^<!doctype html>\\n<html lang="${language}">`));
    assert.doesNotMatch(markupOf(html), /\bsrc="(?!data:image\/)|<link\b|@import|url\(|href="(?!#)/);
    assert.doesNotMatch(html, /<script\b[^>]*\bsrc=/);
    assert.deepEqual(island.labels, CATALOGS[language.startsWith("ru") ? "ru" : "en"]);
    assert.ok(html.includes(CSS), "the stylesheet is not inline whole");
  }
});

test("each file's code is in the page once, in its <noscript>, as rows the runtime reads back to the diff and its blocks", () => {
  const { html, files, model } = draw(THEMED, diffText), runtime = fs.readFileSync(RUNTIME, "utf8");
  // The shape page.mjs writes and runtime.js reads: a hunk opens with <tbody>, a row carries its numbers in data-r.
  const ROW = String.raw`/^<tr class="r [cad]" data-r="(\d),(\d*),(\d*),(\d*),(\d+)">/`;
  assert.ok(runtime.includes(ROW) && runtime.includes('if (line === "<tbody>")'), "the runtime no longer reads the shape this test checks");
  const rowRe = new RegExp(ROW.slice(1, -1));
  files.forEach((file, fi) => {
    const text = html.match(new RegExp(`<noscript id="code-${fi}">([\\s\\S]*?)</noscript>`))?.[1];
    assert.ok(text, `file ${fi} has no <noscript>`);
    const hunks = [];
    for (const line of text.split("\n")) {
      if (line === "<tbody>") { hunks.push([]); continue; }
      const m = rowRe.exec(line);
      if (m) hunks.at(-1).push(m.slice(1, 5).map((v) => v === "" ? null : +v));
    }
    assert.deepEqual(hunks.map((h) => h.map((r) => r.slice(0, 3))), file.hunks.map((h) => h.map((l) => [{ ctx: 0, add: 1, del: 2 }[l.kind], l.old ?? null, l.new ?? null])),
      `file ${file.path}: the rows differ from the diff`);
    // A changed line keeps the block that owns it; a blank one nobody owns is drawn with the block around it, if any.
    file.hunks.forEach((h, hi) => h.forEach((l, li) => {
      const owner = l.kind === "ctx" ? undefined : model.owner.get(`${file.path}\n${l.kind === "add" ? "+" + l.new : "-" + l.old}`);
      if (owner !== undefined) assert.equal(hunks[hi][li][3], owner + 1, `${file.path} ${l.kind} ${l.old ?? l.new}: block`);
      else if (l.kind === "ctx") assert.equal(hunks[hi][li][3], null);
    }));
  });
  // The island carries the record, never the code: no line of the diff and no token markup is in it.
  const island = JSON.stringify(islandOf(html));
  assert.doesNotMatch(island, /class=\\"t/);
  for (const line of files.flatMap((f) => f.hunks.flat()).filter((l) => l.text.trim().length > 12)) assert.ok(!island.includes(JSON.stringify(line.text).slice(1, -1)), `the island carries code: ${line.text}`);
});

test("texts reach the page as text: markup in a title, a question or a path stays escaped in the markup and the island", () => {
  const { diff, record } = hostileFixture(), { html } = draw(record, diff), island = islandOf(html);
  assert.equal(island.questions[0].text, record.questions[0].text);
  assert.equal(island.files[0].path, record.blocks[0].path);
  assert.doesNotMatch(html, /<img src=x|<source>/);
  assert.ok(markupOf(html).includes("<title>Ревью кода: Hostile &lt;source&gt;</title>") && markupOf(html).includes(`<h3>${HOSTILE_PATH}</h3>`));
});

test("token colours are classes with a rule for each theme, and each holds 4.5:1 on the page's code backgrounds", async () => {
  const files = parseDiff(diffText), syntax = await createSyntax(files);
  assert.ok(syntax, "the vendored Shiki bundle did not load");
  const { html } = draw(THEMED, diffText, { syntax }, files);
  assert.doesNotMatch(html.match(/<noscript[\s\S]*<\/noscript>/)[0], /style="/, "a code row carries an inline style");
  const used = new Set([...html.matchAll(/<span class="(t\d+)">/g)].map((m) => m[1]));
  assert.ok(used.size >= 5, `too few token classes to judge: ${used.size}`);
  // The backgrounds page.css gives code, added and removed rows, light and dark.
  const tokens = (block) => ["--code-bg", "--add-bg", "--del-bg"].map((name) => block.match(new RegExp(`${name}: (#[0-9a-f]{6})`))[1]);
  const light = tokens(CSS.slice(CSS.indexOf(":root {"))), dark = tokens(CSS.slice(CSS.indexOf(':root[data-theme="dark"]')));
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
  const ratio = (a, b) => { const x = lum(rgb(a)), y = lum(rgb(b)); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  for (const name of used) {
    const lightColor = html.match(new RegExp(`\\.${name}\\{color:(#[0-9a-f]{6})`))?.[1];
    const darkColor = html.match(new RegExp(`:root\\[data-theme="dark"\\] \\.${name}\\{color:(#[0-9a-f]{6})`))?.[1];
    assert.ok(lightColor && darkColor && html.includes(`:root:not([data-theme="light"]) .${name}{color:${darkColor}}`), `${name} lacks a rule for a theme`);
    for (const bg of light) assert.ok(ratio(lightColor, bg) >= 4.5, `${name} ${lightColor} on ${bg}: ${ratio(lightColor, bg).toFixed(2)}`);
    for (const bg of dark) assert.ok(ratio(darkColor, bg) >= 4.5, `${name} ${darkColor} on ${bg}: ${ratio(darkColor, bg).toFixed(2)}`);
  }
});

test("the island carries what the runtime reads from the model: the kept blocks the check warns about, purposes and digests", () => {
  const record = structuredClone(THEMED);
  record.blocks[0].serves = [3];
  const { html, model } = draw(record, diffText), island = islandOf(html);
  assert.deepEqual(island.unasked, { unlinked: [], assumed: [1] });
  assert.deepEqual(island.unasked, model.unasked);
  assert.deepEqual(island.purposeCounts, model.purpose.counts);
  assert.equal(island.digest.diff, THEMED.diff.sha256);
  assert.equal(island.digest.key, model.key);
});

test("without JavaScript the page is the whole report: the summary, every decision card as text, each file's diff with every block's verdict, and the details", () => {
  const { html, model } = draw(THEMED, diffText), island = islandOf(html);
  const part = (id) => html.match(new RegExp(`<noscript id="${id}">([\\s\\S]*?)</noscript>`))?.[1] ?? "";
  const report = part("static-report"), details = part("static-details");
  for (const text of ["The change does its task.", "One test is missing.", "Accept it.", "Add the test.", "Upper case wherever a price is shown.", "How the list draws it."])
    assert.ok(report.includes(text), `the summary lacks «${text}»`);
  // Every item is a card under the id its deep link names, and a decision's card carries its variants with their consequences.
  for (const key of ["q1", "q2", "q3", "q4", "q5", "f1", "f2", "i1"]) assert.equal(report.split(`id="decisions/${key}"`).length, 2, `card ${key}`);
  const q3 = report.split('id="decisions/q3"')[1].split("</article>")[0];
  for (const v of THEMED.questions[2].variants) assert.ok(q3.includes(v.text) && v.consequences.every((x) => q3.includes(x.text)), `Q3 lacks the variant ${v.id} or its consequences`);
  assert.ok(q3.includes(THEMED.questions[2].recommendation.text) && q3.includes(THEMED.questions[2].context[0].text));
  assert.ok(report.split('id="decisions/q4"')[1].includes("Move it to a display unit"), "the child does not say under which variant of its parent it applies");
  // Every block's verdict stands before its first line, in its file's diff.
  for (const b of model.blocks) {
    const fi = model.blockFile[b.id], line = part(`code-${fi}`).match(new RegExp(`<tr class="bn v-${b.verdict}" id="code/b${b.id}">.*`))?.[0];
    assert.ok(line?.includes(`<b>${CATALOGS.en[`verdict.${b.verdict}`].toLowerCase()}</b>`), `B${b.id} has no verdict line`);
  }
  for (const text of ["The archive reader converts the code.", "readArchive", "The reader should not convert.", "Open the list.", "The list", "The suite ran on the working copy.", THEMED.diff.sha256])
    assert.ok(details.includes(text), `the details lack «${text}»`);
  // A picture given as a file is in the page once, in the document.
  const pixel = /data:image\/png;base64,[A-Za-z0-9+/=]+/.exec(details)[0];
  assert.equal(html.split(pixel).length, 3, "the two one-pixel pictures are not each in the page once");
  assert.ok(island.screens[0].pictures.every((p) => !("data" in p)));
});

// The budget protects what every page carries besides its diff, and what a large diff costs. Every page carries the
// runtime (about 170 KB), its styles (about 50 KB), the decision runtime, the catalog and the record's data and
// document: 285 KB for the themed record when this budget was set, so 320 KB leaves room to grow and fails on a second
// copy of any of them. A large diff costs its rows: each row's markup besides its highlighted code, its block's line
// and its file's frame included, is about 112 bytes, so 120 fails on a second copy of the code or on heavier rows. The 274-block record's page was 6.6 MB before the
// redesign, 2.6 MB in the prototype and 2.9 MB here; the generated record below is 1.9 MB.
test("the page stays within its budget: 320 KB besides the diff's code, and at most 120 bytes of markup per row besides its code", () => {
  const overhead = (html) => html.length - [...html.matchAll(/<noscript id="code-\d+">[\s\S]*?<\/noscript>/g)].reduce((sum, m) => sum + m[0].length, 0);
  const { html } = draw(THEMED, diffText);
  assert.ok(overhead(html) <= 320 * 1024, `the themed page carries ${overhead(html)} bytes besides its code`);
  // 40 files of 180 added lines in 240 blocks.
  const FILES = 40, LINES = 180;
  const diff = Array.from({ length: FILES }, (_, f) => [`diff --git a/src/m${f}/part${f}.js b/src/m${f}/part${f}.js`, "new file mode 100644", "--- /dev/null", `+++ b/src/m${f}/part${f}.js`,
    `@@ -0,0 +1,${LINES} @@`, ...Array.from({ length: LINES }, (_, i) => `+export const value${f}_${i} = ${f * 1000 + i};`)].join("\n")).join("\n") + "\n";
  const blocks = Array.from({ length: FILES * 6 }, (_, k) => ({ path: `src/m${Math.floor(k / 6)}/part${Math.floor(k / 6)}.js`, added: `${(k % 6) * 30 + 1}-${(k % 6) * 30 + 30}`,
    does: `Part ${k % 6}.`, serves: [1], verdict: k % 23 === 5 ? "fix" : "keep", ...(k % 23 === 5 ? { findings: [1] } : {}) }));
  const large = { title: "Large", range: "generated", language: "en", diff: { file: "large.diff", sha256: createHash("sha256").update(diff).digest("hex") },
    change: { goal: "Modules.", parts: ["Forty."], sources: ["generated"] }, verdict: "Generated.", now: "Now.", target: "Target.", recommendation: "Read it.",
    requirements: [{ id: 1, text: "Every module exports.", source: "task", met: "read" }], blocks, challenges: [], coverage: "Generated.",
    findings: [{ id: 1, title: "A finding", direction: "behavior", evidence: "read", at: "src/m1/part1.js:1", what: "What.", shown_by: "The line.", fix: "Fix." }] };
  const big = draw(large, diff).html;
  let rows = 0, code = 0, markup = 0;
  for (const [file] of big.matchAll(/<noscript id="code-\d+">[\s\S]*?<\/noscript>/g)) {
    markup += file.length;
    for (const m of file.matchAll(/<td class="cd">(.*)<\/td><\/tr>$/gm)) { rows++; code += m[1].length; }
  }
  assert.equal(rows, FILES * LINES);
  assert.ok((markup - code) / rows <= 120, `${((markup - code) / rows).toFixed(1)} bytes of markup per row besides its code`);
  assert.ok(big.length <= 2 * 1024 * 1024, `the large page is ${big.length} bytes`);
});
