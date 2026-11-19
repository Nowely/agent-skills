// The records the report suite and the browser acceptance render: one minimal review of the currency-contract
// case, one themed record with the decision-card fields on the same diff, and the enrichment of a copy of the
// real 65507 record from the approved prototype's annotations. One source, so the two never drift apart.
import { createHash } from "node:crypto";

// A review of that case's diff: three changed lines in one file, and two new test files.
export function reportFixtures(diffSha) {
  const REVIEW = {
    title: "Upper-case <currency> codes", range: "HEAD~1..HEAD",
    diff: { file: "source.diff", sha256: diffSha },
    change: { goal: "Show currency codes in upper case.", parts: ["The archive reader converts the code."], sources: ["brief.md"] },
    verdict: "The change does its task.\n- One test is missing.", now: "The archive reader converts the code.", target: "The change is already this.", recommendation: "Accept it.",
    steps: [{ text: "Add the test.", findings: [1] }],
    requirements: [{ id: 1, text: "Upper case wherever a price is shown.", source: "task", met: "read", not_checked: "How the list draws it." },
      { id: 2, text: "A requirement nothing serves.", source: "discussion", doubt: "The contract says otherwise." },
      { id: 3, text: "A requirement that fails.", source: "assumption" }],
    findings: [{ id: 1, title: "A finding", direction: "tests", evidence: "read", at: "test/archive.test.js:5", what: "What happens.", shown_by: "The regression that passes.", fix: "The fix.", untested: [1] },
      { id: 2, title: "A defect", direction: "behavior", evidence: "read", at: "src/invoices/archive.js:2", what: "What breaks.", shown_by: "The caller at `src/main.js:4`.", fix: "The fix.", breaks: [3] }],
    checks: [{ from: "An invoice in the archive.", do: ["Open the list.", "Find the invoice."], expect: "Its currency is in upper case.", requirements: [1] }],
    ideas: [{ title: "An idea", at: "src/invoices/archive.js:2", text: "What it gains." }],
    screens: [{ name: "The list", mockup: "https://design.example/list", before: "before.png", after: "after.png",
      differences: [{ what: "A difference.", why: "The task says so." }, { what: "Another.", finding: 1 }], missing: "The empty state." },
      { name: "The page", missing: "No picture was given." }],
    scenarios: [{ id: 1, change: "Another <code> format is read.", requirements: [1], now: { edit: ["src/invoices/archive.js: readArchive"], read: ["src/invoices/archive.js: the row loop"] },
      target: { edit: ["src/invoices/upper.js: upper"], read: [] } }],
    units: [{ name: "readArchive", jobs: ["reads the archive"], uses: ["rows"], verdict: "keep", reason: "One job, read whole at a glance." }, { name: "rows", existing: true, jobs: ["holds the rows"] }],
    target_units: [{ name: "readArchive", jobs: ["reads the archive"], uses: ["upper"] }, { name: "upper", jobs: ["a unit to write"] }],
    blocks: [
      { path: "src/invoices/archive.js", added: "2, 4", removed: "3", unit: "readArchive", does: "Converts the code.", serves: [1], verdict: "keep" },
      { path: "test/archive.test.js", added: "1-8", does: "Tests it.", serves: [1], verdict: "fix", findings: [1] },
      { path: "test/outputs.test.js", added: "1-13", does: "Tests the three outputs.", serves: [1], verdict: "keep" },
    ],
    challenges: [{ from: "critic", point: "The reader should not convert.", outcome: "rejected", at: "src/main.js:4", note: "The caller prints the code as read." },
      { from: "target", point: "The independent target converts where prices are shown.", outcome: "owner", note: "Which unit owns display is the owner's call." },
      { from: "verifier", point: "Line 2 is not the conversion.", outcome: "accepted", note: "The finding's place was corrected." }],
    questions: [{ at: "docs/billing.md", text: "A question.", kind: "fact" }], coverage: "What was read.",
  };
  // A second record on the same diff, of another theme and order: evidence first, a fact, then a decision whose
  // child applies under one variant; two evidence questions, variants with no "base", a permission, a tradeoff.
  const THEMED = (() => {
    const r = structuredClone(REVIEW);
    r.title = "Where the conversion lives";
    r.requirements.push({ id: 4, text: "The contract may change outside legacy.", source: "discussion", permission: true });
    r.questions = [
      { at: "src/invoices/archive.js:2", text: "What does the contract guarantee for empty codes?", kind: "evidence",
        zones: [{ text: "empty input", sources: [{ ref: "/requirements/0" }] }] },
      { at: "src/main.js:4", text: "Who consumes the converted code?", kind: "fact", resolver: "author" },
      { at: "src/invoices/archive.js:4", text: "Keep the conversion in the reader or move it to display?", kind: "decision", resolver: "owner",
        context: [{ text: "The reader converts today.", sources: [{ ref: "/blocks/0" }] }],
        variants: [
          { id: "status-quo", text: "Keep the conversion in the reader", consequences: [{ text: "No new unit; the display stays simple.", sources: [{ ref: "/requirements/0" }] }] },
          { id: "extend", text: "Move it to a display unit", consequences: [{ text: "A unit to write; the reader stays raw.", sources: [{ ref: "/target_units/1" }] }] }],
        recommendation: { text: "Keep it in this change.", variant: "status-quo", sources: [{ ref: "/requirements/0" }] },
        remainingEvidence: [1, 5] },
      { at: "src/invoices/upper.js:1", text: "Which widths should the display unit cover?", kind: "decision", resolver: "owner",
        parent: { question: 3, variants: ["extend"] },
        variants: [{ id: "narrow", text: "Narrow cards only", consequences: [{ text: "Less to check.", sources: [{ ref: "/questions/0" }] }] }] },
      { at: "test/archive.test.js:5", text: "The visual check of the list was not run.", kind: "evidence" },
    ];
    r.blocks[2] = { ...r.blocks[2], verdict: "question", questions: [1, 5], unit: "readArchive" };
    r.tradeoffs = [{ text: "Legacy keeps the old path.", consequence: "External consumers of it are unknown.", sources: [{ ref: "/requirements/3" }] }];
    r.coverageStructured = [
      { kind: "ran", text: "The suite ran on the working copy.", revision: "head", sources: [{ at: "test/archive.test.js:5", quote: "assert upper" }] },
      { kind: "not_checked", text: "The list was not seen on screen.", sources: [{ ref: "/questions/4" }] }];
    r.passport = { links: [{ kind: "task", label: "TASK-9", url: "https://tracker.example/TASK-9" }], repository: "example/repo", base: "HEAD~1", head: "HEAD", reviewedAt: "2026-01-01" };
    r.screens[1] = { ...r.screens[1], historical: true, revision: "abc123", sources: [{ ref: "/coverageStructured/1" }] };
    return r;
  })();
  return { REVIEW, THEMED };
}

// A diff and record whose path, PR URL and labels carry apostrophes and handler-injection attempts: an
// apostrophe is legal in a diff path, so the popover must keep every such value text, never markup.
export const HOSTILE_PATH = "src/x' onmouseover='alert(1).js";
export const HOSTILE_URL = "https://example.com/pr' onmouseover='alert(1)";
export function hostileFixture() {
  const diff = `diff --git a/${HOSTILE_PATH} b/${HOSTILE_PATH}\n--- a/${HOSTILE_PATH}\n+++ b/${HOSTILE_PATH}\n@@ -1 +1 @@\n-const old = 1;\n+const x = 2;\n`;
  const record = {
    title: "Hostile <source>", range: "HEAD~1..HEAD",
    diff: { file: "source.diff", sha256: createHash("sha256").update(diff).digest("hex") },
    change: { goal: "A goal.", parts: ["A part."], sources: ["brief.md"] },
    verdict: "A verdict.", now: "Now.", target: "Target.", recommendation: "Accept.",
    requirements: [{ id: 1, text: "A requirement.", source: "task", met: "read" }],
    findings: [],
    blocks: [{ path: HOSTILE_PATH, added: "1", removed: "1", does: "d'oes", serves: [1], questions: [1], verdict: "keep" }],
    questions: [{ at: "docs/billing.md", text: "q'<img src=x onerror=alert(1)>", kind: "fact" }],
    coverage: "What was read.",
    passport: { links: [{ kind: "pr", label: "PR' 1", url: HOSTILE_URL }], repository: "example/repo", base: "b'1", head: "h'1", reviewedAt: "2026-01-01" },
    language: "ru", labels: { "seg.added-line": "Добавлено' onmouseover='alert(1)", "seg.copy-source": "копировать' <img src=x onerror=alert(1)>", "note-block": "Заметка' onmouseover='alert(1)" },
  };
  return { diff, record };
}

// A diff for the Shiki acceptance: a comment that opens on a context line and closes after the removed line
// (the removed line must carry the comment color), and non-adjacent hunks whose open construct must not
// color the next hunk across the skipped code. ctl.js tokenizes the same lines alone, as the control.
export function shikiFixture() {
  const diff = [
    "diff --git a/cmt.js b/cmt.js", "--- a/cmt.js", "+++ b/cmt.js", "@@ -1,3 +1,3 @@",
    " /* begin", "-inside comment", "+inside comment v2", " */",
    "diff --git a/gap.js b/gap.js", "--- a/gap.js", "+++ b/gap.js", "@@ -1,2 +1,2 @@",
    " /* open", "-inside", "+inside v2", "@@ -6 +6 @@", "-const c = 3;", "+const c = 4;",
    "diff --git a/ctl.js b/ctl.js", "--- a/ctl.js", "+++ b/ctl.js", "@@ -1 +1 @@",
    "-const c = 3;", "+const c = 4;", "",
  ].join("\n");
  const record = {
    title: "Shiki sequences", range: "HEAD~1..HEAD",
    diff: { file: "source.diff", sha256: createHash("sha256").update(diff).digest("hex") },
    change: { goal: "A goal.", parts: ["A part."], sources: ["brief.md"] },
    verdict: "A verdict.", now: "Now.", target: "Target.", recommendation: "Accept.",
    requirements: [{ id: 1, text: "A requirement.", source: "task", met: "read" }],
    findings: [],
    blocks: [
      { path: "cmt.js", added: "2", removed: "2", does: "A comment.", serves: [1], verdict: "keep" },
      { path: "gap.js", added: "2, 6", removed: "2, 6", does: "Two hunks.", serves: [1], verdict: "keep" },
      { path: "ctl.js", added: "1", removed: "1", does: "The control.", serves: [1], verdict: "keep" },
    ],
    questions: [], coverage: "What was read.",
  };
  return { diff, record };
}

// The new fields on a COPY of the real 65507 record, taking the approved prototype's annotations as the example
// content: kinds from what each question asks, children declared through parent, cards from the decisionCards.
// The immutable original carries none of this: the cards, recommendations, tradeoffs and coverage limits below
// are the enrichment's, and the acceptance numbers describe the rendered copy, not the original record. The
// blocks and the diff are the original's own — the enrichment does not touch them.
export function enrich65507(review, ann) {
  const KIND = { owner: "decision", requirement: "decision", coverage: "evidence", check: "evidence", contract: "fact" };
  const sourceOfAnn = (s) => {
    const q = /^record\.questions\[(\d+)\]$/.exec(s);
    if (q) return { ref: `/questions/${+q[1] - 1}` };
    const m = /^mechanism «(.+)»$/.exec(s);
    if (m) { const i = review.mechanisms.findIndex((x) => x.name === m[1]); if (i >= 0) return { ref: `/mechanisms/${i}` }; }
    return { at: s };
  };
  review.questions = review.questions.map((q, i) => {
    const aq = ann.questions[i], card = ann.decisionCards[String(i + 1)] ?? {};
    const sources = (card.sources ?? []).map(sourceOfAnn);
    const out = { ...q, kind: KIND[aq.kind] ?? "fact", resolver: aq.resolver };
    if (card.context?.length) out.context = card.context.map((text) => ({ text, sources }));
    if (card.options?.length) out.variants = card.options.map((o) => ({ id: o.value, text: o.label, consequences: [{ text: o.consequences, sources }] }));
    if (card.recommendation) out.recommendation = { text: `${card.recommendation.text} ${card.recommendation.basis ?? ""}`.trim(), sources, ...(i === 0 ? { variant: "keep-mockup" } : {}) };
    const evidence = [...new Set((card.remainingEvidence ?? []).flatMap((s) => [...s.matchAll(/Q(\d+)/g)].map((m) => +m[1])))]
      .filter((n) => n !== i + 1 && KIND[ann.questions[n - 1]?.kind] === "evidence");
    if (evidence.length) out.remainingEvidence = evidence;
    if (card.zones?.length) out.zones = card.zones.map((text) => ({ text, sources }));
    if (aq.parent) out.parent = { question: aq.parent, variants: ["keep"] };
    return out;
  });
  review.requirements.find((r) => r.id === 9).permission = true;
  const p = ann.passport;
  review.passport = { links: [{ kind: "task", label: p.task, url: p.taskUrl }, { kind: "pr", label: `PR ${p.pr}`, url: p.prUrl }, { kind: "figma", label: p.figmaLabel ?? "Figma", url: p.figma }],
    repository: p.repo, base: p.base, head: p.merge, reviewedAt: p.date };
  const cs = ann.coverageStructured;
  review.coverageStructured = [
    ...cs.ran.map((r) => ({ kind: "ran", text: `${r.what}: ${r.result}`, revision: r.revision, sources: [{ at: r.log }] })),
    ...cs.read.map((text) => ({ kind: "read", text, sources: [{ at: "coverage" }] })),
    ...cs.notChecked.map((text) => ({ kind: "not_checked", text, sources: [{ at: "coverage" }] }))];
  review.tradeoffs = ann.tradeoffs.map((x) => ({ text: `${x.title}. ${x.decision}`, consequence: x.residual, sources: x.source.split(";").map((s) => ({ at: s.trim() })) }));
  review.screens = review.screens.map((s) => ({ ...s, historical: true, revision: "HEAD 6e669ac / merge d8ee903", sources: [{ at: "snapshots" }] }));
  review.target = ann.targetSummary.items.map((s) => `- ${s}`).join("\n");
  return review;
}
