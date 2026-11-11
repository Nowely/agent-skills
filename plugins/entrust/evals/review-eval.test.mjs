#!/usr/bin/env node
// Is the review skill's measuring instrument sound? Reads evals/review/: the cases, prepare.mjs and score.mjs.
// It calls no model and judges no review; it checks that what a rubric calls a defect happens when the case's
// code runs, that a prepared run hands the reviewer the change and never the rubric, and that the score table
// counts what the verdicts say. Run it after an edit to anything under evals/review/.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { EVALS, registry, runCases, summarize } from "./lib/harness.mjs";
import { CASES, prepare } from "./review/prepare.mjs";
import { rubricOf, score, table } from "./review/score.mjs";

const { cases: TESTS, test } = registry();
const names = fs.readdirSync(CASES).sort();
const files = (dir, at = "") => fs.readdirSync(path.join(dir, at), { withFileTypes: true })
  .flatMap((e) => e.isDirectory() ? files(dir, path.join(at, e.name)) : [path.join(at, e.name)]).sort();

test("every case has a brief, both trees and a rubric a judge can rule on",
  "a rubric item without an id, a kind or its ruling text cannot be judged, and a duplicate id is scored twice",
  () => {
    for (const name of names) {
      const dir = path.join(CASES, name);
      for (const part of ["brief.md", "base", "head", "rubric.json", "proof.mjs"])
        if (!fs.existsSync(path.join(dir, part))) return `${name} has no ${part}`;
      const { items } = rubricOf(name);
      const ids = items.map((i) => i.id);
      if (new Set(ids).size !== ids.length) return `${name}: duplicate rubric id`;
      for (const item of items) {
        const text = item.kind === "find" ? item.hit : item.kind === "trap" ? item.violated : null;
        if (!item.id || !item.title || !text) return `${name} ${item.id}: kind, title or ruling text is missing`;
      }
      if (!items.some((i) => i.kind === "trap")) return `${name}: no trap, so a reviewer who flags everything scores best`;
    }
    return names.length > 0 || "no cases";
  });

test("what a rubric states as fact happens when the case's code runs",
  "a rubric that calls working code a defect, or a required check removable, grades reviewers against a falsehood",
  async () => {
    for (const name of names) {
      const tree = (which) => (file) => import(pathToFileURL(path.join(CASES, name, which, file)).href);
      const proofs = (await import(pathToFileURL(path.join(CASES, name, "proof.mjs")).href)).default;
      const ids = rubricOf(name).items.map((i) => i.id);
      for (const [id, proof] of Object.entries(proofs)) {
        if (!ids.includes(id)) return `${name}: proof ${id} matches no rubric item`;
        try { await proof({ base: tree("base"), head: tree("head") }); }
        catch (e) { return `${name} ${id}: ${e.message}`; }
      }
    }
    return true;
  });

test("a prepared run holds the change as one commit and nothing of the rubric",
  "a reviewer who can open the rubric is graded on reading it",
  () => {
    for (const name of names) {
      const instructions = path.join(CASES, name, "brief.md"); // any file stands in for an arm's instructions
      const control = prepare(name), arm = prepare(name, instructions);
      const git = (...args) => execFileSync("git", args, { cwd: path.join(arm.run, "repo"), encoding: "utf8" }).trim();
      if (git("rev-list", "--count", "HEAD") !== "2") return `${name}: expected two commits`;
      if (git("status", "--porcelain") !== "") return `${name}: the working tree differs from HEAD`;
      const head = files(path.join(CASES, name, "head")), base = files(path.join(CASES, name, "base"));
      const tracked = git("ls-files").split("\n").sort();
      if (tracked.join("\n") !== head.map((f) => f.split(path.sep).join("/")).join("\n")) return `${name}: HEAD is not the head tree`;
      if (git("ls-tree", "-r", "--name-only", "HEAD~1").split("\n").length !== base.length) return `${name}: HEAD~1 is not the base tree`;
      if (git("diff", "--name-only", "HEAD~1", "HEAD") === "") return `${name}: the two trees do not differ`;
      const leaked = [...files(arm.run), ...files(control.run)].filter((f) => /rubric|proof/.test(f) && !f.includes(".git"));
      if (leaked.length) return `${name}: ${leaked[0]} reached the run directory`;
      if (fs.existsSync(path.join(control.run, "instructions.md"))) return `${name}: the control arm got instructions`;
      const extra = arm.prompt.replaceAll(arm.run, "RUN").split("\n")
        .filter((l) => !control.prompt.replaceAll(control.run, "RUN").split("\n").includes(l));
      if (extra.length !== 1 || !extra[0].includes("instructions.md")) return `${name}: the arms' prompts differ by more than the instructions line`;
    }
    return true;
  });

const verdictFor = (run, rulings) => ({ run, items: rulings, extra: [{ claim: "c", verdict: "unsupported", why: "w" }] });
const all = (name, find, trap) => Object.fromEntries(rubricOf(name).items.map((i) => [i.id, i.kind === "find" ? find : trap]));

test("the score table counts hits, partials, trap violations and unsupported claims per arm",
  "the table is the number a results page quotes",
  () => {
    const [name] = names, finds = rubricOf(name).items.filter((i) => i.kind === "find").length;
    const traps = rubricOf(name).items.length - finds;
    const runs = [{ run: "a", case: name, arm: "one" }, { run: "b", case: name, arm: "two" }];
    const rows = score(runs, [verdictFor("a", all(name, "hit", "clean")), verdictFor("b", all(name, "partial", "violated"))], () => 10);
    const total = (arm) => rows.find((r) => r.arm === arm && r.case === "all");
    return total("one").hit === finds && total("one").violated === 0 && total("two").partial === finds
      && total("two").violated === traps && total("one").unsupported === 1 && rows.length === 4
      && table(rows).includes(`| two | all | 1 | 0 / ${finds} / 0 | 0.50 | ${traps} | 0 | 1 | 10 |`)
      || `unexpected rows: ${JSON.stringify(rows)}`;
  });

test("a verdict that skips a rubric item, invents one or rules in other words stops the score",
  "a table over a partly judged run reads as a measurement",
  () => {
    const [name] = names, runs = [{ run: "a", case: name, arm: "one" }];
    const whole = all(name, "hit", "clean"), [first] = Object.keys(whole);
    const refuses = (verdicts) => { try { score(runs, verdicts); return false; } catch { return true; } };
    const { [first]: dropped, ...missing } = whole;
    return refuses([{ run: "a", items: missing }]) && refuses([{ run: "a", items: { ...whole, Z9: "hit" } }])
      && refuses([{ run: "a", items: { ...whole, [first]: "found" } }]) && refuses([])
      && refuses([{ run: "a", items: whole }, { run: "ghost", items: whole }]) || "an incomplete verdict was scored";
  });

test("the page that tells an operator how to run a round names every case",
  "a case the page does not list is a case nobody runs",
  () => {
    const page = fs.readFileSync(path.join(EVALS, "review/README.md"), "utf8");
    const absent = names.filter((n) => !page.includes(`\`${n}\``));
    return absent.length === 0 || `README.md does not name ${absent.join(", ")}`;
  });

process.exit(summarize(await runCases(TESTS), TESTS.length));
