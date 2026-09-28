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
const zh = path.join(tmp, "zh.md"); fs.writeFileSync(zh, "## 介绍\n这是一个没有空格的中文句子。\n");
check("sections counts words in a script without spaces", /^\s*([2-9]|\d{2,}) 介绍$/m.test(run("sections.mjs", [zh]).out));
const fe = path.join(tmp, "fe.md"); fs.writeFileSync(fe, "## A\none two\n```\n## Not a heading\n```\n## B\nthree\n");
check("sections takes no heading from inside a fenced block", !/Not a heading$/m.test(run("sections.mjs", [fe]).out));
const d2 = path.join(tmp, "d2.md");
fs.writeFileSync(d2, "## A\nan agent that ran\nnothing\n## B\nran nothing at all\n## C renamed\nran nothing\n");
const s2 = run("sections.mjs", [d, d2]);
check("sections shows a section that grew and still exits 0", /\+2\s+B$/m.test(s2.out) && s2.code === 0);
check("sections marks a renamed and a removed section", /C renamed\s+\(only after\)/.test(s2.out)
  && /^\s*2\s+-\s+C\s+\(only before\)/m.test(s2.out) && /D\s+\(only before\)/.test(s2.out)
  && /1 section\(s\) grew, 3 in one version only/.test(s2.out));
fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `\n${failed} check(s) MISSED` : "\nall checks caught their planted violation");
process.exit(failed ? 1 : 0);
