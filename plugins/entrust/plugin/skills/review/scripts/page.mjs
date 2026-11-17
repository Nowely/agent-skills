// A checked review as a page: one file with no dependencies, readable without scripts. Decision-first: the
// passport, the authored status, the counters, the verdict and the question cards come before the mechanics.
// With scripts, the owner accepts or defers decisions, marks findings to apply or skip, comments on any passage,
// and copies or downloads those decisions. Old records without the new fields render through the same path.
import { address, blank } from "./diff.mjs";
import { diagram } from "./diagram.mjs";
import { highlight } from "./highlight.mjs";
import { labelsOf, languageOf } from "./labels.mjs";
import { VERDICTS, mechanismCounts, sourceOf, weightCountsText, weightOverview } from "./review.mjs";
import { esc } from "./text.mjs";
import { annotations } from "./annotations.mjs";
import { decisionRuntime } from "./decisions.mjs";

const STYLE = `
/* One column, decision-first: the passport and the authored status; the counters; the verdict, the recommendation and now beside the target; the question cards; the findings and tradeoffs; the requirements; the mechanics collapsed; the structure as diagrams and a tree of files; the full diff map in a closed disclosure; the author's decisions. */
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
p, li, h1, h2, h3, summary, blockquote { overflow-wrap: anywhere }
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
.v-open, .v-question { --v: var(--muted); --v-bg: var(--line) }
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
button:disabled { opacity: .5; cursor: default }
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
.seg:target > header, .finding:target, .qcard:target { outline: 2px solid var(--accent); outline-offset: -2px }
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
.map[data-show="keep"] .seg:not(.v-keep), .map[data-show="fix"] .seg:not(.v-fix), .map[data-show="remove"] .seg:not(.v-remove), .map[data-show="question"] .seg:not(.v-question),
.map[data-show]:not([data-show="all"]) .gap { display: none }
.finding { background: var(--surface); border: 1px solid var(--line); padding: .7rem 1rem; display: flex; flex-direction: column; gap: .4rem; scroll-margin-top: 4rem; min-width: 0 }
input[type="text"] { font: inherit; color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .2rem .5rem; width: 100%; max-width: 40rem }
textarea { width: 100%; min-height: 14rem; font: .92rem/1.45 var(--mono); color: var(--fg); background: var(--surface); border: 1px solid var(--line); padding: .6rem .8rem }
/* Annotation controls are excluded from persisted text offsets. */
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
section, [data-anchor] { scroll-margin-top: 6rem }
.mechanism { padding: 1rem 1.2rem; gap: .75rem }
.mechanism > details > summary { padding: 0; background: none; color: inherit; font-size: inherit }
.mechanism h3 { display: inline; font-size: 1.12rem }
.mechanism-summary { display: block; padding: .5rem 0 0 1.2rem }
.mechanism-content { padding-top: .75rem }
.mechanism-decision { color: var(--accent); font-weight: 600 }
.mechanism-tradeoff { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1rem; border-block: 1px solid var(--line); padding-block: .7rem }
.mechanism details .stack, .sources p { padding: .6rem .8rem }
.sources { overflow-wrap: anywhere }
mark[data-annotation] { background: color-mix(in srgb, var(--accent) 18%, var(--surface)); color: inherit }
.annotation-marker { user-select: none; min-width: 24px; height: 24px; padding: 0 .3rem; margin-inline: .15rem; border-radius: 1rem; background: var(--accent); color: var(--bg); font-size: .8rem; vertical-align: super; line-height: 1 }
#annotation-editor { position: fixed; margin: 0; width: min(32rem,calc(100vw - 16px)); max-height: calc(100dvh - 16px); overflow: auto; padding: 1rem; border: 1px solid var(--line); border-radius: .7rem; background: var(--surface); color: var(--fg); box-shadow: 0 8px 30px rgb(0 0 0 / .2); z-index: 20 }
#annotation-editor blockquote { margin: .5rem 0; border-left: 3px solid var(--accent); padding-left: .6rem; max-height: 6rem; overflow: auto; white-space: pre-wrap }
#annotation-editor textarea { min-height: 6rem; font: inherit; margin-block: .5rem; resize: vertical }
.passage { display: flex; flex-direction: column; align-items: stretch }
.passage p, .passage blockquote { white-space: pre-wrap }
[hidden] { display: none !important }
.annotation-feedback { position: fixed; z-index: 21; bottom: 1rem; right: 1rem; max-width: calc(100vw - 2rem); padding: .5rem .75rem; border: 1px solid var(--line); border-radius: .4rem; background: var(--surface); box-shadow: 0 2px 8px rgb(0 0 0 / .15) }
.annotation-feedback:has(#annotation-status:empty):has(button[hidden]) { display: none }
@media (max-width: 40rem) { .mechanism-tradeoff { grid-template-columns: 1fr } }
/* The decision-first layer: passport, authored status, counters, question cards, tradeoffs, the file tree, the viewer, print. */
.skip-link { position: absolute; left: -9999px; top: 0; background: var(--accent); color: #fff; padding: .4rem .8rem; z-index: 50 }
.skip-link:focus { left: 0 }
.passport-card { background: var(--surface); border: 1px solid var(--line) }
.passport-card > summary.passport { cursor: pointer; border: 0; display: list-item; padding: .6rem 1rem; font-size: .92rem; background: none; color: var(--fg) }
.passport-card > summary.passport > * { margin-right: 1.1rem }
.passport-card > summary.passport:hover { background: var(--code) }
.passport-body { padding: .5rem 1rem; border-top: 1px solid var(--line); font-size: .82rem; color: var(--muted); overflow-wrap: anywhere }
.status-strip { display: grid; grid-template-columns: 1fr; gap: .35rem 1.4rem; background: color-mix(in srgb, var(--fix) 8%, var(--surface)); border: 1px solid var(--fix); border-left-width: 4px; padding: .7rem 1rem }
.status-strip .row { display: flex; gap: .5rem; align-items: baseline }
.status-strip .label { flex: none; min-width: 7rem }
@media (min-width: 760px) { .status-strip { grid-template-columns: 1fr 1fr } }
.counters { display: flex; flex-wrap: wrap; gap: .5rem 1.4rem; padding: .5rem 0; font-variant-numeric: tabular-nums }
.counters .c { display: flex; flex-direction: column; gap: .1rem }
.counters .c b { font-size: 1.3rem; line-height: 1 }
.counters .c span { font-size: .82rem; color: var(--muted) }
.counters .split { border-left: 1px solid var(--line); padding-left: 1.4rem }
.count-note { flex-basis: 100%; margin: .2rem 0 0; font-size: .82rem }
.count-note > summary { cursor: pointer; color: var(--muted); background: none; padding: 0 }
.decision-sheet { display: flex; flex-direction: column; gap: .8rem }
.qgroup-title { display: block; font-size: .95rem; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); font-weight: 650; margin-top: .4rem }
.qcard { background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--v, var(--muted)); padding: .7rem 1rem; display: flex; flex-direction: column; gap: .45rem; scroll-margin-top: 6rem }
.qcard.decision { --v: var(--accent) } .qcard.fact { --v: var(--number) } .qcard.evidence { --v: var(--fix) }
.qcard.child { margin-left: 1.6rem; border-left-style: dashed }
.qcard.na { opacity: .55 }
.qcard .qhead { display: flex; flex-wrap: wrap; gap: .3rem .7rem; align-items: baseline }
.qcard .qhead h3 { font-size: 1.05rem; display: inline }
.qcard .qquestion { margin: .2rem 0 }
.qctx .label, .qopts .label, .qzones .label, .qremaining-block .label { display: block; margin-bottom: .2rem }
.qctx ul, .qzones ul { margin: 0 }
.qopts { display: flex; flex-direction: column; gap: .4rem; margin: .3rem 0 }
.qopt { display: flex; gap: .5rem; align-items: flex-start; padding: .4rem .6rem; border: 1px solid var(--line); border-radius: 4px; cursor: pointer }
.qopt:has(input:checked) { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 7%, var(--surface)) }
.qopt input { margin-top: .25rem }
.qopt span span { display: block }
.qadvice { font-size: .92rem; border-left: 3px solid var(--accent); padding-left: .6rem; margin: .3rem 0 }
.qzones label { display: flex; gap: .4rem; align-items: baseline }
.tradeoff { background: color-mix(in srgb, var(--keep) 7%, var(--surface)); border: 1px solid var(--keep); border-left-width: 4px; padding: .6rem 1rem; display: flex; flex-direction: column; gap: .3rem }
.cov-grid { display: grid; grid-template-columns: 10rem minmax(0,1fr); gap: .3rem 1rem }
.cov-grid .label { padding-top: .1rem }
.compare { display: flex; flex-direction: column; gap: .4rem }
.cmp-head, .cmp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem }
.cmp-head { font-weight: 650; font-size: .85rem; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line); padding-bottom: .3rem }
.cmp-row > div { padding: .3rem .6rem; border-left: 3px solid var(--line); display: flex; flex-direction: column; gap: .4rem }
.cmp-now { border-left-color: var(--muted) !important }
.cmp-target { border-left-color: var(--accent) !important; background: color-mix(in srgb, var(--accent) 5%, var(--surface)) }
@media (max-width: 700px) { .cmp-head, .cmp-row { grid-template-columns: 1fr } .cmp-head span:last-child { display: none } }
.ftree, .ftree ul { margin: 0; padding: 0; list-style: none }
.ftree ul { margin-left: .5rem; padding-left: .9rem; border-left: 1px solid var(--line) }
.fdir > summary { cursor: pointer; padding: .15rem 0; background: none }
.frow { display: flex; flex-wrap: wrap; gap: .3rem .6rem; align-items: baseline; padding: .15rem 0 }
.fs { display: inline-block; width: 1.3em; text-align: center; font-weight: 700; font-family: var(--mono) }
.fs-A { color: var(--keep) } .fs-D { color: var(--remove) } .fs-M { color: var(--accent) }
.tree-nav { background: var(--surface); border: 1px solid var(--line); padding: .6rem .9rem }
.audit-map > summary { font-size: 1rem; font-weight: 650; padding: .5rem .8rem; background: var(--surface); border: 1px solid var(--line); color: var(--fg) }
.audit-map[open] > summary { border-bottom: 0 }
.audit-map > .map-filters { padding: .6rem .8rem; border: 1px solid var(--line); border-top: 0 }
.audit-map > #map { border: 1px solid var(--line); border-top: 0; padding: .8rem }
.shot-open { font-size: .82rem; align-self: flex-start }
img.shot-zoom { cursor: zoom-in }
img.shot-zoom:focus-visible { outline: 2px solid var(--accent) }
#zoom-dialog { position: fixed; inset: 0; margin: 0; width: 100vw; max-width: 100vw; height: 100dvh; max-height: 100dvh; border: 0; padding: 0; background: rgb(20 22 28 / .96); color: #eee; z-index: 40 }
#zoom-dialog::backdrop { background: rgb(0 0 0 / .7) }
.zoom-bar { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; padding: .6rem 1rem; background: rgb(0 0 0 / .4) }
.zoom-bar button { background: #2a2f3a; color: #eee; border-color: #444 }
.zoom-bar button[aria-pressed="true"] { background: #eee; color: #111 }
.zoom-bar form { margin-left: auto }
.zoom-scroll { overflow: auto; height: calc(100dvh - 3.6rem); padding: 1rem; display: flex }
#zoom-dialog[data-mode="fit"] .zoom-scroll img { max-width: 100%; max-height: 100%; object-fit: contain; margin: auto; cursor: zoom-in }
#zoom-dialog[data-mode="1:1"] .zoom-scroll img { max-width: none; width: auto; height: auto; margin: 0; cursor: zoom-out }
@media print {
  .bar, .decide, .act, #comment, #annotation-editor, .map-filters, .skip-link, button, .requires-content { display: none !important }
  body { background: #fff; color: #000 } .wrap { max-width: none }
  .seg, .finding, .qcard, .mechanism, .tradeoff { break-inside: avoid }
  .passport-card, .status-strip, .counters { break-inside: avoid }
  a { color: #000; text-decoration: underline }
}
`;

const SCRIPT = `
(() => {
  const data = JSON.parse(document.getElementById("data").textContent), key = "review-report:" + data.key, t = data.labels;
  const D = (${decisionRuntime.toString()})();
  const all = (selector) => [...document.querySelectorAll(selector)];
  const map = document.getElementById("map"), out = document.getElementById("out"), progress = document.getElementById("progress"), progressQ = document.getElementById("progress-q");
  let state = D.empty();
  try { state = D.normalize(JSON.parse(localStorage.getItem(key) || "{}")); } catch {}
  state = D.settle(data.questions, state);
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} };
  document.documentElement.classList.add("js");
  const qEntry = (id) => D.entryOf(state, id);

  function decisions() {
    const note = (id) => state.notes[id] ? " — " + state.notes[id] : "";
    // A note is kept whatever was decided: on a finding left open and on an idea not taken too.
    const line = (f) => "- " + f.id + ". " + f.title + note("f" + f.id);
    const of = (value) => data.findings.filter((f) => state.findings[f.id] === value).map(line);
    const open = data.findings.filter((f) => !state.findings[f.id]);
    const blocks = data.blocks.filter((b) => state.notes["b" + b.id]).map((b) => "- " + b.path + " " + b.where + ": " + state.notes["b" + b.id]);
    const idea = (i) => "- " + i.title + note(i.id), taken = (i) => state.findings[i.id] === "apply";
    // A question's decision travels with its variant's id and text, never the localized label alone. The status
    // is the valid decision: a bare acceptance or deferral is copied without one, never as accepted or deferred.
    const qs = data.questions.filter((q) => q.kind === "decision").filter((q) => { const e = qEntry(q.id); return (e.choice || e.variant) && D.applicable(q, state, data.questions); }).map((q) => {
      const e = qEntry(q.id), v = (q.variants || []).find((v) => v.id === e.variant);
      const status = D.validAccept(q, state) ? t.accepted : D.validDefer(q, state) ? t.deferred : "";
      return "- Q" + q.id + (status ? " [" + status + "]" : "") + (v ? " (" + t.variant + " " + v.id + ": " + v.text + ")" : "") + note("q" + q.id);
    });
    const marked = state.passages.map((p, i) => "- " + (i + 1) + ". " + p.where + (p.anchor ? " [" + p.anchor.id + ":" + p.anchor.start + "-" + p.anchor.end + "]" : "") + ": \\"" + p.quote + "\\"" + (p.note ? " — " + p.note : ""));
    const part = (title, lines) => lines.length ? ["", title, ...lines] : [];
    return [t.title + " \\"" + data.title + "\\" (" + data.range + ", " + data.key + ")", ...part(t.apply, of("apply")), ...part(t.skip, of("skip")),
      ...(open.length ? ["", t.open + " " + open.map((f) => f.id).join(", "), ...open.filter((f) => state.notes["f" + f.id]).map(line)] : []),
      ...part(t.questionsOut, qs), ...part(t.ideas, data.ideas.filter(taken).map(idea)), ...part(t.ideaNotes, data.ideas.filter((i) => !taken(i) && state.notes[i.id]).map(idea)),
      ...part(t.blocks, blocks), ...part(t.passages, marked)].join("\\n");
  }

  function paint() {
    for (const group of all(".decide")) {
      const id = group.dataset.finding;
      const current = id[0] === "q" ? qEntry(id.slice(1)).choice : state.findings[id];
      for (const button of group.querySelectorAll("button")) button.setAttribute("aria-pressed", String(current === button.value));
    }
    for (const radio of all("[data-question-variant]")) radio.checked = qEntry(radio.dataset.questionVariant).variant === radio.value;
    for (const block of data.blocks) {
      const kept = block.findings.length > 0 && block.findings.every((f) => state.findings[f] === "skip");
      for (const part of all('[data-block="' + block.id + '"]')) part.classList.toggle("overruled", kept);
    }
    for (const input of all("[data-note]")) if (document.activeElement !== input) input.value = state.notes[input.dataset.note] || "";
    for (const card of all(".qcard[data-qid]")) {
      const q = data.questions.find((x) => String(x.id) === card.dataset.qid);
      if (!q) continue;
      const na = !!q.parent && !D.applicable(q, state, data.questions);
      card.classList.toggle("na", na);
      for (const control of card.querySelectorAll(".decide button, [data-question-variant], input[data-note]")) control.disabled = na;
      const badge = card.querySelector(".na-badge"); if (badge) badge.hidden = !na;
      const hint = card.querySelector(".requires-content");
      if (hint) { const e = qEntry(q.id);
        const missing = (e.choice === "accepted" && !D.validAccept(q, state)) || (e.choice === "deferred" && !D.validDefer(q, state));
        hint.hidden = !missing; hint.textContent = e.choice === "deferred" ? t.deferReason : t.requiresContent; }
      const pending = card.querySelector(".parent-pending");
      if (pending) { const parent = q.parent && data.questions.find((x) => x.id === q.parent.question);
        pending.hidden = !parent || D.validAccept(parent, state) || D.validDefer(parent, state); }
    }
    for (const z of all("[data-zone]")) z.checked = !!state.zones[z.dataset.zone];
    progress.textContent = t.decided.replace("{n}", data.findings.filter((f) => state.findings[f.id]).length + " / " + data.findings.length);
    if (progressQ && data.questions.some((q) => q.kind === "decision")) { const c = D.counters(data.questions, state);
      progressQ.textContent = [t.accepted + ": " + c.accepted, t.deferred + ": " + c.deferred, t.notApplicable + ": " + c.notApplicable, t.remaining + ": " + c.remaining].join(" · "); }
    out.value = decisions();
  }

  // A deep link opens every disclosure above its target and brings it into view; the map's filter never hides it.
  function openTarget(hash) {
    if (!hash || hash[0] !== "#") return;
    let el; try { el = document.querySelector(hash); } catch { return; }
    if (!el) return;
    const bm = /^#b(\\d+)$/.exec(hash);
    if (bm && map && map.dataset.show !== "all") {
      map.dataset.show = "all";
      for (const other of all("[data-show]")) if (other !== map) other.setAttribute("aria-pressed", String(other.dataset.show === "all"));
    }
    for (let p = el; p; p = p.parentElement) if (p.tagName === "DETAILS") p.open = true;
    if (el.matches("article.mechanism")) el.querySelectorAll("details").forEach((d) => { d.open = true; });
    requestAnimationFrame(() => el.scrollIntoView({ block: "center" }));
  }
  window.addEventListener("hashchange", () => openTarget(location.hash));

  // The picture viewer: one dialog, fit or actual size, previous and next, focus returned to the thumbnail.
  const zd = document.getElementById("zoom-dialog"), shots = all("img.shot-zoom");
  let zi = 0, zfocus = null;
  function showZoom(i) {
    if (!zd || !shots.length) return;
    zi = (i + shots.length) % shots.length;
    const img = shots[zi];
    zd.querySelector(".zoom-scroll img").src = img.src;
    document.getElementById("zoom-count").textContent = (zi + 1) + " / " + shots.length;
    document.getElementById("zoom-name").textContent = img.alt || "";
    document.getElementById("zoom-historical").hidden = img.dataset.historical !== "1";
    if (!zd.open) { zfocus = document.activeElement; zd.showModal(); }
  }
  function zoomMode(mode) {
    if (!zd) return;
    zd.dataset.mode = mode;
    zd.querySelector("[data-zoom-fit]").setAttribute("aria-pressed", String(mode === "fit"));
    zd.querySelector("[data-zoom-full]").setAttribute("aria-pressed", String(mode === "1:1"));
  }
  if (zd) {
    zd.addEventListener("close", () => { if (zfocus) zfocus.focus(); });
    zd.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); showZoom(zi + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); showZoom(zi - 1); } });
  }

  document.addEventListener("click", (event) => {
    const zbtn = event.target.closest("button.shot-open"); if (zbtn) { showZoom(+zbtn.dataset.zoom); return; }
    const img = event.target.closest("img.shot-zoom"); if (img) { showZoom(shots.indexOf(img)); return; }
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    const group = button.closest(".decide");
    if (group) {
      const id = group.dataset.finding;
      if (id[0] === "q") {
        const k = id.slice(1), cur = { ...qEntry(k) };
        if (cur.choice === button.value) delete cur.choice; else cur.choice = button.value;
        if (cur.choice || cur.variant) state.questions[k] = cur; else delete state.questions[k];
      } else if (state.findings[id] === button.value) delete state.findings[id]; else state.findings[id] = button.value;
    } else if (button.dataset.show) {
      map.dataset.show = button.dataset.show;
      for (const other of all("[data-show]")) if (other !== map) other.setAttribute("aria-pressed", String(other === button));
      return;
    } else if (button.dataset.overlay !== undefined) {
      button.setAttribute("aria-pressed", String(button.closest("article").querySelector(".shots").classList.toggle("overlaid")));
      return;
    } else if (button.dataset.zoomFit !== undefined) { zoomMode("fit"); return; }
    else if (button.dataset.zoomFull !== undefined) { zoomMode("1:1"); return; }
    else if (button.dataset.zoomPrev !== undefined) { showZoom(zi - 1); return; }
    else if (button.dataset.zoomNext !== undefined) { showZoom(zi + 1); return; }
    else if (button.id === "print-owner") { auditorPrint = false; window.print(); return; }
    else if (button.id === "print-audit") { auditorPrint = true; window.print(); return; }
    else if (button.id === "export-json") {
      const payload = D.exportOf(data.questions, state, { recordSha: data.digest.record, diffSha: data.digest.diff, key: data.key, title: data.title, range: data.range });
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "decisions-" + data.key + ".json"; a.click(); URL.revokeObjectURL(a.href); return;
    } else if (button.id === "apply-all") for (const f of data.findings) state.findings[f.id] = "apply";
    else if (button.id === "clear") { if (!confirm(t.clearConfirm)) return; state = D.empty(); annotationUI.reset(); }
    else if (button.id === "copy") {
      const done = () => { annotationUI.announce(t.copied); button.textContent = t.copied; setTimeout(() => { button.textContent = t.copy; }, 1500); };
      const select = () => { out.focus(); out.select(); };
      try { navigator.clipboard.writeText(out.value).then(done, select); } catch { select(); }
      return;
    } else return;
    state = D.settle(data.questions, state); save(); paint();
  });
  document.addEventListener("input", (event) => {
    if (event.target.dataset.blend !== undefined) event.target.closest("article").querySelector(".shots").style.setProperty("--blend", event.target.value / 100);
    const id = event.target.dataset.note;
    if (!id) return;
    if (event.target.value.trim()) state.notes[id] = event.target.value.trim(); else delete state.notes[id];
    save(); paint();
  });
  document.addEventListener("change", (event) => {
    const qid = event.target.dataset.questionVariant;
    if (qid) {
      const cur = { ...qEntry(qid) };
      if (event.target.value) cur.variant = event.target.value; else delete cur.variant;
      if (cur.choice || cur.variant) state.questions[qid] = cur; else delete state.questions[qid];
      state = D.settle(data.questions, state); save(); paint(); return;
    }
    const z = event.target.dataset.zone;
    if (z) { if (event.target.checked) state.zones[z] = true; else delete state.zones[z]; save(); }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches?.("img.shot-zoom")) { event.preventDefault(); showZoom(shots.indexOf(event.target)); }
  });
  // Print profiles are views, not completeness: the owner leaves the full map closed, the auditor opens everything.
  // Without scripts the page prints what is open; the note beside the buttons says so.
  let printSnapshot = null, auditorPrint = false;
  window.addEventListener("beforeprint", () => {
    printSnapshot = all("details[open]");
    if (auditorPrint) all("details").forEach((d) => { d.open = true; });
    else { const audit = document.getElementById("map-details"); if (audit) audit.open = false; }
  });
  window.addEventListener("afterprint", () => {
    if (!printSnapshot) return;
    all("details").forEach((d) => { d.open = false; });
    for (const d of printSnapshot) d.open = true;
    printSnapshot = null; auditorPrint = false;
  });
  const annotationUI = (${annotations.toString()})({ state: () => state, changed: () => { save(); paint(); }, t: data.annotationLabels });
  annotationUI.render(); zoomMode("fit"); paint(); openTarget(location.hash);
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
// What a block or unit rests on: its findings, or for a question the questions it waits on.
const grounds = (item) => item.verdict === "question" ? item.questions.map((n) => `<a href="#q${n}">Q${n}</a>`).join(", ") : cite(item.findings);
const table = (head, rows) => `<div class="table"><table><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows.join("")}</table></div>`;
const TONE = { keep: "v-keep", fix: "v-fix", split: "v-fix", merge: "v-fix", remove: "v-remove", question: "v-question" };
// A claim's sources: an internal ref links to the item it names, an external place stands as text.
const srcHtml = (sources, review) => (sources ?? []).map((s) => {
  const { text, anchor } = sourceOf(s, review);
  return anchor ? `<a href="${anchor}">${esc(text)}</a>` : esc(text);
}).filter(Boolean).join(", ");
const claimsHtml = (list, review) => `<ul class="plain">${list.map((c) => `<li>${prose(c.text)}${c.sources?.length ? ` <span class="sub">(${srcHtml(c.sources, review)})</span>` : ""}</li>`).join("")}</ul>`;
const coverageLabel = (kind, t) => t(kind === "not_checked" ? "coverage.not-checked" : `coverage.${kind}`);
// The place of a question or finding, shortened to the file's unique suffix; the full place stays in the title.
const placeHtml = (at, model) => {
  const i = String(at).lastIndexOf(":"), file = model.files.find((f) => f.path === String(at).slice(0, i));
  return `<code class="sub" title="${esc(at)}">${esc(file ? file.short + String(at).slice(i) : at)}</code>`;
};

// Where the change lives, in one collapsed line: the links and the date; the revisions and digests one click in.
function passport(review, model, t) {
  const p = review.passport;
  if (!p) return "";
  return `<details class="passport-card" data-where="${esc(t("passport"))}">
  <summary class="passport">${(p.links ?? []).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}<span>${esc(p.reviewedAt)}</span></summary>
  <div class="passport-body mono">${esc(p.repository)} · ${esc(t("passport.base"))} ${esc(p.base)} → ${esc(t("passport.head"))} ${esc(p.head)} · diff sha256 ${esc(review.diff?.sha256 ?? "")} · record ${esc(model.recordSha ?? model.key)}</div>
</details>`;
}

// The authored status: the reviewer's own words from coverageStructured, never a status read out of prose.
function statusStrip(review, t) {
  const cs = review.coverageStructured;
  if (!cs?.length) return "";
  const row = (kind) => {
    const items = cs.filter((c) => c.kind === kind);
    if (!items.length) return "";
    return `<div class="row"><span class="label">${esc(coverageLabel(kind, t))}</span><span>${items.map((c) => `${prose(c.text)}${c.revision ? ` <span class="sub mono">@ ${esc(c.revision)}</span>` : ""}`).join("; ")}</span></div>`;
  };
  return `<div class="status-strip" data-where="${esc(t("coverage"))}">${["ran", "read", "not_checked"].map(row).join("")}</div>`;
}

// The scale of the change and what waits on whom, over unique sets; the fragment's definition one click away.
function counters(model, t) {
  const c = model.counters;
  const cell = (n, label, split) => `<div class="c${split ? " split" : ""}"><b>${n}</b><span>${esc(label)}</span></div>`;
  return `<div class="counters" data-where="${esc(t("summary"))}">
  ${cell(c.files, `${t("scope.files")} · +${c.lines.added}/−${c.lines.removed}`)}
  ${cell(c.addedFiles, t("scope.added"))}${cell(c.removedFiles, t("scope.removed"))}${cell(c.modifiedFiles, t("file.status.modified"))}
  ${cell(c.blocks, `${t("blocks").toLowerCase()}: ${VERDICTS.map((v) => `${t(`verdict.${v}`)} ${c.verdicts[v]}`).join(" · ")}`, true)}
  ${c.evidenceBlocks ? cell(c.evidenceBlocks, t("counters.evidence-blocks"), true) : ""}
  ${c.decisions ? cell(c.decisions, t("decisions"), true) : ""}
  <details class="count-note"><summary>${esc(t("fragment.what"))}</summary><p class="sub">${esc(t("fragment.definition"))} +${c.nonblank.added}/−${c.nonblank.removed}.</p></details>
</div>`;
}

// The verdict, the recommendation, now beside the target, and the task: each under its own label, in the order a reader decides by.
function summary(review, { blocks }, t) {
  const total = sizeOf(blocks) || 1, { change } = review;
  const role = (label, content, tone = "") => `<div class="role ${tone}" data-where="${esc(t(label))}"><span class="label">${esc(t(label))}</span><div class="stack">${content}</div></div>`;
  const share = `<div class="share" role="img" aria-label="${esc(t("share"))}">${VERDICTS.map((v) => `<span class="v-${v}" style="width:${(100 * sizeOf(of(blocks, v)) / total).toFixed(2)}%"></span>`).join("")}</div>
    <div class="legend sub"><span>${esc(t("share"))}:</span>${VERDICTS.map((v) => `<span><span class="tag v-${v}">${esc(t(`verdict.${v}`))}</span> ${sizeOf(of(blocks, v))}</span>`).join("")}</div>`;
  return `
<section id="summary" class="roles">
  ${role("verdict", lines(review.verdict, ' class="lead"'), "conclusion")}
  ${role("recommendation", `<p><strong>${prose(review.recommendation)}</strong></p>${review.steps?.length ? `<ol class="steps">${review.steps.map((step) =>
    `<li>${prose(step.text)}${step.findings?.length ? ` <span class="sub">(${cite(step.findings)})</span>` : ""}</li>`).join("")}</ol>` : ""}<p class="sub"><a href="#questions">${esc(t("questions"))} →</a></p>`, "actions")}
  <div class="role" data-where="${esc(`${t("now")} → ${t("target")}`)}"><span class="label">${esc(t("now"))} → ${esc(t("target"))}</span><div class="stack">
    <div class="compare"><div class="cmp-head"><span>${esc(t("now"))}</span><span>${esc(t("target"))}</span></div>
    <div class="cmp-row"><div class="cmp-now">${lines(review.now)}</div><div class="cmp-target">${lines(review.target)}</div></div></div>
    ${share}</div></div>
  ${role("task", `<p>${prose(change.goal)}${change.why ? ` ${prose(change.why)}` : ""}</p>
    <ul class="plain">${change.parts.map((part) => `<li>${prose(part)}</li>`).join("")}</ul>
    <details class="sources"><summary>${esc(t("sources"))}</summary><p class="sub">${change.sources.map(prose).join("; ")}</p></details>`)}
</section>`;
}

// One question card: the canonical text and place, the reviewer's context, the variants with their confirmed
// consequences, the recommendation as opinion, and what the decision does not replace. A child declares its
// parent; the page computes whether it still applies. A question without a kind keeps the old plain line.
function questionCard(q, review, model, t, child) {
  const variants = q.variants ?? [];
  const note = `<input class="act" type="text" data-note="q${q.id}" placeholder="${esc(t("decision.note"))}" aria-label="${esc(t("decision.note"))}: Q${q.id}">`;
  return `
  <div class="qcard ${esc(q.kind)}${child ? " child" : ""}" id="q${q.id}" data-qid="${q.id}"${q.parent ? ` data-parent="${q.parent.question}"` : ""} data-where="Q${q.id}">
    <div class="qhead"><h3>Q${q.id}</h3><span class="tag v-${q.kind === "decision" ? "fix" : q.kind === "evidence" ? "fix" : "question"}">${esc(t(`question.kind.${q.kind}`))}</span>${q.resolver ? `<span class="tag v-open">${esc(q.resolver)}</span>` : ""}${placeHtml(q.at, model)}${q.blocks ? `<span class="sub">${q.blocks} ${esc(t("question.blocks"))}</span>` : ""}<span class="tag v-open na-badge" hidden>${esc(t("decision.na-badge"))}</span></div>
    <p class="qquestion">${prose(q.text)}</p>
    ${q.parent ? `<p class="sub">${esc(t("question.parent"))}: <a href="#q${q.parent.question}">Q${q.parent.question}</a> <span class="parent-pending" hidden>${esc(t("decision.parent-pending"))}</span></p>` : ""}
    ${q.context?.length ? `<div class="qctx"><span class="label">${esc(t("question.context"))}</span>${claimsHtml(q.context, review)}</div>` : ""}
    ${variants.length ? `<div class="qopts"><span class="label">${esc(t("question.variants"))}</span>${variants.map((v) => `
      <label class="qopt"><input type="radio" name="vq${q.id}" value="${esc(v.id)}" data-question-variant="${q.id}"><span><strong>${esc(v.text)}</strong>${v.consequences?.length ? `<span class="sub">${esc(t("question.consequences"))}:</span>${claimsHtml(v.consequences, review)}` : ""}</span></label>`).join("")}</div>` : ""}
    ${q.recommendation ? `<p class="qadvice"><strong>${esc(t("recommendation"))}:</strong> ${prose(q.recommendation.text)}${q.recommendation.variant ? ` <span class="sub">[${esc(q.recommendation.variant)}]</span>` : ""}${q.recommendation.sources?.length ? ` <span class="sub">(${srcHtml(q.recommendation.sources, review)})</span>` : ""}<br><span class="sub">${esc(t("question.recommendation-note"))}</span></p>` : ""}
    ${q.remainingEvidence?.length ? `<div class="qremaining-block"><span class="label">${esc(t("question.remaining-evidence"))}</span><ul class="plain">${q.remainingEvidence.map((n) => `<li><a href="#q${n}">Q${n}</a> ${prose(review.questions[n - 1].text)}</li>`).join("")}</ul></div>` : ""}
    ${q.zones?.length ? `<div class="qzones"><span class="label">${esc(t("question.zones"))}</span><ul class="plain">${q.zones.map((z, zi) => `<li><label><input type="checkbox" data-zone="${q.id}-${zi}"> <span>${prose(z.text)}${z.sources?.length ? ` <span class="sub">(${srcHtml(z.sources, review)})</span>` : ""}</span></label></li>`).join("")}</ul></div>` : ""}
    ${q.kind === "decision" ? `<span class="decide group act" data-finding="q${q.id}"><button type="button" value="accepted">${esc(t("decision.accepted"))}</button><button type="button" value="deferred">${esc(t("decision.deferred"))}</button></span><span class="sub requires-content" hidden></span>${note}` : note}
  </div>`;
}

function questionsSection(review, model, t) {
  const qs = model.questions, byId = Object.fromEntries(qs.map((q) => [q.id, q]));
  const legacy = qs.filter((q) => q.kind === undefined);
  const group = (kind) => {
    const roots = qs.filter((q) => q.kind === kind && !q.parent);
    if (!roots.length) return "";
    return `<span class="label qgroup-title">${esc(t(`question.kind.${kind}`))}</span>${roots.map((q) => questionCard(q, review, model, t, false)
      + q.children.map((c) => questionCard(byId[c], review, model, t, true)).join("")).join("")}`;
  };
  return `
<section id="questions" class="stack decision-sheet" data-where="${esc(t("questions"))}"><h2>${esc(t("questions"))}</h2>
  ${["decision", "fact", "evidence"].map(group).join("")}
  ${legacy.length ? `<ul class="plain">${legacy.map((q) => `<li id="q${q.id}"><strong>Q${q.id}</strong> <code>${esc(q.at)}</code> ${prose(q.text)}</li>`).join("")}</ul>` : ""}
  ${!qs.length ? `<p>${esc(t("none"))}</p>` : ""}
</section>`;
}

// What each requirement gets. "Met" is the reviewer's word, never read off a block; a missing test is not a
// failure; a permission is not an obligation and is never marked met.
function requirements({ blocks, requirements: listed }, t) {
  const status = (r) => [
    r.permission ? `<span class="tag v-open">${esc(t("permission"))}</span>`
      : r.broken.length ? `<span class="tag v-remove">${esc(t("fails"))}</span> ${cite(r.broken)}`
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

// An omission the owner accepted, with what remains and where it was accepted.
function tradeoffs(review, t) {
  if (!review.tradeoffs?.length) return "";
  return `
<section id="tradeoffs" class="stack"><h2>${esc(t("tradeoffs"))}</h2>${review.tradeoffs.map((x) => `
  <div class="tradeoff" data-where="${esc(t("tradeoffs"))}"><p>${prose(x.text)}</p><p class="sub"><strong>${esc(t("tradeoff.consequence"))}:</strong> ${prose(x.consequence)}${x.sources?.length ? ` (${srcHtml(x.sources, review)})` : ""}</p></div>`).join("")}
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

// What the user sees: the pictures the reviewer was given, each enlargeable in the viewer, a historical picture
// marked as another revision, and each difference. The overlay stays for a mockup and its result.
function screens(review, { screens: shown }, t) {
  if (!shown.length) return "";
  let zoom = 0;
  const shot = (name, picture, s) => {
    if (!picture) return "";
    const historical = s.historical ? ` <span class="tag v-fix">${esc(t("screen.historical"))}</span>` : "";
    const body = picture.link ? `<a href="${esc(picture.link)}" target="_blank" rel="noopener">${esc(picture.link)}</a>`
      : `<button type="button" class="shot-open act" data-zoom="${zoom++}">${esc(t("viewer.open"))}</button>`
        + `<img class="shot-zoom" src="${picture.data}" alt="${esc(t(name))}: ${esc(s.name)}" tabindex="0" role="button" data-historical="${s.historical ? 1 : 0}" aria-label="${esc(t("viewer.open"))}: ${esc(t(name))}: ${esc(s.name)}">`;
    return `<figure class="${name}"><figcaption class="label">${esc(t(name))}${historical}</figcaption>${body}`
      + `${s.historical && s.revision ? `<p class="sub mono">${esc(s.revision)}</p>` : ""}${s.historical && s.sources?.length ? `<p class="sub">(${srcHtml(s.sources, review)})</p>` : ""}</figure>`;
  };
  return `
<section id="screens" class="stack"><h2>${esc(t("screens"))}</h2>${shown.map((s, index) => `
  <article class="finding" data-where="${esc(`${t("screens")}: ${s.name}`)}">
    <h3>${esc(s.name)}</h3>
    <div class="pair shots">${shot("mockup", s.mockup, s)}${shot("before", s.before, s)}${shot("after", s.after, s)}</div>
    ${s.mockup?.data && s.after?.data ? `<div class="group act"><button type="button" data-overlay aria-pressed="false">${esc(t("overlay"))}</button>`
      + `<label class="group sub" for="blend-${index + 1}">${esc(t("result"))} <input type="range" id="blend-${index + 1}" data-blend min="0" max="100" value="50"></label></div>` : ""}
    ${s.differences.length ? `<ul class="plain">${s.differences.map((d) => `<li>${prose(d.what)}${d.why ? ` <span class="sub">${esc(t("reason"))}: ${prose(d.why)}</span>` : ""}`
      + `${d.finding === undefined ? "" : ` <span class="tag v-remove">${esc(t("finding"))}</span> ${cite([d.finding])}`}</li>`).join("")}</ul>` : ""}
    ${s.match ? `<p><span class="tag v-keep">${esc(t("matches"))}</span></p>` : ""}
    ${s.missing ? `<p><span class="tag v-open">${esc(t("not-compared"))}</span> ${prose(s.missing)}</p>` : ""}
  </article>`).join("")}
</section>`;
}

// The units as written and as they should be: the target diagram draws only the uses the reviewer wrote, with a
// text equivalent of every arrow; the as-written diagram keeps its verdict shares.
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
  const edges = then.flatMap((n) => n.uses.filter((used) => used !== n.name).map((used) => `<li>${esc(n.name)} → ${esc(used)}</li>`));
  return `
<section id="structure" class="stack"><h2>${esc(t("structure"))}</h2>
  <div class="pair">${figure(t("as-written"), now)}${figure(t("target"), then)}</div>
  <p class="sub">${esc(t("diagram-note"))}</p>
  ${edges.length ? `<details><summary class="sub">${esc(t("uses"))}: ${esc(t("target"))} (${edges.length})</summary><ul class="plain sub">${edges.join("")}</ul><p class="sub">${esc(t("structure.declared-only"))}</p></details>` : `<p class="sub">${esc(t("structure.declared-only"))}</p>`}
  ${table([t("unit"), t("jobs"), t("uses"), t("verdict"), t("reason")], units.filter((u) => !u.existing).map((u) => `<tr><td class="mono">${esc(u.name)}</td><td>${esc(u.jobs.join(", "))}</td>`
    + `<td class="mono">${esc(u.uses.join(", ")) || esc(t("nothing"))}</td><td><span class="tag ${TONE[u.verdict]}">${esc(t(`verdict.${u.verdict}`))}</span> ${grounds(u)}</td><td>${prose(u.reason ?? "")}</td></tr>`))}
</section>`;
}

// Each change of the task walked through the code as written and through the target: where it is edited, what is read.
function scenarios({ scenarios: tried }, t) {
  if (!tried.length) return "";
  const side = (s) => !s ? `<td colspan="2" class="sub">${esc(t("as-now"))}</td>`
    : `<td>${s.edit.map((p) => `<div>${prose(p)}</div>`).join("")}</td><td>${(s.read ?? []).map((p) => `<div>${prose(p)}</div>`).join("") || esc(t("nothing"))}</td>`;
  return `
<section id="scenarios" class="stack"><h2>${esc(t("scenarios"))}</h2><p class="sub">${esc(t("scenarios-note"))}</p>
  ${table(["#", t("scenario"), `${t("as-written")}: ${t("edit")}`, `${t("as-written")}: ${t("read")}`, `${t("target")}: ${t("edit")}`, `${t("target")}: ${t("read")}`, t("findings")],
    tried.map((s) => `<tr data-where="${esc(`${t("scenarios")} ${s.id}`)}"><td class="n">${esc(s.id)}</td><td>${prose(s.change)}${s.requirements.length ? ` <span class="sub">(${esc(t("requirement").toLowerCase())} ${s.requirements.map(esc).join(", ")})</span>` : ""}</td>`
      + `${side(s.now)}${side(s.target)}<td class="n">${cite(s.findings)}</td></tr>`))}
</section>`;
}

// Where the change lives: a tree of the touched files, marked by what the diff did to them (never a verdict),
// each file linking into the one canonical map below. The full map sits in a closed disclosure, readable without
// scripts: no template, no second copy of the diff, one instance of every B anchor.
function filesAndMap(review, files, model, t) {
  const root = { dirs: new Map(), files: [] };
  for (const f of model.files) {
    const parts = f.path.split("/"), name = parts.pop();
    let at = root;
    for (const part of parts) { if (!at.dirs.has(part)) at.dirs.set(part, { dirs: new Map(), files: [] }); at = at.dirs.get(part); }
    at.files.push({ ...f, name });
  }
  const countFiles = (node) => node.files.length + [...node.dirs.values()].reduce((sum, child) => sum + countFiles(child), 0);
  const fileRow = (f) => {
    const own = model.blocks.filter((b) => b.path === f.path);
    const adds = own.reduce((sum, b) => sum + b.weightLines.added, 0), rems = own.reduce((sum, b) => sum + b.weightLines.removed, 0);
    const counts = VERDICTS.map((v) => [v, own.filter((b) => b.verdict === v).length]).filter(([, n]) => n);
    const mark = { A: ["+", "added"], D: ["−", "deleted"], M: ["±", "modified"] }[f.status] ?? ["±", "modified"];
    return `<li class="frow"><span class="fs fs-${f.status}" role="img" aria-label="${esc(t(`file.status.${mark[1]}`))}" title="${esc(t(`file.status.${mark[1]}`))}">${mark[0]}</span>`
      + `<a class="mono" href="#b${own[0].id}" title="${esc(f.path)}">${esc(f.short)}</a><span class="sub">+${adds}/−${rems}</span>${counts.map(([v, n]) => `<span class="tag v-${v}">${n}</span>`).join("")}</li>`;
  };
  // A directory with nothing but one directory in it is shown on that directory's line.
  const dir = (name, node) => node.dirs.size === 1 && !node.files.length ? dir(`${name}/${[...node.dirs.keys()][0]}`, [...node.dirs.values()][0])
    : `<li><details class="fdir"><summary class="mono sub">${esc(name)}/ <span class="sub">${countFiles(node)}</span></summary>${list(node)}</details></li>`;
  const list = (node) => `<ul>${[...node.dirs].map(([name, child]) => dir(name, child)).join("")}${node.files.map(fileRow).join("")}</ul>`;
  return `
<section id="files" class="stack"><h2>${esc(t("files"))} · ${model.files.length}</h2>
  <p class="sub">${esc(t("files.changed-only"))}</p>
  <div class="tree-nav"><div class="ftree">${list(root)}</div></div>
  <details class="audit-map" id="map-details"><summary>${esc(t("map"))} · ${model.counters.blocks} ${esc(t("blocks").toLowerCase())}</summary>
    <div class="group map-filters act"><span class="sub">${esc(t("show"))}</span><button type="button" data-show="all" aria-pressed="true">${esc(t("all"))}</button>${VERDICTS.map((v) => `<button type="button" data-show="${v}" aria-pressed="false">${esc(t(`verdict.${v}`))}</button>`).join("")}</div>
    <div id="map" class="map stack" data-show="all" style="--kept: ${esc(JSON.stringify(t("kept-by-you")))}">
      <p class="sub">${esc(t("map-summary", model.blocks.length))}</p>
      ${map(review, files, model, t)}
    </div>
  </details>
</section>`;
}

// The diff, file by file, cut into the blocks of the map.
function map(review, files, { blocks, owner }, t) {
  const shown = new Set(), finding = (id) => review.findings.find((f) => f.id === id);
  const decide = decider(t), verdict = (b) => `<span class="tag">${esc(t(`verdict.${b.verdict}`))}</span>`;
  const head = (b) => {
    if (shown.has(b.id)) return `<header><div class="row">${verdict(b)}<a href="#b${b.id}">B${b.id}</a><span class="sub">${esc(t("continued"))}</span></div></header>`;
    shown.add(b.id);
    return `<header><div class="row">${verdict(b)}<strong>B${b.id}</strong>${b.does ? `<span>${prose(b.does)}</span>` : ""}</div>`
      + `<div class="row sub"><span>${b.serves.length ? `${esc(t("serves"))} ${b.serves.map(esc).join(", ")}` : esc(t("serves-nothing"))}</span>`
      + `${b.unit ? `<span>${esc(t("in-unit"))} <span class="mono">${esc(b.unit)}</span></span>` : ""}<span class="mono">${esc(b.where)}</span></div>`
      + (b.findings.length ? `<ul>${b.findings.map((id) => `<li><a href="#f${esc(id)}">${esc(id)}. ${esc(finding(id).title)}</a>${decide(id)}</li>`).join("")}</ul>` : "")
      + (b.questions.length ? `<ul>${b.questions.map((n) => `<li><a href="#q${n}">Q${n}</a> ${prose(review.questions[n - 1].text)}</li>`).join("")}</ul>` : "")
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

// What the independent target, the critic and the verifier raised against the draft, and what became of each point.
function challenges(review, t) {
  if (!review.challenges?.length) return "";
  const tone = { accepted: "v-keep", rejected: "v-remove", owner: "v-open" };
  return `
<section id="challenges" class="stack"><h2>${esc(t("challenges"))}</h2><p class="sub">${esc(t("challenges-note"))}</p>
  ${table(["#", t("raised-by"), t("point"), t("outcome")], review.challenges.map((c, index) => `<tr data-where="${esc(`${t("challenges")} ${index + 1}`)}"><td class="n">${index + 1}</td>`
    + `<td>${esc(t(`challenger.${c.from}`))}</td><td>${prose(c.point)}</td>`
    + `<td><span class="tag ${tone[c.outcome]}">${esc(t(`outcome.${c.outcome}`))}</span> ${prose(c.note)}${c.at ? ` <code>${esc(c.at)}</code>` : ""}</td></tr>`))}
</section>`;
}

function mechanisms(review, model, t) {
  if (!review.mechanisms?.length) return "";
  return `<section id="mechanisms" class="stack"><h2>${esc(t("mechanisms"))}</h2>
    <p class="sub">${esc(t("mechanism-change"))}: ${mechanismCounts(review).map(([change, count]) => `${esc(t(`change.${change}`))}: ${count}`).join(" · ")}</p>
    ${model.together ? `<p><strong>${esc(t("weight.together"))}</strong> (${model.together.names.map(esc).join(", ")}): ${weightOverview(model.together, t, languageOf(review)).map((row) => `<strong>${esc(t(`weight.category.${row.kind}`))}:</strong> ${esc(row.text)}`).join(" · ") || esc(t("weight.unchanged"))}</p>` : ""}${model.mechanisms.map((m, i) => {
      const overview = weightOverview(m.weight, t, languageOf(review));
      const findings = (m.findings ?? []).map(id => review.findings.find(f => f.id === id));
      return `<article class="finding mechanism" id="m${i + 1}" data-where="${esc(t("mechanisms") + ': ' + m.name)}">
        <details><summary><h3>${esc(m.name)}</h3>
          <span class="mechanism-summary"><span class="mechanism-decision"><strong>${esc(t("recommendation"))}:</strong> ${prose(m.decision)}</span><br>
          ${overview.length ? overview.map(row => `<span><strong>${esc(t(`weight.category.${row.kind}`))}:</strong> ${esc(row.text)}</span>`).join(" · ")
            : esc(t(m.weight ? "weight.unchanged" : "weight.unknown"))}</span></summary>
        <div class="stack mechanism-content">
        ${overview.length ? `<div class="stack mechanism-weight">
          <details><summary>${esc(t("weight.evidence"))}</summary><div class="stack">
            <p>${esc(t("weight.exclusive"))}: ${esc(weightCountsText(m.weight.exclusive, t))}</p>
            ${(m.weight.shared ?? []).map(s => `<p class="sub">${esc(t("weight.shared"))} ${s.with.map(esc).join(", ")}: ${esc(weightCountsText({ [s.kind]: s }, t))} <a href="#b${s.block}">B${s.block}</a></p>`).join("")}
            <div class="group">${(m.blocks ?? []).map(id => `<a href="#b${id}">B${id}</a>`).join("")}</div><p class="sub">${esc(t("weight.note"))}</p>
          </div></details></div>` : ""}
        ${findings[0] ? `<p><strong>${esc(t("consequence"))}:</strong> ${prose(findings[0].what)} <a href="#f${esc(findings[0].id)}">${esc(t("shown-by"))}</a></p>` : ""}
        ${m.instead ? `<p><strong>${esc(t("instead"))}:</strong> ${prose(m.instead)}</p>` : ""}
        <div class="mechanism-tradeoff">${["benefit", "cost"].map(key => `<div><strong>${esc(t(key))}</strong>${lines(m[key])}</div>`).join("")}</div>
        <div class="group sub"><span>${esc(t(`evidence.${m.evidence}`))}</span>${findings.map(f => `<a href="#f${esc(f.id)}">${esc(t("finding"))} ${esc(f.id)}</a>`).join("")}</div>
        <details><summary>${esc(t("basis"))}</summary><div class="stack">
          <p><strong>${esc(t("purpose"))}:</strong> ${prose(m.purpose)}</p><p>${prose(m.basis)}</p>
          <p><strong>${esc(t("unit"))}:</strong> ${(m.units ?? []).map(name => `<code>${esc(name)}</code>`).join(", ") || esc(t("none"))}</p>
          <p class="sub">${esc(t("mechanism-change"))}: ${esc(t(`change.${m.change}`))}</p>
        </div></details>
        </div></details>
      </article>`;
    }).join("")}</section>`;
}

// The coverage: the authored statements by kind, and the record's own prose one click away.
function coverage(review, t) {
  const cs = review.coverageStructured;
  const grid = cs?.length ? `<div class="cov-grid">${["ran", "read", "not_checked"].map((kind) => {
    const items = cs.filter((c) => c.kind === kind);
    return items.length ? `<span class="label">${esc(coverageLabel(kind, t))}</span><div class="stack">${items.map((c) => `<p>${prose(c.text)}${c.revision ? ` <span class="sub mono">@ ${esc(c.revision)}</span>` : ""}${c.sources?.length ? ` <span class="sub">(${srcHtml(c.sources, review)})</span>` : ""}</p>`).join("")}</div>` : "";
  }).join("")}</div>` : "";
  const prosePart = `<p>${prose(review.coverage || t("none"))}</p>`;
  return `
<section id="coverage" class="stack"><h2>${esc(t("coverage"))}</h2>
  ${grid}
  ${cs?.length ? `<details><summary class="sub">${esc(t("coverage"))}: ${esc(t("as-written"))}</summary>${prosePart}</details>` : prosePart}
</section>`;
}

const decider = (t) => (id) => `<span class="decide group act" data-finding="${esc(id)}"><button type="button" value="apply">${esc(t("apply"))}</button><button type="button" value="skip">${esc(t("skip"))}</button></span>`;

export function page(review, files, model) {
  const t = labelsOf(review), decide = decider(t);
  const names = (label, ids) => ids?.length ? ` <strong>${esc(t(label))} ${ids.map(esc).join(", ")}.</strong>` : "";
  const findings = review.findings.map((f) => `
  <article class="finding" id="f${esc(f.id)}" data-where="${esc(`${t("finding")} ${f.id}`)}">
    <h3>${esc(f.id)}. ${esc(f.title)}</h3>
    <div class="group sub"><span>${esc(t(`direction.${f.direction}`))}</span><span>${esc(t(`evidence.${f.evidence}`))}</span>${placeHtml(f.at, model)}${model.blocks.filter((b) => b.findings.includes(f.id)).map(chip).join("")}</div>
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
    ${idea.at ? `<div class="group sub">${placeHtml(idea.at, model)}</div>` : ""}
    <p>${prose(idea.text)}</p>
    ${decide(idea.id)}
    <input class="act" type="text" id="note-${idea.id}" data-note="${idea.id}" placeholder="${esc(t("note-idea"))}" aria-label="${esc(t("note-idea"))}: ${esc(idea.title)}">
  </article>`).join("");
  // The page's script reads what it needs from here: the review's own name for its stored decisions, the digests
  // of the bytes it was drawn from, the questions with their variants, and the words it writes.
  const data = { title: review.title, range: review.range, key: model.key,
    digest: { record: model.recordSha ?? model.key, diff: review.diff?.sha256 ?? "" },
    findings: review.findings.map(({ id, title }) => ({ id, title })),
    questions: model.questions.map(({ id, kind, resolver, parent, children, variants }) => ({ id, kind, resolver, parent, children, variants: (variants ?? []).map(({ id, text }) => ({ id, text })) })),
    ideas: ideas.map(({ id, title }) => ({ id, title })),
    blocks: model.blocks.map(({ id, path, where, findings: cited }) => ({ id, path, where, findings: cited })),
    labels: { title: t("out.title"), apply: t("out.apply"), skip: t("out.skip"), ideas: t("out.ideas"), ideaNotes: t("out.idea-notes"), open: t("out.open"), blocks: t("out.blocks"),
      passages: t("out.passages"), passagesTitle: t("passages"), notePassage: t("note-passage"), remove: t("remove"), decided: t("decided", "{n}"), copy: t("copy"), copied: t("copied"), clearConfirm: t("clear-confirm"),
      questionsOut: t("out.questions"), variant: t("out.variant"), accepted: t("decision.accepted"), deferred: t("decision.deferred"), notApplicable: t("decision.not-applicable"), remaining: t("decision.remaining"),
      requiresContent: t("decision.requires-content"), deferReason: t("decision.defer-reason") },
    annotationLabels: Object.fromEntries(["annotation", "edit", "source", "unlocated", "saved", "deleted", "restored", "report"].map(k => [k, t(`annotation.${k}`)])) };
  const drawn = structure(model, t), link = (id, label) => `<a href="#${id}">${esc(t(label))}</a>`;
  const hasPictures = model.screens.some((s) => ["mockup", "before", "after"].some((shot) => s[shot]?.data));
  return `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t("kind"))}: ${esc(review.title)}</title>
<style>${STYLE}</style>
<a class="skip-link" href="#questions">${esc(t("skip-to-decisions"))}</a>
<div class="wrap" id="review-content" tabindex="-1">
<header class="stack"><span class="label">${esc(t("kind"))}</span><h1>${esc(review.title)}</h1></header>
<div class="bar global-nav"><nav>${link("summary", "summary")}${link("questions", "questions")}${link("findings", "findings")}${review.tradeoffs?.length ? link("tradeoffs", "tradeoffs") : ""}${link("requirements", "requirements")}${review.mechanisms?.length ? link("mechanisms", "mechanisms") : ""}${review.checks?.length ? link("checks", "checks") : ""}${model.screens.length ? link("screens", "screens") : ""}${drawn ? link("structure", "structure") : ""}${link("files", "files")}${model.scenarios.length ? link("scenarios", "scenarios") : ""}${offered ? link("ideas", "ideas") : ""}${review.challenges?.length ? link("challenges", "challenges") : ""}${link("coverage", "coverage")}${link("decisions", "decisions")}</nav><span class="sub act" id="progress"></span><span class="sub act" id="progress-q"></span></div>
${passport(review, model, t)}
${statusStrip(review, t)}
${counters(model, t)}
${summary(review, model, t)}
${questionsSection(review, model, t)}
<section id="findings" class="stack"><h2>${esc(t("findings"))}</h2>${findings || `<p>${esc(t("none"))}</p>`}</section>
${tradeoffs(review, t)}
${requirements(model, t)}
${mechanisms(review, model, t)}
${checks(review, t)}
${screens(review, model, t)}
${drawn}
${scenarios(model, t)}
${filesAndMap(review, files, model, t)}
${offered ? `<section id="ideas" class="stack"><h2>${esc(t("ideas"))}</h2><p class="sub">${esc(t("ideas-note"))}</p>${offered}</section>` : ""}
${challenges(review, t)}
${coverage(review, t)}
<section id="decisions" class="stack act" tabindex="-1"><h2>${esc(t("decisions"))}</h2>
  <p class="sub">${esc(t("decisions-note"))}</p>
  <div class="group"><button type="button" id="copy">${esc(t("copy"))}</button><button type="button" id="export-json">${esc(t("decisions-text"))} (JSON)</button><button type="button" id="print-owner">${esc(t("print.owner"))}</button><button type="button" id="print-audit">${esc(t("print.auditor"))}</button><button type="button" id="apply-all">${esc(t("apply-all"))}</button><button type="button" id="clear">${esc(t("clear-all"))}</button></div>
  <p class="sub">${esc(t("print.omissions"))}</p>
  <div class="group annotation-feedback"><span id="annotation-status" role="status" aria-live="polite"></span><button id="annotation-undo" type="button" hidden>${esc(t("annotation.undo"))}</button><button id="annotation-dismiss" type="button" aria-label="${esc(t("annotation.dismiss"))}">×</button></div><div id="passages" class="stack"></div>
  <textarea id="out" readonly aria-label="${esc(t("decisions-text"))}"></textarea></section>
<button type="button" id="comment" class="floating" aria-keyshortcuts="Alt+Shift+M" title="Alt+Shift+M">${esc(t("comment"))}</button>
<footer class="sub"><details><summary>${esc(t("report-details"))}</summary><code>${esc(review.range)} · ${model.key} · diff ${esc(review.diff?.sha256 ?? "")} · record ${esc(model.recordSha ?? model.key)}</code></details></footer>
</div>
${hasPictures ? `<dialog id="zoom-dialog" aria-label="${esc(t("screens"))}">
  <div class="zoom-bar">
    <button type="button" data-zoom-fit aria-pressed="true">${esc(t("viewer.fit"))}</button>
    <button type="button" data-zoom-full aria-pressed="false">${esc(t("viewer.actual-size"))}</button>
    <button type="button" data-zoom-prev aria-label="${esc(t("viewer.previous"))}">←</button>
    <span id="zoom-count" class="sub"></span>
    <button type="button" data-zoom-next aria-label="${esc(t("viewer.next"))}">→</button>
    <span id="zoom-name" class="sub"></span>
    <span id="zoom-historical" class="tag v-fix" hidden>${esc(t("screen.historical"))}</span>
    <form method="dialog"><button type="submit">${esc(t("viewer.close"))}</button></form>
  </div>
  <div class="zoom-scroll"><img alt=""></div>
</dialog>` : ""}
<dialog id="annotation-editor" aria-labelledby="annotation-heading">
  <h2 id="annotation-heading">${esc(t("note-passage"))}</h2><blockquote></blockquote>
  <textarea aria-label="${esc(t("note-passage"))}" rows="4"></textarea>
  <div class="group"><button type="button" data-annotation-action="save">${esc(t("annotation.save"))}</button><button type="button" data-annotation-action="cancel">${esc(t("annotation.cancel"))}</button><button type="button" data-annotation-action="delete">${esc(t("remove"))}</button></div>
</dialog>
<script id="data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<script>${SCRIPT}</script>
`;
}