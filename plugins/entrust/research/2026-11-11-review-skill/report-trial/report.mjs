#!/usr/bin/env node
// Trial: a review written as data becomes a page its author can decide on.
//
//   node report.mjs lines <range>          print every changed line of `git diff <range>` with its address
//   node report.mjs render <review.json>   check the review against its diff, write <review>.html beside it
//                                          and print the review as markdown
//
// Run it in the repository under review. A line's address is its number in the new file for an added line and
// in the old file for a removed one. `render` refuses a review whose change map leaves a changed line out, puts
// one in two blocks or names an id nothing defines, and lists every such fault: the rule that every changed
// line belongs to one block is checked here, not taken on trust. The page is one file with no dependencies; it
// reads without scripts, and with them it records which findings the author applies and writes that out as
// text to hand back.

import { execFileSync } from "node:child_process";
import fs from "node:fs";

const VERDICTS = ["keep", "fix", "remove"];
const DIRECTIONS = ["behavior", "necessity", "design", "tests"];
const EVIDENCE = ["ran", "traced", "judgment"];

// The files of a diff, each a list of hunks, each a list of lines { kind: add | del | ctx, old, new, text }.
function diffOf(range) {
  if (typeof range !== "string" || !/^[^-\s]\S*$/.test(range)) throw new Error(`"${range}" is not a git range such as HEAD~1..HEAD`);
  const out = execFileSync("git", ["-c", "core.quotepath=off", "diff", "--no-color", "--no-ext-diff", "--no-renames", "-U3", range, "--"],
    { encoding: "utf8", maxBuffer: 1 << 28 });
  const files = [];
  let file, hunk, oldNo = 0, newNo = 0, oldLeft = 0, newLeft = 0;
  for (const line of out.split("\n")) {
    if (oldLeft > 0 || newLeft > 0) {
      const kind = { " ": "ctx", "+": "add", "-": "del" }[line[0]];
      if (!kind) continue; // "\ No newline at end of file"
      const entry = { kind, text: line.slice(1) };
      if (kind !== "add") { entry.old = oldNo++; oldLeft--; }
      if (kind !== "del") { entry.new = newNo++; newLeft--; }
      hunk.push(entry);
      continue;
    }
    const header = /^diff --git a\/(.*) b\/\1$/.exec(line), at = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (header) files.push(file = { path: header[1], hunks: [] });
    else if (at) { [oldNo, oldLeft, newNo, newLeft] = [+at[1], +(at[2] ?? 1), +at[3], +(at[4] ?? 1)]; file.hunks.push(hunk = []); }
  }
  return files.filter((f) => f.hunks.length);
}

const changedLines = (file) => file.hunks.flat().filter((l) => l.kind !== "ctx");
const address = (line) => line.kind === "add" ? `+${line.new}` : `-${line.old}`;
const blank = (line) => line.text.trim() === "";

// "3, 10-16" as [3, 10, 11, ... 16]; "all" as every line there is.
function numbers(spec, all) {
  if (spec === undefined || spec === "") return [];
  if (spec === "all") return all;
  return String(spec).split(",").flatMap((part) => {
    const m = /^\s*(\d+)(?:\s*-\s*(\d+))?\s*$/.exec(part);
    if (!m) throw new Error(`"${spec}" is not a list of lines such as "3, 10-16", or "all"`);
    return Array.from({ length: +(m[2] ?? m[1]) - +m[1] + 1 }, (_, i) => +m[1] + i);
  });
}

// [3, 4, 5, 9] as "3-5, 9".
function compact(list) {
  const runs = [];
  for (const n of [...list].sort((a, b) => a - b)) {
    const last = runs.at(-1);
    if (last && n === last[1] + 1) last[1] = n; else runs.push([n, n]);
  }
  return runs.map(([a, b]) => a === b ? `${a}` : `${a}-${b}`).join(", ");
}

// The faults of a review as data, and which block owns each changed line ("path\n+12" -> block index).
function check(review, files) {
  const errors = [], owner = new Map(), text = (v) => typeof v === "string" && v.trim() !== "";
  for (const field of ["title", "range", "verdict", "target"]) if (!text(review[field])) errors.push(`"${field}" is missing`);
  for (const field of ["requirements", "findings", "blocks"]) if (!Array.isArray(review[field])) errors.push(`"${field}" is not a list`);
  if (errors.length) return { errors, owner };

  const ids = (list, name) => {
    const seen = new Set();
    for (const item of list) { if (seen.has(item.id)) errors.push(`${name} ${item.id} appears twice`); seen.add(item.id); }
    return seen;
  };
  const requirements = ids(review.requirements, "requirement"), findings = ids(review.findings, "finding");
  for (const r of review.requirements) if (!text(r.text)) errors.push(`requirement ${r.id} has no text`);
  for (const f of review.findings) {
    for (const field of ["title", "at", "what", "fix"]) if (!text(f[field])) errors.push(`finding ${f.id} has no "${field}"`);
    if (!DIRECTIONS.includes(f.direction)) errors.push(`finding ${f.id}: direction is one of ${DIRECTIONS.join(", ")}`);
    if (!EVIDENCE.includes(f.evidence)) errors.push(`finding ${f.id}: evidence is one of ${EVIDENCE.join(", ")}`);
  }

  review.blocks.forEach((block, index) => {
    const name = `block ${index + 1}`, file = files.find((f) => f.path === block.path);
    if (!file) return errors.push(`${name}: "${block.path}" is not a file of the diff`);
    if (!text(block.does)) errors.push(`${name} has no "does"`);
    if (!VERDICTS.includes(block.verdict)) errors.push(`${name}: verdict is one of ${VERDICTS.join(", ")}`);
    for (const id of block.serves ?? []) if (!requirements.has(id)) errors.push(`${name} serves requirement ${id}, which is not listed`);
    for (const id of block.findings ?? []) if (!findings.has(id)) errors.push(`${name} names finding ${id}, which is not listed`);
    if (block.verdict !== "keep" && !(block.findings ?? []).length) errors.push(`${name} is to ${block.verdict} and names no finding`);
    let own = 0;
    for (const [kind, field] of [["add", "added"], ["del", "removed"]]) {
      const lines = changedLines(file).filter((l) => l.kind === kind);
      let wanted;
      try { wanted = new Set(numbers(block[field], lines.map((l) => l.new ?? l.old))); }
      catch (error) { errors.push(`${name}: ${error.message}`); continue; }
      for (const line of lines.filter((l) => wanted.has(l.new ?? l.old))) {
        const key = `${file.path}\n${address(line)}`;
        if (owner.has(key)) errors.push(`${file.path} ${address(line)} is in block ${owner.get(key) + 1} and in ${name}`);
        else { owner.set(key, index); own++; }
      }
    }
    if (!own) errors.push(`${name} covers no changed line of ${block.path}`);
  });

  for (const file of files) {
    const loose = changedLines(file).filter((l) => !blank(l) && !owner.has(`${file.path}\n${address(l)}`));
    const of = (kind) => compact(loose.filter((l) => l.kind === kind).map((l) => l.new ?? l.old));
    if (loose.length) errors.push(`${file.path}: no block covers ${[["added", of("add")], ["removed", of("del")]]
      .filter(([, list]) => list).map(([field, list]) => `${field} ${list}`).join("; ")}`);
  }
  return { errors, owner };
}

// Blocks with their number, their lines and where they are, as both renderings need them.
function mapOf(review, files, owner) {
  const blocks = review.blocks.map((block, index) => ({ ...block, id: index + 1, serves: block.serves ?? [], findings: block.findings ?? [], added: [], removed: [] }));
  for (const file of files) for (const line of changedLines(file)) {
    const index = owner.get(`${file.path}\n${address(line)}`);
    if (index !== undefined) blocks[index][line.kind === "add" ? "added" : "removed"].push(line.new ?? line.old);
  }
  for (const block of blocks) {
    block.size = block.added.length + block.removed.length;
    block.where = [block.added.length && `+${compact(block.added)}`, block.removed.length && `-${compact(block.removed)}`].filter(Boolean).join(" ");
  }
  const unserved = review.requirements.filter((r) => !blocks.some((b) => b.serves.includes(r.id)));
  return { blocks, unserved };
}

function markdown(review, { blocks, unserved }) {
  const list = (items, line) => items?.length ? items.map(line) : ["none"];
  return [
    "## Verdict", review.verdict, `Target: ${review.target}`, "",
    "## Findings", ...list(review.findings, (f) => `### ${f.id}. ${f.title} (${f.direction}; ${f.evidence})\n\`${f.at}\`: ${f.what}\nFix: ${f.fix}\n`), "",
    "## Change map",
    ...blocks.map((b) => `- \`${b.path}:${b.where}\`: ${b.does} Serves ${b.serves.join(", ") || "nothing"}. `
      + `${b.verdict[0].toUpperCase()}${b.verdict.slice(1)}${b.findings.length ? ` (${b.findings.join(", ")})` : ""}.`),
    ...unserved.map((r) => `- No block serves requirement ${r.id}: ${r.text}`),
    ...(review.units ?? []).map((u) => `- \`${u.name}\`: ${u.jobs.join(", ")}. ${u.verdict[0].toUpperCase()}${u.verdict.slice(1)}.`), "",
    "## Questions and oddities", ...list(review.questions, (q) => `- \`${q.at}\`: ${q.text}`), "",
    "## Coverage", review.coverage || "none",
  ].join("\n");
}

const esc = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const STYLE = `
/* One column: the summary, then the diff cut into blocks with a stripe for each verdict, then the findings and the author's decisions. */
:root { --bg: #f5f6f9; --surface: #ffffff; --fg: #1b2230; --muted: #5d6879; --line: #d8dde6; --accent: #3450c0; --code: #fafbfd;
  --keep: #1c7449; --keep-bg: #e4f3ea; --fix: #8f5b00; --fix-bg: #faefd3; --remove: #b02e28; --remove-bg: #fae5e2;
  --text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #11151c; --surface: #19202a; --fg: #e2e7ee; --muted: #97a3b4;
  --line: #2b3441; --accent: #93a8ff; --code: #141a22; --keep: #62c995; --keep-bg: #163225; --fix: #e3b252; --fix-bg: #382c10;
  --remove: #f18d83; --remove-bg: #3e1f1c; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #11151c; --surface: #19202a; --fg: #e2e7ee; --muted: #97a3b4; --line: #2b3441; --accent: #93a8ff;
  --code: #141a22; --keep: #62c995; --keep-bg: #163225; --fix: #e3b252; --fix-bg: #382c10; --remove: #f18d83; --remove-bg: #3e1f1c; color-scheme: dark }
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
    const part = (title, lines) => lines.length ? ["", title, ...lines] : [];
    return ["Decisions on the review of \\"" + data.title + "\\" (" + data.range + ")", ...part("Apply:", of("apply")), ...part("Do not apply:", of("skip")),
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

function page(review, files, owner, { blocks, unserved }) {
  const findingOf = (id) => review.findings.find((f) => f.id === id);
  const count = (list) => list.reduce((sum, b) => sum + b.size, 0);
  const total = count(blocks) || 1;
  const chip = (b) => `<a class="chip v-${b.verdict}" href="#b${b.id}">B${b.id}</a>`;
  const decide = (id) => `<span class="decide group act" data-finding="${id}"><button type="button" value="apply">Apply</button><button type="button" value="skip">Skip</button></span>`;
  const some = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`, lines = (n) => some(n, "line");

  const summary = `
<section id="summary" class="stack">
  <p>${esc(review.verdict)}</p>
  <div class="stack"><span class="label">Target: the smallest clean solution</span><div class="target">${esc(review.target)}</div></div>
  <div class="stack"><span class="label">What the reviewer would do with the ${lines(count(blocks))} of the change</span>
    <div class="share" role="img" aria-label="Share of changed lines by verdict">${VERDICTS.map((v) => `<span class="v-${v}" style="width:${(100 * count(blocks.filter((b) => b.verdict === v)) / total).toFixed(2)}%"></span>`).join("")}</div>
    <div class="legend">${VERDICTS.map((v) => `<span><span class="tag v-${v}">${v}</span> ${lines(count(blocks.filter((b) => b.verdict === v)))} in ${some(blocks.filter((b) => b.verdict === v).length, "block")}</span>`).join("")}</div>
  </div>
  <div class="stack"><span class="label">What each requirement gets</span>
  <div class="table"><table>
    <tr><th>#</th><th>Requirement</th><th>Blocks that serve it</th><th>Lines</th></tr>
    ${review.requirements.map((r) => { const serving = blocks.filter((b) => b.serves.includes(r.id)); return `<tr><td class="n">${esc(r.id)}</td><td>${esc(r.text)}</td>`
      + `<td>${serving.map(chip).join("") || '<span class="tag v-remove">no block serves it</span>'}</td><td class="n">${count(serving)}</td></tr>`; }).join("\n    ")}
    <tr><td></td><td><strong>Nothing</strong>: no requirement would fail without these</td><td>${blocks.filter((b) => !b.serves.length).map(chip).join("") || "none"}</td><td class="n">${count(blocks.filter((b) => !b.serves.length))}</td></tr>
  </table></div></div>
  ${review.units?.length ? `<div class="stack"><span class="label">Units and their jobs</span><div class="table"><table>
    <tr><th>Unit</th><th>Jobs</th><th>Verdict</th></tr>
    ${review.units.map((u) => `<tr><td class="mono">${esc(u.name)}</td><td>${esc(u.jobs.join(", "))}</td><td>${esc(u.verdict)}</td></tr>`).join("\n    ")}
  </table></div></div>` : ""}
</section>`;

  const shown = new Set();
  const head = (b) => {
    const first = !shown.has(b.id);
    shown.add(b.id);
    if (!first) return `<header><div class="row"><span class="tag">${b.verdict}</span><a href="#b${b.id}">B${b.id}</a><span class="sub">continued</span></div></header>`;
    return `<header><div class="row"><span class="tag">${b.verdict}</span><strong>B${b.id}</strong><span>${esc(b.does)}</span></div>`
      + (`<div class="row sub"><span>${b.serves.length ? `Serves ${b.serves.map((id) => `requirement ${esc(id)}`).join(", ")}` : "Serves nothing"}</span><span class="mono">${esc(b.where)}</span></div>`
        + (b.findings.length ? `<ul>${b.findings.map((id) => `<li><a href="#f${id}">${esc(id)}. ${esc(findingOf(id).title)}</a>${decide(id)}</li>`).join("")}</ul>` : "")
        + `<input class="act" type="text" id="note-b${b.id}" data-note="b${b.id}" placeholder="Your note on this block" aria-label="Your note on block ${b.id}">`)
      + "</header>";
  };
  const code = (part) => `<pre><code>${part.map((l) => `<span class="l ${l.kind}"><b>${l.kind === "del" ? l.old : l.new}</b><i>${{ add: "+", del: "−", ctx: " " }[l.kind]}</i>${esc(l.text)}</span>`).join("")}</code></pre>`;
  const fileHtml = (file) => {
    const parts = [];
    file.hunks.forEach((hunk, index) => {
      if (index) parts.push('<div class="gap">⋯</div>');
      let current, run = [], between = [];
      const flush = () => {
        if (run.length) parts.push(current === undefined ? `<div class="seg">${code(run)}</div>`
          : `<div class="seg v-${blocks[current].verdict}" data-block="${blocks[current].id}"${shown.has(blocks[current].id) ? "" : ` id="b${blocks[current].id}"`}>${head(blocks[current])}<details${run.length > 40 ? "" : " open"}><summary>${lines(run.length)}</summary>${code(run)}</details></div>`);
        run = [];
      };
      const alone = () => { flush(); current = undefined; run = between; flush(); between = []; };
      for (const line of hunk) {
        if (line.kind === "ctx") { between.push(line); continue; }
        // A blank changed line belongs to no block of its own: it stays with the lines before it.
        const mine = owner.get(`${file.path}\n${address(line)}`) ?? (blank(line) ? current : undefined);
        // Unchanged lines inside one block stay in it; between two blocks they stand alone.
        if (mine === current && mine !== undefined) run.push(...between.splice(0));
        else { alone(); current = mine; }
        run.push(line);
      }
      alone();
    });
    const own = blocks.filter((b) => b.path === file.path);
    return `<div class="file"><header><strong class="mono">${esc(file.path)}</strong><span class="sub">${lines(count(own))} in ${some(own.length, "block")}</span></header>${parts.join("")}</div>`;
  };

  const findings = review.findings.map((f) => `
  <article class="finding" id="f${esc(f.id)}">
    <h3>${esc(f.id)}. ${esc(f.title)}</h3>
    <div class="group sub"><span>${esc(f.direction)}</span><span>${esc(f.evidence)}</span><code>${esc(f.at)}</code>${blocks.filter((b) => b.findings.includes(f.id)).map(chip).join("")}</div>
    <p>${esc(f.what)}</p>
    <p><strong>Fix:</strong> ${esc(f.fix)}</p>
    ${decide(f.id)}
    <input class="act" type="text" id="note-f${esc(f.id)}" data-note="f${esc(f.id)}" placeholder="Your note on this finding" aria-label="Your note on finding ${esc(f.id)}">
  </article>`).join("");

  const data = { title: review.title, range: review.range, findings: review.findings.map(({ id, title }) => ({ id, title })),
    blocks: blocks.map(({ id, path, where, findings: of }) => ({ id, path, where, findings: of })) };
  return `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Review of ${esc(review.title)}</title>
<style>${STYLE}</style>
<div class="wrap">
<header class="stack"><h1>Review of ${esc(review.title)}</h1><span class="sub mono">${esc(review.range)}</span></header>
${summary}
<section class="stack">
  <div class="bar">
    <nav><a href="#summary">Summary</a><a href="#map">Change map</a><a href="#findings">Findings</a><a href="#decisions">Decisions</a></nav>
    <span class="group act"><span class="sub">Show</span>${["all", ...VERDICTS].map((v) => `<button type="button" data-show="${v}" aria-pressed="${v === "all"}">${v}</button>`).join("")}</span>
    <span class="sub act" id="progress"></span>
  </div>
  <div id="map" class="map stack" data-show="all">
    <h2>Change map</h2>
    ${files.map(fileHtml).join("\n    ")}
  </div>
</section>
<section id="findings" class="stack"><h2>Findings</h2>${findings || "<p>none</p>"}</section>
<section class="stack"><h2>Questions and oddities</h2>${review.questions?.length ? `<ul>${review.questions.map((q) => `<li><code>${esc(q.at)}</code> ${esc(q.text)}</li>`).join("")}</ul>` : "<p>none</p>"}
  <h2>Coverage</h2><p>${esc(review.coverage || "none")}</p></section>
<section id="decisions" class="stack act"><h2>Decisions</h2>
  <p class="sub">Mark each finding Apply or Skip, add notes where you disagree, then hand this text back to whoever makes the change.</p>
  <div class="group"><button type="button" id="copy">Copy</button><button type="button" id="apply-all">Apply all</button><button type="button" id="clear">Clear</button></div>
  <textarea id="out" readonly aria-label="Your decisions as text"></textarea></section>
</div>
<script id="data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<script>${SCRIPT}</script>
`;
}

const [command, argument] = process.argv.slice(2);
try {
  if (command === "lines" && argument) {
    for (const file of diffOf(argument)) console.log([file.path, ...changedLines(file).map((l) => `  ${address(l).padEnd(6)} ${l.text}`)].join("\n"));
  } else if (command === "render" && argument) {
    const review = JSON.parse(fs.readFileSync(argument, "utf8")), files = diffOf(review.range ?? "");
    const { errors, owner } = check(review, files);
    if (errors.length) {
      console.error(`The review does not match the diff; fix these ${errors.length} and render again:\n${errors.map((e) => `- ${e}`).join("\n")}`);
      process.exit(1);
    }
    const map = mapOf(review, files, owner), target = argument.replace(/(\.json)?$/, ".html");
    fs.writeFileSync(target, page(review, files, owner, map));
    console.log(`${markdown(review, map)}\n\nInteractive report: ${target}`);
  } else {
    console.error("usage: report.mjs lines <range> | report.mjs render <review.json>");
    process.exit(2);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
