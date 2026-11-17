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
import { reportFixtures, enrich65507 } from "./review/report-fixtures.mjs";
import { CATALOGS, LABELS, BASE_KEYS, labelsOf, requiredKeys } from "../plugin/skills/review/scripts/labels.mjs";
import { check, modelOf, weightOverview, sourceOf, CHALLENGERS, DIRECTIONS, EVIDENCE, OUTCOMES, SOURCES, UNIT_VERDICTS, VERDICTS, QUESTION_KINDS, COVERAGE_KINDS } from "../plugin/skills/review/scripts/review.mjs";
import { page } from "../plugin/skills/review/scripts/page.mjs";
import { parseDiff } from "../plugin/skills/review/scripts/diff.mjs";
import { normalize, settle, applicable, counters, exportOf, validAccept, validDefer } from "../plugin/skills/review/scripts/decisions.mjs";

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
    return (page.match(/<svg xmlns/g) ?? []).length === 2 && page.includes('--shiki-dark:') && page.includes('id="b1"') && page.includes('id="i1"')
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

test("a legacy record stays valid and warning-free; the themed record with decision cards passes check",
  "optional fields must not make old records deficient, and a record of another theme and order must stand on its own",
  () => {
    const files = parseThemeDiff();
    const legacy = check(REVIEW, files, run);
    if (legacy.errors.length || legacy.warnings.length) return `legacy record: ${[...legacy.errors, ...legacy.warnings].join("; ")}`;
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
  "the new controls must not break old translations, nor appear silently in English on any record",
  () => {
    const files = parseThemeDiff();
    const catalogFor = (r) => Object.fromEntries(requiredKeys(r).map((key) => [key, LABELS[key]]));
    const baseOnly = Object.fromEntries(BASE_KEYS.map((key) => [key, LABELS[key]]));
    // A legacy record needs the old base plus the always-visible controls, the viewer for its pictures, the structure note.
    const legacy = check({ ...structuredClone(REVIEW), language: "custom", labels: catalogFor(REVIEW) }, files, run);
    if (legacy.errors.length) return `legacy custom catalog refused: ${legacy.errors.join("; ")}`;
    const silent = check({ ...structuredClone(REVIEW), language: "custom", labels: baseOnly }, files, run);
    if (!silent.errors.some((e) => e.includes("complete labels catalog"))) return "the always-visible new controls fell back to English on a legacy record";
    // An enriched record asks for the keys of its capabilities; a legacy catalog no longer serves it.
    const enriched = check({ ...structuredClone(THEMED), language: "custom", labels: catalogFor(REVIEW) }, files, run);
    if (!enriched.errors.some((e) => e.includes("complete labels catalog"))) return "an enriched record with a legacy catalog was accepted";
    const full = check({ ...structuredClone(THEMED), language: "custom", labels: catalogFor(THEMED) }, files, run);
    if (full.errors.length) return `a catalog of the enabled capabilities was refused: ${full.errors.join("; ")}`;
    // One capability alone asks only for its own keys: a passport without cards needs no question words.
    const passportOnly = { ...structuredClone(REVIEW), passport: structuredClone(THEMED.passport) };
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
    if (counters(DQS, selected).accepted !== 1) return "the child's acceptance was not counted while the parent is undecided";
    const kept = dstate({ 1: { choice: "accepted", variant: "keep" }, 2: { choice: "accepted", variant: "a" } });
    if (!applicable(DQS[1], kept, DQS) || counters(DQS, kept).accepted !== 2) return "the child under the accepted applicable variant was not active";
    const reverted = dstate({ 1: { choice: "accepted", variant: "revert" }, 2: { choice: "accepted", variant: "a" } });
    if (applicable(DQS[1], reverted, DQS)) return "the child stayed applicable under the accepted outside variant";
    const settled = settle(DQS, reverted);
    if (settled.questions[2]?.choice || settled.questions[2]?.variant) return "settle kept the answer of a not-applicable child";
    const c = counters(DQS, settled);
    if (c.accepted !== 1 || c.notApplicable !== 1 || c.remaining !== 1) return `counters under the outside variant: ${JSON.stringify(c)}`;
    // The parent's decision is cancelled: the child applies again, but its old answer does not return silently.
    const cancelled = settle(DQS, dstate({ 2: settled.questions[2] }));
    if (!applicable(DQS[1], cancelled, DQS) || cancelled.questions[2]?.choice) return "the old answer reactivated silently after the parent was cancelled";
    if (counters(DQS, cancelled).remaining !== 3) return "the re-applicable child was not counted as remaining";
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
    if (validDefer(DQS[3], bare) || counters(DQS, bare).deferred !== 0) return "a deferral without a reason was counted";
    const reasoned = dstate({ 4: { choice: "deferred" } }, { q4: "Not now: the contract is unsettled." });
    const c = counters(DQS, reasoned);
    if (!validDefer(DQS[3], reasoned) || c.deferred !== 1 || c.accepted !== 0 || c.remaining !== 2) return `deferral counters: ${JSON.stringify(c)}`;
    const evidence = dstate({ 3: { choice: "accepted" } }, { q3: "done" });
    if (counters(DQS, evidence).accepted !== 0) return "an evidence question was counted as an accepted decision";
    const emptyAccept = dstate({ 4: { choice: "accepted" } });
    if (validAccept(DQS[3], emptyAccept) || counters(DQS, emptyAccept).accepted !== 0) return "a decision without variants was accepted with no comment";
    const commented = dstate({ 4: { choice: "accepted" } }, { q4: "Keep as is." });
    if (!validAccept(DQS[3], commented) || counters(DQS, commented).accepted !== 1) return "a substantive comment did not accept a variant-less decision";
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
    const c = counters(DQS, bare);
    if (c.accepted !== 1 || c.remaining !== 2) return `an invalid acceptance was counted: ${JSON.stringify(c)}`;
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
    if (out.schema_version !== 3 || out.record_sha256 !== "r".repeat(64) || out.diff_sha256 !== "d".repeat(64)) return "the export lacks its schema or digests";
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
    const c = model.counters;
    for (const cell of [`<b>${c.files}</b>`, `<b>${c.addedFiles}</b>`, `<b>${c.removedFiles}</b>`, `<b>${c.blocks}</b>`,
      `<b>${c.evidenceBlocks}</b><span>fragments awaiting evidence</span>`, `<b>${c.decisions}</b>`])
      if (!page.includes(cell)) return `the counters differ from the model: missing ${cell}`;
    if ((page.match(/class="qcard/g) ?? []).length !== 5) return "the five kinded questions did not become cards";
    if (!page.includes('data-parent="3"') || !page.includes('name="vq3"')) return "the child card or the variant radios are missing";
    // The full map is real markup in closed per-file disclosures, not a template: readable without scripts.
    if (!page.includes('<details class="file-details"') || page.includes("<template")) return "the map is not a no-JS disclosure";
    if (page.includes('class="file-details" open')) return "the full map starts open";
    // Deterministic render, and the digest in the page is the digest of these bytes.
    const again = report("render", data);
    if (again.status !== 0 || !before.equals(fs.readFileSync(data)) || page !== fs.readFileSync(html, "utf8")) return "the themed render is not byte-stable or touched the record";
    const digest = createHash("sha256").update(before).digest("hex");
    const embedded = JSON.parse(/<script id="data" type="application\/json">(.*?)<\/script>/s.exec(page)[1]);
    if (embedded.digest.record !== digest || embedded.digest.diff !== THEMED.diff.sha256) return "the page's digests are not the bytes' digests";
    // A legacy record renders through the same path with no card machinery and no passport.
    const legacy = render();
    if (legacy.status !== 0) return legacy.stderr;
    const old = fs.readFileSync(html, "utf8");
    for (const absent of ['class="qcard', '<details class="passport-card"', '<div class="status-strip"', 'na-badge" hidden'])
      if (old.includes(absent)) return `the legacy page grew "${absent}"`;
    if (!old.includes('<li id="q1"><strong>Q1</strong>')) return "the legacy question lost its plain line";
    return true;
  });

test("the question tree renders every level once: grandchildren keep their cards, a legacy child is not duplicated",
  "roots plus direct children lost the grandchildren, and a child without a kind stood twice with one id",
  () => {
    const result = render((r) => {
      Object.assign(r, structuredClone(THEMED));
      // Q3 -> Q4 -> Q6: three levels of cards; Q7 is a legacy child of Q6; Q8 stays a plain legacy root.
      r.questions.push(
        { at: "src/invoices/upper.js:2", text: "Which widths exactly?", kind: "decision", resolver: "owner",
          parent: { question: 4, variants: ["narrow"] },
          variants: [{ id: "x", text: "The narrow set", consequences: [{ text: "Less to check.", sources: [{ ref: "/requirements/0" }] }] }] },
        { at: "docs/billing.md", text: "A legacy child of the grandchild.", parent: { question: 6, variants: ["x"] } },
        { at: "docs/billing.md", text: "A legacy root." });
    });
    if (result.status !== 0) return result.stderr;
    const page = fs.readFileSync(html, "utf8");
    for (const id of ["q3", "q4", "q6", "q7", "q8"])
      if ((page.match(new RegExp(`id="${id}"`, "g")) ?? []).length !== 1) return `anchor ${id} does not appear exactly once`;
    if (!page.includes('data-parent="4"')) return "the grandchild lost its parent link";
    if (page.includes('<li id="q7"')) return "the legacy child was duplicated into the legacy list";
    if (!page.includes('class="qlegacy child" id="q7"')) return "the legacy child has no plain line of its own";
    if (!page.includes('<li id="q8"')) return "the legacy root lost its plain line";
    const order = ["q3", "q4", "q6", "q7"].map((id) => page.indexOf(`id="${id}"`));
    if (order.some((at, i) => at < 0 || (i && at <= order[i - 1]))) return "the tree is not drawn root-first down the chain";
    if ((page.match(/class="qcard/g) ?? []).length !== 6) return "the five themed cards plus the grandchild are not all cards";
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
    if (!page.includes("status-strip") || !page.includes("2049")) return "the authored status strip is missing";
    if (!drawn.stdout.includes("## Принятые компромиссы") || !drawn.stdout.includes("Варианты:")) return "the Russian printout lacks the tradeoffs or the cards";
    // The counters on the page equal the model computed from the same bytes.
    const files = parseDiff(fs.readFileSync(path.join(dir, "review.diff"), "utf8"));
    const { errors, owner } = check(review, files, dir);
    if (errors.length) return errors.join("; ");
    const model = modelOf(review, files, owner, dir);
    for (const cell of [`<b>${model.counters.files}</b>`, `<b>${model.counters.blocks}</b>`, `<b>${model.counters.evidenceBlocks}</b>`, `<b>${model.counters.decisions}</b>`])
      if (!page.includes(cell)) return `the page counters differ from the model: missing ${cell}`;
    if (model.counters.evidenceBlocks !== 224 + 4 - model.blocks.filter((b) => b.questions.includes(3) && b.questions.includes(5)).length) return "evidence fragments are not a unique set";
    // Deterministic at this scale, and the immutable original never changed.
    const again = report("render", copy);
    if (again.status !== 0 || page !== fs.readFileSync(path.join(dir, "review.html"), "utf8")) return "the enriched render is not byte-stable";
    return createHash("sha256").update(fs.readFileSync(recordPath)).digest("hex") === originalSha || "the immutable original was touched";
  });

process.exit(summarize(await runCases(TESTS), TESTS.length));
