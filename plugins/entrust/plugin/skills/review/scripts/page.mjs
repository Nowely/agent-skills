// A checked review as a page: one file with no dependencies, readable without scripts. With them, the author
// marks each finding to apply or skip, and the page writes the decisions out as text to hand back.
import { address, blank } from "./diff.mjs";
import { diagram } from "./diagram.mjs";
import { highlight } from "./highlight.mjs";
import { labelsOf } from "./labels.mjs";
import { VERDICTS, mechanismCounts } from "./review.mjs";
import { esc } from "./text.mjs";

const STYLE = `
/* One column: the task, the verdict, how the change works now, the target and the recommendations, each under its own label; the requirements; the structure as two diagrams and a tree of files; the diff cut into blocks with a stripe for each verdict; the findings; the author's decisions. */
:root { --bg: #f5f6f9; --surface: #ffffff; --fg: #1b2230; --muted: #5d6879; --line: #d8dde6; --accent: #3450c0; --code: #fafbfd; --string: #0c6b78; --number: #7b3fae;
  --keep: #1c7449; --keep-bg: #e4f3ea; --fix: #8f5b00; --fix-bg: #faefd3; --remove: #b02e28; --remove-bg: #fae5e2;
  --text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #11151c; --surface: #19202a; --fg: #e2e7ee; --muted: #97a3b4;
  --line: #2b3441; --accent: #93a8ff; --code: #141a22; --string: #74cbd6; --number: #c9a2f2; --keep: #62c995; --keep-bg: #163225; --fix: #e3b252; --fix-bg: #382c10;
  --remove: #f18d83; --remove-bg: #3e1f1c; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #11151c; --surface: #19202a; --fg: #e2e7ee; --muted: #97a3b4; --line: #2b3441; --accent: #93a8ff;
  --code: #141a22; --string: #74cbd6; --number: #c9a2f2; --keep: #62c995; --keep-bg: #163225; --fix: #e3b252; --fix-bg: #382c10; --remove: #f18d83; --remove-bg: #3e1f1c; color-scheme: dark }
* { box-sizing: border-box }
/* Every size below is in rem, and a rem here is 13px at the browser's default: a dense page that still follows the reader's own text size. */
html { font-size: 81.25% }
body { margin: 0; background: var(--bg); color: var(--fg); font: 1rem/1.5 var(--text) }
.wrap { max-width: 86rem; margin: 0 auto; padding-block: 1.25rem 4rem; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));
  display: flex; flex-direction: column; gap: 1.75rem }
h1 { font-size: 1.55rem; line-height: 1.25; margin: 0; text-wrap: balance }
h2 { font-size: 1.15rem; margin: 0 0 .6rem }
h3 { font-size: 1rem; margin: 0 }
p { margin: 0; max-width: 78ch }
a { color: var(--accent) }
code, pre, .mono { font-family: var(--mono); font-size: .92em }
.sub { color: var(--muted); font-size: .92rem }
.stack { display: flex; flex-direction: column; gap: .6rem }
.label { font-size: .85rem; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); font-weight: 650 }
/* The parts of the summary: a label on the left says which is which, and the weight of the text says which to read first. */
.roles { background: var(--surface); border: 1px solid var(--line) }
.role { display: grid; grid-template-columns: 11rem minmax(0, 1fr); gap: .25rem 1.25rem; padding: .9rem 1.1rem; border-left: 4px solid transparent }
.role + .role { border-top: 1px solid var(--line) }
.role > .label { padding-top: .15rem }
.conclusion { border-left-color: var(--fg) } .conclusion > .label { color: var(--fg) }
.conclusion .lead { font-size: 1.2rem; font-weight: 600; line-height: 1.4 }
.actions { border-left-color: var(--accent); background: color-mix(in srgb, var(--accent) 7%, var(--surface)) } .actions > .label { color: var(--accent) }
.steps { margin: 0; padding-left: 1.4rem; max-width: 78ch; display: flex; flex-direction: column; gap: .2rem }
.doubt { margin-top: .3rem; padding-left: .6rem; border-left: 3px solid var(--fix); color: var(--fix) }
.v-keep { --v: var(--keep); --v-bg: var(--keep-bg) } .v-fix { --v: var(--fix); --v-bg: var(--fix-bg) } .v-remove { --v: var(--remove); --v-bg: var(--remove-bg) }
.v-open { --v: var(--muted); --v-bg: var(--line) }
.tag { display: inline-block; padding: 0 .45rem; border-radius: 3px; background: var(--v-bg); color: var(--v); font-size: .85rem; font-weight: 650; white-space: nowrap }
.share { display: flex; height: .9rem; border-radius: 3px; overflow: hidden; background: var(--line) }
.share span { background: var(--v) }
.legend { display: flex; flex-wrap: wrap; gap: .25rem 1rem; font-variant-numeric: tabular-nums }
.table { overflow-x: auto; background: var(--surface); border: 1px solid var(--line) }
table { border-collapse: collapse; width: 100% }
th, td { text-align: left; vertical-align: top; padding: .4rem .7rem; border-bottom: 1px solid var(--line) }
tr:last-child td { border-bottom: 0 }
th { font-size: .85rem; letter-spacing: .05em; text-transform: uppercase; color: var(--muted) }
td.n { font-variant-numeric: tabular-nums; white-space: nowrap }
td.state { min-width: 13rem }
td ol { margin: 0; padding-left: 1.2rem }
.chip { display: inline-block; margin: 0 .25rem .2rem 0; padding: 0 .4rem; border: 1px solid var(--v); border-radius: 3px; color: var(--v); font-size: .85rem; text-decoration: none; font-weight: 600 }
.bar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 1px solid var(--line); padding-block: .5rem;
  display: flex; flex-wrap: wrap; gap: .4rem 1rem; align-items: center }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg) }
.bar nav, .group { display: flex; flex-wrap: wrap; gap: .35rem .75rem; align-items: center }
button { font: inherit; font-size: .92rem; color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .15rem .6rem; cursor: pointer }
button:hover { border-color: var(--muted) }
button[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg) }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.file { background: var(--surface); border: 1px solid var(--line); min-width: 0 }
.file > header { padding: .5rem .8rem; border-bottom: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: .25rem .75rem; align-items: baseline }
.seg { border-left: 4px solid var(--v, transparent); scroll-margin-top: 4rem }
.seg + .seg, .gap { border-top: 1px solid var(--line) }
.seg > header { padding: .5rem .8rem; background: var(--v-bg); display: flex; flex-direction: column; gap: .35rem }
.seg .row { display: flex; flex-wrap: wrap; gap: .25rem .6rem; align-items: baseline }
.seg ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: .3rem }
.seg li { display: flex; flex-wrap: wrap; gap: .3rem .6rem; align-items: baseline }
.seg.overruled { --v: var(--muted); --v-bg: transparent }
.seg.overruled .tag::after { content: " → " var(--kept) }
.seg:target > header, .finding:target { outline: 2px solid var(--accent); outline-offset: -2px }
summary { padding: .15rem .8rem; font-size: .85rem; color: var(--muted); cursor: pointer; background: var(--code) }
pre { margin: 0; overflow-x: auto; background: var(--code); padding: .3rem 0; line-height: 1.45 }
pre code { display: inline-block; min-width: 100% }
.l { display: block; padding-right: .8rem; white-space: pre }
.l b { display: inline-block; width: 3.2em; text-align: right; color: var(--muted); font-weight: 400; user-select: none }
.l i { display: inline-block; width: 1.6em; text-align: center; font-style: normal; color: var(--muted); user-select: none }
.l.ctx, .l.del { color: var(--muted) }
.seg[data-block] .l.add, .seg[data-block] .l.del { background: color-mix(in srgb, var(--v-bg) 60%, transparent) }
.l.del i, .l.add i { color: var(--fg); font-weight: 700 }
.gap { padding: 0 .8rem; color: var(--muted); font-size: .85rem; background: var(--code) }
.map[data-show="keep"] .seg:not(.v-keep), .map[data-show="fix"] .seg:not(.v-fix), .map[data-show="remove"] .seg:not(.v-remove),
.map[data-show]:not([data-show="all"]) .gap { display: none }
.finding { background: var(--surface); border: 1px solid var(--line); padding: .7rem 1rem; display: flex; flex-direction: column; gap: .4rem; scroll-margin-top: 4rem; min-width: 0 }
.finding p { overflow-wrap: anywhere }
input[type="text"] { font: inherit; color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .2rem .5rem; width: 100%; max-width: 40rem }
textarea { width: 100%; min-height: 14rem; font: .92rem/1.45 var(--mono); color: var(--fg); background: var(--surface); border: 1px solid var(--line); padding: .6rem .8rem }
/* A comment on any passage: a button beside the selection, and the comments listed with the decisions. */
.floating { position: absolute; z-index: 6; display: none; background: var(--accent); color: var(--bg); border-color: var(--accent); box-shadow: 0 2px 8px rgb(0 0 0 / .25) }
.floating.on { display: block }
.passage { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .3rem .6rem; align-items: center; padding: .5rem .8rem; background: var(--surface); border: 1px solid var(--line) }
.passage blockquote, .passage .sub { grid-column: 1 / -1; margin: 0 }
.passage blockquote { padding-left: .7rem; border-left: 3px solid var(--accent); overflow-wrap: anywhere }
.act { display: none }
.js .act { display: flex }
.js input.act { display: block }
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth } }
.accent { --v: var(--accent); --v-bg: color-mix(in srgb, var(--accent) 12%, transparent) }
.idea { border-color: var(--accent) }
.shots figure { flex: 1 1 15rem; max-width: 34rem }
.shots img { display: block; width: 100%; height: auto; border: 1px solid var(--line) }
.shots a { overflow-wrap: anywhere }
.shots.overlaid { display: block; position: relative; max-width: 34rem }
.shots.overlaid .before { display: none }
.shots.overlaid .after { position: absolute; top: 0; left: 0; width: 100%; opacity: var(--blend, .5) }
.shots.overlaid .after figcaption { visibility: hidden }
.plain { margin: 0; padding-left: 1.2rem; max-width: 78ch }
.t-c { color: var(--muted); font-style: italic } .t-s { color: var(--string) } .t-n { color: var(--number) } .t-k { color: var(--accent) }
.l.ctx [class^="t-"] { color: inherit }
.pair { display: flex; flex-wrap: wrap; gap: 1.25rem 2.5rem; align-items: flex-start }
figure { margin: 0; min-width: 0; max-width: 100%; display: flex; flex-direction: column; gap: .5rem }
.scroll { overflow-x: auto; max-width: 100% }
.graph { position: relative }
.graph svg { position: absolute; inset: 0 }
/* The boxes are placed by the script in px, so their text is sized in px too. */
.unit { position: absolute; width: var(--w); height: var(--h); padding: 5px 9px 8px; display: flex; flex-direction: column; overflow: hidden;
  background: var(--surface); border: 1.5px solid var(--v, var(--muted)); border-radius: 4px; color: var(--fg); text-decoration: none; font-size: 11.5px; line-height: 1.3 }
.unit.existing { border-style: dashed }
.unit.new { border-color: var(--accent) }
.unit strong { font: 600 12px/1.35 var(--mono) }
.unit strong, .unit .meta { flex: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
.unit .jobs { flex: 1; min-height: 0; color: var(--muted); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; overflow-wrap: anywhere }
.unit .meta { color: var(--muted) }
.unit .part { position: absolute; inset: auto 0 0; height: 4px; display: flex }
.unit .part span { background: var(--v) }
.edge { fill: none; stroke: var(--muted); stroke-width: 1.2 }
.head { fill: var(--muted) }
.tree, .tree ul { margin: 0; padding: 0; list-style: none }
.tree ul { margin-left: .55rem; padding-left: .9rem; border-left: 1px solid var(--line) }
.tree li > div { display: flex; flex-wrap: wrap; gap: .1rem .6rem; align-items: baseline; padding: .1rem 0 }
.tree .chip { margin: 0 }
footer { overflow-wrap: anywhere }
@media (max-width: 40rem) { .bar { position: static } .role { grid-template-columns: minmax(0, 1fr) } }
`;

const SCRIPT = `
(() => {
  const data = JSON.parse(document.getElementById("data").textContent), key = "review-report:" + data.key, t = data.labels;
  const all = (selector) => [...document.querySelectorAll(selector)];
  const map = document.getElementById("map"), out = document.getElementById("out"), progress = document.getElementById("progress");
  const comment = document.getElementById("comment"), passages = document.getElementById("passages");
  let state = { findings: {}, notes: {}, passages: [] }, picked = null;
  try { state = { ...state, ...JSON.parse(localStorage.getItem(key) || "{}") }; } catch {}
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} };
  document.documentElement.classList.add("js");

  function decisions() {
    const note = (id) => state.notes[id] ? " — " + state.notes[id] : "";
    // A note is kept whatever was decided: on a finding left open and on an idea not taken too.
    const line = (f) => "- " + f.id + ". " + f.title + note("f" + f.id);
    const of = (value) => data.findings.filter((f) => state.findings[f.id] === value).map(line);
    const open = data.findings.filter((f) => !state.findings[f.id]);
    const blocks = data.blocks.filter((b) => state.notes["b" + b.id]).map((b) => "- " + b.path + " " + b.where + ": " + state.notes["b" + b.id]);
    const idea = (i) => "- " + i.title + note(i.id), taken = (i) => state.findings[i.id] === "apply";
    const marked = state.passages.map((p) => "- " + p.where + ": \\"" + p.quote + "\\"" + (p.note ? " — " + p.note : ""));
    const part = (title, lines) => lines.length ? ["", title, ...lines] : [];
    return [t.title + " \\"" + data.title + "\\" (" + data.range + ", " + data.key + ")", ...part(t.apply, of("apply")), ...part(t.skip, of("skip")),
      ...(open.length ? ["", t.open + " " + open.map((f) => f.id).join(", "), ...open.filter((f) => state.notes["f" + f.id]).map(line)] : []),
      ...part(t.ideas, data.ideas.filter(taken).map(idea)), ...part(t.ideaNotes, data.ideas.filter((i) => !taken(i) && state.notes[i.id]).map(idea)),
      ...part(t.blocks, blocks), ...part(t.passages, marked)].join("\\n");
  }

  // Where a selection starts, in the reader's words: the line of the diff, or the part of the report it is in.
  function placeOf(node) {
    const at = node.nodeType === 1 ? node : node.parentElement, file = at.closest(".file"), line = at.closest(".l"), block = at.closest("[data-block]");
    if (file && line) return file.querySelector("header strong").textContent + ":" + line.querySelector("i").textContent.replace("−", "-").trim() + line.querySelector("b").textContent
      + (block ? " (B" + block.dataset.block + ")" : "");
    const named = at.closest("[data-where]"), section = at.closest("section");
    return named ? named.dataset.where : (section && section.querySelector("h2") || document.querySelector("h1")).textContent;
  }

  // The comments on passages, each with its own field. Drawn when one is added or removed, not while the reader types in one.
  function list() {
    passages.textContent = "";
    if (state.passages.length) passages.append(Object.assign(document.createElement("span"), { className: "label", textContent: t.passagesTitle }));
    state.passages.forEach((p, index) => {
      const row = Object.assign(document.createElement("div"), { className: "passage" });
      const input = Object.assign(document.createElement("input"), { type: "text", value: p.note, placeholder: t.notePassage });
      input.dataset.passage = index; input.setAttribute("aria-label", t.notePassage);
      const remove = Object.assign(document.createElement("button"), { type: "button", textContent: t.remove });
      remove.dataset.remove = index;
      row.append(Object.assign(document.createElement("span"), { className: "sub", textContent: p.where }),
        Object.assign(document.createElement("blockquote"), { textContent: p.quote }), input, remove);
      passages.append(row);
    });
  }

  function paint() {
    for (const group of all(".decide")) for (const button of group.querySelectorAll("button"))
      button.setAttribute("aria-pressed", String(state.findings[group.dataset.finding] === button.value));
    for (const block of data.blocks) {
      const kept = block.findings.length > 0 && block.findings.every((f) => state.findings[f] === "skip");
      for (const part of all('[data-block="' + block.id + '"]')) part.classList.toggle("overruled", kept);
    }
    for (const input of all("[data-note]")) if (document.activeElement !== input) input.value = state.notes[input.dataset.note] || "";
    progress.textContent = t.decided.replace("{n}", data.findings.filter((f) => state.findings[f.id]).length + " / " + data.findings.length);
    out.value = decisions();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const group = button.closest(".decide");
    if (group) {
      const id = group.dataset.finding;
      if (state.findings[id] === button.value) delete state.findings[id]; else state.findings[id] = button.value;
    } else if (button.dataset.show) {
      map.dataset.show = button.dataset.show;
      for (const other of all("[data-show]")) if (other !== map) other.setAttribute("aria-pressed", String(other === button));
      return;
    } else if (button.dataset.overlay !== undefined) {
      button.setAttribute("aria-pressed", String(button.closest("article").querySelector(".shots").classList.toggle("overlaid")));
      return;
    } else if (button === comment) {
      if (!picked) return;
      state.passages.push({ ...picked, note: "" });
      getSelection().removeAllRanges(); comment.classList.remove("on");
      save(); list(); paint();
      passages.querySelector("[data-passage='" + (state.passages.length - 1) + "']").focus();
      return;
    } else if (button.dataset.remove !== undefined) { state.passages.splice(+button.dataset.remove, 1); list(); }
    else if (button.id === "apply-all") for (const f of data.findings) state.findings[f.id] = "apply";
    else if (button.id === "clear") { state = { findings: {}, notes: {}, passages: [] }; list(); }
    else if (button.id === "copy") {
      const done = () => { button.textContent = t.copied; setTimeout(() => { button.textContent = t.copy; }, 1500); };
      const select = () => { out.focus(); out.select(); };
      try { navigator.clipboard.writeText(out.value).then(done, select); } catch { select(); }
      return;
    } else return;
    save(); paint();
  });
  document.addEventListener("input", (event) => {
    if (event.target.dataset.blend !== undefined) event.target.closest("article").querySelector(".shots").style.setProperty("--blend", event.target.value / 100);
    if (event.target.dataset.passage !== undefined) { state.passages[+event.target.dataset.passage].note = event.target.value.trim(); save(); out.value = decisions(); return; }
    const id = event.target.dataset.note;
    if (!id) return;
    if (event.target.value.trim()) state.notes[id] = event.target.value.trim(); else delete state.notes[id];
    save(); paint();
  });
  // The button follows the selection; pressing it must not clear what was selected.
  document.addEventListener("selectionchange", () => {
    const chosen = getSelection(), text = chosen.toString().replace(/\\s+/g, " ").trim();
    const from = text && chosen.rangeCount ? chosen.getRangeAt(0) : null, start = from && (from.startContainer.nodeType === 1 ? from.startContainer : from.startContainer.parentElement);
    if (!start || !start.closest(".wrap") || start.closest("#decisions, input, textarea, button")) { comment.classList.remove("on"); return; }
    const box = from.getBoundingClientRect();
    picked = { quote: text.length > 400 ? text.slice(0, 400) + "…" : text, where: placeOf(from.startContainer) };
    comment.style.top = (scrollY + box.bottom + 6) + "px";
    comment.style.left = Math.max(8, Math.min(scrollX + box.left, scrollX + innerWidth - comment.offsetWidth - 24)) + "px";
    comment.classList.add("on");
  });
  comment.addEventListener("mousedown", (event) => event.preventDefault());
  list(); paint();
})();
`;

// A reviewer's sentence: escaped, with its `code` spans set as code.
const prose = (value) => esc(value).replace(/`([^`]+)`/g, "<code>$1</code>");
// A text of a few lines: a line that starts with "- " is an item of a list, any other a paragraph.
function lines(value, lead = "") {
  const out = [], items = [];
  const flush = () => { if (items.length) out.push(`<ul class="plain">${items.splice(0).map((item) => `<li>${prose(item)}</li>`).join("")}</ul>`); };
  for (const line of String(value).split("\n").map((l) => l.trim()).filter(Boolean))
    if (line.startsWith("- ")) items.push(line.slice(2)); else { flush(); out.push(`<p${out.length ? "" : lead}>${prose(line)}</p>`); }
  flush();
  return out.join("");
}
const sizeOf = (blocks) => blocks.reduce((sum, b) => sum + b.size, 0);
const of = (blocks, verdict) => blocks.filter((b) => b.verdict === verdict);
const chip = (b) => `<a class="chip v-${b.verdict}" href="#b${b.id}">B${b.id}</a>`;
const cite = (ids) => ids.map((id) => `<a href="#f${esc(id)}">${esc(id)}</a>`).join(", ");
const table = (head, rows) => `<div class="table"><table><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows.join("")}</table></div>`;
const TONE = { keep: "v-keep", fix: "v-fix", split: "v-fix", merge: "v-fix", remove: "v-remove" };

// The task, the verdict, how the change works now, the target and what to do: each under its own label, in the order a reader decides by.
function summary(review, { blocks }, t) {
  const total = sizeOf(blocks) || 1, { change } = review;
  const role = (label, content, tone = "") => `<div class="role ${tone}" data-where="${esc(t(label))}"><span class="label">${esc(t(label))}</span><div class="stack">${content}</div></div>`;
  return `
<section id="summary" class="roles">
  ${role("task", `<p>${prose(change.goal)}${change.why ? ` ${prose(change.why)}` : ""}</p>
    <ul class="plain">${change.parts.map((part) => `<li>${prose(part)}</li>`).join("")}</ul>
    <p class="sub">${esc(t("sources"))}: ${change.sources.map(prose).join("; ")}</p>`)}
  ${role("verdict", lines(review.verdict, ' class="lead"'), "conclusion")}
  ${role("now", `${lines(review.now)}
    <div class="share" role="img" aria-label="${esc(t("share"))}">${VERDICTS.map((v) => `<span class="v-${v}" style="width:${(100 * sizeOf(of(blocks, v)) / total).toFixed(2)}%"></span>`).join("")}</div>
    <div class="legend sub"><span>${esc(t("share"))}:</span>${VERDICTS.map((v) => `<span><span class="tag v-${v}">${esc(t(`verdict.${v}`))}</span> ${sizeOf(of(blocks, v))}</span>`).join("")}</div>`)}
  ${role("target", lines(review.target))}
  ${role("recommendation", `<p><strong>${prose(review.recommendation)}</strong></p>${review.steps?.length ? `<ol class="steps">${review.steps.map((step) =>
    `<li>${prose(step.text)}${step.findings?.length ? ` <span class="sub">(${cite(step.findings)})</span>` : ""}</li>`).join("")}</ol>` : ""}`, "actions")}
</section>`;
}

// What each requirement gets. "Met" is the reviewer's word, never read off a block; a missing test is not a failure.
function requirements({ blocks, requirements: listed }, t) {
  const status = (r) => [
    r.broken.length ? `<span class="tag v-remove">${esc(t("fails"))}</span> ${cite(r.broken)}`
      : r.met ? `<span class="tag v-keep">${esc(t("met"))}</span> <span class="sub">${esc(t(`evidence.${r.met}`))}</span>` : r.not_checked ? "" : `<span class="tag v-open">${esc(t("not-checked"))}</span>`,
    // What the reviewer did not check stands beside what they did, never inside the requirement's own text.
    r.not_checked ? `<span class="tag v-open">${esc(t("not-checked"))}</span> <span class="sub">${prose(r.not_checked)}</span>` : "",
    r.untested.length ? `<span class="tag v-fix">${esc(t("no-test"))}</span> ${cite(r.untested)}` : ""].filter(Boolean).join("<br>");
  const idle = blocks.filter((b) => !b.serves.length);
  return `
<section id="requirements" class="stack"><h2>${esc(t("requirements"))}</h2>
  ${table(["#", t("requirement"), t("source"), t("status"), t("blocks"), t("lines")], [
    ...listed.map((r) => `<tr data-where="${esc(`${t("requirement")} ${r.id}`)}"><td class="n">${esc(r.id)}</td><td>${prose(r.text)}${r.doubt ? `<div class="doubt"><strong>${esc(t("reconsider"))}:</strong> ${prose(r.doubt)}</div>` : ""}</td>`
      + `<td><span class="tag v-open">${esc(t(`source.${r.source}`))}</span></td><td class="state">${status(r)}</td><td>${r.blocks.map(chip).join("") || `<span class="sub">${esc(t("no-block"))}</span>`}</td><td class="n">${sizeOf(r.blocks)}</td></tr>`),
    ...(idle.length ? [`<tr><td></td><td colspan="3"><strong>${esc(t("idle"))}</strong></td><td>${idle.map(chip).join("")}</td><td class="n">${sizeOf(idle)}</td></tr>`] : [])])}
</section>`;
}

// Scenarios a person can run to see the change work: where to start, what to do and what to expect.
function checks(review, t) {
  if (!review.checks?.length) return "";
  return `
<section id="checks" class="stack"><h2>${esc(t("checks"))}</h2><p class="sub">${esc(t("checks-note"))}</p>
  ${table(["#", t("from"), t("do"), t("expect"), t("requirement")], review.checks.map((c, index) => `<tr data-where="${esc(`${t("checks")} ${index + 1}`)}"><td class="n">${index + 1}</td><td>${prose(c.from ?? "")}</td>`
    + `<td><ol>${c.do.map((step) => `<li>${prose(step)}</li>`).join("")}</ol></td><td>${prose(c.expect)}</td><td class="n">${(c.requirements ?? []).map(esc).join(", ")}</td></tr>`))}
</section>`;
}

// What the user sees: the pictures the reviewer was given, side by side or the result laid over the mockup, and each difference.
function screens({ screens: shown }, t) {
  if (!shown.length) return "";
  const shot = (name, picture) => !picture ? "" : `<figure class="${name}"><figcaption class="label">${esc(t(name))}</figcaption>`
    + `${picture.link ? `<a href="${esc(picture.link)}" target="_blank" rel="noopener">${esc(picture.link)}</a>` : `<img src="${picture.data}" alt="${esc(t(name))}">`}</figure>`;
  return `
<section id="screens" class="stack"><h2>${esc(t("screens"))}</h2>${shown.map((s, index) => `
  <article class="finding" data-where="${esc(`${t("screens")}: ${s.name}`)}">
    <h3>${esc(s.name)}</h3>
    <div class="pair shots">${shot("mockup", s.mockup)}${shot("before", s.before)}${shot("after", s.after)}</div>
    ${s.mockup?.data && s.after?.data ? `<div class="group act"><button type="button" data-overlay aria-pressed="false">${esc(t("overlay"))}</button>`
      + `<label class="group sub" for="blend-${index + 1}">${esc(t("result"))} <input type="range" id="blend-${index + 1}" data-blend min="0" max="100" value="50"></label></div>` : ""}
    ${s.differences.length ? `<ul class="plain">${s.differences.map((d) => `<li>${prose(d.what)}${d.why ? ` <span class="sub">${esc(t("reason"))}: ${prose(d.why)}</span>` : ""}`
      + `${d.finding === undefined ? "" : ` <span class="tag v-remove">${esc(t("finding"))}</span> ${cite([d.finding])}`}</li>`).join("")}</ul>` : ""}
    ${s.match ? `<p><span class="tag v-keep">${esc(t("matches"))}</span></p>` : ""}
    ${s.missing ? `<p><span class="tag v-open">${esc(t("not-compared"))}</span> ${prose(s.missing)}</p>` : ""}
  </article>`).join("")}
</section>`;
}

// The units as written and as they should be, each a diagram of who uses whom.
function structure({ units, target }, t) {
  if (!units.length) return "";
  const count = (blocks) => `${t("lines").toLowerCase()}: ${sizeOf(blocks)}`;
  const node = (u, look, meta, own) => ({ name: u.name, uses: u.uses, label: u.jobs.join(", "), tone: look, meta,
    href: own && u.blocks[0] ? `#b${u.blocks[0].id}` : undefined, share: own ? VERDICTS.map((v) => ({ tone: `v-${v}`, part: sizeOf(of(u.blocks, v)) })) : [] });
  const written = new Set(units.filter((u) => !u.existing).map((u) => u.name));
  const now = units.map((u) => u.existing ? node(u, "existing", t("existing-code")) : node(u, TONE[u.verdict], `${t(`verdict.${u.verdict}`)} · ${count(u.blocks)}`, true));
  const then = target.map((u) => u.existing ? node(u, "existing", t("existing-code")) : written.has(u.name) ? node(u, "v-keep", t("from-change")) : node(u, "new", t("to-write")));
  const figure = (title, nodes) => nodes.length ? `<figure><figcaption class="label">${esc(title)} · ${esc(t("units"))}: ${nodes.filter((n) => n.tone !== "existing").length}</figcaption>`
    + `<div class="scroll">${diagram(nodes, title)}</div></figure>` : "";
  return `
<section id="structure" class="stack"><h2>${esc(t("structure"))}</h2>
  <div class="pair">${figure(t("as-written"), now)}${figure(t("target"), then)}</div>
  <p class="sub">${esc(t("diagram-note"))}</p>
  ${table([t("unit"), t("jobs"), t("uses"), t("verdict")], units.filter((u) => !u.existing).map((u) => `<tr><td class="mono">${esc(u.name)}</td><td>${esc(u.jobs.join(", "))}</td>`
    + `<td class="mono">${esc(u.uses.join(", ")) || esc(t("nothing"))}</td><td><span class="tag ${TONE[u.verdict]}">${esc(t(`verdict.${u.verdict}`))}</span> ${cite(u.findings)}</td></tr>`))}
</section>`;
}

// Where the change lives: its files as a tree, each with the units in it and its blocks.
function tree(files, { blocks }, t) {
  const root = { dirs: new Map(), files: [] };
  for (const { path } of files) {
    const parts = path.split("/"), name = parts.pop();
    let at = root;
    for (const part of parts) { if (!at.dirs.has(part)) at.dirs.set(part, { dirs: new Map(), files: [] }); at = at.dirs.get(part); }
    at.files.push({ name, path });
  }
  const file = ({ name, path }) => {
    const own = blocks.filter((b) => b.path === path), units = [...new Set(own.map((b) => b.unit).filter(Boolean))];
    return `<li><div><span class="mono">${esc(name)}</span>${units.length ? `<span class="sub mono">${esc(units.join(", "))}</span>` : ""}<span>${own.map(chip).join(" ")}</span></div></li>`;
  };
  // A directory with nothing but one directory in it is shown on that directory's line.
  const dir = (name, node) => node.dirs.size === 1 && !node.files.length ? dir(`${name}/${[...node.dirs.keys()][0]}`, [...node.dirs.values()][0])
    : `<li><div class="mono sub">${esc(name)}/</div>${list(node)}</li>`;
  const list = (node) => `<ul>${[...node.dirs].map(([name, child]) => dir(name, child)).join("")}${node.files.map(file).join("")}</ul>`;
  return `<section id="files" class="stack"><h2>${esc(t("files"))}</h2><div class="tree">${list(root)}</div></section>`;
}

// The diff, file by file, cut into the blocks of the map.
function map(review, files, { blocks, owner }, t) {
  const shown = new Set(), finding = (id) => review.findings.find((f) => f.id === id);
  const decide = decider(t), verdict = (b) => `<span class="tag">${esc(t(`verdict.${b.verdict}`))}</span>`;
  const head = (b) => {
    if (shown.has(b.id)) return `<header><div class="row">${verdict(b)}<a href="#b${b.id}">B${b.id}</a><span class="sub">${esc(t("continued"))}</span></div></header>`;
    shown.add(b.id);
    return `<header><div class="row">${verdict(b)}<strong>B${b.id}</strong><span>${prose(b.does)}</span></div>`
      + `<div class="row sub"><span>${b.serves.length ? `${esc(t("serves"))} ${b.serves.map(esc).join(", ")}` : esc(t("serves-nothing"))}</span>`
      + `${b.unit ? `<span>${esc(t("in-unit"))} <span class="mono">${esc(b.unit)}</span></span>` : ""}<span class="mono">${esc(b.where)}</span></div>`
      + (b.findings.length ? `<ul>${b.findings.map((id) => `<li><a href="#f${esc(id)}">${esc(id)}. ${esc(finding(id).title)}</a>${decide(id)}</li>`).join("")}</ul>` : "")
      + `<input class="act" type="text" id="note-b${b.id}" data-note="b${b.id}" placeholder="${esc(t("note-block"))}" aria-label="${esc(t("note-block"))}: B${b.id}"></header>`;
  };
  const code = (path, run) => `<pre><code>${run.map((l) => `<span class="l ${l.kind}"><b>${l.kind === "del" ? l.old : l.new}</b><i>${{ add: "+", del: "−", ctx: " " }[l.kind]}</i>${highlight(l.text, path)}</span>`).join("")}</code></pre>`;
  const segment = (path, index, run) => {
    if (index === undefined) return `<div class="seg">${code(path, run)}</div>`;
    const b = blocks[index], first = !shown.has(b.id);
    return `<div class="seg v-${b.verdict}" data-block="${b.id}"${first ? ` id="b${b.id}"` : ""}>${head(b)}<details${run.length > 40 ? "" : " open"}><summary>${esc(t("lines"))}: ${run.length}</summary>${code(path, run)}</details></div>`;
  };
  const file = ({ path, hunks }) => {
    const parts = [];
    hunks.forEach((hunk, at) => {
      if (at) parts.push('<div class="gap">⋯</div>');
      let current, run = [], between = [];
      const flush = () => { if (run.length) parts.push(segment(path, current, run)); run = []; };
      const alone = () => { flush(); current = undefined; run = between; flush(); between = []; };
      for (const line of hunk) {
        if (line.kind === "ctx") { between.push(line); continue; }
        // A blank changed line belongs to no block of its own: it stays with the lines before it.
        const mine = owner.get(`${path}\n${address(line)}`) ?? (blank(line) ? current : undefined);
        // Unchanged lines inside one block stay in it; between two blocks they stand alone.
        if (mine === current && mine !== undefined) run.push(...between.splice(0));
        else { alone(); current = mine; }
        run.push(line);
      }
      alone();
    });
    const own = blocks.filter((b) => b.path === path);
    return `<div class="file"><header><strong class="mono">${esc(path)}</strong><span class="sub">${esc(t("lines")).toLowerCase()}: ${sizeOf(own)} · ${esc(t("blocks")).toLowerCase()}: ${own.length}</span></header>${parts.join("")}</div>`;
  };
  return files.map(file).join("\n    ");
}

function mechanisms(review, t) {
  if (!review.mechanisms?.length) return "";
  return `<section id="mechanisms" class="stack"><h2>${esc(t("mechanisms"))}</h2>
    <p class="sub">${mechanismCounts(review).map(([change, count]) => `${esc(t(`change.${change}`))}: ${count}`).join(" · ")}</p>${review.mechanisms.map((m) => `
    <article class="finding"><h3>${esc(m.name)}</h3>
    <div class="group sub"><span>${esc(t(`change.${m.change}`))}</span><span>${esc(t(`evidence.${m.evidence}`))}</span></div>
    <p><strong>${esc(t("units"))}:</strong> ${(m.units ?? []).map((name) => `<code>${esc(name)}</code>`).join(", ")}
      ${(m.findings ?? []).map((id) => `<a href="#f${esc(id)}">${esc(t("finding"))} ${esc(id)}</a>`).join("; ")}</p>
    ${["purpose", "basis", "benefit", "cost", "decision"].map((key) => `<p><strong>${esc(t(key))}:</strong> ${prose(m[key])}</p>`).join("")}
    </article>`).join("")}</section>`;
}

const decider = (t) => (id) => `<span class="decide group act" data-finding="${esc(id)}"><button type="button" value="apply">${esc(t("apply"))}</button><button type="button" value="skip">${esc(t("skip"))}</button></span>`;

export function page(review, files, model) {
  const t = labelsOf(review), decide = decider(t);
  const names = (label, ids) => ids?.length ? ` <strong>${esc(t(label))} ${ids.map(esc).join(", ")}.</strong>` : "";
  const findings = review.findings.map((f) => `
  <article class="finding" id="f${esc(f.id)}" data-where="${esc(`${t("finding")} ${f.id}`)}">
    <h3>${esc(f.id)}. ${esc(f.title)}</h3>
    <div class="group sub"><span>${esc(t(`direction.${f.direction}`))}</span><span>${esc(t(`evidence.${f.evidence}`))}</span><code>${esc(f.at)}</code>${model.blocks.filter((b) => b.findings.includes(f.id)).map(chip).join("")}</div>
    <p>${prose(f.what)}${names("breaks", f.breaks)}${names("untested", f.untested)}</p>
    <p><strong>${esc(t("shown-by"))}:</strong> ${prose(f.shown_by)}</p>
    <p><strong>${esc(t("fix"))}:</strong> ${prose(f.fix)}</p>
    ${decide(f.id)}
    <input class="act" type="text" id="note-f${esc(f.id)}" data-note="f${esc(f.id)}" placeholder="${esc(t("note-finding"))}" aria-label="${esc(t("note-finding"))}: ${esc(f.id)}">
  </article>`).join("");
  // An idea is decided like a finding, under an id of its own, and reported apart from them.
  const ideas = (review.ideas ?? []).map((idea, index) => ({ ...idea, id: `i${index + 1}` }));
  const offered = ideas.map((idea) => `
  <article class="finding idea" id="${idea.id}" data-where="${esc(`${t("idea")}: ${idea.title}`)}">
    <h3><span class="tag accent">${esc(t("idea"))}</span> ${esc(idea.title)}</h3>
    ${idea.at ? `<div class="group sub"><code>${esc(idea.at)}</code></div>` : ""}
    <p>${prose(idea.text)}</p>
    ${decide(idea.id)}
    <input class="act" type="text" id="note-${idea.id}" data-note="${idea.id}" placeholder="${esc(t("note-idea"))}" aria-label="${esc(t("note-idea"))}: ${esc(idea.title)}">
  </article>`).join("");
  // The page's script reads what it needs from here: the review's own name for its stored decisions, and the words it writes.
  const data = { title: review.title, range: review.range, key: model.key, findings: review.findings.map(({ id, title }) => ({ id, title })),
    ideas: ideas.map(({ id, title }) => ({ id, title })),
    blocks: model.blocks.map(({ id, path, where, findings: cited }) => ({ id, path, where, findings: cited })),
    labels: { title: t("out.title"), apply: t("out.apply"), skip: t("out.skip"), ideas: t("out.ideas"), ideaNotes: t("out.idea-notes"), open: t("out.open"), blocks: t("out.blocks"),
      passages: t("out.passages"), passagesTitle: t("passages"), notePassage: t("note-passage"), remove: t("remove"), decided: t("decided", "{n}"), copy: t("copy"), copied: t("copied") } };
  const drawn = structure(model, t), link = (id, label) => `<a href="#${id}">${esc(t(label))}</a>`;
  return `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t("kind"))}: ${esc(review.title)}</title>
<style>${STYLE}</style>
<div class="wrap">
<header class="stack"><span class="label">${esc(t("kind"))}</span><h1>${esc(review.title)}</h1></header>
${summary(review, model, t)}
${requirements(model, t)}
${mechanisms(review, t)}
${checks(review, t)}
${screens(model, t)}
${drawn}
${tree(files, model, t)}
<section class="stack">
  <div class="bar">
    <nav>${link("summary", "summary")}${link("requirements", "requirements")}${review.mechanisms?.length ? link("mechanisms", "mechanisms") : ""}${review.checks?.length ? link("checks", "checks") : ""}${model.screens.length ? link("screens", "screens") : ""}${drawn ? link("structure", "structure") : ""}${link("files", "files")}${link("map", "map")}${link("findings", "findings")}${offered ? link("ideas", "ideas") : ""}${link("decisions", "decisions")}</nav>
    <span class="group act"><span class="sub">${esc(t("show"))}</span><button type="button" data-show="all" aria-pressed="true">${esc(t("all"))}</button>${VERDICTS.map((v) => `<button type="button" data-show="${v}" aria-pressed="false">${esc(t(`verdict.${v}`))}</button>`).join("")}</span>
    <span class="sub act" id="progress"></span>
  </div>
  <div id="map" class="map stack" data-show="all" style="--kept: ${esc(JSON.stringify(t("kept-by-you")))}">
    <h2>${esc(t("map"))}</h2>
    ${map(review, files, model, t)}
  </div>
</section>
<section id="findings" class="stack"><h2>${esc(t("findings"))}</h2>${findings || `<p>${esc(t("none"))}</p>`}</section>
${offered ? `<section id="ideas" class="stack"><h2>${esc(t("ideas"))}</h2><p class="sub">${esc(t("ideas-note"))}</p>${offered}</section>` : ""}
<section class="stack"><h2>${esc(t("questions"))}</h2>${review.questions?.length ? `<ul class="plain">${review.questions.map((q) => `<li><code>${esc(q.at)}</code> ${prose(q.text)}</li>`).join("")}</ul>` : `<p>${esc(t("none"))}</p>`}
  <h2>${esc(t("coverage"))}</h2><p>${prose(review.coverage || t("none"))}</p></section>
<section id="decisions" class="stack act"><h2>${esc(t("decisions"))}</h2>
  <p class="sub">${esc(t("decisions-note"))}</p>
  <div class="group"><button type="button" id="copy">${esc(t("copy"))}</button><button type="button" id="apply-all">${esc(t("apply-all"))}</button><button type="button" id="clear">${esc(t("clear"))}</button></div>
  <div id="passages" class="stack"></div>
  <textarea id="out" readonly aria-label="${esc(t("decisions-text"))}"></textarea></section>
<button type="button" id="comment" class="floating">${esc(t("comment"))}</button>
<footer class="sub mono">${esc(review.range)} · ${model.key}</footer>
</div>
<script id="data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<script>${SCRIPT}</script>
`;
}
