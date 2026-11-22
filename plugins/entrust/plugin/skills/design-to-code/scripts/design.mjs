#!/usr/bin/env node
// Turns a rendered component into numbers and holds them against the design's.
//
//   node design.mjs figma <figma link with node-id> --out <frame directory> [--scale 2]
//   node design.mjs spec <metadata.xml> [--context <design-context>] [--frame <id|name>] [--coords auto|relative|absolute] [--out spec.json]
//   node design.mjs check <design.json> [--frame <name>] [--no-sweep] [--quick] [--out <dir>]
//   node design.mjs snapshot <design.json> [--frame <name>] [--images] [--scale <n>] [--force]
//   node design.mjs boxes <reference.png> --width <css px> [--out spec.json] [--force]
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
  compareFrame, findingKeys, firstStreak, inkRuns, joinContext, tightBox, uncovered, ledgerEntryFor, ledgerFaults, nameRegions, pageText, parseFigmaUrl, ranges, renderGallery, renderHandoff, renderReport, renderSummary,
  rerunNotice, specFromMetadata, specFromRest, sweepIssues, switches, totalScore,
} from "./core.mjs";

const USAGE = fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 8).map((l) => l.slice(3)).join("\n");

// What each command takes: a flag with a value, or a switch. A flag outside its command's list, or a value flag without
// its value, stops the launch before any file is read, so a typo is not a check that quietly measured something else.
const COMMANDS = {
  figma: { out: "value", scale: "value" },
  spec: { context: "value", frame: "value", coords: "value", out: "value" },
  check: { frame: "value", "no-sweep": "switch", quick: "switch", out: "value" },
  snapshot: { frame: "value", images: "switch", scale: "value", force: "switch" },
  boxes: { width: "value", out: "value", force: "switch" },
};
const launchFault = (message) => Object.assign(new Error(message), { exit: 2 });

function parseArgs(argv) {
  if (argv.includes("--help")) return { help: true };
  const [command, file, ...rest] = argv;
  if (!command) return { help: true, fault: true };
  const takes = COMMANDS[command];
  if (!takes) throw launchFault(`unknown command ${command}; the commands are ${Object.keys(COMMANDS).join(", ")} (--help for the usage)`);
  if (!file || file.startsWith("--")) throw launchFault(`${command} needs ${command === "check" || command === "snapshot" ? "a design.json" : command === "figma" ? "a Figma link" : command === "spec" ? "a metadata.xml" : "a reference.png"} as its first argument (--help for the usage)`);
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    const m = rest[i].match(/^--([\w-]+)$/);
    if (!m) throw launchFault(`unexpected argument ${rest[i]}`);
    if (!takes[m[1]]) throw launchFault(`${command} does not take --${m[1]}; it takes ${Object.keys(takes).map((k) => `--${k}`).join(", ")}`);
    const next = rest[i + 1];
    if (takes[m[1]] === "switch") { flags[m[1]] = true; continue; }
    if (next === undefined || next.startsWith("--")) throw launchFault(`--${m[1]} needs a value`);
    flags[m[1]] = next; i++;
  }
  // A file the command reads must be there; figma takes a link, not a file.
  if (command !== "figma" && !fs.existsSync(file)) throw launchFault(`no file at ${path.resolve(file)}`);
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
  // The owner's past returns, one per line: .design/returns.md beside the task's folder unless design.json names one.
  const returns = cfg.returns ? at(cfg.returns) : path.join(dir, "..", "returns.md");
  if (cfg.static !== undefined && !(typeof cfg.static === "string" && cfg.static.trim())) throw new Error('design.json: "static" gives the reason no sweep or dense story applies');
  // An exit from the lifecycle journey gives its reason, which the handoff prints for the owner.
  if (cfg.lifecycle !== undefined && !(typeof cfg.lifecycle === "string" && cfg.lifecycle.trim())) throw new Error('design.json: "lifecycle" gives the reason the product can cause no lifecycle, as "static" gives its: "lifecycle": "no data changes: the card renders once"; otherwise leave it out and take each lifecycle in a journey with "sameAsFresh": true');
  // The layout model's lines: pieces that share a row, in order, where the line holds (a width range, or a selector
  // the page shows in that layout mode).
  const lines = cfg.sweep?.lines ?? [];
  const piece = (p) => (typeof p === "string" && p.trim()) || (p && typeof p.selector === "string" && p.selector.trim());
  if (!Array.isArray(lines) || lines.some((l) => !l?.name || !Array.isArray(l.pieces) || l.pieces.length < 2 || !l.pieces.every(piece)))
    throw new Error('design.json: each sweep line needs a name and at least two pieces: selectors, or { "selector": "…", "wraps": true } for a piece that may take several lines');
  if (new Set(lines.map((l) => l.name)).size !== lines.length) throw new Error("design.json: sweep line names must be unique");
  return {
    // The ledger is deviations.json beside design.json unless it names another.
    ...cfg, dir, returnsFile: returns, url: url(cfg.url), ledger: at(cfg.ledger ?? "deviations.json"), tolerance: cfg.tolerance ?? 1,
    // The pages frames name in a url of their own: story pages, as the journeys' gate reads them.
    framedUrls: cfg.frames.filter((f) => f?.url).map((f) => url(f.url)),
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
// Frames and the sweep only: a journey keeps the page's transitions, since a control may finish its work on one (a sheet
// that hides itself when its closing transition ends).
const STILL = "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important;caret-color:transparent!important}";
// What runs is brought to its end before a journey looks: its end events fire, as they would a moment later.
const finishMotion = (page) => page.evaluate(async () => {
  for (const a of document.getAnimations()) {
    try { if (a.effect?.getComputedTiming().endTime !== Infinity) a.finish(); } catch { /* one that cannot end runs on */ }
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}).catch(() => {});

// Run in every checked page before its own scripts: each ResizeObserver's targets, which of them left the page from the
// component (the root, inside it or around it), what changed the component (a root mounted or unmounted, its content
// changed), and what a ResizeObserver callback or a window-size matchMedia listener sets on an element (a class, a
// data- attribute, a style) from then until the next frame, by which a framework has rendered the state it set. A
// journey marks where its steps start, then asks what they changed and which of the component's targets they removed
// with the observer kept; the sweep asks for the modes set by script.
function watchScripts(rootSelector) {
  if (window.__designCheck) return;
  const modes = new Map(), targets = new Set(), left = new WeakMap();
  const isMode = (name) => name === "class" || name === "style" || (name.startsWith("data-") && !name.startsWith("data-design-"));
  let source = null, token = 0;
  const credit = (records) => {
    if (!source) return;
    for (const r of records) {
      if (r.type !== "attributes" || !isMode(r.attributeName)) continue;
      if (!modes.has(r.target)) modes.set(r.target, new Map());
      if (!modes.get(r.target).has(r.attributeName)) modes.get(r.target).set(r.attributeName, source);
    }
  };
  const mutations = new MutationObserver(credit);
  mutations.observe(document, { attributes: true, subtree: true });
  // Each batch of changes is stamped, so a journey counts only what its steps did, not the page's own load.
  let stamp = 0, since = 0;
  const changed = { mount: 0, data: 0 };
  const read = (fn) => { try { return fn(); } catch { return false; /* a selector the page cannot read */ } };
  const inRoot = (n) => read(() => Boolean(n?.closest?.(rootSelector)));
  const holdsRoot = (n) => n.nodeType === 1 && read(() => n.matches(rootSelector) || Boolean(n.querySelector(rootSelector)));
  const onChange = (records) => {
    stamp++;
    for (const r of records) {
      const at = r.target.nodeType === 1 ? r.target : r.target.parentElement;
      if (r.type === "characterData") { if (inRoot(at)) changed.data++; continue; }
      const nodes = [...r.addedNodes, ...r.removedNodes];
      if (nodes.some(holdsRoot)) changed.mount++;
      else if (nodes.length && inRoot(at)) changed.data++;
      // An observed element removed with what holds it: from the component if it is a root, holds one, or sat in one.
      for (const n of r.removedNodes) {
        if (n.nodeType !== 1) continue;
        for (const set of targets) for (const t of set) {
          if (t !== n && !n.contains(t)) continue;
          if (read(() => t.matches(rootSelector) || t.querySelector(rootSelector) || t.closest(rootSelector) || r.target.closest?.(rootSelector))) left.set(t, stamp);
        }
      }
    }
  };
  const removals = new MutationObserver(onChange);
  removals.observe(document, { childList: true, subtree: true, characterData: true });
  const flush = () => onChange(removals.takeRecords());
  const open = (what) => {
    credit(mutations.takeRecords());
    source = what;
    const mine = ++token;
    requestAnimationFrame(() => { credit(mutations.takeRecords()); if (token === mine) source = null; });
  };
  const run = (what, fn, self, args) => {
    open(what);
    try { return fn.apply(self, args); } finally { credit(mutations.takeRecords()); }
  };
  const Native = window.ResizeObserver;
  if (Native) {
    const own = new WeakMap();
    window.ResizeObserver = class ResizeObserver extends Native {
      constructor(callback) {
        if (typeof callback !== "function") super(callback);
        else super(function (...args) { return run("a ResizeObserver callback", callback, this, args); });
        own.set(this, new Set());
        targets.add(own.get(this));
      }
      observe(target, options) { super.observe(target, options); own.get(this)?.add(target); }
      unobserve(target) { super.unobserve(target); own.get(this)?.delete(target); }
      disconnect() { super.disconnect(); own.get(this)?.clear(); }
    };
  }
  const list = window.MediaQueryList?.prototype;
  if (list) {
    const sized = (media) => /width|height|aspect-ratio|orientation/.test(media ?? "");
    const wrapped = new WeakMap();
    const wrap = (listener) => {
      if (!listener || (typeof listener !== "function" && typeof listener.handleEvent !== "function")) return listener;
      if (!wrapped.has(listener)) wrapped.set(listener, function (e) {
        const fn = typeof listener === "function" ? listener : listener.handleEvent, self = typeof listener === "function" ? this : listener;
        return sized(this.media) ? run(`a matchMedia("${this.media}") listener`, fn, self, [e]) : fn.call(self, e);
      });
      return wrapped.get(listener);
    };
    const { addEventListener: add, removeEventListener: remove } = EventTarget.prototype;
    list.addEventListener = function (type, listener, options) { return add.call(this, type, type === "change" ? wrap(listener) : listener, options); };
    list.removeEventListener = function (type, listener, options) { return remove.call(this, type, type === "change" && listener ? wrapped.get(listener) ?? listener : listener, options); };
    list.addListener = function (listener) { return add.call(this, "change", wrap(listener)); };
    list.removeListener = function (listener) { return remove.call(this, "change", (listener && wrapped.get(listener)) ?? listener); };
    // A one-shot read of `.matches` is not wrapped: the component's own width (a generated condition) shows a layout
    // it picks, and a read for anything else (a flag, a hint) would be named as a mode.
    const onchange = Object.getOwnPropertyDescriptor(list, "onchange");
    if (onchange?.set) Object.defineProperty(list, "onchange", { ...onchange, set(listener) { onchange.set.call(this, typeof listener === "function" ? wrap(listener) : listener); } });
  }
  Object.defineProperty(window, "__designCheck", { configurable: true, value: {
    modes: () => [...modes].flatMap(([el, attrs]) => [...attrs].map(([attr, from]) => ({ el, attr, source: from }))),
    // Where a journey's steps start: what came before (the page's own load) is not theirs.
    mark: () => { flush(); since = stamp; changed.mount = changed.data = 0; },
    changed: () => { flush(); return { ...changed }; },
    stale: () => { flush(); return [...targets].flatMap((set) => [...set]).filter((t) => !t.isConnected && left.get(t) > since); },
  } });
}

// The component's root: the first match the user can see, opacity included; open() marks it, so the picture and the
// measurements come from the same element. A popover kept hidden in the page is not the one open.
const MARK = "data-design-root";
const seenIn = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }); };
// Run on the frame root (inventory) or the target of a gesture (one opener). Equal labels on different
// controls must stay distinct across the fresh pages used for frames and journeys. Each also says its role, its page
// without the query, whether its target is missing from that page and, in the inventory, which of the journeys'
// selectors pick it out (it or something inside it).
function openerInfoIn(el, { inventory = false, point, keyboard, selectors = [] } = {}) {
  const selector = "[aria-expanded], [popovertarget], [aria-haspopup]";
  const label = (o) => (o.getAttribute("aria-label") || o.title || o.textContent || o.localName).replace(/\s+/g, " ").trim();
  const role = (o) => o.getAttribute("role")?.trim().split(/\s+/)[0].toLowerCase()
    || (o.localName === "button" || o.localName === "summary" || (o.localName === "input" && /^(button|submit|reset|image)$/i.test(o.type)) ? "button"
      : /^(a|area)$/.test(o.localName) && o.hasAttribute("href") ? "link" : o.localName);
  const picks = (o, s) => { try { return o.matches(s) || Boolean(o.querySelector(s)); } catch { return false; } };
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
    return { key, name, ids, role: role(o), page: location.href.replace(/[?#].*$/, ""), away: ids.length > 0 && ids.every((id) => !document.getElementById(id)),
      ...(inventory ? { answers: selectors.filter((s) => picks(o, s)) } : {}) };
  });
}
// An element's identity across fresh pages of the same story, whatever its markup: its id, or its path of positions.
const elementKey = (el) => {
  if (el.id) return `#${el.id}`;
  const parts = [];
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    const same = [...(n.parentElement?.children ?? [])].filter((c) => c.localName === n.localName);
    parts.unshift(`${n.localName}:${same.indexOf(n) + 1}`);
  }
  return parts.join(">");
};
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
  const { url, width, setup = [], height = 900, still = true, prepare } = target;
  const context = await browser.newContext(contextOptions(cfg, target));
  await context.addInitScript(watchScripts, cfg.root);
  const page = await context.newPage();
  // A step on something that never appears fails in seconds, not in Playwright's default half minute.
  page.setDefaultTimeout(5000);
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  // The pointer rests outside the page, so nothing is measured hovered.
  await page.mouse.move(-5, -5);
  if (still) await page.addStyleTag({ content: STILL });
  if (!cfg.host || (setup.length && await page.locator(cfg.host).count())) await setWidth(page, cfg, width, height);
  // What a condition sets before the setup acts: the root's container held at a width.
  if (prepare) await prepare(page);
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
async function inPage({ command, root: rootSelector, landmarks = [], align = [], tolerance = 1, lines: modelLines = [], kit = [] }) {
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
  // Which texts share a row, in document order: a change between two widths is a change of layout. A text that
  // wraps keeps its first line's place, so wrapping inside one layout does not count.
  const rowsOf = (nodes) => {
    const tops = nodes.map((n) => lineBoxes(trimmed(n), n.parentElement)[0]?.top ?? 0);
    return tops.map((t, i) => (i && Math.abs(t - tops[i - 1]) <= 2 ? "=" : i && t < tops[i - 1] ? "^" : "v")).join("");
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
      // A named box from an image: repeated texts are paired in reading order on both sides (top to bottom, then left
      // to right, as drawn), whatever the page's DOM order.
      if (l.near) {
        const placed = ranges.map((r) => {
          const lines = lineBoxes(r.range, r.el);
          return lines.length ? { r, b: boxOf(lines) } : null;
        }).filter(Boolean).sort((a, b) => (Math.abs(a.b.y - b.b.y) > Math.min(a.b.height, b.b.height) / 2 ? a.b.y - b.b.y : a.b.x - b.b.x));
        // A text no other landmark repeats is the hit nearest its box: a short one (a count, "1") also sits inside
        // longer texts ("Выдача за 1 день"), and the first of them in reading order is not it.
        const alone = landmarks.filter((x) => x.text !== undefined && key(x.text) === key(l.text)).length === 1;
        const away = (h) => Math.hypot(h.b.x - l.near.x, h.b.y - l.near.y);
        const pick = alone ? [...placed].sort((a, b) => away(a) - away(b))[0] : placed[l.nth ?? 0];
        return pick ? match(pick.r.range, pick.r.el, pick.r.start) : { found: false };
      }
      const hit = ranges[l.nth ?? 0];
      if (!hit) return { found: false };
      return match(hit.range, hit.el, hit.start);
    };
    const claimed = new Set(), glyphNodes = new Set();
    const found = landmarks.map((l) => {
      if (l.selector) {
        const all = [...root.querySelectorAll(l.selector)].filter(visible);
        const centre = (e) => { const r = e.getBoundingClientRect(); return Math.hypot(r.left - rr.left - (l.near?.x ?? 0), r.top - rr.top - (l.near?.y ?? 0)); };
        const el = l.near ? all.filter((e) => !claimed.has(e)).sort((a, b) => centre(a) - centre(b))[0] : root.querySelectorAll(l.selector)[l.nth ?? 0];
        if (!visible(el)) return { found: false };
        claimed.add(el);
        // An icon drawn with a character or two ("?", "i") is the selector's: not text the design lacks, and kept in the
        // pixel comparison, where a changed glyph shows. A selector over more text claims none of it.
        if (el.textContent.trim().length <= 3) chars.forEach((c, i) => { if (el.contains(c.node)) { covered[i] = 1; glyphNodes.add(c.node); } });
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
    const textLines = nodes.filter((n) => !glyphNodes.has(n)).flatMap((n) => lineBoxes(trimmed(n), n.parentElement).map((line) => ({ text: norm(n.data), box: boxOf([line]) })));
    return { root: { width: rr.width, height: rr.height }, landmarks: found, fonts: [...missing], textBoxes: textLines.map((l) => l.box), textLines, unexpected, rows: rowsOf(nodes) };
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
  // A text set not to wrap: under texts stretched past any legal value it runs out by design, not by a fault.
  const unwrapped = (el) => { const cs = getComputedStyle(el); return cs.textWrapMode === "nowrap" || /^(nowrap|pre)$/.test(cs.whiteSpace); };
  const issues = [];
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) issues.push({ landmark: "document", property: "overflow", delta: de.scrollWidth - de.clientWidth, actual: `${de.scrollWidth - de.clientWidth} px wider than the viewport` });
  if (root.scrollWidth > root.clientWidth + 1) issues.push({ landmark: "root", property: "overflow", delta: root.scrollWidth - root.clientWidth, actual: `${root.scrollWidth - root.clientWidth} px wider than the root` });
  for (const el of [root, ...root.querySelectorAll("*")]) {
    if (!visible(el) || !el.textContent.trim()) continue;
    const cs = getComputedStyle(el);
    if (deliberate(cs)) {
      // Cut on purpose, the full text must still be reachable: a title, an accessible name, or a tooltip on it.
      const cutNow = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
      if (cutNow && !el.closest("[title], [aria-label], [aria-describedby], [data-tooltip]")) issues.push({ landmark: label(el.textContent), property: "truncated",
        actual: "cut with an ellipsis or a clamp, and its full text is nowhere to read: give it a title, an accessible name or a tooltip" });
      continue;
    }
    const own = el.getBoundingClientRect();
    if (own.width <= 2 || own.height <= 2) continue; // kept for screen readers alone
    const clipX = /hidden|clip/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;
    const clipY = /hidden|clip/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1;
    const cut = Math.max(clipX ? el.scrollWidth - el.clientWidth : 0, clipY ? el.scrollHeight - el.clientHeight : 0);
    if (clipX || clipY) issues.push({ landmark: label(el.textContent), property: "clipped", delta: cut, actual: `${cut} px cut off ${clipX ? "horizontally" : "vertically"}`, ...(unwrapped(el) ? { nowrap: true } : {}) });
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
    if (out > 1) issues.push({ landmark: label(node.data), property: "outside", delta: out, actual: `${Math.round(out)} px outside the root`, ...(unwrapped(node.parentElement) ? { nowrap: true } : {}) });
  }
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const a = lines[i], b = lines[j];
    if (a.node === b.node) continue;
    const w = Math.min(a.b.right, b.b.right) - Math.max(a.b.left, b.b.left);
    const h = Math.min(a.b.bottom, b.b.bottom) - Math.max(a.b.top, b.b.top);
    if (w > 1 && h > 1) issues.push({ landmark: `${label(a.node.data)} × ${label(b.node.data)}`, property: "overlap", delta: Math.min(w, h), actual: `${Math.round(w)} × ${Math.round(h)} px` });
  }
  // What must stay together, read from where every text breaks, with nothing to declare. Text is read by its line
  // context: inline elements, inline blocks and the items of a flex row join their parent's, so a price written as
  // three text nodes ("1 234 ₽", " / ", "месяц") reads as one.
  // A value: a number, or a currency or per-cent sign beside one.
  const number = (t) => /^\d(?:[\d.,]*\d)?$/.test(t);
  const value = (t) => number(t) || /^[\p{Sc}%‰]$/u.test(t);
  const joins = (el) => {
    if (/^(inline|contents)/.test(getComputedStyle(el).display)) return true;
    const p = el.parentElement && getComputedStyle(el.parentElement);
    return Boolean(p && /flex/.test(p.display) && !p.flexDirection.startsWith("column"));
  };
  const contextOf = (el) => { while (el && el !== root && joins(el)) el = el.parentElement; return el ?? root; };
  const runs = new Map();
  for (const node of nodes) {
    if (!visible(node.parentElement)) continue;
    const run = runs.get(contextOf(node.parentElement)) ?? [];
    runs.set(contextOf(node.parentElement), run);
    for (const m of node.data.matchAll(/\S+/g)) {
      const r = document.createRange(); r.setStart(node, m.index); r.setEnd(node, m.index + m[0].length);
      const rects = [...r.getClientRects()].filter((x) => x.width > 0.5);
      if (rects.length) run.push({ t: m[0], node, rects, at: m.index });
    }
  }
  for (const run of runs.values()) {
    const say = (node, msg) => issues.push({ landmark: label(node.data), property: "wrap", kind: msg.split(":")[0], actual: msg });
    run.forEach(({ t, node, rects }, k) => {
      // A word of a space-delimited script, or a long run of digits, broken inside: not Chinese or Japanese, which
      // break between any two characters, and not where the page allows hyphenation.
      const word = t.replace(/^[(«"“]+|[)»"”,.;:!?]+$/g, "");
      const tops = rects.map((r) => r.top);
      if (Math.max(...tops) - Math.min(...tops) > Math.min(...rects.map((r) => r.height)) / 2
        && (/^[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}]{4,}$/u.test(word) || /^\d{4,}$/.test(word))
        && getComputedStyle(node.parentElement).hyphens !== "auto") say(node, `a word broken between its letters: “${word}”`);
      if (k === 0) return;
      const { t: a, node: from, rects: before } = run[k - 1], prev = before.at(-1), next = rects[0];
      if (next.top < prev.bottom - Math.min(prev.height, next.height) / 2) return; // the same line
      // Wherever there is no room, two breaks still split what belongs together: "/" after a value left at a line's
      // end ("₽ /" | "месяц"), and "×" split from its numbers.
      if (a === "/" && value(run[k - 2]?.t ?? "")) say(from, `a value split from its period: “${run[k - 2].t} /” | “${t}”: white-space: nowrap on the amount and on the period (a value and its unit), an ordinary space between them, and no cap on their block; only a price wider than the component moves its period whole to the next line`);
      else if ((a === "×" && number(t)) || (t === "×" && number(a))) say(from, `“×” split from its numbers: “${a}” | “${t}”: keep them on one line`);
    });
  }
  // A short text that wraps though the component could hold it: its line's own limits lifted, it sits on one line,
  // inside the component's content box, and runs into nothing and pushes nothing out: no other text, icon or control.
  // A price and its period, a value and its unit, a label: whatever wraps with room. A clamp or an ellipsis is a choice,
  // not a wrap, and so is a block as narrow as its own longest word (width: min-content), which stacks its words on
  // purpose. A line that joins several flex items (a title and a price, a row of chips) is held item by item: each
  // item's text on its own. A group of digits ("1 234 567,00") counts as one word.
  const lift = document.createElement("style");
  lift.textContent = "[data-dtc-lift], [data-dtc-lift] * { white-space: nowrap !important; } [data-dtc-lift] { max-width: none !important; min-width: max-content !important; flex-shrink: 0 !important; } [data-dtc-wrap] { white-space: nowrap !important; }";
  document.head.append(lift);
  const rectsOf = (n) => { const g = document.createRange(); g.selectNodeContents(n); return [...g.getClientRects()].filter((x) => x.width > 0.5 && x.height > 0.5); };
  const wordRects = (w) => { const g = document.createRange(); g.setStart(w.node, w.at); g.setEnd(w.node, w.at + w.t.length); return [...g.getClientRects()].filter((x) => x.width > 0.5); };
  const meets = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  // Whether a box is as wide as its own min-content width: set to that width, with nothing else holding it, it keeps
  // its width. One narrower than its longest word is capped, not stacked.
  const atMinContent = (el) => {
    const style = el.getAttribute("style"), width = el.getBoundingClientRect().width;
    for (const [p, v] of [["width", "min-content"], ["min-width", "0"], ["max-width", "none"], ["flex", "none"]]) el.style.setProperty(p, v, "important");
    const min = el.getBoundingClientRect().width;
    if (style === null) el.removeAttribute("style"); else el.setAttribute("style", style);
    return Math.abs(width - min) <= 1;
  };
  // A stack drawn on purpose: the text's block, or a box it fills out to the root, is as narrow as its min-content.
  const stacked = (ctx) => {
    for (let el = ctx; el && el !== root; el = el.parentElement) {
      if (/^(inline|contents)$/.test(getComputedStyle(el).display)) return false;
      if (atMinContent(el)) return true;
      const p = el.parentElement;
      if (!p || p === root) return false;
      const pcs = getComputedStyle(p), sides = ["Left", "Right"].reduce((s, x) => s + parseFloat(pcs[`padding${x}`]) + parseFloat(pcs[`border${x}Width`]), 0);
      if (Math.abs(el.getBoundingClientRect().width - (p.getBoundingClientRect().width - sides)) > 1) return false;
    }
    return false;
  };
  const flexRow = (el) => { const cs = el && getComputedStyle(el); return Boolean(cs && /flex/.test(cs.display) && !cs.flexDirection.startsWith("column")); };
  // A word's flex item: the outermost item of a flex row between the word and its line's context; a text straight in a
  // flex row is an item of its own.
  const itemOf = (node, ctx) => {
    let item = flexRow(node.parentElement) ? node : null;
    for (let el = node.parentElement; el && el !== ctx; el = el.parentElement) if (flexRow(el.parentElement)) item = el;
    return item;
  };
  const words = (run) => run.filter((w, k) => !(k && /^\d{3}(?:[.,]\d+)?$/.test(w.t) && /^\d{1,3}$/.test(run[k - 1].t))).length;
  // The component's content box, where its text belongs.
  const content = () => {
    const r = root.getBoundingClientRect(), cs = getComputedStyle(root);
    const side = (x) => parseFloat(cs[`padding${x}`]) + parseFloat(cs[`border${x}Width`]);
    return { left: r.left + side("Left"), right: r.right - side("Right"), width: r.width };
  };
  const outBy = (rects, box) => Math.max(0, ...rects.map((r) => Math.max(box.left - r.left, r.right - box.right)));
  const things = [...root.querySelectorAll("svg, img, canvas, video, [role=img], [class*=icon], a[href], button, input, select, textarea, [role=button], [role=link]")]
    .filter((g) => visible(g) && !g.parentElement?.closest("svg"));
  const groups = [];
  for (const [ctx, run] of runs) {
    const items = new Map();
    for (const w of run) { const it = itemOf(w.node, ctx); items.set(it, [...(items.get(it) ?? []), w]); }
    if (!items.has(null) && items.size >= 2) for (const [it, list] of items) groups.push({ ctx, el: it.nodeType === 3 ? it.parentElement : it, run: list });
    else groups.push({ ctx, el: ctx, run });
  }
  for (const { ctx, el, run } of groups) {
    const n = words(run);
    if (n < 2 || n > 6) continue;
    const tops = run.map((x) => x.rects[0].top), h = Math.min(...run.map((x) => x.rects[0].height));
    if (Math.max(...tops) - Math.min(...tops) <= h / 2) continue;
    if ([ctx, el].some((x) => { const cs = getComputedStyle(x); return (cs.webkitLineClamp && cs.webkitLineClamp !== "none") || cs.textOverflow === "ellipsis"; })) continue;
    if (stacked(el)) continue;
    // What it may not run into or push out of the component: every other text, icon, picture and control.
    const mine = new Set(run.map((w) => w.node));
    const obstacles = [...nodes.filter((o) => !mine.has(o) && !el.contains(o)).map((o) => () => rectsOf(o)),
      ...things.filter((g) => !el.contains(g) && !g.contains(el)).map((g) => () => [g.getBoundingClientRect()].filter((r) => r.width > 2 && r.height > 2))];
    const was = content(), before = obstacles.map((o) => outBy(o(), was));
    // The root keeps its size: only its own lines are set unwrapped, and every other line keeps how it wraps.
    const pins = el === root ? [...runs.keys()].filter((c) => c !== root).map((c) => [c, c.getAttribute("style"), getComputedStyle(c).whiteSpace]) : [];
    for (const [c, , ws] of pins) c.style.setProperty("white-space", ws, "important");
    el.setAttribute(el === root ? "data-dtc-wrap" : "data-dtc-lift", "");
    const box = content(), mineNow = run.map(wordRects), all = mineNow.flat();
    const firsts = mineNow.map((r) => r[0]).filter(Boolean);
    const oneLine = firsts.length === run.length && all.every((r) => Math.abs(r.top - firsts[0].top) <= Math.min(...firsts.map((x) => x.height)) / 2);
    const fits = oneLine && box.width <= rr.width + 1 && all.every((r) => r.left >= box.left - 1 && r.right <= box.right + 1);
    const clash = fits && obstacles.some((o, i) => { const rs = o(); return rs.some((a) => all.some((b) => meets(a, b))) || outBy(rs, box) > before[i] + 1; });
    el.removeAttribute("data-dtc-lift");
    el.removeAttribute("data-dtc-wrap");
    for (const [c, style] of pins) { if (style === null) c.removeAttribute("style"); else c.setAttribute("style", style); }
    if (fits && !clash) {
      const text = run.map((x) => x.t).join(" ");
      issues.push({ landmark: label(text), property: "wrap", kind: "wraps with room", actual: `“${text}” wraps, though on one line it fits the component and runs into nothing: keep it on one line: white-space: nowrap on the amount and on the period (a value and its unit), an ordinary space between them, and no cap on their block` });
    }
  }
  lift.remove();
  // Text over an icon or a small picture: the graphics people read beside text, not a backdrop it is set on.
  const graphics = [...root.querySelectorAll("svg, img, canvas, [class*=icon]")].filter((g) => visible(g) && !g.textContent.trim())
    .map((g) => ({ g, r: g.getBoundingClientRect() })).filter(({ r }) => r.width > 2 && r.height > 2 && r.width * r.height <= 64 * 64);
  for (const { node, b } of lines) for (const { g, r } of graphics) {
    if (g.contains(node.parentElement)) continue; // a graphic that holds the text, as an SVG's own <text>
    const w = Math.min(b.right, r.right) - Math.max(b.left, r.left), h = Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top);
    if (w > 1 && h > 1) issues.push({ landmark: `${label(node.data)} × ${g.getAttribute("aria-label") || g.getAttribute("alt") || g.localName}`, property: "overlap", delta: Math.min(w, h), actual: `${Math.round(w)} × ${Math.round(h)} px of text over a graphic` });
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
  // The layout model's lines at this width: the pieces shown share a row (their first lines overlap), stand in the
  // order listed, and each takes one line unless it may wrap. A line with fewer than two pieces shown measures nothing.
  const lineMeasured = [], lineErrors = [];
  const outOfFlow = (el) => /absolute|fixed/.test(getComputedStyle(el).position);
  // A piece as a person sees it: in the flow, not clipped away, inside the root. Its first line is where it stands in
  // the row; it wraps when one of its visible texts takes more than one line (a label over its value is two texts).
  const shownBox = (el) => {
    let r = el.getBoundingClientRect(), box = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (!/hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY)) continue;
      const c = p.getBoundingClientRect();
      box = { left: Math.max(box.left, c.left), right: Math.min(box.right, c.right), top: Math.max(box.top, c.top), bottom: Math.min(box.bottom, c.bottom) };
    }
    box = { left: Math.max(box.left, rr.left), right: Math.min(box.right, rr.right), top: Math.max(box.top, rr.top), bottom: Math.min(box.bottom, rr.bottom) };
    return box.right - box.left > 0.5 && box.bottom - box.top > 0.5;
  };
  const firstLine = (el) => {
    const texts = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (!n.data.trim() || !visible(n.parentElement)) continue;
      let out = false;
      for (let p = n.parentElement; p && p !== el; p = p.parentElement) if (outOfFlow(p)) { out = true; break; }
      if (out) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
      if (rects.length) texts.push(rects);
    }
    if (!texts.length) { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, count: 1 }; }
    const rowsIn = (rects) => {
      const rows = [];
      for (const r of [...rects].sort((a, b) => a.top - b.top)) if (!rows.some((t) => r.top < t.bottom - Math.min(r.height, t.bottom - t.top) / 2)) rows.push({ top: r.top, bottom: r.bottom });
      return rows;
    };
    const all = texts.flat(), rows = rowsIn(all);
    const first = all.filter((r) => r.top < rows[0].bottom - Math.min(r.height, rows[0].bottom - rows[0].top) / 2);
    return { left: Math.min(...first.map((r) => r.left)), right: Math.max(...first.map((r) => r.right)),
      top: Math.min(...first.map((r) => r.top)), bottom: Math.max(...first.map((r) => r.bottom)), count: Math.max(...texts.map((t) => rowsIn(t).length)) };
  };
  const rtl = getComputedStyle(root).direction === "rtl";
  const start = (b) => (rtl ? -b.right : b.left);
  for (const line of modelLines) {
    let pieces;
    try {
      if (line.when && ![...document.querySelectorAll(line.when)].some(visible)) continue;
      pieces = line.pieces.flatMap((p, order) => {
        const selector = typeof p === "string" ? p : p.selector, wraps = typeof p === "object" && Boolean(p.wraps);
        return [...root.querySelectorAll(selector)].filter((el) => visible(el) && !outOfFlow(el) && shownBox(el))
          .map((el) => ({ selector, wraps, order, el, box: firstLine(el) }));
      });
    } catch (e) { lineErrors.push(`${line.name}: ${e.message.split("\n")[0]}`); continue; }
    // Two different elements make a line; one element named twice measures nothing.
    if (new Set(pieces.map((p) => p.el)).size < 2) continue;
    lineMeasured.push(line.name);
    const say = (p) => `“${p.selector}”`;
    const wrapped = pieces.find((p) => !p.wraps && p.box.count > 1);
    if (wrapped) issues.push({ landmark: line.name, property: "line", kind: "wraps", actual: `${say(wrapped)} wraps onto ${wrapped.box.count} lines` });
    const top = Math.max(...pieces.map((p) => p.box.top)), bottom = Math.min(...pieces.map((p) => p.box.bottom));
    const shortest = Math.min(...pieces.map((p) => p.box.bottom - p.box.top));
    if (bottom - top <= Math.min(1, shortest / 4)) {
      const low = pieces.reduce((a, b) => (b.box.top > a.box.top ? b : a)), high = pieces.reduce((a, b) => (b.box.top < a.box.top ? b : a));
      issues.push({ landmark: line.name, property: "line", kind: "row", actual: `${say(low)} leaves the row: it starts ${Math.round(low.box.top - high.box.bottom)} px below the end of ${say(high)}` });
    } else {
      // In the order listed, each piece after every piece before it (the matches of one selector in any order).
      const orders = [...new Set(pieces.map((p) => p.order))].sort((a, b) => a - b);
      for (let i = 1; i < orders.length; i++) {
        const before = pieces.filter((p) => p.order === orders[i - 1]), after = pieces.filter((p) => p.order === orders[i]);
        const late = before.reduce((a, b) => (start(b.box) > start(a.box) ? b : a)), early = after.reduce((a, b) => (start(b.box) < start(a.box) ? b : a));
        if (start(early.box) < start(late.box) - 1) {
          issues.push({ landmark: line.name, property: "line", kind: "order", actual: `${say(early)} stands before ${say(late)}` });
          break;
        }
      }
    }
  }
  const rows = rowsOf(nodes);
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
  // Constructs, outside overlays: what moves a thing to a drawn place instead of laying it out.
  const overlay = (el) => el.closest('[role=tooltip], [role=dialog], [role=menu], [role=listbox], [popover], dialog, [aria-hidden="true"]');
  for (const el of root.querySelectorAll("*")) {
    if (!visible(el) || !el.textContent.trim() || overlay(el)) continue;
    const box = el.getBoundingClientRect();
    if (box.width <= 2 || box.height <= 2) continue; // kept for screen readers alone
    const cs = getComputedStyle(el);
    // A construct that moves a thing to a drawn place instead of laying it out: a negative margin, a transform that
    // shifts text. It holds for the data it was tuned on and breaks for the next.
    // The kit's own classes (design.json "kit": class prefixes) build with negative gutters and offsets by design.
    const ofKit = kit.length && [...el.classList].some((c) => kit.some((k) => c.startsWith(k)));
    const inside = box.right > rr.left && box.left < rr.right && box.bottom > rr.top && box.top < rr.bottom;
    const m = Object.fromEntries(["Top", "Right", "Bottom", "Left"].map((side) => [side, parseFloat(cs[`margin${side}`])]));
    const bleed = m.Left < 0 && Math.abs(m.Left - m.Right) <= 1 && m.Top >= -3 && m.Bottom >= -3; // full width, both sides alike
    const pulls = Object.entries(m).filter(([, v]) => v < -3);
    if (pulls.length && !ofKit && inside && !bleed) issues.push({ landmark: label(el.textContent), property: "construct", kind: "negative margin",
      actual: `a negative margin (${pulls.map(([side, v]) => `${side.toLowerCase()} ${Math.round(v)} px`).join(", ")}) pulls it into place: lay it out instead` });
    // A small shift by transform, the translate property or a relative offset: a nudge to a drawn place. Centring
    // (half its own size) and sliding (more than its size) are layouts, not nudges.
    const nums = cs.transform.match(/^matrix(3d)?\(([^)]+)\)$/);
    const mt = nums ? nums[2].split(",").map(Number) : null;
    const [tx, ty] = mt ? (nums[1] ? [mt[12], mt[13]] : [mt[4], mt[5]]) : [0, 0];
    const tr = cs.translate && cs.translate !== "none" ? cs.translate.split(/\s+/).map((v) => parseFloat(v) || 0) : [0, 0];
    // A relative box reports both sides (top 3 px, bottom -3 px): the set one is the shift.
    const rel = cs.position === "relative" ? [["left", "right"], ["top", "bottom"]].map(([a, b]) => (el.style[a] || !el.style[b] ? parseFloat(cs[a]) || 0 : -(parseFloat(cs[b]) || 0))) : [0, 0];
    const nudge = (dx, dy) => [dx, dy].some((d, i) => {
      const size = i ? box.height : box.width;
      return Math.abs(d) >= 2 && Math.abs(Math.abs(d) - size / 2) > 1.5 && Math.abs(d) <= size;
    });
    if (!ofKit && cs.animationName === "none") for (const [how, dx, dy] of [["a transform", tx, ty], ["the translate property", tr[0], tr[1] ?? 0], ["a relative offset", rel[0], rel[1]]]) {
      if (nudge(dx, dy)) issues.push({ landmark: label(el.textContent), property: "construct", kind: "nudge", actual: `${how} moves it ${Math.round(dx)}, ${Math.round(dy)} px: lay it out instead` });
    }
  }
  // A mode set by script: a class, data- attribute or style written in a ResizeObserver callback or a window-size
  // matchMedia change listener (the init script saw it). A layout it decides is a container query's to switch; a fit
  // to content (a font shrunk to fit, "+3 more") is the script's, with its reason.
  for (const { el, attr, source } of window.__designCheck?.modes() ?? []) {
    if (!el.isConnected || !root.contains(el) || overlay(el)) continue;
    issues.push({ landmark: el === root ? "root" : label(el.textContent) || el.localName, property: "construct", kind: "script-set mode",
      actual: `${source} sets its ${attr}: if it decides the layout, switch it by a container query; if it fits content, give its reason` });
  }
  // The longest texts shown: what a story tested, for the owner to see in the evidence.
  const longest = [...new Set(nodes.map((n) => n.data.trim().replace(/\s+/g, " ")))].sort((a, b) => b.length - a.length).slice(0, 4);
  return { root: { width: rr.width, height: rr.height }, issues, rows, unmeasured, lineMeasured, lineErrors, longest };
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

// One byte of luminance and one of chroma per pixel of a PNG, read in the browser: the ink is found from them.
async function luminance(page, png) {
  const { W, H, data, colour } = await page.evaluate(async (src) => {
    const i = new Image();
    await new Promise((resolve, reject) => { i.onload = resolve; i.onerror = () => reject(new Error("image does not load")); i.src = src; });
    const c = document.createElement("canvas"); c.width = i.width; c.height = i.height;
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(i, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let s = "", t = "";
    for (let p = 0; p < d.length; p += 4) {
      s += String.fromCharCode(Math.round(d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114));
      t += String.fromCharCode(Math.max(d[p], d[p + 1], d[p + 2]) - Math.min(d[p], d[p + 1], d[p + 2]));
    }
    return { W: c.width, H: c.height, data: btoa(s), colour: btoa(t) };
  }, `data:image/png;base64,${png.toString("base64")}`);
  return { W, H, lum: Uint8Array.from(Buffer.from(data, "base64")), chroma: Uint8Array.from(Buffer.from(colour, "base64")) };
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

// What the page measures for a spec's landmarks: a text, found as the spec says it (or as the ledger's text entry
// replaces it), or a selector; a named box from an image near its place in the design.
function landmarkTargets(spec, frame, ledger) {
  const near = (l) => (spec.source === "image boxes" && l.box ? { x: l.box.x, y: l.box.y } : undefined);
  return spec.landmarks.map((l) => (l.selector ? { selector: l.selector, nth: l.nth, near: near(l) }
    : { text: l.text, alternate: pageText(l, frame.name, ledger), nth: l.nth, documentOrder: spec.source === "page snapshot", near: near(l) }));
}

async function measureFrames(browser, cfg, frames, ledger, out) {
  const scratch = await (await browser.newContext()).newPage();
  const results = [];
  for (const frame of frames) {
    const spec = readJson(frame.spec);
    const reference = frame.reference && fs.existsSync(frame.reference) ? fs.readFileSync(frame.reference) : null;
    // Named boxes: each landmark's box is the union of its pieces, or the box it gives where a piece holds two things
    // (an icon joined to its label). Measured once every landmark has a text or a selector, every piece is named once or
    // skipped with a reason, and no landmark's box takes in another landmark's piece.
    let unnamed = [];
    if (spec.source === "image boxes") {
      const byN = new Map((spec.pieces ?? []).map((p) => [p.n, p.box]));
      const owner = new Map();
      const centreIn = (p, b) => { const cx = p.x + p.width / 2, cy = p.y + p.height / 2; return cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height; };
      spec.landmarks.forEach((l, i) => {
        const name = `landmark ${i + 1} (“${l.text || l.selector || "?"}”)`;
        for (const n of l.pieces ?? []) {
          if (!byN.has(n)) unnamed.push(`${name} names piece ${n}, which does not exist`);
          else if (owner.has(n)) unnamed.push(`piece ${n} is in ${owner.get(n)} and ${name}`);
          else owner.set(n, name);
        }
        const boxes = (l.pieces ?? []).map((n) => byN.get(n)).filter(Boolean);
        // A box given beside its pieces holds more than its text: an icon joined to its label.
        if (l.box && l.text) l.joined = true;
        if (!l.box && boxes.length) {
          const x = Math.min(...boxes.map((b) => b.x)), y = Math.min(...boxes.map((b) => b.y));
          l.box = { x, y, width: Math.max(...boxes.map((b) => b.x + b.width)) - x, height: Math.max(...boxes.map((b) => b.y + b.height)) - y };
        }
      });
      for (const [k] of Object.entries(spec.skip ?? {})) if (owner.has(Number(k))) unnamed.push(`piece ${k} is skipped and in ${owner.get(Number(k))}`);
      // A box that takes in someone else's piece would hide it from the check and from the pixels.
      spec.landmarks.forEach((l, i) => {
        if (!l.box) return;
        const theirs = (spec.pieces ?? []).filter((p) => !(l.pieces ?? []).includes(p.n) && centreIn(p.box, l.box));
        if (theirs.length && !l.selector) unnamed.push(`landmark ${i + 1} (“${l.text}”) takes in piece${theirs.length > 1 ? "s" : ""} ${theirs.map((p) => p.n).join(", ")} of another`);
      });
      // A text named twice is matched by place; the order is kept for the report.
      const seen = new Map();
      for (const l of [...spec.landmarks].filter((x) => x.box && x.text).sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)) {
        const k = String(l.text).replace(/\s+/g, "").toLowerCase(), n = seen.get(k) ?? 0;
        seen.set(k, n + 1);
        if (n) l.nth = n;
      }
      unnamed.push(...spec.landmarks.map((l, i) => (!String(l.text ?? "").trim() && !String(l.selector ?? "").trim() ? `landmark ${i + 1} has no text or selector`
        : !l.box ? `landmark ${i + 1} (“${l.text || l.selector}”) names no piece that exists and gives no box` : null)).filter(Boolean));
      if (!spec.landmarks.length) unnamed.push("no landmark is named yet");
    }
    if (unnamed.length) {
      results.push({ frame: frame.name, pass: false, verdict: "incomplete", score: null, causes: [], issues: [], root: { spec: spec.frame, page: null }, images: {},
        unmeasured: `the named boxes are not ready: ${unnamed.slice(0, 4).join("; ")}${unnamed.length > 4 ? "; …" : ""}. Name them from boxes.png`,
        gallery: { width: spec.frame.width, images: { design: dataUrl(reference) } } });
      continue;
    }
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
    // An overlay frame (its own root) records the element its setup opened it from, for the journey that must close it.
    const setupTargets = [];
    if (frame.root && frame.root !== cfg.root) for (const st of frame.setup ?? []) {
      const [act] = Object.keys(st);
      if (!["hover", "click", "tap", "focus"].includes(act) || typeof st[act] !== "string") continue;
      const key = await page.locator(st[act]).first().evaluate(elementKey, null, { timeout: 2000 }).catch(() => null);
      if (key) setupTargets.push({ selector: st[act], key });
    }
    try {
      const measured = await page.evaluate(inPage, { command: "measure", root: fcfg.root, landmarks: landmarkTargets(spec, frame, ledger) });
      if (measured.error) throw Object.assign(new Error(`${frame.name}: ${measured.error}`), { exit: 2 });
      const shot = await (await rootOf(page, fcfg.root)).screenshot({ animations: "disabled", caret: "hide" });
      const dir = path.join(out, frameKey(frame.name));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "page.png"), shot);
      const before = beforeFrame(out, frame, settings, shot);
      measured.images = { page: path.relative(out, path.join(dir, "page.png")) };
      let regions = [];
      // A spec of named boxes, from an image alone: each box tight to the ink the design draws, so the page's box is
      // made tight to its ink too before they compare, and the design's ink must all be named.
      if (reference && spec.source === "image boxes") {
        const pageInk = await luminance(scratch, shot);
        const hist = new Uint32Array(256);
        for (const v of pageInk.lum) hist[v]++;
        const paper = hist.indexOf(Math.max(...hist));
        const lumOf = (hex) => { const c = String(hex).match(/[0-9a-f]{2}/gi)?.map((h) => parseInt(h, 16)); return c?.length >= 3 ? Math.round(c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) : undefined; };
        // A text is tight to the pixels of its own colour; an icon or a shape to what differs from the page's paper.
        measured.landmarks.forEach((m, i) => {
          if (!m?.found) return;
          m.box = spec.landmarks[i].selector ? tightBox(pageInk, m.box, scale, { against: paper }) : tightBox(pageInk, m.box, scale, { colour: lumOf(m.font?.color) });
        });
        const skipped = Object.keys(spec.skip ?? {}).map(Number);
        measured.uncovered = uncovered(inkRuns(await luminance(scratch, reference), { scale, join: 0.45 }),
          [...spec.landmarks, ...(spec.pieces ?? []).filter((p) => skipped.includes(p.n))]);
        measured.skipped = Object.entries(spec.skip ?? {}).map(([n, why]) => `piece ${n}: ${why}`);
      }
      if (reference) {
        // Text is left out of the pixels: its landmarks measure it.
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
      // Named boxes from an image read glyph edges in another font: held to 4 px, as an owner's eye is.
      const result = compareFrame({ frame: frame.name, spec, measured, tolerance: spec.source === "image boxes" ? Math.max(4, cfg.tolerance) : cfg.tolerance, ledger, regions, missingReference: !reference });
      if (setupTargets.length) result.setupTargets = setupTargets;
      if (before.reason) result.beforeUnavailable = before.reason;
      if (before.comparison) result.beforeComparison = before.comparison;
      const selectors = [...new Set(cfg.journeys.flatMap((j) => j.steps.map((st) => st.hover ?? st.focus ?? st.tap ?? st.click ?? st.move)).filter((s) => typeof s === "string"))];
      result.openers = await (await rootOf(page, fcfg.root)).evaluate(openerInfoIn, { inventory: true, selectors });
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

// The conditions the sweep makes itself, run in the page on the root: texts longer by two fifths (as pseudo-localization
// does), and each set of repeated entries (siblings of one class) doubled. Each is applied once to what it has not seen,
// and says how much it changed.
const STRESS = {
  stretch: (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), texts = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) texts.push(n);
    let changed = 0;
    for (const n of texts) {
      const t = n.data.trim();
      if (!t || n.dtcStretched) continue;
      n.data = n.data.replace(t, `${t} ${t.slice(0, Math.ceil(t.length * 0.4))}`);
      n.dtcStretched = true;
      changed++;
    }
    return changed;
  },
  double: (root) => {
    if (root.dtcDoubled) return 0;
    // Each parent with its repeated entries: only those are doubled, after the last of them, not their neighbours. Only
    // rows of a list, each below the one before it: buttons or columns side by side are a layout, not a count that
    // grows. A set inside an entry is doubled first, so that the entry's copies carry it doubled too.
    const sets = new Map();
    for (const el of root.querySelectorAll("*")) {
      const p = el.parentElement;
      if (!p || sets.has(p) || typeof el.className !== "string" || !el.className.trim()) continue;
      const entries = [...p.children].filter((k) => k.className === el.className);
      if (p.children.length > 12 || entries.length < 2) continue;
      const boxes = entries.map((k) => k.getBoundingClientRect());
      if (boxes.every((b, i) => !i || b.top >= boxes[i - 1].bottom - 1)) sets.set(p, entries);
    }
    for (const [, entries] of [...sets].reverse()) entries.at(-1).after(...entries.map((k) => k.cloneNode(true)));
    root.dtcDoubled = true;
    return sets.size;
  },
};
// What counts on a generated condition: a collision or a cut, not a wrap or a line of texts that are not the product's.
const STRESSED = ["overlap", "clipped", "outside", "covered"];

// The component's own width, a generated condition: at each frame's width, the frame's page in a window of that width,
// and again in a 1280 px window with the root's container held at the content width it had, as a column a sidebar
// narrows, or another page's, holds it. A component laid out by its own width is the same in both; one that follows the
// window (a media query, matchMedia, a script reading the window's width) is not.
const WIDE_WINDOW = 1280, OWN_WIDTH = "the component's own width";
// How far the root's own width, and what its container lays beside it, may move under the hold before the condition
// measures nothing at that width.
const HELD = 3;
// In the page: the content width of the root's container (its parent, past one that is display: contents or inline),
// or, given a width, that box held at it by width, min-width and max-width, as `host` gives each frame its width. The
// root is the marked one, or with no mark the first a person sees. Asked for the component's own width: that width and
// how wide what else the container lays on the root's row is (a sidebar), or "page" when the root is the page itself
// in the page's body (main, or what holds it), which the window lays out.
function containerIn([selector, mark, seen, width, own = false]) {
  const visible = new Function(`return (${seen})`)();
  const root = (mark && document.querySelector(`[${mark}]`)) || [...document.querySelectorAll(selector)].find(visible);
  let box = root?.parentElement;
  while (box?.parentElement && /^(contents|inline)$/.test(getComputedStyle(box).display)) box = box.parentElement;
  if (!box) return null;
  const main = "main, [role=main]";
  if (own && (box === document.body || box === document.documentElement) && (root === document.body || root.matches(main) || root.querySelector(main))) return "page";
  const cs = getComputedStyle(box), px = (k) => parseFloat(cs[k]) || 0;
  const edges = px("paddingLeft") + px("paddingRight") + px("borderLeftWidth") + px("borderRightWidth");
  if (width === null && own) {
    const r = root.getBoundingClientRect();
    const beside = [...box.children].filter((c) => !c.contains(root) && visible(c) && !/^(absolute|fixed)$/.test(getComputedStyle(c).position))
      .map((c) => c.getBoundingClientRect()).filter((b) => b.top < r.bottom && b.bottom > r.top).reduce((sum, b) => sum + b.width, 0);
    return { width: box.getBoundingClientRect().width - edges, beside };
  }
  if (width === null) return box.getBoundingClientRect().width - edges;
  for (const k of ["width", "min-width", "max-width"]) box.style.setProperty(k, `${cs.boxSizing === "border-box" ? width + edges : width}px`, "important");
  return width;
}
const container = (page, cfg, width = null, own = false) => page.evaluate(containerIn, [cfg.root, MARK, seenIn.toString(), width, own]).catch(() => null);

// What differs between the root in a window of its frame's width and in the wide window with its container held at
// the same width: which texts share a row, its size, the spec's landmarks. Null when they agree within the tolerance.
function ownWidthIssue({ frame, width, held, narrow, wide, labels, tolerance }) {
  const r = Math.round, moved = [];
  let delta = 0;
  const differ = (d) => Math.abs(d) > tolerance && (delta = Math.max(delta, Math.abs(d)), true);
  if (narrow.rows !== wide.rows) moved.push("another layout (the texts share rows differently)");
  if ([differ(wide.root.width - narrow.root.width), differ(wide.root.height - narrow.root.height)].some(Boolean)) {
    moved.push(`the root ${r(narrow.root.width)} × ${r(narrow.root.height)} px → ${r(wide.root.width)} × ${r(wide.root.height)}`);
  }
  narrow.landmarks.forEach((a, i) => {
    const b = wide.landmarks[i];
    if (Boolean(a?.found) !== Boolean(b?.found)) moved.push(`“${labels[i]}” ${a?.found ? "hidden" : "shown"}`);
    else if (a?.found && ["x", "y", "width", "height"].map((k) => differ(b.box[k] - a.box[k])).some(Boolean)) {
      moved.push(`“${labels[i]}” ${r(a.box.x)}, ${r(a.box.y)} → ${r(b.box.x)}, ${r(b.box.y)}${r(a.box.width) !== r(b.box.width) ? `, ${r(a.box.width)} → ${r(b.box.width)} px wide` : ""}`);
    }
  });
  if (!moved.length) return null;
  return { landmark: frame, property: "window", delta, actual: `laid out by the window, not by its own width: in a ${WIDE_WINDOW} px window, its container held at the ${r(held)} px it had at ${width}, ${moved.slice(0, 4).join("; ")}${moved.length > 4 ? `; and ${moved.length - 4} more` : ""}` };
}

async function ownWidth(browser, cfg, ledger, widths) {
  // Each width once, on the first frame of the component's own root drawn at it.
  const frames = new Map();
  for (const f of cfg.frames) if ((!f.root || f.root === cfg.root) && widths.has(f.width) && f.width !== WIDE_WINDOW && !frames.has(f.width)) frames.set(f.width, f);
  const probes = [], pageRoot = [], unheld = [];
  try {
    for (const [width, frame] of frames) {
      const spec = frame.spec && fs.existsSync(frame.spec) ? readJson(frame.spec) : {};
      const landmarks = (spec.landmarks ?? []).filter((l) => String(l.text ?? "").trim() || String(l.selector ?? "").trim());
      const targets = landmarkTargets({ ...spec, landmarks }, frame, ledger);
      const at = { url: frame.url, setup: frame.setup ?? [] };
      const layout = async (page) => {
        const m = await page.evaluate(inPage, { command: "measure", root: cfg.root, landmarks: targets });
        if (m.error) throw unmeasured(`${OWN_WIDTH} at ${width} px: ${m.error}`);
        return m;
      };
      let narrow, wide, box, beside;
      // In a window of the frame's width, as the frame is when the window sizes it.
      let opened = await open(browser, cfg, { ...at, width, viewport: width });
      try { box = await container(opened.page, cfg, null, true); narrow = box === "page" ? null : await layout(opened.page); } finally { await opened.context.close(); }
      // The page itself in the page's body: the window lays it out, as it should.
      if (box === "page") { pageRoot.push(width); continue; }
      if (!(box?.width > 0)) continue;
      const held = box.width;
      // In the wide window, the container held before the setup acts and again once the page is set up; what the
      // component does on its container's change (an observer, a container query) is then done.
      const hold = (page) => container(page, cfg, held);
      opened = await open(browser, cfg, { ...at, ...(cfg.host ? { width, viewport: WIDE_WINDOW } : { width: WIDE_WINDOW }), prepare: hold });
      try {
        await hold(opened.page);
        for (let i = 0; i < 2; i++) await settle(opened.page, cfg.root);
        await markRoot(opened.page, cfg.root);
        wide = await layout(opened.page);
        beside = (await container(opened.page, cfg, null, true))?.beside ?? box.beside;
      } finally { await opened.context.close(); }
      // The hold gives the root's container its width, not always the root its own. Where what the container lays
      // beside the root moved too (a sidebar the narrow window hides), the condition compares two widths of the
      // component, not two windows, and measures nothing at this width; where nothing beside it moved, the root's own
      // width follows the window (a width a media query sets, vw), which is the candidate.
      if (Math.abs(wide.root.width - narrow.root.width) > HELD && Math.abs(beside - box.beside) > HELD) { unheld.push({ width, held, narrow: narrow.root.width, wide: wide.root.width }); continue; }
      const issue = ownWidthIssue({ frame: frame.name, width, held, narrow, wide, labels: landmarks.map((l) => l.text ?? l.selector), tolerance: cfg.tolerance });
      probes.push({ width, issues: issue ? [issue] : [] });
    }
  } catch (e) {
    if (!e.unmeasured) throw e;
    return { issues: [], story: { name: OWN_WIDTH, generated: true, unmeasured: e.message.split("\n")[0], shots: [] } };
  }
  const issues = sweepIssues(probes, ledger).map((i) => ({ ...i, story: OWN_WIDTH, ...(i.status === "accepted" ? {} : { status: "candidate" }) }));
  // What it did not try, or could not measure: notes in the evidence, not gaps, since the page decides them.
  const r = Math.round, px = (list) => `${list.slice(0, -1).join(", ")}${list.length > 1 ? " and " : ""}${list.at(-1)} px`;
  const notes = [
    ...(pageRoot.length ? [`not tried at ${px(pageRoot)}: the root is the page itself, main or what holds it in the page's body, and a page is laid out by the window`] : []),
    ...unheld.map((u) => `not measured at ${u.width} px: with its container held at ${r(u.held)} px in a ${WIDE_WINDOW} px window, the root is ${r(u.wide)} px wide, not the ${r(u.narrow)} it has at ${u.width}; what else the container holds there (a sidebar the narrower window hides) takes the rest`),
  ];
  return { issues, story: { name: OWN_WIDTH, generated: true, shots: [], ...(notes.length ? { notes } : {}) } };
}

async function sweep(browser, cfg, ledger) {
  const s = cfg.sweep;
  const from = Number(s.from), to = Number(s.to), step = Number(s.step ?? 8);
  if (!(from > 0 && to >= from && step > 0)) throw Object.assign(new Error("sweep: give from, to and step in design.json"), { exit: 2 });
  const frameWidths = new Set(cfg.frames.map((f) => f.width).filter((w) => w >= from && w <= to));
  const widths = new Set(frameWidths);
  // A quick check, while tuning, sweeps the frames' widths only: the same stories and checks, far fewer widths.
  if (!cfg.quick) { for (let w = to; w >= from; w -= step) widths.add(w); widths.add(from); }
  else if (!widths.size) widths.add(Math.min(to, Math.max(from, ...cfg.frames.map((f) => f.width)))); // no frame inside the sweep
  // The widths the layout model predicts a switch at are measured exactly, a pixel either side.
  for (const w of s.switches ?? []) for (const x of [w - 1, w, w + 1]) if (x >= from && x <= to) widths.add(x);
  const order = [...widths].sort((a, b) => b - a);
  // One mounted page for every width, narrowing from the widest, as a user resizes it: state set up once must survive.
  // A story (the longest data, every conditional action at once) is swept the same way, and pictured at the frames' widths.
  const run = async (url, setup, shots, stress, widthsHere = order) => {
    const { context, page } = await open(browser, cfg, { url, width: widthsHere[0], setup });
    try {
      const probe = async (width) => {
        await setWidth(page, cfg, width, 900);
        await settle(page, cfg.root);
        // A generated condition is applied again after each width: a component that renders anew keeps it. One that picks
        // its layout from its content on a resize is then resized as a person would, a pixel narrower and back with a
        // resize event, so that it chooses with the condition; what it renders anew takes the condition in turn.
        if (stress) {
          const apply = async () => { const n = await (await rootOf(page, cfg.root)).evaluate(STRESS[stress]); await settle(page, cfg.root); return n; };
          await apply();
          for (let round = 0; round < 3; round++) {
            await setWidth(page, cfg, width > 1 ? width - 1 : width + 1, 900);
            await settle(page, cfg.root);
            await setWidth(page, cfg, width, 900);
            await page.evaluate(() => window.dispatchEvent(new Event("resize")));
            await settle(page, cfg.root);
            if (!(await apply())) break;
          }
        }
        const lines = (s.lines ?? []).filter((l) => (l.from ?? 0) <= width && width <= (l.to ?? Infinity));
        const r = await page.evaluate(inPage, { command: "probe", root: cfg.root, align: s.align ?? [], tolerance: cfg.tolerance, lines, kit: cfg.kit ?? [] });
        if (r.error) throw Object.assign(new Error(`sweep at ${width}: ${r.error}`), { exit: 2 });
        // A picture for the gallery only: a root with no size to capture leaves a gap, not a failed check.
        if (shots && frameWidths.has(width) && !shots.has(width)) {
          shots.set(width, await (await rootOf(page, cfg.root)).screenshot({ animations: "disabled", caret: "hide", timeout: 5000 }).catch(() => null));
        }
        return { width, ...r };
      };
      const probes = [];
      for (const w of widthsHere) probes.push(await probe(w));
      const back = await probe(widthsHere[0]);
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
  const stories = [], storyProbes = [];
  for (const story of s.stories ?? []) {
    const shots = new Map();
    let r;
    try { r = await run(story.url, story.setup, shots); }
    catch (e) { stories.push({ name: story.name, unmeasured: e.message.split("\n")[0], shots: [] }); storyProbes.push([]); continue; }
    storyProbes.push([...r.probes, r.back]);
    const these = storyProbes.at(-1);
    groups.push(...alignmentGaps(these).map((g) => ({ ...g, story: story.name })));
    issues.push(...sweepIssues(these, ledger).map((i) => ({ ...i, story: story.name })));
    stories.push({ name: story.name, longest: these.find((p) => p.longest)?.longest ?? [], shots: [...shots].filter(([, png]) => png).map(([width, png]) => ({ width, image: dataUrl(png) })) });
  }
  // Conditions the check makes itself, so that no one has to think of them: every text longer by two fifths, every
  // list's rows doubled, on the frames' page, at the frames' widths and the sweep's ends. Their texts are not the
  // product's, so only what collides or is cut counts on them.
  const stressWidths = [...new Set([...frameWidths, from, to, ...(s.switches ?? [])])].filter((w) => w >= from && w <= to).sort((a, b) => b - a);
  // The stories already carry the longest values the contract allows, so only the frames' page is stretched. What these
  // conditions find is a candidate, not a finding: legal data reproduces it, or the contract's bound rules it out.
  const generated = s.generate === false ? [] : [
    { name: "the frames' page, texts stretched", url: cfg.url, setup: s.setup, stress: "stretch" },
    { name: "the frames' page, entries doubled", url: cfg.url, setup: s.setup, stress: "double" },
  ];
  for (const story of generated) {
    let r;
    try { r = await run(story.url, story.setup, null, story.stress, stressWidths); }
    catch (e) { stories.push({ name: story.name, generated: true, unmeasured: e.message.split("\n")[0], shots: [] }); continue; }
    const counts = (i) => STRESSED.includes(i.property) && !(story.stress === "stretch" && i.nowrap);
    const these = [...r.probes, r.back].map((p) => ({ ...p, issues: p.issues.filter(counts) }));
    issues.push(...sweepIssues(these, ledger).map((i) => ({ ...i, story: story.name, ...(i.status === "accepted" ? {} : { status: "candidate" }) })));
    stories.push({ name: story.name, generated: true, shots: [] });
  }
  if (s.generate !== false) {
    const own = await ownWidth(browser, cfg, ledger, frameWidths);
    issues.push(...own.issues);
    stories.push(own.story);
  }
  // The second tier: a construct (a negative margin, a nudge) and a layout switch where the model did not say are notes
  // for the owner's eye, not findings. What collides, is cut, wraps with room or leaves its line is.
  for (const i of issues) if (["construct", "switch"].includes(i.property) && i.status === "fail") i.status = "note";
  const failing = issues.filter((i) => i.status === "fail");
  // How often each line of the model was measured, over the frames' page and every story.
  const measuredLines = new Map((s.lines ?? []).map((l) => [l.name, 0]));
  const lineErrors = new Set();
  for (const p of [...probes, back, ...storyProbes.flat()]) {
    for (const n of p.lineMeasured ?? []) measuredLines.set(n, measuredLines.get(n) + 1);
    for (const e of p.lineErrors ?? []) lineErrors.add(e);
  }
  return {
    from, to, step, pass: failing.length === 0, issues, switches: changes.seen, stories,
    lines: [...measuredLines].map(([name, widths]) => ({ name, widths })), lineErrors: [...lineErrors],
    generate: s.generate !== false,
    score: issues.filter((i) => !["accepted", "note", "candidate"].includes(i.status)).length * 10,
    unmeasured: groups.filter((g) => g.everywhere), partial: groups.filter((g) => !g.everywhere),
  };
}

// The component's geometry as a person sees it: the root's place on the page, its size and scrolled width, and each
// visible child's box within it; and the text it shows.
const layoutOf = (page, selector) => page.evaluate(([sel, seen]) => {
  const visible = new Function(`return (${seen})`)();
  const root = [...document.querySelectorAll(sel)].find(visible);
  if (!root) return null;
  const r = root.getBoundingClientRect();
  const kids = [...root.children].filter(visible).map((c) => {
    const b = c.getBoundingClientRect();
    return { name: c.className && typeof c.className === "string" ? `.${c.className.trim().split(/\s+/)[0]}` : c.localName, x: b.left - r.left, y: b.top - r.top, width: b.width, height: b.height };
  });
  return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height, scrollWidth: root.scrollWidth, kids, text: root.innerText.replace(/\s+/g, " ").trim() };
}, [selector, seenIn.toString()]);
// What differs between two such geometries, beyond the tolerance; without the root's place on the page when it sits
// elsewhere by design (its container held in another window).
function layoutDiff(a, b, tolerance = 1, { place = true } = {}) {
  if (!a || !b) return [a ? "the fresh load shows no root" : "the root is not shown"];
  const out = [];
  const px = (v) => Math.round(v * 10) / 10;
  for (const k of [...(place ? ["x", "y"] : []), "width", "height", "scrollWidth"]) if (Math.abs(a[k] - b[k]) > tolerance) out.push(`the root's ${k} ${px(a[k])} px, fresh ${px(b[k])}`);
  if (a.kids.length !== b.kids.length) out.push(`${a.kids.length} children shown, fresh ${b.kids.length}`);
  else a.kids.forEach((c, i) => {
    const f = b.kids[i], moved = ["x", "y", "width", "height"].filter((k) => Math.abs(c[k] - f[k]) > tolerance);
    if (moved.length) out.push(`${c.name} ${moved.map((k) => `${k} ${px(c[k])}, fresh ${px(f[k])}`).join(", ")}`);
  });
  return out;
}

// Each journey on its own fresh page, at the widest frame's width unless it names one: its steps in order, the
// first that does not hold failing it.
async function journeys(browser, cfg) {
  const width = Math.max(...cfg.frames.map((f) => f.width));
  const results = [];
  // Each journey that opens something from an opener runs again with the opener at the window's top edge and at its
  // bottom edge, at the widest and the narrowest frame's width: an open popover must flip or shift to stay in the
  // window, wherever the component sits on the page and however narrow the window is.
  const narrowest = Math.min(...cfg.frames.map((f) => f.width));
  // The component drawn by a fresh load of a journey's page at a width, measured once, to hold a journey's end against;
  // the widths the component is drawn at (an overlay frame's is its own).
  const frameWidths = [...new Set(cfg.frames.filter((f) => !f.root).map((f) => f.width))].sort((a, b) => b - a);
  const fresh = new Map();
  const freshDiff = async (page, j, at, when) => {
    await finishMotion(page);
    const after = await layoutOf(page, cfg.root);
    const key = JSON.stringify([j.url, Boolean(j.touch), at]);
    if (!fresh.has(key)) {
      let opened;
      try {
        opened = await open(browser, cfg, { url: j.url, width: at, touch: Boolean(j.touch), still: false });
        fresh.set(key, { layout: await layoutOf(opened.page, cfg.root) });
      } catch (e) { fresh.set(key, { error: e.message.split("\n")[0] }); }
      finally { await opened?.context.close(); }
    }
    const { layout, error } = fresh.get(key);
    if (error) return `a fresh load at ${at} px to compare with: ${error}`;
    const differs = layoutDiff(after, layout, cfg.tolerance);
    return differs.length ? `${when}, the component differs from a fresh load at ${at} px: ${differs.slice(0, 4).join("; ")}${differs.length > 4 ? "; …" : ""}` : undefined;
  };
  // The component's width inside a journey. After each step, the root's container (its parent) and how far the page
  // scrolls sideways; a fresh load of the journey's page, once, for the container at the sweep's `from`, the narrowest
  // supported width; and the component in a fresh load whose container is held at a width, as the component's own
  // width holds it, in the window that leaves the page around the container as wide as the journey's start had it.
  const from = cfg.sweep ? Number(cfg.sweep.from) : null;
  const roomOf = async (page) => ({
    width: await page.evaluate(containerIn, [cfg.root, null, seenIn.toString(), null]).catch(() => null),
    ...await page.evaluate(([sel, seen]) => {
      const visible = new Function(`return (${seen})`)(), root = [...document.querySelectorAll(sel)].find(visible);
      return { beyond: document.documentElement.scrollWidth - document.documentElement.clientWidth, root: root ? Math.max(root.getBoundingClientRect().width, root.scrollWidth) : null };
    }, [cfg.root, seenIn.toString()]).catch(() => ({ beyond: 0, root: null })),
  });
  const floors = new Map(), held = new Map();
  const floorOf = async (j) => {
    const key = JSON.stringify([j.url, Boolean(j.touch)]);
    if (!floors.has(key)) {
      let opened;
      try {
        opened = await open(browser, cfg, { url: j.url, width: from, touch: Boolean(j.touch), still: false });
        floors.set(key, await container(opened.page, cfg));
      } catch { floors.set(key, null); }
      finally { await opened?.context.close(); }
    }
    return floors.get(key);
  };
  const heldOf = async (j, at, width) => {
    const key = JSON.stringify([j.url, Boolean(j.touch), at, Math.round(width * 10) / 10]);
    if (!held.has(key)) {
      let opened;
      const hold = (page) => container(page, cfg, width);
      try {
        opened = await open(browser, cfg, { url: j.url, width: at, touch: Boolean(j.touch), still: false, prepare: hold });
        await hold(opened.page);
        for (let i = 0; i < 2; i++) await settle(opened.page, cfg.root);
        held.set(key, { layout: await layoutOf(opened.page, cfg.root) });
      } catch (e) { held.set(key, { error: e.message.split("\n")[0] }); }
      finally { await opened?.context.close(); }
    }
    return held.get(key);
  };
  const edged = [];
  const openers = new Set();
  for (const j of cfg.journeys) {
    edged.push({ j });
    const first = j.steps.find((st) => ["hover", "focus", "tap", "click"].some((k) => typeof st[k] === "string"));
    const opener = first && (first.hover ?? first.focus ?? first.tap ?? first.click);
    if (!opener || !j.steps.some((st) => st.visible) || openers.has(`${opener}\u0000${Boolean(j.touch)}`)) continue;
    openers.add(`${opener}\u0000${Boolean(j.touch)}`);
    for (const at of j.width ? [j.width] : [...new Set([width, narrowest])]) for (const edge of ["top", "bottom"]) edged.push({ j, edge, opener, at });
  }
  for (const { j: base, edge, opener, at } of edged) {
    const j = edge ? { ...base, width: at, name: `${base.name} (at the window's ${edge} edge${at !== (base.width ?? width) ? `, ${at} px` : ""})` } : base;
    let opened, failed, overlaySeen = false, openerDone = false;
    // Taken before the journey's page opens, as the held loads are taken after it closes: the journey keeps its pace.
    const floor = from !== null ? await floorOf(j) : null;
    try { opened = await open(browser, cfg, { url: j.url, width: j.width ?? width, touch: Boolean(j.touch), still: false }); }
    catch (e) { if (!e.unmeasured) throw e; failed = e.message; }
    if (opened && edge) {
      // Room to scroll at both ends, then the opener against the edge, found as the journey's own steps find it. An
      // opener the page does not scroll (in a fixed or sticky bar), or that is covered there, is not tried.
      const untried = await opened.page.locator(opener).first().evaluate((el, edge) => {
        for (let p = el; p; p = p.parentElement) if (/fixed|sticky/.test(getComputedStyle(p).position)) return "it sits in a fixed or sticky bar";
        document.body.style.paddingTop = document.body.style.paddingBottom = "3000px";
        el.scrollIntoView({ block: edge === "top" ? "start" : "end" });
        const r = el.getBoundingClientRect();
        if (edge === "top" ? r.top > 8 : innerHeight - r.bottom > 8) return "the page did not scroll it to the edge";
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return hit && !el.contains(hit) && !hit.contains(el) ? "something covers it there" : "";
      }, edge, { timeout: 2000 }).catch(() => "it was not found");
      if (untried) {
        await opened.context.close();
        const ran = results.find((r) => r.name === base.name);
        if (ran) (ran.notes ??= []).push(`not tried with ${opener} at the window's ${edge} edge, ${at} px: ${untried}`);
        continue;
      }
    }
    const widths = opened ? [j.width ?? width] : [], asFresh = [], heldAt = [], toHold = [];
    const seen = new Set(), notes = [], closed = new Set(), closers = [];
    const targets = [...new Set(j.steps.filter((s) => "hidden" in s).map((s) => s.hidden))]
      .filter((t) => j.steps.some((s) => s.visible === t || s.text?.[0] === t));
    const observed = new Map();
    let trigger, visibleBefore = new Set();
    const acted = new Set(), openSeen = new Set(), actedOn = new Set();
    let closes = false;
    // The lifecycle the steps took, from what they did to the component: a root mounted or unmounted, its content
    // changed, or its container's width changed by a step that is not the window's width.
    const took = new Set(), constructs = [];
    if (opened) {
      const { page } = opened;
      // The container as the journey starts, and the page around it then. The floor holds where the container narrows
      // with the width (a host the page's flex row widens again does not).
      let room = await roomOf(page), around = room.width === null ? null : widths[0] - room.width;
      const least = room.width !== null && widths[0] > from && room.width <= floor + cfg.tolerance ? null : floor;
      // After a step: a container narrower than at the narrowest supported width, or a page that starts to scroll
      // sideways, fails it; a container whose width the step changed holds the component, as it is now, against a fresh
      // load whose container is held at that width, once the journey is over. Below the narrowest supported width
      // nothing is held to it.
      const roomAfter = async (i, step) => {
        const moved = (r) => r.width !== null && room.width !== null && Math.abs(r.width - room.width) > cfg.tolerance;
        const spills = (r) => r.beyond > cfg.tolerance && !(room.beyond > cfg.tolerance);
        let now = await roomOf(page);
        if (moved(now) || spills(now)) { await finishMotion(page); now = await roomOf(page); }
        const before = room.width, changed = moved(now), spilled = spills(now);
        room = { width: now.width ?? room.width, beyond: now.beyond };
        if (around === null && now.width !== null) around = widths.at(-1) - now.width;
        if (from !== null && widths.at(-1) < from) return;
        const px = (v) => Math.round(v);
        if (changed && least > 0 && now.width < least - cfg.tolerance) {
          throw new Error(`after it the component's container is ${px(now.width)} px wide (${px(before)} before), narrower than the ${px(least)} px it has at the narrowest supported width, ${from} px: what it opened takes the component's room; where there is no room beside, stack it above or below the component, or lay it over`);
        }
        if (spilled) {
          throw new Error(now.root !== null && now.width !== null && now.root > now.width + cfg.tolerance
            ? `after it the page scrolls sideways: the component is ${px(now.root)} px wide in its ${px(now.width)} px container: lay it out by its own width whenever that changes (a container query, or an observer on the component), not by the window's or once on mount`
            : `after it the page scrolls sideways, its content ${px(now.beyond)} px wider than the window: keep what it opened inside the window, beside or over the component`);
        }
        if (!changed) return;
        const after = await layoutOf(page, cfg.root);
        if (after) toHold.push({ i, step, after, width: now.width, before, at: Math.max(1, Math.round(now.width + around)) });
      };
      let box = edge ? null : await container(page, cfg);
      await page.evaluate(() => window.__designCheck?.mark()).catch(() => {});
      const parentMoved = async (byWindow) => {
        if (edge) return;
        const now = await container(page, cfg);
        if (!byWindow && Number.isFinite(now) && Number.isFinite(box) && Math.abs(now - box) > cfg.tolerance) took.add("parent width");
        if (Number.isFinite(now)) box = now;
      };
      try {
        for (const [i, step] of j.steps.entries()) {
          if (failed) break;
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
                if (trigger && !point && action !== "press") trigger.selector = arg;
              }
            }
            if (["hover", "click", "tap", "focus", "move"].includes(action) && typeof arg === "string") {
              const key = await page.locator(arg).first().evaluate(elementKey, null, { timeout: 2000 }).catch(() => null);
              if (key) acted.add(key);
            }
            if (!EXPECT.includes(action) && action !== "wait") for (const t of openSeen) actedOn.add(t);
            if ("width" in step) {
              await setWidth(page, cfg, step.width, 900);
              await settle(page, cfg.root);
              widths.push(step.width);
              await parentMoved(true);
              await roomAfter(i, step);
              continue;
            }
            if (EXPECT.includes(action)) await finishMotion(page);
            await runStep(page, step);
            await parentMoved(false);
            if (edge && step[action] === opener && ["hover", "focus", "tap", "click"].includes(action)) openerDone = true;
            await roomAfter(i, step);
            if (step.visible) {
              // What opens must be in view, whole: a popover cut by the window's edge, or by a box that scrolls or
              // clips it, is a failure. An overlay only (positioned out of the flow, or a popup's role, or the nearest
              // such ancestor of what the step names), the first match a person sees; the page's own content may
              // scroll. One larger than the window need only start inside it.
              const cut = await page.locator(step.visible).evaluateAll((els) => {
                const seen = (el) => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && el.getBoundingClientRect().width > 0;
                const isOverlay = (el) => /absolute|fixed/.test(getComputedStyle(el).position) || el.matches('[role=tooltip], [role=dialog], [role=menu], [role=listbox], [popover], dialog');
                let el = els.find(seen);
                while (el && !isOverlay(el)) el = el.parentElement;
                if (!el || el === document.body || el === document.documentElement) return -1;
                const r = el.getBoundingClientRect();
                let view = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
                if (getComputedStyle(el).position !== "fixed") for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
                  const cs = getComputedStyle(p);
                  if (!/hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY)) continue;
                  const c = p.getBoundingClientRect();
                  view = { left: Math.max(view.left, c.left), top: Math.max(view.top, c.top), right: Math.min(view.right, c.right), bottom: Math.min(view.bottom, c.bottom) };
                }
                const tall = r.height > view.bottom - view.top, wide = r.width > view.right - view.left;
                const y = tall ? Math.max(0, view.top - r.top) : Math.max(0, view.top - r.top, r.bottom - view.bottom);
                const x = wide ? Math.max(0, view.left - r.left) : Math.max(0, view.left - r.left, r.right - view.right);
                return Math.max(x, y);
              }, null, { timeout: 2000 }).catch(() => -1);
              if (cut > 1) throw new Error(`${step.visible} is open but ${Math.round(cut)} px of it is outside the window or a box that clips it: flip or shift it to stay in view`);
              // At an edge, the first overlay the opener opens is what is checked; the rest of the journey is not.
              if (edge && openerDone && cut >= 0) { overlaySeen = true; break; }
              openSeen.add(step.visible);
            }
            if ("hidden" in step) {
              if (actedOn.has(step.hidden)) closes = true;
              openSeen.delete(step.hidden);
              actedOn.delete(step.hidden);
            }
            const shown = step.visible ?? step.text?.[0];
            if (shown) {
              seen.add(shown);
              if (observed.has(shown)) observed.get(shown).acted = false;
              if (trigger && targets.includes(shown) && !visibleBefore.has(shown)
                && (!trigger.ids.length || await anySeen(page, shown, step.text?.[1], trigger.ids))) {
                observed.set(shown, { key: trigger.key, acted: false, opener: trigger });
              }
            }
            if ("hidden" in step) {
              const open = observed.get(arg);
              if (open?.acted) { closed.add(open.key); closers.push(open.opener); }
              else if (!seen.has(arg)) notes.push(`${arg} was never seen open before it was expected hidden`);
              else if (open) notes.push(`${arg} was not seen open before a closing action`);
              observed.delete(arg);
              seen.delete(arg);
              trigger = null;
            }
          } catch (e) { failed = `step ${i + 1}, ${JSON.stringify(step)}: ${e.message.split("\n")[0]}`; break; }
        }
        if (!edge) {
          const { mount, data } = await page.evaluate(() => window.__designCheck?.changed()).catch(() => null) ?? {};
          if (mount) took.add("mount");
          if (data) took.add("data");
        }
        // An observer the steps left on elements they removed is a construct note, not a finding: an element detached
        // and kept (a tab pane cached to be shown again) or a cleanup deferred is fine; a layout the stale observer
        // keeps shows in the fresh comparison after a sameAsFresh journey.
        if (!edge && !failed) {
          const stale = await page.evaluate(() => window.__designCheck?.stale().map((t) => `${t.localName}${t.classList[0] ? `.${t.classList[0]}` : ""}`) ?? []).catch(() => []);
          if (stale.length) constructs.push({ landmark: [...new Set(stale)].slice(0, 3).join(", "), property: "construct", kind: "stale observer", status: "note",
            actual: `after its steps, a ResizeObserver still observes ${stale.length === 1 ? "an element" : `${stale.length} elements`} removed from the page: disconnect it on unmount, or give its reason` });
        }
        // A state the steps went through and back must leave no trace: the component as a fresh load of the same page
        // draws it at the same width (an observer left on removed elements, a layout not chosen again). Then the check
        // resizes the page itself through the frames' widths, each held against a fresh load at that width: a layout
        // chosen once, or by an observer no longer on the element, shows at the next width.
        if (j.sameAsFresh && !edge && !failed) {
          let now = widths.at(-1);
          failed = await freshDiff(page, j, now, "after its steps");
          asFresh.push(now);
          for (const w of frameWidths) {
            if (failed) break;
            if (w === now) continue;
            try { await setWidth(page, cfg, w, 900); await settle(page, cfg.root); }
            catch (e) { failed = `after its steps, a resize to ${w} px: ${e.message.split("\n")[0]}`; break; }
            now = w;
            failed = await freshDiff(page, j, w, `after its steps and a resize to ${w} px`);
            asFresh.push(w);
          }
        }
      } finally { await opened.context.close(); }
      // The component as each step that changed its container's width left it, against a fresh load with the container
      // held at that width: the first that differs fails the journey at its step, before whatever failed after it. One
      // that shows other text than the fresh load (a popover open, a list filtered) is not compared.
      for (const h of toHold) {
        const px = Math.round, { layout, error } = await heldOf(j, h.at, h.width);
        if (error || !layout) { notes.push(`step ${h.i + 1}: no fresh load with the container held at ${px(h.width)} px to compare with: ${error ?? "it shows no root"}`); continue; }
        if (h.after.text !== layout.text) { notes.push(`step ${h.i + 1}: not held against a fresh load with the container at ${px(h.width)} px: the component shows other text than a fresh load`); continue; }
        heldAt.push(px(h.width));
        const differs = layoutDiff(h.after, layout, cfg.tolerance, { place: false });
        if (!differs.length) continue;
        failed = `step ${h.i + 1}, ${JSON.stringify(h.step)}: after it the component's container is ${px(h.width)} px wide (${px(h.before)} before), and the component differs from a fresh load with its container held at ${px(h.width)} px: ${differs.slice(0, 4).join("; ")}${differs.length > 4 ? "; …" : ""}: lay it out by its own width whenever that changes (a container query, or an observer on the component), not by the window's or once on mount`;
        break;
      }
    }
    if (edge && opened && !failed && !overlaySeen) notes.push(`no overlay was seen open after ${opener}: nothing was checked at the window's edge`);
    results.push({ name: j.name, widths, ...(asFresh.length ? { asFresh } : {}), ...(heldAt.length ? { held: heldAt } : {}), pass: !failed, ...(failed ? { failed } : {}), ...(notes.length ? { notes } : {}), closed: [...closed],
      acted: [...acted], closes, closers, ...(edge ? {} : { lifecycle: [...took] }), ...(constructs.length ? { issues: constructs } : {}) });
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
    const cells = table.filter((l) => !/^\s*\|?[\s|:-]*\|?\s*$/.test(l)).map((l) => l.trim().replace(/^\||(?<!\\)\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|")));
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

// The answers to the generated conditions' candidates: list items under a heading that names candidates, each naming a
// candidate as the check prints it, then after a colon the contract's bound that rules it out or the story that
// reproduces it.
function candidateAnswers(cfg) {
  const file = path.join(cfg.dir, "review.md");
  if (!fs.existsSync(file)) return [];
  const out = [];
  let level = 0;
  for (const line of fs.readFileSync(file, "utf8").replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm, "").split("\n")) {
    const h = line.match(/^(#+)\s+(.*)$/);
    if (h) {
      if (level && h[1].length <= level) level = 0;
      if (!level && /candidate|кандидат/i.test(h[2])) level = h[1].length;
      continue;
    }
    const item = level && line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*\S)/);
    if (item) out.push(item[1]);
  }
  return out;
}
// An answer names its candidate as the check prints it, at the head of its line: the landmark, or the property and the
// landmark, then the condition in parentheses if it likes, then a colon and the bound. A landmark inside another line
// or inside a reason ("1" in "at most 18 characters", a frame "narrow" in "holds in a narrow column") answers nothing.
// The component's own width names a frame, so its key is the property and the quoted name: window “card-375”.
const plain = (t) => String(t).toLowerCase().replace(/[*_`]/g, "").replace(/["«»“”„]/g, '"').replace(/\s+/g, " ").trim();
const literal = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function answerCandidates(cfg, sweepResult) {
  const answers = candidateAnswers(cfg).map((a) => ({ text: plain(a), raw: a }));
  for (const i of sweepResult?.issues ?? []) {
    if (i.status !== "candidate") continue;
    const name = literal(plain(i.landmark).replace(/^"(.*)"$/, "$1")), property = literal(plain(i.property));
    const key = i.story === OWN_WIDTH ? `${property} "${name}"` : `(?:${property} )?(?:${name}|"${name}")`;
    const head = new RegExp(`^${key}(?: ?\\([^)]*\\))? ?:\\s*\\S`);
    const hit = answers.map((a) => ({ a, m: a.text.match(head) })).find((x) => x.m);
    // The bound is what follows the head's colon: the raw line split at as many colons as the head holds.
    if (hit) i.answer = hit.a.raw.split(":").slice(hit.m[0].split(":").length - 1).join(":").trim();
  }
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
    // A row that names stories in inline code answers for those; one that names none, for all of them. Inline code
    // that names no configured story is a misspelling or a story never swept.
    // The configured stories: the generated conditions are the check's own, not stories a row can claim.
    const configured = (sweep?.stories ?? []).filter((s) => !s.generated), all = configured.map((s) => s.name ?? s);
    const codes = [...`${row.item} ${row.result}`.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    const names = all.filter((n) => codes.includes(n));
    const mine = (story) => !names.length || names.includes(story);
    const issues = measured ? (sweep?.issues ?? []).filter((i) => Boolean(i.story) === (row.method === "sweep.stories") && (!i.story || mine(i.story))) : [];
    const failed = issues.find((i) => i.status === "fail");
    if (failed) return { ...row, status: "fail", reason: `the sweep fails: ${failed.property} “${failed.landmark}”${failed.story ? ` (${failed.story})` : ""}${failed.ranges ? ` at ${failed.ranges}` : ""}` };
    if (!detail) reason = "pass has no evidence";
    else if (row.method === "sweep.stories" && codes.length && !names.length) reason = `it names no configured story (${codes.map((c) => `\`${c}\``).join(", ")}); the stories are ${all.map((n) => `\`${n}\``).join(", ") || "none"}`;
    else if (row.method === "sweep" && (!sweep || sweep.reason || sweep.unmeasured?.some((u) => !u.story))) reason = "the width sweep was not fully measured";
    else if (row.method === "sweep.stories" && (!configured.length || configured.some((s) => s.unmeasured && mine(s.name ?? s)) || sweep.unmeasured?.some((u) => u.story && mine(u.story)))) reason = "additional stories were not all measured";
    else if (issues.some((i) => i.status === "pending")) return { ...row, status: "pending", reason: "the measurement awaits a decision" };
    else return { ...row, status: "pass" };
  } else reason = na ? "N/A has no reason" : mark || !row.result ? "not checked" : "no recognized result";
  return { ...row, status: "incomplete", reason };
}

// The layout model's rows in review.md: under a heading that names it, a table's rows below its header, or list items.
function layoutModelRows(cfg) {
  const file = path.join(cfg.dir, "review.md");
  if (!fs.existsSync(file)) return 0;
  let level = 0, rows = 0, inTable = false;
  for (const line of fs.readFileSync(file, "utf8").replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm, "").split("\n")) {
    const h = line.match(/^(#+)\s+(.*)$/);
    const cells = /^\s*\|.*\|\s*$/.test(line);
    if (h) {
      if (level && h[1].length <= level) level = 0;
      if (!level && /layout model|модель раскладки|модель в[её]рстки/i.test(h[2])) level = h[1].length;
    } else if (level && cells) {
      // The first row of a table is its header, the second its separator.
      if (inTable && !/^\s*\|[\s|:-]*\|\s*$/.test(line)) rows++;
    } else if (level && /^\s*(?:[-*+]|\d+[.)])\s+\S/.test(line)) rows++;
    inTable = cells;
  }
  return rows;
}

function acceptanceGaps(cfg, rows, sweepResult, results, journeyResults) {
  const gaps = [];
  for (const r of rows) if (r.status === "incomplete") gaps.push(`acceptance “${r.item}”: ${r.reason}`);
  const openers = new Map(results.flatMap((r) => (r.openers ?? []).map((o) => [o.key, o])));
  const closed = new Set(journeyResults.filter((j) => j.pass).flatMap((j) => j.closed));
  // An opener whose target is not on its page (a story page without the consumer's sheet) is covered by a passing
  // journey on another page that opened and closed one by the same selector, with the same role, name and target.
  // A same-named opener of another role or target is not. The covering journey's line in the handoff names it.
  const closers = journeyResults.filter((j) => j.pass).flatMap((j) => (j.closers ?? []).map((c) => ({ c, j })));
  const sameIds = (a, b) => a.length === b.length && a.every((id) => b.includes(id));
  const shown = (u) => (u.startsWith("file:") ? path.relative(cfg.dir, fileURLToPath(u)) : u);
  const unchecked = [];
  for (const o of openers.values()) {
    if (closed.has(o.key)) continue;
    const by = o.away && closers.find(({ c }) => c.page !== o.page && c.name === o.name && c.role === o.role && sameIds(c.ids, o.ids) && o.answers?.includes(c.selector));
    if (!by) { unchecked.push(o.name); continue; }
    const note = `covers “${o.name}” on ${shown(o.page)}, whose target ${o.ids.map((id) => `#${id}`).join(", ")} is not on that page`;
    if (!by.j.notes?.includes(note)) (by.j.notes ??= []).push(note);
  }
  if (unchecked.length) gaps.push(`${unchecked.length} control${unchecked.length === 1 ? "" : "s"} open${unchecked.length === 1 ? "s" : ""} something with no journey that opens and closes ${unchecked.length === 1 ? "it" : "them"}: ${unchecked.slice(0, 4).map((o) => `“${o}”`).join(", ")}${unchecked.length > 4 ? ", …" : ""}`);
  const dir = path.join(cfg.dir, "frames");
  const framed = new Set(cfg.frames.map((f) => f.reference && path.resolve(f.reference)));
  if (fs.existsSync(dir)) {
    const unframed = fs.readdirSync(dir).map((d) => path.join(dir, d, "reference.png")).filter((p) => fs.existsSync(p) && !framed.has(p));
    if (unframed.length) gaps.push(`references no frame checks: ${unframed.map((p) => path.relative(cfg.dir, p)).join(", ")}`);
  }
  for (const st of sweepResult?.stories ?? []) if (st.unmeasured) gaps.push(`the story ${st.name} was not swept: ${st.unmeasured}`);
  // Lines the builder declares are measured somewhere, or say why not.
  for (const e of sweepResult?.lineErrors ?? []) gaps.push(`the line ${e}: use a CSS selector`);
  for (const l of sweepResult?.lines ?? []) if (!l.widths && !(sweepResult.lineErrors ?? []).some((e) => e.startsWith(`${l.name}:`))) gaps.push(`the line “${l.name}” never showed two of its pieces: its selectors, range or “when” match nothing in the flow`);
  // "static" is for a page with one layout: frames at several widths are a responsive component to sweep.
  const widths = new Set(cfg.frames.map((f) => f.width));
  if (cfg.static && widths.size > 1) gaps.push(`"static" is for a page at one width; these frames have ${widths.size} widths: sweep them with a dense story and the model's lines`);
  // UI built from frames is swept with a dense story of its own, unless design.json says why it is static.
  if (!cfg.static) {
    if (!cfg.sweep) gaps.push('no sweep: the widths between the frames and a dense story were not checked (or give "static" with the reason in design.json)');
    else if (!cfg.sweep.stories?.length) gaps.push("no dense story is swept: add one to sweep.stories");
    const pages = new Set([cfg.url, ...cfg.frames.map((f) => f.url)]);
    // A story on a frame's page brings data of its own by its setup; without one it is the frame again.
    for (const st of cfg.sweep?.stories ?? []) if (pages.has(st.url) && !st.setup?.some((x) => !("wait" in x))) gaps.push(`the story ${st.name} is a frame's own page: a dense story's setup brings data of its own`);
  }
  // A lifecycle the product can cause (a remount, data emptied and refilled, a parent-width change) is taken through the
  // consumer, in a journey that ends as a fresh load draws the component: on the page `url` names (whatever its query),
  // or on a page of the journey's own that no frame or story shows. When `url` is a story page (the frames are drawn
  // there by a host the check sizes, or by a frame's own url), only the latter is the consumer's. The journey must take
  // a lifecycle: a step that changed the component's data, mounted or unmounted it, or changed its parent's width; a
  // width step alone is the window's. Unless design.json gives the reason the product has none.
  const page = (u) => String(u).replace(/[?#].*$/, ""), storyPages = new Set([...cfg.frames.map((f) => f.url), ...(cfg.sweep?.stories ?? []).map((st) => st.url)].map(page));
  const storyUrl = (cfg.host ? cfg.frames.map((f) => f.url) : cfg.framedUrls ?? []).map(page).includes(page(cfg.url));
  const consumer = (j) => (!storyUrl && page(j.url) === page(cfg.url)) || !storyPages.has(page(j.url));
  const onConsumer = cfg.journeys.filter((j) => j.sameAsFresh === true && consumer(j));
  const took = (j) => journeyResults.find((r) => r.name === j.name)?.lifecycle?.length;
  const where = storyUrl ? "on a consumer page of its own `url` that no frame or story shows (the page `url` names draws the frames, a story page)" : "on the page `url` names or a consumer page of its own `url`";
  const exit = 'or give "lifecycle" in design.json with the reason the product can cause none';
  if (typeof cfg.lifecycle !== "string" && !onConsumer.length) {
    gaps.push(`no journey with "sameAsFresh": true runs on the consumer's page: take each lifecycle the product can cause (mount and unmount, data emptied and refilled, the parent's width changed) in one, ${where}, ${exit}`);
  } else if (typeof cfg.lifecycle !== "string" && !onConsumer.some(took)) {
    gaps.push(`the journeys with "sameAsFresh": true on the consumer's page took no lifecycle (${onConsumer.slice(0, 3).map((j) => `“${j.name}”`).join(", ")}): none of their steps changed the component's data, mounted or unmounted it, or changed its parent's width, and a width step is the window's: empty and refill its data, remount it or resize its parent in one, ${exit}`);
  }
  // A frame of an overlay (it names its own root: a popover, menu or sheet) wants a passing journey that acts on the
  // same element its setup opens, sees something visible and then expects the same thing hidden, whatever the markup.
  const closing = journeyResults.filter((j) => j.pass && j.closes).flatMap((j) => j.acted ?? []);
  for (const r of results) {
    for (const t of r.setupTargets ?? []) {
      if (!closing.includes(t.key)) gaps.push(`the overlay frame ${r.frame} opens “${t.selector}”, and no journey acts on it, sees it open and expects it closed`);
    }
  }
  // A candidate of the generated conditions stays open until review.md answers it.
  const open = (sweepResult?.issues ?? []).filter((i) => i.status === "candidate" && !i.answer);
  if (open.length) gaps.push(`${open.length} candidate${open.length === 1 ? "" : "s"} from the generated conditions, unanswered: ${open.slice(0, 4).map((i) => `${i.property} “${i.landmark}” (${i.story})`).join(", ")}${open.length > 4 ? ", …" : ""}: reproduce each with legal data (a story with a real long value, a supported locale, a container narrower than the window), or name in review.md, under Candidates, the contract's bound that rules it out`);
  // Each past return the owner recorded is a line of the acceptance list.
  if (fs.existsSync(cfg.returnsFile)) {
    const norm = (t) => t.toLowerCase().replace(/\\\|/g, "|").replace(/[*_`"'«»“”„]/g, "").replace(/\s+/g, " ").trim().replace(/[.!?;:,]+$/, "");
    const items = fs.readFileSync(cfg.returnsFile, "utf8").split("\n").map((l) => l.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*\S)/)?.[1]).filter(Boolean);
    const listed = rows.map((r) => norm(r.item));
    const missing = items.filter((t) => !listed.some((l) => l.includes(norm(t))));
    if (missing.length) gaps.push(`past returns not in the acceptance list: ${missing.slice(0, 4).map((t) => `“${t}”`).join(", ")}${missing.length > 4 ? ", …" : ""}`);
  }
  return gaps;
}

async function check(file, flags) {
  const started = Date.now();
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
  // --quick: every frame and story, swept at the frames' widths only, without journeys: for tuning, not for handover.
  if (flags.quick) cfg.quick = true;
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
    const journeyResults = full && !flags.quick ? await journeys(browser, cfg) : [];
    answerCandidates(cfg, sweepResult);
    // A journey the builder shows the check itself breaks, proposed with "cause": "checker", waits for the owner.
    for (const j of journeyResults) {
      if (j.pass) continue;
      const e = [j.name, j.name.replace(/ \(at the window's .*\)$/, "")].map((name) => ledgerEntryFor({ landmark: name, property: "journey" }, "journeys", ledger)).find(Boolean);
      if (e) Object.assign(j, { status: e.status === "accepted" ? "accepted" : "pending", ledger: e.reason, entries: [ledger.indexOf(e)] });
    }
    // A complete check (every frame, the sweep) is the evidence for a handoff; --frame, --no-sweep and --quick are partial.
    const complete = full && !flags["no-sweep"] && !flags.quick;
    const rows = acceptanceRows(cfg);
    const acceptance = complete ? rows.map((row) => assessRow(row, sweepResult)) : [];
    const gaps = complete ? acceptanceGaps(cfg, acceptance, sweepResult, results, journeyResults) : [];
    const issues = [...results.flatMap((r) => r.issues), ...(sweepResult?.issues ?? [])];
    const pending = issues.some((issue) => issue.status === "pending") || acceptance.some((row) => row.status === "pending") || journeyResults.some((j) => j.status === "pending");
    const missingReferences = frames.filter((frame) => !frame.reference || !fs.existsSync(frame.reference)).map((frame) => frame.name);
    const unmeasured = sweepResult?.unmeasured?.some((u) => !u.story);
    const imageOnlyFrames = results.filter((r) => r.imageOnly).map((r) => r.frame);
    const passed = results.every((r) => r.pass) && (sweepResult?.pass ?? true) && ledgerProblems.length === 0;
    const failed = issues.some((issue) => issue.status === "fail") || ledgerProblems.length > 0 || journeyResults.some((j) => !j.pass && !j.status) || acceptance.some((row) => row.status === "fail");
    const status = failed ? "fail"
      : results.some((r) => r.verdict === "incomplete") || unmeasured || sweepResult?.verdict === "incomplete" || gaps.length ? "incomplete"
        : pending ? "pending" : passed ? "pass" : "fail";
    const pass = status === "pass";
    const score = totalScore(results, sweepResult, journeyResults);
    fs.mkdirSync(out, { recursive: true });
    const historyFile = path.join(out, "history.jsonl");
    const history = fs.existsSync(historyFile) ? fs.readFileSync(historyFile, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
    const n = history.length + 1;
    // What the score was measured against: the frames' specs, the sweep and the journeys, quick or complete. A round
    // that changed them starts a new series, since its score says nothing about the page against the earlier ones.
    const digest = (file) => (file && fs.existsSync(file) ? createHash("sha256").update(fs.readFileSync(file)).digest("hex") : null);
    const basis = createHash("sha256").update(JSON.stringify([cfg.tolerance, cfg.url, cfg.root, cfg.host ?? null, cfg.viewport ?? null,
      frames.map((f) => [f, fs.readFileSync(f.spec, "utf8"), digest(f.reference)]), sweepResult ? cfg.sweep : null, full && !flags.quick ? cfg.journeys : null, Boolean(flags.quick)])).digest("hex").slice(0, 12);
    // Each round also records what it cost (quick or complete, its duration and what it printed) and what it found, so
    // that the next round says what changed and sees a first finding that does not move.
    const keys = findingKeys({ frames: results, sweep: sweepResult, journeys: journeyResults, acceptance });
    const record = { round: n, time: new Date().toISOString(), frames: frames.map((f) => f.name), sweep: Boolean(sweepResult), basis, review: rows.length > 0, model: layoutModelRows(cfg), status, score, quick: Boolean(flags.quick),
      findings: [...keys.keys()], first: [...keys.keys()][0] ?? null };
    // Progress is read against rounds measured the same way: the one before, the lowest, and how many rounds since it.
    const comparable = history.filter((h) => h.score != null && h.basis === basis);
    const series = score === null ? comparable : [...comparable, record];
    const previous = comparable.at(-1);
    const best = series.reduce((a, h) => (!a || h.score < a.score ? h : a), null);
    const stalled = score === null ? 0 : series.length - 1 - series.indexOf(best);
    const restarted = history.length > 0 && !comparable.length;
    const data = { quick: Boolean(flags.quick), frames: results, sweep: sweepResult, journeys: journeyResults, acceptance, gaps, ledgerProblems, round: n, previous, best, stalled, restarted, status, missingReferences, imageOnlyFrames };
    fs.writeFileSync(path.join(out, "report.md"), `${renderReport(data)}\n`);
    if (complete) {
      const git = (...args) => spawnSync("git", args, { cwd: cfg.dir, encoding: "utf8" });
      const commit = git("rev-parse", "--short", "HEAD"), dirty = git("status", "--porcelain").stdout?.trim();
      const stamp = `${record.time}${commit.status === 0 ? ` · commit ${commit.stdout.trim()}${dirty ? " with uncommitted changes" : ""}` : ""}`;
      const pictures = [...results.map((r) => r.images?.page && path.join(path.dirname(r.images.page), "side.png")).filter((p) => p && fs.existsSync(path.join(out, p))), "gallery.html"];
      const modelRound = [...history, record].find((h) => h.model >= 1)?.round;
      const model = { rows: record.model, firstRound: modelRound, predicted: cfg.sweep?.switches ?? [], measured: sweepResult?.switches ?? [] };
      fs.writeFileSync(handoff, `${renderHandoff({ ...data, ledger, score, journeySpecs: cfg.journeys, lifecycle: cfg.lifecycle, stamp, pictures, model })}\n`);
    }
    writeJson(path.join(out, "result.json"), { pass, score, round: n, ...data, frames: results.map(({ gallery, ...r }) => r) });
    // The gallery is the record to hand over: written only by a complete check.
    if (complete) fs.writeFileSync(path.join(out, "gallery.html"), renderGallery({ title: `Design check · ${path.basename(cfg.dir)}`, frames: results.map((r) => ({ result: r, ...r.gallery })), sweep: sweepResult, journeys: journeyResults, gaps, ledger }));
    const where = path.relative(process.cwd(), out) || ".";
    // The same first finding over three rounds, quick or complete and whatever changed in the specs, or two complete
    // rounds without a new lowest score: the verdict itself says to decide rather than re-run.
    const notice = rerunNotice({ complete, status, stalled, streak: firstStreak(history, record.first) });
    // The console is a digest of fifteen lines at most, the verdict's included.
    const tail = 2 + (status === "fail" && !notice ? 1 : 0);
    const printed = [renderSummary(data, { file: `${where}/report.md`, limit: 15 - tail }),
      `Verdict: ${status}${notice}${complete ? "" : " on what this partial check measured"}${missingReferences.length ? `; missing reference images: ${missingReferences.join(", ")}` : ""}`,
      ...(status === "fail" && !notice ? ["A fail is not a state to hand over in: fix the first cause and check again."] : []),
      complete ? `Gallery (design, before, after): ${where}/gallery.html · evidence for the handoff: ${where}/handoff.md`
        : `A partial check (${flags.frame ? "--frame" : flags.quick ? "--quick" : "--no-sweep"}): it is not the evidence for a handoff.`].join("\n");
    fs.appendFileSync(historyFile, `${JSON.stringify({ ...record, seconds: Math.round((Date.now() - started) / 100) / 10, bytes: Buffer.byteLength(`${printed}\n`) })}\n`);
    console.log(printed);
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

// A draft spec from an image alone: every piece of ink, and every filled shape or outline, as a numbered box, for
// the implementer to name once with the text it reads or a page selector. boxes.png beside it shows the numbers.
async function boxes(file, flags) {
  const png = fs.readFileSync(file);
  const size = pngSize(png), width = Number(flags.width);
  if (!size || !(width > 0)) throw Object.assign(new Error("boxes: give the PNG and the frame's CSS width, --width <px>"), { exit: 2 });
  const scale = Number(flags.scale ?? Math.max(1, Math.round(size.width / width)));
  const out = path.resolve(flags.out ?? path.join(path.dirname(file), "spec.json"));
  if (fs.existsSync(out) && !flags.force) throw Object.assign(new Error(`${out} exists; pass --force to replace it`), { exit: 2 });
  const browser = await (await chromium()).launch();
  try {
    const page = await (await browser.newContext()).newPage();
    // Fine pieces: letters join into words, and the implementer joins words and icons into what they name.
    const ink = inkRuns(await luminance(page, png), { scale, join: 0.45 });
    const r2 = (b) => Object.fromEntries(Object.entries(b).filter(([k]) => ["x", "y", "width", "height"].includes(k)).map(([k, v]) => [k, Math.round(v * 100) / 100]));
    const items = [...ink.runs.map((b) => ({ box: r2(b), kind: b.kind === "colour" ? "coloured ink" : "ink" })), ...ink.boxes.map((b) => ({ box: r2(b), kind: b.kind }))]
      .sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x);
    const pieces = items.map((it, i) => ({ n: i + 1, kind: it.kind, box: it.box }));
    writeJson(out, { frame: { name: path.basename(path.dirname(out)), width, height: Math.round(size.height / scale) }, source: "image boxes",
      landmarks: [], skip: {}, pieces });
    const picture = await page.evaluate(async ([src, list, scale]) => {
      const i = new Image();
      await new Promise((resolve, reject) => { i.onload = resolve; i.onerror = () => reject(new Error("image does not load")); i.src = src; });
      const z = Math.max(2, scale), c = document.createElement("canvas");
      c.width = i.width / scale * z; c.height = i.height / scale * z;
      const x = c.getContext("2d");
      x.imageSmoothingEnabled = false;
      x.drawImage(i, 0, 0, c.width, c.height);
      x.font = `bold ${5 * z}px sans-serif`; x.textBaseline = "top";
      for (const l of list) {
        const hue = (l.n * 67) % 360;
        x.strokeStyle = `hsl(${hue} 90% 40%)`; x.lineWidth = 1;
        x.strokeRect(l.box.x * z - 0.5, l.box.y * z - 0.5, l.box.width * z + 1, l.box.height * z + 1);
        const tag = String(l.n), w = x.measureText(tag).width + 4;
        x.fillStyle = `hsl(${hue} 90% 40%)`; x.fillRect(l.box.x * z, l.box.y * z - 5 * z - 2, w, 5 * z + 2);
        x.fillStyle = "#fff"; x.fillText(tag, l.box.x * z + 2, l.box.y * z - 5 * z - 1);
      }
      return c.toDataURL();
    }, [`data:image/png;base64,${png.toString("base64")}`, pieces, scale]);
    const shown = path.join(path.dirname(out), "boxes.png");
    writeDataUrl(shown, picture);
    console.log(`${pieces.length} pieces → ${path.relative(process.cwd(), out)}, numbered in ${path.relative(process.cwd(), shown)}.`);
    console.log('Fill "landmarks" with what the design shows, each from its pieces: { "text": "5587 × 4", "pieces": [11, 12, 13] } as it');
    console.log('reads, or { "selector": ".help", "pieces": [27] } for an icon, a shape or a photo. An icon and its label are two. A');
    console.log('piece that is not part of the component goes in "skip" with why: { "31": "the page\'s shadow" }. The check compares');
    console.log("each by place and its text exactly; a piece in no landmark and not skipped keeps the frame incomplete.");
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
  const { command, file, flags, help, fault } = parseArgs(argv);
  if (help) { console.log(USAGE); return fault ? 2 : 0; }
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
  return boxes(file, flags);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.exit(code), (e) => { console.error(`design: ${e.message}`); process.exit(e.exit ?? 2); });
}

export { inPage, main };
