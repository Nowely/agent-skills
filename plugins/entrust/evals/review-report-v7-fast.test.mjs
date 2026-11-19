import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import vm from "node:vm";
import { LABELS, CATALOGS, labelFaults, labelsOf, requiredKeys } from "../plugin/skills/review/scripts/labels.mjs";
import { decisionRuntime } from "../plugin/skills/review/scripts/decisions.mjs";
import { page } from "../plugin/skills/review/scripts/page.mjs";
import { check, modelOf } from "../plugin/skills/review/scripts/review.mjs";
import { parseDiff } from "../plugin/skills/review/scripts/diff.mjs";
import { hostileFixture } from "./review/report-fixtures.mjs";
import { claimsHtml, commonClaimSources, sourceOf, srcHtml } from "../plugin/skills/review/scripts/sources.mjs";

const source = fs.readFileSync(new URL("../plugin/skills/review/scripts/page.mjs", import.meta.url), "utf8");
const part = (start, end) => {
  const i = source.indexOf(start), j = source.indexOf(end, i);
  assert.ok(i >= 0 && j > i, `missing runtime section ${start}`);
  return source.slice(i, j).replaceAll("\\\\", "\\");
};

test("claim sources merge only exact nonempty ordered arrays within one list", () => {
  const review = { language: "en", questions: [{ text: "self" }, { text: "other" }] }, t = labelsOf(review);
  const sources = [{ ref: "/questions/0" }, { at: 'path<&"', revision: "r1", quote: 'quote<&"', extra: { detail: 1 } }, { ref: "/questions/1" }];
  const list = [{ text: "First <claim>", sources }, { text: "Second `code`", sources: structuredClone(sources) }];
  const before = JSON.stringify(list), html = claimsHtml(list, review, t, 1);
  assert.equal(JSON.stringify(list), before);
  assert.equal((html.match(/Sources for each item/g) || []).length, 1);
  assert.equal((html.match(/path&lt;&amp;&quot;/g) || []).length, 1);
  assert.match(html, /First &lt;claim&gt;/);
  assert.match(html, /Second <code>code<\/code>/);
  for (const name of ["claims.0.text", "claims.1.text", "claims.sources"]) assert.ok(html.includes(`data-ann-field="${name}"`), name);
  assert.match(html, /Reference to this question in the report: <a href="#q1">Q1<\/a>/);
  assert.match(html, /Report reference: <a href="#q2">Q2<\/a>/);
  assert.match(html, /Quote provided: path&lt;&amp;&quot; @ r1 “quote&lt;&amp;&quot;”/);
  assert.equal(sourceOf({ at: "coverage" }, review).anchor, undefined);
  assert.match(srcHtml([{ at: "coverage" }], review, t, 1), /Mention without a quote: coverage/);

  const changed = [
    [{ ref: "/questions/1" }, sources[1], sources[2]],
    [sources[0], { ...sources[1], revision: "r2" }, sources[2]],
    [sources[0], { ...sources[1], quote: "other" }, sources[2]],
    [sources[0], { ...sources[1], extra: { detail: 2 } }, sources[2]],
    [sources[2], sources[1], sources[0]],
    [sources[0], { quote: sources[1].quote, at: sources[1].at, revision: "r1", extra: { detail: 1 } }, sources[2]],
    [],
  ];
  for (const different of changed) {
    const claims = [list[0], { text: "Second", sources: different }];
    assert.equal(commonClaimSources(claims), null);
    const individual = claimsHtml(claims, review, t, 1);
    assert.doesNotMatch(individual, /Sources for each item/);
    assert.match(individual, /First &lt;claim&gt;<\/span> <span class="sub"/);
    if (different.length) assert.match(individual, /Second<\/span> <span class="sub"/);
    else assert.match(individual, /Second<\/span><\/li>/);
  }
  assert.equal(commonClaimSources([{ text: "only", sources }]), null);
  assert.equal(commonClaimSources([{ sources: [] }, { sources: [] }]), null);
  assert.equal(commonClaimSources([{ sources: [null] }, { sources: [null] }]), null);
});

test("claim-source label is required only when a rendered claim list actually shares sources", () => {
  const sources = [{ at: "where", quote: "quote" }], same = [{ text: "a", sources }, { text: "b", sources: structuredClone(sources) }];
  const review = { language: "custom", questions: [{ kind: "decision", context: same, variants: [{ id: "x", consequences: same }] }] };
  assert.ok(requiredKeys(review).includes("source.each"));
  const catalog = Object.fromEntries(requiredKeys(review).map((key) => [key, LABELS[key]]));
  delete catalog["source.each"];
  assert.match(labelFaults({ ...review, labels: catalog }).join("\n"), /source\.each/);
  assert.deepEqual(labelFaults({ ...review, labels: { ...catalog, "source.each": "Each claim" } }), []);
  assert.equal(labelsOf({ language: "en" })("source.each"), "Sources for each item");
  assert.equal(labelsOf({ language: "ru" })("source.each"), "Источники каждого пункта");
  const separate = { questions: [{ kind: "decision", context: [same[0]], variants: [{ consequences: [same[1]] }] }] };
  assert.ok(!requiredKeys(separate).includes("source.each"));
  assert.ok(!requiredKeys({ questions: [{ context: same }] }).includes("source.each"));
  const reordered = { questions: [{ kind: "decision", context: [{ sources }, { sources: [{ at: "where", quote: "different" }] }] }] };
  assert.ok(!requiredKeys(reordered).includes("source.each"));
  const cyclic = {}; cyclic.self = cyclic;
  assert.equal(commonClaimSources([{ sources: [cyclic] }, { sources: [cyclic] }]), null);
});

test("standalone no-JS report groups each claim list separately without changing its record", () => {
  const { diff, record } = hostileFixture(), files = parseDiff(diff);
  const sources = [{ ref: "/questions/0" }, { at: "where<&", revision: "r<&", quote: "quoted<&" }];
  const claim = (text) => ({ text, sources: structuredClone(sources) });
  record.language = "ru"; record.labels = {};
  record.questions = [{ kind: "decision", resolver: "owner", at: "a:1", text: "Question",
    context: [claim("Context one"), claim("Context two")],
    variants: [{ id: "x", text: "First", consequences: [claim("Consequence one"), claim("Consequence two")] },
      { id: "y", text: "Second", consequences: [claim("Other variant")] }],
    recommendation: { text: "Recommendation", variant: "x", sources: structuredClone(sources) } }];
  const before = JSON.stringify(record), { errors, owner } = check(record, files, ".");
  assert.deepEqual(errors, []);
  const html = page(record, files, modelOf(record, files, owner, "."));
  assert.equal(JSON.stringify(record), before);
  assert.equal((html.match(/Источники каждого пункта/g) || []).length, 2);
  assert.equal((html.match(/where&lt;&amp;/g) || []).length, 4);
  for (const value of ["Context one", "Context two", "Consequence one", "Consequence two", "Other variant", "Recommendation"]) assert.ok(html.includes(value), value);
  for (const name of ["context.0.text", "context.1.text", "context.sources", "variant.0.consequences.0.text", "variant.0.consequences.sources"])
    assert.ok(html.includes(`data-ann-field="${name}"`), name);
  assert.ok(html.includes("<noscript>"));
  assert.ok(html.includes('id="q1"'));
  assert.doesNotMatch(html, /<script[^>]+src=|<link\b|@import/);
  assert.match(html, /Ссылка на этот вопрос внутри отчёта: <a href="#q1">Q1<\/a>/);
});

test("annotation document digest seals the static HTML and full underlying record", () => {
  const { diff, record } = hostileFixture(), files = parseDiff(diff);
  record.language = "en"; record.labels = {};
  const sources = [{ at: "a", quote: "source" }];
  record.questions = [{ kind: "decision", at: "a:1", text: "Question",
    context: [{ text: "failure", sources, extra: "first" }, { text: "failure", sources, extra: "second" }],
    variants: [{ id: "x", text: "X" }] }];
  const draw = () => { const { errors, owner } = check(record, files, "."); assert.deepEqual(errors, []); return page(record, files, modelOf(record, files, owner, ".")); };
  const before = JSON.stringify(record), first = draw(), again = draw();
  assert.equal(first, again); assert.equal(JSON.stringify(record), before);
  const data = JSON.parse(first.match(/<script id="data" type="application\/json">(.*?)<\/script>/s)[1]);
  assert.match(data.annotationDocument, /^[a-f0-9]{64}$/); assert.match(data.annotationRecord, /^[a-f0-9]{64}$/);
  const canonical = first.replace(`"annotationDocument":"${data.annotationDocument}"`, `"annotationDocument":"${"0".repeat(64)}"`);
  assert.equal(createHash("sha256").update(canonical).digest("hex"), data.annotationDocument);
  assert.notEqual(createHash("sha256").update(canonical.replace("<title>", "<title> ")).digest("hex"), data.annotationDocument);
  record.questions[0].context.reverse();
  const changed = draw(), dataChanged = JSON.parse(changed.match(/<script id="data" type="application\/json">(.*?)<\/script>/s)[1]);
  assert.notEqual(dataChanged.annotationRecord, data.annotationRecord);
  assert.notEqual(dataChanged.annotationDocument, data.annotationDocument);
});

test("failed browser storage warns only for unsaved answers and recovers after a successful write", () => {
  let fail = true, stored, unload;
  const status = { hidden: true };
  const sandbox = {
    D: decisionRuntime(), data: { questions: [] }, key: "review",
    localStorage: { getItem: () => null, setItem: (_key, value) => { if (fail) throw new Error("blocked"); stored = value; } },
    document: { getElementById: () => status },
    window: { addEventListener: (_name, handler) => { unload = handler; } },
  };
  const runtime = part("  let raw = {};", '  document.documentElement.classList.add("js")');
  const api = vm.runInNewContext(runtime + "\n({ save, state })", sandbox);
  api.save();
  assert.equal(status.hidden, true);
  api.state.notes.q1 = "reason";
  api.save();
  assert.equal(status.hidden, false);
  const event = { preventDefault() { this.prevented = true; } };
  unload(event);
  assert.equal(event.prevented, true);
  delete api.state.notes.q1;
  api.save();
  assert.equal(status.hidden, true);
  api.state.notes.q1 = "reason";
  api.save();
  fail = false;
  api.save();
  assert.equal(status.hidden, true);
  assert.equal(JSON.parse(stored).notes.q1, "reason");
  const safeEvent = { preventDefault() { this.prevented = true; } };
  unload(safeEvent);
  assert.equal(safeEvent.prevented, undefined);
});

test("the page stores decisions under the export's format number and the record key", () => {
  const { diff, record } = hostileFixture(), files = parseDiff(diff), { errors, owner } = check(record, files, ".");
  assert.deepEqual(errors, []);
  const html = page(record, files, modelOf(record, files, owner, "."));
  const data = JSON.parse(html.match(/<script id="data" type="application\/json">(.*?)<\/script>/s)[1]);
  const script = html.slice(html.lastIndexOf("<script>"));
  const runtime = script.slice(script.indexOf("  const data ="), script.indexOf('  document.documentElement.classList.add("js")'));
  const read = [], written = [];
  const api = vm.runInNewContext(runtime + "\n({ D, key, save, state })", {
    document: { getElementById: (id) => id === "data" ? { textContent: JSON.stringify(data) } : { hidden: true } },
    localStorage: { getItem: (key) => { read.push(key); return null; }, setItem: (key) => { written.push(key); } },
    window: { addEventListener() {} } });
  api.save();
  const { schema } = decisionRuntime();
  assert.equal(api.key, "review-report:" + schema + ":" + data.key);
  assert.deepEqual(read, [api.key]); assert.deepEqual(written, [api.key]);
  assert.equal(api.D.exportOf(data.questions, api.state, {}).schema_version, schema);
});

test("failed storage keeps annotation proof and original fields in memory and JSON", () => {
  let unload;
  const D = decisionRuntime(), status = { hidden: true }, sandbox = {
    D, data: { questions: [] }, key: "review", document: { getElementById: () => status },
    localStorage: { getItem: () => null, setItem: () => { throw Error("blocked"); } },
    window: { addEventListener: (_, handler) => { unload = handler; } },
  };
  const api = vm.runInNewContext(part("  let raw = {};", '  document.documentElement.classList.add("js")') + "\n({ save, state })", sandbox);
  const passage = { quote: "😀c", note: "keep", where: "B1",
    proof: { kind: "field", document: "a".repeat(64), record: "b".repeat(64), object: "b1", field: "line.add..17", structure: "snapshot", start: 1, end: 4, text: "😀c" } };
  api.state.passages.push(passage); api.save();
  const event = { preventDefault() { this.prevented = true; } }; unload(event);
  assert.equal(status.hidden, false); assert.equal(event.prevented, true);
  assert.equal(JSON.stringify(D.exportOf([], api.state, {}).passages), JSON.stringify([passage]));
});

test("annotation draft warns on changed text only, including failed persistence after save", () => {
  let blocked = false, unload;
  const storageStatus = { hidden: true }, pageSandbox = {
    D: decisionRuntime(), data: { questions: [] }, key: "review",
    localStorage: { getItem: () => null, setItem: () => { if (blocked) throw Error("blocked"); } },
    document: { getElementById: () => storageStatus }, window: { addEventListener: (_, fn) => { unload = fn; } },
  };
  const pageAPI = vm.runInNewContext(part("  let raw = {};", '  document.documentElement.classList.add("js")') +
    "\n({ state: () => state, save, setAnnotationUI: (ui) => { annotationUI = ui; } })", pageSandbox);
  const field = { value: "", focus() {} }, handlers = {};
  const editor = { open: false, style: {}, offsetWidth: 10, offsetHeight: 10,
    close() { this.open = false; }, show() { this.open = true; },
    querySelector: () => ({ hidden: false }), addEventListener: (event, fn) => { handlers[event] = fn; } };
  const fallback = { isConnected: false, getBoundingClientRect: () => ({ left: 0, bottom: 0 }) };
  const sandbox = { field, editor, warning: {}, quote: {}, trigger: { classList: { remove() {} }, ...fallback }, document: { getElementById: () => fallback },
    window: { addEventListener() {} }, innerWidth: 100, innerHeight: 100, locate: () => null, retryRefresh() {},
    state: pageAPI.state, changed: pageAPI.save, render() {}, announce() {}, t: {} };
  const src = fs.readFileSync(new URL("../plugin/skills/review/scripts/annotations.mjs", import.meta.url), "utf8");
  const slice = (a, b) => src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
  const api = vm.runInNewContext("let draft = null, returnTo = null;\n" + slice("  function close()", "  const located") +
    slice("  editor.addEventListener('click'", "  editor.addEventListener('keydown'") + "\n({ open, hasDraftChanges })", sandbox);
  pageAPI.setAnnotationUI(api);
  const warn = () => { const e = { preventDefault() { this.prevented = true; } }; unload(e); return !!e.prevented; };
  const click = (action) => handlers.click({ target: { closest: () => ({ dataset: { annotationAction: action } }) } });
  const p = { quote: "selected", note: "", where: "Q1" };
  api.open(p); assert.equal(warn(), false); assert.equal(sandbox.warning.hidden, false);
  field.value = "draft"; assert.equal(warn(), true);
  field.value = ""; assert.equal(warn(), false);
  field.value = "discard"; click("cancel"); assert.equal(warn(), false);
  api.open(p); field.value = "saved"; click("save"); assert.equal(warn(), false);
  assert.equal(pageAPI.state().passages[0].note, "saved");
  api.open(pageAPI.state().passages[0], 0); field.value = "edited"; assert.equal(warn(), true);
  field.value = "saved"; assert.equal(warn(), false);
  field.value = "cancel me"; click("cancel"); assert.equal(warn(), false);
  blocked = true; api.open(pageAPI.state().passages[0], 0); field.value = "unsaved"; click("save");
  assert.equal(pageAPI.state().passages[0].note, "unsaved");
  assert.equal(storageStatus.hidden, false); assert.equal(warn(), true);
});

test("dependent decision counts and nested settlement follow exported statuses", () => {
  const D = decisionRuntime(), state = D.empty();
  const questions = [
    { id: 1, kind: "decision", variants: [{ id: "yes" }, { id: "no" }] },
    { id: 2, kind: "decision", parent: { question: 1, variants: ["yes"] }, variants: [{ id: "yes" }] },
    { id: 3, kind: "decision", parent: { question: 2, variants: ["yes"] }, variants: [{ id: "yes" }] },
  ];
  state.questions[1] = { choice: "accepted", variant: "yes" };
  state.questions[2] = { choice: "accepted", variant: "yes" };
  let stats = D.choiceStats(questions, state, []);
  assert.equal(stats.remaining, 0);
  assert.equal(stats.dependent, 1);
  assert.equal(stats.settled.q1, undefined);
  assert.equal(D.exportOf(questions, state, {}).questions[2].status, "remaining");
  state.questions[3] = { choice: "deferred" };
  state.notes.q3 = "later";
  stats = D.choiceStats(questions, state, []);
  assert.equal(stats.dependent, 0);
  assert.equal(stats.settled.q1, undefined);
  assert.equal(D.exportOf(questions, state, {}).questions[2].status, "deferred");
  state.questions[3] = { choice: "accepted", variant: "yes" };
  assert.equal(D.choiceStats(questions, state, []).settled.q1, "done");
  state.questions[1] = { choice: "accepted", variant: "no" };
  assert.equal(D.choiceStats(questions, state, []).dependent, 0);
  assert.equal(D.exportOf(questions, state, {}).questions[2].status, "not-applicable");
});

test("waitingForParent excludes retained answers after the parent is reset", () => {
  const D = decisionRuntime(), state = D.empty(), qs = [
    { id: 1, kind: "decision", variants: [{ id: "yes" }] },
    { id: 2, kind: "decision", parent: { question: 1, variants: ["yes"] }, variants: [{ id: "pick", text: "Pick" }] },
    { id: 3, kind: "fact", parent: { question: 1, variants: ["yes"] } },
    { id: 4, kind: "evidence", parent: { question: 1, variants: ["yes"] } },
    { id: 5, kind: "decision", parent: { question: 1, variants: ["yes"] } },
  ];
  state.questions[1] = { choice: "accepted", variant: "yes" };
  state.questions[2] = { choice: "accepted", variant: "pick" };
  state.questions[5] = { choice: "deferred" };
  state.notes.q5 = "later";
  state.answers.q3 = "owner input";
  delete state.questions[1];
  const settled = D.settle(qs, state), out = D.exportOf(qs, settled, {});
  assert.deepEqual(out.waitingForParent, [{ question: 4, parent: 1, kind: "evidence" }]);
  assert.equal(out.waitingForParent.length, D.choiceStats(qs, settled, []).waiting);
  assert.equal(out.questions.find((q) => q.question === 2).status, "accepted");
  assert.equal(out.questions.find((q) => q.question === 5).status, "deferred");
  assert.equal(out.factAnswers.q3, "owner input");
});

test("accepted child exports its unresolved parent without becoming unanswered", () => {
  const D = decisionRuntime(), state = D.empty(), questions = [
    { id: 1, kind: "decision", text: "Parent", variants: [{ id: "yes", text: "Yes" }] },
    { id: 2, kind: "decision", text: "Child", parent: { question: 1, variants: ["yes"] }, variants: [{ id: "x", text: "X" }] },
  ];
  state.questions[1] = { choice: "accepted", variant: "yes" };
  state.questions[2] = { choice: "accepted", variant: "x" };
  assert.equal(D.exportOf(questions, state, {}).questions[1].waiting_parent, undefined);
  delete state.questions[1];
  const settled = D.settle(questions, state), payload = D.exportOf(questions, settled, {});
  const child = payload.questions.find((e) => e.question === 2);
  assert.equal(child.status, "accepted"); assert.equal(child.variant.id, "x"); assert.equal(child.waiting_parent, 1);
  assert.equal(JSON.parse(JSON.stringify(payload)).questions.find((e) => e.question === 2).waiting_parent, 1);
  assert.deepEqual(payload.waitingForParent, []); assert.equal(D.choiceStats(questions, settled, []).waiting, 0);
  const t = { status: { decided: "Selected {n}" }, selectionWaiting: "Selection recorded; waiting for Q{n}.",
    draftSuffix: "draft {n}", tabRemaining: "{n} main", title: "Review", dependsOn: "Depends on",
    export: { accepted: "Accepted", deferred: "Deferred", answers: "Answers", zones: "Zones", comments: "Comments",
      openFindings: "open", openDecisions: "open", openDependent: "dependent", openRequests: "requests", versionRecord: "record", versionDiff: "diff" } };
  const sandbox = { D, state: settled, qById: { 1: questions[0], 2: questions[1] }, blockById: {},
    data: { questions, findings: [], ideas: [], title: "T", range: "R", key: "K", digest: { record: "sha", diff: "sha" } },
    t, exportPayload: () => payload, annotationUI: { located: () => false }, stats: () => D.choiceStats(questions, settled, []) };
  const api = vm.runInNewContext(part("  function exportModel()", "  function buildPreview()") + "\n({ exportModel, decisionsText })", sandbox);
  assert.match(api.exportModel().accepted[0].text, /Selected X.*waiting for Q1/);
  assert.match(api.decisionsText(), /Selected X.*waiting for Q1/);
  const element = (tag) => ({ tag, children: [], dataset: {}, text: "",
    set textContent(value) { this.text = value; this.children = []; },
    get textContent() { return this.text + this.children.map((c) => c.textContent).join(""); },
    append(...children) { this.children.push(...children); } });
  const host = element("div");
  const preview = vm.runInNewContext(part("  function buildPreview()", "  function openExportDialog()") + "\nbuildPreview",
    { exportModel: api.exportModel, document: { getElementById: () => host, createElement: element }, t: { export: {
      ...t.export, emptyAccepted: "", emptyDeferred: "", emptyComments: "", goto: "Go", partial: "partial" } } });
  preview(); assert.match(host.textContent, /Selected X.*waiting for Q1/);
  assert.equal(D.entryOf(settled, 2).choice, "accepted");
  for (const language of ["en", "ru"]) assert.ok(labelsOf({ language })("decision.selection-waiting", 1).includes("Q1"));
  const custom = { language: "custom", questions };
  const catalog = Object.fromEntries(requiredKeys(custom).map((key) => [key, LABELS[key]]));
  delete catalog["decision.selection-waiting"];
  assert.match(labelFaults({ ...custom, labels: catalog }).join("\n"), /decision\.selection-waiting/);
});

test("retired decisions export separately from deferred decisions", () => {
  const D = decisionRuntime(), state = D.empty(), questions = [
    { id: 1, kind: "decision", variants: [{ id: "yes", text: "Yes" }, { id: "no", text: "No" }] },
    { id: 2, kind: "decision", parent: { question: 1, variants: ["yes"] }, variants: [{ id: "x", text: "X" }] },
  ];
  state.questions[1] = { choice: "accepted", variant: "no" };
  state.questions[2] = { variant: "x" };
  const payload = D.exportOf(questions, state, {});
  const t = { status: { decided: "Selected {n}" }, notApplicable: "Not applicable", draftSuffix: "draft {n}",
    tabRemaining: "{n} main", export: { openFindings: "open", notApplicable: "Retired decisions" } };
  const sandbox = { D, state, qById: { 1: questions[0], 2: questions[1] }, blockById: {},
    data: { questions, findings: [], ideas: [], digest: { record: "r", diff: "d" } }, t, exportPayload: () => payload,
    annotationUI: { located: () => false }, stats: () => D.choiceStats(questions, state, []) };
  const api = vm.runInNewContext(part("  function exportModel()", "  function buildPreview()") + "\n({ exportModel, text: decisionsText() })", sandbox);
  const model = api.exportModel();
  assert.equal(payload.questions[1].status, "not-applicable");
  assert.equal(model.deferred.length, 0);
  assert.equal(model.notApplicable.length, 1);
  assert.match(model.notApplicable[0].text, /Q2 · Not applicable \(Q1\).*draft X/);
  assert.equal(model.notApplicable[0].hash, "#q2");
  assert.match(api.text, /\nRetired decisions\n- Q2 · Not applicable \(Q1\)/);
  // The preview names the section with the same heading, not with the status word.
  const element = (tag) => ({ tag, children: [], dataset: {}, text: "",
    set textContent(value) { this.text = value; this.children = []; },
    get textContent() { return this.text + this.children.map((c) => c.textContent).join(""); },
    append(...children) { this.children.push(...children); } });
  const host = element("div");
  vm.runInNewContext(part("  function buildPreview()", "  function openExportDialog()") + "\nbuildPreview()",
    { exportModel: api.exportModel, document: { getElementById: () => host, createElement: element }, t: { export: {
      ...t.export, emptyAccepted: "", emptyDeferred: "", emptyComments: "", goto: "Go", partial: "partial" } } });
  const headings = host.children.map((section) => section.children.find((c) => c.tag === "h3")?.textContent);
  assert.ok(headings.includes("Retired decisions"), headings.join(" | "));
});

test("export preview refresh retains focus inside a stable container without suppressing updates", () => {
  let focused = null, updates = 0, focusCalls = 0;
  const element = (tag) => ({ tag, children: [], dataset: {}, text: "",
    set textContent(value) { this.text = value; this.children = []; if (this === host && focused?.inPreview) focused = null; },
    get textContent() { return this.text + this.children.map((c) => c.textContent).join(""); },
    append(...children) { this.children.push(...children); } });
  const host = element("div");
  host.contains = (el) => el === host || !!el?.inPreview;
  host.focus = (opts) => { assert.equal(opts.preventScroll, true); focusCalls++; focused = host; };
  const model = () => ({ accepted: [{ text: "version " + ++updates, hash: "#q1" }], deferred: [], notApplicable: [], comments: [], answers: [], zones: [],
    openDecisions: [], openDependent: [], openRequests: [], remaining: "remaining" });
  const document = { get activeElement() { return focused; }, getElementById: () => host, createElement: element };
  const t = { export: { accepted: "accepted", deferred: "deferred", comments: "comments", emptyAccepted: "", emptyDeferred: "", emptyComments: "", goto: "Go", partial: "partial" } };
  const build = vm.runInNewContext(part("  function buildPreview()", "  function openExportDialog()") + "\nbuildPreview", { document, exportModel: model, t });
  focused = { inPreview: true }; build(); assert.equal(focused, host); assert.match(host.textContent, /version 1/);
  focused = { inPreview: false }; build(); assert.equal(focusCalls, 1); assert.match(host.textContent, /version 2/);
});

test("focused semantic status survives filtering until blur and moves only afterwards", () => {
  const D = decisionRuntime(), state = D.empty(), qs = [{ id: 1, kind: "decision", variants: [{ id: "yes", text: "Yes" }] }];
  const otherUnit = {}, field = { value: "", closest: (selector) => selector === ".dunit, .settled-row" ? unit : card };
  const otherField = { closest: (selector) => selector === ".dunit, .settled-row" ? otherUnit : null };
  const bodyFocus = { closest: () => null };
  const card = { id: "q1", dataset: { qid: "1" }, hidden: false, classList: { contains: (x) => x === "qcard" },
    querySelector: (s) => s === ".card-title" ? { textContent: "Question" } : { textContent: "Status" } };
  const summary = { textContent: "", append() {} }, row = { dataset: {}, contains: (el) => el === field,
    querySelector: () => summary, append(n) { if (n === unit) unit.parentElement = row; }, remove() { unit.parentElement = home; } };
  const home = { insertBefore(u) { u.parentElement = home; } }, body = { append(r) { unit.parentElement = r; } };
  let note = null;
  const unit = { dataset: { settled: "done" }, parentElement: row, hidden: false,
    closest: () => unit.parentElement === row ? row : null, contains: (el) => el === field,
    querySelector: (s) => s === ":scope > .filter-editing" ? note : card,
    querySelectorAll: (s) => s === ".qcard[data-qid]" ? [card] : [],
    prepend(el) { note = el; }, before() {} };
  const spans = [];
  const doc = { activeElement: field, getElementById: () => ({}), createElement: (tag) => tag === "details" ? row : tag === "summary" ? summary
    : spans[spans.push({ setAttribute() {}, append() {} }) - 1] };
  const sandbox = { D, state, data: { questions: qs }, qById: { 1: qs[0] }, document: doc, settledBody: body,
    unitHome: new Map([[unit, { parent: home, siblings: [unit] }]]), settledMap: {}, t: { filterEditing: "editing", status: { open: "open" }, commentEdit: "edit", cardComment: "Comment" },
    all: (s) => s === "#panel-decisions .dunit" ? [unit] : [], progOpen() {} };
  const functions = part("  function unitSettledState(unit)", "  function paintChildren()") + part("  function applyChoiceFilter(val", "  function paint()");
  const api = vm.runInNewContext(functions + "\n({ paintSettled, applyChoiceFilter })", sandbox);
  const refresh = () => { sandbox.settledMap = D.choiceStats(qs, state, []).settled; api.paintSettled(); };
  state.questions[1] = { choice: "accepted", variant: "yes" }; refresh();
  api.applyChoiceFilter("done"); assert.equal(unit.hidden, false);
  state.questions[1].choice = "deferred"; field.value = "reason"; state.notes.q1 = field.value; refresh();
  assert.equal(row.dataset.state, "deferred");
  assert.equal(unit.dataset.settled, "done");
  api.applyChoiceFilter("done"); assert.equal(unit.hidden, false); assert.equal(note.hidden, false);
  assert.equal(D.choiceStats(qs, state, []).done, 0);
  assert.equal(D.exportOf(qs, state, {}).questions[0].status, "deferred");
  api.applyChoiceFilter("deferred"); assert.equal(unit.hidden, false);
  doc.activeElement = otherField; refresh();
  assert.equal(unit.dataset.settled, "done", "focus in another card also postpones the move");
  doc.activeElement = bodyFocus; refresh(); api.applyChoiceFilter("deferred");
  assert.equal(unit.dataset.settled, "deferred"); assert.equal(note.hidden, true);
  // A deferred row shows the card's own status, not a second one.
  assert.equal(spans.filter((span) => span.className === "sr-answer").at(-1).textContent, "Status");
  const savedDeferred = D.normalize(JSON.parse(JSON.stringify(state)));
  assert.equal(D.exportOf(qs, savedDeferred, {}).questions[0].status, "deferred");
  doc.activeElement = field; state.questions[1].choice = "accepted"; refresh(); api.applyChoiceFilter("done");
  assert.equal(unit.dataset.settled, "deferred"); assert.equal(row.dataset.state, "done"); assert.equal(unit.hidden, false);
  doc.activeElement = bodyFocus; refresh(); assert.equal(unit.dataset.settled, "done");
  doc.activeElement = field; state.questions[1].choice = "deferred"; refresh(); api.applyChoiceFilter("deferred");
  delete state.notes.q1; field.value = ""; refresh(); api.applyChoiceFilter("deferred");
  assert.equal(unit.hidden, false); assert.equal(doc.activeElement, field); assert.equal(field.value, "");
  assert.equal(D.exportOf(qs, state, {}).questions[0].status, "remaining");
  api.applyChoiceFilter("deferred", false); assert.equal(unit.hidden, true);
  api.applyChoiceFilter("deferred");
  doc.activeElement = bodyFocus; refresh(); api.applyChoiceFilter("deferred");
  assert.equal(unit.hidden, true); assert.equal(unit.parentElement, home); assert.equal(unit.dataset.settled, undefined);
  const reloaded = D.normalize(JSON.parse(JSON.stringify(state)));
  assert.equal(D.exportOf(qs, reloaded, {}).questions[0].status, "remaining");
  state.notes.q1 = "again"; sandbox.settledMap = D.choiceStats(qs, state, []).settled;
  assert.equal(sandbox.settledMap.q1, "deferred");
  state.questions[1].choice = "accepted"; refresh();
  assert.equal(D.exportOf(qs, state, {}).questions[0].status, "accepted");
  assert.equal(unit.dataset.settled, "done"); assert.equal(unit.parentElement, row);
});

test("fact and deferred filters retain a matching child with its parent context", () => {
  const D = decisionRuntime(), state = D.empty();
  const questions = [
    { id: 1, kind: "decision", variants: [{ id: "yes" }] },
    { id: 2, kind: "fact", parent: { question: 1, variants: ["yes"] } },
    { id: 3, kind: "evidence", parent: { question: 1, variants: ["yes"] } },
    { id: 4, kind: "decision", parent: { question: 1, variants: ["yes"] } },
  ];
  const byId = Object.fromEntries(questions.map((q) => [String(q.id), q]));
  const cards = questions.map((q) => ({ dataset: { qid: String(q.id) }, hidden: false, classList: { contains: (s) => s === "qcard" } }));
  const details = { hidden: false, open: false, querySelectorAll: () => cards.slice(1) };
  const unit = { dataset: {}, hidden: false, querySelector: (s) => s === ":scope > .filter-editing" ? null : cards[0],
    contains: () => false, closest: () => null,
    querySelectorAll: (s) => s === ".qcard[data-qid]" ? cards : s === ".qchildren" ? [details] : [] };
  const sandbox = { D, state, data: { questions }, qById: byId, document: { activeElement: null }, t: {}, unitSettledState: () => null,
    all: (s) => s === "#panel-decisions .dunit" ? [unit] : [], progOpen: (d) => { d.open = true; } };
  const apply = vm.runInNewContext(part("  function applyChoiceFilter(val", "  function paint()") + "\napplyChoiceFilter", sandbox);
  let stats = D.choiceStats(questions, state, []);
  assert.equal(stats.fact, 2);
  assert.equal(stats.waiting, 3);
  assert.deepEqual(D.exportOf(questions, state, {}).waitingForParent.map((w) => w.question), [2, 3, 4]);
  apply("fact");
  assert.equal(unit.hidden, false);
  assert.deepEqual(cards.map((c) => c.hidden), [false, false, false, true]);
  assert.equal(details.open, true);
  state.questions[1] = { choice: "accepted", variant: "yes" };
  state.questions[4] = { choice: "deferred" };
  state.notes.q4 = "later";
  stats = D.choiceStats(questions, state, []);
  assert.equal(stats.deferred, 1);
  assert.equal(D.exportOf(questions, state, {}).questions.find((q) => q.question === 4).status, "deferred");
  apply("deferred");
  assert.equal(unit.hidden, false);
  assert.deepEqual(cards.map((c) => c.hidden), [false, true, true, false]);
  assert.equal(D.waitingParent(questions[1], state, questions), null);
  state.questions[1] = { choice: "deferred" }; state.notes.q1 = "later";
  assert.equal(D.waitingParent(questions[1], state, questions), null);
});

test("tree intersects requirement and block purposes, retaining empty files by file purpose", () => {
  const rows = ["production", "docs", "production"].map((purpose, i) => ({
    dataset: { frow: String(i), purpose }, style: {},
    querySelector: () => ({ title: ["mixed.js", "empty.md", "hidden.js"][i], textContent: "" })
  }));
  const data = {
    files: ["mixed.js", "empty.md", "hidden.js"],
    blocks: [{ id: 1, purpose: "tests", serves: [1] }, { id: 2, purpose: "production", serves: [1] }],
    blockFile: { 1: 0, 2: 2 }
  };
  const sandbox = {
    data, map: { dataset: {} }, hidden: ["production"], treeInput: { value: "" }, treeCount: {}, treeClear: {},
    t: { files: "Files" }, document: {}, paintTreeName() {}, hiddenPurposes() { return sandbox.hidden; },
    all(selector) { return selector === ".frow" ? rows : []; },
    filesMatching(pred) { return new Set(data.blocks.filter(pred).map((b) => String(data.blockFile[b.id]))); }
  };
  vm.runInNewContext(part("  function applyTreeFilter()", '  treeInput.addEventListener("input"'), sandbox);
  const visible = () => rows.map((r) => r.style.display !== "none");
  sandbox.applyTreeFilter();
  assert.deepEqual(visible(), [true, true, false]);
  sandbox.map.dataset.req = "1";
  sandbox.applyTreeFilter();
  assert.deepEqual(visible(), [true, false, false]);
  delete sandbox.map.dataset.req;
  sandbox.hidden = [];
  sandbox.applyTreeFilter();
  assert.deepEqual(visible(), [true, true, true]);
});

test("tree keeps both filename ends and full accessible paths, and marks a match across the split", () => {
  const names = ["very-long-shared-component-filename-alpha.test.ts", "very-long-shared-component-filename-bravo.test.ts"];
  const files = names.map((name) => ({ path: "src/components/" + name }));
  const model = { files: files.map(() => ({ status: "M" })), blocks: [], purpose: { file: Object.fromEntries(files.map((f) => [f.path, "production"])) } };
  const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const start = source.indexOf("function treeNav("), end = source.indexOf("\nfunction codePanel(", start);
  const treeNav = vm.runInNewContext(source.slice(start, end) + "\ntreeNav", { esc });
  const html = treeNav(files, model, (key) => key);
  const buttons = [...html.matchAll(/<button type="button" class="fname mono"[^>]*>.*?<\/button>/g)].map((m) => m[0]);
  assert.equal(buttons.length, 2);
  for (let i = 0; i < buttons.length; i++) {
    assert.ok(buttons[i].includes(`title="${files[i].path}"`));
    assert.ok(buttons[i].includes(`aria-label="${files[i].path}"`));
    assert.match(buttons[i], /class="fname-start">very-long/);
    assert.match(buttons[i], new RegExp(`class="fname-end"><bdi dir="ltr">[^<]*${i ? "bravo" : "alpha"}\\.test\\.ts`));
    assert.ok(!buttons[i].includes("\n"));
  }
  assert.match(source, /\.frow \.fname \{[^}]*white-space: nowrap/);
  assert.match(source, /\.fname-start \{[^}]*text-overflow: ellipsis/);
  assert.match(source, /\.fname-end \{[^}]*direction: rtl/);
  function node() {
    let value = "";
    return { children: [], set textContent(v) { value = v; this.children = []; }, get textContent() { return this.children.length ? this.children.map((x) => x.textContent).join("") : value; },
      append(...items) { this.children.push(...items); } };
  }
  const spans = { ".fname-start": node(), ".fname-end bdi": node() };
  const document = { createTextNode(text) { const n = node(); n.textContent = text; return n; }, createElement() { const n = node(); n.mark = true; return n; } };
  const paint = vm.runInNewContext(part("  function paintTreeName(", "  function applyTreeFilter()") + "\npaintTreeName", { document });
  const name = names[0], cut = Math.ceil([...name].length / 2), query = name.slice(cut - 2, cut + 3);
  paint({ querySelector: (s) => spans[s] }, name, query);
  assert.equal(spans[".fname-start"].textContent + spans[".fname-end bdi"].textContent, name);
  assert.ok(spans[".fname-start"].children.some((n) => n.mark));
  assert.ok(spans[".fname-end bdi"].children.some((n) => n.mark));
});

test("v8 custom catalogs require exactly the applicable new source and export labels", () => {
  const review = { language: "zz", questions: [
    { kind: "decision", context: [{ sources: [{ ref: "/questions/0" }, { ref: "/questions/1" }, { at: "coverage" }, { at: "external", quote: "text" }] }] },
    { kind: "decision", parent: { question: 1, variants: ["yes"] } },
    { kind: "evidence" },
  ] };
  const fresh = ["storage.failed", "annotation.added", "choice.count.deferred", "choice.waiting-parent", "choice.count.decisions", "choice.count.findings", "choice.dependent", "choice.unanswered", "tree.visible-files",
    "export.open-decisions", "export.open-dependent", "export.not-applicable", "export.open-requests", "source.internal", "source.self", "source.quoted", "source.mention"];
  const catalog = Object.fromEntries(requiredKeys(review).map((k) => [k, `«${LABELS[k]}»`]));
  for (const key of requiredKeys(review)) {
    const incomplete = { ...catalog };
    delete incomplete[key];
    assert.match(labelFaults({ ...review, labels: incomplete }).join("\n"), new RegExp(`missing: ${key.replaceAll(".", "\\.")}(?:,|$)`), key);
  }
  const lacking = { ...catalog };
  for (const key of fresh) delete lacking[key];
  const faults = labelFaults({ ...review, labels: lacking });
  assert.equal(faults.length, 1);
  for (const key of fresh) assert.ok(faults[0].includes(key), key);
  assert.deepEqual(labelFaults({ ...review, labels: catalog }), []);
  for (const language of ["en", "ru"]) assert.deepEqual(labelFaults({ ...review, language }), []);
  const minimal = requiredKeys({ language: "zz", questions: [] });
  for (const key of ["source.internal", "source.self", "source.quoted", "source.mention", "export.open-decisions", "export.open-dependent", "export.not-applicable", "export.open-requests"])
    assert.ok(!minimal.includes(key), key);
  const selfOnly = requiredKeys({ questions: [{ kind: "decision", context: [{ sources: [{ ref: "/questions/0" }] }] }] });
  assert.ok(selfOnly.includes("source.self"));
  for (const key of ["source.internal", "source.quoted", "source.mention"]) assert.ok(!selfOnly.includes(key), key);
});

test("annotation proof binds exact fields across reload and fails closed on collisions or mutation", () => {
  const src = fs.readFileSync(new URL("../plugin/skills/review/scripts/annotations.mjs", import.meta.url), "utf8");
  class Element {
    constructor(tag, attrs = {}, ...children) {
      this.nodeType = 1; this.localName = tag; this.attrs = attrs; this.id = attrs.id || "";
      this.style = {};
      this.classList = { contains: (name) => (this.attrs.class || "").split(" ").includes(name) };
      this.dataset = { qid: attrs["data-qid"], qwhere: attrs["data-qwhere"], built: attrs["data-built"], block: attrs["data-block"], anchor: attrs["data-anchor"], where: attrs["data-where"] };
      this.childNodes = children; for (const child of children) child.parentElement = this;
    }
    matches(selector) {
      return selector.split(",").some((raw) => {
        const s = raw.trim(), classes = (this.attrs.class || "").split(" ");
        if (s === ".qcard[id]") return classes.includes("qcard") && !!this.id;
        if (s === "article.finding[id]") return this.localName === "article" && classes.includes("finding") && !!this.id;
        if (s === ".seg[id][data-block]") return classes.includes("seg") && !!this.id && this.dataset.block !== undefined;
        if (s === ".qwhere[data-qwhere]") return classes.includes("qwhere") && this.dataset.qwhere !== undefined;
        if (s === "article.finding:not(.idea):not(.mechanism)") return this.localName === "article" && classes.includes("finding") && !classes.includes("idea") && !classes.includes("mechanism");
        if (s === "[data-ann-field]") return this.attrs["data-ann-field"] !== undefined;
        if (s === "[data-anchor]") return this.attrs["data-anchor"] !== undefined;
        if (s === "mark[data-annotation]") return this.localName === "mark" && this.attrs["data-annotation"] !== undefined;
        const mark = /^mark\[data-annotation="(\d+)"\]$/.exec(s);
        if (mark) return this.localName === "mark" && String(this.attrs["data-annotation"]) === mark[1];
        if (s === ".l > b" || s === ".l > i") return this.parentElement?.matches(".l") && this.localName === s.at(-1);
        if (s.startsWith(".")) return classes.includes(s.slice(1));
        if (s.startsWith("#")) return this.id === s.slice(1);
        if (s.startsWith("[")) return this.attrs[s.slice(1, -1)] !== undefined;
        return this.localName === s;
      });
    }
    closest(selector) { for (let n = this; n; n = n.parentElement) if (n.matches(selector)) return n; return null; }
    checkVisibility() { return true; }
    get textContent() { return this.childNodes.map((child) => child.nodeType === 3 ? child.data : child.textContent).join(""); }
    contains(node) { for (let n = node; n; n = n.parentElement) if (n === this) return true; return false; }
    getAttribute(name) { return this.attrs[name] ?? null; }
    get attributes() { return Object.entries(this.attrs).map(([name, value]) => ({ name, value })); }
    setAttribute(name, value) { this.attrs[name] = value; }
    remove() { this.isConnected = false; if (this.parentElement) this.parentElement.childNodes = this.parentElement.childNodes.filter((n) => n !== this); }
    querySelectorAll(selector) {
      const out = [];
      const visit = (node) => { for (const child of node.childNodes || []) if (child.nodeType === 1) { if (selector === "[id]" ? !!child.id : child.matches(selector)) out.push(child); visit(child); } };
      visit(this); return out;
    }
    querySelector(selector) {
      if (selector === ".qwhere-body") return this.querySelectorAll(selector)[0] || null;
      if (selector === ":scope > b.old" || selector === ":scope > b.new")
        return this.childNodes.find((child) => child.localName === "b" && child.classList.contains(selector.endsWith("old") ? "old" : "new")) || null;
      return null;
    }
  }
  const text = (data) => ({ nodeType: 3, data, get length() { return this.data.length; } });
  const field = (name, ...children) => new Element("span", { "data-ann-field": name }, ...children);
  const question = () => new Element("div", { id: "q1", class: "qcard", "data-qid": "1", "data-anchor": "", "data-where": "Q1" },
    field("context.0.text", text("fai"), text("lure 😀")), field("context.0.sources", text("source one")),
    field("context.1.text", text("failure 😀")), field("context.1.sources", text("source two")),
    field("large", text("x".repeat(100000))));
  const block = () => new Element("div", { id: "b1", class: "seg", "data-block": "1", "data-anchor": "", "data-where": "B1" },
    new Element("span", { class: "l add" }, new Element("b", { class: "old" }), new Element("b", { class: "new" }, text("17")),
      new Element("i", {}, text("+")), text("α😀"), text("code")));
  const finding = () => new Element("article", { id: "f7", class: "finding", "data-anchor": "", "data-where": "F7" },
    field("what", text("finding text")));
  const template = new Element("template"); template.content = new Element("fragment", {}, block());
  let root = new Element("main", { id: "review-content" }, question(), finding(), template), selected;
  const leaves = (el) => { const out = []; const visit = (node) => { if (node.nodeType === 3) out.push(node); else for (const child of node.childNodes || []) visit(child); }; visit(el); return out; };
  const identity = { document: "a".repeat(64), record: "b".repeat(64) };
  const document = {
    getElementById: (id) => [root, ...root.querySelectorAll("[id]")].find((el) => el.id === id) || null,
    querySelectorAll: () => [root, ...root.querySelectorAll("[id]")],
    createTreeWalker: (el, _kind, filter) => { const list = leaves(el).filter((n) => filter.acceptNode(n) === 1); let i = 0; return { nextNode() { this.currentNode = list[i++] || null; return this.currentNode; } }; },
  };
  const selection = (a, ao, b, bo, quote) => {
    const all = leaves(root), lo = all.indexOf(a), hi = all.indexOf(b);
    const range = { startContainer: a, startOffset: ao, endContainer: b, endOffset: bo,
      intersectsNode: (n) => all.indexOf(n) >= lo && all.indexOf(n) <= hi, comparePoint: () => 0, getBoundingClientRect: () => ({}) };
    selected = { rangeCount: 1, isCollapsed: false, getRangeAt: () => range, toString: () => quote };
  };
  const start = src.indexOf("  const nodes ="), end = src.indexOf("  function close()", start);
  const sandbox = { get root() { return root; }, document, identity, getSelection: () => selected,
    sha256: value => createHash("sha256").update(value).digest("hex"),
    NodeFilter: { SHOW_TEXT: 4, FILTER_REJECT: 2, FILTER_ACCEPT: 1 }, t: { report: "Report" } };
  const api = vm.runInNewContext(src.slice(start, end) + "\n({ capture, locate, nodes, rememberWhere, ownerSignature, fieldBinding, offsets, ownerNodes })", sandbox);
  const original = root.childNodes[0], first = original.childNodes[0];
  selection(first.childNodes[0], 0, first.childNodes[1], 4, "failure");
  const note = api.capture();
  assert.equal(note.proof.kind, "field"); assert.equal(note.proof.version, undefined);
  assert.ok(Buffer.byteLength(JSON.stringify(note.proof), "utf8") < 1024, "short field proof must not contain the owner's 100k structure");
  assert.equal(note.proof.object, "q1"); assert.equal(note.proof.field, "context.0.text");
  assert.equal(note.proof.text, "failure");
  assert.equal(api.locate(note).parts.map(({ node, start, end }) => node.data.slice(start, end)).join(""), "failure");
  const oldFieldProof = { ...note.proof, kind: undefined, version: 1, structure: api.fieldBinding(original, note.proof.field, note.proof.start, note.proof.end, note.proof.text) };
  assert.equal(api.locate({ ...note, proof: oldFieldProof }), null);
  assert.equal(api.locate({ ...note, proof: { ...note.proof, field: "context.1.text" } }), null);
  const saved = JSON.stringify(note);
  const unproved = { quote: "failure", where: "Q1", note: "kept" };
  assert.equal(api.locate(unproved), null);
  const state = decisionRuntime().empty(); state.passages.push(unproved);
  assert.equal(JSON.stringify(decisionRuntime().exportOf([], state, {}).passages), JSON.stringify([unproved]));
  root = new Element("main", { id: "review-content" }, new Element("div", { class: "settled-row" }, question()));
  assert.ok(api.locate(note)); assert.equal(JSON.stringify(note), saved);
  const markedField = root.childNodes[0].childNodes[0].childNodes[0], marker = new Element("button", { class: "annotation-marker" });
  marker.isConnected = true;
  markedField.childNodes = [new Element("mark", { "data-annotation": "0" }, text("fai")),
    new Element("mark", { "data-annotation": "0" }, text("lure"), marker), text(" 😀")];
  for (const child of markedField.childNodes) child.parentElement = markedField;
  assert.ok(api.locate(note));
  let observe, updates = 0;
  const back = { replaceWith(el) { this.replacement = el; } };
  const row = { querySelector: (s) => s === "[data-annotation-source]" ? back : null };
  const controlStart = src.indexOf("  const located ="), controlEnd = src.indexOf("  function goTo(", controlStart);
  const control = vm.runInNewContext(src.slice(controlStart, controlEnd) + "\n({ installed, located, invalidated })", {
    get root() { return root; }, document: { ...document, activeElement: null, createElement: () => ({}) },
    state: () => ({ passages: [note] }), locate: api.locate, nodes: api.nodes, list: { children: [row] },
    t: { unverified: "unlocated" }, locationsChanged: () => { updates++; },
    MutationObserver: class { constructor(fn) { observe = fn; } observe() {} },
  });
  control.located.set(0, marker);
  assert.equal(control.installed(0), true);
  const liveOwner = root.childNodes[0].childNodes[0];
  root.childNodes = [liveOwner]; liveOwner.parentElement = root;
  observe(); assert.equal(control.installed(0), true); assert.equal(updates, 0);
  const originalMarks = markedField.childNodes;
  markedField.childNodes = [text("f"), new Element("mark", { "data-annotation": "0" }, text("ailure"), marker), text(" 😀")];
  for (const child of markedField.childNodes) child.parentElement = markedField;
  assert.ok(api.locate(note)); assert.equal(control.installed(0), false);
  markedField.childNodes = originalMarks; marker.parentElement = originalMarks[1];
  liveOwner.childNodes[3].childNodes[0].data = "mutated source";
  assert.equal(control.installed(0), false);
  observe();
  assert.equal(marker.isConnected, false); assert.equal(control.invalidated.has(0), true);
  assert.equal(back.replacement.textContent, "unlocated"); assert.equal(updates, 1);
  assert.equal(markedField.childNodes[0].attrs.role, "presentation");
  assert.equal(markedField.childNodes[0].style.background, "transparent");
  root = new Element("main", { id: "review-content" }, new Element("div", { class: "settled-row" }, question()));
  const moved = root.childNodes[0].childNodes[0];
  [moved.childNodes[0], moved.childNodes[2]] = [moved.childNodes[2], moved.childNodes[0]];
  assert.equal(api.locate(note), null);
  root = new Element("main", { id: "review-content" }, question());
  root.childNodes[0].childNodes[3].childNodes[0].data = "changed source";
  assert.equal(api.locate(note), null);
  const changedText = root.childNodes[0].childNodes[0].childNodes[0];
  selection(changedText, 0, root.childNodes[0].childNodes[0].childNodes[1], 4, "failure");
  assert.equal(api.capture().proof, undefined);
  root = new Element("main", { id: "review-content" }, question(), question());
  assert.equal(api.locate(note), null);
  root = new Element("main", { id: "review-content" }, question());
  const documentIds = document.querySelectorAll;
  document.querySelectorAll = () => [...documentIds(), { id: "q1" }];
  assert.equal(api.locate(note), null); document.querySelectorAll = documentIds;
  const otherQuestion = question(); otherQuestion.id = "q2"; otherQuestion.attrs.id = "q2"; otherQuestion.dataset.qid = "2";
  root = new Element("main", { id: "review-content" }, otherQuestion);
  assert.equal(api.locate(note), null);
  assert.equal(api.locate({ ...note, proof: { ...note.proof, object: "q2" } }), null);
  root = new Element("main", { id: "review-content" }, question());
  sandbox.identity = { ...identity, document: "c".repeat(64) };
  assert.equal(api.locate(note), null);
  sandbox.identity = { ...identity, record: "d".repeat(64) };
  assert.equal(api.locate(note), null); sandbox.identity = identity;
  const q = root.childNodes[0], copy = new Element("div", { class: "qwhere" }, field("line.add..1", text("copy text")));
  copy.parentElement = q; q.childNodes.push(copy);
  const copyText = copy.childNodes[0].childNodes[0];
  selection(copyText, 0, copyText, 4, "copy");
  const unsupported = api.capture(); assert.equal(unsupported.quote, "copy"); assert.equal(unsupported.proof, undefined); assert.equal(api.locate(unsupported), null);
  const a = q.childNodes[0].childNodes[0], b = q.childNodes[2].childNodes[0];
  selection(a, 0, b, 7, "failure 😀source onefailure");
  const span = api.offsets(selected.getRangeAt(0), q, api.ownerNodes(q));
  const multi = { quote: selected.toString(), proof: { version: 4, ...identity, object: "q1", start: span.from,
    end: span.to, text: span.exact, structure: createHash("sha256").update(JSON.stringify(["q1", api.ownerSignature(q), span.from, span.to, span.exact, selected.toString()])).digest("hex") } };
  assert.equal(api.locate(multi), null);
  assert.ok(api.locate(note));
  q.childNodes.pop();
  const related = () => new Element("details", { class: "qwhere", "data-qwhere": "1" },
    new Element("div", { class: "qwhere-body", "data-built": "1" },
      new Element("div", { class: "seg", "data-block": "1" }, text("duplicate")),
      new Element("div", { class: "seg", "data-block": "1" }, text("duplicate"))));
  const where = related(); where.parentElement = q; q.childNodes.push(where); api.rememberWhere(where);
  const second = where.childNodes[0].childNodes[1].childNodes[0];
  selection(second, 0, second, 9, "duplicate");
  const whereNote = api.capture();
  assert.equal(whereNote.proof.kind, "related-code"); assert.equal(whereNote.proof.version, undefined);
  assert.equal(api.locate(whereNote).parts[0].node, second);
  const oldProof = { ...whereNote.proof, kind: undefined, version: 2, text: "duplicate",
    structure: JSON.stringify([q.id, api.ownerSignature(q), api.ownerSignature(where, true),
      whereNote.proof.start, whereNote.proof.end, "duplicate"]) };
  assert.equal(api.locate({ ...whereNote, proof: oldProof }), null);
  const oldCompactProof = { ...oldProof, version: 3,
    structure: createHash("sha256").update(JSON.stringify([q.id, api.ownerSignature(q), api.ownerSignature(where, true),
      oldProof.start, oldProof.end, oldProof.text, whereNote.quote])).digest("hex") };
  assert.equal(api.locate({ ...whereNote, proof: oldCompactProof }), null);
  where.childNodes[0].childNodes[0].attrs["data-block"] = "changed";
  assert.equal(api.locate(whereNote), null);
  assert.equal(api.locate({ ...whereNote, proof: oldProof }), null);
  assert.equal(api.locate({ ...whereNote, proof: oldCompactProof }), null);
  where.childNodes[0].childNodes[0].attrs["data-block"] = "1";
  assert.ok(api.locate(whereNote));
  const clone = related(); clone.parentElement = q; q.childNodes.push(clone);
  assert.equal(api.locate(whereNote), null);
  q.childNodes.pop();
  root = new Element("main", { id: "review-content" }, question());
  const rebuilt = related(); rebuilt.parentElement = root.childNodes[0]; root.childNodes[0].childNodes.push(rebuilt);
  assert.equal(api.locate(whereNote), null);
  api.rememberWhere(rebuilt);
  assert.equal(api.locate(whereNote).parts[0].node, rebuilt.childNodes[0].childNodes[1].childNodes[0]);
  root = new Element("main", { id: "review-content" }, block());
  const line = root.childNodes[0].childNodes[0];
  selection(line.childNodes[3], 1, line.childNodes[4], 1, "😀c");
  const blockNote = api.capture();
  assert.equal(blockNote.proof.object, "b1"); assert.equal(blockNote.proof.field, "line.add..17");
  assert.equal(blockNote.proof.start, 1); assert.equal(blockNote.proof.end, 4);
  assert.ok(api.locate(blockNote));
  line.attrs.class = "l del";
  assert.equal(api.locate(blockNote), null); assert.equal(api.capture().proof, undefined);
  line.attrs.class = "l add";
  root = new Element("main", { id: "review-content" });
  assert.equal(api.locate(blockNote), null);
  root = new Element("main", { id: "review-content" }, block());
  assert.ok(api.locate(blockNote));
  root.childNodes[0].isConnected = true;
  const locations = new Map(), rows = [{ contains: () => false }, { contains: () => false }], found = [];
  const unprovedBlock = { quote: "😀c", where: "B1", note: "kept" };
  const refreshStart = src.indexOf("  const pendingRefresh ="), refreshEnd = src.indexOf("  list.addEventListener('focusout'", refreshStart);
  const refresh = vm.runInNewContext(src.slice(refreshStart, refreshEnd) + "\nrefresh", {
    state: () => ({ passages: [blockNote, unprovedBlock] }), located: locations, invalidated: new Set(), document,
    list: { children: rows }, editor: { open: false }, getSelection: () => ({ rangeCount: 0 }),
    locate: api.locate, renderOne: (_p, index) => { found.push(index); locations.set(index, { isConnected: true }); }, locationsChanged() {},
  });
  refresh([root.childNodes[0]]);
  assert.deepEqual(found, [0]);
  root = new Element("main", { id: "review-content" }, finding());
  const ftext = root.childNodes[0].childNodes[0].childNodes[0];
  selection(ftext, 0, ftext, 7, "finding");
  const findingNote = api.capture();
  assert.equal(findingNote.proof.object, "f7"); assert.equal(findingNote.proof.field, "what"); assert.ok(api.locate(findingNote));
  const gutter = new Element("b", { class: "old" }, text("17"));
  const gutterLine = new Element("span", { class: "l add", "data-ann-field": "line.add..17" }, gutter, text("code"));
  root = new Element("main", { id: "review-content" }, new Element("div", { id: "b1", class: "seg", "data-block": "1", "data-anchor": "", "data-where": "B1" }, gutterLine));
  selection(gutter.childNodes[0], 0, gutter.childNodes[0], 2, "17");
  const unmarked = api.capture();
  assert.equal(unmarked.quote, "17"); assert.equal(unmarked.proof, undefined); assert.equal(api.locate(unmarked), null);
});

test("a passage without a proof is exported unchanged, without a marker or a source action", () => {
  const src = fs.readFileSync(new URL("../plugin/skills/review/scripts/annotations.mjs", import.meta.url), "utf8");
  const start = src.indexOf("  function renderOne("), end = src.indexOf("  function render()", start);
  const created = [];
  const element = (tag) => { const node = { tag, children: [], dataset: {}, append(...xs) { this.children.push(...xs); },
    addEventListener() {}, setAttribute() {} }; created.push(node); return node; };
  const rows = [], list = { append: (row) => rows.push(row) };
  const renderOne = vm.runInNewContext(src.slice(start, end) + "\nrenderOne", {
    document: { createElement: element }, list, t: { annotation: "Comment", edit: "Edit", unverified: "unlocated" },
  });
  const p = { quote: "failure", note: "keep this", where: "Q1" };
  renderOne(p, 0, null);
  assert.equal(created.filter((el) => el.className === "annotation-marker").length, 0);
  assert.equal(created.filter((el) => el.tag === "button").length, 1);
  assert.equal(rows[0].children[3].children[1].textContent, "unlocated");
  const state = decisionRuntime().empty(); state.passages.push(p);
  assert.equal(JSON.stringify(decisionRuntime().exportOf([], state, {}).passages), JSON.stringify([p]));
});

test("lazy annotation refresh batches scopes and retries exact anchors without disturbing a selection", () => {
  const src = fs.readFileSync(new URL("../plugin/skills/review/scripts/annotations.mjs", import.meta.url), "utf8");
  const start = src.indexOf("  const pendingRefresh ="), end = src.indexOf("  list.addEventListener('focusout'", start);
  const p = { quote: "exact", proof: { kind: "field", object: "b1", start: 0, end: 5, text: "exact" } }, other = { quote: "exact", proof: { kind: "field", object: "b2", start: 0, end: 5, text: "exact" } };
  const a1 = { text: "exact", contains: () => false }, a2 = { text: "exact", contains: () => false };
  let anchors = {}, selected = true, changes = 0, renders = 0;
  const located = new Map(), scope1 = { isConnected: true, contains: (a) => a === a1 }, scope2 = { isConnected: true, contains: (a) => a === a2 };
  const row = () => ({ contains: () => false });
  const sandbox = { state: () => ({ passages: [p, other] }), located, invalidated: new Set(),
    document: { getElementById: (id) => anchors[id], activeElement: null }, list: { children: [row(), row()] }, editor: { open: false },
    getSelection: () => ({ rangeCount: 1, isCollapsed: !selected, getRangeAt: () => ({ intersectsNode: (a) => a === a1 }) }),
    locate: (item) => { const proof = item.proof, a = anchors[proof.object]; return a?.text.slice(proof.start, proof.end) === proof.text ? { el: a } : null; },
    renderOne: (_p, i) => { renders++; located.set(i, { isConnected: true }); }, locationsChanged: () => { changes++; } };
  const api = vm.runInNewContext(src.slice(start, end) + "\n({ refresh, retryRefresh })", sandbox);
  api.refresh([scope1, scope2]); assert.equal(renders, 0);
  anchors = { b1: a1, b2: a2 };
  api.refresh([scope1, scope2]); assert.equal(renders, 1); assert.equal(changes, 1);
  assert.equal(located.has(0), false);
  selected = false; api.retryRefresh();
  assert.equal(renders, 2); assert.equal(changes, 2); assert.equal(located.has(0), true);
  api.refresh([scope1, scope2]); assert.equal(renders, 2);
  const queues = [], calls = [];
  const schedule = vm.runInNewContext(part("  const inserted = new Set()", '  for (const host of all(".file-lazy")') +
    "\nannotationUI = { refresh: (scopes) => calls.push(scopes) }; refreshAnnotations",
    { state: { passages: [p] }, calls, queueMicrotask: (f) => queues.push(f) });
  schedule(scope1); schedule(scope2); schedule(scope1);
  assert.equal(queues.length, 1); queues[0]();
  assert.equal(calls.length, 1); assert.equal(calls[0].length, 2);
});

test("passage preview only offers source navigation for an installed annotation", () => {
  const passages = [
    { where: "Q1", quote: "same quote", note: "one", proof: { kind: "field", object: "q1", start: 7, end: 17, text: "same quote" } },
    { where: "Q1", quote: "same quote", note: "two", proof: { kind: "field", object: "q1", start: 0, end: 3, text: "same quote" } },
  ];
  const payload = { questions: [], findings: {}, notes: {}, passages, zones: {}, factAnswers: {}, waitingForParent: [] };
  const sandbox = { exportPayload: () => payload, annotationUI: { located: (i) => i === 0 },
    data: { questions: [], findings: [], ideas: [], annotationLabels: { unverified: "unverified" } },
    t: { export: { passageContext: "Selected", openFindings: "findings" }, tabRemaining: "{n} remaining" },
    qById: {}, blockById: {}, D: {}, state: {}, stats: () => ({ remaining: 0 }) };
  const make = vm.runInNewContext(part("  function exportModel()", "  function decisionsText()") + "\nexportModel", sandbox);
  const snapshot = JSON.stringify(payload), model = make();
  assert.equal(model.comments[0].passage, 0);
  assert.equal(model.comments[0].hash, undefined);
  assert.equal(model.comments[1].passage, undefined);
  assert.equal(model.comments[1].hash, undefined);
  assert.match(model.comments[1].text, / · unverified$/);
  assert.equal(JSON.stringify(model.payload), snapshot);
  const element = (tag) => ({ tag, children: [], dataset: {}, text: "",
    set textContent(value) { this.text = value; this.children = []; },
    get textContent() { return this.text + this.children.map((c) => c.textContent).join(""); },
    append(...children) { this.children.push(...children); } });
  const host = element("div");
  const preview = vm.runInNewContext(part("  function buildPreview()", "  function openExportDialog()") + "\nbuildPreview",
    { exportModel: make, document: { getElementById: () => host, createElement: element }, t: { export: {
      accepted: "accepted", deferred: "deferred", comments: "comments", emptyAccepted: "", emptyDeferred: "", emptyComments: "", goto: "Go", partial: "partial" } } });
  preview();
  const rows = host.children.flatMap((section) => section.children || []).filter((row) => row.className === "xp-row" && row.textContent.includes("Selected"));
  assert.equal(rows.length, 2);
  assert.equal(rows[0].children.filter((c) => c.tag === "button").length, 1);
  assert.equal(rows[1].children.filter((c) => c.tag === "button" || c.tag === "a").length, 0);
});

test("language tags are validated, and the in-memory comment notice has its own required key no other label stands in for", () => {
  for (const language of ["en", "ru", "custom"]) {
    const review = { language, labels: Object.fromEntries(requiredKeys({ language }).map((k) => [k, LABELS[k]])) };
    assert.deepEqual(labelFaults(review), []);
  }
  for (const language of ["bad_tag", "ru--RU", 'en"><img']) assert.match(labelFaults({ language })[0], /valid language tag/);
  for (const language of ["en", "ru"]) {
    const t = labelsOf({ language, labels: { "annotation.restored": "Saved on disk" } });
    assert.notEqual(t("annotation.added"), "Saved on disk");
  }
  const custom = { language: "custom", labels: Object.fromEntries(requiredKeys({ language: "custom" }).map((k) => [k, LABELS[k]])) };
  delete custom.labels["annotation.added"];
  assert.match(labelFaults(custom)[0], /annotation\.added/);
  delete custom.labels["annotation.unverified"]; delete custom.labels["annotation.proof-note"];
  assert.match(labelFaults(custom)[0], /annotation\.unverified/);
  assert.match(labelFaults(custom)[0], /annotation\.proof-note/);
});

test("storage-sensitive messages come from their own keys, which custom catalogs owe, and show after a failed write", () => {
  const storageKeys = ["export.storage-explanation", "decision.export-local-method", "decision.draft-local", "decision.gate-draft-local"];
  const { diff, record } = hostileFixture(), files = parseDiff(diff);
  record.questions = [
    { kind: "decision", at: "a:1", text: "Parent?", variants: [{ id: "yes", text: "Yes" }] },
    { kind: "decision", at: "a:2", text: "Child?", parent: { question: 1, variants: ["yes"] }, variants: [{ id: "x", text: "X" }] },
  ];
  for (const language of ["en", "ru", "custom"]) {
    const r = structuredClone(record); r.language = language;
    const complete = Object.fromEntries(requiredKeys(r).map((k) => [k, LABELS[k]]));
    if (language === "custom") r.labels = complete;
    const { owner, errors } = check(r, files, ".");
    assert.deepEqual(errors, []);
    const html = page(r, files, modelOf(r, files, owner, "."));
    const data = JSON.parse(html.match(/<script id="data" type="application\/json">(.*?)<\/script>/s)[1]);
    assert.ok(data.labels.draftDeferred.includes("{n}"));
    assert.ok(data.labels.gateDraft.includes("{n}"));
    assert.ok(html.includes(language === "ru" ? "При ошибке сохранения" : "If browser storage fails"));
    let raw = {}; const status = { hidden: true };
    const sandbox = { D: decisionRuntime(), data: { questions: [] }, key: "review",
      localStorage: { getItem: () => null, setItem: () => { throw Error("blocked"); } },
      document: { getElementById: () => status }, window: { addEventListener() {} } };
    const api = vm.runInNewContext(part("  let raw = {};", '  document.documentElement.classList.add("js")') + "\n({ save, state })", sandbox);
    api.state.notes.q1 = "changed"; api.save();
    assert.equal(status.hidden, false);
  }
  const custom = { ...structuredClone(record), language: "custom" };
  const complete = Object.fromEntries(requiredKeys(custom).map((k) => [k, LABELS[k]]));
  for (const k of storageKeys) delete complete[k];
  const fault = labelFaults({ ...custom, labels: complete }).join("\n");
  for (const k of storageKeys) assert.ok(fault.includes(k), k);
});

test("an answer retired by the parent remains raw in JSON but is marked not applicable in text and preview", () => {
  const D = decisionRuntime(), state = D.empty(), questions = [
    { id: 1, kind: "decision", text: "Parent", variants: [{ id: "yes", text: "Yes" }, { id: "no", text: "No" }] },
    { id: 2, kind: "fact", text: "Fact", parent: { question: 1, variants: ["yes"] }, zones: ["zone"] },
    { id: 3, kind: "evidence", text: "Evidence", parent: { question: 1, variants: ["yes"] } },
  ];
  const original = JSON.stringify(questions);
  state.questions[1] = { choice: "accepted", variant: "yes" };
  state.answers.q2 = "raw answer"; state.answers.q3 = "raw evidence";
  state.answers.q999 = "unknown"; state.answers.toString = "unknown method"; state.zones["2-0"] = true;
  state.questions[1].variant = "no";
  const payload = D.exportOf(questions, state, {}), t = {
    status: { decided: "Selected {n}" }, draftSuffix: "draft {n}", notApplicable: "not applicable", answerRow: "Answer: {n}",
    answerStatus: { entered: "entered, not verified", "waiting-parent": "waiting for Q{n}, not verified", "not-applicable": "not applicable, not verified" },
    zoneMarked: "unverified", tabRemaining: "{n} main", title: "Review", dependsOn: "Depends on",
    export: { accepted: "Accepted", deferred: "Deferred", answers: "Answers", zones: "Zones", comments: "Comments",
      openFindings: "open", openDecisions: "open", openDependent: "dependent", openRequests: "requests", versionRecord: "record", versionDiff: "diff" } };
  const sandbox = { D, state, qById: { 1: questions[0], 2: questions[1], 3: questions[2] }, blockById: {},
    data: { questions, findings: [], ideas: [], title: "T", range: "R", key: "K", digest: { record: "sha", diff: "sha" } },
    t, answerStatusText: (s) => t.answerStatus[s.status].replace("{n}", s.parent),
    exportPayload: () => payload, annotationUI: { located: () => false }, stats: () => D.choiceStats(questions, state, []) };
  state.questions[1].variant = "yes";
  const run = vm.runInNewContext(part("  function exportModel()", "  function buildPreview()") + "\n({ exportModel, decisionsText })", sandbox);
  const model = run.exportModel();
  assert.deepEqual(payload.factAnswerStatuses.q2, { status: "not-applicable" });
  assert.deepEqual(payload.factAnswerStatuses.q3, { status: "not-applicable" });
  assert.match(model.answers[0].text, /not applicable.*raw answer/);
  assert.match(model.answers[1].text, /not applicable.*raw evidence/);
  const chipCode = part('        const answer = answerStatuses', '        chipEl.dataset.state');
  const chip = vm.runInNewContext("let stateName = 'open', text = '';\n" + chipCode + "\n({ stateName, text })", {
    answerStatuses: payload.factAnswerStatuses, answerStatusText: sandbox.answerStatusText, q: questions[1], e: {}, na: true, D, state, t,
  });
  assert.equal(chip.text, model.answers[0].text.split(" · ").slice(1).join(" · ").split(": raw answer")[0]);
  assert.equal(chip.stateName, "na");
  for (const row of model.answers.slice(2)) { assert.equal(row.hash, undefined); assert.doesNotMatch(row.text, /verified|entered|applicable/); }
  assert.match(run.decisionsText(), /not applicable.*raw answer/);
  assert.match(run.decisionsText(), /not applicable.*raw evidence/);
  const element = (tag) => ({ tag, children: [], dataset: {}, text: "",
    set textContent(value) { this.text = value; this.children = []; },
    get textContent() { return this.text + this.children.map((c) => c.textContent).join(""); },
    append(...children) { this.children.push(...children); } });
  const host = element("div");
  const preview = vm.runInNewContext(part("  function buildPreview()", "  function openExportDialog()") + "\nbuildPreview",
    { exportModel: run.exportModel, document: { getElementById: () => host, createElement: element }, t: { export: {
      ...t.export, emptyAccepted: "", emptyDeferred: "", emptyComments: "", goto: "Go", partial: "partial" } } });
  preview(); assert.match(host.textContent, /not applicable.*raw answer/);
  assert.match(host.textContent, /not applicable.*raw evidence/);
  assert.equal(payload.factAnswers.q2, "raw answer");
  assert.equal(payload.factAnswers.q3, "raw evidence");
  assert.equal(payload.zones["2-0"], true);
  assert.equal(JSON.stringify(questions), original);
  assert.equal(D.choiceStats(questions, state, []).fact, 0);
  sandbox.exportPayload = () => D.exportOf(questions, state, {});
  const active = run.exportModel();
  assert.match(active.answers[0].text, /entered, not verified.*raw answer/);
  assert.match(run.decisionsText(), /entered, not verified.*raw evidence/);
  delete state.questions[1];
  const pending = run.exportModel();
  assert.match(pending.answers[0].text, /waiting for Q1, not verified.*raw answer/);
  preview(); assert.match(host.textContent, /waiting for Q1, not verified.*raw evidence/);
  assert.equal(JSON.stringify(questions), original);
});

test("fact answer statuses follow applicability and parent gates without inventing unknown states", () => {
  const D = decisionRuntime(), state = D.empty(), questions = [
    { id: 1, kind: "decision", variants: [{ id: "yes" }, { id: "no" }] },
    { id: 2, kind: "fact", parent: { question: 1, variants: ["yes"] } },
    { id: 3, kind: "evidence", parent: { question: 1, variants: ["yes"] } },
    { id: 4, kind: "fact" }, { id: 5, kind: "evidence" }, { id: 6 },
    { id: 7, kind: "fact" },
  ];
  const original = JSON.stringify(questions);
  state.answers = { q2: "fact", q3: "evidence", q4: "independent fact", q5: "independent evidence",
    q6: "no kind", q7: "  ", q999: "unknown", stray: "stray" };
  state.zones["3-0"] = true;
  const check = (expected) => {
    const payload = D.exportOf(questions, state, {});
    assert.equal(payload.schema_version, 5);
    assert.deepEqual(payload.factAnswerStatuses.q2, expected);
    assert.deepEqual(payload.factAnswerStatuses.q3, expected);
    assert.deepEqual(payload.factAnswerStatuses.q4, { status: "entered" });
    assert.deepEqual(payload.factAnswerStatuses.q5, { status: "entered" });
    for (const id of ["q6", "q7", "q999", "stray"]) assert.equal(Object.hasOwn(payload.factAnswerStatuses, id), false);
    assert.deepEqual(payload.factAnswers, state.answers);
    assert.deepEqual(payload.zones, state.zones);
    assert.equal(JSON.stringify(payload.factAnswerStatuses).includes("verified"), false);
    assert.equal(JSON.stringify(questions), original);
  };
  state.questions[1] = { choice: "accepted", variant: "yes" }; check({ status: "entered" });
  state.questions[1].variant = "no"; check({ status: "not-applicable" });
  delete state.questions[1]; check({ status: "waiting-parent", parent: 1 });
  state.questions[1] = { choice: "deferred" }; state.notes.q1 = "later"; check({ status: "entered" });
  const inherited = D.empty(); inherited.answers = Object.create({ q4: "not an own answer" });
  assert.deepEqual(D.exportOf(questions, inherited, {}).factAnswerStatuses, {});
  for (const lang of ["en", "ru"]) {
    const t = labelsOf({ language: lang });
    assert.ok(t("answer.status.waiting-parent", 1).includes("Q1"));
    assert.notEqual(t("answer.status.entered"), t("answer.status.not-applicable"));
  }
  const custom = { language: "custom", questions: [{ kind: "fact", parent: { question: 1, variants: ["yes"] } }] };
  const catalog = Object.fromEntries(requiredKeys(custom).map((key) => [key, LABELS[key]]));
  for (const key of ["answer.status.entered", "answer.status.waiting-parent", "answer.status.not-applicable"]) delete catalog[key];
  const fault = labelFaults({ ...custom, labels: catalog }).join("\n");
  for (const key of ["answer.status.entered", "answer.status.waiting-parent", "answer.status.not-applicable"]) assert.ok(fault.includes(key), key);
  const independent = requiredKeys({ questions: [{ kind: "fact" }] });
  assert.ok(independent.includes("answer.status.entered"));
  assert.ok(!independent.includes("answer.status.waiting-parent"));
  assert.ok(!independent.includes("answer.status.not-applicable"));
});

test("rendered answer status labels are localized without altering the input record", () => {
  const { diff, record } = hostileFixture(), files = parseDiff(diff);
  record.questions = [{ kind: "fact", at: "a:1", text: "A fact?" }];
  for (const language of ["en", "ru", "custom"]) {
    const review = structuredClone(record); review.language = language;
    review.labels = language === "custom" ? Object.fromEntries(requiredKeys(review).map((k) => [k, LABELS[k]])) : {};
    const original = JSON.stringify(review), { errors, owner } = check(review, files, ".");
    assert.deepEqual(errors, []);
    const html = page(review, files, modelOf(review, files, owner, "."));
    const data = JSON.parse(html.match(/<script id="data" type="application\/json">(.*?)<\/script>/s)[1]);
    const catalog = language === "ru" ? CATALOGS.ru : LABELS;
    for (const status of ["entered", "waiting-parent", "not-applicable"])
      assert.equal(data.labels.answerStatus[status], catalog["answer.status." + status]);
    assert.equal(JSON.stringify(review), original);
    new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
  }
});

test("tree search and clear dismiss the notice, but programmatic reset preserves it", () => {
  const handlers = {}, notice = { textContent: "reset" }, events = [];
  const treeInput = {
    value: "query", addEventListener(event, fn) { handlers[event] = fn; },
    focus() { events.push("focus"); }
  };
  const treeClear = { addEventListener(event, fn) { handlers.clear = fn; } };
  const sandbox = {
    treeInput, treeClear, document: { getElementById: () => notice },
    applyTreeFilter() { events.push("filter"); }, all: () => []
  };
  vm.runInNewContext(part('  treeInput.addEventListener("input"', "  // Flatten in place"), sandbox);
  handlers.input();
  assert.equal(notice.textContent, "");
  assert.deepEqual(events, ["filter"]);
  notice.textContent = "reset";
  handlers.clear();
  assert.equal(notice.textContent, "");
  assert.equal(treeInput.value, "");
  assert.deepEqual(events, ["filter", "filter", "focus"]);
  notice.textContent = "fresh reset";
  treeInput.value = "another";
  sandbox.resetTreeFilter();
  assert.equal(notice.textContent, "fresh reset");
  assert.equal(treeInput.value, "");
});

test("unit context moves between blocks and disappears for a block without a unit", () => {
  let contexts = [];
  const bar = () => ({ append(node) { contexts.push(node); } });
  const targets = ["1", "2", "3"].map((id) => ({ dataset: { block: id }, querySelector: bar }));
  const sandbox = {
    map: { dataset: { req: "1" } }, blockById: { 1: { unit: "first" }, 2: { unit: "second" }, 3: {} },
    t: { inUnit: "in" }, all: () => [...contexts],
    document: { createElement: () => ({ remove() { contexts = contexts.filter((c) => c !== this); } }) }
  };
  vm.runInNewContext(part("  function updateUnitContext(target)", "  function showMobileDiff()"), sandbox);
  sandbox.updateUnitContext(targets[0]);
  assert.equal(contexts[0].textContent, "in first");
  sandbox.updateUnitContext(targets[1]);
  assert.equal(contexts.length, 1);
  assert.equal(contexts[0].textContent, "in second");
  sandbox.updateUnitContext(targets[2]);
  assert.equal(contexts.length, 0);
});

test("deep link reports actual reset including verdict mode and reveals mobile diff before focus", () => {
  const notice = { textContent: "" }, order = [];
  const el = {
    closest(selector) { return selector === ".panel" ? { dataset: { panel: "code" } } : null; },
    querySelector() { return null; }, matches() { return false; },
    scrollIntoView() { order.push("scroll"); }, focus() { order.push("focus"); }
  };
  const sandbox = {
    map: { dataset: { show: "fix" } }, hiddenPurposes: () => [], t: { code: { filtersCleared: "reset" } },
    treeInput: { value: "" },
    document: { getElementById(id) { return id === "code-notice" ? notice : el; } },
    clearFilters() {}, resetTreeFilter() {}, activate() {}, setMode(mode) { sandbox.map.dataset.show = mode; },
    showMobileDiff() { order.push("diff"); }, progOpen() {}, requestAnimationFrame(fn) { fn(); },
    scrollPos: new Map(), window: { scrollY: 0 }
  };
  vm.runInNewContext(part("  function openTarget(hash)", '  window.addEventListener("hashchange"'), sandbox);
  sandbox.openTarget("#b1");
  assert.equal(notice.textContent, "reset");
  assert.deepEqual(order, ["diff", "scroll", "focus"]);
  order.length = 0;
  sandbox.openTarget("#b1");
  assert.equal(notice.textContent, "");
  sandbox.treeInput.value = "other file";
  sandbox.openTarget("#b1");
  assert.equal(notice.textContent, "reset");
});

test("mobile tree changes to diff and updates pressed controls", () => {
  const buttons = ["tree", "diff"].map((mview) => ({
    dataset: { mview }, setAttribute(_name, value) { this.pressed = value; }
  }));
  const sandbox = { codeLayout: { dataset: { mview: "tree" } }, all: () => buttons };
  vm.runInNewContext(part("  function showMobileDiff()", "  function restoreUnfilteredFiles()"), sandbox);
  sandbox.showMobileDiff();
  assert.equal(sandbox.codeLayout.dataset.mview, "diff");
  assert.deepEqual(buttons.map((button) => button.pressed), ["false", "true"]);
});

test("Next and Previous move the unit context with the selected block", () => {
  const calls = [];
  const segments = ["1", "2"].map((id) => ({
    dataset: { block: id }, querySelector() { return {}; },
    scrollIntoView() {}, matches() { return false; }, focus() {}
  }));
  const sandbox = {
    chipIdx: 0, chipMatches: () => segments, updateUnitContext: (target) => calls.push(target.dataset.block),
    progOpen() {}, paintChipPos() {}
  };
  vm.runInNewContext(part("  function chipJump(delta)", '  chipPrev.addEventListener("click"'), sandbox);
  sandbox.chipJump(1);
  sandbox.chipJump(-1);
  assert.deepEqual(calls, ["2", "1"]);
});

test("selecting another requirement clears the previous reset notice", () => {
  let handler;
  const notice = { textContent: "old reset" };
  const sandbox = {
    document: { getElementById(id) { return id === "code-requirement" ? { addEventListener(_event, fn) { handler = fn; } } : notice; } },
    map: { dataset: { req: "1" } }, selectingRequirement: false,
    updateUnitContext() {}, all: () => [], filesMatching: () => new Set(), insertFile() {},
    history: { pushState() {} }, applyTreeFilter() {}, applySegFilter() {}, restoreUnfilteredFiles() {}
  };
  vm.runInNewContext(part('  document.getElementById("code-requirement").addEventListener', "  function openTarget(hash)"), sandbox);
  handler({ target: { value: "2" } });
  assert.equal(notice.textContent, "");
  assert.equal(sandbox.map.dataset.req, "2");
});

test("chip counts unique matching blocks independently of hidden panel and mobile tree", () => {
  const file = { style: { display: "" } };
  const seg = (display, offsetParent, parent = file) => ({ style: { display }, offsetParent, closest: () => parent });
  const segments = [seg("", null), seg("", null), seg("none", null), seg("", null, { style: { display: "none" } })];
  const sandbox = {
    document: { querySelectorAll(selector) { assert.equal(selector, "#map .seg[id][data-block]"); return segments; } },
    map: { dataset: { req: "1" } }, hiddenPurposes: () => [], updateRequirementViews() {},
    data: { blocks: [{ serves: [1] }, { serves: [1] }, { serves: [1] }], purposeLabels: {} },
    t: { chip: { requirement: "Requirement {n}" }, code: { linked: "Linked blocks", visible: "Visible" }, blocksWord: "Blocks" },
    chip: {}, chipLabel: {}, chipPos: {}, chipPrev: {}, chipNext: {}, chipBack: {},
    returnState: null, chipIdx: 0, chipKey: ""
  };
  vm.runInNewContext(part("  const chipMatches =", "  function chipJump(delta)") + "\nthis.updateChip = updateChip;", sandbox);
  for (const view of ["hidden panel", "mobile tree", "mobile diff", "afterprint in hidden Code", "return to Code"]) {
    segments[0].offsetParent = view.includes("diff") || view === "return to Code" ? {} : null;
    sandbox.updateChip();
    assert.equal(sandbox.chipLabel.textContent, "Requirement 1 · Linked blocks: 3 · Visible: 2", view);
    assert.equal(sandbox.chipPos.textContent, "1 / 2", view);
    assert.equal(sandbox.chipNext.disabled, false, view);
  }
  segments[0].style.display = "none";
  sandbox.updateChip();
  assert.match(sandbox.chipLabel.textContent, /Visible: 1$/);
  // A question's chip counts its blocks.
  Object.assign(sandbox, { map: { dataset: { q: "1" } }, chipKey: "",
    data: { blocks: [{ questions: [1] }, { questions: [1] }, { questions: [2] }], purposeLabels: {} } });
  sandbox.updateChip();
  assert.equal(sandbox.chipLabel.textContent, "Q1 · Blocks: 2");
});

test("#panel-code clears each context while retaining hidden purposes and restoring lazy files", () => {
  for (const kind of ["req", "q", "f"]) {
    const calls = [], notice = { textContent: "old" };
    const sandbox = {
      map: { dataset: { [kind]: "1", show: "all" } }, state: { hiddenPurposes: ["tests"] },
      document: { getElementById: () => notice },
      updateUnitContext() { calls.push("context"); }, selectingRequirement: false,
      insertAll() { calls.push("restore"); },
      applyTreeFilter() { calls.push("tree"); }, applySegFilter() { calls.push("segments"); },
      activate(id) { calls.push(id); }
    };
    vm.runInNewContext(part("  function restoreUnfilteredFiles()", "  function updateRequirementViews()"), sandbox);
    vm.runInNewContext(part("  function openTarget(hash)", '  window.addEventListener("hashchange"'), sandbox);
    sandbox.openTarget("#panel-code");
    assert.equal(sandbox.map.dataset[kind], undefined);
    assert.deepEqual(sandbox.state.hiddenPurposes, ["tests"]);
    assert.deepEqual(calls, ["context", "restore", "tree", "segments", "code"]);
    assert.equal(notice.textContent, "");
  }
});

test("purpose and changed verdict clear the notice but the same verdict does not", () => {
  const notice = { textContent: "old" }, sandbox = {
    document: { getElementById: () => notice }, state: { hiddenPurposes: [] }, hiddenPurposes() { return sandbox.state.hiddenPurposes; },
    save() {}, all: () => [], applyTreeFilter() {}, applySegFilter() {}
  };
  vm.runInNewContext(part("  function togglePurpose(cat)", "  // ---- C2:"), sandbox);
  sandbox.togglePurpose("tests");
  assert.equal(notice.textContent, "");
  const handler = part("    } else if (button.dataset.show)", "    else if (button.dataset.purposeFilter)");
  const verdict = handler.replace(/^    \} else if/, "if");
  for (const [selected, expected] of [["fix", ""], ["all", "old"]]) {
    notice.textContent = "old";
    vm.runInNewContext(`(function () { ${verdict} })()`, { button: { dataset: { show: selected } }, map: { dataset: { show: "all" } }, document: sandbox.document, setMode() {} });
    assert.equal(notice.textContent, expected);
  }
});

test("auditor print restores the unit marker after the DOM and filters", () => {
  const callbacks = {}, calls = [], marker = { closest: () => ({ dataset: { block: "7" } }) }, target = { id: "b7" };
  let activeMarker = marker;
  const sandbox = {
    window: { addEventListener(name, fn) { callbacks[name] = fn; } },
    document: {
      querySelector(selector) { return selector === "#map .unit-context" ? activeMarker : null; },
      getElementById(id) { assert.equal(id, "b7"); return target; }
    },
    inserted: new Set(["0"]), map: { dataset: { show: "all", req: "1" }, style: { display: "" } },
    state: { hiddenPurposes: ["tests"] }, hiddenPurposes() { return sandbox.state.hiddenPurposes; },
    chipIdx: 0, chipPos: { textContent: "1 / 1" }, chipPrev: { disabled: false }, chipNext: {},
    all: () => [], clearFilters() { activeMarker = null; delete sandbox.map.dataset.req; sandbox.state.hiddenPurposes = []; },
    setMode() {}, insertAll() {}, progOpen() {}, buildWhere() {}, save() {}, segIndex: new Map(), indexSegs() {},
    applyTreeFilter() { calls.push("tree"); }, applySegFilter() { calls.push("filters"); },
    updateUnitContext(node) { calls.push("unit"); assert.equal(node, target); assert.equal(sandbox.map.dataset.req, "1"); activeMarker = marker; }
  };
  vm.runInNewContext(part("  let printSnapshot = null", "  annotationUI =") + "\nauditorPrint = true;", sandbox);
  callbacks.beforeprint();
  assert.equal(activeMarker, null);
  callbacks.afterprint();
  assert.equal(activeMarker, marker);
  assert.deepEqual(calls, ["tree", "filters", "unit"]);
  assert.deepEqual([...sandbox.state.hiddenPurposes], ["tests"]);
});

test("auditor print restores revealed files before filtering and unit context without replacing nodes", () => {
  const callbacks = {}, order = [];
  function file(id, reveal, verdict, purpose) {
    const classes = new Set(reveal ? ["reveal"] : []);
    const host = { dataset: { file: id } };
    const element = {
      style: {},
      classList: {
        contains: (name) => classes.has(name),
        toggle(name, value) { if (value) classes.add(name); else classes.delete(name); },
        remove: (name) => classes.delete(name)
      },
      closest: () => host,
      querySelectorAll: () => [segment]
    };
    const segment = {
      style: {}, dataset: { block: id, verdict, purpose, serves: "1" },
      closest: (selector) => selector === ".file.reveal" && classes.has("reveal") ? element : null
    };
    host.querySelector = () => element;
    host.querySelectorAll = () => [element];
    return { host, element, segment };
  }
  const revealed = file("7", true, "keep", "production");
  const ordinary = file("8", false, "keep", "production");
  const hidden = file("9", true, "keep", "tests");
  const files = [revealed, ordinary, hidden], marker = { closest: () => ({ dataset: { block: "7" } }) };
  let activeMarker = marker, visibleCount;
  const sandbox = {
    window: { addEventListener(name, fn) { callbacks[name] = fn; } },
    document: {
      querySelector(selector) { return selector === "#map .unit-context" ? activeMarker : null; },
      getElementById(id) {
        if (id === "panel-code") return { classList: { toggle() {} } };
        assert.equal(id, "b7"); return revealed.segment;
      }
    },
    inserted: new Set(["7", "8", "9"]), segIndex: new Map(), indexSegs() {},
    map: { dataset: { show: "attention", req: "1" }, style: { display: "" } },
    state: { hiddenPurposes: ["tests"] }, hiddenPurposes() { return sandbox.state.hiddenPurposes; },
    chipIdx: 0, chipPos: { textContent: "1 / 1" }, chipPrev: { disabled: false }, chipNext: {},
    all(selector) {
      if (selector === "#map .file.reveal") return files.filter((f) => f.element.classList.contains("reveal")).map((f) => f.element);
      if (selector === ".file-lazy") return files.map((f) => f.host);
      if (selector === "#map .seg[data-block]") return files.map((f) => f.segment);
      return [];
    },
    clearFilters() { activeMarker = null; delete sandbox.map.dataset.req; sandbox.state.hiddenPurposes = []; },
    setMode(mode) { files.forEach((f) => f.element.classList.remove("reveal")); sandbox.map.dataset.show = mode; },
    insertAll() {}, progOpen() {}, buildWhere() {}, save() {}, applyTreeFilter() {},
    updateChip() { visibleCount = files.filter((f) => f.segment.style.display !== "none").length; order.push("chip"); },
    updateUnitContext(node) {
      order.push("unit");
      assert.equal(node, revealed.segment);
      assert.equal(node.style.display, "");
      activeMarker = marker;
    }
  };
  vm.runInNewContext(part("  function applySegFilter()", "  function setMode(v)"), sandbox);
  sandbox.applySegFilter();
  assert.equal(visibleCount, 1);
  order.length = 0;
  vm.runInNewContext(part("  let printSnapshot = null", "  annotationUI =") + "\nauditorPrint = true;", sandbox);
  callbacks.beforeprint();
  assert.equal(revealed.element.classList.contains("reveal"), false);
  callbacks.afterprint();
  assert.equal(revealed.host.querySelector(), revealed.element);
  assert.equal(revealed.element.querySelectorAll()[0], revealed.segment);
  assert.equal(revealed.element.classList.contains("reveal"), true);
  assert.equal(ordinary.element.classList.contains("reveal"), false);
  assert.equal(hidden.element.classList.contains("reveal"), true);
  assert.equal(revealed.segment.style.display, "");
  assert.equal(ordinary.segment.style.display, "none");
  assert.equal(hidden.segment.style.display, "none");
  assert.equal(visibleCount, 1);
  assert.deepEqual(order, ["chip", "unit"]);
  assert.equal(activeMarker, marker);
  assert.equal(sandbox.map.dataset.show, "attention");
  assert.equal(sandbox.map.dataset.req, "1");
  assert.deepEqual([...sandbox.state.hiddenPurposes], ["tests"]);
});

test("afterprint recomputes hidden Code chip from restored filtered segments", () => {
  const callbacks = {}, file = { style: { display: "" } };
  const segments = [{ style: { display: "" }, offsetParent: null, closest: () => file }];
  const sandbox = {
    window: { addEventListener(name, fn) { callbacks[name] = fn; } },
    document: {
      querySelector() { return null; },
      querySelectorAll() { return segments; }
    },
    inserted: new Set(), map: { dataset: { show: "all", req: "1" }, style: { display: "" } },
    state: { hiddenPurposes: [] }, hiddenPurposes() { return sandbox.state.hiddenPurposes; },
    data: { blocks: [{ serves: [1] }], purposeLabels: {} },
    t: { chip: { requirement: "T{n}" }, code: { linked: "Linked", visible: "Visible" } },
    chip: {}, chipLabel: {}, chipPos: {}, chipPrev: {}, chipNext: {}, chipBack: {},
    returnState: null, chipIdx: 0, chipKey: "", updateRequirementViews() {},
    all: () => [], clearFilters() { delete sandbox.map.dataset.req; }, setMode() {}, insertAll() {},
    progOpen() {}, buildWhere() {}, save() {}, segIndex: new Map(), indexSegs() {},
    applyTreeFilter() {}, applySegFilter() { sandbox.updateChip(); }
  };
  vm.runInNewContext(part("  const chipMatches =", "  function chipJump(delta)") + "\nthis.updateChip = updateChip;", sandbox);
  sandbox.updateChip();
  vm.runInNewContext(part("  let printSnapshot = null", "  annotationUI =") + "\nauditorPrint = true;", sandbox);
  callbacks.beforeprint();
  callbacks.afterprint();
  assert.equal(sandbox.chipLabel.textContent, "T1 · Linked: 1 · Visible: 1");
  assert.equal(sandbox.chipNext.disabled, false);
  segments[0].offsetParent = {};
  sandbox.updateChip();
  assert.equal(sandbox.chipLabel.textContent, "T1 · Linked: 1 · Visible: 1");
});

test("custom catalogs must translate code.linked", () => {
  for (const review of [{ language: "custom" }, { language: "custom", passport: {} }]) {
    review.labels = Object.fromEntries(requiredKeys(review).map((key) => [key, LABELS[key]]));
    delete review.labels["code.linked"];
    assert.ok(labelFaults(review).some((fault) => fault.includes("code.linked")));
    review.labels["code.linked"] = "translated linked";
    assert.deepEqual(labelFaults(review), []);
  }
  assert.ok(LABELS["code.linked"] && CATALOGS.ru["code.linked"]);
});
