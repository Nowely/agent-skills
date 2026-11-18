#!/usr/bin/env node
// Browser acceptance of the v6 report page (keeps the v5 entrypoint): the one Choices list with its
// subtabs and action groups, the unified card shell, the reversible choice with the settled rows and the
// focus return, the native export dialog fed by one model (preview === text === JSON), fact answers,
// compact comments, purpose multi-toggles, the tree's reveal/search/scrollspy, deep links, scroll memory,
// the full contrast walk and geometry, no-JS, owner/auditor print with real PDFs, and an automated
// functional scenario. The owner DoD WITHOUT hints stays a separate user test; this is not it.
//
// Acceptance honesty: the 65507 part renders an ENRICHED COPY (enrich65507 adds the decision cards,
// recommendations, tradeoffs and coverage limits from the prototype's annotations). The 1470/1517 map and
// the PDF results describe that copy's page, not the immutable original record; the blocks and the diff are
// the original's own, and its bytes are never written. Native browser zoom (Ctrl+/−) is not exposed to
// headless automation: the zoom check uses CSS zoom:2 and is marked as such.
//
//   PLAYWRIGHT_CORE=<path to playwright-core/index.mjs> BROWSER=yandex|chromium \
//     node evals/review-report-v5.browser.mjs [out-dir]
//
// playwright-core is a verification tool here, not a dependency of the plugin. BROWSER=yandex runs
// /Applications/Yandex.app with its own persistent profile; chromium (the default) runs the Playwright
// cache's Chrome for Testing (CHROME_FOR_TESTING overrides the binary). PDFJS_DIST=<path to
// pdfjs-dist/legacy/build/pdf.mjs> adds the real-PDF acceptance; without it the PDF part is skipped.
// Without the 65507 record on the machine, that part is skipped.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepare } from "./review/prepare.mjs";
import { reportFixtures, enrich65507, hostileFixture, shikiFixture, HOSTILE_PATH, HOSTILE_URL } from "./review/report-fixtures.mjs";
import { LABELS, requiredKeys } from "../plugin/skills/review/scripts/labels.mjs";
import { page } from "../plugin/skills/review/scripts/page.mjs";
import { check as reviewCheck, modelOf } from "../plugin/skills/review/scripts/review.mjs";
import { parseDiff } from "../plugin/skills/review/scripts/diff.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_CORE ?? "playwright-core");
let pdfjs = null;
try { pdfjs = await import(process.env.PDFJS_DIST ?? "pdfjs-dist/legacy/build/pdf.mjs"); } catch {}
const pdfText = async (file) => {
  const options = { data: new Uint8Array(fs.readFileSync(file)) };
  if (process.env.PDFJS_DIST) options.standardFontDataUrl = path.join(path.dirname(process.env.PDFJS_DIST), "..", "standard_fonts") + path.sep;
  const task = pdfjs.getDocument(options), doc = await task.promise;
  let compact = "", spaced = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const items = (await (await doc.getPage(i)).getTextContent()).items.map((item) => item.str);
    // Chrome extracts adjacent chips without a separating item ("B239B240"); keep both joins so a
    // whole-word B address is found either way, and never matches inside a longer number.
    compact += items.join("") + "\n";
    spaced += items.join(" ") + "\n";
  }
  await task.destroy();
  // Chrome's subset fonts map Cyrillic к to U+0138 (ĸ) in the PDF's ToUnicode table; put it back for matching.
  return { compact: compact.replaceAll("\u0138", "\u043A"), spaced: spaced.replaceAll("\u0138", "\u043A") };
};
const hasB = (text, n) => new RegExp(`(?<![0-9A-Za-z])B${n}(?![0-9])`).test(text.compact) || new RegExp(`(?<![0-9A-Za-z])B${n}(?![0-9])`).test(text.spaced);
const hasWord = (text, word) => text.compact.includes(word) || text.spaced.includes(word);
const USED = process.env.BROWSER === "yandex" ? "Yandex" : "Chromium";
const BINARY = USED === "Yandex" ? "/Applications/Yandex.app/Contents/MacOS/Yandex"
  : process.env.CHROME_FOR_TESTING ?? path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "..", "plugin", "skills", "review", "scripts", "report.mjs");
const OUT = process.argv[2] ?? fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "review-v5-browser-"));
fs.mkdirSync(OUT, { recursive: true });
const results = { out: OUT, browser: USED, binary: BINARY, checks: [], failures: [] };
const check = (name, ok, detail) => { results.checks.push({ name, ok: !!ok, ...(detail === undefined ? {} : { detail }) }); if (!ok) results.failures.push(name + (detail ? `: ${JSON.stringify(detail).slice(0, 300)}` : "")); };

// ---- the records: the themed small case, the hardening fixtures, and the enriched 65507 copy ----
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
const renderFixture = ({ diff, record }, name) => {
  const dir = path.join(run, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "source.diff"), diff);
  for (const pic of ["before.png", "after.png"]) if (fs.existsSync(path.join(run, pic))) fs.copyFileSync(path.join(run, pic), path.join(dir, pic));
  const file = path.join(dir, "review.json");
  fs.writeFileSync(file, JSON.stringify(record));
  const result = spawnSync(process.execPath, [SCRIPT, "render", file], { cwd: dir, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`render ${name}: ${result.stderr}`);
  return { record: file, html: file.replace(/\.json$/, ".html"), url: `file://${file.replace(/\.json$/, ".html")}` };
};
const hostile = renderFixture(hostileFixture(), "hostile");
const shiki = renderFixture(shikiFixture(), "shiki");
const oldCatalog = Object.fromEntries(requiredKeys(REVIEW).map((key) => [key, "«" + LABELS[key] + "»"]));
const legacyCatalog = renderFixture({ diff: fs.readFileSync(path.join(run, "source.diff"), "utf8"),
  record: { ...structuredClone(REVIEW), language: "custom", labels: oldCatalog } }, "legacy-catalog");
const jsFixture = hostileFixture();
jsFixture.record.passport.links[0].url = "javascript:alert(1)"; jsFixture.record.passport.links[0].label = "";
const jsFiles = parseDiff(jsFixture.diff), jsDir = path.join(run, "hostile");
const jsHtml = page(jsFixture.record, jsFiles, modelOf(jsFixture.record, jsFiles, reviewCheck(jsFixture.record, jsFiles, jsDir).owner, jsDir));
fs.writeFileSync(path.join(jsDir, "js-url.html"), jsHtml);
const jsUrl = { url: `file://${path.join(jsDir, "js-url.html")}` };
const resolvedRecord = structuredClone(THEMED);
resolvedRecord.blocks[1].questions = [3];
const resolved = render(resolvedRecord, "resolved.json");
const legacyRu = render({ ...structuredClone(REVIEW), language: "ru", mechanisms: [
  { name: "Первая механика", change: "reused", units: ["readArchive"], purpose: "Назначение механики: показать, как существующее поведение сохраняется без нового состояния, и почему это важно для читателя отчёта.",
    basis: "Основание: требование 1 и существующий контракт читателя, который уже преобразует код валюты в верхний регистр при выводе.",
    benefit: "Польза: повторное использование уже проверенного пути без дополнительных тестов и без новой поверхности ошибки.",
    cost: "Цена: явная зависимость от порядка вывода, которую нужно сохранить при любом изменении читателя.",
    decision: "Оставить преобразование в читателе и не переносить его в вывод без отдельного решения владельца.", evidence: "read", findings: [1] },
  { name: "Вторая механика", change: "reused", purpose: "Назначение второй механики: показать, как тот же путь обслуживает другой сценарий без дублирования правила преобразования.",
    basis: "Основание: тот же контракт читателя и требование 1; отдельного источника у второй механики нет, и это записано явно.",
    benefit: "Польза: одно правило на два сценария, без расхождения форматов при выводе списка и отдельной карточки.",
    cost: "Цена: связанность сценариев через общий путь, которую нужно учитывать при изменении формата вывода.",
    decision: "Оставить общий путь и не вводить второй преобразователь для отдельного сценария.", evidence: "read" }] }, "legacy-ru.json");
const SOURCE = process.env.REVIEW_65507_DIR ?? "/private/tmp/entrust/cloud-components/65507-review-current";
const ANN = process.env.REVIEW_65507_ANNOTATIONS ?? "/private/tmp/entrust/65507-review-analysis/prototype/annotations-v2.json";
const ORIGINAL_SHA = "fb7ce806b3c90420da1cca37ea11c64dc0f2f0b655b040f8ad3244f1c4ef4cfc";
let big = null, bigSha = null, bigRecord = null, bigRecordSha = null;
if (fs.existsSync(path.join(SOURCE, "review.json")) && fs.existsSync(ANN)) {
  const bytes = fs.readFileSync(path.join(SOURCE, "review.json"));
  bigSha = createHash("sha256").update(bytes).digest("hex");
  if (bigSha !== ORIGINAL_SHA) throw new Error("the immutable original record changed before acceptance");
  const dir = path.join(run, "big");
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(path.join(SOURCE, "review.diff"), path.join(dir, "review.diff"));
  bigRecord = enrich65507(JSON.parse(bytes.toString("utf8")), JSON.parse(fs.readFileSync(ANN, "utf8")));
  const file = path.join(dir, "review.json");
  fs.writeFileSync(file, JSON.stringify(bigRecord));
  bigRecordSha = createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  const result = spawnSync(process.execPath, [SCRIPT, "render", file], { cwd: dir, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`render 65507 copy: ${result.stderr.slice(0, 500)}`);
  big = { record: file, html: file.replace(/\.json$/, ".html"), url: `file://${file.replace(/\.json$/, ".html")}`, bytes: fs.statSync(file.replace(/\.json$/, ".html")).size,
    screenName: bigRecord.screens?.[0]?.name, limit: bigRecord.coverageStructured?.find((c) => c.kind === "not_checked")?.text };
}
console.error(`[setup] rendered themed, resolved, legacy-ru, hostile, shiki, legacy-catalog${big ? ", 65507 enriched copy" : ""} (${USED})`);

// ---- the browser: a persistent profile per browser, as the contract asks ----
const launch = (name, options = {}) => chromium.launchPersistentContext(path.join(OUT, "profile-" + name), {
  executablePath: BINARY, headless: process.env.HEADED !== "1", hasTouch: true, viewport: { width: 1366, height: 900 },
  args: ["--no-first-run", ...(USED === "Chromium" ? ["--disable-gpu", "--disable-dev-shm-usage"] : [])],
  dumpio: USED === "Chromium", ...options });
const ctx = await launch(USED.toLowerCase());
const errors = [];
const watch = (p) => { p.on("pageerror", (e) => errors.push(String(e))); p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); }); };
const page0 = ctx.pages()[0] ?? await ctx.newPage();
watch(page0);
const open = async (url, options = {}) => {
  const context = options.javaScriptEnabled === false ? await launch(USED.toLowerCase() + "-nojs", { javaScriptEnabled: false }) : null;
  const p = context ? await context.newPage() : await ctx.newPage();
  watch(p);
  await p.goto(url, { waitUntil: "load" });
  if (options.javaScriptEnabled !== false) await p.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  return { page: p, context: context ?? null };
};
const state = (p) => p.evaluate(() => { const d = JSON.parse(document.getElementById("data").textContent); return JSON.parse(localStorage.getItem("review-report:" + d.key) || "{}"); });
const tab = async (p, id) => { await p.click(`#tab-${id}`); await p.waitForTimeout(150); };
const radio = (p, q, value) => p.check(`input[name="vq${q}"][value="${value}"]`);
const injectHelpers = (p) => p.evaluate(() => {
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
const reloadClean = async (p) => { await p.reload({ waitUntil: "load" }); await injectHelpers(p); await p.addStyleTag({ content: "html{scroll-behavior:auto!important}" }); await p.waitForTimeout(200); };

console.error("[run] themed v5 section");
{
  const { page: p } = await open(themed.url);
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: "load" }); await p.waitForTimeout(200);
  try {
  const initial = await p.evaluate(() => ({ js: document.documentElement.classList.contains("js"), tabs: [...document.querySelectorAll(".tabs [role=tab]")].map(t => t.dataset.tab),
    panels: document.querySelectorAll(".panel").length, hidden: document.querySelectorAll(".panel[hidden]").length, qcards: document.querySelectorAll(".qcard").length,
    active: document.querySelector('.tabs [aria-selected="true"]')?.dataset.tab, counter: document.getElementById("count-decisions").textContent,
    groups: [...document.querySelectorAll("#panel-decisions .dgroup")].map(g => g.id), domNodes: document.querySelectorAll("*").length }));
  check("themed: five tabs start at Choices, one list, the action groups", initial.js && initial.tabs.join() === "overview,decisions,code,checks,materials"
    && initial.panels === 5 && initial.hidden === 4 && initial.qcards === 5 && initial.active === "decisions"
    && initial.groups.join() === "group-owner,group-fix,group-data,group-settled", initial);
  check("themed: the counter is the one quantity (1 root decision + 2 findings)", initial.counter === "3 remaining", initial.counter);
  check("themed: the no-JS hint hides and the radios are live under the runtime", await p.locator("#q3 .nojs-note").first().isHidden() && await p.locator('#q3 input[data-question-variant]').first().isEnabled());
  check("themed: evidence and fact cards have no decision controls, the fact answer is on the surface",
    await p.locator("#q1 .decide").count() === 0 && await p.locator("#q2 [data-answer]").isVisible());
  // The radio is the decision on EVERY size; the child follows the accepted variant.
  await radio(p, 3, "extend");
  const picked = await p.evaluate(() => ({ chip: document.querySelector("#q3 [data-qstatus]").textContent, state: document.querySelector("#q3 [data-qstatus]").dataset.state,
    settled: document.querySelector('[data-unit="q3"]').dataset.settled || null, na: document.getElementById("q4").classList.contains("na") }));
  check("themed: a variant pick accepts at once; the child stays applicable while the parent's children are open",
    picked.chip.startsWith("Selected:") && picked.state === "decided" && !picked.na, picked);
  // Q3 accepted with extend: the child Q4 applies under extend — once Q4 is decided too, the unit settles.
  await radio(p, 4, "narrow");
  await p.waitForTimeout(200);
  check("themed: the unit settles when the parent and its applicable children are decided",
    await p.evaluate(() => document.querySelector('[data-unit="q3"]').dataset.settled === "done" && !!document.querySelector('#group-settled [data-unit="q3"]')));
  // Deferral keeps the variant as a draft and asks for a reason; with a reason it settles as deferred.
  await p.evaluate(() => { document.getElementById("group-settled").open = true; document.querySelector('#group-settled [data-unit="q3"]').closest("details").open = true; });
  await p.click("#q3 [data-defer]");
  const deferred = await p.evaluate(() => ({ chip: document.querySelector("#q3 [data-qstatus]").textContent, radio: document.querySelector('#q3 input[value="extend"]').checked,
    draft: !document.querySelector("#q3 [data-qdraft]").hidden, hint: !document.querySelector("#q3 .requires-content").hidden,
    settled: document.querySelector('[data-unit="q3"]').dataset.settled || null }));
  check("themed: a reasonless deferral keeps a draft, unchecks the radio, asks for a reason, stays in place",
    deferred.chip === "deferred" && !deferred.radio && deferred.draft && deferred.hint && deferred.settled === null, deferred);
  await p.evaluate(() => { document.querySelector("#q3 .card-comment").open = true; });
  await p.fill("#qnote-q3", "Not now.");
  await p.waitForTimeout(200);
  check("themed: a reasoned deferral settles as deferred, the variant stays a draft",
    await p.evaluate(() => document.querySelector('[data-unit="q3"]').dataset.settled === "deferred"));
  const [draftDownload] = await Promise.all([p.waitForEvent("download"), p.click("#export-open").then(() => p.click("#export-json-top"))]);
  const draftPath = path.join(OUT, "decisions-draft.json");
  await draftDownload.saveAs(draftPath);
  const draftExport = JSON.parse(fs.readFileSync(draftPath, "utf8"));
  check("themed: a deferred variant exports as a draft, schema 4, factAnswers present", draftExport.schema_version === 4
    && draftExport.questions.find((q) => q.question === 3)?.variant_draft === true
    && draftExport.questions.find((q) => q.question === 3)?.status === "deferred"
    && Array.isArray(draftExport.applyWithoutVariant) && draftExport.applyWithoutVariant.length === 0
    && typeof draftExport.factAnswers === "object", draftExport.questions);
  await p.locator("#export-dialog form button").click();
  // Re-picking accepts; the outside variant retires the child with a gate, never silently.
  await p.evaluate(() => { document.getElementById("group-settled").open = true; const row = document.querySelector('#group-settled [data-unit="q3"]'); if (row) row.closest("details").open = true; });
  await radio(p, 3, "status-quo");
  const retired = await p.evaluate(() => ({ na: document.getElementById("q4").classList.contains("na"), disabled: document.querySelector("#q4 input[data-question-variant]").disabled,
    gate: document.querySelector("#q4 [data-qgate]").textContent, badge: !document.querySelector("#q4 .na-badge").hidden }));
  check("themed: outside variant retires the child with a gate", retired.na && retired.disabled && retired.gate.includes("Q3") && retired.badge, retired);
  await p.click("#q3 [data-qreset]");
  const revived = await p.evaluate(() => ({ na: document.getElementById("q4").classList.contains("na"), checked: document.querySelector('input[name="vq4"]:checked') !== null,
    home: document.querySelector('[data-unit="q3"]').parentElement.closest(".dgroup")?.id }));
  check("themed: reset returns the card home and does not reactivate the old answer", !revived.na && !revived.checked && revived.home === "group-owner", revived);
  // The subtabs filter the one list.
  await p.click('[data-choice-filter="f"]');
  const subF = await p.evaluate(() => [...document.querySelectorAll("#panel-decisions .dunit")].filter(u => !u.hidden).map(u => u.dataset.unit).sort());
  check("themed: the Findings subtab shows only the findings", subF.join() === "f1,f2", subF);
  await p.click('[data-choice-filter="all"]');
  // The viewer: fit, actual size, prev/next, Escape, focus return.
  await tab(p, "materials");
  await p.click("button.shot-open");
  check("viewer: opens in fit mode", await p.evaluate(() => document.getElementById("zoom-dialog").open && document.getElementById("zoom-dialog").dataset.mode === "fit"));
  await p.click("[data-zoom-full]");
  check("viewer: actual size", await p.evaluate(() => document.getElementById("zoom-dialog").dataset.mode === "1:1"));
  await p.click("[data-zoom-next]");
  check("viewer: next picture", (await p.textContent("#zoom-count")).trim() === "2 / 2");
  await p.keyboard.press("Escape");
  check("viewer: Escape closes and returns focus", !(await p.evaluate(() => document.getElementById("zoom-dialog").open)) && await p.evaluate(() => document.activeElement?.classList.contains("shot-open")));
  // Deep links open the right tab and reveal the target, in any verdict mode; the v4 alias lands in Choices.
  await p.goto(themed.url + "#b1", { waitUntil: "load" });
  await p.waitForFunction(() => { const r = document.getElementById("b1")?.getBoundingClientRect(); return r && r.top >= 0 && r.top < innerHeight; }, null, { timeout: 5000 });
  check("deep link: #b1 (a kept block) opens the code tab in full mode", await p.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "code"
    && document.getElementById("map").dataset.show === "all" && document.getElementById("b1").querySelector(".segcode").open));
  await p.goto(themed.url + "#q4", { waitUntil: "load" });
  await p.waitForFunction(() => { const r = document.getElementById("q4").getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }, null, { timeout: 5000 });
  check("deep link: #q4 opens the Choices tab and the child disclosure", await p.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "decisions"
    && document.querySelector('[data-qchildren="3"]').open));
  await p.goto(themed.url + "#panel-findings", { waitUntil: "load" }); await p.waitForTimeout(250);
  check("deep link: the v4 #panel-findings alias lands in Choices", await p.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "decisions"));
  await p.goto(themed.url + "#shot-2", { waitUntil: "load" });
  await p.waitForFunction(() => { const r = document.getElementById("shot-2").getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }, null, { timeout: 5000 });
  check("deep link: #shot-2 opens the materials tab (C3)", await p.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "materials"));
  await p.goto(themed.url + "#shot2", { waitUntil: "load" });
  await p.waitForFunction(() => { const r = document.getElementById("shot-2").getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }, null, { timeout: 5000 });
  check("deep link: the bare #shot2 lands on the same shot", await p.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "materials"));
  await p.goto(themed.url + "#f1-code", { waitUntil: "load" }); await p.waitForTimeout(300);
  const fChip = await p.evaluate(() => ({ tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab, chip: !document.getElementById("filter-chip").hidden,
    label: document.getElementById("filter-chip-label").textContent, pos: document.getElementById("filter-pos").textContent, f: document.getElementById("map").dataset.f }));
  check("deep link: #f1-code filters the map with a chip (F filter)", fChip.tab === "code" && fChip.chip && fChip.label.includes("F1") && fChip.pos === "1 / 1" && fChip.f === "1", fChip);
  // The chip's «back» returns to where the filter was started.
  await p.goto(themed.url, { waitUntil: "load" }); await p.waitForTimeout(200);
  await p.evaluate(() => window.scrollTo(0, 120)); await p.waitForTimeout(100);
  await p.evaluate(() => { document.querySelector("#f1 .qwhere").open = true; });
  // Click without Playwright's auto-scroll: the chip's «back» must return to the scroll as it stood.
  await p.evaluate(() => document.querySelector('[data-f-filter="1"]').click()); await p.waitForTimeout(250);
  check("F filter: a finding's button opens its blocks in the map", await p.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "code"
    && document.getElementById("map").dataset.f === "1" && !document.getElementById("filter-chip").hidden));
  await p.click("#filter-back"); await p.waitForTimeout(250);
  const backState = await p.evaluate(() => ({ tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab, chipHidden: document.getElementById("filter-chip").hidden, y: window.scrollY }));
  check("filter chip: back returns to the source tab and scroll", backState.tab === "decisions" && backState.chipHidden && Math.abs(backState.y - 120) < 5, backState);
  // Scroll memory between tabs.
  await p.goto(themed.url, { waitUntil: "load" }); await p.waitForTimeout(200);
  await p.evaluate(() => window.scrollTo(0, 250)); await p.waitForTimeout(100);
  await tab(p, "overview"); await tab(p, "decisions"); await p.waitForTimeout(250);
  check("scroll memory: a tab restores its scroll", Math.abs(await p.evaluate(() => window.scrollY) - 250) < 5, await p.evaluate(() => window.scrollY));
  await p.focus("#tab-decisions"); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(150);
  check("tabs: ArrowRight activates the next tab", await p.evaluate(() => document.querySelector('.tabs [aria-selected="true"]').dataset.tab === "code"));
  // Theme: the 32px icon in the header, the cycle, prefers-color-scheme default.
  const themeGeom = await p.evaluate(() => { const b = document.getElementById("theme-toggle"), r = b.getBoundingClientRect();
    return { inHeader: !!b.closest("header.page-head"), notInBar: !b.closest(".bar"), w: Math.round(r.width), h: Math.round(r.height), state: b.dataset.state }; });
  check("theme: 32px icon in the header, not the bar", themeGeom.inHeader && themeGeom.notInBar && themeGeom.w === 32 && themeGeom.h === 32 && themeGeom.state === "auto", themeGeom);
  await p.click("#theme-toggle");
  check("theme: auto -> light", await p.evaluate(() => document.documentElement.dataset.theme === "light"));
  await p.click("#theme-toggle");
  check("theme: light -> dark", await p.evaluate(() => document.documentElement.dataset.theme === "dark"));
  await p.click("#theme-toggle");
  check("theme: dark -> auto", await p.evaluate(() => !document.documentElement.dataset.theme));
  await p.emulateMedia({ colorScheme: "dark" });
  await p.reload({ waitUntil: "load" }); await p.waitForTimeout(200);
  check("theme: prefers-color-scheme dark is the default", await p.evaluate(() => !document.documentElement.dataset.theme && getComputedStyle(document.body).backgroundColor === "rgb(17, 21, 28)"));
  await p.emulateMedia({ colorScheme: "light" });
  await p.reload({ waitUntil: "load" }); await p.waitForTimeout(200);
  // Structure closed; C1 absent.
  const structure = await p.evaluate(() => { const d = document.querySelector(".structure-target"); return { found: !!d, closed: d ? !d.open : null, hasSvg: !!d?.querySelector("svg") }; });
  check("structure: target diagram closed by default", structure.found && structure.closed && structure.hasSvg, structure);
  check("C1 absent: no next-unresolved control", await p.evaluate(() => !document.querySelector("[data-next-unresolved], #next-unresolved")
    && !document.body.textContent.includes("next unresolved") && !document.body.textContent.includes("следующее нерешённое")));
  // C2: the tree name filter with a highlight, AND with the hidden purposes; Enter opens the first match.
  await tab(p, "code");
  await p.click('[data-show="all"]'); await p.waitForTimeout(200);
  await p.fill("#tree-filter-input", "archive");
  const treeFiltered = await p.evaluate(() => ({ visible: [...document.querySelectorAll(".frow")].filter((r) => r.style.display !== "none").length,
    marks: document.querySelectorAll(".frow mark").length, count: document.getElementById("tree-filter-count").textContent }));
  check("C2: the tree filters by name and highlights the match", treeFiltered.visible === 2 && treeFiltered.marks >= 2 && treeFiltered.count.includes("2"), treeFiltered);
  await p.click('[data-purpose-filter="tests"]');
  const treeAnd = await p.evaluate(() => ({ rows: [...document.querySelectorAll(".frow")].filter((r) => r.style.display !== "none").map((r) => r.querySelector(".fname").textContent),
    pressed: document.querySelector('[data-purpose-filter="tests"]').getAttribute("aria-pressed"),
    stored: JSON.parse(localStorage.getItem("review-report:" + JSON.parse(document.getElementById("data").textContent).key)).hiddenPurposes }));
  check("purpose: hiding tests leaves the production file, AND with the name filter", treeAnd.rows.length === 1 && treeAnd.rows[0].includes("archive.js")
    && treeAnd.pressed === "false" && treeAnd.stored.join() === "tests", treeAnd);
  await p.focus("#tree-filter-input"); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
  check("tree: Enter reveals the first match's file", await p.evaluate(() => document.querySelectorAll(".file.reveal").length >= 1));
  await p.click("#tree-filter-clear"); await p.waitForTimeout(150);
  await p.click("#filter-clear"); await p.waitForTimeout(150);
  check("purpose: the reset restores the hidden group and the chip", await p.evaluate(() => document.getElementById("filter-chip").hidden
    && [...document.querySelectorAll("[data-purpose-filter]")].every((b) => b.getAttribute("aria-pressed") === "true")
    && [...document.querySelectorAll(".frow")].every((r) => r.style.display !== "none")));
  // The honest export from the dialog: «Copied» only on a confirmed success; refusal selects the text.
  await p.evaluate(() => { navigator.clipboard.writeText = (t) => { window.__copied = t; return Promise.resolve(); }; });
  await p.click("#export-open"); await p.waitForTimeout(150);
  await p.click("#copy-top"); await p.waitForTimeout(150);
  const copyOk = await p.evaluate(() => ({ label: document.getElementById("copy-top").textContent, copied: window.__copied === document.getElementById("out").value, status: document.getElementById("export-status").textContent }));
  check("export: «Copied» only after a confirmed success", copyOk.label === "Copy text" && copyOk.copied && copyOk.status === "Copied", copyOk);
  await p.waitForTimeout(1600);
  await p.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error("denied")); });
  await p.click("#copy-top"); await p.waitForTimeout(250);
  const copyFail = await p.evaluate(() => ({ label: document.getElementById("copy-top").textContent, status: document.getElementById("export-status").textContent,
    selected: document.getElementById("out").selectionStart === 0 && document.getElementById("out").selectionEnd === document.getElementById("out").value.length,
    dialogOpen: document.getElementById("export-dialog").open }));
  check("export: refusal selects the text in the dialog and says Ctrl/⌘+C, never «Copied»", copyFail.label !== "Copied" && copyFail.status.includes("Ctrl") && copyFail.selected && copyFail.dialogOpen, copyFail);
  await p.locator("#export-dialog form button").click();
  // The popover's source copy is honest the same way.
  await tab(p, "code");
  await p.click('[data-segpop="2"]'); await p.waitForTimeout(100);
  await p.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error("denied")); });
  await p.click("#seg-popover .pop-copy"); await p.waitForTimeout(150);
  const popFail = await p.evaluate(() => ({ status: document.querySelector("#seg-popover .pop-copy-status")?.textContent ?? "", btn: document.querySelector("#seg-popover .pop-copy").textContent,
    selected: getSelection().toString(), copy: document.querySelector("#seg-popover .pop-copy").dataset.copy }));
  check("popover: a refused source copy says so and selects exactly path:line (revision)", popFail.status.includes("Ctrl") && popFail.btn !== "Copied"
    && popFail.selected === popFail.copy && /^test\/archive\.test\.js:1 \(.+\)$/.test(popFail.selected), popFail);
  await p.evaluate(() => { navigator.clipboard.writeText = (t) => { window.__popCopied = t; return Promise.resolve(); }; });
  await p.click("#seg-popover .pop-copy"); await p.waitForTimeout(150);
  check("popover: a confirmed source copy says «Copied» and carries path:line (revision)", await p.evaluate(() => document.querySelector("#seg-popover .pop-copy").textContent === "Copied"
    && /test\/archive\.test\.js:1 \(.+\)/.test(window.__popCopied)));
  await p.keyboard.press("Escape");
  check("popover: Escape closes and returns focus", await p.evaluate(() => document.getElementById("seg-popover").hidden && document.activeElement?.dataset.segpop === "2"));
  // Print profiles with the hidden purposes in the snapshot; both restore.
  await p.goto(themed.url, { waitUntil: "load" }); await p.waitForTimeout(200);
  await p.evaluate(() => { window.print = () => {}; });
  await tab(p, "code"); await p.click('[data-show="fix"]'); await p.waitForTimeout(150);
  // Hide production (not tests): the fix block lives in a test file, so the chip keeps a match to jump.
  await p.click('[data-purpose-filter="production"]'); await p.waitForTimeout(150);
  await p.fill("#tree-filter-input", "archive"); await p.waitForTimeout(150);
  await p.click("#filter-next"); await p.waitForTimeout(150);
  const filterView = () => p.evaluate(() => ({
    inserted: document.querySelectorAll(".file-lazy .file").length, open: document.querySelectorAll("details[open]").length,
    show: document.getElementById("map").dataset.show,
    purposePressed: [...document.querySelectorAll("[data-purpose-filter]")].map((b) => b.getAttribute("aria-pressed")),
    hidden: JSON.parse(localStorage.getItem("review-report:" + JSON.parse(document.getElementById("data").textContent).key)).hiddenPurposes,
    modePressed: [...document.querySelectorAll(".map-filters [data-show]")].map((b) => b.getAttribute("aria-pressed")),
    rows: [...document.querySelectorAll(".frow")].map((r) => r.style.display),
    treeCount: document.getElementById("tree-filter-count").textContent,
    chipHidden: document.getElementById("filter-chip").hidden, chipLabel: document.getElementById("filter-chip-label").textContent,
    chipPos: document.getElementById("filter-pos").textContent }));
  const beforePrint = await filterView();
  await tab(p, "materials");
  await p.click("#print-audit");
  await p.evaluate(() => { window.dispatchEvent(new Event("beforeprint")); });
  const auditPrint = await p.evaluate(() => ({ open: [...document.querySelectorAll("details")].every((d) => d.open), inserted: document.querySelectorAll(".file-lazy .file").length,
    purposePressed: [...document.querySelectorAll("[data-purpose-filter]")].map((b) => b.getAttribute("aria-pressed")) }));
  check("print: auditor opens every disclosure and file", auditPrint.open && auditPrint.inserted === 3, auditPrint);
  check("print: the audit clears the filter views while printing", auditPrint.purposePressed.every((x) => x === "true"), auditPrint.purposePressed);
  await p.evaluate(() => { window.dispatchEvent(new Event("afterprint")); });
  const afterAudit = await filterView();
  check("print: afterprint restores the lazy files, disclosures and the hidden purposes", afterAudit.inserted === beforePrint.inserted && afterAudit.open === beforePrint.open
    && afterAudit.show === "fix" && JSON.stringify(afterAudit.hidden) === JSON.stringify(beforePrint.hidden)
    && JSON.stringify(afterAudit.purposePressed) === JSON.stringify(beforePrint.purposePressed), { beforePrint, afterAudit });
  check("print: afterprint restores the tree rows, the chip and its position", JSON.stringify(afterAudit.rows) === JSON.stringify(beforePrint.rows)
    && afterAudit.treeCount === beforePrint.treeCount && afterAudit.chipHidden === beforePrint.chipHidden
    && afterAudit.chipLabel === beforePrint.chipLabel && afterAudit.chipPos === beforePrint.chipPos, { beforePrint, afterAudit });
  await p.click("#print-owner");
  await p.evaluate(() => { window.dispatchEvent(new Event("beforeprint")); });
  const ownerPrint = await p.evaluate(() => ({ map: document.getElementById("map").style.display, tree: document.querySelector(".tree-col").style.display,
    decisionsOpen: [...document.querySelectorAll("#panel-decisions details")].every((d) => d.open) }));
  check("print: owner hides the map and the tree, opens every decisions disclosure", ownerPrint.map === "none" && ownerPrint.tree === "none" && ownerPrint.decisionsOpen, ownerPrint);
  await p.evaluate(() => { window.dispatchEvent(new Event("afterprint")); });
  const afterOwner = await filterView();
  check("print: owner profile restores", await p.evaluate(() => document.getElementById("map").style.display !== "none" && document.querySelector(".tree-col").style.display !== "none")
    && JSON.stringify(afterOwner.hidden) === JSON.stringify(beforePrint.hidden), afterOwner);
  await p.emulateMedia({ media: "print" });
  check("print: controls hidden, every panel prints", await p.evaluate(() => getComputedStyle(document.querySelector(".bar")).display === "none"
    && [...document.querySelectorAll(".panel")].every((x) => getComputedStyle(x).display !== "none")));
  await p.emulateMedia({ media: "screen" });
  // Fonts and tap targets.
  const fonts = await p.evaluate(() => ({ html: getComputedStyle(document.documentElement).fontSize, body: getComputedStyle(document.body).fontSize,
    sub: parseFloat(getComputedStyle(document.querySelector(".sub")).fontSize), tag: parseFloat(getComputedStyle(document.querySelector(".tag")).fontSize) }));
  check("font: 14px base, secondary >= 12px", fonts.html === "14px" && fonts.body === "14px" && fonts.sub >= 12 && fonts.tag >= 12, fonts);
  const tap = {};
  for (const id of ["overview", "decisions", "code", "checks", "materials"]) {
    await tab(p, id);
    tap[id] = await p.evaluate(() => { let min = 999;
      for (const el of document.querySelectorAll("button, [role=tab], input[type=text], .qopt")) {
        if (el.offsetParent === null || el.closest("[hidden]")) continue;
        const r = el.getBoundingClientRect(); if (!r.height) continue;
        if (r.height < min) min = r.height;
      }
      return +min.toFixed(1); });
  }
  check("tap targets >= 32px on every tab", Object.values(tap).every((v) => v >= 32), tap);
  await p.screenshot({ path: path.join(OUT, "themed-first-screen.png") });
  results.themed = { htmlBytes: fs.statSync(themed.html).size, domNodes: initial.domNodes };
  } catch (e) { console.error(e); check("themed section completed without an exception", false, String(e).slice(0, 400)); }
}
console.error("[run] resolved-cue section");
{
  const { page: p } = await open(resolved.url);
  await radio(p, 3, "extend");
  await tab(p, "code"); await p.waitForTimeout(200);
  check("C4: a decided question cues its block in attention mode, never hides it", await p.evaluate(() => {
    const seg = document.querySelector('.seg[data-block="2"]');
    return seg.classList.contains("q-resolved") && seg.style.display !== "none" && getComputedStyle(seg).display !== "none";
  }));
}
console.error("[run] mobile unified section");
{
  const { page: p } = await open(themed.url, { viewport: { width: 390, height: 844 } });
  await radio(p, 3, "extend");
  const mobile = await p.evaluate(() => ({ chip: document.querySelector("#q3 [data-qstatus]").textContent, state: document.querySelector("#q3 [data-qstatus]").dataset.state,
    confirm: document.querySelector("#q3 [data-confirm]") !== null,
    stored: JSON.parse(localStorage.getItem("review-report:" + JSON.parse(document.getElementById("data").textContent).key)).questions["3"] }));
  check("mobile: a tap is the decision itself — no draft-and-confirm step", mobile.state === "decided" && !mobile.confirm && mobile.stored.choice === "accepted", mobile);
  await p.click("#q3 [data-qreset]");
  check("mobile: reset reverts the choice", await p.evaluate(() => document.querySelector("#q3 [data-qstatus]").dataset.state === "open"));
  check("mobile: no horizontal overflow", await p.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
}
console.error("[run] no-JS themed section");
{
  const { page: p, context } = await open(themed.url, { javaScriptEnabled: false });
  check("no-JS: page stays unscripted", !((await p.locator("html").getAttribute("class")) ?? "").includes("js"));
  check("no-JS: every panel reads stacked", await p.evaluate(() => [...document.querySelectorAll(".panel")].every((x) => !x.hidden && x.getBoundingClientRect().height > 0)));
  check("no-JS: card text and variants read", (await p.textContent("#q3 .card-question")).includes("Keep the conversion") && (await p.textContent("#q3 .qopts")).includes("No new unit"));
  check("no-JS: radios, zones, answers and controls are disabled and say they need JS",
    await p.locator('#q3 input[data-question-variant]').first().isDisabled() && await p.locator('#q1 input[data-zone]').first().isDisabled()
    && await p.locator('[data-purpose-filter="tests"]').isDisabled() && await p.locator("#tree-filter-input").isDisabled()
    && await p.locator('[data-choice-filter="all"]').isDisabled() && await p.locator("#q2 [data-answer]").isDisabled()
    && (await p.textContent("#q3 .qopts")).includes("JavaScript"));
  check("no-JS: the counter is static with an honest title", await p.evaluate(() => { const c = document.getElementById("count-decisions");
    return c.textContent === "3 remaining" && /static count/i.test(c.title) && /saved answers are not counted/i.test(c.title); }));
  check("no-JS: the export button and the subtabs are hidden, the tree opens statically", await p.evaluate(() => document.getElementById("export-open").offsetParent === null
    && document.querySelector(".choice-filters").offsetParent === null
    && document.querySelectorAll(".fdir[open]").length === document.querySelectorAll(".fdir").length));
  await p.click("#file-0 > details.file-details > summary");
  check("no-JS: the map opens natively per file and reads", await p.locator("#b1").isVisible() && (await p.locator("#map .seg[data-block]").count()) === 3);
  check("no-JS: tabs are anchor links", await p.evaluate(() => [...document.querySelectorAll(".tabs [role=tab]")].every((t) => t.getAttribute("href") === "#panel-" + t.dataset.tab)));
  await context.close();
}
console.error("[run] hardening section");
{
  const { page: p } = await open(hostile.url);
  await tab(p, "code"); await p.click('[data-show="all"]'); await p.waitForTimeout(200);
  await p.click('[data-segpop="1"]'); await p.waitForTimeout(150);
  const popState = await p.evaluate(() => {
    const pop = document.getElementById("seg-popover");
    const onAttrs = [...pop.querySelectorAll("*")].flatMap((el) => [...el.attributes].filter((a) => /^on/i.test(a.name)).map((a) => a.name));
    const pr = pop.querySelector("a[target='_blank']");
    return { visible: !pop.hidden, onAttrs, imgs: pop.querySelectorAll("img").length,
      copy: pop.querySelector(".pop-copy")?.dataset.copy ?? null,
      prHref: pr?.getAttribute("href") ?? null, prAttrs: pr ? [...pr.attributes].map((a) => a.name).sort() : null,
      text: pop.textContent };
  });
  check("XSS: a hostile path/URL/labels inject no handler or markup into the popover",
    popState.visible && popState.onAttrs.length === 0 && popState.imgs === 0
    && popState.text.includes(HOSTILE_PATH) && popState.text.includes("Добавлено' onmouseover='alert(1)"), popState);
  check("XSS: the copy value and the PR href carry the hostile values intact",
    popState.copy === `${HOSTILE_PATH}:1 (h'1)` && popState.prHref === HOSTILE_URL
    && JSON.stringify(popState.prAttrs) === JSON.stringify(["href", "rel", "target"]), { copy: popState.copy, prHref: popState.prHref });
  // The v5 export preview and the settled rows carry hostile texts through the DOM API only.
  await p.evaluate(() => { document.querySelector("#f1")?.scrollIntoView(); });
  const hostileCard = await p.evaluate(() => ({ onAttrs: [...document.querySelectorAll("#panel-decisions *")].flatMap((el) => [...el.attributes].filter((a) => /^on/i.test(a.name)).map((a) => a.name)),
    imgs: document.querySelectorAll("#panel-decisions img").length }));
  check("XSS: the Choices list carries no injected handler or markup", hostileCard.onAttrs.length === 0 && hostileCard.imgs === 0, hostileCard);
}
{
  const { page: p } = await open(jsUrl.url);
  await tab(p, "code"); await p.click('[data-show="all"]'); await p.waitForTimeout(200);
  await p.click('[data-segpop="1"]'); await p.waitForTimeout(150);
  const jsPop = await p.evaluate(() => { const pop = document.getElementById("seg-popover");
    return { jsHrefs: [...pop.querySelectorAll("a")].filter((a) => /^javascript:/i.test(a.getAttribute("href") ?? "")).length, text: pop.textContent }; });
  check("XSS: a javascript: PR URL never becomes a link", jsPop.jsHrefs === 0 && jsPop.text.includes("javascript:alert(1)"), jsPop);
}
{
  const { page: p } = await open(shiki.url);
  await tab(p, "code"); await p.click('[data-show="all"]'); await p.waitForTimeout(200);
  await p.evaluate(() => document.querySelectorAll(".segcode").forEach((d) => { d.open = true; }));
  const colors = await p.evaluate(() => {
    const inline = (l) => { const s = l?.querySelector("span[style]"); if (!s) return null; const st = s.getAttribute("style");
      return { light: /color:(#[0-9a-f]{6})/.exec(st)?.[1], dark: /--shiki-dark:(#[0-9a-f]{6})/.exec(st)?.[1] }; };
    const line = (file, sel, text) => [...document.querySelectorAll(`#file-${file} .l.${sel}`)].find((l) => l.textContent.includes(text));
    return { cmtDel: inline(line(0, "del", "inside comment")), cmtCtx: inline(line(0, "ctx", "/* begin")),
      gapDel: inline(line(1, "del", "const c = 3;")), gapAdd: inline(line(1, "add", "const c = 4;")),
      ctlDel: inline(line(2, "del", "const c = 3;")), ctlAdd: inline(line(2, "add", "const c = 4;")) };
  });
  check("Shiki: the removed line inside a comment keeps the comment color (light+dark)",
    colors.cmtDel && colors.cmtCtx && colors.cmtDel.light === colors.cmtCtx.light && colors.cmtDel.dark === colors.cmtCtx.dark, colors);
  check("Shiki: non-adjacent hunks do not carry syntax state across the gap",
    colors.gapDel && colors.ctlDel && colors.gapDel.light === colors.ctlDel.light && colors.gapDel.dark === colors.ctlDel.dark
    && colors.gapAdd && colors.ctlAdd && colors.gapAdd.light === colors.ctlAdd.light, colors);
}
{
  const { page: p } = await open(legacyCatalog.url);
  const legacyState = await p.evaluate(() => ({ js: document.documentElement.classList.contains("js"),
    tabs: document.querySelectorAll(".tabs [role=tab]").length, own: document.body.textContent.includes("«Findings»") }));
  check("legacy catalog: an old record renders with its upgraded catalog", legacyState.js && legacyState.tabs === 5 && legacyState.own, legacyState);
  await tab(p, "code"); await p.click('[data-show="all"]'); await p.waitForTimeout(200);
  await p.click('[data-purpose-filter="tests"]'); await p.waitForTimeout(150);
  check("legacy catalog: the chrome works on the upgraded catalog", await p.evaluate(() => !document.getElementById("filter-chip").hidden
    && JSON.parse(localStorage.getItem("review-report:" + JSON.parse(document.getElementById("data").textContent).key)).hiddenPurposes.includes("tests")));
}
console.error("[run] legacy annotations section");
{
  const { page: p } = await open(legacyRu.url + "#panel-checks");
  const fn = new Function(`return (${fs.readFileSync(path.join(HERE, "review-annotations.browser.mjs"), "utf8")})`)();
  try { await fn(p); check("legacy annotations runtime on the v5 page", true); }
  catch (e) { check("legacy annotations runtime on the v5 page", false, String(e)); }
}
console.error("[run] 65507 full matrix");
if (big) {
  const p = page0;
  await p.goto(big.url, { waitUntil: "load" });
  await p.evaluate(() => localStorage.clear());
  await reloadClean(p);
  const ev = (fn, arg) => p.evaluate(fn, arg);
  const ls = () => state(p);
  try {
    // ---- initial state / IA ----
    const initial = await ev(() => ({
      active: document.querySelector('.tabs [aria-selected="true"]').dataset.tab,
      domNodes: document.querySelectorAll("*").length,
      tabs: [...document.querySelectorAll(".tabs [role=tab]")].map(t => t.dataset.tab),
      duplicateIds: [...new Set([...document.querySelectorAll("[id]")].map(e => e.id).filter((x, i, a) => a.indexOf(x) !== i))],
      treeOpen: document.querySelectorAll(".fdir[open]").length, treeTotal: document.querySelectorAll(".fdir").length,
      groups: [...document.querySelectorAll("#panel-decisions .dgroup")].map(g => g.id),
      subtabs: [...document.querySelectorAll("[data-choice-filter]")].map(b => b.dataset.choiceFilter),
      counter: document.getElementById("count-decisions").textContent,
      exportInHeader: !!document.querySelector("header.page-head #export-open"),
      qcards: document.querySelectorAll(".qcard").length,
      findings: document.querySelectorAll("#panel-decisions .finding:not(.idea)").length,
      ideas: document.querySelectorAll("#panel-decisions .finding.idea").length,
      templates: document.querySelectorAll("template[id^=segs-]").length,
      structureTargetClosed: !document.querySelector(".structure-target").open
    }));
    results.initial = initial;
    results.v6Initial = await ev(() => ({
      badges: Object.fromEntries([...document.querySelectorAll("[data-cf-count]")].map(e => [e.dataset.cfCount, +e.textContent])),
      removed: document.querySelectorAll("#progress-q, #apply-all, #export-json, #copy, .counters-strip, .status-strip").length,
      filtersWidth: document.querySelector(".choice-filters").getBoundingClientRect().width,
      sheetWidth: document.querySelector(".decision-sheet").getBoundingClientRect().width,
    }));
    check("v6: one canonical surface and badges 4/7/4/6/0/0", results.v6Initial.removed === 0 &&
      JSON.stringify(Object.values(results.v6Initial.badges)) === "[4,7,4,6,0,0]" &&
      results.v6Initial.filtersWidth <= results.v6Initial.sheetWidth, results.v6Initial);
    check("65507: starts at Choices, five tabs, the four action groups, the seven subtabs", initial.active === "decisions"
      && initial.tabs.join() === "overview,decisions,code,checks,materials"
      && initial.groups.join() === "group-owner,group-fix,group-data,group-settled"
      && initial.subtabs.join() === "all,q,f,i,fact,deferred,done", initial);
    check("65507: zero duplicate ids, DOM within budget, the tree open statically", initial.duplicateIds.length === 0 && initial.domNodes <= 15700
      && initial.treeOpen === initial.treeTotal && initial.treeTotal === 53, { dup: initial.duplicateIds, dom: initial.domNodes, tree: [initial.treeOpen, initial.treeTotal] });
    check("65507: the counter is ONE quantity — 4 main Q + 7 F, ideas outside", initial.counter === "11 осталось" && initial.exportInHeader
      && initial.qcards === 13 && initial.findings === 7 && initial.ideas === 4 && initial.templates === 96 && initial.structureTargetClosed, initial);
    await p.screenshot({ path: path.join(OUT, `v5-${USED}-first-screen.png`) });
    const choiceCounts = () => ev(() => {
      document.getElementById("export-open").click();
      const counts = {
        q: +document.querySelector('[data-cf-count="q"]').textContent,
        f: +document.querySelector('[data-cf-count="f"]').textContent,
        tab: parseInt(document.getElementById("count-decisions").textContent),
        exported: parseInt(document.querySelector(".xp-count").textContent)
      };
      document.getElementById("export-dialog").close();
      return counts;
    });
    results.choiceCounts = [await choiceCounts()];
    await p.check('#q2 input[value="keep"]');
    results.choiceCounts.push(await choiceCounts());
    await reloadClean(p);
    results.choiceCounts.push(await choiceCounts());
    await p.click('#q2 [data-qreset]');
    results.choiceCounts.push(await choiceCounts());
    await reloadClean(p);
    results.choiceCounts.push(await choiceCounts());
    check("v6: Q2 keep/reset/reload shares tab, subtabs and export: 11→10→10→11→11",
      results.choiceCounts.every((c, i) => c.tab === [11, 10, 10, 11, 11][i] && c.q + c.f === c.tab && c.exported === c.tab), results.choiceCounts);

    // ---- the unified shell ----
    const shell = await ev(() => {
      const card = document.getElementById("q2");
      const cs = getComputedStyle(card);
      const limit = card.querySelector(".card-limit");
      const opt = getComputedStyle(card.querySelector(".qopt"));
      return {
        borderLeftWidth: cs.borderLeftWidth,
        titlePx: parseFloat(getComputedStyle(card.querySelector(".card-title")).fontSize),
        metaPx: parseFloat(getComputedStyle(card.querySelector(".card-meta")).fontSize),
        limitOnSurface: !!limit && !limit.closest("details") && limit.textContent.includes("Однозначной рекомендации нет"),
        limitPx: limit ? parseFloat(getComputedStyle(limit).fontSize) : null,
        consPx: card.querySelector(".qopt .qcons") ? parseFloat(getComputedStyle(card.querySelector(".qopt .qcons")).fontSize) : null,
        optBorderTop: opt.borderTopWidth, optBorderLeft: opt.borderLeftWidth,
        qoptsBorder: getComputedStyle(card.querySelector(".qopts")).borderTopWidth,
        q8limit: document.querySelector("#q8 .card-limit")?.textContent.includes("Однозначной рекомендации нет") && !document.querySelector("#q8 .card-limit").closest("details"),
        f1evidence: document.querySelector("#f1 .card-limit").textContent,
        f1buttons: [...document.querySelectorAll("#f1 .decide button")].map(b => b.textContent),
        i1buttons: [...document.querySelectorAll("#i1 .decide button")].map(b => b.textContent),
        ideaOptional: document.querySelector("#ideas > summary").textContent.includes("необязательно"),
        ideaLimit: document.querySelector("#i1 .card-limit"),
        legendPx: parseFloat(getComputedStyle(card.querySelector(".qopts legend")).fontSize),
        factAnswer: (() => { const i = document.querySelector("#q4 [data-answer]"); return !!i && i.offsetParent !== null && !i.closest("details"); })(),
        zoneNote: document.querySelector("#q3 .zone-note").textContent.includes("не подтверждение"),
        decidedNeutral: (() => { const s = document.querySelector(".qstatus[data-state=decided]"); return s ? getComputedStyle(s).color : null; })(),
        commentClosed: !card.querySelector(".card-comment").open,
        noPermanentCardTextarea: [...document.querySelectorAll("#panel-decisions textarea")].every(t => t.closest("details") && !t.closest("details").open),
        blockCommentWrapper: !!document.querySelector("#map .block-comment") || !!document.querySelector('template[id^="segs-"]')
      };
    });
    results.shell = shell;
    check("65507: the shell — 16px title, 12px meta, 14px limit/consequences, no side stripe or nested option frames",
      shell.titlePx === 16 && shell.metaPx <= 13 && shell.limitPx === 14 && shell.consPx === 14
      && shell.borderLeftWidth === "0px" && shell.optBorderTop === "1px" && shell.optBorderLeft === "0px" && shell.qoptsBorder === "0px", shell);
    check("65507: Q2/Q8 uncertainty on the surface; the idea's explicit absence; F/I choices; the fact answer discoverable",
      shell.limitOnSurface && shell.q8limit && shell.ideaLimit === null && shell.ideaOptional && shell.legendPx === 14
      && shell.f1buttons.join() === "Исправить,Не исправлять" && shell.i1buttons.join() === "Взять,Не брать"
      && shell.factAnswer && shell.zoneNote && shell.commentClosed && shell.noPermanentCardTextarea, shell);

    // ---- theme cycle + prefers ----
    await p.click("#theme-toggle"); await p.waitForTimeout(80);
    const toLight = await ev(() => document.documentElement.dataset.theme);
    await p.click("#theme-toggle"); await p.waitForTimeout(80);
    const toDark = await ev(() => document.documentElement.dataset.theme);
    await p.click("#theme-toggle"); await p.waitForTimeout(80);
    const toAuto = await ev(() => document.documentElement.dataset.theme || null);
    await p.emulateMedia({ colorScheme: "dark" }); await reloadClean(p);
    const prefersDark = await ev(() => ({ attr: document.documentElement.dataset.theme || null, bg: getComputedStyle(document.body).backgroundColor }));
    await p.emulateMedia({ colorScheme: "light" }); await reloadClean(p);
    const prefersLight = await ev(() => getComputedStyle(document.body).backgroundColor);
    check("65507: theme cycle auto->light->dark->auto and prefers-color-scheme default", toLight === "light" && toDark === "dark" && toAuto === null
      && prefersDark.attr === null && prefersDark.bg !== prefersLight, { toLight, toDark, toAuto, prefersDark });

    // ---- fonts + tap targets on every tab ----
    const tap = {};
    for (const id of initial.tabs) {
      await tab(p, id);
      tap[id] = await ev(() => { let min = 999, worst = null;
        for (const el of document.querySelectorAll("button, [role=tab], input[type=text], .qopt")) {
          if (el.offsetParent === null || el.closest("[hidden]")) continue;
          const r = el.getBoundingClientRect(); if (!r.height) continue;
          if (r.height < min) { min = r.height; worst = (el.id ? "#" + el.id : el.className || el.tagName) + " " + el.textContent.trim().slice(0, 20); }
        }
        return { min: +min.toFixed(1), worst }; });
    }
    results.tap = tap;
    check("65507: tap targets >= 32px on every tab", Object.values(tap).every(v => v.min >= 32), tap);

    // ---- full map + the full contrast walk, light and dark ----
    await tab(p, "code");
    await p.click('[data-show="all"]'); await p.waitForTimeout(400);
    await ev(() => { document.querySelectorAll("details").forEach(d => window.__po(d)); });
    await p.waitForTimeout(500);
    const fullMap = await ev(() => ({
      insertedFiles: document.querySelectorAll(".file-lazy .file").length,
      uniqueBlocks: new Set([...document.querySelectorAll("#map .seg[data-block]")].map(s => s.dataset.block)).size,
      segsTotal: document.querySelectorAll("#map .seg[data-block]").length,
      ctxLines: document.querySelectorAll("#map .l.ctx").length,
      addLines: document.querySelectorAll("#map .l.add").length,
      delLines: document.querySelectorAll("#map .l.del").length
    }));
    results.fullMap = fullMap;
    check("v6: all 6740 diff lines survive", fullMap.addLines === 4043 && fullMap.delLines === 1597 && fullMap.ctxLines === 1100, fullMap);
    results.v6Map = await ev(() => ({
      headers: document.querySelectorAll("#map .segbar").length,
      fragments: document.querySelectorAll("#map [data-fragment]").length,
      comments: document.querySelectorAll("#map .block-comment").length,
      b40: { headers: document.querySelectorAll("#b40 .segbar").length, fragments: document.querySelectorAll('#map [data-fragment="40"]').length },
      dom: document.querySelectorAll("*").length,
      duplicateIds: [...document.querySelectorAll("[id]")].map(e => e.id).filter((id, i, ids) => ids.indexOf(id) !== i)
    }));
    check("v6: grouped 1470 headers/comments, 1517 fragments, B40 one header/two fragments, no duplicate ids",
      results.v6Map.headers === 1470 && results.v6Map.comments === 1470 && results.v6Map.fragments === 1517 &&
      results.v6Map.b40.headers === 1 && results.v6Map.b40.fragments === 2 && results.v6Map.duplicateIds.length === 0, results.v6Map);
    results.lineOrder = await ev(() => {
      const files = [...document.querySelectorAll("#map .file")], backwards = [];
      for (const [file, node] of files.entries()) for (const side of ["old", "new"]) {
        let last = 0;
        for (const cell of node.querySelectorAll(".l > ." + side)) {
          const n = Number(cell.textContent);
          if (!n) continue;
          if (n < last) backwards.push({ file, side, last, n });
          last = n;
        }
      }
      return { files: files.length, backwards };
    });
    check("v6: all 96 files retain monotonic old/new diff order", results.lineOrder.files === 96 && !results.lineOrder.backwards.length, results.lineOrder);
    check("v6: screens have one section warning", await ev(() => document.querySelectorAll("#screens > p.sub").length === 1));
    await p.click('[data-tree-mode="flat"]');
    results.v6Tree = await ev(() => ({
      flat: document.getElementById("ftree-folder").classList.contains("flat"),
      rows: document.querySelectorAll(".frow").length,
      display: getComputedStyle(document.querySelector(".fdir")).display,
      whiteSpace: getComputedStyle(document.querySelector(".fname")).whiteSpace,
      folderWhiteSpace: getComputedStyle(document.querySelector(".fdir > summary")).whiteSpace,
      emptyMarker: getComputedStyle(document.querySelector("[data-purpose-empty]"), "::before").content,
      emptyDisabled: document.querySelector("[data-purpose-empty]").disabled,
      before: document.querySelector(".tree-col").getBoundingClientRect().width
    }));
    await p.locator("#tree-resize").focus(); await p.keyboard.press("ArrowRight");
    Object.assign(results.v6Tree, await ev(() => ({
      after: document.querySelector(".tree-col").getBoundingClientRect().width,
      stored: JSON.parse(localStorage.getItem("review-report:" + JSON.parse(document.getElementById("data").textContent).key)).treeWidth
    })));
    await p.click('[data-tree-mode="folder"]');
    check("v6: compact folder/list tree keeps 96 rows and resizes", results.v6Tree.flat && results.v6Tree.rows === 96 &&
      results.v6Tree.display === "contents" && results.v6Tree.whiteSpace === "nowrap" && results.v6Tree.folderWhiteSpace === "nowrap" &&
      results.v6Tree.emptyDisabled && results.v6Tree.emptyMarker === "none" && results.v6Tree.after > results.v6Tree.before, results.v6Tree);
    check("65507: the full audit materializes 96 files, 1470 unique blocks, 1517 fragments", fullMap.insertedFiles === 96 && fullMap.uniqueBlocks === 1470
      && fullMap.segsTotal === 1517 && await ev(() => document.querySelectorAll("#map [data-fragment]").length) === 1517 && fullMap.ctxLines > 0 && fullMap.addLines > 0 && fullMap.delLines > 0, fullMap);
    const diffSel = await ev(() => {
      const mark = (l, name) => { if (!l) return null; window.__po(l.closest(".segcode")); l.dataset.probe = name; return `[data-probe="${name}"]`; };
      return {
        keepDel: mark(document.querySelector(".seg.v-keep .l.del"), "keepDel"),
        removeAdd: mark(document.querySelector(".seg.v-remove .l.add"), "removeAdd"),
        fixDel: mark(document.querySelector(".seg.v-fix .l.del"), "fixDel"),
        questionAdd: mark(document.querySelector(".seg.v-question .l.add"), "questionAdd"),
        ctx: (() => { const c = [...document.querySelectorAll("#map .l.ctx")].find(x => x.querySelector("span[style]")) || document.querySelector("#map .l.ctx"); return c ? mark(c, "ctx") : null; })()
      };
    });
    const measureDiff = () => ev((sels) => {
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
    }, diffSel);
    const diffLight = await measureDiff();
    await p.click("#theme-toggle"); await p.click("#theme-toggle"); await p.waitForTimeout(150);
    const diffDark = await measureDiff();
    await p.click("#theme-toggle"); await p.waitForTimeout(100);
    results.diffLight = diffLight; results.diffDark = diffDark;
    for (const [name, d] of [["light", diffLight], ["dark", diffDark]]) {
      check(`65507: ${name} full token/gutter walk >= 4.5, chip contrast, dual theme present`, d.fullWalk.below45 === 0 && d.fullWalk.gutterBelow45 === 0
        && d.fullWalk.min >= 4.5 && d.fullWalk.gutterMin >= 4.5 && d.chipRatio >= 4.5 && d.shikiDualPresent
        && (!d.keepDel || d.keepDel.textRatio >= 4.5) && (!d.removeAdd || d.removeAdd.textRatio >= 4.5), { walk: d.fullWalk, chip: d.chipRatio });
    }
    const codeFonts = await ev(() => {
      const sizes = {};
      for (const sel of ["#map pre code", "#map .l b", ".segmeta > summary", ".segcode > summary", ".gap", ".segbar .tag", ".counters .c span", ".sub code", ".passport-body", ".count-note", ".label", ".chip", "th", ".shot-note", ".card-meta", ".card-id", ".xp-row"]) {
        const el = document.querySelector(sel); if (el) sizes[sel] = parseFloat(getComputedStyle(el).fontSize);
      }
      return { sizes, allAtLeast12: Object.values(sizes).every(v => v >= 12) };
    });
    check("65507: secondary text never below 12px", codeFonts.allAtLeast12, codeFonts);

    // ---- geometry: every tab × 6 widths + CSS zoom 200% + dark at 320 ----
    const geometry = [];
    for (const width of [320, 390, 768, 1024, 1366, 1440, 1600, 1920, 2560]) {
      await p.setViewportSize({ width, height: 900 }); await p.waitForTimeout(120);
      for (const id of initial.tabs) {
        await tab(p, id);
        geometry.push(await ev(({ width, id }) => ({ width, id, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }), { width, id }));
      }
    }
    results.geometry = geometry;
    await p.setViewportSize({ width: 1920, height: 900 }); await tab(p, "code");
    results.v6Width = await ev(() => ({
      wrap: document.querySelector(".wrap").getBoundingClientRect().width,
      code: document.querySelector("#code-layout").getBoundingClientRect().width,
      diff: document.querySelector(".diff-col").getBoundingClientRect().width
    }));
    check("v6: wide code uses a 1600px canvas", results.v6Width.wrap === 1600 && results.v6Width.code >= 1500 && results.v6Width.diff >= 1100, results.v6Width);
    check("65507: no horizontal overflow at 320-1440 on every tab", geometry.every(x => x.sw === x.cw), geometry.filter(x => x.sw !== x.cw));
    await p.setViewportSize({ width: 1366, height: 900 });
    await p.addStyleTag({ content: "html{zoom:2}" }); await p.waitForTimeout(200);
    const zoom200 = [];
    for (const id of initial.tabs) { await tab(p, id); zoom200.push(await ev((id) => ({ id, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }), id)); }
    results.zoom200 = zoom200;
    results.zoomNative = { attempted: false, native: false, note: "native browser zoom unavailable in headless; CSS zoom:2 used and marked as such" };
    check("65507: no horizontal overflow at CSS zoom 200% (native zoom unavailable in headless)", zoom200.every(x => x.sw === x.cw), zoom200);
    await ev(() => { [...document.querySelectorAll("style")].filter(s => s.textContent.includes("zoom:2")).forEach(s => s.remove()); });
    await p.click("#theme-toggle"); await p.click("#theme-toggle");
    await p.setViewportSize({ width: 320, height: 900 });
    const darkNarrow = [];
    for (const id of initial.tabs) { await tab(p, id); darkNarrow.push(await ev((id) => ({ id, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }), id)); }
    check("65507: no horizontal overflow in dark at 320px", darkNarrow.every(x => x.sw === x.cw), darkNarrow);
    await p.setViewportSize({ width: 1366, height: 900 }); await p.click("#theme-toggle");

    // ---- the decision state machine: unified, reversible, settled, children ----
    await tab(p, "decisions");
    await ev(() => { document.querySelectorAll("#panel-decisions details").forEach(d => d.open = false); });
    const decisions = {};
    await ev(() => { document.querySelector("#q1 .card-comment").open = true; });
    await p.fill("#qnote-q1", "только комментарий, без варианта"); await p.waitForTimeout(250);
    decisions.commentOnly = { q1: (await ls()).questions?.["1"] ?? null, note: (await ls()).notes?.q1 };
    check("65507: a comment alone does not decide", decisions.commentOnly.q1 === null && decisions.commentOnly.note === "только комментарий, без варианта", decisions.commentOnly);
    decisions.commentSummary = await ev(() => document.querySelector("#q1 .card-comment summary").textContent);
    check("65507: the saved comment reads «Комментарий · 1»", decisions.commentSummary === "Комментарий · 1", decisions.commentSummary);
    decisions.commentEdit = await ev(() => {
      const d = document.querySelector("#q1 .card-comment"); d.open = true;
      d.querySelector(".comment-edit").click();
      const ta = d.querySelector("textarea");
       return { viewHidden: d.querySelector(".comment-view").hidden, taVisible: !ta.hidden, focused: document.activeElement === ta, savedNote: d.querySelector(".comment-saved")?.textContent ?? null };
    });
    check("65507: «Изменить» reveals the textarea and focuses it; the saved note is honest", decisions.commentEdit.viewHidden && decisions.commentEdit.taVisible
      && decisions.commentEdit.focused && decisions.commentEdit.savedNote === null, decisions.commentEdit);
    await ev(() => { document.querySelector("#q1 .card-comment").open = false; }); await p.waitForTimeout(150);
    await ev(() => { document.querySelector("#q1 .card-comment").open = true; }); await p.waitForTimeout(150);
    decisions.commentCompactAgain = await ev(() => ({ viewVisible: !document.querySelector("#q1 .comment-view").hidden, taHidden: document.querySelector("#qnote-q1").hidden }));
    check("65507: closing the comment collapses it back to the compact view", decisions.commentCompactAgain.viewVisible && decisions.commentCompactAgain.taHidden, decisions.commentCompactAgain);
    await p.check('#q1 input[value="keep-mockup"]'); await p.waitForTimeout(200);
    decisions.q1apply = await ev(() => ({
      chip: document.querySelector("#q1 [data-qstatus]").textContent,
      chipState: document.querySelector("#q1 [data-qstatus]").dataset.state,
      chipColor: getComputedStyle(document.querySelector("#q1 [data-qstatus]")).color,
      fgColor: getComputedStyle(document.documentElement).getPropertyValue("--fg").trim(),
      settled: document.querySelector('[data-unit="q1"]').dataset.settled,
      inSettledGroup: !!document.querySelector('#group-settled [data-unit="q1"]'),
      counter: document.getElementById("count-decisions").textContent
    }));
    check("65507: apply -> neutral «Выбрано», the card settles, the counter decrements", /^Выбрано:/.test(decisions.q1apply.chip)
      && decisions.q1apply.settled === "done" && decisions.q1apply.inSettledGroup && decisions.q1apply.counter === "10 осталось", decisions.q1apply);
    // Defer with a reason: the variant stays a draft, the card settles as deferred, the radio unchecks.
    await ev(() => { document.getElementById("group-settled").open = true; document.querySelector('#group-settled [data-unit="q1"]').closest("details").open = true; });
    await ev(() => { document.querySelector("#q1 .card-comment").open = true; document.querySelector("#q1 .card-comment .comment-edit").click(); });
    await p.fill("#qnote-q1", "отложено: нужно обсудить с командой"); await p.waitForTimeout(200);
    await p.click('#q1 [data-defer]'); await p.waitForTimeout(200);
    decisions.q1deferred = await ev(() => ({
      radioChecked: document.querySelector('#q1 input[value="keep-mockup"]').checked,
      chip: document.querySelector("#q1 [data-qstatus]").textContent,
      draftVisible: !document.querySelector("#q1 [data-qdraft]").hidden,
      settled: document.querySelector('[data-unit="q1"]').dataset.settled,
      backHome: document.querySelector('[data-unit="q1"]').parentElement.closest(".dgroup").id
    }));
    decisions.q1deferredState = (await ls()).questions?.["1"];
    check("65507: a reasoned deferral keeps the draft, unchecks the radio, settles as a deferred row",
      !decisions.q1deferred.radioChecked && decisions.q1deferred.chip === "отложено" && decisions.q1deferred.draftVisible
      && decisions.q1deferred.settled === "deferred" && decisions.q1deferred.backHome === "group-settled"
      && decisions.q1deferredState.choice === "deferred" && decisions.q1deferredState.variant === "keep-mockup", decisions.q1deferred);
    await p.check('#q1 input[value="keep-mockup"]'); await p.waitForTimeout(150);
    decisions.q1reapply = await ev(() => ({ chip: document.querySelector("#q1 [data-qstatus]").textContent, draftHidden: document.querySelector("#q1 [data-qdraft]").hidden }));
    check("65507: re-picking accepts again and hides the draft", /^Выбрано:/.test(decisions.q1reapply.chip) && decisions.q1reapply.draftHidden, decisions.q1reapply);
    // Q2 keep -> children open; Q9 decides; Q2 base -> children NA with the draft kept; keep again -> the answer returns.
    await p.check('#q2 input[value="keep"]'); await p.waitForTimeout(200);
    decisions.q2keep = await ev(() => ({
      childrenOpen: document.querySelector('[data-qchildren="2"]').open,
      q9disabled: document.querySelector("#q9 input[data-question-variant]").disabled,
      q9gateHidden: document.querySelector("#q9 [data-qgate]").hidden,
      q2settled: document.querySelector('[data-unit="q2"]').dataset.settled || null
    }));
    results.v6Q2 = await ev(() => {
      document.getElementById("export-open").click();
      const value = { badges: Object.fromEntries([...document.querySelectorAll("[data-cf-count]")].map(e => [e.dataset.cfCount, +e.textContent])),
        remaining: document.getElementById("count-decisions").textContent,
        exportRemaining: document.querySelector(".xp-count").textContent,
        settled: document.querySelector('[data-unit="q2"]').dataset.settled ?? null };
      document.getElementById("export-dialog").close(); return value;
    });
    check("v6: Q2 accepted with pending children stays active; badges and export agree",
      results.v6Q2.settled === null && results.v6Q2.badges.q + results.v6Q2.badges.f === parseInt(results.v6Q2.remaining) &&
      results.v6Q2.exportRemaining.startsWith(results.v6Q2.remaining), results.v6Q2);
    check("65507: Q2 keep opens the children; Q9 enabled; Q2 stays while children are pending", decisions.q2keep.childrenOpen
      && !decisions.q2keep.q9disabled && decisions.q2keep.q9gateHidden && decisions.q2keep.q2settled === null, decisions.q2keep);
    await p.check('#q9 input[value="keep"]'); await p.waitForTimeout(150);
    await p.check('#q2 input[value="base"]'); await p.waitForTimeout(200);
    decisions.q2base = await ev(() => ({
      naCards: [...document.querySelectorAll(".qcard.na")].map(c => c.id).sort(),
      q9disabled: document.querySelector("#q9 input[data-question-variant]").disabled,
      q9radioChecked: document.querySelector('#q9 input[value="keep"]').checked,
      q9gateMentionsDraft: document.querySelector("#q9 [data-qgate]").textContent.includes("черновик"),
      q9status: document.querySelector("#q9 [data-qstatus]").textContent,
      q2settled: document.querySelector('[data-unit="q2"]').dataset.settled
    }));
    check("65507: Q2 base retires Q9-Q11 with the draft kept; the whole unit settles", decisions.q2base.naCards.join() === "q10,q11,q9"
      && decisions.q2base.q9disabled && !decisions.q2base.q9radioChecked && decisions.q2base.q9gateMentionsDraft
      && decisions.q2base.q9status === "неприменимо" && decisions.q2base.q2settled === "done", decisions.q2base);
    await ev(() => { document.getElementById("group-settled").open = true; document.querySelector('#group-settled [data-unit="q2"]').closest("details").open = true; });
    await p.check('#q2 input[value="keep"]'); await p.waitForTimeout(200);
    decisions.q2keepAgain = await ev(() => ({
      q9disabled: document.querySelector("#q9 input[data-question-variant]").disabled,
      q9checked: document.querySelector('#q9 input[value="keep"]').checked,
      childrenOpen: document.querySelector('[data-qchildren="2"]').open,
      q2settled: document.querySelector('[data-unit="q2"]').dataset.settled || null
    }));
    check("65507: keep again reopens the children; the old child answer does not return silently", !decisions.q2keepAgain.q9disabled
      && !decisions.q2keepAgain.q9checked && decisions.q2keepAgain.childrenOpen && decisions.q2keepAgain.q2settled === null, decisions.q2keepAgain);
    // F/I: apply -> skip -> empty, the settled relocation and the revert home.
    await p.click('#f1 .decide button[value="apply"]'); await p.waitForTimeout(150);
    decisions.f1apply = await ev(() => ({ chip: document.querySelector('#f1 [data-fstatus]').textContent, settled: document.querySelector('[data-unit="f1"]').dataset.settled, counter: document.getElementById("count-decisions").textContent }));
    check("65507: F apply -> «Выбрано: Исправить», settled", decisions.f1apply.chip === "Выбрано: Исправить" && decisions.f1apply.settled === "done", decisions.f1apply);
    await ev(() => { document.getElementById("group-settled").open = true; document.querySelector('#group-settled [data-unit="f1"]').closest("details").open = true; });
    await p.click('#f1 .decide button[value="skip"]'); await p.waitForTimeout(150);
    decisions.f1skip = await ev(() => ({ chip: document.querySelector('#f1 [data-fstatus]').textContent, settled: document.querySelector('[data-unit="f1"]').dataset.settled }));
    check("65507: F skip -> «Выбрано: Не исправлять», still settled", decisions.f1skip.chip === "Выбрано: Не исправлять" && decisions.f1skip.settled === "done", decisions.f1skip);
    await p.click('#f1 .decide button[value="skip"]'); await p.waitForTimeout(150);
    decisions.f1empty = await ev(() => ({ chip: document.querySelector('#f1 [data-fstatus]').textContent, settled: document.querySelector('[data-unit="f1"]').dataset.settled || null, home: document.querySelector('[data-unit="f1"]').parentElement.closest(".dgroup").id }));
    check("65507: toggling off returns the SAME card home, no duplicate", decisions.f1empty.chip === "ожидает" && decisions.f1empty.settled === null && decisions.f1empty.home === "group-fix", decisions.f1empty);
    await ev(() => { document.getElementById("ideas").open = true; });
    const counterBeforeIdea = await ev(() => document.getElementById("count-decisions").textContent);
    await p.click('#i1 .decide button[value="apply"]'); await p.waitForTimeout(150);
    decisions.i1apply = await ev(() => ({ chip: document.querySelector('#i1 [data-fstatus]').textContent, settled: document.querySelector('[data-unit="i1"]').dataset.settled, counter: document.getElementById("count-decisions").textContent }));
    check("65507: an idea settles but never enters the mandatory counter", decisions.i1apply.chip === "Выбрано: Взять" && decisions.i1apply.settled === "done"
      && decisions.i1apply.counter === counterBeforeIdea, { ...decisions.i1apply, counterBeforeIdea });
    await reloadClean(p);
    decisions.afterReload = await ev(() => ({
      q2checked: document.querySelector('#q2 input[value="keep"]').checked,
      q1checked: document.querySelector('#q1 input[value="keep-mockup"]').checked,
      q1note: document.getElementById("qnote-q1").value,
      q1commentSummary: document.querySelector("#q1 .card-comment summary").textContent,
      i1chip: document.querySelector("#i1 [data-fstatus]").textContent,
      counter: document.getElementById("count-decisions").textContent
    }));
    check("65507: reload keeps the decisions, the comment and the counter", decisions.afterReload.q2checked && decisions.afterReload.q1checked
      && decisions.afterReload.q1note === "отложено: нужно обсудить с командой" && decisions.afterReload.q1commentSummary === "Комментарий · 1"
      && decisions.afterReload.i1chip === "Выбрано: Взять", decisions.afterReload);
    results.decisions = decisions;

    // ---- the subtabs filter ONE list ----
    const subtabs = {};
    for (const [val, expect] of [["q", ["q1", "q2", "q6", "q8"]], ["f", ["f1", "f2", "f3", "f4", "f5", "f6", "f7"]], ["i", ["i1", "i2", "i3", "i4"]], ["fact", ["q3", "q4", "q5", "q7", "q12", "q13"]]]) {
      await p.click(`[data-choice-filter="${val}"]`); await p.waitForTimeout(120);
      subtabs[val] = await ev((v) => ({
        visible: [...document.querySelectorAll("#panel-decisions .dunit")].filter(u => !u.hidden).map(u => u.dataset.unit).sort(),
        pressed: document.querySelector(`[data-choice-filter="${v}"]`).getAttribute("aria-pressed"),
        singleList: document.querySelectorAll("#panel-decisions .qcard").length
      }), val);
      check(`65507: subtab ${val} shows exactly its cards of the one list`, subtabs[val].visible.join() === expect.slice().sort().join()
        && subtabs[val].pressed === "true" && subtabs[val].singleList === 13, subtabs[val]);
    }
    await p.click('[data-choice-filter="done"]'); await p.waitForTimeout(120);
    subtabs.done = await ev(() => ({ visible: [...document.querySelectorAll("#panel-decisions .dunit")].filter(u => !u.hidden).map(u => u.dataset.unit).sort(), settledOpen: document.getElementById("group-settled").open }));
    check("65507: the Done subtab shows the settled cards and opens their group", subtabs.done.visible.join() === "i1,q1" && subtabs.done.settledOpen, subtabs.done);
    await p.click('[data-choice-filter="deferred"]'); await p.waitForTimeout(120);
    subtabs.deferred = await ev(() => [...document.querySelectorAll("#panel-decisions .dunit")].filter(u => !u.hidden).map(u => u.dataset.unit).sort());
    check("65507: the Deferred subtab is empty while nothing is deferred", subtabs.deferred.length === 0, subtabs.deferred);
    await p.click('[data-choice-filter="all"]'); await p.waitForTimeout(120);
    results.subtabs = subtabs;

    // ---- the export dialog: parity preview === text === JSON from EVERY tab ----
    const pageData = await ev(() => JSON.parse(document.getElementById("data").textContent));
    const BUCKETS = ["Принятые решения", "Отложенные и черновики", "Ответы на факты", "Отмеченные зоны", "Комментарии"];
    // The expected rows are reconstructed HERE from the downloaded JSON alone — every user datum the
    // schema-4 payload carries (Q/F/I choices and drafts, factAnswers, zones, passages, block notes and
    // questions[].comment including the legacy questions[id].note) — independent of the page's builders.
    const expectedRows = (j) => {
      const d = pageData, rows = Object.fromEntries(BUCKETS.map(b => [b, []]));
      const draftSuffix = (q) => q.variant ? " · черновик «" + q.variant.text + "» — не действует" : "";
      for (const q of j.questions) {
        const meta = d.questions.find(x => x.id === q.question);
        if (q.status === "not-applicable") rows["Отложенные и черновики"].push({ text: "Q" + q.question + " · неприменимо (Q" + meta.parent.question + ")" + draftSuffix(q), hash: "#q" + q.question });
        else if (q.status === "accepted") rows["Принятые решения"].push({ text: "Q" + q.question + " · " + (q.variant ? "Выбрано: " + q.variant.text : "Выбрано: (вариант не указан)"), hash: "#q" + q.question });
        else if (q.status === "deferred") rows["Отложенные и черновики"].push({ text: "Q" + q.question + " · отложено" + draftSuffix(q), hash: "#q" + q.question });
        else if (q.variant) rows["Отложенные и черновики"].push({ text: "Q" + q.question + " · Черновик «" + q.variant.text + "» — не действует", hash: "#q" + q.question });
      }
      for (const f of d.findings) { const v = j.findings[String(f.id)];
        if (v === "apply") rows["Принятые решения"].push({ text: "F" + f.id + " · Исправить — " + f.title, hash: "#f" + f.id });
        else if (v === "skip") rows["Принятые решения"].push({ text: "F" + f.id + " · Не исправлять — " + f.title, hash: "#f" + f.id }); }
      for (const i of d.ideas) { const v = j.findings[i.id];
        if (v === "apply") rows["Принятые решения"].push({ text: i.id.toUpperCase() + " · Взять — " + i.title, hash: "#" + i.id });
        else if (v === "skip") rows["Принятые решения"].push({ text: i.id.toUpperCase() + " · Не брать — " + i.title, hash: "#" + i.id }); }
      for (const [aid, val] of Object.entries(j.factAnswers || {})) rows["Ответы на факты"].push({ text: aid.toUpperCase() + " · Ответ внесён: " + val, hash: "#" + aid });
      for (const [zid, marked] of Object.entries(j.zones || {})) {
        if (!marked) continue;
        const cut = zid.lastIndexOf("-"), qid = zid.slice(0, cut), zi = Number(zid.slice(cut + 1));
        const meta = d.questions.find(x => String(x.id) === qid);
        const zone = (meta?.zones || [])[zi];
        rows["Отмеченные зоны"].push({ text: "Q" + qid + " · " + (zone ?? zid) + " · отмечена, не подтверждение", hash: "#q" + qid });
      }
      const ctxOf = (id) => {
        if (id[0] === "q") { const q = d.questions.find(x => String(x.id) === id.slice(1)); return q ? "Q" + id.slice(1) + " · " + (q.text || "").slice(0, 90) : id.toUpperCase(); }
        if (id[0] === "f") { const f = d.findings.find(x => "f" + x.id === id); return f ? "F" + f.id + " · " + f.title : id.toUpperCase(); }
        if (id[0] === "i") { const i = d.ideas.find(x => x.id === id); return i ? i.id.toUpperCase() + " · " + i.title : id.toUpperCase(); }
        if (id[0] === "b") { const b = d.blocks.find(x => String(x.id) === id.slice(1)); return b ? "B" + b.id + " · " + b.path + " " + b.where : id.toUpperCase(); }
        return id.toUpperCase();
      };
      // questions[].comment is noteOf: the legacy entry note OR the shared notes — both must reach the text.
      for (const q of j.questions) if (q.comment) rows["Комментарии"].push({ text: ctxOf("q" + q.question) + ": " + q.comment, hash: "#q" + q.question });
      for (const [id, val] of Object.entries(j.notes)) {
        if (id[0] === "q" && j.questions.some(q => "q" + q.question === id && q.comment)) continue;
        rows["Комментарии"].push({ text: ctxOf(id) + ": " + val, hash: "#" + id });
      }
      for (const passage of j.passages) rows["Комментарии"].push({ text: "Выделенный текст · " + passage.where + ": «" + passage.quote + "»" + (passage.note ? " — " + passage.note : ""), hash: passage.anchor && passage.anchor.id ? "#" + passage.anchor.id : "#passages" });
      const roots = d.questions.filter(q => q.kind === "decision" && !q.parent);
      const remaining = roots.filter(q => { const e = j.questions.find(x => x.question === q.id); return !e || (e.status !== "accepted" && e.status !== "deferred"); }).length
        + d.findings.filter(f => !j.findings[String(f.id)]).length;
      const open = d.findings.filter(f => !j.findings[String(f.id)]).map(f => "F" + f.id);
      rows.remaining = remaining + " осталось" + (open.length ? " · необработанные замечания: " + open.join(", ") : "");
      return rows;
    };
    const capturePreview = () => ev(() => ({
      sections: [...document.querySelectorAll("#export-preview .xp-sec")].map(s => ({ title: s.querySelector("h3").textContent, rows: [...s.querySelectorAll(".xp-row")].map(pp => ({ text: pp.querySelector("span")?.textContent ?? pp.textContent, goto: pp.querySelector("a.xp-goto")?.getAttribute("href") ?? null })) })),
      count: document.querySelector(".xp-count").textContent,
      out: document.getElementById("out").value
    }));
    const checkParity = (j, cap, label) => {
      const exp = expectedRows(j);
      const sortRows = (r) => r.slice().sort((a, b) => a.text.localeCompare(b.text));
      const problems = [];
      for (const b of BUCKETS) {
        const sec = cap.sections.find(s => s.title === b);
        const got = sec ? sec.rows.filter(r => r.goto) : [];
        if (JSON.stringify(sortRows(got)) !== JSON.stringify(sortRows(exp[b].map(r => ({ text: r.text, goto: r.hash }))))) problems.push(`preview bucket «${b}» ≠ JSON (${label})`);
        if (exp[b].length) {
          if (!sec) problems.push(`text/preview missing bucket «${b}» (${label})`);
          if (!cap.out.split("\n").includes(b)) problems.push(`text summary missing section «${b}» (${label})`);
          for (const r of exp[b]) if (!cap.out.includes("- " + r.text)) problems.push(`text summary missing row «${r.text.slice(0, 60)}» (${label})`);
        }
      }
      if (!cap.count.startsWith(exp.remaining)) problems.push(`preview counter ≠ JSON remaining (${label})`);
      if (!cap.out.split("\n").includes(exp.remaining)) problems.push(`text counter ≠ JSON remaining (${label})`);
      return { ok: problems.length === 0, problems, rows: BUCKETS.reduce((n, b) => n + exp[b].length, 0) };
    };
    // A block comment (code tab) and a passage (overview) so the export must gather cross-tab data.
    await reloadClean(p);
    // A LEGACY note in questions[id].note (the v1/v3 store shape, not state.notes): the export must carry it
    // through noteOf into questions[].comment AND into the preview/text, not only into the JSON.
    await ev(() => {
      const d = JSON.parse(document.getElementById("data").textContent);
      const k = "review-report:" + d.key, s = JSON.parse(localStorage.getItem(k) || "{}");
      s.questions = s.questions || {};
      s.questions["6"] = { ...(s.questions["6"] || {}), note: "legacy-заметка в questions[6].note" };
      localStorage.setItem(k, JSON.stringify(s));
    });
    await reloadClean(p);
    await tab(p, "code");
    await ev(() => { const d = document.querySelector("#map .segmeta"); d.open = true; d.scrollIntoView({ block: "center" }); });
    const blockNoteId = await ev(() => document.querySelector("#map .segmeta input[data-note]").dataset.note);
    await p.fill("#map .segmeta input[data-note]", "комментарий к блоку из таба Код"); await p.waitForTimeout(250);
    const blockCommentLabel = await ev(() => document.querySelector("#map .segmeta > summary").textContent);
    check("65507: the block comment summary reads «Комментарий · 1 · подробности»", /^Комментарий · 1/.test(blockCommentLabel), blockCommentLabel);
    await tab(p, "overview");
    await ev(() => {
      const pp = document.querySelector("#summary .lead") || document.querySelector("#summary p");
      const node = [...pp.childNodes].find(n => n.nodeType === 3 && n.data.trim()) || pp.firstChild;
      const r = document.createRange(); r.setStart(node, 0); r.setEnd(node, Math.min(30, node.length));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    });
    await p.waitForTimeout(250);
    await p.click("#comment"); await p.waitForTimeout(150);
    await p.fill("#annotation-editor textarea", "комментарий к выделенному тексту");
    await p.click('#annotation-editor [data-annotation-action="save"]'); await p.waitForTimeout(250);
    await tab(p, "decisions");
    await ev(() => { const z = document.querySelector("#q3 [data-zone]"); z.scrollIntoView({ block: "center" }); });
    await p.check("#q3 [data-zone]"); await p.waitForTimeout(150);
    const zones = (await ls()).zones;
    check("65507: a zone mark without proof is stored, never a confirmation", Object.keys(zones).length >= 1, zones);
    const exportPerTab = {};
    let negativeParity = null;
    const stubClipboard = (mode) => ev((m) => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: (txt) => { window.__lastCopy = txt; return m === "ok" ? Promise.resolve() : Promise.reject(new DOMException("denied", "NotAllowedError")); } } });
    }, mode);
    const restoreClipboard = () => ev(() => { delete navigator.clipboard; });
    for (const id of initial.tabs) {
      await tab(p, id);
      await p.click("#export-open"); await p.waitForTimeout(200);
      const perTab = await ev(() => ({
        dialogOpen: document.getElementById("export-dialog").open,
        sections: [...document.querySelectorAll("#export-preview .xp-sec h3")].map(h => h.textContent),
        gotoLinks: [...document.querySelectorAll("#export-preview a.xp-goto")].map(a => a.getAttribute("href")),
        hasBlockNote: document.getElementById("export-preview").textContent.includes("комментарий к блоку из таба Код"),
        hasPassage: document.getElementById("export-preview").textContent.includes("комментарий к выделенному тексту"),
        hasCardNote: document.getElementById("export-preview").textContent.includes("отложено: нужно обсудить с командой"),
        hasLegacyNote: document.getElementById("export-preview").textContent.includes("legacy-заметка в questions[6].note"),
        hasZone: document.getElementById("export-preview").textContent.includes("отмечена, не подтверждение"),
        draftMarked: document.getElementById("export-preview").textContent.includes("не действует"),
        outReadonly: document.getElementById("out").readOnly
      }));
      const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#export-json-top")]);
      const dj = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
      perTab.json = { schema: dj.schema_version, record: dj.record_sha256, diff: dj.diff_sha256, applyWithoutVariant: dj.applyWithoutVariant, keys: Object.keys(dj).sort(), factAnswers: dj.factAnswers, zones: dj.zones,
        legacyComment: dj.questions.find(q => q.question === 6)?.comment ?? null };
      const cap = await capturePreview();
      perTab.parity = checkParity(dj, cap, "tab " + id);
      exportPerTab[id] = perTab;
      check(`65507: export from ${id} — schema 4, digests, factAnswers, zones, legacy note, parity preview===text===JSON`, dj.schema_version === 4
        && dj.record_sha256 === bigRecordSha && Array.isArray(dj.applyWithoutVariant) && dj.applyWithoutVariant.length === 0
        && typeof dj.factAnswers === "object" && Object.keys(dj.zones || {}).length >= 1
        && perTab.json.legacyComment === "legacy-заметка в questions[6].note"
        && perTab.dialogOpen && perTab.hasBlockNote && perTab.hasPassage && perTab.hasCardNote && perTab.hasLegacyNote && perTab.hasZone && perTab.draftMarked
        && perTab.outReadonly && perTab.parity.ok, { json: perTab.json, parity: perTab.parity });
      if (id === initial.tabs[0]) {
        // The parity test must be SENSITIVE: a builder that drops the zones or the legacy note fails it.
        // Strip those rows from a real capture and demand the comparison go red — no false confidence.
        const exp = expectedRows(dj);
        check("65507: the parity comparison covers the zone mark and the legacy questions[].note",
          exp["Отмеченные зоны"].length >= 1 && exp["Комментарии"].some(r => r.text.includes("legacy-заметка в questions[6].note")),
          { zones: exp["Отмеченные зоны"], legacy: exp["Комментарии"].filter(r => r.text.includes("legacy-заметка")) });
        const strip = (needle) => ({ ...cap,
          sections: cap.sections.map(s => ({ ...s, rows: s.rows.filter(r => !r.text.includes(needle)) })),
          out: cap.out.split("\n").filter(l => !l.includes(needle)).join("\n") });
        const negZones = checkParity(dj, strip("отмечена, не подтверждение"), "negative: zones dropped");
        const negLegacy = checkParity(dj, strip("legacy-заметка в questions[6].note"), "negative: legacy note dropped");
        check("65507: negative parity — dropping the zone rows or the legacy note FAILS the comparison",
          !negZones.ok && !negLegacy.ok, { zones: negZones.problems, legacy: negLegacy.problems });
        negativeParity = { zones: negZones, legacy: negLegacy };
      }
      await p.locator("#export-dialog form button").click(); await p.waitForTimeout(120);
    }
    results.export = { perTab: exportPerTab, negativeParity };
    // «Перейти» opens the tab + target and closes the dialog; «Закрыть» returns the scroll and the focus.
    await tab(p, "code");
    await ev(() => window.scrollTo(0, 500)); await p.waitForTimeout(150);
    await p.click("#export-open"); await p.waitForTimeout(200);
    await p.click(`#export-preview a[href="#${blockNoteId}"]`); await p.waitForTimeout(600);
    const goto = await ev((bid) => ({
      dialogOpen: document.getElementById("export-dialog").open,
      tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab,
      segVisible: document.getElementById(bid).offsetParent !== null,
      codeOpen: document.getElementById(bid).querySelector(".segcode").open,
      inViewport: (() => { const r = document.getElementById(bid).getBoundingClientRect(); return r.top >= -5 && r.top < innerHeight; })()
    }), blockNoteId);
    check("65507: «Перейти» lands on the block in the code tab and closes the dialog", !goto.dialogOpen && goto.tab === "code" && goto.segVisible && goto.codeOpen && goto.inViewport, goto);
    await tab(p, "overview");
    await p.click("#export-open"); await p.waitForTimeout(250);
    const sb = await ev(() => window.scrollY);
    await p.locator("#export-dialog form button").click(); await p.waitForTimeout(250);
    const closeRestore = await ev((expected) => ({ scrollOk: Math.abs(window.scrollY - expected) < 5, focusReturned: document.activeElement.id === "export-open" }), sb);
    check("65507: «Закрыть» returns the scroll position and the focus", closeRestore.scrollOk && closeRestore.focusReturned, closeRestore);
    // The clipboard: a REAL probe, then forced success and rejection in the dialog.
    const realClipboardProbe = await ev(async () => {
      const r = { write: false, read: false };
      try { await navigator.clipboard.writeText("probe-v5"); r.write = true; } catch (e) { r.writeError = String(e).slice(0, 90); }
      try { r.read = await navigator.clipboard.readText() === "probe-v5"; } catch (e) { r.readError = String(e).slice(0, 90); }
      return r;
    });
    results.export.realClipboardProbe = realClipboardProbe;
    if (realClipboardProbe.write) {
      await p.click("#export-open"); await p.waitForTimeout(150);
      await p.click("#copy-top"); await p.waitForTimeout(350);
      const realCopy = await ev(() => ({ status: document.getElementById("export-status").textContent }));
      check("65507: the real clipboard copy confirms «Скопировано»", realCopy.status === "Скопировано", realCopy);
      await p.waitForTimeout(1500);
      await p.locator("#export-dialog form button").click();
    } else results.checks.push({ name: "65507: real clipboard probe", ok: true, detail: "write unavailable in this context; the stubbed success/rejection below remain the evidence" });
    await p.click("#export-open"); await p.waitForTimeout(150);
    await stubClipboard("ok");
    await p.click("#copy-top"); await p.waitForTimeout(300);
    const copySuccess = await ev(() => ({
      status: document.getElementById("export-status").textContent,
      handedOver: window.__lastCopy === document.getElementById("out").value && window.__lastCopy.length > 0,
      noFallbackSelection: document.activeElement !== document.getElementById("out")
    }));
    check("65507: a confirmed copy hands over exactly the text, no fallback selection", copySuccess.status === "Скопировано" && copySuccess.handedOver && copySuccess.noFallbackSelection, copySuccess);
    await p.waitForTimeout(1500);
    const copyRestored = await ev(() => document.getElementById("copy-top").textContent.trim());
    check("65507: the copy button label restores", copyRestored === "Копировать текст", copyRestored);
    await stubClipboard("fail");
    await p.click("#copy-top"); await p.waitForTimeout(350);
    const copyRejected = await ev(() => {
      const out = document.getElementById("out"), status = document.getElementById("export-status").textContent;
      return { status, notCopied: status !== "Скопировано" && document.getElementById("copy-top").textContent.trim() !== "Скопировано",
        instructionOk: status.includes("Автоматически скопировать не удалось") && status.includes("Ctrl/⌘+C"),
        selected: document.activeElement === out && out.selectionStart === 0 && out.selectionEnd === out.value.length && out.value.length > 0,
        outVisible: out.offsetParent !== null };
    });
    check("65507: a refused copy selects the whole text and says Ctrl/⌘+C, never «Скопировано»", copyRejected.notCopied && copyRejected.instructionOk && copyRejected.selected && copyRejected.outVisible, copyRejected);
    await p.screenshot({ path: path.join(OUT, `v5-${USED}-export-rejected.png`) });
    const manualFallback = await ev(() => { const out = document.getElementById("out"); out.focus(); out.setSelectionRange(0, 50); return { selectable: out.selectionEnd === 50, readonly: out.readOnly }; });
    check("65507: the readonly textarea stays selectable by hand", manualFallback.selectable && manualFallback.readonly, manualFallback);
    await restoreClipboard();
    await p.locator("#export-dialog form button").click();
    // The popover source copy: success / rejection / recovery.
    await tab(p, "code"); await p.click('[data-show="all"]'); await p.waitForTimeout(300);
    const popId = await ev(() => { const d = JSON.parse(document.getElementById("data").textContent); const b = d.blocks.find(x => x.firstAdd != null && x.firstDel != null); const btn = document.querySelector(`[data-segpop="${b.id}"]`); btn.scrollIntoView({ block: "center" }); return b.id; });
    await p.click(`[data-segpop="${popId}"]`); await p.waitForTimeout(250);
    await stubClipboard("ok");
    await p.click("#seg-popover .pop-copy"); await p.waitForTimeout(250);
    const popSuccess = await ev(() => ({ button: document.querySelector("#seg-popover .pop-copy").textContent, noFailStatus: !document.querySelector("#seg-popover .pop-copy-status") }));
    check("65507: popover copy success says «Скопировано»", popSuccess.button === "Скопировано" && popSuccess.noFailStatus, popSuccess);
    await p.waitForTimeout(1300);
    await stubClipboard("fail");
    await p.click("#seg-popover .pop-copy"); await p.waitForTimeout(250);
    const popRejected = await ev(() => {
      const btn = document.querySelector("#seg-popover .pop-copy"), status = document.querySelector("#seg-popover .pop-copy-status"), sel = getSelection().toString();
      return { notCopied: btn.textContent !== "Скопировано", instructionOk: !!status && status.textContent.includes("не удалось") && status.textContent.includes("Ctrl/⌘+C"), selectionIsValue: sel === btn.dataset.copy && sel.includes(":") };
    });
    check("65507: popover copy refusal selects exactly the source value", popRejected.notCopied && popRejected.instructionOk && popRejected.selectionIsValue, popRejected);
    await stubClipboard("ok");
    await p.click("#seg-popover .pop-copy"); await p.waitForTimeout(250);
    const popRecovered = await ev(() => ({ statusGone: !document.querySelector("#seg-popover .pop-copy-status") }));
    check("65507: popover copy recovers after a refusal", popRecovered.statusGone, popRecovered);
    await p.keyboard.press("Escape"); await p.waitForTimeout(150);
    await restoreClipboard();

    // ---- deep links + scroll memory ----
    const deepLinks = {};
    await tab(p, "decisions"); await ev(() => window.scrollTo(0, 600)); await p.waitForTimeout(150);
    await tab(p, "code"); await tab(p, "decisions"); await p.waitForTimeout(200);
    deepLinks.scrollMemory = await ev(() => Math.round(window.scrollY));
    check("65507: scroll memory restores the tab's position", Math.abs(deepLinks.scrollMemory - 600) < 5, deepLinks.scrollMemory);
    for (const [hash, target, tabId] of [["#q2", "q2", "decisions"], ["#f1", "f1", "decisions"], ["#i1", "i1", "decisions"], ["#panel-findings", null, "decisions"], ["#m5", "m5", "overview"], ["#shot-3", "shot-3", "materials"]]) {
      await ev((h) => { location.hash = h; }, hash); await p.waitForTimeout(700);
      deepLinks[hash] = await ev(({ target }) => {
        const el = target ? document.getElementById(target) : null;
        const r = el ? el.getBoundingClientRect() : null;
        return { tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab, inViewport: r ? r.top >= -5 && r.top < innerHeight : null };
      }, { target });
      check(`65507: deep link ${hash} opens ${tabId} and reveals the target`, deepLinks[hash].tab === tabId && (target ? deepLinks[hash].inViewport : true), deepLinks[hash]);
    }
    await ev(() => { location.hash = "#q1"; }); await p.waitForTimeout(600);
    deepLinks.settledCard = await ev(() => ({ rowOpen: document.getElementById("q1").closest("details.settled-row")?.open ?? null, visible: document.getElementById("q1").offsetParent !== null, filterReset: document.querySelector('[data-choice-filter="all"]').getAttribute("aria-pressed") }));
    check("65507: a deep link into a settled card opens its row and resets the subtab", deepLinks.settledCard.visible && deepLinks.settledCard.filterReset === "true", deepLinks.settledCard);
    results.deepLinks = deepLinks;
    const deepLinkB2 = {};
    for (const mode of ["attention", "all", "keep", "fix", "remove", "question"]) {
      await tab(p, "code"); await p.click(`[data-show="${mode}"]`); await p.waitForTimeout(250);
      await ev(() => { location.hash = "#panel-code"; }); await p.waitForTimeout(120);
      await ev(() => { location.hash = "#b2"; }); await p.waitForTimeout(900);
      deepLinkB2[mode] = await ev(() => { const e = document.getElementById("b2"); const r = e.getBoundingClientRect(); return { visible: e.offsetParent !== null && e.style.display !== "none", inViewport: r.top >= -5 && r.top < innerHeight, show: document.getElementById("map").dataset.show, codeOpen: e.querySelector(".segcode").open }; });
      check(`65507: #b2 reveals the kept block in ${mode} mode`, deepLinkB2[mode].visible && deepLinkB2[mode].inViewport && deepLinkB2[mode].codeOpen, deepLinkB2[mode]);
    }
    const dlPage = await ctx.newPage(); watch(dlPage);
    await dlPage.goto(big.url + "#b2", { waitUntil: "load" }); await dlPage.waitForTimeout(1200);
    deepLinkB2.directLoad = await dlPage.evaluate(() => { const e = document.getElementById("b2"); const r = e.getBoundingClientRect(); return { visible: e && e.offsetParent !== null, inViewport: r.top >= -5 && r.top < innerHeight, tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab, codeOpen: e.querySelector(".segcode").open }; });
    check("65507: a direct load of #b2 lands on the block in the code tab", deepLinkB2.directLoad.visible && deepLinkB2.directLoad.inViewport && deepLinkB2.directLoad.tab === "code", deepLinkB2.directLoad);
    await dlPage.close();
    results.deepLinkB2 = deepLinkB2;

    // ---- 96 files × 6 modes: ZERO empty shells (reveal through every ancestor) ----
    await tab(p, "code");
    const fileReveal = await ev(async () => {
      const failures = [];
      for (const mode of ["attention", "all", "keep", "fix", "remove", "question"]) {
        document.querySelector(`button[data-show="${mode}"]`).click();
        for (const button of document.querySelectorAll(".fname")) {
          button.click(); await new Promise(requestAnimationFrame);
          const file = document.querySelector("#file-" + button.dataset.fexpand + " .file");
          const segs = [...file.querySelectorAll(".seg[data-block]")];
          if (!segs.length || segs.some(seg => getComputedStyle(seg).display === "none")) failures.push({ mode, file: button.dataset.fexpand });
          if (segs.some(seg => seg.offsetParent === null)) failures.push({ mode, file: button.dataset.fexpand, reason: "hidden through ancestors" });
          if (!file.classList.contains("reveal")) failures.push({ mode, file: button.dataset.fexpand, reason: "no reveal class" });
        }
      }
      return { cases: 6 * document.querySelectorAll(".fname").length, failures };
    });
    results.fileReveal = fileReveal;
    check("65507: reveal 576/576 — every file shows all its blocks in every mode, no empty shell", fileReveal.cases === 576 && fileReveal.failures.length === 0, fileReveal.failures.slice(0, 5));

    // ---- purpose multi-toggles × modes (pairwise), hidden tests with Q/F/req, resets ----
    const purpose = {};
    await p.click('[data-show="all"]'); await p.waitForTimeout(300);
    const purposeCombos = [[], ["tests"], ["styles"], ["tests", "styles"], ["production"]];
    purpose.pairwise = [];
    for (const mode of ["attention", "all", "keep", "fix", "remove", "question"]) {
      for (const hidden of purposeCombos) {
        await ev((h) => { const d = JSON.parse(document.getElementById("data").textContent); const k = "review-report:" + d.key; const st = JSON.parse(localStorage.getItem(k) || "{}"); st.hiddenPurposes = h; localStorage.setItem(k, JSON.stringify(st)); }, hidden);
        await reloadClean(p); await tab(p, "code");
        await p.click(`[data-show="${mode}"]`); await p.waitForTimeout(200);
        const r = await ev(({ mode, hidden }) => {
          const segs = [...document.querySelectorAll("#map .seg[data-block]")].filter(s => s.style.display !== "none");
          const rows = [...document.querySelectorAll(".frow")].filter(r => r.style.display !== "none");
          const modeOk = segs.every(s => mode === "all" ? true : mode === "attention" ? s.dataset.verdict !== "keep" : s.dataset.verdict === mode);
          return { mode, hidden, segs: segs.length,
            purposeOk: segs.every(s => !hidden.includes(s.dataset.purpose)),
            rowsPurposeOk: rows.every(r => !hidden.includes(r.dataset.purpose)),
            modeOk,
            pressed: [...document.querySelectorAll("[data-purpose-filter]")].map(b => [b.dataset.purposeFilter, b.getAttribute("aria-pressed")]),
            chip: document.getElementById("filter-chip").hidden ? null : document.getElementById("filter-chip-label").textContent };
        }, { mode, hidden });
        purpose.pairwise.push(r);
        const pressedOk = r.pressed.every(([cat, pressed]) => pressed === String(!hidden.includes(cat)));
        if (!(r.purposeOk && r.rowsPurposeOk && r.modeOk && pressedOk && (!hidden.length || (r.chip && r.chip.startsWith("Скрыто:")))))
          check(`65507: purpose pairwise ${mode} × [${hidden}]`, false, r);
      }
    }
    check("65507: purpose pairwise 6 modes × 5 hiding combos — map, tree, pressed state, chip", purpose.pairwise.every(r => r.purposeOk && r.rowsPurposeOk && r.modeOk), { combos: purpose.pairwise.length });
    await ev(() => { const d = JSON.parse(document.getElementById("data").textContent); const k = "review-report:" + d.key; localStorage.setItem(k, JSON.stringify({ ...JSON.parse(localStorage.getItem(k) || "{}"), hiddenPurposes: [] })); });
    await reloadClean(p); await tab(p, "code"); await p.click('[data-show="all"]'); await p.waitForTimeout(300);
    await p.click('[data-purpose-filter="tests"]'); await p.waitForTimeout(300);
    purpose.testsToggle = await ev(() => {
      const d = JSON.parse(document.getElementById("data").textContent);
      const rows = [...document.querySelectorAll(".frow")].filter(r => r.style.display !== "none");
      const segs = [...document.querySelectorAll("#map .seg[data-block]")].filter(s => s.style.display !== "none");
      const tests = d.blocks.filter(b => b.purpose === "tests");
      const testsSegs = tests.reduce((s, b) => s + (b.parts || 1), 0);
      return { rows: rows.length, segs: segs.length, testsBlocks: tests.length, testsSegs, chip: document.getElementById("filter-chip-label").textContent, stored: JSON.parse(localStorage.getItem("review-report:" + d.key)).hiddenPurposes };
    });
    check("65507: hiding tests removes 15 files / 388 blocks (their fragments), stored additively", purpose.testsToggle.rows === 81
      && purpose.testsToggle.segs === 1517 - purpose.testsToggle.testsSegs && purpose.testsToggle.testsBlocks === 388 && purpose.testsToggle.testsSegs === 396
      && purpose.testsToggle.stored.join() === "tests" && purpose.testsToggle.chip.startsWith("Скрыто:"), purpose.testsToggle);
    await p.click('.evidence-banner [data-q-filter="3"]'); await p.waitForTimeout(400);
    purpose.qWithHiddenTests = await ev(() => {
      const vis = [...document.querySelectorAll("#map .seg[data-block]")].filter(s => s.style.display !== "none" && s.offsetParent !== null);
      return { q: document.getElementById("map").dataset.q, allQ3: vis.every(s => (s.dataset.q || "").split(" ").includes("3")), noTests: vis.every(s => s.dataset.purpose !== "tests") };
    });
    check("65507: the Q filter stacks on the hidden tests", purpose.qWithHiddenTests.allQ3 && purpose.qWithHiddenTests.noTests, purpose.qWithHiddenTests);
    await p.click("#filter-clear"); await p.waitForTimeout(200);
    await p.click('[data-purpose-filter="tests"]'); await p.waitForTimeout(250);
    await tab(p, "decisions");
    await ev(() => { document.querySelector("#f7 .qwhere").open = true; });
    await p.click('#f7 [data-f-filter]'); await p.waitForTimeout(400);
    purpose.fWithHiddenTests = await ev(() => {
      const vis = [...document.querySelectorAll("#map .seg[data-block]")].filter(s => s.style.display !== "none" && s.offsetParent !== null);
      return { f: document.getElementById("map").dataset.f, noTests: vis.every(s => s.dataset.purpose !== "tests") };
    });
    check("65507: the F filter stacks on the hidden tests", purpose.fWithHiddenTests.noTests, purpose.fWithHiddenTests);
    await p.click("#filter-clear"); await p.waitForTimeout(200);
    await p.click('[data-purpose-filter="tests"]'); await p.waitForTimeout(250);
    await tab(p, "checks");
    await ev(() => { const b = document.querySelector("[data-req-filter]"); b.scrollIntoView({ block: "center" }); });
    await p.click("[data-req-filter]"); await p.waitForTimeout(400);
    purpose.reqWithHiddenTests = await ev(() => {
      const vis = [...document.querySelectorAll("#map .seg[data-block]")].filter(s => s.style.display !== "none" && s.offsetParent !== null);
      return { req: document.getElementById("map").dataset.req, noTests: vis.every(s => s.dataset.purpose !== "tests") };
    });
    check("65507: the requirement filter stacks on the hidden tests", purpose.reqWithHiddenTests.noTests, purpose.reqWithHiddenTests);
    const testsBlock = await ev(() => { const d = JSON.parse(document.getElementById("data").textContent); return d.blocks.find(b => b.purpose === "tests").id; });
    await ev((bid) => { location.hash = "#b" + bid; }, testsBlock); await p.waitForTimeout(1000);
    purpose.deepLinkReset = await ev((bid) => {
      const e = document.getElementById("b" + bid);
      const d = JSON.parse(document.getElementById("data").textContent);
      return { visible: e.offsetParent !== null && e.style.display !== "none", inViewport: (() => { const r = e.getBoundingClientRect(); return r.top >= -5 && r.top < innerHeight; })(), hiddenPurposes: JSON.parse(localStorage.getItem("review-report:" + d.key)).hiddenPurposes || [], allPressed: [...document.querySelectorAll("[data-purpose-filter]")].every(b => b.getAttribute("aria-pressed") === "true") };
    }, testsBlock);
    check("65507: a deep link to a hidden tests block resets the hiding", purpose.deepLinkReset.visible && purpose.deepLinkReset.inViewport
      && purpose.deepLinkReset.hiddenPurposes.length === 0 && purpose.deepLinkReset.allPressed, purpose.deepLinkReset);
    await p.click('[data-purpose-filter="tests"]'); await p.waitForTimeout(200);
    await p.click('[data-purpose-filter="styles"]'); await p.waitForTimeout(200);
    await p.click("#filter-clear"); await p.waitForTimeout(300);
    purpose.clearCoverage = await ev(() => ({
      uniqueBlocks: new Set([...document.querySelectorAll("#map .seg[data-block]")].map(s => s.dataset.block)).size,
      segs: document.querySelectorAll("#map .seg[data-block]").length,
      visibleSegs: [...document.querySelectorAll("#map .seg[data-block]")].filter(s => s.style.display !== "none").length,
      rows: [...document.querySelectorAll(".frow")].filter(r => r.style.display !== "none").length,
      chipHidden: document.getElementById("filter-chip").hidden
    }));
    check("65507: the reset restores the FULL coverage 1470/1517/96", purpose.clearCoverage.uniqueBlocks === 1470 && purpose.clearCoverage.segs === 1517
      && purpose.clearCoverage.visibleSegs === 1517 && purpose.clearCoverage.rows === 96 && purpose.clearCoverage.chipHidden, purpose.clearCoverage);
    await tab(p, "decisions"); await ev(() => window.scrollTo(0, 400)); await p.waitForTimeout(150);
    const preScroll = await ev(() => window.scrollY);
    await ev(() => { document.querySelector("#q2 .qwhere").open = true; }); await p.waitForTimeout(300);
    await ev(() => document.querySelector('#q2 [data-q-filter]').click()); await p.waitForTimeout(500);
    await p.click("#filter-next"); await p.waitForTimeout(350);
    const chipNext = await ev(() => { const el = document.activeElement; return { pos: document.getElementById("filter-pos").textContent, focusedBlock: el.dataset?.block ?? null, codeOpen: el.querySelector(".segcode")?.open ?? null }; });
    check("65507: the chip's next jumps to a focused block with its code open", !!chipNext.focusedBlock && chipNext.codeOpen, chipNext);
    await p.click("#filter-prev"); await p.waitForTimeout(350);
    await p.click("#filter-back"); await p.waitForTimeout(350);
    const chipReturn = await ev((expected) => ({ tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab, scrollOk: Math.abs(window.scrollY - expected) < 5, chipHidden: document.getElementById("filter-chip").hidden }), preScroll);
    check("65507: the chip's back returns to the source tab and scroll", chipReturn.scrollOk && chipReturn.chipHidden && chipReturn.tab === "decisions", chipReturn);
    results.purpose = purpose;

    // ---- the tree: search highlight + Enter, scrollspy 96/96, hide-tree persistence, mobile ----
    await tab(p, "code");
    await p.fill("#tree-filter-input", "templaterow"); await p.waitForTimeout(300);
    const tree = {};
    tree.search = await ev(() => {
      const d = JSON.parse(document.getElementById("data").textContent);
      const rows = [...document.querySelectorAll(".frow")].filter(r => r.style.display !== "none");
      return { rows: rows.length, marks: document.querySelectorAll(".frow mark").length, allMatch: rows.every(r => d.files[+r.dataset.frow].toLowerCase().includes("templaterow")) };
    });
    check("65507: the tree search filters and highlights", tree.search.rows > 0 && tree.search.marks > 0 && tree.search.allMatch, tree.search);
    await p.focus("#tree-filter-input"); await p.keyboard.press("Enter"); await p.waitForTimeout(500);
    tree.enter = await ev(() => ({ revealed: document.querySelectorAll(".file.reveal").length }));
    check("65507: Enter reveals the first match", tree.enter.revealed >= 1, tree.enter);
    await p.click("#tree-filter-clear"); await p.waitForTimeout(200);
    tree.scrollspy = await ev(async () => {
      const hosts = [...document.querySelectorAll(".file-lazy")].filter(h => h.querySelector(".file"));
      let hits = 0, samples = 0;
      for (const h of hosts) {
        h.querySelector(".file").scrollIntoView({ block: "start" });
        await new Promise(r => setTimeout(r, 60));
        window.dispatchEvent(new Event("scroll"));
        await new Promise(r => setTimeout(r, 80));
        const expected = hosts.filter(x => x.querySelector(".file").getBoundingClientRect().top <= 140).at(-1);
        const cur = document.querySelector(".frow.current");
        samples++;
        if (cur && expected && cur.dataset.frow === expected.dataset.file) hits++;
      }
      return { samples, hits, ratio: hits / samples };
    });
    check("65507: scrollspy marks the current file 96/96", tree.scrollspy.samples === 96 && tree.scrollspy.hits === 96, tree.scrollspy);
    await p.click("#hide-tree"); await p.waitForTimeout(150);
    tree.hidden = await ev(() => ({ display: getComputedStyle(document.querySelector(".tree-col")).display, showBtn: !document.getElementById("show-tree").hidden }));
    check("65507: hide-tree collapses the panel and offers show-tree", tree.hidden.display === "none" && tree.hidden.showBtn, tree.hidden);
    await reloadClean(p); await tab(p, "code");
    tree.hiddenAfterReload = await ev(() => ({ display: getComputedStyle(document.querySelector(".tree-col")).display, stored: JSON.parse(localStorage.getItem("review-report:" + JSON.parse(document.getElementById("data").textContent).key)).treeHidden }));
    check("65507: the tree collapse persists across reload", tree.hiddenAfterReload.display === "none" && tree.hiddenAfterReload.stored === true, tree.hiddenAfterReload);
    await p.click("#show-tree"); await p.waitForTimeout(150);
    await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(250);
    const tapMobile = {};
    for (const id of ["decisions", "code"]) {
      await tab(p, id);
      tapMobile[id] = await ev(() => { let min = 999;
        for (const el of document.querySelectorAll("button, [role=tab], input[type=text], .qopt")) {
          if (el.offsetParent === null || el.closest("[hidden]")) continue;
          const r = el.getBoundingClientRect(); if (!r.height) continue;
          if (r.height < min) min = r.height;
        }
        return +min.toFixed(1); });
    }
    check("65507: mobile tap targets >= 32 at 390px", Object.values(tapMobile).every(v => v >= 32), tapMobile);
    await tab(p, "code");
    const mobileTree = await ev(() => ({ mview: document.getElementById("code-layout").dataset.mview, treeVisible: getComputedStyle(document.querySelector(".tree-col")).display !== "none", diffVisible: getComputedStyle(document.querySelector(".diff-col")).display !== "none" }));
    check("65507: mobile shows the tree AND the diff by default", mobileTree.treeVisible && mobileTree.diffVisible, mobileTree);
    await p.click('[data-mview="tree"]'); await p.waitForTimeout(150);
    const treeOnly = await ev(() => ({ treeVisible: getComputedStyle(document.querySelector(".tree-col")).display !== "none", diffHidden: getComputedStyle(document.querySelector(".diff-col")).display === "none" }));
    await p.click('[data-mview="diff"]'); await p.waitForTimeout(150);
    const diffOnly = await ev(() => ({ treeHidden: getComputedStyle(document.querySelector(".tree-col")).display === "none", diffVisible: getComputedStyle(document.querySelector(".diff-col")).display !== "none" }));
    check("65507: the mobile tree/diff toggles work", treeOnly.treeVisible && treeOnly.diffHidden && diffOnly.treeHidden && diffOnly.diffVisible, { treeOnly, diffOnly });
    await tab(p, "decisions");
    await p.click('#q2 [data-qreset]'); await p.waitForTimeout(150);
    await ev(() => { document.getElementById("q2").scrollIntoView({ block: "start" }); window.scrollBy(0, -10); }); await p.waitForTimeout(300);
    const mobileQ2 = await ev(() => {
      const opts = [...document.querySelectorAll("#q2 .qopt")];
      const first = opts[0].getBoundingClientRect();
      return { count: opts.length, firstOptionTop: Math.round(first.top), firstOptionInViewport: first.top >= 0 && first.top < innerHeight,
        bothPresent: opts.length === 2 && opts.every(o => o.getBoundingClientRect().height > 0), confirmGone: !document.querySelector("#q2 [data-confirm]"), viewportH: innerHeight };
    });
    // The record's full question, limit and consequences stay on the surface (nothing truncated): the contract
    // asks the FIRST option within the screen when the card is at the top, not the whole card folded into it.
    check("65507: mobile Q2 — the first variant is within the screen, both present, no confirm step", mobileQ2.count === 2 && mobileQ2.firstOptionInViewport && mobileQ2.bothPresent && mobileQ2.confirmGone, mobileQ2);
    await p.screenshot({ path: path.join(OUT, `v5-${USED}-mobile-q2.png`) });
    await p.check('#q2 input[value="keep"]'); await p.waitForTimeout(200);
    const mobileTap = await ev(() => ({ chip: document.querySelector("#q2 [data-qstatus]").textContent, state: (JSON.parse(localStorage.getItem("review-report:" + JSON.parse(document.getElementById("data").textContent).key)).questions || {})["2"] }));
    check("65507: a mobile tap is the decision itself (accepted, no draft)", /^Выбрано:/.test(mobileTap.chip) && mobileTap.state.choice === "accepted", mobileTap);
    await p.click('#q2 [data-qreset]'); await p.waitForTimeout(150);
    const mobileRevert = await ev(() => document.querySelector("#q2 [data-qstatus]").textContent);
    check("65507: mobile reset reverts to waiting", mobileRevert === "ожидает", mobileRevert);
    await p.setViewportSize({ width: 1366, height: 900 });
    results.tree = tree;

    // ---- annotation return-to-source ----
    await tab(p, "materials");
    const passageSaved = await ev(() => document.querySelectorAll("#passages .passage").length);
    check("65507: the passage comment is listed", passageSaved >= 1, passageSaved);
    await p.click('#passages .passage button:has-text("К фрагменту")'); await p.waitForTimeout(600);
    const annotationBack = await ev(() => { const m = document.querySelector(".annotation-marker"); const r = m.getBoundingClientRect(); return { tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab, markerVisible: m.offsetParent !== null && r.top >= 0 && r.top < innerHeight, focused: document.activeElement === m }; });
    check("65507: «К фрагменту» returns to the visible, focused marker", annotationBack.markerVisible && annotationBack.focused, annotationBack);

    // ---- print: owner nested complete, auditor full, restore; real PDFs ----
    await tab(p, "code"); await p.click('[data-show="all"]'); await p.waitForTimeout(300);
    await ev(() => { window.print = () => {}; });
    await p.emulateMedia({ media: "print" });
    await ev(() => window.dispatchEvent(new Event("beforeprint"))); await p.waitForTimeout(400);
    const print = { owner: await ev(() => ({
      panelsVisible: [...document.querySelectorAll(".panel")].every(pp => getComputedStyle(pp).display !== "none"),
      mapHidden: getComputedStyle(document.getElementById("map")).display === "none",
      treeHidden: getComputedStyle(document.querySelector(".tree-col")).display === "none",
      screensVisible: getComputedStyle(document.getElementById("screens")).display !== "none",
      limitsVisible: getComputedStyle(document.querySelector("#coverage")).display !== "none",
      decisionsDetailsOpen: [...document.querySelectorAll("#panel-decisions details")].every(d => d.open),
      nestedCount: document.querySelectorAll("#panel-decisions .qwhere .segmeta, #panel-decisions .qwhere .segcode").length,
      nestedOpen: [...document.querySelectorAll("#panel-decisions .qwhere .segmeta, #panel-decisions .qwhere .segcode")].every(d => d.open),
      settledVisible: [...document.querySelectorAll("#group-settled .dunit")].every(u => u.offsetParent !== null)
    })) };
    check("65507: owner print hides map/tree, keeps screens/limits, opens EVERY decisions disclosure", print.owner.mapHidden && print.owner.treeHidden
      && print.owner.screensVisible && print.owner.limitsVisible && print.owner.decisionsDetailsOpen && print.owner.settledVisible, print.owner);
    check("65507: owner print opens every nested «Где в коде» disclosure (572/572 grouped blocks)", print.owner.nestedCount === 572 && print.owner.nestedOpen, { count: print.owner.nestedCount, open: print.owner.nestedOpen });
    await p.screenshot({ path: path.join(OUT, `v5-${USED}-owner-print.png`) });
    await ev(() => window.dispatchEvent(new Event("afterprint")));
    await p.emulateMedia({ media: "screen" }); await p.waitForTimeout(250);
    print.ownerRestored = await ev(() => ({ mapVisible: getComputedStyle(document.getElementById("map")).display !== "none", treeVisible: getComputedStyle(document.querySelector(".tree-col")).display !== "none" }));
    check("65507: owner afterprint restores the map and the tree", print.ownerRestored.mapVisible && print.ownerRestored.treeVisible, print.ownerRestored);
    // The auditor restore is measured from a fresh attention view: the audit-only files must go away again.
    await reloadClean(p);
    await ev(() => { window.print = () => {}; }); // the reload dropped the stub; native print would fire its own beforeprint
    const beforeAudit = await ev(() => document.querySelectorAll(".file-lazy .file").length);
    await tab(p, "materials");
    await p.click("#print-audit");
    await ev(() => window.dispatchEvent(new Event("beforeprint"))); await p.waitForTimeout(900);
    print.auditor = await ev(() => ({
      inserted: document.querySelectorAll(".file-lazy .file").length,
      uniqueBlocks: new Set([...document.querySelectorAll("#map .seg[data-block]")].map(s => s.dataset.block)).size,
      segs: document.querySelectorAll("#map .seg[data-block]").length,
      segcodeOpen: document.querySelectorAll("#map .segcode[open]").length,
      mapVisible: getComputedStyle(document.getElementById("map")).display !== "none"
    }));
    check("65507: auditor print opens all 1470 blocks / 1517 fragments", print.auditor.uniqueBlocks === 1470 && print.auditor.segs === 1517 && print.auditor.segcodeOpen === 1517 && print.auditor.mapVisible, print.auditor);
    await ev(() => window.dispatchEvent(new Event("afterprint"))); await p.waitForTimeout(350);
    print.restored = await ev(() => ({ inserted: document.querySelectorAll(".file-lazy .file").length, show: document.getElementById("map").dataset.show }));
    check("65507: auditor afterprint removes the audit-only files", print.restored.inserted === beforeAudit && beforeAudit < 96, { ...print.restored, beforeAudit });
    print.pdf = { attempted: false };
    if (pdfjs) {
      try {
        await tab(p, "materials");
        await p.click("#print-owner"); await p.waitForTimeout(300);
        const ownerPdf = path.join(OUT, `v5-${USED}-owner.pdf`);
        await p.emulateMedia({ media: "print" });
        await p.pdf({ path: ownerPdf, format: "A4", printBackground: true });
        await p.emulateMedia({ media: "screen" }); await p.waitForTimeout(300);
        const ownerText = await pdfText(ownerPdf);
        // The map PANEL does not print; the decisions' «Где в коде» excerpts do (by design), so B addresses
        // may appear in the owner PDF — the map's own audit note is the marker that must be absent.
        print.pdf.owner = { bytes: fs.statSync(ownerPdf).size, screens: hasWord(ownerText, big.screenName), limits: hasWord(ownerText, big.limit), mapPanelClosed: !hasWord(ownerText, "полный аудит сохраняет каждый блок"),
          decisions: hasWord(ownerText, "Нужен выбор владельца") && hasWord(ownerText, "Предложенные исправления"), exportBtnHidden: !hasWord(ownerText, "Выгрузить ответы") };
        check("PDF owner: screens and limits print, the map panel does not, decisions complete, controls hidden", print.pdf.owner.screens && print.pdf.owner.limits
          && print.pdf.owner.mapPanelClosed && print.pdf.owner.decisions && print.pdf.owner.exportBtnHidden, print.pdf.owner);
        await p.click("#print-audit"); await p.waitForTimeout(300);
        const auditorPdf = path.join(OUT, `v5-${USED}-auditor.pdf`);
        await p.emulateMedia({ media: "print" });
        await p.pdf({ path: auditorPdf, format: "A4", printBackground: true });
        await p.emulateMedia({ media: "screen" }); await p.waitForTimeout(300);
        const auditorText = await pdfText(auditorPdf);
        const missing = [];
        for (let n = 1; n <= 1470; n++) if (!hasB(auditorText, n)) missing.push(n);
        print.pdf.auditor = { bytes: fs.statSync(auditorPdf).size, missing: missing.slice(0, 10), missingCount: missing.length };
        check("PDF auditor: all 1470 B addresses are in the PDF text", missing.length === 0, print.pdf.auditor);
        print.pdf.attempted = true; print.pdf.ok = true;
      } catch (e) { print.pdf = { attempted: true, ok: false, error: String(e).slice(0, 160) }; check("PDF part", false, print.pdf); }
    } else { print.pdf = { attempted: false, note: "pdfjs-dist not available (set PDFJS_DIST)" }; results.checks.push({ name: "PDF part", ok: true, detail: "skipped: pdfjs-dist not available" }); }
    results.print = print;

    // ---- no-JS at scale ----
    const nojsCtx = await launch(USED.toLowerCase() + "-nojs-big", { javaScriptEnabled: false });
    const nojs = await nojsCtx.newPage();
    await nojs.goto(big.url, { waitUntil: "load" });
    const noJs = await nojs.evaluate(() => ({
      panelsInMarkup: document.querySelectorAll(".panel").length,
      hiddenPanelsInMarkup: document.querySelectorAll(".panel[hidden]").length,
      qcardsReadable: document.querySelectorAll(".qcard").length,
      domNodes: document.querySelectorAll("*").length,
      fragments: document.querySelectorAll("#map [data-fragment]").length,
      blockCodeClosed: document.querySelectorAll("#map .segcode:not([open])").length,
      mapSegs: document.querySelectorAll("#map .seg[data-block]").length,
      mapUniqueBlocks: new Set([...document.querySelectorAll("#map .seg[data-block]")].map(s => s.dataset.block)).size,
      fileDetails: document.querySelectorAll("#map details.file-details").length,
      fileDetailsClosed: document.querySelectorAll("#map details.file-details:not([open])").length,
      treeOpenStatic: document.querySelectorAll(".fdir[open]").length,
      fieldsetsDisabled: [...document.querySelectorAll("fieldset.qopts")].every(f => f.disabled),
      radiosDisabled: [...document.querySelectorAll("[data-question-variant]")].every(r => r.matches(":disabled")),
      zonesDisabled: [...document.querySelectorAll("[data-zone]")].every(z => z.disabled),
      answerInputsDisabled: [...document.querySelectorAll("[data-answer]")].every(i => i.disabled),
      controlsDisabled: [...document.querySelectorAll("#hide-tree, button[data-purpose-filter], .fname, button[data-q-filter], button[data-req-filter], button[data-f-filter], #code-top, button[data-mview], #tree-expand-all, #tree-collapse-all, #tree-filter-clear, button[data-choice-filter], #export-open")].every(b => b.disabled),
      keepSegNotCssHidden: (() => { const s = document.querySelector("#map .seg.v-keep"); return s ? getComputedStyle(s).display !== "none" : null; })(),
      tabAnchors: [...document.querySelectorAll(".tabs [role=tab]")].every(t => t.getAttribute("href")?.startsWith("#panel-")),
      themeBtnHidden: document.getElementById("theme-toggle").offsetParent === null,
      exportBtnHidden: document.getElementById("export-open").offsetParent === null,
      subtabsHidden: document.querySelector(".choice-filters").offsetParent === null,
      commentsHidden: [...document.querySelectorAll(".card-comment")].every(d => d.offsetParent === null),
      structureTargetClosed: !document.querySelector(".structure-target").open,
      groupsReadable: [...document.querySelectorAll(".dgroup")].every(g => g.offsetParent !== null),
      counter: document.getElementById("count-decisions").textContent,
      counterTitle: document.getElementById("count-decisions").title
    }));
    results.noJs = noJs;
    check("65507 no-JS: the full map 1470/1517/96 in closed disclosures, the tree open, panels stacked", noJs.mapUniqueBlocks === 1470 && noJs.mapSegs === 1517
      && noJs.fragments === 1517 && noJs.blockCodeClosed === 1517 && noJs.domNodes < 102296
      && noJs.fileDetails === 96 && noJs.fileDetailsClosed === 96 && noJs.treeOpenStatic === 53 && noJs.panelsInMarkup === 5 && noJs.hiddenPanelsInMarkup === 0
      && noJs.keepSegNotCssHidden && noJs.tabAnchors && noJs.groupsReadable && noJs.structureTargetClosed, noJs);
    check("65507 no-JS: the counter is the static 11 with an honest title", noJs.counter === "11 осталось" && /статический/i.test(noJs.counterTitle) && /без JavaScript/i.test(noJs.counterTitle), { counter: noJs.counter, title: noJs.counterTitle });
    check("65507 no-JS: every control disabled, the chrome hidden", noJs.fieldsetsDisabled && noJs.radiosDisabled && noJs.zonesDisabled && noJs.answerInputsDisabled
      && noJs.controlsDisabled && noJs.themeBtnHidden && noJs.exportBtnHidden && noJs.subtabsHidden && noJs.commentsHidden, noJs);
    await nojs.evaluate(() => document.getElementById("map").scrollIntoView());
    await nojs.click("#map details.file-details summary"); await nojs.waitForTimeout(300);
    const firstFileOpen = await nojs.evaluate(() => { const d = document.querySelector("#map details.file-details"); return { open: d.open, codeLinesVisible: [...d.querySelectorAll(".l")].filter(l => l.offsetParent !== null).length }; });
    check("65507 no-JS: a file opens natively and its code reads", firstFileOpen.open && firstFileOpen.codeLinesVisible > 0, firstFileOpen);
    await nojs.click('#q2 input[value="keep"]', { force: true });
    const radioClickIgnored = await nojs.evaluate(() => !document.querySelector('#q2 input[value="keep"]').checked);
    check("65507 no-JS: a forced radio click changes nothing", radioClickIgnored);
    await nojs.screenshot({ path: path.join(OUT, `v5-${USED}-nojs.png`) });
    await nojsCtx.close();

    // ---- the automated functional scenario (NOT the owner DoD without hints) ----
    await p.evaluate(() => localStorage.clear()); await reloadClean(p);
    await tab(p, "decisions");
    const dod = { note: "автоматизированный функциональный сценарий; DoD владельца без подсказок — отдельный пользовательский тест, автоматизацией не подменяется" };
    await p.check('#q2 input[value="keep"]'); await p.waitForTimeout(150);
    await ev(() => { document.querySelector('[data-qchildren="2"]').open = true; });
    await p.check('#q9 input[value="keep"]'); await p.waitForTimeout(150);
    await p.click('#f1 .decide button[value="apply"]'); await p.waitForTimeout(150);
    await ev(() => { document.getElementById("ideas").open = true; });
    await p.click('#i2 .decide button[value="skip"]'); await p.waitForTimeout(150);
    dod.oneTab = await ev(() => ({
      tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab,
      q2: document.querySelector("#q2 [data-qstatus]").textContent,
      f1: document.querySelector("#f1 [data-fstatus]").textContent,
      i2: document.querySelector("#i2 [data-fstatus]").textContent,
      counter: document.getElementById("count-decisions").textContent
    }));
    check("scenario: Q, F and an idea decided in ONE tab", dod.oneTab.tab === "decisions" && /^Выбрано:/.test(dod.oneTab.q2)
      && dod.oneTab.f1 === "Выбрано: Исправить" && dod.oneTab.i2 === "Выбрано: Не брать", dod.oneTab);
    await tab(p, "code");
    await ev(() => { const d = document.querySelector("#map .segmeta"); d.open = true; d.scrollIntoView({ block: "center" }); });
    await p.fill("#map .segmeta input[data-note]", "итоговый комментарий в коде"); await p.waitForTimeout(250);
    await p.click("#export-open"); await p.waitForTimeout(250);
    dod.exportFromCode = await ev(() => ({
      dialogOpen: document.getElementById("export-dialog").open,
      hasCodeNote: document.getElementById("export-preview").textContent.includes("итоговый комментарий в коде"),
      hasQ2: document.getElementById("export-preview").textContent.includes("Q2 · Выбрано"),
      hasF1: document.getElementById("export-preview").textContent.includes("F1 · Исправить"),
      tabStillCode: document.querySelector('.tabs [aria-selected="true"]').dataset.tab
    }));
    check("scenario: the export from the code tab gathers everything without leaving it", dod.exportFromCode.dialogOpen && dod.exportFromCode.hasCodeNote
      && dod.exportFromCode.hasQ2 && dod.exportFromCode.hasF1 && dod.exportFromCode.tabStillCode, dod.exportFromCode);
    const [dodDl] = await Promise.all([p.waitForEvent("download"), p.click("#export-json-top")]);
    const dodJson = JSON.parse(fs.readFileSync(await dodDl.path(), "utf8"));
    dod.json = { schema: dodJson.schema_version, q2: dodJson.questions.find(q => q.question === 2)?.status, f1: dodJson.findings["1"], i2: dodJson.findings.i2, applyWithoutVariant: dodJson.applyWithoutVariant };
    check("scenario: the JSON carries the decisions, schema 4", dodJson.schema_version === 4 && dodJson.applyWithoutVariant.length === 0
      && dod.json.q2 === "accepted" && dod.json.f1 === "apply" && dod.json.i2 === "skip", dod.json);
    await p.locator("#export-dialog form button").click();
    await p.click('[data-purpose-filter="tests"]'); await p.waitForTimeout(250);
    await p.fill("#tree-filter-input", "ResponsivePopover"); await p.waitForTimeout(250);
    await p.focus("#tree-filter-input"); await p.keyboard.press("Enter"); await p.waitForTimeout(500);
    dod.treeFind = await ev(() => {
      const d = JSON.parse(document.getElementById("data").textContent);
      const rows = [...document.querySelectorAll(".frow")].filter(r => r.style.display !== "none");
      const revealed = document.querySelector(".file.reveal");
      return { hiddenTests: JSON.parse(localStorage.getItem("review-report:" + d.key)).hiddenPurposes, found: rows.some(r => d.files[+r.dataset.frow].includes("ResponsivePopover")), segsVisible: revealed ? [...revealed.querySelectorAll(".seg")].filter(s => getComputedStyle(s).display !== "none").length : 0 };
    });
    check("scenario: hiding tests and finding a file through the tree", dod.treeFind.found && dod.treeFind.segsVisible > 0 && dod.treeFind.hiddenTests.join() === "tests", dod.treeFind);
    await reloadClean(p);
    dod.afterReload = await ev(() => ({
      q2: document.querySelector("#q2 [data-qstatus]").textContent,
      f1: document.querySelector("#f1 [data-fstatus]").textContent,
      i2: document.querySelector("#i2 [data-fstatus]").textContent,
      hiddenTests: JSON.parse(localStorage.getItem("review-report:" + JSON.parse(document.getElementById("data").textContent).key)).hiddenPurposes
    }));
    check("scenario: reload keeps the decisions and the hiding", /^Выбрано:/.test(dod.afterReload.q2) && dod.afterReload.f1 === "Выбрано: Исправить"
      && dod.afterReload.i2 === "Выбрано: Не брать" && dod.afterReload.hiddenTests.join() === "tests", dod.afterReload);
    await p.click("#export-open"); await p.waitForTimeout(200);
    const [dodDl2] = await Promise.all([p.waitForEvent("download"), p.click("#export-json-top")]);
    const dodJson2 = JSON.parse(fs.readFileSync(await dodDl2.path(), "utf8"));
    dod.exportStable = JSON.stringify(dodJson.questions) === JSON.stringify(dodJson2.questions) && JSON.stringify(dodJson.findings) === JSON.stringify(dodJson2.findings) && JSON.stringify(dodJson.notes) === JSON.stringify(dodJson2.notes);
    check("scenario: the export is stable across reload", dod.exportStable);
    await p.locator("#export-dialog form button").click();
    results.dod = dod;

    // ---- the first screen, mobile 44, preview completeness, focus, fact answer, idea shell, block comment ----
    await p.evaluate(() => localStorage.clear()); await reloadClean(p);
    await tab(p, "decisions"); await ev(() => window.scrollTo(0, 0)); await p.waitForTimeout(250);
    const firstScreen = await ev(() => {
      const o = document.querySelector("#q1 .qopt"), r = o.getBoundingClientRect();
      return { firstOptionTop: Math.round(r.top), viewportH: innerHeight, limitOnSurface: !!document.querySelector(".decision-intro .card-limit") && !document.querySelector(".decision-intro .card-limit").closest("details") };
    });
    check("65507: the first Q1 option is within the first screen; the limits stay on the surface", firstScreen.firstOptionTop < firstScreen.viewportH && firstScreen.limitOnSurface, firstScreen);
    await p.screenshot({ path: path.join(OUT, `v5-${USED}-groups-subtabs.png`) });
    await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(300);
    const mobile44 = () => ev(() => {
      const sels = ["[data-choice-filter]", "#export-open", "#q1 .qopt", "#f1 .decide button", "#q1 [data-defer]", "#q1 [data-qreset]", ".tabs [role=tab]"];
      const out = [];
      for (const s of sels) for (const el of document.querySelectorAll(s)) {
        if (el.offsetParent === null || el.closest("[hidden]")) continue;
        const r = el.getBoundingClientRect(); if (!r.height) continue;
        out.push({ sel: s, h: +r.height.toFixed(1) });
      }
      return out;
    });
    const m44 = { decisions: await mobile44() };
    await p.click("#export-open"); await p.waitForTimeout(250);
    m44.dialog = await ev(() => [...document.querySelectorAll("#export-dialog button")].filter(b => b.offsetParent !== null).map(b => ({ sel: "#export-dialog button", h: +b.getBoundingClientRect().height.toFixed(1) })));
    await p.locator("#export-dialog form button").click(); await p.waitForTimeout(200);
    await tab(p, "code");
    m44.code = await ev(() => [...document.querySelectorAll(".purpose-bar button, .fname, .map-filters button")].filter(b => b.offsetParent !== null).slice(0, 40).map(b => ({ sel: "code controls", h: +b.getBoundingClientRect().height.toFixed(1) })));
    const all44 = [...m44.decisions, ...m44.dialog, ...m44.code];
    check("65507: mobile targets >= 44px (subtabs, export, choice, options, tabs, code controls)", all44.length > 10 && all44.every(x => x.h >= 44), all44.filter(x => x.h < 44));
    results.mobile44 = m44;
    await p.setViewportSize({ width: 1366, height: 900 }); await p.waitForTimeout(250);
    // Preview completeness: F «Не исправлять», I «Не брать», Q deferred WITHOUT a variant (with a reason).
    await p.evaluate(() => localStorage.clear()); await reloadClean(p); await tab(p, "decisions");
    await p.click('#f1 .decide button[value="skip"]'); await p.waitForTimeout(150);
    await ev(() => { document.getElementById("ideas").open = true; });
    await p.click('#i2 .decide button[value="skip"]'); await p.waitForTimeout(150);
    for (const q of [2, 6]) {
      await ev((n) => { document.querySelector(`#q${n} .card-comment`).open = true; }, q);
      await p.fill(`#qnote-q${q}`, "отложено без варианта: ждём данных"); await p.waitForTimeout(200);
      await p.click(`#q${q} [data-defer]`); await p.waitForTimeout(150);
    }
    const previewFull = { perTab: {} };
    for (const id of initial.tabs) {
      await tab(p, id);
      await p.click("#export-open"); await p.waitForTimeout(200);
      const cap = await capturePreview();
      const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#export-json-top")]);
      const j = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
      const parity = checkParity(j, cap, "preview-full tab " + id);
      const prevText = cap.sections.map(s => s.rows.map(r => r.text).join("\n")).join("\n");
      const gotos = cap.sections.flatMap(s => s.rows.map(r => r.goto)).filter(Boolean);
      const checks = {
        f1Skip: prevText.includes("F1 · Не исправлять"), i2Skip: prevText.includes("I2 · Не брать"),
        q2DeferredNoVariant: prevText.includes("Q2 · отложено") && !prevText.includes("Q2 · отложено · черновик"),
        q6DeferredNoVariant: prevText.includes("Q6 · отложено") && !prevText.includes("Q6 · отложено · черновик"),
        gotoAll: ["#f1", "#i2", "#q2", "#q6"].every(h => gotos.includes(h))
      };
      previewFull.perTab[id] = { parity, checks };
      check(`65507: preview completeness from ${id} — skip decisions, deferred without a variant, Go links`, parity.ok && Object.values(checks).every(Boolean), { parity, checks });
      await p.locator("#export-dialog form button").click(); await p.waitForTimeout(120);
    }
    await p.click("#export-open"); await p.waitForTimeout(200);
    await p.click('#export-preview a[href="#q6"]'); await p.waitForTimeout(600);
    const previewGoto = await ev(() => ({ dialogOpen: document.getElementById("export-dialog").open, tab: document.querySelector('.tabs [aria-selected="true"]').dataset.tab, q6Visible: document.getElementById("q6").offsetParent !== null, chip: document.querySelector("#q6 [data-qstatus]").textContent }));
    check("65507: «Перейти» to a variant-less deferred Q lands on its card", !previewGoto.dialogOpen && previewGoto.q6Visible && previewGoto.chip === "отложено", previewGoto);
    results.previewFull = previewFull;
    // Focus: keyboard selection lands on the settled summary (not BODY); reset returns focus into the card; touch the same.
    await p.evaluate(() => localStorage.clear()); await reloadClean(p); await tab(p, "decisions");
    await ev(() => { document.querySelector("#q1 input[data-question-variant]").focus(); });
    await p.keyboard.press("Space"); await p.waitForTimeout(300);
    const focusAfterSelect = await ev(() => ({
      active: document.activeElement.tagName,
      isSettledSummary: !!document.activeElement.closest && !!document.activeElement.closest("#group-settled details.settled-row") && document.activeElement.tagName === "SUMMARY",
      groupOpen: document.getElementById("group-settled").open,
      summaryVisible: document.activeElement.offsetParent !== null,
      chosenVisible: document.activeElement.textContent.includes("Выбрано")
    }));
    check("65507: keyboard selection lands focus on the settled row summary with «Выбрано», not BODY", focusAfterSelect.active === "SUMMARY"
      && focusAfterSelect.isSettledSummary && focusAfterSelect.groupOpen && focusAfterSelect.summaryVisible && focusAfterSelect.chosenVisible, focusAfterSelect);
    await p.keyboard.press("Enter"); await p.waitForTimeout(200);
    await ev(() => { document.querySelector("#q1 [data-qreset]").focus(); });
    await p.keyboard.press("Enter"); await p.waitForTimeout(300);
    const keyboardReset = await ev(() => ({ active: document.activeElement.tagName, inQ1: !!document.activeElement.closest && !!document.activeElement.closest('[data-unit="q1"]'), home: document.querySelector('[data-unit="q1"]').parentElement.closest(".dgroup").id, chip: document.querySelector("#q1 [data-qstatus]").textContent }));
    check("65507: keyboard reset returns the card home with focus inside it", keyboardReset.active !== "BODY" && keyboardReset.inQ1 && keyboardReset.home === "group-owner" && keyboardReset.chip === "ожидает", keyboardReset);
    await ev(() => { document.getElementById("q1").scrollIntoView({ block: "center" }); }); await p.waitForTimeout(250);
    const box = await ev(() => { const r = document.querySelector('#q1 input[value="keep-mockup"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await p.touchscreen.tap(box.x, box.y); await p.waitForTimeout(300);
    const touchSelect = await ev(() => ({ active: document.activeElement.tagName, chosenVisible: document.activeElement.textContent.includes("Выбрано"), state: JSON.parse(localStorage.getItem("review-report:" + JSON.parse(document.getElementById("data").textContent).key)).questions["1"] }));
    check("65507: a touch tap is the same unified choice, focus on the settled summary (rAF)", touchSelect.active === "SUMMARY" && touchSelect.chosenVisible && touchSelect.state.choice === "accepted", touchSelect);
    results.focus = { focusAfterSelect, keyboardReset, touchSelect };
    // The fact answer: discoverable without the comment, «ответ внесён» ≠ «проверено», export distinct.
    const factAnswer = await ev(() => { const i = document.querySelector("#q4 [data-answer]"); return { visible: i.offsetParent !== null, notInDetails: !i.closest("details"), commentClosed: !document.querySelector("#q4 .card-comment").open }; });
    check("65507: the fact answer is discoverable without opening the comment", factAnswer.visible && factAnswer.notInDetails && factAnswer.commentClosed, factAnswer);
    await p.fill("#q4 [data-answer]", "https://example.test/publicspeed-contract"); await p.waitForTimeout(300);
    factAnswer.chipAfter = await ev(() => ({ text: document.querySelector("#q4 [data-qstatus]").textContent, state: document.querySelector("#q4 [data-qstatus]").dataset.state }));
    check("65507: the answer reads «ответ внесён» (answered), never «проверено»", factAnswer.chipAfter.text === "ответ внесён" && factAnswer.chipAfter.state === "answered" && !factAnswer.chipAfter.text.includes("проверено"), factAnswer.chipAfter);
    await ev(() => { document.querySelector("#q4 .card-comment").open = true; });
    await p.fill("#qnote-q4", "обсуждение контракта, отдельный комментарий"); await p.waitForTimeout(250);
    await ev(() => { document.querySelector("#q4 .card-comment").open = false; }); await p.waitForTimeout(200);
    await p.click("#export-open"); await p.waitForTimeout(200);
    const capF3 = await capturePreview();
    const [dlF3] = await Promise.all([p.waitForEvent("download"), p.click("#export-json-top")]);
    const jF3 = JSON.parse(fs.readFileSync(await dlF3.path(), "utf8"));
    factAnswer.parity = checkParity(jF3, capF3, "fact answer");
    const f3prev = capF3.sections.map(s => s.title + "\n" + s.rows.map(r => r.text).join("\n")).join("\n");
    check("65507: the fact answer exports apart from the comment, parity holds", jF3.factAnswers.q4 === "https://example.test/publicspeed-contract"
      && jF3.notes.q4 === "обсуждение контракта, отдельный комментарий" && factAnswer.parity.ok
      && f3prev.includes("Ответы на факты") && f3prev.includes("Q4 · Ответ внесён: https://example.test/publicspeed-contract")
      && !f3prev.split("Комментарии")[0].includes("обсуждение контракта"), { parity: factAnswer.parity });
    await p.locator("#export-dialog form button").click(); await p.waitForTimeout(150);
    results.factAnswer = factAnswer;
    // The idea shell: the same order as Q/F, the limit slot present, no invented data.
    const ideaShell = await ev(() => {
      const order = (el) => [...el.children].map(c => (c.className.baseVal ?? c.className).split(" ")[0]);
      const i = order(document.getElementById("i1")), f = order(document.getElementById("f1"));
      const idx = (a, n) => a.indexOf(n);
      const consistent = (a) => idx(a, "card-head") < idx(a, "card-question") && idx(a, "card-question") < idx(a, "card-choice") && idx(a, "card-choice") < idx(a, "card-comment") && (idx(a, "card-more") === -1 || idx(a, "card-comment") < idx(a, "card-more"));
      const limit = document.querySelector("#i1 .card-limit");
      return { idea: i, finding: f, consistent: consistent(i) && consistent(f), limitOnSurface: !!limit && limit.parentElement === document.getElementById("i1"), limitText: limit?.textContent ?? null };
    });
    check("65507: the idea shell matches the finding shell without an invented limit", ideaShell.consistent && !ideaShell.limitOnSurface && ideaShell.limitText === null, ideaShell);
    // The saved BLOCK comment is compact; the export collects it immediately.
    await tab(p, "code");
    await ev(() => { const d = document.querySelector("#map .segmeta"); d.open = true; d.scrollIntoView({ block: "center" }); });
    await p.fill("#map .segmeta input[data-note]", "компактный комментарий блока"); await p.waitForTimeout(250);
    await p.click("#map .segmeta .segmeta-body p.sub"); await p.waitForTimeout(300);
    const blockComment = await ev(() => {
      const bc = document.querySelector("#map .segmeta .block-comment");
      const view = bc.querySelector(".comment-view"), input = bc.querySelector("input");
      return { viewVisible: view && !view.hidden && view.offsetParent !== null, text: view?.querySelector(".comment-text")?.textContent, editBtn: view?.querySelector(".comment-edit")?.textContent, saved: view?.querySelector(".comment-saved")?.textContent, inputHidden: input.hidden };
    });
    check("65507: the saved block comment is compact — text + «Изменить» + saved status", blockComment.viewVisible && blockComment.inputHidden
      && blockComment.text === "компактный комментарий блока" && blockComment.editBtn === "Изменить" && blockComment.saved === undefined, blockComment);
    await p.click("#map .segmeta .comment-edit"); await p.waitForTimeout(250);
    const blockCommentEdit = await ev(() => { const bc = document.querySelector("#map .segmeta .block-comment"); const input = bc.querySelector("input"); return { inputVisible: !input.hidden && input.offsetParent !== null, focused: document.activeElement === input, viewHidden: bc.querySelector(".comment-view").hidden }; });
    check("65507: «Изменить» on the block comment reveals and focuses the input", blockCommentEdit.inputVisible && blockCommentEdit.focused && blockCommentEdit.viewHidden, blockCommentEdit);
    await p.click("#export-open"); await p.waitForTimeout(200);
    const blockCommentExport = await ev(() => document.getElementById("export-preview").textContent.includes("компактный комментарий блока"));
    check("65507: the block comment is collected by the export immediately", blockCommentExport);
    await p.locator("#export-dialog form button").click(); await p.waitForTimeout(150);

    // ---- final invariants: ids, coverage, the record's bytes, determinism, growth ----
    const invariants = await ev(() => {
      const ids = [...document.querySelectorAll("[id]")].map(e => e.id);
      return { duplicateIds: [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))],
        uniqueBlocks: new Set([...document.querySelectorAll("#map .seg[data-block]")].map(s => s.dataset.block)).size,
        segsTotal: document.querySelectorAll("#map .seg[data-block]").length,
        domNow: document.querySelectorAll("*").length };
    });
    results.invariants = invariants;
    check("65507: zero duplicate ids at the end", invariants.duplicateIds.length === 0, invariants);
    results.recordShaAfter = createHash("sha256").update(fs.readFileSync(path.join(SOURCE, "review.json"))).digest("hex");
    check("65507: the immutable original is untouched", results.recordShaAfter === ORIGINAL_SHA, results.recordShaAfter);
    // Deterministic render: rebuild and compare bytes.
    const before = createHash("sha256").update(fs.readFileSync(big.html)).digest("hex");
    const again = spawnSync(process.execPath, [SCRIPT, "render", big.record], { cwd: path.dirname(big.record), encoding: "utf8" });
    const after = createHash("sha256").update(fs.readFileSync(big.html)).digest("hex");
    results.deterministicRender = { ok: again.status === 0 && before === after };
    check("65507: the render is byte-stable", results.deterministicRender.ok, { status: again.status });
    // Growth against the v4 baseline: render the same enriched record with the v4 scripts from git.
    try {
      const v4dir = path.join(OUT, "v4-baseline");
      fs.mkdirSync(path.join(v4dir, "scripts", "vendor"), { recursive: true });
      const gitRoot = path.join(HERE, "..", "..", "..");
      // The baseline is the commit just before the FIRST v5 commit in page.mjs's history — stable no
      // matter how many v5 fixes land afterwards, and honest (skipped) if a squash erased the series.
      const history = spawnSync("git", ["log", "--format=%H%x09%s", "--", "plugins/entrust/plugin/skills/review/scripts/page.mjs"], { cwd: gitRoot, encoding: "utf8" }).stdout.trim().split("\n");
      const entries = history.map(l => l.split("\t"));
      const firstV5 = entries.map(([, subject]) => /\bv5\b/i.test(subject)).lastIndexOf(true);
      const v4ref = firstV5 >= 0 ? entries[firstV5 + 1]?.[0] : undefined;
      if (!v4ref) throw new Error("no pre-v5 page.mjs commit found");
      for (const f of ["page.mjs", "review.mjs", "labels.mjs", "decisions.mjs", "report.mjs", "diff.mjs", "diagram.mjs", "highlight.mjs", "annotations.mjs", "text.mjs", "vendor/shiki.mjs"]) {
        const content = spawnSync("git", ["show", `${v4ref}:plugins/entrust/plugin/skills/review/scripts/${f}`], { cwd: gitRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
        if (content.status !== 0) throw new Error(`git show ${f}: ${content.stderr}`);
        fs.writeFileSync(path.join(v4dir, "scripts", f), content.stdout);
      }
      fs.copyFileSync(big.record, path.join(v4dir, "review.json"));
      fs.copyFileSync(path.join(path.dirname(big.record), "review.diff"), path.join(v4dir, "review.diff"));
      const v4render = spawnSync(process.execPath, [path.join(v4dir, "scripts", "report.mjs"), "render", path.join(v4dir, "review.json")], { cwd: v4dir, encoding: "utf8" });
      if (v4render.status !== 0) throw new Error(v4render.stderr.slice(0, 200));
      const v4html = fs.statSync(path.join(v4dir, "review.html")).size;
      const v4page = fs.statSync(path.join(v4dir, "scripts", "page.mjs")).size;
      const v5page = fs.statSync(path.join(HERE, "..", "plugin", "skills", "review", "scripts", "page.mjs")).size;
      results.growth = { html: +(100 * (big.bytes / v4html - 1)).toFixed(2), page: +(100 * (v5page / v4page - 1)).toFixed(2), v4html, v5html: big.bytes, v4page, v5page, v4ref };
      check("growth: the HTML stays within 5% of the v4 baseline", results.growth.html < 5, results.growth);
      check("growth: page.mjs stays under the 175KB budget", v5page < 175 * 1024, results.growth);
    } catch (e) { results.growth = { error: String(e).slice(0, 200) }; results.checks.push({ name: "growth baseline", ok: true, detail: "v4 baseline unavailable: " + String(e).slice(0, 120) }); }
  } catch (e) {
    check("65507 matrix completed without an exception", false, String(e).slice(0, 400));
  }
  results.big = { htmlBytes: big.bytes, domNodes: results.initial?.domNodes };
} else results.checks.push({ name: "65507 part", ok: true, detail: "skipped: the record is not on this machine" });
check("no page or console errors anywhere", errors.length === 0, errors.slice(0, 5));
await ctx.close();
fs.writeFileSync(path.join(OUT, `browser-validation-v5-${USED.toLowerCase()}.json`), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ browser: USED, checks: results.checks.length, failures: results.failures, initial: results.initial && { dom: results.initial.domNodes, counter: results.initial.counter },
  coverage: results.fullMap, reveal: results.fileReveal && { cases: results.fileReveal.cases, failures: results.fileReveal.failures.length },
  scrollspy: results.tree?.scrollspy, print: results.print && { ownerNested: results.print.owner?.nestedCount, auditor: results.print.auditor, pdf: results.print.pdf },
  growth: results.growth, recordSha: results.recordShaAfter, zoomNative: results.zoomNative, dodNote: results.dod?.note, errors: errors.slice(0, 5) }, null, 2));
process.exit(results.failures.length ? 1 : 0);
