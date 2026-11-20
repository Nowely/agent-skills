// The half of the design check that needs no browser: a Figma frame turned into a spec, a measured page held
// against that spec, the ledger of deliberate deviations, and the reports. design.mjs measures; this file judges.

export const PROPERTIES = ["x", "y", "width", "height", "font", "presence", "text", "region", "overflow", "clipped",
  "overlap", "covered", "outside", "align", "resize", "switch"];
export const CATEGORIES = ["design-error", "missing-state", "platform", "system", "owner", "ux"];
export const STATUSES = ["accepted", "proposed"];

const round = (n) => Math.round(n * 100) / 100;
const num = (v) => (v === undefined || v === "" ? NaN : Number(v));
export const norm = (s) => String(s).replace(/\s+/g, " ").trim();
// How a text is matched on the page: spaces and letter case do not count, since markup splits and CSS transforms
// them ("1 499 €" is found in `1 499<span>€</span>`, "NEW" in a `text-transform: uppercase` "New").
export const key = (s) => String(s).replace(/[\s\u200b]+/g, "").toLocaleLowerCase();

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

// ------------------------------------------------------------------ Figma → spec

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

// From the MCP server's `get_metadata` outline: text layers, by their name when the outline carries no text.
export function specFromMetadata(xml, { frame: selector, coords = "auto" } = {}) {
  const frame = findFrame(parseXml(xml), selector);
  const mode = coords === "auto" ? detectCoords(frame) : coords;
  if (!["relative", "absolute"].includes(mode)) throw new Error(`coords must be auto, relative or absolute, not ${coords}`);
  const landmarks = place(frame, mode)
    .filter(({ node }) => /^text$/i.test(node.tag))
    .map(({ node, box }) => ({ text: norm(node.attrs.characters ?? node.attrs.name ?? ""), box, id: node.attrs.id }))
    .filter((l) => l.text !== "");
  return {
    frame: { id: frame.attrs.id, name: frame.attrs.name, width: num(frame.attrs.width), height: num(frame.attrs.height) },
    source: `figma-metadata (${mode})`,
    landmarks: numberDuplicates(landmarks.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)),
  };
}

const hex = ({ r, g, b }) => `#${[r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("")}`;
const ALIGN = { LEFT: "left", RIGHT: "right", CENTER: "center", JUSTIFIED: "left" };

// From a node of Figma's REST API (`GET /v1/files/:key/nodes`): every visible text with its absolute box, its text
// (not the layer's name), its alignment, and its size, weight, line height and colour.
export function specFromRest(node) {
  const frame = node.absoluteBoundingBox;
  if (!frame) throw new Error(`node ${node.id} has no absoluteBoundingBox`);
  const landmarks = [];
  const walk = (n) => {
    for (const c of n.children ?? []) {
      if (c.visible === false) continue;
      if (c.type === "TEXT" && c.absoluteBoundingBox && norm(c.characters ?? "")) {
        const b = c.absoluteBoundingBox, s = c.style ?? {};
        const fill = (c.fills ?? []).find((f) => f.type === "SOLID" && f.visible !== false);
        landmarks.push({
          text: norm(c.characters), id: c.id,
          box: { x: round(b.x - frame.x), y: round(b.y - frame.y), width: round(b.width), height: round(b.height) },
          ...(ALIGN[s.textAlignHorizontal] ? { align: ALIGN[s.textAlignHorizontal] } : {}),
          font: {
            ...(s.fontSize ? { size: s.fontSize } : {}), ...(s.fontWeight ? { weight: s.fontWeight } : {}),
            ...(s.lineHeightPx ? { lineHeight: round(s.lineHeightPx) } : {}), ...(fill ? { color: hex(fill.color) } : {}),
          },
        });
      }
      walk(c);
    }
  };
  walk(node);
  return {
    frame: { id: node.id, name: node.name, width: round(frame.width), height: round(frame.height) },
    source: "figma-rest",
    landmarks: numberDuplicates(landmarks.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)),
  };
}

// "https://www.figma.com/design/<key>/<name>?node-id=12-34" → { key, id: "12:34" }
export function parseFigmaUrl(url) {
  const key = String(url).match(/figma\.com\/(?:file|design|proto)\/([A-Za-z0-9]+)/)?.[1];
  const id = new URL(url).searchParams.get("node-id")?.replace(/-/g, ":");
  if (!key || !id) throw new Error(`not a Figma link with a node-id: ${url}`);
  return { key, id };
}

// The MCP outline names text layers but does not carry their text; the design context does, by node id
// (`data-node-id`). For each text landmark whose id the context has, take the context's text. Returns the spec, the
// ids joined, and the ids the context did not give a text for: read those from the frame's image.
export function joinContext(spec, context) {
  const texts = contextTexts(context);
  const joined = [], missing = [];
  const landmarks = spec.landmarks.map((l) => {
    if (!l.text || !l.id) return l;
    const t = texts.get(l.id);
    if (!t) { missing.push(l.id); return l; }
    joined.push(l.id);
    return { ...l, text: t };
  });
  return { spec: { ...spec, landmarks: numberDuplicates(landmarks.map(({ nth, ...l }) => l)) }, joined, missing };
}

// node id → text, from JSX-like code. An element's text is all the text inside it, in order, its children's
// included: one Figma text layer can be rendered as a paragraph with styled spans. Only what the code states is
// taken: literal text, string literals in braces, and entities it can decode. An element whose text depends on an
// expression (`{count} cores`) or an entity it cannot decode gets no text, so that the layer is reported as missing
// rather than given a wrong one; code it cannot parse to the end gives no texts at all.
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
export function contextTexts(code) {
  const out = new Map(), stack = [];
  let i = 0, broken = false;
  const text = (t, el = stack) => { for (const e of el) e.parts.push(t); };
  const doubt = () => { for (const e of stack) e.doubt = true; };
  // From an opening brace to its partner, through nested braces, strings and template literals.
  const braced = (from) => {
    let depth = 0, j = from;
    for (; j < code.length; j++) {
      const c = code[j];
      if (c === '"' || c === "'" || c === "`") {
        for (j++; j < code.length && code[j] !== c; j++) if (code[j] === "\\") j++;
      } else if (c === "{") depth++;
      else if (c === "}" && --depth === 0) return j;
    }
    return -1;
  };
  const decode = (raw) => raw.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      try { return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)); } catch { doubt(); return m; }
    }
    if (NAMED[e.toLowerCase()] !== undefined) return NAMED[e.toLowerCase()];
    doubt();
    return m;
  });
  let pending = "";
  const flush = () => { if (stack.length && pending.trim()) text(decode(pending)); pending = ""; };
  while (i < code.length && !broken) {
    const c = code[i];
    if (c === "<" && /[A-Za-z\/]/.test(code[i + 1] ?? "")) {
      flush();
      if (code[i + 1] === "/") {
        const end = code.indexOf(">", i), name = code.slice(i + 2, end).trim();
        const el = stack.pop();
        if (!el || el.name !== name) { broken = true; break; }
        // An id seen twice cannot say which text is the layer's.
        if (el.id) out.set(el.id, el.doubt || out.has(el.id) ? null : norm(el.parts.join(" ")));
        i = end + 1;
        continue;
      }
      const name = code.slice(i + 1).match(/^[A-Za-z][\w.:-]*/)[0];
      let j = i + 1 + name.length, selfClosing = false;
      for (; j < code.length; j++) {
        const d = code[j];
        if (d === '"' || d === "'") { for (j++; j < code.length && code[j] !== d; j++); }
        else if (d === "{") { j = braced(j); if (j < 0) { broken = true; break; } }
        else if (d === "/" && code[j + 1] === ">") { selfClosing = true; j++; break; }
        else if (d === ">") break;
      }
      if (broken || j >= code.length) { broken = true; break; }
      const attrs = code.slice(i + 1 + name.length, selfClosing ? j - 1 : j);
      const id = attrs.match(/(?:^|\s)data-node-id\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*["'`]([^"'`]*)["'`]\s*\})/);
      const el = { name, id: id ? (id[1] ?? id[2] ?? id[3]) : null, parts: [], doubt: false };
      if (!selfClosing) stack.push(el);
      i = j + 1;
      continue;
    }
    if (c === "{" && stack.length) {
      flush();
      const end = braced(i);
      if (end < 0) { broken = true; break; }
      const inner = code.slice(i + 1, end).trim();
      // A string literal is shown as written: no entities to decode, and an escape is not resolved here.
      const lit = inner.match(/^(["'])((?:\\.|(?!\1).)*)\1$/) ?? inner.match(/^`([^`$]*)`$/);
      if (lit && !/\\/.test(lit[2] ?? lit[1])) text(lit[2] ?? lit[1]);
      else if (lit) doubt();
      else if (!/^\/\*[\s\S]*\*\/$/.test(inner)) doubt();
      i = end + 1;
      continue;
    }
    // Outside JSX: comments and strings are code, not markup, even when they hold something that looks like a tag.
    if (!stack.length) {
      if (c === "/" && code[i + 1] === "/") { const n = code.indexOf("\n", i); i = n < 0 ? code.length : n; continue; }
      if (c === "/" && code[i + 1] === "*") { const n = code.indexOf("*/", i + 2); i = n < 0 ? code.length : n + 2; continue; }
      if (c === '"' || c === "'" || c === "`") { let j = i + 1; for (; j < code.length && code[j] !== c; j++) if (code[j] === "\\") j++; i = j + 1; continue; }
    }
    if (stack.length) pending += c;
    i++;
  }
  if (broken || stack.length) return new Map();
  for (const [k, v] of [...out]) if (!v) out.delete(k);
  return out;
}

// The nth occurrence, in reading order, of a text that appears more than once.
export function numberDuplicates(landmarks) {
  const seen = new Map();
  return landmarks.map((l) => {
    if (!l.text) return l;
    const n = seen.get(key(l.text)) ?? 0;
    seen.set(key(l.text), n + 1);
    return n ? { ...l, nth: n } : l;
  });
}

export const landmarkLabel = (l) => l.text ?? l.selector ?? "?";

// ------------------------------------------------------------------ ledger

export function ledgerFaults(entries) {
  if (!Array.isArray(entries)) return ["the ledger is not a JSON array"];
  return entries.flatMap((e, i) => {
    const at = `entry ${i + 1}${e?.id ? ` (${e.id})` : ""}`;
    if (!e || typeof e !== "object") return [`${at}: not an object`];
    const faults = [];
    if (e.property === "region") {
      if (!Array.isArray(e.region) || e.region.length !== 4 || !e.region.every(Number.isFinite)) faults.push(`${at}: a region entry gives "region": [x, y, width, height]`);
    } else if (!e.landmark || (Array.isArray(e.landmark) && !e.landmark.length)) faults.push(`${at}: no landmark (a design text or a list of them, a selector, "root" or "*")`);
    if (!PROPERTIES.includes(e.property) && e.property !== "*") faults.push(`${at}: property must be one of ${PROPERTIES.join(", ")} or *`);
    if (!CATEGORIES.includes(e.category)) faults.push(`${at}: category must be one of ${CATEGORIES.join(", ")}`);
    if (!STATUSES.includes(e.status)) faults.push(`${at}: status must be accepted or proposed`);
    // A proposal covers one difference: a wildcard waiting for a decision would silence everything it matches.
    if (e.status !== "accepted" && (e.landmark === "*" || e.property === "*" || (Array.isArray(e.landmark) && e.landmark.includes("*")))) faults.push(`${at}: only an accepted entry may use *`);
    if (!e.reason || !String(e.reason).trim()) faults.push(`${at}: no reason`);
    if (e.property === "text" && !e.actual) faults.push(`${at}: a text deviation names the page's text in "actual"`);
    if (e.property === "text" && (typeof e.landmark !== "string" || e.landmark === "*")) faults.push(`${at}: a text deviation names one design text as its landmark`);
    return faults;
  });
}

const frameMatches = (entry, frame) => entry.frame === undefined || entry.frame === "*" || entry.frame === frame
  || (Array.isArray(entry.frame) && entry.frame.includes(frame));
const landmarkMatches = (entry, label) => [entry.landmark].flat().some((v) => v === "*" || v === label);
const within = (b, r, pad = 4) => b.x >= r[0] - pad && b.y >= r[1] - pad && b.x + b.width <= r[0] + r[2] + pad && b.y + b.height <= r[1] + r[3] + pad;

export function ledgerEntryFor(issue, frame, ledger = []) {
  return ledger.find((e) => frameMatches(e, frame) && STATUSES.includes(e.status)
    && (e.property === "*" || e.property === issue.property)
    && (e.property === "region" ? e.region && within(issue.box, e.region)
      : landmarkMatches(e, issue.property === "region" ? "*" : issue.landmark))
    // An entry bounded by size covers only a difference that has one: never an overlap or a switch of unknown size.
    && (e.max === undefined || (issue.delta !== undefined && Math.abs(issue.delta) <= e.max)));
}

// The text to look for on the page: the design's own, unless the ledger records that the page says something else.
export function pageText(landmark, frame, ledger = []) {
  const e = ledger.find((x) => x.property === "text" && landmarkMatches(x, landmark.text) && frameMatches(x, frame) && STATUSES.includes(x.status));
  return e ? e.actual : landmark.text;
}

const statusOf = (entry) => (!entry ? "fail" : entry.status === "accepted" ? "accepted" : "pending");
const weaker = (a, b) => (a === "fail" || b === "fail" ? "fail" : a === "pending" || b === "pending" ? "pending" : "accepted");

function classify(issue, frame, ledger) {
  const entry = ledgerEntryFor(issue, frame, ledger);
  return { ...issue, status: statusOf(entry), ...(entry ? { ledger: entry.id ?? entry.reason } : {}) };
}

// ------------------------------------------------------------------ one frame

const FONT = { size: 0.5, lineHeight: 0.5, weight: 0 };

// A reference with no text landmark is an image alone: what its texts say and where they sit is not measured.
export const isImageOnly = (spec) => !spec.landmarks.some((l) => l.text);
const channels = (c) => String(c).match(/[0-9a-f]{2}/gi)?.slice(0, 3).map((h) => parseInt(h, 16)) ?? [];
const sameColour = (a, b) => { const x = channels(a), y = channels(b); return x.length === 3 && y.length === 3 && x.every((v, i) => Math.abs(v - y[i]) <= 2); };

// Where a landmark's horizontal position is read from: its left edge from the root's left, its right edge from the
// root's right, or its centre from the root's centre, whichever moved least. A text holds the edge its alignment
// holds when its width changes, and a box the side it is anchored to when the root narrows, so the reading that
// barely moved is the one that tells; a narrower root is then a finding of the root, not of everything anchored
// right. On a tie the design's alignment, then the page's, decides.
const READINGS = {
  left: (b) => b.x,
  right: (b, w) => b.x + b.width - w,
  center: (b, w) => b.x + b.width / 2 - w / 2,
};
function reading(l, m, sw, pw) {
  const prefer = [l.align, m.align, "left", "right", "center"].filter((a, i, all) => a && all.indexOf(a) === i);
  let best;
  for (const align of prefer) {
    const ex = READINGS[align](l.box, sw), ax = READINGS[align](m.box, pw);
    if (!best || Math.abs(ax - ex) < Math.abs(best.ax - best.ex) - 0.01) best = { align, ex, ax };
  }
  return best;
}

export function compareFrame({ frame, spec, measured, tolerance = 1, ledger = [], regions = [], missingReference = false }) {
  const over = (d) => Math.abs(d) > tolerance;
  const sw = spec.frame.width, pw = measured.root.width;
  const placed = [];
  spec.landmarks.forEach((l, index) => {
    const m = measured.landmarks[index];
    if (!m?.found) return;
    const { align, ex, ax } = reading(l, m, sw, pw);
    placed.push({ index, label: landmarkLabel(l), l, m, align, ex, ax, dx: ax - ex, dy: m.box.y - l.box.y, dh: m.box.height - l.box.height,
      dw: m.box.width - l.box.width });
  });
  const steps = causes(placed, spec, measured, tolerance);
  const own = new Map(steps.map((c) => [`${c.axis}\u0000${c.index}`, c]));
  const excuse = (label, property, delta) => ledgerEntryFor({ landmark: label, property, delta }, frame, ledger);

  // What of each landmark's offset the ledger accounts for: its own step, if excused, plus what it inherits from
  // the landmark it follows, if that was excused. An offset is a finding only by what is left.
  const byIndex = new Map(placed.map((p) => [p.index, p]));
  const memo = new Map();
  const excused = (p, axis) => {
    const k = `${axis}\u0000${p.index}`;
    if (memo.has(k)) return memo.get(k);
    memo.set(k, { amount: 0, status: "accepted", entries: [] });
    const link = p[axis === "y" ? "up" : "side"];
    const from = link && byIndex.get(link.index);
    let result = from ? { ...excused(from, axis) } : { amount: 0, status: "accepted", entries: [] };
    result = { ...result, entries: [...result.entries] };
    if (from && link.term) {
      const change = link.term === "height" ? from.dh : (link.sign ?? 1) * from.dw;
      const e = excuse(from.label, link.term, change);
      if (e) { result.amount += change; result.status = weaker(result.status, statusOf(e)); result.entries.push(e); }
    }
    const step = own.get(k);
    if (step) {
      const e = excuse(p.label, axis, step.step);
      if (e) { result.amount += step.step; result.status = weaker(result.status, statusOf(e)); result.entries.push(e); }
    }
    memo.set(k, result);
    return result;
  };

  const issues = [];
  // Sizes are kept as measured, for the ledger's max and the score; only what a person reads is rounded.
  const shown = (v) => (typeof v === "number" ? round(v) : v);
  const add = (landmark, property, expected, actual, extra = {}) => issues.push({
    landmark, property, expected: shown(expected), actual: shown(actual),
    ...(typeof expected === "number" && typeof actual === "number" ? { delta: actual - expected } : {}), ...extra,
  });
  const offset = (p, axis, expected, actual, delta) => {
    const e = excused(p, axis), left = delta - e.amount;
    const inherited = !own.has(`${axis}\u0000${p.index}`);
    const base = { expected: shown(expected), actual: shown(actual), delta, inherited };
    if (!over(left)) {
      if (e.entries.length) issues.push({ landmark: p.label, property: axis, ...base, status: e.status, ledger: e.entries[0].id ?? e.entries[0].reason });
      return;
    }
    issues.push({ landmark: p.label, property: axis, ...base, ...(e.entries.length ? { unexcused: left } : {}), status: "fail" });
  };

  if (over(pw - sw)) add("root", "width", sw, pw);
  for (const text of measured.unexpected ?? []) add(text, "presence", "absent", "present");
  spec.landmarks.forEach((l, index) => {
    const label = landmarkLabel(l), p = byIndex.get(index);
    if (l.text) {
      const text = p?.m?.matchedText ?? (p ? pageText(l, frame, ledger) : l.text);
      if (text !== l.text) add(label, "text", l.text, text);
    }
    if (!p) return add(label, "presence", "present", "missing");
    const { m } = p;
    if (m.clipped > tolerance) add(label, "clipped", 0, m.clipped);
    if (over(p.dx)) offset(p, "x", p.ex, p.ax, p.dx);
    if (over(p.dy)) offset(p, "y", l.box.y, m.box.y, p.dy);
    if (over(p.dh)) add(label, "height", l.box.height, m.box.height);
    if ((l.checkWidth ?? spec.widths) && l.text && Math.abs(p.dw) > Math.max(tolerance, l.box.width * 0.02)) add(label, "width", l.box.width, m.box.width);
    for (const [k, limit] of Object.entries(FONT)) {
      const want = Number(l.font?.[k]), got = Number(m.font?.[k]);
      if (Number.isFinite(want) && Number.isFinite(got) && Math.abs(got - want) > limit) add(label, "font", `${k} ${want}`, `${k} ${got}`);
    }
    if (l.font?.color && m.font?.color && !sameColour(l.font.color, m.font.color)) add(label, "font", `color ${l.font.color}`, `color ${m.font.color}`);
  });
  // The root's height is the lowest landmark's offset carried down plus the bottom step: excused as they are.
  const dH = measured.root.height - spec.frame.height;
  if (over(dH) && !placed.length) add("root", "height", spec.frame.height, measured.root.height);
  else if (over(dH)) {
    const lowest = placed.find((p) => p.index === steps.lowest);
    const chain = lowest ? excused(lowest, "y") : { amount: 0, status: "accepted", entries: [] };
    const carriedEntry = lowest && excuse(lowest.label, "height", lowest.dh);
    const carried = carriedEntry ? lowest.dh : 0;
    const bottom = steps.find((c) => c.index === "bottom");
    const rootEntry = bottom && excuse("root", "height", bottom.step);
    const amount = chain.amount + carried + (bottom && rootEntry ? bottom.step : 0);
    const entries = [...chain.entries, ...(carriedEntry ? [carriedEntry] : []), ...(rootEntry ? [rootEntry] : [])];
    const status = entries.reduce((s, e) => weaker(s, statusOf(e)), "accepted");
    if (over(dH - amount)) add("root", "height", spec.frame.height, measured.root.height, { status: "fail" });
    else add("root", "height", spec.frame.height, measured.root.height, { status, ledger: entries[0]?.id ?? entries[0]?.reason });
  }
  // An area that moved with a text is that text's finding already, excused or not with it.
  for (const r of regions.filter((x) => !x.movedWith)) {
    add(`region near “${r.near}”`, "region", "as designed", `${r.box.width}×${r.box.height} px at ${r.box.x}, ${r.box.y} differs`, { box: r.box, area: r.area });
  }
  const all = issues.map((i) => (i.status ? i : classify(i, frame, ledger)));
  // Page text the spec does not have: the spec may lack it (an MCP outline without an instance's texts) or the page may
  // be wrong. Either way the frame was not measured in full: one line lists them, and the frame is incomplete.
  const extra = (i) => i.expected === "absent" && i.status === "fail";
  const unexpected = all.filter(extra).map((i) => i.landmark), classified = all.filter((i) => !extra(i));
  const failing = classified.filter((i) => i.status === "fail");
  // The score counts what is not settled: a failure, and a proposal still awaiting the owner. Turning a failure into
  // a proposal is no progress.
  const open = classified.filter((i) => i.status !== "accepted");
  // An image-only reference leaves its texts to the eye. A missing font is reported, not used to hide findings.
  const imageOnly = isImageOnly(spec), fonts = measured.fonts ?? [];
  const verdict = failing.length ? "fail" : imageOnly || missingReference || unexpected.length ? "incomplete"
    : classified.some((i) => i.status === "pending") ? "pending" : "pass";
  return {
    frame, pass: verdict === "pass", verdict, imageOnly, fontsMissing: fonts, issues: classified, unexpected, causes: steps,
    score: round(unexpected.length * 10 + open.reduce((s, i) => s + (i.property === "region" ? Math.sqrt(i.area)
      : i.delta === undefined ? 10 : Math.max(0, Math.abs(i.unexcused ?? i.delta) - tolerance)), 0)),
    root: { spec: { width: spec.frame.width, height: spec.frame.height }, page: measured.root },
    pixels: measured.pixels, images: measured.images ?? {},
    moved: regions.filter((x) => x.movedWith).length,
  };
}

// Where an offset is introduced rather than inherited. Each landmark is read against the one it follows in the
// design. Vertically: the nearest landmark above that shares some of its width, else the nearest row above; the
// offset may be carried from that neighbour's top or, through its height, from its bottom, whichever explains more
// (an auto-layout stack follows the bottom; a text box Figma drew taller than its line moves nothing below it).
// Horizontally: the nearest landmark on the side its alignment holds that shares some of its height, its near or
// far edge, else the root's edge; centred text, against the root. What neither explains is a step: a spacing, size
// or column width between the two, the place to fix. The root's own width comes first, and its bottom edge is read
// against the lowest landmark, so a changed padding shows too. Each landmark gets `up` and `side`: what it follows.
export function causes(placed, spec, measured, tolerance = 1) {
  const out = [];
  const bottom = (q) => q.l.box.y + q.l.box.height, right = (q) => q.l.box.x + q.l.box.width;
  const overlapX = (a, b) => Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 0;
  const overlapY = (a, b) => Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 0;
  const seen = new Set();
  const record = (p, axis, from, step, edgeName) => {
    if (Math.abs(step) <= tolerance) return;
    const after = from?.label ?? edgeName;
    const k = `${axis}\u0000${after}\u0000${round(step)}`;
    out.push({ index: p.index, axis, after, before: p.label, step, y: p.l.box.y, x: p.l.box.x, ...(seen.has(k) ? { repeat: true } : {}) });
    seen.add(k);
  };
  // A landmark carried by its neighbour's far edge moved because that neighbour grew or shrank: the neighbour's
  // size is then the cause to name, once, even where no size finding is made (a Figma text box's width is not one).
  const sized = new Set();
  const size = (q, kind, change) => {
    if (Math.abs(change) <= tolerance || sized.has(`${kind}\u0000${q.index}`)) return;
    sized.add(`${kind}\u0000${q.index}`);
    out.push({ index: q.index, axis: "size", kind, after: q.label, before: q.label, step: change, y: q.l.box.y, x: q.l.box.x });
  };
  // The smaller of the two readings: carried from the neighbour's near edge, or from its far edge.
  const best = (d, near, far) => (far === undefined || Math.abs(d - near) <= Math.abs(d - far) ? [d - near, null] : [d - far, "far"]);
  const dW = measured.root.width - spec.frame.width;
  if (Math.abs(dW) > tolerance) out.push({ index: "root", axis: "x", after: "the design's width", before: "the root", step: dW, y: -1, x: 0 });
  for (const p of placed) {
    const b = p.l.box;
    const higher = placed.filter((q) => q !== p && bottom(q) <= b.y + 1);
    const above = higher.filter((q) => overlapX(q.l.box, b)).sort((q, r) => bottom(r) - bottom(q))[0]
      ?? higher.sort((q, r) => bottom(r) - bottom(q) || Math.abs(q.l.box.x - b.x) - Math.abs(r.l.box.x - b.x))[0];
    const [stepY, viaY] = above ? best(p.dy, above.dy, above.dy + above.dh) : [p.dy, null];
    p.up = above ? { index: above.index, term: viaY ? "height" : null } : null;
    if (viaY) size(above, "height", above.dh);
    record(p, "y", above, stepY, "the top of the root");
    // Centred text sits where its box puts it, not after a neighbour: it is read against the root alone.
    const rightward = p.align === "right";
    const beside = p.align === "center" ? undefined : placed.filter((q) => q !== p && overlapY(q.l.box, b) && (rightward ? q.l.box.x >= right(p) - 1 : right(q) <= b.x + 1))
      .sort((q, r) => (rightward ? q.l.box.x - r.l.box.x : right(r) - right(q)))[0];
    // A neighbour's shift in this landmark's frame of reference: its left edge for a left chain, else its right.
    // A left chain follows the neighbour's left edge (a column) or its right edge (a gap after it), measured from the
    // root's left; a right chain its right edge or its left edge, measured from the root's right. The edge that
    // involves the neighbour's width carries that width's change, with its sign.
    let stepX, viaX = null;
    if (beside) {
      const fromLeft = beside.m.box.x - beside.l.box.x;
      const fromRight = (beside.m.box.x + beside.m.box.width - measured.root.width) - (beside.l.box.x + beside.l.box.width - spec.frame.width);
      [stepX, viaX] = rightward ? best(p.dx, fromRight, fromRight - beside.dw) : best(p.dx, fromLeft, fromLeft + beside.dw);
    } else stepX = p.dx;
    p.side = beside ? { index: beside.index, term: viaX ? "width" : null, sign: rightward ? -1 : 1 } : null;
    if (viaX) size(beside, "width", beside.dw);
    record(p, "x", beside, stepX, p.align === "center" ? "the root" : rightward ? "the right edge of the root" : "the left edge of the root");
  }
  const lowest = [...placed].sort((q, r) => bottom(r) - bottom(q))[0];
  if (lowest) {
    const step = (measured.root.height - spec.frame.height) - (lowest.dy + lowest.dh);
    if (Math.abs(step) > tolerance) out.push({ index: "bottom", axis: "y", after: lowest.label, before: "the bottom of the root", step, y: spec.frame.height, x: 0 });
  }
  // Top to bottom by bands of 8 px, the largest step first within a band: a line's half-pixel lead over its
  // neighbour does not put a small offset ahead of the large one beside it. The root's width goes first.
  const band = (c) => Math.floor(c.y / 8);
  const sorted = out.sort((a, b) => band(a) - band(b) || Math.abs(b.step) - Math.abs(a.step) || a.x - b.x);
  sorted.lowest = lowest?.index;
  return sorted;
}

// Differing areas of the image outside every text, as the browser found them, named by the nearest text.
export function nameRegions(regions, landmarks) {
  const centre = (b) => [b.x + b.width / 2, b.y + b.height / 2];
  return regions.map((r) => {
    const [cx, cy] = centre(r.box);
    const near = [...landmarks].sort((a, b) => {
      const [ax, ay] = centre(a.box), [bx, by] = centre(b.box);
      return Math.hypot(ax - cx, ay - cy) - Math.hypot(bx - cx, by - cy);
    })[0];
    return { ...r, near: near ? landmarkLabel(near) : "the root" };
  });
}

// ------------------------------------------------------------------ sweep

// Issues seen at many widths, each kept once with the widths it was seen at, as ranges; then the issues that belong to
// no single width, such as a missing layout change.
// Each width's issue is classified with its own size before widths are grouped, so an entry bounded by `max` excuses
// the widths it covers and not a larger difference at another width. A group keeps its largest difference.
export function sweepIssues(probes, ledger = [], extra = []) {
  const byKey = new Map();
  for (const p of probes) for (const raw of p.issues) {
    const issue = classify(raw, "sweep", ledger);
    const k = `${issue.property}\u0000${issue.landmark}\u0000${issue.status}`;
    const group = byKey.get(k);
    if (!group) byKey.set(k, { ...issue, widths: [p.width] });
    else {
      group.widths.push(p.width);
      if (Math.abs(issue.delta ?? 0) > Math.abs(group.delta ?? 0)) Object.assign(group, { delta: issue.delta, actual: issue.actual });
    }
  }
  return [...[...byKey.values()].map(({ widths, ...i }) => ({ ...i, ranges: ranges(widths) })),
    ...extra.map((i) => ({ ...classify(i, "sweep", ledger), ranges: "" }))];
}

// Where the layout changes on the way down: between two neighbouring widths whose texts sit in different rows.
// With the widths the design says it should change at, a change elsewhere or none near one is a finding.
export function switches(probes, expected = [], step = 8) {
  const seen = [];
  for (let i = 1; i < probes.length; i++) {
    if (probes[i].rows !== probes[i - 1].rows) seen.push([probes[i].width, probes[i - 1].width]);
  }
  const near = (s, [lo, hi]) => s > lo - step && s <= hi + step;
  const issues = [
    ...expected.filter((s) => !seen.some((c) => near(s, c))).map((s) => ({ landmark: `at ${s}`, property: "switch", actual: "no layout change near this width" })),
    ...(expected.length ? seen.filter((c) => !expected.some((s) => near(s, c))).map(([lo, hi]) => ({ landmark: `${lo}–${hi}`, property: "switch", actual: "a layout change the design does not name" })) : []),
  ];
  return { seen: seen.map(([lo, hi]) => `${lo}–${hi}`), issues };
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

// ------------------------------------------------------------------ reports

const cell = (v) => (v === undefined ? "" : String(v).replace(/\|/g, "\\|").replace(/\n/g, " "));
const signed = (n) => (n > 0 ? `+${n}` : `${n}`);
const sayCause = (c) => (c.kind ? `the ${c.kind} of “${c.after}” changes by ${signed(round(c.step))} px`
  : `between “${c.after}” and “${c.before}” ${c.axis === "y" ? "vertically" : "horizontally"} ${signed(round(c.step))} px`);
export const totalScore = (frames, sweep, journeys = []) => frames.some((f) => f.unmeasured) || sweep?.reason ? null
  : round(frames.reduce((s, f) => s + f.score, 0) + (sweep?.score ?? 0) + journeys.filter((j) => !j.pass).length * 10);
const counts = (frames, sweep) => {
  const all = [...frames.flatMap((f) => f.issues), ...(sweep?.issues ?? [])];
  return (s) => all.filter((i) => i.status === s).length;
};
// Root first, then in the design's order: the root is fixed before what is inside it.
const ordered = (issues) => [...issues.filter((i) => i.landmark === "root"), ...issues.filter((i) => i.landmark !== "root")];
const verdictOf = (f) => f.verdict ?? (f.pass ? "pass" : "fail");
const listed = (texts, limit = 8) => `${texts.slice(0, limit).map((t) => `“${t}”`).join(", ")}${texts.length > limit ? ` and ${texts.length - limit} more` : ""}`;
const notInDesign = (f) => `page text not in the design (${f.unexpected.length}): ${listed(f.unexpected)}`;
const where = (i) => `${i.landmark}${i.story ? ` (${i.story})` : ""}`;

const journeyLine = (journeys) => `journeys: ${journeys.length ? `${journeys.filter((j) => j.pass).length} of ${journeys.length} hold` : "none defined"}`;

export function renderReport({ frames = [], sweep, journeys = [], gaps = [], ledgerProblems = [], round: n, status, missingReferences = [] }) {
  const count = counts(frames, sweep);
  const out = ["# Design check", "",
    `${n ? `Round ${n} · ` : ""}frames: ${frames.filter((f) => f.pass).length} of ${frames.length} pass${sweep ? ` · sweep: ${verdictOf(sweep)}` : ""}`
    + ` · ${journeyLine(journeys)} · accepted: ${count("accepted")} · pending: ${count("pending")} · score: ${totalScore(frames, sweep, journeys) ?? "unmeasured"} (lower is better)`, ""];
  if (status) out.push(`Verdict: ${status}`, "");
  for (const g of gaps) out.push(`Not checked: ${g}.`, "");
  if (missingReferences.length) out.push(`Reference image not measured: ${missingReferences.join(", ")}`, "");
  for (const p of ledgerProblems) out.push(`- Ledger: ${p}`);
  if (ledgerProblems.length) out.push("");
  for (const f of frames) {
    out.push(`## ${f.frame} — ${verdictOf(f)}`, "");
    if (f.imageOnly) out.push("Image-only reference: text was not measured; inspect it in the images.", "");
    if (f.fontsMissing?.length) out.push(`Fonts not available: ${f.fontsMissing.join(", ")}. Their texts render in a fallback: load them before trusting the text findings.`, "");
    const { spec, page } = f.root;
    if (!page) { out.push(f.unmeasured, ""); continue; }
    out.push(`Root: page ${round(page.width)} × ${round(page.height)}, design ${spec.width} × ${spec.height}.`);

    const shown = f.causes.filter((c) => !c.repeat);
    if (shown.length) out.push(`Start here: ${sayCause(shown[0])}.`);
    if (shown.length > 1) out.push(`Then: ${shown.slice(1, 7).map(sayCause).join("; ")}${shown.length > 7 ? `; and ${shown.length - 7} more` : ""}.`);
    if (f.pixels) out.push(`Pixels: ${round(f.pixels.ratio * 100)} % differ${f.pixels.sizeMatch ? "" : ` (sizes differ: design ${f.pixels.reference}, page ${f.pixels.actual})`}.`);
    const images = Object.values(f.images);
    if (images.length) out.push(`Images: ${images.join(", ")}.`);
    if (f.unexpected?.length) out.push(`${notInDesign(f).replace(/^p/, "P")}: the spec lacks it, or the page should not show it.`);
    out.push("");
    if (f.issues.length) {
      out.push("| Landmark | Property | Design | Page | Δ | Status |", "|---|---|---:|---:|---:|---|");
      for (const i of ordered(f.issues)) out.push(`| ${cell(i.landmark)} | ${i.property} | ${cell(i.expected)} | ${cell(i.actual)} | ${i.delta === undefined ? "" : `${signed(round(i.delta))}${i.inherited ? " (inherited)" : ""}`} | ${i.status}${i.ledger ? ` (${cell(i.ledger)})` : ""} |`);
      out.push("");
    }
  }
  if (journeys.length) {
    out.push("## Journeys", "");
    for (const j of journeys) out.push(`- ${j.pass ? "holds" : "fails"}: ${j.name}${j.failed ? ` (${j.failed})` : ""}`);
    out.push("");
  }
  if (sweep) {
    out.push(`## Sweep ${sweep.from}–${sweep.to} px, every ${sweep.step} px and each frame's width — ${verdictOf(sweep)}`, "");
    if (sweep.reason) out.push(sweep.reason, "");
    else out.push(`Layout changes between: ${sweep.switches.length ? sweep.switches.join(", ") : "none"}.`, "");
    if (sweep.stories?.length) out.push(`Stories swept as well: ${sweep.stories.map((st) => st.name).join(", ")}.`, "");
    for (const u of sweep.unmeasured ?? []) out.push(`Not measured: the alignment group ${cell(u.selector)} matched ${u.matched} at every width; it needs two or more.`, "");
    for (const u of sweep.partial ?? []) out.push(`The alignment group ${cell(u.selector)} matched fewer than two at ${u.ranges}; it was measured at the other widths.`, "");
    if (sweep.issues.length) {
      out.push("| Problem | Where | Widths | Detail | Status |", "|---|---|---|---|---|");
      for (const i of sweep.issues) out.push(`| ${i.property} | ${cell(where(i))} | ${i.ranges} | ${cell(i.actual)} | ${i.status}${i.ledger ? ` (${cell(i.ledger)})` : ""} |`);
      out.push("");
    }
  }
  return out.join("\n");
}

// What the console shows: per frame the verdict, where to start and the first findings that are not inherited;
// the full tables stay in report.md. A round reads this, not the tables.
export function renderSummary({ frames = [], sweep, journeys = [], gaps = [], ledgerProblems = [], round: n, previous, best, stalled = 0, restarted = false }, { limit = 8, file = "report.md" } = {}) {
  const count = counts(frames, sweep);
  const out = [`${n ? `Round ${n}: ` : ""}frames ${frames.filter((f) => f.pass).length} of ${frames.length} pass${sweep ? ` · sweep: ${verdictOf(sweep)}` : ""}`
    + ` · ${journeyLine(journeys)} · accepted: ${count("accepted")} · pending: ${count("pending")} · score: ${totalScore(frames, sweep, journeys) ?? "unmeasured"} (lower is better)`
    + `${previous ? ` · previous round: ${previous.score}` : ""}${best && best.round !== n ? ` · lowest: ${best.score} in round ${best.round}` : ""}`];
  if (restarted) out.push("The specs or the sweep changed: scores start a new series here.");
  if (stalled >= 2) out.push(`${stalled} rounds without a new lowest score: stop adjusting. Sort what remains: fix it another way, record it as proposed, or ask.`);
  for (const g of gaps) out.push(`Not checked: ${g}.`);
  for (const p of ledgerProblems) out.push(`Ledger: ${p}`);
  for (const f of frames) {
    const failing = ordered(f.issues.filter((i) => i.status === "fail"));
    const pending = f.issues.filter((i) => i.status === "pending").length;

    const verdict = failing.length ? `fail, ${failing.length} findings${pending ? `, ${pending} awaiting a decision` : ""}`
      : f.verdict === "incomplete" ? "incomplete" : pending ? `awaiting a decision on ${pending}` : "pass";
    out.push("", `${f.frame}: ${verdict}${f.pixels ? `, ${round(f.pixels.ratio * 100)} % pixels differ` : ""}`);
    if (f.unmeasured) out.push(`  ${f.unmeasured}`);
    if (f.fontsMissing?.length) out.push(`  fonts not available: ${f.fontsMissing.join(", ")}; their texts render in a fallback: load them before trusting the text findings`);
    if (f.imageOnly) out.push("  image-only reference: inspect text visually");
    const shown = f.causes.filter((c) => !c.repeat);
    if (shown.length) out.push(`  start here: ${sayCause(shown[0])}`, ...shown.slice(1, 4).map((c) => `  then: ${sayCause(c)}`));
    const mine = failing.filter((i) => !i.inherited);
    for (const i of mine.slice(0, limit)) out.push(`  ${i.landmark} ${i.property}: ${i.expected} → ${i.actual}${i.delta === undefined ? "" : ` (${signed(round(i.delta))})`}`);
    const rest = failing.length - Math.min(mine.length, limit);
    if (rest > 0) out.push(`  … ${rest} more, ${failing.filter((i) => i.inherited).length} of them inherited`);
    if (f.unexpected?.length) out.push(`  ${notInDesign(f)}`);
  }
  if (sweep) {
    out.push("", `sweep ${sweep.from}–${sweep.to}: ${verdictOf(sweep)} · ${sweep.reason ?? `layout changes between ${sweep.switches.length ? sweep.switches.join(", ") : "no widths"}`}`);
    const failing = sweep.issues.filter((i) => i.status === "fail");
    for (const i of failing.slice(0, limit)) out.push(`  ${i.property} ${where(i)}${i.ranges ? ` at ${i.ranges}` : ""}: ${i.actual}`);
    if (failing.length > limit) out.push(`  … ${failing.length - limit} more`);
    for (const u of sweep.unmeasured ?? []) out.push(`  not measured: ${u.selector} matched ${u.matched} at every width; an alignment needs two or more`);
    for (const u of sweep.partial ?? []) out.push(`  ${u.selector} matched fewer than two at ${u.ranges}: aligned only where it has two or more`);
  }
  for (const j of journeys.filter((x) => !x.pass)) out.push("", `journey fails: ${j.name}: ${j.failed}`);
  out.push("", `Full tables: ${file}`);
  return out.join("\n");
}

// ------------------------------------------------------------------ gallery

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// One self-contained page for a full check: for every frame the design, the page before the work began, the page
// now and their difference, at the frame's CSS size, with the frame's verdict and where to start; then the sweep's
// verdict and every ledger entry with its reason, who decided and the options.
// images: { design, before, after, diff } as data URLs, any of them absent.
export function renderGallery({ title = "Design check", frames, sweep, journeys = [], gaps = [], ledger = [] }) {
  const columns = [["design", "Design"], ["before", "Before"], ["after", "After"], ["diff", "Difference"]];
  const sections = frames.map((f) => {
    const shown = f.result.causes.filter((c) => !c.repeat);
    const lines = [shown.length ? `Start here: ${esc(sayCause(shown[0]))}.` : "", f.result.imageOnly ? "Image-only reference: inspect text visually." : "",
      f.result.unexpected?.length ? esc(notInDesign(f.result)) : "", f.result.pixels ? `Pixels: ${round(f.result.pixels.ratio * 100)} % differ.` : ""].filter(Boolean);
    const verdict = verdictOf(f.result);
    return `<section><h2>${esc(f.result.frame)} <span class="${verdict}">${verdict}</span></h2>
${lines.map((l) => `<p>${l}</p>`).join("\n")}
<div class="row">${columns.map(([k, label]) => {
      const content = f.images[k] ? `<img src="${f.images[k]}" width="${f.width}" alt="${label}, ${esc(f.result.frame)}">`
        : k === "before" ? esc(f.result.beforeUnavailable ?? "") : k === "after" ? esc(f.result.unmeasured ?? "") : "";
      return content ? `<figure><figcaption>${label}</figcaption>${content}</figure>` : "";
    }).join("")}</div>
</section>`;
  });
  const entry = (e) => `<li><b>${esc(e.status)}</b> · ${esc(e.category)} · ${esc(e.property === "region" ? `region ${e.region.join(", ")}` : `${[].concat(e.landmark).join(", ")} ${e.property}`)}${e.frame ? ` · ${esc([].concat(e.frame).join(", "))}` : ""}: ${esc(e.reason)}${e.decidedBy ? ` (decided by ${esc(e.decidedBy)})` : ""}${e.options ? `<br>Options: ${esc([].concat(e.options).join("; "))}` : ""}</li>`;
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{color-scheme:light dark;--bg:#fff;--fg:#1f2329;--muted:#6b7280;--line:#d8dbe0;--pass:#1a7f45;--fail:#c42b1c}
@media (prefers-color-scheme:dark){:root{--bg:#16181c;--fg:#e8eaed;--muted:#9aa0a6;--line:#3a3f47;--pass:#5bd08a;--fail:#ff7b6b}}
body{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,sans-serif}
h1{font-size:22px;margin:0 0 4px}h2{font-size:18px;margin:28px 0 6px}p{margin:4px 0;color:var(--muted)}
.pass{color:var(--pass)}.fail{color:var(--fail)}.incomplete,.pending{color:var(--muted)}
.row{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;margin-top:10px}
figure{margin:0;max-width:100%}figcaption{font-weight:600;margin-bottom:4px}
img{display:block;max-width:100%;height:auto;outline:1px solid var(--line);background:#fff}
li{margin:6px 0}
</style>
<h1>${esc(title)}</h1><p>${esc(new Date().toISOString().slice(0, 16).replace("T", " "))} UTC · the design, the page before the work, the page now, and where they differ.</p>
${gaps.length ? `<section><h2>Not checked</h2><ul>${gaps.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></section>` : ""}
${sections.join("\n")}
${sweep ? `<section><h2>Widths ${sweep.from}–${sweep.to} <span class="${verdictOf(sweep)}">${verdictOf(sweep)}</span></h2><p>${esc(sweep.reason ?? `Layout changes between ${sweep.switches.join(", ") || "no widths"}.`)}</p>${sweep.issues.length ? `<ul>${sweep.issues.map((i) => `<li>${esc(i.property)} ${esc(where(i))} at ${esc(i.ranges)}: ${esc(i.actual)} — ${esc(i.status)}</li>`).join("")}</ul>` : ""}</section>` : ""}
${(sweep?.stories ?? []).map((st) => `<section><h2>Story: ${esc(st.name)}</h2><p>At the frames' widths; its findings are in the list above.</p><div class="row">${st.shots.map((sh) => `<figure><figcaption>${sh.width} px</figcaption><img src="${sh.image}" alt="${esc(st.name)} at ${sh.width} px"></figure>`).join("")}</div></section>`).join("\n")}
${journeys.length ? `<section><h2>Journeys</h2><ul>${journeys.map((j) => `<li><span class="${j.pass ? "pass" : "fail"}">${j.pass ? "holds" : "fails"}</span> ${esc(j.name)}${j.failed ? `: ${esc(j.failed)}` : ""}</li>`).join("")}</ul></section>` : ""}
${ledger.length ? `<section><h2>Deviations</h2><ul>${ledger.map(entry).join("")}</ul></section>` : ""}
</html>
`;
}
