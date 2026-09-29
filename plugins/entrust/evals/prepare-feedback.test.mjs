#!/usr/bin/env node
// Does skills/prepare-feedback/SKILL.md carry the interface its script was agreed to have, and does
// skills/prepare-feedback/scripts/prepare-feedback.mjs build the private folder it promises?
//
//   node evals/prepare-feedback.test.mjs
//
// The page cases pin only what the page and the script share: the frontmatter, the script's command line, the
// seven commands, the two directory forms, the link to focuses.md and the page's budget; none of its prose. The
// script cases run it in a synthetic world under one harness temp directory: transcripts under
// CLAUDE_CONFIG_DIR, Codex rollouts under CODEX_HOME, reports beside them, and ENTRUST_STATE_DIR pointing at a
// scratch state with CLAUDE_PLUGIN_DATA unset, so nothing reaches the machine's own data or transcripts. Every
// record is built here in the shapes Claude Code and Codex write; no line of a real transcript is in it.

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT, registry, runCases, skip, spawnNode, summarize, tempDir } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();

const PAGE = "skills/prepare-feedback/SKILL.md";
const SCRIPT = path.join(ROOT, "skills", "prepare-feedback", "scripts", "prepare-feedback.mjs");
const COMMANDS = ["corpus", "parts", "add", "coverage", "quotes", "tokens", "export"];
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

test("the page calls the script in one indented line that forwards the data directory",
  "Claude Code substitutes ${CLAUDE_PLUGIN_DATA} only in a skill's body, and the script refuses to run without a state directory",
  () => /^ {4}CLAUDE_PLUGIN_DATA="\$\{CLAUDE_PLUGIN_DATA\}" node "\$\{CLAUDE_SKILL_DIR\}\/scripts\/prepare-feedback\.mjs" <command>/m.test(text)
    || "no line reads `    CLAUDE_PLUGIN_DATA=\"${CLAUDE_PLUGIN_DATA}\" node \"${CLAUDE_SKILL_DIR}/scripts/prepare-feedback.mjs\" <command> …`");

test("the page names each of the script's seven commands",
  "a command the page never names is one the coordinator never runs, and the step it serves is done by hand",
  () => {
    const missing = COMMANDS.filter((c) => !new RegExp("`" + c + "[` ]").test(text));
    return missing.length === 0 || `not named in backticks: ${missing.join(", ")}`;
  });

test("the page names the private folder and the orchestrate run directory in their agreed forms",
  "the script writes the first and cleanup walks the second; evals/fragments.mjs keeps the run-directory literal identical on every page that names it",
  () => {
    const missing = ["`<state>/prepare-feedback/<date>-<slug>/`", "`<state>/orchestrate/<project-slug>/<run>/`"].filter((s) => !text.includes(s.slice(1, -1)));
    return missing.length === 0 || `the page does not carry ${missing.join(" or ")}`;
  });

test("the page links references/focuses.md",
  "the focuses' units, labels and layouts live there, read when a focus is chosen, not on every load",
  () => text.includes("](references/focuses.md") || "no link to references/focuses.md");

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
  unsetEnv: ["CLAUDE_PLUGIN_DATA"], cwd: world, killAfterMs: 30000 }).done;
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
write(reportR1, [JSON.stringify({ ok: true, threadId: TH.reported, tokenUsage: { total: { totalTokens: 500 } } })]);
const rolloutDir = path.join(codexHome, "sessions", "2026", "09", "20");
const rollout = (th, records) => {
  const f = path.join(rolloutDir, `rollout-2026-09-20T10-00-00-${th}.jsonl`);
  write(f, [{ timestamp: "2026-09-20T10:00:00.000Z", type: "session_meta", payload: { id: th } }, ...records].map((r) => JSON.stringify(r)));
  return f;
};
rollout(TH.reported, []);
const receiptFile = rollout(TH.receipt, []);

// T1: a cache load of entrust 0.20.0, a REPORT= launch, a foreground and a background subagent, then its fork.
const alpha = path.join(config, "projects", "-work-alpha");
const on20 = (hms) => `2026-09-20T${hms}.000Z`;
const MAIN = transcript(path.join(alpha, `${S.main}.jsonl`), S.main, "/work/alpha", [
  [on20("10:00:00"), { type: "queue-operation", operation: "enqueue" }],
  [on20("10:00:01"), human("please review the entrust plugin")],
  [on20("10:00:02"), said("Loading the codex skill.")],
  [on20("10:00:03"), load(CACHE("entrust", "0.20.0", "codex"))],
  [on20("10:00:04"), call("Bash")],
  [on20("10:00:05"), result(`status: done\nREPORT=${reportR1}\n`)],
  [on20("10:00:06"), call("Agent")],
  [on20("10:00:07"), result("the review is done", { returned: { status: "completed", agentId: "a1", totalTokens: 1234, totalDurationMs: 5000, totalToolUseCount: 3, resolvedModel: "claude-opus" } })],
  [on20("10:00:08"), call("Agent")],
  [on20("10:00:09"), result("launched in the background", { returned: { status: "async_launched", agentId: "a2", resolvedModel: "claude-sonnet" } })],
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
  ["2026-09-20T10:00:06.800Z", { ...said("The plugin reads well."), agentId: "a1" }],
], { isSidechain: true });
write(path.join(subs, "agent-a1.meta.json"), [JSON.stringify({ agentType: "general-purpose", description: "review the plugin" })]);
transcript(path.join(subs, "agent-a2.jsonl"), S.main, "/work/alpha", [
  ["2026-09-20T10:00:09.500Z", { type: "user", agentId: "a2", message: { role: "user", content: "Count the tests." } }],
  ["2026-09-20T10:00:09.600Z", { ...said("There are twelve."), agentId: "a2" }],
  ["2026-09-20T10:00:09.700Z", { ...notice("<task-notification>\n<task-id>a3</task-id>\n<status>completed</status>\n</task-notification>"), agentId: "a2" }],
], { isSidechain: true });

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

// A second world, apart so the counts above stay as they are: one session holding a cache load of 0.20.0 and a
// checkout load, one holding only a checkout load; C11 adds a fork pair to it.
const config2 = path.join(world, "config2");
const gamma = path.join(config2, "projects", "-work-gamma");
const G = { mixed: uuid(8), checkout: uuid(9), original: uuid("b"), fork: uuid("a") };
transcript(path.join(gamma, `${G.mixed}.jsonl`), G.mixed, "/work/gamma", [
  ["2026-09-23T10:00:00.000Z", human("both kinds of load")],
  ["2026-09-23T10:00:01.000Z", load(CACHE("entrust", "0.20.0", "codex"))],
  ["2026-09-23T10:00:02.000Z", load(CHECKOUT("entrust", "swarm"))],
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
    for (const w of [...COMMANDS, "ENTRUST_STATE_DIR", "CLAUDE_PLUGIN_DATA", "CLAUDE_CONFIG_DIR", "CODEX_HOME", "10 refused", "turns.jsonl"])
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

test("S3 without a state directory nothing runs: exit 2 and nothing written",
  "the private folder's home is the data directory the page forwards; a script that invented a default would write where cleanup and the owner do not look",
  async () => {
    const r = await run(["corpus", "--slug", "nostate"], { ENTRUST_STATE_DIR: undefined });
    if (r.code !== 2) return `exit ${r.code}: ${r.err.slice(0, 160)}`;
    return fs.readdirSync(state).length === 0 || "something was written under the scratch state";
  });

test("C1 corpus makes <state>/prepare-feedback/<date>-<slug>/ at mode 0700 and prints the plan's numbers, the PROJECT= lines first and RUN= last",
  "the plan shows where the corpus came from, how many sessions and launches it holds and how many parts it will cut into; the page sends the command through the runner, whose tail keeps the last fifteen lines, and every later command needs RUN=",
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
      SELF_RUNS: "1", SUBAGENTS: "2", CODEX_RUNS: "4 reports=1 rollouts=2",
    }));
    const lines = r.out.trim().split("\n");
    const keys = lines.map((l) => l.split("=")[0]);
    const tail = ["PLUGINS", "HUMAN_SESSIONS", "PROJECTS", "SESSIONS", "RANGE", "OLDEST", "SELF_RUNS", "SUBAGENTS", "CODEX_RUNS", "CHARS", "PARTS_EST", "RUN"];
    if (JSON.stringify(keys) !== JSON.stringify(["PROJECT", "PROJECT", "PROJECT", ...tail])) problems.push(`lines in the order ${keys.join(",")}`);
    if (!/^CHARS=\d+ MESSAGES=\d+$/m.test(r.out) || !/^PARTS_EST=\d+$/m.test(r.out)) problems.push("no CHARS=/MESSAGES= or PARTS_EST= line");
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
    if (JSON.stringify(agents) !== JSON.stringify([["T1.s1", "a1", 1234, "general-purpose"], ["T1.s2", "a2", 777, null]])) problems.push(`subagents ${JSON.stringify(agents)}`);
    const launched = t1?.codex.map((c) => [c.at, !!c.reportFound, c.threadId, !!c.rollout]);
    const wantLaunches = [[`T1:${lineOf(MAIN, saysText("REPORT="))}`, true, TH.reported, true], [`T1.s1:${lineOf(A1, saysText("receiptPath"))}`, false, TH.receipt, true]];
    if (JSON.stringify(launched) !== JSON.stringify(wantLaunches)) problems.push(`T1 launches ${JSON.stringify(launched)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("P1 parts cuts within its bounds, overlaps the parts, splits only an oversized turn, and lists every page with its sha256",
  "an extraction agent reads one part a page per command, so coverage can find each page whole; a page over the bound is one no single output shows",
  async () => {
    if (!runs.default) return "C1 made no run";
    const r = await run(["parts", "--run", runs.default]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = [];
    const listing = JSON.parse(fs.readFileSync(path.join(runs.default, "corpus", "parts.json"), "utf8"));
    const parts = listing.parts;
    if (!/^PARTS=\d+ PAGES=\d+ LARGEST=\d+$/.test(r.out.trim())) problems.push(`printed ${r.out.trim()}`);
    if (value(r.out, "PARTS") !== `${parts.length} PAGES=${parts.reduce((n, p) => n + p.pages.length, 0)} LARGEST=${Math.max(...parts.map((p) => p.chars))}`) problems.push("the printed counts disagree with parts.json");
    if (parts.length < 2) problems.push(`${parts.length} parts; the fixture needs two`);
    for (const p of parts) {
      const whole = fs.readFileSync(path.join(runs.default, p.file), "utf8");
      if (p.chars > 60000 || whole.length !== p.chars) problems.push(`${p.id}: ${p.chars} characters`);
      const pages = p.pages.map((g) => fs.readFileSync(path.join(runs.default, g.file), "utf8"));
      if (pages.join("") !== whole) problems.push(`${p.id}: its pages do not make the part`);
      p.pages.forEach((g, k) => {
        if (pages[k].length > 18000 || pages[k].length !== g.chars) problems.push(`${g.id}: ${pages[k].length} characters`);
        if (crypto.createHash("sha256").update(pages[k]).digest("hex") !== g.sha256) problems.push(`${g.id}: sha256 differs`);
      });
    }
    if (parts.length >= 2 && parts[1].from !== parts[0].to) problems.push(`P002 opens at ${parts[1].from}, P001 ends at ${parts[0].to}: no overlap`);
    const continued = parts.flatMap((p) => p.pages).filter((g) => !fs.readFileSync(path.join(runs.default, g.file), "utf8").startsWith("[T"));
    if (continued.length !== 1) problems.push(`${continued.length} pages open inside a turn; the one 25,000-character turn should make one`);
    const again = await run(["parts", "--run", runs.default]);
    if (again.code !== 10) problems.push(`a second cut exit ${again.code}`);
    return problems.length === 0 || problems.join("; ");
  });

test("P2 PARTS_EST in the corpus line is the number parts then cuts",
  "the plan prices the extraction from PARTS_EST before any part exists; an estimate that is not the cut prices a different batch",
  async () => {
    if (!runs.default) return "C1 made no run";
    const listing = path.join(runs.default, "corpus", "parts.json");
    if (!fs.existsSync(listing)) return "P1 made no parts";
    const r = await corpus("estimate");
    if (r.code !== 0) return `exit ${r.code}`;
    const n = JSON.parse(fs.readFileSync(listing, "utf8")).parts.length;
    return value(r.out, "PARTS_EST") === String(n) || `PARTS_EST=${value(r.out, "PARTS_EST")}, parts cut ${n}`;
  });

test("A1 add places a file under the four named directories or as rounds.md, never overwrites, and refuses any other name with exit 2",
  "the coordinator is refused every write under the data directory, so the script is the only pen there; a pen that writes corpus/ or a sibling path would let a step rewrite the evidence",
  async () => {
    if (!runs.default) return "C1 made no run";
    const problems = [];
    for (const [name, content] of [["drafts/01-report.md", "# Report\n"], ["rounds.md", "| round |\n"], ["anonymized/notes.md", "anon\n"], ["ledger/notes.md", "private\n"]]) {
      const r = await run(["add", "--run", runs.default, "--name", name, "--from", draft(name.replace(/\//g, "_"), content)]);
      if (r.code !== 0) problems.push(`${name}: exit ${r.code}: ${r.err.slice(0, 120)}`);
      else if (value(r.out, "ADDED") !== path.join(runs.default, name) || fs.readFileSync(path.join(runs.default, name), "utf8") !== content) problems.push(`${name}: not placed as given`);
    }
    const again = await run(["add", "--run", runs.default, "--name", "drafts/01-report.md", "--from", draft("other.md", "other\n")]);
    if (again.code !== 10) problems.push(`a second 01-report.md exit ${again.code}`);
    if (fs.readFileSync(path.join(runs.default, "drafts", "01-report.md"), "utf8") !== "# Report\n") problems.push("drafts/01-report.md was rewritten");
    for (const name of ["corpus/index.json", "../escape.md", "drafts/report.md", "notes.md", "measures/../../escape.md"]) {
      const r = await run(["add", "--run", runs.default, "--name", name, "--from", draft("x.md", "x\n")]);
      if (r.code !== 2) problems.push(`${name}: exit ${r.code}`);
    }
    if (fs.existsSync(path.join(path.dirname(runs.default), "escape.md")) || fs.existsSync(path.join(runs.default, "notes.md"))) problems.push("a refused name was written");
    const outside = await run(["add", "--run", world, "--name", "rounds.md", "--from", draft("y.md", "y\n")]);
    if (outside.code !== 2 || fs.existsSync(path.join(world, "rounds.md"))) problems.push(`a --run outside the runs root: exit ${outside.code}`);
    return problems.length === 0 || problems.join("; ");
  });

test("V1 coverage counts a page read only when the agent's model was shown it whole, raw or JSON-escaped, tells whole from partial from unread per agent, and prints the summary last",
  "a bulk agent that skipped pages returns a confident extraction of the pages it read; the rollout is the only record of what it saw, and what the command printed is not what Codex showed the model when it cut the output",
  async () => {
    if (!runs.default) return "C1 made no run";
    const listingFile = path.join(runs.default, "corpus", "parts.json");
    if (!fs.existsSync(listingFile)) return "P1 made no parts";
    const parts = JSON.parse(fs.readFileSync(listingFile, "utf8")).parts;
    const page = (g) => fs.readFileSync(path.join(runs.default, g.file), "utf8");
    const p1 = parts[0].pages, p2 = parts[1].pages;
    const cmd = (out) => ({ type: "event_msg", payload: { type: "item_completed", item: { type: "CommandExecution", command: "cat page", aggregated_output: out, exit_code: 0 } } });
    const fn = (out) => ({ type: "response_item", payload: { type: "function_call_output", call_id: "c", output: JSON.stringify({ output: out, metadata: { exit_code: 0 } }) } });
    const items = (out) => ({ type: "response_item", payload: { type: "custom_tool_call_output", call_id: "c", output: [{ type: "input_text", text: "Script completed\nOutput:\n" }, { type: "input_text", text: out }] } });
    const cut = (s) => `${s.slice(0, 2000)}\n…[output truncated]…\n${s.slice(-500)}`;
    rollout(TH.a, [items(page(p1[0])), ...p1.slice(1).map((g) => fn(page(g)))]);
    rollout(TH.b, p1.map((g) => items(page(g))));
    rollout(TH.c, [cmd(page(p1[0])), items(cut(page(p1[0])))]);
    const rep = (name, th) => { const f = path.join(world, "cov", name, "report.json"); write(f, [JSON.stringify({ threadId: th })]); return f; };
    const map = draft("map.tsv", [
      `a\t${rep("a", TH.a)}\tP001`,
      `b\t${rep("b", TH.b)}\tP001,P002`,
      `c\t${rep("c", TH.c)}\tP001`,
      `d\t${path.join(world, "cov", "d", "report.json")}\tP001`,
    ].join("\n"));
    const r = await run(["coverage", "--run", runs.default, "--map", map]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = [];
    const ids = (pages) => pages.map((g) => g.id).join(",");
    const want = [`AGENT=b unread=${ids(p2)}`, `AGENT=c unread=${ids(p1)}`, `AGENT=d unread=${ids(p1)} reason=no-report`, "AGENTS=4 WHOLE=1 PARTIAL=1 UNREAD=2"];
    if (r.out.trim() !== want.join("\n")) problems.push(`printed ${JSON.stringify(r.out.trim())}`);
    const saved = path.join(runs.default, "measures", "coverage-map.json");
    const cov = fs.existsSync(saved) ? JSON.parse(fs.readFileSync(saved, "utf8")) : { agents: [] };
    if (cov.agents.map((a) => a.status).join() !== "whole,partial,unread,unread") problems.push(`coverage-map.json says ${cov.agents.map((a) => a.status).join()}`);
    const a = cov.agents[0];
    if (cov.map !== "map.tsv" || a?.report !== "a/report.json" || JSON.stringify(a?.rollouts) !== JSON.stringify([`rollout-2026-09-20T10-00-00-${TH.a}.jsonl`]))
      problems.push(`coverage-map.json names its files ${JSON.stringify([cov.map, a?.report, a?.rollouts])}`);
    const again = await run(["coverage", "--run", runs.default, "--map", map]);
    if (again.code !== 10) problems.push(`a second coverage-map exit ${again.code}`);
    const bad = await run(["coverage", "--run", runs.default, "--map", draft("bad.tsv", `a\t${rep("a", TH.a)}\tP999\n`)]);
    if (bad.code !== 2) problems.push(`an unknown part exit ${bad.code}`);
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

test("K1 tokens takes the median and maximum of a batch from its reports or from a Claude batch's tsv, and with --median lists the agents above three times it before the summary",
  "the plan's stop line is three times the pilot's median per agent; Claude readers have no report, so their batch arrives as the Agent tool's totals in a tsv",
  async () => {
    if (!runs.default) return "C1 made no run";
    const batch = path.join(world, "batch-1");
    for (const [a, t] of [["001", 100], ["002", 300], ["003", 1000], ["004", null]])
      write(path.join(batch, a, "report.json"), [JSON.stringify(t === null ? { ok: false } : { tokenUsage: { total: { totalTokens: t } } })]);
    const problems = [];
    let r = await run(["tokens", "--run", runs.default, "--reports", batch, "--median", "200"]);
    if (r.code !== 0) problems.push(`--reports exit ${r.code}: ${r.err.slice(0, 120)}`);
    else if (r.out.trim() !== "AGENT=003 tokens=1000\nOVER=1\nAGENTS=3 MEDIAN=300 MAX=1000") problems.push(`--reports printed ${JSON.stringify(r.out.trim())}`);
    if (!fs.existsSync(path.join(runs.default, "measures", "tokens-batch-1.json"))) problems.push("no measures/tokens-batch-1.json");
    const tsv = draft("readers.tsv", "r1\t10\nr2\t20\nr3\t30\nr4\t40\n");
    r = await run(["tokens", "--run", runs.default, "--from", tsv, "--median", "10"]);
    if (r.code !== 0) problems.push(`--from exit ${r.code}: ${r.err.slice(0, 120)}`);
    else if (r.out.trim() !== "AGENT=r4 tokens=40\nOVER=1\nAGENTS=4 MEDIAN=25 MAX=40") problems.push(`--from printed ${JSON.stringify(r.out.trim())}`);
    r = await run(["tokens", "--run", runs.default, "--from", draft("readers-2.tsv", "r1\t7\n")]);
    if (r.code !== 0 || r.out.trim() !== "AGENTS=1 MEDIAN=7 MAX=7") problems.push(`without --median: exit ${r.code}, ${JSON.stringify(r.out.trim())}`);
    r = await run(["tokens", "--run", runs.default, "--reports", batch]);
    if (r.code !== 10) problems.push(`a second tokens-batch-1 exit ${r.code}`);
    r = await run(["tokens", "--run", runs.default, "--reports", batch, "--from", tsv]);
    if (r.code !== 2) problems.push(`both sources exit ${r.code}`);
    return problems.length === 0 || problems.join("; ");
  });

test("X1 export copies drafts, rounds.md, measures/ and anonymized/ unchanged to a new relative directory, none of it naming a machine path, and refuses an existing one, one under the state directory and an absolute path",
  "the research folder is committed as it is exported, and a tracked file carries no path of the machine it was made on; the ledger and the corpus stay private, a second export over the first would rewrite a published record, and a destination under the state directory is the script writing where it promised only runs",
  async () => {
    if (!runs.default) return "C1 made no run";
    const to = "research/2026-09-29-feedback";
    const r = await run(["export", "--run", runs.default, "--to", to]);
    if (r.code !== 0) return `exit ${r.code}: ${r.err.slice(0, 200)}`;
    const problems = [];
    const dest = path.join(world, to);
    const measures = walk(path.join(runs.default, "measures")).map((f) => `measures/${f}`);
    const want = ["01-report.md", "anonymized/notes.md", ...measures, "rounds.md"].sort();
    const got = walk(dest);
    if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`exported ${JSON.stringify(got)}`);
    if (r.out.trim() !== `EXPORTED=${to} FILES=${want.length}`) problems.push(`printed ${r.out.trim()}`);
    for (const f of got) {
      const src = f.startsWith("measures/") || f.startsWith("anonymized/") || f === "rounds.md" ? f : `drafts/${f}`;
      if (!fs.readFileSync(path.join(dest, f)).equals(fs.readFileSync(path.join(runs.default, src)))) problems.push(`${f} differs from the run's`);
      const content = fs.readFileSync(path.join(dest, f), "utf8");
      const leak = [world, fs.realpathSync(world), os.homedir()].find((p) => content.includes(p));
      if (leak) problems.push(`${f} names a machine path`);
    }
    if (!got.some((f) => f.startsWith("measures/coverage-")) || !got.some((f) => f.startsWith("measures/tokens-"))) problems.push("the path check read no coverage or tokens file");
    const again = await run(["export", "--run", runs.default, "--to", to]);
    if (again.code !== 10) problems.push(`a second export exit ${again.code}`);
    const under = await run(["export", "--run", runs.default, "--to", "state/leak"]);
    if (under.code !== 10 || fs.existsSync(path.join(state, "leak"))) problems.push(`a destination under the state directory: exit ${under.code}`);
    const absolute = await run(["export", "--run", runs.default, "--to", path.join(world, "elsewhere")]);
    if (absolute.code !== 2 || fs.existsSync(path.join(world, "elsewhere"))) problems.push(`an absolute destination: exit ${absolute.code}`);
    return problems.length === 0 || problems.join("; ");
  });

process.exit(summarize(await runCases(CASES), CASES.length));
