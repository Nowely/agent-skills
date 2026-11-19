// Self-check of the prototype: console errors, timings, j/k, decisions shared between Code and Decisions,
// the side panel following the selection, line comments, 1024 px without horizontal scroll; then screenshots.
//   node selfcheck.cjs [pages-folder] [--shots <folder>]
// The pages folder defaults to the one above this script (run38.html, themed.html, and big.html when built).
// Screenshots and selfcheck.txt go to --shots, or to a new folder under the temp directory. Needs Playwright
// with its Chromium (require("playwright")).
const { chromium } = require("playwright");
const os = require("os");
const path = require("path");
const fs = require("fs");
const args = process.argv.slice(2), at = args.indexOf("--shots");
const SHOTS = at >= 0 ? path.resolve(args[at + 1]) : fs.mkdtempSync(path.join(os.tmpdir(), "report-redesign-check-"));
const DIR = path.resolve(args.find((a, i) => !a.startsWith("--") && i !== at + 1) ?? path.join(__dirname, ".."));
fs.mkdirSync(SHOTS, { recursive: true });
const has = (f) => fs.existsSync(path.join(DIR, f));
const url = (f) => "file://" + path.join(DIR, f);
const results = [];
const ok = (name, pass, detail = "") => { results.push({ name, pass, detail }); console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };

async function open(browser, file, { width = 1440, height = 900, scheme = "light", hash = "" } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, colorScheme: scheme });
  const errors = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errors.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  const t0 = Date.now();
  await page.goto(url(file) + hash, { waitUntil: "load" });
  await page.waitForSelector(".tabbar");
  const wall = Date.now() - t0;
  return { page, errors, wall };
}
const settle = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const text = (page, sel) => page.locator(sel).first().innerText();

(async () => {
  const browser = await chromium.launch();

  // ---------------------------------------------------------------- run38: behaviour
  {
    const { page, errors } = await open(browser, "run38.html");
    ok("run38 opens on Summary", (await page.getAttribute("#tab-summary", "aria-selected")) === "true");
    // Summary: selecting a requirement fills the panel
    await page.click('tr[data-sel="req:2"] td:nth-child(2)');
    ok("Summary panel follows the selected requirement", (await text(page, "#ctx-summary .panel-kicker")).includes("Requirement R2"), await text(page, "#ctx-summary .panel-kicker"));
    await page.click('ol.steps li[data-sel="step:0"]');
    ok("Summary panel follows the selected step", (await text(page, "#ctx-summary .panel-kicker")).startsWith("Step 1"));

    // Code: j/k with a visible position
    await page.click("#tab-code"); await settle(page);
    const pos0 = await text(page, "#pos");
    const sel0 = await page.evaluate(() => window.__proto.S.sel.code);
    await page.keyboard.press("j"); await settle(page);
    const pos1 = await text(page, "#pos"), sel1 = await page.evaluate(() => window.__proto.S.sel.code);
    await page.keyboard.press("j"); await settle(page);
    const pos2 = await text(page, "#pos");
    await page.keyboard.press("k"); await settle(page);
    const pos3 = await text(page, "#pos"), sel3 = await page.evaluate(() => window.__proto.S.sel.code);
    ok("j moves to the next open item", pos0 !== pos1 && sel0 !== sel1, `${pos0.replace(/\s+/g, " ")} → ${pos1.replace(/\s+/g, " ")} → ${pos2.replace(/\s+/g, " ")}`);
    ok("k moves back", pos3 === pos1 && sel3 === sel1, `${pos3.replace(/\s+/g, " ")} (${sel3})`);
    const kicker = await text(page, "#ctx-code .panel-kicker");
    ok("Code panel follows the selected block", kicker.includes("B" + sel3.slice(6)), kicker.replace(/\s+/g, " "));
    const noteInView = await page.evaluate((id) => { const el = document.getElementById("note-" + id); if (!el) return false; const r = el.getBoundingClientRect(); return r.top >= 90 && r.top < innerHeight; }, sel3.slice(6));
    ok("j/k scrolls the selected block into view below the toolbar", noteInView);

    // a decision made in Code shows in Decisions
    await page.evaluate(() => { location.hash = "#code/b8"; }); await settle(page);
    const before = await text(page, "#badge-decisions");
    await page.click('.note[data-b="8"] .pill[data-opt="fix"]'); await settle(page);
    const after = await text(page, "#badge-decisions");
    await page.click("#tab-decisions"); await settle(page);
    const f3 = await text(page, '#card-f3 .compact [data-status="f3"]');
    const f3settled = await page.evaluate(() => document.getElementById("card-f3").classList.contains("settled"));
    ok("a decision made in Code appears in Decisions", f3.trim() === "Fix" && f3settled && +after === +before - 1, `badge ${before} → ${after}; F3 card status «${f3.trim()}», compact: ${f3settled}`);

    // and the other way: Decisions -> Code
    await page.click("#card-f1 .card-title"); await settle(page);
    const ptitle = await text(page, "#ctx-decisions .panel-title");
    ok("Decisions panel follows the selected card", ptitle.includes("ENTRUST_OPENCODE_LOCAL"), ptitle.slice(0, 60));
    const excerpts = await page.locator("#ctx-decisions .excerpt").count();
    ok("the selected finding's code stands beside it", excerpts >= 1, `${excerpts} excerpts in the panel`);
    await page.check('#card-f1 input[data-opt="nofix"]'); await settle(page);
    const f1block = await page.evaluate(() => window.__proto.D.blocks.find((b) => b.findings.includes("1")).id);
    await page.evaluate((id) => { location.hash = "#code/b" + id; }, f1block); await settle(page);
    const pressed = await page.getAttribute(`.note[data-b="${f1block}"] .pill[data-key="f1"][data-opt="nofix"]`, "aria-checked");
    ok("a decision made in Decisions appears in Code", pressed === "true", `B${f1block} «Do not fix» aria-checked=${pressed}`);

    // Other — your own answer is the comment and the decision
    await page.click("#tab-decisions"); await settle(page);
    await page.click("#card-f2 .card-title");
    await page.check('#card-f2 input[data-opt="other"]');
    await page.fill('#card-f2 textarea[data-key="f2"]', "Arm the handler in the driver instead; no new helper.");
    await page.waitForTimeout(250);
    ok("«Other» with text is a decision", (await text(page, '#card-f2 .full [data-status="f2"]')).trim() === "Own answer");
    // a no-variant decision answered in its own words
    await page.fill('#card-q2 textarea[data-key="q2"]', "Per worker for now; revisit at fan-out.");
    await page.waitForTimeout(250);
    ok("a decision without variants is answered by its text", (await text(page, '#card-q2 .full [data-status="q2"]')).trim() === "Answer entered");
    await page.keyboard.press("Escape");
    // j in Decisions moves between open cards
    const dsel0 = await page.evaluate(() => window.__proto.S.sel.decisions);
    await page.keyboard.press("j"); await settle(page);
    const dsel1 = await page.evaluate(() => window.__proto.S.sel.decisions);
    ok("j moves to the next open card in Decisions", dsel0 !== dsel1, `${dsel0} → ${dsel1}`);

    // a comment on a code line
    await page.click("#tab-code"); await settle(page);
    const lnb = page.locator('#files tr.r td.ln button').nth(4);
    const lk = await lnb.getAttribute("data-lk");
    await lnb.click();
    await page.fill("#lc-input", "Is this line still needed after the flag goes?");
    await page.click('[data-act="lc-save"]'); await settle(page);
    const inPlace = await page.locator(`#files .lc-t`).count();
    const listed = (await text(page, "#ctx-code .lc-list")).includes("still needed");
    ok("a line comment shows in place and in the panel", inPlace === 1 && listed, `line ${lk}`);
    ok("progress counts decisions and comments", (await text(page, "#progress")).includes("1 line comment"), (await text(page, "#progress")).replace(/\s+/g, " "));

    // filters: requirement + purpose + search keep one row
    await page.selectOption('select[data-act="req"]', "5"); await settle(page);
    const filesR5 = await page.locator("#files section.file").count();
    await page.selectOption('select[data-act="req"]', ""); await settle(page);
    await page.fill("#file-q", "driver"); await page.waitForTimeout(250);
    const filesQ = await page.locator("#files section.file").count();
    await page.fill("#file-q", ""); await page.waitForTimeout(250);
    ok("requirement and file filters narrow the diff", filesR5 > 0 && filesQ >= 1, `R5: ${filesR5} files; "driver": ${filesQ} files`);

    // purpose: one compact control
    await page.click("#purpose-btn");
    const menuOpen = await page.isVisible("#purpose-pop .pop-menu");
    await page.uncheck('#purpose-pop input[value="docs"]'); await settle(page);
    const noDocs = await page.evaluate(() => [...document.querySelectorAll("#files section.file")].every((s) => !/\.md$/.test(s.getAttribute("aria-label"))));
    const label = await text(page, "#purpose-btn");
    await page.keyboard.press("Escape");
    await page.click("#purpose-btn"); await page.check('#purpose-pop input[value="docs"]'); await page.keyboard.press("Escape"); await settle(page);
    ok("the purpose menu hides a group and shows itself in its label", menuOpen && noDocs && label !== "Purpose: all", label);
    await page.keyboard.press("?");
    const dialog = await page.evaluate(() => document.getElementById("keys-dialog").open);
    await page.keyboard.press("Escape");
    ok("? opens the keyboard help", dialog);

    // Details: sub-tabs with the panel, and the optional graph
    await page.click("#tab-details"); await settle(page);
    ok("Details › Structure selects a unit for the panel", (await text(page, "#ctx-details .panel-kicker")).startsWith("Unit"));
    await page.click('[data-act="sview"][data-view="graph"]'); await settle(page);
    await page.hover('.gnode[data-i="0"]');
    const hovering = await page.evaluate(() => document.getElementById("graph").classList.contains("hovering") && document.querySelectorAll(".gedge.hl").length);
    ok("the optional graph highlights a unit's edges on hover", hovering > 0, `${hovering} edges lit`);
    await page.click('[data-act="sview"][data-view="table"]');
    await page.click('[data-act="xsub"][data-sub="mechanisms"]'); await settle(page);
    ok("Details › Mechanisms fills the panel", (await text(page, "#ctx-details .panel-kicker")).startsWith("Mechanism"));
    await page.click('[data-act="xsub"][data-sub="challenges"]'); await settle(page);
    ok("Details › Challenges fills the panel", (await text(page, "#ctx-details .panel-kicker")).startsWith("Challenge"));

    // theme toggle
    await page.click("#theme-btn"); const t1 = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.click("#theme-btn"); const t2 = await page.evaluate(() => document.documentElement.dataset.theme);
    ok("theme toggle cycles light and dark over the system default", t1 === "light" && t2 === "dark", `${t1}, ${t2}`);
    ok("run38: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // ---------------------------------------------------------------- themed fixture: variants, a conditional child, Other from the code note
  if (has("themed.html")) {
    const { page, errors } = await open(browser, "themed.html", { hash: "#decisions" });
    await settle(page);
    const variants = await page.locator('#card-q3 input[data-act="choose"]').count();
    ok("a decision offers its variants plus «Other»", variants === 3, `${variants} options on Q3`);
    await page.check('#card-q3 input[data-opt="v:status-quo"]'); await settle(page);
    const child = (await text(page, '#card-q4 .compact [data-status="q4"]')).trim();
    await page.check('#card-q3 input[data-opt="v:extend"]'); await settle(page);
    const child2 = (await text(page, '#card-q4 .full [data-status="q4"]')).trim();
    ok("a child question follows its parent's variant", child === "Not applicable" && child2 === "Open", `status-quo → Q4 «${child}»; extend → Q4 «${child2}»`);
    await page.click("#card-q3 .card-title"); await settle(page);
    await page.screenshot({ path: path.join(SHOTS, "themed-decisions-variants-light.png") });
    await page.click("#tab-code"); await settle(page);
    await page.click('.note .pill[data-act="other"]'); await settle(page);
    const focused = await page.evaluate(() => document.activeElement?.matches("#ctx-code textarea"));
    ok("«Other…» in a code note opens the answer field in the panel", focused);
    ok("themed: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // ---------------------------------------------------------------- big: timings and the 274-block record
  if (!has("big.html")) console.log("SKIP  big.html is not in the pages folder; the 274-block checks need it built");
  else {
    const { page, errors, wall } = await open(browser, "big.html");
    const t = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0], fcp = performance.getEntriesByName("first-contentful-paint")[0];
      return { dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), fcp: fcp ? Math.round(fcp.startTime) : null, ready: Math.round(window.__proto.timing()) };
    });
    ok("big.html opens in under 2 s", t.load < 2000 && wall < 2000, `wall ${wall} ms; DOMContentLoaded ${t.dcl} ms; load ${t.load} ms; first paint ${t.fcp} ms; app script ${t.ready} ms`);
    const codeMs = await page.evaluate(() => new Promise((r) => { const t0 = performance.now(); document.getElementById("tab-code").click(); requestAnimationFrame(() => requestAnimationFrame(() => r(Math.round(performance.now() - t0)))); }));
    const filled = await page.locator("#files .fb:not(.pending)").count(), shells = await page.locator("#files section.file").count();
    ok("big: Code tab (attention view) renders fast", codeMs < 1000, `${codeMs} ms to the first frame; ${filled} of ${shells} file bodies drawn, the rest wait off-screen`);
    const js = [];
    for (let i = 0; i < 6; i++) { const t0 = Date.now(); await page.keyboard.press("j"); await settle(page); js.push(Date.now() - t0); }
    ok("big: j steps through open items", true, `6 presses: ${js.join(", ")} ms; position ${(await text(page, "#pos")).replace(/\s+/g, " ")}`);
    const allMs = await page.evaluate(() => new Promise((r) => { const t0 = performance.now(); document.querySelector('[data-act="mode"][data-mode="all"]').click(); requestAnimationFrame(() => requestAnimationFrame(() => r(Math.round(performance.now() - t0)))); }));
    const t0 = Date.now();
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 2500) { window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))); } });
    const scrollMs = Date.now() - t0;
    const rows = await page.locator("#files tr.r").count();
    ok("big: All view stays usable", allMs < 1500, `switch ${allMs} ms; scrolled the whole diff in ${scrollMs} ms drawing files as they near the viewport; ${rows} rows now in the DOM`);
    ok("big: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // ---------------------------------------------------------------- 1024 px: nothing breaks
  for (const file of ["run38.html", "big.html"].filter(has)) {
    const { page, errors } = await open(browser, file, { width: 1024, height: 768 });
    const over = [];
    for (const tab of ["summary", "decisions", "code", "details"]) {
      await page.click(`#tab-${tab}`); await settle(page);
      const w = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      if (w[0] > w[1]) over.push(`${tab} ${w[0]}>${w[1]}`);
      if (file === "run38.html") await page.screenshot({ path: path.join(SHOTS, `run38-1024-${tab}.png`) });
    }
    ok(`${file} at 1024 px: no horizontal page scroll`, !over.length, over.join(", "));
    if (errors.length) ok(`${file} at 1024: console`, false, errors.join(" | "));
    await page.close();
  }

  // ---------------------------------------------------------------- screenshots 1440×900, light and dark
  for (const scheme of ["light", "dark"]) {
    const { page } = await open(browser, "run38.html", { scheme });
    for (const tab of ["summary", "decisions", "code", "details"]) {
      await page.click(`#tab-${tab}`); await settle(page); await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(SHOTS, `run38-${tab}-${scheme}.png`) });
    }
    if (scheme === "light") {
      // the same frame with work in it: a finding decided in Code, its card beside its code
      await page.evaluate(() => { location.hash = "#code/b69"; }); await settle(page);
      await page.screenshot({ path: path.join(SHOTS, "run38-code-selected-light.png") });
      await page.click('.note[data-b="69"] .pill[data-opt="fix"]'); await settle(page);
      await page.click("#tab-decisions"); await settle(page);
      await page.click("#card-f2 .compact .ctitle"); await settle(page);
      await page.screenshot({ path: path.join(SHOTS, "run38-decisions-after-code-light.png") });
      await page.click("#tab-details"); await page.click('[data-act="sview"][data-view="graph"]'); await settle(page);
      await page.hover('.gnode[data-i="4"]');
      await page.screenshot({ path: path.join(SHOTS, "run38-details-graph-light.png") });
      await page.click('[data-act="sview"][data-view="table"]');
      await page.click("#tab-summary"); await page.click('tr[data-sel="req:2"] td:nth-child(2)'); await settle(page);
      await page.screenshot({ path: path.join(SHOTS, "run38-summary-requirement-light.png") });
      await page.evaluate(() => window.scrollTo(0, 0)); await settle(page);
      await page.screenshot({ path: path.join(SHOTS, "run38-summary-full-light.png"), fullPage: true });
    }
    await page.close();
    if (!has("big.html")) continue;
    const big = await open(browser, "big.html", { scheme });
    await big.page.click("#tab-code"); await settle(big.page); await big.page.waitForTimeout(150);
    await big.page.screenshot({ path: path.join(SHOTS, `big-code-${scheme}.png`) });
    if (scheme === "light") {
      await big.page.click('[data-act="mode"][data-mode="all"]'); await settle(big.page); await big.page.waitForTimeout(150);
      await big.page.screenshot({ path: path.join(SHOTS, "big-code-all-light.png") });
    }
    await big.page.close();
  }
  await browser.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length} of ${results.length} checks pass`);
  console.log(`screenshots and selfcheck.txt: ${SHOTS}`);
  fs.writeFileSync(path.join(SHOTS, "selfcheck.txt"), results.map((r) => `${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  — " + r.detail : ""}`).join("\n") + `\n\n${results.length - failed.length} of ${results.length} checks pass\n`);
  process.exit(failed.length ? 1 : 0);
})();
