// The review page's client: Summary, Decisions, Code and Details over one record. page.mjs inlines this file and
// calls it with decisions.mjs's runtime, the one owner of the owner's answers; the record comes from the JSON island,
// the diff's rows from each file's <noscript>, and every word from the record language's catalog in labels.mjs.
(function reviewPage(decisionRuntime) {
"use strict";
performance.mark("app-start");
const D = JSON.parse(document.getElementById("data").textContent);
const DR = decisionRuntime();
const app = document.getElementById("app");

// ---------------------------------------------------------------- words: the catalog, its plurals and numbers
const PLURAL = new Intl.PluralRules(D.language);
const n = (x) => Number(x).toLocaleString(D.language);
const L = (key, a, b) => String(D.labels[key] ?? key).replace("{n}", a).replace("{m}", b);
const P = (key, count) => L(`${key}.${PLURAL.select(count)}`, n(count));

// ---------------------------------------------------------------- helpers
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// A record value in an address: percent-encoded, so an id of any characters makes one segment that route reads back.
const hashPart = (v) => encodeURIComponent(String(v ?? "")).replace(/%3A/g, ":");
// A key the page builds from a record id, cut at its own separator: the first after a fixed prefix, the last before a
// fixed field name, since the id between them may hold any character.
const cut = (s, sep) => { const i = s.indexOf(sep); return i < 0 ? [s, ""] : [s.slice(0, i), s.slice(i + 1)]; };
const cutLast = (s, sep) => { const i = s.lastIndexOf(sep); return i < 0 ? [s, ""] : [s.slice(0, i), s.slice(i + 1)]; };
const prose = (v) => esc(v).replace(/`([^`]+)`/g, "<code>$1</code>");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const splitPath = (p) => { const i = p.lastIndexOf("/"); return [p.slice(0, i + 1), p.slice(i + 1)]; };
const slashBreaks = (s) => esc(s).replace(/\//g, "/<wbr>");
const pathHtml = (p) => { const [d, b] = splitPath(p); return `<span class="dir">${slashBreaks(d)}</span><b>${esc(b)}</b>`; };
// A path on one line: the directories give way from the left, the file's name stays; the whole path is the title.
const pathLine = (p) => { const [d, b] = splitPath(p); return `${d ? `<span class="dir"><span dir="ltr">${esc(d)}</span></span>` : ""}<b>${esc(b)}</b>`; };
const closeX = (act, label, extra = "") => `<button class="btn sm icon quiet x" ${act} aria-label="${esc(label)}" title="${esc(label)}"${extra}>${ICON.close}</button>`;
const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
const MOD = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";
const kbd = (k) => `<span class="kbd">${esc(k)}</span>`;
// The page's few icons, drawn in the text's colour; the control that holds one carries the words.
const svg = (d) => `<svg class="ic" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
const ICON = {
  close: svg("M4 4l8 8M12 4l-8 8"),
  chevron: svg("M4 6l4 4 4-4"),
  comment: svg("M3 3.5h10v7H7l-3 2.5v-2.5H3z"),
  panel: svg("M2.5 3h11v10h-11zM6.5 3v10"),
  light: svg("M8 5.2a2.8 2.8 0 1 0 0 5.6a2.8 2.8 0 1 0 0-5.6zM8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"),
  dark: svg("M13 9.6A5.6 5.6 0 0 1 6.4 3a5.6 5.6 0 1 0 6.6 6.6z"),
  // a disc half filled: the system's choice
  auto: `<svg class="ic" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="5.5"/><path d="M8 2.5a5.5 5.5 0 0 0 0 11z" fill="currentColor"/></svg>`,
};

// ---------------------------------------------------------------- the diff: each file's rows, read from its <noscript>
// A row is [kind 0 context | 1 added | 2 removed, old number, new number, block, code markup, length]; page.mjs
// writes one row per line, a hunk opening with <tbody>.
const B = D.blocks, F = D.files;
// A picture given as a file travels once, in the document's details; the island says only that it is there.
const PICS = new Map([...(document.getElementById("static-details")?.textContent ?? "").matchAll(/<img data-pic="([^"]+)" src="([^"]+)"/g)].map((m) => [m[1], m[2]]));
const CELL = '<td class="cd">';
for (const [fi, f] of F.entries()) {
  f.hunks = [];
  for (const line of (document.getElementById("code-" + fi)?.textContent ?? "").split("\n")) {
    if (line === "<tbody>") { f.hunks.push({ rows: [] }); continue; }
    const m = /^<tr class="r [cad]" data-r="(\d),(\d*),(\d*),(\d*),(\d+)">/.exec(line);
    if (!m) continue;
    const num = (v) => v === "" ? null : +v;
    f.hunks.at(-1).rows.push([+m[1], num(m[2]), num(m[3]), +m[4] || 0, line.slice(line.indexOf(CELL) + CELL.length, -"</td></tr>".length), +m[5]]);
  }
}

// ---------------------------------------------------------------- indices
const blk = (id) => B[id - 1];
const reqById = new Map(D.requirements.map((r) => [r.id, r]));
const fileByPath = new Map(F.map((f, fi) => [f.path, fi]));
const fileBlocks = F.map(() => []);
for (const b of B) fileBlocks[b.file].push(b);
const ITEMS = DR.itemsOf(D), itemByKey = new Map();
const refs = { q: D.questions, f: D.findings, i: D.ideas };
for (const it of ITEMS) {
  const type = it.key[0], ref = refs[type].find((x) => "" + type + x.id === it.key);
  Object.assign(it, { label: type.toUpperCase() + ref.id, type, ref, blocks: ref.blocks ?? [] });
  itemByKey.set(it.key, it);
}
const blockItems = (b) => [...b.findings.map((f) => "f" + f), ...b.questions.map((q) => "q" + q)].filter((k) => itemByKey.has(k)).map((k) => itemByKey.get(k));
const firstPos = {};
F.forEach((f, fi) => f.hunks.forEach((h, hi) => h.rows.forEach((r, ri) => { if (r[3] && !firstPos[r[3]]) firstPos[r[3]] = [fi, hi, ri]; })));
const ORDER = B.filter((b) => firstPos[b.id]).sort((a, b) => { const x = firstPos[a.id], y = firstPos[b.id]; return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
function rowAt(place) {
  if (!place || place.file == null) return null;
  const f = F[place.file];
  for (let hi = 0; hi < f.hunks.length; hi++) {
    const rows = f.hunks[hi].rows;
    for (let ri = 0; ri < rows.length; ri++) {
      const r = rows[ri];
      if (place.base ? (r[0] !== 1 && r[1] === place.line) : (r[0] !== 2 && r[2] === place.line)) return { fi: place.file, hi, ri, row: r };
    }
  }
  return null;
}
for (const c of ITEMS) { const at = rowAt(c.ref.place); c.placeRow = at; c.placeBlock = at?.row[3] || null; }
// A line's key in the page: its file and its side's number; the export names it by path, side and number.
const lkOf = (fi, r) => `${fi}:${r[0] === 2 ? "-" + r[1] : "+" + r[2]}`;
const anchorOfLk = (lk) => { const [fi, side] = lk.split(":"); return { path: F[+fi].path, side: side[0] === "-" ? "base" : "head", line: +side.slice(1) }; };
const lkOfAnchor = (c) => fileByPath.has(c.path) ? `${fileByPath.get(c.path)}:${c.side === "base" ? "-" : "+"}${c.line}` : null;
// A comment on several lines is drawn below the last of them, and keyed there.
const lastLk = (c) => lkOfAnchor({ ...c, line: c.end ?? c.line });
const placeWords = (c) => `${c.path}:${c.side === "base" ? "−" : ""}${c.line}${c.end ? `–${c.end}` : ""}`;
const quoteHtml = (c) => c?.quote ? `<blockquote class="sel-quote">${esc(c.quote)}</blockquote>` : "";
const rowOfLk = (lk) => {
  const [fi, side] = [+lk.split(":")[0], lk.split(":")[1] ?? ""], num = +side.slice(1);
  if (!F[fi] || !/^[+-]\d+$/.test(side)) return null;
  for (let hi = 0; hi < F[fi].hunks.length; hi++) { const rows = F[fi].hunks[hi].rows; for (let ri = 0; ri < rows.length; ri++) { const r = rows[ri]; if (side[0] === "-" ? r[0] === 2 && r[1] === num : r[0] !== 2 && r[2] === num) return { fi, hi, ri, row: r }; } }
  return null;
};
const GROUPS = [
  { id: "decision", label: L("p.group.decision"), note: L("p.group.decision-note"), test: (c) => c.kind === "decision" },
  { id: "finding", label: L("p.group.finding"), note: L("p.group.finding-note"), test: (c) => c.kind === "finding" },
  { id: "idea", label: L("p.group.idea"), note: L("p.group.idea-note"), test: (c) => c.kind === "idea" },
  { id: "fact", label: L("p.group.fact"), note: L("p.group.fact-note"), test: (c) => c.kind === "fact" || c.kind === "evidence" },
];
function orderChildren(cards) {
  const out = [], seen = new Set();
  const visit = (c) => { if (seen.has(c.key)) return; seen.add(c.key); out.push(c); if (c.type === "q") for (const ch of c.ref.children) { const x = itemByKey.get("q" + ch); if (x && cards.includes(x)) visit(x); } };
  for (const c of cards) if (!(c.ref.parent && cards.includes(itemByKey.get("q" + c.ref.parent.question)))) visit(c);
  for (const c of cards) visit(c);
  return out;
}
const REVIEW_ORDER = GROUPS.flatMap((g) => orderChildren(ITEMS.filter(g.test)));

// ---------------------------------------------------------------- state: the owner's answers and comments (DR), and the view
let state = DR.empty();
const S = {
  field: {}, reasonText: {}, lcEdit: null, lcRange: null, pcEdit: null, pcRange: null, pcDraft: {}, tab: "summary",
  sel: { summary: null, decisions: null, code: null, details: null }, cur: null, file: null,
  sub: { decisions: "all", details: "structure" }, structView: "table", unitSort: { key: "fix", dir: -1 }, more: {},
  code: { mode: "attention", purposes: new Set(D.purposes), req: "", unit: "", q: "", expanded: new Set(), collapsed: new Set(),
    pinned: new Set(), whole: new Set(), doneOpen: new Set(), set: null, tree: window.innerWidth > 1150, dirsClosed: new Set(), ctx: false },
  viewed: new Set(), scroll: {}, theme: "auto", rendered: {}, cmap: {}, find: { open: false, q: "", matches: [], i: -1 },
};
// The comments as the page looks them up: line comments by line key, paragraph comments by anchor.
let LC = new Map(), PC = new Map();
function indexComments() {
  LC = new Map(state.lines.map((c) => [lastLk(c), c]).filter(([lk]) => lk));
  PC = new Map(state.paragraphs.map((c) => [`${c.item}/${c.field}`, c]));
}
const entryOf = (key) => state.answers[key] ?? {};

// ---------------------------------------------------------------- persistence: answers, comments, «Viewed» and view choices, in this browser
// Kept under a key of this record and of the stored format, so another record never reads them. The page says what is true of the storage now — that the browser keeps no storage for it, that what it
// kept could not be read, or that it refused the last save — and leaving with answers it did not save asks first.
// What it kept and could not read is never written over unasked: the first save that would replace it shows it to
// copy, and only the owner's choice saves over it.
// The stored format's number changes when the page would read a value an earlier page stored differently from what that
// page meant, or would need code only to read it; never with the export's number, which concerns the export alone.
// The stored format's number is in the prefix; a report's answers are kept under its key.
const STORE_PREFIX = "review-report:6:", STORE = STORE_PREFIX + D.digest.key;
let storage = "saved", unsaved = false, unreadable = null, unreadableShown = false;
// What the page stores, at every level it reads: an object of decisions (answers, line and paragraph comments), «Viewed»
// and view choices. Anything else is not this page's to read, nor to write over.
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const ours = (raw) => isObject(raw) && [raw.decisions, raw.decisions?.answers, raw.ui].every((v) => v === undefined || isObject(v))
  && [raw.decisions?.lines, raw.decisions?.paragraphs, raw.viewed].every((v) => v === undefined || Array.isArray(v));
function load() {
  let raw, text;
  try { text = localStorage.getItem(STORE); } catch { storage = "blocked"; return; }
  if (text === null) return;
  try { raw = JSON.parse(text); } catch { raw = undefined; }
  if (!ours(raw)) { storage = "unreadable"; unreadable = text; return; }
  state = DR.settle(ITEMS, DR.normalize(raw.decisions));
  for (const path of Array.isArray(raw.viewed) ? raw.viewed : []) if (fileByPath.has(path)) { S.viewed.add(fileByPath.get(path)); S.code.collapsed.add(fileByPath.get(path)); }
  const ui = raw.ui ?? {};
  if (["auto", "light", "dark"].includes(ui.theme)) S.theme = ui.theme;
  if (typeof ui.tree === "boolean") S.code.tree = ui.tree;
  if (Array.isArray(ui.dirsClosed)) S.code.dirsClosed = new Set(ui.dirsClosed.filter((d) => typeof d === "string"));
}
function save() {
  if (storage === "unreadable") { unsaved = true; showStorage(); return offerUnreadable(); }
  const kept = { decisions: state, viewed: [...S.viewed].map((fi) => F[fi].path), ui: { theme: S.theme, tree: S.code.tree, dirsClosed: [...S.code.dirsClosed] } };
  try { localStorage.setItem(STORE, JSON.stringify(kept)); storage = "saved"; unsaved = false; } catch { if (storage !== "blocked") storage = "failed"; unsaved = true; }
  showStorage();
}
// Where the answers are kept, in the words of each place that says so: this browser, or, when it keeps nothing,
// refused a save or holds what the page could not read, only this page's memory.
const KEPT = { keys: ["p.keys.memory", "p.keys.memory.page"], export: ["p.export.note", "p.export.note.page"], hint: ["p.memory", "p.memory.page"] };
const kept = (where) => L(KEPT[where][storage === "saved" ? 0 : 1]);
// A later record of the same change — revised, or of a new revision — holds items that read exactly as before: the
// page offers the owner's answers to those, from what this browser kept for the previous report, never by number.
function carriedAnswers() {
  if (!D.previous?.pairs.length) return [];
  let raw;
  try { raw = JSON.parse(localStorage.getItem(STORE_PREFIX + D.previous.key)); } catch { return []; }
  const answers = raw?.decisions?.answers;
  if (!answers || typeof answers !== "object") return [];
  return D.previous.pairs.filter(([now, before]) => !state.answers[now] && answers[before] && typeof answers[before] === "object").map(([now, before]) => [now, answers[before]]);
}
function offerCarried() {
  const found = carriedAnswers(), bar = $("#carry");
  if (!bar) return;
  bar.hidden = !found.length;
  if (found.length) $("#carry-text").textContent = P("p.carry", found.length);
}
function takeCarried() {
  const found = carriedAnswers();
  hideCarry();
  if (!found.length) return;
  setState(DR.settle(ITEMS, DR.normalize({ ...state, answers: { ...state.answers, ...Object.fromEntries(found) } })));
  save();
  for (const tab of ["summary", "decisions", "code", "details"]) if (S.rendered[tab]) RENDER[tab]();
  updateChrome();
}
// The bar goes, and focus with it to the tab in view, never to the page's body.
function hideCarry() { $("#carry").hidden = true; $(`#tab-${S.tab}`)?.focus(); }
function showStorage() {
  for (const [id, where] of [["keys-memory", "keys"], ["export-note", "export"], ["report-memory", "hint"]]) { const x = $("#" + id); if (x) x.textContent = kept(where); }
  if (S.rendered?.decisions) updateSubCounts();
  const el = $("#storage"); if (!el) return;
  el.hidden = storage === "saved";
  const words = storage === "saved" ? "" : L({ blocked: "p.storage.blocked", unreadable: "p.storage.unreadable", failed: "p.storage.failed" }[storage]);
  if ($("#storage-text").textContent !== words) $("#storage-text").textContent = words;
  $("#storage [data-act=\"unreadable-show\"]").hidden = storage !== "unreadable";
}
// The first save that would replace what could not be read shows it once the owner's action is complete — after the
// page has redrawn for it, so closing returns focus where the action left it, and never while a field is being typed in.
function offerUnreadable() {
  if (unreadableShown) return;
  unreadableShown = true;
  const show = () => typingTarget(document.activeElement) ? document.activeElement.addEventListener("focusout", () => setTimeout(show), { once: true }) : openUnreadable();
  setTimeout(show);
}
function openUnreadable() {
  unreadableShown = true;
  $("#unreadable-text").value = unreadable; $("#unreadable-status").textContent = "";
  const d = $("#unreadable-dialog"); if (!d.open) d.showModal();
}
// The owner's choice: this page's answers replace what could not be read.
function saveOverUnreadable() {
  storage = "saved"; unreadable = null;
  $("#unreadable-dialog").close();
  save();
  // the warning it was opened from has gone with it: focus moves to the tab, not to nowhere
  if ($("#storage").contains(document.activeElement)) $(`#tab-${S.tab}`).focus();
}
window.addEventListener("beforeunload", (e) => { flushText(); if (unsaved) { e.preventDefault(); e.returnValue = ""; } });

// ---------------------------------------------------------------- the owner's options, and each item's status in words
const OPTION_LABEL = { fix: L("p.option.fix"), leave: L("p.option.leave"), take: L("p.option.take"), skip: L("p.option.skip") };
function optionsOf(c) {
  if (c.kind === "decision") { const rec = c.ref.recommendation ?? {}; return c.ref.variants.map((v) => ({ id: v.id, label: v.text, sub: v.consequences.map((x) => x.text).join(" "), rec: rec.variant === v.id || (rec.variants ?? []).includes(v.id) })); }
  return c.options.map((id, i) => ({ id, label: OPTION_LABEL[id], key: i ? "n" : "f" }));
}
const optionLabel = (c, id) => optionsOf(c).find((o) => o.id === id)?.label ?? id;
// A choice in words: the variant, or the several a decision whose variants combine took, in their order.
const choiceLabel = (c, choice) => [].concat(choice).map((id) => optionLabel(c, id)).join(", ");
const draftText = (c, draft) => draft.choice !== undefined ? choiceLabel(c, draft.choice) : draft.text;
const isRequest = (c) => c.kind === "fact" || c.kind === "evidence";
const isChosen = (c, id) => statusOf(c).state === "decided" && [].concat(entryOf(c.key).choice ?? []).includes(id);
const applicable = (c) => DR.applicable(ITEMS, state, c.key);
function statusOf(c) {
  const s = DR.status(ITEMS, state, c.key);
  if (s.state === "not-applicable") return { state: "na", label: L("p.status.na"), cls: "dashed", draft: s.draft };
  if (s.state === "deferred") return { state: "deferred", label: L("p.status.deferred"), cls: "dashed", lbl: L("p.answer.deferred-because"), answer: s.reason, draft: s.draft };
  if (s.state === "answered") return { state: "answered", label: L("p.status.answered"), cls: "neutral", lbl: L("p.answer.entered"), answer: s.text, unverified: true };
  if (s.state === "decided") return { state: "decided", label: L("p.status.decided"), cls: "neutral",
    lbl: s.choice !== undefined ? L("p.answer.yours") : L("p.answer.own"), answer: s.choice !== undefined ? choiceLabel(c, s.choice) : s.text };
  return { state: "open", label: L("p.status.open"), cls: "open", draft: s.draft };
}
const isOpen = (c) => statusOf(c).state === "open";
// A compact row names an entered answer for what it is, never a verified result.
const compactAnswer = (st) => st.answer === undefined ? "" : st.unverified ? `${st.lbl}: ${st.answer}` : st.answer;
// An answer given while the parent is still open holds only as long as that parent's answer keeps the question.
function waitingText(c) {
  const parent = DR.waitingFor(ITEMS, state, c.key);
  return parent && statusOf(c).state !== "open" ? L("p.waiting", itemByKey.get(parent).label, itemByKey.get(parent).label) : "";
}
const blockOpen = (b) => b.verdict !== "keep" && blockItems(b).some(isOpen);
const tagHtml = (st) => `<span class="tag ${st.cls}">${esc(st.label)}</span>`;
const answerHtml = (st) => st.answer ? `<span class="lbl">${esc(st.lbl)}:</span>${esc(st.answer)}` : "";
const VERDICT_CLS = { keep: "neutral", fix: "warn", remove: "bad", question: "q", split: "warn", merge: "warn" };
const verdictWord = (v) => L("verdict." + v).toLowerCase();
const verdictTag = (v) => `<span class="tag verdict ${VERDICT_CLS[v] ?? "neutral"}" title="${esc(L("p.verdict.title"))}">${esc(L("p.verdict.reviewer"))} <b>${esc(verdictWord(v))}</b></span>`;
const progress = () => DR.progress(ITEMS, state);
// Progress in words, the same wherever the page says it: the choices decided, then the requests answered, never
// verified; a part with nothing to count is left out.
const requestWords = (p) => p.requests && L("p.progress.requests", n(p.answered), n(p.requests));
const progressWords = (p) => [p.choices && L("p.progress", n(p.decided), n(p.choices)), requestWords(p)].filter(Boolean);

// ---------------------------------------------------------------- chips and relations: links by id, from explicit record fields only
const chip = (kind, id) => {
  const label = { f: "F", q: "Q", i: "I", b: "B", r: "R", m: "M" }[kind] + id;
  const href = kind === "b" ? `#code/b${hashPart(id)}` : kind === "r" ? `#summary/r${hashPart(id)}` : kind === "m" ? `#details/mechanisms/mech:${+id - 1}` : `#decisions/${kind}${hashPart(id)}`;
  return `<a class="chip" href="${esc(href)}" data-go="${kind}:${esc(id)}" title="${esc(chipTitle(kind, id))}">${esc(label)}</a>`;
};
function chipTitle(kind, id) {
  if (kind === "b") { const b = blk(+id); return b ? `${b.path} ${b.where}` : ""; }
  if (kind === "r") return reqById.get(String(id))?.text ?? "";
  if (kind === "m") return D.mechanisms[+id - 1]?.name ?? "";
  const c = itemByKey.get(kind + id); return c ? (c.ref.title ?? c.ref.text ?? "") : "";
}
const chips = (kind, ids) => ids.length ? `<span class="chips">${ids.map((id) => chip(kind, id)).join("")}</span>` : "";
// An entry of Details, linked by its tab and row.
const detailsChip = (s) => `<a class="chip" href="${esc(`#details/${hashPart(s.sub)}${s.sel ? "/" + hashPart(s.sel) : ""}`)}" data-go="d:${esc(s.sub)}/${esc(s.sel)}">${esc(s.text)}</a>`;
const srcItems = (sources) => sources.map((s) => s.ref === "d" ? detailsChip(s) : s.ref ? chip(s.ref, s.id) : esc(s.text)).join(", ");
const srcList = (sources) => !sources?.length ? "" : `<span class="srcs">${esc(L("p.sources"))}: ${srcItems(sources)}</span>`;
const refsIn = (lists, kind) => [...new Set(lists.flat().filter((s) => s?.ref === kind).map((s) => s.id))];
function relations(kind, id) {
  const rows = [];
  const add = (label, html) => { if (html) rows.push(`<dt>${esc(L(label))}</dt><dd>${html}</dd>`); };
  const unitLinks = (names) => names.map((name) => { const i = D.units.findIndex((u) => u.name === name); return i >= 0 ? `<button class="linkbtn" data-act="gounit" data-unit="${i}"><span class="unit-name">${esc(name)}</span></button>` : esc(name); }).join(", ");
  const mechLinks = (ms) => ms.map(([m, i]) => `<button class="linkbtn" data-act="gomech" data-mech="${i}">${esc(m.name)}</button>`).join(", ");
  const scenLinks = (ids) => ids.map((s) => `<button class="linkbtn" data-act="goscen" data-scen="${esc(s)}">${esc(L("p.rel.scenario", s))}</button>`).join(", ");
  if (kind === "r") {
    const r = reqById.get(id);
    add("p.rel.blocks", chips("b", r.blocks));
    add("p.rel.broken-by", chips("f", r.broken)); add("p.rel.no-test", chips("f", r.untested));
    add("p.rel.checks", D.checks.map((c, i) => [c, i]).filter(([c]) => c.requirements.includes(id)).map(([, i]) => `<button class="linkbtn" data-act="gocheck" data-check="${i}">${esc(L("p.rel.check", i + 1))}</button>`).join(", "));
    add("p.rel.scenarios", scenLinks(D.scenarios.filter((s) => s.requirements.includes(id)).map((s) => s.id)));
    add("p.rel.cited-by", chips("q", D.questions.filter((q) => refsIn([q.context.flatMap((x) => x.sources), q.variants.flatMap((v) => v.consequences.flatMap((x) => x.sources)), q.recommendation?.sources ?? []], "r").includes(id)).map((q) => q.id)));
  } else if (kind === "f") {
    const f = D.findings.find((x) => x.id === id), c = itemByKey.get("f" + id);
    add("p.rel.breaks", chips("r", f.breaks)); add("p.rel.no-test-for", chips("r", f.untested));
    add("p.rel.blocks", chips("b", c.blocks));
    add("p.rel.units", unitLinks(D.units.filter((u) => u.findings.includes(id)).map((u) => u.name)));
    add("p.rel.mechanisms", mechLinks(D.mechanisms.map((m, i) => [m, i]).filter(([m]) => m.findings.includes(id))));
    add("p.rel.steps", D.steps.map((s, i) => [s, i]).filter(([s]) => s.findings.includes(id)).map(([, i]) => `<button class="linkbtn" data-act="gostep" data-step="${i}">${esc(L("p.rel.step", i + 1))}</button>`).join(", "));
    add("p.rel.scenarios", scenLinks(f.scenarios));
    add("p.rel.screens", D.screens.filter((s) => s.differences.some((d) => d.finding === id)).map((s) => esc(s.name)).join(", "));
  } else if (kind === "q") {
    const q = D.questions.find((x) => x.id === id), c = itemByKey.get("q" + id);
    const srcs = [q.context.flatMap((x) => x.sources), q.variants.flatMap((v) => v.consequences.flatMap((x) => x.sources)), q.recommendation?.sources ?? [], q.zones.flatMap((z) => z.sources)];
    add("p.rel.blocks", chips("b", c.blocks));
    add("p.rel.units", unitLinks(D.units.filter((u) => u.questions.includes(id)).map((u) => u.name)));
    add("p.rel.depends-on", q.parent ? chip("q", q.parent.question) : "");
    add("p.rel.conditional", chips("q", q.children));
    add("p.rel.evidence-kept", chips("q", q.remainingEvidence));
    add("p.rel.cites", [chips("r", refsIn(srcs, "r")), chips("f", refsIn(srcs, "f")), chips("q", refsIn(srcs, "q").filter((x) => x !== id)), chips("b", refsIn(srcs, "b"))].join(" ").trim());
  }
  return rows.length ? `<dl class="rel">${rows.join("")}</dl>` : `<p class="muted small">${esc(L("p.rel.none"))}</p>`;
}
function typeText(c) {
  const r = c.ref, who = r.resolver ? " · " + r.resolver : "";
  if (c.kind === "finding") return `${L("p.type.finding")} · ${L("direction." + r.direction)} · ${L("evidence." + r.evidence)}`;
  if (c.kind === "idea") return L("p.type.idea");
  return L({ decision: "p.type.decision", fact: "p.type.fact", evidence: "p.type.evidence" }[c.kind]) + who;
}
const itemTitle = (c) => c.ref.title ?? c.ref.text;

// ---------------------------------------------------------------- toast and the honest clipboard
let toastTimer = null;
let undoFn = null;
function toast(text, undo = null) {
  let el = $("#toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); document.body.append(el); }
  undoFn = undo;
  el.innerHTML = `<span>${esc(text)}</span>${undo ? `<button class="btn sm" data-act="undo">${esc(L("p.undo"))} ${kbd("u")}</button>` : ""}`;
  el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; undoFn = null; }, undo ? 7000 : 2600);
}
function runUndo() { if (!undoFn) return false; const f = undoFn; undoFn = null; $("#toast").hidden = true; f(); return true; }
// An item and every question conditional on it, down the chain: what one answer can change.
function familyOf(c) {
  const keys = [c.key];
  for (let i = 0; i < keys.length; i++) { const x = itemByKey.get(keys[i]); if (x.type === "q") for (const ch of x.ref.children) if (!keys.includes("q" + ch)) keys.push("q" + ch); }
  return keys;
}
// Every answer given by a key is announced and can be taken back: Undo reverses that one action and what followed from
// it, never a later answer to another item.
const entriesOf = (keys) => Object.fromEntries(keys.map((k) => [k, state.answers[k]]));
const snapshot = (key) => { const keys = familyOf(itemByKey.get(key)); return { key, keys, before: entriesOf(keys), field: S.field[key] }; };
function announce(c, snap) {
  const st = statusOf(c), after = entriesOf(snap.keys);
  const what = st.state === "decided" || st.state === "answered" ? st.answer : st.state === "deferred" ? L("p.toast.deferred", st.answer) : st.state === "open" ? L("p.toast.cleared") : st.label;
  toast(`${c.label}: ${what}`, () => {
    const next = DR.undo(ITEMS, state, c.key, snap.before, after);
    if (next === state) return toast(L("p.toast.superseded", c.label));
    setState(next); S.field[c.key] = snap.field; afterChange(c.key, { structural: true }); toast(L("p.toast.undone", c.label));
  });
}
function refText(fi, side, num, end = num) {
  const rev = side === "-" ? D.passport?.base : D.passport?.head;
  return `${F[fi].path}:${num}${end !== num ? "-" + end : ""}${rev ? ` (${L(side === "-" ? "p.copy.base" : "p.copy.head", rev)})` : ""}`;
}
function blockRef(bid) { const p = firstPos[bid], r = F[p[0]].hunks[p[1]].rows[p[2]]; return refText(p[0], r[0] === 2 ? "-" : "+", r[0] === 2 ? r[1] : r[2]); }
function copy(text) {
  const fail = () => {
    $("#copybox")?.remove();
    const box = document.createElement("div");
    box.id = "copybox"; box.className = "copybox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", L("p.copy.dialog"));
    box.innerHTML = `<span>${esc(L("p.copy.refused", MOD))}</span><input readonly value="${esc(text)}" aria-label="${esc(L("p.copy.value"))}"><button class="btn sm" data-act="copybox-close">${esc(L("p.done"))}</button>`;
    document.body.append(box);
    const input = $("input", box); input.focus(); input.select();
  };
  try { navigator.clipboard.writeText(text).then(() => toast(L("p.copy.copied", text)), fail); } catch { fail(); }
}

// ---------------------------------------------------------------- the export: one payload from decisions.mjs, shown as a preview, as text and as JSON
function exportPayload() {
  return DR.exportOf(ITEMS, state, { recordSha: D.digest.record, diffSha: D.digest.diff, key: D.digest.key, title: D.title, range: D.range });
}
// The payload's rows in words, by section: each row is its text and the place «Show» goes to.
function exportModel() {
  const payload = exportPayload(), sections = { decided: [], answered: [], deferred: [], na: [], open: [], comments: [] };
  const answerWords = (c, a) => a.variant ? a.variant.text : a.variants ? a.variants.map((v) => v.text).join(", ") : a.option ? OPTION_LABEL[a.option] : a.text !== undefined ? L("p.export.own", a.text) : "";
  for (const x of payload.items) {
    const c = itemByKey.get(x.item), draft = x.draft ? ` · ${L("p.export.draft", answerWords(c, x.draft))}` : "";
    const zones = x.zones ? ` · ${L("p.export.zones", x.zones.map((i) => c.ref.zones[i].text).join("; "))}` : "";
    const waiting = x.waiting_for_parent ? ` · ${L("p.export.waiting", itemByKey.get(x.waiting_for_parent).label)}` : "";
    const row = (text) => ({ text: `${c.label}: ${text}`, go: c.key });
    if (x.status === "decided") sections.decided.push(row(answerWords(c, x) + zones + waiting));
    else if (x.status === "answered") sections.answered.push(row(L("p.export.entered", x.text) + zones + waiting));
    else if (x.status === "deferred") sections.deferred.push(row(x.reason + draft + zones + waiting));
    else if (x.status === "not-applicable") sections.na.push(row(L("p.export.na", itemByKey.get(c.parent.key).label) + draft));
    else sections.open.push(row(itemTitle(c) + draft + zones + waiting));
  }
  const quoted = (x) => x.quote ? ` «${x.quote.replace(/\s+/g, " ")}»` : "";
  for (const x of payload.lineComments) sections.comments.push({ text: `${placeWords(x)}${quoted(x)}: ${x.text}`, go: lastLk(x) && "line:" + lastLk(x) });
  for (const x of payload.paragraphComments) sections.comments.push({ text: `${anchorLabel(`${x.item}/${x.field}`)}${quoted(x)}: ${x.text}`, go: "anchor:" + x.item + "/" + x.field });
  const p = progress();
  return { payload, sections, progress: [...progressWords(p), p.deferred && P("p.count.deferred", p.deferred)].filter(Boolean).join(" · ") };
}
const EXPORT_SECTIONS = [["decided", "p.export.decided"], ["answered", "p.export.answered"], ["deferred", "p.export.deferred"], ["na", "p.export.not-applicable"],
  ["comments", "p.export.comments"], ["open", "p.export.open"]];
function exportText(m) {
  const lines = [L("p.export.head", m.payload.title, m.payload.range)];
  for (const [id, head] of EXPORT_SECTIONS) if (m.sections[id].length) lines.push("", L(head), ...m.sections[id].map((r) => "- " + r.text));
  lines.push("", m.progress, L("p.export.digests", m.payload.record_sha256, m.payload.diff_sha256));
  return lines.join("\n");
}
function openExport() {
  const m = exportModel(), dialog = $("#export-dialog");
  $("#export-preview").innerHTML = EXPORT_SECTIONS.filter(([id]) => m.sections[id].length).map(([id, head]) => `<section class="xp"><h3>${esc(L(head))}</h3>${m.sections[id].map((r) => `<p>${esc(r.text)}${r.go ? `<button class="btn sm quiet" data-act="export-go" data-target="${esc(r.go)}">${esc(L("p.show-it"))}</button>` : ""}</p>`).join("")}</section>`).join("")
    + `<p class="muted small">${esc(m.progress)}</p>`;
  $("#export-text").value = exportText(m);
  $("#export-status").textContent = ""; $("#export-raw").open = false;
  if (!dialog.open) dialog.showModal();
}
// «Copied» only after the clipboard confirms; on refusal the text is selected for the owner to copy.
function copyText(box, status) {
  const fail = () => { const d = box.closest("details"); if (d) d.open = true; box.focus(); box.select(); status.textContent = L("p.export.copy-refused", MOD); };
  try { navigator.clipboard.writeText(box.value).then(() => { status.textContent = L("p.export.copied"); }, fail); } catch { fail(); }
}
function downloadExport() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(exportPayload(), null, 2)], { type: "application/json" }));
  a.download = `decisions-${D.digest.key}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------------------------------------------------------------- shell
const TABS = [{ id: "summary", label: L("p.tab.summary") }, { id: "decisions", label: L("p.tab.decisions") }, { id: "code", label: L("p.tab.code") }, { id: "details", label: L("p.tab.details") }];
const KEYS = [
  ["p.keys.moving", [[["j", "k"], "p.keys.jk"], [["]", "["], "p.keys.brackets"], [["Shift J", "Shift K"], "p.keys.files"], [["g"], "p.keys.tabs"], [["/"], "p.keys.filter"], [[MOD + " F"], "p.keys.find"]]],
  ["p.keys.deciding", [[["1–9"], "p.keys.digits"], [["f", "n"], "p.keys.fn"], [["o"], "p.keys.other"], [["d"], "p.keys.defer"], [["x"], "p.keys.clear"], [["u"], "p.keys.undo"], [["Enter"], "p.keys.enter"], [[], "p.keys.in-view"], [[MOD + " Enter"], "p.keys.save"]]],
  ["p.keys.code", [[["c"], "p.keys.comment"], [["y"], "p.keys.copy"], [["v"], "p.keys.viewed"], [["i"], "p.keys.context"], [["↑", "↓"], "p.keys.lines"], [["Esc"], "p.keys.esc"]]],
];
function keysHtml() {
  return KEYS.map(([head, rows]) => `<h3>${esc(L(head))}</h3>${rows.map(([keys, what]) => `<span>${keys.map(kbd).join(" ")}</span><span${keys.length ? "" : ' class="muted small"'}>${esc(L(what))}</span>`).join("")}`).join("");
}
// A dialog's head: its title, which takes focus when it opens, and × at the top right.
const dialogHead = (id, title) => `<div class="dialog-head"><h2 id="${id}" tabindex="-1" autofocus>${esc(title)}</h2><form method="dialog">${closeX("", L("p.close"))}</form></div>`;
function renderShell() {
  const c = D.counters;
  app.innerHTML = `
  <header class="masthead"><div class="mh-main"><div class="kicker"><span>${esc(L("kind"))}</span><span class="sep" aria-hidden="true">/</span><span>${esc(P("p.count.files", c.files))}</span><span class="sep" aria-hidden="true">·</span><span>${esc(L("p.count.lines", n(c.lines.added), n(c.lines.removed)))}</span><span class="sep" aria-hidden="true">·</span><span>${esc(P("p.count.blocks", c.blocks))}</span></div>
    <h1>${esc(D.title)}</h1></div>
    <div class="mh-right"><button class="btn sm" data-act="export" aria-haspopup="dialog">${esc(L("p.export"))}</button><div class="pop" id="theme-pop"><button class="btn sm icon menu-btn" data-act="theme-menu" aria-expanded="false" aria-haspopup="true" id="theme-btn"></button>
      <div class="pop-menu theme-menu" hidden role="group" aria-label="${esc(L("p.theme.menu"))}">${["light", "dark", "auto"].map((t) => `<button class="mi" data-act="theme-pick" data-theme="${t}" aria-pressed="false"><span>${ICON[t]}</span><span>${esc(L({ light: "p.theme.item.light", dark: "p.theme.item.dark", auto: "p.theme.item.auto" }[t]))}</span></button>`).join("")}</div></div></div></header>
  <div class="carry" id="carry" hidden><span id="carry-text"></span> <button class="btn sm" data-act="carry-take">${esc(L("p.carry.take"))}</button><button class="btn sm quiet" data-act="carry-skip">${esc(L("p.carry.skip"))}</button></div>
  <div class="storage" id="storage" hidden><span id="storage-text" role="status"></span> <button class="linkbtn" data-act="unreadable-show" hidden>${esc(L("p.storage.unreadable.show"))}</button></div>
  <nav class="tabbar" aria-label="${esc(L("p.tabs"))}"><div class="tabbar-in">
    <div class="tabs" role="tablist" aria-label="${esc(L("p.tabs"))}">${TABS.map((t) => `<button class="tab" role="tab" id="tab-${t.id}" aria-controls="panel-${t.id}" aria-selected="false" tabindex="-1" data-tab="${t.id}">${esc(t.label)}<span class="count" id="badge-${t.id}" hidden></span></button>`).join("")}</div>
    <div class="tb-right"><span class="progress" id="progress"></span>
      <button class="btn quiet sm" data-act="keys" aria-haspopup="dialog">${esc(L("p.keys"))} ${kbd("?")}</button></div>
  </div></nav>
  <main>${TABS.map((t) => `<section class="tabpanel" id="panel-${t.id}" role="tabpanel" aria-labelledby="tab-${t.id}" hidden></section>`).join("")}</main>
  <button type="button" id="sel-adder" class="sel-adder" data-act="sel-comment" hidden></button>
  <dialog id="keys-dialog" aria-labelledby="keys-h"><div class="dialog-in">${dialogHead("keys-h", L("p.keys"))}
    <div class="keys">${keysHtml()}</div>
    <p class="muted small" id="keys-memory">${esc(kept("keys"))}</p></div></dialog>
  <dialog id="export-dialog" aria-labelledby="export-h"><div class="dialog-in export">${dialogHead("export-h", L("p.export"))}
    <p class="muted small" id="export-note">${esc(kept("export"))}</p>
    <div id="export-preview"></div>
    <div class="dialog-actions"><p id="export-status" role="status"></p><button class="btn" data-act="print">${esc(L("p.export.print"))}</button><button class="btn" data-act="export-json">${esc(L("p.export.json"))}</button><button class="btn primary" data-act="export-copy">${esc(L("p.export.copy"))}</button></div>
    <details id="export-raw"><summary>${esc(L("p.export.text"))}</summary><textarea id="export-text" readonly rows="10" aria-label="${esc(L("p.export.text"))}"></textarea></details></div></dialog>
  <dialog id="unreadable-dialog" aria-labelledby="unreadable-h"><div class="dialog-in export">${dialogHead("unreadable-h", L("p.unreadable"))}
    <p class="muted small">${esc(L("p.unreadable.note"))}</p>
    <label for="unreadable-text">${esc(L("p.unreadable.text"))}</label><textarea id="unreadable-text" readonly rows="10"></textarea>
    <div class="dialog-actions"><button class="btn sm" data-act="unreadable-copy">${esc(L("p.export.copy"))}</button><button class="btn sm" data-act="unreadable-replace">${esc(L("p.unreadable.replace"))}</button></div>
    <p id="unreadable-status" role="status"></p></div></dialog>`;
  applyTheme(); showStorage(); offerCarried();
}
function applyTheme() {
  if (S.theme === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = S.theme;
  const word = { auto: L("p.theme.auto"), light: L("p.theme.light"), dark: L("p.theme.dark") }[S.theme];
  const b = $("#theme-btn"); if (b) { b.innerHTML = ICON[S.theme]; b.title = L("p.theme", word); b.setAttribute("aria-label", L("p.theme.switch", word)); }
  $$('#theme-pop [data-act="theme-pick"]').forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.theme === S.theme)));
}
function updateChrome() {
  const p = progress();
  const codeOpen = walkAll().filter((x) => isOpen(x.c)).length;
  const set = (id, v, title) => { const el = $("#badge-" + id); el.hidden = v === null; if (v !== null) { el.textContent = n(v); el.title = title; } };
  set("decisions", p.open, P("p.count.open", p.open)); set("code", codeOpen, P("p.count.open-code", codeOpen)); set("summary", null); set("details", null);
  const viewed = `<span class="sep" aria-hidden="true">·</span><span>${esc(L("p.progress.viewed", n(S.viewed.size), n(F.length)))}</span>`;
  // the bar keeps to its first part, the choices decided, so it fits beside the tabs; its title holds every part
  const words = progressWords(p);
  $("#progress").innerHTML = `<span title="${esc(words.join(" · "))}">${esc(words[0] ?? "")}</span>${p.choices ? `<span class="pbar" role="progressbar" aria-label="${esc(L("p.status.decided"))}" aria-valuemin="0" aria-valuemax="${p.choices}" aria-valuenow="${p.decided}"><span style="width:${(100 * p.decided / p.choices).toFixed(1)}%"></span></span>` : ""}${viewed}`;
  const so = $("#sum-progress"); if (so) so.innerHTML = summaryProgress();
  const sb = $("#start-btn"); if (sb) sb.textContent = L(p.done || p.deferred ? "p.continue" : "p.start");
  if (S.rendered.decisions) updateSubCounts();
}

// ---------------------------------------------------------------- tabs, selection, routing
function showTab(id, { push = true } = {}) {
  if (S.tab !== id) { S.scroll[S.tab] = window.scrollY; closeMenus(); }
  const changed = S.tab !== id;
  S.tab = id;
  for (const t of TABS) {
    const on = t.id === id, btn = $("#tab-" + t.id);
    btn.setAttribute("aria-selected", on); btn.tabIndex = on ? 0 : -1;
    $("#panel-" + t.id).hidden = !on;
  }
  if (!S.rendered[id]) { RENDER[id](); S.rendered[id] = true; }
  if (changed) window.scrollTo(0, S.scroll[id] ?? 0);
  if (id === "code") requestAnimationFrame(fillVisible);
  updateChrome();
  if (push) setHash();
}
function setHash() {
  const sel = S.sel[S.tab];
  let h = S.tab;
  if (S.tab === "decisions") h += S.sub.decisions === "comments" ? "/comments" : sel ? "/" + hashPart(sel.slice(5)) : "";
  else if (S.tab === "code" && S.lineHash) h += "/line/" + S.lineHash;
  else if (S.tab === "code" && S.sel.code) h += "/b" + S.sel.code;
  else if (S.tab === "details") h += "/" + S.sub.details + (sel ? "/" + hashPart(sel) : "");
  else if (S.tab === "summary" && sel?.startsWith("req:")) h += "/r" + hashPart(sel.slice(4));
  else if (S.tab === "summary" && sel?.startsWith("route:")) h += "/route" + (+sel.slice(6) + 1);
  // An explicit move to another place adds a history entry, so Back returns there; a step within a list replaces it.
  if (pushNext && location.hash !== "#" + h) history.pushState(null, "", "#" + h); else history.replaceState(null, "", "#" + h);
  pushNext = false;
}
function route(hash) {
  const m = /^#?(summary|decisions|code|details)(?:\/(.+))?$/.exec(hash || "");
  if (!m) return showTab("summary");
  const [, tab, rest] = m;
  // a segment hashPart wrote, read back; one typed by hand that is no such encoding stays as it is
  const dec = (v) => { try { return decodeURIComponent(v); } catch { return v; } };
  // an address that changes the sub-tab reconciles the selection as a click on it does: a card it hides is no longer
  // selected, in the panel or for the keys
  if (tab === "decisions" && rest === "comments") { S.sub.decisions = "comments"; showTab("decisions"); if (S.rendered.decisions) renderDecList(); return syncDecSelection(); }
  if (tab === "decisions" && rest && itemByKey.has(dec(rest))) return goCard(dec(rest));
  if (tab === "code" && rest && /^b\d+$/.test(rest) && blk(+rest.slice(1))) return goBlock(+rest.slice(1));
  if (tab === "code" && rest?.startsWith("line/") && rowOfLk(rest.slice(5))) return goLine(rest.slice(5));
  if (tab === "details" && rest) { const [sub, sel] = rest.split("/").map(dec); if (DETAIL_TABS.some((t) => t.id === sub)) { S.sub.details = sub; if (sel) S.sel.details = sel; showTab("details"); if (S.rendered.details) renderDetailBody(); return; } }
  if (tab === "summary" && rest && /^route\d+$/.test(rest) && D.routes[+rest.slice(5) - 1]) { showTab("summary"); return select("summary", "route:" + (+rest.slice(5) - 1), { scroll: true }); }
  if (tab === "summary" && rest && /^r/.test(rest) && reqById.has(dec(rest.slice(1)))) { showTab("summary"); return select("summary", "req:" + dec(rest.slice(1)), { scroll: true }); }
  showTab(tab);
}
const RENDER = { summary: renderSummary, decisions: renderDecisions, code: renderCode, details: renderDetails };
function select(tab, sel, { scroll = false, collapsePrev = false } = {}) {
  const prev = S.sel[tab];
  S.sel[tab] = sel;
  const root = $("#panel-" + tab);
  if (tab === "code") { S.lineHash = null; markSelectedBlock(); }
  else {
    $$("[data-sel].sel", root).forEach((el) => el.classList.remove("sel"));
    if (sel) $$(`[data-sel="${CSS.escape(sel)}"]`, root).forEach((el) => el.classList.add("sel"));
  }
  if (tab === "decisions") {
    // a decided card shrinks to one row only when the owner moves on by keyboard, never under the pointer
    if (prev && prev !== sel) { const pc = $(`#card-${prev.slice(5)}`); if (pc && collapsePrev) pc.classList.remove("open-full"); }
    if (sel) $(`#card-${sel.slice(5)}`)?.classList.add("open-full");
  }
  if (tab !== "code" || S.code.ctx) renderPanel(tab);
  if (scroll && sel) { const el = $(`[data-sel="${CSS.escape(sel)}"]`, root); el?.scrollIntoView({ block: "center" }); }
  if (S.tab === tab) setHash();
}

// ---------------------------------------------------------------- shared: code rows and excerpts
const SIGN = ["&nbsp;", "+", "-"];
function rowHtml(fi, r, cls = "", lineButtons = true) {
  const [k, o, nn, b, h] = r;
  const num = k === 2 ? o : nn, lk = lkOf(fi, r);
  const btn = lineButtons ? `<button class="lnb" tabindex="-1" data-act="lc" data-lk="${lk}" aria-label="${esc(L(k === 2 ? "p.line.removed" : k === 1 ? "p.line.added" : "p.line.context", num))}">${num}</button>` : num;
  const kc = k === 1 ? "a" : k === 2 ? "d" : "c";
  return `<tr class="r ${kc} ${cls}" data-b="${b || ""}" data-lk="${lk}"><td class="lo">${k === 2 ? btn : (o ?? "")}</td><td class="ln">${k !== 2 ? btn : ""}</td><td class="cd"><span class="sg">${SIGN[k]}</span>${h || " "}</td></tr>`;
}
const COLS = `<colgroup><col class="c-num"><col class="c-num"><col></colgroup>`;
function excerptRanges(fi, test, pad = 2) {
  const out = [];
  F[fi].hunks.forEach((h, hi) => {
    let cur = null;
    h.rows.forEach((r, ri) => {
      if (!test(r)) return;
      const s = Math.max(0, ri - pad), e = Math.min(h.rows.length - 1, ri + pad);
      if (cur && s <= cur[2] + 3) cur[2] = Math.max(cur[2], e); else { cur = [hi, s, e]; out.push(cur); }
    });
  });
  return out;
}
function excerptTable(fi, ranges, max, hit) {
  let html = "", shown = 0, total = 0;
  for (const [, s, e] of ranges) total += e - s + 1;
  ranges.forEach(([hi, s, e], i) => {
    if (shown >= max) return;
    if (i > 0) html += `<tr class="gap"><td colspan="3" class="gcell">⋯</td></tr>`;
    const rows = F[fi].hunks[hi].rows;
    for (let ri = s; ri <= e && shown < max; ri++, shown++) html += rowHtml(fi, rows[ri], hit && hit(rows[ri]) ? "hit" : "", false);
  });
  return { html: `<table class="diff">${COLS}<tbody>${html}</tbody></table>`, shown, total };
}
function excerptHtml(bid) {
  const b = blk(bid);
  if (!b) return "";
  const ranges = excerptRanges(b.file, (r) => r[3] === bid);
  const key = "ex" + bid, t = excerptTable(b.file, ranges, S.more[key] ? 1e9 : 24);
  return `<div class="excerpt" data-ex="${bid}"><div class="ex-h">${chip("b", bid)}<span class="ex-path">${pathHtml(b.path)} <span class="muted">${esc(b.where)}</span></span>${verdictTag(b.verdict)}</div>
    ${b.does ? `<div class="ex-does">${prose(b.does)}</div>` : ""}${b.whole ? `<div class="ex-whole"><span class="lbl">${esc(L("whole"))}</span>${prose(b.whole)}</div>` : ""}${t.html}
    <div class="ex-more">${t.shown < t.total ? `<button class="btn sm quiet" data-act="more" data-more="${esc(key)}">${esc(P("p.more.lines", t.total))}</button>` : ""}<button class="btn sm quiet" data-go="b:${bid}">${esc(L("p.show-in-code"))}</button><button class="btn sm quiet" data-act="copy-block" data-b="${bid}">${esc(L("p.copy"))}</button></div></div>`;
}
function placeExcerpt(place, row) {
  if (!place) return "";
  if (!row) return `<div class="excerpt outside"><span class="mono">${esc(place.text)}</span> — ${esc(L(place.file == null ? "p.place.outside" : "p.place.unchanged"))}</div>`;
  const ranges = excerptRanges(row.fi, (r) => r === row.row, 3);
  const hit = (r) => { const v = place.base ? r[1] : r[2]; return v >= place.line && v <= place.end && r[0] !== (place.base ? 1 : 2); };
  const t = excerptTable(row.fi, ranges, 40, hit), lk = lkOf(row.fi, row.row);
  return `<div class="excerpt"><div class="ex-h"><span class="ex-path">${pathHtml(F[row.fi].path)}<span class="muted">:${place.line}${place.end !== place.line ? "–" + place.end : ""}${place.base ? " " + esc(L("p.place.base")) : ""}</span></span>${row.row[3] ? chip("b", row.row[3]) : ""}</div>${t.html}
    <div class="ex-more"><button class="btn sm quiet" data-act="goline" data-lk="${lk}">${esc(L("p.show-in-code"))}</button><button class="btn sm quiet" data-act="copy-text" data-copy="${esc(refText(row.fi, place.base ? "-" : "+", place.line, place.end))}">${esc(L("p.copy"))}</button></div></div>`;
}
function excerptList(ids, key, first = 3) {
  if (!ids.length) return `<p class="muted">${esc(L("p.no-block"))}</p>`;
  const sorted = [...ids].sort((a, b) => (blk(a).verdict === "keep") - (blk(b).verdict === "keep") || ORDER.indexOf(blk(a)) - ORDER.indexOf(blk(b)));
  const shown = S.more[key] ? sorted : sorted.slice(0, first);
  return shown.map((id) => excerptHtml(id)).join("") + (sorted.length > shown.length ? `<button class="btn sm" data-act="more" data-more="${esc(key)}">${esc(P("p.more.blocks", sorted.length - shown.length))}</button>` : "");
}
// A requirement's code as a map: the routes that serve it, step by step with each step's role, then its other blocks
// by unit, one line each, those that need attention first. A row opens its excerpt in place, one at a time, so the
// requirement stays in view; a route's step whose block does not serve the requirement itself is shown aside.
function codeMap(r) {
  const key = "req" + r.id, mine = new Set(r.blocks), seen = new Set(), attention = (id) => blk(id).verdict !== "keep";
  const at = (id) => { const i = ORDER.indexOf(blk(id)); return i < 0 ? 1e9 : i; };
  const row = (id, text, step) => {
    const b = blk(id), open = S.cmap[key] === id;
    return `<button class="cmap-tog${mine.has(id) ? "" : " aside"}" data-act="cmap" data-key="${esc(key)}" data-b="${id}" aria-expanded="${open}"><span class="cmap-line">${step ? `<span class="cmap-n">${step}</span>` : ""}<span class="cmap-id">B${id}</span><span class="cmap-place" title="${esc(b.path)}">${esc(splitPath(b.path)[1])} <span class="muted">${esc(b.where)}</span></span>${mine.has(id) ? "" : `<span class="cmap-aside" title="${esc(L("p.cmap.aside-title"))}">${esc(L("p.cmap.aside"))}</span>`}${attention(id) ? verdictTag(b.verdict) : ""}</span><span class="cmap-text">${prose(text || b.does)}</span></button>${open ? `<div class="cmap-ex">${excerptHtml(id)}</div>` : ""}`;
  };
  const groups = D.routes.map((rt, i) => [rt, i]).filter(([rt]) => rt.requirements.includes(r.id)).map(([rt, i]) => `<div class="cmap-g"><div class="cmap-gh"><button class="linkish" data-act="goroute" data-route="${i}">${esc(L("p.route"))}</button> ${prose(rt.title)}</div>${rt.steps.map((s, k) => { seen.add(s.block); return row(s.block, s.role, k + 1); }).join("")}</div>`);
  const byUnit = new Map();
  for (const id of r.blocks.filter((id) => !seen.has(id))) { const u = blk(id).unit ?? ""; byUnit.set(u, [...(byUnit.get(u) ?? []), id]); }
  const units = [...byUnit].map(([u, ids]) => [u, ids.sort((a, b) => attention(b) - attention(a) || at(a) - at(b))])
    .sort(([ua, a], [ub, b]) => (ua === "") - (ub === "") || b.some(attention) - a.some(attention) || at(a[0]) - at(b[0]));
  for (const [u, ids] of units) {
    const unit = D.units.find((x) => x.name === u);
    groups.push(`<div class="cmap-g"><div class="cmap-gh">${u ? `<span class="lbl">${esc(L("unit"))}</span><span class="mono">${esc(u)}</span>${unit?.jobs?.length ? ` <span class="muted">— ${esc(unit.jobs.join("; "))}</span>` : ""}` : `<span class="lbl">${esc(L("p.cmap.no-unit"))}</span>`}</div>${ids.map((id) => row(id)).join("")}</div>`);
  }
  return `<div class="cmap">${groups.join("")}</div>`;
}
function miniItem(c) {
  const st = statusOf(c);
  return `<div class="mini"><div class="mh">${chip(c.type, c.ref.id)}<span class="muted small">${esc(typeText(c))}</span><span class="status" data-status="${esc(c.key)}">${tagHtml(st)}</span></div><div class="mt">${prose(itemTitle(c))}</div><div class="answer-line small" data-answer="${esc(c.key)}">${answerHtml(st)}</div></div>`;
}

// ---------------------------------------------------------------- paragraph comments: anchored to an item or a part of the report, and its field
// An anchor is "item/field": q2/context.0, f3/what, verdict/paragraph.1, recommendation/text, step.2/text,
// scenario.1/change, challenge.1/point. Its words come from anchorLabel, never from the page that drew it.
function pcWrap(anchor, inner, tag = "div") {
  return `<${tag} class="pc" data-anchor="${esc(anchor)}">${inner}<div class="pc-x" data-pcx="${esc(anchor)}">${pcExtra(anchor)}</div><button class="pc-btn" data-act="pc-open" data-anchor="${esc(anchor)}" aria-label="${esc(L("p.pc.on", anchorLabel(anchor)))}" title="${esc(L("p.pc.comment"))}">${ICON.comment}</button></${tag}>`;
}
function pcExtra(anchor) {
  if (S.pcEdit === anchor) return `<div class="pc-h">${esc(L("p.pc.yours-on", anchorLabel(anchor)))}</div>${quoteHtml(S.pcRange?.anchor === anchor ? S.pcRange : PC.get(anchor))}<textarea class="answer pc-input" data-anchor="${esc(anchor)}" aria-label="${esc(L("p.pc.yours"))}">${esc(S.pcDraft[anchor] ?? PC.get(anchor)?.text ?? "")}</textarea>
    <div class="field-actions"><button class="btn sm" data-act="pc-save" data-anchor="${esc(anchor)}">${esc(L("p.comment.save"))}</button><button class="btn sm quiet" data-act="pc-cancel">${esc(L("p.cancel"))}</button><span>${esc(L("p.saves", MOD))}</span></div>`;
  const v = PC.get(anchor);
  const saved = v ? `<div class="pc-h">${esc(L("p.pc.yours"))}<button class="btn sm quiet" data-act="pc-open" data-anchor="${esc(anchor)}">${esc(L("p.edit"))}</button><button class="btn sm quiet" data-act="pc-del" data-anchor="${esc(anchor)}">${esc(L("p.delete"))}</button></div>${quoteHtml(v)}<div class="pc-t">${esc(v.text)}</div>` : "";
  // text typed in an editor another one closed: kept, not saved, until it is saved or cancelled
  const draft = S.pcDraft[anchor] !== undefined ? `<div class="pc-h">${esc(L("p.pc.draft"))}<button class="btn sm quiet" data-act="pc-open" data-anchor="${esc(anchor)}">${esc(L("p.edit"))}</button></div><div class="pc-t">${esc(S.pcDraft[anchor])}</div>` : "";
  return saved + draft;
}
function refreshPc(anchor) { for (const el of $$(`[data-pcx="${CSS.escape(anchor)}"]`)) el.innerHTML = pcExtra(anchor); }
function textBlockPc(v, item) {
  let out = "", list = [], i = 0;
  const flush = () => { if (list.length) { out += `<ul class="bullets">${list.map(([t, a]) => pcWrap(a, `<span class="pf">${prose(t)}</span>`, "li")).join("")}</ul>`; list = []; } };
  for (const line of String(v ?? "").split("\n")) {
    if (/^\s*-\s+/.test(line)) list.push([line.replace(/^\s*-\s+/, ""), `${item}/paragraph.${i++}`]);
    else { flush(); if (line.trim()) { const a = `${item}/paragraph.${i++}`; out += pcWrap(a, `<p class="pf${i === 1 ? " lead" : ""}">${prose(line)}</p>`); } }
  }
  flush();
  return out;
}
function textBlock(v) {
  let out = "", list = [];
  const flush = () => { if (list.length) { out += `<ul class="bullets">${list.map((l) => `<li>${prose(l)}</li>`).join("")}</ul>`; list = []; } };
  for (const line of String(v ?? "").split("\n")) {
    if (/^\s*-\s+/.test(line)) list.push(line.replace(/^\s*-\s+/, ""));
    else { flush(); if (line.trim()) out += `<p>${prose(line)}</p>`; }
  }
  flush();
  return out;
}
const FIELD = { text: "p.field.text", what: "p.field.what", fix: "p.field.fix", shown_by: "p.field.shown_by", context: "p.field.context", paragraph: "p.field.paragraph",
  point: "p.field.point", note: "p.field.note", change: "p.field.change" };
const PART = { verdict: "p.part.verdict", recommendation: "p.part.recommendation", step: "p.part.step", scenario: "p.part.scenario", challenge: "p.part.challenge" };
function anchorLabel(anchor) {
  const [item, field] = cutLast(anchor, "/"), [part, number] = field.split("."), [kind, id] = cut(item, ".");
  const fieldText = L(FIELD[part], +number + 1);
  return `${itemByKey.has(item) ? itemByKey.get(item).label : L(PART[kind], id)}, ${fieldText}`;
}

// ---------------------------------------------------------------- the choice: one control, two densities
function draftHtml(c) {
  const st = statusOf(c);
  if (!st.draft || st.state !== "open") return "";
  const what = st.draft.choice !== undefined ? L("p.draft.option", draftText(c, st.draft)) : L("p.draft.own", st.draft.text);
  return `<div class="draft">${esc(L("p.draft", what))}<button class="btn sm" data-act="apply-draft" data-key="${esc(c.key)}">${esc(L("p.draft.apply"))}</button></div>`;
}
function deferField(c) {
  return `<div class="field"><label for="reason-${esc(c.key)}-${S.uid}">${esc(L("p.defer.why", c.label))}</label><textarea class="answer" id="reason-${esc(c.key)}-${S.uid}" data-act="reason" data-key="${esc(c.key)}" placeholder="${esc(L("p.defer.placeholder"))}">${esc(S.reasonText[c.key] ?? "")}</textarea>
    <div class="field-actions"><button class="btn sm" data-act="defer-save" data-key="${esc(c.key)}">${esc(L("p.defer"))}</button><button class="btn sm quiet" data-act="field-close" data-key="${esc(c.key)}">${esc(L("p.cancel"))}</button><span>${esc(L("p.defer.keys", MOD))}</span><span class="defer-hint" data-defer-hint="${esc(c.key)}"></span></div></div>`;
}
// The own-answer field is open while the owner chose «Other», or while an own answer is in effect.
const ownInEffect = (c) => Boolean(optionsOf(c).length && entryOf(c.key).text !== undefined && !entryOf(c.key).deferred);
const otherOpen = (c) => S.field[c.key] === "other" || ownInEffect(c);
function textField(c) {
  const solo = !optionsOf(c).length, entry = entryOf(c.key);
  const label = L(solo ? (isRequest(c) ? "p.text.request" : "p.text.yours") : "p.text.other");
  const id = `text-${c.key}-${S.uid}`;
  const deferHint = c.kind === "evidence" ? `<p class="muted small">${esc(L("p.text.not-checked"))}</p>` : "";
  return `<div class="field"><label for="${esc(id)}">${esc(label)}</label>${deferHint}<textarea class="answer" id="${esc(id)}" data-act="text" data-key="${esc(c.key)}" placeholder="${esc(L(solo ? "p.text.placeholder" : "p.text.replaces"))}">${esc(entry.deferred ? "" : entry.text ?? "")}</textarea>
    <div class="field-actions"><span>${esc(L("p.text.keys", MOD))}</span></div></div>`;
}
function choiceInner(c, where) {
  S.uid = (S.uid ?? 0) + 1;
  const st = statusOf(c), entry = entryOf(c.key), opts = optionsOf(c);
  if (st.state === "na") return `<p class="norecord">${esc(L("p.na.while"))} ${chip("q", c.ref.parent.question)}</p>${st.draft ? `<p class="norecord">${esc(L("p.na.draft", draftText(c, st.draft)))}</p>` : ""}`;
  const field = S.field[c.key], other = otherOpen(c);
  const zones = c.kind === "evidence" && c.ref.zones.length ? `<ul class="zones">${c.ref.zones.map((z, i) => `<li><label><input type="checkbox" data-act="zone" data-key="${esc(c.key)}" data-zone="${i}"${entry.zones?.[i] ? " checked" : ""}> ${prose(z.text)} <span class="muted small">${esc(L("p.zone.mark"))}</span></label></li>`).join("")}</ul>` : "";
  const deferred = st.state === "deferred" ? `<div class="draft">${esc(L("p.deferred", st.answer))}<button class="btn sm" data-act="undefer" data-key="${esc(c.key)}">${esc(L("p.undefer"))}</button></div>` : "";
  const touched = Object.keys(entry).length;
  const actions = `<div class="choice-actions">${st.state === "deferred" ? "" : `<button class="btn sm" data-act="defer" data-key="${esc(c.key)}" aria-expanded="${field === "defer"}">${esc(L("p.defer.open"))}<span class="key">d</span></button>`}${touched ? `<button class="btn sm quiet" data-act="clear" data-key="${esc(c.key)}">${esc(L("p.clear"))}<span class="key">x</span></button>` : ""}</div>`;
  // A checked control is the answer in effect; the own-answer field may be open while an earlier answer still holds.
  // A decision whose variants combine takes several, as checkboxes; any other takes one, as radios.
  const chosen = (o) => isChosen(c, o.id), own = ownInEffect(c), several = Boolean(c.multiple);
  const type = several ? "checkbox" : "radio", group = several ? "group" : "radiogroup";
  let body = "";
  if (!opts.length) body = textField(c);
  else if (where === "card") {
    const name = `ch-${c.key}-${S.uid}`;
    body = `${several ? `<p class="muted small">${esc(L("p.choose-several"))}</p>` : ""}<div class="opts" role="${group}" aria-label="${esc(L("p.answer-to", c.label))}">${opts.map((o, i) => `<label class="opt${chosen(o) ? " on" : ""}"><input type="${type}" name="${esc(name)}" data-act="pick" data-key="${esc(c.key)}" data-opt="${esc(o.id)}"${chosen(o) ? " checked" : ""}><span class="ol">${prose(o.label)}${o.rec ? `<span class="rec-mark">${esc(L("p.recommended"))}</span>` : ""}</span><span class="key">${o.key ?? i + 1}</span>${o.sub ? `<span class="os">${prose(o.sub)}</span>` : ""}</label>`).join("")}
      ${several ? `<button type="button" class="opt opt-other${own ? " on" : ""}" aria-pressed="${own}" data-act="pick" data-key="${esc(c.key)}" data-opt=""><span></span><span class="ol">${esc(L("p.text.other"))}</span><span class="key">o</span></button>`
        : `<label class="opt${own ? " on" : ""}"><input type="radio" name="${esc(name)}" data-act="pick" data-key="${esc(c.key)}" data-opt=""${own ? " checked" : ""}><span class="ol">${esc(L("p.text.other"))}</span><span class="key">o</span></label>`}${other ? `<div class="opt-field">${textField(c)}</div>` : ""}</div>`;
  } else {
    const vertical = opts.some((o) => o.label.length > 40) || opts.length > 3;
    body = `${several ? `<p class="muted small">${esc(L("p.choose-several"))}</p>` : ""}<div class="pills${vertical ? " vertical" : ""}" role="${group}" aria-label="${esc(L("p.answer-to", c.label))}">${opts.map((o, i) => `<button class="pill" role="${type}" aria-checked="${chosen(o)}" data-act="pick" data-key="${esc(c.key)}" data-opt="${esc(o.id)}"><span class="key">${o.key ?? i + 1}</span><span class="pt">${prose(o.label)}${vertical && o.sub ? `<span class="ps">${prose(o.sub)}</span>` : ""}</span></button>`).join("")}
      <button class="pill" ${several ? `aria-pressed="${own}"` : `role="radio" aria-checked="${own}"`} data-act="pick" data-key="${esc(c.key)}" data-opt=""><span class="key">o</span><span class="pt">${esc(L("p.other-short"))}</span></button></div>${other ? textField(c) : ""}`;
  }
  return zones + body + draftHtml(c) + deferred + (field === "defer" ? deferField(c) : "") + actions;
}
function choiceHtml(c, where) { return `<div class="choice" data-choice="${esc(c.key)}" data-where="${where}">${choiceInner(c, where)}</div>`; }
function cardHtml(c) {
  const r = c.ref, st = statusOf(c), sel = S.sel.decisions === "card:" + c.key, settled = st.state !== "open";
  let body = `<div class="card-head"><span class="card-id">${c.label}</span><span class="card-type">${esc(typeText(c))}</span><span class="status" data-status="${esc(c.key)}">${tagHtml(st)}</span></div>`;
  if (c.kind === "finding") {
    body += `<p class="card-title">${prose(r.title)}</p><div class="card-at">${slashBreaks(r.at)}</div>${pcWrap(c.key + "/what", `<p class="card-text clamp pf" data-clamp>${prose(r.what)}</p>`)}`;
    body += pcWrap(c.key + "/fix", `<div class="card-fix"><b>${esc(L("p.fix.proposed"))}</b><span class="pf">${prose(r.fix)}</span></div>`);
  } else if (c.kind === "idea") {
    body += `<p class="card-title">${prose(r.title)}</p>${r.at ? `<div class="card-at">${slashBreaks(r.at)}</div>` : ""}${pcWrap(c.key + "/text", `<p class="card-text clamp pf">${prose(r.text)}</p>`)}`;
  } else {
    body += pcWrap(c.key + "/text", `<p class="card-title q pf">${prose(r.text)}</p>`) + `<div class="card-at">${slashBreaks(r.at)}</div>`;
    if (r.parent) body += `<p class="card-text small">${esc(L("p.applies-while"))} ${chip("q", r.parent.question)} ${esc(L("p.applies-with"))} ${r.parent.texts.map((v) => `<b>${prose(v)}</b>`).join(` ${esc(L("p.or"))} `)}.</p>`;
    if (r.recommendation) { const picks = recommendedTexts(r); body += `<div class="card-rec${picks.length ? "" : " none"}"><b>${esc(L("p.recommendation"))}</b> ${picks.length ? `<span class="rec-pick">${picks.map((t) => prose(t)).join(" + ")}</span> — ` : ""}${prose(r.recommendation.text)}</div>`; }
  }
  body += `<div class="answer-line${st.unverified ? " unverified" : ""}" data-answer="${esc(c.key)}">${answerHtml(st)}</div>`;
  if (c.parent) body += `<p class="waiting small" data-waiting="${esc(c.key)}">${esc(waitingText(c))}</p>`;
  body += choiceHtml(c, "card");
  body += `<p class="leaving-note small">${esc(L("p.card.leaving"))}</p>`;
  const foot = [];
  if (c.blocks.length) foot.push(`<span class="lbl">${esc(L("p.code"))}</span><span>${esc(P("p.count.blocks", c.blocks.length))}</span><button class="btn sm quiet" data-act="item-code" data-key="${esc(c.key)}">${esc(L("p.show-in-code"))}</button>`);
  else if (c.placeBlock) foot.push(`<span class="lbl">${esc(L("p.at"))}</span>${chip("b", c.placeBlock)}`);
  if (foot.length) body += `<div class="card-foot">${foot.join("")}</div>`;
  const compact = `<div class="compact"><span class="card-id">${c.label}</span><span class="ctitle">${prose(itemTitle(c))}</span><span class="answer" data-compact-answer="${esc(c.key)}">${esc(compactAnswer(st))}</span><span class="status" data-status="${esc(c.key)}">${tagHtml(st)}</span><button class="btn sm quiet" data-act="selcard" data-key="${esc(c.key)}">${esc(L("p.change"))}</button></div>`;
  return `<article class="card selectable${settled ? " settled" : ""}${sel ? " sel open-full" : ""}${r.parent ? " child" : ""}" id="card-${esc(c.key)}" data-card="${esc(c.key)}" data-sel="card:${esc(c.key)}" tabindex="-1" aria-label="${esc(`${c.label}: ${itemTitle(c).slice(0, 120)}`)}">${compact}<div class="full">${body}</div></article>`;
}

// ---------------------------------------------------------------- changing an answer, and keeping every view in step
function setState(next) { state = next; indexComments(); save(); }
// A variant (or «fix it», «take it»…) is the answer; an empty option is «Other», which only opens the own-answer
// field: the answer in effect changes once the owner writes there, and closing the field untouched keeps it.
function pick(key, opt) {
  const c = itemByKey.get(key);
  if (!applicable(c)) return;
  // one variant taken is not the end of a choice of several: its block stays open in the code until the owner moves on
  if (c.multiple && S.tab === "code" && S.cur?.key === key) S.code.doneOpen.add(S.cur.bid);
  if (opt) { setState(DR.choose(ITEMS, state, key, opt)); S.field[key] = null; }
  else S.field[key] = "other";
  afterChange(key, { structural: true, focusText: !opt });
}
function setText(key, value) { setState(DR.write(ITEMS, state, key, value)); afterChange(key, { structural: false }); }
function openField(key, which) {
  const c = itemByKey.get(key);
  if (!applicable(c)) return;
  if (which === "other") { if (optionsOf(c).length) return pick(key, ""); S.field[key] = null; afterChange(key, { structural: true, focusText: true }); return; }
  S.field[key] = which;
  afterChange(key, { structural: true, focusReason: which === "defer" });
}
function confirmDefer(key) {
  const next = DR.defer(ITEMS, state, key, S.reasonText[key] ?? "");
  if (next === state) {
    for (const el of $$(`[data-defer-hint="${key}"]`)) el.textContent = L("p.defer.reason-first");
    $(`[data-choice="${key}"] textarea[data-act="reason"]`)?.focus();
    return false;
  }
  setState(next); S.field[key] = null; delete S.reasonText[key];
  afterChange(key, { structural: true });
  return true;
}
function clearAnswer(key) { setState(DR.clear(ITEMS, state, key)); S.field[key] = null; delete S.reasonText[key]; afterChange(key, { structural: true }); }
// structural: the item's controls and the code around its blocks are redrawn; while the owner types, only the
// words that report the state change, so the field keeps its focus
function afterChange(key, { structural, focusText = false, focusReason = false }) {
  const c = itemByKey.get(key);
  // a parent's answer can retire or restore its conditional questions: every descendant is drawn again
  for (const k of familyOf(c)) syncItem(k, structural || k !== key);
  reconcileDecList(structural);
  invalidateWalk(); updateChrome(); updatePos();
  if (focusText || focusReason) {
    const scope = S.tab === "code" ? $(`#note-${S.sel.code ?? ""}`) ?? document : $(`#card-${key}`) ?? document;
    const t = $(`[data-choice="${key}"] textarea[data-act="${focusReason ? "reason" : "text"}"]`, scope) ?? $(`[data-choice="${key}"] textarea[data-act="${focusReason ? "reason" : "text"}"]`);
    t?.focus();
  }
}
function syncItem(key, structural) {
  const c = itemByKey.get(key), st = statusOf(c);
  for (const el of $$(`[data-status="${key}"]`)) el.innerHTML = tagHtml(st);
  for (const el of $$(`[data-answer="${key}"]`)) { el.innerHTML = answerHtml(st); el.classList.toggle("unverified", Boolean(st.unverified)); }
  for (const el of $$(`[data-compact-answer="${key}"]`)) el.textContent = compactAnswer(st);
  for (const el of $$(`[data-waiting="${key}"]`)) el.textContent = waitingText(c);
  for (const card of $$(`#card-${key}`)) card.classList.toggle("settled", st.state !== "open");
  // while the owner types an own answer, the controls already show which answer is in effect
  const own = ownInEffect(c), entry = entryOf(key);
  for (const el of $$(`[data-choice="${key}"] [data-act="pick"]`)) {
    const on = el.dataset.opt ? isChosen(c, el.dataset.opt) : own;
    if (el.tagName === "INPUT") el.checked = on; else el.setAttribute(el.hasAttribute("aria-pressed") ? "aria-pressed" : "aria-checked", String(on));
  }
  if (!structural) return;
  const active = document.activeElement;
  for (const box of $$(`[data-choice="${key}"]`)) {
    if (box.contains(active) && active.matches("textarea")) continue;
    const had = box.contains(active) ? (active.dataset.act + "|" + (active.dataset.opt ?? "")) : null;
    box.innerHTML = choiceInner(c, box.dataset.where);
    if (had) $$("[data-act]", box).find((el) => el.dataset.act + "|" + (el.dataset.opt ?? "") === had)?.focus();
  }
  if (S.rendered.code) refreshCodeFor(c);
}

// ---------------------------------------------------------------- Summary
function shareBar(s, cls = "") {
  const total = Object.values(s).reduce((a, b) => a + b, 0) || 1;
  const words = Object.entries(s).filter(([, v]) => v).map(([k, v]) => `${verdictWord(k)} ${P("p.count.lines-n", v)}`).join(", ");
  return `<span class="vbar ${cls}" role="img" aria-label="${esc(words || L("p.no-lines"))}">${["keep", "fix", "remove", "question"].map((k) => s[k] ? `<span class="s-${k}" style="width:${(100 * s[k] / total).toFixed(2)}%"></span>` : "").join("")}</span>`;
}
// one status per requirement, as review.mjs found it, in words; what limits it is a note, never a second tag
const REQ_TAG = { permission: "neutral", fail: "bad", met: "ok", unchecked: "open" };
function reqPrimary(r) {
  const tag = `<span class="tag ${REQ_TAG[r.state]}">${esc(L("p.req." + r.state))}</span>`;
  return { key: r.state, html: r.state === "fail" ? `${tag} ${chips("f", r.broken)}` : r.state === "met" ? `${tag} <span class="small muted">${esc(L("evidence." + r.met))}</span>` : tag };
}
function reqStatus(r) {
  const notes = [];
  if (r.not_checked) notes.push(`<div class="req-note"><b>${esc(L("p.req.not-checked"))}</b>${prose(r.not_checked)}</div>`);
  if (r.untested.length) notes.push(`<div class="req-note need"><b>${esc(L("p.req.no-test"))}</b>${chips("f", r.untested)}</div>`);
  return reqPrimary(r).html + notes.join("");
}
function reqLine() {
  const c = { met: 0, fail: 0, unchecked: 0, permission: 0 };
  for (const r of D.requirements) c[reqPrimary(r).key]++;
  const WORD = { met: "p.reqline.met", fail: "p.reqline.fail", unchecked: "p.reqline.unchecked", permission: "p.reqline.permission" };
  const parts = Object.entries(c).filter(([, k]) => k).map(([kind, k]) => P(WORD[kind], k));
  return `<b>${esc(P("p.reqline", D.requirements.length))}</b> <span>${esc(parts.join(" · "))}</span><a href="#summary-reqs" data-act="to-reqs" class="small">${esc(L("p.reqline.table"))}</a>`;
}
const summaryProgress = () => { const p = progress(); return `${p.choices ? `<b>${esc(L("p.progress.of", n(p.decided), n(p.choices)))}</b>` : ""}<span>${esc([p.choices && L("p.progress.decided"), requestWords(p), p.deferred && P("p.count.deferred", p.deferred)].filter(Boolean).join(" · "))}</span>`; };
function firstOpenItem() { return REVIEW_ORDER.find(isOpen); }
function startReview() {
  const c = firstOpenItem();
  if (!c) return toast(L("p.start.none"));
  goCard(c.key, { focus: true });
}
function summaryHtml() {
  const c = D.counters, shares = c.verdictLines;
  const notChecked = [...D.coverageStructured.filter((x) => x.kind === "not_checked").map((x) => `<li>${prose(x.text)} ${srcList(x.sources)}</li>`),
    ...D.requirements.filter((r) => r.not_checked).map((r) => `<li>${chip("r", r.id)} ${prose(r.not_checked)}</li>`)];
  const requests = ITEMS.filter(isRequest);
  const status = [c.addedFiles && P("p.count.new", c.addedFiles), c.removedFiles && P("p.count.deleted", c.removedFiles)].filter(Boolean).join(" · ");
  return `<div class="statrow">
      <div class="stat"><b>${esc(P("p.count.files", c.files))}</b>${status ? `<span>${esc(status)}</span>` : ""}</div>
      <div class="stat"><b><span class="add">+${n(c.lines.added)}</span> <span class="del">−${n(c.lines.removed)}</span></b><span>${esc(L("p.lines"))}</span></div>
      <div class="stat"><b>${esc(P("p.count.blocks", c.blocks))}</b>${shareBar(shares)}<div class="legend">${["keep", "fix", "remove", "question"].map((k) => `<span><i class="s-${k}"></i>${esc(L("p.verdict.reviewer"))} ${esc(verdictWord(k))} ${esc(L("p.legend", P("p.count.blocks", c.verdicts[k] ?? 0), P("p.count.lines-n", shares[k])))}</span>`).join("")}</div><p class="muted small">${esc(L("p.legend.note"))}</p></div>
      <div class="cta"><div class="stat" id="sum-progress">${summaryProgress()}</div><button class="btn primary" id="start-btn" data-act="start">${esc(L("p.start"))}</button></div>
      <div class="reqline">${reqLine()}</div>
    </div>
    <div class="section-h"><h2>${esc(L("verdict"))}</h2></div>
    ${textBlockPc(D.verdict, "verdict")}
    <div class="rec"><h3>${esc(L("recommendation"))}</h3>${pcWrap("recommendation/text", `<p class="pf">${prose(D.recommendation)}</p>`)}
      ${D.steps.length ? `<ol class="steps">${D.steps.map((s, i) => `<li data-sel="step:${i}" data-act="sel" tabindex="0">${pcWrap(`step.${i + 1}/text`, `<span><span class="pf">${prose(s.text)}</span>${s.findings.length ? ` ${chips("f", s.findings)}` : ""}</span>`)}</li>`).join("")}</ol>` : ""}</div>
    ${D.routes.length ? `<div class="section-h" id="summary-routes"><h2>${esc(L("routes"))}</h2><span class="muted">${esc(L("p.routes.note"))}</span></div>
    <ul class="routes">${D.routes.map((r, i) => `<li class="route-row" data-sel="route:${i}" data-act="sel" tabindex="0"><span class="route-t">${prose(r.title)}</span><span class="muted small">${esc(P("p.count.steps", r.steps.length))}</span>${r.requirements.length ? chips("r", r.requirements) : ""}</li>`).join("")}</ul>` : ""}
    <div class="section-h" id="summary-reqs"><h2>${esc(L("requirements"))}</h2><span class="muted">${esc(L("p.req.note"))}</span></div>
    <table class="tbl"><thead><tr><th>#</th><th>${esc(L("requirement"))}</th><th>${esc(L("status"))}</th><th class="num">${esc(L("p.code"))}</th></tr></thead><tbody>
    ${reqGroups().map(([head, list]) => (head ? `<tr class="grp"><th colspan="4">${esc(head)} <span class="muted">${n(list.length)}</span></th></tr>` : "") + list.map((r) => `<tr class="selectable" data-sel="req:${esc(r.id)}" data-act="sel" tabindex="0"><td class="id">R${esc(r.id)}</td><td>${prose(r.text)}<div class="why"><b>${esc(L("source"))}</b>${esc(L("source." + r.source))}${r.sources.length ? ` · <span class="srcs">${srcItems(r.sources)}</span>` : ""}</div>${!r.established && askedIn(r.id).length ? `<div class="why"><b>${esc(L("p.req.asked-in"))}</b>${chips("q", askedIn(r.id))}</div>` : ""}${r.doubt ? `<div class="why"><b>${esc(L("p.req.doubt"))}</b>${prose(r.doubt)}</div>` : ""}</td><td class="req-status">${reqStatus(r)}</td>
      <td class="num">${r.blocks.length ? `<button class="linkbtn nowrap" data-act="req-code" data-req="${esc(r.id)}" title="${esc(L("p.req.code-title", r.id))}">${esc(P("p.count.blocks", r.blocks.length))}</button>` : `<span class="muted small">${esc(L("p.req.none-linked"))}</span>`}</td></tr>`).join("")).join("")}
    </tbody></table>
    <div class="section-h"><h2>${esc(L("p.limits"))}</h2><span class="muted">${esc(L("p.limits.note"))}</span></div>
    <div class="box">
      ${notChecked.length ? `<h3>${esc(L("coverage.not-checked"))}</h3><ul class="dash">${notChecked.join("")}</ul>` : ""}
      ${requests.length ? `<h3 class="gap-top">${esc(L("p.limits.requests"))}</h3><ul class="plain">${requests.map((x) => `<li>${chip("q", x.ref.id)} <span class="status" data-status="${esc(x.key)}">${tagHtml(statusOf(x))}</span> ${prose(x.ref.text.length > 220 ? x.ref.text.slice(0, 220) + "…" : x.ref.text)}</li>`).join("")}</ul>` : ""}
      ${D.coverage ? `<h3 class="gap-top">${esc(L("p.coverage.written"))}</h3><p class="${D.coverage.length > 360 ? "clamp" : ""}" id="cov-text">${prose(D.coverage)}</p>${D.coverage.length > 360 ? `<button class="linkbtn small" data-act="cov-more" aria-expanded="false">${esc(L("p.show-all"))}</button>` : ""}` : ""}
      <p class="muted small gap-top">${esc(L("p.limits.more"))}</p>
    </div>`;
}
function renderSummary() {
  $("#panel-summary").innerHTML = `<div class="frame"><div class="col">${summaryHtml()}</div><aside class="panel" id="ctx-summary" aria-label="${esc(L("p.context"))}"></aside></div>`;
  renderPanel("summary");
}
// Where a requirement comes from decides whether it binds; the ones to confirm are listed apart, each with the questions that ask about it.
const askedIn = (id) => D.questions.filter((q) => refsIn([q.context.flatMap((x) => x.sources), q.variants.flatMap((v) => v.consequences.flatMap((x) => x.sources)), q.recommendation?.sources ?? [], q.zones.flatMap((z) => z.sources)], "r").includes(id)).map((q) => q.id);
function reqGroups() {
  const est = D.requirements.filter((r) => r.established), rest = D.requirements.filter((r) => !r.established);
  return rest.length ? [[L("req.established"), est], [L("req.confirm-group"), rest]].filter(([, list]) => list.length) : [[null, est]];
}
// The variants a decision's recommendation names, by their words.
const recommendedTexts = (q) => (q.recommendation?.variant ? [q.recommendation.variant] : q.recommendation?.variants ?? []).map((id) => q.variants.find((v) => v.id === id)?.text).filter(Boolean);
// What a screen is about, from the record's own fields alone: the pictures given, the match it claims or the differences
// it found, the requirements that cite it and the findings its differences name, and what was not compared.
function screenFacts(si) {
  const s = D.screens[si];
  const reqs = D.requirements.filter((r) => r.screens.includes(si)).map((r) => r.id), finds = [...new Set(s.differences.map((d) => d.finding).filter(Boolean))];
  const outcome = s.match ? L("matches") : s.differences.length ? P("p.count.differences", s.differences.length) : "";
  return [
    [L("p.screen.pictures"), esc(s.pictures.length ? s.pictures.map((p) => L(p.kind)).join(", ") : L("no-pictures"))],
    outcome && [L("p.screen.outcome"), esc(outcome)],
    (reqs.length || finds.length) && [L("p.screen.related"), `${chips("r", reqs)}${chips("f", finds)}`],
    s.missing && [L("not-compared"), `<span class="screen-open">${prose(s.missing)}</span>`],
  ].filter(Boolean);
}
// A screen as Details shows it — its state, provenance, what it is about, pictures and differences — wherever a claim cites it.
function screenBox(si) {
  const s = D.screens[si];
  return `<div class="box box-gap screen-box"><h3 class="screen-h">${esc(s.name)}</h3>
      ${s.provenance.startsWith("historical") ? `<p><span class="provenance">${esc(L("p.screen." + s.provenance, s.revision))}</span> <span class="muted small">${esc(L("p.screen.historical-note"))}</span> ${srcList(s.sources)}</p>` : `<p class="muted small">${esc(L("p.screen." + s.provenance, s.revision))} ${srcList(s.sources)}</p>`}
      <dl class="kv screen-facts">${screenFacts(si).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join("")}</dl>
      ${s.pictures.length ? `<div class="screen-pics">${s.pictures.map((p) => p.embedded ? `<figure><figcaption class="muted small">${esc(L(p.kind))}</figcaption><button class="zoom-btn" data-act="zoom" data-pic="${si}-${p.kind}" aria-label="${esc(L("p.zoom.open", `${L(p.kind)}: ${s.name}`))}"><img src="${PICS.get(`${si}-${p.kind}`)}" alt="${esc(`${L(p.kind)}: ${s.name}`)}"></button></figure>` : p.link ? `<p><span class="lbl">${esc(L(p.kind))}</span><a href="${esc(p.link)}" rel="noreferrer">${esc(p.link)}</a></p>` : "").join("")}</div>` : ""}
      ${s.differences.length ? `<p class="lbl gap-top">${esc(L("p.screen.differences"))}</p><ul class="dash">${s.differences.map((d) => `<li>${prose(d.what)}${d.why ? ` <span class="muted">— ${prose(d.why)}</span>` : ""}${d.finding ? ` ${chip("f", d.finding)}` : ""}</li>`).join("")}</ul>` : ""}</div>`;
}
function summaryPanel(sel) {
  if (!sel) {
    const ch = D.change;
    return panelWrap(esc(L("change")), prose(ch.goal), `
      ${ch.why ? `<div class="psec"><h3>${esc(L("p.change.why"))}</h3><p>${prose(ch.why)}</p></div>` : ""}
      <div class="psec"><h3>${esc(L("p.change.parts"))}</h3><ul class="dash">${ch.parts.map((p) => `<li>${prose(p)}</li>`).join("")}</ul></div>
      <div class="psec"><h3>${esc(L("sources"))}</h3><ul class="dash">${ch.sources.map((p) => `<li>${prose(p)}</li>`).join("")}</ul></div>
      ${D.tradeoffs.length ? `<div class="psec"><h3>${esc(L("tradeoffs"))}</h3><ul class="plain">${D.tradeoffs.map((x) => `<li>${prose(x.text)} <span class="muted">${prose(x.consequence)}</span> ${srcList(x.sources)}</li>`).join("")}</ul></div>` : ""}
      <div class="psec"><p class="muted small">${esc(L("p.summary.select"))}</p></div>`);
  }
  if (sel.startsWith("req:")) {
    const r = reqById.get(sel.slice(4)), fs = [...new Set([...r.broken, ...r.untested])], attn = r.blocks.filter((id) => blk(id).verdict !== "keep").length;
    return panelWrap(esc(`${L("requirement")} R${r.id} · ${L("source." + r.source)}${r.established ? "" : ` · ${L("req.to-confirm")}`}`), prose(r.text), `
      <div class="psec"><h3>${esc(L("p.req.stated"))}</h3><p>${srcItems(r.sources)}</p>${r.screens.map(screenBox).join("")}</div>
      ${fs.length ? `<div class="psec"><h3>${esc(L("findings"))}</h3>${fs.map((f) => miniItem(itemByKey.get("f" + f))).join("")}</div>` : ""}
      <div class="psec"><h3>${esc(L("p.related"))}</h3>${relations("r", r.id)}</div>
      <div class="psec"><h3>${esc(L("p.code"))} · ${esc(P("p.count.blocks", r.blocks.length))}${attn ? ` · ${esc(P("p.count.attention", attn))}` : ""}${r.blocks.length ? `<button class="btn sm" data-act="req-code" data-req="${esc(r.id)}">${esc(L("p.show-in-code"))}</button>` : ""}</h3>${r.blocks.length ? codeMap(r) : `<p class="muted">${esc(L("p.no-block"))}</p>`}</div>`);
  }
  if (sel.startsWith("route:")) {
    // A route as a flow: each step a box with its block, place and role, a step whose block is not kept marked; the
    // arrow into a step says where it gets what the step before produced. A step opens its code in place, one at a time.
    const i = +sel.slice(6), r = D.routes[i], key = `route${i}`;
    const node = (s, k) => {
      const b = blk(s.block), open = S.cmap[key] === s.block;
      return `<li class="flow-step"><button class="cmap-tog flow-node${b.verdict !== "keep" ? " open-v" : ""}" data-act="cmap" data-key="${esc(key)}" data-b="${s.block}" aria-expanded="${open}"><span class="cmap-line"><span class="cmap-n" title="${esc(L("p.route.step", k + 1))}">${k + 1}</span><span class="cmap-id">B${s.block}</span><span class="cmap-place" title="${esc(b.path)}">${esc(splitPath(b.path)[1])} <span class="muted">${esc(b.where)}</span></span>${b.verdict !== "keep" ? verdictTag(b.verdict) : ""}</span><span class="flow-role">${prose(s.role)}</span></button>${open ? `<div class="cmap-ex">${excerptHtml(s.block)}</div>` : ""}</li>`;
    };
    const via = (s) => `<li class="flow-via"><span class="flow-arrow" aria-hidden="true"></span><span><span class="lbl">${esc(L("route.via"))}</span>${prose(s.via)}</span></li>`;
    return panelWrap(esc(`${L("p.route")} · ${P("p.count.steps", r.steps.length)}`), prose(r.title), `<div class="psec">
      ${r.requirements.length ? `<p class="small"><span class="lbl">${esc(L("p.route.serves"))}</span>${chips("r", r.requirements)}</p>` : ""}
      <ol class="cmap flow">${r.steps.map((s, k) => (k && s.via ? via(s) : "") + node(s, k)).join("")}</ol>
      <p class="muted small">${esc(L("p.route.note"))}</p></div>`);
  }
  if (sel.startsWith("step:")) {
    const i = +sel.slice(5), s = D.steps[i], ids = [...new Set(s.findings.flatMap((f) => itemByKey.get("f" + f)?.blocks ?? []))];
    return panelWrap(esc(L("p.rel.step", i + 1)), prose(s.text), `
      ${s.findings.length ? `<div class="psec"><h3>${esc(L("p.step.settles"))}</h3>${s.findings.map((f) => miniItem(itemByKey.get("f" + f))).join("")}</div>` : `<div class="psec"><p class="muted">${esc(L("p.step.none"))}</p></div>`}
      ${ids.length ? `<div class="psec"><h3>${esc(L("p.code"))} · ${esc(P("p.count.blocks", ids.length))}</h3>${excerptList(ids, "step" + i)}</div>` : ""}`);
  }
  return "";
}
function panelWrap(kicker, title, body) {
  return `<div class="panel-head"><div class="panel-kicker">${kicker}</div><h2 class="panel-title">${title}</h2></div><div class="panel-body">${body}</div>`;
}

// ---------------------------------------------------------------- Decisions
const comments = () => [
  ...state.lines.map((c) => ({ kind: "line", lk: lastLk(c), c })).filter((x) => x.lk),
  ...state.paragraphs.map((c) => ({ kind: "para", anchor: `${c.item}/${c.field}`, c })),
];
const DEC_TABS = [
  { id: "all", label: L("p.sub.all"), test: () => true },
  ...GROUPS.map((g) => ({ id: g.id, label: g.label, test: g.test })),
  { id: "comments", label: L("p.sub.comments"), test: () => false },
  { id: "deferred", label: L("p.sub.deferred"), test: (c) => statusOf(c).state === "deferred" },
  // done as decisions.mjs counts it: an answered request is here too, under its «Answered» tag
  { id: "done", label: L("p.sub.done"), test: (c) => DR.done(ITEMS, state, c.key) },
];
function subCount(t) {
  if (t.id === "comments") return comments().length + D.replies.length;
  const list = ITEMS.filter(t.test);
  return ["deferred", "done"].includes(t.id) ? list.length : list.filter(isOpen).length;
}
function renderDecisions() {
  $("#panel-decisions").innerHTML = `<div class="frame"><div class="col">
    <div class="seg" role="tablist" aria-label="${esc(L("p.sub.label"))}" id="dec-seg">${DEC_TABS.map((t) => `<button role="tab" data-act="dsub" data-sub="${t.id}" aria-selected="${S.sub.decisions === t.id}"><span>${esc(t.label)}</span><span class="count" data-subcount="${t.id}"></span></button>`).join("")}</div>
    <p class="muted small" id="dec-note"></p>
    <div id="dec-list"></div></div><aside class="panel" id="ctx-decisions" aria-label="${esc(L("p.context"))}"></aside></div>`;
  renderDecList();
  if (!S.sel.decisions) { const first = $$("#dec-list .card").find((el) => isOpen(itemByKey.get(el.dataset.card))); if (first) { S.sel.decisions = "card:" + first.dataset.card; first.classList.add("sel", "open-full"); } }
  renderPanel("decisions");
}
// Every count of Decisions — the sub-tabs, the group headings of All and the note — is written here, from subCount.
function updateSubCounts() {
  for (const t of DEC_TABS) {
    const k = subCount(t), el = $(`[data-subcount="${t.id}"]`), heading = $(`[data-groupcount="${t.id}"]`);
    if (el) { el.textContent = n(k); el.title = t.id === "comments" ? P("p.count.comments", k) : ["deferred", "done"].includes(t.id) ? P("p.count.items", k) : P("p.count.open", k); }
    if (heading) heading.textContent = P("p.count.open", k);
  }
  const p = progress(), el = $("#dec-note");
  const parts = [P("p.count.open", p.open), P("p.count.decided", p.decided), p.answered && P("p.count.answered", p.answered), p.deferred && P("p.count.deferred", p.deferred)].filter(Boolean).join(" · ");
  if (el) el.innerHTML = `${esc(parts)}. ${esc(kept("hint"))} ${kbd("j")} ${kbd("k")} ${esc(L("p.hint.move"))} · ${kbd("1")}–${kbd("9")} ${esc(L("p.hint.choose"))} · ${kbd("o")} ${esc(L("p.hint.other"))} · ${kbd("d")} ${esc(L("p.hint.defer"))} · ${kbd("u")} ${esc(L("p.hint.undo"))} · ${kbd("?")} ${esc(L("p.hint.all"))}`;
}
function renderDecList() {
  const sub = DEC_TABS.find((t) => t.id === S.sub.decisions);
  $$('#dec-seg [data-act="dsub"]').forEach((b) => b.setAttribute("aria-selected", String(b.dataset.sub === S.sub.decisions)));
  let html = "";
  if (sub.id === "comments") html = commentsListHtml();
  else if (sub.id === "all") {
    for (const g of GROUPS) { const cards = ITEMS.filter(g.test); if (cards.length) html += `<h2 class="group-h">${esc(g.label)} <span class="muted"><span data-groupcount="${g.id}"></span> · ${esc(g.note)}</span></h2><div class="cards">${orderChildren(cards).map(cardHtml).join("")}</div>`; }
  } else {
    const list = ITEMS.filter(sub.test), g = GROUPS.find((x) => x.id === sub.id);
    html = list.length ? `${g ? `<h2 class="group-h">${esc(g.label)} <span class="muted">${esc(g.note)}</span></h2>` : ""}<div class="cards">${orderChildren(list).map(cardHtml).join("")}</div>`
      : `<div class="empty"><strong>${esc(L("p.empty"))}</strong>${esc(L(sub.id === "done" ? "p.empty.done" : sub.id === "deferred" ? "p.empty.deferred" : "p.empty.none"))}</div>`;
  }
  $("#dec-list").innerHTML = html;
  updateSubCounts();
}
// After the list changes, the selection, the panel, the URL and the next key agree with it: a card the list no
// longer shows is no longer selected.
function syncDecSelection() {
  const key = S.sel.decisions?.slice(5);
  if (key && !$(`#dec-list #card-${key}`)) select("decisions", null);
}
// A list filtered by state (Deferred, Done) drops a card once the action that took it out is complete. A card being
// typed in stays until focus leaves it, and says that it is leaving.
function reconcileDecList(structural) {
  const sub = DEC_TABS.find((t) => t.id === S.sub.decisions);
  if (!S.rendered.decisions || !["deferred", "done"].includes(sub.id)) return;
  const want = ITEMS.filter(sub.test).map((c) => c.key), cards = $$("#dec-list .card");
  if (want.join() === cards.map((el) => el.dataset.card).join()) return;
  if (!structural && document.activeElement?.closest?.("#dec-list .card")) {
    for (const el of cards) el.classList.toggle("leaving", !want.includes(el.dataset.card));
    return;
  }
  renderDecList(); syncDecSelection();
}
// A line comment inside the block of an open item is a comment, never an answer to it.
function notAnswerHint(lk) {
  const row = rowOfLk(lk), b = row?.row[3] ? blk(row.row[3]) : null, open = b ? blockItems(b).filter(isOpen) : [];
  return open.length ? L("p.lc.not-answer", open.map((c) => c.label).join(", ")) : "";
}
// The reviewer's replies to the owner's comments on the previous review, each with the place the comment had: a place
// in the previous diff, never placed in this one by guess.
function repliesHtml() {
  if (!D.replies.length) return "";
  return `<div class="section-h"><h2>${esc(L("replies"))}</h2><span class="muted">${esc(L("p.replies.note"))}</span></div><div class="box cmt-list">${D.replies.map((x) =>
    `<div class="cmt"><div class="where">${esc(x.place)}</div><blockquote class="sel-quote">${esc(x.comment)}</blockquote><div class="txt">${prose(x.text)}</div>${srcList(x.sources)}</div>`).join("")}</div>`;
}
function commentsListHtml() {
  const list = comments();
  if (!list.length) return repliesHtml() ||  `<div class="empty"><strong>${esc(L("p.comments.none"))}</strong>${esc(L("p.comments.how"))}</div>`;
  return `<div class="box cmt-list">${list.map((x) => {
    if (x.kind === "line") {
      const row = rowOfLk(x.lk), b = row?.row[3] ? blk(row.row[3]) : null, hint = notAnswerHint(x.lk);
      return `<div class="cmt"><div class="where">${esc(placeWords(x.c))}${b ? ` · ${chip("b", b.id)}` : ""}<button class="btn sm quiet" data-act="goline" data-lk="${x.lk}">${esc(L("p.show-in-code"))}</button></div>${quoteHtml(x.c)}<div class="txt">${esc(x.c.text)}</div>${hint ? `<div class="hint">${esc(hint)}</div>` : ""}</div>`;
    }
    return `<div class="cmt"><div class="where">${esc(anchorLabel(x.anchor))}<button class="btn sm quiet" data-act="goanchor" data-anchor="${esc(x.anchor)}">${esc(L("p.show-it"))}</button></div>${quoteHtml(x.c)}<div class="txt">${esc(x.c.text)}</div></div>`;
  }).join("")}</div><p class="muted small gap-top">${esc(L("p.comments.note"))}</p>${repliesHtml()}`;
}
function decisionsPanel(sel) {
  if (!sel) return panelWrap(esc(L("p.context")), esc(L("p.select-card")), `<div class="empty"><strong>${esc(L("p.nothing-selected"))}</strong>${esc(L("p.select-card.note"))}</div>`);
  const c = itemByKey.get(sel.slice(5)), r = c.ref;
  let body = "";
  // an idea's excerpt is the code as the change wrote it; the proposal is in the idea's words, never in the diff
  if (r.place) body += `<div class="psec"><h3>${esc(L(c.kind === "idea" ? "p.idea.code" : "p.where"))}</h3>${placeExcerpt(r.place, c.placeRow)}</div>`;
  if (c.kind === "finding") body += `<div class="psec"><h3>${esc(L("shown-by"))}</h3>${pcWrap(c.key + "/shown_by", `<p class="pf">${prose(r.shown_by)}</p>`)}</div>`;
  const shots = c.kind === "finding" ? D.screens.map((s, si) => s.differences.some((d) => d.finding === r.id) ? si : -1).filter((si) => si >= 0) : [];
  if (shots.length) body += `<div class="psec"><h3>${esc(L("p.screens.beside"))}</h3>${shots.map(screenBox).join("")}</div>`;
  if (c.kind === "idea" && r.sources.length) body += `<div class="psec"><h3>${esc(L("sources"))}</h3><p>${srcList(r.sources)}</p></div>`;
  if (c.type === "q") {
    if (r.context.length) body += `<div class="psec"><h3>${esc(L("question.context"))}</h3><ul class="plain">${r.context.map((x, i) => `<li>${pcWrap(`${c.key}/context.${i}`, `<span class="pf">${prose(x.text)}</span> ${srcList(x.sources)}`)}</li>`).join("")}</ul></div>`;
    const vs = r.variants.filter((v) => v.consequences.some((x) => x.sources.length));
    if (vs.length || r.recommendation?.sources.length) body += `<div class="psec"><h3>${esc(L("p.variant-sources"))}</h3><ul class="plain">${vs.map((v) => `<li><b>${prose(v.text)}</b> ${v.consequences.map((x) => srcList(x.sources)).join(" ")}</li>`).join("")}${r.recommendation?.sources.length ? `<li>${esc(L("recommendation"))} ${srcList(r.recommendation.sources)}</li>` : ""}</ul></div>`;
    if (r.zones.length) body += `<div class="psec"><h3>${esc(L("p.zone-sources"))}</h3><ul class="plain">${r.zones.map((z) => `<li>${prose(z.text)} ${srcList(z.sources)}</li>`).join("")}</ul></div>`;
  }
  if (c.type !== "i") body += `<div class="psec"><h3>${esc(L("p.related"))}</h3>${relations(c.type, r.id)}</div>`;
  if (c.blocks.length) body += `<div class="psec"><h3>${esc(L("p.code"))} · ${esc(P("p.count.blocks", c.blocks.length))}<button class="btn sm" data-act="item-code" data-key="${esc(c.key)}">${esc(L("p.show-in-code"))}</button></h3>${excerptList(c.blocks, "card" + c.key)}</div>`;
  return panelWrap(esc(typeText(c)), esc(L("p.context-for", c.label)), body);
}

// ---------------------------------------------------------------- Code: filters, the walk, layout
const PURPOSE_LABEL = Object.fromEntries(D.purposes.map((p) => [p, L("purpose." + p)]));
const allPurposes = () => S.code.purposes.size === D.purposes.length;
// the check's two warnings about kept code, as sets the code view can filter by
const SETS = {
  assumed: { label: L("p.set.assumed"), warn: "p.warn.assumed", ids: new Set(D.unasked.assumed) },
  unlinked: { label: L("p.set.unlinked"), warn: "p.warn.unlinked", ids: new Set(D.unasked.unlinked) },
  carried: { label: L("p.set.carried"), warn: "p.warn.carried", ids: new Set(D.carried) },
};
const inFilters = (b) => S.code.purposes.has(b.purpose) && (!S.code.req || b.serves.includes(S.code.req)) && (!S.code.unit || b.unit === S.code.unit) && (!S.code.set || SETS[S.code.set].ids.has(b.id));
const isDone = (b) => b.verdict !== "keep" && !blockOpen(b) && !S.code.doneOpen.has(b.id);
const inFocus = (b) => inFilters(b) && (S.code.mode === "all" || (b.verdict !== "keep" && !isDone(b)));
const filtered = () => S.code.mode === "attention" || S.code.req || S.code.unit || S.code.set || !allPurposes();
function fileMatches(fi) {
  const f = F[fi];
  if (S.code.q && !f.path.toLowerCase().includes(S.code.q.toLowerCase())) return false;
  return S.code.purposes.has(f.purpose) || fileBlocks[fi].some((b) => S.code.purposes.has(b.purpose));
}
const hasComment = (fi) => [...LC.keys()].some((k) => k.startsWith(fi + ":")) || (S.lcEdit && S.lcEdit.startsWith(fi + ":"));
const showsWhole = (fi) => S.code.whole.has(fi) || (!filtered()) || (S.code.pinned.has(fi) && !fileBlocks[fi].some((b) => inFocus(b) || (b.verdict !== "keep" && inFilters(b))));
function fileShown(fi) {
  if (!fileMatches(fi)) return false;
  if (!filtered() || S.code.q) return true; // a name search shows every matching file, its kept code folded
  return fileBlocks[fi].some((b) => inFocus(b) || (b.verdict !== "keep" && inFilters(b))) || hasComment(fi) || S.code.pinned.has(fi) || S.code.whole.has(fi);
}
// A file's items by state: open, decided, answered, deferred and not applicable each count apart.
function fileAttn(fi) {
  const items = [...new Set(fileBlocks[fi].filter((b) => b.verdict !== "keep").flatMap(blockItems))];
  const by = { open: 0, decided: 0, answered: 0, deferred: 0, na: 0 };
  for (const c of items) by[statusOf(c).state]++;
  const openBlocks = fileBlocks[fi].filter(blockOpen);
  const worst = ["remove", "fix", "question"].find((v) => openBlocks.some((b) => b.verdict === v)) ?? null;
  return { total: items.length - by.na, open: by.open, by, worst };
}
const attnText = (a) => [a.open && L("p.file.open", n(a.open), P("p.count.of-decisions", a.total)), a.by.decided && P("p.count.decided", a.by.decided),
  a.by.answered && P("p.count.answered", a.by.answered), a.by.deferred && P("p.count.deferred", a.by.deferred), a.by.na && P("p.count.na", a.by.na)].filter(Boolean).join(" · ");
// files in the diff's order: a file's index is its rank
const fileOrder = () => F.map((_, fi) => fi);
let WALK_CACHE = null;
const invalidateWalk = () => { WALK_CACHE = null; WALK_F = null; };
// the walk: decisions with code, each with its blocks as positions; one unit for «open» everywhere
function walkAll() {
  if (WALK_CACHE) return WALK_CACHE;
  const pos = (bid) => firstPos[bid];
  const cmp = (a, b) => { const x = pos(a), y = pos(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; };
  const list = ITEMS.filter((c) => c.blocks.length && applicable(c)).map((c) => ({ c, blocks: c.blocks.filter((id) => firstPos[id]).sort(cmp) })).filter((x) => x.blocks.length);
  list.sort((a, b) => cmp(a.blocks[0], b.blocks[0]));
  return (WALK_CACHE = list);
}
// the walk under the current filters, cached until a decision or a filter changes
let WALK_F = null;
function walk() { return WALK_F ?? (WALK_F = walkAll().map((x) => ({ c: x.c, blocks: x.blocks.filter((id) => fileMatches(blk(id).file) && inFilters(blk(id))) })).filter((x) => x.blocks.length)); }
// estimated heights account for wrapping: characters per line come from the code column's real width
let CPL = 90;
function measureCpl() {
  const box = $("#files"); if (!box) return;
  const probe = document.createElement("span");
  probe.className = "cpl-probe";
  probe.textContent = "0".repeat(100); box.append(probe);
  const cw = probe.getBoundingClientRect().width / 100; probe.remove();
  const width = box.clientWidth - 36 - 2 - 96 - 34;
  CPL = Math.max(20, Math.floor(width / (cw || 7.5)));
}
function layoutFile(fi) {
  const f = F[fi], items = [], noted = new Set(), whole = showsWhole(fi);
  let lastChanged = 0, prevNew = 0;
  f.hunks.forEach((h, hi) => {
    const start = h.rows.find((r) => r[2] != null)?.[2] ?? 1;
    if (hi === 0 ? start > 1 : start > prevNew + 1) { items.push({ t: "gap", from: hi === 0 ? 1 : prevNew + 1, to: start - 1 }); lastChanged = 0; }
    const rows = h.rows, len = rows.length, show = new Array(len).fill(whole), marks = new Map();
    for (let i = 0; i < len; i++) {
      const r = rows[i], b = r[3] ? blk(r[3]) : null;
      if (b && r[0] && b.verdict !== "keep" && inFilters(b) && !noted.has(b.id) && !marks.has(i) && ![...marks.values()].includes(b.id)) marks.set(i, b.id);
      if (whole) continue;
      const focus = r[0] && b && inFocus(b), lk = lkOf(fi, r);
      if (focus || LC.has(lk) || S.lcEdit === lk) for (let j = Math.max(0, i - 3); j <= Math.min(len - 1, i + 3); j++) show[j] = true;
    }
    let i = 0;
    while (i < len) {
      if (marks.has(i)) { const bid = marks.get(i); if (!noted.has(bid)) { noted.add(bid); items.push({ t: isDone(blk(bid)) ? "done" : "note", b: bid }); lastChanged = bid; } }
      if (show[i]) { push(i); i++; continue; }
      let j = i; while (j < len && !show[j] && (j === i || !marks.has(j))) j++;
      const id = `${fi}:${hi}:${i}`;
      if (j - i < 4 || S.code.expanded.has(id)) for (let k = i; k < j; k++) push(k);
      else { items.push({ t: "fold", parts: [{ id, hi, from: i, to: j }] }); lastChanged = 0; }
      i = j;
    }
    for (let k = len - 1; k >= 0; k--) if (rows[k][2] != null) { prevNew = rows[k][2]; break; }
    function push(ri) {
      const r = rows[ri], b = r[3] ? blk(r[3]) : null;
      if (b && b.verdict !== "keep" && r[0] && noted.has(b.id) && lastChanged !== b.id && !isDone(b)) items.push({ t: "cont", b: b.id });
      if (r[0]) lastChanged = r[3];
      items.push({ t: "row", hi, ri, r });
      const lk = lkOf(fi, r);
      if (LC.has(lk) || S.lcEdit === lk) items.push({ t: "lc", lk });
    }
  });
  const merged = [];
  for (const it of items) {
    const last = merged[merged.length - 1];
    if ((it.t === "fold" || it.t === "gap") && last && (last.t === "fold" || last.t === "gap") && (it.t === "fold" || last.t === "fold")) {
      const run = last.t === "fold" ? last : { t: "fold", parts: [] };
      if (last.t === "gap") { merged.pop(); run.gaps = (run.gaps ?? 0) + 1; merged.push(run); }
      if (it.t === "fold") run.parts.push(...it.parts); else run.gaps = (run.gaps ?? 0) + 1;
      continue;
    }
    merged.push(it.t === "fold" ? { ...it, parts: [...it.parts] } : it);
  }
  return merged;
}
function estimate(items) {
  let h = 0;
  for (const it of items) h += it.t === "row" ? 20 * Math.max(1, Math.ceil(((it.r[5] ?? 0) + 1) / CPL)) : it.t === "note" ? 170 : it.t === "done" ? 34 : it.t === "lc" ? 90 : it.t === "cont" ? 26 : 28;
  return Math.max(h, 20);
}
function foldText(fi, it) {
  const rows = it.parts.flatMap((p) => F[fi].hunks[p.hi].rows.slice(p.from, p.to)), ch = rows.filter((r) => r[0]);
  const ids = [...new Set(ch.map((r) => r[3]).filter(Boolean))], kept = ids.every((id) => blk(id).verdict === "keep");
  const done = ids.filter((id) => isDone(blk(id))).length;
  const what = !ch.length ? "p.fold.unchanged" : kept ? "p.fold.kept" : done === ids.filter((id) => blk(id).verdict !== "keep").length && done ? "p.fold.decided" : "p.fold.filtered";
  return { what: P(what, rows.length), hunks: it.parts.length > 1 ? P("p.fold.hunks", it.parts.length) : "", add: ch.filter((r) => r[0] === 1).length, del: ch.filter((r) => r[0] === 2).length, changed: ch.length, ids };
}
function foldLabel(t) {
  return `<span class="dots">⋯</span><span>${esc(t.what)}</span>${t.hunks ? `<span class="muted">· ${esc(t.hunks)}</span>` : ""}${t.changed ? `<span class="muted">+${t.add} −${t.del}</span>` : ""}${t.ids.length ? `<span class="fold-blocks">${t.ids.slice(0, 4).map((id) => "B" + id).join(", ")}${t.ids.length > 4 ? ` +${t.ids.length - 4}` : ""}</span>` : ""}<span class="fold-go muted">${esc(L("p.fold.expand"))}</span>`;
}
function noteHtml(b) {
  const sel = S.sel.code === b.id, items = blockItems(b);
  return `<tr class="note-row v-${b.verdict}" data-b="${b.id}"><td colspan="3"><div class="note v-${b.verdict}${sel ? " sel" : ""}" data-b="${b.id}" id="note-${b.id}" tabindex="-1" role="group" aria-label="${esc(`B${b.id}, ${L("p.verdict.reviewer")} ${verdictWord(b.verdict)}. ${b.does}`)}">
    <div class="note-top">${verdictTag(b.verdict)}<span class="bid">B${b.id}</span><span class="does" title="${esc(b.does)}">${prose(b.does)}</span><button class="btn sm quiet" data-act="copy-block" data-b="${b.id}" title="${esc(blockRef(b.id))}">${esc(L("p.copy"))}<span class="key">y</span></button>${S.code.doneOpen.has(b.id) && !blockOpen(b) ? `<button class="btn sm quiet" data-act="done-close" data-b="${b.id}">${esc(L("p.fold"))}</button>` : ""}</div>
    ${b.whole ? `<div class="note-whole"><span class="lbl">${esc(L("whole"))}</span>${prose(b.whole)}</div>` : ""}
    ${items.map((c) => noteItem(c, b)).join("")}</div></td></tr>`;
}
const answerAt = {};
function answeringBlock(c) { const at = answerAt[c.key]; if (at && c.blocks.includes(at)) return at; return walkAll().find((x) => x.c === c)?.blocks[0] ?? c.blocks[0]; }
const answersHere = (c, b) => answeringBlock(c) === b.id;
function moveAnswerTo(key, bid) {
  const c = itemByKey.get(key), prev = answeringBlock(c);
  if (prev === bid) return;
  answerAt[key] = bid; redrawNote(prev); redrawNote(bid);
}
function noteItem(c, b) {
  const r = c.ref, st = statusOf(c), w = walk().find((x) => x.c === c), pos = w ? w.blocks.indexOf(b.id) : -1;
  // one answer covers every block of the item; under a filter, how many of them it shows is said apart
  const all = walkAll().find((x) => x.c === c)?.blocks.length ?? c.blocks.length, shown = w ? w.blocks.length : all;
  const posText = w && w.blocks.length > 1 ? `<span class="muted small nowrap">${esc(L("p.block-of", pos + 1, w.blocks.length))}</span>` : "";
  if (!answersHere(c, b)) {
    const opts = optionsOf(c);
    const hint = `${opts.length ? `${kbd("1")}–${kbd(String(opts.length))} ${esc(L("p.hint.choose"))} · ` : ""}${kbd("o")} ${esc(L(opts.length ? "p.hint.other" : "p.hint.answer"))} · ${kbd("d")} ${esc(L("p.hint.defer"))}`;
    return `<div class="note-item" data-item="${esc(c.key)}"><div class="ni-head">${chip(c.type, r.id)}<span class="ni-title clamp1">${prose(itemTitle(c))}</span>${posText}<span class="status" data-status="${esc(c.key)}">${tagHtml(st)}</span></div><div class="answer-line" data-answer="${esc(c.key)}">${answerHtml(st)}</div><div class="pills"><button class="pill" data-act="answer-here" data-b="${b.id}" data-key="${esc(c.key)}">${esc(L("p.answer-here"))}</button><span class="muted small">${esc(P("p.one-answer", all))}${shown < all ? ` · ${esc(P("p.one-answer.shown", shown))}` : ""}</span><span class="key-hint small muted">${hint}</span></div></div>`;
  }
  const sub = c.kind === "finding" ? `<b>${esc(L("fix"))}:</b> ${prose(r.fix)}` : c.kind === "decision" && r.recommendation ? `<b>${esc(L("p.recommendation"))}</b> ${recommendedTexts(r).length ? `<span class="rec-pick">${recommendedTexts(r).map((t) => prose(t)).join(" + ")}</span> — ` : ""}${prose(r.recommendation.text)}` : "";
  if (st.state !== "open") return `<div class="note-item" data-item="${esc(c.key)}"><div class="ni-head">${chip(c.type, r.id)}<span class="ni-title">${prose(itemTitle(c))}</span>${posText}<span class="status" data-status="${esc(c.key)}">${tagHtml(st)}</span></div><div class="answer-line" data-answer="${esc(c.key)}">${answerHtml(st)}</div>${choiceHtml(c, "note")}</div>`;
  return `<div class="note-item" data-item="${esc(c.key)}"><div class="ni-head">${chip(c.type, r.id)}<span class="ni-title clamp2">${prose(itemTitle(c))}</span>${posText}<span class="status" data-status="${esc(c.key)}">${tagHtml(st)}</span></div>
    ${sub ? `<p class="ni-fix clamp">${sub}</p>` : ""}<div class="answer-line" data-answer="${esc(c.key)}">${answerHtml(st)}</div>${choiceHtml(c, "note")}</div>`;
}
function doneHtml(b) {
  const sel = S.sel.code === b.id, items = blockItems(b), sts = items.map(statusOf);
  const ans = items.map((c, i) => { const st = sts[i]; return `${c.label}: ${st.state === "na" ? st.label : st.state === "deferred" ? L("p.toast.deferred", st.answer) : compactAnswer(st)}`; }).join(" · ");
  // one tag per state its items are in: an answered request never reads as decided
  const tags = [...new Map(sts.map((st) => [st.state, st])).values()];
  return `<tr class="done-row" data-b="${b.id}"><td colspan="3"><div class="done-line${sel ? " sel" : ""}" id="note-${b.id}" data-b="${b.id}" tabindex="-1" role="button" data-act="done-open" aria-label="${esc(L("p.done-line", `B${b.id} · ${tags.map((st) => st.label).join(", ")}`, ans))}">${tags.map(tagHtml).join("")}<span class="bid">B${b.id}</span><span class="ans">${esc(ans)}</span><span class="muted small">${esc(L("p.fold.expand"))}</span></div></td></tr>`;
}
function lcHtml(lk) {
  const [, side] = lk.split(":"), span = S.lcEdit === lk ? (S.lcRange ?? LC.get(lk)) : LC.get(lk);
  const what = span?.end ? L("p.lc.lines", span.line, span.end) : L(side[0] === "-" ? "p.lc.removed-line" : "p.lc.line", side.slice(1));
  const hint = notAnswerHint(lk), hintHtml = hint ? `<span class="hint">${esc(hint)}</span>` : "";
  const copyBtn = `<button class="btn sm quiet" data-act="copy-line" data-lk="${lk}">${esc(L("p.copy"))}</button>`;
  if (S.lcEdit === lk) return `<tr class="lc-row"><td colspan="3"><div class="lc"><div class="lc-h">${esc(L("p.lc.on", what))} ${hintHtml}</div>${quoteHtml(span)}<textarea id="lc-input" aria-label="${esc(L("p.lc.on", what))}" placeholder="${esc(L("p.lc.placeholder"))}">${esc(LC.get(lk)?.text ?? "")}</textarea><div class="lc-a"><button class="btn sm" data-act="lc-save" data-lk="${lk}">${esc(L("p.comment.save"))}</button><button class="btn sm quiet" data-act="lc-cancel">${esc(L("p.cancel"))}</button>${copyBtn}<span class="hint">${esc(L("p.saves", MOD))}</span></div></div></td></tr>`;
  return `<tr class="lc-row"><td colspan="3"><div class="lc"><div class="lc-h">${esc(L("p.lc.yours", what))} ${hintHtml}<button class="btn sm quiet" data-act="lc" data-lk="${lk}">${esc(L("p.edit"))}</button><button class="btn sm quiet" data-act="lc-del" data-lk="${lk}">${esc(L("p.delete"))}</button>${copyBtn}</div>${quoteHtml(span)}<div class="lc-t">${esc(LC.get(lk).text)}</div></div></td></tr>`;
}
function fileBodyHtml(fi, items) {
  const out = [];
  const att = (it) => it && it.t === "row" && it.r[0] && it.r[3] && blk(it.r[3]).verdict !== "keep" ? it.r[3] : 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.t === "row") {
      const a = att(it), b = a ? blk(a) : null;
      const top = a && att(items[i - 1]) !== a && items[i - 1]?.t !== "note", bot = a && att(items[i + 1]) !== a;
      const cls = b ? `fx v-${b.verdict}${blockOpen(b) ? "" : " decided"}${top ? " ft" : ""}${bot ? " fb2" : ""}${S.sel.code === b.id ? " selb" : ""}` : (it.r[3] && S.sel.code === it.r[3] ? "selb" : "");
      out.push(rowHtml(fi, it.r, cls));
    } else if (it.t === "note") out.push(noteHtml(blk(it.b)));
    else if (it.t === "done") out.push(doneHtml(blk(it.b)));
    else if (it.t === "cont") out.push(`<tr class="cont-row"><td colspan="3"><div class="cont">${esc(L("p.continues", "B" + it.b))}</div></td></tr>`);
    else if (it.t === "fold") { const t = foldText(fi, it); out.push(`<tr class="fold"><td colspan="3"><button data-act="unfold" data-fold="${it.parts.map((p) => p.id).join(",")}" data-f="${fi}" aria-label="${esc(L("p.fold.expand-what", t.what))}">${foldLabel(t)}</button></td></tr>`); }
    else if (it.t === "gap") out.push(`<tr class="gap"><td colspan="3" class="gcell">⋯ ${esc(L("p.gap", it.from, it.to))}</td></tr>`);
    else if (it.t === "lc") out.push(lcHtml(it.lk));
  }
  return `<table class="diff">${COLS}<tbody>${out.join("")}</tbody></table>`;
}

// ---------------------------------------------------------------- Code: rendering, drawing on demand, and releasing far files
let io = null;
function renderCode() {
  const reqItem = (id, label, text, count) => `<button class="mi" aria-pressed="false" data-act="req-pick" data-req="${esc(id)}">${label}<span class="mi-t">${text}</span>${count === null ? "" : `<span class="muted">${n(count)}</span>`}</button>`;
  const reqOpts = reqItem("", `<span class="mi-id"></span>`, esc(L("p.code.any-req")), null) + D.requirements.map((r) => reqItem(r.id, `<span class="mi-id">R${esc(r.id)}</span>`, prose(r.text), r.blocks.length)).join("");
  const rules = D.purposes.map((p) => `<li><b>${esc(PURPOSE_LABEL[p])}</b>: ${esc(L("purpose.rules." + p))}</li>`).join("");
  $("#panel-code").innerHTML = `
  <div class="toolbar" role="toolbar" aria-label="${esc(L("p.code.toolbar"))}">
    <div class="seg" role="group" aria-label="${esc(L("p.code.which"))}"><button data-act="mode" data-mode="attention" aria-pressed="${S.code.mode === "attention"}" title="${esc(L("p.code.attention-title"))}">${esc(L("p.code.attention"))}</button><button data-act="mode" data-mode="all" aria-pressed="${S.code.mode === "all"}">${esc(L("p.code.all"))}</button></div>
    <div class="pop" id="purpose-pop"><button class="btn sm menu-btn" data-act="purpose-menu" aria-expanded="false" aria-haspopup="true" id="purpose-btn"></button>
      <div class="pop-menu" hidden role="group" aria-label="${esc(L("purpose"))}">${D.purposes.filter((p) => D.purposeCounts[p].files || D.purposeCounts[p].blocks).map((p) => `<label><input type="checkbox" data-act="purpose" value="${p}"${S.code.purposes.has(p) ? " checked" : ""}> ${esc(PURPOSE_LABEL[p])} <span class="muted">${esc(P("p.count.files", D.purposeCounts[p].files))}</span></label>`).join("")}
      <div class="rules">${esc(L("p.code.rules"))}<ul>${rules}</ul></div></div></div>
    <div class="pop" id="req-pop"><button class="btn sm menu-btn" data-act="req-menu" aria-expanded="false" aria-haspopup="true" id="req-btn"></button>
      <div class="pop-menu req-menu" hidden role="group" aria-label="${esc(L("requirement"))}">${reqOpts}</div></div>
    <span id="unit-token"></span>
    <div class="search"><input type="search" id="file-q" data-act="q" placeholder="${esc(L("p.code.filter"))}" aria-label="${esc(L("p.code.filter-label"))}" value="${esc(S.code.q)}">${kbd("/")}</div>
    <button class="btn sm" data-act="find-open" title="${esc(L("p.find.title", MOD))}">${esc(L("p.find"))}</button>
    <div class="pos" id="pos"></div>
    <button class="btn sm" data-act="ctx" aria-pressed="${S.code.ctx}" aria-controls="ctx-code" title="${esc(L("p.code.ctx-title"))}">${esc(L("p.context"))}</button>
    <div class="findbar" id="findbar"${S.find.open ? "" : " hidden"} role="search" aria-label="${esc(L("p.find.label"))}"><input type="search" id="find-q" data-act="find-q" placeholder="${esc(L("p.find.placeholder"))}" aria-label="${esc(L("p.find.label"))}" value="${esc(S.find.q)}"><span id="find-count" aria-live="polite" class="small muted"></span><button class="btn sm icon" data-act="find-prev" aria-label="${esc(L("p.find.prev"))}">‹</button><button class="btn sm icon" data-act="find-next" aria-label="${esc(L("p.find.next"))}">›</button>${closeX('data-act="find-close"', L("p.find.close"))}</div>
  </div>
  <div class="frame code${S.code.tree ? "" : " no-tree"}${S.code.ctx ? " ctx" : ""}" id="code-frame"><a class="skip" href="#files" data-act="skip">${esc(L("p.skip"))}</a><div class="tree-rail" id="tree-rail"${S.code.tree ? " hidden" : ""}><button class="rail-btn" data-act="tree" aria-expanded="false" aria-controls="tree" title="${esc(L("p.tree.show"))}">${ICON.panel}<span>${esc(L("files"))}</span></button></div><nav class="tree" id="tree" aria-label="${esc(L("files"))}"${S.code.tree ? "" : " hidden"}></nav><div class="files" id="files" tabindex="-1"></div><aside class="panel" id="ctx-code" aria-label="${esc(L("p.context"))}"${S.code.ctx ? "" : " hidden"}></aside></div>`;
  syncToolbar(); syncTbar(); measureCpl(); renderFiles(); renderTree(); renderPanel("code"); updatePos(); if (S.find.open) runFind();
  // The toolbar wraps at narrow widths, grows with filter tokens and the find bar: its rendered height places the file headers.
  new ResizeObserver(syncTbar).observe($(".toolbar"));
}
function syncToolbar() {
  const rb = $("#req-btn");
  if (rb) {
    const r = S.code.req && D.requirements.find((x) => String(x.id) === String(S.code.req));
    rb.innerHTML = `<span>${esc(r ? L("p.code.req-one", r.id) : L("p.code.req-any"))}</span>${ICON.chevron}`; rb.title = r ? r.text : "";
    $$('#req-pop [data-act="req-pick"]').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.req === String(S.code.req))));
  }
  $$('#panel-code [data-act="mode"]').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === S.code.mode)));
  const pb = $("#purpose-btn"); if (pb) pb.innerHTML = `<span>${esc(allPurposes() ? L("p.code.purpose-all") : L("p.code.purpose", [...S.code.purposes].filter((p) => D.purposeCounts[p].files).map((p) => PURPOSE_LABEL[p]).join(", ") || L("none")))}</span>${ICON.chevron}`;
  $$('#panel-code input[data-act="purpose"]').forEach((i) => { i.checked = S.code.purposes.has(i.value); });
  const tok = $("#unit-token"); if (tok) tok.innerHTML = (S.code.unit ? `<span class="token">${esc(L("p.code.unit", S.code.unit))}<button data-act="unit-clear" aria-label="${esc(L("p.code.unit-clear"))}">×</button></span>` : "") + (S.code.set ? `<span class="token">${esc(SETS[S.code.set].label)}<button data-act="set-clear" aria-label="${esc(L("p.code.set-clear"))}">×</button></span>` : "");
  const q = $("#file-q"); if (q && q.value !== S.code.q) q.value = S.code.q;
  const cb = $('#panel-code [data-act="ctx"]'); if (cb) cb.setAttribute("aria-pressed", String(S.code.ctx));
}
const STATUS_WORD = { A: "p.file.added", D: "p.file.deleted" };
function fileHeader(fi) {
  const f = F[fi], a = fileAttn(fi), col = S.code.collapsed.has(fi), whole = S.code.whole.has(fi), viewed = S.viewed.has(fi);
  return `<button class="btn icon sm quiet fold-btn" data-act="fcollapse" data-f="${fi}" aria-expanded="${!col}" aria-label="${esc(L(col ? "p.file.expand" : "p.file.collapse", f.path))}">${ICON.chevron}</button>
    <div class="path" title="${esc(f.path)}">${pathLine(f.path)}</div><div class="meta">${STATUS_WORD[f.status] ? `<span>${esc(L(STATUS_WORD[f.status]))}</span>` : ""}${a.total ? `<span>${esc(attnText(a))}</span>` : ""}<span class="a">+${n(f.add)}</span><span class="d">−${n(f.del)}</span><span>${esc(PURPOSE_LABEL[f.purpose])}</span>
    <button class="btn sm quiet" data-act="whole" data-f="${fi}" aria-pressed="${whole}" title="${esc(L("p.file.whole-title"))}">${esc(L(whole ? "p.file.fold-kept" : "p.file.whole"))}</button>
    <label class="viewed-box"><input type="checkbox" data-act="viewed" data-f="${fi}"${viewed ? " checked" : ""}> ${esc(L("p.file.viewed"))}</label></div>`;
}
function renderFiles() {
  const order = fileOrder(), shown = order.filter(fileShown), matches = order.filter(fileMatches).length;
  let html = shown.map((fi) => {
    const col = S.code.collapsed.has(fi);
    return `<section class="file${col ? " collapsed" : ""}${S.viewed.has(fi) ? " viewed" : ""}" id="file-${fi}" data-f="${fi}" aria-label="${esc(F[fi].path)}"><div class="fh" data-fh="${fi}">${fileHeader(fi)}</div>
      <div class="fb pending" data-f="${fi}" style="height:${estimate(layoutFile(fi))}px"></div></section>`;
  }).join("");
  if (!shown.length) html = `<div class="empty"><strong>${esc(L("p.files.none"))}</strong>${esc(S.code.q ? L("p.files.no-path", S.code.q) : L("p.files.change-filters"))}</div>`;
  const rest = matches - shown.length;
  if (rest > 0) html += `<div class="hidden-note">${esc(P(S.code.mode === "attention" && !S.code.req && !S.code.unit ? "p.files.kept-only" : "p.files.outside", rest))}<button class="btn sm" data-act="mode" data-mode="all">${esc(L("p.files.show-all"))}</button></div>`;
  const box = $("#files"); box.innerHTML = html;
  io?.disconnect();
  io = new IntersectionObserver((entries) => { for (const e of entries) if (e.isIntersecting) fill(+e.target.dataset.f); }, { rootMargin: "1600px 0px" });
  $$(".fb.pending", box).forEach((el) => io.observe(el));
}
function fill(fi, force = false) {
  const el = $(`#file-${fi} .fb`);
  if (!el || (!el.classList.contains("pending") && !force)) return;
  const items = layoutFile(fi);
  el.innerHTML = fileBodyHtml(fi, items);
  el.classList.remove("pending"); el.style.height = "";
  io?.unobserve(el);
  rovingInit(el);
}
function fillVisible() { let k = 0; $$(".fb.pending").forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight + 1600 && r.bottom > -1600) { fill(+el.dataset.f); k++; } }); return k; }
// far files give their rows back: the DOM stays bounded however large the diff is
function releaseFar() {
  const keep = S.sel.code ? blk(S.sel.code).file : -1;
  for (const el of $$("#files .fb:not(.pending)")) {
    const fi = +el.dataset.f, r = el.getBoundingClientRect();
    if (fi === keep || el.contains(document.activeElement) || (S.lcEdit && S.lcEdit.startsWith(fi + ":"))) continue;
    if (r.bottom < -6000 || r.top > innerHeight + 6000) {
      el.innerHTML = ""; el.style.height = r.height + "px"; el.classList.add("pending"); io?.observe(el);
    }
  }
}
function rerenderCode() {
  invalidateWalk();
  renderFiles(); renderTree(); syncToolbar();
  // the selection never points at code the view no longer shows
  if (S.sel.code && !blockVisible(blk(S.sel.code))) { S.sel.code = null; S.cur = null; S.lineHash = null; renderPanel("code"); setHash(); }
  updatePos(); requestAnimationFrame(fillVisible);
}
function refillFiles(fis) {
  const active = document.activeElement, inCode = active && $("#files")?.contains(active);
  for (const fi of new Set(fis)) {
    const sec = $(`#file-${fi}`);
    if (!sec) continue;
    $(".fh", sec).innerHTML = fileHeader(fi);
    if (!$(".fb", sec).classList.contains("pending")) fill(fi, true);
    else $(".fb", sec).style.height = estimate(layoutFile(fi)) + "px";
  }
  if (inCode && !document.activeElement?.closest?.("#files") && S.sel.code) $(`#note-${S.sel.code}`)?.focus({ preventScroll: true });
}
function refreshCodeFor(c) {
  invalidateWalk();
  refillFiles(c.blocks.map((id) => blk(id).file));
  renderTree();
  if (S.code.ctx && S.sel.code) renderPanel("code");
}
const blockVisible = (b) => fileShown(b.file) && (showsWhole(b.file) || (b.verdict !== "keep" && inFilters(b)) || inFocus(b));
function buildTree() {
  const root = { dirs: new Map(), files: [] };
  fileOrder().forEach((fi) => {
    if (!fileMatches(fi)) return;
    const parts = F[fi].path.split("/"); let node = root;
    for (const p of parts.slice(0, -1)) { if (!node.dirs.has(p)) node.dirs.set(p, { dirs: new Map(), files: [] }); node = node.dirs.get(p); }
    node.files.push(fi);
  });
  return root;
}
function renderTree() {
  const el = $("#tree"); if (!el) return;
  const root = buildTree();
  const compress = (name, node) => { while (node.dirs.size === 1 && !node.files.length) { const [k, v] = [...node.dirs][0]; name += "/" + k; node = v; } return [name, node]; };
  let html = `<div class="tree-head"><span>${esc(P("p.count.files", F.filter((_, fi) => fileMatches(fi)).length))} · ${esc(P("p.count.viewed", S.viewed.size))}</span><button class="btn sm icon quiet" data-act="tree" aria-expanded="true" aria-controls="tree" aria-label="${esc(L("p.tree.hide"))}" title="${esc(L("p.tree.hide"))}">${ICON.panel}</button></div>`;
  const fileRow = (fi, depth) => {
    const f = F[fi], a = fileAttn(fi), dim = !fileShown(fi), base = f.path.slice(f.path.lastIndexOf("/") + 1);
    const mark = a.total ? `<span class="mark ${a.open ? a.worst ?? "question" : "done"}" title="${esc(attnText(a))}">${n(a.open || a.total)}</span>` : "";
    return `<button class="tnode t-file${dim ? " dim" : ""}${S.viewed.has(fi) ? " viewed" : ""}" style="--d:${depth}" data-act="gofile" data-f="${fi}" title="${esc(dim ? L("p.tree.dim", f.path) : f.path)}"><span class="tn-st">${f.status}</span><span class="tn-main"><span class="tn-name">${esc(base)}</span><span class="tn-meta">${mark}<span class="a">+${n(f.add)}</span><span class="d">−${n(f.del)}</span></span></span></button>`;
  };
  {
    const walkTree = (node, depth, prefix) => {
      for (const [k, v] of [...node.dirs].sort()) {
        const [name, inner] = compress(k, v), path = prefix + name + "/", closed = S.code.dirsClosed.has(path);
        html += `<button class="tnode t-dir" style="--d:${depth}" data-act="dir" data-dir="${esc(path)}" aria-expanded="${!closed}"><span class="caret">${ICON.chevron}</span><span class="tn-name">${esc(name)}/</span></button>`;
        if (!closed) walkTree(inner, depth + 1, path);
      }
      for (const fi of node.files) html += fileRow(fi, depth);
    };
    walkTree(root, 0, "");
  }
  el.innerHTML = html;
  spy();
}
function updatePos() {
  const el = $("#pos"); if (!el) return;
  const list = walk(), cur = S.cur, i = cur ? list.findIndex((x) => x.c.key === cur.key) : -1;
  const open = list.filter((x) => isOpen(x.c)).length;
  let text;
  if (!list.length) text = esc(L("p.pos.none"));
  else if (i >= 0) {
    const x = list[i], j = x.blocks.indexOf(cur.bid), st = statusOf(x.c);
    text = [L("p.pos.decision", `<b>${n(i + 1)}</b>`, `<b>${n(list.length)}</b>`), x.blocks.length > 1 && j >= 0 && L("p.block-of", `<b>${n(j + 1)}</b>`, `<b>${n(x.blocks.length)}</b>`), st.state !== "open" && esc(st.label.toLowerCase())].filter(Boolean).join(" · ");
  } else text = `${esc(P("p.count.decisions", list.length))} · <b>${esc(P("p.count.open", open))}</b>${open ? ` · ${esc(L("p.pos.press"))} ${kbd("j")}` : ""}`;
  el.innerHTML = `<button class="btn sm icon" data-act="prev" aria-label="${esc(L("p.pos.prev"))}" title="${esc(L("p.pos.prev"))}"${list.length ? "" : " disabled"}>‹</button><span aria-live="polite">${text}</span><button class="btn sm icon" data-act="next" aria-label="${esc(L("p.pos.next"))}" title="${esc(L("p.pos.next"))}"${list.length ? "" : " disabled"}>›</button>`;
}
// `quiet`: moving on after an answer says nothing when nothing is left, so the answer's own toast keeps its Undo.
function step(dir, byItem = false, { quiet = false } = {}) {
  if (S.tab === "decisions") return stepCards(dir, quiet);
  if (S.tab !== "code") return;
  const list = walk(); if (!list.length) return;
  const open = (x) => isOpen(x.c);
  if (!list.some(open)) return quiet ? undefined : toast(L("p.pos.all-done"));
  let i = S.cur ? list.findIndex((x) => x.c.key === S.cur.key) : -1;
  const j = i >= 0 ? list[i].blocks.indexOf(S.cur.bid) : -1;
  if (!byItem && i >= 0 && open(list[i])) {
    if (dir > 0 && j < list[i].blocks.length - 1) return goBlock(list[i].blocks[j + 1], { key: list[i].c.key, focus: true });
    if (dir < 0 && j > 0) return goBlock(list[i].blocks[j - 1], { key: list[i].c.key, focus: true });
  }
  if (i < 0) i = dir > 0 ? -1 : 0;
  for (let s = 1; s <= list.length; s++) {
    const x = list[(i + dir * s + list.length * 2) % list.length];
    if (open(x)) return goBlock(dir > 0 || byItem ? x.blocks[0] : x.blocks[x.blocks.length - 1], { key: x.c.key, focus: true });
  }
}
function stepCards(dir, quiet = false) {
  const els = $$("#dec-list .card"), keys = els.map((e) => e.dataset.card).filter((k) => isOpen(itemByKey.get(k)));
  if (!keys.length) return quiet ? undefined : toast(L("p.cards.none-open"));
  const all = els.map((e) => e.dataset.card), cur = S.sel.decisions?.slice(5), pos = all.indexOf(cur);
  const next = dir > 0 ? keys.find((k) => all.indexOf(k) > pos) ?? keys[0] : [...keys].reverse().find((k) => all.indexOf(k) < pos) ?? keys[keys.length - 1];
  select("decisions", "card:" + next, { collapsePrev: true });
  const card = $(`#card-${next}`);
  card?.scrollIntoView({ block: "start" });
  card?.focus({ preventScroll: true });
}
function stepFile(dir) {
  if (S.tab !== "code") return;
  const shown = fileOrder().filter(fileShown); if (!shown.length) return;
  const land = toolbarBottom() + 6;
  let cur = shown.findIndex((fi) => { const r = $(`#file-${fi}`)?.getBoundingClientRect(); return r && r.bottom > land + 2; });
  if (cur < 0) cur = 0;
  const atTop = Math.abs(($(`#file-${shown[cur]}`)?.getBoundingClientRect().top ?? 0) - land) <= 3;
  const target = dir > 0 ? shown[Math.min(shown.length - 1, cur + 1)] : shown[Math.max(0, atTop ? cur - 1 : cur)];
  goFile(target);
}
// land exactly on an element: scroll, let the files above draw, and correct until it stays put
async function landOn(getEl, offset) {
  let stable = 0;
  for (let k = 0; k < 40 && stable < 2; k++) {
    const el = getEl(); if (!el) return;
    const d = el.getBoundingClientRect().top - offset, y = window.scrollY;
    if (Math.abs(d) <= 1) stable++; else { window.scrollBy(0, d); stable = window.scrollY === y ? stable + 1 : 0; }
    if (fillVisible()) stable = 0; // a file drawn near the view can move the target: measure again
    await frame();
  }
}
// where the code area starts below the sticky bars; measured once, again after a resize or the find bar toggles
let TB = null;
const toolbarBottom = () => { if (TB !== null) return TB; const t = $(".toolbar"), bar = $(".tabbar").offsetHeight; if (!t || !t.offsetHeight) return bar + 52; return (TB = getComputedStyle(t).position === "sticky" ? bar + t.offsetHeight : bar); };
function goBlock(bid, { key = null, focus = false, scroll = true } = {}) {
  const b = blk(bid);
  if (S.tab !== "code") showTab("code", { push: false });
  let changed = false;
  if (!fileMatches(b.file) || !inFilters(b)) { resetFilters(); changed = true; }
  if (S.code.mode === "attention" && b.verdict === "keep" && !showsWhole(b.file)) { S.code.mode = "all"; changed = true; }
  if (S.code.collapsed.has(b.file)) { S.code.collapsed.delete(b.file); changed = true; }
  if (changed) rerenderCode();
  const items = blockItems(b);
  S.cur = key ? { key, bid } : items.length ? { key: (items.find(isOpen) ?? items[0]).key, bid } : null;
  fill(b.file);
  select("code", bid);
  const target = () => $(`#note-${bid}`) ?? $(`#file-${b.file} tr[data-b="${bid}"]`);
  if (scroll) landOn(target, toolbarBottom() + 44).then(() => { if (focus) target()?.focus({ preventScroll: true }); });
  else if (focus) target()?.focus({ preventScroll: true });
}
function redrawNote(bid) {
  const el = $(`#note-${bid}`); if (!el) return;
  const tr = el.closest("tr"), b = blk(bid);
  tr.outerHTML = isDone(b) ? doneHtml(b) : noteHtml(b);
}
function markSelectedBlock() {
  const id = S.sel.code;
  $$("#files tr.selb").forEach((tr) => tr.classList.remove("selb"));
  $$("#files .note.sel, #files .done-line.sel").forEach((nt) => nt.classList.remove("sel"));
  if (id) { $$(`#files tr.r[data-b="${id}"]`).forEach((tr) => tr.classList.add("selb")); $(`#note-${id}`)?.classList.add("sel"); }
  updatePos();
}
function goFile(fi) {
  if (S.tab !== "code") showTab("code", { push: false });
  // Choosing a file makes it the context of file actions, and a block of another file is no longer selected.
  S.file = fi;
  if (S.sel.code && blk(S.sel.code).file !== fi) { S.cur = null; select("code", null); }
  if (!fileShown(fi)) { if (!fileMatches(fi)) { S.code.q = ""; S.code.purposes = new Set(D.purposes); } S.code.pinned.add(fi); rerenderCode(); }
  if (S.code.collapsed.has(fi) && !S.viewed.has(fi)) { S.code.collapsed.delete(fi); rerenderCode(); }
  fill(fi);
  landOn(() => $(`#file-${fi}`), toolbarBottom() + 6).then(() => $(`#file-${fi} .fold-btn`)?.focus({ preventScroll: true }));
}
// The menus — the toolbar's and the theme's — close here alone, whatever closes them, and say so to assistive technology; the button of a menu
// that was open is returned, so Esc can give it focus back. A click inside a menu keeps that menu open.
function closeMenus(inside = null) {
  let was = null;
  for (const pop of $$(".pop")) {
    const m = $(".pop-menu", pop), b = $(".menu-btn", pop);
    if (!m || m.hidden || (inside && pop.contains(inside))) continue;
    m.hidden = true; b.setAttribute("aria-expanded", "false"); was = b;
  }
  return was;
}
function toggleMenu(btn) {
  const m = $(".pop-menu", btn.closest(".pop")), opening = m.hidden;
  closeMenus();
  if (!opening) return;
  m.hidden = false; btn.setAttribute("aria-expanded", "true");
  ($('[aria-pressed="true"]', m) ?? $("button, input", m))?.focus();
}
// A menu closes when focus leaves it, and its arrows walk its items.
document.addEventListener("focusout", (e) => { const pop = e.target.closest?.(".pop"); if (pop && e.relatedTarget && !pop.contains(e.relatedTarget)) closeMenus(e.relatedTarget); });
document.addEventListener("keydown", (e) => {
  const m = e.target.closest?.(".pop-menu");
  if (!m || !["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
  const items = $$("button, input", m), i = items.indexOf(e.target);
  const next = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : Math.max(0, Math.min(items.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)));
  e.preventDefault(); e.stopPropagation(); items[next]?.focus();
}, true);
// The file tree hides from its own head and comes back from the rail beside the code; focus moves to the other one.
function setTree(on) {
  S.code.tree = on;
  $("#tree").hidden = !on; $("#tree-rail").hidden = on; $("#code-frame").classList.toggle("no-tree", !on);
  if (on) renderTree();
  measureCpl(); save();
  (on ? $('#tree [data-act="tree"]') : $('#tree-rail [data-act="tree"]'))?.focus();
}
function resetFilters() { S.code.q = ""; S.code.req = ""; S.code.unit = ""; S.code.set = null; S.code.purposes = new Set(D.purposes); }
function goLine(lk, { hl = "lnsel" } = {}) {
  const at = rowOfLk(lk); if (!at) return Promise.resolve();
  const fi = at.fi, rb = at.row[3] ? blk(at.row[3]) : null;
  if (S.tab !== "code") showTab("code", { push: false });
  let rerender = false, refill = false;
  if (!fileMatches(fi) || (rb && !inFilters(rb))) { resetFilters(); rerender = true; }
  if (!fileShown(fi)) { S.code.pinned.add(fi); rerender = true; }
  for (const it of layoutFile(fi)) if (it.t === "fold") for (const p of it.parts) if (p.hi === at.hi && at.ri >= p.from && at.ri < p.to) { S.code.expanded.add(p.id); refill = true; }
  if (rb && isDone(rb) && !S.code.doneOpen.has(rb.id)) { S.code.doneOpen.add(rb.id); refill = true; }
  if (S.code.collapsed.has(fi)) { S.code.collapsed.delete(fi); rerender = true; }
  if (rerender) rerenderCode();
  fill(fi, refill || rerender);
  // the selection follows the place: its block, or nothing
  const b = at.row[3] ? blk(at.row[3]) : null, items = b ? blockItems(b) : [];
  S.cur = items.length ? { key: (items.find(isOpen) ?? items[0]).key, bid: b.id } : null;
  select("code", b ? b.id : null);
  S.lineHash = lk; setHash();
  const tr = () => $(`#file-${fi} tr.r[data-lk="${CSS.escape(lk)}"]`);
  // the line lands in the middle of the space below the toolbar
  const mid = () => Math.round((innerHeight + toolbarBottom()) / 2) - 10;
  return landOn(tr, mid()).then(() => { const el = tr(); if (!el) return; $$("#files tr.findhit").forEach((x) => x.classList.remove("findhit")); el.classList.add(hl); if (hl === "lnsel") setTimeout(() => el.classList.remove("lnsel"), 1600); if (hl === "lnsel") $(".lnb", el)?.focus({ preventScroll: true }); });
}
function spy() {
  const tree = $("#tree"); if (!tree || S.tab !== "code") return;
  const top = toolbarBottom() + 10;
  let cur = null;
  for (const sec of $$("#files .file")) { const r = sec.getBoundingClientRect(); if (r.bottom > top) { cur = sec.dataset.f; break; } }
  $$(".tnode.t-file.cur", tree).forEach((x) => x.classList.remove("cur"));
  if (cur !== null) $(`.tnode.t-file[data-f="${cur}"]`, tree)?.classList.add("cur");
}
// The file a file action (v) means: the selected block's, else the file chosen last while it is in view, else the first in view.
function currentFile() {
  if (S.sel.code) return blk(S.sel.code).file;
  const chosen = S.file !== null && $(`#file-${S.file}`);
  if (chosen && inView(chosen)) return S.file;
  const top = toolbarBottom() + 10;
  for (const sec of $$("#files .file")) { const r = sec.getBoundingClientRect(); if (r.bottom > top) return +sec.dataset.f; }
  return null;
}
function setViewed(fi, on) {
  if (on) { S.viewed.add(fi); S.code.collapsed.add(fi); } else { S.viewed.delete(fi); S.code.collapsed.delete(fi); }
  const sec = $(`#file-${fi}`);
  if (sec) { sec.classList.toggle("viewed", on); sec.classList.toggle("collapsed", S.code.collapsed.has(fi)); $(".fh", sec).innerHTML = fileHeader(fi); if (!S.code.collapsed.has(fi)) fill(fi); }
  renderTree(); updateChrome(); save();
  if (on && sec && sec.getBoundingClientRect().top < toolbarBottom()) landOn(() => $(`#file-${fi}`), toolbarBottom() + 6);
}
// line numbers: one tab stop per file, arrows between lines
function rovingInit(body) { const first = $(".lnb", body); if (first) first.tabIndex = 0; }
// What the record knows about a block, kept or not: the unit it belongs to with its jobs and the reason for its verdict,
// the requirements it serves in words, the mechanisms it is part of with what they replace, and the routes it is a step of.
function aboutBlock(b) {
  const rows = [], add = (label, html) => rows.push(`<dt>${esc(L(label))}</dt><dd>${html}</dd>`);
  if (b.whole) add("whole", prose(b.whole));
  const u = b.unit && D.units.find((x) => x.name === b.unit);
  if (u) add("p.block.unit", `<button class="linkbtn" data-act="gounit" data-unit="${D.units.indexOf(u)}"><span class="unit-name">${esc(u.name)}</span></button>${u.jobs.length ? ` — ${u.jobs.map(prose).join("; ")}` : ""}${u.reason ? `<div class="small sub">${prose(u.reason)}</div>` : ""}`);
  add("p.block.serves", b.serves.length ? `<ul class="plain">${b.serves.map((id) => { const r = reqById.get(String(id)); return `<li>${chip("r", id)} ${prose(r.text)} <span class="muted small">${esc(L("source." + r.source))}${r.established ? "" : ` · ${esc(L("req.to-confirm"))}`}</span></li>`; }).join("")}</ul>` : `<span class="muted">${esc(L("p.block.no-req"))}</span>`);
  for (const [m, i] of D.mechanisms.map((m, i) => [m, i]).filter(([m]) => m.blocks.includes(b.id)))
    add("p.block.mechanism", `<button class="linkbtn" data-act="gomech" data-mech="${i}">${esc(m.name)}</button>${m.purpose ? ` — ${prose(m.purpose)}` : ""}${m.instead ? `<div class="small sub"><b>${esc(L("instead"))}:</b> ${prose(m.instead)}</div>` : ""}`);
  D.routes.forEach((r, i) => r.steps.forEach((s, k) => {
    if (s.block !== b.id) return;
    const prev = r.steps[k - 1], next = r.steps[k + 1];
    add("p.route", `<button class="linkbtn" data-act="goroute" data-route="${i}">${prose(r.title)}</button> <span class="muted small">${esc(L("p.route.of", k + 1, r.steps.length))}</span><div class="small">${prose(s.role)}</div><div class="route-nav">${prev ? `${esc(L("p.route.prev"))} ${chip("b", prev.block)}` : ""}${next ? ` ${esc(L("p.route.next"))} ${chip("b", next.block)}` : ""}</div>`);
  }));
  if (SETS.carried.ids.has(b.id)) add("p.block.carried", `<span class="tag dashed">${esc(L("p.block.carried-tag"))}</span> <span class="small sub">${esc(L("p.block.carried-note"))}</span>`);
  const items = blockItems(b);
  return `<div class="psec"><h3>${esc(L("p.block.about"))}</h3><dl class="kv kv-wide">${rows.join("")}</dl>${items.length ? "" : `<p class="muted small gap-top">${esc(L("p.block.kept"))}</p>`}</div>`;
}
function codePanel(sel) {
  const lcList = (filter) => { const list = state.lines.filter((c) => lastLk(c) && filter(lastLk(c))); return list.length ? `<div class="cmt-list">${list.map((c) => { const lk = lastLk(c); return `<div class="cmt"><div class="where">${esc(placeWords({ ...c, path: splitPath(c.path)[1] }))}<button class="btn sm quiet" data-act="goline" data-lk="${lk}">${esc(L("p.show"))}</button></div>${quoteHtml(c)}<div class="txt">${esc(c.text)}</div></div>`; }).join("")}</div>` : `<p class="muted small">${esc(L("p.lc.none"))}</p>`; };
  if (!sel) return panelWrap(esc(L("p.context")) + closeX('data-act="ctx"', L("p.code.ctx-close")), esc(L("p.nothing-selected")), `<div class="psec"><p>${esc(L("p.code.panel-note"))}</p></div><div class="psec"><h3>${esc(L("p.lc.all"))}</h3>${lcList(() => true)}</div>`);
  const b = blk(sel), items = blockItems(b);
  let body = `<div class="psec"><dl class="kv"><dt>${esc(L("p.place"))}</dt><dd><span class="mono small">${slashBreaks(b.path)}</span> <span class="muted small">${esc(b.where)}</span><br><button class="btn sm quiet flush" data-act="copy-block" data-b="${b.id}">${esc(L("p.copy"))}</button></dd>${b.kind ? `<dt>${esc(L("p.block.kind"))}</dt><dd>${esc(L("weight.category." + b.kind))}</dd>` : ""}<dt>${esc(L("purpose"))}</dt><dd>${esc(PURPOSE_LABEL[b.purpose])}</dd></dl></div>`;
  for (const c of items) {
    const r = c.ref, st = statusOf(c);
    let basis = "";
    if (c.kind === "finding") basis = `<dl class="kv"><dt>${esc(L("p.field.what"))}</dt><dd>${prose(r.what)}</dd><dt>${esc(L("shown-by"))}</dt><dd>${prose(r.shown_by)}</dd><dt>${esc(L("p.evidence"))}</dt><dd>${esc(L("evidence." + r.evidence))}</dd></dl>`;
    else if (c.type === "q") basis = `${r.context.length ? `<ul class="plain">${r.context.map((x) => `<li>${prose(x.text)} ${srcList(x.sources)}</li>`).join("")}</ul>` : `<p class="muted small">${esc(L("p.no-context", c.label))}</p>`}${r.recommendation?.sources.length ? `<p class="small">${esc(L("recommendation"))} ${srcList(r.recommendation.sources)}</p>` : ""}`;
    body += `<div class="psec"><h3>${c.label} · ${esc(typeText(c))} <span class="status" data-status="${esc(c.key)}">${tagHtml(st)}</span></h3><p class="strong">${prose(itemTitle(c))}</p><div class="answer-line small" data-answer="${esc(c.key)}">${answerHtml(st)}</div>${basis}<h3 class="gap-top">${esc(L("p.related"))}</h3>${relations(c.type, r.id)}</div>`;
  }
  body += aboutBlock(b);
  body += `<div class="psec"><h3>${esc(L("p.lc.file"))}</h3>${lcList((lk) => +lk.split(":")[0] === b.file)}</div>`;
  return panelWrap(`B${b.id} · ${verdictTag(b.verdict)}${closeX('data-act="ctx"', L("p.code.ctx-close"))}`, b.does ? prose(b.does) : `<span class="muted">${esc(L("p.block.no-does"))}</span>`, body);
}

// ---------------------------------------------------------------- Details
const DETAIL_TABS = [
  { id: "structure", label: L("p.details.structure"), count: () => D.units.length, always: true },
  { id: "mechanisms", label: L("p.details.mechanisms"), count: () => D.mechanisms.length },
  { id: "scenarios", label: L("p.details.scenarios"), count: () => D.scenarios.length },
  { id: "checks", label: L("p.details.checks"), count: () => D.checks.length },
  { id: "challenges", label: L("p.details.challenges"), count: () => D.challenges.length },
  { id: "screens", label: L("p.details.screens"), count: () => D.screens.length },
  { id: "coverage", label: L("p.details.coverage"), count: () => null, always: true },
  { id: "report", label: L("p.details.report"), count: () => null, always: true },
];
const detailTabs = () => DETAIL_TABS.filter((t) => t.always || t.count());
function renderDetails() {
  $("#panel-details").innerHTML = `<div class="frame"><div class="col">
    <div class="seg seg-gap" role="tablist" aria-label="${esc(L("p.tab.details"))}">${detailTabs().map((t) => { const k = t.count(); return `<button role="tab" data-act="xsub" data-sub="${t.id}" aria-selected="${S.sub.details === t.id}">${esc(t.label)}${k !== null ? `<span class="count">${n(k)}</span>` : ""}</button>`; }).join("")}</div>
    <div id="det-body"></div></div><aside class="panel" id="ctx-details" aria-label="${esc(L("p.context"))}"></aside></div>`;
  renderDetailBody();
}
function unitRows() {
  const rows = D.units.map((u, i) => { const s = u.lines; return { u, i, s, total: Object.values(s).reduce((a, b) => a + b, 0) }; });
  const { key, dir } = S.unitSort;
  const val = (r) => key === "name" ? r.u.name.toLowerCase() : key === "total" ? r.total : r.s.fix;
  return rows.sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0) * (key === "name" ? 1 : dir) || b.total - a.total || a.i - b.i);
}
function unitMismatch(u, s) {
  if (u.existing || !u.verdict) return "";
  const lineVerdicts = ["keep", "fix", "remove", "question"].filter((k) => s[k]);
  const v = { split: "fix", merge: "fix" }[u.verdict] ?? u.verdict;
  if (!lineVerdicts.length || lineVerdicts.includes(v) && (v !== "keep" || lineVerdicts.length === 1)) return "";
  const shares = lineVerdicts.map((k) => `${verdictWord(k)} ${n(s[k])}`).join(", ");
  return `<div class="mismatch">${esc(v === "keep" ? L("p.unit.blocks", shares) : L("p.unit.blocks-none", shares, verdictWord(v)))}</div>`;
}
const usedBy = (u) => D.units.filter((x) => x.uses.includes(u.name)).map((x) => x.name);
function unitsTable() {
  const sortTh = (key, label, num) => { const on = S.unitSort.key === key, up = key === "name" || S.unitSort.dir > 0; return `<th class="${num ? "num" : ""}" aria-sort="${on ? (up ? "ascending" : "descending") : "none"}"><button data-act="usort" data-key="${esc(key)}">${esc(label)}${on ? (up ? " ↑" : " ↓") : ""}</button></th>`; };
  return `<table class="tbl compact"><thead><tr>${sortTh("name", L("unit"))}${sortTh("fix", L("p.unit.lines-by"))}${sortTh("total", L("lines"), true)}<th>${esc(L("p.unit.verdict"))}</th><th class="hide-sm">${esc(L("p.unit.uses-by"))}</th><th></th></tr></thead><tbody>${unitRows().map(({ u, i, s, total }) => `<tr class="selectable" data-sel="unit:${i}" data-act="sel" tabindex="0"><td class="unit-cell"><div class="unit-name">${esc(u.name)}</div><div class="unit-jobs clamp1" title="${esc(u.jobs.join("; "))}">${u.jobs.map(prose).join("; ")}</div></td>
      <td>${total ? `${shareBar(s, "small")}<div class="shares">${["fix", "remove", "question", "keep"].filter((k) => s[k]).map((k) => `<span>${esc(verdictWord(k))} ${n(s[k])}</span>`).join("")}</div>` : `<span class="muted small">${esc(L(u.existing ? "p.unit.existing-outside" : "p.no-lines"))}</span>`}</td><td class="num">${total ? n(total) : ""}</td>
      <td>${u.existing ? `<span class="muted small">${esc(L("p.unit.existing"))}</span>` : `<span class="small">${esc(verdictWord(u.verdict ?? "keep"))}</span>${u.findings.length || u.questions.length ? ` ${chips("f", u.findings)}${chips("q", u.questions)}` : ""}${unitMismatch(u, s)}${u.reason ? `<div class="unit-jobs clamp2" title="${esc(u.reason)}">${prose(u.reason)}</div>` : ""}`}</td>
      <td class="small hide-sm"><div class="clamp2"><span class="muted">${esc(L("p.unit.uses"))}</span> <span class="mono">${esc(u.uses.join(", ") || "—")}</span></div><div class="clamp2"><span class="muted">${esc(L("p.unit.used-by"))}</span> <span class="mono">${esc(usedBy(u).join(", ") || "—")}</span></div></td>
      <td class="nowrap">${u.blocks.length ? `<button class="btn sm quiet" data-act="unit-code" data-unit="${i}">${esc(L("p.show-in-code"))}</button>` : ""}</td></tr>`).join("")}</tbody></table><p class="muted small gap-top">${esc(L("p.unit.note"))}</p>`;
}
function renderDetailBody() {
  if (!detailTabs().some((t) => t.id === S.sub.details)) S.sub.details = "structure";
  $$('#panel-details [data-act="xsub"]').forEach((b) => b.setAttribute("aria-selected", String(b.dataset.sub === S.sub.details)));
  const sub = S.sub.details;
  let html = "";
  if (sub === "structure") {
    const units = D.units;
    html = `<div class="twocol"><div class="box"><h3>${esc(L("now"))}</h3><div class="prose">${textBlock(D.now)}</div></div><div class="box"><h3>${esc(L("target"))}</h3><div class="prose">${textBlock(D.target)}</div></div></div>
      <div class="section-h"><h2>${esc(L("p.units.written"))}</h2><span class="muted">${esc(P("p.count.units", units.length))}</span>${units.length ? `<span class="right"><span class="seg" role="group" aria-label="${esc(L("p.units.view"))}"><button data-act="sview" data-view="table" aria-pressed="${S.structView === "table"}">${esc(L("p.units.table"))}</button><button data-act="sview" data-view="graph" aria-pressed="${S.structView === "graph"}">${esc(L("p.units.graph"))}</button></span></span>` : ""}</div>
      ${!units.length ? `<div class="empty"><strong>${esc(L("p.units.none"))}</strong>${esc(L("p.units.none-note"))}</div>` : S.structView === "graph" ? graphHtml() : unitsTable()}
      ${D.targetUnits.length ? `<div class="section-h"><h2>${esc(L("p.units.target"))}</h2><span class="muted">${esc(P("p.count.units", D.targetUnits.length))}</span></div><table class="tbl"><thead><tr><th>${esc(L("unit"))}</th><th>${esc(L("jobs"))}</th><th>${esc(L("uses"))}</th><th>${esc(L("status"))}</th></tr></thead><tbody>${D.targetUnits.map((u) => `<tr><td class="unit-name">${esc(u.name)}</td><td class="sub">${u.jobs.map(prose).join("; ")}</td><td class="mono small">${esc(u.uses.join(", ") || "—")}</td><td class="muted small nowrap">${esc(L(u.existing ? "existing" : D.units.some((x) => x.name === u.name && !x.existing) ? "from-change" : "to-write"))}</td></tr>`).join("")}</tbody></table>` : ""}
`;
  } else if (sub === "mechanisms") {
    const counts = (w) => w.rows.map((row) => `<div>${esc(row.kind)}: ${esc(row.text)}</div>`).join("") || esc(L("weight.unchanged"));
    html = `${D.together ? `<div class="box box-gap"><p><b>${esc(L("weight.together"))}</b> (${esc(D.together.names.join(", "))}): ${esc(D.together.rows.map((row) => `${row.kind}: ${row.text}`).join(" · ") || L("weight.unchanged"))}</p><p class="muted small">${esc(L("weight.note"))}</p></div>` : ""}
      <table class="tbl"><thead><tr><th>${esc(L("p.mech"))}</th><th>${esc(L("p.mech.change"))}</th><th>${esc(L("decision"))}</th><th class="num">${esc(L("weight"))}</th><th>${esc(L("findings"))}</th></tr></thead><tbody>${D.mechanisms.map((m, i) => `<tr class="selectable" data-sel="mech:${i}" data-act="sel" tabindex="0"><td><b>${esc(m.name)}</b><div class="unit-jobs">${prose(m.purpose ?? "")}</div></td><td class="muted nowrap">${esc(L("change." + m.change))}</td><td>${prose(m.decision ?? "")}</td><td class="num small">${m.weight ? counts(m.weight) + (m.weight.shared.length ? `<div class="muted">${esc(P("p.count.shared", m.weight.shared.length))}</div>` : "") : `<span class="muted">—</span>`}</td><td>${chips("f", m.findings)}</td></tr>`).join("")}</tbody></table>`;
  } else if (sub === "scenarios") {
    const side = (s) => s ? `<div><span class="lbl">${esc(L("edit"))}</span>${s.edit.map(prose).join("; ") || esc(L("nothing"))}</div><div><span class="lbl">${esc(L("read"))}</span>${s.read.map(prose).join("; ") || esc(L("nothing"))}</div>` : `<span class="muted">${esc(L("as-now"))}</span>`;
    html = `<p class="muted intro">${esc(L("scenarios-note"))}</p><div class="cards">${D.scenarios.map((s) => `<div class="card selectable" data-sel="scen:${esc(s.id)}" data-act="sel" tabindex="0" id="scen-${esc(s.id)}"><div class="card-head"><span class="card-id">${esc(L("p.rel.scenario", s.id))}</span>${s.requirements.length ? `<span class="card-type">${esc(L("p.scenario.for", s.requirements.map((r) => "R" + r).join(", ")))}</span>` : ""}</div>${pcWrap(`scenario.${s.id}/change`, `<p class="card-title pf">${prose(s.change)}</p>`)}<div class="twocol"><div class="box"><h3>${esc(L("as-written"))}</h3>${side(s.now)}</div><div class="box"><h3>${esc(L("target"))}</h3>${side(s.target)}</div></div>${s.findings.length ? `<div class="card-foot"><span class="lbl">${esc(L("findings"))}</span>${chips("f", s.findings)}</div>` : ""}</div>`).join("")}</div>`;
  } else if (sub === "checks") {
    html = `<p class="muted intro">${esc(L("checks-note"))}</p><div class="cards">${D.checks.map((c, i) => `<div class="card selectable" data-sel="check:${i}" data-act="sel" tabindex="0"><div class="check-item"><span class="n">${i + 1}</span><div>${c.from ? `<p><span class="lbl">${esc(L("from"))}</span>${prose(c.from)}</p>` : ""}<ol>${c.do.map((x) => `<li>${prose(x)}</li>`).join("")}</ol><p><span class="lbl">${esc(L("expect"))}</span>${prose(c.expect)}</p>${c.requirements.length ? `<div class="card-foot"><span class="lbl">${esc(L("p.check.checks"))}</span>${chips("r", c.requirements)}</div>` : ""}</div></div></div>`).join("")}</div>`;
  } else if (sub === "challenges") {
    html = `<p class="muted intro">${esc(L("challenges-note"))}</p><table class="tbl"><thead><tr><th>#</th><th>${esc(L("raised-by"))}</th><th>${esc(L("point"))}</th><th>${esc(L("outcome"))}</th></tr></thead><tbody>${D.challenges.map((c, i) => `<tr class="selectable" data-sel="chal:${i}" data-act="sel" tabindex="0"><td class="id">${i + 1}</td><td class="nowrap sub">${esc(L("challenger." + c.from))}</td><td><div class="clamp2">${prose(c.point)}</div></td><td class="nowrap"><span class="tag ${c.outcome === "owner" ? "open" : "neutral"}">${esc(L("outcome." + c.outcome))}</span></td></tr>`).join("")}</tbody></table>`;
  } else if (sub === "screens") {
    html = D.screens.map((s, si) => screenBox(si)).join("");
  } else if (sub === "coverage") {
    // How far the review's conclusions reach: what was not checked and where the review stops first, then what ran,
    // then what was only read. The reviewer's prose is shown as written when nothing breaks it down, folded away when
    // statements do; nothing is read out of it.
    const of = (kind) => D.coverageStructured.filter((c) => c.kind === kind), structured = D.coverageStructured.length > 0;
    const stmt = (c) => `<li>${prose(c.text)}${c.revision ? ` <span class="muted small">${esc(L("p.coverage.at", c.revision))}</span>` : c.kind === "ran" ? ` <span class="muted small">${esc(L("p.coverage.no-revision"))}</span>` : ""}${c.sources.length ? `<div>${srcList(c.sources)}</div>` : ""}</li>`;
    const limit = (set) => SETS[set].ids.size ? `<li>${esc(P(SETS[set].warn, SETS[set].ids.size))} <button class="btn sm quiet" data-act="set-code" data-set="${set}">${esc(L("p.show-in-code"))}</button></li>` : "";
    const unchecked = [...of("not_checked").map(stmt), ...D.requirements.filter((r) => r.not_checked).map((r) => `<li>${chip("r", r.id)} ${prose(r.not_checked)}</li>`)];
    const limits = unchecked.join("") + limit("carried") + limit("unlinked") + limit("assumed");
    const section = (title, items, cls) => items ? `<div class="section-h"><h2>${esc(title)}</h2></div><div class="box ${cls}"><ul class="plain cov-list">${items}</ul></div>` : "";
    // a kind no statement names is not counted as none: the prose may say it
    const counts = [["coverage.ran", of("ran").length], ["coverage.read", of("read").length], ["coverage.not-checked", unchecked.length]].filter(([, c]) => c);
    html = `<p class="muted intro">${esc(L("p.coverage.intro"))}</p>
      ${counts.length ? `<div class="cov-counts">${counts.map(([k, c]) => `<span>${esc(L(k))}: <b>${n(c)}</b></span>`).join("")}</div>` : ""}
      ${section(L("p.coverage.limits"), limits, "cov-limits")}${section(L("coverage.ran"), of("ran").map(stmt).join(""), "cov-ran")}${section(L("coverage.read"), of("read").map(stmt).join(""), "cov-read")}
      <div class="section-h"><h2>${esc(L("p.coverage.note"))}</h2>${structured ? "" : `<span class="muted">${esc(L("p.coverage.unstructured"))}</span>`}</div><div class="box prose">${textBlock(D.coverage)}</div>`;
  } else {
    const p = D.passport;
    html = `<div class="box"><dl class="kv kv-wide">
      <dt>${esc(L("p.report.title"))}</dt><dd>${esc(D.title)}</dd><dt>${esc(L("p.scope"))}</dt><dd>${prose(D.range)}</dd>
      ${p ? `<dt>${esc(L("p.report.repository"))}</dt><dd>${esc(p.repository ?? "")}</dd><dt>${esc(L("p.report.base-head"))}</dt><dd class="mono">${esc(p.base ?? "")} → ${esc(p.head ?? "")}</dd><dt>${esc(L("passport.reviewed-at"))}</dt><dd>${esc(p.reviewedAt ?? "")}</dd>${(p.links ?? []).map((l) => `<dt>${esc(l.kind)}</dt><dd>${/^https?:\/\//i.test(l.url) ? `<a href="${esc(l.url)}" rel="noreferrer">${esc(l.label)}</a>` : esc(l.label)}</dd>`).join("")}` : `<dt>${esc(L("passport"))}</dt><dd class="muted">${esc(L("p.report.no-passport"))}</dd>`}
      <dt>${esc(L("p.report.diff"))}</dt><dd><span class="mono small">${esc(D.digest.diffFile)}</span><br><span class="mono small muted">sha256 ${esc(D.digest.diff)}</span></dd>
      <dt>${esc(L("passport.record"))}</dt><dd><span class="mono small muted">sha256 ${esc(D.digest.record)}</span></dd>
      ${D.history ? `<dt>${esc(L("p.report.continues"))}</dt><dd>${D.history.title ? esc(L("p.report.continues.title", D.history.title)) : `<span class="mono small">${esc(D.history.record)}</span>`}${D.history.reviewedAt ? `, ${esc(D.history.reviewedAt)}` : ""}<br><span class="mono small muted">sha256 ${esc(D.history.sha256)}</span><br><span class="small">${esc([P("p.count.carried", D.carried.length), P("p.count.replies", D.replies.length)].join(" · "))}</span></dd>` : ""}
      <dt>${esc(L("p.report.language"))}</dt><dd>${esc(D.language)}</dd>
      <dt>${esc(L("p.report.size"))}</dt><dd>${esc([P("p.count.files", D.counters.files), P("p.count.blocks", D.counters.blocks), P("p.count.items", ITEMS.length)].join(", "))}</dd>
      </dl></div><p class="muted small gap-top" id="report-memory">${esc(kept("hint"))}</p>`;
  }
  $("#det-body").innerHTML = html;
  if (sub === "structure" && S.structView === "graph") wireGraph();
  const prefix = { structure: "unit:", mechanisms: "mech:", scenarios: "scen:", checks: "check:", challenges: "chal:" }[sub];
  if (prefix && !(S.sel.details ?? "").startsWith(prefix)) {
    const first = { structure: () => { const r = unitRows().find((x) => !x.u.existing); return r ? r.i : -1; }, mechanisms: () => 0, scenarios: () => D.scenarios[0]?.id ?? -1, checks: () => 0, challenges: () => 0 }[sub]();
    S.sel.details = first !== -1 && first !== undefined ? prefix + first : null;
  }
  if (!prefix) S.sel.details = null;
  select("details", S.sel.details);
}
function graphHtml() {
  const units = D.units, idx = new Map(units.map((u, i) => [u.name, i]));
  const row = units.map(() => 0);
  for (let pass = 0; pass < units.length; pass++) units.forEach((u, i) => u.uses.forEach((x) => { const j = idx.get(x); if (j !== undefined && j !== i && row[j] <= row[i]) row[j] = row[i] + 1; }));
  const rows = []; units.forEach((u, i) => (rows[row[i]] ??= []).push(i));
  const W_ = (i) => Math.max(120, units[i].name.length * 7.3 + 26), H = 46, GX = 22, GY = 56;
  const avail = Math.max(480, ($("#det-body")?.clientWidth ?? 900) - 48);
  const pos = [];
  let y = 10, width = 0;
  const lines = rows.filter(Boolean).flatMap((r) => { const out = [[]]; let w = 0; for (const i of r) { if (out.at(-1).length && w + GX + W_(i) > avail) { out.push([]); w = 0; } w += (out.at(-1).length ? GX : 0) + W_(i); out.at(-1).push(i); } return out; });
  for (const line of lines) width = Math.max(width, line.reduce((s, i) => s + W_(i) + GX, -GX));
  for (const line of lines) { const lw = line.reduce((s, i) => s + W_(i) + GX, -GX); let x = (width - lw) / 2 + 10; for (const i of line) { pos[i] = { x, y, w: W_(i) }; x += W_(i) + GX; } y += H + GY; }
  const edges = [];
  units.forEach((u, i) => u.uses.forEach((name) => { const j = idx.get(name); if (j === undefined) return; const a = pos[i], b = pos[j]; const x1 = a.x + a.w / 2, y1 = a.y + H, x2 = b.x + b.w / 2, y2 = b.y; edges.push(`<path class="gedge" data-from="${i}" data-to="${j}" d="M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2 - 6}" marker-end="url(#arr)"/>`); }));
  const nodes = units.map((u, i) => {
    const p = pos[i], s = u.lines, total = Object.values(s).reduce((a, b) => a + b, 0);
    let bx = p.x, bar = "";
    if (total) for (const k of ["keep", "fix", "remove", "question"]) if (s[k]) { const w = p.w * s[k] / total; bar += `<rect class="gbar s-${k}" x="${bx}" y="${p.y + H - 4}" width="${w}" height="4"/>`; bx += w; }
    const sub = u.existing ? L("p.unit.existing") : `${["fix", "remove", "question"].filter((k) => s[k]).map((k) => `${verdictWord(k)} ${n(s[k])}`).join(" · ") || verdictWord("keep")} · ${P("p.count.lines-n", total)}`;
    return `<g class="gnode${u.existing ? " existing" : ""}" data-i="${i}" data-sel="unit:${i}" data-act="sel" tabindex="0" role="button" aria-label="${esc(u.name)}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${H}" rx="5"/><text x="${p.x + 10}" y="${p.y + 19}">${esc(u.name)}</text><text class="gsub" x="${p.x + 10}" y="${p.y + 35}">${esc(sub)}</text>${bar}</g>`;
  }).join("");
  return `<div class="graph-wrap"><svg id="graph" width="${width + 20}" height="${y - GY + 20}" viewBox="0 0 ${width + 20} ${y - GY + 20}" role="img" aria-label="${esc(L("p.graph.label"))}"><defs><marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path class="garrow" d="M0,0 L8,4 L0,8 z"/></marker></defs>${edges.join("")}${nodes}</svg></div>
    <p class="muted small gap-top">${esc(L("p.graph.note"))}</p>`;
}
function wireGraph() {
  const svg = $("#graph"); if (!svg) return;
  const on = (i) => { svg.classList.add("hovering"); $$(".gedge", svg).forEach((e) => { const hit = e.dataset.from === i || e.dataset.to === i; e.classList.toggle("hl", hit); if (hit) { $(`.gnode[data-i="${e.dataset.from}"]`, svg).classList.add("hl"); $(`.gnode[data-i="${e.dataset.to}"]`, svg).classList.add("hl"); } }); $(`.gnode[data-i="${i}"]`, svg).classList.add("hl"); };
  const off = () => { svg.classList.remove("hovering"); $$(".hl", svg).forEach((e) => e.classList.remove("hl")); };
  $$(".gnode", svg).forEach((g) => { g.addEventListener("mouseenter", () => on(g.dataset.i)); g.addEventListener("mouseleave", off); g.addEventListener("focus", () => on(g.dataset.i)); g.addEventListener("blur", off); });
}
function detailsPanel(sel) {
  const sub = S.sub.details;
  if (!sel) {
    const about = { coverage: "p.about.coverage", report: "p.about.report", screens: "p.about.screens" }[sub];
    return panelWrap(esc(L("p.context")), esc(L(about ? "p.about" : "p.nothing-selected")), `<div class="psec"><p class="muted">${esc(L(about ?? "p.select-row"))}</p></div>`);
  }
  const [kind, raw] = cut(sel, ":"), i = +raw;
  if (kind === "unit") {
    const u = D.units[i]; if (!u) return "";
    return panelWrap(esc(`${L("unit")} · ${u.existing ? L("p.unit.existing") : L("p.unit.verdict-is", verdictWord(u.verdict ?? "keep"))}`), `<span class="unit-name">${esc(u.name)}</span>`, `
      <div class="psec"><dl class="kv"><dt>${esc(L("jobs"))}</dt><dd><ul class="dash">${u.jobs.map((j) => `<li>${prose(j)}</li>`).join("")}</ul></dd>${u.reason ? `<dt>${esc(L("reason"))}</dt><dd>${prose(u.reason)}</dd>` : ""}<dt>${esc(L("uses"))}</dt><dd class="mono small">${esc(u.uses.join(", ") || L("nothing"))}</dd><dt>${esc(L("p.unit.used-by"))}</dt><dd class="mono small">${esc(usedBy(u).join(", ") || L("nothing"))}</dd></dl></div>
      ${u.findings.length || u.questions.length ? `<div class="psec"><h3>${esc(L("decisions"))}</h3>${[...u.findings.map((f) => "f" + f), ...u.questions.map((q) => "q" + q)].filter((k) => itemByKey.has(k)).map((k) => miniItem(itemByKey.get(k))).join("")}</div>` : ""}
      <div class="psec"><h3>${esc(L("p.code"))} · ${esc(P("p.count.blocks", u.blocks.length))}${u.blocks.length ? `<button class="btn sm" data-act="unit-code" data-unit="${i}">${esc(L("p.show-in-code"))}</button>` : ""}</h3>${u.blocks.length ? excerptList(u.blocks, "unit" + i) : `<p class="muted">${esc(L("p.unit.untouched"))}</p>`}</div>`);
  }
  if (kind === "mech") {
    const m = D.mechanisms[i]; if (!m) return "";
    const row = (label, value, strong) => value ? `<dt>${esc(label)}</dt><dd>${strong ? `<b>${prose(value)}</b>` : prose(value)}</dd>` : "";
    return panelWrap(esc(`${L("p.mech")} · ${L("change." + m.change)}`), esc(m.name), `
      <div class="psec"><dl class="kv">${row(L("purpose"), m.purpose)}${row(L("basis"), m.basis)}${row(L("instead"), m.instead)}${row(L("benefit"), m.benefit)}${row(L("cost"), m.cost)}${row(L("decision"), m.decision, true)}<dt>${esc(L("p.evidence"))}</dt><dd>${esc(L("evidence." + m.evidence))}</dd><dt>${esc(L("units"))}</dt><dd class="mono small">${esc(m.units.join(", "))}</dd></dl></div>
      ${m.weight?.shared.length ? `<div class="psec"><h3>${esc(L("p.mech.shared"))}</h3><ul class="plain">${m.weight.shared.map((s) => `<li>${chip("b", s.block)} ${esc(L("p.mech.with", s.with.join(", ")))}</li>`).join("")}</ul></div>` : ""}
      ${m.findings.length ? `<div class="psec"><h3>${esc(L("findings"))}</h3>${m.findings.map((f) => miniItem(itemByKey.get("f" + f))).join("")}</div>` : ""}
      <div class="psec"><h3>${esc(L("p.code"))} · ${esc(P("p.count.blocks", m.blocks.length))}</h3>${excerptList(m.blocks, "mech" + i)}</div>`);
  }
  if (kind === "scen") {
    const s = D.scenarios.find((x) => x.id === raw); if (!s) return "";
    return panelWrap(esc(L("p.rel.scenario", s.id)), prose(s.change), `<div class="psec"><h3>${esc(L("requirements"))}</h3>${s.requirements.map((id) => `<div class="mini"><div class="mh">${chip("r", id)}</div><div class="mx">${prose(reqById.get(id)?.text ?? "")}</div></div>`).join("") || `<p class="muted">${esc(L("p.none-named"))}</p>`}</div>
      ${s.findings.length ? `<div class="psec"><h3>${esc(L("p.scenario.findings"))}</h3>${s.findings.map((f) => miniItem(itemByKey.get("f" + f))).join("")}</div>` : ""}`);
  }
  if (kind === "check") {
    const c = D.checks[i]; if (!c) return "";
    return panelWrap(esc(L("p.rel.check", i + 1)), prose(c.expect), `<div class="psec"><h3>${esc(L("p.check.requirements"))}</h3>${c.requirements.map((id) => { const r = reqById.get(id); return `<div class="mini"><div class="mh">${chip("r", id)}</div><div class="mx">${prose(r.text)}</div><div class="mini-status">${reqStatus(r)}</div></div>`; }).join("") || `<p class="muted">${esc(L("p.none-named"))}</p>`}</div>
      <div class="psec"><p class="muted small">${esc(L("checks-note"))}</p></div>`);
  }
  if (kind === "chal") {
    const c = D.challenges[i]; if (!c) return "";
    return panelWrap(`${esc(L("p.challenge.raised", i + 1, L("challenger." + c.from)))} · <span class="tag ${c.outcome === "owner" ? "open" : "neutral"}">${esc(L("outcome." + c.outcome))}</span>`, esc(L("p.challenge", i + 1)), `
      <div class="psec"><h3>${esc(L("point"))}</h3>${pcWrap(`challenge.${i + 1}/point`, `<p class="pf">${prose(c.point)}</p>`)}</div>
      <div class="psec"><h3>${esc(L("p.challenge.did"))}</h3>${pcWrap(`challenge.${i + 1}/note`, `<p class="pf">${prose(c.note)}</p>`)}</div>
      ${c.place ? `<div class="psec"><h3>${esc(L("p.challenge.place"))}</h3>${placeExcerpt(c.place, rowAt(c.place))}</div>` : ""}`);
  }
  return "";
}

// ---------------------------------------------------------------- panels and navigation
// A new selection starts at the panel's top; more of the same selection keeps the place the owner reads.
function renderPanel(tab, { keep = false } = {}) {
  const el = $("#ctx-" + tab); if (!el) return;
  const sel = S.sel[tab], top = el.scrollTop;
  el.innerHTML = tab === "summary" ? summaryPanel(sel) : tab === "decisions" ? decisionsPanel(sel) : tab === "code" ? codePanel(sel) : detailsPanel(sel);
  el.scrollTop = keep ? top : 0;
}
function goCard(key, { focus = false } = {}) {
  if (S.tab !== "decisions") showTab("decisions", { push: false });
  const sub = DEC_TABS.find((t) => t.id === S.sub.decisions);
  if (sub.id === "comments" || !sub.test(itemByKey.get(key))) { S.sub.decisions = "all"; renderDecList(); }
  select("decisions", "card:" + key);
  const card = $(`#card-${key}`);
  card?.scrollIntoView({ block: "start" });
  if (focus) card?.focus({ preventScroll: true });
}
function openAnswer(card) {
  const key = card.dataset.card, c = itemByKey.get(key);
  if (!optionsOf(c).length) return $(`#card-${key} textarea[data-act="text"]`)?.focus();
  ($(`#card-${key} .full input[data-act="pick"]:checked`) ?? $(`#card-${key} .full input[data-act="pick"]`))?.focus();
}
function goDetails(sub, sel) { S.sub.details = sub; S.sel.details = sel; showTab("details"); if (S.rendered.details) renderDetailBody(); $(`[data-sel="${CSS.escape(sel)}"]`, $("#panel-details"))?.scrollIntoView({ block: "center" }); }
function go(spec) {
  const [kind, id] = cut(spec, ":");
  if (kind === "d") { const [sub, sel] = cut(id, "/"); return goDetails(sub, sel || null); }
  if (kind === "b") { const b = blk(+id); const items = blockItems(b); return goBlock(+id, { key: items.length ? (items.find(isOpen) ?? items[0]).key : null }); }
  if (kind === "r") { showTab("summary", { push: false }); return select("summary", "req:" + id, { scroll: true }); }
  if (kind === "m") return goDetails("mechanisms", "mech:" + (+id - 1));
  if (itemByKey.has(kind + id)) return goCard(kind + id);
}
function goAnchor(anchor) {
  const [item] = cutLast(anchor, "/"), [part, id] = cut(item, ".");
  const there = (root) => $(`[data-anchor="${CSS.escape(anchor)}"]`, root)?.scrollIntoView({ block: "center" });
  if (["verdict", "recommendation", "step"].includes(part)) { showTab("summary"); return there($("#panel-summary")); }
  if (part === "scenario") return goDetails("scenarios", "scen:" + id);
  if (part === "challenge") return goDetails("challenges", "chal:" + (+id - 1));
  if (itemByKey.has(item)) { goCard(item); there(document); }
}
function itemToCode(key) {
  const c = itemByKey.get(key), w = walkAll().find((x) => x.c === c);
  if (w) goBlock(w.blocks[0], { key, focus: true });
}
// «Show in Code» from a requirement: its filter, and the selection on its first block in view
// The newest explicit choice wins: an older filter that would hide what it names is dropped.
function reqToCode(id) {
  resetFilters(); S.code.req = id; S.code.mode = "all"; S.code.pinned.clear();
  showTab("code", { push: false }); if (S.rendered.code) rerenderCode();
  const serving = ORDER.filter((b) => b.serves.includes(id));
  const target = serving.find(blockOpen) ?? serving[0];
  if (target) goBlock(target.id); else { select("code", null); setHash(); }
}
function unitToCode(i) {
  const u = D.units[i];
  resetFilters(); S.code.unit = u.name; S.code.mode = "all"; S.code.pinned.clear();
  showTab("code", { push: false }); if (S.rendered.code) rerenderCode();
  const blocks = ORDER.filter((b) => b.unit === u.name), target = blocks.find(blockOpen) ?? blocks[0];
  if (target) goBlock(target.id); else { select("code", null); setHash(); }
}
function setToCode(set) {
  resetFilters(); S.code.set = set; S.code.mode = "all"; S.code.pinned.clear();
  showTab("code", { push: false }); if (S.rendered.code) rerenderCode();
  const first = ORDER.find((b) => SETS[set].ids.has(b.id));
  if (first) goBlock(first.id);
}

// ---------------------------------------------------------------- events
let textTimer = null, qTimer = null, pendingText = null;
// An own answer is written 120 ms after the last keystroke, and at once when the page is hidden or left, so the latest
// answer survives a reload; a field left or committed writes it itself and drops what was pending.
function flushText() { clearTimeout(textTimer); const p = pendingText; pendingText = null; if (p) setText(p.key, p.value); }
window.addEventListener("pagehide", flushText);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushText(); });
const typingTarget = (t) => t?.matches?.('textarea, select, input:not([type="radio"]):not([type="checkbox"]):not([type="button"])') || t?.isContentEditable;
// The actions that take the owner to another place: each leaves a history entry behind.
const NAVIGATES = new Set(["start", "item-code", "req-code", "unit-code", "set-code", "goline", "goanchor", "gounit", "gomech", "gocheck", "goscen", "gostep", "export-go"]);
let pushNext = false;
document.addEventListener("click", (e) => {
  const goEl = e.target.closest("[data-go]");
  if (goEl && !e.metaKey && !e.ctrlKey) { e.preventDefault(); pushNext = true; return go(goEl.dataset.go); }
  const tabBtn = e.target.closest(".tab[data-tab]");
  if (tabBtn) { pushNext = true; return showTab(tabBtn.dataset.tab); }
  const act = e.target.closest("[data-act]"), a = act?.dataset.act;
  if (NAVIGATES.has(a)) pushNext = true;
  if (a === "pick" && act.tagName === "INPUT") return; // radios and checkboxes act on change
  closeMenus(e.target);
  if (a) {
    const key = act.dataset.key;
    switch (a) {
      case "theme-pick": S.theme = act.dataset.theme; applyTheme(); save(); closeMenus(); return $("#theme-btn").focus();
      case "export": return openExport();
      case "zoom": return openZoom(act.dataset.pic);
      case "zoom-fit": case "zoom-full": zoomFit = a === "zoom-fit"; return showZoom(zoomAt);
      case "zoom-toggle": zoomFit = !zoomFit; return showZoom(zoomAt);
      case "zoom-prev": case "zoom-next": return showZoom(zoomAt + (a === "zoom-next" ? 1 : -1));
      case "print": $("#export-dialog").close(); return window.print();
      case "export-json": return downloadExport();
      case "export-copy": return copyText($("#export-text"), $("#export-status"));
      case "unreadable-show": return openUnreadable();
      case "unreadable-copy": return copyText($("#unreadable-text"), $("#unreadable-status"));
      case "unreadable-replace": return saveOverUnreadable();
      case "export-go": { const go = act.dataset.target; $("#export-dialog").close(); return go.startsWith("line:") ? goLine(go.slice(5)) : go.startsWith("anchor:") ? goAnchor(go.slice(7)) : goCard(go); }
      case "keys": return $("#keys-dialog").showModal();
      case "start": return startReview();
      case "sel": {
        if (e.target.closest("a, button, input, textarea, select, label") && e.target.closest("[data-act]") !== act) return;
        return select(S.tab, act.dataset.sel);
      }
      case "answer-here": { const bid = +act.dataset.b; S.cur = { key, bid }; select("code", bid); moveAnswerTo(key, bid); markSelectedBlock(); $(`#note-${bid} [data-choice="${key}"] button, #note-${bid} [data-choice="${key}"] textarea`)?.focus({ preventScroll: true }); return; }
      case "pick": { const nt = act.closest(".note"); if (nt) { S.cur = { key, bid: +nt.dataset.b }; if (S.sel.code !== +nt.dataset.b) select("code", +nt.dataset.b); } return pick(key, act.dataset.opt); }
      case "defer": { const nt = act.closest(".note"); if (nt) S.cur = { key, bid: +nt.dataset.b }; return openField(key, S.field[key] === "defer" ? null : "defer"); }
      case "defer-save": return confirmDefer(key);
      case "field-close": S.field[key] = null; delete S.reasonText[key]; return afterChange(key, { structural: true });
      case "undefer": setState(DR.undefer(ITEMS, state, key)); return afterChange(key, { structural: true });
      case "apply-draft": setState(DR.applyDraft(ITEMS, state, key)); S.field[key] = null; return afterChange(key, { structural: true });
      case "clear": return clearAnswer(key);
      case "selcard": select("decisions", "card:" + key); $(`#card-${key}`)?.classList.add("open-full"); return;
      case "item-code": return itemToCode(key);
      case "more": S.more[act.dataset.more] = true; return renderPanel(S.tab, { keep: true });
      case "cmap": {
        const key = act.dataset.key, id = +act.dataset.b, open = S.cmap[key] === id, box = act.closest(".cmap");
        $$(".cmap-ex", box).forEach((x) => x.remove()); $$('.cmap-tog[aria-expanded="true"]', box).forEach((x) => x.setAttribute("aria-expanded", "false"));
        S.cmap[key] = open ? null : id;
        if (!open) { act.setAttribute("aria-expanded", "true"); act.insertAdjacentHTML("afterend", `<div class="cmap-ex">${excerptHtml(id)}</div>`); }
        return;
      }
      case "dsub": S.sub.decisions = act.dataset.sub; renderDecList(); syncDecSelection(); setHash(); return;
      case "xsub": S.sub.details = act.dataset.sub; renderDetailBody(); setHash(); return;
      case "sview": S.structView = act.dataset.view; return renderDetailBody();
      case "usort": { const k = act.dataset.key; S.unitSort = { key: k, dir: S.unitSort.key === k ? -S.unitSort.dir : -1 }; return renderDetailBody(); }
      case "cov-more": { const p = $("#cov-text"); p.classList.toggle("clamp"); const all = !p.classList.contains("clamp"); act.textContent = L(all ? "p.show-less" : "p.show-all"); act.setAttribute("aria-expanded", String(all)); return; }
      case "to-reqs": e.preventDefault(); return $("#summary-reqs")?.scrollIntoView({ block: "start" });
      case "req-code": return reqToCode(act.dataset.req);
      case "unit-code": return unitToCode(+act.dataset.unit);
      case "set-code": return setToCode(act.dataset.set);
      case "gounit": return goDetails("structure", "unit:" + act.dataset.unit);
      case "gomech": return goDetails("mechanisms", "mech:" + act.dataset.mech);
      case "gocheck": return goDetails("checks", "check:" + act.dataset.check);
      case "goscen": return goDetails("scenarios", "scen:" + act.dataset.scen);
      case "gostep": showTab("summary"); return select("summary", "step:" + act.dataset.step, { scroll: true });
      case "goanchor": return goAnchor(act.dataset.anchor);
      case "goroute": showTab("summary"); return select("summary", "route:" + act.dataset.route, { scroll: true });
      case "tree": return setTree(!S.code.tree);
      case "ctx": { if (act.closest("#ctx-code")) requestAnimationFrame(() => $('.toolbar [data-act="ctx"]')?.focus()); S.code.ctx = !S.code.ctx; $("#ctx-code").hidden = !S.code.ctx; $("#code-frame").classList.toggle("ctx", S.code.ctx); syncToolbar(); if (S.code.ctx) renderPanel("code"); measureCpl(); return; }
      case "skip": e.preventDefault(); { const t = (S.sel.code && $(`#note-${S.sel.code}`)) || $("#files .note, #files .done-line") || $("#files"); t.focus(); if (!S.sel.code) t.scrollIntoView({ block: "center" }); } return;
      case "mode": S.code.mode = act.dataset.mode; S.code.pinned.clear(); return rerenderCode();
      case "purpose-menu": case "req-menu": case "theme-menu": return toggleMenu(act);
      case "req-pick": S.code.req = act.dataset.req; S.code.pinned.clear(); closeMenus(); $("#req-btn").focus(); return rerenderCode();
      case "unit-clear": S.code.unit = ""; return rerenderCode();
      case "set-clear": S.code.set = null; return rerenderCode();
      case "undo": return runUndo();
      case "find-open": return openFind();
      case "find-close": return closeFind();
      case "find-next": return findStep(1);
      case "find-prev": return findStep(-1);
      case "unfold": act.dataset.fold.split(",").forEach((id) => S.code.expanded.add(id)); return fill(+act.dataset.f, true);
      case "done-open": { const bid = +act.dataset.b; S.code.doneOpen.add(bid); S.cur = { key: blockItems(blk(bid))[0]?.key, bid }; S.sel.code = bid; fill(blk(bid).file, true); select("code", bid); $(`#note-${bid}`)?.focus({ preventScroll: true }); return; }
      case "done-close": { const bid = +act.dataset.b; S.code.doneOpen.delete(bid); fill(blk(bid).file, true); $(`#note-${bid}`)?.focus({ preventScroll: true }); return; }
      case "fcollapse": { const fi = +act.dataset.f; if (S.code.collapsed.has(fi)) S.code.collapsed.delete(fi); else S.code.collapsed.add(fi); const sec = $(`#file-${fi}`), col = S.code.collapsed.has(fi); sec.classList.toggle("collapsed", col); $(".fh", sec).innerHTML = fileHeader(fi); if (!col) fill(fi); $(`#file-${fi} .fold-btn`)?.focus(); return; }
      case "whole": { const fi = +act.dataset.f; if (S.code.whole.has(fi)) S.code.whole.delete(fi); else S.code.whole.add(fi); S.code.collapsed.delete(fi); $(`#file-${fi}`)?.classList.remove("collapsed"); $(`#file-${fi} .fh`).innerHTML = fileHeader(fi); fill(fi, true); renderTree(); $(`#file-${fi} [data-act="whole"]`)?.focus(); return; }
      case "dir": { const p = act.dataset.dir; if (S.code.dirsClosed.has(p)) S.code.dirsClosed.delete(p); else S.code.dirsClosed.add(p); renderTree(); return save(); }
      case "gofile": return goFile(+act.dataset.f);
      case "prev": return step(-1);
      case "next": return step(1);
      case "lc": return editLine(act.dataset.lk);
      case "lc-save": return saveLine(act.dataset.lk);
      case "carry-take": return takeCarried();
      case "carry-skip": return hideCarry();
      case "lc-cancel": { const lk = S.lcEdit; S.lcEdit = null; S.lcRange = null; return refreshLine(lk); }
      case "sel-comment": return SELT && openSelection(SELT);
      case "lc-del": { const lk = act.dataset.lk; setState(DR.lineComment(state, anchorOfLk(lk), "")); return commentsChanged(() => refreshLine(lk)); }
      case "goline": return goLine(act.dataset.lk);
      case "copy-block": return copy(blockRef(+act.dataset.b));
      // a recorded place is copied as it was recorded: its side, its lines and that side's revision
      case "copy-text": return copy(act.dataset.copy);
      case "copy-line": { const at = rowOfLk(act.dataset.lk); return copy(refText(at.fi, at.row[0] === 2 ? "-" : "+", at.row[0] === 2 ? at.row[1] : at.row[2])); }
      case "copybox-close": $("#copybox")?.remove(); return;
      case "pc-open": return openPc(act.dataset.anchor, act);
      case "pc-save": return savePc(act.dataset.anchor, act.closest(".pc-x")?.querySelector(".pc-input"));
      case "pc-cancel": return closePc();
      case "pc-del": { const an = act.dataset.anchor, [item, field] = cutLast(an, "/"); setState(DR.paragraphComment(state, { item, field }, "")); return commentsChanged(() => refreshPc(an)); }
    }
    return;
  }
  if (e.target.closest("a, button, input, textarea, select, label")) return;
  const card = e.target.closest(".card[data-card]");
  if (card && S.tab === "decisions") return select("decisions", "card:" + card.dataset.card);
  const note = e.target.closest(".note[data-b]");
  if (note) { const bid = +note.dataset.b, it = blockItems(blk(bid)); S.cur = it.length ? { key: (it.find(isOpen) ?? it[0]).key, bid } : null; return select("code", bid); }
  const tr = e.target.closest("#files tr.r[data-b]");
  if (tr && tr.dataset.b && !window.getSelection()?.toString()) { const bid = +tr.dataset.b, it = blockItems(blk(bid)); S.cur = it.length ? { key: (it.find(isOpen) ?? it[0]).key, bid } : null; return select("code", bid); }
});
document.addEventListener("change", (e) => {
  const t = e.target, a = t.dataset?.act;
  if (a === "pick") return pick(t.dataset.key, t.dataset.opt);
  if (a === "zone") { setState(DR.markZone(ITEMS, state, t.dataset.key, t.dataset.zone, t.checked)); return afterChange(t.dataset.key, { structural: false }); }
  if (a === "purpose") { if (t.checked) S.code.purposes.add(t.value); else S.code.purposes.delete(t.value); S.code.pinned.clear(); return rerenderCode(); }
  if (a === "viewed") return setViewed(+t.dataset.f, t.checked);
});
document.addEventListener("input", (e) => {
  const t = e.target, a = t.dataset?.act;
  if (a === "text") { pendingText = { key: t.dataset.key, value: t.value }; clearTimeout(textTimer); textTimer = setTimeout(flushText, 120); }
  if (t.classList?.contains("pc-input")) S.pcDraft[t.dataset.anchor] = t.value;
  if (a === "reason") { S.reasonText[t.dataset.key] = t.value; for (const el of $$(`[data-defer-hint="${t.dataset.key}"]`)) el.textContent = ""; }
  if (a === "q") { S.code.q = t.value; clearTimeout(qTimer); qTimer = setTimeout(rerenderCode, 140); }
  if (a === "find-q") { S.find.q = t.value; clearTimeout(qTimer); qTimer = setTimeout(runFind, 160); }
});
// leaving a text answer redraws the item once, so the code around it reflects the new state
document.addEventListener("focusout", (e) => {
  const t = e.target;
  if (t.dataset?.act === "text") {
    clearTimeout(textTimer); pendingText = null;
    const key = t.dataset.key;
    // The text is written now, so a variant clicked next runs after it and wins, and nothing writes it later; the page
    // shows it once the pointer is released, since a line that appears above the variants would move them under it.
    if (t.isConnected && (entryOf(key).text ?? "") !== t.value) setState(DR.write(ITEMS, state, key, t.value));
    afterPointer(() => afterChange(key, { structural: !document.activeElement?.closest?.(`[data-choice="${key}"]`) }));
  }
});
// A redraw waits while a pointer is down, so the control pressed is still there when it is released and its click
// counts; it runs once the click has had its turn.
let pointerDown = false, waiting = [];
const afterPointer = (fn) => { if (pointerDown) waiting.push(fn); else setTimeout(fn, 0); };
document.addEventListener("pointerdown", () => { pointerDown = true; }, true);
for (const type of ["pointerup", "pointercancel"]) document.addEventListener(type, () => setTimeout(() => { pointerDown = false; const run = waiting; waiting = []; run.forEach((fn) => fn()); }, 0), true);
let fieldSnap = null;
document.addEventListener("focusin", (e) => {
  const note = S.tab === "code" ? e.target.closest?.("#files .note[data-b]") : null;
  if (note) {
    const bid = +note.dataset.b, items = blockItems(blk(bid)), itemEl = e.target.closest("[data-item]");
    const key = itemEl?.dataset.item ?? (S.cur?.bid === bid ? S.cur.key : (items.find(isOpen) ?? items[0])?.key);
    if (key && (S.cur?.bid !== bid || S.cur?.key !== key)) { S.cur = { key, bid }; if (S.sel.code !== bid) select("code", bid); else updatePos(); }
  }
  if (e.target.matches?.('textarea[data-act="text"], textarea[data-act="reason"]') && fieldSnap?.key !== e.target.dataset.key) fieldSnap = { key: e.target.dataset.key, snap: snapshot(e.target.dataset.key) };
  const card = e.target.closest?.("#dec-list .card[data-card]");
  if (card && S.sel.decisions !== "card:" + card.dataset.card) select("decisions", "card:" + card.dataset.card);
  const lnb = e.target.closest?.(".lnb");
  if (lnb) { const body = lnb.closest(".fb"); $$(".lnb[tabindex='0']", body).forEach((x) => { if (x !== lnb) x.tabIndex = -1; }); lnb.tabIndex = 0; }
});
function commitText(t) {
  const key = t.dataset.key; clearTimeout(textTimer); pendingText = null;
  setText(key, t.value);
  if (!t.value.trim()) return false;
  t.blur(); afterChange(key, { structural: true });
  return true;
}
// a saved or deleted comment shows in Decisions › Comments and its counts
function commentsChanged(redraw) {
  redraw();
  if (S.rendered.decisions) { updateSubCounts(); if (S.sub.decisions === "comments") renderDecList(); }
}
// A comment saved from a selection keeps the lines, characters and words selected; one edited keeps those it had.
function saveLine(lk) {
  const old = LC.get(lk), span = S.lcRange ?? (old ? { line: old.line, end: old.end, from: old.from, to: old.to, quote: old.quote } : {});
  setState(DR.lineComment(state, { ...anchorOfLk(lk), ...span }, $("#lc-input")?.value ?? ""));
  S.lcEdit = null; S.lcRange = null;
  commentsChanged(() => refreshLine(lk));
  $(`#files tr.r[data-lk="${CSS.escape(lk)}"] .lnb`)?.focus({ preventScroll: true });
}
// One paragraph editor at a time: opening another closes this one and keeps what was typed in it as that paragraph's
// unsaved draft, shown there until it is saved or cancelled.
function openPc(anchor, from, span = null) {
  const prev = S.pcEdit;
  S.pcEdit = anchor; S.pcRange = span ? { anchor, ...span } : null;
  if (prev && prev !== anchor) refreshPc(prev);
  refreshPc(anchor);
  (from?.closest(".pc")?.querySelector(".pc-input") ?? $(".pc-input"))?.focus();
}
function closePc() { const an = S.pcEdit; S.pcEdit = null; S.pcRange = null; delete S.pcDraft[an]; refreshPc(an); }
// Saves the text of the editor the save came from, never another one on the page.
function savePc(anchor, input) {
  const [item, field] = cutLast(anchor, "/"), old = PC.get(anchor), span = (S.pcRange?.anchor === anchor ? S.pcRange : null) ?? old ?? {};
  setState(DR.paragraphComment(state, { item, field, from: span.from, to: span.to, quote: span.quote }, input?.value ?? S.pcDraft[anchor] ?? ""));
  S.pcEdit = null; S.pcRange = null; delete S.pcDraft[anchor];
  commentsChanged(() => refreshPc(anchor));
  $(`[data-anchor="${CSS.escape(anchor)}"] .pc-btn`)?.focus({ preventScroll: true });
}
function editLine(lk, span = null) {
  const prev = S.lcEdit; S.lcEdit = lk; S.lcRange = span;
  if (prev && prev !== lk) refreshLine(prev, false);
  refreshLine(lk, false);
  $("#lc-input")?.focus();
}
function refreshLine(lk, chrome = true) {
  if (!lk) return;
  fill(+lk.split(":")[0], true);
  if (chrome) { updateChrome(); if (S.code.ctx) renderPanel("code"); }
}
// ---------------------------------------------------------------- comments on a selection
// A selection inside one paragraph of the report, or inside the rows of one hunk on one side of a file, can be commented:
// the comment keeps the lines, the characters and the words selected. A selection across two of them is refused with a
// word, never placed by guess. The words are drawn marked where they still read as selected.
let SELT = null;
const textWithout = (root, skip) => { const c = root.cloneNode(true); c.querySelectorAll(skip).forEach((n) => n.remove()); return c.textContent; };
const lineText = (cell) => textWithout(cell, ".sg");
// How many characters of a container come before a point in it, its skipped parts left out.
function offsetIn(root, node, offset, skip) {
  const r = document.createRange(); r.setStart(root, 0); r.setEnd(node, offset);
  const frag = r.cloneContents(); frag.querySelectorAll(skip).forEach((n) => n.remove());
  return frag.textContent.length;
}
// The range of characters from..to of a container, its skipped parts left out.
function rangeIn(root, from, to, skip) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => { const s = n.parentElement.closest(skip); return s && root.contains(s) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
  let pos = 0, start = null, end = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const len = n.data.length;
    if (!start && from <= pos + len) start = [n, from - pos];
    if (start && to <= pos + len) { end = [n, to - pos]; break; }
    pos += len;
  }
  if (!start || !end) return null;
  const r = document.createRange(); r.setStart(...start); r.setEnd(...end); return r;
}
function selectionTarget() {
  const sel = getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount || !sel.toString().trim()) return null;
  const range = sel.getRangeAt(0), el = (n) => n.nodeType === 1 ? n : n.parentElement;
  const a = el(range.startContainer), z = el(range.endContainer);
  if (a.closest("textarea, input, .pc-x, .lc, #sel-adder") || z.closest("textarea, input, .pc-x, .lc, #sel-adder")) return null;
  // a paragraph: the field's own words, never the page's labels or source chips around them
  const pa = a.closest(".pc"), pz = z.closest(".pc");
  if (pa || pz) {
    const fa = a.closest(".pf"), fz = z.closest(".pf");
    if (pa !== pz || !fa || fa !== fz || fa.closest(".pc") !== pa) return { refused: true, range };
    const from = offsetIn(fa, range.startContainer, range.startOffset, ".pc-x"), to = offsetIn(fa, range.endContainer, range.endOffset, ".pc-x");
    return { kind: "para", anchor: pa.dataset.anchor, el: pa, span: { from, to, quote: textWithout(fa, ".pc-x").slice(from, to) }, range };
  }
  const ra = a.closest("#files tr.r"), rz = z.closest("#files tr.r");
  if (!ra && !rz) return null;
  if (!ra || !rz || ra.closest(".file") !== rz.closest(".file")) return { refused: true, range };
  const rows = [];
  for (let r = ra; r; r = r.nextElementSibling) { if (r.matches("tr.r")) rows.push(r); else if (r.matches("tr.gap, tr.fold")) return { refused: true, range }; if (r === rz) break; }
  if (rows.at(-1) !== rz) return { refused: true, range };
  let from = a.closest("td.cd") === $("td.cd", ra) ? offsetIn($("td.cd", ra), range.startContainer, range.startOffset, ".sg") : 0;
  let to = z.closest("td.cd") === $("td.cd", rz) ? offsetIn($("td.cd", rz), range.endContainer, range.endOffset, ".sg") : lineText($("td.cd", rz)).length;
  // a selection that ends at the very start of a line, or starts at the very end of one, does not take that line
  if (rows.length > 1 && to === 0) { rows.pop(); to = lineText($("td.cd", rows.at(-1))).length; }
  if (rows.length > 1 && from >= lineText($("td.cd", rows[0])).length) { rows.shift(); from = 0; }
  const removed = rows.filter((r) => r.classList.contains("d")).length;
  if (removed && removed < rows.length) return { refused: true, range };
  const first = anchorOfLk(rows[0].dataset.lk), last = anchorOfLk(rows.at(-1).dataset.lk), texts = rows.map((r) => lineText($("td.cd", r)));
  const quote = texts.map((t, i) => t.slice(i === 0 ? from : 0, i === texts.length - 1 ? to : t.length)).join("\n");
  return { kind: "line", lk: rows.at(-1).dataset.lk, span: { line: first.line, end: last.line > first.line ? last.line : undefined, from, to, quote }, range };
}
function hideAdder() { const ad = $("#sel-adder"); if (ad) ad.hidden = true; SELT = null; }
function showAdder() {
  const t = selectionTarget(), ad = $("#sel-adder");
  if (!t || !ad) return hideAdder();
  SELT = t.refused ? null : t;
  ad.disabled = Boolean(t.refused); ad.classList.toggle("refused", Boolean(t.refused));
  ad.innerHTML = t.refused ? esc(L("p.sel.refused")) : `${ICON.comment}<span>${esc(L("p.sel.comment"))}</span>${kbd("c")}`;
  ad.hidden = false;
  // below the selection's last line, never over the words selected; above it when there is no room below
  const rects = t.range.getClientRects(), r = rects[rects.length - 1] ?? t.range.getBoundingClientRect(), top = (rects[0] ?? r).top;
  const x = Math.min(innerWidth - ad.offsetWidth - 8, Math.max(8, r.right - ad.offsetWidth)), below = r.bottom + 6;
  ad.style.left = x + "px"; ad.style.top = (below + ad.offsetHeight > innerHeight - 8 ? Math.max(8, top - ad.offsetHeight - 6) : below) + "px";
}
function openSelection(t) {
  hideAdder(); getSelection()?.removeAllRanges();
  if (t.kind === "line") return editLine(t.lk, t.span);
  openPc(t.anchor, t.el, t.span);
}
// The selected words of each comment, marked where the page draws them and they still read the same.
const CAN_MARK = typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight === "function";
let markQueued = false;
function queueMark() { if (!CAN_MARK || markQueued) return; markQueued = true; requestAnimationFrame(() => { markQueued = false; markComments(); }); }
function markComments() {
  const ranges = [];
  for (const c of state.lines) {
    if (c.from === undefined && c.to === undefined) continue;
    const fi = fileByPath.get(c.path), sign = c.side === "base" ? "-" : "+", cells = [];
    if (fi === undefined) continue;
    for (let n = c.line; n <= (c.end ?? c.line); n++) { const tr = $(`#file-${fi} tr.r[data-lk="${fi}:${sign}${n}"]`); if (!tr) { cells.length = 0; break; } cells.push($("td.cd", tr)); }
    if (!cells.length) continue;
    const texts = cells.map(lineText), at = (i) => [i === 0 ? c.from ?? 0 : 0, i === texts.length - 1 ? c.to ?? texts[i].length : texts[i].length];
    if (c.quote !== undefined && texts.map((t, i) => t.slice(...at(i))).join("\n") !== c.quote) continue;
    cells.forEach((cell, i) => { const r = rangeIn(cell, ...at(i), ".sg"); if (r) ranges.push(r); });
  }
  for (const c of state.paragraphs) {
    if (c.from === undefined || c.to === undefined) continue;
    for (const pc of $$(`.pc[data-anchor="${CSS.escape(`${c.item}/${c.field}`)}"]`)) {
      const field = $(".pf", pc);
      if (!field || (c.quote !== undefined && textWithout(field, ".pc-x").slice(c.from, c.to) !== c.quote)) continue;
      const r = rangeIn(field, c.from, c.to, ".pc-x"); if (r) ranges.push(r);
    }
  }
  CSS.highlights.set("review-comment", new Highlight(...ranges));
}
document.addEventListener("mouseup", (e) => { if (!e.target.closest?.("#sel-adder")) setTimeout(showAdder, 0); });
// pressing the adder keeps the selection it is for
document.addEventListener("mousedown", (e) => { if (e.target.closest?.("#sel-adder")) e.preventDefault(); });
document.addEventListener("keyup", (e) => { if (e.shiftKey || e.key === "Shift") showAdder(); });
document.addEventListener("selectionchange", () => { if (getSelection()?.isCollapsed) hideAdder(); });
window.addEventListener("scroll", () => { if (!$("#sel-adder")?.hidden) hideAdder(); }, { passive: true });
new MutationObserver(queueMark).observe(app, { childList: true, subtree: true });

let gAt = 0;
function keyTarget() {
  if (S.tab === "code" && S.cur) return $(`#note-${S.cur.bid}`);
  if (S.tab === "decisions" && S.sel.decisions) return $(`#card-${S.sel.decisions.slice(5)}`);
  return null;
}
function inView(el) {
  if (!el || !el.isConnected) return false;
  const r = el.getBoundingClientRect(), top = S.tab === "code" ? toolbarBottom() : 48;
  return r.bottom > top + 8 && r.top < innerHeight - 8;
}
function bringIntoView(c) {
  if (S.tab === "code" && S.cur) goBlock(S.cur.bid, { key: S.cur.key, focus: true });
  else { const card = $(`#card-${c.key}`); card?.scrollIntoView({ block: "start" }); card?.focus({ preventScroll: true }); }
  toast(L("p.toast.out-of-view", c.label));
}
// in-page find: searches the diff's text, drawn or not; a match is drawn and landed on
let FIND_INDEX = null;
const decodeHtml = (h) => h.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
function findIndex() {
  if (!FIND_INDEX) { FIND_INDEX = []; F.forEach((f, fi) => f.hunks.forEach((h, hi) => h.rows.forEach((r, ri) => FIND_INDEX.push({ fi, hi, ri, lk: lkOf(fi, r), text: decodeHtml(r[4] ?? "").toLowerCase() })))); }
  return FIND_INDEX;
}
const FIND_LIMIT = 5000;
function runFind() {
  const q = S.find.q.trim().toLowerCase();
  S.find.matches = q.length < 2 ? [] : findIndex().filter((x) => x.text.includes(q)).sort((a, b) => a.fi - b.fi || a.hi - b.hi || a.ri - b.ri).slice(0, FIND_LIMIT);
  S.find.i = -1; findCount();
}
function findCount() {
  const el = $("#find-count"); if (!el) return;
  const m = S.find.matches, q = S.find.q.trim();
  el.textContent = q.length < 2 ? L("p.find.type") : !m.length ? L("p.find.none") : S.find.i < 0 ? P(m.length === FIND_LIMIT ? "p.find.first" : "p.find.matches", m.length) : L("p.find.at", n(S.find.i + 1), n(m.length));
}
function openFind() {
  S.find.open = true;
  if (S.tab !== "code") showTab("code", { push: false });
  $("#findbar").hidden = false; syncTbar();
  const input = $("#find-q"); input.focus(); input.select(); findCount();
}
function closeFind() {
  S.find.open = false; $("#findbar").hidden = true; syncTbar();
  $$("#files tr.findhit").forEach((x) => x.classList.remove("findhit"));
}
function findStep(dir) {
  const m = S.find.matches;
  if (!m.length) return findCount();
  S.find.i = (S.find.i + dir + m.length) % m.length;
  findCount();
  goLine(m[S.find.i].lk, { hl: "findhit" }).then(() => $("#find-q")?.focus({ preventScroll: true }));
}
// the sticky offsets follow the toolbar's real height (the find bar adds a row)
function syncTbar() { TB = null; const t = $(".toolbar"); if (t) document.documentElement.style.setProperty("--tbar", t.offsetHeight + "px"); syncOverlay(); }
// In a narrow window the tree and the panel float over the code: they start where the toolbar ends, wherever the page is scrolled.
function syncOverlay() { const t = $(".toolbar"); if (t) document.documentElement.style.setProperty("--ov-top", Math.max(0, Math.round(t.getBoundingClientRect().bottom)) + "px"); }
// where focus goes back to from a field: the selected note in Code, the item's card in Decisions
function focusHome(key) {
  const home = S.tab === "code" ? S.sel.code && $(`#note-${S.sel.code}`) : $(`#card-${key}`);
  home?.focus({ preventScroll: true });
}
// the item the decision keys act on: the focused or selected note's decision in Code, the selected card in Decisions
function currentItem() {
  if (S.tab === "code" && S.cur && itemByKey.has(S.cur.key)) return itemByKey.get(S.cur.key);
  if (S.tab === "decisions" && S.sel.decisions) return itemByKey.get(S.sel.decisions.slice(5));
  return null;
}
document.addEventListener("keydown", (e) => {
  // A dialog takes the keyboard: no report key acts behind it.
  if (document.querySelector("dialog[open]")) return;
  const t = e.target, typing = typingTarget(t);
  if ((e.key === "f" || e.key === "F") && (e.ctrlKey || e.metaKey) && S.tab === "code") { e.preventDefault(); return openFind(); }
  if (t.id === "find-q" && e.key === "Enter") { e.preventDefault(); return findStep(e.shiftKey ? -1 : 1); }
  if (t.id === "find-q" && e.key === "Escape") { e.preventDefault(); return closeFind(); }
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && typing) {
    if (t.dataset.act === "text") { e.preventDefault(); const snap = fieldSnap?.key === t.dataset.key ? fieldSnap.snap : null; const c = itemByKey.get(t.dataset.key); if (commitText(t)) { fieldSnap = null; if (snap) announce(c, snap); step(1, false, { quiet: true }); } return; }
    if (t.dataset.act === "reason") { e.preventDefault(); const snap = fieldSnap?.key === t.dataset.key ? fieldSnap.snap : snapshot(t.dataset.key); const c = itemByKey.get(t.dataset.key); if (confirmDefer(t.dataset.key)) { fieldSnap = null; announce(c, snap); step(1, false, { quiet: true }); } return; }
    if (t.id === "lc-input") { e.preventDefault(); return saveLine(S.lcEdit); }
    if (t.classList.contains("pc-input")) { e.preventDefault(); return savePc(t.dataset.anchor, t); }
  }
  if (e.key === "Escape") {
    { const b = closeMenus(); if (b) { b.focus(); return; } }
    if ($("#copybox")) { $("#copybox").remove(); return; }
    if (!$("#sel-adder").hidden) { hideAdder(); return; }
    if (S.lcEdit) { const lk = S.lcEdit; S.lcEdit = null; S.lcRange = null; refreshLine(lk); $(`#files tr.r[data-lk="${CSS.escape(lk)}"] .lnb`)?.focus(); return; }
    if (S.pcEdit) return closePc();
    // Esc leaves a field: what was written there stays, an untouched field changes nothing, and focus returns to the
    // note or card, so the next key moves on instead of typing.
    if (typing && t.dataset?.key) {
      const key = t.dataset.key;
      t.blur();
      if (S.field[key]) { S.field[key] = null; delete S.reasonText[key]; }
      afterChange(key, { structural: true });
      return focusHome(key);
    }
    if (typing) { t.blur(); return S.tab === "code" && S.sel.code ? $(`#note-${S.sel.code}`)?.focus() : null; }
    if (S.tab === "code" && S.code.ctx) { S.code.ctx = false; $("#ctx-code").hidden = true; $("#code-frame").classList.remove("ctx"); syncToolbar(); measureCpl(); return; }
    if (S.sel[S.tab] && S.tab !== "details") { if (S.tab === "code") S.cur = null; return select(S.tab, null); }
    return;
  }
  if (t.closest?.('[role="tablist"]') && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
    const tabs = $$('[role="tab"]', t.closest('[role="tablist"]')), i = tabs.indexOf(t.closest('[role="tab"]'));
    if (i >= 0) { const nx = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length]; nx.focus(); nx.click(); e.preventDefault(); }
    return;
  }
  if (t.classList?.contains("lnb") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    const all = $$(".lnb", t.closest(".fb")), i = all.indexOf(t), nx = all[i + (e.key === "ArrowDown" ? 1 : -1)];
    if (nx) { e.preventDefault(); nx.focus(); nx.closest("tr").scrollIntoView({ block: "nearest" }); }
    return;
  }
  if ((e.key === "Enter" || e.key === " ") && t.matches?.('[data-act="sel"]')) { e.preventDefault(); return select(S.tab, t.dataset.sel); }
  if ((e.key === "Enter" || e.key === " ") && t.matches?.(".done-line")) { e.preventDefault(); return t.click(); }
  if (e.key === "Enter" && t.matches?.("#dec-list .card[data-card]")) { e.preventDefault(); return openAnswer(t); }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) { gAt = 0; return; }
  const k = e.key;
  // g then s, d, c or t: Summary, Decisions, Code, Details
  if (gAt && performance.now() - gAt < 1500 && "sdct".includes(k)) { gAt = 0; e.preventDefault(); return showTab({ s: "summary", d: "decisions", c: "code", t: "details" }[k]); }
  gAt = 0;
  if (k === "g") { gAt = performance.now(); e.preventDefault(); return; }
  if (k === "u" && undoFn) { e.preventDefault(); return runUndo(); }
  if (k === "J" || k === "K") { e.preventDefault(); return stepFile(k === "J" ? 1 : -1); }
  if (k === "j" || k === "k") { e.preventDefault(); return step(k === "j" ? 1 : -1); }
  if (k === "]" || k === "[") { e.preventDefault(); return step(k === "]" ? 1 : -1, true); }
  if (k === "?") return $("#keys-dialog").showModal();
  if (k === "/" && S.tab === "code") { e.preventDefault(); return $("#file-q")?.focus(); }
  if (k === "i" && S.tab === "code") return $('#panel-code [data-act="ctx"]')?.click();
  if (k === "v" && S.tab === "code") { const fi = currentFile(); if (fi !== null) setViewed(fi, !S.viewed.has(fi)); return; }
  if (k === "y" && S.tab === "code") { if (t.classList?.contains("lnb")) { const at = rowOfLk(t.dataset.lk); return copy(refText(at.fi, at.row[0] === 2 ? "-" : "+", at.row[0] === 2 ? at.row[1] : at.row[2])); } if (S.sel.code) return copy(blockRef(S.sel.code)); return; }
  if (k === "c" && SELT) { e.preventDefault(); return openSelection(SELT); }
  if (k === "c" && S.tab === "code") { e.preventDefault(); if (t.classList?.contains("lnb")) return editLine(t.dataset.lk); if (S.sel.code) { const tr = $(`#files tr.r[data-b="${S.sel.code}"]`); if (tr) editLine(tr.dataset.lk); } return; }
  const c = currentItem();
  if (!c || !applicable(c)) return;
  const opts = optionsOf(c);
  const pickKey = /^[1-9]$/.test(k) && opts[+k - 1] ? opts[+k - 1].id : (k === "f" || k === "n") && opts.length && opts[0].key ? opts[k === "f" ? 0 : 1].id : null;
  if (!pickKey && !"odx".includes(k)) return;
  e.preventDefault();
  // a key answers only the item whose note or card is in view; otherwise it brings it into view and does nothing else
  if (!inView(keyTarget())) return bringIntoView(c);
  if (pickKey) { const snap = snapshot(c.key); pick(c.key, pickKey); return announce(c, snap); }
  if ((k === "o" || k === "d") && S.tab === "code" && S.cur) moveAnswerTo(c.key, S.cur.bid);
  if (k === "o") return openField(c.key, "other");
  if (k === "d") return openField(c.key, "defer");
  if (k === "x") { const snap = snapshot(c.key); clearAnswer(c.key); return announce(c, snap); }
});
// Each scrolled frame releases the files that moved far away, so what is drawn is always what lies within 6,000 px of
// the view, however fast or far the owner scrolls; a release only every so often let a quick scroll keep every file
// it passed until the next one.
let spyQueued = false;
window.addEventListener("scroll", () => {
  if (spyQueued || S.tab !== "code") return;
  spyQueued = true;
  requestAnimationFrame(() => { spyQueued = false; spy(); releaseFar(); syncOverlay(); });
}, { passive: true });
window.addEventListener("resize", () => { if (S.rendered.code) { measureCpl(); syncTbar(); } });
window.addEventListener("hashchange", () => route(location.hash));

// ---------------------------------------------------------------- the picture viewer: every picture given as a file, fitted or at its own size
// As common picture viewers do, it closes on a click outside the picture, opens fitted to the window and zooms on a
// click on the picture; its frame closes around the picture instead of keeping a fixed field.
const PICTURES = D.screens.flatMap((s, si) => s.pictures.filter((p) => p.embedded).map((p) => ({ si, id: `${si}-${p.kind}`, src: PICS.get(`${si}-${p.kind}`), name: `${s.name} · ${L(p.kind)}`, historical: s.provenance.startsWith("historical") })));
let zoomAt = 0, zoomFit = true;
function openZoom(id) {
  let d = $("#zoom-dialog");
  if (!d) {
    d = document.createElement("dialog"); d.id = "zoom-dialog"; d.setAttribute("aria-labelledby", "zoom-name");
    d.innerHTML = `<div class="zoom-bar"><button class="btn sm" data-act="zoom-fit">${esc(L("p.zoom.fit"))}</button><button class="btn sm" data-act="zoom-full">${esc(L("p.zoom.actual"))}</button><button class="btn sm icon" data-act="zoom-prev" aria-label="${esc(L("p.zoom.prev"))}">←</button><span id="zoom-count" class="muted small"></span><button class="btn sm icon" data-act="zoom-next" aria-label="${esc(L("p.zoom.next"))}">→</button><span id="zoom-name" class="small"></span><span id="zoom-historical" class="tag dashed" hidden>${esc(L("p.zoom.historical"))}</span><form method="dialog">${closeX("autofocus", L("p.close"))}</form></div><div class="zoom-stage"><img alt="" data-act="zoom-toggle"></div><div class="zoom-caption" id="zoom-caption" hidden></div>`;
    d.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); showZoom(zoomAt + (e.key === "ArrowRight" ? 1 : -1)); } });
    // The backdrop is the dialog itself, outside its box; the stage is the field around a picture narrower than the bar.
    d.addEventListener("click", (e) => {
      const r = d.getBoundingClientRect(), outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      // a link in the caption leaves the viewer for its place
      if (e.target === d && outside || e.target.classList.contains("zoom-stage") || e.target.closest("[data-go]")) d.close();
    });
    $("img", d).addEventListener("load", sizeZoom); $("img", d).addEventListener("error", sizeZoom);
    window.addEventListener("resize", () => { if (d.open) sizeZoom(); });
    document.body.append(d);
  }
  zoomFit = true; showZoom(PICTURES.findIndex((p) => p.id === id));
  if (!d.open) d.showModal();
}
function showZoom(i) {
  zoomAt = (i + PICTURES.length) % PICTURES.length;
  const p = PICTURES[zoomAt], d = $("#zoom-dialog"), img = $("img", d);
  img.src = p.src; img.alt = p.name; img.classList.toggle("fit", zoomFit);
  $("#zoom-name").textContent = p.name; $("#zoom-count").textContent = L("p.zoom.of", n(zoomAt + 1), n(PICTURES.length));
  $("#zoom-historical").hidden = !p.historical;
  const cap = $("#zoom-caption"); cap.innerHTML = screenFacts(p.si).map(([k, v]) => `<span class="cap-item"><span class="muted">${esc(k)}:</span> ${v}</span>`).join(""); cap.hidden = false;
  $('[data-act="zoom-fit"]', d).setAttribute("aria-pressed", String(zoomFit)); $('[data-act="zoom-full"]', d).setAttribute("aria-pressed", String(!zoomFit));
  if (img.complete) sizeZoom();
}
// Fit is the largest size the window holds, up to twice the picture's own so a screenshot is not smeared; actual size is
// the picture's own pixels, scrolled within the window. The cursor says which of the two a click on the picture gives.
function sizeZoom() {
  const d = $("#zoom-dialog"), img = $("img", d), stage = $(".zoom-stage", d), nw = img.naturalWidth, nh = img.naturalHeight;
  if (!nw || !nh) { img.style.width = img.style.height = ""; img.style.cursor = "default"; return; }
  const W = Math.floor(innerWidth * 0.96) - 2, H = Math.floor(innerHeight * 0.94) - 2 - $(".zoom-bar", d).offsetHeight - $("#zoom-caption").offsetHeight;
  const fit = Math.min(W / nw, H / nh, 2), now = zoomFit ? fit : 1, next = zoomFit ? 1 : fit;
  img.style.width = `${Math.round(nw * now)}px`; img.style.height = `${Math.round(nh * now)}px`;
  stage.style.maxWidth = `${W}px`; stage.style.maxHeight = `${H}px`;
  img.style.cursor = next > now ? "zoom-in" : next < now ? "zoom-out" : "default";
}

// ---------------------------------------------------------------- print: a copy of the decisions with the owner's answers
// A paper or PDF copy to pass on or keep: the summary and every decision card whole — its variants, their consequences
// and the recommendation, nothing that only works on screen — with the owner's answer added to each, and the comments.
// It is the document in the page's <noscript> elements, so nothing has to be drawn on screen first; the browser's own
// Print and the export dialog's both print it. The saved diff and the record are the full trail of the rest.
function buildPrint() {
  let el = $("#print");
  if (!el) { el = document.createElement("div"); el.id = "print"; document.body.append(el); }
  const p = progress();
  el.innerHTML = $("#static-report").textContent;
  $$(".static-note, .static nav", el).forEach((x) => x.remove());
  $("#code", el)?.remove();
  $(".static header", el).insertAdjacentHTML("beforeend", `<p>${esc(progressWords(p).filter(Boolean).join(" · "))}</p>`);
  for (const c of ITEMS) el.querySelector(`[id="decisions/${CSS.escape(c.key)}"]`)?.insertAdjacentHTML("beforeend", `<p class="sanswer"><b>${esc(L("p.print.answer"))}</b> ${esc(printAnswer(c))}</p>`);
  const notes = exportModel().sections.comments;
  if (notes.length) $("#decisions", el).insertAdjacentHTML("beforeend", `<h3>${esc(L("p.sub.comments"))}</h3><ul>${notes.map((r) => `<li>${esc(r.text)}</li>`).join("")}</ul>`);
}
// The owner's answer to an item in words: its state and answer, a draft, the parent it waits for and marked zones.
function printAnswer(c) {
  const st = statusOf(c), zones = Object.keys(entryOf(c.key).zones ?? {}).map((i) => c.ref.zones[i].text);
  return [st.label, st.answer && `${st.lbl}: ${st.answer}`, st.draft && L("p.draft", st.draft.choice !== undefined ? L("p.draft.option", draftText(c, st.draft)) : L("p.draft.own", st.draft.text)),
    waitingText(c), zones.length && L("p.export.zones", zones.join("; "))].filter(Boolean).join(" · ");
}
window.addEventListener("beforeprint", buildPrint);
window.addEventListener("afterprint", () => { $("#print")?.remove(); });

// ---------------------------------------------------------------- start
load();
indexComments();
renderShell();
updateChrome();
route(location.hash);
performance.mark("app-ready");
})
