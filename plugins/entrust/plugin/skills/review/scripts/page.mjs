// Self-contained review; no-script panels stack and retain the complete map.
import { address, blank } from "./diff.mjs";
import { diagram } from "./diagram.mjs";
import { highlight } from "./highlight.mjs";
import { labelsOf, languageOf } from "./labels.mjs";
import { VERDICTS, PURPOSES, mechanismCounts, weightCountsText, weightOverview } from "./review.mjs";
import { esc, prose } from "./text.mjs";
import { srcHtml, claimsHtml } from "./sources.mjs";
import { annotations, annotationRecordDigest, sealAnnotationDocument, annotationSha256 } from "./annotations.mjs";
import { decisionRuntime } from "./decisions.mjs";

const STYLE = `
/* One column per tab, decision-first. Every size is in rem on a 14px base (html 87.5%); code is .92em of it,
   secondary text never drops below 12px, and standalone controls keep a 32px tap target. */
:root { --bg: #faf9f7; --surface: #ffffff; --fg: #242424; --muted: #68645e; --line: #d8d6d1; --accent: #38352f; --code: #f4f3ef; --string: #0c6b78; --number: #7b3fae;
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
.wrap { max-width: 1600px; margin: 0 auto; padding-block: 2rem 4rem; padding-left: max(24px, env(safe-area-inset-left, 0px)); padding-right: max(24px, env(safe-area-inset-right, 0px));
  display: flex; flex-direction: column; gap: 1.25rem }
h1 { font-size: 26px; font-weight: 600; letter-spacing: -.7px; line-height: 1.25; margin: 0; text-wrap: balance }
h2 { font-size: 18px; font-weight: 600; margin: 0 0 .6rem }
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
.tabs [role="tab"]:hover { color: var(--fg); background: var(--code) }
.tabs [role="tab"][aria-selected="true"] { color: var(--fg); background: transparent; border-color: transparent; border-bottom-color: var(--accent) }
.tab-count { font-size: 12px; background: var(--line); color: var(--fg); border-radius: 1rem; padding: 0 .45rem; font-variant-numeric: tabular-nums }
.panel { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0 }
.skip-link { position: absolute; left: -9999px; top: 0; background: var(--accent); color: #fff; padding: .4rem .8rem; z-index: 50 }
.skip-link:focus { left: 0 }
/* Editorial overview: one neutral card, the verdict leads; the change context is a closed disclosure. */
.overview { background: transparent; border: 0; border-top: 1px solid var(--line); border-radius: 0; padding: 1rem 0 }
.lead { font-size: 1.15rem; font-weight: 600; line-height: 1.4 }
.context-change > summary { cursor: pointer; font-weight: 650; padding: .2rem 0; background: none; color: var(--fg) }
.context-change .stack { padding-top: .5rem }
.steps { margin: 0; padding-left: 1.4rem; max-width: 78ch; display: flex; flex-direction: column; gap: .2rem }
.doubt { margin-top: .3rem; padding-left: .6rem; border-left: 3px solid var(--fix); color: var(--fix) }
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
/* The passport. */
.passport-card { background: var(--surface); border: 1px solid var(--line) }
.passport-card > summary.passport { cursor: pointer; border: 0; display: list-item; padding: .6rem 1rem; font-size: .92rem; background: none; color: var(--fg) }
.passport-card > summary.passport > * { margin-right: 1.1rem }
.passport-card > summary.passport:hover { background: var(--code) }
.passport-body { padding: .5rem 1rem; border-top: 1px solid var(--line); font-size: 12px; color: var(--muted); overflow-wrap: anywhere }
.count-note { flex-basis: 100%; margin: .2rem 0 0; font-size: 12px }
.count-note > summary { cursor: pointer; color: var(--muted); background: none; padding: 0 }
/* Cards v5: one neutral surface, no nested frames or side stripe. Order: head (type, id, status) → essence →
   limit → choice → comment → disclosures. Metadata 12px; essence/consequences/limits 14px; title 16px. */
.decision-intro, .decision-sheet { max-width: 90ch }
.decision-intro { display: flex; flex-direction: column; gap: .4rem }
.decision-intro p { max-width: 90ch }
.decision-sheet { display: flex; flex-direction: column; gap: 1.1rem }
.dgroup { display: flex; flex-direction: column; gap: .7rem; min-width: 0 }
.dgroup-title { font-size: 1.15rem; font-weight: 650; margin: .3rem 0 0; line-height: 1.3 }
.dgroup-body { display: flex; flex-direction: column; gap: 1rem; min-width: 0 }
.dunit { min-width: 0 }
.qcard, .finding { background: transparent; border: 0; border-top: 1px solid var(--line); border-radius: 0; padding: 1rem 0; display: flex; flex-direction: column; gap: .5rem; min-width: 0 }
.qcard > *, .finding > * { min-width: 0 }
.qcard.child { margin-left: .9rem }
.qcard.na { opacity: .8 }
.card-head { display: flex; flex-wrap: wrap; gap: .25rem .7rem; align-items: baseline }
.card-head > * { min-width: 0 }
.card-title { font-size: 16px; line-height: 1.35; font-weight: 650; margin: 0; flex: 1 1 16rem }
.card-id { font-size: 12px; color: var(--muted); font-weight: 650 }
.card-meta { font-size: 12px; color: var(--muted); flex-basis: 100%; order: 5 }
.card-head .qstatus { margin-left: auto; order: 4 }
.card-question { margin: 0; font-size: 1rem }
.card-limit { margin: 0; font-size: 1rem; color: var(--fix) }
.card-consequence { margin: 0; font-size: 1rem }
.qstatus { flex: none }
/* The status chip and the NA badge carry whole sentences: they wrap, never push the card wide. */
.qstatus, .na-badge { white-space: normal }
/* A made choice reads neutral «Selected», never a green success; a draft and an entered fact answer are amber. */
.qstatus[data-state="decided"], .qstatus[data-state="na"], .qstatus[data-state="deferred"] { --v: var(--fg); --v-bg: var(--line) }
.qstatus[data-state="draft"], .qstatus[data-state="answered"] { --v: var(--fix); --v-bg: var(--fix-bg) }
.fact-answer-label { font-size: 1rem; color: var(--fg); font-weight: 650 }
.js label.fact-answer-label { display: block }
/* The choice zone on F/I cards is named at the same weight as the Q legend: here is where you act. */
.choice-label { display: block; font-size: 1rem; font-weight: 650; color: var(--fg); margin: .5rem 0 .3rem }
.qgate { color: var(--fix); margin: .1rem 0; font-size: 1rem }
.qcard.na .qgate { color: var(--muted) }
.qdraft { color: var(--fix); margin: .1rem 0; font-size: 1rem }
.qadvice { font-size: 1rem; margin: .1rem 0 }
.qopts { border: 0; padding: 0; margin: .7rem 0 .2rem; display: flex; flex-direction: column; gap: 0 }
.qopts legend { font-size: 1rem; color: var(--fg); font-weight: 650; padding: 0; margin-bottom: .3rem }
.qopt { display: flex; gap: .55rem; align-items: flex-start; padding: .55rem .4rem; border-top: 1px solid var(--line); cursor: pointer; min-height: 32px }
.qopt:last-of-type { border-bottom: 1px solid var(--line) }
.qopt:has(input:checked) { background: color-mix(in srgb, var(--accent) 10%, var(--surface)) }
.qopt input { margin-top: .3rem; flex: none; width: 1.1rem; height: 1.1rem }
.qopt strong { font-size: 1rem; font-weight: 600 }
/* Consequences are decision-critical main text under the variant, not muted metadata; the first one leads. */
.qopt .qcons { display: block; font-size: 1rem; color: var(--fg); font-weight: 600; margin-top: .15rem }
.qopt ul.plain { margin: .1rem 0 0 }
.qopt:has(input:disabled) { cursor: not-allowed; opacity: .7 }
.qactions { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center }
.qchildren { margin: .2rem 0 0 }
.qchildren > summary { cursor: pointer; font-size: .92rem; color: var(--muted); padding: .2rem 0 }
.qchildren .dgroup-body { padding: .4rem 0 0 .9rem; gap: .8rem }
.qchildren .qcard { background: var(--bg) }
.card-comment > summary { cursor: pointer; color: var(--muted); font-size: 13px; padding: .15rem 0 }
.card-comment > textarea { margin: .3rem 0 }
.block-comment { display: flex; flex-direction: column; gap: .25rem }
.comment-view { display: flex; flex-direction: column; gap: .3rem; padding: .3rem 0 }
.comment-view p { margin: 0 }
.comment-text { font-size: 1rem; white-space: pre-wrap; overflow-wrap: anywhere }
.comment-edit { font-size: 12px; padding: .15rem .6rem; min-height: 32px; align-self: flex-start }
textarea.qnote { width: 100%; min-height: 3.4rem; font: .92rem/1.45 var(--text); color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .4rem .6rem; field-sizing: content; resize: vertical }
.card-more { display: flex; flex-direction: column; gap: .1rem }
.card-more > details > summary { cursor: pointer; color: var(--muted); font-size: 13px; padding: .15rem 0; background: none }
.qwhere-body { display: flex; flex-direction: column; gap: .6rem; padding: .4rem 0 }
.qwhere-file > header { padding: .3rem .6rem; border-bottom: 1px solid var(--line); background: var(--code); font-size: 12px }
.qwhere-file > header strong { overflow-wrap: anywhere }
.qdetail .stack { padding: .5rem 0 }
.qctx .label, .qzones .label, .qremaining-block .label { display: block; margin-bottom: .2rem }
.qctx ul, .qzones ul { margin: 0 }
/* A zone row is a checkbox, not a list item: no second bullet marker beside the box. */
.qzones ul { list-style: none; padding-left: 0 }
.qzones label { display: flex; gap: .4rem; align-items: baseline; min-height: 32px }
.qzones .zone-note { font-size: 12px; color: var(--muted); margin: .2rem 0 0 }
/* Subtabs: one segmented filter over the single card list (the Arcanum merge-checks pattern). */
.choice-filters { display: inline-flex; align-self: flex-start; flex-wrap: wrap; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); overflow: hidden; max-width: min(100%, 90ch); margin: .2rem 0 .4rem }
.choice-filters button { border: 0; border-radius: 0; background: none; min-height: 32px; padding: .35rem .8rem; font-size: .92rem; color: var(--muted); box-shadow: inset 0 -2px transparent }
.choice-filters button + button { border-left: 1px solid var(--line) }
.choice-filters button[aria-pressed="true"] { background: color-mix(in srgb, var(--accent) 10%, var(--surface)); color: var(--fg); font-weight: 650; box-shadow: inset 0 -2px var(--accent) }
/* Subtab badges: a restrained accent when work remains, a neutral «0» when none (never a green check); ideas
   stay neutral (optional). A divider separates the type filters from the status filters. */
.choice-filters .cf-count { font-size: 12px; font-variant-numeric: tabular-nums; margin-left: .4rem; padding: 0 .4rem; border-radius: 1rem; background: var(--line); color: var(--muted); font-weight: 600 }
.choice-filters .cf-count:not([data-zero="1"]) { background: color-mix(in srgb, var(--accent) 16%, var(--surface)); color: var(--accent) }
.choice-filters [data-choice-filter="i"] .cf-count { background: var(--line); color: var(--muted) }
.choice-filters [data-choice-filter="deferred"] { margin-left: .5rem; border-left: 2px solid var(--line) }
.settled-row { border-top: 1px solid var(--line) }
.settled-row:first-child { border-top: 0 }
.settled-row > summary { cursor: pointer; padding: .4rem .2rem; font-size: .95rem; display: flex; flex-wrap: wrap; gap: .25rem .6rem; align-items: baseline }
.settled-row > summary .sr-id { font-weight: 650; font-family: var(--mono); font-size: 12px }
.settled-row > summary .sr-title { color: var(--fg); font-size: .95rem }
.settled-row > summary .sr-note { color: var(--muted); font-size: 12px }
.settled-row .dunit { padding: .3rem 0 .6rem }
#group-settled > summary, .ideas-opt > summary { cursor: pointer; font-weight: 650; font-size: 1.05rem; padding: .2rem 0 }
#group-settled .dgroup-body, .ideas-opt .dgroup-body { padding-top: .5rem }
@media (max-width: 700px) {
  .qcard, .finding { padding: .7rem .8rem }
  .card-title { flex-basis: 100% }
  .card-head .qstatus { margin-left: 0 }
  .qopt { padding: .5rem .2rem }
  .choice-filters button { padding: .35rem .55rem; font-size: .88rem }
}
/* Findings, tradeoffs, ideas. */
.tradeoff { background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: .6rem 1rem; display: flex; flex-direction: column; gap: .3rem }
.idea .card-title { font-weight: 600 }
.decide { display: none }
.js .decide { display: flex }
input[type="text"] { font: inherit; color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .3rem .5rem; width: 100%; max-width: 40rem; min-height: 32px }
textarea { width: 100%; min-height: 14rem; font: .92rem/1.45 var(--mono); color: var(--fg); background: var(--surface); border: 1px solid var(--line); padding: .6rem .8rem }
.act { display: none }
.js .act { display: flex }
.js input.act, .js textarea.act { display: block }
.js .card-comment.act { display: block }
.js .choice-label.act { display: block }
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
.purpose-bar button[data-purpose-empty]:disabled { border-color: transparent; background: none; color: var(--muted) }
.purpose-bar button[data-purpose-empty]:disabled::before { content: none }
.ftree.flat ul, .ftree.flat li:not(.frow), .ftree.flat details { display: contents }
.ftree.flat .fdir > summary { display: none }
/* A purpose toggle reads as a weak selected surface with an explicit on-mark, not an inverted fill. */
.purpose-bar button[aria-pressed="true"] { background: color-mix(in srgb, var(--accent) 10%, var(--surface)); color: var(--fg); border-color: var(--accent) }
.purpose-bar button[aria-pressed="true"]::before { content: "✓ "; color: var(--accent) }
.map-filters { display: flex; flex-wrap: wrap; gap: .4rem .8rem; align-items: center }
.code-layout { display: grid; grid-template-columns: var(--tree-w, 17rem) minmax(0, 1fr); gap: 1.5rem; align-items: start; position: relative }
.code-layout.hide-tree { grid-template-columns: minmax(0, 1fr) }
.code-layout.hide-tree .tree-col, .code-layout.hide-tree .tree-resize { display: none }
.tree-col { position: sticky; top: calc(var(--bar-h) + .5rem); max-height: calc(100dvh - var(--bar-h) - 1rem); overflow: auto; min-width: 0 }
.diff-col { min-width: 0; display: flex; flex-direction: column; gap: .6rem }
.tree-resize { position: absolute; top: 0; bottom: 0; left: var(--tree-w, 17rem); width: 10px; margin-left: -5px; cursor: col-resize; z-index: 3; touch-action: none }
.tree-resize:hover, .tree-resize:focus-visible { background: color-mix(in srgb, var(--accent) 25%, transparent) }
.mview-toggle { display: none }
@media (max-width: 900px) {
  .code-layout { grid-template-columns: minmax(0, 1fr) }
  .tree-col { position: static; max-height: 40dvh }
  .tree-resize { display: none }
  .mview-toggle { display: flex; gap: .4rem }
  .code-layout[data-mview="tree"] .diff-col { display: none }
  .code-layout[data-mview="diff"] .tree-col { display: none }
}
.tree-nav { background: transparent; border: 0; padding: .5rem 0 }
.tree-head { gap: .3rem .5rem }
.tree-head .label { flex: 1 1 auto }
.tree-modes button, .tree-head button { font-size: 12px; padding: .15rem .5rem }
.tree-filter { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; margin: .4rem 0 }
.tree-filter input { flex: 1 1 100%; max-width: none; width: auto }
.tree-root { padding: .1rem 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.ftree, .ftree ul { margin: 0; padding: 0; list-style: none }
.requirements-filter { display: flex; align-items: center; gap: .6rem; min-width: 0 }
.requirements-filter select { font: inherit; color: inherit; background: var(--surface); border: 1px solid var(--line); border-radius: 5px; min-width: 0; max-width: min(50rem, 100%); min-height: 32px }
.unit-tree { min-width: 0 }
.js .unit-tree.act { display: block }
.unit-tree details { border-top: 1px solid var(--line); padding: .4rem 0 }
.unit-tree summary { cursor: pointer; font-weight: 600; overflow-wrap: anywhere }
.unit-tree button { display: block; width: 100%; border: 0; background: transparent; text-align: left; padding: .4rem .6rem; overflow-wrap: anywhere }
.unit-tree button:hover { background: var(--code) }
.ftree ul { margin-left: .15rem; padding-left: .3rem; border-left: 1px solid var(--line) }
.fdir > summary { cursor: pointer; padding: .05rem 0; background: none; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
.frow { display: flex; align-items: center; flex-wrap: nowrap; white-space: nowrap; gap: .25rem .4rem; padding: .02rem 0 }
.frow .fname { display: flex; min-width: 0; overflow: hidden; white-space: nowrap }
.fname-start { min-width: 0; flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.fname-end { min-width: 0; max-width: 50%; flex: 0 1 auto; overflow: hidden; white-space: nowrap; direction: rtl; text-align: left }
.frow.current { background: var(--line) }
.fname { background: none; border: 0; padding: .05rem 0; min-height: 32px; cursor: pointer; color: var(--accent); font-size: 11px; text-align: left }
.fname:hover { text-decoration: underline }
.fs { display: inline-block; width: 1.1em; text-align: center; font-weight: 700; font-family: var(--mono); font-size: 12px }
.fs-A { color: var(--keep) } .fs-D { color: var(--remove) } .fs-M { color: var(--accent) }
.file-lazy:not(:has(.file)) { display: none }
/* A revealed file shows all its blocks in any verdict mode; the inline filter hiding still wins. */
.reveal-note { display: none }
.file.reveal .reveal-note { display: inline }
.js .map[data-show] .file.reveal .seg { display: revert }
.js .map[data-show] .file.reveal .seg[style*="display: none"] { display: none }
.filter-chip { position: sticky; top: var(--bar-h); z-index: 4; display: flex; flex-wrap: wrap; gap: .4rem .8rem; align-items: center; background: var(--surface); color: var(--fg); border: 1px solid var(--line); padding: .35rem .8rem; border-radius: 0 0 6px 6px; font-size: .92rem }
.filter-chip button { background: transparent; color: var(--fg); border-color: var(--line); min-height: 32px; padding: .15rem .6rem; font-size: .88rem }
.filter-chip button:hover { border-color: var(--muted) }
.filter-chip .chip-nav { display: inline-flex; gap: .3rem; align-items: center }
.filter-chip .chip-pos { font-variant-numeric: tabular-nums; font-size: .88rem }
.code-filtered .file > header { top: calc(var(--bar-h) + 2.6rem) }
/* Resolved-question blocks in attention mode: a visual cue, never hidden; code contrast untouched. */
.js .map[data-show="attention"] .seg.q-resolved > .segbar { background: var(--surface) }
.js .map[data-show="attention"] .seg.q-resolved > .segbar .does { color: var(--muted) }
.js .map[data-show="attention"] .seg.q-resolved > .segbar .bnum::after { content: " ✓"; color: var(--keep) }
.evidence-banner { display: flex; flex-wrap: wrap; gap: .4rem .9rem; align-items: baseline; background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--v); padding: .5rem .9rem }
.evidence-banner p { flex: 1 1 20rem; font-size: .95rem }
/* The map: one line per fragment, the code in a disclosure, the file header sticky. */
.map { display: flex; flex-direction: column; gap: .8rem }
.file { background: var(--surface); border: 0; border-top: 1px solid var(--line); min-width: 0 }
.file > header { position: sticky; top: var(--bar-h); z-index: 3; background: var(--surface); padding: .45rem .8rem; border-bottom: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: .25rem .75rem; align-items: baseline }
.file > header > * { min-width: 0 }
.file > header strong.mono { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 0 1 auto; max-width: 100%; overflow-wrap: normal }
.file-details > summary { cursor: pointer; padding: .4rem .8rem; background: var(--surface); border: 1px solid var(--line); color: var(--fg); font-size: .92rem }
.seg { border-left: 3px solid var(--v, transparent); min-width: 0 }
.seg + .seg, .gap { border-top: 1px solid var(--line) }
.seg.overruled { --v: var(--muted); --v-bg: transparent }
.seg.overruled .segbar .tag::after { content: " → " var(--kept) }
.seg:target > .segbar, .finding:target, .qcard:target { outline: 2px solid var(--accent); outline-offset: -2px }
.segbar { display: flex; align-items: center; gap: .5rem; padding: .3rem .6rem; min-height: 32px; font-size: .88rem; background: var(--surface); border-bottom: 1px solid var(--line) }
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
.segmeta > summary { padding: .05rem .8rem; font-size: 12px; color: var(--muted); cursor: pointer; background: var(--code) }
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
/* The export dialog: native <dialog>, the structured preview from the one export model, an honest clipboard. */
#export-dialog { width: min(860px, 94vw); max-height: 90dvh; overflow: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--fg); padding: 1.1rem 1.3rem }
#export-dialog::backdrop { background: rgb(0 0 0 / .45) }
#export-dialog h2 { margin-bottom: .3rem }
#export-dialog .group { margin: .6rem 0 }
#export-preview { display: flex; flex-direction: column; gap: .7rem; margin: .6rem 0; border-top: 1px solid var(--line); padding-top: .6rem }
.xp-sec h3 { font-size: 1rem; margin: 0 0 .25rem }
.xp-row { display: flex; flex-wrap: wrap; gap: .2rem .8rem; align-items: baseline; justify-content: space-between; font-size: 13px; margin: .15rem 0; max-width: none }
.xp-row > span { flex: 1 1 20rem; min-width: 0; overflow-wrap: anywhere }
.xp-goto { flex: none; font-size: 12px; font-weight: 600 }
.xp-draft > span { color: var(--fix) }
.xp-count { font-size: 13px; color: var(--muted); border-top: 1px solid var(--line); padding-top: .5rem }
#export-dialog textarea { width: 100%; min-height: 10rem; font: .92rem/1.45 var(--mono); resize: vertical }
#export-status { font-size: .92rem; min-height: 1.2em }
@media (max-width: 700px) { #export-dialog { width: 96vw; max-height: 94dvh; padding: .8rem .9rem } }
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth } }
@media (max-width: 40rem) { .bar { position: static } .tabs { flex-basis: 100% }
  section, [data-anchor], .seg, .qcard, .finding, .mechanism { scroll-margin-top: 1rem } }
@media (max-width: 760px) { .mechanism-tradeoff { grid-template-columns: 1fr } }
/* Mobile targets >= 44px, LAST so component min-heights cannot override; theme icon 32px by plan; gutters 2.2em. */
@media (max-width: 700px) {
  button, .tabs [role="tab"], .qopt, input[type="text"], .shot-link { min-height: 44px }
  .choice-filters button, .fname, .comment-edit, .req-link, .filter-chip button, .segbar button, #seg-popover .pop-close { min-height: 44px }
  .theme-btn { min-height: 32px; height: 32px }
  .l b, .l i { width: 2.2em }
}
/* Print: every panel prints; owner hides map/tree, auditor opens all. The palette resets to light so both
   themes print readable; the light token colors are the inline ones. */
@media print {
  .bar, .decide, .act, #comment, #annotation-editor, .map-filters, .skip-link, button, .filter-chip, #seg-popover, .code-controls, .qactions, .theme-btn, .annotation-feedback, .choice-filters, .comment-edit, #export-open, #export-dialog { display: none !important }
  .panel[hidden] { display: flex !important }
  .dunit[hidden], .dgroup[hidden] { display: block !important }
  :root, :root[data-theme="dark"] { --bg: #fff; --surface: #fff; --fg: #000; --muted: #444; --line: #999; --accent: #000; --code: #fff;
    --keep: #1c7449; --keep-bg: #fff; --fix: #8f5b00; --fix-bg: #fff; --remove: #b02e28; --remove-bg: #fff; --open-fg: #475069;
    --ins-bg: #fff; --del-bg: #fff; --string: #0c6b78; --number: #7b3fae; color-scheme: light }
  body { background: #fff; color: #000 } .wrap { max-width: none }
  .code-layout { display: block } .tree-col { position: static; max-height: none; overflow: visible; margin-bottom: 1rem }
  .file > header { position: static }
  .seg, .finding, .qcard, .mechanism, .tradeoff { break-inside: avoid }
  .passport-card, .count-note { break-inside: avoid }
  a { color: #000; text-decoration: underline }
}
`;

const SCRIPT = `
(() => {
  const data = JSON.parse(document.getElementById("data").textContent), key = "review-report:current:" + data.key, t = data.labels;
  const D = (${decisionRuntime.toString()})();
  const all = (selector) => [...document.querySelectorAll(selector)];
  const map = document.getElementById("map"), out = document.getElementById("out");
  let raw = {};
  try { raw = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
  let theme = raw.theme || "auto";
  let state = D.normalize(raw);
  state = D.settle(data.questions, state);
  let annotationUI = null;
  const answersSnapshot = () => JSON.stringify({ findings: state.findings, questions: state.questions, notes: state.notes, passages: state.passages, zones: state.zones, answers: state.answers });
  let persistedAnswers = answersSnapshot(), unsavedAnswers = false;
  const storageStatus = document.getElementById("storage-status");
  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify({ ...state, theme }));
      persistedAnswers = answersSnapshot();
      unsavedAnswers = false;
    } catch {
      unsavedAnswers = answersSnapshot() !== persistedAnswers;
    }
    storageStatus.hidden = !unsavedAnswers;
  };
  window.addEventListener("beforeunload", (event) => {
    if (unsavedAnswers || annotationUI?.hasDraftChanges()) { event.preventDefault(); event.returnValue = ""; }
  });
  document.documentElement.classList.add("js");
  // Radios, zones, answers and filters ship disabled for the no-script reader; the runtime enables them.
  for (const control of all("[data-question-variant], [data-zone], [data-answer], button[disabled]:not([data-purpose-empty]), input[disabled], select[disabled]")) control.disabled = false;
  for (const fieldset of all("fieldset.qopts")) fieldset.disabled = false;
  const qEntry = (id) => D.entryOf(state, id);
  const qById = Object.fromEntries(data.questions.map((q) => [String(q.id), q]));
  const blockById = Object.fromEntries(data.blocks.map((b) => [String(b.id), b]));
  const progOpen = (d) => { if (d && !d.open) d.open = true; };
  const variantLabel = (qid, v) => ((qById[String(qid)] || {}).variants || []).find((x) => x.id === v)?.text || v || "";
  const isNA = (q) => !!q.parent && !D.applicable(q, state, data.questions);
  const parentPending = (q) => D.waitingParent(q, state, data.questions);
  const hiddenPurposes = () => state.hiddenPurposes || [];
  const stats = () => D.choiceStats(data.questions, state, data.findings, data.ideas);
  const answerStatusText = (s) => t.answerStatus[s.status].replace("{n}", s.parent);
  let settledMap = {};
  const midPath = (p) => { if (p.length <= 46) return p; const m = /^(.*?)(:\\d+.*)?$/.exec(p), path = m[1], suffix = m[2] || ""; const parts = path.split("/"); let tail = parts.slice(-2).join("/"); if (tail.length > 40) tail = parts[parts.length - 1]; return "…/" + tail + suffix; };
  let choiceFilter = "all";

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

  // ---- tabs with per-tab scroll memory; the Choices tab is the start ----
  const tabs = all(".tabs [role=tab]"), panels = all(".panel");
  const scrollPos = new Map();
  let activeTab = "decisions", codeReady = false;
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
  const tabHash = (id) => id === "code" && (map.dataset.req || map.dataset.q || map.dataset.f)
    ? "#" + (map.dataset.req ? "req" + map.dataset.req : map.dataset.q ? "q" + map.dataset.q : "f" + map.dataset.f) + "-code" : "#panel-" + id;
  for (const tb of tabs) tb.addEventListener("click", (e) => { e.preventDefault(); activate(tb.dataset.tab); history.replaceState(null, "", tabHash(tb.dataset.tab)); });
  document.querySelector(".tabs").addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement); if (i < 0) return;
    let j = null;
    if (e.key === "ArrowRight") j = (i + 1) % tabs.length; else if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") j = 0; else if (e.key === "End") j = tabs.length - 1;
    if (j == null) return; e.preventDefault(); tabs[j].focus(); activate(tabs[j].dataset.tab); history.replaceState(null, "", tabHash(tabs[j].dataset.tab));
  });

  // ---- the lazy map: closed disclosures become templates; materialize what the mode/filter needs; one B anchor ----
  const inserted = new Set(), segIndex = new Map(), annotationScopes = new Set();
  let annotationRefreshQueued = false;
  function refreshAnnotations(scope) {
    if (!annotationUI || !state.passages.length) return;
    annotationScopes.add(scope);
    if (annotationRefreshQueued) return;
    annotationRefreshQueued = true;
    queueMicrotask(() => { annotationRefreshQueued = false; const scopes = [...annotationScopes]; annotationScopes.clear(); annotationUI.refresh(scopes); });
  }
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
    if (tpl && host) { host.append(tpl.content.cloneNode(true)); annotationUI?.rememberFile(host); inserted.add(idx); indexSegs(host); applySegFilter(); paintResolvedSegs(host); paintComments(); refreshAnnotations(host); }
  }
  function insertAll() { all(".file-lazy").forEach((h) => insertFile(h.dataset.file)); }
  function filesMatching(pred) { const s = new Set(); for (const b of data.blocks) if (pred(b)) s.add(String(data.blockFile[b.id])); return s; }
  function applySegFilter() {
    const req = map.dataset.req, q = map.dataset.q, f = map.dataset.f, hidden = hiddenPurposes(), mode = map.dataset.show || "attention";
    const filtering = !!(req || q || f || hidden.length);
    for (const seg of all("#map .seg[data-block]")) {
      let show = true;
      // A revealed file shows ALL its blocks in any verdict mode; the filters still apply on top.
      if (seg.closest(".file.reveal")) show = true;
      else if (mode === "attention") show = seg.dataset.verdict !== "keep";
      else if (mode !== "all") show = seg.dataset.verdict === mode;
      if (req) show = show && (seg.dataset.serves || "").split(" ").includes(req);
      if (q) show = show && (seg.dataset.q || "").split(" ").includes(q);
      if (f) show = show && (seg.dataset.f || "").split(" ").includes(f);
      if (hidden.includes(seg.dataset.purpose)) show = false;
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
    all("#map .file.reveal").forEach((file) => file.classList.remove("reveal"));
    map.dataset.show = v;
    const wasSelecting = selectingRequirement;
    selectingRequirement = true;
    if (v === "all") insertAll();
    else if (v === "attention") filesMatching((b) => b.verdict !== "keep").forEach(insertFile);
    else filesMatching((b) => b.verdict === v).forEach(insertFile);
    selectingRequirement = wasSelecting;
    for (const other of all("[data-show]")) if (other !== map) other.setAttribute("aria-pressed", String(other.dataset.show === v));
    applySegFilter();
  }
  function togglePurpose(cat) {
    document.getElementById("code-notice").textContent = "";
    const hidden = hiddenPurposes();
    state.hiddenPurposes = hidden.includes(cat) ? hidden.filter((x) => x !== cat) : [...hidden, cat];
    save();
    for (const b of all("[data-purpose-filter]")) b.setAttribute("aria-pressed", String(!state.hiddenPurposes.includes(b.dataset.purposeFilter)));
    applyTreeFilter();
    applySegFilter();
  }

  // ---- C2: tree name filter, highlighted match, AND hidden purposes; Enter opens the first ----
  const treeInput = document.getElementById("tree-filter-input"), treeClear = document.getElementById("tree-filter-clear"), treeCount = document.getElementById("tree-filter-count");
  function paintTreeName(button, name, query) {
    const chars = [...name], cut = chars.slice(0, Math.ceil(chars.length / 2)).join("").length;
    const at = query ? name.toLowerCase().indexOf(query) : -1;
    for (const [selector, start, end] of [[".fname-start", 0, cut], [".fname-end bdi", cut, name.length]]) {
      const span = button.querySelector(selector), from = Math.max(start, at), to = Math.min(end, at + query.length);
      span.textContent = "";
      if (at >= 0 && from < to) {
        span.append(document.createTextNode(name.slice(start, from)));
        const mark = document.createElement("mark"); mark.textContent = name.slice(from, to);
        span.append(mark, document.createTextNode(name.slice(to, end)));
      } else span.textContent = name.slice(start, end);
    }
  }
  function applyTreeFilter() {
    const hidden = hiddenPurposes(), query = treeInput.value.trim().toLowerCase(), req = map.dataset.req;
    const matchingFiles = req || hidden.length ? filesMatching((b) => (!req || (b.serves || []).includes(+req)) && !hidden.includes(b.purpose)) : null;
    const filesWithBlocks = matchingFiles && !req ? filesMatching(() => true) : null;
    let visible = 0;
    for (const row of all(".frow")) {
      const path = (data.files[+row.dataset.frow] || "").toLowerCase();
      const purposeVisible = !matchingFiles || matchingFiles.has(row.dataset.frow)
        || (filesWithBlocks && !filesWithBlocks.has(row.dataset.frow) && !hidden.includes(row.dataset.purpose));
      const show = purposeVisible && (!query || path.includes(query));
      row.style.display = show ? "" : "none"; if (show) visible++;
      const button = row.querySelector(".fname");
      paintTreeName(button, button.title.split("/").pop(), query);
    }
    for (const dir of all(".fdir")) { const count = [...dir.querySelectorAll(".frow")].filter((r) => r.style.display !== "none").length; dir.style.display = count ? "" : "none"; const label = dir.querySelector(":scope > summary [data-dir-count]"); if (label) label.textContent = t.files + ": " + count; if (query && count) dir.open = true; }
    treeCount.textContent = query || hidden.length || req ? (t.treeVisibleFiles || t.files) + ": " + visible + " / " + data.files.length : "";
    treeClear.disabled = !query;
  }
  treeInput.addEventListener("input", () => { document.getElementById("code-notice").textContent = ""; applyTreeFilter(); });
  treeInput.addEventListener("keydown", (event) => { if (event.key === "Enter") { const first = all(".frow").find((row) => row.style.display !== "none"); if (first) { event.preventDefault(); first.querySelector(".fname").click(); } } });
  treeClear.addEventListener("click", () => { document.getElementById("code-notice").textContent = ""; treeInput.value = ""; applyTreeFilter(); treeInput.focus(); });
  function resetTreeFilter() { treeInput.value = ""; applyTreeFilter(); }

  // Flatten in place so reveal, search and scrollspy retain the same rows.
  function setTreeMode(mode) {
    state.treeMode = mode; save();
    const folder = document.getElementById("ftree-folder");
    for (const b of all("[data-tree-mode]")) b.setAttribute("aria-pressed", String(b.dataset.treeMode === mode));
    folder.classList.toggle("flat", mode === "flat");
    if (mode === "flat") all("#ftree-folder .fdir").forEach((d) => { d.open = true; });
    applyTreeFilter();
  }
  const codeLayout = document.getElementById("code-layout"), treeResize = document.getElementById("tree-resize");
  const clampW = (w) => Math.max(168, Math.min(560, Math.round(w)));
  function applyTreeWidth(w) { if (w) codeLayout.style.setProperty("--tree-w", w + "px"); else codeLayout.style.removeProperty("--tree-w"); treeResize.setAttribute("aria-valuenow", w || 238); }
  let dragging = false;
  treeResize.addEventListener("pointerdown", (e) => { dragging = true; treeResize.setPointerCapture(e.pointerId); e.preventDefault(); });
  treeResize.addEventListener("pointermove", (e) => { if (dragging) applyTreeWidth(clampW(e.clientX - codeLayout.getBoundingClientRect().left)); });
  const endDrag = () => { if (!dragging) return; dragging = false; state.treeWidth = clampW(codeLayout.querySelector(".tree-col").getBoundingClientRect().width); save(); applyTreeWidth(state.treeWidth); };
  treeResize.addEventListener("pointerup", endDrag);
  treeResize.addEventListener("pointercancel", endDrag);
  treeResize.addEventListener("keydown", (e) => { if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return; e.preventDefault(); state.treeWidth = clampW((state.treeWidth || 238) + (e.key === "ArrowRight" ? 16 : -16)); save(); applyTreeWidth(state.treeWidth); });

  // ---- C4: the filter chip with prev/next matches and a way back; the hidden purposes read as one chip ----
  const chip = document.getElementById("filter-chip"), chipLabel = document.getElementById("filter-chip-label");
  const chipPos = document.getElementById("filter-pos"), chipPrev = document.getElementById("filter-prev"), chipNext = document.getElementById("filter-next"), chipBack = document.getElementById("filter-back");
  let returnState = null, chipIdx = 0, chipKey = "";
  const chipMatches = () => [...document.querySelectorAll("#map .seg[id][data-block]")].filter((s) => s.style.display !== "none" && s.closest(".file")?.style.display !== "none");
  function paintChipPos(n) { chipPos.textContent = n ? (chipIdx + 1) + " / " + n : "0"; chipPrev.disabled = chipNext.disabled = !n; }
  function updateChip() {
    const q = map.dataset.q, req = map.dataset.req, f = map.dataset.f, hidden = hiddenPurposes();
    updateRequirementViews();
    if (!q && !req && !f && !hidden.length) { chip.hidden = true; chipKey = ""; return; }
    const ck = q ? "q" + q : req ? "req" + req : f ? "f" + f : "hidden:" + hidden.join(",");
    if (ck !== chipKey) { chipKey = ck; chipIdx = 0; }
    let label;
    if (q || req || f) {
      const bs = q ? data.blocks.filter((b) => (b.questions || []).includes(+q)) : req ? data.blocks.filter((b) => (b.serves || []).includes(+req)) : data.blocks.filter((b) => (b.findings || []).includes(+f));
      const n = bs.length, parts = bs.reduce((s, b) => s + (b.parts || 1), 0);
      label = (q ? "Q" + q : req ? t.chip.requirement.replace("{n}", req) : t.chip.finding.replace("{n}", f)) + " · " + (req ? t.code.linked : t.blocksWord) + ": " + n + (req ? " · " + t.code.visible + ": " + chipMatches().length : parts > n ? " · " + t.fragments + ": " + parts + " (" + t.withParts + ")" : "")
        + (hidden.length ? " · " + t.chip.hidden.replace("{n}", hidden.map((x) => data.purposeLabels[x] || x).join(", ")) : "");
    } else {
      const hiddenBlocks = data.blocks.filter((b) => hidden.includes(b.purpose)).length;
      label = t.chip.hidden.replace("{n}", hidden.map((x) => data.purposeLabels[x] || x).join(", ")) + " · " + (data.blocks.length - hiddenBlocks) + "/" + data.blocks.length;
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
    updateUnitContext(seg);
    seg.scrollIntoView({ block: "start" });
    if (!seg.matches("[tabindex]")) seg.tabIndex = -1;
    seg.focus({ preventScroll: true });
    paintChipPos(m.length);
  }
  chipPrev.addEventListener("click", () => chipJump(-1));
  chipNext.addEventListener("click", () => chipJump(1));
  function jumpToFilter(kind, id, push) {
    document.getElementById("code-notice").textContent = "";
    updateUnitContext(null);
    returnState = { scroll: window.scrollY, tab: activeTab, focus: document.activeElement };
    activate("code");
    delete map.dataset.req; delete map.dataset.q; delete map.dataset.f;
    resetTreeFilter();
    setMode("all");
    if (kind === "q") map.dataset.q = String(id); else if (kind === "f") map.dataset.f = String(id); else map.dataset.req = String(id);
    filesMatching((b) => kind === "q" ? (b.questions || []).includes(+id) : kind === "f" ? (b.findings || []).includes(+id) : (b.serves || []).includes(+id)).forEach(insertFile);
    applySegFilter();
    applyTreeFilter();
    if (push !== false) history.pushState(null, "", "#" + (kind === "q" ? "q" + id : kind === "f" ? "f" + id : "req" + id) + "-code");
    requestAnimationFrame(() => {
      const first = [...document.querySelectorAll("#map .seg[data-block]")].find((s) => s.style.display !== "none" && s.offsetParent !== null);
      if (first) first.scrollIntoView({ block: "start" });
    });
  }
  function clearFilters(opts) {
    opts = opts || {};
    updateUnitContext(null);
    delete map.dataset.req; delete map.dataset.q; delete map.dataset.f;
    state.hiddenPurposes = []; save();
    for (const b of all("[data-purpose-filter]")) b.setAttribute("aria-pressed", "true");
    restoreUnfilteredFiles();
    applyTreeFilter();
    applySegFilter();
    if (opts.back && returnState) {
      const rs = returnState; returnState = null;
      activate(rs.tab, { scrollTop: rs.scroll, focus: rs.focus });
      history.replaceState(null, "", "#panel-" + rs.tab);
    }
  }
  chipBack.addEventListener("click", () => { document.getElementById("code-notice").textContent = ""; clearFilters({ back: true }); });
  document.getElementById("filter-clear").addEventListener("click", () => { document.getElementById("code-notice").textContent = ""; clearFilters(); history.replaceState(null, "", "#panel-code"); });

  // Unit navigation is derived from the selected requirement; the code stays in the canonical map.
  let navigationView = "files", unitSignature = "", selectingRequirement = false;
  function updateUnitContext(target) {
    all("#map .unit-context").forEach((node) => node.remove());
    const block = target && blockById[target.dataset.block], bar = target?.querySelector(".segbar");
    if (map.dataset.req && block?.unit && bar) {
      const context = document.createElement("span");
      context.className = "unit-context sub";
      context.textContent = t.inUnit + " " + block.unit;
      bar.append(context);
    }
  }
  function showMobileDiff() {
    if (codeLayout.dataset.mview !== "tree") return;
    codeLayout.dataset.mview = "diff";
    for (const b of all("[data-mview]")) b.setAttribute("aria-pressed", String(b.dataset.mview === "diff"));
  }
  function restoreUnfilteredFiles() {
    if (map.dataset.show !== "all") return;
    const wasSelecting = selectingRequirement;
    selectingRequirement = true;
    insertAll();
    selectingRequirement = wasSelecting;
  }
  function updateRequirementViews() {
    const select = document.getElementById("code-requirement"), container = document.getElementById("unit-tree");
    const empty = document.getElementById("requirement-empty"), req = map.dataset.req || "";
    if (!select || !container || !empty) return;
    select.value = req;
    if (selectingRequirement) return;
    const linked = req ? data.blocks.filter((b) => (b.serves || []).includes(+req)) : [];
    const matching = linked.filter((b) => {
      const host = document.getElementById("file-" + data.blockFile[b.id]);
      const mode = map.dataset.show || "attention";
      const verdict = host?.querySelector(".file.reveal") || mode === "all" || (mode === "attention" ? b.verdict !== "keep" : b.verdict === mode);
      return verdict && !hiddenPurposes().includes(b.purpose);
    });
    empty.textContent = !req ? "" : !linked.length ? t.code.noRelated : !matching.length ? t.code.noVisible : "";
    if (navigationView !== "units") return;
    const signature = JSON.stringify([req, matching.map((b) => b.id)]);
    if (signature === unitSignature) return;
    unitSignature = signature;
    const open = new Set([...container.querySelectorAll("details[open]")].map((d) => d.dataset.unit));
    container.replaceChildren();
    if (!req) { container.textContent = t.code.selectRequirement; return; }
    const groups = new Map();
    for (const b of matching) { const name = b.unit || t.code.noUnit; if (!groups.has(name)) groups.set(name, []); groups.get(name).push(b); }
    for (const [name, blocks] of groups) {
      const details = document.createElement("details"), summary = document.createElement("summary");
      details.dataset.unit = name; details.open = open.has(name);
      summary.textContent = name + " · " + blocks.length;
      details.append(summary);
      for (const block of blocks) {
        const button = document.createElement("button");
        button.type = "button"; button.dataset.unitBlock = String(block.id);
        button.textContent = "B" + block.id + " · " + (block.does || block.path);
        button.title = block.path + (block.where ? " · " + block.where : "");
        details.append(button);
      }
      container.append(details);
    }
  }
  document.getElementById("code-requirement").addEventListener("change", (event) => {
    const id = event.target.value;
    document.getElementById("code-notice").textContent = "";
    updateUnitContext(null);
    delete map.dataset.q; delete map.dataset.f;
    selectingRequirement = true;
    if (id) {
      map.dataset.req = id;
      map.dataset.show = "all";
      for (const other of all("[data-show]")) if (other !== map) other.setAttribute("aria-pressed", String(other.dataset.show === "all"));
      filesMatching((b) => (b.serves || []).includes(+id)).forEach(insertFile);
      history.pushState(null, "", "#req" + id + "-code");
    } else {
      delete map.dataset.req;
      restoreUnfilteredFiles();
      history.pushState(null, "", "#panel-code");
    }
    selectingRequirement = false;
    applyTreeFilter(); applySegFilter();
  });

  function openTarget(hash) {
    if (!hash || hash[0] !== "#") return;
    const shot = /^#shot(\\d+)$/.exec(hash); if (shot) hash = "#shot-" + shot[1]; // the canonical anchor is #shot-N; #shotN lands too
    const pm = /^#panel-(\\w+)$/.exec(hash);
    if (pm) {
      if (pm[1] === "code" && (map.dataset.req || map.dataset.q || map.dataset.f)) {
        delete map.dataset.req; delete map.dataset.q; delete map.dataset.f;
        document.getElementById("code-notice").textContent = "";
        updateUnitContext(null); restoreUnfilteredFiles(); applyTreeFilter(); applySegFilter();
      }
      activate(pm[1] === "findings" ? "decisions" : pm[1]); return;
    } // the v4 Findings tab lives in Choices now
    const fm = /^#(q|req|f)(\\d+)-code$/.exec(hash); if (fm) { jumpToFilter(fm[1], fm[2], false); return; }
    const bm = /^#b(\\d+)$/.exec(hash);
    let el = null;
    if (bm) {
      const filtered = !!(map.dataset.req || map.dataset.q || map.dataset.f || hiddenPurposes().length || treeInput.value.trim() || (map.dataset.show || "attention") !== "all");
      clearFilters();
      resetTreeFilter();
      activate("code");
      // A deep link reveals its block in ANY verdict mode: the full audit, not just the filters.
      setMode("all");
      showMobileDiff();
      document.getElementById("code-notice").textContent = filtered ? t.code.filtersCleared : "";
      el = document.getElementById("b" + bm[1]);
    } else { try { el = document.querySelector(hash); } catch { return; } }
    if (!el) return;
    if (el.closest("#panel-decisions")) {
      for (const u of all("#panel-decisions .dunit")) u.hidden = false;
      for (const g of all("#panel-decisions .dgroup")) g.hidden = false;
      for (const c of all("#panel-decisions .qcard, #panel-decisions .qchildren")) c.hidden = false;
      choiceFilter = "all";
      for (const b of all("[data-choice-filter]")) b.setAttribute("aria-pressed", String(b.dataset.choiceFilter === "all"));
    }
    const panel = el.closest(".panel");
    if (panel) activate(panel.dataset.panel, { scrollTop: 0 });
    for (let p = el; p; p = p.parentElement) if (p.tagName === "DETAILS") progOpen(p);
    if (el.matches("article.mechanism")) el.querySelectorAll("details").forEach((d) => progOpen(d));
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: "start" });
      if (panel) scrollPos.set(panel.dataset.panel, window.scrollY);
      const focus = el.querySelector(".card-title, .segbar .bnum") || el;
      if (!focus.matches("a,button,input,textarea,[tabindex]")) focus.tabIndex = -1;
      focus.focus({ preventScroll: true });
    });
  }
  window.addEventListener("hashchange", () => openTarget(location.hash));

  // ---- the card «Related code»: lazy from the canonical templates; clones without ids or comments ----
  function buildWhere(details) {
    const qid = details.dataset.qwhere, body = details.querySelector(".qwhere-body");
    if (!body || body.dataset.built) return;
    body.dataset.built = "1";
    const idxs = [...filesMatching((b) => (b.questions || []).includes(+qid))].sort((a, b) => a - b);
    for (const idx of idxs) {
      const tpl = document.getElementById("segs-" + idx); if (!tpl) continue;
      const clone = tpl.content.cloneNode(true);
      const segs = [...clone.querySelectorAll(".seg[data-block]")].filter((s) => (s.dataset.q || "").split(" ").includes(qid));
      if (!segs.length) continue;
      const wrap = document.createElement("div"); wrap.className = "file qwhere-file";
      const head = document.createElement("header");
      const strong = document.createElement("strong"); strong.className = "mono"; strong.textContent = midPath(data.files[+idx]); strong.title = data.files[+idx];
      head.append(strong); wrap.append(head);
      for (const s of segs) {
        s.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        s.removeAttribute("id");
        s.querySelectorAll(".block-comment").forEach((n) => n.remove());
        s.querySelectorAll("label[for]").forEach((n) => n.removeAttribute("for"));
        wrap.append(s);
      }
      body.append(wrap);
    }
    if (!body.children.length) { const p = document.createElement("p"); p.className = "sub"; p.textContent = t.whereEmpty; body.append(p); }
    annotationUI?.rememberWhere(details);
    refreshAnnotations(body);
  }
  document.addEventListener("toggle", (e) => {
    const el = e.target;
    if (el.matches && el.matches(".qwhere") && el.open) buildWhere(el);
    if (el.matches && el.matches(".card-comment") && !el.open) { el.dataset.editing = ""; const ta = el.querySelector("textarea"); if (document.activeElement === ta) ta.blur(); paintComments(); }
  }, true);

  // ---- the fragment popover: details, sources (add at head, del at base), an honest copy, a comment ----
  const pop = document.getElementById("seg-popover");
  let popReturn = null;
  // Every value that reaches this innerHTML is escaped for a single-quoted attribute: & < > " and ' alike.
  const escs = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  function closePop() { if (pop.hidden) return; pop.hidden = true; if (popReturn && popReturn.isConnected) popReturn.focus({ preventScroll: true }); popReturn = null; }
  function openPop(id, anchor) {
    const b = blockById[String(id)]; if (!b) return;
    popReturn = anchor;
    const finds = (b.findings || []).map((fid) => { const f = data.findings.find((x) => String(x.id) === String(fid)); return f ? "<li><a href='#f" + escs(fid) + "'>" + escs(fid) + "</a> " + escs(f.title) + "</li>" : ""; }).join("");
    const qs = (b.questions || []).map((n) => { const q = qById[String(n)]; return "<li><a href='#q" + escs(n) + "'>Q" + escs(n) + "</a> " + escs(q ? q.text : "") + "</li>"; }).join("");
    const srcRow = (label, line, rev) => "<p class='sub'>" + escs(label) + ": <span class='mono'>" + escs(b.path) + ":" + escs(line) + "</span>" +
      (rev ? " · " + escs(t.revision) + " <span class='mono'>" + escs(rev) + "</span> <button type='button' class='pop-copy' data-copy='" + escs(b.path + ":" + line + " (" + rev + ")") + "'>" + escs(t.copySource) + "</button>"
        : " <button type='button' class='pop-copy' data-copy='" + escs(b.path + ":" + line) + "'>" + escs(t.copySourcePlain) + "</button>") + "</p>";
    // Only an http(s) address becomes a link: any other scheme (javascript:, data:) stays escaped text.
    const prUrl = data.pr.url && /^https?:\\/\\//i.test(data.pr.url) ? data.pr.url : null;
    const srcHtml = (data.pr.url ? "<p class='sub'>" + escs(t.source) + ": " + (prUrl ? "<a href='" + escs(prUrl) + "' target='_blank' rel='noopener'>" + escs(data.pr.label || data.pr.url) + " ↗</a>" : escs(data.pr.label || data.pr.url)) + "</p>" : "") +
      (b.firstAdd != null ? srcRow(t.addedLine, b.firstAdd, data.pr.head) : "") +
      (b.firstDel != null ? srcRow(t.removedLine, b.firstDel, data.pr.base) : "") +
      (b.firstAdd == null && b.firstDel == null ? "<p class='sub'>" + escs(t.noLine) + "</p>" : "");
    pop.innerHTML =
      "<div class='pop-head'><strong class='mono'>B" + escs(b.id) + "</strong><span class='tag v-" + escs(b.verdict) + "'>" + escs(t.verdict[b.verdict] || b.verdict) + "</span>" +
      "<button type='button' class='pop-close' aria-label='" + escs(t.close) + "'>×</button></div>" +
      (b.does ? "<p>" + escs(b.does) + "</p>" : "<p class='sub'>" + escs(t.keptNoDoes) + "</p>") +
      (finds ? "<div><span class='label'>" + escs(t.findings) + "</span><ul>" + finds + "</ul></div>" : "") +
      (qs ? "<div><span class='label'>" + escs(t.questions) + "</span><ul>" + qs + "</ul></div>" : "") +
      "<p class='sub'>" + escs(b.serves && b.serves.length ? t.serves + " " + b.serves.map((id) => "R" + id).join(", ") : t.servesNothing) +
      (b.unit ? " · " + escs(t.inUnit) + " " + escs(b.unit) : "") + " · <span class='mono'>" + escs(b.where) + "</span></p>" +
      srcHtml +
      "<label for='pop-note'>" + escs(t.noteBlock) + "</label><input type='text' id='pop-note' data-note='b" + escs(b.id) + "'>";
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
      const done = () => { pop.querySelector(".pop-copy-status")?.remove(); pop.querySelector(".pop-copy-value")?.remove(); cp.textContent = t.copied; setTimeout(() => { cp.textContent = original; }, 1200); };
      const fail = () => {
        // Select exactly the value the copy carries — path:line (revision) — not the label and row around it,
        // and say plainly that automatic copying failed.
        const p = cp.closest("p");
        let status = pop.querySelector(".pop-copy-status");
        if (!status) { status = document.createElement("p"); status.className = "sub pop-copy-status"; status.setAttribute("role", "status"); p.after(status); }
        status.textContent = t.copyFailed;
        let value = pop.querySelector(".pop-copy-value");
        if (!value) { value = document.createElement("p"); value.className = "sub mono pop-copy-value"; status.after(value); }
        value.textContent = txt;
        const r = document.createRange(); r.selectNodeContents(value);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      };
      try { navigator.clipboard.writeText(txt).then(done, fail); } catch { fail(); }
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pop.hidden) { e.preventDefault(); closePop(); } });
  document.addEventListener("click", (e) => { if (!pop.hidden && !pop.contains(e.target) && !e.target.closest("[data-segpop]")) closePop(); });

  // ---- the export: ONE model feeds the preview, the text and the JSON; the dialog is native ----
  const exportDialog = document.getElementById("export-dialog");
  let outDirty = true;
  function syncOut() { out.value = decisionsText(); buildPreview(); outDirty = false; }
  function exportPayload() {
    return D.exportOf(data.questions, state, { recordSha: data.digest.record, diffSha: data.digest.diff, key: data.key, title: data.title, range: data.range });
  }
  function exportModel() {
    const j = exportPayload();
    const accepted = [], deferred = [], notApplicable = [], answers = [], zones = [], comments = [], openDecisions = [], openDependent = [], openRequests = [];
    const waiting = Object.fromEntries(j.waitingForParent.map((w) => [w.question, w.parent]));
    const waitingText = (q) => waiting[q.id] ? " · " + t.gatePending.replace("{n}", waiting[q.id]) : "";
    const draftSuffix = (e) => e.variant ? " · " + t.draftSuffix.replace("{n}", e.variant.text) : "";
    for (const e of j.questions) {
      const hash = "#q" + e.question;
      if (e.status === "not-applicable") notApplicable.push({ text: "Q" + e.question + " · " + t.notApplicable + " (Q" + qById[e.question].parent.question + ")" + draftSuffix(e), hash });
      else if (e.status === "accepted") accepted.push({ text: "Q" + e.question + " · " + (e.variant ? t.status.decided.replace("{n}", e.variant.text) : t.selectedNoVariant) + (e.waiting_parent ? " · " + t.selectionWaiting.replace("{n}", e.waiting_parent) : ""), hash });
      else if (e.status === "deferred") deferred.push({ text: "Q" + e.question + " · " + t.deferred + draftSuffix(e) + waitingText(qById[e.question]), hash, draft: !!e.variant });
      else if (e.variant) deferred.push({ text: "Q" + e.question + " · " + t.draftRow.replace("{n}", e.variant.text), hash, draft: true });
      if (e.status === "remaining") {
        const q = qById[e.question];
        (q.parent ? openDependent : openDecisions).push({ text: "Q" + q.id + " · " + q.text + (q.parent ? " · " + t.dependsOn + " Q" + q.parent.question : "") + waitingText(q), hash });
      }
    }
    for (const q of data.questions) if ((q.kind === "fact" || q.kind === "evidence") && D.applicable(q, state, data.questions) && !String(j.factAnswers["q" + q.id] || "").trim())
      openRequests.push({ text: "Q" + q.id + " · " + q.text + (q.parent ? " · " + t.dependsOn + " Q" + q.parent.question : "") + waitingText(q), hash: "#q" + q.id });
    for (const f of data.findings) { const v = j.findings[f.id];
      if (v === "apply") accepted.push({ text: "F" + f.id + " · " + t.fixApply + " — " + f.title, hash: "#f" + f.id });
      else if (v === "skip") accepted.push({ text: "F" + f.id + " · " + t.fixSkip + " — " + f.title, hash: "#f" + f.id }); }
    for (const i of data.ideas) { const v = j.findings[i.id];
      if (v === "apply") accepted.push({ text: i.id.toUpperCase() + " · " + t.ideaApply + " — " + i.title, hash: "#" + i.id });
      else if (v === "skip") accepted.push({ text: i.id.toUpperCase() + " · " + t.ideaSkip + " — " + i.title, hash: "#" + i.id }); }
    for (const [aid, val] of Object.entries(j.factAnswers)) {
      const status = Object.hasOwn(j.factAnswerStatuses, aid) ? j.factAnswerStatuses[aid] : null;
      answers.push({ text: aid.toUpperCase() + " · " + (status ? answerStatusText(status) + ": " : "") + val, ...(status ? { hash: "#" + aid } : {}) });
    }
    for (const [zid, marked] of Object.entries(j.zones)) {
      if (!marked) continue;
      const cut = zid.lastIndexOf("-"), qid = zid.slice(0, cut), zi = Number(zid.slice(cut + 1));
      const zone = ((qById[qid] || {}).zones || [])[zi];
      zones.push({ text: "Q" + qid + " · " + (zone ?? zid) + " · " + t.zoneMarked, hash: "#q" + qid });
    }
    const ctxOf = (id) => {
      if (id[0] === "q" && qById[id.slice(1)]) return "Q" + id.slice(1) + " · " + (qById[id.slice(1)].text || "").slice(0, 90);
      if (id[0] === "f") { const f = data.findings.find((x) => "f" + x.id === id); return f ? "F" + f.id + " · " + f.title : id.toUpperCase(); }
      if (id[0] === "i") { const i = data.ideas.find((x) => x.id === id); return i ? i.id.toUpperCase() + " · " + i.title : id.toUpperCase(); }
      if (id[0] === "b") { const b = blockById[id.slice(1)]; return b ? "B" + b.id + " · " + b.path + " " + b.where : id.toUpperCase(); }
      return id.toUpperCase();
    };
    for (const e of j.questions) if (e.comment) comments.push({ text: ctxOf("q" + e.question) + ": " + e.comment, hash: "#q" + e.question });
    for (const [id, value] of Object.entries(j.notes)) {
      if (id[0] === "q" && j.questions.some((e) => "q" + e.question === id && e.comment)) continue;
      comments.push({ text: ctxOf(id) + ": " + value, hash: "#" + id });
    }
    j.passages.forEach((p, index) => {
      const found = annotationUI.located(index);
      comments.push({ text: t.export.passageContext + " · " + p.where + ": «" + p.quote + "»" + (p.note ? " — " + p.note : "") + (found ? "" : " · " + data.annotationLabels.unlocated), ...(found ? { passage: index } : {}) });
    });
    const open = data.findings.filter((f) => !j.findings[f.id]).map((f) => "F" + f.id);
    const remaining = t.tabRemaining.replace("{n}", stats().remaining) + (open.length ? " · " + t.export.openFindings + ": " + open.join(", ") : "");
    return { accepted, deferred, notApplicable, answers, zones, comments, openDecisions, openDependent, openRequests, remaining, payload: j };
  }
  function decisionsText() {
    const m = exportModel();
    const part = (title, rows) => rows.length ? ["", title, ...rows.map((r) => "- " + r.text)] : [];
    return [t.title + " \\"" + data.title + "\\" (" + data.range + ", " + data.key + ")",
      ...part(t.export.accepted, m.accepted), ...part(t.export.deferred, m.deferred), ...part(t.notApplicable, m.notApplicable),
      ...part(t.export.answers, m.answers), ...part(t.export.zones, m.zones), ...part(t.export.comments, m.comments),
      ...part(t.export.openDecisions, m.openDecisions), ...part(t.export.openDependent, m.openDependent), ...part(t.export.openRequests, m.openRequests), "", m.remaining,
      t.export.versionRecord + " " + data.digest.record.slice(0, 12) + " · " + t.export.versionDiff + " " + data.digest.diff.slice(0, 12)].join("\\n");
  }
  function buildPreview() {
    const host = document.getElementById("export-preview");
    const restoreFocus = !!document.activeElement && host.contains(document.activeElement);
    host.textContent = "";
    const m = exportModel();
    const sec = (title, rows, emptyText) => {
      const d = document.createElement("div"); d.className = "xp-sec";
      const h = document.createElement("h3"); h.textContent = title; d.append(h);
      if (!rows.length) { const p = document.createElement("p"); p.className = "xp-row"; p.textContent = emptyText; d.append(p); }
      for (const r of rows) {
        const p = document.createElement("p"); p.className = "xp-row" + (r.draft ? " xp-draft" : "");
        const s = document.createElement("span"); s.textContent = r.text; p.append(s);
        if (r.passage !== undefined) { const b = document.createElement("button"); b.type = "button"; b.dataset.passageGoto = r.passage; b.textContent = t.export.goto; p.append(b); }
        else if (r.hash) { const a = document.createElement("a"); a.href = r.hash; a.textContent = t.export.goto; a.className = "xp-goto"; p.append(a); }
        d.append(p);
      }
      host.append(d);
    };
    sec(t.export.accepted, m.accepted, t.export.emptyAccepted);
    sec(t.export.deferred, m.deferred, t.export.emptyDeferred);
    if (m.notApplicable.length) sec(t.notApplicable, m.notApplicable, "");
    if (m.answers.length) sec(t.export.answers, m.answers, "");
    if (m.zones.length) sec(t.export.zones, m.zones, "");
    sec(t.export.comments, m.comments, t.export.emptyComments);
    if (m.openDecisions.length) sec(t.export.openDecisions, m.openDecisions, "");
    if (m.openDependent.length) sec(t.export.openDependent, m.openDependent, "");
    if (m.openRequests.length) sec(t.export.openRequests, m.openRequests, "");
    const cnt = document.createElement("p"); cnt.className = "xp-count";
    cnt.textContent = m.remaining + ". " + t.export.partial;
    host.append(cnt);
    if (restoreFocus) host.focus({ preventScroll: true });
  }
  function openExportDialog() { syncOut(); document.getElementById("export-status").textContent = ""; if (!exportDialog.open) exportDialog.showModal(); }
  exportDialog.addEventListener("click", (e) => {
    const passage = e.target.closest("[data-passage-goto]");
    if (passage) { exportDialog.close(); annotationUI.goTo(Number(passage.dataset.passageGoto)); return; }
    const a = e.target.closest("a.xp-goto");
    if (!a) return;
    e.preventDefault();
    const hash = a.getAttribute("href");
    exportDialog.close();
    history.replaceState(null, "", hash);
    openTarget(hash);
  });
  function copyDecisionsText() {
    if (outDirty) syncOut();
    const done = () => { document.getElementById("export-status").textContent = t.copied; };
    const fail = () => {
      out.focus({ preventScroll: true }); out.select();
      document.getElementById("export-status").textContent = t.copyFailed;
    };
    try { navigator.clipboard.writeText(out.value).then(done, fail); } catch { fail(); }
  }
  function downloadJson() {
    const payload = exportModel().payload;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "decisions-" + data.key + ".json"; a.click(); URL.revokeObjectURL(a.href);
  }

  // ---- paint: the settled group, the children, the comments, the subtab filter, the one counter ----
  const settledBody = document.querySelector("#group-settled .dgroup-body");
  const unitHome = new Map();
  function unitSettledState(unit) {
    const card = unit.querySelector(".qcard, .finding");
    if (!card) return null;
    const id = card.classList.contains("qcard") ? "q" + card.dataset.qid : card.classList.contains("idea") ? card.id : card.id.slice(1);
    return settledMap[id] || null;
  }
  // Settled cards move to compact rows; reverting moves the SAME card home (no second copy, ids preserved).
  function paintSettled() {
    for (const unit of all("#panel-decisions .dunit")) {
      const st = unitSettledState(unit);
      const card = unit.querySelector(".qcard, .finding");
      const focused = !!document.activeElement?.closest(".dunit, .settled-row");
      if (st && unit.dataset.settled !== st && !focused) {
        if (!unitHome.has(unit)) { const parent = unit.parentElement; unitHome.set(unit, { parent, siblings: [...parent.children] }); }
        let row = unit.closest("details.settled-row");
        if (!row) { row = document.createElement("details"); row.className = "settled-row"; row.append(document.createElement("summary")); unit.before(row); row.append(unit); }
        settledBody.append(row);
        unit.dataset.settled = st;
        progOpen(document.getElementById("group-settled"));
      } else if (!st && unit.dataset.settled && !focused) {
        const row = unit.closest("details.settled-row");
        const home = unitHome.get(unit);
        if (home) { const next = home.siblings.slice(home.siblings.indexOf(unit) + 1).find((s) => s.isConnected && s.parentElement === home.parent); home.parent.insertBefore(unit, next || null); }
        if (row) row.remove();
        delete unit.dataset.settled;
      }
      if (unit.dataset.settled) {
        const row = unit.closest("details.settled-row"), sum = row.querySelector("summary");
        const chipEl = card.querySelector("[data-qstatus], [data-fstatus]");
        sum.textContent = "";
        const idEl = document.createElement("span"); idEl.className = "sr-id"; idEl.textContent = card.id.toUpperCase();
        const chipClone = document.createElement("span"); chipClone.className = "sr-answer"; chipClone.textContent = (chipEl ? chipEl.textContent : "") + (st === "deferred" ? " · " + t.status.open : "");
        const titleEl = document.createElement("span"); titleEl.className = "sr-title"; titleEl.textContent = (card.querySelector(".card-title") || {}).textContent || "";
        const edit = document.createElement("span"); edit.className = "sr-edit"; edit.textContent = t.commentEdit;
        sum.append(titleEl, chipClone, idEl, edit);
        if (state.notes[card.id]) { const n = document.createElement("span"); n.className = "sr-note"; n.textContent = "· " + t.cardComment.toLowerCase(); sum.append(n); }
        row.dataset.state = st || "open";
      }
    }
    document.getElementById("settled-count").textContent = "· " + Object.keys(settledMap).length;
  }
  function paintChildren() {
    for (const det of all("[data-qchildren]")) {
      const pid = det.dataset.qchildren, parent = qById[pid]; if (!parent) continue;
      const e = qEntry(pid), kids = parent.children || [], sum = det.querySelector("summary");
      const kidLabel = kids.map((k) => "Q" + k).join(", ");
      const na = kids.length && kids.every((k) => { const c = qById[String(k)]; return c && isNA(c); });
      const accepted = D.validAccept(parent, state);
      if (na) sum.textContent = t.children + " " + kidLabel + " · " + t.childrenNa;
      else if (accepted) sum.textContent = t.children + " " + kidLabel + " · " + t.childrenOpen.replace("{n}", variantLabel(pid, e.variant) || t.accepted);
      else sum.textContent = t.children + " " + kidLabel + " · " + t.childrenWait + " Q" + pid;
      const pv = accepted ? (e.variant || "comment") : "";
      if (det.dataset.lastPV !== pv) { det.dataset.lastPV = pv; if (pv && !na) det.open = true; else if (na) det.open = false; }
    }
  }
  const commentView = () => {
    const view = document.createElement("div"); view.className = "comment-view";
    const p = document.createElement("p"); p.className = "comment-text";
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "comment-edit"; edit.textContent = t.commentEdit;
    view.append(p, edit);
    return view;
  };
  function paintComments() {
    for (const d of all(".card-comment")) {
      const id = d.dataset.comment, note = id[0] === "q" ? D.noteOf(state, id.slice(1)) : state.notes[id] || "";
      const sum = d.querySelector("summary"), ta = d.querySelector("textarea");
      sum.textContent = note ? t.cardCommentN.replace("{n}", 1) : t.cardComment;
      let view = d.querySelector(".comment-view");
      if (note) {
        if (!view) { view = commentView(); sum.after(view); }
        view.querySelector(".comment-text").textContent = note;
        const editing = d.dataset.editing === "1" || document.activeElement === ta;
        view.hidden = editing; ta.hidden = !editing;
      } else { if (view) view.remove(); ta.hidden = false; d.dataset.editing = ""; }
    }
    for (const bc of all(".block-comment")) {
      const id = bc.dataset.blockcomment, note = state.notes[id] || "";
      const input = bc.querySelector("input"), label = bc.querySelector("label");
      let view = bc.querySelector(".comment-view");
      if (note) {
        if (!view) { view = commentView(); bc.append(view); }
        view.querySelector(".comment-text").textContent = note;
        const editing = bc.dataset.editing === "1" || document.activeElement === input;
        view.hidden = editing; input.hidden = !editing; if (label) label.hidden = !editing;
      } else { if (view) view.remove(); input.hidden = false; if (label) label.hidden = false; bc.dataset.editing = ""; }
    }
    for (const [bid, parts] of segIndex) {
      const sm = parts[0] && parts[0].querySelector(".segmeta > summary");
      if (sm) sm.textContent = (state.notes["b" + bid] ? t.segCommentDetailsN : t.segCommentDetails).replace("{n}", 1);
    }
  }
  function paintChoiceCounts(st) {
    const counts = { q: st.q, f: st.f, i: st.i, fact: st.fact, deferred: st.deferred, done: st.done };
    for (const b of all("[data-choice-filter]")) {
      const v = b.dataset.choiceFilter; if (v === "all") continue;
      const n = counts[v], badge = b.querySelector(".cf-count");
      if (badge) { badge.textContent = n; badge.dataset.zero = n ? "0" : "1"; }
      const wording = v === "fact" ? t.countAnswers : v === "deferred" ? t.countDeferred : ["i", "done"].includes(v) ? t.countEntries : v === "q" ? t.countDecisions : t.countFindings;
      b.title = wording.replace("{n}", n);
      b.setAttribute("aria-label", b.dataset.cfLabel + ": " + b.title);
    }
  }
  function applyChoiceFilter(val, preserveFocus = true) {
    choiceFilter = val;
    for (const b of all("[data-choice-filter]")) b.setAttribute("aria-pressed", String(b.dataset.choiceFilter === val));
    for (const unit of all("#panel-decisions .dunit")) {
      const card = unit.querySelector(".qcard, .finding");
      const st = unitSettledState(unit), row = unit.closest("details.settled-row");
      const focused = preserveFocus && (unit.contains(document.activeElement) || !!row?.contains(document.activeElement));
      let pinned = focused && !!row && unit.dataset.settled !== (st || "");
      const cards = [...unit.querySelectorAll(".qcard[data-qid]")];
      if (cards.length && ["q", "fact", "deferred"].includes(val)) {
        const matching = cards.filter((c) => D.matchesQuestion(qById[c.dataset.qid], val, state, data.questions));
        const visible = new Set(matching.map((c) => c.dataset.qid));
        const addParents = (c) => { let q = qById[c.dataset.qid]; while (q?.parent) { visible.add(String(q.parent.question)); q = qById[String(q.parent.question)]; } };
        matching.forEach(addParents);
        const active = document.activeElement?.closest?.(".qcard[data-qid]");
        if (focused && active && cards.includes(active) && !visible.has(active.dataset.qid)) { matching.push(active); visible.add(active.dataset.qid); addParents(active); pinned = true; }
        for (const c of cards) c.hidden = !visible.has(c.dataset.qid);
        for (const d of unit.querySelectorAll(".qchildren")) { const has = [...d.querySelectorAll(".qcard[data-qid]")].some((c) => visible.has(c.dataset.qid)); d.hidden = !has; if (has) progOpen(d); }
        unit.hidden = !matching.length;
      } else {
        for (const c of cards) c.hidden = false;
        for (const d of unit.querySelectorAll(".qchildren")) d.hidden = false;
        const typ = card.classList.contains("qcard") ? "q" : card.classList.contains("idea") ? "i" : "f";
        unit.hidden = !(val === "all" || (!cards.length && typ === val) || (val === "done" && st === "done"));
      }
      if (focused && unit.hidden) { unit.hidden = false; pinned = true; }
      let note = unit.querySelector(":scope > .filter-editing");
      if (pinned && !note) { note = document.createElement("p"); note.className = "filter-editing sub"; note.setAttribute("role", "status"); unit.prepend(note); }
      if (note) { note.textContent = t.filterEditing; note.hidden = !pinned; }
    }
    for (const g of all("#panel-decisions .dgroup")) g.hidden = ![...g.querySelectorAll(".dunit")].some((u) => !u.hidden);
    if (val !== "all") for (const d of all("#panel-decisions details.settled-row, #group-settled, #ideas")) { if (!d.hidden && d.querySelector(".dunit:not([hidden])")) progOpen(d); }
  }
  function paint() {
    const answerStatuses = D.factAnswerStatuses(data.questions, state);
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
    for (const input of all("[data-note]")) if (document.activeElement !== input) input.value = input.dataset.note[0] === "q" ? D.noteOf(state, input.dataset.note.slice(1)) : state.notes[input.dataset.note] || "";
    for (const card of all(".qcard[data-qid]")) {
      const q = qById[card.dataset.qid]; if (!q) continue;
      const e = qEntry(q.id), na = isNA(q), pending = parentPending(q);
      card.classList.toggle("na", na);
      const chipEl = card.querySelector("[data-qstatus]");
      if (chipEl) {
        let stateName = "open", text = t.status.open;
        const answer = answerStatuses["q" + q.id];
        if (answer) { stateName = answer.status === "not-applicable" ? "na" : answer.status === "waiting-parent" ? "open" : "answered"; text = answerStatusText(answer); }
        else if (na) { stateName = "na"; text = t.notApplicable; }
        else if (D.validAccept(q, state) && e.variant) { stateName = "decided"; text = t.status.decided.replace("{n}", variantLabel(q.id, e.variant)); }
        else if (e.choice === "accepted" && D.validAccept(q, state)) { stateName = "decided"; text = t.selectedNoVariant; }
        else if (D.validDefer(q, state)) { stateName = "deferred"; text = t.deferred; }
        else if (e.choice === "deferred") { stateName = "open"; text = t.deferReason; }
        else if (e.variant) { stateName = "draft"; text = t.status.draft.replace("{n}", variantLabel(q.id, e.variant)); }
        chipEl.dataset.state = stateName; chipEl.textContent = text;
      }
      const gate = card.querySelector("[data-qgate]");
      if (gate) {
        if (na) { gate.hidden = false; gate.textContent = t.gateNa.replace("{n}", q.parent.question) + (e.variant ? t.gateDraft.replace("{n}", variantLabel(q.id, e.variant)) : ""); }
        else if (pending) { gate.hidden = false; gate.textContent = t.gatePending.replace("{n}", pending); }
        else gate.hidden = true;
      }
      const draftEl = card.querySelector("[data-qdraft]");
      if (draftEl) {
        const showDraft = !na && !pending && e.variant && e.choice !== "accepted";
        draftEl.hidden = !showDraft;
        if (showDraft) draftEl.textContent = t.draftDeferred.replace("{n}", variantLabel(q.id, e.variant));
      }
      for (const radio of card.querySelectorAll("[data-question-variant]")) radio.checked = !na && !pending && (e.choice === "accepted" || e.choice === "draft") && e.variant === radio.value;
      const disabled = na || pending;
      for (const el of card.querySelectorAll(".qopts input, .qactions button, .decide button, [data-note], [data-zone], [data-answer]")) el.disabled = disabled;
      const fs = card.querySelector(".qopts"); if (fs) fs.disabled = disabled;
      const badge = card.querySelector(".na-badge"); if (badge) badge.hidden = !na;
      const hint = card.querySelector(".requires-content");
      if (hint) {
        const missing = (e.choice === "accepted" && !D.validAccept(q, state)) || (e.choice === "deferred" && !D.validDefer(q, state));
        hint.hidden = !missing; hint.textContent = e.choice === "deferred" ? t.deferReason : t.requiresContent;
      }
      const resetBtn = card.querySelector("[data-qreset]");
      if (resetBtn) {
        const hide = !(e.choice || e.variant);
        if (hide && document.activeElement === resetBtn) card.querySelector("[data-question-variant]:not(:disabled), [data-defer]:not(:disabled)")?.focus({ preventScroll: true });
        resetBtn.hidden = hide;
      }
      const ansInput = card.querySelector("[data-answer]");
      if (ansInput && document.activeElement !== ansInput) ansInput.value = state.answers["q" + q.id] || "";
    }
    for (const chipEl of all("[data-fstatus]")) {
      const id = chipEl.dataset.fstatus, v = state.findings[id], idea = id[0] === "i";
      if (v === "apply") { chipEl.dataset.state = "decided"; chipEl.textContent = t.status.decided.replace("{n}", idea ? t.ideaApply : t.fixApply); }
      else if (v === "skip") { chipEl.dataset.state = "decided"; chipEl.textContent = t.status.decided.replace("{n}", idea ? t.ideaSkip : t.fixSkip); }
      else { chipEl.dataset.state = "open"; chipEl.textContent = t.status.open; }
    }
    for (const z of all("[data-zone]")) { const card = z.closest(".qcard"); const na = card && card.classList.contains("na"); if (!na) z.checked = !!state.zones[z.dataset.zone]; }
    const st = stats();
    settledMap = st.settled;
    paintSettled();
    paintChildren();
    paintComments();
    const cnt = document.getElementById("count-decisions"); if (cnt) { cnt.textContent = st.remaining; cnt.setAttribute("aria-label", t.tabRemaining.replace("{n}", st.remaining)); cnt.removeAttribute("title"); }
    document.getElementById("choice-outstanding").textContent = [[st.dependent, t.dependent], [st.fact, t.unanswered], [st.waiting, t.waitingParent]].filter(([n]) => n).map(([n, s]) => s.replace("{n}", n)).join(" · ");
    paintChoiceCounts(st);
    applyChoiceFilter(choiceFilter);
    if (exportDialog.open) syncOut(); else outDirty = true;
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
    const exp = event.target.closest("#export-open"); if (exp) { openExportDialog(); return; }
    const ce = event.target.closest(".comment-edit");
    if (ce) { const d = ce.closest(".card-comment, .block-comment"); d.dataset.editing = "1"; const view = d.querySelector(".comment-view"); if (view) view.hidden = true; const field = d.querySelector("textarea, input"); field.hidden = false; const lbl = d.querySelector("label"); if (lbl) lbl.hidden = false; field.focus(); return; }
    const cf = event.target.closest("[data-choice-filter]"); if (cf) { applyChoiceFilter(cf.dataset.choiceFilter, false); return; }
    const zbtn = event.target.closest("button.shot-open"); if (zbtn) { showZoom(+zbtn.dataset.zoom); return; }
    const img = event.target.closest("img.shot-zoom"); if (img) { showZoom(shots.indexOf(img)); return; }
    const segpop = event.target.closest("[data-segpop]"); if (segpop) { openPop(segpop.dataset.segpop, segpop); return; }
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    if (button.dataset.navigationView) {
      navigationView = button.dataset.navigationView;
      document.getElementById("files-tree").hidden = navigationView !== "files";
      document.getElementById("unit-tree").hidden = navigationView !== "units";
      for (const b of all("[data-navigation-view]")) b.setAttribute("aria-pressed", String(b.dataset.navigationView === navigationView));
      updateRequirementViews();
      return;
    }
    if (button.dataset.unitBlock) {
      const id = button.dataset.unitBlock;
      insertFile(data.blockFile[id]);
      const target = document.getElementById("b" + id);
      if (target && target.style.display !== "none") {
        showMobileDiff();
        updateUnitContext(target);
        const index = chipMatches().indexOf(target);
        if (index >= 0) { chipIdx = index; paintChipPos(chipMatches().length); }
        target.tabIndex = -1;
        requestAnimationFrame(() => { target.scrollIntoView({ block: "start" }); target.focus({ preventScroll: true }); });
      }
      return;
    }
    const group = button.closest(".decide");
    if (group) {
      const id = group.dataset.finding;
      if (id[0] === "q") {
        const k = id.slice(1), cur = { ...qEntry(k) };
        if (cur.choice === button.value) delete cur.choice; else cur.choice = button.value;
        if (cur.choice || cur.variant) state.questions[k] = cur; else delete state.questions[k];
      } else if (state.findings[id] === button.value) delete state.findings[id]; else state.findings[id] = button.value;
    } else if (button.dataset.show) { if (button.dataset.show !== map.dataset.show) document.getElementById("code-notice").textContent = ""; setMode(button.dataset.show); return; }
    else if (button.dataset.purposeFilter) { togglePurpose(button.dataset.purposeFilter); return; }
    else if (button.dataset.reqFilter !== undefined) { jumpToFilter("req", button.dataset.reqFilter); return; }
    else if (button.dataset.qFilter !== undefined) { jumpToFilter("q", button.dataset.qFilter); return; }
    else if (button.dataset.fFilter !== undefined) { jumpToFilter("f", button.dataset.fFilter); return; }
    else if (button.dataset.defer) { const k = button.dataset.defer, cur = { ...qEntry(k) }; cur.choice = "deferred"; state.questions[k] = cur; }
    else if (button.dataset.qreset) { delete state.questions[button.dataset.qreset]; }
    else if (button.id === "hide-tree" || button.id === "show-tree") {
      const on = button.id === "hide-tree";
      state.treeHidden = on; save();
      document.getElementById("code-layout").classList.toggle("hide-tree", on);
      document.getElementById("show-tree").hidden = !on;
      document.getElementById("hide-tree").hidden = on;
      return;
    }
    else if (button.dataset.treeMode) { setTreeMode(button.dataset.treeMode); return; }
    else if (button.dataset.mview) { document.getElementById("code-layout").dataset.mview = button.dataset.mview; for (const b of all("[data-mview]")) b.setAttribute("aria-pressed", String(b.dataset.mview === button.dataset.mview)); return; }
    else if (button.id === "code-top") { window.scrollTo({ top: 0 }); return; }
    else if (button.dataset.fexpand !== undefined) {
      activate("code"); insertFile(button.dataset.fexpand);
      const host = document.getElementById("file-" + button.dataset.fexpand);
      const file = host && host.querySelector(".file"); if (file) { file.classList.add("reveal"); applySegFilter(); file.scrollIntoView({ block: "start" }); }
      return;
    }
    else if (button.id === "tree-expand-all") { all(".tree-nav details").forEach((d) => d.open = true); return; }
    else if (button.id === "tree-collapse-all") { all(".tree-nav details").forEach((d) => d.open = false); return; }
    else if (button.dataset.zoomFit !== undefined) { zoomMode("fit"); return; }
    else if (button.dataset.zoomFull !== undefined) { zoomMode("1:1"); return; }
    else if (button.dataset.zoomPrev !== undefined) { showZoom(zi - 1); return; }
    else if (button.dataset.zoomNext !== undefined) { showZoom(zi + 1); return; }
    else if (button.dataset.overlay !== undefined) { button.setAttribute("aria-pressed", String(button.closest("article").querySelector(".shots").classList.toggle("overlaid"))); return; }
    else if (button.id === "print-owner") { auditorPrint = false; window.print(); return; }
    else if (button.id === "print-audit") { auditorPrint = true; window.print(); return; }
    else if (button.id === "export-json-top") { downloadJson(); return; }
    else if (button.id === "copy-top") { copyDecisionsText(); return; }
    else if (button.id === "clear") { if (!confirm(t.clearConfirm)) return; state = D.empty(); annotationUI.reset(); clearFilters(); }
    else return;
    if (event.isTrusted && button.closest(".dunit") && !button.closest(".dunit").contains(document.activeElement)) button.focus({ preventScroll: true });
    state = D.settle(data.questions, state); save(); paint();
  });
  document.addEventListener("input", (event) => {
    if (event.target.dataset.blend !== undefined) event.target.closest("article").querySelector(".shots").style.setProperty("--blend", event.target.value / 100);
    const aid = event.target.dataset.answer;
    if (aid) { if (event.target.value.trim()) state.answers[aid] = event.target.value; else delete state.answers[aid]; save(); paint(); return; }
    const id = event.target.dataset.note;
    if (!id) return;
    if (id[0] === "q" && state.questions[id.slice(1)]?.note !== undefined) delete state.questions[id.slice(1)].note;
    if (event.target.value.trim()) state.notes[id] = event.target.value; else delete state.notes[id];
    state = D.settle(data.questions, state); save(); paint();
  });
  document.addEventListener("focusout", (event) => {
    const d = event.target.closest && event.target.closest(".card-comment, .block-comment");
    if (d && !d.contains(event.relatedTarget)) { d.dataset.editing = ""; paintComments(); }
    const unit = event.target.closest && (event.target.closest(".dunit") || event.target.closest(".settled-row")?.querySelector(".dunit"));
    if (unit && !event.relatedTarget?.closest?.(".dunit, .settled-row") && !unit.closest(".settled-row")?.contains(event.relatedTarget) && !unit.contains(event.relatedTarget))
      queueMicrotask(() => { if (!unit.contains(document.activeElement) && !unit.closest(".settled-row")?.contains(document.activeElement)) paint(); });
  });
  document.addEventListener("change", (event) => {
    const qid = event.target.dataset.questionVariant;
    if (qid) {
      const cur = { ...qEntry(qid) };
      if (event.target.value) { cur.variant = event.target.value; cur.choice = "accepted"; }
      else { delete cur.variant; if (cur.choice === "accepted" || cur.choice === "draft") delete cur.choice; }
      if (cur.choice || cur.variant) state.questions[qid] = cur; else delete state.questions[qid];
      if (event.isTrusted && !event.target.closest(".dunit")?.contains(document.activeElement)) event.target.focus({ preventScroll: true });
      state = D.settle(data.questions, state); save(); paint(); return;
    }
    const z = event.target.dataset.zone;
    if (z) { if (event.target.checked) state.zones[z] = true; else delete state.zones[z]; save(); }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches?.("img.shot-zoom")) { event.preventDefault(); showZoom(shots.indexOf(event.target)); }
  });

  // ---- print: owner hides map/tree, builds the lazy bodies, opens EVERY nested disclosure; auditor opens all;
  // afterprint returns the page to what it was, lazy files and filter views included. ----
  let printSnapshot = null, auditorPrint = false;
  window.addEventListener("beforeprint", () => {
    const treeCol = document.querySelector(".tree-col");
    printSnapshot = { inserted: new Set(inserted), revealedFiles: all("#map .file.reveal").map((file) => file.closest(".file-lazy").dataset.file), openDetails: all("details[open]"), openUnits: all("#unit-tree details[open]").map((d) => d.dataset.unit), unitBlock: document.querySelector("#map .unit-context")?.closest(".seg[id][data-block]")?.dataset.block, show: map.dataset.show, req: map.dataset.req, q: map.dataset.q, f: map.dataset.f, hiddenPurposes: [...hiddenPurposes()], chipIdx, chipPos: chipPos.textContent, chipNav: chipPrev.disabled, mapDisplay: map.style.display, treeDisplay: treeCol ? treeCol.style.display : null };
    if (auditorPrint) {
      clearFilters(); setMode("all"); insertAll();
      // Build the lazy bodies first, then open everything: the clones' nested disclosures print open too.
      for (const d of all("#panel-decisions .qwhere[data-qwhere]")) { progOpen(d); buildWhere(d); }
      all("details").forEach(progOpen);
    }
    else {
      map.style.display = "none"; if (treeCol) treeCol.style.display = "none";
      for (const d of all("#panel-decisions .qwhere[data-qwhere]")) { progOpen(d); buildWhere(d); }
      for (let i = 0; i < 2; i++) all("#panel-decisions details:not([open])").forEach(progOpen);
    }
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
    if (auditorPrint) for (const host of all(".file-lazy")) host.querySelector(".file")?.classList.toggle("reveal", printSnapshot.revealedFiles.includes(host.dataset.file));
    if (printSnapshot.req) map.dataset.req = printSnapshot.req;
    if (printSnapshot.q) map.dataset.q = printSnapshot.q;
    if (printSnapshot.f) map.dataset.f = printSnapshot.f;
    state.hiddenPurposes = printSnapshot.hiddenPurposes; save();
    // Every filter view returns from the snapshot: mode buttons, purpose toggles, tree rows/dirs, chip position.
    for (const other of all("[data-show]")) if (other !== map) other.setAttribute("aria-pressed", String(other.dataset.show === map.dataset.show));
    for (const b of all("[data-purpose-filter]")) b.setAttribute("aria-pressed", String(!state.hiddenPurposes.includes(b.dataset.purposeFilter)));
    applyTreeFilter();
    applySegFilter();
    if (auditorPrint && printSnapshot.unitBlock) updateUnitContext(document.getElementById("b" + printSnapshot.unitBlock));
    for (const d of all("#unit-tree details")) d.open = printSnapshot.openUnits.includes(d.dataset.unit);
    chipIdx = printSnapshot.chipIdx;
    chipPos.textContent = printSnapshot.chipPos;
    chipPrev.disabled = chipNext.disabled = printSnapshot.chipNav;
    printSnapshot = null; auditorPrint = false;
  });

  annotationUI = (${annotations.toString()})({ sha256: (${annotationSha256.toString()}), ensureWhere: buildWhere, state: () => state, changed: () => { save(); paint(); }, identity: { document: data.annotationDocument, record: data.annotationRecord }, locationsChanged: () => { if (exportDialog.open) syncOut(); else outDirty = true; }, t: data.annotationLabels, reveal: (el) => {
    const panel = el.closest(".panel");
    if (panel?.dataset.panel === "decisions") applyChoiceFilter("all");
    if (panel && panel.dataset.panel !== activeTab) { activate(panel.dataset.panel); history.replaceState(null, "", "#panel-" + panel.dataset.panel); }
    const seg = el.closest(".seg[data-block]");
    if (seg && seg.style.display === "none") { clearFilters(); setMode("all"); }
    for (let p = el.parentElement; p; p = p.parentElement) if (p.tagName === "DETAILS") progOpen(p);
  } });
  annotationUI.render(); zoomMode("fit"); applyTreeFilter();
  for (const b of all("[data-purpose-filter]")) b.setAttribute("aria-pressed", String(!hiddenPurposes().includes(b.dataset.purposeFilter)));
  document.getElementById("code-layout").classList.toggle("hide-tree", !!state.treeHidden);
  document.getElementById("show-tree").hidden = !state.treeHidden;
  document.getElementById("hide-tree").hidden = !!state.treeHidden;
  setTreeMode(state.treeMode === "flat" ? "flat" : "folder");
  applyTreeWidth(state.treeWidth);
  paint();
  let spyScheduled = false;
  window.addEventListener("scroll", () => {
    if (spyScheduled || activeTab !== "code") return;
    spyScheduled = true;
    requestAnimationFrame(() => {
      spyScheduled = false;
      const files = all("#map .file-lazy").filter((host) => host.querySelector(".file") && host.getBoundingClientRect().top <= 140);
      const current = files.at(-1)?.dataset.file;
      for (const row of all(".frow")) {
        const selected = row.dataset.frow === current;
        row.classList.toggle("current", selected);
        const button = row.querySelector(".fname");
        if (selected) button.setAttribute("aria-current", "location"); else button.removeAttribute("aria-current");
      }
    });
  }, { passive: true });
  if (location.hash && location.hash !== "#") openTarget(location.hash); else activate("decisions");
})();
`;

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
const coverageLabel = (kind, t) => t(kind === "not_checked" ? "coverage.not-checked" : `coverage.${kind}`);
// The place of a question or finding, shortened to the file's unique suffix; the full place stays in the title.
const placeHtml = (at, model) => {
  const i = String(at).lastIndexOf(":"), file = model.files.find((f) => f.path === String(at).slice(0, i));
  return `<code class="sub" title="${esc(at)}">${esc(file ? file.short + String(at).slice(i) : at)}</code>`;
};

// Where the change lives, in one collapsed line: the links and the date; the revisions and digests one click in.
function passport(review, model, t) {
  const p = review.passport;
  return `<details class="passport-card" id="passport" data-where="${esc(t("passport"))}">
  <summary class="passport">${esc(t("report-details"))}</summary>
  <div class="passport-body mono">${(p?.links ?? []).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(" ")} ${esc(p?.reviewedAt ?? "")} ${esc(p?.repository ?? "")} · ${esc(review.range)} ${p ? `· ${esc(t("passport.base"))} ${esc(p.base)} → ${esc(t("passport.head"))} ${esc(p.head)}` : ""} · ${esc(p ? t("passport.diffSha") : "diff_sha256")} ${esc(review.diff?.sha256 ?? "")} · ${esc(p ? t("passport.record") : "record_sha256")} ${esc(model.recordSha ?? model.key)}</div>
</details>`;
}

function summary(review, { blocks }, t) {
  const { change } = review;
  const legend = `<p class="legend sub">${VERDICTS.map((v) => `<span><span class="tag v-${v}">${esc(t(`verdict.${v}`))}</span> ${sizeOf(of(blocks, v))}</span>`).join("")}</p>`;
  return `
<section id="summary" class="stack overview" data-where="${esc(t("summary"))}">
  ${lines(review.verdict, ' class="lead"')}
  <p><strong>${esc(t("recommendation"))}:</strong> ${prose(review.recommendation)}</p>
  ${review.steps?.length ? `<ol class="steps">${review.steps.map((step) => `<li>${prose(step.text)}${step.findings?.length ? ` <span class="sub">(${cite(step.findings)})</span>` : ""}</li>`).join("")}</ol>` : ""}
  <p>${prose(change.goal)}${change.why ? ` ${prose(change.why)}` : ""} <a href="#questions">${esc(t("questions"))} →</a></p>
  <details class="context-change"><summary>${esc(t("context.change"))}</summary>
    <div class="stack"><p class="sub"><strong>${esc(t("now"))}:</strong></p>${lines(review.now)}
    <p class="sub"><strong>${esc(t("target"))}:</strong></p>${lines(review.target)}
    ${legend}
    <ul class="plain">${change.parts.map((part) => `<li>${prose(part)}</li>`).join("")}</ul>
    <details class="sources"><summary>${esc(t("sources"))}</summary><p class="sub">${change.sources.map(prose).join("; ")}</p></details></div>
  </details>
</section>`;
}

// A recommendation naming no variant and opening with the reviewer's own «no clear recommendation» (ru/en)
// is an uncertainty statement: the card's limit slot, not a direction. Nothing invented: record text or nothing.
const noClearRec = (text) => /^(однозначной рекомендации нет|no clear recommendation)/i.test(String(text ?? ""));
// One comment pattern for cards and blocks: closed by default, «Comment» / «Comment · 1», saved text compact
// with an edit action; an empty textarea is never permanent.
const commentBox = (id, t, hint) => `<details class="card-comment act" data-comment="${esc(id)}"><summary>${esc(t("card.comment"))}</summary><textarea class="qnote" id="qnote-${esc(id)}" data-note="${esc(id)}" rows="2" aria-label="${esc(hint || t("card.comment"))}: ${esc(id)}"></textarea></details>`;
const names = (t, label, ids) => ids?.length ? ` <strong>${esc(t(label))} ${ids.map((id) => `<a href="#requirement-${esc(id)}">R${esc(id)}</a>`).join(", ")}.</strong>` : "";

const findingHead = (title, displayId, statusId, meta, t) => `<div class="card-head"><h3 class="card-title" data-ann-field="title">${esc(title)}</h3><span class="card-id mono">${esc(displayId)}</span><span class="tag v-open qstatus" data-fstatus="${esc(statusId)}" data-state="open">${esc(t("decision.status.open"))}</span>${meta ? `<span class="card-meta">${meta}</span>` : ""}</div>`;
const applySkip = (id, kind, ariaArg, t) => `<div class="card-choice"><span class="choice-label act">${esc(t(kind === "fix" ? "decision.your-decision" : "decision.your-choice"))}</span><span class="decide group act" data-finding="${esc(id)}"><button type="button" value="apply" aria-label="${esc(t(`decision.${kind}-apply-aria`, ariaArg))}">${esc(t(`decision.${kind}-apply`))}</button><button type="button" value="skip" aria-label="${esc(t(`decision.${kind}-skip-aria`, ariaArg))}">${esc(t(`decision.${kind}-skip`))}</button></span></div>`;

// One question card in the unified shell: head → essence → limit → choice → answer → comment → disclosures.
// The state machine is the record's: variants, gate, draft, zones; only the shell is shared.
function questionCard(q, review, model, t, child, partCount) {
  const variants = q.variants ?? [];
  const rec = q.recommendation;
  const asLimit = q.kind === "decision" && variants.length && rec && !rec.variant && noClearRec(rec.text);
  const limit = asLimit ? prose(rec.text)
    : q.kind !== "decision" && q.remainingEvidence?.length ? `${esc(t("decision.limit-unverified"))} ${q.remainingEvidence.map((n) => `<a href="#q${n}">Q${n}</a>`).join(", ")}` : "";
  const advice = rec && !asLimit ? `<p class="qadvice"><strong>${esc(t("recommendation"))}:</strong> ${prose(rec.text)}${rec.variant ? ` <span class="sub">[${esc(rec.variant)}]</span>` : ""}${rec.sources?.length ? ` <span class="sub">(${srcHtml(rec.sources, review, t, q.id)})</span>` : ""}<br><span class="sub">${esc(t("question.recommendation-note"))}</span></p>` : "";
  const actions = q.kind === "decision" && variants.length ? `
    <div class="qactions act"><button type="button" data-defer="${q.id}" aria-label="${esc(t("decision.defer"))}: Q${q.id}">${esc(t("decision.defer"))}</button><button type="button" data-qreset="${q.id}" aria-label="${esc(t("decision.reset"))}: Q${q.id}" hidden>${esc(t("decision.reset"))}</button></div>
    <p class="qdraft sub" data-qdraft="${q.id}" hidden></p>` : "";
  const decide = q.kind === "decision" && !variants.length ? `<div class="card-choice"><span class="decide group act" data-finding="q${q.id}"><button type="button" value="accepted">${esc(t("decision.accepted"))}</button><button type="button" value="deferred">${esc(t("decision.deferred"))}</button></span></div>` : "";
  const answer = q.kind === "fact" || q.kind === "evidence" ? `
    <label class="fact-answer-label act" for="answer-q${q.id}">${esc(t("decision.answer-label"))}</label>
    <input type="text" class="act" id="answer-q${q.id}" data-answer="q${q.id}" placeholder="${esc(t("decision.answer-placeholder"))}" aria-label="${esc(t("decision.answer-label"))}: Q${q.id}" disabled>` : "";
  const qparts = q.blocks ? model.blocks.filter((b) => b.questions.includes(q.id)).reduce((sum, b) => sum + (partCount[b.id] ?? 1), 0) : 0;
  const where = q.blocks ? `<details class="qwhere" data-qwhere="${q.id}"><summary>${esc(t("card.more-code"))} · ${placeHtml(q.at, model)} · ${qparts} ${esc(t("fragments"))}</summary><div class="qwhere-body"></div><p><button type="button" class="req-link" data-q-filter="${q.id}" disabled>${esc(t("map.open-filter"))} →</button></p></details>` : "";
  const remaining = q.remainingEvidence?.length ? `<div class="qremaining-block"><span class="label">${esc(t("question.remaining-evidence"))}</span><ul class="plain">${q.remainingEvidence.map((n) => `<li><a href="#q${n}">Q${n}</a> ${prose(review.questions[n - 1].text)}</li>`).join("")}</ul></div>` : "";
  const checks = q.kind === "decision" && q.remainingEvidence?.length ? `<details class="qchecks"><summary>${esc(t("card.more-checks"))}</summary><div class="stack">${remaining}</div></details>` : "";
  return `
  <div class="qcard ${esc(q.kind)}${child ? " child" : ""}" id="q${q.id}" data-qid="${q.id}"${q.parent ? ` data-parent="${q.parent.question}"` : ""} data-where="Q${q.id}">
    <div class="card-head"><h3 class="card-title" data-ann-field="text">${prose(q.text)}</h3><span class="card-id mono">Q${q.id}</span><span class="tag v-open qstatus" data-qstatus="${q.id}" data-state="open">${esc(t("decision.status.open"))}</span><span class="tag v-open na-badge" hidden>${esc(t("decision.na-badge"))}</span><span class="card-meta">${q.kind === "decision" && q.resolver === "owner" ? esc(t("question.owner-decision")) : esc(t(`question.kind.${q.kind}`)) + (q.resolver ? ` · ${esc(q.resolver)}` : "")} · ${placeHtml(q.at, model)}</span></div>
    ${q.parent ? `<p class="qgate sub" data-qgate="${q.id}" hidden></p><p class="sub">${esc(t("question.parent"))}: <a href="#q${q.parent.question}">Q${q.parent.question}</a></p>` : ""}
    ${limit ? `<p class="card-limit">${limit}</p>` : ""}
    ${advice}
    ${variants.length ? `<fieldset class="qopts" disabled><legend>${esc(t("decision.choose"))}</legend>${variants.map((v, vi) => `
      <label class="qopt"><input type="radio" name="vq${q.id}" value="${esc(v.id)}" data-question-variant="${q.id}" disabled><span><strong data-ann-field="variant.${vi}.text">${esc(v.text)}</strong>${v.consequences?.length ? `<span class="qcons">${esc(t("question.consequences"))}:</span>${claimsHtml(v.consequences, review, t, q.id, `variant.${vi}.consequences`)}` : ""}</span></label>`).join("")}<span class="sub nojs-note">${esc(t("decision.requires-js"))}</span></fieldset>` : ""}
    ${actions}${decide}
    ${q.kind === "decision" ? `<span class="sub requires-content" hidden></span>` : ""}
    ${answer}
    ${q.blocks ? `<div class="group">${model.blocks.filter((b) => b.questions.includes(q.id)).map(chip).join(" ")}</div>` : ""}
    ${q.zones?.length ? `<div class="qzones"><span class="label">${esc(t("question.zones"))}</span><ul class="plain">${q.zones.map((z, zi) => `<li><label><input type="checkbox" data-zone="${q.id}-${zi}" disabled> <span>${prose(z.text)}${z.sources?.length ? ` <span class="sub">(${srcHtml(z.sources, review, t, q.id)})</span>` : ""}</span></label></li>`).join("")}</ul><p class="zone-note sub">${esc(t("decision.zone-note"))}</p><span class="sub nojs-note">${esc(t("decision.requires-js"))}</span></div>` : ""}
    ${commentBox("q" + q.id, t, t("decision.note"))}
    <div class="card-more">
      <details class="qdetail"><summary>${esc(t("card.more-basis"))}</summary><div class="stack">
        ${q.context?.length ? `<div class="qctx"><span class="label">${esc(t("question.context"))}</span>${claimsHtml(q.context, review, t, q.id, "context")}</div>` : ""}
        ${asLimit && rec.sources?.length ? `<p class="sub">${esc(t("sources"))}: ${srcHtml(rec.sources, review, t, q.id)}</p>` : ""}
        ${q.kind !== "decision" ? remaining : ""}
      </div></details>
      ${where}
      ${checks}
    </div>
  </div>`;
}

function findingCard(f, review, model, t) {
  const blocks = model.blocks.filter((b) => b.findings.includes(f.id));
  return `
  <article class="finding" id="f${esc(f.id)}" data-where="${esc(`${t("finding")} ${f.id}`)}">
    ${findingHead(f.title, "F" + f.id, f.id, `${esc(t(`direction.${f.direction}`))} · ${esc(t("blocks"))}: ${blocks.length}`, t)}
    <p class="card-question"><span data-ann-field="what">${prose(f.what)}</span>${names(t, "breaks", f.breaks)}${names(t, "untested", f.untested)}</p>
    <p class="card-limit">${esc(t(`finding.limit.${f.evidence}`))}</p>
    <p class="card-consequence"><strong>${esc(t("fix"))}:</strong> <span data-ann-field="fix">${prose(f.fix)}</span></p>
    ${blocks.length ? `<div class="group">${blocks.map(chip).join("")}</div>` : ""}
    ${applySkip(f.id, "fix", f.id, t)}
    ${commentBox("f" + esc(f.id), t, t("note-finding"))}
    <div class="card-more">
      <details class="qdetail"><summary>${esc(t("card.more-basis"))}</summary><div class="stack"><p><strong>${esc(t("shown-by"))}:</strong> <span data-ann-field="shown_by">${prose(f.shown_by)}</span></p><p class="sub mono">${esc(f.at)}</p></div></details>
      ${blocks.length ? `<details class="qwhere"><summary>${esc(t("card.more-code"))} · ${placeHtml(f.at, model)} · ${esc(t("blocks"))}: ${blocks.length}</summary><div class="qwhere-body"><div class="group">${blocks.map(chip).join("")}<button type="button" class="req-link" data-f-filter="${esc(f.id)}" disabled title="${esc(t("map.open-filter"))}: F${esc(f.id)}">${esc(t("map.open-filter"))} →</button></div></div></details>` : ""}
    </div>
  </article>`;
}

function ideaCard(idea, model, t) {
  return `
  <article class="finding idea" id="${idea.id}" data-where="${esc(`${t("idea")}: ${idea.title}`)}">
    ${findingHead(idea.title, idea.id.toUpperCase(), idea.id, "", t)}
    <p class="card-question">${prose(idea.text)}</p>
    ${applySkip(idea.id, "idea", idea.title, t)}
    ${commentBox(idea.id, t, t("note-idea"))}
    ${idea.at ? `<div class="card-more"><details class="qwhere"><summary>${esc(t("card.more-code"))} · ${placeHtml(idea.at, model)}</summary><div class="qwhere-body"><p class="sub mono">${esc(idea.at)}</p></div></details></div>` : ""}
  </article>`;
}

function decisionSheet(review, model, t, ideas, partCount) {
  const qs = model.questions, byId = Object.fromEntries(qs.map((q) => [q.id, q]));
  const drawn = new Set();
  // The acyclic tree under each root, every question once: children in a disclosure under the parent's card
  // (the runtime opens it when the choice makes them apply); grandchildren keep theirs.
  const unitOf = (q, child) => {
    if (drawn.has(q.id)) return "";
    drawn.add(q.id);
    const card = questionCard(q, review, model, t, child, partCount);
    const kids = q.children.map((c) => byId[c] ? unitOf(byId[c], true) : "").join("");
    if (!kids) return card;
    const kidIds = q.children.map((c) => "Q" + c).join(", ");
    return card + `<details class="qchildren" data-qchildren="${q.id}"><summary>${esc(t("decision.children"))} ${esc(kidIds)} · ${esc(t("decision.children.wait"))} Q${q.id}</summary><div class="dgroup-body">${kids}</div></details>`;
  };
  const unit = (q) => `<div class="dunit" data-unit="q${q.id}">${unitOf(q, false)}</div>`;
  const ownerRoots = qs.filter((q) => q.kind === "decision" && !q.parent);
  const dataRoots = qs.filter((q) => (q.kind === "fact" || q.kind === "evidence") && !q.parent);
  const findings = review.findings.map((f) => `<div class="dunit" data-unit="f${esc(f.id)}">${findingCard(f, review, model, t)}</div>`).join("");
  const ideaUnits = ideas.map((idea) => `<div class="dunit" data-unit="${idea.id}">${ideaCard(idea, model, t)}</div>`).join("");
  return `
<section id="questions" class="stack decision-sheet" data-where="${esc(t("questions"))}">
  <p class="sub" id="choice-outstanding" role="status"></p>
  ${ownerRoots.length ? `<div class="dgroup" id="group-owner" role="group" aria-label="${esc(t("decisions"))}"><h3 class="dgroup-title">${esc(t("group.owner"))}</h3><div class="dgroup-body">${ownerRoots.map(unit).join("")}</div></div>` : ""}
  <div class="dgroup" id="group-fix" role="group" aria-label="${esc(t("findings"))}"><h3 class="dgroup-title">${esc(t("group.fix"))}</h3><div class="dgroup-body">${findings || `<p>${esc(t("none"))}</p>`}</div>
    ${ideas.length ? `<details class="ideas-opt" id="ideas"><summary>${esc(t("ideas.optional", ideas.length))} <span class="sub">— ${esc(t("ideas.not-counted"))}</span></summary><div class="dgroup-body">${ideaUnits}</div></details>` : ""}
  </div>
  ${dataRoots.length ? `<div class="dgroup" id="group-data" role="group" aria-label="${esc(t("questions"))}"><h3 class="dgroup-title">${esc(t("group.data"))}</h3>${(review.coverageStructured ?? []).filter((c) => c.kind === "not_checked").map((c) => `<p class="card-limit">${esc(t("decision.limit-unverified"))} ${esc(c.text)}</p>`).join("")}<div class="dgroup-body">${dataRoots.map(unit).join("")}</div></div>` : ""}
  <details class="dgroup" id="group-settled"><summary>${esc(t("group.settled"))} <span class="sub" id="settled-count"></span></summary><div class="dgroup-body"></div></details>
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
    ...listed.map((r) => `<tr id="requirement-${esc(r.id)}" data-where="${esc(`${t("requirement")} R${r.id}`)}"><td class="n">R${esc(r.id)}</td><td>${prose(r.text)}${r.doubt ? `<div class="doubt"><strong>${esc(t("reconsider"))}:</strong> ${prose(r.doubt)}</div>` : ""}</td>`
      + `<td><span class="tag v-open">${esc(t(`source.${r.source}`))}</span></td><td class="state">${status(r)}</td><td>${r.blocks.map(chip).join("") || `<span class="sub">${esc(t("no-block"))}</span>`} <button type="button" class="req-link" data-req-filter="${esc(r.id)}" disabled>${esc(t("map.open-filter"))} →</button></td><td class="n">${sizeOf(r.blocks)}</td></tr>`),
    ...(idle.length ? [`<tr><td></td><td colspan="3"><strong>${esc(t("idle"))}</strong></td><td>${idle.map(chip).join("")}</td><td class="n">${sizeOf(idle)}</td></tr>`] : [])])}
</section>`;
}

// An omission the owner accepted, with what remains and where it was accepted.
function tradeoffs(review, t) {
  if (!review.tradeoffs?.length) return "";
  return `
<section id="tradeoffs" class="stack"><h2>${esc(t("tradeoffs"))}</h2>${review.tradeoffs.map((x) => `
  <div class="tradeoff" data-where="${esc(t("tradeoffs"))}"><p>${prose(x.text)}</p><p class="sub"><strong>${esc(t("tradeoff.consequence"))}:</strong> ${prose(x.consequence)}${x.sources?.length ? ` (${srcHtml(x.sources, review, t)})` : ""}</p></div>`).join("")}
</section>`;
}

// Scenarios a person can run to see the change work: where to start, what to do and what to expect.
function checks(review, t) {
  if (!review.checks?.length) return "";
  return `
<section id="checks" class="stack"><h2>${esc(t("checks"))}</h2><p class="sub">${esc(t("checks-note"))}</p>
  ${table(["#", t("from"), t("do"), t("expect"), t("requirement")], review.checks.map((c, index) => `<tr data-where="${esc(`${t("checks")} ${index + 1}`)}"><td class="n">${index + 1}</td><td>${prose(c.from ?? "")}</td>`
    + `<td><ol>${c.do.map((step) => `<li>${prose(step)}</li>`).join("")}</ol></td><td>${prose(c.expect)}</td><td class="n">${(c.requirements ?? []).map((id) => `<a href="#requirement-${esc(id)}">R${esc(id)}</a>`).join(", ")}</td></tr>`))}
</section>`;
}

function screens(review, { screens: shown }, t) {
  if (!shown.length) return "";
  let zoom = 0;
  const shot = (name, picture, s) => {
    if (!picture) return "";
    const body = picture.link ? `<a href="${esc(picture.link)}" target="_blank" rel="noopener">${esc(picture.link)}</a>`
      : `<button type="button" class="shot-open act" data-zoom="${zoom++}">${esc(t("viewer.open"))}</button>`
        + `<img class="shot-zoom" src="${picture.data}" alt="${esc(t(name))}: ${esc(s.name)}" tabindex="0" role="button" data-historical="${s.historical ? 1 : 0}" aria-label="${esc(t("viewer.open"))}: ${esc(t(name))}: ${esc(s.name)}">`;
    return `<figure class="${name}"><figcaption class="label">${esc(t(name))}</figcaption>${body}</figure>`;
  };
  return `
<section id="screens" class="stack"><h2>${esc(t("screens"))}</h2>
  ${shown.some((s) => s.historical || s.missing) ? `<p class="sub">${shown.some((s) => s.historical) ? `${esc(t("screen.historical"))}. ` : ""}${shown.some((s) => s.missing) ? `${esc(t("not-compared"))}: ` : ""}${[...new Set(shown.map((s) => s.missing).filter(Boolean))].map(prose).join(" ")}</p>` : ""}
  ${shown.map((s, index) => `
  <article class="finding" id="shot-${index + 1}" data-where="${esc(`${t("screens")}: ${s.name}`)}">
    <h3>${esc(s.name)}<a class="shot-link" href="#shot-${index + 1}" aria-label="${esc(t("shot.permalink"))} ${index + 1}: ${esc(s.name)}" title="${esc(t("shot.permalink"))}">#</a></h3>
    <div class="pair shots">${shot("mockup", s.mockup, s)}${shot("before", s.before, s)}${shot("after", s.after, s)}</div>
    ${s.revision || s.sources?.length ? `<p class="sub"><span class="mono">${esc(s.revision ?? "")}</span>${s.sources?.length ? ` (${srcHtml(s.sources, review, t)})` : ""}</p>` : ""}
    ${s.mockup?.data && s.after?.data ? `<div class="group act"><button type="button" data-overlay aria-pressed="false">${esc(t("overlay"))}</button>`
      + `<label class="group sub" for="blend-${index + 1}">${esc(t("result"))} <input type="range" id="blend-${index + 1}" data-blend min="0" max="100" value="50"></label></div>` : ""}
    ${s.differences.length ? `<ul class="plain">${s.differences.map((d) => `<li>${prose(d.what)}${d.why ? ` <span class="sub">${esc(t("reason"))}: ${prose(d.why)}</span>` : ""}`
      + `${d.finding === undefined ? "" : ` <span class="tag v-remove">${esc(t("finding"))}</span> ${cite([d.finding])}`}</li>`).join("")}</ul>` : ""}
    ${s.match ? `<p><span class="tag v-keep">${esc(t("matches"))}</span></p>` : ""}
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
    tried.map((s) => `<tr data-where="${esc(`${t("scenarios")} ${s.id}`)}"><td class="n">${esc(s.id)}</td><td>${prose(s.change)}${s.requirements.length ? ` <span class="sub">(${esc(t("requirement").toLowerCase())} ${s.requirements.map((id) => `<a href="#requirement-${esc(id)}">R${esc(id)}</a>`).join(", ")})</span>` : ""}</td>`
      + `${side(s.now)}${side(s.target)}<td class="n">${cite(s.findings)}</td></tr>`))}
</section>`;
}

// First fragments own the header and comment; continuations stay in diff order.
// Files remain closed disclosures for no-script readers and are materialized lazily at runtime.
function map(review, files, model, t, hl, partCount) {
  const { blocks, owner } = model;
  const finding = (id) => review.findings.find((f) => f.id === id);
  const qtext = (n) => review.questions[n - 1]?.text ?? "";
  const pr = review.passport?.links?.find((l) => l.kind === "pr");
  const metaTitle = (b) => [b.does, b.serves.length ? `${t("serves")} ${b.serves.map((id) => `R${id}`).join(", ")}` : t("serves-nothing"), b.unit ? `${t("in-unit")} ${b.unit}` : "", `${t("lines").toLowerCase()}: ${b.where}`].filter(Boolean).join(" · ");
  const segbar = (b) => {
    const fq = [...b.findings.map((id) => `<a href="#f${esc(id)}" title="${esc(finding(id)?.title ?? "")}">F${esc(id)}</a>`),
      ...b.questions.map((n) => `<a href="#q${n}" title="${esc(qtext(n))}">Q${n}</a>`)].join("");
    const srcBits = [];
    if (b.added.length && review.passport) srcBits.push(`+ ${b.path}:${b.added[0]} · ${t("seg.revision")} ${review.passport.head}`);
    if (b.removed.length && review.passport) srcBits.push(`− ${b.path}:${b.removed[0]} · ${t("seg.revision")} ${review.passport.base}`);
    const srcTitle = (srcBits.join(" ; ") || `${b.path} · ${t("seg.no-line")}`) + (pr ? ` · ${t("seg.source-open")}` : "");
    const src = pr ? `<a class="src" href="${esc(pr.url)}" target="_blank" rel="noopener" title="${esc(srcTitle)}" aria-label="${esc(t("seg.source"))} B${b.id}: ${esc(srcTitle)}">↗</a>` : "";
    return `<div class="segbar" title="${esc(metaTitle(b))}"><span class="dot" aria-hidden="true"></span><a class="bnum mono" href="#b${b.id}" title="${esc(t("seg.permalink", b.id))}">B${b.id}</a>`
      + `<span class="does" data-ann-field="summary">${b.does ? prose(b.does) : ""}</span>`
      + `<span class="tag v-${b.verdict}">${esc(t(`verdict.${b.verdict}`))}</span><span class="links">${fq}</span>${src}`
      + `<button type="button" class="act" data-segpop="${b.id}" aria-label="${esc(t("seg.popover-open", b.id))}" aria-haspopup="dialog">ⓘ</button></div>`;
  };
  const segmeta = (b) => `<details class="segmeta"><summary>${esc(t("seg.comment-details"))}</summary><div class="segmeta-body">
      <p class="sub">${b.serves.length ? `${esc(t("serves"))} ${b.serves.map((id) => `R${esc(id)}`).join(", ")}` : esc(t("serves-nothing"))}${b.unit ? ` · ${esc(t("in-unit"))} <span class="mono">${esc(b.unit)}</span>` : ""} · <span class="mono">${esc(b.where)}</span></p>
      ${b.questions.length ? `<p class="sub">${esc(t("questions"))}: ${b.questions.map((n) => `<a href="#q${n}">Q${n}</a>`).join(", ")}</p>` : ""}
      <div class="block-comment act" data-blockcomment="b${b.id}"><label class="sub" for="note-b${b.id}">${esc(t("note-block"))}: B${b.id}</label>
      <input class="act" type="text" id="note-b${b.id}" data-note="b${b.id}" placeholder="${esc(t("note-block"))}" aria-label="${esc(t("note-block"))}: B${b.id}"></div>
    </div></details>`;
  const code = (path, run, title, fragment) => `<pre${fragment ? ` data-fragment="${fragment}"` : ""}${title ? ` title="${esc(title)}"` : ""}><code>${run.map((l) => `<span class="l ${l.kind}"><b class="old">${l.kind === "add" ? "" : l.old}</b><b class="new">${l.kind === "del" ? "" : l.new}</b><i>${{ add: "+", del: "−", ctx: " " }[l.kind]}</i>${hl(l, path)}</span>`).join("")}</code></pre>`;
  const segment = (path, run) => {
    if (run.block === undefined) return run.lines.length ? `<div class="seg">${code(path, run.lines)}</div>` : "";
    const b = blocks[run.block], continued = partCount[b.id];
    partCount[b.id] = (continued || 0) + 1;
    const range = ["old", "new"].map((side) => {
      const ns = run.lines.filter((l) => l.kind !== (side === "old" ? "add" : "del")).map((l) => l[side]);
      return ns.length ? `${side === "old" ? "−" : "+"}${ns[0]}–${ns.at(-1)}` : "";
    }).filter(Boolean).join(" / ");
    return `<div class="seg v-${b.verdict}" data-block="${b.id}" data-verdict="${b.verdict}" data-serves="${b.serves.join(" ")}" data-q="${b.questions.join(" ")}" data-f="${b.findings.join(" ")}" data-purpose="${esc(model.purpose.block[b.id])}"${continued ? "" : ` id="b${b.id}"`}>`
      + (continued ? `<div class="sub"><a href="#b${b.id}">B${b.id} · ${esc(t("continued"))}</a> · ${esc(t("lines"))}: ${range}</div>` : segbar(b) + b.findings.map((id) => { const f = finding(id); return f ? `<p class="sub"><a href="#f${esc(id)}">F${esc(id)} · ${esc(f.title)}</a> — ${prose(f.fix)}</p>` : ""; }).join("") + segmeta(b))
      + `${code(path, run.lines, b.does, b.id)}</div>`;
  };
  const file = ({ path, hunks }, idx) => {
    const parts = [];
    hunks.forEach((hunk, at) => {
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
      for (const r of runs) parts.push({ ...r, gap: at > 0 && r === runs[0] });
    });
    const own = blocks.filter((b) => b.path === path);
    const cat = model.purpose.file[path];
    const adds = own.reduce((sum, b) => sum + b.weightLines.added, 0), rems = own.reduce((sum, b) => sum + b.weightLines.removed, 0);
    const inner = `<div class="file" data-purpose="${esc(cat)}"><header><strong class="mono" title="${esc(path)}">${esc(path)}</strong><span class="sub req-count" title="${esc(t("map.lines-sum"))}">+${adds}/−${rems} · ${esc(t("blocks").toLowerCase())}: ${own.length}</span><span class="tag v-open">${esc(t(`purpose.${cat}`))}</span><span class="reveal-note sub">${esc(t("tree.reveal-note"))}</span></header>${parts.map((r) => (r.gap ? '<div class="gap">⋯</div>' : "") + segment(path, r)).join("")}</div>`;
    return `<div class="file-lazy" data-file="${idx}" id="file-${idx}"><details class="file-details"><summary class="mono" title="${esc(path)}">${esc(model.files[idx].short)} <span class="sub">· ${own.length} ${esc(t("blocks").toLowerCase())} · ${sizeOf(own)} ${esc(t("lines").toLowerCase())}</span></summary>${inner}</details></div>`;
  };
  return files.map(file).join("\n    ");
}

function treeNav(files, model, t) {
  const split = files.map((f) => f.path.split("/"));
  let common = 0;
  if (split.length > 1) { outer: for (let i = 0; i < split[0].length - 1; i++) { for (const p of split) if (p[i] !== split[0][i]) break outer; common = i + 1; } }
  const rootLabel = split[0].slice(0, common).join("/");
  const root = { dirs: new Map(), files: [] };
  files.forEach(({ path }, idx) => {
    const parts = path.split("/").slice(common), name = parts.pop();
    let at = root;
    for (const part of parts) { if (!at.dirs.has(part)) at.dirs.set(part, { dirs: new Map(), files: [] }); at = at.dirs.get(part); }
    at.files.push({ name, path, idx });
  });
  const countFiles = (node) => node.files.length + [...node.dirs.values()].reduce((sum, child) => sum + countFiles(child), 0);
  const fileRow = ({ name, path, idx }) => {
    const own = model.blocks.filter((b) => b.path === path);
    const adds = own.reduce((sum, b) => sum + b.weightLines.added, 0), rems = own.reduce((sum, b) => sum + b.weightLines.removed, 0);
    const nonkeep = own.filter((b) => b.verdict !== "keep").length;
    const mark = { A: ["+", "added"], D: ["−", "deleted"], M: ["±", "modified"] }[model.files[idx].status] ?? ["±", "modified"];
    const chars = [...name], cut = Math.ceil(chars.length / 2);
    return `<li class="frow" data-frow="${idx}" data-purpose="${esc(model.purpose.file[path])}"><span class="fs fs-${model.files[idx].status}" role="img" aria-label="${esc(t(`file.status.${mark[1]}`))}" title="${esc(t(`file.status.${mark[1]}`))}">${mark[0]}</span>`
      + `<button type="button" class="fname mono" data-fexpand="${idx}" disabled title="${esc(path)}" aria-label="${esc(path)}"><span class="fname-start">${esc(chars.slice(0, cut).join(""))}</span><span class="fname-end"><bdi dir="ltr">${esc(chars.slice(cut).join(""))}</bdi></span></button><span class="sub req-count">+${adds}/−${rems}</span>${nonkeep ? `<span class="sub req-count" title="${esc(t("map.attention", nonkeep))}">•${nonkeep}</span>` : ""}</li>`;
  };
  const dir = (name, node) => node.dirs.size === 1 && !node.files.length ? dir(`${name}/${[...node.dirs.keys()][0]}`, [...node.dirs.values()][0])
    : `<li><details class="fdir" open><summary class="mono sub" title="${esc(name)}/">${esc(name)}/ <span class="sub" data-dir-count>${esc(t("files"))}: ${countFiles(node)}</span></summary>${list(node)}</details></li>`;
  const list = (node) => `<ul>${[...node.dirs].map(([name, child]) => dir(name, child)).join("")}${node.files.map(fileRow).join("")}</ul>`;
  return `<div class="tree-nav" id="files-tree"><div class="group tree-head"><span class="label">${esc(t("tree.title"))}</span><span class="group act tree-modes" role="group" aria-label="${esc(t("tree.title"))}"><button type="button" data-tree-mode="folder" aria-pressed="true" disabled>${esc(t("tree.mode.folder"))}</button><button type="button" data-tree-mode="flat" aria-pressed="false" disabled>${esc(t("tree.mode.flat"))}</button></span><button type="button" id="tree-expand-all" disabled>${esc(t("tree.expand"))}</button><button type="button" id="tree-collapse-all" disabled>${esc(t("tree.collapse"))}</button></div>
  <div class="tree-filter act"><input type="text" id="tree-filter-input" placeholder="${esc(t("tree.filter-placeholder"))}" aria-label="${esc(t("tree.filter"))}" disabled><button type="button" id="tree-filter-clear" disabled>${esc(t("reset"))}</button><span class="sub" id="tree-filter-count" role="status"></span></div>
  ${rootLabel ? `<div class="tree-root sub mono" title="${esc(rootLabel)}">${esc(rootLabel)}/</div>` : ""}
  <div class="ftree" id="ftree-folder">${list(root)}</div></div>`;
}

function codePanel(review, files, model, t, mapHtml, partCount) {
  const nonkeep = model.blocks.filter((b) => b.verdict !== "keep").length;
  const totalParts = Object.values(partCount).reduce((sum, n) => sum + n, 0);
  const purposeBar = `<div class="purpose-bar" role="group" aria-label="${esc(t("purpose.show"))}"><span class="sub">${esc(t("purpose.show"))}:</span>${PURPOSES.map((cat) => {
    const c = model.purpose.counts[cat];
    return `<button type="button" data-purpose-filter="${cat}" aria-pressed="true" disabled${c.files ? "" : " data-purpose-empty"} title="${esc(t(`purpose.rules.${cat}`))}">${esc(t(`purpose.${cat}`))} · ${esc(t("files"))}: <b>${c.files}</b></button>`;
  }).join("")}</div>`;
  const banners = model.questions.filter((q) => q.kind === "evidence" && q.blocks >= 2).map((q) => {
    const bs = model.blocks.filter((b) => b.questions.includes(q.id));
    return `<div class="evidence-banner v-question"><p>${bs.length} ${esc(t("blocks").toLowerCase())} ${esc(t("banner.await"))} — <a href="#q${q.id}">Q${q.id} →</a></p><button type="button" data-q-filter="${q.id}" disabled>${esc(t("banner.show", q.id))}</button></div>`;
  }).join("");
  return `
<section id="files" class="stack"><h2>${esc(t("files"))} · ${model.files.length}</h2>
  <div class="code-controls">
    ${purposeBar}
    <label class="requirements-filter act" for="code-requirement">${esc(t("code.requirement"))}:
      <select id="code-requirement" disabled><option value="">${esc(t("code.all-requirements"))}</option>${model.requirements.map((r) => `<option value="${esc(r.id)}">R${esc(r.id)} — ${esc(r.text)} (${r.blocks.length})</option>`).join("")}</select>
    </label>
    <div class="map-filters">
      <span class="group act" role="group" aria-label="${esc(t("map"))}"><span class="sub">${esc(t("show"))}:</span><button type="button" data-show="attention" aria-pressed="true">${esc(t("map.attention", nonkeep))}</button><button type="button" data-show="all" aria-pressed="false">${esc(t("map.all", model.blocks.length))}</button>${VERDICTS.map((v) => `<button type="button" data-show="${v}" aria-pressed="false">${esc(t(`verdict.${v}`))}</button>`).join("")}</span>
      <button type="button" id="show-tree" hidden disabled>${esc(t("tree.show"))}</button>
      <span class="mview-toggle" role="group" aria-label="${esc(t("tab.code"))}"><button type="button" data-mview="tree" aria-pressed="false" disabled>${esc(t("mview.tree"))}</button><button type="button" data-mview="diff" aria-pressed="false" disabled>${esc(t("tab.code"))}</button></span>
      <button type="button" id="code-top" disabled>${esc(t("code.top"))}</button>
    </div>
  </div>
  <div class="code-layout" id="code-layout" data-mview="both">
    <aside class="tree-col">
      <div class="group act" role="group" aria-label="${esc(t("tree.title"))}">
        <button type="button" data-navigation-view="files" aria-pressed="true" disabled>${esc(t("code.files"))}</button>
        <button type="button" data-navigation-view="units" aria-pressed="false" title="${esc(t("code.select-requirement"))}" disabled>${esc(t("code.units"))}</button>
        <button type="button" id="hide-tree" disabled>${esc(t("tree.hide"))}</button>
      </div>
      ${treeNav(files, model, t)}<div class="unit-tree act" id="unit-tree" hidden></div>
    </aside>
    <div class="tree-resize" id="tree-resize" role="separator" aria-orientation="vertical" tabindex="0" aria-label="${esc(t("tree.resize"))}" title="${esc(t("tree.resize"))}" aria-valuemin="168" aria-valuemax="560"></div>
    <div class="diff-col">
      <div class="filter-chip" id="filter-chip" hidden><span id="filter-chip-label"></span><span class="chip-nav"><button type="button" id="filter-prev" aria-label="${esc(t("chip.prev"))}">‹</button><span class="chip-pos" id="filter-pos" role="status"></span><button type="button" id="filter-next" aria-label="${esc(t("chip.next"))}">›</button></span><button type="button" id="filter-back">${esc(t("chip.back"))}</button><button type="button" id="filter-clear">${esc(t("reset"))}</button></div>
      <p class="sub" id="code-notice" role="status"></p>
      <p id="requirement-empty" role="status"></p>
      ${banners}
      <noscript><p class="sub">${esc(t("nojs.map"))}</p></noscript>
      <div id="map" class="map" data-show="attention" style="--kept: ${esc(JSON.stringify(t("kept-by-you")))}">
        <details class="count-note"><summary>${esc(t("fragment.what"))} · ${esc(t("blocks"))}: ${model.blocks.length}</summary><p class="sub">${esc(t("map.audit-note"))} ${esc(t("fragments"))}: ${totalParts}. ${esc(t("fragment.definition"))} +${model.counters.nonblank.added}/−${model.counters.nonblank.removed}. ${esc(t("purpose.lines-note"))} ${esc(t("files.changed-only"))}</p></details>
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
    ${model.together ? `<p><strong>${esc(t("weight.together"))}</strong> (${model.together.names.map(esc).join(", ")}): ${weightOverview(model.together, t, languageOf(review)).map((row) => `<strong>${esc(t(`weight.category.${row.kind}`))}:</strong> ${esc(row.text)}`).join(" · ") || esc(t("weight.unchanged"))}</p>` : ""}${model.mechanisms.some((m) => m.weight) ? `<details class="count-note"><summary>${esc(t("weight.limit"))}</summary><p class="sub">${esc(t("weight.note"))}</p></details>` : ""}${model.mechanisms.map((m, i) => {
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
            <div class="group">${(m.blocks ?? []).map(id => `<a href="#b${id}">B${id}</a>`).join("")}</div>
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
    return items.length ? `<span class="label">${esc(coverageLabel(kind, t))}</span><div class="stack">${items.map((c) => `<p>${prose(c.text)}${c.revision ? ` <span class="sub mono">@ ${esc(c.revision)}</span>` : ""}${c.sources?.length ? ` <span class="sub">(${srcHtml(c.sources, review, t)})</span>` : ""}</p>`).join("")}</div>` : "";
  }).join("")}</div>` : "";
  const prosePart = `<p>${prose(review.coverage || t("none"))}</p>`;
  return `
<section id="coverage" class="stack"><h2>${esc(t("coverage"))}</h2>
  ${grid}
  ${cs?.length ? `<details><summary class="sub">${esc(t("coverage"))}: ${esc(t("as-written"))}</summary>${prosePart}</details>` : prosePart}
</section>`;
}

function decisionIntro(review, t) {
  return `<div class="decision-intro">
  <p>${esc(t("decision.intro-work"))} <a href="#summary">${esc(t("summary"))} →</a></p>
  ${!review.questions.some((q) => !q.parent && (q.kind === "fact" || q.kind === "evidence")) ? (review.coverageStructured ?? []).filter((c) => c.kind === "not_checked").map((c) => `<p class="card-limit">${esc(t("decision.limit-unverified"))} ${esc(c.text)}</p>`).join("") : ""}
</div>`;
}

export function page(review, files, model, { syntax } = {}) {
  const t = labelsOf(review);
  // The render-time Shiki syntax when the caller built it; the built-in pattern highlighter otherwise.
  const hl = syntax ? (l) => syntax.line(l) : (l, path) => highlight(l.text, path);
  // An idea is decided like a finding, under an id of its own, and reported apart from them.
  const ideas = (review.ideas ?? []).map((idea, index) => ({ ...idea, id: `i${index + 1}` }));
  // The map is built first: it records each block's part count, which the banners, the chip and the cards read.
  const partCount = Object.create(null);
  const mapHtml = map(review, files, model, t, hl, partCount);
  const sheet = decisionSheet(review, model, t, ideas, partCount);
  const pr = review.passport?.links?.find((l) => l.kind === "pr");
  const data = { annotationDocument: "0".repeat(64), annotationRecord: annotationRecordDigest(review, files), title: review.title, range: review.range, key: model.key,
    digest: { record: model.recordSha ?? model.key, diff: review.diff?.sha256 ?? "" },
    findings: review.findings.map(({ id, title }) => ({ id, title })),
    questions: model.questions.map(({ id, kind, resolver, parent, children, variants, text, blocks, zones }) => ({ id, kind, resolver, parent, children, text, blocks, variants: (variants ?? []).map(({ id, text }) => ({ id, text })), zones: (zones ?? []).map((z) => z.text) })),
    ideas: ideas.map(({ id, title }) => ({ id, title })),
    blocks: model.blocks.map((b) => ({ id: b.id, path: b.path, where: b.where, verdict: b.verdict, serves: b.serves, questions: b.questions, unit: b.unit, findings: b.findings,
      does: b.does, size: b.size, purpose: model.purpose.block[b.id], firstAdd: b.added[0] ?? null, firstDel: b.removed[0] ?? null, parts: partCount[b.id] ?? 1 })),
    blockFile: model.blockFile, files: files.map((f) => f.path),
    purposeLabels: Object.fromEntries(PURPOSES.map((p) => [p, t(`purpose.${p}`)])),
    pr: { url: pr?.url ?? null, label: pr?.label ?? "", base: review.passport?.base ?? "", head: review.passport?.head ?? "" },
    labels: { title: t("out.title"), open: t("out.open"), copied: t("copied"), clearConfirm: t("clear-confirm"),
      accepted: t("decision.accepted"), deferred: t("decision.deferred"), notApplicable: t("decision.not-applicable"),
      requiresContent: t("decision.requires-content"), deferReason: t("decision.defer-reason"),
      tabRemaining: t("tab.remaining", "{n}"), countAnswers: t("choice.count.answers", "{n}"), countEntries: t("choice.count.entries", "{n}"), copyText: t("export.copy-text"), copyFailed: t("copy.failed"),
      countDecisions: t("choice.count.decisions", "{n}"), countFindings: t("choice.count.findings", "{n}"), countDeferred: t("choice.count.deferred", "{n}"), dependent: t("choice.dependent", "{n}"), unanswered: t("choice.unanswered", "{n}"), waitingParent: t("choice.waiting-parent", "{n}"), filterEditing: t("choice.filter-editing"), dependsOn: t("question.parent"), selectionWaiting: t("decision.selection-waiting", "{n}"),
      theme: { current: t("theme.current"), next: t("theme.next"), auto: t("theme.auto"), light: t("theme.light"), dark: t("theme.dark") },
      status: { open: t("decision.status.open"), decided: t("decision.status.decided", "{n}"), draft: t("decision.status.draft", "{n}") },
      answerStatus: Object.fromEntries(["entered", "waiting-parent", "not-applicable"].map((s) => [s, t("answer.status." + s, "{n}")])),
      answered: t("decision.answered"), fixApply: t("decision.fix-apply"), fixSkip: t("decision.fix-skip"), ideaApply: t("decision.idea-apply"), ideaSkip: t("decision.idea-skip"),
      selectedNoVariant: t("decision.selected-no-variant"), draftSuffix: t("decision.draft-suffix", "{n}"), draftRow: t("decision.draft-row", "{n}"), answerRow: t("decision.answer-row", "{n}"),
      zoneMarked: t("decision.zone-marked"),
      draftDeferred: t("decision.draft-local", "{n}"),
      gatePending: t("decision.gate-pending", "{n}"), gateNa: t("decision.gate-na", "{n}"), gateDraft: t("decision.gate-draft-local", "{n}"),
      children: t("decision.children"), childrenWait: t("decision.children.wait"), childrenOpen: t("decision.children.open", "{n}"), childrenNa: t("decision.children.na"),
      cardComment: t("card.comment"), cardCommentN: t("card.comment-n", "{n}"), commentEdit: t("annotation.edit"),
      segCommentDetails: t("seg.comment-details"), segCommentDetailsN: t("seg.comment-details-n", "{n}"), whereEmpty: t("card.no-blocks"),
      export: { accepted: t("export.accepted"), deferred: t("export.deferred"), answers: t("export.answers"), zones: t("export.zones"), comments: t("export.comments"),
        emptyAccepted: t("export.empty-accepted"), emptyDeferred: t("export.empty-deferred"), emptyComments: t("export.empty-comments"),
        partial: t("export.partial"), goto: t("export.goto"), passageContext: t("out.passage-context"), openFindings: t("export.open-findings"), openDecisions: t("export.open-decisions"), openDependent: t("export.open-dependent"), openRequests: t("export.open-requests"),
        versionRecord: review.passport ? t("passport.record") : "record_sha256", versionDiff: review.passport ? t("passport.diffSha") : "diff_sha256" },
      verdict: Object.fromEntries(VERDICTS.map((v) => [v, t(`verdict.${v}`)])),
      findings: t("findings"), questions: t("questions"), serves: t("serves"), servesNothing: t("serves-nothing"), inUnit: t("in-unit"),
      source: t("seg.source"), addedLine: t("seg.added-line"), removedLine: t("seg.removed-line"), revision: t("seg.revision"),
      copySource: t("seg.copy-source"), copySourcePlain: t("seg.copy-source-plain"), noLine: t("seg.no-line"), keptNoDoes: t("seg.kept-no-does"),
      noteBlock: t("note-block"), close: t("viewer.close"),
      chip: { requirement: t("chip.requirement", "{n}"), finding: t("chip.finding", "{n}"), purpose: t("chip.purpose", "{n}"), hidden: t("chip.hidden", "{n}") },
      code: { selectRequirement: t("code.select-requirement"), noRelated: t("code.no-related"), noVisible: t("code.no-visible"), noUnit: t("code.no-unit"), linked: t("code.linked"), visible: t("code.visible"), filtersCleared: t("code.filters-cleared") },
      blocksWord: t("blocks"), fragments: t("fragments"), withParts: t("chip.with-parts"), files: t("files"), treeFiles: t("tree.files"), treeVisibleFiles: t("tree.visible-files") },
    annotationLabels: { ...Object.fromEntries(["annotation", "edit", "source", "added", "deleted", "restored", "report", "unverified"].map(k => [k, t(`annotation.${k}`)])), unlocated: t("annotation.unverified") } };
  const drawn = structure(model, t);
  const hasPictures = model.screens.some((s) => ["mockup", "before", "after"].some((shot) => s[shot]?.data));
  const D = decisionRuntime(), cfStatic = D.choiceStats(model.questions, D.empty(), review.findings, ideas);
  const tabs = [
    ["overview", t("tab.overview"), ""],
    ["decisions", t("tab.decisions"), `<span class="tab-count" id="count-decisions" role="img" title="${esc(t("nojs.counter-title"))}" aria-label="${esc(t("tab.remaining", cfStatic.remaining))}">${cfStatic.remaining}</span>`],
    ["code", t("tab.code"), `<span class="tab-count">${files.length}</span>`],
    ["checks", t("tab.checks"), ""],
    ["materials", t("tab.materials"), ""],
  ];
  const tablist = tabs.map(([id, label, count]) => `<a role="tab" id="tab-${id}" data-tab="${id}" href="#panel-${id}" aria-controls="panel-${id}" aria-selected="${id === "decisions"}"${id !== "decisions" ? ' tabindex="-1"' : ""}>${esc(label)}${count}</a>`).join("");
  const panel = (id, content) => `<section class="panel" id="panel-${id}" data-panel="${id}" role="tabpanel" aria-labelledby="tab-${id}" tabindex="-1">${content}</section>`;
  const subtabs = `<nav class="choice-filters act" role="group" aria-label="${esc(t("choice.filters"))}">${[["all", t("choice.filter.all")], ["q", t("choice.filter.q")], ["f", t("choice.filter.f")], ["i", t("choice.filter.i")], ["fact", t("choice.filter.fact")], ["deferred", t("choice.filter.deferred")], ["done", t("choice.filter.done")]]
    .map(([value, label]) => {
      const badge = value === "all" ? "" : `<span class="cf-count" data-cf-count="${value}" data-zero="${cfStatic[value] ? 0 : 1}">${cfStatic[value]}</span>`;
      const wording = value === "fact" ? "choice.count.answers" : value === "deferred" ? "choice.count.deferred" : ["i", "done"].includes(value) ? "choice.count.entries" : value === "q" ? "choice.count.decisions" : "choice.count.findings";
      const aria = value === "all" ? "" : ` aria-label="${esc(label)}: ${esc(t(wording, cfStatic[value]))}"`;
      return `<button type="button" data-choice-filter="${value}" data-cf-label="${esc(label)}" aria-pressed="${value === "all"}"${aria} disabled>${esc(label)}${badge}</button>`;
    }).join("")}</nav>`;
  const htmlLanguage = Intl.getCanonicalLocales(review.language ?? "en")[0];
  const html = `<!doctype html>
<html lang="${esc(htmlLanguage)}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t("kind"))}: ${esc(review.title)}</title>
<style>${STYLE}</style>
<a class="skip-link" href="#questions">${esc(t("skip-to-decisions"))}</a>
<div class="wrap" id="review-content" tabindex="-1">
<header class="page-head"><div class="stack"><span class="label">${esc(t("kind"))}</span><h1>${esc(review.title)}</h1></div><button type="button" id="export-open" class="act" disabled>${esc(t("export.open"))}</button><button type="button" id="theme-toggle" class="theme-btn act" aria-label="${esc(t("theme.toggle"))}" title="${esc(t("theme.toggle"))}"></button></header>
<p id="storage-status" role="status" aria-live="polite" hidden>${esc(t("storage.failed"))}</p>
<div class="bar global-nav"><nav class="tabs" role="tablist" aria-label="${esc(t("tablist"))}">${tablist}</nav></div>
<noscript><p class="sub">${esc(t("nojs.note"))}</p></noscript>
${panel("overview", `
${passport(review, model, t)}
${summary(review, model, t)}
${drawn}
${scenarios(model, t)}
${tradeoffs(review, t)}
${mechanisms(review, model, t)}
`)}
${panel("decisions", `
${decisionIntro(review, t)}
${subtabs}
${sheet}
`)}
${panel("code", codePanel(review, files, model, t, mapHtml, partCount))}
${panel("checks", `
${requirements(model, t)}
${checks(review, t)}
${challenges(review, t)}
`)}
${panel("materials", `
${screens(review, model, t)}
${coverage(review, t)}
<section id="decisions" class="stack act" tabindex="-1"><h2>${esc(t("decisions"))}</h2>
  <p class="sub">${esc(t("decisions-note"))}</p>
  <div class="export-json"><button type="button" id="print-owner">${esc(t("print.owner"))}</button><button type="button" id="print-audit">${esc(t("print.auditor"))}</button><button type="button" id="clear">${esc(t("clear-all"))}</button></div>
  <p class="sub">${esc(t("print.omissions"))}</p>
  <h3 class="label">${esc(t("passages"))}</h3>
  <div id="passages" class="stack"></div></section>
`)}
<footer class="sub"><a href="#passport">${esc(t("report-details"))} →</a></footer>
</div>
<div class="group annotation-feedback"><span id="annotation-status" role="status" aria-live="polite"></span><button id="annotation-undo" type="button" hidden>${esc(t("annotation.undo"))}</button><button id="annotation-dismiss" type="button" aria-label="${esc(t("annotation.dismiss"))}">×</button></div>
<div id="seg-popover" role="dialog" aria-label="${esc(t("seg.popover"))}" hidden></div>
<dialog id="export-dialog" aria-label="${esc(t("export.open"))}">
  <h2>${esc(t("export.open"))}</h2>
  <p class="sub">${esc(t("export.storage-explanation"))}</p>
  ${model.questions.length ? `<details><summary>${esc(t("decision.export-note"))}</summary><p class="sub">${esc(t("decision.export-local-method"))}</p></details>` : ""}
  <div id="export-preview" tabindex="-1" aria-label="${esc(t("export.open"))}"></div>
  <div class="group"><button type="button" id="export-json-top" title="${esc(t("export.download"))}: decisions-${esc(model.key)}.json">${esc(t("export.download"))}</button><button type="button" id="copy-top">${esc(t("export.copy-text"))}</button><form method="dialog"><button type="submit">${esc(t("viewer.close"))}</button></form></div>
  <p id="export-status" role="status"></p>
  <label for="out">${esc(t("export.text"))}</label><textarea id="out" readonly rows="12"></textarea>
</dialog>
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
  <p class="sub">${esc(t("annotation.proof-note"))}</p>
  <p data-annotation-warning role="status" hidden>${esc(t("annotation.unverified"))}</p>
  <textarea aria-label="${esc(t("note-passage"))}" rows="4"></textarea>
  <div class="group"><button type="button" data-annotation-action="save">${esc(t("annotation.save"))}</button><button type="button" data-annotation-action="cancel">${esc(t("annotation.cancel"))}</button><button type="button" data-annotation-action="delete">${esc(t("remove"))}</button></div>
</dialog>
<button type="button" id="comment" class="floating" aria-keyshortcuts="Alt+Shift+M" title="Alt+Shift+M">${esc(t("comment"))}</button>
<script id="data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<script>${SCRIPT}</script>
`;
  return sealAnnotationDocument(html);
}
