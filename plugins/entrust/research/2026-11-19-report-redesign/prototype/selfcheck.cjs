// Self-check of the prototype (v2): every behaviour the critic and the owner asked for that a script can see.
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
const settle = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const wait = (page, ms = 350) => page.waitForTimeout(ms);
const text = async (page, sel) => (await page.locator(sel).first().innerText()).replace(/\s+/g, " ").trim();
const S = (page, expr, arg) => page.evaluate(expr, arg);
async function open(browser, file, { width = 1440, height = 900, scheme = "light", hash = "", context } = {}) {
  const ctx = context ?? await browser.newContext({ viewport: { width, height }, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errors.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  const t0 = Date.now();
  await page.goto(url(file) + hash, { waitUntil: "load" });
  await page.waitForSelector(".tabbar");
  return { page, errors, wall: Date.now() - t0, ctx };
}
// the critic's contrast scan: visible text against its composited background, WCAG AA
const scan = () => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = (el) => { const stack = []; let e = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } e = e.parentElement; } let bg = { r: 255, g: 255, b: 255, a: 1 }; if (!e) { const h = parse(getComputedStyle(document.documentElement).backgroundColor); if (h && h.a) bg = h; } for (let i = stack.length - 1; i >= 0; i--) bg = blend(stack[i], bg); return bg; };
  const out = new Map();
  for (const el of document.querySelectorAll("body *")) {
    if (!el.getClientRects().length) continue;
    const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight * 3) continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el); if (cs.visibility === "hidden" || +cs.opacity === 0) continue;
    let fg = parse(cs.color), op = 1, e = el; while (e) { op *= +getComputedStyle(e).opacity; e = e.parentElement; }
    if (op < 0.99) continue; // a deliberately dimmed graph node while another is hovered
    const bg = bgOf(el); fg = blend({ ...fg, a: fg.a * op }, bg);
    const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700, need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    if (ratio < need) { const key = `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")} ${ratio.toFixed(2)}`; out.set(key, (out.get(key) ?? 0) + 1); }
  }
  return [...out.keys()];
};

const ONLY_V3 = args.includes("--only=v3");
const tab = async (page, id) => { await page.click("#tab-" + id); await settle(page); await wait(page, 150); };
const ctrlEnter = process.platform === "darwin" ? "Meta+Enter" : "Control+Enter";

// v3: four defects of v2 that recorded an answer the owner did not give — each check fails on v2's code
async function v3Answers(browser) {
  // a1: keys act on the focused, visible note; out of view they only bring it into view; a keyed answer can be undone
  if (has("big.html")) {
    const { page } = await open(browser, "big.html");
    await tab(page, "code"); await page.keyboard.press("j"); await wait(page, 500);
    const first = await S(page, () => window.__proto.S.cur);
    let other = null;
    for (let i = 0; i < 40 && !other; i++) {
      await page.keyboard.press("Tab");
      other = await S(page, (k) => { const n = document.activeElement.closest(".note"); const item = document.activeElement.closest("[data-item]")?.dataset.item ?? n?.querySelector("[data-item]")?.dataset.item; return n && item && item !== k ? { note: n.id, item } : null; }, first.key);
    }
    await page.keyboard.press("1"); await wait(page, 300);
    const a = await S(page, (k) => ({ first: window.__proto.S.dec[k]?.choice ?? null, cur: window.__proto.S.cur?.key }), first.key);
    ok("a1: a key acts on the focused note's decision, not a hidden selection", other && a.first === null && a.cur === other.item, `selected ${first.key} on note-${first.bid}; Tab to ${other?.note} (${other?.item}); «1» → ${first.key} ${a.first ?? "unchanged"}, current ${a.cur}`);
    await page.close();
    const { page: p2 } = await open(browser, "big.html");
    await tab(p2, "code"); await p2.keyboard.press("j"); await wait(p2, 500);
    const cur = await S(p2, () => window.__proto.S.cur);
    await S(p2, () => { document.activeElement.blur(); window.scrollTo(0, 60000); }); await wait(p2, 400);
    await p2.keyboard.press("2"); await wait(p2, 900);
    const b = await S(p2, (c) => { const n = document.getElementById("note-" + c.bid), r = n?.getBoundingClientRect(); return { choice: window.__proto.S.dec[c.key]?.choice ?? null, inView: !!r && r.top >= 90 && r.top < innerHeight }; }, cur);
    ok("a1: a key on a note out of view only brings it into view", b.choice === null && b.inView, `${cur.key} after «2» 60,000 px away: ${b.choice ?? "unchanged"}; note in view ${b.inView}`);
    await p2.close();
  }
  {
    const { page } = await open(browser, "run38.html", { hash: "#code/b8" }); await wait(page, 700);
    await page.focus("#note-8"); await page.keyboard.press("f"); await wait(page, 300);
    const toastText = await S(page, () => document.getElementById("toast")?.innerText ?? "");
    const undo = page.locator('#toast [data-act="undo"]');
    if (await undo.count()) { await undo.click(); await wait(page, 300); }
    const after = await S(page, () => ({ choice: window.__proto.S.dec.f3?.choice ?? null, tag: document.querySelector('[data-status="f3"]')?.textContent }));
    ok("a1: every keyed answer shows a toast with Undo, and Undo restores", /Undo/.test(toastText) && after.choice === null && after.tag === "Open", `toast «${toastText.replace(/\s+/g, " ")}»; after Undo ${JSON.stringify(after)}`);
    await page.close();
  }
  // a2: arriving on a card focuses the card, never a text field; the next j is a key, not text
  {
    const { page } = await open(browser, "run38.html");
    await page.click("#start-btn"); await wait(page, 500);
    const arrive = await S(page, () => ({ sel: window.__proto.S.sel.decisions, focus: document.activeElement.className.split(" ")[0] + ":" + (document.activeElement.dataset.card ?? document.activeElement.dataset.act ?? "") }));
    await page.keyboard.press("j"); await wait(page, 300);
    const after = await S(page, () => ({ sel: window.__proto.S.sel.decisions, q2: window.__proto.S.dec.q2?.text ?? "", focus: document.activeElement.tagName }));
    ok("a2: Start review, then j moves on and types nothing", after.q2 === "" && after.sel !== arrive.sel && after.focus !== "TEXTAREA", `arrive ${JSON.stringify(arrive)} → after j ${JSON.stringify(after)}`);
    await page.close();
  }
  // a3: one answer, never a desync: a variant clicked while the own-answer field has focus wins
  if (has("themed.html")) {
    const { page } = await open(browser, "themed.html", { hash: "#decisions/q3", width: 1280, height: 800 }); await wait(page, 400);
    const opt = (i) => page.locator("#card-q3 .full label.opt").nth(i);
    await opt(2).click(); await wait(page, 150); await page.keyboard.type("Integer minor units only."); await wait(page, 300);
    await opt(0).click(); await wait(page, 400);
    const r = await S(page, () => ({ checked: [...document.querySelectorAll("#card-q3 .full input[type=radio]")].map((i) => i.checked), state: { c: window.__proto.S.dec.q3?.choice, t: window.__proto.S.dec.q3?.text }, field: !!document.querySelector("#card-q3 .opt-field textarea") }));
    ok("a3: a variant clicked from the own-answer field wins, with no desync", r.state.c === "v:status-quo" && r.state.t === "" && r.checked[0] && !r.checked[2] && !r.field, JSON.stringify(r));
    await page.close();
  }
  if (has("big.html")) {
    const { page } = await open(browser, "big.html");
    await tab(page, "code"); await page.keyboard.press("j"); await wait(page, 500);
    const cur = await S(page, () => window.__proto.S.cur);
    await page.locator(`#note-${cur.bid} .pill[data-opt="other"]`).click(); await wait(page, 200);
    await page.keyboard.type("Test the full quote."); await wait(page, 300);
    await page.locator(`#note-${cur.bid} .pill[data-opt="fix"]`).click(); await wait(page, 400);
    const r = await S(page, (k) => ({ c: window.__proto.S.dec[k]?.choice, t: window.__proto.S.dec[k]?.text }), cur.key);
    ok("a3: «Fix it» after Other and text in the margin wins", r.c === "fix" && r.t === "", JSON.stringify(r));
    await page.close();
  }
  // a4: «c» on a line number opens an empty comment
  {
    const { page } = await open(browser, "run38.html", { hash: "#code/b7" }); await wait(page, 700);
    await page.locator('#files tr.r[data-b="7"] .lnb').first().focus(); await page.keyboard.press("c"); await wait(page, 200);
    const v = await S(page, () => document.getElementById("lc-input")?.value ?? null);
    ok("a4: «c» on a line number opens an empty comment field", v === "", JSON.stringify(v));
    await page.close();
  }
}

// v3: the coordinator's decisions and the partial items of the critic's re-check
async function v3More(browser) {
  {
    const { page, errors } = await open(browser, "run38.html");
    await page.keyboard.press("g"); await page.keyboard.press("d"); await settle(page);
    const t1 = await S(page, () => document.querySelector(".tab[aria-selected=true]").dataset.tab);
    await page.keyboard.press("g"); await page.keyboard.press("c"); await settle(page);
    const t2 = await S(page, () => document.querySelector(".tab[aria-selected=true]").dataset.tab);
    ok("g then d / c switches tabs (Alt+digits are gone)", t1 === "decisions" && t2 === "code", `${t1}, ${t2}`);
    // #17: Shift+K right after Shift+J moves back
    await page.evaluate(() => window.scrollTo(0, 0)); await settle(page);
    const topFile = async () => S(page, () => { const t = 48 + document.querySelector(".toolbar").offsetHeight + 8; return [...document.querySelectorAll("#files section.file")].find((s) => s.getBoundingClientRect().bottom > t)?.dataset.f; });
    await page.keyboard.press("Shift+J"); await wait(page, 500); await page.keyboard.press("Shift+J"); await wait(page, 500);
    const a = await topFile(); await page.keyboard.press("Shift+K"); await wait(page, 500); const b2 = await topFile();
    ok("Shift+K right after Shift+J moves to the previous file", a !== b2, `${a} → ${b2}`);
    // #5: following F1's place while a requirement filter hides it resets the filter and shows the line
    await page.selectOption('select[data-act="req"]', "5"); await wait(page, 300);
    await tab(page, "decisions"); await page.click("#card-f1 .card-title"); await settle(page);
    await page.click('#ctx-decisions [data-act="goline"]'); await wait(page, 900);
    const g = await S(page, () => { const tr = document.querySelector('#files tr.r[data-lk="23:+102"]'); const r = tr?.getBoundingClientRect(); return { req: window.__proto.S.code.req, drawn: !!tr, inView: !!r && r.top > 90 && r.bottom < innerHeight }; });
    ok("following a place a filter hides resets the filter and lands on the line", g.req === "" && g.drawn && g.inView, JSON.stringify(g));
    // the check's warnings in Details › Coverage, each with «Show in Code»
    await tab(page, "details"); await page.click('[data-act="xsub"][data-sub="coverage"]'); await settle(page);
    const w = await text(page, ".warnings");
    await page.click('[data-act="set-code"][data-set="assumed"]'); await wait(page, 700);
    const s = await S(page, () => ({ token: document.querySelector("#unit-token")?.textContent ?? "", sel: window.__proto.S.sel.code, set: window.__proto.S.code.set, mode: window.__proto.S.code.mode }));
    ok("Coverage shows the check's warning (30 kept blocks on assumed requirements) with «Show in Code»", /30 kept blocks serve only assumed requirements/.test(w) && s.set === "assumed" && /Kept, serving only assumed/.test(s.token) && s.sel, `${w.slice(0, 90)}… → ${JSON.stringify(s)}`);
    // «Show in Code» from Comments centres the line
    await page.click('[data-act="set-clear"]'); await wait(page, 300);
    await S(page, () => { location.hash = "#code/b7"; }); await wait(page, 700);
    await page.locator('#files tr.r[data-b="7"] .lnb').first().focus(); await page.keyboard.press("c"); await page.keyboard.type("Centre me."); await page.keyboard.press(ctrlEnter); await wait(page, 200);
    await tab(page, "decisions"); await page.click('[data-act="dsub"][data-sub="comments"]'); await settle(page);
    await page.click('#dec-list [data-act="goline"]'); await wait(page, 900);
    const cdelta = await S(page, () => { const tr = document.querySelector("#files tr.lnsel") ?? document.querySelector(`#files tr.r[data-lk="${Object.keys(window.__proto.S.lc)[0]}"]`); const r = tr.getBoundingClientRect(), top = 48 + document.querySelector(".toolbar").offsetHeight; return Math.round((r.top + r.bottom) / 2 - (innerHeight + top) / 2); });
    ok("«Show in Code» from Comments centres the line", Math.abs(cdelta) <= 40, `${cdelta} px from the centre of the code area`);
    // no empty «Code · 0 blocks»; «Files viewed» on Summary; the skip link is not printed
    await tab(page, "decisions"); await page.click('[data-act="dsub"][data-sub="all"]'); await page.click("#card-q2 .card-title"); await settle(page);
    const zero = await S(page, () => /Code · 0 blocks/.test(document.getElementById("ctx-decisions").innerText));
    await tab(page, "summary");
    const viewedOnSummary = /Files viewed/.test(await text(page, "#progress"));
    await page.emulateMedia({ media: "print" });
    const skipPrinted = await S(page, () => getComputedStyle(document.querySelector(".skip")).display !== "none");
    await page.emulateMedia({ media: "screen" });
    ok("polish: no «Code · 0 blocks», «Files viewed» on Summary, the skip link not printed", !zero && viewedOnSummary && !skipPrinted, JSON.stringify({ zero, viewedOnSummary, skipPrinted }));
    ok("v3 run38: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }
  // in-page find: the diff's text, drawn or not
  if (has("big.html")) {
    const { page, errors } = await open(browser, "big.html");
    await tab(page, "code");
    await page.keyboard.press(process.platform === "darwin" ? "Meta+f" : "Control+f"); await settle(page);
    await page.keyboard.type("applyWithoutVariant"); await wait(page, 400);
    const count = await text(page, "#find-count");
    const visits = [];
    for (let i = 0; i < 11; i++) {
      await page.keyboard.press("Enter"); await wait(page, 700);
      visits.push(await S(page, () => { const m = window.__proto.S.find.matches[window.__proto.S.find.i]; const tr = document.querySelector(`#files tr.r[data-lk="${m.lk}"]`); const r = tr?.getBoundingClientRect(); return !!tr && tr.classList.contains("findhit") && r.top > 90 && r.bottom < innerHeight && tr.innerText.includes("applyWithoutVariant"); }));
    }
    ok("find searches every file, drawn or not, and lands on each match", /11 matches/.test(count) && visits.every(Boolean) && /11 of 11/.test(await text(page, "#find-count")), `${count}; ${visits.filter(Boolean).length} of 11 landed`);
    await page.keyboard.press("Escape");
    ok("v3 big: find has no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }
  // j speed, measured in the page from a fresh load: the key's handler and the two frames that follow
  if (has("big.html")) {
    const { page, errors } = await open(browser, "big.html", { hash: "#code" }); await wait(page, 500);
    const js = [];
    for (let i = 0; i < 10; i++) {
      js.push(await S(page, () => new Promise((res) => { const t0 = performance.now(); document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "j", bubbles: true })); requestAnimationFrame(() => requestAnimationFrame(() => res(Math.round(performance.now() - t0)))); })));
      await wait(page, 300);
    }
    js.sort((x, y) => x - y);
    ok("big: j takes two frames or little more (in-page median)", js[5] < 50, `median ${js[5]} ms over 10 presses; ${js.join(", ")} (the same probe: v1 13 ms, v2 51 ms)`);
    ok("v3 big: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  await v3Answers(browser);
  if (!ONLY_V3) await v3More(browser);
  if (ONLY_V3) { await browser.close(); const failed = results.filter((r) => !r.pass); console.log(`\n${results.length - failed.length} of ${results.length} v3 checks pass`); process.exit(failed.length ? 1 : 0); }

  // ---------------------------------------------------------------- run38
  {
    const { page, errors } = await open(browser, "run38.html");
    ok("opens on Summary with one primary button, «Start review»", (await page.getAttribute("#tab-summary", "aria-selected")) === "true" && (await page.locator(".btn.primary").count()) === 1 && /Start review/.test(await text(page, ".btn.primary")));
    const reqline = await text(page, ".reqline");
    ok("Summary strip carries the one-line requirement status", /7 requirements: \d+ met · \d+ fail · \d+ not checked/.test(reqline), reqline);
    const tagsPerCell = await S(page, () => [...document.querySelectorAll("#panel-summary tbody tr td:nth-child(3)")].map((td) => td.querySelectorAll(".tag").length));
    ok("one status tag per requirement; limits are notes", tagsPerCell.every((k) => k === 1), `tags per row: ${tagsPerCell.join(",")}`);
    await page.click('tr[data-sel="req:2"] td:nth-child(2)');
    ok("Summary panel follows the selected requirement, with its relations", (await text(page, "#ctx-summary .panel-kicker")).includes("R2") && (await page.locator("#ctx-summary dl.rel").count()) === 1);

    // selection follows navigation: R2 → Show in Code selects a block that serves R2, and the URL, panel and position agree
    await page.click('#ctx-summary [data-act="req-code"]'); await wait(page, 600);
    const nav = await S(page, () => ({ hash: location.hash, sel: window.__proto.S.sel.code, cur: window.__proto.S.cur, req: window.__proto.S.code.req, serves: window.__proto.D.blocks[window.__proto.S.sel.code - 1]?.serves }));
    ok("«Show in Code» from R2 selects a block serving R2; URL and position agree", nav.req === "2" && nav.serves?.includes("2") && nav.hash === `#code/b${nav.sel}` && (!nav.cur || nav.cur.bid === nav.sel), JSON.stringify(nav));
    await page.selectOption('select[data-act="req"]', ""); await wait(page);
    await page.click('[data-act="mode"][data-mode="attention"]'); await wait(page);

    // Code: the column is wide, the context is closed; j walks decisions with block positions and focuses the note
    await page.keyboard.press("Escape"); await settle(page);
    const layout = await S(page, () => ({ ctxHidden: document.getElementById("ctx-code").hidden, files: Math.round(document.getElementById("files").getBoundingClientRect().width) }));
    ok("Code: context column closed by default, wide code column", layout.ctxHidden && layout.files >= 1050, `#files ${layout.files} px at 1440`);
    await page.keyboard.press("j"); await wait(page);
    const p1 = await text(page, "#pos"), f1 = await S(page, () => document.activeElement?.id);
    await page.keyboard.press("j"); await wait(page);
    const p2 = await text(page, "#pos");
    await page.keyboard.press("]"); await wait(page);
    const p3 = await text(page, "#pos");
    ok("j steps blocks within a decision, ] the next decision; focus on the note", /Decision 1 of 6 · block 1 of 21/.test(p1) && /Decision 1 of 6 · block 2 of 21/.test(p2) && /Decision 2 of 6/.test(p3) && /^note-/.test(f1), `${p1} → ${p2} → ${p3}; focus ${f1}`);
    const noteInView = await S(page, () => { const el = document.activeElement; const r = el.getBoundingClientRect(); return r.top >= 90 && r.top < innerHeight - 40; });
    ok("the note lands below the toolbar, in view", noteInView);

    // decide F3 by key in the margin: index kept, counts and headers refreshed, the block becomes one line
    await page.evaluate(() => { location.hash = "#code/b8"; }); await wait(page, 600);
    const before = { badge: await text(page, "#badge-decisions"), header: await text(page, "#file-2 .fh .meta"), mark: await text(page, '.tnode[data-f="2"] .mark') };
    await page.focus("#note-8"); await page.keyboard.press("f"); await wait(page);
    const afterPos = await text(page, "#pos");
    const after = { badge: await text(page, "#badge-decisions"), header: await text(page, "#file-2 .fh .meta"), mark: await text(page, '.tnode[data-f="2"] .mark'), done: await S(page, () => document.getElementById("note-8")?.classList.contains("done-line")) };
    ok("a decision by key keeps the index and shows «decided»", /Decision \d+ of 6.*decided/.test(afterPos), afterPos);
    ok("file header and tree count refresh on the decision", before.header !== after.header && before.mark !== after.mark && +after.badge === +before.badge - 1, `header «${before.header}» → «${after.header}»; tree ${before.mark} → ${after.mark}; badge ${before.badge} → ${after.badge}`);
    ok("a decided block collapses to one line in the attention view", after.done === true);
    await page.keyboard.press("j"); await wait(page);
    ok("j after a decision goes on to the next open decision", !/decided/.test(await text(page, "#pos")), await text(page, "#pos"));

    // the same answer in Decisions, worded as the owner's, with one of four tags
    await page.click("#tab-decisions"); await settle(page);
    const f3 = { tag: await text(page, '#card-f3 .compact [data-status="f3"]'), ans: await text(page, '#card-f3 [data-compact-answer="f3"]') };
    ok("a decision made in Code shows in Decisions as Decided · Fix it", f3.tag === "Decided" && f3.ans === "Fix it", JSON.stringify(f3));
    const tags = await S(page, () => [...new Set([...document.querySelectorAll("#dec-list .status .tag")].map((t) => t.textContent.trim()))]);
    ok("Decisions uses only Open, Decided, Deferred, Not applicable", tags.every((t) => ["Open", "Decided", "Deferred", "Not applicable"].includes(t)), tags.join(", "));
    const verdictWords = await S(page, () => [...document.querySelectorAll(".tag.verdict")].every((t) => t.textContent.startsWith("Reviewer:")));
    ok("the reviewer's verdict reads «Reviewer: …», the owner's buttons «Fix it» / «Leave it»", verdictWords && (await page.locator('#card-f1 .opt .ol', { hasText: "Leave it" }).count()) === 1);
    // the panel never repeats the card
    await page.click("#card-f1 .card-title"); await settle(page);
    const panelTitle = await text(page, "#ctx-decisions .panel-title"), cardTitle = await text(page, "#card-f1 .card-title");
    ok("the Decisions panel adds context and does not repeat the card", !panelTitle.includes(cardTitle.slice(0, 30)) && (await page.locator("#ctx-decisions .excerpt").count()) > 0 && (await page.locator("#ctx-decisions .choice").count()) === 0, panelTitle);
    // radios are not typing: j moves on with a radio focused
    await page.focus('#card-f1 input[data-opt="fix"]');
    const d0 = await S(page, () => window.__proto.S.sel.decisions);
    await page.keyboard.press("j"); await wait(page);
    ok("j works with a radio focused", d0 !== await S(page, () => window.__proto.S.sel.decisions), `${d0} → ${await S(page, () => window.__proto.S.sel.decisions)}`);
    // Defer needs a reason
    await page.click("#card-f2 .card-title"); await settle(page);
    await page.keyboard.press("d"); await wait(page, 200);
    await page.keyboard.press(process.platform === "darwin" ? "Meta+Enter" : "Control+Enter"); await wait(page, 200);
    const stillOpen = await text(page, '#card-f2 .full [data-status="f2"]');
    await page.fill('#card-f2 textarea[data-act="reason"]', "Wait for the owner's lifecycle choice (Q2).");
    await page.keyboard.press(process.platform === "darwin" ? "Meta+Enter" : "Control+Enter"); await wait(page);
    ok("Defer opens a reason field and needs a reason", stillOpen === "Open" && (await text(page, '#card-f2 [data-status="f2"]')) === "Deferred" && (await text(page, '[data-subcount="deferred"]')) === "1", `empty → ${stillOpen}; with reason → Deferred`);
    // a choice without variants, answered in its own words, and Ctrl/⌘+Enter goes on
    await page.click("#card-q2 .card-title"); await settle(page);
    await page.fill('#card-q2 textarea[data-act="text"]', "Per worker for now; revisit at fan-out.");
    await page.keyboard.press(process.platform === "darwin" ? "Meta+Enter" : "Control+Enter"); await wait(page);
    ok("Ctrl/⌘+Enter saves the answer and moves to the next open card", (await text(page, '#card-q2 [data-status="q2"]')) === "Decided" && (await S(page, () => window.__proto.S.sel.decisions)) !== "card:q2");
    ok("a choice without variants says so quietly", (await page.locator("#card-q3 .norecord").count()) === 1);
    const prog = await text(page, "#progress");
    ok("progress counts every item: «Decided N of 11»", /Decided 2 of 11/.test(prog), prog);

    // line comments: keyboard-reachable line numbers, the hint, the Comments sub-tab
    await page.click("#tab-code"); await settle(page);
    await page.evaluate(() => { location.hash = "#code/b7"; }); await wait(page, 600);
    const lnb = page.locator('#files tr.r[data-b="7"] .lnb').first();
    const reach = await S(page, () => !!document.querySelector("#files .fb:not(.pending) .lnb[tabindex='0']"));
    await lnb.focus(); await page.keyboard.press("ArrowDown"); await settle(page);
    const moved = await S(page, () => document.activeElement?.classList.contains("lnb"));
    await page.keyboard.press("c"); await wait(page, 200);
    await page.fill("#lc-input", "Does this line belong to the routing theme?");
    const hint = await text(page, ".lc .hint");
    await page.keyboard.press(process.platform === "darwin" ? "Meta+Enter" : "Control+Enter"); await wait(page);
    ok("line numbers are reachable by keyboard; ↑/↓ move; c comments", reach && moved && (await page.locator("#files .lc-t").count()) === 1);
    ok("a line comment inside an open item's block says it is not an answer", /A comment, not an answer to Q3/.test(hint), hint);
    // a paragraph comment on the report prose
    await page.click("#tab-summary"); await settle(page);
    await page.hover('[data-anchor="verdict:1"]'); await page.click('[data-anchor="verdict:1"] > .pc-btn');
    await page.fill("#pc-input", "The Stop window matters more than the flag."); await page.click('[data-act="pc-save"]'); await settle(page);
    await page.click("#tab-decisions"); await page.click('[data-act="dsub"][data-sub="comments"]'); await settle(page);
    const cm = await text(page, "#dec-list");
    ok("Decisions › Comments lists line and paragraph comments", /routing theme/.test(cm) && /Stop window/.test(cm) && /A comment, not an answer to Q3/.test(cm));

    // file search shows a file of kept code only, folded; the footer is grammatical; whole file in one action
    await page.click("#tab-code"); await settle(page);
    await page.fill("#file-q", "marketplace"); await wait(page, 400);
    const kept = await S(page, () => ({ files: document.querySelectorAll("#files section.file").length, folds: document.querySelectorAll("#files section.file tr.fold").length, empty: !!document.querySelector("#files .empty") }));
    ok("the file filter shows a file of kept code only, folded", kept.files === 1 && !kept.empty, JSON.stringify(kept));
    await page.click('#files [data-act="whole"]'); await settle(page);
    const whole = await S(page, () => ({ folds: document.querySelectorAll("#files section.file tr.fold").length, rows: document.querySelectorAll("#files section.file tr.r").length }));
    ok("«Show whole file» unfolds every line in one action", whole.folds === 0 && whole.rows > 0, JSON.stringify(whole));
    await page.fill("#file-q", ""); await wait(page, 400);
    const footer = await text(page, ".hidden-note");
    ok("the footer reads «N files hold only kept code»", /\d+ files hold only kept code|1 file holds only kept code/.test(footer), footer);
    // viewed, file order, next file
    await page.evaluate(() => window.scrollTo(0, 0)); await settle(page);
    await page.keyboard.press("Escape"); await page.keyboard.press("v"); await wait(page);
    ok("v marks the current file viewed and counts it", /Files viewed 1 of 35/.test(await text(page, "#progress")) && (await page.locator("#files section.file.viewed.collapsed").count()) === 1);
    await page.selectOption('select[data-act="order"]', "attention"); await wait(page);
    const firstOpen = await S(page, () => { const fi = +document.querySelector("#files section.file").dataset.f; return document.querySelector(`#file-${fi} .fh .meta`).textContent.includes("open"); });
    ok("«Needs attention first» puts a file with open decisions first", firstOpen);
    await page.selectOption('select[data-act="order"]', "diff"); await wait(page);
    const topFile = async () => S(page, () => { const t = 48 + document.querySelector(".toolbar").offsetHeight + 10; return [...document.querySelectorAll("#files section.file")].find((s) => s.getBoundingClientRect().bottom > t)?.dataset.f; });
    const tf0 = await topFile(); await page.keyboard.press("Shift+J"); await wait(page, 600); const tf1 = await topFile();
    ok("Shift+J goes to the next file", tf0 !== tf1, `${tf0} → ${tf1}`);
    // copy path:line, honest on refusal
    await page.evaluate(() => { location.hash = "#code/b69"; }); await wait(page, 600);
    await page.keyboard.press("y"); await wait(page, 300);
    const copied = await S(page, () => document.querySelector("#copybox input")?.value || (!document.getElementById("toast")?.hidden && document.getElementById("toast")?.textContent) || "");
    ok("y copies path:line (or offers the text when the clipboard refuses)", /driver\.mjs:\d+/.test(copied), copied);
    await page.keyboard.press("Escape");
    // the context column only adds context
    await page.keyboard.press("i"); await settle(page);
    ok("i opens the context column; it holds no choice control", !(await S(page, () => document.getElementById("ctx-code").hidden)) && (await page.locator("#ctx-code .choice, #ctx-code .pill").count()) === 0);
    await page.keyboard.press("i");
    // skip link
    const skip = await S(page, () => { const a = document.querySelector(".skip"), t = document.getElementById("tree"); return !!a && !!(a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING); });
    ok("a «Skip to diff» link comes before the tree", skip);

    // Details: units sorted by fix lines, «Used by», a verdict that disagrees with its lines says so; scenarios and screens hide when empty
    await page.click("#tab-details"); await settle(page);
    const units = await S(page, () => [...document.querySelectorAll("#det-body tbody tr")].map((tr) => tr.querySelector(".shares")?.textContent ?? ""));
    const fixes = units.map((s) => +(/fix (\d+)/.exec(s)?.[1] ?? 0));
    ok("units sort by fix lines", fixes.every((v, i) => i === 0 || fixes[i - 1] >= v), fixes.join(","));
    ok("the units table shows «Used by» and flags a unit verdict its blocks contradict", (await page.locator("#det-body", { hasText: "used by" }).count()) === 1 && (await page.locator("#det-body .mismatch").count()) > 0, await text(page, "#det-body .mismatch"));
    await page.click('[data-act="sview"][data-view="graph"]'); await settle(page);
    await page.hover('.gnode[data-i="0"]');
    ok("the optional graph lights a unit's edges on hover", (await S(page, () => document.querySelectorAll(".gedge.hl").length)) > 0);
    await page.click('[data-act="sview"][data-view="table"]');
    // segmented controls stay on one line at 1280
    await page.setViewportSize({ width: 1280, height: 800 });
    const segs = [];
    for (const tab of ["decisions", "details", "code"]) { await page.click("#tab-" + tab); await settle(page); segs.push(...await S(page, () => [...document.querySelectorAll(".tabpanel:not([hidden]) .seg")].map((s) => [s.scrollWidth <= s.clientWidth + 1, Math.round(s.getBoundingClientRect().height)]))); }
    const tb = await S(page, () => Math.round(document.querySelector(".toolbar").getBoundingClientRect().height));
    ok("at 1280 no segmented control wraps, and the Code toolbar is one row", segs.every(([fits, h]) => fits && h <= 34) && tb <= 53, `${JSON.stringify(segs)}; toolbar ${tb} px`);
    await page.setViewportSize({ width: 1440, height: 900 });
    // the theme stays chosen
    await page.click("#theme-btn"); await page.reload(); await page.waitForSelector(".tabbar");
    ok("the theme toggle sits in the title header and the choice is kept", (await S(page, () => document.documentElement.dataset.theme)) === "light" && (await page.locator(".masthead #theme-btn").count()) === 1);
    await page.click("#theme-btn"); await page.click("#theme-btn");
    ok("run38: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // ---------------------------------------------------------------- direct links resolve to the item and its context
  {
    const links = [["#code/b69", () => window.__proto.S.sel.code === 69 && window.__proto.S.cur?.key === "f2" && !!document.getElementById("note-69")],
      ["#decisions/f3", () => window.__proto.S.sel.decisions === "card:f3"], ["#summary/r4", () => window.__proto.S.sel.summary === "req:4"],
      ["#details/mechanisms/mech:2", () => window.__proto.S.sel.details === "mech:2"], ["#decisions/comments", () => window.__proto.S.sub.decisions === "comments"],
      ["#code/line/23:+102", () => window.__proto.S.sel.code === 42 && !!document.querySelector('#files tr.r[data-lk="23:+102"]')],
      ["#code/line/99:+1", () => !document.getElementById("panel-code").hidden]];
    const bad = [];
    for (const [hash, test] of links) {
      const { page, errors } = await open(browser, "run38.html", { hash });
      await wait(page, 700);
      if (!(await page.evaluate(test)) || errors.length) bad.push(hash + (errors.length ? " " + errors.join(" | ") : ""));
      await page.close();
    }
    ok("direct links resolve to the item and its context", !bad.length, bad.length ? bad.join(", ") : links.map(([h]) => h).join(" "));
  }

  // ---------------------------------------------------------------- themed: variants, a dependent child, drafts, evidence
  if (has("themed.html")) {
    const { page, errors } = await open(browser, "themed.html", { hash: "#decisions/q3", width: 1280, height: 800 });
    await settle(page);
    ok("a choice offers its variants plus «Other», keyed 1, 2, o", (await page.locator('#card-q3 input[data-act="pick"]').count()) === 3 && /1/.test(await text(page, "#card-q3 .opt .key")));
    await page.keyboard.press("1"); await settle(page);
    await page.check('#card-q3 input[data-opt="other"]'); await page.fill('#card-q3 textarea[data-act="text"]', "Convert at the boundary only."); await page.keyboard.press("Tab"); await wait(page);
    const own = await S(page, () => ({ c: window.__proto.S.dec.q3.choice, t: window.__proto.S.dec.q3.text }));
    await page.keyboard.press("Escape"); await page.click("#card-q3 .card-title"); await page.keyboard.press("2"); await settle(page);
    const v2 = await S(page, () => ({ c: window.__proto.S.dec.q3.choice, t: window.__proto.S.dec.q3.text }));
    ok("one answer in effect: own text replaces a variant, a variant clears own text", own.c === "other" && own.t && v2.c === "v:extend" && v2.t === "", `${JSON.stringify(own)} → ${JSON.stringify(v2)}`);
    // the external review's case: status-quo, then extend, then one click on Q4
    await page.check('#card-q3 input[data-opt="v:status-quo"]'); await settle(page);
    const na = await text(page, '#card-q4 [data-status="q4"]');
    await page.check('#card-q3 input[data-opt="v:extend"]'); await settle(page);
    await page.click('#card-q4 .opt:has(input[data-opt="v:narrow"])'); await settle(page);
    ok("a dependent question takes the first click after it applies again", na === "Not applicable" && (await text(page, '#card-q4 [data-status="q4"]')) === "Decided", `status-quo → Q4 ${na}; extend + one click → ${await text(page, '#card-q4 [data-status="q4"]')}`);
    await page.check('#card-q3 input[data-opt="v:status-quo"]'); await settle(page);
    await page.check('#card-q3 input[data-opt="v:extend"]'); await settle(page);
    ok("a retired child's pick comes back as a draft, never in effect", (await text(page, '#card-q4 [data-status="q4"]')) === "Open" && (await page.locator("#card-q4 .draft").count()) === 1, await text(page, "#card-q4 .draft"));
    // an evidence answer is never verified and never «done»
    await page.fill('#card-q1 textarea[data-act="text"]', "Empty codes pass through unchanged (read in archive.js:4)."); await page.keyboard.press("Tab"); await wait(page);
    const ev = await text(page, '#card-q1 [data-answer="q1"]');
    await page.click('[data-act="dsub"][data-sub="done"]'); await settle(page);
    ok("an evidence answer reads «Answer entered · not verified» and stays out of Done", /Answer entered · not verified/.test(ev) && (await page.locator("#card-q1").count()) === 0, ev);
    await page.click('[data-act="dsub"][data-sub="all"]');
    // provenance of record content: scenarios and historical screens
    await page.click("#tab-details"); await settle(page);
    const subs = await S(page, () => [...document.querySelectorAll('#panel-details [data-act="xsub"]')].map((b) => b.textContent.replace(/\d+/g, "").trim()));
    await page.click('[data-act="xsub"][data-sub="screens"]'); await settle(page);
    ok("scenarios and screens are shown; a historical picture carries its revision", subs.includes("Scenarios") && subs.includes("Screens") && /Historical picture of revision abc123/.test(await text(page, "#det-body")), subs.join(" · "));
    await page.click("#tab-code"); await settle(page);
    await page.keyboard.press("j"); await wait(page);
    await page.keyboard.press("o"); await wait(page, 200);
    ok("o on the selected note opens the own-answer field there", await S(page, () => document.activeElement?.matches('#files .note textarea[data-act="text"]')));
    await page.screenshot({ path: path.join(SHOTS, "themed-code-other-1280.png") });
    ok("themed: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // ---------------------------------------------------------------- big: timings, tree landing, bounded DOM
  if (!has("big.html")) console.log("SKIP  big.html is not in the pages folder; the 274-block checks need it built");
  else {
    const { page, errors, wall } = await open(browser, "big.html");
    const t = await S(page, () => { const nav = performance.getEntriesByType("navigation")[0], fcp = performance.getEntriesByName("first-contentful-paint")[0]; return { dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), fcp: fcp ? Math.round(fcp.startTime) : null, ready: Math.round(window.__proto.timing()) }; });
    ok("big.html opens in under 2 s", t.load < 2000 && wall < 2000, `wall ${wall} ms; DOMContentLoaded ${t.dcl} ms; load ${t.load} ms; first paint ${t.fcp} ms; app script ${t.ready} ms`);
    const codeMs = await S(page, () => new Promise((r) => { const t0 = performance.now(); document.getElementById("tab-code").click(); requestAnimationFrame(() => requestAnimationFrame(() => r(Math.round(performance.now() - t0)))); }));
    ok("big: Code tab (attention view) renders fast", codeMs < 1000, `${codeMs} ms to the first frame`);
    // tree clicks land exactly, in both views
    for (const mode of ["attention", "all"]) {
      if (mode === "all") { await page.click('[data-act="mode"][data-mode="all"]'); await wait(page); }
      const targets = ["decisions.mjs", "labels.mjs", "page.mjs", "review.mjs", "report-data.md", "review-report.test.mjs"];
      const misses = [];
      for (const name of targets) {
        const fi = await S(page, (n) => window.__proto.D.files.findIndex((f) => f.path.endsWith("/" + n)), name);
        await page.locator(`.tnode[data-f="${fi}"]`).click(); await wait(page, 900);
        const d = await S(page, (fi) => { const s = document.getElementById("file-" + fi); const want = 48 + document.querySelector(".toolbar").offsetHeight + 6; return s ? Math.round(s.getBoundingClientRect().top - want) : null; }, fi);
        if (d === null || Math.abs(d) > 3) misses.push(`${name} ${d}`);
      }
      ok(`big (${mode}): a tree click lands exactly on the file`, !misses.length, misses.length ? misses.join(", ") : `${targets.length} of ${targets.length} within 3 px`);
    }
    await page.click('[data-act="mode"][data-mode="attention"]'); await wait(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    const js = [];
    for (let i = 0; i < 6; i++) { const t0 = Date.now(); await page.keyboard.press("j"); await settle(page); js.push(Date.now() - t0); }
    ok("big: j steps through the decisions", true, `6 presses: ${js.join(", ")} ms; ${await text(page, "#pos")}`);
    const allMs = await S(page, () => new Promise((r) => { const t0 = performance.now(); document.querySelector('[data-act="mode"][data-mode="all"]').click(); requestAnimationFrame(() => requestAnimationFrame(() => r(Math.round(performance.now() - t0)))); }));
    const t0 = Date.now(); let peak = 0;
    for (let y = 0; ; y += 2500) { const h = await S(page, (y) => { window.scrollTo(0, y); return document.body.scrollHeight; }, y); await wait(page, 60); peak = Math.max(peak, await S(page, () => document.getElementsByTagName("*").length)); if (y > h) break; }
    const nodes = await S(page, () => document.getElementsByTagName("*").length);
    ok("big: All view stays usable and the DOM stays bounded", allMs < 1500 && peak < 40000, `switch ${allMs} ms; whole diff scrolled in ${Date.now() - t0} ms; peak ${peak} elements, ${nodes} at the end (v1 kept every drawn row: about 88,000)`);
    await page.click('[data-act="mode"][data-mode="attention"]');
    ok("big: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // ---------------------------------------------------------------- contrast, 1024 px, screenshots
  for (const scheme of ["light", "dark"]) {
    const { page } = await open(browser, "run38.html", { scheme });
    const fails = [];
    for (const tab of ["summary", "decisions", "code", "details"]) {
      await page.click(`#tab-${tab}`); await settle(page);
      if (tab === "code") { await page.keyboard.press("j"); await wait(page); }
      fails.push(...(await S(page, scan)).map((f) => `${tab}: ${f}`));
    }
    ok(`contrast (${scheme}): no text below WCAG AA`, !fails.length, fails.slice(0, 6).join("; "));
    await page.close();
  }
  for (const file of ["run38.html", "big.html"].filter(has)) {
    const { page, errors } = await open(browser, file, { width: 1024, height: 768 });
    const over = [];
    for (const tab of ["summary", "decisions", "code", "details"]) {
      await page.click(`#tab-${tab}`); await settle(page);
      const w = await S(page, () => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      if (w[0] > w[1]) over.push(`${tab} ${w[0]}>${w[1]}`);
      if (file === "run38.html") await page.screenshot({ path: path.join(SHOTS, `run38-1024-${tab}.png`) });
    }
    ok(`${file} at 1024 px: no horizontal page scroll`, !over.length, over.join(", "));
    if (errors.length) ok(`${file} at 1024: console`, false, errors.join(" | "));
    await page.close();
  }
  for (const scheme of ["light", "dark"]) {
    const { page } = await open(browser, "run38.html", { scheme });
    for (const tab of ["summary", "decisions", "code", "details"]) {
      await page.click(`#tab-${tab}`); await settle(page);
      if (tab === "code") { await page.keyboard.press("j"); await wait(page); }
      await page.screenshot({ path: path.join(SHOTS, `run38-${tab}-${scheme}.png`) });
    }
    await page.close();
    if (has("big.html")) {
      const big = await open(browser, "big.html", { scheme });
      await big.page.click("#tab-code"); await big.page.keyboard.press("j"); await wait(big.page);
      await big.page.screenshot({ path: path.join(SHOTS, `big-code-${scheme}.png`) });
      await big.page.close();
    }
  }
  await browser.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length} of ${results.length} checks pass`);
  console.log(`screenshots and selfcheck.txt: ${SHOTS}`);
  fs.writeFileSync(path.join(SHOTS, "selfcheck.txt"), results.map((r) => `${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  — " + r.detail : ""}`).join("\n") + `\n\n${results.length - failed.length} of ${results.length} checks pass\n`);
  process.exit(failed.length ? 1 : 0);
})();
