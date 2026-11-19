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

// A rule for a class nothing writes is dead text that drifts from the page; a class the code builds from a prefix and
// a value (s-${verdict}, t-${kind}) counts by its prefix.
test("every class the stylesheet styles is one the page, its document, its highlighter or its runtime writes", () => {
  const css = CSS.replace(/\/\*[\s\S]*?\*\//g, ""), source = ["page/runtime.js", "page/document.mjs", "page.mjs", "highlight.mjs"].map((name) => fs.readFileSync(new URL(name, SCRIPTS), "utf8")).join("\n");
  const built = [...source.matchAll(/([a-z][\w-]*-)\$\{/g)].map((m) => m[1]);
  const styled = [...new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]))];
  assert.deepEqual(styled.filter((name) => !new RegExp(`(?<![\\w-])${name}(?![\\w-])`).test(source) && !built.some((prefix) => name.startsWith(prefix))), []);
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

// A guard against a second copy, not a size target. Every page carries one runtime (174 KB), the decision runtime
// (13 KB), one stylesheet (53 KB), one catalog with the record's data (39 KB for the themed record) and the document
// without JavaScript (9 KB): 287 KB besides the code for the themed record when this guard was set. Each is checked to
// be there once, and 320 KB is what a second copy of the styles, the runtime or the data crosses. The code is there
// once too, in its file's <noscript>: a row's markup besides its code — its numbers and classes, with its block's
// verdict line and its file's frame shared out — came to 118 bytes on the mixed diff below and 117 on the 274-block
// record's real one (7,213 rows, a 2.9 MB page) when this guard was set; 130 is what a second copy of a row's code or
// a heavier row crosses.
// The document only words what the model found; a renderer that derives a state or a count itself drifts from the
// page and the printout. The themed record's requirements take all four states, and a unit gets blocks to keep and to fix.
test("without JavaScript each requirement's state and each unit's lines by verdict are the model's, in words", () => {
  const record = structuredClone(THEMED);
  record.blocks[1].unit = "readArchive";
  const { html, model } = draw(record, diffText), words = CATALOGS.en;
  const part = (id) => html.match(new RegExp(`<noscript id="${id}">([\\s\\S]*?)</noscript>`))?.[1] ?? "";
  assert.deepEqual(model.requirements.map((r) => r.state).sort(), ["fail", "met", "permission", "unchecked"]);
  const states = [...part("static-report").matchAll(/<tr><td>R(\d+)<\/td>[\s\S]*?<span class="sstate">([^<]*)<\/span>/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(states, model.requirements.map((r) => [String(r.id), words[`p.req.${r.state}`]]));
  const lines = [...part("static-details").matchAll(/<td><code>([^<]*)<\/code><\/td>[\s\S]*?<td class="sshares">([^<]*)<\/td>/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(lines, model.units.map((u) => [u.name, Object.entries(u.lines).filter(([, n]) => n).map(([v, n]) => `${words[`verdict.${v}`].toLowerCase()} ${n}`).join(", ")]));
  assert.ok(lines.some(([, shares]) => shares.includes(", ")), "no unit has lines under two verdicts");
});

test("the page carries its runtime, its styles, its catalog and each row's code once, on the themed record and on a mixed diff", () => {
  const codeOf = (html) => [...html.matchAll(/<noscript id="code-\d+">[\s\S]*?<\/noscript>/g)].map((m) => m[0]);
  const once = (html, text, what) => assert.equal(html.split(text).length, 2, `${what} is in the page other than once`);
  const { html } = draw(THEMED, diffText), island = islandOf(html);
  once(html, fs.readFileSync(RUNTIME, "utf8").trim(), "the runtime");
  once(html, CSS, "the stylesheet");
  once(html, JSON.stringify(island.labels), "the catalog");
  const besides = html.length - codeOf(html).join("").length;
  assert.ok(besides <= 320 * 1024, `the themed page carries ${besides} bytes besides its code`);
  // 30 files, each changed in five hunks of three context lines, four removed and six added, and three more context.
  const FILES = 30, HUNKS = 5, lines = [], blocks = [];
  const source = (f, i, side) => `  const ${side}${f}_${i} = compute(${i}, "text ${f}", { mode: ${i % 3} });`;
  for (let f = 0; f < FILES; f++) {
    const path = `src/mod${f}/file${f}.js`;
    lines.push(`diff --git a/${path} b/${path}`, "index 1111111..2222222 100644", `--- a/${path}`, `+++ b/${path}`);
    for (let h = 0, at = 20, shift = 0; h < HUNKS; h++, at += 40, shift += 2) {
      lines.push(`@@ -${at - 3},10 +${at - 3 + shift},12 @@`, ...[at - 3, at - 2, at - 1].map((i) => " " + source(f, i, "old")),
        ...[0, 1, 2, 3].map((i) => "-" + source(f, at + i, "old")), ...[0, 1, 2, 3, 4, 5].map((i) => "+" + source(f, at + i, "new")),
        ...[4, 5, 6].map((i) => " " + source(f, at + i, "old")));
      const k = f * HUNKS + h, verdict = k % 7 === 3 ? "fix" : k % 11 === 5 ? "question" : "keep";
      blocks.push({ path, added: `${at + shift}-${at + shift + 5}`, removed: `${at}-${at + 3}`, does: `Hunk ${h}.`, serves: [1], verdict,
        ...(verdict === "fix" ? { findings: [1] } : verdict === "question" ? { questions: [1] } : {}) });
    }
  }
  const diff = lines.join("\n") + "\n";
  const mixed = { title: "Mixed", range: "generated", language: "en", diff: { file: "mixed.diff", sha256: createHash("sha256").update(diff).digest("hex") },
    change: { goal: "Modules.", parts: ["Thirty."], sources: ["generated"] }, verdict: "Generated.", now: "Now.", target: "Target.", recommendation: "Read it.",
    requirements: [{ id: 1, text: "Every module computes.", source: "task", met: "read" }], blocks, challenges: [], coverage: "Generated.",
    findings: [{ id: 1, title: "A finding", direction: "behavior", evidence: "read", at: "src/mod1/file1.js:20", what: "What.", shown_by: "The line.", fix: "Fix." }],
    questions: [{ at: "src/mod0/file0.js:1", text: "Keep it?", kind: "fact" }] };
  const page = draw(mixed, diff).html;
  // a context, a removed and an added line's name, each in the page once
  for (const name of ["old7_17", "old7_20", "new7_100"]) assert.equal(page.match(new RegExp(`\\b${name}\\b`, "g"))?.length, 1, `${name} is in the page other than once`);
  let rows = 0, code = 0, markup = 0;
  for (const file of codeOf(page)) {
    markup += file.length;
    for (const m of file.matchAll(/<td class="cd">(.*)<\/td><\/tr>$/gm)) { rows++; code += m[1].length; }
  }
  assert.equal(rows, FILES * HUNKS * 16);
  assert.ok((markup - code) / rows <= 130, `${((markup - code) / rows).toFixed(1)} bytes of markup per row besides its code`);
});
