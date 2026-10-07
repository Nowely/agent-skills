#!/usr/bin/env node
// Does skills/prepare-feedback/SKILL.md carry the interface its script was agreed to have, and does
// skills/prepare-feedback/scripts/prepare-feedback.mjs build the private folder it promises?
//
//   node evals/prepare-feedback.test.mjs
//
// The page cases pin only what the page and the script share: the frontmatter, the script's command line, the
// four commands, the private folder's form and the page's budget; none of its prose. The
// script cases run it in a synthetic world under one harness temp directory: transcripts under
// CLAUDE_CONFIG_DIR, Codex rollouts under CODEX_HOME, reports beside them, and ENTRUST_STATE_DIR pointing at a
// scratch state, so nothing reaches the machine's own data or transcripts. Every
// record is built here in the shapes Claude Code and Codex write; no line of a real transcript is in it.

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT, registry, runCases, skip, spawnNode, summarize, tempDir } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();

const PAGE = "skills/prepare-feedback/SKILL.md";
const SCRIPT = path.join(ROOT, "skills", "prepare-feedback", "scripts", "prepare-feedback.mjs");
const COMMANDS = ["corpus", "quotes", "process", "timeline"];
let text = "";
try { text = fs.readFileSync(path.join(ROOT, PAGE), "utf8"); } catch {}
const front = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] ?? "";
const body = text.replace(/^---\n[\s\S]*?\n---\n/, "");

// ------------------------------------------------------------------ the page

test("the page was read (every case below is sound)",
  "a page that shrank to a stub would pass every negative check; the floor says the file is the page",
  () => Buffer.byteLength(body) >= 2000 || `read ${Buffer.byteLength(body)} bytes of body out of ${PAGE}`);

test("the frontmatter names the skill, forbids model invocation, and carries a version",
  "the skill reads the user's sessions and is started only by the user's typed command; the version is what the package suite compares with plugin.json",
  () => {
    const problems = [];
    for (const re of [/^name: prepare-feedback$/m, /^disable-model-invocation: true$/m, /^license: MIT$/m, /^metadata:$/m, /^  version: "\d+\.\d+\.\d+"$/m])
      if (!re.test(front)) problems.push(`frontmatter lacks ${re}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the page stays inside its budget: a body of 20,000 bytes at most and two heading levels",
  "the page is loaded on top of the orchestrate page it reads; 20,000 bytes is about the 5,000 tokens the design allows it, at an estimated four bytes a token",
  () => {
    const problems = [];
    if (Buffer.byteLength(body) > 20000) problems.push(`the body is ${Buffer.byteLength(body)} bytes`);
    if (/^###/m.test(text)) problems.push("a third heading level");
    return problems.length === 0 || problems.join("; ");
  });

test("the page calls the script in one indented line",
  "the coordinator copies the line as it stands; the script resolves its state directory itself",
  () => /^ {7}node "<skill-dir>\/scripts\/prepare-feedback\.mjs" <command>/m.test(text)
    || "no line reads `       node \"<skill-dir>/scripts/prepare-feedback.mjs\" <command> …`");

test("the page names each of the script's four commands",
  "a command the page never names is one the coordinator never runs, and the step it serves is done by hand",
  () => {
    const missing = COMMANDS.filter((c) => !new RegExp("`" + c + "[` ]").test(text));
    return missing.length === 0 || `not named in backticks: ${missing.join(", ")}`;
  });

test("the page names the private folder in its agreed form",
  "the script writes it and the report's readers are pointed at it",
  () => text.includes("<state>/prepare-feedback/<date>-<slug>/") || "the page does not carry <state>/prepare-feedback/<date>-<slug>/");

// ------------------------------------------------------------------ the synthetic world

const world = tempDir("entrust-prepare-feedback-");
const state = path.join(world, "state");
const config = path.join(world, "config");
const codexHome = path.join(world, "codex");
const scratch = path.join(world, "scratch");
for (const d of [state, config, codexHome, scratch, path.join(world, "research")]) fs.mkdirSync(d, { recursive: true });
const draft = (name, content) => { const p = path.join(scratch, name); fs.writeFileSync(p, content); return p; };
const write = (file, lines) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${lines.join("\n")}\n`); };
const run = (argv, env = {}) => spawnNode([SCRIPT, ...argv], {
  env: { ENTRUST_STATE_DIR: state, CLAUDE_CONFIG_DIR: config, CODEX_HOME: codexHome, ...env },
  cwd: world, killAfterMs: 30000 }).done;
const value = (out, key) => new RegExp(`^${key}=(.*)$`, "m").exec(out)?.[1];
const today = new Date().toISOString().slice(0, 10);
const walk = (dir, base = dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p, base) : [path.relative(base, p).split(path.sep).join("/")];
}).sort();

const uuid = (n) => `${String(n).repeat(8)}-${String(n).repeat(4)}-4${String(n).repeat(3)}-8${String(n).repeat(3)}-${String(n).repeat(12)}`;
const S = { main: uuid(1), fork: uuid(2), checkout: uuid(3), self: uuid(4), plain: uuid(5), terse: uuid(6) };
const thread = (n) => `0190${String(n).repeat(4)}-0000-7000-8000-00000000000${n}`;
const TH = { reported: thread(1), receipt: thread(2), a: thread(3), b: thread(4), c: thread(5) };

// One transcript: each entry a timestamp and a record, stamped with the fields every record carries.
let serial = 0;
function transcript(file, session, cwd, entries, extra = {}) {
  write(file, entries.map(([ts, r]) => JSON.stringify({ parentUuid: null, isSidechain: false, userType: "external", cwd,
    sessionId: session, version: "2.1.0", uuid: `u-${++serial}`, timestamp: ts, ...extra, ...r })));
  return entries;
}
const lineOf = (entries, test_) => entries.findIndex(([, r]) => test_(r)) + 1;
const saysText = (text_) => (r) => JSON.stringify(r.message?.content ?? "").includes(text_);

let messageId = 0;
const human = (t) => ({ type: "user", origin: { kind: "human" }, message: { role: "user", content: [{ type: "text", text: t }] } });
const typed = (t) => ({ type: "user", message: { role: "user", content: t } });
const load = (dir) => ({ type: "user", isMeta: true, message: { role: "user", content: [{ type: "text", text: `Base directory for this skill: ${dir}\n\n# The skill's page\n` }] } });
const said = (t) => ({ type: "assistant", message: { id: `msg_${++messageId}`, role: "assistant", content: [{ type: "text", text: t }],
  usage: { input_tokens: 10, cache_creation_input_tokens: 20, cache_read_input_tokens: 100, output_tokens: 5 } } });
// A result answers the call made just before it, as tool_use_id ties them in a transcript.
let lastCall = null;
const call = (name, input = {}) => { lastCall = `toolu_${++messageId}`; return { type: "assistant", message: { id: `msg_${messageId}`, role: "assistant", content: [{ type: "tool_use", id: lastCall, name, input }] } }; };
const result = (content, more = {}) => ({ type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: lastCall, content, ...(more.error ? { is_error: true } : {}) }] },
  ...(more.returned ? { toolUseResult: more.returned } : {}) });
const peer = (t) => ({ type: "user", origin: { kind: "peer" }, message: { role: "user", content: [{ type: "text", text: t }] } });
const notice = (t) => ({ type: "user", origin: { kind: "task-notification" }, message: { role: "user", content: t } });
const refusal = (skill) => result(`<tool_use_error>Skill ${skill} cannot be used with Skill tool due to disable-model-invocation. Ask the user to run /${skill} themselves.</tool_use_error>`, { error: true });
const CACHE = (plugin, version, skill) => `/home/someone/.claude/plugins/cache/nowely/${plugin}/${version}/skills/${skill}`;
const CHECKOUT = (plugin, skill) => `/src/agent-skills/plugins/${plugin}/plugin/skills/${skill}`;
const filler = (n, word) => { let s = "", i = 0; while (s.length < n) s += `${word} ${i++} said "so"\n`; return s.slice(0, n); };

const reportR1 = path.join(world, "reports", "r1", "report.json");
// The keys the entrust driver writes: a nonzero exit, a timing split, three command counts, and the effort the turn
// ran at in reasoningEffort, the requested one null as when the thread inherited its config.
write(reportR1, [JSON.stringify({ ok: false, threadId: TH.reported, model: "codex-test-model", effort: null, reasoningEffort: "high", exitCode: 3, turnStatus: "completed",
  commandsSucceeded: 4, commandsFailed: 1, commandsDeclined: 0, timing: { wallMs: 31000, setupMs: 10, commandMs: 5000, modelMs: 25000 },
  tokenUsage: { total: { totalTokens: 500, inputTokens: 480, cachedInputTokens: 400, outputTokens: 20 } } })]);
const rolloutDir = path.join(codexHome, "sessions", "2026", "09", "20");
const rollout = (th, records) => {
  const f = path.join(rolloutDir, `rollout-2026-09-20T10-00-00-${th}.jsonl`);
  write(f, [{ timestamp: "2026-09-20T10:00:00.000Z", type: "session_meta", payload: { id: th } }, ...records].map((r) => JSON.stringify(r)));
  return f;
};
rollout(TH.reported, []);
const receiptFile = rollout(TH.receipt, []);

// A message streamed as two records under one id, the first a thinking block with a partial output count.
const streamed = (r) => ({ ...r, message: { ...r.message, content: [{ type: "thinking", thinking: "" }], usage: { ...r.message.usage, output_tokens: 1 } } });

// T1: a cache load of entrust 0.20.0, a REPORT= launch, a foreground and a background subagent, then its fork.
const alpha = path.join(config, "projects", "-work-alpha");
const on20 = (hms) => `2026-09-20T${hms}.000Z`;
const MAIN = transcript(path.join(alpha, `${S.main}.jsonl`), S.main, "/work/alpha", [
  [on20("10:00:00"), { type: "queue-operation", operation: "enqueue" }],
  [on20("10:00:01"), human("please review the entrust plugin")],
  ...((r) => [[on20("10:00:02"), streamed(r)], [on20("10:00:02"), r]])(said("Loading the codex skill.")),
  [on20("10:00:03"), load(CACHE("entrust", "0.20.0", "codex"))],
  [on20("10:00:04"), call("Bash")],
  [on20("10:00:05"), result(`status: done\nREPORT=${reportR1}\n`)],
  [on20("10:00:06"), call("Agent")],
  [on20("10:00:07"), result("the review is done", { returned: { status: "completed", agentId: "a1", totalTokens: 1234, totalDurationMs: 5000, totalToolUseCount: 3, resolvedModel: "claude-opus" } })],
  [on20("10:00:08"), call("Agent")],
  [on20("10:00:09"), result("launched in the background", { returned: { status: "async_launched", agentId: "a2", resolvedModel: "claude-sonnet" } })],
  [on20("10:00:10"), call("Bash", { command: "git status --short" })],
  [on20("10:00:11"), result("M notes.txt")],
  [on20("10:00:12"), call("Bash", { command: "git status --short" })],
  [on20("10:00:13"), result("M notes.txt")],
  [on20("10:00:14"), call("Read", { file_path: "notes.txt" })],
  [on20("10:00:15"), result(filler(5000, "note"))],
  [on20("10:00:30"), notice("<task-notification>\n<task-id>a2</task-id>\n<status>completed</status>\n<usage><subagent_tokens>777</subagent_tokens><tool_uses>2</tool_uses><duration_ms>900</duration_ms></usage>\n</task-notification>")],
  [on20("10:00:31"), peer("a note another session sent")],
  [on20("10:05:00"), human("the codex step was slow")],
  [on20("10:05:01"), said("Noted.")],
]);
const FORK = transcript(path.join(alpha, `${S.fork}.jsonl`), S.fork, "/work/alpha", [
  ...MAIN.slice(1),
  [on20("11:00:00"), human("the fork goes on from here")],
  [on20("11:00:01"), said("Continuing in the fork.")],
]);
const subs = path.join(alpha, S.main, "subagents");
const A1 = transcript(path.join(subs, "agent-a1.jsonl"), S.main, "/work/alpha", [
  ["2026-09-20T10:00:06.500Z", { type: "user", agentId: "a1", message: { role: "user", content: "Review the plugin and say what you found." } }],
  ["2026-09-20T10:00:06.600Z", { ...call("Bash"), agentId: "a1" }],
  ["2026-09-20T10:00:06.700Z", { ...result(`codex-delegate: threadId=${TH.receipt} (live rollout)\nreceiptPath: ${receiptFile}\n`), agentId: "a1" }],
  ...((r) => [["2026-09-20T10:00:06.800Z", { ...streamed(r), agentId: "a1" }], ["2026-09-20T10:00:06.800Z", { ...r, agentId: "a1" }]])(said("The plugin reads well.")),
], { isSidechain: true });
write(path.join(subs, "agent-a1.meta.json"), [JSON.stringify({ agentType: "general-purpose", description: "review the plugin" })]);
write(path.join(subs, "agent-a2.meta.json"), [JSON.stringify({ agentType: "acme:reviewer", description: "count the tests" })]);
// A subagent with no API usage and no Agent return: no tokens, and its own wall time as its duration; it runs one
// command twice.
const A3 = transcript(path.join(subs, "agent-a3.jsonl"), S.main, "/work/alpha", [
  ["2026-09-20T10:00:20.000Z", { type: "user", agentId: "a3", message: { role: "user", content: "Look around." } }],
  ["2026-09-20T10:00:21.000Z", { ...call("Bash", { command: "ls tests" }), agentId: "a3" }],
  ["2026-09-20T10:00:22.000Z", { ...call("Bash", { command: "ls tests" }), agentId: "a3" }],
  ["2026-09-20T10:00:25.000Z", { ...call("Glob"), agentId: "a3" }],
], { isSidechain: true });
transcript(path.join(subs, "agent-a2.jsonl"), S.main, "/work/alpha", [
  ["2026-09-20T10:00:09.500Z", { type: "user", agentId: "a2", message: { role: "user", content: "Count the tests." } }],
  ["2026-09-20T10:00:09.600Z", { ...said("There are twelve."), agentId: "a2" }],
  ["2026-09-20T10:00:09.700Z", { ...notice("<task-notification>\n<task-id>a3</task-id>\n<status>completed</status>\n</task-notification>"), agentId: "a2" }],
], { isSidechain: true });

// After them, the process fixtures: a pause of 29 minutes that a tool call ends (a gap), a foreground Agent call of
// 20 minutes (the run working), an MCP tool, a pause of 15 minutes that a notification ends (a gap), one of
// 3 minutes that the person's message ends, carried in by a queue operation (waiting for the person), and a
// background agent in flight for 12 minutes while the person writes (the run working until its notification).
// A load from a checkout, whose version the path does not carry, a refusal of entrust:orchestrate and one of
// another plugin's skill, the refusal's words quoted in a failed command and a threadId in a file read, by the
// Read tool or by cat, none of them an event, a background launch's output read back, which is one, and a
// REPORT= line whose report is gone.
const on22 = (hms) => `2026-09-22T${hms}.000Z`;
const CHECKOUT_S = transcript(path.join(config, "projects", "-work-alpha--claude-worktrees-x", `${S.checkout}.jsonl`), S.checkout, "/work/alpha/.claude/worktrees/x", [
  [on22("09:00:00"), human("try the orchestrate mode")],
  [on22("09:00:01"), load(CHECKOUT("entrust", "codex"))],
  [on22("09:00:02"), call("Skill")],
  [on22("09:00:03"), refusal("entrust:orchestrate")],
  [on22("09:00:04"), call("Skill")],
  [on22("09:00:05"), refusal("other-plugin:grill")],
  [on22("09:00:06"), call("Bash")],
  [on22("09:00:07"), result("grep: fixtures/refusal.txt: Skill entrust:swarm cannot be used with Skill tool due to disable-model-invocation", { error: true })],
  [on22("09:00:08"), call("Read")],
  [on22("09:00:09"), result(`{\n  "threadId": "${thread(6)}"\n}`)],
  [on22("09:00:10"), call("Bash")],
  [on22("09:00:11"), result(`REPORT=${path.join(world, "reports", "gone", "report.json")}\n`)],
  [on22("09:00:12"), said("The orchestrate page is for the user to start.")],
  [on22("09:00:13"), call("Bash", { command: "cd reports && cat r9/report.json | head -5" })],
  [on22("09:00:14"), result(`{\n  "threadId": "${thread(7)}",\n  "ok": true\n}`)],
  [on22("09:00:15"), call("Bash", { command: "sleep 5; cat tasks/b1.output" })],
  [on22("09:00:16"), result(`codex-delegate: threadId=${thread(8)} (live rollout)\n`)],
  [on22("09:30:00"), call("Agent")],
  [on22("09:50:00"), result("the long review is done", { returned: { status: "completed", agentId: "a9", totalTokens: 10, totalDurationMs: 1200000, totalToolUseCount: 1 } })],
  [on22("09:50:01"), said("The review is back.")],
  [on22("09:50:02"), call("mcp__acme_tracker__get_issue")],
  [on22("09:50:03"), result("the issue as the tracker has it")],
  [on22("10:05:03"), notice("<task-notification>\n<task-id>zz9</task-id>\n<status>completed</status>\n</task-notification>")],
  [on22("10:08:02"), { type: "queue-operation", operation: "enqueue" }],
  [on22("10:08:03"), human("go on")],
  [on22("10:08:04"), said("Going on.")],
  [on22("10:08:05"), call("Agent", { run_in_background: true })],
  [on22("10:08:06"), result("launched in the background", { returned: { status: "async_launched", isAsync: true, agentId: "a8" } })],
  [on22("10:18:06"), human("is it done?")],
  [on22("10:20:06"), notice(`<task-notification>\n<task-id>a8</task-id>\n<tool-use-id>${lastCall}</tool-use-id>\n<status>completed</status>\n</task-notification>`)],
  [on22("10:20:07"), said("It is done.")],
]);

// A run of this skill, which also loaded codex: excluded all the same, counted apart, back only through --session.
transcript(path.join(alpha, `${S.self}.jsonl`), S.self, "/work/alpha", [
  ["2026-09-25T10:00:00.000Z", typed("<command-name>/entrust:prepare-feedback</command-name>")],
  ["2026-09-25T10:00:01.000Z", load(CACHE("entrust", "0.22.0", "prepare-feedback"))],
  ["2026-09-25T10:00:02.000Z", said("Preparing the feedback.")],
  ["2026-09-25T10:00:03.000Z", load(CACHE("entrust", "0.22.0", "codex"))],
]);

// No load at all: the markers appear only as words a person and the assistant wrote, one of them opening a
// person's message in a text block, the shape a load has but for isMeta.
const beta = path.join(config, "projects", "-work-beta");
transcript(path.join(beta, `${S.plain}.jsonl`), S.plain, "/work/beta", [
  ["2026-09-18T08:00:00.000Z", human(`Base directory for this skill: ${CACHE("entrust", "0.21.0", "codex")}\n\nthat is what my log says, and I do not know why`)],
  ["2026-09-18T08:00:01.000Z", said("A skill prints that line when it loads; a user-only one answers cannot be used with Skill tool due to disable-model-invocation.")],
  ["2026-09-18T08:00:02.000Z", typed(`Base directory for this skill: ${CACHE("terse", "0.3.0", "clarity")}`)],
  ["2026-09-18T08:00:03.000Z", notice("<task-notification>\n<task-id>zz</task-id>\n<status>completed</status>\n</task-notification>")],
]);

// A sibling of /work/alpha whose name starts the same: never inside it.
const S_ALPHABET = uuid(7);
transcript(path.join(config, "projects", "-work-alphabet", `${S_ALPHABET}.jsonl`), S_ALPHABET, "/work/alphabet", [
  ["2026-09-19T09:00:00.000Z", human("sort the list")],
  ["2026-09-19T09:00:01.000Z", said("Sorted.")],
]);

// A third world for the timeline: an owner whose first message is an array of blocks, a draft, a typed skill
// command, the model reading a plugin's pages by Read, Grep and a Bash sed -n and grep through a variable, and
// files outside a plugin; a Skill call that loads and one refused; a subagent that reads a page itself; two
// owner messages queued while the model worked, one as blocks and one as a string, and a subagent's queued
// return, which is not the owner's; then a fork, titled as Claude Code titles one, that goes its own way.
const config3 = path.join(world, "config3");
const delta = path.join(config3, "projects", "-work-delta");
const D = { main: uuid("d"), fork: uuid("e") };
const TERSE_ROOT = "/home/someone/.claude/plugins/cache/nowely/terse/0.5.0";
const queuedMsg = (origin, prompt, extra = {}) => ({ type: "attachment", attachment: { type: "queued_command", prompt, commandMode: "prompt", origin: { kind: origin }, ...extra } });
const at8 = (s_) => `2026-09-26T08:${s_}.000Z`;
const DMAIN = [
  [at8("00:00"), human("please write the ticket")],
  [at8("00:01"), said("Drafting.")],
  [at8("00:02"), call("Write", { file_path: "/work/delta/ticket.md", content: "the ticket" })],
  [at8("00:03"), result("written")],
  [at8("00:10"), typed("<command-message>terse:clarity</command-message>\n<command-name>/terse:clarity</command-name>\n<command-args>check it</command-args>")],
  [at8("00:11"), load(CACHE("terse", "0.5.0", "clarity"))],
  [at8("00:12"), call("Read", { file_path: `${TERSE_ROOT}/references/genres/ticket.md` })],
  [at8("00:13"), result("the ticket genre")],
  [at8("00:14"), call("Grep", { pattern: "reader", path: `${TERSE_ROOT}/references` })],
  [at8("00:15"), result("rules.md:1")],
  [at8("00:16"), call("Bash", { command: `R=${TERSE_ROOT}/references; sed -n 1,40p $R/rules.md; grep -nE 'reader|claim' "$R/truth.md"` })],
  [at8("00:17"), result("the rules")],
  [at8("00:18"), call("Bash", { command: "sed -n 1,5p /work/delta/notes.md" })],
  [at8("00:19"), result("notes")],
  [at8("00:20"), call("Read", { file_path: "/work/delta/src/app.js" })],
  [at8("00:21"), result("code")],
  [at8("00:22"), call("Skill", { skill: "entrust:codex" })],
  [at8("00:23"), result("Launching skill: entrust:codex")],
  [at8("00:24"), call("Skill", { skill: "entrust:orchestrate" })],
  [at8("00:25"), refusal("entrust:orchestrate")],
  [at8("00:26"), call("Agent", { subagent_type: "general-purpose", model: "sonnet", prompt: "check the rules page" })],
];
const agentCall = lastCall;
DMAIN.push(
  [at8("00:40"), result("the rules are fine", { returned: { status: "completed", agentId: "d1", totalTokens: 50, totalDurationMs: 14000, totalToolUseCount: 1, resolvedModel: "claude-sonnet" } })],
  [at8("00:41"), queuedMsg("human", [{ type: "text", text: "no codex, only luna there" }])],
  [at8("00:42"), queuedMsg("human", "fix the second line")],
  [at8("00:43"), queuedMsg("peer", "<agent-return agent=\"d1\">the rules are fine</agent-return>", { isMeta: true })],
  [at8("00:44"), said("Done with the ticket.")],
);
transcript(path.join(delta, `${D.main}.jsonl`), D.main, "/work/delta", DMAIN);
const dsub = path.join(delta, D.main, "subagents");
const DSUB = transcript(path.join(dsub, "agent-d1.jsonl"), D.main, "/work/delta", [
  [at8("00:27"), { type: "user", agentId: "d1", message: { role: "user", content: "check the rules page" } }],
  [at8("00:28"), { ...call("Read", { file_path: `${TERSE_ROOT}/references/rules.md` }), agentId: "d1" }],
  [at8("00:29"), { ...result("the rules"), agentId: "d1" }],
  [at8("00:39"), { ...said("the rules are fine"), agentId: "d1" }],
], { isSidechain: true });
write(path.join(dsub, "agent-d1.meta.json"), [JSON.stringify({ agentType: "general-purpose", description: "check the rules", toolUseId: agentCall })]);
const DFORK = [...DMAIN.slice(0, 10), ["", { type: "custom-title", customTitle: "ticket (fork)" }],
  ["2026-09-26T08:05:00.000Z", human("take the other road")], ["2026-09-26T08:05:01.000Z", said("Other road.")]];
write(path.join(delta, `${D.fork}.jsonl`), DFORK.map(([ts, r]) => JSON.stringify(ts ? { parentUuid: null, isSidechain: false, userType: "external", cwd: "/work/delta", sessionId: D.fork, version: "2.1.0", uuid: `u-${++serial}`, timestamp: ts, ...r } : { ...r, sessionId: D.fork })));

// A fourth world for the shapes a Bash read takes: a cd into a plugin, then pages by relative name and a grep
// pattern that is not a page; a cd outside any plugin; a loop over literal skill names, and one over a command's
// output that nothing can expand; a sed that prints a page, and one that edits another in place.
const config4 = path.join(world, "config4");
const ENTRUST_ROOT = "/home/someone/.claude/plugins/cache/nowely/entrust/0.22.0";
const at9 = (s_) => `2026-09-27T09:${s_}.000Z`;
const BASH4 = [
  [at9("00:00"), human("read the pages")],
  [at9("00:01"), load(CACHE("terse", "0.5.0", "clarity"))],
  [at9("00:02"), call("Bash", { command: `cd ${TERSE_ROOT} && cat references/rules.md && grep -n -A 3 reader references/truth.md` })],
  [at9("00:03"), result("rules and truth")],
  [at9("00:04"), call("Bash", { command: "cd /work/epsilon && cat notes.md" })],
  [at9("00:05"), result("notes")],
  [at9("00:06"), call("Bash", { command: `E=${ENTRUST_ROOT}; for s in codex swarm; do sed -n 1,20p "$E/skills/$s/SKILL.md"; done` })],
  [at9("00:07"), result("two pages")],
  [at9("00:08"), call("Bash", { command: `E=${ENTRUST_ROOT}; for s in $(ls $E/skills); do head -5 $E/skills/$s/SKILL.md; done` })],
  [at9("00:09"), result("every page head")],
  [at9("00:10"), call("Bash", { command: `sed 's/a/b/' ${TERSE_ROOT}/references/genres/ticket.md` })],
  [at9("00:11"), result("the ticket genre")],
  [at9("00:12"), call("Bash", { command: `sed -i '' 's/a/b/' ${TERSE_ROOT}/references/genres/team-message.md` })],
  [at9("00:13"), result("")],
  [at9("00:14"), said("Read them.")],
];
transcript(path.join(config4, "projects", "-work-epsilon", `${uuid("f")}.jsonl`), uuid("f"), "/work/epsilon", BASH4);

// A second world, apart so the counts above stay as they are: one session holding a cache load of 0.20.0 and a
// checkout load, one holding only a checkout load; C11 adds a fork pair to it.
const config2 = path.join(world, "config2");
const gamma = path.join(config2, "projects", "-work-gamma");
const G = { mixed: uuid(8), checkout: uuid(9), original: uuid("b"), fork: uuid("a"), queued: uuid("c") };
transcript(path.join(gamma, `${G.mixed}.jsonl`), G.mixed, "/work/gamma", [
  ["2026-09-23T10:00:00.000Z", human("both kinds of load")],
  ["2026-09-23T10:00:01.000Z", load(CACHE("entrust", "0.20.0", "codex"))],
  ["2026-09-23T10:00:02.000Z", load(CHECKOUT("entrust", "swarm"))],
]);
// A background agent whose only notification came while the assistant was busy: queued as an enqueue, then carried
// in by an attachment, never a user record.
const queuedNotice = (id) => `<task-notification>\n<task-id>q1</task-id>\n<tool-use-id>${id}</tool-use-id>\n<status>completed</status>\n</task-notification>`;
transcript(path.join(gamma, `${G.queued}.jsonl`), G.queued, "/work/gamma", [
  ["2026-09-25T10:00:00.000Z", human("review it in the background")],
  ["2026-09-25T10:00:01.000Z", call("Agent", { run_in_background: true })],
  ["2026-09-25T10:00:02.000Z", result("launched in the background", { returned: { status: "async_launched", isAsync: true, agentId: "q1" } })],
  ["2026-09-25T10:00:03.000Z", said("Waiting for the review.")],
  ["2026-09-25T10:20:03.000Z", { type: "queue-operation", operation: "enqueue", content: queuedNotice(lastCall) }],
  ["2026-09-25T10:20:04.000Z", { type: "attachment", attachment: { type: "queued_command", prompt: queuedNotice(lastCall), commandMode: "task-notification" } }],
  ["2026-09-25T10:20:05.000Z", said("The review is in.")],
]);
transcript(path.join(gamma, `${G.checkout}.jsonl`), G.checkout, "/work/gamma", [
  ["2026-09-23T11:00:00.000Z", human("a checkout load only")],
  ["2026-09-23T11:00:01.000Z", load(CHECKOUT("entrust", "codex"))],
]);

// A terse session long enough to cut: twelve turns of 5,000 characters and one of 25,000.
const on21 = (m) => `2026-09-21T12:${String(m).padStart(2, "0")}:00.000Z`;
transcript(path.join(beta, `${S.terse}.jsonl`), S.terse, "/work/beta", [
  [on21(0), human("rewrite the readme")],
  [on21(1), load(CACHE("terse", "0.3.0", "clarity"))],
  ...Array.from({ length: 12 }, (_, k) => [on21(2 + k), said(filler(5000, `alpha${k}`))]),
  [on21(20), said(filler(25000, "omega"))],
]);

// ------------------------------------------------------------------ the script, in that world

const runs = {};
const corpus = async (slug, extra = []) => {
  const r = await run(["corpus", "--slug", slug, ...extra]);
  if (r.code === 0) runs[slug] = value(r.out, "RUN");
  return r;
};
const indexOf = (slug) => JSON.parse(fs.readFileSync(path.join(runs[slug], "corpus", "index.json"), "utf8"));
const turnsOf = (slug) => fs.readFileSync(path.join(runs[slug], "corpus", "turns.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
const expect = (out, want) => Object.entries(want).filter(([k, v]) => value(out, k) !== v).map(([k, v]) => `${k}=${value(out, k)}, expected ${v}`);

test("S1 --help exits 0 and names every command, the environment and the refusal code; an unknown command exits 2 even with --help",
  "the page's one line hands the coordinator to --help for everything else",
  async () => {
    const r = await run(["--help"]);
    const problems = [];
    if (r.code !== 0) problems.push(`exit ${r.code}`);
    for (const w of [...COMMANDS, "ENTRUST_STATE_DIR", "entrust-state", "CLAUDE_CONFIG_DIR", "CODEX_HOME", "10 refused", "turns.jsonl"])
      if (!r.out.includes(w)) problems.push(`--help does not mention ${w}`);
    const bogus = await run(["bogus", "--help"]);
    if (bogus.code !== 2) problems.push(`bogus --help exit ${bogus.code}`);
    return problems.length === 0 || problems.join("; ");
  });

test("S2 the script parses under this engine (node --check)",
  "CI parses every shipped script before any suite, and a syntax error is the one failure that must not look like a broken test",
  async () => {
    const r = await spawnNode(["--check", SCRIPT], { killAfterMs: 20000 }).done;
    return r.code === 0 || `exit ${r.code}: ${r.err.slice(0, 200)}`;
  });

test("S3 without ENTRUST_STATE_DIR the private folder is under <tmp>/entrust-state, and a relative one runs nothing",
  "the private folder lives where the driver's state does, in the temporary directory, so cleanup and the owner find both in one place; a relative value would resolve against whatever cwd the caller had",
  async () => {
    const tmp = fs.realpathSync(fs.mkdtempSync(path.join(world, "tmp-")));
    const r = await run(["corpus", "--slug", "nostate"], { ENTRUST_STATE_DIR: undefined, TMPDIR: tmp });
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 160)}`;
    const at = value(r.out, "RUN");
    if (!at || !at.startsWith(path.join(tmp, "entrust-state", "prepare-feedback") + path.sep)) return `RUN= is not under <tmp>/entrust-state: ${at}`;
    const rel = await run(["corpus", "--slug", "relative"], { ENTRUST_STATE_DIR: "state" });
    if (rel.code !== 2) return `a relative ENTRUST_STATE_DIR: exit ${rel.code}`;
    return !fs.readdirSync(state).some((n) => n.includes("relative")) || "a relative value wrote under the scratch state";
  });

test("C1 corpus makes <state>/prepare-feedback/<date>-<slug>/ at mode 0700 and prints the plan's numbers, the PROJECT= lines first and RUN= last",
  "the plan shows where the corpus came from and how many sessions and launches it holds; the page sends the command through the runner, whose tail keeps the last fifteen lines, and every later command needs RUN=",
  async () => {
    const r = await corpus("default");
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = [];
    const want = path.join(fs.realpathSync(state), "prepare-feedback", `${today}-default`);
    if (runs.default !== want) problems.push(`RUN=${runs.default}, expected ${want}`);
    else if (process.platform !== "win32" && (fs.statSync(want).mode & 0o777) !== 0o700) problems.push(`run mode ${(fs.statSync(want).mode & 0o777).toString(8)}`);
    problems.push(...expect(r.out, {
      PLUGINS: "entrust:2 terse:1", HUMAN_SESSIONS: "5", PROJECTS: "3",
      SESSIONS: "3 loaded=3 cache=2 checkout=1 refusals=1", RANGE: "2026-09-20..2026-09-22", OLDEST: "2026-09-18",
      SELF_RUNS: "1", SUBAGENTS: "3", CODEX_RUNS: "4 reports=1 rollouts=2",
    }));
    const lines = r.out.trim().split("\n");
    const keys = lines.map((l) => l.split("=")[0]);
    const tail = ["PLUGINS", "HUMAN_SESSIONS", "PROJECTS", "SESSIONS", "RANGE", "OLDEST", "SELF_RUNS", "SUBAGENTS", "CODEX_RUNS", "CHARS", "RUN"];
    if (JSON.stringify(keys) !== JSON.stringify(["PROJECT", "PROJECT", "PROJECT", ...tail])) problems.push(`lines in the order ${keys.join(",")}`);
    if (!/^CHARS=\d+ MESSAGES=\d+$/m.test(r.out)) problems.push("no CHARS=/MESSAGES= line");
    for (const p of ["/work/alpha sessions=1", "/work/beta sessions=1", "/work/alpha/.claude/worktrees/x sessions=1"])
      if (!lines.includes(`PROJECT=${p}`)) problems.push(`no PROJECT=${p}`);
    return problems.length === 0 || problems.join("; ");
  });

test("C2 a load is a meta record's first text block: a person quoting the marker, even at the start of a message, is no load",
  "O1's recount found raw grep three files too many for terse, every one a quotation; a quoted load would pull a session into the corpus that never ran the plugin",
  () => {
    if (!runs.default) return "C1 made no run";
    const idx = indexOf("default");
    const problems = [];
    if (idx.sessions.some((e) => e.session === S.plain)) problems.push("the session that only quotes the marker is in the corpus");
    const t1 = idx.sessions.find((e) => e.session === S.main);
    if (JSON.stringify(t1?.loads) !== JSON.stringify([{ at: `T1:${lineOf(MAIN, (r) => r.isMeta)}`, plugin: "entrust", version: "0.20.0", source: "cache", skill: "codex" }]))
      problems.push(`T1's loads: ${JSON.stringify(t1?.loads)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("C3 a load from a checkout has version unknown, a refusal of another plugin's skill is not the plugin's, and the refusal's words in a failed command are no refusal",
  "a checkout path carries no version, so the plan asks the user rather than guessing; a refusal counts against entrust only when the Skill tool refused an entrust skill, not when a command printed the phrase",
  () => {
    if (!runs.default) return "C1 made no run";
    const e = indexOf("default").sessions.find((x) => x.session === S.checkout);
    const problems = [];
    if (!e) return "the checkout session is not in the corpus";
    if (JSON.stringify(e.loads.map((l) => [l.version, l.source])) !== JSON.stringify([["unknown", "checkout"]])) problems.push(`loads ${JSON.stringify(e.loads)}`);
    if (JSON.stringify(e.refusals) !== JSON.stringify([{ at: `${e.id}:${lineOf(CHECKOUT_S, saysText("Skill entrust:orchestrate cannot"))}`, skill: "entrust:orchestrate", plugin: "entrust" }]))
      problems.push(`refusals ${JSON.stringify(e.refusals)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("C4 PLUGINS= and HUMAN_SESSIONS= count before the scope: --plugin terse narrows SESSIONS alone",
  "the plan's first lines say what exists before the user narrows it; counted after the filter they would say only what was already chosen",
  async () => {
    const r = await corpus("terse-only", ["--plugin", "terse"]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = expect(r.out, { PLUGINS: "entrust:2 terse:1", HUMAN_SESSIONS: "5", SESSIONS: "1 loaded=1 cache=1 checkout=0 refusals=0" });
    if (indexOf("terse-only").sessions.map((e) => e.session).join() !== S.terse) problems.push("the corpus is not the terse session alone");
    return problems.length === 0 || problems.join("; ");
  });

test("C5 a fork is one task: T1 names both files, its copied turns are written once, and its own turns are T1.f1",
  "a resumed or forked session repeats every earlier turn with the same time; read as two tasks it doubles the evidence and a reader counts one incident twice",
  () => {
    if (!runs.default) return "C1 made no run";
    const idx = indexOf("default");
    const turns = turnsOf("default");
    const problems = [];
    const t1 = idx.sessions.find((e) => e.id === "T1");
    if (t1?.session !== S.main || JSON.stringify(t1?.forks) !== JSON.stringify([{ id: "T1.f1", session: S.fork, path: path.join(alpha, `${S.fork}.jsonl`) }]))
      problems.push(`T1 is ${t1?.session} with forks ${JSON.stringify(t1?.forks)}`);
    if (idx.sessions.some((e) => e.session === S.fork)) problems.push("the fork has a T-id of its own");
    const forkTurns = turns.filter((t) => t.t === "T1.f1").map((t) => t.text);
    if (JSON.stringify(forkTurns) !== JSON.stringify(["the fork goes on from here", "Continuing in the fork."])) problems.push(`T1.f1 turns: ${JSON.stringify(forkTurns)}`);
    if (turns.filter((t) => t.text === "the codex step was slow").length !== 1) problems.push("a copied turn is written twice");
    if (t1 && (t1.codex.length !== 2 || t1.loads.length !== 1)) problems.push(`the fork's copies counted again: ${t1.codex.length} launches, ${t1.loads.length} loads`);
    return problems.length === 0 || problems.join("; ");
  });

test("C6 the skill's own session is excluded and listed, comes back through --session past every other option, and an unknown --session is exit 2",
  "a run of this skill reads the user's sessions and would quote itself; the owner decides to include one by naming it, and a session the user named is taken whatever the other options say",
  async () => {
    if (!runs.default) return "C1 made no run";
    const idx = indexOf("default");
    const problems = [];
    if (idx.sessions.some((e) => e.session === S.self)) problems.push("the skill's session is in the default corpus");
    if (JSON.stringify(idx.selfRuns.map((s) => s.session)) !== JSON.stringify([S.self])) problems.push(`selfRuns ${JSON.stringify(idx.selfRuns)}`);
    const r = await corpus("self", ["--session", S.self, "--version", "9.9.9", "--since", "2026-09-26", "--project", "/elsewhere"]);
    if (r.code !== 0) problems.push(`--session exit ${r.code}: ${r.err.slice(0, 160)}`);
    else {
      problems.push(...expect(r.out, { SESSIONS: "1 loaded=1 cache=1 checkout=0 refusals=0", SELF_RUNS: "1" }));
      const s = indexOf("self").sessions;
      if (s.length !== 1 || s[0].session !== S.self || s[0].self !== true) problems.push(`the corpus is ${JSON.stringify(s.map((e) => e.session))}`);
    }
    const bad = await run(["corpus", "--slug", "nobody", "--session", "no-such-session"]);
    if (bad.code !== 2) problems.push(`unknown --session exit ${bad.code}`);
    if (fs.existsSync(path.join(state, "prepare-feedback", `${today}-nobody`))) problems.push("an unknown --session made a run");
    return problems.length === 0 || problems.join("; ");
  });

test("C7 --all-sessions, --project, --version, --since and --until each set the scope the plan names, and --project takes subdirectories but no sibling",
  "the user narrows the corpus in words after the plan, and each word becomes one option; an option that selects the wrong sessions puts someone else's work in the report",
  async () => {
    const problems = [];
    for (const [slug, args, want] of [
      ["all", ["--all-sessions"], [S.main, S.plain, S.terse, S.checkout, S_ALPHABET]],
      ["alpha", ["--project", "/work/alpha"], [S.main, S.checkout]],
      ["alpha-all", ["--all-sessions", "--project", "/work/alpha"], [S.main, S.checkout]],
      ["v020", ["--version", "0.20.0..0.20.9"], [S.main]],
      ["since", ["--since", "2026-09-21"], [S.terse, S.checkout]],
      ["until", ["--until", "2026-09-21"], [S.main, S.terse]],
    ]) {
      const r = await corpus(slug, args);
      if (r.code !== 0) { problems.push(`${args.join(" ")}: exit ${r.code}: ${r.err.slice(0, 120)}`); continue; }
      const got = indexOf(slug).sessions.map((e) => e.session);
      if (JSON.stringify([...got].sort()) !== JSON.stringify([...want].sort())) problems.push(`${args.join(" ")}: ${got.length} sessions, expected ${want.length}`);
    }
    return problems.length === 0 || problems.join("; ");
  });

test("C10 under --version, checkout= still counts the checkout sessions every other option keeps, less those a cache load in range keeps already, and a repeated --version unknown adds them",
  "the plan asks whether sessions loaded from a checkout, whose version is unknown, belong in a version report; the question needs the number an answer would add under --version, and the answer is one more --version, not a new option",
  async () => {
    const problems = [];
    let r = await corpus("v020-only", ["--version", "0.20.0"]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 160)}`;
    problems.push(...expect(r.out, { SESSIONS: "1 loaded=1 cache=1 checkout=1 refusals=0" }));
    r = await corpus("v020-unknown", ["--version", "0.20.0", "--version", "unknown"]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 160)}`;
    problems.push(...expect(r.out, { SESSIONS: "2 loaded=2 cache=1 checkout=1 refusals=1" }));
    const got = indexOf("v020-unknown").sessions.map((e) => e.session);
    if (JSON.stringify(got) !== JSON.stringify([S.main, S.checkout])) problems.push(`--version 0.20.0 --version unknown took ${got.length} sessions`);
    r = await corpus("v-alpha", ["--version", "unknown", "--project", "/work/beta"]);
    if (r.code !== 0 || value(r.out, "SESSIONS") !== "0 loaded=0 cache=0 checkout=0 refusals=0") problems.push(`checkout= counted a session --project drops: ${value(r.out, "SESSIONS")}`);
    const bad = await run(["corpus", "--slug", "v-bad", "--version", "latest"]);
    if (bad.code !== 2) problems.push(`--version latest exit ${bad.code}`);
    for (const [slug, args, sessions, want] of [
      ["g-v020", ["--version", "0.20.0"], [G.mixed], "1 loaded=1 cache=1 checkout=1 refusals=0"],
      ["g-v020-unknown", ["--version", "0.20.0", "--version", "unknown"], [G.mixed, G.checkout], "2 loaded=2 cache=1 checkout=1 refusals=0"],
    ]) {
      r = await run(["corpus", "--slug", slug, ...args], { CLAUDE_CONFIG_DIR: config2 });
      if (r.code !== 0) { problems.push(`${slug}: exit ${r.code}: ${r.err.slice(0, 120)}`); continue; }
      if (value(r.out, "SESSIONS") !== want) problems.push(`${slug}: SESSIONS=${value(r.out, "SESSIONS")}, expected ${want}`);
      const idx = JSON.parse(fs.readFileSync(path.join(value(r.out, "RUN"), "corpus", "index.json"), "utf8"));
      if (JSON.stringify(idx.sessions.map((e) => e.session)) !== JSON.stringify(sessions)) problems.push(`${slug}: took ${idx.sessions.length} sessions`);
    }
    return problems.length === 0 || problems.join("; ");
  });

test("C11 when a fork and its original start at the same time, the file made first is the task's main transcript, whatever the names",
  "a fork can copy its original from the very first record, so the first times tie; the main transcript is where a reader starts and what a T3:282 address points into",
  async () => {
    const original = path.join(gamma, `${G.original}.jsonl`), fork = path.join(gamma, `${G.fork}.jsonl`);
    const start = [["2026-09-24T09:00:00.000Z", human("the same first message")], ["2026-09-24T09:00:01.000Z", said("The same first answer.")]];
    transcript(original, G.original, "/work/gamma", [...start, ["2026-09-24T09:10:00.000Z", human("the original goes on")]]);
    const made = Date.now();
    while (Date.now() - made < 20) { /* a birth time the fork cannot share */ }
    transcript(fork, G.fork, "/work/gamma", [...start, ["2026-09-24T09:20:00.000Z", human("the fork goes its own way")]]);
    if (!(fs.statSync(original).birthtimeMs < fs.statSync(fork).birthtimeMs))
      return skip("this filesystem records no birth time, so the tie falls to the file name");
    const r = await run(["corpus", "--slug", "tie", "--session", G.original, "--session", G.fork], { CLAUDE_CONFIG_DIR: config2 });
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 160)}`;
    const s = JSON.parse(fs.readFileSync(path.join(value(r.out, "RUN"), "corpus", "index.json"), "utf8")).sessions;
    return (s.length === 1 && s[0].session === G.original && JSON.stringify(s[0].forks.map((f) => f.session)) === JSON.stringify([G.fork]))
      || `the task is ${JSON.stringify(s.map((e) => [e.session, e.forks.map((f) => f.session)]))}`;
  });

test("C12 a background call whose notification arrived queued, as an enqueue and an attachment, is in flight until the earlier of them, and the wait is working time, not a gap",
  "while the assistant is busy a notification is queued rather than written as a user record; read from user records alone, 629 of 868 background calls on one machine never ended, and their runs showed as gaps",
  async () => {
    const r = await run(["corpus", "--slug", "queued", "--session", G.queued], { CLAUDE_CONFIG_DIR: config2 });
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 160)}`;
    const e = JSON.parse(fs.readFileSync(path.join(value(r.out, "RUN"), "corpus", "index.json"), "utf8")).sessions[0];
    const got = [e?.wallMs, e?.activeMs, e?.userMs, e?.gapCount];
    return JSON.stringify(got) === JSON.stringify([1205000, 1205000, 0, 0]) || `wall, active, user, gaps: ${JSON.stringify(got)}`;
  });

test("C8 corpus on an existing run is refused with exit 10, and the run is untouched",
  "nothing in a run is rewritten; a narrower scope after the plan is a new --slug, so the first corpus stays what the plan was shown",
  async () => {
    if (!runs.default) return "C1 made no run";
    const before = fs.readFileSync(path.join(runs.default, "corpus", "index.json"), "utf8");
    const r = await run(["corpus", "--slug", "default"]);
    if (r.code !== 10) return `exit ${r.code}`;
    return fs.readFileSync(path.join(runs.default, "corpus", "index.json"), "utf8") === before || "index.json was rewritten";
  });

test("C9 turns.jsonl carries t, line, role and text, each line the line of its source JSONL, subagents as T1.s<n>, no harness or peer message as a human one, and a launch only from a command's result",
  "the report's addresses (T3:282, T3.s2:198) are read back from these lines, and a reader opens the transcript at that line; a threadId read out of a file is a quotation, not a Codex run",
  () => {
    if (!runs.default) return "C1 made no run";
    const turns = turnsOf("default");
    const problems = [];
    const shapes = turns.filter((t) => JSON.stringify(Object.keys(t)) !== JSON.stringify(["t", "line", "role", "text"]));
    if (shapes.length) problems.push(`${shapes.length} lines with other keys: ${JSON.stringify(Object.keys(shapes[0]))}`);
    const slow = turns.find((t) => t.text === "the codex step was slow");
    if (!slow || slow.t !== "T1" || slow.role !== "user" || slow.line !== lineOf(MAIN, saysText("the codex step was slow"))) problems.push(`the human turn is ${JSON.stringify(slow)}`);
    const sub = turns.find((t) => t.text === "The plugin reads well.");
    if (!sub || sub.t !== "T1.s1" || sub.line !== lineOf(A1, saysText("The plugin reads well."))) problems.push(`the subagent turn is ${JSON.stringify(sub)}`);
    const brief = turns.find((t) => t.text === "Count the tests.");
    if (brief?.t !== "T1.s2" || brief?.role !== "user") problems.push(`the background agent's brief is ${JSON.stringify(brief)}`);
    const refused = turns.find((t) => t.role === "tool_error");
    if (!refused?.text.includes("entrust:orchestrate")) problems.push("the refusal is not a tool_error turn");
    if (turns.some((t) => t.text.startsWith("<task-notification>"))) problems.push("a task notification is a turn");
    if (turns.some((t) => t.text === "a note another session sent")) problems.push("a peer session's message is a human turn");
    const idx = indexOf("default");
    const t3 = idx.sessions.find((e) => e.session === S.checkout);
    const t3threads = (t3?.codex ?? []).map((c) => c.threadId);
    if (!t3 || t3threads.includes(thread(6)) || t3threads.includes(thread(7))) problems.push("a threadId read out of a file, by Read or by cat, counted as a launch");
    if (!t3threads.includes(thread(8))) problems.push("a background launch's .output read back is not a launch");
    const t1 = idx.sessions.find((e) => e.id === "T1");
    const agents = t1?.subagents.map((a) => [a.id, a.agentId, a.tokens, a.type]);
    if (JSON.stringify(agents) !== JSON.stringify([["T1.s1", "a1", 1234, "general-purpose"], ["T1.s2", "a2", 777, "acme:reviewer"], ["T1.s3", "a3", null, null]])) problems.push(`subagents ${JSON.stringify(agents)}`);
    const launched = t1?.codex.map((c) => [c.at, !!c.reportFound, c.threadId, !!c.rollout]);
    const wantLaunches = [[`T1:${lineOf(MAIN, saysText("REPORT="))}`, true, TH.reported, true], [`T1.s1:${lineOf(A1, saysText("receiptPath"))}`, false, TH.receipt, true]];
    if (JSON.stringify(launched) !== JSON.stringify(wantLaunches)) problems.push(`T1 launches ${JSON.stringify(launched)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("Q1 quotes finds an exact quote, a near one with the closest text and its address, and a missing one, passing other fields through",
  "a merged episode whose quote is not in the corpus is a claim with no evidence; a near one is a paraphrase the draft must not print as a quotation",
  async () => {
    if (!runs.default) return "C1 made no run";
    const episodes = draft("episodes-1.jsonl", [
      { id: "e1", quote: "the codex step was slow", label: "friction" },
      { id: "e2", quote: "The Codex step was really slow!", label: "friction" },
      { quote: "bananas ripen on tuesdays in the orchard" },
      { id: 4, quote: "the fork goes on from here" },
    ].map((e) => JSON.stringify(e)).join("\n"));
    const r = await run(["quotes", "--run", runs.default, "--episodes", episodes]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = [];
    if (r.out.trim() !== "QUOTES=4 EXACT=2 NEAR=1 MISSING=1") problems.push(`printed ${r.out.trim()}`);
    const saved = path.join(runs.default, "ledger", "quotes-episodes-1.json");
    const res = fs.existsSync(saved) ? JSON.parse(fs.readFileSync(saved, "utf8")).results : [];
    const slow = `T1:${lineOf(MAIN, saysText("the codex step was slow"))}`;
    const fork = `T1.f1:${lineOf(FORK, saysText("the fork goes on from here"))}`;
    const got = res.map((x) => [x.id, x.verdict, x.at, x.match, x.label]);
    const want = [["e1", "exact", slow, undefined, "friction"], ["e2", "near", slow, "the codex step was slow", "friction"],
      [undefined, "missing", undefined, undefined, undefined], [4, "exact", fork, undefined, undefined]];
    if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`results ${JSON.stringify(got)}`);
    const bad = await run(["quotes", "--run", runs.default, "--episodes", draft("episodes-2.jsonl", '{"id":"x"}\n')]);
    if (bad.code !== 2) problems.push(`an episode without a quote exit ${bad.code}`);
    const again = await run(["quotes", "--run", runs.default, "--episodes", episodes]);
    if (again.code !== 10) problems.push(`a second quotes-episodes-1 exit ${again.code}`);
    return problems.length === 0 || problems.join("; ");
  });

const lineIn = (entries, predicate) => `T1:${lineOf(entries, predicate)}`;
const isCall = (command) => (r) => r.message?.content?.[0]?.input?.command === command;
const inT3 = (predicate) => `T3:${lineOf(CHECKOUT_S, predicate)}`;
const PRIVATE = ["acme", "mcp__"];
const TEXTS = ["git status --short", "review the plugin", "Review the plugin and say what you found.", "the codex step was slow", "please review the entrust plugin"];
const strings = (v) => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);

test("M1 corpus records each task's process counts: API calls, wall time split into the run working, waiting for the person and gaps by what ends each pause, tools, a repeated command by hash, the largest outputs, and each Codex run's report fields",
  "the process focus asks where a run's time and tokens went and where it waited; a person reading and typing is not the run working (34% of active time on real data before the split), a 20-minute foreground Agent call is the run working and not a gap, a fork's copies count once, a repeated command is kept as a hash in the private index and never as its text, and a message streamed as several records counts its last usage, since the first held a partial output count that undercounted two Haiku subagents by 2,165 tokens in the first live process run (2026-09-29)",
  () => {
    if (!runs.default) return "C1 made no run";
    const t1 = indexOf("default").sessions.find((e) => e.id === "T1");
    if (!t1) return "no T1";
    const problems = [];
    const pick = (e) => ({ apiCalls: e?.apiCalls, wallMs: e?.wallMs, activeMs: e?.activeMs, userMs: e?.userMs, gapCount: e?.gapCount, gaps: e?.gaps, tools: e?.tools });
    const want = { apiCalls: 3, wallMs: 3601000, activeMs: 32000, userMs: 3569000, gapCount: 0, gaps: [], tools: { Bash: 3, Agent: 2, Read: 1 } };
    if (JSON.stringify(pick(t1)) !== JSON.stringify(want)) problems.push(`T1 counts ${JSON.stringify(pick(t1))}`);
    const t3 = indexOf("default").sessions.find((e) => e.session === S.checkout);
    const want3 = { apiCalls: 4, wallMs: 4807000, activeMs: 1943000, userMs: 180000, gapCount: 2,
      gaps: [{ ms: 1784000, after: "tool_result:Bash", before: "tool_use:Agent", at: inT3(saysText(thread(8))) },
        { ms: 900000, after: "tool_result:mcp__acme_tracker__get_issue", before: "notification", at: inT3(saysText("the issue as the tracker has it")) }],
      tools: { Bash: 4, Agent: 2, Skill: 2, Read: 1, mcp__acme_tracker__get_issue: 1 } };
    if (JSON.stringify(pick(t3)) !== JSON.stringify(want3)) problems.push(`T3 counts ${JSON.stringify(pick(t3))}`);
    const git = lineOf(MAIN, isCall("git status --short"));
    const second = MAIN.findIndex(([, r], i) => i + 1 > git && isCall("git status --short")(r)) + 1;
    const wantRepeat = [{ sha256: crypto.createHash("sha256").update("git status --short").digest("hex"), chars: 18, count: 2, at: [`T1:${git}`, `T1:${second}`] }];
    if (JSON.stringify(t1.repeats) !== JSON.stringify(wantRepeat)) problems.push(`repeats ${JSON.stringify(t1.repeats)}`);
    const big = lineIn(MAIN, (r) => r.message?.content?.[0]?.content?.length === 5000);
    if (JSON.stringify(t1.outputs?.[0]) !== JSON.stringify({ tool: "Read", bytes: 5000, at: big })) problems.push(`largest output ${JSON.stringify(t1.outputs?.[0])}`);
    if (strings({ repeats: t1.repeats, outputs: t1.outputs, gaps: t1.gaps }).some((s) => TEXTS.some((x) => s.includes(x)))) problems.push("a count carries transcript text");
    const s1 = t1.subagents.find((a) => a.id === "T1.s1");
    if (JSON.stringify([s1?.apiCalls, s1?.tools, s1?.usage]) !== JSON.stringify([1, { Bash: 1 }, { input: 10, cacheWrite: 20, cacheRead: 100, output: 5 }])) problems.push(`T1.s1 counts ${JSON.stringify([s1?.apiCalls, s1?.tools, s1?.usage])}`);
    const s3 = t1.subagents.find((a) => a.id === "T1.s3");
    if (JSON.stringify([s3?.apiCalls, s3?.usage, s3?.wallMs, s3?.durationMs]) !== JSON.stringify([0, null, 5000, null])) problems.push(`T1.s3 counts ${JSON.stringify([s3?.apiCalls, s3?.usage, s3?.wallMs, s3?.durationMs])}`);
    const c1 = t1.codex[0];
    const fields = ["id", "model", "effort", "tokens", "cached", "wallMs", "commandMs", "modelMs", "exitCode", "turnStatus", "commandsSucceeded", "commandsFailed", "commandsDeclined"];
    const wantRun = ["T1.c1", "codex-test-model", "high", 500, 400, 31000, 5000, 25000, 3, "completed", 4, 1, 0];
    if (JSON.stringify(fields.map((k) => c1?.[k])) !== JSON.stringify(wantRun)) problems.push(`T1.c1 ${JSON.stringify(fields.map((k) => c1?.[k]))}`);
    if (t1.codex[1]?.id !== "T1.c2" || t1.codex[1]?.tokens !== null) problems.push(`a run without a report: ${JSON.stringify([t1.codex[1]?.id, t1.codex[1]?.tokens])}`);
    return problems.length === 0 || problems.join("; ");
  });

test("R1 process writes measures/process.json with a row per task, a row per agent and the totals, prints its summary with USER= and FILE= last, carries no text, path, thread id or name from the user's environment, and refuses a second run and a run with no corpus",
  "a reader's brief names process.json and a report may cite it, so it holds counts, addresses and built-in or folded names only, never a command's hash, which a guess confirms: an MCP tool is mcp and an agent type of the user's own is custom; its lines go through the runner, whose tail keeps the end; a subagent's repeated command is on its row and in the totals, since the first live process run showed a subagent's repeat as none",
  async () => {
    if (!runs.default) return "C1 made no run";
    const r = await run(["process", "--run", runs.default]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = [];
    const want = [
      "TASKS=3", "WALL=9608", "ACTIVE=3175 GAP=600s", "USER=3749", `GAPS=2 LARGEST=1784 at ${inT3(saysText(thread(8)))}`,
      "COORD=2700 share=78% cache_read=74% api_calls=20", "AGENTS=3 tokens=270 share=8%", "CODEX=4 tokens=500 share=14% nonzero_exit=1",
      "TOOLS=Bash:7 Agent:4 Read:2 Skill:2 mcp:1", `REPEATS=2 MOST=2x at T1.s3:${lineOf(A3, isCall("ls tests"))}`,
      `OUTPUTS=5000 at ${lineIn(MAIN, (x) => x.message?.content?.[0]?.content?.length === 5000)}`, "FILE=measures/process.json",
    ];
    if (r.out.trim() !== want.join("\n")) problems.push(`printed ${JSON.stringify(r.out.trim().split("\n"))}`);
    const file = path.join(runs.default, "measures", "process.json");
    const p = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
    if (JSON.stringify(Object.keys(p)) !== JSON.stringify(["gap", "tasks", "agents", "totals"]) || p.gap !== 600) problems.push(`process.json keys ${JSON.stringify(Object.keys(p))}`);
    const taskKeys = ["id", "wallMs", "activeMs", "userMs", "apiCalls", "tokens", "tools", "gapCount", "gaps", "repeats", "outputs", "agentTokens", "codexTokens"];
    if (JSON.stringify(Object.keys(p.tasks?.[0] ?? {})) !== JSON.stringify(taskKeys)) problems.push(`task row keys ${JSON.stringify(Object.keys(p.tasks?.[0] ?? {}))}`);
    const rows = (p.agents ?? []).map((a) => JSON.stringify(a));
    const ls = (k) => `T1.s3:${A3.findIndex(([, r], i) => isCall("ls tests")(r) && --k === 0) + 1}`;
    for (const row of [{ id: "T1.s1", task: "T1", model: "claude-opus", type: "general-purpose", tokens: 135, durationMs: 5000, toolUses: 3, exit: null, repeats: [] },
      { id: "T1.s2", task: "T1", model: "claude-sonnet", type: "custom", tokens: 135, durationMs: 900, toolUses: 2, exit: null, repeats: [] },
      { id: "T1.s3", task: "T1", model: null, type: null, tokens: null, durationMs: 5000, toolUses: null, exit: null, repeats: [{ chars: 8, count: 2, at: [ls(1), ls(2)] }] },
      { id: "run:T1.c1", task: "T1", model: "codex-test-model", type: "codex", tokens: 500, durationMs: 31000, toolUses: 4, exit: 3, repeats: null }])
      if (!rows.includes(JSON.stringify(row))) problems.push(`no agent row ${row.id}`);
    if ((p.agents ?? []).length !== 7) problems.push(`${(p.agents ?? []).length} agent rows`);
    const t3row = (p.tasks ?? []).find((t) => t.id === "T3");
    if (JSON.stringify([t3row?.tools, t3row?.gaps?.[1]?.after]) !== JSON.stringify([{ Bash: 4, Agent: 2, Skill: 2, Read: 1, mcp: 1 }, "tool_result:mcp"]))
      problems.push(`T3 row folds to ${JSON.stringify([t3row?.tools, t3row?.gaps?.[1]?.after])}`);
    const raw = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
    if (PRIVATE.some((x) => raw.includes(x))) problems.push("process.json names an MCP server or a custom agent type");
    if (raw.includes("sha256")) problems.push("process.json carries a command's hash, which a guess of the command confirms");
    const leaks = strings(p).filter((s) => TEXTS.some((x) => s.includes(x)) || Object.values(TH).some((x) => s.includes(x)) || s.includes("/"));
    if (leaks.length) problems.push(`process.json carries text, a path or a thread id: ${JSON.stringify(leaks.slice(0, 3))}`);
    const again = await run(["process", "--run", runs.default]);
    if (again.code !== 10) problems.push(`a second process exit ${again.code}`);
    const hollow = path.join(fs.realpathSync(state), "prepare-feedback", `${today}-hollow`);
    fs.mkdirSync(hollow);
    const early = await run(["process", "--run", hollow]);
    if (early.code !== 10 || fs.readdirSync(hollow).length !== 0) problems.push(`process before corpus: exit ${early.code}`);
    return problems.length === 0 || problems.join("; ");
  });

const tl = { run: null, events: [] };
test("TL1 timeline writes one event a line in time order, the owner's messages typed and queued, as blocks or a string, apart from a peer's return, a typed skill apart from the model's Skill calls, plugin reads by Read, Grep and Bash with the path from the plugin's root, drafts, replies, a subagent with the pages it read itself, and a fork where it left its original",
  "what the model read before each draft and what the owner said while it worked changed the conclusions of the 2026-09-29 clarity review, and a reader of the transcript missed two queued owner messages and took a subagent's return for the owner's; the facts come from the script, not from a model's memory",
  async () => {
    let r = await run(["corpus", "--slug", "timeline"], { CLAUDE_CONFIG_DIR: config3 });
    if (r.code !== 0) return `corpus exit ${r.code}: ${r.err.slice(0, 160)}`;
    tl.run = value(r.out, "RUN");
    r = await run(["timeline", "--run", tl.run], { CLAUDE_CONFIG_DIR: config3 });
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = [];
    const want = ["OWNER=4 queued=2", "COMMAND=1", "SKILL=2 loaded=1 refused=1", "READ=4", "DRAFT=1", "REPLY=3", "AGENT=1 reads=1", "FORK=1", "FILE=corpus/timeline.jsonl"];
    if (r.out.trim() !== want.join("\n")) problems.push(`printed ${JSON.stringify(r.out.trim().split("\n"))}`);
    tl.events = fs.readFileSync(path.join(tl.run, "corpus", "timeline.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
    const ev = tl.events;
    const main = (pred) => `T1:${lineOf(DMAIN, pred)}`;
    if (ev.some((e) => e.source !== "transcript" || !e.t || !e.at)) problems.push("an event without source, t or at");
    const sorted = [...ev].sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0));
    if (JSON.stringify(sorted.map((e) => e.t)) !== JSON.stringify(ev.map((e) => e.t))) problems.push("events out of time order");
    const owners = ev.filter((e) => e.kind === "owner").map((e) => [e.text, e.queued, e.at]);
    const wantOwners = [["please write the ticket", false, "T1:1"], ["no codex, only luna there", true, main((x) => x.attachment?.prompt?.[0]?.text)],
      ["fix the second line", true, main((x) => x.attachment?.prompt === "fix the second line")], ["take the other road", false, `T1.f1:${DFORK.findIndex(([, x]) => JSON.stringify(x).includes("take the other road")) + 1}`]];
    if (JSON.stringify(owners) !== JSON.stringify(wantOwners)) problems.push(`owner events ${JSON.stringify(owners)}`);
    if (ev.some((e) => JSON.stringify(e).includes("agent-return"))) problems.push("the subagent's queued return became an event");
    const cmd = ev.find((e) => e.kind === "command");
    if (JSON.stringify([cmd?.name, cmd?.args]) !== JSON.stringify(["terse:clarity", "check it"])) problems.push(`command ${JSON.stringify(cmd)}`);
    const skills = ev.filter((e) => e.kind === "skill").map((e) => [e.name, e.status]);
    if (JSON.stringify(skills) !== JSON.stringify([["entrust:codex", "loaded"], ["entrust:orchestrate", "refused"]])) problems.push(`skills ${JSON.stringify(skills)}`);
    const reads = ev.filter((e) => e.kind === "read").map((e) => [e.plugin, e.version, e.path, e.tool]);
    const wantReads = [["terse", "0.5.0", "references/genres/ticket.md", "Read"], ["terse", "0.5.0", "references", "Grep"],
      ["terse", "0.5.0", "references/rules.md", "Bash"], ["terse", "0.5.0", "references/truth.md", "Bash"]];
    if (JSON.stringify(reads) !== JSON.stringify(wantReads)) problems.push(`reads ${JSON.stringify(reads)}`);
    const draft = ev.find((e) => e.kind === "draft");
    if (JSON.stringify([draft?.path, draft?.tool, draft?.at]) !== JSON.stringify(["/work/delta/ticket.md", "Write", main((x) => x.message?.content?.[0]?.name === "Write")])) problems.push(`draft ${JSON.stringify(draft)}`);
    if (JSON.stringify(ev.filter((e) => e.kind === "reply").map((e) => e.text)) !== JSON.stringify(["Drafting.", "Done with the ticket.", "Other road."])) problems.push("replies differ");
    const agent = ev.find((e) => e.kind === "agent");
    const wantAgent = { id: "T1.s1", type: "general-purpose", model: "claude-sonnet", prompt: "check the rules page", answer: "the rules are fine", at: main((x) => x.message?.content?.[0]?.name === "Agent"),
      reads: [{ t: at8("00:28"), at: `T1.s1:${lineOf(DSUB, (x) => x.message?.content?.[0]?.name === "Read")}`, plugin: "terse", version: "0.5.0", path: "references/rules.md", tool: "Read" }] };
    const gotAgent = agent && { id: agent.id, type: agent.type, model: agent.model, prompt: agent.prompt, answer: agent.answer, at: agent.at, reads: agent.reads };
    if (JSON.stringify(gotAgent) !== JSON.stringify(wantAgent)) problems.push(`agent ${JSON.stringify(gotAgent)}`);
    const fork = ev.find((e) => e.kind === "fork");
    if (JSON.stringify([fork?.task, fork?.fork, fork?.title, fork?.at, fork?.t]) !== JSON.stringify(["T1", "T1.f1", "ticket (fork)", wantOwners[3][2], "2026-09-26T08:05:00.000Z"])) problems.push(`fork ${JSON.stringify(fork)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("TL2 an owner message queued while the model worked is a user turn and the person's input in the time split, a peer's queued return is neither, and the first message as blocks is the owner's",
  "turns.jsonl feeds extraction and quotes, and the time split's USER= is the owner's time; a queued message dropped there is a reply nobody reads, a peer counted there is a subagent taken for the owner",
  () => {
    if (!tl.run) return "TL1 made no run";
    const turns = fs.readFileSync(path.join(tl.run, "corpus", "turns.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
    const problems = [];
    for (const text of ["please write the ticket", "no codex, only luna there", "fix the second line"])
      if (!turns.some((t) => t.t === "T1" && t.role === "user" && t.text === text)) problems.push(`no user turn for "${text}"`);
    if (turns.some((t) => t.text.includes("agent-return"))) problems.push("the peer's return is a turn");
    const t1 = JSON.parse(fs.readFileSync(path.join(tl.run, "corpus", "index.json"), "utf8")).sessions[0];
    if (t1?.userMs !== 265000) problems.push(`userMs ${t1?.userMs}, expected 265000 (7 s before the typed command, 1 s before each queued message, 256 s before the fork's)`);
    return problems.length === 0 || problems.join("; ");
  });

test("TL3 timeline refuses a second run and a run with no corpus with exit 10",
  "the timeline holds transcript text and stays in the private folder; nothing in a run is rewritten",
  async () => {
    if (!tl.run || !runs.default) return "TL1 or C1 made no run";
    const problems = [];
    const again = await run(["timeline", "--run", tl.run], { CLAUDE_CONFIG_DIR: config3 });
    if (again.code !== 10) problems.push(`a second timeline exit ${again.code}`);
    const hollow = path.join(fs.realpathSync(state), "prepare-feedback", `${today}-hollow`);
    if (!fs.existsSync(hollow)) fs.mkdirSync(hollow);
    const early = await run(["timeline", "--run", hollow]);
    if (early.code !== 10 || fs.readdirSync(hollow).length !== 0) problems.push(`timeline before corpus: exit ${early.code}`);
    const own = await run(["timeline", "--run", runs.default]);
    if (own.code !== 0 || !fs.existsSync(path.join(runs.default, "corpus", "timeline.jsonl"))) problems.push(`timeline on the default run: exit ${own.code}`);
    return problems.length === 0 || problems.join("; ");
  });

const tl4 = { reads: null };
const bashRead = async () => {
  if (tl4.reads) return tl4.reads;
  let r = await run(["corpus", "--slug", "bash-reads"], { CLAUDE_CONFIG_DIR: config4 });
  if (r.code !== 0) return null;
  const runDir4 = value(r.out, "RUN");
  r = await run(["timeline", "--run", runDir4], { CLAUDE_CONFIG_DIR: config4 });
  if (r.code !== 0) return null;
  tl4.reads = fs.readFileSync(path.join(runDir4, "corpus", "timeline.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l))
    .filter((e) => e.kind === "read").map((e) => [e.at.split(":")[1], e.plugin, e.path, e.unresolved ?? false]);
  return tl4.reads;
};
const lineIn4 = (hms) => String(BASH4.findIndex(([ts]) => ts === at9(hms)) + 1);

test("TL4 a Bash read after cd into a plugin names the page by its relative path, a grep pattern and a count are not pages, and a cd outside a plugin reads none",
  "23 of 50 commands on one machine cd into a plugin and then read a page by a relative name; none reached the timeline, and one missed read before a draft turns 'opened' into 'not opened'",
  async () => {
    const reads = await bashRead();
    if (!reads) return "corpus or timeline failed";
    const got = reads.filter(([line]) => line === lineIn4("00:02") || line === lineIn4("00:04"));
    const want = [[lineIn4("00:02"), "terse", "references/rules.md", false], [lineIn4("00:02"), "terse", "references/truth.md", false]];
    return JSON.stringify(got) === JSON.stringify(want) || `reads ${JSON.stringify(got)}`;
  });

test("TL5 a for-loop over literal words reads each page it names, and a loop nothing can expand is one read with * and unresolved: true, never a literal $",
  "a loop variable left as $s named a page that does not exist (skills/$s/SKILL.md) in the field session's fork; a page the script cannot name is still a read, marked as such",
  async () => {
    const reads = await bashRead();
    if (!reads) return "corpus or timeline failed";
    const got = reads.filter(([line]) => line === lineIn4("00:06") || line === lineIn4("00:08"));
    const want = [[lineIn4("00:06"), "entrust", "skills/codex/SKILL.md", false], [lineIn4("00:06"), "entrust", "skills/swarm/SKILL.md", false],
      [lineIn4("00:08"), "entrust", "skills/*/SKILL.md", true]];
    if (reads.some(([, , p]) => p.includes("$"))) return `a path holds a literal $: ${JSON.stringify(reads)}`;
    return JSON.stringify(got) === JSON.stringify(want) || `reads ${JSON.stringify(got)}`;
  });

test("TL6 sed reads a page when it prints it, with or without -n, and not when it edits the file in place",
  "sed without -n prints the whole file, the same read as cat; sed -i writes the file and prints nothing",
  async () => {
    const reads = await bashRead();
    if (!reads) return "corpus or timeline failed";
    const got = reads.filter(([line]) => line === lineIn4("00:10") || line === lineIn4("00:12"));
    const want = [[lineIn4("00:10"), "terse", "references/genres/ticket.md", false]];
    return JSON.stringify(got) === JSON.stringify(want) || `reads ${JSON.stringify(got)}`;
  });

process.exit(summarize(await runCases(CASES), CASES.length));
