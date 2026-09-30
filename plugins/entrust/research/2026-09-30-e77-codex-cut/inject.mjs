// Build the text Claude Code puts in context for a skill page: base line + body without frontmatter,
// placeholders substituted, the !`status.mjs` line replaced by its captured output; optionally cut as compaction cuts.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const [skillMd, baseDir, statusFile, out, cut] = process.argv.slice(2);
let body = fs.readFileSync(skillMd, "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
body = body.replaceAll("${CLAUDE_SKILL_DIR}", baseDir)
  .replaceAll("${CLAUDE_PLUGIN_DATA}", path.join(os.homedir(), ".claude/plugins/data/entrust-nowely"))
  .replace(/^!`node "[^"]*\/scripts\/status\.mjs"`$/m, fs.readFileSync(statusFile, "utf8").trimEnd());
let text = `Base directory for this skill: ${baseDir}\n\n${body}`;
if (cut === "cut" && text.length > 20001) text = text.slice(0, 19900) + "\n\n[... skill content truncated for compaction; use Read on the skill path if you need the full text]";
fs.writeFileSync(out, text);
console.log(out, text.length, "chars", text.split("\n").length, "lines");
