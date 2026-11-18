import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { LABELS, CATALOGS, labelFaults, requiredKeys } from "../plugin/skills/review/scripts/labels.mjs";

const source = fs.readFileSync(new URL("../plugin/skills/review/scripts/page.mjs", import.meta.url), "utf8");
const part = (start, end) => {
  const i = source.indexOf(start), j = source.indexOf(end, i);
  assert.ok(i >= 0 && j > i, `missing runtime section ${start}`);
  return source.slice(i, j).replaceAll("\\\\", "\\");
};

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
    t: { files: "Files" }, document: {}, hiddenPurposes() { return sandbox.hidden; },
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
    querySelector() { return {}; }, matches() { return false; },
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
  vm.runInNewContext(part('  document.getElementById("code-requirement").addEventListener', "  // ---- deep links:"), sandbox);
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
    data: { blocks: [{ serves: [1], parts: 3 }, { serves: [1] }, { serves: [1] }], purposeLabels: {} },
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
  vm.runInNewContext(part("  let printSnapshot = null", "  const annotationUI =") + "\nauditorPrint = true;", sandbox);
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
  vm.runInNewContext(part("  let printSnapshot = null", "  const annotationUI =") + "\nauditorPrint = true;", sandbox);
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
    data: { blocks: [{ serves: [1], parts: 2 }], purposeLabels: {} },
    t: { chip: { requirement: "T{n}" }, code: { linked: "Linked", visible: "Visible" } },
    chip: {}, chipLabel: {}, chipPos: {}, chipPrev: {}, chipNext: {}, chipBack: {},
    returnState: null, chipIdx: 0, chipKey: "", updateRequirementViews() {},
    all: () => [], clearFilters() { delete sandbox.map.dataset.req; }, setMode() {}, insertAll() {},
    progOpen() {}, buildWhere() {}, save() {}, segIndex: new Map(), indexSegs() {},
    applyTreeFilter() {}, applySegFilter() { sandbox.updateChip(); }
  };
  vm.runInNewContext(part("  const chipMatches =", "  function chipJump(delta)") + "\nthis.updateChip = updateChip;", sandbox);
  sandbox.updateChip();
  vm.runInNewContext(part("  let printSnapshot = null", "  const annotationUI =") + "\nauditorPrint = true;", sandbox);
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
