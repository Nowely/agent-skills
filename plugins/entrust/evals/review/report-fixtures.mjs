// The records the review suites render: one minimal review of the currency-contract case, one themed record with
// the decision-card fields on the same diff, and a record whose texts try to become markup. One source, so the
// suites never drift apart.
import { createHash } from "node:crypto";

// A review of that case's diff: three changed lines in one file, and two new test files.
export function reportFixtures(diffSha) {
  const REVIEW = {
    title: "Upper-case <currency> codes", range: "HEAD~1..HEAD",
    diff: { file: "source.diff", sha256: diffSha },
    change: { goal: "Show currency codes in upper case.", parts: ["The archive reader converts the code."], sources: ["brief.md"] },
    verdict: "The change does its task.\n- One test is missing.", now: "The archive reader converts the code.", target: "The change is already this.", recommendation: "Accept it.",
    steps: [{ text: "Add the test.", findings: [1] }],
    requirements: [{ id: 1, text: "Upper case wherever a price is shown.", source: "task", met: "read", not_checked: "How the list draws it.",
        sources: [{ at: "TASK-9", quote: "Show currency codes in upper case wherever a price is shown." }] },
      { id: 2, text: "A requirement nothing serves.", source: "discussion", doubt: "The contract says otherwise.", sources: [{ at: "TASK-9 discussion", quote: "Keep this one too." }] },
      { id: 3, text: "A requirement that fails.", source: "assumption", sources: [{ at: "TASK-9", quote: "wherever a price is shown" }] }],
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
    routes: [{ title: "An archived invoice shows its currency in upper case", requirements: [1],
      steps: [{ block: 1, role: "Converts the code while it reads each row." }, { block: 3, role: "Checks the three outputs of the conversion.", via: "readArchive's return, test/outputs.test.js:3" }] }],
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
    r.requirements.push({ id: 4, text: "The contract may change outside legacy.", source: "discussion", permission: true, sources: [{ at: "TASK-9 discussion", quote: "the contract may change outside legacy" }] });
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
        variants: [{ id: "narrow", text: "Narrow cards only", consequences: [{ text: "Less to check.", sources: [{ ref: "/questions/0" }] }] },
          { id: "every", text: "Every width", consequences: [{ text: "Each width needs its own check.", sources: [{ ref: "/questions/0" }] }] }],
        recommendation: { text: "No clear recommendation: narrow cards only, unless the list is shown wide.", sources: [{ ref: "/questions/0" }] } },
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

// A diff and record whose path and PR URL carry apostrophes and handler-injection attempts: an apostrophe is legal
// in a diff path, so the page must keep every such value text, never markup.
export const HOSTILE_PATH = "src/x' onmouseover='alert(1).js";
const HOSTILE_URL = "https://example.com/pr' onmouseover='alert(1)";
export function hostileFixture() {
  const diff = `diff --git a/${HOSTILE_PATH} b/${HOSTILE_PATH}\n--- a/${HOSTILE_PATH}\n+++ b/${HOSTILE_PATH}\n@@ -1 +1 @@\n-const old = 1;\n+const x = 2;\n`;
  const record = {
    title: "Hostile <source>", range: "HEAD~1..HEAD",
    diff: { file: "source.diff", sha256: createHash("sha256").update(diff).digest("hex") },
    change: { goal: "A goal.", parts: ["A part."], sources: ["brief.md"] },
    verdict: "A verdict.", now: "Now.", target: "Target.", recommendation: "Accept.",
    requirements: [{ id: 1, text: "A requirement.", source: "task", met: "read", sources: [{ at: "TASK-1", quote: "a requirement" }] }],
    findings: [],
    blocks: [{ path: HOSTILE_PATH, added: "1", removed: "1", does: "d'oes", serves: [1], questions: [1], verdict: "keep" }],
    questions: [{ at: "docs/billing.md", text: "q'<img src=x onerror=alert(1)>", kind: "fact" }],
    coverage: "What was read.",
    passport: { links: [{ kind: "pr", label: "PR' 1", url: HOSTILE_URL }], repository: "example/repo", base: "b'1", head: "h'1", reviewedAt: "2026-01-01" },
    language: "ru",
  };
  return { diff, record };
}

// A value that breaks out of an attribute and opens an element wherever it reaches the page unescaped; what follows
// the handler closes at the attribute's own closing quote, so the element it lands on survives to be seen.
export const HOSTILE = `h'" onmouseover="alert(1)" data-x="<x-pwn>`;
// The themed record with every value it names things by made hostile: requirement, scenario and variant ids, unit,
// mechanism and screen names, an external source; the requirement and scenario ids also hold the separators the page
// cuts its keys at («:», «/», «.»). An idea, a question and a block carry an `id` of their own, which the page must not
// use, since their numbers are their places. Finding ids stay what the check allows (letters, digits, "_" and "-"),
// and a file path cannot carry a double quote in a supported diff: the hostile fixture's path covers it.
export function hostileThemed(themed) {
  const r = structuredClone(themed), H = HOSTILE;
  const req = new Map(r.requirements.map((x) => [x.id, `${H}r:a/b.${x.id}`])), reqs = (list) => list?.map((id) => req.get(id) ?? id);
  r.requirements.forEach((x) => { x.id = req.get(x.id); });
  // four more blocks serve the first requirement, so its panel lists more than it shows
  r.blocks[2].added = "1-9";
  r.blocks.push(...["10-11", "12", "13"].map((added) => ({ path: "test/outputs.test.js", added, does: "Tests an output.", serves: [r.requirements[0].id], verdict: "keep" })));
  r.blocks.forEach((b) => { b.serves = reqs(b.serves); });
  r.findings.forEach((f) => { f.breaks = reqs(f.breaks); f.untested = reqs(f.untested); });
  r.checks.forEach((c) => { c.requirements = reqs(c.requirements); });
  r.routes.forEach((x) => { x.requirements = reqs(x.requirements); x.title = `A route ${H}`; x.steps[1].via = `the return ${H}`; });
  const unit = (name) => `${H}${name}`;
  for (const list of [r.units, r.target_units]) list.forEach((u) => { u.name = unit(u.name); u.uses = u.uses?.map(unit); });
  r.blocks.forEach((b) => { if (b.unit) b.unit = unit(b.unit); });
  r.mechanisms = [{ name: `Normalization ${H}`, change: "reused", units: [r.units[0].name], purpose: `Consistent ${H}.`, basis: "Requirement 1.",
    benefit: "Readable codes.", cost: "No extra state.", decision: "Keep it.", evidence: "judgment", findings: [1], blocks: [1] }];
  r.blocks[0].kind = "code";
  const scen = new Map(r.scenarios.map((x) => [x.id, `${H}s:a/b.${x.id}`]));
  r.scenarios.forEach((x) => { x.id = scen.get(x.id); x.requirements = reqs(x.requirements); });
  r.findings.forEach((f) => { if (f.scenarios) f.scenarios = f.scenarios.map((id) => scen.get(id) ?? id); });
  r.findings[0].scenarios = [r.scenarios[0].id];
  for (const q of r.questions) {
    const variant = new Map((q.variants ?? []).map((v) => [v.id, `${H}${v.id}`]));
    q.variants?.forEach((v) => { v.id = variant.get(v.id); });
    if (q.recommendation?.variant) q.recommendation.variant = variant.get(q.recommendation.variant);
    for (const child of r.questions.filter((x) => x.parent && r.questions[x.parent.question - 1] === q)) child.parent.variants = child.parent.variants.map((id) => variant.get(id));
  }
  r.questions[2].context.push({ text: "Read elsewhere.", sources: [{ at: `docs/${H}.md:1`, quote: H }, { ref: "/scenarios/0" }, { ref: "/units/0" }] });
  r.screens.forEach((x) => { x.name += H; });
  r.ideas[0].id = H; r.questions[0].id = H; r.blocks[1].id = H;
  return r;
}

