#!/usr/bin/env node
// Does skills/orchestrate/scripts/lint-draft.mjs catch what #15 F16 found in the answers users read, and
// leave ordinary prose alone?
//
//   node evals/lint-draft.test.mjs
//
// The red fixtures are the shapes the issue recorded: agent ids, paths and exit mechanics (T5 :325),
// paths and a RESUME id (T9 :219), a 3,000-word wall (T2 :203), a pasted return. The green ones are the
// false positives a linter of this kind is prone to: a repository path, a URL, a date, a model's name, a
// negated claim, a heading that happens to be one of the five labels, the user's own quoted words.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { FIELDS, ROOT, registry, runCases, spawnNode, summarize, tempDir } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const LINTER = path.join(ROOT, "skills", "orchestrate", "scripts", "lint-draft.mjs");
const { lintDraft } = await import(LINTER);
const TMP = tempDir("lint-draft-test-");

const rules = (text, opts) => lintDraft(text, opts).hits.map((h) => h.rule);
const expect = (text, want, opts = {}) => {
  const got = rules(text, opts);
  const missing = want.filter((r) => !got.includes(r));
  const extra = got.filter((r) => !want.includes(r));
  return missing.length === 0 && extra.length === 0
    || `${JSON.stringify(text.slice(0, 80))}: wanted [${want.join(", ")}], got [${got.join(", ")}]`;
};
const all = (...results) => {
  const bad = results.filter((r) => r !== true);
  return bad.length === 0 || bad.join("; ");
};
const cli = async (args, input) => {
  const h = spawnNode([LINTER, ...args], { stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"], killAfterMs: 30_000 });
  if (input !== undefined) { h.child.stdin.end(input); }
  const r = await h.done;
  const lines = r.out.replace(/\n$/, "").split("\n");
  return { ...r, lines, last: lines[lines.length - 1] };
};

test("T5's shape is red: agent ids, a report path and exit mechanics",
  "F16 T5 :325: the user read the harness's ids, the run directory and the exit code where a sentence about the work belonged",
  () => expect("The agent agent-3f9a0c1b2d4e5f60 stopped with exit 6; its report is at /Users/me/.claude/plugins/data/entrust/orchestrate/x/r1/report.json.",
    ["agent-id", "path", "machinery"]));

test("T9's shape is red: a RESUME line, a thread id and $TMPDIR",
  "F16 T9 :219: a continuation id and scratch paths handed to the user as if they were theirs to act on",
  () => all(
    expect("To continue, send RESUME: 019a2b3c-4d5e-4f60-8a7b-1c2d3e4f5a6b with the prompt in $TMPDIR/p2.txt.", ["field", "agent-id", "path", "machinery"]),
    expect("It ran under OUTPUT_SCHEMA with the wrapper's PATH=own line.", ["field", "machinery"]),
  ));

test("every header field the driver knows is machinery, written as NAME:",
  "the linter reads the driver's own field table; a field added there is caught here without an edit",
  () => {
    const missed = FIELDS.map((f) => f.name).filter((n) => !rules(`The agent had ${n}: yes set.`).includes("field"));
    return missed.length === 0 || `not caught: ${missed.join(", ")}`;
  });

test("T2's wall is red on length, and --max-words moves the bound",
  "F16 T2 :203: 2,929 output tokens in one message; the owner reads the first screen",
  () => {
    const wall = Array.from({ length: 3000 }, (_, i) => (i % 12 === 11 ? "end." : "word")).join(" ");
    return all(expect(wall, ["length"]), expect(wall, [], { maxWords: 5000 }));
  });

test("a pasted five-field return is red; one heading that is a label is prose",
  "the page says never to paste a five-field block; \"Open questions:\" alone is a heading a person writes",
  () => all(
    expect("status: done\nresult: the helper exists\nevidence:\n- node --test", ["five-fields"]),
    expect("**Status:** partial\n**Open:** the Linux leg", ["five-fields"]),
    expect("Open questions:\n- whether Linux behaves the same", []),
  ));

test("the false positives stay green: a repository path, a URL, a date, model names, a clean paragraph",
  "a linter that fires on ordinary prose is switched off by the second answer, and each of these is a shape a pattern for paths, ids or machinery can catch by accident",
  () => all(
    expect("Opus W2 added lib/slug.mjs and test/slug.test.mjs; the design is in plugins/entrust/README.md.", [], { agents: ["Opus W2"] }),
    expect("The issue is https://github.com/Nowely/agent-skills/issues/15, opened on 2026-09-27.", []),
    expect("Codex Sol and Claude Opus disagreed on the order; Sonnet sided with Sol.", []),
    expect("The run exited early because the user stopped it.", []),
    expect("The drivers of this change are the two issues.", []),
  ));

test("the user's own words are theirs: quoted lines are skipped, and --request allows its vocabulary",
  "a request about the driver is answered about the driver; flagging the user's own subject makes the linter useless on this plugin's own work",
  () => all(
    expect("> keep RESUME: last in the prompt file\nDone as asked.", []),
    expect("The driver now names the writable roots.", ["machinery"]),
    expect("The driver now names the writable roots.", [], { request: "Fix the driver so it names the roots" }),
  ));

test("a success claim needs a receipt or an unverified mark: a digit or an agent's name is not proof",
  "F16 T2 :135 relayed nine unverified defects as findings; a number in the sentence is what a guess looks like too",
  () => all(
    expect("The fix works.", ["unsupported-success"]),
    expect("14 tests passed.", ["unsupported-success"]),
    expect("Sonnet W5 verified it.", ["unsupported-success"], { agents: ["Sonnet W5"] }),
    expect("The suite passed under node --test, 14 of 14.", [], { receipts: ["node --test"] }),
    expect("Unverified: the fix works on Linux.", []),
    expect("The flaky check is not fixed yet.", []),
    expect("Тесты прошли.", ["unsupported-success"]),
    expect("Тесты прошли: node --test, 14 из 14.", [], { receipts: ["node --test"] }),
    expect("Не проверено: на Linux работает.", []),
  ));

test("a success word in a clause opening with once, when, if, until, unless or before says what will happen and is not a claim; after it, or with after, it still is",
  "E61: the live gate's case 5 (2026-09-28) was reported for \"The final answer goes out once its new verdict arrives and the digest check passes.\", and the coordinator must lint until clean; \"after\" stays a claim because \"After the fix the suite passes\" is one",
  () => all(
    expect("The final answer goes out once its new verdict arrives and the digest check passes.", []),
    expect("When the suite passes, the answer goes out.", []),
    expect("If the build is green, merge it.", []),
    expect("Retry until the suite passes.", []),
    expect("Once fixed, the suite passes.", ["unsupported-success"]),
    expect("The suite passes when run with node --test.", ["unsupported-success"]),
    expect("After the fix the suite passes.", ["unsupported-success"]),
    expect("После исправления тесты прошли.", ["unsupported-success"]),
  ));

test("a receipt from a capture-check ledger supports a claim only when its check exited 0 and was not refused",
  "a label whose check failed would otherwise certify the opposite of what it measured",
  async () => {
    const ledger = path.join(TMP, "ledger.jsonl");
    fs.writeFileSync(ledger, [
      JSON.stringify({ label: "slug suite", exit: "0", lines: 3 }),
      JSON.stringify({ label: "lint suite", exit: "1", lines: 9 }),
      JSON.stringify({ label: "type check", refused: true }),
      "plain label",
    ].join("\n"));
    const draft = path.join(TMP, "claims.md");
    fs.writeFileSync(draft, "The slug suite passed.\nThe lint suite passed.\nThe type check passed.\nThe plain label check works.\n");
    const r = await cli(["--receipts", ledger, draft]);
    const lines = r.lines.filter((l) => l.startsWith("LINT=unsupported-success"));
    const flagged = lines.map((l) => l.split(": ")[1]);
    return (r.code === 1 && flagged.join(",") === "2,3") || `exit ${r.code}, flagged lines ${flagged.join(",") || "none"}: ${r.out}`;
  });

test("every agent that ran is named by model and id, and an id alone is red",
  "F20a: the answer is where the user learns who did what; an id without its model is machinery, and an agent never named is a dropped one nobody reported",
  () => all(
    expect("Opus W2 built the runner and Sol D0 reviewed the deltas.", [], { agents: ["Opus W2, Codex Sol D0"] }),
    expect("Opus W2 built the runner.", ["agent-not-named"], { agents: ["Opus W2", "Codex Sol D0"] }),
    expect("Opus W2 built the runner, and W2 also wrote its suite.", ["bare-id"], { agents: ["Opus W2"] }),
  ));

test("the command line: one LINT= per hit, then WORDS=, SHA256= of the bytes read and HITS= last; exit 0 clean, 1 on a hit, 2 on a refusal",
  "the coordinator lints the frozen draft and hands its digest to the critic; the digest must be of exactly the bytes linted",
  async () => {
    const clean = "Opus W2 added the runner; node --test passed, 10 of 10.\n";
    const file = path.join(TMP, "clean.md");
    fs.writeFileSync(file, clean);
    const sha = crypto.createHash("sha256").update(clean).digest("hex");
    const a = await cli(["--agents", "Opus W2", "--receipt", "node --test", file]);
    const b = await cli(["--agents", "Opus W2"], "Opus W2: exit 6 at /tmp/x.\n");
    const c = await cli(["--bogus", file]);
    const d = await cli([path.join(TMP, "absent.md")]);
    const problems = [];
    if (a.code !== 0 || a.last !== "HITS=0" || !a.lines.includes(`SHA256=${sha}`) || !a.lines.includes("WORDS=11")) problems.push(`clean: exit ${a.code}: ${a.out}`);
    if (b.code !== 1 || !b.lines.some((l) => /^LINT=path: 1: /.test(l)) || b.last !== `HITS=${b.lines.filter((l) => l.startsWith("LINT=")).length}`) problems.push(`stdin: exit ${b.code}: ${b.out}`);
    if (c.code !== 2 || !c.last.startsWith("ERROR=")) problems.push(`unknown flag: exit ${c.code}: ${c.out}`);
    if (d.code !== 2 || !d.last.startsWith("ERROR=")) problems.push(`missing file: exit ${d.code}: ${d.out}`);
    return problems.length === 0 || problems.join("; ");
  });

test("--help is the canonical reference: every rule and flag is named there, and SHA256 is the draft digest, not the manifest's",
  "the pages point at --help instead of restating the rules, so --help is where they must be; a help that called the draft's digest the critic's sent a coordinator to compare the wrong numbers",
  async () => {
    const r = await cli(["--help"]);
    const missing = ["path", "field", "five-fields", "machinery", "model-slug", "agent-id", "length", "bare-id", "agent-not-named",
      "unsupported-success", "--agents", "--receipt", "--receipts", "--request", "--max-words", "SHA256=", "HITS=",
      "the draft digest", "the manifest digest the critic returns is\n          another number"].filter((s) => !r.out.includes(s));
    // The critic returns the manifest's digest, not this one (orchestrate page, the critic bullet).
    const wrong = /SHA256=[^\n]*the digest the critic returns/.test(r.out);
    return (r.code === 0 && missing.length === 0 && !wrong) || `exit ${r.code}; --help lacks ${missing.join(", ") || "nothing"}${wrong ? "; it calls SHA256 the digest the critic returns" : ""}`;
  });

const failed = await runCases(CASES);
process.exit(summarize(failed, CASES.length));
