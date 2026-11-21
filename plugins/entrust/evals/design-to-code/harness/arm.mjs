#!/usr/bin/env node
// One arm of a design-to-code run, without a coordinating agent.
//
//   node arm.mjs prepare <arm> --skill <commit> [--repo <path>]  put that version of the skill in <arm>/.skill and
//                                                                write <arm>/.prompt.md (the brief plus the skill)
//   node arm.mjs freeze <arm>                                     after the worker's first handoff: archive the arm,
//                                                                record its hash and the status the evidence file
//                                                                opens with, and say whether it handed over on fail
//
// The worker is started by hand on the prompt, for example with Codex:
//   codex exec --cd <arm> "$(cat <arm>/.prompt.md)"
// with the sandbox allowing writes in <arm> and a local Chromium; check the flags against the installed Codex. Before
// the first arm, run the skill's check on a public case inside that same sandbox: a sandbox that cannot launch
// Chromium makes the worker skip the check, which would be read as the skill's failure.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [command, target, ...rest] = process.argv.slice(2);
const flag = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };
const arm = target && path.resolve(target);
if (!["prepare", "freeze"].includes(command) || !arm) { console.error("usage: arm.mjs prepare <arm> --skill <commit> | freeze <arm>"); process.exit(2); }

if (command === "prepare") {
  const commit = flag("skill"), repo = path.resolve(flag("repo") ?? path.join(HERE, "../../../../.."));
  if (!commit) { console.error("--skill <commit> names the version under test"); process.exit(2); }
  const skill = path.join(arm, ".skill");
  fs.rmSync(skill, { recursive: true, force: true });
  fs.mkdirSync(skill, { recursive: true });
  const tar = execFileSync("git", ["-C", repo, "archive", commit, "plugins/entrust/plugin/skills/design-to-code"]);
  execFileSync("tar", ["-x", "-C", skill, "--strip-components", "4"], { input: tar });
  const full = execFileSync("git", ["-C", repo, "rev-parse", commit], { encoding: "utf8" }).trim();
  const brief = fs.existsSync(path.join(arm, ".brief.md")) ? fs.readFileSync(path.join(arm, ".brief.md"), "utf8").trim() : "(put the task's brief in .brief.md before preparing)";
  fs.writeFileSync(path.join(arm, ".prompt.md"), `${brief}\n\nUse the design-to-code skill: read ${path.join(skill, "design-to-code", "SKILL.md")} first and follow it; its script is ${path.join(skill, "design-to-code", "scripts", "design.mjs")}.\n`);
  fs.writeFileSync(path.join(arm, ".arm.json"), `${JSON.stringify({ skill: full, prepared: new Date().toISOString() }, null, 2)}\n`);
  console.log(`skill ${full.slice(0, 10)} in ${skill}; prompt in ${path.join(arm, ".prompt.md")}`);
}

if (command === "freeze") {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const archive = `${arm}.${stamp}.tar`;
  execFileSync("tar", ["-cf", archive, "-C", path.dirname(arm), path.basename(arm)]);
  const hash = createHash("sha256").update(fs.readFileSync(archive)).digest("hex");
  const handoff = (() => {
    const found = [];
    const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (["node_modules", ".git", ".skill"].includes(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else if (e.name === "handoff.md") found.push(p);
    } };
    walk(arm);
    return found.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  })();
  const status = handoff ? fs.readFileSync(handoff, "utf8").split("\n")[0] : "no evidence file: the complete check was not run last";
  const record = { frozen: new Date().toISOString(), archive, sha256: hash, evidence: handoff ?? null, status,
    handedOverOnFail: /^Status: fail/.test(status) };
  fs.writeFileSync(`${archive}.json`, `${JSON.stringify(record, null, 2)}\n`);
  console.log(`${archive} · sha256 ${hash.slice(0, 12)} · ${status}`);
}
