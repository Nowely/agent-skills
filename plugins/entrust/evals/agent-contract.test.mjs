#!/usr/bin/env node
// Does the page a coordinator launches an agent from still describe the driver it launches?
//
//   node evals/agent-contract.test.mjs
//
// The shipped agent, agents/proxy.md, is a mechanical wrapper: the coordinator writes the prompt and
// hands the wrapper the one command, which runs the driver through scripts/agent-run.mjs in one foreground
// Bash call. The call, its block and the accept are the shared call page's, orchestrate/references/external.md,
// for every adapter; the Codex field table is codex/SKILL.md's. This suite compares what a coordinator copies
// or a tool reads off those pages with the driver and the launcher they describe: the field table, the command
// lines, the placeholders, the block against the agent file, the wrapper's frontmatter and the flags --help
// offers. What the pages say in prose is not pinned sentence by sentence.

import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { DRIVER, FIELDS, LAUNCHER_CORE, ROOT, PROMPT_FIELDS, registry, runCases, summarize, tempDir } from "./lib/harness.mjs";
import { ACCEPTED, PROMPT_WAIT_MS, TAKEN } from "../plugin/skills/orchestrate/scripts/agent-run.mjs";

const SKILL = path.join(ROOT, "skills", "codex", "SKILL.md");
const EXTERNAL = path.join(ROOT, "skills", "orchestrate", "references", "external.md");
const PROXY_AGENT = path.join(ROOT, "agents", "proxy.md");
const ORCHESTRATE = path.join(ROOT, "skills", "codex", "references", "orchestration.md");
// The orchestrate references a coordinator opens at a moment of the run; approvals.md holds its approval rule.
const ORCHESTRATE_REFS = [ORCHESTRATE];
const APPROVALS_MD = path.join(ROOT, "skills", "codex", "references", "approvals.md");

const skill = fs.readFileSync(SKILL, "utf8");
const orchestrate = fs.readFileSync(ORCHESTRATE, "utf8");
const approvals = fs.readFileSync(APPROVALS_MD, "utf8");
const external = fs.readFileSync(EXTERNAL, "utf8");
const externalFlat = external.replace(/\s+/g, " ");
const driver = fs.readFileSync(DRIVER, "utf8");
// What the driver ADVERTISES, for the cases that ask whether a flag the page hands over still exists: a
// `case "--x":` in the source can outlive every route a caller has to it, and the help is the route.
const help = spawnSync(process.execPath, [DRIVER, "--help"], { encoding: "utf8" }).stdout ?? "";
const helpFlat = help.replace(/\s+/g, " ");

// The pages in the pieces the cases read: the Codex page collapsed for the name checks and its field table,
// and the indented command lines a coordinator copies into a Bash call off the shared call page.
const table = skill.split(/^## /m).find((s) => s.startsWith("Header fields")) ?? "";
const flat = skill.replace(/\s+/g, " ");
// A leading VAR="..." assignment is part of the line a coordinator copies: the state directory rides in
// on one, so a pattern that only matched `node "` would read the recipe as absent.
const commands = [...external.matchAll(/^ {4}((?:[A-Z_]+="[^"\n]*" )*node "[^\n]+)$/gm)].map((m) => m[1]).filter((c) => !c.includes("<<'PROMPT'"));
// The prompt call is a heredoc block, indented like the commands and ended by its own terminator line.
const promptCalls = [...external.matchAll(/^ {4}((?:[A-Z_]+="[^"\n]*" )*node "[^\n]*--new[^\n]*<<'PROMPT'\n(?:.*\n)*? {4}PROMPT)$/gm)].map((m) => m[1].replace(/^ {4}/gm, ""));
// The four numbered steps of the block the coordinator pastes into the proxy's message, and of the agent
// file's body: each step collapsed to one line, the block's command line left out.
const blockSteps = (external.split(/^The block, copied whole:$/m)[1] ?? "").split(/^(?=\S)/m)[0]
  .split("\n").filter((l) => /^ {4}\d\. /.test(l)).map((l) => l.trim());
const agentSteps = (fs.existsSync(PROXY_AGENT) ? fs.readFileSync(PROXY_AGENT, "utf8") : "")
  .split(/^(?=\d\. )/m).slice(1).map((st) => st.split(/\n\n/)[0].replace(/\s+/g, " ").trim());

const { cases: CASES, test } = registry();

// Import the driver's vocabulary so source reformatting cannot silently empty the cases' input.
const promptFields = [...PROMPT_FIELDS];
// What the table documents: the first cell of every row, which is the one place a coordinator reads a
// field name. A refused name is written `LIKE_THIS`, with no colon and never in that cell.
const documented = [...new Set([...table.matchAll(/^\| `([A-Z][A-Z_]+):` \|/gm)].map((m) => m[1]))];
// The knobs the driver parses only from the command line, out of the same table the parser reads.
const cliOnly = FIELDS.filter((f) => f.kind === "cli-only").map((f) => [f.name, f.flag]);

test("the driver's prompt-file vocabulary and its --help are both readable (the readers below are sound)",
  "every case here compares against PROMPT_FIELDS or against what --help advertises; if the import stopped resolving or --help stopped printing, the whole suite would pass vacuously",
  () => (promptFields.length >= 10 && help.length > 500)
    || `read ${promptFields.length} fields and ${help.length} bytes of --help out of the driver: ${JSON.stringify(promptFields)}`);

test("FIELDS is the one table the vocabulary derives from, and every command-line-only name is refused in a prompt file",
  "four hand-kept lists agreed only by accident: a name added to PROMPT_FIELDS alone reached parseArgs as `unknown argument: undefined`, and a bound promoted back to a header field is a knob every wrapped agent would have to size",
  () => {
    const problems = [];
    const names = FIELDS.map((f) => f.name);
    if (new Set(names).size !== names.length) problems.push("a name is listed twice");
    if (FIELDS.filter((f) => f.kind === "rights").length !== 1 || FIELDS[0].kind !== "rights")
      problems.push("RIGHTS is not the single, first rights-kind row");
    for (const f of FIELDS) {
      if (!["rights", "bool", "value", "cli-only"].includes(f.kind)) problems.push(`${f.name}: kind ${JSON.stringify(f.kind)}`);
      if (f.kind !== "rights" && !/^--[a-z-]+$/.test(f.flag ?? "")) problems.push(`${f.name}: no flag`);
    }
    const flags = FIELDS.map((f) => f.flag).filter(Boolean);
    if (new Set(flags).size !== flags.length) problems.push("two names map to one flag");
    // PROMPT_FIELDS is what the parser ADMITS; the bool and value rows are what it EMITS. A name in one
    // and not the other is exactly the shape that reached parseArgs as an undefined flag.
    const expected = FIELDS.filter((f) => f.kind !== "cli-only").map((f) => f.name);
    if (JSON.stringify(promptFields) !== JSON.stringify(expected))
      problems.push(`PROMPT_FIELDS is ${JSON.stringify(promptFields)}, not the rights, bool and value rows in table order`);
    // The refusal itself, run: the table can only say a name is command-line-only, and the parser is
    // what has to act on it.
    const dir = tempDir("codex-fields.");
    for (const [f, flag] of cliOnly) {
      const p = path.join(dir, `${f}.txt`);
      fs.writeFileSync(p, `RIGHTS: read ${dir}\n${f}: 1\nTASK: do nothing\n`);
      const r = spawnSync(process.execPath, [DRIVER, "--prompt-file", p], { encoding: "utf8", input: "" });
      if (r.status !== 2) problems.push(`${f} in a header exited ${r.status}, not 2`);
      else if (!String(r.stderr).includes(`${f} is command-line-only; pass ${flag}`))
        problems.push(`${f}'s refusal does not name ${flag}: ${String(r.stderr).trim().slice(0, 120)}`);
    }
    return problems.length === 0 || problems.join("; ");
  });

test("SKILL.md's table names every field the driver accepts, and the driver accepts every field it names",
  "a field absent from the coordinator's table is a capability it cannot use; a field the driver rejects fails the agent before any work",
  () => {
    const problems = [];
    if (!table) return "SKILL.md has no `## Header fields` section: the coordinator has no field vocabulary at all";
    if (!/the body starts at `TASK:`/.test(table)) problems.push("the section no longer says where the header ends and the body starts");
    const missing = promptFields.filter((f) => !documented.includes(f));
    if (missing.length) problems.push(`accepted by the driver, absent from the table: ${missing.join(", ")}`);
    const bogus = documented.filter((f) => !promptFields.includes(f));
    if (bogus.length) problems.push(`in the table, rejected by the driver: ${bogus.join(", ")}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the ONE call is agent-run.mjs --run with --report-file in one foreground call, the message carries the four steps, the launcher runs the driver with --prompt-file and --report-file, and every shell the page hands over parses",
  "the block is copied verbatim into the wrapper's message: a stray quote is an agent that never runs, a launch that named the driver directly would carry the redirects and the exit marker again, an `&` of its own detaches the run from the task that is supposed to own it, a second command would be a second card a native subagent does not show, the four steps in the message are what Haiku keeps (measured 2026-09-17: three of three against one of three from the agent file alone), and a launcher that read the prompt could rewrite it",
  () => {
    const scripts = [...commands, ...promptCalls];
    if (scripts.length < 2) return `expected the --new prompt call and the run, found ${scripts.length} shell snippets`;
    const problems = [];
    for (const src of scripts) {
      const r = spawnSync("bash", ["-n"], { input: src, encoding: "utf8" });
      if (r.status !== 0) problems.push(`bash -n rejected ${JSON.stringify(src.slice(0, 60))}: ${String(r.stderr).trim()}`);
    }
    const calls = commands.filter((c) => c.includes("agent-run.mjs") && !c.includes("--decide") && !c.includes("--watch"));
    if (calls.length !== 1) problems.push(`expected exactly one indented agent-run.mjs run line without --watch on the page, found ${calls.length}`);
    const call = calls[0] ?? "";
    for (const part of ["--run", '--report-file "<REPORT>"'])
      if (!call.includes(part)) problems.push(`the run does not carry ${part}: ${JSON.stringify(call)}`);
    if (call.includes("--dir")) problems.push("the run names --dir, which the launcher derives from the report path");
    for (const step of ["Write no text before it", "If its result ends with RUNNING=", "run the very same command again at once",
                        "Any other result, an empty one included, goes to step 3", "Call SubagentHandback with exactly the lines that result printed", "After the hand-back result", '"<DESCRIPTION>: report delivered"'])
      if (!externalFlat.includes(step)) problems.push(`the wrapper's message on the page lacks the step ${JSON.stringify(step)}`);
    if (call.includes("driver.mjs")) problems.push("the run names the driver directly again");
    if (/(^|[^&])&\s*$/.test(call)) problems.push("the run ends in an `&` of its own, which hides the run from the task");
    if (!/in the foreground, with timeout 600000/.test(externalFlat))
      problems.push("the page does not say the call runs in the foreground with the ten-minute timeout");
    // The launcher's own spawn: exactly the two driver flags, prompt.txt as an argument only, the
    // environment untouched. agent-run.test.mjs runs it; this reads the promise off the source.
    const launcher = fs.readFileSync(LAUNCHER_CORE, "utf8");
    if (!/\[DRIVER, "--prompt-file", promptPath, "--report-file", report, \.\.\.approvalArgs\]/.test(launcher))
      problems.push("the launcher does not spawn the driver with exactly --prompt-file, --report-file and the approval arguments");
    if (/(readFileSync|openSync|createReadStream|readFile)\([^)]*prompt/i.test(launcher)) problems.push("the launcher reads prompt.txt");
    if (!/env: process\.env/.test(launcher)) problems.push("the launcher does not pass its environment to the driver untouched");
    // And the driver has to offer exactly those two flags.
    for (const flag of ["--prompt-file", "--report-file"])
      if (!help.includes(flag)) problems.push(`--help does not offer ${flag}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the prompt goes in through --new on stdin, into a directory beside the report, and no path on the page is a $TMPDIR one",
  "a coordinator cannot expand $TMPDIR and cannot Write under the data directory, so the launcher, a subprocess handed the report path, is what makes the agent's directory; a quoted heredoc is what keeps the prompt from passing through the shell's expansion; and --report-file refuses a relative path outright",
  () => {
    const problems = [];
    if (promptCalls.length !== 1) problems.push(`expected exactly one --new heredoc call on the page, found ${promptCalls.length}`);
    if (!/--new --report-file "<REPORT>" <<'PROMPT'/.test(external)) problems.push("the --new call is gone or its heredoc is not quoted");
    for (const [label, text] of [["external.md", external], ["codex/SKILL.md", skill]]) {
      if (/mktemp/.test(text)) problems.push(`${label} still sends the coordinator to mktemp`);
      if (/\$TMPDIR\/(prompt|agent|task|report|stderr)/.test(text)) problems.push(`${label} writes a scratch path as $TMPDIR/..., which the Write and Read tools cannot expand`);
    }
    if (!externalFlat.includes("`--run` waits ten seconds for a prompt `--new` has not written yet") || PROMPT_WAIT_MS !== 10000)
      problems.push(`the page's ten-second wait and PROMPT_WAIT_MS=${PROMPT_WAIT_MS} disagree`);
    if (!helpFlat.includes("an ABSOLUTE path that does not exist yet"))
      problems.push("--help no longer promises that --report-file is absolute and unclaimed");
    return problems.length === 0 || problems.join("; ");
  });

test("one launcher path on the shared page, its <orchestrate> resolved by the Codex page's own placeholder, and no page forwards a state directory",
  "Claude Code substitutes ${CLAUDE_SKILL_DIR} inline in a skill body and exports nothing to the Bash tool, so a ${VAR:-default} is never substituted, expands to the default, and makes every plugin-installed agent fail to find its script; a reference page is read as a plain file and substitutes nothing, so the shared page names the launcher by a placeholder the adapter page resolves, and a second launcher command on an adapter page would be a second recipe to drift; the state directory is the driver's own default, so the recipe carries none",
  () => {
    const REL = "skills/codex/scripts/driver.mjs";
    if (path.relative(ROOT, DRIVER).split(path.sep).join("/") !== REL) return `the shipped layout moved: ${path.relative(ROOT, DRIVER)}`;
    const problems = [];
    const launchers = [...external.matchAll(/"([^"\n]*agent-run\.mjs)"/g)].map((m) => m[1]);
    if (launchers.length < 3) problems.push(`external.md names the launcher ${launchers.length} times, not at --new, --run and --decide`);
    for (const p of launchers)
      if (p !== "<orchestrate>/scripts/agent-run.mjs") problems.push(`external.md names the launcher as ${JSON.stringify(p)}, not "<orchestrate>/scripts/agent-run.mjs"`);
    if (/driver\.mjs/.test(external)) problems.push("external.md names a driver, which only the launcher runs");
    if (!flat.includes("`<orchestrate>` is `${CLAUDE_SKILL_DIR}/../orchestrate`"))
      problems.push("codex/SKILL.md no longer resolves <orchestrate> through its own placeholder");
    for (const f of ["scripts/agent-run.mjs", "schemas/five-fields.schema.json"])
      if (!fs.existsSync(path.join(ROOT, "skills", "codex", "..", "orchestrate", f)))
        problems.push(`${f} is not where \${CLAUDE_SKILL_DIR}/../orchestrate would resolve it`);
    for (const [label, text] of [["SKILL.md", skill], ["references/approvals.md", approvals], ["orchestrate/references/external.md", external]]) {
      if (/CLAUDE_SKILL_DIR\s*:-/.test(text))
        problems.push(`${label} writes \${CLAUDE_SKILL_DIR:-...}, which Claude Code does not substitute: the agent would run on the default, not on what the install resolved`);
      for (const p of [...text.matchAll(/"([^"\n]*driver\.mjs)"/g)].map((m) => m[1]))
        if (p !== `\${CLAUDE_SKILL_DIR}/scripts/driver.mjs`)
          problems.push(`${label} names the driver as ${JSON.stringify(p)}, not "\${CLAUDE_SKILL_DIR}/scripts/driver.mjs"`);
      if (text !== external && /^ {4}node [^\n]*agent-run\.mjs/m.test(text))
        problems.push(`${label} carries a launcher command of its own; the shared call page is the one recipe`);
      // The state directory is the driver's own default in the temporary directory; a page that still
      // forwarded Claude Code's plugin data directory would tie every run to one host.
      if (/CLAUDE_PLUGIN_DATA/.test(text)) problems.push(`${label} still names CLAUDE_PLUGIN_DATA`);
    }
    if (!fs.existsSync(path.join(ROOT, "skills", "codex", "scripts", "driver.mjs")))
      problems.push("scripts/driver.mjs is not where ${CLAUDE_SKILL_DIR} would resolve it");
    return problems.length === 0 || problems.join("; ");
  });

test("the block the coordinator pastes and the proxy agent's own steps are the same four steps",
  "the four steps in the message are what Haiku keeps (measured 2026-09-17: three of three against one of three from the agent file alone), and the agent file carries them too; two copies that drift tell the relay two different things, so they are compared word for word, the block's step 1 naming its command as `this command` where the file says `the command`",
  () => {
    if (blockSteps.length !== 4) return `the shared page's block has ${blockSteps.length} numbered steps, not 4`;
    if (agentSteps.length !== 4) return `agents/proxy.md has ${agentSteps.length} numbered steps, not 4`;
    const problems = [];
    blockSteps.forEach((step, i) => {
      const want = i === 0 ? step.replace("Run this command", "Run the command") : step;
      if (agentSteps[i] !== want) problems.push(`step ${i + 1} differs: the block says ${JSON.stringify(want)}, agents/proxy.md ${JSON.stringify(agentSteps[i])}`);
    });
    return problems.length === 0 || problems.join("; ");
  });

test("the bounds, the transport and the injection fields are refused, and no table offers them",
  "a newline in a copied value can inject a field: ATTACH uploads a file and REPORT_FILE redirects the run's whole evidence. Bounds and delivery belong to the CLI; SKILL.md must not offer refused fields as usable headers",
  () => {
    const problems = [];
    // Named by the driver's own map, so a knob quietly promoted back to a field fails here rather than in
    // a live agent: the message the refusal prints is what tells a caller to use the flag instead.
    // A count, not a number: the literal 4 went stale twice, while an empty list is the one reading that
    // would make every check below it pass having compared nothing.
    if (!cliOnly.length) problems.push("the driver's table names no command-line-only field at all");
    for (const [f, flag] of cliOnly) {
      if (promptFields.includes(f)) problems.push(`${f} is an agent field again`);
      if (documented.includes(f)) problems.push(`${f} is back in the coordinator's field table as usable`);
      if (!help.includes(flag)) problems.push(`${f} was removed as a field and ${flag} went with it`);
    }
    if (promptFields.includes("VERIFY") || /--verify\b/.test(help)) problems.push("a verifier is back: VERIFY ran an unsandboxed shell with the caller's rights");
    for (const [f, flag] of [["ATTACH", "--attach"]]) {
      if (promptFields.includes(f)) problems.push(`${f} is an agent field again`);
      if (documented.includes(f)) problems.push(`${f} is in the coordinator's field table as usable`);
      if (!help.includes(flag)) problems.push(`${flag}, the command-line route ${f} is refused in favour of, is gone from --help`);
    }
    return problems.length === 0 || problems.join("; ");
  });

test("RIGHTS is first where it appears, and a header without one is a read agent in the current directory",
  "a prompt file whose rights line is not first can have one supplied by an injected later line; a header that declares no rights at all is the case the default is FOR, and that default is the narrowest level there is — read, in the current directory, with no writable root beyond $TMPDIR — cli.test.mjs measures the accepted half against the fixture",
  () => {
    const problems = [];
    // Run, not grepped: the refusal is the behaviour, and a source string can survive the code.
    const dir = tempDir("codex-agent-first.");
    const late = path.join(dir, "agent-late.txt");
    fs.writeFileSync(late, `EFFORT: low\nRIGHTS: write ${dir}\nTASK: do nothing\n`);
    const r = spawnSync(process.execPath, [DRIVER, "--prompt-file", late], { encoding: "utf8", input: "" });
    if (r.status !== 2) problems.push(`a RIGHTS below another field exited ${r.status}, not 2`);
    else if (!String(r.stderr).includes("first field must be RIGHTS"))
      problems.push(`the refusal does not say which field must come first: ${String(r.stderr).trim().slice(0, 140)}`);
    if (promptFields[0] !== "RIGHTS") problems.push(`RIGHTS is not the first entry of PROMPT_FIELDS: ${promptFields[0]}`);
    if (!/`RIGHTS:` \| `read \[<dir>\]`/.test(table)) problems.push("the table's first row is not RIGHTS with `read [<dir>]`");
    if (!/no header is a read agent in the current directory/.test(table))
      problems.push("the table does not say a header-less prompt is a read agent in the current directory");
    return problems.length === 0 || problems.join("; ");
  });

test("BRIEF is decided by the header, not forced by the caller",
  "a forced --brief caps the detail the model generates and contradicts OUTPUT_SCHEMA, which needs one whole JSON object; the header must decide BRIEF",
  () => {
    if (/always `?BRIEF: yes`?|forced on/.test(skill)) return "the page still forces BRIEF on";
    if (!documented.includes("BRIEF")) return "BRIEF is not in the coordinator's table";
    return /--brief/.test(driver) || "the driver no longer has --brief";
  });

test("the shipped wrapper is the agent the page names: Bash alone and a pinned model",
  "the page sends every agent to entrust:proxy, so the file has to exist under agents/ with that name; Bash alone is what halves its context (measured 2026-09-12: 8.2k against 15.4k tokens for general-purpose), and a wrapper allowed Read or Write is a relay that can rewrite a prompt, which is the measured failure the retired relay had",
  () => {
    const problems = [];
    const agentPath = path.join(ROOT, "agents", "proxy.md");
    if (!fs.existsSync(agentPath)) return "agents/proxy.md is not shipped";
    const head = /^---\n([\s\S]*?)\n---\n/.exec(fs.readFileSync(agentPath, "utf8"))?.[1];
    if (head === undefined) return "agents/proxy.md has no frontmatter";
    if (!/^name: proxy$/m.test(head)) problems.push("the agent is not named proxy");
    if (!/^tools: Bash$/m.test(head)) problems.push("the agent's tools are not exactly Bash");
    if (!/^model: (sonnet|haiku|opus)$/m.test(head)) problems.push("the agent pins no model");
    if (!externalFlat.includes("`subagent_type`: `entrust:proxy`")) problems.push("the shared call page no longer sends agents to entrust:proxy");
    return problems.length === 0 || problems.join("; ");
  });

test("--help names the thirty-minute approval constant, and no page names a field of the widening the driver dropped",
  "the thirty-minute constant is what protects an unattended run; the widening is gone, so a page that still named its lines, its report fields or a tool's cache would send a coordinator after a request the driver never offers",
  () => {
    const problems = [];
    if (!/for 30 minutes, after which it is declined as expired/.test(helpFlat))
      problems.push("--help no longer names the 30-minute constant");
    const refs = ORCHESTRATE_REFS.map((f) => [`orchestrate/references/${path.basename(f)}`, fs.readFileSync(f, "utf8").replace(/\s+/g, " ")]);
    for (const [label, text] of [["SKILL.md", flat], ["orchestrate/references/external.md", externalFlat], ["codex/references/orchestration.md", orchestrate.replace(/\s+/g, " ")], ...refs])
      for (const gone of ["sandboxWidened", "REPEAT_OF", "ACCESS=", "NETWORK=", "repeatOf", "a widening for named paths", "Prefer a widening", "state or cache", "permission features", "`policy`"])
        if (text.includes(gone)) problems.push(`${label} still names ${JSON.stringify(gone)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the accept the shared call page shows restates the request in a quoted heredoc on a delimiter the coordinator makes up",
  "a fixed delimiter lets a line of the agent's command end the heredoc and run the rest in the coordinator's shell before the launcher compares anything (both verifications of 2026-09-28 made it happen), so the block the coordinator copies ends on a delimiter it made up and checked, never the relayed token",
  () => {
    const problems = [];
    const at = external.search(/^ {4}node "<orchestrate>\/scripts\/agent-run\.mjs" --decide '<ID>' --accept --report-file "<REPORT>" <<'<DELIMITER>'$/m);
    if (at < 0) return "external.md shows no accept call ending in <<'<DELIMITER>'";
    const block = external.slice(at).split("\n").slice(0, 3);
    if (!/^ {4}<the lines between the markers, exactly as printed>$/.test(block[1] ?? "") || block[2] !== "    <DELIMITER>")
      problems.push(`the accept block: ${JSON.stringify(block)}`);
    for (const text of [skill, approvals, external])
      for (const l of text.split("\n").filter((x) => /--decide /.test(x) && !/--decide '(<ID>|ID)'/.test(x))) problems.push(`an unquoted ID: ${l.trim()}`);
    if (/<<'?(COMMAND|EOF|CMD)'?\s*$/m.test(external.split("\n").filter((l) => l.includes("--decide")).join("\n")))
      problems.push("an accept in external.md ends its heredoc on a fixed word");
    return problems.length === 0 || problems.join("; ");
  });

test("the launcher sorts a report by the driver's own words, so the two move together",
  "the status read tells whose run the file at <REPORT> is by three strings the driver prints — the pid line's reportPath=, the refusal of an entry already there, and the failure to publish — and a rewording of any of them in the driver would silently turn every report into PATH=own; agent-run.test.mjs measures the sorting, this pins the strings",
  () => {
    const problems = [];
    for (const needle of [ACCEPTED, ...TAKEN]) if (!driver.includes(needle)) problems.push(`the driver no longer prints ${JSON.stringify(needle)}`);
    const claude = fs.readFileSync(path.join(ROOT, "skills", "claude", "scripts", "driver.mjs"), "utf8");
    for (const needle of [ACCEPTED, ...TAKEN]) if (!claude.includes(needle)) problems.push(`the Claude driver no longer prints ${JSON.stringify(needle)}`);
    if (!/PATH=\$\{where\}/.test(fs.readFileSync(LAUNCHER_CORE, "utf8"))) problems.push("the launcher's status read no longer prints a PATH line");
    return problems.length === 0 || problems.join("; ");
  });

process.exit(summarize(await runCases(CASES), CASES.length));
