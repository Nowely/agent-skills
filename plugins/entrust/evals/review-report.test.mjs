#!/usr/bin/env node
// Does the review skill's report script hold a review to its diff? Runs plugin/skills/review/scripts/report.mjs
// on one prepared case with a review written here; it calls no model. It checks that a complete review becomes
// a page and a printout in the shape SKILL.md gives the report, and that an incomplete one is refused with every
// fault listed; review-page.test.mjs checks the page itself. Run it after an edit to those scripts, to
// references/report-data.md or to the report's shape in SKILL.md.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, registry, runCases, skip, summarize } from "./lib/harness.mjs";
import { prepare } from "./review/prepare.mjs";
import { reportFixtures, hostileFixture } from "./review/report-fixtures.mjs";
import { CATALOGS, LABELS, labelsOf, languageOf } from "../plugin/skills/review/scripts/labels.mjs";
import { check, modelOf, weightOverview, sourceOf, BLOCK_KINDS, REQUIREMENT_STATES, PROVENANCES, CHALLENGERS, DIRECTIONS, EVIDENCE, MECHANISM_CHANGES, OUTCOMES, SHOTS, SOURCES, UNIT_VERDICTS, VERDICTS, QUESTION_KINDS, COVERAGE_KINDS, PURPOSES, purposeOfPath } from "../plugin/skills/review/scripts/review.mjs";
import { page } from "../plugin/skills/review/scripts/page.mjs";
import { createSyntax, highlight } from "../plugin/skills/review/scripts/highlight.mjs";
import { parseDiff } from "../plugin/skills/review/scripts/diff.mjs";

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
// The record as the page carries it to its runtime: the JSON island.
const dataOf = (pageHtml) => JSON.parse(pageHtml.match(/<script type="application\/json" id="data">(.*?)<\/script>/s)[1]);

test("the printout says when a decision's variants combine and names every variant its recommendation names",
  "the critic and verifier read the printout: a recommendation of several variants printed as none of them",
  () => {
    const result = render((r) => Object.assign(r, structuredClone(THEMED), { questions: THEMED.questions.map((q, i) => i !== 2 ? q
      : { ...q, multiple: true, recommendation: { text: q.recommendation.text, variants: ["status-quo", "extend"], sources: q.recommendation.sources } }) }));
    if (result.status !== 0) return `render refused: ${result.stderr}`;
    const q3 = result.stdout.split("\n").filter((l) => /status-quo|extend|One or more/.test(l)).join("\n");
    return /\[status-quo, extend\]/.test(q3) && /One or more may be chosen/.test(q3) || q3;
  });

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

test("a record without questions checks and renders, and both renderings read it as no questions",
  "the contract leaves questions optional and check accepts the record, so a render that requires the list crashes on a valid review",
  () => {
    const result = render((r) => { delete r.questions; });
    if (result.status !== 0) return `a record without questions was not rendered: ${result.stderr}`;
    const t = labelsOf(REVIEW);
    if (dataOf(fs.readFileSync(html, "utf8")).questions.length) return "the page carries questions the record does not have";
    return result.stdout.includes(`## ${t("questions")}\n${t("none")}\n`) || "the printout does not say there are no questions";
  });

test("lines prints every changed line under its file, with the address a block names it by",
  "a reviewer who computes line numbers from hunk headers gets them wrong; the listing is where blocks take them from",
  () => {
    const { stdout, status } = report("lines", patch);
    const archive = stdout.split("test/archive.test.js")[0];
    return status === 0 && archive.startsWith("src/invoices/archive.js\n") && ["+2", "-3", "+4"].every((a) => archive.includes(`\n  ${a} `))
      && stdout.includes("\n  +8 ") || `unexpected listing:\n${stdout}`;
  });

test("a frozen comparison can be traced to the final report or to an explicit limit",
  "a clean render must not silently drop an issued comparison or accept a link that names no author-facing item",
  () => {
    fs.writeFileSync(data, JSON.stringify(REVIEW));
    const emitted = report("comparisons", data);
    if (emitted.status !== 0) return emitted.stderr;
    const inventory = JSON.parse(emitted.stdout);
    if (inventory.diffSha256 !== REVIEW.diff.sha256 || !inventory.comparisons.length ||
        !inventory.comparisons.some(c => c.left.side === "base" && c.right.side === "head" && c.left.value !== c.right.value))
      return "patch replacements or their revision sides were lost";
    const name = "comparisons.json";
    fs.writeFileSync(path.join(run, name), emitted.stdout);
    const pass = { inventory: name, sha256: createHash("sha256").update(emitted.stdout).digest("hex"),
      decisions: inventory.comparisons.map((row, i) => i === 0 ? { key: row.key, ref: "/findings/0" }
        : { key: row.key, unchecked: "No runtime contract was available." }) };
    const valid = render(r => { r.comparisonReview = pass; });
    if (valid.status !== 0) return valid.stderr;
    for (const [alter, fault] of [
      [p => p.decisions.pop(), "missing decision"],
      [p => p.decisions.push(p.decisions[0]), "duplicate comparison decision"],
      [p => { p.decisions[0].ref = "/findings/99999"; }, "does not resolve"],
      [p => { p.decisions[0].settled = "also closed"; }, "choose one"],
      [p => { p.sha256 = "stale"; }, "inventory digest"],
    ]) {
      const result = render(r => { r.comparisonReview = structuredClone(pass); alter(r.comparisonReview); });
      if (result.status === 0 || !result.stderr.includes(fault)) return "failed to detect " + fault;
    }
    return true;
  });

test("comparison witnesses preserve source values, or record why a parser could not supply them",
  "a plausible but false agreement can hide a change when a snapshot is stale or a string literal is normalized",
  () => {
    const fixture = fs.mkdtempSync(path.join(run, "pairs-"));
    const base = path.join(fixture, "base"), head = path.join(fixture, "head");
    fs.mkdirSync(base); fs.mkdirSync(head);
    const inputs = [
      ["message.ts", ["export const names = [{id: 'a', label: getLabel()}, {id: 'b', label: getLabel()}];"],
        ["export const names = [{id: 'a', label: 'A  B'}, {id: 'b', label: getLabel()}];"]],
      ["box.scss", [".box { color: red; }", ".outer { padding: 0; }"],
        [".box { color: red; }", ".outer { padding: 0; }", ".box { margin: 0; }"]],
    ];
    let diff = "";
    for (const [file, a, b] of inputs) {
      fs.writeFileSync(path.join(base, file), a.join("\n") + "\n");
      fs.writeFileSync(path.join(head, file), b.join("\n") + "\n");
      diff += ["diff --git a/" + file + " b/" + file, "--- a/" + file, "+++ b/" + file,
        "@@ -1," + a.length + " +1," + b.length + " @@", ...a.map(l => "-" + l), ...b.map(l => "+" + l)].join("\n") + "\n";
    }
    const record = path.join(fixture, "review.json");
    fs.writeFileSync(path.join(fixture, "input.diff"), diff);
    fs.writeFileSync(record, JSON.stringify({diff: {file: "input.diff", sha256: createHash("sha256").update(diff).digest("hex")}}));
    const build = () => report("comparisons", record, base, head);
    const first = build();
    if (first.status !== 0 || build().stdout !== first.stdout) return "source inventory not reproducible: " + first.stderr;
    const {comparisons: pairs, limits} = JSON.parse(first.stdout);
    const resolver = createRequire(path.join(repo, "package.json"));
    const installed = name => { try { resolver.resolve(name); return true; } catch { return false; } };
    if (installed("typescript")) {
      const item = pairs.find(p => p.contrast?.fieldForms?.label);
      if (!item || item.contrast.fieldForms.label.base !== "CallExpression" || item.contrast.fieldForms.label.head !== "StringLiteral" ||
          !item.right.value.includes("'A  B'") || item.left.side !== "base") return "source change lost its provenance or literal whitespace";
      fs.writeFileSync(path.join(head, "message.ts"), "export const unrelated = 1;\n");
      const stale = JSON.parse(build().stdout);
      if (!stale.limits.some(l => l.file === "message.ts" && l.reason.includes("differs from the saved patch")) ||
          stale.comparisons.some(p => p.file === "message.ts" && p.contrast)) return "stale snapshot presented as structural evidence";
    } else if (!limits.some(l => l.file === "message.ts" && l.reason.includes("parser unavailable"))) return "missing parser was unreported";
    if (installed("postcss-scss")) {
      const css = pairs.find(p => p.file === "box.scss" && p.contrast);
      if (!css || css.left.line !== 1 || css.right.line !== 3 || css.contrast.interveningSiblings.join() !== ".outer:2") return "cascade context missing";
    } else if (!limits.some(l => l.file === "box.scss" && l.reason.includes("parser unavailable"))) return "missing style parser was unreported";
    return true;
  });

test("two reviews of one change keep their decisions apart, and one review rendered twice keeps them together",
  "decisions stored under the title and the range of one review were applied to another review of the same change",
  () => {
    const key = () => dataOf(fs.readFileSync(html, "utf8")).digest.key;
    render(); const first = key();
    render(); const again = key();
    render((r) => { r.findings[1].title = "Another defect"; });
    return first === again && first !== key() || "the page's name for its decisions does not follow the review's content";
  });

test("the printout presents the verdict, current solution, target and recommendations in that order",
  "a conclusion without a distinguishable current and target solution hides what the recommendation changes",
  () => {
    const out = render().stdout, labels = ["## Verdict", "How it works now:", "Target solution:", "Recommendation:"];
    const positions = labels.map((label) => out.indexOf(label));
    return positions.every((pos, i) => pos >= 0 && (i === 0 || pos > positions[i - 1])) || "summary order differs";
  });

test("the printout lists each route's steps in order, each with its block, place, role and how it gets its input, and each requirement with its origin and quote",
  "the critic and the verifier read the printout: a route or a requirement's source they cannot see is one they cannot check",
  () => {
    const out = render((r) => { r.requirements[2].source = "author"; }).stdout;
    if (!/- B3 `test\/outputs\.test\.js:[^`]+`: Tests the three outputs\. Serves requirement 1\. Keep\./i.test(out)) return `a kept block's description is not in the printout: ${out.slice(out.indexOf("## "), out.indexOf("## ") + 0)}${out.slice(-1500)}`;
    const route = /## How it works\n### An archived invoice shows its currency in upper case \(requirement 1\)\n1\. B1 `src\/invoices\/archive\.js:[^`]+`: Converts the code while it reads each row\.\n2\. B3 `test\/outputs\.test\.js:[^`]+`: Checks the three outputs of the conversion\. Gets it from: readArchive's return/.test(out);
    const req = /3\. A requirement that fails\. \(proposed by the author, to confirm; [^)]*\) — TASK-9 “wherever a price is shown”/.test(out);
    return route && req || out.slice(0, 1600);
  });

test("a candidate the reviewer set aside on a place is recorded as its own, so the owner sees it was considered",
  "a smell another model raised could not be told apart: missed, set aside, or recorded where no one looks",
  () => {
    const done = render((r) => { r.challenges.push({ from: "reviewer", point: "The reader finds the display by its CSS class.", outcome: "rejected", at: "src/invoices/archive.js:4", note: "It reads its own rows; no class is involved." }); });
    if (done.status !== 0) return done.stderr;
    return /4\. reviewer's own candidate: The reader finds the display by its CSS class\. Rejected: .*src\/invoices\/archive\.js:4/.test(done.stdout) || done.stdout.slice(done.stdout.indexOf("## Challenges"), done.stdout.indexOf("## Challenges") + 600);
  });

test("carry takes over the previous record's blocks whose lines read the same: a kept one stays kept and is marked carried, one to fix is judged again, and check proves each carried block from the previous record",
  "a follow-up review re-read and re-judged every block, so each turn of the cycle paid a full review, and nothing could show which parts were read again",
  () => {
    // the previous review, beside its saved diff, under previous/; then a fresh scaffold of the same change
    const dir = fs.mkdtempSync(path.join(run, "continuation-")), prev = path.join(dir, "previous");
    fs.mkdirSync(prev);
    fs.writeFileSync(path.join(prev, "source.diff"), generated.stdout);
    for (const name of ["before.png", "after.png"]) fs.copyFileSync(path.join(run, name), path.join(prev, name));
    fs.writeFileSync(path.join(prev, "review.json"), JSON.stringify(REVIEW));
    const target = path.join(dir, "review.json");
    const made = report("scaffold", patch, target);
    if (made.status !== 0) return made.stderr;
    const carried = report("carry", path.join(prev, "review.json"), target);
    if (carried.status !== 0) return carried.stderr;
    const record = JSON.parse(fs.readFileSync(target, "utf8"));
    const kept = record.blocks.filter((b) => b.carried), judge = record.blocks.filter((b) => !b.carried && b.does);
    // the previous requirements come with the blocks, so a carried block serves what it served
    if (JSON.stringify(record.requirements.map((r) => [r.id, r.text])) !== JSON.stringify(REVIEW.requirements.map((r) => [r.id, r.text])) || record.requirements.some((r) => r.met)) return `requirements ${JSON.stringify(record.requirements)}`;
    if (kept.length !== 2 || kept.some((b) => b.verdict !== "keep") || judge.length !== 1 || judge[0].verdict !== "" || judge[0].does !== "Tests it.") return `carried ${JSON.stringify(record.blocks)}`;
    if (!/2 kept blocks carried unchanged/.test(carried.stdout)) return carried.stdout;
    // the structure tied to the blocks comes with them: units as they were, the route whose every step came over
    if (JSON.stringify(record.units.map((u) => [u.name, u.verdict ?? null])) !== JSON.stringify([["readArchive", "keep"], ["rows", null]])
      || JSON.stringify(record.routes?.map((r) => r.steps.map((x) => x.block))) !== "[[1,3]]" || !/1 of 1 routes came with them/.test(carried.stdout))
      return `structure ${JSON.stringify({ units: record.units, routes: record.routes })} ${carried.stdout}`;
    // the reviewer fills the rest: the check accepts the carried blocks it can prove, and refuses one it cannot
    const filled = { ...structuredClone(REVIEW), diff: record.diff, previous: record.previous,
      blocks: record.blocks.map((b) => b.carried ? b : { ...b, verdict: "fix", findings: [1] }) };
    for (const name of ["before.png", "after.png"]) fs.copyFileSync(path.join(run, name), path.join(dir, name));
    fs.writeFileSync(target, JSON.stringify(filled));
    const ok = report("render", target);
    if (ok.status !== 0) return ok.stderr;
    if (!/Carried from the previous review, not read again: B1, B3/.test(ok.stdout)) return ok.stdout.slice(-800);
    const forged = { ...filled, blocks: filled.blocks.map((b, i) => i === 1 ? { ...b, verdict: "keep", carried: true, findings: undefined } : b) };
    fs.writeFileSync(target, JSON.stringify(forged));
    const refused = report("check", target);
    if (refused.status !== 1 || !refused.stderr.includes("block 2 is marked carried, and no block the previous record kept has its lines")) return `a forged carried block passed: ${refused.stderr}`;
    fs.writeFileSync(target, JSON.stringify({ ...filled, previous: { ...filled.previous, sha256: "0".repeat(64) } }));
    const moved = report("check", target);
    if (moved.status !== 1 || !moved.stderr.includes('"previous" cannot be read: the previous record "previous/review.json" is not the one')) return `a changed previous record passed: ${moved.stderr}`;
    // a previous record that is not JSON is a fault of check, never a crash of render
    fs.writeFileSync(path.join(prev, "review.json"), "not json");
    fs.writeFileSync(target, JSON.stringify({ ...filled, blocks: filled.blocks.map(({ carried, ...b }) => b), previous: { ...filled.previous, sha256: createHash("sha256").update("not json").digest("hex") } }));
    const broken = report("render", target);
    return broken.status === 1 && broken.stderr.includes('"previous" cannot be read: the previous record "previous/review.json" is not JSON') || `an unreadable previous record: ${broken.status} ${broken.stderr}`;
  });

test("a reply to a previous comment keeps the place the comment had, needs its words and sources, and the printout lists every reply",
  "a reply placed at a line of this diff by a quote the reviewer chose tells the owner the old comment's code is still there",
  () => {
    const reply = { comment: "Why convert here?", place: "src/invoices/archive.js:4", text: "Because the archive keeps lower case.", sources: [{ at: "src/invoices/archive.js:2", quote: "The archive holds currencies in lower case" }] };
    const listed = render((r) => { r.replies = [reply, { ...reply, comment: "And this?", place: "src/old.js:9" }]; });
    if (listed.status !== 0) return listed.stderr;
    if (!/## Replies to your comments on the previous review\n1\. src\/invoices\/archive\.js:4: «Why convert here\?» — Because the archive keeps lower case\. \(src\/invoices\/archive\.js:2/.test(listed.stdout)) return listed.stdout.slice(listed.stdout.indexOf("## Replies"), listed.stdout.indexOf("## Replies") + 400);
    const thin = render((r) => { r.replies = [{ ...reply, text: " ", sources: [] }]; });
    return thin.status === 1 && thin.stderr.includes('reply 1 has no "text"') && thin.stderr.includes("reply 1 names no source") || `a reply without words or sources passed: ${thin.stderr}`;
  });

test("kept code that serves only requirements to confirm is warned of until a question asks about them, as kept code that serves none is",
  "an error here and a warning for unlinked code made unlinking the cheaper way to hide where a requirement came from",
  () => {
    const asked = render((r) => { r.blocks[0].serves = [3]; });
    const unlinked = render((r) => { r.blocks[0].serves = []; });
    return asked.status === 0 && asked.stderr.includes("warning: requirement 3 is to confirm, and kept code serves only such requirements") && asked.stderr.includes("kept blocks 1 serve only requirements to confirm")
      && unlinked.status === 0 && unlinked.stderr.includes("serve no requirement")
      || `${asked.status} ${asked.stderr} | ${unlinked.status} ${unlinked.stderr}`;
  });

// A continuation in a folder of its own: the previous record and diff under previous/, a scaffold of the new diff.
function continuation(name, prevRecord, prevDiff, nextDiff) {
  const dir = fs.mkdtempSync(path.join(run, `${name}-`)), prev = path.join(dir, "previous");
  fs.mkdirSync(prev);
  fs.writeFileSync(path.join(prev, "source.diff"), prevDiff);
  fs.writeFileSync(path.join(prev, "review.json"), JSON.stringify(prevRecord));
  const input = path.join(dir, "next.diff"), target = path.join(dir, "review.json");
  fs.writeFileSync(input, nextDiff);
  const made = report("scaffold", input, target);
  if (made.status !== 0) throw new Error(made.stderr);
  const carried = report("carry", path.join(prev, "review.json"), target);
  if (carried.status !== 0) throw new Error(carried.stderr);
  return { dir, target, out: carried.stdout, record: JSON.parse(fs.readFileSync(target, "utf8")) };
}
// A two-file change: a.js's total uses b.js's rate. The next revision changes only the rate.
const RATE = (n) => [`diff --git a/src/b.js b/src/b.js`, "new file mode 100644", "--- /dev/null", "+++ b/src/b.js", "@@ -0,0 +1,1 @@", `+export const rate = ${n};`,
  `diff --git a/src/a.js b/src/a.js`, "new file mode 100644", "--- /dev/null", "+++ b/src/a.js", "@@ -0,0 +1,2 @@", `+import { rate } from "./b.js";`, "+export const total = (n) => n * rate;", ""].join("\n");
const sha = (text) => createHash("sha256").update(text).digest("hex");
const twoUnits = (diffText, blocks) => ({ title: "Rates", range: "two commits", language: "en", diff: { file: "source.diff", sha256: sha(diffText) },
  change: { goal: "Totals use a rate.", parts: ["A rate and a total."], sources: ["TASK-2"] }, verdict: "Done.", now: "Now.", target: "Same.", recommendation: "Accept.",
  requirements: [{ id: 1, text: "A total uses the rate.", source: "task", sources: [{ at: "TASK-2", quote: "a total uses the rate" }] }], findings: [],
  units: [{ name: "total", jobs: ["computes a total"], uses: ["rate"], verdict: "keep", reason: "One job." }, { name: "rate", jobs: ["holds the rate"], verdict: "keep", reason: "A constant." }],
  blocks, challenges: [], coverage: "All of it." });

test("a block carried by its own lines is read again when its unit uses a unit that changed, the changed unit is judged again, and check refuses such a block marked carried",
  "a consumer whose producer changed in another file stayed carried and kept, and a changed unit kept its earlier verdict and reason",
  () => {
    const before = RATE(2), after = RATE(3);
    const prev = twoUnits(before, [{ path: "src/b.js", added: "1", unit: "rate", does: "The rate.", serves: [1], verdict: "keep" },
      { path: "src/a.js", added: "1-2", unit: "total", does: "The total, times the rate.", serves: [1], verdict: "keep" }]);
    const c = continuation("dependency", prev, before, after);
    const a = c.record.blocks.find((b) => b.path === "src/a.js"), units = Object.fromEntries(c.record.units.map((u) => [u.name, u.verdict]));
    if (a.carried || a.verdict !== "" || a.does !== "The total, times the rate." || units.total !== "" || units.rate !== "" || !/0 kept blocks carried/.test(c.out))
      return JSON.stringify({ a, units, out: c.out });
    // marked carried by hand anyway, it is refused
    const filled = { ...twoUnits(after, c.record.blocks.map((b) => b.path === "src/a.js" ? { ...b, verdict: "keep", carried: true } : { ...b, does: "The rate, now 3.", serves: [1], unit: "rate", verdict: "keep" })), diff: c.record.diff, previous: c.record.previous };
    fs.writeFileSync(c.target, JSON.stringify(filled));
    const refused = report("check", c.target);
    return refused.status === 1 && refused.stderr.includes("is marked carried, and its unit total changed since the previous review, or uses a unit that did") || `a stale carried block passed: ${refused.stderr}`;
  });

test("carry leaves out a requirement's source that pointed into the previous record, says so, and check refuses the requirement until it is cited again",
  "a carried requirement's /screens/0 named another screen in the new record, and check accepted it",
  () => {
    const before = RATE(2), prev = twoUnits(before, [{ path: "src/b.js", added: "1", unit: "rate", does: "The rate.", serves: [1], verdict: "keep" },
      { path: "src/a.js", added: "1-2", unit: "total", does: "The total.", serves: [1], verdict: "keep" }]);
    prev.requirements.push({ id: 2, text: "The rate matches the mockup.", source: "author", sources: [{ ref: "/blocks/0" }] });
    const c = continuation("sources", prev, before, before);
    const r2 = c.record.requirements.find((r) => r.id === 2);
    if (r2.sources !== undefined || !/Requirements 2 lost sources that pointed into the previous record/.test(c.out)) return JSON.stringify({ r2, out: c.out });
    fs.writeFileSync(c.target, JSON.stringify({ ...twoUnits(before, c.record.blocks), requirements: c.record.requirements, diff: c.record.diff, previous: c.record.previous }));
    const refused = report("check", c.target);
    return refused.status === 1 && refused.stderr.includes("requirement 2 names no source") || `a requirement with its source dropped passed: ${refused.stderr}`;
  });

test("the earlier answers are not offered to a conditional question whose parent's condition changed, though the rest of it reads the same",
  "an answer given while the parent took one variant was offered and marked decided under another",
  () => {
    const dir = fs.mkdtempSync(path.join(run, "condition-")), prev = path.join(dir, "previous");
    fs.mkdirSync(prev);
    for (const d of [dir, prev]) { fs.writeFileSync(path.join(d, "source.diff"), generated.stdout); for (const name of ["before.png", "after.png"]) fs.copyFileSync(path.join(run, name), path.join(d, name)); }
    fs.writeFileSync(path.join(prev, "review.json"), JSON.stringify(THEMED));
    const next = structuredClone(THEMED);
    next.title = "Where the conversion lives, revised";
    next.questions[3].parent = { ...next.questions[3].parent, variants: ["status-quo"] };
    next.previous = { record: "previous/review.json", sha256: sha(JSON.stringify(THEMED)) };
    fs.writeFileSync(path.join(dir, "review.json"), JSON.stringify(next));
    const done = report("render", path.join(dir, "review.json"));
    if (done.status !== 0) return done.stderr;
    const pairs = dataOf(fs.readFileSync(path.join(dir, "review.html"), "utf8")).previous?.pairs.map(([now]) => now) ?? [];
    return pairs.includes("q3") && !pairs.includes("q4") || `offered ${pairs.join(", ")}`;
  });

test("the earlier answers are not offered to a conditional question whose parent's variant changed its meaning under the same id",
  "a child answered under one meaning of the parent's variant was offered and marked decided under another",
  () => {
    const dir = fs.mkdtempSync(path.join(run, "meaning-")), prev = path.join(dir, "previous");
    fs.mkdirSync(prev);
    for (const d of [dir, prev]) { fs.writeFileSync(path.join(d, "source.diff"), generated.stdout); for (const name of ["before.png", "after.png"]) fs.copyFileSync(path.join(run, name), path.join(d, name)); }
    fs.writeFileSync(path.join(prev, "review.json"), JSON.stringify(THEMED));
    const next = structuredClone(THEMED);
    next.title = "Where the conversion lives, revised";
    // the child applies under "extend"; its id stays, what it means does not
    next.questions[2].variants[1] = { ...next.questions[2].variants[1], text: "Move it to a display unit every page shares" };
    next.previous = { record: "previous/review.json", sha256: sha(JSON.stringify(THEMED)) };
    fs.writeFileSync(path.join(dir, "review.json"), JSON.stringify(next));
    const done = report("render", path.join(dir, "review.json"));
    if (done.status !== 0) return done.stderr;
    const pairs = dataOf(fs.readFileSync(path.join(dir, "review.html"), "utf8")).previous?.pairs.map(([now]) => now) ?? [];
    return pairs.includes("q1") && !pairs.includes("q3") && !pairs.includes("q4") || `offered ${pairs.join(", ")}`;
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

test("English and Russian hold the same words, every word the page and the printout ask for is in both, and none is left over",
  "a word one catalog lacks reaches that language's reader as its key; a word nobody asks for is dead text that drifts from the page",
  () => {
    for (const [lang, catalog] of Object.entries(CATALOGS)) {
      if (Object.keys(catalog).sort().join() !== Object.keys(LABELS).sort().join()) return `${lang}: incomplete catalog`;
      for (const [key, value] of Object.entries(catalog))
        if (!value.trim() || ["{n}", "{m}"].some((slot) => LABELS[key].includes(slot) !== value.includes(slot))) return `${lang}: invalid ${key}`;
    }
    // The keys the scripts name outright, on every path: t("…") in the check and the page's title, every key the
    // printout names (it also hands keys to t through a variable), L("…") in the page's runtime and the "p." keys it
    // holds in a variable; a count, P("…"), in every plural form either language has.
    const read = (name) => fs.readFileSync(path.join(SKILL, "scripts", name), "utf8");
    const plurals = [...new Set(["en", "ru"].flatMap((language) => new Intl.PluralRules(language).resolvedOptions().pluralCategories))];
    const scripts = ["review.mjs", "sources.mjs", "page.mjs", "page/document.mjs"].map(read).join("\n"), printout = read("report.mjs"), runtime = read("page/runtime.js");
    const counts = [...new Set([...runtime.matchAll(/"(p\.[\w.-]+)"/g), ...scripts.matchAll(/\bt\.count\("([^"]+)"/g)].map((m) => m[1])
      .filter((key) => !Object.hasOwn(LABELS, key) && Object.hasOwn(LABELS, `${key}.other`)))];
    const named = [...scripts.matchAll(/\bt\("([^"]+)"\s*[,)]/g), ...runtime.matchAll(/\bL\("([^"]+)"/g), ...runtime.matchAll(/"(p\.[\w.-]+)"/g)]
      .map((m) => m[1]).filter((key) => !key.endsWith(".") && !counts.includes(key))
      .concat([...printout.matchAll(/"([\w.-]+)(?=")/g)].map((m) => m[1]).filter((key) => Object.hasOwn(LABELS, key)));
    if (!counts.length) return "the runtime names no count";
    // The keys a template builds, over the list that owns the values it can take: a record need not use them all.
    const families = [["verdict.", [...VERDICTS, ...UNIT_VERDICTS]], ["direction.", DIRECTIONS], ["evidence.", EVIDENCE],
      ["source.", SOURCES], ["challenger.", CHALLENGERS], ["outcome.", OUTCOMES], ["question.kind.", QUESTION_KINDS],
      ["purpose.", PURPOSES], ["purpose.rules.", PURPOSES], ["change.", MECHANISM_CHANGES], ["weight.", BLOCK_KINDS], ["weight.category.", BLOCK_KINDS],
      ["p.req.", REQUIREMENT_STATES], ["p.screen.", PROVENANCES],
      ["coverage.", COVERAGE_KINDS.map((kind) => kind.replace("_", "-"))], ["", SHOTS],
      ...["weight.added.", "weight.removed.", "weight.shared-count.", ...counts.map((key) => `${key}.`)].map((prefix) => [prefix, plurals])];
    const built = families.flatMap(([prefix, values]) => values.map((value) => prefix + value));
    // And the keys a full render reads through the catalogs, the printout's computed ones included.
    const hook = path.join(run, "asked-labels.mjs"), asked = path.join(run, "asked-labels.json");
    fs.writeFileSync(hook, `import fs from "node:fs";
import { CATALOGS } from ${JSON.stringify(pathToFileURL(path.join(SKILL, "scripts", "labels.mjs")).href)};
const asked = new Set();
for (const language of Object.keys(CATALOGS)) CATALOGS[language] = new Proxy(CATALOGS[language], { get: (words, key) => (typeof key === "string" && asked.add(key), words[key]) });
process.on("exit", () => fs.writeFileSync(${JSON.stringify(asked)}, JSON.stringify([...asked])));
`);
    const computed = [];
    for (const language of ["en", "ru"]) {
      const review = structuredClone(THEMED);
      review.language = language;
      review.blocks.forEach((b) => { b.kind = "code"; });
      review.mechanisms = [{ ...MECHANISM, name: "A", blocks: [1, 2] }, { ...MECHANISM, name: "B", blocks: [2] }, { ...MECHANISM, name: "Unknown" }];
      fs.writeFileSync(data, JSON.stringify(review)); fs.rmSync(asked, { force: true });
      const result = spawnSync(process.execPath, ["--import", pathToFileURL(hook).href, SCRIPT, "render", data], { cwd: repo, encoding: "utf8" });
      if (result.status !== 0) return `${language}: ${result.stderr}`;
      // The page hands its whole catalog over as JSON, and JSON.stringify asks every object for toJSON first.
      computed.push(...JSON.parse(fs.readFileSync(asked, "utf8")).filter((key) => !Object.hasOwn(LABELS, key) && key !== "toJSON"));
    }
    const asking = new Set([...named, ...built]);
    const missing = [...new Set([...asking, ...computed])].filter((key) => !Object.hasOwn(LABELS, key) || !Object.hasOwn(CATALOGS.ru, key));
    if (missing.length) return `asked for, but not in both catalogs: ${missing.join(", ")}`;
    const unused = Object.keys(LABELS).filter((key) => !asking.has(key));
    return !unused.length || `in the catalogs, but nothing asks for them: ${unused.join(", ")}`;
  });

test("check accepts the language as one well-formed tag and refuses anything else",
  "the tag reaches the page's lang attribute and picks the catalog: a malformed one is markup or a language nobody reads",
  () => {
    const { diff, record } = hostileFixture(), files = parseDiff(diff);
    for (const language of [undefined, "en", "ru", "ru-RU", "de", "zh-Hant-TW"]) {
      const { errors } = check({ ...structuredClone(record), language }, files, ".");
      if (errors.length) return `${language} was refused: ${errors.join("; ")}`;
    }
    for (const language of ["bad_tag", "ru--RU", 'en"><img', "", " ", null, 5, ["en"]]) {
      const { errors } = check({ ...structuredClone(record), language }, files, ".");
      if (errors.join() !== `"language" is not a language tag: ${JSON.stringify(language)}`) return `${JSON.stringify(language)}: ${errors.join("; ") || "accepted"}`;
    }
    return true;
  });

test("language picks Russian for ru and ru-*, English for any other tag, and a record that carries labels is refused",
  "two catalogs remain, so every tag must reach one of them; words carried in the record would be a third catalog nobody keeps",
  () => {
    for (const [language, words] of [["ru-RU", CATALOGS.ru], ["de", LABELS]]) {
      const result = render((r) => { r.language = language; });
      if (result.status !== 0) return `${language}: ${result.stderr}`;
      const page = fs.readFileSync(html, "utf8");
      if (!page.includes(`<html lang="${language}">`)) return `${language}: the page does not carry the record's language`;
      if (JSON.stringify(dataOf(page).labels) !== JSON.stringify(words)) return `${language}: the page does not carry its catalog`;
      if (!result.stdout.includes(`## ${words.verdict}`)) return `${language}: the printout is not in its catalog's words`;
      if (words === LABELS && /\p{Script=Cyrillic}/u.test(page + result.stdout)) return `${language}: Russian reached an English report`;
    }
    const carried = render((r) => { r.labels = { findings: "Befunde" }; });
    return carried.status === 1 && carried.stderr.includes('"labels" is not a field of the record') || `a record carrying labels was not refused: ${carried.stderr}`;
  });

const MECHANISM = { name: "Normalization <rule>", change: "reused", units: ["readArchive"], purpose: "Consistent display.",
  basis: "Requirement 1; existing conversion.", benefit: "Readable codes.", cost: "No extra state; test the boundary.",
  decision: "Keep the conversion.", evidence: "judgment", findings: [1] };
test("mechanisms keep purpose, cost and decision in both renderings and resolve their references",
  "a mechanism can span units; its cost must not disappear behind a function count or unlinked verdict",
  () => {
    const result = render((r) => { r.mechanisms = [MECHANISM]; });
    if (result.status !== 0) return result.stderr;
    const carried = dataOf(fs.readFileSync(html, "utf8")).mechanisms[0];
    if (!result.stdout.includes("added: 0; reused: 1; changed: 0; removed: 0")) return "mechanism counts differ from the inventory";
    if (!["purpose", "basis", "benefit", "cost", "decision"].every((field) => carried[field] === MECHANISM[field] && result.stdout.includes(MECHANISM[field]))) return "mechanism evidence lost in presentation";
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
    return render((r) => { r.mechanisms = []; }).status === 0 && !dataOf(fs.readFileSync(html, "utf8")).mechanisms.length || "empty inventory is not supported";
  });

test("scenarios render and reference validation survives without a numerical design gate",
  "a structural tradeoff may improve readability with more edit locations, and a simple review may need no scenario",
  () => {
    const DESIGN = { id: 3, title: "A rule cannot change alone", direction: "design", evidence: "judgment", at: "src/invoices/archive.js:2",
      what: "The format and the conversion share one loop.", shown_by: "Scenario 1.", fix: "Name the conversion; scenario 1 stays in two places without it.", scenarios: [1] };
    const good = render((r) => { r.findings.push(DESIGN); });
    if (good.status !== 0) return good.stderr;
    const island = dataOf(fs.readFileSync(html, "utf8"));
    if (island.scenarios[0]?.change !== "Another <code> format is read." || island.findings.find((f) => f.id === "3")?.scenarios.join() !== "1") return "the scenario or the finding naming it is not carried";
    if (island.units[0].reason !== "One job, read whole at a glance." || !good.stdout.includes("Reason: One job, read whole at a glance.")) return "a kept unit's reason is lost in presentation";
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
    if (weightOverview(weight, en, languageOf({ language: "ar" }))[0].text !== "2 lines added") return "a language without a catalog does not count by the English plural rules";
    weight.exclusive.code = counts(44);
    return weightOverview(weight, en, "en")[0].text === "44 lines added" || "bad English plural";
  });

test("weight is rendered in HTML and text without changing the review record",
  "a mechanism without line attribution and shared block evidence must be visible in both outputs",
  () => {
    const result = render(r => {
      r.blocks.forEach(b => { b.kind = "code"; });
      r.mechanisms = [{ ...MECHANISM, name: "A", blocks: [1] }, { ...MECHANISM, name: "B", blocks: [1] }, { ...MECHANISM, name: "Unknown" }];
    });
    if (result.status !== 0) return result.stderr;
    const island = dataOf(fs.readFileSync(html, "utf8")), raw = JSON.parse(fs.readFileSync(data, "utf8"));
    // A mechanism nobody weighed carries no weight; the printout, read back by the reviewer, leaves it out.
    if (island.mechanisms[2].weight || result.stdout.includes("Not assessed")) return "an unweighed mechanism carries a weight or is printed";
    // Weighed together, a block two mechanisms share counts once: the lines a decision on both would touch.
    const together = "Weighed mechanisms together, each block counted once (A, B): Code: 2 lines added, 1 line removed";
    if (!result.stdout.includes(together) || island.together?.names.join() !== "A,B" || !together.endsWith(island.together.rows.map((row) => `${row.kind}: ${row.text}`).join())) return `no combined weight:\n${result.stdout.split("## Mechanisms")[1]?.slice(0, 400)}`;
    return island.mechanisms[0].weight.shared.length === 1 && result.stdout.includes("Shared with")
      && result.stdout.includes("Touched in this change") && raw.mechanisms.every(m => m.weight === undefined) || "the shared block or the weight is missing, or derived totals persisted";
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
      [(r) => { delete r.requirements[0].source; }, "requirement 1: source is one of task, discussion, project, author, contract, assumption, question"],
      [(r) => { delete r.requirements[0].sources; }, "requirement 1 names no source: an analytical claim needs one"],
      [(r) => { r.requirements[0].sources = [{ at: "TASK-9" }]; }, "requirement 1 is task: quote where it is stated, as {at, quote}, or cite the screen it comes from"],
      [(r) => { r.questions = [{ at: "a.js:1", text: "Which?", kind: "decision", variants: [{ id: "a", text: "A", consequences: [{ text: "x", sources: [{ ref: "/requirements/0" }] }] }, { id: "b", text: "B", consequences: [{ text: "y", sources: [{ ref: "/requirements/0" }] }] }] }]; },
        "question 1 is a decision with no recommendation: name the variant you recommend"],
      [(r) => { r.questions = [{ at: "a.js:1", text: "Which?", kind: "decision", variants: [{ id: "a", text: "A", consequences: [{ text: "x", sources: [{ ref: "/requirements/0" }] }] }, { id: "b", text: "B", consequences: [{ text: "y", sources: [{ ref: "/requirements/0" }] }] }],
        recommendation: { text: "Probably A.", sources: [{ ref: "/requirements/0" }] } }]; }, "question 1 recommendation names no variant: name the one you recommend, or open its text with «No clear recommendation»"],
      [(r) => { r.ideas[0].sources = [{ ref: "/ideas/0" }]; }, 'idea 1: source ref "/ideas/0" is the entry that makes the claim'],
      [(r) => { delete r.blocks[0].does; }, 'block 1 has no "does": say what it does and why it is there'],
      [(r) => { r.challenges.push({ from: "reviewer", point: "The guard looks like a hack.", outcome: "owner", note: "Unsure." }); }, "challenge 4 is the reviewer's own candidate: record it only when you set it aside on a place, as rejected"],
      [(r) => { r.routes[0].steps = [r.routes[0].steps[0]]; }, "route 1 has fewer than two steps"],
      [(r) => { delete r.routes[0].steps[1].via; }, 'route 1 step 2 has no "via": how it gets what step 1 produced'],
      [(r) => { r.routes[0].steps[0].block = 9; }, "route 1 step 1 names block 9, which is not listed"],
      [(r) => { r.routes[0].requirements = [7]; }, "route 1 names requirement 7, which is not listed"],
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
    // Every block, kept or not, says what it does and why it is there.
    const filled = { ...structuredClone(REVIEW), diff: record.diff, units: [], scenarios: undefined, findings: [], steps: [], checks: undefined, screens: undefined, ideas: undefined, routes: undefined,
      requirements: [{ id: 1, text: "A requirement.", source: "task", sources: [{ at: "TASK-1", quote: "a requirement" }] }], blocks: record.blocks.map((b) => ({ ...b, does: "A part of the change, for no stated reason.", verdict: "keep" })) };
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
    const undiffed = { ...structuredClone(REVIEW) };
    delete undiffed.diff;
    fs.writeFileSync(target, JSON.stringify(undiffed));
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
    const done = render((r) => { r.blocks[2] = { ...r.blocks[2], verdict: "question", questions: [1], unit: "readArchive" }; r.blocks[0].serves = [3];
      r.questions[0].context = [{ text: "The reader converts on an assumed reading.", sources: [{ ref: "/requirements/2" }] }]; });
    if (done.status !== 0) return done.stderr;
    // a question asks about R3, which the block serves: the owner is asked, so nothing is warned of
    if (done.stderr.includes("serve only requirements to confirm")) return `a block kept for a requirement a question asks about was still warned of: ${done.stderr}`;
    if (!done.stderr.includes("unit readArchive is kept, and its blocks 3 are not")) return `no warning about a kept unit with an open block: ${done.stderr}`;
    const island = dataOf(fs.readFileSync(html, "utf8"));
    if (island.challenges.length !== 3 || island.blocks[2].questions.join() !== "1") return "the page carries no challenges or no link from the block to its question";
    return /## Challenges\n1\. critic: The reader should not convert\. Rejected: .*src\/main\.js:4/.test(done.stdout) && done.stdout.includes("Question (Q1)") || `the printout lacks the challenges or the question:\n${done.stdout}`;
  });

test("the page that tells a reviewer what to write names every word the check accepts, and its example parses",
  "the vocabulary lives in the check; a page that teaches another word sends the reviewer into a refusal",
  () => {
    const page = fs.readFileSync(path.join(SKILL, "references", "report-data.md"), "utf8");
    const absent = [...VERDICTS, ...UNIT_VERDICTS, ...DIRECTIONS, ...EVIDENCE, ...SOURCES, ...CHALLENGERS, ...OUTCOMES, ...QUESTION_KINDS, ...COVERAGE_KINDS].filter((word) => !page.includes(`\`${word}\``));
    if (absent.length) return `report-data.md does not name ${absent.join(", ")}`;
    const example = /\n {4}\{\n[\s\S]*?\n {4}\}\n/.exec(page);
    // The example carries the optional fields of the decision cards too; the minimal REVIEW renders without them.
    try { return Object.keys(JSON.parse(example[0])).sort().join(" ") === [...Object.keys(REVIEW), "language", "mechanisms", "tradeoffs", "coverageStructured", "passport", "previous", "replies"].sort().join(" ") || "the example's fields differ from the fields this suite renders"; }
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
    // An external source is a place in the repository or a file beside the record; with its quote it travels, and no warning names it.
    if (themed.warnings.some((w) => w.includes("source"))) return `a quoted source was warned of: ${themed.warnings}`;
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
      // A claim cannot cite the entry that makes it: that says where the claim stands, not what shows it.
      [(r) => { r.questions[2].variants[0].consequences[0].sources = [{ ref: "/questions/2" }]; }, 'source ref "/questions/2" is the entry that makes the claim'],
      [(r) => { r.questions[2].recommendation.sources.push({ ref: "/questions/2" }); }, 'source ref "/questions/2" is the entry that makes the claim'],
      [(r) => { r.screens[1].sources = [{ ref: "/screens/1" }]; }, 'source ref "/screens/1" is the entry that makes the claim'],
      [(r) => { r.questions[2].context[0].sources = [{ ref: "/questions/02" }]; }, 'source ref "/questions/02" is the entry that makes the claim'],
      // Variants that combine: only on a decision, only true, and a recommendation of several only there.
      [(r) => { r.questions[0].multiple = true; }, "multiple is only for a decision whose variants combine"],
      [(r) => { r.questions[2].multiple = "yes"; }, "multiple is only for a decision whose variants combine"],
      [(r) => { r.questions[2].recommendation.variants = ["extend"]; }, "variants is for a decision whose variants combine"],
      [(r) => { r.questions[2].multiple = true; delete r.questions[2].recommendation.variant; r.questions[2].recommendation.variants = ["absent"]; }, 'names variant "absent", which is not listed'],
      [(r) => { r.questions[2].multiple = true; delete r.questions[2].recommendation.variant; r.questions[2].recommendation.variants = []; }, "variants lists the variant ids it recommends"],
      [(r) => { r.questions[2].multiple = true; r.questions[2].recommendation.variants = ["extend"]; }, 'names one in "variant" and several in "variants"'],
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

test("a decision is refused with fewer than two variants or a variant without consequences; other kinds keep the warning",
  "a choice of one is no choice, and a variant without what it brings cannot be weighed; the owner answers with a variant or in their own words",
  () => {
    const files = parseThemeDiff();
    const faults = [
      [(r) => { delete r.questions[2].variants; }, "question 3 is a decision with no variants: give at least two, each with its consequences"],
      [(r) => { r.questions[2].variants = []; }, "question 3 is a decision with no variants"],
      [(r) => { r.questions[3].variants.pop(); }, "question 4 is a decision with one variant"],
      [(r) => { delete r.questions[2].variants[1].consequences; }, "question 3 variant extend lists no consequences"],
      [(r) => { r.questions[2].variants[0].consequences = []; }, "question 3 variant status-quo lists no consequences"],
    ];
    for (const [change, fault] of faults) {
      const r = structuredClone(THEMED); change(r);
      const { errors } = check(r, files, run);
      if (!errors.some((e) => e.includes(fault))) return `expected "${fault}", got: ${errors.join("; ") || "no errors"}`;
    }
    const fact = structuredClone(THEMED);
    fact.questions[1].variants = [{ id: "one", text: "One answer" }];
    const { errors, warnings } = check(fact, files, run);
    return !errors.length && warnings.some((w) => w.includes("question 2 variant one lists no consequences"))
      || `a fact with a variant without consequences: errors ${errors.join("; ")}; warnings ${warnings.join("; ")}`;
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
    // Defense in depth: even a record that never passed the check reaches the page as data, never as markup.
    const { owner } = check(THEMED, files, run);
    const html = page(r, files, modelOf(r, files, owner, run));
    if (html.includes(hostile) || dataOf(html).findings[0].id !== hostile) return "the hostile id reached the page outside its data";
    return true;
  });

test("modelOf derives children, unique counters and file status",
  "stored children drift from parents, summed counters double-count, and a fixed short path guesses the package root",
  () => {
    const model = modelOfThemed();
    if (model.questions[2].children.join() !== "4" || model.questions[3].children.length) return "children are not derived from parent alone";
    // One block names both evidence questions: each question counts it once, as its own related code shows.
    if (model.counters.decisions !== 2 || model.counters.blocks !== 3) return "decision or block counters differ";
    const byPath = Object.fromEntries(model.files.map((f) => [f.path, f]));
    if (byPath["src/invoices/archive.js"].status !== "M" || byPath["test/archive.test.js"].status !== "A" || byPath["test/outputs.test.js"].status !== "A") return "file status is not taken from the diff headers";
    if (model.counters.addedFiles !== 2 || model.counters.removedFiles !== 0 || model.counters.modifiedFiles !== 1) return "file counters differ from the statuses";
    // A deleted file keeps its status; the source of a claim resolves to the item it names.
    const deleted = parseDiff("diff --git a/gone.js b/gone.js\n--- a/gone.js\n+++ /dev/null\n@@ -1 +0,0 @@\n-old\n");
    if (deleted[0].status !== "D") return "a deleted file is not marked D";
    if (sourceOf({ ref: "/requirements/3" }, THEMED).text !== "R4") return "an internal source does not resolve to its requirement id";
    if (sourceOf({ ref: "/questions/0" }, THEMED).text !== "Q1") return "an internal source does not resolve to its question number";
    if (!sourceOf({ at: "a.js:1", revision: "abc", quote: "x" }, THEMED).text.includes("@ abc")) return "an external source loses its revision";
    return true;
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
    // The minimal record's printout has no card machinery, no passport, no invented sections.
    const minimal = render();
    if (minimal.status !== 0) return minimal.stderr;
    for (const absent of ["## Accepted tradeoffs", "Passport:", "(decision", "Ran:"])
      if (minimal.stdout.includes(absent)) return `the minimal printout grew "${absent}"`;
    if (!minimal.stdout.includes("- Q1 `docs/billing.md`: A question.")) return "the minimal record's question line changed";
    return minimal.stdout.includes(`record ${createHash("sha256").update(fs.readFileSync(data)).digest("hex")}`) || "the minimal printout lacks the digest";
  });

test("a mechanism's findings stand as related findings, never as an invented consequence; historical screens carry their sources in the printout",
  "the first finding's text presented as the mechanism's consequence is analysis outside the record; the printout dropped the screen's sources",
  () => {
    const result = render((r) => { Object.assign(r, structuredClone(THEMED)); r.mechanisms = [{ ...MECHANISM, findings: [1, 2] }]; });
    if (result.status !== 0) return result.stderr;
    if (dataOf(fs.readFileSync(html, "utf8")).mechanisms[0].findings.join() !== "1,2") return "the related findings are not carried as ids";
    const md = result.stdout.split("## Mechanisms")[1].split("## Structure")[0];
    if (!md.includes("Findings: 1, 2") || md.includes("What happens.") || md.includes("Why change it")) return "the printout lacks the neutral related findings or invents a consequence";
    if (!result.stdout.includes("(coverageStructured 2)")) return "the historical screen's sources are missing from the printout";
    return true;
  });

test("the passport's digest words are localized in the printout",
  "hardcoded English words in the details line stood untranslated in a Russian report",
  () => {
    const result = render((r) => { Object.assign(r, structuredClone(THEMED)); r.language = "ru"; });
    if (result.status !== 0) return result.stderr;
    const digest = createHash("sha256").update(fs.readFileSync(data)).digest("hex");
    if (!result.stdout.includes(`sha256 diff ${THEMED.diff.sha256}`) || !result.stdout.includes(`запись ${digest}`)) return "the printout's digest words are not localized";
    return true;
  });

test("purpose is the model's deterministic classification, and the page carries its counters",
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
    const island = dataOf(fs.readFileSync(html, "utf8"));
    if (JSON.stringify(island.purposeCounts) !== JSON.stringify(model.purpose.counts) || island.purposes.join() !== PURPOSES.join()) return "the page's purpose counters are not the model's";
    if (island.blocks.some((b) => b.purpose !== model.purpose.block[b.id])) return "a block's purpose on the page is not the model's";
    // The classification is derived, never written into the record.
    return !fs.readFileSync(data, "utf8").includes('"purpose"') || "the render persisted a derived field into the record";
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
      if (!/^<span class="t\d+">/.test(html) || html.includes("style=")) return "the added line is not drawn with token classes";
      // The comment that began on the context line keeps its comment class on the added line: the sequence was tokenized whole.
      const classOf = (h) => h.match(/class="(t\d+)"/)?.[1];
      const ctxClass = classOf(first.line(files[0].hunks[0][0], "a.ts"));
      if (!ctxClass || classOf(html) !== ctxClass) return "the multi-line comment lost its coloring across lines";
      // The old side is del+ctx together: the removed line inside the comment carries the comment's class, which
      // holds both themes' colors, not the plain code color.
      const delHtml = first.line(files[0].hunks[1][1], "a.ts"), openHtml = first.line(files[0].hunks[1][0], "a.ts");
      if (!classOf(delHtml) || classOf(delHtml) !== classOf(openHtml)) return `the removed line inside a comment lost the comment color: del ${classOf(delHtml)}, ctx ${classOf(openHtml)}`;
      // Every class has a light rule and a dark one for each way the dark theme is chosen.
      for (const name of new Set([...first.css.matchAll(/\.(t\d+)\{/g)].map((m) => m[1])))
        if (!first.css.includes(`:root[data-theme="dark"] .${name}{`) || !first.css.includes(`:root:not([data-theme="light"]) .${name}{`)) return `the class ${name} has no dark rule`;
      if (delHtml.includes("const") || !delHtml.includes("inside comment")) return "the removed line's text is wrong";
      // State does not cross the gap between non-adjacent hunks, on either side.
      if (first.line(files[2].hunks[1][0], "c.ts") !== first.line(files[3].hunks[0][0], "d.ts")) return "the new side carried an open template across the gap between hunks";
      if (first.line(files[4].hunks[1][0], "e.ts") !== first.line(files[5].hunks[0][0], "f.ts")) return "the old side carried an open comment across the gap between hunks";
      if (first.line(addLine, "a.ts") !== second.line(addLine, "a.ts")) return "two renders differ";
      if (first.line(files[0].hunks[0][3], "a.ts") !== "") return "a blank line is not empty";
      if (first.line(files[1].hunks[0][0], "b.bin") !== "&lt;x&gt; &amp; &quot;y&quot;") return "an unsupported language is not escaped plain";
      // The pattern fallback still draws code when no syntax is given, and page() uses it.
      if (!highlight("const x = 1;", "a.js").includes('class="t-k"')) return "the pattern fallback broke";
      const model = modelOfThemed(), patternPage = page(THEMED, parseThemeDiff(), model);
      if (!patternPage.includes('class="t-k"') || /class="t\d+"/.test(patternPage)) return "page() without a syntax did not fall back";
      return true;
    })();
  });


process.exit(summarize(await runCases(TESTS), TESTS.length));
