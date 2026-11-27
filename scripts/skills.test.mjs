#!/usr/bin/env node
// Do the plugins' skill pages keep the mechanical rules for a skill?
//
//   node scripts/skills.test.mjs
//
// Reads every plugins/*/plugin/skills/*/SKILL.md and the markdown files each one reaches by relative links
// inside its plugin's plugin/ directory; run it after an edit to any of them. The rules and their numbers are
// owned by entrust's rnd, whose checker this suite imports:
// plugins/entrust/plugin/skills/rnd/scripts/check.mjs. A change to a rule is therefore a change to
// entrust's installed files. The vendor rows rules 1 to 7 were first taken from are quoted in the research run
// plugins/terse/research/2026-09-28-vendor-guides/ (s1-sources.md, m1-map.md).
//
// This file owns what is this repository's: which skills are read, and a walk that covers a whole plugin, so
// that a page two skills share is held to the rules. A plugin's README.md, the human install page, is checked as
// a link target and not followed; agent files (plugins/*/plugin/agents/*.md) are not read; a file under another
// skill's directory is not followed, being one level from its own SKILL.md.
//
// Every violation fails its rule; no list excuses one.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rules, skillAt } from "../plugins/entrust/plugin/skills/rnd/scripts/check.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const inside = (dir, p) => p.startsWith(dir + path.sep);

const skills = fs.readdirSync(path.join(ROOT, "plugins"), { withFileTypes: true })
  .filter((p) => p.isDirectory() && fs.existsSync(path.join(ROOT, "plugins", p.name, "plugin/skills")))
  .flatMap((p) => {
    const plugin = path.join(ROOT, "plugins", p.name, "plugin");
    const agent = (dest) => inside(path.join(plugin, "agents"), dest);
    return fs.readdirSync(path.join(plugin, "skills"), { withFileTypes: true })
      .filter((s) => s.isDirectory() && fs.existsSync(path.join(plugin, "skills", s.name, "SKILL.md")))
      .map((s) => {
        const dir = path.join(plugin, "skills", s.name);
        return skillAt(dir, {
          bound: plugin,
          installed: plugin,
          skips: agent,
          follows: (dest) => inside(plugin, dest) && path.basename(dest) !== "README.md" && !agent(dest)
            && (!inside(path.join(plugin, "skills"), dest) || inside(dir, dest)),
        });
      });
  });

const { found, pages } = rules(skills, rel);
let failed = 0;
for (const [n, name, list] of found) {
  if (list.length === 0) console.log(`ok    ${n}. ${name}`);
  else { failed++; console.log(`FAIL  ${n}. ${name}\n      ${list.join("\n      ")}`); }
}
console.log(`${pages.length} pages read, ${skills.length} skills; ${found.length - failed} of ${found.length} passed`);
process.exit(failed ? 1 : 0);
