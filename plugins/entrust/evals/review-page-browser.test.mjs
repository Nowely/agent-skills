#!/usr/bin/env node
// The review page in a browser: the page report.mjs renders, driven in Chromium through Playwright. It renders public
// records only — the report suite's themed record, in English and in Russian, and a large record it generates — and
// reads no file outside the repository and the temp directory. It covers the four tabs and deep links, answering in
// Decisions and in the code's margin, the keys and what they must never do, persistence across a reload, the
// export, reading without JavaScript, both print profiles, the Russian page and the large record's speed and bounded
// DOM. Run it after an edit to page.mjs, page/ or decisions.mjs.
//
// It runs locally only: CI installs no Playwright. It needs Playwright and its Chromium: PLAYWRIGHT_CORE names
// Playwright's index.mjs, else playwright-core or playwright is imported, from here or the global npm root. Without
// them it says NOT RUN and exits 0.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, registry, runCases, summarize } from "./lib/harness.mjs";
import { prepare } from "./review/prepare.mjs";
import { reportFixtures, hostileFixture, hostileThemed } from "./review/report-fixtures.mjs";

const { cases: TESTS, test } = registry();
const SCRIPT = path.join(ROOT, "skills", "review", "scripts", "report.mjs");

async function playwright() {
  const global = spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout?.trim();
  const candidates = [process.env.PLAYWRIGHT_CORE, "playwright-core", "playwright",
    ...(global ? ["playwright-core", "playwright"].map((name) => pathToFileURL(path.join(global, name, "index.mjs")).href) : [])].filter(Boolean);
  for (const name of candidates) {
    try { const { chromium } = await import(name.startsWith("/") ? pathToFileURL(name).href : name); const browser = await chromium.launch(); return browser; } catch { /* the next */ }
  }
  return null;
}
const browser = await playwright();
if (!browser) {
  console.log("NOT RUN: the page's browser suite runs locally only, and Playwright with its Chromium is not installed here; CI never runs it. Install Playwright, or set PLAYWRIGHT_CORE to its index.mjs, and run it after a change to the page");
  process.exit(0);
}

// ---- the records: the themed one in two languages, and a large one generated here
const { run } = prepare("currency-contract", "clean"), repo = path.join(run, "repo");
const diff = spawnSync("git", ["-c", "core.quotepath=off", "diff", "--no-color", "--no-ext-diff", "--no-renames", "-U3", "HEAD~1..HEAD", "--"], { cwd: repo }).stdout;
const { THEMED } = reportFixtures(createHash("sha256").update(diff).digest("hex"));
const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
// A flat grey picture of a given size, to measure how the viewer sizes it.
function png(w, h) {
  const chunk = (type, data) => { const td = Buffer.concat([Buffer.from(type), data]), len = Buffer.alloc(4), crc = Buffer.alloc(4); len.writeUInt32BE(data.length); crc.writeUInt32BE(zlib.crc32(td)); return Buffer.concat([len, td, crc]); };
  const head = Buffer.alloc(13); head.writeUInt32BE(w, 0); head.writeUInt32BE(h, 4); head[8] = 8; head[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(w * 3, 200)]);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", head), chunk("IDAT", zlib.deflateSync(Buffer.concat(Array.from({ length: h }, () => row)))), chunk("IEND", Buffer.alloc(0))]);
}
function render(name, record, diffBytes = diff, pictures = true) {
  const dir = path.join(run, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "source.diff"), diffBytes);
  if (pictures) for (const p of ["before.png", "after.png"]) fs.writeFileSync(path.join(dir, p), pictures === true ? PIXEL : pictures[p] ?? PIXEL);
  fs.writeFileSync(path.join(dir, "review.json"), JSON.stringify(record));
  const r = spawnSync(process.execPath, [SCRIPT, "render", path.join(dir, "review.json")], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`render ${name}: ${r.stderr}`);
  return pathToFileURL(path.join(dir, "review.html")).href;
}
// The themed record, with a kept block that serves only an assumed requirement, a screen with its revision and a unit
// with blocks to keep and to fix.
const record = structuredClone(THEMED);
record.blocks[0].serves = [3];
// The first requirement also comes from the mockup the task names.
record.requirements[0].sources = [...record.requirements[0].sources, { ref: "/screens/0" }];
record.blocks[1].unit = "readArchive";
record.screens[0] = { ...record.screens[0], revision: "head", sources: [{ ref: "/requirements/0" }] };
// A finding text long enough that a clamped card would cut it.
const LONG = "The archive reader converts the currency code while it reads each row, so the display sees only what the reader chose to keep. ".repeat(4).trim();
record.findings[1].what = LONG;
const THEMED_URL = render("themed", record);
const RU = { ...structuredClone(record), language: "ru" }, RU_URL = render("ru", RU);
// A continuation of the themed review: the same diff, its first block carried, two replies to earlier comments.
const PREV_KEY = createHash("sha256").update(JSON.stringify(record)).digest("hex").slice(0, 10);
const NEXT = { ...structuredClone(record), title: "Where the conversion lives, again",
  previous: { record: "../themed/review.json", sha256: createHash("sha256").update(JSON.stringify(record)).digest("hex") },
  // the first block carried: its unit has blocks not kept, so it is carried without one, by its file, which nothing else in changes
  blocks: record.blocks.map((b, i) => i === 0 ? (({ unit, ...rest }) => ({ ...rest, carried: true }))(b) : b),
  replies: [{ comment: "Why convert here?", place: "src/invoices/archive.js:4", text: "The archive keeps lower case.", sources: [{ at: "TASK-9", quote: "upper case" }] },
    { comment: "And the old reader?", place: "src/old.js:9", text: "It is gone.", sources: [{ at: "TASK-9", quote: "upper case" }] }] };
const NEXT_URL = render("next", NEXT), NEXT_KEY = createHash("sha256").update(JSON.stringify(NEXT)).digest("hex").slice(0, 10);
// Every value the record names things by made hostile, and a hostile file path on a diff of its own.
const HOSTILE_URL = render("hostile", hostileThemed(record));
// The themed record with its idea at a line of the base side, which the head numbers otherwise.
const BASE_URL = render("base-place", { ...structuredClone(record), ideas: [{ ...record.ideas[0], at: "src/invoices/archive.js:2 (base)" }] });
// The themed record whose kept block says why its lines are one decision.
const WHOLE = "one conversion, written once for every row";
const WHOLE_URL = render("whole", { ...structuredClone(record), blocks: record.blocks.map((b, i) => i === 0 ? { ...b, whole: WHOLE } : i === 1 ? { ...b, whole: "one test" } : b) });
const HOSTILE_PATH_URL = (() => { const { diff: bytes, record: r } = hostileFixture(); return render("hostile-path", r, bytes, false); })();
// A large record: 40 files of 180 added lines, seven blocks each, a few of them to fix or to ask about.
const FILES = 40, LINES = 180, UNIT = "theGeneratedModulesThatExportTheirValuesOneByOne";
const bigDiff = Array.from({ length: FILES }, (_, f) => [`diff --git a/src/m${f}/part${f}.js b/src/m${f}/part${f}.js`, "new file mode 100644", "--- /dev/null",
  `+++ b/src/m${f}/part${f}.js`, `@@ -0,0 +1,${LINES} @@`,
  ...Array.from({ length: LINES }, (_, i) => `+export const value${f}_${i} = ${f * 1000 + i};${(f % 8 === 0 && i % 60 === 7) ? " // needleToken" : ""}`)].join("\n")).join("\n") + "\n";
const bigBlocks = Array.from({ length: FILES * 6 }, (_, k) => {
  const f = Math.floor(k / 6), part = k % 6, from = part * 30 + 1;
  const verdict = k % 23 === 5 ? "fix" : k % 37 === 9 ? "question" : "keep";
  return { path: `src/m${f}/part${f}.js`, added: `${from}-${from + 29}`, does: `Part ${part} of module ${f}.`, serves: [1], verdict, ...(f < 10 ? { unit: UNIT } : {}),
    ...(verdict === "fix" ? { findings: [1 + (k % 2)] } : verdict === "question" ? { questions: [1] } : {}) };
});
const big = { title: "A large generated change", range: "generated", language: "en",
  diff: { file: "source.diff", sha256: createHash("sha256").update(bigDiff).digest("hex") },
  change: { goal: "Many modules.", parts: ["Forty modules."], sources: ["generated"] },
  verdict: "Generated.", now: "Generated.", target: "Generated.", recommendation: "Read it.",
  requirements: [{ id: 1, text: "Every module exports its values.", source: "task", met: "read", sources: [{ at: "generated", quote: "every module exports its values" }] }],
  findings: [1, 2].map((id) => ({ id, title: `Finding ${id}`, direction: "behavior", evidence: "read", at: `src/m${id}/part${id}.js:10`, what: "What.", shown_by: "The line.", fix: "Fix." })),
  questions: [{ at: "src/m0/part0.js:1", text: "Keep the generated modules?", kind: "decision",
    variants: [{ id: "keep", text: "Keep them", consequences: [{ text: "They stay.", sources: [{ ref: "/requirements/0" }] }] },
      { id: "drop", text: "Drop them", consequences: [{ text: "They go.", sources: [{ ref: "/requirements/0" }] }] }],
    recommendation: { text: "Keep them.", variant: "keep", sources: [{ ref: "/requirements/0" }] } }],
  units: [{ name: UNIT, jobs: ["exports the values of the first ten modules"], uses: [], verdict: "keep", reason: "Generated." }],
  blocks: bigBlocks, challenges: [], coverage: "Generated." };
const BIG_URL = render("big", big, bigDiff, false);
// A file whose path runs far past the width of a desktop window, with no space or hyphen to break at, named as the
// file, as a place and as code in a finding's title, text and fix.
const LONG_PATH = `src/${"aDirectoryWhoseNameRunsOnAndOn/".repeat(6)}AndAFileWhoseNameIsLongAsWell.js`;
const LONG_URL = (() => {
  const bytes = `diff --git a/${LONG_PATH} b/${LONG_PATH}\nnew file mode 100644\n--- /dev/null\n+++ b/${LONG_PATH}\n@@ -0,0 +1 @@\n+export const x = 1;\n`;
  const r = { ...structuredClone(big), title: "A long path", diff: { file: "source.diff", sha256: createHash("sha256").update(bytes).digest("hex") }, units: [],
    findings: [{ ...big.findings[0], at: `${LONG_PATH}:1`, title: `Reads \`${LONG_PATH}\``, what: `Reads \`${LONG_PATH}\` whole.`, fix: `Read \`${LONG_PATH}\` once.` }], questions: [{ ...big.questions[0], at: `${LONG_PATH}:1` }],
    blocks: [{ path: LONG_PATH, added: "1", does: "Exports x.", serves: [1], verdict: "fix", findings: [1] }] };
  return render("long-path", r, bytes, false);
})();

// ---- helpers
const VIEW = { width: 1440, height: 900 };
async function open(url, { viewport = VIEW, js = true, init } = {}) {
  const context = await browser.newContext({ viewport, javaScriptEnabled: js, acceptDownloads: true });
  const page = await context.newPage(), errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  if (init) await page.addInitScript(init);
  await page.goto(url);
  if (js) await page.waitForSelector(".tabbar");
  return { page, errors, close: () => context.close() };
}
const settle = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const text = async (page, selector) => (await page.locator(selector).first().innerText()).replace(/\s+/g, " ").trim();
const statusOf = (page, key) => text(page, `#card-${key} [data-status="${key}"]`);
const exported = async (page) => { await page.click('[data-act="export"]'); const t = await page.locator("#export-text").inputValue(); await page.keyboard.press("Escape"); return t; };
async function payload(page) {
  await page.click('[data-act="export"]');
  const download = page.waitForEvent("download");
  await page.click('[data-act="export-json"]');
  const data = JSON.parse(fs.readFileSync(await (await download).path(), "utf8"));
  await page.keyboard.press("Escape");
  return data;
}
// A case: open, act, check; the page must raise no error, and its context is closed whatever happens.
const cased = (url, options, fn) => async () => {
  const o = await open(url, options);
  try { const verdict = await fn(o.page); return o.errors.length ? `page errors: ${o.errors.join("; ")}` : verdict; }
  finally { await o.close(); }
};

// ---- the tabs, deep links and the panels
test("the page opens on Summary with Start review, and every deep link lands on its tab and item",
  "a link to an item, a line or a sub-tab is how the owner, the export and a colleague point at one place",
  cased(THEMED_URL, {}, async (page) => {
    if (await page.getAttribute("#tab-summary", "aria-selected") !== "true" || (await page.locator(".btn.primary:visible").count()) !== 1) return "not on Summary with one primary button";
    for (const [hash, tab, check] of [["#decisions/f1", "decisions", "#card-f1.sel"], ["#code/b2", "code", "#note-2.sel"], ["#decisions/comments", "decisions", '[data-sub="comments"][aria-selected="true"]'],
      ["#summary/r1", "summary", '[data-sel="req:1"].sel'], ["#details/challenges/chal:0", "details", '[data-sel="chal:0"].sel'], ["#code/line/1:+3", "code", 'tr.r[data-lk="1:+3"]']]) {
      await page.goto(THEMED_URL + hash); await page.waitForSelector(".tabbar"); await settle(page); await page.waitForTimeout(150);
      if (await page.getAttribute(`#tab-${tab}`, "aria-selected") !== "true") return `${hash} did not open ${tab}`;
      if (!(await page.locator(check).count())) return `${hash} did not reach ${check}`;
    }
    return true;
  }));

test("Decisions shows each card once with a side panel of its context, not a copy of the card",
  "the panel adds the place, sources and related items; a second answer control there would be a second state",
  cased(THEMED_URL + "#decisions/f2", {}, async (page) => {
    if ((await page.locator("#dec-list .card").count()) !== 8) return "the eight items are not each a card";
    const panel = await text(page, "#ctx-decisions");
    if (!/Context for F2/.test(panel) || (await page.locator("#ctx-decisions .choice").count())) return `the panel is not the context: ${panel.slice(0, 120)}`;
    return (await page.locator("#ctx-decisions .excerpt").count()) > 0 || "the panel shows no code for F2";
  }));

test("a decision made in the code's margin shows in Decisions, and j walks the decisions with code",
  "the margin note is where the owner answers in Code; both views read one state",
  cased(THEMED_URL, {}, async (page) => {
    await page.keyboard.press("g"); await page.keyboard.press("c"); await page.waitForTimeout(200);
    await page.keyboard.press("j"); await page.waitForTimeout(400);
    const pos = await text(page, "#pos");
    if (!/Decision 1 of/.test(pos)) return `j did not reach the first decision: ${pos}`;
    const focused = await page.evaluate(() => document.activeElement.id);
    if (!/^note-/.test(focused)) return `j did not focus the note: ${focused}`;
    await page.locator(`#${focused} [data-act="pick"]`).first().click(); await settle(page);
    await page.keyboard.press("g"); await page.keyboard.press("d"); await settle(page);
    const tags = await page.locator("#dec-list .card .full .card-head [data-status]").allInnerTexts();
    return tags.filter((t) => t === "Decided").length === 1 || `Decisions does not show the margin decision: ${tags.join(", ")}`;
  }));

// ---- keys that never answer for the owner
test("a key answers only the item in view, with a toast and Undo; out of view it only brings the item into view",
  "a key once decided an item 60,000 px away with no feedback",
  cased(THEMED_URL + "#decisions/f1", {}, async (page) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await settle(page);
    await page.keyboard.press("f"); await settle(page);
    if (await statusOf(page, "f1") !== "Open") return "a key answered an item out of view";
    await page.keyboard.press("f"); await settle(page);
    if (await statusOf(page, "f1") !== "Decided" || !/F1: Fix it/.test(await text(page, "#toast"))) return "the key in view did not answer with a toast";
    await page.keyboard.press("u"); await settle(page);
    return await statusOf(page, "f1") === "Open" || "Undo did not restore F1";
  }));

test("Start review, then j, moves to the next card and types nothing",
  "arriving on a card focused its answer field, and the next j became the answer",
  cased(THEMED_URL, {}, async (page) => {
    await page.click("#start-btn"); await settle(page);
    const first = await page.evaluate(() => document.activeElement.id);
    await page.keyboard.press("j"); await settle(page);
    const after = await page.evaluate(() => ({ id: document.activeElement.id, tag: document.activeElement.tagName, texts: [...document.querySelectorAll("textarea")].map((t) => t.value).join("") }));
    return /^card-/.test(first) && after.id !== first && after.tag !== "TEXTAREA" && !after.texts.includes("j") || `Start review then j: ${first} → ${JSON.stringify(after)}`;
  }));

test("c on a line number opens an empty comment field, and the comment is listed under Decisions › Comments",
  "the key that opened the field was typed into it",
  cased(THEMED_URL + "#code", {}, async (page) => {
    await page.waitForTimeout(300);
    await page.locator("#files .lnb").first().focus(); await page.keyboard.press("c"); await settle(page);
    if (await page.locator("#lc-input").inputValue() !== "") return "the field did not open empty";
    await page.keyboard.type("Why this line?"); await page.keyboard.press("Control+Enter"); await settle(page);
    await page.goto(THEMED_URL + "#decisions/comments"); await page.waitForSelector(".tabbar"); await settle(page);
    return /Why this line\?/.test(await text(page, "#dec-list")) || "the line comment is not listed";
  }));

test("g then a letter switches tabs, and Shift+K right after Shift+J steps back a file",
  "Alt+digits switch browser tabs on Linux; Shift+K once stayed on the same file",
  cased(THEMED_URL, {}, async (page) => {
    await page.keyboard.press("g"); await page.keyboard.press("d"); await settle(page);
    if (await page.getAttribute("#tab-decisions", "aria-selected") !== "true") return "g d did not open Decisions";
    await page.keyboard.press("g"); await page.keyboard.press("c"); await page.waitForTimeout(300);
    const top = () => page.evaluate(() => { const bar = document.querySelector(".toolbar").getBoundingClientRect().bottom; return [...document.querySelectorAll("#files .file")].find((s) => s.getBoundingClientRect().bottom > bar + 10)?.dataset.f; });
    // In the attention view the two files that wait for the owner are shown: Shift+J reaches the second, Shift+K the first.
    const a = await top();
    await page.keyboard.press("Shift+J"); await page.waitForTimeout(500); const b = await top();
    await page.keyboard.press("Shift+K"); await page.waitForTimeout(500); const c = await top();
    return a === "1" && b === "2" && c === "1" || `files ${a} → ${b} → ${c}`;
  }));

test("o then Esc changes nothing: no answer is cleared, focus returns to the card or note, and the next j moves on",
  "o cleared a decided answer, and Esc left focus in the field, so «j j» became the answer",
  async () => {
    const results = [];
    for (const [url, keys, item] of [[THEMED_URL, [], "q3"], [THEMED_URL + "#decisions/q2", [], "q2"], [THEMED_URL + "#decisions/f1", ["f"], "f1"]]) {
      const o = await open(url), page = o.page;
      try {
        if (url === THEMED_URL) { await page.click("#start-btn"); await settle(page); }
        for (const k of keys) { await page.keyboard.press(k); await settle(page); }
        const before = await text(page, `#card-${item} [data-answer="${item}"]`);
        await page.keyboard.press("o"); await settle(page); await page.keyboard.press("Escape"); await settle(page);
        const focus = await page.evaluate(() => document.activeElement.id);
        await page.keyboard.press("j"); await page.keyboard.press("j"); await settle(page);
        const after = await text(page, `#card-${item} [data-answer="${item}"]`), typed = await page.evaluate(() => [...document.querySelectorAll("textarea")].some((t) => /j/.test(t.value)));
        if (focus !== `card-${item}` || after !== before || typed || o.errors.length) results.push(`${item}: focus ${focus}, «${before}» → «${after}», typed ${typed} ${o.errors.join("; ")}`);
      } finally { await o.close(); }
    }
    // In the code's margin: F1 answered by key, then o and Esc on its note.
    const o = await open(THEMED_URL + "#code"), page = o.page;
    try {
      await page.waitForTimeout(300); await page.keyboard.press("j"); await page.waitForTimeout(400);
      // the decided block shrinks to one line; open it, then o and Esc on its note
      await page.keyboard.press("f"); await settle(page); await page.click('#files .done-line[data-b="2"]'); await settle(page);
      await page.keyboard.press("o"); await settle(page);
      const field = await page.evaluate(() => document.activeElement.matches("#note-2 textarea"));
      await page.keyboard.press("Escape"); await settle(page);
      const answer = await page.evaluate(() => document.querySelector('#note-2 [data-answer="f1"]')?.innerText ?? ""), focus = await page.evaluate(() => document.activeElement.id);
      if (!field || !/Fix it/.test(answer) || focus !== "note-2") results.push(`margin: field ${field}, «${answer}», focus ${focus}`);
    } finally { await o.close(); }
    return !results.length || results.join("; ");
  });

test("Undo says so when the answer it would take back has changed since, and the answer of the last open card keeps its Undo",
  "Undo claimed «undone» while it restored nothing, and moving on from the last card replaced the toast that carried Undo",
  async () => {
    const o = await open(THEMED_URL + "#decisions/f1"), page = o.page;
    try {
      await page.keyboard.press("f"); await settle(page);
      await page.locator('#card-f1 input[data-opt="leave"]').check(); await settle(page);
      await page.keyboard.press("u"); await settle(page);
      const superseded = { toast: await text(page, "#toast"), f1: await text(page, '#card-f1 [data-answer="f1"]') };
      await page.click('[data-sub="fact"]'); await page.click("#card-q1"); await settle(page);
      for (let i = 0; i < 3; i++) { await page.keyboard.press("o"); await page.keyboard.type("seen"); await page.keyboard.press("Control+Enter"); await settle(page); }
      const last = { toast: await text(page, "#toast"), undo: await page.locator('#toast [data-act="undo"]').count() };
      await page.keyboard.press("u"); await settle(page);
      const q5 = await statusOf(page, "q5");
      return /changed since/.test(superseded.toast) && /Leave it/.test(superseded.f1) && /^Q5: /.test(last.toast) && last.undo === 1 && q5 === "Open"
        || JSON.stringify({ superseded, last, q5 });
    } finally { await o.close(); }
  });

test("Done lists what progress counts: the decided choices and the answered requests, an answered evidence request tagged «Answered»",
  "the Done sub-tab left out answered evidence while progress counted it, two rules for one fact",
  cased(THEMED_URL + "#decisions/q1", {}, async (page) => {
    await page.keyboard.press("o"); await page.keyboard.type("seen on a phone"); await page.keyboard.press("Control+Enter"); await settle(page);
    await page.click('[data-sub="done"]'); await settle(page);
    const cards = await page.locator("#dec-list .card").evaluateAll((els) => els.map((el) => el.dataset.card));
    const tag = await text(page, '#card-q1 .compact [data-status="q1"]'), progress = await page.getAttribute("#progress > span[title]", "title");
    const counted = /Decided (\d+) of/.exec(progress), answered = /requests answered (\d+) of/.exec(progress);
    return cards.includes("q1") && tag === "Answered" && counted && answered && cards.length === +counted[1] + +answered[1] || JSON.stringify({ cards, tag, progress });
  }));

// ---- the external review of PR #106: thirteen defects the prototype had, each a case that fails on it
test("review 1: Undo takes back the one keyed answer, and a later answer to another item stays",
  "Undo restored a snapshot of all answers, so undoing F1 also wiped the later answer to I1",
  cased(THEMED_URL + "#decisions/f1", {}, async (page) => {
    await page.keyboard.press("f"); await settle(page);
    await page.locator('#card-i1 input[data-opt="take"]').check(); await settle(page);
    await page.keyboard.press("u"); await settle(page);
    const f1 = await statusOf(page, "f1"), i1 = await statusOf(page, "i1"), progress = await text(page, "#progress");
    return f1 === "Open" && i1 === "Decided" && /Decided 1 of 5/.test(progress) || `after Undo: F1 ${f1}, I1 ${i1}, ${progress}`;
  }));

test("review 2: no report key acts while a dialog is open",
  "with the keys help open, «1» decided the selected item behind it",
  cased(THEMED_URL + "#decisions/q3", {}, async (page) => {
    await page.keyboard.press("?"); await settle(page);
    await page.keyboard.press("1"); await page.keyboard.press("j"); await settle(page);
    const open = await page.evaluate(() => document.querySelector("#keys-dialog").open);
    await page.keyboard.press("Escape"); await settle(page);
    return open && await statusOf(page, "q3") === "Open" && /decisions\/q3$/.test(page.url()) || "a key acted behind the dialog";
  }));

test("review 3: «v» marks the file just chosen in the tree, not the file of an earlier selected block",
  "file actions went to the previously selected block's file",
  cased(THEMED_URL + "#code/b2", {}, async (page) => {
    await page.waitForTimeout(400);
    await page.click('#tree [data-act="gofile"][data-f="2"]'); await page.waitForTimeout(500);
    await page.keyboard.press("v"); await settle(page);
    const viewed = await page.evaluate(() => [...document.querySelectorAll('#files [data-act="viewed"]')].filter((i) => i.checked).map((i) => i.dataset.f));
    return viewed.join() === "2" || `viewed files: ${viewed.join() || "none"}`;
  }));

test("review 4: a variant clicked right after typing an own answer wins, with its radio alone checked",
  "a fast click after typing could be lost, or leave the own answer in effect under a checked variant",
  cased(THEMED_URL + "#decisions/q3", {}, async (page) => {
    await page.locator('#card-q3 input[data-act="pick"][data-opt=""]').click();
    await page.locator('#card-q3 textarea[data-act="text"]').pressSequentially("my own way");
    await page.locator('#card-q3 input[data-opt="status-quo"]').click(); await settle(page);
    const checked = await page.evaluate(() => [...document.querySelectorAll('#card-q3 input[data-act="pick"]')].filter((i) => i.checked).map((i) => i.dataset.opt));
    const answer = await text(page, '#card-q3 [data-answer="q3"]'), item = (await payload(page)).items.find((x) => x.item === "q3");
    return checked.join() === "status-quo" && /Keep the conversion in the reader/.test(answer) && item.variant?.id === "status-quo" && item.text === undefined && !(await page.locator('#card-q3 textarea[data-act="text"]').count())
      || `checked ${checked.join()}; «${answer}»; ${JSON.stringify(item)}`;
  }));

test("review 5: a sub-tab that hides the selected card clears the selection, its panel, its address and its keys",
  "the hidden Q3 stayed selected in the URL and the panel, and «o» toasted that it was brought into view",
  cased(THEMED_URL + "#decisions/q3", {}, async (page) => {
    await page.click('[data-sub="finding"]'); await settle(page);
    await page.keyboard.press("o"); await settle(page);
    const toast = await page.locator("#toast").count() ? await text(page, "#toast") : "";
    const hash = new URL(page.url()).hash;
    return !/q3/.test(hash) && !/Q3/.test(await text(page, "#ctx-decisions")) && !/Q3/.test(toast) || `address ${hash}, toast «${toast}»`;
  }));

test("review 6: a filtered list drops a card once the action that took it out is done",
  "Clear in Done left an open card under «Done 0», and Undo defer one under «Deferred 0»",
  cased(THEMED_URL + "#decisions/f1", {}, async (page) => {
    await page.keyboard.press("f"); await settle(page);
    await page.click('[data-sub="done"]'); await settle(page);
    await page.click('#card-f1 [data-act="clear"]'); await settle(page);
    const done = { cards: await page.locator("#dec-list .card").count(), count: await text(page, '[data-subcount="done"]') };
    await page.click('[data-sub="all"]'); await page.click('#card-f2 [data-act="defer"]');
    await page.locator('#card-f2 textarea[data-act="reason"]').fill("after the release"); await page.click('#card-f2 [data-act="defer-save"]');
    await page.click('[data-sub="deferred"]'); await settle(page);
    const compact = page.locator('#card-f2 [data-act="selcard"]');
    if (await compact.isVisible()) await compact.click();
    await page.click('#card-f2 [data-act="undefer"]'); await settle(page);
    const deferred = { cards: await page.locator("#dec-list .card").count(), count: await text(page, '[data-subcount="deferred"]') };
    return done.cards === 0 && done.count === "0" && deferred.cards === 0 && deferred.count === "0" || `Done ${JSON.stringify(done)}, Deferred ${JSON.stringify(deferred)}`;
  }));

test("review 7: the newest explicit choice wins over an older filter that would hide it",
  "after the kept-blocks filter from Coverage, R1's «Show in Code» landed with «Any requirement»",
  cased(THEMED_URL + "#details/coverage", {}, async (page) => {
    await page.click('[data-act="set-code"][data-set="assumed"]'); await page.waitForTimeout(400);
    await page.goto(THEMED_URL + "#summary/r1"); await page.waitForSelector(".tabbar"); await settle(page);
    await page.click('#ctx-summary [data-act="req-code"]'); await page.waitForTimeout(500);
    const req = await page.getAttribute('#req-pop [aria-pressed="true"]', "data-req"), tokens = await text(page, "#unit-token").catch(() => "");
    return req === "1" && !/Kept/.test(tokens) && /code\/b2/.test(page.url()) || `requirement «${req}», tokens «${tokens}», ${page.url()}`;
  }));

test("review 8: a file's header and tree mark count a deferred item as deferred, never as decided",
  "the header read «1 decision decided» for a deferred finding",
  cased(THEMED_URL + "#decisions/f1", {}, async (page) => {
    await page.click('#card-f1 [data-act="defer"]'); await page.locator('#card-f1 textarea[data-act="reason"]').fill("later");
    await page.click('#card-f1 [data-act="defer-save"]');
    await page.keyboard.press("g"); await page.keyboard.press("c"); await page.click('[data-act="mode"][data-mode="all"]'); await page.waitForTimeout(300);
    const header = await text(page, "#file-1 .meta"), mark = await page.getAttribute('#tree [data-f="1"] .mark', "title");
    return /1 deferred/.test(header) && !/decided/.test(header) && /deferred/.test(mark) && !/decided/.test(mark) || `header «${header}», mark «${mark}»`;
  }));

test("review 9: an entered answer stays «Answered», unverified, in its compact row and in progress, and a child answered under an open parent says it waits",
  "an evidence answer read «Decided», and the waiting-for-parent indication was gone",
  cased(THEMED_URL + "#decisions/q2", {}, async (page) => {
    await page.keyboard.press("o"); await page.keyboard.type("the display reads it"); await page.keyboard.press("Control+Enter"); await settle(page);
    const tag = await statusOf(page, "q2"), compact = await text(page, '#card-q2 [data-compact-answer="q2"]'), progress = await page.getAttribute("#progress > span[title]", "title");
    await page.locator('#card-q4 input[data-opt="narrow"]').check(); await settle(page);
    const waiting = await text(page, '#card-q4 [data-waiting="q4"]');
    return tag === "Answered" && /not verified/.test(compact) && /requests answered 1 of 3, not verified/.test(progress) && /Depends on Q3, still open/.test(waiting)
      || `tag ${tag}; compact «${compact}»; progress «${progress}»; waiting «${waiting}»`;
  }));

test("review 10: the Summary's verdict bar and its legend are in one unit, or both are labelled",
  "the bar measured lines while the legend counted blocks",
  cased(THEMED_URL, {}, async (page) => {
    const legend = await text(page, ".statrow .legend");
    return /keep 1 block, 3 lines/.test(legend) && /fix 1 block, 8 lines/.test(legend) && /question 1 block, 13 lines/.test(legend) || `legend «${legend}»`;
  }));

test("review 11: the sticky file header sits right below the toolbar as the toolbar grows with a filter token, at 1024 px",
  "the toolbar's height was measured once, so a toolbar that wrapped after a filter token hid the file header",
  cased(BIG_URL + "#code", { viewport: { width: 1024, height: 800 } }, async (page) => {
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => document.querySelector(".toolbar").offsetHeight);
    await page.goto(BIG_URL + "#details/structure"); await page.waitForSelector(".tabbar");
    await page.click('#det-body [data-act="unit-code"]'); await page.waitForTimeout(500);
    // a file well down the page, scrolled to 60 px above the toolbar's bottom: its header sticks right there
    const r = await page.evaluate(() => {
      const bar = document.querySelector(".toolbar"), file = document.querySelectorAll("#files .file")[3];
      window.scrollBy(0, file.getBoundingClientRect().top - bar.getBoundingClientRect().bottom + 60);
      return { grew: bar.offsetHeight, head: file.querySelector(".fh").getBoundingClientRect().top, bottom: bar.getBoundingClientRect().bottom };
    });
    return r.grew > before && Math.abs(r.head - r.bottom) <= 1 || JSON.stringify({ before, ...r });
  }));

test("review 12: the keys help opens at its top, and the sub-tabs at 1024 px show every tab",
  "the help opened scrolled to its Close button, and clipped sub-tabs had no visible way on",
  cased(THEMED_URL + "#decisions", { viewport: { width: 1024, height: 600 } }, async (page) => {
    await page.keyboard.press("?"); await settle(page);
    const help = await page.evaluate(() => { const d = document.querySelector("#keys-dialog"); return { top: d.scrollTop, focus: document.activeElement.id }; });
    await page.keyboard.press("Escape");
    const tabs = await page.evaluate(() => { const seg = document.querySelector("#dec-seg"), box = seg.getBoundingClientRect();
      return { clipped: seg.scrollWidth > seg.clientWidth + 1, outside: [...seg.children].filter((b) => b.getBoundingClientRect().right > box.right + 1).length }; });
    return help.top === 0 && help.focus === "keys-h" && !tabs.clipped && !tabs.outside || JSON.stringify({ help, tabs });
  }));

test("review 14: one paragraph editor at a time — opening another keeps the first one's text as its draft — and Save stores the text of the editor it belongs to",
  "with two editors open, Save gave the second paragraph the first editor's text and lost the second's",
  cased(THEMED_URL + "#decisions/f2", {}, async (page) => {
    await page.locator('#card-f2 [data-anchor="f2/what"] .pc-btn').click({ force: true }); await page.locator(".pc-input").first().fill("on what");
    await page.locator('#card-f2 [data-anchor="f2/fix"] .pc-btn').click({ force: true }); await settle(page);
    const open = await page.locator(".pc-input").evaluateAll((els) => [...new Set(els.map((el) => el.dataset.anchor))]);
    await page.locator('#card-f2 [data-anchor="f2/fix"] .pc-input').fill("on the fix"); await page.locator('#card-f2 [data-anchor="f2/fix"] [data-act="pc-save"]').click(); await settle(page);
    const saved = Object.fromEntries((await payload(page)).paragraphComments.map((x) => [`${x.item}/${x.field}`, x.text]));
    await page.locator('#card-f2 [data-anchor="f2/what"] [data-act="pc-open"]').first().click({ force: true }); await settle(page);
    const draft = await page.locator('#card-f2 [data-anchor="f2/what"] .pc-input').inputValue();
    return open.join() === "f2/fix" && saved["f2/fix"] === "on the fix" && !("f2/what" in saved) && draft === "on what" || JSON.stringify({ open, saved, draft });
  }));

test("review 15: an own answer typed just before a reload is the answer after it",
  "the answer was written 120 ms after the last keystroke, so a reload at once brought back the previous one",
  cased(THEMED_URL + "#decisions/q2", {}, async (page) => {
    const field = page.locator('#card-q2 textarea[data-act="text"]');
    await field.fill("the earlier answer"); await field.blur(); await settle(page);
    await page.evaluate(() => { const t = document.querySelector('#card-q2 textarea[data-act="text"]'); t.focus(); t.value = "the latest answer"; t.dispatchEvent(new Event("input", { bubbles: true })); location.reload(); });
    await page.waitForSelector(".tabbar"); await settle(page);
    const q2 = (await payload(page)).items.find((x) => x.item === "q2");
    return q2.text === "the latest answer" || JSON.stringify(q2);
  }));

test("review 16: a recorded place is copied as recorded — its side, its line and that side's revision",
  "«src/invoices/archive.js:2 (base)» was copied as the head's line 3",
  cased(BASE_URL + "#decisions/i1", { init: () => { Object.defineProperty(navigator, "clipboard", { value: { writeText: (t) => { window.copied = t; return Promise.resolve(); } } }); } }, async (page) => {
    await page.locator('#ctx-decisions .excerpt:not([data-ex]) .ex-more button', { hasText: "Copy" }).click(); await settle(page);
    const copied = await page.evaluate(() => window.copied);
    return copied === "src/invoices/archive.js:2 (base HEAD~1)" || `copied «${copied}»`;
  }));

test("review 17: the text export says which parent a deferred child waits for, as the JSON does",
  "a deferred child's row dropped its parent condition from the text",
  cased(THEMED_URL + "#decisions/q4", {}, async (page) => {
    await page.click('#card-q4 [data-act="defer"]'); await page.locator('#card-q4 textarea[data-act="reason"]').fill("after the release"); await page.click('#card-q4 [data-act="defer-save"]'); await settle(page);
    const q4 = (await payload(page)).items.find((x) => x.item === "q4"), t = await exported(page);
    return q4.waiting_for_parent === "q3" && /Q4: after the release · conditional on Q3, which is still open/.test(t) || JSON.stringify({ q4, line: t.split("\n").find((l) => l.includes("Q4")) });
  }));

test("review 18: an address that opens Comments clears the selected card from the panel and the keys, as the sub-tab does",
  "#decisions/f1 then #decisions/comments kept «Context for F1», and «f» answered it «in view»",
  cased(THEMED_URL + "#decisions/f1", {}, async (page) => {
    await page.evaluate(() => { location.hash = "#decisions/comments"; }); await page.waitForTimeout(200); await settle(page);
    const panel = await text(page, "#ctx-decisions");
    await page.keyboard.press("f"); await settle(page);
    const toast = await page.locator("#toast").isVisible() ? await text(page, "#toast") : "", f1 = (await payload(page)).items.find((x) => x.item === "f1");
    return !/F1/.test(panel) && !/F1/.test(toast) && f1.status === "open" || JSON.stringify({ panel: panel.slice(0, 80), toast, f1: f1.status });
  }));

test("review 13: Back returns from a cross-entity jump, and j steps leave no history",
  "every place replaced the address, so Back left the page",
  cased(THEMED_URL + "#decisions/f1", {}, async (page) => {
    await page.click('#card-f1 [data-act="item-code"]'); await page.waitForTimeout(400);
    const there = page.url();
    await page.keyboard.press("j"); await page.waitForTimeout(300); await page.keyboard.press("k"); await page.waitForTimeout(300);
    await page.goBack(); await page.waitForTimeout(300);
    return /code\/b2$/.test(there) && /decisions\/f1$/.test(page.url()) && await page.getAttribute("#tab-decisions", "aria-selected") === "true" || `${there} → back → ${page.url()}`;
  }));

// ---- the feedback on PR #108: each a case that fails on 0.43.0
test("feedback 3: an answer to an evidence request is not a decision: «Decided» counts the choices, and the requests are counted apart, unverified, wherever progress is said",
  "«not checked yet» typed as an evidence answer was counted in «Decided»",
  cased(THEMED_URL + "#decisions/q1", {}, async (page) => {
    await page.keyboard.press("o"); await page.keyboard.type("not checked yet"); await page.keyboard.press("Control+Enter"); await settle(page);
    // the themed record's choices: Q3, Q4 (while Q3 is open), F1, F2 and I1; its requests: Q1, Q2 and Q5
    const said = { bar: await page.getAttribute("#progress > span[title]", "title"), export: (await exported(page)).split("\n").find((l) => /Decided/.test(l)) ?? "" };
    await page.keyboard.press("g"); await page.keyboard.press("s"); await settle(page); said.summary = await text(page, "#sum-progress");
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint"))); said.print = await text(page, "#print .static header p:last-child");
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    const wrong = Object.entries(said).filter(([where, t]) => !(where === "summary" ? /^0 of 5 decided/.test(t) : /Decided 0 of 5/.test(t)) || !/requests answered 1 of 3, not verified/.test(t));
    await page.keyboard.press("g"); await page.keyboard.press("d"); await settle(page);
    const note = await text(page, "#dec-note");
    if (!/0 decided · 1 answered/.test(note)) wrong.push(["note", note]);
    // the bar itself is short: the choices decided, and the rest in its title
    const bar = await text(page, "#progress");
    return !wrong.length && /^Decided 0 of 5 · Files viewed/.test(bar) || JSON.stringify({ ...said, shown: bar });
  }));

test("feedback 3: at 1024 px the top bar fits on every tab, in English and in Russian, before and after a request is answered",
  "the requests' count made the bar's progress so long that the whole page scrolled sideways",
  async () => {
    const out = [];
    for (const url of [THEMED_URL, RU_URL]) {
      const o = await open(url + "#decisions/q1", { viewport: { width: 1024, height: 800 } });
      try {
        const wide = async (when) => { for (const tab of ["summary", "decisions", "code", "details"]) {
          await o.page.click(`#tab-${tab}`); await settle(o.page);
          const m = await o.page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
          if (m[0] > m[1]) out.push({ url: url.slice(-20), when, tab, m });
        } };
        await wide("unanswered");
        await o.page.click("#tab-decisions"); await o.page.keyboard.press("o"); await o.page.keyboard.type("seen"); await o.page.keyboard.press("Control+Enter"); await settle(o.page);
        await wide("answered");
      } finally { await o.close(); }
    }
    return !out.length || JSON.stringify(out);
  });

// The themed record with its conditional question Q4 on a block of its own, so it counts in the Code tab.
const CHILD_URL = render("child-block", (() => { const r = structuredClone(record); r.blocks[1] = { ...r.blocks[1], questions: [4] }; return r; })());
test("the Code tab's open count follows a parent's answer that restores a conditional question, as a fresh load counts it",
  "the badge was counted from the walk before the walk was rebuilt, so it kept the count from before the answer",
  cased(CHILD_URL + "#decisions", {}, async (page) => {
    await page.locator('#card-q3 input[data-opt="status-quo"]').check(); await settle(page);
    await page.click("#tab-summary"); await settle(page); await page.click("#tab-decisions"); await settle(page);
    await page.locator('#card-q3 input[data-opt="extend"]').check(); await settle(page);
    const live = await text(page, "#badge-code");
    await page.reload(); await page.waitForSelector(".tabbar"); await settle(page);
    const fresh = await text(page, "#badge-code");
    return live === fresh || `live ${live}, after a reload ${fresh}`;
  }));

test("feedback 4: Esc closes the purpose menu and says so to assistive technology, as a click outside it does",
  "Esc hid the menu and left aria-expanded true",
  cased(THEMED_URL + "#code", {}, async (page) => {
    await page.click("#purpose-btn"); const opened = await page.getAttribute("#purpose-btn", "aria-expanded");
    await page.keyboard.press("Escape");
    const hidden = await page.locator("#purpose-pop .pop-menu").isHidden(), after = await page.getAttribute("#purpose-btn", "aria-expanded");
    return opened === "true" && hidden && after === "false" || JSON.stringify({ opened, hidden, after });
  }));

test("feedback 1: every group heading counts the open cards listed under it, after a parent's answer retires its child",
  "the heading kept the open count from before the answer, while the sub-tab's count moved",
  cased(THEMED_URL + "#decisions", {}, async (page) => {
    await page.locator('#card-q3 input[data-opt="status-quo"]').check(); await settle(page);
    const groups = await page.evaluate(() => [...document.querySelectorAll("#dec-list h2.group-h")].map((h) => {
      const cards = [...h.nextElementSibling.querySelectorAll(".card")];
      return { heading: h.textContent.replace(/\s+/g, " ").trim(), open: cards.filter((c) => c.querySelector(`[data-status="${c.dataset.card}"]`)?.textContent.trim() === "Open").length };
    }));
    const wrong = groups.filter((g) => +(/(\d+) open/.exec(g.heading)?.[1] ?? NaN) !== g.open);
    return groups.length && !wrong.length || JSON.stringify(groups);
  }));

test("feedback 2: under a filter, a question's note in the code says how many blocks one answer covers in all and how many the filter shows",
  "the note counted only the blocks the filter left, so one answer seemed to cover less than it does",
  cased(BIG_URL + "#code", {}, async (page) => {
    await page.fill("#file-q", "part7.js"); await page.waitForTimeout(400);
    const all = big.blocks.filter((b) => b.questions?.includes(1)).length, shown = big.blocks.filter((b) => b.questions?.includes(1) && b.path.endsWith("part7.js")).length;
    const note = await text(page, '.note-item[data-item="q1"] .pills');
    return shown < all && note.includes(`all ${all} blocks`) && note.includes(`${shown} shown`) || `all ${all}, shown ${shown}: «${note}»`;
  }));

test("feedback 5: saved data the page cannot read is never written over unasked: the first save shows it to copy, and only an explicit choice saves over it",
  "the next answer replaced the unreadable data and cleared the warning, with no confirmation and no copy",
  cased(THEMED_URL + "#decisions/f1", { init: () => {
    const get = Storage.prototype.getItem, set = Storage.prototype.setItem; window.__writes = [];
    Storage.prototype.getItem = function (key) { return key.startsWith("review-report:") && !window.__writes.length ? "{broken" : get.call(this, key); };
    Storage.prototype.setItem = function (key, value) { if (key.startsWith("review-report:")) window.__writes.push(value); return set.call(this, key, value); };
  } }, async (page) => {
    const writes = () => page.evaluate(() => window.__writes.length);
    const shown = await page.locator("#storage").isVisible();
    await page.keyboard.press("f"); await settle(page);
    const dialog = await page.locator("#unreadable-dialog").evaluate((d) => d.open), raw = await page.locator("#unreadable-text").inputValue(), afterAnswer = await writes();
    await page.keyboard.press("Escape"); await settle(page);
    const status = await statusOf(page, "f1"), still = await page.locator("#storage").isVisible(), afterClose = await writes();
    await page.click('#storage [data-act="unreadable-show"]'); await page.click('[data-act="unreadable-replace"]'); await settle(page);
    const saved = await page.evaluate(() => window.__writes.at(-1)), gone = await page.locator("#storage").isHidden();
    return shown && dialog && raw === "{broken" && afterAnswer === 0 && afterClose === 0 && status === "Decided" && still && /"f1"/.test(saved ?? "") && gone
      || JSON.stringify({ shown, dialog, raw, afterAnswer, afterClose, status, still, saved, gone });
  }));

test("feedback 5: while saved data cannot be read, typing is never cut off, the page says the answers are only in its memory, the dialog comes once and leaving asks first",
  "the dialog opened after the first typed letter and swallowed the rest; the wording, the warning on leaving and the single offer were untested",
  async () => {
    const o = await open(THEMED_URL + "#decisions/q1", { init: () => {
      const get = Storage.prototype.getItem;
      Storage.prototype.getItem = function (key) { return key.startsWith("review-report:") ? "{broken" : get.call(this, key); };
    } });
    try {
      const page = o.page, isOpen = () => page.locator("#unreadable-dialog").evaluate((d) => d.open);
      await page.keyboard.press("o");
      for (const ch of "not checked yet") { await page.keyboard.type(ch); await page.waitForTimeout(150); }
      const whileTyping = await isOpen();
      await page.keyboard.press("Control+Enter"); await page.waitForTimeout(200);
      const afterLeaving = await isOpen(), answer = await text(page, '#card-q1 [data-answer="q1"]');
      await page.keyboard.press("Escape"); await settle(page);
      const focus = await page.evaluate(() => document.activeElement?.tagName);
      await page.locator('#card-q3 input[data-opt="status-quo"]').check(); await page.waitForTimeout(200);
      const again = await isOpen(), memory = await text(page, "#dec-note");
      let asked = false;
      page.on("dialog", async (d) => { asked = d.type() === "beforeunload"; await d.dismiss(); });
      await page.close({ runBeforeUnload: true }); await new Promise((r) => setTimeout(r, 500));
      return !whileTyping && afterLeaving && /not checked yet/.test(answer) && focus !== "BODY" && !again && /only in this page's memory/.test(memory) && asked
        || JSON.stringify({ whileTyping, afterLeaving, answer, focus, again, memory, asked });
    } finally { await o.close(); }
  });

test("feedback 6: with JavaScript a long path in a card's text wraps too, and no tab scrolls sideways on a desktop viewport",
  "a long path as code in a finding widened Decisions at 1280 px",
  async () => {
    const out = [];
    for (const width of [1440, 1280, 1024]) {
      const o = await open(LONG_URL + "#decisions", { viewport: { width, height: 900 } });
      try { for (const tab of ["summary", "decisions", "code", "details"]) {
        await o.page.click(`#tab-${tab}`); await settle(o.page);
        const m = await o.page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        if (m[0] > m[1]) out.push({ width, tab, m });
      } } finally { await o.close(); }
    }
    return !out.length || JSON.stringify(out);
  });

test("feedback 6: without JavaScript a path longer than the window wraps, and the document does not scroll sideways",
  "a long path widened the whole document on a desktop viewport",
  async () => {
    const out = {};
    for (const width of [1440, 1024]) {
      const o = await open(LONG_URL, { js: false, viewport: { width, height: 900 } });
      try { out[width] = await o.page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth })); }
      finally { await o.close(); }
    }
    return Object.values(out).every((m) => m.scroll <= m.client) || JSON.stringify(out);
  });

test("feedback 6: without JavaScript a file's long path wraps in its header, and ordinary words in tables stay whole",
  "the path was clipped in the file's header, and wrapping anywhere broke words such as «readArchive» in the units table",
  async () => {
    const out = {};
    const o = await open(LONG_URL, { js: false, viewport: { width: 1024, height: 900 } });
    try { out.header = await o.page.evaluate(() => { const h = document.querySelector(".sfile h3"); return [h.scrollWidth, h.clientWidth]; }); }
    finally { await o.close(); }
    for (const [name, url] of [["en", THEMED_URL], ["ru", RU_URL]]) {
      const p = await open(url, { js: false, viewport: { width: 1024, height: 900 } });
      try {
        // every occurrence in a table is one box on one line
        out[name] = await p.page.evaluate((words) => words.map((word) => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), boxes = [];
          for (let t = walker.nextNode(); t; t = walker.nextNode()) {
            if (!t.parentElement.closest("table")) continue;
            for (let i = t.data.indexOf(word); i >= 0; i = t.data.indexOf(word, i + 1)) {
              const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + word.length); boxes.push(r.getClientRects().length);
            }
          }
          return [word, boxes];
        }), ["readArchive", name === "ru" ? "Обязанности" : "Jobs"]);
      } finally { await p.close(); }
    }
    return out.header[0] <= out.header[1] && [...out.en, ...out.ru].every(([, boxes]) => boxes.length && boxes.every((k) => k === 1)) || JSON.stringify(out);
  });

// ---- a decision whose variants combine
// The themed record with Q3's variants combining, recommended together, the only open item of block B3: Q4 applies
// while «extend» is among those chosen.
const MULTI = (() => {
  const r = structuredClone(record); r.questions[2].multiple = true; r.blocks[2].questions = [3];
  r.questions[2].recommendation = { ...r.questions[2].recommendation, variant: undefined, variants: ["status-quo", "extend"] };
  return r;
})();
const MULTI_URL = render("multiple", MULTI);
test("a decision whose variants combine takes several: checkboxes on the card and in the code, its child applies while a listed variant is among them, and the export names them all",
  "a decision could take one variant only, so a combination had to be written in the owner's own words",
  cased(MULTI_URL + "#code/b3", {}, async (page) => {
    await settle(page);
    const pills = await page.locator('#panel-code [data-choice="q3"] [data-act="pick"]:not([data-opt=""])').evaluateAll((els) => els.map((el) => el.getAttribute("role")));
    const codeHint = await text(page, '#panel-code [data-choice="q3"]');
    // in the code's margin the note stays after the first variant, so a second can be taken there too
    await page.click('#panel-code [data-choice="q3"] [data-opt="status-quo"]'); await settle(page);
    await page.click('#panel-code [data-choice="q3"] [data-opt="extend"]', { timeout: 3000 }); await settle(page);
    const codeAnswer = await page.evaluate(() => [...document.querySelectorAll('[data-answer="q3"]')].map((el) => el.textContent).join("|"));
    await page.evaluate(() => localStorage.clear());
    await page.goto(MULTI_URL + "#decisions/q3"); await page.waitForSelector(".tabbar"); await settle(page);
    const boxes = await page.locator('#card-q3 input[data-act="pick"]:not([data-opt=""])').evaluateAll((els) => els.map((el) => el.type));
    const group = await page.getAttribute("#card-q3 .opts", "role"), recs = await page.locator("#card-q3 .opts .rec-mark").count();
    const hint = await text(page, "#card-q3 .choice");
    await page.locator('#card-q3 input[data-opt="status-quo"]').check(); await settle(page);
    await page.locator('#card-q3 input[data-opt="extend"]').check(); await settle(page);
    const both = { q3: await statusOf(page, "q3"), answer: await text(page, '#card-q3 [data-answer="q3"]'), q4: await statusOf(page, "q4") };
    await page.locator('#card-q3 input[data-opt="extend"]').uncheck(); await settle(page);
    const one = { q4: await statusOf(page, "q4"), answer: await text(page, '#card-q3 [data-answer="q3"]') };
    await page.locator('#card-q3 input[data-opt="extend"]').check(); await settle(page);
    const data = await payload(page), q3 = data.items.find((x) => x.item === "q3"), said = (await exported(page)).split("\n").find((l) => /^- Q3/.test(l)) ?? "";
    const ok = boxes.length === 2 && boxes.every((t) => t === "checkbox") && /One or more may be chosen/.test(hint) && group === "group" && recs === 2
      && /One or more may be chosen/.test(codeHint)
      && both.q3 === "Decided" && /Keep the conversion in the reader, Move it to a display unit/.test(both.answer) && both.q4 === "Open"
      && one.q4 === "Not applicable" && !/Move it/.test(one.answer)
      && JSON.stringify(q3.variants?.map((v) => v.id)) === '["status-quo","extend"]' && q3.variant === undefined
      && /Keep the conversion in the reader, Move it to a display unit/.test(said)
      && pills.length === 2 && pills.every((role) => role === "checkbox") && /Keep the conversion in the reader, Move it to a display unit/.test(codeAnswer);
    return ok || JSON.stringify({ said, pills, codeHint: codeHint.slice(0, 60), codeAnswer, boxes, group, recs, hint: hint.slice(0, 60), both, one, q3 });
  }));

test("Enter on a decision whose variants combine opens its answer, as on any card",
  "Enter looked for a radio only, so a card of checkboxes kept the focus",
  cased(MULTI_URL + "#decisions/q3", {}, async (page) => {
    await page.locator("#card-q3").focus(); await page.keyboard.press("Enter"); await settle(page);
    const focus = await page.evaluate(() => [document.activeElement?.tagName, document.activeElement?.type, document.activeElement?.closest("article")?.id]);
    return focus[0] === "INPUT" && focus[1] === "checkbox" && focus[2] === "card-q3" || JSON.stringify(focus);
  }));

test("an evidence request says that what is not checked yet is deferred with that reason, since an answer counts as done",
  "«not checked yet» typed as an evidence answer read as done and folded its blocks",
  cased(THEMED_URL + "#decisions/q1", {}, async (page) => {
    const evidence = await text(page, "#card-q1 .choice"), fact = await text(page, "#card-q2 .choice");
    return /not checked yet/i.test(evidence) && /defer/i.test(evidence) && !/not checked yet/i.test(fact) || JSON.stringify({ evidence: evidence.slice(0, 200), fact: fact.slice(0, 120) });
  }));

test("without JavaScript a decision whose variants combine says so, and marks each variant recommended together",
  "the document gave no sign that several variants could be taken, nor which the reviewer recommends together",
  async () => {
    const o = await open(MULTI_URL, { js: false });
    try {
      const q3 = await o.page.evaluate(() => document.querySelector('[id="decisions/q3"]').innerText);
      const marks = (q3.match(/the reviewer recommends this/g) ?? []).length;
      return /One or more may be chosen/.test(q3) && marks === 2 || JSON.stringify({ marks, q3: q3.slice(0, 300) });
    } finally { await o.close(); }
  });

// ---- record values as text
// ---- reading space and controls (PR 109: C1, C3, C4, C5)
test("the Code toolbar's controls share one height and one type size, and none is a native select",
  "buttons, the segment, the menus and the filter differed in height and type, and the selects' menus were the system's",
  cased(THEMED_URL + "#code", {}, async (page) => {
    const m = await page.evaluate(() => [...document.querySelectorAll(".toolbar > *:not(.findbar)")].filter((e) => e.getClientRects().length && e.id !== "unit-token" && e.id !== "pos")
      .map((e) => { const c = e.matches("button, input") ? e : e.querySelector("button, input"); return { h: Math.round(e.getBoundingClientRect().height), fs: getComputedStyle(c).fontSize }; }));
    const selects = await page.locator("#panel-code select").count();
    return m.length > 5 && new Set(m.map((x) => x.h)).size === 1 && new Set(m.map((x) => x.fs)).size === 1 && !selects || JSON.stringify({ m, selects });
  }));

test("the requirement filter is a menu with every requirement's whole text; picking one filters the code and says so on its button",
  "a native select cut each requirement to 48 characters",
  cased(THEMED_URL + "#code", {}, async (page) => {
    await page.click("#req-btn");
    const items = await page.locator('#req-pop [data-act="req-pick"]').allInnerTexts(), whole = items.some((t) => t.includes(record.requirements[0].text));
    await page.locator('#req-pop [data-act="req-pick"][data-req="1"]').click(); await settle(page);
    const btn = await text(page, "#req-btn"), open = await page.locator("#req-pop .pop-menu").isVisible(), focused = await page.evaluate(() => document.activeElement?.id);
    await page.click("#req-btn"); await page.keyboard.press("Escape");
    const closed = !(await page.locator("#req-pop .pop-menu").isVisible()) && await page.getAttribute("#req-btn", "aria-expanded") === "false";
    await page.click("#req-btn"); await page.keyboard.press("End");
    const last = await page.evaluate(() => document.activeElement?.dataset.req);
    await page.keyboard.press("Home"); await page.keyboard.press("ArrowDown");
    const second = await page.evaluate(() => document.activeElement?.dataset.req);
    await page.locator("#file-q").focus(); await settle(page);
    const left = !(await page.locator("#req-pop .pop-menu").isVisible());
    return whole && /R1/.test(btn) && !open && focused === "req-btn" && closed && last === "3" && second === "1" && left || JSON.stringify({ items, btn, open, focused, closed, last, second, left });
  }));

test("× at the top right closes the keys, the export and the Code panel, whether a block is selected or not",
  "a text Close sat among the export's actions, and the Code panel had none while nothing was selected",
  cased(THEMED_URL + "#code", {}, async (page) => {
    const r = {};
    await page.click('[data-act="keys"]'); await page.click("#keys-dialog .x"); r.keys = await page.locator("#keys-dialog").evaluate((d) => d.open);
    await page.click('.mh-right [data-act="export"]'); await page.click("#export-dialog .x"); r.export = await page.locator("#export-dialog").evaluate((d) => d.open);
    await page.click('.toolbar [data-act="ctx"]'); await page.click("#ctx-code .x"); r.empty = await page.locator("#ctx-code").isVisible();
    await settle(page); r.focus = await page.evaluate(() => document.activeElement?.dataset.act);
    await page.goto(THEMED_URL + "#code/b2"); await page.waitForSelector(".tabbar"); await settle(page);
    await page.click('.toolbar [data-act="ctx"]'); await page.click("#ctx-code .x"); r.selected = await page.locator("#ctx-code").isVisible();
    return !r.keys && !r.export && !r.empty && !r.selected && r.focus === "ctx" || JSON.stringify(r);
  }));

test("the file tree hides from its own head and comes back from the rail beside the code, focus following",
  "the toolbar's «Files» button hid the tree, and what it did was not obvious",
  cased(THEMED_URL + "#code", {}, async (page) => {
    await page.waitForSelector('#tree [data-act="tree"]', { state: "visible" }); await page.click('#tree [data-act="tree"]'); await settle(page);
    const hidden = !(await page.locator("#tree").isVisible()) && await page.locator("#tree-rail").isVisible(), f1 = await page.evaluate(() => document.activeElement?.closest("#tree-rail") !== null);
    await page.reload(); await page.waitForSelector(".tabbar"); await settle(page);
    const kept = !(await page.locator("#tree").isVisible());
    await page.waitForSelector('#tree-rail [data-act="tree"]', { state: "visible", timeout: 5000 }).catch(() => {});
    if (!(await page.locator('#tree-rail [data-act="tree"]').isVisible())) return `after a reload the rail is not shown: tree ${await page.locator("#tree").isVisible()}`;
    await page.click('#tree-rail [data-act="tree"]'); await settle(page);
    const back = await page.locator("#tree").isVisible() && !(await page.locator("#tree-rail").isVisible()), f2 = await page.evaluate(() => document.activeElement?.closest("#tree") !== null);
    return hidden && f1 && kept && back && f2 || JSON.stringify({ hidden, f1, kept, back, f2 });
  }));

test("a long path takes one line in the tree and in the file header, the file's name whole and the full path in the title",
  "a long path took seven lines in the tree and four above the diff",
  cased(LONG_URL + "#code", {}, async (page) => {
    const m = await page.evaluate(() => {
      const row = document.querySelector('#tree [data-act="gofile"]'), path = document.querySelector(".fh .path"), name = path.querySelector("b");
      return { row: Math.round(row.getBoundingClientRect().height), path: Math.round(path.getBoundingClientRect().height), title: path.title, nameCut: name.scrollWidth > name.clientWidth,
        sideways: document.documentElement.scrollWidth > innerWidth };
    });
    return m.row < 30 && m.path < 24 && m.title === LONG_PATH && !m.nameCut && !m.sideways || JSON.stringify(m);
  }));

test("the paragraph comment control sits beside the paragraph's text, never over it",
  "the «Comment» button appeared over the end of the paragraph's first line",
  cased(THEMED_URL + "#decisions", {}, async (page) => {
    const hits = await page.evaluate(() => [...document.querySelectorAll("#panel-decisions .pc")].filter((pc) => pc.getClientRects().length).map((pc) => {
      const btn = pc.querySelector(":scope > .pc-btn"), b = btn.getBoundingClientRect(), range = document.createRange(), rects = [];
      const walker = document.createTreeWalker(pc, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.parentElement.closest(".pc-btn, .pc-x") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
      for (let n = walker.nextNode(); n; n = walker.nextNode()) { range.selectNodeContents(n); rects.push(...range.getClientRects()); }
      return rects.some((r) => r.width && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top) ? pc.dataset.anchor : null;
    }).filter(Boolean));
    return !hits.length || `over the text of ${hits.join(", ")}`;
  }));

test("the export shows the preview and its two actions; the raw text opens on request, and by itself when the clipboard refuses",
  "the raw text took a third of the dialog though it is only the fallback for a refused clipboard",
  cased(THEMED_URL + "#decisions", { init: () => { Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("no")) } }); } }, async (page) => {
    await page.click('.mh-right [data-act="export"]');
    const first = await page.locator("#export-text").isVisible();
    await page.click("#export-raw summary"); const asked = await page.locator("#export-text").isVisible();
    await page.keyboard.press("Escape"); await page.click('.mh-right [data-act="export"]');
    const again = await page.locator("#export-text").isVisible();
    await page.click('[data-act="export-copy"]'); await page.waitForTimeout(150);
    const refused = await page.evaluate(() => ({ open: document.querySelector("#export-raw").open, focus: document.activeElement?.id, selected: (() => { const t = document.querySelector("#export-text"); return t.selectionEnd - t.selectionStart === t.value.length; })() }));
    const status = await text(page, "#export-status");
    return !first && asked && !again && refused.open && refused.focus === "export-text" && refused.selected && status.length > 0 || JSON.stringify({ first, asked, again, refused, status });
  }));

// ---- requirements, pictures and recommendations (PR 109: C1, C8, C9, C10)
// The themed record with a question that asks about its requirement to confirm.
const ASKED_URL = render("asked", { ...structuredClone(record), questions: record.questions.map((q, i) => i === 1 ? { ...q, context: [{ text: "The reader converts on an assumed reading of the task.", sources: [{ ref: "/requirements/2" }] }] } : q) });
test("Summary lists the established requirements apart from those to confirm, each with its origin, the words that state it and the question that asks about it",
  "a requirement only the author or the reviewer's reading supplied looked as binding as the task's",
  cased(ASKED_URL + "#summary", {}, async (page) => {
    const heads = await page.locator("#summary-reqs + table tr.grp th").allInnerTexts();
    const r3 = await text(page, '[data-sel="req:3"]'), r1 = await text(page, '[data-sel="req:1"]');
    const order = await page.locator('#summary-reqs + table tr.selectable').evaluateAll((rows) => rows.map((r) => r.dataset.sel));
    return /^Established/.test(heads[0] ?? "") && /^To confirm/.test(heads[1] ?? "") && order.at(-1) === "req:3" && /the reviewer's reading/.test(r3) && /Asked in\s*Q2/.test(r3)
      && /Show currency codes in upper case wherever a price is shown/.test(r1) || JSON.stringify({ heads, order, r1, r3 });
  }));

test("a requirement's panel says where it is stated and shows the mockup it comes from; a finding's panel shows the pictures whose differences name it",
  "pictures sat in Details › Screens, away from the requirement or the finding they support",
  cased(THEMED_URL + "#summary/r1", {}, async (page) => {
    const stated = await text(page, "#ctx-summary"), reqPics = await page.locator("#ctx-summary .screen-box img").count();
    await page.goto(THEMED_URL + "#decisions/f1"); await page.waitForSelector(".tabbar"); await settle(page);
    const findingPics = await page.locator("#ctx-decisions .screen-box img").count(), f2Pics = await (async () => { await page.goto(THEMED_URL + "#decisions/f2"); await page.waitForSelector(".tabbar"); await settle(page); return page.locator("#ctx-decisions .screen-box").count(); })();
    return /Where it is stated/.test(stated) && /TASK-9/.test(stated) && reqPics > 0 && findingPics > 0 && f2Pics === 0 || JSON.stringify({ stated: stated.slice(0, 200), reqPics, findingPics, f2Pics });
  }));

test("a decision's recommendation names the variant it recommends, and one with no clear recommendation says so in its place",
  "the recommendation's text did not show which of the choices it meant",
  cased(THEMED_URL + "#decisions", {}, async (page) => {
    const q3 = await text(page, "#card-q3 .card-rec"), pick = await text(page, "#card-q3 .card-rec .rec-pick"), q4none = await page.locator("#card-q4 .card-rec.none").count();
    const mark = await page.locator("#card-q3 .opt .rec-mark").count();
    return pick === "Keep the conversion in the reader" && /Keep it in this change/.test(q3) && q4none === 1 && mark === 1 || JSON.stringify({ q3, pick, q4none, mark });
  }));

// ---- understanding the change (PR 109: C5, C6)
test("Summary says how the change works, one route per behaviour, and a route's panel draws its steps as a flow, each role in its box and each link on the arrow into it, a step opening its code",
  "related blocks were a set with no order, roles or connections",
  cased(THEMED_URL + "#summary", {}, async (page) => {
    const rows = await page.locator("#summary-routes + ul.routes .route-row").allInnerTexts();
    await page.click("#summary-routes + ul.routes .route-row"); await settle(page);
    const flow = await page.locator("#ctx-summary .flow > li").evaluateAll((els) => els.map((e) => `${e.className}: ${e.innerText.replace(/\s+/g, " ").trim()}`));
    const closed = await page.locator("#ctx-summary .flow .excerpt").count() + await page.locator("#ctx-summary .flow-node[aria-label]").count();
    await page.click('#ctx-summary .flow-node[data-b="3"]'); await settle(page);
    const opened = await page.locator("#ctx-summary .flow .cmap-ex .excerpt").evaluateAll((els) => els.map((e) => e.dataset.ex));
    const url = page.url();
    await page.goto(THEMED_URL + "#summary/route1"); await page.waitForSelector(".tabbar"); await settle(page);
    const linked = await page.locator('#panel-summary .route-row.sel').count();
    return rows.length === 1 && /2 steps/.test(rows[0]) && flow.length === 3 && /^flow-step: 1 B1 archive\.js/.test(flow[0]) && /^flow-via: Gets it from readArchive's return/.test(flow[1])
      && /^flow-step: 2 B3 outputs\.test\.js .*question.*Checks the three outputs/.test(flow[2]) && closed === 0 && JSON.stringify(opened) === '["3"]' && /#summary\/route1$/.test(url) && linked === 1
      || JSON.stringify({ rows, flow, closed, opened, url, linked });
  }));

test("a kept block's panel says what the record knows about it — what it does, its unit with its jobs, the requirements it serves in words and its place in a route — not a bare «Kept code»",
  "selecting kept code showed the verdict, not what the code is for",
  cased(THEMED_URL + "#code", {}, async (page) => {
    await page.click('.toolbar .seg [data-mode="all"]'); await settle(page);
    await page.goto(THEMED_URL + "#code/b1"); await page.waitForSelector(".tabbar"); await settle(page);
    if (!(await page.locator("#ctx-code").isVisible())) await page.click('.toolbar [data-act="ctx"]');
    await settle(page);
    const panel = await text(page, "#ctx-code");
    await page.click('#ctx-code [data-act="goroute"]'); await settle(page);
    const routed = await page.getAttribute("#tab-summary", "aria-selected") === "true" && await page.locator("#panel-summary .route-row.sel").count() === 1;
    return /Converts the code/.test(panel) && /About this code/.test(panel) && /readArchive/.test(panel) && /reads the archive/.test(panel) && /A requirement that fails/.test(panel)
      && /step 1 of 2/.test(panel) && !/Kept code/.test(panel) && routed || JSON.stringify({ panel: panel.slice(0, 600), routed });
  }));

test("a block's reason for one verdict shows beside the verdict: in its note in Code, in its panel, in an excerpt and in the page without JavaScript",
  "the reason a reviewer gave for one verdict over many lines reached the critic but never the owner, who reads the same lines (PR 119)",
  cased(WHOLE_URL + "#code", {}, async (page) => {
    // a kept block has no note in Code; the block to fix has
    const note = await text(page, '#note-2 .note-whole'), notes = await page.locator(".note-whole").count();
    await page.goto(WHOLE_URL + "#code/b1"); await page.waitForSelector(".tabbar"); await settle(page);
    if (!(await page.locator("#ctx-code").isVisible())) await page.click('.toolbar [data-act="ctx"]');
    await settle(page);
    const panel = await text(page, "#ctx-code");
    await page.goto(WHOLE_URL + "#summary/route1"); await page.waitForSelector(".tabbar"); await settle(page);
    await page.click('#ctx-summary [data-act="cmap"][data-b="1"]'); await settle(page);
    const excerpt = await page.locator('#ctx-summary .excerpt[data-ex="1"] .ex-whole').isVisible();
    const o = await open(WHOLE_URL, { js: false });
    // the files sit in closed sections, so their text is read whole, not as shown
    let plain; try { plain = (await o.page.evaluate(() => document.querySelector('.sfile tr.bn[id="code/b1"]')?.textContent ?? "")).replace(/\s+/g, " "); } finally { await o.close(); }
    return /^One decision ?one test$/.test(note) && panel.includes(`One decision ${WHOLE}`) && excerpt && notes === 1 && plain.includes(`One decision: ${WHOLE}`)
      || JSON.stringify({ note, panel: panel.slice(0, 400), excerpt, notes, plain });
  }));

// ---- comments on a selection (PR 109: C1, C5, C6)
// Selects characters from..to of a code line (its sign left out) or of a paragraph (its comment parts left out), then
// lifts the mouse, as a person selecting with it does.
const selectIn = (page, spec) => page.evaluate((spec) => {
  const point = (root, at, skip) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.parentElement.closest(skip) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    let pos = 0;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) { if (at <= pos + n.data.length) return [n, at - pos]; pos += n.data.length; }
    return null;
  };
  const cell = (s) => s.lk ? document.querySelector(`#files tr.r[data-lk="${s.lk}"] td.cd`) : document.querySelector(s.css);
  const skip = spec.from.lk ? ".sg" : ".pc-x, .pc-btn";
  const a = point(cell(spec.from), spec.from.at, skip), z = point(cell(spec.to), spec.to.at, spec.to.lk ? ".sg" : ".pc-x, .pc-btn");
  const r = document.createRange(); r.setStart(...a); r.setEnd(...z);
  const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
  document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  return sel.toString();
}, spec);
const marked = (page) => page.evaluate(() => (typeof CSS !== "undefined" && CSS.highlights?.get("review-comment")?.size) ?? -1);

test("selected code on one line takes a comment from «Comment» below the selection: the comment keeps its characters and words, quotes them, and marks them in place after a reload",
  "a comment could only name a whole line, so the owner had to copy the words they meant into it",
  cased(THEMED_URL + "#code", {}, async (page) => {
    await page.click('.toolbar .seg [data-mode="all"]'); await settle(page);
    const words = await selectIn(page, { from: { lk: "0:+4", at: 9 }, to: { lk: "0:+4", at: 17 } });
    await page.waitForSelector("#sel-adder:not([hidden])");
    const over = await page.evaluate(() => { const a = document.querySelector("#sel-adder").getBoundingClientRect(); return [...getSelection().getRangeAt(0).getClientRects()].some((r) => r.left < a.right && r.right > a.left && r.top < a.bottom && r.bottom > a.top); });
    await page.click("#sel-adder");
    const quoted = await text(page, "#files .lc .sel-quote");
    await page.fill("#lc-input", "why map here?"); await page.click('[data-act="lc-save"]'); await settle(page);
    const data = await payload(page), c = data.lineComments[0];
    const now = await marked(page);
    await page.reload(); await page.waitForSelector(".tabbar"); await page.click('.toolbar .seg [data-mode="all"]'); await settle(page); await page.waitForTimeout(100);
    const after = await marked(page);
    return words === "rows.map" && !over && quoted === "rows.map" && c?.line === 4 && c.from === 9 && c.to === 17 && c.quote === "rows.map" && c.end === undefined && now === 1 && after === 1
      || JSON.stringify({ words, over, quoted, c, now, after });
  }));

test("a selection over two lines of one side takes one comment drawn below its last line; across a removed and an added line, or two files, it is refused with a word",
  "a comment on a five-line expression named only its first line, and a selection across sides or files has no single place",
  cased(THEMED_URL + "#code", {}, async (page) => {
    await page.click('.toolbar .seg [data-mode="all"]'); await settle(page);
    await selectIn(page, { from: { lk: "0:+2", at: 3 }, to: { lk: "0:-3", at: 4 } });
    await page.waitForSelector("#sel-adder:not([hidden])");
    const mixed = { disabled: await page.locator("#sel-adder").isDisabled(), words: await text(page, "#sel-adder") };
    await selectIn(page, { from: { lk: "0:+4", at: 2 }, to: { lk: "1:+1", at: 3 } });
    await page.waitForSelector("#sel-adder:not([hidden])");
    const files = await page.locator("#sel-adder").isDisabled();
    await selectIn(page, { from: { lk: "0:+2", at: 3 }, to: { lk: "0:+3", at: 6 } });
    await page.waitForSelector("#sel-adder:not([disabled])");
    await page.keyboard.press("c");
    const head = await text(page, "#files .lc .lc-h");
    await page.fill("#lc-input", "both lines"); await page.click('[data-act="lc-save"]'); await settle(page);
    const c = (await payload(page)).lineComments[0], under = await page.locator('#files tr.r[data-lk="0:+3"] + tr.lc-row').count();
    return mixed.disabled && /one side/.test(mixed.words) && files && /lines 2–3/.test(head) && c?.line === 2 && c.end === 3 && c.from === 3 && c.to === 6 && under === 1
      || JSON.stringify({ mixed, files, head, c, under });
  }));

test("selected words of a paragraph take a comment that quotes them, is listed with the quote and marks them in place",
  "a paragraph comment could not say which words of a long paragraph it meant",
  cased(THEMED_URL + "#decisions", {}, async (page) => {
    const css = '#card-f2 .pc[data-anchor="f2/fix"] .pf';
    await page.locator(css).scrollIntoViewIfNeeded(); await settle(page); await page.waitForTimeout(150);
    // from the label «Proposed fix» into the field: the page's own words are no part of the field, so it is refused
    await page.evaluate(() => { const pc = document.querySelector('#card-f2 .pc[data-anchor="f2/fix"]'), r = document.createRange();
      r.setStart(pc.querySelector("b").firstChild, 0); r.setEnd(pc.querySelector(".pf").firstChild, 3);
      getSelection().removeAllRanges(); getSelection().addRange(r); document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true })); });
    await page.waitForSelector("#sel-adder:not([hidden])");
    const labelRefused = await page.locator("#sel-adder").isDisabled();
    const words = await selectIn(page, { from: { css, at: 4 }, to: { css, at: 7 } });
    await page.waitForSelector("#sel-adder:not([hidden])"); await page.click("#sel-adder");
    await page.locator(".pc-input").fill("which fix?"); await page.click('[data-act="pc-save"]'); await settle(page);
    const c = (await payload(page)).paragraphComments[0], now = await marked(page);
    await page.click('[data-sub="comments"]'); await settle(page);
    const listed = await text(page, ".cmt-list .cmt");
    return labelRefused && words === "fix" && c?.item === "f2" && c.field === "fix" && c.from === 4 && c.to === 7 && c.quote === "fix" && now === 1 && listed.includes(words) || JSON.stringify({ labelRefused, words, c, now, listed });
  }));

// A revised record whose Q3 now recommends another variant on new context: its answer is not offered back.
const REVISED_URL = render("revised", { ...structuredClone(record), title: "Where the conversion lives, revised",
  previous: { record: "../themed/review.json", sha256: createHash("sha256").update(JSON.stringify(record)).digest("hex") },
  questions: record.questions.map((q, i) => i === 2 ? { ...q, context: [{ text: "The display now converts too.", sources: [{ ref: "/blocks/0" }] }], recommendation: { ...q.recommendation, variant: "extend" } } : q) });
test("the earlier answers are offered only for items that read the same in full: a question whose context or recommendation changed gets none",
  "an answer came back on a card that now recommends the other variant, as if it read the same",
  cased(REVISED_URL + "#decisions", { init: `localStorage.setItem("review-report:6:${PREV_KEY}", JSON.stringify({ decisions: { answers: { q3: { choice: "status-quo" }, f1: { choice: "fix" } }, lines: [], paragraphs: [] } }))` }, async (page) => {
    const offer = await text(page, "#carry");
    await page.click('[data-act="carry-take"]'); await settle(page);
    const q3 = await statusOf(page, "q3"), f1 = await statusOf(page, "f1");
    return /^1 answer you gave/.test(offer) && q3 === "Open" && f1 === "Decided" || JSON.stringify({ offer, q3, f1 });
  }));

// ---- the next review of the same change (PR 109: C2, C7, C1.f)
test("a continuation offers the answers this browser kept for the previous report on the items that read the same, marks carried code, and lists replies to earlier comments",
  "each turn of the cycle lost the owner's answers and could not say what was read again; replies to comments lived only in a chat",
  cased(NEXT_URL + "#decisions", { init: `localStorage.setItem("review-report:6:${PREV_KEY}", JSON.stringify({ decisions: { answers: { q3: { choice: "status-quo" }, f1: { choice: "fix" } }, lines: [], paragraphs: [] } }))` }, async (page) => {
    const offer = await text(page, "#carry");
    // an answer given first is kept; the offer still takes the others
    await page.click('#card-f2 [data-act="pick"][data-opt="leave"]'); await settle(page);
    await page.click('[data-act="carry-take"]'); await settle(page);
    const q3 = await statusOf(page, "q3"), f1 = await statusOf(page, "f1"), f2 = await statusOf(page, "f2"), focus = await page.evaluate(() => document.activeElement?.id);
    // what the page kept, read in the page itself: a reload of a file page loses its storage now and then in headless
    // Chromium, and the reload case above covers keeping answers across one
    const again = await page.locator("#carry").isVisible();
    const kept = await page.evaluate((key) => Object.keys(JSON.parse(localStorage.getItem(key) ?? "{}").decisions?.answers ?? {}).sort().join(), `review-report:6:${NEXT_KEY}`);
    await page.click('[data-sub="comments"]'); await settle(page);
    const replies = await text(page, "#panel-decisions"), count = await text(page, '[data-subcount="comments"]');
    const showable = await page.locator('#panel-decisions .cmt [data-act="goline"]').count();
    await page.goto(NEXT_URL + "#details/coverage"); await page.waitForSelector(".tabbar"); await settle(page);
    const coverage = await text(page, "#panel-details");
    await page.goto(NEXT_URL + "#code/b1"); await page.waitForSelector(".tabbar"); await settle(page);
    if (!(await page.locator("#ctx-code").isVisible())) await page.click('.toolbar [data-act="ctx"]');
    const panel = await text(page, "#ctx-code");
    return /2 answers you gave on the previous version/.test(offer) && q3 === "Decided" && f1 === "Decided" && f2 === "Decided" && focus === "tab-decisions" && !again && kept === "f1,f2,q3"
      && /Replies to your comments on the previous review/.test(replies) && /Why convert here\?/.test(replies) && /src\/old\.js:9/.test(replies) && showable === 0 && count === "2"
      && /1 kept block was carried from the previous review/.test(coverage) && /Carried\s*from the previous review/.test(panel) || JSON.stringify({ offer, q3, f1, f2, focus, again, kept, replies: replies.slice(0, 300), count, showable, coverage: coverage.slice(0, 200), panel: panel.slice(0, 300) });
  }));

test("a hostile id or name of any kind stays text on every tab, in every panel, and in every address the page builds, which leads back to it",
  "a requirement id with a quote ran its own handler from a chip's href, and from the «more» button of its panel",
  async () => {
    const found = [], dialogs = [];
    const scan = async (page, where) => {
      const hit = await page.evaluate(() => [...document.querySelectorAll("*")].filter((el) => el.localName === "x-pwn" || [...el.attributes].some((a) => a.name.startsWith("on")))
        .map((el) => el.outerHTML.slice(0, 160)));
      if (hit.length) found.push(`${where}: ${hit[0]}`);
    };
    // each row and card that opens a panel, one after another
    const each = async (page, where, selector) => {
      for (let i = 0, n = await page.locator(selector).count(); i < Math.min(n, 30); i++) {
        // at the row's own corner, not its middle, where a link inside it would take the click to another tab
        await page.locator(selector).nth(i).click({ force: true, position: { x: 4, y: 4 } }); await settle(page); await scan(page, `${where} ${i}`);
      }
    };
    const leads = {};
    for (const url of [HOSTILE_URL, HOSTILE_PATH_URL]) {
      const o = await open(url), page = o.page;
      page.on("dialog", (d) => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
      try {
        await scan(page, "summary");
        await each(page, "summary", "#panel-summary [data-sel]");
        await page.click("#tab-decisions"); await settle(page); await each(page, "decisions", "#dec-list .card .card-head");
        await page.click("#tab-code"); await settle(page); await page.click('[data-act="mode"][data-mode="all"]'); await settle(page); await scan(page, "code");
        await each(page, "code", "#files .note");
        await page.click("#tab-details"); await settle(page);
        for (const sub of await page.locator('#panel-details [data-act="xsub"]').evaluateAll((els) => els.map((el) => el.dataset.sub))) {
          await page.click(`#panel-details [data-act="xsub"][data-sub="${sub}"]`); await settle(page); await scan(page, `details/${sub}`);
          await each(page, `details/${sub}`, "#det-body [data-sel]");
        }
        if (url === HOSTILE_URL) {
          // a requirement's chip and a scenario's source lead to them, through the address they build
          await page.goto(url + "#decisions/f1"); await page.waitForSelector(".tabbar"); await settle(page);
          await page.locator('#ctx-decisions a.chip[data-go^="r:"]').first().click(); await settle(page);
          leads.requirement = { hash: new URL(page.url()).hash, selected: await page.locator('#panel-summary [data-sel^="req:"].sel').count() };
          await page.goto(url + "#decisions/q3"); await page.waitForSelector(".tabbar"); await settle(page);
          await page.locator('#ctx-decisions a.chip[data-go^="d:scenarios"]').first().click(); await settle(page);
          leads.scenario = { hash: new URL(page.url()).hash, selected: await page.locator('#det-body [data-sel^="scen:"].sel').count() };
        }
        found.push(...o.errors.map((e) => `page error: ${e}`));
      } finally { await o.close(); }
    }
    const plain = await open(HOSTILE_URL, { js: false });
    try { await scan(plain.page, "without JavaScript"); } finally { await plain.close(); }
    return !found.length && !dialogs.length && leads.requirement?.selected === 1 && leads.scenario?.selected === 1 || JSON.stringify({ found: found.slice(0, 5), dialogs, leads });
  });

test("a requirement's code is a map: its routes step by step, then its other blocks by unit, those needing attention first, each row opening its excerpt in place, one at a time",
  "a requirement linked to many blocks showed a long stack of excerpts with no sign of which mattered or what role each played",
  cased(THEMED_URL + "#summary/r1", {}, async (page) => {
    const head = await text(page, "#ctx-summary .psec:last-child h3");
    if (!/2 blocks · 2 need attention/.test(head)) return `the heading: ${head}`;
    const groups = await page.locator("#ctx-summary .cmap-g").evaluateAll((els) => els.map((g) => ({ head: g.querySelector(".cmap-gh").innerText, rows: [...g.querySelectorAll(".cmap-tog")].map((r) => ({ id: r.dataset.b, aside: r.classList.contains("aside"), text: r.innerText.replace(/\s+/g, " ") })) })));
    const shape = groups.map((g) => g.rows.map((r) => r.id + (r.aside ? "~" : "")).join(","));
    if (groups.length !== 2 || !/^Route/.test(groups[0].head) || shape[0] !== "1~,3" || !/route step/.test(groups[0].rows[0].text) || /route step/.test(groups[0].rows[1].text) || !/readArchive/.test(groups[1].head) || shape[1] !== "2" || !/fix/i.test(groups[1].rows[0].text)) return JSON.stringify(groups);
    if (await page.locator("#ctx-summary .excerpt").count()) return "an excerpt shows before a row is opened";
    const open = () => page.locator("#ctx-summary .cmap-ex .excerpt").evaluateAll((els) => els.map((e) => e.dataset.ex));
    await page.click('#ctx-summary .cmap-tog[data-b="2"]'); const one = await open();
    await page.click('#ctx-summary .cmap-tog[data-b="3"]'); const two = await open();
    await page.click('#ctx-summary .cmap-tog[data-b="3"]'); const none = await open();
    if (JSON.stringify([one, two, none]) !== JSON.stringify([["2"], ["3"], []])) return `opened ${JSON.stringify([one, two, none])}`;
    await page.click('#ctx-summary .cmap-gh [data-act="goroute"]'); await settle(page);
    return await page.locator('[data-sel="route:0"].sel').count() === 1 || "the route's link did not open the route";
  }));

// ---- Coverage and Report details
// A record whose coverage is prose alone: no statement breaks it down.
const PROSE_ONLY = structuredClone(record);
delete PROSE_ONLY.coverageStructured;
PROSE_ONLY.screens[1] = { ...PROSE_ONLY.screens[1], sources: [{ at: "TASK-9", quote: "the old page" }] };
const PROSE_URL = render("prose-only", PROSE_ONLY);
test("Coverage says how far the review reaches: what was not checked — a requirement's own unchecked part too — and its limits first, then what ran, then the prose; a kind no statement names is not counted as none",
  "Coverage was a wall of text that repeated Report details and did not tell what was run from what was only read",
  cased(THEMED_URL + "#details/coverage", {}, async (page) => {
    const body = await text(page, "#det-body");
    const heads = await page.locator("#det-body .section-h h2").allInnerTexts();
    const limits = await text(page, "#det-body .cov-limits"), ran = await text(page, "#det-body .cov-ran"), read = await page.locator("#det-body .cov-read").count();
    const counts = await text(page, "#det-body .cov-counts");
    if (!/How far the review's conclusions reach/.test(body) || counts !== "Ran: 1 Not checked: 2"
      || JSON.stringify(heads) !== JSON.stringify(["Not checked and limits", "Ran", "The reviewer's note"]) || !/The list was not seen on screen\./.test(limits) || !/R1 How the list draws it\./.test(limits)
      || !/1 kept block serves only requirements to confirm/.test(limits) || !/The suite ran on the working copy\. at head/.test(ran) || read !== 0
      || !/The reviewer's note What was read\./.test(body) || /Legacy keeps the old path/.test(body)) return JSON.stringify({ heads, counts, limits, ran, read, body: body.slice(0, 500) });
    await page.goto(PROSE_URL + "#details/coverage"); await page.waitForSelector(".tabbar"); await settle(page);
    const plain = await text(page, "#det-body"), only = await text(page, "#det-body .cov-counts");
    return only === "Not checked: 1" && /The reviewer's note as the reviewer wrote it, not broken down into run, read and not checked/.test(plain) && /Not checked and limits/.test(plain) || `prose only: ${only} | ${plain.slice(0, 400)}`;
  }));

test("Report details names the review a continuation continues, its date and digest, and how many blocks it carried and comments it answered",
  "the iteration history of a review was nowhere on the page",
  cased(NEXT_URL + "#details/report", {}, async (page) => {
    const body = await text(page, "#det-body");
    return /Continues “Where the conversion lives”, 2026-01-01 sha256 [0-9a-f]{64} 1 block carried · 2 replies to earlier comments/.test(body) || body.slice(0, 600);
  }));

test("the theme is an icon whose menu offers light, dark and automatic, marks the current one and names it on the button",
  "the theme was a text button cycling through modes, its next mode unknown until pressed",
  cased(THEMED_URL, {}, async (page) => {
    const label = () => page.getAttribute("#theme-btn", "aria-label");
    const first = { label: await label(), text: (await page.innerText("#theme-btn")).trim(), icon: await page.locator("#theme-btn svg").count() };
    await page.click("#theme-btn");
    const items = await page.locator('#theme-pop [data-act="theme-pick"]').evaluateAll((els) => els.map((e) => `${e.innerText.trim()}${e.getAttribute("aria-pressed") === "true" ? "*" : ""}`));
    await page.click('#theme-pop [data-theme="dark"]'); await settle(page);
    const dark = { attr: await page.evaluate(() => document.documentElement.dataset.theme), label: await label(), menu: await page.locator("#theme-pop .pop-menu").isVisible(), focus: await page.evaluate(() => document.activeElement?.id) };
    await page.click("#theme-btn"); await page.keyboard.press("Escape"); await settle(page);
    const closed = { menu: await page.locator("#theme-pop .pop-menu").isVisible(), focus: await page.evaluate(() => document.activeElement?.id) };
    return /automatic, as the system/.test(first.label) && first.text === "" && first.icon === 1 && JSON.stringify(items) === JSON.stringify(["Light", "Dark", "Automatic: as the system*"])
      && dark.attr === "dark" && /Theme: dark/.test(dark.label) && !dark.menu && dark.focus === "theme-btn" && !closed.menu && closed.focus === "theme-btn"
      || JSON.stringify({ first, items, dark, closed });
  }));

// ---- the picture viewer
const PICS_URL = render("pictures", record, diff, { "before.png": png(200, 100), "after.png": png(3000, 1500) });
test("the picture viewer fits a picture to the window, up to twice its own size, closes around it, zooms on a click on it and closes on a click outside it",
  "a small screenshot stayed small in a viewer the size of the window, and only its Close button closed it",
  cased(PICS_URL + "#details/screens", {}, async (page) => {
    const geo = () => page.evaluate(() => { const d = document.querySelector("#zoom-dialog"), img = d.querySelector("img"), s = d.querySelector(".zoom-stage"), dr = d.getBoundingClientRect(), ir = img.getBoundingClientRect();
      return { open: d.open, nw: img.naturalWidth, dw: Math.round(dr.width), dh: Math.round(dr.height), iw: Math.round(ir.width), ih: Math.round(ir.height), scroll: s.scrollWidth > s.clientWidth, cursor: img.style.cursor, vw: innerWidth, vh: innerHeight }; });
    await page.locator('#det-body [data-act="zoom"]').first().click(); await settle(page); await page.waitForTimeout(100);
    const small = await geo();
    if (small.nw !== 200 || small.iw !== 400 || small.ih !== 200 || small.dw > 600 || small.cursor !== "zoom-out") return `a small picture: ${JSON.stringify(small)}`;
    await page.click("#zoom-dialog img"); await settle(page);
    const own = await geo();
    if (own.iw !== 200 || own.cursor !== "zoom-in" || !own.open) return `a click on the picture did not show its own size: ${JSON.stringify(own)}`;
    await page.keyboard.press("ArrowRight"); await settle(page); await page.waitForTimeout(100);
    const large = await geo();
    if (large.nw !== 3000 || large.iw !== 3000 || !large.scroll || large.dw > large.vw * 0.96 + 1 || large.dh > large.vh * 0.94 + 1) return `a large picture at its size: ${JSON.stringify(large)}`;
    await page.click('[data-act="zoom-fit"]'); await settle(page);
    const fitted = await geo();
    if (fitted.iw > fitted.vw * 0.96 || fitted.dh > fitted.vh * 0.94 + 1 || fitted.scroll || fitted.cursor !== "zoom-in") return `a large picture fitted: ${JSON.stringify(fitted)}`;
    // a key on a control inside clicks it without closing the viewer; a click outside the picture closes it
    await page.focus('[data-act="zoom-full"]'); await page.keyboard.press("Enter"); await settle(page);
    if (!(await geo()).open) return "a key on a control closed the viewer";
    await page.mouse.click(5, 5); await settle(page);
    return !(await geo()).open || "a click on the backdrop left the viewer open";
  }));

test("a screen says, from the record alone, the pictures given, its match or differences, the requirements and findings it relates to and what was not compared, and the viewer's caption says the same",
  "the Screens tab showed pictures and differences without saying what they were compared with, what they relate to or what stayed unchecked",
  cased(THEMED_URL + "#details/screens", {}, async (page) => {
    const box = await text(page, "#det-body .screen-box");
    for (const want of ["Pictures Mockup, Before, After", "Outcome 2 differences", "Related to", "Not compared The empty state."])
      if (!box.includes(want)) return `the first screen lacks «${want}»: ${box}`;
    if (!(await page.locator('#det-body .screen-box').first().locator('.screen-facts [data-go="r:1"]').count()) || !(await page.locator('#det-body .screen-box').first().locator('.screen-facts [data-go="f:1"]').count())) return "the related requirement or finding is not linked";
    const second = await text(page, "#det-body .screen-box >> nth=1");
    if (!second.includes("Pictures no pictures") || /Outcome|Compared/.test(second)) return `the second screen: ${second}`;
    await page.locator('#det-body [data-act="zoom"]').first().click(); await settle(page);
    const caption = await text(page, "#zoom-caption");
    if (!caption.includes("Pictures: Mockup, Before, After") || !caption.includes("Outcome: 2 differences")) return `the caption: ${caption}`;
    await page.click('#zoom-caption [data-go="r:1"]'); await settle(page); await page.waitForTimeout(100);
    const after = { open: await page.evaluate(() => document.querySelector("#zoom-dialog").open), tab: await page.getAttribute("#tab-summary", "aria-selected"), sel: await page.locator('[data-sel="req:1"].sel').count() };
    return !after.open && after.tab === "true" && after.sel === 1 || `a link in the caption: ${JSON.stringify(after)}`;
  }));

const BROKEN_URL = render("broken-picture", record, diff, { "before.png": png(200, 100), "after.png": Buffer.from("not a picture") });
test("a picture that does not load keeps no size or zoom of the picture before it",
  "after a broken picture the viewer showed the icon in the last picture's grey field with a zoom cursor that did nothing",
  cased(BROKEN_URL + "#details/screens", {}, async (page) => {
    await page.locator('#det-body [data-act="zoom"]').first().click(); await settle(page); await page.waitForTimeout(100);
    await page.keyboard.press("ArrowRight"); await settle(page); await page.waitForTimeout(150);
    const r = await page.evaluate(() => { const img = document.querySelector("#zoom-dialog img"); return { w: img.style.width, h: img.style.height, cursor: img.style.cursor, nw: img.naturalWidth }; });
    return r.nw === 0 && r.w === "" && r.h === "" && r.cursor === "default" || JSON.stringify(r);
  }));

// ---- parity with the page it replaces
test("the picture viewer fits or shows a picture at its size and steps between pictures; a screen's revision and sources show",
  "the old page's zoom viewer and the provenance of a screen that is not historical had to carry over",
  cased(THEMED_URL + "#details/screens", {}, async (page) => {
    const body = await text(page, "#det-body");
    if (!/Pictures of revision head/.test(body) || !(await page.locator('#det-body .srcs [data-go="r:1"]').count())) return "the screen's revision or source is missing";
    await page.locator('#det-body [data-act="zoom"]').first().click(); await settle(page);
    const first = await text(page, "#zoom-count");
    await page.keyboard.press("ArrowRight"); await page.click('[data-act="zoom-full"]'); await settle(page);
    const r = { first, second: await text(page, "#zoom-count"), fit: await page.locator("#zoom-dialog img.fit").count() };
    await page.keyboard.press("Escape");
    return r.first === "1 of 2" && r.second === "2 of 2" && r.fit === 0 && !(await page.evaluate(() => document.querySelector("#zoom-dialog").open)) || JSON.stringify(r);
  }));

test("an internal source names its entry as a link that opens it",
  "a source that points into the record is only useful when it can be followed",
  cased(THEMED_URL + "#decisions/q3", {}, async (page) => {
    const link = page.locator('#ctx-decisions a[href="#details/structure"]');
    if (!(await link.count())) return "the variant's source to a target unit is not a link";
    await link.first().click(); await settle(page);
    return await page.getAttribute("#tab-details", "aria-selected") === "true" && /Structure/.test(await text(page, '#panel-details [aria-selected="true"]')) || "the link did not open Details › Structure";
  }));

// ---- persistence, export, no JavaScript, print
test("answers, an own answer, a deferral, comments, «Viewed» and the theme survive a reload",
  "the owner's work must outlive the tab; it is kept under a key of the record and the stored format",
  cased(THEMED_URL + "#decisions/q3", {}, async (page) => {
    await page.locator('#card-q3 input[data-opt="extend"]').check();
    await page.locator('#card-q2 textarea[data-act="text"]').fill("the display reads it"); await page.locator('#card-q2 textarea[data-act="text"]').blur();
    await page.click('#card-f1 [data-act="defer"]'); await page.locator('#card-f1 textarea[data-act="reason"]').fill("after the release"); await page.click('#card-f1 [data-act="defer-save"]');
    await page.locator('#card-f2 [data-anchor="f2/what"] .pc-btn').click({ force: true }); await page.locator(".pc-input").fill("unclear"); await page.click('[data-act="pc-save"]');
    await page.click("#theme-btn"); await page.click('#theme-pop [data-theme="light"]');
    await page.keyboard.press("g"); await page.keyboard.press("c"); await page.waitForTimeout(300);
    await page.locator('#files [data-act="viewed"]').first().check();
    const keys = await page.evaluate(() => Object.keys(localStorage));
    await page.reload(); await page.waitForSelector(".tabbar"); await page.goto(THEMED_URL + "#decisions"); await page.waitForSelector(".tabbar"); await settle(page);
    const r = { q3: await statusOf(page, "q3"), q2: await statusOf(page, "q2"), f1: await statusOf(page, "f1"), theme: await page.evaluate(() => document.documentElement.dataset.theme), progress: await text(page, "#progress") };
    const p = await payload(page);
    return keys.length === 1 && /^review-report:6:[0-9a-f]{10}$/.test(keys[0]) && r.q3 === "Decided" && r.q2 === "Answered" && r.f1 === "Deferred" && r.theme === "light" && /Files viewed 1 of 3/.test(r.progress)
      && p.paragraphComments[0]?.text === "unclear" || JSON.stringify({ keys, r, comments: p.paragraphComments });
  }));

test("the page shows what is true of its storage: a refused save, a browser that keeps nothing, saved answers it cannot read — and the message stays while it is true",
  "answers that live only in memory must not look saved, and a warning no longer true must not stay",
  async () => {
    const seen = async (page) => ({ visible: await page.locator("#storage").isVisible(), text: (await page.locator("#storage").textContent()).trim() });
    const out = {}, errors = [];
    const visit = async (name, hash, init, act) => {
      const o = await open(THEMED_URL + hash, { init });
      try { out[name] = await seen(o.page); if (act) { await o.page.keyboard.press("f"); await settle(o.page); out[name + " then a save"] = await seen(o.page); } errors.push(...o.errors); }
      finally { await o.close(); }
    };
    await visit("refused", "#decisions/f1", () => { Storage.prototype.setItem = () => { throw new Error("refused"); }; }, true);
    await visit("blocked", "#decisions/f1", () => { Object.defineProperty(window, "localStorage", { get() { throw new DOMException("denied", "SecurityError"); } }); }, true);
    await visit("unreadable", "#decisions/f1", () => { const get = Storage.prototype.getItem; Storage.prototype.getItem = function (key) { return key.startsWith("review-report:") ? "{broken" : get.call(this, key); }; }, true);
    // JSON that is not this page's kind of object cannot be read either, at any level the page reads, nor a stored null
    await visit("not an object", "#decisions/f1", () => { const get = Storage.prototype.getItem; Storage.prototype.getItem = function (key) { return key.startsWith("review-report:") ? "[1, 2]" : get.call(this, key); }; });
    await visit("nested", "#decisions/f1", () => { const get = Storage.prototype.getItem; Storage.prototype.getItem = function (key) { return key.startsWith("review-report:") ? '{"decisions":"owner note to recover"}' : get.call(this, key); }; });
    await visit("null", "#decisions/f1", () => { const get = Storage.prototype.getItem; Storage.prototype.getItem = function (key) { return key.startsWith("review-report:") ? "null" : get.call(this, key); }; });
    const shown = (name, words) => out[name]?.visible && words.test(out[name].text);
    return !errors.length && !out.refused.visible && shown("refused then a save", /refused to save/) && shown("blocked", /keeps nothing for this page/)
      && shown("blocked then a save", /keeps nothing for this page/) && shown("unreadable", /could not be read/) && shown("unreadable then a save", /could not be read/) && shown("not an object", /could not be read/) && shown("nested", /could not be read/) && shown("null", /could not be read/)
      || JSON.stringify({ out, errors });
  });

test("where the page says the answers are kept follows the storage: in the keys, the Decisions hint and the export, only this page's memory when the browser keeps nothing",
  "with the storage refused, the hint and the keys still said the answers were kept in this browser",
  cased(THEMED_URL + "#decisions", { init: () => { Object.defineProperty(window, "localStorage", { get() { throw new DOMException("denied", "SecurityError"); } }); } }, async (page) => {
    const words = { hint: await text(page, "#dec-note") };
    await page.keyboard.press("?"); await settle(page); words.keys = await text(page, "#keys-dialog"); await page.keyboard.press("Escape");
    await page.click('[data-act="export"]'); await settle(page); words.export = await text(page, "#export-dialog .dialog-in > p"); await page.keyboard.press("Escape");
    const wrong = Object.entries(words).filter(([, w]) => /kept in this browser/.test(w) || !/this page's memory/.test(w));
    return !wrong.length || JSON.stringify(Object.fromEntries(wrong));
  }));

test("the page reads what a page of the same stored format kept: an answer, a deferral with its draft, an own answer with a marked zone, a line comment, «Viewed» and the view choices",
  "a change to what the page stores must bump the key's number; this case fails when it does not and an earlier value is misread",
  cased(THEMED_URL + "#decisions", { init: () => {
    // as entrust 0.43.0 stored it
    const kept = { decisions: { answers: { q3: { choice: "status-quo" }, f1: { deferred: true, reason: "after the release", draft: { choice: "fix" } },
      q1: { zones: { 0: true }, text: "seen on a phone" } }, lines: [{ path: "src/invoices/archive.js", side: "head", line: 2, text: "why here?" }], paragraphs: [] },
      viewed: ["test/archive.test.js"], ui: { theme: "dark", tree: true, dirsClosed: [], order: "attention" } };
    const get = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) { return key.startsWith("review-report:6:") ? JSON.stringify(kept) : get.call(this, key); };
  } }, async (page) => {
    const r = { q3: await statusOf(page, "q3"), q3answer: await text(page, '#card-q3 [data-answer="q3"]'), f1: await statusOf(page, "f1"),
      f1draft: await text(page, "#card-f1 .choice"), q1: await statusOf(page, "q1"), zone: await page.locator('#card-q1 input[data-act="zone"]').first().isChecked(),
      comments: await text(page, '[data-subcount="comments"]'), progress: await page.getAttribute("#progress > span[title]", "title"),
      viewed: await text(page, "#progress"), theme: await page.evaluate(() => document.documentElement.dataset.theme) };
    return r.q3 === "Decided" && /Keep the conversion in the reader/.test(r.q3answer) && r.f1 === "Deferred" && /after the release/.test(r.f1draft)
      && r.q1 === "Answered" && r.zone && r.comments === "1" && /Files viewed 1 of 3/.test(r.viewed) && r.theme === "dark" || JSON.stringify(r);
  }));

test("the export is one schema-8 payload behind the preview, the text and the JSON, with line and paragraph comments anchored",
  "a second builder would let the preview, the text and the file disagree; comments need anchors to travel",
  cased(THEMED_URL + "#decisions/q3", {}, async (page) => {
    await page.locator('#card-q3 input[data-opt="status-quo"]').check();
    await page.locator('#card-q3 [data-anchor="q3/text"] .pc-btn').click({ force: true }); await page.locator(".pc-input").fill("say why"); await page.click('[data-act="pc-save"]');
    await page.goto(THEMED_URL + "#code/line/0:+4"); await page.waitForSelector(".tabbar"); await page.waitForTimeout(300);
    await page.keyboard.press("c"); await page.keyboard.type("check this"); await page.keyboard.press("Control+Enter"); await settle(page);
    const p = await payload(page), t = await exported(page);
    const q3 = p.items.find((x) => x.item === "q3");
    return p.schema_version === 8 && p.diff_sha256 === record.diff.sha256 && q3.variant.id === "status-quo"
      && p.lineComments[0]?.path === "src/invoices/archive.js" && p.lineComments[0].side === "head" && p.lineComments[0].line === 4
      && p.paragraphComments[0]?.item === "q3" && p.paragraphComments[0].field === "text" && t.includes("Q3: Keep the conversion in the reader") && t.includes("check this")
      || JSON.stringify({ q3, lines: p.lineComments, paragraphs: p.paragraphComments });
  }));

test("without JavaScript the page is the whole report, the code once",
  "a reader without scripts must get the summary, every card and every file with its verdicts",
  async () => {
    const o = await open(THEMED_URL, { js: false });
    try {
      const r = await o.page.evaluate(() => ({ cards: document.querySelectorAll(".scard").length, rows: document.querySelectorAll(".sfile tr.r").length,
        verdicts: document.querySelectorAll(".sfile tr.bn").length, text: document.body.innerText }));
      return r.cards === 8 && r.rows === 27 && r.verdicts === 3 && /Keep the conversion in the reader/.test(r.text) && /Changes tried|Scenarios/.test(r.text) || JSON.stringify({ ...r, text: r.text.length });
    } finally { await o.close(); }
  });

test("the page and its document without JavaScript word each requirement's state and each unit's lines alike",
  "two renderers that each derive a fact drift apart; the model owns it, and both only word it",
  async () => {
    const doc = await open(THEMED_URL, { js: false }), live = await open(THEMED_URL + "#summary");
    try {
      // a unit's lines as «verdict count» pairs, in one order
      const pairs = (list) => list.map((s) => s.trim()).filter(Boolean).sort().join("; ");
      const written = await doc.page.evaluate(() => ({
        states: [...document.querySelectorAll("#summary tr")].filter((tr) => tr.querySelector(".sstate")).map((tr) => `${tr.cells[0].innerText} ${tr.querySelector(".sstate").innerText}`),
        shares: [...document.querySelectorAll(".sshares")].map((td) => `${td.closest("tr").cells[0].innerText}: ${td.innerText}`) }));
      const states = await live.page.evaluate(() => [...document.querySelectorAll('[data-sel^="req:"]')].map((tr) => `${tr.cells[0].innerText} ${tr.querySelector(".req-status .tag").innerText}`));
      await live.page.goto(THEMED_URL + "#details/structure"); await live.page.waitForSelector(".unit-name");
      const shares = await live.page.evaluate(() => [...document.querySelectorAll('[data-sel^="unit:"]')].map((tr) => `${tr.querySelector(".unit-name").innerText}: ${[...tr.querySelectorAll(".shares span")].map((s) => s.innerText).join(", ")}`));
      const r = { states: [written.states, states].map((x) => x.join("; ")), shares: [written.shares, shares].map((x) => x.map((row) => { const [name, list] = row.split(": "); return `${name}: ${pairs(list.split(", "))}`; }).join(" | ")) };
      return r.states[0] === r.states[1] && r.shares[0] === r.shares[1] && ["Permission", "Fails", "Met", "Not checked"].every((w) => r.states[0].includes(w)) && /fix \d+; keep \d+/.test(r.shares[0])
        || JSON.stringify(r);
    } finally { await doc.close(); await live.close(); }
  });

test("the print holds every decision whole with the owner's answer and no screen-only words, from the browser's Print or the export dialog, and Report details has no print section",
  "the print hid the variants, cut text with «…», printed screen hints, and lazily drawn files printed blank",
  cased(THEMED_URL + "#decisions/f1", {}, async (page) => {
    await page.keyboard.press("f"); await settle(page);
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    await page.emulateMedia({ media: "print" });
    const owner = await page.evaluate(() => ({ text: document.querySelector("#print").innerText, rows: document.querySelectorAll("#print tr.r").length,
      clamped: [...document.querySelectorAll("#print *")].filter((el) => !["none", ""].includes(getComputedStyle(el).webkitLineClamp)).length,
      f1: document.querySelector('#print [id="decisions/f1"]')?.innerText ?? "" }));
    await page.emulateMedia({ media: "screen" });
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    const q3 = THEMED.questions[2], must = [...q3.variants.flatMap((v) => [v.text, ...v.consequences.map((x) => x.text)]), q3.recommendation.text, LONG];
    const missing = must.filter((t) => !owner.text.includes(t)), screen = ["Show all", "See the table", "select a row", "Click a line number", "Start review", "Show in Code", "Answer here"].filter((t) => owner.text.includes(t));
    await page.goto(THEMED_URL + "#details/report"); await page.waitForSelector(".tabbar"); await settle(page);
    const section = await page.locator('#det-body [data-act="print"]').count();
    await page.evaluate(() => { window.print = () => window.dispatchEvent(new Event("beforeprint")); });
    await page.click('[data-act="export"]'); await page.click('#export-dialog [data-act="print"]'); await settle(page);
    const dialog = { open: await page.evaluate(() => document.querySelector("#export-dialog").open), f1: await page.evaluate(() => document.querySelector('#print [id="decisions/f1"]')?.innerText ?? ""), rows: await page.locator("#print tr.r").count() };
    return !missing.length && !screen.length && !owner.clamped && owner.rows === 0 && /Decided · Your answer: Fix it/.test(owner.f1) && !section && !dialog.open && /Your answer: Fix it/.test(dialog.f1) && dialog.rows === 0
      || JSON.stringify({ missing, screen, clamped: owner.clamped, rows: owner.rows, f1: owner.f1.slice(-80), section, dialog: { ...dialog, f1: dialog.f1.slice(-80) } });
  }));

test("printing with the picture viewer open prints the report, not the viewer, and the viewer is still open after",
  "the open viewer stayed in the top layer over the first printed page",
  cased(THEMED_URL + "#details/screens", {}, async (page) => {
    await page.locator('#det-body [data-act="zoom"]').first().click(); await settle(page);
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint"))); await page.emulateMedia({ media: "print" });
    const printed = await page.evaluate(() => ({ viewer: getComputedStyle(document.querySelector("#zoom-dialog")).display, backdrop: getComputedStyle(document.querySelector("#zoom-dialog"), "::backdrop").display,
      report: getComputedStyle(document.querySelector("#print")).display }));
    await page.emulateMedia({ media: "screen" }); await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    const after = await page.evaluate(() => document.querySelector("#zoom-dialog").open);
    return printed.viewer === "none" && printed.backdrop === "none" && printed.report === "block" && after || JSON.stringify({ printed, after });
  }));

test("the Russian page speaks Russian on every tab, in its toasts, dialogs, export and print and without JavaScript: no English word but the record's own",
  "every word the page writes is in both catalogs; an English literal in the runtime or the document would reach a Russian reader",
  async () => {
    // The record's words, its key names among them, and its diff's are its own; ids, digests, keys and JavaScript are names.
    const own = new Set(`${JSON.stringify(RU)}\n${diff}`.match(/[A-Za-z]{2,}/g)), english = new Map();
    const scan = (where, text) => {
      for (const word of text.replace(/\b[QFRBI]\d+\b|\b[0-9a-f]{7,64}\b|\b(Ctrl|Shift|Enter|Esc|JSON|PDF|JavaScript)\b/g, " ").match(/[A-Za-z]{2,}/g) ?? [])
        if (!own.has(word) && !english.has(word)) english.set(word, where);
    };
    // what a reader sees, hears from a screen reader, or types into
    const seen = (page) => page.evaluate(() => [document.title, document.body.innerText, document.querySelector("#toast")?.textContent ?? "",
      ...[...document.querySelectorAll("[aria-label], [title], [placeholder]")].flatMap((el) => ["aria-label", "title", "placeholder"].map((a) => el.getAttribute(a) ?? "")),
      ...[...document.querySelectorAll("textarea")].map((el) => el.value)].join("\n"));
    const o = await open(RU_URL), page = o.page, errors = [];
    try {
      const go = async (hash) => { await page.evaluate((h) => { location.hash = h; }, hash); await page.waitForTimeout(250); await settle(page); };
      for (const hash of ["summary", "decisions", "code", ...["structure", "mechanisms", "scenarios", "checks", "challenges", "screens", "coverage", "report"].map((x) => `details/${x}`)]) {
        await go(hash); scan(hash, await seen(page));
      }
      await go("details/structure"); await page.click('[data-act="sview"][data-view="graph"]'); await settle(page); scan("the units' graph", await seen(page));
      await go("decisions");
      for (const sub of await page.locator('#dec-seg [data-act="dsub"]').evaluateAll((els) => els.map((el) => el.dataset.sub))) {
        await page.click(`#dec-seg [data-sub="${sub}"]`); await settle(page); scan(`decisions/${sub}`, await seen(page));
      }
      // the toasts: a key out of view, an answer, Undo, Undo of an answer changed since
      await go("decisions/f1"); await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await settle(page);
      for (const [where, act] of [["a key out of view", () => page.keyboard.press("f")], ["a keyed answer", () => page.keyboard.press("f")], ["Undo", () => page.keyboard.press("u")],
        ["an answer changed since", async () => { await page.keyboard.press("f"); await page.locator('#card-f1 input[data-opt="leave"]').check(); await page.keyboard.press("u"); }]]) {
        await act(); await settle(page); scan(where, await seen(page));
      }
      await page.click('#card-f2 [data-act="defer"]'); await settle(page); scan("a deferral's reason", await seen(page));
      await page.keyboard.press("Escape"); await page.keyboard.press("?"); await settle(page); scan("the keys", await seen(page)); await page.keyboard.press("Escape");
      await page.click('[data-act="export"]'); await settle(page); scan("the export", await seen(page)); await page.keyboard.press("Escape");
      // the print, from the export dialog, and the theme's menu
      await page.evaluate(() => { window.print = () => window.dispatchEvent(new Event("beforeprint")); });
      await page.click('[data-act="export"]'); await page.click('#export-dialog [data-act="print"]'); await page.emulateMedia({ media: "print" });
      scan("the print", await page.evaluate(() => document.querySelector("#print").innerText));
      await page.emulateMedia({ media: "screen" }); await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
      await page.click("#theme-btn"); await settle(page); scan("the theme's menu", (await seen(page)) + " " + await page.getAttribute("#theme-btn", "aria-label")); await page.keyboard.press("Escape");
      errors.push(...o.errors);
    } finally { await o.close(); }
    const plain = await open(RU_URL, { js: false });
    try { scan("without JavaScript", await plain.page.evaluate(() => document.body.innerText)); } finally { await plain.close(); }
    return !english.size && !errors.length || `English words: ${[...english].map(([w, where]) => `${w} (${where})`).join(", ")}${errors.length ? `; page errors: ${errors.join("; ")}` : ""}`;
  });

// ---- the large record
test("the large record opens fast, keeps its DOM bounded while scrolling, lands tree clicks and finds text in files not drawn",
  "a diff of any size must stay easy to inspect: the 274-block record's page opened in about 0.2 s in the prototype",
  async () => {
    const o = await open(BIG_URL), page = o.page;
    try {
      const timing = await page.evaluate(() => Math.round(performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd));
      await page.click("#tab-code"); await page.click('[data-act="mode"][data-mode="all"]'); await page.waitForTimeout(300);
      // Each scrolled frame gives back the rows of files more than 6,000 px from the view, so once a frame has passed no
      // drawn file lies beyond that; a file here is about 3,750 px and 2,000 elements, so at most five are drawn at once.
      let peak = 0, far = 0;
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 2500) {
        await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(40); await settle(page);
        const m = await page.evaluate(() => ({ elements: document.getElementsByTagName("*").length, far: [...document.querySelectorAll("#files .fb:not(.pending)")]
          .filter((el) => { const r = el.getBoundingClientRect(); return r.bottom < -6000 || r.top > innerHeight + 6000; }).length }));
        peak = Math.max(peak, m.elements); far = Math.max(far, m.far);
      }
      const misses = [];
      for (const fi of [3, 17, 39, 8, 25, 1]) {
        await page.click(`#tree [data-act="gofile"][data-f="${fi}"]`); await page.waitForTimeout(700);
        const d = await page.evaluate((fi) => document.querySelector(`#file-${fi}`).getBoundingClientRect().top - document.querySelector(".toolbar").getBoundingClientRect().bottom - 6, fi);
        if (Math.abs(d) > 3) misses.push(`${fi}: ${Math.round(d)} px`);
      }
      await page.keyboard.press("Control+f"); await page.keyboard.type("needleToken"); await page.waitForTimeout(400);
      const count = await text(page, "#find-count");
      let landed = 0;
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press("Enter"); await page.waitForTimeout(500);
        if (await page.evaluate(() => { const r = document.querySelector("#files tr.findhit")?.getBoundingClientRect(); return Boolean(r) && r.top > 0 && r.bottom < innerHeight; })) landed++;
      }
      // All 40 files drawn would be about 80,000 elements; five and the page around them stay under 12,000.
      return o.errors.length ? o.errors.join("; ") : timing < 2000 && !far && peak < 12000 && !misses.length && /15 matches/.test(count) && landed === 15
        || JSON.stringify({ timing, peak, far, misses, count, landed });
    } finally { await o.close(); }
  });

const failed = await runCases(TESTS);
await browser.close();
process.exit(summarize(failed, TESTS.length));
