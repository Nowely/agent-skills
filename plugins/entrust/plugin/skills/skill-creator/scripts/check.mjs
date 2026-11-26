#!/usr/bin/env node
// Does a skill keep the mechanical rules its hosts apply to it? The reason for each rule is in the budgets table
// of ../references/structure.md; this file owns the numbers and the checks.
//
//   node check.mjs <skill-directory> [<skill-directory> ...]
//
// Reads <dir>/SKILL.md and every markdown file it reaches by relative links inside the skill's folder. A link that
// leaves the folder must open; its file is not read further. Prints each failed rule with its violations, then
// one line per skill with every limit and what the skill uses of it. Exits 1 when a skill has a violation and 2
// on a bad call. It changes nothing.
//
// Not read: reference-style links (`[a]: path`) and anything inside a code span or a fenced block. Not checked:
// whether a file under scripts/ or assets/ is used.
// The frontmatter reader takes plain, quoted and folded (`>`, `>-`) scalars for name, description and
// when_to_use and refuses any other form of those three, so that no length is counted on a guess.
//
// Each rule's title names what it rests on: the open specification (https://agentskills.io/specification), which
// every host of the format follows, or one host's documented behaviour. `rules`, `skillAt` and `LIMITS` are
// exported, so that a repository's own suite can import them and add which skills it reads and what else its
// walk covers.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The body budget. The open specification recommends a body under 5,000 tokens. Claude Code counts a token as four
// characters and, when it compacts a session, keeps a skill's block whole while Math.round(length / 4) <= 5000,
// that is up to 20,001 characters; past that it keeps the first 19,900 and a marker. The block is a header line
// with the skill's directory, then the body with each ${CLAUDE_...} placeholder replaced by its path; every path
// is taken as `path` characters, a chosen bound.
export const LIMITS = { name: 64, description: 1024, listing: 1536, bodyLines: 500, reattached: 20001, kept: 19900,
  preview: 100, path: 120 };
const HEAD = "Base directory for this skill: ".length + "\n\n".length;

const read = (file) => fs.readFileSync(file, "utf8");
const lineCount = (text) => (text.match(/\n/g) ?? []).length; // as `wc -l` counts
const lineAt = (text, index) => lineCount(text.slice(0, index)) + 1;
const inside = (dir, p) => p.startsWith(dir + path.sep);

// A skill to check. `bound` is the directory the walk stays inside, the skill's folder unless the caller widens
// it; `follows` says whether the walk reads a linked markdown file, and `skips` names a directly linked file that
// is held to no rule. A repository's suite passes its own three.
export function skillAt(dir, { bound, follows, skips } = {}) {
  const root = path.resolve(dir), file = path.join(root, "SKILL.md");
  const skill = { name: path.basename(root), dir: root, file, bound: bound ?? root, skips: skips ?? (() => false) };
  skill.follows = follows ?? ((dest) => inside(skill.bound, dest));
  return skill;
}

// The strict subset of YAML these frontmatters use. Another form of a field a rule reads is refused, not
// guessed at; a field no rule reads is kept as written.
const READ = new Set(["name", "description", "when_to_use"]);
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
    } else if (!READ.has(key)) {
      while (i + 1 < end && /^\s+\S/.test(lines[i + 1])) i++;
      data[key] = raw;
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
const bodyLines = (file) => {
  const text = body(read(file)).text;
  return text === "" ? 0 : text.replace(/\n$/, "").split("\n").length;
};

// Fenced blocks and code spans hold examples, not links: blanked, so the offsets and line numbers stay.
const blank = (s) => s.replace(/[^\n]/g, " ");
const FENCE = /^[ \t]*(```+|~~~+)[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm;
const prose = (text) => text.replace(FENCE, blank).replace(/`[^`\n]*`/g, blank);

// Every place a link can land in a file, with its line: each heading, by GitHub's ids (lower case, anything but
// letters, digits, `_`, `-` and spaces dropped, each space a hyphen, a repeat numbered; code spans stay in a
// heading's text), with its level; and every <a id> or <a name> as written, as level 0.
function targets(file) {
  const text = read(file), seen = new Map(), found = [];
  const fenceless = text.replace(FENCE, blank);
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

// The walk reads a markdown file that exists, is not the skill's own page, and that the skill follows.
const walked = (skill, dest) => Boolean(dest) && dest.endsWith(".md") && dest !== skill.file && fs.existsSync(dest)
  && skill.follows(dest);

// A link to a directory counts as a direct link to each markdown file directly in it: the model lists the
// directory and opens a file with no page between. The walk follows files only.
const listed = (dest) => dest && fs.existsSync(dest) && fs.statSync(dest).isDirectory()
  ? fs.readdirSync(dest, { withFileTypes: true }).filter((f) => f.isFile() && f.name.endsWith(".md"))
    .map((f) => path.join(dest, f.name))
  : [dest];

// The files SKILL.md links directly, and every file its walk reaches, with the link that first reached it.
function walk(skill) {
  const direct = new Set(links(skill.file).flatMap((l) => listed(l.dest)));
  const reached = new Map(), queue = [skill.file];
  while (queue.length) {
    const from = queue.shift();
    for (const l of links(from)) {
      if (!walked(skill, l.dest) || reached.has(l.dest)) continue;
      reached.set(l.dest, { from, line: l.line });
      queue.push(l.dest);
    }
  }
  return { skill, direct, reached };
}

function reattached(file) {
  const text = read(file), after = body(text);
  const start = after.start + after.text.match(/^(?:[ \t]*\n)*/)[0].length;
  const block = text.slice(start);
  const places = [...block.matchAll(/\$\{CLAUDE_[A-Z_]+\}/g)];
  const PATH = LIMITS.path;
  const length = HEAD + PATH + block.length + places.reduce((n, m) => n + PATH - m[0].length, 0);
  // The body offset of the first character lost: the kept characters, less the header, run through the body,
  // a placeholder taking PATH of them; a cut inside a path falls at its placeholder.
  let room = LIMITS.kept - HEAD - PATH, at = 0;
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

const markdownUnder = (dir) => !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap((f) =>
  f.isDirectory() ? markdownUnder(path.join(dir, f.name)) : f.isFile() && f.name.endsWith(".md") ? [path.join(dir, f.name)] : []);

// The rules over a set of skills, each `[number, title, violations]`, and the files read. `rel` names a file in a
// violation. Every violation fails its rule; no list excuses one.
export function rules(skills, rel = (p) => p) {
  const walks = skills.map(walk);
  // Every SKILL.md, every file a walk reaches, and every existing markdown file a SKILL.md links inside its
  // bound that the skill does not skip.
  const pages = [...new Set(walks.flatMap(({ skill, direct, reached }) => [
    skill.file, ...reached.keys(),
    ...[...direct].filter((d) => d && d.endsWith(".md") && inside(skill.bound, d) && !skill.skips(d) && fs.existsSync(d)),
  ]))].sort();
  const field = (s, collect) => {
    let fm;
    try { fm = frontmatter(s.file); } catch (e) { return [`${rel(s.file)}: ${e.message}`]; }
    return collect(fm);
  };
  const found = [
    [1, "name uses lowercase letters, digits and hyphens only (open specification)", () => skills.flatMap((s) => field(s, (fm) =>
      // The vendor: "the `name` field must use lowercase letters, numbers, and hyphens only."
      typeof fm.name === "string" && /^[a-z0-9-]+$/.test(fm.name) ? [] : [`${rel(s.file)}: name is ${JSON.stringify(fm.name)}`]))],
    [2, "description plus when_to_use is at most 1,536 characters (Claude Code's listing cuts the rest)", () => skills.flatMap((s) => field(s, (fm) => {
      // The vendor: "the combined `description` and `when_to_use` text is truncated at 1,536 characters in the
      // skill listing". Counted on the values after YAML folds them.
      const parts = [fm.description ?? "", fm.when_to_use ?? ""];
      if (parts.some((p) => typeof p !== "string")) return [`${rel(s.file)}: a field is not a string`];
      const n = parts[0].length + parts[1].length;
      return n <= LIMITS.listing ? [] : [`${rel(s.file)}: ${n} characters`];
    }))],
    [3, "SKILL.md's body is under 500 lines (open specification)", () => skills.flatMap((s) => {
      // The vendor: "Keep SKILL.md body under 500 lines". Counted over the body, after the frontmatter, as lines of text:
      // one trailing newline is dropped before splitting, so a last line counts once whether or not one ends it.
      const n = bodyLines(s.file);
      return n < LIMITS.bodyLines ? [] : [`${rel(s.file)}: ${n} lines of body`];
    })],
    [4, "SKILL.md's body is within 5,000 tokens, which the open specification recommends and Claude Code keeps through a compaction: 20,001 characters as it counts them", () => skills.flatMap((s) => {
      // The vendor: Claude Code "re-attaches the most recent invocation of each skill after the summary, keeping the
      // first 5,000 tokens of each". The purpose is narrower: a page's standing rules lie within the part kept.
      // Which lines those are is a judgement no count makes, so failing any page that is cut at all is a
      // deterministic choice, stricter than the purpose.
      const r = reattached(s.file);
      return r.length <= LIMITS.reattached ? [] : [`${rel(s.file)}: ${r.length} characters re-attached; the cut `
        + `falls at line ${r.line} of ${r.lines}, and ${r.kept}% of the body is kept`];
    })],
    [5, "a linked file links each section after its line 100 from its first 100 lines (Anthropic's guide: a file is previewed)", () => pages
      .filter((f) => !["SKILL.md", "README.md"].includes(path.basename(f)))
      .flatMap((f) => {
        // The vendor: "For reference files longer than 100 lines, include a table of contents at the top." Claude
        // "might use commands like `head -100` to preview content rather than reading entire files". So each
        // section that starts after line 100, a `##` heading or an <a id>, must be the target of a #anchor link in
        // lines 1-100; the links' form, heading and place are free.
        const early = new Set(links(f).filter((l) => l.dest === f && l.anchor && l.line <= LIMITS.preview).map((l) => l.anchor));
        const late = targets(f).filter((t) => (t.level === 2 || t.level === 0) && t.line > LIMITS.preview && !early.has(t.id));
        return late.length === 0 ? [] : [`${rel(f)}: ${late.length} section(s) after line 100 not linked in `
          + `lines 1-100, the first ${late[0].id} at line ${late[0].line}`];
      })],
    [6, "every file SKILL.md reaches is linked from SKILL.md itself (open specification: references one level deep)", () => walks
      .flatMap(({ skill, direct, reached }) => [...reached]
        // The vendor: "Keep references one level deep from SKILL.md". "All reference files should link directly
        // from SKILL.md to ensure Claude reads complete files when needed."
        .filter(([dest]) => !direct.has(dest))
        .map(([dest, { from, line }]) => `${rel(skill.file)} reaches ${rel(dest)} only through ${rel(from)}:${line}`))],
    [7, "no backslash in a link target (Anthropic's guide)", () => pages.flatMap((f) => links(f)
      // The vendor: "Always use forward slashes in file paths, even on Windows"
      .filter((l) => l.target.includes("\\"))
      .map((l) => `${rel(f)}:${l.line}: ${l.target}`))],
    [8, "every relative link opens, its anchor included", () => pages.flatMap((f) => links(f).flatMap((l) => {
      const at = `${rel(f)}:${l.line}: ${l.target}`;
      if (!l.dest || !fs.existsSync(l.dest)) return [`${at}: no such file`];
      if (l.anchor && l.dest.endsWith(".md") && !new Set(targets(l.dest).map((t) => t.id)).has(l.anchor)) return [`${at}: no such anchor`];
      return [];
    }))],
    [9, "name is the folder's name, at most 64 characters, with no hyphen at an end or doubled (open specification)",
      () => skills.flatMap((s) => field(s, (fm) => {
        const name = typeof fm.name === "string" ? fm.name : "";
        return [
          name !== s.name && `name ${JSON.stringify(name)} is not the folder's name, ${s.name}`,
          name.length > LIMITS.name && `name is ${name.length} characters`,
          /^-|-$|--/.test(name) && `name ${JSON.stringify(name)} has a hyphen at an end or doubled`,
        ].filter(Boolean).map((what) => `${rel(s.file)}: ${what}`);
      }))],
    [10, "description is present and at most 1,024 characters (open specification)", () => skills.flatMap((s) => field(s, (fm) => {
      const d = typeof fm.description === "string" ? fm.description.trim() : "";
      if (!d) return [`${rel(s.file)}: no description`];
      return d.length <= LIMITS.description ? [] : [`${rel(s.file)}: ${d.length} characters`];
    }))],
    [11, "every file under the skill's references/ is linked from SKILL.md", () => walks.flatMap(({ skill, direct }) =>
      markdownUnder(path.join(skill.dir, "references")).filter((f) => !direct.has(f))
        .map((f) => `${rel(skill.file)} does not link ${rel(f)}`))],
  ].map(([n, title, collect]) => {
    try { return [n, title, collect()]; } catch (e) { return [n, title, [`threw: ${e.stack}`]]; }
  });
  return { found, pages };
}

// Every limit and what the skill uses of it, for the summary line.
function room(skill) {
  let fm = {};
  try { fm = frontmatter(skill.file); } catch { return ""; }
  const len = (v) => typeof v === "string" ? v.trim().length : 0;
  return `name ${len(fm.name)}/${LIMITS.name}, description ${len(fm.description)}/${LIMITS.description}, `
    + `description with when_to_use ${len(fm.description) + len(fm.when_to_use)}/${LIMITS.listing}, `
    + `body ${bodyLines(skill.file)}/${LIMITS.bodyLines - 1} lines and ${reattached(skill.file).length}/${LIMITS.reattached} `
    + `characters, a contents list from line ${LIMITS.preview + 1} of a reference`;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2);
  if (!dirs.length || dirs.some((d) => d.startsWith("-"))) {
    console.error("usage: node check.mjs <skill-directory> [<skill-directory> ...]");
    process.exit(2);
  }
  let failed = 0;
  for (const dir of dirs) {
    const skill = skillAt(dir);
    if (!fs.existsSync(skill.file)) { failed++; console.log(`FAIL  ${dir}: no SKILL.md`); continue; }
    const { found, pages } = rules([skill], (p) => path.relative(skill.bound, p).split(path.sep).join("/"));
    const bad = found.filter(([, , list]) => list.length);
    for (const [n, title, list] of bad) console.log(`FAIL  ${n}. ${title}\n      ${list.join("\n      ")}`);
    if (bad.length) failed++;
    console.log(`${bad.length ? "FAIL" : "ok  "}  ${dir}: ${found.length - bad.length} of ${found.length} rules passed, `
      + `${pages.length} file(s) read; ${room(skill)}`);
  }
  process.exit(failed ? 1 : 0);
}
