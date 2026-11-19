#!/usr/bin/env node
// Portable, offline desktop acceptance of the Code surface on a generated public diff.
// PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs CHROME_FOR_TESTING=/path/to/chrome \
//   node plugins/entrust/evals/review-code-public.browser.mjs
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { hostileFixture } from "./review/report-fixtures.mjs";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "review-code-public-"));
const script = process.env.REVIEW_REPORT_SCRIPT ?? fileURLToPath(new URL("../plugin/skills/review/scripts/report.mjs", import.meta.url));
const lines = Array.from({ length: 600 }, (_, i) => `+const publicLine${i + 1} = ${i + 1};`);
const diff = [
  "diff --git a/src/large.js b/src/large.js", "new file mode 100644", "--- /dev/null",
  "+++ b/src/large.js", "@@ -0,0 +1,600 @@", ...lines,
  "diff --git a/src/other.js b/src/other.js", "new file mode 100644", "--- /dev/null",
  "+++ b/src/other.js", "@@ -0,0 +1 @@", "+const other = true;", "",
].join("\n");
const record = hostileFixture().record;
Object.assign(record, {
  title: "Public large diff",
  diff: { file: "source.diff", sha256: createHash("sha256").update(diff).digest("hex") },
  findings: [{ id: 1, title: "Public finding", direction: "behavior", evidence: "read",
    at: "src/large.js:400", what: "A public issue.", shown_by: "The changed line.", fix: "Fix it." }],
  questions: [{ at: "src/large.js:400", text: "Keep this choice?", kind: "decision", resolver: "owner",
    variants: [{ id: "keep", text: "Keep it", consequences: [{ text: "The line remains.", sources: [{ ref: "/blocks/1" }] }] },
      { id: "drop", text: "Drop it", consequences: [{ text: "The line goes.", sources: [{ ref: "/blocks/1" }] }] }] }],
  blocks: [
    { path: "src/large.js", added: "1-300", does: "Kept lines.", serves: [1], verdict: "keep" },
    { path: "src/large.js", added: "301-600", does: "Lines needing attention.", serves: [1], findings: [1], questions: [1], verdict: "fix" },
    { path: "src/other.js", added: "1", does: "Other file.", serves: [1], verdict: "keep" },
  ],
  language: "en",
});
fs.writeFileSync(path.join(dir, "source.diff"), diff);
fs.writeFileSync(path.join(dir, "review.json"), JSON.stringify(record));
const render = spawnSync(process.execPath, [script, "render", path.join(dir, "review.json")], { encoding: "utf8", cwd: dir });
if (render.status !== 0) throw new Error(`render failed:\n${render.stdout}\n${render.stderr}`);
const url = pathToFileURL(path.join(dir, "review.html")).href;
const { chromium } = process.env.PLAYWRIGHT_CORE
  ? await import(process.env.PLAYWRIGHT_CORE)
  : await import("playwright-core").catch(() => import("playwright"));
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_FOR_TESTING ? { executablePath: process.env.CHROME_FOR_TESTING } : {}) });
let failures = 0;
const onlyClick = process.env.REVIEW_QF_CLICK_ONLY === "1";
const check = async (name, fn) => {
  if (onlyClick && name !== "first Q → F click saves the choice without moving its target") return;
  try { await fn(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
};
try {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(4000);
  await p.goto(url);
  await p.locator("#tab-code").click();
  await check("attention shows relevant code lines", async () => {
    assert.equal(await p.locator("#map").getAttribute("data-show"), "attention");
    assert.equal(await p.getByText("const publicLine400 = 400;", { exact: false }).first().isVisible(), true);
    assert.equal(await p.locator("#b2 .l.add:visible").count(), 300);
  });
  await check("file selection shows keep and non-keep lines without segment clicks", async () => {
    await p.locator('[data-frow="0"] .fname').click();
    assert.equal(await p.getByText("const publicLine100 = 100;", { exact: false }).first().isVisible(), true);
    assert.equal(await p.getByText("const publicLine400 = 400;", { exact: false }).first().isVisible(), true);
    assert.equal(await p.locator("#file-0 .l.add:visible").count(), 600);
  });
  await check("tree filter and block deep link", async () => {
    await p.locator("#tree-filter-input").fill("other.js");
    assert.equal(await p.locator('.frow[data-frow="0"]').isVisible(), false);
    assert.equal(await p.locator('.frow[data-frow="1"]').isVisible(), true);
    await p.goto(url + "#b2");
    await p.waitForFunction(() => document.querySelector('.tabs [aria-selected="true"]')?.dataset.tab === "code");
    assert.equal(await p.locator("#b2").isVisible(), true);
  });
  await check("Choices finding opens its linked B2", async () => {
    await p.goto(url);
    await p.locator("#f1 .qwhere > summary").click();
    await p.locator('#f1 .qwhere a[href="#b2"]').click();
    await p.waitForFunction(() => document.querySelector('.tabs [aria-selected="true"]')?.dataset.tab === "code", null, { timeout: 4000 });
    assert.equal(await p.locator("#b2").isVisible(), true);
  });
  await check("Choices finding filter opens its linked blocks", async () => {
    await p.goto(url);
    await p.locator("#f1 .qwhere > summary").click();
    await p.locator('[data-f-filter="1"]').click();
    assert.equal(await p.locator("#map").getAttribute("data-f"), "1");
    assert.equal(await p.locator("#b2").isVisible(), true);
  });
  await check("first Q → F click saves the choice without moving its target", async () => {
    const fresh = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const q = await fresh.newPage();
    q.setDefaultTimeout(4000);
    try {
      await q.goto(url);
      await q.locator('#q1 input[value="keep"]').check();
      const fix = q.getByRole("button", { name: "Fix F1", exact: true });
      await fix.scrollIntoViewIfNeeded();
      const before = await fix.boundingBox();
      await fix.click();
      const after = await fix.boundingBox();
      assert.equal(await fix.getAttribute("aria-pressed"), "true", "first click must choose Fix");
      assert.equal(await fix.evaluate(el => document.activeElement === el), true, "focus must remain on Fix");
      assert.ok(before && after && Math.abs(before.y - after.y) < 2, `Fix moved vertically: ${before?.y} → ${after?.y}`);
      await q.reload();
      const summary = q.locator("#group-settled .settled-row > summary").filter({ hasText: "Public finding" });
      assert.equal(await summary.isVisible(), true, "settled finding must be visible after reload");
      assert.match(await summary.innerText(), /Selected:\s*Fix/, "choice must survive reload");
    } finally { await fresh.close(); }
  });
  await check("Q/F settlement persists identically after blur and reload", async () => {
    const fresh = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const q = await fresh.newPage();
    q.setDefaultTimeout(4000);
    try {
    await q.goto(url);
    await q.locator('#q1 input[value="keep"]').check();
    await q.locator("#tab-decisions").focus();
    await q.waitForFunction(() => document.querySelector('[data-unit="q1"]')?.closest(".dgroup")?.id === "group-settled", null, { timeout: 4000 });
    assert.equal(await q.locator("#f1 [data-fstatus]").getAttribute("data-state"), "open");
    await q.reload();
    assert.equal(await q.locator("#f1 [data-fstatus]").getAttribute("data-state"), "open");
    assert.equal(await q.locator('[data-unit="f1"]').evaluate(el => el.closest(".dgroup").id), "group-fix");
    await q.locator('#f1 button[value="apply"]').click();
    assert.equal(await q.locator("#f1 [data-fstatus]").getAttribute("data-state"), "decided");
    await q.locator("#tab-decisions").focus();
    await q.waitForFunction(() => document.querySelector('[data-unit="f1"]')?.closest(".dgroup")?.id === "group-settled", null, { timeout: 4000 });
    const settled = () => q.evaluate(() => ["q1", "f1"].map(id => {
      const el = document.querySelector(`[data-unit="${id}"]`);
      return { id, settled: el?.dataset.settled, group: el?.closest(".dgroup")?.id };
    }));
    const before = await settled();
    await q.reload();
    assert.deepEqual(await settled(), before, "settlement changed across reload after focus left");
    assert.deepEqual(before, [
      { id: "q1", settled: "done", group: "group-settled" },
      { id: "f1", settled: "done", group: "group-settled" },
    ]);
    } finally { await fresh.close(); }
  });
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1366, height: 900 } });
  const np = await nojs.newPage();
  await np.goto(url);
  await check("no JS: one file disclosure exposes all its lines and links", async () => {
    await np.locator("#file-0 > details.file-details > summary").click();
    assert.equal(await np.getByText("const publicLine100 = 100;", { exact: false }).first().isVisible(), true);
    assert.equal(await np.getByText("const publicLine400 = 400;", { exact: false }).first().isVisible(), true);
    assert.equal(await np.locator("#file-0 .l.add:visible").count(), 600);
    assert.ok(await np.locator('#file-0 a[href^="#"]:visible').count() > 0);
  });
  await nojs.close();
  await ctx.close();
} finally {
  await browser.close();
}
console.log(`fixture: ${dir}; failures: ${failures}`);
if (failures) process.exitCode = 1;
