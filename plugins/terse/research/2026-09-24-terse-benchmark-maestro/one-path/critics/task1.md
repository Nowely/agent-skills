status: done

result:
GOAL: achieved

Installed Maestro by the document’s Claude Code route and stopped before entering the first command in agent chat.

Resulting state:
- Scratch root: $TMPDIR/maestro-reader.HYJxFd
- Project: $TMPDIR/maestro-reader.HYJxFd/project
- Initial commit: 45d6564, containing package.json, src/greet.js, and src/index.js.
- Canonical installation: .agents/skills contains 32 regular files: 25 SKILL.md files plus 7 agent-workflow reference files.
- Claude Code installation: .claude/skills contains 25 skill-directory symlinks exposing the same 25 SKILL.md files.
- The installer also wrote skills-lock.json.
- Git state after installation: ?? .agents/, ?? .claude/, ?? skills-lock.json.

The document says to type first `/teach-maestro`, then `/diagnose`, both in the coding agent’s interface—here, Claude Code chat. Per the harness instruction, neither was entered. The first command would find the 25 Claude-visible SKILL.md paths listed in evidence.

Guesses:
- The undocumented npx bootstrap prompt asked to install skills@1.7.0. I answered `y`, because declining would prevent the documented command from running. Wished-for sentence: “If npx asks to install the `skills` package, approve the prompt.”
- I inferred that the generic Quick start is the intended Claude Code route; the document does not give a separately labeled Claude Code procedure. Wished-for sentence: “For Claude Code, run the Quick start command and then use the slash commands in Claude Code chat.”
- The document does not explain that this installer stores canonical files in `.agents/skills` and creates Claude-specific symlinks in `.claude/skills`. Wished-for sentence: “For Claude Code, the installer writes canonical skills under `.agents/skills` and symlinks them from `.claude/skills`.”

Promises not verifiable from project state without opening installed files or running chat commands:
- That Claude Code recognizes the installed skills as 24 slash commands.
- That each command points to the next.
- That commands load the core skill and read `.maestro.md` first.
- That `/teach-maestro` conducts the described interview and writes `.maestro.md`.
- That `/diagnose` produces five 1–5 scores, findings, and next-command recommendations.
- The behavioral claims about avoiding over-building, auditing, fixing, hardening, and reducing cost.
- That rerunning the same installer command performs an update.

Sentences found untrue: none observed. All directly testable installation-count claims were consistent: the installer found and installed 25 skills. The remaining claims above are unknown, not treated as false.

evidence:
- 1. `cat $TMPDIR/terse-bench-D/writer/draft.md` — exit 0. Output: the complete supplied Maestro draft, beginning `# Maestro` and ending with the `npm run build` / `npm run check` contributing block. This was the only file opened.
- 2. `mktemp -d $TMPDIR/maestro-reader.XXXXXX` — exit 0. Output: `$TMPDIR/maestro-reader.HYJxFd`.
- 3. `mkdir project npm-cache` — exit 0. Output: empty.
- The three initial project files were created with the workspace patch operation, not by a shell command; no installed file was opened.
- 4. `git init` — exit 0. Output: `Initialized empty Git repository in /private$TMPDIR/maestro-reader.HYJxFd/project/.git/`.
- 5. `git add package.json src/index.js src/greet.js` — exit 0. Output: empty.
- 6. `git -c user.name='Fresh Reader' -c user.email='fresh.reader@example.invalid' commit -m 'Initial project'` — exit 0. Output: `[main (root-commit) 45d6564] Initial project`; `3 files changed, 5 insertions(+)`; created package.json, src/greet.js, and src/index.js.
- 7. `export npm_config_cache=$TMPDIR/maestro-reader.HYJxFd/npm-cache; npx skills add sharpdeveye/maestro --skill '*'` — exit 0 after answering `y` to `Need to install the following packages: skills@1.7.0; Ok to proceed? (y)`. Output reported: Claude Code agent detected; source `https://github.com/sharpdeveye/maestro.git`; repository cloned; `Found 25 skills`; `Installing all 25 skills`; canonical paths under `./.agents/skills/`; Claude Code symlinks; `Installation complete`; `Installed 25 skills`; `Done! Review skills before use; they run with full agent permissions.`
- 8. `find -L .claude/skills -name SKILL.md -type f -print | sort` — exit 0. Output: `.claude/skills/accelerate/SKILL.md`, `.claude/skills/adapt-workflow/SKILL.md`, `.claude/skills/agent-workflow/SKILL.md`, `.claude/skills/amplify/SKILL.md`, `.claude/skills/calibrate/SKILL.md`, `.claude/skills/capture/SKILL.md`, `.claude/skills/chain/SKILL.md`, `.claude/skills/compose/SKILL.md`, `.claude/skills/diagnose/SKILL.md`, `.claude/skills/enrich/SKILL.md`, `.claude/skills/evaluate/SKILL.md`, `.claude/skills/extract-pattern/SKILL.md`, `.claude/skills/fortify/SKILL.md`, `.claude/skills/guard/SKILL.md`, `.claude/skills/iterate/SKILL.md`, `.claude/skills/onboard-agent/SKILL.md`, `.claude/skills/recap/SKILL.md`, `.claude/skills/refine/SKILL.md`, `.claude/skills/reflect/SKILL.md`, `.claude/skills/specialize/SKILL.md`, `.claude/skills/streamline/SKILL.md`, `.claude/skills/teach-maestro/SKILL.md`, `.claude/skills/temper/SKILL.md`, `.claude/skills/turbocharge/SKILL.md`, `.claude/skills/zero-defect/SKILL.md`.
- 9. `find -L .claude/skills -name SKILL.md -type f -print | wc -l` — exit 0. Output: `25`.
- 10. `find .agents/skills -name SKILL.md -type f -print | sort` — exit 0. Output: the same 25 skill names under `.agents/skills/<name>/SKILL.md`.
- 11. `find .agents/skills -name SKILL.md -type f -print | wc -l` — exit 0. Output: `25`.
- 12. `find .claude/skills -mindepth 1 -maxdepth 1 -type l -print | sort` — exit 0. Output: 25 symlinks, one for each of accelerate, adapt-workflow, agent-workflow, amplify, calibrate, capture, chain, compose, diagnose, enrich, evaluate, extract-pattern, fortify, guard, iterate, onboard-agent, recap, refine, reflect, specialize, streamline, teach-maestro, temper, turbocharge, and zero-defect.
- 13. `find .agents/skills -type f -print | sort` — exit 0. Output: the 25 SKILL.md paths plus `.agents/skills/agent-workflow/reference/agent-architecture.md`, `context-management.md`, `feedback-loops.md`, `guardrails-safety.md`, `knowledge-systems.md`, `prompt-engineering.md`, and `tool-orchestration.md`.
- 14. `find .agents/skills -type f -print | wc -l` — exit 0. Output: `32`.
- 15. `find . -path './.git' -prune -o -print | sort` — exit 0. Output listed the original project files, `.agents/skills` tree, 25 `.claude/skills` entries, and `skills-lock.json`; `.git` was pruned.
- 16. `git status --short` — exit 0. Output: `?? .agents/`; `?? .claude/`; `?? skills-lock.json`. No installed file content was opened by any inspection command.

open:
- Intentionally stopped before typing `/teach-maestro` in Claude Code chat, as required. Therefore `.maestro.md` was not created and `/diagnose` was not attempted.
- Behavioral and update promises listed in result remain unknown because verifying them would require opening installed files, executing agent-chat commands, or rerunning the installer beyond the requested stopping point.

(Codex Sol, 3.1 min, 16 commands)
