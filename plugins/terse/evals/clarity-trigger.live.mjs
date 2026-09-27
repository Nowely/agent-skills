#!/usr/bin/env node
// Live trigger probe. No Claude process starts without an explicit --run.
// Raw stream traces and the JSONL report belong outside repository worktrees.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const evalDir = path.dirname(fileURLToPath(import.meta.url));
const allCases = JSON.parse(fs.readFileSync(path.join(evalDir, "clarity-trigger", "cases.json"), "utf8"));
const options = { repeat: 3, candidate: path.resolve(evalDir, "..", "plugin") };
const valueFlags = new Set(["--cases", "--repeat", "--out", "--candidate"]);
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === "--run") options.run = true;
  else if (arg === "--without-plugin") options.withoutPlugin = true;
  else if (valueFlags.has(arg) && process.argv[i + 1]) options[arg.slice(2)] = process.argv[++i];
  else { console.error(`Unknown or incomplete option: ${arg}`); process.exit(2); }
}
options.repeat = Number(options.repeat);
if (!Number.isSafeInteger(options.repeat) || options.repeat < 1) {
  console.error("--repeat must be a positive integer"); process.exit(2);
}
const ids = options.cases ? options.cases.split(",") : allCases.map((c) => c.id);
if (ids.some((id) => !allCases.some((c) => c.id === id)) || new Set(ids).size !== ids.length) {
  console.error("--cases must contain distinct IDs from clarity-trigger/cases.json"); process.exit(2);
}
const cases = ids.map((id) => allCases.find((c) => c.id === id));
const arms = options.withoutPlugin ? ["without-plugin"] : ["with-plugin"];
const candidate = path.resolve(options.candidate);
const tempRoot = fs.realpathSync(process.env.TMPDIR || os.tmpdir());
const hookSettings = JSON.stringify({ disableAllHooks: true });
const blockedTools = ["Read", "Glob", "Grep", "WebFetch", "WebSearch", "Agent", "Task", "NotebookEdit", "PowerShell", "REPL"];
// Claude Code checks Write paths against Edit(path) rules; task.md is relative to cwd.
const allowedFor = (id) => id === "status-done" ? "Skill,Bash(pwd)" : id === "agent-task-file" ?
  "Skill,Edit(task.md)" : "Skill";
const disallowedFor = (id) => [...blockedTools, ...(id === "agent-task-file" ? [] : ["Edit"]),
  ...(id === "status-done" ? [] : ["Bash"]), ...(id === "agent-task-file" ? [] : ["Write"])].join(",");
const sessionSettings = (id, cwd) => ({ hooks: { disableAllHooks: true }, strictMcpConfig: true,
  settingSources: "ordinary profile; project and local settings only if visible from temporary cwd", sessionPersistence: false,
  permissionMode: "dontAsk", allowedTools: allowedFor(id), disallowedTools: disallowedFor(id), cwd });
const command = (arm, caseItem) => ["claude", "-p", "--strict-mcp-config",
  "--no-session-persistence", "--permission-mode", "dontAsk", "--settings", hookSettings,
  "--allowedTools", allowedFor(caseItem.id), "--disallowedTools", disallowedFor(caseItem.id),
  ...(arm === "with-plugin" ? ["--plugin-dir", candidate] : []),
  "--output-format", "stream-json", "--verbose", caseItem.prompt];
if (!options.run) {
  console.log(JSON.stringify({ mode: "plan", sessions: cases.length * options.repeat * arms.length,
    cases: ids, repeatsPerCase: options.repeat, arms,
    cwd: "a fresh empty directory under TMPDIR for every session", tempRoot,
    commands: cases.flatMap((caseItem) => arms.map((arm) => ({ case: caseItem.id, arm,
      argv: command(arm, { ...caseItem, prompt: "<prompt from clarity-trigger/cases.json>" }) }))),
    out: options.out || "required with --run" }, null, 2));
  process.exit(0);
}
if (!options.out) { console.error("--run requires --out FILE"); process.exit(2); }
if (!fs.statSync(candidate, { throwIfNoEntry: false })?.isDirectory()) {
  console.error(`Candidate plugin directory does not exist: ${candidate}`); process.exit(2);
}
const out = path.resolve(options.out);
let realParent;
try { realParent = fs.realpathSync(path.dirname(out)); }
catch { console.error("--out parent must already exist inside TMPDIR"); process.exit(2); }
const relativeParent = path.relative(tempRoot, realParent);
if (relativeParent === ".." || relativeParent.startsWith(`..${path.sep}`) || path.isAbsolute(relativeParent) ||
    fs.lstatSync(out, { throwIfNoEntry: false }) || fs.lstatSync(`${out}.traces`, { throwIfNoEntry: false })) {
  console.error("--out must name a new file inside TMPDIR, with no existing trace directory"); process.exit(2);
}
const traceDir = `${out}.traces`;
fs.mkdirSync(traceDir, { recursive: true });
const pluginVersion = JSON.parse(fs.readFileSync(path.join(candidate, ".claude-plugin", "plugin.json"), "utf8")).version || null;
const versionCall = spawnSync("claude", ["--version"], { encoding: "utf8" });
const claudeVersion = versionCall.status === 0 ? versionCall.stdout.trim() : null;
const report = fs.createWriteStream(out, { fd: fs.openSync(out, "wx") });
const write = (record) => report.write(`${JSON.stringify(record)}\n`);

function inspect(events, caseItem, cwd) {
  const uses = new Map();
  const successful = [];
  const toolPolicyViolations = [];
  let firstText = Infinity;
  let finalTextPosition = Infinity;
  let firstAction = Infinity;
  let order = 0;
  let model = null;
  let costUsd = null;
  let finalText = "";
  let resultError = null;
  const init = events.find((event) => event.type === "system" && event.subtype === "init");
  const skills = Array.isArray(init?.skills) ? init.skills : null;
  const plugins = Array.isArray(init?.plugins) ? init.plugins : null;
  const namedSkill = (item) => typeof item === "string" ? item : item?.name || item?.skill || "";
  const skillVisible = skills ? skills.some((item) => namedSkill(item).replace(/^\//, "") === "terse:clarity") : null;
  const tersePluginVisible = plugins ? plugins.some((plugin) => plugin.name === "terse") : null;
  events.forEach((event) => {
    if (event.type === "assistant") {
      model ||= event.message?.model || null;
      for (const block of event.message?.content || []) {
        if (block.type === "tool_use") {
          const allowed = block.name === "Skill" && block.input?.skill === "terse:clarity" ||
            block.name === "ToolSearch" ||
            caseItem.id === "status-done" && block.name === "Bash" &&
              (block.input?.command || "").trim() === "pwd" ||
            caseItem.id === "agent-task-file" && block.name === "Write" &&
              typeof block.input?.file_path === "string" &&
              path.resolve(cwd, block.input.file_path) === path.join(cwd, "task.md");
          if (!allowed) toolPolicyViolations.push(block.name);
        }
        if (block.type === "tool_use" && block.name === "Skill" && block.input?.skill === "terse:clarity")
          uses.set(block.id, order);
        if (block.type === "tool_use" && ["Write", "Edit", "Bash"].includes(block.name))
          firstAction = Math.min(firstAction, order);
        if (block.type === "text" && block.text?.trim()) {
          firstText = Math.min(firstText, order);
          finalTextPosition = order;
          finalText = block.text;
        }
        order++;
      }
    }
    if (event.type === "user") for (const block of event.message?.content || []) {
      if (block.type === "tool_result" && uses.has(block.tool_use_id) && !block.is_error)
        successful.push({ call: uses.get(block.tool_use_id), result: order });
      order++;
    }
    if (event.type === "result") {
      if (typeof event.total_cost_usd === "number") costUsd = event.total_cost_usd;
      if (typeof event.result === "string") {
        if (event.result.trim() && (finalTextPosition === Infinity || finalText.trim() !== event.result.trim())) {
          firstText = Math.min(firstText, order);
          finalTextPosition = order;
        }
        finalText = event.result;
      }
      if (event.is_error) resultError = event.subtype || "Claude returned an error";
      model ||= event.model || null;
    }
  });
  const firstTarget = Math.min(finalTextPosition, firstAction);
  const invoked = successful.length > 0;
  const invokedBeforeTarget = firstTarget !== Infinity && successful.some((s) => s.result < firstTarget);
  const invokedBeforeText = firstText !== Infinity && successful.some((s) => s.result < firstText);
  return { invoked,
    invokedBeforeText, invokedBeforeTarget,
    firstTargetType: firstAction < finalTextPosition ? "tool_action" : finalTextPosition < Infinity ? "final_text" : null,
    skillVisible, tersePluginVisible, toolPolicyViolations,
    controlSkillAbsent: skills ? !skillVisible && !invoked : null,
    model, costUsd, finalText, resultError };
}

function run(caseItem, repeat, arm) {
  return new Promise((resolve) => {
    const cwd = fs.mkdtempSync(path.join(tempRoot, "terse-clarity-live-"));
    const startedAt = new Date().toISOString();
    const traceFile = path.join(traceDir, `${caseItem.id}-${repeat}-${arm}.jsonl`);
    const trace = fs.createWriteStream(traceFile, { fd: fs.openSync(traceFile, "wx") });
    const events = [];
    let stdoutBuffer = "";
    let stderr = "";
    let parseErrors = 0;
    const env = { ...process.env };
    delete env.CLAUDECODE;
    const child = spawn("claude", command(arm, caseItem).slice(1), { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    const accept = (line) => {
      if (!line.trim()) return;
      trace.write(`${line}\n`);
      try { events.push(JSON.parse(line)); } catch { parseErrors++; }
    };
    child.stdout.on("data", (chunk) => {
      stdoutBuffer += chunk.toString();
      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop();
      lines.forEach(accept);
    });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    let spawnError = null;
    child.on("error", (error) => { spawnError = error.message; });
    child.on("close", (exitCode) => {
      if (stdoutBuffer) accept(stdoutBuffer);
      trace.end();
      fs.writeFileSync(`${traceFile}.stderr`, stderr, { flag: "wx" });
      const observed = inspect(events, caseItem, cwd);
      const isolationConfirmed = arm === "with-plugin" ? observed.skillVisible === true :
        observed.controlSkillAbsent === true;
      resolve({ case: caseItem.id, repeat, arm, ...observed, isolationConfirmed,
        toolPolicyVerified: observed.toolPolicyViolations.length === 0,
        startedAt, candidatePluginVersion: pluginVersion,
        pluginVersion: arm === "with-plugin" ? pluginVersion : null,
        settings: sessionSettings(caseItem.id, cwd), claudeVersion,
        traceFile, cwd, exitCode, parseErrors, ...(spawnError ? { error: spawnError } : {}) });
    });
  });
}

const records = [];
for (const caseItem of cases) for (let repeat = 1; repeat <= options.repeat; repeat++) for (const arm of arms) {
  const record = await run(caseItem, repeat, arm);
  write(record);
  records.push(record);
  console.error(`${record.case} ${repeat} ${arm}: exit=${record.exitCode}, isolation=${record.isolationConfirmed}, invokedBeforeTarget=${record.invokedBeforeTarget}`);
}
const fraction = (items, passes) => ({ numerator: items.filter(passes).length,
  denominator: items.length, rate: items.length ? items.filter(passes).length / items.length : null });
const fractions = Object.fromEntries(arms.map((arm) => {
  const armRecords = records.filter((r) => r.arm === arm && r.exitCode === 0 && !r.resultError &&
    !r.parseErrors && r.isolationConfirmed && r.toolPolicyVerified);
  const positive = armRecords.filter((r) => cases.find((c) => c.id === r.case).positive);
  const negative = armRecords.filter((r) => !cases.find((c) => c.id === r.case).positive);
  return [arm, { positive: fraction(positive, (r) => r.invokedBeforeTarget),
    negative: fraction(negative, (r) => !r.invoked),
    failed: records.filter((r) => r.arm === arm).length - armRecords.length }];
}));
write({ type: "summary", sessions: records.length, fractions });
report.end();
