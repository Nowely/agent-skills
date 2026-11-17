#!/usr/bin/env node
// Browser acceptance of the v4 report page, on the records the suite renders: the themed record with decision
// cards, a copy of the real 65507 record enriched with the new fields, and the legacy annotation runtime.
// Runs nothing but the report's own page; no app or source code is executed. Supersedes the v3 acceptance;
// the v3 core checks (applicability, counters, export, viewer, print, deep links, no-JS) are carried here.
//
//   PLAYWRIGHT_CORE=<path to playwright-core/index.mjs> node evals/review-report-v4.browser.mjs [out-dir]
//
// playwright-core is a verification tool here, not a dependency of the plugin. The browser binary defaults to
// the Playwright cache's Chrome for Testing; CHROME_FOR_TESTING=<path> runs another Chromium (e.g. Yandex).
// PDFJS_DIST=<path to pdfjs-dist/legacy/build/pdf.mjs> adds the real-PDF acceptance (owner and auditor);
// without it the PDF part is skipped. Without the 65507 record on the machine, that part is skipped.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepare } from "./review/prepare.mjs";
import { reportFixtures, enrich65507 } from "./review/report-fixtures.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_CORE ?? "playwright-core");
let pdfjs = null;
try { pdfjs = await import(process.env.PDFJS_DIST ?? "pdfjs-dist/legacy/build/pdf.mjs"); } catch {}
const pdfText = async (file) => {
  const options = { data: new Uint8Array(fs.readFileSync(file)) };
  if (process.env.PDFJS_DIST) options.standardFontDataUrl = path.join(path.dirname(process.env.PDFJS_DIST), "..", "standard_fonts") + path.sep;
  const task = pdfjs.getDocument(options), doc = await task.promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) text += (await (await doc.getPage(i)).getTextContent()).items.map((item) => item.str).join("") + "\n";
  await task.destroy();
  // Chrome's subset fonts map Cyrillic к to U+0138 (ĸ) in the PDF's ToUnicode table; put it back for matching.
  return text.replaceAll("\u0138", "\u043A");
};
// A B address as a whole word: B1 must not match inside B1470.
const hasB = (text, n) => new RegExp(`(?<![0-9A-Za-z])B${n}(?![0-9])`).test(text);
const CHROME = process.env.CHROME_FOR_TESTING ?? path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "..", "plugin", "skills", "review", "scripts", "report.mjs");
const OUT = process.argv[2] ?? fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "review-v4-browser-"));
fs.mkdirSync(OUT, { recursive: true });
const results = { out: OUT, browser: CHROME, checks: [], failures: [] };
const check = (name, ok, detail) => { results.checks.push({ name, ok: !!ok, ...(detail === undefined ? {} : { detail }) }); if (!ok) results.failures.push(name + (detail ? `: ${JSON.stringify(detail).slice(0, 300)}` : "")); };

// The themed record on the currency case's diff, rendered beside its two one-pixel pictures.
const { run, cwd: repo } = prepare("currency-contract", "clean");
const generated = spawnSync("git", ["-c", "core.quotepath=off", "diff", "--no-color", "--no-ext-diff", "--no-renames", "-U3", "HEAD~1..HEAD", "--"], { cwd: repo });
if (generated.status !== 0) throw new Error(`could not prepare the test diff: ${generated.stderr}`);
fs.writeFileSync(path.join(run, "source.diff"), generated.stdout);
const { REVIEW, THEMED } = reportFixtures(createHash("sha256").update(generated.stdout).digest("hex"));
for (const name of ["before.png", "after.png"])
  fs.writeFileSync(path.join(run, name), Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64"));
const render = (record, name) => {
  const file = path.join(run, name);
  fs.writeFileSync(file, JSON.stringify(record));
  const result = spawnSync(process.execPath, [SCRIPT, "render", file], { cwd: repo, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`render ${name}: ${result.stderr}`);
  return { record: file, html: file.replace(/\.json$/, ".html"), url: `file://${file.replace(/\.json$/, ".html")}` };
};
const themed = render(THEMED, "themed.json");
// A block whose only question is a decision: accepting it must cue the resolved block in attention mode.
const resolvedRecord = structuredClone(THEMED);
resolvedRecord.blocks[1].questions = [3];
const resolved = render(resolvedRecord, "resolved.json");
const legacyRu = render({ ...structuredClone(REVIEW), language: "ru", mechanisms: [
  { name: "Первая механика", change: "reused", units: ["readArchive"], purpose: "Назначение механики: показать, как существующее поведение сохраняется без нового состояния, и почему это важно для читателя отчёта.",
    basis: "Основание: требование 1 и существующий контракт читателя, который уже преобразует код валюты в верхний регистр при выводе.",
    benefit: "Польза: повторное использование уже проверенного пути без дополнительных тестов и без новой поверхности ошибки.",
    cost: "Цена: явная зависимость от порядка вывода, которую нужно сохранить при любом изменении читателя архива.",
    decision: "Оставить преобразование в читателе и не переносить его в вывод без отдельного решения владельца.", evidence: "read", findings: [1] },
  { name: "Вторая механика", change: "reused", purpose: "Назначение второй механики: показать, как тот же путь обслуживает другой сценарий без дублирования правила преобразования.",
    basis: "Основание: тот же контракт читателя и требование 1; отдельного источника у второй механики нет, и это записано явно.",
    benefit: "Польза: одно правило на два сценария, без расхождения форматов при выводе списка и отдельной карточки.",
    cost: "Цена: связанность сценариев через общий путь, которую нужно учитывать при изменении формата вывода.",
    decision: "Оставить общий путь и не вводить второй преобразователь для отдельного сценария.", evidence: "read" }] }, "legacy-ru.json");
// A copy of the immutable 65507 record, enriched; the original is never written.
const SOURCE = process.env.REVIEW_65507_DIR ?? "/private/tmp/entrust/cloud-components/65507-review-current";
const ANN = process.env.REVIEW_65507_ANNOTATIONS ?? "/private/tmp/entrust/65507-review-analysis/prototype/annotations-v2.json";
let big = null, bigSha = null;
if (fs.existsSync(path.join(SOURCE, "review.json")) && fs.existsSync(ANN)) {
  const dir = path.join(run, "big");
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(path.join(SOURCE, "review.diff"), path.join(dir, "review.diff"));
  const bytes = fs.readFileSync(path.join(SOURCE, "review.json"));
  bigSha = createHash("sha256").update(bytes).digest("hex");
  const record = enrich65507(JSON.parse(bytes.toString("utf8")), JSON.parse(fs.readFileSync(ANN, "utf8")));
  const file = path.join(dir, "review.json");
  fs.writeFileSync(file, JSON.stringify(record));
  const result = spawnSync(process.execPath, [SCRIPT, "render", file], { cwd: dir, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`render 65507 copy: ${result.stderr.slice(0, 500)}`);
  big = { record: file, html: file.replace(/\.json$/, ".html"), url: `file://${file.replace(/\.json$/, ".html")}`, bytes: fs.statSync(file.replace(/\.json$/, ".html")).size,
    screenName: record.screens?.[0]?.name, limit: record.coverageStructured?.find((c) => c.kind === "not_checked")?.text };
}
console.error(`[setup] rendered themed, resolved, legacy-ru${big ? ", 65507 copy" : ""}`);

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const errors = [];
const watch = (page) => { page.on("pageerror", (e) => errors.push(String(e))); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); }); };
const open = async (url, options = {}) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, ...options });
  const page = await context.newPage();
  watch(page);
  const t0 = Date.now();
  await page.goto(url, { waitUntil: "load" });
  if (options.javaScriptEnabled !== false) await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  return { page, context, loadMs: Date.now() - t0 };
};
const state = (page) => page.evaluate(() => { const d = JSON.parse(document.getElementById("data").textContent); return JSON.parse(localStorage.getItem("review-report:" + d.key) || "{}"); });
const progressQ = (page) => page.evaluate(() => document.getElementById("progress-q")?.textContent ?? "");
const tab = async (page, id) => { await page.click(`#tab-${id}`); await page.waitForTimeout(150); };
const radio = (page, q, value) => page.check(`input[name="vq${q}"][value="${value}"]`);
// The contrast math and the full token/gutter walk, as in the prototype's acceptance.
const injectHelpers = (page) => page.evaluate(() => {
  window.__po = (d) => { if (d && !d.open) d.open = true; };
  window.__c = {
    parse(c) { const m = /rgba?\(([^)]+)\)/.exec(c); return m ? m[1].split(",").map(parseFloat) : null; },
    lum(rgb) { const [r, g, b] = rgb.slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; },
    blend(fg, bg) { const a = fg[3] == null ? 1 : fg[3]; return [0, 1, 2].map(i => fg[i] * a + bg[i] * (1 - a)); },
    ratio(c1, c2) { const l1 = this.lum(c1), l2 = this.lum(c2); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); },
    lineColors(sel) {
      const l = document.querySelector(sel); if (!l) return null;
      const cs = getComputedStyle(l);
      const pre = l.closest("pre"); const preBg = this.parse(getComputedStyle(pre).backgroundColor);
      const bg = this.blend(this.parse(cs.backgroundColor), preBg);
      const op = parseFloat(cs.opacity);
      const withOp = (c) => op < 1 ? this.blend([...c.slice(0, 3), op], bg) : c;
      const text = withOp(this.parse(cs.color));
      const spans = [...l.querySelectorAll("span[style]")].map(s => withOp(this.parse(getComputedStyle(s).color).slice(0, 3))).filter(Boolean);
      const minSpan = spans.length ? Math.min(...spans.map(c => this.ratio(c, bg))) : null;
      return { bg, textRatio: +this.ratio(text, bg).toFixed(2), minSpanRatio: minSpan == null ? null : +minSpan.toFixed(2), opacity: cs.opacity };
    }
  };
  window.__walk = () => {
    const c = window.__c;
    const res = { tokens: 0, below45: 0, min: 99, worst: null, gutters: 0, gutterBelow45: 0, gutterMin: 99 };
    for (const l of document.querySelectorAll("#map .l")) {
      const cs = getComputedStyle(l);
      const pre = l.closest("pre"); const preBg = c.parse(getComputedStyle(pre).backgroundColor);
      const bg = c.blend(c.parse(cs.backgroundColor), preBg);
      const op = parseFloat(cs.opacity);
      const withOp = (col) => op < 1 ? c.blend([...col.slice(0, 3), op], bg) : col;
      const check = (el, isToken) => {
        const col = withOp(c.parse(getComputedStyle(el).color).slice(0, 3));
        const r = c.ratio(col, bg);
        if (isToken) {
          res.tokens++;
          if (r < res.min) { res.min = r; res.worst = { line: l.className, color: getComputedStyle(el).color, text: el.textContent.slice(0, 40) }; }
          if (r < 4.5) res.below45++;
        } else { res.gutters++; if (r < res.gutterMin) res.gutterMin = r; if (r < 4.5) res.gutterBelow45++; }
      };
      for (const s of l.querySelectorAll("span[style]")) check(s, true);
      for (const g of l.querySelectorAll("b, i")) check(g, false);
    }
    res.min = +res.min.toFixed(3); res.gutterMin = +res.gutterMin.toFixed(3);
    return res;
  };
});

console.error("[run] themed section");
{
  const { page, context, loadMs } = await open(themed.url);
  const initial = await page.evaluate(() => ({ js: document.documentElement.classList.contains("js"), tabs: document.querySelectorAll(".tabs [role=tab]").length,
    panels: document.querySelectorAll(".panel").length, hidden: document.querySelectorAll(".panel[hidden]").length, qcards: document.querySelectorAll(".qcard").length,
    active: document.querySelector('.tabs [aria-selected="true"]')?.dataset.tab, domNodes: document.querySelectorAll("*").length }));
  check("themed: six tabs, one active panel, five cards", initial.js && initial.tabs === 6 && initial.panels === 6 && initial.hidden === 5 && initial.qcards === 5 && initial.active === "overview", initial);
  await tab(page, "decisions");
  check("themed: the no-JS hint hides and the radios are live under the runtime", await page.locator("#q3 .nojs-note").first().isHidden() && await page.locator('#q3 input[data-question-variant]').first().isEnabled());
  check("themed: decision counters start at remaining 2", (await progressQ(page)).includes("remaining: 2"), await progressQ(page));
  check("themed: evidence and fact cards have no decision controls", await page.locator("#q1 .decide").count() === 0 && await page.locator("#q1 [data-confirm]").count() === 0 && await page.locator("#q2 [data-confirm]").count() === 0);
  // The radio is the decision on a wide screen; the child follows the accepted variant.
  await radio(page, 3, "extend");
  check("themed: a variant pick accepts at once", (await progressQ(page)).includes("accepted: 1") && (await page.textContent("#q3 [data-qstatus]")).startsWith("selected:"), await progressQ(page));
  check("themed: child applicable under the accepted variant", !(await page.evaluate(() => document.getElementById("q4").classList.contains("na"))));
  // Deferral keeps the variant as a draft and asks for a reason.
  await page.click("#q3 [data-defer]");
  const deferred = await page.evaluate(() => ({ chip: document.querySelector("#q3 [data-qstatus]").textContent, radio: document.querySelector('#q3 input[value="extend"]').checked,
    draft: !document.querySelector("#q3 [data-qdraft]").hidden, hint: !document.querySelector("#q3 .requires-content").hidden }));
  check("themed: deferral keeps a draft, unchecks the radio, asks for a reason", deferred.chip === "deferred" && !deferred.radio && deferred.draft && deferred.hint && (await progressQ(page)).includes("deferred: 0"), { ...deferred, progress: await progressQ(page) });
  await page.fill("#qnote-3", "Not now.");
  check("themed: reasoned deferral counts", (await progressQ(page)).includes("deferred: 1"), await progressQ(page));
  const [draftDownload] = await Promise.all([page.waitForEvent("download"), page.click("#export-json-top")]);
  const draftPath = path.join(OUT, "decisions-draft.json");
  await draftDownload.saveAs(draftPath);
  const draftExport = JSON.parse(fs.readFileSync(draftPath, "utf8"));
  check("themed: a deferred variant exports as a draft, schema 4", draftExport.schema_version === 4 && draftExport.questions.find((q) => q.question === 3)?.variant_draft === true
    && draftExport.questions.find((q) => q.question === 3)?.status === "deferred" && Array.isArray(draftExport.applyWithoutVariant) && draftExport.applyWithoutVariant.length === 0, draftExport.questions);
  // Re-picking accepts; the outside variant retires the child with a gate, never silently.
  await radio(page, 3, "status-quo");
  const retired = await page.evaluate(() => ({ na: document.getElementById("q4").classList.contains("na"), disabled: document.querySelector("#q4 input[data-question-variant]").disabled,
    gate: document.querySelector("#q4 [data-qgate]").textContent, badge: !document.querySelector("#q4 .na-badge").hidden }));
  check("themed: outside variant retires the child with a gate", retired.na && retired.disabled && retired.gate.includes("Q3") && retired.badge, retired);
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("#export-json-top")]);
  const exportPath = path.join(OUT, "decisions-export.json");
  await download.saveAs(exportPath);
  const exported = JSON.parse(fs.readFileSync(exportPath, "utf8"));
  const recordSha = createHash("sha256").update(fs.readFileSync(themed.record)).digest("hex");
  check("themed: export schema and digests", exported.schema_version === 4 && exported.record_sha256 === recordSha && exported.diff_sha256 === THEMED.diff.sha256);
  check("themed: export variant id and text", exported.questions.find((q) => q.question === 3)?.variant?.id === "status-quo" && typeof exported.questions.find((q) => q.question === 3)?.variant?.text === "string");
  check("themed: retired child exported not-applicable", exported.questions.find((q) => q.question === 4)?.status === "not-applicable");
  // Reset re-applies the child; its old answer does not return silently.
  await page.click("#q3 [data-qreset]");
  const revived = await page.evaluate(() => ({ na: document.getElementById("q4").classList.contains("na"), checked: document.querySelector('input[name="vq4"]:checked') !== null }));
  check("themed: reset does not reactivate the old answer", !revived.na && !revived.checked, revived);
  check("themed: remaining back to two", (await progressQ(page)).includes("remaining: 2"), await progressQ(page));
  // The viewer: fit, actual size, prev/next, Escape, focus return.
  await tab(page, "materials");
  await page.click("button.shot-open");
  check("viewer: opens in fit mode", await page.evaluate(() => document.getElementById("zoom-dialog").open && document.getElementById("zoom-dialog").dataset.mode === "fit"));
  await page.click("[data-zoom-full]");
  check("viewer: actual size", await page.evaluate(() => document.getElementById("zoom-dialog").dataset.mode === "1:1"));
  await page.click("[data-zoom-next]");
  check("viewer: next picture", (await page.textContent("#zoom-count")).trim() === "2 / 2");
  await page.keyboard.press("Escape");
  check("viewer: Escape closes and returns focus", !(await page.evaluate(() => document.getElementById("zoom-dialog").open)) && await page.evaluate(() => document.activeElement?.classList.contains("shot-open")));
  await page.focus("img.shot-zoom"); await page.keyboard.press("Enter");
  check("viewer: keyboard opens", await page.evaluate(() => document.getElementById("zoom-dialog").open));
  await page.keyboard.press("Escape");
  // Deep links open the right tab and reveal the target, in any verdict mode.
  await page.goto(themed.url + "#b1", { waitUntil: "load" });
  await page.waitForFunction(() => { const r = document.getElementById("b1")?.getBoundingClientRect(); return r && r.top >= 0 && r.top < innerHeight; }, null, { timeout: 5000 });
  check("deep link: #b1 (a kept block) opens the code tab in full mode", await page.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "code"
    && document.getElementById("map").dataset.show === "all" && document.getElementById("b1").querySelector(".segcode").open));
  await page.goto(themed.url + "#q4", { waitUntil: "load" });
  await page.waitForFunction(() => { const r = document.getElementById("q4").getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }, null, { timeout: 5000 });
  check("deep link: #q4 opens the decisions tab", await page.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "decisions"));
  await page.goto(themed.url + "#shot-2", { waitUntil: "load" });
  await page.waitForFunction(() => { const r = document.getElementById("shot-2").getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }, null, { timeout: 5000 });
  check("deep link: #shot-2 opens the materials tab (C3)", await page.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "materials"));
  await page.goto(themed.url + "#f1-code", { waitUntil: "load" });
  await page.waitForTimeout(300);
  const fChip = await page.evaluate(() => ({ tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab, chip: !document.getElementById("filter-chip").hidden,
    label: document.getElementById("filter-chip-label").textContent, pos: document.getElementById("filter-pos").textContent, f: document.getElementById("map").dataset.f }));
  check("deep link: #f1-code filters the map with a chip (F filter)", fChip.tab === "code" && fChip.chip && fChip.label.includes("F1") && fChip.pos === "1 / 1" && fChip.f === "1", fChip);
  // The chip's «back» returns to where the filter was started: a finding's «Show in the map» button.
  await page.goto(themed.url, { waitUntil: "load" }); await page.waitForTimeout(200);
  await tab(page, "findings");
  await page.evaluate(() => window.scrollTo(0, 120)); await page.waitForTimeout(100);
  await page.click('[data-f-filter="1"]'); await page.waitForTimeout(250);
  check("F filter: a finding's button opens its blocks in the map", await page.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "code"
    && document.getElementById("map").dataset.f === "1" && !document.getElementById("filter-chip").hidden));
  await page.click("#filter-back");
  await page.waitForTimeout(250);
  const backState = await page.evaluate(() => ({ tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab, chipHidden: document.getElementById("filter-chip").hidden, y: window.scrollY }));
  check("filter chip: back returns to the source tab and scroll", backState.tab === "findings" && backState.chipHidden && Math.abs(backState.y - 120) < 5, backState);
  // Scroll memory between tabs.
  await page.goto(themed.url, { waitUntil: "load" }); await page.waitForTimeout(200);
  await tab(page, "findings");
  await page.evaluate(() => window.scrollTo(0, 250)); await page.waitForTimeout(100);
  await tab(page, "overview"); await tab(page, "findings"); await page.waitForTimeout(250);
  check("scroll memory: a tab restores its scroll", Math.abs(await page.evaluate(() => window.scrollY) - 250) < 5, await page.evaluate(() => window.scrollY));
  // Tabs keyboard navigation.
  await page.focus("#tab-overview"); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(150);
  check("tabs: ArrowRight activates the next tab", await page.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "decisions"));
  // Theme: the 32px icon in the header, the cycle, prefers-color-scheme default.
  const themeGeom = await page.evaluate(() => { const b = document.getElementById("theme-toggle"), r = b.getBoundingClientRect();
    return { inHeader: !!b.closest("header.page-head"), notInBar: !b.closest(".bar"), w: Math.round(r.width), h: Math.round(r.height), state: b.dataset.state, aria: b.getAttribute("aria-label"), title: b.title }; });
  check("theme: 32px icon in the header, not the bar", themeGeom.inHeader && themeGeom.notInBar && themeGeom.w === 32 && themeGeom.h === 32 && themeGeom.state === "auto" && themeGeom.aria && themeGeom.title, themeGeom);
  await page.click("#theme-toggle");
  check("theme: auto -> light", await page.evaluate(() => document.documentElement.dataset.theme === "light" && document.getElementById("theme-toggle").dataset.state === "light"));
  await page.click("#theme-toggle");
  check("theme: light -> dark", await page.evaluate(() => document.documentElement.dataset.theme === "dark"));
  await page.click("#theme-toggle");
  check("theme: dark -> auto", await page.evaluate(() => !document.documentElement.dataset.theme && document.getElementById("theme-toggle").dataset.state === "auto"));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload({ waitUntil: "load" }); await page.waitForTimeout(200);
  check("theme: prefers-color-scheme dark is the default", await page.evaluate(() => !document.documentElement.dataset.theme && getComputedStyle(document.body).backgroundColor === "rgb(17, 21, 28)"));
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload({ waitUntil: "load" }); await page.waitForTimeout(200);
  // Structure: the target diagram closed by default; a deep link does not force it open.
  const structure = await page.evaluate(() => { const d = document.querySelector(".structure-target"); return { found: !!d, closed: d ? !d.open : null, hasSvg: !!d?.querySelector("svg") }; });
  check("structure: target diagram closed by default", structure.found && structure.closed && structure.hasSvg, structure);
  await page.goto(themed.url + "#structure", { waitUntil: "load" }); await page.waitForTimeout(300);
  check("structure: deep link scrolls but keeps the diagram closed", await page.evaluate(() => !document.querySelector(".structure-target").open));
  await page.click(".structure-target > summary");
  check("structure: the diagram opens on click", await page.evaluate(() => document.querySelector(".structure-target").open));
  check("C1 absent: no next-unresolved control", await page.evaluate(() => !document.querySelector("[data-next-unresolved], #next-unresolved")
    && !document.body.textContent.includes("next unresolved") && !document.body.textContent.includes("следующее нерешённое")));
  // C2: the tree name filter, AND with purpose.
  await tab(page, "code");
  await page.click('[data-show="all"]'); await page.waitForTimeout(200);
  await page.fill("#tree-filter-input", "archive");
  const treeFiltered = await page.evaluate(() => ({ visible: [...document.querySelectorAll(".frow")].filter((r) => r.style.display !== "none").length,
    names: [...document.querySelectorAll(".frow")].filter((r) => r.style.display !== "none").map((r) => r.querySelector(".fname").textContent), count: document.getElementById("tree-filter-count").textContent }));
  check("C2: the tree filters by name", treeFiltered.visible === 2 && treeFiltered.names.every((n) => n.includes("archive")) && treeFiltered.count.includes("2"), treeFiltered);
  await page.click('[data-purpose-filter="tests"]');
  const treeAnd = await page.evaluate(() => [...document.querySelectorAll(".frow")].filter((r) => r.style.display !== "none").map((r) => r.querySelector(".fname").textContent));
  check("C2: name AND purpose", treeAnd.length === 1 && treeAnd[0].includes("archive.test"), treeAnd);
  await page.click("#tree-filter-clear");
  await page.click('[data-purpose-filter="tests"]'); // toggle purpose off
  check("C2: reset restores the tree", await page.evaluate(() => [...document.querySelectorAll(".frow")].every((r) => r.style.display !== "none")));
  // Purpose filter on the map.
  await page.click('[data-purpose-filter="tests"]'); await page.waitForTimeout(150);
  const purposeMap = await page.evaluate(() => ({ segs: [...document.querySelectorAll("#map .seg[data-block]")].filter((s) => s.style.display !== "none").map((s) => s.dataset.purpose),
    chip: document.getElementById("filter-chip-label").textContent }));
  check("purpose: the map filters by purpose with a chip", purposeMap.segs.length === 2 && purposeMap.segs.every((p) => p === "tests") && purposeMap.chip.includes("Tests"), purposeMap);
  await page.click("#filter-clear"); await page.waitForTimeout(150);
  // The honest export: «Copied» only on a confirmed success; on refusal the text is selected and said so.
  await tab(page, "decisions");
  await page.evaluate(() => { navigator.clipboard.writeText = (t) => { window.__copied = t; return Promise.resolve(); }; });
  await page.click("#copy-top"); await page.waitForTimeout(150);
  const copyOk = await page.evaluate(() => ({ label: document.getElementById("copy-top").textContent, copied: window.__copied === document.getElementById("out").value, status: document.getElementById("annotation-status").textContent }));
  check("export: «Copied» only after a confirmed success", copyOk.label === "Copied" && copyOk.copied && copyOk.status === "Copied", copyOk);
  await page.waitForTimeout(1600);
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error("denied")); });
  await page.click("#copy-top"); await page.waitForTimeout(250);
  const copyFail = await page.evaluate(() => ({ label: document.getElementById("copy-top").textContent, status: document.getElementById("annotation-status").textContent,
    selected: document.getElementById("out").selectionStart === 0 && document.getElementById("out").selectionEnd === document.getElementById("out").value.length,
    tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab }));
  check("export: refusal selects the text and says Ctrl/⌘+C, never «Copied»", copyFail.label !== "Copied" && copyFail.status.includes("Ctrl") && copyFail.selected && copyFail.tab === "materials", copyFail);
  // The popover's source copy is honest the same way.
  await tab(page, "code");
  await page.click('[data-segpop="2"]'); await page.waitForTimeout(100);
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error("denied")); });
  await page.click("#seg-popover .pop-copy"); await page.waitForTimeout(150);
  const popFail = await page.evaluate(() => ({ status: document.querySelector("#seg-popover .pop-copy-status")?.textContent ?? "", btn: document.querySelector("#seg-popover .pop-copy").textContent }));
  check("popover: a refused source copy says so and selects the source", popFail.status.includes("Ctrl") && popFail.btn !== "Copied", popFail);
  await page.evaluate(() => { navigator.clipboard.writeText = (t) => { window.__popCopied = t; return Promise.resolve(); }; });
  await page.click("#seg-popover .pop-copy"); await page.waitForTimeout(150);
  check("popover: a confirmed source copy says «Copied» and carries path:line (revision)", await page.evaluate(() => document.querySelector("#seg-popover .pop-copy").textContent === "Copied"
    && /test\/archive\.test\.js:1 \(.+\)/.test(window.__popCopied)), await page.evaluate(() => window.__popCopied));
  await page.keyboard.press("Escape");
  check("popover: Escape closes and returns focus", await page.evaluate(() => document.getElementById("seg-popover").hidden && document.activeElement?.dataset.segpop === "2"));
  // Print profiles: the auditor opens everything, the owner hides the map and the tree; both restore.
  // Headless Chromium fires beforeprint on window.print() itself; stub it so the profiles are driven deterministically.
  await page.goto(themed.url, { waitUntil: "load" }); await page.waitForTimeout(200);
  await page.evaluate(() => { window.print = () => {}; });
  await tab(page, "code"); await page.click('[data-show="attention"]'); await page.waitForTimeout(150);
  const beforePrint = await page.evaluate(() => ({ inserted: document.querySelectorAll(".file-lazy .file").length, open: document.querySelectorAll("details[open]").length }));
  await tab(page, "materials");
  await page.click("#print-audit");
  await page.evaluate(() => { window.dispatchEvent(new Event("beforeprint")); });
  const auditPrint = await page.evaluate(() => ({ open: [...document.querySelectorAll("details")].every((d) => d.open), inserted: document.querySelectorAll(".file-lazy .file").length }));
  check("print: auditor opens every disclosure and file", auditPrint.open && auditPrint.inserted === 3, auditPrint);
  await page.evaluate(() => { window.dispatchEvent(new Event("afterprint")); });
  const afterAudit = await page.evaluate(() => ({ inserted: document.querySelectorAll(".file-lazy .file").length, open: document.querySelectorAll("details[open]").length, show: document.getElementById("map").dataset.show }));
  check("print: afterprint restores the lazy files and disclosures", afterAudit.inserted === beforePrint.inserted && afterAudit.open === beforePrint.open && afterAudit.show === "attention", { beforePrint, afterAudit });
  await page.click("#print-owner");
  await page.evaluate(() => { window.dispatchEvent(new Event("beforeprint")); });
  const ownerPrint = await page.evaluate(() => ({ map: document.getElementById("map").style.display, tree: document.querySelector(".tree-col").style.display }));
  check("print: owner hides the map and the tree", ownerPrint.map === "none" && ownerPrint.tree === "none", ownerPrint);
  await page.evaluate(() => { window.dispatchEvent(new Event("afterprint")); });
  check("print: owner profile restores", await page.evaluate(() => document.getElementById("map").style.display !== "none" && document.querySelector(".tree-col").style.display !== "none"));
  await page.emulateMedia({ media: "print" });
  check("print: controls hidden, every panel prints", await page.evaluate(() => getComputedStyle(document.querySelector(".bar")).display === "none"
    && [...document.querySelectorAll(".panel")].every((p) => getComputedStyle(p).display !== "none")));
  await page.emulateMedia({ media: "screen" });
  // Fonts and tap targets.
  const fonts = await page.evaluate(() => ({ html: getComputedStyle(document.documentElement).fontSize, body: getComputedStyle(document.body).fontSize,
    sub: parseFloat(getComputedStyle(document.querySelector(".sub")).fontSize), tag: parseFloat(getComputedStyle(document.querySelector(".tag")).fontSize) }));
  check("font: 14px base, secondary >= 12px", fonts.html === "14px" && fonts.body === "14px" && fonts.sub >= 12 && fonts.tag >= 12, fonts);
  const tap = {};
  for (const id of ["overview", "decisions", "findings", "code", "checks", "materials"]) {
    await tab(page, id);
    tap[id] = await page.evaluate(() => { let min = 999;
      for (const el of document.querySelectorAll("button, [role=tab], input[type=text], .qopt")) {
        if (el.offsetParent === null || el.closest("[hidden]")) continue;
        const r = el.getBoundingClientRect(); if (!r.height) continue;
        if (r.height < min) min = r.height;
      }
      return +min.toFixed(1); });
  }
  check("tap targets >= 32px on every tab", Object.values(tap).every((v) => v >= 32), tap);
  await page.screenshot({ path: path.join(OUT, "themed-first-screen.png") });
  await context.close();
  results.themed = { loadMs, htmlBytes: fs.statSync(themed.html).size, domNodes: initial.domNodes };
}
console.error("[run] resolved-cue section");
{
  const { page, context } = await open(resolved.url);
  await tab(page, "decisions");
  await radio(page, 3, "extend");
  await tab(page, "code"); await page.waitForTimeout(200);
  check("C4: a decided question cues its block in attention mode, never hides it", await page.evaluate(() => {
    const seg = document.querySelector('.seg[data-block="2"]');
    return seg.classList.contains("q-resolved") && seg.style.display !== "none" && getComputedStyle(seg).display !== "none";
  }));
  await context.close();
}
console.error("[run] mobile section");
{
  const { page, context } = await open(themed.url, { viewport: { width: 390, height: 844 } });
  await tab(page, "decisions");
  await radio(page, 3, "extend");
  const draft = await page.evaluate(() => ({ chip: document.querySelector("#q3 [data-qstatus]").textContent, state: document.querySelector("#q3 [data-qstatus]").dataset.state,
    confirm: !document.querySelector("#q3 [data-confirm]").hidden, progress: document.getElementById("progress-q").textContent }));
  check("mobile: a tap is a draft to confirm, not a decision", draft.state === "draft" && draft.confirm && draft.progress.includes("accepted: 0"), draft);
  await page.click("#q3 [data-confirm]");
  check("mobile: «Confirm selection» fixes the decision", (await progressQ(page)).includes("accepted: 1") && (await page.evaluate(() => document.querySelector("#q3 [data-qstatus]").dataset.state)) === "decided");
  check("mobile: no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
  await context.close();
}
console.error("[run] no-JS section");
{
  const { page, context } = await open(themed.url, { javaScriptEnabled: false });
  check("no-JS: page stays unscripted", !((await page.locator("html").getAttribute("class")) ?? "").includes("js"));
  check("no-JS: every panel reads stacked", await page.evaluate(() => [...document.querySelectorAll(".panel")].every((p) => !p.hidden && p.getBoundingClientRect().height > 0)));
  check("no-JS: card text and variants read", (await page.textContent("#q3 .qquestion")).includes("Keep the conversion") && (await page.textContent("#q3 .qopts")).includes("No new unit"));
  check("no-JS: radios, zones and controls are disabled and say they need JS",
    await page.locator('#q3 input[data-question-variant]').first().isDisabled() && await page.locator('#q1 input[data-zone]').first().isDisabled()
    && await page.locator('[data-purpose-filter="tests"]').isDisabled() && await page.locator("#tree-filter-input").isDisabled()
    && (await page.textContent("#q3 .qopts")).includes("JavaScript"));
  check("no-JS: the noscript note reads", (await page.textContent("noscript")).includes("JavaScript"));
  await page.click("#file-0 > details.file-details > summary");
  check("no-JS: the map opens natively per file and reads", await page.locator("#b1").isVisible() && (await page.locator("#map .seg[data-block]").count()) === 3);
  await page.click(".passport-card > summary");
  check("no-JS: passport body reads", (await page.textContent(".passport-body")).includes("example/repo"));
  check("no-JS: tabs are anchor links", await page.evaluate(() => [...document.querySelectorAll(".tabs [role=tab]")].every((t) => t.getAttribute("href") === "#panel-" + t.dataset.tab)));
  await context.close();
}
console.error("[run] 65507 section");
if (big) {
  const { page, context, loadMs } = await open(big.url);
  await injectHelpers(page);
  const initial = await page.evaluate(() => {
    // The lazy templates hold the canonical markup: count anchors and segments across templates and document.
    const tplSegs = [...document.querySelectorAll('template[id^="segs-"]')].flatMap((t) => [...t.content.querySelectorAll(".seg[data-block]")]);
    const allSegs = [...tplSegs, ...document.querySelectorAll("#map .seg[data-block]")];
    return { qcards: document.querySelectorAll(".qcard").length, files: document.querySelector(".counters .c b")?.textContent,
      anchors: allSegs.filter((s) => s.id).length, segs: allSegs.length, unique: new Set(allSegs.map((s) => s.dataset.block)).size,
      domNodes: document.querySelectorAll("*").length, templates: document.querySelectorAll("template[id^=segs-]").length };
  });
  check("65507: thirteen cards, one anchor per block, lazy templates", initial.qcards === 13 && initial.anchors === 1470 && initial.unique === 1470 && initial.segs >= 1470 && initial.templates === 96, initial);
  check("65507: counters show 96 files", initial.files === "96", initial);
  // The purpose counters equal the model embedded in the page.
  const purpose = await page.evaluate(() => { const d = JSON.parse(document.getElementById("data").textContent);
    const counts = {}; for (const b of d.blocks) counts[b.purpose] = (counts[b.purpose] || 0) + 1;
    const bar = [...document.querySelectorAll("[data-purpose-filter]")].map((b) => ({ cat: b.dataset.purposeFilter, lines: +b.querySelector("b").textContent }));
    return { counts, bar, blocks: d.blocks.length, totalLines: d.blocks.reduce((s, b) => s + b.size, 0) }; });
  check("65507: purpose counters are the model's", Object.values(purpose.counts).reduce((a, b) => a + b, 0) === purpose.blocks
    && purpose.bar.length === 6 && purpose.bar.reduce((s, c) => s + c.lines, 0) === purpose.totalLines, purpose);
  // The evidence banner: one question, not many decisions.
  const banner = await page.evaluate(() => { const b = [...document.querySelectorAll(".evidence-banner")].find((x) => x.querySelector(".tag").textContent === "Q3");
    return b ? b.textContent : null; });
  check("65507: the Q3 banner names 224 blocks and 229 fragments as one question", banner && banner.includes("224") && banner.includes("229") && banner.includes("Q3"), banner?.slice(0, 160));
  // Deep links.
  await page.goto(big.url + "#q9", { waitUntil: "load" });
  await page.waitForFunction(() => { const r = document.getElementById("q9").getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }, null, { timeout: 5000 });
  check("65507: deep link #q9", await page.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "decisions"));
  // #b2 in every verdict mode.
  for (const mode of ["attention", "keep", "fix", "remove", "question", "all"]) {
    await page.goto(big.url, { waitUntil: "load" }); await page.waitForTimeout(150);
    await tab(page, "code");
    await page.click(`[data-show="${mode}"]`); await page.waitForTimeout(150);
    await page.goto(big.url + "#b2", { waitUntil: "load" });
    await page.waitForFunction(() => { const el = document.getElementById("b2"); if (!el) return false; const r = el.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight && getComputedStyle(el).display !== "none"; }, null, { timeout: 8000 });
    check(`65507: deep link #b2 reveals the block in ${mode} mode`, await page.evaluate(() => document.getElementById("map").dataset.show === "all" && document.getElementById("b2").getBoundingClientRect().top >= 0));
  }
  // Children under Q2: keep opens them, base retires them with a draft.
  await page.goto(big.url, { waitUntil: "load" }); await page.waitForTimeout(200);
  await tab(page, "decisions");
  await radio(page, 2, "keep");
  check("65507: children active under the kept variant", await page.evaluate(() => ![9, 10, 11].some((n) => document.getElementById("q" + n).classList.contains("na"))));
  await radio(page, 9, "keep");
  await radio(page, 2, "base");
  const na = await page.evaluate(() => ({ cards: [9, 10, 11].every((n) => document.getElementById("q" + n).classList.contains("na") && document.querySelector(`#q${n} input[data-question-variant]`).disabled),
    gate: document.querySelector("#q9 [data-qgate]").textContent, draft: document.querySelector("#q9 [data-qdraft]").textContent,
    counters: document.getElementById("progress-q").textContent }));
  check("65507: base retires the children, the pick stays a draft", na.cards && na.gate.includes("Q2") && (na.gate.includes("черновик") || na.draft.length > 0) && /неприменимо: 3|not applicable: 3/.test(na.counters), na);
  // Full materialization for the worst-case walks (the deep-link navigations reset the injected helpers).
  await injectHelpers(page);
  await tab(page, "code");
  await page.click('[data-show="all"]'); await page.waitForTimeout(400);
  await page.evaluate(() => { document.querySelectorAll("details").forEach((d) => window.__po(d)); });
  await page.waitForTimeout(400);
  const fullMap = await page.evaluate(() => ({ inserted: document.querySelectorAll(".file-lazy .file").length,
    unique: new Set([...document.querySelectorAll("#map .seg[data-block]")].map((s) => s.dataset.block)).size,
    segs: document.querySelectorAll("#map .seg[data-block]").length, ctx: document.querySelectorAll("#map .l.ctx").length,
    add: document.querySelectorAll("#map .l.add").length, del: document.querySelectorAll("#map .l.del").length }));
  check("65507: the full audit materializes 96 files, 1470 unique blocks", fullMap.inserted === 96 && fullMap.unique === 1470 && fullMap.segs >= 1470 && fullMap.ctx > 0 && fullMap.add > 0 && fullMap.del > 0, fullMap);
  // Diff layers: the change kind paints the line, never the verdict; both themes pass the full walk.
  const probes = await page.evaluate(() => {
    const mark = (l, name) => { if (!l) return null; window.__po(l.closest(".segcode")); l.dataset.probe = name; return `[data-probe="${name}"]`; };
    return { keepDel: mark(document.querySelector(".seg.v-keep .l.del"), "keepDel"), removeAdd: mark(document.querySelector(".seg.v-remove .l.add"), "removeAdd"),
      fixDel: mark(document.querySelector(".seg.v-fix .l.del"), "fixDel"), questionAdd: mark(document.querySelector(".seg.v-question .l.add"), "questionAdd"),
      ctx: mark([...document.querySelectorAll("#map .l.ctx")].find((x) => x.querySelector("span[style]")) || document.querySelector("#map .l.ctx"), "ctx") };
  });
  const measureDiff = () => page.evaluate((sels) => {
    const out = {};
    for (const [k, sel] of Object.entries(sels)) out[k] = sel ? window.__c.lineColors(sel) : null;
    out.shikiDualPresent = !!document.querySelector('#map .l span[style*="--shiki-dark"]');
    out.fullWalk = window.__walk();
    const chip = document.getElementById("filter-chip"), wasHidden = chip.hidden;
    chip.hidden = false;
    const ccs = getComputedStyle(chip), lcs = getComputedStyle(document.getElementById("filter-chip-label"));
    out.chipRatio = +window.__c.ratio(window.__c.parse(lcs.color), window.__c.parse(ccs.backgroundColor)).toFixed(2);
    chip.hidden = wasHidden;
    return out;
  }, probes);
  const diffLight = await measureDiff();
  check("65507: light diff layers — add/del independent of verdict, full token walk >= 4.5", diffLight.shikiDualPresent && diffLight.fullWalk.below45 === 0 && diffLight.fullWalk.gutterBelow45 === 0
    && diffLight.fullWalk.tokens > 1000 && diffLight.chipRatio >= 4.5
    && (!diffLight.keepDel || diffLight.keepDel.textRatio >= 4.5) && (!diffLight.removeAdd || diffLight.removeAdd.textRatio >= 4.5), diffLight);
  await page.click("#theme-toggle"); await page.click("#theme-toggle"); // auto -> light -> dark
  await page.waitForTimeout(200);
  const diffDark = await measureDiff();
  check("65507: dark diff layers — full token walk >= 4.5", diffDark.fullWalk.below45 === 0 && diffDark.fullWalk.gutterBelow45 === 0 && diffDark.chipRatio >= 4.5
    && await page.evaluate(() => document.documentElement.dataset.theme === "dark"), diffDark);
  await page.click("#theme-toggle");
  // Horizontal scroll at six widths and zoom 200%, on every tab.
  const scroll = {};
  for (const width of [320, 375, 768, 1024, 1366, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.waitForTimeout(150);
    const perTab = {};
    for (const id of ["overview", "decisions", "findings", "code", "checks", "materials"]) {
      await tab(page, id);
      perTab[id] = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    }
    scroll[width] = Object.values(perTab).every((v) => v.sw === v.cw);
    if (!scroll[width]) scroll[`${width}-detail`] = perTab;
  }
  check("65507: no horizontal overflow at 320-1440 on every tab", Object.entries(scroll).filter(([k]) => !k.includes("detail")).every(([, v]) => v === true), scroll);
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.addStyleTag({ content: "html{zoom:2}" }); await page.waitForTimeout(200);
  const zoom = {};
  for (const id of ["overview", "decisions", "code", "materials"]) {
    await tab(page, id);
    zoom[id] = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  }
  check("65507: no horizontal overflow at zoom 200%", Object.values(zoom).every((v) => v.sw === v.cw), zoom);
  await page.evaluate(() => { [...document.querySelectorAll("style")].filter((s) => s.textContent.includes("zoom:2")).forEach((s) => s.remove()); });
  // Print at scale: the auditor opens all 1470 fragments.
  await page.goto(big.url, { waitUntil: "load" }); await page.waitForTimeout(200);
  await page.evaluate(() => { window.print = () => {}; });
  await tab(page, "materials");
  await page.click("#print-owner");
  await page.evaluate(() => { window.dispatchEvent(new Event("beforeprint")); });
  const ownerAtScale = await page.evaluate(() => ({ map: document.getElementById("map").style.display, tree: document.querySelector(".tree-col").style.display }));
  check("65507: owner print hides the map and the tree", ownerAtScale.map === "none" && ownerAtScale.tree === "none", ownerAtScale);
  await page.evaluate(() => { window.dispatchEvent(new Event("afterprint")); });
  const beforeAudit = await page.evaluate(() => document.querySelectorAll(".file-lazy .file").length);
  await page.click("#print-audit");
  await page.evaluate(() => { window.dispatchEvent(new Event("beforeprint")); });
  await tab(page, "code"); // visibility is measured on the active panel
  const audit = await page.evaluate(() => ({ open: [...document.querySelectorAll("details")].every((d) => d.open),
    visibleB: [...document.querySelectorAll('.seg[id^="b"]')].filter((el) => el.getBoundingClientRect().height > 0 || el.closest("details[open]")).length }));
  check("65507: auditor print opens all 1470 fragments", audit.open && audit.visibleB === 1470, audit);
  await page.evaluate(() => { window.dispatchEvent(new Event("afterprint")); });
  check("65507: afterprint removes the audit-only files", await page.evaluate((n) => document.querySelectorAll(".file-lazy .file").length === n, beforeAudit), beforeAudit);
  await page.screenshot({ path: path.join(OUT, "65507-first-screen.png") });
  await context.close();
  results.big = { loadMs, htmlBytes: big.bytes, domNodes: initial.domNodes };
  check("65507: the immutable original is untouched", createHash("sha256").update(fs.readFileSync(path.join(SOURCE, "review.json"))).digest("hex") === bigSha);
  // no-JS at scale: the map is real markup in closed disclosures, every B anchor present.
  const noJs = await open(big.url, { javaScriptEnabled: false });
  check("65507 no-JS: all 1470 B anchors are real markup", await noJs.page.evaluate(() => document.querySelectorAll('#map .seg[id^="b"]').length === 1470 && !document.querySelector("template")));
  await noJs.page.click("#file-95 > details.file-details > summary");
  check("65507 no-JS: the last file opens and B1470 reads", await noJs.page.locator("#b1470").isVisible());
  check("65507 no-JS: cards read", (await noJs.page.textContent("#q2 .qopts")).includes("focus"));
  await noJs.context.close();
} else results.checks.push({ name: "65507 part", ok: true, detail: "skipped: the record is not on this machine" });
console.error("[run] PDF section");
if (big && pdfjs) {
  const { page, context } = await open(big.url);
  // page.pdf fires its own beforeprint/afterprint; stub window.print so the button only selects the profile.
  await page.evaluate(() => { window.print = () => {}; });
  await tab(page, "materials");
  await page.click("#print-owner");
  const ownerPdf = path.join(OUT, "65507-owner.pdf");
  await page.pdf({ path: ownerPdf });
  const ownerText = await pdfText(ownerPdf);
  check("PDF owner: the screens and the coverage limits print, the map does not", ownerText.includes(big.screenName) && ownerText.includes(big.limit) && !hasB(ownerText, 1470),
    { screen: ownerText.includes(big.screenName), limit: ownerText.includes(big.limit), mapClosed: !hasB(ownerText, 1470) });
  await page.click("#print-audit");
  const auditorPdf = path.join(OUT, "65507-auditor.pdf");
  await page.pdf({ path: auditorPdf });
  const auditorText = await pdfText(auditorPdf);
  const missing = [];
  for (let n = 1; n <= 1470; n++) if (!hasB(auditorText, n)) missing.push(n);
  check("PDF auditor: all 1470 B addresses are in the PDF text", missing.length === 0, missing.slice(0, 10));
  await context.close();
  results.pdf = { ownerBytes: fs.statSync(ownerPdf).size, auditorBytes: fs.statSync(auditorPdf).size };
} else if (big) results.checks.push({ name: "PDF part", ok: true, detail: "skipped: pdfjs-dist is not available (set PDFJS_DIST)" });
console.error("[run] annotations section");
{
  const { page, context } = await open(legacyRu.url + "#panel-checks");
  const fn = new Function(`return (${fs.readFileSync(path.join(HERE, "review-annotations.browser.mjs"), "utf8")})`)();
  try { await fn(page); check("legacy annotations runtime on the v4 page", true); }
  catch (e) { check("legacy annotations runtime on the v4 page", false, String(e)); }
  await context.close();
}
check("no page or console errors anywhere", errors.length === 0, errors.slice(0, 5));
await browser.close();
fs.writeFileSync(path.join(OUT, "browser-validation-v4.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ checks: results.checks.length, failures: results.failures, themed: results.themed, big: results.big, pdf: results.pdf }, null, 2));
process.exit(results.failures.length ? 1 : 0);