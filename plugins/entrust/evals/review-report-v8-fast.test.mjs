import { test } from "node:test";
import assert from "node:assert/strict";
import { decisionRuntime } from "../plugin/skills/review/scripts/decisions.mjs";
import { page } from "../plugin/skills/review/scripts/page.mjs";
import { parseDiff } from "../plugin/skills/review/scripts/diff.mjs";
import { check, modelOf } from "../plugin/skills/review/scripts/review.mjs";
import { hostileFixture } from "./review/report-fixtures.mjs";
import { annotationSha256 } from "../plugin/skills/review/scripts/annotations.mjs";
import { createHash } from "node:crypto";

test("annotation SHA-256 matches standard vectors and UTF-8", () => {
  for (const [input, expected] of [
    ["", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
    ["abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
    ["abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq", "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"]
  ]) assert.equal(annotationSha256(input), expected);
  for (const input of ["Кириллица 🌍", "\ud800", "a".repeat(1000000)]) {
    assert.equal(annotationSha256(input), createHash("sha256").update(input).digest("hex"));
  }
});

const D = decisionRuntime();
const questions = [
  { id: 1, kind: "decision", text: "Keep the archive conversion?", variants: [{ id: "keep", text: "Keep" }, { id: "move", text: "Move" }] },
  { id: 2, kind: "decision", text: "Which display widths?", parent: { question: 1, variants: ["move"] }, variants: [{ id: "wide", text: "Wide" }] },
  { id: 3, kind: "decision", text: "Who owns the contract?" },
  { id: 4, kind: "fact", text: "Who reads the archive?" },
  { id: 5, kind: "evidence", text: "Was the screen checked?" }
];
const findings = [{ id: 1 }, { id: 2 }];
const ideas = [{ id: "i1" }];
const meta = { recordSha: "record-sha", diffSha: "diff-sha", key: "review-key", title: "Example", range: "base..head" };
const output = (state) => D.exportOf(questions, state, meta);
const status = (out, id) => out.questions.find((q) => q.question === id)?.status;
const count = (state) => D.choiceStats(questions, state, findings, ideas);
const openIds = (out) => ({
  q: questions.filter((q) => q.kind === "decision" && !q.parent && status(out, q.id) === "remaining").map((q) => q.id),
  f: findings.filter((f) => !out.findings[f.id]).map((f) => f.id)
});

test("reasonless deferral stays open through whitespace, then exports the complete reason", () => {
  const state = D.empty();
  state.questions[3] = { choice: "deferred" };
  for (const reason of ["", "  \n"]) {
    state.notes.q3 = reason;
    assert.equal(D.validDefer(questions[2], state), false);
    assert.equal(count(state).q, 2);
    assert.equal(count(state).deferred, 0);
    assert.equal(status(output(state), 3), "remaining");
  }
  state.notes.q3 = "Wait for the contract owner to answer.";
  assert.equal(D.validDefer(questions[2], state), true);
  assert.equal(count(state).q, 1);
  assert.equal(count(state).deferred, 1);
  assert.equal(status(output(state), 3), "deferred");
  assert.equal(output(state).questions.find((q) => q.question === 3).comment, state.notes.q3);
  delete state.notes.q3;
  assert.equal(status(output(state), 3), "remaining");
  assert.equal(count(state).q, 2);
});

test("root Q plus F counts agree with exported remaining IDs across independent transitions", () => {
  let state = D.empty();
  const verify = (q, f) => {
    const stats = count(state), ids = openIds(output(state));
    assert.deepEqual(ids, { q, f });
    assert.equal(stats.q, q.length);
    assert.equal(stats.f, f.length);
    assert.equal(stats.remaining, q.length + f.length);
  };
  verify([1, 3], [1, 2]);
  state.findings.i1 = "apply";
  state.answers.q4 = "The reporting service.";
  verify([1, 3], [1, 2]);
  state.questions[1] = { choice: "accepted", variant: "move" };
  verify([3], [1, 2]);
  assert.equal(D.applicable(questions[1], state, questions), true);
  assert.equal(status(output(state), 2), "remaining");
  state.findings[1] = "skip";
  verify([3], [2]);
  state.questions[2] = { choice: "accepted", variant: "wide" };
  verify([3], [2]);
  state.questions[1] = { choice: "accepted", variant: "keep" };
  state = D.settle(questions, state);
  assert.equal(D.applicable(questions[1], state, questions), false);
  assert.equal(status(output(state), 2), "not-applicable");
  assert.equal(state.questions[2].choice, undefined);
  verify([3], [2]);
  delete state.questions[1];
  state = D.settle(questions, state);
  assert.equal(status(output(state), 2), "remaining");
  verify([1, 3], [2]);
});

test("unanswered fact and evidence are separate from mandatory decisions and not promoted to verification", () => {
  const state = D.empty();
  assert.equal(count(state).fact, 2);
  assert.equal(count(state).remaining, 4);
  state.answers.q4 = "   ";
  assert.equal(count(state).fact, 2);
  state.answers.q4 = "A caller reported it.";
  assert.equal(count(state).fact, 1);
  state.answers.q5 = "Not run; a screen is needed.";
  assert.equal(count(state).fact, 0);
  assert.equal(count(state).remaining, 4);
  const out = output(state);
  assert.deepEqual(out.factAnswers, state.answers);
  assert.ok(out.questions.every((q) => q.question !== 4 && q.question !== 5));
  assert.equal(JSON.stringify(out).includes("verified"), false);
});

test("two dependent decisions change independently without entering the root Q+F count", () => {
  const qs = [...questions, { id: 6, kind: "decision", text: "Which height?",
    parent: { question: 1, variants: ["move"] }, variants: [{ id: "tall", text: "Tall" }] }];
  const state = D.empty();
  state.questions[1] = { choice: "accepted", variant: "move" };
  const pending = () => qs.filter((q) => q.parent && D.applicable(q, state, qs)
    && !D.validAccept(q, state) && !D.validDefer(q, state)).map((q) => q.id);
  const exported = () => D.exportOf(qs, state, meta);
  const rootCount = () => D.choiceStats(qs, state, findings, ideas).remaining;
  assert.deepEqual(pending(), [2, 6]);
  assert.deepEqual([status(exported(), 2), status(exported(), 6)], ["remaining", "remaining"]);
  assert.equal(rootCount(), 3);
  state.questions[2] = { choice: "accepted", variant: "wide" };
  assert.deepEqual(pending(), [6]);
  assert.deepEqual([status(exported(), 2), status(exported(), 6)], ["accepted", "remaining"]);
  assert.equal(rootCount(), 3);
  state.questions[6] = { choice: "deferred" };
  assert.deepEqual(pending(), [6]);
  state.notes.q6 = "Wait for measurements.";
  assert.deepEqual(pending(), []);
  assert.equal(status(exported(), 6), "deferred");
  assert.equal(rootCount(), 3);
  state.questions[1] = { choice: "accepted", variant: "keep" };
  assert.deepEqual(pending(), []);
  assert.deepEqual([status(exported(), 2), status(exported(), 6)], ["not-applicable", "not-applicable"]);
  assert.equal(rootCount(), 3);
});

test("schema 5 export retains revision metadata and annotations without fabricating a source", () => {
  const state = D.empty();
  state.notes.b1 = "Investigate this block.";
  state.zones["5-0"] = true;
  state.passages.push({ id: "p1", text: "source excerpt", comment: "A note." });
  const out = output(state);
  assert.equal(out.schema_version, 5);
  assert.equal(out.record_sha256, meta.recordSha);
  assert.equal(out.diff_sha256, meta.diffSha);
  assert.equal(out.range, meta.range);
  assert.deepEqual(out.notes, state.notes);
  assert.deepEqual(out.zones, state.zones);
  assert.deepEqual(out.passages, state.passages);
  const unknown = D.exportOf(questions, state, {});
  assert.equal(unknown.record_sha256, undefined);
  assert.equal(unknown.diff_sha256, undefined);
  assert.equal(unknown.range, undefined);
});

function rendered(language = "en", change = () => {}) {
  const { diff, record } = hostileFixture();
  record.language = language;
  record.labels = {};
  record.questions = [{ at: "docs/billing.md", text: "Which currency code should the archive display?", kind: "decision", resolver: "owner",
    variants: [{ id: "upper", text: "Uppercase" }, { id: "raw", text: "Raw" }] }];
  record.blocks[0].questions = [1];
  change(record);
  const files = parseDiff(diff);
  const { owner, errors } = check(record, files, ".");
  assert.deepEqual(errors, [], "render fixture must be a valid review");
  const model = modelOf(record, files, owner, ".");
  return { html: page(record, files, model), record, model };
}

test("static main counter identifies the Q+F scope and excludes child, fact and idea", () => {
  const { html } = rendered("en", (r) => {
    r.questions.push(
      { at: "docs/width.md", text: "Which widths?", kind: "decision", parent: { question: 1, variants: ["upper"] },
        variants: [{ id: "wide", text: "Wide" }] },
      { at: "docs/readers.md", text: "Who reads it?", kind: "fact" }
    );
    r.findings.push({ id: 1, title: "Missing test", direction: "tests", evidence: "read", at: "test/a.js:1",
      what: "The empty code is untested.", shown_by: "The test list.", fix: "Add a test.", untested: [1] });
    r.ideas = [{ title: "Optional cache", at: "src/a.js:1", text: "Could avoid repeated reads." }];
  });
  const counter = html.match(/<[^>]+\bid="count-decisions"[^>]*>[\s\S]*?<\/[^>]+>/)?.[0];
  assert.ok(counter, "main counter missing");
  assert.match(counter, />\s*(?:[^<]*\b2\b[^<]*)</, "one root Q + one F");
  assert.match(counter, /(?:Q\s*\+\s*F|(?:decision|question)[\s\S]*(?:finding)|(?:finding)[\s\S]*(?:decision|question))/i,
    "counter must name its Q+F scope");
  for (const [kind, expected] of [["q", 1], ["f", 1], ["fact", 1], ["i", 1]]) {
    const badge = html.match(new RegExp(`<[^>]+data-cf-count="${kind}"[^>]*>\\s*(\\d+)\\s*</`));
    assert.equal(Number(badge?.[1]), expected, `${kind} badge`);
  }
});

test("question heading gives its actual subject, not only the decision type", () => {
  const { html, record } = rendered();
  const card = html.match(/<div class="qcard[^"]*" id="q1"[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/);
  assert.ok(card, "Q1 heading missing");
  assert.match(card[1], /currency code|archive display/i, `heading should identify: ${record.questions[0].text}`);
});

for (const language of ["en", "ru"]) {
  test(`rendered document declares ${language} as its reader language`, () => {
    const { html } = rendered(language);
    assert.ok(new RegExp(`<html\\b[^>]*\\blang=["']${language}(?:-[^"']+)?["']`, "i").test(html), `missing <html lang="${language}">`);
  });
}

test("render preserves Q, B and annotation anchors and recorded passport revisions", () => {
  const { html, record } = rendered();
  for (const id of ["q1", "b1", "annotation-editor", "annotation-status"]) {
    assert.equal((html.match(new RegExp(`\\bid="${id}"`, "g")) || []).length, 1, id);
  }
  for (const value of [record.passport.repository, record.passport.base, record.passport.head]) {
    // Apostrophes can be HTML-escaped; the embedded data carries the original revision verbatim.
    assert.ok(html.includes(value.replaceAll("'", "&#39;")) || html.includes(value), value);
  }
  const data = JSON.parse(html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(data.pr.base, record.passport.base);
  assert.equal(data.pr.head, record.passport.head);
  assert.equal(data.pr.url, record.passport.links[0].url);
});

test("file tree describes the search as a filename or path search", () => {
  const { html } = rendered();
  const input = html.match(/<input\b[^>]*\bid="tree-filter-input"[^>]*>/)?.[0];
  assert.ok(input, "file search missing");
  assert.match(input, /(?:file|path|имени файла|путь)/i, input);
});
