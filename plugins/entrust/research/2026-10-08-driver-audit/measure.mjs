// The counts of 01-inventory.md: comment and code lines per driver file, lines touching rights or approvals,
// and the Codex driver's top-level declarations summed by area. Run with node from anywhere; paths resolve
// from this file's location.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILLS = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "plugin", "skills");
const FILES = ["codex/scripts/driver.mjs", "opencode/scripts/driver.mjs", "opencode/scripts/contract.mjs",
  "opencode/scripts/client.mjs", "opencode/scripts/v2-client.mjs", "opencode/scripts/local-server.mjs",
  "opencode/scripts/config.mjs", "opencode/scripts/launch.mjs", "claude/scripts/driver.mjs",
  "claude/scripts/approvals.mjs", "claude/scripts/launch.mjs", "orchestrate/scripts/agent-run.mjs",
  "orchestrate/scripts/drivers.mjs", "orchestrate/scripts/temp-dir.mjs"];
const RIGHTS = /\b(RIGHTS|rights|writable|WRITABLE|sandbox|Sandbox|--level|level|grant|roots?\b|worktree|Worktree|checkRoot|readDir|scope|Scope|widen|deny rules?|disallowed|permission-mode|acceptEdits|safe-mode|SAFE_MODE)\b/;
const APPROVALS = /\b(approv\w*|Approv\w*|mailbox|decision|Decision|settle\w*|escalat\w*|Escalat\w*|pending|decide|requestHash|request id|REQUEST_ID|typedRequest|permission prompt|interaction)\b/;
const AREAS = {
  "help and usage text": /^(HELP|helpText|wrapJoined|USAGE)$/,
  "arguments, prompt file, fields": /^(parseArgs|argvFromPromptFile|readOpts|readPrompt|FIELDS|PROMPT_FIELDS|CLI_ONLY_FIELDS|BOOLS|OFF_FLAGS|FLAGS|flagsOfKind|RIGHTS_HEADER_RE|BODY_LABELS|promptFileFields|promptFileBody|checkPromptFile|need|LEVELS|EFFORTS|WEB_SEARCH|LIMITS|attachExts|ATTACH\w*)$/,
  "rights, sandbox, isolated home, inherited config": /^(checkRoot|isolatedHome|inheritedConfig|assert\w*Sandbox|managedWebSearchModes|refuseWebSearchMode|coveredByRights|agentRoots|resolveDir|READ_PROFILE|sandbox|effectiveSandbox|\w*[Ss]andbox\w*|\w*Home\w*|\w*[Pp]olicy\w*|CODEX_FALLBACK_DIRS|\w*Roots?\w*|writableRoots|\w*[Ww]ritable\w*|\w*[Cc]onfig\w*|tomlString|\w*Profile\w*)$/,
  "worktree, its ledger and disposal": /^(\w*[Ww]orktree\w*|\w*Ledger\w*|ledgerDir|restorePriorWork|priorWorktreeJob|reachableFromAnyRef|WT_\w*)$/,
  "write lock and its reclaim": /^(\w*[Ll]ock\w*|\w*Reclaim\w*|holderAlive|reclaimable|processIdentity|\w*Identity\w*|lockKey|RECLAIM\w*)$/,
  "approvals and mailbox": /^(handleServerRequest|offerApproval|claimMailbox|closeApproval|\w*[Aa]pproval\w*|\w*[Mm]ailbox\w*|\w*Decision\w*|\w*[Ee]scalat\w*|\w*Interaction\w*|requestId|\w*Pending\w*)$/,
  "protocol and transport": /^(jsonRpcConn|handleMessage|handleResponse|spawnServer|replayEarly|shutdown|resolveCodexBin|codexBin|\w*Rpc\w*|send\w*|request|PINNED_CODEX|\w*Server\w*|\w*Notification\w*|\w*Thread\w*|\w*Turn\w*)$/,
  "timing and stopping": /^(armWallClock|touchIdle|cutTurn|abort|exitWith|finish|\w*Timer\w*|\w*[Ii]dle\w*|\w*Signal\w*|\w*[Kk]ill\w*|startedAtMs|settled|Bail|fail|checkOnly)$/,
  "report, evidence, answer, schema": /^(writeReport|publishReport|openReportFile|classifyEvidence|recordRootItem|findRollout|schemaErrors|clipToSchema|startCorrectiveTurn|LADDER|decideExitCode|otherItemCounts|validateOutputSchema|\w*[Rr]eport\w*|\w*[Ee]vidence\w*|\w*[Aa]nswer\w*|\w*[Ss]chema\w*|\w*Rollout\w*|\w*Receipt\w*|\w*Item\w*|\w*Command\w*|\w*Usage\w*|invalidRequest)$/,
  "--verify gate": /^(\w*[Vv]erif\w*)$/,
  "model and standing instructions": /^(developerInstructions|preflightModel|newestNamed|\w*[Mm]odel\w*|\w*Effort\w*)$/,
  "entry (main, setup)": /^(main|setup|RUN_AS_MAIN|VERSION|EXIT|opts|cwd|state\w*|stateDir)$/,
};
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : "-");

console.log("| file | lines | comment | code | comment share | rights code | rights comment | approvals code | approvals comment |");
for (const f of FILES) {
  let inBlock = false, comment = 0, code = 0, rk = 0, rc = 0, ak = 0, ac = 0;
  const lines = fs.readFileSync(path.join(SKILLS, f), "utf8").split("\n");
  for (const raw of lines) {
    const l = raw.trim();
    let isComment = inBlock || l.startsWith("//") || l.startsWith("/*");
    if (inBlock && l.includes("*/")) inBlock = false;
    else if (!inBlock && l.startsWith("/*") && !l.includes("*/")) inBlock = true;
    if (!l) continue;
    if (isComment) { comment++; if (RIGHTS.test(l)) rc++; if (APPROVALS.test(l)) ac++; }
    else { code++; if (RIGHTS.test(l)) rk++; if (APPROVALS.test(l)) ak++; }
  }
  console.log(`| ${f} | ${lines.length} | ${comment} | ${code} | ${pct(comment, comment + code)} | ${rk} (${pct(rk, code)}) | ${rc} (${pct(rc, comment)}) | ${ak} (${pct(ak, code)}) | ${ac} (${pct(ac, comment)}) |`);
}

const lines = fs.readFileSync(path.join(SKILLS, "codex/scripts/driver.mjs"), "utf8").split("\n");
const starts = [];
lines.forEach((l, i) => {
  const m = /^(?:export )?(?:async )?function\*? ?(\w+)|^(?:export )?(?:const|let) (\w+)\b/.exec(l);
  if (m) starts.push({ name: m[1] ?? m[2], at: i + 1 });
});
const sums = {};
starts.forEach((s, k) => {
  const len = (starts[k + 1]?.at ?? lines.length + 1) - s.at;
  const area = Object.entries(AREAS).find(([, re]) => re.test(s.name))?.[0] ?? "unplaced";
  sums[area] = (sums[area] ?? 0) + len;
});
console.log(`\nCodex driver, ${starts.length} top-level declarations, by area:`);
for (const [a, n] of Object.entries(sums).sort((x, y) => y[1] - x[1])) console.log(`| ${a} | ${n} | ${pct(n, lines.length)} |`);
