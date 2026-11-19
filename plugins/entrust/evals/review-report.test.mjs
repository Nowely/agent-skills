#!/usr/bin/env node
// Does the review skill's report script hold a review to its diff? Runs plugin/skills/review/scripts/report.mjs
// on one prepared case with a review written here; it calls no model. It checks that a complete review becomes
// a page that loads nothing from elsewhere and a printout in the shape SKILL.md gives the report, and that an
// incomplete one is refused with every fault listed. Run it after an edit to those scripts, to
// references/report-data.md or to the report's shape in SKILL.md.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { ROOT, registry, runCases, skip, summarize } from "./lib/harness.mjs";
import { prepare } from "./review/prepare.mjs";
import { reportFixtures, enrich65507, hostileFixture, HOSTILE_PATH, HOSTILE_URL } from "./review/report-fixtures.mjs";
import { CATALOGS, LABELS, labelsOf, requiredKeys } from "../plugin/skills/review/scripts/labels.mjs";
import { check, modelOf, weightOverview, sourceOf, CHALLENGERS, DIRECTIONS, EVIDENCE, OUTCOMES, SOURCES, UNIT_VERDICTS, VERDICTS, QUESTION_KINDS, COVERAGE_KINDS, PURPOSES, purposeOfPath } from "../plugin/skills/review/scripts/review.mjs";
import { page } from "../plugin/skills/review/scripts/page.mjs";
import { createSyntax, highlight } from "../plugin/skills/review/scripts/highlight.mjs";
import { parseDiff } from "../plugin/skills/review/scripts/diff.mjs";
import { decisionRuntime, normalize, settle, applicable, choiceStats, exportOf, validAccept, validDefer } from "../plugin/skills/review/scripts/decisions.mjs";

const { cases: TESTS, test } = registry();
const SKILL = path.join(ROOT, "skills", "review"), SCRIPT = path.join(SKILL, "scripts", "report.mjs");
const { run } = prepare("currency-contract", "clean"), repo = path.join(run, "repo");
const data = path.join(run, "review.json"), html = path.join(run, "review.html");
const patch = path.join(run, "source.diff"), generated = spawnSync("git", ["-c", "core.quotepath=off", "diff", "--no-color", "--no-ext-diff", "--no-renames", "-U3", "HEAD~1..HEAD", "--"], { cwd: repo });
if (generated.status !== 0) throw new Error(`Could not prepare the test diff: ${generated.stderr}`);
fs.writeFileSync(patch, generated.stdout);

const { REVIEW, THEMED } = reportFixtures(createHash("sha256").update(generated.stdout).digest("hex"));
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

test("check and render refuse a question without kind",
  "a question must declare whether it is a decision, fact, or evidence",
  () => {
    const invalid = structuredClone(REVIEW);
    delete invalid.questions[0].kind;
    fs.writeFileSync(data, JSON.stringify(invalid));
    for (const command of ["check", "render"]) {
      const result = report(command, data);
      if (result.status === 0 || !result.stderr.includes("kind is one of decision, fact, evidence"))
        return `${command} accepted a question without kind: ${result.stderr}`;
    }
    return true;
  });

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
    const { stdout, status } = report("lines", patch);
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
    const diagrams = (page.match(/<svg xmlns/g) ?? []).length;
    if (diagrams !== 2) return `expected two structure diagrams, got ${diagrams}`;
    for (const part of ['--shiki-dark:', 'id="b1"', 'id="i1"', 'class="stack overview"', ">How it works now:", ">Target solution:", ">Recommendation:", "<li>One test is missing.</li>", 'id="files"', '<ol class="steps">', 'id="comment"'])
      if (!page.includes(part)) return `the page lacks ${part}`;
    return true;
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
    if (!page.split('id="screens"')[1].includes("Not compared:") || alone.includes("Matches the mockup") || list.includes("Matches the mockup")) return "a screen with no match claimed is not shown as not compared";
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
    const translated = render((r) => { r.labels = { "recommendation": "Что делать", "met": "выполнено", "findings": "Находки", "tab.remaining": "Осталось: {n}" }; });
    if (translated.status !== 0) return `refused: ${translated.stderr}`;
    const page = fs.readFileSync(html, "utf8");
    if (![">Что делать:", ">выполнено<", "Осталось: {n}"].every((word) => page.includes(word)) || !translated.stdout.includes("## Находки")) return "the review's own words are not on the page and in the printout";
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
    const out = render().stdout, labels = ["## Verdict", "How it works now:", "Target solution:", "Recommendation:"];
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
    for (const text of ["Файлы", "Копировать", "Комментировать выделение", "Комментарии к фрагментам", "Рекомендация"])
      if (!page.includes(text)) return `Russian control or export missing: ${text}`;
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
    const cited = render((r) => { r.mechanisms = [{ ...MECHANISM, change: "added", instead: "Read the existing contract; it provides no cache." }]; });
    if (cited.status !== 0) return "a source described without a particular filename syntax was refused";
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
    // A mechanism nobody weighed says so on its card; the printout, read back by the reviewer, leaves it out.
    if (!page.includes("Not assessed") || result.stdout.includes("Not assessed")) return "an unweighed mechanism is missing from the page or printed";
    // Weighed together, a block two mechanisms share counts once: the lines a decision on both would touch.
    const together = "Weighed mechanisms together, each block counted once (A, B): Code: 2 lines added, 1 line removed";
    if (!result.stdout.includes(together) || !page.includes("Weighed mechanisms together, each block counted once</strong> (A, B)")) return `no combined weight:\n${result.stdout.split("## Mechanisms")[1]?.slice(0, 400)}`;
    return page.includes("Shared with") && result.stdout.includes("Shared with")
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
      [(r) => { delete r.requirements[0].source; }, "requirement 1: source is one of task, discussion, project, question, assumption"],
      [(r) => { r.steps[0].findings = [8]; }, "step 1 names finding 8, which is not listed"],
      [(r) => { delete r.findings[1].shown_by; }, 'finding 2 has no "shown_by"'],
      [(r) => { r.units[0].verdict = "improve"; }, "unit readArchive: verdict is one of keep, fix, split, merge, remove"],
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

test("an unlinked block is not presented as unnecessary",
  "an absent requirement link does not prove that deleting the block preserves requirements",
  () => {
    for (const [language, item, group] of [
      ["en", "No requirement link recorded", "Blocks without recorded requirement links"],
      ["ru", "Связь с требованием не указана", "Блоки без указанной связи с требованием"],
    ]) {
      const result = render((r) => { r.language = language; r.blocks[0].serves = []; });
      if (result.status !== 0) return result.stderr;
      const page = fs.readFileSync(html, "utf8");
      if (!page.includes(item) || !page.includes(group) || !result.stdout.includes(item))
        return `${language}: an unlinked block lacks the neutral label`;
      if (page.includes("No requirement would fail without these") || page.includes("Без этих блоков ни одно требование не нарушается")
        || result.stdout.includes("Serves nothing")) return `${language}: an unlinked block is presented as unnecessary`;
    }
    return true;
  });

test("scaffold writes the record's mechanical part: nonblank changed lines in blocks, the diff saved and named, and never over a record",
  "line numbers and coverage were the reviewer's to work out by hand, the commonest reason a record failed its check and a large part of a review's time",
  () => {
    const out = path.join(run, "scaffold"), target = path.join(out, "review.json");
    fs.rmSync(out, { recursive: true, force: true });
    const made = report("scaffold", patch, target);
    if (made.status !== 0) return made.stderr;
    const record = JSON.parse(fs.readFileSync(target, "utf8")), saved = fs.readFileSync(path.join(out, "review.diff"), "utf8");
    if (record.diff?.file !== "review.diff" || record.diff.sha256 !== createHash("sha256").update(saved).digest("hex")) return "the record does not name the saved diff and its digest";
    if (record.range !== "" || record.change.sources.length) return "scaffold claimed a scope or source not supplied in the diff";
    if (record.blocks.some((b) => b.does !== "" || b.verdict !== "")) return "scaffold wrote meaning a reviewer must write";
    // Filled with any meaning, the scaffold's blocks pass the nonblank line check.
    const filled = { ...structuredClone(REVIEW), diff: record.diff, units: [], scenarios: undefined, screens: undefined,
      blocks: record.blocks.map((b) => ({ ...b, does: "Something.", verdict: "keep" })) };
    fs.writeFileSync(target, JSON.stringify(filled));
    const checked = report("check", target);
    if (checked.status !== 0) return `the scaffold's blocks do not cover the diff: ${checked.stderr}`;
    const listed = report("lines", target);
    if (listed.status !== 0 || !listed.stdout.includes("src/invoices/archive.js")) return `lines does not read the record's saved diff: ${listed.stderr}`;
    fs.rmSync(target);
    const again = report("scaffold", patch, target);
    if (again.status === 0 || !again.stderr.includes("never replaces")) return "scaffold wrote over an existing saved diff";
    // The record judges the diff it was made from; a saved diff that changed is refused.
    fs.writeFileSync(target, JSON.stringify(filled));
    fs.appendFileSync(path.join(out, "review.diff"), "\n");
    const refused = report("check", target);
    return refused.status === 1 && refused.stderr.includes("is not the one this record was scaffolded from") || "a record checked against another diff was accepted";
  });

test("scaffold reads a supplied diff outside a repository, splits at declarations, and check warns on one verdict over a large block",
  "the report must work with an existing diff without making a repository snapshot",
  () => {
    const dir = fs.mkdtempSync(path.join(run, "worktree-")), git = (...args) => spawnSync("git", args, { cwd: dir, encoding: "utf8" });
    git("init", "--quiet"); git("config", "user.email", "t@example.invalid"); git("config", "user.name", "t");
    fs.writeFileSync(path.join(dir, "a.js"), "export const a = 1;\n");
    git("add", "a.js"); git("commit", "--quiet", "-m", "base");
    fs.appendFileSync(path.join(dir, "a.js"), "\nexport function one() {\n  return 1;\n}\n\nexport function two() {\n  return 2;\n}\n");
    fs.writeFileSync(path.join(dir, "new.js"), `export function big() {\n${Array.from({ length: 44 }, (_, i) => `  const v${i} = ${i};`).join("\n")}\n}\n`);
    fs.writeFileSync(path.join(dir, "notes.md"), "# Results\n\nOne paragraph.\n\nAnother paragraph.\n\n## Round two\n\nA third.\n\nA fourth.\n");
    git("add", "--all");
    const input = path.join(dir, "input.diff"), prepared = git("-c", "core.quotepath=off", "diff", "--cached", "--no-renames", "-U3");
    if (prepared.status !== 0) return prepared.stderr;
    fs.writeFileSync(input, prepared.stdout);
    const isolated = path.join(run, "outside-repository");
    fs.mkdirSync(isolated, { recursive: true });
    const tool = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: isolated, encoding: "utf8", env: { ...process.env, PATH: "" } });
    const made = tool("scaffold", input, path.join(dir, "out", "review.json"));
    if (made.status !== 0) return made.stderr;
    const record = JSON.parse(fs.readFileSync(path.join(dir, "out", "review.json"), "utf8"));
    const of = (file) => record.blocks.filter((b) => b.path === file);
    if (of("new.js").length !== 1) return "a new untracked file is missing from the record";
    if (of("a.js").length < 2) return `two declarations stayed one block: ${JSON.stringify(of("a.js"))}`;
    // Prose is divided at its headings, not at every paragraph.
    if (of("notes.md").length !== 2) return `a Markdown file with two headings made ${of("notes.md").length} blocks`;
    // A kept block may leave "does" out; the check asks it only of a block that is not kept.
    const filled = { ...structuredClone(REVIEW), diff: record.diff, units: [], scenarios: undefined, findings: [], steps: [], checks: undefined, screens: undefined, ideas: undefined,
      requirements: [{ id: 1, text: "A requirement.", source: "task" }], blocks: record.blocks.map(({ does, ...b }) => ({ ...b, verdict: "keep" })) };
    fs.writeFileSync(path.join(dir, "out", "review.json"), JSON.stringify(filled));
    const checked = tool("check", path.join(dir, "out", "review.json"));
    if (checked.status !== 0) return checked.stderr;
    if (!checked.stderr.includes("keeps 46 lines under one verdict")) return `no warning about the large block: ${checked.stderr}`;
    if (!checked.stderr.includes("serve no requirement")) return `no warning about kept blocks that serve nothing: ${checked.stderr}`;
    // The record checks its saved diff, even if the input is later changed.
    fs.appendFileSync(input, "later changes");
    const later = tool("check", path.join(dir, "out", "review.json"));
    return later.status === 0 || `a record no longer checks after the input changed: ${later.stderr}`;
  });

test("unsupported or incomplete diffs and records without a saved diff are refused",
  "a partial or unrecognized diff must not become a complete-looking report",
  () => {
    const dir = fs.mkdtempSync(path.join(run, "invalid-diff-")), input = path.join(dir, "input.diff"), target = path.join(dir, "review.json");
    const first = "diff --git a/a.js b/a.js\n--- a/a.js\n+++ b/a.js\n@@ -1 +1 @@\n-old\n+new\n";
    for (const value of [first + "diff --git a/old.js b/new.js\n@@ -1 +1 @@\n-a\n+b\n",
      first + "+lost\n", first + "--- a/b.js\n+++ b/b.js\n@@ -1 +1 @@\n-a\n+b\n",
      "diff --git a/a.js b/a.js\n--- a/b.js\n+++ b/b.js\n@@ -1 +1 @@\n-a\n+b\n",
      "diff --git a/a.js b/a.js\nold mode 100644\nnew mode 100755\n--- a/a.js\n+++ b/a.js\n@@ -1 +1 @@\n-a\n+b\n",
      "diff --git a/a.js b/a.js\n--- a/a.js\n+++ b/a.js\n@@ -1,3 +1,3 @@\n one\n", "not a diff\n"]) {
      fs.writeFileSync(input, value);
      const result = report("scaffold", input, target);
      if (result.status !== 1 || fs.existsSync(target)) return `accepted unsupported or incomplete diff: ${value}`;
    }
    // Every file the blocks cannot hold is named in one refusal, so one corrected diff is enough.
    fs.writeFileSync(input, `${first}diff --git a/logo.png b/logo.png\nindex 1..2 100644\nBinary files a/logo.png and b/logo.png differ\n`
      + "diff --git a/run.sh b/run.sh\nold mode 100644\nnew mode 100755\n");
    const named = report("scaffold", input, target);
    if (named.status !== 1 || !named.stderr.includes("logo.png (no text lines") || !named.stderr.includes("run.sh (a file mode change)")) return `the files the blocks cannot hold were not all named: ${named.stderr}`;
    fs.writeFileSync(input, "\x1b[1mdiff --git a/a.js b/a.js\x1b[m\n");
    const colored = report("scaffold", input, target);
    if (colored.status !== 1 || !colored.stderr.includes("--no-color")) return `a colored diff gave no way out: ${colored.stderr}`;
    const legacy = { ...structuredClone(REVIEW) };
    delete legacy.diff;
    fs.writeFileSync(target, JSON.stringify(legacy));
    const result = report("check", target);
    return result.status === 1 && result.stderr.includes("no saved diff") || "a record without a saved diff was accepted";
  });

test("a block kept for a rule of the project instructions is not warned about as kept for an assumption",
  "version bumps and docs required by the project could only be labelled assumptions, and the warning named dozens of blocks that asked nothing",
  () => {
    const done = render((r) => { r.requirements.find((q) => q.id === 3).source = "project"; r.blocks[0].serves = [3]; });
    if (done.status !== 0) return done.stderr;
    return !done.stderr.includes("serve only assumed requirements") || `warned: ${done.stderr}`;
  });

test("a diff whose filename has spaces is read with its file headers",
  "ordinary file headers may end in a tab after the path",
  () => {
    const input = path.join(run, "space.diff");
    fs.writeFileSync(input, "diff --git a/hello world.txt b/hello world.txt\n--- a/hello world.txt\t\n+++ b/hello world.txt\t\n@@ -1 +1 @@\n-before\n+after\n");
    const result = report("lines", input);
    return result.status === 0 && result.stdout.includes("hello world.txt\n") && /\+1\s+after/.test(result.stdout) || result.stderr || result.stdout;
  });

test("a block or unit whose premise is unread is a question, and a point against the draft is rejected only on a place that refutes it",
  "an unknown premise could only be recorded as keep, and the points of the independent target, the critic and the verifier left no trace on the page",
  () => {
    const asked = render((r) => { r.blocks[2].verdict = "question"; r.units[0].verdict = "question"; r.challenges[0].at = ""; });
    if (asked.status !== 1) return "a question naming no question, and a rejection citing no place, were accepted";
    for (const fault of ["block 3 is a question and names none", "unit readArchive is a question and names none", "challenge 1 is rejected"])
      if (!asked.stderr.includes(fault)) return `not refused: ${fault}\n${asked.stderr}`;
    const done = render((r) => { r.blocks[2] = { ...r.blocks[2], verdict: "question", questions: [1], unit: "readArchive" }; r.blocks[0].serves = [3]; });
    if (done.status !== 0) return done.stderr;
    if (!done.stderr.includes("kept blocks 1 serve only assumed requirements")) return `no warning about a block kept for an assumption: ${done.stderr}`;
    if (!done.stderr.includes("unit readArchive is kept, and its blocks 3 are not")) return `no warning about a kept unit with an open block: ${done.stderr}`;
    const page = fs.readFileSync(html, "utf8");
    if (!page.includes('id="challenges"') || !page.includes('href="#q1">Q1</a>') || !page.includes('id="q1"')) return "the page shows no challenges or no link from the block to its question";
    return /## Challenges\n1\. critic: The reader should not convert\. Rejected: .*src\/main\.js:4/.test(done.stdout) && done.stdout.includes("Question (Q1)") || `the printout lacks the challenges or the question:\n${done.stdout}`;
  });

test("the page that tells a reviewer what to write names every word the check accepts, and its example parses",
  "the vocabulary lives in the check; a page that teaches another word sends the reviewer into a refusal",
  () => {
    const page = fs.readFileSync(path.join(SKILL, "references", "report-data.md"), "utf8");
    const absent = [...VERDICTS, ...UNIT_VERDICTS, ...DIRECTIONS, ...EVIDENCE, ...SOURCES, ...CHALLENGERS, ...OUTCOMES, ...QUESTION_KINDS, ...COVERAGE_KINDS].filter((word) => !page.includes(`\`${word}\``));
    if (absent.length) return `report-data.md does not name ${absent.join(", ")}`;
    const example = /\n {4}\{\n[\s\S]*?\n {4}\}\n/.exec(page);
    // The example carries the optional fields of the decision cards too; the legacy REVIEW below renders without them.
    try { return Object.keys(JSON.parse(example[0])).sort().join(" ") === [...Object.keys(REVIEW), "language", "mechanisms", "labels", "tradeoffs", "coverageStructured", "passport"].sort().join(" ") || "the example's fields differ from the fields this suite renders"; }
    catch (error) { return `the example is not JSON: ${error.message}`; }
  });

const parseThemeDiff = () => parseDiff(generated.stdout.toString("utf8"));
const modelOfThemed = () => {
  const files = parseThemeDiff(), { errors, owner } = check(THEMED, files, run);
  if (errors.length) throw new Error(errors.join("; "));
  return modelOf(THEMED, files, owner, run);
};

test("the minimal record is valid and warning-free; the themed record with decision cards passes check",
  "optional fields must not make a record without them deficient, and a record of another theme and order must stand on its own",
  () => {
    const files = parseThemeDiff();
    const minimal = check(REVIEW, files, run);
    if (minimal.errors.length || minimal.warnings.length) return `minimal record: ${[...minimal.errors, ...minimal.warnings].join("; ")}`;
    const themed = check(THEMED, files, run);
    if (themed.errors.length) return `themed record: ${themed.errors.join("; ")}`;
    // The external source carries a quote and its file is not beside the record: named, unreachable, a warning only.
    if (!themed.warnings.some((w) => w.includes("not beside the record"))) return `no warning for an unreachable source: ${themed.warnings}`;
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    return result.status === 0 || `themed render refused: ${result.stderr}`;
  });

test("check refuses broken card references: cycles, self-parent, bad refs, duplicate variant ids, permission met",
  "a card whose links do not resolve reads as grounded when it is not",
  () => {
    const files = parseThemeDiff();
    const faults = [
      [(r) => { r.questions[2].parent = { question: 4, variants: ["narrow"] }; }, "parent chain is a cycle"],
      [(r) => { r.questions[2].parent = { question: 3, variants: ["status-quo"] }; }, "parent is itself"],
      [(r) => { r.questions[3].parent = { question: 9, variants: ["x"] }; }, "parent names question 9"],
      [(r) => { r.questions[3].parent.variants = ["absent"]; }, 'names "absent", which is not a variant of question 3'],
      [(r) => { r.questions[2].context[0].sources = [{ ref: "/requirements/99" }]; }, 'source ref "/requirements/99" names nothing'],
      [(r) => { r.questions[2].context[0].sources = [{ ref: "/nope/0" }]; }, "names nothing in the record"],
      [(r) => { r.questions[2].context[0].sources = []; }, "names no source"],
      [(r) => { r.questions[2].variants[1].id = "status-quo"; }, 'variant id "status-quo" appears twice'],
      [(r) => { r.questions[2].recommendation.variant = "absent"; }, 'names variant "absent", which is not listed'],
      [(r) => { r.questions[2].remainingEvidence = [2]; }, "which is not of kind evidence"],
      [(r) => { r.questions[2].remainingEvidence = [9]; }, "names question 9, which is not listed"],
      [(r) => { r.questions[0].kind = "visual"; }, "kind is one of decision, fact, evidence"],
      [(r) => { r.requirements[3].met = "read"; }, "is a permission, not an obligation"],
      [(r) => { r.coverageStructured[0].kind = "guessed"; }, "kind is one of ran, read, not_checked"],
      [(r) => { r.tradeoffs[0].sources = undefined; }, "names no source"],
      [(r) => { r.passport.links[0].url = "javascript:alert(1)"; }, "url is an http(s) link"],
      [(r) => { r.questions[3].parent.variants = []; }, "parent lists no variants"],
    ];
    for (const [change, fault] of faults) {
      const r = structuredClone(THEMED); change(r);
      const { errors } = check(r, files, run);
      if (!errors.some((e) => e.includes(fault))) return `expected "${fault}", got: ${errors.join("; ") || "no errors"}`;
    }
    // Warnings, not faults: a historical picture without a revision, an external source without a quote.
    const thin = structuredClone(THEMED);
    delete thin.screens[1].revision;
    thin.questions[1].context = [{ text: "A claim.", sources: [{ at: "elsewhere.md:3" }] }];
    const { errors, warnings } = check(thin, files, run);
    return !errors.length && warnings.some((w) => w.includes("names no revision")) && warnings.some((w) => w.includes("has no quote"))
      || `thin card: errors ${errors.join("; ")}; warnings ${warnings.join("; ")}`;
  });

test("check lists faults instead of throwing on malformed lists, and a run without a revision is warned about",
  "a non-array field crashed the validation with an exception instead of a fault list; a ran claim on an external source said nothing about its version",
  () => {
    const files = parseThemeDiff();
    const mutations = [
      [(r) => { r.questions[3].parent.variants = "extend"; }, "parent"],
      [(r) => { r.questions[2].variants = "status-quo"; }, "variants is not a list"],
      [(r) => { r.questions[2].context = "plain text"; }, "context is not a list"],
      [(r) => { r.questions[2].variants[0].consequences = "plain text"; }, "consequences is not a list"],
      [(r) => { r.questions[2].context[0].sources = "a source"; }, "names no source"],
      [(r) => { r.questions[2].remainingEvidence = "1"; }, "remainingEvidence is not a list"],
      [(r) => { r.questions[0].zones = "a zone"; }, "zone is not a list"],
      [(r) => { r.steps = "a step"; }, '"steps" is not a list'],
      [(r) => { r.checks = "a check"; }, '"checks" is not a list'],
      [(r) => { r.ideas = "an idea"; }, '"ideas" is not a list'],
      [(r) => { r.challenges = "a challenge"; }, '"challenges" is not a list'],
      [(r) => { r.screens = "a screen"; }, '"screens" is not a list'],
      [(r) => { r.units = "a unit"; }, '"units" is not a list'],
      [(r) => { r.target_units = "a unit"; }, '"target_units" is not a list'],
      [(r) => { r.screens[0].differences = "a difference"; }, "differences is not a list"],
    ];
    for (const [change, fault] of mutations) {
      const r = structuredClone(THEMED); change(r);
      let result;
      try { result = check(r, files, run); } catch (error) { return `check threw on ${fault}: ${error.message}`; }
      if (!result.errors.length || !result.errors.some((e) => e.includes(fault))) return `expected a fault containing "${fault}", got: ${result.errors.join("; ") || "none"}`;
    }
    // A ran statement on an external source without a revision: a warning; a read statement without one: none.
    const ran = structuredClone(THEMED); delete ran.coverageStructured[0].revision;
    const warned = check(ran, files, run);
    if (warned.errors.length || !warned.warnings.some((w) => w.includes("without a revision"))) return `a run without a revision was not warned about: ${warned.errors.join("; ")} / ${warned.warnings.join("; ")}`;
    const read = structuredClone(THEMED);
    read.coverageStructured = [{ kind: "read", text: "The contract was read.", sources: [{ at: "elsewhere.md:3", quote: "the rule" }] }];
    read.screens[1].sources = [{ ref: "/coverageStructured/0" }];
    const readChecked = check(read, files, run);
    if (readChecked.errors.length) return `the read statement record broke elsewhere: ${readChecked.errors.join("; ")}`;
    if (readChecked.warnings.some((w) => w.includes("without a revision"))) return "a read statement was asked for a revision";
    return true;
  });

test("a finding id is validated, and even a hostile one reaches an href escaped",
  "an id with a quote or markup rode into a source anchor unescaped; the check accepted any string as an id",
  () => {
    const files = parseThemeDiff(), hostile = '1" onmouseover="alert(1)';
    const r = structuredClone(THEMED);
    r.findings[0].id = hostile;
    // Keep the references resolving, so only the id format is at fault and the renderer can be exercised.
    r.blocks[1].findings = [hostile]; r.steps[0].findings = [hostile]; r.screens[0].differences[1].finding = hostile;
    r.questions[2].context[0].sources = [{ ref: "/findings/0" }];
    const { errors } = check(r, files, run);
    if (!errors.some((e) => e.includes('id is letters, digits'))) return `a hostile finding id was accepted: ${errors.join("; ")}`;
    // Defense in depth: the renderer escapes the anchor even for a record that never passed the check.
    const { owner } = check(THEMED, files, run);
    const html = page(r, files, modelOf(r, files, owner, run));
    if (html.includes(`href="#f${hostile}"`)) return "the hostile id reached an href unescaped";
    if (!html.includes(`href="#f1&quot; onmouseover=&quot;alert(1)"`)) return "the hostile id is not shown escaped in the source anchor";
    return true;
  });

test("modelOf derives children, unique counters, file status and the shortest unique path",
  "stored children drift from parents, summed counters double-count, and a fixed short path guesses the package root",
  () => {
    const model = modelOfThemed();
    if (model.questions[2].children.join() !== "4" || model.questions[3].children.length) return "children are not derived from parent alone";
    if (model.questions[0].blocks !== 1 || model.questions[4].blocks !== 1) return "per-question fragment counts differ";
    // One fragment names both evidence questions: it is one fragment awaiting evidence, not two.
    if (model.counters.evidenceBlocks !== 1) return `evidence fragments double-counted: ${model.counters.evidenceBlocks}`;
    if (model.counters.decisions !== 2 || model.counters.blocks !== 3) return "decision or block counters differ";
    const byPath = Object.fromEntries(model.files.map((f) => [f.path, f]));
    if (byPath["src/invoices/archive.js"].status !== "M" || byPath["test/archive.test.js"].status !== "A" || byPath["test/outputs.test.js"].status !== "A") return "file status is not taken from the diff headers";
    if (model.counters.addedFiles !== 2 || model.counters.removedFiles !== 0 || model.counters.modifiedFiles !== 1) return "file counters differ from the statuses";
    const shorts = model.files.map((f) => f.short);
    if (new Set(shorts).size !== shorts.length) return "short paths collide";
    for (const f of model.files) if (!f.path.endsWith(f.short)) return `short path is not a suffix: ${f.short}`;
    if (byPath["src/invoices/archive.js"].short !== "archive.js") return "the shortest unique suffix was not chosen";
    // A deleted file keeps its status; the source of a claim resolves to the item it names.
    const deleted = parseDiff("diff --git a/gone.js b/gone.js\n--- a/gone.js\n+++ /dev/null\n@@ -1 +0,0 @@\n-old\n");
    if (deleted[0].status !== "D") return "a deleted file is not marked D";
    if (sourceOf({ ref: "/requirements/3" }, THEMED).text !== "R4") return "an internal source does not resolve to its requirement id";
    if (sourceOf({ ref: "/questions/0" }, THEMED).anchor !== "#q1") return "an internal source has no anchor";
    if (!sourceOf({ at: "a.js:1", revision: "abc", quote: "x" }, THEMED).text.includes("@ abc")) return "an external source loses its revision";
    return true;
  });

test("a custom catalog carries the base words plus the keys of the controls the record shows",
  "v7 Code wording is required even on old records, without silently substituting a different meaning",
  () => {
    const files = parseThemeDiff();
    const catalogFor = (r) => Object.fromEntries(requiredKeys(r).map((key) => [key, LABELS[key]]));
    // Remove current mandatory wording from an otherwise complete catalog.
    const oldCatalog = catalogFor(REVIEW); delete oldCatalog["code.no-related"]; delete oldCatalog["code.no-visible"];
    const legacy = check({ ...structuredClone(REVIEW), language: "custom", labels: oldCatalog }, files, run);
    if (!legacy.errors.some((e) => e.includes("code.no-related") && e.includes("code.no-visible"))) return "old catalog missing Code wording was not refused";
    const thin = { ...oldCatalog }; delete thin["findings"];
    const baseFault = check({ ...structuredClone(REVIEW), language: "custom", labels: thin }, files, run);
    if (!baseFault.errors.some((e) => e.includes("complete labels catalog"))) return "the old base set stopped being required";
    // An enriched record asks for the chrome and the keys of its capabilities; the old catalog no longer serves it.
    const enriched = check({ ...structuredClone(THEMED), language: "custom", labels: oldCatalog }, files, run);
    if (!enriched.errors.some((e) => e.includes("complete labels catalog"))) return "an enriched record with an old catalog was accepted, or the chrome keys were not named";
    const full = check({ ...structuredClone(THEMED), language: "custom", labels: catalogFor(THEMED) }, files, run);
    if (full.errors.length) return `a catalog of the enabled capabilities was refused: ${full.errors.join("; ")}`;
    // One capability alone asks only for its own keys plus the chrome: a passport without cards needs no question words.
    const passportOnly = { ...structuredClone(REVIEW), questions: [], passport: structuredClone(THEMED.passport) };
    if (requiredKeys(passportOnly).includes("question.kind.decision")) return "a record without cards was asked for the card words";
    const minimal = check({ ...passportOnly, language: "custom", labels: catalogFor(passportOnly) }, files, run);
    if (minimal.errors.length) return `a passport-only catalog was refused: ${minimal.errors.join("; ")}`;
    const missing = catalogFor(passportOnly); delete missing["passport.diffSha"];
    const refused = check({ ...passportOnly, language: "custom", labels: missing }, files, run);
    return refused.errors.some((e) => e.includes("passport.diffSha")) || "a missing capability key was not named";
  });

test("the full printout carries the cards, tradeoffs and coverage limits, and the digest of the record's bytes",
  "the critic and verifier read text, not HTML: an analytical field that lives only on the page is unchecked",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const out = result.stdout;
    for (const part of ["TASK-9 (https://tracker.example/TASK-9)", "example/repo", "## Accepted tradeoffs", "Legacy keeps the old path.",
      "What remains: External consumers of it are unknown.", "R4", "(decision; owner)", "status-quo: Keep the conversion in the reader",
      "Consequences: No new unit; the display stays simple. (R1)", "Keep it in this change. [status-quo]", "The reviewer's opinion; the owner decides.",
      "What this decision does not replace: Q1, Q5", "Depends on: Q3 (extend)", "Zones to check:", "Ran: The suite ran on the working copy. @ head",
      "Not checked: The list was not seen on screen.", "(historical revision @ abc123)", "permission, not an obligation"])
      if (!out.includes(part)) return `the printout lacks "${part}"`;
    const digest = createHash("sha256").update(fs.readFileSync(data)).digest("hex");
    if (!out.includes(`record ${digest}`)) return "the printout does not carry the record's byte digest";
    if (!out.includes(`diff sha256 ${THEMED.diff.sha256}`)) return "the printout does not carry the diff digest";
    // The legacy printout keeps its old shape: no card machinery, no passport, no invented sections.
    const legacy = render();
    if (legacy.status !== 0) return legacy.stderr;
    for (const absent of ["## Accepted tradeoffs", "Passport:", "(decision", "Ran:"])
      if (legacy.stdout.includes(absent)) return `the legacy printout grew "${absent}"`;
    if (!legacy.stdout.includes("- Q1 `docs/billing.md`: A question.")) return "the legacy question line changed";
    return legacy.stdout.includes(`record ${createHash("sha256").update(fs.readFileSync(data)).digest("hex")}`) || "the legacy printout lacks the digest";
  });

// The decision runtime on a small stand: Q1 a decision with two variants, Q2 its child applying under "keep",
// Q3 evidence, Q4 a decision with no variants. No DOM is involved.
const DQS = [
  { id: 1, kind: "decision", variants: [{ id: "keep", text: "Keep" }, { id: "revert", text: "Revert" }] },
  { id: 2, kind: "decision", parent: { question: 1, variants: ["keep"] }, variants: [{ id: "a", text: "A" }] },
  { id: 3, kind: "evidence" },
  { id: 4, kind: "decision" },
];
const dstate = (questions = {}, notes = {}) => normalize({ questions, notes });

test("a chosen radio alone never suppresses children; an accepted outside variant does, and no answer returns silently",
  "applicability rests on the parent's accepted decision, not on a selection the owner has not made",
  () => {
    const selected = dstate({ 1: { variant: "keep" }, 2: { choice: "accepted", variant: "a" } });
    if (!applicable(DQS[1], selected, DQS)) return "a radio selection without acceptance suppressed the child";
    if (exportOf(DQS, selected, {}).questions.find(q => q.question === 2).status !== "accepted") return "the child acceptance was lost";
    const kept = dstate({ 1: { choice: "accepted", variant: "keep" }, 2: { choice: "accepted", variant: "a" } });
    if (!applicable(DQS[1], kept, DQS)) return "the child under the accepted applicable variant was not active";
    const reverted = dstate({ 1: { choice: "accepted", variant: "revert" }, 2: { choice: "accepted", variant: "a" } });
    if (applicable(DQS[1], reverted, DQS)) return "the child stayed applicable under the accepted outside variant";
    const settled = settle(DQS, reverted);
    if (settled.questions[2]?.choice) return "settle kept the answer of a not-applicable child";
    if (settled.questions[2]?.variant !== "a") return "settle lost the draft variant of a not-applicable child";
    if (exportOf(DQS, settled, {}).questions.find(q => q.question === 2).status !== "not-applicable") return "retired child exported as active";
    // The parent's decision is cancelled: the child applies again, but its old answer does not return silently.
    const cancelled = settle(DQS, dstate({ 2: settled.questions[2] }));
    if (!applicable(DQS[1], cancelled, DQS) || cancelled.questions[2]?.choice) return "the old answer reactivated silently after the parent was cancelled";
    if (exportOf(DQS, cancelled, {}).questions.find(q => q.question === 2).status !== "remaining") return "the child did not return as remaining";
    // A chain: the grandchild follows its parent's applicability.
    const chain = [...DQS, { id: 5, kind: "decision", parent: { question: 2, variants: ["a"] } }];
    const deep = dstate({ 1: { choice: "accepted", variant: "revert" }, 2: { choice: "accepted", variant: "a" }, 5: { choice: "accepted" } });
    if (applicable(chain[4], deep, chain)) return "a grandchild stayed applicable while its parent is not";
    if (settle(chain, deep).questions[5]?.choice) return "settle kept the grandchild's answer";
    return true;
  });

test("deferred needs a reason and never counts as accepted; evidence cannot be decided; acceptance needs content",
  "a counter of accepted decisions inflated by deferrals, evidence closed as decided, or empty acceptances misleads the owner",
  () => {
    const bare = dstate({ 4: { choice: "deferred" } });
    if (validDefer(DQS[3], bare)) return "a deferral without a reason was counted";
    const reasoned = dstate({ 4: { choice: "deferred" } }, { q4: "Not now: the contract is unsettled." });
    if (!validDefer(DQS[3], reasoned) || choiceStats(DQS, reasoned, []).deferred !== 1) return "reasoned deferral was not counted";
    const evidence = dstate({ 3: { choice: "accepted" } }, { q3: "done" });
    if (exportOf(DQS, evidence, {}).questions.some(q => q.question === 3)) return "an evidence question was counted as an accepted decision";
    const emptyAccept = dstate({ 4: { choice: "accepted" } });
    if (validAccept(DQS[3], emptyAccept)) return "a decision without variants was accepted with no comment";
    const commented = dstate({ 4: { choice: "accepted" } }, { q4: "Keep as is." });
    if (!validAccept(DQS[3], commented)) return "a substantive comment did not accept a variant-less decision";
    const noVariant = dstate({ 1: { choice: "accepted" } });
    if (validAccept(DQS[0], noVariant)) return "a decision with variants was accepted without choosing one";
    return true;
  });

test("an invalid acceptance or deferral is not a decision anywhere: applicability, counters, export",
  "a bare click exported as accepted retired children and closed decisions the owner never made",
  () => {
    // Accepted without a variant: not accepted, and the child stays applicable with its answer.
    const bare = dstate({ 1: { choice: "accepted" }, 2: { choice: "accepted", variant: "a" } });
    if (applicable(DQS[1], bare, DQS) !== true) return "an acceptance without a variant retired the child";
    if (settle(DQS, bare).questions[2]?.choice !== "accepted") return "settle dropped the child's answer under an invalid acceptance";
    if (choiceStats(DQS, bare, []).remaining !== 2) return "invalid root acceptance changed remaining";
    const out = exportOf(DQS, settle(DQS, bare), {});
    if (out.questions.find((q) => q.question === 1).status !== "remaining") return "the export called a bare acceptance accepted";
    if (out.questions.find((q) => q.question === 2).status === "not-applicable") return "the export retired a child under an invalid acceptance";
    // Deferred without a reason: not deferred in the export either.
    const bareDefer = dstate({ 4: { choice: "deferred" } });
    const deferred = exportOf(DQS, bareDefer, {});
    if (deferred.questions.find((q) => q.question === 4).status !== "remaining") return "the export called a reasonless deferral deferred";
    // A valid acceptance of a variant-less decision (a comment) is exported as accepted.
    const commented = dstate({ 4: { choice: "accepted" } }, { q4: "Keep as is." });
    if (!validAccept(DQS[3], commented) || exportOf(DQS, commented, {}).questions.find((q) => q.question === 4).status !== "accepted")
      return "a commented acceptance of a variant-less decision was not exported as accepted";
    return true;
  });

test("the export carries the schema, both digests, the question number, the variant id and text, comment and status",
  "an export of ids alone cannot be read back, and one without digests cannot be tied to its revision",
  () => {
    const state = dstate({ 1: { choice: "accepted", variant: "keep" }, 2: { choice: "accepted", variant: "a" }, 4: { choice: "deferred" } }, { q4: "Later." });
    const out = exportOf(DQS, settle(DQS, state), { recordSha: "r".repeat(64), diffSha: "d".repeat(64), key: "abc", title: "T", range: "base..head" });
    if (out.schema_version !== 5 || out.record_sha256 !== "r".repeat(64) || out.diff_sha256 !== "d".repeat(64)) return "the export lacks its schema or digests";
    const q1 = out.questions.find((q) => q.question === 1);
    if (q1.status !== "accepted" || q1.variant?.id !== "keep" || q1.variant?.text !== "Keep") return "the export lacks the variant's id and text";
    const q4 = out.questions.find((q) => q.question === 4);
    if (q4.status !== "deferred" || q4.comment !== "Later.") return "the export lacks the deferral's status or comment";
    if (out.questions.some((q) => q.question === 3)) return "an evidence question was exported as a decision";
    const reverted = exportOf(DQS, settle(DQS, dstate({ 1: { choice: "accepted", variant: "revert" }, 2: { choice: "accepted", variant: "a" } })), {});
    if (reverted.questions.find((q) => q.question === 2).status !== "not-applicable") return "a not-applicable child was exported as active";
    return true;
  });

test("the page renders each B/F/Q anchor once, the counters equal the model, and the record's bytes stay untouched",
  "duplicated anchors break deep links, counters that differ from the model misstate the scale, and a render must not rewrite its record",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8"), before = fs.readFileSync(data);
    const model = modelOfThemed();
    for (const id of ["b1", "b2", "b3", "f1", "f2", "q1", "q2", "q3", "q4", "q5"])
      if ((page.match(new RegExp(`id="${id}"`, "g")) ?? []).length !== 1) return `anchor ${id} does not appear exactly once`;
    for (const cell of [`Files · ${model.files.length}`, `Blocks: ${model.blocks.length}`, 'id="count-decisions"'])
      if (!page.includes(cell)) return `the counters differ from the model: missing ${cell}`;
    if ((page.match(/class="qcard/g) ?? []).length !== 5) return "the five kinded questions did not become cards";
    if (!page.includes('data-parent="3"') || !page.includes('name="vq3"')) return "the child card or the variant radios are missing";
    // The full map is real markup in per-file disclosures, not a template.
    if (!page.includes('<details class="file-details"') || page.includes("<template")) return "the map is not a no-JS disclosure";
    // Deterministic render, and the digest in the page is the digest of these bytes.
    const again = report("render", data);
    if (again.status !== 0 || !before.equals(fs.readFileSync(data)) || page !== fs.readFileSync(html, "utf8")) return "the themed render is not byte-stable or touched the record";
    const digest = createHash("sha256").update(before).digest("hex");
    const embedded = JSON.parse(/<script id="data" type="application\/json">(.*?)<\/script>/s.exec(page)[1]);
    if (embedded.digest.record !== digest || embedded.digest.diff !== THEMED.diff.sha256) return "the page's digests are not the bytes' digests";
    // The simpler record renders its fact through the same path.
    const legacy = render();
    if (legacy.status !== 0) return legacy.stderr;
    const old = fs.readFileSync(html, "utf8");
    if (!old.includes('id="q1"') || !old.includes("A question.")) return "the fact question is missing";
    return true;
  });

test("the question tree renders every level once, including fact children and roots",
  "roots plus direct children must not lose grandchildren or duplicate their ids",
  () => {
    const result = render((r) => {
      Object.assign(r, structuredClone(THEMED));
      // Q3 -> Q4 -> Q6 -> Q7, plus an independent fact Q8.
      r.questions.push(
        { at: "src/invoices/upper.js:2", text: "Which widths exactly?", kind: "decision", resolver: "owner",
          parent: { question: 4, variants: ["narrow"] },
          variants: [{ id: "x", text: "The narrow set", consequences: [{ text: "Less to check.", sources: [{ ref: "/requirements/0" }] }] }] },
        { at: "docs/billing.md", text: "A child of the grandchild.", kind: "fact", parent: { question: 6, variants: ["x"] } },
        { at: "docs/billing.md", text: "An independent fact.", kind: "fact" });
    });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    for (const id of ["q3", "q4", "q6", "q7", "q8"])
      if ((page.match(new RegExp(`id="${id}"`, "g")) ?? []).length !== 1) return `anchor ${id} does not appear exactly once`;
    if (!page.includes('data-parent="4"')) return "the grandchild lost its parent link";
    const order = ["q3", "q4", "q6", "q7"].map((id) => page.indexOf(`id="${id}"`));
    if (order.some((at, i) => at < 0 || (i && at <= order[i - 1]))) return "the tree is not drawn root-first down the chain";
    if ((page.match(/class="qcard/g) ?? []).length !== 8) return "the eight questions are not all cards";
    return true;
  });

test("a mechanism's findings stand as related findings, never as an invented consequence; historical screens carry their sources in the printout",
  "the first finding's text presented as the mechanism's consequence is analysis outside the record; the printout dropped the screen's sources",
  () => {
    const result = render((r) => { Object.assign(r, structuredClone(THEMED)); r.mechanisms = [{ ...MECHANISM, findings: [1, 2] }]; });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    const card = page.match(/<article class="finding mechanism" id="m1"[\s\S]*?<\/article>/)?.[0];
    if (!card) return "the mechanism card is missing";
    if (card.includes("Why change it") || card.includes("What happens.") || card.includes("What breaks.")) return "a finding's text is presented as the mechanism's consequence";
    if (!card.includes("Findings:") || !card.includes('href="#f1"') || !card.includes('href="#f2"')) return "the related findings are not listed neutrally";
    const md = result.stdout.split("## Mechanisms")[1].split("## Structure")[0];
    if (!md.includes("Findings: 1, 2") || md.includes("What happens.") || md.includes("Why change it")) return "the printout lacks the neutral related findings or invents a consequence";
    if (!result.stdout.includes("(coverageStructured 2)")) return "the historical screen's sources are missing from the printout";
    return true;
  });

test("without scripts the variant radios and zone checks are disabled and say they need JavaScript",
  "interactive-looking controls that cannot save mislead the no-script reader",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    if (!/<input type="radio" name="vq3"[^>]*disabled>/.test(page)) return "the variant radios are not disabled for the no-script reader";
    if (!/<input type="checkbox" data-zone="1-0" disabled>/.test(page)) return "the zone checks are not disabled for the no-script reader";
    if (!page.includes("Choosing here needs JavaScript")) return "the no-script hint is missing";
    if (!page.includes(".js .nojs-note { display: none }")) return "the hint does not hide once the runtime runs";
    if (!page.includes('control.disabled = false')) return "the runtime does not enable the controls";
    return true;
  });

test("the passport's digest words are localized in the page, the footer and the printout",
  "hardcoded English words in the passport and the details line stood untranslated in a Russian report",
  () => {
    const result = render((r) => { Object.assign(r, structuredClone(THEMED)); r.language = "ru"; });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    if (!page.includes("sha256 diff") || !page.includes("запись")) return "the passport or the footer keeps hardcoded English digest words";
    if (page.includes("diff sha256")) return "the English digest word leaked into the Russian page";
    const digest = createHash("sha256").update(fs.readFileSync(data)).digest("hex");
    if (!result.stdout.includes(`sha256 diff ${THEMED.diff.sha256}`) || !result.stdout.includes(`запись ${digest}`)) return "the printout's digest words are not localized";
    return true;
  });

test("texts reach the page as text: a script in a question, markup in a variant, quotes in a comment",
  "the page shows private code; a record's text run as markup is an injection",
  () => {
    const result = render((r) => {
      Object.assign(r, structuredClone(THEMED));
      r.questions[2].text = 'Keep it? </script><script>alert(1)</script> <img src=x onerror=alert(1)>';
      r.questions[2].variants[0].text = '<b onclick="x">bold</b> & "quoted"';
      r.passport.links[0].label = '<script>x</script>';
    });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    if (page.includes("</script><script>alert(1)</script>") || page.includes('<img src=x onerror') || page.includes('<b onclick')) return "a record text reached the page as markup";
    if (!page.includes("&lt;/script&gt;") || !page.includes("&lt;b onclick")) return "the hostile text is not shown escaped";
    if ((page.match(/<script/g) ?? []).length !== 2) return "the page grew a script element";
    return true;
  });

// The real record of review 65507 is immutable; this case works on a COPY enriched with the new fields, taking
// the approved prototype's annotations as the example content. The original's bytes are verified untouched.
const SOURCE_65507 = process.env.REVIEW_65507_DIR ?? "/private/tmp/entrust/cloud-components/65507-review-current";
const ANN_65507 = process.env.REVIEW_65507_ANNOTATIONS ?? "/private/tmp/entrust/65507-review-analysis/prototype/annotations-v2.json";
test("a copy of the real 65507 record, enriched with the new fields, checks and renders its cards",
  "the port must stand on a real record of another scale and language, without touching the immutable original",
  () => {
    const recordPath = path.join(SOURCE_65507, "review.json");
    if (!fs.existsSync(recordPath) || !fs.existsSync(ANN_65507)) return skip(`the 65507 record or its annotations are not on this machine (${SOURCE_65507})`);
    const originalBytes = fs.readFileSync(recordPath), originalSha = createHash("sha256").update(originalBytes).digest("hex");
    const ann = JSON.parse(fs.readFileSync(ANN_65507, "utf8"));
    const dir = path.join(run, "enriched-65507");
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(SOURCE_65507, "review.diff"), path.join(dir, "review.diff"));
    const review = JSON.parse(originalBytes.toString("utf8"));
    enrich65507(review, ann);
    const copy = path.join(dir, "review.json");
    fs.writeFileSync(copy, JSON.stringify(review, null, 2));
    const checked = report("check", copy);
    if (checked.status !== 0) return `the enriched copy does not check: ${checked.stderr.slice(0, 800)}`;
    const drawn = report("render", copy);
    if (drawn.status !== 0) return `the enriched copy does not render: ${drawn.stderr.slice(0, 800)}`;
    const page = fs.readFileSync(path.join(dir, "review.html"), "utf8");
    if ((page.match(/class="qcard/g) ?? []).length !== 13) return "the thirteen questions did not become cards";
    if (!page.includes('data-parent="2"') || !page.includes('id="q9"')) return "the conditional children are not linked to Q2";
    if (!page.includes("CLOUDFRONT-65507") || !page.includes("Паспорт")) return "the passport is missing";
    if (!page.includes('id="coverage"') || !page.includes("2049")) return "the authored coverage is missing";
    if (!drawn.stdout.includes("## Принятые компромиссы") || !drawn.stdout.includes("Варианты:")) return "the Russian printout lacks the tradeoffs or the cards";
    // The counters on the page equal the model computed from the same bytes.
    const files = parseDiff(fs.readFileSync(path.join(dir, "review.diff"), "utf8"));
    const { errors, owner } = check(review, files, dir);
    if (errors.length) return errors.join("; ");
    const model = modelOf(review, files, owner, dir);
    for (const cell of [`Файлы · ${model.files.length}`, `Блоки: ${model.blocks.length}`, 'id="count-decisions"'])
      if (!page.includes(cell)) return `the page counters differ from the model: missing ${cell}`;
    if (model.counters.evidenceBlocks !== 224 + 4 - model.blocks.filter((b) => b.questions.includes(3) && b.questions.includes(5)).length) return "evidence fragments are not a unique set";
    // Deterministic at this scale, and the immutable original never changed.
    const again = report("render", copy);
    if (again.status !== 0 || page !== fs.readFileSync(path.join(dir, "review.html"), "utf8")) return "the enriched render is not byte-stable";
    return createHash("sha256").update(fs.readFileSync(recordPath)).digest("hex") === originalSha || "the immutable original was touched";
  });

// ---- v4: the tabbed page over the same record ----

test("the v4 page is tabs over panels the no-script reader can use, with deep-link targets in the markup",
  "a tabbed page that hides its content from the no-script reader, or a deep link with no target, loses the map or the decision",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    // v5: one Choices tab carries the decisions, the findings and the ideas — five tabs, no duplicate list.
    if (!page.includes('role="tablist"') || (page.match(/<a role="tab"/g) ?? []).length !== 5 || (page.match(/role="tabpanel"/g) ?? []).length !== 5) return "the five tabs and panels are not ARIA markup";
    for (const id of ["overview", "decisions", "code", "checks", "materials"])
      if (!page.includes(`id="tab-${id}" data-tab="${id}" href="#panel-${id}" aria-controls="panel-${id}"`) || !page.includes(`id="panel-${id}" data-panel="${id}"`)) return `tab ${id} is not an anchor to its panel`;
    if (page.includes('id="panel-findings"')) return "the findings kept a panel of their own beside the Choices list";
    if (/class="panel"[^>]*hidden/.test(page)) return "a panel ships hidden from the no-script reader";
    if (!page.includes("<noscript>") || !page.includes("Without JavaScript all sections show one after another")) return "the no-script note is missing";
    // Every deep-link family has its target exactly once: questions, findings, blocks, pictures, panels.
    for (const id of ["q1", "q2", "q3", "q4", "q5", "f1", "f2", "b1", "b2", "b3", "shot-1", "shot-2"])
      if ((page.match(new RegExp(`id="${id}"`, "g")) ?? []).length !== 1) return `deep-link target ${id} does not appear exactly once`;
    const data = JSON.parse(/<script id="data" type="application\/json">(.*?)<\/script>/s.exec(page)[1]);
    if (!data.blockFile || data.blocks.some((b) => data.blockFile[b.id] === undefined) || data.files.length !== 3) return "the script cannot map blocks to files";
    if (data.blocks.some((b) => b.firstAdd === undefined || b.firstDel === undefined || !b.purpose || !b.parts)) return "the popover's sources and purpose are not in the data";
    return data.pr.url === null || "a record without a passport invented a PR link";
  });

test("purpose is the model's deterministic classification, and the filter bar shows its counters",
  "a purpose guessed at render time or a counter that differs from the model misstates what the change touches",
  () => {
    const model = modelOfThemed();
    const byPath = Object.fromEntries(model.files.map((f) => [f.path, f.purpose]));
    if (byPath["src/invoices/archive.js"] !== "production" || byPath["test/archive.test.js"] !== "tests" || byPath["test/outputs.test.js"] !== "tests") return "file purposes differ from the rules";
    if (model.blocks.some((b) => model.purpose.block[b.id] !== model.purpose.file[b.path])) return "a non-test block follows its file";
    const total = Object.values(model.purpose.counts).reduce((sum, c) => sum + c.blocks, 0);
    if (total !== model.blocks.length || model.purpose.counts.tests.blocks !== 2 || model.purpose.counts.production.blocks !== 1) return "purpose counters are not over the blocks";
    if (model.purpose.counts.tests.lines !== model.blocks.filter((b) => b.path.startsWith("test/")).reduce((sum, b) => sum + b.size, 0)) return "purpose lines are not the sum of block sizes";
    // The disclosed edge rules: stories are tests, keysets are assets, i18n modules are production, configs are config.
    const cases = [["src/__stories__/a.stories.tsx", "tests"], ["src/i18n/keysets/en.json", "assets"], ["src/i18n/en.ts", "production"],
      ["tsconfig.base.json", "config"], ["a.yaml", "config"], ["s.scss", "styles"], ["CHANGELOG.md", "docs"], ["assets/logo.svg", "assets"], ["src/a.test.ts", "tests"]];
    for (const [p, want] of cases) if (purposeOfPath(p) !== want) return `purposeOfPath(${p}) is not ${want}`;
    // A test block inside a production file counts as tests; the bar shows the model's numbers.
    const r = structuredClone(THEMED);
    r.blocks[0].kind = "test";
    const files = parseThemeDiff(), checked = check(r, files, run);
    if (checked.errors.length) return checked.errors.join("; ");
    const m = modelOf(r, files, checked.owner, run);
    if (m.purpose.block[1] !== "tests" || m.purpose.counts.production.blocks !== 0) return "a test block of a production file is not tests";
    const result = render((rr) => Object.assign(rr, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    for (const p of PURPOSES)
      if (!page.includes(`data-purpose-filter="${p}"`) || !page.includes(`<b>${model.purpose.counts[p].files}</b>`)) return `the purpose bar lacks ${p} or its model counter`;
    if (!page.includes("Lines — the sum of block sizes.")) return "the lines caption is missing";
    // The classification is derived, never written into the record.
    return !fs.readFileSync(data, "utf8").includes('"purpose"') || "the render persisted a derived field into the record";
  });

test("the map keeps every block once: 1470 anchors, 1517 fragments, zero duplicate ids, one Q3 banner",
  "a duplicated anchor breaks deep links, a lost fragment breaks the audit, and 224 blocks must not read as 224 decisions",
  () => {
    const recordPath = path.join(SOURCE_65507, "review.json");
    if (!fs.existsSync(recordPath) || !fs.existsSync(ANN_65507)) return skip(`the 65507 record or its annotations are not on this machine (${SOURCE_65507})`);
    const originalSha = createHash("sha256").update(fs.readFileSync(recordPath)).digest("hex");
    const dir = path.join(run, "v4-map-65507");
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(SOURCE_65507, "review.diff"), path.join(dir, "review.diff"));
    const review = enrich65507(JSON.parse(fs.readFileSync(recordPath, "utf8")), JSON.parse(fs.readFileSync(ANN_65507, "utf8")));
    const copy = path.join(dir, "review.json");
    fs.writeFileSync(copy, JSON.stringify(review));
    const drawn = report("render", copy);
    if (drawn.status !== 0) return drawn.stderr.slice(0, 400);
    const page = fs.readFileSync(path.join(dir, "review.html"), "utf8");
    const segs = (page.match(/data-fragment="/g) ?? []).length;
    const anchors = (page.match(/ id="b\d+"/g) ?? []).length;
    if (anchors !== 1470 || segs !== 1517) return `the map holds ${anchors} anchors and ${segs} fragments, not 1470/1517`;
    const ids = [...page.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    const dups = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
    if (dups.length) return `duplicate ids: ${dups.slice(0, 5).join(", ")}`;
    if ((page.match(/class="segbar"/g) ?? []).length !== 1470 || (page.match(/data-blockcomment="/g) ?? []).length !== 1470) return "headers or comments are duplicated per fragment";
    const embedded = JSON.parse(/<script id="data" type="application\/json">(.*?)<\/script>/s.exec(page)[1]);
    if (embedded.blocks.reduce((n, b) => n + b.parts, 0) !== 1517) return "runtime fragment accounting differs";
    const fileBodies = page.split('class="file"').slice(1);
    if (fileBodies.length !== 96) return `line-order coverage: ${fileBodies.length} files`;
    if ((page.match(/class="l (?:add|del|ctx)"/g) ?? []).length !== 6740) return "diff line coverage differs from 6740";
    for (const [idx, body] of fileBodies.entries()) for (const side of ["old", "new"]) {
      let previous = 0;
      for (const [, value] of body.matchAll(new RegExp(`<b class="${side}">(\\d+)</b>`, "g"))) {
        const n = Number(value);
        if (n < previous) return `file ${idx}, ${side}: backwards ${previous} → ${n}`;
        previous = n;
      }
    }
    const banner = page.match(/<div class="evidence-banner v-question"><p>([^]*?)<\/p>/)?.[1];
    if (!banner || !banner.includes("224") || !banner.includes('href="#q3"')) return `the Q3 banner is missing or wrong: ${banner?.slice(0, 120)}`;
    const evidenceWithBlocks = review.questions.filter((q, i) => q.kind === "evidence" && review.blocks.filter((b) => (b.questions ?? []).includes(i + 1)).length >= 2).length;
    if ((page.match(/class="evidence-banner/g) ?? []).length !== evidenceWithBlocks) return "the banner is not one per evidence question with blocks";
    if (!page.includes('Файлы · 96')) return "the file counter is not 96";
    // The full audit is one per-file disclosure, never a template in the markup.
    if ((page.match(/<details class="file-details"(?: open)?>/g) ?? []).length !== 96 || page.includes("<template")) return "the no-JS map is not 96 file disclosures";
    return createHash("sha256").update(fs.readFileSync(recordPath)).digest("hex") === originalSha || "the immutable original was touched";
  });

// The contrast math the render-time adjustment must satisfy: every token on the three code backgrounds of each theme.
const lumOf = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
const ratioOf = (a, b) => { const l1 = lumOf(a), l2 = lumOf(b); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); };
const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const LIGHT_BGS = [[250, 251, 253], [230, 255, 236], [255, 235, 233]];
const DARK_BGS = [[20, 26, 34], [20 + (46 - 20) * .15, 26 + (160 - 26) * .15, 34 + (67 - 34) * .15], [20 + (248 - 20) * .12, 26 + (81 - 26) * .12, 34 + (73 - 34) * .12]];

test("diff lines are painted by change kind, never by verdict, and every token keeps >=4.5 in both themes",
  "a verdict fill over code hides the change kind, and an unadjusted palette dips below 4.5 on the tinted fields",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    // The three layers are CSS variables, the removed line keeps the foreground color, the gutters are old and new.
    for (const part of ["--ins-bg: #e6ffec", "--del-bg: #ffebe9", ".l.add { background: var(--ins-bg)", ".l.del { background: var(--del-bg)", "color: var(--fg) }", '<b class="old">', '<b class="new">'])
      if (!page.includes(part)) return `the diff layers lack "${part}"`;
    // A kept block's removed line and a question block's added line carry the change colors, not the verdict's.
    const keepSeg = page.match(/<div class="seg v-keep" data-block="1"[\s\S]*?<\/details><\/div>/)?.[0];
    const questionSeg = page.match(/<div class="seg v-question" data-block="3"[\s\S]*?<\/details><\/div>/)?.[0];
    if (!keepSeg?.includes('class="l del"') || !questionSeg?.includes('class="l add"')) return "the kept block has no removed line or the question block no added line";
    if (keepSeg.includes("--v-bg") && /class="l del"[^>]*style/.test(keepSeg)) return "a verdict fill reached the line";
    // Every adjusted token span passes 4.5 on all three backgrounds of its theme.
    const spans = [...page.matchAll(/style="color:(#[0-9a-f]{6});--shiki-dark:(#[0-9a-f]{6})/g)];
    if (spans.length < 20) return `too few Shiki spans to walk: ${spans.length}`;
    let minLight = 99, minDark = 99;
    for (const [, light, dark] of spans) {
      minLight = Math.min(minLight, ...LIGHT_BGS.map((bg) => ratioOf(hex2rgb(light), bg)));
      minDark = Math.min(minDark, ...DARK_BGS.map((bg) => ratioOf(hex2rgb(dark), bg)));
    }
    if (minLight < 4.5 || minDark < 4.5) return `token contrast below 4.5: light ${minLight.toFixed(2)}, dark ${minDark.toFixed(2)}`;
    // Context lines drop the syntax color in CSS, and the dark theme switches via --shiki-dark on screen only.
    if (!page.includes(".l.ctx span[style] { color: inherit !important }") || !page.includes("color: var(--shiki-dark) !important")) return "the context/dual-theme switching is missing";
    return page.includes("@media screen {") || "the dark switching is not scoped to screen (print keeps the light tokens)";
  });

test("the Shiki syntax is sequence-wide per hunk, deterministic, and falls back honestly",
  "line-by-line tokenization loses multi-line constructs, a global highlighter leaks between renders, state must not cross the gap between hunks, and an unsupported language must stay plain",
  () => {
    const files = [{ path: "a.ts", hunks: [[
      { kind: "ctx", old: 1, new: 1, text: "/* start" },
      { kind: "del", old: 2, text: "end */ const old = 1;" },
      { kind: "add", new: 2, text: "end */ const x: number = 2; // tail" },
      { kind: "add", new: 3, text: "" }], [
      // A comment that opens on a context line and closes after the removed line: the removed line is comment.
      { kind: "ctx", old: 10, new: 10, text: "/* begin" },
      { kind: "del", old: 11, text: "inside comment" },
      { kind: "add", new: 11, text: "inside comment v2" },
      { kind: "ctx", old: 12, new: 12, text: "*/" }]] },
      { path: "b.bin", hunks: [[{ kind: "add", new: 1, text: "<x> & \"y\"" }]] },
      // Non-adjacent hunks: the first ends inside an open template (new side) / comment (old side); the
      // second hunk's code must be tokenized as itself, not as the continuation of the skipped construct.
      { path: "c.ts", hunks: [[{ kind: "add", new: 1, text: "const a = `template" }], [{ kind: "add", new: 5, text: "const b = 2;" }]] },
      { path: "d.ts", hunks: [[{ kind: "add", new: 1, text: "const b = 2;" }]] },
      { path: "e.ts", hunks: [[{ kind: "ctx", old: 1, new: 1, text: "/* open" }, { kind: "del", old: 2, text: "inside" }], [{ kind: "del", old: 6, text: "const c = 3;" }]] },
      { path: "f.ts", hunks: [[{ kind: "del", old: 1, text: "const c = 3;" }]] }];
    return (async () => {
      const first = await createSyntax(files), second = await createSyntax(files);
      if (!first || !second) return "the vendored bundle did not load";
      const addLine = files[0].hunks[0][2];
      const html = first.line(addLine, "a.ts");
      if (!html.includes("--shiki-dark:")) return "the added line has no dual-theme spans";
      // The comment that began on the context line keeps its comment color on the added line: the sequence was tokenized whole.
      const ctxColor = first.line(files[0].hunks[0][0], "a.ts").match(/color:(#[0-9a-f]{6})/)?.[1];
      if (!ctxColor || !html.startsWith(`<span style="color:${ctxColor};`)) return "the multi-line comment lost its coloring across lines";
      // The old side is del+ctx together: the removed line inside the comment carries the comment color,
      // on both themes, not the plain code color.
      const delInside = files[0].hunks[1][1], ctxOpen = files[0].hunks[1][0];
      const delHtml = first.line(delInside, "a.ts"), openHtml = first.line(ctxOpen, "a.ts");
      const delColor = delHtml.match(/color:(#[0-9a-f]{6})/)?.[1], openColor = openHtml.match(/color:(#[0-9a-f]{6})/)?.[1];
      const delDark = delHtml.match(/--shiki-dark:(#[0-9a-f]{6})/)?.[1], openDark = openHtml.match(/--shiki-dark:(#[0-9a-f]{6})/)?.[1];
      if (!delColor || delColor !== openColor || !delDark || delDark !== openDark) return `the removed line inside a comment lost the comment color: del ${delColor}/${delDark}, ctx ${openColor}/${openDark}`;
      if (delHtml.includes("const") || !delHtml.includes("inside comment")) return "the removed line's text is wrong";
      // State does not cross the gap between non-adjacent hunks, on either side.
      if (first.line(files[2].hunks[1][0], "c.ts") !== first.line(files[3].hunks[0][0], "d.ts")) return "the new side carried an open template across the gap between hunks";
      if (first.line(files[4].hunks[1][0], "e.ts") !== first.line(files[5].hunks[0][0], "f.ts")) return "the old side carried an open comment across the gap between hunks";
      if (first.line(addLine, "a.ts") !== second.line(addLine, "a.ts")) return "two renders differ";
      if (first.line(files[0].hunks[0][3], "a.ts") !== "") return "a blank line is not empty";
      if (first.line(files[1].hunks[0][0], "b.bin") !== "&lt;x&gt; &amp; &quot;y&quot;") return "an unsupported language is not escaped plain";
      // The pattern fallback still draws code when no syntax is given, and page() uses it.
      if (!highlight("const x = 1;", "a.js").includes('class="t-k"')) return "the pattern fallback broke";
      const model = modelOfThemed(), legacyPage = page(THEMED, parseThemeDiff(), model);
      if (!legacyPage.includes('class="t-k"') || legacyPage.includes("--shiki-dark:")) return "page() without a syntax did not fall back";
      return true;
    })();
  });

test("the export marks drafts and comment-only acceptances, and a draft is never a decision",
  "a draft exported as accepted, or a comment acceptance read as a missing variant, misstates what the owner decided",
  () => {
    const draft = dstate({ 1: { choice: "draft", variant: "keep" } });
    if (validAccept(DQS[0], draft) || choiceStats(DQS, draft, []).remaining !== 2) return "a draft counted as a decision";
    const out = exportOf(DQS, draft, {});
    const q1 = out.questions.find((q) => q.question === 1);
    if (out.schema_version !== 5 || q1.status !== "remaining" || q1.variant?.id !== "keep" || q1.variant_draft !== true) return "the draft is not exported as a draft";
    // A deferred pick and a retired child keep the variant as a draft; an accepted one does not.
    const deferred = exportOf(DQS, dstate({ 1: { choice: "deferred", variant: "keep" } }, { q1: "Later." }), {});
    if (deferred.questions.find((q) => q.question === 1).variant_draft !== true) return "a deferred variant is not a draft";
    const retired = exportOf(DQS, settle(DQS, dstate({ 1: { choice: "accepted", variant: "revert" }, 2: { choice: "accepted", variant: "a" } })), {});
    const q2 = retired.questions.find((q) => q.question === 2);
    if (q2.status !== "not-applicable" || q2.variant?.id !== "a" || q2.variant_draft !== true) return "a retired child's pick is not exported as a draft";
    const accepted = exportOf(DQS, dstate({ 1: { choice: "accepted", variant: "keep" } }), {});
    if (accepted.questions.find((q) => q.question === 1).variant_draft !== undefined) return "an accepted variant is marked draft";
    // A variant-less decision accepted by comment: named in applyWithoutVariant, never a missing variant.
    const commented = exportOf(DQS, dstate({ 4: { choice: "accepted" } }, { q4: "Keep as is." }), {});
    if (commented.applyWithoutVariant.join() !== "4" || commented.questions.find((q) => q.question === 4).variant !== null) return "a comment acceptance is not named";
    return exportOf(DQS, dstate({ 1: { choice: "accepted", variant: "keep" } }), {}).applyWithoutVariant.length === 0 || "a variant acceptance landed in applyWithoutVariant";
  });

test("without scripts the v4 controls are disabled, the panels stack, and the map is complete",
  "interactive-looking filters that cannot work mislead the no-script reader; a hidden panel loses the content",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    for (const part of ['data-purpose-filter="tests" aria-pressed="true" disabled', 'id="tree-filter-input"', 'id="tree-filter-clear" disabled',
      'class="fname mono" data-fexpand="0" disabled', 'data-f-filter="1" disabled', 'data-req-filter="1" disabled', 'data-q-filter="1" disabled'])
      if (!page.includes(part)) return `the no-script control is missing or not disabled: ${part}`;
    if (!/<input type="radio" name="vq3"[^>]*disabled>/.test(page) || !/<input type="checkbox" data-zone="1-0" disabled>/.test(page)) return "the radios or zones are not disabled";
    if (!page.includes('fieldset class="qopts" disabled')) return "the variant fieldset is not disabled";
    if (page.includes("<template") || /class="panel"[^>]*hidden/.test(page) || page.includes('class="file-details" open')) return "the no-JS page hides content or starts open";
    if ((page.match(/<details class="file-details"(?: open)?>/g) ?? []).length !== 3) return "the map is not one disclosure per file";
    if (!page.includes(".js .nojs-note { display: none }") || !page.includes("control.disabled = false")) return "the runtime does not enable the controls or hide the hint";
    return page.includes('id="theme-toggle" class="theme-btn act"') || "the theme button is not script-only";
  });

test("the target structure stays closed, C1 is absent, and the print profiles and shot permalinks are present",
  "a diagram that opens by default buries the verdict; a next-unresolved control was deliberately not ported",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    if (!page.includes('<details class="structure-target">') || page.includes('class="structure-target" open')) return "the target diagram is not a closed disclosure";
    if (page.includes("next unresolved") || page.includes("следующее нерешённое") || page.includes("data-next-unresolved")) return "C1 was ported";
    if (!page.includes('id="print-owner"') || !page.includes('id="print-audit"') || !page.includes(".panel[hidden] { display: flex !important }")) return "the print profiles or their CSS are missing";
    if (!page.includes('id="shot-1"') || !page.includes('href="#shot-1"') || !page.includes('class="shot-link"')) return "the shot permalinks (C3) are missing";
    if (!page.includes('id="filter-chip"') || !page.includes('id="filter-prev"') || !page.includes('id="filter-next"') || !page.includes('id="filter-back"') || !page.includes('id="filter-pos" role="status"')) return "the filter chip (C4) is missing";
    if (!page.includes('id="tree-filter-count" role="status"')) return "the tree filter count (C2) is missing";
    return page.includes('id="export-json-top"') && page.includes('id="copy-top"') && !page.includes('id="export-json"') && !page.includes('id="copy"') || "the export controls are missing or duplicated";
  });

test("the v4 words are localized, and a custom catalog carries the v4 controls",
  "a new control silently left in English, or a legacy catalog broken by the v4 chrome, fails the reader",
  () => {
    const result = render((r) => { Object.assign(r, structuredClone(THEMED)); r.language = "ru"; });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    for (const word of ["Обзор", "Решения", "Замечания", "Код", "Проверки", "Материалы", "Требуют внимания", "Скачать JSON", "Копировать текст",
      "Основной код", "Тесты", "Стили", "Ресурсы", "Документация", "Конфигурация", "Поиск путей в дереве файлов", "Выгрузить ответы", "Нужен выбор владельца", "Отложить", "Сбросить", "Открыто", "Единицы кода"])
      if (!page.includes(word)) return `the Russian page lacks "${word}"`;
    for (const english of [">Overview<", ">Need attention", ">Download JSON<", ">Choose a variant<", ">Open<"])
      if (page.includes(english)) return `English leaked into the Russian page: ${english}`;
    // Common chrome is mandatory for every current catalog.
    const oldRequired = requiredKeys(REVIEW), newRequired = requiredKeys(THEMED);
    for (const key of ["tab.overview", "theme.auto", "map.attention", "seg.popover", "export.download", "nojs.note", "purpose.production", "copy.failed"]) {
      if (!oldRequired.includes(key)) return `the common control ${key} is not required of a minimal record`;
      if (!newRequired.includes(key)) return `the v4 control ${key} is not required of a record with the new fields`;
    }
    if (!oldRequired.includes("code.no-related") || !oldRequired.includes("code.no-visible")) return "an old record was not asked for the v7 empty states";
    if (newRequired.includes("decision.confirm") === false) return "a record with cards was not asked for the card words";
    const files = parseThemeDiff();
    const catalog = Object.fromEntries(requiredKeys(THEMED).map((key) => [key, LABELS[key]]));
    const custom = check({ ...structuredClone(THEMED), language: "custom", labels: catalog }, files, run);
    return custom.errors.length === 0 || `a complete v4 custom catalog was refused: ${custom.errors.join("; ")}`;
  });

// The popover builds its HTML from the record's own paths, URLs and labels: a hostile value must stay text.
// The fixture's diff carries an apostrophe and a handler-injection attempt in the path itself.
const scriptOf = (pageHtml) => pageHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
const dataOf = (pageHtml) => JSON.parse(pageHtml.match(/<script id="data" type="application\/json">(.*?)<\/script>/s)[1]);

test("one vocabulary in English and Russian: cards count blocks, controls read in sentence case, statuses say open, and amber marks only a needed change",
  "a card counting fragments counts a unit the owner never decides on, a lower-case control reads as prose, a status worded as waiting, remaining or unanswered names a state the page does not have, and an amber limit reads as a change to make",
  () => {
    // File and folder names are the record's data, not the report's words; a parent's wait is a state of its own.
    const names = parseThemeDiff().flatMap((f) => f.path.split("/").map((part, i, parts) => i < parts.length - 1 ? part + "/" : part));
    const parentWait = /waiting for (?:a parent|Q(?:\d+|\{n\}))|ожидает решения Q(?:\d+|\{n\})/gi;
    const oldWords = /waiting|remaining|unprocessed|without an answer|ожидает|осталось|необработанн|без ответа/i;
    for (const language of ["en", "ru"]) {
      const result = render((r) => { Object.assign(r, structuredClone(THEMED)); r.language = language; });
      if (result.status !== 0) return result.stderr;
      const page = fs.readFileSync(html, "utf8"), markup = page.replace(/<script[\s\S]*?<\/script>/g, ""), labels = dataOf(page).labels;
      if (!page.includes('class="card-limit"') || !page.includes('id="zoom-historical"')) return `${language}: the limits or the historical tag are not on the page`;
      if (/\.card-limit \{[^}]*--fix/.test(page) || /id="zoom-historical" class="[^"]*v-fix/.test(page)) return `${language}: a limit or the historical tag is amber`;
      if (!markup.includes(`<details class="count-note"><summary>${labels.blocksWord}: ${THEMED.blocks.length}</summary>`)) return `${language}: the Code tab does not count its blocks`;
      for (const [, id, summary] of markup.matchAll(/<details class="qwhere" data-qwhere="(\d+)"><summary>([\s\S]*?)<\/summary>/g))
        if (!summary.endsWith(` · ${labels.blocksWord}: ${THEMED.blocks.filter((b) => b.questions?.includes(+id)).length}`)) return `${language}: Q${id} does not count its blocks: ${summary}`;
      for (const [, tag, inner] of markup.matchAll(/<(button|summary)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
        const text = inner.replace(/<[^>]*>/g, "").replace(/&[a-z]+;|&#\d+;/g, " ").trim();
        if (/^\p{Ll}/u.test(text) && !names.some((name) => text.startsWith(name))) return `${language}: the ${tag} «${text}» starts in lower case`;
      }
      const statuses = [...markup.matchAll(/<span class="tag v-open (?:qstatus|na-badge)"[^>]*>([^<]*)</g),
        ...markup.matchAll(/<(?:span|button)\b[^>]*(?:id="count-decisions"|data-choice-filter="\w+")[^>]*aria-label="([^"]*)"/g)].map((m) => m[1]);
      if (statuses.length < 10) return `${language}: only ${statuses.length} statuses and counters were found on the page`;
      statuses.push(...Object.values(labels.status), ...Object.values(labels.answerStatus), labels.tabRemaining, labels.countAnswers, labels.countEntries,
        labels.countDecisions, labels.countFindings, labels.countDeferred, labels.dependent, labels.unanswered, labels.waitingParent,
        labels.selectionWaiting, labels.accepted, labels.deferred, labels.notApplicable, labels.export.openFindings, labels.export.openDecisions,
        labels.export.openDependent, labels.export.openRequests, labels.export.notApplicable);
      const stale = statuses.find((text) => oldWords.test(text.replace(parentWait, "")));
      if (stale) return `${language}: the status «${stale}» uses an old word`;
    }
    return true;
  });

test("the popover escapes every attribute and label, apostrophe included, and only links http(s)",
  "a path with an apostrophe broke out of a single-quoted attribute and injected a handler; localized strings rode in unescaped",
  () => {
    const { diff, record } = hostileFixture();
    const files = parseDiff(diff), r = record;
    const { owner } = check(r, files, run);
    const html = page(r, files, modelOf(r, files, owner, run));
    const script = scriptOf(html), data = dataOf(html);
    const escsSrc = script.match(/const escs = [^\n]+/)[0];
    const popSrc = script.slice(script.indexOf("function openPop"), script.indexOf("pop.addEventListener"));
    if (/\+\s*t\./.test(popSrc)) return "a localized string is concatenated into the popover HTML without escs";
    const pop = { innerHTML: "", hidden: true, style: {}, offsetWidth: 100, offsetHeight: 100, querySelector: () => ({ value: "", focus() {} }) };
    const ctx = vm.createContext({ data, t: data.labels, state: { notes: {} }, pop, innerWidth: 1000, innerHeight: 800,
      blockById: Object.fromEntries(data.blocks.map((b) => [String(b.id), b])),
      qById: Object.fromEntries(data.questions.map((q) => [String(q.id), q])) });
    vm.runInContext(escsSrc, ctx);
    if (vm.runInContext(`escs("'&<>\\\"")`, ctx) !== "&#39;&amp;&lt;&gt;&quot;") return "escs does not escape all five markup characters";
    vm.runInContext(popSrc + `\nopenPop("1", { getBoundingClientRect: () => ({ left: 10, bottom: 10 }) });`, ctx);
    const built = pop.innerHTML;
    if (built.includes("' onmouseover='") || built.includes("<img")) return "the hostile path, URL or label injected markup into the popover";
    if (!built.includes("&#39;")) return "the apostrophe is not escaped in the popover HTML";
    const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    const copies = [...built.matchAll(/data-copy='([^']*)'/g)].map((m) => decode(m[1]));
    if (copies[0] !== `${HOSTILE_PATH}:1 (${data.pr.head})` || copies[1] !== `${HOSTILE_PATH}:1 (${data.pr.base})`) return `the copy values are wrong: ${JSON.stringify(copies)}`;
    const href = built.match(/href='(https[^']*)'/);
    if (!href || decode(href[1]) !== HOSTILE_URL) return "the PR URL did not survive escaped in its href";
    // A non-http(s) scheme never becomes a live href, even on a record that never passed the check.
    const js = hostileFixture().record; js.passport.links[0].url = "javascript:alert(1)"; js.passport.links[0].label = "";
    const jsHtml = page(js, files, modelOf(js, files, owner, run));
    const jsData = dataOf(jsHtml), jsPop = { innerHTML: "", hidden: true, style: {}, offsetWidth: 100, offsetHeight: 100, querySelector: () => ({ value: "", focus() {} }) };
    const jsCtx = vm.createContext({ data: jsData, t: jsData.labels, state: { notes: {} }, pop: jsPop, innerWidth: 1000, innerHeight: 800,
      blockById: Object.fromEntries(jsData.blocks.map((b) => [String(b.id), b])),
      qById: Object.fromEntries(jsData.questions.map((q) => [String(q.id), q])) });
    vm.runInContext(escsSrc + "\n" + popSrc + `\nopenPop("1", { getBoundingClientRect: () => ({ left: 10, bottom: 10 }) });`, jsCtx);
    if (jsPop.innerHTML.includes("href='javascript:")) return "a javascript: URL became a link in the popover";
    return jsPop.innerHTML.includes("javascript:alert(1)") || "the refused URL is not shown as text";
  });

test("a refused source copy selects exactly the data-copy value, not the row around it",
  "the fallback selected the label, the path and the revision without the parentheses — not the value the copy carries",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const script = scriptOf(fs.readFileSync(html, "utf8"));
    const clickSrc = script.slice(script.indexOf('pop.addEventListener("click"'), script.indexOf('document.addEventListener("keydown"'));
    const txt = "src/a'1.js:2 (rev'1)";
    let rangeTarget = null, statusEl = null;
    const el = () => ({ className: "", textContent: "", setAttribute() {}, after(next) { this.next = next; } });
    const cp = { dataset: { copy: txt }, textContent: "copy", closest: () => p };
    const p = { after(next) { statusEl = next; } };
    const pop = { innerHTML: "", hidden: false, querySelector: () => null, addEventListener: (ev, fn) => { pop.handler = fn; } };
    const ctx = vm.createContext({ pop, t: { copied: "Copied", copyFailed: "Failed. Ctrl/⌘+C." },
      document: { createElement: el, createRange: () => ({ selectNodeContents: (node) => { rangeTarget = node; } }) },
      getSelection: () => ({ removeAllRanges() {}, addRange() {} }),
      navigator: { clipboard: { writeText: () => Promise.reject(new Error("denied")) } }, setTimeout });
    vm.runInContext(clickSrc, ctx);
    pop.handler({ target: { closest: (sel) => (sel === ".pop-copy" ? cp : null) } });
    return new Promise((resolve) => setImmediate(() => {
      if (!rangeTarget || rangeTarget.textContent !== txt) return resolve(`the selection is not the exact copy value: ${rangeTarget?.textContent}`);
      if (!statusEl || !statusEl.textContent.includes("Ctrl")) return resolve("the refusal is not announced");
      resolve(true);
    }));
  });

test("afterprint restores every filter view from the snapshot, not the dataset alone",
  "the purpose buttons stayed unpressed and the tree stayed unfiltered after the audit print, while the map said otherwise",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const script = scriptOf(fs.readFileSync(html, "utf8"));
    const before = script.slice(script.indexOf('window.addEventListener("beforeprint"'), script.indexOf('window.addEventListener("afterprint"'));
    const after = script.slice(script.indexOf('window.addEventListener("afterprint"'), script.indexOf("const annotationUI"));
    if (!before.includes("chipIdx")) return "the snapshot does not keep the chip position";
    for (const part of ['[data-purpose-filter]', '[data-show]', "applyTreeFilter()", "applySegFilter()", "printSnapshot.chipIdx", "printSnapshot.hiddenPurposes"])
      if (!after.includes(part)) return `afterprint does not restore "${part}"`;
    // v5: the purpose toggles are many — their pressed state returns from the stored hidden list.
    if (!/aria-pressed.*!state\.hiddenPurposes\.includes\(b\.dataset\.purposeFilter\)/s.test(after)) return "the purpose toggles' pressed state is not restored from the hidden list";
    // The shot deep link accepts the canonical #shot-N and the bare #shotN alike.
    const open = script.slice(script.indexOf("function openTarget"), script.indexOf('window.addEventListener("hashchange"'));
    const norm = open.match(/const shot = (\/.*?\/)\.exec\(hash\); if \(shot\) hash = "#shot-"/);
    return !!norm && norm[1].includes("#shot") || "openTarget does not normalize #shotN to #shot-N";
  });

test("a catalog with exactly the record's required keys renders it end to end; a record using more capabilities is refused for the missing keys",
  "the check alone can pass while the render refuses, and a record must not silently take English words for a capability it uses",
  () => {
    const exactCatalog = Object.fromEntries(requiredKeys(REVIEW).map((key) => [key, "«" + LABELS[key] + "»"]));
    const ok = render((r) => { r.language = "custom"; r.labels = exactCatalog; });
    if (ok.status !== 0) return `the record with a catalog of exactly its required keys was refused: ${ok.stderr}`;
    if (!fs.readFileSync(html, "utf8").includes("«Findings»")) return "the catalog's own words are not on the page";
    const refused = render((r) => { Object.assign(r, structuredClone(THEMED)); r.language = "custom"; r.labels = exactCatalog; });
    return refused.status === 1 && refused.stderr.includes("complete labels catalog") || "a record using more capabilities rendered without asking for their words";
  });

// ---- v5: one Choices list, the unified shell, the reversible choice, the export dialog ----

test("the v5 page is one Choices list grouped by action, with subtabs over it and no duplicate panel",
  "Q/F/I duplicated across tabs break deep links and double the ids; a counter per tab reads as several quantities",
  () => {
    const result = render((r) => { Object.assign(r, structuredClone(THEMED)); r.mechanisms = [MECHANISM]; });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    const decisions = page.split('id="panel-decisions"')[1].split('id="panel-code"')[0];
    for (const id of ["q3", "q4", "f1", "f2", "i1"])
      if (!decisions.includes(`id="${id}"`)) return `${id} is not in the Choices list`;
    if ((page.match(/id="f1"/g) ?? []).length !== 1 || (page.match(/id="i1"/g) ?? []).length !== 1) return "a finding or idea stands twice";
    for (const group of ["group-owner", "group-fix", "group-data", "group-settled"])
      if (!decisions.includes(`id="${group}"`)) return `the action group ${group} is missing`;
    // The subtabs filter the ONE list; they ship disabled and pressed at «All» for the no-script reader.
    const filters = [...decisions.matchAll(/data-choice-filter="(\w+)"/g)].map((m) => m[1]);
    if (filters.join() !== "all,q,f,i,fact,deferred,done") return `the subtabs are ${filters.join()}`;
    if (!/data-choice-filter="all"[^>]*aria-pressed="true"[^>]*disabled/.test(decisions)) return "the subtabs do not start at All, disabled";
    // The overview carries the read-only matter; the checks tab carries the challenges; nothing is lost.
    const overview = page.split('id="panel-overview"')[1].split('id="panel-decisions"')[0];
    if (!overview.includes('id="tradeoffs"') || !overview.includes('id="mechanisms"') || !overview.includes('id="structure"')) return "the overview lacks the tradeoffs, mechanics or structure";
    const checks = page.split('id="panel-checks"')[1].split('id="panel-materials"')[0];
    if (!checks.includes('id="challenges"') || !checks.includes('id="requirements"')) return "the checks tab lacks the challenges or requirements";
    // One quantity: the main decisions open (Q3, the only root) plus the two findings; the child Q4 and the idea never enter.
    if (!/id="count-decisions"[^>]*aria-label="Open main decisions and findings: 3"[^>]*>3<\/span>/.test(page)) return "the static counter is not the one quantity (roots + findings)";
    return !page.includes('id="panel-findings"') || "the findings kept a duplicate panel";
  });

test("choiceStats.remaining is the one quantity: roots and findings, never ideas, children or invalid decisions",
  "a counter that counts conditional children, ideas or bare clicks misstates what is left for the owner",
  () => {
    const findings = [{ id: 1 }, { id: 2 }];
    const fresh = normalize({});
    if (choiceStats(DQS, fresh, findings).remaining !== 4) return "the fresh count is not the two roots plus the two findings";
    // Ideas are excluded at the source: the page feeds the findings list, never the ideas (data.ideas stands apart).
    const themed = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (themed.status !== 0) return themed.stderr;
    const embedded = JSON.parse(/<script id="data" type="application\/json">(.*?)<\/script>/s.exec(fs.readFileSync(html, "utf8"))[1]);
    if (embedded.findings.some((f) => String(f.id).startsWith("i")) || !embedded.ideas.length) return "the ideas are not kept apart from the counted findings";
    const accepted = normalize({ questions: { 1: { choice: "accepted", variant: "keep" } }, findings: { 1: "apply" } });
    if (choiceStats(DQS, accepted, findings).remaining !== 2) return "a valid acceptance or a processed finding did not decrement";
    const bare = normalize({ questions: { 1: { choice: "accepted" } } });
    if (choiceStats(DQS, bare, findings).remaining !== 4) return "an acceptance without a variant counted as decided";
    const deferred = normalize({ questions: { 4: { choice: "deferred" } }, notes: { q4: "Later." } });
    if (choiceStats(DQS, deferred, findings).remaining !== 3) return "a reasoned deferral did not decrement";
    const reasonless = normalize({ questions: { 4: { choice: "deferred" } } });
    if (choiceStats(DQS, reasonless, findings).remaining !== 4) return "a reasonless deferral counted as decided";
    // The child under an accepted outside variant is not applicable, and the root's own acceptance stands.
    const retired = settle(DQS, normalize({ questions: { 1: { choice: "accepted", variant: "revert" }, 2: { choice: "accepted", variant: "a" } } }));
    if (choiceStats(DQS, retired, findings).remaining !== 3) return "the retired child or the accepted root miscounted";
    return true;
  });

test("the conditional children sit under their parent, and the settled group is the runtime's compact rows",
  "Q9–Q11 as siblings of Q2 read as independent decisions; a settled card copied instead of moved doubles its id",
  () => {
    const recordPath = path.join(SOURCE_65507, "review.json");
    if (!fs.existsSync(recordPath) || !fs.existsSync(ANN_65507)) return skip(`the 65507 record or its annotations are not on this machine (${SOURCE_65507})`);
    const dir = path.join(run, "v5-children-65507");
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(SOURCE_65507, "review.diff"), path.join(dir, "review.diff"));
    const review = enrich65507(JSON.parse(fs.readFileSync(recordPath, "utf8")), JSON.parse(fs.readFileSync(ANN_65507, "utf8")));
    const copy = path.join(dir, "review.json");
    fs.writeFileSync(copy, JSON.stringify(review));
    const drawn = report("render", copy);
    if (drawn.status !== 0) return drawn.stderr.slice(0, 400);
    const page = fs.readFileSync(path.join(dir, "review.html"), "utf8");
    const unit2 = page.split('data-unit="q2"')[1].split('data-unit="q6"')[0];
    if (!unit2.includes('data-qchildren="2"')) return "Q2 has no children disclosure";
    for (const n of [9, 10, 11]) if (!unit2.includes(`id="q${n}"`)) return `Q${n} is not under Q2`;
    const owner = page.split('id="group-owner"')[1].split('id="group-fix"')[0];
    const units = [...owner.matchAll(/data-unit="(q\d+)"/g)].map((m) => m[1]);
    if (units.join() !== "q1,q2,q6,q8") return `the owner group's roots are ${units.join()}`;
    if (owner.includes('data-unit="q9"')) return "a child stands as a root unit";
    // The settled group starts empty; the runtime moves the SAME card only after focus leaves the unit.
    if (!page.includes('id="group-settled"')) return "the settled group is missing";
    const script = scriptOf(page);
    if (!script.includes("unitHome") || !script.includes("settled-row")) return "the runtime does not move cards into compact rows";
    // Exercise the embedded runtime: an edited card stays put, then moves after focus leaves cards.
    const start = script.indexOf("  function unitSettledState(unit)"), end = script.indexOf("  function paintChildren()", start);
    if (start < 0 || end < 0) return "the settled-card runtime is missing";
    const field = { closest: () => unit }, bodyFocus = { closest: () => null };
    const card = { id: "q2", dataset: { qid: "2" }, classList: { contains: (name) => name === "qcard" },
      querySelector: () => ({ textContent: "Question" }) };
    let moves = 0, row;
    const home = { children: [], insertBefore() { moves++; } };
    const unit = { dataset: {}, parentElement: home,
      querySelector: () => card, closest: () => row || null,
      before(value) { row = value; } };
    home.children = [unit];
    const document = { activeElement: field, getElementById: () => ({}),
      createElement: (tag) => tag === "details"
        ? { dataset: {}, append() {}, querySelector: () => ({ append() {} }) }
        : {} };
    const settledBody = { append() { moves++; } };
    const paint = vm.runInNewContext(script.slice(start, end) + "\npaintSettled",
      { document, settledBody, unitHome: new Map(), settledMap: { q2: "done" },
        state: { notes: {} }, t: { status: { open: "open" }, commentEdit: "edit", cardComment: "Comment" },
        all: () => [unit], progOpen() {} });
    paint();
    if (moves || unit.dataset.settled) return "a focused card moved during editing";
    document.activeElement = bodyFocus;
    paint();
    if (moves !== 1 || unit.dataset.settled !== "done") return "the card did not move after focus left";
    if (page.includes("data-confirm")) return "the mobile confirm step survived";
    if (/isMobile/.test(script)) return "a separate mobile choice rule survived";
    return script.includes('cur.choice = "accepted"') || "the radio does not accept at once on every size";
  });

test("the unified card shell: one order for Q/F/I, the limit on the surface, no invented data",
  "a different shell per type hides the limit and the choice; an idea with an invented limit states what the record does not",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    const order = (card, isQuestion) => (isQuestion ? ["card-head", "card-title", "card-comment", "card-more"] : ["card-head", "card-question", "card-comment", "card-more"]).map((part) => card.indexOf(part));
    const q3 = page.split('id="q3"')[1].split("</div>\n  </div>")[0];
    const f1 = page.split('id="f1"')[1].split("</article>")[0];
    const i1 = page.split('id="i1"')[1].split("</article>")[0];
    for (const [name, card] of [["q3", q3], ["f1", f1], ["i1", i1]]) {
      const at = order(card, name === "q3");
      if (at.some((x) => x < 0) || at.some((x, j) => j && x <= at[j - 1])) return `${name}: the shell order differs`;
    }
    if (!f1.includes("card-limit") || !f1.includes("card-consequence") || !f1.includes("card-choice")) return "the finding lacks the limit, consequence or choice slot";
    if (!f1.includes(">Fix</button>") || !f1.includes(">Do not fix</button>")) return "the finding's choice is not Fix / Do not fix";
    if (i1.includes("card-limit") || i1.includes("not stated in the record")) return "the idea grew an invented absence warning";
    if (!i1.includes(">Take</button>") || !i1.includes(">Do not take</button>")) return "the idea's choice is not Take / Do not take";
    // The fact answer stands on the surface, not behind the comment; a zone mark is not a confirmation.
    const q2 = page.split('id="q2"')[1].split('id="q3"')[0];
    if (!q2.includes('data-answer="q2"') || q2.indexOf('data-answer="q2"') > q2.indexOf("card-comment")) return "the fact answer is not on the surface before the comment";
    const q1 = page.split('id="q1"')[1].split('id="q2"')[0];
    if (!q1.includes("zone-note") || !q1.includes("not a confirmation")) return "the zone mark reads as a confirmation";
    // The comment is a closed disclosure, never a permanent textarea.
    if (!q3.includes('<details class="card-comment act" data-comment="q3">')) return "the card comment is not the compact disclosure";
    if (page.includes("qnote-wrap")) return "the permanent comment textarea survived";
    return true;
  });

test("source labels describe recorded fields without claiming a check",
  "a mention is not a missing file and a quote is not a verified revision; only the current question is a self-reference",
  () => {
    const result = render((r) => {
      Object.assign(r, structuredClone(THEMED));
      r.questions[2].context = [
        { text: "First claim.", sources: [{ ref: "/questions/2" }, { at: "coverage" }] },
        { text: "Second claim.", sources: [{ at: "somewhere", revision: "r1", quote: "words" }] },
        { text: "Third claim.", sources: [{ ref: "/questions/0" }, { at: "somewhere", revision: "r2", quote: "other words" }] },
      ];
    });
    if (result.status !== 0) return result.stderr;
    const q = fs.readFileSync(html, "utf8").split('id="q3"')[1].split('data-qchildren="3"')[0];
    for (const text of ["Reference to this question in the report: <a href=\"#q3\">Q3</a>", "Mention without a quote: coverage",
      "Quote provided: somewhere @ r1 “words”", "Report reference: <a href=\"#q1\">Q1</a>", "Quote provided: somewhere @ r2 “other words”"])
      if (!q.includes(text)) return `missing field-based provenance: ${text}`;
    return !q.includes('href="#coverage">coverage') || "a plain at value became an invented link";
  });

test("finding and idea controls keep their localized accessible names and independent ids",
  "sharing the card shell must not conflate the two choices or expose a title as markup",
  () => {
    for (const [language, fix, skip, take, leave] of [
      ["en", "Fix F1", "Do not fix F1", "Take the idea", "Do not take the idea"],
      ["ru", "Исправить F1", "Не исправлять F1", "Взять идею", "Не брать идею"]
    ]) {
      const result = render((r) => {
        Object.assign(r, structuredClone(THEMED));
        r.language = language;
        r.ideas[0].title = 'Idea "quoted" & safe';
      });
      if (result.status !== 0) return result.stderr;
      const html = fs.readFileSync(path.join(run, "review.html"), "utf8");
      const finding = html.split('id="f1"')[1].split("</article>")[0];
      const idea = html.split('id="i1"')[1].split("</article>")[0];
      for (const [card, id, apply, reject] of [
        [finding, "1", fix, skip],
        [idea, "i1", `${take} Idea &quot;quoted&quot; &amp; safe`, `${leave} Idea &quot;quoted&quot; &amp; safe`]
      ]) {
        if (!card.includes(`data-fstatus="${id}"`) || !card.includes(`data-finding="${id}"`)) return `${language}: missing status or choice id ${id}`;
        if (!card.includes(`value="apply" aria-label="${apply}"`) || !card.includes(`value="skip" aria-label="${reject}"`)) return `${language}: wrong accessible choice names for ${id}`;
      }
      if (!idea.includes('data-comment="i1"') || !finding.includes('data-comment="f1"')) return `${language}: comments lost their own ids`;
    }
    return true;
  });

test("the surface limit is the record's own uncertainty; a clear recommendation stays advice",
  "an invented limit or a buried uncertainty misleads the owner at the first screen",
  () => {
    const recordPath = path.join(SOURCE_65507, "review.json");
    if (!fs.existsSync(recordPath) || !fs.existsSync(ANN_65507)) return skip(`the 65507 record or its annotations are not on this machine (${SOURCE_65507})`);
    const dir = path.join(run, "v5-limit-65507");
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(SOURCE_65507, "review.diff"), path.join(dir, "review.diff"));
    const review = enrich65507(JSON.parse(fs.readFileSync(recordPath, "utf8")), JSON.parse(fs.readFileSync(ANN_65507, "utf8")));
    const copy = path.join(dir, "review.json");
    fs.writeFileSync(copy, JSON.stringify(review));
    if (report("render", copy).status !== 0) return "render failed";
    const page = fs.readFileSync(path.join(dir, "review.html"), "utf8");
    for (const n of [2, 8]) {
      const card = page.split(`id="q${n}"`)[1].split('id="q' + (n + 1) + '"')[0];
      const limit = card.split("card-limit")[1]?.split("</p>")[0] ?? "";
      if (!limit.includes("Однозначной рекомендации нет")) return `Q${n}'s uncertainty is not on the surface`;
      if (card.indexOf("card-limit") > card.indexOf("card-more")) return `Q${n}'s limit is buried in a disclosure`;
    }
    // Q6's recommendation is a clear opinion: it stands as advice, not as an uncertainty.
    const q6 = page.split('id="q6"')[1].split('data-unit="q8"')[0];
    if (!q6.includes("qadvice") || q6.includes("card-limit")) return "Q6's clear recommendation was demoted to a limit";
    // The unchecked limits are visible in the data/check group rather than duplicated in the intro.
    const group = page.split('id="group-data"')[1]?.split('class="dgroup-body"')[0] ?? "";
    if (!group.includes("card-limit") || !group.includes("current-merge pixel-diff")) return "the data group lacks the record's unchecked limits";
    const legacy = render();
    if (legacy.status !== 0) return legacy.stderr;
    const old = fs.readFileSync(html, "utf8");
    const oldIntro = old.split('<div class="decision-intro">')[1].split("choice-filters")[0];
    return !oldIntro.includes("card-limit") || "a record without coverageStructured grew an empty limit";
  });

test("the fact answer is «answer entered», never «verified», and exports apart from the comments",
  "an entered answer promoted to a checked result, or mixed into the comments, loses the three layers",
  () => {
    const state = normalize({ answers: { q3: "https://example.test/proof" }, notes: { q3: "a discussion" } });
    const out = exportOf(DQS, state, {});
    if (out.schema_version !== 5) return "the schema changed";
    if (out.factAnswers?.q3 !== "https://example.test/proof") return "the export lacks factAnswers";
    if (out.notes.q3 !== "a discussion") return "the answer displaced the comment";
    // An old store without the new keys normalizes clean; the answer never decides a question.
    const old = normalize({ findings: { 1: "apply" }, questions: { 1: { choice: "accepted", variant: "keep" } } });
    if (Object.keys(old.answers).length || old.hiddenPurposes.length || old.treeHidden) return "the old store grew non-empty v5 state";
    if (exportOf(DQS, state, {}).questions.some(q => q.question === 3)) return "an answer counted as a decision";
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    if (!page.includes("does not confirm the check automatically")) return "the answer field does not say it confirms nothing";
    const script = scriptOf(page), start = script.indexOf("  function paint() {"), end = script.indexOf("  function paintResolvedSegs(", start);
    if (start < 0 || end < 0) return "the paint runtime is missing";
    const D = decisionRuntime(), questions = [
      { id: 1, kind: "decision", variants: [{ id: "yes" }, { id: "no" }] },
      { id: 2, kind: "evidence", parent: { question: 1, variants: ["yes"] } },
    ], labels = dataOf(page).labels;
    const statusState = D.normalize({ answers: { q2: "owner evidence" }, questions: { 1: { choice: "accepted", variant: "yes" } } });
    const chipEl = { dataset: {}, textContent: "" }, card = {
      dataset: { qid: "2" }, classList: { toggle() {} }, querySelector: (s) => s === "[data-qstatus]" ? chipEl : null, querySelectorAll: () => [],
    };
    const sandbox = {
      D, state: statusState, data: { questions, blocks: [], findings: [], ideas: [] }, qById: { 1: questions[0], 2: questions[1] },
      qEntry: (id) => D.entryOf(statusState, id), isNA: (q) => !D.applicable(q, statusState, questions),
      parentPending: (q) => D.waitingParent(q, statusState, questions), answerStatusText: (s) => labels.answerStatus[s.status].replace("{n}", s.parent),
      all: (selector) => selector === ".qcard[data-qid]" ? [card] : [], document: { activeElement: null, getElementById: () => ({ setAttribute(name, value) { this[name] = value; }, removeAttribute(name) { delete this[name]; } }) },
      stats: () => D.choiceStats(questions, statusState, []), t: labels, paintSettled() {}, paintChildren() {}, paintComments() {},
      paintChoiceCounts() {}, applyChoiceFilter() {}, paintResolvedSegs() {}, exportDialog: { open: false }, choiceFilter: "all", map: {},
    };
    const paint = vm.runInNewContext(script.slice(start, end) + "\npaint", sandbox);
    const chip = () => { paint(); return { stateName: chipEl.dataset.state, text: chipEl.textContent }; };
    const entered = chip();
    if (entered.stateName !== "answered" || entered.text !== labels.answerStatus.entered || !/not verified/i.test(entered.text)) return "an active answer is not answered and explicitly unverified";
    delete statusState.questions[1];
    const waiting = chip();
    if (waiting.stateName !== "open" || waiting.text !== labels.answerStatus["waiting-parent"].replace("{n}", 1) || !/not verified/i.test(waiting.text)) return "a parent-blocked answer does not show waiting and unverified";
    statusState.questions[1] = { choice: "accepted", variant: "no" };
    const retired = chip();
    return retired.stateName === "na" && retired.text === labels.answerStatus["not-applicable"] && /not verified/i.test(retired.text)
      || "a retired answer does not show not applicable and unverified";
  });

test("the export dialog is native and fed by one model; every control keeps its id",
  "two diverging builders let the preview, the text and the JSON disagree; a lost control breaks the export",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    if (!page.includes('<dialog id="export-dialog"')) return "the export is not a native dialog";
    const header = page.split("<header")[1].split("</header>")[0];
    if (!header.includes('id="export-open"') || page.indexOf('id="export-open"') > page.indexOf('class="bar')) return "the export button is not in the header above the tabs";
    const dialog = page.split('<dialog id="export-dialog"')[1].split("</dialog>")[0];
    for (const id of ["export-preview", "export-json-top", "copy-top", "export-status", "out"])
      if (!dialog.includes(`id="${id}"`)) return `the dialog lacks ${id}`;
    if (!dialog.includes('readonly')) return "the text summary is editable";
    if (!dialog.includes('method="dialog"')) return "the dialog has no native close";
    for (const id of ["print-owner", "print-audit", "clear"])
      if (!page.includes(`id="${id}"`)) return `the materials control ${id} is missing`;
    const script = scriptOf(page);
    const text = script.slice(script.indexOf("function decisionsText"), script.indexOf("function buildPreview"));
    const preview = script.slice(script.indexOf("function buildPreview"), script.indexOf("function openExportDialog"));
    if (!text.includes("exportModel()") || !preview.includes("exportModel()")) return "the text and the preview do not share the one model";
    // ONE source: the model is a view of the schema-4 payload, and the JSON downloads that same payload —
    // never a second builder reading the state apart.
    const payloadFn = script.slice(script.indexOf("function exportPayload"), script.indexOf("function exportModel"));
    const model = script.slice(script.indexOf("function exportModel"), script.indexOf("function decisionsText"));
    const download = script.slice(script.indexOf("function downloadJson"), script.indexOf("// ---- paint"));
    if (!payloadFn.includes("D.exportOf") || !model.includes("exportPayload()")) return "the export model is not built from the one schema-4 payload";
    if (!download.includes("exportModel().payload")) return "the JSON download is a second builder, not the one payload";
    if (!model.includes("j.zones") || !model.includes("e.comment")) return "the model drops the zones or the payload's comment (the legacy entry note)";
    if (!text.includes("m.zones") || !preview.includes("m.zones")) return "the marked zones do not reach the text and the preview";
    if (!script.includes("xp-goto") || !script.includes("openTarget(hash)")) return "the preview rows have no working Go link";
    if (!script.includes("factAnswers") && !script.includes("D.exportOf")) return "the JSON export is missing";
    return true;
  });

test("the export payload carries current comments, zones, passages and fact answers",
  "user input must travel in the current export without reviving legacy entry notes",
  () => {
    const state = normalize({ questions: { 1: { choice: "accepted", variant: "keep", note: "legacy note in the entry" } },
      notes: { q1: "current comment", b1: "block note" }, zones: { "1-0": true }, answers: { q3: "proof" },
      passages: [{ where: "a.js:1", quote: "x", note: "n", proof: { kind: "field", object: "b1" } }] });
    const out = exportOf(DQS, state, {});
    if (out.questions.find((q) => q.question === 1).comment !== "current comment") return "the current comment did not reach the export";
    if (out.zones?.["1-0"] !== true || out.factAnswers?.q3 !== "proof" || out.passages?.length !== 1 || out.notes?.b1 !== "block note")
      return "the export drops the zones, factAnswers, passages or block notes";
    const both = normalize({ questions: { 1: { choice: "accepted", variant: "keep", note: "entry" } }, notes: { q1: "shared" } });
    if (exportOf(DQS, both, {}).questions.find((q) => q.question === 1).comment !== "shared") return "the legacy entry note replaced the current comment";
    // The page's data carries the zone texts, so the preview can name a marked zone without the record's DOM.
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const embedded = JSON.parse(/<script id="data" type="application\/json">(.*?)<\/script>/s.exec(fs.readFileSync(html, "utf8"))[1]);
    const withZones = embedded.questions.find((q) => (THEMED.questions[q.id - 1]?.zones ?? []).length > 0);
    if (!withZones) return "the themed record has no zones to check";
    if (JSON.stringify(withZones.zones) !== JSON.stringify(THEMED.questions[withZones.id - 1].zones.map((z) => z.text))) return "the page's data lacks the zone texts";
    return true;
  });

test("the page script stays inside its size budget",
  "an unbounded page.mjs grows the shipped payload and the embedded runtime with nothing to catch it",
  () => {
    const size = fs.statSync(path.join(SKILL, "scripts", "page.mjs")).size;
    return size < 175 * 1024 || `page.mjs is ${size} bytes, past the 175KB budget`;
  });

test("the enriched HTML stays within 5% of the v4 baseline",
  "the v5 composition must not inflate the page without a measured bound; the baseline is the last pre-v5 renderer from git",
  () => {
    const recordPath = path.join(SOURCE_65507, "review.json");
    if (!fs.existsSync(recordPath) || !fs.existsSync(ANN_65507)) return skip(`the 65507 record or its annotations are not on this machine (${SOURCE_65507})`);
    const dir = path.join(run, "v5-budget-65507");
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(SOURCE_65507, "review.diff"), path.join(dir, "review.diff"));
    const review = enrich65507(JSON.parse(fs.readFileSync(recordPath, "utf8")), JSON.parse(fs.readFileSync(ANN_65507, "utf8")));
    const copy = path.join(dir, "review.json");
    fs.writeFileSync(copy, JSON.stringify(review));
    if (report("render", copy).status !== 0) return "the enriched copy does not render";
    const v5html = fs.statSync(path.join(dir, "review.html")).size;
    const gitRoot = path.join(ROOT, "..", "..", "..");
    const history = spawnSync("git", ["-C", gitRoot, "log", "--format=%H%x09%s", "--", "plugins/entrust/plugin/skills/review/scripts/page.mjs"], { encoding: "utf8" });
    if (history.status !== 0) return skip("no git history here, so there is no v4 baseline to compare");
    // The baseline is the commit just before the FIRST v5 commit in page.mjs's history — stable no matter
    // how many v5 fixes land afterwards, and honest (skipped) if a squash erased the series.
    const entries = history.stdout.trim().split("\n").map((l) => l.split("\t"));
    const firstV5 = entries.map(([, subject]) => /\bv5\b/i.test(subject)).lastIndexOf(true);
    const v4ref = firstV5 >= 0 ? entries[firstV5 + 1]?.[0] : undefined;
    if (!v4ref) return skip("no pre-v5 page.mjs commit in this history");
    for (const ref of [v4ref, "062cf5e9"]) {
    const v4dir = path.join(run, "baseline-budget-" + ref);
    fs.mkdirSync(path.join(v4dir, "scripts", "vendor"), { recursive: true });
    for (const f of ["page.mjs", "review.mjs", "labels.mjs", "decisions.mjs", "report.mjs", "diff.mjs", "diagram.mjs", "highlight.mjs", "annotations.mjs", "text.mjs", "vendor/shiki.mjs"]) {
      const content = spawnSync("git", ["-C", gitRoot, "show", `${ref}:plugins/entrust/plugin/skills/review/scripts/${f}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
      if (content.status !== 0) return `git show ${f}: ${content.stderr.slice(0, 200)}`;
      fs.writeFileSync(path.join(v4dir, "scripts", f), content.stdout);
    }
    fs.copyFileSync(copy, path.join(v4dir, "review.json"));
    fs.copyFileSync(path.join(dir, "review.diff"), path.join(v4dir, "review.diff"));
    const v4render = spawnSync(process.execPath, [path.join(v4dir, "scripts", "report.mjs"), "render", path.join(v4dir, "review.json")], { cwd: v4dir, encoding: "utf8" });
    if (v4render.status !== 0) return `the v4 baseline does not render: ${v4render.stderr.slice(0, 200)}`;
    const v4html = fs.statSync(path.join(v4dir, "review.html")).size;
    const growth = 100 * (v5html / v4html - 1);
    if (growth >= (ref === v4ref ? 5 : 0)) return `the enriched HTML grew ${growth.toFixed(2)}% over ${ref} (${v4html} -> ${v5html} bytes)`;
    console.log(`budget ${ref}: HTML ${v4html} -> ${v5html} bytes (${growth.toFixed(2)}%)`);
    }
    return true;
  });

test("the purpose toggles hide groups in map and tree; reset and deep links restore them",
  "an inclusive single filter cannot hide several groups; a hidden group a deep link cannot reach loses the block",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    for (const p of PURPOSES)
      if (!page.includes(`data-purpose-filter="${p}" aria-pressed="true" disabled`)) return `${p} does not start visible and disabled`;
    const script = scriptOf(page);
    if (!script.includes("function togglePurpose") || !script.includes("state.hiddenPurposes")) return "the runtime has no multi-toggles";
    if (!script.includes("hidden.includes(seg.dataset.purpose)") || !script.includes("hidden.includes(row.dataset.purpose)")) return "the hiding does not reach both map and tree";
    const clear = script.slice(script.indexOf("function clearFilters"), script.indexOf("chipBack.addEventListener"));
    if (!clear.includes("state.hiddenPurposes = []")) return "the reset does not restore the hidden groups";
    const open = script.slice(script.indexOf("function openTarget"), script.indexOf('window.addEventListener("hashchange"'));
    if (!open.includes("clearFilters()")) return "a block deep link does not reset the hiding";
    if (!script.includes("t.chip.hidden")) return "the hidden groups have no chip";
    // The model's counters are what the toggles hide: on the real record, tests are 15 files / 388 blocks.
    const recordPath = path.join(SOURCE_65507, "review.json");
    if (!fs.existsSync(recordPath) || !fs.existsSync(ANN_65507)) return skip(`the 65507 record is not on this machine (${SOURCE_65507})`);
    const dir = path.join(run, "v5-purpose-65507");
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(SOURCE_65507, "review.diff"), path.join(dir, "review.diff"));
    const review = enrich65507(JSON.parse(fs.readFileSync(recordPath, "utf8")), JSON.parse(fs.readFileSync(ANN_65507, "utf8")));
    const files = parseDiff(fs.readFileSync(path.join(dir, "review.diff"), "utf8"));
    const { errors, owner } = check(review, files, dir);
    if (errors.length) return errors.join("; ");
    const model = modelOf(review, files, owner, dir);
    return model.purpose.counts.tests.files === 15 && model.purpose.counts.tests.blocks === 388 || `the tests group is ${model.purpose.counts.tests.files} files / ${model.purpose.counts.tests.blocks} blocks, not 15/388`;
  });

test("the tree opens statically, reveals every block through its ancestors, and spies the current file",
  "a closed tree hides the files from the no-script reader; a reveal that leaves an empty shell loses the audit",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    const dirs = (page.match(/<details class="fdir"/g) ?? []).length, open = (page.match(/<details class="fdir" open>/g) ?? []).length;
    if (!dirs || dirs !== open) return "the tree does not open statically";
    if (page.includes("fresult")) return "the tree rows still carry the does-text";
    const row = page.split('class="frow"')[1].split("</li>")[0];
    if (row.includes('class="tag')) return "the tree rows still carry verdict tags";
    if (!page.includes("reveal-note")) return "the file header has no reveal note";
    for (const part of [".file.reveal .reveal-note { display: inline }", ".js .map[data-show] .file.reveal .seg { display: revert }",
      '.js .map[data-show] .file.reveal .seg[style*="display: none"] { display: none }'])
      if (!page.includes(part)) return `the reveal CSS lacks "${part}"`;
    const script = scriptOf(page);
    if (!script.includes('file.classList.add("reveal")')) return "a tree click does not reveal the file";
    if (!script.includes('seg.closest(".file.reveal")')) return "the filter does not spare the revealed file's blocks";
    if (!script.includes("aria-current") || !script.includes('classList.toggle("current"')) return "the scrollspy is missing";
    if (!script.includes('document.createElement("mark")') || !script.includes('event.key === "Enter"')) return "the search does not highlight or open on Enter";
    if (!script.includes("state.treeHidden")) return "the tree collapse does not persist";
    return true;
  });

test("the no-JS counter is the static Q+F with an honest title, and the v5 controls ship disabled",
  "a counter that reads saved state without scripts, or a live-looking control, misleads the no-script reader",
  () => {
    const recordPath = path.join(SOURCE_65507, "review.json");
    if (!fs.existsSync(recordPath) || !fs.existsSync(ANN_65507)) return skip(`the 65507 record or its annotations are not on this machine (${SOURCE_65507})`);
    const dir = path.join(run, "v5-nojs-65507");
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(SOURCE_65507, "review.diff"), path.join(dir, "review.diff"));
    const review = enrich65507(JSON.parse(fs.readFileSync(recordPath, "utf8")), JSON.parse(fs.readFileSync(ANN_65507, "utf8")));
    const copy = path.join(dir, "review.json");
    fs.writeFileSync(copy, JSON.stringify(review));
    if (report("render", copy).status !== 0) return "render failed";
    const page = fs.readFileSync(path.join(dir, "review.html"), "utf8");
    const badge = page.match(/<span class="tab-count" id="count-decisions"[^>]*>[^<]*<\/span>/)?.[0] ?? "";
    if (!badge.includes("Осталось основных решений и замечаний: 11")) return `the static counter is not 11: ${badge}`;
    if (!/статический/i.test(badge) || !/без JavaScript/i.test(badge) || !/сохранённые ответы не учитываются/i.test(badge)) return `the counter's title is not honest: ${badge}`;
    if (!/data-choice-filter="all"[^>]*aria-pressed="true"[^>]*disabled/.test(page)) return "the All control is not disabled";
    for (const part of ['id="export-open" class="act" disabled', 'data-answer="q4"'])
      if (!page.includes(part)) return `the no-script control is missing: ${part}`;
    if (!/<input type="text" class="act" id="answer-q4"[^>]*disabled>/.test(page)) return "the answer field is not disabled without scripts";
    return true;
  });

test("mobile targets reach 44px last in the CSS, and the owner print opens every nested disclosure",
  "a component min-height overriding the mobile block leaves a small target; a closed nested disclosure loses the code in print",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED)));
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    const style = page.split("<style>")[1].split("</style>")[0];
    const mobile = style.lastIndexOf("@media (max-width: 700px)");
    const print = style.indexOf("@media print");
    if (mobile < 0 || mobile > print) return "the mobile 44 block is not last before print";
    const block = style.slice(mobile, print);
    if (!block.includes("min-height: 44px") || !block.includes(".choice-filters button") || !block.includes(".theme-btn { min-height: 32px; height: 32px }")) return "the mobile block lacks the targets or the theme exception";
    if (!block.includes(".l b, .l i { width: 2.2em }")) return "the mobile gutters are not 2.2em";
    if (!style.includes(".choice-filters, .comment-edit, #export-open, #export-dialog { display: none !important }")) return "the print does not hide the v5 controls";
    if (!style.includes(".dunit[hidden], .dgroup[hidden] { display: block !important }")) return "the print hides the filtered cards";
    const script = scriptOf(page);
    const before = script.slice(script.indexOf('window.addEventListener("beforeprint"'), script.indexOf('window.addEventListener("afterprint"'));
    const buildAt = before.indexOf("buildWhere(d)"), openAt = before.indexOf('details:not([open])');
    if (buildAt < 0 || openAt < 0 || buildAt > openAt) return "the owner print does not build the lazy bodies before opening the nested disclosures";
    if (!before.includes("for (let i = 0; i < 2; i++)")) return "the owner print does not open the nested disclosures to the bottom";
    return true;
  });

test("the v5 words are localized and owed by capability; the block comment is the compact pattern",
  "a new control silently in English, or a permanent block input, fails the reader",
  () => {
    const result = render((r) => { Object.assign(r, structuredClone(THEMED)); r.language = "ru"; });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    for (const word of ["Решения", "Все", "Факты · проверки", "Отложено", "Завершено", "Нужен выбор владельца", "Предложенные исправления",
      "Нужны данные или проверка", "Завершённые · отложенные", "Выгрузить ответы", "Принятые решения", "Отложенные и черновики", "Ответы на факты",
      "Перейти", "Комментарий", "Ответы никуда не отправляются.", "ответ внесён", "Показаны все блоки файла вне режима", "Скрыто:",
      "Исправить", "Не исправлять", "Взять", "Не брать", "Подвопросы"])
      if (!page.includes(word)) return `the Russian page lacks "${word}"`;
    for (const english of [">All<", ">Owner choice needed<", ">Export answers<", ">answer entered<", ">Fix</button>", ">Take</button>"])
      if (page.includes(english)) return `English leaked into the Russian page: ${english}`;
    const oldRequired = requiredKeys(REVIEW), newRequired = requiredKeys(THEMED);
    for (const key of ["choice.filter.all", "group.owner", "export.open", "card.comment", "nojs.counter-title", "tree.reveal-note", "chip.hidden", "finding.limit.read"]) {
      if (!oldRequired.includes(key)) return `the common chrome ${key} is not required of a minimal record`;
      if (!newRequired.includes(key)) return `the v5 chrome ${key} is not required of a record with the new fields`;
    }
    for (const key of ["decision.answered", "decision.answer-label", "decision.children", "ideas.optional"])
      if (!newRequired.includes(key)) return `the capability key ${key} is not required of the themed record`;
    const noIdeas = structuredClone(THEMED); delete noIdeas.ideas;
    if (requiredKeys(noIdeas).includes("ideas.optional")) return "a record without ideas was asked for the idea words";
    // The block comment is the same compact pattern, wrapped for the clones to cut.
    if (!page.includes('<div class="block-comment act" data-blockcomment="b1">')) return "the block comment is not the compact wrapper";
    const script = scriptOf(page);
    if (!script.includes("function paintComments") || !script.includes(".block-comment")) return "the runtime does not paint the block comments";
    if (!script.includes('event.target.closest(".card-comment, .block-comment")')) return "the focusout does not collapse both comment kinds";
    return script.includes('s.querySelectorAll(".block-comment").forEach((n) => n.remove())') || "the related-code clones keep the comment wrapper";
  });

test("v6 choiceStats keeps accepted parents active until children settle; ideas and answers stay independent",
  "the badges and export must use the same valid decisions without promoting answers to verification",
  () => {
    const qs = [
      { id: 2, kind: "decision", variants: [{ id: "keep" }, { id: "base" }] },
      ...[9, 10, 11].map(id => ({ id, kind: "decision", parent: { question: 2, variants: ["keep"] }, variants: [{ id: "yes" }] })),
      { id: 4, kind: "fact" }
    ], fs = [{ id: 1 }], ideas = [{ id: "i1" }];
    let s = normalize({});
    const stats = () => choiceStats(qs, s, fs, ideas);
    if (stats().remaining !== 2 || stats().fact !== 1 || stats().i !== 1) return "fresh badges differ";
    s.questions[2] = { choice: "accepted", variant: "keep" };
    if (stats().remaining !== 1 || stats().q !== 0 || stats().settled.q2) return "accepted parent hides pending children or counts twice";
    for (const id of [9, 10, 11]) s.questions[id] = { choice: "accepted", variant: "yes" };
    if (stats().settled.q2 !== "done") return "completed children do not settle their parent";
    s.questions[2] = { choice: "accepted", variant: "base" }; s = settle(qs, s);
    if (stats().settled.q2 !== "done") return "base does not retire children";
    s.questions[2] = { choice: "deferred" };
    if (stats().remaining !== 2) return "reasonless deferral counts";
    s.notes.q2 = "later";
    if (stats().remaining !== 1 || stats().deferred !== 1 || stats().done !== 0) return "deferral treated as completed";
    s.findings.i1 = "apply"; s.answers.q4 = "proof";
    if (stats().remaining !== 1 || stats().fact !== 0 || stats().i !== 0) return "optional idea or fact changes mandatory count";
    if (exportOf(qs, s, {}).questions.some(q => q.question === 4)) return "fact promoted to decision";
    s = normalize(JSON.parse(JSON.stringify(s)));
    if (choiceStats(qs, s, fs).remaining !== stats().remaining) return "reload remaining differs";
    delete s.questions[2]; delete s.notes.q2;
    if (choiceStats(qs, s, fs).remaining !== 2 || stats().q !== 1) return "reset remaining differs";
    return true;
  });

test("v6 subtraction preserves anchors, affordance and the wide compact code tree",
  "removing duplicate UI must retain annotation targets, readable choices and the only file navigation",
  () => {
    if (render(r => Object.assign(r, structuredClone(THEMED))).status) return "render failed";
    const p = fs.readFileSync(html, "utf8");
    for (const id of ["progress-q", "apply-all", "export-json", "copy"])
      if (p.includes(`id="${id}"`)) return `duplicate UI survived: ${id}`;
    for (const id of ["summary", "coverage", "decisions", "passages", "passport", "q3", "f1", "b1"])
      if ((p.match(new RegExp(`id="${id}"`, "g")) ?? []).length !== 1) return `lost or duplicate anchor ${id}`;
    for (const text of ["D.choiceStats", 'data-cf-count="q"', 'data-tree-mode="flat"', 'id="tree-resize"', ".ftree.flat", "max-width: 1600px", "max-width: 90ch", ".qopts legend { font-size: 1rem; color: var(--fg); font-weight: 650", 'data-fragment="1"'])
      if (!p.includes(text)) return `v6 contract missing: ${text}`;
    return true;
  });

test("requirements are selectable in Code, with unit navigation and a complete no-script map",
  "the requirement control must use the recorded relationships rather than infer parent blocks or copy the diff",
  () => {
    const record = structuredClone(THEMED);
    record.language = "ru";
    const files = parseThemeDiff(), model = modelOf(record, files, check(record, files, run).owner, run);
    const output = page(record, files, model);
    if (!output.includes('id="code-requirement" disabled')) return "the requirement selector is not disabled without JavaScript";
    if (!output.includes("R1 — Upper case wherever a price is shown. (3)")) return "the selector does not show the model's unique block count";
    if (!output.includes("R2 — A requirement nothing serves. (0)")) return "a requirement with no blocks is not selectable";
    if (!output.includes('data-navigation-view="units"')) return "unit navigation is missing";
    if (!output.includes("document.createElement(\"details\")") || !output.includes("b.unit || t.code.noUnit")) return "unit groups are not derived from block data";
    if (!output.includes('id="b1"') || !output.includes("data-serves=")) return "the original map or requirement links are missing";
    for (const key of ["code.requirement", "code.units", "code.no-related", "code.no-visible"]) {
      if (!LABELS[key] || !CATALOGS.ru[key]) return `missing localization: ${key}`;
      if (!requiredKeys(THEMED).includes(key) || !requiredKeys(REVIEW).includes(key)) return `the new wording is not required: ${key}`;
    }
    const custom = { ...structuredClone(THEMED), language: "custom", labels: Object.fromEntries(requiredKeys(THEMED).map((key) => [key, `«${LABELS[key]}»`])) };
    if (check(custom, files, run).errors.length) return "an existing enriched custom catalog no longer passes check";
    if (labelsOf(custom)("code.requirement") !== custom.labels["code.requirement"]) return "the custom selector label is not used";
    for (const key of ["code.no-related", "code.no-visible"]) {
      const missing = structuredClone(custom); delete missing.labels[key];
      if (!check(missing, files, run).errors.some((e) => e.includes(key))) return `missing ${key} was not reported`;
    }
    return true;
  });

process.exit(summarize(await runCases(TESTS), TESTS.length));
