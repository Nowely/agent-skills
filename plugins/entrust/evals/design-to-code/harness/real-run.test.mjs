// node --test evals/design-to-code/harness/real-run.test.mjs
//
// The real run's harness: the Codex rollout parser on a synthetic log written from Codex's source (not a real log),
// and setup then collect on the planted card's prebuilt arm. Chromium is not required: without it, setup says so and
// is not ready, and the rest is the same.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { APPROVAL, classify, diffFiles, execCellOps, lineDelta, literal, nestedCalls, parseRollout } from "./real-run.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "real-run.mjs");
const FIXTURE = path.join(HERE, "fixtures", "codex-rollout.jsonl");
const MAKE_ARM = path.join(HERE, "../cases/server-card-planted/make-arm.mjs");
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "real-run-test-"));

// ------------------------------------------------------------------ the rollout parser

test("the rollout: calls by name and by what they did, polls, agents, the first complete check, tokens and the largest outputs", () => {
  const r = parseRollout(fs.readFileSync(FIXTURE, "utf8"));
  assert.equal(r.calls.total, 10);
  assert.deepEqual(r.calls.byName, { exec_command: 3, write_stdin: 2, spawn_agent: 1, exec: 2, apply_patch: 2 });
  // Code mode: two outer exec calls hold three operations.
  assert.deepEqual(r.calls.nestedByName, { exec_command: 1, write_stdin: 1, view_image: 1 });
  assert.deepEqual(r.list.map((c) => c.category),
    ["file-read", "check-quick", "poll", "poll", "other", "check-complete", "image-read", "ledger-write", "edit", "check-complete"]);
  assert.deepEqual(r.list[5].also, ["poll"]);
  assert.equal(r.calls.skillDocReads, 1);
  assert.equal(r.calls.sidePngViews, 1);
  // Empty polls: two outer write_stdin and one inside an exec cell, each asking 1,000 ms; the first brought nothing.
  assert.equal(r.polls.empty, 3);
  assert.deepEqual(r.polls.waitsAsked, [1000, 1000, 1000]);
  assert.deepEqual(r.polls.list[0], { call: 3, tool: "write_stdin", nested: false, waitAsked: 1000, wall: 5.0012, newOutput: false });
  assert.equal(r.polls.list[2].nested, true);
  assert.equal(r.polls.perCompleteCheck, 1.5);
  assert.equal(r.spawnAgent, 1);
  // A quick check's verdict is partial; the first complete one is at call 6, read from the exec cell's output.
  assert.deepEqual(r.checks.verdicts.map((v) => [v.call, v.status, v.complete]), [[4, "fail", false], [6, "pending", true]]);
  assert.equal(r.checks.firstComplete.call, 6);
  assert.equal(r.checks.firstCompleteStarted, 6);
  assert.deepEqual(r.checks.started, { complete: 2, quick: 1 });
  // Totals from the last token count; the rate-limit repeats are not responses of their own.
  assert.deepEqual(r.tokens.total, { input: 353040, cached: 303872, output: 956, reasoning: 477, uncached: 49168 });
  assert.equal(r.tokens.responses, 9);
  assert.equal(r.tokens.firstRequestInput, 25040);
  assert.equal(r.tokens.peakInput, 56000);
  // Each call's input is its response's; the last call's was never recorded, so the last recorded one is given too.
  assert.deepEqual(r.tokens.inputAt, [
    { call: 1, input: 25040, cached: 8192, uncached: 16848, output: 91 },
    { call: 10, unavailable: true, last: true },
    { call: 9, input: 56000, cached: 53760, uncached: 2240, output: 170, lastRecorded: true },
  ]);
  assert.equal(r.tokens.lastCallUsageMissing, true);
  assert.deepEqual(r.largest[0], { call: 7, name: "exec", category: "image-read", bytes: r.largest[0].bytes, images: 1, content: "check image side.png", designMjs: true });
  assert.ok(r.largest[0].bytes > 12000);
  assert.equal(r.largest.length, 10);
  assert.equal(r.largest.find((o) => o.call === 1).designMjs, false);
  assert.equal(r.largest.find((o) => o.call === 4).content, "check text");
  assert.deepEqual(r.wall, { first: "2026-01-15T14:53:32.500Z", last: "2026-01-15T15:00:26.500Z", seconds: 414 });
  assert.deepEqual([r.session.model, r.session.effort], ["worker-model", "xhigh"]);
  assert.equal(r.user.messages, 1);
  assert.ok(r.user.first.includes(APPROVAL));
  assert.deepEqual(r.lastCall, { call: 10, at: "2026-01-15T15:00:26.500Z", outputAt: null, category: "check-complete" });
  assert.equal(r.final, null);
  // What it does not know is counted, not fatal.
  assert.equal(r.format.broken, 1);
  assert.deepEqual(r.format.unknown, { "line type future_line": 1, "response_item future_call": 1 });
  assert.equal(r.format.tokens, "token_usage_record");
});

test("without Codex's per-response records, the token counts that move the total give the same per-call input", () => {
  const text = fs.readFileSync(FIXTURE, "utf8").split("\n").filter((l) => !l.includes('"type":"token_usage_record"')).join("\n");
  const a = parseRollout(fs.readFileSync(FIXTURE, "utf8")), b = parseRollout(text);
  assert.equal(b.format.tokens, "token_count");
  assert.deepEqual(b.tokens, a.tokens);
  assert.deepEqual(b.list.map((c) => c.input), a.list.map((c) => c.input));
});

test("any text reads without a throw: empty, not JSON, other shapes, an older log without envelopes, a handover after the last call", () => {
  assert.equal(parseRollout("").calls.total, 0);
  const junk = parseRollout("not json\n[1,2]\n{}\n{\"type\":\"response_item\",\"payload\":{\"type\":\"function_call_output\",\"call_id\":\"nobody\",\"output\":\"x\"}}\n");
  assert.equal(junk.format.broken, 1);
  assert.deepEqual(junk.format.unknown, { "a line that is not an object": 1, "line type untyped": 1, "function_call_output without its call": 1 });
  // Before the envelope, each line was the item itself; write_stdin with no chars is an empty poll.
  const old = [
    { id: "s", timestamp: "2025-06-01T10:00:00.000Z", instructions: "" },
    { type: "function_call", name: "shell", arguments: JSON.stringify({ command: ["bash", "-lc", "cat src/card.css"] }), call_id: "a" },
    { type: "function_call_output", call_id: "a", output: JSON.stringify({ output: "body {}", metadata: { exit_code: 0 } }) },
    { type: "function_call", name: "write_stdin", arguments: JSON.stringify({ session_id: 1 }), call_id: "b" },
    { type: "message", role: "assistant", content: [{ type: "output_text", text: "Done: pending, two questions for you." }] },
  ].map((l) => JSON.stringify(l)).join("\n");
  // Said after the last call, but the turn did not end: a stop, not a handover.
  assert.equal(parseRollout(old).final.turnComplete, false);
  const o = parseRollout(`${old}\n${JSON.stringify({ timestamp: "2025-06-01T10:05:00.000Z", type: "event_msg", payload: { type: "task_complete", turn_id: "t", last_agent_message: "Done: pending, two questions for you." } })}`);
  assert.deepEqual(o.list.map((c) => [c.name, c.category]), [["shell", "file-read"], ["write_stdin", "poll"]]);
  assert.deepEqual(o.polls.waitsAsked, [null]);
  assert.deepEqual([o.final.text, o.final.turnComplete], ["Done: pending, two questions for you.", true]);
  assert.equal(o.wall.seconds, 300);
  assert.equal(o.calls.toHandover, 2);
  assert.deepEqual(o.format.unknown, {});
});

test("an exec cell's nested calls: each tools.<name>(…) site, past strings, templates and comments, with its literals", () => {
  const source = `// @exec: {"yield_time_ms": 10000}
const files = ["card.css", "card.js"];
for (const f of files) text(await tools.exec_command({ cmd: \`sed -n 1,80p \${f}\`, yield_time_ms: 2000 })); // a loop, one site
const s = "tools.fake(not a call)";
await tools["write_stdin"]({ session_id: 4, chars: '', yield_time_ms: 1000 });
await tools.write_stdin({ session_id: 4, chars: "q\\n" });
/* tools.commented(1) */ const img = await tools.view_image({ path: ".design/card/out/card-764/side.png" });`;
  assert.deepEqual(nestedCalls(source).map((c) => c.name), ["exec_command", "write_stdin", "write_stdin", "view_image"]);
  const ops = execCellOps(source);
  assert.deepEqual(ops.map((o) => [o.tool, o.cmd ?? o.path ?? null, o.empty ?? null, o.yield ?? null]), [
    ["exec_command", "sed -n 1,80p ${f}", null, 2000],
    ["write_stdin", null, true, 1000],
    ["write_stdin", null, false, null],
    ["view_image", ".design/card/out/card-764/side.png", null, null],
  ]);
  assert.deepEqual(ops.map((o) => classify(o).cats), [["file-read"], ["poll"], ["other"], ["image-read"]]);
  assert.equal(classify(ops[3]).checkImage, true);
  assert.deepEqual(literal("{ cmd: run, yield_time_ms: 500 }", "cmd"), { present: true, literal: false, expr: "run" });
  // A cell that calls no tool is its own computation.
  assert.deepEqual(execCellOps("text(1 + 1)").map((o) => classify(o).cats), [["other"]]);
});

test("what a shell command did: a check complete or quick, a ledger write, an edit, a probe, a read", () => {
  const cat = (cmd) => classify({ tool: "exec_command", cmd, text: cmd }).cats;
  assert.deepEqual(cat("node /p/.skill/design-to-code/scripts/design.mjs check design.json"), ["check-complete"]);
  assert.deepEqual(cat("cd .design/card && node ../../.skill/design-to-code/scripts/design.mjs check design.json --quick"), ["check-quick"]);
  assert.deepEqual(cat("node ../../.skill/design-to-code/scripts/design.mjs check design.json --frame card-280"), ["check-quick"]);
  assert.deepEqual(cat("cat > .design/card/deviations.json <<'EOF'\n[]\nEOF"), ["ledger-write", "file-read"]);
  assert.deepEqual(cat("sed -i 's/gap: 8px/gap: 12px/' card.css"), ["edit", "file-read"]);
  assert.deepEqual(cat("node -e 'require(\"playwright\").chromium.launch().then((b) => b.close())'"), ["probe"]);
  assert.deepEqual(cat("node .design/card/probe.mjs 280 764"), ["probe"]);
  assert.deepEqual(cat("node ../../.skill/design-to-code/scripts/design.mjs boxes design/card-764/reference.png --width 764"), ["probe"]);
  assert.deepEqual(cat("rg -n 'renderCard' . && ls design"), ["file-read"]);
  assert.deepEqual(cat("npm i -D playwright && npx playwright install chromium"), ["other"]);
  assert.deepEqual(cat("git status --short 2>/dev/null"), ["file-read"]);
});

test("the inputs' diff: changed, removed and added paths, and the lines a changed text gained", () => {
  assert.deepEqual(diffFiles({ a: "1", b: "2", c: "3" }, { a: "1", b: "9", d: "4" }), { changed: ["b"], removed: ["c"], added: ["d"] });
  assert.deepEqual(lineDelta("x\ny\nz", "x\nz\nz\nw"), { removed: ["y"], added: ["z", "w"] });
});

// ------------------------------------------------------------------ setup, then collect

const env = (home) => ({ ...process.env, HOME: home, CODEX_HOME: path.join(home, ".codex") });
const cli = (home, ...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8", env: env(home) });
const at = (iso) => new Date(iso);

test("setup then collect on the planted card: inputs intact, a late check read as the checker's, then one edited reference flips the line", () => {
  const dir = tmp(), home = path.join(dir, "home"), project = path.join(dir, "card"), keep = path.join(dir, "keep");
  fs.mkdirSync(home);
  assert.equal(spawnSync(process.execPath, [MAKE_ARM, project, "--prebuilt"], { encoding: "utf8" }).status, 0);
  const baseline = path.join(keep, "card-A.baseline.json");
  const setupArgs = ["setup", project, "--skill", "HEAD", "--originals", "design", "README.md", "data.js", "--baseline", baseline];

  // The seeds are the owner's: setup names what is missing and writes nothing in their place.
  const bare = cli(home, ...setupArgs);
  assert.equal(bare.status, 1, bare.stderr);
  assert.match(bare.stdout, /missing \.design\/returns\.md/);
  assert.match(bare.stdout, /^Not ready: .*\.design\/returns\.md/m);
  assert.equal(fs.existsSync(path.join(project, ".design", "returns.md")), false);

  fs.writeFileSync(path.join(project, ".design", "returns.md"), "- a type size smaller than drawn is a return: \"the problem is only the font size\"\n");
  const s = cli(home, ...setupArgs);
  assert.match(s.stdout, /^(Ready|Not ready: Chromium)\.$/m, s.stdout + s.stderr);
  assert.ok(fs.existsSync(path.join(project, ".skill", "design-to-code", "SKILL.md")));
  assert.match(fs.readFileSync(path.join(project, ".prompt.md"), "utf8"), /Use the design-to-code skill: read .*SKILL\.md first/);
  assert.match(s.stdout, /^2\. Baseline: 8 files under design, README\.md, data\.js; .*not a git repository/m);
  assert.match(s.stdout, /\.design\/returns\.md: 1 line, each a list item$/m);
  assert.ok(s.stdout.includes(JSON.stringify(path.join(project, ".skill/design-to-code/scripts/design.mjs"))), "the rule names the project's script");
  assert.match(s.stdout, /cat '.*card-A\.rules' >> ~\/\.codex\/rules\/default\.rules/);
  assert.match(s.stdout, /codex execpolicy check --pretty --rules ~\/\.codex\/rules\/default\.rules -- node \S+design\.mjs check design\.json$/m);
  assert.ok(s.stdout.includes(APPROVAL), "the first message carries the approval line word for word");
  assert.match(s.stdout, /^5\. Chromium: (starts from the project|did not start from the project)/m);
  const b = JSON.parse(fs.readFileSync(baseline, "utf8"));
  assert.match(b.skill.commit, /^[0-9a-f]{40}$/);
  assert.equal(b.git, null);
  assert.ok(b.originals.files["design/card-764/reference.png"]);
  assert.ok(b.tree["card.css"]);
  assert.equal(b.firstMessage, fs.readFileSync(path.join(keep, "card-A.first-message.md"), "utf8"));
  assert.ok(fs.existsSync(path.join(keep, "card-A.originals", "design", "card-764", "reference.png")), "the originals are copied outside the project");

  // The run, as a stopped Terra leaves it: a component edit, a ledger entry, two rounds the worker saw, and a third
  // round with its handoff.md written 24 s after the log's last line (39-terra-045-rerun.md).
  fs.appendFileSync(path.join(project, "card.css"), "\n.card { gap: 12px; }\n");
  const pack = path.join(project, ".design", "card"), out = path.join(pack, "out");
  fs.mkdirSync(out);
  fs.writeFileSync(path.join(pack, "deviations.json"), JSON.stringify([{ landmark: "Выдача за 15 минут", property: "presence", category: "missing-state", status: "proposed", reason: "the frames draw it; the contract has no field", options: ["drop the line", "add an optional field"] }]));
  const round = (n, time, quick, status, score) => JSON.stringify({ round: n, time, frames: ["card-764", "card-601", "card-486", "card-280", "network-popover"], basis: quick ? "q" : "c", status, score, quick });
  fs.writeFileSync(path.join(out, "history.jsonl"), [round(1, "2026-01-15T14:54:20.000Z", true, "fail", 12), round(2, "2026-01-15T14:55:05.000Z", false, "pending", 3), round(3, "2026-01-15T15:00:50.000Z", false, "fail", 4), ""].join("\n"));
  fs.writeFileSync(path.join(out, "handoff.md"), "Status: fail — fix the first cause and check again\n");
  for (const f of ["history.jsonl", "handoff.md"]) fs.utimesSync(path.join(out, f), at("2026-01-15T15:00:50Z"), at("2026-01-15T15:00:50Z"));
  const rollout = path.join(dir, "rollout.jsonl");
  fs.writeFileSync(rollout, fs.readFileSync(FIXTURE, "utf8").replaceAll("/ABSOLUTE/PROJECT", project));

  // A check still running in the project: nothing is frozen.
  const fake = spawn(process.execPath, ["-e", "setTimeout(() => {}, 60000)", path.join(project, ".skill/design-to-code/scripts/design.mjs"), "check", "design.json"], { stdio: "ignore" });
  try {
    const busy = cli(home, "collect", project, "--rollout", rollout, "--baseline", baseline, "--out", path.join(dir, "busy"), "--wait", "1");
    assert.equal(busy.status, 3, busy.stdout + busy.stderr);
    assert.match(busy.stderr, new RegExp(`still running .* \\(pid ${fake.pid}, `));
    assert.match(busy.stderr, /Nothing was frozen/);
    assert.equal(fs.existsSync(path.join(dir, "busy")), false);
  } finally { fake.kill(); }

  const c = cli(home, "collect", project, "--rollout", rollout, "--baseline", baseline, "--out", path.join(dir, "out1"), "--wait", "10");
  assert.equal(c.status, 0, c.stdout + c.stderr);
  assert.match(c.stdout, /^INPUTS INTACT$/m);
  assert.match(c.stdout, /^ {4}card-764: spec \.design\/card\/frames\/card-764\/spec\.json; reference \.design\/card\/frames\/card-764\/reference\.png, byte-identical to the original design\/card-764\/reference\.png as recorded$/m);
  assert.match(c.stdout, /^ {2}\.design\/card\/design\.json: tolerance 1 \(default 1\)$/m);
  assert.match(c.stdout, /^Handover: Status: fail .*\(checker-generated after the stop/m);
  assert.match(c.stdout, /1 written after the log's last line/);
  assert.match(c.stdout, /^ {2}empty polls 3 \(1000 ms ×3\); spawn_agent 1; the first complete check's status at call 6 \(pending\)$/m);
  const record = JSON.parse(fs.readFileSync(path.join(dir, "out1", "record-A.json"), "utf8"));
  assert.equal(record.inputs.verdict, "INPUTS INTACT");
  assert.deepEqual(record.component.changed, [".design/card/deviations.json", "card.css"]);
  assert.equal(record.boundary.handoff.olderThanLastCall, false);
  assert.match(record.boundary.handoff.reading, /^checker-generated after the stop/);
  assert.equal(record.boundary.latestRound.round, 3);
  assert.equal(record.boundary.roundsAfterLogEnd, 1);
  assert.equal(record.fields["3 handover"].workerHandedOver, false);
  assert.deepEqual(record.fields["5 check rounds"].afterLowest, 1);
  assert.equal(record.fields["6 totals"].uncached, 49168);
  assert.equal(record.fields["7 interventions and helpers"].approvalLineSent, true);
  assert.equal(record.fields["8 ledger"].proposed.length, 1);
  assert.equal(record.rollout.cwdMatchesProject, true);
  assert.match(record.parser, /not yet run on a real Codex log/);
  const listed = spawnSync("tar", ["-tf", path.join(dir, "out1", "real-run-A.tar")], { encoding: "utf8" }).stdout.split("\n");
  for (const f of ["real-run-A/record-A.json", "real-run-A/form-A.md", "real-run-A/baseline-A.json", "real-run-A/project/card.css", "real-run-A/project/.design/card/design.json",
    "real-run-A/project/.design/card/out/handoff.md", "real-run-A/project/.prompt.md", "real-run-A/originals/design/card-764/reference.png", "real-run-A/originals/README.md"]) assert.ok(listed.includes(f), f);
  assert.ok(!listed.some((f) => f.includes(".skill/") || f === "real-run-A/project/README.md"), "neither the pinned skill nor an unchanged file");
  const formLines = fs.readFileSync(path.join(dir, "out1", "form-A.md"), "utf8").split("\n").filter((l) => /^\d\. /.test(l));
  assert.deepEqual(formLines.map((l) => l.slice(0, 2)), ["1.", "2.", "3.", "4.", "5."]);
  assert.match(fs.readFileSync(path.join(dir, "out1", "form-A.md"), "utf8"), /^ {3}- Выдача за 15 минут \(presence\): .*: fair \/ unfinished$/m);
  // A frozen run is never written over.
  assert.equal(cli(home, "collect", project, "--rollout", rollout, "--baseline", baseline, "--out", path.join(dir, "out1")).status, 2);

  // One reference edited; the log found by itself under $CODEX_HOME, from the session opened in the project.
  fs.appendFileSync(path.join(project, "design", "card-764", "reference.png"), Buffer.from([0]));
  const day = path.join(home, ".codex", "sessions", "2026", "01", "15");
  fs.mkdirSync(day, { recursive: true });
  fs.copyFileSync(rollout, path.join(day, "rollout-2026-01-15T14-53-32-0199a213-81c0-7800-8aa1-bbab2a035a55.jsonl"));
  const c2 = cli(home, "collect", project, "--baseline", baseline, "--out", path.join(dir, "out2"));
  assert.equal(c2.status, 0, c2.stdout + c2.stderr);
  assert.match(c2.stdout, /^INPUTS CHANGED$\n^ {2}changed: design\/card-764\/reference\.png$/m);
  const r2 = JSON.parse(fs.readFileSync(path.join(dir, "out2", "record-A.json"), "utf8"));
  assert.deepEqual([r2.inputs.verdict, r2.inputs.changed, r2.inputs.removed, r2.inputs.added], ["INPUTS CHANGED", ["design/card-764/reference.png"], [], []]);
  assert.equal(r2.rollout.file, "rollout-2026-01-15T14-53-32-0199a213-81c0-7800-8aa1-bbab2a035a55.jsonl");
  assert.ok(r2.component.changed.includes("design/card-764/reference.png"), "the changed original goes in the archive");
  // Beside it, the original as recorded, for the blind review.
  const archived = spawnSync("tar", ["-xOf", path.join(dir, "out2", "real-run-A.tar"), "real-run-A/originals/design/card-764/reference.png"]).stdout;
  assert.equal(createHash("sha256").update(archived).digest("hex"), b.originals.files["design/card-764/reference.png"]);
});

test("in a git project, a file already changed at setup is not the builder's; a text input's change names its lines", () => {
  const dir = tmp(), home = path.join(dir, "home"), repo = path.join(dir, "shop"), project = path.join(repo, "web");
  fs.mkdirSync(home);
  assert.equal(spawnSync(process.execPath, [MAKE_ARM, project, "--prebuilt"], { encoding: "utf8" }).status, 0);
  const git = (...a) => spawnSync("git", ["-C", repo, "-c", "user.email=t@example.com", "-c", "user.name=t", ...a], { encoding: "utf8" });
  assert.equal(git("init", "-q").status, 0);
  git("add", "-A"); git("commit", "-qm", "start");
  fs.appendFileSync(path.join(project, "card.js"), "\n// the owner's work in progress\n");
  fs.writeFileSync(path.join(project, ".design", "returns.md"), "- a smaller font is a return\n");
  const baseline = path.join(dir, "keep", "web-A.baseline.json");
  const s = cli(home, "setup", project, "--skill", "HEAD", "--originals", "design", "README.md", "--baseline", baseline);
  assert.match(s.stdout, /git HEAD [0-9a-f]{10}, 2 files already changed or untracked/, s.stdout + s.stderr);
  fs.appendFileSync(path.join(project, "card.css"), "\n.card { color: red; }\n");
  fs.appendFileSync(path.join(project, "README.md"), "- `delivery`: string, optional\n");
  const c = cli(home, "collect", project, "--rollout", FIXTURE, "--baseline", baseline, "--out", path.join(dir, "out"));
  assert.equal(c.status, 0, c.stdout + c.stderr);
  assert.match(c.stdout, /^ {2}changed: README\.md \(0 lines removed, 1 added\)$/m);
  assert.match(c.stdout, /^Warning: this log's session was opened in another folder/m);
  const record = JSON.parse(fs.readFileSync(path.join(dir, "out", "record-A.json"), "utf8"));
  assert.deepEqual(record.component.changed, ["README.md", "card.css"]);
  assert.deepEqual(record.inputs.lines["README.md"].added, ["- `delivery`: string, optional"]);
  assert.equal(record.component.git.moved, false);
});
