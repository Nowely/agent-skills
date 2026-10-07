#!/usr/bin/env node
// Do terse's pages still agree with each other where they must?
//
//   node evals/pages.test.mjs
//
// A definition two skills use lives once, under references/, and every page links it. What moving text
// cannot keep in agreement, these cases check: that every link still opens after a page moves; that the
// shared run recipe creates the promised paths; that the installed rewrite helper runs from another
// directory; that invocation policy agrees across hosts; that a frozen block still hashes to its digest;
// and that the README's Node floor is the one `engines` declares.

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "plugin");
const FROZEN = ["references/writing-rules.md", "references/curse-of-knowledge.md"];
const RUN_SKILLS = ["audit", "rethink", "rewrite"];

// Strict subset of YAML used by these skill frontmatters. Reject unsupported syntax rather than
// silently misreading a longer value as a short one.
function frontmatterYaml(file) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  if (lines[0] !== "---") throw new Error(`${file}: no YAML frontmatter`);
  const end = lines.indexOf("---", 1);
  if (end < 0) throw new Error(`${file}: unterminated YAML frontmatter`);
  const data = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (/^\s/.test(line)) throw new Error(`${file}:${i + 1}: unexpected indented YAML line`);
    const m = line.match(/^([A-Za-z][\w-]*):(?:\s*(.*))?$/);
    if (!m) throw new Error(`${file}:${i + 1}: unsupported YAML line`);
    const [, key, raw = ""] = m;
    if (Object.hasOwn(data, key)) throw new Error(`${file}:${i + 1}: duplicate YAML key ${key}`);
    if (raw === ">-" || raw === ">") {
      const block = [];
      while (i + 1 < end && (/^\s/.test(lines[i + 1]) || lines[i + 1] === "")) {
        if (lines[i + 1] && !/^ {2}\S/.test(lines[i + 1]))
          throw new Error(`${file}:${i + 2}: unsupported block indentation`);
        block.push(lines[++i]);
      }
      if (!block.some(Boolean)) throw new Error(`${file}:${i + 1}: empty folded scalar`);
      const indent = Math.min(...block.filter(Boolean).map((s) => s.match(/^ */)[0].length));
      const rows = block.map((s) => s ? s.slice(indent) : "");
      data[key] = rows.join("\n").replace(/([^\n])\n([^\n])/g, "$1 $2").replace(/\n+$/, raw === ">" ? "\n" : "");
    } else if (raw === "" && key === "metadata") {
      const nested = {};
      while (i + 1 < end && /^ {2,}\S/.test(lines[i + 1])) {
        const child = lines[++i].match(/^  ([A-Za-z][\w-]*):\s*(.*)$/);
        if (!child || child[1] !== "version" || Object.hasOwn(nested, child[1]))
          throw new Error(`${file}:${i + 1}: unsupported metadata YAML`);
        nested[child[1]] = scalar(child[2], file, i + 1);
      }
      if (!nested.version) throw new Error(`${file}:${i + 1}: missing metadata.version`);
      data[key] = nested;
    } else if (raw === "true" || raw === "false") data[key] = raw === "true";
    else data[key] = scalar(raw, file, i + 1);
  }
  return data;
}

function scalar(raw, file, line) {
  if (!raw || /^[>|\[{]/.test(raw) || /[\]}]$/.test(raw))
    throw new Error(`${file}:${line}: unsupported YAML scalar`);
  if (raw.startsWith('"')) {
    try { return JSON.parse(raw); } catch { throw new Error(`${file}:${line}: invalid quoted YAML scalar`); }
  }
  if (raw.startsWith("'")) {
    if (!raw.endsWith("'")) throw new Error(`${file}:${line}: invalid quoted YAML scalar`);
    return raw.slice(1, -1).replace(/''/g, "'");
  }
  if (/[:#]|\s{2,}/.test(raw)) throw new Error(`${file}:${line}: unsupported plain YAML scalar`);
  return raw;
}

function clarityProblems(file) {
  const fm = frontmatterYaml(file);
  const problems = [];
  if (Object.hasOwn(fm, "disable-model-invocation")) problems.push("disable-model-invocation is present");
  if (fm["user-invocable"] === false || fm["user-invocable"] === "false") problems.push("user-invocable is false");
  if (fm.name !== "clarity") problems.push(`name is ${fm.name}`);
  const manifestVersion = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude-plugin/plugin.json"), "utf8")).version;
  if (fm.metadata?.version !== manifestVersion) problems.push(`metadata.version ${fm.metadata?.version} != ${manifestVersion}`);
  if (typeof fm.description !== "string" || !fm.description || typeof fm.when_to_use !== "string" || !fm.when_to_use)
    problems.push("description or when_to_use is missing or not a string");
  const length = (fm.description ?? "").length + (fm.when_to_use ?? "").length;
  if (length > 1536) problems.push(`folded description + when_to_use is ${length} characters`);
  return problems;
}

function readmeRows(readme) {
  const table = readme.split(/^## Skills\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  return table.split("\n").map((line) => line.match(/^\|\s*`\/terse:([a-z-]+)`\s*\|/))
    .filter(Boolean).map((m) => m[1]);
}

function missingSkills(readme) {
  const rows = readmeRows(readme);
  return fs.readdirSync(path.join(ROOT, "skills"), { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name)
    .filter((s) => rows.filter((r) => r === s).length !== 1);
}

function missingGenres(clarityOverride) {
  const notes = pages(path.join(ROOT, "references/genres"));
  const linked = new Set();
  for (const file of pages(path.join(ROOT, "skills")).filter((f) => path.basename(f) === "SKILL.md")) {
    const source = file.endsWith("/clarity/SKILL.md") && clarityOverride !== undefined ? clarityOverride : fs.readFileSync(file, "utf8");
    for (const [, target] of prose(source).matchAll(/\]\(([^)\s]+)\)/g)) {
      const rel = target.split("#")[0];
      if (rel && !/^[a-z][a-z0-9+.-]*:/i.test(rel)) {
        const dest = path.resolve(path.dirname(file), decodeURIComponent(rel));
        if (dest !== file) linked.add(dest);
      }
    }
  }
  return notes.filter((n) => !linked.has(n)).map((n) => path.relative(ROOT, n));
}

function pages(dir = ROOT) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" || e.name.startsWith(".") ? [] : pages(p);
    return e.name.endsWith(".md") ? [p] : [];
  });
}

// Fenced blocks and code spans hold examples, not links.
const prose = (text) => text.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, "").replace(/`[^`\n]*`/g, "");

// GitHub's heading ids: lower case, anything but letters, digits, `_`, `-` and spaces dropped, each space a
// hyphen, a repeat numbered; and every <a id> or <a name> as written.
function anchors(file) {
  const seen = new Map(), ids = new Set();
  for (const [, h] of prose(fs.readFileSync(file, "utf8")).matchAll(/^#{1,6}[ \t]+(.+?)[ \t#]*$/gm)) {
    const text = h.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/<[^>]+>/g, "");
    const base = text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, "").replace(/ /g, "-");
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    ids.add(n ? `${base}-${n}` : base);
  }
  for (const [, id] of fs.readFileSync(file, "utf8").matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) ids.add(id);
  return ids;
}

const cases = [];
const test = (name, fn) => cases.push([name, fn]);

test("every relative link in the plugin's pages opens, its anchor included", () => {
  const broken = [];
  for (const file of pages()) {
    for (const [, target] of prose(fs.readFileSync(file, "utf8")).matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      const [rel, anchor] = target.split("#");
      const dest = rel ? path.resolve(path.dirname(file), decodeURIComponent(rel)) : file;
      const at = `${path.relative(ROOT, file)} -> ${target}`;
      if (!fs.existsSync(dest)) broken.push(`${at}: no such file`);
      else if (anchor && dest.endsWith(".md") && !anchors(dest).has(anchor)) broken.push(`${at}: no such anchor`);
    }
  }
  return broken.length === 0 || broken.join("; ");
});

const shellQuote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
const bashBlocks = (file) => [...fs.readFileSync(file, "utf8").matchAll(/```bash\n([\s\S]*?)\n```/g)].map((m) => m[1]);
const withoutClaudePaths = (tmp) => {
  const env = { ...process.env, TMPDIR: tmp };
  for (const name of ["CLAUDE_PLUGIN_ROOT", "CLAUDE_PLUGIN_DATA", "CLAUDE_SKILL_DIR"]) delete env[name];
  return env;
};

test("the shared run recipe creates distinct absolute temporary and supplied durable paths", () => {
  const recipe = bashBlocks(path.join(ROOT, "references/run.md"))[0];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "terse-pages-run-"));
  const problems = [];
  try {
    for (const skill of RUN_SKILLS) {
      const body = fs.readFileSync(path.join(ROOT, "skills", skill, "SKILL.md"), "utf8");
      if (!body.includes("](../../references/run.md)")) problems.push(`${skill}: no shared recipe link`);
    }
    const paths = [];
    for (const supplied of ["", "", path.join(tmp, "durable"), path.join(tmp, "durable")]) {
      const command = recipe.replace('RUN_ROOT=""', `RUN_ROOT=${shellQuote(supplied)}`).replaceAll("<slug>", "pages-rethink");
      const run = execFileSync("bash", ["-c", command], { cwd: tmp, env: withoutClaudePaths(tmp), encoding: "utf8" }).trim();
      if (!path.isAbsolute(run) || path.dirname(run) !== (supplied || tmp) || !run.endsWith("-rethink") || !fs.statSync(run).isDirectory())
        problems.push(`unexpected run path: ${run}`);
      paths.push(run);
    }
    if (new Set(paths).size !== paths.length) problems.push("run paths repeated");
    return problems.length === 0 || problems.join("; ");
  } catch (e) { return e.message; }
  finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test("deep skills require explicit invocation in both hosts and clarity remains implicit-eligible", () => {
  const implicit = (skill) => {
    const file = path.join(ROOT, "skills", skill, "agents/openai.yaml");
    if (!fs.existsSync(file)) return true;
    const policy = fs.readFileSync(file, "utf8").match(/^policy:\n((?: {2}.+(?:\n|$))+)/m)?.[1];
    const value = policy?.match(/^  allow_implicit_invocation: (true|false)$/m)?.[1];
    if (!value) throw new Error(`${skill}: missing boolean Codex invocation policy`);
    return value === "true";
  };
  try {
    const problems = RUN_SKILLS.filter((skill) =>
      frontmatterYaml(path.join(ROOT, "skills", skill, "SKILL.md"))["disable-model-invocation"] !== true || implicit(skill));
    if (!implicit("clarity")) problems.push("clarity");
    return problems.length === 0 || `invocation policy mismatch: ${problems.join(", ")}`;
  } catch (e) { return e.message; }
});

test("rewrite's installed helper invocation works from another directory without Claude variables", () => {
  const recipe = bashBlocks(path.join(ROOT, "skills/rewrite/SKILL.md")).find((b) => b.includes("scripts/sections.mjs"));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "terse-pages-sections-"));
  try {
    fs.writeFileSync(path.join(tmp, "01-draft.md"), "## A\none two\n## B\nthree\n");
    fs.writeFileSync(path.join(tmp, "02-repaired.md"), "## A\none two three\n## C\nfour\n");
    const command = recipe.replace('SKILL_DIR="<installed-rewrite>"', `SKILL_DIR=${shellQuote(path.join(ROOT, "skills/rewrite"))}`);
    const out = execFileSync("bash", ["-c", command], { cwd: tmp, env: { ...withoutClaudePaths(tmp), RUN: tmp }, encoding: "utf8" });
    return /\+1\s+A$/m.test(out) && /B\s+\(only before\)/.test(out) && /C\s+\(only after\)/.test(out)
      && /1 section\(s\) grew, 2 in one version only/.test(out) || `unexpected sections report: ${out}`;
  } catch (e) { return e.message; }
  finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test("each frozen block hashes to the SHA-256 its page records", () => {
  const problems = [];
  for (const rel of FROZEN) {
    const lines = fs.readFileSync(path.join(ROOT, rel), "utf8").split("\n");
    // Title, blank, the intro paragraph, blank: the block starts there and ends before ## Provenance.
    let i = 1;
    while (lines[i] === "") i++;
    while (lines[i] !== "") i++;
    const start = i + 1, prov = lines.indexOf("## Provenance");
    let end = prov - 1;
    while (lines[end] === "") end--;
    const recorded = lines.slice(prov).join("\n").match(/`([0-9a-f]{64})`/)?.[1];
    const actual = crypto.createHash("sha256").update(lines.slice(start, end + 1).join("\n") + "\n").digest("hex");
    if (prov < 0 || !recorded) problems.push(`${rel}: no digest under ## Provenance`);
    else if (actual !== recorded) problems.push(`${rel}: lines ${start + 1}-${end + 1} hash to ${actual}, the page records ${recorded}`);
  }
  return problems.length === 0 || problems.join("; ");
});

test("clarity frontmatter permits model invocation and fits the listing limit", () => {
  try {
    const problems = clarityProblems(path.join(ROOT, "skills/clarity/SKILL.md"));
    return problems.length === 0 || problems.join("; ");
  } catch (e) { return e.message; }
});

test("eight damaged frontmatter copies fail closed", () => {
  const original = fs.readFileSync(path.join(ROOT, "skills/clarity/SKILL.md"), "utf8");
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude-plugin/plugin.json"), "utf8")).version;
  const versionLine = `version: ${JSON.stringify(version)}`;
  const unchanged = [];
  const damageVersion = (name, replacement) => {
    const damaged = original.replace(versionLine, replacement);
    if (damaged === original) unchanged.push(`${name}: version damage did not change the copy`);
    return damaged;
  };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "terse-pages-yaml-"));
  const file = path.join(dir, "SKILL.md");
  const variants = [
    ["literal block", original.replace("description: >-", "description: |")],
    ["chomping plus", original.replace("description: >-", "description: >+")],
    ["nested array", damageVersion("nested array", "version: [broken")],
    ["nested folded line", original.replace("  Reader-side checks", "    Reader-side checks")],
    ["plain continuation", original.replace("name: clarity", "name: clarity\n  surprise continuation")],
    ["manual invocation disabled", original.replace("license: MIT", "user-invocable: false\nlicense: MIT")],
    ["model invocation disabled", original.replace("license: MIT", "disable-model-invocation: true\nlicense: MIT")],
    ["version mismatch", damageVersion("version mismatch", `version: ${JSON.stringify(`${version}.invalid`)}`)],
  ];
  const escaped = [...unchanged];
  try {
    for (const [name, damaged] of variants) {
      fs.writeFileSync(file, damaged);
      try { if (clarityProblems(file).length === 0) escaped.push(name); }
      catch { /* malformed YAML is correctly rejected */ }
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  return escaped.length === 0 || `damaged copies passed: ${escaped.join(", ")}`;
});

test("all skill metadata versions match the plugin manifest", () => {
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude-plugin/plugin.json"), "utf8")).version;
  const problems = fs.readdirSync(path.join(ROOT, "skills"), { withFileTypes: true })
    .filter((e) => e.isDirectory()).flatMap((e) => {
      try {
        const got = frontmatterYaml(path.join(ROOT, "skills", e.name, "SKILL.md")).metadata?.version;
        return got === version ? [] : [`${e.name}: ${got} != ${version}`];
      } catch (err) { return [`${e.name}: ${err.message}`]; }
    });
  return problems.length === 0 || problems.join("; ");
});

test("README Skills table has a row for every skill directory", () => {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  const missing = missingSkills(readme);
  return missing.length === 0 || `missing or duplicate README rows: ${missing.join(", ")}`;
});

test("the README's Node floor is the one package.json's engines declares", () => {
  const engines = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).engines?.node;
  const floor = engines?.match(/^>=(\d+)$/)?.[1];
  if (!floor) return `engines.node is ${JSON.stringify(engines)}, not >=N`;
  const stated = fs.readFileSync(path.join(ROOT, "README.md"), "utf8").match(/^You need: Node (\d+) or newer\.$/m)?.[1];
  return stated === floor || `README says Node ${stated ?? "(no floor line)"}, engines.node is ${engines}`;
});

test("each genre note has an incoming link from a skill page", () => {
  const missing = missingGenres();
  return missing.length === 0 || `unlinked genre notes: ${missing.join(", ")}`;
});

test("three damaged README and genre-link copies fail their catalogue checks", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "terse-pages-catalogue-"));
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  const clarity = fs.readFileSync(path.join(ROOT, "skills/clarity/SKILL.md"), "utf8");
  const readmeCopy = path.join(dir, "README.md"), clarityCopy = path.join(dir, "SKILL.md");
  try {
    fs.writeFileSync(readmeCopy, readme.replace(/^\| `\/terse:clarity`.*\n/m, ""));
    fs.writeFileSync(clarityCopy, clarity.replace(/\]\(\.\.\/\.\.\/references\/genres\/[^)]+\.md\)/g, "](#removed)"));
    const rowCaught = missingSkills(fs.readFileSync(readmeCopy, "utf8")).includes("clarity");
    fs.writeFileSync(readmeCopy, readme.replace(/^\| `\/terse:clarity`.*\n/m, "")
      .replace("| `/terse:audit` |", "| `/terse:audit`, `/terse:clarity` |"));
    const combinedRowCaught = missingSkills(fs.readFileSync(readmeCopy, "utf8")).includes("clarity");
    const linksCaught = missingGenres(fs.readFileSync(clarityCopy, "utf8")).some((n) => n.endsWith("commit-title.md"));
    return rowCaught && combinedRowCaught && linksCaught ||
      `damaged copy escaped: missing row=${rowCaught}, combined row=${combinedRowCaught}, genres=${linksCaught}`;
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

let failed = 0;
for (const [name, fn] of cases) {
  const r = fn();
  if (r === true) console.log(`ok    ${name}`);
  else { failed++; console.log(`FAIL  ${name}\n      ${r}`); }
}
console.log(`${cases.length - failed} of ${cases.length} passed`);
process.exit(failed ? 1 : 0);
