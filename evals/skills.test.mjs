#!/usr/bin/env node
// Do the plugins' skill pages keep the vendor's mechanical rules for a skill?
//
//   node evals/skills.test.mjs
//
// Reads every plugins/*/plugin/skills/*/SKILL.md and the markdown files each one reaches by relative links
// inside its plugin's plugin/ directory; run it after an edit to any of them. Agent files
// (plugins/*/plugin/agents/*.md) are not read. Each rule names the row it rests on, from the research run
// plugins/terse/research/2026-09-28-vendor-guides/: N-* rows are quoted in s1-sources.md, M-* rows in m1-map.md.
// No row quotes a 64-character cap on `name` or a 1,024-character cap on `description`, so neither is checked.
//
// Excluded by name: a plugin's README.md, the human install page, is neither followed nor required by rule 6
// nor held to rule 5 (codex/SKILL.md links it); a SKILL.md reached by a link is held to rules 3 and 4, not 5.
// Rule 6 neither follows nor requires another skill's SKILL.md or any file under another skill's directory:
// that file is one level from its own SKILL.md. Every file read is still held to rules 7 and 8.
//
// KNOWN lists the violations the owner has not yet resolved, each with its ledger entry, a `## <id>. ` heading in
// that plugin's ISSUES.md, or with the reason it has none yet. Every run prints each listed violation that occurs as
// a line starting `known`, with its ledger id or reason and the message a new one would print. The suite fails on a
// violation not in the list, on a listed one that no longer occurs, so the list only shrinks, and on a row whose
// ledger entry is gone.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const NEW = "new, owner to decide";
const TERSE = "plugins/terse/plugin";
const KNOWN = [
  { rule: 4, file: "plugins/entrust/plugin/skills/codex/SKILL.md", ledger: "entrust E77" },
  { rule: 4, file: "plugins/entrust/plugin/skills/orchestrate/SKILL.md", ledger: "entrust E77" },
  { rule: 5, file: `${TERSE}/references/roles.md`, ledger: null, reason: NEW },
  ...[
    ["audit", "curse-of-knowledge.md"], ["audit", "genres/code-comments.md"], ["audit", "writing-rules.md"],
    ["clarity", "curse-of-knowledge.md"], ["clarity", "measurements.md"], ["clarity", "writing-rules.md"],
    ["rethink", "curse-of-knowledge.md"], ["rethink", "truth.md"], ["rethink", "writing-rules.md"],
  ].map(([skill, file]) => ({
    rule: 6, from: `${TERSE}/skills/${skill}/SKILL.md`, file: `${TERSE}/references/${file}`, ledger: null, reason: NEW,
  })),
];

const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const read = (file) => fs.readFileSync(file, "utf8");
const lineCount = (text) => (text.match(/\n/g) ?? []).length; // as `wc -l` counts
const lineAt = (text, index) => lineCount(text.slice(0, index)) + 1;

const skills = fs.readdirSync(path.join(ROOT, "plugins"), { withFileTypes: true })
  .filter((p) => p.isDirectory() && fs.existsSync(path.join(ROOT, "plugins", p.name, "plugin/skills")))
  .flatMap((p) => {
    const plugin = path.join(ROOT, "plugins", p.name, "plugin");
    return fs.readdirSync(path.join(plugin, "skills"), { withFileTypes: true })
      .filter((s) => s.isDirectory() && fs.existsSync(path.join(plugin, "skills", s.name, "SKILL.md")))
      .map((s) => ({ plugin, name: s.name, dir: path.join(plugin, "skills", s.name),
        file: path.join(plugin, "skills", s.name, "SKILL.md") }));
  });

// The strict subset of YAML these frontmatters use. Anything else is refused, not guessed at.
function frontmatter(file) {
  const lines = read(file).split("\n");
  if (lines[0] !== "---") throw new Error("no YAML frontmatter");
  const end = lines.indexOf("---", 1);
  if (end < 0) throw new Error("unterminated YAML frontmatter");
  const data = {};
  for (let i = 1; i < end; i++) {
    if (!lines[i].trim() || /^#/.test(lines[i])) continue;
    const m = lines[i].match(/^([A-Za-z][\w-]*):(?:[ \t]+(.*?))?[ \t]*$/);
    if (!m) throw new Error(`line ${i + 1}: unsupported YAML line`);
    const [, key, raw = ""] = m;
    if (Object.hasOwn(data, key)) throw new Error(`line ${i + 1}: duplicate key ${key}`);
    if (raw === ">-" || raw === ">") {
      const rows = [];
      while (i + 1 < end && (lines[i + 1] === "" || /^ {2}\S/.test(lines[i + 1]))) rows.push(lines[++i].slice(2));
      if (i + 1 < end && /^\s/.test(lines[i + 1])) throw new Error(`line ${i + 2}: unsupported block indentation`);
      while (rows.length && rows.at(-1) === "") rows.pop();
      if (!rows.length || rows[0] === "") throw new Error(`line ${i + 1}: empty or blank-led folded scalar`);
      data[key] = rows.join("\n").replace(/\n+/g, (n) => n.length === 1 ? " " : "\n".repeat(n.length - 1))
        + (raw === ">" ? "\n" : "");
    } else if (raw === "") {
      while (i + 1 < end && /^ {2,}\S/.test(lines[i + 1])) i++; // a nested map no rule reads
      data[key] = {};
    } else {
      if (i + 1 < end && /^\s+\S/.test(lines[i + 1])) throw new Error(`line ${i + 2}: unsupported continuation`);
      data[key] = scalar(raw, i + 1);
    }
  }
  return data;
}

function scalar(raw, line) {
  if (raw.startsWith('"')) {
    try { return JSON.parse(raw); } catch { throw new Error(`line ${line}: unsupported double-quoted scalar`); }
  }
  if (raw.startsWith("'")) {
    if (!/^'(?:[^']|'')*'$/.test(raw)) throw new Error(`line ${line}: invalid single-quoted scalar`);
    return raw.slice(1, -1).replace(/''/g, "'");
  }
  if (/^[>|\[{&*!%@`]/.test(raw) || /: | #/.test(raw)) throw new Error(`line ${line}: unsupported plain scalar`);
  return raw;
}

// A SKILL.md's body: everything after the frontmatter's closing `---` line, with its offset in the file.
function body(text) {
  const lines = text.split("\n");
  const end = lines[0] === "---" ? lines.indexOf("---", 1) : -1;
  const start = end < 0 ? 0 : lines.slice(0, end + 1).join("\n").length + 1;
  return { text: text.slice(start), start };
}

// Fenced blocks and code spans hold examples, not links: blanked, so the offsets and line numbers stay.
const blank = (s) => s.replace(/[^\n]/g, " ");
const prose = (text) => text
  .replace(/^[ \t]*(```+|~~~+)[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm, blank)
  .replace(/`[^`\n]*`/g, blank);

// Every place a link can land in a file, with its line: each heading, by GitHub's ids (lower case, anything but
// letters, digits, `_`, `-` and spaces dropped, each space a hyphen, a repeat numbered; code spans stay in a
// heading's text), with its level; and every <a id> or <a name> as written, as level 0.
function targets(file) {
  const text = read(file), seen = new Map(), found = [];
  const fenceless = text.replace(/^[ \t]*(```+|~~~+)[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm, blank);
  for (const m of fenceless.matchAll(/^ {0,3}(#{1,6})[ \t]+(.+?)[ \t#]*$/gm)) {
    const words = m[2].replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/<[^>]+>/g, "");
    const base = words.toLowerCase().replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, "").replace(/ /g, "-");
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    found.push({ id: n ? `${base}-${n}` : base, level: m[1].length, line: lineAt(text, m.index) });
  }
  for (const m of fenceless.matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) found.push({ id: m[1], level: 0, line: lineAt(text, m.index) });
  return found;
}
const anchors = (file) => new Set(targets(file).map((t) => t.id));

// Every inline link that is not a URL: its target as written, its line, and the path it names.
function links(file) {
  const text = prose(read(file));
  return [...text.matchAll(/\]\(([^)\s]+)\)/g)]
    .filter(([, target]) => !/^[a-z][a-z0-9+.-]*:/i.test(target))
    .map((m) => {
      const [path_, anchor] = m[1].split("#");
      let dest = file;
      if (path_) {
        try { dest = path.resolve(path.dirname(file), decodeURIComponent(path_)); } catch { dest = null; }
      }
      return { target: m[1], line: lineAt(text, m.index), dest, anchor };
    });
}

const inside = (dir, p) => p.startsWith(dir + path.sep);
const isAgent = (skill, p) => inside(path.join(skill.plugin, "agents"), p);

// Rule 6's walk: a markdown file inside the plugin, not a README.md, not an agent file, not the skill's own
// page, and not under another skill's directory (that file is one level from its own SKILL.md).
function follows(skill, dest) {
  if (!dest || !dest.endsWith(".md") || !inside(skill.plugin, dest) || dest === skill.file) return false;
  if (path.basename(dest) === "README.md" || isAgent(skill, dest) || !fs.existsSync(dest)) return false;
  return !inside(path.join(skill.plugin, "skills"), dest) || inside(skill.dir, dest);
}

// A link to a directory counts as a direct link to each markdown file directly in it: the model lists the
// directory and opens a file with no page between. The walk follows files only, so a directory linked from a
// page other than a SKILL.md reaches nothing.
const listed = (dest) => dest && fs.existsSync(dest) && fs.statSync(dest).isDirectory()
  ? fs.readdirSync(dest, { withFileTypes: true }).filter((f) => f.isFile() && f.name.endsWith(".md"))
    .map((f) => path.join(dest, f.name))
  : [dest];

// For each skill: the files its page links directly, and every file its walk reaches, with the link that
// first reached it.
const walks = skills.map((skill) => {
  const direct = new Set(links(skill.file).flatMap((l) => listed(l.dest)));
  const reached = new Map();
  const queue = [skill.file];
  while (queue.length) {
    const from = queue.shift();
    for (const l of links(from)) {
      if (!follows(skill, l.dest) || reached.has(l.dest)) continue;
      reached.set(l.dest, { from, line: l.line });
      queue.push(l.dest);
    }
  }
  return { skill, direct, reached };
});

// The files read: every SKILL.md, every file a walk reaches, and every existing markdown file a SKILL.md
// links inside its plugin but outside agents/ (a README.md and another skill's pages among them).
const pages = [...new Set(walks.flatMap(({ skill, direct, reached }) => [
  skill.file, ...reached.keys(),
  ...[...direct].filter((d) => d && d.endsWith(".md") && inside(skill.plugin, d) && !isAgent(skill, d) && fs.existsSync(d)),
]))].sort();

const rules = [
  [1, "name uses lowercase letters, digits and hyphens only (N-5)", () => skills.flatMap((s) => {
    // N-5: "the `name` field must use lowercase letters, numbers, and hyphens only."
    let fm;
    try { fm = frontmatter(s.file); } catch (e) { return [v(1, s.file, `${rel(s.file)}: ${e.message}`)]; }
    return typeof fm.name === "string" && /^[a-z0-9-]+$/.test(fm.name) ? []
      : [v(1, s.file, `${rel(s.file)}: name is ${JSON.stringify(fm.name)}`)];
  })],
  [2, "description plus when_to_use is at most 1,536 characters (M-207)", () => skills.flatMap((s) => {
    // M-207: "the combined `description` and `when_to_use` text is truncated at 1,536 characters in the
    // skill listing". Counted on the values after YAML folds them.
    let fm;
    try { fm = frontmatter(s.file); } catch (e) { return [v(2, s.file, `${rel(s.file)}: ${e.message}`)]; }
    const parts = [fm.description ?? "", fm.when_to_use ?? ""];
    if (parts.some((p) => typeof p !== "string")) return [v(2, s.file, `${rel(s.file)}: a field is not a string`)];
    const n = parts[0].length + parts[1].length;
    return n <= 1536 ? [] : [v(2, s.file, `${rel(s.file)}: ${n} characters`)];
  })],
  [3, "SKILL.md's body is under 500 lines (N-9)", () => skills.flatMap((s) => {
    // N-9: "Keep SKILL.md body under 500 lines". Counted over the body, after the frontmatter, as lines of text:
    // one trailing newline is dropped before splitting, so a last line counts once whether or not one ends it.
    const text = body(read(s.file)).text;
    const n = text === "" ? 0 : text.replace(/\n$/, "").split("\n").length;
    return n < 500 ? [] : [v(3, s.file, `${rel(s.file)}: ${n} lines of body`)];
  })],
  [4, "SKILL.md survives a compaction whole: at most 20,001 characters re-attached (M-210, E77)", () => skills
    .flatMap((s) => {
      // M-210: Claude Code "re-attaches the most recent invocation of each skill after the summary, keeping the
      // first 5,000 tokens of each". How it counts, from `reattached` below. The purpose is narrower: a page's
      // standing rules lie within the part kept. Which lines those are is a judgement no count makes, so failing
      // any page that is cut at all is a deterministic choice, stricter than the purpose.
      const r = reattached(s.file);
      return r.length <= WHOLE ? [] : [v(4, s.file, `${rel(s.file)}: ${r.length} characters re-attached; the cut `
        + `falls at line ${r.line} of ${r.lines}, and ${r.kept}% of the body is kept`)];
    })],
  [5, "a linked file links each section after its line 100 from its first 100 lines (N-11, M-48, M-50)", () => pages
    .filter((f) => !["SKILL.md", "README.md"].includes(path.basename(f)))
    .flatMap((f) => {
      // N-11: "For reference files longer than 100 lines, include a table of contents at the top." M-48: Claude
      // "might use commands like `head -100` to preview content rather than reading entire files". M-50: the
      // contents are there so that Claude "can see the full scope of available information even when previewing
      // with partial reads". So each section that starts after line 100, a `##` heading or an <a id>, must be
      // the target of a #anchor link in lines 1-100; the links' form, heading and place are free.
      const early = new Set(links(f).filter((l) => l.dest === f && l.anchor && l.line <= 100).map((l) => l.anchor));
      const late = targets(f).filter((t) => (t.level === 2 || t.level === 0) && t.line > 100 && !early.has(t.id));
      return late.length === 0 ? [] : [v(5, f, `${rel(f)}: ${late.length} section(s) after line 100 not linked in `
        + `lines 1-100, the first ${late[0].id} at line ${late[0].line}`)];
    })],
  [6, "every file a SKILL.md reaches in its plugin is linked from it directly (N-10, M-49)", () => walks
    .flatMap(({ skill, direct, reached }) => [...reached]
      // N-10: "Keep references one level deep from SKILL.md". M-49: "All reference files should link directly
      // from SKILL.md to ensure Claude reads complete files when needed."
      .filter(([dest]) => !direct.has(dest))
      .map(([dest, { from, line }]) => v(6, dest,
        `${rel(skill.file)} reaches ${rel(dest)} only through ${rel(from)}:${line}`, skill.file)))],
  [7, "no backslash in a link target (M-74)", () => pages.flatMap((f) => links(f)
    // M-74: "Always use forward slashes in file paths, even on Windows"
    .filter((l) => l.target.includes("\\"))
    .map((l) => v(7, f, `${rel(f)}:${l.line}: ${l.target}`)))],
  [8, "every relative link opens, its anchor included", () => pages.flatMap((f) => links(f).flatMap((l) => {
    const at = `${rel(f)}:${l.line}: ${l.target}`;
    if (!l.dest || !fs.existsSync(l.dest)) return [v(8, f, `${at}: no such file`)];
    if (l.anchor && l.dest.endsWith(".md") && !anchors(l.dest).has(l.anchor)) return [v(8, f, `${at}: no such anchor`)];
    return [];
  }))],
];

// What Claude Code re-attaches of a skill after a compaction: "Base directory for this skill: " + the skill's
// directory + "\n\n" + the body after the frontmatter, leading blank lines dropped, each ${CLAUDE_...}
// placeholder replaced by its path. The block is kept whole while Math.round(length / 4) <= 5000, that is up
// to 20,001 UTF-16 code units; past that, its first 19,900 are kept and a 100-character marker appended. The
// first injection of a skill is never cut, only this one. Read from Claude Code 2.1.280
// (`function Yu(e,r=4){...return Math.round(e.length/r)}`,
// `function wcr(e,n){if(Yu(e)<=n)return e;let r=n*4-qGt.length;return e.slice(0,r)+qGt}`, `rcr=5000`) and
// 2.1.170 (the same shape: `pM3`, `Xz`, `EM3=5000`), and matched over all 19,900 characters of three
// re-attached blocks in one session: a measurement of those versions, which a later Claude Code can change.
// Every path, the header's and each substituted one, is taken as PATH characters, a chosen bound, not a
// measurement: this machine's are 49 to 79, and a longer path moves the cut earlier by its excess, once per
// occurrence. A note, not a rule here:
// the re-attached skills also share a 25,000-token total (`ocr=25000`), newest first, which binds only from
// six skills.
const PATH = 120, HEAD = "Base directory for this skill: ".length + "\n\n".length, WHOLE = 20001, KEPT = 19900;

function reattached(file) {
  const text = read(file), after = body(text);
  const start = after.start + after.text.match(/^(?:[ \t]*\n)*/)[0].length;
  const block = text.slice(start);
  const places = [...block.matchAll(/\$\{CLAUDE_[A-Z_]+\}/g)];
  const length = HEAD + PATH + block.length + places.reduce((n, m) => n + PATH - m[0].length, 0);
  // The body offset of the first character lost: the kept characters, less the header, run through the body,
  // a placeholder taking PATH of them; a cut inside a path falls at its placeholder.
  let room = KEPT - HEAD - PATH, at = 0;
  for (const m of places) {
    if (m.index - at >= room) break;
    room -= m.index - at;
    at = m.index;
    if (room < PATH) { room = 0; break; }
    room -= PATH;
    at = m.index + m[0].length;
  }
  const cut = Math.min(at + room, block.length);
  return { length, line: lineAt(text, start + cut), lines: lineCount(text), kept: Math.round(100 * cut / block.length) };
}

function v(rule, file, message, from) {
  return { rule, file: rel(file), from: from && rel(from), message };
}

const key = (x) => `${x.rule}|${x.from ?? ""}|${x.file}`;
const row = (x) => `rule ${x.rule}: ${x.from ? `${x.from} -> ` : ""}${x.file} (${x.ledger ?? x.reason})`;
const known = new Map(KNOWN.map((x) => [key(x), x]));
const seen = new Set();

// Each case returns the messages that fail it and the known violations it shows.
const cases = rules.map(([n, name, collect]) => [`${n}. ${name}`, () => {
  const found = collect();
  for (const x of found) seen.add(key(x));
  return {
    fail: found.filter((x) => !known.has(key(x))).map((x) => x.message),
    shown: found.filter((x) => known.has(key(x)))
      .map((x) => `${known.get(key(x)).ledger ?? known.get(key(x)).reason}: ${x.message}`),
  };
}]);

cases.push(["every KNOWN violation still occurs, so the list only shrinks", () => ({
  fail: KNOWN.filter((x) => !seen.has(key(x))).map((x) => `${row(x)} no longer occurs; remove it`), shown: [],
})]);

cases.push(["every ledger entry a KNOWN row names is in its plugin's ISSUES.md", () => ({
  fail: KNOWN.filter((x) => x.ledger).flatMap((x) => {
    const [plugin, id] = String(x.ledger).split(" ");
    const file = path.join(ROOT, "plugins", plugin, "ISSUES.md");
    const held = id && fs.existsSync(file) && read(file).split("\n").some((l) => l.startsWith(`## ${id}. `));
    return held ? [] : [`${row(x)}: ${rel(file)} has no "## ${id}. " entry`];
  }),
  shown: [],
})]);

let failed = 0;
for (const [name, fn] of cases) {
  let r;
  try { r = fn(); } catch (e) { r = { fail: [`threw: ${e.stack}`], shown: [] }; }
  if (r.fail.length === 0) console.log(`ok    ${name}`);
  else { failed++; console.log(`FAIL  ${name}\n      ${r.fail.join("\n      ")}`); }
  for (const line of r.shown) console.log(`known ${line}`);
}
console.log(`${pages.length} pages read, ${skills.length} skills; ${cases.length - failed} of ${cases.length} passed`);
process.exit(failed ? 1 : 0);
