#!/usr/bin/env node
// Does the review skill's report script hold a review to its diff? Runs plugin/skills/review/scripts/report.mjs
// on one prepared case with a review written here; it calls no model. It checks that a complete review becomes
// a page that loads nothing from elsewhere and a printout in the shape SKILL.md gives the report, and that an
// incomplete one is refused with every fault listed. Run it after an edit to those scripts, to
// references/interactive-report.md or to the report's shape in SKILL.md.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT, registry, runCases, summarize } from "./lib/harness.mjs";
import { prepare } from "./review/prepare.mjs";
import { LABELS } from "../plugin/skills/review/scripts/labels.mjs";
import { DIRECTIONS, EVIDENCE, SOURCES, UNIT_VERDICTS, VERDICTS } from "../plugin/skills/review/scripts/review.mjs";

const { cases: TESTS, test } = registry();
const SKILL = path.join(ROOT, "skills", "review"), SCRIPT = path.join(SKILL, "scripts", "report.mjs");
const { run } = prepare("currency-contract", "clean"), repo = path.join(run, "repo");
const data = path.join(run, "review.json"), html = path.join(run, "review.html");

// A review of that case's diff: three changed lines in one file, eight in a new test file.
const REVIEW = {
  title: "Upper-case <currency> codes", range: "HEAD~1..HEAD",
  change: { goal: "Show currency codes in upper case.", parts: ["The archive reader converts the code."], sources: ["brief.md"] },
  verdict: "The change does its task.", target: "The change is already this.", recommendation: "Accept it.",
  steps: [{ text: "Add the test.", findings: [1] }],
  requirements: [{ id: 1, text: "Upper case wherever a price is shown.", source: "task", met: "traced" },
    { id: 2, text: "A requirement nothing serves.", source: "discussion", doubt: "The contract says otherwise." },
    { id: 3, text: "A requirement that fails.", source: "assumption" }],
  findings: [{ id: 1, title: "A finding", direction: "tests", evidence: "traced", at: "test/archive.test.js:5", what: "What happens.", shown_by: "The regression that passes.", fix: "The fix.", untested: [1] },
    { id: 2, title: "A defect", direction: "behavior", evidence: "traced", at: "src/invoices/archive.js:2", what: "What breaks.", shown_by: "The caller at `src/main.js:4`.", fix: "The fix.", breaks: [3] }],
  ideas: [{ title: "An idea", at: "src/invoices/archive.js:2", text: "What it gains." }],
  screens: [{ name: "The list", mockup: "https://design.example/list", before: "before.png", after: "after.png",
    differences: [{ what: "A difference.", why: "The task says so." }, { what: "Another.", finding: 1 }], missing: "The empty state." },
    { name: "The page", missing: "No picture was given." }],
  units: [{ name: "readArchive", jobs: ["reads the archive"], uses: ["rows"], verdict: "keep" }, { name: "rows", existing: true, jobs: ["holds the rows"] }],
  target_units: [{ name: "readArchive", jobs: ["reads the archive"], uses: ["upper"] }, { name: "upper", jobs: ["a unit to write"] }],
  blocks: [
    { path: "src/invoices/archive.js", added: "2, 4", removed: "3", unit: "readArchive", does: "Converts the code.", serves: [1], verdict: "keep" },
    { path: "test/archive.test.js", added: "1-8", does: "Tests it.", serves: [1], verdict: "fix", findings: [1] },
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
      && [">What to do<", ">Review conclusion<", ">Target solution<", ">Task<", 'id="files"', "<ol"].every((part) => page.includes(part))
      || "the page lacks a diagram per structure, highlighted code, a block anchor, the idea, one of the four parts of the summary, the steps or the file tree";
  });

test("a requirement is met only on the reviewer's word, a missing test is not a failure, and a screen nobody compared says so",
  "a page that reads \"met\" off a block, turns a test gap into a failure or shows an uncompared screen as matching misleads whoever decides by it",
  () => {
    if (render().status !== 0) return "render failed";
    const page = fs.readFileSync(html, "utf8"), rows = page.split('id="requirements"')[1].split("</table>")[0].split("<tr>").slice(2);
    const has = (row, ...words) => words.every((word) => row.includes(`>${word}<`));
    if (!has(rows[0], "met", "no test", "task") || has(rows[0], "fails")) return "requirement 1, traced and untested, is not shown as met with no test";
    if (!has(rows[1], "not checked", "discussion") || !rows[1].includes("To reconsider") || has(rows[1], "met")) return "requirement 2, unchecked and doubted, is not shown so";
    if (!has(rows[2], "fails", "assumption") || has(rows[2], "met")) return "requirement 3, broken by a finding, is not shown as failing";
    const [, list, alone] = page.split('<article class="finding">');
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
    const translated = render((r) => { r.labels = { "actions": "Что делать", "met": "выполнено", "findings": "Находки", "decided": "Решено: {n}" }; });
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

test("the printout has the sections SKILL.md gives the report, in its order",
  "the script and the page both state the report's shape; this is what keeps the two from parting",
  () => {
    const shape = [...fs.readFileSync(path.join(SKILL, "SKILL.md"), "utf8").matchAll(/^ {4}## (.+)$/gm)].map((m) => m[1]);
    const printed = [...render().stdout.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    return shape.length > 4 && shape.join("\n") === printed.join("\n") || `SKILL.md has [${shape.join(", ")}], the printout [${printed.join(", ")}]`;
  });

test("a review that does not match the diff is refused, every fault is listed, and no page is written",
  "a page over a partly mapped change reads as a complete review",
  () => {
    const faults = [
      [(r) => { r.blocks[1].added = "1-7"; }, "test/archive.test.js: no block covers added 8"],
      [(r) => { r.blocks.push({ ...r.blocks[0], added: "2", removed: "" }); }, "src/invoices/archive.js +2 is in block 1 and in block 3"],
      [(r) => { r.blocks[1].findings = [9]; }, "block 2 names finding 9, which is not listed"],
      [(r) => { r.blocks[0].serves = [7]; }, "block 1 names requirement 7, which is not listed"],
      [(r) => { r.blocks[1].findings = []; }, "block 2 is to fix and names no finding"],
      [(r) => { r.blocks[0].unit = "rows"; }, 'block 1: "rows" is not a unit of the change'],
      [(r) => { delete r.blocks[0].unit; }, "unit readArchive has no block"],
      [(r) => { r.units[0].uses = ["nobody"]; }, "units: readArchive names unit nobody, which is not listed"],
      [(r) => { r.findings[1].breaks = [5]; }, "finding 2 names requirement 5, which is not listed"],
      [(r) => { r.findings[0].breaks = [1]; }, 'finding 1 is about tests: it lists requirements under "untested", not "breaks"'],
      [(r) => { r.findings[1].untested = [1]; }, 'finding 2 is not about tests: it lists requirements under "breaks", not "untested"'],
      [(r) => { r.requirements[2].met = "traced"; }, "requirement 3 is marked met, and finding 2 breaks it"],
      [(r) => { r.requirements[0].met = "judgment"; }, "requirement 1: met is one of ran, traced"],
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

test("the page that tells a reviewer what to write names every word the check accepts, and its example parses",
  "the vocabulary lives in the check; a page that teaches another word sends the reviewer into a refusal",
  () => {
    const page = fs.readFileSync(path.join(SKILL, "references", "interactive-report.md"), "utf8");
    const absent = [...VERDICTS, ...UNIT_VERDICTS, ...DIRECTIONS, ...EVIDENCE, ...SOURCES].filter((word) => !page.includes(`\`${word}\``));
    if (absent.length) return `interactive-report.md does not name ${absent.join(", ")}`;
    const example = /\n {4}\{\n[\s\S]*?\n {4}\}\n/.exec(page);
    try { return Object.keys(JSON.parse(example[0])).join(" ") === [...Object.keys(REVIEW), "labels"].join(" ") || "the example's fields differ from the fields this suite renders"; }
    catch (error) { return `the example is not JSON: ${error.message}`; }
  });

process.exit(summarize(await runCases(TESTS), TESTS.length));
