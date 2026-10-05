#!/usr/bin/env node
// Low-cost checks for the advisor contract. Real routing and continuation belong to the live gate.
import fs from "node:fs";
import path from "node:path";
import { ROOT, registry, runCases, summarize } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const file = path.join(ROOT, "skills/advisor/SKILL.md");
const text = fs.readFileSync(file, "utf8");
const flat = text.replace(/\s+/g, " ");
const has = (...patterns) => {
  const missing = patterns.filter((p) => !p.test(flat));
  return missing.length === 0 || `missing: ${missing.join(" | ")}`;
};

test("advisor remains explicit-only and concise",
  "the advisor must not start in work that did not request it",
  () => /^name: advisor$/m.test(text)
    && /^disable-model-invocation: true$/m.test(text)
    && text.replace(/\n+$/, "").split("\n").length <= 30
    || "frontmatter or concise-page bound failed");

test("the proposal names the selected advisor route and model, not unrelated inventory",
  "the user needs the choice being approved and any constraint that affects it",
  () => has(
    /Identify the active host and resolve a top-row advisor model through the route it exposes/,
    /Codex: use native subagents and check Astra in the native model list/,
    /Claude: load the Codex adapter, check its current status, and select Astra when available/,
    /If the chosen model is unavailable, offer supported alternatives and wait for approval/,
    /names only the selected route and model/,
    /wait for explicit approval before starting/,
  ) && !/coordinator model.*unknown|expected turns|unused adapter/i.test(flat));

test("one approval covers material questions in scope; scope and roster changes need approval",
  "the skill should not invent a per-question approval gate or a fixed consultation count",
  () => has(
    /One approval covers all material questions within that scope/,
    /Get approval again only if the task scope, route or model changes/,
    /every material decision in scope until it is resolved/,
    /no preset question count or advisor-specific cap/,
    /without per-question approval/,
    /user says “no advisor”/,
    /“ask the advisor” resumes the same thread within scope/,
  ));

test("the advisor stays independent and reports evidence status",
  "private provisional decisions make influence observable without priming the advisor",
  () => has(
    /privately record the coordinator's provisional decision/,
    /do not include it in the advisor brief/,
    /neutral question with relevant facts, sources, uncertainty and constraints/,
    /premises marked checked or assumed/,
    /what evidence would change the recommendation/,
    /mark it unknown and name the check/,
  ));

test("the advisor counsels but does not execute or judge its own advice",
  "an advisor cannot own or grade work its recommendation influenced",
  () => has(
    /does not edit the repository, delegate work or judge an outcome it advised on/,
    /Use an independent reviewer for affected results/,
  ));

test("the record reports changed decisions without invented counts or service detail",
  "the synthesis should help the user understand the recommendation's effect, not expose irrelevant machinery",
  () => has(
    /record whether the coordinator's decision changed and why/,
    /final synthesis states the advice's effect on decisions and any open checks/,
    /omit turn counts, token totals, unused routes and private-note paths unless they change what the user should do/,
  ));

test("the external adapter owns transport details",
  "the common advisor page should not duplicate a provider's headers and report paths",
  () => has(/follow the adapter's model, effort, continuation and report protocol, including its output schema/,
    /On the Claude-hosted Codex route, Astra is top row and inherits configured effort; omit an EFFORT field/)
    && !/^ {4}(MODEL|OUTPUT_SCHEMA|TASK):/m.test(text));

process.exit(summarize(await runCases(CASES), CASES.length));
