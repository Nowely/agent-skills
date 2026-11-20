#!/usr/bin/env node
// The listing case's judge, frozen before any run: node judge.mjs <implementation dir> <out dir>
// Run it from a directory where Playwright resolves. It never changes the implementation: it copies it to
// <out dir>/build, replaces data.js with its own listings, and checks the copy.
// Accepts only when every criterion holds:
//   visual   — each design frame has no material finding (an offset or size over 4 px, a missing, changed or extra
//              text, a font, a differing region), with the judge's own specs and no ledger;
//   dense    — the judge's dense listing at every card width from 280 to 800 has no overlap, covered control, text
//              outside the card, overflow or hard clipping;
//   popovers — help and deal popovers: hover opens; moving into the popover keeps it; leaving both closes it; a tap
//              opens and a tap elsewhere closes; focus opens and Escape closes;
//   deal     — the deal popover shows the old price, the new price and the date;
//   edit     — the edit action calls onEdit with the id; a visitor's listing has no edit action.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESIGN = path.resolve(HERE, "../../../../../plugin/skills/design-to-code/scripts/design.mjs");
const [impl, outArg] = process.argv.slice(2);
if (!impl || !outArg) { console.error("usage: judge.mjs <implementation dir> <out dir>"); process.exit(2); }
const out = path.resolve(outArg), build = path.join(out, "build"), source = path.resolve(impl);
const inside = (a, b) => !path.relative(b, a).startsWith("..") && !path.isAbsolute(path.relative(b, a));
if (inside(source, out) || inside(out, source)) { console.error("the out dir must lie outside the implementation, and not contain it"); process.exit(2); }
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.resolve(impl), build, { recursive: true, filter: (p) => !/(^|\/)(\.design|out|node_modules|\.git)(\/|$)/.test(path.relative(path.resolve(impl), p)) });
fs.copyFileSync(path.join(HERE, "data.js"), path.join(build, "data.js"));
const POP = '.kit-popover, [role="tooltip"], [role="dialog"], [class*="popover"], .hint';
const frame = (name) => ({ spec: path.join(HERE, "design", name, "spec.json"), reference: path.join(HERE, "../pack", name, "reference.png") });
const frames = ["wide-760", "medium-520", "narrow-320"].map((name) => ({ name, width: Number(name.split("-")[1]), ...frame(name) }));
frames.push({ name: "deal-popover", width: 760, root: POP, setup: [{ hover: "text=−12%" }], ...frame("deal-popover") });
// The judge's own pack: its acceptance list is this file's header.
fs.writeFileSync(path.join(out, "review.md"), "# Judge\n\n## Acceptance list\n\n- judge.mjs's criteria: judged below\n");
fs.writeFileSync(path.join(out, "design.json"), JSON.stringify({ url: "build/story.html?data=frame", root: "#host > *", host: "#host", frames,
  sweep: { from: 280, to: 800, step: 8, stories: [{ name: "dense", url: "build/story.html?data=dense" }] } }, null, 1));
const run = spawnSync(process.execPath, [DESIGN, "check", path.join(out, "design.json")], { encoding: "utf8" });
if (!fs.existsSync(path.join(out, "out/result.json"))) { process.stderr.write(run.stdout + run.stderr); process.exit(2); }
const result = JSON.parse(fs.readFileSync(path.join(out, "out/result.json"), "utf8"));
// Material: an offset or size over 4 px, a missing, changed or extra text, a font, a region over 4 px both ways.
const material = (i) => i.status === "fail" && !(i.delta !== undefined && ["x", "y", "width", "height"].includes(i.property) && Math.abs(i.delta) <= 4)
  && !(i.property === "region" && (i.box.width <= 4 || i.box.height <= 4));
const visual = result.frames.map((f) => ({ frame: f.frame, verdict: f.verdict, material: [...f.issues.filter(material).map((i) => `${i.landmark} ${i.property}: ${i.expected} → ${i.actual}`),
  ...(f.unexpected ?? []).map((t) => `extra text “${t}”`), ...(f.unmeasured ? [f.unmeasured] : [])] }));
const dense = (result.sweep?.issues ?? []).filter((i) => i.status === "fail" && ["overlap", "covered", "outside", "overflow", "clipped"].includes(i.property))
  .map((i) => `${i.property} ${i.landmark}${i.story ? ` (${i.story})` : ""} at ${i.ranges}: ${i.actual}`);

let chromium;
for (const base of [path.join(process.cwd(), "noop.js"), fileURLToPath(import.meta.url)]) {
  try { ({ chromium } = createRequire(base)("playwright")); break; } catch { /* the next place */ }
}
if (!chromium) { console.error("Playwright is not installed where this runs"); process.exit(2); }
const browser = await chromium.launch();
const url = (data) => `file://${build}/story.html?data=${data}`;
const checks = [];
const ok = (name, pass, detail = "") => checks.push({ name, pass, detail });
async function page(data, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 900 }, ...opts });
  const p = await ctx.newPage();
  await p.goto(url(data));
  await p.waitForTimeout(150);
  return { ctx, p };
}
// Shown: any match with a size a person can see; text kept for screen readers alone does not count.
const shown = (p, text) => p.getByText(text, { exact: false }).evaluateAll((els) => els.some((e) => {
  const r = e.getBoundingClientRect();
  return r.width > 4 && r.height > 4 && e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
})).catch(() => false);
const settle = (p) => p.waitForTimeout(450);
const triggers = { help: [".kit-help", "text=?"], deal: ["text=−12%"] };
const contents = { help: "Viewings by appointment", deal: "Old price" };
async function trigger(p, kind) {
  for (const sel of triggers[kind]) { const l = p.locator(sel).first(); if (await l.count() && await l.isVisible()) return l; }
  return null;
}
for (const kind of ["help", "deal"]) {
  // Pointer.
  { const { ctx, p } = await page("frame");
    const t = await trigger(p, kind);
    if (!t) ok(`${kind}: trigger found`, false);
    else {
      await t.hover(); await settle(p);
      const opened = await shown(p, contents[kind]);
      ok(`${kind}: hover opens`, opened);
      let kept = false, closed = false;
      if (opened) {
        const box = await p.getByText(contents[kind]).evaluateAll((els) => {
          const r = els.map((e) => e.getBoundingClientRect()).find((b) => b.width > 4 && b.height > 4);
          return r && { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
        });
        const tb = await t.boundingBox();
        await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
        await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
        await settle(p);
        kept = await shown(p, contents[kind]);
        await p.mouse.move(990, 890, { steps: 8 }); await settle(p);
        closed = !(await shown(p, contents[kind]));
      }
      ok(`${kind}: moving into the popover keeps it open`, kept);
      ok(`${kind}: leaving the trigger and the popover closes it`, closed);
      if (kind === "deal" && opened) {
        await t.hover(); await settle(p);
        // Any space counts as a space: a price may be set with no-break spaces, as it should.
        const text = (await p.locator("body").innerText()).replace(/\s+/g, " ");
        ok("deal: shows the old price, the new price and the date", ["2 100 €", "1 850 €", "31 Dec"].every((s) => text.split("1 850 € / month").join("").includes(s)) && /old/i.test(text) && /new/i.test(text),
          text.slice(0, 200));
      } else if (kind === "deal") ok("deal: shows the old price, the new price and the date", false, "the popover did not open");
    }
    await ctx.close(); }
  // Touch.
  { const { ctx, p } = await page("frame", { hasTouch: true, isMobile: true, viewport: { width: 400, height: 900 } });
    await p.evaluate(() => { document.getElementById("host").style.width = "320px"; });
    await settle(p);
    const t = await trigger(p, kind);
    let opened = false, closed = false;
    if (t) { await t.tap(); await settle(p); opened = await shown(p, contents[kind]);
      await p.touchscreen.tap(380, 880); await settle(p); closed = !(await shown(p, contents[kind])); }
    ok(`${kind}: a tap opens it`, opened); ok(`${kind}: a tap elsewhere closes it`, opened && closed);
    await ctx.close(); }
  // Keyboard.
  { const { ctx, p } = await page("frame");
    const t = await trigger(p, kind);
    let opened = false, closed = false;
    if (t) { await t.focus(); await settle(p); opened = await shown(p, contents[kind]);
      await p.keyboard.press("Escape"); await settle(p); closed = !(await shown(p, contents[kind])); }
    ok(`${kind}: focus opens it`, opened); ok(`${kind}: Escape closes it`, opened && closed);
    await ctx.close(); }
}
{ const { ctx, p } = await page("frame");
  const edit = p.getByRole("button", { name: /edit/i }).or(p.getByRole("link", { name: /edit/i })).first();
  let called = null;
  if (await edit.count()) { await edit.click(); called = await p.evaluate(() => window.edited ?? null); }
  ok("edit: calls onEdit with the listing's id", called === "a-102", String(called));
  await ctx.close(); }
{ const { ctx, p } = await page("guest");
  const n = await p.getByRole("button", { name: /edit/i }).or(p.getByRole("link", { name: /edit/i })).count();
  ok("edit: a visitor's listing has none", n === 0);
  await ctx.close(); }
await browser.close();

const verdict = { visual: visual.every((v) => !v.material.length), dense: dense.length === 0, behaviour: checks.every((c) => c.pass) };
const accepted = Object.values(verdict).every(Boolean);
const report = { accepted, verdict, visual, dense, checks, checkExit: run.status };
fs.writeFileSync(path.join(out, "judge.json"), JSON.stringify(report, null, 2));
console.log(`${accepted ? "ACCEPTED" : "RETURNED"} · visual ${verdict.visual ? "ok" : "fail"} · dense ${verdict.dense ? "ok" : "fail"} · behaviour ${verdict.behaviour ? "ok" : "fail"}`);
for (const v of visual) if (v.material.length) console.log(`  ${v.frame}: ${v.material.slice(0, 6).join("; ")}${v.material.length > 6 ? ` … ${v.material.length - 6} more` : ""}`);
for (const d of dense.slice(0, 8)) console.log(`  ${d}`);
if (dense.length > 8) console.log(`  … ${dense.length - 8} more dense findings`);
for (const c of checks) if (!c.pass) console.log(`  ✗ ${c.name}${c.detail ? ` (${c.detail})` : ""}`);
