#!/usr/bin/env node
// Does skills/skill-creator/scripts/check.mjs fail each of its rules on a skill that breaks it, pass a skill that
// breaks none, and state the numbers its page states?
//
//   node evals/skill-check.test.mjs
//
// Each red case plants one violation in a copy of a clean skill and names the rule that must fail; the clean copy
// is the control, so a rule that fails without its violation fails here too. The next cases run the command line
// and hold the summary line against the script's numbers. The last cases are the preservation list of `--against`:
// each edits a copy of a small skill and says which lines of the copy before the edit must be listed as lost.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const DIR = path.join(ROOT, "skills", "skill-creator");
const CHECK = path.join(DIR, "scripts", "check.mjs");
const { LIMITS, preserved, rules, skillAt } = await import(CHECK);
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
    expect("a link out of the installed folders", plant({ "SKILL.md": page(`name: sample\n${DESC}`, "Read [the table](references/table.md) and [the notes](../../notes.md).\n") }), [8, 12]),
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
    if (clean.code !== 0 || !/^ok {4}.*12 of 12 rules passed/m.test(clean.out)) problems.push(`clean: exit ${clean.code}: ${clean.out}`);
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

// ---- The preservation list
const EFFORT = "# Effort\n\nThe table says which effort a role gets, and you will recieve it with the brief.\n"
  + "Read [the models](models.md) before you choose one for a refuter.\n\n"
  + "| Effort | Use |\n|---|---|\n| `low` | fact lookup |\n| `high`, `xhigh` | refutation, competing designs |\n";
const BEFORE = {
  "SKILL.md": page(`name: sample\n${DESC}`, "Read [the effort table](references/effort.md) and [the models](references/models.md).\n"),
  "references/effort.md": EFFORT,
  "references/models.md": "# Models\n\nA refuter runs at `xhigh` on the strongest model the host offers.\n",
};
// The skill before an edit, and beside it the same skill with `edit` laid over it and a run directory for `notes`;
// `was` is laid over both, for a case whose state before the edit differs from BEFORE.
function edited(edit, notes = {}, was = {}) {
  const top = path.join(TMP, String(++n));
  const put = (dir, files) => Object.entries(files).forEach(([rel, text]) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), text);
  });
  put(path.join(top, "before", "sample"), { ...BEFORE, ...was });
  put(path.join(top, "after", "sample"), { ...BEFORE, ...was, ...edit });
  put(path.join(top, "run"), notes);
  return { dir: path.join(top, "after", "sample"), base: path.join(top, "before", "sample"), run: path.join(top, "run") };
}
const lostIn = (what, t, want, dispositions) => {
  const r = preserved(t.dir, t.base, dispositions && path.join(t.run, dispositions));
  const got = r.lost.map((c) => c.id);
  return JSON.stringify(got) === JSON.stringify(want) || `${what}: wanted lost [${want}], got [${got}] ${r.problems.join("; ")}`;
};
const LOW = "references/effort.md:8";
const noLow = { "references/effort.md": EFFORT.replace("| `low` | fact lookup |\n", "") };
const lowMoved = { ...noLow, "references/models.md": BEFORE["references/models.md"] + "\nLooking a fact up needs no more than `low`.\n" };

test("a table row cut from a skill is listed as lost, and an edit that keeps every line lists none",
  "both sessions that followed the page dropped rows of a table while merging two files, and nothing listed them",
  () => all(
    lostIn("no edit", edited({}), []),
    lostIn("a row cut", edited(noLow), [LOW]),
    lostIn("a row moved to another file in the same words", edited({ ...noLow,
      "references/models.md": BEFORE["references/models.md"] + "\n| `low` | fact lookup |\n" }), []),
    lostIn("a paragraph wrapped at another place", edited({ "references/effort.md":
      EFFORT.replace("a role gets, and you", "a role gets,\nand you").replace("with the brief.\nRead", "with the brief. Read") }), []),
    lostIn("a file deleted", edited({ "SKILL.md": page(`name: sample\n${DESC}`, "Read [the effort table](references/effort.md).\n"),
      "references/models.md": "" }), ["SKILL.md:6", "references/models.md:3"]),
  ));

test("a corrected word and a corrected link list no line, and a word changed into another that the skill still uses is listed",
  "the route for a typo or a link runs this list, so an edit of that kind that listed a line would have no route left; a slip that passed a changed value would hide the loss the list is for",
  () => all(
    lostIn("a typo fixed", edited({ "references/effort.md": EFFORT.replace("recieve", "receive") }), []),
    lostIn("a link fixed", edited({ "references/effort.md": EFFORT.replace("(models.md)", "(../references/models.md)") }), []),
    lostIn("a value one letter away", edited({ "references/effort.md": EFFORT.replace("`high`, `xhigh`", "`high`, `high`") }), ["references/effort.md:9"]),
    lostIn("a word replaced", edited({ "references/effort.md": EFFORT.replace("fact lookup", "fact checks") }), [LOW]),
  ));

test("a lost line passes only with a disposition whose quote stands at the place it names",
  "a session wrote that it had dropped the rows and went on; an answer that nothing checks is that sentence again",
  async () => {
    const moved = `moved | ${LOW} | references/models.md:5 | Looking a fact up needs no more than \`low\`.\n`;
    const said = "Drop the low row, nobody uses it.\n";
    const cli = async (t, dispositions) => {
      const r = await spawnNode([CHECK, t.dir, "--against", t.base, ...(dispositions ? ["--dispositions", path.join(t.run, dispositions)] : [])],
        { killAfterMs: 30_000 }).done;
      return `${r.code} ${r.out}`;
    };
    const unanswered = await cli(edited(lowMoved));
    const answered = await cli(edited(lowMoved, { "d.md": moved }), "d.md");
    const wrongQuote = await cli(edited(lowMoved, { "d.md": moved.replace("no more than", "at most") }), "d.md");
    const freeWord = await cli(edited(noLow, { "d.md": `dropped | ${LOW} | not needed\n` }), "d.md");
    return all(
      /^1 /.test(unanswered) && unanswered.includes(`LOST  ${LOW}: | \`low\` | fact lookup |`) || `unanswered: ${unanswered}`,
      /^0 /.test(answered) && /0 line\(s\) lost, 1 answered/.test(answered) || `answered: ${answered}`,
      /^1 /.test(wrongQuote) && /BAD .*the quote is not at references\/models\.md:5/.test(wrongQuote) || `wrong quote: ${wrongQuote}`,
      /^1 /.test(freeWord) && /BAD .*line 1 is neither/.test(freeWord) || `free word: ${freeWord}`,
      lostIn("a quote that shares no word with the line", edited(lowMoved, { "d.md":
        `moved | ${LOW} | references/models.md:3 | A refuter runs at \`xhigh\` on the strongest model\n` }), [LOW], "d.md"),
      lostIn("a copy that contradicted its owner, answered with the owner's line", edited({
        "references/effort.md": EFFORT.replace("| `high`, `xhigh` | refutation, competing designs |\n", ""),
      }, { "d.md": "moved | references/effort.md:9 | references/models.md:3 | `medium` for review, refutation and judgement\n" },
      { "references/models.md": "# Models\n\nThe strong model runs at `medium` for review, refutation and judgement.\n" }), [], "d.md"),
      lostIn("retired by the user's saved words", edited(noLow, { "messages.md": said,
        "d.md": `retired | ${LOW} | messages.md:1 | Drop the low row, nobody uses it.\n` }), [], "d.md"),
      lostIn("retired by words the user did not write", edited(noLow, { "messages.md": said,
        "d.md": `retired | ${LOW} | messages.md:1 | The low row is not needed any more.\n` }), [LOW], "d.md"),
      lostIn("retired by words that stand in the skill", edited(noLow, {
        "d.md": `retired | ${LOW} | ../after/sample/references/models.md:3 | A refuter runs at \`xhigh\` on the strongest model\n` }), [LOW], "d.md"),
    );
  });

test("a revision of a git repository serves as the state before the edit",
  "a skill kept in a repository has its earlier state there, and a run that had to copy the folder first would skip the step",
  () => {
    const t = edited({});
    const git = (...args) => execFileSync("git", ["-C", t.base, "-c", "user.name=t", "-c", "user.email=t@example.com",
      "-c", "commit.gpgsign=false", ...args], { stdio: "ignore" });
    git("init", "-q");
    git("add", ".");
    git("commit", "-q", "-m", "before");
    fs.writeFileSync(path.join(t.base, "references", "effort.md"), noLow["references/effort.md"].replace("recieve", "receive"));
    const got = preserved(t.base, "HEAD").lost.map((c) => c.id);
    return JSON.stringify(got) === JSON.stringify([LOW]) || `wanted [${LOW}], got [${got}]`;
  });

const failed = await runCases(CASES);
process.exit(summarize(failed, CASES.length));
