#!/usr/bin/env node
// Build one blind review run: a throwaway git repository holding a change, and its reviewer's prompt.
//
//   node evals/review/prepare.mjs <case> <head|clean> [instructions.md]
//
// <case> is a directory under cases/. The repository gets two commits, the case's base/ and then the named
// variant: head/ is the change as it was first written, clean/ the change as it should be. The reviewer is not
// told which it has; the change under review is HEAD against HEAD~1. With an instructions file, a copy sits
// beside the repository as instructions.md and the prompt says to follow it; without one the prompt is the
// control arm. The two prompts differ by that one line. The other variant, the rubric and the acceptance
// checks are never copied. Prints the run directory, a blank line, then the prompt.

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

export function reviewerPrompt(run, withInstructions) {
  return [
    "Review a code change.",
    "",
    `- Repository: ${path.join(run, "repo")}, a git repository. The change under review is its last commit `
      + "(`git diff HEAD~1 HEAD`); HEAD~1 is the code before the change.",
    `- The task the author was given: ${path.join(run, "brief.md")}.`,
    "- Review the change for correctness, unnecessary complexity, design and readability, and tests.",
    ...(withInstructions
      ? [`- How to review: ${path.join(run, "instructions.md")}. Read that file whole before you start and follow it.`]
      : []),
    "",
    "Limits: a read-only, static review. Do not run the project's code or tests and do not change any file; git "
      + `and file-reading commands are allowed. Read nothing outside ${run}. Your final message is the complete `
      + "review and nothing else.",
  ].join("\n");
}

export function prepare(caseName, variant, instructions) {
  const source = path.join(CASES, caseName);
  if (!fs.existsSync(path.join(source, "brief.md"))) throw new Error(`no case named ${caseName} under ${CASES}`);
  if (!VARIANTS.includes(variant)) throw new Error(`variant is ${VARIANTS.join(" or ")}, not ${variant}`);
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
  if (instructions) fs.copyFileSync(instructions, path.join(run, "instructions.md"));
  return { run, prompt: reviewerPrompt(run, Boolean(instructions)) };
}

if (isMain(import.meta)) {
  const [caseName, variant, instructions] = process.argv.slice(2);
  if (!caseName || !variant) {
    console.error(`usage: prepare.mjs <case> <head|clean> [instructions.md]\ncases: ${fs.readdirSync(CASES).sort().join(", ")}`);
    process.exit(2);
  }
  const { run, prompt } = prepare(caseName, variant, instructions);
  console.log(`${run}\n\n${prompt}`);
}
