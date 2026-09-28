#!/usr/bin/env node
// Offline historical H1 proxy counter, distinct from the live first-text-or-action probe.
// Do not treat its counts as a rate until 20 sessions have been hand-labelled.
// Usage: node clarity-trigger.count.mjs --since YYYY-MM-DD [--logs DIR] [--words N]
//        [--labels FILE] [--sessions FILE] [--per-session]
// Labels JSON: [{"session":"id","target":true,"triggerBeforeTarget":true}, ...]
// Per-session stdout contains one JSON object per session; the aggregate goes to stderr.
// firstTarget.index is zero-based within its physical JSONL file.
import fs from "node:fs";
import path from "node:path";

const args = {};
const valueFlags = new Set(["--logs", "--since", "--words", "--labels", "--sessions"]);
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i];
  if (flag === "--per-session") args.perSession = true;
  else if (valueFlags.has(flag) && process.argv[i + 1]) args[flag.slice(2)] = process.argv[++i];
  else { console.error(`Unknown or incomplete option: ${flag}`); process.exit(2); }
}
args.logs ||= path.join(process.env.CLAUDE_CONFIG_DIR || path.join(process.env.HOME || "", ".claude"), "projects");
args.words ||= "40";
if (!/^\d{4}-\d{2}-\d{2}$/.test(args.since || "") || !Number.isInteger(Number(args.words)) || Number(args.words) < 1) {
  console.error("usage: node clarity-trigger.count.mjs --since YYYY-MM-DD [--logs DIR] [--words N] [--labels FILE] [--sessions FILE] [--per-session]");
  process.exit(2);
}
const threshold = Number(args.words);
const selectedSessions = args.sessions ? new Set(fs.readFileSync(args.sessions, "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)) : null;
// Only top-level session logs: subagents/ contains sidechains that share their parent's sessionId.
const directLogs = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith(".jsonl"))
  .map((e) => path.join(dir, e.name));
const files = [
  ...directLogs(args.logs),
  ...fs.readdirSync(args.logs, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "subagents")
    .flatMap((e) => directLogs(path.join(args.logs, e.name))),
];
const sessions = new Map();
for (const file of files) {
  const rows = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
  for (const [index, line] of rows.entries()) {
    let r;
    try { r = JSON.parse(line); } catch { continue; }
    if (r.isSidechain) continue;
    if (!r.timestamp || r.timestamp.slice(0, 10) < args.since) continue;
    const id = r.sessionId || path.basename(file, ".jsonl");
    if (selectedSessions && !selectedSessions.has(id)) continue;
    if (!sessions.has(id)) sessions.set(id, []);
    sessions.get(id).push({ ...r, __source: file, __index: index });
  }
}
const content = (r) => Array.isArray(r.message?.content) ? r.message.content : [];
const uses = (r) => content(r).filter((c) => c?.type === "tool_use");
const results = (r) => content(r).filter((c) => c?.type === "tool_result");
const summaries = (r) => r.type === "summary" || r.type === "compact" ||
  r.subtype === "compact_boundary" || Boolean(r.isCompactSummary);
const resumed = (r) => r.type === "system" && /resum/i.test(`${r.subtype || ""} ${r.entrypoint || ""}`);
const isAgentTool = (u) => u.name === "Agent" || u.name === "Task" || /entrust.*(?:codex|agent)/i.test(u.name || "");
const isTargetTool = (u) => isAgentTool(u) ||
  (u.name === "Bash" && /\b(?:git(?:\s+-C\s+\S+)*\s+commit|gh\s+pr\s+(?:create|edit)|gh\s+issue\s+comment)\b/.test(u.input?.command || u.input?.cmd || ""));
const isClarity = (u) => u.name === "Skill" && /^(?:terse:)?clarity$/.test(u.input?.skill || "");
const finalWords = (r) => r.type === "assistant" && r.message?.stop_reason === "end_turn" &&
  content(r).filter((c) => c.type === "text").map((c) => c.text).join(" ").trim().split(/\s+/).filter(Boolean).length >= threshold;
const outcomes = [];
for (const [session, rows] of sessions) {
  rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp) || a.__source.localeCompare(b.__source) || a.__index - b.__index);
  const toolResults = new Map();
  rows.forEach((r, i) => results(r).forEach((result) => {
    if (!toolResults.has(result.tool_use_id)) toolResults.set(result.tool_use_id, { i, result });
  }));
  const events = rows.flatMap((r, i) => uses(r).map((u) => ({ i, u })));
  const skills = events.filter(({ u }) => isClarity(u));
  const targets = events.filter(({ u }) => isTargetTool(u)).map(({ i, u }) =>
    ({ i, type: `tool_use:${u.name}` }));
  const firstAgentResult = rows.findIndex((r) => content(r).some((c) => c.type === "tool_result") &&
    events.some(({ u }) => isAgentTool(u) && content(r).some((c) => c.tool_use_id === u.id)));
  if (firstAgentResult >= 0) {
    const nextAssistant = rows.findIndex((r, i) => i > firstAgentResult && r.type === "assistant" && content(r).some((c) => c.type === "text"));
    if (nextAssistant >= 0) targets.push({ i: nextAssistant, type: "agent_result_reply" });
  }
  rows.forEach((r, i) => { if (finalWords(r)) targets.push({ i, type: "final_text" }); });
  targets.sort((a, b) => a.i - b.i);
  const first = targets[0] || null;
  const successful = skills.filter(({ u }) => toolResults.has(u.id) && !toolResults.get(u.id).result.is_error);
  const rootTurns = rows.filter((r) => r.type === "user" && r.parentUuid == null).length;
  outcomes.push({ session, file: first ? rows[first.i].__source : rows[0]?.__source,
    firstTarget: first ? { type: first.type, index: rows[first.i].__index } : null,
    target: first !== null, triggerBeforeTarget: first !== null && successful.some(({ u }) => toolResults.get(u.id).i < first.i),
    repeatCalls: Math.max(0, skills.length - 1), callsAfterCompaction: skills.filter(({ i }) => rows.slice(0, i).some(summaries)).length,
    resumed: rows.some(resumed) ? true : "unknown", resumptionCandidate: rootTurns > 1 });
}
const eligible = outcomes.filter((x) => x.target);
const labels = args.labels ? JSON.parse(fs.readFileSync(args.labels, "utf8")) : [];
const matches = labels.map((l) => ({ label: l.session, match: outcomes.some((o) => o.session === l.session && o.target === l.target && o.triggerBeforeTarget === l.triggerBeforeTarget) }));
if (args.perSession) for (const o of outcomes) console.log(JSON.stringify({ metric: "historical-H1-proxy",
  sessionId: o.session, file: o.file,
  firstTarget: o.firstTarget, clarityBeforeTarget: o.triggerBeforeTarget }));
const summary = { metric: "historical-H1-proxy", denominator: eligible.length, numerator: eligible.filter((x) => x.triggerBeforeTarget).length,
  repeatCalls: outcomes.reduce((n, x) => n + x.repeatCalls, 0), callsAfterCompaction: outcomes.reduce((n, x) => n + x.callsAfterCompaction, 0),
  resumedSessionsObserved: outcomes.filter((x) => x.resumed === true).length,
  resumptionCandidates: outcomes.filter((x) => x.resumptionCandidate).length,
  labelled: matches.length, labelMatches: matches.filter((x) => x.match).length,
  validated: matches.length >= 20 && matches.every((x) => x.match),
  limitations: ["this proxy observes selected agent/publishing tools and final replies of at least 40 words, unlike the live first-text-or-action measure", "the default 40-word final-message threshold needs hand validation", "short answers and file edits without a target tool are not observed", "only explicit resume markers count as observed; multiple root turns are candidates, not proof of resume", "compaction and resume heuristics need hand validation"] };
if (args.perSession) console.error(JSON.stringify(summary));
else console.log(JSON.stringify(summary, null, 2));
