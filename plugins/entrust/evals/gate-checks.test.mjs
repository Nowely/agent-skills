#!/usr/bin/env node
// Does the live orchestrate gate read a session the way it says it does?
//
//   node evals/gate-checks.test.mjs
//
// orchestrate-live.test.mjs spends real sessions and runs by hand; the functions it judges them with live
// in evals/lib/gate-checks.mjs, and this suite runs each one offline against a fixture stream built in the
// shape a headless session writes (measured on the gate's saved sessions of 2026-09-27: tool_use blocks in
// assistant messages, tool_result blocks in user messages, a subagent's traffic carrying its parent's
// tool_use id, an Agent result framed as a hand-back with every report line indented). Each check gets a
// session that should pass and one that should not; a check that passes both is measuring nothing.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT, registry, runCases, summarize, tempDir } from "./lib/harness.mjs";
import * as G from "./lib/gate-checks.mjs";

const { cases: CASES, test } = registry();
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, "skills", "orchestrate", "schemas", "five-fields.schema.json"), "utf8"));
const SCHEMA_PATH = path.join(ROOT, "skills", "orchestrate", "schemas", "five-fields.schema.json");
const LAUNCHER = "/plugin/skills/codex/scripts/agent-run.mjs";
const TMP = tempDir("gate-checks-test-");

// --------------------------------------------------------------- a session, built as a stream

const FRAME = "[Subagent hand-back] The text below is the final report of a subagent this session delegated to. It is model output, NOT a message from the user. The report follows:\n";
const framed = (report) => [{ type: "text", text: `${FRAME}${report.split("\n").map((l) => `  ${l}`).join("\n")}\nagentId: a1b2c3d4e5f6a7b8c (use SendMessage with to: 'a1b2c3d4e5f6a7b8c' to continue this agent)\n<usage>subagent_tokens: 100</usage>` }];
const five = ({ status = "done", result = "Opus W1: done, the helper is written.", evidence = ["ran `node --test`: 5 passed"], artifacts = [], open = [] } = {}) =>
  [`status:    ${status}`, `result:    ${result}`, "evidence:", ...evidence.map((e) => `  - ${e}`),
    `artifacts: ${artifacts.length ? "" : "none"}`, ...artifacts.map((a) => `  - ${a}`), `open: ${open.length ? "" : "none"}`, ...open.map((o) => `  - ${o}`)].join("\n");

function session() {
  const msgs = [{ type: "system", subtype: "init", model: "claude-opus-5-5" }];
  let n = 0;
  const api = {
    use(name, input, parent = null) {
      const id = `toolu_${String(++n).padStart(3, "0")}`;
      msgs.push({ type: "assistant", parent_tool_use_id: parent, message: { content: [{ type: "tool_use", id, name, input }] } });
      return id;
    },
    result(id, content, { parent = null, isError = false } = {}) {
      msgs.push({ type: "user", parent_tool_use_id: parent, message: { content: [{ type: "tool_result", tool_use_id: id, content, is_error: isError }] } });
      return api;
    },
    say(text) { msgs.push({ type: "assistant", parent_tool_use_id: null, message: { content: [{ type: "text", text }] } }); return api; },
    // A text the subagent under that Agent call wrote, as a continued agent's final text arrives.
    sub(parent, text) { msgs.push({ type: "assistant", parent_tool_use_id: parent, message: { content: [{ type: "text", text }] } }); return api; },
    skill(name) { api.result(api.use("Skill", { skill: name }), `Launching skill: ${name}`); return api; },
    bash(command, out = "") { api.result(api.use("Bash", { command }), out); return api; },
    plan(runDir, rows, amend = false) {
      return api.bash(`node "${LAUNCHER}" --plan${amend ? " --amend" : ""} --run-dir "${runDir}" <<'PLAN'\n${rows}\nPLAN`, `PLAN=${runDir}/plan.txt`);
    },
    newAgent(report, body) { return api.bash(`node "${LAUNCHER}" --new --report-file "${report}" <<'PROMPT'\n${body}\nPROMPT`, `PROMPT=${path.dirname(report)}/agent/prompt.txt`); },
    codex(description, report, lines = "DRIVER_EXIT=0\nPATH=own\nEXIT=0") {
      const id = api.use("Agent", { description, subagent_type: "entrust:relay", run_in_background: false,
        prompt: `1. Run this command.\n\nCLAUDE_PLUGIN_DATA="/d" node "${LAUNCHER}" --run --report-file "${report}"` });
      api.result(id, framed(`${lines}\nREPORT=${report}`));
      return api;
    },
    claude(description, model, prompt, report, writes = []) {
      const id = api.use("Agent", { description, subagent_type: "general-purpose", model, prompt });
      for (const f of writes) api.result(api.use("Write", { file_path: f, content: "x" }, id), "ok", { parent: id });
      if (report !== undefined) api.result(id, framed(report));
      return api;
    },
    done(text) { api.say(text); msgs.push({ type: "result", subtype: "success", result: text }); return api; },
    text: () => msgs.map((m) => JSON.stringify(m)).join("\n"),
    parsed: () => G.parseStream(api.text()),
  };
  return api;
}

const expectNone = (problems) => problems.length === 0 || problems.join("; ");
const expectSome = (problems, re) => problems.some((p) => re.test(p)) || `no problem matched ${re}: ${JSON.stringify(problems)}`;
const all = (...rs) => { const bad = rs.filter((r) => r !== true); return bad.length === 0 || bad.join(" | "); };

// --------------------------------------------------------------- the stream

test("the parser keeps the coordinator's events apart from a subagent's, and unframes a hand-back",
  "every check below reads root events and hand-backs; a subagent's Bash counted as the coordinator's, or a report read with its frame, misjudges the session",
  () => {
    const s = session();
    const id = s.use("Agent", { description: "Opus W1: write the helper", model: "opus", prompt: "TASK: x" });
    s.result(s.use("Bash", { command: "ls" }, id), "a\nb", { parent: id });
    s.result(id, framed(five()));
    s.say("Opus W1 wrote the helper.");
    const p = s.parsed();
    const rootUses = p.events.filter((e) => e.parent === null && e.kind === "tool_use");
    const hb = G.handBack(p.results.get(id).text);
    return all(
      rootUses.length === 1 || `${rootUses.length} root calls`,
      p.planText === "Opus W1 wrote the helper." || `planText ${JSON.stringify(p.planText)}`,
      hb.startsWith("status:    done") && !/agentId|usage/.test(hb) || `hand-back read as ${JSON.stringify(hb.slice(0, 80))}`,
    );
  });

test("five fields: a template return parses and validates against the shipped schema; a malformed one does not",
  "D15: every return is admitted as one five-field record before the synthesis, or it is a failure named by agent",
  () => {
    const ok = G.parseFiveFields(framed(five())[0].text);
    const noOpen = G.parseFiveFields(five().split("\n").filter((l) => !l.startsWith("open")).join("\n"));
    const preface = G.parseFiveFields(`Here is my report.\n${five()}`);
    const long = G.validate(SCHEMA, { ...ok.fields, result: "x".repeat((SCHEMA.properties.result.maxLength ?? 2400) + 1) });
    const extra = G.validate(SCHEMA, { ...ok.fields, verdict: "done" });
    const status = G.validate(SCHEMA, { ...ok.fields, status: "finished" });
    return all(
      ok.problems.length === 0 && G.validate(SCHEMA, ok.fields).length === 0 || `the template failed: ${ok.problems} ${G.validate(SCHEMA, ok.fields)}`,
      ok.fields.artifacts.length === 0 || "artifacts: none is not an empty list",
      noOpen.problems.includes("no open:") || `a missing open passed: ${noOpen.problems}`,
      preface.problems.includes("text before the first field") || "a preface passed",
      long.some((e) => /characters, over/.test(e)) || "a result over the cap passed",
      extra.some((e) => /not in the schema/.test(e)) || "an extra field passed",
      status.some((e) => /not one of/.test(e)) || "a status outside the enum passed",
    );
  });

// --------------------------------------------------------------- the card and the manifest

const CARD = [
  "**Work:** add slug(title) to lib/slug.mjs with a test.",
  "**Team:** one worker, Opus W1; two checking agents, Codex Terra C1 (verifier) and Opus K1 (final reader).",
  "**Writes:** W1 writes lib/slug.mjs and test/slug.test.mjs in the live tree; C1 and K1 write nothing. Every agent reaches the network; reports land outside the repository.",
  "**Checks:** C1 runs node --test, K1 reads the answer.",
].join("\n");
const ROWS = G.planRecord("id | model | role | writes | tokens\nW1 | opus | worker | live tree | 40000\nC1 | terra | verifier | nothing | 0\nK1 | opus | final reader | nothing | 0\n");

test("the card: four required rows, no models/cost rows, and every registered agent on it",
  "the card is what \"go\" covers; redundant rows and dropped agents ask for approval on a word not in the work",
  () => all(
    expectNone(G.cardProblems(CARD, ROWS)),
    expectSome(G.cardProblems(CARD.replace(/^\*\*Team:\*\*.*$/m, ""), ROWS), /no team row/),
    expectSome(G.cardProblems(CARD, [...ROWS, { id: "R9", model: "sol", role: "refuter", writes: "nothing" }]), /does not show R9/),
    expectNone(G.cardProblems("| Работа | slug |\n| Команда | Opus W1 |\n| Права | W1 |\n| Проверки | C1 |")),
    expectSome(G.cardProblems("| Работа | slug |\n| Команда | Opus W1 |\n| Права | W1 |\n| Стоимость | 40k |\n| Проверки | C1 |"), /redundant cost row/),
    expectSome(G.cardProblems("| Работа | slug |\n| Команда | Opus W1 |\n| Модели | Luna |\n| Права | W1 |\n| Проверки | C1 |"), /redundant models row/),
    // E62: a row the launcher admits with `unknown` tokens reads without the column, not as NaN.
    JSON.stringify(G.planRecord("A1 | opus | worker | live tree | unknown")) === '[{"id":"A1","model":"opus","role":"worker","writes":"live tree"}]'
      || `planRecord read ${JSON.stringify(G.planRecord("A1 | opus | worker | live tree | unknown"))}`,
  ));

// The live gate's case 7 plan of 2026-09-28, verbatim (its artifact plan.txt), and the rows its --plan call
// registered: the gate failed it on two heuristics, not on the coordinator, so it is the fixture that passes.
const CASE7_PLAN = "The plan is registered below. Nothing has been launched yet, and I'm waiting for your word.\n\n**Scouting:** `fmt` appears in exactly 3 places: its definition on `lib/shared.mjs:1`, and the import plus one call in each of `lib/a.mjs` and `lib/b.mjs`. The tests don't mention it. There are 2 test files.\n\n**Assumptions:**\n- \"One worker per file\" means three workers, one each for `shared.mjs`, `a.mjs` and `b.mjs`.\n- It's a straight rename: no `fmt` alias is kept, and the output of `labelA` and `labelB` doesn't change.\n\nOne worker doing all three edits would be cheaper and never leave the tree half-renamed. I'm keeping the split you asked for.\n\n| | |\n|---|---|\n| **Work** | Rename `fmt` to `format` in `shared.mjs`, then change the import and call in `a.mjs` and `b.mjs` to match, and run `node --test` on the finished result. |\n| **Who** | 6 agents: 3 do the work, 3 check it. **Codex Astra S1** checks how the task is split and settles what the three files must agree on before anyone edits. **Sonnet W1, W2, W3** each edit one file: `shared.mjs`, `a.mjs`, `b.mjs`. **Codex Sol V1** runs the tests and reviews the combined change; it writes nothing. **Opus C1** reads my final answer before you get it. Two of the three checkers are Codex. None of the editors are, because only one Codex agent may write in a given folder, and all three files are in `lib/`. |\n| **Writes** | Each Sonnet worker changes only its own one file, in your working copy. There are no commits. S1, V1 and C1 change nothing in the repo; they only write scratch files in the temp folder. Every agent can reach the network, and I'm not blocking any of them. Reports go outside the repository. No worktree is created. |\n| **Cost** | All agents: `unknown`, because I have no measured run of this shape to compare with. Astra will use its configured default effort, which may be high for a job this small. Sol runs on medium effort. My own work so far: 3 quick reads (a file listing, a search, the test imports). |\n| **Checks** | S1 checks the split, and the worker instructions are written only from its corrected version. V1 has written none of the code; it runs `node --test` on all three edits together and reports how many tests ran and passed, and it also reviews the changes. C1 reads my final answer, which lists the changed files and the test count. |\n\n**Limits:** my own model is Opus 5.5. At most one Fable and one Astra agent run at a time, and at most 6 agents at once.\n\n**Options:**\n1. **(Recommended)** I launch the three workers myself, all at the same time, after S1 returns. Then V1 checks, then C1 reads.\n2. The same, but an Opus supervisor launches the workers and V1, so you see one card per worker instead of every step. It adds one Opus agent to coordinate what are three one-line edits. It would be added to the plan, and I'd show you that change first.\n\n\"go\" means option 1.";
const CASE7_ROWS = "S1 | astra | split critic | nothing | unknown\nW1 | sonnet | implementer | live tree | unknown\nW2 | sonnet | implementer | live tree | unknown\nW3 | sonnet | implementer | live tree | unknown\nV1 | sol | cross-reviewer | nothing | unknown\nC1 | opus | completeness critic | nothing | unknown";

const CASE7_CURRENT_PLAN = CASE7_PLAN
  .replace("| **Who** |", "| **Team** |")
  .replace(/^\| \*\*Cost\*\* \|.*\n/m, "");

test("the legacy case-7 plan maps to the four-row card and lists every registered agent",
  "the old captured live plan is adapted to the current card labels before model-count regressions are checked",
  () => {
    const rows = G.planRecord(CASE7_ROWS);
    return all(
      expectNone(G.cardProblems(CASE7_CURRENT_PLAN, rows)),
      G.topRowAgents(CASE7_CURRENT_PLAN, "Astra").max === 1 || `Astra counted ${G.topRowAgents(CASE7_CURRENT_PLAN, "Astra").max}: ${G.topRowAgents(CASE7_CURRENT_PLAN, "Astra").where.join(" / ")}`,
      G.topRowAgents(CASE7_CURRENT_PLAN, "Fable").max === 0 || "a Fable agent was counted",
    );
  });

test("top-row agents are counted where an agent is named: an id, the team row, an agent table's row; per wave; the same agent once",
  "the cap is one Fable and one Astra alive at a time; a counter that reads every mention fails plans that honour it, and one that reads none passes plans that break it",
  () => {
    const two = "| **Who** | Codex Astra S1 critiques the split, and Codex Astra S2 judges it. |\n| **Cost** | unknown |";
    const waves = "| wave | agent | role |\n| --- | --- | --- |\n| 1 | Astra | critic |\n| 2 | Astra | judge |";
    const same = "| id | model |\n| --- | --- |\n| S1 | Astra |\n\nCodex Astra S1 critiques the split.";
    const prose = "| **Who** | Opus W1 writes. |\n\nOne Fable agent, one Astra agent at most, caps respected.";
    return all(
      G.topRowAgents(two, "Astra").max === 2 || `two named Astra read as ${G.topRowAgents(two, "Astra").max}`,
      G.topRowAgents(waves, "Astra").max === 1 && G.topRowAgents(waves, "Astra").waveCol === "wave" || `waves read as ${JSON.stringify(G.topRowAgents(waves, "Astra"))}`,
      G.topRowAgents(same, "Astra").max === 1 || `one agent named by row and by id read as ${G.topRowAgents(same, "Astra").max}`,
      G.topRowAgents(prose, "Astra").max === 0 || `prose beside a table read as ${G.topRowAgents(prose, "Astra").max}`,
      G.topRowAgents("Codex Astra S1 critiques the split.\nAstra runs at its configured default effort.", "Astra").max === 1 || "an effort sentence counted in a plan with no table",
    );
  });

test("the codex page is loaded before the launcher's first call, and never by a plan with no Codex agent",
  "D5: the deferred load saves the codex page's words only if an all-Claude plan skips it, and it is safe only if a Codex plan loads it first",
  () => {
    const good = session().skill("entrust:codex").plan("/d/run", "W1 | opus | implementer | live tree | 1").parsed();
    const late = session().plan("/d/run", "W1 | opus | implementer | live tree | 1").skill("entrust:codex").parsed();
    const allClaude = session().skill("entrust:codex").say("plan").parsed();
    return all(
      expectNone(G.codexLoadProblems(good, { codexPlanned: true })),
      expectSome(G.codexLoadProblems(late, { codexPlanned: true }), /loaded after/),
      expectSome(G.codexLoadProblems(allClaude, { codexPlanned: false }), /no Codex agent loaded the codex page/),
      expectNone(G.codexLoadProblems(session().say("plan").parsed(), { codexPlanned: false })),
      expectNone(G.codexLoadProblems(session().newAgent("/d/run/C1/report.json", "MODEL: terra").parsed(), { codexPlanned: true, loadedBefore: true })),
    );
  });

test("the manifest: every launch is on the registered plan by id and model, an amendment is not launched in its own turn, a dropped agent is named",
  "D6 (F14: 1.38M tokens of unplanned work in T7): the launcher refuses an unlisted Codex id, and the gate is what holds the Claude side",
  () => {
    const planTurn = session().skill("entrust:codex").plan("/d/run", "W1 | opus | implementer | live tree | 1").parsed();
    const run = () => session()
      .claude("Opus W1: write the helper", "opus", "TASK: write it", five())
      .newAgent("/d/run/C1/report.json", "MODEL: terra\nTASK: run the suite")
      .codex("Codex Terra C1: run the suite", "/d/run/C1/report.json");
    const good = run().claude("Opus K1: final reader", "opus", "You are the final reader.", five()).parsed();
    const stray = run().claude("Sonnet X9: extra look", "sonnet", "TASK: look", five()).parsed();
    const wrongModel = session().claude("Sonnet W1: write the helper", "sonnet", "TASK", five()).parsed();
    const amended = run().plan("/d/run", "R2 | sol | refuter | nothing | 0", true).claude("Sol R2: refute", "sol", "TASK", five()).parsed();
    return all(
      expectNone(G.manifestProblems({ planTurn, runTurn: good, rows: ROWS, finalText: "" })),
      expectSome(G.manifestProblems({ runTurn: stray, rows: ROWS }), /Sonnet X9 ran and is not in the plan/),
      expectSome(G.manifestProblems({ runTurn: wrongModel, rows: ROWS }), /W1 ran as Sonnet, the plan says opus/),
      expectSome(G.manifestProblems({ runTurn: amended, rows: [...ROWS, ...G.planRecord("R2 | sol | refuter | nothing | 0")] }), /R2 was added to the plan and launched in the same turn/),
      expectSome(G.manifestProblems({ runTurn: run().parsed(), rows: ROWS, finalText: "done" }), /K1 is registered, never ran/),
      expectNone(G.manifestProblems({ runTurn: run().parsed(), rows: ROWS, finalText: "K1 was dropped: the check was enough." })),
      expectSome(G.manifestProblems({ runTurn: good, rows: [] }), /no plan was registered/),
      // The launcher's own continuation rule: C1-2 is C1's next link, C1-02 and X9-2 are not.
      expectNone(G.manifestProblems({ runTurn: run().newAgent("/d/run/C1-2/report.json", "RESUME: t\nMODEL: terra").codex("Codex Terra C1-2: again", "/d/run/C1-2/report.json")
        .claude("Opus K1: final reader", "opus", "You are the final reader.", five()).parsed(), rows: ROWS })),
      expectSome(G.manifestProblems({ runTurn: run().newAgent("/d/run/C1-02/report.json", "MODEL: terra").parsed(), rows: ROWS, finalText: "K1 dropped" }), /--new for C1-02, which the plan does not list/),
      expectSome(G.manifestProblems({ runTurn: run().newAgent("/d/run/X9-2/report.json", "MODEL: terra").parsed(), rows: ROWS, finalText: "K1 dropped" }), /--new for X9-2/),
    );
  });

// --------------------------------------------------------------- the critics

// A verifier's brief as the probe of 2026-11-22 wrote one: it says what it is, then names its roles.md row and
// mentions another core role after it.
const VERIFIER_TEXT = "You are the verifier. Read your row in /p/skills/orchestrate/references/roles.md. The plan critic's acceptance checks: node --test passes for lib/a.mjs and lib/b.mjs.";

test("the plan critic: no worker brief before it returns, and the shared interface has one writer",
  "D12 (#16, T5): twenty agents on a bad split agree and are all wrong, and T5's fan-out started before its critique had finished; the plan critic is found by its role's name at any tier, it writes no corrected split for a brief to name, and the owner is who wrote the file, not a brief that quotes the request",
  () => {
    const REPORTS = { "/d/run/C3/report.json": { answerJson: {}, filesTouched: ["lib/shared.mjs"] } };
    const critic = (s) => s.newAgent("/d/run/P1/report.json", "MODEL: astra\nTASK: judge this plan of the task: unit a (lib/a.mjs), unit b (lib/b.mjs)")
      .codex("Codex Astra P1: plan critic", "/d/run/P1/report.json", "DRIVER_EXIT=0\nPATH=own\nANSWER=Astra P1: sound, no objections");
    // Each brief quotes the request, which names every file: only the writes decide who owns lib/shared.mjs.
    const worker = (s, id, unit, writesShared) => s.claude(`Opus ${id}: ${unit}`, "opus",
      `TASK: change ${unit}.\nWhy: the user asked to rename fmt in lib/shared.mjs and update lib/a.mjs and lib/b.mjs.`,
      five(), [`/work/${unit}`, ...(writesShared ? ["/work/lib/shared.mjs"] : [])]);
    const opts = { units: ["lib/a.mjs", "lib/b.mjs"], shared: "lib/shared.mjs", reportOf: (p) => REPORTS[p] ?? null };
    const good = worker(worker(critic(session()), "W1", "lib/a.mjs", true), "W2", "lib/b.mjs", false).parsed();
    const early = critic(worker(session(), "W1", "lib/a.mjs", true)).parsed();
    const twoWriters = worker(worker(critic(session()), "W1", "lib/a.mjs", true), "W2", "lib/b.mjs", true).parsed();
    const codexWriter = worker(worker(critic(session()), "W1", "lib/a.mjs", true), "W2", "lib/b.mjs", false)
      .newAgent("/d/run/C3/report.json", "MODEL: terra\nTASK: tidy lib/shared.mjs")
      .codex("Codex Terra C3: tidy", "/d/run/C3/report.json").parsed();
    const noWriter = worker(worker(critic(session()), "W1", "lib/a.mjs", false), "W2", "lib/b.mjs", false).parsed();
    // By the role's name, at any tier: a Sonnet plan critic counts, and a Fable agent given the split under no
    // core role's name is not one.
    const sonnet = worker(session().claude("Sonnet P1: plan critic", "sonnet", "TASK: judge this plan: unit a (lib/a.mjs), unit b (lib/b.mjs)", five()),
      "W1", "lib/a.mjs", true).parsed();
    const unnamed = worker(session().claude("Fable S1: critique the split", "fable", "TASK: critique this split: unit a (lib/a.mjs), unit b (lib/b.mjs)", five()),
      "W1", "lib/a.mjs", true).parsed();
    // A verifier briefed early names every unit and is no worker.
    const verifier = worker(critic(session().claude("Opus V1: verifier", "opus", "TASK: run the suite over lib/a.mjs and lib/b.mjs", five())),
      "W1", "lib/a.mjs", true).parsed();
    // S1 (probe, 2026-11-22): a brief whose description names no role says it is the verifier and only mentions
    // the plan critic's checks after its roles.md path; read as the plan critic, it made the order pass with none.
    const s1 = worker(worker(session().claude("Opus V1: baseline the suite", "opus", VERIFIER_TEXT, five()),
      "W1", "lib/a.mjs", true), "W2", "lib/b.mjs", false).parsed();
    return all(
      expectNone(G.splitAdmissionProblems(good, opts)),
      expectSome(G.splitAdmissionProblems(early, opts), /1 worker brief\(s\) written before the plan critic returned/),
      expectSome(G.splitAdmissionProblems(twoWriters, opts), /2 agents wrote lib\/shared\.mjs, and it has one owner/),
      expectSome(G.splitAdmissionProblems(codexWriter, opts), /2 agents wrote lib\/shared\.mjs/),
      expectSome(G.splitAdmissionProblems(noWriter, opts), /0 agents wrote lib\/shared\.mjs/),
      expectNone(G.splitAdmissionProblems(sonnet, opts)),
      expectSome(G.splitAdmissionProblems(unnamed, opts), /no plan critic ran/),
      expectNone(G.splitAdmissionProblems(verifier, opts)),
      expectSome(G.splitAdmissionProblems(s1, opts), /no plan critic ran/),
      // A plan critic named only by the link to its section of roles.md.
      expectNone(G.splitAdmissionProblems(worker(session().claude("Sonnet P1: judge the plan", "sonnet",
        "TASK: judge this plan: unit a (lib/a.mjs), unit b (lib/b.mjs). Your row: /p/skills/orchestrate/references/roles.md#the-plan-critic", five()),
        "W1", "lib/a.mjs", true).parsed(), opts)),
      // The role a description names first, not the first of the list: a verifier of the plan critic's checks,
      // briefed after the worker with no plan critic in the run, is no plan critic.
      expectSome(G.splitAdmissionProblems(worker(session(), "W1", "lib/a.mjs", true)
        .claude("Opus V1: verifier of the plan critic's checks", "opus", "TASK: run the suite over lib/a.mjs", five()).parsed(), opts), /no plan critic ran/),
      G.roleOf({ description: "Opus V1: verifier of the plan critic's checks", text: "" }) === "verifier" || "the description's first role was not taken",
      G.roleOf({ description: "Opus V1: baseline the suite", text: VERIFIER_TEXT }) === "verifier" || "S1's brief is not read as the verifier",
      expectSome(G.splitAdmissionProblems(worker(session(), "W1", "lib/a.mjs", true).parsed(), opts), /no plan critic ran/),
    );
  });

test("the architecture critic, when the card's trigger holds: it ran, a plan critic ran too, and it returned before the plan critic or any worker was briefed",
  "the card runs it when the solution adds a concept, changes or removes a contract others consume, acts irreversibly or leaves the approach open, and then runs the plan critic too (probe P1, 2026-11-22: a coordinator ran the architecture critic and skipped the plan critic); a verdict other than keep changes the approach the plan critic and the workers would work from",
  () => {
    const arch = (s) => s.claude("Fable A1: architecture critic", "fable", "TASK: judge the approach: a new lib/slug.mjs", five());
    const plan = (s) => s.claude("Opus P1: plan critic", "opus", "TASK: judge the plan", five());
    const work = (s) => s.claude("Opus W1: write lib/slug.mjs", "opus", "TASK: write lib/slug.mjs", five());
    const parallel = session();
    const a = parallel.use("Agent", { description: "Fable A1: architecture critic", model: "fable", prompt: "TASK: judge the approach" });
    plan(parallel);
    parallel.result(a, framed(five()));
    // A scout briefed beside the critic names no unit of the task and is no worker.
    const scouted = session();
    const b = scouted.use("Agent", { description: "Fable A1: architecture critic", model: "fable", prompt: "TASK: judge the approach" });
    scouted.claude("Haiku S1: list the modules", "haiku", "TASK: list the modules under lib/ and their exports", five());
    scouted.result(b, framed(five()));
    // A worker briefed while the critic runs, the plan critic after it returned.
    const workedEarly = session();
    const c = workedEarly.use("Agent", { description: "Fable A1: architecture critic", model: "fable", prompt: "TASK: judge the approach" });
    work(workedEarly);
    workedEarly.result(c, framed(five()));
    const opts = { units: ["lib/slug.mjs"] };
    return all(
      expectNone(G.architectureProblems(work(plan(arch(session()))).parsed(), opts)),
      expectSome(G.architectureProblems(work(plan(session())).parsed(), opts), /no architecture critic ran, though the card's trigger holds/),
      expectSome(G.architectureProblems(work(parallel).parsed(), opts), /1 plan critic or worker brief\(s\) written before the architecture critic returned/),
      expectNone(G.architectureProblems(work(plan(scouted)).parsed(), opts)),
      expectSome(G.architectureProblems(plan(workedEarly).parsed(), opts), /1 plan critic or worker brief\(s\) written before the architecture critic returned/),
      expectSome(G.criticPairProblems(work(arch(session())).parsed()), /the architecture critic ran and no plan critic did/),
      expectNone(G.criticPairProblems(work(plan(arch(session()))).parsed())),
      expectNone(G.criticPairProblems(work(plan(session())).parsed())),
      expectSome(G.architectureProblems(session().claude("Fable A1: architecture critic", "fable", "TASK").parsed(), opts), /never returned/),
    );
  });

// --------------------------------------------------------------- the answer

test("one paragraph per phase, and no update turns an unverified return into success",
  "D13 (F16: a paragraph after every return was fourteen a run): the count is the coordinator's root texts after \"go\"",
  () => {
    const three = session().say("Opus W1 wrote the helper; the suite is pending.").say("Codex Terra C1 ran node --test: 5 of 5.").say("Done.").parsed();
    const six = session().say("a").say("b").say("c").say("d").say("e").say("f").parsed();
    const claim = session().say("The helper works.").parsed();
    return all(
      expectNone(G.phaseProblems(three, { max: 4, receipts: ["node --test"] })),
      expectSome(G.phaseProblems(six, { max: 4 }), /6 paragraphs/),
      expectSome(G.phaseProblems(claim, { max: 4 }), /claims success with no receipt/),
      // The answer's own claims are the final lint's: reported once, not also as an update.
      expectNone(G.phaseProblems(claim, { max: 4, finalText: "The helper works." })),
    );
  });

test("the draft's read: the verifier's thread or a final reader reads the linted draft by its path, at most twice; nothing writes it after; what went out is that file, or after a second read that file and an Open: list quoting the reader",
  "the answer page (#15 F4: three answers changed after their critic read them; 2026-10-09: a shorter text went out unread): the gate takes the draft's path and the read's time from the message that starts the read",
  () => {
    const dir = fs.mkdtempSync(path.join(TMP, "read-"));
    const draft = path.join(dir, "draft.md");
    const answer = "Opus W1 added the helper; Opus V1 ran node --test: 5 of 5.\n";
    fs.writeFileSync(draft, answer);
    const lint = (s) => s.bash(`node "/p/skills/orchestrate/scripts/lint-draft.mjs" --agents "Opus W1, Opus V1" --receipts ${dir}/v1.jsonl ${draft}`, `WORDS=12\nSHA256=${"a".repeat(64)}\nHITS=0`);
    // A Claude verifier, its thread continued by SendMessage to the agentId its first result names.
    const verifier = (s) => {
      const id = s.use("Agent", { description: "Opus V1: verifier", model: "opus", prompt: "You are the verifier. TASK: run the suite on the combined tree." });
      s.result(id, [{ type: "text", text: `${FRAME}${five().split("\n").map((l) => `  ${l}`).join("\n")}\nagentId: a23ff0b7ba0739d2e (use SendMessage)` }]);
      return id;
    };
    const read = (s, id, verdict = five({ result: "Opus V1: every claim backed by a raw artifact; nothing unanswered." })) => {
      s.result(s.use("SendMessage", { to: "a23ff0b7ba0739d2e", message: `Read the draft ${draft} against the request, by the answer page's protocol.` }), "Resuming agent");
      if (verdict) s.sub(id, verdict);
      return s;
    };
    const run = (more = () => {}) => { const s = session(); const id = verifier(s); lint(s); read(s, id); more(s, id); return s; };
    const check = (s, finalText = answer) => G.draftReadProblems(s.done(finalText).parsed(), { finalText });
    const reader = (s) => s.claude("Opus R1: final reader", "opus", `You are the final reader. The request, the draft ${draft} and the artifacts.`, five());
    // A Codex verifier continued with RESUME: on its next report path.
    const REPORTS = { "/d/run/C1-2/report.json": { answerJson: { status: "done", result: "Terra C1: every claim backed.", evidence: [], artifacts: [], open: [] }, answer: "" } };
    const codex = lint(session().newAgent("/d/run/C1/report.json", "MODEL: terra\nTASK: run the suite.").codex("Codex Terra C1: verifier", "/d/run/C1/report.json"))
      .newAgent("/d/run/C1-2/report.json", `RESUME: /d/run/C1/report.json\nMODEL: terra\nTASK: read the draft ${draft} against the request.`)
      .codex("Codex Terra C1-2: read the draft", "/d/run/C1-2/report.json");
    const gap = "the empty title is not tested";
    const twice = (item, second = five({ result: `Opus V1: one request item unanswered: ${gap}.` })) => {
      const s = session(); const id = verifier(s); lint(s); read(s, id, five({ status: "partial" }));
      s.result(s.use("Write", { file_path: draft, content: answer }), "ok");
      lint(s); read(s, id, second);
      return check(s, `${answer}\nOpen:\n- ${item}\n`);
    };
    return all(
      expectNone(check(run())),
      // S2 (probe, 2026-11-22): the verifier's brief names no role in its description; read as the plan critic,
      // its continued read of the draft was not found.
      expectNone(check((() => {
        const s = session();
        const id = s.use("Agent", { description: "Opus V1: check the tree", model: "opus", prompt: VERIFIER_TEXT });
        s.result(id, [{ type: "text", text: `${FRAME}${five().split("\n").map((l) => `  ${l}`).join("\n")}\nagentId: a23ff0b7ba0739d2e (use SendMessage)` }]);
        lint(s);
        return read(s, id);
      })())),
      expectNone(check(reader(lint(session())))),
      expectNone(G.draftReadProblems(codex.done(answer).parsed(), { finalText: answer, reportOf: (p) => REPORTS[p] ?? null })),
      expectNone(check(reader(lint(session().claude("Fable A1: architecture critic", "fable", "TASK", five()))))),
      expectSome(check((() => { const s = session().claude("Fable A1: architecture critic", "fable", "TASK", five()); const id = verifier(s); lint(s); return read(s, id); })()),
        /an architecture critic ran, and the draft was read by the verifier's thread, not by a final reader/),
      expectSome(check((() => { const s = session(); verifier(s); return lint(s); })()), /neither the verifier's thread nor a final reader read a linted draft/),
      expectSome(check((() => { const s = session(); const id = verifier(s); return read(s, id); })()), /neither the verifier's thread nor a final reader read a linted draft/),
      expectSome(check(run((s) => s.result(s.use("Edit", { file_path: draft, old_string: "a", new_string: "b" }), "ok"))), /was written after its read/),
      expectSome(check(run((s) => s.bash(`printf 'more\\n' >> ${draft}`))), /was written after its read/),
      expectSome(check(run(), `${answer}One more claim added after the read.`), /not the draft that was read; it departs from it at/),
      expectSome(check(run(), `${answer}\nOpen:\n- ${gap}\n`), /appends an Open: list to a draft read once/),
      expectNone(twice(gap)),
      expectSome(twice("a gap nobody returned"), /does not quote a gap the reader returned: "- a gap nobody returned"/),
      expectSome((() => { const s = session(); const id = verifier(s); lint(s); read(s, id); lint(s); read(s, id); lint(s); read(s, id); return check(s); })(), /3 reads of one answer, and it gets two at most/),
      expectSome((() => { const s = session(); const id = verifier(s); lint(s); read(s, id, null); return check(s); })(), /the last read of the draft never returned/),
    );
  });

test("the draft was linted before its read, the last lint passed, and nothing changed the draft between them",
  "the answer page lints the draft last and then starts its read; a lint after the read, one left failing, or an edit between them is the order the page forbids",
  () => {
    const dir = fs.mkdtempSync(path.join(TMP, "lint-"));
    const draft = path.join(dir, "draft.md");
    fs.writeFileSync(draft, "Opus W1 added the helper.\n");
    const lint = (s, hits) => s.bash(`node "/p/skills/orchestrate/scripts/lint-draft.mjs" --agents "Opus W1" ${draft}`, `WORDS=12\nSHA256=${"a".repeat(64)}\nHITS=${hits}`);
    const reader = (s) => s.claude("Opus K1: final reader", "opus", `You are the final reader. The draft: ${draft}`, five());
    const echoed = (s) => s.bash(`node "/p/lint-draft.mjs" ${draft}; echo "LINT_EXIT=$?"`, `WORDS=12\nSHA256=${"a".repeat(64)}\nHITS=0\nLINT_EXIT=0`);
    const echoedRed = (s) => s.bash(`node "/p/lint-draft.mjs" ${draft}; echo "LINT_EXIT=$?"`, "LINT=path: 1: x\nWORDS=12\nHITS=1\nLINT_EXIT=1");
    const runner = (s) => s.bash(`node /p/capture-check.mjs --label "any label" -- 'node /p/lint-draft.mjs ${draft}'`, "LABEL=any label\nLOG=/t/x.log\nLINES=3\nBYTES=90\nWORDS=12\nSHA256=x\nEXIT=0");
    const edited = (s) => { s.result(s.use("Write", { file_path: draft, content: "x" }), "ok"); return s; };
    return all(
      expectNone(G.lintCallProblems(reader(lint(session(), 0)).parsed())),
      // Measured on the rerun of 2026-09-28: HITS=0 and then the coordinator's own LINT_EXIT=0 line.
      expectNone(G.lintCallProblems(reader(echoed(session())).parsed())),
      expectSome(G.lintCallProblems(reader(echoedRed(session())).parsed()), /did not pass/),
      expectNone(G.lintCallProblems(reader(runner(session())).parsed())),
      G.receiptsFrom(echoed(session()).parsed()).includes("linter") || "an echoed clean lint is no receipt",
      !G.receiptsFrom(echoedRed(session()).parsed()).includes("linter") || "an echoed red lint became a receipt",
      expectSome(G.lintCallProblems(lint(reader(session()), 0).parsed()), /no read of the draft by the verifier's thread or a final reader followed its lint/),
      expectSome(G.lintCallProblems(reader(session()).parsed()), /the draft was never linted before its read/),
      expectSome(G.lintCallProblems(reader(lint(session(), 2)).parsed()), /did not pass/),
      expectSome(G.lintCallProblems(reader(edited(lint(session(), 0))).parsed()), /the draft changed between its last lint and its read/),
    );
  });

test("every return admitted in five fields before the synthesis; a malformed one repaired or named; the answer names only agents that ran",
  "D15 (F20a, F20b): a Codex prompt with no schema, a Claude prose return and an invented attribution are each a failure the gate names by agent",
  () => {
    const prompts = [{ id: "C1", text: `MODEL: terra\nOUTPUT_SCHEMA: ${SCHEMA_PATH}\nTASK: x` }];
    const reports = [{ id: "C1", report: { answerJson: { status: "done", result: "Terra C1: done", evidence: [], artifacts: [], open: [] } } }];
    const good = session().claude("Opus W1: write", "opus", "TASK", five()).say("Opus W1 wrote it; Codex Terra C1 checked it.").parsed();
    const prose = session().claude("Opus W1: write", "opus", "TASK", "I wrote the helper and it works.").say("done").parsed();
    const repaired = session().claude("Opus W1: write", "opus", "TASK", "I wrote it.").claude("Opus W1: the five fields, please", "opus", "Return the five fields", five()).say("done").parsed();
    return all(
      expectNone(G.fiveFieldProblems(good, { schema: SCHEMA, prompts, reports, finalText: "Opus W1 wrote it." })),
      expectSome(G.fiveFieldProblems(good, { schema: SCHEMA, prompts: [{ id: "C1", text: "MODEL: terra\nTASK: x" }] }), /C1's prompt declares no OUTPUT_SCHEMA/),
      expectSome(G.fiveFieldProblems(good, { schema: SCHEMA, reports: [{ id: "C1", report: { answerJson: { status: "ok" } } }] }), /C1: \$\.status is "ok"/),
      expectSome(G.fiveFieldProblems(prose, { schema: SCHEMA }), /Opus W1: write's return does not parse/),
      expectNone(G.fiveFieldProblems(repaired, { schema: SCHEMA })),
      expectNone(G.fiveFieldProblems(session().claude("Opus W1: write", "opus", "TASK", "prose").claude("Opus W1: again", "opus", "the five fields", "prose again").say("done").parsed(),
        { schema: SCHEMA, finalText: "Opus W1's result is unknown: its return never parsed." })),
      expectSome(G.fiveFieldProblems(prose, { schema: SCHEMA, finalText: "Opus W1's result is unknown." }), /does not parse/),
      expectSome(G.fiveFieldProblems(good, { schema: SCHEMA, finalText: "Opus W1 wrote it and Sonnet S4 reviewed it." }), /names Sonnet S4, an agent that never ran/),
      expectSome(G.fiveFieldProblems(session().claude("Opus K1: final reader", "opus", "You are the final reader.", "Verdict: done. Nothing missing.").say("done").parsed(), { schema: SCHEMA }),
        /Opus K1: final reader's return does not parse/),
    );
  });

test("a per-run OUTPUT_SCHEMA copy equal to the shipped schema apart from its caps is accepted, and its own caps validate the return",
  "decision 13: the codex page prescribes a per-run copy to change the caps; a gate that took only the shipped path failed that copy, and one that ignored its caps would pass a return the driver cut",
  () => {
    const copy = path.join(TMP, "five-fields.caps-10.json");
    const capped = JSON.parse(JSON.stringify(SCHEMA));
    capped.properties.result.maxLength = 10;
    fs.writeFileSync(copy, JSON.stringify(capped));
    const other = path.join(TMP, "five-fields.extra.json");
    const extra = JSON.parse(JSON.stringify(SCHEMA));
    extra.properties.verdict = { type: "string" };
    fs.writeFileSync(other, JSON.stringify(extra));
    const s = session().say("done").parsed();
    const prompt = (f) => [{ id: "C1", text: `MODEL: terra\nOUTPUT_SCHEMA: ${f}\nTASK: x` }];
    const report = (result) => [{ id: "C1", report: { answerJson: { status: "done", result, evidence: [], artifacts: [], open: [] } } }];
    return all(
      expectNone(G.fiveFieldProblems(s, { schema: SCHEMA, prompts: prompt(copy), reports: report("short") })),
      expectSome(G.fiveFieldProblems(s, { schema: SCHEMA, prompts: prompt(copy), reports: report("longer than ten") }), /C1: \$\.result is 15 characters, over 10/),
      expectSome(G.fiveFieldProblems(s, { schema: SCHEMA, prompts: prompt(other), reports: report("short") }), /is not the shipped five-field schema apart from its caps/),
      expectNone(G.advisorPromptProblems([`MODEL: astra\nOUTPUT_SCHEMA: ${copy}\nTASK: x`], { shipped: SCHEMA })),
      expectSome(G.advisorPromptProblems([`MODEL: astra\nOUTPUT_SCHEMA: ${other}\nTASK: x`], { shipped: SCHEMA }), /does not name the five-field schema/),
    );
  });

test("inline reads are priced as bytes times the calls after them",
  "D7/D8 (F9, F21): the page prices inline work, and the gate measures it",
  () => {
    const forty = Array.from({ length: 40 }, (_, i) => `ok ${i}`).join("\n");
    const s = session().bash("git log --oneline", forty).bash("ls", "a").bash("wc -l lib/a.mjs", "1 lib/a.mjs").parsed();
    const c = G.inlineCost(s);
    const first = c.rows[0];
    return first.later === 2 && first.cost === Buffer.byteLength(forty) * 2 || `the first read is priced ${JSON.stringify(first)}`;
  });

test("the coordinator edits nothing in the working tree and runs no check itself, through the runner or not",
  "the orchestrate page's contract: the coordinator never edits the tree and never runs the project's checks, which its workers and its verifier run (#15 F9: the floods were checks a coordinator ran)",
  () => {
    const cwd = fs.mkdtempSync(path.join(TMP, "coordinator-"));
    const card = path.join(TMP, "card.md");
    const write = (s, name, file, parent = null) => { s.result(s.use(name, { file_path: file, content: "x" }, parent), "ok", { parent }); return s; };
    const good = write(session().bash("git status --short", "").bash("grep -l fmt lib", "lib/a.mjs"), "Write", card)
      .bash(`node /p/lint-draft.mjs ${card}`, "HITS=0");
    const worker = session();
    write(worker, "Edit", path.join(cwd, "lib", "a.mjs"), worker.use("Agent", { description: "Opus W1: edit", model: "opus", prompt: "TASK" }));
    return all(
      expectNone(G.coordinatorProblems(good.parsed(), { cwd })),
      expectNone(G.coordinatorProblems(worker.parsed(), { cwd })),
      expectSome(G.coordinatorProblems(write(session(), "Edit", path.join(cwd, "lib", "a.mjs")).parsed(), { cwd }), /the coordinator wrote lib\/a\.mjs in the working tree itself \(Edit\)/),
      expectSome(G.coordinatorProblems(write(session(), "Write", "lib/b.mjs").parsed(), { cwd }), /the coordinator wrote lib\/b\.mjs in the working tree itself \(Write\)/),
      expectSome(G.coordinatorProblems(session().bash("node --test", "ok 1").parsed(), { cwd }), /the coordinator ran a check itself: "node --test"/),
      expectSome(G.coordinatorProblems(session().bash("node /p/capture-check.mjs --label suite -- 'node --test'", "LABEL=suite\nEXIT=0").parsed()), /the coordinator ran a check itself/),
    );
  });

test("a brief that asks for a check names the runner",
  "D7 (09 amendment): the floods #15 counted include Claude subagents', and the Codex exclusion rested on an unmeasured guess",
  () => all(
    expectNone(G.runnerBriefProblems([{ id: "C1", text: "CHECK: node /p/capture-check.mjs --label suite -- 'node --test'" }])),
    expectSome(G.runnerBriefProblems([{ id: "W1", text: "CHECK: node --test passes" }]), /W1's brief asks for a check and does not name the runner/),
  ));

test("a write agent's prompt carries an ENVIRONMENT: line that says something, and the paths it names exist",
  "D4 (F11, F19): the half of the capsule the driver cannot compute is a line the plan fills, and a placeholder fills nothing",
  () => all(
    expectNone(G.environmentProblems("MODEL: sol\nTASK: x")),
    expectNone(G.environmentProblems(`RIGHTS: write /r\nTASK: x\nENVIRONMENT: nothing staged; node --test needs no daemon; the diff is ${TMP}`)),
    expectSome(G.environmentProblems("RIGHTS: write /r\nTASK: x"), /no ENVIRONMENT: line/),
    expectSome(G.environmentProblems("RIGHTS: worktree /r\nENVIRONMENT: …"), /says nothing/),
    expectSome(G.environmentProblems("RIGHTS: write /r\nENVIRONMENT: the trunk files are staged at /tmp/nowhere-9f3/trunk"), /names \/tmp\/nowhere-9f3\/trunk, which does not exist/),
  ));

test("the capsule against a staged fixture: every staged input named, every daemon tool named with what to run instead",
  "D4 (09 amendment): presence is not content; the capsule must carry what the run staged and the alternative to a tool that crashes in the sandbox",
  () => {
    const diff = path.join(TMP, "stage", "change.diff");
    fs.mkdirSync(path.dirname(diff), { recursive: true });
    fs.writeFileSync(diff, "diff\n");
    const fixture = { staged: [diff], tools: [{ name: "vcs", instead: "git diff" }] };
    const good = `RIGHTS: write /r\nTASK: x\nENVIRONMENT: the change is staged at ${diff}; vcs needs its daemon here, so run git diff instead`;
    return all(
      expectNone(G.environmentProblems(good, fixture)),
      expectSome(G.environmentProblems(good.replace(`at ${diff}`, "in the temporary directory"), fixture), /does not name the staged/),
      expectSome(G.environmentProblems(good.replace("vcs needs its daemon here, so run git diff instead", "no daemon"), fixture), /does not name vcs/),
      expectSome(G.environmentProblems(good.replace("so run git diff instead", "so avoid it"), fixture), /names vcs without what to run instead \(git diff\)/),
    );
  });

test("writes against the plan: each agent's writes inside its row's writes column, the temporary directory everyone's",
  "D6 (09 amendment): reconciling launches is not reconciling writes; an agent registered to write nothing that wrote a file is out of scope",
  () => {
    const cwd = fs.mkdtempSync(path.join(TMP, "tree-"));
    const rows = G.planRecord(`W1 | opus | implementer | live tree | 1\nR1 | sonnet | reviewer | nothing | 1\nW2 | opus | implementer | write ${path.join(cwd, "lib")} | 1\nC1 | sol | implementer | worktree | 1`);
    const s = session();
    const agent = (desc, model, files) => {
      const id = s.use("Agent", { description: desc, model, prompt: "TASK" });
      for (const f of files) s.result(s.use("Write", { file_path: f, content: "x" }, id), "ok", { parent: id });
      s.result(id, framed(five()));
    };
    agent("Opus W1: write", "opus", [path.join(cwd, "lib", "a.mjs"), path.join(TMP, "scratch.txt")]);
    agent("Sonnet R1: review", "sonnet", [path.join(TMP, "notes.md")]);
    agent("Opus W2: write lib", "opus", [path.join(cwd, "lib", "b.mjs")]);
    const good = s.parsed();
    const reports = [{ id: "C1", report: { filesTouched: [path.join(cwd, ".claude", "worktrees", "c1", "lib", "c.mjs")] } }];
    const ok = G.writesProblems({ s: good, rows, reports, cwd, tmp: [TMP] });
    agent("Sonnet R1: review again", "sonnet", [path.join(cwd, "lib", "a.mjs")]);
    agent("Opus W2: tests", "opus", [path.join(cwd, "test", "b.test.mjs")]);
    const bad = G.writesProblems({ s: s.parsed(), rows, reports: [{ id: "C1", report: { filesTouched: [path.join(cwd, "lib", "c.mjs")] } }], cwd, tmp: [TMP] });
    return all(
      expectNone(ok),
      expectSome(bad, /R1 wrote lib\/a\.mjs, outside its row's writes \(nothing\)/),
      expectSome(bad, /W2 wrote test\/b\.test\.mjs, outside its row's writes/),
      expectSome(bad, /C1 wrote lib\/c\.mjs, outside its row's writes \(worktree\)/),
    );
  });

test("each claim in the answer is held by the return of the agent it credits: a misattributed fact and an unsupported one are red",
  "D14 (09 amendment): a receipt label or an agent's name is not an origin; the fact has to be in that agent's admitted return",
  () => {
    const s = session()
      .claude("Opus W1: write", "opus", "TASK", five({ result: "Opus W1: done, wrote lib/slug.mjs and test/slug.test.mjs.", evidence: ["ran `node --test`: 14 of 14"] }))
      .newAgent("/d/run/C1/report.json", "MODEL: terra\nTASK: x")
      .codex("Codex Terra C1: check", "/d/run/C1/report.json").parsed();
    const reports = [{ id: "C1", report: { answerJson: { status: "done", result: "Terra C1: done, 5 of 5 in test/slug.test.mjs.", evidence: [], artifacts: [], open: [] } } }];
    return all(
      expectNone(G.claimOriginProblems(s, { reports, finalText: "Opus W1 wrote lib/slug.mjs; Codex Terra C1 ran the suite: 5 of 5." })),
      expectSome(G.claimOriginProblems(s, { reports, finalText: "Codex Terra C1 ran `node --test`: 14 of 14." }), /credits Terra C1 with node --test, which only opus w1's return holds/),
      expectSome(G.claimOriginProblems(s, { reports, finalText: "Opus W1 fixed lib/other.mjs." }), /credits Opus W1 with lib\/other\.mjs, which no admitted return holds/),
      // What a Codex agent read is part of its return: case 5's verifier compared the change with `greet`.
      expectNone(G.claimOriginProblems(s, { reports: [{ id: "C1", report: { ...reports[0].report, commands: [{ command: "nl -ba lib/greet.mjs", exitCode: 0 }] } }],
        finalText: "Codex Terra C1 checked the change against the style of `greet`." })),
      // E60: a list whose items end "(Model id)" with no period; the stretch after a mention ends at its line,
      // so the next item's fact is not credited to it (case 7, 2026-09-28: four such problems on a correct answer).
      expectNone(G.claimOriginProblems(s, { reports, finalText: "- `lib/slug.mjs`: the helper (Opus W1)\n- 5 of 5 in the suite (Codex Terra C1)\n- the rest" })),
    );
  });

test("the advisor's prompts: MODEL: astra, the shipped schema, no EFFORT:, every continuation on the first thread",
  "D2 (F12c): the advisor's prompt the judge named carried an EFFORT line and no schema; the page text alone does not check the brief",
  () => {
    const first = `MODEL: astra\nOUTPUT_SCHEMA: ${SCHEMA_PATH}\nTASK: which split?`;
    const next = `RESUME: thread-1\n${first}`;
    return all(
      expectNone(G.advisorPromptProblems([first, next], { threadId: "thread-1" })),
      expectSome(G.advisorPromptProblems([`${first}\nEFFORT: high`], {}), /carries an EFFORT: line/),
      expectSome(G.advisorPromptProblems(["MODEL: astra\nTASK: x"], {}), /does not name the five-field schema/),
      expectSome(G.advisorPromptProblems([first, first], { threadId: "thread-1" }), /opens a new thread/),
      expectSome(G.advisorPromptProblems([first, `RESUME: thread-2\n${first}`], { threadId: "thread-1" }), /continues thread-2, not the first thread thread-1/),
    );
  });

test("activation: the expansion is read from the session file, a refused Skill call is recorded, and the first action is named",
  "D18 (P14a): whether a slash command activated is a fact of the session file, never of the model's own account",
  () => {
    const transcript = [
      { type: "user", message: { content: "<command-message>entrust:orchestrate</command-message>\n<command-name>/entrust:orchestrate</command-name>" } },
      { type: "user", isMeta: true, message: { content: [{ type: "text", text: "Base directory for this skill: /p/skills/orchestrate\n\nPlan from codex-composition.md…\n\n## Your own hands" }] } },
    ].map((r) => JSON.stringify(r)).join("\n");
    const s = session();
    s.result(s.use("Skill", { skill: "entrust:orchestrate" }), "Skill entrust:orchestrate cannot be used with Skill tool due to disable-model-invocation", { isError: true });
    const refused = G.activationRecord({ transcript: "", stream: s.parsed(), skill: "orchestrate" });
    const active = G.activationRecord({ transcript, stream: session().bash("ls").parsed(), skill: "orchestrate" });
    return all(
      active.expanded && active.command && active.firstAction === "Bash" || `the expansion was not read: ${JSON.stringify(active)}`,
      !refused.expanded && refused.refusals.length === 1 && refused.skillCalls[0] === "entrust:orchestrate" || `the refusal was not recorded: ${JSON.stringify(refused)}`,
    );
  });

test("receipts: a Codex command that exited 0, unwrapped from its shell, and a backquoted command in a Claude agent's evidence",
  "D14: a success claim cites a receipt; the gate builds the receipts from what the agents ran, not from what the answer says",
  () => {
    const s = session().claude("Opus V1: verify", "opus", "TASK", five({ evidence: ["ran `node --test --test-reporter=tap`: 5 passed"] })).parsed();
    const r = G.receiptsFrom(s, { reports: [{ commands: [{ command: "/bin/zsh -lc 'node --test'", exitCode: 0 }, { command: "/bin/zsh -lc 'npm run lint'", exitCode: 1 }] }], ledger: ["slug exported"] });
    return all(
      r.includes("node --test") || `no unwrapped command: ${JSON.stringify(r)}`,
      !r.includes("npm run lint") || "a failed command became a receipt",
      r.includes("node --test --test-reporter=tap") && r.includes("slug exported") || `receipts ${JSON.stringify(r)}`,
      JSON.stringify(G.agentsThatRan(session().codex("Codex Terra C1: run", "/d/r/C1/report.json").claude("Opus K1: critic", "opus", "x", five()).parsed())) === '["Codex Terra C1","Opus K1"]' || "agentsThatRan",
      // Measured on the live gate's case 5, 2026-09-28: a runner call inside a double-quoted shell command,
      // its label escaped, read as the receipt `"suite`; and the coordinator's clean lint was no receipt.
      (() => {
        const q = G.receiptsFrom(session().parsed(), { reports: [{ commands: [{ command: '/bin/zsh -lc "node \\"/p/capture-check.mjs\\" --label \\"suite passes\\" --ledger /t/l.jsonl -- \'node --test\'"', exitCode: 0 }] }] });
        return q.includes("suite passes") && !q.some((x) => x.startsWith('\\"')) || `escaped label read as ${JSON.stringify(q)}`;
      })(),
      G.receiptsFrom(session().bash("node /p/lint-draft.mjs /t/draft.md", "WORDS=3\nSHA256=x\nHITS=0").parsed()).includes("linter") || "a clean lint is no receipt",
      !G.receiptsFrom(session().bash("node /p/lint-draft.mjs /t/draft.md", "LINT=path: 1: x\nHITS=1").parsed()).includes("linter") || "a red lint became a receipt",
    );
  });

// --------------------------------------------------------------- a run, whole

test("one coherent good run passes every check at once, the pre-fix shape of the same run fails the ones it should, and a coordinator that edits or checks is red",
  "checks that no run could satisfy together would fail every live run, a composite that stays green on the old shape would be measuring nothing, and the coordinator's contract holds only if breaking it turns the run red",
  () => {
    const dir = fs.mkdtempSync(path.join(TMP, "run-"));
    const scope = fs.mkdtempSync(path.join(TMP, "scope-"));
    const runner = "/p/skills/orchestrate/scripts/capture-check.mjs";
    const request = "/entrust:orchestrate TASK: add a slug(title) helper with a test. CHECK: node --test passes. RETURN: the files and the test count.";
    const answer = "Fable A1 kept the approach and Opus P1 found the plan sound. Opus W1 added the slug helper and its test, and Codex Terra C1 ran node --test on them: 5 of 5. Opus K1 read this answer against the request and found nothing missing.\n";
    const draft = path.join(scope, "draft.md");
    fs.writeFileSync(draft, answer);
    const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
    const rows = G.planRecord("A1 | fable | architecture critic | nothing | 0\nP1 | opus | plan critic | nothing | 0\nW1 | opus | worker | live tree | 40000\nC1 | terra | verifier | nothing | 0\nK1 | opus | final reader | nothing | 0");
    const c1 = `MODEL: terra\nOUTPUT_SCHEMA: ${SCHEMA_PATH}\nTASK: you are the verifier; check the slug helper.\nCHECK: node ${runner} --label suite -- 'node --test'\nRETURN: the five fields.`;
    const s1 = session().skill("entrust:codex").plan("/d/run", "W1 | opus | worker | live tree | 40000").say(CARD).parsed();
    const planCritic = (s) => s.claude("Opus P1: plan critic", "opus", "You are the plan critic. TASK: judge the plan.", five({ result: "Opus P1: sound, no objections." }));
    const run = (breach = (s) => s, critics = planCritic) => breach(critics(session()
      .claude("Fable A1: architecture critic", "fable", "You are the architecture critic. TASK: judge the approach, a new lib/slug.mjs.", five({ result: "Fable A1: keep." })))
      .claude("Opus W1: write the slug helper", "opus", `TASK: write lib/slug.mjs and test/slug.test.mjs.\nCHECK: node ${runner} --label suite -- 'node --test'\nRETURN: the five fields.`,
        five({ evidence: ["ran `node --test` through the runner: EXIT=0, 5 of 5"] }), [path.join(dir, "lib", "slug.mjs"), path.join(dir, "test", "slug.test.mjs")])
      .newAgent("/d/run/C1/report.json", c1)
      .codex("Codex Terra C1: verifier", "/d/run/C1/report.json"))
      .say("Opus W1 wrote the helper, and Codex Terra C1 ran node --test on it: 5 of 5.")
      .bash(`node /p/skills/orchestrate/scripts/lint-draft.mjs --agents "Fable A1, Opus P1, Opus W1, Codex Terra C1, Opus K1" ${draft}`, `WORDS=40\nSHA256=${sha(answer)}\nHITS=0`)
      .claude("Opus K1: final reader", "opus", `You are the final reader. The request, the draft ${draft} and the artifacts.`,
        five({ result: "Opus K1: done, every claim backed by a raw artifact, nothing unanswered.", evidence: ["read the draft whole"] }))
      .done(answer).parsed();
    const reports = [{ id: "C1", report: { answerJson: { status: "done", result: "Terra C1: done, 5 of 5.", evidence: ["node --test: EXIT=0"], artifacts: [], open: [] },
      commands: [{ command: `/bin/zsh -lc "node ${runner} --label suite -- 'node --test'"`, exitCode: 0 }] } }];
    const inputs = { s1, prompts: [{ id: "C1", text: c1 }], reports, rows, schema: SCHEMA, request, phases: 4, cwd: dir, tmp: [TMP], architecture: { units: ["lib/slug.mjs"] } };
    const ok = G.runProblems({ ...inputs, s2: run() });
    const edited = G.runProblems({ ...inputs, s2: run((s) => { s.result(s.use("Edit", { file_path: path.join(dir, "lib", "slug.mjs"), old_string: "a", new_string: "b" }), "ok"); return s; }) }).problems;
    const checked = G.runProblems({ ...inputs, s2: run((s) => s.bash(`node ${runner} --label suite -- 'node --test'`, "LABEL=suite\nEXIT=0")) }).problems;
    // Probe P1: the architecture critic ran and the plan critic was skipped, in a case that asserts no trigger.
    const unpaired = G.runProblems({ ...inputs, architecture: null, s2: run(undefined, (s) => s) }).problems;
    // The same run the way the saved pre-fix sessions ran it: no critics, no lint, no read, a bare suite and prose.
    const old = session()
      .claude("Opus W1: write the slug helper", "opus", "TASK: write lib/slug.mjs.\nCHECK: node --test passes.", "I wrote it and it works.", [path.join(dir, "lib", "slug.mjs")])
      .claude("Opus K1: a look at the tests", "opus", "TASK: look at the tests.", five(), [path.join(dir, "test", "slug.test.mjs")])
      .bash("node --test", Array.from({ length: 30 }, (_, i) => `ok ${i}`).join("\n"))
      .claude("Opus K1: completeness critic", "opus", "You are the completeness critic.", five())
      .done("Done: the tests passed, see /Users/me/scratch/lib/slug.mjs.").parsed();
    const bad = G.runProblems({ ...inputs, s2: old, reports: [] }).problems;
    const want = [/neither the verifier's thread nor a final reader read a linted draft/, /the draft was never linted before its read/,
      /the coordinator ran a check itself: "node --test"/, /W1's brief asks for a check/, /no architecture critic ran/,
      /does not parse into the five fields/, /lints red, path/, /lints red, unsupported-success/, /C1 is registered, never ran/,
      /K1 wrote test\/slug\.test\.mjs, outside its row's writes \(nothing\)/];
    const missed = want.filter((re) => !bad.some((p) => re.test(p)));
    return all(
      ok.problems.length === 0 || `the good run failed: ${ok.problems.join("; ")}`,
      missed.length === 0 || `the pre-fix run passed ${missed.join(", ")}: ${JSON.stringify(bad)}`,
      expectSome(edited, /the coordinator wrote lib\/slug\.mjs in the working tree itself \(Edit\)/),
      expectSome(checked, /the coordinator ran a check itself/),
      expectSome(unpaired, /the architecture critic ran and no plan critic did/),
    );
  });

const failed = await runCases(CASES);
process.exit(summarize(failed, CASES.length));
