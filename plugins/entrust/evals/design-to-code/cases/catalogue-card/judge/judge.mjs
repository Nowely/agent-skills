#!/usr/bin/env node
// The catalogue card's hidden judge: node judge.mjs <arm> <out dir>
//
// It runs the arm's card.js and card.css in the case's own page (index.html, page.js, page.css, data.js copied over
// the arm's) and holds two defects apart, each of which returns the card on its own:
//
//   width — planted in the start code: the card picks its layout from the window (matchMedia), not from its own
//           width. With the sidebar open, or in another page's container, the card must lay itself out exactly as a
//           card of that width does on a fresh load, and nothing in it may run past it.
//   choice — the task's own change: a chosen size survives the list being re-rendered by the search, emptied and
//           restored, and the sidebar opening; one size per card, a second click clears it.
//
// And the basics: Details opens the sheet and Close hides it, also after the list was emptied and restored; an empty
// search shows the "Nothing matches" line; every size of the data is shown; no script error. Pictures for the blind
// review go to <out>/shots. It prints ACCEPTED or RETURNED and writes <out>/judge.json.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [armArg, outArg] = process.argv.slice(2);
if (!armArg || !outArg) { console.error("usage: judge.mjs <arm> <out dir>"); process.exit(2); }
const arm = path.resolve(armArg), out = path.resolve(outArg), build = path.join(out, "build");
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(arm, build, { recursive: true, filter: (p) => !/(^|\/)(\.design|out|node_modules|\.git|\.skill)(\/|$)/.test(path.relative(arm, p)) });
for (const f of ["index.html", "page.js", "page.css", "data.js"]) fs.copyFileSync(path.join(HERE, "../project", f), path.join(build, f));
fs.mkdirSync(path.join(out, "shots"), { recursive: true });

const { chromium } = createRequire(path.join(HERE, "../../../../../noop.js"))("playwright");
const browser = await chromium.launch();
const checks = [];
const ok = (group, name, pass, detail = "") => checks.push({ group, name, pass: Boolean(pass), detail });
const errors = [];
const SIDEBAR = 280 + 16, PAD = 32; // the sidebar and its gap; the page's padding on both sides

async function open(file, width, query = "") {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on("pageerror", (e) => errors.push(`${file}${query} at ${width}: ${e.message}`));
  await page.goto(`file://${build}/${file}${query}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  return page;
}
const settle = (page) => page.waitForTimeout(350);

// The card of an item, found by its title: the nearest ancestor that also holds its price.
const CARD = `(title, price) => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent.trim() === title) {
    let el = n.parentElement;
    while (el && !el.textContent.includes(price)) el = el.parentElement;
    return el;
  }
  return null;
}`;
// The card's layout: where its title, first size, price and Details sit inside it, its size, and what runs past it.
async function signature(page, title = "Merino crew tee", price = "€49.00", first = "S") {
  return page.evaluate(([cardFn, title, price, first]) => {
    const card = eval(cardFn)(title, price);
    if (!card) return null;
    const box = card.getBoundingClientRect();
    const find = (text) => [...card.querySelectorAll("*")].find((e) => e.children.length === 0 && e.textContent.trim() === text)
      ?? [...card.querySelectorAll("*")].find((e) => e.textContent.trim() === text);
    const at = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left - box.left), Math.round(r.top - box.top)]; };
    const details = [...card.querySelectorAll("button, a")].find((e) => /details/i.test(e.textContent));
    let past = 0;
    for (const e of card.querySelectorAll("*")) { const r = e.getBoundingClientRect(); if (r.width && r.right - box.right > past) past = r.right - box.right; }
    return { width: Math.round(box.width), height: Math.round(box.height), title: at(find(title)), size: at(find(first)), price: at(find(price)),
      details: at(details), past: Math.round(past), scroll: card.scrollWidth - card.clientWidth };
  }, [CARD, title, price, first]);
}
const same = (a, b) => a && b && ["title", "size", "price", "details"].every((k) => JSON.stringify(a[k]) === JSON.stringify(b[k]) ||
  (a[k] && b[k] && Math.abs(a[k][0] - b[k][0]) <= 2 && Math.abs(a[k][1] - b[k][1]) <= 2)) && Math.abs(a.height - b.height) <= 2;
const show = (s) => s ? `title ${s.title}, first size ${s.size}, price ${s.price}, Details ${s.details}, ${s.width}×${s.height}${s.past > 1 ? `, runs ${s.past} px past it` : ""}` : "no card";

// ---------------------------------------------------------------- width: the card follows its own width
for (const viewport of [700, 800, 900, 960]) {
  const list = viewport - PAD - SIDEBAR;
  const page = await open("index.html", viewport);
  await page.click("#filters");
  await settle(page);
  const narrowed = await signature(page);
  if (viewport === 960) await page.screenshot({ path: path.join(out, "shots", "sidebar-960.png") });
  await page.close();
  const fresh = await open("index.html", list + PAD);
  const expected = await signature(fresh);
  await fresh.close();
  ok("width", `sidebar open at ${viewport} (list ${list} px): as a fresh card ${list} px wide`, same(narrowed, expected) && narrowed.past <= 1,
    same(narrowed, expected) ? (narrowed.past > 1 ? `runs ${narrowed.past} px past the card` : "") : `got ${show(narrowed)}; a fresh card: ${show(expected)}`);
}
{ // Opened and closed again: as the fresh page at that width.
  const page = await open("index.html", 960);
  await page.click("#filters"); await settle(page); await page.click("#filters"); await settle(page);
  const back = await signature(page);
  await page.close();
  const fresh = await open("index.html", 960);
  const expected = await signature(fresh);
  await fresh.close();
  ok("width", "sidebar opened and closed at 960: as the fresh page", same(back, expected), same(back, expected) ? "" : `got ${show(back)}; fresh: ${show(expected)}`);
}
for (const w of [375, 520]) { // Another page's container, in a wide window.
  const page = await open("story.html", 1280, `?w=${w}`);
  const story = await signature(page);
  await page.close();
  const fresh = await open("index.html", w + PAD);
  const expected = await signature(fresh);
  await fresh.close();
  ok("width", `a ${w} px container in a 1280 px window: as a fresh card ${w} px wide`, same(story, expected) && story.past <= 1,
    same(story, expected) ? (story.past > 1 ? `runs ${story.past} px past the card` : "") : `got ${show(story)}; a fresh card: ${show(expected)}`);
}

// ---------------------------------------------------------------- choice: a chosen size survives re-renders
async function sizes(page, title = "Merino crew tee", price = "€49.00") {
  return page.evaluate(([cardFn, title, price]) => {
    const card = eval(cardFn)(title, price);
    if (!card) return null;
    const pressed = (e) => ["aria-pressed", "aria-checked", "aria-selected"].some((a) => e.getAttribute(a) === "true") || e.checked === true
      || [...e.querySelectorAll("input")].some((i) => i.checked);
    const out = {};
    for (const s of ["XS", "S", "M", "L", "XL", "XXL"]) {
      const el = [...card.querySelectorAll("button, [role=button], [role=radio], label, input")].find((e) => e.textContent.trim() === s || e.value === s)
        ?? [...card.querySelectorAll("*")].find((e) => e.children.length === 0 && e.textContent.trim() === s);
      if (el) out[s] = pressed(el) || pressed(el.closest("button, [role=button], [role=radio], label") ?? el);
    }
    return out;
  }, [CARD, title, price]);
}
async function click(page, size, title = "Merino crew tee", price = "€49.00") {
  const handle = await page.evaluateHandle(([cardFn, title, price, size]) => {
    const card = eval(cardFn)(title, price);
    return card && ([...card.querySelectorAll("button, [role=button], [role=radio], label")].find((e) => e.textContent.trim() === size)
      ?? [...card.querySelectorAll("*")].find((e) => e.children.length === 0 && e.textContent.trim() === size));
  }, [CARD, title, price, size]);
  const el = handle.asElement();
  if (!el) return false;
  await el.click();
  await page.waitForTimeout(100);
  return true;
}
const only = (state, size) => state && Object.entries(state).every(([s, p]) => p === (s === size));
{
  const page = await open("index.html", 1000);
  const clicked = await click(page, "M");
  ok("choice", "M is chosen by a click", clicked && only(await sizes(page), "M"), clicked ? JSON.stringify(await sizes(page)) : "no size M found in the tee's card");
  await page.fill("#q", "merino"); await settle(page);
  ok("choice", "still chosen after the search re-renders the list", only(await sizes(page), "M"), JSON.stringify(await sizes(page)));
  await page.fill("#q", "zzz"); await settle(page);
  await page.fill("#q", ""); await settle(page);
  ok("choice", "still chosen after the list is emptied and restored", only(await sizes(page), "M"), JSON.stringify(await sizes(page)));
  await page.click("#filters"); await settle(page);
  ok("choice", "still chosen with the sidebar open", only(await sizes(page), "M"), JSON.stringify(await sizes(page)));
  await page.click("#filters"); await settle(page);
  await click(page, "S");
  ok("choice", "one size per card: S replaces M", only(await sizes(page), "S"), JSON.stringify(await sizes(page)));
  await click(page, "S");
  ok("choice", "a second click clears it", only(await sizes(page), null), JSON.stringify(await sizes(page)));
  await page.close();
}

// ---------------------------------------------------------------- the basics
async function details(page) {
  const button = page.locator("#host").getByRole("button", { name: /details/i }).first();
  if (!(await button.count())) return "no Details button";
  await button.click();
  await settle(page);
  if (!(await page.locator("#sheet").isVisible())) return "the sheet did not open";
  await page.click(".sheet__close");
  await page.waitForTimeout(700);
  return (await page.locator("#sheet").isVisible()) ? "the sheet did not close" : "";
}
{
  const page = await open("index.html", 407);
  await page.screenshot({ path: path.join(out, "shots", "index-407.png"), fullPage: true });
  const first = await details(page);
  ok("basics", "Details opens the sheet and Close hides it", !first, first);
  await page.fill("#q", "zzz"); await settle(page);
  ok("basics", "an empty search shows the Nothing matches line", await page.getByText("Nothing matches").isVisible());
  await page.fill("#q", ""); await settle(page);
  const again = await details(page);
  ok("basics", "Details still works after the list was emptied and restored", !again, again);
  const shown = await page.evaluate(([cardFn]) => {
    const card = eval(cardFn)("Loopback hoodie", "€89.00");
    return card ? ["S", "M", "L", "XL"].filter((s) => [...card.querySelectorAll("*")].some((e) => e.textContent.trim() === s)) : [];
  }, [CARD]);
  ok("basics", "every size of the data is shown (the hoodie's S, M, L, XL)", shown.length === 4, shown.join(", "));
  await page.close();
}
for (const [name, w, chosen] of [["card-764", 764, false], ["card-375", 375, false], ["size-chosen-375", 375, true]]) {
  const page = await open("story.html", 1280, `?w=${w}`);
  if (chosen) await click(page, "M");
  await page.locator("#host").screenshot({ path: path.join(out, "shots", `${name}.png`) });
  await page.close();
}
for (const data of ["dense", "many"]) for (const w of [764, 375]) {
  const page = await open("story.html", 1280, `?data=${data}&w=${w}`);
  await page.locator("#host").screenshot({ path: path.join(out, "shots", `${data}-${w}.png`) });
  await page.close();
}
ok("basics", "no script error", !errors.length, errors.slice(0, 3).join("; "));
await browser.close();

const failed = checks.filter((c) => !c.pass);
const groups = Object.fromEntries(["width", "choice", "basics"].map((g) => [g, checks.filter((c) => c.group === g).every((c) => c.pass)]));
const verdict = failed.length ? "RETURNED" : "ACCEPTED";
fs.writeFileSync(path.join(out, "judge.json"), `${JSON.stringify({ verdict, groups, checks }, null, 2)}\n`);
console.log(`${verdict} · width ${groups.width ? "holds" : "BROKEN"} · choice ${groups.choice ? "holds" : "BROKEN"} · basics ${groups.basics ? "hold" : "BROKEN"}`);
for (const c of failed) console.log(`- ${c.group}: ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
