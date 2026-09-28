#!/usr/bin/env node
// Round 02 (sent back): a grep that keeps `saw` under the ledger's 2000 characters. For one line range of
// one file, prints each given literal as that range holds it — whitespace-normalised and with a leading
// blockquote marker (`> `) dropped from each line, so a sentence the file wraps still counts — prefixed by
// the file and the range; a literal the range does not hold prints NOT FOUND. Files under
// plugins/terse/skills/ are printed without that prefix, other checkout files from the checkout's root,
// run-directory files as R/. Reads only.
// Usage: node quote.mjs FILE A-B "literal" ["literal" ...]
import fs from "node:fs";
import path from "node:path"; import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../../../..");
const [file, range, ...lits] = process.argv.slice(2);
const [a, b] = range.split("-").map(Number);
const flat = fs.readFileSync(file, "utf8").split("\n").slice(a - 1, b).map((l) => l.replace(/^\s*> ?/, "")).join("\n").replace(/\s+/g, " ");
const short = file.replace(REPO + "/plugins/terse/skills/", "").replace(REPO + "/", "")
  .replace(/^.*\/terse\/runs\/20260924-002235-terse-readme-rewrite2\//, "R/");
for (const l of lits) {
  const n = l.replace(/\s+/g, " ");
  console.log(flat.includes(n) ? `${short}:${a}-${b}: ${n}` : `NOT FOUND in ${short}:${a}-${b}: ${n}`);
}
