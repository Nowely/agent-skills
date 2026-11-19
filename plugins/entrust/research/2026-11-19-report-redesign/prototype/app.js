(() => {
"use strict";
performance.mark("app-start");
const D = JSON.parse(document.getElementById("data").textContent);
const W = (k) => D.words[k] ?? k;
const app = document.getElementById("app");

// ---------------------------------------------------------------- helpers
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const prose = (v) => esc(v).replace(/`([^`]+)`/g, "<code>$1</code>");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const n = (x) => Number(x).toLocaleString("en-US");
const plural = (k, one, many = one + "s") => `${n(k)} ${k === 1 ? one : many}`;
function textBlock(v, cls = "") {
  let out = "", list = [];
  const flush = () => { if (list.length) { out += `<ul class="bullets">${list.map((l) => `<li>${prose(l)}</li>`).join("")}</ul>`; list = []; } };
  for (const line of String(v ?? "").split("\n")) {
    if (/^\s*-\s+/.test(line)) list.push(line.replace(/^\s*-\s+/, ""));
    else { flush(); if (line.trim()) out += `<p class="${cls}">${prose(line)}</p>`; }
  }
  flush();
  return out;
}
const splitPath = (p) => { const i = p.lastIndexOf("/"); return [p.slice(0, i + 1), p.slice(i + 1)]; };
const slashBreaks = (s) => esc(s).replace(/\//g, "/<wbr>");
const pathHtml = (p) => { const [d, b] = splitPath(p); return `<span class="dir">${slashBreaks(d)}</span><b>${esc(b)}</b>`; };

// ---------------------------------------------------------------- indices
const B = D.blocks, F = D.files;
const blk = (id) => B[id - 1];
const reqById = new Map(D.requirements.map((r) => [r.id, r]));
const fileBlocks = F.map(() => []);
for (const b of B) fileBlocks[b.file].push(b);
const CARDS = [], cardByKey = new Map();
const addCard = (c) => { c.blocks = []; CARDS.push(c); cardByKey.set(c.key, c); };
for (const q of D.questions) addCard({ key: "q" + q.id, label: "Q" + q.id, type: "q", kind: q.kind, ref: q });
for (const f of D.findings) addCard({ key: "f" + f.id, label: "F" + f.id, type: "f", kind: "finding", ref: f });
for (const i of D.ideas) addCard({ key: "i" + i.id, label: "I" + i.id, type: "i", kind: "idea", ref: i });
for (const b of B) {
  for (const f of b.findings) cardByKey.get("f" + f)?.blocks.push(b.id);
  for (const q of b.questions) cardByKey.get("q" + q)?.blocks.push(b.id);
}
const blockCards = (b) => [...b.findings.map((f) => "f" + f), ...b.questions.map((q) => "q" + q)].filter((k) => cardByKey.has(k));
// where each block starts, for ordering and for j/k
const firstPos = {};
F.forEach((f, fi) => f.hunks.forEach((h, hi) => h.rows.forEach((r, ri) => { if (r[3] && !firstPos[r[3]]) firstPos[r[3]] = [fi, hi, ri]; })));
const ORDER = B.filter((b) => firstPos[b.id]).sort((a, b) => { const x = firstPos[a.id], y = firstPos[b.id]; return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
const ATTN = ORDER.filter((b) => b.verdict !== "keep");
// a place inside the diff: which row, and which block owns it
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
for (const c of CARDS) { const at = rowAt(c.ref.place); c.placeRow = at; c.placeBlock = at?.row[3] || null; }

// ---------------------------------------------------------------- state (memory only)
const S = {
  dec: {}, lc: {}, lcEdit: null, tab: "summary",
  sel: { summary: null, decisions: null, code: null, details: null },
  sub: { decisions: "all", details: "structure" }, structView: "table", more: {},
  code: { mode: "attention", purposes: new Set(D.purposes), req: "", unit: "", q: "", expanded: new Set(), collapsed: new Set(), pinned: new Set(), tree: window.innerWidth > 1150, dirsClosed: new Set() },
  scroll: {}, theme: "auto", rendered: {},
};
const OPEN = { open: true, label: "Open", cls: "open" };
function decOf(key) { return S.dec[key] ?? (S.dec[key] = { choice: null, text: "", deferred: false, zones: {} }); }
function statusOf(key) {
  const c = cardByKey.get(key), d = S.dec[key];
  if (c.ref.parent) {
    const p = S.dec["q" + c.ref.parent.question];
    if (p && !p.deferred && p.choice?.startsWith("v:") && !c.ref.parent.variants.includes(p.choice.slice(2))) return { open: false, na: true, label: "Not applicable", cls: "dashed" };
  }
  if (!d) return OPEN;
  if (d.deferred) return { open: false, deferred: true, label: "Deferred", cls: "dashed", answer: d.text.trim() };
  const text = d.text.trim();
  if (c.kind === "fact" || c.kind === "evidence" || (c.kind === "decision" && !c.ref.variants.length)) return text ? { open: false, label: "Answer entered", cls: "neutral", answer: text } : OPEN;
  if (d.choice === "other") return text ? { open: false, label: "Own answer", cls: "neutral", answer: text } : { ...OPEN, label: "Open · draft" };
  const named = { fix: "Fix", nofix: "Do not fix", take: "Take", skip: "Do not take" }[d.choice];
  if (named) return { open: false, label: named, cls: "neutral", answer: named };
  if (d.choice?.startsWith("v:")) { const v = c.ref.variants.find((x) => x.id === d.choice.slice(2)); return { open: false, label: "Selected", cls: "neutral", answer: v?.text ?? d.choice.slice(2) }; }
  return OPEN;
}
const isOpen = (key) => statusOf(key).open;
const blockOpen = (b) => b.verdict !== "keep" && blockCards(b).some(isOpen);
const tagHtml = (st) => `<span class="tag ${st.cls}">${esc(st.label)}</span>`;
const VERDICT_CLS = { keep: "neutral", fix: "warn", remove: "bad", question: "q", split: "warn", merge: "warn" };
const verdictTag = (v) => `<span class="tag ${VERDICT_CLS[v] ?? "neutral"}">${esc(W("verdict." + v))}</span>`;
const chip = (kind, id) => {
  const label = { f: "F", q: "Q", i: "I", b: "B", r: "R", m: "M" }[kind] + id;
  const href = kind === "b" ? `#code/b${id}` : kind === "r" ? `#summary/r${id}` : kind === "m" ? "#details/mechanisms" : `#decisions/${kind}${id}`;
  return `<a class="chip" href="${href}" data-go="${kind === "m" ? "mech" : kind}:${esc(id)}" title="${esc(chipTitle(kind, id))}">${esc(label)}</a>`;
};
function chipTitle(kind, id) {
  if (kind === "b") { const b = blk(+id); return b ? `${b.path} ${b.where}` : ""; }
  if (kind === "r") return reqById.get(String(id))?.text ?? "";
  if (kind === "m") return D.mechanisms[+id - 1]?.name ?? "";
  const c = cardByKey.get(kind + id); return c ? (c.ref.title ?? c.ref.text ?? "") : "";
}
const chips = (kind, ids, max = 99, moreAct = "") => {
  const list = ids.slice(0, max).map((id) => chip(kind, id)).join("");
  const rest = ids.length - max;
  return `<span class="chips">${list}${rest > 0 ? `<button class="more-chip" ${moreAct}>+${rest} more</button>` : ""}</span>`;
};
const srcList = (sources) => !sources?.length ? "" : `<span class="srcs">Sources: ${sources.map((s) => s.ref ? chip(s.ref, s.id) : esc(s.text)).join(", ")}</span>`;
function typeText(c) {
  const r = c.ref;
  if (c.kind === "finding") return `Finding · ${W("direction." + r.direction)} · ${W("evidence." + r.evidence)}`;
  if (c.kind === "idea") return "Idea · optional";
  if (c.kind === "decision") return `Decision${r.resolver ? " · " + r.resolver : ""}`;
  if (c.kind === "fact") return `Fact to settle${r.resolver ? " · " + r.resolver : ""}`;
  return `Evidence to obtain${r.resolver ? " · " + r.resolver : ""}`;
}
const cardTitle = (c) => c.ref.title ?? c.ref.text;
const counts = () => { const open = CARDS.filter((c) => isOpen(c.key)).length; return { open, done: CARDS.length - open, total: CARDS.length }; };

// ---------------------------------------------------------------- shell
const TABS = [{ id: "summary", label: "Summary" }, { id: "decisions", label: "Decisions" }, { id: "code", label: "Code" }, { id: "details", label: "Details" }];
function renderShell() {
  const c = D.counters;
  app.innerHTML = `
  <header class="masthead"><div class="kicker"><span>Code review</span><span class="sep">/</span><span>${plural(c.files, "file")}</span><span class="sep">·</span><span>+${n(c.lines.added)} −${n(c.lines.removed)} lines</span><span class="sep">·</span><span>${plural(c.blocks, "block")}</span></div>
  <h1>${esc(D.title)}</h1></header>
  <nav class="tabbar" aria-label="Report sections"><div class="tabbar-in">
    <div class="tabs" role="tablist" aria-label="Report sections">${TABS.map((t) => `<button class="tab" role="tab" id="tab-${t.id}" aria-controls="panel-${t.id}" aria-selected="false" tabindex="-1" data-tab="${t.id}">${t.label}<span class="count" id="badge-${t.id}" hidden></span></button>`).join("")}</div>
    <div class="tb-right"><span class="progress" id="progress"></span>
      <button class="btn quiet sm" data-act="keys" aria-haspopup="dialog">Shortcuts <span class="kbd">?</span></button>
      <button class="btn sm" data-act="theme" id="theme-btn">Theme: Auto</button></div>
  </div></nav>
  <main>${TABS.map((t) => `<section class="tabpanel" id="panel-${t.id}" role="tabpanel" aria-labelledby="tab-${t.id}" hidden></section>`).join("")}</main>
  <dialog id="keys-dialog" aria-labelledby="keys-h"><div style="padding:18px 20px;min-width:320px"><h2 id="keys-h" style="font-size:15px;margin-bottom:12px">Keyboard</h2>
    <div class="keys"><span class="kbd">j</span><span>Next open item (Code, Decisions)</span><span class="kbd">k</span><span>Previous open item</span>
    <span class="kbd">/</span><span>Filter files (Code)</span><span class="kbd">c</span><span>Comment on the selected block's first line</span>
    <span class="kbd">1</span><span>… <span class="kbd">4</span> switch tabs</span><span class="kbd">Esc</span><span>Close an editor or clear the selection</span></div>
    <form method="dialog" style="margin-top:16px;text-align:right"><button class="btn sm">Close</button></form></div></dialog>`;
  app.removeAttribute("aria-busy");
}
function updateChrome() {
  const { open, done, total } = counts();
  const openBlocks = ATTN.filter(blockOpen).length;
  const set = (id, v) => { const el = $("#badge-" + id); el.hidden = v === null; if (v !== null) el.textContent = v; };
  set("decisions", open); set("code", openBlocks); set("summary", null); set("details", null);
  $("#badge-code").title = `${openBlocks} blocks with an open decision`;
  $("#badge-decisions").title = `${open} open decisions`;
  const lcs = Object.keys(S.lc).length, so = $("#sum-open"); if (so) so.textContent = open;
  $("#progress").innerHTML = `<span><span class="ptext">Decided </span>${done} of ${total}</span><span class="pbar" role="progressbar" aria-label="Decided" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span style="width:${total ? (100 * done / total).toFixed(1) : 0}%"></span></span>${lcs ? `<span class="ptext">· ${plural(lcs, "line comment")}</span>` : ""}`;
}

// ---------------------------------------------------------------- tabs + routing
function showTab(id, { push = true } = {}) {
  if (S.tab !== id) S.scroll[S.tab] = window.scrollY;
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
  if (push) setHash();
}
function setHash() {
  const sel = S.sel[S.tab];
  let h = S.tab;
  if (S.tab === "decisions" && sel) h += "/" + sel.replace("card:", "");
  else if (S.tab === "code" && sel) h += "/b" + sel.replace("block:", "");
  else if (S.tab === "details") h += "/" + S.sub.details;
  else if (S.tab === "summary" && sel?.startsWith("req:")) h += "/r" + sel.slice(4);
  history.replaceState(null, "", "#" + h);
}
function route(hash) {
  const m = /^#?(summary|decisions|code|details)(?:\/(.+))?$/.exec(hash || "");
  if (!m) return showTab("summary");
  const [, tab, rest] = m;
  if (tab === "decisions" && rest && cardByKey.has(rest)) return goCard(rest);
  if (tab === "code" && rest && /^b\d+$/.test(rest) && blk(+rest.slice(1))) return goBlock(+rest.slice(1));
  if (tab === "details" && rest && DETAIL_TABS.some((t) => t.id === rest)) S.sub.details = rest;
  if (tab === "summary" && rest && /^r/.test(rest) && reqById.has(rest.slice(1))) { showTab("summary"); return select("summary", "req:" + rest.slice(1), { scroll: true }); }
  showTab(tab);
}
const RENDER = { summary: renderSummary, decisions: renderDecisions, code: renderCode, details: renderDetails };

function select(tab, sel, { scroll = false } = {}) {
  const prev = S.sel[tab];
  S.sel[tab] = sel;
  const root = $("#panel-" + tab);
  $$("[data-sel].sel", root).forEach((el) => el.classList.remove("sel"));
  if (sel) $$(`[data-sel="${CSS.escape(sel)}"]`, root).forEach((el) => el.classList.add("sel"));
  if (tab === "decisions") {
    if (prev && prev !== sel) $(`#card-${prev.slice(5)}`)?.classList.remove("open-full");
    if (sel) $(`#card-${sel.slice(5)}`)?.classList.add("open-full");
  }
  if (tab === "code") markSelectedBlock();
  renderPanel(tab);
  if (scroll && sel) { const el = $(`[data-sel="${CSS.escape(sel)}"]`, root); el?.scrollIntoView({ block: "center" }); }
  if (S.tab === tab) setHash();
}

// ---------------------------------------------------------------- shared renderers: code excerpts
const SIGN = ["&nbsp;", "+", "-"];
function rowHtml(fi, r, cls = "", lcButtons = true) {
  const [k, o, nn, b, h] = r;
  const num = k === 2 ? o : nn, lk = `${fi}:${k === 2 ? "-" : "+"}${num}`;
  const btn = lcButtons ? `<button tabindex="-1" data-act="lc" data-lk="${lk}" aria-label="Comment on line ${num}">${num}</button>` : num;
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
function excerptHtml(bid, { full = false } = {}) {
  const b = blk(bid);
  if (!b) return "";
  const ranges = excerptRanges(b.file, (r) => r[3] === bid);
  const key = "ex" + bid, max = full || S.more[key] ? 1e9 : 24;
  const t = excerptTable(b.file, ranges, max);
  return `<div class="excerpt" data-ex="${bid}"><div class="ex-h">${chip("b", bid)}<span class="ex-path">${pathHtml(b.path)} <span class="muted">${esc(b.where)}</span></span>${verdictTag(b.verdict)}</div>
    ${b.does ? `<div class="ex-does">${prose(b.does)}</div>` : ""}${t.html}
    <div class="ex-more">${t.shown < t.total ? `<button class="btn sm quiet" data-act="more" data-more="${key}">Show all ${t.total} lines</button>` : ""}<button class="btn sm quiet" data-go="b:${bid}">Open in Code</button></div></div>`;
}
function placeExcerpt(place, row) {
  if (!place) return "";
  if (!row) return `<div class="excerpt outside"><span class="mono">${esc(place.text)}</span> — ${place.file == null ? "a file outside this diff" : "unchanged code, not in the diff"}</div>`;
  const ranges = excerptRanges(row.fi, (r) => r === row.row, 3);
  const hit = (r) => (place.base ? r[1] : r[2]) >= place.line && (place.base ? r[1] : r[2]) <= place.end && r[0] !== (place.base ? 1 : 2);
  const t = excerptTable(row.fi, ranges, 40, hit);
  return `<div class="excerpt"><div class="ex-h"><span class="ex-path">${pathHtml(F[row.fi].path)}<span class="muted">:${place.line}${place.end !== place.line ? "–" + place.end : ""}${place.base ? " (base)" : ""}</span></span>${row.row[3] ? chip("b", row.row[3]) : ""}</div>${t.html}
    <div class="ex-more"><button class="btn sm quiet" data-act="goline" data-lk="${row.fi}:${row.row[0] === 2 ? "-" + row.row[1] : "+" + row.row[2]}">Open in Code</button></div></div>`;
}
function excerptList(ids, key, first = 3) {
  if (!ids.length) return `<p class="muted">No block of the diff is linked.</p>`;
  const sorted = [...ids].sort((a, b) => (blk(a).verdict === "keep") - (blk(b).verdict === "keep") || ORDER.indexOf(blk(a)) - ORDER.indexOf(blk(b)));
  const all = S.more[key], shown = all ? sorted : sorted.slice(0, first);
  return shown.map((id) => excerptHtml(id)).join("") + (sorted.length > shown.length ? `<button class="btn sm" data-act="more" data-more="${key}">Show ${sorted.length - shown.length} more blocks</button>` : "");
}
function miniCard(key) {
  const c = cardByKey.get(key), st = statusOf(key);
  return `<div class="mini"><div class="mh">${chip(c.type, c.ref.id)}<span class="muted small">${esc(typeText(c))}</span><span data-status="${key}">${tagHtml(st)}</span></div><div class="mt">${prose(cardTitle(c))}</div></div>`;
}

// ---------------------------------------------------------------- decision cards (one shell everywhere)
function optionsOf(c) {
  if (c.kind === "finding") return [{ id: "fix", label: "Fix", sub: "" }, { id: "nofix", label: "Do not fix", sub: "" }];
  if (c.kind === "idea") return [{ id: "take", label: "Take", sub: "" }, { id: "skip", label: "Do not take", sub: "" }];
  if (c.kind === "decision") return c.ref.variants.map((v) => ({ id: "v:" + v.id, label: v.text, sub: v.consequences.map((x) => x.text).join(" "), rec: c.ref.recommendation?.variant === v.id }));
  return [];
}
let uid = 0;
function choiceHtml(c) {
  const d = S.dec[c.key] ?? { choice: null, text: "", deferred: false }, opts = optionsOf(c), name = `ch-${c.key}-${++uid}`;
  const solo = !opts.length;
  const legend = solo ? (c.kind === "decision" ? "Your answer — the record gives no variants" : c.kind === "fact" ? "Your answer" : "What you found") : "Your decision";
  const ph = solo ? "Write your answer. It is your decision on " + c.label + "." : "Your own answer: it replaces the options above and is your decision on " + c.label + ".";
  const otherOn = d.choice === "other";
  const area = `<textarea class="answer" data-act="text" data-key="${c.key}" aria-label="${solo ? "Answer to" : "Your own answer for"} ${c.label}" placeholder="${esc(ph)}">${esc(d.text)}</textarea>`;
  const body = solo ? `<div class="other-wrap solo">${area}</div>`
    : `<div class="opts">${opts.map((o) => `<label class="opt${d.choice === o.id ? " on" : ""}"><input type="radio" name="${name}" data-act="choose" data-key="${c.key}" data-opt="${esc(o.id)}"${d.choice === o.id ? " checked" : ""}><span class="ol">${prose(o.label)}${o.rec ? `<span class="rec-mark">recommended by the reviewer</span>` : ""}</span>${o.sub ? `<span class="os">${prose(o.sub)}</span>` : ""}</label>`).join("")}
      <label class="opt${otherOn ? " on" : ""}"><input type="radio" name="${name}" data-act="choose" data-key="${c.key}" data-opt="other"${otherOn ? " checked" : ""}><span class="ol">Other — your own answer</span>
      <div class="other-wrap"${otherOn ? "" : " hidden"}>${area}</div></label></div>`;
  const zones = c.kind === "evidence" && c.ref.zones.length ? `<ul class="zones">${c.ref.zones.map((z, i) => `<li><label><input type="checkbox" data-act="zone" data-key="${c.key}" data-zone="${i}"${d.zones?.[i] ? " checked" : ""}> ${prose(z.text)} <span class="muted small">(your mark, not evidence)</span></label></li>`).join("")}</ul>` : "";
  const touched = d.choice || d.text || d.deferred;
  return `<fieldset class="choice" data-choice="${c.key}"><legend>${legend}</legend>${zones}${body}
    <div class="choice-actions"><button class="btn sm" data-act="defer" data-key="${c.key}">${d.deferred ? "Undo defer" : "Defer"}</button>${touched ? `<button class="btn sm quiet" data-act="clear" data-key="${c.key}">Clear</button>` : ""}<span class="hint">Kept in this page only</span></div></fieldset>`;
}
function cardHtml(c, where = "list") {
  const r = c.ref, st = statusOf(c.key), inList = where === "list", sel = S.sel.decisions === "card:" + c.key;
  const settled = inList && !st.open;
  let body = `<div class="card-head"><span class="card-id">${c.label}</span><span class="card-type">${esc(typeText(c))}</span><span class="status" data-status="${c.key}">${tagHtml(st)}</span></div>`;
  if (c.kind === "finding") {
    body += `<p class="card-title">${prose(r.title)}</p><div class="card-at">${slashBreaks(r.at)}</div><p class="card-text${inList ? " clamp" : ""}">${prose(r.what)}</p>`;
    if (!inList) body += `<p class="card-text"><b>Shown by:</b> ${prose(r.shown_by)}</p>`;
    body += `<div class="card-fix"><b>Proposed fix</b>${prose(r.fix)}</div>`;
  } else if (c.kind === "idea") {
    body += `<p class="card-title">${prose(r.title)}</p>${r.at ? `<div class="card-at">${slashBreaks(r.at)}</div>` : ""}<p class="card-text${inList ? " clamp" : ""}">${prose(r.text)}</p>`;
  } else {
    body += `<p class="card-title q">${prose(r.text)}</p><div class="card-at">${slashBreaks(r.at)}</div>`;
    if (r.parent) body += `<p class="card-text small">Applies while ${chip("q", r.parent.question)} is undecided or answered with ${r.parent.variants.map((v) => `<code>${esc(v)}</code>`).join(" or ")}.</p>`;
    if (r.recommendation) body += `<div class="card-rec"><b>Reviewer's recommendation:</b> ${prose(r.recommendation.text)}</div>`;
  }
  body += choiceHtml(c);
  const foot = [];
  if (c.kind === "finding" && r.breaks.length) foot.push(`<span class="lbl">Breaks</span>${chips("r", r.breaks)}`);
  if (c.kind === "finding" && r.untested.length) foot.push(`<span class="lbl">Leaves untested</span>${chips("r", r.untested)}`);
  if (c.blocks.length) foot.push(`<span class="lbl">Code</span>${chips("b", c.blocks, inList ? 6 : 12, `data-act="selcard" data-key="${c.key}"`)}`);
  else if (c.placeBlock) foot.push(`<span class="lbl">At</span>${chips("b", [c.placeBlock])}`);
  if (c.type === "q" && r.children.length) foot.push(`<span class="lbl">Conditional</span>${chips("q", r.children)}`);
  if (foot.length) body += `<div class="card-foot">${foot.join("")}</div>`;
  const compact = `<div class="compact"><span class="card-id">${c.label}</span><span class="ctitle">${prose(cardTitle(c))}</span>${st.answer ? `<span class="answer">${esc(st.answer)}</span>` : ""}<span data-status="${c.key}">${tagHtml(st)}</span><button class="btn sm quiet" data-act="selcard" data-key="${c.key}">Change</button></div>`;
  if (!inList) return `<article class="card" data-card-panel="${c.key}">${body}</article>`;
  return `<article class="card selectable${settled ? " settled" : ""}${sel ? " sel open-full" : ""}${r.parent ? " child" : ""}" id="card-${c.key}" data-card="${c.key}" data-sel="card:${c.key}">${compact}<div class="full">${body}</div></article>`;
}
// keep every view of one decision in step without re-rendering what the owner is typing in
function syncCard(key) {
  const d = S.dec[key] ?? { choice: null, text: "", deferred: false, zones: {} }, st = statusOf(key);
  for (const el of $$(`[data-status="${key}"]`)) el.innerHTML = tagHtml(st);
  for (const fs of $$(`[data-choice="${key}"]`)) {
    for (const input of $$('input[type="radio"]', fs)) { input.checked = input.dataset.opt === d.choice; input.closest(".opt")?.classList.toggle("on", input.checked); }
    const wrap = $(".other-wrap:not(.solo)", fs); if (wrap) wrap.hidden = d.choice !== "other";
    for (const ta of $$("textarea", fs)) if (ta !== document.activeElement) ta.value = d.text;
    for (const z of $$('input[type="checkbox"]', fs)) z.checked = Boolean(d.zones?.[z.dataset.zone]);
    const acts = $(".choice-actions", fs);
    const touched = d.choice || d.text || d.deferred;
    acts.innerHTML = `<button class="btn sm" data-act="defer" data-key="${key}">${d.deferred ? "Undo defer" : "Defer"}</button>${touched ? `<button class="btn sm quiet" data-act="clear" data-key="${key}">Clear</button>` : ""}<span class="hint">Kept in this page only</span>`;
  }
  for (const g of $$(`[data-pills="${key}"]`)) for (const p of $$(".pill[data-opt]", g)) p.setAttribute("aria-checked", String(p.dataset.opt === d.choice && !d.deferred));
  for (const card of $$(`#card-${key}`)) {
    card.classList.toggle("settled", !st.open);
    const ans = $(".compact .answer", card); if (ans) ans.textContent = st.answer ?? "";
    else if (st.answer) $(".compact .ctitle", card)?.insertAdjacentHTML("afterend", `<span class="answer">${esc(st.answer)}</span>`);
  }
  // children may change applicability
  const c = cardByKey.get(key);
  if (c.type === "q") for (const ch of c.ref.children) syncCard("q" + ch);
  // the code frames and notes of this decision's blocks
  for (const bid of c.blocks) {
    const b = blk(bid), open = blockOpen(b);
    $$(`tr.fx[data-b="${bid}"]`).forEach((tr) => tr.classList.toggle("decided", !open));
    $$(`.note[data-b="${bid}"]`).forEach((nt) => nt.classList.toggle("decided", !open));
  }
  updateChrome();
  if (S.rendered.code) { updatePos(); renderTree(); }
  if (S.rendered.decisions) updateSubCounts();
}

// ---------------------------------------------------------------- Summary
function verdictShares(blocks) {
  const s = { keep: 0, fix: 0, remove: 0, question: 0 };
  for (const b of blocks) s[b.verdict] = (s[b.verdict] ?? 0) + b.size;
  return s;
}
function shareBar(s, cls = "") {
  const total = Object.values(s).reduce((a, b) => a + b, 0) || 1;
  return `<span class="vbar ${cls}" role="img" aria-label="${Object.entries(s).filter(([, v]) => v).map(([k, v]) => `${W("verdict." + k)} ${v} lines`).join(", ")}">${["keep", "fix", "remove", "question"].map((k) => s[k] ? `<span class="s-${k}" style="width:${(100 * s[k] / total).toFixed(2)}%"></span>` : "").join("")}</span>`;
}
function reqStatus(r) {
  const lines = [];
  if (r.permission) lines.push(`<span class="tag neutral">Permission</span>`);
  if (r.broken.length) lines.push(`<span class="line"><span class="tag bad">Fails</span>${chips("f", r.broken)}</span>`);
  else if (r.met && !r.permission) lines.push(`<span class="line"><span class="tag ok">Met</span>${esc(W("evidence." + r.met))}</span>`);
  if (r.not_checked) lines.push(`<span class="line"><span class="tag open">Not checked</span>${prose(r.not_checked)}</span>`);
  else if (!r.met && !r.broken.length && !r.permission) lines.push(`<span class="tag open">Not checked</span>`);
  if (r.untested.length) lines.push(`<span class="line"><span class="tag warn">No test</span>${chips("f", r.untested)}</span>`);
  return `<div class="status-cell">${lines.join("")}</div>`;
}
function renderSummary() {
  const c = D.counters, [lead, ...rest] = D.verdict.split("\n");
  const shares = verdictShares(B), { open } = counts();
  const notChecked = [...D.coverageStructured.filter((x) => x.kind === "not_checked").map((x) => `<li>${prose(x.text)} ${srcList(x.sources)}</li>`),
    ...D.requirements.filter((r) => r.not_checked).map((r) => `<li>${chip("r", r.id)} ${prose(r.not_checked)}</li>`)];
  const openFacts = CARDS.filter((x) => x.kind === "fact" || x.kind === "evidence");
  const html = `<div class="frame"><div class="col">
    <div class="statrow">
      <div class="stat"><b>${n(c.files)}</b><span>files${c.addedFiles ? ` · ${c.addedFiles} new` : ""}${c.removedFiles ? ` · ${c.removedFiles} deleted` : ""}</span></div>
      <div class="stat"><b><span class="add">+${n(c.lines.added)}</span> <span class="del">−${n(c.lines.removed)}</span></b><span>lines</span></div>
      <div class="stat grow"><b>${n(c.blocks)} blocks</b>${shareBar(shares)}<div class="legend">${["keep", "fix", "remove", "question"].map((k) => `<span><i class="s-${k}"></i>${W("verdict." + k)} ${c.verdicts[k] ?? 0}</span>`).join("")}</div></div>
      <div class="cta"><div class="stat"><b id="sum-open">${open}</b><span>open decisions</span></div><button class="btn primary" data-act="tab" data-tab="decisions">Decide</button></div>
    </div>
    <div class="section-h"><h2>Verdict</h2></div>
    <p class="lead">${prose(lead)}</p>${textBlock(rest.join("\n"))}
    <div class="rec"><h3>${esc(W("recommendation"))}</h3><p>${prose(D.recommendation)}</p>
      ${D.steps.length ? `<ol class="steps">${D.steps.map((s, i) => `<li data-sel="step:${i}" data-act="sel" tabindex="0"><span>${prose(s.text)}${s.findings.length ? ` ${chips("f", s.findings)}` : ""}</span></li>`).join("")}</ol>` : ""}</div>
    <div class="section-h"><h2>Requirements</h2><span class="muted">did the change do its job — select a row for its findings and code</span></div>
    <table class="tbl"><thead><tr><th>#</th><th>Requirement</th><th>Status</th><th class="num">Code</th></tr></thead><tbody>
    ${D.requirements.map((r) => `<tr class="selectable" data-sel="req:${esc(r.id)}" data-act="sel" tabindex="0"><td class="id">R${esc(r.id)}</td><td>${prose(r.text)}<div class="why"><b>Source</b>${esc(W("source." + r.source))}</div>${r.doubt ? `<div class="why"><b>To reconsider</b>${prose(r.doubt)}</div>` : ""}</td><td style="width:30%">${reqStatus(r)}</td>
      <td class="num">${r.blocks.length ? `<button class="linkbtn nowrap" data-act="req-code" data-req="${esc(r.id)}" title="Show the code that serves R${esc(r.id)}">${plural(r.blocks.length, "block")}</button>` : `<span class="muted small">none linked</span>`}</td></tr>`).join("")}
    </tbody></table>
    <div class="section-h"><h2>Coverage limits</h2><span class="muted">what this review did not establish</span></div>
    <div class="box">
      ${notChecked.length ? `<h3>Not checked</h3><ul class="dash">${notChecked.join("")}</ul>` : ""}
      ${openFacts.length ? `<h3 style="margin-top:10px">Facts and evidence to settle</h3><ul class="plain">${openFacts.map((x) => `<li>${chip("q", x.ref.id)} <span data-status="${x.key}">${tagHtml(statusOf(x.key))}</span> ${prose(x.ref.text.length > 220 ? x.ref.text.slice(0, 220) + "…" : x.ref.text)}</li>`).join("")}</ul>` : ""}
      ${!D.coverageStructured.length && D.coverage ? `<h3 style="margin-top:10px">Coverage as written</h3><p class="${D.coverage.length > 360 ? "clamp" : ""}" id="cov-text">${prose(D.coverage)}</p>${D.coverage.length > 360 ? `<button class="linkbtn small" data-act="cov-more">Show all</button>` : ""}` : ""}
      ${D.coverageStructured.length ? `<p class="muted small" style="margin-top:8px">All statements: Details › Coverage.</p>` : ""}
    </div>
  </div><aside class="panel" id="ctx-summary" aria-label="Context"></aside></div>`;
  $("#panel-summary").innerHTML = html;
  renderPanel("summary");
}
function summaryPanel(sel) {
  if (!sel) {
    const ch = D.change;
    return panelWrap("The change", esc(ch.goal), `
      ${ch.why ? `<div class="psec"><h3>Why</h3><p>${prose(ch.why)}</p></div>` : ""}
      <div class="psec"><h3>What it adds or alters</h3><ul class="dash">${ch.parts.map((p) => `<li>${prose(p)}</li>`).join("")}</ul></div>
      <div class="psec"><h3>Sources</h3><ul class="dash">${ch.sources.map((p) => `<li>${prose(p)}</li>`).join("")}</ul></div>
      ${D.tradeoffs.length ? `<div class="psec"><h3>Accepted tradeoffs</h3><ul class="plain">${D.tradeoffs.map((x) => `<li>${prose(x.text)} <span class="muted">${prose(x.consequence)}</span> ${srcList(x.sources)}</li>`).join("")}</ul></div>` : ""}
      <div class="psec"><p class="muted small">Select a requirement or a step to see its findings and code here.</p></div>`);
  }
  if (sel.startsWith("req:")) {
    const r = reqById.get(sel.slice(4));
    const fs = [...new Set([...r.broken, ...r.untested])];
    const checks = D.checks.map((c, i) => [c, i]).filter(([c]) => c.requirements.includes(r.id));
    return panelWrap(`Requirement R${esc(r.id)} · ${esc(W("source." + r.source))}`, prose(r.text), `
      <div class="psec"><h3>Status</h3>${reqStatus(r)}${r.doubt ? `<p style="margin-top:8px"><b class="small">To reconsider:</b> ${prose(r.doubt)}</p>` : ""}</div>
      ${fs.length ? `<div class="psec"><h3>Findings</h3>${fs.map((f) => miniCard("f" + f)).join("")}</div>` : ""}
      ${checks.length ? `<div class="psec"><h3>Check by hand</h3><ul class="dash">${checks.map(([c]) => `<li>${prose(c.expect)}</li>`).join("")}</ul></div>` : ""}
      <div class="psec"><h3>Code · ${plural(r.blocks.length, "block")}${r.blocks.length ? `<button class="btn sm" data-act="req-code" data-req="${esc(r.id)}">Show in Code</button>` : ""}</h3>${excerptList(r.blocks, "req" + r.id)}</div>`);
  }
  if (sel.startsWith("step:")) {
    const i = +sel.slice(5), s = D.steps[i], ids = [...new Set(s.findings.flatMap((f) => cardByKey.get("f" + f)?.blocks ?? []))];
    return panelWrap(`Step ${i + 1}`, prose(s.text), `
      ${s.findings.length ? `<div class="psec"><h3>Findings it settles</h3>${s.findings.map((f) => miniCard("f" + f)).join("")}</div>` : `<div class="psec"><p class="muted">The step names no finding.</p></div>`}
      ${ids.length ? `<div class="psec"><h3>Code · ${plural(ids.length, "block")}</h3>${excerptList(ids, "step" + i)}</div>` : ""}`);
  }
  return "";
}
function panelWrap(kicker, title, body) {
  return `<div class="panel-head"><div class="panel-kicker">${kicker}</div><h2 class="panel-title">${title}</h2></div><div class="panel-body">${body}</div>`;
}

// ---------------------------------------------------------------- Decisions
const DEC_TABS = [
  { id: "all", label: "All", test: () => true },
  { id: "decision", label: "Decisions", test: (c) => c.kind === "decision" },
  { id: "finding", label: "Findings", test: (c) => c.kind === "finding" },
  { id: "idea", label: "Ideas", test: (c) => c.kind === "idea" },
  { id: "fact", label: "Facts & evidence", test: (c) => c.kind === "fact" || c.kind === "evidence" },
  { id: "deferred", label: "Deferred", test: (c) => statusOf(c.key).deferred },
  { id: "done", label: "Done", test: (c) => { const s = statusOf(c.key); return !s.open && !s.deferred; } },
];
function subCount(t) { const list = CARDS.filter(t.test); return ["deferred", "done"].includes(t.id) ? list.length : list.filter((c) => isOpen(c.key)).length; }
function renderDecisions() {
  $("#panel-decisions").innerHTML = `<div class="frame"><div class="col">
    <div class="section-h" style="margin-bottom:14px"><div class="seg" role="tablist" aria-label="Filter the decisions" id="dec-seg">${DEC_TABS.map((t) => `<button role="tab" data-act="dsub" data-sub="${t.id}" aria-selected="${S.sub.decisions === t.id}"><span>${t.label}</span><span class="count" data-subcount="${t.id}"></span></button>`).join("")}</div>
    <span class="right muted small" id="dec-note"></span></div>
    <div id="dec-list"></div></div><aside class="panel" id="ctx-decisions" aria-label="Context"></aside></div>`;
  renderDecList();
  if (!S.sel.decisions) { const first = $$("#dec-list .card").find((el) => isOpen(el.dataset.card)); if (first) { S.sel.decisions = "card:" + first.dataset.card; first.classList.add("sel", "open-full"); } }
  updateSubCounts(); renderPanel("decisions");
}
function updateSubCounts() {
  for (const t of DEC_TABS) { const el = $(`[data-subcount="${t.id}"]`); if (el) { const k = subCount(t); el.textContent = k; el.classList.toggle("zero", !k); el.title = ["deferred", "done"].includes(t.id) ? `${k} cards` : `${k} open`; } }
  const { open, done } = counts(), el = $("#dec-note");
  if (el) el.innerHTML = `${open} open · ${done} decided · <span class="kbd">j</span> <span class="kbd">k</span> to move`;
}
function renderDecList() {
  const sub = DEC_TABS.find((t) => t.id === S.sub.decisions), list = CARDS.filter(sub.test);
  let html = "";
  if (S.sub.decisions === "all") {
    const groups = [
      ["Owner choice needed", "the owner decides; the review does not", list.filter((c) => c.kind === "decision")],
      ["Proposed fixes", "fix or not, or answer in your own words", list.filter((c) => c.kind === "finding")],
      ["Ideas", "optional improvements", list.filter((c) => c.kind === "idea")],
      ["Facts and evidence to settle", "an answer here is your input, not a verified result", list.filter((c) => c.kind === "fact" || c.kind === "evidence")],
    ];
    for (const [h, note, cards] of groups) if (cards.length) html += `<h2 class="group-h">${h} <span class="muted">${cards.filter((c) => isOpen(c.key)).length} open · ${note}</span></h2><div class="cards">${orderChildren(cards).map((c) => cardHtml(c)).join("")}</div>`;
  } else html = list.length ? `<div class="cards">${orderChildren(list).map((c) => cardHtml(c)).join("")}</div>` : `<div class="empty"><strong>Nothing here.</strong>${S.sub.decisions === "done" ? "Decided cards collect here." : S.sub.decisions === "deferred" ? "Deferred cards collect here." : "This record has no such cards."}</div>`;
  $("#dec-list").innerHTML = html;
}
function orderChildren(cards) {
  const out = [], seen = new Set();
  const visit = (c) => { if (seen.has(c.key)) return; seen.add(c.key); out.push(c); if (c.type === "q") for (const ch of c.ref.children) { const x = cardByKey.get("q" + ch); if (x && cards.includes(x)) visit(x); } };
  for (const c of cards) if (!(c.ref.parent && cards.includes(cardByKey.get("q" + c.ref.parent.question)))) visit(c);
  for (const c of cards) visit(c);
  return out;
}
function decisionsPanel(sel) {
  if (!sel) return panelWrap("Context", "Select a card", `<div class="empty"><strong>Nothing selected.</strong>Select a card to see its code, its basis and its sources here. Press <span class="kbd">j</span> for the next open card.</div>`);
  const c = cardByKey.get(sel.slice(5)), r = c.ref;
  let body = "";
  if (r.place) body += `<div class="psec"><h3>Where</h3>${placeExcerpt(r.place, c.placeRow)}</div>`;
  if (c.kind === "finding") {
    body += `<div class="psec"><h3>Basis</h3><dl class="kv"><dt>What</dt><dd>${prose(r.what)}</dd><dt>Shown by</dt><dd>${prose(r.shown_by)}</dd><dt>Evidence</dt><dd>${esc(W("evidence." + r.evidence))}</dd><dt>Direction</dt><dd>${esc(W("direction." + r.direction))}</dd></dl></div>`;
    const reqs = [...r.breaks.map((id) => [id, "Breaks"]), ...r.untested.map((id) => [id, "Leaves untested"])];
    if (reqs.length) body += `<div class="psec"><h3>Requirements</h3><ul class="plain">${reqs.map(([id, how]) => `<li>${chip("r", id)} <span class="muted small">${how}</span> ${prose(reqById.get(id)?.text ?? "")}</li>`).join("")}</ul></div>`;
    const steps = D.steps.map((s, i) => [s, i]).filter(([s]) => s.findings.includes(r.id));
    if (steps.length) body += `<div class="psec"><h3>Recommended step</h3>${steps.map(([s, i]) => `<p><b>${i + 1}.</b> ${prose(s.text)}</p>`).join("")}</div>`;
  } else if (c.kind === "idea") {
    body += `<div class="psec"><h3>What it gains and costs</h3><p>${prose(r.text)}</p></div>`;
  } else {
    if (r.context.length) body += `<div class="psec"><h3>Context</h3><ul class="plain">${r.context.map((x) => `<li>${prose(x.text)} ${srcList(x.sources)}</li>`).join("")}</ul></div>`;
    if (r.variants.length) body += `<div class="psec"><h3>Variants and consequences</h3>${r.variants.map((v) => `<div class="mini"><div class="mh"><code>${esc(v.id)}</code>${r.recommendation?.variant === v.id ? `<span class="muted small">recommended</span>` : ""}</div><div class="mt">${prose(v.text)}</div>${v.consequences.map((x) => `<div class="mx">${prose(x.text)} ${srcList(x.sources)}</div>`).join("")}</div>`).join("")}</div>`;
    if (r.recommendation) body += `<div class="psec"><h3>Reviewer's recommendation</h3><p>${prose(r.recommendation.text)}</p>${srcList(r.recommendation.sources)}</div>`;
    if (r.zones.length) body += `<div class="psec"><h3>Zones to check</h3><ul class="plain">${r.zones.map((x) => `<li>${prose(x.text)} ${srcList(x.sources)}</li>`).join("")}</ul></div>`;
    if (r.remainingEvidence.length) body += `<div class="psec"><h3>Evidence this decision does not replace</h3>${chips("q", r.remainingEvidence)}</div>`;
    if (r.parent || r.children.length) body += `<div class="psec"><h3>Related questions</h3>${r.parent ? `<p>Depends on ${chip("q", r.parent.question)}</p>` : ""}${r.children.length ? `<p>Conditional on this: ${chips("q", r.children)}</p>` : ""}</div>`;
  }
  const units = D.units.map((u, i) => [u, i]).filter(([u]) => c.type === "f" ? u.findings.includes(r.id) : c.type === "q" ? u.questions.includes(r.id) : false);
  if (units.length) body += `<div class="psec"><h3>Units it concerns</h3><ul class="plain">${units.map(([u, i]) => `<li><button class="linkbtn" data-act="gounit" data-unit="${i}"><span class="unit-name">${esc(u.name)}</span></button> ${verdictTag(u.verdict)} <span class="muted small">${prose(u.reason ?? "")}</span></li>`).join("")}</ul></div>`;
  const mechs = D.mechanisms.map((m, i) => [m, i]).filter(([m]) => c.type === "f" && m.findings.includes(r.id));
  if (mechs.length) body += `<div class="psec"><h3>Mechanisms it concerns</h3><ul class="plain">${mechs.map(([m, i]) => `<li><button class="linkbtn" data-act="gomech" data-mech="${i}">${esc(m.name)}</button> <span class="muted small">${prose(m.decision ?? "")}</span></li>`).join("")}</ul></div>`;
  body += `<div class="psec"><h3>Code · ${plural(c.blocks.length, "block")}${c.blocks.length ? `<button class="btn sm" data-go="b:${blk(c.blocks[0]) ? c.blocks[0] : ""}">Open in Code</button>` : ""}</h3>${c.blocks.length ? excerptList(c.blocks, "card" + c.key) : `<p class="muted">The record links no block to ${c.label}${c.placeBlock ? `; its place is in ${chip("b", c.placeBlock)}` : ""}.</p>`}</div>`;
  return panelWrap(`${c.label} · ${esc(typeText(c))} <span data-status="${c.key}">${tagHtml(statusOf(c.key))}</span>`, prose(cardTitle(c)), body);
}

// ---------------------------------------------------------------- Code
const PURPOSE_LABEL = { production: "Production code", tests: "Tests", styles: "Styles", assets: "Assets", docs: "Docs", config: "Config" };
const allPurposes = () => S.code.purposes.size === D.purposes.length;
function inFocus(b) {
  if (!S.code.purposes.has(b.purpose)) return false;
  if (S.code.req && !b.serves.includes(S.code.req)) return false;
  if (S.code.unit && b.unit !== S.code.unit) return false;
  if (S.code.mode === "attention" && b.verdict === "keep") return false;
  return true;
}
const filtered = () => S.code.mode === "attention" || S.code.req || S.code.unit || !allPurposes();
function fileMatches(fi) {
  const f = F[fi];
  if (S.code.q && !f.path.toLowerCase().includes(S.code.q.toLowerCase())) return false;
  return S.code.purposes.has(f.purpose) || fileBlocks[fi].some((b) => S.code.purposes.has(b.purpose));
}
const hasComment = (fi) => Object.keys(S.lc).some((k) => k.startsWith(fi + ":")) || (S.lcEdit && S.lcEdit.startsWith(fi + ":"));
function fileShown(fi) {
  if (!fileMatches(fi)) return false;
  if (!filtered()) return true;
  return fileBlocks[fi].some(inFocus) || hasComment(fi) || S.code.pinned.has(fi);
}
function fileAttn(fi) {
  const att = fileBlocks[fi].filter((b) => b.verdict !== "keep"), open = att.filter(blockOpen);
  const worst = ["remove", "fix", "question"].find((v) => open.some((b) => b.verdict === v)) ?? null;
  return { total: att.length, open: open.length, worst };
}
// what a file shows: rows, folds, gaps, notes, comments — the same list estimates its height and draws it
function layoutFile(fi) {
  const f = F[fi], items = [], noted = new Set();
  let lastChanged = 0;
  const showAll = !filtered() || S.code.pinned.has(fi) && !fileBlocks[fi].some(inFocus);
  let prevNew = 0;
  f.hunks.forEach((h, hi) => {
    const start = h.rows.find((r) => r[2] != null)?.[2] ?? h.n;
    if (hi === 0 ? start > 1 : start > prevNew + 1) { items.push({ t: "gap", from: hi === 0 ? 1 : prevNew + 1, to: start - 1 }); lastChanged = 0; }
    const rows = h.rows, len = rows.length, show = new Array(len).fill(showAll);
    if (!showAll) {
      for (let i = 0; i < len; i++) {
        const r = rows[i];
        const focus = r[0] && r[3] && inFocus(blk(r[3]));
        const lk = `${fi}:${r[0] === 2 ? "-" + r[1] : "+" + r[2]}`;
        if (focus || S.lc[lk] || S.lcEdit === lk) for (let j = Math.max(0, i - 3); j <= Math.min(len - 1, i + 3); j++) show[j] = true;
      }
    }
    let i = 0;
    while (i < len) {
      if (show[i]) { push(i); i++; continue; }
      let j = i; while (j < len && !show[j]) j++;
      const id = `${fi}:${hi}:${i}`;
      if (j - i < 4 || S.code.expanded.has(id)) for (let k = i; k < j; k++) push(k);
      else { items.push({ t: "fold", parts: [{ id, hi, from: i, to: j }] }); lastChanged = 0; }
      i = j;
    }
    for (let k = len - 1; k >= 0; k--) if (rows[k][2] != null) { prevNew = rows[k][2]; break; }
    function push(ri) {
      const r = rows[ri], b = r[3] ? blk(r[3]) : null;
      if (b && b.verdict !== "keep" && r[0]) {
        if (!noted.has(b.id)) { noted.add(b.id); items.push({ t: "note", b: b.id }); }
        else if (lastChanged !== b.id) items.push({ t: "cont", b: b.id });
      }
      if (r[0]) lastChanged = r[3];
      items.push({ t: "row", hi, ri, r });
      const lk = `${fi}:${r[0] === 2 ? "-" + r[1] : "+" + r[2]}`;
      if (S.lc[lk] || S.lcEdit === lk) items.push({ t: "lc", lk });
    }
  });
  // a run of folds and hunk gaps reads as one line: what is hidden there, expandable at once
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
  for (const it of items) h += it.t === "row" ? 20 : it.t === "note" ? 112 : it.t === "lc" ? 90 : it.t === "cont" ? 26 : 28;
  return Math.max(h, 20);
}
function foldLabel(fi, it) {
  const rows = it.parts.flatMap((p) => F[fi].hunks[p.hi].rows.slice(p.from, p.to)), ch = rows.filter((r) => r[0]);
  const ids = [...new Set(ch.map((r) => r[3]).filter(Boolean))], kept = ids.every((id) => blk(id).verdict === "keep");
  const add = ch.filter((r) => r[0] === 1).length, del = ch.filter((r) => r[0] === 2).length;
  const what = !ch.length ? `${rows.length} unchanged lines` : kept ? `${rows.length} lines, kept` : `${rows.length} lines outside the filter`;
  return `<span class="dots">⋯</span><span>${what}</span>${it.parts.length > 1 ? `<span class="muted">· across ${it.parts.length} hunks</span>` : ""}${ch.length ? `<span class="muted">+${add} −${del}</span>` : ""}${ids.length ? `<span class="fold-blocks">${ids.slice(0, 4).map((id) => "B" + id).join(", ")}${ids.length > 4 ? ` +${ids.length - 4}` : ""}</span>` : ""}<span style="margin-left:auto" class="muted">Expand</span>`;
}
function foldText(fi, it) { return foldLabel(fi, it).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(" Expand", "").trim(); }
function noteHtml(b) {
  const open = blockOpen(b), sel = S.sel.code === "block:" + b.id;
  return `<tr class="note-row v-${b.verdict}" data-b="${b.id}"><td colspan="3"><div class="note v-${b.verdict}${open ? "" : " decided"}${sel ? " sel" : ""}" data-b="${b.id}" id="note-${b.id}">
    <div class="note-top">${verdictTag(b.verdict)}<span class="bid">B${b.id}</span><span class="does" title="${esc(b.does)}">${prose(b.does)}</span></div>
    ${blockCards(b).map((k) => noteCard(k)).join("")}</div></td></tr>`;
}
function noteCard(key) {
  const c = cardByKey.get(key), r = c.ref, d = S.dec[key] ?? {}, opts = optionsOf(c), st = statusOf(key);
  const quick = opts.length && opts.length <= 3 && opts.every((o) => o.label.length <= 40);
  const pills = quick ? `${opts.map((o) => `<button class="pill" role="radio" aria-checked="${d.choice === o.id && !d.deferred}" data-act="choose" data-key="${key}" data-opt="${esc(o.id)}">${prose(o.label)}</button>`).join("")}<button class="pill" role="radio" aria-checked="${d.choice === "other" && !d.deferred}" data-act="other" data-key="${key}" data-opt="other">Other…</button>`
    : `<button class="pill" data-act="other" data-key="${key}">${opts.length ? "Choose…" : "Answer…"}</button>`;
  const sub = c.kind === "finding" ? `<b>Fix:</b> ${prose(r.fix)}` : c.kind === "decision" && r.recommendation ? `<b>Recommendation:</b> ${prose(r.recommendation.text)}` : "";
  return `<div class="note-card">${chip(c.type, r.id)}<span class="ctitle clamp" style="-webkit-line-clamp:2">${prose(cardTitle(c))}</span><span class="st" data-status="${key}">${tagHtml(st)}</span>
    ${sub ? `<span class="cfix">${sub}</span>` : ""}<div class="pills" role="radiogroup" aria-label="Decision on ${c.label}" data-pills="${key}">${pills}</div></div>`;
}
function lcHtml(lk) {
  const [fi, side] = [lk.split(":")[0], lk.split(":")[1]];
  const line = side.slice(1), what = side[0] === "-" ? `removed line ${line}` : `line ${line}`;
  if (S.lcEdit === lk) return `<tr class="lc-row"><td colspan="3"><div class="lc"><div class="lc-h">Comment on ${what}</div><textarea id="lc-input" aria-label="Comment on ${what}" placeholder="Your comment on this line">${esc(S.lc[lk]?.text ?? "")}</textarea><div class="lc-a"><button class="btn sm primary" data-act="lc-save" data-lk="${lk}">Save comment</button><button class="btn sm quiet" data-act="lc-cancel">Cancel</button></div></div></td></tr>`;
  return `<tr class="lc-row"><td colspan="3"><div class="lc"><div class="lc-h">Your comment · ${what}<button class="btn sm quiet" data-act="lc" data-lk="${lk}">Edit</button><button class="btn sm quiet" data-act="lc-del" data-lk="${lk}">Delete</button></div><div class="lc-t">${esc(S.lc[lk].text)}</div></div></td></tr>`;
}
function fileBodyHtml(fi, items) {
  const out = [];
  // the frame of an attention block: its changed rows, closed at the first and last row of each run
  const att = (it) => it && it.t === "row" && it.r[0] && it.r[3] && blk(it.r[3]).verdict !== "keep" ? it.r[3] : 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.t === "row") {
      const a = att(it), b = a ? blk(a) : null;
      const top = a && att(items[i - 1]) !== a && items[i - 1]?.t !== "note", bot = a && att(items[i + 1]) !== a;
      const cls = b ? `fx v-${b.verdict}${blockOpen(b) ? "" : " decided"}${top ? " ft" : ""}${bot ? " fb2" : ""}${S.sel.code === "block:" + b.id ? " selb" : ""}` : (it.r[3] && S.sel.code === "block:" + it.r[3] ? "selb" : "");
      out.push(rowHtml(fi, it.r, cls));
    } else if (it.t === "note") out.push(noteHtml(blk(it.b)));
    else if (it.t === "cont") out.push(`<tr class="cont-row"><td colspan="3"><div class="cont"><b>B${it.b}</b> continues</div></td></tr>`);
    else if (it.t === "fold") out.push(`<tr class="fold"><td colspan="3"><button data-act="unfold" data-fold="${it.parts.map((p) => p.id).join(",")}" data-f="${fi}" aria-label="Expand ${foldText(fi, it)}">${foldLabel(fi, it)}</button></td></tr>`);
    else if (it.t === "gap") out.push(`<tr class="gap"><td colspan="3" class="gcell">⋯ lines ${it.from}–${it.to} unchanged, not in the diff</td></tr>`);
    else if (it.t === "lc") out.push(lcHtml(it.lk));
  }
  return `<table class="diff">${COLS}<tbody>${out.join("")}</tbody></table>`;
}
const layouts = new Map();
let io = null;
function renderCode() {
  const reqOpts = D.requirements.map((r) => { const k = r.blocks.length, t = r.text.length > 56 ? r.text.slice(0, 56) + "…" : r.text; return `<option value="${esc(r.id)}">R${esc(r.id)} · ${esc(t)} (${k})</option>`; }).join("");
  $("#panel-code").innerHTML = `
  <div class="toolbar" role="toolbar" aria-label="Code view">
    <button class="btn sm" data-act="tree" aria-pressed="${S.code.tree}" aria-controls="tree" title="Show or hide the file tree">Files</button>
    <div class="seg" role="group" aria-label="Which code"><button data-act="mode" data-mode="attention" aria-pressed="${S.code.mode === "attention"}">Needs attention <span class="count">${ATTN.length}</span></button><button data-act="mode" data-mode="all" aria-pressed="${S.code.mode === "all"}">All <span class="count">${B.length}</span></button></div>
    <div class="pop" id="purpose-pop"><button class="btn sm" data-act="purpose-menu" aria-expanded="false" aria-haspopup="true" id="purpose-btn"></button>
      <div class="pop-menu" hidden role="group" aria-label="Purpose">${D.purposes.filter((p) => D.purposeCounts[p].files || D.purposeCounts[p].blocks).map((p) => `<label><input type="checkbox" data-act="purpose" value="${p}"${S.code.purposes.has(p) ? " checked" : ""}> ${PURPOSE_LABEL[p]} <span class="muted">${plural(D.purposeCounts[p].files, "file")}</span></label>`).join("")}
      <div class="rules">By path: <code>__tests__/</code>, <code>*.test.*</code>, <code>*.spec.*</code>, <code>*.browser.mjs</code> are tests; <code>.md</code> and changelogs are docs; <code>package.json</code>, lock files and YAML are config; the rest is production. A test block in a production file counts as tests.</div></div></div>
    <select data-act="req" aria-label="Requirement"><option value="">Any requirement</option>${reqOpts}</select>
    <span id="unit-token"></span>
    <div class="search"><input type="search" id="file-q" data-act="q" placeholder="Filter files" aria-label="Filter files by path" value="${esc(S.code.q)}"><span class="kbd">/</span></div>
    <div class="pos" id="pos"></div>
  </div>
  <div class="frame code${S.code.tree ? "" : " no-tree"}" id="code-frame"><nav class="tree" id="tree" aria-label="Files"${S.code.tree ? "" : " hidden"}></nav><div class="files" id="files"></div><aside class="panel" id="ctx-code" aria-label="Context"></aside></div>`;
  if (!S.sel.code) { const first = ATTN.find(blockOpen); if (first) S.sel.code = "block:" + first.id; }
  syncToolbar(); renderFiles(); renderTree(); renderPanel("code"); updatePos();
}
function syncToolbar() {
  const sel = $('#panel-code select[data-act="req"]'); if (sel) sel.value = S.code.req;
  $$('#panel-code [data-act="mode"]').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === S.code.mode)));
  const pb = $("#purpose-btn"); if (pb) pb.textContent = allPurposes() ? "Purpose: all" : `Purpose: ${[...S.code.purposes].filter((p) => D.purposeCounts[p].files).map((p) => PURPOSE_LABEL[p].split(" ")[0]).join(", ") || "none"}`;
  $$('#panel-code input[data-act="purpose"]').forEach((i) => { i.checked = S.code.purposes.has(i.value); });
  const tok = $("#unit-token"); if (tok) tok.innerHTML = S.code.unit ? `<span class="token">Unit: ${esc(S.code.unit)}<button data-act="unit-clear" aria-label="Clear the unit filter">×</button></span>` : "";
  const q = $("#file-q"); if (q && q.value !== S.code.q) q.value = S.code.q;
}
function renderFiles() {
  layouts.clear();
  const shown = F.map((_, fi) => fi).filter(fileShown), hidden = F.length - shown.length;
  let html = shown.map((fi) => {
    const items = layoutFile(fi); layouts.set(fi, items);
    const f = F[fi], a = fileAttn(fi), col = S.code.collapsed.has(fi);
    return `<section class="file${col ? " collapsed" : ""}" id="file-${fi}" data-f="${fi}" aria-label="${esc(f.path)}"><div class="fh"><button class="btn icon sm quiet fold-btn" data-act="fcollapse" data-f="${fi}" aria-expanded="${!col}" aria-label="${col ? "Expand" : "Collapse"} ${esc(f.path)}">${col ? "▸" : "▾"}</button>
      <div class="path">${pathHtml(f.path)}</div><div class="meta">${f.status !== "M" ? `<span>${f.status === "A" ? "new file" : "deleted"}</span>` : ""}${a.total ? `<span>${a.open ? `${a.open} of ${a.total} open` : `${a.total} decided`}</span>` : ""}<span class="a">+${f.add}</span><span class="d">−${f.del}</span><span>${PURPOSE_LABEL[f.purpose]}</span></div></div>
      <div class="fb pending" data-f="${fi}" style="height:${estimate(items)}px"></div></section>`;
  }).join("");
  if (!shown.length) html = `<div class="empty"><strong>No file matches.</strong>Change the filters above${S.code.mode === "attention" ? ", or switch to All" : ""}.</div>`;
  if (hidden && fileMatchesCount() > shown.length) html += `<div class="hidden-note">${plural(fileMatchesCount() - shown.length, "file")} ${S.code.mode === "attention" && !S.code.req && !S.code.unit ? "hold only kept code" : "fall outside the filter"}.<button class="btn sm" data-act="mode" data-mode="all">Show all files</button></div>`;
  const box = $("#files"); box.innerHTML = html;
  io?.disconnect();
  io = new IntersectionObserver((entries) => { for (const e of entries) if (e.isIntersecting) fill(+e.target.dataset.f); }, { rootMargin: "1600px 0px" });
  $$(".fb.pending", box).forEach((el) => io.observe(el));
}
const fileMatchesCount = () => F.filter((_, fi) => fileMatches(fi)).length;
function fill(fi, force = false) {
  const el = $(`#file-${fi} .fb`);
  if (!el || (!el.classList.contains("pending") && !force)) return;
  let items = layouts.get(fi);
  if (force || !items) { items = layoutFile(fi); layouts.set(fi, items); }
  el.innerHTML = fileBodyHtml(fi, items);
  el.classList.remove("pending"); el.style.height = "";
  io?.unobserve(el);
}
function fillVisible() { $$(".fb.pending").forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight + 1600 && r.bottom > -1600) fill(+el.dataset.f); }); }
function rerenderCode() { renderFiles(); renderTree(); syncToolbar(); updatePos(); requestAnimationFrame(fillVisible); }
function buildTree() {
  const root = { dirs: new Map(), files: [] };
  F.forEach((f, fi) => {
    if (!fileMatches(fi)) return;
    const parts = f.path.split("/"); let node = root;
    for (const p of parts.slice(0, -1)) { if (!node.dirs.has(p)) node.dirs.set(p, { dirs: new Map(), files: [] }); node = node.dirs.get(p); }
    node.files.push(fi);
  });
  // compress single-child directories
  const compress = (name, node) => { while (node.dirs.size === 1 && !node.files.length) { const [k, v] = [...node.dirs][0]; name += "/" + k; node = v; } return [name, node]; };
  return { root, compress };
}
function renderTree() {
  const el = $("#tree"); if (!el) return;
  const { root, compress } = buildTree();
  let html = `<div class="tree-head"><span>${plural(fileMatchesCount(), "file")}</span></div>`;
  const walk = (node, depth, prefix) => {
    for (const [k, v] of [...node.dirs].sort()) {
      const [name, inner] = compress(k, v), path = prefix + name + "/", closed = S.code.dirsClosed.has(path);
      html += `<button class="tnode t-dir" style="--d:${depth}" data-act="dir" data-dir="${esc(path)}" aria-expanded="${!closed}"><span class="caret">▾</span><span class="tn-name">${esc(name).replace(/\//g, "/<wbr>")}/</span></button>`;
      if (!closed) walk(inner, depth + 1, path);
    }
    for (const fi of node.files) {
      const f = F[fi], a = fileAttn(fi), dim = !fileShown(fi), base = f.path.slice(f.path.lastIndexOf("/") + 1);
      const mark = a.total ? `<span class="mark ${a.open ? a.worst : "done"}" title="${a.open ? `${a.open} open of ${a.total} needing attention` : `${a.total} decided`}">${a.open || a.total}</span>` : "";
      html += `<button class="tnode t-file${dim ? " dim" : ""}" style="--d:${depth}" data-act="gofile" data-f="${fi}" title="${esc(f.path)}${dim ? " — nothing here needs attention; click to show it" : ""}"><span class="tn-st">${f.status}</span><span class="tn-main"><span class="tn-name">${esc(base).replace(/([_-])/g, "$1<wbr>")}</span><span class="tn-meta">${mark}<span class="a">+${f.add}</span><span class="d">−${f.del}</span></span></span></button>`;
    }
  };
  walk(root, 0, "");
  el.innerHTML = html;
  spy();
}
function openList() { return ATTN.filter((b) => fileMatches(b.file) && inFocusIgnoringMode(b) && blockOpen(b)); }
function inFocusIgnoringMode(b) { return S.code.purposes.has(b.purpose) && (!S.code.req || b.serves.includes(S.code.req)) && (!S.code.unit || b.unit === S.code.unit); }
function updatePos() {
  const el = $("#pos"); if (!el) return;
  const list = openList(), cur = S.sel.code ? +S.sel.code.slice(6) : 0, idx = list.findIndex((b) => b.id === cur);
  const text = !list.length ? "No open item" : idx >= 0 ? `<b>${idx + 1}</b> of <b>${list.length}</b> open` : `<b>${list.length}</b> open`;
  el.innerHTML = `<button class="btn sm icon" data-act="prev" aria-label="Previous open item (k)" title="Previous open item (k)"${list.length ? "" : " disabled"}>‹</button><span aria-live="polite">${text}</span><button class="btn sm icon" data-act="next" aria-label="Next open item (j)" title="Next open item (j)"${list.length ? "" : " disabled"}>›</button>`;
}
function step(dir) {
  if (S.tab === "decisions") return stepCards(dir);
  if (S.tab !== "code") return;
  const list = openList(); if (!list.length) return;
  const cur = S.sel.code ? blk(+S.sel.code.slice(6)) : null;
  let target;
  if (cur) {
    const pos = ORDER.indexOf(cur);
    target = dir > 0 ? list.find((b) => ORDER.indexOf(b) > pos) ?? list[0] : [...list].reverse().find((b) => ORDER.indexOf(b) < pos) ?? list[list.length - 1];
  } else target = dir > 0 ? list[0] : list[list.length - 1];
  goBlock(target.id);
}
function stepCards(dir) {
  const els = $$("#dec-list .card"), keys = els.map((e) => e.dataset.card).filter((k) => isOpen(k));
  if (!keys.length) return;
  const all = els.map((e) => e.dataset.card), cur = S.sel.decisions?.slice(5), pos = all.indexOf(cur);
  const next = dir > 0 ? keys.find((k) => all.indexOf(k) > pos) ?? keys[0] : [...keys].reverse().find((k) => all.indexOf(k) < pos) ?? keys[keys.length - 1];
  select("decisions", "card:" + next);
  $(`#card-${next}`)?.scrollIntoView({ block: "start" });
}
function goBlock(id, { scroll = true } = {}) {
  const b = blk(id);
  if (S.tab !== "code") showTab("code", { push: false });
  let changed = false;
  if (!fileMatches(b.file)) { S.code.q = ""; S.code.purposes = new Set(D.purposes); changed = true; }
  if (!inFocusIgnoringMode(b)) { S.code.req = ""; S.code.unit = ""; S.code.purposes = new Set(D.purposes); changed = true; }
  if (S.code.mode === "attention" && b.verdict === "keep") { S.code.mode = "all"; changed = true; }
  if (S.code.collapsed.has(b.file)) { S.code.collapsed.delete(b.file); changed = true; }
  if (changed) rerenderCode();
  fill(b.file);
  select("code", "block:" + id);
  if (scroll) {
    const target = $(`#note-${id}`) ?? $(`#file-${b.file} tr[data-b="${id}"]`);
    if (target) window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - (48 + 52 + 44));
  }
}
function markSelectedBlock() {
  const id = S.sel.code ? S.sel.code.slice(6) : "";
  $$("#files tr.selb").forEach((tr) => tr.classList.remove("selb"));
  $$("#files .note.sel").forEach((nt) => nt.classList.remove("sel"));
  if (id) { $$(`#files tr.r[data-b="${id}"]`).forEach((tr) => tr.classList.add("selb")); $(`#note-${id}`)?.classList.add("sel"); }
  updatePos();
}
function goFile(fi) {
  if (S.tab !== "code") showTab("code", { push: false });
  if (!fileShown(fi)) { if (!fileMatches(fi)) { S.code.q = ""; S.code.purposes = new Set(D.purposes); } S.code.pinned.add(fi); rerenderCode(); }
  if (S.code.collapsed.has(fi)) { S.code.collapsed.delete(fi); rerenderCode(); }
  fill(fi);
  const sec = $(`#file-${fi}`); sec?.scrollIntoView({ block: "start" });
}
function goLine(lk) {
  const fi = +lk.split(":")[0];
  if (S.tab !== "code") showTab("code", { push: false });
  if (!fileShown(fi)) { S.code.pinned.add(fi); }
  // unfold whatever hides the line
  const side = lk.split(":")[1], num = +side.slice(1);
  F[fi].hunks.forEach((h, hi) => h.rows.forEach((r, ri) => {
    if ((side[0] === "-" ? r[0] === 2 && r[1] === num : r[0] !== 2 && r[2] === num)) for (const it of layoutFile(fi)) if (it.t === "fold") for (const p of it.parts) if (p.hi === hi && ri >= p.from && ri < p.to) S.code.expanded.add(p.id);
  }));
  S.code.collapsed.delete(fi);
  rerenderCode(); fill(fi, true);
  const tr = $(`#file-${fi} tr.r[data-lk="${CSS.escape(lk)}"]`);
  if (tr) { tr.scrollIntoView({ block: "center" }); tr.classList.add("lnsel"); setTimeout(() => tr.classList.remove("lnsel"), 1600); }
}
function spy() {
  const tree = $("#tree"); if (!tree || S.tab !== "code") return;
  const top = 48 + 52 + 10;
  let cur = null;
  for (const sec of $$("#files .file")) { const r = sec.getBoundingClientRect(); if (r.bottom > top) { cur = sec.dataset.f; break; } }
  $$(".tnode.t-file.cur", tree).forEach((x) => x.classList.remove("cur"));
  if (cur !== null) { const node = $(`.tnode.t-file[data-f="${cur}"]`, tree); node?.classList.add("cur"); }
}
function codePanel(sel) {
  const lcs = Object.entries(S.lc);
  const lcList = `<div class="psec"><h3>Line comments · ${lcs.length}</h3>${lcs.length ? `<div class="lc-list">${lcs.map(([lk, v]) => { const [fi, side] = lk.split(":"); return `<div class="lc-item"><div class="where">${esc(splitPath(F[fi].path)[1])}:${side[0] === "-" ? "−" : ""}${side.slice(1)}<button class="btn sm quiet" data-act="goline" data-lk="${lk}">Go</button></div><div class="txt">${esc(v.text)}</div></div>`; }).join("")}</div>` : `<p class="muted small">Click a line number in the diff to comment on that line.</p>`}</div>`;
  if (!sel) return panelWrap("Context", "Nothing selected", `<div class="psec"><p>Click a framed block, or press <span class="kbd">j</span> for the next open item. A frame marks code the review wants changed or asks about:</p>
    <p>${verdictTag("fix")} ${verdictTag("remove")} ${verdictTag("question")}</p><p class="muted small">Kept code folds into a line you can expand. Clicking kept code shows what it serves.</p></div>${lcList}`);
  const b = blk(+sel.slice(6)), cards = blockCards(b);
  const reqs = b.serves.map((id) => `<li>${chip("r", id)} ${prose(reqById.get(id)?.text ?? "")}</li>`).join("");
  let body = `<div class="psec"><dl class="kv"><dt>Place</dt><dd><span class="mono small path">${slashBreaks(b.path)}</span> <span class="muted small">${esc(b.where)}</span></dd>${b.unit ? `<dt>Unit</dt><dd><button class="linkbtn" data-act="gounit" data-unit="${D.units.findIndex((u) => u.name === b.unit)}"><span class="unit-name">${esc(b.unit)}</span></button></dd>` : ""}
    <dt>Serves</dt><dd>${reqs ? `<ul class="plain">${reqs}</ul>` : `<span class="muted">no requirement link recorded</span>`}</dd></dl></div>`;
  if (cards.length) body += `<div class="psec"><h3>Decision${cards.length > 1 ? "s" : ""}</h3>${cards.map((k) => {
    const c = cardByKey.get(k), others = c.blocks.filter((x) => x !== b.id);
    return cardHtml(c, "panel") + (others.length ? `<p class="small muted" style="margin-top:8px">The same decision covers ${chips("b", others, 10)}</p>` : "");
  }).join("")}</div>`;
  else body += `<div class="psec"><p class="muted">Kept: the review asks nothing about this block.</p></div>`;
  return panelWrap(`B${b.id} · ${verdictTag(b.verdict)}`, b.does ? prose(b.does) : `<span class="muted">Kept code</span>`, body + lcList);
}

// ---------------------------------------------------------------- Details
const DETAIL_TABS = [
  { id: "structure", label: "Structure", count: () => D.units.length },
  { id: "mechanisms", label: "Mechanisms", count: () => D.mechanisms.length },
  { id: "checks", label: "Checks by hand", count: () => D.checks.length },
  { id: "challenges", label: "Challenges", count: () => D.challenges.length },
  { id: "coverage", label: "Coverage", count: () => null },
  { id: "report", label: "Report details", count: () => null },
];
function renderDetails() {
  $("#panel-details").innerHTML = `<div class="frame"><div class="col">
    <div class="section-h" style="margin-bottom:16px"><div class="seg" role="tablist" aria-label="Details">${DETAIL_TABS.map((t) => { const k = t.count(); return `<button role="tab" data-act="xsub" data-sub="${t.id}" aria-selected="${S.sub.details === t.id}">${t.label}${k !== null ? `<span class="count${k ? "" : " zero"}">${k}</span>` : ""}</button>`; }).join("")}</div></div>
    <div id="det-body"></div></div><aside class="panel" id="ctx-details" aria-label="Context"></aside></div>`;
  renderDetailBody();
}
function renderDetailBody() {
  $$('#panel-details [data-act="xsub"]').forEach((b) => b.setAttribute("aria-selected", String(b.dataset.sub === S.sub.details)));
  const sub = S.sub.details;
  let html = "";
  if (sub === "structure") {
    const units = D.units;
    html = `<div class="twocol"><div class="box"><h3>${esc(W("now"))}</h3><div class="prose">${textBlock(D.now)}</div></div><div class="box"><h3>${esc(W("target"))}</h3><div class="prose">${textBlock(D.target)}</div></div></div>
      <div class="section-h"><h2>Units as written</h2><span class="muted">${plural(units.length, "unit")}</span>${units.length ? `<span class="right"><span class="seg" role="group" aria-label="View"><button data-act="sview" data-view="table" aria-pressed="${S.structView === "table"}">Table</button><button data-act="sview" data-view="graph" aria-pressed="${S.structView === "graph"}">Graph</button></span></span>` : ""}</div>
      ${!units.length ? `<div class="empty"><strong>No units recorded.</strong>This record describes no structure.</div>` : S.structView === "graph" ? graphHtml() : unitsTable()}
      ${D.targetUnits.length ? `<div class="section-h"><h2>Target structure</h2><span class="muted">${plural(D.targetUnits.length, "unit")}</span></div><table class="tbl"><thead><tr><th>Unit</th><th>Jobs</th><th>Uses</th><th>Status</th></tr></thead><tbody>${D.targetUnits.map((u) => `<tr><td class="unit-name">${esc(u.name)}</td><td class="sub">${u.jobs.map(prose).join("; ")}</td><td class="mono small">${esc(u.uses.join(", ") || "—")}</td><td class="muted small nowrap">${u.existing ? "existing code" : D.units.some((x) => x.name === u.name && !x.existing) ? "from the change" : "to write"}</td></tr>`).join("")}</tbody></table>` : ""}`;
  } else if (sub === "mechanisms") {
    html = !D.mechanisms.length ? `<div class="empty"><strong>No mechanisms recorded.</strong></div>` : `
      ${D.together ? `<div class="box" style="margin-bottom:14px"><p><b>Weighed together, each block counted once</b> (${esc(D.together.names.join(", "))}): ${["code", "test", "other"].filter((k) => D.together.exclusive[k].added || D.together.exclusive[k].removed).map((k) => `${k === "test" ? "tests" : k} +${D.together.exclusive[k].added} −${D.together.exclusive[k].removed}`).join(" · ")}</p><p class="muted small">${esc(W("weight.note"))}</p></div>` : ""}
      <table class="tbl"><thead><tr><th>Mechanism</th><th>Change</th><th>Decision</th><th class="num">Weight</th><th>Findings</th></tr></thead><tbody>${D.mechanisms.map((m, i) => `<tr class="selectable" data-sel="mech:${i}" data-act="sel" tabindex="0"><td><b>${esc(m.name)}</b><div class="unit-jobs">${prose(m.purpose ?? "")}</div></td><td class="muted nowrap">${esc(W("change." + m.change))}</td><td>${prose(m.decision ?? "")}</td><td class="num small">${m.weight ? ["code", "test", "other"].map((k) => { const a = m.weight.exclusive[k].added + m.weight.sharedCounts[k].added, r = m.weight.exclusive[k].removed + m.weight.sharedCounts[k].removed; return a || r ? `<div>${k === "test" ? "tests" : k} +${a} −${r}</div>` : ""; }).join("") : `<span class="muted">—</span>`}</td><td>${chips("f", m.findings)}</td></tr>`).join("")}</tbody></table>`;
  } else if (sub === "checks") {
    html = !D.checks.length ? `<div class="empty"><strong>No manual checks proposed.</strong></div>` : `<p class="muted" style="margin:0 0 12px">${esc(W("checks-note"))}</p><div class="cards">${D.checks.map((c, i) => `<div class="card selectable" data-sel="check:${i}" data-act="sel" tabindex="0"><div class="check-item"><span class="n">${i + 1}</span><div>${c.from ? `<p style="margin:0"><span class="lbl">Start from</span>${prose(c.from)}</p>` : ""}<ol>${c.do.map((x) => `<li>${prose(x)}</li>`).join("")}</ol><p style="margin:0"><span class="lbl">Expect</span>${prose(c.expect)}</p>${c.requirements.length ? `<div class="card-foot"><span class="lbl">Checks</span>${chips("r", c.requirements)}</div>` : ""}</div></div></div>`).join("")}</div>`;
  } else if (sub === "challenges") {
    const OUT = { accepted: "neutral", rejected: "neutral", owner: "open" };
    html = !D.challenges.length ? `<div class="empty"><strong>No challenges recorded.</strong></div>` : `<p class="muted" style="margin:0 0 12px">${esc(W("challenges-note"))}</p><table class="tbl"><thead><tr><th>#</th><th>Raised by</th><th>Point</th><th>Outcome</th></tr></thead><tbody>${D.challenges.map((c, i) => `<tr class="selectable" data-sel="chal:${i}" data-act="sel" tabindex="0"><td class="id">${i + 1}</td><td class="nowrap sub">${esc(W("challenger." + c.from))}</td><td><div class="clamp" style="-webkit-line-clamp:2">${prose(c.point)}</div></td><td class="nowrap"><span class="tag ${OUT[c.outcome]}">${esc(W("outcome." + c.outcome))}</span></td></tr>`).join("")}</tbody></table>`;
  } else if (sub === "coverage") {
    html = `${D.coverageStructured.length ? `<div class="section-h"><h2>Statements</h2></div><table class="tbl"><tbody>${D.coverageStructured.map((c) => `<tr><td class="nowrap"><span class="tag ${c.kind === "not_checked" ? "open" : "neutral"}">${{ ran: "Ran", read: "Read", not_checked: "Not checked" }[c.kind]}</span></td><td>${prose(c.text)}${c.revision ? ` <span class="muted small">@ ${esc(c.revision)}</span>` : ""}<div>${srcList(c.sources)}</div></td></tr>`).join("")}</tbody></table>` : ""}
      <div class="section-h"><h2>Coverage as written</h2></div><div class="box prose">${textBlock(D.coverage)}</div>
      <div class="section-h"><h2>Scope</h2></div><div class="box prose"><p>${prose(D.range)}</p></div>
      ${D.tradeoffs.length ? `<div class="section-h"><h2>Accepted tradeoffs</h2></div><div class="box"><ul class="plain">${D.tradeoffs.map((x) => `<li>${prose(x.text)} <span class="muted">${prose(x.consequence)}</span> ${srcList(x.sources)}</li>`).join("")}</ul></div>` : ""}
      ${D.screens.length ? `<div class="section-h"><h2>Screens</h2></div>${D.screens.map((s) => `<div class="box" style="margin-bottom:8px"><h3>${esc(s.name)}</h3>${s.pictures.map((p) => p.data ? `<figure style="margin:6px 0"><figcaption class="muted small">${esc(p.kind)}</figcaption><img src="${p.data}" alt="${esc(p.kind)} of ${esc(s.name)}" style="max-width:100%"></figure>` : p.link ? `<p><a href="${esc(p.link)}">${esc(p.kind)}</a></p>` : "").join("")}${(s.differences ?? []).map((d) => `<p>${prose(d.what)}${d.why ? ` <span class="muted">${prose(d.why)}</span>` : ""}${d.finding !== undefined ? ` ${chip("f", d.finding)}` : ""}</p>`).join("")}${s.missing ? `<p class="muted">Not compared: ${prose(s.missing)}</p>` : ""}</div>`).join("")}` : ""}`;
  } else {
    const p = D.passport;
    html = `<div class="box"><dl class="kv" style="grid-template-columns:150px minmax(0,1fr)">
      <dt>Title</dt><dd>${esc(D.title)}</dd><dt>Scope</dt><dd>${prose(D.range)}</dd>
      ${p ? `<dt>Repository</dt><dd>${esc(p.repository ?? "")}</dd><dt>Base → head</dt><dd class="mono">${esc(p.base ?? "")} → ${esc(p.head ?? "")}</dd><dt>Reviewed</dt><dd>${esc(p.reviewedAt ?? "")}</dd>${(p.links ?? []).map((l) => `<dt>${esc(l.kind)}</dt><dd><a href="${esc(l.url)}" rel="noreferrer">${esc(l.label)}</a></dd>`).join("")}` : ""}
      <dt>Saved diff</dt><dd><span class="mono small">${esc(D.digest.diffFile)}</span><br><span class="mono small muted">sha256 ${esc(D.digest.diff)}</span></dd>
      <dt>Record</dt><dd><span class="mono small muted">sha256 ${esc(D.digest.record)}</span></dd>
      <dt>Language</dt><dd>${esc(D.language)}</dd>
      <dt>Size</dt><dd>${plural(D.counters.files, "file")}, ${plural(D.counters.blocks, "block")}, ${plural(CARDS.length, "decision card")}</dd>
      </dl></div><p class="muted small" style="margin-top:12px">Prototype: decisions and line comments live in this page's memory only; reloading clears them. Nothing is sent anywhere.</p>`;
  }
  $("#det-body").innerHTML = html;
  if (sub === "structure" && S.structView === "graph") wireGraph();
  // a useful panel from the start: the first row of the list is selected
  const firstSel = { structure: D.units.findIndex((u) => u.verdict && u.verdict !== "keep"), mechanisms: D.mechanisms.length ? 0 : -1, checks: D.checks.length ? 0 : -1, challenges: D.challenges.length ? 0 : -1 }[sub];
  const prefix = { structure: "unit:", mechanisms: "mech:", checks: "check:", challenges: "chal:" }[sub];
  if (prefix && !(S.sel.details ?? "").startsWith(prefix)) S.sel.details = firstSel >= 0 ? prefix + firstSel : null;
  if (!prefix) S.sel.details = null;
  select("details", S.sel.details);
}
function unitsTable() {
  return `<table class="tbl"><thead><tr><th>Unit</th><th>Verdict</th><th>Lines</th><th class="hide-sm">Uses</th><th>Reason</th><th></th></tr></thead><tbody>${D.units.map((u, i) => {
    const blocks = u.blocks.map(blk), lines = blocks.reduce((s, b) => s + b.size, 0);
    return `<tr class="selectable" data-sel="unit:${i}" data-act="sel" tabindex="0"><td style="width:24%"><div class="unit-name">${esc(u.name)}</div><div class="unit-jobs">${u.jobs.map(prose).join("; ")}</div></td>
      <td class="nowrap">${u.existing ? `<span class="muted small">existing code</span>` : verdictTag(u.verdict)}${u.findings.length || u.questions.length ? `<div style="margin-top:4px">${chips("f", u.findings)}${chips("q", u.questions)}</div>` : ""}</td>
      <td class="nowrap">${lines ? `${shareBar(verdictShares(blocks), "small")}<div class="muted small">${n(lines)} lines</div>` : `<span class="muted small">—</span>`}</td>
      <td class="mono small hide-sm">${esc(u.uses.join(", ") || "—")}</td><td class="sub small">${prose(u.reason ?? "")}</td>
      <td class="nowrap">${u.blocks.length ? `<button class="btn sm quiet" data-act="unit-code" data-unit="${i}">Show in code</button>` : ""}</td></tr>`;
  }).join("")}</tbody></table>`;
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
  for (const line of lines) {
    const lw = line.reduce((s, i) => s + W_(i) + GX, -GX); let x = (width - lw) / 2 + 10;
    for (const i of line) { pos[i] = { x, y, w: W_(i) }; x += W_(i) + GX; }
    y += H + GY;
  }
  const edges = [];
  units.forEach((u, i) => u.uses.forEach((name) => { const j = idx.get(name); if (j === undefined) return; const a = pos[i], b = pos[j]; const x1 = a.x + a.w / 2, y1 = a.y + H, x2 = b.x + b.w / 2, y2 = b.y; edges.push(`<path class="gedge" data-from="${i}" data-to="${j}" d="M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2 - 6}" marker-end="url(#arr)"/>`); }));
  const nodes = units.map((u, i) => {
    const p = pos[i], blocks = u.blocks.map(blk), s = verdictShares(blocks), total = Object.values(s).reduce((a, b) => a + b, 0);
    let bx = p.x, bar = "";
    if (total) for (const k of ["keep", "fix", "remove", "question"]) if (s[k]) { const w = p.w * s[k] / total; bar += `<rect class="gbar s-${k}" x="${bx}" y="${p.y + H - 4}" width="${w}" height="4" style="fill:var(--${k === "keep" ? "border-strong" : k === "fix" ? "warn-line" : k === "remove" ? "bad-line" : "q-line"})"/>`; bx += w; }
    return `<g class="gnode${u.existing ? " existing" : ""}" data-i="${i}" data-sel="unit:${i}" data-act="sel" tabindex="0" role="button" aria-label="${esc(u.name)}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${H}" rx="5"/><text x="${p.x + 10}" y="${p.y + 19}">${esc(u.name)}</text><text class="gsub" x="${p.x + 10}" y="${p.y + 35}">${u.existing ? "existing code" : `${esc(W("verdict." + u.verdict))} · ${total} lines`}</text>${bar}</g>`;
  }).join("");
  return `<div class="graph-wrap"><svg id="graph" width="${width + 20}" height="${y - GY + 20}" viewBox="0 0 ${width + 20} ${y - GY + 20}" role="img" aria-label="Who uses whom: an arrow runs from a unit to what it uses"><defs><marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path class="garrow" d="M0,0 L8,4 L0,8 z"/></marker></defs>${edges.join("")}${nodes}</svg></div>
    <p class="muted small" style="margin-top:6px">An arrow runs from a unit to what it uses; hover a unit to trace its edges. Dashed: code the change did not touch. The bar is the share of its lines to keep, fix, remove or ask about.</p>`;
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
    if (sub === "coverage" || sub === "report") return panelWrap("Context", "About this tab", `<div class="psec"><p class="muted">${sub === "coverage" ? "What the review read, ran and could not check, as the reviewer wrote it. The page never reads a status out of this prose." : "Where the change and this record come from. The digests are computed from the bytes."}</p></div>`);
    return panelWrap("Context", "Nothing selected", `<div class="empty">Select a row to see its code, findings and sources here.</div>`);
  }
  const [kind, raw] = sel.split(":"), i = +raw;
  if (kind === "unit") {
    const u = D.units[i], users = D.units.filter((x) => x.uses.includes(u.name)).map((x) => x.name);
    return panelWrap(`Unit · ${u.existing ? "existing code" : verdictTag(u.verdict)}`, `<span class="unit-name">${esc(u.name)}</span>`, `
      <div class="psec"><dl class="kv"><dt>Jobs</dt><dd><ul class="dash">${u.jobs.map((j) => `<li>${prose(j)}</li>`).join("")}</ul></dd>${u.reason ? `<dt>Reason</dt><dd>${prose(u.reason)}</dd>` : ""}<dt>Uses</dt><dd class="mono small">${esc(u.uses.join(", ") || "nothing")}</dd><dt>Used by</dt><dd class="mono small">${esc(users.join(", ") || "nothing")}</dd></dl></div>
      ${u.findings.length || u.questions.length ? `<div class="psec"><h3>Decisions</h3>${[...u.findings.map((f) => "f" + f), ...u.questions.map((q) => "q" + q)].filter((k) => cardByKey.has(k)).map(miniCard).join("")}</div>` : ""}
      <div class="psec"><h3>Code · ${plural(u.blocks.length, "block")}${u.blocks.length ? `<button class="btn sm" data-act="unit-code" data-unit="${i}">Show in Code</button>` : ""}</h3>${u.blocks.length ? excerptList(u.blocks, "unit" + i) : `<p class="muted">Existing code: the change does not touch it.</p>`}</div>`);
  }
  if (kind === "mech") {
    const m = D.mechanisms[i];
    return panelWrap(`Mechanism · ${esc(W("change." + m.change))}`, esc(m.name), `
      <div class="psec"><dl class="kv"><dt>Purpose</dt><dd>${prose(m.purpose ?? "")}</dd><dt>Basis</dt><dd>${prose(m.basis ?? "")}</dd>${m.instead ? `<dt>Already available</dt><dd>${prose(m.instead)}</dd>` : ""}<dt>Benefit</dt><dd>${prose(m.benefit ?? "")}</dd><dt>Cost</dt><dd>${prose(m.cost ?? "")}</dd><dt>Decision</dt><dd><b>${prose(m.decision ?? "")}</b></dd><dt>Evidence</dt><dd>${esc(W("evidence." + m.evidence))}</dd><dt>Units</dt><dd class="mono small">${esc(m.units.join(", "))}</dd></dl></div>
      ${m.findings.length ? `<div class="psec"><h3>Findings</h3>${m.findings.map((f) => miniCard("f" + f)).join("")}</div>` : ""}
      <div class="psec"><h3>Code · ${plural(m.blocks.length, "block")}</h3>${excerptList(m.blocks, "mech" + i)}</div>`);
  }
  if (kind === "check") {
    const c = D.checks[i];
    return panelWrap(`Check by hand ${i + 1}`, prose(c.expect), `<div class="psec"><h3>Requirements it checks</h3>${c.requirements.map((id) => { const r = reqById.get(id); return `<div class="mini"><div class="mh">${chip("r", id)}</div><div class="mx">${prose(r.text)}</div><div style="margin-top:6px">${reqStatus(r)}</div></div>`; }).join("") || `<p class="muted">None named.</p>`}</div>
      <div class="psec"><p class="muted small">${esc(W("checks-note"))}</p></div>`);
  }
  if (kind === "chal") {
    const c = D.challenges[i];
    return panelWrap(`Challenge ${i + 1} · ${esc(W("challenger." + c.from))} · <span class="tag ${c.outcome === "owner" ? "open" : "neutral"}">${esc(W("outcome." + c.outcome))}</span>`, prose(c.point), `
      <div class="psec"><h3>What the review did</h3><p>${prose(c.note)}</p></div>
      ${c.place ? `<div class="psec"><h3>The place that answers it</h3>${placeExcerpt(c.place, rowAt(c.place))}</div>` : ""}`);
  }
  return "";
}

// ---------------------------------------------------------------- panels
function renderPanel(tab) {
  const el = $("#ctx-" + tab); if (!el) return;
  const sel = S.sel[tab];
  el.innerHTML = tab === "summary" ? summaryPanel(sel) : tab === "decisions" ? decisionsPanel(sel) : tab === "code" ? codePanel(sel) : detailsPanel(sel);
  el.scrollTop = 0;
}

// ---------------------------------------------------------------- navigation from chips
function goCard(key) {
  if (S.tab !== "decisions") showTab("decisions", { push: false });
  const sub = DEC_TABS.find((t) => t.id === S.sub.decisions);
  if (!sub.test(cardByKey.get(key))) { S.sub.decisions = "all"; $$('#dec-seg [data-act="dsub"]').forEach((b) => b.setAttribute("aria-selected", String(b.dataset.sub === "all"))); renderDecList(); }
  select("decisions", "card:" + key);
  $(`#card-${key}`)?.scrollIntoView({ block: "start" });
}
function go(spec) {
  const [kind, id] = spec.split(":");
  if (kind === "b") return goBlock(+id);
  if (kind === "r") { showTab("summary", { push: false }); return select("summary", "req:" + id, { scroll: true }); }
  if (kind === "mech") { S.sub.details = "mechanisms"; showTab("details", { push: false }); if (S.rendered.details) renderDetailBody(); return select("details", "mech:" + (+id - 1)); }
  if (cardByKey.has(kind + id)) return goCard(kind + id);
}

// ---------------------------------------------------------------- events
let textTimer = null, qTimer = null;
document.addEventListener("click", (e) => {
  const goEl = e.target.closest("[data-go]");
  if (goEl && !e.metaKey && !e.ctrlKey) { e.preventDefault(); return go(goEl.dataset.go); }
  const act = e.target.closest("[data-act]");
  const a = act?.dataset.act;
  if (a === "choose" && act.tagName === "INPUT") return; // radios act on change
  // close the purpose menu on any outside click
  const pop = $("#purpose-pop .pop-menu");
  if (pop && !pop.hidden && !e.target.closest("#purpose-pop")) { pop.hidden = true; $("#purpose-btn").setAttribute("aria-expanded", "false"); }
  if (a) {
    switch (a) {
      case "tab": return showTab(act.dataset.tab);
      case "theme": return cycleTheme();
      case "keys": return $("#keys-dialog").showModal();
      case "sel": {
        if (e.target.closest("a, button, input, textarea, select, label") && e.target.closest("[data-act]") !== act) return;
        const tab = S.tab; return select(tab, act.dataset.sel);
      }
      case "choose": return choose(act.dataset.key, act.dataset.opt);
      case "other": {
        const key = act.dataset.key, c = cardByKey.get(key), d = decOf(key);
        if (optionsOf(c).length) { d.choice = "other"; d.deferred = false; }
        const note = act.closest(".note"); if (note) select("code", "block:" + note.dataset.b);
        syncCard(key);
        const ta = $(`#ctx-code [data-choice="${key}"] textarea`); ta?.focus();
        return;
      }
      case "defer": { const d = decOf(act.dataset.key); d.deferred = !d.deferred; return syncCard(act.dataset.key); }
      case "clear": { S.dec[act.dataset.key] = { choice: null, text: "", deferred: false, zones: {} }; return syncCard(act.dataset.key); }
      case "selcard": { const key = act.dataset.key; if (S.tab === "decisions") { select("decisions", "card:" + key); $(`#card-${key}`)?.classList.add("open-full"); } else goCard(key); return; }
      case "more": S.more[act.dataset.more] = true; return renderPanel(S.tab);
      case "dsub": S.sub.decisions = act.dataset.sub; $$('#dec-seg [data-act="dsub"]').forEach((b) => b.setAttribute("aria-selected", String(b === act))); renderDecList(); return;
      case "xsub": S.sub.details = act.dataset.sub; renderDetailBody(); setHash(); return;
      case "sview": S.structView = act.dataset.view; return renderDetailBody();
      case "cov-more": { const p = $("#cov-text"); p.classList.toggle("clamp"); act.textContent = p.classList.contains("clamp") ? "Show all" : "Show less"; return; }
      case "req-code": S.code.req = act.dataset.req; S.code.unit = ""; S.code.mode = "all"; S.code.pinned.clear(); if (S.rendered.code) rerenderCode(); return showTab("code");
      case "unit-code": { const u = D.units[+act.dataset.unit]; S.code.unit = u.name; S.code.req = ""; S.code.mode = "all"; S.code.pinned.clear(); if (S.rendered.code) rerenderCode(); return showTab("code"); }
      case "gounit": { S.sub.details = "structure"; S.sel.details = "unit:" + act.dataset.unit; showTab("details"); if (S.rendered.details) renderDetailBody(); return; }
      case "gomech": { S.sub.details = "mechanisms"; S.sel.details = "mech:" + act.dataset.mech; showTab("details"); if (S.rendered.details) renderDetailBody(); return; }
      case "tree": { S.code.tree = !S.code.tree; act.setAttribute("aria-pressed", String(S.code.tree)); $("#tree").hidden = !S.code.tree; $("#code-frame").classList.toggle("no-tree", !S.code.tree); if (S.code.tree) renderTree(); return; }
      case "mode": S.code.mode = act.dataset.mode; S.code.pinned.clear(); return rerenderCode();
      case "purpose-menu": { const m = $("#purpose-pop .pop-menu"); m.hidden = !m.hidden; act.setAttribute("aria-expanded", String(!m.hidden)); return; }
      case "unit-clear": S.code.unit = ""; return rerenderCode();
      case "unfold": act.dataset.fold.split(",").forEach((id) => S.code.expanded.add(id)); return fill(+act.dataset.f, true);
      case "fcollapse": { const fi = +act.dataset.f; if (S.code.collapsed.has(fi)) S.code.collapsed.delete(fi); else S.code.collapsed.add(fi); const sec = $(`#file-${fi}`), col = S.code.collapsed.has(fi); sec.classList.toggle("collapsed", col); act.setAttribute("aria-expanded", String(!col)); act.textContent = col ? "▸" : "▾"; if (!col) fill(fi); return; }
      case "dir": { const p = act.dataset.dir; if (S.code.dirsClosed.has(p)) S.code.dirsClosed.delete(p); else S.code.dirsClosed.add(p); return renderTree(); }
      case "gofile": return goFile(+act.dataset.f);
      case "prev": return step(-1);
      case "next": return step(1);
      case "lc": return editLine(act.dataset.lk);
      case "lc-save": { const v = $("#lc-input").value.trim(), lk = act.dataset.lk; if (v) S.lc[lk] = { text: v }; else delete S.lc[lk]; S.lcEdit = null; refreshLine(lk); return; }
      case "lc-cancel": { const lk = S.lcEdit; S.lcEdit = null; refreshLine(lk); return; }
      case "lc-del": { const lk = act.dataset.lk; delete S.lc[lk]; refreshLine(lk); return; }
      case "goline": return goLine(act.dataset.lk);
    }
    return;
  }
  // selection by clicking a card, a code row or a note
  if (e.target.closest("a, button, input, textarea, select, label")) return;
  const card = e.target.closest(".card[data-card]");
  if (card && S.tab === "decisions") return select("decisions", "card:" + card.dataset.card);
  const note = e.target.closest(".note[data-b]");
  if (note) return select("code", "block:" + note.dataset.b);
  const tr = e.target.closest("#files tr.r[data-b]");
  if (tr && tr.dataset.b && !window.getSelection()?.toString()) return select("code", "block:" + tr.dataset.b);
});
document.addEventListener("change", (e) => {
  const t = e.target, a = t.dataset?.act;
  if (a === "choose") return choose(t.dataset.key, t.dataset.opt, true);
  if (a === "zone") { const d = decOf(t.dataset.key); d.zones[t.dataset.zone] = t.checked; return; }
  if (a === "purpose") { if (t.checked) S.code.purposes.add(t.value); else S.code.purposes.delete(t.value); S.code.pinned.clear(); return rerenderCode(); }
  if (a === "req") { S.code.req = t.value; S.code.pinned.clear(); return rerenderCode(); }
});
document.addEventListener("input", (e) => {
  const t = e.target, a = t.dataset?.act;
  if (a === "text") {
    const key = t.dataset.key, d = decOf(key), c = cardByKey.get(key);
    d.text = t.value;
    if (t.value.trim() && optionsOf(c).length && d.choice !== "other") d.choice = "other";
    clearTimeout(textTimer); textTimer = setTimeout(() => syncCard(key), 120);
  }
  if (a === "q") { S.code.q = t.value; clearTimeout(qTimer); qTimer = setTimeout(rerenderCode, 120); }
});
document.addEventListener("focusin", (e) => {
  const card = e.target.closest?.("#dec-list .card[data-card]");
  if (card && S.sel.decisions !== "card:" + card.dataset.card) select("decisions", "card:" + card.dataset.card);
});
function choose(key, opt, fromRadio = false) {
  const d = decOf(key);
  d.deferred = false;
  d.choice = d.choice === opt && !fromRadio ? null : opt; // a pressed pill releases on a second press
  syncCard(key);
  if (opt === "other") $(`[data-choice="${key}"] textarea`)?.focus();
}
function editLine(lk) {
  const prev = S.lcEdit; S.lcEdit = lk;
  if (prev && prev !== lk) refreshLine(prev, false);
  refreshLine(lk, false);
  $("#lc-input")?.focus();
}
function refreshLine(lk, chrome = true) {
  if (!lk) return;
  const fi = +lk.split(":")[0];
  fill(fi, true);
  if (chrome) { updateChrome(); if (S.tab === "code") renderPanel("code"); }
}
function cycleTheme() {
  S.theme = { auto: "light", light: "dark", dark: "auto" }[S.theme];
  if (S.theme === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = S.theme;
  $("#theme-btn").textContent = "Theme: " + S.theme[0].toUpperCase() + S.theme.slice(1);
}
document.addEventListener("keydown", (e) => {
  const t = e.target, typing = t.matches?.("input, textarea, select") || t.isContentEditable;
  if (e.key === "Escape") {
    const m = $("#purpose-pop .pop-menu"); if (m && !m.hidden) { m.hidden = true; $("#purpose-btn").focus(); return; }
    if (S.lcEdit) { const lk = S.lcEdit; S.lcEdit = null; return refreshLine(lk); }
    if (typing) return t.blur();
    if (S.sel[S.tab] && S.tab !== "details") return select(S.tab, null);
    return;
  }
  if (t.closest?.('[role="tablist"]') && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
    const tabs = $$('[role="tab"]', t.closest('[role="tablist"]')), i = tabs.indexOf(t.closest('[role="tab"]'));
    if (i >= 0) { const nx = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length]; nx.focus(); nx.click(); e.preventDefault(); }
    return;
  }
  if ((e.key === "Enter" || e.key === " ") && t.matches?.('[data-act="sel"]')) { e.preventDefault(); return select(S.tab, t.dataset.sel); }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "j") { e.preventDefault(); return step(1); }
  if (e.key === "k") { e.preventDefault(); return step(-1); }
  if (e.key === "/" && S.tab === "code") { e.preventDefault(); return $("#file-q")?.focus(); }
  if (e.key === "?") return $("#keys-dialog").showModal();
  if (e.key === "c" && S.tab === "code" && S.sel.code) { const b = blk(+S.sel.code.slice(6)), tr = $(`#files tr.r[data-b="${b.id}"]`); if (tr) editLine(tr.dataset.lk); return; }
  if (/^[1-4]$/.test(e.key)) return showTab(TABS[+e.key - 1].id);
});
document.addEventListener("click", (e) => { const tab = e.target.closest(".tab[data-tab]"); if (tab) showTab(tab.dataset.tab); });
let spyQueued = false;
window.addEventListener("scroll", () => { if (spyQueued || S.tab !== "code") return; spyQueued = true; requestAnimationFrame(() => { spyQueued = false; spy(); }); }, { passive: true });
window.addEventListener("hashchange", () => route(location.hash));

// ---------------------------------------------------------------- start
renderShell();
updateChrome();
route(location.hash);
performance.mark("app-ready");
window.__proto = { S, D, timing: () => performance.measure("ready", "app-start", "app-ready").duration };
})();
