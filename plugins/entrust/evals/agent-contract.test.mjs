#!/usr/bin/env node
// Does the page a coordinator launches an agent from still describe the driver it launches?
//
//   node evals/agent-contract.test.mjs
//
// The shipped agent, agents/codex-agent.md, is a mechanical wrapper: the coordinator writes the prompt and
// hands the wrapper the exact commands, which run the driver through scripts/agent-run.mjs as a background
// Bash task, so the ONE call
// and the field table are both SKILL.md's and the agent file carries only the relay's standing rules. This suite compares
// that page, and the orchestrate page that re-cuts it, with the driver they describe.

import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { DRIVER, FIELDS, ROOT, PROMPT_FIELDS, SCRIPTS, registry, runCases, summarize, tempDir } from "./lib/harness.mjs";
import { ACCEPTED, TAKEN } from "../skills/codex/scripts/agent-run.mjs";

const SKILL = path.join(ROOT, "skills", "codex", "SKILL.md");
const ORCHESTRATE = path.join(ROOT, "skills", "orchestrate", "SKILL.md");

const skill = fs.readFileSync(SKILL, "utf8");
const orchestrate = fs.readFileSync(ORCHESTRATE, "utf8");
const driver = fs.readFileSync(DRIVER, "utf8");
// What the driver ADVERTISES, for the cases that ask whether a flag the page hands over still exists: a
// `case "--x":` in the source can outlive every route a caller has to it, and the help is the route.
const help = spawnSync(process.execPath, [DRIVER, "--help"], { encoding: "utf8" }).stdout ?? "";
const helpFlat = help.replace(/\s+/g, " ");

// The page in the pieces the cases read: the whole text collapsed for prose pins, the field table, and
// the indented command lines a coordinator copies into a Bash call.
const table = skill.split(/^## /m).find((s) => s.startsWith("Header fields")) ?? "";
const flat = skill.replace(/\s+/g, " ");
// A leading VAR="..." assignment is part of the line a coordinator copies: the state directory rides in
// on one, so a pattern that only matched `node "` would read the recipe as absent.
const commands = [...skill.matchAll(/^ {4}((?:[A-Z_]+="[^"\n]*" )*node "[^\n]+)$/gm)].map((m) => m[1]);
const inlineShell = [...skill.matchAll(/`(mktemp -d [^`]*)`/g)].map((m) => m[1]);

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
    // VERIFY is the one field the driver parses that no header may carry: it needs --allow-prompt-verify
    // on the command line, which this relay never passes. It belongs in the refusal sentence below.
    const missing = promptFields.filter((f) => f !== "VERIFY" && !documented.includes(f));
    if (missing.length) problems.push(`accepted by the driver, absent from the table: ${missing.join(", ")}`);
    const bogus = documented.filter((f) => !promptFields.includes(f));
    if (bogus.length) problems.push(`in the table, rejected by the driver: ${bogus.join(", ")}`);
    if (documented.includes("VERIFY")) problems.push("VERIFY is written as a usable header field");
    if (!/`VERIFY` is refused in a prompt file without `--allow-prompt-verify`/.test(table))
      problems.push("the section does not name VERIFY as refused");
    return problems.length === 0 || problems.join("; ");
  });

test("the ONE call is agent-run.mjs --run with --dir and --report-file in one foreground call, the launcher runs the driver with --prompt-file and --report-file, and every shell the page hands over parses",
  "the line is copied verbatim into a Bash call: a stray quote is an agent that never runs, a launch that named the driver directly would carry the redirects and the exit marker again, an `&` of its own detaches the run from the task that is supposed to own it, a second command would be a second card a native subagent does not show, and a launcher that read the prompt could rewrite it",
  () => {
    const scripts = [...commands, ...inlineShell];
    if (scripts.length < 2) return `expected the mktemp pre-step and the run, found ${scripts.length} shell snippets`;
    const problems = [];
    for (const src of scripts) {
      const r = spawnSync("bash", ["-n"], { input: src, encoding: "utf8" });
      if (r.status !== 0) problems.push(`bash -n rejected ${JSON.stringify(src.slice(0, 60))}: ${String(r.stderr).trim()}`);
    }
    const calls = commands.filter((c) => c.includes("agent-run.mjs"));
    if (calls.length !== 1) problems.push(`expected exactly one indented agent-run.mjs line on the page, found ${calls.length}`);
    const call = calls[0] ?? "";
    for (const part of ["--run", '--dir "<DIR>"', '--report-file "<REPORT>"'])
      if (!call.includes(part)) problems.push(`the run does not carry ${part}: ${JSON.stringify(call)}`);
    if (call.includes("driver.mjs")) problems.push("the run names the driver directly again");
    if (/(^|[^&])&\s*$/.test(call)) problems.push("the run ends in an `&` of its own, which hides the run from the task");
    if (!/in the foreground, with timeout 600000/.test(flat))
      problems.push("the page does not say the call runs in the foreground with the ten-minute timeout");
    if (!/one foreground call and no `&` of your own/.test(flat))
      problems.push("the page does not say the launcher is one foreground call with no `&` of its own");
    // The launcher's own spawn: exactly the two driver flags, prompt.txt as an argument only, the
    // environment untouched. agent-run.test.mjs runs it; this reads the promise off the source.
    const launcher = fs.readFileSync(path.join(SCRIPTS, "agent-run.mjs"), "utf8");
    if (!/\[DRIVER, "--prompt-file", promptPath, "--report-file", report\]/.test(launcher))
      problems.push("the launcher does not spawn the driver with exactly --prompt-file and --report-file");
    if (/(readFileSync|openSync|createReadStream|readFile)\([^)]*prompt/i.test(launcher)) problems.push("the launcher reads prompt.txt");
    if (!/env: process\.env/.test(launcher)) problems.push("the launcher does not pass its environment to the driver untouched");
    // And the driver has to offer exactly those two flags.
    for (const flag of ["--prompt-file", "--report-file"])
      if (!help.includes(flag)) problems.push(`--help does not offer ${flag}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the scratch directory comes from one mktemp call, not from an unexpandable $TMPDIR path",
  "Write and Read take literal absolute paths and expand nothing, so a coordinator needs a resolved private directory to avoid colliding or world-readable files — and --report-file refuses a relative path outright",
  () => {
    const problems = [];
    if (!/mktemp -d "\$\{TMPDIR:-\/tmp\}\/codex-agent\.XXXXXXXX"/.test(skill)) problems.push("the mktemp -d pre-step is gone or reworded");
    if (/\$TMPDIR\/(prompt|agent|task|report|stderr)/.test(skill)) problems.push("a scratch path is written as $TMPDIR/..., which the Write and Read tools cannot expand");
    if (!helpFlat.includes("an ABSOLUTE path that does not exist yet"))
      problems.push("--help no longer promises that --report-file is absolute and unclaimed");
    return problems.length === 0 || problems.join("; ");
  });

test("every driver path and every state directory on both pages is the exact ${...} placeholder",
  "Claude Code substitutes that exact form inline in a skill body and exports nothing to the Bash tool, so a ${VAR:-default} is never substituted, expands to the default, and makes every plugin-installed agent fail to find the driver at all — and the same form is what carries the state directory the driver now has no default for: an agent that lost it exits 2 before its turn",
  () => {
    const REL = "skills/codex/scripts/driver.mjs";
    if (path.relative(ROOT, DRIVER).split(path.sep).join("/") !== REL) return `the shipped layout moved: ${path.relative(ROOT, DRIVER)}`;
    const problems = [];
    for (const [label, text] of [["SKILL.md", skill], ["orchestrate/SKILL.md", orchestrate]]) {
      for (const v of ["CLAUDE_SKILL_DIR", "CLAUDE_PLUGIN_DATA"])
        if (new RegExp(`${v}\\s*:-`).test(text))
          problems.push(`${label} writes \${${v}:-...}, which Claude Code does not substitute: the agent would run on the default, not on what the install resolved`);
      for (const p of [...text.matchAll(/"([^"\n]*driver\.mjs)"/g)].map((m) => m[1]))
        if (p !== `\${CLAUDE_SKILL_DIR}/scripts/driver.mjs`)
          problems.push(`${label} names the driver as ${JSON.stringify(p)}, not "\${CLAUDE_SKILL_DIR}/scripts/driver.mjs"`);
      for (const p of [...text.matchAll(/"([^"\n]*agent-run\.mjs)"/g)].map((m) => m[1]))
        if (p !== `\${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs`)
          problems.push(`${label} names the launcher as ${JSON.stringify(p)}, not "\${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs"`);
      // Every mention of the variable, in a recipe or in prose, is the exact placeholder: the substituted
      // form is what a plugin install replaces, and anything else reaches the shell as a literal. The one
      // exception is the recipe's assignment name, which forwards the placeholder under its own name.
      for (const m of text.matchAll(/CLAUDE_PLUGIN_DATA/g)) {
        const at = m.index;
        if (text.startsWith('="${CLAUDE_PLUGIN_DATA}"', at + m[0].length)) continue;
        if (text.slice(at - 2, at) !== "${" || text[at + m[0].length] !== "}")
          problems.push(`${label} names CLAUDE_PLUGIN_DATA outside the exact \${CLAUDE_PLUGIN_DATA} form: ${JSON.stringify(text.slice(Math.max(0, at - 30), at + 40))}`);
      }
    }
    // The one call every agent is launched by forwards the data directory under its own name: the driver reads
    // ENTRUST_STATE_DIR first, so an exported one (the clone route, where nothing substitutes the
    // placeholder and the forwarded value is empty) still wins, and a plugin install gets the resolved path.
    if (!/CLAUDE_PLUGIN_DATA="\$\{CLAUDE_PLUGIN_DATA\}" node "\$\{CLAUDE_SKILL_DIR\}\/scripts\/agent-run\.mjs"/.test(skill))
      problems.push("the One call recipe no longer forwards CLAUDE_PLUGIN_DATA=\"${CLAUDE_PLUGIN_DATA}\" ahead of the launcher");
    // The placeholder resolves to the skill directory, so the path below it is the shipped layout's.
    for (const f of ["driver.mjs", "agent-run.mjs"])
      if (!fs.existsSync(path.join(ROOT, "skills", "codex", "scripts", f)))
        problems.push(`scripts/${f} is not where \${CLAUDE_SKILL_DIR} would resolve it`);
    return problems.length === 0 || problems.join("; ");
  });

test("a failing agent declaration is reported, never repaired",
  "creating a missing directory can turn a refusal into an agent with unintended rights; path validation belongs to the driver, and its exit 2 is the answer",
  () => /Never create a directory, change a level or re-run with different flags to make a refused agent succeed/.test(flat)
    || "the no-repair rule is gone from the page");

test("the bounds, the transport and the injection fields are refused, and no table offers them",
  "a newline in a copied value can inject a field: VERIFY runs a shell, ATTACH uploads a file and REPORT_FILE redirects the run's whole evidence. Bounds and delivery belong to the CLI; SKILL.md must not offer refused fields as usable headers",
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
    if (!/--allow-prompt-verify/.test(driver)) problems.push("the driver lost --allow-prompt-verify");
    if (!/`VERIFY` is refused in a prompt file without `--allow-prompt-verify`/.test(table))
      problems.push("VERIFY is not named as refused in SKILL.md");
    for (const [f, flag] of [["ATTACH", "--attach"]]) {
      if (promptFields.includes(f)) problems.push(`${f} is an agent field again`);
      if (documented.includes(f)) problems.push(`${f} is in the coordinator's field table as usable`);
      if (!help.includes(flag)) problems.push(`${flag}, the command-line route ${f} is refused in favour of, is gone from --help`);
    }
    return problems.length === 0 || problems.join("; ");
  });

test("the report file is what the coordinator reads, and a missing one is unknown rather than success",
  "the pipe is not held while a background task runs, so the file IS the delivery: a page that told the coordinator to read the task's output would lose a report whose stdout broke, and one that read a missing file as 'nothing went wrong' would report an agent killed mid-turn as a clean run",
  () => {
    const problems = [];
    for (const phrase of [
      "The wrapper's completion notification is the agent's completion",
      "`<REPORT>` is an absolute path of this agent's own and never under `<DIR>`",
      "`<REPORT>` is the report, the same JSON the run also wrote to `<DIR>/out.json`",
      "it is written whole or not at all, and a missing one means unknown, never success",
      "with an `OUTPUT_SCHEMA:` line, `answerJson` is that answer already parsed",
      "To stop an agent, stop its wrapper — Stop on the agent map or `TaskStop` — or send `SIGTERM` to the pid on the first line of `<DIR>/err.txt`",
    ]) if (!flat.includes(phrase)) problems.push(`the page no longer says: ${JSON.stringify(phrase)}`);
    // Each of those is a promise the driver has to keep. The mode, the no-clobber rule, the pid line and
    // the signal handling are MEASURED elsewhere — cli.test.mjs's report-file flows and the lock suite's
    // signal cases — so what is left here is the pair of routes the page names by function.
    if (!/publishReport/.test(driver)) problems.push("the driver no longer publishes the report to a file");
    if (!/function preTurnReport/.test(driver)) problems.push("a refusal before the turn no longer reaches the report file");
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

test("what the user reads is prose the coordinator writes, in the user's language, naming an agent by its model",
  "measured on 0.11.1 (2026-09-09): a Russian-speaking owner was shown an agent's raw five-field block, a plan reciting `RIGHTS: write` and an absolute run-directory path, and the page's own noun translated word-for-word into a Russian one that means a chair. Every one of those is this page's vocabulary reaching the one reader it was never written for, so the page has to say once that the coordinator writes the user's text rather than forwarding its own inputs, and that the name a person can use is the model",
  () => {
    const problems = [];
    const section = skill.split(/^## /m).find((s) => s.startsWith("What the user reads")) ?? "";
    if (!section) problems.push("the page has no `What the user reads` section");
    const sectionFlat = section.replace(/\s+/g, " ");
    for (const phrase of [
      "What reaches the user is prose the coordinator writes",
      "in the user's own language",
      "naming an agent by its model and id",
      "the agent by name is the subject and what it does or did is the verb (\"Codex Sol R1 reads the diff\")",
      "the name is `Codex Sol R1`, never `gpt-5.6-sol`",
      "A header field name, a status block, an internal table's row name and an absolute path are machinery",
      "say what an agent may write, and where, in ordinary words",
    ]) if (!sectionFlat.includes(phrase)) problems.push(`the section no longer says: ${JSON.stringify(phrase)}`);
    // The two user-facing templates, on both pages, are the only places the word reached the user by
    // instruction rather than by accident: the wrapper's description and the example first line. They
    // are pinned as a pair because a fix to one page alone leaves the other still teaching the old form.
    for (const [name, text] of [["codex", flat], ["orchestrate", orchestrate.replace(/\s+/g, " ")]]) {
      if (!text.includes("`Codex <short name> <id>: <task in a few words>`")
          && !text.includes("\"Codex <short name> <id>: <task in a few words>\""))
        problems.push(`${name} no longer carries the model-first description template`);
      if (/agent <id>, <model>|Agent W5, Sonnet/.test(text))
        problems.push(`${name} still teaches a user-facing template built on the page's own noun`);
    }
    return problems.length === 0 || problems.join("; ");
  });

test("the shipped wrapper is the agent the page names: Bash alone, a pinned model, and a body that never answers the task",
  "the page sends every agent to entrust:codex-agent, so the file has to exist under agents/ with that name; Bash alone is what halves its context (measured 2026-09-12: 8.2k against 15.4k tokens for general-purpose), and a wrapper allowed Read or Write is a relay that can rewrite a prompt, which is the measured failure the retired relay had",
  () => {
    const problems = [];
    const agentPath = path.join(ROOT, "agents", "codex-agent.md");
    if (!fs.existsSync(agentPath)) return "agents/codex-agent.md is not shipped";
    const agent = fs.readFileSync(agentPath, "utf8");
    const fm = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(agent);
    if (!fm) return "agents/codex-agent.md has no frontmatter";
    const [, head, body] = fm;
    if (!/^name: codex-agent$/m.test(head)) problems.push("the agent is not named codex-agent");
    if (!/^tools: Bash$/m.test(head)) problems.push("the agent's tools are not exactly Bash");
    if (!/^model: (sonnet|haiku|opus)$/m.test(head)) problems.push("the agent pins no model");
    for (const phrase of ["Do not answer the task yourself", "Do not create or edit files", "Do not change any flag, path, or environment variable"])
      if (!body.replace(/\s+/g, " ").includes(phrase)) problems.push(`the agent body no longer says: ${JSON.stringify(phrase)}`);
    for (const phrase of ["`subagent_type: entrust:codex-agent`", "A clone-and-symlink install links that file into `~/.claude/agents/`", "Pass it no `model`"])
      if (!flat.includes(phrase)) problems.push(`the page no longer says: ${JSON.stringify(phrase)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the launcher sorts a report by the driver's own words, so the two move together",
  "the status read tells whose run the file at <REPORT> is by three strings the driver prints — the pid line's reportPath=, the refusal of an entry already there, and the failure to publish — and a rewording of any of them in the driver would silently turn every report into PATH=own; agent-run.test.mjs measures the sorting, this pins the strings",
  () => {
    const problems = [];
    for (const needle of [ACCEPTED, ...TAKEN]) if (!driver.includes(needle)) problems.push(`the driver no longer prints ${JSON.stringify(needle)}`);
    if (!/PATH=\$\{where\}/.test(fs.readFileSync(path.join(SCRIPTS, "agent-run.mjs"), "utf8"))) problems.push("the launcher's status read no longer prints a PATH line");
    return problems.length === 0 || problems.join("; ");
  });

process.exit(summarize(await runCases(CASES), CASES.length));
