#!/usr/bin/env node
// Makes one arm of the planted server card: node make-arm.mjs <dir> [--prebuilt]
//
// The arm gets the start project with the planted references in design/, and the brief as .brief.md for
// ../../harness/arm.mjs prepare. Never plant/, grade.mjs, rounds.mjs or this folder's README.
//
// --prebuilt starts it where an earlier session left it (for the capped Terra dry run): iteration 6's c282a build,
// its check set up in .design/card with the frames' specs transcribed from the planted references, an empty ledger
// and no history. The brief then says to continue from there.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [target, ...flags] = process.argv.slice(2);
if (!target || flags.some((f) => f !== "--prebuilt")) { console.error("usage: make-arm.mjs <dir> [--prebuilt]"); process.exit(2); }
const prebuilt = flags.includes("--prebuilt");
const dir = path.resolve(target);
if (fs.existsSync(dir) && fs.readdirSync(dir).length) { console.error(`${dir} is not empty`); process.exit(2); }
fs.cpSync(path.join(HERE, "project"), dir, { recursive: true });
fs.copyFileSync(path.join(HERE, "brief.md"), path.join(dir, ".brief.md"));
if (prebuilt) {
  fs.cpSync(path.join(HERE, "prebuilt"), dir, { recursive: true });
  fs.appendFileSync(path.join(dir, ".brief.md"), `\nAn earlier session built the card and set up its check in \`.design/card/\` (\`design.json\`, the frames' specs from \`design/\`, \`review.md\`); it has not checked the build against these references yet. Continue from there: check it, fix or propose what the check finds, and hand over.\n`);
}
console.log(`arm in ${dir}; next: node ${path.relative(process.cwd(), path.join(HERE, "../../harness/arm.mjs"))} prepare ${target} --skill <commit>`);
