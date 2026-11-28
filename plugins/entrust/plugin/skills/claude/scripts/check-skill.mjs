#!/usr/bin/env node
// Claude-specific rules and installed plugin layout, composed with the common checker.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main, rules, skillAt, LIMITS as COMMON, frontmatter, body, bodyLines, links, targets, read, lineCount, lineAt } from "../../rnd/scripts/check.mjs";

export const LIMITS = { ...COMMON, listing: 1536, reattached: 20001, kept: 19900, preview: 100, path: 120 };
const HEAD = "Base directory for this skill: ".length + "\n\n".length;

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

export function claudeSkillAt(dir, options = {}) {
  const root = path.resolve(dir), beside = path.dirname(root), plugin = path.dirname(beside);
  const whole = path.basename(beside) === "skills" && fs.existsSync(path.join(plugin, ".claude-plugin", "plugin.json"));
  return skillAt(root, { ...options, installed: options.installed ?? (whole ? plugin : beside) });
}

export function claudeRules(skills, rel = (p) => p) {
  const { found, pages } = rules(skills, rel);
  const field = (s, collect) => {
    try { return collect(frontmatter(s.file)); } catch (e) { return [`${rel(s.file)}: ${e.message}`]; }
  };
  const extra = [
    [2, "description plus when_to_use is at most 1,536 characters (Claude Code's listing cuts the rest)", () => skills.flatMap((s) => field(s, (fm) => {
      // The vendor: "the combined `description` and `when_to_use` text is truncated at 1,536 characters in the
      // skill listing". Counted on the values after YAML folds them.
      const parts = [fm.description ?? "", fm.when_to_use ?? ""];
      if (parts.some((p) => typeof p !== "string")) return [`${rel(s.file)}: a field is not a string`];
      const n = parts[0].length + parts[1].length;
      return n <= LIMITS.listing ? [] : [`${rel(s.file)}: ${n} characters`];
    }))],
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
    [7, "no backslash in a link target (Anthropic's guide)", () => pages.flatMap((f) => links(f)
      // The vendor: "Always use forward slashes in file paths, even on Windows"
      .filter((l) => l.target.includes("\\"))
      .map((l) => `${rel(f)}:${l.line}: ${l.target}`))],
  ].map(([n, title, collect]) => {
    try { return [n, title, collect()]; } catch (e) { return [n, title, [`threw: ${e.stack}`]]; }
  });
  return { found: [...found, ...extra].sort((a, b) => a[0] - b[0]), pages };
}

function room(skill) {
  let fm = {};
  try { fm = frontmatter(skill.file); } catch { return ""; }
  const len = (v) => typeof v === "string" ? v.trim().length : 0;
  return `name ${len(fm.name)}/${LIMITS.name}, description ${len(fm.description)}/${LIMITS.description}, `
    + `description with when_to_use ${len(fm.description) + len(fm.when_to_use)}/${LIMITS.listing}, `
    + `body ${bodyLines(skill.file)}/${LIMITS.bodyLines - 1} lines and ${reattached(skill.file).length}/${LIMITS.reattached} `
    + `characters, a contents list from line ${LIMITS.preview + 1} of a reference`;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url))
  main({ check: claudeRules, makeSkill: claudeSkillAt, describe: room });
