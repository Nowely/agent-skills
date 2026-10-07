#!/usr/bin/env node
// Structural checks for the advisor page: its invocation policy, its size, and no adapter header block.
// What the page says is not pinned sentence by sentence here; real routing and continuation belong to
// the live gate.
import fs from "node:fs";
import path from "node:path";
import { ROOT, registry, runCases, summarize } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const file = path.join(ROOT, "skills/advisor/SKILL.md");
const text = fs.readFileSync(file, "utf8");

test("advisor remains explicit-only and concise",
  "the advisor must not start in work that did not request it",
  () => /^name: advisor$/m.test(text)
    && /^disable-model-invocation: true$/m.test(text)
    && text.replace(/\n+$/, "").split("\n").length <= 30
    || "frontmatter or concise-page bound failed");

test("the external adapter owns transport details",
  "the common advisor page should not duplicate a provider's headers and report paths",
  () => !/^ {4}(MODEL|OUTPUT_SCHEMA|TASK):/m.test(text) || "the page carries an adapter's header block");

process.exit(summarize(await runCases(CASES), CASES.length));
