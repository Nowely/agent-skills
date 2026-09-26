#!/usr/bin/env node
// Every check is tested against a planted violation before its output is believed. Exit 1 on any miss.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { execFileSync } from "node:child_process";
const here = path.dirname(new URL(import.meta.url).pathname);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "terse-selftest."));
const run = (script, args) => { try { return { code: 0, out: execFileSync("node", [path.join(here, script), ...args], { encoding: "utf8" }) }; }
                                catch (e) { return { code: e.status, out: String(e.stdout) }; } };
let failed = 0;
const check = (name, ok) => { console.log(`${ok ? "ok  " : "MISS"} ${name}`); if (!ok) failed++; };
// sections
const d = path.join(tmp, "d.md");
fs.writeFileSync(d, "## A\nan agent that ran\nnothing\n## B\nran nothing\n## C\nran nothing\n## D\nunrelated\n");
const s = run("sections.mjs", [d]);
check("sections counts per heading", /^\s*2 B$/m.test(s.out) && /TOTAL/.test(s.out));
const bj = path.join(tmp, "b.json"); fs.writeFileSync(bj, JSON.stringify({ A: 10, B: 1, C: 5, D: 5 }));
const sb = run("sections.mjs", [d, bj]);
check("sections reports a section over its budget and still exits 0", /\+1\s+B/.test(sb.out) && sb.code === 0);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `\n${failed} check(s) MISSED` : "\nall checks caught their planted violation");
process.exit(failed ? 1 : 0);
