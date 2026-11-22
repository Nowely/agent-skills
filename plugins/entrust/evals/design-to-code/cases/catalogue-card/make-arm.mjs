#!/usr/bin/env node
// Makes one arm of the catalogue card: node make-arm.mjs <dir>
//
// The arm gets the start project and the design pack in design/, and the brief as .brief.md for
// ../../harness/arm.mjs prepare. Never reference/, judge/ or this folder's RUN.md.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target) { console.error("usage: make-arm.mjs <dir>"); process.exit(2); }
const dir = path.resolve(target);
if (fs.existsSync(dir) && fs.readdirSync(dir).length) { console.error(`${dir} is not empty`); process.exit(2); }
fs.cpSync(path.join(HERE, "project"), dir, { recursive: true });
fs.cpSync(path.join(HERE, "pack"), path.join(dir, "design"), { recursive: true });
fs.copyFileSync(path.join(HERE, "brief.md"), path.join(dir, ".brief.md"));
console.log(`arm in ${dir}; next: node ${path.relative(process.cwd(), path.join(HERE, "../../harness/arm.mjs"))} prepare ${target} --skill <commit>`);
