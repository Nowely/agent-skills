#!/usr/bin/env node
// Do the copies of shared page text still equal their one source, and does the check bite?
//
//   node evals/fragments.test.mjs
//
// evals/fragments.mjs holds the five-field schema copied into the swarm page and the external
// state path shared by the adapter and its dependent features. One case per fragment runs the check on this tree. The mutation cases run it on a
// scratch copy of the pages with one word changed, because a drift check that stays green under a changed
// word is measuring nothing (#15 P12b asks for the release to fail on drift, and run-all runs this suite).

import fs from "node:fs";
import path from "node:path";
import { registry, runCases, summarize, tempDir } from "./lib/harness.mjs";
import { FRAGMENTS, PLUGIN, check, write } from "./fragments.mjs";

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

test("mutation: a size cap changed in a page's inline schema is red, and --write puts the source back on that one line",
  "D16's caps are enforced from the schema file; a page whose inline copy says another cap tells the coordinator a bound the driver does not hold",
  () => {
    const root = scratch();
    const f = byId("five-field-schema");
    write(root, [f]);
    const page = "skills/swarm/SKILL.md";
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
