#!/usr/bin/env node
// Command-line regression tests for scripts/driver.mjs: what the driver does with its own ARGUMENTS.
//
// Every row here runs the fixture's `happy` scenario, so the server is never the variable: what is
// measured is parsing, prompt files, schema admission, the environment guards, the shape of the report
// and the help. The rows that drive the server through orderings it would not produce on demand are in
// protocol.test.mjs, and both suites share evals/lib/scenarios.mjs.
//
//   node evals/cli.test.mjs
//
// Exit 0 if every case matches its expected exit code.

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DRIVER, ROOT, EXIT, FAKE, readJson, registry, runCases, skip, summarize, tempDir } from "./lib/harness.mjs";
import { SHIM, assertKnownScenarios, explicitTmp, flowState, laxSchemaFile, looseNestedSchemaFile,
         looseSchemaFile, mismatchSessions, notExec, oneOfSchemaFile, optionalSchemaFile,
         run, runTable, sessionsDir, unknownModelLog, until } from "./lib/scenarios.mjs";

const shimDir = SHIM;

// A state directory whose path the cases know before they run, for the refusals that name it; and one
// holding a mailbox, as --new makes it.
const guardState = path.join(tempDir("entrust-guard-"), "state");
fs.mkdirSync(guardState);
const armedState = tempDir("entrust-armed-");
const armedBox = path.join(armedState, "run", "agent", "approvals");
fs.mkdirSync(armedBox, { recursive: true, mode: 0o700 });
// A mailbox inside another run's $TMPDIR, which lies under the state directory when the caller's TMPDIR
// does: the case below exports the state directory itself as TMPDIR.
const isAgentTmp = (tmp, dir) => /^[^/]+\/[^/]+\/agents\/[^/]+$/.test(path.relative(path.join(fs.realpathSync(tmp), "entrust"), dir));
const mailUnderRunTmp = path.join(armedState, "entrust", "runs", "another-run", "approvals");
fs.mkdirSync(mailUnderRunTmp, { recursive: true, mode: 0o700 });
const realOf = (p) => fs.realpathSync(p);
// The directory os.tmpdir() falls back to when a case unsets TMPDIR, so no case writes the machine's /tmp.
const osTmp = tempDir("entrust-os-tmp-");

// The roots the state-directory cases below measure: Claude Code's plugin data directory, which an earlier
// version used and nothing reads now, a home the run must leave untouched, and a TMPDIR whose entrust-state
// is the default. All live under the shim so the suite's own cleanup reaches them.
const pluginData = path.join(shimDir, "plugin-data");
const defaultTmp = path.join(shimDir, "default-tmp");
fs.mkdirSync(defaultTmp, { recursive: true });
const decoyHome = path.join(shimDir, "decoy-home");
fs.mkdirSync(decoyHome, { recursive: true });

// One log per row that reads it: the fixture APPENDS its `codex sandbox` argv, so a shared file would
// let one row match the other's invocation and both settings would look present whichever was sent.
// One log per level for the `cfg:` lines the fixture writes for every -c it was spawned with. The two
// implicit temp grants ride the spawn args and appear in NO report field — sandbox.writableRoots never
// shows them — so a key the driver stopped sending leaves every other sandbox row green.
const writeCfgLog = path.join(shimDir, "cfg-write.log");
const readCfgLog = path.join(shimDir, "cfg-read.log");
const cfgKeys = (log) => (fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "")
  .split("\n").filter((l) => l.startsWith("cfg:")).map((l) => l.slice("cfg:".length));
const TMP_KEYS = ["sandbox_workspace_write.exclude_slash_tmp", "sandbox_workspace_write.exclude_tmpdir_env_var"];
const CASES = [
  { scenario: "happy",            expect: EXIT.SUCCESS,                  why: "a real command succeeded and a final answer arrived" },
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--model", "missing-model"],
    env: { FAKE_RPC_LOG: unknownModelLog },
    why: "model/list rejects a model name absent from the server catalogue before thread/start",
    assertStderr: (e, ms) => {
      const log = fs.existsSync(unknownModelLog) ? fs.readFileSync(unknownModelLog, "utf8") : "";
      return (/model\/list/.test(log) && !/thread\/start/.test(log) && /not in model\/list/.test(e) && ms < 7000)
        || `unknown-model refusal was late or missing: ${JSON.stringify({ ms, log, err: e.slice(0, 180) })}`;
    } },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--model", "sol"],
    env: { FAKE_MODEL_FAMILIES: "1", FAKE_MODEL_ECHO: "1" },
    why: "a short name is the newest listed model of that name, so a new generation is taken up without an edit to the plugin; a hidden newer model is not a release",
    assert: (r) => r.model === "explicit:gpt-6-sol" || `sol did not resolve to gpt-6-sol: ${JSON.stringify(r.model)}`,
    assertStderr: (e) => /--model sol is gpt-6-sol/.test(e) || `the resolution is not on stderr: ${e.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--model", "Luna"],
    env: { FAKE_MODEL_FAMILIES: "1", FAKE_MODEL_ECHO: "1" },
    why: "versions compare as numbers and the name in any case: 6.10 is newer than 6.9, which a string comparison or the list's order would get wrong",
    assert: (r) => r.model === "explicit:gpt-6.10-luna" || `Luna did not resolve to gpt-6.10-luna: ${JSON.stringify(r.model)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--model", "gpt-5.6-sol"],
    env: { FAKE_MODEL_FAMILIES: "1", FAKE_MODEL_ECHO: "1" },
    why: "a full slug pins that version even when a newer model of the same name is listed",
    assert: (r) => r.model === "explicit:gpt-5.6-sol" || `the pinned slug was replaced: ${JSON.stringify(r.model)}` },
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--model", "nova"],
    env: { FAKE_MODEL_FAMILIES: "1" },
    why: "a short name no listed model carries is refused before the turn, with the catalogue in the message",
    assertStderr: (e) => /--model "nova" is not in model\/list; available models: gpt-6-astra/.test(e)
      || `the unknown short name was not refused with the list: ${e.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS,
    why: "the setup rate-limit snapshot reaches every completed report, so fan-outs can see approaching exhaustion",
    assert: (r) => r.rateLimits?.primary?.usedPercent === 25
      || `rateLimits missing from the report: ${JSON.stringify(r.rateLimits)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, env: { FAKE_RATELIMITS_ERROR: "1" },
    why: "a server that rejects account/rateLimits/read costs the report its snapshot, not the whole run",
    assert: (r) => r.rateLimits === null
      || `a rejected snapshot did not leave rateLimits null: ${JSON.stringify(r.rateLimits)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS,
    why: "the server echoes the caller's prompt as a userMessage at the start of a turn; that echo must not count as activity or disarm the no-work retry guard",
    assert: (r) => (r.otherItemCounts === null || r.otherItemCounts.userMessage === undefined)
      || `the caller's own prompt was reported as activity: ${JSON.stringify(r.otherItemCounts)}` },
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nATTACH: /etc/hosts\n",
    why: "ATTACH is not a prompt-file field: a newline in any copied value could inject one, and the injected line would upload a file the coordinator never named to the model provider",
    assertStderr: (e) => /unknown header field ATTACH at line 2 of/.test(e) || `an injected ATTACH was accepted: ${e.slice(0, 160)}` },
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--attach", "/nonexistent/shot.png"],
    why: "a missing attachment is the caller's error, raised before anything runs — the server would otherwise refuse it mid-turn, after the delegation was paid for",
    assertStderr: (e) => /--attach.*does not exist/.test(e) || `the missing file was not named: ${e.slice(0, 140)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS,
    why: "with no --effort the driver must send no override so the caller's config decides; a forced default can silently downgrade the requested effort",
    assert: (r) => r.effort === null && r.reasoningEffort === null
      || `an effort was imposed: requested=${JSON.stringify(r.effort)} selected=${JSON.stringify(r.reasoningEffort)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--effort", "max"],
    why: "max is on the model's advertised ladder and must not be rejected by a stale hardcoded list",
    assert: (r) => r.reasoningEffort === "max" || `--effort max did not reach the server: ${JSON.stringify(r.reasoningEffort)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--resume", "thr_root"],
    why: "a resumed report must name the continued thread so the coordinator can distinguish it from a fresh run and detect a wrong resume target",
    assert: (r) => r.resumedFrom === "thr_root" || `the report did not name the thread it continued: ${JSON.stringify(r.resumedFrom)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, env: { FAKE_MODEL_ECHO: "1" },
    why: "with no --model the driver sends null and the server chooses; FAKE_MODEL_ECHO reports the request so a hardcoded model cannot look inherited. The echo is opt-in because fidelity.test.mjs compares this field with the live server",
    assert: (r) => r.model === "inherited" || `a model was imposed rather than inherited: ${JSON.stringify(r.model)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS,
    env: { PATH: "/usr/bin:/bin", ENTRUST_CODEX: path.join(shimDir, "codex") },
    why: "with codex absent from PATH the driver honours ENTRUST_CODEX — a non-login shell must not need a PATH export ritual" },
  { scenario: "happy",            expect: EXIT.USAGE,
    env: { ENTRUST_CODEX: "codex" },
    why: "a relative ENTRUST_CODEX would resolve against the invocation cwd; only an absolute executable is accepted",
    assertStderr: (e) => /ENTRUST_CODEX must be an absolute path/.test(e) || `the override was not validated: ${e.slice(0, 140)}` },
  // --- the state directory: ENTRUST_STATE_DIR, else <tmp>/entrust-state ---
  { scenario: "happy",            expect: EXIT.SUCCESS, unsetEnv: ["ENTRUST_STATE_DIR"],
    env: { TMPDIR: defaultTmp, CLAUDE_PLUGIN_DATA: pluginData, HOME: decoyHome },
    why: "with no ENTRUST_STATE_DIR the state is <tmp>/entrust-state, beside the scratch tree: nothing goes under a home directory, and Claude Code's plugin data directory, which an earlier version used, is not read",
    assert: () => {
      const state = path.join(defaultTmp, "entrust-state");
      const made = fs.existsSync(state) ? fs.readdirSync(state) : [];
      if (!made.some((n) => ["locks", "answers", "home", "jobs"].includes(n)))
        return `the run left no state under <tmp>/entrust-state: ${JSON.stringify(made)}`;
      if (fs.existsSync(pluginData)) return `the run wrote under CLAUDE_PLUGIN_DATA: ${fs.readdirSync(pluginData).join(", ")}`;
      const under = fs.readdirSync(decoyHome);
      return under.length === 0 || `the run wrote under $HOME: ${under.join(", ")}`;
    } },
  { scenario: "happy",            expect: EXIT.USAGE, env: { ENTRUST_STATE_DIR: "state" },
    why: "a relative state directory resolves against whatever cwd the caller happened to have: a relative one used to be accepted, and the answer log and the turn diff then dropped their artefact in silence",
    assertStderr: (e) => /ENTRUST_STATE_DIR must be an absolute path/.test(e)
      || `the relative value was not refused by name: ${e.slice(0, 160)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, env: { FAKE_CONFIG_FAIL: "1" },
    why: "a failed config probe must say so out loud — the silent path changed which model answers and made identical runs nondeterministic",
    assertStderr: (e) => /could not read the caller's Codex config/.test(e)
      || `the downgrade was silent: ${e.slice(0, 160)}` },
  // be the mechanism that ends the child.

  // --- report shape: defaults, receipt, exit-5 hint ---
  { scenario: "happy",            expect: EXIT.SUCCESS,
    why: "the JSON report is the ONLY report: no flag selects it, and none selects anything else",
    assert: (r) => r.ok === true || `expected a JSON report, got ${JSON.stringify(r).slice(0, 60)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS,
    why: "the report locates the rollout receipt itself; a scripted thread id matches nothing real, so the honest answer is receiptOk false with a null path",
    assert: (r) => (r.receiptOk === false && r.receiptPath === null)
      || `receipt fields wrong for a fixture run: ${JSON.stringify({ ok: r.receiptOk, path: r.receiptPath })}` },
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--output-schema", "/nonexistent/schema.json"],
    why: "an unreadable schema is the caller's error, raised before anything runs",
    assertStderr: (t) => /--output-schema cannot read/.test(t) || `stderr did not name the schema file: ${t.slice(0, 120)}` },
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--output-schema", laxSchemaFile],
    why: "schema admission requires an explicit object contract; an empty or oneOf-only schema must not certify arbitrary values as valid output",
    assertStderr: (t) => /must declare "type": "object"/.test(t) || `admission let a type-less schema through: ${t.slice(0, 140)}` },
  // --- --prompt-file: a wrapper writes values, it does not build a command line out of them ---
  { scenario: "happy",            expect: EXIT.SUCCESS, agent: "RIGHTS: read <CWD>\nEXPECT: echo\nBRIEF: yes\n",
    why: "the ordinary prompt file maps to the same flags the CLI takes, so a caller never has to quote anything",
    assert: (r) => (r.level === "read" && r.commandsMatchingExpectation > 0 && r.answerTruncated === false)
      || `prompt file did not map cleanly: ${JSON.stringify({ l: r.level, e: r.commandsMatchingExpectation })}` },
  { scenario: "happy",            expect: EXIT.COMMANDS,
    agent: "RIGHTS: read <CWD>\nEXPECT: x' --level write --cwd / --writable / --no-network '\n",
    why: "THE reason this flag exists: a hostile header value must stay one value. Interpolated into a shell command line the same characters would have granted write level and the filesystem root, and taken away the egress the agent runs with. The NEGATIVE is what makes the egress half of this case bite: an escaped --network would leave a sandbox indistinguishable from the default one",
    assert: (r) => (r.level === "read" && r.network === true && r.sandbox?.type === "workspaceWrite"
        && (r.sandbox?.writableRoots ?? []).length <= 1 && String(r.expectCommand).includes("--writable"))
      || `a prompt-file value escaped into flags: ${JSON.stringify({ l: r.level, n: r.network, roots: r.sandbox?.writableRoots })}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, agent: "RIGHTS: read <CWDSP>\nEXPECT: echo\n",
    why: "the RIGHTS value is literal to end of line; collapsing consecutive spaces would silently change where rights are granted",
    assert: (r) => String(r.cwd).endsWith("two  spaces") || `the spaced path was rewritten: ${JSON.stringify(r.cwd)}` },
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nBOGUS: x\n",
    why: "an unknown field is a malformed agent, not a field to ignore — a typo must never silently become a different agent",
    assertStderr: (t) => /unknown header field BOGUS at line 2 of/.test(t) || `stderr did not name the field: ${t.slice(0, 120)}` },
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nRIGHTS: write /tmp\n",
    why: "a repeated RIGHTS is a contradiction about rights; last-wins would let an appended line quietly upgrade the agent",
    assertStderr: (t) => /RIGHTS appears more than once/.test(t) || `stderr did not reject the duplicate: ${t.slice(0, 120)}` },
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nWRITABLE: /tmp\n",
    why: "the file goes through the same flag guards as the CLI, so a read agent asking for a second writable root fails exactly as --level read --writable does",
    assertStderr: (t) => /--writable belongs to --level write/.test(t) || `the level guard did not fire: ${t.slice(0, 120)}` },
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--level", "write", "--writable", notExec],
    why: "a writable root is a directory: a regular file named as one is the caller's error before the turn",
    assertStderr: (t) => /--writable is not a directory:/.test(t) || `a file root was accepted: ${t.slice(0, 160)}` },

  // --- the mailbox: set by the launcher, refused before anything is spawned wherever a sandbox could reach it ---
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--approval-dir", "mailbox"],
    why: "a relative mailbox resolves against whatever cwd the driver was started in",
    assertStderr: (t) => /--approval-dir must be an absolute path/.test(t) || `a relative mailbox was accepted: ${t.slice(0, 160)}` },
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--approval-dir", "/nonexistent/entrust-mailbox"],
    why: "the launcher makes the mailbox; one that is not there was never made",
    assertStderr: (t) => /--approval-dir does not exist/.test(t) || `a missing mailbox was accepted: ${t.slice(0, 160)}` },
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--approval-dir", shimDir],
    why: "a mailbox outside the state directory is a place some sandbox may be able to write, and then an agent can publish its own decision",
    assertStderr: (t) => /is not inside this driver's state directory/.test(t) || `a mailbox outside the state directory was accepted: ${t.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.USAGE, env: { ENTRUST_STATE_DIR: guardState }, args: ["--approval-dir", guardState],
    why: "inside means inside: the state directory itself holds the locks and the answer log, and a mailbox is a directory of its own below it",
    assertStderr: (t) => /is not inside this driver's state directory/.test(t) || `the state directory itself was accepted as a mailbox: ${t.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.USAGE, env: { ENTRUST_STATE_DIR: armedState, TMPDIR: armedState }, args: ["--approval-dir", mailUnderRunTmp],
    why: "<tmp>/entrust holds every run's $TMPDIR, which that run's sandbox writes: with the caller's TMPDIR inside the state directory another run's lies there too, this run's own roots do not cover it, so the whole of <tmp>/entrust is refused",
    assertStderr: (t) => /lies inside .*\/entrust, which this driver keeps for itself or hands to agents as a writable root/.test(t)
      || `a mailbox under another run's private $TMPDIR was accepted: ${t.slice(0, 240)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, env: { ENTRUST_STATE_DIR: armedState }, args: ["--approval-dir", armedBox],
    why: "an agent with a mailbox and nothing to ask runs as any other, and its report names the mailbox and no entries",
    assert: (r) => (r.approvalDir === realOf(armedBox) && r.escalations.length === 0 && r.approvalsAccepted === 0 && r.approvalsStale === 0 && r.approvalsLate === 0)
      || `the armed run's report is wrong: ${JSON.stringify({ dir: r.approvalDir, esc: r.escalations, acc: r.approvalsAccepted })}` },
  { scenario: "happy",            expect: EXIT.USAGE, env: { ENTRUST_STATE_DIR: armedState }, args: ["--approval-dir", armedBox, "--approval-timeout", "30"],
    why: "the deadline is a constant in the driver, not a flag: nobody could say who would set it or why the default could not decide, so the old flag is an unknown argument like any other",
    assertStderr: (t) => /unknown argument: --approval-timeout/.test(t) || `--approval-timeout was still accepted: ${t.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nAPPROVAL_DIR: /tmp\n",
    why: "the mailbox is the launcher's command line: a header able to name one would let a copied line choose where decisions come from",
    assertStderr: (t) => /APPROVAL_DIR is command-line-only; pass --approval-dir/.test(t) || `a prompt file armed the channel: ${t.slice(0, 200)}` },

  // --- egress: on at both levels, off only where the caller says so ---
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--writable", "/tmp"],
    why: "--writable grants a second root to WRITE in, and read level has none; the flag egress used to be paired with is now a default, and this half of the rule is untouched by that",
    assertStderr: (t) => /--writable belongs to --level write/.test(t) || `the level guard did not fire: ${t.slice(0, 140)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS,
    why: "an agent that names no network gets one, as a Claude subagent does: a grant the coordinator has to know to ask for is a rule to be told, and the whole claim of this level is that there is none",
    assert: (r) => (r.network === true && r.sandbox?.networkAccess === true)
      || `a read agent that named nothing got no egress: ${JSON.stringify({ n: r.network, sb: r.sandbox })}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--no-network"],
    why: "the negative is the whole of the opt-out, so it has to reach the permission profile the read level runs under and not only the report field",
    assert: (r) => (r.network === false && r.sandbox?.networkAccess === false)
      || `--no-network did not reach the read sandbox: ${JSON.stringify({ n: r.network, sb: r.sandbox })}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, agent: "RIGHTS: read <CWD>\nNETWORK: yes\n",
    why: "egress is not a level any more, so a read agent may declare it out loud; what it gets is the sandbox it would have got by saying nothing",
    assert: (r) => (r.level === "read" && r.network === true && r.sandbox?.networkAccess === true)
      || `an explicit positive did not reach a read agent: ${JSON.stringify({ l: r.level, n: r.network, sb: r.sandbox })}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, agent: "RIGHTS: read <CWD>\nNETWORK: no\n", args: ["--network"],
    why: "an explicit flag still outranks the file's field, and with a two-sided grant that promise is testable in both directions rather than only in the one the default already occupies",
    assert: (r) => (r.network === true && r.sandbox?.networkAccess === true)
      || `the header's negative outranked the command line: ${JSON.stringify({ n: r.network, sb: r.sandbox })}` },
  // The write level asks for egress through a different key — a sandbox setting rather than the read
  // profile's `network` table — so every one of the three shapes above is a separate question there.
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--level", "write"],
    why: "the level decides what may be WRITTEN, not what may be reached; a fresh tree that has to install its own dependencies would otherwise need a flag whose absence looks like a working agent until the install fails",
    assert: (r) => (r.level === "write" && r.network === true && r.sandbox?.networkAccess === true)
      || `a write agent that named nothing got no egress: ${JSON.stringify({ l: r.level, n: r.network, sb: r.sandbox })}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--level", "write", "--no-network"],
    why: "the negative has to reach sandbox_workspace_write.network_access, at the level where that key is the only thing standing between the turn and the internet",
    assert: (r) => (r.level === "write" && r.network === false && r.sandbox?.networkAccess === false)
      || `--no-network did not reach the write sandbox: ${JSON.stringify({ l: r.level, n: r.network, sb: r.sandbox })}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, agent: "RIGHTS: write <CWD>\nNETWORK: no\n",
    why: "the prompt file is how a coordinator declares an agent, and the level is part of that declaration: a negative honoured at read level and dropped at write would leave the one level whose turn can also WRITE reaching the network it was told to stay off",
    assert: (r) => (r.level === "write" && r.network === false && r.sandbox?.networkAccess === false)
      || `the header's negative did not reach the write sandbox: ${JSON.stringify({ l: r.level, n: r.network, sb: r.sandbox })}` },

  // --- token accounting ---
  { scenario: "happy",            expect: EXIT.SUCCESS,
    why: "the report must carry the ROOT thread's token accounting; a later subagent usage event with a larger total exposes a missing thread filter",
    assert: (r) => r.tokenUsage?.total?.totalTokens === 135
      || `tokenUsage missing, wrong, or taken from another thread: ${JSON.stringify(r.tokenUsage)}` },

  // --- receipt location and identity ---
  { scenario: "happy",            expect: EXIT.SUCCESS, env: { ENTRUST_SESSIONS_DIR: sessionsDir },
    why: "the receipt must be located and read: a matching session_meta makes receiptOk true",
    assert: (r) => (r.receiptOk === true && typeof r.receiptPath === "string")
      || `a genuine rollout was not recognised: ${JSON.stringify({ ok: r.receiptOk, path: r.receiptPath, why: r.receiptWhy })}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, env: { ENTRUST_SESSIONS_DIR: mismatchSessions },
    why: "a filename match is not a receipt: a rollout named for this thread whose session_meta names another one is found but NOT verified, because matching a name is as strong as `touch rollout-<id>.jsonl`",
    assert: (r) => (r.receiptOk === false && typeof r.receiptPath === "string" && /session id/.test(r.receiptWhy ?? ""))
      || `a mismatched rollout was accepted or misreported: ${JSON.stringify({ ok: r.receiptOk, path: r.receiptPath, why: r.receiptWhy })}` },

  // --- --output-schema: reject non-strict schemas before the turn ---
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--output-schema", looseSchemaFile],
    why: "an ordinary JSON Schema is rejected by the server with 400 invalid_json_schema AFTER the turn has started, costing the whole delegation; the admission check must catch it first",
    assertStderr: (e) => /additionalProperties/.test(e) || `a non-strict schema was admitted: ${e.slice(0, 160)}` },
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--output-schema", looseNestedSchemaFile],
    why: "the strict rule applies at EVERY level — measured, the server names the context ('properties','meta') — so a top-level-only check still spends a turn to find out",
    assertStderr: (e) => /properties\.meta/.test(e) || `a non-strict nested object was admitted: ${e.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.USAGE, args: ["--output-schema", optionalSchemaFile],
    why: "a strict schema permits no optional property: `required` must list every key in `properties`, or the server refuses the request",
    assertStderr: (e) => /required.*every key|Missing|"note"/.test(e) || `an optional property was admitted: ${e.slice(0, 200)}` },

  // --- the prompt file: what a wrapper hands over must not be able to become rights ---
  { scenario: "happy", agent: "EXPECT: foo\nRIGHTS: read <CWD>\n", expect: EXIT.USAGE,
    why: "RIGHTS must come FIRST. A file whose first field is anything else left the rights slot open, and an injected `RIGHTS: write ...` line then defined them",
    assertStderr: (e) => /first field must be RIGHTS/.test(e) || `a prompt file without a leading RIGHTS was accepted: ${e.slice(0, 160)}` },
  { scenario: "happy", noPrompt: true, agent: "# a header that declares nothing\n\nTASK: do it\n", expect: EXIT.SUCCESS,
    why: "a prompt file with no RIGHTS at all is a coordinator's prompt copied verbatim, which is what the direct route hands over; the default it falls back to is the narrowest rights there are, and it is REPORTED as undeclared so nobody reads it as a grant somebody made",
    assert: (r) => (r.level === "read" && !(r.promptFileFields ?? []).includes("RIGHTS"))
      || `a header-less file did not default to a read agent: ${JSON.stringify({ level: r.level, fields: r.promptFileFields })}` },
  { scenario: "happy", agent: "RIGHTS: read <CWD>\nVERIFY: touch <CWD>/agent-verify-must-not-run\n", expect: EXIT.USAGE,
    why: "a newline in a copied value can inject a header line, and a VERIFY one once ran an unsandboxed shell with the caller's rights; the driver has no verifier now, so the name is refused as unknown, never ignored",
    assertStderr: (e) => /unknown header field VERIFY/.test(e) || `an injected VERIFY was not refused: ${e.slice(0, 200)}` },
  { scenario: "happy", agent: "RIGHTS: read <CWD>\nEXPECT: echo\n", expect: EXIT.SUCCESS,
    why: "the report names what the FILE declared, so a wrapped agent is not indistinguishable from a hand-typed one",
    assert: (r) => (Array.isArray(r.promptFileFields) && r.promptFileFields.join(",") === "RIGHTS,EXPECT")
      || `promptFileFields wrong: ${JSON.stringify(r.promptFileFields)}` },


  // --- the agent's $TMPDIR is always the run's own, whatever the caller exported ---
  // With no TMPDIR exported the base is Node's os.tmpdir(), which reads TMP next: set here, so the case
  // writes nothing into the machine's own /tmp.
  { scenario: "happy",            expect: EXIT.SUCCESS, unsetEnv: ["TMPDIR"], env: { TMP: osTmp },
    why: "a directory of the run's own permits scratch writes without granting all of the temporary directory: made fresh at 0700 under <tmp>/entrust/<project>/<run>/agents/<agent> when there is no report to name it after, every level it made 0700 too, and still there after the run",
    assert: (r) => {
      const roots = r.sandbox?.writableRoots ?? [];
      if (roots.length !== 1) return `the private temp grant is not exactly one root: ${JSON.stringify(roots)}`;
      if (!r.tmpDir || !isAgentTmp(osTmp, r.tmpDir))
        return `the run's directory is not <tmp>/entrust/<project>/<run>/agents/<agent>: ${JSON.stringify(r.tmpDir)}`;
      if (fs.realpathSync(r.tmpDir) !== roots[0]) return `the grant is not the reported directory: ${JSON.stringify({ tmpDir: r.tmpDir, root: roots[0] })}`;
      for (const d of [r.tmpDir, path.dirname(r.tmpDir), path.join(osTmp, "entrust")])
        if ((fs.statSync(d).mode & 0o777) !== 0o700) return `${d} is not 0700: ${(fs.statSync(d).mode & 0o777).toString(8)}`;
      return true;
    } },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--level", "write"], env: { FAKE_RPC_LOG: writeCfgLog },
    why: "the write sandbox's two temp exclusions are sent as -c keys and reported in no field of the driver's own: without them an agent granted one --cwd also writes all of /tmp and its own $TMPDIR is a grant nobody declared",
    assert: () => {
      const keys = cfgKeys(writeCfgLog);
      if (!keys.length) return `the fixture recorded no -c keys at all: ${writeCfgLog}`;
      const missing = TMP_KEYS.filter((k) => !keys.includes(k));
      return missing.length === 0 || `the write level did not send ${missing.join(", ")}: ${JSON.stringify(keys)}`;
    } },
  { scenario: "happy",            expect: EXIT.SUCCESS, env: { FAKE_RPC_LOG: readCfgLog },
    why: "and the read level must not send them: the :read-only profile ignores both keys, so sending them would be a declaration nothing reads while the level's real grant is its filesystem entry",
    assert: () => {
      const keys = cfgKeys(readCfgLog);
      if (!keys.length) return `the fixture recorded no -c keys at all: ${readCfgLog}`;
      const sent = TMP_KEYS.filter((k) => keys.includes(k));
      return sent.length === 0 || `the read level sent write-level sandbox keys: ${JSON.stringify(sent)}`;
    } },
  { scenario: "happy",            expect: EXIT.SUCCESS, env: { TMPDIR: explicitTmp },
    why: "a caller's TMPDIR is never the agent's whole grant: every agent a coordinator starts inherits the same one, and two that named one file there overwrote each other with no error (E92), so the grant is the run's own directory inside it and the report names it",
    assert: (r) => {
      const roots = r.sandbox?.writableRoots ?? [];
      if (!r.tmpDir || !isAgentTmp(explicitTmp, r.tmpDir)) return `the run's own directory is not grouped by project/run/agents under the caller's TMPDIR: ${JSON.stringify(r.tmpDir)}`;
      return (roots.length === 1 && roots[0] === fs.realpathSync(r.tmpDir))
        || `the grant is not the run's own directory (the caller's is ${fs.realpathSync(explicitTmp)}): ${JSON.stringify(roots)}`;
    } },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--level", "write"], env: { TMPDIR: explicitTmp },
    why: "the same at write level, where $TMPDIR is an implicit grant writableRoots never shows: the caller's is no extra root, the run's own is named, and both temp exclusions read back as sent",
    assert: (r) => {
      const roots = r.sandbox?.writableRoots ?? [];
      if (roots.length) return `a write run with no --writable reported extra roots: ${JSON.stringify(roots)}`;
      if (!r.tmpDir || !isAgentTmp(explicitTmp, r.tmpDir)) return `the run's own directory is not grouped by project/run/agents under the caller's TMPDIR: ${JSON.stringify(r.tmpDir)}`;
      return (r.sandbox?.excludeSlashTmp === true && r.sandbox?.excludeTmpdirEnvVar === false)
        || `the temp exclusions are not what was sent: ${JSON.stringify({ slash: r.sandbox?.excludeSlashTmp, env: r.sandbox?.excludeTmpdirEnvVar })}`;
    } },

  // --- what the report says about the run's own footing ---
  { scenario: "happy",            expect: EXIT.SUCCESS,
    why: "the initialize response carries the server version in userAgent; the report must preserve it so protocol drift is diagnosable",
    assert: (r) => (r.codexVersion === "0.159.3" && r.codexVersionPinned === "0.159.3")
      || `codexVersion was not read out of the userAgent: ${JSON.stringify({ v: r.codexVersion, pinned: r.codexVersionPinned })}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, env: { FAKE_CODEX_VERSION: "9.9.9" },
    why: "a codex that is not the one the protocol facts were measured against is the first thing to know when behaviour contradicts the docs; it must be said on stderr and in the report, not inferred from a later failure",
    assert: (r) => r.codexVersion === "9.9.9" || `drift was not reported: ${JSON.stringify(r.codexVersion)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS,
    why: "the report must distinguish config inherited from a fresh probe, a last-known-good snapshot and account defaults",
    assert: (r) => (r.configInherited?.source === "probe" && r.configInherited.keys.includes("model"))
      || `a healthy probe was not reported as one: ${JSON.stringify(r.configInherited)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS,
    env: { FAKE_CONFIG_PROVIDER: "1" },
    why: "isolating the environment must not isolate the account: a caller whose config selects a provider of its own would otherwise run on the default provider",
    assert: (r) => {
      const toml = fs.readFileSync(path.join(r.codexHome, "config.toml"), "utf8");
      return (toml.includes('model_provider = "corp"') && toml.includes('[model_providers."corp"]')
        && toml.includes('"base_url" = "https://llm.example.invalid/v1"') && toml.includes('"query_params" = { "api-version" = "2025-01-01" }')
        && toml.includes('"request_max_retries" = 4') && !toml.includes("nested") && r.configInherited.keys.includes("model_providers"))
        || `the provider was not carried: ${toml}`;
    } },
  { scenario: "happy",            expect: EXIT.SUCCESS,
    env: { FAKE_CONFIG_FAIL: "1" },
    why: "the same field must distinguish the unhealthy case: a probe that failed with no last-known-good to keep means the turn ran on the account defaults",
    assert: (r) => (r.configInherited?.source === "none" && r.configInherited.keys.length === 0)
      || `a failed probe was reported as inheritance: ${JSON.stringify(r.configInherited)}` },
  { scenario: "happy",            expect: EXIT.USAGE,
    args: ["--output-schema", oneOfSchemaFile, "--cwd", "/nonexistent/pid-line-first"],
    why: "the pid on the FIRST stderr line is what every page tells a coordinator to signal and what the live gate reads; a schema warning written from inside the argument parser put a line in front of it that a reader taking the first line would signal nothing at all",
    assertStderr: (e) => (/^entrust: pid=\d+ identity=/.test(e.split("\n")[0] ?? "") && /does not check \(oneOf\)/.test(e))
      || `the pid line is not first, or the warning was lost: ${JSON.stringify(e.split("\n").slice(0, 3))}` },
  { scenario: "happy",            expect: EXIT.SUCCESS,
    env: { FAKE_CONFIG_NULL: "1" },
    why: "the probe channel has no message handler, so a bare `null` line reached the response resolver and threw there — an uncaught TypeError with no report at all, before the turn had started",
    assert: (r) => (r.configInherited?.source === "probe" && r.configInherited.keys.includes("model"))
      || `a non-object frame cost the probe its answer: ${JSON.stringify(r.configInherited)}` },

  // --- --expect-command is matched against the command, not the shell that ran it ---
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--expect-command", "^echo"],
    why: "the live server reports a shell wrapper, so --expect-command must also match the parsed command for anchored patterns to work",
    assert: (r) => r.commandsMatchingExpectation === 1
      || `an anchored pattern did not match the parsed command: ${JSON.stringify({ n: r.commandsMatchingExpectation })}` },

  // --- the prompt file is written by a program, so it must take the shapes a program writes ---
  { scenario: "happy", agent: "RIGHTS: read <CWD>\nEXPECT: echo\nNETWORK: no\nALLOW_NO_COMMANDS: false\nBRIEF: 0\n", expect: EXIT.SUCCESS,
    why: "NETWORK/ALLOW_NO_COMMANDS/BRIEF must accept explicit false values in a header template: for the two whose default is off that is a flag not added, and for NETWORK, whose default is on, it is egress actually denied — reading it as omission is the one shape that grants what the template said to withhold",
    assert: (r) => (r.network === false && r.sandbox?.networkAccess === false
        && r.promptFileFields?.join(",") === "RIGHTS,EXPECT,NETWORK,ALLOW_NO_COMMANDS,BRIEF")
      || `a negated boolean was mishandled: ${JSON.stringify({ net: r.network, sb: r.sandbox?.networkAccess, fields: r.promptFileFields })}` },

  { scenario: "happy",            expect: EXIT.SUCCESS,
    why: "durationMs on commandExecution items distinguishes time spent running commands from time spent in the model",
    assert: (r) => {
      const t = r.timing;
      if (!t || typeof t.wallMs !== "number" || typeof t.setupMs !== "number") return `no timing in the report: ${JSON.stringify(t)}`;
      if (!(t.wallMs > 0 && t.setupMs >= 0 && t.setupMs <= t.wallMs)) return `timing is not internally consistent: ${JSON.stringify(t)}`;
      if (t.commandMs !== 1) return `commandMs did not come from the item's own durationMs: ${JSON.stringify(t)}`;
      return t.modelMs === t.wallMs - t.setupMs - t.commandMs || `modelMs is not the remainder: ${JSON.stringify(t)}`;
    } },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--effort", "high"],
    why: "the measured failure shape: a high-effort turn spends minutes thinking before it writes anything, and under a short clock the cut lands before an answer exists. The warning is on stderr at the threadId announcement, while the caller can still stop the run",
    assertStderr: (e) => /effort high with --timeout 20s is the measured failure shape/.test(e)
      || `no warning for high effort under a short clock: ${e.slice(0, 300)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, args: ["--effort", "low"],
    why: "and it must stay quiet otherwise: a warning printed on every run is a warning nobody reads",
    assertStderr: (e) => !/measured failure shape/.test(e) || `the effort warning fired for low effort: ${e.slice(0, 200)}` },

  // --- the token accounting the SERVER does, which is not a bound the driver enforces ---
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nBUDGET_TOKENS: 100000\n",
    why: "the driver has no token-budget knob; a header naming one must fail loudly rather than imply an unenforced bound",
    assertStderr: (e) => /unknown header field BUDGET_TOKENS at line 2 of/.test(e)
      || `BUDGET_TOKENS was still understood: ${e.slice(0, 200)}` },

  // --- the bounds and the transport are flags: a prompt file naming one is exit 2 ---
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nTIMEOUT: 30\n",
    why: "the wall clock is the configuration the default exists to remove: a header that carries a TIMEOUT reintroduces exactly the bound every agent would otherwise have to size, so the field is refused and the flag stays for the caller who really wants one",
    assertStderr: (e) => /TIMEOUT is command-line-only; pass --timeout/.test(e)
      || `a prompt file still set the wall clock: ${e.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nIDLE_TIMEOUT: 300\n",
    why: "the default idle guard and command cap belong to the driver; a copied header must not widen or disable these hang guards",
    assertStderr: (e) => /IDLE_TIMEOUT is command-line-only; pass --idle-timeout/.test(e)
      || `a prompt file still set the silence guard: ${e.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nMAX_COMMANDS: 2\n",
    assertStderr: (e) => /MAX_COMMANDS is command-line-only; pass --max-commands/.test(e)
      || `a prompt file still set the command cap: ${e.slice(0, 200)}`,
    why: "the volume cap is the maxTurns a native subagent has; the driver owns it" },
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nREPORT_FILE: /tmp/elsewhere.json\n",
    why: "the delivery is the caller's, not the header's: the report file is where the run's whole evidence lands, so a line inside the prompt that redirects it is an agent writing its own answer somewhere its coordinator never looks",
    assertStderr: (e) => /REPORT_FILE is command-line-only; pass --report-file/.test(e)
      || `a prompt file still chose where the report lands: ${e.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: read <CWD>\nTIMEOUT: 30\n", args: ["--timeout", "5"],
    why: "and the refusal is not waived by passing the flag too: a prompt file that names a bound is a caller who believes the file decides it, and running the flag's value silently would leave that belief in place",
    assertStderr: (e) => /TIMEOUT is command-line-only/.test(e)
      || `an explicit --timeout beside the field made the field acceptable: ${e.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, noTimeout: true, args: ["--effort", "high"],
    why: "the 'high effort with a short clock' warning is about a clock that was SET; on the default it would fire on every run and warn about a budget nobody declared",
    assertStderr: (e) => !/measured failure shape/.test(e)
      || `the effort warning fired with no wall clock: ${e.slice(0, 200)}` },

  // --- the read level's cwd: a grant only where it grants something ---
  { scenario: "happy",            expect: EXIT.SUCCESS, agent: "RIGHTS: read\nEXPECT: echo\n",
    why: "RIGHTS: read without a directory means the current tree and grants no additional write rights",
    assert: (r) => (r.cwd === (fs.realpathSync(process.cwd())) && (r.promptFileFields ?? []).join(",") === "RIGHTS,EXPECT")
      || `a bare RIGHTS: read did not default to the current directory: ${JSON.stringify({ cwd: r.cwd, fields: r.promptFileFields })}` },
  { scenario: "happy",            expect: EXIT.USAGE, agent: "RIGHTS: write\n",
    why: "and NOT at write level: there the cwd is the writable root itself, and a defaulted grant is one nobody made — the driver would hand the turn whatever directory the caller happened to be standing in",
    assertStderr: (e) => /RIGHTS must be read, write <dir> or worktree <repo>, not "write"/.test(e)
      || `a bare RIGHTS: write defaulted its writable root: ${e.slice(0, 200)}` },
  { scenario: "happy",            expect: EXIT.USAGE, noCwd: true, args: ["--level", "write"],
    why: "the command line applies the same cwd rule: read can use the current directory, while write requires an explicit grant",
    assertStderr: (e) => /--cwd is required at --level write/.test(e)
      || `--level write ran without a writable root: ${e.slice(0, 200)}` },
  { scenario: "happy", expect: EXIT.USAGE, noPrompt: true,
    agent: "RIGHTS: read <CWD>\nEXPECT: echo\nNOTE: not a field\nTASK: do it\n",
    why: "an unknown ALL-CAPS name above the body is a typo or flag; silently treating it as prompt text would leave a believed setting unapplied",
    assertStderr: (e) => (/unknown header field NOTE at line 3 of/.test(e) && /the body starts at the first TASK: line/.test(e))
      || `the unknown field did not name its line and the way out: ${e.slice(0, 240)}` },
  { scenario: "happy", expect: EXIT.USAGE,
    agent: "RIGHTS: read <CWD>\nEXPECT: echo\nTASK: the file's own body\n",
    why: "the file's body and --prompt are two prompts, and no rule says which one ran; the harness passes --prompt to every case that does not opt out, so this is also what proves the body route is the one being measured above",
    assertStderr: (e) => /carries a body below its header and --prompt was given too/.test(e)
      || `two prompts were accepted: ${e.slice(0, 200)}` },
];

assertKnownScenarios(CASES);

// --- flows: what one run of the driver cannot express ---
//
// A record written by one run and read by the next, a report delivered to a file, a signal mid-turn:
// each step's state is the next step's input, so these are procedural rather than table cases.
// Each gets a state directory of its own: every fixture run reports the SAME thread id, so a shared
// registry would let one flow read another's record.
const { cases: FLOWS, test: flow } = registry();

flow("with no wall clock, a prompt that never arrives on stdin is ended by the silence budget",
  "with no wall clock, an open stdin pipe from a dead caller can hold the driver forever before any thread exists; the stdin read needs its own bound",
  async () => {
    const state = flowState();
    const p = spawn(process.execPath, [DRIVER, "--level", "read", "--cwd", shimDir, "--idle-timeout", "2"],
      { env: { ...process.env, PATH: `${shimDir}:${process.env.PATH}`, FAKE_SCENARIO: "happy",
               ENTRUST_STATE_DIR: state },
        // A pipe nobody ever writes to and nobody closes: the shape of a dead caller.
        stdio: ["pipe", "pipe", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => { err += d; });
    p.stdout.resume();
    const startedAt = Date.now();
    const code = await new Promise((r) => { p.on("close", r); setTimeout(() => { try { p.kill("SIGKILL"); } catch {} }, 20000); });
    const ms = Date.now() - startedAt;
    if (code !== EXIT.TIMEOUT) return `expected exit 3, got ${code} after ${ms}ms: ${err.slice(0, 200)}`;
    if (!/no prompt arrived on stdin within the 2s silence budget/.test(err))
      return `the abort did not name the budget that ended it: ${err.slice(0, 200)}`;
    return ms < 15000 || `the silence budget took ${ms}ms to fire`;
  });

// --- the report file: the delivery a caller holding no pipe collects the run from ---

const reportPath = (state, name = "report.json") => path.join(state, name);

flow("--report-file publishes the whole report at 0600, byte for byte what stdout carried",
  "the caller reads the file after the task's exit notification, not the pipe: a file that differs from stdout by one escape, or that a second agent can read, is a second report format and a leak of the agent's answer",
  async () => {
    const problems = [];
    // A long report and one carrying non-ASCII and escapes: the file is the same bytes either way, or
    // an answer that survived the pipe is not the one on disk.
    for (const [scenario, args, prompt] of [
      ["long-answer", [], undefined],
      ["echo-input", [], "кавычки \"x\" \\ ⧉  and a newline\nbelow"]]) {
      const state = flowState();
      const p = reportPath(state);
      const { code, out, err } = await run({ scenario, args: [...args, "--report-file", p],
        ...(prompt === undefined ? {} : { noPrompt: true }),
        env: { ENTRUST_STATE_DIR: state },
        ...(prompt === undefined ? {} : { agent: `RIGHTS: read <CWD>\n${prompt}\n` }) });
      if (code !== EXIT.SUCCESS) { problems.push(`${scenario} exited ${code}: ${err.trim().slice(-160)}`); continue; }
      if (!fs.existsSync(p)) { problems.push(`${scenario}: no report at ${p}`); continue; }
      const mode = fs.statSync(p).mode & 0o777;
      if (mode !== 0o600) problems.push(`${scenario}: the report is mode ${mode.toString(8)}, not 600`);
      const onDisk = fs.readFileSync(p, "utf8");
      if (onDisk !== out) problems.push(`${scenario}: the file is ${onDisk.length} bytes and stdout ${out.length}`);
      if (!readJson(p)) problems.push(`${scenario}: the published report does not parse`);
      // Nothing is left beside it: the temp name the rename published from is gone.
      const left = fs.readdirSync(state).filter((n) => n.startsWith("report.json."));
      if (left.length) problems.push(`${scenario}: the publication left ${left.join(", ")}`);
    }
    return problems.length === 0 || problems.join("; ");
  });

flow("--report-file makes the directories its path needs, at 0700, however many levels are missing",
  "the coordinator that names the path cannot make it: in a headless session a Write or a mkdir under the plugin's data directory is denied as a sensitive path with no prompt anyone can answer, while this process handed the same path as an argument is not — so a run directory only the driver ever creates is what the orchestrate page can promise",
  async () => {
    const problems = [];
    for (const [label, ...parts] of [["one level", "run", "agent", "report.json"],
                                     ["two levels", "orchestrate", "slug", "run", "agent", "report.json"]]) {
      const state = flowState();
      const p = path.join(state, ...parts);
      const { code, out, err } = await run({ scenario: "happy", args: ["--report-file", p],
        env: { ENTRUST_STATE_DIR: state } });
      if (code !== EXIT.SUCCESS) { problems.push(`${label}: exit ${code}: ${err.trim().slice(-160)}`); continue; }
      if (!fs.existsSync(p)) { problems.push(`${label}: no report at ${p}`); continue; }
      if (fs.readFileSync(p, "utf8") !== out) problems.push(`${label}: the file is not the bytes stdout carried`);
      // Every directory the run made, not the last one alone: an intermediate left at 0755 is a run
      // directory any other account on the machine can list.
      for (let d = path.dirname(p); d !== state; d = path.dirname(d)) {
        const mode = fs.statSync(d).mode & 0o777;
        if (mode !== 0o700) problems.push(`${label}: ${path.basename(d)} is mode ${mode.toString(8)}, not 700`);
      }
    }
    return problems.length === 0 || problems.join("; ");
  });

flow("--report-file refuses a path it would overwrite, a symbolic link, a relative one and a directory it cannot write, before anything is spawned",
  "the report file is the run's whole delivery: a path already holding one is two agents' evidence in one file, a link is a path whose destination someone else chooses, and every one of these is knowable before a token is spent — refused after the turn it would cost the delegation",
  async () => {
    const state = flowState();
    const marker = path.join(state, "codex-ran");
    const probeShim = path.join(state, "shim");
    fs.mkdirSync(probeShim, { recursive: true });
    fs.writeFileSync(path.join(probeShim, "codex"), `#!/bin/sh\necho ran >> "${marker}"\nexec "${process.execPath}" "${FAKE}" "$@"\n`, { mode: 0o755 });
    const taken = reportPath(state, "taken.json");
    fs.writeFileSync(taken, "{}\n");
    // A DANGLING link: existsSync follows it and reads "absent", so only an lstat sees the entry.
    const linkTarget = reportPath(state, "link-target.json");
    const dangling = reportPath(state, "dangling.json");
    fs.symlinkSync(linkTarget, dangling);
    const ro = path.join(state, "read-only");
    fs.mkdirSync(ro, { mode: 0o500 });
    const problems = [];
    try {
      for (const [p, why] of [[taken, "already exists"], [dangling, "already exists"],
                              ["report.json", "must be an absolute path"],
                              [path.join(ro, "r.json"), "cannot write into"]]) {
        const { code, out, err } = await run({ scenario: "happy", args: ["--report-file", p],
          env: { ENTRUST_STATE_DIR: state, PATH: `${probeShim}:${process.env.PATH}` } });
        if (code !== EXIT.USAGE) problems.push(`${why}: exit ${code}, expected 2 (${err.trim().slice(0, 120)})`);
        else if (!err.includes(why)) problems.push(`${why}: the refusal does not say so: ${err.trim().slice(0, 160)}`);
        if (out.trim()) problems.push(`${why}: a usage error printed ${out.length} bytes of report`);
      }
    } finally { fs.chmodSync(ro, 0o700); }
    if (fs.readFileSync(taken, "utf8") !== "{}\n") problems.push("the refused run overwrote the file it was refused");
    if (!fs.lstatSync(dangling).isSymbolicLink()) problems.push("the refused run replaced the link with a file of its own");
    if (fs.existsSync(linkTarget)) problems.push("the refused run wrote through the link, creating its target");
    if (fs.existsSync(marker)) problems.push("a refused --report-file still spawned a codex");
    return problems.length === 0 || problems.join("; ");
  });

flow("a report that could not reach stdout is complete in --report-file, under the verdict the turn earned",
  "the whole point of the file is that the pipe stops mattering: a caller that closed stdout, or a task whose output was truncated, must not turn a finished turn into a transport failure or lose the answer it already paid for",
  async () => {
    const state = flowState();
    const p = reportPath(state);
    const { code } = await run({ scenario: "long-answer", closeStdout: true,
      args: ["--report-file", p], env: { ENTRUST_STATE_DIR: state } });
    if (!fs.existsSync(p)) return "a closed stdout took the report file with it";
    const r = readJson(p);
    if (!r) return "the published report does not parse";
    if (r.exitCode !== EXIT.SUCCESS || r.turnStatus !== "completed")
      return `the report's own verdict changed with the pipe: ${JSON.stringify({ exitCode: r.exitCode, turnStatus: r.turnStatus })}`;
    if (code !== EXIT.SUCCESS) return `the run exited ${code}; a delivered report keeps the turn's own code, not the pipe's 4`;
    if (!String(r.answer).length) return "the report reached the file without the answer";
    return true;
  });

flow("two agents naming one --report-file: the first to publish keeps the file, the second exits 4 and says so",
  "the pre-spawn check cannot see a run that starts after it, so the publication itself has to hold the no-clobber rule: a report written over a delivered one is two agents' evidence in one file with nothing saying whose, and the loser's own verdict must still reach it on stdout",
  async () => {
    const slowState = flowState(), fastState = flowState();
    const p = reportPath(slowState);
    // The slow agent opens the path first and publishes last, so its refusal is the race and not the
    // pre-spawn check — which the two exit codes tell apart, 4 against 2.
    const slow = run({ scenario: "slow-turn", args: ["--report-file", p],
      env: { ENTRUST_STATE_DIR: slowState } });
    // Its state directory stays empty until readOpts returns, and openReportFile runs inside readOpts.
    if (!await until(() => fs.readdirSync(slowState).some((n) => n !== "report.json")))
      return "the slow agent never reached its state directory";
    const fast = await run({ scenario: "happy", args: ["--report-file", p],
      env: { ENTRUST_STATE_DIR: fastState } });
    const late = await slow;
    const problems = [];
    if (fast.code !== EXIT.SUCCESS) problems.push(`the first publisher exited ${fast.code}: ${fast.err.trim().slice(-160)}`);
    if (late.code !== EXIT.TRANSPORT) problems.push(`the second publisher exited ${late.code}, not 4: ${late.err.trim().slice(-160)}`);
    if (!late.err.includes(`the report could not be published at ${p}`))
      problems.push(`the loser does not name the path it lost: ${late.err.trim().slice(-200)}`);
    const onDisk = readJson(p);
    if (!onDisk) problems.push(`no parseable report at ${p}`);
    else if (onDisk.answer !== "the answer") problems.push(`the file holds the loser's report: ${JSON.stringify(String(onDisk.answer).slice(0, 60))}`);
    let mine = null;
    try { mine = JSON.parse(late.out); } catch {}
    if (!mine) problems.push(`the loser's own report did not reach its stdout: ${late.out.slice(0, 120)}`);
    else if (mine.answer !== "slow but fine") problems.push(`the loser's stdout report is not its own turn: ${JSON.stringify(String(mine.answer).slice(0, 60))}`);
    if (fs.readdirSync(slowState).some((n) => n.startsWith("report.json.")))
      problems.push("the failed publication left its temp file behind");
    return problems.length === 0 || problems.join("; ");
  });

flow("a server that dies mid-turn publishes the collected report, not a pre-turn refusal",
  "exit 4 is not 'no turn ran': the thread, the command and the partial answer are what the run already paid for, and a report that replaced them with an `error` key would send a coordinator to relaunch work that had happened",
  async () => {
    const state = flowState();
    const p = reportPath(state);
    const { code } = await run({ scenario: "server-crash", args: ["--report-file", p],
      env: { ENTRUST_STATE_DIR: state } });
    if (code !== EXIT.TRANSPORT) return `a mid-turn crash exited ${code}, not 4`;
    const r = readJson(p);
    if (!r) return `no parseable report at ${p}`;
    if (r.turnStatus === null) return `the collected report was replaced by a pre-turn refusal: ${JSON.stringify(r.error)}`;
    if (r.turnStatus !== "failed") return `turnStatus is ${JSON.stringify(r.turnStatus)}, not "failed"`;
    if (r.commandsSucceeded !== 1) return `the command the turn ran is gone: commandsSucceeded ${JSON.stringify(r.commandsSucceeded)}`;
    return String(r.answer).includes("partial answer before the crash")
      || `the answer the turn had already streamed was dropped: ${JSON.stringify(r.answer)}`;
  });

flow("a refusal reached before the thread is written to --report-file, as a report saying so",
  "the caller is woken by the task's exit and reads one path: a refusal that left the file empty is indistinguishable from an agent that is still starting, and inventing a receipt or a turn status for it would be worse",
  async () => {
    const state = flowState();
    const p = reportPath(state);
    const { code, out } = await run({ scenario: "happy", noPrompt: true,
      agent: "RIGHTS: read /nonexistent/report/dir\nTASK: do it\n",
      args: ["--report-file", p], env: { ENTRUST_STATE_DIR: state } });
    if (code !== EXIT.USAGE) return `an agent that could not start exited ${code}`;
    if (out.trim()) return `a usage error printed ${out.length} bytes on stdout`;
    const r = readJson(p);
    if (!r) return `no parseable report at ${p}`;
    if (r.ok !== false || r.exitCode !== EXIT.USAGE) return `the refusal does not carry its own verdict: ${JSON.stringify(r)}`;
    if (r.turnStatus !== null || r.answer !== "") return `a turn status or an answer was invented: ${JSON.stringify(r)}`;
    if (r.threadId !== null) return `a thread that never existed was named: ${JSON.stringify(r.threadId)}`;
    if (!/--cwd does not exist/.test(String(r.error))) return `the refusal does not carry the reason: ${JSON.stringify(r.error)}`;
    if (r.reportPath !== p) return `the report does not name itself: ${JSON.stringify(r.reportPath)}`;
    // The two refusals the argument scan raises before it has a prompt file at all: they used to be
    // decided above the line that opens the report, so the caller was woken by a path that was empty.
    const problems = [];
    const promptFile = path.join(state, "agent.txt");
    fs.writeFileSync(promptFile, `RIGHTS: read ${shimDir}\nTASK: do it\n`);
    for (const [name, file, extra] of [
      ["a valueless --prompt-file", "valueless.json", ["--prompt-file"]],
      ["--prompt-file twice", "twice.json", ["--prompt-file", promptFile, "--prompt-file", promptFile]]]) {
      const q = reportPath(state, file);
      const res = await run({ scenario: "happy", noPrompt: true,
        args: ["--report-file", q, ...extra], env: { ENTRUST_STATE_DIR: state } });
      if (res.code !== EXIT.USAGE) { problems.push(`${name}: exit ${res.code}, expected 2`); continue; }
      const rq = readJson(q);
      if (!rq) { problems.push(`${name}: no parseable report at ${q}`); continue; }
      if (rq.ok !== false || rq.exitCode !== EXIT.USAGE) problems.push(`${name}: the refusal does not carry its own verdict: ${JSON.stringify(rq)}`);
      if (!/--prompt-file/.test(String(rq.error))) problems.push(`${name}: the refusal does not name the flag: ${JSON.stringify(rq.error)}`);
    }
    return problems.length === 0 || problems.join("; ");
  });

flow("a resumed agent writes a report file of its own",
  "a follow-up turn is a second delivery, not an amendment: written over the first it would leave the thread's earlier evidence unreadable, and the no-clobber rule is what makes the caller name a new path",
  async () => {
    const state = flowState();
    const first = reportPath(state, "first.json"), second = reportPath(state, "second.json");
    const a = await run({ scenario: "happy", args: ["--report-file", first], env: { ENTRUST_STATE_DIR: state } });
    if (a.code !== EXIT.SUCCESS) return `the first turn exited ${a.code}: ${a.err.trim().slice(-160)}`;
    const b = await run({ scenario: "happy", args: ["--resume", "thr_root", "--report-file", second],
      env: { ENTRUST_STATE_DIR: state } });
    if (b.code !== EXIT.SUCCESS) return `the resumed turn exited ${b.code}: ${b.err.trim().slice(-160)}`;
    const r1 = readJson(first), r2 = readJson(second);
    if (!r1 || !r2) return "one of the two turns published nothing";
    if (r1.resumedFrom !== null) return `the first turn reported a resume: ${JSON.stringify(r1.resumedFrom)}`;
    if (r2.resumedFrom !== "thr_root") return `the second turn does not name the thread it continued: ${JSON.stringify(r2.resumedFrom)}`;
    // And the second run refuses to publish over the first: the paths are the caller's to keep apart.
    const again = await run({ scenario: "happy", args: ["--resume", "thr_root", "--report-file", first],
      env: { ENTRUST_STATE_DIR: state } });
    if (again.code !== EXIT.USAGE || !/already exists/.test(again.err))
      return `a resumed agent overwrote the earlier report: exit ${again.code} ${again.err.trim().slice(0, 160)}`;
    return readJson(first)?.resumedFrom === null || "the refused resume rewrote the first report anyway";
  });

flow("a resumed turn writes an answer file of its own, and the first turn's still says what it said",
  "--resume continues the SAME thread, so an answer file named for the thread alone left the first report's answerPath pointing at the SECOND turn's answer: a coordinator opening it would read the follow-up and have no way to tell",
  async () => {
    const state = flowState();
    const a = await run({ scenario: "happy", env: { ENTRUST_STATE_DIR: state } });
    if (a.code !== EXIT.SUCCESS) return `the first turn exited ${a.code}: ${a.err.trim().slice(-160)}`;
    // A different scenario for the resumed turn, so the two answers differ: with one text in both, a file
    // the resume overwrote reads exactly like one it never touched.
    const b = await run({ scenario: "null-phase", args: ["--resume", "thr_root"],
      env: { ENTRUST_STATE_DIR: state } });
    if (b.code !== EXIT.SUCCESS) return `the resumed turn exited ${b.code}: ${b.err.trim().slice(-160)}`;
    let r1 = null, r2 = null;
    try { r1 = JSON.parse(a.out); r2 = JSON.parse(b.out); } catch { return "one of the two turns printed no report"; }
    if (r1.threadId !== r2.threadId) return `the two turns did not share a thread: ${r1.threadId} / ${r2.threadId}`;
    if (r2.resumedFrom !== "thr_root") return `the second turn did not resume the first: ${JSON.stringify(r2.resumedFrom)}`;
    if (r1.answer === r2.answer) return `both turns answered the same thing, so an overwrite would be invisible: ${JSON.stringify(r1.answer)}`;
    if (r1.answerPath === r2.answerPath) return `both turns claim one answer file: ${r1.answerPath}`;
    for (const [which, r] of [["first", r1], ["second", r2]])
      if (!fs.existsSync(r.answerPath)) return `the ${which} turn's answer file is not on disk: ${r.answerPath}`;
    const kept = fs.readFileSync(r1.answerPath, "utf8");
    return kept === r1.answer
      || `the resumed turn rewrote the first turn's answer: ${JSON.stringify(kept)} where the first report said ${JSON.stringify(r1.answer)}`;
  });

// --- the prompt file, which is the whole of what a caller hands the driver ---

flow("a prompt file supplies the rights line a coordinator's prompt does not have, and a RIGHTS below another field is still refused",
  "the caller writes the prompt it was given, unchanged, and a prompt is not obliged to open with a header at all: the default it falls back to widens nothing (read level, this directory), while a RIGHTS anywhere but first is the injection that would",
  async () => {
    const here = fs.realpathSync(process.cwd());
    const parse = (o) => { try { return JSON.parse(o); } catch { return null; } };
    // A prompt exactly as a coordinator wrote it: no header at all.
    const bare = await run({ scenario: "happy", noPrompt: true,
      agent: "Count the exit codes in the driver and say how many.\n",
      env: { ENTRUST_STATE_DIR: flowState() } });
    if (bare.code !== EXIT.SUCCESS) return `a header-less prompt exited ${bare.code}: ${bare.err.trim().slice(-200)}`;
    const r1 = parse(bare.out);
    if (!r1) return `the run printed no report: ${bare.out.slice(0, 160)}`;
    if (r1.level !== "read" || r1.cwd !== here)
      return `the default is not read level in the current directory: ${JSON.stringify({ level: r1.level, cwd: r1.cwd })}`;
    if ((r1.promptFileFields ?? []).includes("RIGHTS"))
      return `a RIGHTS the file never carried was reported as declared: ${JSON.stringify(r1.promptFileFields)}`;
    // A header that declares something else and still no rights: the fields apply, the default stands.
    const noAgent = await run({ scenario: "happy", noPrompt: true,
      agent: "EFFORT: high\n\nDo the work and report.\n", env: { ENTRUST_STATE_DIR: flowState() } });
    if (noAgent.code !== EXIT.SUCCESS) return `a RIGHTS-less header exited ${noAgent.code}: ${noAgent.err.trim().slice(-200)}`;
    const r2 = parse(noAgent.out);
    if (!r2) return "the second run printed no report";
    if (r2.level !== "read" || r2.cwd !== here)
      return `a RIGHTS-less header did not default to read in the current directory: ${JSON.stringify({ level: r2.level, cwd: r2.cwd })}`;
    if (r2.effort !== "high" || (r2.promptFileFields ?? []).join(",") !== "EFFORT")
      return `the fields beside the missing RIGHTS were dropped: ${JSON.stringify({ effort: r2.effort, fields: r2.promptFileFields })}`;
    // And a RIGHTS that IS there but not first is the injection refusal.
    const late = await run({ scenario: "happy", noPrompt: true,
      agent: "EFFORT: high\nRIGHTS: read <CWD>\nTASK: do it\n", env: { ENTRUST_STATE_DIR: flowState() } });
    return (late.code === EXIT.USAGE && /first field must be RIGHTS, not EFFORT/.test(late.err))
      || `a RIGHTS below another field was accepted: exit ${late.code} ${late.err.trim().slice(0, 200)}`;
  });

flow("the run's $TMPDIR outlives its run, a later run leaves it alone, and the state directory gets no tmp/",
  "scratch must survive exit so the answer's paths remain usable; the driver never removes one, and it keeps none of them under the plugin's data directory, where nothing lists them",
  async () => {
    const state = flowState(), tmp = tempDir("entrust-kept-tmp-");
    const first = await run({ scenario: "tmp-write", env: { ENTRUST_STATE_DIR: state, TMPDIR: tmp } });
    if (first.code !== EXIT.SUCCESS) return `the first run exited ${first.code}: ${first.err.trim().slice(-200)}`;
    const dir = JSON.parse(first.out).tmpDir;
    if (!dir || !fs.existsSync(path.join(dir, "agent-note.txt"))) return `the run's $TMPDIR or the agent's file in it is gone at exit: ${JSON.stringify(dir)}`;
    const second = await run({ scenario: "happy", env: { ENTRUST_STATE_DIR: state, TMPDIR: tmp } });
    if (second.code !== EXIT.SUCCESS) return `the second run exited ${second.code}: ${second.err.trim().slice(-200)}`;
    if (JSON.parse(second.out).tmpDir === dir) return `two runs were handed one $TMPDIR: ${dir}`;
    if (!fs.existsSync(path.join(dir, "agent-note.txt"))) return `a later run removed an earlier run's $TMPDIR: ${dir}`;
    return !fs.existsSync(path.join(state, "tmp")) || `the driver still made ${path.join(state, "tmp")}`;
  });

flow("agents share a project/run parent, reports in different state directories stay separate, and every invocation gets a fresh leaf",
  "the full report run path identifies its run; the exclusive agent grant must never be reused",
  async () => {
    const tmp = tempDir("entrust-named-tmp-"), problems = [];
    const rel = path.join("orchestrate", "slug-x", "run-1", "a1");
    const report = (state) => path.join(state, rel, "report.json");
    const state = flowState();
    const a = await run({ scenario: "happy", args: ["--report-file", report(state)], env: { ENTRUST_STATE_DIR: state, TMPDIR: tmp } });
    if (a.code !== EXIT.SUCCESS) return `first agent: ${a.code}, ${a.err}`;
    const want = JSON.parse(a.out).tmpDir;
    if (!isAgentTmp(tmp, want)) problems.push(`not project/run/agents: ${want}`);
    for (let d = want; d !== fs.realpathSync(tmp); d = path.dirname(d))
      if ((fs.statSync(d).mode & 0o777) !== 0o700) problems.push(`${d} is not 0700`);
    const sibling = path.join(state, "orchestrate", "slug-x", "run-1", "a2", "report.json");
    const s = await run({ scenario: "happy", args: ["--report-file", sibling], env: { ENTRUST_STATE_DIR: state, TMPDIR: tmp } });
    if (s.code !== EXIT.SUCCESS || path.dirname(JSON.parse(s.out).tmpDir) !== path.dirname(want)) problems.push(`sibling did not share its run: ${s.code}, ${s.err}`);
    const other = flowState();
    const b = await run({ scenario: "happy", args: ["--report-file", report(other)], env: { ENTRUST_STATE_DIR: other, TMPDIR: tmp } });
    if (b.code !== EXIT.SUCCESS || path.dirname(JSON.parse(b.out).tmpDir) === path.dirname(want)) problems.push("distinct state roots shared a run");
    fs.unlinkSync(report(state));
    const duplicate = await run({ scenario: "happy", args: ["--report-file", report(state)], env: { ENTRUST_STATE_DIR: state, TMPDIR: tmp } });
    if (duplicate.code !== EXIT.SUCCESS || JSON.parse(duplicate.out).tmpDir === want || !fs.existsSync(want)) problems.push(`agent leaf was reused or discarded: ${duplicate.code}, ${duplicate.err}`);
    const outside = path.join(tempDir("entrust-outside-report-"), "report.json");
    const c = await run({ scenario: "happy", args: ["--report-file", outside], env: { ENTRUST_STATE_DIR: flowState(), TMPDIR: tmp } });
    if (c.code !== EXIT.SUCCESS || !isAgentTmp(tmp, JSON.parse(c.out).tmpDir)) problems.push(`outside report: ${c.code}, ${c.err}`);
    return problems.length === 0 || problems.join("; ");
  });

flow("an agent's child check stays under the agent's exclusive TMPDIR without another entrust namespace",
  "context rebasing must preserve the declared grant when a child command uses the same capture helper",
  async () => {
    const runner = path.join(ROOT, "skills", "orchestrate", "scripts", "capture-check.mjs");
    const command = `node '${runner}' -- 'echo scoped' > "$TMPDIR/receipt.txt"`;
    const r = await run({ scenario: "happy", env: { FAKE_AGENT_SH: command } });
    if (r.code !== EXIT.SUCCESS) return `exit ${r.code}: ${r.err}`;
    const dir = JSON.parse(r.out).tmpDir;
    const receipt = fs.readFileSync(path.join(dir, "receipt.txt"), "utf8");
    const log = /^LOG=(.+)$/m.exec(receipt)?.[1];
    return (log && path.dirname(path.dirname(log)) === path.join(dir, "checks") && fs.readFileSync(log, "utf8") === "scoped\n")
      || `child log escaped: ${receipt}`;
  });

flow("approval mailboxes may use evaluator storage, but ancestor and cross-run agent grants remain forbidden",
  "shared run provenance is not a writable grant, and an agent must not forge another run's approval",
  async () => {
    const helper = path.join(ROOT, "skills", "orchestrate", "scripts", "temp-dir.mjs");
    const contextAt = (root) => {
      const r = spawnSync(process.execPath, [helper, "run"], { cwd: SHIM, encoding: "utf8",
        env: { ...process.env, TMPDIR: root, ENTRUST_TEMP_CONTEXT: "" } });
      if (r.status !== 0) throw new Error(r.stderr);
      return JSON.parse(r.stdout);
    };
    const mark = (dir, kind) => {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, ".entrust-owner.json"), JSON.stringify({ version: 1, kind, pid: process.pid, reportPath: null }));
    };
    const root = flowState(), c = contextAt(root);
    const suite = path.join(c.scope, "evals", "suite"); mark(suite, "evals");
    const control = path.join(suite, "reports", "control", "approvals"); fs.mkdirSync(control, { recursive: true });
    const ok = await run({ scenario: "happy", args: ["--approval-dir", control],
      env: { ENTRUST_STATE_DIR: suite, TMPDIR: suite, ENTRUST_TEMP_CONTEXT: JSON.stringify(c) } });
    if (ok.code !== EXIT.SUCCESS) return `evaluator control refused: ${ok.code}, ${ok.err}`;
    const parent = path.join(c.scope, "agents", "parent"); mark(parent, "agents");
    const childSuite = path.join(parent, "evals", "child"); mark(childSuite, "evals");
    const nestedState = path.join(childSuite, "state"); fs.mkdirSync(nestedState);
    const nested = path.join(nestedState, "reports", "nested", "approvals"); fs.mkdirSync(nested, { recursive: true });
    const denied = await run({ scenario: "happy", args: ["--approval-dir", nested],
      env: { ENTRUST_STATE_DIR: nestedState, TMPDIR: childSuite, ENTRUST_TEMP_CONTEXT: JSON.stringify({ ...c, scope: childSuite }) } });
    if (denied.code !== EXIT.USAGE || !denied.err.includes("another agent's temporary grant"))
      return `ancestor grant accepted: ${denied.code}, ${denied.err}`;
    const other = contextAt(root);
    const foreign = path.join(other.scope, "agents", "foreign"); mark(foreign, "agents");
    const cross = path.join(foreign, "approvals"); fs.mkdirSync(cross);
    const refused = await run({ scenario: "happy", args: ["--approval-dir", cross],
      env: { ENTRUST_STATE_DIR: root, TMPDIR: suite, ENTRUST_TEMP_CONTEXT: JSON.stringify(c) } });
    if (refused.code !== EXIT.USAGE || !refused.err.includes("another agent's temporary grant"))
      return `cross-run grant accepted: ${refused.code}, ${refused.err}`;
    fs.unlinkSync(path.join(foreign, ".entrust-owner.json"));
    const unmarked = await run({ scenario: "happy", args: ["--approval-dir", cross],
      env: { ENTRUST_STATE_DIR: root, TMPDIR: suite, ENTRUST_TEMP_CONTEXT: JSON.stringify(c) } });
    return (unmarked.code === EXIT.USAGE && unmarked.err.includes("another agent's temporary grant"))
      || `missing grant marker widened approval rights: ${unmarked.code}, ${unmarked.err}`;
  });

flow("a temporary base <tmp>/entrust that is a link, not a directory, or another user's is refused with exit 2, whether it was there before or turns out so once made",
  "the base is a fixed name, and where TMPDIR is unset on Linux it sits in a /tmp every user shares: a link planted there would put the agent's scratch where someone else chose, and another user's directory would hold it",
  async () => {
    const problems = [];
    const refused = async (label, tmp, want, env = {}) => {
      const r = await run({ scenario: "happy", env: { TMPDIR: tmp, ...env } });
      if (r.code !== EXIT.USAGE || !r.err.includes(`temporary directory ${path.join(fs.realpathSync(tmp), "entrust")} ${want}`))
        problems.push(`${label}: exit ${r.code}, ${r.err.trim().slice(-200)}`);
    };
    const linked = tempDir("entrust-base-link-"), target = path.join(tempDir("entrust-base-target-"), "empty");
    fs.mkdirSync(target);
    fs.symlinkSync(target, path.join(linked, "entrust"));
    await refused("a symbolic link", linked, "is a symbolic link");
    if (fs.readdirSync(target).length) problems.push(`the run wrote through the link: ${fs.readdirSync(target).join(", ")}`);
    const filed = tempDir("entrust-base-file-");
    fs.writeFileSync(path.join(filed, "entrust"), "");
    await refused("a file", filed, "is not a directory");
    // Another user's directory, without root: the driver is started with its own uid reported one higher,
    // so a directory this process made reads as someone else's, both one already there and one it makes.
    const preload = path.join(tempDir("entrust-uid-"), "other-uid.cjs");
    fs.writeFileSync(preload, "const own = process.getuid; process.getuid = () => own() + 1;\n");
    const env = { NODE_OPTIONS: `--require ${preload}` };
    const theirs = tempDir("entrust-base-theirs-");
    fs.mkdirSync(path.join(theirs, "entrust"));
    await refused("another user's, already there", theirs, `belongs to uid ${process.getuid()}, not to this user`, env);
    await refused("another user's, once made", tempDir("entrust-base-made-"), `belongs to uid ${process.getuid()}, not to this user`, env);
    return problems.length === 0 || problems.join("; ");
  });

flow("a caller TMPDIR above the state directory or inside it is never granted: the run's fresh directory in it is, and nothing beside it",
  "the old guards refused such a TMPDIR because the whole of it was the grant; the grant is now one directory this run has just made, empty, so it reaches neither the state directory nor anything the caller keeps beside it",
  async () => {
    const problems = [];
    for (const shape of ["above", "inside"]) for (const level of ["read", "write"]) {
      const base = tempDir(`entrust-${shape}-`);
      const state = path.join(base, "data", "state");
      fs.mkdirSync(state, { recursive: true });
      const tmp = shape === "above" ? base : path.join(state, "inner");
      const r = await run({ scenario: "env-tmpprefix", args: level === "write" ? ["--level", "write"] : [],
        unsetEnv: ["TMPPREFIX"], env: { ENTRUST_STATE_DIR: state, TMPDIR: tmp } });
      const rep = r.code === EXIT.SUCCESS ? JSON.parse(r.out) : null;
      const leaf = rep?.tmpDir;
      const label = `TMPDIR ${shape} the state directory, ${level} level`;
      if (!leaf || !isAgentTmp(tmp, leaf)) { problems.push(`${label}: exit ${r.code}, tmpDir ${JSON.stringify(leaf)}; ${r.err.trim().slice(-160)}`); continue; }
      const roots = rep.sandbox?.writableRoots ?? [];
      const granted = level === "read" ? roots : [...roots, ...(rep.sandbox?.excludeTmpdirEnvVar === false ? [leaf] : [])];
      if (granted.length !== 1 || fs.realpathSync(granted[0]) !== fs.realpathSync(leaf)) problems.push(`${label}: the temp grant is ${JSON.stringify(granted)}, not the leaf alone`);
      if (!/TMPPREFIX=(\S+)/.exec(String(rep.answer))?.[1]?.startsWith(`${leaf}/`)) problems.push(`${label}: the agent's temporary directory is not the leaf: ${String(rep.answer).slice(0, 160)}`);
      if (!path.relative(leaf, state).startsWith("..")) problems.push(`${label}: the leaf ${leaf} holds the state directory`);
    }
    return problems.length === 0 || problems.join("; ");
  });

flow("one driver per mailbox, ever: a second exits 2 naming the owner's pid, whether the owner is still running or has ended",
  "pending is rewritten whole by whoever owns the mailbox, so two drivers on one would erase each other's requests; the launcher makes a mailbox per launch, so an owner file already there is never a mailbox to take over, and a takeover checked by name could meet a second taker between its check and its removal (E68)",
  async () => {
    const state = flowState();
    const box = path.join(state, "run", "agent", "approvals");
    fs.mkdirSync(box, { recursive: true, mode: 0o700 });
    const first = run({ scenario: "slow-turn", args: ["--approval-dir", box], env: { ENTRUST_STATE_DIR: state } });
    const owner = await until(() => readJson(path.join(box, "owner.json")));
    if (!owner) return "the first driver never claimed the mailbox";
    const second = await run({ scenario: "happy", args: ["--approval-dir", box], env: { ENTRUST_STATE_DIR: state } });
    const a = await first;
    const problems = [];
    if (second.code !== EXIT.USAGE || !second.err.includes(`belongs to entrust pid ${owner.pid}, which is still running`))
      problems.push(`a second driver on a live mailbox: exit ${second.code}, ${second.err.trim().slice(-200)}`);
    if (a.code !== EXIT.SUCCESS) problems.push(`the owner exited ${a.code}`);
    const held = readJson(path.join(box, "owner.json"));
    if (held?.threadId !== "thr_root") problems.push("the owner file does not name the thread once it exists");
    const third = await run({ scenario: "happy", args: ["--approval-dir", box], env: { ENTRUST_STATE_DIR: state } });
    if (third.code !== EXIT.USAGE || !third.err.includes(`belongs to entrust pid ${owner.pid}, which has ended`))
      problems.push(`a driver on an ended owner's mailbox: exit ${third.code}, ${third.err.trim().slice(-200)}`);
    if (JSON.stringify(readJson(path.join(box, "owner.json"))) !== JSON.stringify(held)) problems.push("a refused driver changed the owner file");
    const leftovers = fs.readdirSync(box).filter((n) => n !== "owner.json");
    if (leftovers.length) problems.push(`the refused drivers left ${JSON.stringify(leftovers)} in the mailbox`);
    return problems.length === 0 || problems.join("; ");
  });

let failed = await runTable(CASES);

// --- the help surface: what a coordinator is shown, and what the parser will actually take ---

flow("--help says the mailbox is the launcher's, that a request waits thirty minutes at most, and what exit 6 now means; --help-all names the mailbox, the entry and the deadline's seam, and --help does not",
  "the pages quote this text: a person who thinks --approval-dir is theirs to set would run a driver nobody answers, the deadline is a constant with a reason rather than a flag, and a coordinator reading exit 6 has to know an accepted request is never one; a test seam in --help reads as a setting",
  () => {
    const core = helpRun("--help").stdout.replace(/\s+/g, " "), all = helpRun("--help-all").stdout.replace(/\s+/g, " ");
    const problems = [];
    for (const s of ["--approval-dir D", "set by the launcher (agent-run.mjs --run) and never by a person", "for 30 minutes, after which it is declined as expired",
                     "accepted by the driver itself, with or without D",
                     "an approval request was declined or expired unanswered", "refuses ~/.codex, <state> and every directory above either",
                     "--writable DIR grant one more root (write level only, repeatable)"])
      if (!core.includes(s)) problems.push(`--help lacks ${JSON.stringify(s)}`);
    for (const s of ["--approval-timeout", "ENTRUST_APPROVAL_TIMEOUT_S", "tool's own store"])
      if (core.includes(s)) problems.push(`--help still says ${JSON.stringify(s)}`);
    for (const s of ["owner.json", "is stale: counted, left in place", "counted late", "approvalsAutoAccepted",
                     "outcome ({status, exitCode, durationMs}", "ENTRUST_APPROVAL_POLL_MS", "ENTRUST_APPROVAL_TIMEOUT_S",
                     "(default 1800)"])
      if (!all.includes(s)) problems.push(`--help-all lacks ${JSON.stringify(s)}`);
    if (all.includes("--approval-timeout")) problems.push("--help-all still names --approval-timeout");
    return problems.length === 0 || problems.join("; ");
  });

flow("--help says an accepted command runs with no sandbox and a file change not shown inside the roots is declined at once; --help-all names no permission feature and no widening field",
  "the widening is gone: a help that still names its feature rows or its report fields sends a coordinator after fields no report carries, and one that still offers a file change outside the roots promises a question the driver never asks",
  () => {
    const core = helpRun("--help").stdout.replace(/\s+/g, " "), all = helpRun("--help-all").stdout.replace(/\s+/g, " ");
    const problems = [];
    for (const s of ["An accepted command runs with no sandbox, as you.", "and one not shown to lie inside them is declined at once"])
      if (!core.includes(s)) problems.push(`--help lacks ${JSON.stringify(s)}`);
    for (const s of ["a permissions request, with the empty profile, why \"rights are set at launch\"", "its why naming the WRITABLE: line"])
      if (!all.includes(s)) problems.push(`--help-all lacks ${JSON.stringify(s)}`);
    for (const s of ["features.", "experimentalApi", "serverWarnings", "featuresRequested", "sandboxWidened", "repeatOf", "widening"])
      if (all.includes(s)) problems.push(`--help-all still names ${JSON.stringify(s)}`);
    return problems.length === 0 || problems.join("; ");
  });

const helpRun = (flag) => spawnSync(process.execPath, [DRIVER, flag], { encoding: "utf8" });

flow("--help fits a screenful and ends by pointing at --help-all",
  "the short --help has a line cap so a coordinator can read it; measuring that cap prevents it growing one flag at a time",
  () => {
    const core = helpRun("--help"), all = helpRun("--help-all");
    const problems = [];
    for (const [flag, r] of [["--help", core], ["--help-all", all]])
      if (r.status !== 0) problems.push(`${flag} exited ${r.status}: ${String(r.stderr).trim().slice(0, 160)}`);
    if (problems.length) return problems.join("; ");
    // The trailing newline is not a line of help; count what a reader sees.
    const body = core.stdout.replace(/\n$/, "").split("\n");
    if (body.length > 200) problems.push(`--help is ${body.length} lines, the cap is 200`);
    if (body.at(-1) !== "Rarely needed flags, environment variables and internals: --help-all")
      problems.push(`--help does not end on the pointer line: ${JSON.stringify(body.at(-1))}`);
    if (all.stdout.length <= core.stdout.length)
      problems.push("--help-all is no bigger than --help, so it is not the union");
    return problems.length === 0 || problems.join("; ");
  });

flow("every flag the parser accepts appears in --help or --help-all",
  "the help is prose beside a switch statement: a flag in one and not the other is either a capability nobody can find or a promise the parser refuses. The flag list is read off the parser's own case labels, so a flag added without a help entry fails here rather than being remembered",
  () => {
    const parsed = [...new Set([...fs.readFileSync(DRIVER, "utf8").matchAll(/case "(-{1,2}[a-z-]+)":/g)].map((m) => m[1]))];
    // A pattern that stopped matching would pass this case with nothing to check.
    if (parsed.length < 25) return `only ${parsed.length} case labels matched in the parser; the pattern has drifted`;
    const core = helpRun("--help").stdout, all = helpRun("--help-all").stdout;
    // Word-boundary on the right, or --wait would be "documented" by --wait-timeout.
    const names = (text, f) => new RegExp(`(?<![a-z-])${f}(?![a-z-])`).test(text);
    const undocumented = parsed.filter((f) => !names(core, f) && !names(all, f));
    const dropped = parsed.filter((f) => names(core, f) && !names(all, f));
    const problems = [];
    if (undocumented.length) problems.push(`in the parser, in neither tier: ${undocumented.join(", ")}`);
    if (dropped.length) problems.push(`in --help but not in --help-all, which is meant to be the union: ${dropped.join(", ")}`);
    return problems.length === 0 || problems.join("; ");
  });

flow("--json and --footer are refused like any other unknown flag",
  "both are gone — the JSON report is the only report — and a driver that quietly ACCEPTED either would let a stale recipe keep running while asking for something the driver no longer has",
  async () => {
    const problems = [];
    for (const flag of ["--json", "--footer"]) {
      const { code, out, err } = await run({ scenario: "happy", args: [flag] });
      if (code !== EXIT.USAGE) problems.push(`${flag} exited ${code}, expected ${EXIT.USAGE}`);
      if (!new RegExp(`unknown argument: ${flag}`).test(err)) problems.push(`${flag}: ${err.trim().slice(0, 120)}`);
      if (out.trim()) problems.push(`${flag} printed ${out.length} bytes on stdout; an argument error prints no report`);
    }
    return problems.length === 0 || problems.join("; ");
  });

// --- --check-prompt-file: what the launcher's --new asks before an agent is spawned ---

// One prompt file per call, checked with no stdin, the way --new runs it; `unset` deletes a variable
// outright, because a spawn env stringifies undefined.
const checkRun = (agent, { env = {}, unset = [] } = {}) => {
  const file = path.join(flowState(), "prompt.txt");
  fs.writeFileSync(file, agent);
  const e = { ...process.env, ...env };
  for (const k of unset) delete e[k];
  const r = spawnSync(process.execPath, [DRIVER, "--check-prompt-file", file],
    { env: e, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 20000 });
  return { code: r.status, out: r.stdout, err: r.stderr, file };
};
// The contract the launcher reads: exit 2, nothing on stdout, and exactly one stderr line in this shape.
const refusal = (r, re) => r.code !== EXIT.USAGE ? `exit ${r.code}, expected 2: ${r.err.slice(0, 200)}`
  : r.out !== "" ? `a refusal printed ${r.out.length} bytes on stdout`
    : !/^entrust: refused: [^\n]+\n$/.test(r.err) ? `stderr is not one refusal line: ${JSON.stringify(r.err.slice(0, 300))}`
      : re.test(r.err) || `the refusal does not give the run's reason: ${r.err.slice(0, 300)}`;
const passed = (r) => (r.code === EXIT.SUCCESS && r.out === "" && r.err === "")
  || `expected a silent 0, got exit ${r.code}, stdout ${JSON.stringify(r.out.slice(0, 120))}, stderr ${JSON.stringify(r.err.slice(0, 200))}`;
const GOOD_HEADER = "RIGHTS: read <DIR>\nEFFORT: high\nNETWORK: no\nBRIEF: yes\nTASK: count the exit codes\n";

flow("--check-prompt-file passes a sound header silently, and spawns no codex and writes no state",
  "the launcher runs the check before every agent, so a pass must cost nothing and say nothing: a codex spawned here would be a turn nobody launched, and a file under the state directory would be state no run owns",
  () => {
    const state = flowState(), probe = flowState();
    const marker = path.join(probe, "codex-ran");
    fs.writeFileSync(path.join(probe, "codex"), `#!/bin/sh\necho ran >> "${marker}"\nexit 1\n`, { mode: 0o755 });
    const r = checkRun(GOOD_HEADER.replace("<DIR>", shimDir),
      { env: { ENTRUST_STATE_DIR: state, PATH: `${probe}:${process.env.PATH}` } });
    const verdict = passed(r);
    if (verdict !== true) return verdict;
    if (fs.existsSync(marker)) return "the check spawned a codex";
    const left = fs.readdirSync(state);
    return left.length === 0 || `the check wrote into the state directory: ${left.join(", ")}`;
  });

flow("--check-prompt-file needs no state directory",
  "the launcher's --new checks the prompt before any state exists, and a check that asked for a state directory would refuse every agent before it was spawned",
  () => passed(checkRun(GOOD_HEADER.replace("<DIR>", shimDir),
    { unset: ["ENTRUST_STATE_DIR"] })));

flow("--check-prompt-file refuses a WEB_SEARCH: mode the managed policy does not allow, with the run's own reason and the network left out of it",
  "the refusal used to arrive at --run, after an agent was spawned, and the coordinator swapped in the mode it named — twice, on a user's 'the network is allowed', which needed no line at all. Said before the spawn, and saying that the network is not what was refused, it goes back to the user as a question",
  async () => {
    const tool = spawnSync("plutil", ["-help"], { encoding: "utf8" });
    if (tool.error?.code === "ENOENT") return skip("no plutil here, and the policy reader asks plutil");
    // A plist in the managed profile's own shape: the requirements TOML, base64, under one key.
    const policy = path.join(flowState(), "policy.plist");
    const toml = Buffer.from('allowed_web_search_modes = ["cached"]\n').toString("base64");
    fs.writeFileSync(policy, `<?xml version="1.0" encoding="UTF-8"?>\n<plist version="1.0"><dict>`
      + `<key>requirements_toml_base64</key><string>${toml}</string></dict></plist>\n`);
    const agent = `RIGHTS: read ${shimDir}\nWEB_SEARCH: live\nTASK: find the release notes\n`;
    const r = checkRun(agent, { env: { ENTRUST_POLICY_SEAM: policy }, unset: ["ENTRUST_STATE_DIR"] });
    const verdict = refusal(r, /^entrust: refused: --web-search live is not permitted by this device's managed policy, which allows cached; the server would silently apply one of those and no response field would say so; another mode is the user's choice to make, not the coordinator's, and the network is unaffected: the agent's own commands reach it with no WEB_SEARCH: line\n$/);
    if (verdict !== true) return verdict;
    // The same file under --run gives the same reason, so the launcher's ERROR= line is the run's.
    const reason = r.err.slice("entrust: refused: ".length);
    const ran = await run({ scenario: "happy", noPrompt: true, agent, env: { ENTRUST_POLICY_SEAM: policy } });
    return (ran.code === EXIT.USAGE && ran.err.includes(`entrust: ${reason}`))
      || `--run did not refuse with the check's reason: exit ${ran.code} ${ran.err.trim().slice(-300)}`;
  });

flow("a policy file that is no plist dictionary refuses every WEB_SEARCH: mode as unreadable, and a prompt without the line still passes",
  "plutil answers \"Could not extract value\" both for a policy without the search key and for a file holding one bare word, which it parses as a one-string plist and -lint calls OK; read as the missing key, a corrupt policy opened every mode on the device (E46). `cached` is asked because a managed policy on the machine running this suite may allow it and nothing else",
  () => {
    const tool = spawnSync("plutil", ["-help"], { encoding: "utf8" });
    if (tool.error?.code === "ENOENT") return skip("no plutil here, and the policy reader asks plutil");
    const policy = path.join(flowState(), "policy.plist");
    fs.writeFileSync(policy, "garbage\n");
    const env = { ENTRUST_POLICY_SEAM: policy };
    const escaped = policy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const verdict = refusal(checkRun(`RIGHTS: read ${shimDir}\nWEB_SEARCH: cached\nTASK: find the release notes\n`, { env }),
      new RegExp(`^entrust: refused: this device has a managed Codex policy at ${escaped} that could not be read, so whether --web-search cached is permitted cannot be established; `));
    if (verdict !== true) return verdict;
    const plain = passed(checkRun(`RIGHTS: read ${shimDir}\nTASK: find the release notes\n`, { env }));
    return plain === true || `without a WEB_SEARCH: line: ${plain}`;
  });

flow("a policy dictionary without the search key narrows no WEB_SEARCH: mode",
  "the other half of the rule above: a managed profile that constrains other things says nothing about search, and refusing there would take every mode from a device whose policy never mentions one",
  () => {
    const tool = spawnSync("plutil", ["-help"], { encoding: "utf8" });
    if (tool.error?.code === "ENOENT") return skip("no plutil here, and the policy reader asks plutil");
    const policy = path.join(flowState(), "policy.plist");
    fs.writeFileSync(policy, `<?xml version="1.0" encoding="UTF-8"?>\n<plist version="1.0"><dict>`
      + `<key>other_setting</key><string>x</string></dict></plist>\n`);
    return passed(checkRun(`RIGHTS: read ${shimDir}\nWEB_SEARCH: cached\nTASK: find the release notes\n`,
      { env: { ENTRUST_POLICY_SEAM: policy } }));
  });

flow("--check-prompt-file refuses a write root over the state directory, with the run's own reason",
  "the launcher checks before an agent exists, and a root the run would refuse after its pid line passed the check: a refusal only the run gives arrives after the relay was spent",
  () => {
    const root = flowState(), state = path.join(root, "state");
    fs.mkdirSync(state);
    return refusal(checkRun(`RIGHTS: write ${root}\nTASK: x\n`, { env: { ENTRUST_STATE_DIR: state } }),
      /refusing to grant write access to .*: it is an ancestor of this driver's state directory/);
  });

flow("--check-prompt-file refuses a WRITABLE: root outside a registered plan's writes, and admits one inside",
  "a plan's writes are the user's approval of what an agent may write, and a WRITABLE: root is a write grant like the RIGHTS line",
  () => {
    const a = flowState(), b = flowState(), sub = path.join(a, "sub");
    fs.mkdirSync(sub);
    const env = { ENTRUST_PLAN_WRITES: `write ${a}` };
    const outside = refusal(checkRun(`RIGHTS: write ${a}\nWRITABLE: ${b}\nTASK: x\n`, { env }), /WRITABLE .* lies outside the approved plan's writes/);
    if (outside !== true) return outside;
    return passed(checkRun(`RIGHTS: write ${a}\nWRITABLE: ${sub}\nTASK: x\n`, { env }));
  });

flow("--check-prompt-file refuses an unknown upper-case field",
  "a typo in a header is a different agent, and the check is what stops it before one is spawned",
  () => {
    const r = checkRun(`RIGHTS: read ${shimDir}\nBOGUS: x\nTASK: do it\n`);
    return refusal(r, new RegExp(`^entrust: refused: unknown header field BOGUS at line 2 of ${r.file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} — `));
  });

flow("--check-prompt-file refuses an EFFORT: outside the driver's set",
  "an effort no server accepts is knowable from the file alone; the ones only the model catalogue refuses need the server, which the check never starts",
  () => refusal(checkRun(`RIGHTS: read ${shimDir}\nEFFORT: turbo\nTASK: do it\n`),
    /^entrust: refused: --effort must be one of none\|minimal\|low\|medium\|high\|xhigh\|max\|ultra\n$/));

flow("--help lists --check-prompt-file in one line",
  "the launcher's owner and a coordinator reading --help find the check there, or they find it nowhere",
  () => {
    const lines = helpRun("--help").stdout.split("\n").filter((l) => l.includes("--check-prompt-file"));
    return lines.length === 1 || `--help mentions --check-prompt-file on ${lines.length} lines: ${JSON.stringify(lines)}`;
  });

flow("D4 developer instructions name only effective writable roots and the staged-input rule",
  "the model needs its actual sandbox grants and must use staged alternatives for a known daemon constraint",
  async () => {
    const readTurn = await run({ scenario: "echo-instructions" });
    const readReport = JSON.parse(readTurn.out);
    if (readTurn.code !== 0 || !readReport.answer.includes(`Your writable roots are: ${readReport.sandbox?.writableRoots?.[0]}; /tmp is not one.`))
      return `read capsule: exit ${readTurn.code}, ${readReport.answer?.slice(0, 300)}`;
    const writable = flowState(), cwd = shimDir;
    const writeTurn = await run({ scenario: "echo-instructions", args: ["--level", "write", "--cwd", cwd, "--writable", writable] });
    const writeReport = JSON.parse(writeTurn.out);
    const capsule = writeReport.answer;
    if (!(writeTurn.code === 0 && capsule.includes(cwd) && capsule.includes(writable)
      && capsule.includes("daemon, socket, or mounted checkout") && capsule.includes("staged inputs")
      && capsule.includes("; /tmp is not one.")))
      return `write capsule: exit ${writeTurn.code}, ${capsule?.slice(0, 400)}`;
    const repo = path.join(flowState(), "repo"), extra = flowState();
    fs.mkdirSync(repo);
    let git = spawnSync("git", ["init", "-q", repo], { encoding: "utf8" });
    if (git.status !== 0) return `git init started, exit ${git.status}: ${git.stderr}`;
    git = spawnSync("git", ["-C", repo, "-c", "user.name=Eval", "-c", "user.email=eval@example.invalid", "commit", "--allow-empty", "-qm", "seed"], { encoding: "utf8" });
    if (git.status !== 0) return `git commit started, exit ${git.status}: ${git.stderr}`;
    const wt = await run({ scenario: "echo-instructions", noCwd: true,
      args: ["--level", "write", "--worktree", repo, "--writable", extra] });
    const wr = JSON.parse(wt.out);
    const expected = `Your writable roots are: ${fs.realpathSync(wr.tmpDir)}, ${wr.worktreePath}, ${fs.realpathSync(extra)}; /tmp is not one.`;
    return wt.code === 0 && wr.answer.includes(expected)
      || `worktree capsule exit ${wt.code}: expected ${expected}; got ${wr.answer?.slice(0, 500)}`;
  });

flow("D16 maxLength and maxItems use a corrective turn, strip server keywords, and preserve overflow",
  "the server can ignore size keywords, so the local validator must spend its retry and retain the original",
  async () => {
    const state = flowState(), schema = path.join(state, "caps.schema.json"), rpc = path.join(state, "rpc.log");
    fs.writeFileSync(schema, JSON.stringify({ type: "object", properties: {
      result: { type: "string", maxLength: 10 },
      evidence: { type: "array", items: { type: "string" }, maxItems: 1 }
    }, required: ["result", "evidence"], additionalProperties: false }));
    const r = await run({ scenario: "schema-size", args: ["--output-schema", schema], env: { FAKE_RPC_LOG: rpc } });
    const report = JSON.parse(r.out);
    if (r.code !== 13 || report.outputAttempts !== 2 || !report.schemaErrors?.some((e) => e.includes("maxLength")))
      return `cap retry: exit ${r.code}, ${JSON.stringify({ attempts: report.outputAttempts, errors: report.schemaErrors })}`;
    if (report.schemaKeywordsUnchecked?.includes("maxLength") || report.schemaKeywordsUnchecked?.includes("maxItems"))
      return `caps still unchecked: ${JSON.stringify(report.schemaKeywordsUnchecked)}`;
    if (!report.schemaErrors?.some((e) => e.includes("maxItems"))) return "maxItems was not enforced";
    if (!report.schemaOverflow?.completeAnswerPath || !fs.readFileSync(report.answerPath, "utf8").includes('"result":"material finding'))
      return "the complete overflow was not preserved";
    if (report.answer !== JSON.stringify(report.answerJson) || report.answerJson.result !== "material f"
      || report.answerJson.evidence.length !== 1 || report.schemaOverflow.clipped.length !== 2)
      return `clipped answer: ${report.answer}`;
    if (!report.schemaErrors.includes("$.result: 33 characters, maxLength 10")
      || !report.schemaErrors.includes("$.evidence: 2 entries, maxItems 1"))
      return `size errors: ${JSON.stringify(report.schemaErrors)}`;
    const logged = fs.readFileSync(rpc, "utf8").split("\n").filter((x) => /^(thread|turn)\/start/.test(x));
    return logged.length >= 3 && logged.every((x) => !/schema=.*(?:maxLength|maxItems)/.test(x.split(":input=")[0]))
      && logged.some((x) => x.includes("put its whole content in a file under $TMPDIR"))
      || `server RPC still carried caps: ${JSON.stringify(logged)}`;
  });

flow("D16 a large final overflow keeps the whole answer and clips every inline field",
  "a late material finding and 45 evidence items need a recoverable answerPath and a bounded answerJson",
  async () => {
    const schema = path.join(flowState(), "large.schema.json");
    fs.writeFileSync(schema, JSON.stringify({ type: "object", additionalProperties: false,
      required: ["status", "result", "evidence", "artifacts", "open"], properties: {
        status: { type: "string" }, result: { type: "string", maxLength: 1200 },
        evidence: { type: "array", items: { type: "string", maxLength: 80 }, maxItems: 40 },
        artifacts: { type: "array", items: { type: "string" } }, open: { type: "array", items: { type: "string" } }
      } }));
    const r = await run({ scenario: "schema-large", args: ["--output-schema", schema] });
    const report = JSON.parse(r.out), whole = fs.readFileSync(report.answerPath, "utf8");
    return r.code === 13 && report.outputAttempts === 2 && whole.length > 3000
      && report.answerJson.result.includes("[material finding at 1000]")
      && report.answerJson.result.length === 1200 && report.answerJson.evidence.length === 40
      && report.answerJson.evidence.every((x) => x.length <= 80)
      && report.answer === JSON.stringify(report.answerJson)
      && report.schemaOverflow.clipped.some((x) => x.path === "$.evidence" && x.length === 45)
      || `large overflow: exit ${r.code}, ${JSON.stringify({ answer: report.answerJson?.result?.length, evidence: report.answerJson?.evidence?.length, cuts: report.schemaOverflow?.clipped })}`;
  });

flow("D16 a repaired size attempt stays beside the corrected answer",
  "a successful corrective turn must not overwrite the complete first attempt",
  async () => {
    const schema = path.join(flowState(), "retry.schema.json");
    fs.writeFileSync(schema, JSON.stringify({ type: "object", additionalProperties: false,
      required: ["verdict", "count"], properties: { verdict: { type: "string", maxLength: 2 }, count: { type: "integer" } } }));
    const r = await run({ scenario: "schema-size-repair", args: ["--output-schema", schema] });
    const report = JSON.parse(r.out);
    return r.code === 0 && report.answerAttemptPaths?.length === 1
      && fs.readFileSync(report.answerAttemptPaths[0], "utf8").includes("long verdict")
      && fs.readFileSync(report.answerPath, "utf8").includes('"verdict":"ok"')
      || `retry: exit ${r.code}, attempts ${JSON.stringify(report.answerAttemptPaths)}`;
  });

flow("D16 invalid size limits are refused before a turn",
  "a fractional or negative limit has no JSON Schema size meaning and must not silently disable enforcement",
  () => {
    const schema = path.join(flowState(), "bad-caps.schema.json");
    fs.writeFileSync(schema, JSON.stringify({ type: "object", properties: { result: { type: "string", maxLength: -1 } }, required: ["result"], additionalProperties: false }));
    const r = checkRun(`RIGHTS: read ${shimDir}\nOUTPUT_SCHEMA: ${schema}\nTASK: return result\n`);
    return refusal(r, /maxLength must be a nonnegative integer/);
  });

flow("D16 help documents both local size keywords and per-run schema copies",
  "a coordinator can set a smaller limit without guessing which server keywords are safe",
  () => {
    const brief = helpRun("--help"), full = helpRun("--help-all");
    return brief.status === 0 && full.status === 0
      && brief.stdout.includes("maxLength and maxItems")
      && full.stdout.includes("Copy the shipped schema under")
      || `size help missing: ${JSON.stringify({ brief: brief.status, full: full.status })}`;
  });

failed += await runCases(FLOWS);

fs.rmSync(shimDir, { recursive: true, force: true });
process.exit(summarize(failed, CASES.length + FLOWS.length));
