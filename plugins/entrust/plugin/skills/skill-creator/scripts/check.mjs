#!/usr/bin/env node
// Does a skill keep the mechanical rules its hosts apply to it? The reason for each rule is in the budgets table
// of ../references/structure.md; this file owns the numbers and the checks.
//
//   node check.mjs <skill-directory> [<skill-directory> ...]
//   node check.mjs <directory> --against <base> [--dispositions <file>]     was a line lost? (see `preserved`)
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
// `--against` names the state before the edit, a git revision or a directory that holds a copy; the agent sets
// it, because work that spans commits has no "before" a script could guess, and without it a cut that drops a fact
// passes. `--dispositions` names the file that answers the listed lines; the agent sets it, because the script
// cannot know where a run keeps its files, and without it no listed line can be answered.
//
// Each rule's title names what it rests on: the open specification (https://agentskills.io/specification), which
// every host of the format follows, or one host's documented behaviour. `rules`, `skillAt` and `LIMITS` are
// exported, so that a repository's own suite can import them and add which skills it reads and what else its
// walk covers.

import { execFileSync } from "node:child_process";
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
// is held to no rule. `installed` is the directory an install copies the skill with, unless the caller names
// one: the folder that holds the skill and its neighbours, or, for a skill at `<plugin>/skills/<name>/` whose
// plugin folder holds Claude Code's manifest `.claude-plugin/plugin.json`, that plugin folder, which a plugin
// install copies whole. No other host's plugin layout is recognised. A repository's suite passes its own four.
export function skillAt(dir, { bound, follows, skips, installed } = {}) {
  const root = path.resolve(dir), file = path.join(root, "SKILL.md");
  const beside = path.dirname(root), plugin = path.dirname(beside);
  const whole = path.basename(beside) === "skills" && fs.existsSync(path.join(plugin, ".claude-plugin", "plugin.json"));
  const skill = { name: path.basename(root), dir: root, file, bound: bound ?? root, skips: skips ?? (() => false),
    installed: installed ?? (whole ? plugin : beside) };
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
    [12, "every relative link stays among the files installed with the skill", () => walks.flatMap(({ skill, reached }) =>
      [skill.file, ...reached.keys()].filter((f) => f === skill.file || inside(skill.dir, f)).flatMap((f) => links(f)
        .filter((l) => l.dest && l.dest !== skill.installed && !inside(skill.installed, l.dest))
        .map((l) => `${rel(f)}:${l.line}: ${l.target} leaves the installed folders`)))],
  ].map(([n, title, collect]) => {
    try { return [n, title, collect()]; } catch (e) { return [n, title, [`threw: ${e.stack}`]]; }
  });
  return { found, pages };
}

// ---- The preservation list: was a line of the files as they were lost?
//
// A line of a Markdown file under `dir` at `base` is carried when its text, with white space, backticks,
// asterisks and table bars collapsed, link destinations dropped and case folded, still stands somewhere in the
// Markdown now under `dir`, and under its neighbours when `dir` is a skill: re-wrapping, a move to another file and
// a changed link destination therefore list nothing. Not held to it: a line of 12 characters or fewer once
// collapsed (a rule, a short heading), and a line that is only links (a contents list). A line that differs from
// what stands in its own file by one misspelt word is carried too: one letter added, dropped, changed or swapped
// with its neighbour, in a word of four letters or more that the files no longer hold anywhere. A real word
// changed into its neighbour (`affect`, `effect`) passes that test only when the old word was the last of its
// kind in the tree; the quality read is what catches it.
//
// Every other line is a candidate and needs one line in the dispositions file:
//
//   moved    | <file>:<line> | <file>:<line> | <the words that state it now>
//   retired  | <file>:<line> | <file>:<line> | <the user's words that retire it>
//   reworded | <file>:<line> | <file>:<line> | <words of the lost line, with commas> => <the words that say it now>
//
// The first place is the candidate's, as printed. The second is where the quote stands, within five lines from
// the one named: for `moved` a file under `dir` or beside it, by a path relative to `dir`, and the quote shares a
// word of four letters or more with the lost line; for `retired` a file outside `dir` that holds the user's
// messages, by a path relative to the dispositions file. `#` starts a comment line.
//
// A lost line may take several `moved` lines, one for each place a part of it went, and together they must
// carry it: cut at each table bar, semicolon and sentence end, every part of the lost line that has a word of
// four letters or more outside its code spans shares such a word with one of the quotes. A `retired` line
// answers the whole line. So a row that held two facts is not answered by the place of one. A code span is left
// out because a copy that contradicted its owner is answered with the owner's line, whose value differs; a bold
// run is left out because it names a step or a term, and a step renamed has lost no fact.
//
// Two more things keep an answered line listed, because a part is carried on one shared word and a quote can
// share a word and say something else. A word of the lost line that stood in no other line of the files as they
// were, stands nowhere in them now, and is in none of the quotes, has gone with whatever it said: the line
// stays listed until a `reworded` line names that word and quotes, at its place, the words that say it now. And
// where a part of the lost line gave a value in a code span, and every quote that carries a word of that part
// stands in the lost line's own file and gives other values, the value was changed in place: the line stays
// listed until the old value stands again or a `retired` line holds the user's words. A copy answered with its
// owner's line in another file is not that case. The script still cannot tell whether a quote says what the
// lost line said, whether two facts inside one part both went somewhere, nor whether the messages file is the
// user's.
const collapse = (s) => s.replace(/\]\([^)\s]*\)/g, "]").replace(/[\s`*|]+/g, " ").trim().toLowerCase();
const onlyLinks = (line) => !/[\p{L}\p{N}]/u.test(line.replace(/\[[^\]]*\]\([^)]*\)/g, ""));
const WORD = /[\p{L}][\p{L}'’-]*/gu;
const longWords = (s) => new Set((collapse(s).match(WORD) ?? []).filter((w) => w.length >= 4));
const CODE = /`[^`\n]*`/g;
const plainWords = (s) => longWords(s.replace(/`[^`\n]*`|\*\*[^*\n]*\*\*/g, " "));
const values = (s) => new Set((s.match(CODE) ?? []).map((v) => v.slice(1, -1).toLowerCase()));
// The parts of a line that a disposition must carry, each as its words of four letters or more.
const parts = (line) => line.replace(/`[^`\n]*`|\*\*[^*\n]*\*\*/g, " ").split(/[|;]|[.!?](?=\s|$)/)
  .map((part) => ({ text: part.trim(), words: longWords(part) })).filter((part) => part.words.size);
// The parts of a line that give a value in a code span, each with those values and its words outside them.
const valued = (line) => line.split(/[|;]|[.!?](?=\s|$)/)
  .map((part) => ({ values: values(part), words: plainWords(part) })).filter((part) => part.values.size);
const git = (cwd, ...args) => execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8", maxBuffer: 1 << 28,
  stdio: ["ignore", "pipe", "ignore"] });

// The Markdown files under `dir` as they were at `base`, by path relative to `dir`: every file when `base` is a
// directory, the files that differ from the working tree when it is a revision.
function before(dir, base) {
  const files = new Map();
  if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
    const root = path.resolve(base);
    for (const f of markdownUnder(root)) files.set(path.relative(root, f).split(path.sep).join("/"), read(f));
    return files;
  }
  let top;
  try {
    top = git(dir, "rev-parse", "--show-toplevel").trim();
    git(top, "rev-parse", "--verify", "--quiet", `${base}^{commit}`);
  } catch { throw new Error(`${base} is neither a directory nor a revision of the repository that holds ${dir}`); }
  const rel = path.relative(top, fs.realpathSync(dir)).split(path.sep).join("/");
  const changed = git(top, "diff", "--name-only", "-z", "--no-renames", base, "--", rel || ".").split("\0");
  for (const f of changed.filter((f) => f.endsWith(".md"))) {
    let text;
    try { text = git(top, "show", `${base}:${f}`); } catch { continue; } // a file the edit added
    files.set(rel ? f.slice(rel.length + 1) : f, text);
  }
  return files;
}

// One letter added, dropped or changed, or two neighbours swapped.
function oneSlip(a, b) {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
  const x = a.slice(i, a.length - j), y = b.slice(i, b.length - j);
  return (x.length <= 1 && y.length <= 1) || (x.length === 2 && y.length === 2 && x[0] === y[1] && x[1] === y[0]);
}
const letters = (token) => token.match(/^([^\p{L}]*)([\p{L}][\p{L}'’-]*)?([^\p{L}]*)$/u);
// Does `now`, a file's words, hold `was`, a line's words, but for one misspelt word that `words` no longer has?
function respelt(was, now, words) {
  scan: for (let at = 0; at + was.length <= now.length; at++) {
    let slip = -1;
    for (let k = 0; k < was.length; k++) {
      if (was[k] === now[at + k]) continue;
      if (slip >= 0) continue scan;
      slip = k;
    }
    if (slip < 0) return true;
    const a = letters(was[slip]), b = letters(now[at + slip]);
    if (a?.[2] && b?.[2] && a[1] === b[1] && a[3] === b[3] && a[2].length >= 4 && oneSlip(a[2], b[2]) && !words.has(a[2]))
      return true;
  }
  return false;
}

function answers(file) {
  const found = new Map(), problems = [];
  read(file).split("\n").forEach((line, i) => {
    if (!line.trim() || line.trim().startsWith("#")) return;
    const m = line.match(/^\s*(moved|retired|reworded)\s*\|\s*(\S+):(\d+)\s*\|\s*(\S+):(\d+)\s*\|\s*(.+?)\s*$/);
    const word = m?.[1] === "reworded" ? m[6].match(/^([^=]+?)\s*=>\s*(.+)$/) : null;
    if (!m || (m[1] === "reworded" && !word)) return void problems.push(`line ${i + 1} is none of \`moved | <file>:<line> | <file>:<line> | <quote>\`, `
      + "`retired | ...` and `reworded | <file>:<line> | <file>:<line> | <word> => <quote>`");
    const quote = (word ? word[2] : m[6]).replace(/^"(.*)"$/, "$1"), id = `${m[2]}:${m[3]}`;
    found.set(id, [...(found.get(id) ?? []), { kind: m[1], file: m[4], line: Number(m[5]), quote, at: i + 1,
      words: word ? word[1].toLowerCase().match(WORD) ?? [] : [] }]);
  });
  return { found, problems };
}

// The lines of `dir` at `base` that nothing carries now: `lost` have no answer that holds, each with the `parts`
// its `moved` lines leave uncarried, the words `gone` from every file and the `changed` values; `answered` have
// dispositions that hold and carry them; `problems` says why a disposition does not hold. A dispositions file
// that does not exist is read as empty. Changes nothing.
export function preserved(dir, base, dispositions) {
  const root = path.resolve(dir);
  const isBaseDir = fs.existsSync(base) && fs.statSync(base).isDirectory();
  const bound = fs.existsSync(path.join(root, "SKILL.md")) ? path.dirname(root) : root;
  const texts = markdownUnder(bound).map(read);
  const now = texts.map(collapse).join(" \n ");
  const words = new Set(texts.flatMap((t) => t.toLowerCase().match(WORD) ?? []));
  const said = new Set(texts.flatMap((t) => [...plainWords(t)]));
  const { found, problems } = dispositions && fs.existsSync(dispositions) ? answers(dispositions)
    : { found: new Map(), problems: [] };
  const within = (outer, p) => p === outer || inside(outer, p);
  // Why one disposition for `line` does not hold, or null.
  const refused = (answer, line) => {
    const from = answer.kind === "retired" ? path.dirname(path.resolve(dispositions)) : root;
    const place = path.resolve(from, answer.file), quote = collapse(answer.quote);
    const window = fs.existsSync(place) && fs.statSync(place).isFile()
      ? collapse(read(place).split("\n").slice(answer.line - 1, answer.line + 4).join("\n")) : null;
    const shared = [...longWords(line)].some((w) => longWords(answer.quote).has(w));
    return window === null ? `${answer.file} is not a file`
      : quote.length <= 12 ? "the quote is too short to find"
      : !window.includes(quote) ? `the quote is not at ${answer.file}:${answer.line}; copy it from within five lines of that line`
      : answer.kind !== "retired" && (isBaseDir && within(path.resolve(base), place)) ? "the place is in the copy from before the edit"
      : answer.kind === "moved" && longWords(line).size && !shared ? "the quote shares no word with the lost line"
      : answer.kind === "retired" && within(root, place) ? "the user's words must stand outside the directory checked"
      : null;
  };
  const lost = [], answered = [], was = before(root, base), stood = new Map();
  for (const text of was.values()) for (const line of text.split("\n"))
    for (const w of plainWords(line)) stood.set(w, (stood.get(w) ?? 0) + 1);
  for (const [rel, text] of was) {
    const same = path.join(root, rel);
    const here = fs.existsSync(same) ? collapse(read(same)).split(" ") : [];
    text.split("\n").forEach((line, i) => {
      const was = collapse(line);
      if (was.length <= 12 || onlyLinks(line) || now.includes(was) || respelt(was.split(" "), here, words)) return;
      const id = `${rel}:${i + 1}`, given = found.get(id) ?? [];
      const candidate = { id, text: line.trim(), parts: [], gone: [], changed: [] };
      if (!given.length) return void lost.push(candidate);
      const bad = given.map((answer) => [answer, refused(answer, line)]).filter(([, why]) => why);
      for (const [answer, why] of bad) problems.push(`line ${answer.at}, for ${id}: ${why}`);
      if (bad.length) return void lost.push(candidate);
      if (!given.some((answer) => answer.kind === "retired")) {
        const carried = new Set(given.flatMap((answer) => [...longWords(answer.quote)]));
        const named = new Set(given.flatMap((answer) => answer.words));
        candidate.parts = parts(line).filter((part) => ![...part.words].some((w) => carried.has(w))).map((part) => part.text);
        candidate.gone = [...plainWords(line)].filter((w) => stood.get(w) === 1 && !said.has(w) && !carried.has(w) && !named.has(w));
        for (const part of valued(line)) for (const w of part.words) {
          const carriers = given.filter((answer) => longWords(answer.quote).has(w));
          const kept = carriers.some((answer) => !values(answer.quote).size || [...part.values].some((v) => values(answer.quote).has(v)));
          if (carriers.length && !kept && carriers.every((answer) => answer.file === rel)) candidate.changed.push(
            `${w}: was ${[...part.values].join(", ")}; now ${[...new Set(carriers.flatMap((answer) => [...values(answer.quote)]))].join(", ")}`);
        }
      }
      (candidate.parts.length || candidate.gone.length || candidate.changed.length ? lost : answered).push(candidate);
    });
  }
  return { lost, answered, problems };
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
  const dirs = [], option = {};
  for (let args = process.argv.slice(2), i = 0; i < args.length; i++) {
    if (args[i] === "--against" || args[i] === "--dispositions") option[args[i].slice(2)] = args[++i] ?? "";
    else dirs.push(args[i]);
  }
  const usage = (refused) => {
    console.error(`check.mjs: ${refused}\n`
      + "usage: node check.mjs <skill-directory> [<skill-directory> ...]\n"
      + "       node check.mjs <directory> --against <revision or directory> [--dispositions <file>]");
    process.exit(2);
  };
  for (const [name, value] of Object.entries(option)) if (value === "") usage(`--${name} needs a value after it`);
  const unknown = dirs.find((d) => d.startsWith("-"));
  if (unknown) usage(`${unknown} is not an option; the options are --against and --dispositions`);
  if (!dirs.length) usage("no directory was named");
  if ("against" in option) {
    if (dirs.length !== 1) usage(`--against takes one directory, and ${dirs.length} were named: ${dirs.join(", ")}`);
    if (!fs.existsSync(dirs[0])) usage(`${dirs[0]} does not exist`);
    let result;
    try { result = preserved(dirs[0], option.against, option.dispositions); }
    catch (error) { usage(error.message); }
    const { lost, answered, problems } = result, file = option.dispositions;
    if (file && !fs.existsSync(file)) console.log(`note  ${file} does not exist yet and is read as empty; write the answers there`);
    for (const c of lost) {
      console.log(`LOST  ${c.id}: ${c.text}`);
      if (c.parts.length) console.log(`      no \`moved\` line carries: ${c.parts.join(" / ")}`);
      if (c.gone.length) console.log(`      gone from every file: ${c.gone.join(", ")}. Put back the sentence that held ${c.gone.length > 1 ? "them" : "it"}; or, only`
        + ` where the same thing is now said in other words, add:\n      reworded | ${c.id} | <file>:<line> | ${c.gone.join(", ")} => <the words there that say it now>`);
      if (c.changed.length) console.log(`      a value changed in place: ${c.changed.join(" / ")}. A move changes no value: put the old value`
        + " back, or answer the line with `retired` and the user's words.");
      if (!c.gone.length && !c.changed.length)
        console.log(`      moved | ${c.id} | <file>:<line where its fact is stated now> | <the words there that state it, its values included>`);
    }
    for (const p of problems) console.log(`BAD   ${file}: ${p}`);
    if (lost.length) console.log(`      Each LOST line stood in the files before and stands nowhere now. Answer it in ${file ?? "a file named after --dispositions"}:\n`
      + "      - one `moved` line for each place a fact of it is stated now, the words copied from that place, not your own;\n"
      + "      - a copy that disagreed with the file that owns the fact takes the owner's line, and the owner's value stays;\n"
      + "      - a fact stated nowhere is put back, or moved to the file that owns it. Your judgement that it is not needed\n"
      + "        drops nothing; only the user's words do:\n"
      + "        retired | <the same first place> | <file>:<line of the user's saved message> | <the user's words>");
    console.log(`${lost.length ? "FAIL" : "ok  "}  ${dirs[0]} against ${option.against}: ${lost.length} line(s) lost, `
      + `${answered.length} answered by a disposition`);
    process.exit(lost.length || problems.length ? 1 : 0);
  }
  if ("dispositions" in option) usage("--dispositions is read only with --against");
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
