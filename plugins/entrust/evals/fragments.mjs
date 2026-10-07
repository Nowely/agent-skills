#!/usr/bin/env node
// The text two skill pages share, held once: each fragment has one source and its copies, and a copy that
// differs from its source is drift.
//
//   node evals/fragments.mjs --check    one DRIFT= line per copy that differs, exit 1; exit 0 when none
//   node evals/fragments.mjs --list     the fragments and their copies
//
// A literal is restored by the page's writer.
// fragments.test.mjs runs --check, and run-all runs that suite before the release gate.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const PLUGIN = path.join(path.dirname(HERE), "plugin");

export const FRAGMENTS = [
  {
    id: "run-directory",
    kind: "literal",
    text: "`<state>/orchestrate/<project-slug>/<run>/`",
    copies: ["skills/codex/references/orchestration.md", "skills/swarm/SKILL.md", "skills/prepare-feedback/SKILL.md"],
  },
];

const read = (root, rel) => fs.readFileSync(path.join(root, rel), "utf8");

// Every problem as { fragment, copy, why }, none when the copies agree with their sources.
export function check(root = PLUGIN, fragments = FRAGMENTS) {
  const drift = [];
  const add = (f, copy, why) => drift.push({ fragment: f.id, copy, why });
  for (const f of fragments) {
    if (f.kind === "literal") {
      for (const c of f.copies) {
        let page = "";
        try { page = read(root, c); } catch { add(f, c, "missing"); continue; }
        if (!page.includes(f.text)) add(f, c, `no longer carries ${f.text}`);
      }
    }
  }
  return drift;
}

const isMain = (() => {
  try { return fs.realpathSync(process.argv[1] ?? "") === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
})();

if (isMain) {
  const mode = process.argv[2];
  if (mode === "--list") {
    for (const f of FRAGMENTS)
      console.log(`${f.id} (${f.kind}): ${`${f.source ?? f.text} -> ${f.copies.join(", ")}`}`);
    process.exit(0);
  }
  if (mode !== "--check") {
    console.log("usage: node evals/fragments.mjs --check | --list");
    process.exit(2);
  }
  const drift = check();
  for (const d of drift) console.log(`DRIFT=${d.fragment}: ${d.copy}: ${d.why}`);
  console.log(drift.length ? `${drift.length} copies drifted` : `OK=${FRAGMENTS.length} fragments, every copy equal to its source`);
  process.exit(drift.length ? 1 : 0);
}
