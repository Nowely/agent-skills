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
import { DIRECTIONS, EVIDENCE, UNIT_VERDICTS, VERDICTS } from "../plugin/skills/review/scripts/review.mjs";

const { cases: TESTS, test } = registry();
const SKILL = path.join(ROOT, "skills", "review"), SCRIPT = path.join(SKILL, "scripts", "report.mjs");
const { run } = prepare("currency-contract", "clean"), repo = path.join(run, "repo");
const data = path.join(run, "review.json"), html = path.join(run, "review.html");

// A review of that case's diff: three changed lines in one file, eight in a new test file.
const REVIEW = {
  title: "Upper-case <currency> codes", range: "HEAD~1..HEAD",
  change: { goal: "Show currency codes in upper case.", parts: ["The archive reader converts the code."], sources: ["brief.md"] },
  verdict: "The change does its task.", target: "The change is already this.",
  requirements: [{ id: 1, text: "Upper case wherever a price is shown." }, { id: 2, text: "A requirement nothing serves." }],
  findings: [{ id: 1, title: "A finding", direction: "tests", evidence: "traced", at: "test/archive.test.js:5", what: "What happens.", fix: "The fix.", breaks: [2] }],
  units: [{ name: "readArchive", jobs: ["reads the archive"], uses: ["rows"], verdict: "keep" }, { name: "rows", existing: true, jobs: ["holds the rows"] }],
  target_units: [{ name: "readArchive", jobs: ["reads the archive"], uses: ["upper"] }, { name: "upper", jobs: ["a unit to write"] }],
  blocks: [
    { path: "src/invoices/archive.js", added: "2, 4", removed: "3", unit: "readArchive", does: "Converts the code.", serves: [1], verdict: "keep" },
    { path: "test/archive.test.js", added: "1-8", does: "Tests it.", serves: [1], verdict: "fix", findings: [1] },
  ],
  questions: [{ at: "docs/billing.md", text: "A question." }], coverage: "What was read.",
};
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
    const outside = page.match(/\b(?:src|href)="(?!#)[^"]*"|@import|url\(/);
    if (outside) return `the page reaches outside itself: ${outside[0]}`;
    if (page.includes("<currency>") || !page.includes("&lt;currency&gt;")) return "the title reached the page unescaped";
    return (page.match(/<svg /g) ?? []).length === 2 && page.includes('class="t-k"') && page.includes('id="b1"') && page.includes(">fails<")
      || "the page lacks a diagram per structure, highlighted code, a block anchor or the failed requirement";
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
      [(r) => { r.findings[0].breaks = [5]; }, "finding 1 names requirement 5, which is not listed"],
      [(r) => { r.blocks[0].added = "all"; }, 'block 1: "all" is for a block to remove'],
      [(r) => { delete r.change; }, '"change.goal" is missing'],
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
    const absent = [...VERDICTS, ...UNIT_VERDICTS, ...DIRECTIONS, ...EVIDENCE].filter((word) => !page.includes(`\`${word}\``));
    if (absent.length) return `interactive-report.md does not name ${absent.join(", ")}`;
    const example = /\n {4}\{\n[\s\S]*?\n {4}\}\n/.exec(page);
    try { return Object.keys(JSON.parse(example[0])).join(" ") === Object.keys(REVIEW).join(" ") || "the example's fields differ from the fields this suite renders"; }
    catch (error) { return `the example is not JSON: ${error.message}`; }
  });

process.exit(summarize(await runCases(TESTS), TESTS.length));
