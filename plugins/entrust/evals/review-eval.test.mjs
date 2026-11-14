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
import { CASES, VARIANTS, packageDigest, prepare } from "./review/prepare.mjs";
import { PROTOCOL, round } from "./review/round.mjs";
import { rubricOf, score, table } from "./review/score.mjs";
import { TASK_ONLY, implement } from "./review/implement.mjs";
import { outcome, table as outcomeTable } from "./review/outcome.mjs";
import { blocks, numbers, table as blocksTable } from "./review/blocks.mjs";

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

function skillPackage() {
  const dir = tempDir("review-skill-");
  fs.mkdirSync(path.join(dir, "references", "nested"), { recursive: true });
  fs.mkdirSync(path.join(dir, "scripts"));
  fs.writeFileSync(path.join(dir, "SKILL.md"), "---\nname: review\n---\nSee references/nested/data.md.\n");
  fs.writeFileSync(path.join(dir, "references", "nested", "data.md"), "Reference.\n");
  fs.writeFileSync(path.join(dir, "scripts", "check.mjs"), "export {};\n");
  return dir;
}

test("a prepared run holds one variant, an identical neutral request and a complete skill package",
  "the skill is delivered separately, not through a hint in the user's request",
  () => {
    const skill = skillPackage(), expected = "Review the change.\n\nRepository: .\nChange: HEAD~1..HEAD\nTask: ../brief.md";
    for (const name of names) {
      for (const variant of VARIANTS) {
        const control = prepare(name, variant), arm = prepare(name, variant, skill);
        const git = (...args) => execFileSync("git", args, { cwd: arm.cwd, encoding: "utf8" }).trim();
        if (git("rev-list", "--count", "HEAD") !== "2") return `${name}/${variant}: expected two commits`;
        if (git("status", "--porcelain") !== "") return `${name}/${variant}: the working tree differs from HEAD`;
        const tree = files(path.join(CASES, name, variant)).map((f) => f.split(path.sep).join("/")).join("\n");
        if (git("ls-files").split("\n").sort().join("\n") !== tree) return `${name}/${variant}: HEAD is not the ${variant} tree`;
        if (git("diff", "--name-only", "HEAD~1", "HEAD") === "") return `${name}/${variant}: the two commits do not differ`;
        const beside = fs.readdirSync(arm.run).sort().join(" ");
        if (beside !== "brief.md repo skill") return `${name}/${variant}: the run directory holds ${beside}`;
        if (control.skill !== null || fs.existsSync(path.join(control.run, "skill"))) return `${name}/${variant}: the control arm got a skill`;
        if (control.cwd !== path.join(control.run, "repo") || arm.cwd !== path.join(arm.run, "repo")
          || control.prompt !== expected || arm.prompt !== expected)
          return `${name}/${variant}: cwd or user request differs`;
        if (files(skill).join("\n") !== files(arm.skill.path).join("\n") || arm.skill.sha256 !== packageDigest(skill))
          return `${name}/${variant}: package contents or digest differ`;
        if (files(skill).some((f) => !fs.readFileSync(path.join(skill, f)).equals(fs.readFileSync(path.join(arm.skill.path, f)))))
          return `${name}/${variant}: a package file differs`;
      }
    }
    return true;
  });

test("the package digest detects changed references and refuses symbolic links",
  "a matching entrypoint does not identify the package delivered to the host",
  () => {
    const skill = skillPackage(), first = prepare(names[0], "head", skill);
    fs.writeFileSync(path.join(skill, "references", "nested", "data.md"), "Changed reference.\n");
    try { prepare(names[0], "head", skill, first.skill.sha256); return "accepted a package changed after preflight"; }
    catch (error) { if (!/changed since round preflight/.test(error.message)) return error.message; }
    const second = prepare(names[0], "head", skill);
    if (first.skill.sha256 === second.skill.sha256 || first.skill.sha256 !== packageDigest(first.skill.path))
      return "a changed reference was not reflected in the prepared package digest";
    fs.writeFileSync(path.join(first.skill.path, "references", "nested", "data.md"), "Substituted reference.\n");
    if (first.skill.sha256 === packageDigest(first.skill.path)) return "a substituted prepared reference was not detected";
    fs.symlinkSync("nested/data.md", path.join(skill, "references", "link.md"));
    try { prepare(names[0], "head", skill); return "a symbolic link was accepted"; }
    catch (error) { return /symbolic link/.test(error.message) || error.message; }
  });

test("the documented digest command checks the copied package",
  "the operator must be able to compare the prepared bytes immediately before activation",
  () => {
    const page = fs.readFileSync(path.join(EVALS, "review/README.md"), "utf8");
    const command = page.match(/^   (node --input-type=module .+)$/m)?.[1];
    if (!command) return "the documented digest command is missing";
    const prepared = prepare(names[0], "head", skillPackage());
    const check = () => execFileSync("/bin/sh", ["-c", command], {
      cwd: path.dirname(EVALS), env: { ...process.env, SKILL_DIR: prepared.skill.path }, encoding: "utf8",
    }).trim();
    if (check() !== prepared.skill.sha256) return "the documented command differs from the manifest digest";
    fs.writeFileSync(path.join(prepared.skill.path, "references", "nested", "data.md"), "Changed after preparation.\n");
    return check() !== prepared.skill.sha256 || "the documented command did not detect a changed copy";
  });

test("a round prepares every case, variant and arm once per repetition and records which run is which",
  "the manifest is the only place a run id is tied to its arm",
  () => {
    const dir = tempDir("review-round-"), skill = skillPackage();
    round(dir, ["control", `draft=${skill}`]);
    const { runs } = round(dir, ["control", `draft=${skill}`]);
    const cells = runs.map((r) => `${r.case} ${r.variant} ${r.arm}`);
    const twice = [...new Set(cells)].every((cell) => cells.filter((c) => c === cell).length === 2);
    const prompts = runs.map((r) => fs.readFileSync(path.join(dir, "prompts", `${r.run}.txt`), "utf8"));
    return runs.length === names.length * VARIANTS.length * 2 * 2 && twice && new Set(runs.map((r) => r.run)).size === runs.length
      && prompts.every((prompt) => prompt === prompts[0])
      && runs.every((r) => r.protocol === PROTOCOL && fs.existsSync(path.join(r.cwd, ".git"))
        && (r.arm === "control" ? r.skill === null : r.skill.sha256 === packageDigest(r.skill.path)))
      && fs.existsSync(path.join(dir, "returns")) && round(tempDir("review-round-"), ["control"], [names[0]]).runs.every((r) => r.case === names[0])
      || `unexpected manifest: ${JSON.stringify(runs.slice(0, 3))}`;
  });

test("the recorded cwd resolves the repository, change and relative brief",
  "the host starts at the project root and the shared request's paths must resolve from there",
  () => {
    const dir = tempDir("review-cwd-"), skill = skillPackage(), name = names[0];
    round(dir, ["control", `draft=${skill}`], [name]);
    const runs = JSON.parse(fs.readFileSync(path.join(dir, "runs.json"), "utf8"));
    const expectedBrief = fs.readFileSync(path.join(CASES, name, "brief.md"));
    for (const run of runs) {
      const options = { cwd: run.cwd };
      const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { ...options, encoding: "utf8" }).trim();
      if (fs.realpathSync(root) !== fs.realpathSync(run.cwd)) return `${run.run}: cwd is not the repository root`;
      const diff = execFileSync("git", ["diff", "--name-only", "HEAD~1..HEAD"], { ...options, encoding: "utf8" }).trim();
      if (!diff) return `${run.run}: the requested change is empty`;
      const brief = execFileSync(process.execPath, ["-e", 'process.stdout.write(require("node:fs").readFileSync("../brief.md"))'], options);
      if (!brief.equals(expectedBrief)) return `${run.run}: ../brief.md is not the case's brief`;
      if (run.skill && path.dirname(run.skill.path) !== path.dirname(run.cwd)) return `${run.run}: skill is not beside the repository`;
    }
    return true;
  });

test("a failed manifest write preserves the previous manifest and prompts",
  "an interrupted append must not destroy the assignments already recorded",
  () => {
    const dir = tempDir("review-manifest-"), manifest = path.join(dir, "runs.json");
    round(dir, ["control"], [names[0]]);
    const appended = round(dir, ["control"], [names[0]]);
    if (appended.runs.length !== VARIANTS.length * 2) return "a normal append failed";
    const before = fs.readFileSync(manifest);
    const prompts = appended.runs.map((run) => [run.run, fs.readFileSync(path.join(dir, "prompts", `${run.run}.txt`))]);
    const write = fs.writeFileSync;
    fs.writeFileSync = (target, data, options) => {
      if (typeof target === "number") {
        write(target, "partial");
        throw new Error("simulated manifest write failure");
      }
      return write(target, data, options);
    };
    try {
      round(dir, ["control"], [names[0]]);
      return "a failed manifest write was accepted";
    } catch (error) {
      if (error.message !== "simulated manifest write failure") return error.message;
      if (!fs.readFileSync(manifest).equals(before)) return "the previous manifest changed";
      if (prompts.some(([run, content]) => !fs.readFileSync(path.join(dir, "prompts", `${run}.txt`)).equals(content)))
        return "an existing prompt changed";
      if (fs.readdirSync(dir).some((name) => /^runs\.json\..*\.tmp$/.test(name))) return "the temporary manifest was not removed";
      return true;
    } finally { fs.writeFileSync = write; }
  });

test("a round refuses legacy, unknown and mixed manifests before writing",
  "new assignments must not be appended to a historical or unrecognized study",
  () => {
    if (PROTOCOL !== "review-neutral-2") return `unexpected protocol marker ${PROTOCOL}`;
    for (const entries of [[{ run: "r01" }], [{ run: "r01", protocol: "other" }],
      [{ run: "r01", protocol: "review-activated-1" }],
      [{ run: "r01", protocol: "review-neutral-1" }],
      [{ run: "r01", protocol: PROTOCOL }, { run: "r02" }], []]) {
      const dir = tempDir("review-protocol-"), manifest = path.join(dir, "runs.json"), original = JSON.stringify(entries);
      fs.writeFileSync(manifest, original);
      const before = fs.readdirSync(dir).sort().join("\n");
      try { round(dir, ["control"], [names[0]]); return `accepted ${original}`; }
      catch (error) { if (!/legacy, unknown or mixed/.test(error.message)) return error.message; }
      if (fs.readFileSync(manifest, "utf8") !== original || fs.readdirSync(dir).sort().join("\n") !== before)
        return `wrote to a refused study: ${original}`;
    }
    return true;
  });

const snapshot = (dir) => {
  const entries = (at) => fs.readdirSync(path.join(dir, at), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const name = path.join(at, entry.name);
      return entry.isDirectory() ? [`${name}/`, ...entries(name)] : [`${name}:${fs.readFileSync(path.join(dir, name)).toString("hex")}`];
    });
  return entries("").join("\n");
};

test("a round rejects duplicate arm names and changed package identities before writing",
  "a single arm must not silently combine distinct interventions",
  () => {
    const dir = tempDir("review-identities-"), skill = skillPackage();
    round(dir, ["control", `draft=${skill}`], [names[0]]);
    const before = snapshot(dir);
    for (const arms of [["control", "control"], [`draft=${skill}`, `draft=${skill}`]]) {
      try { round(dir, arms, [names[0]]); return `accepted duplicate arms ${arms}`; }
      catch (error) { if (!/arm names must be unique/.test(error.message)) return error.message; }
      if (snapshot(dir) !== before) return "duplicate arms changed the study";
    }
    fs.writeFileSync(path.join(skill, "references", "nested", "data.md"), "A different version.\n");
    try { round(dir, ["control", `draft=${skill}`], [names[0]]); return "accepted a changed reference"; }
    catch (error) { if (!/different skill package or control state/.test(error.message)) return error.message; }
    if (snapshot(dir) !== before) return "a changed package altered the manifest or prompts";
    const manifest = path.join(dir, "runs.json"), runs = JSON.parse(fs.readFileSync(manifest, "utf8"));
    runs.find((run) => run.arm === "control").skill = { sha256: "not-control" };
    fs.writeFileSync(manifest, JSON.stringify(runs));
    const inconsistent = snapshot(dir);
    try { round(dir, ["control"], [names[0]]); return "accepted an inconsistent control state"; }
    catch (error) { if (!/different skill package or control state/.test(error.message)) return error.message; }
    return snapshot(dir) === inconsistent || "a changed control state altered the study";
  });

test("a round refuses existing prompt paths without changing the study",
  "a prompt left by an interrupted preparation must not be overwritten",
  () => {
    for (const existing of [false, true]) {
      const dir = tempDir("review-prompt-");
      if (existing) round(dir, ["control"], [names[0]]);
      else fs.mkdirSync(path.join(dir, "prompts"));
      const file = path.join(dir, "prompts", existing ? "r04.txt" : "r02.txt");
      fs.writeFileSync(file, Buffer.from([0, 255, 128, 10]));
      const before = snapshot(dir);
      try { round(dir, ["control"], [names[0]]); return `accepted an existing prompt: ${file}`; }
      catch (error) { if (!/prompt already exists/.test(error.message)) return error.message; }
      if (snapshot(dir) !== before) return `changed the study containing ${file}`;
    }
    return true;
  });

test("a round refuses unassigned returns before writing",
  "an old artifact must not be associated with a new assignment",
  () => {
    for (const [existing, name, directory] of [
      [false, "r99.md", false], [false, "unrelated", true],
      [true, "r03", false], [true, "r04.md", false], [true, "r03.json", false],
      [true, "r04.html", false], [true, "r03", true], [true, "r04.extra", true],
      [true, "R03.MD", false], [true, "R04", true],
    ]) {
      const dir = tempDir("review-return-");
      if (existing) round(dir, ["control"], [names[0]]);
      else fs.mkdirSync(path.join(dir, "returns"));
      const entry = path.join(dir, "returns", name);
      if (directory) fs.mkdirSync(entry);
      const sentinel = directory ? path.join(entry, "sentinel") : entry;
      fs.writeFileSync(sentinel, Buffer.from([0, 255, 128, 10]));
      const before = snapshot(dir);
      try { round(dir, ["control"], [names[0]]); return `accepted unassigned return ${name}`; }
      catch (error) { if (!/returns is not empty without a manifest|return already exists/.test(error.message)) return error.message; }
      if (snapshot(dir) !== before) return `changed the study containing ${name}`;
    }
    return true;
  });

test("a round refuses legacy outputs without a manifest before writing",
  "old verdicts or implementation artifacts must not be attributed to new assignments",
  () => {
    for (const [name, directory] of [
      ["verdicts.json", false], ["VERDICTS.JSON", false], ["blocks.json", false],
      ["implement.json", false], ["outcome.json", false], ["outcome-verdicts.json", false],
      ["WORK", true], ["implement", true], ["patches", true],
    ]) {
      const dir = tempDir("review-legacy-output-"), entry = path.join(dir, name);
      if (directory) fs.mkdirSync(entry);
      const sentinel = directory ? path.join(entry, "sentinel") : entry;
      fs.writeFileSync(sentinel, Buffer.from([0, 255, 128, 10]));
      const before = snapshot(dir);
      try { round(dir, ["control"], [names[0]]); return `accepted legacy output ${name}`; }
      catch (error) { if (!/legacy output exists without a manifest/.test(error.message)) return error.message; }
      if (snapshot(dir) !== before) return `changed the study containing ${name}`;
    }
    return true;
  });

test("a round allows empty returns and names not matching new IDs",
  "only exact IDs and dot-suffixed names collide when a manifest exists",
  () => {
    const dir = tempDir("review-return-ok-");
    fs.mkdirSync(path.join(dir, "returns"));
    const sentinel = Buffer.from([0, 255, 128, 10]);
    fs.writeFileSync(path.join(dir, "protocol.md"), sentinel);
    round(dir, ["control"], [names[0]]);
    for (const name of ["r01.md", "r030.md"]) fs.writeFileSync(path.join(dir, "returns", name), sentinel);
    const { runs } = round(dir, ["control"], [names[0]]);
    return runs.length === VARIANTS.length * 2
      && fs.readFileSync(path.join(dir, "protocol.md")).equals(sentinel)
      && ["r01.md", "r030.md"].every((name) => fs.readFileSync(path.join(dir, "returns", name)).equals(sentinel))
      || "a non-colliding return blocked the round or changed";
  });

test("a round creates prompts exclusively after preflight",
  "a prompt created between preflight and writing must remain intact",
  () => {
    const dir = tempDir("review-prompt-race-"), file = path.join(dir, "prompts", "r01.txt");
    const sentinel = Buffer.from([0, 255, 128, 10]), write = fs.writeFileSync;
    fs.writeFileSync = (target, data, options) => {
      if (target === file) write(file, sentinel, { flag: "wx" });
      return write(target, data, options);
    };
    try {
      round(dir, ["control"], [names[0]]);
      return "overwrote a prompt created after preflight";
    } catch (error) {
      if (error.code !== "EEXIST") return error.message;
      return fs.readFileSync(file).equals(sentinel) && !fs.existsSync(path.join(dir, "runs.json"))
        || "the new prompt or manifest changed";
    } finally { fs.writeFileSync = write; }
  });

test("a round rejects a package changed during copying",
  "the copied bytes must match the package identity frozen in preflight",
  () => {
    const dir = tempDir("review-copy-"), skill = skillPackage(), copy = fs.cpSync;
    fs.cpSync = (source, destination, options) => {
      copy(source, destination, options);
      if (source === skill) fs.writeFileSync(path.join(destination, "references", "nested", "data.md"), "Changed during copying.\n");
    };
    try {
      round(dir, [`draft=${skill}`], [names[0]]);
      return "accepted a changed copy";
    } catch (error) {
      if (!/skill package changed while copying/.test(error.message)) return error.message;
      return !fs.existsSync(path.join(dir, "runs.json")) && fs.readdirSync(path.join(dir, "prompts")).length === 0
        || "a changed copy was recorded as a prepared assignment";
    } finally { fs.cpSync = copy; }
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

test("the lines a case calls superfluous or needed are lines of its first-written form, and the clean form has none to remove",
  "a count against line numbers that drifted from the file measures nothing and looks exact",
  () => {
    for (const name of names) {
      const { lines } = rubricOf(name).head;
      if (!lines) continue;
      const seen = new Set();
      for (const [kind, spec] of Object.entries(lines)) for (const [file, list] of Object.entries(spec)) {
        const text = fs.readFileSync(path.join(CASES, name, "head", file), "utf8").split("\n");
        for (const line of numbers(list)) {
          if (!text[line - 1]?.trim()) return `${name}: ${kind} names ${file}:${line}, which is blank or past the end`;
          if (seen.has(`${file}:${line}`)) return `${name}: ${file}:${line} is both to remove and to keep`;
          seen.add(`${file}:${line}`);
        }
      }
      if (rubricOf(name).clean.lines) return `${name}: the clean form lists lines`;
      if ((rubricOf(name).head.already ?? []).some((one) => !one.what || !one.listed?.length || !one.instead?.length)) return `${name}: a mechanism to find lacks its words`;
    }
    return true;
  });

test("what a review's record marks for removal is counted against the lines the case knows, with no judge",
  "whether a review sees the superfluous code was known only through a judge's reading of prose; the record names the lines itself",
  () => {
    const dir = tempDir("review-blocks-"), name = "slot-edit", file = "src/slots/edit.js", known = rubricOf(name).head.lines;
    const runs = [["r01", "head", "draft"], ["r02", "head", "draft"], ["r03", "clean", "draft"], ["r04", "head", "control"]]
      .map(([run, variant, arm]) => ({ run, case: name, variant, arm, review: `returns/${run}.md` }));
    fs.mkdirSync(path.join(dir, "returns"));
    fs.writeFileSync(path.join(dir, "runs.json"), JSON.stringify(runs));
    const record = (run, list, mechanisms = []) => fs.writeFileSync(path.join(dir, "returns", `${run}.json`), JSON.stringify({ blocks: list, mechanisms }));
    // One review removes the lookup and, wrongly, the rule for a slot that is too soon; one only repairs around it; one touches a clean form.
    record("r01", [{ path: file, added: "7-19", verdict: "remove" }, { path: file, added: "44", verdict: "remove" }, { path: file, added: "51-58", verdict: "fix" }, { path: "test/slot-edit.test.js", added: "all", verdict: "remove" }, { path: file, added: "30", verdict: "remove" }],
      [{ name: "zone lookup", change: "added", instead: "The order carries it: node_modules/@acme/orders-client/index.d.ts:9, order.address.zone." }]);
    // The other lists the lookup and does not find what makes it needless; a mechanism it only reuses is not one the change brought.
    record("r02", [{ path: file, added: "1-67", verdict: "fix" }],
      [{ name: "loadZone with a cache", change: "added", instead: "Nothing: src/slots/hours.js:1." }, { name: "getZone", change: "reused", basis: "order.address.zone" }]);
    record("r03", [{ path: file, added: "3-4", verdict: "remove" }, { path: "test/slot-edit.test.js", added: "1-5", verdict: "remove" }, { path: file, added: "10", verdict: "keep" }]);
    const results = blocks(dir), by = (run) => results.find((r) => r.run === run), total = numbers(known.remove[file]).size;
    if (by("r01").removed !== 13 || by("r01").fixed !== 8 || by("r01").unmapped !== 5 || by("r01").wrongly !== 1 || by("r01").other !== 1 || by("r01").superfluous !== total || by("r01").found !== 1) return `r01: ${JSON.stringify(by("r01"))}`;
    if (by("r02").removed !== 0 || by("r02").fixed !== total || by("r02").wrongly !== 0 || by("r02").listed !== 1 || by("r02").found !== 0) return `r02: ${JSON.stringify(by("r02"))}`;
    if (by("r03").removed !== 2) return `on the clean form only lines of code count: ${JSON.stringify(by("r03"))}`;
    if (!by("r04").missing) return "a run with no record was counted";
    const text = blocksTable(results);
    return text.includes(`| draft | ${name}/head | 2 | 2 | 2 / 2 | 1 / 2 | 13 / ${2 * total} | ${8 + total} | 5 | 1 | 1 |`) && text.includes(`| draft | ${name}/clean | 1 | 1 | – | – | – | – | – | – | 2 |`)
      && text.includes(`| control | ${name}/head | 1 | 0 | – |`) || `unexpected table:\n${text}`;
  });

test("the page that tells an operator how to run a round names every case",
  "a case the page does not list is a case nobody runs",
  () => {
    const page = fs.readFileSync(path.join(EVALS, "review/README.md"), "utf8");
    const absent = names.filter((n) => !page.includes(`\`${n}\``));
    return absent.length === 0 || `README.md does not name ${absent.join(", ")}`;
  });

process.exit(summarize(await runCases(TESTS), TESTS.length));
