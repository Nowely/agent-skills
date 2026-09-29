#!/usr/bin/env node
// Do the copies of shared page text still equal their one source, and does the check bite?
//
//   node evals/fragments.test.mjs
//
// evals/fragments.mjs holds the fragments: the codex page's composition rules and rights table, generated
// into orchestrate/references/codex-composition.md so a plan with no Codex agent never loads the codex page
// (#15 F18); the five-field schema the plugin ships, copied inline into two pages; the run-directory path
// four pages name. One case per fragment runs the check on this tree. The mutation cases run it on a
// scratch copy of the pages with one word changed, because a drift check that stays green under a changed
// word is measuring nothing (#15 P12b asks for the release to fail on drift, and run-all runs this suite).

import fs from "node:fs";
import path from "node:path";
import { registry, runCases, summarize, tempDir } from "./lib/harness.mjs";
import { FRAGMENTS, PLUGIN, check, extract, generate, relink, write } from "./fragments.mjs";

const { cases: CASES, test } = registry();
const byId = (id) => FRAGMENTS.find((f) => f.id === id);
const say = (drift) => drift.map((d) => `${d.fragment}: ${d.copy}: ${d.why}`).join("; ");

// Every file a fragment names, copied under a scratch root with the same layout.
function scratch() {
  const root = tempDir("fragments-test-");
  const files = new Set(FRAGMENTS.flatMap((f) => [f.copy, f.source, f.linkedFrom, ...(f.copies ?? []), ...(f.sources ?? []).map((s) => s.file), ...(f.rows ?? []).map((r) => r.page)]).values());
  for (const rel of [...files].filter(Boolean)) {
    const to = path.join(root, rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(PLUGIN, rel), to);
  }
  return root;
}
const edit = (root, rel, from, to) => {
  const p = path.join(root, rel);
  const text = fs.readFileSync(p, "utf8");
  if (!text.includes(from)) throw new Error(`${rel} does not contain ${JSON.stringify(from)}`);
  fs.writeFileSync(p, text.replace(from, to));
};

for (const f of FRAGMENTS)
  test(`${f.id}: every copy equals its source in this tree`,
    "a copy that drifted is a page telling the coordinator something its source no longer says",
    () => {
      const drift = check(PLUGIN, [f]);
      return drift.length === 0 || say(drift);
    });

test("the generated reference is what the generator writes, and each of its blocks is its source section verbatim",
  "the markers are what make a hand edit findable: each block names its source, and its body must be that section, word for word",
  () => {
    const f = byId("codex-composition");
    const have = fs.readFileSync(path.join(PLUGIN, f.copy), "utf8");
    const problems = [];
    if (have !== generate(f)) problems.push("the file is not the generator's output");
    const blocks = [...have.matchAll(/<!-- fragment codex-composition (\d+): [^>]*-->\n([\s\S]*?)\n<!-- \/fragment -->/g)];
    if (blocks.length !== f.sources.length) problems.push(`${blocks.length} marked blocks, ${f.sources.length} sources`);
    for (const [, n, body] of blocks) {
      const s = f.sources[Number(n) - 1];
      const src = fs.readFileSync(path.join(PLUGIN, s.file), "utf8");
      if (body !== relink(extract(src, s), s.file, f.copy)) problems.push(`block ${n} is not ${s.file} ${s.heading}`);
    }
    if (!/^\| nothing \|/m.test(have)) problems.push("the composition table's \"nothing\" row is missing");
    if (!/^\| `RIGHTS: read \[<dir>\]` or no header \|/m.test(have)) problems.push("the rights table's read row is missing");
    return problems.length === 0 || problems.join("; ");
  });

test("every relative link in the generated reference resolves from its own directory",
  "a section copied into another directory keeps its links only if the generator rewrites them",
  () => {
    const f = byId("codex-composition");
    const file = path.join(PLUGIN, f.copy);
    const bad = [...fs.readFileSync(file, "utf8").matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1].split("#")[0])
      .filter((t) => t && !/^[a-z]+:/i.test(t) && !fs.existsSync(path.resolve(path.dirname(file), t)));
    const moved = relink("see [x](references/parity.md#a) and [y](#header-fields)", "skills/codex/SKILL.md", f.copy);
    const want = "see [x](../../codex/references/parity.md#a) and [y](../../codex/SKILL.md#header-fields)";
    return (bad.length === 0 && moved === want) || `unresolved: ${bad.join(", ") || "none"}; relinked: ${moved}`;
  });

test("mutation: one word changed in the generated copy is red",
  "the whole point of a generated copy is that a hand edit to it cannot pass",
  () => {
    const root = scratch();
    edit(root, byId("codex-composition").copy, "exactly one", "exactly two");
    const drift = check(root, [byId("codex-composition")]);
    return drift.some((d) => /differs from its source at line \d+/.test(d.why)) || `still green: ${say(drift) || "no drift"}`;
  });

test("mutation: one word changed in the source is red until --write regenerates the copy",
  "a source edited without regenerating leaves the copy stale, which is the drift P12b names; --write is the one repair",
  () => {
    const root = scratch();
    edit(root, "skills/codex/SKILL.md", "| “half codex” | half the agents, rounded up |", "| “half codex” | half the agents, rounded down |");
    const before = check(root, [byId("codex-composition")]);
    const wrote = write(root, [byId("codex-composition")]);
    const after = check(root, [byId("codex-composition")]);
    const copy = fs.readFileSync(path.join(root, byId("codex-composition").copy), "utf8");
    return (before.length > 0 && wrote.length === 1 && after.length === 0 && copy.includes("rounded down"))
      || `before ${say(before) || "green"}; wrote ${wrote.join(", ") || "nothing"}; after ${say(after) || "green"}`;
  });

test("mutation: the row the orchestrate page says it replaces, gone from the source, is red",
  "the orchestrate page replaces the \"nothing\" row of the sibling's table; a table that lost the row makes that sentence point at nothing",
  () => {
    const root = scratch();
    edit(root, "skills/codex/SKILL.md", "| nothing |", "| silence |");
    write(root, [byId("codex-composition")]);
    const drift = check(root, [byId("codex-composition")]);
    return drift.some((d) => /the "nothing" row of a table whose source has no such row/.test(d.why)) || `still green: ${say(drift) || "no drift"}`;
  });

test("mutation: an orchestrate page that stops linking the reference is red",
  "a generated copy nothing links is a file no coordinator reads, and the plan falls back on loading the whole codex page",
  () => {
    const root = scratch();
    edit(root, "skills/orchestrate/SKILL.md", "](references/codex-composition.md", "](references/other.md");
    const drift = check(root, [byId("codex-composition")]);
    return drift.some((d) => /does not link references\/codex-composition\.md/.test(d.why)) || `still green: ${say(drift) || "no drift"}`;
  });

test("mutation: a size cap changed in a page's inline schema is red, and --write puts the source back on that one line",
  "D16's caps are enforced from the schema file; a page whose inline copy says another cap tells the coordinator a bound the driver does not hold",
  () => {
    const root = scratch();
    const f = byId("five-field-schema");
    write(root, [f]);
    const page = "skills/orchestrate/SKILL.md";
    const text = fs.readFileSync(path.join(root, page), "utf8");
    const m = f.locate.exec(text);
    if (!m) return `${page} carries no inline schema`;
    const mutated = m[1].replace(/"maxItems":(\d+)/, (_, n) => `"maxItems":${Number(n) + 1}`);
    if (mutated === m[1]) return `the inline schema of ${page} carries no maxItems to mutate`;
    fs.writeFileSync(path.join(root, page), text.replace(m[1], mutated));
    const red = check(root, [f]);
    const others = text.split("\n").length;
    write(root, [f]);
    const after = fs.readFileSync(path.join(root, page), "utf8");
    const green = check(root, [f]);
    return (red.some((d) => d.copy === page) && green.length === 0 && after.split("\n").length === others && after === text)
      || `mutated: ${say(red) || "green"}; after --write: ${say(green) || "green"}, page ${after === text ? "restored" : "changed elsewhere"}`;
  });

test("mutation: a page that loses the run-directory path is red",
  "four pages name one directory the launcher and cleanup walk; a page that renamed it sends agents' reports where nothing looks",
  () => {
    const root = scratch();
    edit(root, "skills/swarm/SKILL.md", "`<state>/orchestrate/<project-slug>/<run>/`", "`<state>/runs/<run>/`");
    const drift = check(root, [byId("run-directory")]);
    return drift.some((d) => d.copy === "skills/swarm/SKILL.md") || `still green: ${say(drift) || "no drift"}`;
  });

const failed = await runCases(CASES);
process.exit(summarize(failed, CASES.length));
