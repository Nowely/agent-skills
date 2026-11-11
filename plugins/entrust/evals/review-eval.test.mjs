#!/usr/bin/env node
// Is the review skill's measuring instrument sound? Reads evals/review/: the cases, prepare.mjs, round.mjs and
// score.mjs. It calls no model and judges no review; it checks that each case's clean solution meets the brief
// and its first-written one fails exactly what the rubric says, that a prepared run hands the reviewer the
// change and nothing of the answer, and that the score table counts what the verdicts say. Run it after an
// edit to anything under evals/review/.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { EVALS, registry, runCases, summarize, tempDir } from "./lib/harness.mjs";
import { CASES, VARIANTS, prepare } from "./review/prepare.mjs";
import { round } from "./review/round.mjs";
import { rubricOf, score, table } from "./review/score.mjs";

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
      && fs.existsSync(path.join(dir, "returns")) || `unexpected manifest: ${JSON.stringify(runs.slice(0, 3))}`;
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

test("the page that tells an operator how to run a round names every case",
  "a case the page does not list is a case nobody runs",
  () => {
    const page = fs.readFileSync(path.join(EVALS, "review/README.md"), "utf8");
    const absent = names.filter((n) => !page.includes(`\`${n}\``));
    return absent.length === 0 || `README.md does not name ${absent.join(", ")}`;
  });

process.exit(summarize(await runCases(TESTS), TESTS.length));
