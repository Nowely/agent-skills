#!/usr/bin/env node
// A fake `claude` for the Claude adapter's suite: it answers --version and `auth status`, and in print mode
// speaks the stream-json the real CLI does (system/init, assistant and user events, one result), driving the
// approval server named by --mcp-config through initialize, tools/list and tools/call as the real CLI does.
// FAKE_CLAUDE_MODE picks the scenario; FAKE_CLAUDE_LOG receives one JSON line per run: its argv, cwd, task and
// the session variables it was handed.
import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import readline from "node:readline";

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
const mode = process.env.FAKE_CLAUDE_MODE ?? "ok";

if (argv[0] === "--version") { process.stdout.write(`${process.env.FAKE_CLAUDE_VERSION ?? "2.1.294"} (Claude Code)\n`); process.exit(0); }
if (argv[0] === "auth" && argv[1] === "status") {
  const loggedIn = process.env.FAKE_CLAUDE_SIGNED_IN !== "0";
  process.stdout.write(`${JSON.stringify({ loggedIn, authMethod: loggedIn ? "claude.ai" : "none",
    ...(loggedIn ? { apiProvider: process.env.FAKE_CLAUDE_API_PROVIDER ?? "firstParty" } : {}) })}\n`);
  process.exit(loggedIn ? 0 : 1);
}

const task = fs.readFileSync(0, "utf8");
// A continuation without --fork-session keeps the resumed id, as the real CLI does.
const sessionId = flag("--session-id") ?? flag("--resume");
const model = { opus: "claude-opus-5-5", sonnet: "claude-sonnet-5-5", haiku: "claude-haiku-5-5", fable: "claude-fable-5-1" }[flag("--model")] ?? flag("--model") ?? "claude-sonnet-5-5";
if (process.env.FAKE_CLAUDE_LOG) {
  const vars = Object.fromEntries(["CLAUDECODE", "CLAUDE_CODE_SESSION_ID", "CLAUDE_EFFORT", "ANTHROPIC_API_KEY"].map((k) => [k, process.env[k] ?? null]));
  fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, `${JSON.stringify({ argv, cwd: process.cwd(), task, vars })}\n`);
}

const schema = JSON.parse(flag("--json-schema") ?? "{}");
if (["oneOf", "anyOf", "allOf"].some((k) => Object.hasOwn(schema, k))) {
  process.stderr.write("400: input_schema does not support oneOf, allOf, or anyOf at the top level\n");
  process.exit(1);
}
const emit = (e) => process.stdout.write(`${JSON.stringify({ session_id: sessionId, ...e })}\n`);
const five = (result) => ({ status: "done", result, evidence: ["observed"], artifacts: [], open: [] });
// The model each of the session's own assistant messages names, as the real stream does; a case may make it another.
const answering = process.env.FAKE_CLAUDE_ASSISTANT_MODEL ?? model;
// What --tools leaves: "" is none, as with the real CLI; --json-schema adds StructuredOutput beside them.
const granted = [...(flag("--tools") === null ? ["Bash", "Read", "Write", "Edit", "Agent", "Skill", "WebFetch", "mcp__browser__navigate"]
  : flag("--tools") ? flag("--tools").split(",") : []), ...(flag("--json-schema") ? ["StructuredOutput"] : [])];
const finish = ({ structured = five("checked"), isError = false, subtype = "success", denials = [], terminal = "completed", text } = {}) => {
  if (structured && !isError) {
    emit({ type: "assistant", parent_tool_use_id: null, message: { model: answering, content: [{ type: "tool_use", id: "toolu_so", name: "StructuredOutput", input: structured }] } });
    emit({ type: "user", parent_tool_use_id: null, message: { content: [{ type: "tool_result", tool_use_id: "toolu_so", content: "Structured output provided successfully" }] } });
  }
  emit({ type: "result", subtype, is_error: isError, result: text ?? (structured ? JSON.stringify(structured) : "plain text"),
    ...(structured && !isError ? { structured_output: structured } : {}), total_cost_usd: 0.0042, num_turns: 2, duration_ms: 1200,
    usage: { input_tokens: 10, output_tokens: 5 }, modelUsage: { [model]: { inputTokens: 10, outputTokens: 5 } },
    permission_denials: denials, terminal_reason: terminal });
};
const toolCall = (id, name, input, isError = false) => {
  emit({ type: "assistant", parent_tool_use_id: null, message: { model: answering, content: [{ type: "tool_use", id, name, input }] } });
  emit({ type: "user", parent_tool_use_id: null, message: { content: [{ type: "tool_result", tool_use_id: id, is_error: isError, content: isError ? "denied" : "ok" }] } });
};

// A stream with no init at all, a transport fault no real CLI has been seen to make, when a case asks for one.
if (process.env.FAKE_CLAUDE_NO_INIT !== "1") emit({ type: "system", subtype: "init", cwd: process.cwd(), model, permissionMode: argv.includes("--dangerously-skip-permissions") ? "bypassPermissions" : flag("--permission-mode"),
  tools: granted, plugins: argv.includes("--safe-mode") ? [] : [{ name: "user-plugin", path: "/x" }],
  mcp_servers: flag("--mcp-config") ? [{ name: "entrust", status: "connected" }] : [], claude_code_version: "2.1.294",
  ...(argv.includes("--safe-mode") ? {} : { memory_paths: { auto: "/m" } }),
  // A CLI that did not apply what it was asked for, as a case sets it: fields that replace init's own.
  ...JSON.parse(process.env.FAKE_CLAUDE_INIT ?? "{}") });

// The approval server, as Claude Code starts it from --mcp-config, and one permission prompt through it.
function server() {
  // The server the --permission-prompt-tool names, mcp__<server>__<tool>, as Claude Code resolves it.
  const config = JSON.parse(fs.readFileSync(flag("--mcp-config"), "utf8")).mcpServers[flag("--permission-prompt-tool").split("__")[1]];
  const child = spawn(config.command, config.args, { env: { ...process.env, ...config.env }, stdio: ["pipe", "pipe", "inherit"] });
  const waiting = new Map();
  readline.createInterface({ input: child.stdout }).on("line", (l) => { const m = JSON.parse(l); waiting.get(m.id)?.(m); });
  let id = 0;
  const call = (method, params) => new Promise((resolve) => { const i = ++id; waiting.set(i, resolve); child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: i, method, params })}\n`); });
  const notify = (method, params) => child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`);
  return { child, call, notify, last: () => id };
}

async function ask(toolName, input) {
  const tool = flag("--permission-prompt-tool");
  if (!tool) return { behavior: "deny", message: "nobody can approve this" };
  const s = server();
  await s.call("initialize", { protocolVersion: "2025-06-18" });
  s.notify("notifications/initialized", {});
  const listed = await s.call("tools/list", {});
  const name = tool.split("__").at(-1);
  if (!listed.result.tools.some((t) => t.name === name)) throw new Error(`no tool ${tool}`);
  const pending = s.call("tools/call", { name, arguments: { tool_name: toolName, input, tool_use_id: "toolu_fake" } });
  if (mode === "ask-cancel") {
    await new Promise((r) => setTimeout(r, Number(process.env.FAKE_CLAUDE_CANCEL_MS ?? 1500)));
    s.notify("notifications/cancelled", { requestId: s.last(), reason: "timed out" });
    await new Promise((r) => setTimeout(r, 500));
    s.child.stdin.end();
    return { behavior: "deny", message: "timed out" };
  }
  if (mode === "ask-die") {
    await new Promise((r) => setTimeout(r, 1500));
    s.child.stdin.end();
    await new Promise((r) => s.child.on("exit", r));
    process.exit(1);
  }
  const reply = await pending;
  s.child.stdin.end();
  return JSON.parse(reply.result.content[0].text);
}

async function main() {
  // What a real agent does first: it reads before it acts, when it has a tool to read with. A turn with no
  // observation is "recall".
  if (!["error", "noschema", "die", "slow", "recall"].includes(mode) && granted.includes("Read")) toolCall("toolu_0", "Read", { file_path: process.cwd() });
  if (mode === "structured") return finish({ structured: JSON.parse(process.env.FAKE_CLAUDE_OUTPUT) });
  // A full session's own calls, then its answer or a provider error; FAKE_CLAUDE_DENIALS is what its policy denied.
  if (mode === "proxy" || mode === "proxy-error") {
    toolCall("proxy-write", "Write", { file_path: `${process.cwd()}/out.txt`, content: "x" });
    toolCall("proxy-browser", "mcp__browser__navigate", { url: "http://localhost:3000" });
    toolCall("proxy-agent", "Agent", { prompt: "verify" });
    const denials = JSON.parse(process.env.FAKE_CLAUDE_DENIALS ?? "[]");
    for (const d of denials) toolCall(d.tool_use_id, d.tool_name, d.tool_input, true);
    return mode === "proxy-error" ? finish({ isError: true, structured: null, text: "provider failed after executing", denials })
      : finish({ structured: JSON.parse(process.env.FAKE_CLAUDE_OUTPUT), denials });
  }
  if (mode === "recall") return finish();
  if (mode === "ok") { toolCall("toolu_1", "Bash", { command: "ls" }); return finish(); }
  if (mode === "write") { toolCall("toolu_1", "Write", { file_path: `${process.cwd()}/out.txt`, content: "x" }); return finish(); }
  if (mode === "commit") {
    fs.writeFileSync("committed.txt", "x\n");
    for (const a of [["add", "committed.txt"], ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "commit", "-qm", "agent"]])
      if (spawnSync("git", a).status !== 0) throw new Error(`git ${a.join(" ")} failed`);
    toolCall("toolu_1", "Bash", { command: "git commit -am agent" });
    return finish();
  }
  if (mode === "gitlink") {
    // An agent that points its tree's .git at a repository whose fsmonitor would run a program of its choosing.
    const fake = process.env.FAKE_CLAUDE_GITLINK;
    spawnSync("git", ["init", "-q", fake]);
    spawnSync("git", ["-C", fake, "config", "core.fsmonitor", `touch ${fake}.ran`]);
    fs.writeFileSync("planted.txt", "x\n");
    fs.writeFileSync(".git", `gitdir: ${fake}/.git\n`);
    toolCall("toolu_1", "Write", { file_path: `${process.cwd()}/planted.txt`, content: "x" });
    return finish();
  }
  if (mode === "active") {
    // Work that keeps talking for FAKE_CLAUDE_ACTIVE_MS: a line every FAKE_CLAUDE_TICK_MS, every other one a
    // subagent's, then its answer; a SIGINT ends the turn with a result, as the real CLI's does.
    process.on("SIGINT", () => { finish({ isError: true, subtype: "error_during_execution", structured: null, terminal: "aborted_tools", text: "" }); process.exit(0); });
    const until = Date.now() + Number(process.env.FAKE_CLAUDE_ACTIVE_MS ?? 2500);
    for (let i = 0; Date.now() < until; i++) {
      emit({ type: "assistant", parent_tool_use_id: i % 2 ? "toolu_subagent" : null, message: { model: answering, content: [{ type: "text", text: `working ${i}` }] } });
      await new Promise((r) => setTimeout(r, Number(process.env.FAKE_CLAUDE_TICK_MS ?? 100)));
    }
    return finish(process.env.FAKE_CLAUDE_OUTPUT ? { structured: JSON.parse(process.env.FAKE_CLAUDE_OUTPUT) } : {});
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, Number(ms ?? 0)));
  if (mode === "streaming" || mode === "noise") {
    // A message written for FAKE_CLAUDE_ACTIVE_MS: with --include-partial-messages, a stream_event every tick, one of
    // them a Bash tool_use the message never completes; without the flag nothing until the message is whole, as the
    // real CLI does. "noise" writes lines that are no event of the run instead. FAKE_CLAUDE_STREAM_ONLY ends the
    // process after the partial events, with no whole message and no result.
    process.on("SIGINT", () => { finish({ isError: true, subtype: "error_during_execution", structured: null, terminal: "aborted_tools", text: "" }); process.exit(0); });
    const partial = argv.includes("--include-partial-messages"), until = Date.now() + Number(process.env.FAKE_CLAUDE_ACTIVE_MS ?? 2500);
    if (partial && mode === "streaming") emit({ type: "stream_event", parent_tool_use_id: null, event: { type: "content_block_start", index: 0, content_block: { type: "tool_use", id: "toolu_partial", name: "Bash", input: {} } } });
    for (let i = 0; Date.now() < until; i++) {
      if (mode === "noise") process.stdout.write(i % 2 ? "not-json-noise\n" : `${JSON.stringify({ type: "not-an-event", session_id: sessionId })}\n`);
      else if (partial) emit({ type: "stream_event", parent_tool_use_id: null, event: { type: "content_block_delta", index: 0, delta: { type: "input_json_delta", partial_json: `{"part":${i}` } } });
      await sleep(process.env.FAKE_CLAUDE_TICK_MS ?? 100);
    }
    if (process.env.FAKE_CLAUDE_STREAM_ONLY === "1") process.exit(0);
    return finish(process.env.FAKE_CLAUDE_OUTPUT ? { structured: JSON.parse(process.env.FAKE_CLAUDE_OUTPUT) } : {});
  }
  if (mode === "progress") {
    // A Bash call that runs for FAKE_CLAUDE_ACTIVE_MS and says nothing but the reference's SDKToolProgressMessage
    // every tick, as Claude Code's heartbeat for a main-conversation tool does, then its result and the answer.
    const id = "toolu_long", input = { command: "npm run build", description: "build" }, started = Date.now();
    emit({ type: "assistant", parent_tool_use_id: null, message: { model: answering, content: [{ type: "tool_use", id, name: "Bash", input }] } });
    while (Date.now() - started < Number(process.env.FAKE_CLAUDE_ACTIVE_MS ?? 2500)) {
      await sleep(process.env.FAKE_CLAUDE_TICK_MS ?? 150);
      emit({ type: "tool_progress", tool_use_id: id, tool_name: "Bash", parent_tool_use_id: null, elapsed_time_seconds: (Date.now() - started) / 1000,
        heartbeat: true, uuid: crypto.randomUUID() });
    }
    emit({ type: "user", parent_tool_use_id: null, message: { content: [{ type: "tool_result", tool_use_id: id, is_error: false, content: "built" }] } });
    return finish();
  }
  if (mode === "error") return finish({ isError: true, subtype: "error_max_turns", structured: null, text: "" });
  if (mode === "noschema") return finish({ structured: null });
  if (mode === "die") process.exit(1);
  if (mode === "many") for (let i = 0; i < Number(process.env.FAKE_CLAUDE_TOOLS ?? 5); i++) toolCall(`toolu_m${i}`, "Bash", { command: `echo ${i}` });
  if (mode === "slow" || mode === "many") {
    process.on("SIGINT", () => { finish({ isError: true, subtype: "error_during_execution", structured: null, terminal: "aborted_tools", text: "" }); process.exit(0); });
    process.on("SIGTERM", () => process.exit(143));
    return new Promise(() => setInterval(() => {}, 1000));
  }
  if (mode.startsWith("ask")) {
    const [toolName, input] = process.env.FAKE_CLAUDE_TOOL === "Write" ? ["Write", { file_path: `${process.cwd()}/../outside.txt`, content: "x" }]
      : process.env.FAKE_CLAUDE_TOOL === "BashTimeout" ? ["Bash", { command: "npm test", description: "run tests", timeout: 600000 }]
      : ["Bash", { command: "touch made.txt", description: "make a file" }];
    // Silence on either side of the wait, as a case sets it: the CLI writes nothing while it decides to ask and
    // while the answered call runs.
    await sleep(process.env.FAKE_CLAUDE_QUIET_BEFORE_MS);
    const answer = await ask(toolName, input);
    await sleep(process.env.FAKE_CLAUDE_QUIET_AFTER_MS);
    if (answer.behavior === "allow") {
      toolCall("toolu_fake", toolName, answer.updatedInput);
      return finish({ structured: five(`allowed ${JSON.stringify(answer.updatedInput)}`) });
    }
    toolCall("toolu_fake", toolName, input, true);
    return finish({ structured: five(`denied: ${answer.message}`), denials: [{ tool_name: toolName, tool_use_id: "toolu_fake", tool_input: input }] });
  }
  throw new Error(`unknown FAKE_CLAUDE_MODE ${mode}`);
}
await main();
