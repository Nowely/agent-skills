#!/usr/bin/env node
// Runs one Codex turn through `codex app-server` (JSON-RPC over stdio) at a declared rights level.
//
// app-server, not `codex exec`: exec forces approval_policy=Never, which a managed profile clamps to
// untrusted, rejecting every action while exiting 0 (references/why-not-the-plugin.md). The protocol is
// pinned in plugins/entrust/schema-<version>/, never installed and never read at run time. Its invariants:
//   * There is no `turn/failed` method. Failure arrives as turn/completed with params.turn.status in
//     {completed, interrupted, failed, inProgress}. Arrival is not success.
//   * Codex spawns its own subagents on other threads. Every event must be filtered by the root
//     threadId, or a child's command satisfies the gate, a child's message becomes the answer, and a
//     child's turn/completed tears down the session while the root turn is still running.
//   * Server-to-client requests are not all approvals. Attestation, ChatGPT token refresh and MCP
//     elicitation share the same channel and take different responses.
//
// Escalation policy: an approval steps outside the sandbox the caller chose, so it is the caller's call. A
// command request waits in the --approval-dir mailbox for the caller, thirty minutes at most, and is declined
// at once without one. A file change the driver answers itself: yes where every path lies inside the writable
// roots, which a shell could have written anyway, and no otherwise. Every request is in `escalations`.

import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createAgentTemp, agentTempAncestor, stateDirectory, TEMP_OWNER } from "../../orchestrate/scripts/temp-dir.mjs";
import { EXIT, canonical, insideByInode, parseRights, planWritesToRights, resolveModel, resolveRights, within, writeRootProblem } from "../../orchestrate/scripts/drivers.mjs";
import { DEADLINE_MS, deadlineMs, mailboxProblem, openMailbox, requestId } from "../../orchestrate/scripts/mailbox.mjs";
import { shortName } from "./launch.mjs";

const LEVELS = new Set(["read", "write"]);
const READ_PROFILE = "entrust_read";
// The codex-cli release the protocol facts were measured against, matching schema-<version>/.
const PINNED_CODEX = "0.159.3";
// This plugin's version; evals/package.test.mjs keeps it in step with the manifest.
const VERSION = "0.27.0";
let codexVersion = null;   // what the server reported this run, parsed out of InitializeResponse.userAgent
// The union of the model catalogue's reasoning levels and the server's accepted efforts; preflightModel()
// checks a requested one against the selected model before the turn.
const EFFORTS = new Set(["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"]);
// The server's accepted web-search modes; off by default, since a search makes the work depend on today's index.
const WEB_SEARCH = new Set(["cached", "indexed", "live"]);
// The tuning numbers this driver runs on, each with the reason it is that number.
const LIMITS = {
  // --brief caps what comes back inline; the full answer is always on disk.
  BRIEF_LINES: 20,
  BRIEF_BYTES: 4000,
  // The prompt cap, over --prompt, over stdin and over the whole prompt file including its header.
  MAX_PROMPT_BYTES: 512 * 1024,
  // An unterminated line, per connection: an item can carry a whole test run; a config reply cannot.
  MAX_LINE_BYTES: 32 * 1024 * 1024,
  PROBE_MAX_LINE_BYTES: 256 * 1024,
  // A JSON-RPC error body reaches stderr; a server that answers with a large object must not flood it.
  RPC_ERROR_CHARS: 120,
  // The config probe's stderr tail: a diagnostic quotes its last line and nothing reads more.
  PROBE_STDERR_KEEP: 8192,
  // What bounds an agent whose caller sized nothing: silence, then volume. Neither is a wall clock.
  DEFAULT_IDLE_TIMEOUT_S: 900,
  DEFAULT_MAX_COMMANDS: 1000,
  // Caps a DECLARED wall clock only; the default, 0, is no wall clock at all.
  MAX_TIMEOUT_S: 7200,
  // Retention for answers and job records: age first, then count, never the newest entry.
  PRUNE_DAYS: 14,
  PRUNE_MAX_ENTRIES: 400,
  // What a report gets to drain in where no wall clock was set, and the floor where one was.
  STDOUT_DRAIN_MIN_MS: 5000,
  // The config probe comes out of the turn's budget: normally ~120 ms, clamped to these.
  CONFIG_PROBE_MAX_MS: 5000,
  CONFIG_PROBE_MIN_MS: 1000,
  // Date directories the receipt search walks (a run may cross midnight), and the rollout bytes it reads.
  RECEIPT_LOOKBACK_DAYS: 2,
  RECEIPT_HEAD_BYTES: 64 * 1024,
  // The grace a declared wall clock's cut leaves the server, a quarter of the budget within these.
  CUT_GRACE_MIN_MS: 50,
  CUT_GRACE_MAX_MS: 10000,
  // A transient failure is retried only where the clock still leaves the backoff plus a turn worth having.
  TRANSIENT_TURN_MIN_MS: 10000,
  // A peer's rename(2) over the shared home's link makes readlink answer EINVAL for a moment; ask again.
  LINK_READ_ATTEMPTS: 8,
  // A lock retry needs a peer's state change, so this bounds contention, not a spin.
  LOCK_ATTEMPTS: 10,
  LOCK_RETRY_MS: 20,
  // Only a backstop for a recycled pid: owner liveness is what decides that a reclaim marker is abandoned.
  RECLAIM_BACKSTOP_MS: 3600000,
  // One bound for every command this driver spawns and waits on: any of them can hang the run.
  SPAWN_TIMEOUT_MS: 120_000,
  // The app-server stderr tail abort() prints: a run can be long, and how much was dropped is reported.
  STDERR_KEEP: 64 * 1024,
  // The in-flight answer rebuilt from the deltas, bounded because it grows with a turn going wrong.
  PARTIAL_MAX_CHARS: 256 * 1024,
  PARTIAL_MAX_ITEMS: 64,
  // Notifications held until the turn id arrives: a real burst is a handful, a stuck server is unbounded.
  EARLY_MAX_ITEMS: 1000,
  EARLY_MAX_BYTES: 8 * 1024 * 1024,
  // How long the turn's process group gets after SIGTERM, then after SIGKILL (async and sync callers).
  QUIESCE_TERM_MS: 2000,
  QUIESCE_KILL_MS: 1000,
  QUIESCE_KILL_SYNC_MS: 200,
  // How often an open request's decision file is looked for; ENTRUST_APPROVAL_POLL_MS is the suites' seam.
  APPROVAL_POLL_MS: 250,
};
// Not a limit: where to look for codex when PATH does not have it.
const CODEX_FALLBACK_DIRS = ["/opt/homebrew/bin", "/usr/local/bin", "~/.local/bin"];
// --timeout is the caller's whole budget, counted from the process start.
const startedAtMs = Date.now();

// Both handshakes share this payload: `name` records the rollout originator as "Claude Code",
// while `title` and `version` identify this driver in the response's userAgent.
const initializeParams = () => ({
  clientInfo: { name: "Claude Code", title: "entrust", version: VERSION },
  capabilities: {
    experimentalApi: false, requestAttestation: false,
    // Streams nobody reads, from the pinned ServerNotification. item/agentMessage/delta is not here: an
    // interrupted turn's in-flight message is discarded server-side, so the deltas are a cut run's only copy.
    optOutNotificationMethods: [
      "item/reasoning/summaryTextDelta", "item/reasoning/summaryPartAdded", "item/reasoning/textDelta",
      "item/commandExecution/outputDelta", "command/exec/outputDelta", "process/outputDelta",
      "item/fileChange/outputDelta", "item/plan/delta"
    ]
  }
});

// Set by --check-prompt-file, whose refusals are one line in a shape its caller reads.
let checkOnly = false;
function fail(code, msg) {
  process.stderr.write(checkOnly ? `entrust: refused: ${msg.replace(/\s*\n\s*/g, " ")}\n` : `entrust: ${msg}\n`);
  // A refusal is a report too: a missing file would read as an agent still starting.
  preTurnReport(code, msg);
  process.exitCode = code;
  // Settled before shutdown() kills the child, whose exit handler would otherwise rewrite the code to 4.
  settled = true;
  throw new Bail();
}
class Bail extends Error {}

// The prompt-file vocabulary, ONE table the parser, the refusals and --help all derive from. The kinds are
// trust boundaries: `rights` expands to several flags; `bool` and `value` are what a header may set; a
// `cli-only` name bounds or transports the run and is refused as a field, its default needing no header. A
// bool with `off` is granted by default, so "no" needs a flag of its own. RIGHTS is first, as in a header.
const FIELDS = [
  { name: "RIGHTS", kind: "rights", flag: null },
  { name: "EFFORT", kind: "value", flag: "--effort" },
  { name: "EXPECT", kind: "value", flag: "--expect-command" },
  { name: "NETWORK", kind: "bool", flag: "--network", off: "--no-network" },
  { name: "MODEL", kind: "value", flag: "--model" },
  { name: "WEB_SEARCH", kind: "value", flag: "--web-search" },
  { name: "OUTPUT_SCHEMA", kind: "value", flag: "--output-schema" },
  { name: "ALLOW_NO_COMMANDS", kind: "bool", flag: "--allow-no-commands" },
  { name: "BRIEF", kind: "bool", flag: "--brief" },
  { name: "WRITABLE", kind: "value", flag: "--writable" },
  { name: "RESUME", kind: "value", flag: "--resume" },
  { name: "TIMEOUT", kind: "cli-only", flag: "--timeout" },
  { name: "IDLE_TIMEOUT", kind: "cli-only", flag: "--idle-timeout" },
  { name: "MAX_COMMANDS", kind: "cli-only", flag: "--max-commands" },
  { name: "REPORT_FILE", kind: "cli-only", flag: "--report-file" },
  { name: "APPROVAL_DIR", kind: "cli-only", flag: "--approval-dir" },
];
const flagsOfKind = (k) => Object.fromEntries(FIELDS.filter((f) => f.kind === k).map((f) => [f.name, f.flag]));
const PROMPT_FIELDS = new Set(FIELDS.filter((f) => f.kind !== "cli-only").map((f) => f.name));
const CLI_ONLY_FIELDS = flagsOfKind("cli-only");
const BOOLS = flagsOfKind("bool");
const OFF_FLAGS = Object.fromEntries(FIELDS.filter((f) => f.off).map((f) => [f.name, f.off]));
const FLAGS = flagsOfKind("value");
// The extensions the server takes, and which item kind each becomes.
const ATTACH_KINDS = { png: "localImage", jpg: "localImage", jpeg: "localImage", gif: "localImage",
                       webp: "localImage", bmp: "localImage",
                       wav: "localAudio", mp3: "localAudio", m4a: "localAudio", ogg: "localAudio", flac: "localAudio" };
const attachExts = (kind) => Object.keys(ATTACH_KINDS).filter((k) => ATTACH_KINDS[k] === kind);
// Everything ENTRUST_STATE_DIR moves; attach-pasted.mjs owns pasted/ and reads the same variable.
const STATE_SUBDIRS = [
  ["locks/", "per-directory write locks"],
  ["answers/", "answers, partials, turn diffs"],
  ["home/", "the isolated Codex home"],
  ["jobs/", "`--resume last` and the worktree rebuild"],
  ["worktrees/", "the --worktree ledger"],
  ["pasted/", "attach-pasted.mjs's staged images"],
];

// The post-turn exit ladder, first match wins; decideExitCode() walks it and --help renders it. Each `when`
// reads only its argument, so a rung can be tested on a context built by hand.
const LADDER = [
  { code: EXIT.TIMEOUT,
    help: "cut on a budget: idle silence, commands, or a declared wall clock\n      (cut.kind says which); the report holds the answer or the partial,\n      and a hint naming RESUME: <this report's path>",
    when: (c) => c.turnStatus === "timedOut" || c.turnStatus === "maxCommands" },
  // A parameter the server rejected is the caller's to fix, not a transport failure to retry.
  { code: EXIT.USAGE, help: "the server refused the request",
    when: (c) => c.turnStatus !== "completed" && invalidRequest(c.turnError) },
  { code: EXIT.MODEL, help: "the turn did not complete",
    when: (c) => c.turnStatus !== "completed" },
  // Not an escalation: no sandbox change answers a question that needed a human.
  { code: EXIT.NEEDS_INPUT, help: "the turn wanted input no sandbox change can supply",
    when: (c) => c.interactions.length > 0 },
  // Above COMMANDS: a refused approval explains the missing command. An accepted one is no rung.
  { code: EXIT.APPROVAL,
    help: "an approval request was declined or expired unanswered; inspect the\n      report, if delivered, before judging task completeness",
    when: (c) => c.escalations.some((e) => e.decision !== "accepted") },
  // The floor asks only whether the turn ran anything, and --allow-no-commands waives it; a declared
  // --expect-command is stricter and is never waived: it needs a successful match.
  { code: EXIT.COMMANDS,
    help: "no command ran (--allow-no-commands waives this, --expect-command does\n      not)",
    when: (c) => c.opts.expectRe ? c.expected.length === 0 : (!c.opts.allowNoCommands && c.commandsRan === 0) },
  { code: EXIT.NO_ANSWER, help: "the turn produced no answer",
    when: (c) => !c.answer },
  { code: EXIT.SCHEMA, help: "the answer failed --output-schema",
    when: (c) => Boolean(c.opts.outputSchema) && c.schemaErrs.length > 0 },
  // No rung for a failed command: one discarded a ten-finding answer (incidents.md, red-green agents).
];
const ladderHelp = () => LADDER.map((r) => `  ${String(r.code).padStart(2)}  ${r.help}`).join("\n");
const stateSubdirHelp = () => STATE_SUBDIRS
  .map(([d, what]) => `  ${d.padEnd(11)}${what}`).join("\n");
// Wraps a joined list to the help's right margin, so a name added to a table reflows.
function wrapJoined(items, sep, indent, width = 79) {
  const out = [];
  let line = "";
  for (const it of items) {
    const next = line ? `${line}${sep}${it}` : it;
    if (line && indent + next.length > width) { out.push(line + sep.trimEnd()); line = it; }
    else line = next;
  }
  if (line) out.push(line);
  return out.join(`\n${" ".repeat(indent)}`);
}

// ---------------------------------------------------------------- help

// One help, rendered from the tables the parser and the ladder read, so a field or a rung cannot reach one
// and not the other. What a coordinator needs is on the shared call page; the internals behind each flag are
// codex/references/environment-and-internals.md.
function helpText() {
  return `entrust ${VERSION} — run one Codex turn with rights declared per call.

The launcher (orchestrate's agent-run.mjs) runs this driver with a prompt file, a report path and a
mailbox; a coordinator never types it. A person reads this to know what that run does.

  node driver.mjs --prompt-file F --report-file ABS --approval-dir D
  node driver.mjs --check-prompt-file F     exit 2 on what --prompt-file F would refuse, offline
  node driver.mjs [--level read|write] [--cwd DIR] [options] --prompt TEXT   (or the prompt on stdin)
  node driver.mjs -h | --help                 this text

Prompt file: "FIELD: value" header lines, RIGHTS first when present, then the body, from the first
line that is not one; a TASK:, CHECK: or RETURN: line always opens it. No RIGHTS line is a read agent
in the current directory, and an unknown ALL-CAPS name above the body is exit 2. Fields:
                     ${wrapJoined([...PROMPT_FIELDS], "/", 21)}
Command-line only, refused in a file, so an injected line can neither size nor redirect a run:
                     ${wrapJoined(Object.values(CLI_ONLY_FIELDS), " ", 21)}
                     and --attach FILE (${[...attachExts("localImage"), ...attachExts("localAudio")].join("/")})

Rights
  --level read       the default: read anything, write only the run's own $TMPDIR
  --level write      write under --cwd, each --writable root and $TMPDIR; /tmp is excluded, and a
                     per-directory lock is taken. --cwd is then required
  --cwd DIR          where the turn runs
  --worktree REPO    run in a detached worktree of REPO cut at HEAD, the LAST COMMIT, harvest its
                     work to <state>/answers/ and remove the tree; uncommitted work is not in it
  --writable DIR     grant one more root (write level only, repeatable)
  --no-network       deny the agent's own commands the network, which both levels have by default;
                     --network says so explicitly
  --web-search ${[...WEB_SEARCH].join("|")}   the provider's search tool, off by default
  --host-home        run against the caller's ~/.codex instead of the driver's isolated home
  every granted root refuses ~/.codex, <state> and every directory above either

Turn
  --prompt TEXT      the task; without it the task is read on stdin
  --model NAME, --effort LEVEL, --resume THREAD, --output-schema F, --brief, --expect-command RE,
  --allow-no-commands: the prompt-file fields of the same names
  --report-file ABS  publish the report there as well as on stdout: an ABSOLUTE path that does not
                     exist yet, written whole or not at all, so a missing file means unknown
  --approval-dir D   the agent's mailbox, set by the launcher and never by a person. A request waits
                     for D/<id>.decision.json, or for ${DEADLINE_MS / 60000} minutes, after which it is declined as
                     expired and the turn goes on; without D every request is declined at once. An
                     accepted command runs with no sandbox, as you; a file change inside the writable
                     roots is accepted by the driver, and one not shown inside them is declined at once

Bounds
  --timeout S        none by default; a declared wall clock cuts the turn at T minus a grace (exit 3)
  --idle-timeout S   default ${LIMITS.DEFAULT_IDLE_TIMEOUT_S}, 0 disables: how long the thread may say nothing (exit 3)
  --max-commands N   default ${LIMITS.DEFAULT_MAX_COMMANDS}, 0 disables: how many commands the turn may run (exit 3)

Exit codes. Before a turn: 2 bad arguments or a refused prompt; 3 a stalled probe, or no prompt on
stdin within the silence budget; 4 transport, and every sandbox or mailbox assertion; 10 a held lock,
or a resumed thread still open. After the turn, first match wins:
${ladderHelp()}
  and 4 again if the report could not be delivered. A report with turnStatus null had no turn.

State: <state> is ENTRUST_STATE_DIR, absolute, else <tmp>/entrust-state:
${stateSubdirHelp()}
Environment: ENTRUST_CODEX, an absolute codex path, else PATH, then ${CODEX_FALLBACK_DIRS.join(", ")};
ENTRUST_SESSIONS_DIR, where the rollout receipts are.

The report, the mailbox, $TMPDIR, the worktree, the isolated home and the lock:
codex/references/environment-and-internals.md.
`;
}

// ---------------------------------------------------------------- arguments

// --prompt-file exists so a wrapper never builds a shell command line out of values it was handed: there is
// no shell between the header and the flags, and a malformed file is a usage error, never another agent. A
// NEWLINE in a copied value still ends its field and opens another, so the answers are structural and here:
// RIGHTS must come FIRST, which makes an injected one a duplicate, and ATTACH and --report-file are no
// fields, since an injected line would upload a file or redirect a report nobody named.
let promptFileFields = null;   // what the file actually declared, for the report
let promptFileBody = null;     // the prompt the file carried under its header, or null when it carried none
// A header line, and the three labels that open the body instead of being fields of it.
const RIGHTS_HEADER_RE = /^([A-Z][A-Z_]*):/;
const BODY_LABELS = new Set(["TASK", "CHECK", "RETURN"]);
function argvFromPromptFile(file) {
  let raw;
  try { raw = fs.readFileSync(file, "utf8"); }
  catch (e) { fail(EXIT.USAGE, `--prompt-file cannot read ${file}: ${e.message}`); }
  if (Buffer.byteLength(raw) > LIMITS.MAX_PROMPT_BYTES)
    fail(EXIT.USAGE, `--prompt-file exceeds ${LIMITS.MAX_PROMPT_BYTES} bytes, the prompt cap: the file carries the body as well as the header`);
  const out = [], seen = new Set(), declared = [];
  let rightsValue, modelValue, resumeValue;
  const writableValues = [];
  const lines = raw.split("\n");
  let bodyAt = 0;
  for (; bodyAt < lines.length; bodyAt++) {
    const line = lines[bodyAt];
    const m = RIGHTS_HEADER_RE.exec(line);
    // The header ends at the first line that is not FIELD:, or at a TASK:/CHECK:/RETURN: label.
    if (!m || BODY_LABELS.has(m[1])) break;
    const field = m[1];
    const value = line.slice(m[0].length).trim();
    if (Object.hasOwn(CLI_ONLY_FIELDS, field))
      fail(EXIT.USAGE, `--prompt-file: ${field} is command-line-only; pass ${CLI_ONLY_FIELDS[field]} instead. It bounds or transports the run rather than declaring its rights, and its default is chosen so an agent needs none`);
    if (!PROMPT_FIELDS.has(field))
      fail(EXIT.USAGE, `unknown header field ${field} at line ${bodyAt + 1} of ${file} — a typo, or a command-line-only flag; the body starts at the first TASK: line`);
    if (field !== "WRITABLE" && seen.has(field)) fail(EXIT.USAGE, `--prompt-file: ${field} appears more than once`);
    seen.add(field);
    declared.push(field);
    // RIGHTS expands once the header is read and the plan's writes are known.
    if (field === "RIGHTS") {
      const rights = parseRights(value);
      if (rights.error) fail(EXIT.USAGE, `--prompt-file: ${rights.error}`);
      rightsValue = value;
      continue;
    }
    if (field === "MODEL") modelValue = value;
    if (field === "WRITABLE") writableValues.push(value);
    if (field === "RESUME") { resumeValue = value; continue; }
    if (BOOLS[field]) {
      // A "no" omits the flag, except for a field granted by default, whose negative flag is sent.
      if (/^(no|false|0)$/i.test(value)) { if (OFF_FLAGS[field]) out.push(OFF_FLAGS[field]); continue; }
      if (!/^(yes|true|1)$/i.test(value)) fail(EXIT.USAGE, `--prompt-file: ${field} must be yes|true|1, no|false|0, or omitted, got ${JSON.stringify(value)}`);
      out.push(BOOLS[field]);
      continue;
    }
    if (!value) fail(EXIT.USAGE, `--prompt-file: ${field} has an empty value`);
    out.push(FLAGS[field], value);
  }
  // A header-only file leaves the prompt to stdin or --prompt.
  const body = lines.slice(bodyAt).join("\n");
  promptFileBody = body.trim() ? body : null;
  // After the scan: only a finished header tells "no rights" from "rights not first".
  if (seen.has("RIGHTS") && declared[0] !== "RIGHTS")
    fail(EXIT.USAGE, `--prompt-file: the first field must be RIGHTS, not ${declared[0]} — a prompt file that does not open with its rights declaration lets a later line supply them`);
  // No RIGHTS is the narrowest default, read in the current directory. Under a registered plan (the
  // launcher's ENTRUST_PLAN_WRITES and ENTRUST_PLAN_MODEL) an absent RIGHTS or MODEL is the row's, and one
  // that departs from the row is refused.
  const planWrites = process.env.ENTRUST_PLAN_WRITES || undefined;
  // RESUME names the earlier run's report: its thread, and its rights and WRITABLE roots, which a
  // continuation keeps. A bare thread id is still taken; `last` is not, being maybe another worker's.
  let kept = null;
  if (resumeValue === "last") fail(EXIT.USAGE, "--prompt-file: RESUME last is not accepted: name the earlier run's report path");
  if (resumeValue !== undefined && path.isAbsolute(resumeValue)) {
    const prior = readJson(resumeValue);
    if (!prior || typeof prior.threadId !== "string" || !prior.driverVersion)
      fail(EXIT.USAGE, `--prompt-file: RESUME ${resumeValue} is not a Codex report with a thread to continue`);
    if (typeof prior.exitCode !== "number") fail(EXIT.USAGE, `--prompt-file: RESUME ${resumeValue} names a run that has not finished`);
    kept = prior.worktreeRepo ? { kind: "worktree", path: prior.worktreeRepo }
      : { kind: prior.level === "write" ? "write" : "read", path: prior.cwd };
    if (writableValues.length) fail(EXIT.USAGE, "--prompt-file: a continuation keeps its rights, its WRITABLE roots included; leave WRITABLE out");
    for (const w of prior.writableRootsRequested ?? []) out.push("--writable", w);
    out.push("--resume", prior.threadId);
  } else if (resumeValue !== undefined) out.push("--resume", resumeValue);
  const asked = rightsValue === undefined && !planWrites ? kept ?? { kind: "read", path: null }
    : resolveRights(rightsValue, planWrites, process.cwd());
  if (asked.error) fail(EXIT.USAGE, `--prompt-file: ${asked.error}`);
  const at = (r) => canonical(r.path ?? process.cwd());
  if (kept && (asked.kind !== kept.kind || at(asked) !== at(kept)))
    fail(EXIT.USAGE, `--prompt-file: a continuation keeps its rights, ${kept.kind} ${kept.path}; name the same or leave RIGHTS out`);
  const rights = kept ?? asked;
  // A WRITABLE: root is a write grant too, so a plan's writes bind it: it lies inside the row's write root.
  if (planWrites) {
    const planned = planWritesToRights(planWrites, process.cwd());
    for (const w of writableValues)
      if (planned.kind !== "write" || !within(canonical(w), canonical(planned.path)))
        fail(EXIT.USAGE, `--prompt-file: WRITABLE ${w} lies outside the approved plan's writes (${planWrites})`);
  }
  out.unshift(...(rights.kind === "worktree" ? ["--worktree", rights.path]
    : ["--level", rights.kind, ...(rights.path ? ["--cwd", rights.path] : [])]));
  const model = resolveModel(modelValue, process.env.ENTRUST_PLAN_MODEL || undefined,
    (value, planned) => shortName(value).toLowerCase() === planned.toLowerCase());
  if (model.error) fail(EXIT.USAGE, `--prompt-file: ${model.error}`);
  if (modelValue === undefined && model.model) out.push("--model", model.model);
  promptFileFields = declared;
  return out;
}

function parseArgs(argv) {
  // Defaults: config.toml's model and effort; no wall clock, silence and volume bound the turn; egress at
  // both levels, as a native subagent has it, with --no-network the whole opt-out (no host allowlist).
  const o = { level: "read", network: true, timeout: 0, idleTimeout: LIMITS.DEFAULT_IDLE_TIMEOUT_S, maxCommands: LIMITS.DEFAULT_MAX_COMMANDS, writable: [], attach: [] };
  const need = (i, flag) => {
    const v = argv[i];
    if (v === undefined || v === "" || v.startsWith("--")) fail(EXIT.USAGE, `${flag} requires a non-empty value`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--prompt-file": o.promptFile = need(++i, a); break;
      // Validated in readOpts, off the raw command line, so a refusal the prompt file causes reaches it too.
      case "--report-file": o.reportFile = need(++i, a); break;
      case "--level": o.level = need(++i, a); o.levelExplicit = true; break;
      case "--cwd": o.cwd = need(++i, a); break;
      case "--worktree": o.worktree = need(++i, a); break;
      case "--effort": o.effort = need(++i, a); break;
      case "--model": o.model = o.requestedModel = need(++i, a); break;
      case "--timeout": o.timeout = Number(need(++i, a)); break;
      case "--idle-timeout": o.idleTimeout = Number(need(++i, a)); break;
      case "--max-commands": o.maxCommands = Number(need(++i, a)); break;
      case "--approval-dir": o.approvalDir = need(++i, a); break;
      // need() rejects a missing value or another flag; a prompt starting with "--" belongs on stdin.
      case "--prompt": o.prompt = need(++i, a); break;
      case "--writable": o.writable.push(need(++i, a)); break;
      case "--attach": o.attach.push(need(++i, a)); break;
      case "--resume": o.resume = need(++i, a); break;
      case "--allow-no-commands": o.allowNoCommands = true; break;
      case "--expect-command": o.expect = need(++i, a); break;
      case "--network": o.network = true; break;
      case "--no-network": o.network = false; break;
      case "--web-search": o.webSearch = need(++i, a); break;
      case "--output-schema": o.outputSchemaFile = need(++i, a); break;
      case "--brief": o.brief = true; break;
      case "--host-home": o.hostHome = true; break;
      // Asking for help is not a usage error: it goes to stdout and exits 0, so `--help | head` works.
      // No process.exit() behind the write: on an asynchronous pipe (macOS) that truncates the text.
      case "-h": case "--help":
        process.stdout.write(helpText()); process.exitCode = EXIT.SUCCESS; settled = true; throw new Bail();
      default: fail(EXIT.USAGE, `unknown argument: ${a}`);
    }
  }
  if (!LEVELS.has(o.level)) fail(EXIT.USAGE, `--level must be one of ${[...LEVELS].join("|")}`);
  // The server enumerates these itself and rejects anything else at startup, which would surface as a
  // transport failure long after the caller could act on it.
  if (o.webSearch !== undefined && !WEB_SEARCH.has(o.webSearch))
    fail(EXIT.USAGE, `--web-search must be one of ${[...WEB_SEARCH].join("|")}`);
  if (o.effort !== undefined && !EFFORTS.has(o.effort))
    fail(EXIT.USAGE, `--effort must be one of ${[...EFFORTS].join("|")}`);
  // 0 is the documented "no wall clock" default; MAX_TIMEOUT_S caps only a declared budget.
  if (!Number.isFinite(o.timeout) || o.timeout < 0 || o.timeout > LIMITS.MAX_TIMEOUT_S)
    fail(EXIT.USAGE, `--timeout must be a number of seconds, 0 for no wall clock, at most ${LIMITS.MAX_TIMEOUT_S}`);
  // 0 is the documented "off", like --idle-timeout's.
  if (!Number.isInteger(o.maxCommands) || o.maxCommands < 0)
    fail(EXIT.USAGE, "--max-commands must be a whole number of commands, 0 to disable");
  // 0 is the documented "off", so the floor is 0 rather than a positive number.
  if (!Number.isFinite(o.idleTimeout) || o.idleTimeout < 0)
    fail(EXIT.USAGE, "--idle-timeout must be a number of seconds, 0 to disable");
  // The only clock on an approval wait (the server waits without bound, the idle guard pauses), read once so
  // every request of a run waits under one clock.
  o.approvalDeadlineMs = deadlineMs();
  if (o.approvalDir !== undefined && !path.isAbsolute(o.approvalDir))
    fail(EXIT.USAGE, `--approval-dir must be an absolute path, got ${JSON.stringify(o.approvalDir)}`);
  // MAX_PROMPT_BYTES caps --prompt, stdin and the prompt file before the server sees them.
  if (o.prompt !== undefined && Buffer.byteLength(o.prompt) > LIMITS.MAX_PROMPT_BYTES)
    fail(EXIT.USAGE, `--prompt exceeds ${LIMITS.MAX_PROMPT_BYTES} bytes; pipe a long prompt on stdin instead`);
  // --attach maps a local file into the turn's input as the protocol's own item kind — the parity a
  // native subagent has when a screenshot is pasted into its prompt. Checked here so a typo costs
  // nothing: the server would otherwise refuse it mid-turn, after the delegation was already paid for.
  o.attachments = o.attach.map((p) => {
    const real = canonPath(p);
    if (real === null) return fail(EXIT.USAGE, `--attach: ${p} does not exist`);
    if (!fs.statSync(real).isFile()) fail(EXIT.USAGE, `--attach: ${real} is not a regular file`);
    const kind = ATTACH_KINDS[(real.split(".").pop() ?? "").toLowerCase()];
    if (!kind) fail(EXIT.USAGE, `--attach: unsupported file type for ${real}; images (${attachExts("localImage").join("/")}) and audio (${attachExts("localAudio").join("/")})`);
    return { type: kind, path: real };
  });

  // --worktree owns the cwd it creates, and it is a write-level shape by construction: the whole point
  // is a tree the turn may edit. An explicit --level read beside it is a contradiction, not a hint.
  if (o.worktree && o.cwd) fail(EXIT.USAGE, "--worktree and --cwd are contradictory: the created worktree becomes the cwd");
  if (o.worktree && o.levelExplicit && o.level === "read") fail(EXIT.USAGE, "--worktree requires --level write");
  if (o.worktree) o.level = "write";
  if (o.level === "read" && o.writable.length) fail(EXIT.USAGE, "--writable belongs to --level write");
  // --cwd is a GRANT at write level and must be named there. At read level it only says which tree to
  // read, and the current directory is what a native subagent reads when nobody says otherwise.
  if (!o.cwd && !o.worktree) {
    if (o.level !== "read") fail(EXIT.USAGE, "--cwd is required at --level write: the writable root is a grant, and a defaulted grant is one nobody made");
    o.cwd = canonPath(process.cwd()) ?? process.cwd();
  }
  // Compile it now: an invalid pattern thrown from inside the report handler kills the run long after
  // the work is done, and costs the whole delegation.
  if (o.expect !== undefined) {
    try { o.expectRe = new RegExp(o.expect); }
    catch (e) { fail(EXIT.USAGE, `--expect-command is not a valid regular expression: ${e.message}`); }
  }
  // Read and sanity-check the schema now, for the same reason as the regex above.
  if (o.outputSchemaFile !== undefined) {
    ({ schema: o.outputSchema, serverSchema: o.serverSchema, caps: o.schemaSizeCaps,
      unchecked: o.schemaUnchecked } = validateOutputSchema(o.outputSchemaFile));
    o.answerJson = true;   // the schema subsumes the bare-JSON demand
  }
  return o;
}

// Everything --output-schema is refused for, before a turn is paid for. The answer contract is ONE bare
// JSON object, so a schema demanding anything else is a contradiction, not a preference. Returns the
// parsed schema beside the keywords the driver's own validator will not re-check.
function validateOutputSchema(file) {
  let raw;
  try { raw = fs.readFileSync(file, "utf8"); }
  catch (e) { fail(EXIT.USAGE, `--output-schema cannot read ${file}: ${e.message}`); }
  let schema;
  try { schema = JSON.parse(raw); }
  catch (e) { fail(EXIT.USAGE, `--output-schema is not valid JSON: ${e.message}`); }
  if (schema === null || typeof schema !== "object" || Array.isArray(schema))
    fail(EXIT.USAGE, "--output-schema must be a JSON Schema object");
  // The answer contract is ONE bare JSON object, so admission must require an unambiguous object type.
  if (schema.type !== "object" &&
      !(Array.isArray(schema.type) && schema.type.length === 1 && schema.type[0] === "object"))
    fail(EXIT.USAGE, '--output-schema must declare "type": "object" at the top level (the answer contract is one bare JSON object)');
  // The provider requires STRICT schemas; measured live rejection messages include:
  //   plain object      -> "In context=(), 'additionalProperties' is required to be supplied and to be false."
  //   nested object     -> the same, "In context=('properties', 'meta')"
  //   optional property -> "'required' ... an array including every key in properties. Missing 'note'."
  // Validate these rules alongside the object-type check above, before spending a turn.
  (function strict(s, ctx) {
    if (s === null || typeof s !== "object" || Array.isArray(s)) return;
    const where = ctx.length ? ` at ${ctx.join(".")}` : " at the top level";
    const isObject = s.type === "object" ||
      (Array.isArray(s.type) && s.type.length === 1 && s.type[0] === "object");
    if (isObject) {
      if (s.additionalProperties !== false)
        fail(EXIT.USAGE, `--output-schema${where}: every object must set "additionalProperties": false — the server requires a strict schema and rejects the request otherwise, after the turn has already started`);
      const props = Object.keys(s.properties ?? {});
      const req = new Set(Array.isArray(s.required) ? s.required : []);
      const missing = props.filter((k) => !req.has(k));
      if (missing.length)
        fail(EXIT.USAGE, `--output-schema${where}: "required" must list every key in "properties" — the server permits no optional properties in a strict schema; missing ${missing.map((m) => JSON.stringify(m)).join(", ")}. Make them nullable (\`"type": ["string","null"]\`) instead of optional`);
    }
    for (const [k, v] of Object.entries(s.properties ?? {})) strict(v, [...ctx, "properties", k]);
    if (s.items && !Array.isArray(s.items)) strict(s.items, [...ctx, "items"]);
  })(schema, []);
  // The validator implements a subset. Every keyword outside it is collected here and REPORTED, so
  // outputSchemaOk can never silently mean "nothing was checked" — the server still enforces the full
  // schema during generation; the driver's independent check just names what it could not re-verify.
  // additionalProperties is in the SUPPORTED set because the strict rule above makes it mandatory:
  // listing a keyword as unchecked on every single schema would be noise, so the validator honours it
  // instead.
  const SUPPORTED = new Set(["type", "required", "properties", "enum", "items", "maxLength", "maxItems", "additionalProperties",
    "description", "title", "$schema", "$id", "default", "examples"]);
  const unchecked = new Set();
  (function walk(s) {
    if (Array.isArray(s)) return s.forEach(walk);
    if (s === null || typeof s !== "object") return;
    for (const [k, v] of Object.entries(s)) {
      if (!SUPPORTED.has(k)) unchecked.add(k);
      if (k === "properties" && v && typeof v === "object") Object.values(v).forEach(walk);
      else if (k === "items") walk(v);
    }
  })(schema);
  if (Array.isArray(schema.items)) unchecked.add("items(tuple form)");
  const caps = [];
  (function collect(s, at = "$") {
    if (!s || typeof s !== "object" || Array.isArray(s)) return;
    for (const key of ["maxLength", "maxItems"]) if (Object.hasOwn(s, key)) {
      if (!Number.isSafeInteger(s[key]) || s[key] < 0)
        fail(EXIT.USAGE, `--output-schema ${at}.${key} must be a nonnegative integer`);
      caps.push({ path: at, keyword: key, limit: s[key] });
    }
    for (const [k, v] of Object.entries(s.properties ?? {})) collect(v, `${at}.${k}`);
    if (s.items && !Array.isArray(s.items)) collect(s.items, `${at}[]`);
  })(schema);
  const serverSchema = JSON.parse(JSON.stringify(schema));
  (function strip(s) {
    if (!s || typeof s !== "object" || Array.isArray(s)) return;
    delete s.maxLength; delete s.maxItems;
    for (const v of Object.values(s.properties ?? {})) strip(v);
    if (s.items && !Array.isArray(s.items)) strip(s.items);
  })(serverSchema);
  // Returned, never written here: this runs inside readOpts, and a line printed from there would come
  // out ahead of the pid line every page tells a caller to read off stderr first. main() says it.
  return { schema, serverSchema, caps, unchecked: unchecked.size ? [...unchecked].sort() : null };
}

// `file` admits a regular file as well: a read-level root may be one file a tool opens read-write.
function resolveDir(p, what) {
  const real = canonPath(p);
  if (real === null) fail(EXIT.USAGE, `${what} does not exist: ${p}`);
  if (!fs.statSync(real).isDirectory()) fail(EXIT.USAGE, `${what} is not a directory: ${real}`);
  return real;
}

// A writable root must not grant the home directory or its ancestors, ~/.codex (a writable ~/.codex/sessions
// makes the receipt forgeable) or the state directory (the locks, the mailboxes, the isolated home): the shared
// check, by dev:ino.
function checkRoot(dir) {
  const home = passwdHome("the home-directory guard");
  const why = writeRootProblem(dir, { home, stateDir: stateDir(), protectedDirs: [
    { dir: path.join(canonPath(home) ?? home, ".codex"), label: "~/.codex", holds: "the rollout receipts" }] });
  if (why) fail(EXIT.USAGE, why);
  return dir;
}

// Writers on one tree exclude each other only when they resolve the same state root, ENTRUST_STATE_DIR else
// <tmp>/entrust-state; the launcher records the one --new resolved. Never inside the protected directory:
// an agent's `git add -A` would stage the lock.
//
// ---------------------------------------------------------------- the report file
//
// The FILE is the delivery that counts, stdout the copy. Its path must not exist yet, or two agents'
// evidence share one file; it is published by link(2) at 0600, which refuses every existing entry, symlinks
// included, where rename(2) would replace one, so a reader finds the whole report or none.
let reportFilePath = null;
let reportFileWritten = false;
// Checked BEFORE the prompt file is expanded, so a refusal the prompt file itself causes still reaches the
// caller waiting on the report. Every failure here is a usage error, decided before anything is spawned.
function openReportFile(p) {
  if (!path.isAbsolute(p))
    fail(EXIT.USAGE, `--report-file must be an absolute path — it is read by a caller with a directory of its own — got ${JSON.stringify(p)}`);
  const dir = path.dirname(p);
  // A missing parent is MADE here, at 0700 and all the way down, rather than refused. A headless
  // coordinator's own Write and mkdir under the plugin's data directory are denied as a sensitive path,
  // with no prompt anyone can answer, while this process handed the same path as an argument is not
  // (measured 2026-09-08) — so a subprocess, the launcher's --new or this driver, is what creates a run's
  // directory. mkdir -p over a directory
  // already there changes nothing, and a file in the way is EEXIST or ENOTDIR, refused like any parent.
  try { fs.mkdirSync(dir, { recursive: true, mode: 0o700 }); }
  catch (e) { fail(EXIT.USAGE, `--report-file cannot use ${dir}: ${e.message}`); }
  try { fs.accessSync(dir, fs.constants.W_OK); }
  catch (e) { fail(EXIT.USAGE, `--report-file cannot write into ${dir}: ${e.message}`); }
  // lstat, not existsSync: existsSync FOLLOWS the link, so a dangling symlink at the path reads as
  // absent and the publication would then decide what happens to it.
  let there = false;
  try { fs.lstatSync(p); there = true; } catch {}
  if (there)
    fail(EXIT.USAGE, `--report-file ${p} already exists, or is a symbolic link; a report is never written over an entry already there, so name a path of this run's own`);
  reportFilePath = p;
}
// Whole or not at all: the temp name is refused if it exists (wx) and the link is what publishes.
// Returns whether the report is durable, which is what decides how much a broken stdout costs.
function publishReport(text) {
  if (reportFilePath === null || reportFileWritten) return reportFileWritten;
  const tmp = `${reportFilePath}.${crypto.randomBytes(8).toString("hex")}.tmp`;
  try {
    fs.writeFileSync(tmp, text, { mode: 0o600, flag: "wx" });
    fs.linkSync(tmp, reportFilePath);
    reportFileWritten = true;
  } catch (e) {
    // EEXIST here is a second run that named this path and published first, which the pre-spawn check
    // could not have seen. Its report stays; this one says where to find its own.
    const why = e.code === "EEXIST"
      ? "a report is already there (another run named the same path); this run's report went to stdout alone, which before a turn carries nothing"
      : e.message;
    process.stderr.write(`entrust: the report could not be published at ${reportFilePath}: ${why}\n`);
  } finally {
    try { fs.rmSync(tmp, { force: true }); } catch {}
  }
  return reportFileWritten;
}
// A refusal before any turn is still a report, in the same shape, with nothing invented. A managed worktree
// is disposed of here, before the report, so the report names a preserved tree; whichever of this and the
// post-turn path runs first sets `disposed`.
function preTurnReport(code, msg) {
  if (reportFilePath === null || reportFileWritten) return;
  const wt = worktreeLastResort();
  publishReport(`${JSON.stringify({ adapter: "codex", ok: false, exitCode: code, threadId: rootThreadId,
    turnStatus: null, answer: "", error: msg, reportPath: reportFilePath, ...(wt ?? {}) }, null, 2)}\n`);
}

// Resolved LAZILY, never at module scope: os.userInfo() THROWS for a uid with no passwd entry (a
// container with no passwd mapping); resolve it inside main() so a failure receives a usage error.
function passwdHome(what) {
  try { return os.userInfo().homedir; }
  catch (e) { fail(EXIT.USAGE, `cannot resolve your home directory from the passwd database, which ${what} needs (${e.code ?? e.message}); this happens for a uid with no passwd entry`); }
}

// One base for everything in STATE_SUBDIRS, by orchestrate's temp-dir.mjs rule: in the temporary
// directory, not the home, so nothing outlives an uninstall. Resolved once, in readOpts, absolute or exit
// 2 before a lock, a home or a worktree exists, rather than refused after the tokens are spent.
let stateRoot = null;
function stateDir() {
  if (stateRoot !== null) return stateRoot;
  try { stateRoot = stateDirectory(); }
  catch (e) { fail(EXIT.USAGE, `no usable state directory: ${e.message}`); }
  return stateRoot;
}
const lockDir = () => path.join(stateDir(), "locks");

// The private home keeps the caller's plugins, skills, memories and MCP servers out of the turn, and their
// config.toml free of trust records (environment-and-internals.md, the isolated home). auth.json and
// sessions are linked back, so a token refresh and the rollout receipt land in the real home. The INHERITED
// keys choose the model and how it is spoken to, and are asked of the server (config/read), never parsed.
//
// JSON.stringify emits DEL and C1 raw, which a TOML basic string forbids; codex would reject the file.
const tomlString = (v) => JSON.stringify(v).replace(/[\u007f-\u009f]/g,
  (c) => `\\u${c.codePointAt(0).toString(16).padStart(4, "0")}`);

// Resolve codex once in setup() for both spawns: ENTRUST_CODEX, then PATH, then CODEX_FALLBACK_DIRS.
let codexBin = "codex";
function resolveCodexBin() {
  const runnable = (p) => { try { fs.accessSync(p, fs.constants.X_OK); return fs.statSync(p).isFile(); } catch { return false; } };
  const override = process.env.ENTRUST_CODEX;
  if (override) {
    if (!path.isAbsolute(override) || !runnable(override))
      fail(EXIT.USAGE, `ENTRUST_CODEX must be an absolute path to an executable codex, got ${JSON.stringify(override)}`);
    return override;
  }
  for (const d of (process.env.PATH ?? "").split(path.delimiter)) {
    if (d && runnable(path.join(d, "codex"))) return path.join(d, "codex");
  }
  const fallbacks = CODEX_FALLBACK_DIRS.map((dir) => dir.startsWith("~/")
    ? path.join(passwdHome("codex resolution"), dir.slice(2)) : dir);
  for (const d of fallbacks) if (runnable(path.join(d, "codex"))) return path.join(d, "codex");
  fail(EXIT.TRANSPORT, `codex not found on PATH or in ${fallbacks.join(", ")}; install it, or set ENTRUST_CODEX to its absolute path`);
}

const INHERITED = ["model", "model_reasoning_effort", "personality", "service_tier", "model_provider"];

// The selected provider's table, so that a provider of the caller's own is the one an isolated agent answers on:
// its scalars, string lists and one-level string maps (headers, query parameters); anything deeper is not carried.
function providerTable(cfg) {
  const name = cfg.model_provider, table = cfg.model_providers?.[name];
  if (typeof name !== "string" || !table || typeof table !== "object" || Array.isArray(table)) return "";
  const value = (v) => typeof v === "string" ? tomlString(v)
    : (typeof v === "number" && Number.isFinite(v)) || typeof v === "boolean" ? String(v)
      : Array.isArray(v) && v.every((x) => typeof x === "string") ? `[${v.map(tomlString).join(", ")}]`
        : v && typeof v === "object" && Object.values(v).every((x) => typeof x === "string")
          ? `{ ${Object.entries(v).map(([k, x]) => `${tomlString(k)} = ${tomlString(x)}`).join(", ")} }` : null;
  const lines = Object.entries(table).map(([k, v]) => [k, value(v)]).filter(([, v]) => v !== null);
  return `\n[model_providers.${tomlString(name)}]\n${lines.map(([k, v]) => `${tomlString(k)} = ${v}\n`).join("")}`;
}

// Resolve { entries, failed } so a failed config request cannot be mistaken for an empty config.
async function inheritedConfig() {
  const warn = (why) => process.stderr.write(
    `entrust: could not read the caller's Codex config (${why}); model and effort fall back to the account default\n`);
  let probe;
  // Read the caller's config without overriding CODEX_HOME, starting a thread or calling a model.
  // Detached so the whole process group can be killed: descendants cannot then keep its pipes open.
  try { probe = spawn(codexBin, ["--strict-config", "app-server"], { stdio: ["pipe", "pipe", "pipe"], detached: true }); }
  catch (e) {
    // Warn on synchronous spawn failures as well as asynchronous ones before falling back to account defaults.
    warn(`spawn failed: ${e.message}`);
    return { entries: [], failed: true };
  }
  // Clamp a declared timeout between CONFIG_PROBE_MIN_MS and CONFIG_PROBE_MAX_MS.
  // Without a wall clock, use CONFIG_PROBE_MAX_MS; this probe runs before the turn timers are armed.
  const budget = opts.timeout > 0 ? Math.min(LIMITS.CONFIG_PROBE_MAX_MS, Math.max(LIMITS.CONFIG_PROBE_MIN_MS, opts.timeout * 1000)) : LIMITS.CONFIG_PROBE_MAX_MS;
  // Cap the stderr buffer: diagnostics use only its tail.
  let err = "";
  probe.stderr.on("data", (d) => { err = (err + d).slice(-LIMITS.PROBE_STDERR_KEEP); });
  const why = (base) => {
    const tail = err.trim().replace(/\s+/g, " ").slice(-160);
    return tail ? `${base}: ${tail}` : base;
  };
  const conn = jsonRpcConn(probe, { maxLine: LIMITS.PROBE_MAX_LINE_BYTES,
    onOverflow: () => conn.rejectAll(new Error(why("config/read reply exceeds 256KB without a newline"))) });
  // The one way to end the probe from outside: shutdown() and the exit handler close it, which settles
  // the awaited request as a cancellation rather than as a failure with a misleading warning.
  probeConn = conn;
  probe.on("error", (e) => conn.rejectAll(new Error(why(e.message))));
  probe.on("close", () => conn.rejectAll(new Error(why("the config probe exited before replying"))));
  try {
    // Never awaited, and its rejection is swallowed: close() would otherwise turn the handshake into an
    // unhandled rejection after the config had been read perfectly well.
    conn.request("initialize", initializeParams()).catch(() => {});
    conn.notify("initialized");
    const res = await conn.request("config/read", {}, { timeoutMs: budget });
    // Report an unusable reply as a failed request, not as an empty config.
    const cfg = res?.config;
    if (cfg === null || typeof cfg !== "object")
      throw new Error(`config/read returned no usable config (${JSON.stringify(res).slice(0, 80)})`);
    const wrong = INHERITED.filter((k) => cfg[k] !== undefined && cfg[k] !== null && typeof cfg[k] !== "string");
    if (wrong.length)
      process.stderr.write(`entrust: the caller's Codex config reports ${wrong.join(", ")} as something other than text; those are not carried across\n`);
    return { entries: INHERITED.filter((k) => typeof cfg[k] === "string").map((k) => [k, tomlString(cfg[k])]), table: providerTable(cfg), failed: false };
  } catch (e) {
    // Warn when asking for config fails, but stay quiet for an empty config or a shutdown cancellation.
    // A cancellation is still a failed config request, so it must not replace the last-known-good config
    // with an empty one.
    if (!e.cancelled) warn(e.timedOut ? why(e.message) : e.message);
    return { entries: [], failed: true };
  } finally {
    conn.close({ kill: "SIGKILL" });
    probeConn = null;
  }
}

// thread/start echoes approvalPolicy but not the effective web-search mode, and a device's managed Codex
// policy can narrow a requested mode (measured live: allowed_web_search_modes = ["cached"] turned "live" into
// "cached"). That is freshness, not safety, so the driver says so where such a policy exists and reads no further.
const MANAGED_PREFS = "/Library/Managed Preferences/com.openai.codex.plist";
function noteManagedPolicy(mode) {
  if (mode && fs.existsSync(MANAGED_PREFS))
    process.stderr.write(`entrust: this device has a managed Codex policy at ${MANAGED_PREFS}; it may narrow --web-search ${mode} to another mode, and no response field would say which\n`);
}

// Every agent gets a fresh exclusive leaf under its shared project/run context. It outlives the turn:
// answers may cite files there. Child checks stay under that leaf, the agent's only temporary grant.
let runTmp = null, runTmpBases = [], runTmpNamespace = null;
function runTmpDir() {
  const state = canonPath(stateDir());
  const from = reportFilePath === null ? null : canonPath(path.dirname(reportFilePath));
  const rel = state && from ? path.relative(state, from).split(path.sep) : [];
  const conventional = path.basename(reportFilePath ?? "") === "report.json";
  const runPath = conventional && rel[0] === "orchestrate" && rel.length === 4 ? path.dirname(from)
    : conventional && rel[0] === "reports" && rel.length === 2 ? from : null;
  try {
    const made = createAgentTemp({ cwd, reportPath: reportFilePath, runPath });
    runTmp = made.dir;
    runTmpBases = made.bases;
    runTmpNamespace = made.namespace;
    return runTmp;
  } catch (e) {
    fail(EXIT.USAGE, `the run's $TMPDIR could not be created (${e.message})`);
  }
}
// Named in the report, because it is where the agent's own file paths resolve and it is still there when
// the coordinator reads the answer. null only on a report written before setup() made it.
const keptTmpDir = () => runTmp;
// Did the agent actually leave anything of its own?
const tmpHasAgentFiles = () => {
  if (!runTmp) return false;
  try { return fs.readdirSync(runTmp).some((name) => name !== TEMP_OWNER); } catch { return false; }
};
// Record the source of the agent's model and effort so a fresh probe, stale config and account defaults
// remain distinguishable.
let configInherited = null;
const keysInConfig = (cfg) => {
  try { return [...fs.readFileSync(cfg, "utf8").matchAll(/^([A-Za-z0-9_]+)\s*=/gm)].map((m) => m[1]); }
  catch { return []; }
};

// One reader for every JSON file this driver keeps: locks, job records, ledger entries, owner records.
// Absent, unreadable and unparsable are one answer — null — because every caller below treats them
// alike, and a second spelling of this try/catch is a second place the rule can drift.
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
// One writer for every 0600 artefact this driver replaces (job record, ledger entry, harvested diff): a
// random temp name renamed over the target, since an in-place write leaves a window where it is truncated.
// Random, not the pid: two PID namespaces over one mounted state directory share pids.
function renameOver(p, body) {
  const tmp = `${p}.${crypto.randomBytes(8).toString("hex")}.tmp`;
  try {
    fs.writeFileSync(tmp, body, { mode: 0o600 });
    fs.renameSync(tmp, p);
  } finally { fs.rmSync(tmp, { force: true }); }
  return p;
}

// What the shared home's link points at: {target}, {target: null} when absent, {notLink} for a real entry.
// readlink(2) is retried, and a refusal needs lstat to agree, because a peer's rename(2) makes it answer
// EINVAL for a moment (measured: 12 of 30 rounds of 64 concurrent first runs); the re-link is idempotent.
function linkTarget(p) {
  for (let i = 0; i < LIMITS.LINK_READ_ATTEMPTS; i++) {
    try { return { target: fs.readlinkSync(p) }; }
    catch (e) {
      if (e.code === "ENOENT") return { target: null };
      let isLink = false;
      try { isLink = fs.lstatSync(p).isSymbolicLink(); } catch { return { target: null }; }
      if (!isLink) return { target: null, notLink: true, code: e.code };
    }
  }
  // Still churning after every attempt. Not a verdict of "not a symlink": say nothing is there and let
  // the caller's rename settle it.
  return { target: null };
}

async function isolatedHome() {
  // The isolated home moves with the driver's own state; the REAL ~/.codex it borrows credentials and
  // sessions from does not, and must not — a test harness redirecting state has no business inventing
  // an auth.json, and the rollout receipt has to land where the published verification recipe looks.
  const base = passwdHome("the isolated Codex home");
  // One home shared by every run: its warm caches are what make an isolated run fast.
  const home = path.join(stateDir(), "home");
  try { fs.mkdirSync(home, { recursive: true, mode: 0o700 }); }
  catch (e) { fail(EXIT.USAGE, `cannot create the isolated Codex home ${home}: ${e.message}`); }
  for (const name of ["auth.json", "sessions"]) {
    const link = path.join(home, name), target = path.join(base, ".codex", name);
    // Create sessions when absent so the linked rollout remains at ~/.codex/sessions for verification.
    // Skip absent auth.json: the driver must not invent credentials.
    if (name === "sessions" && !fs.existsSync(target)) {
      try { fs.mkdirSync(target, { recursive: true, mode: 0o700 }); } catch { /* fall through to the skip */ }
    }
    if (!fs.existsSync(target)) continue;   // nothing to share yet; codex creates its own
    const current = linkTarget(link);
    // Anything that is not a symlink is a real file someone put there, possibly holding real state.
    // Replacing it silently is how a token or a session archive disappears, so stop and say which.
    if (current.notLink)
      fail(EXIT.USAGE, `${link} exists but is not a symbolic link (${current.code}); move it aside or pass --host-home`);
    if (current.target === target) continue;
    // Created under a random name and RENAMED over the link: rename(2) is atomic, while unlink-then-
    // symlink is a window two fresh agents lose against each other — both read ENOENT, both symlink, and
    // the loser fails EEXIST on a link the winner has just made correctly. An EEXIST that still gets
    // through is only a peer having won, so re-read and accept an equal target.
    const tmpLink = `${link}.${crypto.randomBytes(8).toString("hex")}.tmp`;
    try {
      fs.symlinkSync(target, tmpLink);
      fs.renameSync(tmpLink, link);
    } catch (e) {
      try { fs.unlinkSync(tmpLink); } catch {}
      if (linkTarget(link).target !== target) fail(EXIT.USAGE, `cannot link ${link} -> ${target}: ${e.message}`);
    }
  }
  // Write inherited values into the home so omitting --effort sends no -c override, as the protocol cases pin.
  // Rewrite each run to prevent the server's trusted-project appends from accumulating.
  const cfg = path.join(home, "config.toml");
  let probe = await inheritedConfig();
  // A transient hiccup gets ONE retry before its silence becomes nondeterminism, and only when the wall
  // clock still leaves room for the probe's own budget plus a turn.
  if (probe.failed && !settled
      && (!(opts.timeout > 0) || startedAtMs + opts.timeout * 1000 - Date.now() > 6000)) {
    probe = await inheritedConfig();
  }
  // A run that is already ending writes nothing here. The probe it cancelled has no entries, and the
  // shared config is not this run's to empty on its way out.
  if (settled) { configInherited = { source: "none", keys: [] }; return home; }
  // Keep the last-known-good shared config on probe failure; concurrent healthy runs write the same bytes.
  // A private per-run home has no prior config or peer, so it always writes.
  if (probe.failed && fs.existsSync(cfg)) {
    process.stderr.write(`entrust: keeping the previously inherited config (last known good) at ${cfg}\n`);
    configInherited = { source: "last-known-good", keys: keysInConfig(cfg) };
    return home;
  }
  configInherited = { source: probe.failed ? "none" : "probe", keys: [...probe.entries.map(([k]) => k), ...(probe.table ? ["model_providers"] : [])] };
  // A random name, as renameOver's; "wx" refuses an existing name instead of following a symlink onto another file.
  const tmp = `${cfg}.${crypto.randomBytes(8).toString("hex")}.tmp`;
  try {
    const body = probe.entries.map(([k, v]) => `${k} = ${v}\n`).join("") + (probe.table ?? "");
    fs.writeFileSync(tmp, body, { mode: 0o600, flag: "wx" });
    fs.renameSync(tmp, cfg);    // atomic, so a concurrent agent never reads a half-written file
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch {}
    fail(EXIT.USAGE, `cannot write the isolated config ${cfg}: ${e.message}`);
  }
  return home;
}
const sleepSync = (ms) => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); };

// Classify the lock without trusting its type: O_NOFOLLOW rejects symlinks, O_NONBLOCK avoids FIFO
// hangs, and fstat catches directories before reading. The one symlink accepted is acquireLock's
// pointer to its owner file, which is then read under the same rules.
// Return {gone:true} for a vanished lock (retry), or {held} with null for an unparsable lock (reclaim).
// A pointer adds {owner}, the owner file's path, and {unreadable} when that file's body does not parse:
// an owner file is rewritten in place, so such a body may be one caught mid-write, and it is left alone.
function inspectLock(p, dir, ownerLink = true) {
  let fd;
  try { fd = fs.openSync(p, fs.constants.O_RDONLY | fs.constants.O_NONBLOCK | fs.constants.O_NOFOLLOW); }
  catch (e) {
    if (e.code === "ENOENT") return { gone: true };
    if (e.code === "ELOOP") {
      // Only our versioned, same-directory owner link is a lock. Never follow arbitrary links.
      const { target } = linkTarget(p), prefix = `${path.basename(p)}.`;
      // Gone, or no longer a link, between the open and the readlink: a peer reclaimed it. Retry.
      if (target === null) return { gone: true };
      if (ownerLink && target.startsWith(prefix) && /^[a-f0-9]{32}\.owner$/.test(target.slice(prefix.length))) {
        const owner = path.join(path.dirname(p), target), seen = inspectLock(owner, dir, false);
        if (seen.gone) return { held: null, owner };   // a link naming nothing is stale
        return { held: seen.held, owner, unreadable: !seen.parsed };
      }
      fail(EXIT.USAGE, `cannot lock ${dir}: ${p} is a symbolic link, not a lock file; remove it and retry`);
    }
    fail(EXIT.USAGE, `cannot lock ${dir}: ${p} exists but cannot be read (${e.code}); fix its permissions and retry. Do not remove it: a lock that cannot be read cannot be shown to be stale`);
  }
  try {
    const st = fs.fstatSync(fd);
    if (!st.isFile()) {
      const kind = st.isDirectory() ? "a directory" : st.isFIFO() ? "a named pipe" : st.isSocket() ? "a socket" : "not a regular file";
      fail(EXIT.USAGE, `cannot lock ${dir}: ${p} is ${kind}, not a lock file; remove it and retry`);
    }
    let held = null, parsed = true;
    try { held = JSON.parse(fs.readFileSync(fd, "utf8")); } catch { parsed = false; }
    return { held, parsed };
  } finally { fs.closeSync(fd); }
}

// Lock files outlive reboots and SIGKILLs, so match process start time as well as pid to detect recycling.
function processIdentity(pid) {
  try {
    // Linux: field 22 of /proc/<pid>/stat is starttime, counted from the first field AFTER the comm,
    // which is the only field that may itself contain spaces. A clock-tick count, so it needs no pinning.
    const stat = fs.readFileSync(`/proc/${pid}/stat`, "utf8");
    const after = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
    if (after[19]) return `starttime:${after[19]}`;
  } catch { /* not Linux, or the process is gone */ }
  // Pin TZ and LC_ALL because ps renders lstart through the caller's timezone and locale;
  // the same process must retain the same identity across shells.
  const r = spawnSync("ps", ["-o", "lstart=", "-p", String(pid)],
    { encoding: "utf8", env: { ...process.env, LC_ALL: "C", TZ: "UTC" },
      timeout: LIMITS.SPAWN_TIMEOUT_MS, killSignal: "SIGKILL" });
  const t = r.status === 0 ? String(r.stdout ?? "").trim() : "";
  return t ? `lstart:${t}` : null;
}
// This run's own identity, read once: it costs a `ps` on every platform without /proc, and the startup
// line and the job record both want it.
let ownIdentity;
const selfIdentity = () => (ownIdentity === undefined ? (ownIdentity = processIdentity(process.pid)) : ownIdentity);

// Is the pid in a lock file a process that still exists? EPERM means it exists and belongs to another
// user; only ESRCH proves it is gone. An unparsable lock names no pid and cannot be honoured.
function holderAlive(held) {
  const holder = Number(held?.pid);
  if (!Number.isInteger(holder) || holder <= 0) return false;
  let alive;
  try { process.kill(holder, 0); alive = true; } catch (e) { alive = e.code === "EPERM"; }
  if (!alive) return false;
  // Only when the lock recorded one. An identity we cannot read back — no `ps`, another user's process
  // on a Linux without /proc access — proves nothing, so the EPERM-alive semantics stand and the lock is
  // honoured; a MISMATCH is positive proof that this pid belongs to someone else.
  if (typeof held?.identity === "string") {
    const now = processIdentity(holder);
    if (now !== null && now !== held.identity) return false;
  }
  return true;
}

// The other half of "is this run still there": a SIGKILLed driver's codex group can still be writing the
// tree. Signal 0 to the negative pid asks whether any member lives; EPERM means one does, not ours.
function holderGroupAlive(held) {
  const pgid = Number(held?.appServerPgid);
  if (!Number.isInteger(pgid) || pgid <= 0) return false;
  try { process.kill(-pgid, 0); return true; } catch (e) { return e.code === "EPERM"; }
}
// One rule for the lock and for the worktree ledger: an owner is abandoned only when its driver AND its
// app-server group are both gone.
const reclaimable = (held) => !holderAlive(held) && !holderGroupAlive(held);

// The reclaim marker, <lock>.reclaim: whoever holds it may remove the lock's link or its owner file, and
// nobody else may. A marker is abandoned when the process it names is gone, or when it is older than
// RECLAIM_BACKSTOP_MS, the hour after which even a live owner's marker can be taken over, the one window two
// conforming runs can meet in. cleanup.mjs imports this predicate, the functions below and the constant.
const RECLAIM_BACKSTOP_MS = LIMITS.RECLAIM_BACKSTOP_MS;
const reclaimMarkerAbandoned = (pid, mtimeMs) => !holderAlive({ pid }) || Date.now() - mtimeMs > RECLAIM_BACKSTOP_MS;
// The file at a marker path, read without following a link: dev:ino and the pid in it, or null.
function markerAt(file) {
  let fd;
  try { fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NONBLOCK | fs.constants.O_NOFOLLOW); }
  catch { return null; }
  try {
    const st = fs.fstatSync(fd, { bigint: true });
    return { dev: st.dev, ino: st.ino, mtimeMs: Number(st.mtimeMs), body: fs.readFileSync(fd, "utf8").trim() };
  } catch { return null; } finally { fs.closeSync(fd); }
}
// dev:ino of each marker this process created, by lock path, for holdsReclaimMarker and dropReclaimMarker.
const heldMarkers = new Map();
// True when this process now holds the marker; false when a peer does. Throws when the marker cannot be
// written at all.
//
// An abandoned marker is renamed to a name of this run's own, then a new one created exclusively; removal
// by path let two takers both remove it and both hold it. A rename moves one file once: a second taker gets
// ENOENT, or a marker it did not judge (told by dev:ino and body), which it links back.
function takeReclaimMarker(p) {
  const rp = `${p}.reclaim`;
  // Random, not the pid, as renameOver's; the moved marker takes the same shape.
  const tmp = `${p}.${crypto.randomBytes(8).toString("hex")}.rtmp`;
  const moved = `${p}.${crypto.randomBytes(8).toString("hex")}.rtmp`;
  try {
    fs.writeFileSync(tmp, String(process.pid));
    const st = fs.lstatSync(tmp, { bigint: true }), mine = { dev: st.dev, ino: st.ino };
    const create = () => {
      try { fs.linkSync(tmp, rp); heldMarkers.set(p, mine); return true; }
      catch (e) { if (e.code !== "EEXIST") throw e; return false; }
    };
    if (create()) return true;
    const seen = markerAt(rp);
    if (!seen || !reclaimMarkerAbandoned(Number(seen.body), seen.mtimeMs)) return false;
    try { fs.renameSync(rp, moved); } catch { return false; }
    const got = markerAt(moved);
    if (!got || got.dev !== seen.dev || got.ino !== seen.ino || got.body !== seen.body) {
      try { fs.linkSync(moved, rp); } catch {}
      return false;
    }
    return create();
  } finally {
    fs.rmSync(tmp, { force: true });
    fs.rmSync(moved, { force: true });
  }
}
// Is the marker at <p>.reclaim still the one this process created? Asked immediately before each act
// under it, because a taker that moved it and could not put it back has removed it.
function holdsReclaimMarker(p) {
  const mine = heldMarkers.get(p), now = markerAt(`${p}.reclaim`);
  return !!mine && !!now && now.dev === mine.dev && now.ino === mine.ino;
}
// Only OUR marker: renamed aside first and removed only if the moved file is this process's (pid and
// dev:ino); anything else is linked back, since removing a peer's marker reopens the multi-holder window.
function dropReclaimMarker(p) {
  const rp = `${p}.reclaim`, mine = heldMarkers.get(p);
  heldMarkers.delete(p);
  const moved = `${p}.${crypto.randomBytes(8).toString("hex")}.rtmp`;
  try { fs.renameSync(rp, moved); } catch { return false; }
  try {
    const got = markerAt(moved);
    if (got && got.body === String(process.pid) && (!mine || (got.dev === mine.dev && got.ino === mine.ino))) return true;
    try { fs.linkSync(moved, rp); } catch {}
    return false;
  } finally { fs.rmSync(moved, { force: true }); }
}

// Remove a still-stale lock under the reclaim marker; another marker owner means retry acquisition.
function reclaimStale(p, dir) {
  let held;
  try { held = takeReclaimMarker(p); }
  catch (e) { fail(EXIT.USAGE, `cannot reclaim the stale lock ${p}: ${e.message}`); }
  if (!held) return false;
  let ours = true;
  try {
    // Ask again, under the reclaim lock. The lock may have been reclaimed by someone else and retaken by
    // a live process since we last looked; deleting it then is exactly the bug this exists to prevent.
    const now = inspectLock(p, dir);
    if (!now.gone && !now.unreadable && reclaimable(now.held) && (ours = holdsReclaimMarker(p))) {
      // unlink also removes a dangling owner link; rm(force) can leave it in place on Node/macOS.
      try { fs.unlinkSync(p); } catch (e) { if (e.code !== "ENOENT") throw e; }
      if (now.owner) fs.rmSync(now.owner, { force: true });
    }
  } finally { if (ours) dropReclaimMarker(p); else heldMarkers.delete(p); }
  return ours;
}

// Hash the directory's dev:ino identity so case variants and symlinks share a lock.
// Accept the caller's stat to avoid another lookup; export the key so tests use the same rule.
const lockKey = (st) => `${crypto.createHash("sha256").update(`${st.dev}:${st.ino}`).digest("hex")}.lock`;

// The lock this run holds: the shared link, the owner file it names, a descriptor kept open on that file
// and the file's dev:ino at publication. The open descriptor pins the inode number, so no later file can
// be given it while this run lives, and the update writes through it rather than by path.
let lockPath = null, lockOwnerPath = null, lockOwnerFd = null, lockOwnerId = null, lockBody = null;
function acquireLock(dir) {
  let st;
  try { st = fs.statSync(dir); }
  catch (e) { fail(EXIT.USAGE, `cannot stat --cwd ${dir}: ${e.message}`); }
  const LOCK_DIR = lockDir();
  // The name is a hash, so the body has to record which directory it locks.
  const p = path.join(LOCK_DIR, lockKey(st));
  try { fs.mkdirSync(LOCK_DIR, { recursive: true, mode: 0o700 }); }
  catch (e) { fail(EXIT.USAGE, `cannot create the lock directory ${LOCK_DIR}: ${e.message}`); }
  // The file name is a hash, so the contents have to say what it locks — for the message below and for a
  // human who finds a stale one.
  // Record the cached start-time identity so a recycled pid can still be reclaimed.
  const body = { pid: process.pid, identity: selfIdentity(), cwd: dir, started: new Date().toISOString() };
  // Publish a fully written owner file with an exclusive symlink; retain its unique name for release.
  const tmp = `${p}.${crypto.randomBytes(16).toString("hex")}.owner`;
  let unreadable = null;
  for (let attempt = 0; attempt < LIMITS.LOCK_ATTEMPTS; attempt++) {
    let linked = false, fd = null, id = null;
    try {
      fd = fs.openSync(tmp, "wx", 0o600);
      fs.writeFileSync(fd, JSON.stringify(body));
      const st = fs.fstatSync(fd, { bigint: true });
      id = { dev: st.dev, ino: st.ino };
      fs.symlinkSync(path.basename(tmp), p);
      linked = true;
    } catch (e) {
      if (e.code !== "EEXIST") fail(EXIT.USAGE, `cannot lock ${dir} (${p}): ${e.message}`);
    } finally {
      if (!linked && fd !== null) { try { fs.closeSync(fd); } catch {} fs.rmSync(tmp, { force: true }); }
    }
    if (linked) {
      lockPath = p; lockOwnerPath = tmp; lockOwnerFd = fd; lockOwnerId = id; lockBody = body;
      return;
    }
    {
      const seen = inspectLock(p, dir);
      // A lock that vanished between create and read was released by a peer; retry acquisition.
      if (seen.gone) { sleepSync(LIMITS.LOCK_RETRY_MS); continue; }
      // Asked again rather than reclaimed; if it never parses, the run is refused below.
      unreadable = seen.unreadable ? seen.owner : null;
      if (unreadable) { sleepSync(LIMITS.LOCK_RETRY_MS); continue; }
      // An unparsable lock names no live pid, so it cannot be honoured. Since creation is atomic this is
      // no longer a half-written file from a peer — it is a hand-made or corrupted one — but treating it
      // as held would wedge the directory forever, so it is reclaimed like any other stale lock.
      const held = seen.held;
      const holder = Number(held?.pid);
      if (holderAlive(held)) fail(EXIT.BUSY,
        `${dir} is in use by entrust pid ${holder} (started ${held?.started ?? "unknown"}); ` +
        `give each concurrent run its own cwd, or wait for that run to finish. Its lock is ${p}; leave it there, a lock whose holder is gone is reclaimed on the next attempt without your help`);
      // The driver is gone but its codex group is not: the tree is still being written, so this is a
      // busy directory rather than a stale lock, and it is named as the orphan it is.
      if (holderGroupAlive(held)) fail(EXIT.BUSY,
        `${dir} is still being written by the codex process group ${held?.appServerPgid} of entrust pid ${holder}, ` +
        `which is itself gone; wait for it, or stop it with kill -TERM -${held?.appServerPgid}; the lock is then reclaimed on the next attempt without your help`);
      // Reclaiming a stale lock is where mutual exclusion actually breaks, and neither an unlink nor a
      // rename closes it: both act on the PATH, not on the file that was inspected, so a peer that judged
      // the STALE lock dead removes the FRESH one that has since replaced it and takes the directory.
      // The reclaim is therefore serialised by its own short-lived lock and the liveness question is
      // asked again UNDER it, so what is deleted is only what has just been re-confirmed dead.
      //
      // (Counting how many runs exited 0 does not measure this and will mislead you: runs that acquire in
      // sequence all succeed, correctly. Only overlapping hold intervals are evidence.)
      if (!reclaimStale(p, dir)) { sleepSync(LIMITS.LOCK_RETRY_MS); continue; }
    }
  }
  if (unreadable) fail(EXIT.BUSY,
    `${dir} is locked by ${p}, whose owner file ${unreadable} does not hold a body that can be read, so whether its run is alive cannot be established; ` +
    `leave both files while any entrust run may be using ${dir}. If none is, remove ${p} and ${unreadable} and retry`);
  fail(EXIT.BUSY, `${dir} is contended: the lock at ${p} changed hands ${LIMITS.LOCK_ATTEMPTS} times without settling`);
}
// A test seam: pause between an ownership check and the act it guards, touching <lock>.seam meanwhile, so
// a suite can put a peer in a window a real one reaches only by timing. Unset, nothing happens.
function lockSeam(p) {
  const ms = Number(process.env.ENTRUST_LOCK_SEAM_MS);
  if (!(ms > 0)) return;
  const mark = `${p}.seam`;
  try { fs.writeFileSync(mark, String(process.pid)); } catch {}
  sleepSync(ms);
  try { fs.rmSync(mark, { force: true }); } catch {}
}
// Is the file at the owner path still the one this run created? Its name can be read through the link,
// so a process can put another file there; dev:ino, taken from the descriptor at publication, tells them
// apart. Opened without following a link and without blocking, as inspectLock opens a lock.
function ownerFileIsOurs() {
  let fd;
  try { fd = fs.openSync(lockOwnerPath, fs.constants.O_RDONLY | fs.constants.O_NONBLOCK | fs.constants.O_NOFOLLOW); }
  catch { return false; }
  try {
    const st = fs.fstatSync(fd, { bigint: true });
    return st.dev === lockOwnerId.dev && st.ino === lockOwnerId.ino;
  } finally { fs.closeSync(fd); }
}
const notOurs = (what) => process.stderr.write(
  `entrust: the lock's owner file ${lockOwnerPath} is no longer the file this run created, so ${what}\n`);
// Adds what acquisition could not know, the app-server's process group, through the descriptor: a reader
// sees the old body, the new one, or one that does not parse, which inspectLock leaves alone. Never fatal.
function updateLock(fields) {
  if (lockOwnerFd === null) return;
  try {
    lockSeam(lockPath);
    if (!ownerFileIsOurs()) return notOurs("it was left as it is and the app-server group is not recorded in it");
    lockBody = { ...lockBody, ...fields };
    const buf = Buffer.from(JSON.stringify(lockBody));
    fs.writeSync(lockOwnerFd, buf, 0, buf.length, 0);
    fs.ftruncateSync(lockOwnerFd, buf.length);
    fs.fsyncSync(lockOwnerFd);
  } catch {}
}
// Under the reclaim marker no run that follows these rules can remove the link or make a new one, so the
// check that the link and the owner file are still this run's and the unlinks that follow cannot be split
// by one. The link goes first, then the owner file. A marker held by a live peer leaves the link, naming
// nothing, for the next run on this directory to reclaim; the owner file, checked the same way, still goes.
// A process that ignores the marker can still land between the check and an unlink: POSIX has no unlink
// that names an inode.
function releaseLock() {
  if (lockOwnerFd === null) return;
  try {
    lockSeam(lockPath);
    let held = false;
    // Twice: the first attempt may only have removed a marker whose owner is gone. A marker that cannot
    // be written at all counts as busy.
    for (let attempt = 0; attempt < 2 && !held; attempt++) {
      try { held = takeReclaimMarker(lockPath); } catch { break; }
    }
    let mine = held;
    try {
      if (!ownerFileIsOurs()) notOurs("it and the lock's link were left where they are");
      else {
        mine = held && holdsReclaimMarker(lockPath);
        if (mine && linkTarget(lockPath).target === path.basename(lockOwnerPath)) try { fs.unlinkSync(lockPath); } catch {}
        fs.unlinkSync(lockOwnerPath);
        if (!mine) process.stderr.write(`entrust: ${lockPath}.reclaim is held by another process, so the lock's link was left for the next run on this directory to reclaim\n`);
      }
    } finally { if (mine) dropReclaimMarker(lockPath); else heldMarkers.delete(lockPath); }
  } catch {}
  try { fs.closeSync(lockOwnerFd); } catch {}
  lockPath = lockOwnerPath = lockOwnerFd = lockOwnerId = lockBody = null;
}

// ---------------------------------------------------------------- git
// Every git here runs with the caller's rights over a tree an agent may have written, whose config, hooks and
// external diff drivers are code. A command-line -c outranks every config file, so the three are disarmed in
// one place, and every spawn is bounded (SPAWN_TIMEOUT_MS).
const GIT_SAFE = ["-c", "core.fsmonitor=false", "-c", "core.hooksPath=/dev/null", "-c", "diff.external="];
// --no-ext-diff and --no-textconv on every diff: `diff.external` is only one of the two ways a repository
// asks git to run a program, the other being a gitattributes driver, and textconv output is not appliable.
const GIT_DIFF_SAFE = ["--no-ext-diff", "--no-textconv"];
function git(dir, args, extra = {}) {
  return spawnSync("git", [...GIT_SAFE, "-C", dir, ...args],
    { encoding: "utf8", timeout: LIMITS.SPAWN_TIMEOUT_MS, killSignal: "SIGKILL", ...extra });
}
// The head of what git said about a command that did not work, for a report a human reads: one line,
// bounded, and never empty — a git the bound above killed, or one that never started, has no stderr at
// all and only its signal or its code to give.
const gitSaid = (r) => (String(r.stderr ?? "").trim().split("\n")[0] || r.error?.message
  || (r.status === null ? `killed by ${r.signal}` : `exit ${r.status}`)).slice(0, 160);

// ---------------------------------------------------------------- worktree
// A uniquely named detached worktree, its completed turn's work harvested before removal; incomplete turns
// and failed harvests preserve the tree, and the ledger names it before it exists.
let worktreeInfo = null;
// What the pre-turn report says about a tree disposed of before a turn existed (disposeWorktree() reports
// its own after one).
let worktreeDisposition = null;
const answersDir = () => path.join(stateDir(), "answers");

// One record per run, keyed by threadId, in jobs/: what --resume last and a worktree rebuild read.
// Best-effort, as the answer log is, and pruned with the same bounds.
const jobsDir = () => path.join(stateDir(), "jobs");
// Everything a record may carry: how to find this thread again, and how to rebuild the tree it ran in.
// Applied on every write, so a record left by a release that kept a transport or a poller's snapshot in
// it loses those keys the first time this driver rewrites it, while remaining readable until then.
const JOB_FIELDS = new Set(["threadId", "pid", "identity", "cwd", "started", "repo", "baseSha",
                            "endedAt", "exitCode", "turnStatus", "answerPath",
                            "worktreeDiffPath", "worktreeUntrackedPath", "worktreeCommitsRef"]);
function writeJob(fields) {
  if (!rootThreadId) return;
  try {
    const dir = jobsDir();
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    const p = path.join(dir, `${rootThreadId}.json`);
    const prev = readJson(p) ?? {};
    // Whole or not at all, or a concurrent `--resume last` that fails to parse this discards it and
    // continues an OLDER thread.
    renameOver(p, JSON.stringify(Object.fromEntries(
      Object.entries({ ...prev, ...fields }).filter(([k]) => JOB_FIELDS.has(k)))));
    pruneDir(dir);
  } catch {}
}
// Does a job record belong to the directory being asked about? Matched by IDENTITY, and by the agent's
// surviving repository as well as its cwd, which a removed worktree no longer has. Empty fields never
// match: path.resolve("") would otherwise substitute the driver's own cwd.
const recordIsIn = (rec, forCwd) =>
  [rec?.cwd, rec?.repo].some((v) => typeof v === "string" && v !== "" && canonPath(v) === forCwd);

// `--resume last`: the record for this cwd STARTED most recently, ended or not (a running one refuses with
// 10). By `started`, not mtime, which a long agent's heartbeat keeps fresh; by cwd, since the registry is
// machine-wide and another repository's newest thread would answer the wrong conversation.
function resolveResumeLast(forCwd, what = "--resume last") {
  let names = [];
  try { names = fs.readdirSync(jobsDir()).filter((n) => n.endsWith(".json")); } catch {}
  const here = names.map((n) => {
    const rec = readJson(path.join(jobsDir(), n));
    if (!rec || !recordIsIn(rec, forCwd)) return null;
    // A record with no usable `started` never outranks one that has it, and the name breaks a tie so
    // two records written in the same millisecond resolve the same way on every run.
    const t = Date.parse(rec.started ?? "");
    return { n, t: Number.isFinite(t) ? t : 0 };
  }).filter(Boolean).sort((a, b) => (b.t - a.t) || (a.n < b.n ? 1 : -1))[0];
  if (!here) fail(EXIT.USAGE, `${what}: no previous run in ${forCwd} is recorded in the job registry`);
  const id = here.n.replace(/\.json$/, "");
  process.stderr.write(`entrust: ${what} -> ${id}\n`);
  return id;
}

// Canonicalised: under a symlinked state dir the raw path and the resolved one are two spellings of one
// file, and a caller comparing them would see two different runs.
const jobRecordPath = (id) => path.join(canonPath(jobsDir()) ?? jobsDir(), `${id}.json`);

// A thread whose driver is still alive cannot be continued: the server refuses the resume after the
// spawn (exit 10), and the local record knows it before a worktree is cut or a token is spent.
function refuseLiveResume(id) {
  const rec = readJson(jobRecordPath(id));
  if (!rec || rec.endedAt || !holderAlive(rec)) return;
  fail(EXIT.BUSY, `thread ${id} is still running (pid ${rec.pid}); wait for that agent to finish, or stop it with SIGTERM to that pid`);
}

const ledgerDir = () => path.join(stateDir(), "worktrees");
// The ledger entry, written BEFORE git worktree add so an interrupted checkout is named. Null when it could
// not be written, and createWorktree then refuses: an unnamed tree may hold the agent's only copy of its work.
function writeLedger(name, fields) {
  try {
    const dir = ledgerDir();
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    return renameOver(path.join(dir, `${name}.json`), JSON.stringify(fields));
  } catch { return null; }
}
// Merges into an existing entry, for a field that only exists later in the run: the app-server's
// process group. Best-effort — the tree is named by then — and an entry that is gone or unparsable is
// left alone rather than replaced by a body that has lost every field this call is not writing.
function updateLedger(name, fields) {
  try {
    const p = path.join(ledgerDir(), `${name}.json`);
    const cur = readJson(p);
    if (cur !== null) renameOver(p, JSON.stringify({ ...cur, ...fields }));
  } catch {}
}

// Nothing else names this commit, so removing the tree that holds it loses it. An answer git could not
// give counts as unreachable: a redundant ref costs a ref, a missing one costs the agent's history.
function reachableFromAnyRef(repo, sha) {
  const r = git(repo, ["for-each-ref", "--contains", sha, "--count=1", "--format=%(refname)"]);
  return r.status === 0 && r.stdout.trim() !== "";
}

// The record of the agent a `--worktree REPO --resume ID` continues. A record that cannot say where the
// tree started is a refusal rather than a silent fresh tree at HEAD: an agent handed a tree that is not
// the one its thread worked in reviews the wrong files and exits 0.
function priorWorktreeJob(id, repo) {
  const rec = readJson(path.join(jobsDir(), `${id}.json`));
  if (!rec?.baseSha)
    fail(EXIT.USAGE, `--worktree with --resume ${id}: the job registry holds ${rec ? "no base commit for that thread" : "no record of that thread"}, ` +
      `so the tree it ran in cannot be rebuilt; resume it with --level write --cwd on a tree you restore yourself`);
  if (rec.repo && canonPath(rec.repo) !== repo)
    fail(EXIT.USAGE, `--worktree ${repo} with --resume ${id}: that thread ran in ${rec.repo}; resume it there`);
  return { ...rec, threadId: id };
}

// Reconcile abandoned worktrees on the next --worktree invocation: drop absent trees, remove clean trees,
// and keep dirty trees with their ledger entries and a warning; reconciliation is best-effort.
function reconcileWorktreeLedgers() {
  try {
    const dir = ledgerDir();
    // Sorted before the bound, or the filesystem's own order decides who is ever looked at: a directory
    // that hands back the same 50 names every time starves every entry after them. The names open with a
    // base36 timestamp, so ascending is oldest first.
    for (const n of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort().slice(0, 50)) {
      const p = path.join(dir, n);
      const e = readJson(p);
      // An entry that cannot be read is the one entry whose tree has no other name; deleting it deletes
      // the only pointer to a checkout that may hold work. Renamed aside, out loud: the next run stops
      // re-reading it and the bytes are still there for whoever looks.
      if (e === null) {
        try { fs.renameSync(p, `${p}.bad`); } catch { continue; }
        process.stderr.write(`entrust: the worktree ledger entry ${p} could not be parsed; it is kept at ${p}.bad ` +
          `and no tree was touched — list the trees with: git -C <repo> worktree list\n`);
        continue;
      }
      // Same rule as the lock: a dead driver whose codex group is still alive has not abandoned its tree.
      if (!reclaimable(e)) continue;
      if (!e.path || !fs.existsSync(e.path)) { fs.rmSync(p, { force: true }); continue; }
      const repo = e.repo ?? e.path;
      const how = e.state === "preserved" ? "an earlier run preserved" : "a crashed run left";
      const st = git(e.path, ["status", "--porcelain"]);
      if (st.status !== 0 || st.stdout.trim() !== "") {
        process.stderr.write(`entrust: ${how} work at ${e.path}; harvest it, then: git -C ${repo} worktree remove --force ${e.path}\n`);
        continue;
      }
      // Preserve a crashed agent's commits before removing even a spotless detached tree.
      // Compare HEAD with its recorded base, or check reachability when that field is absent; install the ref first.
      const head = git(e.path, ["rev-parse", "HEAD"]);
      const headSha = head.status === 0 ? head.stdout.trim() : null;
      // An unreadable HEAD is not "no commits": removal would strand whatever it named.
      if (!headSha) {
        process.stderr.write(`entrust: HEAD of the crashed tree ${e.path} could not be read, so it is left in place; ` +
          `harvest it, then: git -C ${repo} worktree remove --force ${e.path}\n`);
        continue;
      }
      const committed = Boolean(headSha) && (e.baseSha ? headSha !== e.baseSha : !reachableFromAnyRef(repo, headSha));
      let kept = null;
      if (committed) {
        kept = `refs/entrust/${n.replace(/\.json$/, "")}`;
        if (git(repo, ["update-ref", kept, headSha]).status !== 0) {
          process.stderr.write(`entrust: a crashed run's commits at ${e.path} could not be given a ref, so the tree is left in place; ` +
            `harvest it, then: git -C ${repo} worktree remove --force ${e.path}\n`);
          continue;
        }
      }
      if (git(repo, ["worktree", "remove", e.path]).status === 0) {
        fs.rmSync(p, { force: true });
        process.stderr.write(`entrust: removed a crashed run's clean worktree ${e.path}` +
          `${kept ? ` (its commits are kept at ${kept})` : ""}\n`);
      } else {
        process.stderr.write(`entrust: ${how} work at ${e.path}; harvest it, then: git -C ${repo} worktree remove --force ${e.path}\n`);
      }
    }
  } catch {}
}

function createWorktree(repo, prior = null) {
  // Guard the repository before git worktree add can mutate a protected root.
  checkRoot(repo);
  reconcileWorktreeLedgers();
  const chk = git(repo, ["rev-parse", "--is-inside-work-tree"]);
  if (chk.status !== 0 || chk.stdout.trim() !== "true") fail(EXIT.USAGE, `--worktree needs a git work tree at ${repo}`);
  const name = `codex-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
  const dir = path.join(repo, ".claude", "worktrees", name);
  // checkRoot(repo) guards the source; also guard the destination before creation, since .claude may be a symlink.
  // Resolve its nearest existing ancestor because realpath cannot resolve a leaf that does not exist yet.
  const parent = path.dirname(dir);
  let anchor = parent;
  while (!fs.existsSync(anchor) && path.dirname(anchor) !== anchor) anchor = path.dirname(anchor);
  const anchorReal = canonPath(anchor);
  if (anchorReal) checkRoot(anchorReal);
  try { fs.mkdirSync(parent, { recursive: true }); }
  catch (e) { fail(EXIT.USAGE, `cannot create ${parent}: ${e.message}`); }
  // And again on what was actually created, so a link swapped in during the mkdir is still caught
  // before git writes a single object.
  const created = canonPath(parent);
  if (created === null) fail(EXIT.TRANSPORT, `cannot resolve ${parent} after creating it`);
  checkRoot(created);
  const owner = { pid: process.pid, identity: processIdentity(process.pid), started: new Date().toISOString() };
  // Write the ledger before the add so every interrupted checkout is named; reconciliation drops entries
  // whose trees were never created. An entry that cannot be written stops the run HERE, before git
  // creates anything, for the reason writeLedger states.
  let ledger = writeLedger(name, { path: dir, repo, ...owner, state: "creating" });
  if (ledger === null)
    fail(EXIT.USAGE, `the worktree ledger under ${ledgerDir()} could not be written, so a tree created now could not be named ` +
      `after a crash and would be orphaned; fix that directory, or run with --level write --cwd on a tree you manage yourself`);
  // Assigned BEFORE the add rather than after it: `git worktree add` can fail with the destination
  // already created, and a run that ends there must still be able to NAME the tree — the report is the
  // only surface a coordinator reads, and a directory nothing names is one nobody goes looking for. The
  // assignment is undone below on a failure that created nothing, so no report names a path that is not
  // there. baseSha is filled in once the tree exists; nothing reads it before that.
  worktreeInfo = { repo, dir, ledger, baseSha: null, name, restored: null, disposed: false };
  // --resume rebuilds the tree its thread ran in, so it starts where that tree started, not at today's
  // HEAD; a fresh agent starts at HEAD.
  const at = prior?.baseSha ? [prior.baseSha] : [];
  const add = git(repo, ["worktree", "add", "--detach", dir, ...at]);
  if (add.status !== 0) {
    // Only when nothing was created: an add that died mid-checkout leaves the tree this entry exists to
    // name, and the disposition rule below is what decides what happens to it.
    if (!fs.existsSync(dir)) {
      if (ledger) { try { fs.rmSync(ledger, { force: true }); } catch {} }
      worktreeInfo = null;
    }
    fail(EXIT.USAGE, `git worktree add failed: ${String(add.stderr).trim().slice(0, 200)}`);
  }
  // The commit the tree started at. The harvest diffs against THIS, not against HEAD: an agent that
  // committed moves HEAD, and `git diff HEAD` then reports nothing while the work sits in commits that
  // a detached worktree's removal makes unreachable. Recorded at creation because afterwards there is
  // no way to ask what the base was.
  const base = git(dir, ["rev-parse", "HEAD"]);
  const baseSha = base.status === 0 ? base.stdout.trim() : null;
  worktreeInfo.baseSha = baseSha;
  // worktreeInfo exists already, so the refusal below still disposes of the tree it is refusing over.
  // Without a base every later question about this tree is unanswerable: the harvest cannot diff against it, and
  // "did the agent commit?" reads as no — so the agent's own commits would be dropped silently. Refused
  // here, before a single token is spent.
  if (!baseSha)
    fail(EXIT.USAGE, `cannot read HEAD in the new worktree ${dir} (${String(base.stderr).trim().slice(0, 160) || "git rev-parse failed"}); ` +
      `without the base commit the agent's work cannot be harvested, so the turn is not started`);
  ledger = writeLedger(name, { path: dir, repo, ...owner, baseSha }) ?? ledger;
  worktreeInfo.ledger = ledger;
  process.stderr.write(`entrust: created worktree ${dir}${prior?.baseSha ? ` at ${baseSha} (rebuilding the tree of thread ${prior.threadId ?? "?"})` : ""}\n`);
  if (prior) worktreeInfo.restored = restorePriorWork(dir, prior);
  return dir;
}

// A --worktree continuation rebuilds its thread's tree: the base commit, then the saved patch and untracked
// archive (content, not history: the patch already carries the commits, kept at worktreeCommitsRef). Every
// failure is fatal: an agent on the wrong tree reports on the wrong files and exits 0.
function restorePriorWork(dir, prior) {
  const restored = { diff: null, untracked: null, commitsRef: prior.worktreeCommitsRef ?? null };
  // Every refusal below leaves a tree that reproduces nothing the answer log does not still hold, and
  // keeping it would have every later reconciler announce it as work someone must harvest.
  const abandon = () => {
    const rm = git(worktreeInfo.repo, ["worktree", "remove", "--force", dir]);
    // The ledger goes only with the tree: a removal git refused leaves a directory on disk, and dropping
    // its entry would leave the one thing that still names it to the report alone.
    if (rm.status === 0 && worktreeInfo.ledger) { try { fs.rmSync(worktreeInfo.ledger, { force: true }); } catch {} }
    worktreeInfo.disposed = true;
    // Recorded here because the flag above has just disabled worktreeLastResort: every refusal below is a
    // pre-turn one, and its report is where a caller learns that the tree it was promised is gone.
    worktreeDisposition = { worktreePath: dir,
      worktreePreserved: rm.status === 0 ? null
        : `--resume could not rebuild this tree and git worktree remove refused: ${String(rm.stderr).trim().slice(0, 160)}` };
  };
  const gone = (what, p) => (abandon(), fail(EXIT.USAGE, `--resume: the ${what} of that thread is no longer at ${p} ` +
    `(the answer log is pruned after ${LIMITS.PRUNE_DAYS} days), so its tree cannot be rebuilt; resume it with --level write --cwd on a tree you restore yourself`));
  if (prior.worktreeDiffPath) {
    if (!fs.existsSync(prior.worktreeDiffPath)) gone("harvested diff", prior.worktreeDiffPath);
    const ap = git(dir, ["apply", "--binary", prior.worktreeDiffPath]);
    if (ap.status !== 0) {
      abandon();
      fail(EXIT.USAGE, `--resume: the harvested diff ${prior.worktreeDiffPath} does not apply to ${prior.baseSha} ` +
        `(${String(ap.stderr).trim().slice(0, 160)}); the tree cannot be rebuilt`);
    }
    restored.diff = prior.worktreeDiffPath;
  }
  if (prior.worktreeUntrackedPath) {
    if (!fs.existsSync(prior.worktreeUntrackedPath)) gone("untracked archive", prior.worktreeUntrackedPath);
    const tar = spawnSync("tar", ["-xzf", prior.worktreeUntrackedPath, "-C", dir],
      { encoding: "utf8", timeout: LIMITS.SPAWN_TIMEOUT_MS, killSignal: "SIGKILL" });
    if (tar.status !== 0) {
      abandon();
      fail(EXIT.USAGE, `--resume: the untracked archive ${prior.worktreeUntrackedPath} could not be unpacked ` +
        `(${String(tar.stderr).trim().slice(0, 160)}); the tree cannot be rebuilt`);
    }
    restored.untracked = prior.worktreeUntrackedPath;
  }
  process.stderr.write(`entrust: restored the thread's work into ${dir}` +
    `${restored.diff ? " (tracked diff" : " (nothing to apply"}${restored.untracked ? " + untracked archive)" : ")"}` +
    `${restored.commitsRef ? `; its earlier commits remain at ${restored.commitsRef}` : ""}\n`);
  return restored;
}

// After the turn: a completed turn's work is harvested (the --binary diff against the base and an archive of
// the untracked files), and only then is the tree removed, --force included. A turn that did not complete, a
// failing git or a failed harvest preserves the tree, out loud.
function disposeWorktree(turnDone) {
  if (!worktreeInfo || worktreeInfo.disposed) return null;
  worktreeInfo.disposed = true;
  const { repo, dir, ledger, baseSha, name, restored } = worktreeInfo;
  const res = { worktreePath: dir, worktreeRepo: repo, worktreeBase: baseSha, worktreeRestored: restored,
                worktreeRemoved: false, worktreePreserved: null, worktreeHarvested: false,
                worktreeDiffPath: null, worktreeUntrackedPath: null,
                worktreeIgnoredDropped: null, worktreeCommitsRef: null };
  const st = git(dir, ["status", "--porcelain"]);
  const clean = st.status === 0 && st.stdout.trim() === "";
  // Harvest when the tree is dirty OR HEAD moved: a spotless agent that committed still has commits to preserve.
  const headNow = git(dir, ["rev-parse", "HEAD"]);
  const headSha = headNow.status === 0 ? headNow.stdout.trim() : null;
  const committed = Boolean(baseSha && headSha && headSha !== baseSha);
  // `base` is the THREAD's name, so a --resume re-harvest writes over the artefacts the previous turn
  // left. Two consequences, both handled here: the write must be whole-or-nothing, and a turn that
  // takes NOTHING from the tree must not leave the previous turn's file behind — the record's pointer
  // goes null while the file stays, and the next reader opens work this turn reverted. That covers the
  // clean branch below as well as an empty harvest: a resumed agent that reverted everything ends on a
  // tree git calls clean, and the earlier artefacts are exactly what it undid.
  // Except the file the SERVER's turn/diff/updated landed in: persistTurnDiff names it
  // `<threadId>.diff` too, so on a run that received one, `${base}.diff` is this turn's own artefact
  // with the report pointing at it, not the previous turn's leftover.
  const base = path.join(answersDir(), `${rootThreadId ?? `no-thread-${process.pid}`}`);
  const dropStale = (art) => {
    if (art === turnDiffPath || !fs.existsSync(art)) return;
    try { fs.rmSync(art, { force: true }); }
    catch (e) { return process.stderr.write(`entrust: this turn harvested nothing and the earlier ${art} ` +
      `could not be removed (${e.message}); it is stale — do not read it as this turn's work\n`); }
    process.stderr.write(`entrust: this turn harvested nothing, so the earlier ${art} was removed\n`);
  };
  if (!turnDone) res.worktreePreserved = `turn ${turnStatus ?? "never started"} — the tree may be mid-write`;
  else if (st.status !== 0) res.worktreePreserved = "git status failed in the worktree";
  else if (!clean || committed) {
    // Diffed against the commit the tree STARTED at, not against HEAD. Dirtiness is decided by
    // `status --porcelain`, which sees staged changes, so the harvest must see them too — and an agent
    // that committed moves HEAD, where `git diff HEAD` reports nothing at all while the work sits in
    // commits that removing a detached worktree makes unreachable. Against the base, one patch carries
    // committed, staged and unstaged work alike. HEAD and the bare form remain as fallbacks.
    const diffVs = (extra) => {
      for (const against of [...(baseSha ? [[baseSha]] : []), ["HEAD"], []]) {
        const r = git(dir, ["diff", ...GIT_DIFF_SAFE, ...against, ...extra], { maxBuffer: 64 * 1024 * 1024 });
        if (r.status === 0) return r;
      }
      return { status: 1, stdout: "", stderr: "every diff form failed" };
    };
    // Return null on success, or a reason to preserve the tree when the harvest cannot be trusted.
    const harvest = () => {
      fs.mkdirSync(answersDir(), { recursive: true, mode: 0o700 });
      const full = diffVs(["--binary"]);
      if (full.status !== 0) return `the diff could not be taken (${String(full.stderr).trim().slice(0, 120)})`;
      if (full.stdout.length) {
        renameOver(`${base}.diff`, full.stdout);
        res.worktreeDiffPath = `${base}.diff`;
      } else dropStale(`${base}.diff`);
      const ls = git(dir, ["ls-files", "--others", "--exclude-standard", "-z"],
        { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 });
      if (ls.status !== 0) return "the untracked list could not be taken";
      if (ls.stdout.length) {
        const tar = spawnSync("tar", ["-czf", `${base}.untracked.tgz`, "-C", dir, "--null", "-T", "-"],
          { input: ls.stdout, encoding: "utf8", timeout: LIMITS.SPAWN_TIMEOUT_MS, killSignal: "SIGKILL" });
        if (tar.status !== 0) return `untracked files could not be archived (${String(tar.stderr).trim().slice(0, 120)})`;
        res.worktreeUntrackedPath = `${base}.untracked.tgz`;
      } else dropStale(`${base}.untracked.tgz`);
      // IGNORED files are in neither the diff nor that archive — `status --porcelain` cannot see them,
      // which is why they never block removal, and `--exclude-standard` deliberately leaves them out
      // (a harvest that swept node_modules would be useless). They are still deleted by the removal
      // below, so the report NAMES them rather than letting a dropped build artefact — or a stray
      // .env — disappear silently. Counted, not archived: the decision is the reader's.
      const ign = git(dir, ["ls-files", "--others", "--ignored", "--exclude-standard", "-z"],
        { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 });
      if (ign.status === 0 && ign.stdout.length) {
        const names = String(ign.stdout).split("\0").filter(Boolean);
        res.worktreeIgnoredDropped = { count: names.length, sample: names.slice(0, 10) };
      }
      // A patch reproduces content, not history; give the agent's commits a permanent, reported ref
      // before removing the detached worktree that otherwise holds their only reference.
      if (committed) {
        const ref = `refs/entrust/${name}`;
        const upd = git(repo, ["update-ref", ref, headSha]);
        if (upd.status !== 0) return `the agent's commits could not be preserved (${String(upd.stderr).trim().slice(0, 120)})`;
        res.worktreeCommitsRef = ref;
      }
      return null;
    };
    let why = null;
    try { why = harvest(); } catch (e) { why = e.message; }
    if (why) res.worktreePreserved = `the tree holds changes and the harvest failed (${why}); harvest by hand, then remove`;
    else {
      res.worktreeHarvested = true;
      const rm = git(repo, ["worktree", "remove", "--force", dir]);
      if (rm.status === 0) res.worktreeRemoved = true;
      else res.worktreePreserved = `harvested, but git worktree remove refused: ${String(rm.stderr).trim().slice(0, 160)}`;
    }
  } else {
    // A clean tree needs no force, and anything git refuses to remove here is worth looking at.
    const rm = git(repo, ["worktree", "remove", dir]);
    if (rm.status === 0) {
      res.worktreeRemoved = true;
      dropStale(`${base}.diff`);
      dropStale(`${base}.untracked.tgz`);
    } else res.worktreePreserved = `git worktree remove refused: ${String(rm.stderr).trim().slice(0, 160)}`;
  }
  // Quote both paths in the published removal command with the standard '\'' escape:
  // spaces and shell syntax in a path must not change what the command removes.
  const shq = (s) => `'${String(s).replaceAll("'", `'\\''`)}'`;
  if (!res.worktreeRemoved) res.worktreeRemoveCommand = `git -C ${shq(repo)} worktree remove --force ${shq(dir)}`;
  // Keep the ledger entry for every preserved tree so reconciliation can still find it.
  if (ledger && res.worktreeRemoved) { try { fs.rmSync(ledger, { force: true }); } catch {} }
  else if (ledger) writeLedger(name, { path: dir, repo, baseSha, pid: process.pid,
    identity: processIdentity(process.pid), started: new Date().toISOString(), state: "preserved" });
  return res;
}

// The synchronous last resort for runs that never reach finish(): a tree whose turn never started is
// removed, anything else preserved out loud. Returns the disposition in the post-turn report's names, or
// null with no tree; idempotent through `disposed`.
function worktreeLastResort() {
  // A decision already made is answered from the record rather than made again — restorePriorWork
  // disposes of its own tree and writes one — so the pre-turn report says the same thing whichever
  // path got there first.
  if (!worktreeInfo || worktreeInfo.disposed) return worktreeDisposition;
  worktreeInfo.disposed = true;
  const { repo, dir, ledger } = worktreeInfo;
  let removed = false;
  // WHY a tree with no codex in it was kept: three different results decide it — git could not read the
  // status, the status reported work, or the removal was refused — and they send a reader to three
  // different places. One sentence naming all of them at once sent whoever read it looking for work in
  // a tree git had not even managed to look at.
  let kept = null;
  if (!child) {
    const st = git(dir, ["status", "--porcelain"]);
    const work = String(st.stdout ?? "").split("\n").filter((l) => l.trim() !== "");
    if (st.status !== 0) kept = `git could not read its status (${gitSaid(st)})`;
    else if (work.length)
      kept = `git found work in it (${work.length} path${work.length === 1 ? "" : "s"}, the first ${work[0].trim().slice(0, 120)})`;
    else {
      const rm = git(repo, ["worktree", "remove", dir]);
      removed = rm.status === 0;
      if (!removed) kept = `git refused to remove it (${gitSaid(rm)})`;
    }
  }
  if (removed) { if (ledger) { try { fs.rmSync(ledger, { force: true }); } catch {} } }
  else process.stderr.write(`entrust: worktree PRESERVED at ${dir} (run ended before disposition); ` +
    `harvest it, then: git -C ${repo} worktree remove --force ${dir}\n`);
  // The EXISTENCE of a child is what forbids removal — a codex that started may have written, and
  // nothing here can prove it did not. Its LIVENESS only picks the wording: a report that says a process
  // is running when it has already exited sends its reader looking for something to wait for.
  const exited = child && (child.exitCode !== null || child.signalCode !== null)
    ? (child.signalCode ? `signal ${child.signalCode}` : `code ${child.exitCode}`) : null;
  return (worktreeDisposition = { worktreePath: dir,
    worktreePreserved: removed ? null
      : !child ? `the run ended before disposition and the tree was not removed: ${kept}; harvest it, then remove it`
        : exited ? `the run ended before disposition; a codex was started in the tree and has exited (${exited}), so the tree may hold what it wrote; harvest it, then remove it`
          : "the run ended before disposition with a codex still running in the tree; harvest it, then remove it" });
}

// The read level's safety argument is "$TMPDIR is writable and nothing else is, /tmp included", so the
// EFFECT the server reports is checked, not the profile's name: a misspelt field inside permissions.<id>
// drops the grant while the id still reads back (environment-and-internals.md, the configuration key oracle).
// Paths are canonicalised on both sides: the server resolves intermediate symlinks but not a final one.
function canonPath(p) {
  try { return fs.realpathSync(path.resolve(p)); } catch { return null; }
}
// canonPath for a path that may not exist yet: its longest existing prefix resolved, the rest appended as
// written. null where an existing component will not resolve — a dangling or looping link — because what
// a write through it would reach is not knowable here.
function canonLoose(p) {
  const rest = [];
  for (let cur = path.resolve(p); ; ) {
    const real = canonPath(cur);
    if (real !== null) return path.join(real, ...rest);
    try { fs.lstatSync(cur); return null; } catch {}
    const parent = path.dirname(cur);
    if (parent === cur) return null;
    rest.unshift(path.basename(cur));
    cur = parent;
  }
}
// Assert the effect the server reports at both levels; the expected grants differ, but neither level
// may silently accept a different cwd, network setting or writable-root set.
// What the server REPORTS is the only evidence the rights asked for took effect, so the sandbox thread/start
// returns is compared, key by key, with what this level asked for, and any difference, wider or narrower,
// stops the run rather than run it under a sandbox nobody reasoned about. Both levels are a workspaceWrite
// sandbox with egress as asked and /tmp excluded, and both workspaces hold the cwd: elsewhere, everything the
// turn writes lands where the caller did not choose. At write level the cwd is not in writableRoots
// (workspaceWrite implies it, measured on the live binary), so those hold the --writable roots alone, and
// $TMPDIR stays writable, which heredocs and test runners need. At read level the profile asked for must be
// the one applied; its `network` table carries egress, which a typo would drop while the id still reads back
// right, and the one writable root is the fresh $TMPDIR this run made (never the cwd).
function assertSandbox(thread) {
  const sb = thread.sandbox ?? {}, read = opts.level === "read";
  const set = (list) => JSON.stringify((list ?? []).map(canonPath).sort());
  const tmp = process.env.TMPDIR;
  if (read && !tmp) fail(EXIT.TRANSPORT, "the read sandbox is not what was asked for (TMPDIR is unset, so the server grants no temp directory at all)");
  const rows = [
    ["sandbox type", sb.type ?? null, "workspaceWrite"],
    ["networkAccess", Boolean(sb.networkAccess), opts.network],
    ["excludeSlashTmp", sb.excludeSlashTmp, true],
    ["workspace roots holding --cwd", (thread.runtimeWorkspaceRoots ?? []).map(canonPath).includes(canonPath(cwd)), true],
    ["writable roots", set(sb.writableRoots), set(read ? [tmp] : [...roots])],
    ...(read ? [["permission profile", thread.activePermissionProfile?.id ?? null, READ_PROFILE]]
      : [["excludeTmpdirEnvVar", sb.excludeTmpdirEnvVar, false]]),
  ];
  const bad = rows.find(([, got, want]) => got !== want);
  if (bad) fail(EXIT.TRANSPORT, `the ${opts.level} sandbox is not what was asked for (${bad[0]}: ${typeof bad[1] === "string" ? bad[1] : JSON.stringify(bad[1])}, `
    + `expected ${typeof bad[2] === "string" ? bad[2] : JSON.stringify(bad[2])}); refusing to continue rather than run under an unknown sandbox`);
}

// Assigned by setup(), which runs inside main()'s try — a Bail thrown at module top level would be an
// uncaught exception and would print a stack trace instead of the intended usage error.
let opts, cwd, sandbox, spawnArgs;
let codexHome = null;   // null means the caller's own ~/.codex, which --host-home asks for
let roots = [];

// Everything the argument layer decides, on its own: --help and every refusal reachable from the
// command line need `opts` and none of them needs a codex, a lock or a directory.
function readOpts(argv = process.argv.slice(2), { resolveState = true } = {}) {
  // A prompt file is expanded into ordinary argv and re-parsed, so every flag guard, every mutual
  // exclusion and every value check applies to it unchanged — a second parser would be a second set of
  // rules to keep in sync, which is how a wrapper's rights quietly stop matching the CLI's.
  // Command-line flags are appended after the file's, so an explicit flag still wins where the two
  // disagree (--timeout is the common case: the harness bounding an agent it did not author).
  // Scanned for the flag alone, not parsed: a full parse first would reject the command line for
  // missing exactly what the prompt file is about to supply (--cwd).
  // Opened FIRST, before any other refusal this function can raise, and off the raw command line: the
  // file the caller waits on has to exist for every refusal, including the ones the --prompt-file checks
  // below raise and the ones the prompt file itself causes. A missing or flag-like value is left to
  // need() below, which is the one place that message is written.
  const rf = argv.lastIndexOf("--report-file");
  if (rf >= 0 && argv[rf + 1] !== undefined && !argv[rf + 1].startsWith("--")) openReportFile(argv[rf + 1]);
  const at = argv.indexOf("--prompt-file");
  // Refuse multiple prompt files rather than silently choosing which declaration supplies the run.
  if (at >= 0 && argv.indexOf("--prompt-file", at + 2) >= 0)
    fail(EXIT.USAGE, "--prompt-file given more than once; only one prompt file defines an agent");
  if (at >= 0 && (argv[at + 1] === undefined || argv[at + 1].startsWith("--")))
    fail(EXIT.USAGE, "--prompt-file requires a non-empty value");
  const o = at >= 0
    ? parseArgs([...argvFromPromptFile(argv[at + 1]),
                 ...argv.filter((_, i) => i !== at && i !== at + 1)])
    : parseArgs(argv);
  if (promptFileBody !== null) {
    // Two prompts and no rule saying which one ran is worse than a refusal: the body is the file's own
    // and --prompt is the command line's, and neither is obviously the caller's intent.
    if (o.prompt !== undefined)
      fail(EXIT.USAGE, "the prompt file carries a body below its header and --prompt was given too; pass one prompt, not two");
    o.prompt = promptFileBody;
  }
  // The one place the state root is resolved. Here rather than at each use, so a root this driver cannot
  // work with is refused at parse time rather than halfway through the run that needs it.
  if (resolveState) stateDir();
  // Returned rather than assigned from in here: main installs it before anything reads it, which is what
  // lets every reader below say `opts.x` instead of guarding a variable that is always set by then.
  return o;
}

// --check-prompt-file F: every refusal of --prompt-file F that needs no server, lock or state directory, by
// the run's own code, for the launcher's --new. A pass is silent and 0; a refusal is 2 and one line,
// `entrust: refused: <reason>`. The model catalogue and whether the named directories exist stay the run's.
function checkPromptFile(argv) {
  checkOnly = true;
  if (argv.length !== 2 || argv[0] !== "--check-prompt-file" || !argv[1] || argv[1].startsWith("--"))
    fail(EXIT.USAGE, "--check-prompt-file takes one prompt file and no other argument");
  const o = readOpts(["--prompt-file", argv[1]], { resolveState: false });
  // The launcher gives the run no stdin, so a file with no body is the run's own "empty prompt".
  if (o.prompt === undefined) fail(EXIT.USAGE, "empty prompt");
  if (o.worktree) checkRoot(resolveDir(o.worktree, "--worktree"));
  else if (o.level !== "read") checkRoot(resolveDir(o.cwd, "--cwd"));
  for (const d of o.writable) checkRoot(resolveDir(d, "--writable"));
}

async function setup() {
  // After parseArgs, so --help works on a machine with no codex at all.
  codexBin = resolveCodexBin();

  // Before the worktree is cut and before a single token is spent: a thread whose own driver is still
  // alive cannot be continued, and the registry answers that locally.
  if (opts.resume && opts.resume !== "last") refuseLiveResume(opts.resume);

  // Two levels, mirroring Claude's own subagents: a reader that can run things but not touch your files,
  // and a writer confined to a directory you chose. Everything else is a modifier.
  //
  // read  : the ":read-only" permission profile, extended to make $TMPDIR writable. Your files, the repo
  //         and /tmp all stay unwritable; the temp dir is what tools need to start at all. Without it a
  //         reader cannot run the test suite, which Claude's own read-only subagent can — that gap is the
  //         whole reason the profile is here rather than a plain sandbox: "read-only".
  // write : workspace-write with cwd as the writable root, plus --writable and $TMPDIR; /tmp is
  //         excluded.
  //
  // The level says what may be WRITTEN, and egress crosses it: both levels reach the network unless the
  // caller denied it, which is what Claude's own subagents do. A reader that must ask for it is a rule
  // to be known, and the read level's promise — your files stay untouched — is unaffected by it: with
  // egress granted, a write outside the temp dir is still "Operation not permitted".
  sandbox = opts.level === "read" ? null : "workspace-write";

  if (opts.worktree) {
    const repo = resolveDir(opts.worktree, "--worktree");
    // Resolved against the REPOSITORY, before the tree exists: "the last agent here" for a worktree agent
    // cannot mean its own cwd, which was removed when it finished.
    if (opts.resume === "last") { opts.resume = resolveResumeLast(repo); refuseLiveResume(opts.resume); }
    opts.cwd = createWorktree(repo, opts.resume ? priorWorktreeJob(opts.resume, repo) : null);
  }

  // --cwd is the primary writable root above read, so it needs the same guard as a hand-added root.
  cwd = resolveDir(opts.cwd, "--cwd");
  if (opts.level !== "read") checkRoot(cwd);

  // After the cwd exists, because "last" means the last agent HERE.
  if (opts.resume === "last") { opts.resume = resolveResumeLast(cwd); refuseLiveResume(opts.resume); }

  // $TMPDIR is a grant at BOTH levels — the whole of it at read level, beside --cwd at write level — so
  // every run gets a directory of its own inside the caller's, never the caller's whole one: a caller's
  // TMPDIR is shared by every agent it starts, and two agents that named one file there overwrote each
  // other with no error (E92). /tmp is excluded from the write sandbox too, so without it a write agent
  // would have no temp root at all, and every heredoc, mkdtemp and test runner would die. It needs no
  // checkRoot, wherever the caller's TMPDIR lies: it is a directory this run has just made, empty, which
  // grants nothing beside itself.
  // Set on process.env because the codex spawn and `codex sandbox :tmpdir` read it.
  process.env.TMPDIR = runTmpDir();

  // Probe the caller's settings before taking the write lock so a stalled config request does not occupy the directory.
  codexHome = opts.hostHome ? null : await isolatedHome();

  if (opts.level !== "read") acquireLock(cwd);

  // The server deduplicates writable roots and subtracts cwd, which workspaceWrite implies and
  // runtimeWorkspaceRoots reports; normalise the request the same way before asserting the response.
  roots = [...new Set(opts.writable.map((d) => checkRoot(resolveDir(d, "--writable"))))]
    .filter((r) => r !== cwd);
  if (opts.approvalDir !== undefined) box = openMailbox(approvalDir = checkMailbox(opts.approvalDir));
  noteManagedPolicy(opts.webSearch);

  const config = [
    ["web_search", opts.webSearch ?? "disabled"],
    // A reader that cannot write $TMPDIR cannot start vitest at all (it mkdirs there before running).
    // Extending ":read-only" opens exactly that and nothing else — /tmp stays excluded.
    // The `network` entry is a TABLE: `network=true` is rejected as `expected struct NetworkToml`. It is
    // sent at both settings, like the write-level keys below, so the level's egress depends only on the
    // declared flag and not on a profile of this name in the caller's own config.
    ...(opts.level === "read" ? [
      [`permissions.${READ_PROFILE}.extends`, '":read-only"'],
      [`permissions.${READ_PROFILE}.filesystem`, '{":tmpdir"="write"}'],
      [`permissions.${READ_PROFILE}.network`, `{enabled=${opts.network}}`],
      ["default_permissions", `"${READ_PROFILE}"`]
    ] : []),
    // Omitted entirely when the caller did not name one, so ~/.codex/config.toml decides.
    ...(opts.effort ? [["model_reasoning_effort", opts.effort]] : []),
    // Send write-level sandbox settings unconditionally, unlike the optional --effort above:
    // the sandbox must depend only on the declared flags, which assertSandbox checks against the response.
    ...(opts.level === "write" ? [
      ["sandbox_workspace_write.network_access", String(opts.network)],
      ["sandbox_workspace_write.writable_roots", `[${roots.map((r) => JSON.stringify(r)).join(",")}]`],
      // The two implicit temp grants a workspace-write sandbox carries unless it is told otherwise.
      // Measured on 0.153.4: with neither key sent, thread/start answers writableRoots [],
      // excludeSlashTmp false and excludeTmpdirEnvVar false — so an agent given one --cwd could also
      // write all of /tmp, which no caller named. /tmp is excluded; $TMPDIR is kept, because heredocs,
      // mkdtemp and every test runner need a temp root and $TMPDIR is the run's own directory above.
      // Sent unconditionally, like the two keys above, and
      // assertSandbox refuses a response that differs either way.
      ["sandbox_workspace_write.exclude_slash_tmp", "true"],
      ["sandbox_workspace_write.exclude_tmpdir_env_var", "false"]
    ] : [])
  ];
  spawnArgs = ["--strict-config", ...config.flatMap(([k, v]) => ["-c", `${k}=${v}`]), "app-server"];
}

// ---------------------------------------------------------------- transport

// The run's lifecycle, in two flags every handler reads and only five places write.
//   settled  — a verdict has been decided; nothing may start new work or report a second one. Written by
//              fail(), the --help exit, abort(), finish() and exitWith(), and by nothing else.
//   flushing — the report is mid-write on stdout. A signal arriving here defers to the write callback or
//              to the drain watchdog rather than exiting on the bytes already sent.
let child, settled = false, flushing = false;
// The turn's connection, so handleMessage can take its own pending entries and the corrective turn can
// send on it.
let conn = null;
// Set by inheritedConfig for its lifetime: closing it is the one way to end the probe from outside, and
// it settles the probe's own awaited request, so a shutdown mid-probe cannot leave the group alive or
// print a misleading "exited before replying" warning.
let probeConn = null;
let stderrBuf = "";
let stderrDropped = 0;

// Every child gets a process group of its own (detached), and the negative pid reaches all of it. A command
// the server runs sits in its own group; a sandboxed one still ended with the driver (measured once), one
// run after an approval has not been measured (environment-and-internals.md, bounding or stopping an agent).
const killGroupOf = (proc, sig) => { try { process.kill(-proc.pid, sig); } catch { try { proc.kill(sig); } catch {} } };
const killGroup = (sig) => { if (child) killGroupOf(child, sig); };
// Signal 0 to the NEGATIVE pid answers "does any member of the group still exist" without touching it.
const groupAlive = () => { if (!child) return false; try { process.kill(-child.pid, 0); return true; } catch { return false; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One JSON-RPC connection over a child's stdio, for the config probe and the turn: bounded newline framing,
// the pending-request map, the EOF flush and the writer. It decides neither what a response means (an
// onMessage caller takes the pending entry itself, so the turn assigns its root ids synchronously) nor how
// the process dies.
function jsonRpcConn(proc, { maxLine, onMessage = null, onOverflow = () => {} }) {
  const pending = new Map();
  let nextId = 1, buf = "", closed = false;
  const send = (obj) => { try { proc.stdin.write(`${JSON.stringify(obj)}\n`); } catch {} };
  const take = (id) => {
    const p = pending.get(id);
    if (p) { pending.delete(id); clearTimeout(p.timer); }
    return p ?? null;
  };
  // Nobody listening for events: resolve responses and drop the rest, which is the probe's whole shape.
  const resolveResponse = (msg) => {
    if (msg.id === undefined || msg.method) return;
    const p = take(msg.id);
    if (!p) return;
    if (msg.error) p.reject(Object.assign(new Error(`${p.method}: ${JSON.stringify(msg.error).slice(0, LIMITS.RPC_ERROR_CHARS)}`), { rpc: msg.error }));
    else p.resolve(msg.result);
  };
  const dispatch = (line) => {
    let msg;
    try { msg = JSON.parse(line); } catch { return; }
    // `null`, a number, a string and an array are all valid JSON and none of them is a JSON-RPC frame.
    // Every reader below asks for `.id` or `.method`, and on `null` that throws — on the turn channel
    // into abort(), which discards the commands and the answer already collected. Unparseable is what
    // it is, so it takes the unparsed route the malformed lines take.
    if (msg === null || typeof msg !== "object" || Array.isArray(msg)) return;
    if (onMessage) return onMessage(msg, line.length);
    resolveResponse(msg);
  };
  proc.stdout.setEncoding("utf8");   // the decoder, not the reader, owns multi-byte chunk boundaries
  proc.stdout.on("data", (chunk) => {
    buf += chunk;
    let at;
    while ((at = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, at);
      buf = buf.slice(at + 1);
      dispatch(line);
    }
    // The bound is here rather than in readline, which buffers an unterminated line without any limit:
    // one broken write would exhaust the driver's memory with nothing to show for it.
    if (buf.length > maxLine) { buf = ""; onOverflow(maxLine); }
  });
  // Flush the final line at EOF so a turn/completed without a trailing newline is still handled.
  proc.stdout.on("end", () => {
    const line = buf;
    buf = "";
    if (line.trim()) dispatch(line);
  });
  proc.stdin.on("error", () => {});
  const request = (method, params, { timeoutMs = 0 } = {}) => {
    const id = nextId++;
    send({ jsonrpc: "2.0", id, method, params });
    return new Promise((resolve, reject) => {
      const timer = timeoutMs > 0
        ? setTimeout(() => { pending.delete(id); reject(Object.assign(new Error(`no reply in ${timeoutMs}ms`), { timedOut: true })); }, timeoutMs)
        : null;
      pending.set(id, { method, resolve, reject, timer });
    });
  };
  const rejectAll = (err) => {
    for (const p of pending.values()) { clearTimeout(p.timer); p.reject(err); }
    pending.clear();
  };
  // Streams and pending requests only, and the caller says whether to signal the group: a child's `exit`
  // can precede its stdout `end`, so a teardown that destroyed the streams there would drop a final
  // unterminated line. That path calls rejectAll instead.
  const close = ({ kill = null, reason = null } = {}) => {
    if (closed) return;
    closed = true;
    rejectAll(reason ?? Object.assign(new Error("the connection was closed"), { cancelled: true }));
    if (kill) killGroupOf(proc, kill);
    // The pipes outlive the kill for as long as anything still holds the write end, and an open pipe
    // keeps the event loop alive on its own.
    for (const st of [proc.stdout, proc.stderr, proc.stdin]) { try { st?.destroy(); } catch {} }
  };
  return { request, send, take, rejectAll, close,
           notify: (method, params = {}) => send({ jsonrpc: "2.0", method, params }) };
}

// The turn's process group is ended in one shape, two ways: SIGTERM, a wait, then SIGKILL and a second wait.
// This one is shutdown()'s and may await. Its timers are ref'd, since an unref'd SIGKILL is lost to
// process.exit(), and its second wait is the longer, since the lock is released after it.
async function quiesceGroup() {
  killGroup("SIGTERM");
  for (const end = Date.now() + LIMITS.QUIESCE_TERM_MS; groupAlive() && Date.now() < end; ) await sleep(50);
  if (!groupAlive()) return;
  killGroup("SIGKILL");
  for (const end = Date.now() + LIMITS.QUIESCE_KILL_MS; groupAlive() && Date.now() < end; ) await sleep(50);
}

// The pre-harvest one, and it must NEVER await: it runs inside writeReport before `flushing` is set, where
// a signal in an await would exit with the report unwritten. The harvest needs the writers stopped, not reaped.
function quiesceGroupSync() {
  killGroup("SIGTERM");
  for (const end = Date.now() + LIMITS.QUIESCE_TERM_MS; groupAlive() && Date.now() < end; ) sleepSync(50);
  if (groupAlive()) { killGroup("SIGKILL"); sleepSync(LIMITS.QUIESCE_KILL_SYNC_MS); }
}

// Ends every child and waits for them, then releases the lock. Idempotent: callers share one promise, and a
// repeat signal escalates the teardown instead of bypassing it.
let shutdownDone = null;
function shutdown() {
  if (shutdownDone) return shutdownDone;
  shutdownDone = (async () => {
    if (probeConn) probeConn.close({ kill: "SIGKILL" });   // kills the group once and settles the probe
    clearInterval(approvalPoll);
    for (const o of openApprovals.values()) clearTimeout(o.timer);
    if (child) {
      try { child.stdin.end(); } catch {}
      await quiesceGroup();
    }
    releaseLock();
  })();
  return shutdownDone;
}

// Exit 6 reads as total loss while the turn completed and its answer is on disk; said once, last, and only
// when every part of it holds.
function announceDeclinedApproval(reportCode, finalCode) {
  if (reportCode !== EXIT.APPROVAL || finalCode !== EXIT.APPROVAL) return;
  if (!reportFileWritten || closingFields === null) return;
  if (closingFields.turnStatus !== "completed" || !closingFields.answerPath) return;
  const refused = escalations.filter((e) => e.decision !== "accepted").length;
  if (refused === 0) return;
  process.stderr.write(`entrust: turn completed; final answer saved at ${closingFields.answerPath}; `
    + `approval requests declined or expired: ${refused}; read the answer before judging task completeness.\n`);
}

// The one way out once a code is decided: stdout's last bytes under a drain watchdog, the job record closed on
// what happened, the group torn down. `durable`: the report is already in --report-file, so a broken pipe
// keeps the turn's verdict. abort() and the --help exit leave by their own paths.
function exitWith(code, { stdout = null, durable = false } = {}) {
  settled = true;
  process.exitCode = code;
  // The write callback and the watchdog race; the first one out wins, rather than whichever `.then`
  // happened to be registered on shutdown()'s promise first.
  let left = false;
  const leave = (finalCode) => {
    if (left) return;
    left = true;
    announceDeclinedApproval(code, finalCode);
    closeJobRecord(finalCode);
    shutdown().then(() => process.exit(finalCode));
  };
  if (stdout === null) return leave(code);
  // Set BEFORE the write and cleared in the callback: the signal handler defers to it, or a signal
  // arriving mid-report exits with the bytes half-written.
  flushing = true;
  // Both the write callback and the stream's error event must classify a broken pipe as a transport failure.
  process.stdout.write(stdout, (e) => {
    flushing = false;
    if ((e || stdoutBroken) && !durable) return stdoutFailed(e);
    leave(code);
  });
  // A report that cannot drain is a transport failure; wait for the remaining wall clock, with
  // STDOUT_DRAIN_MIN_MS as the minimum and the entire bound when no wall clock was set.
  const drainMs = Math.max(LIMITS.STDOUT_DRAIN_MIN_MS, startedAtMs + opts.timeout * 1000 - Date.now());
  setTimeout(() => {
    process.stderr.write(`entrust: stdout did not drain within ${drainMs}ms; ${durable ? `the report is complete at ${reportFilePath}` : "report may be truncated"}\n`);
    leave(durable ? code : EXIT.TRANSPORT);
  }, drainMs).unref?.();
}

function abort(code, msg) {
  if (settled) return;
  process.stderr.write(`entrust: ${msg}\n`);
  if (stderrBuf.trim()) {
    if (stderrDropped) process.stderr.write(`[${stderrDropped} earlier bytes of stderr dropped]\n`);
    process.stderr.write(`${stderrBuf.trim()}\n`);
  }
  // Once a thread exists there is evidence in memory — commands, file changes, an answer — and the
  // reason for the abort is no reason to throw it away. The same choice the child-exit handler makes,
  // and the code is unchanged: it rides as codeOverride, above the ladder. The reason reaches the report
  // through turnError, since a collected report carries no `error` key.
  // classifyEvidence() runs synchronously here, inside a stdout handler where a throw would be uncaught
  // and take the whole report with it: on that one failure the pre-turn shape below is still written.
  if (rootThreadId) {
    turnError = turnError ?? { codexErrorInfo: "aborted", message: msg };
    try { finish("failed", code); return; }
    catch (e) { process.stderr.write(`entrust: the collected report could not be produced (${e.message})\n`); }
  }
  settled = true;
  // Like fail(): an abort with no turn behind it prints no report, and a caller reading the file has to
  // be told that rather than left to time out on a path that never appears.
  preTurnReport(code, msg);
  process.exitCode = code;
  // The deadline can fire while still reading the prompt from stdin, before any child exists. Without
  // this the process announces its own timeout and then blocks on stdin forever.
  if (!child) { try { process.stdin.destroy(); } catch {} }
  shutdown();
}

// ---------------------------------------------------------------- state

let rootThreadId = null, rootTurnId = null;
const commands = [];        // root-thread commandExecution items only
const messages = [];        // root-thread agentMessage items only
const fileChanges = [];     // root-thread fileChange items: what the turn actually wrote
const escalations = [];     // every approval request, the root thread's and its subagents', and what became of it
const interactions = [];    // requests that needed a human: no sandbox change can answer them
const reasoningSummaries = [];  // root-thread reasoning item summaries — the inspectable thinking a Claude subagent's transcript has
const otherItemCounts = {}; // root-thread item types the evidence gates ignore (mcpToolCall, webSearch, plan, …), counted so the report does not silently drop them
const otherItems = [];      // a bounded descriptor per such item — enough to see WHAT was searched or called without a full transcript
const subagentThreads = new Map();  // threads the server started under ours: id -> {agentPath, status, items, commands}
let turnStatus = null;
let turnError = null;
let selectedModel = null;   // what the server resolved, which may not be what was asked for
let selectedEffort = null;  // likewise: with no --effort this is whatever config.toml chose
let effectiveSandbox = null;   // the sandbox the SERVER applied, not the one we asked for
let tokenUsage = null;      // the latest thread/tokenUsage/updated payload: what this agent cost
let rateLimits = null;      // the account snapshot read once before any thread is started
let turnDiffPath = null;    // where the last turn/diff/updated payload was persisted, or null when it could not be written
let outputAttempts = 0;     // turns STARTED under --output-schema; at most one corrective retry
let sizeAttemptPath = null;  // the complete size-failed first answer, before a corrective turn overwrites it
let requestFn = null;       // main()'s request closure, hoisted so the corrective turn can reach it
let lastTurnParams = null;  // the original turn/start params, so a transient retry replays them exactly
const transientRetries = [];  // {cause, delayMs} per retry taken, for the report
// The turn is being ended on a declared budget rather than on its own: {reason, kind, limit, observed,
// completedInGrace}. Set once; the root turn/completed handler and the grace timer both read it.
let pendingCut = null;
let cutGraceTimer = null;
// The idle guard: how long the thread has been silent. Armed once the thread exists and rearmed by
// every sign of life on it, so what it measures is silence, not duration.
let idleTimer = null;
let lastEventAtMs = startedAtMs;
let setupDoneMs = null;     // when setup() returned, so the report can separate setup from model time
// The in-flight agentMessage text, keyed by item id. Measured (E1): turn/interrupt DISCARDS the
// server's in-progress message — no item/completed, nothing in the rollout — so the deltas are the only
// copy of a cut answer. The delta notification carries no phase, so an accumulator is by definition
// unphased until its item/completed arrives and deletes it.
const answerDeltas = new Map();
// Attribute evidence to every turn id returned by our turn/start calls, including earlier corrective attempts.
// Prior turns of a resumed thread remain excluded because their ids never came from this invocation.
const ownedTurns = new Set();

// Fail CLOSED on BOTH ids. Thread alone is not enough: a stale item from an earlier turn on the same
// thread, or a completion delivered before the turn/start response, would otherwise be accepted as ours.
// Notifications carry turnId as a required field; use it.
// The turn id does not live in the same place for every message: ItemCompletedNotification carries a
// required top-level `turnId`, while TurnCompletedNotification carries only `threadId` and `turn`.
// Reading `turnId` for both silently rejects every real completion.
const turnIdOf = (p) => p?.turnId ?? p?.turn?.id ?? null;
const isRoot = (p) =>
  rootThreadId !== null && (p?.threadId ?? null) === rootThreadId &&
  turnIdOf(p) !== null && ownedTurns.has(turnIdOf(p));
// The idle guard accepts activity on the root and its subagent threads, while evidence of success stays root-only.
// A child's thread/started uses thread.id rather than threadId, so that event does not rearm the guard;
// the root item that spawned it precedes it.
const onRootThread = (p) =>
  rootThreadId !== null && ((p?.threadId ?? null) === rootThreadId
    || subagentThreads.has(p?.threadId ?? ""));

// The turn is cut when the thread has been silent for --idle-timeout, so every event rearms the timer.
// The wall clock bounds a HEALTHY turn; this bounds a dead one, and only this can tell them apart.
function touchIdle() {
  lastEventAtMs = Date.now();
  if (!opts.idleTimeout || settled || pendingCut) return;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
  // A request waiting on the caller is the caller's time, not the thread's silence: the guard stays off
  // until the last one settles, and settling calls this again.
  if (openApprovals.size) return;
  idleTimer = setTimeout(() => {
    if (settled || pendingCut || !child || rootThreadId === null || openApprovals.size) return;
    cutTurn("timedOut", "idle",
      { limit: opts.idleTimeout, observed: Math.round((Date.now() - lastEventAtMs) / 1000) });
  }, opts.idleTimeout * 1000);
  idleTimer.unref?.();
}

// Events can share a stdout chunk with the turn/start response and so arrive before rootTurnId is known.
// Holding them keyed by their own turnId lets the right ones be replayed once the id is established,
// instead of being either dropped or waved through.
// Bounded on both axes: a server that holds the turn/start response while streaming notifications
// accumulates them here with nothing to drain them. Generous, because a legitimate burst is a handful
// of items sharing one chunk.
let earlyBytes = 0;
const early = [];
function replayEarly() {
  const held = early.splice(0, early.length);
  // Completion last, whatever order it arrived in: replaying it first would call finish() before the
  // items it summarises had been counted, and the turn would report as empty.
  const terminal = (m) => m.method === "turn/completed";
  for (const m of held.filter((m) => !terminal(m))) handleMessage(m);
  for (const m of held.filter(terminal)) handleMessage(m);
}

// ---------------------------------------------------------------- approvals
//
// The mailbox the launcher armed with --approval-dir (orchestrate/scripts/mailbox.mjs), and the requests
// offered through it. Nothing blocks here: the turn waits until <id>.decision.json appears, the deadline runs
// out, or the request's turn or the run ends. Each of those settles the request and answers the server, the
// settlement recorded first, so a status read after a crash never shows less than the server was told.
let approvalDir = null, box = null;
const openApprovals = new Map();      // id -> {rpcId, entry, record, timer}
let approvalSeq = 0, approvalPoll = null;
// The paths a file change names arrive only on its item/started: the request itself carries none (P1,
// three observations). Keyed by thread and item, dropped at that item's completion.
const fileChangeStarts = new Map();
// Each non-root thread's turns, open and completed, keyed like items: a subagent's request is answered only
// inside a turn of its own still running.
const childTurnsOpen = new Set(), childTurnsDone = new Set();
// Every entry by the server's request id, for serverRequest/resolved, and by thread and item, for the
// completion that says what the command or the write then did.
const entryByRpc = new Map(), entryByItem = new Map();
const itemKey = (thread, item) => `${thread}\u0000${item}`;

// The roots the agent may write, resolved: $TMPDIR at both levels, the cwd at write level, and every
// --writable root. These are what the sandbox assertions verified the server applied.
const agentRoots = () => [...new Set([process.env.TMPDIR ? canonPath(process.env.TMPDIR) : null,
  ...(opts.level === "write" ? [cwd] : []), ...roots].filter(Boolean))];

// Whether every path a file change names lies inside one of those roots, by inode as checkRoot compares,
// and cannot be pointed elsewhere before the server writes it. The edit tool asks by spelling —
// /private/var/… asks where /var/… does not (P1 Q5) — so the root is found by identity, walking the path
// as written up to the first component that IS a root. Below it every component must be a directory that
// exists and is not a link, and the target a regular file or not there yet: a link there, or a directory
// still to be made, is one the agent could aim outside between this check and the write. A relative path,
// a `.` or `..`, and anything under a .git, .codex or .agents, which the workspace sandbox keeps
// read-only, are refused too — those by inode where they exist, so .GIT on a case-insensitive volume is
// the same directory, and by name in any case where they do not. Returns what it saw, for the check
// repeated at the send, or null: nothing is shown covered, and the request is declined instead.
const GUARDED_NAMES = [".git", ".codex", ".agents"];
const RIGHTS_WHY = "rights cover it (checked as the answer was sent)";
// The two the driver declines itself and never offers: a yes to either would grant rights mid-run that no
// settled line of the prompt granted.
const OUTSIDE_WHY = "not shown to lie inside the writable roots; a WRITABLE: line grants a root";
const PERMISSIONS_WHY = "rights are set at launch";
function coveredByRights(changes) {
  const roots = agentRoots().map((r) => { try { return [r, fs.statSync(r)]; } catch { return null; } }).filter(Boolean);
  const guarded = roots.flatMap(([r]) => GUARDED_NAMES.map((n) => { try { return fs.statSync(path.join(r, n)); } catch { return null; } }))
    .filter(Boolean);
  const same = (a, b) => a.dev === b.dev && a.ino === b.ino;
  const paths = changes.flatMap((c) => [c.path, c.move].filter((p) => p != null)).map(String);
  if (!paths.length || !roots.length) return null;
  const seen = [];
  for (const p of paths) {
    if (!path.isAbsolute(p) || p.split("/").some((c) => c === "." || c === "..")) return null;
    let root = null;
    for (let cur = p; root === null; ) {
      let l = null;
      try { l = fs.lstatSync(cur); } catch {}
      const at = l && !l.isSymbolicLink() ? roots.find(([, st]) => same(st, l)) : null;
      if (at) { root = at[0]; break; }
      if (cur === p ? l !== null && !l.isFile() : l === null || !l.isDirectory()) return null;
      if ((l && guarded.some((g) => same(g, l))) || GUARDED_NAMES.includes(path.basename(cur).toLowerCase())) return null;
      seen.push(`${cur}\u0000${l ? `${l.dev}:${l.ino}` : "-"}`);
      const parent = path.dirname(cur);
      if (parent === cur) return null;
      cur = parent;
    }
    seen.push(`${p}\u0000${root}`);
  }
  return seen.join("\n");
}

function settleEntry(entry, decision, by, why) {
  entry.decision = decision;
  entry.by = by;
  entry.why = why;
  entry.settledAt = new Date().toISOString();
  entry.waitMs = Date.parse(entry.settledAt) - Date.parse(entry.askedAt);
}

function offerApproval(msg, entry) {
  const p = msg.params ?? {};
  const id = requestId(++approvalSeq);
  const waitMs = opts.approvalDeadlineMs;
  const record = { ...p, id, method: msg.method, rpcId: msg.id,
    run: { pid: process.pid, identity: selfIdentity(), startedAtMs, threadId: entry.thread, turnId: p.turnId ?? null },
    kind: entry.kind, subagent: entry.subagent, agentPath: entry.agentPath, cause: entry.cause,
    fileChanges: entry.fileChanges,
    level: opts.level, sandbox: effectiveSandbox, roots: agentRoots(),
    askedAt: entry.askedAt, deadlineAt: new Date(Date.parse(entry.askedAt) + waitMs).toISOString() };
  try { box.offer(record); } catch (e) {
    const why = `mailbox write failed: ${e.code ?? e.message}`;
    process.stderr.write(`entrust: ${why} in ${approvalDir}; request declined, since no caller can be told of it\n`);
    settleEntry(entry, "expired", "driver", why);
    box.settle(record, { decision: "expired", by: "driver", why, settledAt: entry.settledAt, waitMs: entry.waitMs, decisionFile: "none" });
    conn.send({ jsonrpc: "2.0", id: msg.id, result: { decision: "decline" } });
    return;
  }
  entry.id = id;
  entry.offered = true;
  const timer = setTimeout(() => expireApproval(id), waitMs);
  timer.unref?.();
  openApprovals.set(id, { rpcId: msg.id, entry, record, timer });
  if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
  if (!approvalPoll) {
    approvalPoll = setInterval(() => { for (const open of [...openApprovals.keys()]) takeDecision(open); },
      Number(process.env.ENTRUST_APPROVAL_POLL_MS) > 0 ? Number(process.env.ENTRUST_APPROVAL_POLL_MS) : LIMITS.APPROVAL_POLL_MS);
    approvalPoll.unref?.();
  }
  process.stderr.write(`entrust: approval request ${id} (${msg.method}${entry.subagent ? ` from ${entry.agentPath ?? entry.thread}` : ""}) `
    + `waits for a decision in ${approvalDir} until ${record.deadlineAt}\n`);
}

// Settles one open request: the record, then the answer. `decisionFile` records what the decision file held:
// taken, none, stale or late. An accept whose settlement the record does not hold goes out as a decline.
function closeApproval(id, answer, decision, by, why, decisionFile) {
  const o = openApprovals.get(id);
  if (!o) return;
  openApprovals.delete(id);
  clearTimeout(o.timer);
  settleEntry(o.entry, decision, by, why);
  if (!box.settle(o.record, { decision, by, why, settledAt: o.entry.settledAt, waitMs: o.entry.waitMs, decisionFile })) {
    process.stderr.write(`entrust: the settlement of approval request ${id} could not be written to ${approvalDir}`
      + `${answer === "accept" ? "; declined instead of accepted, since nothing would record that it ran" : ""}\n`);
    if (answer === "accept") { answer = "decline"; settleEntry(o.entry, "expired", "driver", "mailbox write failed: the settlement could not be recorded"); }
  }
  conn.send({ jsonrpc: "2.0", id: o.rpcId, result: { decision: answer } });
  if (openApprovals.size === 0) { clearInterval(approvalPoll); approvalPoll = null; touchIdle(); }
}

function takeDecision(id) {
  const o = openApprovals.get(id);
  if (!o) return "none";
  const { state, d } = box.decision(o.record);
  if (state !== "valid") return state;
  const accept = d.decision === "accept";
  closeApproval(id, accept ? "accept" : "decline", accept ? "accepted" : "declined", "coordinator",
    typeof d.why === "string" ? d.why : null, "taken");
  // Taken is what the server was told: an accept whose settlement could not be written went out as a
  // decline, and its decision file is then one nobody acted on.
  return "taken";
}

// The deadline reads the decision file once more first: one published between the last poll and this
// tick is the caller's answer, not an expiry.
function expireApproval(id) {
  if (!openApprovals.has(id)) return;
  const seen = takeDecision(id);
  if (seen !== "taken") closeApproval(id, "decline", "expired", "driver", "deadline", seen);
}

// Everything that ends a request's turn or the run settles it first, so no answer is owed to a turn that
// is over. No decision is taken here: an accept sent as the turn is cut would start a command nobody is
// left to watch, and a valid one already there is recorded as late.
function settleOpenApprovals(why, which = () => true) {
  for (const [id, o] of [...openApprovals]) {
    if (!which(o)) continue;
    const { state } = box.decision(o.record);
    closeApproval(id, "decline", "expired", "driver", why, state === "valid" ? "late" : state);
  }
}

// The mailbox must be a place no granted sandbox can write: strictly inside the state directory, outside
// <tmp>/entrust and every root of this run, by inode. Each launch makes its own, so no other driver writes it.
function checkMailbox(d) {
  const real = resolveDir(d, "--approval-dir");
  const misplaced = mailboxProblem(real, stateDir());
  if (misplaced) fail(EXIT.USAGE, misplaced);
  // None of the driver's own subdirectories may hold a mailbox, and neither may another run's $TMPDIR,
  // which that run's sandbox writes and this run's roots do not cover: a run directory,
  // <state>/reports/<run> or the orchestrate page's, is the only place for one.
  for (const own of [...STATE_SUBDIRS.map(([sub]) => path.join(stateDir(), sub.replace(/\/$/, ""))), ...runTmpBases]) {
    if (insideByInode(real, own))
      fail(EXIT.USAGE, `--approval-dir ${real} lies inside ${own}, which this driver keeps for itself or hands to agents as a writable root: a run there could publish another's decision`);
  }
  const ancestor = agentTempAncestor(real, runTmpNamespace);
  if (ancestor !== null)
    fail(EXIT.USAGE, `--approval-dir ${real} lies inside another agent's temporary grant ${ancestor}: it could publish this run's decision`);
  for (const r of agentRoots())
    if (insideByInode(real, r)) fail(EXIT.USAGE, `--approval-dir ${real} lies inside ${r}, which this agent may write: it could publish its own decision`);
  return real;
}

// The entry every approval request gets, whatever becomes of it. `detail` is the command whole, else the
// reason, else the message; for a file change whose paths an item named, those paths.
function approvalEntry(msg, owner, foreign) {
  const p = msg.params ?? {};
  const started = owner !== null && p.itemId != null ? fileChangeStarts.get(itemKey(owner, p.itemId)) : undefined;
  const fileChanges = msg.method === "item/fileChange/requestApproval" && Array.isArray(started)
    ? started.map((ch) => ({ path: String(ch?.path), kind: ch?.kind?.type ?? String(ch?.kind), move: ch?.kind?.move_path ?? null }))
    : null;
  const detail = fileChanges?.length
    ? fileChanges.map((c) => `${c.kind} ${c.path}${c.move ? ` -> ${c.move}` : ""}`).join("; ")
    : Array.isArray(p.command) ? p.command.join(" ") : String(p.command ?? p.reason ?? p.message ?? "");
  return { id: null, method: msg.method,
    kind: msg.method === "item/commandExecution/requestApproval" ? (p.kind ?? "command") : null,
    detail, thread: owner, subagent: foreign, agentPath: subagentThreads.get(owner ?? "")?.agentPath ?? null,
    cause: null, offered: false, decision: null, by: null, why: null,
    askedAt: new Date().toISOString(), settledAt: null, waitMs: null, resolved: false, outcome: null,
    cwd: p.cwd ?? null, reason: p.reason ?? null, fileChanges };
}

function handleServerRequest(msg) {
  const send = (result) => conn.send({ jsonrpc: "2.0", id: msg.id, result });
  const sendError = (message) => conn.send({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message } });
  // Attribution for REQUESTS must fail closed, and cannot demand ids the schema does not always carry:
  // MCP elicitation has a nullable turnId, and attestation and token refresh carry no ids at all. So a
  // request counts as ours unless it positively proves it belongs to another thread.
  // The legacy applyPatch/execCommand pair identifies its conversation with `conversationId`, not
  // `threadId`; checking only the latter attributed another thread's refusal to us.
  const owner = msg.params?.threadId ?? msg.params?.conversationId ?? null;
  const foreign = rootThreadId !== null && owner != null && owner !== rootThreadId;

  // Refusal shapes differ per method; the enums are pinned in schema-<version>/ServerRequest.json
  // (CommandExecutionApprovalDecision and its siblings). `decline` is only valid for the two item/*
  // approvals — the legacy pair accepts abort|allow|approved, and the permissions request answers with a
  // granted profile rather than a decision at all. The server's own availableDecisions never lists
  // `decline` (P1) and the driver sends it anyway: every production refusal was honoured.
  const REFUSALS = {
    "item/commandExecution/requestApproval": { decision: "decline" },
    "item/fileChange/requestApproval": { decision: "decline" },
    "applyPatchApproval": { decision: "abort" },
    "execCommandApproval": { decision: "abort" },
    "item/permissions/requestApproval": { permissions: { fileSystem: null, network: null } },
  };
  // An MCP form is a request for a human, not for a wider sandbox — declining it is valid, but
  // classifying it as "the sandbox was too small" would send the caller to fix the wrong thing.
  if (msg.method === "mcpServer/elicitation/request") {
    if (!foreign) interactions.push(msg.method);
    send({ action: "decline" });
    return;
  }

  const refusal = REFUSALS[msg.method];
  if (refusal) {
    // One request id is one request, however often it arrives: a second copy would be a second mailbox
    // entry and a second response to an id the server matches once. Said, and not answered again.
    if (entryByRpc.has(msg.id)) {
      process.stderr.write(`entrust: approval request id ${JSON.stringify(msg.id)} (${msg.method}) arrived again; it is one request and is answered once\n`);
      return;
    }
    // Recorded whichever thread asked, and whatever becomes of it. The root-only filter elsewhere exists
    // so a CHILD's command cannot satisfy the gate — that is evidence of success, and evidence of success
    // must be strict. A request is evidence of what the rights did not cover, and that must be inclusive.
    const p = msg.params ?? {};
    const entry = approvalEntry(msg, owner, foreign);
    escalations.push(entry);
    entryByRpc.set(msg.id, entry);
    if (owner !== null && p.itemId != null) entryByItem.set(itemKey(owner, p.itemId), entry);
    const isCommand = msg.method === "item/commandExecution/requestApproval";
    const isFileChange = msg.method === "item/fileChange/requestApproval";
    const isPermissions = msg.method === "item/permissions/requestApproval";
    // Whose request may be answered: the root's, in the turn now running — not merely one this invocation
    // ever owned, since a corrective turn follows on the same thread — and a subagent's the root
    // announced, in its own turn. Whose success counts as evidence is a different question, answered by
    // isRoot and unchanged. A `kind` other than command is input to a terminal already running, which no
    // rule can read as a command.
    const childTurn = itemKey(owner, p.turnId ?? null);
    let why = isPermissions ? PERMISSIONS_WHY
      : !isCommand && !isFileChange ? "legacy method"
      : isCommand && p.kind != null && p.kind !== "command" ? `kind ${p.kind}`
      : owner === null || (owner !== rootThreadId && !subagentThreads.has(owner)) ? "unknown thread"
      : owner === rootThreadId && (p.turnId ?? null) !== rootTurnId ? "not the current turn"
      // A subagent's request counts only inside its own turn, as the root's does: one that arrives after
      // that turn completed answers to nobody.
      : owner !== rootThreadId && !childTurnsOpen.has(childTurn) ? (childTurnsDone.has(childTurn) ? "turn ended" : "not the current turn")
      : settled || pendingCut ? "turn closing"
      : null;
    const covered = why === null && isFileChange && entry.fileChanges !== null ? coveredByRights(entry.fileChanges) : null;
    // A permissions request asks for rights beyond those set at launch, which only a WRITABLE: line grants.
    // A command request is one cause whatever came before it: an attempt the sandbox stopped can leave no
    // trace in the stream (P1), so telling a sandbox refusal from Codex's own rule would be a guess.
    entry.cause = covered !== null ? "rights"
      : isPermissions ? "outside"
      : isCommand || msg.method === "execCommandApproval" ? "asked"
      : "outside";
    // The rights already cover it: the sandbox would have let a shell write the same bytes to the same
    // inode, and the edit tool asked only because it compares spellings. Answered here, armed or not, and
    // looked at once more as the answer goes out; what the server does with the paths after that is its own.
    if (covered !== null && coveredByRights(entry.fileChanges) === covered) {
      settleEntry(entry, "accepted", "driver", RIGHTS_WHY);
      send({ decision: "accept" });
      return;
    }
    if (covered !== null) entry.cause = "outside";
    if (why === null && isFileChange) why = OUTSIDE_WHY;
    if (why === null && approvalDir === null) why = "no channel";
    if (why === null) { offerApproval(msg, entry); return; }
    settleEntry(entry, "declined", "driver", why);
    send(refusal);
    return;
  }

  // Attestation, ChatGPT token refresh, and anything a later version adds. These are not escalations
  // and must not be reported as one; an approval-shaped result would be invalid, so answer with an
  // honest JSON-RPC error.
  if (!foreign) interactions.push(msg.method);
  sendError(`${msg.method} is not supported by entrust`);
}

// A response to one of this driver's own requests. Synchronous throughout, and it must stay that way:
// see the root-id assignment below.
function handleResponse(msg) {
  // Taken before anything is resolved, so the ids below are assigned while this line's chunk is still
  // being dispatched.
  const p = conn.take(msg.id);
  if (!p) return;
  // Assign the root ids HERE, synchronously, not in the await continuation. The parser dispatches every
  // line of one stdout chunk in a single synchronous burst, so notifications sharing a chunk with this
  // response would otherwise be handled while the id is still null — and the filters would let a
  // foreign thread's events through.
  if (msg.result && (p.method === "thread/start" || p.method === "thread/resume")) {
    rootThreadId = msg.result.thread?.id ?? null;
    selectedModel = msg.result.model ?? null;
    selectedEffort = msg.result.reasoningEffort ?? null;
  }
  if (msg.result && p.method === "turn/start") {
    rootTurnId = msg.result.turn?.id ?? null;
    if (rootTurnId !== null) ownedTurns.add(rootTurnId);
    replayEarly();          // anything that shared this chunk can now be attributed
  }
  if (msg.error) {
    // -32601 means the server does not know a method this driver sends, which after a codex upgrade is
    // the single most likely failure — and as a raw JSON blob under a generic transport error it reads
    // as a crash rather than as protocol drift. Name it and say what to do.
    const e = new Error(msg.error.code === -32601
      ? `the server does not support ${p.method} (JSON-RPC -32601): your codex and this plugin have ` +
        `drifted apart. Update the plugin, or pin codex to ${PINNED_CODEX}, the version it was measured against.`
      : `${p.method}: ${JSON.stringify(msg.error)}`);
    e.rpcCode = msg.error.code;
    p.reject(e);
  } else p.resolve(msg.result);
}

// Everything the ROOT thread's completed items contribute to the report: the commands and their
// server-side parse, the answer, the reasoning summaries, the item types the gates ignore, and the
// file changes. Root-only by the caller's filter, because evidence of success has to be strict.
function recordRootItem(it, p) {
  // commandActions is the server's own parse of the command, and it is load-bearing: `command` is the
  // WRAPPER the server ran (`/bin/zsh -c '<script>'` in every live turn), not the command the model
  // wrote. Kept as bare strings — one entry means one command, several mean a pipeline.
  if (it?.type === "commandExecution") {
    // durationMs is the server's own measurement of how long the command took; the report subtracts it
    // from the wall clock to say how much of the run was the MODEL rather than the work it ordered.
    commands.push({ command: String(it.command), exitCode: it.exitCode, status: it.status,
                    durationMs: typeof it.durationMs === "number" ? it.durationMs : null,
                    actions: (Array.isArray(it.commandActions) ? it.commandActions : []).map((a) => String(a?.command ?? "")) });
    // The volume cap, and the analogue of a native subagent's maxTurns: with no wall clock, a turn that
    // loops — retrying one command shape forever, or walking a tree that never ends — is bounded by
    // nothing else, because a loop is not silence and each iteration costs few tokens. Counted on root
    // commands only, like every other piece of evidence.
    if (opts.maxCommands && commands.length >= opts.maxCommands)
      cutTurn("maxCommands", "commands", { limit: opts.maxCommands, observed: commands.length });
  }
  if (it?.type === "agentMessage") {
    // The accumulator goes with the message it belonged to: a partial may only ever describe a message
    // the server never finished, and a long turn must not carry every message it already delivered.
    if (it.id !== undefined) answerDeltas.delete(String(it.id));
    // Since 0.153.0 request_user_input_async arrives as an agentMessage with questions, not a server request;
    // measured on 0.153.4 (gpt-6-astra), its phase is final_answer.
    // Record it as interaction rather than answer text: it requires input no sandbox change can supply.
    const questions = Array.isArray(it.questions) ? it.questions.filter((q) => typeof q?.title === "string") : [];
    if (questions.length) {
      interactions.push(`item/agentMessage/questions: ${questions.map((q) => q.title).join(" | ").slice(0, 200)}`);
    } else if (it.text) {
      messages.push({ text: it.text, phase: it.phase ?? null, turnId: turnIdOf(p) });
      // Written the moment it arrives rather than at finish(): a SIGKILL after the answer exists must
      // not take it with the process. classifyEvidence rewrites the file with the final choice.
      if ((it.phase ?? null) === null || it.phase === "final_answer") persistAnswer(it.text);
    }
  }
  // The summary is the same artefact a Claude subagent's transcript exposes as its thinking; bounded,
  // because reasoning can be long and the report is not the place for a novel.
  if (it?.type === "reasoning") {
    const s = Array.isArray(it.summary) ? it.summary.join("\n") : String(it.summary ?? "");
    if (s.trim() && reasoningSummaries.length < 40) reasoningSummaries.push(s.slice(0, 2000));
  }
  // Count other item types so tool and subagent activity stays visible.
  // Exclude userMessage: it echoes the caller's prompt and must not count as work or suppress a transient retry.
  if (it?.type && !["commandExecution", "agentMessage", "fileChange", "reasoning", "userMessage"].includes(it.type)) {
    otherItemCounts[it.type] = (otherItemCounts[it.type] ?? 0) + 1;
    if (otherItems.length < 50) {
      const detail = String(it.query ?? it.tool ?? it.server ?? "").slice(0, 120);
      otherItems.push({ type: it.type, ...(detail ? { detail } : {}) });
    }
  }
  // FileChangeThreadItem carries changes and status; report failed and declined patches as evidence,
  // just as failed commands are reported.
  if (it?.type === "fileChange") {
    for (const ch of it.changes ?? [])
      // PatchChangeKind is a oneOf of OBJECTS ({type:"add"} / {type:"delete"} / {type:"update",move_path}).
      // Extract the type and rename destination so the report names the file that exists after the change.
      fileChanges.push({ path: String(ch.path), kind: ch.kind?.type ?? String(ch.kind),
                         move: ch.kind?.move_path ?? null, status: it.status });
  }
}

function handleMessage(msg, bytes = 0) {
  if (msg.id !== undefined && !msg.method) return handleResponse(msg);
  // A request is the turn asking us something, which is as alive as a notification.
  if (msg.id !== undefined && msg.method) { touchIdle(); return handleServerRequest(msg); }

  const p = msg.params;
  // Before the early-hold below: an event held for want of a turn id is still the thread speaking.
  if (msg.method && onRootThread(p)) touchIdle();

  // Turn-scoped notifications that arrive before the turn id is known are held, not judged.
  const turnScoped = msg.method === "item/completed" || msg.method === "turn/completed"
    || msg.method === "turn/diff/updated";
  if (turnScoped && rootTurnId === null) {
    earlyBytes += bytes;
    if (early.length >= LIMITS.EARLY_MAX_ITEMS || earlyBytes > LIMITS.EARLY_MAX_BYTES)
      return abort(EXIT.TRANSPORT, `the server sent ${early.length} turn-scoped notification(s) (${earlyBytes} bytes) before answering turn/start; refusing to buffer more`);
    early.push(msg);
    return;
  }

  // A subagent thread the server started under ours: registered so its activity is visible in the
  // report rather than invisibly filtered. Evidence attribution stays root-only — a child's command is
  // never proof of OUR work — but a coordinator deserves to know the children existed and how busy
  // they were.
  // Measured on 0.153.4: a child NEVER sends thread/started to the client. The root announces it first,
  // as a subAgentActivity item naming the child's agentThreadId and agentPath, and the child then sends
  // everything else under its own threadId. That announcement is the registration, and it arrives twice
  // (item/started and item/completed of one item), so the thread id, not the item, is the key.
  if ((msg.method === "item/started" || msg.method === "item/completed")
      && p?.item?.type === "subAgentActivity" && p.item.agentThreadId && isRoot(p)) {
    const id = String(p.item.agentThreadId);
    const t = subagentThreads.get(id) ?? { agentPath: null, status: null, items: 0, commands: 0 };
    subagentThreads.set(id, t);
    // The announcement fills what a thread/started could not: a server that sends both registers the
    // child first by thread and names it here, in either order.
    if (t.agentPath == null && p.item.agentPath) t.agentPath = p.item.agentPath;
    if (t.status == null && p.item.kind) t.status = p.item.kind;
    // A child that ends says so on the root: the last kind wins, so an interrupted child is not
    // reported as one that finished.
    if (p.item.kind === "completed" || p.item.kind === "interrupted") t.status = p.item.kind;
  }
  // The older shape, kept because a server that announces children as threads of their own is the one
  // this driver was written against: agentPath and status are things only the announcement carries.
  if (msg.method === "thread/started" && p?.thread?.parentThreadId && rootThreadId !== null
      && p.thread.parentThreadId === rootThreadId && !subagentThreads.has(p.thread.id))
    subagentThreads.set(p.thread.id, { agentPath: null, status: null, items: 0, commands: 0 });
  if (msg.method === "item/completed" && subagentThreads.has(p?.threadId ?? "")) {
    const t = subagentThreads.get(p.threadId);
    t.items++;
    if (p.item?.type === "commandExecution") t.commands++;
  }

  // What the approval entries need from the stream: the paths a file change names, which arrive only on
  // its item/started; the server's receipt of an answer; and what the item did once answered. On the root
  // and on announced subagent threads alike, since both may ask.
  const ours = rootThreadId !== null && ((p?.threadId ?? null) === rootThreadId || subagentThreads.has(p?.threadId ?? ""));
  if (msg.method === "item/started" && ours && p.item?.type === "fileChange" && p.item.id != null && Array.isArray(p.item.changes))
    fileChangeStarts.set(itemKey(p.threadId, p.item.id), p.item.changes);
  if (msg.method === "item/completed" && ours && p.item?.id != null) {
    const key = itemKey(p.threadId, p.item.id);
    fileChangeStarts.delete(key);
    const e = entryByItem.get(key);
    if (e && e.outcome === null)
      e.outcome = { status: p.item.status ?? null, exitCode: typeof p.item.exitCode === "number" ? p.item.exitCode : null,
                    durationMs: typeof p.item.durationMs === "number" ? p.item.durationMs : null };
  }
  if (msg.method === "serverRequest/resolved") {
    const e = entryByRpc.get(p?.requestId);
    if (e && (p?.threadId == null || p.threadId === e.thread)) e.resolved = true;
  }
  // Every other thread's turns, as they open and close: whether a subagent's request belongs to a turn of
  // its own still running. Recorded for threads not yet announced too, since a child's turn can open before
  // the root's announcement of it arrives.
  if ((msg.method === "turn/started" || msg.method === "turn/completed") && rootThreadId !== null
      && p?.threadId && p.threadId !== rootThreadId && p.turn?.id != null) {
    const key = itemKey(p.threadId, p.turn.id);
    if (msg.method === "turn/started" && !childTurnsDone.has(key)) childTurnsOpen.add(key);
    if (msg.method === "turn/completed") { childTurnsOpen.delete(key); childTurnsDone.add(key); }
  }
  // A subagent's own turn ending settles the requests it left open; the root's ending is below.
  if (msg.method === "turn/completed" && subagentThreads.has(p?.threadId ?? ""))
    settleOpenApprovals("turn ended", (o) => o.entry.thread === p.threadId
      && (p.turn?.id == null || o.record.run.turnId === p.turn.id));

  if (msg.method === "item/completed" && isRoot(p)) recordRootItem(p.item, p);
  // The one delta stream opted into (initializeParams says why).
  if (msg.method === "item/agentMessage/delta" && isRoot(p)) {
    const id = String(p?.itemId ?? "");
    const prev = answerDeltas.get(id);
    if (prev !== undefined || answerDeltas.size < LIMITS.PARTIAL_MAX_ITEMS)
      answerDeltas.set(id, `${prev ?? ""}${String(p?.delta ?? "")}`.slice(0, LIMITS.PARTIAL_MAX_CHARS));
  }

  if (msg.method === "turn/diff/updated" && isRoot(p)) persistTurnDiff(p);

  // Best-effort accounting: what this agent cost, straight from the server. Only the root thread's
  // usage counts — a subagent thread's tokens are its own. `total` is the root thread's token use for the
  // current turn, per turn as of codex 0.153.4 (measured 2026-09-15); to cost a thread, sum one report per
  // turn. `last` is the most recent API request within it.
  if (msg.method === "thread/tokenUsage/updated" && rootThreadId !== null && (p?.threadId ?? null) === rootThreadId)
    tokenUsage = p?.tokenUsage ?? null;

  // Only our unsettled turn's completion may end the run; late or foreign completions must not
  // change its status or start a corrective turn after it has reported.
  if (msg.method === "turn/completed" && isRoot(p)) {
    if (settled) return;
    // Before anything that could start another turn: an answer owed to a turn that is over is one the
    // server can no longer use, and a decision for it published later is late, not the next turn's.
    settleOpenApprovals("turn ended");
    turnStatus = p?.turn?.status ?? "unknown";
    // Populated only when the turn failed, and it carries an enumerated cause worth acting on:
    // serverOverloaded / internalServerError / the transport causes -> retried below, once (RETRYABLE);
    // contextWindowExceeded -> the handoff was too large, split it; unauthorized -> stop;
    // sandboxError -> the rights level was wrong; usageLimitExceeded and rateLimitExceeded (0.153.4)
    // -> a quota, not a blip.
    turnError = p?.turn?.error ?? null;
    // A cut is a decision already taken. The completion that lands inside the grace ENDS the run: a
    // transient retry or a corrective turn here would start new work on a budget that is already spent.
    if (pendingCut) {
      pendingCut.completedInGrace = true;
      if (cutGraceTimer) clearTimeout(cutGraceTimer);
      finish(pendingCut.reason);
      return;
    }
    // Retry a transient failure once only before any observable work, including tool calls and subagents,
    // to avoid repeating side effects; the wall clock must leave the backoff plus TRANSIENT_TURN_MIN_MS.
    if (turnStatus === "failed" && transientRetries.length === 0 && lastTurnParams !== null
        && RETRYABLE[errKind(turnError)] !== undefined
        && commands.length === 0 && fileChanges.length === 0 && messages.length === 0
        && otherItems.length === 0 && subagentThreads.size === 0
        // An accepted request is work done outside the sandbox whatever the stream then said of it.
        && !escalations.some((e) => e.decision === "accepted")
        && (!(opts.timeout > 0)
            || startedAtMs + opts.timeout * 1000 - Date.now() > RETRYABLE[errKind(turnError)] + LIMITS.TRANSIENT_TURN_MIN_MS)) {
      startTransientRetry(errKind(turnError));
      return;
    }
    // Under --output-schema a completed turn whose answer misses the shape gets ONE corrective turn on
    // the same thread — the validation errors and nothing else — mirroring the retry a Claude
    // subagent's tool layer provides. The commands and evidence of the first turn stay counted.
    // outputAttempts counts turns STARTED (set in main and in startCorrectiveTurn), so a corrective
    // turn cut off by the deadline is still an attempt the report admits to.
    if (opts.outputSchema && turnStatus === "completed") {
      const errs = answerSchemaErrors(currentFinalAnswer());
      if (errs.length && outputAttempts < 2) {
        if (errs.some((e) => /maxLength|maxItems/.test(e)))
          sizeAttemptPath = persistAnswer(currentFinalAnswer(), ".attempt1");
        startCorrectiveTurn(errs); return;
      }
    }
    finish();
  }
}

// Share final-answer selection between finish() and schema retry, judging newest turns first
// so an unphased corrective answer can supersede an earlier turn's phased prose.
function currentFinalMsg() {
  const pick = (ms) => {
    const nonBlank = ms.filter((m) => String(m.text).trim());
    const phased = nonBlank.filter((m) => m.phase === "final_answer");
    return phased.at(-1) ?? (nonBlank.every((m) => m.phase == null) ? nonBlank.at(-1) ?? null : null);
  };
  const turns = [...new Set(messages.map((m) => m.turnId))];
  for (let i = turns.length - 1; i >= 0; i--) {
    const found = pick(messages.filter((m) => m.turnId === turns[i]));
    if (found) return found;
  }
  return null;
}
const currentFinalAnswer = () => currentFinalMsg()?.text ?? "";

// A deliberately SHALLOW validator — type, required, properties, enum, items and size caps — not a JSON Schema
// implementation. The server already constrains generation with the full schema; this is the driver's
// independent check of the load-bearing subset, kept small enough to trust without a dependency.
// Unknown keywords are ignored, which fails OPEN for exotic schemas: say so rather than pretend.
function schemaErrors(value, schema, at = "$") {
  const errs = [];
  const typeOf = (v) => Array.isArray(v) ? "array" : v === null ? "null" : typeof v;
  const t = schema?.type;
  if (t !== undefined) {
    const types = Array.isArray(t) ? t : [t];
    const vt = typeOf(value);
    const ok = types.includes(vt) || (vt === "number" && types.includes("integer") && Number.isInteger(value));
    if (!ok) { errs.push(`${at}: expected ${types.join("|")}, got ${vt}`); return errs; }
  }
  // Compare enum members structurally so object key order does not change validity.
  if (Array.isArray(schema?.enum) && !schema.enum.some((e) => deepEqual(e, value)))
    errs.push(`${at}: not one of the permitted values`);
  if (typeOf(value) === "string" && schema?.maxLength !== undefined && [...value].length > schema.maxLength)
    errs.push(`${at}: ${[...value].length} characters, maxLength ${schema.maxLength}`);
  if (typeOf(value) === "array" && schema?.maxItems !== undefined && value.length > schema.maxItems)
    errs.push(`${at}: ${value.length} entries, maxItems ${schema.maxItems}`);
  if (typeOf(value) === "object") {
    // Use hasOwn so an inherited Object.prototype property cannot satisfy required.
    for (const k of schema?.required ?? []) if (!Object.hasOwn(value, k)) errs.push(`${at}.${k}: required and missing`);
    // Validate only own properties; inherited Object.prototype members are not fields of the JSON answer.
    for (const [k, sub] of Object.entries(schema?.properties ?? {})) if (Object.hasOwn(value, k)) errs.push(...schemaErrors(value[k], sub, `${at}.${k}`));
    // The strict schema the server demands says no extra keys; check it here too rather than declaring
    // it unchecked, so outputSchemaOk means the same thing the server enforced.
    if (schema?.additionalProperties === false) {
      const known = new Set(Object.keys(schema?.properties ?? {}));
      for (const k of Object.keys(value)) if (!known.has(k)) errs.push(`${at}.${k}: not permitted by the schema (additionalProperties is false)`);
    }
  }
  if (typeOf(value) === "array" && schema?.items && !Array.isArray(schema.items))
    value.forEach((v, i) => errs.push(...schemaErrors(v, schema.items, `${at}[${i}]`)));
  return errs;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]));
}

function answerSchemaErrors(text) {
  const parsed = parseAnswerJson(text);
  // Use the parse-error field to distinguish valid JSON null from a parse failure.
  if (parsed.answerJson === null && parsed.answerJsonError !== null)
    return [`the answer is not valid JSON: ${parsed.answerJsonError}`];
  // The contract is one bare OBJECT, independent of how lax the schema is: an array, a scalar or null
  // parses as JSON but is never an acceptable answer shape.
  if (parsed.answerJson === null || typeof parsed.answerJson !== "object" || Array.isArray(parsed.answerJson))
    return ["the answer is valid JSON but not an object"];
  return schemaErrors(parsed.answerJson, opts.outputSchema);
}

// The backoff per transient cause, from CodexErrorInfo in the pinned schema (errKind() flattens the object
// variants). Absent on purpose: the quota limits, which no ten seconds clears, and
// responseTooManyFailedAttempts, which codex has already retried.
const RETRYABLE = {
  responseStreamDisconnected: 2000, responseStreamConnectionFailed: 2000, httpConnectionFailed: 2000,
  internalServerError: 5000, serverOverloaded: 10000,
};
function startTransientRetry(cause) {
  const delayMs = RETRYABLE[cause];
  transientRetries.push({ cause, delayMs });
  process.stderr.write(`entrust: turn failed with ${cause}; retrying once in ${delayMs / 1000}s\n`);
  // Hold the new turn's events until its id arrives, exactly as at startup and in the corrective turn.
  rootTurnId = null;
  // Ref'd on purpose: the timer must fire even if every pipe momentarily goes quiet.
  setTimeout(() => {
    if (settled) return;
    requestFn("turn/start", lastTurnParams).catch((e) => {
      if (settled) return;
      process.stderr.write(`entrust: the retry failed to start (${e.message}); reporting the original failure\n`);
      turnStatus = "failed";
      finish();
    });
  }, delayMs);
}

function startCorrectiveTurn(errs) {
  // Hold the new turn's events until its id arrives, exactly as at startup — without this, an item
  // racing the turn/start response would be judged against the OLD turn id and dropped.
  rootTurnId = null;
  outputAttempts++;
  process.stderr.write(`entrust: the answer failed schema validation (${errs.length} error(s)); spending the corrective turn\n`);
  requestFn("turn/start", {
    threadId: rootThreadId,
    input: [{ type: "text", text:
      `Your final answer did not match the required JSON schema. Errors:\n- ${errs.slice(0, 8).join("\n- ")}\n` +
      "If a field is too long, put its whole content in a file under $TMPDIR and name that file in artifacts; leave a summary of every material finding in the field. Reply again with ONE corrected JSON object and nothing else — no prose before or after, no code fence.",
      text_elements: [] }],
    model: opts.model ?? null, effort: null,
    outputSchema: opts.serverSchema
  }).catch((e) => {
    // If corrective turn/start is refused, report the first turn's answer and schemaErrors with exit 13;
    // its completed evidence must not be lost to a transport-only abort.
    if (settled) return;
    process.stderr.write(`entrust: the corrective turn failed to start (${e.message}); reporting the first attempt\n`);
    turnStatus = "completed";
    finish();
  });
}

// --output-schema asks for the shape and reports whether it arrived, a parse failure apart from a null field.
// A code fence is stripped: it is the commonest way a good JSON answer comes back.
function parseAnswerJson(text) {
  if (typeof text !== "string" || text.trim() === "") return { answerJson: null, answerJsonError: "no answer" };
  const fenced = text.trim().match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/);
  const body = fenced ? fenced[1] : text.trim();
  try { return { answerJson: JSON.parse(body), answerJsonError: null }; }
  catch (e) { return { answerJson: null, answerJsonError: e.message }; }
}

function clipToSchema(value, schema, at = "$") {
  const clipped = [];
  const walk = (v, s, p) => {
    if (typeof v === "string" && Number.isInteger(s?.maxLength) && [...v].length > s.maxLength) {
      clipped.push({ path: p, limit: s.maxLength, length: [...v].length });
      return [...v].slice(0, s.maxLength).join("");
    }
    if (Array.isArray(v)) {
      const max = Number.isInteger(s?.maxItems) ? s.maxItems : v.length;
      if (v.length > max) clipped.push({ path: p, limit: max, length: v.length });
      return v.slice(0, max).map((item, i) => walk(item, s?.items, `${p}[${i}]`));
    }
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v)
      .map(([key, item]) => [key, walk(item, s?.properties?.[key], `${p}.${key}`)]));
    return v;
  };
  return { value: walk(value, schema, at), clipped };
}

// The rollout under ~/.codex/sessions is the receipt a wrapper cannot forge. It is OPENED and its first
// record, session_meta, must name this thread: a filename match is as strong as `touch`. Absence alone is no
// proof of fabrication (an older resumed thread). $ENTRUST_SESSIONS_DIR moves the root, for the suites.
function findRollout(threadId) {
  if (!threadId) return null;
  try {
    const base = process.env.ENTRUST_SESSIONS_DIR
      || path.join(os.userInfo().homedir, ".codex", "sessions");
    for (let back = 0; back < LIMITS.RECEIPT_LOOKBACK_DAYS; back++) {
      const d = new Date(Date.now() - back * 86400000);
      const dir = path.join(base, String(d.getFullYear()),
        String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0"));
      let names;
      try { names = fs.readdirSync(dir); } catch { continue; }
      const hit = names.find((n) => n.startsWith("rollout-") && n.includes(threadId));
      if (!hit) continue;
      const p = path.join(dir, hit);
      const res = { path: p, verified: false, originator: null, modelProvider: null, cwd: null,
                    why: "the first record could not be read" };
      // Bounded, and only the first line: a rollout of a long turn is megabytes, and everything this
      // needs is in its opening record.
      let head = "";
      try {
        const fd = fs.openSync(p, "r");
        try {
          const buf = Buffer.alloc(LIMITS.RECEIPT_HEAD_BYTES);
          head = buf.subarray(0, fs.readSync(fd, buf, 0, LIMITS.RECEIPT_HEAD_BYTES, 0)).toString("utf8");
        } finally { fs.closeSync(fd); }
      } catch (e) { res.why = `the rollout could not be opened (${e.code ?? e.message})`; return res; }
      const firstLine = head.split("\n")[0] ?? "";
      let meta = null;
      try { meta = JSON.parse(firstLine); } catch { res.why = "the first record is not JSON"; return res; }
      const pay = meta?.payload ?? {};
      const id = pay.id ?? pay.session_id ?? null;
      if (meta?.type !== "session_meta") { res.why = `the first record is ${JSON.stringify(meta?.type ?? null)}, not session_meta`; return res; }
      if (id !== threadId) { res.why = `the rollout's session id is ${JSON.stringify(id)}, not this thread`; return res; }
      res.verified = true;
      res.why = null;
      res.originator = typeof pay.originator === "string" ? pay.originator : null;
      res.modelProvider = typeof pay.model_provider === "string" ? pay.model_provider : null;
      res.cwd = typeof pay.cwd === "string" ? pay.cwd : null;
      return res;
    }
  } catch {}
  return null;
}

// codexErrorInfo is a bare string or a one-key tagged object; reading .type gives "unknown".
// The driver's record of what it handed back, best-effort: a write error costs the path. `suffix` names the
// artefact ("" the answer, ".commentary", ".partial"); the file is named for the run, not the thread, which
// a --resume continues.
function persistAnswer(text, suffix = "") {
  if (!text) return null;
  try {
    const dir = answersDir();
    const name = `${rootThreadId ?? `no-thread-${process.pid}`}-${startedAtMs}${suffix}.md`;
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    fs.writeFileSync(path.join(dir, name), text, { mode: 0o600 });
    pruneDir(dir);
    return path.join(dir, name);
  } catch { return null; }
}

function persistTurnDiff(payload) {
  if (typeof payload?.diff !== "string" || !rootThreadId) return;
  try {
    const dir = answersDir();
    const target = path.join(dir, `${rootThreadId}.diff`);
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    fs.writeFileSync(target, payload.diff, { mode: 0o600 });
    pruneDir(dir);
    turnDiffPath = target;
  } catch { turnDiffPath = null; }
}

// Prune by PRUNE_DAYS and PRUNE_MAX_ENTRIES, always keeping the newest entry. Named for the directory
// rather than for the answers: the job records are pruned by it too.
function pruneDir(dir) {
  try {
    const now = Date.now();
    const entries = fs.readdirSync(dir)
      .map((n) => { try { return { n, t: fs.statSync(path.join(dir, n)).mtimeMs }; } catch { return null; } })
      .filter(Boolean).sort((a, b) => b.t - a.t);
    for (const [i, e] of entries.entries()) {
      if (i === 0 || (now - e.t <= LIMITS.PRUNE_DAYS * 86400000 && i < LIMITS.PRUNE_MAX_ENTRIES)) continue;
      try { fs.rmSync(path.join(dir, e.n), { force: true }); } catch {}
    }
  } catch {}
}

// Cuts on a line boundary and says where the rest is, because an answer that stops mid-sentence with no
// forwarding address is worse than a long one.
function clip(text, maxLines, maxBytes, where) {
  const lines = text.split("\n");
  let out = lines.length > maxLines ? lines.slice(0, maxLines).join("\n") : text;
  const marker = (body) => `${body}\n\n[clipped: ${lines.length} lines, ${Buffer.byteLength(text, "utf8")} bytes${where ? ` — full answer at ${where}` : ""}]`;
  // Enforce BRIEF_BYTES in bytes, not UTF-16 units, including the clipping marker inside the cap.
  const ELLIPSIS = "…";
  const budget = Math.max(0, maxBytes - Buffer.byteLength(marker(""), "utf8") - Buffer.byteLength(ELLIPSIS, "utf8"));
  if (Buffer.byteLength(out, "utf8") > budget) {
    out = Buffer.from(out, "utf8").subarray(0, budget).toString("utf8").replace(/�$/, "") + ELLIPSIS;
  }
  if (out === text) return text;
  return marker(out);
}

// The server nests the upstream API error as a JSON STRING inside turnError.message, so the useful part —
// which parameter, and what it would have accepted — is invisible to a caller reading errKind alone.
function invalidRequest(e) {
  // Check both the enumerated codexErrorInfo and the upstream API error nested as JSON for a bad request.
  if (e?.codexErrorInfo === "badRequest") return true;
  try { return JSON.parse(e?.message ?? "")?.error?.type === "invalid_request_error"; }
  catch { return false; }
}

function errKind(e) {
  const i = e?.codexErrorInfo ?? e?.type;
  if (typeof i === "string") return i;
  if (i && typeof i === "object") return Object.keys(i)[0] ?? "unknown";
  return "unknown";
}

// Send turn/interrupt without awaiting a reply; shutdown() flushes stdin and allows time for the server
// to record the interruption before teardown.
// TurnInterruptParams requires turnId, so cancellation before turn/start replies cannot send an interrupt.
function interruptTurn() {
  const turnId = rootTurnId ?? [...ownedTurns].at(-1) ?? null;
  if (!child || !rootThreadId || !requestFn || turnId === null) return;
  try { requestFn("turn/interrupt", { threadId: rootThreadId, turnId }).catch(() => {}); } catch {}
}

// The one way a run is ended from outside the turn: interrupt, then report when the turn closes or the grace
// expires. `kind` names the budget (wall, idle, commands); null is a signal. The grace is for the thread's
// resumability, not the answer, which the server discards (the deltas are kept instead).
function cutTurn(reason, kind, { limit = null, observed = null, graceMs = null, signal = null } = {}) {
  if (settled || pendingCut) return;
  // Use a quarter of the wall clock, bounded by CUT_GRACE_MIN_MS and CUT_GRACE_MAX_MS;
  // without a wall clock, allow CUT_GRACE_MAX_MS for the server to close the turn.
  const grace = graceMs ?? (opts.timeout > 0 ? Math.min(LIMITS.CUT_GRACE_MAX_MS, Math.max(LIMITS.CUT_GRACE_MIN_MS, opts.timeout * 250)) : LIMITS.CUT_GRACE_MAX_MS);
  pendingCut = { reason, kind, limit, observed, completedInGrace: false };
  process.stderr.write(`entrust: cutting the turn (${kind ?? reason}); ${grace}ms for the server to close it\n`);
  // Before the interrupt, on the same pipe the server reads in order, so the decline is what it acts on
  // first and no request of the cut turn is left answering to nobody.
  settleOpenApprovals(kind ? `cut ${kind}` : signal ? `signal ${signal}` : `cut ${reason}`);
  interruptTurn();
  cutGraceTimer = setTimeout(() => finish(reason), grace);
  cutGraceTimer.unref?.();
}

// What the model actually ran, out from under the shell the server wrapped it in. Every live
// commandExecution arrives as `<shell> -c '<script>'` — measured: `/bin/zsh -c true`,
// `/bin/zsh -c 'grep -q zzz /dev/null'`, `/bin/zsh -lc "git status --short && ..."` — with the script
// also parsed into commandActions.
// EXACTLY ONE action is the server saying this line is one command, and its text is authoritative: it
// survives quoting no hand strip can undo (measured: `-lc "... rg -n \"clamp\\(\" ..."`). Several
// actions mean a pipeline, and then the whole script — pipe and all — is what has to be judged, which
// is what the wrapper text carries.
const SHELL_WRAP_RE = /^\s*(?:\S*\/)?(?:sh|bash|zsh|dash|ksh)(?:\s+-[A-Za-z]+)+\s+([\s\S]+)$/;
function bareCommand(c) {
  const actions = c.actions ?? [];
  // The server's parse is trusted only where it cannot launder anything: a raw command carrying a
  // NEWLINE is a script, whatever the parse says, and a single tidy action extracted from it would let
  // "probe on line 1, failed test suite on line 2" be read as a probe answering no.
  if (actions.length === 1 && !/[\n\r]/.test(String(c.command))) return actions[0];
  const m = SHELL_WRAP_RE.exec(String(c.command));
  if (!m) return String(c.command);
  const arg = m[1].trim();
  return /^'[^']*'$/.test(arg) || /^"[^"]*"$/.test(arg) ? arg.slice(1, -1) : arg;
}

// Classify the evidence once from event streams and opts; persisting the answer log is its only side effect.
function classifyEvidence() {
  // Every root command item, whatever its verdict: the floor rung asks whether the turn ran anything,
  // and a declined one is already a higher rung.
  const commandsRan = commands.length;
  // Require a command that actually succeeded; an exit code alone is not evidence of success.
  const ran = commands.filter((c) => c.status === "completed" && c.exitCode === 0);
  // CommandExecutionStatus can be failed even with a null exitCode, so classify both fields:
  // failed commands must not disappear into the blocked set the exit ladder ignores.
  const verdictFailed = (c) => c.status === "failed" || c.status === "declined";
  const blocked = commands.filter((c) => !verdictFailed(c) && typeof c.exitCode !== "number");
  // A probe whose exit code answers a QUESTION is not a failed command: grep/rg exit 1 for "no match",
  // test/[ for "false", diff/cmp for "the files differ" — each reserves 2 for real trouble. Exit 1
  // EXACTLY, and only a PLAIN probe command: a pipe, a compound or a substitution keeps failure
  // semantics, because its exit 1 may be someone else's. `declined` is an approval refusal whatever the
  // code says, and never a probe answer.
  // \n and \r are excluded for the same reason: codex routinely sends multi-line `bash -lc` scripts, and
  // without them "grep -q needle file\npnpm test" reads as a plain probe, laundering a failed suite into
  // "the probe answered no".
  // Matched against the bare command, never the wrapper (bareCommand says why).
  const PROBE_RE = /^\s*(?:grep|rg|egrep|fgrep|test|\[|diff|cmp|git\s+(?:diff|grep))(?:\s[^|&;`$\n\r]*)?$/;
  const probeNegative = (c) => c.status !== "declined" && c.exitCode === 1 && PROBE_RE.test(bareCommand(c));
  const probeNegatives = commands.filter(probeNegative);
  // Keep failed commands visible so the report can expose an answer that claims a failed suite passed.
  const failedCmds = commands.filter((c) => !probeNegative(c) && (verdictFailed(c) || (typeof c.exitCode === "number" && c.exitCode !== 0)));
  // Reported apart from the failures: a declined command never ran.
  const declinedCmds = commands.filter((c) => c.status === "declined");
  // Count failed and declined patches so the exit ladder can report them alongside failed commands.
  const failedPatches = fileChanges.filter(verdictFailed);
  // Events can only show that SOMETHING succeeded, never that the right thing did — Codex opens most
  // turns by reading its own skill files, and that alone satisfies any generic gate. --expect-command
  // is the caller declaring what the evidence must look like.
  // Both the wrapper and the bare command: an anchored pattern needs the bare one, a substring may need the wrapper.
  const matchesExpectation = (c) =>
    opts.expectRe.test(c.command) || opts.expectRe.test(bareCommand(c)) ||
    (c.actions ?? []).some((a) => opts.expectRe.test(a));
  const expected = opts.expectRe ? ran.filter(matchesExpectation) : ran;
  // Record commands whose last stage is a pager: the model saw only the slice of evidence it requested.
  const PAGER_TAIL_RE = /\|\s*(?:head|tail|less|more)\b[^|]*$/;
  const pipedToPager = commands.filter((c) => (c.status === "completed" || c.status === "failed")
    && (PAGER_TAIL_RE.test(bareCommand(c)) || PAGER_TAIL_RE.test(String(c.command))));
  // Only a final_answer counts. Falling back to the last message of any phase turns the model's
  // thinking-out-loud into the deliverable, and the run reports success on commentary.
  // The schema permits phase: null, and older servers omit it. Prefer an explicit final_answer; fall back
  // to the last non-blank unphased message only when nothing was phased at all.
  const final = currentFinalMsg();
  const fullAnswer = final?.text ?? "";
  // Recomputed here rather than trusted from the retry path: a timeout or failed turn never reached
  // that path, and the verdict must describe the answer this report actually carries.
  const schemaErrs = opts.outputSchema && fullAnswer ? answerSchemaErrors(fullAnswer) : opts.outputSchema ? ["no answer arrived"] : null;
  const answerPath = persistAnswer(fullAnswer);
  // What the model had written when the turn was cut. Never promoted to `answer`: it is unfinished text
  // the model never chose to deliver, and a coordinator that cannot tell the two apart will act on half
  // a sentence. Newest in-flight message first; a completed one has already deleted its accumulator.
  const partialText = fullAnswer ? "" : [...answerDeltas.values()].reverse().find((t) => t.trim()) ?? "";
  const answerPartialPath = persistAnswer(partialText, ".partial");
  const answerPartial = partialText ? (opts.brief ? clip(partialText, LIMITS.BRIEF_LINES, LIMITS.BRIEF_BYTES, answerPartialPath) : partialText) : null;
  // Capped only when asked. A caller who did not ask for --brief gets exactly what the model said, because
  // silently truncating an answer is how a coordinator ends up acting on half a sentence.
  const sizeOverflow = schemaErrs?.some((e) => /maxLength|maxItems/.test(e)) ?? false;
  const parsed = sizeOverflow ? parseAnswerJson(fullAnswer) : null;
  const bounded = sizeOverflow && parsed?.answerJson && typeof parsed.answerJson === "object"
    ? clipToSchema(parsed.answerJson, opts.outputSchema) : null;
  const answer = bounded ? JSON.stringify(bounded.value)
    : opts.brief ? clip(fullAnswer, LIMITS.BRIEF_LINES, LIMITS.BRIEF_BYTES, answerPath) : fullAnswer;
  const commentaryOnly = !final && messages.length > 0;
  // A turn that said things but answered nothing: the rollout at receiptPath holds every message, and
  // this is the same text one open away. Convenience, not recovery.
  const commentaryPath = commentaryOnly
    ? persistAnswer(messages.map((m) => `## ${m.phase ?? "unphased"}\n\n${m.text}`).join("\n\n"), ".commentary")
    : null;
  return { ran, commandsRan, blocked, probeNegatives, failedCmds, declinedCmds, failedPatches, expected, pipedToPager, final,
           fullAnswer, schemaErrs, answerPath, answer, sizeOverflow, bounded, commentaryOnly, commentaryPath,
           answerPartial, answerPartialPath: answerPartial ? answerPartialPath : null };
}

// Why a delegating turn exits 5: the root ran nothing and the children did the work. Naming them keeps
// "no command ran" from reading as a dead turn, and says in the same breath that their commands are not
// this agent's evidence. The path list is capped: a wide fan-out must not turn the cause into a page.
function subagentCause() {
  const ts = [...subagentThreads.values()];
  const paths = ts.map((t) => t.agentPath).filter(Boolean);
  const shown = paths.slice(0, 6).join(", ") + (paths.length > 6 ? `, +${paths.length - 6} more` : "");
  const cmds = ts.reduce((n, t) => n + t.commands, 0);
  return `no command ran on the root thread; ${ts.length} subagent thread(s) ran `
    + `(${shown ? `${shown}, ` : ""}${cmds} commands): liveness, not evidence`;
}

// The ordered exit ladder, first match wins. A declined approval records an unmet permission request;
// it does not establish task incompleteness or answer loss, and the report is what settles either.
function decideExitCode(ev) {
  // Everything any rung reads, in one object: the turn's outcome (ev) and the module state the rungs used
  // to reach around their argument for.
  const ctx = { ...ev, turnStatus, turnError, interactions, escalations, opts };
  for (const rung of LADDER) if (rung.when(ctx)) return rung.code;
  return EXIT.SUCCESS;
}

// codeOverride keeps a rung the ladder cannot reach on its own: a server that DIED mid-turn is a
// transport failure (4) whatever the evidence says, and the evidence still has to be reported.
function finish(reason, codeOverride = null) {
  if (settled) return;
  settled = true;
  if (reason) turnStatus = reason;
  // The catch-all for every path that ends the run without the turn's own completion — an abort with a
  // thread, a server that died, a second signal.
  settleOpenApprovals("run ended");
  const ev = classifyEvidence();
  // abort() is a no-op once settled, so a failure here must not leave the run hanging without a report.
  try { writeReport(ev, codeOverride); }
  catch (e) {
    process.stderr.write(`entrust: the report could not be produced (${e.message})\n`);
    exitWith(EXIT.TRANSPORT);
  }
}

// endedAt is what says this thread's run is over — a `--resume last` looks no further than the record,
// and the resume guard reads it before a pid — so it must never precede a delivered report. The closing
// fields are prepared with the report and committed only once the bytes have actually landed: in the
// drain callback, in the drain watchdog, or on a broken pipe.
let closingFields = null, recordClosed = false;
function closeJobRecord(finalCode) {
  if (recordClosed || !closingFields) return;
  recordClosed = true;
  writeJob({ ...closingFields, exitCode: finalCode, endedAt: new Date().toISOString() });
}

function writeReport(ev, codeOverride) {
  // Quiesce the turn's process group BEFORE harvesting a tree that is about to be removed. A command
  // the turn backgrounded can still be writing; snapshotting around it would archive a half-written
  // file and the removal would then delete the rest. Bounded and synchronous — finish() is — and only
  // on the path that actually removes a tree, so an ordinary run's teardown timing is unchanged.
  if (worktreeInfo && !worktreeInfo.disposed && turnStatus === "completed" && child) quiesceGroupSync();
  // Before the report, which carries the outcome.
  const worktree = disposeWorktree(turnStatus === "completed");
  // The receipt is the one artefact no wrapper can fabricate; locate it, READ it, and say what it says,
  // so the coordinator does not have to glob for it and does not have to trust a filename.
  const receipt = findRollout(rootThreadId);
  const receiptPath = receipt?.path ?? null;
  const code = codeOverride ?? decideExitCode(ev);
  const { ran, blocked, probeNegatives, failedCmds, declinedCmds, failedPatches, expected, pipedToPager, final,
          fullAnswer, schemaErrs, answerPath, answer, sizeOverflow, bounded, commentaryOnly, commentaryPath,
          answerPartial } = ev;
  // Where the wall clock went. commandMs is the server's own per-command measurement, so modelMs is the
  // remainder after setup and the work the model ordered — the part a budget must size. A remainder, not a
  // measurement: anything the server spent outside a command lands in it.
  const wallMs = Date.now() - startedAtMs;
  const setupMs = setupDoneMs === null ? null : setupDoneMs - startedAtMs;
  const commandMs = commands.reduce((n, c) => n + (c.durationMs ?? 0), 0);
  const timing = { wallMs, setupMs, commandMs, modelMs: setupMs === null ? null : wallMs - setupMs - commandMs };
  // Said on stderr as well as in the report: the directory outlives the run, and it is the only place
  // the answer's own file paths resolve.
  const tmpDir = keptTmpDir();
  if (tmpDir && tmpHasAgentFiles())
    process.stderr.write(`entrust: the agent left files in its private $TMPDIR ${tmpDir}; it outlives the run, and the driver never removes it\n`);

  // The fields every adapter's report shares: the adapter, the verdict's reason, the rights the run held and
  // the model the prompt asked for, beside the one it ran on.
  const rung = LADDER.find((r) => r.code === code);
  const report = {
    adapter: "codex",
    ok: code === EXIT.SUCCESS, exitCode: code,
    error: code === EXIT.SUCCESS ? null : (turnError?.message ?? rung?.help.replace(/\s+/g, " ") ?? `exit ${code}`),
    rights: { kind: worktreeInfo ? "worktree" : opts.level, roots: opts.level === "read" ? [] : [cwd, ...roots] },
    requestedModel: opts.requestedModel ?? null,
    level: opts.level, sandbox: effectiveSandbox, cwd,
    // Report requested roots separately from sandbox.writableRoots, which is the grant the server applied;
    // assertSandbox refuses any difference. `network` is the effective grant, not a flag someone
    // passed: it is on unless the agent denied it, and sandbox.networkAccess is asserted to agree.
    writableRootsRequested: roots, network: opts.network,
    // The run's own $TMPDIR, made at either level for every run, so a path the answer names can still be
    // opened after the run.
    tmpDir,
    // Report which thread was continued after resolving "last", so the caller can identify the conversation.
    resumedFrom: opts.resume ?? null,
    // Report the server version parsed from initialize.userAgent; null means the version could not be read.
    driverVersion: VERSION, codexHome, codexVersion, codexVersionPinned: PINNED_CODEX,
    // Report whether model and effort came from a fresh probe, stale config or account defaults;
    // null under --host-home means the caller's config is used directly.
    configInherited,
    // What was REQUESTED; null means the thread inherited config.toml. reasoningEffort below is what the
    // server actually selected, which is the one worth reading back.
    effort: opts.effort ?? null, reasoningEffort: selectedEffort,
    model: selectedModel, turnStatus, turnError, threadId: rootThreadId,
    // What the agent cost, straight from the server's own accounting; null when no usage event arrived.
    tokenUsage, rateLimits, turnDiffPath,
    ...(opts.outputSchema ? { outputAttempts, outputSchemaOk: schemaErrs.length === 0,
        schemaErrors: schemaErrs.length ? schemaErrs.slice(0, 12) : null,
        // What the driver's shallow validator could NOT re-verify; server enforcement of these
        // keywords is unknown. Null means the whole schema was within the checked subset.
        schemaKeywordsUnchecked: opts.schemaUnchecked,
        schemaOverflow: sizeOverflow ? { completeAnswerPath: answerPath, clipped: bounded?.clipped ?? [] } : null,
        answerAttemptPaths: sizeAttemptPath ? [sizeAttemptPath] : [] } : {}),
    commandsSucceeded: ran.length, commandsMatchingExpectation: expected.length,
    // commandsFailed excludes the commands counted in commandsDeclined.
    // commandsDeclined counts commands and escalations counts approval requests; the exit ladder reads
    // neither count.
    commandsFailed: failedCmds.filter((c) => c.status !== "declined").length,
    commandsDeclined: declinedCmds.length, commandsBlocked: blocked.length,
    // Probes that answered "no" (a no-match grep, a false test) — not failures, not successes.
    commandsProbeNegative: probeNegatives.length,
    // Commands whose last stage was head/tail/less/more: the agent read a slice of its own evidence.
    commandsPipedToPager: pipedToPager.length,
    ...(pipedToPager.length ? { pipedToPagerHint:
      "a command ending in | head/tail/less/more shows the agent only that slice; re-read the file or re-run without the pager before trusting a conclusion drawn from it" } : {}),
    // For a rename the file that EXISTS afterwards is the destination; report that, not the source.
    filesTouched: fileChanges.filter((f) => f.status === "completed").map((f) => f.move ?? f.path),
    // What each completed change DID, beside where it landed: the kind and a rename's source, both of
    // which filesTouched folds away by reporting the destination path alone.
    fileChanges: fileChanges.filter((f) => f.status === "completed")
      .map((f) => ({ path: f.path, kind: f.kind, move: f.move })),
    fileChangesFailed: failedPatches,
    // Every approval request and what became of it, then the counts a caller reads without walking them:
    // who accepted, how many decision files were refused as another run's, how many came after their
    // request was settled, and the mailbox itself, null when none was armed.
    escalations,
    approvalsAccepted: escalations.filter((e) => e.decision === "accepted" && e.by === "coordinator").length,
    approvalsAutoAccepted: escalations.filter((e) => e.decision === "accepted" && e.by === "driver").length,
    approvalDir,
    interactions, expectCommand: opts.expect ?? null,
    // Transient provider failures the driver absorbed with a bounded backoff; empty on the vast
    // majority of runs, and the honest record of the delay when it happened.
    transientRetries,
    // What the turn did beyond commands and files: the model's own summaries of its reasoning
    // (bounded), item types the gates ignore, and the subagent threads the server ran under ours —
    // visible activity, never evidence.
    reasoningSummary: reasoningSummaries.length ? reasoningSummaries.join("\n---\n").slice(0, 8000) : null,
    otherItemCounts: Object.keys(otherItemCounts).length ? otherItemCounts : null,
    otherItems: otherItems.length ? otherItems : null,
    subagentThreads: [...subagentThreads.entries()].map(([threadId, t]) => ({ threadId, ...t })),
    // What an agent FILE declared, in order, when one was used. A wrapped agent is otherwise indistinguishable
    // from a hand-typed one in the report, and the fields the file declared are exactly what a
    // coordinator needs to see when a script wrote them.
    ...(promptFileFields ? { promptFileFields } : {}),
    // receiptOk reports whether a matching session_meta was verified within RECEIPT_LOOKBACK_DAYS date directories.
    // A missing receipt can reflect an older thread or nonstandard layout; receiptWhy explains the result.
    receiptPath, receiptOk: receipt?.verified === true, receiptWhy: receipt?.why ?? (receiptPath ? null : `no rollout naming this thread in the last ${LIMITS.RECEIPT_LOOKBACK_DAYS} days`),
    ...(worktree ?? {}),
    // A completed turn that ran nothing exits 5; when no expectation was declared, the two legitimate
    // shapes of that run are a recall-only follow-up, which has a flag, and a delegation, whose work was
    // the children's. The report names whichever one this was.
    ...(code === EXIT.COMMANDS && !opts.expectRe
      ? { hint: subagentThreads.size ? subagentCause()
                                     : "if running nothing was the point, re-run with --allow-no-commands" } : {}),
    // Exit 3 is a budget the CALLER set, so the caller is the one who can change the outcome. Resuming is
    // named first because the thread is still there; the caveat is real, not hedging — a thread whose turn
    // is still closing refuses with exit 10.
    // The raise names the budget that actually ran out. An idle cut is a HANG, not work that did not
    // fit, so it names neither the effort nor the split — the thing to look at is what the agent was
    // waiting on.
    ...(code === EXIT.TIMEOUT && rootThreadId
      ? { hint: `the turn was cut at its budget; continue it with RESUME: ${opts.reportFile ?? "<this report's path>"} in a prompt file (--resume ${rootThreadId} on the command line), which may be refused with exit 10 while the turn is still closing — ` + (
          pendingCut?.kind === "idle"
            ? "or re-run with a longer --idle-timeout after checking what the last command was waiting on"
            : pendingCut?.kind === "commands"
              ? "or split the task or raise --max-commands"
            : "or re-run with a lower --effort, a longer --timeout, or the task split into smaller agents") } : {}),
    // Which declared budget ended the turn, and whether the server closed it inside the grace. null on a
    // run that ended on its own, and on a signal: a signal is not a budget.
    cut: pendingCut?.kind
      ? { kind: pendingCut.kind, limit: pendingCut.limit, observed: pendingCut.observed,
          completedInGrace: pendingCut.completedInGrace } : null,
    timing,
    // The messages of a turn that answered nothing, on disk; null when there was an answer.
    commentaryPath,
    // What the model had written when the turn was cut, from the deltas: never the answer, so its own field.
    answerPartial,
    // Persist the full answer so the coordinator can open it when the inline cap is insufficient.
    answer, answerPath, answerTruncated: answer !== fullAnswer,
    // Include answerJson only when requested, distinguishing a parse failure from a flag that was not given.
    // Parse the full answer before BRIEF_LINES / BRIEF_BYTES clipping so the cap cannot corrupt JSON.
    ...(opts.answerJson ? bounded ? { answerJson: bounded.value, answerJsonError: null }
      : parseAnswerJson(fullAnswer) : {})
  };

  const out = `${JSON.stringify({ ...report, commands }, null, 2)}\n`;
  // The record is resume metadata and nothing else. What this run measured is in the report, and the
  // report is delivered — to a file when one was named, to stdout otherwise — so a second copy of the
  // gates here would be a second answer about one run for whoever found it first.
  closingFields = { turnStatus, answerPath,
    // A tree DISPOSED of normally — harvested, or clean and removed — updates the rebuild pointers, null
    // included: a resumed agent that reverted everything harvests nothing, and leaving the previous turn's
    // pointers in place would rebuild the next resume's tree out of the work this turn undid. A PRESERVED
    // tree keeps them: the work is still in the tree, and null would throw away the last state that CAN
    // be rebuilt. The commits ref is kept when this turn made none — the earlier ref still names that
    // thread's history.
    ...(worktree && (worktree.worktreeHarvested || (worktree.worktreeRemoved && !worktree.worktreePreserved))
      ? { worktreeDiffPath: worktree.worktreeDiffPath, worktreeUntrackedPath: worktree.worktreeUntrackedPath,
          ...(worktree.worktreeCommitsRef ? { worktreeCommitsRef: worktree.worktreeCommitsRef } : {}) }
      : {}) };
  // The file first, because it is the delivery that counts: published before a byte reaches stdout, a
  // consumer that never read the pipe changes nothing about what this run produced. A publication that
  // FAILED is the transport failure instead — the caller was told where to read and there is nothing
  // there — while the report itself still carries the verdict the turn earned.
  const durable = publishReport(out);
  exitWith(reportFilePath !== null && !durable ? EXIT.TRANSPORT : code, { stdout: out, durable });
}

// ---------------------------------------------------------------- run

// A short name, `sol` in any case, is the newest model the catalogue lists under it, so a new generation
// is taken up without an edit here; hidden models never qualify, and a full slug still pins one version.
function newestNamed(models, name) {
  const suffix = `-${name.toLowerCase()}`;
  const version = (slug) => (/\d+(?:\.\d+)*/.exec(slug)?.[0] ?? "0").split(".").map(Number);
  const newer = (a, b) => {
    const x = version(a), y = version(b);
    for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0);
    return false;
  };
  let best = null;
  for (const m of models) {
    const slug = m?.model;
    if (typeof slug !== "string" || m.hidden === true || !slug.toLowerCase().endsWith(suffix)) continue;
    if (!best || newer(slug, best.model)) best = m;
  }
  return best;
}

// What --model and --effort are checked against before a thread is started: the server's own
// catalogue, walked to the end. A name or an effort the catalogue does not carry is a usage error
// the caller can fix, and finding it here costs no turn.
async function preflightModel(request) {
  if (opts.model === undefined && opts.effort === undefined) return;
  const models = [], cursors = new Set();
  let cursor = null;
  for (;;) {
    const page = await request("model/list", { cursor, limit: null, includeHidden: true });
    if (!Array.isArray(page?.data)) fail(EXIT.TRANSPORT, "model/list returned no model catalogue");
    models.push(...page.data);
    if (page.nextCursor == null) break;
    if (typeof page.nextCursor !== "string" || cursors.has(page.nextCursor) || cursors.size >= 99)
      fail(EXIT.TRANSPORT, "model/list pagination did not terminate with a valid cursor");
    cursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }
  let chosen = opts.model === undefined ? null
    : models.find((m) => m?.model === opts.model || m?.id === opts.model) ?? null;
  if (!chosen && opts.model !== undefined && /^[a-z]+$/i.test(opts.model)) {
    chosen = newestNamed(models, opts.model);
    if (chosen) {
      process.stderr.write(`entrust: --model ${opts.model} is ${chosen.model}, the newest listed model of that name\n`);
      opts.model = chosen.model;
    }
  }
  if (opts.model !== undefined && !chosen)
    fail(EXIT.USAGE, `--model ${JSON.stringify(opts.model)} is not in model/list; available models: ${models.map((m) => m?.model).filter(Boolean).join(", ") || "none"}`);
  if (opts.effort !== undefined) {
    const candidates = chosen ? [chosen] : models;
    const supported = (m) => (m?.supportedReasoningEfforts ?? []).map((e) => e?.reasoningEffort).filter(Boolean);
    if (!candidates.some((m) => supported(m).includes(opts.effort))) {
      const allowed = [...new Set(candidates.flatMap(supported))].sort();
      fail(EXIT.USAGE, `--effort ${JSON.stringify(opts.effort)} is not advertised by ${opts.model ? `model ${opts.model}` : "any model in model/list"}; supported efforts: ${allowed.join("|") || "none"}`);
    }
  }
}

// The standing rules the thread is started with, as one string. A function of opts and what is LEFT
// of the budget — never of the prompt, which is the turn's own input.
function developerInstructions() {
  // Standing rules belong on the thread, not in the task prompt: they then govern every turn of a
  // resumed thread and do not compete with the task text for attention. `codex exec` cannot do this.
  // What is LEFT of the budget, read here rather than at process start: the probe and the lock come out
  // of the same clock, and a number the model plans against must not include time already spent. Read
  // only by the branch below that has a budget to report.
  const budgetLeftS = Math.max(1, Math.round((startedAtMs + opts.timeout * 1000 - Date.now()) / 1000));
  return [
    "You are being driven by a coordinating agent, unattended. Nobody will answer a question.",
    // Advisory: the model has no clock unless it runs `date`. It costs one sentence and it is the only
    // thing that makes the wall clock something the turn can plan against rather than be surprised by.
    // Without a wall clock the sentence has to say so: told "you have about N seconds" when nothing is
    // counting, the model plans against a deadline that does not exist and rushes work it had time for.
    opts.timeout > 0
      ? `You have about ${budgetLeftS} seconds of wall clock`
        + ` for this turn; reserve the last fifth for writing the final answer, and if time runs short answer with what you have and say what you did not get to.`
      : `There is no wall-clock limit on this turn`
        + `; it is cut only ${opts.idleTimeout ? `after ${opts.idleTimeout} seconds of silence or ` : ""}by the coordinator. `
        + `Take the time the work needs, keep working visibly rather than pausing, and say what you did not get to if you are cut.`,
    // Two grants, so two sentences: web search is the server's own tool and egress is the sandbox's, and
    // an agent can hold either without the other. Both are named whichever way they went, because a grant
    // the standing rules do not mention is one the turn does not spend, and a denial they do not mention
    // is a turn spent on fetches the sandbox refuses.
    opts.webSearch
      ? "Prefer the local shell and filesystem; use web search only for what is not in this checkout, and cite the source."
      : "Do not use web search.",
    opts.network
      ? "You have network access: use it for what is not in this checkout, keep to the hosts this task names, and cite what you fetched."
      : "You have no network access; cite files you actually read.",
    `Your writable roots are: ${[canonPath(process.env.TMPDIR), ...(opts.level === "write" ? [cwd, ...roots] : [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ")}; /tmp is not one. Put generated files under a granted root and name their paths.`,
    "If a task says a daemon, socket, or mounted checkout is unavailable, use its staged inputs and named alternative commands; record an unavailable command's exact diagnostic instead of guessing.",
    "If a command cannot run, record it in one line — the command, whether it started, its exit status if there was one, and the exact diagnostic — then continue. Write \"unknown\" for what you could not observe rather than inferring it.",
    "Never report a test as passing unless you ran it and saw the count in this turn.",
    "State uncertainty plainly rather than guessing; an honest 'I could not determine this' is useful.",
    // The coordinator machine-reads this answer. Saying so is what makes the JSON arrive bare; without it
    // the model reaches for a fenced block, and a fence is not JSON.
    ...(opts.answerJson
      ? ["Your final answer must be ONE JSON object and nothing else: no prose before or after, no markdown code fence."]
      : []),
    // Ask for a summary and leave details in files so the coordinator opens them only when needed.
    ...(opts.brief
      ? [`Answer in at most ${LIMITS.BRIEF_LINES} lines: the conclusion, then only what changes what the reader does next.`,
         // Withheld under --output-schema, which has just demanded ONE JSON object and nothing else: the
         // two sentences together tell the agent to answer in JSON and to put the rest beside it.
         ...(opts.answerJson ? []
           : ["Put anything longer — diffs, transcripts, tables, evidence — in a file under $TMPDIR and give its absolute path."])]
      : [])
  ].join(" ");
}

// Every deadline this driver arms: unref'd, so a timer alone never holds the process open, and never
// sooner than 50 ms, so a rung whose moment has already passed does not fire inside its own arming.
const armAt = (whenMs, fn) => { const t = setTimeout(fn, Math.max(50, whenMs - Date.now())); t.unref?.(); return t; };

function armWallClock() {
  // Two rungs on one clock, anchored on the PROCESS start, not on this line: the config probe runs before
  // this timer is armed, and a relative deadline overshoots the caller's whole budget by however long that
  // took.
  //   T−grace    stop the turn, and give the server the grace to close it
  //   T          report whatever arrived, if the grace has not already
  // Both are armed only when a wall clock was declared. Without one the turn is bounded by silence
  // (--idle-timeout), by volume (--max-commands) and by the coordinator, which is what a native subagent
  // is bounded by. A rung armed at T = start would fire at once and cut the run this default exists to allow.
  const endAtMs = startedAtMs + opts.timeout * 1000;
  const graceMs = Math.min(LIMITS.CUT_GRACE_MAX_MS, Math.max(LIMITS.CUT_GRACE_MIN_MS, opts.timeout * 250));
  if (!(opts.timeout > 0)) return;
  // Once a child exists, a timeout hands back the partial result rather than discarding it; before that
  // there is nothing to interrupt, so this rung has nothing to do and T below does the aborting.
  armAt(endAtMs - graceMs, () => {
    if (child && rootThreadId)
      cutTurn("timedOut", "wall", { limit: opts.timeout, observed: Math.round((Date.now() - startedAtMs) / 1000), graceMs });
  });
  // The budget is the budget: a server that never answers the interrupt does not get to extend it. A run
  // with no thread yet has nothing to report and spends its whole budget waiting for one, so it aborts
  // here rather than a grace early — abort() also has to unblock a stdin read that may never end.
  armAt(endAtMs, () => {
    if (settled) return;
    if (child && rootThreadId) finish("timedOut");
    else abort(EXIT.TIMEOUT, `timed out after ${opts.timeout}s`);
  });
}

// The prompt, from --prompt or from stdin. Bounded on both axes: MAX_PROMPT_BYTES while it arrives,
// and the silence budget where no wall clock will end an stdin that never closes.
async function readPrompt() {
  let prompt = opts.prompt;
  if (prompt === undefined) {
    if (process.stdin.isTTY) fail(EXIT.USAGE, "no prompt: pass --prompt or pipe one on stdin");
    process.stdin.setEncoding("utf8");   // raw Buffers split multi-byte chars at chunk boundaries
    // With no wall clock, nothing else bounds a stdin that never closes — a pipe left open by a caller
    // that has since died would hold the driver open with no thread, no lock holder to reclaim it and no
    // report. That is silence before the turn, so the silence budget answers for it; abort() destroys
    // stdin, which is what unblocks the read below.
    const stdinGuard = opts.timeout > 0 || !opts.idleTimeout ? null
      : armAt(Date.now() + opts.idleTimeout * 1000,
           () => abort(EXIT.TIMEOUT, `no prompt arrived on stdin within the ${opts.idleTimeout}s silence budget`));
    let s = "";
    for await (const c of process.stdin) {
      s += c;
      if (Buffer.byteLength(s) > LIMITS.MAX_PROMPT_BYTES) fail(EXIT.USAGE, `prompt exceeds ${LIMITS.MAX_PROMPT_BYTES} bytes`);
    }
    if (stdinGuard) clearTimeout(stdinGuard);
    prompt = s;
  }
  if (settled) throw new Bail();   // aborted while reading stdin; the exit code is already set
  prompt = prompt.trim();
  if (!prompt) fail(EXIT.USAGE, "empty prompt");
  return prompt;
}

// Starts the app-server and returns with the connection attached: the stderr tail abort() prints, the
// pgid on the lock and the ledger, the framing, and the two handlers that turn a dead server into a
// report rather than a hang. The order is the contract — a pgid recorded after the first event, or a
// connection attached after the handlers, is a window in which a crash has nowhere to go.
function spawnServer() {
  // The agent's shell is zsh, which keeps every here-document in a file under $TMPPREFIX, default
  // /tmp/zsh: outside the grant, so every `<<EOF` failed ("can't create temp file for here document",
  // measured in 15 rollouts, 2026-08-31 to 2026-09-08). Under the run's own $TMPDIR, which setup() made,
  // it is inside the grant at every level.
  child = spawn(codexBin, spawnArgs, {
    cwd, stdio: ["pipe", "pipe", "pipe"], detached: true,
    env: { ...process.env, ...(codexHome === null ? {} : { CODEX_HOME: codexHome }),
           TMPPREFIX: path.join(process.env.TMPDIR, "zsh") },
  });
  child.stderr.setEncoding("utf8");
  // Keep a bounded stderr tail because runs can be long and abort() prints it; report how much was dropped.
  child.stderr.on("data", (c) => {
    stderrBuf += c;
    if (stderrBuf.length > LIMITS.STDERR_KEEP) {
      stderrDropped += stderrBuf.length - LIMITS.STDERR_KEEP;
      stderrBuf = stderrBuf.slice(-LIMITS.STDERR_KEEP);
    }
  });
  // The child is its own process group (detached above), so its pid IS the pgid. Recorded on the lock
  // and on the worktree ledger the moment it exists: from here on, a reclaimer asks about the group and
  // not only about this driver.
  updateLock({ appServerPgid: child.pid });
  if (worktreeInfo?.name) updateLedger(worktreeInfo.name, { appServerPgid: child.pid });
  // The framing, the pending map and the writer, shared with the config probe. handleMessage is handed
  // every line: the ids it assigns must be in place before anything sharing that stdout chunk is judged.
  conn = jsonRpcConn(child, {
    maxLine: LIMITS.MAX_LINE_BYTES,
    onMessage: (msg, bytes) => {
      try { handleMessage(msg, bytes); } catch (e) { abort(EXIT.TRANSPORT, `protocol handling failed: ${e.message}`); }
    },
    onOverflow: (n) => abort(EXIT.TRANSPORT, `the server sent more than ${n} bytes with no newline; refusing to buffer more`),
  });
  requestFn = conn.request;
  // rejectAll rather than close(): a child's `exit` can precede its stdout `end`, and destroying the
  // streams here would drop a final unterminated line the turn may have ended on.
  child.on("error", (e) => { conn.rejectAll(e); abort(EXIT.TRANSPORT, `cannot start codex: ${e.message}`); });
  child.on("exit", (code, signal) => {
    const e = new Error(`codex app-server exited (${signal ? `signal ${signal}` : `code ${code}`})`);
    conn.rejectAll(e);
    if (settled) return;
    // Once a thread exists there is evidence to hand back — threadId, commands, file changes, a partial
    // answer — and a dead server is no reason to discard it. abort() prints no report, so this does not
    // use it; the code stays 4, because the transport really did fail.
    if (rootThreadId) {
      process.stderr.write(`entrust: ${e.message}\n`);
      // A server that dies while this driver is already cutting the turn is not a crash: a harness that
      // stops an agent signals the whole process tree, so codex takes the SIGTERM beside the driver and
      // is gone before the grace ends. The cut is the verdict — interrupted, or the budget that fired —
      // and the report reads as it would had the server closed the turn itself. Measured 2026-09-12:
      // an agent stopped from the agent map reported `failed`/4, and its reader could not tell the
      // cancellation from a server death.
      if (pendingCut) { if (cutGraceTimer) clearTimeout(cutGraceTimer); finish(pendingCut.reason); return; }
      turnError = turnError ?? { codexErrorInfo: "crashed", message: e.message, crashed: signal ?? code };
      finish("failed", EXIT.TRANSPORT);
      return;
    }
    abort(EXIT.TRANSPORT, e.message);
  });
}

async function main() {
  if (process.argv.includes("--check-prompt-file")) return checkPromptFile(process.argv.slice(2));
  opts = readOpts();
  // The pid a caller signals to stop this agent, and the identity that says the pid is still this run
  // rather than whatever the OS recycled it into. Before setup(), because an agent killed during its
  // config probe has to be identifiable too, and this line is all its caller has until the thread exists.
  process.stderr.write(`entrust: pid=${process.pid} identity=${selfIdentity() ?? "unknown"}`
    + `${reportFilePath === null ? "" : ` reportPath=${reportFilePath}`}\n`);
  if (opts.schemaUnchecked)
    process.stderr.write(`entrust: --output-schema uses keywords the driver's validator does not check (${opts.schemaUnchecked.join(", ")}); server enforcement is unknown, and the report lists them as schemaKeywordsUnchecked\n`);
  await setup();
  setupDoneMs = Date.now();
  armWallClock();
  const prompt = await readPrompt();
  spawnServer();

  const init = await conn.request("initialize", initializeParams());
  conn.notify("initialized");

  // Measured live: `Claude Code/0.150.1 (Mac OS 26.6.2; arm64) unknown (entrust; 2.0)` — the
  // client's own name, then the SERVER's version. Take the first x.y.z after a slash; a userAgent this
  // cannot read leaves codexVersion null rather than inventing one.
  codexVersion = /\/(\d+\.\d+\.\d+[^\s)]*)/.exec(String(init?.userAgent ?? ""))?.[1] ?? null;
  if (codexVersion && codexVersion !== PINNED_CODEX)
    process.stderr.write(`entrust: this codex is ${codexVersion}; the plugin's protocol facts and pinned schemas were measured against ${PINNED_CODEX}. Behaviour that contradicts the docs starts here.\n`);

  // An older server, or a managed device, answers this method with a JSON-RPC error. That is a missing
  // snapshot, not a reason to abort a run that has not started its thread yet: the report then carries
  // rateLimits null and the agent runs.
  let limits = null;
  try { limits = await conn.request("account/rateLimits/read", null); }
  catch (e) { process.stderr.write(`entrust: account/rateLimits/read unavailable (${e.message}); continuing without a snapshot\n`); }
  rateLimits = limits?.rateLimits ?? null;
  const primaryUsed = rateLimits?.primary?.usedPercent;
  if (rateLimits && typeof primaryUsed === "number" && primaryUsed >= 100)
    fail(EXIT.USAGE, `the account's primary Codex rate-limit window is at ${primaryUsed}%; no thread was started`);

  await preflightModel(conn.request);

  // Sending `sandbox` at all suppresses the permission profile — the server reports
  // activePermissionProfile: null and the $TMPDIR grant silently disappears. So at --level read the
  // parameter is omitted and the profile is pinned via -c instead; the response is then asserted below,
  // because an unapplied profile must never pass as if it had applied.
  const sandboxParam = sandbox === null ? {} : { sandbox };
  const resuming = Boolean(opts.resume);
  // WHO may approve is as load-bearing as what the sandbox permits, and it is a separate axis. With
  // approvalsReviewer "auto_review" the server hands approvals to its own subagent, so they never reach
  // this driver: escalations stay empty, the refusal policy is silently disarmed, and a sandbox escape can
  // be granted while the run exits 0. Measured: the sandbox object is byte-identical under "user" and
  // "auto_review", so no amount of checking type/roots/network can tell them apart. `approvals_reviewer`
  // is a real config key and a menu item in the interactive TUI, so this is one toggle away by accident.
  const approvalsReviewer = "user";
  const threadBase = { cwd, model: opts.model ?? null, approvalPolicy: "on-request", approvalsReviewer,
    ...sandboxParam, developerInstructions: developerInstructions() };
  // excludeTurns: the driver never reads thread.turns off the response, and every thread created under
  // 0.153.4 is paginated — for those full-history hydration is deprecated. Measured: a resume shrank
  // from 1.5 MB to 58 KB with it.
  const threadReq = resuming
    ? ["thread/resume", { threadId: opts.resume, excludeTurns: true, ...threadBase }]
    // Keep threads resumable by default because the caller may discover a need to continue only after reading the answer.
    : ["thread/start", { ...threadBase, serviceName: "claude-code-entrust" }];
  const thread = await conn.request(threadReq[0], threadReq[1]);
  // Asked for above, asserted here, at BOTH levels — write level's writable-root boundary is escapable the
  // same way. The field is `required` on the response in the pinned schema, so a server that stops sending
  // it yields undefined and refuses: fail-closed by construction rather than by convention.
  // The approval POLICY is asserted for the same reason as the reviewer, and it is the reason this driver
  // uses app-server at all: where an MDM profile restricts the allowed policies, a policy it does not
  // permit is silently CLAMPED to another one, after which every command is denied while the run still
  // looks healthy. That is the failure the whole skill exists to route around — so if the server did not
  // echo the policy we asked for, stop rather than discover it one refused command at a time.
  if (thread.approvalPolicy !== "on-request")
    fail(EXIT.TRANSPORT, `the server applied approvalPolicy ${JSON.stringify(thread.approvalPolicy ?? null)}, not "on-request"; ` +
      `a clamped policy denies every command while the run still exits cleanly. Refusing to continue.`);
  if (thread.approvalsReviewer !== approvalsReviewer)
    fail(EXIT.TRANSPORT, `approvals are routed to ${JSON.stringify(thread.approvalsReviewer ?? null)}, not to this driver; ` +
      `it could approve a sandbox escape without the run ever reporting an escalation. Refusing to continue.`);
  // A resumed thread with a turn still running would hand us that turn's id from turn/start, and its
  // old events would satisfy this invocation while the new prompt was never consumed.
  effectiveSandbox = thread.sandbox ?? null;
  assertSandbox(thread);

  const st = thread.thread?.status?.type ?? null;
  if (resuming && st === "active") fail(EXIT.BUSY, `thread ${opts.resume} still has a turn running; wait for it to finish`);
  if (resuming && st && st !== "idle") fail(EXIT.TRANSPORT, `thread ${opts.resume} is ${st} and cannot be resumed`);

  // Announced BEFORE the turn, not in the report: a delegation runs for minutes, and the thread id is
  // the key to tailing its live rollout under ~/.codex/sessions — a coordinator watching a long agent
  // should not have to wait for the end to learn which run it is.
  process.stderr.write(`entrust: threadId=${rootThreadId} (live rollout: ~/.codex/sessions/YYYY/MM/DD/rollout-*-${rootThreadId}.jsonl)\n`);
  // The measured failure shape: a high-effort turn spends minutes thinking before it writes anything, so
  // a short clock cuts it before the answer exists — and an interrupt hands back no answer at all.
  // Silent without a wall clock: the failure shape IS a short clock, and warning about one that was
  // never set would fire on every default run.
  if (["high", "xhigh", "max"].includes(String(selectedEffort)) && opts.timeout > 0 && opts.timeout < 600)
    process.stderr.write(`entrust: effort ${selectedEffort} with --timeout ${opts.timeout}s is the measured failure shape — the turn is likely to be cut before it writes an answer (exit 3). Raise --timeout above 600 or lower the effort.\n`);
  // The whole record: what a later `--resume last` has to find this thread by, and what a worktree
  // rebuild has to cut its tree from. Nothing about the run's progress or its verdict, which the report
  // carries and its caller reads.
  writeJob({ threadId: rootThreadId, pid: process.pid,
    // Process identity beside the pid, for the resume guard: a pid can be recycled.
    identity: selfIdentity(),
    cwd, started: new Date().toISOString(),
    // A resumed thread rewrites the record of the run that ended, and every closing field in it belongs
    // to THAT run. Left in place, `endedAt` says this thread is finished while its new turn is running,
    // and the resume guard — which returns the moment it sees one — would wave a second agent onto a live
    // thread. undefined rather than null: JSON.stringify drops the key, so the record has no field at
    // all until closeJobRecord writes this run's.
    endedAt: undefined, exitCode: undefined, turnStatus: undefined, answerPath: undefined,
    // A worktree agent's cwd is removed when the agent finishes, so the repository it was cut from and the
    // commit it started at are what a later --resume can still name.
    ...(worktreeInfo ? { repo: worktreeInfo.repo, baseSha: worktreeInfo.baseSha } : {}) });
  // Armed here, where the thread exists and there is something to cut: before it, a silent server is
  // the wall clock's business.
  touchIdle();

  if (opts.outputSchema) outputAttempts = 1;   // attempts count turns STARTED, this being the first
  lastTurnParams = {
    threadId: rootThreadId,
    // Attachments FIRST, then the text — the layout the user's own turn has. Measured across every
    // image-carrying turn in this machine's transcripts: 29 of 29 are [image…, text], never text-first.
    // An agent asked about "the first screenshot" should be looking at the same arrangement its
    // coordinator saw.
    input: [...(opts.attachments ?? []), { type: "text", text: prompt, text_elements: [] }],
    model: opts.model ?? null, effort: null,
    ...(opts.outputSchema ? { outputSchema: opts.serverSchema } : {})
  };
  await conn.request("turn/start", lastTurnParams);
}

// Handle stdout EPIPE as a transport failure when a consumer stops reading, rather than letting
// Node turn an unhandled stream error into an uncaught exception.
let stdoutBroken = false;
function stdoutFailed(e) {
  if (stdoutBroken) return;
  stdoutBroken = true;
  flushing = false;
  process.stderr.write(`entrust: stdout: ${e?.code ?? e?.message ?? "write failed"}; the report `
    + `${reportFileWritten ? `is complete at ${reportFilePath}` : "did not reach the caller"}\n`);
  // With the report already durable the pipe carried a copy, so the exit belongs to writeReport's own
  // callback (or its drain timer) and the verdict stays the turn's.
  if (reportFileWritten) return;
  exitWith(EXIT.TRANSPORT);
}

// Imports must not install signal handlers, exit hooks or start a turn.
// A direct invocation matches the module URL; resolve symlinked argv[1] because ESM resolves its URL.
const RUN_AS_MAIN = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  if (import.meta.url === pathToFileURL(entry).href) return true;
  try { return import.meta.url === pathToFileURL(fs.realpathSync(entry)).href; } catch { return false; }
})();
// What a suite imports and what cleanup.mjs asks rather than reimplementing; RUN_AS_MAIN keeps an import
// from starting anything.
export { CODEX_FALLBACK_DIRS, EXIT, FIELDS, LADDER, PINNED_CODEX, PROMPT_FIELDS, RECLAIM_BACKSTOP_MS, VERSION, canonPath,
         dropReclaimMarker, holderAlive, holdsReclaimMarker, lockKey, newestNamed, processIdentity,
         reclaimMarkerAbandoned, reclaimable, takeReclaimMarker };

if (RUN_AS_MAIN) {
  process.stdout.on("error", stdoutFailed);

  // Signal handlers replace Node's default termination, so they must terminate even after the run settles.
  // Handle SIGHUP as well: closing terminals and dying parent shells send it to backgrounded runs.
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(sig, () => {
      // A repeat signal during teardown escalates the group to SIGKILL without bypassing the pending cleanup.
      if (shutdownDone) { killGroup("SIGKILL"); return; }
      if (settled) {
        if (flushing) return;   // the report is mid-write; let it finish or hit its own timer
        exitWith(process.exitCode ?? EXIT.TRANSPORT);
        return;
      }
      // A turn that has already produced evidence is REPORTED, not discarded: abort() writes no report at
      // all, and the commands, files and answer are already in memory. Same choice --timeout makes below,
      // and it lands on the published rung for "the turn did not complete" (exit 1) rather than on
      // transport (4), which means "codex crashed or the rights were wrong". Before a thread exists there
      // is nothing to report, and 4 stays.
      process.stderr.write(`entrust: interrupted by ${sig}\n`);
      // A second signal during the grace reports at once: the caller is waiting, and a handler that
      // silently absorbed it would leave only SIGKILL — which takes the report with it.
      if (pendingCut) { if (cutGraceTimer) clearTimeout(cutGraceTimer); finish(pendingCut.reason); return; }
      // One second, not the wall clock's grace: a signal is a caller who wants out, and the harness that
      // sent it may follow with SIGKILL. The interrupt is fire-and-forget either way — shutdown()'s own
      // SIGTERM wait is what gives the server time to act on it.
      if (child && rootThreadId) { cutTurn("interrupted", null, { graceMs: 1000, signal: sig }); return; }
      abort(EXIT.TRANSPORT, `interrupted by ${sig} before the thread existed`);
      exitWith(EXIT.TRANSPORT);
    });
  }

  // The synchronous last resort for exits that bypassed shutdown() — a crash, a code path that called
  // process.exit directly. After a clean teardown every one of these is a no-op.
  process.on("exit", () => {
    if (child) killGroup("SIGKILL");
    if (probeConn) probeConn.close({ kill: "SIGKILL" });
    releaseLock();
    worktreeLastResort();
  });

  main().catch((e) => {
    if (e instanceof Bail) { shutdown(); return; }
    abort(EXIT.TRANSPORT, e.message);
  });
}
