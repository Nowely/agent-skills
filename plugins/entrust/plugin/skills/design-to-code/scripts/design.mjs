#!/usr/bin/env node
// Turns a rendered component into numbers and holds them against the design's.
//
//   node design.mjs spec <metadata.xml> [--frame <id|name>] [--coords auto|relative|absolute] [--boxes] [--out spec.json]
//   node design.mjs check <design.json> [--frame <name>] [--no-sweep] [--before] [--out <dir>]
//   node design.mjs sweep <design.json> [--from <px>] [--to <px>] [--step <px>] [--out <dir>]
//   node design.mjs snapshot <design.json> [--frame <name>] [--images] [--scale <n>] [--force]
//
// `spec` reads a Figma `get_metadata` outline. `check` measures every frame of design.json in Chromium, compares it
// with the frame's spec and reference image, applies the ledger of deliberate deviations, runs the sweep when the
// config has one (not with --frame or --no-sweep), writes report.md, result.json, the images and gallery.html (the
// design, the page before the work, the page now) to <dir> (default: out/ beside design.json) and
// exits 0 when nothing unlisted differs, 1 when something does, 2 when it could not measure. `snapshot` writes a
// spec (and with --images a reference PNG) from the page as it renders now: a baseline from an accepted
// implementation. references/check.md describes design.json, the ledger and the output.
//
// Playwright is resolved from the working directory first, so run this from the project that has it installed.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { compareFrame, ledgerFaults, pageText, renderGallery, renderReport, renderSummary, specFromMetadata, sweepIssues } from "./core.mjs";

const USAGE = fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 7).map((l) => l.slice(3)).join("\n");

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
  if (!["click", "hover", "focus", "tap"].includes(action)) throw new Error(`unknown setup step ${JSON.stringify(step)}`);
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
function inPage({ command, root: rootSelector, landmarks = [], align = [] }) {
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const root = document.querySelector(rootSelector);
  if (!root) return { error: `the root ${rootSelector} is not on the page` };
  const rr = root.getBoundingClientRect();
  const visible = (el) => el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
  const lineHeight = (cs) => {
    if (cs.lineHeight.endsWith("px")) return parseFloat(cs.lineHeight);
    const n = Number(cs.lineHeight);
    return Number.isFinite(n) ? n * parseFloat(cs.fontSize) : null;
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
  const fontOf = (el) => {
    const cs = getComputedStyle(el);
    return { size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight), lineHeight: lineHeight(cs) ?? "normal" };
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

  if (command === "measure") {
    // The root's visible text with whitespace collapsed, each character mapped back to its node and offset, and the
    // places a word may start or end: a node boundary or a space. A landmark is found only between such places, so
    // "16" is not found inside "18626".
    const chars = [], starts = new Set([0]), ends = new Set();
    let text = "";
    for (const n of textNodes()) {
      let space = /^\s/.test(n.data) && text.length > 0;
      if (text.length) { ends.add(text.length); starts.add(text.length); }
      for (let i = 0; i < n.data.length; i++) {
        if (/\s/.test(n.data[i])) { space = text.length > 0; continue; }
        if (space) { ends.add(text.length); text += " "; chars.push(null); starts.add(text.length); space = false; }
        text += n.data[i];
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
      const target = norm(l.text);
      const hits = [];
      for (let i = text.indexOf(target); i >= 0; i = text.indexOf(target, i + 1)) {
        if (starts.has(i) && ends.has(i + target.length)) hits.push(i);
      }
      // A hit that is a whole element's text comes before a hit inside a longer one.
      const ranges = hits.map((i) => {
        const a = chars[i], b = chars[i + target.length - 1];
        const range = document.createRange();
        range.setStart(a.node, a.offset);
        range.setEnd(b.node, b.offset + 1);
        const el = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
        return { range, el: a.node.parentElement, whole: norm(el.textContent) === target };
      }).sort((x, y) => Number(y.whole) - Number(x.whole));
      const hit = ranges[l.nth ?? 0];
      if (!hit) return { found: false };
      const lines = lineBoxes(hit.range, hit.el);
      return { found: true, box: boxOf(lines), lines: lines.length, align: alignOf(hit.el), font: fontOf(hit.el) };
    });
    // A family the page asks for but the browser does not have renders in a fallback, and then no text can match.
    const ctx = document.createElement("canvas").getContext("2d");
    const width = (font) => { ctx.font = font; return ctx.measureText("mmmmmmmmmmlli1WQ@#ЖЯ").width; };
    const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[\w-]+|-apple-system|emoji|math|fangsong|inherit|initial)$/i;
    const families = new Set(textNodes().map((n) => getComputedStyle(n.parentElement).fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "")));
    const missing = [...families].filter((f) => f && !generic.test(f)
      && ["monospace", "serif", "sans-serif"].every((g) => width(`72px "${f}", ${g}`) === width(`72px ${g}`)));
    return { root: { width: rr.width, height: rr.height }, landmarks: found, fonts: missing };
  }

  if (command === "snapshot") {
    const seen = new Map();
    const out = textNodes().map((n) => {
      // The text without the spaces around it, as the check finds it.
      const range = document.createRange();
      range.setStart(n, n.data.search(/\S/));
      range.setEnd(n, n.data.length - (n.data.length - n.data.trimEnd().length));
      const t = norm(n.data), nth = seen.get(t) ?? 0;
      seen.set(t, nth + 1);
      return { text: t, ...(nth ? { nth } : {}), box: boxOf(lineBoxes(range, n.parentElement)), font: fontOf(n.parentElement) };
    });
    return { root: { width: rr.width, height: rr.height }, landmarks: out };
  }

  // probe
  const label = (s) => { const t = norm(s); return t.length > 40 ? `${t.slice(0, 39)}…` : t; };
  const issues = [];
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) issues.push({ landmark: "document", property: "overflow", actual: `${de.scrollWidth - de.clientWidth} px wider than the viewport` });
  if (root.scrollWidth > root.clientWidth + 1) issues.push({ landmark: "root", property: "overflow", actual: `${root.scrollWidth - root.clientWidth} px wider than the root` });
  for (const el of [root, ...root.querySelectorAll("*")]) {
    if (!visible(el) || !el.textContent.trim()) continue;
    const cs = getComputedStyle(el);
    const clipX = /hidden|clip/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;
    const clipY = /hidden|clip/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1;
    if (clipX || clipY) issues.push({ landmark: label(el.textContent), property: "clipped", actual: clipX ? "cut off horizontally" : "cut off vertically" });
  }
  const lines = textNodes().flatMap((n) => {
    const range = document.createRange();
    range.selectNodeContents(n);
    return lineBoxes(range, n.parentElement).map((b) => ({ node: n, b }));
  });
  for (const { node, b } of lines) {
    const out = Math.max(rr.left - b.left, b.right - rr.right, b.bottom - rr.bottom, rr.top - b.top);
    if (out > 1) issues.push({ landmark: label(node.data), property: "outside", actual: `${Math.round(out)} px outside the root` });
  }
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const a = lines[i], b = lines[j];
    if (a.node === b.node) continue;
    const w = Math.min(a.b.right, b.b.right) - Math.max(a.b.left, b.b.left);
    const h = Math.min(a.b.bottom, b.b.bottom) - Math.max(a.b.top, b.b.top);
    if (w > 1 && h > 1) issues.push({ landmark: `${label(a.node.data)} × ${label(b.node.data)}`, property: "overlap", actual: `${Math.round(w)} × ${Math.round(h)} px` });
  }
  for (const g of align) {
    const rects = [...root.querySelectorAll(g.selector)].filter(visible).map((el) => el.getBoundingClientRect());
    const edge = (r) => (g.edge === "right" ? r.right : g.edge === "center" ? (r.left + r.right) / 2 : g.edge === "top" ? r.top : r.left);
    if (rects.length > 1) {
      const values = rects.map(edge), spread = Math.max(...values) - Math.min(...values);
      if (spread > 1) issues.push({ landmark: g.selector, property: "align", actual: `${g.edge ?? "left"} edges ${Math.round(spread)} px apart` });
    }
  }
  return { root: { width: rr.width, height: rr.height }, issues };
}

async function pixelDiff(page, reference, actual) {
  return page.evaluate(async ([ref, act]) => {
    const load = (src) => new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => reject(new Error("image does not load")); i.src = src; });
    const [a, b] = await Promise.all([load(ref), load(act)]);
    const W = Math.max(a.width, b.width), H = Math.max(a.height, b.height);
    const canvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); return [c, x]; };
    const pixels = (img) => { const [, x] = canvas(W, H); x.drawImage(img, 0, 0); return x.getImageData(0, 0, W, H).data; };
    const A = pixels(a), B = pixels(b);
    const [dc, dx] = canvas(W, H);
    const diff = dx.createImageData(W, H);
    let changed = 0;
    for (let i = 0; i < A.length; i += 4) {
      const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
      if (d > 48) { changed++; diff.data.set([230, 0, 40, 255], i); } else {
        const g = 255 - (255 - (B[i] * 0.3 + B[i + 1] * 0.59 + B[i + 2] * 0.11)) * 0.25;
        diff.data.set([g, g, g, 255], i);
      }
    }
    dx.putImageData(diff, 0, 0);
    const [oc, ox] = canvas(W, H);
    ox.drawImage(a, 0, 0); ox.globalAlpha = 0.5; ox.drawImage(b, 0, 0);
    const gap = 12, [sc, sx] = canvas(W * 3 + gap * 2, H);
    sx.drawImage(a, 0, 0); sx.drawImage(b, W + gap, 0); sx.drawImage(dc, (W + gap) * 2, 0);
    return {
      ratio: changed / (W * H), sizeMatch: a.width === b.width && a.height === b.height,
      reference: `${a.width}×${a.height}`, actual: `${b.width}×${b.height}`,
      png: { side: sc.toDataURL(), overlay: oc.toDataURL(), diff: dc.toDataURL() },
    };
  }, [`data:image/png;base64,${reference.toString("base64")}`, `data:image/png;base64,${actual.toString("base64")}`]);
}

const writeDataUrl = (file, url) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(url.split(",")[1], "base64")); };

// ------------------------------------------------------------------ commands

async function measureFrames(browser, cfg, frames, ledger, out, flags, shown) {
  const scratch = await (await browser.newContext()).newPage();
  const results = [];
  for (const frame of frames) {
    const spec = readJson(frame.spec);
    const reference = frame.reference && fs.existsSync(frame.reference) ? fs.readFileSync(frame.reference) : null;
    const size = reference && pngSize(reference);
    const scale = size ? Math.max(1, Math.round(size.width / spec.frame.width)) : 1;
    const { context, page } = await open(browser, cfg, { ...frame, scale, height: Math.max(900, Math.ceil(spec.frame.height + 200)) });
    try {
      const targets = spec.landmarks.map((l) => (l.text ? { text: pageText(l, frame.name, ledger), nth: l.nth } : { selector: l.selector, nth: l.nth }));
      const measured = await page.evaluate(inPage, { command: "measure", root: cfg.root, landmarks: targets });
      if (measured.error) throw Object.assign(new Error(`${frame.name}: ${measured.error}`), { exit: 2 });
      const shot = await page.locator(cfg.root).first().screenshot({ animations: "disabled", caret: "hide" });
      const dir = path.join(out, slug(frame.name));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "page.png"), shot);
      // The page as the work found it: kept from the first check, or replaced on --before.
      const before = path.join(out, "before", `${slug(frame.name)}.png`);
      if (!fs.existsSync(before) || flags.before) { fs.mkdirSync(path.dirname(before), { recursive: true }); fs.writeFileSync(before, shot); }
      measured.images = { page: path.relative(out, path.join(dir, "page.png")) };
      if (reference) {
        const { png, ...pixels } = await pixelDiff(scratch, reference, shot);
        for (const [name, url] of Object.entries(png)) {
          writeDataUrl(path.join(dir, `${name}.png`), url);
          measured.images[name] = path.relative(out, path.join(dir, `${name}.png`));
        }
        measured.pixels = pixels;
        measured.pixelLimit = cfg.pixelLimit;
      }
      const result = compareFrame({ frame: frame.name, spec, measured, tolerance: cfg.tolerance, ledger });
      results.push(result);
      const url = (buf) => buf && `data:image/png;base64,${buf.toString("base64")}`;
      shown.push({ result, width: spec.frame.width, images: {
        design: url(reference), before: url(fs.readFileSync(before)), after: url(shot),
        diff: reference && url(fs.readFileSync(path.join(dir, "diff.png"))),
      } });
    } finally {
      await context.close();
    }
  }
  return results;
}

async function sweep(browser, cfg, ledger, flags) {
  const s = cfg.sweep ?? {};
  const from = Number(flags.from ?? s.from), to = Number(flags.to ?? s.to), step = Number(flags.step ?? s.step ?? 8);
  if (!(from > 0 && to >= from && step > 0)) throw Object.assign(new Error("sweep: give from, to and step (in design.json's sweep or as flags)"), { exit: 2 });
  const widths = new Set(cfg.frames.map((f) => f.width).filter((w) => w >= from && w <= to));
  for (let w = to; w >= from; w -= step) widths.add(w);
  widths.add(from);
  const order = [...widths].sort((a, b) => b - a);
  // One mounted page for every width, narrowing from the widest, as a user resizes it: state set up once must survive.
  const { context, page } = await open(browser, cfg, { url: s.url ? new URL(s.url, pathToFileURL(cfg.dir + path.sep)).href : cfg.url, width: order[0], setup: s.setup, height: s.height ?? 900 });
  try {
    const probe = async (width) => {
      await setWidth(page, cfg, width, s.height ?? 900);
      const r = await page.evaluate(inPage, { command: "probe", root: cfg.root, align: s.align ?? [] });
      if (r.error) throw Object.assign(new Error(`sweep at ${width}: ${r.error}`), { exit: 2 });
      return { width, ...r };
    };
    const probes = [];
    for (const w of order) probes.push(await probe(w));
    const back = await probe(order[0]);
    const first = probes[0];
    if (Math.abs(back.root.width - first.root.width) > 1 || Math.abs(back.root.height - first.root.height) > 1) {
      back.issues.push({ landmark: "root", property: "resize", actual: `${Math.round(first.root.width)}×${Math.round(first.root.height)} before narrowing, ${Math.round(back.root.width)}×${Math.round(back.root.height)} after widening back` });
    }
    probes.push(back);
    const issues = sweepIssues(probes, ledger);
    const failing = issues.filter((i) => i.status === "fail");
    return { from, to, step, pass: failing.length === 0, issues, score: failing.length * 10 };
  } finally {
    await context.close();
  }
}

function head(dir) {
  try { return execFileSync("git", ["-C", dir, "rev-parse", "--short", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return null; }
}

async function check(file, flags, { sweepOnly = false } = {}) {
  const cfg = loadConfig(file);
  const out = path.resolve(flags.out ?? path.join(cfg.dir, "out"));
  const ledger = cfg.ledger && fs.existsSync(cfg.ledger) ? readJson(cfg.ledger) : [];
  const ledgerProblems = ledgerFaults(ledger);
  const frames = sweepOnly ? [] : cfg.frames.filter((f) => !flags.frame || f.name === flags.frame);
  if (flags.frame && !frames.length) throw Object.assign(new Error(`no frame named ${flags.frame}`), { exit: 2 });
  const browser = await (await chromium()).launch();
  try {
    const shown = [];
    const results = await measureFrames(browser, cfg, frames, Array.isArray(ledger) ? ledger : [], out, flags, shown);
    const sweepResult = (sweepOnly || (cfg.sweep && !flags.frame && !flags["no-sweep"])) ? await sweep(browser, cfg, Array.isArray(ledger) ? ledger : [], flags) : undefined;
    const report = renderReport({ frames: results, sweep: sweepResult, ledgerProblems });
    const pass = results.every((r) => r.pass) && (sweepResult?.pass ?? true) && ledgerProblems.length === 0;
    const score = results.reduce((s, r) => s + r.score, 0) + (sweepResult?.score ?? 0);
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, "report.md"), `${report}\n`);
    writeJson(path.join(out, "result.json"), { pass, score, frames: results, sweep: sweepResult, ledgerProblems });
    if (shown.length) fs.writeFileSync(path.join(out, "gallery.html"), renderGallery({ title: `Design check · ${path.basename(cfg.dir)}`, frames: shown }));
    fs.appendFileSync(path.join(out, "history.jsonl"), `${JSON.stringify({ time: new Date().toISOString(), head: head(cfg.dir), frames: frames.map((f) => f.name), pass, score })}\n`);
    const where = path.relative(process.cwd(), out) || ".";
    console.log(renderSummary({ frames: results, sweep: sweepResult, ledgerProblems }, { file: `${where}/report.md` }));
    if (shown.length) console.log(`Gallery (design, before, after): ${where}/gallery.html`);
    return pass ? 0 : 1;
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

async function main(argv) {
  const { command, file, flags } = parseArgs(argv);
  if (!command || !file || flags.help) { console.log(USAGE); return command ? 0 : 2; }
  if (command === "spec") {
    const spec = specFromMetadata(fs.readFileSync(file, "utf8"), { frame: flags.frame, coords: flags.coords ?? "auto", boxes: Boolean(flags.boxes) });
    if (flags.out) { writeJson(flags.out, spec); console.log(`${spec.landmarks.length} landmarks, ${spec.source} → ${flags.out}`); } else console.log(JSON.stringify(spec, null, 2));
    return 0;
  }
  if (command === "check") return check(file, flags);
  if (command === "sweep") return check(file, flags, { sweepOnly: true });
  if (command === "snapshot") return snapshot(file, flags);
  console.log(USAGE);
  return 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.exit(code), (e) => { console.error(`design: ${e.message}`); process.exit(e.exit ?? 2); });
}

export { inPage, main };
