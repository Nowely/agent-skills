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

test("advisor model selection follows user authority",
  "a named model wins, and an unavailable choice is not silently replaced: the plan reference owns that rule, so the page links it instead of restating it; a restatement needs the rule's own words (a fallback, the alternatives, the unavailable model again), which the page otherwise never uses",
  () => text.includes("Use the model the user named")
    && text.includes("unless they delegated the choice")
    && /If the chosen model is unavailable, \[[^\]]+\]\(\.\.\/orchestrate\/references\/plan\.md#composition\)/.test(text)
    && !/fallback|alternatives/i.test(text)
    && (text.match(/unavailable/gi) ?? []).length === 1
    || "advisor selection policy is missing, or the unavailable-model rule is restated beside its link");

test("the external adapter owns transport details",
  "the common advisor page should not duplicate a provider's headers and report paths",
  () => !/^ {4}(MODEL|OUTPUT_SCHEMA|TASK):/m.test(text) || "the page carries an adapter's header block");

process.exit(summarize(await runCases(CASES), CASES.length));
