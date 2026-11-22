// The half of the design check that needs no browser: a Figma frame turned into a spec, a measured page held
// against that spec, the ledger of deliberate deviations, and the reports. design.mjs measures; this file judges.

export const PROPERTIES = ["x", "y", "width", "height", "font", "presence", "text", "region", "overflow", "clipped",
  "overlap", "covered", "outside", "align", "resize", "switch", "line", "construct", "type", "wrap", "journey", "truncated"];
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

// Boxes of the frame and its visible descendants relative to its top-left corner, reading x/y either as offsets from the
// parent's coordinate space ("relative") or as canvas positions ("absolute").
function place(frame, mode) {
  if (hidden(frame)) return [];
  const frameBox = { x: 0, y: 0, width: num(frame.attrs.width), height: num(frame.attrs.height) };
  const out = [{ node: frame, box: frameBox, parentBox: frameBox }];
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
  walk(frame, 0, 0, frameBox);
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
  const walk = (nodes) => {
    for (const c of nodes) {
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
      walk(c.children ?? []);
    }
  };
  walk([node]);
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
  const fonts = new Map(), texts = contextTexts(context, fonts);
  const joined = [], missing = [];
  const landmarks = spec.landmarks.map((l) => {
    if (!l.text || !l.id) return l;
    const t = texts.get(l.id), font = fonts.get(l.id), sized = font ? { ...l, font: { ...l.font, ...font } } : l;
    if (!t) { missing.push(l.id); return sized; }
    joined.push(l.id);
    return { ...sized, text: t };
  });
  return { spec: { ...spec, landmarks: numberDuplicates(landmarks.map(({ nth, ...l }) => l)) }, joined, missing };
}

// node id → text, from JSX-like code. An element's text is all the text inside it, in order, its children's
// included: one Figma text layer can be rendered as a paragraph with styled spans. Only what the code states is
// taken: literal text, string literals in braces, and entities it can decode. An element whose text depends on an
// expression (`{count} cores`) or an entity it cannot decode gets no text, so that the layer is reported as missing
// rather than given a wrong one; code it cannot parse to the end gives no texts at all. Given a map, it also takes
// each layer's size and line height from its Tailwind classes (`text-[14px]`, `leading-[20px]`): its own, else the
// first inside it, else for the size an ancestor's, as Figma's code nests them.
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
export function contextTexts(code, fonts = null) {
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
        const size = el.size ?? el.inner.size, lead = el.lead ?? el.inner.lead, parent = stack.at(-1);
        if (fonts && el.id) {
          const inherited = size ?? [...stack].reverse().find((a) => a.size)?.size;
          if (inherited) fonts.set(el.id, { size: inherited, ...(lead ? { lineHeight: lead } : {}) });
        }
        if (parent) { parent.inner.size ??= size; parent.inner.lead ??= lead; }
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
      const px = (re) => { const v = Number(attrs.match(re)?.[1]); return v > 0 ? v : null; };
      const el = { name, id: id ? (id[1] ?? id[2] ?? id[3]) : null, parts: [], doubt: false,
        size: px(/(?:^|[\s"'`{(])text-\[(\d+(?:\.\d+)?)px\]/), lead: px(/(?:^|[\s"'`{(])leading-\[(\d+(?:\.\d+)?)px\]/), inner: { size: null, lead: null } };
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
    // The cause is optional; given, it is one the owner knows.
    if (e.category !== undefined && !CATEGORIES.includes(e.category)) faults.push(`${at}: category, when given, is one of ${CATEGORIES.join(", ")}`);
    if (!STATUSES.includes(e.status)) faults.push(`${at}: status must be accepted or proposed`);
    // The implementer proposes; only the owner accepts, and the entry says who.
    if (e.status === "accepted" && !String(e.decidedBy ?? "").trim()) faults.push(`${at}: an accepted entry names who decided it in "decidedBy": only the owner accepts; write "proposed"`);
    // A proposal covers one difference: a wildcard waiting for a decision would silence everything it matches.
    if (e.status !== "accepted" && (e.landmark === "*" || e.property === "*" || (Array.isArray(e.landmark) && e.landmark.includes("*")))) faults.push(`${at}: only an accepted entry may use *`);
    if (e.category === "owner" && e.status !== "accepted") faults.push(`${at}: "owner" is the owner's own call: an entry of it is accepted, with decidedBy; propose under the cause it has`);
    if (!e.reason || !String(e.reason).trim()) faults.push(`${at}: no reason`);
    // A finding the check itself causes is disputed with the check, shown by a minimal reproduction in review.md.
    if (e.cause !== undefined && e.cause !== "checker") faults.push(`${at}: "cause", when given, is "checker": a finding the check itself causes, with its reproduction in review.md`);
    if (e.property === "journey" && e.cause !== "checker") faults.push(`${at}: a journey entry disputes a journey the check itself breaks: it gives "cause": "checker"`);
    if (e.property === "text" && !e.actual) faults.push(`${at}: a text deviation names the page's text in "actual"`);
    if (e.property === "text" && (typeof e.landmark !== "string" || e.landmark === "*")) faults.push(`${at}: a text deviation names one design text as its landmark`);
    return faults;
  });
}

const frameMatches = (entry, frame) => entry.frame === undefined || entry.frame === "*" || entry.frame === frame
  || (Array.isArray(entry.frame) && entry.frame.includes(frame));
const landmarkMatches = (entry, label) => [entry.landmark].flat().some((v) => v === "*" || v === label);
const within = (b, r, pad = 4) => b.x >= r[0] - pad && b.y >= r[1] - pad && b.x + b.width <= r[0] + r[2] + pad && b.y + b.height <= r[1] + r[3] + pad;

// The band a moderate offset may sit in: what a token or another font explains. Within it, an offset is a note.
export const MODERATE = 12;
// An entry covers a finding it names; a proposed one leaves it pending, for the owner to accept or refuse.
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
  return { ...issue, status: statusOf(entry), ...(entry ? { ledger: entry.id ?? entry.reason, entries: [ledger.indexOf(entry)] } : {}) };
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
  // Named boxes from an image: the page's font makes every text about as much wider (the typical ratio).
  const boxesSpec = spec.source === "image boxes";
  const widthRatios = placed.filter((p) => p.l.text && p.l.box.width > 0).map((p) => p.m.box.width / p.l.box.width).sort((a, b) => a - b);
  const fontRatio = widthRatios.length >= 3 ? widthRatios[Math.floor(widthRatios.length / 2)] : null;
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
    // Named boxes from an image: a text before it that is wider or narrower in the page's font moves it, and that is the
    // font's; its own size is held by the "wider than the font explains" finding, and a changed gap stays a step.
    if (from && link.term === "width" && boxesSpec && from.l.text) result.amount += (link.sign ?? 1) * from.dw;
    else if (from && link.term) {
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
  // The band a moderate offset may sit in: what a token or another font explains.
  const band = MODERATE;
  // Sizes are kept as measured, for the ledger's max and the score; only what a person reads is rounded.
  const shown = (v) => (typeof v === "number" ? round(v) : v);
  const add = (landmark, property, expected, actual, extra = {}) => issues.push({
    landmark, property, expected: shown(expected), actual: shown(actual),
    ...(typeof expected === "number" && typeof actual === "number" ? { delta: actual - expected } : {}), ...extra,
  });
  const offset = (p, axis, expected, actual, delta) => {
    const e = excused(p, axis);
    const left = delta - e.amount;
    const inherited = !own.has(`${axis}\u0000${p.index}`);
    const base = { expected: shown(expected), actual: shown(actual), delta, inherited, own: own.get(`${axis}\u0000${p.index}`)?.step ?? 0 };
    if (!over(left)) {
      if (e.entries.length) issues.push({ landmark: p.label, property: axis, ...base, status: e.status, ledger: e.entries[0].id ?? e.entries[0].reason, entries: e.entries.map((x) => ledger.indexOf(x)) });
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
    // A named box from an image is tight to its ink: another font changes its height, not where it stands.
    if (over(p.dh) && spec.source !== "image boxes") add(label, "height", l.box.height, m.box.height);
    if ((l.checkWidth ?? spec.widths) && l.text && Math.abs(p.dw) > Math.max(tolerance, l.box.width * 0.02)) add(label, "width", l.box.width, m.box.width);
    for (const [k, limit] of Object.entries(FONT)) {
      const want = Number(l.font?.[k]), got = Number(m.font?.[k]);
      if (Number.isFinite(want) && Number.isFinite(got) && Math.abs(got - want) > limit) add(label, "font", `${k} ${want}`, `${k} ${got}`);
    }
    if (l.font?.color && m.font?.color && !sameColour(l.font.color, m.font.color)) add(label, "font", `color ${l.font.color}`, `color ${m.font.color}`);
  });
  // The type's size, read from ink heights: the page's text against the design's, the same string. Another font
  // changes a cap height by a few per cent; a size of another class changes it by more. Recorded for every frame.
  // The mean of the middle sixty per cent: a box that holds an icon beside its text, or a line the font draws taller,
  // falls at the ends.
  const heights = placed.filter((p) => p.l.text && p.l.box.height >= 6 && p.m.box.height > 0).map((p) => ({ label: p.label, ratio: p.m.box.height / p.l.box.height, drawn: { width: p.l.box.width, height: p.l.box.height }, page: { width: p.m.box.width, height: p.m.box.height }, ...(p.l.joined ? { joined: true } : {}) }));
  const middle = heights.map((h) => h.ratio).sort((a, b) => a - b).slice(Math.floor(heights.length * 0.2), heights.length - Math.floor(heights.length * 0.2));
  const typeRatio = heights.length >= 5 ? middle.reduce((a, b) => a + b, 0) / middle.length : null;
  const sized = (r) => `${Math.round(Math.abs(r - 1) * 100)} % ${r < 1 ? "smaller" : "larger"} than drawn`;
  // Read from a screenshot's ink: a spec from Figma states its sizes, which are compared exactly.
  if (boxesSpec && typeRatio && Math.abs(typeRatio - 1) >= 0.1) {
    add("the type", "type", "as drawn", `${sized(typeRatio)}, by the ink heights of ${heights.length} texts: a size of another class; set the sizes the frame draws`, { delta: Math.round((typeRatio - 1) * 100) });
  }
  // One text set in another size, a price larger than drawn, whatever the rest do: a fifth or more off by its own ink.
  // A box the spec gives itself holds more than its text (an icon joined to its label), so its ink says nothing.
  // A size a step off (a price 2 px smaller) moves its ink height by a pixel or two, as much as rounding moves another
  // text's; its width moves by ten times as many pixels. So one text is also another size when it is 10 % and 6 px
  // wider or narrower than the frame's font explains, and its ink moves with it: the same way, and to within a pixel
  // and a half of where that width puts it. A wider font changes every text's width alike and leaves the height; a
  // wordmark drawn in its own letters (a stand-in logo) is far narrower or wider than its ink says.
  if (boxesSpec) for (const h of heights) {
    // A text whose box the builder gave (an icon joined to its label): its height is not ink, so only its width tells,
    // and only wider: a box drawn round an icon as well makes the page's text look narrower, never wider.
    if (h.joined) {
      if (!fontRatio || !(h.drawn?.width > 0)) continue;
      const across = h.page.width / fontRatio / h.drawn.width, gap = h.page.width / fontRatio - h.drawn.width;
      if (across - 1 >= 0.1 && gap >= 6) add(h.label, "type", "as drawn", `${sized(across)}, by its width against the frame's font: a size of another class; set the size the frame draws, or, if this is the kit's class for the role, propose it`, { delta: Math.round((across - 1) * 100) });
      continue;
    }
    if (Math.abs(h.ratio - 1) >= 0.2) {
      add(h.label, "type", "as drawn", `${sized(h.ratio)}, by its ink height: a size of another class; set the size the frame draws, or, if this is the kit's class for the role, propose it`, { delta: Math.round((h.ratio - 1) * 100) });
      continue;
    }
    if (!fontRatio || !(h.drawn?.width > 0)) continue;
    const across = h.page.width / fontRatio / h.drawn.width, gap = h.page.width / fontRatio - h.drawn.width, rise = h.page.height - h.drawn.height;
    const withIt = Math.sign(rise) === Math.sign(gap) && Math.abs(rise) >= 0.5 && Math.abs(h.page.height - h.drawn.height * across) <= 1.5;
    if (Math.abs(across - 1) >= 0.1 && Math.abs(gap) >= 6 && withIt) {
      add(h.label, "type", "as drawn", `${sized(across)}, by its width against the frame's font and its ink height (${round(h.drawn.height)} → ${round(h.page.height)} px): a size of another class; set the size the frame draws, or, if this is the kit's class for the role, propose it`, { delta: Math.round((across - 1) * 100) });
    }
  }
  // A spec that states no font size (an MCP outline without its design context) leaves the type's size unchecked.
  const typeUnchecked = !boxesSpec && spec.landmarks.some((l) => l.text) && !spec.landmarks.some((l) => Number.isFinite(Number(l.font?.size)));
  // Named boxes from an image: the page's texts are as much wider as its font is. One wider beyond that is a larger
  // size or more text: a finding a font cannot excuse.
  if (boxesSpec && fontRatio) {
    const texts = placed.filter((p) => p.l.text && p.l.box.width > 0), ratio = fontRatio;
    for (const p of texts) {
      // Only wider: a design piece can hold an icon beside its text that the page's text box does not.
      const extra = p.m.box.width / ratio - p.l.box.width;
      if (extra > Math.max(8, 0.15 * p.l.box.width)) add(p.label, "width", Math.round(p.l.box.width), `${Math.round(extra)} px wider than the font explains: a larger size or more text`);
    }
  }
  // A gap the design sets between two neighbours, side by side or one above the other, that closes up: the pieces
  // nearly touch, whatever their edges keep. A piece already past the band names its own cause.
  // A drift carried from the pieces before is a note, not a cause: it does not hide a gap that closes after it.
  for (const [axis, pos, size, cross, crossSize, word] of [["x", "x", "width", "y", "height", "after"], ["y", "y", "height", "x", "width", "below"]]) {
    const drift = (i) => Math.abs(i.own ?? Infinity) <= band && Math.abs(i.delta ?? 0) <= 2 * band;
    const past = (q) => issues.some((i) => i.landmark === q.label && i.property === axis && Math.abs(i.delta ?? 0) > band && !drift(i));
    for (const p of placed) {
      const next = placed.filter((q) => q !== p && q.l.box[pos] >= p.l.box[pos] + p.l.box[size] - 1
        && Math.min(p.l.box[cross] + p.l.box[crossSize], q.l.box[cross] + q.l.box[crossSize]) - Math.max(p.l.box[cross], q.l.box[cross]) >= 0.5 * Math.min(p.l.box[crossSize], q.l.box[crossSize]))
        .sort((a, b) => a.l.box[pos] - b.l.box[pos])[0];
      if (!next || past(p) || past(next)) continue;
      const dGap = next.l.box[pos] - (p.l.box[pos] + p.l.box[size]), mGap = next.m.box[pos] - (p.m.box[pos] + p.m.box[size]);
      if (dGap >= 8 && mGap < Math.min(4, dGap / 2)) add(next.label, axis, `a ${Math.round(dGap)} px gap ${word} “${p.label}”`, `${Math.round(mGap)} px: they nearly touch; keep the design's gap`, { delta: mGap - dGap, gap: true });
    }
  }
  // What the design stacks on one left edge (a column's lines, a value under its label) stays on one edge.
  {
    const texts = placed.filter((p) => p.l.text);
    const seenPair = new Set();
    for (const p of texts) for (const q of texts) {
      if (p === q || seenPair.has(`${q.index}:${p.index}`)) continue;
      // One directly under the other, a line or so apart: a column's lines, not two texts that happen to share an x.
      const [hi, lo] = p.l.box.y <= q.l.box.y ? [p, q] : [q, p];
      const gap = lo.l.box.y - (hi.l.box.y + hi.l.box.height);
      const stacked = Math.abs(p.l.box.x - q.l.box.x) <= 1 && gap >= -1 && gap <= 1.5 * Math.max(p.l.box.height, q.l.box.height);
      if (!stacked) continue;
      seenPair.add(`${p.index}:${q.index}`);
      const apart = Math.abs(p.m.box.x - q.m.box.x);
      if (apart > tolerance) add(`${q.label} under ${p.label}`, "align", 0, apart, { actual: `left edges ${Math.round(apart)} px apart; the design stacks them on one` });
    }
  }
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
    else add("root", "height", spec.frame.height, measured.root.height, { status, ledger: entries[0]?.id ?? entries[0]?.reason, entries: entries.map((x) => ledger.indexOf(x)) });
  }
  // An area that moved with a text is that text's finding already, excused or not with it.
  for (const r of regions.filter((x) => !x.movedWith)) {
    add(`region near “${r.near}”`, "region", "as designed", `${r.box.width}×${r.box.height} px at ${r.box.x}, ${r.box.y} differs`, { box: r.box, area: r.area });
  }
  const all = issues.map((i) => (i.status ? i : classify(i, frame, ledger)));
  // Page text the spec does not have: the spec may lack it (an MCP outline without an instance's texts) or the page may
  // be wrong. Either way the frame was not measured in full: one line lists them, and the frame is incomplete.
  const extra = (i) => i.expected === "absent" && i.status === "fail";
  const unexpected = all.filter(extra).map((i) => i.landmark);
  // Named boxes: a moderate offset the system explains is a note, for the owner to see, not a finding to excuse.
  // Within the band an offset is a note, whether or not the ledger proposes it: it needs no decision.
  // A drift is a note too: carried from the pieces before it (a wider font, the kit's token) up to twice the band,
  // while its own step stays within it. A piece that moves by itself past the band, or a drift past twice it, is not.
  // The second tier: what the system or a font explains, or pixels alone, is a note, never a finding: an offset within
  // the band or a drift within twice it; a pixel region (a stand-in icon, a rendering); a text wider or narrower than
  // drawn (the type's size is its own finding); a height within twice the band; a column's lines within the band.
  const note = (i) => ["fail", "pending"].includes(i.status) && !i.gap && (
    (["x", "y"].includes(i.property) && (Math.abs(i.delta ?? 0) <= band || (Math.abs(i.own ?? Infinity) <= band && Math.abs(i.delta ?? 0) <= 2 * band)))
    || i.property === "region" || (i.property === "width" && i.landmark !== "root")
    || (i.property === "height" && Math.abs(i.delta ?? 0) <= 2 * band)
    || (i.property === "align" && Math.abs(i.delta ?? 0) <= band));
  const notes = all.filter((i) => !extra(i) && note(i));
  const classified = all.filter((i) => !extra(i) && !note(i));
  const failing = classified.filter((i) => i.status === "fail");
  // The score counts what is not settled: a failure, and a proposal still awaiting the owner. Turning a failure into
  // a proposal is no progress.
  const open = classified.filter((i) => i.status !== "accepted");
  // An image-only reference leaves its texts to the eye. A missing font is reported, not used to hide findings.
  const imageOnly = isImageOnly(spec), fonts = measured.fonts ?? [];
  // A transcription that leaves ink out of every box has not named the whole frame.
  const notNamed = measured.uncovered ?? [];
  // When most of the design's texts are missing, the page renders other data than the frame: its offsets mean nothing.
  const texts = spec.landmarks.filter((l) => l.text).length;
  const missing = classified.filter((i) => i.property === "presence" && i.actual === "missing" && i.status === "fail").length;
  const otherData = texts >= 3 && missing * 2 > texts ? `${missing} of ${texts} design texts are missing: the page likely renders other data than this frame; render the frame's own data` : undefined;
  const verdict = failing.length ? "fail" : imageOnly || missingReference || unexpected.length || notNamed.length ? "incomplete"
    : classified.some((i) => i.status === "pending") ? "pending" : "pass";
  return {
    frame, pass: verdict === "pass", verdict, otherData, imageOnly, ...(typeUnchecked ? { typeUnchecked } : {}), ...(spec.source === "page snapshot" ? { snapshot: true } : {}), ...(notNamed.length ? { uncovered: notNamed } : {}), ...(measured.skipped?.length ? { skipped: measured.skipped } : {}),
    ...(typeRatio ? { type: { ratio: round(typeRatio), heights: heights.map(({ drawn, page, ...h }) => ({ ...h, ratio: round(h.ratio) })) } } : {}),
    // A region has no size of its own to give, only its place.
    ...(notes.length ? { notes: notes.map((i) => ({ landmark: i.landmark, property: i.property, ...(i.delta === undefined ? {} : { delta: round(i.delta) }), ...(i.box ? { box: i.box } : {}) })), band } : {}), missingReference, fontsMissing: fonts, issues: classified, unexpected, causes: steps,
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
    let beside = p.align === "center" ? undefined : placed.filter((q) => q !== p && overlapY(q.l.box, b) && (rightward ? q.l.box.x >= right(p) - 1 : right(q) <= b.x + 1))
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
    // A line the design stacks under another on the same left edge (a column's second line) follows that column,
    // when that reads a smaller step than its row or the root.
    if (above && p.align !== "center" && Math.abs(above.l.box.x - b.x) <= 1) {
      const columnStep = (p.m.box.x - b.x) - (above.m.box.x - above.l.box.x);
      if (Math.abs(columnStep) < Math.abs(stepX)) { stepX = columnStep; viaX = null; beside = above; }
    }
    p.side = beside ? { index: beside.index, term: viaX ? "width" : null, sign: rightward && beside !== above ? -1 : 1 } : null;
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
// ------------------------------------------------------------------ ink, for a reference that is an image alone

// What a capture shows, as pieces of ink a person reads one by one, and the boxes they sit on.
// - Ink is a pixel far from the paper (the commonest luminance), neutral or coloured; the two kinds never join, so a
//   coloured icon stays apart from its grey label.
// - A large filled shape (a button, a pill, a dark card, a photo) is a box, not ink: compared by place and size, and
//   what is drawn on it is found as the holes in it. A photo (uneven inside) is not read inside.
// - An outline around other ink (a bordered button) is a box too; what is inside joins only with itself.
// - Glyphs join into runs (a value, a label, an icon with its text) when closer than the taller one's height side by
//   side, a dot or accent just above or below, or a pixel apart. A thin rule across most of the capture is not ink.
// `img` is { lum, chroma, W, H }: one byte each per pixel. Boxes come back in CSS px.
export function inkRuns(img, { scale = 1, contrast = 56, join = 1 } = {}) {
  const { lum, chroma, W, H } = img;
  const hist = new Uint32Array(256);
  for (let i = 0; i < W * H; i++) hist[lum[i]]++;
  let paper = 0;
  for (let v = 1; v < 256; v++) if (hist[v] > hist[paper]) paper = v;
  const kind = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const d = Math.abs(lum[i] - paper);
    kind[i] = chroma && chroma[i] > 48 && d > 24 ? 2 : d > contrast ? 1 : 0;
  }
  const label = new Int32Array(W * H).fill(-1), stack = new Int32Array(W * H);
  const comps = [];
  const flood = (seed, test, id) => {
    let top = 0, x0 = W, y0 = H, x1 = 0, y1 = 0, n = 0, sum = 0, sum2 = 0;
    stack[top++] = seed; label[seed] = id;
    while (top) {
      const p = stack[--top], x = p % W, y = (p - x) / W;
      n++; sum += lum[p]; sum2 += lum[p] * lum[p];
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const q = yy * W + xx;
        if (label[q] === -1 && test(q, p)) { label[q] = id; stack[top++] = q; }
      }
    }
    return { x0, y0, x1: x1 + 1, y1: y1 + 1, n, mean: sum / n, sd: Math.sqrt(Math.max(0, sum2 / n - (sum / n) ** 2)) };
  };
  // A component is one kind of ink of like luminance: grey text on a dark card is not part of the card.
  for (let s = 0; s < W * H; s++) {
    if (!kind[s] || label[s] !== -1) continue;
    const k = kind[s], id = comps.length;
    comps.push({ ...flood(s, (q, p) => kind[q] === k && Math.abs(lum[q] - lum[p]) < 64, id), kind: k, id });
  }
  const boxes = [], parts = [];
  const encloses = (a, b) => a !== b && b.x0 >= a.x0 && b.y0 >= a.y0 && b.x1 <= a.x1 && b.y1 <= a.y1;
  for (const c of comps) {
    const w = c.x1 - c.x0, h = c.y1 - c.y0, density = c.n / (w * h);
    if (w > W * 0.4 && h <= 3 * scale) continue; // a rule
    if (w > W * 0.8 && h > H * 0.5 && density < 0.5) continue; // the root's own outline
    const filled = density >= 0.5 && (h >= 32 * scale || (w >= 1.5 * h && h >= 14 * scale));
    if (filled) { c.box = c.sd > 35 ? "image" : "surface"; boxes.push(c); continue; }
    if (Math.min(w, h) >= 20 * scale && comps.some((o) => encloses(c, o))) { c.box = "outline"; boxes.push(c); continue; }
    parts.push(c);
  }
  // What is drawn on a plain surface: its holes, the pixels inside it not reached from its edge around it.
  for (const b of boxes.filter((x) => x.box === "surface")) {
    const inside = (q) => { const x = q % W, y = (q - x) / W; return x >= b.x0 && x < b.x1 && y >= b.y0 && y < b.y1; };
    const outer = -2 - b.id;
    for (let x = b.x0; x < b.x1; x++) for (const y of [b.y0, b.y1 - 1]) { const q = y * W + x; if (label[q] !== b.id && label[q] !== outer) flood(q, (r) => inside(r) && label[r] !== b.id, outer); }
    for (let y = b.y0; y < b.y1; y++) for (const x of [b.x0, b.x1 - 1]) { const q = y * W + x; if (label[q] !== b.id && label[q] !== outer) flood(q, (r) => inside(r) && label[r] !== b.id, outer); }
    for (let y = b.y0 + 1; y < b.y1 - 1; y++) for (let x = b.x0 + 1; x < b.x1 - 1; x++) {
      const q = y * W + x;
      if (label[q] === b.id || label[q] === outer || label[q] <= -1000) continue;
      const hole = flood(q, (r) => inside(r) && label[r] !== b.id && label[r] !== outer && label[r] > -1000, -1000 - q);
      parts.push({ ...hole, kind: 3, parent: b.id });
    }
  }
  // Inside a surface, ink of its own kind is the surface showing through a letter (the inside of an "o"), not a piece.
  const surfaces = boxes.filter((x) => x.box === "surface");
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    const small = (p.x1 - p.x0) * (p.y1 - p.y0) <= 16 * scale * scale;
    if (p.parent === undefined && surfaces.some((b) => encloses(b, p) && b.kind === p.kind && (small || Math.abs(b.mean - p.mean) < 40))) parts.splice(i, 1);
  }
  // Ink inside an outline belongs to it.
  for (const o of boxes.filter((x) => x.box === "outline")) for (const p of parts) if (p.parent === undefined && encloses(o, p)) p.parent = o.id;
  const parent = parts.map((_, i) => i);
  const find = (i) => { while (parent[i] !== i) i = parent[i] = parent[parent[i]]; return i; };
  for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
    const a = parts[i], b = parts[j];
    if (a.kind !== b.kind || a.parent !== b.parent) continue;
    const ha = a.y1 - a.y0, hb = b.y1 - b.y0, h = Math.max(ha, hb);
    const gx = Math.max(0, b.x0 - a.x1, a.x0 - b.x1), gy = Math.max(0, b.y0 - a.y1, a.y0 - b.y1);
    const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0), ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
    const side = oy >= 0.3 * Math.min(ha, hb) && gx <= Math.max(2 * scale, join * h);
    const accent = ox > 0 && gy <= 0.35 * h && Math.min(ha, hb) <= 0.5 * h;
    // Antialiasing breaks a thin ring or stroke into pieces a pixel apart.
    const touching = gx <= scale && gy <= scale;
    if (side || accent || touching) parent[find(i)] = find(j);
  }
  const groups = new Map();
  parts.forEach((b, i) => {
    const r = find(i), cur = groups.get(r);
    groups.set(r, cur ? { ...cur, x0: Math.min(cur.x0, b.x0), y0: Math.min(cur.y0, b.y0), x1: Math.max(cur.x1, b.x1), y1: Math.max(cur.y1, b.y1) } : { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1, kind: b.kind });
  });
  const css = (b) => ({ x: b.x0 / scale, y: b.y0 / scale, width: (b.x1 - b.x0) / scale, height: (b.y1 - b.y0) / scale });
  const runs = [...groups.values()].map((b) => ({ ...css(b), kind: b.kind === 2 ? "colour" : "ink" }))
    // A speck, or a pixel-wide sliver of a box's edge or shadow, is not a piece anyone reads.
    .filter((b) => b.width * b.height >= 9 && !(b.width <= 1.5 && b.height <= 12))
    .sort((a, b) => a.y - b.y || a.x - b.x);
  return { runs, boxes: boxes.map((b) => ({ ...css(b), kind: b.box, mean: Math.round(b.mean) })).sort((a, b) => a.y - b.y || a.x - b.x) };
}

// The ink inside a box of a capture: the glyph-tight box of what is drawn there, against the box's own background
// (its commonest luminance). A box from the DOM is a line box; a named box from an image is tight to its ink; this
// makes the page's comparable.
export function tightBox(img, box, scale = 1, { contrast = 40, against, colour } = {}) {
  const { lum, W, H } = img;
  const x0 = Math.max(0, Math.floor(box.x * scale)), y0 = Math.max(0, Math.floor(box.y * scale));
  const x1 = Math.min(W, Math.ceil((box.x + box.width) * scale)), y1 = Math.min(H, Math.ceil((box.y + box.height) * scale));
  if (x1 <= x0 || y1 <= y0) return box;
  const hist = new Uint32Array(256);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) hist[lum[y * W + x]]++;
  let bg = 0;
  for (let v = 1; v < 256; v++) if (hist[v] > hist[bg]) bg = v;
  if (against !== undefined) bg = against;
  // A text's ink is near its own colour, so a shape's corner or the paper around a pill is not taken for it.
  const ink = (v) => Math.abs(v - bg) > contrast && (colour === undefined || Math.abs(v - colour) <= 64);
  let a = x1, b = y1, c = x0 - 1, d = y0 - 1;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (ink(lum[y * W + x])) {
    if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > d) d = y;
  }
  return c < a ? box : { x: a / scale, y: b / scale, width: (c - a + 1) / scale, height: (d - b + 1) / scale };
}

// Ink of a reference that no named box covers: what the transcription left out.
export function uncovered(ink, landmarks) {
  const overlap = (a, b) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const centreIn = (r, b) => { const cx = r.x + r.width / 2, cy = r.y + r.height / 2; return cx >= b.x - 1 && cx <= b.x + b.width + 1 && cy >= b.y - 1 && cy <= b.y + b.height + 1; };
  return [...ink.runs, ...ink.boxes].filter((r) => !landmarks.some((l) => l.box && (centreIn(r, l.box) || overlap(r, l.box) >= 0.5 * r.width * r.height)));
}

export function sweepIssues(probes, ledger = [], extra = []) {
  const byKey = new Map();
  for (const p of probes) for (const raw of p.issues) {
    const issue = classify(raw, "sweep", ledger);
    const k = `${issue.property}\u0000${issue.landmark}\u0000${issue.status}\u0000${issue.kind ?? ""}`;
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
  // A width measured a pixel either side (a predicted switch) is held to two pixels; another to one step.
  const probed = new Set(probes.map((p) => p.width));
  const near = (s, [lo, hi]) => {
    const tol = probed.has(s - 1) && probed.has(s + 1) ? 2 : step;
    return s >= lo - tol && s <= hi + tol;
  };
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
export const totalScore = (frames, sweep, journeys = []) => frames.some((f) => f.unmeasured) || sweep?.reason || sweep?.stories?.some((st) => st.unmeasured) ? null
  : round(frames.reduce((s, f) => s + f.score, 0) + (sweep?.score ?? 0) + journeys.filter((j) => !j.pass && j.status !== "accepted").length * 10);
const counts = (frames, sweep) => {
  const all = [...frames.flatMap((f) => f.issues), ...(sweep?.issues ?? [])];
  return (s) => all.filter((i) => i.status === s).length;
};
// Root first, then in the design's order: the root is fixed before what is inside it.
const ordered = (issues) => [...issues.filter((i) => i.landmark === "root"), ...issues.filter((i) => i.landmark !== "root")];
const verdictOf = (f) => f.verdict ?? (f.pass ? "pass" : "fail");
// One wording for an image-only frame, wherever it is reported.
const imageOnlyNote = () => "image-only reference: nothing in it is named, so nothing is measured; name its boxes with `design.mjs boxes`";
const uncoveredNote = (f) => `${f.uncovered.length} pieces of the design's ink are in no named box, from ${f.uncovered.slice(0, 3).map((b) => `${Math.round(b.x)}, ${Math.round(b.y)}`).join("; ")}: name them, or the frame is not fully compared`;
const listed = (texts, limit = 8) => `${texts.slice(0, limit).map((t) => `“${t}”`).join(", ")}${texts.length > limit ? ` and ${texts.length - limit} more` : ""}`;
const notInDesign = (f) => `page text not in the design (${f.unexpected.length}): ${listed(f.unexpected)}`;
const where = (i) => `${i.landmark}${i.story ? ` (${i.story})` : ""}`;

const journeyLine = (journeys) => `journeys: ${journeys.length ? `${journeys.filter((j) => j.pass).length} of ${journeys.length} hold` : "none defined"}`;
const alignmentName = (group) => group.story ? `${group.selector} (story ${group.story})` : group.selector;
const sweepCoverage = (sweep) => !sweep ? "Width sweep and additional stories were not run." : !sweep.stories?.length ? "No additional stories were swept." : "";
const acceptanceLine = (row) => `${row.item}: ${row.status}${row.reason ? ` (${row.reason})` : ""}${row.result ? ` · reported: ${row.result}` : ""}`;

// The sweep's notes (a construct, a switch), in a line: for the owner's eye, so they are said where findings are.
const sweepNotes = (noted) => `${noted.length} note${noted.length === 1 ? "" : "s"}, not findings: ${noted.slice(0, 4).map((i) => `${i.property} “${i.landmark}”${i.story ? ` (${i.story})` : ""}`).join(", ")}${noted.length > 4 ? `, and ${noted.length - 4} more` : ""}`;
// What a generated condition found: a candidate, not a finding, until legal data reproduces it or review.md names the
// contract's bound that rules it out.
const candidates = (sweep, answered = false) => (sweep?.issues ?? []).filter((i) => i.status === "candidate" && Boolean(i.answer) === answered);
const candidateLine = (open) => `${open.length} candidate${open.length === 1 ? "" : "s"} from the generated conditions, unanswered: ${open.slice(0, 4).map((i) => `${i.property} “${i.landmark}” (${i.story}${i.ranges ? `, ${i.ranges}` : ""})`).join(", ")}${open.length > 4 ? `, and ${open.length - 4} more` : ""}; reproduce each with legal data (a story with a real long value, a supported locale), or name in review.md, under Candidates, the contract's bound that rules it out`;
const typeNote = "type sizes not compared: the spec gives no font sizes (`design.mjs spec … --context` reads them from the design context)";
// The notes a frame keeps, in a line: offsets and drifts with the largest, then what else, by kind.
const noteLine = (f) => {
  const offsets = f.notes.filter((n) => ["x", "y"].includes(n.property)), rest = f.notes.filter((n) => !["x", "y"].includes(n.property));
  const kinds = { region: "pixel regions", width: "texts wider or narrower than drawn", height: "heights", align: "column edges" };
  const counted = Object.entries(rest.reduce((c, n) => ({ ...c, [n.property]: (c[n.property] ?? 0) + 1 }), {})).map(([k, v]) => `${v} ${kinds[k] ?? k}`);
  return [offsets.length && `${offsets.length} offsets of ${f.band} px or less, or drifts to ${2 * f.band} carried from the pieces before, at most ${Math.max(...offsets.map((n) => Math.abs(n.delta)))} px`, ...counted].filter(Boolean).join("; ");
};

export function renderReport({ frames = [], sweep, journeys = [], gaps = [], acceptance = [], ledgerProblems = [], round: n, status, missingReferences = [] }) {
  const count = counts(frames, sweep);
  const out = ["# Design check", "",
    `${n ? `Round ${n} · ` : ""}frames: ${frames.filter((f) => f.pass).length} of ${frames.length} pass${sweep ? ` · sweep: ${verdictOf(sweep)}` : ""}`
    + ` · ${journeyLine(journeys)} · accepted: ${count("accepted")} · pending: ${count("pending")} · score: ${totalScore(frames, sweep, journeys) ?? "unmeasured"} (lower is better)`, ""];
  if (status) out.push(`Verdict: ${status}`, "");
  if (sweepCoverage(sweep)) out.push(sweepCoverage(sweep), "");
  for (const row of acceptance.filter((r) => ["fail", "pending"].includes(r.status))) out.push(`Acceptance: ${acceptanceLine(row)}`, "");
  for (const g of gaps) out.push(`Not checked: ${g}.`, "");
  if (missingReferences.length) out.push(`Reference image not measured: ${missingReferences.join(", ")}`, "");
  for (const p of ledgerProblems) out.push(`- Ledger: ${p}`);
  if (ledgerProblems.length) out.push("");
  for (const f of frames) {
    out.push(`## ${f.frame} — ${verdictOf(f)}`, "");
    if (f.imageOnly) out.push(`${imageOnlyNote(f)}.`, "");
    if (f.uncovered) out.push(`${uncoveredNote(f)}.`, "");
    if (f.fontsMissing?.length) out.push(`Fonts not available: ${f.fontsMissing.join(", ")}. Their texts render in a fallback: load them before trusting the text findings.`, "");
    const { spec, page } = f.root;
    if (!page) { out.push(f.unmeasured, ""); continue; }
    out.push(`Root: page ${round(page.width)} × ${round(page.height)}, design ${spec.width} × ${spec.height}.`);

    // Where to start fixing: only for a frame with a finding, never for notes alone.
    const shown = openCauses(f);
    if (shown.length) out.push(`Start here: ${sayCause(shown[0])}.`);
    if (shown.length > 1) out.push(`Then: ${shown.slice(1, 7).map(sayCause).join("; ")}${shown.length > 7 ? `; and ${shown.length - 7} more` : ""}.`);
    if (f.typeUnchecked) out.push(`${typeNote[0].toUpperCase()}${typeNote.slice(1)}.`);
    if (f.notes) out.push(`Notes, the system's and not findings: ${noteLine(f)}. ${f.notes.filter((n) => n.delta !== undefined).map((n) => `${n.landmark} ${n.property} ${n.delta > 0 ? "+" : ""}${n.delta}`).join(", ")}.`);
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
    for (const u of sweep.unmeasured ?? []) out.push(`Not measured: the alignment group ${cell(alignmentName(u))} matched at most ${u.matched} across the sweep. It needs two or more.`, "");
    if (sweep.generate === false) out.push("Generated conditions: not run (sweep.generate is false).", "");
    for (const u of sweep.partial ?? []) out.push(`The alignment group ${cell(alignmentName(u))} had fewer than two matches at ${u.ranges} px during the sweep. The other samples were measured.`, "");
    if (sweep.issues.length) {
      out.push("| Problem | Where | Widths | Detail | Status |", "|---|---|---|---|---|");
      for (const i of sweep.issues) out.push(`| ${i.property} | ${cell(where(i))} | ${i.ranges} | ${cell(i.actual)} | ${i.status}${i.ledger ? ` (${cell(i.ledger)})` : ""} |`);
      out.push("");
    }
  }
  return out.join("\n");
}

// Each finding by what it is about, not by its size: a frame's landmark and property, a sweep's story, landmark and
// property, a failing journey, a failing acceptance row. Two rounds that share a key share that finding; the first key
// is the finding a round would be fixed from first.
export function findingKeys({ frames = [], sweep, journeys = [], acceptance = [] }) {
  const keys = new Map();
  for (const f of frames) for (const i of ordered(f.issues.filter((x) => x.status === "fail"))) keys.set(`${f.frame}\u0000${i.landmark}\u0000${i.property}`, `${f.frame}: ${i.landmark} ${i.property}`);
  for (const i of (sweep?.issues ?? []).filter((x) => x.status === "fail")) keys.set(`sweep\u0000${i.story ?? ""}\u0000${i.landmark}\u0000${i.property}\u0000${i.kind ?? ""}`, `${i.property} ${where(i)}`);
  for (const j of journeys.filter((x) => !x.pass && !x.status)) keys.set(`journey\u0000${j.name}`, `journey ${j.name}`);
  for (const r of acceptance.filter((x) => x.status === "fail")) keys.set(`acceptance\u0000${r.item}`, `acceptance “${r.item}”`);
  return keys;
}

// Where to start in a frame that fails: its first step of its own that the ledger has not settled. A step proposed or
// accepted (the row a missing line moves up) waits on the owner, so leading with it would send the builder back to it
// every round; the findings it explains are counted as awaiting a decision instead.
export function startCause(f) { return openCauses(f)[0] ?? null; }
function openCauses(f) {
  const issues = f.issues ?? [];
  if (!issues.some((i) => i.status === "fail")) return [];
  const settled = (c) => {
    const landmark = c.index === "root" ? "root" : c.before, property = c.axis === "size" ? c.kind : c.index === "root" ? "width" : c.axis;
    const own = issues.filter((i) => i.landmark === landmark && i.property === property);
    return own.length > 0 && own.every((i) => i.status === "pending" || i.status === "accepted");
  };
  return (f.causes ?? []).filter((c) => !c.repeat && !settled(c));
}

// How many rounds in a row, this one included, have had the same first finding. A finding is named by its key, which
// neither a quick round nor a change of the specs alters, so the count runs across modes and series alike.
export function firstStreak(history, first) {
  if (!first) return 0;
  let n = 1;
  for (let i = history.length - 1; i >= 0 && history[i]?.first === first; i--) n++;
  return n;
}

// What the verdict line adds when re-running has stopped telling the builder anything: on a complete round, two rounds
// without a new lowest score or a first finding unchanged for three, stop; on a partial round, the same first finding
// for three rounds asks for a decision, since a quick round is for tuning and not for evidence.
export function rerunNotice({ complete, status, stalled = 0, streak = 0 }) {
  if (status === "pass") return "";
  if (complete && (stalled >= 2 || streak >= 3)) return " — stop re-running: fix it, propose it with a reason, or report the check as blocked";
  if (streak >= 3) return ` — the first finding is unchanged for ${streak} rounds: fix it or propose it`;
  return "";
}

// What the console shows: a digest of at most `limit` lines. First what changed since the last round measured the same
// way, then each frame's verdict with where to start and its new findings first (the rest as a count), the sweep, the
// journeys and what was not checked; the full tables stay in report.md, whose path ends it.
export function renderSummary({ frames = [], sweep, journeys = [], gaps = [], acceptance = [], ledgerProblems = [], round: n, previous, best, restarted = false, quick = false }, { limit = 15, file = "report.md" } = {}) {
  const count = counts(frames, sweep);
  const head = `${n ? `Round ${n}: ` : ""}frames ${frames.filter((f) => f.pass).length} of ${frames.length} pass${sweep ? ` · sweep: ${verdictOf(sweep)}` : ""}`
    + ` · ${quick ? "journeys: not run (--quick)" : journeyLine(journeys)} · accepted: ${count("accepted")} · pending: ${count("pending")} · score: ${totalScore(frames, sweep, journeys) ?? "unmeasured"} (lower is better)`
    + `${previous ? ` · previous round: ${previous.score}` : ""}${best && best.round !== n ? ` · lowest: ${best.score} in round ${best.round}` : ""}`;
  const now = findingKeys({ frames, sweep, journeys, acceptance });
  const before = Array.isArray(previous?.findings) ? new Set(previous.findings) : null;
  const fresh = (k) => !before || !before.has(k);
  const body = [];
  if (restarted) body.push("The specs or the sweep changed: scores start a new series here.");
  if (before) {
    const fixed = previous.findings.filter((k) => !now.has(k)), added = [...now.keys()].filter((k) => !before.has(k));
    // A finding by its key: "frame: landmark property", "property landmark (story)", "journey name", "acceptance “item”".
    const nameOf = (k) => { const [a, b, c, d] = k.split("\u0000"); return a === "sweep" ? `${d} ${c}${b ? ` (${b})` : ""}` : a === "journey" ? `journey ${b}` : a === "acceptance" ? `acceptance “${b}”` : `${a}: ${b} ${c}`; };
    const names = (list) => list.slice(0, 3).map(nameOf).join("; ") + (list.length > 3 ? "; …" : "");
    body.push(`Since round ${previous.round}: ${fixed.length} fixed${fixed.length ? ` (${names(fixed)})` : ""}, ${added.length} new${added.length ? ` (${names(added)})` : ""}, ${now.size - added.length} unchanged.`);
  }
  if (sweepCoverage(sweep)) body.push(sweepCoverage(sweep));
  for (const row of acceptance.filter((r) => ["fail", "pending"].includes(r.status))) body.push(`Acceptance: ${acceptanceLine(row)}`);
  for (const g of gaps) body.push(`Not checked: ${g}.`);
  if (ledgerProblems.length) body.push(`Ledger: ${ledgerProblems.join("; ")}`);
  const say = (i) => `${i.landmark} ${i.property}: ${i.expected} → ${i.actual}${i.delta === undefined ? "" : ` (${signed(round(i.delta))})`}`;
  for (const f of frames) {
    const failing = ordered(f.issues.filter((i) => i.status === "fail"));
    const pending = f.issues.filter((i) => i.status === "pending").length;
    const verdict = failing.length ? `fail, ${failing.length} findings${pending ? `, ${pending} awaiting a decision` : ""}`
      : f.verdict === "incomplete" ? "incomplete" : pending ? `awaiting a decision on ${pending}` : "pass";
    // Where to start, then the findings of its own (not inherited), the new ones first; the unchanged as a count.
    const start = startCause(f);
    const mine = failing.filter((i) => !i.inherited), key = (i) => `${f.frame}\u0000${i.landmark}\u0000${i.property}`;
    const listed = [...mine.filter((i) => fresh(key(i))), ...(before && !mine.some((i) => fresh(key(i))) ? mine.slice(0, 1) : [])].slice(0, 3);
    const unchanged = failing.filter((i) => !fresh(key(i)) && !listed.includes(i)).length;
    const more = failing.length - listed.length - unchanged;
    const parts = [f.unmeasured, f.otherData, start && `start here: ${sayCause(start)}`, ...listed.map(say),
      more > 0 && `… ${more} more`, unchanged && `${unchanged} unchanged`,
      f.fontsMissing?.length && `fonts not available: ${f.fontsMissing.join(", ")}; their texts render in a fallback: load them before trusting the text findings`,
      f.imageOnly && imageOnlyNote(f), f.uncovered && uncoveredNote(f), f.typeUnchecked && typeNote,
      f.notes && `notes, the system's and not findings: ${noteLine(f)}`, f.unexpected?.length && notInDesign(f)].filter(Boolean);
    body.push(`${f.frame}: ${verdict}${f.pixels ? `, ${round(f.pixels.ratio * 100)} % pixels differ` : ""}${parts.length ? `; ${parts.join("; ")}` : ""}`);
  }
  if (sweep) {
    const failing = sweep.issues.filter((i) => i.status === "fail"), noted = sweep.issues.filter((i) => i.status === "note"), open = candidates(sweep);
    const skey = (i) => `sweep\u0000${i.story ?? ""}\u0000${i.landmark}\u0000${i.property}\u0000${i.kind ?? ""}`;
    const listed = [...failing.filter((i) => fresh(skey(i))), ...(before && !failing.some((i) => fresh(skey(i))) ? failing.slice(0, 1) : [])].slice(0, 3);
    const unchanged = failing.filter((i) => !fresh(skey(i)) && !listed.includes(i)).length, more = failing.length - listed.length - unchanged;
    const parts = [...listed.map((i) => `${i.property} ${where(i)}${i.ranges ? ` at ${i.ranges}` : ""}: ${i.actual}`), more > 0 && `… ${more} more`,
      unchanged && `${unchanged} unchanged`, noted.length && sweepNotes(noted), open.length && candidateLine(open),
      ...(sweep.unmeasured ?? []).map((u) => `not measured: ${alignmentName(u)} matched at most ${u.matched} across the sweep; an alignment needs two or more`),
      ...(sweep.partial ?? []).map((u) => `${alignmentName(u)} matched fewer than two at ${u.ranges}: measured where it had two or more`)].filter(Boolean);
    body.push(`sweep ${sweep.from}–${sweep.to}: ${verdictOf(sweep)} · ${sweep.reason ?? `layout changes between ${sweep.switches.length ? sweep.switches.join(", ") : "no widths"}`}${parts.length ? `; ${parts.join("; ")}` : ""}`);
  }
  const broken = journeys.filter((x) => !x.pass);
  if (broken.length) body.push(broken.map((j) => `journey ${j.status ? `disputed with the check (${j.status})` : "fails"}: ${j.name}: ${j.failed}`).join("; "));
  // At most `limit` lines with the head and the path: what does not fit is in the report.
  const room = Math.max(1, limit - 2);
  const kept = body.length > room ? [...body.slice(0, room - 1), `… ${body.length - room + 1} more lines in ${file}`] : body;
  return [head, ...kept, `Full tables: ${file}`].join("\n");
}

// ------------------------------------------------------------------ gallery

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// One self-contained page for a full check: for every frame the design, the page before the work began, the page
// now and their difference, at the frame's CSS size, with the frame's verdict and where to start; then the sweep's
// verdict and every ledger entry with its reason, who decided and the options.
// images: { design, before, after, diff } as data URLs, any of them absent.
// The evidence a handoff quotes, written by a check of every frame: each line is what was run and what it gave, what
// the ledger excused, and what the script did not check, so a claim beyond this file has to name its own evidence.
export function renderHandoff({ frames = [], sweep, journeys = [], journeySpecs = [], gaps = [], ledger = [], ledgerProblems = [], acceptance = [],
  pictures = [], round: n, status, score, stamp = "", model }) {
  const fails = (issues) => issues.filter((i) => i.status === "fail");
  const excused = (issues) => issues.filter((i) => i.status === "accepted").length;
  const say = (i) => `${where(i)} ${i.property}: ${i.expected === undefined ? "" : `${i.expected} → `}${i.actual}${i.delta === undefined ? "" : ` (${signed(round(i.delta))})`}${i.ranges ? ` at ${i.ranges}` : ""}`;
  const count = (issues) => {
    const failing = fails(issues), ok = excused(issues), noted = issues.filter((i) => i.status === "note");
    const cand = issues.filter((i) => i.status === "candidate"), open = cand.filter((i) => !i.answer);
    const head = failing.length ? `${failing.length} finding${failing.length === 1 ? "" : "s"}; first: ${say(ordered(failing)[0])}` : "no findings";
    return `${head}${ok ? `; ${ok} excused by the ledger` : ""}${noted.length ? `; ${sweepNotes(noted)}` : ""}${cand.length ? `; ${cand.length} candidate${cand.length === 1 ? "" : "s"}, ${open.length} unanswered` : ""}`;
  };
  const handoverState = { pass: "done", pending: "proposals wait for the owner: hand over, naming each",
    incomplete: "only with a named blocker and the attempt made", fail: "not a state to hand over in: fix the first cause and check again" }[status] ?? "";
  // An excuse should be narrower than what it excuses: an entry that covers many findings is named first.
  const covered = [...frames.flatMap((f) => f.issues), ...(sweep?.issues ?? [])];
  // Entries giving one cause are counted together: splitting a broad excuse into several does not hide it.
  const causesOf = new Map();
  ledger.forEach((e, index) => {
    const k = `${e.category}\u0000${String(e.reason ?? "").trim().toLowerCase()}`;
    if (!causesOf.has(k)) causesOf.set(k, { e, entries: [] });
    causesOf.get(k).entries.push(index);
  });
  const coveredBy = (entries) => covered.filter((i) => i.entries?.some((x) => entries.includes(x)));
  const broad = [...causesOf.values()].map(({ e, entries }) => [e, entries, coveredBy(entries)]).filter(([, , found]) => found.length > 3)
    .map(([e, entries, found]) => {
      const gaps = found.filter((i) => i.gap || i.box).length;
      return `- ${entries.length > 1 ? `${entries.length} entries with one cause cover` : "one entry covers"} ${found.length} findings: ${entries.length > 1 ? "" : `${[].concat(e.landmark ?? `region ${e.region}`).join(", ")} ${e.property} — `}${e.reason} (${[e.category, e.status].filter(Boolean).join(", ")}).${gaps ? ` ${gaps} of them are gaps or box sizes, which a font does not change.` : ""} Check that each finding it covers has that cause.`;
    });
  const out = [`Status: ${status} — ${handoverState}`, "", "# Evidence for the handoff", "", `Round ${n} · verdict: ${status} · score: ${score ?? "unmeasured"} (lower is better)${stamp ? ` · ${stamp}` : ""}`, "",
    "Quote these lines in the handoff. A claim beyond them names its own evidence (a command and its output, a picture),",
    "or goes under what was not checked.", "", ...(broad.length ? ["## Broad excuses", "", ...broad, ""] : []), "## Pictures to look at first", "",
    "Compare the reference and final captures at the same state and width. Record any visible differences. For Before/After, confirm the rendered data and theme even when capture settings match.", ""];
  for (const p of pictures) out.push(`- ${p}`);
  out.push("", "## Frames", "");
  for (const f of frames) {
    const pending = f.issues.filter((i) => i.status === "pending").length;
    const detail = f.unmeasured ?? [count(f.issues), pending && `${pending} awaiting your decision`, f.imageOnly && imageOnlyNote(f), f.uncovered && uncoveredNote(f), f.skipped && `skipped pieces: ${f.skipped.join("; ")}`,
      f.notes && `notes, the system's and not findings: ${noteLine(f)}`, f.typeUnchecked && typeNote,
      f.otherData, f.missingReference && "no reference image: pixels not compared", f.fontsMissing?.length && `fonts not available: ${f.fontsMissing.join(", ")}`,
      f.unexpected?.length && notInDesign(f)].filter(Boolean).join("; ");
    out.push(`- ${f.frame}: ${verdictOf(f)} — ${detail}`);
    if (f.beforeComparison) out.push(`  Before: ${f.beforeComparison}.`);
    if (f.snapshot) out.push("  Its spec is a snapshot of the page (`design.mjs snapshot`): outside a review it compares the page with itself, not with a design.");
  }
  out.push("", "## Widths and stories", "");
  if (sweepCoverage(sweep)) out.push(`- ${sweepCoverage(sweep)}`);
  if (sweep) {
    out.push(`- the frames' page, ${sweep.from}–${sweep.to} px: ${sweep.reason ?? count(sweep.issues.filter((i) => !i.story))}`);
    for (const u of sweep.unmeasured ?? []) out.push(`- alignment ${alignmentName(u)}, ${u.edge} edge: not measured at ${u.ranges} px (fewer than two elements)`);
    for (const l of sweep.lines ?? []) out.push(`- line ${l.name}: ${l.widths ? `measured at ${l.widths} widths over the page and its stories` : "never measured"}`);
    if (model) {
      out.push(`- layout model: ${model.rows ? `${model.rows} ${model.rows === 1 ? "row" : "rows"} in review.md, first seen in round ${model.firstRound ?? "?"} (round 1 is the baseline check, before the first edit)` : "none in review.md"}`);
      out.push(`- predicted switches: ${model.predicted.length ? model.predicted.join(", ") : "none"}; measured layout changes: ${model.measured.length ? model.measured.join(", ") : "none"}`);
    }
    for (const u of sweep.partial ?? []) out.push(`- alignment ${alignmentName(u)}, ${u.edge} edge: fewer than two elements at ${u.ranges} px, measured in the other samples`);
    for (const st of sweep.stories ?? []) out.push(`- story ${st.name}: ${st.unmeasured ?? count(sweep.issues.filter((i) => i.story === st.name))}${st.longest?.length ? `; its longest texts: ${st.longest.map((t) => `“${t}”`).join(", ")}` : ""}`);
  }
  const generated = (sweep?.issues ?? []).filter((i) => i.status === "candidate");
  if (generated.length) {
    out.push("", "## Candidates from the generated conditions", "",
      "A collision found only under longer texts or doubled entries is not a finding until legal data reproduces it (then the story's own finding counts); until then it is answered in review.md, under Candidates, by the contract's bound that rules it out.", "");
    for (const i of generated) out.push(`- ${i.answer ? "answered" : "unanswered"}: ${say(i)}${i.answer ? ` — ${i.answer}` : ""}`);
  }
  const constructs = (sweep?.issues ?? []).filter((i) => i.property === "construct");
  if (constructs.length) {
    out.push("", "## Constructs", "", "A construct is a note that needs its reason: fix it, or give the reason in the handoff.", "");
    for (const i of constructs) out.push(`- ${say(i)}`);
  }
  out.push("", "## Journeys", "");
  if (!journeys.length) out.push("- none defined");
  else out.push("Each journey covers its configured page and the widths listed for that run.");
  if (journeys.some((j) => j.closed?.length)) out.push("An open–action–hidden sequence records the order observed. A timer or another event can also hide the content.");
  for (const j of journeys) {
    const spec = journeySpecs.find((x) => x.name === j.name) ?? { steps: [] };
    const how = [spec.touch && "touch", j.widths?.length && `${j.widths.join(" → ")} px`].filter(Boolean).join(", ");
    const opensOnly = spec.steps.some((st) => "visible" in st) && !spec.steps.some((st) => "hidden" in st);
    const notes = [opensOnly && "checks opening only, not closing", ...(j.notes ?? [])].filter(Boolean);
    out.push(`- ${j.name}${how ? ` (${how})` : ""}: ${j.pass ? "holds" : `${j.status ? `disputed with the check (${j.status}), ` : ""}fails at ${j.failed}`}${notes.length ? `; ${notes.join("; ")}` : ""}`);
  }
  out.push("", "## Deviations", "");
  for (const p of ledgerProblems) out.push(`- the ledger is invalid: ${p}`);
  if (!ledger.length) out.push("- none");
  const all = [...frames.flatMap((f) => f.issues), ...(sweep?.issues ?? []), ...journeys.filter((j) => j.entries)];
  const text = (v) => (v && typeof v === "object" ? JSON.stringify(v) : String(v));
  for (const [index, e] of ledger.entries()) {
    const uses = all.filter((i) => i.entries?.includes(index)).length;
    const wildcard = [].concat(e.landmark).includes("*") || e.property === "*";
    const use = !uses ? "matched nothing" : e.status === "accepted" ? `excuses ${uses}` : `awaits your decision on ${uses}`;
    const scope = [e.frame && `frame ${[].concat(e.frame).join(", ")}`, e.category, e.decidedBy && `decided by ${e.decidedBy}`, wildcard && "wildcard", use]
      .filter(Boolean).join(" · ");
    out.push(`- ${e.status}: ${[].concat(e.landmark ?? `region ${e.region}`).join(", ")} ${e.property} — ${e.reason} (${scope})${e.status === "proposed" && e.options ? `; options: ${[].concat(e.options).map(text).join("; ")}` : ""}`);
  }
  // What the builder showed the check itself causes: the owner decides each, with its reproduction in review.md.
  const disputed = ledger.map((e, index) => [e, index]).filter(([e]) => e.cause === "checker");
  if (disputed.length) {
    out.push("", "## Disputed with the check", "");
    for (const [e, index] of disputed) {
      const hit = all.filter((i) => i.entries?.includes(index)).map((i) => i.name ?? where(i));
      out.push(`- ${e.status}: ${[].concat(e.landmark ?? `region ${e.region}`).join(", ")} ${e.property} — ${e.reason}${hit.length ? ` (matches ${hit.join(", ")})` : " (matched nothing)"}`);
    }
  }
  out.push("", "## The acceptance list", "");
  if (!acceptance.length) out.push("- no rows found in review.md");
  for (const a of acceptance) out.push(`- ${acceptanceLine(a)}`);
  out.push("", "## Not checked by the script", "");
  for (const g of gaps) out.push(`- ${g}`);
  if (sweep?.generate === false) out.push("- the generated conditions (sweep.generate is false): texts longer and entries more numerous than the stories carry");
  const unsized = frames.filter((f) => f.typeUnchecked).map((f) => f.frame);
  if (unsized.length) out.push(`- type sizes in ${unsized.join(", ")}: the spec gives no font sizes`);
  out.push("- behaviour beyond the journeys above, browsers other than Chromium, devices, assistive technology and real consumers");
  return out.join("\n");
}

export function renderGallery({ title = "Design check", frames, sweep, journeys = [], gaps = [], ledger = [] }) {
  const columns = [["design", "Design"], ["before", "Before"], ["after", "After"], ["diff", "Difference"]];
  const sections = frames.map((f) => {
    const start = startCause(f.result);
    const lines = [start ? `Start here: ${esc(sayCause(start))}.` : "", f.result.imageOnly ? `${esc(imageOnlyNote(f.result))}.` : "", f.result.uncovered ? `${esc(uncoveredNote(f.result))}.` : "",
      f.result.unexpected?.length ? esc(notInDesign(f.result)) : "", f.result.pixels ? `Pixels: ${round(f.result.pixels.ratio * 100)} % differ.` : ""].filter(Boolean);
    const verdict = verdictOf(f.result);
    return `<section><h2>${esc(f.result.frame)} <span class="${verdict}">${verdict}</span></h2>
${lines.map((l) => `<p>${l}</p>`).join("\n")}
<div class="row">${columns.map(([k, label]) => {
      const comparison = k === "before" && f.result.beforeComparison;
      const content = f.images[k] ? `<img src="${f.images[k]}"${comparison ? "" : ` width="${f.width}"`} alt="${label}, ${esc(f.result.frame)}">`
        : k === "before" ? esc(f.result.beforeUnavailable ?? "") : k === "after" ? esc(f.result.unmeasured ?? "") : "";
      return content ? `<figure><figcaption>${label}${comparison ? ` — ${esc(comparison)}` : ""}</figcaption>${content}</figure>` : "";
    }).join("")}</div>
</section>`;
  });
  const entry = (e) => `<li><b>${esc(e.status)}</b>${e.category ? ` · ${esc(e.category)}` : ""} · ${esc(e.property === "region" ? `region ${e.region.join(", ")}` : `${[].concat(e.landmark).join(", ")} ${e.property}`)}${e.frame ? ` · ${esc([].concat(e.frame).join(", "))}` : ""}: ${esc(e.reason)}${e.decidedBy ? ` (decided by ${esc(e.decidedBy)})` : ""}${e.options ? `<br>Options: ${esc([].concat(e.options).join("; "))}` : ""}</li>`;
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
<h1>${esc(title)}</h1><p>${esc(new Date().toISOString().slice(0, 16).replace("T", " "))} UTC · the design, the page before the work, the page now, and where they differ. Confirm the rendered data and theme when comparing Before with After.</p>
${gaps.length ? `<section><h2>Not checked</h2><ul>${gaps.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></section>` : ""}
${sections.join("\n")}
${sweep ? `<section><h2>Widths ${sweep.from}–${sweep.to} <span class="${verdictOf(sweep)}">${verdictOf(sweep)}</span></h2><p>${esc(sweep.reason ?? `Layout changes between ${sweep.switches.join(", ") || "no widths"}.`)}</p>${sweep.issues.length ? `<ul>${sweep.issues.map((i) => `<li>${esc(i.property)} ${esc(where(i))} at ${esc(i.ranges)}: ${esc(i.actual)} — ${esc(i.status)}</li>`).join("")}</ul>` : ""}</section>` : ""}
${(sweep?.stories ?? []).filter((st) => !st.generated).map((st) => `<section><h2>Story: ${esc(st.name)}</h2><p>${esc(st.unmeasured ?? "At the frames' widths; its findings are in the list above.")}</p><div class="row">${st.shots.map((sh) => `<figure><figcaption>${sh.width} px</figcaption><img src="${sh.image}" alt="${esc(st.name)} at ${sh.width} px"></figure>`).join("")}</div></section>`).join("\n")}
${journeys.length ? `<section><h2>Journeys</h2><ul>${journeys.map((j) => `<li><span class="${j.pass ? "pass" : "fail"}">${j.pass ? "holds" : "fails"}</span> ${esc(j.name)}${j.failed ? `: ${esc(j.failed)}` : ""}</li>`).join("")}</ul></section>` : ""}
${ledger.length ? `<section><h2>Deviations</h2><ul>${ledger.map(entry).join("")}</ul></section>` : ""}
</html>
`;
}
