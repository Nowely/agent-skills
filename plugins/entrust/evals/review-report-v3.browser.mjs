#!/usr/bin/env node
// Browser acceptance of the v3 report core, on the records the suite renders: the themed record with decision
// cards, a copy of the real 65507 record enriched with the new fields, and the legacy annotation runtime.
// Runs nothing but the report's own page; no app or source code is executed.
//
//   PLAYWRIGHT_CORE=<path to playwright-core/index.mjs> node evals/review-report-v3.browser.mjs [out-dir]
//
// playwright-core is a verification tool here, not a dependency of the plugin; the Chromium binary defaults to
// the Playwright cache's Chrome for Testing. Without the 65507 record on the machine, that part is skipped.
// PDFJS_DIST=<path to pdfjs-dist/legacy/build/pdf.mjs> adds the real-PDF acceptance (owner and auditor profiles);
// without it the PDF part is skipped.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepare } from "./review/prepare.mjs";
import { reportFixtures, enrich65507 } from "./review/report-fixtures.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_CORE ?? "playwright-core");
// PDF text extraction, like playwright-core, is a verification tool: resolved from PDFJS_DIST or the environment.
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
const OUT = process.argv[2] ?? fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "review-v3-browser-"));
fs.mkdirSync(OUT, { recursive: true });
const results = { out: OUT, checks: [], failures: [] };
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
console.error("[setup] themed rendered");
const themed = render(THEMED, "themed.json");
console.error("[setup] legacy rendered");
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
  console.error("[setup] 65507 copy rendered");
  big = { record: file, html: file.replace(/\.json$/, ".html"), url: `file://${file.replace(/\.json$/, ".html")}`, bytes: fs.statSync(file.replace(/\.json$/, ".html")).size,
    screenName: record.screens?.[0]?.name, limit: record.coverageStructured?.find((c) => c.kind === "not_checked")?.text };
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const errors = [];
const watch = (page) => { page.on("pageerror", (e) => errors.push(String(e))); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); }); };
const open = async (url, options = {}) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1600 }, ...options });
  const page = await context.newPage();
  watch(page);
  const t0 = Date.now();
  await page.goto(url, { waitUntil: "load" });
  // addStyleTag evaluates in the page; with scripts disabled it never resolves, and none is needed there.
  if (options.javaScriptEnabled !== false) await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  return { page, context, loadMs: Date.now() - t0 };
};
const state = (page) => page.evaluate(() => { const d = JSON.parse(document.getElementById("data").textContent); return JSON.parse(localStorage.getItem("review-report:" + d.key) || "{}"); });
const progressQ = (page) => page.evaluate(() => document.getElementById("progress-q")?.textContent ?? "");
const accept = (page, q) => page.click(`.qcard#q${q} .decide button[value="accepted"]`);
const radio = (page, q, value) => page.check(`input[name="vq${q}"][value="${value}"]`);

console.error("[run] themed section");
// ---- the themed record: decision flow, viewer, print, deep links ----
{
  const { page, context, loadMs } = await open(themed.url);
  const initial = await page.evaluate(() => ({ js: document.documentElement.classList.contains("js"), qcards: document.querySelectorAll(".qcard").length,
    counters: document.querySelector(".counters")?.textContent ?? "", domNodes: document.querySelectorAll("*").length }));
  check("themed: page runs with five cards", initial.js && initial.qcards === 5, initial);
  check("themed: the no-JS hint hides and the radios are live under the runtime", await page.locator("#q3 .nojs-note").isHidden() && await page.locator('#q3 input[data-question-variant]').first().isEnabled());
  check("themed: decision counters start at remaining 2", (await progressQ(page)).includes("remaining: 2"), await progressQ(page));
  check("themed: evidence card has no accept control", await page.locator("#q1 .decide").count() === 0);
  // An acceptance without a variant is not a decision: it counts nothing, retires no child, exports "remaining".
  await accept(page, 3);
  const bareAccept = await page.evaluate(() => ({ na: document.getElementById("q4").classList.contains("na"),
    hint: !document.querySelector("#q3 .requires-content").hidden, text: document.getElementById("out").value }));
  check("themed: acceptance without a variant decides nothing", (await progressQ(page)).includes("accepted: 0") && !bareAccept.na && bareAccept.hint
    && !bareAccept.text.includes("[accepted]"), { progress: await progressQ(page), ...bareAccept });
  const [bareDownload] = await Promise.all([page.waitForEvent("download"), page.click("#export-json")]);
  const barePath = path.join(OUT, "decisions-bare-accept.json");
  await bareDownload.saveAs(barePath);
  const bareExport = JSON.parse(fs.readFileSync(barePath, "utf8"));
  check("themed: bare acceptance exports remaining, child stays active", bareExport.questions.find((q) => q.question === 3)?.status === "remaining"
    && bareExport.questions.find((q) => q.question === 4)?.status !== "not-applicable", bareExport.questions);
  await accept(page, 3); // cancel the bare acceptance before the real flow
  // A radio alone never suppresses the child; acceptance under the applicable variant keeps it active.
  await radio(page, 3, "extend");
  check("themed: radio alone keeps the child applicable", !(await page.evaluate(() => document.getElementById("q4").classList.contains("na"))));
  await accept(page, 3);
  check("themed: accepted parent counts one", (await progressQ(page)).includes("accepted: 1"), await progressQ(page));
  await radio(page, 4, "narrow"); await accept(page, 4);
  check("themed: child accepted counts two", (await progressQ(page)).includes("accepted: 2"), await progressQ(page));
  // Switching the accepted parent to the outside variant retires the child and its answer.
  await radio(page, 3, "status-quo");
  const retired = await page.evaluate(() => ({ na: document.getElementById("q4").classList.contains("na"),
    disabled: document.querySelector("#q4 .decide button").disabled, badge: !document.querySelector("#q4 .na-badge").hidden }));
  check("themed: outside variant retires the child", retired.na && retired.disabled && retired.badge, retired);
  check("themed: counters after retirement", (await progressQ(page)).includes("accepted: 1") && (await progressQ(page)).includes("not applicable: 1"), await progressQ(page));
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("#export-json")]);
  const exportPath = path.join(OUT, "decisions-export.json");
  await download.saveAs(exportPath);
  const exported = JSON.parse(fs.readFileSync(exportPath, "utf8"));
  const recordSha = createHash("sha256").update(fs.readFileSync(themed.record)).digest("hex");
  check("themed: export schema and digests", exported.schema_version === 3 && exported.record_sha256 === recordSha && exported.diff_sha256 === THEMED.diff.sha256);
  check("themed: export variant id and text", exported.questions.find((q) => q.question === 3)?.variant?.id === "status-quo" && typeof exported.questions.find((q) => q.question === 3)?.variant?.text === "string");
  check("themed: retired child exported not-applicable", exported.questions.find((q) => q.question === 4)?.status === "not-applicable");
  // Cancelling the parent re-applies the child, but its old answer does not return silently.
  await accept(page, 3);
  const revived = await page.evaluate(() => ({ na: document.getElementById("q4").classList.contains("na"), checked: document.querySelector('input[name="vq4"]:checked') !== null }));
  check("themed: cancelled parent does not reactivate the old answer", !revived.na && !revived.checked, revived);
  check("themed: remaining back to two", (await progressQ(page)).includes("remaining: 2"), await progressQ(page));
  // Deferral needs a reason.
  await page.click('.qcard#q3 .decide button[value="deferred"]');
  check("themed: bare deferral is not counted and asks for a reason", (await progressQ(page)).includes("deferred: 0") && await page.locator("#q3 .requires-content").isVisible());
  await page.fill('#q3 input[data-note="q3"]', "Not now.");
  check("themed: reasoned deferral counts", (await progressQ(page)).includes("deferred: 1"), await progressQ(page));
  // The viewer: fit, actual size, prev/next, Escape, focus return.
  await page.click("button.shot-open");
  check("viewer: opens in fit mode", await page.evaluate(() => document.getElementById("zoom-dialog").open && document.getElementById("zoom-dialog").dataset.mode === "fit"));
  await page.click("[data-zoom-full]");
  check("viewer: actual size", await page.evaluate(() => document.getElementById("zoom-dialog").dataset.mode === "1:1"));
  await page.click("[data-zoom-next]");
  check("viewer: next picture", (await page.textContent("#zoom-count")).trim() === "2 / 2");
  await page.keyboard.press("Escape");
  const focusBack = await page.evaluate(() => document.activeElement?.classList.contains("shot-open"));
  check("viewer: Escape closes and returns focus", !(await page.evaluate(() => document.getElementById("zoom-dialog").open)) && focusBack);
  await page.focus("img.shot-zoom"); await page.keyboard.press("Enter");
  check("viewer: keyboard opens", await page.evaluate(() => document.getElementById("zoom-dialog").open));
  await page.keyboard.press("Escape");
  // Deep links open the closed map and bring the block into view (the scroll lands on the next frame).
  await page.goto(themed.url + "#b3", { waitUntil: "load" });
  await page.waitForFunction(() => { const r = document.getElementById("b3").getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }, null, { timeout: 5000 });
  const deep = await page.evaluate(() => { const el = document.getElementById("b3"), r = el.getBoundingClientRect();
    return { open: document.getElementById("map-details").open, inView: r.top >= 0 && r.top < innerHeight }; });
  check("deep link: #b3 opens the map and scrolls into view", deep.open && deep.inView, deep);
  // Print profiles: the auditor opens every disclosure, the owner leaves the map closed; print CSS hides controls.
  await page.goto(themed.url, { waitUntil: "load" });
  await page.click("#print-audit");
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  const auditOpen = await page.evaluate(() => [...document.querySelectorAll("details")].every((d) => d.open));
  check("print: auditor profile opens every disclosure", auditOpen);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await page.click("#print-owner");
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  const ownerProfile = await page.evaluate(() => !document.getElementById("map-details").open);
  check("print: owner profile leaves the full map closed", ownerProfile);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await page.emulateMedia({ media: "print" });
  check("print: controls hidden on paper", await page.evaluate(() => getComputedStyle(document.querySelector(".bar")).display === "none"));
  await page.emulateMedia({ media: "screen" });
  await page.screenshot({ path: path.join(OUT, "themed-first-screen.png") });
  await context.close();
  results.themed = { loadMs, htmlBytes: fs.statSync(themed.html).size, domNodes: initial.domNodes };
}
console.error("[run] no-JS section");
// ---- no-JS: the cards and the full map read without scripts ----
{
  const { page, context } = await open(themed.url, { javaScriptEnabled: false });
  // With scripts disabled the page cannot be evaluated; the assertions go through the DOM itself.
  check("no-JS: page stays unscripted", !((await page.locator("html").getAttribute("class")) ?? "").includes("js"));
  check("no-JS: card text reads", (await page.textContent("#q3 .qquestion")).includes("Keep the conversion"));
  check("no-JS: variants and consequences read", (await page.textContent("#q3 .qopts")).includes("No new unit"));
  check("no-JS: variant radios and zone checks are disabled and say they need JS",
    await page.locator('#q3 input[data-question-variant]').first().isDisabled() && await page.locator('#q1 input[data-zone]').first().isDisabled()
    && (await page.textContent("#q3 .qopts")).includes("JavaScript"));
  await page.click("#map-details > summary");
  check("no-JS: the full map opens natively and reads", await page.locator("#b1").isVisible() && (await page.locator("#map .seg[data-block]").count()) === 3);
  await page.click(".passport-card > summary");
  check("no-JS: passport body reads", (await page.textContent(".passport-body")).includes("example/repo"));
  await context.close();
}
console.error("[run] 65507 section");
// ---- the enriched 65507 copy at real scale ----
if (big) {
  const { page, context, loadMs } = await open(big.url);
  const initial = await page.evaluate(() => ({ qcards: document.querySelectorAll(".qcard").length,
    files: document.querySelector(".counters .c b")?.textContent, anchors: document.querySelectorAll('#map .seg[id^="b"]').length,
    segs: document.querySelectorAll("#map .seg[data-block]").length, domNodes: document.querySelectorAll("*").length }));
  // A block split across hunks has one canonical anchor and continuation segments; 1470 anchors, not 1470 segments.
  check("65507: thirteen cards and one anchor per fragment", initial.qcards === 13 && initial.anchors === 1470 && initial.segs >= 1470, initial);
  check("65507: counters show 96 files", initial.files === "96", initial);
  await page.goto(big.url + "#q9", { waitUntil: "load" });
  await page.waitForFunction(() => { const r = document.getElementById("q9").getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }, null, { timeout: 5000 });
  check("65507: deep link #q9", await page.evaluate(() => { const r = document.getElementById("q9").getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }));
  await page.goto(big.url + "#b1000", { waitUntil: "load" });
  check("65507: deep link #b1000 opens the map", await page.evaluate(() => document.getElementById("map-details").open && !!document.getElementById("b1000")));
  await page.goto(big.url, { waitUntil: "load" });
  await radio(page, 2, "keep"); await accept(page, 2);
  check("65507: children active under the kept variant", await page.evaluate(() => ![9, 10, 11].some((n) => document.getElementById("q" + n).classList.contains("na"))));
  await radio(page, 2, "base");
  check("65507: children retired under base", await page.evaluate(() => [9, 10, 11].every((n) => document.getElementById("q" + n).classList.contains("na") && document.querySelector(`#q${n} .decide button`).disabled)));
  check("65507: counters reflect retirement", /неприменимо: 3|not applicable: 3/.test(await progressQ(page)), await progressQ(page));
  await page.click("#print-audit");
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  const audit = await page.evaluate(() => ({ open: [...document.querySelectorAll("details")].every((d) => d.open), visibleB: [...document.querySelectorAll('.seg[id^="b"]')].filter((el) => el.getBoundingClientRect().height > 0 || el.closest("details[open]")).length }));
  check("65507: auditor print opens all 1470 fragments", audit.open && audit.visibleB === 1470, audit);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await page.screenshot({ path: path.join(OUT, "65507-first-screen.png") });
  await context.close();
  // no-JS at scale: the map is real markup, not a template.
  const noJs = await open(big.url, { javaScriptEnabled: false });
  await noJs.page.click("#map-details > summary");
  check("65507 no-JS: the full map reads", await noJs.page.locator("#b1470").isVisible());
  check("65507 no-JS: cards read", (await noJs.page.textContent("#q2 .qopts")).includes("focus"));
  await noJs.context.close();
  results.big = { loadMs, htmlBytes: big.bytes, domNodes: initial.domNodes };
  check("65507: the immutable original is untouched", createHash("sha256").update(fs.readFileSync(path.join(SOURCE, "review.json"))).digest("hex") === bigSha);
} else results.checks.push({ name: "65507 part", ok: true, detail: "skipped: the record is not on this machine" });
console.error("[run] PDF section");
// ---- real PDFs: the owner profile prints the screens and the coverage limits, the auditor every B address ----
if (big && pdfjs) {
  const { page, context } = await open(big.url);
  await page.click("#print-owner");
  const ownerPdf = path.join(OUT, "65507-owner.pdf");
  await page.pdf({ path: ownerPdf });
  const ownerText = await pdfText(ownerPdf);
  check("PDF owner: the screens and the coverage limits print", ownerText.includes(big.screenName) && ownerText.includes(big.limit)
    && !hasB(ownerText, 1470), { screen: ownerText.includes(big.screenName), limit: ownerText.includes(big.limit), mapClosed: !hasB(ownerText, 1470) });
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
// ---- the legacy annotation runtime still works on the new page ----
{
  const { page, context } = await open(legacyRu.url);
  const fn = new Function(`return (${fs.readFileSync(path.join(HERE, "review-annotations.browser.mjs"), "utf8")})`)();
  try { await fn(page); check("legacy annotations runtime on the v3 page", true); }
  catch (e) { check("legacy annotations runtime on the v3 page", false, String(e)); }
  await context.close();
}
check("no page or console errors anywhere", errors.length === 0, errors.slice(0, 5));
await browser.close();
fs.writeFileSync(path.join(OUT, "browser-validation.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
process.exit(results.failures.length ? 1 : 0);