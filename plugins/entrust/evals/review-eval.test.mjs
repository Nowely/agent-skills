#!/usr/bin/env node
// Is the review skill's measuring instrument sound? Reads evals/review/: the cases, prepare.mjs, round.mjs,
// score.mjs, implement.mjs and outcome.mjs. It calls no model and judges no review; it checks that each case's
// clean solution meets the brief and its first-written one fails exactly what the rubric says, that a prepared
// run hands the reviewer the change and nothing of the answer, that the score table counts what the verdicts
// say, and that the outcome of acting on a review is measured on the code that is left. Run it after an
// edit to anything under evals/review/.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { EVALS, registry, runCases, summarize, tempDir } from "./lib/harness.mjs";
import { CASES, VARIANTS, prepare } from "./review/prepare.mjs";
import { round } from "./review/round.mjs";
import { rubricOf, score, table } from "./review/score.mjs";
import { TASK_ONLY, implement } from "./review/implement.mjs";
import { outcome, table as outcomeTable } from "./review/outcome.mjs";

const { cases: TESTS, test } = registry();
const names = fs.readdirSync(CASES).sort();
const files = (dir, at = "") => fs.readdirSync(path.join(dir, at), { withFileTypes: true })
  .flatMap((e) => e.isDirectory() ? files(dir, path.join(at, e.name)) : [path.join(at, e.name)]).sort();
const checksOf = async (name) => (await import(pathToFileURL(path.join(CASES, name, "accept.mjs")).href)).default;

test("every case has a brief, three trees, checks and a rubric a judge can rule on",
  "an item without an id, a kind or its ruling text cannot be judged, and a variant without a trap rewards flagging everything",
  async () => {
    for (const name of names) {
      for (const part of ["brief.md", "base", "head", "clean", "accept.mjs", "rubric.json"])
        if (!fs.existsSync(path.join(CASES, name, part))) return `${name} has no ${part}`;
      const rubric = rubricOf(name);
      for (const variant of VARIANTS) {
        const { items } = rubric[variant];
        if (new Set(items.map((i) => i.id)).size !== items.length) return `${name}/${variant}: duplicate rubric id`;
        for (const item of items)
          if (!item.id || !item.title || !(item.kind === "find" ? item.hit : item.kind === "trap" && item.violated))
            return `${name}/${variant} ${item.id}: kind, title or ruling text is missing`;
        if (!items.some((i) => i.kind === "trap")) return `${name}/${variant}: no trap`;
      }
      if (!rubric.head.items.some((i) => i.kind === "find")) return `${name}: nothing to find in head`;
      if (rubric.clean.items.some((i) => i.kind === "find")) return `${name}: the clean variant has a find, so it is not clean`;
      const known = (await checksOf(name)).map((c) => c.name);
      const stray = rubric.head.fails.filter((f) => !known.includes(f));
      if (stray.length) return `${name}: rubric names a check accept.mjs lacks: ${stray[0]}`;
      const probes = rubric.probes ?? [];
      if (probes.some((p) => !p.id || !p.change) || new Set(probes.map((p) => p.id)).size !== probes.length) return `${name}: a probe lacks its id or its change, or an id repeats`;
    }
    return names.length > 0 || "no cases";
  });

test("the clean solution meets the brief and the first-written one fails exactly what its rubric lists",
  "a rubric that calls working code a defect, or a clean tree that breaks a requirement, grades reviewers against a falsehood",
  async () => {
    for (const name of names) {
      for (const variant of VARIANTS) {
        const failed = [], say = console.error;
        console.error = () => {}; // a first-written solution may log the failures it swallows
        for (const check of await checksOf(name)) {
          try { await check.run((file) => import(pathToFileURL(path.join(CASES, name, variant, file)).href)); }
          catch { failed.push(check.name); }
        }
        console.error = say;
        const expected = variant === "head" ? rubricOf(name).head.fails : [];
        if (failed.sort().join("\n") !== [...expected].sort().join("\n")) return `${name}/${variant} fails [${failed.join("; ")}]`;
      }
    }
    return true;
  });

test("a prepared run holds one variant as one commit and nothing of the answer",
  "a reviewer who can open the rubric, the checks or the other variant is graded on reading them",
  () => {
    for (const name of names) {
      for (const variant of VARIANTS) {
        const control = prepare(name, variant), arm = prepare(name, variant, path.join(CASES, name, "brief.md"));
        const git = (...args) => execFileSync("git", args, { cwd: path.join(arm.run, "repo"), encoding: "utf8" }).trim();
        if (git("rev-list", "--count", "HEAD") !== "2") return `${name}/${variant}: expected two commits`;
        if (git("status", "--porcelain") !== "") return `${name}/${variant}: the working tree differs from HEAD`;
        const tree = files(path.join(CASES, name, variant)).map((f) => f.split(path.sep).join("/")).join("\n");
        if (git("ls-files").split("\n").sort().join("\n") !== tree) return `${name}/${variant}: HEAD is not the ${variant} tree`;
        if (git("diff", "--name-only", "HEAD~1", "HEAD") === "") return `${name}/${variant}: the two commits do not differ`;
        const beside = fs.readdirSync(arm.run).sort().join(" ");
        if (beside !== "brief.md instructions.md repo") return `${name}/${variant}: the run directory holds ${beside}`;
        if (fs.existsSync(path.join(control.run, "instructions.md"))) return `${name}/${variant}: the control arm got instructions`;
        const extra = arm.prompt.replaceAll(arm.run, "RUN").split("\n")
          .filter((l) => !control.prompt.replaceAll(control.run, "RUN").split("\n").includes(l));
        if (extra.length !== 1 || !extra[0].includes("instructions.md")) return `${name}/${variant}: the arms' prompts differ by more than the instructions line`;
      }
      if (prepare(name, "head").prompt.replace(/review-run-\w+/g, "") !== prepare(name, "clean").prompt.replace(/review-run-\w+/g, ""))
        return `${name}: the prompt tells the variants apart`;
    }
    return true;
  });

test("a round prepares every case, variant and arm once per repetition and records which run is which",
  "the manifest is the only place a run id is tied to its arm",
  () => {
    const dir = tempDir("review-round-"), instructions = path.join(CASES, names[0], "brief.md");
    round(dir, ["control", `draft=${instructions}`]);
    const { runs } = round(dir, ["control", `draft=${instructions}`]);
    const cells = runs.map((r) => `${r.case} ${r.variant} ${r.arm}`);
    const twice = [...new Set(cells)].every((cell) => cells.filter((c) => c === cell).length === 2);
    return runs.length === names.length * VARIANTS.length * 2 * 2 && twice && new Set(runs.map((r) => r.run)).size === runs.length
      && runs.every((r) => fs.existsSync(path.join(dir, "prompts", `${r.run}.txt`)) && (r.arm === "control") === (r.instructions === null))
      && fs.existsSync(path.join(dir, "returns")) && round(tempDir("review-round-"), ["control"], [names[0]]).runs.every((r) => r.case === names[0])
      || `unexpected manifest: ${JSON.stringify(runs.slice(0, 3))}`;
  });

const all = (name, variant, find, trap) => Object.fromEntries(rubricOf(name)[variant].items.map((i) => [i.id, i.kind === "find" ? find : trap]));

test("the score table counts hits, partials, trap violations and unsupported claims, per arm and variant",
  "the table is the number a results page quotes",
  () => {
    const [name] = names, { items } = rubricOf(name).head, finds = items.filter((i) => i.kind === "find").length;
    const runs = [{ run: "a", case: name, variant: "head", arm: "one" }, { run: "b", case: name, variant: "head", arm: "two" },
      { run: "c", case: name, variant: "clean", arm: "one" }];
    const extra = [{ claim: "c", verdict: "unsupported", why: "w" }];
    const rows = score(runs, [{ run: "a", items: all(name, "head", "hit", "clean"), extra },
      { run: "b", items: all(name, "head", "partial", "violated") }, { run: "c", items: all(name, "clean", "hit", "clean"), extra }], () => 10);
    const text = table(rows);
    return text.includes(`| one | all head | 1 | ${finds} / 0 / 0 | 1.00 | 0 | 0 | 1 | 10 |`)
      && text.includes(`| two | all head | 1 | 0 / ${finds} / 0 | 0.50 | ${items.length - finds} | 0 | 0 | 10 |`)
      && text.includes("| one | all clean | 1 | – | – | 0 | 0 | 1 | 10 |") || `unexpected table:\n${text}`;
  });

test("a verdict that skips a rubric item, invents one or rules in other words stops the score",
  "a table over a partly judged run reads as a measurement",
  () => {
    const [name] = names, runs = [{ run: "a", case: name, variant: "head", arm: "one" }];
    const whole = all(name, "head", "hit", "clean"), [first] = Object.keys(whole);
    const refuses = (verdicts) => { try { score(runs, verdicts); return false; } catch { return true; } };
    const { [first]: dropped, ...missing } = whole;
    return refuses([{ run: "a", items: missing }]) && refuses([{ run: "a", items: { ...whole, Z9: "hit" } }])
      && refuses([{ run: "a", items: { ...whole, [first]: "found" } }]) && refuses([])
      && refuses([{ run: "a", items: all(name, "clean", "hit", "clean") }])
      && refuses([{ run: "a", items: whole }, { run: "ghost", items: whole }]) || "an incomplete verdict was scored";
  });

// A round of one case with probes, two arms, every review saved: what implement.mjs and outcome.mjs start from.
const probed = names.find((name) => rubricOf(name).probes?.length);
function reviewedRound() {
  const dir = tempDir("review-outcome-");
  const runs = VARIANTS.flatMap((variant) => ["control", "draft"].map((arm) => ({ case: probed, variant, arm })))
    .map((cell, index) => ({ run: `r0${index + 1}`, ...cell, review: `returns/r0${index + 1}.md` }));
  fs.mkdirSync(path.join(dir, "returns"));
  fs.writeFileSync(path.join(dir, "runs.json"), JSON.stringify(runs));
  for (const run of runs) fs.writeFileSync(path.join(dir, run.review), `The review of ${run.run}.`);
  return dir;
}

test("every review gets an implementer, every target one that saw no review, and a case with probes its two anchors",
  "without the unaided implementer nobody knows what the review added; without the anchors nobody knows whether the judge of the outcome can see the difference it is asked about",
  () => {
    const dir = reviewedRound(), manifest = implement(dir), of = (filter) => manifest.filter(filter);
    if (manifest.length !== 8 || of((m) => m.review).length !== 4 || of((m) => m.arm === TASK_ONLY).length !== 2 || of((m) => m.anchor).map((m) => m.variant).sort().join() !== "clean,head")
      return `unexpected manifest: ${JSON.stringify(manifest)}`;
    const prompt = (m) => fs.readFileSync(path.join(dir, "implement", `${m.id}.txt`), "utf8").replaceAll(path.join(dir, "work", m.id), "RUN").split("\n");
    const [reviewed] = of((m) => m.review), [alone] = of((m) => m.arm === TASK_ONLY);
    const extra = prompt(reviewed).filter((line) => !prompt(alone).includes(line));
    if (extra.length !== 1 || !extra[0].includes("review.md")) return "the prompts with and without a review differ by more than the review's line";
    if (of((m) => m.anchor).some((m) => fs.existsSync(path.join(dir, "implement", `${m.id}.txt`)))) return "an anchor was given a prompt";
    const beside = (m) => fs.readdirSync(path.join(dir, "work", m.id)).sort().join(" ");
    return beside(reviewed) === "brief.md repo review.md" && beside(alone) === "brief.md repo"
      && fs.readFileSync(path.join(dir, "work", reviewed.id, "review.md"), "utf8").startsWith("The review of") || "a work directory holds something other than the repository, the task and the review";
  });

test("the outcome is read off the code that is left: the checks it passes, what was changed, its own tests, and the probes a judge ruled on",
  "a review is for the code that comes after it; a table of what reviews said cannot show whether acting on one gives a simpler correct solution",
  () => {
    const dir = reviewedRound(), manifest = implement(dir), rubric = rubricOf(probed), ids = rubric.probes.map((p) => p.id);
    // One implementer turns the first-written form into the clean one; the others change nothing.
    const [fixed] = manifest.filter((m) => m.variant === "head" && m.review), repo = path.join(dir, "work", fixed.id, "repo");
    for (const entry of fs.readdirSync(repo)) if (entry !== ".git") fs.rmSync(path.join(repo, entry), { recursive: true });
    fs.cpSync(path.join(CASES, probed, "clean"), repo, { recursive: true });
    const ruled = (m, ruling) => ({ id: m.id, probes: Object.fromEntries(ids.map((id) => [id, ruling])) });
    const verdicts = (anchorHead) => manifest.filter((m) => m.variant === "head" || m.anchor)
      .map((m) => ruled(m, m === fixed || (m.anchor && m.variant === "clean") ? "local" : m.anchor ? anchorHead : "tangled"));
    fs.writeFileSync(path.join(dir, "outcome-verdicts.json"), JSON.stringify(verdicts("tangled")));
    const { results, disputed } = outcome(dir), by = (id) => results.find((r) => r.id === id);
    const [left] = manifest.filter((m) => m.variant === "head" && m.review && m !== fixed), [kept] = manifest.filter((m) => m.variant === "clean" && m.review);
    if (disputed.length || results.length !== 6) return `unexpected results: ${results.length}, disputed ${disputed}`;
    if (by(fixed.id).state !== "recovered" || by(fixed.id).changed.code === 0 || by(fixed.id).changed.tests === 0 || by(fixed.id).size !== by(fixed.id).reference || by(fixed.id).tests.status !== "passed")
      return "the implementation that became the clean form is not recovered at the clean form's size, with code and tests changed and its tests passing";
    if (by(left.id).state !== "not recovered" || by(left.id).failed.sort().join() !== [...rubric.head.fails].sort().join() || by(left.id).changed.code !== 0) return "the untouched first-written form is not shown failing what its rubric lists";
    if (by(kept.id).state !== "kept" || by(kept.id).changed.code !== 0 || by(kept.id).probes !== null) return "the untouched clean form is not shown as kept";
    if (!fs.readFileSync(path.join(dir, "patches", `${fixed.id}.patch`), "utf8").includes("+++ b/")) return "what the implementer changed was not saved";
    const text = outcomeTable(results);
    return text.includes(`| ${fixed.arm} | ${probed}/head | 1 | 1 recovered | ${by(fixed.id).checks} / ${by(fixed.id).checks} | ${ids.length} / ${ids.length} | 1 passed | 1.00 |`) || `unexpected table:\n${text}`;
  });

test("a result whose probes nobody ruled on, or whose judge is disputed, is not counted as recovered",
  "a missing verdict file once made every implementation that passed the checks a recovery: the design half of the result was assumed",
  () => {
    const dir = reviewedRound(), manifest = implement(dir), ids = rubricOf(probed).probes.map((p) => p.id);
    const [fixed] = manifest.filter((m) => m.variant === "head" && m.review), repo = path.join(dir, "work", fixed.id, "repo");
    for (const entry of fs.readdirSync(repo)) if (entry !== ".git") fs.rmSync(path.join(repo, entry), { recursive: true });
    fs.cpSync(path.join(CASES, probed, "clean"), repo, { recursive: true });
    const state = () => outcome(dir).results.find((r) => r.id === fixed.id);
    const unruled = state();
    if (unruled.state !== "not assessed" || unruled.failed.length || unruled.probes !== null) return `with no verdicts the passing result is "${unruled.state}"`;
    // A judge who rules the first-written form as local as the clean one: the case is disputed, and its rulings stay in the record.
    fs.writeFileSync(path.join(dir, "outcome-verdicts.json"), JSON.stringify(manifest.filter((m) => m.variant === "head" || m.anchor)
      .map((m) => ({ id: m.id, probes: Object.fromEntries(ids.map((id) => [id, "local"])) }))));
    const again = outcome(dir), disputedOne = again.results.find((r) => r.id === fixed.id);
    if (again.disputed.join() !== probed || disputedOne.state !== "disputed" || disputedOne.probes?.local !== ids.length) return `with the anchors not told apart the result is "${disputedOne.state}"`;
    const text = outcomeTable(again.results);
    if (!text.includes(`| ${fixed.arm} | ${probed}/head | 1 | 1 disputed | `) || text.includes("recovered |") && !text.includes("not recovered")) return `the table counts a disputed result:\n${text}`;
    // A case without probes can pass its checks and nothing more is known of it.
    const bare = names.find((name) => !rubricOf(name).probes?.length), other = tempDir("review-outcome-");
    fs.mkdirSync(path.join(other, "returns"));
    fs.writeFileSync(path.join(other, "runs.json"), JSON.stringify([{ run: "r01", case: bare, variant: "clean", arm: "control", review: "returns/r01.md" }, { run: "r02", case: bare, variant: "head", arm: "control", review: "returns/r02.md" }]));
    for (const run of ["r01", "r02"]) fs.writeFileSync(path.join(other, "returns", `${run}.md`), "A review.");
    const [onHead] = implement(other).filter((m) => m.variant === "head" && m.review), tree = path.join(other, "work", onHead.id, "repo");
    for (const entry of fs.readdirSync(tree)) if (entry !== ".git") fs.rmSync(path.join(tree, entry), { recursive: true });
    fs.cpSync(path.join(CASES, bare, "clean"), tree, { recursive: true });
    return outcome(other).results.find((r) => r.id === onHead.id).state === "checks only" || "a case with no probes was counted as recovered on its checks alone";
  });

test("the repository's own tests end as passed, failed, unfinished or none, and none is not a pass",
  "pass and fail counts with the exit status dropped made a run that crashed, and one with no tests, look like a clean one",
  () => {
    const dir = reviewedRound(), manifest = implement(dir), heads = manifest.filter((m) => m.variant === "head" && !m.anchor);
    const repo = (m) => path.join(dir, "work", m.id, "repo"), testsIn = (m) => path.join(repo(m), "test");
    fs.writeFileSync(path.join(testsIn(heads[0]), "broken.test.js"), 'import test from "node:test";\ntest("fails", () => { throw new Error("no"); });\n');
    fs.rmSync(testsIn(heads[1]), { recursive: true });
    const status = Object.fromEntries(outcome(dir).results.map((r) => [r.id, r.tests]));
    if (status[heads[0].id].status !== "failed" || status[heads[0].id].exit === 0) return `a failing test is "${status[heads[0].id].status}"`;
    if (status[heads[1].id].status !== "none") return `a repository with no tests is "${status[heads[1].id].status}"`;
    return status[heads[2].id].status === "passed" || `untouched tests are "${status[heads[2].id].status}"`;
  });

test("an acceptance check that never ends is unfinished, and the checks beside it keep their results",
  "one implementation awaited a service that never answers; the whole run was written down as no checks and one error, and the table printed -3 / 0",
  () => {
    const dir = tempDir("review-outcome-");
    fs.mkdirSync(path.join(dir, "returns"));
    fs.writeFileSync(path.join(dir, "runs.json"), JSON.stringify([{ run: "r01", case: "slot-edit", variant: "head", arm: "control", review: "returns/r01.md" }]));
    fs.writeFileSync(path.join(dir, "returns", "r01.md"), "A review.");
    const [waiting] = implement(dir).filter((m) => m.review), screen = path.join(dir, "work", waiting.id, "repo", "src", "slots", "screen.js");
    // The editor now waits for the zone before it opens: it never opens while the service is silent, and throws when it is down.
    fs.writeFileSync(screen, fs.readFileSync(screen, "utf8").replace("const form =", "await client.getZone(order.address.zone.id);\n  const form ="));
    const results = outcome(dir).results, result = results.find((r) => r.id === waiting.id), text = outcomeTable(results);
    if (result.unfinished.join() !== "the zone's hours apply while the zone service has not answered") return `unfinished: ${JSON.stringify(result.unfinished)}`;
    if (!result.failed.includes("the zone's hours apply when the zone service is down") || result.checks !== 13 || result.state !== "not recovered") return `failed: ${JSON.stringify(result.failed)} of ${result.checks}, ${result.state}`;
    const passed = result.checks - result.failed.length - 1;
    return passed > 0 && text.includes(`| ${passed} / 13, 1 unfinished |`) || `unexpected table:\n${text}`;
  });

test("the page that tells an operator how to run a round names every case",
  "a case the page does not list is a case nobody runs",
  () => {
    const page = fs.readFileSync(path.join(EVALS, "review/README.md"), "utf8");
    const absent = names.filter((n) => !page.includes(`\`${n}\``));
    return absent.length === 0 || `README.md does not name ${absent.join(", ")}`;
  });

process.exit(summarize(await runCases(TESTS), TESTS.length));
