// A checked review as a tabbed page: one file with no dependencies, readable without scripts (the panels
// stack, the map is complete in closed disclosures). Decision-first: the passport, the authored status, the
// counters, the verdict and the question cards come before the mechanics. With scripts: tabs with per-tab
// scroll memory and deep links, a map reader (segbar, popover, sources) with purpose/verdict/question filters,
// decision cards whose variant radio is the decision (a draft on a narrow screen until confirmed), an honest
// export, and owner/auditor print profiles. Old records without the new fields render through the same path.
import { address, blank } from "./diff.mjs";
import { diagram } from "./diagram.mjs";
import { highlight } from "./highlight.mjs";
import { labelsOf, languageOf } from "./labels.mjs";
import { VERDICTS, PURPOSES, mechanismCounts, sourceOf, weightCountsText, weightOverview } from "./review.mjs";
import { esc } from "./text.mjs";
import { annotations } from "./annotations.mjs";
import { decisionRuntime } from "./decisions.mjs";

const STYLE = `
/* One column per tab, decision-first. Every size is in rem on a 14px base (html 87.5%); code is .92em of it,
   secondary text never drops below 12px, and standalone controls keep a 32px tap target. */
:root { --bg: #f5f6f9; --surface: #ffffff; --fg: #1b2230; --muted: #5d6879; --line: #d8dde6; --accent: #3450c0; --code: #fafbfd; --string: #0c6b78; --number: #7b3fae;
  --keep: #1c7449; --keep-bg: #e4f3ea; --fix: #8f5b00; --fix-bg: #faefd3; --remove: #b02e28; --remove-bg: #fae5e2; --open-fg: #475069;
  --ins-bg: #e6ffec; --ins-line: #2da44a; --ins-text: #1a7f37; --del-bg: #ffebe9; --del-line: #cf222e;
  --bar-h: 3.6rem;
  --text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #11151c; --surface: #19202a; --fg: #e2e7ee; --muted: #97a3b4;
  --line: #2b3441; --accent: #93a8ff; --code: #141a22; --string: #74cbd6; --number: #c9a2f2; --keep: #62c995; --keep-bg: #163225; --fix: #e3b252; --fix-bg: #382c10;
  --remove: #f18d83; --remove-bg: #3e1f1c; --open-fg: #aab6c8;
  --ins-bg: rgba(46,160,67,.15); --ins-line: #3fb950; --ins-text: #3fb950; --del-bg: rgba(248,81,73,.12); --del-line: #f85149; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #11151c; --surface: #19202a; --fg: #e2e7ee; --muted: #97a3b4; --line: #2b3441; --accent: #93a8ff;
  --code: #141a22; --string: #74cbd6; --number: #c9a2f2; --keep: #62c995; --keep-bg: #163225; --fix: #e3b252; --fix-bg: #382c10; --remove: #f18d83; --remove-bg: #3e1f1c; --open-fg: #aab6c8;
  --ins-bg: rgba(46,160,67,.15); --ins-line: #3fb950; --ins-text: #3fb950; --del-bg: rgba(248,81,73,.12); --del-line: #f85149; color-scheme: dark }
* { box-sizing: border-box }
html { font-size: 87.5% }
body { margin: 0; background: var(--bg); color: var(--fg); font: 1rem/1.5 var(--text) }
.wrap { max-width: 90rem; margin: 0 auto; padding-block: 1rem 4rem; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));
  display: flex; flex-direction: column; gap: 1.25rem }
h1 { font-size: 1.5rem; line-height: 1.25; margin: 0; text-wrap: balance }
h2 { font-size: 1.2rem; margin: 0 0 .6rem }
h3 { font-size: 1rem; margin: 0 }
p { margin: 0; max-width: 78ch }
p, li, h1, h2, h3, summary, blockquote { overflow-wrap: anywhere }
a { color: var(--accent) }
code, pre, .mono { font-family: var(--mono); font-size: .92em }
code, .mono { font-size: max(.92em, 12px); overflow-wrap: anywhere }
pre code { font-size: 1em }
.sub { color: var(--muted); font-size: .9rem }
.stack { display: flex; flex-direction: column; gap: .6rem; min-width: 0 }
.label { font-size: 12px; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); font-weight: 650 }
.group { display: flex; flex-wrap: wrap; gap: .35rem .75rem; align-items: center }
.group > * { min-width: 0 }
button { font: inherit; font-size: .92rem; color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .3rem .7rem; min-height: 32px; cursor: pointer }
button:hover { border-color: var(--muted) }
button[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg) }
button:disabled { opacity: .55; cursor: not-allowed }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
[hidden] { display: none !important }
section, [data-anchor], .seg, .qcard, .finding, .mechanism { scroll-margin-top: 7rem }
/* Verdict tones: a border and a badge, never a fill over code. */
.v-keep { --v: var(--keep); --v-bg: var(--keep-bg) } .v-fix { --v: var(--fix); --v-bg: var(--fix-bg) } .v-remove { --v: var(--remove); --v-bg: var(--remove-bg) }
.v-open, .v-question { --v: var(--open-fg); --v-bg: var(--line) }
.tag { display: inline-block; padding: 0 .45rem; border-radius: 3px; background: var(--v-bg); color: var(--v); font-size: 12px; font-weight: 650; white-space: nowrap }
.chip { display: inline-block; margin: 0 .25rem .2rem 0; padding: 0 .4rem; border: 1px solid var(--v); border-radius: 3px; color: var(--v); font-size: 12px; text-decoration: none; font-weight: 600 }
.share { display: flex; height: .9rem; border-radius: 3px; overflow: hidden; background: var(--line) }
.share span { background: var(--v) }
.legend { display: flex; flex-wrap: wrap; gap: .25rem 1rem; font-variant-numeric: tabular-nums }
/* The page header: the title left, the theme icon at the right edge. */
.page-head { display: flex; align-items: flex-start; gap: .8rem }
.page-head > .stack { flex: 1 1 auto; min-width: 0 }
.theme-btn { flex: none; width: 32px; height: 32px; min-height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px }
.theme-btn svg { width: 18px; height: 18px; display: block }
/* The sticky bar carries the tabs alone; progress, export and theme live elsewhere. */
.bar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 1px solid var(--line); padding-block: .4rem;
  display: flex; flex-wrap: wrap; gap: .4rem 1rem; align-items: center }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg) }
.tabs { display: flex; gap: .2rem; overflow-x: auto; scrollbar-width: thin; flex: 1 1 30rem; min-width: 0; padding-bottom: 2px }
.tabs [role="tab"] { display: inline-flex; align-items: center; gap: .4rem; padding: .4rem .8rem; min-height: 36px; border: 1px solid transparent; border-bottom: 2px solid transparent;
  border-radius: 6px 6px 0 0; color: var(--muted); text-decoration: none; font-weight: 600; white-space: nowrap; font-size: .95rem }
.tabs [role="tab"]:hover { color: var(--fg); background: var(--surface) }
.tabs [role="tab"][aria-selected="true"] { color: var(--fg); background: var(--surface); border-color: var(--line); border-bottom-color: var(--accent) }
.tab-count { font-size: 12px; background: var(--line); color: var(--fg); border-radius: 1rem; padding: 0 .45rem; font-variant-numeric: tabular-nums }
.panel { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0 }
.skip-link { position: absolute; left: -9999px; top: 0; background: var(--accent); color: #fff; padding: .4rem .8rem; z-index: 50 }
.skip-link:focus { left: 0 }
/* The summary's roles: a label says which is which, the weight of the text says which to read first. */
.roles { background: var(--surface); border: 1px solid var(--line) }
.role { display: grid; grid-template-columns: 11rem minmax(0, 1fr); gap: .25rem 1.25rem; padding: .9rem 1.1rem; border-left: 4px solid transparent }
.role + .role { border-top: 1px solid var(--line) }
.role > .label { padding-top: .15rem }
.conclusion { border-left-color: var(--fg) } .conclusion > .label { color: var(--fg) }
.conclusion .lead { font-size: 1.15rem; font-weight: 600; line-height: 1.4 }
.actions { border-left-color: var(--accent); background: color-mix(in srgb, var(--accent) 7%, var(--surface)) } .actions > .label { color: var(--accent) }
.steps { margin: 0; padding-left: 1.4rem; max-width: 78ch; display: flex; flex-direction: column; gap: .2rem }
.doubt { margin-top: .3rem; padding-left: .6rem; border-left: 3px solid var(--fix); color: var(--fix) }
.compare { display: flex; flex-direction: column; gap: .4rem }
.cmp-head, .cmp-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.2rem }
.cmp-head { font-weight: 650; font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line); padding-bottom: .3rem }
.cmp-row > div { padding: .3rem .6rem; border-left: 3px solid var(--line); min-width: 0; display: flex; flex-direction: column; gap: .4rem }
.cmp-now { border-left-color: var(--muted) !important }
.cmp-target { border-left-color: var(--accent) !important; background: color-mix(in srgb, var(--accent) 5%, var(--surface)) }
@media (max-width: 700px) { .cmp-head, .cmp-row { grid-template-columns: minmax(0, 1fr) } .cmp-head span:last-child { display: none } }
.table { overflow-x: auto; background: var(--surface); border: 1px solid var(--line); max-width: 100% }
table { border-collapse: collapse; width: 100% }
th, td { text-align: left; vertical-align: top; padding: .4rem .7rem; border-bottom: 1px solid var(--line) }
tr:last-child td { border-bottom: 0 }
th { font-size: 12px; letter-spacing: .05em; text-transform: uppercase; color: var(--muted) }
td.n { font-variant-numeric: tabular-nums; white-space: nowrap }
td.state { min-width: 13rem }
td ol { margin: 0; padding-left: 1.2rem }
.req-count { font-variant-numeric: tabular-nums; white-space: nowrap }
.req-link { font-size: 12px; padding: .15rem .5rem; min-height: 32px }
/* The passport, the authored status, the counters. */
.passport-card { background: var(--surface); border: 1px solid var(--line) }
.passport-card > summary.passport { cursor: pointer; border: 0; display: list-item; padding: .6rem 1rem; font-size: .92rem; background: none; color: var(--fg) }
.passport-card > summary.passport > * { margin-right: 1.1rem }
.passport-card > summary.passport:hover { background: var(--code) }
.passport-body { padding: .5rem 1rem; border-top: 1px solid var(--line); font-size: 12px; color: var(--muted); overflow-wrap: anywhere }
.status-strip { display: grid; grid-template-columns: 1fr; gap: .35rem 1.4rem; background: color-mix(in srgb, var(--fix) 8%, var(--surface)); border: 1px solid var(--fix); border-left-width: 4px; padding: .7rem 1rem }
.status-strip .row { display: flex; gap: .5rem; align-items: baseline }
.status-strip .label { flex: none; min-width: 7rem }
@media (min-width: 760px) { .status-strip { grid-template-columns: 1fr 1fr } }
.counters { display: flex; flex-wrap: wrap; gap: .5rem 1.4rem; padding: .5rem 0; font-variant-numeric: tabular-nums }
.counters .c { display: flex; flex-direction: column; gap: .1rem }
.counters .c b { font-size: 1.3rem; line-height: 1 }
.counters .c span { font-size: 12px; color: var(--muted) }
.counters .split { border-left: 1px solid var(--line); padding-left: 1.4rem }
.count-note { flex-basis: 100%; margin: .2rem 0 0; font-size: 12px }
.count-note > summary { cursor: pointer; color: var(--muted); background: none; padding: 0 }
/* Decision cards: the variants on the surface, the status chip, the gate, the draft, the comment. */
.decisions-tools { display: flex; flex-wrap: wrap; gap: .5rem .9rem; align-items: center }
.decision-sheet { display: flex; flex-direction: column; gap: .8rem }
.qgroup-title { display: block; font-size: .95rem; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); font-weight: 650; margin-top: .4rem }
.qcard { background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--v, var(--muted)); padding: .7rem 1rem; display: flex; flex-direction: column; gap: .45rem; min-width: 0 }
.qcard > * { min-width: 0 }
.qcard.decision { --v: var(--accent) } .qcard.fact { --v: var(--number) } .qcard.evidence { --v: var(--fix) }
.qcard.child { margin-left: 1.6rem; border-left-style: dashed }
.qlegacy.child { margin-left: 1.6rem; padding: .1rem 0 }
.qcard.na { opacity: .8 }
.qcard .qhead { display: flex; flex-wrap: wrap; gap: .3rem .7rem; align-items: baseline }
.qcard .qhead > * { min-width: 0 }
.qcard .qhead h3 { font-size: 1.05rem; display: inline }
.qcard .qquestion { margin: .2rem 0 }
.qstatus { flex: none }
.qstatus[data-state="decided"] { --v: var(--keep); --v-bg: var(--keep-bg) }
.qstatus[data-state="deferred"] { --v: var(--fix); --v-bg: var(--fix-bg) }
.qstatus[data-state="draft"] { --v: var(--accent); --v-bg: color-mix(in srgb, var(--accent) 12%, var(--surface)) }
.qstatus[data-state="na"] { --v: var(--remove); --v-bg: var(--remove-bg) }
.qgate { border-left: 3px solid var(--fix); padding-left: .6rem; margin: .2rem 0 }
.qcard.na .qgate { border-left-color: var(--remove) }
.qdraft { border-left: 3px solid var(--fix); padding-left: .6rem; margin: .1rem 0 }
.qcard.na .qdraft { border-left-color: var(--remove) }
.qctx .label, .qopts .label, .qzones .label, .qremaining-block .label { display: block; margin-bottom: .2rem }
.qctx ul, .qzones ul { margin: 0 }
.qopts { border: 1px solid var(--line); border-radius: 6px; padding: .4rem .7rem .6rem; margin: .2rem 0; display: flex; flex-direction: column; gap: .4rem }
.qopts legend { font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); font-weight: 650; padding: 0 .3rem }
.qopt { display: flex; gap: .55rem; align-items: flex-start; padding: .45rem .6rem; border: 1px solid var(--line); border-radius: 4px; cursor: pointer; min-height: 32px }
.qopt:has(input:checked) { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 7%, var(--surface)) }
.qopt input { margin-top: .3rem; flex: none; width: 1.1rem; height: 1.1rem }
.qopt span span { display: block }
.qopt:has(input:disabled) { cursor: not-allowed; opacity: .7 }
.qadvice { font-size: .95rem; border-left: 3px solid var(--accent); padding-left: .6rem; margin: .2rem 0 }
.qactions { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center }
.qnote-wrap { display: flex; flex-direction: column; gap: .2rem }
.qnote-wrap label { font-size: 12px; color: var(--muted); font-weight: 600 }
textarea.qnote { width: 100%; min-height: 3.4rem; font: .92rem/1.45 var(--text); color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .4rem .6rem; field-sizing: content; resize: vertical }
.qzones label { display: flex; gap: .4rem; align-items: baseline; min-height: 32px }
.closes { font-size: .95rem } .closes b { color: var(--fg) }
/* Narrow screens: both variants fit the first screen; the recommendation moves below the options. */
@media (max-width: 700px) {
  .qcard .qadvice { order: 3 }
  .qcard .qnote-wrap { order: 4 }
  .qcard .qhead h3 { font-size: .95rem }
  .qcard .qopt { padding: .35rem .5rem }
  .qcard .qopt .sub { font-size: .875rem; line-height: 1.35 }
}
/* Findings, tradeoffs, ideas. */
.finding { background: var(--surface); border: 1px solid var(--line); padding: .7rem 1rem; display: flex; flex-direction: column; gap: .4rem; min-width: 0 }
.finding > * { min-width: 0 }
.tradeoff { background: color-mix(in srgb, var(--keep) 7%, var(--surface)); border: 1px solid var(--keep); border-left-width: 4px; padding: .6rem 1rem; display: flex; flex-direction: column; gap: .3rem }
.idea { border-color: var(--accent) }
.accent { --v: var(--accent); --v-bg: color-mix(in srgb, var(--accent) 12%, transparent) }
.decide { display: none }
.js .decide { display: flex }
input[type="text"] { font: inherit; color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .3rem .5rem; width: 100%; max-width: 40rem; min-height: 32px }
textarea { width: 100%; min-height: 14rem; font: .92rem/1.45 var(--mono); color: var(--fg); background: var(--surface); border: 1px solid var(--line); padding: .6rem .8rem }
.act { display: none }
.js .act { display: flex }
.js input.act, .js textarea.act { display: block }
.js .qnote-wrap.act { display: flex }
.js .nojs-note { display: none }
/* Mechanisms: the v3 card, the weight's limit on the surface, the methodology in the details. */
.mechanism { padding: 1rem 1.2rem; gap: .75rem }
.mechanism > details > summary { padding: 0; background: none; color: inherit; font-size: inherit }
.mechanism h3 { display: inline; font-size: 1.12rem }
.mechanism-summary { display: block; padding: .5rem 0 0 1.2rem }
.mechanism-content { padding-top: .75rem }
.mechanism-decision { color: var(--accent); font-weight: 600 }
.mechanism-tradeoff { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1rem; border-block: 1px solid var(--line); padding-block: .7rem }
.mechanism details .stack, .sources p { padding: .6rem .8rem }
.sources { overflow-wrap: anywhere }
/* The code tab: the purpose bar, the tree left, the map right. */
.code-controls { display: flex; flex-direction: column; gap: .5rem }
.purpose-bar { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center }
.purpose-bar button { font-size: .88rem; padding: .25rem .6rem }
.purpose-bar button b { font-variant-numeric: tabular-nums }
.map-filters { display: flex; flex-wrap: wrap; gap: .4rem .8rem; align-items: center }
.code-layout { display: grid; grid-template-columns: minmax(14rem, 17rem) minmax(0, 1fr); gap: 1rem; align-items: start }
.code-layout.hide-tree { grid-template-columns: minmax(0, 1fr) }
.code-layout.hide-tree .tree-col { display: none }
.tree-col { position: sticky; top: calc(var(--bar-h) + .5rem); max-height: calc(100dvh - var(--bar-h) - 1rem); overflow: auto; min-width: 0 }
.diff-col { min-width: 0; display: flex; flex-direction: column; gap: .6rem }
.mview-toggle { display: none }
@media (max-width: 900px) {
  .code-layout { grid-template-columns: minmax(0, 1fr) }
  .tree-col { position: static; max-height: 40dvh }
  .mview-toggle { display: flex; gap: .4rem }
  .code-layout[data-mview="tree"] .diff-col { display: none }
  .code-layout[data-mview="diff"] .tree-col { display: none }
}
.tree-nav { background: var(--surface); border: 1px solid var(--line); padding: .6rem .9rem }
.tree-filter { flex-wrap: wrap; gap: .4rem; align-items: center; margin: .4rem 0 }
.tree-filter label { flex: none }
.tree-filter input { flex: 1 1 8rem; max-width: none }
.ftree, .ftree ul { margin: 0; padding: 0; list-style: none }
.ftree ul { margin-left: .5rem; padding-left: .9rem; border-left: 1px solid var(--line) }
.fdir > summary { cursor: pointer; padding: .15rem 0; background: none }
.frow { display: flex; flex-wrap: wrap; gap: .3rem .6rem; align-items: baseline; padding: .15rem 0 }
.fname { background: none; border: 0; padding: .1rem 0; min-height: 32px; cursor: pointer; color: var(--accent); font-size: .92rem; text-align: left }
.fname:hover { text-decoration: underline }
.fs { display: inline-block; width: 1.3em; text-align: center; font-weight: 700; font-family: var(--mono) }
.fs-A { color: var(--keep) } .fs-D { color: var(--remove) } .fs-M { color: var(--accent) }
.fresult { flex-basis: 100%; font-size: 12px }
.file-lazy:not(:has(.file)) { display: none }
.filter-chip { position: sticky; top: var(--bar-h); z-index: 4; display: flex; flex-wrap: wrap; gap: .4rem .8rem; align-items: center; background: var(--accent); color: #fff; padding: .35rem .8rem; border-radius: 0 0 6px 6px; font-size: .92rem }
.filter-chip button { background: transparent; color: #fff; border-color: rgb(255 255 255 / .55); min-height: 32px; padding: .15rem .6rem; font-size: .88rem }
.filter-chip button:hover { border-color: #fff }
.filter-chip .chip-nav { display: inline-flex; gap: .3rem; align-items: center }
.filter-chip .chip-pos { font-variant-numeric: tabular-nums; font-size: .88rem }
/* The dark accent is light: white chip text would drop below 4.5:1. */
:root[data-theme="dark"] .filter-chip, :root[data-theme="dark"] .filter-chip button { color: #11151c }
:root[data-theme="dark"] .filter-chip button { border-color: rgb(17 21 28 / .55) }
:root[data-theme="dark"] .filter-chip button:hover { border-color: #11151c }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .filter-chip, :root:not([data-theme="light"]) .filter-chip button { color: #11151c }
  :root:not([data-theme="light"]) .filter-chip button { border-color: rgb(17 21 28 / .55) } }
.code-filtered .file > header { top: calc(var(--bar-h) + 2.6rem) }
/* Resolved-question blocks in attention mode: a visual cue, never hidden; code contrast untouched. */
.js .map[data-show="attention"] .seg.q-resolved > .segbar { background: var(--surface) }
.js .map[data-show="attention"] .seg.q-resolved > .segbar .does { color: var(--muted) }
.js .map[data-show="attention"] .seg.q-resolved > .segbar .bnum::after { content: " ✓"; color: var(--keep) }
.evidence-banner { display: flex; flex-wrap: wrap; gap: .4rem .9rem; align-items: baseline; background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--v); padding: .5rem .9rem }
.evidence-banner p { flex: 1 1 20rem; font-size: .95rem }
/* The map: one line per fragment, the code in a disclosure, the file header sticky. */
.map { display: flex; flex-direction: column; gap: .8rem }
.file { background: var(--surface); border: 1px solid var(--line); min-width: 0 }
.file > header { position: sticky; top: var(--bar-h); z-index: 3; background: var(--surface); padding: .45rem .8rem; border-bottom: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: .25rem .75rem; align-items: baseline }
.file > header > * { min-width: 0 }
.file > header strong.mono { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 0 1 auto; max-width: 100%; overflow-wrap: normal }
.file-details > summary { cursor: pointer; padding: .4rem .8rem; background: var(--surface); border: 1px solid var(--line); color: var(--fg); font-size: .92rem }
.seg { border-left: 3px solid var(--v, transparent); min-width: 0 }
.seg + .seg, .gap { border-top: 1px solid var(--line) }
.seg.overruled { --v: var(--muted); --v-bg: transparent }
.seg.overruled .segbar .tag::after { content: " → " var(--kept) }
.seg:target > .segbar, .finding:target, .qcard:target { outline: 2px solid var(--accent); outline-offset: -2px }
.segbar { display: flex; align-items: center; gap: .5rem; padding: .15rem .6rem; min-height: 32px; font-size: .88rem; background: color-mix(in srgb, var(--v-bg) 55%, var(--surface)); border-bottom: 1px solid var(--line) }
.segbar > * { min-width: 0 }
.segbar .dot { width: .6rem; height: .6rem; border-radius: 50%; background: var(--v); flex: none }
.segbar .bnum { font-weight: 700; flex: none; text-decoration: none; color: var(--fg) }
.segbar .bnum:hover { color: var(--accent) }
.segbar .does { flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.segbar .does code { overflow-wrap: normal }
.segbar .tag { flex: none; font-size: 12px }
.segbar .links { display: flex; gap: .45rem; flex: none }
.segbar .links a { text-decoration: none; font-weight: 600; font-size: 12px }
.segbar .src { flex: none; text-decoration: none; font-weight: 700; padding: 0 .2rem }
.segbar button { flex: none; min-height: 32px; padding: 0 .45rem; font-size: 12px }
.segmeta > summary, .segcode > summary { padding: .05rem .8rem; font-size: 12px; color: var(--muted); cursor: pointer; background: var(--code) }
.segmeta-body { padding: .4rem .8rem; display: flex; flex-direction: column; gap: .35rem; font-size: .9rem; background: var(--surface) }
.segmeta-body ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: .25rem }
.gap { padding: 0 .8rem; color: var(--muted); font-size: 12px; background: var(--code) }
/* The diff's three layers: the change kind paints the line (never the verdict), the gutter carries old and new. */
pre { margin: 0; overflow-x: auto; background: var(--code); padding: .3rem 0; line-height: 1.45; max-width: 100% }
pre code { display: inline-block; min-width: 100% }
.l { display: block; padding-right: .8rem; white-space: pre; border-left: 3px solid transparent }
.l b { display: inline-block; width: 3em; text-align: right; color: var(--muted); font-weight: 400; user-select: none; font-size: .95em }
.l b.new { margin-right: .5em }
.l i { display: inline-block; width: 1.2em; text-align: center; font-style: normal; user-select: none; font-weight: 700 }
.l.add { background: var(--ins-bg); border-left-color: var(--ins-line) }
.l.add i { color: var(--ins-text) }
.l.del { background: var(--del-bg); border-left-color: var(--del-line); color: var(--fg) }
.l.del i { color: var(--del-line) }
.l.ctx { color: var(--muted) }
/* Context lines drop syntax coloring for the muted base (>=4.5 on --code in both themes) — no opacity,
   so the gutters and markers stay readable too. Token colors are pre-adjusted at render time (highlight.mjs). */
.l.ctx span[style] { color: inherit !important }
/* Shiki dual theme: the light color inline, the dark via --shiki-dark — on screen only; print keeps the light. */
@media screen {
  :root[data-theme="dark"] .l span[style] { color: var(--shiki-dark) !important }
  :root[data-theme="dark"] .l.ctx span[style] { color: inherit !important }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .l span[style] { color: var(--shiki-dark) !important }
    :root:not([data-theme="light"]) .l.ctx span[style] { color: inherit !important } }
}
/* The built-in fallback highlighter's tones. */
.t-c { color: var(--muted); font-style: italic } .t-s { color: var(--string) } .t-n { color: var(--number) } .t-k { color: var(--accent) }
.l.ctx [class^="t-"] { color: inherit }
/* Verdict-mode hiding is JS-driven; without JS the whole map stays readable. */
.js .map[data-show="keep"] .seg:not(.v-keep), .js .map[data-show="fix"] .seg:not(.v-fix), .js .map[data-show="remove"] .seg:not(.v-remove), .js .map[data-show="question"] .seg:not(.v-question),
.js .map[data-show="attention"] .seg.v-keep, .js .map[data-show]:not([data-show="all"]) .gap { display: none }
/* The fragment popover. */
#seg-popover { position: fixed; z-index: 25; width: min(26rem, calc(100vw - 16px)); max-height: 70dvh; overflow: auto; background: var(--surface); color: var(--fg);
  border: 1px solid var(--line); border-radius: 8px; box-shadow: 0 8px 30px rgb(0 0 0 / .2); padding: .8rem .9rem; display: flex; flex-direction: column; gap: .5rem; font-size: .92rem }
#seg-popover .pop-head { display: flex; flex-wrap: wrap; gap: .4rem .6rem; align-items: baseline }
#seg-popover .pop-close { margin-left: auto; min-height: 32px; padding: .1rem .5rem }
#seg-popover ul { margin: 0; padding-left: 1.1rem }
#seg-popover label { font-size: 12px; color: var(--muted); font-weight: 600 }
#seg-popover input[type="text"] { max-width: none }
/* Structure, screens, coverage. */
.pair { display: flex; flex-wrap: wrap; gap: 1.25rem 2.5rem; align-items: flex-start }
figure { margin: 0; min-width: 0; max-width: 100%; display: flex; flex-direction: column; gap: .5rem }
.scroll { overflow-x: auto; max-width: 100% }
.graph { position: relative }
.graph svg { position: absolute; inset: 0 }
.unit { position: absolute; width: var(--w); height: var(--h); padding: 5px 9px 8px; display: flex; flex-direction: column; overflow: hidden;
  background: var(--surface); border: 1.5px solid var(--v, var(--muted)); border-radius: 4px; color: var(--fg); text-decoration: none; font-size: 12px; line-height: 1.3 }
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
.structure-target > summary { cursor: pointer; font-weight: 650; padding: .2rem 0; background: none; color: var(--fg); font-size: 1rem }
.shots figure { flex: 1 1 15rem; max-width: 34rem }
.shots img { display: block; width: 100%; height: auto; border: 1px solid var(--line) }
.shots a { overflow-wrap: anywhere }
.shots.overlaid { display: block; position: relative; max-width: 34rem }
.shots.overlaid .before { display: none }
.shots.overlaid .after { position: absolute; top: 0; left: 0; width: 100%; opacity: var(--blend, .5) }
.shots.overlaid .after figcaption { visibility: hidden }
.shot-open { font-size: 12px; align-self: flex-start }
img.shot-zoom { cursor: zoom-in }
img.shot-zoom:focus-visible { outline: 2px solid var(--accent) }
.shot-link { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; min-height: 32px; margin-left: .35rem; text-decoration: none; font-weight: 700; vertical-align: middle; border-radius: 4px }
.shot-link:hover { background: var(--code) }
.cov-grid { display: grid; grid-template-columns: 10rem minmax(0,1fr); gap: .3rem 1rem }
.cov-grid .label { padding-top: .1rem }
.plain { margin: 0; padding-left: 1.2rem; max-width: 78ch }
.export-json { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center }
footer { overflow-wrap: anywhere }
/* Annotations and the picture viewer. */
mark[data-annotation] { background: color-mix(in srgb, var(--accent) 18%, var(--surface)); color: inherit }
.annotation-marker { position: relative; user-select: none; min-width: 24px; height: 24px; padding: 0 .3rem; margin-inline: .15rem; border-radius: 1rem; background: var(--accent); color: var(--bg); font-size: 12px; vertical-align: super; line-height: 1 }
.annotation-marker::after { content: ""; position: absolute; inset: -4px }
.floating { position: absolute; z-index: 6; display: none; background: var(--accent); color: var(--bg); border-color: var(--accent); box-shadow: 0 2px 8px rgb(0 0 0 / .25) }
.floating.on { display: block }
.passage { display: flex; flex-direction: column; align-items: stretch; gap: .3rem; padding: .5rem .8rem; background: var(--surface); border: 1px solid var(--line) }
.passage p, .passage blockquote { white-space: pre-wrap; margin: 0 }
.passage blockquote { padding-left: .7rem; border-left: 3px solid var(--accent); overflow-wrap: anywhere }
#annotation-editor { position: fixed; margin: 0; width: min(32rem, calc(100vw - 16px)); max-height: calc(100dvh - 16px); overflow: auto; padding: 1rem; border: 1px solid var(--line); border-radius: .7rem; background: var(--surface); color: var(--fg); box-shadow: 0 8px 30px rgb(0 0 0 / .2); z-index: 20 }
#annotation-editor blockquote { margin: .5rem 0; border-left: 3px solid var(--accent); padding-left: .6rem; max-height: 6rem; overflow: auto; white-space: pre-wrap }
#annotation-editor textarea { min-height: 6rem; font: inherit; margin-block: .5rem; resize: vertical }
.annotation-feedback { position: fixed; z-index: 21; bottom: 1rem; right: 1rem; max-width: calc(100vw - 2rem); padding: .5rem .75rem; border: 1px solid var(--line); border-radius: .4rem; background: var(--surface); box-shadow: 0 2px 8px rgb(0 0 0 / .15) }
.annotation-feedback:has(#annotation-status:empty):has(button[hidden]) { display: none }
#zoom-dialog { position: fixed; inset: 0; margin: 0; width: 100vw; max-width: 100vw; height: 100dvh; max-height: 100dvh; border: 0; padding: 0; background: rgb(20 22 28 / .96); color: #eee; z-index: 40 }
#zoom-dialog::backdrop { background: rgb(0 0 0 / .7) }
.zoom-bar { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; padding: .6rem 1rem; background: rgb(0 0 0 / .4) }
.zoom-bar button { background: #2a2f3a; color: #eee; border-color: #444 }
.zoom-bar button[aria-pressed="true"] { background: #eee; color: #111 }
.zoom-bar form { margin-left: auto }
.zoom-scroll { overflow: auto; height: calc(100dvh - 3.6rem); padding: 1rem; display: flex }
#zoom-dialog[data-mode="fit"] .zoom-scroll img { max-width: 100%; max-height: 100%; object-fit: contain; margin: auto; cursor: zoom-in }
#zoom-dialog[data-mode="1:1"] .zoom-scroll img { max-width: none; width: auto; height: auto; margin: 0; cursor: zoom-out }
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth } }
@media (max-width: 40rem) { .bar { position: static } .role { grid-template-columns: minmax(0, 1fr) } .tabs { flex-basis: 100% }
  section, [data-anchor], .seg, .qcard, .finding, .mechanism { scroll-margin-top: 1rem } }
@media (max-width: 760px) { .mechanism-tradeoff { grid-template-columns: 1fr } }
/* Print: every panel prints; the owner profile hides the map and the tree, the auditor opens everything.
   The palette resets to light so both themes print readable; the light token colors are the inline ones. */
@media print {
  .bar, .decide, .act, #comment, #annotation-editor, .map-filters, .skip-link, button, .filter-chip, #seg-popover, .code-controls, .qactions, .decisions-tools, .theme-btn { display: none !important }
  .panel[hidden] { display: flex !important }
  :root, :root[data-theme="dark"] { --bg: #fff; --surface: #fff; --fg: #000; --muted: #444; --line: #999; --accent: #000; --code: #fff;
    --keep: #1c7449; --keep-bg: #fff; --fix: #8f5b00; --fix-bg: #fff; --remove: #b02e28; --remove-bg: #fff; --open-fg: #475069;
    --ins-bg: #fff; --del-bg: #fff; --string: #0c6b78; --number: #7b3fae; color-scheme: light }
  body { background: #fff; color: #000 } .wrap { max-width: none }
  .code-layout { display: block } .tree-col { position: static; max-height: none; overflow: visible; margin-bottom: 1rem }
  .file > header { position: static }
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
  let raw = {};
  try { raw = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
  let theme = raw.theme || "auto";
  let state = D.normalize(raw);
  state = D.settle(data.questions, state);
  const save = () => { try { localStorage.setItem(key, JSON.stringify({ ...state, theme })); } catch {} };
  document.documentElement.classList.add("js");
  // The radios, zone checks and filter controls ship disabled for the no-script reader; with the runtime they live.
  for (const control of all("[data-question-variant], [data-zone], button[disabled], input[disabled]")) control.disabled = false;
  for (const fieldset of all("fieldset.qopts")) fieldset.disabled = false;
  const qEntry = (id) => D.entryOf(state, id);
  const qById = Object.fromEntries(data.questions.map((q) => [String(q.id), q]));
  const blockById = Object.fromEntries(data.blocks.map((b) => [String(b.id), b]));
  const mobileMQ = matchMedia("(max-width: 700px)");
  const isMobile = () => mobileMQ.matches;
  const progOpen = (d) => { if (d && !d.open) d.open = true; };
  const variantLabel = (qid, v) => ((qById[String(qid)] || {}).variants || []).find((x) => x.id === v)?.text || v || "";
  const isNA = (q) => !!q.parent && !D.applicable(q, state, data.questions);
  const parentPending = (q) => { if (!q.parent) return false; const p = qById[String(q.parent.question)]; return !!p && !D.validAccept(p, state) && !D.validDefer(p, state); };

  // ---- theme: a 32px icon at the header's right edge; auto follows prefers-color-scheme ----
  const themeBtn = document.getElementById("theme-toggle");
  const THEME_ICONS = {
    auto: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>',
    light: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1"/></g></svg>',
    dark: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" fill="currentColor"/></svg>'
  };
  function applyTheme() {
    if (theme === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", theme);
    const name = t.theme[theme], next = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
    themeBtn.innerHTML = THEME_ICONS[theme];
    themeBtn.dataset.state = theme;
    themeBtn.setAttribute("aria-label", t.theme.current + " " + name + ". " + t.theme.next + " " + t.theme[next]);
    themeBtn.title = t.theme.current + " " + name + " → " + t.theme[next];
  }
  themeBtn.addEventListener("click", () => { theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto"; save(); applyTheme(); });
  applyTheme();

  // ---- tabs with per-tab scroll memory ----
  const tabs = all(".tabs [role=tab]"), panels = all(".panel");
  const scrollPos = new Map();
  let activeTab = "overview", codeReady = false;
  const panelOf = (id) => document.getElementById("panel-" + id);
  function measureBar() { const bar = document.querySelector(".bar"); if (bar && getComputedStyle(bar).position === "sticky") document.documentElement.style.setProperty("--bar-h", bar.offsetHeight + "px"); else document.documentElement.style.setProperty("--bar-h", "0px"); }
  measureBar(); window.addEventListener("resize", measureBar);
  if (window.ResizeObserver) new ResizeObserver(measureBar).observe(document.querySelector(".bar"));
  function activate(id, opts) {
    opts = opts || {};
    if (!panelOf(id)) return;
    if (activeTab !== id) scrollPos.set(activeTab, window.scrollY);
    activeTab = id;
    for (const tb of tabs) { const on = tb.dataset.tab === id; tb.setAttribute("aria-selected", String(on)); tb.tabIndex = on ? 0 : -1; }
    for (const p of panels) p.hidden = p.dataset.panel !== id;
    if (id === "code" && !codeReady) { codeReady = true; setMode(map.dataset.show || "attention"); }
    requestAnimationFrame(() => {
      if (opts.scrollTop != null) window.scrollTo(0, opts.scrollTop);
      else window.scrollTo(0, scrollPos.get(id) || 0);
      if (opts.focus && opts.focus.isConnected) opts.focus.focus({ preventScroll: true });
    });
  }
  for (const tb of tabs) tb.addEventListener("click", (e) => { e.preventDefault(); activate(tb.dataset.tab); history.replaceState(null, "", "#panel-" + tb.dataset.tab); });
  document.querySelector(".tabs").addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement); if (i < 0) return;
    let j = null;
    if (e.key === "ArrowRight") j = (i + 1) % tabs.length; else if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") j = 0; else if (e.key === "End") j = tabs.length - 1;
    if (j == null) return; e.preventDefault(); tabs[j].focus(); activate(tabs[j].dataset.tab); history.replaceState(null, "", "#panel-" + tabs[j].dataset.tab);
  });

  // ---- the lazy map: the no-script markup keeps every file in a closed disclosure; the runtime moves each
  // into a template and materializes what the current mode or filter needs. One canonical B anchor per block. ----
  const inserted = new Set(), segIndex = new Map();
  for (const host of all(".file-lazy")) {
    const det = host.querySelector(":scope > details.file-details");
    if (!det) continue;
    const tpl = document.createElement("template");
    tpl.id = "segs-" + host.dataset.file;
    tpl.content.append(det.querySelector(":scope > .file"));
    det.remove();
    host.append(tpl);
  }
  function indexSegs(host) { for (const s of host.querySelectorAll(".seg[data-block]")) { const k = s.dataset.block; if (!segIndex.has(k)) segIndex.set(k, []); segIndex.get(k).push(s); } }
  function insertFile(idx) {
    idx = String(idx);
    if (inserted.has(idx)) return;
    const tpl = document.getElementById("segs-" + idx), host = document.getElementById("file-" + idx);
    if (tpl && host) { host.append(tpl.content.cloneNode(true)); inserted.add(idx); indexSegs(host); applySegFilter(); paintResolvedSegs(host); }
  }
  function insertAll() { all(".file-lazy").forEach((h) => insertFile(h.dataset.file)); }
  function filesMatching(pred) { const s = new Set(); for (const b of data.blocks) if (pred(b)) s.add(String(data.blockFile[b.id])); return s; }
  function applySegFilter() {
    const req = map.dataset.req, q = map.dataset.q, f = map.dataset.f, purpose = map.dataset.purpose, mode = map.dataset.show || "attention";
    const filtering = !!(req || q || f || purpose);
    for (const seg of all("#map .seg[data-block]")) {
      let show = true;
      if (mode === "attention") show = seg.dataset.verdict !== "keep";
      else if (mode !== "all") show = seg.dataset.verdict === mode;
      if (req) show = show && (seg.dataset.serves || "").split(" ").includes(req);
      if (q) show = show && (seg.dataset.q || "").split(" ").includes(q);
      if (f) show = show && (seg.dataset.f || "").split(" ").includes(f);
      if (purpose) show = show && seg.dataset.purpose === purpose;
      seg.style.display = show ? "" : "none";
    }
    for (const gap of all("#map .gap")) gap.style.display = filtering ? "none" : "";
    for (const host of all(".file-lazy")) {
      const file = host.querySelector(".file"); if (!file) continue;
      if (!filtering) { file.style.display = ""; continue; }
      const any = [...file.querySelectorAll(".seg[data-block]")].some((s) => s.style.display !== "none");
      file.style.display = any ? "" : "none";
    }
    document.getElementById("panel-code").classList.toggle("code-filtered", filtering);
    updateChip();
  }
  function setMode(v) {
    map.dataset.show = v;
    if (v === "all") insertAll();
    else if (v === "attention") filesMatching((b) => b.verdict !== "keep").forEach(insertFile);
    else filesMatching((b) => b.verdict === v).forEach(insertFile);
    for (const other of all("[data-show]")) if (other !== map) other.setAttribute("aria-pressed", String(other.dataset.show === v));
    applySegFilter();
  }
  function setPurpose(cat) {
    if (map.dataset.purpose === cat) delete map.dataset.purpose; else { map.dataset.purpose = cat; filesMatching((b) => b.purpose === cat).forEach(insertFile); }
    for (const b of all("[data-purpose-filter]")) b.setAttribute("aria-pressed", String(b.dataset.purposeFilter === map.dataset.purpose));
    applyTreeFilter();
    applySegFilter();
  }

  // ---- C2: the tree's name filter, AND with the purpose filter ----
  const treeInput = document.getElementById("tree-filter-input"), treeClear = document.getElementById("tree-filter-clear"), treeCount = document.getElementById("tree-filter-count");
  function applyTreeFilter() {
    const purpose = map.dataset.purpose, query = treeInput.value.trim().toLowerCase();
    let visible = 0;
    for (const row of all(".frow")) {
      const path = (data.files[+row.dataset.frow] || "").toLowerCase();
      const show = (!purpose || row.dataset.purpose === purpose) && (!query || path.includes(query));
      row.style.display = show ? "" : "none"; if (show) visible++;
    }
    for (const dir of all(".fdir")) { const any = [...dir.querySelectorAll(".frow")].some((r) => r.style.display !== "none"); dir.style.display = any ? "" : "none"; if (query && any) dir.open = true; }
    treeCount.textContent = query || purpose ? t.files.toLowerCase() + ": " + visible + " / " + data.files.length : "";
    treeClear.disabled = !query;
  }
  treeInput.addEventListener("input", applyTreeFilter);
  treeClear.addEventListener("click", () => { treeInput.value = ""; applyTreeFilter(); treeInput.focus(); });
  function resetTreeFilter() { treeInput.value = ""; applyTreeFilter(); }

  // ---- C4: the filter chip with prev/next matches and a way back ----
  const chip = document.getElementById("filter-chip"), chipLabel = document.getElementById("filter-chip-label");
  const chipPos = document.getElementById("filter-pos"), chipPrev = document.getElementById("filter-prev"), chipNext = document.getElementById("filter-next"), chipBack = document.getElementById("filter-back");
  let returnState = null, chipIdx = 0, chipKey = "";
  const chipMatches = () => [...document.querySelectorAll("#map .seg[data-block]")].filter((s) => s.style.display !== "none" && s.offsetParent !== null);
  function paintChipPos(n) { chipPos.textContent = n ? (chipIdx + 1) + " / " + n : "0"; chipPrev.disabled = chipNext.disabled = !n; }
  function updateChip() {
    const q = map.dataset.q, req = map.dataset.req, f = map.dataset.f, purpose = map.dataset.purpose;
    if (!q && !req && !f && !purpose) { chip.hidden = true; chipKey = ""; return; }
    const ck = q ? "q" + q : req ? "req" + req : f ? "f" + f : "purpose:" + purpose;
    if (ck !== chipKey) { chipKey = ck; chipIdx = 0; }
    let label;
    if (q || req || f) {
      const bs = q ? data.blocks.filter((b) => (b.questions || []).includes(+q)) : req ? data.blocks.filter((b) => (b.serves || []).includes(+req)) : data.blocks.filter((b) => (b.findings || []).includes(+f));
      const n = bs.length, parts = bs.reduce((s, b) => s + (b.parts || 1), 0);
      label = (q ? "Q" + q : req ? t.chip.requirement.replace("{n}", req) : t.chip.finding.replace("{n}", f)) + " · " + t.blocksWord + ": " + n + (parts > n ? " · " + t.fragments + ": " + parts + " (" + t.withParts + ")" : "");
    } else {
      const n = data.blocks.filter((b) => b.purpose === purpose).length;
      label = t.chip.purpose.replace("{n}", data.purposeLabels[purpose] || purpose) + " · " + t.blocksWord + ": " + n;
    }
    chipLabel.textContent = label;
    chipBack.hidden = !returnState;
    chip.hidden = false;
    const m = chipMatches();
    if (chipIdx >= m.length) chipIdx = 0;
    paintChipPos(m.length);
  }
  function chipJump(delta) {
    const m = chipMatches(); if (!m.length) return;
    chipIdx = (chipIdx + delta + m.length) % m.length;
    const seg = m[chipIdx];
    progOpen(seg.querySelector(".segcode"));
    seg.scrollIntoView({ block: "start" });
    if (!seg.matches("[tabindex]")) seg.tabIndex = -1;
    seg.focus({ preventScroll: true });
    paintChipPos(m.length);
  }
  chipPrev.addEventListener("click", () => chipJump(-1));
  chipNext.addEventListener("click", () => chipJump(1));
  function jumpToFilter(kind, id, push) {
    returnState = { scroll: window.scrollY, tab: activeTab, focus: document.activeElement };
    activate("code");
    delete map.dataset.req; delete map.dataset.q; delete map.dataset.f; delete map.dataset.purpose;
    for (const b of all("[data-purpose-filter]")) b.setAttribute("aria-pressed", "false");
    resetTreeFilter();
    setMode("all");
    if (kind === "q") map.dataset.q = String(id); else if (kind === "f") map.dataset.f = String(id); else map.dataset.req = String(id);
    filesMatching((b) => kind === "q" ? (b.questions || []).includes(+id) : kind === "f" ? (b.findings || []).includes(+id) : (b.serves || []).includes(+id)).forEach(insertFile);
    applySegFilter();
    if (push !== false) history.pushState(null, "", "#" + (kind === "q" ? "q" + id : kind === "f" ? "f" + id : "req" + id) + "-code");
    requestAnimationFrame(() => {
      const first = [...document.querySelectorAll("#map .seg[data-block]")].find((s) => s.style.display !== "none" && s.offsetParent !== null);
      if (first) { progOpen(first.querySelector(".segcode")); first.scrollIntoView({ block: "start" }); }
    });
  }
  function clearFilters(opts) {
    opts = opts || {};
    delete map.dataset.req; delete map.dataset.q; delete map.dataset.f; delete map.dataset.purpose;
    for (const b of all("[data-purpose-filter]")) b.setAttribute("aria-pressed", "false");
    applyTreeFilter();
    applySegFilter();
    if (opts.back && returnState) {
      const rs = returnState; returnState = null;
      activate(rs.tab, { scrollTop: rs.scroll, focus: rs.focus });
      history.replaceState(null, "", "#panel-" + rs.tab);
    }
  }
  chipBack.addEventListener("click", () => clearFilters({ back: true }));
  document.getElementById("filter-clear").addEventListener("click", () => { clearFilters(); history.replaceState(null, "", "#panel-code"); });

  // ---- deep links: a tab, a filtered map view, a block in any mode, or any anchor in its panel ----
  function openTarget(hash) {
    if (!hash || hash[0] !== "#") return;
    const pm = /^#panel-(\\w+)$/.exec(hash); if (pm) { activate(pm[1]); return; }
    const fm = /^#(q|req|f)(\\d+)-code$/.exec(hash); if (fm) { jumpToFilter(fm[1], fm[2], false); return; }
    const bm = /^#b(\\d+)$/.exec(hash);
    let el = null;
    if (bm) {
      clearFilters();
      resetTreeFilter();
      activate("code");
      // A deep link reveals its block in ANY verdict mode: reset to the full audit, not just the filters.
      setMode("all");
      el = document.getElementById("b" + bm[1]);
      if (el) progOpen(el.querySelector(".segcode"));
    } else { try { el = document.querySelector(hash); } catch { return; } }
    if (!el) return;
    const panel = el.closest(".panel");
    if (panel) activate(panel.dataset.panel, { scrollTop: 0 });
    for (let p = el; p; p = p.parentElement) if (p.tagName === "DETAILS") progOpen(p);
    if (el.matches("article.mechanism")) el.querySelectorAll("details").forEach((d) => progOpen(d));
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: "start" });
      if (panel) scrollPos.set(panel.dataset.panel, window.scrollY);
      if (!el.matches("a,button,input,textarea,[tabindex]")) el.tabIndex = -1;
      el.focus({ preventScroll: true });
    });
  }
  window.addEventListener("hashchange", () => openTarget(location.hash));

  // ---- the fragment popover: details, sources (add at head, del at base), an honest copy, a comment ----
  const pop = document.getElementById("seg-popover");
  let popReturn = null;
  const escs = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function closePop() { if (pop.hidden) return; pop.hidden = true; if (popReturn && popReturn.isConnected) popReturn.focus({ preventScroll: true }); popReturn = null; }
  function openPop(id, anchor) {
    const b = blockById[String(id)]; if (!b) return;
    popReturn = anchor;
    const finds = (b.findings || []).map((fid) => { const f = data.findings.find((x) => String(x.id) === String(fid)); return f ? "<li><a href='#f" + escs(fid) + "'>" + escs(fid) + "</a> " + escs(f.title) + "</li>" : ""; }).join("");
    const qs = (b.questions || []).map((n) => { const q = qById[String(n)]; return "<li><a href='#q" + n + "'>Q" + n + "</a> " + escs(q ? q.text : "") + "</li>"; }).join("");
    const srcRow = (label, line, rev) => "<p class='sub'>" + label + ": <span class='mono'>" + escs(b.path) + ":" + line + "</span>" +
      (rev ? " · " + t.revision + " <span class='mono'>" + escs(rev) + "</span> <button type='button' class='pop-copy' data-copy='" + escs(b.path + ":" + line + " (" + rev + ")") + "'>" + t.copySource + "</button>"
        : " <button type='button' class='pop-copy' data-copy='" + escs(b.path + ":" + line) + "'>" + t.copySourcePlain + "</button>") + "</p>";
    const srcHtml = (data.pr.url ? "<p class='sub'>" + t.source + ": <a href='" + escs(data.pr.url) + "' target='_blank' rel='noopener'>" + escs(data.pr.label || data.pr.url) + " ↗</a></p>" : "") +
      (b.firstAdd != null ? srcRow(t.addedLine, b.firstAdd, data.pr.head) : "") +
      (b.firstDel != null ? srcRow(t.removedLine, b.firstDel, data.pr.base) : "") +
      (b.firstAdd == null && b.firstDel == null ? "<p class='sub'>" + t.noLine + "</p>" : "");
    pop.innerHTML =
      "<div class='pop-head'><strong class='mono'>B" + b.id + "</strong><span class='tag v-" + b.verdict + "'>" + escs(t.verdict[b.verdict] || b.verdict) + "</span>" +
      "<button type='button' class='pop-close' aria-label='" + escs(t.close) + "'>×</button></div>" +
      (b.does ? "<p>" + escs(b.does) + "</p>" : "<p class='sub'>" + t.keptNoDoes + "</p>") +
      (finds ? "<div><span class='label'>" + t.findings + "</span><ul>" + finds + "</ul></div>" : "") +
      (qs ? "<div><span class='label'>" + t.questions + "</span><ul>" + qs + "</ul></div>" : "") +
      "<p class='sub'>" + escs(b.serves && b.serves.length ? t.serves + " " + b.serves.join(", ") : t.servesNothing) +
      (b.unit ? " · " + t.inUnit + " " + escs(b.unit) : "") + " · <span class='mono'>" + escs(b.where) + "</span></p>" +
      srcHtml +
      "<label for='pop-note'>" + t.noteBlock + "</label><input type='text' id='pop-note' data-note='b" + b.id + "'>";
    pop.querySelector("[data-note]").value = state.notes["b" + b.id] || "";
    pop.hidden = false;
    const r = anchor.getBoundingClientRect();
    pop.style.left = Math.max(8, Math.min(r.left, innerWidth - pop.offsetWidth - 8)) + "px";
    pop.style.top = Math.max(8, Math.min(r.bottom + 6, innerHeight - pop.offsetHeight - 8)) + "px";
    pop.querySelector(".pop-close").focus();
  }
  pop.addEventListener("click", (e) => {
    if (e.target.closest(".pop-close")) { closePop(); return; }
    if (e.target.closest("a")) { closePop(); return; }
    const cp = e.target.closest(".pop-copy");
    if (cp) {
      const txt = cp.dataset.copy, original = cp.textContent;
      const done = () => { pop.querySelector(".pop-copy-status")?.remove(); cp.textContent = t.copied; setTimeout(() => { cp.textContent = original; }, 1200); };
      const fail = () => {
        // Select the visible source text and say plainly that automatic copying failed.
        const p = cp.closest("p"), r = document.createRange();
        r.setStart(p.firstChild, 0); r.setEndBefore(cp);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        let status = pop.querySelector(".pop-copy-status");
        if (!status) { status = document.createElement("p"); status.className = "sub pop-copy-status"; status.setAttribute("role", "status"); p.after(status); }
        status.textContent = t.copyFailed;
      };
      try { navigator.clipboard.writeText(txt).then(done, fail); } catch { fail(); }
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pop.hidden) { e.preventDefault(); closePop(); } });
  document.addEventListener("click", (e) => { if (!pop.hidden && !pop.contains(e.target) && !e.target.closest("[data-segpop]")) closePop(); });

  // ---- the decisions text and the honest export ----
  function decisions() {
    const note = (id) => state.notes[id] ? " — " + state.notes[id] : "";
    const line = (f) => "- " + f.id + ". " + f.title + note("f" + f.id);
    const of = (value) => data.findings.filter((f) => state.findings[f.id] === value).map(line);
    const open = data.findings.filter((f) => !state.findings[f.id]);
    const blocks = data.blocks.filter((b) => state.notes["b" + b.id]).map((b) => "- " + b.path + " " + b.where + ": " + state.notes["b" + b.id]);
    const idea = (i) => "- " + i.title + note(i.id), taken = (i) => state.findings[i.id] === "apply";
    // A question's decision travels with its variant's id and text. The status is the valid decision: a bare
    // acceptance or deferral, and a draft, are copied without one, never as accepted or deferred.
    const qs = data.questions.filter((q) => q.kind === "decision").filter((q) => { const e = qEntry(q.id); return (e.choice || e.variant) && D.applicable(q, state, data.questions); }).map((q) => {
      const e = qEntry(q.id), v = (q.variants || []).find((v) => v.id === e.variant);
      const status = D.validAccept(q, state) ? t.accepted : D.validDefer(q, state) ? t.deferred : e.variant ? t.draft : "";
      return "- Q" + q.id + (status ? " [" + status + "]" : "") + (v ? " (" + t.variant + " " + v.id + ": " + v.text + ")" : "") + note("q" + q.id);
    });
    const marked = state.passages.map((p, i) => "- " + (i + 1) + ". " + p.where + (p.anchor ? " [" + p.anchor.id + ":" + p.anchor.start + "-" + p.anchor.end + "]" : "") + ": \\"" + p.quote + "\\"" + (p.note ? " — " + p.note : ""));
    const part = (title, lines) => lines.length ? ["", title, ...lines] : [];
    return [t.title + " \\"" + data.title + "\\" (" + data.range + ", " + data.key + ")", ...part(t.apply, of("apply")), ...part(t.skip, of("skip")),
      ...(open.length ? ["", t.open + " " + open.map((f) => f.id).join(", "), ...open.filter((f) => state.notes["f" + f.id]).map(line)] : []),
      ...part(t.questionsOut, qs), ...part(t.ideas, data.ideas.filter(taken).map(idea)), ...part(t.ideaNotes, data.ideas.filter((i) => !taken(i) && state.notes[i.id]).map(idea)),
      ...part(t.blocks, blocks), ...part(t.passages, marked)].join("\\n");
  }
  // «Copied» only after the clipboard confirms; on refusal the text is selected where it lives and the
  // reader is told to press Ctrl/⌘+C.
  function copyDecisionsText(button) {
    const done = () => { annotationUI.announce(t.copied); button.textContent = t.copied; setTimeout(() => { button.textContent = t.copyText; }, 1500); };
    const fail = () => {
      if (activeTab !== "materials") activate("materials");
      requestAnimationFrame(() => { out.scrollIntoView({ block: "center" }); out.focus({ preventScroll: true }); out.select(); });
      annotationUI.announce(t.copyFailed);
    };
    try { navigator.clipboard.writeText(out.value).then(done, fail); } catch { fail(); }
  }
  function downloadJson() {
    const payload = D.exportOf(data.questions, state, { recordSha: data.digest.record, diffSha: data.digest.diff, key: data.key, title: data.title, range: data.range });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "decisions-" + data.key + ".json"; a.click(); URL.revokeObjectURL(a.href);
  }

  // ---- paint ----
  function paint() {
    for (const group of all(".decide")) {
      const id = group.dataset.finding;
      const current = id[0] === "q" ? qEntry(id.slice(1)).choice : state.findings[id];
      for (const button of group.querySelectorAll("button")) button.setAttribute("aria-pressed", String(current === button.value));
    }
    for (const block of data.blocks) {
      if (!block.findings.length) continue;
      const parts = segIndex.get(String(block.id)); if (!parts) continue;
      const kept = block.findings.every((f) => state.findings[f] === "skip");
      for (const part of parts) part.classList.toggle("overruled", kept);
    }
    for (const input of all("[data-note]")) if (document.activeElement !== input) input.value = state.notes[input.dataset.note] || "";
    for (const card of all(".qcard[data-qid]")) {
      const q = qById[card.dataset.qid]; if (!q) continue;
      const e = qEntry(q.id), na = isNA(q), pending = parentPending(q);
      card.classList.toggle("na", na);
      const chipEl = card.querySelector("[data-qstatus]");
      if (chipEl) {
        let stateName = "open", text = t.status.open;
        if (na) { stateName = "na"; text = t.notApplicable; }
        else if (e.choice === "accepted" && e.variant) { stateName = "decided"; text = t.status.decided.replace("{n}", variantLabel(q.id, e.variant)); }
        else if (e.choice === "deferred") { stateName = "deferred"; text = t.deferred; }
        else if (e.variant) { stateName = "draft"; text = t.status.draft.replace("{n}", variantLabel(q.id, e.variant)); }
        chipEl.dataset.state = stateName; chipEl.textContent = text;
      }
      const gate = card.querySelector("[data-qgate]");
      if (gate) {
        if (na) { gate.hidden = false; gate.textContent = t.gateNa.replace("{n}", q.parent.question) + (e.variant ? t.gateDraft.replace("{n}", variantLabel(q.id, e.variant)) : ""); }
        else if (pending) { gate.hidden = false; gate.textContent = t.gatePending.replace("{n}", q.parent.question); }
        else gate.hidden = true;
      }
      // A variant survives a deferral, an outside parent variant or an unconfirmed mobile pick as a DRAFT;
      // the radio reads as an active choice only for a confirmed decision on an applicable card.
      const draftEl = card.querySelector("[data-qdraft]");
      if (draftEl) {
        const showDraft = !na && !pending && e.variant && e.choice !== "accepted";
        draftEl.hidden = !showDraft;
        if (showDraft) draftEl.textContent = (e.choice === "deferred" ? t.draftDeferred : t.draftMobile).replace("{n}", variantLabel(q.id, e.variant));
      }
      const confirmBtn = card.querySelector("[data-confirm]");
      if (confirmBtn) confirmBtn.hidden = na || pending || !(e.variant && e.choice !== "accepted");
      for (const radio of card.querySelectorAll("[data-question-variant]")) radio.checked = !na && !pending && (e.choice === "accepted" || e.choice === "draft") && e.variant === radio.value;
      const disabled = na || pending;
      for (const el of card.querySelectorAll(".qopts input, .qactions button, .decide button, [data-note], [data-zone]")) el.disabled = disabled;
      const fs = card.querySelector(".qopts"); if (fs) fs.disabled = disabled;
      const badge = card.querySelector(".na-badge"); if (badge) badge.hidden = !na;
      const hint = card.querySelector(".requires-content");
      if (hint) {
        const missing = (e.choice === "accepted" && !D.validAccept(q, state)) || (e.choice === "deferred" && !D.validDefer(q, state));
        hint.hidden = !missing; hint.textContent = e.choice === "deferred" ? t.deferReason : t.requiresContent;
      }
    }
    for (const z of all("[data-zone]")) { const card = z.closest(".qcard"); const na = card && card.classList.contains("na"); if (!na) z.checked = !!state.zones[z.dataset.zone]; }
    progress.textContent = t.decided.replace("{n}", data.findings.filter((f) => state.findings[f.id]).length + " / " + data.findings.length);
    if (progressQ && data.questions.some((q) => q.kind === "decision")) {
      const c = D.counters(data.questions, state);
      progressQ.textContent = [t.accepted + ": " + c.accepted, t.deferred + ": " + c.deferred, t.notApplicable + ": " + c.notApplicable, t.remaining + ": " + c.remaining].join(" · ");
      const cnt = document.getElementById("count-decisions"); if (cnt) cnt.textContent = t.tabRemaining.replace("{n}", c.remaining);
    }
    out.value = decisions();
    paintResolvedSegs(map);
  }
  // C4b: a question block whose every question is decided (or not applicable) gets a cue in attention mode.
  function paintResolvedSegs(scope) {
    for (const seg of scope.querySelectorAll(".seg[data-block]")) {
      const b = blockById[seg.dataset.block]; if (!b) continue;
      const qs = b.questions || [];
      const resolved = qs.length > 0 && qs.every((n) => { const q = qById[String(n)]; if (!q) return false; const e = qEntry(n); return (e.choice === "accepted" && e.variant) || isNA(q); });
      seg.classList.toggle("q-resolved", resolved);
    }
  }

  // ---- the picture viewer: fit or actual size, previous and next, focus returned to the thumbnail ----
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

  // ---- events ----
  document.addEventListener("click", (event) => {
    const zbtn = event.target.closest("button.shot-open"); if (zbtn) { showZoom(+zbtn.dataset.zoom); return; }
    const img = event.target.closest("img.shot-zoom"); if (img) { showZoom(shots.indexOf(img)); return; }
    const segpop = event.target.closest("[data-segpop]"); if (segpop) { openPop(segpop.dataset.segpop, segpop); return; }
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
    } else if (button.dataset.show) { setMode(button.dataset.show); return; }
    else if (button.dataset.purposeFilter) { setPurpose(button.dataset.purposeFilter); return; }
    else if (button.dataset.reqFilter !== undefined) { jumpToFilter("req", button.dataset.reqFilter); return; }
    else if (button.dataset.qFilter !== undefined) { jumpToFilter("q", button.dataset.qFilter); return; }
    else if (button.dataset.fFilter !== undefined) { jumpToFilter("f", button.dataset.fFilter); return; }
    else if (button.dataset.confirm) { const k = button.dataset.confirm, cur = { ...qEntry(k) }; if (cur.variant) { cur.choice = "accepted"; state.questions[k] = cur; } }
    else if (button.dataset.defer) { const k = button.dataset.defer, cur = { ...qEntry(k) }; cur.choice = "deferred"; state.questions[k] = cur; }
    else if (button.dataset.qreset) { delete state.questions[button.dataset.qreset]; }
    else if (button.id === "hide-tree") { const on = document.getElementById("code-layout").classList.toggle("hide-tree"); button.setAttribute("aria-pressed", String(on)); button.textContent = on ? t.treeShow : t.treeHide; return; }
    else if (button.dataset.mview) { document.getElementById("code-layout").dataset.mview = button.dataset.mview; for (const b of all("[data-mview]")) b.setAttribute("aria-pressed", String(b.dataset.mview === button.dataset.mview)); return; }
    else if (button.id === "code-top") { window.scrollTo({ top: 0 }); return; }
    else if (button.dataset.fexpand !== undefined) { activate("code"); insertFile(button.dataset.fexpand); const host = document.getElementById("file-" + button.dataset.fexpand); requestAnimationFrame(() => { const file = host && host.querySelector(".file"); if (file) file.scrollIntoView({ block: "start" }); }); return; }
    else if (button.id === "tree-expand-all") { all(".tree-nav details").forEach((d) => d.open = true); return; }
    else if (button.id === "tree-collapse-all") { all(".tree-nav details").forEach((d) => d.open = false); return; }
    else if (button.dataset.zoomFit !== undefined) { zoomMode("fit"); return; }
    else if (button.dataset.zoomFull !== undefined) { zoomMode("1:1"); return; }
    else if (button.dataset.zoomPrev !== undefined) { showZoom(zi - 1); return; }
    else if (button.dataset.zoomNext !== undefined) { showZoom(zi + 1); return; }
    else if (button.dataset.overlay !== undefined) { button.setAttribute("aria-pressed", String(button.closest("article").querySelector(".shots").classList.toggle("overlaid"))); return; }
    else if (button.id === "print-owner") { auditorPrint = false; window.print(); return; }
    else if (button.id === "print-audit") { auditorPrint = true; window.print(); return; }
    else if (button.id === "export-json" || button.id === "export-json-top") { downloadJson(); return; }
    else if (button.id === "copy" || button.id === "copy-top") { copyDecisionsText(button); return; }
    else if (button.id === "apply-all") for (const f of data.findings) state.findings[f.id] = "apply";
    else if (button.id === "clear") { if (!confirm(t.clearConfirm)) return; state = D.empty(); annotationUI.reset(); }
    else return;
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
      // The radio is the decision: accepted at once on a wide screen, a draft to confirm on a narrow one.
      const cur = { ...qEntry(qid) };
      if (event.target.value) { cur.variant = event.target.value; cur.choice = isMobile() ? "draft" : "accepted"; }
      else { delete cur.variant; if (cur.choice === "accepted" || cur.choice === "draft") delete cur.choice; }
      if (cur.choice || cur.variant) state.questions[qid] = cur; else delete state.questions[qid];
      state = D.settle(data.questions, state); save(); paint(); return;
    }
    const z = event.target.dataset.zone;
    if (z) { if (event.target.checked) state.zones[z] = true; else delete state.zones[z]; save(); }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches?.("img.shot-zoom")) { event.preventDefault(); showZoom(shots.indexOf(event.target)); }
  });

  // ---- print: the owner leaves the map and the tree out and prints the screens and limits; the auditor
  // opens everything. After printing, the page returns to what it was, lazy files included. ----
  let printSnapshot = null, auditorPrint = false;
  window.addEventListener("beforeprint", () => {
    const treeCol = document.querySelector(".tree-col");
    printSnapshot = { inserted: new Set(inserted), openDetails: all("details[open]"), show: map.dataset.show, req: map.dataset.req, q: map.dataset.q, f: map.dataset.f, purpose: map.dataset.purpose, mapDisplay: map.style.display, treeDisplay: treeCol ? treeCol.style.display : null };
    if (auditorPrint) { clearFilters(); setMode("all"); insertAll(); all("details").forEach(progOpen); }
    else { map.style.display = "none"; if (treeCol) treeCol.style.display = "none"; }
  });
  window.addEventListener("afterprint", () => {
    if (!printSnapshot) return;
    if (auditorPrint) {
      all(".file-lazy").forEach((h) => { if (!printSnapshot.inserted.has(h.dataset.file)) { h.querySelectorAll(".file").forEach((f) => f.remove()); inserted.delete(h.dataset.file); } });
      segIndex.clear(); all(".file-lazy").forEach((h) => indexSegs(h));
    }
    map.style.display = printSnapshot.mapDisplay;
    const treeCol = document.querySelector(".tree-col"); if (treeCol && printSnapshot.treeDisplay != null) treeCol.style.display = printSnapshot.treeDisplay;
    all("details").forEach((d) => d.open = false);
    for (const d of printSnapshot.openDetails) progOpen(d);
    map.dataset.show = printSnapshot.show;
    if (printSnapshot.req) map.dataset.req = printSnapshot.req;
    if (printSnapshot.q) map.dataset.q = printSnapshot.q;
    if (printSnapshot.f) map.dataset.f = printSnapshot.f;
    if (printSnapshot.purpose) map.dataset.purpose = printSnapshot.purpose;
    applySegFilter();
    printSnapshot = null; auditorPrint = false;
  });

  const annotationUI = (${annotations.toString()})({ state: () => state, changed: () => { save(); paint(); }, t: data.annotationLabels, reveal: (el) => {
    // «Go to passage» lands on the source tab with the marker visible: activate its panel, undo any map
    // filter hiding the segment, and open the ancestor disclosures.
    const panel = el.closest(".panel");
    if (panel && panel.dataset.panel !== activeTab) { activate(panel.dataset.panel); history.replaceState(null, "", "#panel-" + panel.dataset.panel); }
    const seg = el.closest(".seg[data-block]");
    if (seg && seg.style.display === "none") { clearFilters(); setMode("all"); }
    for (let p = el.parentElement; p; p = p.parentElement) if (p.tagName === "DETAILS") progOpen(p);
  } });
  annotationUI.render(); zoomMode("fit"); applyTreeFilter(); paint();
  if (location.hash && location.hash !== "#") openTarget(location.hash); else activate("overview");
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
  return anchor ? `<a href="${esc(anchor)}">${esc(text)}</a>` : esc(text);
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
  <div class="passport-body mono">${esc(p.repository)} · ${esc(t("passport.base"))} ${esc(p.base)} → ${esc(t("passport.head"))} ${esc(p.head)} · ${esc(t("passport.diffSha"))} ${esc(review.diff?.sha256 ?? "")} · ${esc(t("passport.record"))} ${esc(model.recordSha ?? model.key)}</div>
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
  const role = (label, content, tone = "") => `<div class="role ${tone}" data-where="${esc(t(label))}"><span class="label">${esc(t(label))}</span><div class="stack">${content}</div>`;
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

// One question card: the canonical text and place, the status chip, the gate a child shows, the reviewer's
// context, the variants on the surface (the radio is the decision), the recommendation once as opinion, the
// draft a deferral or an unconfirmed pick leaves, and what the decision does not replace. A question without
// a kind keeps the old plain line.
function questionCard(q, review, model, t, child) {
  const variants = q.variants ?? [];
  const kindTag = q.kind === "decision" ? "fix" : q.kind === "evidence" ? "fix" : "question";
  const lead = q.kind === "fact" ? `<b>${esc(t("decision.fact-needed"))}</b> ` : q.kind === "evidence" ? `<b>${esc(t("decision.evidence-needed"))}</b> ` : "";
  const note = `<div class="qnote-wrap act"><label for="qnote-${q.id}">${esc(t("decision.note"))}: Q${q.id}</label><textarea class="qnote" id="qnote-${q.id}" data-note="q${q.id}" rows="2"></textarea></div>`;
  const actions = q.kind === "decision" && variants.length ? `
    <div class="qactions act"><button type="button" data-confirm="${q.id}" aria-label="${esc(t("decision.confirm"))}: Q${q.id}" hidden>${esc(t("decision.confirm"))}</button><button type="button" data-defer="${q.id}" aria-label="${esc(t("decision.defer"))}: Q${q.id}">${esc(t("decision.defer"))}</button><button type="button" data-qreset="${q.id}" aria-label="${esc(t("decision.reset"))}: Q${q.id}">${esc(t("decision.reset"))}</button></div>
    <p class="qdraft sub" data-qdraft="${q.id}" hidden></p>` : "";
  const decide = q.kind === "decision" && !variants.length ? `<span class="decide group act" data-finding="q${q.id}"><button type="button" value="accepted">${esc(t("decision.accepted"))}</button><button type="button" value="deferred">${esc(t("decision.deferred"))}</button></span>` : "";
  return `
  <div class="qcard ${esc(q.kind)}${child ? " child" : ""}" id="q${q.id}" data-qid="${q.id}"${q.parent ? ` data-parent="${q.parent.question}"` : ""} data-where="Q${q.id}">
    <div class="qhead"><h3>Q${q.id}</h3><span class="tag v-${kindTag}">${esc(t(`question.kind.${q.kind}`))}</span>${q.resolver ? `<span class="tag v-open">${esc(q.resolver)}</span>` : ""}${placeHtml(q.at, model)}${q.blocks ? `<span class="sub req-count">${q.blocks} ${esc(t("question.blocks"))}</span>` : ""}<span class="tag v-open qstatus" data-qstatus="${q.id}" data-state="open">${esc(t("decision.status.open"))}</span><span class="tag v-open na-badge" hidden>${esc(t("decision.na-badge"))}</span></div>
    <p class="qquestion">${lead}${prose(q.text)}</p>
    ${q.parent ? `<p class="qgate sub" data-qgate="${q.id}" hidden></p><p class="sub">${esc(t("question.parent"))}: <a href="#q${q.parent.question}">Q${q.parent.question}</a></p>` : ""}
    ${q.context?.length ? `<div class="qctx"><span class="label">${esc(t("question.context"))}</span>${claimsHtml(q.context, review)}</div>` : ""}
    ${q.recommendation ? `<p class="qadvice"><strong>${esc(t("recommendation"))}:</strong> ${prose(q.recommendation.text)}${q.recommendation.variant ? ` <span class="sub">[${esc(q.recommendation.variant)}]</span>` : ""}${q.recommendation.sources?.length ? ` <span class="sub">(${srcHtml(q.recommendation.sources, review)})</span>` : ""}<br><span class="sub">${esc(t("question.recommendation-note"))}</span></p>` : ""}
    ${variants.length ? `<fieldset class="qopts" disabled><legend>${esc(t("decision.choose"))}</legend>${variants.map((v) => `
      <label class="qopt"><input type="radio" name="vq${q.id}" value="${esc(v.id)}" data-question-variant="${q.id}" disabled><span><strong>${esc(v.text)}</strong>${v.consequences?.length ? `<span class="sub">${esc(t("question.consequences"))}:</span>${claimsHtml(v.consequences, review)}` : ""}</span></label>`).join("")}<span class="sub nojs-note">${esc(t("decision.requires-js"))}</span></fieldset>` : ""}
    ${actions}${decide}
    ${q.kind === "decision" ? `<span class="sub requires-content" hidden></span>` : ""}
    ${q.zones?.length ? `<div class="qzones"><span class="label">${esc(t("question.zones"))}</span><ul class="plain">${q.zones.map((z, zi) => `<li><label><input type="checkbox" data-zone="${q.id}-${zi}" disabled> <span>${prose(z.text)}${z.sources?.length ? ` <span class="sub">(${srcHtml(z.sources, review)})</span>` : ""}</span></label></li>`).join("")}</ul><span class="sub nojs-note">${esc(t("decision.requires-js"))}</span></div>` : ""}
    ${q.remainingEvidence?.length ? `<div class="qremaining-block"><span class="label">${esc(t("question.remaining-evidence"))}</span><ul class="plain">${q.remainingEvidence.map((n) => `<li><a href="#q${n}">Q${n}</a> ${prose(review.questions[n - 1].text)}</li>`).join("")}</ul></div>` : ""}
    ${q.blocks ? `<p class="sub"><button type="button" class="req-link" data-q-filter="${q.id}" disabled>${esc(t("map.open-filter"))} →</button></p>` : ""}
    ${note}
  </div>`;
}

function questionsSection(review, model, t) {
  const qs = model.questions, byId = Object.fromEntries(qs.map((q) => [q.id, q]));
  const drawn = new Set();
  const legacyLine = (q) => `<strong>Q${q.id}</strong> <code>${esc(q.at)}</code> ${prose(q.text)}`;
  // The whole acyclic tree under each root, every question once: grandchildren keep their cards, and a child
  // without a kind keeps its plain line beside them, never a second copy in the legacy list.
  const children = (q) => q.children.map((c) => byId[c] ? subtree(byId[c], true) : "").join("");
  const subtree = (q, child) => {
    if (drawn.has(q.id)) return "";
    drawn.add(q.id);
    return (q.kind === undefined ? `<div class="qlegacy${child ? " child" : ""}" id="q${q.id}">${legacyLine(q)}</div>`
      : questionCard(q, review, model, t, child)) + children(q);
  };
  const group = (kind) => {
    const roots = qs.filter((q) => q.kind === kind && !q.parent);
    if (!roots.length) return "";
    return `<span class="label qgroup-title">${esc(t(`question.kind.${kind}`))}</span>${roots.map((q) => subtree(q, false)).join("")}`;
  };
  const legacy = qs.filter((q) => q.kind === undefined && !q.parent);
  const kinded = qs.some((q) => q.kind !== undefined);
  return `
<section id="questions" class="stack decision-sheet" data-where="${esc(t("questions"))}"><h2>${esc(t("questions"))}</h2>
  ${kinded ? `<p class="sub">${esc(t("decision.sheet-note"))}</p><details class="count-note"><summary>${esc(t("decision.export-note"))}</summary><p class="sub">${esc(t("decision.export-method"))}</p></details>` : ""}
  ${["decision", "fact", "evidence"].map(group).join("")}
  ${legacy.length ? `<ul class="plain">${legacy.map((q) => { drawn.add(q.id); return `<li id="q${q.id}">${legacyLine(q)}${children(q)}</li>`; }).join("")}</ul>` : ""}
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
      + `<td><span class="tag v-open">${esc(t(`source.${r.source}`))}</span></td><td class="state">${status(r)}</td><td>${r.blocks.map(chip).join("") || `<span class="sub">${esc(t("no-block"))}</span>`} <button type="button" class="req-link" data-req-filter="${esc(r.id)}" disabled>${esc(t("map.open-filter"))} →</button></td><td class="n">${sizeOf(r.blocks)}</td></tr>`),
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

// What the user sees: the pictures the reviewer was given, each with a permalink and enlargeable in the
// viewer, a historical picture marked as another revision, and each difference.
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
  <article class="finding" id="shot-${index + 1}" data-where="${esc(`${t("screens")}: ${s.name}`)}">
    <h3>${esc(s.name)}<a class="shot-link" href="#shot-${index + 1}" aria-label="${esc(t("shot.permalink"))} ${index + 1}: ${esc(s.name)}" title="${esc(t("shot.permalink"))}">#</a></h3>
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

// The units as written and as they should be: the as-written diagram keeps its verdict shares; the target
// diagram sits in a closed disclosure — only the uses the reviewer wrote are drawn, with a text equivalent.
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
  <div class="pair">${figure(t("as-written"), now)}</div>
  ${then.length ? `<details class="structure-target"><summary>${esc(t("structure.target"))} · ${then.filter((n) => n.tone !== "existing").length} ${esc(t("units"))} · ${edges.length} ${esc(t("uses").toLowerCase())}</summary>
    <div class="scroll">${diagram(then, t("target"))}</div>
    ${edges.length ? `<details><summary class="sub">${esc(t("uses"))}: ${esc(t("target"))} (${edges.length})</summary><ul class="plain sub">${edges.join("")}</ul></details>` : ""}
    <p class="sub">${esc(t("structure.declared-only"))}</p></details>` : `<p class="sub">${esc(t("structure.declared-only"))}</p>`}
  <p class="sub">${esc(t("diagram-note"))}</p>
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

// The map reader: one line per fragment (the segbar), its details and comment, the code in a disclosure.
// Context lines attach to the fragment they surround, so the code reads continuously within a hunk. Each
// file lives in a closed disclosure for the no-script reader; the runtime materializes it lazily.
function map(review, files, model, t, hl, partCount) {
  const { blocks, owner } = model;
  const shown = new Set(), finding = (id) => review.findings.find((f) => f.id === id);
  const qtext = (n) => review.questions[n - 1]?.text ?? "";
  const pr = review.passport?.links?.find((l) => l.kind === "pr");
  const metaTitle = (b) => [b.does, b.serves.length ? `${t("serves")} ${b.serves.join(", ")}` : t("serves-nothing"), b.unit ? `${t("in-unit")} ${b.unit}` : "", `${t("lines").toLowerCase()}: ${b.where}`].filter(Boolean).join(" · ");
  const segbar = (b, cont) => {
    const fq = [...b.findings.map((id) => `<a href="#f${esc(id)}" title="${esc(finding(id)?.title ?? "")}">F${esc(id)}</a>`),
      ...b.questions.map((n) => `<a href="#q${n}" title="${esc(qtext(n))}">Q${n}</a>`)].join("");
    const srcBits = [];
    if (b.added.length && review.passport) srcBits.push(`+ ${b.path}:${b.added[0]} · ${t("seg.revision")} ${review.passport.head}`);
    if (b.removed.length && review.passport) srcBits.push(`− ${b.path}:${b.removed[0]} · ${t("seg.revision")} ${review.passport.base}`);
    const srcTitle = (srcBits.join(" ; ") || `${b.path} · ${t("seg.no-line")}`) + (pr ? ` · ${t("seg.source-open")}` : "");
    const src = pr ? `<a class="src" href="${esc(pr.url)}" target="_blank" rel="noopener" title="${esc(srcTitle)}" aria-label="${esc(t("seg.source"))} B${b.id}: ${esc(srcTitle)}">↗</a>` : "";
    return `<div class="segbar" title="${esc(metaTitle(b))}"><span class="dot" aria-hidden="true"></span><a class="bnum mono" href="#b${b.id}" title="${esc(t("seg.permalink", b.id))}">B${b.id}</a>`
      + (cont ? `<span class="sub does">${esc(t("continued"))}</span>` : `<span class="does">${b.does ? prose(b.does) : esc(t(`verdict.${b.verdict}`))}</span>`)
      + `<span class="tag v-${b.verdict}">${esc(t(`verdict.${b.verdict}`))}</span><span class="links">${fq}</span>${src}`
      + `<button type="button" class="act" data-segpop="${b.id}" aria-label="${esc(t("seg.popover-open", b.id))}" aria-haspopup="dialog">ⓘ</button></div>`;
  };
  const segmeta = (b, first) => `<details class="segmeta"><summary>${esc(t(first ? "seg.details-first" : "seg.details"))}</summary><div class="segmeta-body">
      <p class="sub">${b.serves.length ? `${esc(t("serves"))} ${b.serves.map(esc).join(", ")}` : esc(t("serves-nothing"))}${b.unit ? ` · ${esc(t("in-unit"))} <span class="mono">${esc(b.unit)}</span>` : ""} · <span class="mono">${esc(b.where)}</span></p>
      ${b.findings.length ? `<ul>${b.findings.map((id) => `<li><a href="#f${esc(id)}">${esc(id)}. ${esc(finding(id)?.title ?? "")}</a></li>`).join("")}</ul>` : ""}
      ${b.questions.length ? `<p class="sub">${esc(t("questions"))}: ${b.questions.map((n) => `<a href="#q${n}">Q${n}</a>`).join(", ")}</p>` : ""}
      ${first ? `<label class="sub" for="note-b${b.id}">${esc(t("note-block"))}: B${b.id}</label>
      <input class="act" type="text" id="note-b${b.id}" data-note="b${b.id}" placeholder="${esc(t("note-block"))}" aria-label="${esc(t("note-block"))}: B${b.id}">` : ""}
    </div></details>`;
  const code = (path, run, title) => `<pre${title ? ` title="${esc(title)}"` : ""}><code>${run.map((l) => `<span class="l ${l.kind}"><b class="old">${l.kind === "add" ? "" : l.old}</b><b class="new">${l.kind === "del" ? "" : l.new}</b><i>${{ add: "+", del: "−", ctx: " " }[l.kind]}</i>${hl(l, path)}</span>`).join("")}</code></pre>`;
  const segment = (path, run) => {
    if (run.block === undefined) return run.lines.length ? `<div class="seg">${code(path, run.lines)}</div>` : "";
    const b = blocks[run.block], first = !shown.has(b.id);
    shown.add(b.id);
    partCount[b.id] = (partCount[b.id] || 0) + 1;
    const open = b.verdict !== "keep" && run.lines.length <= 40 ? " open" : "";
    return `<div class="seg v-${b.verdict}" data-block="${b.id}" data-verdict="${b.verdict}" data-serves="${b.serves.join(" ")}" data-q="${b.questions.join(" ")}" data-f="${b.findings.join(" ")}" data-purpose="${esc(model.purpose.block[b.id])}"${first ? ` id="b${b.id}"` : ""}>`
      + segbar(b, !first) + segmeta(b, first)
      + `<details class="segcode"${open}><summary>${esc(t("lines"))}: ${run.lines.length}</summary>${code(path, run.lines, b.does)}</details></div>`;
  };
  const file = ({ path, hunks }, idx) => {
    const parts = [];
    hunks.forEach((hunk, at) => {
      if (at) parts.push('<div class="gap">⋯</div>');
      const runs = [];
      let run = null, ctxBuf = [];
      for (const line of hunk) {
        if (line.kind === "ctx") { ctxBuf.push(line); continue; }
        // A blank changed line belongs to no block of its own: it stays with the lines before it.
        const mine = owner.get(`${path}\n${address(line)}`) ?? (blank(line) ? (run ? run.block : undefined) : undefined);
        if (!run || mine !== run.block) {
          if (run) run.lines.push(...ctxBuf);
          run = { block: mine, lines: [] };
          if (runs.length === 0) run.lines.push(...ctxBuf);
          runs.push(run);
          ctxBuf = [];
        } else if (ctxBuf.length) { run.lines.push(...ctxBuf); ctxBuf = []; }
        run.lines.push(line);
      }
      if (run) run.lines.push(...ctxBuf);
      for (const r of runs) parts.push(segment(path, r));
    });
    const own = blocks.filter((b) => b.path === path);
    const cat = model.purpose.file[path];
    const inner = `<div class="file" data-purpose="${esc(cat)}"><header><strong class="mono" title="${esc(path)}">${esc(path)}</strong><span class="sub req-count" title="${esc(t("map.lines-sum"))}">${esc(t("lines").toLowerCase())}: ${sizeOf(own)} · ${esc(t("blocks").toLowerCase())}: ${own.length}</span><span class="tag v-open">${esc(t(`purpose.${cat}`))}</span></header>${parts.join("")}</div>`;
    return `<div class="file-lazy" data-file="${idx}" id="file-${idx}"><details class="file-details"><summary class="mono" title="${esc(path)}">${esc(model.files[idx].short)} <span class="sub">· ${own.length} ${esc(t("blocks").toLowerCase())} · ${sizeOf(own)} ${esc(t("lines").toLowerCase())}</span></summary>${inner}</details></div>`;
  };
  return files.map(file).join("\n    ");
}

// The tree of touched files, marked by what the diff did to them (never a verdict), with the name filter (C2)
// and the purpose marks; each file opens its place in the one canonical map.
function treeNav(files, model, t) {
  const root = { dirs: new Map(), files: [] };
  files.forEach(({ path }, idx) => {
    const parts = path.split("/"), name = parts.pop();
    let at = root;
    for (const part of parts) { if (!at.dirs.has(part)) at.dirs.set(part, { dirs: new Map(), files: [] }); at = at.dirs.get(part); }
    at.files.push({ name, path, idx });
  });
  const countFiles = (node) => node.files.length + [...node.dirs.values()].reduce((sum, child) => sum + countFiles(child), 0);
  const fileRow = ({ name, path, idx }) => {
    const own = model.blocks.filter((b) => b.path === path);
    const adds = own.reduce((sum, b) => sum + b.weightLines.added, 0), rems = own.reduce((sum, b) => sum + b.weightLines.removed, 0);
    const counts = VERDICTS.map((v) => [v, own.filter((b) => b.verdict === v).length]).filter(([, n]) => n);
    const what = own.map((b) => b.does).filter(Boolean)[0] ?? "";
    const mark = { A: ["+", "added"], D: ["−", "deleted"], M: ["±", "modified"] }[model.files[idx].status] ?? ["±", "modified"];
    return `<li class="frow" data-frow="${idx}" data-purpose="${esc(model.purpose.file[path])}"><span class="fs fs-${model.files[idx].status}" role="img" aria-label="${esc(t(`file.status.${mark[1]}`))}" title="${esc(t(`file.status.${mark[1]}`))}">${mark[0]}</span>`
      + `<button type="button" class="fname mono" data-fexpand="${idx}" disabled title="${esc(path)}">${esc(name)}</button><span class="sub req-count">+${adds}/−${rems}</span>${counts.map(([v, n]) => `<span class="tag v-${v}">${n}</span>`).join("")}`
      + `${what ? `<span class="sub fresult">${esc(what.length > 90 ? what.slice(0, 90) + "…" : what)}</span>` : ""}</li>`;
  };
  const dir = (name, node) => node.dirs.size === 1 && !node.files.length ? dir(`${name}/${[...node.dirs.keys()][0]}`, [...node.dirs.values()][0])
    : `<li><details class="fdir"><summary class="mono sub">${esc(name)}/ <span class="sub">${countFiles(node)}</span></summary>${list(node)}</details></li>`;
  const list = (node) => `<ul>${[...node.dirs].map(([name, child]) => dir(name, child)).join("")}${node.files.map(fileRow).join("")}</ul>`;
  return `<div class="tree-nav" id="files-tree"><div class="group"><span class="label">${esc(t("tree.title"))}</span><button type="button" id="tree-expand-all" disabled>${esc(t("tree.expand"))}</button><button type="button" id="tree-collapse-all" disabled>${esc(t("tree.collapse"))}</button></div>
  <div class="tree-filter act"><label class="sub" for="tree-filter-input">${esc(t("tree.filter"))}</label><input type="text" id="tree-filter-input" placeholder="${esc(t("tree.filter-placeholder"))}" disabled><button type="button" id="tree-filter-clear" disabled>${esc(t("reset"))}</button><span class="sub" id="tree-filter-count" role="status"></span></div>
  <details class="count-note"><summary>${esc(t("files"))}</summary><p class="sub">${esc(t("files.changed-only"))}</p></details>
  <div class="ftree">${list(root)}</div></div>`;
}

// The code tab: the purpose filter, the map modes, the tree and the map reader, the filter chip, and one
// banner per evidence question whose blocks could read as many decisions.
function codePanel(review, files, model, t, mapHtml, partCount) {
  const nonkeep = model.blocks.filter((b) => b.verdict !== "keep").length;
  const totalParts = Object.values(partCount).reduce((sum, n) => sum + n, 0);
  const purposeBar = `<div class="purpose-bar" role="group" aria-label="${esc(t("purpose"))}"><span class="sub">${esc(t("purpose"))}:</span>${PURPOSES.map((cat) => {
    const c = model.purpose.counts[cat];
    return `<button type="button" data-purpose-filter="${cat}" aria-pressed="false" disabled title="${esc(t(`purpose.rules.${cat}`))}">${esc(t(`purpose.${cat}`))} <b>${c.lines}</b> ${esc(t("lines").toLowerCase())} · ${c.files} ${esc(t("scope.files"))}</button>`;
  }).join("")}<span class="sub">${esc(t("purpose.lines-note"))}</span></div>`;
  const banners = model.questions.filter((q) => q.kind === "evidence" && q.blocks >= 2).map((q) => {
    const bs = model.blocks.filter((b) => b.questions.includes(q.id));
    const parts = bs.reduce((sum, b) => sum + (partCount[b.id] ?? 1), 0);
    return `<div class="evidence-banner v-question"><span class="tag v-question">Q${q.id}</span><p><strong>${bs.length} ${esc(t("blocks").toLowerCase())}${parts > bs.length ? ` · ${parts} ${esc(t("fragments"))}` : ""}</strong> ${esc(t("banner.await"))} — ${esc(t("banner.one"))} Q${q.id}, ${esc(t("banner.not-many"))}. <a href="#q${q.id}">Q${q.id} →</a></p><button type="button" data-q-filter="${q.id}" disabled>${esc(t("banner.show", q.id))}</button></div>`;
  }).join("");
  return `
<section id="files" class="stack"><h2>${esc(t("files"))} · ${model.files.length}</h2>
  <p class="sub">${esc(t("files.changed-only"))}</p>
  <div class="code-controls">
    ${purposeBar}
    <div class="map-filters">
      <span class="group act" role="group" aria-label="${esc(t("map"))}"><span class="sub">${esc(t("show"))}:</span><button type="button" data-show="attention" aria-pressed="true">${esc(t("map.attention", nonkeep))}</button><button type="button" data-show="all" aria-pressed="false">${esc(t("map.all", model.blocks.length))}</button>${VERDICTS.map((v) => `<button type="button" data-show="${v}" aria-pressed="false">${esc(t(`verdict.${v}`))}</button>`).join("")}</span>
      <button type="button" id="hide-tree" aria-pressed="false" disabled>${esc(t("tree.hide"))}</button>
      <span class="mview-toggle" role="group" aria-label="${esc(t("tab.code"))}"><button type="button" data-mview="tree" aria-pressed="false" disabled>${esc(t("mview.tree"))}</button><button type="button" data-mview="diff" aria-pressed="true" disabled>${esc(t("tab.code"))}</button></span>
      <button type="button" id="code-top" disabled>${esc(t("code.top"))}</button>
    </div>
  </div>
  <div class="code-layout" id="code-layout" data-mview="diff">
    <aside class="tree-col">${treeNav(files, model, t)}</aside>
    <div class="diff-col">
      <div class="filter-chip" id="filter-chip" hidden><span id="filter-chip-label"></span><span class="chip-nav"><button type="button" id="filter-prev" aria-label="${esc(t("chip.prev"))}">‹</button><span class="chip-pos" id="filter-pos" role="status"></span><button type="button" id="filter-next" aria-label="${esc(t("chip.next"))}">›</button></span><button type="button" id="filter-back">${esc(t("chip.back"))}</button><button type="button" id="filter-clear">${esc(t("reset"))}</button></div>
      ${banners}
      <noscript><p class="sub">${esc(t("nojs.map"))}</p></noscript>
      <div id="map" class="map" data-show="attention" style="--kept: ${esc(JSON.stringify(t("kept-by-you")))}">
        <p class="sub">${esc(t("map.audit-note"))} ${esc(t("blocks"))}: ${model.blocks.length} · ${esc(t("fragments"))}: ${totalParts}.</p>
        ${mapHtml}
      </div>
    </div>
  </div>
</section>`;
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
            : esc(t(m.weight ? "weight.unchanged" : "weight.unknown"))}<br><span class="sub">${esc(t("weight.limit"))}</span></span></summary>
        <div class="stack mechanism-content">
        ${overview.length ? `<div class="stack mechanism-weight">
          <details><summary>${esc(t("weight.evidence"))}</summary><div class="stack">
            <p>${esc(t("weight.exclusive"))}: ${esc(weightCountsText(m.weight.exclusive, t))}</p>
            ${(m.weight.shared ?? []).map(s => `<p class="sub">${esc(t("weight.shared"))} ${s.with.map(esc).join(", ")}: ${esc(weightCountsText({ [s.kind]: s }, t))} <a href="#b${s.block}">B${s.block}</a></p>`).join("")}
            <div class="group">${(m.blocks ?? []).map(id => `<a href="#b${id}">B${id}</a>`).join("")}</div><p class="sub">${esc(t("weight.note"))}</p>
          </div></details></div>` : ""}
        ${findings.length ? `<p class="sub"><strong>${esc(t("findings"))}:</strong> ${findings.map(f => `<a href="#f${esc(f.id)}">${esc(f.id)}</a>`).join(", ")}</p>` : ""}
        ${m.instead ? `<p><strong>${esc(t("instead"))}:</strong> ${prose(m.instead)}</p>` : ""}
        <div class="mechanism-tradeoff">${["benefit", "cost"].map(key => `<div><strong>${esc(t(key))}</strong>${lines(m[key])}</div>`).join("")}</div>
        <div class="group sub"><span>${esc(t(`evidence.${m.evidence}`))}</span></div>
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

export function page(review, files, model, { syntax } = {}) {
  const t = labelsOf(review), decide = decider(t);
  // The render-time Shiki syntax when the caller built it; the built-in pattern highlighter otherwise.
  const hl = syntax ? (l) => syntax.line(l) : (l, path) => highlight(l.text, path);
  const names = (label, ids) => ids?.length ? ` <strong>${esc(t(label))} ${ids.map(esc).join(", ")}.</strong>` : "";
  const findings = review.findings.map((f) => `
  <article class="finding" id="f${esc(f.id)}" data-where="${esc(`${t("finding")} ${f.id}`)}">
    <h3>${esc(f.id)}. ${esc(f.title)}</h3>
    <div class="group sub"><span>${esc(t(`direction.${f.direction}`))}</span><span>${esc(t(`evidence.${f.evidence}`))}</span>${placeHtml(f.at, model)}${model.blocks.filter((b) => b.findings.includes(f.id)).map(chip).join("")}<button type="button" class="req-link" data-f-filter="${esc(f.id)}" disabled title="${esc(t("map.open-filter"))}: F${esc(f.id)}">${esc(t("map.open-filter"))} →</button></div>
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
  // The map is built first: it records each block's part count, which the banners and the chip read.
  const partCount = Object.create(null);
  const mapHtml = map(review, files, model, t, hl, partCount);
  const pr = review.passport?.links?.find((l) => l.kind === "pr");
  // The page's script reads what it needs from here: the review's own name for its stored decisions, the digests
  // of the bytes it was drawn from, the questions with their variants, the blocks with their sources, and the words it writes.
  const data = { title: review.title, range: review.range, key: model.key,
    digest: { record: model.recordSha ?? model.key, diff: review.diff?.sha256 ?? "" },
    findings: review.findings.map(({ id, title }) => ({ id, title })),
    questions: model.questions.map(({ id, kind, resolver, parent, children, variants, text }) => ({ id, kind, resolver, parent, children, text, variants: (variants ?? []).map(({ id, text }) => ({ id, text })) })),
    ideas: ideas.map(({ id, title }) => ({ id, title })),
    blocks: model.blocks.map((b) => ({ id: b.id, path: b.path, where: b.where, verdict: b.verdict, serves: b.serves, questions: b.questions, unit: b.unit, findings: b.findings,
      does: b.does, size: b.size, purpose: model.purpose.block[b.id], firstAdd: b.added[0] ?? null, firstDel: b.removed[0] ?? null, parts: partCount[b.id] ?? 1 })),
    blockFile: model.blockFile, files: files.map((f) => f.path),
    purposeLabels: Object.fromEntries(PURPOSES.map((p) => [p, t(`purpose.${p}`)])),
    pr: { url: pr?.url ?? null, label: pr?.label ?? "", base: review.passport?.base ?? "", head: review.passport?.head ?? "" },
    labels: { title: t("out.title"), apply: t("out.apply"), skip: t("out.skip"), ideas: t("out.ideas"), ideaNotes: t("out.idea-notes"), open: t("out.open"), blocks: t("out.blocks"),
      passages: t("out.passages"), passagesTitle: t("passages"), notePassage: t("note-passage"), remove: t("remove"), decided: t("decided", "{n}"), copy: t("copy"), copied: t("copied"), clearConfirm: t("clear-confirm"),
      questionsOut: t("out.questions"), variant: t("out.variant"), accepted: t("decision.accepted"), deferred: t("decision.deferred"), notApplicable: t("decision.not-applicable"), remaining: t("decision.remaining"),
      requiresContent: t("decision.requires-content"), deferReason: t("decision.defer-reason"), draft: t("out.draft"),
      tabRemaining: t("tab.remaining", "{n}"), copyText: t("export.copy-text"), copyFailed: t("copy.failed"),
      theme: { current: t("theme.current"), next: t("theme.next"), auto: t("theme.auto"), light: t("theme.light"), dark: t("theme.dark") },
      status: { open: t("decision.status.open"), decided: t("decision.status.decided", "{n}"), draft: t("decision.status.draft", "{n}") },
      draftDeferred: t("decision.draft-deferred", "{n}"), draftMobile: t("decision.draft-mobile", "{n}"),
      gatePending: t("decision.gate-pending", "{n}"), gateNa: t("decision.gate-na", "{n}"), gateDraft: t("decision.gate-draft", "{n}"),
      verdict: Object.fromEntries(VERDICTS.map((v) => [v, t(`verdict.${v}`)])),
      findings: t("findings"), questions: t("questions"), serves: t("serves"), servesNothing: t("serves-nothing"), inUnit: t("in-unit"),
      source: t("seg.source"), addedLine: t("seg.added-line"), removedLine: t("seg.removed-line"), revision: t("seg.revision"),
      copySource: t("seg.copy-source"), copySourcePlain: t("seg.copy-source-plain"), noLine: t("seg.no-line"), keptNoDoes: t("seg.kept-no-does"),
      noteBlock: t("note-block"), close: t("viewer.close"),
      chip: { requirement: t("chip.requirement", "{n}"), finding: t("chip.finding", "{n}"), purpose: t("chip.purpose", "{n}") },
      blocksWord: t("blocks"), fragments: t("fragments"), withParts: t("chip.with-parts"), files: t("files"), treeHide: t("tree.hide"), treeShow: t("tree.show") },
    annotationLabels: Object.fromEntries(["annotation", "edit", "source", "unlocated", "saved", "deleted", "restored", "report"].map(k => [k, t(`annotation.${k}`)])) };
  const drawn = structure(model, t);
  const hasPictures = model.screens.some((s) => ["mockup", "before", "after"].some((shot) => s[shot]?.data));
  const tabs = [
    ["overview", t("tab.overview"), ""],
    ["decisions", t("tab.decisions"), `<span class="tab-count" id="count-decisions">${esc(t("tab.remaining", model.counters.decisions))}</span>`],
    ["findings", t("tab.findings"), `<span class="tab-count">${review.findings.length}</span>`],
    ["code", t("tab.code"), `<span class="tab-count">${files.length}</span>`],
    ["checks", t("tab.checks"), ""],
    ["materials", t("tab.materials"), ""],
  ];
  const tablist = tabs.map(([id, label, count], i) => `<a role="tab" id="tab-${id}" data-tab="${id}" href="#panel-${id}" aria-controls="panel-${id}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ""}>${esc(label)}${count}</a>`).join("");
  const panel = (id, content) => `<section class="panel" id="panel-${id}" data-panel="${id}" role="tabpanel" aria-labelledby="tab-${id}" tabindex="-1">${content}</section>`;
  return `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t("kind"))}: ${esc(review.title)}</title>
<style>${STYLE}</style>
<a class="skip-link" href="#questions">${esc(t("skip-to-decisions"))}</a>
<div class="wrap" id="review-content" tabindex="-1">
<header class="page-head"><div class="stack"><span class="label">${esc(t("kind"))}</span><h1>${esc(review.title)}</h1></div><button type="button" id="theme-toggle" class="theme-btn act" aria-label="${esc(t("theme.toggle"))}" title="${esc(t("theme.toggle"))}"></button></header>
<div class="bar global-nav"><nav class="tabs" role="tablist" aria-label="${esc(t("tablist"))}">${tablist}</nav></div>
<noscript><p class="sub">${esc(t("nojs.note"))}</p></noscript>
${panel("overview", `
${passport(review, model, t)}
${statusStrip(review, t)}
${counters(model, t)}
${summary(review, model, t)}
${drawn}
${scenarios(model, t)}
`)}
${panel("decisions", `
<div class="decisions-tools act"><span class="sub" id="progress-q"></span><button type="button" id="export-json-top" title="${esc(t("export.download"))}: decisions-${esc(model.key)}.json">${esc(t("export.download"))}</button><button type="button" id="copy-top">${esc(t("export.copy-text"))}</button></div>
${questionsSection(review, model, t)}
`)}
${panel("findings", `
<span class="sub act" id="progress"></span>
<section id="findings" class="stack"><h2>${esc(t("findings"))}</h2>${findings || `<p>${esc(t("none"))}</p>`}</section>
${tradeoffs(review, t)}
${offered ? `<section id="ideas" class="stack"><h2>${esc(t("ideas"))}</h2><p class="sub">${esc(t("ideas-note"))}</p>${offered}</section>` : ""}
${challenges(review, t)}
`)}
${panel("code", codePanel(review, files, model, t, mapHtml, partCount))}
${panel("checks", `
${requirements(model, t)}
${mechanisms(review, model, t)}
${checks(review, t)}
`)}
${panel("materials", `
${screens(review, model, t)}
${coverage(review, t)}
<section id="decisions" class="stack act" tabindex="-1"><h2>${esc(t("decisions"))}</h2>
  <p class="sub">${esc(t("decisions-note"))}</p>
  <p class="sub">${esc(t("export.note"))}</p>
  <div class="export-json"><button type="button" id="export-json">${esc(t("export.download"))}</button><button type="button" id="copy">${esc(t("export.copy-text"))}</button><button type="button" id="print-owner">${esc(t("print.owner"))}</button><button type="button" id="print-audit">${esc(t("print.auditor"))}</button><button type="button" id="apply-all">${esc(t("apply-all"))}</button><button type="button" id="clear">${esc(t("clear-all"))}</button></div>
  <p class="sub">${esc(t("print.omissions"))}</p>
  <div class="group annotation-feedback"><span id="annotation-status" role="status" aria-live="polite"></span><button id="annotation-undo" type="button" hidden>${esc(t("annotation.undo"))}</button><button id="annotation-dismiss" type="button" aria-label="${esc(t("annotation.dismiss"))}">×</button></div><div id="passages" class="stack"></div>
  <textarea id="out" readonly aria-label="${esc(t("decisions-text"))}"></textarea></section>
`)}
<footer class="sub"><details><summary>${esc(t("report-details"))}</summary><code>${esc(review.range)} · ${model.key} · ${esc(t("passport.diffSha"))} ${esc(review.diff?.sha256 ?? "")} · ${esc(t("passport.record"))} ${esc(model.recordSha ?? model.key)}</code></details></footer>
</div>
<div id="seg-popover" role="dialog" aria-label="${esc(t("seg.popover"))}" hidden></div>
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
<button type="button" id="comment" class="floating" aria-keyshortcuts="Alt+Shift+M" title="Alt+Shift+M">${esc(t("comment"))}</button>
<script id="data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<script>${SCRIPT}</script>
`;
}