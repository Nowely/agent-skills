#!/usr/bin/env node
// Do the copies of shared page text still equal their one source, and does the check bite?
//
//   node evals/fragments.test.mjs
//
// evals/fragments.mjs holds the external state path shared by the adapter and its dependent features. One case per fragment runs the check on this tree. The mutation cases run it on a
// scratch copy of the pages with one word changed, because a drift check that stays green under a changed
// word is measuring nothing (#15 P12b asks for the release to fail on drift, and run-all runs this suite).

import fs from "node:fs";
import path from "node:path";
import { registry, runCases, summarize, tempDir } from "./lib/harness.mjs";
import { FRAGMENTS, PLUGIN, check } from "./fragments.mjs";

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
