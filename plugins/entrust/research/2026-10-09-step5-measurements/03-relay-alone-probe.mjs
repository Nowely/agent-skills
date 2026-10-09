#!/usr/bin/env node
// Step-5 probe: does the relay follow its steps from agents/proxy.md alone, when the coordinator's message carries
// only the command and the description instead of the four pasted steps? Each run is one `claude -p` coordinator on
// Haiku with this plugin loaded, making one Agent call to entrust:proxy (Haiku, from its frontmatter). The command is
// a stub that prints RUNNING= on its first two calls and nine fixed status lines on the third, so the relay's own
// behaviour is all that is measured: how often it ran the command, whether it changed it, whether it read anything,
// and whether what came back is the status lines whole.
//
//   node 03-relay-alone-probe.mjs <scratch dir> [alone runs, default 6] [pasted runs, default 1]
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN = path.join(HERE, "../../plugin");
const scratch = path.resolve(process.argv[2] ?? fs.mkdtempSync("/tmp/step5-relay-"));
const alone = Number(process.argv[3] ?? 6), pasted = Number(process.argv[4] ?? 1);
fs.mkdirSync(scratch, { recursive: true });

const STATUS = ["DRIVER_EXIT=0", "PATH=own", "EXIT=0", "FIRST=status=done", "ANSWER=probe answer 7f3a",
  "ERROR=", "RECEIPT=turnStatus=completed receiptOk=true model=Haiku", "FILE=present"];
const stub = path.join(scratch, "stub-run.cjs");
fs.writeFileSync(stub, `const fs = require("node:fs");
const i = process.argv.indexOf("--report-file"), report = process.argv[i + 1], calls = report + ".calls";
fs.appendFileSync(calls, "x");
const n = fs.readFileSync(calls, "utf8").length;
if (n < 3) { console.log("RUNNING=" + report); process.exit(0); }
console.log(${JSON.stringify(STATUS.join("\n"))} + "\\nREPORT=" + report);
`);

const steps = (desc, command) => `1. Run this command with the Bash tool, in the foreground, with timeout 600000, and description "${desc}". Write no text before it.

${command}

2. If its result ends with RUNNING=, or is the harness's notice that it moved the command to the background, run the very same command again at once, and again each time either comes back. Each run is safe: the command waits for the run it already started. Do not open, tail or wait on the output file that notice names, and write nothing in between. Any other result, an empty one included, goes to step 3 as it is.

3. Call SubagentHandback with exactly the lines that result printed, a complete pending request included, nothing added, nothing removed.${process.env.PROBE_NO_TOOL_CLAUSE ? "" : " If you have no SubagentHandback tool, write exactly those lines as your final message instead, and nothing else."}

4. After the hand-back result, and whenever the harness asks you for a visible response, write exactly one line, "${desc}: report delivered", and nothing else.`;

function once(kind, i) {
  const report = path.join(scratch, `${kind}-${i}`, "report.json");
  fs.mkdirSync(path.dirname(report), { recursive: true });
  const desc = `Claude Haiku ${kind}${i}: relay probe`;
  const command = `node "${stub}" --run --report-file "${report}"`;
  const message = kind === "pasted" ? steps(desc, command) : `Description: ${desc}\nCommand: ${command}`;
  const coordinator = `Make exactly one call of the Agent tool with subagent_type "entrust:proxy", description "${desc}", ` +
    `run_in_background false, and as its prompt exactly the text between the two marker lines below, nothing added. ` +
    `When it returns, write its result verbatim and nothing else.\n=====\n${message}\n=====`;
  const r = spawnSync("claude", ["-p", "--plugin-dir", PLUGIN, "--model", "haiku", "--output-format", "stream-json", "--verbose",
    "--allowedTools", `Bash(node "${stub}" *)`, "Agent"], { input: coordinator, encoding: "utf8", timeout: 600000, cwd: scratch });
  const events = String(r.stdout).split("\n").filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
  fs.writeFileSync(`${report}.transcript.jsonl`, r.stdout ?? "");
  const blocks = (e) => (Array.isArray(e.message?.content) ? e.message.content : []);
  const agentCall = events.flatMap(blocks).find((b) => b.type === "tool_use" && b.name === "Agent");
  const proxyUses = events.filter((e) => e.parent_tool_use_id && e.parent_tool_use_id === agentCall?.id).flatMap(blocks).filter((b) => b.type === "tool_use");
  const result = events.flatMap(blocks).find((b) => b.type === "tool_result" && b.tool_use_id === agentCall?.id);
  const text = [result?.content].flat().map((c) => (typeof c === "string" ? c : c?.text ?? "")).join("\n");
  const calls = fs.existsSync(`${report}.calls`) ? fs.readFileSync(`${report}.calls`, "utf8").length : 0;
  const final = [...STATUS, `REPORT=${report}`];
  return {
    kind, run: i, cost: events.find((e) => e.type === "result")?.total_cost_usd ?? null,
    agentCalled: Boolean(agentCall), promptSentAsGiven: agentCall?.input?.prompt?.trim() === message.trim(),
    stubCalls: calls,
    proxyTools: proxyUses.map((u) => u.name),
    commandsUnchanged: proxyUses.filter((u) => u.name === "Bash").every((u) => u.input?.command === command),
    descriptionUsed: proxyUses.filter((u) => u.name === "Bash").every((u) => u.input?.description === desc),
    handedBackWhole: final.every((l) => text.includes(l)),
    extraLines: text.split("\n").map((l) => l.trim()).filter((l) => l && !final.includes(l)).slice(0, 6),
  };
}

const rows = [];
for (let i = 1; i <= pasted; i++) rows.push(once("pasted", i));
for (let i = 1; i <= alone; i++) rows.push(once("alone", i));
console.log(JSON.stringify(rows, null, 2));
