#!/usr/bin/env node
// Acceptance against an enriched copy, never the source record.
// PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs BROWSER=chromium|yandex \
//   node plugins/entrust/evals/review-report-v7.browser.mjs [out-dir]
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { enrich65507 } from "./review/report-fixtures.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_CORE ?? "playwright-core");
const source = process.env.REVIEW_PRIVATE_DIR;
const annotations = process.env.REVIEW_PRIVATE_ANNOTATIONS;
const browser = process.env.BROWSER === "yandex" ? "yandex" : "chromium";
const binary = process.env.BROWSER_BINARY ?? process.env.CHROME_FOR_TESTING;
if (browser === "yandex" && !binary) throw new Error("Set BROWSER_BINARY for Yandex Browser");
const out = path.resolve(process.argv[2] ?? fs.mkdtempSync(path.join(process.env.TMPDIR ?? os.tmpdir(), `review-v7-${browser}-`)));
const script = fileURLToPath(new URL("../plugin/skills/review/scripts/report.mjs", import.meta.url));
const sha = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
if (!source || !annotations) throw new Error("Set REVIEW_PRIVATE_DIR and REVIEW_PRIVATE_ANNOTATIONS to run this private-fixture suite");
const original = path.join(source, "review.json"), originalDiff = path.join(source, "review.diff");
const results = { browser, binary, out, checks: [], errors: [] };
fs.mkdirSync(out, { recursive: true });
const check = (name, ok, detail) => results.checks.push({ name, ok: !!ok, ...(detail === undefined ? {} : { detail }) });
const test = async (name, fn) => {
  try { await fn(); } catch (e) { check(name, false, String(e.stack ?? e).slice(0, 1200)); }
};
let context, nojs, beforeRecord, beforeDiff, copySha;
try {
  beforeRecord = sha(original);
  beforeDiff = sha(originalDiff);
  const dir = path.join(out, "copy");
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(originalDiff, path.join(dir, "review.diff"));
  const record = path.join(dir, "review.json");
  fs.writeFileSync(record, JSON.stringify(enrich65507(JSON.parse(fs.readFileSync(original, "utf8")), JSON.parse(fs.readFileSync(annotations, "utf8")))));
  copySha = sha(record);
  const render = spawnSync(process.execPath, [script, "render", record], { cwd: dir, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  if (render.status !== 0) throw new Error(`render failed (${render.status}): ${render.stderr}`);
  const url = pathToFileURL(path.join(dir, "review.html")).href;
  const launch = (profile, options = {}) => chromium.launchPersistentContext(path.join(out, profile), {
    executablePath: binary, headless: true, viewport: { width: 1366, height: 900 },
    args: ["--no-first-run", ...(browser === "chromium" ? ["--disable-gpu", "--disable-dev-shm-usage"] : [])], ...options
  });
  context = await launch("profile");
  const watch = (p) => {
    p.on("pageerror", (e) => results.errors.push(`pageerror: ${e.message}`));
    p.on("console", (m) => { if (m.type() === "error") results.errors.push(`console: ${m.text()}`); });
  };
  const p = context.pages()[0] ?? await context.newPage();
  p.setDefaultTimeout(8000);
  watch(p);
  await p.goto(url, { waitUntil: "load", timeout: 60000 });
  await p.click("#tab-code");
  const snapshot = () => p.evaluate(() => {
    const data = JSON.parse(document.querySelector("#data").textContent), map = document.querySelector("#map");
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    const visible = [...map.querySelectorAll(".seg[data-block]")].filter((s) => s.style.display !== "none" && s.closest(".file")?.style.display !== "none");
    return {
      req: map.dataset.req ?? "", select: document.querySelector("#code-requirement").value,
      mode: map.dataset.show, hash: location.hash, chip: document.querySelector("#filter-chip-label").textContent,
      chipHidden: document.querySelector("#filter-chip").hidden, empty: document.querySelector("#requirement-empty").textContent.trim(),
      visible: [...new Set(visible.map((s) => +s.dataset.block))], parts: visible.length,
      linked: data.blocks.filter((b) => (b.serves || []).includes(2)).map((b) => b.id),
      linked9: data.blocks.filter((b) => (b.serves || []).includes(9)).map((b) => b.id),
      groups: [...document.querySelectorAll("#unit-tree details")].map((d) => ({ unit: d.dataset.unit, blocks: [...d.querySelectorAll("[data-unit-block]")].map((b) => +b.dataset.unitBlock) })),
      blockData: data.blocks.map((b) => ({ id: b.id, serves: b.serves, unit: b.unit, purpose: b.purpose, verdict: b.verdict })),
      hiddenPurposes: [...document.querySelectorAll("[data-purpose-filter][aria-pressed=false]")].map((b) => b.dataset.purposeFilter),
      duplicateIds: [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))],
      mapCount: map.querySelectorAll(".seg[data-block]").length,
      rows: [...document.querySelectorAll(".frow")].filter((r) => r.style.display !== "none").length
    };
  });
  const select = (id) => p.selectOption("#code-requirement", id);
  const units = () => p.click('[data-navigation-view="units"]');
  const files = () => p.click('[data-navigation-view="files"]');

  await test("requirement labels", async () => {
    const labels = await p.locator("#code-requirement option").allTextContents();
    check("requirement options use R labels and block counts", labels.some((label) => /^R1\s*—.*\(\d+\)/.test(label)), labels);
  });
  await test("requirement 2 and unique linked blocks", async () => {
    await select("2");
    const s = await snapshot();
    check("R2: 835 unique related blocks, all shown in all mode", s.req === "2" && s.select === "2" && s.mode === "all"
      && s.linked.length === 835 && new Set(s.linked).size === 835 && s.visible.length === 835
      && s.linked.every((id) => s.visible.includes(id)) && /835/.test(s.chip) && !s.empty, { count: s.linked.length, visible: s.visible.length, parts: s.parts, chip: s.chip, empty: s.empty });
    check("R2: no duplicate IDs after insertion", !s.duplicateIds.length, s.duplicateIds);
  });
  await test("unit groups and navigation", async () => {
    await units();
    let s = await snapshot();
    const ids = s.groups.flatMap((g) => g.blocks);
    const byId = new Map(s.blockData.map((b) => [b.id, b]));
    check("units contain exactly the related blocks, grouped by unit", ids.length === 835 && new Set(ids).size === 835
      && ids.every((id) => byId.get(id)?.serves.includes(2))
      && s.groups.every((g) => g.blocks.every((id) => !byId.get(id)?.unit || byId.get(id).unit === g.unit)),
      { groups: s.groups.length, blocks: ids.length, unique: new Set(ids).size, unrelated: ids.filter((id) => !byId.get(id)?.serves.includes(2)).slice(0, 10) });
    const target = s.groups.find((g) => g.blocks.length)?.blocks[0];
    if (!target) throw new Error("No unit block available");
    await p.locator(`#unit-tree [data-unit-block="${target}"]`).evaluate((button) => { button.closest("details").open = true; });
    const before = s.mapCount;
    await p.click(`#unit-tree [data-unit-block="${target}"]`);
    await p.waitForFunction((id) => document.activeElement?.id === `b${id}`, target);
    s = await snapshot();
    const targetState = await p.evaluate((id) => ({ count: document.querySelectorAll(`#b${id}`).length,
      codeVisible: !!document.querySelector(`#b${id} pre`)?.getClientRects().length,
      inMap: !!document.querySelector(`#map #b${id}`), focus: document.activeElement?.id }), target);
    check("unit B jump preserves R2 and uses canonical code without duplication", s.req === "2" && s.select === "2"
      && s.mapCount === before && !s.duplicateIds.length && targetState.count === 1 && targetState.codeVisible && targetState.inMap && targetState.focus === `b${target}`,
      { target, before, after: s.mapCount, targetState, duplicateIds: s.duplicateIds });
    await files();
    check("switching back to files preserves requirement", (await snapshot()).req === "2" && await p.locator("#files-tree").isVisible());
  });
  await test("empty states and requirement 9", async () => {
    await select("9");
    let s = await snapshot();
    const noRelated = s.empty;
    check("R9: no linked blocks and an explicit empty result", s.req === "9" && s.linked9.length === 0 && s.visible.length === 0 && !!noRelated && /0/.test(s.chip),
      { linked: s.linked9.length, visible: s.visible.length, empty: noRelated, chip: s.chip });
    await select("2");
    const purposes = await p.locator("[data-purpose-filter]:not([data-purpose-empty])").evaluateAll((els) => els.map((e) => e.dataset.purposeFilter));
    for (const purpose of purposes) await p.click(`[data-purpose-filter="${purpose}"]`);
    s = await snapshot();
    check("R2: filters produce a different empty result from R9", s.linked.length === 835 && s.visible.length === 0
      && !!s.empty && s.empty !== noRelated && s.hiddenPurposes.length === purposes.length,
      { noRelated, filtered: s.empty, hidden: s.hiddenPurposes, visible: s.visible.length });
    await select("");
    s = await snapshot();
    check("resetting requirement preserves hidden purposes", !s.req && !s.select && !s.empty
      && s.hiddenPurposes.length === purposes.length && s.visible.length === 0,
      { req: s.req, empty: s.empty, hidden: s.hiddenPurposes, visible: s.visible.length });
    check("full materialized map has no duplicate IDs", !s.duplicateIds.length && s.mapCount >= 1470,
      { duplicateIds: s.duplicateIds, mapSegments: s.mapCount });
    await p.click("#filter-clear");
    s = await snapshot();
    check("filter reset restores purposes", !s.hiddenPurposes.length && s.chipHidden, { hidden: s.hiddenPurposes, chipHidden: s.chipHidden });
  });
  await test("filters intersect with selected requirement", async () => {
    await select("2");
    const before = await snapshot();
    const purpose = before.blockData.find((b) => b.serves.includes(2))?.purpose;
    if (!purpose) throw new Error("No linked purpose");
    await p.click(`[data-purpose-filter="${purpose}"]`);
    await units();
    let s = await snapshot();
    const expected = s.blockData.filter((b) => b.serves.includes(2) && b.purpose !== purpose).map((b) => b.id);
    const actual = s.groups.flatMap((g) => g.blocks);
    check("purpose filter intersects R2 in map and unit groups", s.req === "2" && s.visible.length === expected.length
      && actual.length === expected.length && expected.every((id) => s.visible.includes(id) && actual.includes(id)),
      { purpose, expected: expected.length, map: s.visible.length, units: actual.length });
    await p.click(`[data-purpose-filter="${purpose}"]`);
    await p.click('[data-show="fix"]');
    s = await snapshot();
    const fix = s.blockData.filter((b) => b.serves.includes(2) && b.verdict === "fix").map((b) => b.id);
    check("verdict filter intersects R2 in map and unit groups", s.req === "2" && s.visible.length === fix.length
      && s.groups.flatMap((g) => g.blocks).length === fix.length && fix.every((id) => s.visible.includes(id)),
      { expected: fix.length, map: s.visible.length, units: s.groups.flatMap((g) => g.blocks).length });
    await p.click('[data-show="all"]');
    await files();
    await p.fill("#tree-filter-input", "zz-v7-no-such-file-zz");
    check("file name filter yields no rows without clearing requirement", (await snapshot()).rows === 0 && (await snapshot()).req === "2");
    await p.click("#tree-filter-clear");
    check("file name reset restores matching rows", (await snapshot()).rows > 0 && (await snapshot()).req === "2");
  });
  await test("deep link and history", async () => {
    await p.goto(url + "#req2-code", { waitUntil: "load", timeout: 60000 });
    let s = await snapshot();
    check("#req2-code opens R2 and its 835 blocks", s.req === "2" && s.select === "2" && s.visible.length === 835
      && await p.locator("#tab-code").getAttribute("aria-selected") === "true", { req: s.req, select: s.select, visible: s.visible.length, hash: s.hash });
    await select("9");
    await p.goBack({ waitUntil: "load", timeout: 30000 });
    await p.waitForFunction(() => document.querySelector("#code-requirement")?.value === "2", null, { timeout: 8000 });
    s = await snapshot();
    check("history back restores R2", s.req === "2" && s.visible.length === 835 && s.hash === "#req2-code", { req: s.req, visible: s.visible.length, hash: s.hash });
    await p.goForward({ waitUntil: "load", timeout: 30000 });
    await p.waitForFunction(() => document.querySelector("#code-requirement")?.value === "9", null, { timeout: 8000 });
    s = await snapshot();
    check("history forward restores R9", s.req === "9" && s.visible.length === 0 && !!s.empty && s.hash === "#req9-code", { req: s.req, visible: s.visible.length, hash: s.hash, empty: s.empty });
  });
  // Reload between these cases: R9 must be tested before other interactions materialize the map.
  const fresh = async () => {
    await p.setViewportSize({ width: 1366, height: 900 });
    await p.goto(url, { waitUntil: "load", timeout: 60000 });
    await p.evaluate(() => localStorage.clear());
    await p.reload({ waitUntil: "load", timeout: 60000 });
    await p.click("#tab-code");
  };
  const fullMap = () => p.evaluate(() => {
    const map = document.querySelector("#map");
    const segs = [...map.querySelectorAll(".seg[data-block]")].filter((s) => s.style.display !== "none" && s.closest(".file")?.style.display !== "none");
    const files = [...map.querySelectorAll(".file-lazy > .file")].filter((f) => f.style.display !== "none");
    return { req: map.dataset.req ?? "", mode: map.dataset.show, blocks: new Set(segs.map((s) => s.dataset.block)).size,
      files: files.length, ids: map.querySelectorAll(".seg[id][data-block]").length, hash: location.hash };
  });
  const allRestored = (s) => !s.req && s.mode === "all" && s.blocks === 1470 && s.files === 96 && s.ids === 1470;
  await test("fresh R9 clear restores all files", async () => {
    await fresh();
    const before = await fullMap();
    await select("9");
    const empty = await fullMap();
    await p.click("#filter-clear");
    const after = await fullMap();
    check("fresh R9 → filter-clear restores all 1470 B and 96 files", empty.blocks === 0 && allRestored(after),
      { before, empty, after });
  });
  await test("fresh R9 browser back restores all files", async () => {
    await fresh();
    const before = await fullMap();
    await select("9");
    const empty = await fullMap();
    await p.goBack({ waitUntil: "load", timeout: 30000 });
    await p.waitForFunction(() => !document.querySelector("#map").dataset.req && location.hash === "#panel-code", null, { timeout: 8000 });
    const after = await fullMap();
    check("fresh R9 → browser Back restores all 1470 B and 96 files", empty.blocks === 0 && allRestored(after),
      { before, empty, after });
  });
  await test("unit layout, hide-tree, and selected block context", async () => {
    await fresh();
    await select("2");
    await units();
    const layout = await p.evaluate(() => {
      const tree = document.querySelector("#unit-tree"), groups = [...tree.querySelectorAll(":scope > details")].slice(0, 5);
      const boxes = groups.map((g) => { const r = g.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left }; });
      return { display: getComputedStyle(tree).display, direction: getComputedStyle(tree).flexDirection, boxes };
    });
    check("unit groups are vertically stacked", layout.boxes.length >= 2 && layout.display !== "none"
      && !(layout.display.includes("flex") && layout.direction.startsWith("row"))
      && layout.boxes.every((box, i) => !i || box.top >= layout.boxes[i - 1].bottom - 1), layout);
    const hideVisible = await p.locator("#hide-tree").isVisible();
    await p.click("#hide-tree");
    const hidden = await p.locator("#code-layout").evaluate((el) => el.classList.contains("hide-tree"));
    const showVisible = await p.locator("#show-tree").isVisible();
    await p.click("#show-tree");
    check("hide-tree works in unit view and can be restored", hideVisible && hidden && showVisible
      && await p.locator("#unit-tree").isVisible() && await p.locator('[data-navigation-view="units"]').getAttribute("aria-pressed") === "true",
      { hideVisible, hidden, showVisible });
    const data = await snapshot();
    const block = data.blockData.find((b) => b.serves.includes(2) && b.unit);
    if (!block) throw new Error("No R2 block with unit context");
    const button = p.locator(`#unit-tree [data-unit-block="${block.id}"]`);
    await button.evaluate((b) => { b.closest("details").open = true; });
    await button.click();
    await p.waitForFunction((id) => document.activeElement?.id === `b${id}`, block.id);
    const contextInfo = await p.evaluate((id) => {
      const el = document.querySelector(`#b${id} .unit-context`);
      return { text: el?.textContent ?? "", visible: !!el && !!el.getClientRects().length && getComputedStyle(el).visibility === "visible",
        focus: document.activeElement?.id, count: document.querySelectorAll("#map .unit-context").length };
    }, block.id);
    check("unit B jump displays its unit context", contextInfo.visible && contextInfo.text.includes(block.unit)
      && contextInfo.focus === `b${block.id}` && contextInfo.count === 1, { block: block.id, unit: block.unit, ...contextInfo });
  });
  await test("mobile unit jump", async () => {
    await fresh();
    await p.setViewportSize({ width: 390, height: 844 });
    await select("2");
    await p.click('[data-mview="tree"]');
    await units();
    const block = (await snapshot()).groups.find((g) => g.blocks.length)?.blocks[0];
    if (!block) throw new Error("No R2 unit block on mobile");
    const button = p.locator(`#unit-tree [data-unit-block="${block}"]`);
    await button.evaluate((b) => { b.closest("details").open = true; });
    await button.click();
    await p.waitForFunction((id) => document.activeElement?.id === `b${id}`, block);
    const mobile = await p.evaluate((id) => ({ mode: document.querySelector("#code-layout").dataset.mview,
      diffVisible: !!document.querySelector(".diff-col").getClientRects().length,
      blockVisible: !!document.getElementById(`b${id}`).getClientRects().length,
      focus: document.activeElement?.id, req: document.querySelector("#code-requirement").value,
      diffPressed: document.querySelector('[data-mview="diff"]').getAttribute("aria-pressed") }), block);
    check("390px: tree → unit B shows diff and focuses B without clearing R2", mobile.mode === "diff"
      && mobile.diffVisible && mobile.blockVisible && mobile.focus === `b${block}` && mobile.req === "2" && mobile.diffPressed === "true", mobile);
  });
  await test("tab return and reload", async () => {
    await fresh();
    await select("2");
    await p.click("#tab-overview");
    const away = await p.evaluate(() => location.hash);
    await p.click("#tab-code");
    const back = await snapshot();
    await p.reload({ waitUntil: "load", timeout: 60000 });
    const reloaded = await snapshot();
    check("R2 survives tab round trip with URL and reload", away === "#panel-overview"
      && back.req === "2" && back.hash === "#req2-code" && reloaded.req === "2" && reloaded.select === "2"
      && reloaded.hash === "#req2-code" && reloaded.visible.length === 835
      && await p.locator("#tab-code").getAttribute("aria-selected") === "true",
      { away, back: { req: back.req, hash: back.hash }, reloaded: { req: reloaded.req, select: reloaded.select, hash: reloaded.hash, visible: reloaded.visible.length } });
  });
  await test("audit afterprint unit group state", async () => {
    await fresh();
    await select("2");
    await units();
    const group = p.locator("#unit-tree details").first();
    const unit = await group.getAttribute("data-unit");
    await group.locator(":scope > summary").click();
    const before = await p.evaluate(() => [...document.querySelectorAll("#unit-tree details[open]")].map((d) => d.dataset.unit));
    await p.evaluate(() => { window.print = () => {}; });
    await p.click("#tab-materials");
    await p.click("#print-audit");
    await p.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    await p.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    await p.click("#tab-code");
    const after = await p.evaluate(() => ({ open: [...document.querySelectorAll("#unit-tree details[open]")].map((d) => d.dataset.unit),
      req: document.querySelector("#code-requirement").value, unitVisible: !document.querySelector("#unit-tree").hidden }));
    check("audit afterprint restores open unit group and R2", before.includes(unit) && JSON.stringify(before) === JSON.stringify(after.open)
      && after.req === "2" && after.unitVisible, { before, after });
  });
  await test("explicit B outside R2 reports filter reset", async () => {
    await fresh();
    await select("2");
    const data = await snapshot();
    const block = data.blockData.find((b) => !b.serves.includes(2));
    if (!block) throw new Error("No block outside R2");
    await p.evaluate((id) => { location.hash = `#b${id}`; }, block.id);
    await p.waitForFunction((id) => document.activeElement?.id === `b${id}`, block.id);
    const s = await fullMap();
    const notice = await p.locator("#code-notice").textContent();
    check("explicit outside-R2 B clears filters and announces it", allRestored(s) && s.hash === `#b${block.id}`
      && await p.locator("#code-notice").isVisible() && /фильтр.{0,30}сброш/i.test(notice),
      { block: block.id, map: s, notice });
  });
  await test("no-JS controls", async () => {
    nojs = await launch("profile-nojs", { javaScriptEnabled: false });
    const n = nojs.pages()[0] ?? await nojs.newPage();
    watch(n);
    await n.goto(url, { waitUntil: "load", timeout: 60000 });
    const controls = await n.evaluate(() => ({
      js: document.documentElement.classList.contains("js"),
      requirement: document.querySelector("#code-requirement")?.disabled,
      views: [...document.querySelectorAll("[data-navigation-view]")].map((b) => b.disabled),
      purpose: [...document.querySelectorAll("[data-purpose-filter]")].every((b) => b.disabled),
      tree: document.querySelector("#tree-filter-input")?.disabled
    }));
    check("no-JS: requirement, navigation and filters disabled", !controls.js && controls.requirement && controls.views.length === 2
      && controls.views.every(Boolean) && controls.purpose && controls.tree, controls);
    const file = n.locator("#map details.file-details").first();
    await file.locator(":scope > summary").click();
    const visibleCode = await file.evaluate((el) => ({
      open: el.open,
      lines: [...el.querySelectorAll("pre .l")].filter((line) => line.getClientRects().length).length,
      nestedCodeDisclosures: el.querySelectorAll("details.segcode").length
    }));
    check("no-JS: opening a file reveals its code without nested code disclosures",
      visibleCode.open && visibleCode.lines > 0 && visibleCode.nestedCodeDisclosures === 0, visibleCode);
  });
} catch (e) {
  check("setup and execution", false, String(e.stack ?? e).slice(0, 2000));
} finally {
  if (nojs) await nojs.close().catch((e) => results.errors.push(`nojs close: ${e.message}`));
  if (context) await context.close().catch((e) => results.errors.push(`context close: ${e.message}`));
  if (beforeRecord) check("source record SHA unchanged", sha(original) === beforeRecord, { before: beforeRecord, after: sha(original) });
  if (beforeDiff) check("source diff SHA unchanged", sha(originalDiff) === beforeDiff, { before: beforeDiff, after: sha(originalDiff) });
  if (copySha) check("enriched copy record SHA unchanged", sha(path.join(out, "copy", "review.json")) === copySha);
  check("zero browser errors", results.errors.length === 0, results.errors);
  results.failures = results.checks.filter((c) => !c.ok);
  fs.writeFileSync(path.join(out, "results.json"), JSON.stringify(results, null, 2) + "\n");
  console.log(JSON.stringify({ browser, out, passed: results.checks.length - results.failures.length, failed: results.failures }, null, 2));
  if (results.failures.length) process.exitCode = 1;
}
