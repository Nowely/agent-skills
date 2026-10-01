#!/usr/bin/env node
// Portable orchestration boundaries and executable recipes. Behaviour is checked separately
// with independent agents; prose wording is not a stable runtime contract.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, registry, runCases, summarize, tempDir } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const dir = path.join(ROOT, "skills/orchestrate");
const page = fs.readFileSync(path.join(dir, "SKILL.md"), "utf8");
const core = ["SKILL.md", ...fs.readdirSync(path.join(dir, "references"))
  .filter((n) => n !== "incidents.md").map((n) => `references/${n}`)];
const hostBindings = /\$\{CLAUDE_[A-Z_]+\}|~\/\.claude\b|\b(?:Workflow|SendMessage)\b|\bAgent (?:call|tool)\b|codex\/(?:scripts|schemas)\//;
const run = (file, args, cwd, opts = {}) => spawnSync(process.execPath, [file, ...args],
  { cwd, encoding: "utf8", timeout: 60000, ...opts });
const nativeCopy = () => {
  const to = tempDir("native-orchestrate-");
  fs.cpSync(dir, to, { recursive: true });
  return to;
};

test("both hosts keep orchestration explicit-only",
  "host metadata must preserve the user's chosen invocation policy",
  () => /^disable-model-invocation: true$/m.test(page)
    && /^policy:\s*\n\s+allow_implicit_invocation: false\s*$/m.test(fs.readFileSync(path.join(dir, "agents/openai.yaml"), "utf8")));

test("operational core has no host tool bindings or external-driver paths",
  "a native plan must not depend on a Claude tool name, skill interpolation or external Codex launch",
  () => {
    const bad = core.filter((name) => hostBindings.test(fs.readFileSync(path.join(dir, name), "utf8")));
    return bad.length === 0 || `host binding in ${bad.join(", ")}`;
  });

test("the boundary check rejects a host-specific command in a native reference",
  "a boundary invariant that admits a Claude path would pass the original incompatibility",
  () => hostBindings.test('node "${CLAUDE_SKILL_DIR}/scripts/run.mjs"')
    && hostBindings.test("Continue through SendMessage")
    && hostBindings.test("codex/scripts/driver.mjs"));

test("the coordinator is a linked role, with no additional skill entrypoint",
  "packaging a role as another skill changes discovery and invocation",
  () => page.includes("](references/foreman.md)")
    && fs.existsSync(path.join(dir, "references/foreman.md"))
    && !fs.existsSync(path.join(ROOT, "skills/foreman/SKILL.md"))
    && !fs.existsSync(path.join(ROOT, "skills/coordinator/SKILL.md")));

test("every operational link resolves within an installed plugin",
  "installed references cannot rely on the source checkout or a deleted generated fragment",
  () => {
    const bad = [];
    for (const name of core) {
      for (const [, target] of fs.readFileSync(path.join(dir, name), "utf8").matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^[a-z]+:/i.test(target)) continue;
        const file = path.resolve(dir, path.dirname(name), target.split("#")[0]);
        if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) bad.push(`${name}: ${target}`);
      }
    }
    return bad.length === 0 || bad.join("; ");
  });

test("the capture recipe works with only the orchestration skill installed",
  "native checks must not require the external adapter; the full output and true failure survive",
  () => {
    const cwd = nativeCopy(), ledger = path.join(cwd, "checks.jsonl");
    const rel = /<skill-dir>\/(scripts\/capture-check\.mjs)/.exec(page)?.[1];
    if (!rel) return "no capture recipe";
    const p = run(path.join(cwd, rel), ["--label", "failing check", "--ledger", ledger, "--", "printf 'one\\ntwo\\n'; exit 7"], cwd);
    const record = JSON.parse(fs.readFileSync(ledger, "utf8").trim());
    return p.status === 7 && /EXIT=7/.test(p.stdout) && Number(record.exit) === 7
      && fs.existsSync(record.log) || `exit=${p.status}; record=${JSON.stringify(record)}; ${p.stderr}`;
  });

test("an explicit temporary root contains the capture artifacts",
  "a user-restricted temporary scope must not leak logs into the default runtime folder",
  () => {
    const cwd = fs.realpathSync(nativeCopy()), ledger = path.join(cwd, "scoped.jsonl");
    const p = run(path.join(cwd, "scripts/capture-check.mjs"),
      ["--label", "scoped", "--ledger", ledger, "--", "printf 'bounded\\n'"], cwd,
      { env: { ...process.env, TMPDIR: cwd } });
    const record = JSON.parse(fs.readFileSync(ledger, "utf8").trim());
    return p.status === 0 && record.log.startsWith(cwd + path.sep) && fs.existsSync(record.log)
      || `exit=${p.status}; log=${record.log}`;
  });

test("a failed pipeline stays failed in a native check",
  "reading a short tail must not turn a failing stage into successful evidence",
  () => {
    const cwd = nativeCopy(), ledger = path.join(cwd, "pipeline.jsonl");
    const p = run(path.join(cwd, "scripts/capture-check.mjs"), ["--label", "pipeline", "--ledger", ledger,
      "--", "(printf 'bad\\n'; exit 9) | cat"], cwd);
    return p.status === 9 && /EXIT=9/.test(p.stdout) || `exit=${p.status}; ${p.stdout}`;
  });

test("the draft recipe lints without any external Codex files",
  "importing the driver made a common helper depend on the adapter's installed subtree",
  () => {
    const cwd = nativeCopy(), draft = path.join(cwd, "draft.md");
    fs.writeFileSync(draft, "Reader W1 examined both fixtures. Remaining coverage is unknown.\n");
    const rel = /<skill-dir>\/(scripts\/lint-draft\.mjs)/.exec(page)?.[1];
    if (!rel) return "no draft recipe";
    const p = run(path.join(cwd, rel), ["--agents", "Reader W1", draft], cwd);
    return p.status === 0 && /HITS=0/.test(p.stdout) || `exit=${p.status}; ${p.stdout}; ${p.stderr}`;
  });

test("native header leakage is caught without importing an integration's vocabulary",
  "the common linter must recognise native prompt machinery as well as external headers",
  () => {
    const cwd = nativeCopy(), draft = path.join(cwd, "draft.md");
    fs.writeFileSync(draft, "TASK: inspect the tree\nAGENT_ROLE: verifier\n");
    const p = run(path.join(cwd, "scripts/lint-draft.mjs"), [draft], cwd);
    return p.status === 1 && /LINT=field/.test(p.stdout) || `exit=${p.status}; ${p.stdout}`;
  });

test("the adapter's external schema implements the shared return",
  "the external transport must still return the common five fields",
  () => {
    const schema = JSON.parse(fs.readFileSync(path.join(ROOT, "skills/codex/schemas/five-fields.schema.json"), "utf8"));
    const fields = [...page.matchAll(/^ {4}(status|result|evidence|artifacts|open):/gm)].map((m) => m[1]);
    return JSON.stringify([...schema.required].sort()) === JSON.stringify(fields.sort())
      && schema.additionalProperties === false;
  });

const failed = await runCases(CASES);
process.exit(summarize(failed, CASES.length));
