// D9: a pinned claim's citation that stopped resolving, and the ratchet that does not notice.
// Usage: node rot-check.mjs   (paths are absolute; run from anywhere)
import fs from "node:fs"; import { spawnSync } from "node:child_process";
const R="$TMPDIR/terse/runs/20260922-233021-terse-readme";
const S="~/Git/agent-skills/plugins/terse/skills/rewrite/scripts";
const old=JSON.parse(fs.readFileSync(`${R}/ledger.04.json`,"utf8")).find(e=>e.name.startsWith("R02e"));
const r=spawnSync("/bin/sh",["-c",old.run],{cwd:R,encoding:"utf8"});
console.log("R02e as written in round 02, run today: expect matches:", new RegExp(old.expect).test((r.stdout||"")+(r.stderr||"")));
const l=spawnSync("node",[`${S}/ledger.mjs`,`${R}/ledger.04.json`,`${R}/00-original.md`,`${R}/01-candidate.md`,`${R}/02-grafts.md`,`${R}/03-review.md`],{cwd:R,encoding:"utf8"});
console.log("ledger.mjs over the ledger that holds that entry, rounds 00-03: exit", l.status, "|", (l.stdout||"").trim().split("\n").pop());
for(const c of ["f677303","1af4160","b7a17da"]){const g=spawnSync("git",["-C","~/Git/agent-skills","show",`${c}:ISSUES.md`],{encoding:"utf8"}).stdout.split("\n");console.log(c,"ISSUES.md:183 begins:",JSON.stringify((g[182]||"").slice(0,50)));}
