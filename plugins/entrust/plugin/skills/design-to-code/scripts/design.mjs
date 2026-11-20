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
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  compareFrame, joinContext, ledgerFaults, nameRegions, pageText, parseFigmaUrl, ranges, renderGallery, renderReport, renderSummary,
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
  if (!Array.isArray(journeys) || journeys.some((j) => !j?.name || !Array.isArray(j.steps))) throw new Error("design.json: each journey needs a name and steps");
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

async function settle(page, selector) {
  await page.locator(selector).first().evaluate(async (root) => {
    await document.fonts.ready;
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

async function runStep(page, step) {
  const [action] = Object.keys(step);
  const arg = step[action];
  const point = Array.isArray(arg) && arg.length === 2 && arg.every(Number.isFinite);
  if (action === "wait") return page.waitForTimeout(Number(arg));
  if (action === "press") return page.keyboard.press(arg);
  if (action === "fill") return page.locator(arg[0]).first().fill(arg[1]);
  if (action === "move") return point ? page.mouse.move(arg[0], arg[1], { steps: 8 }) : page.locator(arg).first().hover();
  if (action === "tap") return point ? page.touchscreen.tap(arg[0], arg[1]) : page.locator(arg).first().tap();
  // What a journey expects, given a second to come true.
  if (action === "visible" || action === "hidden") {
    return page.locator(arg).first().waitFor({ state: action, timeout: 1000 }).catch(() => { throw new Error(`${arg} is not ${action}`); });
  }
  if (action === "text") {
    return page.waitForFunction(([sel, text]) => [...document.querySelectorAll(sel)].some((e) => e.innerText.includes(text)), arg, { timeout: 1000 })
      .catch(() => { throw new Error(`no ${arg[0]} shows “${arg[1]}”`); });
  }
  if (!["click", "hover", "focus"].includes(action)) throw new Error(`unknown step ${JSON.stringify(step)}`);
  return page.locator(arg).first()[action]();
}

async function open(browser, cfg, { url, width, setup = [], viewport, height = 900, scale = 1, touch = false }) {
  const viewportWidth = viewport ?? (cfg.host ? Math.max(cfg.viewport ?? 1280, width) : width);
  const context = await browser.newContext({ viewport: { width: viewportWidth, height }, deviceScaleFactor: scale, reducedMotion: "reduce", hasTouch: touch });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.addStyleTag({ content: STILL });
  if (!cfg.host || (setup.length && await page.locator(cfg.host).count())) await setWidth(page, cfg, width, height);
  try {
    for (const step of setup) await runStep(page, step);
    await page.locator(cfg.root).first().waitFor({ state: "attached", timeout: 15000 });
  } catch (e) {
    const absent = e.name === "TimeoutError" && !(await page.locator(cfg.root).count());
    await context.close();
    if (!absent) throw e;
    const cause = setup.length ? ` (setup: ${e.message.split("\n")[0]})` : "";
    throw Object.assign(new Error(`Root ${cfg.root} was absent at capture time${cause}.`), { missingRoot: true, exit: 2 });
  }
  if (cfg.host) await setWidth(page, cfg, width, height);
  await settle(page, cfg.root);
  return { context, page };
}

// Runs inside the page. One function, so its helpers travel with it: measure the spec's landmarks, snapshot every
// text as a landmark, or probe the layout at the current width for the sweep.
async function inPage({ command, root: rootSelector, landmarks = [], align = [], tolerance = 1 }) {
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const key = (s) => s.replace(/[\s\u200b]+/g, "").toLocaleLowerCase();
  const root = document.querySelector(rootSelector);
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
  const deliberate = (style) => style.textOverflow === "ellipsis" || (style.webkitLineClamp && style.webkitLineClamp !== "none");
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
    const clipX = /hidden|clip/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;
    const clipY = /hidden|clip/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1;
    const cut = Math.max(clipX ? el.scrollWidth - el.clientWidth : 0, clipY ? el.scrollHeight - el.clientHeight : 0);
    if (clipX || clipY) issues.push({ landmark: label(el.textContent), property: "clipped", delta: cut, actual: `${cut} px cut off ${clipX ? "horizontally" : "vertically"}` });
  }
  const nodes = await textNodes();
  const lines = nodes.flatMap((n) => lineBoxes(trimmed(n), n.parentElement).map((b) => ({ node: n, b })));
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
    if (!visible(el) || el.disabled || el.getAttribute("aria-disabled") === "true") continue;
    let r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth) {
      scrollTo(scrollX + r.left + r.width / 2 - innerWidth / 2, scrollY + r.top + r.height / 2 - innerHeight / 2);
      r = el.getBoundingClientRect();
    }
    const cut = clips(el);
    const own = (hit) => el.contains(hit) || hit.contains(el) || [...(el.labels ?? [])].some((l) => l.contains(hit)) || Boolean(hit.closest("label")?.contains(el));
    const points = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].map(([fx, fy]) => [r.left + r.width * fx, r.top + r.height * fy])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight && cut.every((c) => x >= c.left && x < c.right && y >= c.top && y < c.bottom));
    const hits = points.map(([x, y]) => document.elementFromPoint(x, y)).filter((hit) => hit && !own(hit));
    if (hits.length) issues.push({ landmark: named(el), property: "covered", actual: `${hits.length} of ${points.length} points under ${named(hits[0])}` });
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
function beforeFrame(out, frame, shot, absent) {
  const dir = path.join(out, "before"), key = frameKey(frame.name);
  const png = path.join(dir, `${key}.png`), marker = path.join(dir, `${key}.txt`);
  if (fs.existsSync(png)) return { image: dataUrl(fs.readFileSync(png)) };
  if (fs.existsSync(marker)) return { reason: fs.readFileSync(marker, "utf8") };
  fs.mkdirSync(dir, { recursive: true });
  if (shot) { fs.writeFileSync(png, shot); return { image: dataUrl(shot) }; }
  fs.writeFileSync(marker, absent);
  return { reason: absent };
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
    let opened;
    try { opened = await open(browser, fcfg, { ...frame, scale, height: Math.max(900, Math.ceil(spec.frame.height + 200)) }); }
    catch (e) {
      if (!e.missingRoot) throw e;
      const before = beforeFrame(out, frame, null, e.message);
      results.push({ frame: frame.name, pass: false, verdict: "incomplete", unmeasured: e.message, beforeUnavailable: before.reason,
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
      const shot = await page.locator(fcfg.root).first().screenshot({ animations: "disabled", caret: "hide" });
      const dir = path.join(out, frameKey(frame.name));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "page.png"), shot);
      const before = beforeFrame(out, frame, shot);
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
          shots.set(width, await page.locator(cfg.root).first().screenshot({ animations: "disabled", caret: "hide", timeout: 5000 }).catch(() => null));
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
  const stories = [];
  for (const story of s.stories ?? []) {
    const shots = new Map();
    const r = await run(story.url, story.setup, shots);
    issues.push(...sweepIssues([...r.probes, r.back], ledger).map((i) => ({ ...i, story: story.name })));
    stories.push({ name: story.name, shots: [...shots].filter(([, png]) => png).map(([width, png]) => ({ width, image: dataUrl(png) })) });
  }
  const failing = issues.filter((i) => i.status === "fail");
  // A group never measured anywhere is incomplete; one that drops below two elements at some widths, as a column
  // hidden on narrow screens does, was measured where it exists, and the widths without it are only reported.
  // One group is one selector and edge; each probe counts once for it. Stories are measured where they have one.
  const all = [...probes, back], short = new Map();
  all.forEach((p, i) => {
    for (const u of p.unmeasured) {
      const k = `${u.selector}\u0000${u.edge}`;
      if (!short.has(k)) short.set(k, { selector: u.selector, edge: u.edge, matched: u.matched, probes: new Set(), widths: [] });
      const g = short.get(k);
      g.matched = Math.max(g.matched, u.matched);
      if (!g.probes.has(i)) { g.probes.add(i); g.widths.push(p.width); }
    }
  });
  const groups = [...short.values()].map(({ widths: at, probes: seen, ...u }) => ({ ...u, ranges: ranges(at), everywhere: seen.size === all.length }));
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
    catch (e) { if (!e.missingRoot) throw e; failed = e.message; }
    if (opened) {
      try {
        for (const [i, step] of j.steps.entries()) {
          try { await runStep(opened.page, step); } catch (e) { failed = `step ${i + 1}, ${JSON.stringify(step)}: ${e.message.split("\n")[0]}`; break; }
        }
      } finally { await opened.context.close(); }
    }
    results.push({ name: j.name, pass: !failed, ...(failed ? { failed } : {}) });
  }
  return results;
}

// What a full check expects beyond the frames: review.md with the acceptance list, every reference in the pack's
// frames/ checked by a frame, and a dense story in the sweep. A gap leaves the check incomplete, so "pass" means the
// acceptance list was written and its measured part ran.
const reviewed = (cfg) => {
  const file = path.join(cfg.dir, "review.md");
  return fs.existsSync(file) && /acceptance/i.test(fs.readFileSync(file, "utf8"));
};
function acceptanceGaps(cfg, flags) {
  const gaps = [];
  if (!reviewed(cfg)) gaps.push("review.md has no acceptance list: write it before the first product edit");
  const dir = path.join(cfg.dir, "frames");
  const framed = new Set(cfg.frames.map((f) => f.reference && path.resolve(f.reference)));
  if (fs.existsSync(dir)) {
    const unframed = fs.readdirSync(dir).map((d) => path.join(dir, d, "reference.png")).filter((p) => fs.existsSync(p) && !framed.has(p));
    if (unframed.length) gaps.push(`references no frame checks: ${unframed.map((p) => path.relative(cfg.dir, p)).join(", ")}`);
  }
  if (cfg.sweep && !flags["no-sweep"] && !cfg.sweep.stories?.length) gaps.push("no dense story is swept: add one to sweep.stories");
  return gaps;
}

async function check(file, flags) {
  const cfg = loadConfig(file);
  const out = path.resolve(flags.out ?? path.join(cfg.dir, "out"));
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
        if (!e.missingRoot) throw e;
        sweepResult = { from: cfg.sweep.from, to: cfg.sweep.to, step: cfg.sweep.step ?? 8, pass: false, verdict: "incomplete",
          reason: e.message, issues: [], switches: [], score: 0 };
      }
    }
    const journeyResults = full ? await journeys(browser, cfg) : [];
    const gaps = full ? acceptanceGaps(cfg, flags) : [];
    const issues = [...results.flatMap((r) => r.issues), ...(sweepResult?.issues ?? [])];
    const pending = issues.some((issue) => issue.status === "pending");
    const missingReferences = frames.filter((frame) => !frame.reference || !fs.existsSync(frame.reference)).map((frame) => frame.name);
    const unmeasured = sweepResult?.unmeasured ?? [];
    const imageOnlyFrames = results.filter((r) => r.imageOnly).map((r) => r.frame);
    const passed = results.every((r) => r.pass) && (sweepResult?.pass ?? true) && ledgerProblems.length === 0;
    const failed = issues.some((issue) => issue.status === "fail") || ledgerProblems.length > 0 || journeyResults.some((j) => !j.pass);
    const status = failed ? "fail"
      : results.some((r) => r.verdict === "incomplete") || unmeasured.length || sweepResult?.verdict === "incomplete" || gaps.length ? "incomplete"
        : pending ? "pending" : passed ? "pass" : "fail";
    const pass = status === "pass";
    const score = totalScore(results, sweepResult, journeyResults);
    fs.mkdirSync(out, { recursive: true });
    const historyFile = path.join(out, "history.jsonl");
    const history = fs.existsSync(historyFile) ? fs.readFileSync(historyFile, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
    const n = history.length + 1;
    // What the score was measured against: the frames' specs and the sweep. A round that changed them starts a new
    // series, since its score says nothing about the page against the earlier ones.
    const basis = createHash("sha256").update(JSON.stringify([frames.map((f) => [f.name, fs.readFileSync(f.spec, "utf8")]),
      sweepResult ? cfg.sweep : null])).digest("hex").slice(0, 12);
    const record = { round: n, time: new Date().toISOString(), frames: frames.map((f) => f.name), sweep: Boolean(sweepResult), basis, review: reviewed(cfg), status, score };
    fs.appendFileSync(historyFile, `${JSON.stringify(record)}\n`);
    // Progress is read against rounds measured the same way: the one before, the lowest, and how many rounds since it.
    const comparable = history.filter((h) => h.score != null && h.basis === basis);
    const series = score === null ? comparable : [...comparable, record];
    const previous = comparable.at(-1);
    const best = series.reduce((a, h) => (!a || h.score < a.score ? h : a), null);
    const stalled = score === null ? 0 : series.length - 1 - series.indexOf(best);
    const restarted = history.length > 0 && history.at(-1).basis !== basis;
    const data = { frames: results, sweep: sweepResult, journeys: journeyResults, gaps, ledgerProblems, round: n, previous, best, stalled, restarted, status, missingReferences, imageOnlyFrames };
    fs.writeFileSync(path.join(out, "report.md"), `${renderReport(data)}\n`);
    writeJson(path.join(out, "result.json"), { pass, score, round: n, ...data, frames: results.map(({ gallery, ...r }) => r) });
    // The gallery is the record to hand over: written only by a check of every frame.
    if (full) fs.writeFileSync(path.join(out, "gallery.html"), renderGallery({ title: `Design check · ${path.basename(cfg.dir)}`, frames: results.map((r) => ({ result: r, ...r.gallery })), sweep: sweepResult, journeys: journeyResults, gaps, ledger }));
    const where = path.relative(process.cwd(), out) || ".";
    console.log(renderSummary(data, { file: `${where}/report.md` }));
    console.log(`Verdict: ${status}${missingReferences.length ? `; missing reference images: ${missingReferences.join(", ")}` : ""}`);
    if (full) console.log(`Gallery (design, before, after): ${where}/gallery.html`);
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
          fs.writeFileSync(frame.reference, await page.locator(fcfg.root).first().screenshot({ animations: "disabled", caret: "hide" }));
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
