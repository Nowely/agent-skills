#!/usr/bin/env node
// Does skills/skill-creator/scripts/check.mjs fail each of its rules on a skill that breaks it, pass a skill that
// breaks none, and state the numbers its page states?
//
//   node evals/skill-check.test.mjs
//
// Each red case plants one violation in a copy of a clean skill and names the rule that must fail; the clean copy
// is the control, so a rule that fails without its violation fails here too. The last cases run the command line
// and hold the summary line against the script's numbers.

import fs from "node:fs";
import path from "node:path";
import { ROOT, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const DIR = path.join(ROOT, "skills", "skill-creator");
const CHECK = path.join(DIR, "scripts", "check.mjs");
const { LIMITS, rules, skillAt } = await import(CHECK);
const TMP = tempDir("skill-check-test-");

const CLEAN = {
  "SKILL.md": "---\nname: sample\ndescription: Does a sample thing, for requests to do it.\n---\n\nRead [the table](references/table.md).\n",
  "references/table.md": "# The table\n\nA row.\n",
};
let n = 0;
// A copy of the clean skill with `files` laid over it, in a folder named `sample` unless `folder` says otherwise.
function plant(files = {}, folder = "sample") {
  const dir = path.join(TMP, String(++n), folder);
  for (const [rel, text] of Object.entries({ ...CLEAN, ...files })) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), text);
  }
  return dir;
}
const failing = (dir) => rules([skillAt(dir)]).found.filter(([, , list]) => list.length).map(([number]) => number);
const page = (frontmatter, body = "Read [the table](references/table.md).\n") => `---\n${frontmatter}\n---\n\n${body}`;
const expect = (what, dir, want) => {
  const got = failing(dir);
  return JSON.stringify(got) === JSON.stringify(want) || `${what}: wanted rules [${want}], got [${got}]`;
};
const all = (...results) => {
  const bad = results.filter((r) => r !== true);
  return bad.length === 0 || bad.join("; ");
};
const DESC = "description: Does a sample thing.";

test("a skill that breaks no rule fails none, and each planted violation fails its own rule and no other",
  "a rule that cannot fail measures nothing, and one that fails on a clean skill sends a writer after a fault that is not there",
  () => all(
    expect("clean", plant(), []),
    expect("capitals in the name", plant({ "SKILL.md": page(`name: Sample\n${DESC}`) }), [1, 9]),
    expect("a long listing", plant({ "SKILL.md": page(`name: sample\ndescription: ${"word ".repeat(300)}\nwhen_to_use: ${"word ".repeat(100)}`) }), [2, 10]),
    expect("500 lines of body", plant({ "SKILL.md": page(`name: sample\n${DESC}`, "Read [the table](references/table.md).\n" + "line\n".repeat(499)) }), [3]),
    expect("a body past the compaction cut", plant({ "SKILL.md": page(`name: sample\n${DESC}`, "Read [the table](references/table.md).\n" + "x".repeat(20000) + "\n") }), [4]),
    expect("a late section with no contents link", plant({ "references/table.md": "# The table\n" + "row\n".repeat(110) + "\n## Late\n\ntext\n" }), [5]),
    expect("a reference reached only through another", plant({ "references/table.md": "# The table\n\nSee [more](more.md).\n", "references/more.md": "# More\n" }), [6, 11]),
    expect("a backslash in a link", plant({ "SKILL.md": page(`name: sample\n${DESC}`, "Read [the table](references/table.md) and [it](references\\table.md).\n") }), [7, 8]),
    expect("a link to no file", plant({ "SKILL.md": page(`name: sample\n${DESC}`, "Read [the table](references/table.md) and [gone](references/gone.md).\n") }), [8]),
    expect("a link to no heading", plant({ "SKILL.md": page(`name: sample\n${DESC}`, "Read [the table](references/table.md#nowhere).\n") }), [8]),
    expect("a name that is not the folder's", plant({}, "other"), [9]),
    expect("a name of 65 characters", plant({ "SKILL.md": page(`name: ${"a".repeat(65)}\n${DESC}`) }, "a".repeat(65)), [9]),
    expect("a doubled hyphen", plant({ "SKILL.md": page(`name: sam--ple\n${DESC}`) }, "sam--ple"), [9]),
    expect("no description", plant({ "SKILL.md": page("name: sample") }), [10]),
    expect("a description of 1,025 characters", plant({ "SKILL.md": page(`name: sample\ndescription: ${"d".repeat(1025)}`) }), [10]),
    expect("a reference nothing links", plant({ "references/orphan.md": "# Orphan\n" }), [11]),
    expect("a description the reader cannot count", plant({ "SKILL.md": page("name: sample\ndescription: Does a thing\n  on two lines.") }), [1, 2, 9, 10]),
  ));

test("the command line prints the failed rule, exits 1 on a violation, 0 on none and 2 on a bad call, and importing the file runs nothing",
  "the page tells a writer to run it after each edit and read the exit status; the repository's suite imports it, and an import that ran the command line would exit the suite",
  async () => {
    const run = async (...args) => {
      const r = await spawnNode([CHECK, ...args], { killAfterMs: 30_000 }).done;
      return { code: r.code, out: r.out };
    };
    const clean = await run(plant());
    const red = await run(plant({ "references/orphan.md": "# Orphan\n" }));
    const bare = await run();
    const problems = [];
    if (clean.code !== 0 || !/^ok {4}.*11 of 11 rules passed/m.test(clean.out)) problems.push(`clean: exit ${clean.code}: ${clean.out}`);
    if (red.code !== 1 || !/^FAIL {2}11\. /m.test(red.out)) problems.push(`red: exit ${red.code}: ${red.out}`);
    if (bare.code !== 2) problems.push(`no argument: exit ${bare.code}`);
    return problems.length === 0 || problems.join("; ");
  });

test("skill-creator's own folder keeps its rules, and the summary line prints every limit the script holds",
  "the budgets table gives a writer the reasons and sends them to the script for the numbers, so a limit the summary leaves out is a limit no writer sees",
  async () => {
    const r = await spawnNode([CHECK, DIR], { killAfterMs: 30_000 }).done;
    const numbers = [LIMITS.name, LIMITS.description, LIMITS.listing, LIMITS.bodyLines - 1, LIMITS.reattached, LIMITS.preview + 1];
    const missing = numbers.filter((x) => !new RegExp(`(?:/| )${x}\\b`).test(r.out));
    return (r.code === 0 && missing.length === 0) || `exit ${r.code}; the summary lacks ${missing.join(", ") || "nothing"}: ${r.out}`;
  });

const failed = await runCases(CASES);
process.exit(summarize(failed, CASES.length));
