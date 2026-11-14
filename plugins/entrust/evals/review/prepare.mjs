#!/usr/bin/env node
// Build one blind review run: a throwaway git repository holding a change, and its reviewer's prompt.
//
//   node evals/review/prepare.mjs <case> <head|clean> [skill-directory]
//
// <case> is a directory under cases/. The repository gets two commits, the case's base/ and then the named
// variant: head/ is the change as it was first written, clean/ the change as it should be. The reviewer is not
// told which it has; the change under review is HEAD against HEAD~1. A supplied skill package is copied
// separately from the identical user prompt. The other variant, rubric and acceptance checks are not copied.

import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CASES = path.join(path.dirname(fileURLToPath(import.meta.url)), "cases");
export const VARIANTS = ["head", "clean"];
export const isMain = (meta) => Boolean(process.argv[1]) && fs.realpathSync(process.argv[1]) === fileURLToPath(meta.url);

// A fixed identity and date, and none of the machine's signing or hooks: the same case gives the same commits.
// No background housekeeping either: a commit may start one that repacks .git/objects while the run is being copied.
const GIT = ["-c", "user.name=author", "-c", "user.email=author@example.invalid", "-c", "commit.gpgsign=false",
  "-c", "core.hooksPath=/dev/null", "-c", "gc.auto=0", "-c", "maintenance.auto=false"];
const DATE = "2026-01-01T00:00:00Z";

export function reviewerPrompt() {
  return [
    "Review the change.",
    "",
    "Repository: .",
    "Change: HEAD~1..HEAD",
    "Task: ../brief.md",
  ].join("\n");
}

// Hash relative paths and contents, with byte lengths to delimit entries unambiguously.
export function packageDigest(directory) {
  const root = fs.lstatSync(directory);
  if (root.isSymbolicLink()) throw new Error(`skill package is a symbolic link: ${directory}`);
  if (!root.isDirectory()) throw new Error(`skill package must be a directory: ${directory}`);
  const hash = crypto.createHash("sha256");
  const visit = (relative) => {
    const file = path.join(directory, relative), stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error(`skill package contains a symbolic link: ${file}`);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(file).sort()) visit(path.join(relative, entry));
    } else if (stat.isFile()) {
      const name = relative.split(path.sep).join("/"), content = fs.readFileSync(file);
      hash.update(`${Buffer.byteLength(name)}:`).update(name).update(`${content.length}:`).update(content);
    } else throw new Error(`skill package contains a non-file entry: ${file}`);
  };
  visit("");
  const entry = path.join(directory, "SKILL.md");
  if (!fs.existsSync(entry) || !fs.lstatSync(entry).isFile()) throw new Error(`skill package has no SKILL.md file: ${directory}`);
  return hash.digest("hex");
}

export function prepare(caseName, variant, skillDirectory, expectedDigest) {
  const source = path.join(CASES, caseName);
  if (!fs.existsSync(path.join(source, "brief.md"))) throw new Error(`no case named ${caseName} under ${CASES}`);
  if (!VARIANTS.includes(variant)) throw new Error(`variant is ${VARIANTS.join(" or ")}, not ${variant}`);
  const digest = skillDirectory ? packageDigest(skillDirectory) : null;
  if (expectedDigest !== undefined && digest !== expectedDigest) throw new Error(`skill package changed since round preflight: ${skillDirectory}`);
  const run = fs.mkdtempSync(path.join(os.tmpdir(), "review-run-"));
  const repo = path.join(run, "repo");
  const git = (...args) => execFileSync("git", [...GIT, ...args], { cwd: repo, stdio: "pipe",
    env: { ...process.env, GIT_AUTHOR_DATE: DATE, GIT_COMMITTER_DATE: DATE } });
  fs.mkdirSync(repo);
  git("init", "--quiet", "--initial-branch=main");
  for (const [tree, message] of [["base", "Before the change"], [variant, "The change under review"]]) {
    for (const entry of fs.readdirSync(repo)) if (entry !== ".git") fs.rmSync(path.join(repo, entry), { recursive: true });
    fs.cpSync(path.join(source, tree), repo, { recursive: true });
    git("add", "--all", "--force"); // a case may carry node_modules, which a machine's global excludes would drop
    git("commit", "--quiet", "--message", message);
  }
  fs.copyFileSync(path.join(source, "brief.md"), path.join(run, "brief.md"));
  let skill = null;
  if (skillDirectory) {
    const destination = path.join(run, "skill");
    fs.cpSync(skillDirectory, destination, { recursive: true });
    const copiedDigest = packageDigest(destination);
    if (copiedDigest !== digest) throw new Error(`skill package changed while copying: ${skillDirectory}`);
    skill = { path: destination, sha256: copiedDigest };
  }
  return { run, cwd: repo, skill, prompt: reviewerPrompt() };
}

if (isMain(import.meta)) {
  const [caseName, variant, skillDirectory] = process.argv.slice(2);
  if (!caseName || !variant) {
    console.error(`usage: prepare.mjs <case> <head|clean> [skill-directory]\ncases: ${fs.readdirSync(CASES).sort().join(", ")}`);
    process.exit(2);
  }
  const { cwd, skill, prompt } = prepare(caseName, variant, skillDirectory);
  console.log(`cwd: ${cwd}\nskill: ${skill ? `${skill.path} (sha256 ${skill.sha256})` : "none"}\n\n${prompt}`);
}
