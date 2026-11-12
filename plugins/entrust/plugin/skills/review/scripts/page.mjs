// A checked review as a page: one file with no dependencies, readable without scripts. With them, the author
// marks each finding to apply or skip, and the page writes the decisions out as text to hand back.
import { address, blank } from "./diff.mjs";
import { diagram } from "./diagram.mjs";
import { highlight } from "./highlight.mjs";
import { VERDICTS } from "./review.mjs";
import { esc } from "./text.mjs";

const STYLE = `
/* One column: what the change is, the verdict, the structure as two diagrams, the diff cut into blocks with a stripe for each verdict, the findings, the author's decisions. */
:root { --bg: #f5f6f9; --surface: #ffffff; --fg: #1b2230; --muted: #5d6879; --line: #d8dde6; --accent: #3450c0; --code: #fafbfd; --string: #0c6b78; --number: #7b3fae;
  --keep: #1c7449; --keep-bg: #e4f3ea; --fix: #8f5b00; --fix-bg: #faefd3; --remove: #b02e28; --remove-bg: #fae5e2;
  --text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #11151c; --surface: #19202a; --fg: #e2e7ee; --muted: #97a3b4;
  --line: #2b3441; --accent: #93a8ff; --code: #141a22; --string: #74cbd6; --number: #c9a2f2; --keep: #62c995; --keep-bg: #163225; --fix: #e3b252; --fix-bg: #382c10;
  --remove: #f18d83; --remove-bg: #3e1f1c; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #11151c; --surface: #19202a; --fg: #e2e7ee; --muted: #97a3b4; --line: #2b3441; --accent: #93a8ff;
  --code: #141a22; --string: #74cbd6; --number: #c9a2f2; --keep: #62c995; --keep-bg: #163225; --fix: #e3b252; --fix-bg: #382c10; --remove: #f18d83; --remove-bg: #3e1f1c; color-scheme: dark }
* { box-sizing: border-box }
body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.5 var(--text) }
.wrap { max-width: 68rem; margin: 0 auto; padding-block: 1.25rem 4rem; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));
  display: flex; flex-direction: column; gap: 2rem }
h1 { font-size: 1.5rem; line-height: 1.25; margin: 0; text-wrap: balance }
h2 { font-size: 1.1rem; margin: 0 0 .75rem }
h3 { font-size: 1rem; margin: 0 }
p { margin: 0; max-width: 72ch }
a { color: var(--accent) }
code, pre, .mono { font-family: var(--mono); font-size: .86em }
.sub { color: var(--muted); font-size: .9rem }
.stack { display: flex; flex-direction: column; gap: .75rem }
.target { border: 1px solid var(--line); background: var(--surface); padding: .75rem 1rem; white-space: pre-wrap }
.label { font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); font-weight: 600 }
.v-keep { --v: var(--keep); --v-bg: var(--keep-bg) } .v-fix { --v: var(--fix); --v-bg: var(--fix-bg) } .v-remove { --v: var(--remove); --v-bg: var(--remove-bg) }
.tag { display: inline-block; padding: 0 .45rem; border-radius: 3px; background: var(--v-bg); color: var(--v); font-size: .78rem; font-weight: 650; white-space: nowrap }
.share { display: flex; height: .9rem; border-radius: 3px; overflow: hidden; background: var(--line) }
.share span { background: var(--v) }
.legend { display: flex; flex-wrap: wrap; gap: .25rem 1rem; font-variant-numeric: tabular-nums }
.table { overflow-x: auto; background: var(--surface); border: 1px solid var(--line) }
table { border-collapse: collapse; width: 100%; font-size: .93rem }
th, td { text-align: left; vertical-align: top; padding: .45rem .7rem; border-bottom: 1px solid var(--line) }
tr:last-child td { border-bottom: 0 }
th { font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted) }
td.n { font-variant-numeric: tabular-nums; white-space: nowrap }
.chip { display: inline-block; margin: 0 .25rem .2rem 0; padding: 0 .4rem; border: 1px solid var(--v); border-radius: 3px; color: var(--v); font-size: .8rem; text-decoration: none; font-weight: 600 }
.bar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 1px solid var(--line); padding-block: .5rem;
  display: flex; flex-wrap: wrap; gap: .4rem 1rem; align-items: center; font-size: .9rem }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg) }
.bar nav, .group { display: flex; flex-wrap: wrap; gap: .35rem .75rem; align-items: center }
button { font: inherit; font-size: .85rem; color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .15rem .6rem; cursor: pointer }
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
.seg.overruled .tag::after { content: " → kept by you" }
.seg:target > header, .finding:target { outline: 2px solid var(--accent); outline-offset: -2px }
summary { padding: .15rem .8rem; font-size: .8rem; color: var(--muted); cursor: pointer; background: var(--code) }
pre { margin: 0; overflow-x: auto; background: var(--code); padding: .3rem 0; line-height: 1.45 }
pre code { display: inline-block; min-width: 100% }
.l { display: block; padding-right: .8rem; white-space: pre }
.l b { display: inline-block; width: 3.2em; text-align: right; color: var(--muted); font-weight: 400; user-select: none }
.l i { display: inline-block; width: 1.6em; text-align: center; font-style: normal; color: var(--muted); user-select: none }
.l.ctx, .l.del { color: var(--muted) }
.seg[data-block] .l.add, .seg[data-block] .l.del { background: color-mix(in srgb, var(--v-bg) 60%, transparent) }
.l.del i, .l.add i { color: var(--fg); font-weight: 700 }
.gap { padding: 0 .8rem; color: var(--muted); font-size: .8rem; background: var(--code) }
.map[data-show="keep"] .seg:not(.v-keep), .map[data-show="fix"] .seg:not(.v-fix), .map[data-show="remove"] .seg:not(.v-remove),
.map[data-show]:not([data-show="all"]) .gap { display: none }
.finding { background: var(--surface); border: 1px solid var(--line); padding: .8rem 1rem; display: flex; flex-direction: column; gap: .5rem; scroll-margin-top: 4rem; min-width: 0 }
.finding p { overflow-wrap: anywhere }
input[type="text"] { font: inherit; font-size: .88rem; color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .2rem .5rem; width: 100%; max-width: 40rem }
textarea { width: 100%; min-height: 14rem; font: .85rem/1.45 var(--mono); color: var(--fg); background: var(--surface); border: 1px solid var(--line); padding: .6rem .8rem }
.act { display: none }
.js .act { display: flex }
.js input.act { display: block }
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth } }
.lead { font-size: 1.08rem; font-weight: 600 }
.accent { --v: var(--accent); --v-bg: color-mix(in srgb, var(--accent) 12%, transparent) }
.callout { border: 1px solid var(--accent); background: color-mix(in srgb, var(--accent) 7%, var(--surface)); padding: .75rem 1rem }
.idea { border-color: var(--accent) }
.plain { margin: 0; padding-left: 1.2rem; max-width: 72ch }
.t-c { color: var(--muted); font-style: italic } .t-s { color: var(--string) } .t-n { color: var(--number) } .t-k { color: var(--accent) }
.l.ctx [class^="t-"] { color: inherit }
.pair { display: flex; flex-wrap: wrap; gap: 1.25rem 2.5rem; align-items: flex-start }
figure { margin: 0; min-width: 0; max-width: 100%; display: flex; flex-direction: column; gap: .5rem }
.scroll { overflow-x: auto; max-width: 100% }
.scroll svg { display: block; max-width: none }
.unit .box { fill: var(--surface); stroke: var(--v, var(--muted)); stroke-width: 1.5 }
.unit.existing .box { stroke-dasharray: 4 3 }
.unit.new .box { stroke: var(--accent) }
.unit text { fill: var(--fg); font: 600 12px var(--mono) }
.unit .jobs, .unit .meta { fill: var(--muted); font: 11.5px var(--text) }
.unit .part { fill: var(--v) }
.edge { fill: none; stroke: var(--muted); stroke-width: 1.2 }
.head { fill: var(--muted) }
@media (max-width: 40rem) { .bar { position: static } }
`;

const SCRIPT = `
(() => {
  const data = JSON.parse(document.getElementById("data").textContent), key = "review-report:" + data.title + ":" + data.range;
  const all = (selector) => [...document.querySelectorAll(selector)];
  const map = document.getElementById("map"), out = document.getElementById("out"), progress = document.getElementById("progress");
  let state = { findings: {}, notes: {} };
  try { state = { ...state, ...JSON.parse(localStorage.getItem(key) || "{}") }; } catch {}
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} };
  document.documentElement.classList.add("js");

  function decisions() {
    const note = (id) => state.notes[id] ? " — " + state.notes[id] : "";
    const of = (value) => data.findings.filter((f) => state.findings[f.id] === value).map((f) => "- " + f.id + ". " + f.title + note("f" + f.id));
    const open = data.findings.filter((f) => !state.findings[f.id]).map((f) => f.id);
    const blocks = data.blocks.filter((b) => state.notes["b" + b.id]).map((b) => "- " + b.path + " " + b.where + ": " + state.notes["b" + b.id]);
    const taken = data.ideas.filter((i) => state.findings[i.id] === "apply").map((i) => "- " + i.title + note(i.id));
    const part = (title, lines) => lines.length ? ["", title, ...lines] : [];
    return ["Decisions on the review of \\"" + data.title + "\\" (" + data.range + ")", ...part("Apply:", of("apply")), ...part("Do not apply:", of("skip")), ...part("Ideas to take:", taken),
      ...(open.length ? ["", "Not decided: " + open.join(", ")] : []), ...part("Notes on blocks:", blocks)].join("\\n");
  }

  function paint() {
    for (const group of all(".decide")) for (const button of group.querySelectorAll("button"))
      button.setAttribute("aria-pressed", String(state.findings[group.dataset.finding] === button.value));
    for (const block of data.blocks) {
      const kept = block.findings.length > 0 && block.findings.every((f) => state.findings[f] === "skip");
      for (const part of all('[data-block="' + block.id + '"]')) part.classList.toggle("overruled", kept);
    }
    for (const input of all("[data-note]")) if (document.activeElement !== input) input.value = state.notes[input.dataset.note] || "";
    progress.textContent = data.findings.filter((f) => state.findings[f.id]).length + " of " + data.findings.length + " findings decided";
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
    } else if (button.id === "apply-all") for (const f of data.findings) state.findings[f.id] = "apply";
    else if (button.id === "clear") state = { findings: {}, notes: {} };
    else if (button.id === "copy") {
      const done = () => { button.textContent = "Copied"; setTimeout(() => { button.textContent = "Copy"; }, 1500); };
      const select = () => { out.focus(); out.select(); };
      try { navigator.clipboard.writeText(out.value).then(done, select); } catch { select(); }
      return;
    } else return;
    save(); paint();
  });
  document.addEventListener("input", (event) => {
    const id = event.target.dataset.note;
    if (!id) return;
    if (event.target.value.trim()) state.notes[id] = event.target.value.trim(); else delete state.notes[id];
    save(); paint();
  });
  paint();
})();
`;

// A reviewer's sentence: escaped, with its `code` spans set as code.
const prose = (value) => esc(value).replace(/`([^`]+)`/g, "<code>$1</code>");
const some = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const lines = (n) => some(n, "line");
const sizeOf = (blocks) => blocks.reduce((sum, b) => sum + b.size, 0);
const of = (blocks, verdict) => blocks.filter((b) => b.verdict === verdict);
const chip = (b) => `<a class="chip v-${b.verdict}" href="#b${b.id}">B${b.id}</a>`;
const cite = (ids) => ids.map((id) => `<a href="#f${esc(id)}">${esc(id)}</a>`).join(", ");
const decide = (id) => `<span class="decide group act" data-finding="${esc(id)}"><button type="button" value="apply">Apply</button><button type="button" value="skip">Skip</button></span>`;
const table = (head, rows) => `<div class="table"><table><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.join("")}</table></div>`;

// What the change is and what the reviewer makes of it.
function summary(review, { blocks, requirements }) {
  const total = sizeOf(blocks) || 1, { change } = review;
  // A requirement fails when a finding says so. One with no block and no such finding is left to code the change did not touch.
  const status = (r) => r.broken.length ? `<span class="tag v-remove">fails</span> ${cite(r.broken)}`
    : r.blocks.length ? '<span class="tag v-keep">met</span>' : '<span class="sub">no block, and no finding says it fails</span>';
  const idle = blocks.filter((b) => !b.serves.length);
  return `
<section id="summary" class="stack">
  <div class="stack"><span class="label">The change</span><p class="lead">${prose(change.goal)}</p>${change.why ? `<p>${prose(change.why)}</p>` : ""}
    <ul class="plain">${change.parts.map((part) => `<li>${prose(part)}</li>`).join("")}</ul>
    <p class="sub">Sources: ${change.sources.map(prose).join("; ")}</p></div>
  <div class="stack"><span class="label">Verdict</span><p>${prose(review.verdict)}</p></div>
  <div class="callout stack"><span class="label">Recommendation</span><p>${prose(review.recommendation)}</p></div>
  <div class="stack"><span class="label">Target: the smallest clean solution</span><div class="target">${prose(review.target)}</div></div>
  <div class="stack"><span class="label">What the reviewer would do with the ${lines(sizeOf(blocks))} of the change</span>
    <div class="share" role="img" aria-label="Share of changed lines by verdict">${VERDICTS.map((v) => `<span class="v-${v}" style="width:${(100 * sizeOf(of(blocks, v)) / total).toFixed(2)}%"></span>`).join("")}</div>
    <div class="legend">${VERDICTS.map((v) => `<span><span class="tag v-${v}">${v}</span> ${lines(sizeOf(of(blocks, v)))} in ${some(of(blocks, v).length, "block")}</span>`).join("")}</div></div>
  <div class="stack"><span class="label">What each requirement gets</span>
  ${table(["#", "Requirement", "Status", "Blocks that serve it", "Lines"], [
    ...requirements.map((r) => `<tr><td class="n">${esc(r.id)}</td><td>${prose(r.text)}</td><td>${status(r)}</td><td>${r.blocks.map(chip).join("") || "none"}</td><td class="n">${sizeOf(r.blocks)}</td></tr>`),
    `<tr><td></td><td><strong>Nothing</strong>: no requirement would fail without these</td><td></td><td>${idle.map(chip).join("") || "none"}</td><td class="n">${sizeOf(idle)}</td></tr>`])}</div>
</section>`;
}

// The units as written and as they should be, each a diagram of who uses whom.
function structure({ units, target }) {
  if (!units.length) return "";
  const tone = { keep: "v-keep", split: "v-fix", merge: "v-fix", remove: "v-remove" };
  const node = (u, look, meta, own) => ({ name: u.name, uses: u.uses, label: u.jobs.join(", "), tone: look, meta,
    href: own && u.blocks[0] ? `#b${u.blocks[0].id}` : undefined, share: own ? VERDICTS.map((v) => ({ tone: `v-${v}`, part: sizeOf(of(u.blocks, v)) })) : [] });
  const written = new Set(units.filter((u) => !u.existing).map((u) => u.name));
  const now = units.map((u) => u.existing ? node(u, "existing", "existing code") : node(u, tone[u.verdict], `${u.verdict} · ${lines(sizeOf(u.blocks))}`, true));
  const then = target.map((u) => u.existing ? node(u, "existing", "existing code") : written.has(u.name) ? node(u, "v-keep", "from the change") : node(u, "new", "to write"));
  const figure = (title, nodes) => nodes.length ? `<figure><figcaption class="label">${title}: ${some(nodes.filter((n) => n.tone !== "existing").length, "unit")}</figcaption><div class="scroll">${diagram(nodes, title)}</div></figure>` : "";
  return `
<section id="structure" class="stack"><h2>Structure</h2>
  <div class="pair">${figure("As written", now)}${figure("Target", then)}</div>
  <p class="sub">An arrow runs from a unit to what it uses. A dashed outline is code the change did not touch; the bar along a unit's foot is the share of its lines to keep, fix and remove.</p>
  ${table(["Unit", "Jobs", "Uses", "Verdict"], units.filter((u) => !u.existing).map((u) => `<tr><td class="mono">${esc(u.name)}</td><td>${esc(u.jobs.join(", "))}</td>`
    + `<td class="mono">${esc(u.uses.join(", ")) || "nothing"}</td><td><span class="tag ${tone[u.verdict]}">${u.verdict}</span> ${cite(u.findings)}</td></tr>`))}
</section>`;
}

// The diff, file by file, cut into the blocks of the map.
function map(review, files, { blocks, owner }) {
  const shown = new Set(), finding = (id) => review.findings.find((f) => f.id === id);
  const head = (b) => {
    if (shown.has(b.id)) return `<header><div class="row"><span class="tag">${b.verdict}</span><a href="#b${b.id}">B${b.id}</a><span class="sub">continued</span></div></header>`;
    shown.add(b.id);
    return `<header><div class="row"><span class="tag">${b.verdict}</span><strong>B${b.id}</strong><span>${prose(b.does)}</span></div>`
      + `<div class="row sub"><span>${b.serves.length ? `Serves requirement${b.serves.length > 1 ? "s" : ""} ${b.serves.map(esc).join(", ")}` : "Serves nothing"}</span>`
      + `${b.unit ? `<span>in <span class="mono">${esc(b.unit)}</span></span>` : ""}<span class="mono">${esc(b.where)}</span></div>`
      + (b.findings.length ? `<ul>${b.findings.map((id) => `<li><a href="#f${esc(id)}">${esc(id)}. ${esc(finding(id).title)}</a>${decide(id)}</li>`).join("")}</ul>` : "")
      + `<input class="act" type="text" id="note-b${b.id}" data-note="b${b.id}" placeholder="Your note on this block" aria-label="Your note on block ${b.id}"></header>`;
  };
  const code = (path, run) => `<pre><code>${run.map((l) => `<span class="l ${l.kind}"><b>${l.kind === "del" ? l.old : l.new}</b><i>${{ add: "+", del: "−", ctx: " " }[l.kind]}</i>${highlight(l.text, path)}</span>`).join("")}</code></pre>`;
  const segment = (path, index, run) => {
    if (index === undefined) return `<div class="seg">${code(path, run)}</div>`;
    const b = blocks[index], first = !shown.has(b.id);
    return `<div class="seg v-${b.verdict}" data-block="${b.id}"${first ? ` id="b${b.id}"` : ""}>${head(b)}<details${run.length > 40 ? "" : " open"}><summary>${lines(run.length)}</summary>${code(path, run)}</details></div>`;
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
    return `<div class="file"><header><strong class="mono">${esc(path)}</strong><span class="sub">${lines(sizeOf(own))} in ${some(own.length, "block")}</span></header>${parts.join("")}</div>`;
  };
  return files.map(file).join("\n    ");
}

export function page(review, files, model) {
  const findings = review.findings.map((f) => `
  <article class="finding" id="f${esc(f.id)}">
    <h3>${esc(f.id)}. ${esc(f.title)}</h3>
    <div class="group sub"><span>${esc(f.direction)}</span><span>${esc(f.evidence)}</span><code>${esc(f.at)}</code>${model.blocks.filter((b) => b.findings.includes(f.id)).map(chip).join("")}</div>
    <p>${prose(f.what)}${f.breaks?.length ? ` <strong>Breaks requirement ${f.breaks.map(esc).join(", ")}.</strong>` : ""}</p>
    <p><strong>Fix:</strong> ${prose(f.fix)}</p>
    ${decide(f.id)}
    <input class="act" type="text" id="note-f${esc(f.id)}" data-note="f${esc(f.id)}" placeholder="Your note on this finding" aria-label="Your note on finding ${esc(f.id)}">
  </article>`).join("");
  // An idea is decided like a finding, under an id of its own, and reported apart from them.
  const ideas = (review.ideas ?? []).map((idea, index) => ({ ...idea, id: `i${index + 1}` }));
  const offered = ideas.map((idea) => `
  <article class="finding idea" id="${idea.id}">
    <h3><span class="tag accent">idea</span> ${esc(idea.title)}</h3>
    ${idea.at ? `<div class="group sub"><code>${esc(idea.at)}</code></div>` : ""}
    <p>${prose(idea.text)}</p>
    ${decide(idea.id)}
    <input class="act" type="text" id="note-${idea.id}" data-note="${idea.id}" placeholder="Your note on this idea" aria-label="Your note on this idea">
  </article>`).join("");
  const data = { title: review.title, range: review.range, findings: review.findings.map(({ id, title }) => ({ id, title })),
    ideas: ideas.map(({ id, title }) => ({ id, title })),
    blocks: model.blocks.map(({ id, path, where, findings: cited }) => ({ id, path, where, findings: cited })) };
  const drawn = structure(model);
  return `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Review of ${esc(review.title)}</title>
<style>${STYLE}</style>
<div class="wrap">
<header class="stack"><h1>Review of ${esc(review.title)}</h1><span class="sub mono">${esc(review.range)}</span></header>
${summary(review, model)}
${drawn}
<section class="stack">
  <div class="bar">
    <nav><a href="#summary">Summary</a>${drawn ? '<a href="#structure">Structure</a>' : ""}<a href="#map">Change map</a><a href="#findings">Findings</a>${offered ? '<a href="#ideas">Ideas</a>' : ""}<a href="#decisions">Decisions</a></nav>
    <span class="group act"><span class="sub">Show</span>${["all", ...VERDICTS].map((v) => `<button type="button" data-show="${v}" aria-pressed="${v === "all"}">${v}</button>`).join("")}</span>
    <span class="sub act" id="progress"></span>
  </div>
  <div id="map" class="map stack" data-show="all">
    <h2>Change map</h2>
    ${map(review, files, model)}
  </div>
</section>
<section id="findings" class="stack"><h2>Findings</h2>${findings || "<p>none</p>"}</section>
${offered ? `<section id="ideas" class="stack"><h2>Ideas</h2><p class="sub">Not needed for the change to be accepted.</p>${offered}</section>` : ""}
<section class="stack"><h2>Questions and oddities</h2>${review.questions?.length ? `<ul class="plain">${review.questions.map((q) => `<li><code>${esc(q.at)}</code> ${prose(q.text)}</li>`).join("")}</ul>` : "<p>none</p>"}
  <h2>Coverage</h2><p>${prose(review.coverage || "none")}</p></section>
<section id="decisions" class="stack act"><h2>Decisions</h2>
  <p class="sub">Mark each finding Apply or Skip, add notes where you disagree, then hand this text back to whoever makes the change.</p>
  <div class="group"><button type="button" id="copy">Copy</button><button type="button" id="apply-all">Apply all</button><button type="button" id="clear">Clear</button></div>
  <textarea id="out" readonly aria-label="Your decisions as text"></textarea></section>
</div>
<script id="data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<script>${SCRIPT}</script>
`;
}
