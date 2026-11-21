#!/usr/bin/env node
// Turns a rendered component into numbers and holds them against the design's.
//
//   node design.mjs figma <figma link with node-id> --out <frame directory> [--scale 2]
//   node design.mjs spec <metadata.xml> [--context <design-context>] [--frame <id|name>] [--coords auto|relative|absolute] [--out spec.json]
//   node design.mjs check <design.json> [--frame <name>] [--no-sweep] [--out <dir>]
//   node design.mjs snapshot <design.json> [--frame <name>] [--images] [--scale <n>] [--force]
//
// `figma` fetches one frame from Figma's REST API (FIGMA_TOKEN): its spec, every text with its characters, box,
// alignment and font, and its image. `spec` reads the MCP server's `get_metadata` outline instead, taking each
// text from the frame's `get_design_context` answer by node id when given one. `check` measures every frame of
// design.json in Chromium against its spec and image, applies the ledger of deliberate deviations, runs the sweep
// when the config has one (not with --frame or --no-sweep), prints a summary, writes report.md, result.json, the
// images and, for a check of every frame, gallery.html (the design, the page before the work, the page now) to <dir>
// (default: out/ beside design.json), and exits 0 when the comparison passes, 1 on a failure, 2 when it could not
// measure everything (including image-only text), 3 when what remains awaits the owner's decision; a failure outranks 2, and 2 outranks 3. `snapshot` writes a spec (and with
// --images a reference PNG) from the page as it renders now: a baseline from an accepted implementation.
// references/check.md describes design.json, the ledger and the output.
//
// Playwright is resolved from the working directory first, so run this from the project that has it installed.

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  compareFrame, joinContext, ledgerFaults, nameRegions, pageText, parseFigmaUrl, ranges, renderGallery, renderHandoff, renderReport, renderSummary,
  specFromMetadata, specFromRest, sweepIssues, switches, totalScore,
} from "./core.mjs";

const USAGE = fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 8).map((l) => l.slice(3)).join("\n");

function parseArgs(argv) {
  const [command, file, ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    const m = rest[i].match(/^--([\w-]+)$/);
    if (!m) throw new Error(`unexpected argument ${rest[i]}`);
    const next = rest[i + 1];
    flags[m[1]] = next === undefined || next.startsWith("--") ? true : (i++, next);
  }
  return { command, file, flags };
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`); };
const pngSize = (buf) => (buf.toString("ascii", 1, 4) === "PNG" ? { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) } : null);
// A frame's files: its name made safe, and a short hash of the name, so "a b" and "a-b" stay apart.
const frameKey = (name) => `${name.replace(/[^\w.-]+/g, "-").slice(0, 40)}~${createHash("sha256").update(name).digest("hex").slice(0, 8)}`;

function loadConfig(file) {
  const dir = path.dirname(path.resolve(file));
  const cfg = readJson(file);
  const at = (p) => (p ? path.resolve(dir, p) : p);
  // A file path may carry a query or a fragment (a story's arguments): only the path is a file.
  const url = (u) => {
    if (!u || /^[a-z][\w+.-]*:/i.test(u)) return u;
    const [, file, rest] = u.match(/^([^?#]*)(.*)$/);
    return pathToFileURL(path.resolve(dir, file)).href + rest;
  };
  for (const key of ["url", "root", "frames"]) if (!cfg[key]) throw new Error(`design.json: no "${key}"`);
  if (new Set(cfg.frames.map((f) => f.name)).size !== cfg.frames.length) throw new Error("design.json: frame names must be unique");
  const stories = cfg.sweep?.stories ?? [], journeys = cfg.journeys ?? [];
  if (!Array.isArray(stories) || stories.some((st) => !st?.name || !st.url)) throw new Error("design.json: each sweep story needs a name and a url");
  if (!Array.isArray(journeys) || journeys.some((j) => !j?.name || !Array.isArray(j.steps) || !j.steps.length)) throw new Error("design.json: each journey needs a name and steps");
  // A journey that expects nothing cannot fail, so its "holds" would prove nothing.
  for (const j of journeys) if (!j.steps.some((step) => EXPECT.some((k) => step && k in step))) throw new Error(`design.json: the journey "${j.name}" expects nothing: add a visible, hidden, text or focused step`);
  const steps = [...(cfg.frames ?? []).flatMap((f) => f.setup ?? []), ...(cfg.sweep?.setup ?? []), ...stories.flatMap((st) => st.setup ?? [])];
  for (const step of steps) { const fault = stepFault(step); if (fault) throw new Error(`design.json: ${fault}`); }
  for (const step of journeys.flatMap((j) => j.steps)) { const fault = stepFault(step, true); if (fault) throw new Error(`design.json: ${fault}`); }
  if (new Set(journeys.map((j) => j.name)).size !== journeys.length) throw new Error("design.json: journey names must be unique");
  return {
    ...cfg, dir, url: url(cfg.url), ledger: at(cfg.ledger), tolerance: cfg.tolerance ?? 1,
    journeys: journeys.map((j) => ({ ...j, url: url(j.url) ?? url(cfg.url) })),
    ...(cfg.sweep ? { sweep: { ...cfg.sweep, stories: stories.map((st) => ({ ...st, url: url(st.url) })) } } : {}),
    frames: cfg.frames.map((f) => {
      if (!f.name || !f.width || !f.spec) throw new Error(`design.json: a frame needs name, width and spec (${JSON.stringify(f)})`);
      return { ...f, url: url(f.url) ?? url(cfg.url), spec: at(f.spec), reference: at(f.reference) };
    }),
  };
}

// ------------------------------------------------------------------ browser

async function chromium() {
  const bases = [path.join(process.cwd(), "noop.js"), fileURLToPath(import.meta.url)];
  for (const base of bases) for (const name of ["playwright", "@playwright/test", "playwright-core"]) {
    let resolved;
    try { resolved = createRequire(base).resolve(name); } catch { continue; }
    const mod = await import(pathToFileURL(resolved).href);
    const browser = mod.chromium ?? mod.default?.chromium;
    if (browser) return browser;
  }
  throw Object.assign(new Error("Playwright is not installed where this runs: run from the project that has it, or `npm i -D playwright && npx playwright install chromium`"), { exit: 2 });
}

// Animations end at once instead of not running: content that fades in is captured as it ends, not stuck at opacity 0.
const STILL = "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important;caret-color:transparent!important}";

// The component's root: the first match the user can see, opacity included; open() marks it, so the picture and the
// measurements come from the same element. A popover kept hidden in the page is not the one open.
const MARK = "data-design-root";
const seenIn = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }); };
// Run on the frame root (inventory) or the target of a gesture (one opener). Equal labels on different
// controls must stay distinct across the fresh pages used for frames and journeys.
function openerInfoIn(el, { inventory = false, point, keyboard } = {}) {
  const selector = "[aria-expanded], [popovertarget], [aria-haspopup]";
  const label = (o) => (o.getAttribute("aria-label") || o.title || o.textContent || o.localName).replace(/\s+/g, " ").trim();
  const controls = [...document.querySelectorAll(selector)].filter((o) => o.hasAttribute("aria-expanded") || o.hasAttribute("popovertarget")
    || !/^(false|)$/i.test((o.getAttribute("aria-haspopup") ?? "").trim()));
  const target = point ? document.elementFromPoint(...point) : keyboard ? document.activeElement : el;
  const matches = inventory ? controls.filter((o) => el.contains(o) && o.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))
    : [controls.findLast((o) => o.contains(target))].filter(Boolean);
  return matches.map((o) => {
    const name = label(o);
    const ids = [o.getAttribute("aria-controls"), o.getAttribute("popovertarget")].filter(Boolean).join(" ").split(/\s+/).filter(Boolean);
    // Across data variants on one page, a named control linked to the same popup has an explicit identity.
    const page = o.id && ids.length ? location.origin + location.pathname + location.hash : location.href;
    const key = JSON.stringify([page, name, ...(o.id ? ["id", o.id, ...ids] : ["index", controls.filter((c) => label(c) === name).indexOf(o)])]);
    return { key, name, ids };
  });
}
async function rootOf(page, selector) {
  const marked = page.locator(`[${MARK}]`);
  return (await marked.count()) ? marked.first() : page.locator(selector).filter({ visible: true }).first();
}
const markRoot = (page, selector) => page.evaluate(([sel, mark, seen]) => {
  const visible = new Function(`return (${seen})`)();
  for (const e of document.querySelectorAll(`[${mark}]`)) e.removeAttribute(mark);
  const el = [...document.querySelectorAll(sel)].find(visible);
  el?.setAttribute(mark, "");
  return Boolean(el);
}, [selector, MARK, seenIn.toString()]);

async function settle(page, selector) {
  await (await rootOf(page, selector)).evaluate(async (root) => {
    await document.fonts.ready;
    // Animations a script started end too: content it fades in is captured as it ends.
    for (const a of document.getAnimations()) {
      try { if (a.effect?.getComputedTiming().endTime !== Infinity) a.finish(); } catch { /* one that cannot end runs on */ }
    }
    const images = root.matches("img") ? [root] : root.querySelectorAll("img");
    const loaded = Promise.all(Array.from(images, async (i) => {
      if (i.complete) return;
      const lazy = i.loading === "lazy";
      if (lazy) i.loading = "eager";
      try { await i.decode(); } catch { /* a broken image is captured as rendered */ }
      finally { if (lazy) i.loading = "lazy"; }
    }));
    let timer;
    try {
      await Promise.race([loaded, new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Timed out loading images inside the component")), 15000);
      })]);
    } finally { clearTimeout(timer); }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

async function setWidth(page, cfg, width, viewportHeight) {
  if (cfg.host) {
    await page.evaluate(([sel, w]) => {
      const host = document.querySelector(sel);
      if (!host) throw new Error(`the host ${sel} is not on the page`);
      Object.assign(host.style, { width: `${w}px`, minWidth: "0", maxWidth: "none" });
    }, [cfg.host, width]);
  } else {
    await page.setViewportSize({ width, height: viewportHeight });
  }
}

const STEPS = ["wait", "press", "fill", "move", "tap", "click", "hover", "focus", "visible", "hidden", "text", "focused"];
const EXPECT = ["visible", "hidden", "text", "focused"];
// A journey may also change the width it runs at: a state entered must survive a resize.
const stepFault = (step, journey = false) => {
  const known = journey ? [...STEPS, "width"] : STEPS;
  if (!step || typeof step !== "object" || Object.keys(step).length !== 1 || !known.includes(Object.keys(step)[0])) return `a step is one of ${known.join(", ")}: ${JSON.stringify(step)}`;
  if ("text" in step && !(Array.isArray(step.text) && step.text[1])) return `a text step names a selector and a text that is not empty: ${JSON.stringify(step)}`;
  return null;
};

// Whether any match of a Playwright selector is seen, as a person would: a size, not hidden, not transparent; with a
// text, one that shows it. A journey's expectation polls this for a second.
const anySeen = (page, selector, text = null, ids = []) => page.locator(selector).evaluateAll((els, [t, seen, ids]) => {
  const visible = new Function(`return (${seen})`)();
  return els.some((e) => visible(e) && (t === null || e.innerText.includes(t)) && (!ids.length || ids.some((id) => document.getElementById(id)?.contains(e))));
}, [text, seenIn.toString(), ids]);
async function until(page, check, ms = 1000) {
  for (const end = Date.now() + ms; ;) {
    if (await check()) return true;
    if (Date.now() > end) return false;
    await page.waitForTimeout(50);
  }
}

async function runStep(page, step) {
  const [action] = Object.keys(step);
  const arg = step[action];
  const point = Array.isArray(arg) && arg.length === 2 && arg.every(Number.isFinite);
  if (action === "wait") return page.waitForTimeout(Number(arg));
  if (action === "press") return page.keyboard.press(arg);
  if (action === "fill") return page.locator(arg[0]).first().fill(arg[1]);
  if (action === "move") return point ? page.mouse.move(arg[0], arg[1], { steps: 8 }) : page.locator(arg).first().hover();
  if (action === "tap") return point ? page.touchscreen.tap(arg[0], arg[1]) : page.locator(arg).first().tap();
  // What a journey expects, given a second to come true: any match seen, none seen, one seen with the text.
  if (action === "visible" && !(await until(page, () => anySeen(page, arg)))) throw new Error(`no ${arg} is visible`);
  if (action === "hidden" && !(await until(page, async () => !(await anySeen(page, arg))))) throw new Error(`${arg} is still visible`);
  if (action === "text" && !(await until(page, () => anySeen(page, arg[0], arg[1])))) throw new Error(`no visible ${arg[0]} shows “${arg[1]}”`);
  if (action === "focused" && !(await until(page, () => page.locator(arg).evaluateAll((els) => els.some((e) => e.contains(document.activeElement)))))) throw new Error(`${arg} does not have the focus`);
  if (EXPECT.includes(action)) return;
  if (!["click", "hover", "focus"].includes(action)) throw new Error(`unknown step ${JSON.stringify(step)}`);
  return page.locator(arg).first()[action]();
}

// A page that could not be put in its state: the frame, story or journey is reported, the rest of the check goes on.
const unmeasured = (message) => Object.assign(new Error(message), { unmeasured: true, exit: 2 });

function contextOptions(cfg, { width, setup = [], viewport, height = 900, scale = 1, touch = false }) {
  const viewportWidth = viewport ?? (cfg.host ? Math.max(cfg.viewport ?? 1280, width) : width);
  const hasTouch = touch || setup.some((step) => "tap" in step);
  return { viewport: { width: viewportWidth, height }, deviceScaleFactor: scale, reducedMotion: "reduce", hasTouch };
}

async function open(browser, cfg, target) {
  const { url, width, setup = [], height = 900 } = target;
  const context = await browser.newContext(contextOptions(cfg, target));
  const page = await context.newPage();
  // A step on something that never appears fails in seconds, not in Playwright's default half minute.
  page.setDefaultTimeout(5000);
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  // The pointer rests outside the page, so nothing is measured hovered.
  await page.mouse.move(-5, -5);
  await page.addStyleTag({ content: STILL });
  if (!cfg.host || (setup.length && await page.locator(cfg.host).count())) await setWidth(page, cfg, width, height);
  try {
    for (const step of setup) await runStep(page, step);
    await page.locator(cfg.root).first().waitFor({ state: "attached", timeout: 15000 });
  } catch (e) {
    const absent = !(await page.locator(cfg.root).count());
    await context.close();
    if (absent) throw unmeasured(`Root ${cfg.root} was absent at capture time${setup.length ? ` (setup: ${e.message.split("\n")[0]})` : ""}.`);
    throw unmeasured(`A setup step failed: ${e.message.split("\n")[0]}`);
  }
  const shown = await page.waitForFunction(([sel, seen]) => [...document.querySelectorAll(sel)].some(new Function(`return (${seen})`)()),
    [cfg.root, seenIn.toString()], { timeout: 3000 }).then(() => true, () => false);
  if (!shown) {
    await context.close();
    throw unmeasured(`Root ${cfg.root} was on the page but not visible at capture time.`);
  }
  if (cfg.host) await setWidth(page, cfg, width, height);
  await markRoot(page, cfg.root);
  await settle(page, cfg.root);
  return { context, page };
}

// Runs inside the page. One function, so its helpers travel with it: measure the spec's landmarks, snapshot every
// text as a landmark, or probe the layout at the current width for the sweep.
async function inPage({ command, root: rootSelector, landmarks = [], align = [], tolerance = 1 }) {
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const key = (s) => s.replace(/[\s\u200b]+/g, "").toLocaleLowerCase();
  const seen = (el) => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  const root = document.querySelector("[data-design-root]") ?? [...document.querySelectorAll(rootSelector)].find(seen) ?? document.querySelector(rootSelector);
  if (!root) return { error: `the root ${rootSelector} is not on the page` };
  const rr = root.getBoundingClientRect();
  const visible = (el) => el?.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  const lineHeight = (cs) => {
    if (cs.lineHeight.endsWith("px")) return parseFloat(cs.lineHeight);
    const n = Number(cs.lineHeight);
    return Number.isFinite(n) ? n * parseFloat(cs.fontSize) : null;
  };
  const hex = (c) => {
    const m = c.match(/[\d.]+/g)?.map(Number) ?? [];
    return m.length >= 3 ? `#${m.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}` : c;
  };
  const fontOf = (el) => {
    const cs = getComputedStyle(el);
    return { size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight), lineHeight: lineHeight(cs) ?? "normal", color: hex(cs.color) };
  };
  // The text's line boxes, as Figma draws a text layer: the glyphs' rectangles widened or narrowed to the line height.
  const lineBoxes = (range, el) => {
    const lh = lineHeight(getComputedStyle(el));
    const lines = [];
    for (const r of [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0).sort((a, b) => a.top - b.top)) {
      const last = lines.at(-1);
      if (last && r.top < last.bottom - Math.min(r.height, last.bottom - last.top) / 2) {
        Object.assign(last, { left: Math.min(last.left, r.left), right: Math.max(last.right, r.right), top: Math.min(last.top, r.top), bottom: Math.max(last.bottom, r.bottom) });
      } else lines.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
    }
    return lines.map((l) => {
      if (!lh) return l;
      const mid = (l.top + l.bottom) / 2;
      return { ...l, top: mid - lh / 2, bottom: mid + lh / 2 };
    });
  };
  const boxOf = (lines) => {
    const left = Math.min(...lines.map((l) => l.left)), right = Math.max(...lines.map((l) => l.right));
    const top = lines[0].top, bottom = lines.at(-1).bottom;
    return { x: left - rr.left, y: top - rr.top, width: right - left, height: bottom - top };
  };
  const alignOf = (el) => {
    const cs = getComputedStyle(el), rtl = cs.direction === "rtl";
    if (cs.textAlign === "center") return "center";
    if (cs.textAlign === "right" || (cs.textAlign === "end" && !rtl) || (cs.textAlign === "start" && rtl)) return "right";
    return "left";
  };
  // Truncation drawn on purpose: an ellipsis on one unwrapped line of a block, or a line clamp on a vertical -webkit-box
  // (which Chromium may report as flow-root).
  const deliberate = (style) => (style.textOverflow === "ellipsis" && !/flex|grid/.test(style.display)
      && (style.whiteSpace === "nowrap" || style.whiteSpace === "pre" || style.textWrapMode === "nowrap"))
    || (Boolean(style.webkitLineClamp) && style.webkitLineClamp !== "none" && (/-webkit-(inline-)?box/.test(style.display) || style.webkitBoxOrient === "vertical"));
  const clipBounds = new Map();
  const textNodes = async () => {
    const out = [], clipped = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!n.data.trim() || !visible(el)) continue;
      const cs = getComputedStyle(el);
      const clearFill = /^(?:rgba\(.*,|.*\/)\s*0%?\)$/.test(cs.webkitTextFillColor);
      if (clearFill && cs.textShadow === "none" && !parseFloat(cs.webkitTextStrokeWidth) && !cs.backgroundClip.includes("text")) continue;
      if (lineBoxes(trimmed(n), el).length) out.push(n);
      for (let p = el; p; p = p.parentElement) {
        const style = getComputedStyle(p);
        if (style.clipPath !== "none" || style.clip !== "auto" || /hidden|clip/.test(style.overflowX + style.overflowY)) {
          // A text cut with an ellipsis or a line clamp is truncated on purpose: review.md says which texts truncate.
          if (!deliberate(style)) clipped.add(el);
          break;
        }
      }
    }
    if (!clipped.size) return out;
    // Layout boxes survive CSS clipping. Let Chromium intersect the painted bounds, including ancestor clips.
    // Include offscreen document content: a component screenshot may scroll that content into view.
    await new Promise((resolve, reject) => {
      const doc = document.documentElement;
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) clipBounds.set(entry.target, entry.intersectionRect);
        if (clipBounds.size === clipped.size) { clearTimeout(timer); observer.disconnect(); resolve(); }
      }, { rootMargin: `${Math.max(doc.scrollWidth, doc.scrollHeight)}px` });
      const timer = setTimeout(() => { observer.disconnect(); reject(new Error("Timed out measuring clipped text")); }, 5000);
      for (const el of clipped) observer.observe(el);
    });
    return out.filter((n) => {
      const r = clipBounds.get(n.parentElement);
      return !r || (r.width > 0 && r.height > 0 && [...trimmed(n).getClientRects()].some((l) =>
        l.left < r.right && l.right > r.left && l.top < r.bottom && l.bottom > r.top));
    });
  };
  const trimmed = (n) => {
    const range = document.createRange();
    range.setStart(n, n.data.search(/\S/));
    range.setEnd(n, n.data.trimEnd().length);
    return range;
  };
  // Every text's line boxes relative to the root: the areas the pixel comparison leaves to the text checks.

  if (command === "measure") {
    // The root's visible text without spaces, lower-cased, each character mapped back to its node and offset, and
    // the places a word may start or end: a node boundary or a space. A landmark is found only between such places,
    // so "16" is not found inside "18626".
    const nodes = await textNodes(), nodeStarts = new Map();
    const chars = [], starts = new Set([0]), ends = new Set();
    let text = "";
    for (const n of nodes) {
      nodeStarts.set(n, text.length);
      if (text.length) { ends.add(text.length); starts.add(text.length); }
      for (let i = 0; i < n.data.length; i++) {
        if (/[\s\u200b]/.test(n.data[i])) { if (text.length) { ends.add(text.length); starts.add(text.length); } continue; }
        const lower = n.data[i].toLocaleLowerCase();
        text += lower;
        for (let j = 0; j < lower.length; j++) chars.push({ node: n, offset: i });
      }
    }
    ends.add(text.length);
    const covered = new Uint8Array(chars.length);
    // A landmark may cross styled spans. Compare the part in each clipped span with that span's visible bounds.
    const clippedBy = (start, end) => {
      let cut = 0;
      for (let i = start; clipBounds.size && i < end; i++) {
        const { node, offset } = chars[i], bounds = clipBounds.get(node.parentElement);
        while (i + 1 < end && chars[i + 1].node === node) i++;
        if (!bounds) continue;
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, chars[i].offset + 1);
        for (const r of range.getClientRects()) cut = Math.max(cut, bounds.left - r.left, r.right - bounds.right, bounds.top - r.top, r.bottom - bounds.bottom);
      }
      return cut;
    };
    const measureText = (l, value) => {
      const target = key(value);
      const match = (range, el, start) => {
        const lines = lineBoxes(range, el);
        if (!lines.length) return { found: false };
        covered.fill(1, start, start + target.length);
        return { found: true, matchedText: value, box: boxOf(lines), lines: lines.length, clipped: clippedBy(start, start + target.length), align: alignOf(el), font: fontOf(el) };
      };
      if (l.documentOrder) {
        // A page snapshot contains whole text nodes in document order. Matching
        // substrings of larger nodes would change the ordinal of repeated text.
        const node = nodes.filter((n) => key(norm(n.data)) === target)[l.nth ?? 0];
        if (node) return match(trimmed(node), node.parentElement, nodeStarts.get(node));
        // Markup may split a previously whole node; fall through to range matching.
      }
      const hits = [];
      for (let i = text.indexOf(target); target && i >= 0; i = text.indexOf(target, i + 1)) {
        if (starts.has(i) && ends.has(i + target.length)) hits.push(i);
      }
      // A hit that is a whole element's text comes before a hit inside a longer one.
      const ranges = hits.map((i) => {
        const a = chars[i], b = chars[i + target.length - 1];
        const range = document.createRange();
        range.setStart(a.node, a.offset);
        range.setEnd(b.node, b.offset + 1);
        const el = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
        return { range, el: a.node.parentElement, start: i, whole: key(el.textContent) === target };
      });
      // Prefer a whole element for Figma landmarks; snapshots retain document order.
      if (!l.documentOrder) ranges.sort((x, y) => Number(y.whole) - Number(x.whole));
      const hit = ranges[l.nth ?? 0];
      if (!hit) return { found: false };
      return match(hit.range, hit.el, hit.start);
    };
    const found = landmarks.map((l) => {
      if (l.selector) {
        const el = root.querySelectorAll(l.selector)[l.nth ?? 0];
        if (!visible(el)) return { found: false };
        const r = el.getBoundingClientRect();
        return { found: true, box: { x: r.left - rr.left, y: r.top - rr.top, width: r.width, height: r.height }, align: "left" };
      }
      const original = measureText(l, l.text);
      return !original.found && l.alternate && l.alternate !== l.text ? measureText(l, l.alternate) : original;
    });
    const unexpected = [];
    if (landmarks.some((l) => l.text)) {
      for (let start = 0; start < chars.length; start++) {
        if (covered[start]) continue;
        const { node, offset } = chars[start];
        let end = start;
        while (end + 1 < chars.length && !covered[end + 1] && chars[end + 1].node === node) end++;
        unexpected.push(norm(node.data.slice(offset, chars[end].offset + 1)));
        start = end;
      }
    }
    // A family the page asks for that does not draw the page's own characters renders them in a fallback: a font
    // that failed to load, a missing subset. Each text's first family is tried, in the text's own style and weight,
    // on each of its characters: one that measures as in every generic family is drawn by a fallback. A stack that
    // starts with a system or generic family asks for nothing to load, and emoji come from an emoji font by design.
    const ctx = document.createElement("canvas").getContext("2d");
    const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[\w-]+|-apple-system|BlinkMacSystemFont|emoji|math|fangsong|inherit|initial)$/i;
    const missing = new Set();
    for (const n of nodes) {
      const cs = getComputedStyle(n.parentElement);
      const first = cs.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
      if (!first || generic.test(first) || missing.has(first)) continue;
      const font = (family) => `${cs.fontStyle} ${cs.fontWeight} 72px ${family}`;
      const width = (family, c) => { ctx.font = font(family); return ctx.measureText(c).width; };
      const probes = [...new Set(n.data.replace(/[\s\p{M}\p{Cf}\p{Cc}\p{Extended_Pictographic}\p{Regional_Indicator}]/gu, ""))].slice(0, 60);
      if (probes.some((c) => {
        const fallback = ["monospace", "serif", "sans-serif"];
        const widths = fallback.map((g) => width(g, c));
        return new Set(widths).size > 1 && fallback.every((g, i) => width(`"${first}", ${g}`, c) === widths[i]);
      })) missing.add(first);
    }
    const textBoxes = nodes.flatMap((n) => lineBoxes(trimmed(n), n.parentElement).map((line) => boxOf([line])));
    return { root: { width: rr.width, height: rr.height }, landmarks: found, fonts: [...missing], textBoxes, unexpected };
  }

  if (command === "snapshot") {
    const seen = new Map();
    const out = (await textNodes()).map((n) => {
      const t = norm(n.data), k = key(t), nth = seen.get(k) ?? 0;
      seen.set(k, nth + 1);
      return { text: t, ...(nth ? { nth } : {}), box: boxOf(lineBoxes(trimmed(n), n.parentElement)), font: fontOf(n.parentElement) };
    });
    return { root: { width: rr.width, height: rr.height }, landmarks: out };
  }

  // probe
  const label = (s) => { const t = norm(s); return t.length > 40 ? `${t.slice(0, 39)}…` : t; };
  const issues = [];
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) issues.push({ landmark: "document", property: "overflow", delta: de.scrollWidth - de.clientWidth, actual: `${de.scrollWidth - de.clientWidth} px wider than the viewport` });
  if (root.scrollWidth > root.clientWidth + 1) issues.push({ landmark: "root", property: "overflow", delta: root.scrollWidth - root.clientWidth, actual: `${root.scrollWidth - root.clientWidth} px wider than the root` });
  for (const el of [root, ...root.querySelectorAll("*")]) {
    if (!visible(el) || !el.textContent.trim()) continue;
    const cs = getComputedStyle(el);
    if (deliberate(cs)) continue;
    const own = el.getBoundingClientRect();
    if (own.width <= 2 || own.height <= 2) continue; // kept for screen readers alone
    const clipX = /hidden|clip/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;
    const clipY = /hidden|clip/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1;
    const cut = Math.max(clipX ? el.scrollWidth - el.clientWidth : 0, clipY ? el.scrollHeight - el.clientHeight : 0);
    if (clipX || clipY) issues.push({ landmark: label(el.textContent), property: "clipped", delta: cut, actual: `${cut} px cut off ${clipX ? "horizontally" : "vertically"}` });
  }
  const nodes = await textNodes();
  // What of each line is painted: cut to every box that clips it, so a truncated or scrolled text is measured as shown.
  const painted = (el, b) => {
    let r = { left: b.left, right: b.right, top: b.top, bottom: b.bottom };
    for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (!/hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY) && cs.clip === "auto") continue;
      const c = p.getBoundingClientRect();
      r = { left: Math.max(r.left, c.left), right: Math.min(r.right, c.right), top: Math.max(r.top, c.top), bottom: Math.min(r.bottom, c.bottom) };
    }
    return r.right - r.left > 0.5 && r.bottom - r.top > 0.5 ? r : null;
  };
  const lines = nodes.flatMap((n) => lineBoxes(trimmed(n), n.parentElement).map((b) => ({ node: n, b: painted(n.parentElement, b) })).filter((l) => l.b));
  for (const { node, b } of lines) {
    const out = Math.max(rr.left - b.left, b.right - rr.right, b.bottom - rr.bottom, rr.top - b.top);
    if (out > 1) issues.push({ landmark: label(node.data), property: "outside", delta: out, actual: `${Math.round(out)} px outside the root` });
  }
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const a = lines[i], b = lines[j];
    if (a.node === b.node) continue;
    const w = Math.min(a.b.right, b.b.right) - Math.max(a.b.left, b.b.left);
    const h = Math.min(a.b.bottom, b.b.bottom) - Math.max(a.b.top, b.b.top);
    if (w > 1 && h > 1) issues.push({ landmark: `${label(a.node.data)} × ${label(b.node.data)}`, property: "overlap", delta: Math.min(w, h), actual: `${Math.round(w)} × ${Math.round(h)} px` });
  }
  // The spread of the group's edges as laid out, against the configured tolerance. A group that matches fewer than
  // two visible elements measures nothing at this width and says so.
  const unmeasured = [];
  for (const g of align) {
    const rects = [...root.querySelectorAll(g.selector)].filter(visible).map((el) => el.getBoundingClientRect());
    const edgeOf = (r) => (g.edge === "right" ? r.right : g.edge === "center" ? (r.left + r.right) / 2 : g.edge === "top" ? r.top : r.left);
    if (rects.length < 2) { unmeasured.push({ selector: g.selector, edge: g.edge ?? "left", matched: rects.length }); continue; }
    // The size a ledger's max is held to is the measured one; only the text a person reads is rounded.
    const values = rects.map(edgeOf), spread = Math.max(...values) - Math.min(...values), shown = Math.round(spread * 100) / 100;
    if (spread > tolerance) issues.push({ landmark: g.selector, property: "align", delta: spread, actual: `${g.edge ?? "left"} edges ${shown} px apart` });
  }
  // Which texts share a row, in document order: a change between two widths is a change of layout. A text that
  // wraps keeps its first line's place, so wrapping inside one layout does not count.
  const tops = nodes.map((n) => lineBoxes(trimmed(n), n.parentElement)[0]?.top ?? 0);
  const rows = tops.map((t, i) => (i && Math.abs(t - tops[i - 1]) <= 2 ? "=" : i && t < tops[i - 1] ? "^" : "v")).join("");
  // A control the pointer cannot fully reach: another element lies over part of it, as an action laid over a help
  // icon. Its centre and four inner points are tried, the window scrolled to it; a point on the control's own label,
  // or cut away by a clipping ancestor, does not count.
  const named = (el) => label(el.getAttribute("aria-label") || el.title || el.textContent || el.tagName.toLowerCase());
  const clips = (el) => {
    const out = [];
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY)) out.push(p.getBoundingClientRect());
    }
    return out;
  };
  const [sx, sy] = [scrollX, scrollY];
  for (const el of root.querySelectorAll("a[href],button,input,select,textarea,summary,[role=button],[role=link],[tabindex]:not([tabindex='-1'])")) {
    const ecs = getComputedStyle(el);
    if (!visible(el) || el.matches(":disabled") || el.getAttribute("aria-disabled") === "true" || ecs.pointerEvents === "none") continue;
    // An inline link that wraps is tried on its first line, not on the box around both.
    const box = () => (getComputedStyle(el).display === "inline" && el.getClientRects().length ? el.getClientRects()[0] : el.getBoundingClientRect());
    let r = box();
    // A control drawn by its label or kept for screen readers alone (a few pixels, clipped away) is not for the pointer.
    if (r.width <= 2 || r.height <= 2) continue;
    if (r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth) {
      scrollTo(scrollX + r.left + r.width / 2 - innerWidth / 2, scrollY + r.top + r.height / 2 - innerHeight / 2);
      r = box();
    }
    const cut = clips(el);
    // Not a cover: the control's own content or label; a transparent native control laid exactly over it to take the
    // click (a file input on its button); the page around the component; a sticky or fixed bar content scrolls under.
    const same = (a, b) => ["left", "top", "right", "bottom"].every((k) => Math.abs(a[k] - b[k]) <= 4);
    const pinned = (hit) => { for (let p = hit; p && p !== root; p = p.parentElement) if (/fixed|sticky/.test(getComputedStyle(p).position)) return true; return false; };
    const own = (hit) => el.contains(hit) || [...(el.labels ?? [])].some((l) => l.contains(hit)) || Boolean(hit.closest("label")?.contains(el))
      || (hit.matches("input, select, textarea") && !visible(hit) && same(hit.getBoundingClientRect(), r)) || !root.contains(hit) || pinned(hit);
    const points = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].map(([fx, fy]) => [r.left + r.width * fx, r.top + r.height * fy])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight && cut.every((c) => x >= c.left && x < c.right && y >= c.top && y < c.bottom));
    const hits = points.map(([x, y], i) => ({ i, hit: document.elementFromPoint(x, y) })).filter(({ hit }) => hit && !own(hit));
    // Its centre, or a side of it: a badge on one corner is a design, not a cover.
    if (hits.some(({ i }) => i === 0) || hits.length >= 2) issues.push({ landmark: named(el), property: "covered", actual: `${hits.length} of ${points.length} points under ${named(hits[0].hit)}` });
  }
  scrollTo(sx, sy);
  return { root: { width: rr.width, height: rr.height }, issues, rows, unmeasured };
}

// Compares the design's image with the page's, both at the device scale. Outside boxes owned by text checks,
// it finds the areas that differ and returns each as a box in CSS px, so a wrong icon, colour,
// border or image size is a finding with a place. Where the design's image is transparent there is nothing to match.
async function pixelDiff(page, reference, actual, { scale, ignore, shifts = [] }) {
  return page.evaluate(async ([ref, act, scale, ignore, shifts]) => {
    const load = (src) => new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => reject(new Error("image does not load")); i.src = src; });
    const [a, b] = await Promise.all([load(ref), load(act)]);
    const W = Math.max(a.width, b.width), H = Math.max(a.height, b.height);
    const canvas = (w, h, fill = "#fff") => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); if (fill) { x.fillStyle = fill; x.fillRect(0, 0, w, h); } return [c, x]; };
    const pixels = (img, fill) => { const [, x] = canvas(W, H, fill); x.drawImage(img, 0, 0); return x.getImageData(0, 0, W, H).data; };
    const A = pixels(a), B = pixels(b), alpha = pixels(a, null);
    const text = new Uint8Array(W * H);
    const pad = 2 * scale;
    for (const t of ignore) {
      for (let y = Math.max(0, Math.floor(t.y * scale - pad)); y < Math.min(H, Math.ceil((t.y + t.height) * scale + pad)); y++) {
        for (let x = Math.max(0, Math.floor(t.x * scale - pad)); x < Math.min(W, Math.ceil((t.x + t.width) * scale + pad)); x++) text[y * W + x] = 1;
      }
    }
    const [dc, dx] = canvas(W, H);
    const diff = dx.createImageData(W, H);
    const mask = new Uint8Array(W * H);
    let changed = 0;
    for (let i = 0, p = 0; i < A.length; i += 4, p++) {
      const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
      const inside = p % W < a.width && Math.floor(p / W) < a.height;
      if (d > 48) changed++;
      if (!text[p] && d > 16 && (!inside || alpha[i + 3] > 250)) mask[p] = 1;
      if (d > 48) diff.data.set([230, 0, 40, 255], i); else {
        const g = 255 - (255 - (B[i] * 0.3 + B[i + 1] * 0.59 + B[i + 2] * 0.11)) * 0.25;
        diff.data.set([g, g, g, 255], i);
      }
    }
    // Connected areas of differing pixels outside text, largest first; specks under 16 CSS px² are rendering noise.
    const regions = [];
    const queue = new Int32Array(W * H);
    for (let start = 0; start < mask.length; start++) {
      if (!mask[start]) continue;
      let head = 0, tail = 0, minX = W, minY = H, maxX = 0, maxY = 0, area = 0;
      queue[tail++] = start; mask[start] = 0;
      while (head < tail) {
        const p = queue[head++], x = p % W, y = (p - x) / W;
        area++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) {
          if (q >= 0 && mask[q]) { mask[q] = 0; queue[tail++] = q; }
        }
      }
      const box = { x: Math.round(minX / scale), y: Math.round(minY / scale), width: Math.round((maxX - minX + 1) / scale), height: Math.round((maxY - minY + 1) / scale) };
      if (area / (scale * scale) >= 16 && box.width >= 2 && box.height >= 2) regions.push({ box, area: Math.round(area / (scale * scale)) });
    }
    // An area that matches once the page is shifted by a nearby text's offset moved with that text: it belongs to
    // that text's finding, not to one of its own.
    const mismatches = (box, dx, dy) => {
      let n = 0;
      for (let y = Math.max(0, box.y * scale); y < (box.y + box.height) * scale; y++) for (let x = Math.max(0, box.x * scale); x < (box.x + box.width) * scale; x++) {
        const sx = Math.round(x + dx * scale), sy = Math.round(y + dy * scale);
        if (x >= W || y >= H) continue;
        const i = (y * W + x) * 4, j = (sy * W + sx) * 4;
        const outside = sx < 0 || sy < 0 || sx >= W || sy >= H;
        const d = outside ? 255 : Math.max(Math.abs(A[i] - B[j]), Math.abs(A[i + 1] - B[j + 1]), Math.abs(A[i + 2] - B[j + 2]));
        if (d > 16) n++;
      }
      return n;
    };
    const centre = (b) => [b.x + b.width / 2, b.y + b.height / 2];
    for (const r of regions) {
      const grow = { x: r.box.x - 2, y: r.box.y - 2, width: r.box.width + 4, height: r.box.height + 4 };
      const base = mismatches(grow, 0, 0);
      const [cx, cy] = centre(r.box);
      const nearest = [...shifts].sort((a, b) => Math.hypot(...centre(a.box).map((v, i) => v - [cx, cy][i])) - Math.hypot(...centre(b.box).map((v, i) => v - [cx, cy][i]))).slice(0, 4);
      for (const s of nearest) {
        if (!s.dx && !s.dy) continue;
        if (mismatches(grow, s.dx, s.dy) <= base * 0.2) { r.movedWith = s.label; break; }
      }
    }
    regions.sort((r, s) => s.area - r.area);
    dx.putImageData(diff, 0, 0);
    const gap = 12, [sc, sx] = canvas(W * 3 + gap * 2, H);
    sx.drawImage(a, 0, 0); sx.drawImage(b, W + gap, 0); sx.drawImage(dc, (W + gap) * 2, 0);
    return {
      ratio: changed / (W * H), sizeMatch: a.width === b.width && a.height === b.height,
      reference: `${a.width}×${a.height}`, actual: `${b.width}×${b.height}`,
      regions,
      png: { side: sc.toDataURL(), diff: dc.toDataURL() },
    };
  }, [`data:image/png;base64,${reference.toString("base64")}`, `data:image/png;base64,${actual.toString("base64")}`, scale, ignore, shifts]);
}

const writeDataUrl = (file, url) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(url.split(",")[1], "base64")); };
const dataUrl = (buf) => buf && `data:image/png;base64,${buf.toString("base64")}`;

// ------------------------------------------------------------------ commands

// The page as the work found it, kept from the first check (or why there was none); delete out/before to take it again.
function beforeFrame(out, frame, settings, shot, absent) {
  const dir = path.join(out, "before"), key = frameKey(frame.name);
  const png = path.join(dir, `${key}.png`), marker = path.join(dir, `${key}.txt`), stamp = path.join(dir, `${key}.sha256`);
  const digest = (data) => createHash("sha256").update(data).digest("hex");
  const settingsHash = digest(JSON.stringify(settings));
  if (!fs.existsSync(png) && !fs.existsSync(marker)) {
    fs.mkdirSync(dir, { recursive: true });
    const first = shot ?? absent;
    try {
      fs.writeFileSync(shot ? png : marker, first, { flag: "wx" });
      fs.writeFileSync(stamp, `${digest(first)} ${settingsHash}\n`);
    } catch (e) { if (e.code !== "EEXIST") throw e; }
  }
  const hasImage = fs.existsSync(png), first = fs.readFileSync(hasImage ? png : marker);
  const recorded = fs.existsSync(stamp) && fs.readFileSync(stamp, "utf8").trim().match(/^([a-f0-9]{64}) ([a-f0-9]{64})$/);
  let comparison;
  if (!recorded || recorded[1] !== digest(first)) comparison = "capture settings unknown";
  else if (recorded[2] !== settingsHash) comparison = "different capture settings, not comparable";
  return { ...(hasImage ? { image: dataUrl(first) } : { reason: first.toString("utf8") }), comparison };
}

async function measureFrames(browser, cfg, frames, ledger, out) {
  const scratch = await (await browser.newContext()).newPage();
  const results = [];
  for (const frame of frames) {
    const spec = readJson(frame.spec);
    const reference = frame.reference && fs.existsSync(frame.reference) ? fs.readFileSync(frame.reference) : null;
    const size = reference && pngSize(reference);
    const scale = size ? Math.max(1, Math.round(size.width / spec.frame.width)) : 1;
    // A frame of a state drawn outside the component, a popover or a sheet, names its own root.
    const fcfg = frame.root ? { ...cfg, root: frame.root } : cfg;
    const target = { ...frame, scale, height: Math.max(900, Math.ceil(spec.frame.height + 200)) };
    const settings = { url: frame.url, width: frame.width, host: fcfg.host ?? null, root: fcfg.root,
      setup: frame.setup ?? [], browser: contextOptions(fcfg, target) };
    let opened;
    try { opened = await open(browser, fcfg, target); }
    catch (e) {
      if (!e.unmeasured) throw e;
      const before = beforeFrame(out, frame, settings, null, e.message);
      results.push({ frame: frame.name, pass: false, verdict: "incomplete", unmeasured: e.message, beforeUnavailable: before.reason, beforeComparison: before.comparison,
        score: null, causes: [], issues: [], root: { spec: spec.frame, page: null }, images: {},
        gallery: { width: spec.frame.width, images: { design: dataUrl(reference), before: before.image } } });
      continue;
    }
    const { context, page } = opened;
    try {
      const targets = spec.landmarks.map((l) => (l.selector ? { selector: l.selector, nth: l.nth }
        : { text: l.text, alternate: pageText(l, frame.name, ledger), nth: l.nth, documentOrder: spec.source === "page snapshot" }));
      const measured = await page.evaluate(inPage, { command: "measure", root: fcfg.root, landmarks: targets });
      if (measured.error) throw Object.assign(new Error(`${frame.name}: ${measured.error}`), { exit: 2 });
      const shot = await (await rootOf(page, fcfg.root)).screenshot({ animations: "disabled", caret: "hide" });
      const dir = path.join(out, frameKey(frame.name));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "page.png"), shot);
      const before = beforeFrame(out, frame, settings, shot);
      measured.images = { page: path.relative(out, path.join(dir, "page.png")) };
      let regions = [];
      if (reference) {
        // Text is left out of the pixels: its landmarks measure it, or, for an image-only reference, the eye does.
        const ignore = [...measured.textBoxes, ...spec.landmarks.filter((l) => l.text).map((l) => l.box)];
        const shifts = spec.landmarks.map((l, i) => measured.landmarks[i]?.found
          && { label: l.text ?? l.selector, box: l.box, dx: measured.landmarks[i].box.x - l.box.x, dy: measured.landmarks[i].box.y - l.box.y }).filter(Boolean);
        const { png, regions: found, ...pixels } = await pixelDiff(scratch, reference, shot, { scale, ignore, shifts });
        for (const [name, url] of Object.entries(png)) {
          writeDataUrl(path.join(dir, `${name}.png`), url);
          measured.images[name] = path.relative(out, path.join(dir, `${name}.png`));
        }
        measured.pixels = pixels;
        regions = nameRegions(found, spec.landmarks);
      }
      const result = compareFrame({ frame: frame.name, spec, measured, tolerance: cfg.tolerance, ledger, regions, missingReference: !reference });
      if (before.reason) result.beforeUnavailable = before.reason;
      if (before.comparison) result.beforeComparison = before.comparison;
      result.openers = await (await rootOf(page, fcfg.root)).evaluate(openerInfoIn, { inventory: true });
      result.gallery = { width: spec.frame.width, images: {
        design: dataUrl(reference), before: before.image, after: dataUrl(shot),
        diff: reference ? dataUrl(fs.readFileSync(path.join(dir, "diff.png"))) : undefined,
      } };
      results.push(result);
    } finally {
      await context.close();
    }
  }
  return results;
}

// Collect the widths where a configured edge had fewer than two visible elements on this page.
function alignmentGaps(probes) {
  const short = new Map();
  probes.forEach((p, i) => {
    for (const u of p.unmeasured) {
      const k = `${u.selector}\u0000${u.edge}`;
      if (!short.has(k)) short.set(k, { selector: u.selector, edge: u.edge, matched: u.matched, probes: new Set(), widths: [] });
      const g = short.get(k);
      g.matched = Math.max(g.matched, u.matched);
      if (!g.probes.has(i)) { g.probes.add(i); g.widths.push(p.width); }
    }
  });
  return [...short.values()].map(({ widths: at, probes: seen, ...u }) => ({ ...u, ranges: ranges(at), everywhere: seen.size === probes.length }));
}

async function sweep(browser, cfg, ledger) {
  const s = cfg.sweep;
  const from = Number(s.from), to = Number(s.to), step = Number(s.step ?? 8);
  if (!(from > 0 && to >= from && step > 0)) throw Object.assign(new Error("sweep: give from, to and step in design.json"), { exit: 2 });
  const frameWidths = new Set(cfg.frames.map((f) => f.width).filter((w) => w >= from && w <= to));
  const widths = new Set(frameWidths);
  for (let w = to; w >= from; w -= step) widths.add(w);
  widths.add(from);
  const order = [...widths].sort((a, b) => b - a);
  // One mounted page for every width, narrowing from the widest, as a user resizes it: state set up once must survive.
  // A story (the longest data, every conditional action at once) is swept the same way, and pictured at the frames' widths.
  const run = async (url, setup, shots) => {
    const { context, page } = await open(browser, cfg, { url, width: order[0], setup });
    try {
      const probe = async (width) => {
        await setWidth(page, cfg, width, 900);
        await settle(page, cfg.root);
        const r = await page.evaluate(inPage, { command: "probe", root: cfg.root, align: s.align ?? [], tolerance: cfg.tolerance });
        if (r.error) throw Object.assign(new Error(`sweep at ${width}: ${r.error}`), { exit: 2 });
        // A picture for the gallery only: a root with no size to capture leaves a gap, not a failed check.
        if (shots && frameWidths.has(width) && !shots.has(width)) {
          shots.set(width, await (await rootOf(page, cfg.root)).screenshot({ animations: "disabled", caret: "hide", timeout: 5000 }).catch(() => null));
        }
        return { width, ...r };
      };
      const probes = [];
      for (const w of order) probes.push(await probe(w));
      const back = await probe(order[0]);
      const first = probes[0];
      if (Math.abs(back.root.width - first.root.width) > 1 || Math.abs(back.root.height - first.root.height) > 1) {
        back.issues.push({ landmark: "root", property: "resize", delta: Math.max(Math.abs(back.root.width - first.root.width), Math.abs(back.root.height - first.root.height)), actual: `${Math.round(first.root.width)}×${Math.round(first.root.height)} before narrowing, ${Math.round(back.root.width)}×${Math.round(back.root.height)} after widening back` });
      }
      return { probes, back };
    } finally {
      await context.close();
    }
  };
  const { probes, back } = await run(cfg.url, s.setup);
  const changes = switches(probes, s.switches ?? [], step);
  const issues = sweepIssues([...probes, back], ledger, changes.issues);
  const groups = alignmentGaps([...probes, back]);
  const stories = [];
  for (const story of s.stories ?? []) {
    const shots = new Map();
    let r;
    try { r = await run(story.url, story.setup, shots); }
    catch (e) { stories.push({ name: story.name, unmeasured: e.message.split("\n")[0], shots: [] }); continue; }
    const storyProbes = [...r.probes, r.back];
    groups.push(...alignmentGaps(storyProbes).map((g) => ({ ...g, story: story.name })));
    issues.push(...sweepIssues(storyProbes, ledger).map((i) => ({ ...i, story: story.name })));
    stories.push({ name: story.name, shots: [...shots].filter(([, png]) => png).map(([width, png]) => ({ width, image: dataUrl(png) })) });
  }
  const failing = issues.filter((i) => i.status === "fail");
  return {
    from, to, step, pass: failing.length === 0, issues, switches: changes.seen, stories,
    score: issues.filter((i) => i.status !== "accepted").length * 10,
    unmeasured: groups.filter((g) => g.everywhere), partial: groups.filter((g) => !g.everywhere),
  };
}

// Each journey on its own fresh page, at the widest frame's width unless it names one: its steps in order, the
// first that does not hold failing it.
async function journeys(browser, cfg) {
  const width = Math.max(...cfg.frames.map((f) => f.width));
  const results = [];
  for (const j of cfg.journeys) {
    let opened, failed;
    try { opened = await open(browser, cfg, { url: j.url, width: j.width ?? width, touch: Boolean(j.touch) }); }
    catch (e) { if (!e.unmeasured) throw e; failed = e.message; }
    const widths = opened ? [j.width ?? width] : [];
    const seen = new Set(), notes = [], closed = new Set();
    const targets = [...new Set(j.steps.filter((s) => "hidden" in s).map((s) => s.hidden))]
      .filter((t) => j.steps.some((s) => s.visible === t || s.text?.[0] === t));
    const observed = new Map();
    let trigger, visibleBefore = new Set();
    if (opened) {
      const { page } = opened;
      try {
        for (const [i, step] of j.steps.entries()) {
          try {
            const [action] = Object.keys(step), arg = step[action];
            if (targets.length && !EXPECT.includes(action) && action !== "wait") {
              visibleBefore = new Set();
              for (const t of targets) if (await anySeen(page, t)) {
                visibleBefore.add(t);
                if (observed.has(t)) observed.get(t).acted = true;
              }
              trigger = null;
              if (["hover", "click", "tap", "focus", "move", "press"].includes(action)) {
                const point = Array.isArray(arg) ? arg : undefined;
                const locator = page.locator(point || action === "press" ? "html" : arg).first();
                [trigger] = await locator.evaluate(openerInfoIn, { point, keyboard: action === "press" }, { timeout: 2000 }).catch(() => []);
              }
            }
            if ("width" in step) {
              await setWidth(page, cfg, step.width, 900);
              await settle(page, cfg.root);
              widths.push(step.width);
              continue;
            }
            await runStep(page, step);
            const shown = step.visible ?? step.text?.[0];
            if (shown) {
              seen.add(shown);
              if (observed.has(shown)) observed.get(shown).acted = false;
              if (trigger && targets.includes(shown) && !visibleBefore.has(shown)
                && (!trigger.ids.length || await anySeen(page, shown, step.text?.[1], trigger.ids))) {
                observed.set(shown, { key: trigger.key, acted: false });
              }
            }
            if ("hidden" in step) {
              const open = observed.get(arg);
              if (open?.acted) closed.add(open.key);
              else if (!seen.has(arg)) notes.push(`${arg} was never seen open before it was expected hidden`);
              else if (open) notes.push(`${arg} was not seen open before a closing action`);
              observed.delete(arg);
              seen.delete(arg);
              trigger = null;
            }
          } catch (e) { failed = `step ${i + 1}, ${JSON.stringify(step)}: ${e.message.split("\n")[0]}`; break; }
        }
      } finally { await opened.context.close(); }
    }
    results.push({ name: j.name, widths, pass: !failed, ...(failed ? { failed } : {}), ...(notes.length ? { notes } : {}), closed: [...closed] });
  }
  return results;
}

// The acceptance list as written in review.md: every line under a heading that names it (in English or Russian),
// subheadings included, code blocks left out; each table row past the header or each list item is a line, with its
// result from a column named Result (or Status), else the last column, or after a colon in a list item.
function acceptanceRows(cfg) {
  const file = path.join(cfg.dir, "review.md");
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm, "").split("\n");
  const body = [];
  let level = 0;
  for (const line of lines) {
    const h = line.match(/^(#+)\s+(.*)$/);
    if (h) {
      if (level && h[1].length <= level) level = 0;
      if (!level && /acceptance|приёмк|приемк/i.test(h[2])) level = h[1].length;
      body.push("");
    } else if (level) body.push(line);
  }
  const rows = [];
  let table = [];
  const flush = () => {
    const cells = table.filter((l) => !/^\s*\|?[\s|:-]*\|?\s*$/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    if (cells.length > 1) {
      const result = cells[0].findIndex((c) => /result|status|результат|итог/i.test(c));
      const method = cells[0].findIndex((c) => /^checked by$/i.test(c));
      for (const row of cells.slice(1)) rows.push({ item: row[0], method: row[method]?.replace(/^`([^`]+)`$/, "$1"), result: row[result >= 0 ? result : row.length - 1] ?? "" });
    }
    table = [];
  };
  for (const line of body) {
    if (/^\s*\|/.test(line)) { table.push(line); continue; }
    flush();
    const item = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*\S)/);
    if (item) { const [, what, result = ""] = item[1].match(/^(.*?)(?::\s+(.*))?$/); rows.push({ item: what, result }); }
  }
  flush();
  return rows;
}

// A row records a reported outcome. A method that names the checker's sweep also needs that measurement.
function assessRow(row, sweep) {
  const mark = row.result.match(/^(passed|pass|failed|fail|pending|incomplete|not checked|n\/a|not applicable)(?:\s*[:—–,-]\s*(.*))?$/i);
  const status = mark?.[1].toLowerCase(), detail = mark?.[2]?.trim();
  if (status === "fail" || status === "failed") return { ...row, status: "fail" };
  if (status === "pending") return { ...row, status };
  const na = status === "n/a" || status === "not applicable";
  if (na && detail) return { ...row, status: "n/a" };
  let reason;
  if (status === "pass" || status === "passed") {
    const measured = row.method === "sweep" || row.method === "sweep.stories";
    const issues = measured ? (sweep?.issues ?? []).filter((i) => Boolean(i.story) === (row.method === "sweep.stories")) : [];
    if (issues.some((i) => i.status === "fail")) return { ...row, status: "fail", reason: "the measurement failed" };
    if (!detail) reason = "pass has no evidence";
    else if (row.method === "sweep" && (!sweep || sweep.reason || sweep.unmeasured?.some((u) => !u.story))) reason = "the width sweep was not fully measured";
    else if (row.method === "sweep.stories" && (!sweep?.stories?.length || sweep.stories.some((s) => s.unmeasured) || sweep.unmeasured?.some((u) => u.story))) reason = "additional stories were not all measured";
    else if (issues.some((i) => i.status === "pending")) return { ...row, status: "pending", reason: "the measurement awaits a decision" };
    else return { ...row, status: "pass" };
  } else reason = na ? "N/A has no reason" : mark || !row.result ? "not checked" : "no recognized result";
  return { ...row, status: "incomplete", reason };
}

function acceptanceGaps(cfg, rows, sweepResult, results, journeyResults) {
  const gaps = [];
  if (!rows.length) gaps.push("review.md has no acceptance list: write it before the first edit to the product's code");
  for (const r of rows) if (r.status === "incomplete") gaps.push(`acceptance “${r.item}”: ${r.reason}`);
  const openers = new Map(results.flatMap((r) => (r.openers ?? []).map((o) => [o.key, o.name])));
  const closed = new Set(journeyResults.filter((j) => j.pass).flatMap((j) => j.closed));
  const unchecked = [...openers].filter(([key]) => !closed.has(key)).map(([, name]) => name);
  if (unchecked.length) gaps.push(`${unchecked.length} control${unchecked.length === 1 ? "" : "s"} open${unchecked.length === 1 ? "s" : ""} something with no journey that opens and closes ${unchecked.length === 1 ? "it" : "them"}: ${unchecked.slice(0, 4).map((o) => `“${o}”`).join(", ")}${unchecked.length > 4 ? ", …" : ""}`);
  const dir = path.join(cfg.dir, "frames");
  const framed = new Set(cfg.frames.map((f) => f.reference && path.resolve(f.reference)));
  if (fs.existsSync(dir)) {
    const unframed = fs.readdirSync(dir).map((d) => path.join(dir, d, "reference.png")).filter((p) => fs.existsSync(p) && !framed.has(p));
    if (unframed.length) gaps.push(`references no frame checks: ${unframed.map((p) => path.relative(cfg.dir, p)).join(", ")}`);
  }
  for (const st of sweepResult?.stories ?? []) if (st.unmeasured) gaps.push(`the story ${st.name} was not swept: ${st.unmeasured}`);
  return gaps;
}

async function check(file, flags) {
  const cfg = loadConfig(file);
  const out = path.resolve(flags.out ?? path.join(cfg.dir, "out"));
  // The evidence a handoff quotes is only ever the last complete check's: any other run removes it first.
  const handoff = path.join(out, "handoff.md");
  fs.rmSync(handoff, { force: true });
  const raw = cfg.ledger && fs.existsSync(cfg.ledger) ? readJson(cfg.ledger) : [];
  const ledgerProblems = ledgerFaults(raw);
  const ledger = Array.isArray(raw) ? raw : [];
  const frames = cfg.frames.filter((f) => !flags.frame || f.name === flags.frame);
  if (flags.frame && !frames.length) throw Object.assign(new Error(`no frame named ${flags.frame}`), { exit: 2 });
  const full = !flags.frame;
  const browser = await (await chromium()).launch();
  try {
    const results = await measureFrames(browser, cfg, frames, ledger, out);
    let sweepResult;
    if (cfg.sweep && full && !flags["no-sweep"]) {
      try { sweepResult = await sweep(browser, cfg, ledger); }
      catch (e) {
        if (!e.unmeasured) throw e;
        sweepResult = { from: cfg.sweep.from, to: cfg.sweep.to, step: cfg.sweep.step ?? 8, pass: false, verdict: "incomplete",
          reason: e.message, issues: [], switches: [], score: 0 };
      }
    }
    const journeyResults = full ? await journeys(browser, cfg) : [];
    // A complete check (every frame, the sweep) is the evidence for a handoff; --frame and --no-sweep are partial.
    const complete = full && !flags["no-sweep"];
    const rows = acceptanceRows(cfg);
    const acceptance = complete ? rows.map((row) => assessRow(row, sweepResult)) : [];
    const gaps = complete ? acceptanceGaps(cfg, acceptance, sweepResult, results, journeyResults) : [];
    const issues = [...results.flatMap((r) => r.issues), ...(sweepResult?.issues ?? [])];
    const pending = issues.some((issue) => issue.status === "pending") || acceptance.some((row) => row.status === "pending");
    const missingReferences = frames.filter((frame) => !frame.reference || !fs.existsSync(frame.reference)).map((frame) => frame.name);
    const unmeasured = sweepResult?.unmeasured?.some((u) => !u.story);
    const imageOnlyFrames = results.filter((r) => r.imageOnly).map((r) => r.frame);
    const passed = results.every((r) => r.pass) && (sweepResult?.pass ?? true) && ledgerProblems.length === 0;
    const failed = issues.some((issue) => issue.status === "fail") || ledgerProblems.length > 0 || journeyResults.some((j) => !j.pass) || acceptance.some((row) => row.status === "fail");
    const status = failed ? "fail"
      : results.some((r) => r.verdict === "incomplete") || unmeasured || sweepResult?.verdict === "incomplete" || gaps.length ? "incomplete"
        : pending ? "pending" : passed ? "pass" : "fail";
    const pass = status === "pass";
    const score = totalScore(results, sweepResult, journeyResults);
    fs.mkdirSync(out, { recursive: true });
    const historyFile = path.join(out, "history.jsonl");
    const history = fs.existsSync(historyFile) ? fs.readFileSync(historyFile, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
    const n = history.length + 1;
    // What the score was measured against: the frames' specs and the sweep. A round that changed them starts a new
    // series, since its score says nothing about the page against the earlier ones.
    const digest = (file) => (file && fs.existsSync(file) ? createHash("sha256").update(fs.readFileSync(file)).digest("hex") : null);
    const basis = createHash("sha256").update(JSON.stringify([cfg.tolerance, cfg.url, cfg.root, cfg.host ?? null, cfg.viewport ?? null,
      frames.map((f) => [f, fs.readFileSync(f.spec, "utf8"), digest(f.reference)]), sweepResult ? cfg.sweep : null, full ? cfg.journeys : null])).digest("hex").slice(0, 12);
    const record = { round: n, time: new Date().toISOString(), frames: frames.map((f) => f.name), sweep: Boolean(sweepResult), basis, review: rows.length > 0, status, score };
    fs.appendFileSync(historyFile, `${JSON.stringify(record)}\n`);
    // Progress is read against rounds measured the same way: the one before, the lowest, and how many rounds since it.
    const comparable = history.filter((h) => h.score != null && h.basis === basis);
    const series = score === null ? comparable : [...comparable, record];
    const previous = comparable.at(-1);
    const best = series.reduce((a, h) => (!a || h.score < a.score ? h : a), null);
    const stalled = score === null ? 0 : series.length - 1 - series.indexOf(best);
    const restarted = history.length > 0 && !comparable.length;
    const data = { frames: results, sweep: sweepResult, journeys: journeyResults, acceptance, gaps, ledgerProblems, round: n, previous, best, stalled, restarted, status, missingReferences, imageOnlyFrames };
    fs.writeFileSync(path.join(out, "report.md"), `${renderReport(data)}\n`);
    if (complete) {
      const git = (...args) => spawnSync("git", args, { cwd: cfg.dir, encoding: "utf8" });
      const commit = git("rev-parse", "--short", "HEAD"), dirty = git("status", "--porcelain").stdout?.trim();
      const stamp = `${record.time}${commit.status === 0 ? ` · commit ${commit.stdout.trim()}${dirty ? " with uncommitted changes" : ""}` : ""}`;
      const pictures = [...results.map((r) => r.images?.page && path.join(path.dirname(r.images.page), "side.png")).filter((p) => p && fs.existsSync(path.join(out, p))), "gallery.html"];
      fs.writeFileSync(handoff, `${renderHandoff({ ...data, ledger, score, journeySpecs: cfg.journeys, stamp, pictures })}\n`);
    }
    writeJson(path.join(out, "result.json"), { pass, score, round: n, ...data, frames: results.map(({ gallery, ...r }) => r) });
    // The gallery is the record to hand over: written only by a complete check.
    if (complete) fs.writeFileSync(path.join(out, "gallery.html"), renderGallery({ title: `Design check · ${path.basename(cfg.dir)}`, frames: results.map((r) => ({ result: r, ...r.gallery })), sweep: sweepResult, journeys: journeyResults, gaps, ledger }));
    const where = path.relative(process.cwd(), out) || ".";
    console.log(renderSummary(data, { file: `${where}/report.md` }));
    console.log(`Verdict: ${status}${complete ? "" : " on what this partial check measured"}${missingReferences.length ? `; missing reference images: ${missingReferences.join(", ")}` : ""}`);
    if (complete) console.log(`Gallery (design, before, after): ${where}/gallery.html · evidence for the handoff: ${where}/handoff.md`);
    else console.log(`A partial check (${flags.frame ? "--frame" : "--no-sweep"}): it is not the evidence for a handoff.`);
    return status === "pass" ? 0 : status === "incomplete" ? 2 : status === "pending" ? 3 : 1;
  } finally {
    await browser.close();
  }
}

async function snapshot(file, flags) {
  const cfg = loadConfig(file);
  const frames = cfg.frames.filter((f) => !flags.frame || f.name === flags.frame);
  const scale = Number(flags.scale ?? 1);
  const browser = await (await chromium()).launch();
  try {
    for (const frame of frames) {
      if (fs.existsSync(frame.spec) && !flags.force) throw Object.assign(new Error(`${frame.spec} exists; pass --force to replace it`), { exit: 2 });
      const fcfg = frame.root ? { ...cfg, root: frame.root } : cfg;
      const { context, page } = await open(browser, fcfg, { ...frame, scale, height: 2000 });
      try {
        const r = await page.evaluate(inPage, { command: "snapshot", root: fcfg.root });
        if (r.error) throw Object.assign(new Error(`${frame.name}: ${r.error}`), { exit: 2 });
        const round = (n) => Math.round(n * 100) / 100;
        const landmarks = r.landmarks.map((l) => ({ ...l, box: Object.fromEntries(Object.entries(l.box).map(([k, v]) => [k, round(v)])) }));
        writeJson(frame.spec, { frame: { name: frame.name, width: round(r.root.width), height: round(r.root.height) }, source: "page snapshot", widths: true, landmarks });
        if (flags.images) {
          if (!frame.reference) throw Object.assign(new Error(`${frame.name}: no "reference" path to write the image to`), { exit: 2 });
          fs.mkdirSync(path.dirname(frame.reference), { recursive: true });
          fs.writeFileSync(frame.reference, await (await rootOf(page, fcfg.root)).screenshot({ animations: "disabled", caret: "hide" }));
        }
        console.log(`${frame.name}: ${landmarks.length} landmarks → ${path.relative(process.cwd(), frame.spec)}`);
      } finally {
        await context.close();
      }
    }
    return 0;
  } finally {
    await browser.close();
  }
}

// One frame from Figma's REST API: its spec, with each text's characters, box, alignment and font, and its image.
async function figma(url, flags) {
  const token = process.env.FIGMA_TOKEN;
  if (!token) throw Object.assign(new Error("set FIGMA_TOKEN to a Figma personal access token (Figma: Settings, Security, Personal access tokens)"), { exit: 2 });
  if (!flags.out) throw Object.assign(new Error("give --out <frame directory>"), { exit: 2 });
  const { key, id } = parseFigmaUrl(url);
  const get = async (endpoint) => {
    const res = await fetch(`https://api.figma.com/v1/${endpoint}`, { headers: { "X-Figma-Token": token } });
    if (!res.ok) throw Object.assign(new Error(`Figma ${endpoint.split("?")[0]}: ${res.status} ${await res.text()}`), { exit: 2 });
    return res.json();
  };
  const nodes = await get(`files/${key}/nodes?ids=${encodeURIComponent(id)}`);
  const node = nodes.nodes?.[id]?.document;
  if (!node) throw Object.assign(new Error(`Figma returned no node ${id}`), { exit: 2 });
  const spec = specFromRest(node);
  const out = path.resolve(flags.out);
  writeJson(path.join(out, "spec.json"), spec);
  const scale = Number(flags.scale ?? 2);
  const images = await get(`images/${key}?ids=${encodeURIComponent(id)}&scale=${scale}&format=png`);
  const src = images.images?.[id];
  if (!src) throw Object.assign(new Error(`Figma rendered no image for ${id}: ${images.err ?? "no reason given"}`), { exit: 2 });
  const png = await fetch(src);
  if (!png.ok) throw Object.assign(new Error(`downloading the image: ${png.status}`), { exit: 2 });
  fs.writeFileSync(path.join(out, "reference.png"), Buffer.from(await png.arrayBuffer()));
  console.log(`${spec.frame.name}: ${spec.frame.width} × ${spec.frame.height}, ${spec.landmarks.length} texts → ${path.relative(process.cwd(), out)}/spec.json, reference.png at ${scale}×`);
  return 0;
}

async function main(argv) {
  const { command, file, flags } = parseArgs(argv);
  if (!command || !file || flags.help) { console.log(USAGE); return command ? 0 : 2; }
  if (command === "figma") return figma(file, flags);
  if (command === "spec") {
    let spec = specFromMetadata(fs.readFileSync(file, "utf8"), { frame: flags.frame, coords: flags.coords ?? "auto" });
    if (flags.context) {
      const joined = joinContext(spec, fs.readFileSync(flags.context, "utf8"));
      spec = joined.spec;
      console.error(`Texts from the design context: ${joined.joined.length} of ${joined.joined.length + joined.missing.length} layers${joined.missing.length ? `; read these from the frame's image: ${joined.missing.join(", ")}` : ""}.`);
    } else {
      // The outline carries layer names, which are the text only when nobody renamed the layer.
      const generic = spec.landmarks.filter((l) => /^(value|description|text|label|title|caption)(\s*\d+)?$/i.test(l.text ?? "")).length;
      if (generic) console.error(`${generic} text layers have generic names: pass --context with the frame's design context, or correct them from the image.`);
    }
    if (flags.out) { writeJson(flags.out, spec); console.log(`${spec.landmarks.length} landmarks, ${spec.source} → ${flags.out}`); } else console.log(JSON.stringify(spec, null, 2));
    return 0;
  }
  if (command === "check") return check(file, flags);
  if (command === "snapshot") return snapshot(file, flags);
  console.log(USAGE);
  return 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.exit(code), (e) => { console.error(`design: ${e.message}`); process.exit(e.exit ?? 2); });
}

export { inPage, main };
