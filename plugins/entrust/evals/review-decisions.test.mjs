// The owner's answers as plugins/entrust/plugin/skills/review/scripts/decisions.mjs keeps them: one answer per item,
// a deferral only with a reason, conditional questions retired and restored by their parent's answer, progress over
// every item, comments on lines and paragraphs, and the schema-6 export of them all. Run it after an edit to
// decisions.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { decisionRuntime } from "../plugin/skills/review/scripts/decisions.mjs";

const D = decisionRuntime();
// Q1 a decision; Q2 its child under "keep"; Q3 a grandchild under Q2's "yes"; Q4 a fact; Q5 evidence; F1 a finding; I1 an idea.
const ITEMS = D.itemsOf({
  questions: [
    { id: 1, kind: "decision", variants: [{ id: "keep" }, { id: "revert" }] },
    { id: 2, kind: "decision", variants: [{ id: "yes" }, { id: "no" }], parent: { question: 1, variants: ["keep"] } },
    { id: 3, kind: "decision", variants: [{ id: "a" }, { id: "b" }], parent: { question: 2, variants: ["yes"] } },
    { id: 4, kind: "fact" },
    { id: 5, kind: "evidence" },
  ],
  findings: [{ id: "F1" }],
  ideas: [{ title: "An idea" }],
});
const status = (state, key) => D.status(ITEMS, state, key);

test("every item has a key and the owner's options: variants, fix it or leave it, take it or skip it, or none", () => {
  assert.deepEqual(ITEMS.map((i) => [i.key, i.kind, i.options.join(), i.parent?.key ?? null]), [
    ["q1", "decision", "keep,revert", null], ["q2", "decision", "yes,no", "q1"], ["q3", "decision", "a,b", "q2"],
    ["q4", "fact", "", null], ["q5", "evidence", "", null], ["fF1", "finding", "fix,leave", null], ["i1", "idea", "take,skip", null]]);
  assert.throws(() => D.choose(ITEMS, D.empty(), "fF1", "take"), /no option/);
  assert.throws(() => D.choose(ITEMS, D.empty(), "q9", "keep"), /no item/);
});

test("one answer per item: a variant clears the own answer and the own answer clears the variant", () => {
  let s = D.write(ITEMS, D.empty(), "q1", "keep it, but log it");
  assert.deepEqual(status(s, "q1"), { state: "decided", text: "keep it, but log it", draft: null });
  s = D.choose(ITEMS, s, "q1", "revert");
  assert.deepEqual(s.answers.q1, { choice: "revert" });
  s = D.write(ITEMS, s, "q1", "neither");
  assert.deepEqual(s.answers.q1, { text: "neither" });
  // An emptied own answer leaves the item open, with nothing stored.
  s = D.write(ITEMS, s, "q1", "  ");
  assert.equal(status(s, "q1").state, "open");
  assert.equal(s.answers.q1, undefined);
  // Every change returns a new state and leaves the old one as it was: Undo restores it.
  const before = D.choose(ITEMS, D.empty(), "fF1", "fix"), after = D.choose(ITEMS, before, "fF1", "leave");
  assert.deepEqual(before.answers.fF1, { choice: "fix" });
  assert.deepEqual(after.answers.fF1, { choice: "leave" });
});

test("a deferral needs a reason, keeps the answer it replaces as a draft, and the draft returns only when applied", () => {
  const answered = D.choose(ITEMS, D.empty(), "fF1", "fix");
  assert.equal(D.defer(ITEMS, answered, "fF1", " "), answered, "a deferral without a reason is refused");
  const deferred = D.defer(ITEMS, answered, "fF1", "after the release");
  assert.deepEqual(status(deferred, "fF1"), { state: "deferred", reason: "after the release", draft: { choice: "fix" } });
  const undone = D.undefer(ITEMS, deferred, "fF1");
  assert.deepEqual(status(undone, "fF1"), { state: "open", draft: { choice: "fix" } });
  assert.deepEqual(status(D.applyDraft(ITEMS, undone, "fF1"), "fF1"), { state: "decided", choice: "fix", draft: null });
  // An own answer deferred is kept as an own-answer draft.
  const own = D.defer(ITEMS, D.write(ITEMS, D.empty(), "i1", "later, maybe"), "i1", "no time");
  assert.deepEqual(status(own, "i1").draft, { text: "later, maybe" });
});

test("a conditional question applies while its parent applies and has no variant in effect, or one it lists", () => {
  const empty = D.empty();
  for (const [why, s, applies] of [
    ["the parent is open", empty, true],
    ["the parent answered in its own words", D.write(ITEMS, empty, "q1", "something else"), true],
    ["the parent is deferred", D.defer(ITEMS, D.choose(ITEMS, empty, "q1", "revert"), "q1", "later"), true],
    ["the parent's variant is listed", D.choose(ITEMS, empty, "q1", "keep"), true],
    ["the parent's variant is not listed", D.choose(ITEMS, empty, "q1", "revert"), false],
  ]) assert.equal(D.applicable(ITEMS, s, "q2"), applies, why);
  // A parent that does not apply takes its children with it, down the chain.
  const retired = D.choose(ITEMS, D.choose(ITEMS, empty, "q2", "yes"), "q1", "revert");
  assert.equal(status(retired, "q3").state, "not-applicable");
});

test("a retired question keeps its answer as a draft, and the answer never returns silently", () => {
  let s = D.choose(ITEMS, D.empty(), "q1", "keep");
  s = D.choose(ITEMS, s, "q2", "yes");
  s = D.write(ITEMS, s, "q3", "only on Mondays");
  s = D.choose(ITEMS, s, "q1", "revert");
  assert.deepEqual(status(s, "q2"), { state: "not-applicable", draft: { choice: "yes" } });
  assert.deepEqual(status(s, "q3"), { state: "not-applicable", draft: { text: "only on Mondays" } });
  // A question that does not apply takes no answer.
  assert.equal(D.choose(ITEMS, s, "q2", "no"), s);
  s = D.choose(ITEMS, s, "q1", "keep");
  assert.deepEqual(status(s, "q2"), { state: "open", draft: { choice: "yes" } });
  // Q3 applies again only once Q2's answer is back in effect, and its own draft stays a draft until applied.
  s = D.applyDraft(ITEMS, s, "q2");
  assert.deepEqual(status(s, "q3"), { state: "open", draft: { text: "only on Mondays" } });
  assert.deepEqual(status(D.applyDraft(ITEMS, s, "q3"), "q3"), { state: "decided", text: "only on Mondays", draft: null });
});

test("an answer to a fact or evidence request is answered, never decided, and a zone mark answers nothing", () => {
  let s = D.write(ITEMS, D.empty(), "q4", "the contract says so");
  assert.equal(status(s, "q4").state, "answered");
  s = D.markZone(ITEMS, s, "q5", "0", true);
  assert.equal(status(s, "q5").state, "open");
  assert.deepEqual(s.answers.q5, { zones: { 0: true } });
  // The marks stay with the answer as it changes, and a cleared mark leaves nothing behind.
  s = D.write(ITEMS, s, "q5", "seen on a phone");
  assert.deepEqual(s.answers.q5, { zones: { 0: true }, text: "seen on a phone" });
  assert.deepEqual(D.markZone(ITEMS, D.markZone(ITEMS, D.empty(), "q5", "0", true), "q5", "0", false).answers, {});
});

test("progress counts every applicable item: decided and answered are done, deferred is not, not applicable leaves the total; choices and requests apart", () => {
  // The choices are Q1–Q3, F1 and I1; the requests are the fact Q4 and the evidence Q5.
  assert.deepEqual(D.progress(ITEMS, D.empty()), { total: 7, done: 0, open: 7, deferred: 0, choices: 5, decided: 0, requests: 2, answered: 0 });
  let s = D.choose(ITEMS, D.empty(), "q1", "revert");
  assert.deepEqual(D.progress(ITEMS, s), { total: 5, done: 1, open: 4, deferred: 0, choices: 3, decided: 1, requests: 2, answered: 0 });
  s = D.write(ITEMS, s, "q4", "yes");
  s = D.defer(ITEMS, D.choose(ITEMS, s, "i1", "take"), "i1", "next quarter");
  s = D.choose(ITEMS, s, "fF1", "leave");
  // The answered request is done but never decided: it counts among the requests, since it is no verified result; done
  // is one rule for counting and listing.
  assert.deepEqual(D.progress(ITEMS, s), { total: 5, done: 3, open: 1, deferred: 1, choices: 3, decided: 2, requests: 2, answered: 1 });
  assert.deepEqual(ITEMS.filter((i) => D.done(ITEMS, s, i.key)).map((i) => i.key), ["q1", "q4", "fF1"]);
});

test("undo takes back one action and what followed from it, and leaves a later answer to another item as it is", () => {
  // The owner keys F1, then answers I1, then undoes F1: I1 stays.
  const before = D.empty(), afterF1 = D.choose(ITEMS, before, "fF1", "fix"), later = D.choose(ITEMS, afterF1, "i1", "take");
  const undone = D.undo(ITEMS, later, "fF1", { fF1: before.answers.fF1 }, { fF1: afterF1.answers.fF1 });
  assert.deepEqual(undone.answers, { i1: { choice: "take" } });
  // Q1's variant retired Q2's answer into a draft; undoing Q1 puts both back, as they were before the key.
  const q2 = D.choose(ITEMS, D.choose(ITEMS, D.empty(), "q1", "keep"), "q2", "yes"), keys = ["q1", "q2"];
  const retired = D.choose(ITEMS, q2, "q1", "revert"), pick = (s) => Object.fromEntries(keys.map((k) => [k, s.answers[k]]));
  assert.deepEqual(status(retired, "q2"), { state: "not-applicable", draft: { choice: "yes" } });
  const back = D.undo(ITEMS, retired, "q1", pick(q2), pick(retired));
  assert.deepEqual([status(back, "q1").choice, status(back, "q2").choice], ["keep", "yes"]);
  // An action whose item has changed since is superseded: the same state comes back, and the newer answer stays.
  const changed = D.choose(ITEMS, afterF1, "fF1", "leave");
  assert.equal(D.undo(ITEMS, changed, "fF1", { fF1: undefined }, { fF1: afterF1.answers.fF1 }), changed);
});

test("an answer under a parent still open says which parent it waits for", () => {
  const s = D.choose(ITEMS, D.choose(ITEMS, D.empty(), "q2", "yes"), "q3", "a");
  assert.deepEqual([D.waitingFor(ITEMS, s, "q2"), D.waitingFor(ITEMS, s, "q3"), D.waitingFor(ITEMS, s, "q1")], ["q1", "q1", null]);
  const decided = D.choose(ITEMS, s, "q1", "keep");
  assert.deepEqual([D.waitingFor(ITEMS, decided, "q2"), D.waitingFor(ITEMS, decided, "q3")], [null, null]);
  assert.equal(D.waitingFor(ITEMS, D.choose(ITEMS, s, "q1", "revert"), "q2"), null, "a retired question waits for nothing");
});

test("one comment per line or paragraph: new text replaces it in place, empty text removes it, and storage is read defensively", () => {
  let s = D.lineComment(D.empty(), { path: "a.js", side: "head", line: 3 }, "first");
  s = D.lineComment(s, { path: "a.js", side: "base", line: 3 }, "the removed line");
  s = D.lineComment(s, { path: "a.js", side: "head", line: 3 }, " second ");
  assert.deepEqual(s.lines, [{ path: "a.js", side: "head", line: 3, text: "second" }, { path: "a.js", side: "base", line: 3, text: "the removed line" }]);
  s = D.paragraphComment(s, { item: "f1", field: "what" }, "unclear");
  s = D.paragraphComment(D.lineComment(s, { path: "a.js", side: "base", line: 3 }, ""), { item: "f1", field: "what" }, "");
  assert.deepEqual([s.lines.length, s.paragraphs.length], [1, 0]);
  assert.deepEqual(D.normalize({ answers: { q1: { choice: "keep" } }, lines: [{ path: "a", side: "left", line: 1, text: "x" }, { path: "a", side: "head", line: 2, text: "ok" }],
    paragraphs: [{ item: "q1", text: "no field" }] }), { answers: { q1: { choice: "keep" } }, lines: [{ path: "a", side: "head", line: 2, text: "ok" }], paragraphs: [] });
  for (const raw of [null, "x", [], 5]) assert.deepEqual(D.normalize(raw), D.empty());
});

test("the export is schema 6 under the record's and the diff's digests: each item's status and the answer in effect, drafts apart, comments with their anchors", () => {
  const items = D.itemsOf({ questions: [
    { id: 1, kind: "decision", variants: [{ id: "keep", text: "Keep it" }, { id: "revert", text: "Revert it" }] },
    { id: 2, kind: "decision", variants: [{ id: "yes", text: "Yes" }, { id: "no", text: "No" }], parent: { question: 1, variants: ["keep"] } },
    { id: 3, kind: "evidence" }], findings: [{ id: 1 }], ideas: [{}] });
  let s = D.choose(items, D.empty(), "q2", "yes");
  s = D.markZone(items, D.write(items, s, "q3", "seen on a phone"), "q3", "1", true);
  s = D.defer(items, D.choose(items, s, "f1", "fix"), "f1", "after the release");
  s = D.write(items, s, "i1", "only if cheap");
  s = D.lineComment(s, { path: "a.js", side: "base", line: 7 }, "why remove this?");
  s = D.paragraphComment(s, { item: "q1", field: "context.0" }, "is this still true?");
  const meta = { recordSha: "r".repeat(64), diffSha: "d".repeat(64), key: "k1", title: "A review", range: "HEAD~1..HEAD" };
  const out = D.exportOf(items, s, meta);
  assert.deepEqual({ ...out, items: undefined, lineComments: undefined, paragraphComments: undefined },
    { schema_version: 6, record_sha256: meta.recordSha, diff_sha256: meta.diffSha, key: "k1", title: "A review", range: "HEAD~1..HEAD",
      progress: { total: 5, done: 3, open: 1, deferred: 1 }, items: undefined, lineComments: undefined, paragraphComments: undefined });
  assert.deepEqual(out.items, [
    { item: "q1", kind: "decision", status: "open" },
    // Q2's answer is in effect while its parent is open, and it says so: the parent can still retire it.
    { item: "q2", kind: "decision", status: "decided", variant: { id: "yes", text: "Yes" }, waiting_for_parent: "q1" },
    { item: "q3", kind: "evidence", status: "answered", text: "seen on a phone", zones: [1] },
    { item: "f1", kind: "finding", status: "deferred", reason: "after the release", draft: { option: "fix" } },
    { item: "i1", kind: "idea", status: "decided", text: "only if cheap" }]);
  assert.deepEqual(out.lineComments, [{ path: "a.js", side: "base", line: 7, text: "why remove this?" }]);
  assert.deepEqual(out.paragraphComments, [{ item: "q1", field: "context.0", text: "is this still true?" }]);
  // A retired child travels as not applicable with its answer as a draft, and no longer waits for anything.
  const retired = D.exportOf(items, D.choose(items, s, "q1", "revert"), meta).items[1];
  assert.deepEqual(retired, { item: "q2", kind: "decision", status: "not-applicable", draft: { variant: { id: "yes", text: "Yes" } } });
  assert.doesNotMatch(JSON.stringify(out), /verified|accepted/);
});

test("the page keeps answers under a key that names the export format and the record", () => {
  assert.equal(D.schema, 6);
  assert.equal(D.storageKey("0123456789"), "review-report:6:0123456789");
});
