// The half of the design check that needs no browser: a Figma metadata outline turned into a spec, a measured page
// held against that spec, the ledger of deliberate deviations, and the report. design.mjs measures; this file judges.

export const PROPERTIES = ["x", "y", "width", "height", "font", "presence", "text", "pixels", "overflow", "clipped", "overlap",
  "outside", "align", "resize"];
export const CATEGORIES = ["design-error", "missing-state", "platform", "system", "owner", "ux"];
export const STATUSES = ["accepted", "proposed", "rejected"];

const round = (n) => Math.round(n * 100) / 100;
const num = (v) => (v === undefined || v === "" ? NaN : Number(v));
export const norm = (s) => String(s).replace(/\s+/g, " ").trim();

// ------------------------------------------------------------------ XML

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === "#"
  ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
  : ENTITIES[e] ?? m);

// Enough XML for an outline of elements and attributes: text content, comments and declarations are skipped.
export function parseXml(text) {
  const root = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];
  const token = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\/\s*([\w:.-]+)\s*>|<([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
  for (const m of text.matchAll(token)) {
    if (m[1]) {
      const open = stack.pop();
      if (!open || open.tag !== m[1]) throw new Error(`XML: </${m[1]}> closes <${open?.tag ?? "nothing"}>`);
    } else if (m[2]) {
      const attrs = {};
      for (const a of (m[3] ?? "").matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[a[1]] = decode(a[2] ?? a[3]);
      const node = { tag: m[2], attrs, children: [] };
      stack.at(-1).children.push(node);
      if (!m[4]) stack.push(node);
    }
  }
  if (stack.length !== 1) throw new Error(`XML: <${stack.at(-1).tag}> is never closed`);
  return root;
}

// ------------------------------------------------------------------ Figma metadata → spec

// A group or boolean operation has no coordinate space of its own: its children are placed in its parent's.
const NO_SPACE = /^(group|boolean[-_ ]?operation)$/i;
const hasBox = (n) => ["x", "y", "width", "height"].every((k) => Number.isFinite(num(n.attrs[k])));
const hidden = (n) => n.attrs.hidden === "true" || n.attrs.visible === "false";

function findFrame(tree, selector) {
  const all = [];
  const walk = (n) => { for (const c of n.children) { all.push(c); walk(c); } };
  walk(tree);
  if (selector) {
    const hit = all.find((n) => n.attrs.id === selector || n.attrs.name === selector);
    if (!hit) throw new Error(`no node with id or name "${selector}"`);
    return hit;
  }
  const first = all.find(hasBox);
  if (!first) throw new Error("the outline has no node with x, y, width and height");
  return first;
}

// Boxes of every visible descendant relative to the frame's top-left corner, reading x/y either as offsets from the
// parent's coordinate space ("relative") or as canvas positions ("absolute").
function place(frame, mode) {
  const out = [];
  const fx = num(frame.attrs.x) || 0, fy = num(frame.attrs.y) || 0;
  const walk = (node, ox, oy, parentBox) => {
    for (const c of node.children) {
      if (hidden(c)) continue;
      if (!hasBox(c)) { walk(c, ox, oy, parentBox); continue; }
      const x = mode === "relative" ? ox + num(c.attrs.x) : num(c.attrs.x) - fx;
      const y = mode === "relative" ? oy + num(c.attrs.y) : num(c.attrs.y) - fy;
      const box = { x: round(x), y: round(y), width: round(num(c.attrs.width)), height: round(num(c.attrs.height)) };
      out.push({ node: c, box, parentBox });
      const space = NO_SPACE.test(c.tag) ? [ox, oy] : [x, y];
      walk(c, space[0], space[1], box);
    }
  };
  walk(frame, 0, 0, { x: 0, y: 0, width: num(frame.attrs.width), height: num(frame.attrs.height) });
  return out;
}

const inside = (b, p) => b.x >= p.x - 1 && b.y >= p.y - 1 && b.x + b.width <= p.x + p.width + 1 && b.y + b.height <= p.y + p.height + 1;

// Which reading puts more nodes inside their parents. A tie reads x/y as relative, as Figma's own node properties are.
export function detectCoords(frame) {
  const score = (mode) => place(frame, mode).filter((p) => inside(p.box, p.parentBox)).length;
  return score("absolute") > score("relative") ? "absolute" : "relative";
}

export function specFromMetadata(xml, { frame: selector, coords = "auto", boxes = false } = {}) {
  const frame = findFrame(parseXml(xml), selector);
  const mode = coords === "auto" ? detectCoords(frame) : coords;
  if (!["relative", "absolute"].includes(mode)) throw new Error(`coords must be auto, relative or absolute, not ${coords}`);
  const landmarks = place(frame, mode)
    .filter(({ node }) => /^text$/i.test(node.tag) || (boxes && /^instance$/i.test(node.tag)))
    .map(({ node, box }) => /^text$/i.test(node.tag)
      ? { text: norm(node.attrs.characters ?? node.attrs.name ?? ""), box, id: node.attrs.id }
      : { name: node.attrs.name, box, id: node.attrs.id })
    .filter((l) => l.text !== "");
  return {
    frame: { id: frame.attrs.id, name: frame.attrs.name, width: num(frame.attrs.width), height: num(frame.attrs.height) },
    source: `figma-metadata (${mode})`,
    landmarks: numberDuplicates(landmarks.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)),
  };
}

// The nth occurrence, in reading order, of a text that appears more than once.
export function numberDuplicates(landmarks) {
  const seen = new Map();
  return landmarks.map((l) => {
    if (!l.text) return l;
    const n = seen.get(l.text) ?? 0;
    seen.set(l.text, n + 1);
    return n ? { ...l, nth: n } : l;
  });
}

export const landmarkLabel = (l) => l.text ?? l.selector ?? l.name ?? "?";

// ------------------------------------------------------------------ ledger

export function ledgerFaults(entries) {
  if (!Array.isArray(entries)) return ["the ledger is not a JSON array"];
  return entries.flatMap((e, i) => {
    const at = `entry ${i + 1}${e?.id ? ` (${e.id})` : ""}`;
    const faults = [];
    if (!e || typeof e !== "object") return [`${at}: not an object`];
    if (!e.landmark) faults.push(`${at}: no landmark (a design text, a selector, "root" or "*")`);
    if (!PROPERTIES.includes(e.property) && e.property !== "*") faults.push(`${at}: property must be one of ${PROPERTIES.join(", ")} or *`);
    if (!CATEGORIES.includes(e.category)) faults.push(`${at}: category must be one of ${CATEGORIES.join(", ")}`);
    if (!STATUSES.includes(e.status)) faults.push(`${at}: status must be one of ${STATUSES.join(", ")}`);
    if (!e.reason || !String(e.reason).trim()) faults.push(`${at}: no reason`);
    if (e.property === "text" && !e.actual) faults.push(`${at}: a text deviation names the page's text in "actual"`);
    return faults;
  });
}

const frameMatches = (entry, frame) => entry.frame === undefined || entry.frame === "*" || entry.frame === frame
  || (Array.isArray(entry.frame) && entry.frame.includes(frame));

export function ledgerEntryFor(issue, frame, ledger = []) {
  return ledger.find((e) => frameMatches(e, frame)
    && (e.landmark === "*" || e.landmark === issue.landmark)
    && (e.property === "*" || e.property === issue.property)
    && (e.max === undefined || issue.delta === undefined || Math.abs(issue.delta) <= e.max));
}

// The text to look for on the page: the design's own, unless the ledger records that the page says something else.
export function pageText(landmark, frame, ledger = []) {
  const e = ledger.find((x) => x.property === "text" && x.landmark === landmark.text && frameMatches(x, frame) && x.status !== "rejected");
  return e ? e.actual : landmark.text;
}

function classify(issue, frame, ledger) {
  const entry = ledgerEntryFor(issue, frame, ledger);
  const status = !entry || entry.status === "rejected" ? "fail" : entry.status === "accepted" ? "accepted" : "pending";
  return { ...issue, status, ...(entry ? { ledger: entry.id ?? entry.reason } : {}) };
}

// ------------------------------------------------------------------ one frame

// Which edge of a text to compare horizontally: the one its alignment holds still when the text changes width.
function horizontal(spec, page, align) {
  if (align === "right") return [spec.x + spec.width, page.x + page.width];
  if (align === "center") return [spec.x + spec.width / 2, page.x + page.width / 2];
  return [spec.x, page.x];
}

const FONT = { size: 0.5, lineHeight: 0.5, weight: 0 };

export function compareFrame({ frame, spec, measured, tolerance = 1, ledger = [] }) {
  const over = (a, b) => Math.abs(a - b) > tolerance;
  const placed = [];
  spec.landmarks.forEach((l, index) => {
    const m = measured.landmarks[index];
    if (!m?.found) return;
    const align = l.text ? m.align : "left";
    const [ex, ax] = horizontal(l.box, m.box, align);
    placed.push({ index, label: landmarkLabel(l), l, m, align, ex, ax, dx: ax - ex, dy: m.box.y - l.box.y, dh: m.box.height - l.box.height });
  });
  const steps = causes(placed, spec, measured, tolerance);
  const issues = [];
  const add = (landmark, property, expected, actual, extra = {}) => issues.push({
    landmark, property, expected, actual,
    ...(typeof expected === "number" && typeof actual === "number" ? { delta: round(actual - expected) } : {}), ...extra,
  });
  spec.landmarks.forEach((l, index) => {
    const label = landmarkLabel(l), p = placed.find((q) => q.index === index);
    if (l.text) {
      const text = pageText(l, frame, ledger);
      if (text !== l.text) add(label, "text", l.text, text);
    }
    if (!p) return add(label, "presence", "present", "missing");
    const { m } = p;
    if (over(p.ax, p.ex)) add(label, "x", round(p.ex), round(p.ax), { inherited: !steps.some((c) => c.index === index && c.axis === "x") });
    if (over(m.box.y, l.box.y)) add(label, "y", l.box.y, round(m.box.y), { inherited: !steps.some((c) => c.index === index && c.axis === "y") });
    if (over(m.box.height, l.box.height)) add(label, "height", l.box.height, round(m.box.height));
    if ((l.checkWidth ?? spec.widths) && l.text && Math.abs(m.box.width - l.box.width) > Math.max(tolerance, l.box.width * 0.02)) {
      add(label, "width", l.box.width, round(m.box.width));
    }
    for (const [key, limit] of Object.entries(FONT)) {
      const want = Number(l.font?.[key]), got = Number(m.font?.[key]);
      if (Number.isFinite(want) && Number.isFinite(got) && Math.abs(got - want) > limit) add(label, "font", `${key} ${want}`, `${key} ${got}`);
    }
  });
  if (over(measured.root.width, spec.frame.width)) add("root", "width", spec.frame.width, round(measured.root.width));
  if (over(measured.root.height, spec.frame.height)) add("root", "height", spec.frame.height, round(measured.root.height));
  if (measured.pixels && measured.pixelLimit !== undefined && measured.pixels.ratio > measured.pixelLimit) {
    add("*", "pixels", measured.pixelLimit, measured.pixels.ratio);
  }
  const classified = issues.map((i) => classify(i, frame, ledger));
  const failing = classified.filter((i) => i.status === "fail");
  return {
    frame, pass: failing.length === 0, issues: classified, causes: steps,
    score: round(failing.reduce((s, i) => s + (i.delta === undefined ? 10 : Math.max(0, Math.abs(i.delta) - tolerance)), 0)),
    root: { spec: { width: spec.frame.width, height: spec.frame.height }, page: measured.root },
    pixels: measured.pixels, fonts: measured.fonts ?? [], images: measured.images ?? {},
  };
}

// Where an offset is introduced rather than inherited. Each landmark is read against the one it follows in the
// design: vertically, the nearest landmark above that shares some of its width, else the nearest row above;
// horizontally, the nearest landmark on the side its alignment holds (the left, or the right for right-aligned
// text) that shares some of its height, else the root's edge; centred text, against the root. An offset equal to that neighbour's was carried from
// it; one that differs is a spacing, size or column width between the two: the place to fix. The root's bottom
// edge is read against the lowest landmark, so a changed bottom padding shows too.
export function causes(placed, spec, measured, tolerance = 1) {
  const out = [];
  const bottom = (q) => q.l.box.y + q.l.box.height, right = (q) => q.l.box.x + q.l.box.width;
  const overlapX = (a, b) => Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 0;
  const overlapY = (a, b) => Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 0;
  const seen = new Set();
  const record = (p, axis, from, d, fromD, edge) => {
    const step = round(d - fromD);
    if (Math.abs(step) <= tolerance) return;
    const after = from?.label ?? edge;
    const key = `${axis}\u0000${after}\u0000${step}`;
    out.push({ index: p.index, axis, after, before: p.label, step, y: p.l.box.y, x: p.l.box.x, ...(seen.has(key) ? { repeat: true } : {}) });
    seen.add(key);
  };
  for (const p of placed) {
    const b = p.l.box;
    const higher = placed.filter((q) => q !== p && bottom(q) <= b.y + 1);
    const above = higher.filter((q) => overlapX(q.l.box, b)).sort((q, r) => bottom(r) - bottom(q))[0]
      ?? higher.sort((q, r) => bottom(r) - bottom(q) || Math.abs(q.l.box.x - b.x) - Math.abs(r.l.box.x - b.x))[0];
    record(p, "y", above, p.dy, above ? above.dy + above.dh : 0, "the top of the root");
    // Centred text sits where its box puts it, not after a neighbour: it is read against the root alone.
    const rightward = p.align === "right";
    const beside = p.align === "center" ? undefined : placed.filter((q) => q !== p && overlapY(q.l.box, b) && (rightward ? q.l.box.x >= right(p) - 1 : right(q) <= b.x + 1))
      .sort((q, r) => (rightward ? q.l.box.x - r.l.box.x : right(r) - right(q)))[0];
    record(p, "x", beside, p.dx, beside?.dx ?? 0, p.align === "center" ? "the root" : rightward ? "the right edge of the root" : "the left edge of the root");
  }
  const lowest = [...placed].sort((q, r) => bottom(r) - bottom(q))[0];
  if (lowest) {
    const step = round((measured.root.height - spec.frame.height) - (lowest.dy + lowest.dh));
    if (Math.abs(step) > tolerance) out.push({ index: -1, axis: "y", after: lowest.label, before: "the bottom of the root", step, y: spec.frame.height, x: 0 });
  }
  // Top to bottom by bands of 8 px, the largest step first within a band: a line's half-pixel lead over its
  // neighbour does not put a small offset ahead of the large one beside it.
  const band = (c) => Math.floor(c.y / 8);
  return out.sort((a, b) => band(a) - band(b) || Math.abs(b.step) - Math.abs(a.step) || a.x - b.x);
}

// ------------------------------------------------------------------ sweep

// Issues seen at many widths, each kept once with the widths it was seen at, as ranges.
export function sweepIssues(probes, ledger = [], frame = "sweep") {
  const byKey = new Map();
  for (const p of probes) for (const issue of p.issues) {
    const key = `${issue.property}\u0000${issue.landmark}`;
    if (!byKey.has(key)) byKey.set(key, { ...issue, widths: [] });
    byKey.get(key).widths.push(p.width);
  }
  return [...byKey.values()].map((i) => ({ ...classify(i, frame, ledger), ranges: ranges(i.widths) }));
}

export function ranges(widths) {
  const sorted = [...new Set(widths)].sort((a, b) => a - b);
  const out = [];
  for (const w of sorted) {
    const last = out.at(-1);
    if (last && w - last[1] <= 16) last[1] = w; else out.push([w, w]);
  }
  return out.map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(", ");
}

// ------------------------------------------------------------------ report

const cell = (v) => (v === undefined ? "" : String(v).replace(/\|/g, "\\|").replace(/\n/g, " "));
const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

export function renderReport({ frames = [], sweep, ledgerProblems = [] }) {
  const out = ["# Layout check", ""];
  const all = [...frames.flatMap((f) => f.issues), ...(sweep?.issues ?? [])];
  const count = (s) => all.filter((i) => i.status === s).length;
  const passed = frames.filter((f) => f.pass).length;
  out.push(`Frames: ${passed} of ${frames.length} pass${sweep ? ` · sweep: ${sweep.pass ? "pass" : "fail"}` : ""}`
    + ` · accepted deviations: ${count("accepted")} · pending decisions: ${count("pending")}`
    + ` · score: ${round(frames.reduce((s, f) => s + f.score, 0) + (sweep?.score ?? 0))} (lower is better)`, "");
  for (const p of ledgerProblems) out.push(`- Ledger: ${p}`);
  if (ledgerProblems.length) out.push("");
  for (const f of frames) {
    out.push(`## ${f.frame} — ${f.pass ? "pass" : "fail"}`, "");
    const { spec, page } = f.root;
    out.push(`Root: page ${round(page.width)} × ${round(page.height)}, design ${spec.width} × ${spec.height}.`);
    if (f.fonts.length) out.push(`Fonts not available on the page, so text cannot match: ${f.fonts.join(", ")}.`);
    const shown = f.causes.filter((c) => !c.repeat);
    if (shown.length) {
      const say = (c) => `between “${cell(c.after)}” and “${cell(c.before)}” the ${c.axis === "y" ? "vertical" : "horizontal"} offset changes by ${signed(c.step)} px`;
      out.push(`Start here: ${say(shown[0])}.`);
      if (shown.length > 1) out.push(`Then: ${shown.slice(1, 7).map(say).join("; ")}${shown.length > 7 ? `; and ${shown.length - 7} more` : ""}.`);
    }
    if (f.pixels) out.push(`Pixels: ${round(f.pixels.ratio * 100)} % differ${f.pixels.sizeMatch ? "" : ` (sizes differ: design ${f.pixels.reference}, page ${f.pixels.actual})`}.`);
    const images = Object.values(f.images);
    if (images.length) out.push(`Images: ${images.join(", ")}.`);
    out.push("");
    if (f.issues.length) {
      out.push("| Landmark | Property | Design | Page | Δ | Status |", "|---|---|---:|---:|---:|---|");
      for (const i of f.issues) out.push(`| ${cell(i.landmark)} | ${i.property} | ${cell(i.expected)} | ${cell(i.actual)} | ${i.delta === undefined ? "" : `${signed(i.delta)}${i.inherited ? " (inherited)" : ""}`} | ${i.status}${i.ledger ? ` (${cell(i.ledger)})` : ""} |`);
      out.push("");
    }
  }
  if (sweep) {
    out.push(`## Sweep ${sweep.from}–${sweep.to} px — ${sweep.pass ? "pass" : "fail"}`, "");
    if (sweep.issues.length) {
      out.push("| Problem | Where | Widths | Detail | Status |", "|---|---|---|---|---|");
      for (const i of sweep.issues) out.push(`| ${i.property} | ${cell(i.landmark)} | ${i.ranges} | ${cell(i.actual)} | ${i.status}${i.ledger ? ` (${cell(i.ledger)})` : ""} |`);
      out.push("");
    }
  }
  return out.join("\n");
}

// What the console shows: per frame the verdict, where to start and the first findings that are not inherited;
// the full tables stay in report.md. A round reads this, not the tables.
export function renderSummary({ frames = [], sweep, ledgerProblems = [] }, { limit = 8, file = "report.md" } = {}) {
  const out = [];
  const all = [...frames.flatMap((f) => f.issues), ...(sweep?.issues ?? [])];
  const count = (s) => all.filter((i) => i.status === s).length;
  out.push(`Frames: ${frames.filter((f) => f.pass).length} of ${frames.length} pass${sweep ? ` · sweep: ${sweep.pass ? "pass" : "fail"}` : ""}`
    + ` · accepted: ${count("accepted")} · pending: ${count("pending")}`
    + ` · score: ${round(frames.reduce((s, f) => s + f.score, 0) + (sweep?.score ?? 0))} (lower is better)`);
  for (const p of ledgerProblems) out.push(`Ledger: ${p}`);
  const say = (c) => `between “${c.after}” and “${c.before}” ${c.axis === "y" ? "vertically" : "horizontally"} ${signed(c.step)} px`;
  for (const f of frames) {
    const failing = f.issues.filter((i) => i.status === "fail");
    out.push("", `${f.frame}: ${f.pass ? "pass" : `fail, ${failing.length} findings`}`
      + `${f.pixels ? `, ${round(f.pixels.ratio * 100)} % pixels differ` : ""}`);
    if (f.fonts.length) out.push(`  fonts not available: ${f.fonts.join(", ")}`);
    const shown = f.causes.filter((c) => !c.repeat);
    if (shown.length) out.push(`  start here: ${say(shown[0])}`, ...shown.slice(1, 4).map((c) => `  then: ${say(c)}`));
    const own = failing.filter((i) => !i.inherited);
    for (const i of own.slice(0, limit)) out.push(`  ${i.landmark} ${i.property}: ${i.expected} → ${i.actual}${i.delta === undefined ? "" : ` (${signed(i.delta)})`}`);
    const rest = failing.length - Math.min(own.length, limit);
    if (rest > 0) out.push(`  … ${rest} more${failing.some((i) => i.inherited) ? ", of them inherited: " + failing.filter((i) => i.inherited).length : ""}`);
  }
  if (sweep && !sweep.pass) {
    out.push("", `sweep ${sweep.from}–${sweep.to}:`);
    const failing = sweep.issues.filter((i) => i.status === "fail");
    for (const i of failing.slice(0, limit)) out.push(`  ${i.property} ${i.landmark} at ${i.ranges}: ${i.actual}`);
    if (failing.length > limit) out.push(`  … ${failing.length - limit} more`);
  }
  out.push("", `Full tables: ${file}`);
  return out.join("\n");
}

// ------------------------------------------------------------------ gallery

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// One self-contained page per check: for every frame the design, the page before the work began, the page now and
// the difference, at the frame's CSS size, with the frame's verdict, where to start and the ledger's entries.
// images: { design, before, after, diff } as data URLs, any of them absent.
export function renderGallery({ title = "Design check", frames }) {
  const columns = [["design", "Design"], ["before", "Before"], ["after", "After"], ["diff", "Difference"]];
  const sections = frames.map((f) => {
    const shown = f.result.causes.filter((c) => !c.repeat);
    const lines = [
      shown.length ? `Start here: between “${esc(shown[0].after)}” and “${esc(shown[0].before)}” the ${shown[0].axis === "y" ? "vertical" : "horizontal"} offset changes by ${shown[0].step > 0 ? "+" : ""}${shown[0].step} px.` : "",
      f.result.pixels ? `Pixels: ${round(f.result.pixels.ratio * 100)} % differ.` : "",
    ].filter(Boolean);
    const deviations = f.result.issues.filter((i) => i.status !== "fail");
    return `<section><h2>${esc(f.result.frame)} <span class="${f.result.pass ? "pass" : "fail"}">${f.result.pass ? "pass" : "fail"}</span></h2>
${lines.map((l) => `<p>${l}</p>`).join("\n")}
<div class="row">${columns.filter(([k]) => f.images[k]).map(([k, label]) => `<figure><figcaption>${label}</figcaption><img src="${f.images[k]}" width="${f.width}" alt="${label}, ${esc(f.result.frame)}"></figure>`).join("")}</div>
${deviations.length ? `<ul>${deviations.map((i) => `<li>${esc(i.landmark)} · ${i.property}: ${i.status}${i.ledger ? ` — ${esc(i.ledger)}` : ""}</li>`).join("")}</ul>` : ""}
</section>`;
  });
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{color-scheme:light dark;--bg:#fff;--fg:#1f2329;--muted:#6b7280;--line:#d8dbe0;--pass:#1a7f45;--fail:#c42b1c}
@media (prefers-color-scheme:dark){:root{--bg:#16181c;--fg:#e8eaed;--muted:#9aa0a6;--line:#3a3f47;--pass:#5bd08a;--fail:#ff7b6b}}
body{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,sans-serif}
h1{font-size:22px;margin:0 0 4px}h2{font-size:18px;margin:28px 0 6px}p{margin:4px 0;color:var(--muted)}
.pass{color:var(--pass)}.fail{color:var(--fail)}
.row{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;margin-top:10px}
figure{margin:0;max-width:100%}figcaption{font-weight:600;margin-bottom:4px}
img{display:block;max-width:100%;height:auto;outline:1px solid var(--line);background:#fff}
</style>
<h1>${esc(title)}</h1><p>${esc(new Date().toISOString().slice(0, 16).replace("T", " "))} UTC · design, the page before the work, the page now, and where they differ.</p>
${sections.join("\n")}
</html>
`;
}
