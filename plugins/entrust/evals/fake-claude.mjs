#!/usr/bin/env node
// A fake `claude` for the Claude adapter's suite: it answers --version and `auth status`, and in print mode
// speaks the stream-json the real CLI does (system/init, assistant and user events, one result), driving the
// approval server named by --mcp-config through initialize, tools/list and tools/call as the real CLI does.
// FAKE_CLAUDE_MODE picks the scenario; FAKE_CLAUDE_LOG receives one JSON line per run: its argv, cwd, task and
// the session variables it was handed.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import readline from "node:readline";

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
const mode = process.env.FAKE_CLAUDE_MODE ?? "ok";

if (argv[0] === "--version") { process.stdout.write(`${process.env.FAKE_CLAUDE_VERSION ?? "2.1.294"} (Claude Code)\n`); process.exit(0); }
if (argv[0] === "auth" && argv[1] === "status") {
  const loggedIn = process.env.FAKE_CLAUDE_SIGNED_IN !== "0";
  process.stdout.write(`${JSON.stringify({ loggedIn, authMethod: loggedIn ? "oauth_token" : "none" })}\n`);
  process.exit(loggedIn ? 0 : 1);
}

const task = fs.readFileSync(0, "utf8");
const sessionId = flag("--session-id");
const model = { opus: "claude-opus-5-5", sonnet: "claude-sonnet-5-5", haiku: "claude-haiku-5-5", fable: "claude-fable-5-1" }[flag("--model")] ?? flag("--model") ?? "claude-sonnet-5-5";
if (process.env.FAKE_CLAUDE_LOG) {
  const vars = Object.fromEntries(["CLAUDECODE", "CLAUDE_CODE_SESSION_ID", "CLAUDE_EFFORT", "ANTHROPIC_API_KEY"].map((k) => [k, process.env[k] ?? null]));
  fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, `${JSON.stringify({ argv, cwd: process.cwd(), task, vars })}\n`);
}

const emit = (e) => process.stdout.write(`${JSON.stringify({ session_id: sessionId, ...e })}\n`);
const five = (result) => ({ status: "done", result, evidence: ["observed"], artifacts: [], open: [] });
const finish = ({ structured = five("checked"), isError = false, subtype = "success", denials = [], terminal = "completed", text } = {}) => {
  emit({ type: "result", subtype, is_error: isError, result: text ?? (structured ? JSON.stringify(structured) : "plain text"),
    ...(structured && !isError ? { structured_output: structured } : {}), total_cost_usd: 0.0042, num_turns: 2, duration_ms: 1200,
    usage: { input_tokens: 10, output_tokens: 5 }, modelUsage: { [model]: { inputTokens: 10, outputTokens: 5 } },
    permission_denials: denials, terminal_reason: terminal });
};
const toolCall = (id, name, input, isError = false) => {
  emit({ type: "assistant", parent_tool_use_id: null, message: { content: [{ type: "tool_use", id, name, input }] } });
  emit({ type: "user", parent_tool_use_id: null, message: { content: [{ type: "tool_result", tool_use_id: id, is_error: isError, content: isError ? "denied" : "ok" }] } });
};

emit({ type: "system", subtype: "init", cwd: process.cwd(), model, permissionMode: flag("--permission-mode"),
  tools: (flag("--tools") ?? "").split(","), plugins: argv.includes("--safe-mode") ? [] : [{ name: "user-plugin", path: "/x" }],
  mcp_servers: flag("--mcp-config") ? [{ name: "entrust", status: "connected" }] : [], claude_code_version: "2.1.294",
  ...(argv.includes("--safe-mode") ? {} : { memory_paths: { auto: "/m" } }) });

// The approval server, as Claude Code starts it from --mcp-config, and one permission prompt through it.
function server() {
  const config = JSON.parse(fs.readFileSync(flag("--mcp-config"), "utf8")).mcpServers.entrust;
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
  if (mode === "ok") { toolCall("toolu_1", "Bash", { command: "ls" }); return finish(); }
  if (mode === "write") { toolCall("toolu_1", "Write", { file_path: `${process.cwd()}/out.txt`, content: "x" }); return finish(); }
  if (mode === "commit") {
    fs.writeFileSync("committed.txt", "x\n");
    for (const a of [["add", "committed.txt"], ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "commit", "-qm", "agent"]])
      if (spawnSync("git", a).status !== 0) throw new Error(`git ${a.join(" ")} failed`);
    toolCall("toolu_1", "Bash", { command: "git commit -am agent" });
    return finish();
  }
  if (mode === "error") return finish({ isError: true, subtype: "error_max_turns", structured: null, text: "" });
  if (mode === "noschema") return finish({ structured: null });
  if (mode === "die") process.exit(1);
  if (mode === "slow") {
    process.on("SIGINT", () => { finish({ isError: true, subtype: "error_during_execution", structured: null, terminal: "aborted_tools", text: "" }); process.exit(0); });
    process.on("SIGTERM", () => process.exit(143));
    return new Promise(() => setInterval(() => {}, 1000));
  }
  if (mode.startsWith("ask")) {
    const [toolName, input] = process.env.FAKE_CLAUDE_TOOL === "Write" ? ["Write", { file_path: `${process.cwd()}/../outside.txt`, content: "x" }]
      : process.env.FAKE_CLAUDE_TOOL === "BashTimeout" ? ["Bash", { command: "npm test", description: "run tests", timeout: 600000 }]
      : ["Bash", { command: "touch made.txt", description: "make a file" }];
    const answer = await ask(toolName, input);
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
