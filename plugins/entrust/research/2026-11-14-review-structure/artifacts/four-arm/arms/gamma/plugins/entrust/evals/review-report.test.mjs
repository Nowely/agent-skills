#!/usr/bin/env node
// Does the review skill's report script hold a review to its diff? Runs plugin/skills/review/scripts/report.mjs
// on one prepared case with a review written here; it calls no model. It checks that a complete review becomes
// a page that loads nothing from elsewhere and a printout in the shape SKILL.md gives the report, and that an
// incomplete complete-map is refused, and focused gaps stay explicit. Run it after an edit to those scripts, to
// references/report-data.md, references/interactive-report.md or to the report's shape in SKILL.md.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { ROOT, registry, runCases, summarize, tempDir } from "./lib/harness.mjs";
import { prepare } from "./review/prepare.mjs";
import { CATALOGS, LABELS, labelsOf } from "../plugin/skills/review/scripts/labels.mjs";
import { check, modelOf, weightOverview, DIRECTIONS, EVIDENCE, SOURCES, UNIT_VERDICTS, VERDICTS } from "../plugin/skills/review/scripts/review.mjs";
import { page as drawPage } from "../plugin/skills/review/scripts/page.mjs";

const { cases: TESTS, test } = registry();
const SKILL = path.join(ROOT, "skills", "review"), SCRIPT = path.join(SKILL, "scripts", "report.mjs");
const { run } = prepare("currency-contract", "clean"), repo = path.join(run, "repo");
const data = path.join(run, "review.json"), html = path.join(run, "review.html");

// A review of that case's diff: three changed lines in one file, and two new test files.
const REVIEW = {
  title: "Upper-case <currency> codes", range: "HEAD~1..HEAD",
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
  questions: [{ at: "docs/billing.md", text: "A question." }], coverage: "What was read.",
};
// The two pictures that review names, beside its data: one pixel each.
for (const name of ["before.png", "after.png"])
  fs.writeFileSync(path.join(run, name), Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64"));
const report = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: repo, encoding: "utf8" });
// The review with one part replaced, rendered: `change` gets a copy to alter.
const render = (change = () => {}) => {
  const review = structuredClone(REVIEW);
  change(review);
  fs.rmSync(html, { force: true });
  fs.writeFileSync(data, JSON.stringify(review));
  return report("render", data);
};

test("interactive report embeds a complete annotation runtime and keeps navigation ahead of content",
  "new reports must include the shared annotation controller, without relying on a patched HTML artifact",
  () => {
    const result = render((r) => { r.mechanisms = [{ name: "Reader", change: "reused", purpose: "Read", basis: "Existing code", benefit: "Reuse", cost: "None added", decision: "Keep it", evidence: "read" }]; });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    if (!script) return "missing runtime";
    new vm.Script(script);
    return page.indexOf('<nav>') < page.indexOf('<section id="summary"')
      && page.includes('id="annotation-editor"') && page.includes('data-annotation-action="cancel"')
      && page.includes('id="m1"') && page.includes('role="status"')
      || "missing contextual editor, source anchor, navigation or status region";
  });

test("lines prints every changed line under its file, with the address a block names it by",
  "a reviewer who computes line numbers from hunk headers gets them wrong; the listing is where blocks take them from",
  () => {
    const { stdout, status } = report("lines", "HEAD~1..HEAD");
    const archive = stdout.split("test/archive.test.js")[0];
    return status === 0 && archive.startsWith("src/invoices/archive.js\n") && ["+2", "-3", "+4"].every((a) => archive.includes(`\n  ${a} `))
      && stdout.includes("\n  +8 ") || `unexpected listing:\n${stdout}`;
  });

test("a complete review becomes one page that loads nothing from elsewhere and treats every text as text",
  "the page shows private code: a script or stylesheet fetched from a host, or a title run as markup, is a leak or an injection",
  () => {
    const { status, stderr } = render();
    if (status !== 0) return `render failed: ${stderr}`;
    const page = fs.readFileSync(html, "utf8");
    // A link the reader may follow is not a load: the only address on the page is the mockup's.
    const outside = page.match(/\bsrc="(?!data:)[^"]*"|<link\b|@import|url\(/) ?? page.match(/href="(?!#|https:\/\/design\.example\/list")[^"]*"/);
    if (outside) return `the page reaches outside itself: ${outside[0]}`;
    if ((page.match(/src="data:image\/png;base64,/g) ?? []).length !== 2) return "the two pictures given as files are not in the page";
    if (page.includes("<currency>") || !page.includes("&lt;currency&gt;")) return "the title reached the page unescaped";
    if (page.includes("HEAD~1..HEAD</span></header>")) return "the range is in the page's header";
    return (page.match(/<svg /g) ?? []).length === 2 && page.includes('class="t-k"') && page.includes('id="b1"') && page.includes('id="i1"')
      && [">Task<", ">Verdict<", ">How it works now<", ">Target solution<", ">Recommendations<", "<li>One test is missing.</li>", 'id="files"', '<ol class="steps">', 'id="comment"'].every((part) => page.includes(part))
      || "the page lacks a diagram per structure, highlighted code, a block anchor, the idea, a part of the summary, the verdict's list, the steps, the file tree or the button that comments on a selection";
  });

test("a requirement is met only on the reviewer's word, a missing test is not a failure, and a screen nobody compared says so",
  "a page that reads \"met\" off a block, turns a test gap into a failure or shows an uncompared screen as matching misleads whoever decides by it",
  () => {
    if (render().status !== 0) return "render failed";
    const page = fs.readFileSync(html, "utf8"), rows = page.split('id="requirements"')[1].split("</table>")[0].split("<tr").slice(2);
    const has = (row, ...words) => words.every((word) => row.includes(`>${word}<`));
    if (!has(rows[0], "met", "no test", "task", "not checked", "How the list draws it.") || has(rows[0], "fails") || rows[0].split("How the list")[0].includes("Upper case wherever a price is shown. "))
      return "requirement 1, read and untested with a part not checked, is not shown as met with no test and that part apart from its text";
    if (!has(rows[1], "not checked", "discussion") || !rows[1].includes("To reconsider") || has(rows[1], "met")) return "requirement 2, unchecked and doubted, is not shown so";
    if (!has(rows[2], "fails", "assumption") || has(rows[2], "met")) return "requirement 3, broken by a finding, is not shown as failing";
    const [, list, alone] = page.split('id="screens"')[1].split('<article class="finding"');
    if (!alone.includes(">Not compared<") || alone.includes("Matches the mockup") || list.includes("Matches the mockup")) return "a screen with no match claimed is not shown as not compared";
    const matched = render((r) => { r.screens[0] = { name: "The list", mockup: "https://design.example/list", after: "after.png", match: true }; });
    return matched.status === 0 && fs.readFileSync(html, "utf8").includes("Matches the mockup") || "a screen said to match is not shown as matching";
  });

test("two reviews of one change keep their decisions apart, and one review rendered twice keeps them together",
  "decisions stored under the title and the range of one review were applied to another review of the same change",
  () => {
    const key = () => JSON.parse(/<script id="data" type="application\/json">(.*?)<\/script>/s.exec(fs.readFileSync(html, "utf8"))[1]).key;
    render(); const first = key();
    render(); const again = key();
    render((r) => { r.findings[1].title = "Another defect"; });
    return first === again && first !== key() || "the page's name for its decisions does not follow the review's content";
  });

test("a review carries the report's words in its reader's language, and a word the report does not have is refused",
  "the reader of a report is the user, in the user's language; a mistyped label must not pass as a translation",
  () => {
    const translated = render((r) => { r.labels = { "recommendation": "Что делать", "met": "выполнено", "findings": "Находки", "decided": "Решено: {n}" }; });
    if (translated.status !== 0) return `refused: ${translated.stderr}`;
    const page = fs.readFileSync(html, "utf8");
    if (![">Что делать<", ">выполнено<", "Решено: {n}"].every((word) => page.includes(word)) || !translated.stdout.includes("## Находки")) return "the review's own words are not on the page and in the printout";
    const { status, stdout } = report("labels");
    if (status !== 0 || Object.keys(JSON.parse(stdout)).join() !== Object.keys(LABELS).join()) return "labels does not print the report's words";
    for (const [labels, fault] of [[{ "no-such": "x" }, 'which is no label of the report'], [{ decided: "Решено" }, 'label "decided" has lost its {n}'], [{ met: "" }, 'label "met" has no wording']]) {
      const { status: refused, stderr } = render((r) => { r.labels = labels; });
      if (refused !== 1 || !stderr.includes(fault)) return `expected "${fault}", got status ${refused}: ${stderr}`;
    }
    return true;
  });

test("the printout presents the verdict, current solution, target and recommendations in that order",
  "a conclusion without a distinguishable current and target solution hides what the recommendation changes",
  () => {
    const out = render().stdout, labels = ["## Verdict", "How it works now:", "Target solution:", "Recommendations:"];
    const positions = labels.map((label) => out.indexOf(label));
    return positions.every((pos, i) => pos >= 0 && (i === 0 || pos > positions[i - 1])) || "summary order differs";
  });

test("check validates without rendering or changing the canonical record; delayed rendering keeps it unchanged",
  "the review must exist before a request for HTML, and rendering must not reconstruct its analysis",
  () => {
    render(); fs.rmSync(html);
    const before = fs.readFileSync(data);
    const checked = report("check", data);
    if (checked.status !== 0 || fs.existsSync(html) || !before.equals(fs.readFileSync(data))) return `check mutated artifacts: ${checked.stderr}`;
    const drawn = report("render", data), first = fs.readFileSync(html);
    const again = report("render", data);
    if (drawn.status || again.status || !before.equals(fs.readFileSync(data)) || !first.equals(fs.readFileSync(html))) return "delayed rendering is not byte-stable";
    const bad = JSON.parse(before); bad.blocks.pop(); fs.writeFileSync(data, JSON.stringify(bad)); fs.rmSync(html);
    const rejected = report("check", data);
    return rejected.status === 1 && rejected.stderr.includes("no block covers") && !fs.existsSync(html) || "check accepted an incomplete map";
  });

test("the selected language covers controls and exported decisions without per-review translations",
  "partial translations silently left Files, Copy and selection comments in English",
  () => {
    for (const [lang, catalog] of Object.entries(CATALOGS)) {
      if (Object.keys(catalog).sort().join() !== Object.keys(LABELS).sort().join()) return `${lang}: incomplete catalog`;
      for (const [key, value] of Object.entries(catalog)) if (!value.trim() || LABELS[key].includes("{n}") !== value.includes("{n}")) return `${lang}: invalid ${key}`;
    }
    const result = render((r) => { r.language = "ru-RU"; });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    if (!["Файлы", "Копировать", "Комментировать выделение", "Комментарии к фрагментам", "Рекомендации"].every((text) => page.includes(text))) return "Russian controls or export are missing";
    if (!result.stdout.includes("## Вывод")) return "Markdown is not localized";
    if (report("labels", "ru").stdout !== JSON.stringify(CATALOGS.ru, null, 2) + "\n") return "the catalog command differs";
    const incomplete = render((r) => { r.language = "fr"; r.labels = { findings: "Constats" }; });
    if (incomplete.status !== 1 || !incomplete.stderr.includes("complete labels catalog")) return "unknown locale silently fell back to English";
    return render((r) => { r.language = "custom"; r.labels = { ...LABELS, findings: "Custom findings" }; }).status === 0 || "a complete custom catalog was refused";
  });

const MECHANISM = { name: "Normalization <rule>", change: "reused", units: ["readArchive"], purpose: "Consistent display.",
  basis: "Requirement 1; existing conversion.", benefit: "Readable codes.", cost: "No extra state; test the boundary.",
  decision: "Keep the conversion.", evidence: "judgment", findings: [1] };
test("mechanisms keep purpose, cost and decision in both renderings and resolve their references",
  "a mechanism can span units; its cost must not disappear behind a function count or unlinked verdict",
  () => {
    const result = render((r) => { r.mechanisms = [MECHANISM]; });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    if (!page.includes("added: 0 · reused: 1 · changed: 0 · removed: 0") || !result.stdout.includes("added: 0; reused: 1; changed: 0; removed: 0")) return "mechanism counts differ from the inventory";
    if (!page.includes("Normalization &lt;rule&gt;") || page.includes("Normalization <rule>")) return "mechanism text is not escaped";
    if (![MECHANISM.purpose, MECHANISM.basis, MECHANISM.benefit, MECHANISM.cost, MECHANISM.decision].every((text) => page.includes(text) && result.stdout.includes(text))) return "mechanism evidence lost in presentation";
    for (const [patch, error] of [[{ units: ["absent"] }, "names unit absent"], [{ findings: [88] }, "names finding 88"],
      [{ change: "keep" }, "change is one of"], [{ cost: "" }, 'has no "cost"'], [{ evidence: "guessed" }, "evidence is one of"]]) {
      const bad = render((r) => { r.mechanisms = [{ ...MECHANISM, ...patch }]; });
      if (bad.status !== 1 || !bad.stderr.includes(error)) return `accepted malformed mechanism: ${JSON.stringify(patch)}`;
    }
    if (render((r) => { r.mechanisms = [{ ...MECHANISM, units: [], findings: undefined }]; }).status !== 0) return "a file-level mechanism without findings was refused";
    // What a change brings in says what was already there; what it only reuses need not.
    const brought = render((r) => { r.mechanisms = [{ ...MECHANISM, change: "added" }]; });
    if (brought.status !== 1 || !brought.stderr.includes('has no "instead"')) return "an added mechanism that does not say what was already available was accepted";
    const vague = render((r) => { r.mechanisms = [{ ...MECHANISM, change: "added", instead: "Nothing else does this." }]; });
    if (vague.status !== 1 || !vague.stderr.includes("cites no place")) return "an answer that names nothing read was accepted";
    const answered = render((r) => { r.mechanisms = [{ ...MECHANISM, change: "added", instead: "The archive reader converts already: src/archive.js:12." }]; });
    if (answered.status !== 0 || !answered.stdout.includes("Already available: The archive reader converts already: src/archive.js:12.")) return "the answer to what was already available is not printed";
    if (render((r) => { r.mechanisms = [{ ...MECHANISM, units: undefined }]; }).status !== 0) return "omitted optional units were refused";
    if (render((r) => { r.mechanisms = {}; }).status !== 1) return "accepted a non-list inventory";
    return render((r) => { r.mechanisms = []; }).status === 0 && !fs.readFileSync(html, "utf8").includes('id="mechanisms"') || "empty inventory is not supported";
  });

test("scenarios render and reference validation survives without a numerical design gate",
  "a structural tradeoff may improve readability with more edit locations, and a simple review may need no scenario",
  () => {
    const DESIGN = { id: 3, title: "A rule cannot change alone", direction: "design", evidence: "judgment", at: "src/invoices/archive.js:2",
      what: "The format and the conversion share one loop.", shown_by: "Scenario 1.", fix: "Name the conversion; scenario 1 stays in two places without it.", scenarios: [1] };
    const good = render((r) => { r.findings.push(DESIGN); });
    if (good.status !== 0) return good.stderr;
    const page = fs.readFileSync(html, "utf8");
    if (!page.includes('id="scenarios"') || !page.includes("Another &lt;code&gt; format is read.") || page.includes("Another <code> format")) return "the scenario is not drawn, or its text is not escaped";
    if (!page.includes("One job, read whole at a glance.") || !good.stdout.includes("Reason: One job, read whole at a glance.")) return "a kept unit's reason is lost in presentation";
    if (!good.stdout.includes("## Changes tried") || !good.stdout.includes("1. Another <code> format is read. (requirement 1)") || !good.stdout.includes("Target solution: edit: src/invoices/upper.js: upper. read: nothing.")) return `the printout lacks the scenario:\n${good.stdout}`;
    const refused = [
      [(r) => { r.findings.push({ ...DESIGN, scenarios: [9] }); }, "names scenario 9"],
      [(r) => { r.scenarios[0].now.edit = []; }, '"now.edit" lists no place'],
      [(r) => { delete r.units[0].reason; }, 'unit readArchive has no "reason"'],
    ];
    for (const [change, error] of refused) {
      const bad = render(change);
      if (bad.status !== 1 || !bad.stderr.includes(error)) return `not refused with "${error}": ${bad.stderr.slice(0, 300)}`;
    }
    const tradeoff = render((r) => {
      r.findings.push(DESIGN);
      r.scenarios[0].now = { edit: ["src/invoices/archive.js: readArchive"], read: ["src/invoices/archive.js: whole loop"] };
      r.scenarios[0].target = { edit: ["src/invoices/a.js: first", "src/invoices/b.js: second"], read: ["src/invoices/a.js: a short rule"] };
    });
    if (tradeoff.status !== 0) return `a tradeoff with more edits and less code to read was refused: ${tradeoff.stderr}`;
    if (render((r) => { delete r.scenarios[0].target; }).status !== 0) return "a scenario whose target is the code as written was refused";
    if (render((r) => { delete r.scenarios; }).status !== 0) return "a simple review with changed units was asked for scenarios";
    return render((r) => { delete r.scenarios; r.findings.push({ ...DESIGN, scenarios: undefined }); }).status === 0 || "a design finding without a scenario was refused";
  });

test("mechanism weights count nonblank +/- lines, separate shared blocks and retain unknowns",
  "shared wiring and test code must not inflate a mechanism's exclusive production weight",
  () => {
    const r = structuredClone(REVIEW);
    r.blocks[0].added = "2-4";
    ["code", "test", "other"].forEach((kind, i) => { r.blocks[i].kind = kind; });
    r.mechanisms = [{ ...MECHANISM, name: "A", blocks: [1, 2] }, { ...MECHANISM, name: "B", blocks: [1, 3] },
      { ...MECHANISM, name: "Unassessed" }, { ...MECHANISM, name: "Reused", blocks: [] }];
    const added = (n, blank = false) => ({ kind: "add", new: n, text: blank ? " " : "code" });
    const files = [{ path: r.blocks[0].path, hunks: [[added(2), added(3, true), { ...added(4), text: "// comment counts as nonblank" }, { kind: "del", old: 3, text: "old" }]] },
      { path: r.blocks[1].path, hunks: [Array.from({ length: 8 }, (_, i) => added(i + 1, i === 3))] },
      { path: r.blocks[2].path, hunks: [Array.from({ length: 13 }, (_, i) => added(i + 1))] }];
    const checked = check(r, files, run);
    if (checked.errors.length) return checked.errors.join("; ");
    // Structural validity is not semantic proof: the checker cannot know which lines serve a mechanism.
    const falselyAttributed = structuredClone(r); falselyAttributed.mechanisms[0].blocks = [3];
    if (check(falselyAttributed, files, run).errors.length) return "the checker claims to decide semantic ownership";
    const model = modelOf(r, files, checked.owner, run), [a, b, unknown, reused] = model.mechanisms;
    if (model.blocks[0].added.length !== 3 || model.blocks[0].size !== 4) return "existing block representation changed";
    if (a.weight.exclusive.code.added !== 0 || a.weight.exclusive.test.added !== 7 || b.weight.exclusive.other.added !== 13) return "exclusive/category counts differ";
    if (a.weight.shared.length !== 1 || a.weight.shared[0].added !== 2 || a.weight.shared[0].removed !== 1 || a.weight.shared[0].with.join() !== "B" || a.weight.sharedCounts.code.added !== 2) return "shared/blank/removed counts differ";
    if (unknown.weight !== null || reused.weight === null || reused.weight.exclusive.code.added !== 0) return "unknown and verified zero conflated";
    for (const ids of [[1, 1], [0], [99], ["1"], null]) {
      const bad = structuredClone(r); bad.mechanisms[0].blocks = ids;
      if (!check(bad, files, run).errors.length) return `accepted invalid references ${JSON.stringify(ids)}`;
    }
    const missing = structuredClone(r); delete missing.blocks[0].kind;
    if (!check(missing, files, run).errors.some(e => e.includes("explicit kind"))) return "unit inferred code kind";
    const invalid = structuredClone(r); invalid.blocks[2].kind = "guess";
    if (!check(invalid, files, run).errors.some(e => e.includes("kind is one of"))) return "invalid kind accepted";
    const empty = structuredClone(r); empty.mechanisms[3] = { ...MECHANISM, name: "Added", change: "added", instead: "source.js:1", blocks: [] };
    if (!check(empty, files, run).errors.some(e => e.includes("empty blocks"))) return "added mechanism accepted zero attribution";
    return true;
  });

test("weight overview leads with the full footprint, not exclusive lines or net change",
  "44 attributed lines must not be presented as 10, and +50/-12 must not become 38",
  () => {
    const counts = (added = 0, removed = 0) => ({ added, removed });
    const weight = { exclusive: { code: counts(10), test: counts(), other: counts() }, sharedCounts: { code: counts(34), test: counts(), other: counts() } };
    const ru = labelsOf({ language: "ru" }), en = labelsOf({ language: "en" });
    let rows = weightOverview(weight, ru, "ru");
    if (rows[0].text !== "добавлено 44 строки (34 общие)") return "shared subset missing or double-counted";
    weight.exclusive.code = counts(20, 8); weight.sharedCounts.code = counts(30, 4);
    if (weightOverview(weight, ru, "ru")[0].text !== "добавлено 50 строк (30 общих), удалено 12 строк (4 общие)") return "mixed delta conflated";
    weight.exclusive.code = counts(0, 30); weight.sharedCounts.code = counts();
    if (weightOverview(weight, ru, "ru")[0].text !== "удалено 30 строк") return "zero addition exposed";
    weight.exclusive.code = counts(); weight.sharedCounts.code = counts(34);
    if (weightOverview(weight, ru, "ru")[0].text !== "добавлено 34 строки (34 общие)") return "fully shared case misrepresented";
    weight.sharedCounts.code = counts();
    if (weightOverview(weight, ru, "ru").length || weightOverview(null, ru, "ru").length) return "empty overview invented counts";
    for (const [n, expected] of [[1,"добавлена 1 строка"],[2,"добавлено 2 строки"],[5,"добавлено 5 строк"],[21,"добавлена 21 строка"]]) {
      weight.exclusive.code = counts(n);
      if (weightOverview(weight, ru, "ru")[0].text !== expected) return `bad Russian count ${n}`;
    }
    weight.exclusive.code = counts(1);
    if (weightOverview(weight, en, "en")[0].text !== "1 line added") return "bad English singular";
    weight.exclusive.code = counts(2);
    if (weightOverview(weight, en, "ar")[0].text !== "2 lines added") return "missing CLDR two form";
    weight.exclusive.code = counts(44);
    return weightOverview(weight, en, "en")[0].text === "44 lines added" || "bad English plural";
  });

test("weight is rendered in HTML and text without changing the review record",
  "legacy unknowns and shared block evidence must be visible in both outputs",
  () => {
    const result = render(r => {
      r.blocks.forEach(b => { b.kind = "code"; });
      r.mechanisms = [{ ...MECHANISM, name: "A", blocks: [1] }, { ...MECHANISM, name: "B", blocks: [1] }, { ...MECHANISM, name: "Unknown" }];
    });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8"), raw = JSON.parse(fs.readFileSync(data, "utf8"));
    const card = page.match(/<article class="finding mechanism" id="m1"[\s\S]*?<\/article>/)?.[0];
    const summary = card?.match(/<details><summary>([\s\S]*?)<\/summary>/)?.[1];
    if (!summary?.includes("A</h3>") || !summary.includes(MECHANISM.decision) || !summary.includes("Code:") || summary.includes("Shared with")) return "collapsed summary lacks the name, decision or compact weight";
    return ["Shared with", "Not assessed"].every(text => page.includes(text) && result.stdout.includes(text))
      && result.stdout.includes("Touched in this change") && !card.includes("Touched in this change") && card.includes("Show counted lines")
      && page.includes('aria-label="Dismiss notification"') && page.includes('href="#b1"') && raw.mechanisms.every(m => m.weight === undefined) || "weight evidence or dismiss control missing, redundant heading present, or derived totals persisted";
  });

test("a review that does not match the diff is refused, every fault is listed, and no page is written",
  "a page over a partly mapped change reads as a complete review",
  () => {
    const faults = [
      [(r) => { r.blocks[1].added = "1-7"; }, "test/archive.test.js: no block covers added 8"],
      [(r) => { r.blocks.push({ ...r.blocks[0], added: "2", removed: "" }); }, "src/invoices/archive.js +2 is in block 1 and in block 4"],
      [(r) => { r.blocks[1].findings = [9]; }, "block 2 names finding 9, which is not listed"],
      [(r) => { r.blocks[0].serves = [7]; }, "block 1 names requirement 7, which is not listed"],
      [(r) => { r.blocks[1].findings = []; }, "block 2 is to fix and names no finding"],
      [(r) => { r.blocks[0].unit = "rows"; }, 'block 1: "rows" is not a unit of the change'],
      [(r) => { delete r.blocks[0].unit; }, "unit readArchive has no block"],
      [(r) => { r.units[0].uses = ["nobody"]; }, "units: readArchive names unit nobody, which is not listed"],
      [(r) => { r.findings[1].breaks = [5]; }, "finding 2 names requirement 5, which is not listed"],
      [(r) => { r.findings[0].breaks = [1]; }, 'finding 1 is about tests: it lists requirements under "untested", not "breaks"'],
      [(r) => { r.findings[1].untested = [1]; }, 'finding 2 is not about tests: it lists requirements under "breaks", not "untested"'],
      [(r) => { r.requirements[2].met = "read"; }, "requirement 3 is marked met, and finding 2 breaks it"],
      [(r) => { r.requirements[0].met = "judgment"; }, "requirement 1: met is one of ran, read"],
      [(r) => { r.requirements[0].not_checked = " "; }, 'requirement 1: "not_checked" says what of it you did not check'],
      [(r) => { r.checks[0].do = []; }, 'check 1 has no "do"'],
      [(r) => { delete r.checks[0].expect; }, 'check 1 has no "expect"'],
      [(r) => { r.checks[0].requirements = [6]; }, "check 1 names requirement 6, which is not listed"],
      [(r) => { delete r.now; }, '"now" is missing'],
      [(r) => { delete r.requirements[0].source; }, "requirement 1: source is one of task, discussion, question, assumption"],
      [(r) => { r.steps[0].findings = [8]; }, "step 1 names finding 8, which is not listed"],
      [(r) => { delete r.findings[1].shown_by; }, 'finding 2 has no "shown_by"'],
      [(r) => { r.units[0].verdict = "improve"; }, "unit readArchive: verdict is one of keep, fix, split, merge, remove"],
      [(r) => { Object.assign(r.units[0], { verdict: "split", findings: [1] }); r.target_units.pop(); r.target_units[0].uses = []; }, "unit readArchive is to split, and the target has no new unit"],
      [(r) => { r.screens[1].match = true; }, "screen 2 is said to match, and has no mockup picture"],
      [(r) => { r.screens[0].match = true; }, "screen 1 is said to match, and lists differences"],
      [(r) => { delete r.screens[1].missing; }, 'screen 2 has no difference and no "match"'],
      [(r) => { r.blocks[0].added = "all"; }, 'block 1: "all" is for a block to remove'],
      [(r) => { delete r.change; }, '"change.goal" is missing'],
      [(r) => { delete r.recommendation; }, '"recommendation" is missing'],
      [(r) => { r.ideas[0].text = ""; }, 'idea 1 has no "text"'],
      [(r) => { r.screens[0].before = "absent.png"; }, 'screen 1: before "absent.png" is neither a picture file there'],
      [(r) => { delete r.screens[0].differences[0].why; }, 'screen 1: a difference has neither "why" nor "finding"'],
    ];
    for (const [change, fault] of faults) {
      const { status, stderr } = render(change);
      if (status !== 1 || !stderr.includes(fault)) return `expected "${fault}", got status ${status}: ${stderr}`;
      if (fs.existsSync(html)) return `a page was written despite "${fault}"`;
    }
    const both = render((r) => { r.blocks[1].added = "1-7"; r.blocks[1].findings = [9]; }).stderr;
    return both.includes("fix these 2") || `two faults were not listed together: ${both}`;
  });

test("a block to remove may name a whole file",
  "a file that goes entirely is one decision; the rule against \"all\" is for code that stays",
  () => {
    const { status, stderr } = render((r) => { Object.assign(r.blocks[1], { added: "all", verdict: "remove" }); });
    return status === 0 || `refused: ${stderr}`;
  });

const focused = (r) => {
  r.map_mode = "focused";
  r.units[0].at = "src/invoices/archive.js:2";
};

test("focused empty and partial maps derive gaps without changing ownership or the canonical record",
  "no mapped decision is neither keep nor unread, and derived line totals belong only to the model",
  () => {
    const r = structuredClone(REVIEW); focused(r);
    r.blocks = [];
    const files = [{ path: "src/invoices/archive.js", hunks: [[
      { kind: "ctx", old: 1, new: 1, text: "context" },
      { kind: "add", new: 2, text: "mapped();" }, { kind: "add", new: 3, text: " " }, { kind: "del", old: 3, text: "old();" },
      { kind: "add", new: 4, text: "unmapped();" }, { kind: "add", new: 5, text: " " },
    ]] }];
    const before = JSON.stringify(r), checked = check(r, files, run);
    if (checked.errors.length || checked.owner.size) return `empty map rejected or given owners: ${checked.errors}`;
    const model = modelOf(r, files, checked.owner, run), gap = model.unmapped[0];
    if (!model.focused || gap.path !== files[0].path || gap.added.join() !== "2,4" || gap.removed.join() !== "3" || gap.size !== 3
      || gap.where !== "+2, 4 -3" || JSON.stringify(checked.unmapped) !== JSON.stringify(model.unmapped)) return "empty map's derived addresses differ";
    if (JSON.stringify(r) !== before || model.requirements[0].met !== "read" || model.units[0].at !== r.units[0].at) return "canonical data or semantic status changed";
    r.blocks = [{ ...REVIEW.blocks[0], added: "2", kind: "code" }];
    r.mechanisms = [{ ...MECHANISM, blocks: [1] }, { ...MECHANISM, name: "No attribution" }, { ...MECHANISM, name: "Empty attribution", blocks: [] }];
    const partial = check(r, files, run), modeled = modelOf(r, files, partial.owner, run);
    if (partial.errors.length || partial.owner.size !== 2 || modeled.unmapped[0].added.join() !== "4" || modeled.unmapped[0].removed.length) return "partial ownership differs";
    if (!modeled.mechanisms[0].weight.partial || modeled.mechanisms[0].weight.exclusive.code.added !== 1
      || modeled.mechanisms.slice(1).some(m => m.weight !== null)) return "partial footprint or hidden weight became full/zero";
    let refused = false;
    try { drawPage(r, files, modeled); } catch (error) { refused = error.message.includes("full raw Git diff"); }
    if (!refused) return "focused presentation silently omitted its missing raw diff";
    const unmappedSegments = [...drawPage(r, files, { ...modeled, rawDiff: "synthetic diff\n" }).matchAll(/<div class="seg v-open unmapped">[\s\S]*?<\/div>/g)].map(m => m[0]);
    if (!unmappedSegments.some(segment => segment.includes('<b>3</b><i>+</i> </span>'))) return "an unowned blank inherited a keep decision";
    // A false semantic attribution remains structurally valid in focused, too.
    r.mechanisms[0].units = [];
    return !check(r, files, run).errors.length || "the checker claims to determine semantic ownership";
  });

test("focused keeps disjoint blocks, source addresses, dispositions and all logical/reference checks",
  "selective mapping relaxes ownership completeness only",
  () => {
    const faults = [
      [r => { r.blocks = []; delete r.units[0].at; }, 'unit readArchive has no mapped block'],
      [r => { r.blocks = []; r.units[0].at = "not an address"; }, '"at" must give a source address'],
      [r => { r.blocks = []; r.units[0].at = "does-not-exist.js:1"; }, '"does-not-exist.js" is not a file of the diff'],
      [r => { r.blocks = []; r.units[0].at = "src/invoices/archive.js:999-1"; }, "forward range"],
      [r => { r.blocks = []; r.units[0].at = "src/invoices/archive.js:0"; }, "positive line numbers"],
      [r => { r.blocks = []; r.units[0].at = "src/invoices/archive.js:1-0"; }, "positive line numbers"],
      [r => { r.blocks = []; r.units[0].at = "src/invoices/archive.js:-1"; }, "positive line numbers"],
      [r => { r.blocks = []; r.units[0].at = "src/invoices/archive.js:999"; }, "outside the new source"],
      [r => { r.units[0].at = "does-not-exist.js:999-1"; }, "forward range"],
      [r => { r.units[0].at = "src/invoices/archive.js:999"; }, "outside the new source"],
      [r => { r.blocks = {}; }, '"blocks" is not a list'],
      [r => { delete r.blocks; }, '"blocks" is not a list'],
      [r => { r.blocks.push({ ...r.blocks[0], added: "2", removed: "" }); }, "+2 is in block 1 and in block 4"],
      [r => { r.blocks[0].serves = [99]; }, "names requirement 99"],
      [r => { r.blocks[0].findings = [99]; }, "names finding 99"],
      [r => { r.blocks[0].verdict = "unknown"; }, "verdict is one of"],
      [r => { r.blocks[1].findings = []; }, "is to fix and names no finding"],
      [r => { r.blocks = []; delete r.units[0].reason; }, 'has no "reason"'],
      [r => { r.blocks = []; r.units[0].jobs = []; }, "has no jobs"],
      [r => { r.blocks = []; r.units[0].uses = ["ghost"]; }, "names unit ghost"],
      [r => { r.blocks = []; r.units[0].verdict = "fix"; }, "is to fix and names no finding"],
      [r => { r.requirements[2].met = "read"; }, "is marked met, and finding"],
      [r => { r.target_units[0].uses = ["ghost"]; }, "names unit ghost"],
      [r => { r.scenarios[0].requirements = [99]; }, "names requirement 99"],
      [r => { r.mechanisms = [{ ...MECHANISM, blocks: [99] }]; }, "unknown block 99"],
      [r => { r.blocks[0].kind = "code"; r.mechanisms = [{ ...MECHANISM, blocks: [1, 1] }]; }, "duplicate block references"],
      [r => { r.mechanisms = [{ ...MECHANISM, change: "added" }]; }, 'has no "instead"'],
    ];
    for (const [change, error] of faults) {
      const result = render(r => { focused(r); change(r); });
      if (result.status !== 1 || !result.stderr.includes(error) || fs.existsSync(html)) return `focused accepted ${error}: ${result.stderr}`;
    }
    for (const mode of [null, "", "partial", 1]) {
      const bad = render(r => { r.map_mode = mode; });
      if (bad.status !== 1 || !bad.stderr.includes('"map_mode" is one of complete, focused')) return `accepted map mode ${mode}`;
    }
    return true;
  });

test("focused validates addresses against the selected source versions, including deleted-only files",
  "working-tree existence and short diff context cannot validate addresses in immutable old/new snapshots",
  () => {
    const dir = tempDir("review-source-"), tree = path.join(dir, "repo"), json = path.join(dir, "review.json");
    fs.mkdirSync(tree);
    const git = (...args) => execFileSync("git", ["-c", "user.name=review-test", "-c", "user.email=test@example.invalid",
      "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "-c", "gc.auto=0", "-c", "maintenance.auto=false", ...args],
    { cwd: tree, encoding: "utf8" });
    const write = (file, count, finalNewline = true) => fs.writeFileSync(path.join(tree, file),
      Array.from({ length: count }, (_, i) => `line ${i + 1}`).join("\n") + (finalNewline ? "\n" : ""));
    git("init", "--quiet", "--initial-branch=main");
    write("survives.js", 40);
    write("deleted.js", 4, false);
    write("trimmed.js", 10);
    git("add", ".");
    git("commit", "--quiet", "-m", "Before");
    fs.writeFileSync(path.join(tree, "survives.js"), fs.readFileSync(path.join(tree, "survives.js"), "utf8").replace("line 20\n", "changed 20\n"));
    fs.rmSync(path.join(tree, "deleted.js"));
    write("trimmed.js", 3);
    write("added.js", 3, false);
    git("add", "--all");
    git("commit", "--quiet", "-m", "After");
    // The review's HEAD image is 40 lines; a later working copy must not validate line 500 in that image.
    write("survives.js", 500);
    const r = { title: "Source bounds", range: "HEAD~1..HEAD", map_mode: "focused",
      change: { goal: "Check addresses", parts: ["Address units without blocks"], sources: ["fixture"] },
      verdict: "Read", now: "Current", target: "Current", recommendation: "Keep",
      requirements: [], findings: [], blocks: [],
      units: [{ name: "decision", jobs: ["Owns the changed decision"], uses: [], verdict: "keep", reason: "One cohesive job" }] };
    const at = address => {
      r.units[0].at = address;
      fs.writeFileSync(json, JSON.stringify(r));
      return spawnSync(process.execPath, [SCRIPT, "check", json], { cwd: tree, encoding: "utf8" });
    };
    for (const address of ["survives.js:1-40", "deleted.js:1-4", "old:deleted.js:4", "trimmed.js:1-3", "old:trimmed.js:8-10", "added.js:1-3"]) {
      const result = at(address);
      if (result.status) return `${address} refused: ${result.stderr}`;
    }
    for (const [address, side] of [["survives.js:41", "new"], ["survives.js:500", "new"], ["deleted.js:5", "old"],
      ["trimmed.js:4", "new"], ["old:trimmed.js:11", "old"], ["added.js:4", "new"], ["old:added.js:1", "old"]]) {
      const result = at(address);
      if (result.status !== 1 || !result.stderr.includes(`outside the ${side} source`)) return `${address} not rejected on its ${side} image: ${result.stderr}`;
    }
    r.range = "HEAD";
    if (at("survives.js:500").status || at("survives.js:501").status !== 1) return "working-tree range used the committed image's length";
    fs.rmSync(path.join(tree, "survives.js"));
    if (at("survives.js:40").status || at("survives.js:41").status !== 1) return "working-tree deletion lost the old image's bounds";
    return true;
  });

test("focused hunk-only callers get a verification limit rather than a false source guarantee",
  "absence from a partial hunk is not proof that a source address does not exist",
  () => {
    const r = structuredClone(REVIEW); focused(r); r.blocks = [];
    const files = [{ path: "src/invoices/archive.js", hunks: [[{ kind: "add", new: 20, text: "code" }]] }];
    r.units[0].at = "src/invoices/archive.js:20";
    if (check(r, files, run).errors.length) return "a line present on the chosen side was not verified";
    r.units[0].at = "src/invoices/archive.js:1-20";
    const faults = check(r, files, run).errors;
    if (!faults.some(e => e.includes("cannot verify") && e.includes("sourceLines")) || faults.some(e => e.includes("outside the new source"))) return "hunk absence was treated as source absence";
    files[0].sourceLines = { old: 0, new: 20 };
    return check(r, files, run).errors.length === 0 || "full-source bounds did not permit an address beyond the hunk";
  });

test("focused rejects extraneous block lines and reversed ranges while complete keeps its pre-existing behavior",
  "focused must not silently discard claimed addresses; baseline tolerance is outside this experiment",
  () => {
    for (const [spec, error] of [["2-3,999", "is not a changed line"], ["2,4,999", "is not a changed line"],
      ["2,4,0", "positive line numbers"], ["2,4,9-1", "forward ranges"]]) {
      const result = render(r => { focused(r); r.blocks[0].added = spec; });
      if (result.status !== 1 || !result.stderr.includes(error)) return `focused accepted ${spec}: ${result.stderr}`;
    }
    const wrongSide = render(r => { focused(r); r.blocks[0].removed = "3,4"; });
    if (wrongSide.status !== 1 || !wrongSide.stderr.includes("removed 4 is not a changed line")) return "a new-side-only number counted as removed";
    for (const mode of [undefined, "complete"]) {
      const baseline = render(r => { r.map_mode = mode; r.blocks[0].added = "2,4,999,0,9-1"; });
      if (baseline.status) return `pre-existing complete behavior changed: ${baseline.stderr}`;
    }
    return true;
  });

test("focused renders every diff line and distinguishes partial attribution, missing links and unmapped units",
  "gaps cannot be hidden by full-looking percentages, zero weights or implied requirement absence",
  () => {
    const complete = render(), full = fs.readFileSync(html, "utf8");
    const changed = report("lines", REVIEW.range).stdout.split("\n").filter(line => line.startsWith("  "))
      .map(line => `${line[2]}${line.slice(9)}`);
    const lines = text => [...text.matchAll(/<span class="l (?:add|del|ctx)">[\s\S]*?<\/span>(?=<span class="l |<\/code>)/g)].map(m => m[0]).join("\n");
    for (const empty of [true, false]) {
      const result = render(r => {
        focused(r);
        r.blocks = empty ? [] : [{ ...r.blocks[1], kind: "test", serves: [] }];
        r.mechanisms = [{ ...MECHANISM, name: "Unknown" }, { ...MECHANISM, name: "Empty", blocks: [] },
          ...(!empty ? [{ ...MECHANISM, name: "Partial", blocks: [1] }, { ...MECHANISM, name: "Shared", blocks: [1] }] : [])];
      });
      if (result.status !== 0) return result.stderr;
      const page = fs.readFileSync(html, "utf8");
      if (lines(page) !== lines(full) || !lines(page)) return "focused dropped or reordered diff lines";
      const text = page.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
      for (const part of ["Focused changed-line map", "neither keep nor automatically unread", "No mapped requirement link", "Not assessed:", "src/invoices/archive.js:2"]) {
        if (!page.includes(part) || !result.stdout.includes(part)) return `missing focused disclosure: ${part}`;
      }
      const printedDiff = result.stdout.split("## Full raw Git diff\n")[1];
      if (!printedDiff || changed.some(line => !printedDiff.split("\n").includes(line))
        || !page.includes('class="seg v-open unmapped"')) return "full diff or unmapped segments absent";
      if (text.includes('class="share"') || text.includes('class="part"') || text.includes("No requirement would fail")
        || text.includes("Serves nothing") || text.includes("No nonblank lines added or removed.")) return "focused claims complete shares, absence or zero";
      if (!empty && ["Partial attribution:", "Exclusive within mapped attribution", "Shared with"].some(text => !page.includes(text) || !result.stdout.includes(text))) return "partial/shared mechanism footprint looks full";
      const raw = fs.readFileSync(data), checked = report("check", data);
      if (checked.status || checked.stdout === "Review data matches the diff.\n" || !checked.stdout.includes("src/invoices/archive.js:")) return "focused check hides derived gaps";
      fs.rmSync(html);
      const delayed = report("render", data), first = fs.readFileSync(html);
      const again = report("render", data);
      if (delayed.status || again.status || !raw.equals(fs.readFileSync(data)) || !first.equals(fs.readFileSync(html))) return "focused delayed rendering reconstructed JSON";
    }
    return complete.status === 0 || complete.stderr;
  });

test("focused localization is conditional and complete/legacy output stays compatible",
  "old custom catalogs must still work; focused disclosures must not silently fall back to English",
  () => {
    const oldLabels = Object.fromEntries(Object.entries(LABELS).filter(([key]) => !key.startsWith("focused.")));
    const legacy = render(), checked = report("check", data);
    const explicit = render(r => { r.map_mode = "complete"; }), explicitCheck = report("check", data);
    if (legacy.stdout !== explicit.stdout || checked.stdout !== "Review data matches the diff.\n" || explicitCheck.stdout !== checked.stdout) return "complete stdout changed";
    for (const mode of [undefined, "complete"]) {
      const result = render(r => { r.map_mode = mode; r.language = "custom"; r.labels = oldLabels; });
      if (result.status) return `old custom catalog refused: ${result.stderr}`;
      const missing = render(r => { r.map_mode = mode; r.blocks.pop(); });
      if (missing.status !== 1 || !missing.stderr.includes("test/outputs.test.js: no block covers")) return "complete gaps accepted";
    }
    const ru = render(r => { focused(r); r.blocks = []; r.language = "ru-RU"; r.mechanisms = [MECHANISM]; });
    if (ru.status) return ru.stderr;
    const page = fs.readFileSync(html, "utf8");
    if (!page.includes("Выборочная построчная карта") || !page.includes("Полный объём") && !page.includes("полный объём")
      || !ru.stdout.includes("## Полный raw Git diff") || !report("check", data).stdout.includes("Данные выборочного ревью")) return "focused Russian text missing";
    const incomplete = render(r => { focused(r); r.language = "custom"; r.labels = oldLabels; });
    if (incomplete.status !== 1 || !incomplete.stderr.includes("focused.note")) return "focused custom catalog silently fell back";
    const translated = { ...LABELS, "focused.title": "Custom focused map", "focused.no-block": "Custom missing link" };
    const custom = render(r => { focused(r); r.blocks = []; r.language = "custom"; r.labels = translated; });
    if (custom.status || !custom.stdout.includes("Custom focused map") || !fs.readFileSync(html, "utf8").includes("Custom missing link")) return "focused overrides not rendered";
    delete translated["focused.weight"]; delete translated["focused.no-weight"]; delete translated["focused.exclusive"];
    return render(r => { focused(r); r.language = "custom"; r.labels = translated; }).status === 0 || "unused mechanism labels required";
  });

test("focused raw diff preserves binary, mode-only and EOF changes without claiming line-map coverage",
  "parsed hunks cannot stand in for a full diff, and raw source must remain inert in HTML and Markdown",
  () => {
    const dir = tempDir("review-raw-"), tree = path.join(dir, "repo"), json = path.join(dir, "review.json"), output = path.join(dir, "review.html");
    fs.mkdirSync(tree);
    const git = (...args) => execFileSync("git", ["-c", "user.name=review-test", "-c", "user.email=test@example.invalid",
      "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "-c", "core.filemode=true",
      "-c", "gc.auto=0", "-c", "maintenance.auto=false", ...args], { cwd: tree, encoding: "utf8" });
    const write = (file, content) => fs.writeFileSync(path.join(tree, file), content);
    git("init", "--quiet", "--initial-branch=main");
    write("binary.dat", Buffer.from([0, 1, 2, 3]));
    write("mode-only.sh", "echo unchanged\n");
    fs.chmodSync(path.join(tree, "mode-only.sh"), 0o644);
    write("eof.txt", "before\n");
    write("normal.js", "export const value = 1;\n");
    git("add", ".");
    git("commit", "--quiet", "-m", "Before");
    write("binary.dat", Buffer.from([0, 255, 3, 4, 5]));
    fs.chmodSync(path.join(tree, "mode-only.sh"), 0o755);
    const unsafe = '</code></pre><script>bad()</script>& "quoted"';
    write("eof.txt", `${unsafe}\n\`\`\`\`\nend`);
    write("normal.js", "export const value = 2;\n");
    git("add", "--all");
    git("commit", "--quiet", "-m", "After");
    const r = { title: "Raw source", range: "HEAD~1..HEAD", map_mode: "focused",
      change: { goal: "Present all source changes", parts: ["Mixed diff"], sources: ["fixture"] },
      verdict: "Read", now: "Current", target: "Current", recommendation: "Keep",
      requirements: [], findings: [], blocks: [{ path: "normal.js", added: "1", removed: "1", does: "Changes a value", verdict: "keep" }],
      coverage: "Fixture: non-text changes have no line-map verdict." };
    const invoke = (command, env = process.env) => spawnSync(process.execPath, [SCRIPT, command, json], { cwd: tree, env, encoding: "utf8" });
    fs.writeFileSync(json, JSON.stringify(r));
    const canonical = fs.readFileSync(json), expected = git("diff", "--binary", "--no-color", "--no-ext-diff", r.range, "--");
    for (const marker of ["GIT binary patch", "old mode 100644", "new mode 100755", "\\ No newline at end of file", unsafe]) {
      if (!expected.includes(marker)) return `fixture lacks ${marker}`;
    }
    const result = invoke("render");
    if (result.status) return result.stderr;
    const page = fs.readFileSync(output, "utf8"), raw = page.match(/<section id="raw-diff"[\s\S]*?<pre><code>([\s\S]*?)<\/code><\/pre>/)?.[1];
    const escaped = expected.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    if (raw !== escaped || page.includes(unsafe) || !page.includes("&lt;script&gt;bad()&lt;/script&gt;")) return "HTML raw diff was omitted, altered or interpreted as markup";
    if (!result.stdout.includes(`\`\`\`\`\`diff\n${expected}\`\`\`\`\``)) return "Markdown raw diff is incomplete or its fence can be closed by source text";
    const mapped = page.split('id="map"')[1].split('<section id="raw-diff"')[0];
    if (!mapped.includes('class="l add"') || !mapped.includes("value") || mapped.includes("GIT binary patch")) return "ordinary mapped text was lost or raw data became a mapped block";
    if (![page, result.stdout].every(text => text.includes("Presence here is not a mapped decision or proof of review"))
      || !invoke("check").stdout.includes("parsed text lines only")) return "non-text changes were presented as mapped or checked";
    const repeat = invoke("render");
    if (repeat.status || !canonical.equals(fs.readFileSync(json)) || page !== fs.readFileSync(output, "utf8")) return "raw presentation mutated JSON or changed on delayed rendering";

    // Refuse raw-Git failure rather than publish a valid-looking page with an empty raw section.
    const shim = path.join(dir, "bin");
    fs.mkdirSync(shim);
    fs.writeFileSync(path.join(shim, "git"), `#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
if (process.argv.includes("--binary")) { console.error("raw diff unavailable"); process.exit(9); }
const child = spawnSync("git", process.argv.slice(2), { stdio: "inherit", env: { ...process.env, PATH: ${JSON.stringify(process.env.PATH)} } });
process.exit(child.status ?? 1);
`, { mode: 0o755 });
    const env = { ...process.env, PATH: `${shim}${path.delimiter}${process.env.PATH}` };
    fs.rmSync(output);
    const failed = invoke("render", env);
    if (failed.status !== 1 || !failed.stderr.includes("raw diff unavailable") || fs.existsSync(output) || !canonical.equals(fs.readFileSync(json))) return "raw-Git failure was swallowed or produced an artifact";

    r.blocks.push({ path: "eof.txt", added: "1-3", removed: "1", does: "Changes text", verdict: "keep" });
    let legacy;
    for (const mode of [undefined, "complete"]) {
      r.map_mode = mode; fs.writeFileSync(json, JSON.stringify(r));
      const result = invoke("render", env);
      if (result.status) return `complete now depends on raw Git: ${result.stderr}`;
      const page = fs.readFileSync(output, "utf8");
      if (page.includes('id="raw-diff"') || page.includes("GIT binary patch") || page.includes("\\ No newline at end of file")
        || result.stdout.includes("Full raw Git diff")) return "complete's legacy presentation changed";
      if (invoke("check", env).stdout !== "Review data matches the diff.\n") return "complete stdout changed";
      if (legacy !== undefined && legacy !== result.stdout) return "explicit complete differs from legacy stdout";
      legacy = result.stdout;
    }
    return true;
  });

test("the page that tells a reviewer what to write names every word the check accepts, and its example parses",
  "the vocabulary lives in the check; a page that teaches another word sends the reviewer into a refusal",
  () => {
    const page = fs.readFileSync(path.join(SKILL, "references", "report-data.md"), "utf8");
    const absent = [...VERDICTS, ...UNIT_VERDICTS, ...DIRECTIONS, ...EVIDENCE, ...SOURCES].filter((word) => !page.includes(`\`${word}\``));
    if (absent.length) return `report-data.md does not name ${absent.join(", ")}`;
    const example = /\n {4}\{\n[\s\S]*?\n {4}\}\n/.exec(page);
    try { return Object.keys(JSON.parse(example[0])).sort().join(" ") === [...Object.keys(REVIEW), "language", "mechanisms", "labels", "map_mode"].sort().join(" ") || "the example's fields differ from the fields this suite renders"; }
    catch (error) { return `the example is not JSON: ${error.message}`; }
  });

process.exit(summarize(await runCases(TESTS), TESTS.length));
