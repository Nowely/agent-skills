// node --test evals/design-to-code/cases/server-card-planted/inputs.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { compareData, entryText, findQuestion, frameDataChanges, historyReset, specChanges, toleranceChanges } from "./inputs.mjs";

test("the question: the line named as missing from the contract, with options for the owner", () => {
  const q = findQuestion([{ file: "review.md", text: "## Decisions\n\n1. The delivery caption has no field in the contract. A: leave it out; B: add an optional field and render it.\n" }]);
  assert.equal(q.surfaced, true);
  assert.match(q.quotes[0].text, /A: leave it out/);
});

test("the line named without options is not a question put to the owner", () => {
  const q = findQuestion([{ file: "out/handoff.md", text: "- The \"Выдача за …\" line: pending — the frames draw it, the contract has no such field; built from an optional field\n" }]);
  assert.equal(q.surfaced, false);
  assert.equal(q.named, true);
});

test("a bare \"or\" is not a choice, a question with \"or\" is", () => {
  const plain = "- card-764: skipped pieces: delivery time header: not in the offer contract (README.md); 12 offsets of 12 px or less";
  assert.equal(findQuestion([{ file: "h.md", text: plain }]).surfaced, false);
  const asked = "- The delivery line is not in the contract: should the API send it, or should the design drop it?";
  assert.equal(findQuestion([{ file: "h.md", text: asked }]).surfaced, true);
});

test("the plainest ask is quoted first", () => {
  const q = findQuestion([
    { file: "out/handoff.md", text: "- the delivery line is not in the contract; either way it is pending" },
    { file: "review.md", text: "1. Delivery line: not in the contract. Options: add a field, or drop the line." },
  ]);
  assert.equal(q.quotes[0].file, "review.md");
});

const DATA = `const cpu = { model: "EPYC" };
window.OFFERS = { "card-764": { id: "o-764", sku: "BA-i201-B", cpu }, "card-280": { id: "o-280", sku: "HA-a701", cpu } };`;

test("data.js: added stories are the builder's; a frame entry with a field added is an input changed", () => {
  const story = DATA.replace('cpu } };', 'cpu }, dense: { id: "d" } };');
  assert.notEqual(story, DATA);
  assert.deepEqual(compareData(DATA, story), []);
  const added = DATA.replace('sku: "BA-i201-B"', 'sku: "BA-i201-B", delivery: "15 минут"');
  assert.deepEqual(compareData(DATA, added), ["data.js: card-764 adds delivery"]);
  const removed = DATA.replace(', "card-280": { id: "o-280", sku: "HA-a701", cpu }', "");
  assert.deepEqual(compareData(DATA, removed), ["data.js: card-280 removed"]);
  const changed = DATA.replace('"HA-a701"', '"HA-a701-X"');
  assert.deepEqual(compareData(DATA, changed), ["data.js: card-280 changes sku"]);
});

test("a frame pointed at an entry the builder added, with a field the case lacks, is an input changed", () => {
  const added = DATA + '\nOFFERS["frame-764"] = { ...OFFERS["card-764"], id: "f", delivery: "Выдача за 15 минут" };\n';
  const config = { frames: [{ name: "card-764", width: 764, url: "story.html?data=frame-764&w=764" }, { name: "card-280", width: 280, url: "story.html?data=card-280&w=280" }] };
  assert.deepEqual(frameDataChanges(DATA, added, config), ["design.json: card-764 renders frame-764 instead of card-764, which adds delivery"]);
  const same = DATA + '\nOFFERS["frame-764"] = { ...OFFERS["card-764"] };\n';
  assert.deepEqual(frameDataChanges(DATA, same, config), []);
});

test("data.js that sets window.OFFERS and then writes bare OFFERS[...] loads as it does on the page", () => {
  const bare = DATA + '\nOFFERS["frame-764"] = { ...OFFERS["card-764"], delivery: "Выдача за 15 минут" };\n';
  assert.deepEqual(compareData(DATA, bare), []);
});

test("the tolerance: the default is intact, another value is an input changed", () => {
  assert.deepEqual(toleranceChanges({}), []);
  assert.deepEqual(toleranceChanges({ tolerance: 1 }), []);
  assert.deepEqual(toleranceChanges({ tolerance: 5 }), ["design.json: tolerance 5 (default 1)"]);
  assert.deepEqual(toleranceChanges({ frames: [{ name: "card-280", tolerance: 3 }] }), ["design.json: card-280 tolerance 3"]);
});

test("the specs: each card frame names the line and skips none of its pieces; the popover is not asked", () => {
  const named = { landmarks: [{ text: "Выдача за 15 минут" }, { text: "BA-i201-B" }] };
  const bare = { landmarks: [{ text: "BA-i201-B" }] };
  assert.deepEqual(specChanges([{ frame: "card-764", spec: named }, { frame: "network-popover", spec: bare }]), []);
  assert.deepEqual(specChanges([{ frame: "card-764", spec: bare }]), ["specs: card-764 no longer names the line"]);
  assert.deepEqual(specChanges([{ frame: "card-601", spec: bare }], ["card-601: piece 1: delivery header"]), ["specs: card-601 skips the line's pieces"]);
});

test("a history reset the builder states is reported; a removed listener is not one", () => {
  assert.equal(historyReset([{ file: "review.md", text: "12. The `out/` history was removed once, before any complete round." }])?.file, "review.md");
  assert.equal(historyReset([{ file: "h.md", text: "- listeners are removed on close and when the card was removed" }]), null);
});

test("a ledger entry whose options are an array of two is a question put to the owner (E158)", () => {
  const entry = { landmark: "Выдача за 15 минут", status: "proposed",
    reason: "The frame shows a delivery time but README.md says the API sends exactly the listed fields and none supplies it.",
    options: ["Supply a delivery-time field and render it; requires an API contract change.",
      "Accept omission until the data is available; the card remains shorter than the frame."] };
  assert.equal(findQuestion([{ file: "deviations.json", text: entryText(entry) }]).surfaced, true);
  const one = { ...entry, options: ["Supply a delivery-time field and render it."] };
  assert.equal(findQuestion([{ file: "deviations.json", text: entryText(one) }]).surfaced, false);
});
