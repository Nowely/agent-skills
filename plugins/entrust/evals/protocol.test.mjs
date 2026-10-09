#!/usr/bin/env node
// Protocol regression tests for scripts/driver.mjs: what the driver does with the SERVER's events.
//
// Every row here drives evals/fake-app-server.mjs through a scenario a live server will not produce on
// demand — a completion overtaking its response, an event from an ended turn, a request nobody can
// answer, a stream that never ends — plus the job record those runs leave behind and the exit ladder
// their verdicts are read off. The rows that ask what the driver does with its own ARGUMENTS are in
// cli.test.mjs, and both suites share evals/lib/scenarios.mjs.
//
//   node evals/protocol.test.mjs
//
// Exit 0 if every case matches its expected exit code.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { EXIT, FAKE, LADDER, readJson, registry, runCases, summarize, tempDir } from "./lib/harness.mjs";
import { SHIM, REVIEW_SCHEMA, assertKnownScenarios, attachFile, attachFile2, flowState, interruptLog,
         modelListLog, oneOfSchemaFile, protoSchemaFile, rateLimitLog, recordOf, run, runTable,
         schemaFile, until, wait } from "./lib/scenarios.mjs";

const shimDir = SHIM;
const approvalErrorLog = path.join(shimDir, "rpc-approval-error.log");
const duplicateLog = path.join(shimDir, "rpc-approval-duplicate.log");
const initializeLog = path.join(shimDir, "rpc-initialize.log");
const logLines = (log) => (fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "").split("\n").filter(Boolean);
const entry0 = (r) => (r.escalations ?? [])[0] ?? {};

// The prompt the stalled-reader row echoes back, sized past what a paused pipe holds: the pipe itself
// (64 KB by default), the reader's own buffer and the chunks libuv has in flight when pause() lands,
// which together absorbed 200 KB on Linux under one Node version. Under that much a report reaches even
// a consumer that never reads, and the drain watchdog is never armed. Bounded above by the prompt-file
// prompt cap of 512 KB, so 480 KB: 2.5 times the largest absorption measured.
const STALLED_READER_BODY = "y".repeat(480000);
const CASES = [
  { scenario: "model-unknown",    expect: EXIT.USAGE, args: ["--effort", "minimal"],
    env: { FAKE_RPC_LOG: modelListLog },
    why: "model/list rejects an effort the catalogue does not advertise before thread/start pays the normal provider floor",
    assertStderr: (e, ms) => {
      const log = fs.existsSync(modelListLog) ? fs.readFileSync(modelListLog, "utf8") : "";
      return (/model\/list/.test(log) && !/thread\/start/.test(log) && /not advertised/.test(e) && ms < 7000)
        || `catalogue refusal was late or missing: ${JSON.stringify({ ms, log, err: e.slice(0, 180) })}`;
    } },
  { scenario: "rate-limited",     expect: EXIT.USAGE, env: { FAKE_RPC_LOG: rateLimitLog },
    why: "an account whose primary window is exhausted is refused during setup, before a thread is started",
    assertStderr: (e, ms) => {
      const log = fs.existsSync(rateLimitLog) ? fs.readFileSync(rateLimitLog, "utf8") : "";
      return (/account\/rateLimits\/read/.test(log) && !/thread\/start/.test(log) && /primary.*100%/.test(e) && ms < 7000)
        || `rate-limit refusal was late or missing: ${JSON.stringify({ ms, log, err: e.slice(0, 180) })}`;
    } },
  { scenario: "turn-diff",        expect: EXIT.SUCCESS,
    why: "the last turn/diff/updated payload is persisted under the answer log and named in the report",
    assert: (r) => (typeof r.turnDiffPath === "string" && fs.readFileSync(r.turnDiffPath, "utf8") === "last diff\n")
      || `the last diff was not persisted: ${JSON.stringify(r.turnDiffPath)}` },
  { scenario: "async-question",   expect: EXIT.NEEDS_INPUT,
    why: "since 0.153.0 a human question can arrive as an agentMessage with questions, phased final_answer; it is an interaction, and the turn's real answer must remain the answer",
    assert: (r) => (Array.isArray(r.interactions) && r.interactions.some((i) => /^item\/agentMessage\/questions: Which database/.test(i)) && r.answer === "DONE-ANSWER")
      || `async question mishandled: ${JSON.stringify({ i: r.interactions, a: r.answer })}` },
  { scenario: "stale-turn",       expect: EXIT.COMMANDS,         why: "the command and answer belong to an earlier turn on the same thread" },
  { scenario: "early-completion", expect: EXIT.SUCCESS,                  why: "events that overtake the turn/start response are held and replayed, not lost" },
  { scenario: "foreign-thread",   expect: EXIT.COMMANDS,         why: "a subagent's work on another thread is not ours" },
  { scenario: "command-failed",   expect: EXIT.SUCCESS,
    why: "`false` exits 1; a failed command is a report field, not a rung, and the floor asks only whether anything ran — reading it as 'nothing ran' also prints the recall-only hint at a turn that ran a command",
    assert: (r) => (r.commandsFailed === 1 && r.commandsSucceeded === 0 && r.ok === true && r.hint === undefined)
      || `an all-failed turn was judged by the command floor: ${JSON.stringify({ failed: r.commandsFailed, ok: r.ok, hint: r.hint })}` },
  { scenario: "command-failed",   expect: EXIT.COMMANDS,         args: ["--expect-command", "false"],
    why: "a failed command never satisfies --expect-command: the expectation asks for proof, and an exit code of 1 is not it",
    assert: (r) => r.commandsMatchingExpectation === 0
      || `a failed command matched the expectation: ${JSON.stringify(r.commandsMatchingExpectation)}` },
  { scenario: "needs-user",       expect: EXIT.NEEDS_INPUT,         why: "a request no unattended client can answer is never a success" },
  { scenario: "elicitation",      expect: EXIT.NEEDS_INPUT,         why: "an MCP form needs a human, not a wider sandbox" },
  { scenario: "escalated",        expect: EXIT.APPROVAL,           why: "a refused approval outranks 'nothing ran' — it explains why" },
  { scenario: "escalated-file-change", expect: EXIT.APPROVAL,
    why: "file-change approvals use decline, not the legacy abort shape, and must remain sandbox escalations",
    assert: (r) => r.commandsSucceeded === 1 && r.escalations?.[0]?.method === "item/fileChange/requestApproval"
      || `file-change refusal was not accepted by the fixture: ${JSON.stringify({ commands: r.commandsSucceeded, escalations: r.escalations })}` },
  { scenario: "escalated-apply-patch", expect: EXIT.APPROVAL,
    why: "the legacy apply-patch approval uses abort and must not fall through as an interaction",
    assert: (r) => r.commandsSucceeded === 1 && r.escalations?.[0]?.method === "applyPatchApproval"
      || `apply-patch refusal was not accepted by the fixture: ${JSON.stringify({ commands: r.commandsSucceeded, escalations: r.escalations })}` },
  { scenario: "escalated-exec-command", expect: EXIT.APPROVAL,
    why: "the legacy exec-command approval uses abort and must not fall through as an interaction",
    assert: (r) => r.commandsSucceeded === 1 && r.escalations?.[0]?.method === "execCommandApproval"
      || `exec-command refusal was not accepted by the fixture: ${JSON.stringify({ commands: r.commandsSucceeded, escalations: r.escalations })}` },
  { scenario: "escalated-permissions", expect: EXIT.APPROVAL,
    why: "a permissions request is refused with an empty granted profile and must remain a sandbox escalation",
    assert: (r) => r.commandsSucceeded === 1 && r.escalations?.[0]?.method === "item/permissions/requestApproval"
      && r.escalations[0].why === "rights are set at launch"
      || `permissions refusal was not accepted by the fixture: ${JSON.stringify({ commands: r.commandsSucceeded, escalations: r.escalations })}` },
  { scenario: "turn-failed",      expect: EXIT.MODEL,  why: "arrival of turn/completed is not success; the status is — and a failure AFTER observable work is never retried",
    assert: (r) => (r.transientRetries?.length === 0) || `a turn with visible work was retried: ${JSON.stringify(r.transientRetries)}` },
  { scenario: "transient-then-ok", expect: EXIT.SUCCESS,
    why: "one bounded backoff absorbs an enumerated transient failure only when the turn produced no observable work",
    assert: (r) => (r.transientRetries?.length === 1 && r.transientRetries[0].cause === "responseStreamDisconnected" && r.commandsSucceeded === 1)
      || `the retry did not happen or was miscounted: ${JSON.stringify({ retries: r.transientRetries, cmds: r.commandsSucceeded })}` },
  { scenario: "transient-after-tool", expect: EXIT.MODEL,
    why: "an MCP tool call is observable work with side effects the replay would duplicate — the no-work guard must count the items the evidence gates ignore, not only commands, files and messages",
    assert: (r) => (r.transientRetries?.length === 0 && r.otherItemCounts?.mcpToolCall === 1)
      || `a turn that had already called a tool was retried: ${JSON.stringify({ retries: r.transientRetries, other: r.otherItemCounts })}` },
  { scenario: "transient-always", expect: EXIT.MODEL,
    why: "one retry is the whole budget: a cause that persists reports the failure instead of looping",
    assert: (r) => (r.transientRetries?.length === 1 && r.turnStatus === "failed")
      || `the retry budget was not one: ${JSON.stringify({ retries: r.transientRetries, status: r.turnStatus })}` },
  { scenario: "stalled-turn",     expect: EXIT.TIMEOUT, args: ["--timeout", "1"],
    why: "an expired turn budget is exit 3; 1s, not 0.25s (E49) — a budget under about 0.25s can expire before the driver has even processed thread/start, on a loaded machine, which is a pre-turn refusal (exit 3, no stdout) rather than the timed-out turn this case means to measure",
    assert: (r) => r.ok === false && r.exitCode === EXIT.TIMEOUT && r.turnStatus === "timedOut"
      || `timeout report lost its verdict: ${JSON.stringify({ ok: r.ok, exitCode: r.exitCode, turnStatus: r.turnStatus })}` },
  { scenario: "no-answer",        expect: EXIT.NO_ANSWER,           why: "commentary is not a final answer" },
  { scenario: "rich-items",       expect: EXIT.SUCCESS,
    why: "reasoning summaries, tool/search items and subagent threads must be visible in the report while the child's command counts for no root evidence",
    assert: (r) => (/Weighed A/.test(r.reasoningSummary ?? "") && r.otherItemCounts?.webSearch === 1
        && r.otherItems?.some((x) => x.type === "webSearch" && x.detail === "node atomics")
        && r.subagentThreads?.length === 1 && r.subagentThreads[0].threadId === "thr_child"
        && r.subagentThreads[0].commands === 1 && r.commandsSucceeded === 1
        // A thread/started with a parentThreadId carries neither of the two fields the root's own
        // announcement does, and null is the honest answer for both rather than a guess.
        && r.subagentThreads[0].agentPath === null && r.subagentThreads[0].status === null)
      || `visibility fields wrong: ${JSON.stringify({ reasoning: r.reasoningSummary, other: r.otherItemCounts, items: r.otherItems, sub: r.subagentThreads, cmds: r.commandsSucceeded })}` },
  { scenario: "echo-input",       expect: EXIT.SUCCESS, args: ["--attach", attachFile, "--attach", attachFile2],
    why: "--attach maps local images into the turn input as localImage items, IMAGES FIRST and in the order given — the layout every one of the 29 image-carrying user turns on this machine has, so an agent asked about 'the first screenshot' sees what its coordinator saw",
    assert: (r) => {
      let inp = null;
      try { inp = JSON.parse(r.answer); } catch { return `the fixture did not echo the input: ${String(r.answer).slice(0, 80)}`; }
      return (inp.length === 3
          && inp[0].type === "localImage" && String(inp[0].path).endsWith("shot.png")
          && inp[1].type === "localImage" && String(inp[1].path).endsWith("shot2.png")
          && inp[2].type === "text")
        || `input items wrong (expected image, image, text): ${JSON.stringify(inp.map((x) => x.type))}`;
    } },
  { scenario: "stalled-turn",     expect: EXIT.TIMEOUT, args: ["--timeout", "0.5"], env: { FAKE_RPC_LOG: interruptLog },
    why: "a timed-out turn is asked to END, not just killed: turn/interrupt marks the turn in the rollout and leaves the thread idle, so --resume on a cancelled agent is not a gamble",
    assert: () => {
      let log = "";
      try { log = fs.readFileSync(interruptLog, "utf8"); } catch {}
      return /turn\/interrupt/.test(log) || `the driver never sent turn/interrupt: ${JSON.stringify(log)}`;
    } },
  { scenario: "probe-negative",   expect: EXIT.SUCCESS,
    why: "a no-match grep or false test is a probe answering no; the server reports wrapped commands, so classification must use the parsed command rather than match the wrapper",
    assert: (r) => {
      if (!(r.commands ?? []).every((c) => /^\/bin\/zsh -c /.test(c.command)))
        return `the fixture stopped emitting the live wrapper, so this case no longer tests anything: ${JSON.stringify((r.commands ?? []).map((c) => c.command))}`;
      return (r.commandsFailed === 0 && r.commandsProbeNegative === 2)
        || `probe verdicts miscounted: failed=${r.commandsFailed} probes=${r.commandsProbeNegative}`;
    } },
  { scenario: "probe-quoted",     expect: EXIT.SUCCESS,
    why: "the server wraps a script carrying a double quote in double quotes and escapes the inner ones — measured live — so the bare command survives only in commandActions; unwrapping the text by hand cannot recover it, and the probe exemption dies again for exactly the agents that use quoted patterns",
    assert: (r) => (r.commandsFailed === 0 && r.commandsProbeNegative === 1)
      || `a quoted probe was not recovered from the server's own parse: failed=${r.commandsFailed} probes=${r.commandsProbeNegative}` },
  { scenario: "probe-piped",      expect: EXIT.SUCCESS,
    why: "a probe piped into another command exits with the LAST command's status, and the server parses it into two actions — classifying on the first one would launder `grep x | tail` exiting 1 into 'the probe answered no'",
    assert: (r) => (r.commandsFailed === 1 && r.commandsProbeNegative === 0)
      || `a pipeline was laundered into a probe: failed=${r.commandsFailed} probes=${r.commandsProbeNegative}` },
  { scenario: "escalated",        expect: EXIT.APPROVAL,
    why: "a refused approval completes its item as DECLINED with no exit code: never an unresolved command, and never a probe answering 'no' however grep-shaped its text — it is counted as declined, because a command an approval stopped never ran and so never failed",
    assert: (r) => (r.commandsDeclined === 2 && r.commandsFailed === 0 && r.commandsBlocked === 0 && r.commandsProbeNegative === 0)
      || `a declined command was misclassified: ${JSON.stringify({ d: r.commandsDeclined, f: r.commandsFailed, b: r.commandsBlocked, p: r.commandsProbeNegative })}` },
  { scenario: "escalated",        expect: EXIT.APPROVAL,
    why: "commandsFailed and commandsDeclined are disjoint, and neither is escalations: here ONE approval request was refused and TWO commands were declined by it, so a caller adding the counts, or reading one as the other, counts one refusal three times — and the split is a report change only, the exit still 6",
    assert: (r) => {
      const declined = (r.commands ?? []).filter((c) => c.status === "declined");
      if (declined.length !== 2)
        return `the fixture stopped declining commands, so this case no longer tests anything: ${JSON.stringify((r.commands ?? []).map((c) => c.status))}`;
      return (r.commandsDeclined === declined.length && r.commandsFailed === 0 && r.escalations?.length === 1)
        || `the declined commands were not split off the failures: ${JSON.stringify({ d: r.commandsDeclined, f: r.commandsFailed, esc: r.escalations?.length })}`;
    } },
  { scenario: "blocked-command",  expect: EXIT.SUCCESS,
    why: "a command with no numeric exit code that is neither failed nor declined has no verdict; that is a report field and no exit code, so a caller reads commandsBlocked instead of being told the run failed",
    assert: (r) => (r.commandsBlocked === 1 && r.commandsFailed === 0 && r.commandsSucceeded === 1)
      || `the unresolved command was not counted: ${JSON.stringify({ b: r.commandsBlocked, f: r.commandsFailed, s: r.commandsSucceeded })}` },
  { scenario: "probe-multiline",  expect: EXIT.SUCCESS,
    why: "codex sends multi-line bash scripts; a newline is a command separator too, so 'grep -q x file\\npnpm test' exiting 1 is a failed suite, not a probe answering no",
    assert: (r) => (r.commandsFailed === 1 && r.commandsProbeNegative === 0)
      || `a multi-line script was laundered into a probe: failed=${r.commandsFailed} probes=${r.commandsProbeNegative}` },
  { scenario: "probe-error",      expect: EXIT.SUCCESS,
    why: "probes reserve exit 2 for real trouble — a bad pattern is a failure, not a 'no'",
    assert: (r) => (r.commandsFailed === 1 && r.commandsProbeNegative === 0)
      || `a probe error was read as a 'no': failed=${r.commandsFailed} probes=${r.commandsProbeNegative}` },
  { scenario: "probe-compound",   expect: EXIT.SUCCESS,
    why: "a compound command starting with a probe keeps failure semantics: its exit 1 may belong to the other command",
    assert: (r) => (r.commandsFailed === 1 && r.commandsProbeNegative === 0)
      || `a compound command was laundered into a probe: failed=${r.commandsFailed} probes=${r.commandsProbeNegative}` },
  { scenario: "hidden-failure",  expect: EXIT.SUCCESS,
    why: "a completed turn that answered exits 0 whatever its commands did: both records of the old rung were harm, and the failure stays counted for the caller to read",
    assert: (r) => (r.commandsFailed === 1 && r.ok === true)
      || `the failure left the report, or the run was still failed: ${JSON.stringify({ failed: r.commandsFailed, ok: r.ok })}` },
  { scenario: "hidden-failure",  expect: EXIT.COMMANDS,
    args: ["--expect-command", "zzz_never"],
    why: "the demoted rung takes nothing with it: asking for proof and then accepting its absence is the failure --expect-command exists to prevent",
    assert: (r) => r.commandsMatchingExpectation === 0
      || `the expectation was not measured: ${JSON.stringify(r.commandsMatchingExpectation)}` },
  { scenario: "null-phase",      expect: EXIT.SUCCESS,                 why: "the schema permits phase: null; an unphased answer is still an answer" },
  { scenario: "early-request",   expect: EXIT.NEEDS_INPUT,        why: "a blocking request before the turn id exists still belongs to us" },
  { scenario: "mcp-null-turn",   expect: EXIT.NEEDS_INPUT,        why: "MCP turnId is nullable; a null one must not read as someone else's" },
  { scenario: "no-ids-request",  expect: EXIT.NEEDS_INPUT,        why: "attestation carries no ids at all and must fail closed" },
  { scenario: "blank-answer",    expect: EXIT.NO_ANSWER,          why: "whitespace is not a final answer" },
  { scenario: "late-item",       expect: EXIT.COMMANDS,        why: "an item arriving after the turn ended cannot supply the evidence the turn lacked" },
  { scenario: "double-completion", expect: EXIT.SUCCESS,               why: "a second completion for the same turn must not overwrite the first verdict" },
  { scenario: "completion-foreign-thread", expect: EXIT.SUCCESS,       why: "a completion carrying our turn id on another thread is not ours" },
  { scenario: "turn-start-error", expect: EXIT.TRANSPORT,         why: "turn/start failed, so there is no turn and no possible success" },
  { scenario: "unknown-response-id", expect: EXIT.SUCCESS,             why: "a response with an id nobody sent is discarded, not matched to a pending request" },
  { scenario: "null-frame",      expect: EXIT.SUCCESS,
    why: "`null` parses as JSON and is no JSON-RPC frame: read as one it threw out of the stdout reader into abort(), which publishes the pre-turn shape and drops the command and the answer already collected",
    assert: (r) => (r.commandsSucceeded === 1 && r.answer === "the answer")
      || `a non-object frame cost the run its evidence: ${JSON.stringify({ cmds: r.commandsSucceeded, answer: r.answer })}` },
  { scenario: "wrong-command",   expect: EXIT.COMMANDS,        args: ["--expect-command", "vitest", "--allow-no-commands"],
    why: "--allow-no-commands waives the command floor, never an expectation the caller declared" },
  { scenario: "wrong-command",    expect: EXIT.COMMANDS,         args: ["--expect-command", "vitest"],
    why: "a successful command that is not the demanded one must not satisfy the gate" },
  { scenario: "wrong-command",    expect: EXIT.SUCCESS,                  args: [],
    why: "without --expect-command the same run passes: the gate is only as strong as the caller's claim" },
  { scenario: "profile-missing",  expect: EXIT.TRANSPORT,
    why: "read level asks for its permission profile via -c; if the server did not apply it, the run is under an unknown sandbox and must stop" },
  { scenario: "profile-wrong",    expect: EXIT.TRANSPORT,
    why: "some other profile is not the one whose limits the caller reasoned about, however plausible its name" },
  { scenario: "profile-effect-dropped", expect: EXIT.TRANSPORT,
    why: "the id reads back correctly while the $TMPDIR grant is gone — a name-only check passes here, which is why the check is on the effect" },
  { scenario: "profile-widened",  expect: EXIT.TRANSPORT,
    why: "more writable roots than asked for is also a sandbox nobody reasoned about; widening must fail as loudly as narrowing" },
  // Both of these are refused at thread/start, so no turn is ever started and the fixture has no
  // turn/start handler for either name. The stderr assertion is what tells that refusal from a fixture
  // that died in its own default branch, which is TRANSPORT too and would read as a pass.
  { scenario: "profile-networked", expect: EXIT.TRANSPORT, args: ["--no-network"],
    why: "an agent that denied egress and was given it anyway is under a sandbox nobody reasoned about; the profile's own network table is the field the guard holds, and it is the only evidence the denial took effect",
    assertStderr: (t) => /networkAccess/.test(t) || `the refusal must name what differed: ${t.trim().slice(0, 160)}` },
  { scenario: "profile-network-dropped", expect: EXIT.TRANSPORT,
    why: "the mirror of the widening, and the one the default makes reachable: the profile id reads back correctly while its network table was dropped, so an agent whose task was written around egress would run the whole turn without it and report the failures as findings",
    assertStderr: (t) => /networkAccess/.test(t) || `the refusal must name what differed: ${t.trim().slice(0, 160)}` },
  { scenario: "write-root-widened", expect: EXIT.TRANSPORT, args: ["--level", "write"],
    why: "write level must reject a writable root the driver never sent, even when every other sandbox field matches",
    assertStderr: (t) => /writable roots/.test(t) || `stderr did not name the writable roots: ${JSON.stringify(t)}` },
  { scenario: "write-full-access", expect: EXIT.TRANSPORT, args: ["--level", "write"],
    why: "write level must reject dangerFullAccess before an otherwise healthy turn can run",
    assertStderr: (t) => /sandbox type/.test(t) || `stderr did not name the sandbox type: ${JSON.stringify(t)}` },
  // The two implicit temp grants of a workspace-write sandbox. Neither appears in writableRoots, so
  // every other write-level case stays green while the grant the caller reasoned about is not the one
  // that applied.
  { scenario: "write-slash-tmp-open", expect: EXIT.TRANSPORT, args: ["--level", "write"],
    why: "a write agent is told it may write --cwd, --writable and $TMPDIR; with /tmp left open it may write all of /tmp too, and no root list reveals it",
    assertStderr: (t) => /excludeSlashTmp/.test(t) || `the refusal did not name the field that differed: ${JSON.stringify(t.trim().slice(0, 160))}` },
  { scenario: "write-tmpdir-excluded", expect: EXIT.TRANSPORT, args: ["--level", "write"],
    why: "a NARROWER sandbox is refused as loudly as a wider one: with $TMPDIR withheld every heredoc, mkdtemp and test runner dies, and the agent reports those failures as findings about the task",
    assertStderr: (t) => /excludeTmpdirEnvVar/.test(t) || `the refusal did not name the field that differed: ${JSON.stringify(t.trim().slice(0, 160))}` },
  { scenario: "profile-slash-tmp-open", expect: EXIT.TRANSPORT,
    why: "the read level's promise is that $TMPDIR is writable and nothing else is; with $TMPDIR outside /tmp the explicit root list reads back correct while all of /tmp is writable beside it",
    assertStderr: (t) => /excludeSlashTmp/.test(t) || `the refusal did not name the field that differed: ${JSON.stringify(t.trim().slice(0, 160))}` },
  { scenario: "failed-null-exit", expect: EXIT.SUCCESS,
    why: "the schema permits a FAILED command with exitCode null; failure classification must not depend on a numeric exit code",
    assert: (r) => r.commandsFailed === 1 || `the failed command was not counted: failed=${r.commandsFailed} blocked=${r.commandsBlocked}` },
  { scenario: "escalated-subagent", expect: EXIT.APPROVAL,
    why: "the refusal is sent whoever asked, so a subagent really was blocked — evidence of FAILURE must be inclusive even though evidence of SUCCESS is root-only",
    assert: (r) => r.escalations?.length === 1 || `a refused subagent escalation went unrecorded: ${JSON.stringify(r.escalations)}` },
  { scenario: "file-changes",     expect: EXIT.SUCCESS,
    why: "a failed patch must reach the report; PatchChangeKind is an object whose type and move_path must be rendered as meaningful fields",
    assert: (r) => (r.fileChangesFailed?.length === 1 && r.fileChangesFailed[0].kind === "update"
        && JSON.stringify(r.filesTouched) === JSON.stringify(["/tmp/wrote.txt", "/tmp/new.txt"])
        // fileChanges keeps what filesTouched folds away: the kind, and the path a rename STARTED at.
        && JSON.stringify(r.fileChanges) === JSON.stringify([
             { path: "/tmp/wrote.txt", kind: "add", move: null },
             { path: "/tmp/old.txt", kind: "update", move: "/tmp/new.txt" }]))
      // The rename must be reported by its DESTINATION: /tmp/old.txt no longer exists after it.
      || `write results wrong: touched=${JSON.stringify(r.filesTouched)} changes=${JSON.stringify(r.fileChanges)} failed=${JSON.stringify(r.fileChangesFailed)}` },
  { scenario: "resume-active",    expect: EXIT.BUSY, args: ["--resume", "thr_root"],
    why: "shutdown signals must not overwrite the exit code of a deliberate refusal after spawn" },
  // A probe that never replies, under the shortest budget the clamp allows: --timeout 1 is the seam, and
  // no thread is ever started, so the run ends on the wall clock rather than racing the fixture's answer.
  { scenario: "no-thread",        expect: EXIT.TIMEOUT, args: ["--timeout", "1"],
    env: { FAKE_CONFIG_HANG: "1" },
    why: "the probe carries a bell of its own, clamped between CONFIG_PROBE_MIN_MS and CONFIG_PROBE_MAX_MS: without it a config request that never answers holds the run open before the turn, and no other case drives that bound at all",
    assertStderr: (e) => /could not read the caller's Codex config \(no reply in 1000ms\)/.test(e)
      || `the probe's own budget did not end it: ${e.slice(0, 200)}` },
  { scenario: "policy-clamped",   expect: EXIT.TRANSPORT,
    why: "an MDM profile clamps a policy it does not permit, after which every command is denied while the run still looks healthy — the exact failure this driver exists to route around, and invisible in every other field" },
  { scenario: "workspace-elsewhere", expect: EXIT.TRANSPORT,
    why: "a workspace that does not contain the cwd means everything the turn writes lands somewhere the caller did not choose, and nothing in the sandbox object reveals it" },
  { scenario: "reviewer-auto",    expect: EXIT.TRANSPORT,
    why: "approvals routed to the server's own reviewer never reach this driver, so the refusal policy is disarmed while the sandbox object stays byte-identical — nothing else in the response can catch it" },


  // --- teardown: nothing this driver started may outlive it ---
  { scenario: "spawn-survivor",   expect: EXIT.SUCCESS,
    why: "group teardown must wait out TERM-ignoring descendants so test servers and watchers cannot outlive normal completion",
    assert: (r) => {
      const pid = Number((String(r.answer).match(/survivor (\d+)/) ?? [])[1]);
      if (!pid) return `the fixture did not report its survivor pid: ${JSON.stringify(r.answer)}`;
      try { process.kill(pid, 0); return `survivor ${pid} is still alive after the driver exited`; }
      catch { return true; }
    } },
  { scenario: "stale-turn",       expect: EXIT.COMMANDS,
    why: "exit 5 with no declared expectation names the flag that waives it, so a recall-only caller has a self-serve path",
    assert: (r) => /allow-no-commands/.test(r.hint ?? "") || `exit 5 carried no hint: ${JSON.stringify(r.hint)}` },
  { scenario: "wrong-command",    expect: EXIT.COMMANDS, args: ["--expect-command", "vitest"],
    why: "with a declared expectation the hint would be a lie — --allow-no-commands never waives an expectation",
    assert: (r) => r.hint === undefined || `a hint appeared beside a declared expectation: ${JSON.stringify(r.hint)}` },

  // --- --output-schema: the server constrains, the driver checks, one corrective turn is spent ---
  { scenario: "schema-good",      expect: EXIT.SUCCESS, args: ["--output-schema", schemaFile],
    why: "a first-try match spends no corrective turn, reports the parsed object, and SAYS it matched — an outputSchemaOk read off the absence of errors cannot tell a schema that passed from one never checked",
    assert: (r) => (r.outputAttempts === 1 && r.outputSchemaOk === true && r.schemaErrors === null && r.answerJson?.verdict === "ok")
      || `schema-good report wrong: ${JSON.stringify({ a: r.outputAttempts, ok: r.outputSchemaOk, errs: r.schemaErrors, j: r.answerJson })}` },
  { scenario: "schema-retry",     expect: EXIT.SUCCESS, args: ["--output-schema", schemaFile],
    why: "prose on the first attempt gets ONE corrective turn carrying the validation errors, mirroring a Claude subagent's tool-layer retry",
    assert: (r) => (r.outputAttempts === 2 && r.outputSchemaOk === true && r.answerJson?.verdict === "ok" && r.commandsSucceeded === 2)
      || `schema-retry report wrong: ${JSON.stringify({ a: r.outputAttempts, ok: r.outputSchemaOk, j: r.answerJson, c: r.commandsSucceeded })}` },
  { scenario: "schema-never",     expect: EXIT.SCHEMA, args: ["--output-schema", schemaFile],
    why: "a shape that never arrives is exit 13, not an exit 0 whose caller must remember to read answerJsonError",
    assert: (r) => (r.outputAttempts === 2 && r.outputSchemaOk === false && Array.isArray(r.schemaErrors) && r.schemaErrors.length > 0)
      || `schema-never report wrong: ${JSON.stringify({ a: r.outputAttempts, ok: r.outputSchemaOk, e: r.schemaErrors })}` },
  { scenario: "schema-never",     expect: EXIT.SCHEMA, args: ["--output-schema", REVIEW_SCHEMA],
    why: "the shipped adversarial-review schema passes strict-schema admission and reaches the turn; the scripted invalid answer then fails at output validation, not setup",
    assert: (r) => (r.outputAttempts === 2 && r.outputSchemaOk === false && Array.isArray(r.schemaErrors))
      || `the shipped schema did not reach output validation: ${JSON.stringify({ a: r.outputAttempts, ok: r.outputSchemaOk, e: r.schemaErrors })}` },
  { scenario: "schema-good",      expect: EXIT.SUCCESS, args: ["--output-schema", oneOfSchemaFile],
    why: "keywords the shallow validator ignores must be NAMED in the report, so outputSchemaOk can never silently mean 'nothing was checked'",
    assert: (r) => (r.outputSchemaOk === true && Array.isArray(r.schemaKeywordsUnchecked) && r.schemaKeywordsUnchecked.includes("oneOf"))
      || `unchecked keywords not reported: ${JSON.stringify(r.schemaKeywordsUnchecked)}` },
  { scenario: "schema-retry-refused", expect: EXIT.SCHEMA, args: ["--output-schema", schemaFile],
    why: "a refused corrective turn must preserve the completed first turn's evidence and report the schema failure",
    assert: (r) => (r.outputSchemaOk === false && r.outputAttempts === 2 && String(r.answer).length > 0 && r.commandsSucceeded === 1)
      || `the first turn's report was lost: ${JSON.stringify({ ok: r.outputSchemaOk, a: r.outputAttempts, ans: String(r.answer).slice(0, 40) })}` },

  { scenario: "late-completion",  expect: EXIT.TIMEOUT, args: ["--timeout", "0.4", "--output-schema", schemaFile],
    why: "a completion arriving after the deadline reported must not start a corrective turn on a run that declared itself timed out",
    assertStderr: (t) => !/spending the corrective turn/.test(t) || "a settled run announced new work after its own report" },
  { scenario: "schema-good",      expect: EXIT.SCHEMA, args: ["--output-schema", protoSchemaFile],
    why: "a required key named after an Object.prototype member is missing; inherited properties must not add invented validation errors to the corrective prompt",
    assert: (r) => {
      const errs = (r.schemaErrors ?? []).join(" | ");
      if (/got function/.test(errs)) return `the prototype was validated instead of the absent key: ${errs}`;
      return /toString: required and missing/.test(errs) || `the missing key was not reported plainly: ${errs}`;
    } },

  // --- caps and bounds published by the driver ---
  { scenario: "long-answer",      expect: EXIT.SUCCESS, args: ["--brief"],
    why: "the --brief cap includes the clipped marker; appending the marker after clipping would exceed the bound",
    assert: (r) => {
      const bytes = Buffer.byteLength(String(r.answer), "utf8");
      if (bytes > 4000) return `--brief returned ${bytes} bytes, past its own 4000-byte cap`;
      if (r.answerTruncated !== true) return "a 200-line answer was not marked truncated";
      return /full answer at/.test(String(r.answer)) || "the clip marker lost its forwarding address";
    } },
  { scenario: "tmp-write",        expect: EXIT.SUCCESS,
    why: "the private directory is the read agent's only writable root, whatever TMPDIR the caller exported, and may hold files named by --brief; it must outlive the run so those answer paths remain usable",
    assert: (r) => {
      const named = /full notes at (\S+)/.exec(String(r.answer))?.[1];
      if (!named) return `the agent did not name the file it wrote: ${String(r.answer).slice(0, 160)}`;
      if (!fs.existsSync(named)) return `the path the answer names was removed with the run: ${named}`;
      if (r.tmpDir === null) return "a kept private temp directory was not named in the report";
      if (path.dirname(named) !== r.tmpDir) return `the report's tmpDir is not the directory the file is in: ${JSON.stringify({ tmpDir: r.tmpDir, named })}`;
      return true;
    } },
  { scenario: "env-tmpprefix",    expect: EXIT.SUCCESS, unsetEnv: ["TMPPREFIX"],
    why: "zsh keeps every here-document in a file under TMPPREFIX, default /tmp/zsh, which no grant covers: the agent's shell must see it under the run's TMPDIR or every <<EOF fails (measured, 15 rollouts)",
    assert: (r) => {
      const got = /TMPPREFIX=(\S+)/.exec(String(r.answer))?.[1];
      if (!got) return `the fixture did not report TMPPREFIX: ${String(r.answer).slice(0, 160)}`;
      if (r.tmpDir === null) return "a private temp directory was not named in the report";
      return got === path.join(r.tmpDir, "zsh") || `TMPPREFIX is not under the run's TMPDIR: ${JSON.stringify({ got, tmpDir: r.tmpDir })}`;
    } },
  // The same question at WRITE level, which excludes /tmp: without the run's own directory, os.tmpdir()
  // and TMPPREFIX would both point into a directory the sandbox refuses, and every heredoc and mkdtemp in
  // the turn would fail with nothing in the report saying why.
  { scenario: "env-tmpprefix",    expect: EXIT.SUCCESS, unsetEnv: ["TMPPREFIX"], args: ["--level", "write"],
    why: "the private $TMPDIR is not a read-level convenience: with /tmp excluded from the write sandbox, a write agent has no writable temp root at all unless the driver makes one",
    assert: (r) => {
      const got = /TMPPREFIX=(\S+)/.exec(String(r.answer))?.[1];
      if (!got) return `the fixture did not report TMPPREFIX: ${String(r.answer).slice(0, 160)}`;
      if (r.tmpDir === null) return "a write run did not make a private temp directory";
      return got === path.join(r.tmpDir, "zsh") || `TMPPREFIX is not under the run's TMPDIR: ${JSON.stringify({ got, tmpDir: r.tmpDir })}`;
    } },

  // --- a server that dies mid-turn still has to hand back what the turn did ---
  { scenario: "server-crash",     expect: EXIT.TRANSPORT,
    why: "an app-server that dies mid-turn must not discard the threadId, commands and partial answer already collected",
    assert: (r) => (r.commandsSucceeded === 1 && r.threadId === "thr_root"
      && /crashed/.test(JSON.stringify(r.turnError ?? {})) && /partial answer/.test(String(r.answer)))
      || `the crash discarded the turn's evidence: ${JSON.stringify({ cmds: r.commandsSucceeded, thread: r.threadId, err: r.turnError, answer: String(r.answer).slice(0, 60) })}` },

  // --- the main transport's two unbounded buffers ---
  { scenario: "early-flood",      expect: EXIT.TRANSPORT,
    why: "turn-scoped notifications held before turn/start responds need a bound so a broken server cannot exhaust memory while the response never arrives",
    assertStderr: (e) => /before answering turn\/start/.test(e)
      || `the early buffer was not bounded: ${e.slice(0, 200)}` },
  // One run for both questions: the scenario pushes 34 MB through the pipe, so a second row cost ten seconds.
  { scenario: "unterminated-line", expect: EXIT.TRANSPORT,
    why: "the main transport must bound unterminated lines so one broken server write cannot exhaust memory, and an abort taken after the thread exists hands back what the turn already produced: the pre-turn shape would report a command that ran and an answer that arrived as `turnStatus: null, answer: \"\"`, which is a coordinator relaunching work that is finished",
    assertStderr: (e) => /with no newline/.test(e)
      || `an unterminated line was buffered without a bound: ${e.slice(0, 200)}`,
    assert: (r) => (r.turnStatus === "failed" && r.commandsSucceeded === 1 && r.answer === "the answer"
      && r.turnError?.codexErrorInfo === "aborted")
      || `the abort discarded the turn's evidence: ${JSON.stringify({ turnStatus: r.turnStatus, cmds: r.commandsSucceeded, answer: r.answer, err: r.turnError })}` },

  { scenario: "no-trailing-newline", expect: EXIT.SUCCESS,
    why: "EOF terminates a line as surely as a newline; the final turn/completed must still be processed when its trailing newline is missing",
    assert: (r) => (r.turnStatus === "completed" && r.commandsSucceeded === 1 && /the answer/.test(String(r.answer)))
      || `a final line without its newline was dropped: ${JSON.stringify({ turn: r.turnStatus, cmds: r.commandsSucceeded, answer: String(r.answer).slice(0, 40) })}` },

  // --- the report has to reach stdout, and a paused reader is not a broken one ---
  { scenario: "long-answer",      expect: EXIT.TRANSPORT, closeStdout: true,
    why: "a consumer that stops reading makes the report write fail EPIPE; this must be the documented transport failure, not an uncaught exception",
    assertStderr: (e) => /EPIPE|did not reach the caller/.test(e)
      || `a closed stdout was not reported as a transport failure: ${e.slice(0, 200)}` },
  { scenario: "long-answer",      expect: EXIT.SUCCESS, pauseStdout: 8000, args: ["--timeout", "40"],
    why: "a paused reader must have the remaining report-drain budget to resume; a short fixed wait can truncate a report the reader would have drained",
    assert: (r) => (typeof r.answer === "string" && r.answer.length > 60000)
      || `the report was truncated for a consumer that paused: ${String(r.answer ?? "").length} bytes of answer` },
  { scenario: "echo-input",       expect: EXIT.TRANSPORT, stallStdout: true, args: ["--timeout", "3"],
    noPrompt: true, agent: `RIGHTS: read <CWD>\n${STALLED_READER_BODY}\n`,
    why: "a reader that pauses and never resumes is the only thing the drain watchdog answers for, and nothing had ever fired it: every path that writes stdout now leaves through the one funnel, so the bound that funnel carries is the bound of them all",
    assertStderr: (e) => /stdout did not drain within \d+ms/.test(e)
      || `a reader that never resumed was not bounded by the drain watchdog: ${e.slice(0, 200)}` },
  { scenario: "probe-piped",      expect: EXIT.SUCCESS,
    why: "the report must name commands piped to a pager because an agent can mistake a slice of its evidence for the whole result",
    assert: (r) => (r.commandsPipedToPager === 1 && /head\/tail\/less/.test(String(r.pipedToPagerHint ?? "")))
      || `a command ending in a pager was not counted: ${JSON.stringify({ n: r.commandsPipedToPager, hint: r.pipedToPagerHint })}` },

  // --- the server's parse is evidence, not authority ---
  { scenario: "probe-laundered",  expect: EXIT.SUCCESS,
    why: "one tidy commandAction for a multi-line script must not hide a failed command on a later line behind a probe exemption",
    assert: (r) => (r.commandsProbeNegative === 0 && r.commandsFailed === 1)
      || `a multi-line script was read as a probe: ${JSON.stringify({ probe: r.commandsProbeNegative, failed: r.commandsFailed })}` },

  // --- the standing rules the driver puts on the thread ---
  { scenario: "echo-instructions", expect: EXIT.SUCCESS,
    why: "an agent holding egress and told to use the local shell and filesystem only does not use it: the standing rules are what the turn plans against, so a grant they do not name is a grant that was paid for and left unspent",
    assert: (r) => (/network/i.test(String(r.answer)) && !/no network access/i.test(String(r.answer)))
      || `the default agent was not told it has egress: ${String(r.answer).slice(0, 300)}` },
  { scenario: "echo-instructions", expect: EXIT.SUCCESS, args: ["--no-network"],
    why: "the denied agent has to be told too, or it spends the turn on fetches the sandbox refuses and reports the refusals as findings",
    assert: (r) => /no network access/i.test(String(r.answer))
      || `an agent with egress denied was not told: ${String(r.answer).slice(0, 300)}` },
  { scenario: "echo-instructions", expect: EXIT.SUCCESS, args: ["--brief"],
    why: "--brief's second sentence is what keeps a capped answer from losing its detail; it must still be sent when it is not contradicted",
    assert: (r) => /Put anything longer/.test(String(r.answer))
      || `--brief lost its forwarding instruction: ${String(r.answer).slice(0, 200)}` },
  { scenario: "echo-instructions", expect: EXIT.SCHEMA, args: ["--brief", "--output-schema", schemaFile],
    why: "under --output-schema the agent has just been told to answer with ONE JSON object and nothing else; telling it in the same breath to put the rest in a file is a contradiction the agent has to resolve on its own",
    assert: (r) => (!/Put anything longer/.test(String(r.answer)) && /ONE JSON object/.test(String(r.answer)))
      || `the contradictory pair was still sent: ${String(r.answer).slice(0, 300)}` },

  // --- the wall clock: cut, then report ---
  { scenario: "cut-flush",        expect: EXIT.TIMEOUT, args: ["--timeout", "1"],
    why: "a cut asks the server to end the turn and grants time to do so; an answer delivered inside that grace must reach the caller",
    assert: (r) => {
      if (r.cut?.kind !== "wall") return `the report did not name the budget that cut it: ${JSON.stringify(r.cut)}`;
      if (r.cut.completedInGrace !== true) return `the turn closed inside the grace and the report says otherwise: ${JSON.stringify(r.cut)}`;
      if (!/flushed at the interrupt/.test(String(r.answer))) return `the flushed answer was discarded: ${JSON.stringify(String(r.answer).slice(0, 80))}`;
      return (r.turnStatus === "timedOut" && r.cut.limit === 1) || `a cut turn must still report the budget it was cut on: ${JSON.stringify({ t: r.turnStatus, cut: r.cut })}`;
    } },
  { scenario: "cut-partial",      expect: EXIT.TIMEOUT, args: ["--timeout", "1"],
    why: "the MEASURED server (E1): the interrupt flushes nothing and the in-flight message is discarded, so the accumulated deltas are the only copy of what the model had written. It is never the answer — unfinished text the model did not deliver, in its own field — and the messages of a turn that answered nothing get a path of their own",
    assert: (r) => {
      if (r.cut?.completedInGrace !== false) return `nothing closed the turn, so completedInGrace must be false: ${JSON.stringify(r.cut)}`;
      if (String(r.answer) !== "") return `an unfinished partial was promoted to the answer: ${JSON.stringify(String(r.answer).slice(0, 80))}`;
      if (r.answerPartial !== "The answer so far, and this much more")
        return `the partial was not reassembled from the deltas: ${JSON.stringify(r.answerPartial)}`;
      // The commentary message was STREAMED and then completed: its deltas must not survive as a partial.
      if (/looking into it/.test(String(r.answerPartial))) return "a message the server completed came back as a partial";
      if (!r.commentaryPath || !fs.existsSync(r.commentaryPath)) return `a turn with only commentary wrote no commentaryPath: ${r.commentaryPath}`;
      return /looking into it/.test(fs.readFileSync(r.commentaryPath, "utf8")) || "commentaryPath does not hold the turn's messages";
    } },
  { scenario: "cut-partial",      expect: EXIT.TIMEOUT, args: ["--timeout", "1"],
    why: "exit 3 is a budget the CALLER set, so the report has to say what the caller can do about it; the thread is still there and resuming it is the recovery, with the caveat that a turn still closing refuses with exit 10",
    assert: (r) => (/--resume thr_root/.test(String(r.hint)) && /RESUME: (\/\S+|<this report's path>)/.test(String(r.hint))
        && /exit 10/.test(String(r.hint)) && /--effort/.test(String(r.hint)) && /split/.test(String(r.hint)))
      || `the exit-3 hint does not name the way out: ${JSON.stringify(r.hint)}` },
  { scenario: "no-thread",        expect: EXIT.TIMEOUT, args: ["--timeout", "0.5"],
    why: "the pre-thread rung is unchanged by the cut: with no thread there is nothing to interrupt and nothing to report, so it aborts with the code and prints no report — the same contract --help publishes",
    assertStderr: (e) => /timed out after 0.5s/.test(e) || `the pre-thread timeout did not announce itself: ${e.slice(0, 200)}` },
  { scenario: "echo-instructions", expect: EXIT.SUCCESS,
    why: "the model has no clock unless it runs `date`, so a wall-clock budget it is never told about is one it cannot plan against — the sentence is the whole of P1 and it costs nothing",
    assert: (r) => {
      const n = Number(/You have about (\d+) seconds of wall clock/.exec(String(r.answer))?.[1]);
      if (!Number.isFinite(n)) return `the budget never reached the agent: ${String(r.answer).slice(0, 200)}`;
      return (n > 0 && n <= 20) || `the agent was told ${n}s of a 20 s budget`;
    } },
  { scenario: "echo-instructions", expect: EXIT.SUCCESS, args: ["--resume", "thr_root"],
    why: "developerInstructions are per-request, not per-thread: a resumed turn that did not carry the budget sentence would be the only turn running blind, and --resume is exactly where a long agent continues",
    assert: (r) => (/You have about \d+ seconds of wall clock/.test(String(r.answer)) && r.resumedFrom === "thr_root")
      || `a resumed turn lost the budget sentence: ${JSON.stringify({ a: String(r.answer).slice(0, 160), from: r.resumedFrom })}` },

  // --- the idle guard: the bound that tells a working turn from a hung one ---
  { scenario: "idle-silence",     expect: EXIT.TIMEOUT, args: ["--idle-timeout", "1", "--timeout", "8"],
    why: "a turn that says NOTHING is the hang the wall clock cannot name: --timeout is a budget a healthy turn may spend in full, so only silence distinguishes them, and every root event rearms it",
    assert: (r) => (r.cut?.kind === "idle" && r.cut.limit === 1 && r.cut.observed >= 1 && r.turnStatus === "timedOut")
      || `the silent turn was not cut on the idle budget: ${JSON.stringify({ cut: r.cut, t: r.turnStatus })}` },
  { scenario: "idle-subagent",    expect: EXIT.SUCCESS, args: ["--idle-timeout", "1", "--timeout", "20"],
    why: "subagent notifications prove liveness even while the root is silent; success evidence stays root-only so the child's command satisfies no gate",
    assert: (r) => {
      if (r.cut !== null) return `a turn whose subagent was working throughout was cut: ${JSON.stringify(r.cut)}`;
      if (r.subagentThreads?.[0]?.threadId !== "thr_child") return `the subagent thread was not registered: ${JSON.stringify(r.subagentThreads)}`;
      // The root ran exactly one command; the child's is counted for the child and for nothing else.
      return (r.commandsSucceeded === 1 && r.tokenUsage?.total?.totalTokens === 100)
        || `a child thread's work leaked into the root's evidence: ${JSON.stringify({ cmds: r.commandsSucceeded, usage: r.tokenUsage?.total })}`;
    } },
  { scenario: "idle-delegation",  expect: EXIT.SUCCESS, args: ["--idle-timeout", "1", "--timeout", "20"],
    why: "the liveness rule has to hold for the shape 0.153.4 emits: the child is known only from the root's announcement, and every event it then sends under its own threadId (turn/started, its status changes, its usage, its items) rearms the guard",
    assert: (r) => {
      if (r.cut !== null) return `a turn whose announced child was working throughout was cut: ${JSON.stringify(r.cut)}`;
      const t = (r.subagentThreads ?? [])[0];
      if (t?.threadId !== "thr_child" || t.agentPath !== "/root/counter")
        return `the announced child was not registered: ${JSON.stringify(r.subagentThreads)}`;
      // The child ran twelve; the root ran one, and that one is the whole of this run's evidence.
      return (t.commands === 12 && r.commandsSucceeded === 1)
        || `the child's work and the root's were confused: ${JSON.stringify({ child: t, root: r.commandsSucceeded })}`;
    } },
  { scenario: "delegation",       expect: EXIT.COMMANDS,
    why: "on 0.153.4 a child thread never sends thread/started, so the root's subAgentActivity item is the registration: it names the child, its agentPath and, on the second announcement, that it completed; and the item arrives twice without registering the child twice",
    assert: (r) => {
      const s = r.subagentThreads ?? [];
      if (s.length !== 1) return `the announced child was not registered exactly once: ${JSON.stringify(s)}`;
      const t = s[0];
      return (t.threadId === "thr_child" && t.agentPath === "/root/count_readme" && t.status === "completed"
          && t.items === 2 && t.commands === 1 && r.commandsSucceeded === 0)
        || `the child's registration is wrong: ${JSON.stringify({ child: t, root: r.commandsSucceeded })}`;
    } },
  { scenario: "delegation",       expect: EXIT.COMMANDS,
    why: "the evidence rule is unchanged by a child's work: the root ran nothing, so this is exit 5. But the cause has to say the children ran, or 'no command ran' reads as a dead turn beside an answer that is plainly the product of work",
    assert: (r) => {
      const h = String(r.hint ?? "");
      return (/^no command ran on the root thread; 1 subagent thread\(s\) ran /.test(h)
          && h.includes("/root/count_readme") && /1 commands/.test(h) && h.endsWith("liveness, not evidence"))
        || `the exit-5 cause does not name the children: ${JSON.stringify(r.hint)}`;
    } },
  { scenario: "idle-silence",     expect: EXIT.TIMEOUT, args: ["--idle-timeout", "0", "--timeout", "2"],
    why: "0 disables it, and a disabled guard must be OFF rather than instant: the same silent turn then runs to the wall clock and is cut with cut.kind wall",
    assert: (r) => r.cut?.kind === "wall"
      || `--idle-timeout 0 did not disable the idle guard: ${JSON.stringify(r.cut)}` },
  { scenario: "no-thread",        expect: EXIT.TIMEOUT, args: ["--timeout", "2"],
    why: "the pre-thread rung fires at T, not a grace early: with no thread there is nothing to interrupt, so the grace buys nothing and spending it would shorten the caller's own budget",
    assertStderr: (e, ms) => {
      if (!/timed out after 2s/.test(e)) return `the pre-thread timeout did not announce itself: ${e.slice(0, 200)}`;
      return ms >= 1800 || `the pre-thread abort fired after ${ms}ms of a 2000ms budget — a grace early`;
    } },

  // --- the default: no wall clock at all, the way a native subagent runs ---
  { scenario: "slow-turn",        expect: EXIT.SUCCESS, noTimeout: true,
    why: "the default arms no wall-clock rung: a turn that takes its time finishes and reports cut: null",
    assert: (r, ms) => (r.cut === null && r.turnStatus === "completed" && ms > 1200)
      || `the default run was bounded by something: ${JSON.stringify({ cut: r.cut, turnStatus: r.turnStatus, ms })}` },
  { scenario: "echo-instructions", expect: EXIT.SUCCESS, noTimeout: true,
    why: "the model has no clock, so what it is TOLD is the whole of what it can plan against: told 'about N seconds' when nothing is counting, it rushes work it had time for",
    assert: (r) => {
      const a = String(r.answer);
      if (/seconds of wall clock/.test(a)) return `the default run still promised the agent a wall clock: ${a.slice(0, 160)}`;
      return /There is no wall-clock limit on this turn; it is cut only after 900 seconds of silence or by the coordinator\./.test(a)
        || `the no-wall-clock sentence is not the one the agent was given: ${a.slice(0, 200)}`;
    } },
  { scenario: "idle-silence",     expect: EXIT.TIMEOUT, noTimeout: true, args: ["--idle-timeout", "1"],
    why: "with no wall clock the silence guard is what ends a hung agent, and it must end it on its own budget rather than waiting for a clock that was never set",
    assert: (r, ms) => (r.cut?.kind === "idle" && r.cut.limit === 1 && ms < 20000)
      || `the silent turn was not cut on the idle budget alone: ${JSON.stringify({ cut: r.cut, ms })}` },
  { scenario: "stalled-turn",     expect: EXIT.TIMEOUT, noTimeout: true, args: ["--timeout", "1"],
    why: "opting IN still buys the three rungs: an explicit budget cuts the turn at its own deadline and names itself in cut.kind",
    assert: (r) => (r.cut?.kind === "wall" && r.cut.limit === 1 && r.turnStatus === "timedOut")
      || `an explicit --timeout stopped cutting: ${JSON.stringify({ cut: r.cut, t: r.turnStatus })}` },

  // --- the volume cap: the bound neither silence nor tokens can express ---
  { scenario: "many-commands",    expect: EXIT.TIMEOUT, noTimeout: true, args: ["--max-commands", "2"],
    why: "a turn that loops is neither silent nor expensive — each iteration rearms the idle guard and costs one call — so with no wall clock only a count ends it. This is the maxTurns a native subagent has",
    assert: (r) => {
      if (r.cut?.kind !== "commands") return `the loop was not cut on the command budget: ${JSON.stringify(r.cut)}`;
      if (r.cut.limit !== 2 || r.cut.observed !== 2) return `the commands cut misreported its own budget: ${JSON.stringify(r.cut)}`;
      if (r.turnStatus !== "maxCommands") return `the cut turn's status was ${JSON.stringify(r.turnStatus)}`;
      // The third command never ran: the cut goes out as the second completes.
      if (r.commandsSucceeded !== 2) return `the cap let ${r.commandsSucceeded} commands through, not 2`;
      return /split the task or raise --max-commands/.test(String(r.hint))
        || `exit 3 on a command cut did not name the budget that ran out: ${JSON.stringify(r.hint)}`;
    } },
  { scenario: "many-commands",    expect: EXIT.SUCCESS, noTimeout: true, args: ["--max-commands", "0"],
    why: "0 disables it, like --idle-timeout's 0: the same six-command turn then runs to its own end",
    assert: (r) => (r.cut === null && r.commandsSucceeded === 6)
      || `--max-commands 0 did not disable the cap: ${JSON.stringify({ cut: r.cut, cmds: r.commandsSucceeded })}` },
  { scenario: "many-commands",    expect: EXIT.SUCCESS, noTimeout: true,
    why: "the default command cap is a safety net that this short command sequence must not reach",
    assert: (r) => (r.cut === null && r.commandsSucceeded === 6)
      || `the default command cap bit an ordinary turn: ${JSON.stringify({ cut: r.cut, cmds: r.commandsSucceeded })}` },
  { scenario: "many-commands",    expect: EXIT.TIMEOUT, noTimeout: true,
    agent: "RIGHTS: read <CWD>\n", args: ["--max-commands", "2"],
    why: "the cap still reaches a PROMPT-FILE run — the flag is appended after the file's own argv, which is the route a coordinator bounding an agent it did not author has to take",
    assert: (r) => ((r.promptFileFields ?? []).join(",") === "RIGHTS" && r.cut?.kind === "commands" && r.cut.limit === 2)
      || `the flag did not bound a prompt-file run: ${JSON.stringify({ fields: r.promptFileFields, cut: r.cut })}` },

  // --- one file, both halves: the header is the leading FIELD: lines and the rest is the prompt ---
  { scenario: "echo-input", expect: EXIT.SUCCESS, noPrompt: true,
    agent: "RIGHTS: read <CWD>\nEXPECT: echo\nTASK: count the files\nand say how many\n",
    why: "the caller writes one file; the driver preserves everything from the first non-header line as the body, including its label",
    assert: (r) => {
      const answer = String(r.answer);
      if (!/TASK: count the files\\nand say how many/.test(answer)) return `the body did not reach the turn verbatim: ${answer.slice(0, 200)}`;
      return (r.promptFileFields ?? []).join(",") === "RIGHTS,EXPECT"
        || `a body line was read as a header field: ${JSON.stringify(r.promptFileFields)}` } },
  { scenario: "echo-input", expect: EXIT.SUCCESS, noPrompt: true,
    agent: "RIGHTS: read <CWD>\nEXPECT: echo\nTASK: do it\nNETWORK: no\nMODEL: gpt-5\n",
    why: "below the body's first line nothing is a header however field-like it looks — otherwise a task that quotes a header, or a copied value carrying a newline, silently re-declares the agent's rights. The line is a NEGATIVE because an ignored positive lands on the default and proves nothing",
    assert: (r) => (r.network === true && r.model !== "gpt-5" && (r.promptFileFields ?? []).join(",") === "RIGHTS,EXPECT")
      || `a line below TASK: was read as a field: ${JSON.stringify({ net: r.network, model: r.model, fields: r.promptFileFields })}` },
  { scenario: "resume-active", expect: EXIT.BUSY, noPrompt: true,
    agent: "RIGHTS: read <CWD>\nRESUME: thr_root\nTASK: continue the thread\n",
    why: "a resumed thread whose turn is still open is exit 10 with no report at all, like a held write lock: the caller reads the reason on stderr, and a coordinator that treated 10 as 'still starting' would wait on a run that already refused",
    assertStderr: (e) => /still has a turn running/.test(e)
      || `the refusal does not say the thread is busy: ${e.slice(0, 200)}`,
    assertText: (out) => out.trim() === "" || `a pre-turn refusal printed ${out.length} bytes on stdout` },

  // --- approval requests with no mailbox: declined at once, every one recorded whole ---
  { scenario: "approval-wait",    expect: EXIT.APPROVAL,
    why: "without --approval-dir nothing can answer, so the request is declined at once as before; the entry now says so in its own fields, and its detail is the command whole — a clipped one is a command nobody can judge",
    assert: (r) => {
      const e = entry0(r);
      if (e.offered !== false || e.id !== null || e.decision !== "declined" || e.by !== "driver" || e.why !== "no channel")
        return `the refusal is not recorded as one nobody offered: ${JSON.stringify(e)}`;
      if (!/\n/.test(e.detail) || e.detail.length <= 200) return `the detail is not the whole command: ${JSON.stringify(e.detail)}`;
      if (e.kind !== "command" || e.cause !== "asked" || !(Number.isInteger(e.waitMs) && e.waitMs >= 0) || typeof e.askedAt !== "string") return `the entry's fields are wrong: ${JSON.stringify(e)}`;
      return (r.approvalDir === null && r.approvalsAccepted === 0 && e.resolved === true && e.outcome?.status === "declined")
        || `the counts, the receipt or the outcome are wrong: ${JSON.stringify({ dir: r.approvalDir, acc: r.approvalsAccepted, resolved: e.resolved, outcome: e.outcome })}`;
    } },
  { scenario: "approval-wait-error", expect: EXIT.APPROVAL, env: { FAKE_RPC_LOG: approvalErrorLog },
    why: "the refusal is a decision, never a JSON-RPC error: the server honours an error too, but the model then reads a broken tool and the item completes failed, which the report counts as a failed command (P1 Q3 error)",
    assert: () => {
      const log = fs.existsSync(approvalErrorLog) ? fs.readFileSync(approvalErrorLog, "utf8") : "";
      return (/^answer:9401:decline$/m.test(log) && !/^answer:\d+:error/m.test(log)) || `the refusal did not go out as a decline: ${JSON.stringify(log.split("\n").filter((l) => l.startsWith("answer:")))}`;
    } },
  { scenario: "escalated-subagent", expect: EXIT.APPROVAL,
    why: "a thread the root never announced is nobody this run can answer for: declined at once, whether or not a mailbox is armed",
    assert: (r) => (entry0(r).why === "unknown thread" && entry0(r).subagent === true && entry0(r).offered === false)
      || `an unannounced thread's request was not refused as one: ${JSON.stringify(entry0(r))}` },
  { scenario: "approval-after-failed-attempt", expect: EXIT.APPROVAL,
    why: "a request right after the same command failed inside the sandbox has the cause a request with no attempt before it has (approval-wait): an attempt the sandbox stopped can leave no trace (P1), so any split between the two would be a guess, and nothing on the plugin's side changes either",
    assert: (r) => entry0(r).cause === "asked" || `cause is ${JSON.stringify(entry0(r).cause)}, not asked` },
  { scenario: "approval-writestdin", expect: EXIT.APPROVAL,
    why: "input to a terminal already running cannot be read as a command, so it is never offered; the kind is checked before the mailbox is",
    assert: (r) => (entry0(r).why === "kind writeStdin" && entry0(r).kind === "writeStdin")
      || `a writeStdin request was not refused by its kind: ${JSON.stringify(entry0(r))}` },
  { scenario: "approval-then-transient", expect: EXIT.APPROVAL,
    why: "the control for the retry guard: a request declined at once did nothing, so the transient failure after it is retried as before, and the declined entry still reads 6",
    assert: (r) => r.transientRetries?.length === 1 || `the declined request suppressed the retry: ${JSON.stringify(r.transientRetries)}` },
  { scenario: "filechange-child", expect: EXIT.APPROVAL,
    why: "a subagent the root announced asking for a file change is declined at once as the root's would be: the server asks only for a write its sandbox does not cover, and the entry stays the child's",
    assert: (r) => {
      const e = entry0(r);
      return (e.decision === "declined" && e.by === "driver" && e.subagent === true && e.agentPath === "/root/writer"
          && e.cause === "outside" && !("approvalsAutoAccepted" in r) && (r.filesTouched ?? []).length === 0)
        || `the child's file change was not declined at once: ${JSON.stringify({ e, touched: r.filesTouched })}`;
    } },
  { scenario: "filechange-no-started", expect: EXIT.APPROVAL,
    why: "a file change whose item/started never came names no path, and the driver does not guess one: not shown inside the roots, so never answered yes",
    assert: (r) => (entry0(r).fileChanges === null && entry0(r).cause === "outside" && entry0(r).decision === "declined")
      || `a pathless file change was treated as covered: ${JSON.stringify(entry0(r))}` },
  { scenario: "approval-duplicate", expect: EXIT.APPROVAL, env: { FAKE_RPC_LOG: duplicateLog },
    why: "one request id is one request: a copy the server sends again must not become a second entry or draw a second response to an id the server matches once",
    assert: (r) => {
      const log = answers(duplicateLog).filter((l) => l.startsWith("answer:9430:"));
      return (r.escalations?.length === 1 && log.length === 1)
        || `the duplicate was not one request: ${JSON.stringify({ entries: r.escalations?.length, answers: log })}`;
    } },
  { scenario: "filechange-at",    expect: EXIT.APPROVAL,
    env: { FAKE_FILECHANGE_PATH: "<TMPDIR>/rename-out.md", FAKE_FILECHANGE_MOVE: `/etc/entrust-rename-${process.pid}.md` },
    why: "a rename the server asks about is declined with both of its paths in the entry, so the coordinator reads where it would have moved the file",
    assert: (r) => (entry0(r).cause === "outside" && entry0(r).decision === "declined" && / -> \/etc\/entrust-rename-/.test(entry0(r).detail))
      || `a rename out of the roots was treated as covered: ${JSON.stringify(entry0(r))}` },
  { scenario: "filechange-child-late", expect: EXIT.APPROVAL,
    why: "a subagent's request that arrives after its own turn completed answers to nobody, whatever its paths: a request is answered only inside the turn that asked, a child's as the root's",
    assert: (r) => (entry0(r).why === "turn ended" && entry0(r).decision === "declined" && entry0(r).subagent === true)
      || `a request for a finished child turn was answered: ${JSON.stringify(entry0(r))}` },
  { scenario: "happy",            expect: EXIT.SUCCESS, env: { FAKE_RPC_LOG: initializeLog },
    why: "initialize asks for no experimental API: the driver reads no experimental field, and the report carries none of the fields the permission features once needed",
    assert: (r) => (logLines(initializeLog).includes("initialize:experimentalApi=false")
        && ["experimentalApi", "featuresRequested", "serverWarnings", "sandboxWidened"].every((k) => !(k in r))
        && !logLines(initializeLog).some((l) => /^cfg:features\./.test(l)))
      || `initialize or the report still carries the widening: ${JSON.stringify({ sent: logLines(initializeLog).filter((l) => /^(initialize|cfg:features)/.test(l)), keys: Object.keys(r).filter((k) => /experimental|feature|Warning|Widened/.test(k)) })}` },
  { scenario: "filechange-at",    expect: EXIT.APPROVAL, args: ["--level", "write"],
    env: { FAKE_FILECHANGE_PATH: path.join(shimDir, "notes.md") },
    why: "at write level too, a file change the server asks about is declined at once: the driver grants nothing itself",
    assert: (r) => (entry0(r).decision === "declined" && entry0(r).by === "driver" && entry0(r).cause === "outside")
      || `a file change at write level was not declined at once: ${JSON.stringify(entry0(r))}` },
];

assertKnownScenarios(CASES);

// --- flows: what one run of the driver cannot express ---
//
// A record written by one run and read by the next, a report delivered to a file, a signal mid-turn:
// each step's state is the next step's input, so these are procedural rather than table cases.
// Each gets a state directory of its own: every fixture run reports the SAME thread id, so a shared
// registry would let one flow read another's record.
const { cases: FLOWS, test: flow } = registry();

flow("resuming a thread whose own driver is still alive is exit 10, decided locally",
  "the server would refuse it too, but only after a worktree was cut, a lock taken and a session started — and 'still running' is knowable from the registry before any of that",
  async () => {
    const state = flowState();
    const jobs = path.join(state, "jobs");
    fs.mkdirSync(jobs, { recursive: true });
    fs.writeFileSync(path.join(jobs, "thr_root.json"), JSON.stringify({
      threadId: "thr_root", pid: process.pid, cwd: shimDir, level: "read",
      started: new Date().toISOString(), timeout: 900, detached: true, runId: "r9" }));
    const marker = path.join(state, "codex-ran");
    const probeShim = path.join(state, "shim");
    fs.mkdirSync(probeShim, { recursive: true });
    fs.writeFileSync(path.join(probeShim, "codex"), `#!/bin/sh\necho ran >> "${marker}"\nexec "${process.execPath}" "${FAKE}" "$@"\n`, { mode: 0o755 });
    for (const args of [["--resume", "thr_root"], ["--resume", "last"]]) {
      const { code, err } = await run({ scenario: "happy", args,
        env: { ENTRUST_STATE_DIR: state, PATH: `${probeShim}:${process.env.PATH}` } });
      if (code !== EXIT.BUSY) return `${args.join(" ")} exited ${code}, expected 10: ${err.slice(0, 200)}`;
      if (!/is still running \(pid \d+\)/.test(err)) return `the refusal did not name the live run: ${err.slice(0, 200)}`;
      if (fs.existsSync(marker)) return `${args.join(" ")} spawned a codex before refusing`;
    }
    return true;
  });

flow("endedAt is written only once the report has actually landed",
  "endedAt is the flag every collector reads to decide the report is there: written before the bytes, a --wait racing a large report delivers a truncated one, and a report that never reached its caller is recorded as the success it was not",
  async () => {
    const state = flowState();
    // stdout is closed before the report is written, so the write FAILS: the record must carry the
    // transport failure, which is only possible if it is written after the write rather than before.
    const { code } = await run({ scenario: "long-answer", closeStdout: true,
      env: { ENTRUST_STATE_DIR: state } });
    if (code !== EXIT.TRANSPORT) return `a report that could not be written exited ${code}, expected 4`;
    const rec = await until(() => { const r = recordOf(state); return r?.endedAt ? r : null; });
    if (!rec) return "no record was closed at all";
    if (rec.exitCode !== EXIT.TRANSPORT)
      return `the record says exit ${rec.exitCode} for a report that never reached its caller`;
    return true;
  });

flow("the job record is private resume metadata, and a record from an older release loses the rest of it",
  "the record is not a second report: with a run's gates, progress and transport in it, whoever found the record first read a second, staler answer about the same agent — and a record written by a release that kept them has to lose them rather than outlive the interfaces that filled it",
  async () => {
    const state = flowState();
    const jobs = path.join(state, "jobs");
    fs.mkdirSync(jobs, { recursive: true });
    // A record in the shape an earlier release wrote, for a thread this run is about to continue.
    fs.writeFileSync(path.join(jobs, "thr_root.json"), JSON.stringify({
      threadId: "thr_root", cwd: shimDir, level: "read", pid: 2147483646, timeout: 900,
      started: new Date(Date.now() - 60000).toISOString(), endedAt: new Date(Date.now() - 30000).toISOString(),
      exitCode: 0, detached: true, runId: "r9", runDir: "/tmp/gone", reportPath: "/tmp/gone/report.json",
      stderrPath: "/tmp/gone/stderr.txt", promptPath: "/tmp/gone/prompt.txt", worktreeName: "wt-1",
      lastEventAt: "2026-01-01T00:00:00.000Z", tokensSpent: 1, commandsSeen: 1, phase: "agentMessage",
      receiptOk: true, commandsSucceeded: 1, commandsFailed: 0, verify: null, verifySkipped: null, cut: null }));
    // A slow scenario, so the record can be read WHILE the resumed turn runs: every closing field in it
    // belongs to the run that ended, and `endedAt` left in place says this thread is finished while its
    // new turn is going — which is exactly what the resume guard returns on.
    const pending = run({ scenario: "slow-turn", args: ["--resume", "last", "--timeout", "30"],
      env: { ENTRUST_STATE_DIR: state } });
    const live = await until(() => {
      const r = recordOf(state);
      return r && r.pid !== 2147483646 && !r.endedAt ? r : null;
    });
    const { code, out, err } = await pending;
    if (code !== EXIT.SUCCESS) return `the resumed run exited ${code}: ${err.trim().slice(-200)}`;
    if (!live) return "the resumed run kept the earlier run's endedAt while its own turn was going";
    if (live.turnStatus !== undefined || live.exitCode !== undefined)
      return `the resumed run kept the earlier run's verdict while its own turn was going: ${JSON.stringify({ t: live.turnStatus, e: live.exitCode })}`;
    const rec = await until(() => { const r = recordOf(state); return r?.endedAt ? r : null; });
    if (!rec) return "the run wrote no job record";
    const allowed = ["threadId", "pid", "identity", "cwd", "started", "repo", "baseSha",
                     "endedAt", "exitCode", "turnStatus", "answerPath",
                     "worktreeDiffPath", "worktreeUntrackedPath", "worktreeCommitsRef"];
    const extra = Object.keys(rec).filter((k) => !allowed.includes(k));
    if (extra.length) return `the record carries what only the report should: ${extra.join(", ")}`;
    for (const k of ["threadId", "pid", "identity", "cwd", "started", "endedAt", "exitCode", "turnStatus", "answerPath"])
      if (rec[k] === undefined) return `the record has no ${k}: ${JSON.stringify(Object.keys(rec))}`;
    if (rec.exitCode !== EXIT.SUCCESS || rec.turnStatus !== "completed")
      return `the record does not close on the run's own verdict: ${JSON.stringify({ e: rec.exitCode, t: rec.turnStatus })}`;
    // And the run it closed on is the one that just ran, not the record it inherited.
    return JSON.parse(out).threadId === rec.threadId
      || `the record closed on another run: ${JSON.stringify({ record: rec.threadId })}`;
  });

flow("the report's tokenUsage is the root thread's total, and no record carries a second copy of it",
  "the run must compute the root token total the report states; a later subagent usage event exposes a missing thread filter, and the number belongs to the report the caller reads rather than to a record that would then have to be kept in step with it",
  async () => {
    const state = flowState();
    const { code, out, err } = await run({ scenario: "happy", env: { ENTRUST_STATE_DIR: state } });
    if (code !== EXIT.SUCCESS) return `the run exited ${code}: ${err.trim().slice(-200)}`;
    const report = JSON.parse(out);
    if (report.tokenUsage?.total?.totalTokens !== 135)
      return `the report's root-thread total is ${JSON.stringify(report.tokenUsage?.total?.totalTokens)}; the fixture's is 135`;
    const rec = await until(() => { const r = recordOf(state); return r?.endedAt ? r : null; });
    if (!rec) return "the run wrote no job record";
    return rec.tokensSpent === undefined || `the record carries tokensSpent ${JSON.stringify(rec.tokensSpent)} beside the report's own`;
  });

// --- the approval channel: a mailbox inside the state root, as --new makes one for every agent ---

const requestsIn = (box) => {
  let names = [];
  try { names = fs.readdirSync(box); } catch { return []; }
  return names.filter((n) => n.endsWith(".request.json")).map((n) => readJson(path.join(box, n))).filter(Boolean)
    .sort((a, b) => Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10));
};
const openIn = (box) => requestsIn(box).filter((q) => !q.settled);
// The nth request the driver offers, once it is on disk and still open.
const offered = async (box, n = 1) => (await until(() => { const o = openIn(box); return o.length >= n ? o : null; }))?.[n - 1] ?? null;
function armed(scenario, { args = [], env = {}, onSpawn } = {}) {
  const state = flowState();
  const box = path.join(state, "run", "agent", "approvals");
  fs.mkdirSync(box, { recursive: true, mode: 0o700 });
  const log = path.join(state, "rpc.log");
  const done = run({ scenario, args: ["--approval-dir", box, ...args], onSpawn,
    env: { ENTRUST_STATE_DIR: state, FAKE_RPC_LOG: log, ...env } });
  return { state, box, log, done };
}
// A decision as --decide writes one: the run's identity copied out of the request, published whole.
// `identity` overrides part of that identity, which is how a stale one is made.
function decide(box, q, decision, { why = "the plan covers it", identity = {} } = {}) {
  const p = path.join(box, `${q.id}.decision.json`);
  const tmp = `${p}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify({ id: q.id,
    run: { pid: q.run.pid, startedAtMs: q.run.startedAtMs, turnId: q.run.turnId, ...identity },
    decision, by: "coordinator", why, decidedAt: new Date().toISOString() }), { mode: 0o600 });
  fs.renameSync(tmp, p);
}
const answers = (log) => (fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "").split("\n").filter(Boolean);
const parsed = (out) => { try { return JSON.parse(out); } catch { return null; } };

flow("a request waits for the caller under the thirty-minute deadline: still open after 3 s, listed in pending, and a SIGTERM settles it before the interrupt",
  "a request waits for the caller, and the only clock on it is the thirty-minute constant, which the request file states; the signal path is how an abandoned run ends, and it has to answer the server before it interrupts the turn",
  async () => {
    let child = null;
    const a = armed("approval-wait", { onSpawn: (p) => { child = p; } });
    const q = await offered(a.box);
    if (!q) return `no request was offered: ${(await a.done).err.slice(-300)}`;
    await wait(3000);
    const problems = [];
    if (openIn(a.box).length !== 1) problems.push(`the request did not stay open for 3 s: ${openIn(a.box).length} open`);
    const pending = fs.existsSync(path.join(a.box, "pending")) ? fs.readFileSync(path.join(a.box, "pending"), "utf8") : "";
    if (pending !== `${q.id}\n`) problems.push(`pending is ${JSON.stringify(pending)}, not the open id`);
    child.kill("SIGTERM");
    const { code, out, err } = await a.done;
    const r = parsed(out);
    if (code !== EXIT.MODEL) problems.push(`exit ${code}, not 1`);
    if (!r) return [...problems, "no report"].join("; ");
    const e = entry0(r);
    if (e.id !== q.id || e.offered !== true || e.decision !== "expired" || e.by !== "driver" || e.why !== "signal SIGTERM")
      problems.push(`the entry does not say the signal settled it: ${JSON.stringify(e)}`);
    const log = answers(a.log);
    const [said, cut] = [log.indexOf("answer:9401:decline"), log.indexOf("turn/interrupt")];
    if (said < 0 || cut < 0 || said > cut) problems.push(`the decline did not go out before the interrupt: ${JSON.stringify(log)}`);
    if (fs.existsSync(path.join(a.box, "pending"))) problems.push("pending outlived the last open request");
    const after = readJson(path.join(a.box, `${q.id}.request.json`));
    if (after?.settled?.decision !== "expired" || after.settled.why !== "signal SIGTERM" || after.settled.decisionFile !== "none")
      problems.push(`the request file was not settled: ${JSON.stringify(after?.settled)}`);
    // The request file is what the caller reads: the command whole, the run's identity, the agent's footing.
    if (!/\n/.test(q.command) || q.command.length <= 200) problems.push(`the request file clipped the command: ${JSON.stringify(q.command)}`);
    if (typeof q.run?.pid !== "number" || typeof q.run?.startedAtMs !== "number" || q.run?.turnId !== "turn_root" || q.run?.threadId !== "thr_root")
      problems.push(`the run identity is incomplete: ${JSON.stringify(q.run)}`);
    if (q.level !== "read" || Date.parse(q.deadlineAt) - Date.parse(q.askedAt) !== 1800000 || !Array.isArray(q.roots) || !q.roots.length || !q.sandbox || typeof q.askedAt !== "string"
        || !Array.isArray(q.availableDecisions) || q.cause !== "asked")
      problems.push(`the request file lacks the agent's footing: ${JSON.stringify({ level: q.level, deadline: q.deadlineAt, roots: q.roots, cause: q.cause })}`);
    if (!err.includes(`approval request ${q.id}`) || !err.includes(`until ${q.deadlineAt}`)) problems.push("stderr did not name the request and its open wait");
    return problems.length === 0 || problems.join("; ");
  });

flow("an accepted request runs, and the entry says who accepted it, that the server received it and what the command did",
  "decision, receipt and outcome are three facts: the caller decided, the server acknowledged, and the item's own completion said what ran — a retelling reads the outcome, never the decision alone",
  async () => {
    const a = armed("approval-wait");
    const q = await offered(a.box);
    if (!q) return "no request was offered";
    decide(a.box, q, "accept");
    const { code, out } = await a.done;
    const r = parsed(out);
    if (code !== EXIT.SUCCESS || !r) return `exit ${code}: ${out.slice(0, 200)}`;
    const e = entry0(r);
    const problems = [];
    if (e.decision !== "accepted" || e.by !== "coordinator" || e.why !== "the plan covers it" || typeof e.waitMs !== "number")
      problems.push(`the decision is not the caller's: ${JSON.stringify(e)}`);
    if (e.resolved !== true) problems.push("the server's receipt was not recorded");
    if (JSON.stringify(e.outcome) !== JSON.stringify({ status: "completed", exitCode: 0, durationMs: 1 })) problems.push(`the outcome is ${JSON.stringify(e.outcome)}`);
    if (r.approvalsAccepted !== 1 || "approvalsAutoAccepted" in r || r.approvalDir !== fs.realpathSync(a.box))
      problems.push(`the counts are wrong: ${JSON.stringify({ acc: r.approvalsAccepted, auto: r.approvalsAutoAccepted, dir: r.approvalDir })}`);
    const settledAs = readJson(path.join(a.box, `${q.id}.request.json`))?.settled;
    if (settledAs?.by !== "coordinator" || settledAs.decisionFile !== "taken") problems.push(`the request file was not settled as the caller's: ${JSON.stringify(settledAs)}`);
    if (!answers(a.log).includes("answer:9401:accept")) problems.push("accept never reached the server");
    return problems.length === 0 || problems.join("; ");
  });

flow("an accepted request whose item never completes has outcome null",
  "the server acknowledging an accept is not the command having run: with no completion the honest record of what ran is none",
  async () => {
    const a = armed("approval-wait-no-outcome");
    const q = await offered(a.box);
    if (!q) return "no request was offered";
    decide(a.box, q, "accept");
    const { code, out } = await a.done;
    const e = entry0(parsed(out) ?? {});
    return (code === EXIT.SUCCESS && e.decision === "accepted" && e.resolved === true && e.outcome === null)
      || `exit ${code}, entry ${JSON.stringify(e)}`;
  });

flow("a request the caller declines is exit 6, declined by the caller, with the reason it gave",
  "a declined request is the same evidence whoever declined it; what the entry adds is who, and why",
  async () => {
    const a = armed("approval-wait");
    const q = await offered(a.box);
    if (!q) return "no request was offered";
    decide(a.box, q, "decline", { why: "outside the plan" });
    const { code, out } = await a.done;
    const e = entry0(parsed(out) ?? {});
    return (code === EXIT.APPROVAL && e.decision === "declined" && e.by === "coordinator" && e.why === "outside the plan")
      || `exit ${code}, entry ${JSON.stringify(e)}`;
  });

flow("the deadline expires an unanswered request as declined, and the turn goes on",
  "a run nobody attends must still report: at the deadline the request is declined as expired, the turn goes on, and the deadline is in the request file for the reader; the seam makes the thirty minutes one second here",
  async () => {
    const a = armed("approval-wait", { env: { ENTRUST_APPROVAL_TIMEOUT_S: "1" } });
    const q = await offered(a.box);
    if (!q) return "no request was offered";
    const { code, out } = await a.done;
    const e = entry0(parsed(out) ?? {});
    if (typeof q.deadlineAt !== "string") return `the request file carries no deadline: ${JSON.stringify(q.deadlineAt)}`;
    return (code === EXIT.APPROVAL && e.decision === "expired" && e.why === "deadline" && answers(a.log).includes("answer:9401:decline"))
      || `exit ${code}, entry ${JSON.stringify(e)}, log ${JSON.stringify(answers(a.log))}`;
  });

flow("a decision on disk when the deadline fires is the caller's, not an expiry",
  "the file can land between the last poll and the deadline's tick; the deadline reads it first, or a decision published in time is thrown away as late",
  async () => {
    const a = armed("approval-wait", { env: { ENTRUST_APPROVAL_TIMEOUT_S: "2", ENTRUST_APPROVAL_POLL_MS: "60000" } });
    const q = await offered(a.box);
    if (!q) return "no request was offered";
    decide(a.box, q, "accept");
    const { code, out } = await a.done;
    const e = entry0(parsed(out) ?? {});
    return (code === EXIT.SUCCESS && e.decision === "accepted" && e.by === "coordinator" && e.waitMs >= 1500)
      || `exit ${code}, entry ${JSON.stringify(e)}`;
  });

flow("a decision for another run or another turn is stale: counted once each, left in place, and the request keeps waiting",
  "the mailbox is a directory any process of the user's can write; a decision the driver takes has to name this run's pid, start and turn, and one that does not is someone else's",
  async () => {
    const a = armed("approval-wait");
    const q = await offered(a.box);
    if (!q) return "no request was offered";
    const file = path.join(a.box, `${q.id}.decision.json`);
    decide(a.box, q, "accept", { identity: { startedAtMs: q.run.startedAtMs + 1 } });
    const first = fs.readFileSync(file, "utf8");
    await wait(700);
    const problems = [];
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== first) problems.push("a stale decision was not left in place");
    if (openIn(a.box).length !== 1) problems.push("a stale decision settled the request");
    decide(a.box, q, "accept", { identity: { turnId: "turn_other" } });
    await wait(700);
    decide(a.box, q, "accept");
    const { code, out } = await a.done;
    const r = parsed(out) ?? {};
    if (code !== EXIT.SUCCESS || entry0(r).decision !== "accepted") problems.push(`the valid decision did not settle it: exit ${code}, ${JSON.stringify(entry0(r))}`);
    return problems.length === 0 || problems.join("; ");
  });

flow("a request open when the root turn ends is settled then, a decision for it afterwards is late, and the next turn's request is offered under its own turn",
  "a corrective turn follows on the same thread, so 'a turn this run owns' is not 'the turn now running': the old request is answered before the new turn starts, and whatever arrives for it later belongs to a turn that is over",
  async () => {
    const a = armed("approval-turn-end", { args: ["--output-schema", schemaFile] });
    const q1 = await offered(a.box);
    if (!q1) return "no request was offered in the first turn";
    const settled = await until(() => readJson(path.join(a.box, `${q1.id}.request.json`))?.settled ?? null);
    if (!settled) return "the first request was never settled";
    decide(a.box, q1, "accept");
    const q2 = await until(() => openIn(a.box).find((q) => q.id !== q1.id) ?? null);
    if (!q2) return "the corrective turn's request was never offered";
    decide(a.box, q2, "accept");
    const { code, out } = await a.done;
    const r = parsed(out) ?? {};
    const [e1, e2] = r.escalations ?? [];
    const problems = [];
    if (code !== EXIT.APPROVAL) problems.push(`exit ${code}, not 6 for the first turn's expired request`);
    if (e1?.decision !== "expired" || e1?.why !== "turn ended" || settled.why !== "turn ended") problems.push(`the first request: ${JSON.stringify(e1)}`);
    if (e2?.decision !== "accepted" || q2.run.turnId !== "turn_root_retry" || q1.run.turnId !== "turn_root")
      problems.push(`the second request: ${JSON.stringify({ e2, turns: [q1.run.turnId, q2.run.turnId] })}`);
    if (answers(a.log).filter((l) => l.startsWith("answer:9408:")).length !== 1) problems.push(`the first request was answered other than once: ${JSON.stringify(answers(a.log))}`);
    return problems.length === 0 || problems.join("; ");
  });

flow("a request open at the wall-clock cut is settled before the interrupt",
  "the server reads its stdin in order, so the decline sent first is what it acts on; an interrupt with a request still owed leaves the server waiting on an answer nobody will send",
  async () => {
    const a = armed("approval-wait", { args: ["--timeout", "3"] });
    const { code, out } = await a.done;
    const r = parsed(out) ?? {};
    const log = answers(a.log);
    const [said, cut] = [log.indexOf("answer:9401:decline"), log.indexOf("turn/interrupt")];
    return (code === EXIT.TIMEOUT && r.cut?.kind === "wall" && entry0(r).why === "cut wall" && said >= 0 && cut > said)
      || `exit ${code}, cut ${JSON.stringify(r.cut)}, entry ${JSON.stringify(entry0(r))}, log ${JSON.stringify(log)}`;
  });

flow("the idle guard is paused while a request is open and re-armed when it settles",
  "a waiting request is the caller's time, not the thread's silence: a 1 s idle budget must not cut a 3 s wait, and must cut a server that goes silent once it is answered",
  async () => {
    const a = armed("approval-wait", { args: ["--idle-timeout", "1"], env: { ENTRUST_APPROVAL_TIMEOUT_S: "3", FAKE_AFTER_ANSWER: "silent" } });
    const { code, out, ms } = await a.done;
    const r = parsed(out) ?? {};
    const e = entry0(r);
    return (code === EXIT.TIMEOUT && r.cut?.kind === "idle" && e.why === "deadline" && e.waitMs >= 2900 && ms > 3500)
      || `exit ${code} after ${ms} ms, cut ${JSON.stringify(r.cut)}, entry ${JSON.stringify(e)}`;
  });

flow("a request open when the server exits without turn/completed is settled by the run's end",
  "a server that aborts with a request pending sends no completion (P1 Q3); the collected report still has to say the request was left unanswered, and why",
  async () => {
    const a = armed("approval-stdin-close");
    const { code, out } = await a.done;
    const r = parsed(out) ?? {};
    return (code === EXIT.TRANSPORT && r.turnStatus === "failed" && entry0(r).decision === "expired" && entry0(r).why === "run ended")
      || `exit ${code}, turnStatus ${r.turnStatus}, entry ${JSON.stringify(entry0(r))}`;
  });

flow("a writeStdin request is not offered even with a mailbox",
  "the kind is decided before the mailbox is consulted: input to a running terminal is never shown to a caller as a command to approve",
  async () => {
    const a = armed("approval-writestdin");
    const { code, out } = await a.done;
    const e = entry0(parsed(out) ?? {});
    return (code === EXIT.APPROVAL && e.offered === false && e.why === "kind writeStdin" && requestsIn(a.box).length === 0)
      || `exit ${code}, entry ${JSON.stringify(e)}, ${requestsIn(a.box).length} request file(s)`;
  });

const OUTSIDE_WHY = "the server asks only for a write its sandbox does not cover; a WRITABLE: line grants a root";

flow("with a mailbox armed, every file change the server asks about is declined at once, never offered, its why naming WRITABLE:, and the run exits 6: inside $TMPDIR spelled either way, outside the roots, with no item/started and through a link",
  "the server asks only for a write its sandbox does not cover (measured on macOS with 0.159.3), so a yes would grant a path mid-run that no settled WRITABLE: line granted; the driver answers it and nobody is asked, and the entry keeps the paths the item named",
  async () => {
    const problems = [];
    // The fixture plants the link in the run's own $TMPDIR, as the agent would, pointing at the shim.
    for (const [scenario, want, env] of [["filechange-in-tmpdir", (fc) => fc?.[0]?.path?.endsWith(".md"), { FAKE_FILECHANGE_SPELLING: "private" }],
                                         ["filechange-in-tmpdir", (fc) => fc?.[0]?.path?.endsWith(".md"), { FAKE_FILECHANGE_SPELLING: "given" }],
                                         ["filechange-outside", (fc) => fc?.[0]?.path?.startsWith("/etc/entrust-fixture-"), {}],
                                         ["filechange-no-started", (fc) => fc === null, {}],
                                         ["filechange-symlink", (fc, r) => Boolean(r.tmpDir) && fc?.[0]?.path === path.join(r.tmpDir, "entrust-link", "x.md"), { FAKE_LINK_TO: shimDir }]]) {
      const a = armed(scenario, { env });
      const { code, out } = await a.done;
      const r = parsed(out) ?? {};
      const e = entry0(r);
      if (code !== EXIT.APPROVAL || e.method !== "item/fileChange/requestApproval" || e.cause !== "outside" || e.offered !== false
          || e.decision !== "declined" || e.by !== "driver" || e.why !== OUTSIDE_WHY || !want(e.fileChanges, r))
        problems.push(`${scenario}: exit ${code}, ${JSON.stringify(e)}`);
      if (requestsIn(a.box).length || fs.existsSync(path.join(a.box, "pending"))) problems.push(`${scenario}: the mailbox was written`);
      if (!answers(a.log).some((l) => /^answer:\d+:decline$/.test(l))) problems.push(`${scenario}: no decline reached the server: ${JSON.stringify(answers(a.log).filter((l) => l.startsWith("answer:")))}`);
    }
    return problems.length === 0 || problems.join("; ");
  });

flow("with a mailbox armed, a permissions request is declined at once with the empty profile, never offered",
  "rights are set at launch: the driver switches on no permission feature, and a server that sends the request anyway is refused and recorded, never put to the caller",
  async () => {
    const a = armed("escalated-permissions");
    const { code, out } = await a.done;
    const e = entry0(parsed(out) ?? {});
    return (code === EXIT.APPROVAL && e.method === "item/permissions/requestApproval" && e.offered === false && e.by === "driver"
        && e.why === "rights are set at launch" && requestsIn(a.box).length === 0
        && answers(a.log).some((l) => /^answer:\d+:\{"permissions":\{"fileSystem":null,"network":null\}\}$/.test(l)))
      || `exit ${code}, ${JSON.stringify({ e, files: requestsIn(a.box).length, said: answers(a.log).filter((l) => l.startsWith("answer:")) })}`;
  });

flow("a subagent's request is offered, and its acceptance is not root evidence",
  "whose request the caller may answer and whose success counts are two questions: the child the root announced may ask, and what it then runs is liveness, never the agent's evidence",
  async () => {
    const a = armed("approval-child-command");
    const q = await offered(a.box);
    if (!q) return "the child's request was not offered";
    const problems = [];
    if (q.run.threadId !== "thr_sub" || q.run.turnId !== "turn_sub" || q.subagent !== true || q.agentPath !== "/root/asker")
      problems.push(`the request is not the child's: ${JSON.stringify({ run: q.run, subagent: q.subagent, path: q.agentPath })}`);
    decide(a.box, q, "accept");
    const { code, out } = await a.done;
    const r = parsed(out) ?? {};
    const e = entry0(r);
    if (code !== EXIT.SUCCESS || e.decision !== "accepted" || e.subagent !== true || e.outcome?.exitCode !== 0) problems.push(`exit ${code}, entry ${JSON.stringify(e)}`);
    if (r.commandsSucceeded !== 1 || r.subagentThreads?.[0]?.commands !== 1)
      problems.push(`the child's command leaked into the root's evidence: ${JSON.stringify({ root: r.commandsSucceeded, child: r.subagentThreads })}`);
    return problems.length === 0 || problems.join("; ");
  });

flow("a subagent's own turn ending settles the requests it left open",
  "a request whose turn is over is owed to nobody: the child's turn/completed settles it under the child's thread, while the root's turn goes on",
  async () => {
    const a = armed("approval-subagent-wait");
    const { code, out } = await a.done;
    const e = entry0(parsed(out) ?? {});
    return (code === EXIT.APPROVAL && e.offered === true && e.decision === "expired" && e.why === "turn ended" && e.thread === "thr_sub")
      || `exit ${code}, entry ${JSON.stringify(e)}`;
  });

flow("a pending marker that cannot be written settles the request at once as expired, declined, and the turn goes on",
  "a request nobody is woken for, with the idle guard paused, is a wait only the thirty-minute deadline ends; the failure is the answer, said in why and on stderr",
  async () => {
    const state = flowState();
    const box = path.join(state, "run", "agent", "approvals");
    fs.mkdirSync(path.join(box, "pending", "in-the-way"), { recursive: true });
    const log = path.join(state, "rpc.log");
    const { code, out, err } = await run({ scenario: "approval-wait", args: ["--approval-dir", box, "--idle-timeout", "5"],
      env: { ENTRUST_STATE_DIR: state, FAKE_RPC_LOG: log } });
    const r = parsed(out) ?? {};
    const e = entry0(r);
    return (code === EXIT.APPROVAL && e.decision === "expired" && /^mailbox write failed: /.test(e.why ?? "") && r.cut === null
        && answers(log).includes("answer:9401:decline") && /mailbox write failed/.test(err))
      || `exit ${code}, ${JSON.stringify({ e, cut: r.cut, log: answers(log) })}, ${err.slice(-200)}`;
  });

flow("an accept whose settlement cannot be written goes out as a decline, and the entry says why",
  "an accept sent with no record behind it is a command run as the user that the status lines, read after a lost report, cannot show: persist first, and when that fails the safe answer is the one that runs nothing",
  async () => {
    const a = armed("approval-wait", { env: { ENTRUST_APPROVAL_POLL_MS: "1500" } });
    const q = await offered(a.box);
    if (!q) return "no request was offered";
    // The request's record cannot be rewritten (a directory in its place, which no user can rename over),
    // and an accept fitting it is published beside it.
    fs.rmSync(path.join(a.box, `${q.id}.request.json`)); fs.mkdirSync(path.join(a.box, `${q.id}.request.json`));
    decide(a.box, q, "accept");
    const res = await a.done;
    const r = parsed(res.out) ?? {};
    const e = entry0(r);
    const said = answers(a.log).filter((l) => l.startsWith("answer:9401:"));
    return (res.code === EXIT.APPROVAL && e.decision === "expired" && /^mailbox write failed: /.test(e.why ?? "")
        && JSON.stringify(said) === JSON.stringify(["answer:9401:decline"]) && r.approvalsAccepted === 0
        && !readJson(path.join(a.box, `${q.id}.request.json`))?.settled)
      || `exit ${res.code}, ${JSON.stringify({ e, said, accepted: r.approvalsAccepted })}`;
  });

flow("a request delivered twice under one id is offered once and answered once",
  "the mailbox would otherwise hold two requests for one server request, and the caller's two decisions two responses to an id the server matches once",
  async () => {
    const a = armed("approval-duplicate");
    const q = await offered(a.box);
    if (!q) return "no request was offered";
    await wait(600);
    const problems = [];
    if (requestsIn(a.box).length !== 1) problems.push(`${requestsIn(a.box).length} request files for one request`);
    const pending = fs.existsSync(path.join(a.box, "pending")) ? fs.readFileSync(path.join(a.box, "pending"), "utf8") : "";
    if (pending !== `${q.id}\n`) problems.push(`pending is ${JSON.stringify(pending)}`);
    decide(a.box, q, "accept");
    const { code, out, err } = await a.done;
    const r = parsed(out) ?? {};
    if (code !== EXIT.SUCCESS || r.escalations?.length !== 1) problems.push(`exit ${code}, ${JSON.stringify({ entries: r.escalations?.length })}`);
    const said = answers(a.log).filter((l) => l.startsWith("answer:9430:"));
    if (JSON.stringify(said) !== JSON.stringify(["answer:9430:accept"])) problems.push(`the server got ${JSON.stringify(said)}`);
    if (!/approval request id 9430 .* arrived again/.test(err)) problems.push("the duplicate was not said on stderr");
    return problems.length === 0 || problems.join("; ");
  });

flow("a stale decision on disk when the deadline fires is stale, not late, and the request file says what the driver found",
  "a decision that is not this run's is a forgery or a leftover whenever it arrived, and calling it late tells the caller its own answer came too slowly; the settlement records what the driver saw so nobody reading the files after the run has to guess",
  async () => {
    const a = armed("approval-wait", { env: { ENTRUST_APPROVAL_TIMEOUT_S: "2" } });
    const q = await offered(a.box);
    if (!q) return "no request was offered";
    decide(a.box, q, "accept", { identity: { pid: q.run.pid + 1 } });
    const { code, out } = await a.done;
    const r = parsed(out) ?? {};
    const settledAs = readJson(path.join(a.box, `${q.id}.request.json`))?.settled;
    return (code === EXIT.APPROVAL && entry0(r).decision === "expired" && settledAs?.decisionFile === "stale")
      || `exit ${code}, ${JSON.stringify({ e: entry0(r), settled: settledAs })}`;
  });

flow("an accepted request blocks the transient retry",
  "replaying the prompt after an accepted request asks again for what already ran with the user's rights; nothing else in the stream may say so, since an accepted command can complete with no item",
  async () => {
    const a = armed("approval-then-transient");
    const q = await offered(a.box);
    if (!q) return "no request was offered";
    decide(a.box, q, "accept");
    const { code, out } = await a.done;
    const r = parsed(out) ?? {};
    return (code === EXIT.MODEL && r.transientRetries?.length === 0 && entry0(r).decision === "accepted")
      || `exit ${code}, retries ${JSON.stringify(r.transientRetries)}, entry ${JSON.stringify(entry0(r))}`;
  });

let failed = await runTable(CASES);

// --- the exit ladder, one rung at a time ---
//
// Possible at all only because every `when` is a function of the context decideExitCode hands it: most
// of them used to read module state that a whole turn had to produce first, so the ladder could be
// exercised end to end and no other way. LADDER comes from the driver through the harness, so the rungs
// here ARE the driver's rungs and a rung added there without a case here shows up as a count.
const LADDER_OPTS = { expectRe: null, allowNoCommands: true, outputSchema: null };
// A completed turn that ran a command, answered, and tripped nothing.
const LADDER_BASE = { turnStatus: "completed", turnError: null, interactions: [], escalations: [],
  expected: [{}], commandsRan: 1, answer: "an answer", schemaErrs: [], failedCmds: [], failedPatches: [], blocked: [] };
const ladderCtx = ({ opts = {}, ...over } = {}) =>
  ({ ...LADDER_BASE, ...over, opts: { ...LADDER_OPTS, ...opts } });
// First match wins: the ladder's own rule, and the whole of the driver's walk over it.
const rungHit = (ctx) => LADDER.findIndex((r) => r.when(ctx));

const RUNGS = [
  { at: 0, code: EXIT.TIMEOUT, ctx: { turnStatus: "timedOut" },
    what: "a turn cut on a declared budget",
    why: "a budget the caller set is the caller's to raise; folded into any rung below it, the report would blame the agent for work that did not fit" },
  { at: 1, code: EXIT.USAGE, ctx: { turnStatus: "failed", turnError: { codexErrorInfo: "badRequest" } },
    what: "a request the server refused",
    why: "the set of efforts and models is per-model and knowable only at runtime; reported as a transport failure the caller retries it forever instead of fixing the parameter" },
  { at: 2, code: EXIT.MODEL, ctx: { turnStatus: "failed" },
    what: "a turn that did not complete",
    why: "an incomplete turn's answer is whatever arrived before it stopped; exit 0 on it claims a finished piece of work" },
  { at: 3, code: EXIT.NEEDS_INPUT, ctx: { interactions: [{ q: "which branch?" }] },
    what: "a turn that asked for input",
    why: "no sandbox change answers a question that needed a human, so this must outrank the escalation rung below it" },
  { at: 4, code: EXIT.APPROVAL, ctx: { escalations: [{ decision: "declined" }] },
    what: "a refused approval",
    why: "a refused escalation explains the missing command; below COMMANDS it would be reported as 'nothing ran', which hides why" },
  { at: 4, code: EXIT.APPROVAL, ctx: { escalations: [{ decision: "accepted" }, { decision: "expired" }] },
    what: "an approval that expired beside one that was accepted",
    why: "a request nobody answered in time is a refusal nobody made, and one acceptance beside it does not answer it" },
  { at: 5, code: EXIT.COMMANDS, ctx: { commandsRan: 0, expected: [], opts: { allowNoCommands: false } },
    what: "a turn that ran nothing",
    why: "an answer with no command behind it is recall, not evidence; the floor is what separates the two" },
  { at: 5, code: EXIT.COMMANDS, ctx: { commandsRan: 3, expected: [], opts: { expectRe: /vitest/, allowNoCommands: true } },
    what: "a declared --expect-command with no successful match",
    why: "the floor asks whether anything ran, but a declared expectation asks for a command that succeeded and matched; folding them into one question would let three failed commands satisfy the caller's claim" },
  { at: 6, code: EXIT.NO_ANSWER, ctx: { answer: "" },
    what: "a turn that produced no answer",
    why: "a run with no answer has nothing for its caller to read, and every gate below it grades the answer's content" },
  { at: 7, code: EXIT.SCHEMA, ctx: { opts: { outputSchema: {} }, schemaErrs: ["/: missing 'verdict'"] },
    what: "an answer that failed --output-schema",
    why: "an unusable answer is what a caller parsing it fails on, and it is the LAST rung: a failed command is a report field and no exit at all" },
];

flow("the ladder's contexts and its rungs are the same eight",
  "a rung added to the driver without a case here is a rung nothing measures, and the ladder is the whole of what an exit code means",
  async () => {
    // Counted by POSITION, not by case: two contexts reach the APPROVAL rung and two the COMMANDS rung,
    // and each still has to be shown reaching it rather than something above it.
    const named = new Set(RUNGS.map((r) => r.at)).size;
    return LADDER.length === named || `the driver has ${LADDER.length} rungs and this suite names ${named}`;
  });

flow("a completed turn that tripped no rung exits 0",
  "the ladder decides every exit this driver takes; a base context that matched something would make every case below it agree for the wrong reason",
  async () => {
    const i = rungHit(ladderCtx());
    return i < 0 || `a clean completed turn matched rung ${i} (exit ${LADDER[i].code})`;
  });

flow("accepted approvals alone trip no rung",
  "exit 6 is a request declined or expired, never one accepted: the command ran, and the report counts it like any other — by the caller or by the driver alike",
  async () => {
    const i = rungHit(ladderCtx({ escalations: [{ decision: "accepted", by: "coordinator" }, { decision: "accepted", by: "driver" }] }));
    return i < 0 || `accepted approvals matched rung ${i} (exit ${LADDER[i].code})`;
  });

for (const r of RUNGS)
  flow(`exit ${r.code}: ${r.what} matches rung ${r.at} and nothing above it`,
    r.why,
    async () => {
      const i = rungHit(ladderCtx(r.ctx));
      if (i !== r.at) return i < 0
        ? `nothing matched: the rung reads state its context does not carry`
        : `rung ${i} (exit ${LADDER[i].code}) matched first`;
      return LADDER[i].code === r.code || `rung ${r.at} is exit ${LADDER[i].code}, not ${r.code}`;
    });


failed += await runCases(FLOWS);

fs.rmSync(shimDir, { recursive: true, force: true });
process.exit(summarize(failed, CASES.length + FLOWS.length));
