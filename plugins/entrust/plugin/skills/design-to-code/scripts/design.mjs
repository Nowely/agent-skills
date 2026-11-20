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
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  compareFrame, isImageOnly, joinContext, ledgerFaults, nameRegions, pageText, parseFigmaUrl, ranges, renderGallery, renderReport, renderSummary,
  specFromMetadata, specFromRest, sweepIssues, switches,
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
const slug = (s) => String(s).replace(/[^\w.-]+/g, "-");

function loadConfig(file) {
  const dir = path.dirname(path.resolve(file));
  const cfg = readJson(file);
  const at = (p) => (p ? path.resolve(dir, p) : p);
  const url = (u) => (!u || /^[a-z][\w+.-]*:/i.test(u) ? u : pathToFileURL(path.resolve(dir, u)).href);
  for (const key of ["url", "root", "frames"]) if (!cfg[key]) throw new Error(`design.json: no "${key}"`);
  return {
    ...cfg, dir, url: url(cfg.url), ledger: at(cfg.ledger), tolerance: cfg.tolerance ?? 1,
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

const STILL = "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
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
  await settle(page);
}

async function runStep(page, step) {
  const [action] = Object.keys(step);
  const arg = step[action];
  if (action === "wait") return page.waitForTimeout(Number(arg));
  if (action === "press") return page.keyboard.press(arg);
  if (action === "fill") return page.locator(arg[0]).first().fill(arg[1]);
  if (!["click", "hover", "focus"].includes(action)) throw new Error(`unknown setup step ${JSON.stringify(step)}`);
  return page.locator(arg).first()[action]();
}

async function open(browser, cfg, { url, width, setup = [], viewport, height = 900, scale = 1 }) {
  const viewportWidth = viewport ?? (cfg.host ? Math.max(cfg.viewport ?? 1280, width) : width);
  const context = await browser.newContext({ viewport: { width: viewportWidth, height }, deviceScaleFactor: scale, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.addStyleTag({ content: STILL });
  await page.locator(cfg.root).first().waitFor({ state: "attached", timeout: 15000 });
  await setWidth(page, cfg, width, height);
  for (const step of setup) await runStep(page, step);
  await settle(page);
  return { context, page };
}

// Runs inside the page. One function, so its helpers travel with it: measure the spec's landmarks, snapshot every
// text as a landmark, or probe the layout at the current width for the sweep.
function inPage({ command, root: rootSelector, landmarks = [], align = [], tolerance = 1 }) {
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const key = (s) => s.replace(/\s+/g, "").toLocaleLowerCase();
  const root = document.querySelector(rootSelector);
  if (!root) return { error: `the root ${rootSelector} is not on the page` };
  const rr = root.getBoundingClientRect();
  const visible = (el) => el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
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
  const textNodes = () => {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.data.trim() && visible(n.parentElement)) out.push(n);
    return out;
  };
  const trimmed = (n) => {
    const range = document.createRange();
    range.setStart(n, n.data.search(/\S/));
    range.setEnd(n, n.data.trimEnd().length);
    return range;
  };
  // Every text's line boxes relative to the root: the areas the pixel comparison leaves to the text checks.
  const textBoxes = () => textNodes().flatMap((n) => lineBoxes(trimmed(n), n.parentElement)
    .map((l) => ({ x: l.left - rr.left, y: l.top - rr.top, width: l.right - l.left, height: l.bottom - l.top })));

  if (command === "measure") {
    // The root's visible text without spaces, lower-cased, each character mapped back to its node and offset, and
    // the places a word may start or end: a node boundary or a space. A landmark is found only between such places,
    // so "16" is not found inside "18626".
    const chars = [], starts = new Set([0]), ends = new Set();
    let text = "";
    for (const n of textNodes()) {
      if (text.length) { ends.add(text.length); starts.add(text.length); }
      for (let i = 0; i < n.data.length; i++) {
        if (/\s/.test(n.data[i])) { if (text.length) { ends.add(text.length); starts.add(text.length); } continue; }
        text += n.data[i].toLocaleLowerCase();
        chars.push({ node: n, offset: i });
      }
    }
    ends.add(text.length);
    const found = landmarks.map((l) => {
      if (l.selector) {
        const el = root.querySelectorAll(l.selector)[l.nth ?? 0];
        if (!el || !visible(el)) return { found: false };
        const r = el.getBoundingClientRect();
        return { found: true, box: { x: r.left - rr.left, y: r.top - rr.top, width: r.width, height: r.height }, align: "left" };
      }
      const target = key(l.text);
      if (l.documentOrder) {
        // A page snapshot contains whole text nodes in document order. Matching
        // substrings of larger nodes would change the ordinal of repeated text.
        const node = textNodes().filter((n) => key(norm(n.data)) === target)[l.nth ?? 0];
        if (node) {
          const lines = lineBoxes(trimmed(node), node.parentElement);
          return { found: true, box: boxOf(lines), lines: lines.length, align: alignOf(node.parentElement), font: fontOf(node.parentElement) };
        }
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
        return { range, el: a.node.parentElement, whole: key(el.textContent) === target };
      });
      // Prefer a whole element for Figma landmarks; snapshots retain document order.
      if (!l.documentOrder) ranges.sort((x, y) => Number(y.whole) - Number(x.whole));
      const hit = ranges[l.nth ?? 0];
      if (!hit) return { found: false };
      const lines = lineBoxes(hit.range, hit.el);
      return { found: true, box: boxOf(lines), lines: lines.length, align: alignOf(hit.el), font: fontOf(hit.el) };
    });
    // A family the page asks for that does not draw the page's own characters renders them in a fallback: a font
    // that failed to load, a missing subset. Each text is tried in the first family its stack names; a family that
    // draws them, an icon font included, differs in width from every generic one.
    const ctx = document.createElement("canvas").getContext("2d");
    const width = (font, sample) => { ctx.font = font; return ctx.measureText(sample).width; };
    const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[\w-]+|-apple-system|BlinkMacSystemFont|emoji|math|fangsong|inherit|initial)$/i;
    const missing = new Set();
    for (const n of textNodes()) {
      const first = getComputedStyle(n.parentElement).fontFamily.split(",").map((f) => f.trim().replace(/^["']|["']$/g, "")).find((f) => f && !generic.test(f));
      const sample = n.data.trim().slice(0, 40);
      if (first && !missing.has(first) && ["monospace", "serif", "sans-serif"].every((g) => width(`72px "${first}", ${g}`, sample) === width(`72px ${g}`, sample))) missing.add(first);
    }
    return { root: { width: rr.width, height: rr.height }, landmarks: found, fonts: [...missing], textBoxes: textBoxes() };
  }

  if (command === "snapshot") {
    const seen = new Map();
    const out = textNodes().map((n) => {
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
    const clipX = /hidden|clip/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;
    const clipY = /hidden|clip/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1;
    const cut = Math.max(clipX ? el.scrollWidth - el.clientWidth : 0, clipY ? el.scrollHeight - el.clientHeight : 0);
    if (clipX || clipY) issues.push({ landmark: label(el.textContent), property: "clipped", delta: cut, actual: `${cut} px cut off ${clipX ? "horizontally" : "vertically"}` });
  }
  const nodes = textNodes();
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
      regions: [...regions.filter((r) => !r.movedWith).slice(0, 10), ...regions.filter((r) => r.movedWith)],
      png: { side: sc.toDataURL(), diff: dc.toDataURL() },
    };
  }, [`data:image/png;base64,${reference.toString("base64")}`, `data:image/png;base64,${actual.toString("base64")}`, scale, ignore, shifts]);
}

const writeDataUrl = (file, url) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(url.split(",")[1], "base64")); };
const dataUrl = (buf) => buf && `data:image/png;base64,${buf.toString("base64")}`;

// ------------------------------------------------------------------ commands

async function measureFrames(browser, cfg, frames, ledger, out, flags) {
  const scratch = await (await browser.newContext()).newPage();
  const results = [];
  for (const frame of frames) {
    const spec = readJson(frame.spec);
    const reference = frame.reference && fs.existsSync(frame.reference) ? fs.readFileSync(frame.reference) : null;
    const size = reference && pngSize(reference);
    const scale = size ? Math.max(1, Math.round(size.width / spec.frame.width)) : 1;
    const { context, page } = await open(browser, cfg, { ...frame, scale, height: Math.max(900, Math.ceil(spec.frame.height + 200)) });
    try {
      const targets = spec.landmarks.map((l) => (l.selector ? { selector: l.selector, nth: l.nth } : { text: l.text, nth: l.nth, documentOrder: spec.source === "page snapshot" }));
      const measured = await page.evaluate(inPage, { command: "measure", root: cfg.root, landmarks: targets });
      if (measured.error) throw Object.assign(new Error(`${frame.name}: ${measured.error}`), { exit: 2 });
      // Try an allowed alternate only when the actual design text is absent.
      for (let i = 0; i < spec.landmarks.length; i++) {
        const landmark = spec.landmarks[i];
        if (landmark.selector || measured.landmarks[i]?.found) continue;
        const alternate = pageText(landmark, frame.name, ledger);
        if (!alternate || alternate === landmark.text) continue;
        const found = await page.evaluate(inPage, { command: "measure", root: cfg.root, landmarks: [{ text: alternate, nth: landmark.nth, documentOrder: spec.source === "page snapshot" }] });
        if (found.landmarks?.[0]?.found) measured.landmarks[i] = { ...found.landmarks[0], matchedText: alternate };
      }
      for (let i = 0; i < spec.landmarks.length; i++) {
        if (measured.landmarks[i]?.found && spec.landmarks[i].text && !measured.landmarks[i].matchedText) measured.landmarks[i].matchedText = spec.landmarks[i].text;
      }
      const shot = await page.locator(cfg.root).first().screenshot({ animations: "disabled", caret: "hide" });
      const dir = path.join(out, slug(frame.name));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "page.png"), shot);
      // The page as the work found it: kept from the first check; delete out/before to take it again.
      const before = path.join(out, "before", `${slug(frame.name)}.png`);
      if (!fs.existsSync(before)) { fs.mkdirSync(path.dirname(before), { recursive: true }); fs.writeFileSync(before, shot); }
      measured.images = { page: path.relative(out, path.join(dir, "page.png")) };
      let regions = [];
      const imageOnly = isImageOnly(spec);
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
      const result = compareFrame({ frame: frame.name, spec, measured, tolerance: cfg.tolerance, ledger, regions });
      result.gallery = { width: spec.frame.width, images: {
        design: dataUrl(reference), before: dataUrl(fs.readFileSync(before)), after: dataUrl(shot),
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
  const widths = new Set(cfg.frames.map((f) => f.width).filter((w) => w >= from && w <= to));
  for (let w = to; w >= from; w -= step) widths.add(w);
  widths.add(from);
  const order = [...widths].sort((a, b) => b - a);
  // One mounted page for every width, narrowing from the widest, as a user resizes it: state set up once must survive.
  const { context, page } = await open(browser, cfg, { url: cfg.url, width: order[0], setup: s.setup });
  try {
    const probe = async (width) => {
      await setWidth(page, cfg, width, 900);
      const r = await page.evaluate(inPage, { command: "probe", root: cfg.root, align: s.align ?? [], tolerance: cfg.tolerance });
      if (r.error) throw Object.assign(new Error(`sweep at ${width}: ${r.error}`), { exit: 2 });
      return { width, ...r };
    };
    const probes = [];
    for (const w of order) probes.push(await probe(w));
    const back = await probe(order[0]);
    const first = probes[0];
    if (Math.abs(back.root.width - first.root.width) > 1 || Math.abs(back.root.height - first.root.height) > 1) {
      back.issues.push({ landmark: "root", property: "resize", delta: Math.max(Math.abs(back.root.width - first.root.width), Math.abs(back.root.height - first.root.height)), actual: `${Math.round(first.root.width)}×${Math.round(first.root.height)} before narrowing, ${Math.round(back.root.width)}×${Math.round(back.root.height)} after widening back` });
    }
    const changes = switches(probes, s.switches ?? [], step);
    const issues = sweepIssues([...probes, back], ledger, changes.issues);
    const failing = issues.filter((i) => i.status === "fail");
    // A group never measured anywhere is incomplete; one that drops below two elements at some widths, as a column
    // hidden on narrow screens does, was measured where it exists, and the widths without it are only reported.
    // One group is one selector and edge; each probe counts once for it.
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
    const groups = [...short.values()].map(({ widths, probes: seen, ...u }) => ({ ...u, ranges: ranges(widths), everywhere: seen.size === all.length }));
    return {
      from, to, step, pass: failing.length === 0, issues, switches: changes.seen,
      score: issues.filter((i) => i.status !== "accepted").length * 10,
      unmeasured: groups.filter((g) => g.everywhere), partial: groups.filter((g) => !g.everywhere),
    };
  } finally {
    await context.close();
  }
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
    const results = await measureFrames(browser, cfg, frames, ledger, out, flags);
    const sweepResult = cfg.sweep && full && !flags["no-sweep"] ? await sweep(browser, cfg, ledger) : undefined;
    const issues = [...results.flatMap((r) => r.issues), ...(sweepResult?.issues ?? [])];
    const pending = issues.some((issue) => issue.status === "pending");
    const missingReferences = frames.filter((frame) => !frame.reference || !fs.existsSync(frame.reference)).map((frame) => frame.name);
    const unmeasured = sweepResult?.unmeasured ?? [];
    const imageOnlyFrames = results.filter((r) => r.imageOnly).map((r) => r.frame);
    const passed = results.every((r) => r.pass) && (sweepResult?.pass ?? true) && ledgerProblems.length === 0;
    const failed = issues.some((issue) => issue.status === "fail") || ledgerProblems.length > 0;
    const status = failed ? "fail"
      : missingReferences.length || unmeasured.length || imageOnlyFrames.length ? "incomplete" : pending ? "pending" : passed ? "pass" : "fail";
    const pass = status === "pass";
    const score = Math.round((results.reduce((s, r) => s + r.score, 0) + (sweepResult?.score ?? 0)) * 100) / 100;
    fs.mkdirSync(out, { recursive: true });
    const historyFile = path.join(out, "history.jsonl");
    const history = fs.existsSync(historyFile) ? fs.readFileSync(historyFile, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
    const n = history.length + 1;
    const record = { round: n, time: new Date().toISOString(), frames: frames.map((f) => f.name), sweep: Boolean(sweepResult), status, score };
    fs.appendFileSync(historyFile, `${JSON.stringify(record)}\n`);
    // Progress is read against rounds that checked the same frames and sweep: the one before and the lowest.
    const comparable = history.filter((h) => JSON.stringify(h.frames) === JSON.stringify(record.frames) && h.sweep === record.sweep);
    const previous = comparable.at(-1);
    const best = [...comparable, record].reduce((a, h) => (h.score < a.score ? h : a), record);
    const data = { frames: results, sweep: sweepResult, ledgerProblems, round: n, previous, best, status, missingReferences, imageOnlyFrames };
    fs.writeFileSync(path.join(out, "report.md"), `${renderReport(data)}\n`);
    writeJson(path.join(out, "result.json"), { pass, score, round: n, ...data, frames: results.map(({ gallery, ...r }) => r) });
    // The gallery is the record to hand over: written only by a check of every frame.
    if (full) fs.writeFileSync(path.join(out, "gallery.html"), renderGallery({ title: `Design check · ${path.basename(cfg.dir)}`, frames: results.map((r) => ({ result: r, ...r.gallery })), sweep: sweepResult, ledger }));
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
      const { context, page } = await open(browser, cfg, { ...frame, scale, height: 2000 });
      try {
        const r = await page.evaluate(inPage, { command: "snapshot", root: cfg.root });
        if (r.error) throw Object.assign(new Error(`${frame.name}: ${r.error}`), { exit: 2 });
        const round = (n) => Math.round(n * 100) / 100;
        const landmarks = r.landmarks.map((l) => ({ ...l, box: Object.fromEntries(Object.entries(l.box).map(([k, v]) => [k, round(v)])) }));
        writeJson(frame.spec, { frame: { name: frame.name, width: round(r.root.width), height: round(r.root.height) }, source: "page snapshot", widths: true, landmarks });
        if (flags.images) {
          if (!frame.reference) throw Object.assign(new Error(`${frame.name}: no "reference" path to write the image to`), { exit: 2 });
          fs.mkdirSync(path.dirname(frame.reference), { recursive: true });
          fs.writeFileSync(frame.reference, await page.locator(cfg.root).first().screenshot({ animations: "disabled", caret: "hide" }));
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
