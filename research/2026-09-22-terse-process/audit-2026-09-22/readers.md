# The sixteen readers — full returns, 2026-09-22

Fourteen Codex gpt-5.6-luna question readers (seven with the documentation, seven without) and two Codex gpt-5.6-sol task readers; the `answerJson` of each driver report, verbatim, with the command count.


## Q1d — with the documentation — commands: 3

```json
{
 "answer": "Run `claude plugin marketplace add Nowely/agent-skills`, then `claude plugin install terse@nowely`.",
 "files": [
  "~/Git/agent-skills/plugins/terse/README.md"
 ],
 "steps": 1,
 "departed": "no",
 "quote": "README.md:47-48 — “The same two steps from a shell: `claude plugin marketplace add Nowely/agent-skills`, then `claude plugin install terse@nowely`.”"
}
```


## Q1n — no documentation — commands: 0

```json
{
 "answer": "I do not know.",
 "files": [],
 "steps": 0,
 "departed": "no",
 "quote": "none"
}
```


## Q2d — with the documentation — commands: 2

```json
{
 "answer": "No. It writes only to its own run directory; changing your files requires your explicit approval.",
 "files": [
  "~/Git/agent-skills/plugins/terse/README.md"
 ],
 "steps": 1,
 "departed": "no",
 "quote": "plugins/terse/README.md:35-36 — “It writes into its own run directory. Applying anything to your files needs your word.”"
}
```


## Q2n — no documentation — commands: 0

```json
{
 "answer": "I do not know whether it can change your files.",
 "files": [],
 "steps": 0,
 "departed": "no",
 "quote": "none"
}
```


## Q3d — with the documentation — commands: 2

```json
{
 "answer": "Run `/terse:audit` first. It checks whether the existing README gives readers the right answers and produces a run file for `/terse:rewrite`; use `/terse:rethink` first only when planning a document from scratch.",
 "files": [
  "~/Git/agent-skills/plugins/terse/README.md"
 ],
 "steps": 1,
 "departed": "no",
 "quote": "~/Git/agent-skills/plugins/terse/README.md:11 — `/terse:audit    →  run file  →  /terse:rewrite  →  candidate + diff  →  /terse:audit again`"
}
```


## Q3n — no documentation — commands: 0

```json
{
 "answer": "I do not know which of the three you should run first.",
 "files": [],
 "steps": 0,
 "departed": "no",
 "quote": "none"
}
```


## Q4d — with the documentation — commands: 2

```json
{
 "answer": "You get proposed fixes, not an automatic rewrite of your file. It creates a candidate and diff in its own run directory, and applying changes to your files requires your explicit approval.",
 "files": [
  "~/Git/agent-skills/plugins/terse/README.md"
 ],
 "steps": 1,
 "departed": "no",
 "quote": "It writes into its own run directory. Applying anything to your files needs your word. — ~/Git/agent-skills/plugins/terse/README.md:35-36"
}
```


## Q4n — no documentation — commands: 0

```json
{
 "answer": "I do not know whether terse applies targeted fixes or rewrites the whole file.",
 "files": [],
 "steps": 0,
 "departed": "no",
 "quote": "none"
}
```


## Q5d — with the documentation — commands: 3

```json
{
 "answer": "No. A later pass is required to preserve verified claims; if it removes one or revives retired wording, the round fails rather than being accepted.",
 "files": [
  "~/Git/agent-skills/plugins/terse/README.md",
  "~/Git/agent-skills/plugins/terse/skills/rewrite/references/loop.md",
  "~/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md"
 ],
 "steps": 3,
 "departed": "no",
 "quote": "`ledger.mjs` fails a round that loses a claim or revives a retired phrase. — ~/Git/agent-skills/plugins/terse/skills/rewrite/references/loop.md:70"
}
```


## Q5n — no documentation — commands: 0

```json
{
 "answer": "I do not know.",
 "files": [],
 "steps": 0,
 "departed": "no",
 "quote": "none"
}
```


## Q6d — with the documentation — commands: 3

```json
{
 "answer": "Only sometimes. It is not designed as a compressor: it shortened the measured document by 6%, but difficult explanations may remain long. It mainly cuts text that is wrong.",
 "files": [
  "~/Git/agent-skills/plugins/terse/README.md"
 ],
 "steps": 1,
 "departed": "no",
 "quote": "README.md:53-56 — “It makes documentation truer and easier to answer from. It is not a compressor. On the one file measured, the chain moved 2,725 words to 2,571 — six percent — while the second pass cut 105 words and the third added 105 back as missing framing. If your text is long because it is wrong, this shortens it. If it is long because it explains something hard, it will stay long and start being right.”"
}
```


## Q6n — no documentation — commands: 0

```json
{
 "answer": "I do not know.",
 "files": [],
 "steps": 0,
 "departed": "no",
 "quote": "none"
}
```


## Q7d — with the documentation — commands: 2

```json
{
 "answer": "Yes. Readers are sent through the Markdown documentation in the same way, starting where a real reader would start; the documentation’s language does not change that described reading path.",
 "files": [
  "~/Git/agent-skills/plugins/terse/README.md"
 ],
 "steps": 1,
 "departed": "no",
 "quote": "~/Git/agent-skills/plugins/terse/README.md:18 — \"then sends one fresh reader per question through the documentation — `.md` only, starting where a\""
}
```


## Q7n — no documentation — commands: 0

```json
{
 "answer": "I do not know.",
 "files": [],
 "steps": 0,
 "departed": "no",
 "quote": "none"
}
```


## TA — task reader — commands: 24

### status

done

### result

Codex Sol TA: done, installed terse 0.1.1 in an isolated Claude config and started the scratch README audit through its first question.
COMMAND `nl -ba ~/Git/agent-skills/plugins/terse/README.md` — exit 0
COMMAND `mktemp -d "$TMPDIR/terse-ta.XXXXXX"` — exit 0
COMMAND `mkdir -p $TMPDIR/terse-ta.I7F5yq/repo $TMPDIR/terse-ta.I7F5yq/claude-config` — exit 0
COMMAND `git init` — exit 0
COMMAND `git add README.md` — exit 0
COMMAND `git commit -m "Add Glint README"` — exit 0; commit 7141aa8
COMMAND `rg --files ~/Git/agent-skills/plugins/terse -g '*.md'` — exit 0
COMMAND `nl -ba ~/Git/agent-skills/plugins/terse/skills/audit/SKILL.md` — exit 0
COMMAND `CLAUDE_CONFIG_DIR=$TMPDIR/terse-ta.I7F5yq/claude-config claude plugin marketplace add ~/Git/agent-skills` — exit 0
COMMAND `CLAUDE_CONFIG_DIR=$TMPDIR/terse-ta.I7F5yq/claude-config claude plugin install terse@nowely` — exit 0
COMMAND `CLAUDE_CONFIG_DIR=$TMPDIR/terse-ta.I7F5yq/claude-config claude -p "/terse:audit"` — exit 1; `Not logged in · Please run /login`
COMMAND `claude auth status` — exit 0
COMMAND `find ~/.claude -maxdepth 1 -type f -print` — exit 0
COMMAND `find ~ -maxdepth 1 -name '.claude*' -print` — exit 0
COMMAND `find $TMPDIR/terse-ta.I7F5yq/claude-config -maxdepth 2 -print` — exit 0
COMMAND `cp ~/.claude.json $TMPDIR/terse-ta.I7F5yq/claude-config/.claude.json` — exit 0
COMMAND `CLAUDE_CONFIG_DIR=$TMPDIR/terse-ta.I7F5yq/claude-config claude auth status` — exit 1; remained unauthenticated
COMMAND `env | cut -d= -f1 | rg '^(ANTHROPIC|CLAUDE)'` — exit 127; `zsh:1: command not found: rg`
COMMAND `env | cut -d= -f1 | grep -E '^(ANTHROPIC|CLAUDE)'` — exit 0
COMMAND `find $TMPDIR/terse-ta.I7F5yq/claude-config/plugins/cache -maxdepth 4 -type d -print` — exit 0
COMMAND `claude --plugin-dir $TMPDIR/terse-ta.I7F5yq/claude-config/plugins/cache/nowely/terse/0.1.1 -p "/terse:audit"` — exit 0 after interruption; emitted `Execution error`
COMMAND `env -u CLAUDECODE claude -p "Reply only ok"` — exit 0
COMMAND `env -u CLAUDECODE claude --plugin-dir $TMPDIR/terse-ta.I7F5yq/claude-config/plugins/cache/nowely/terse/0.1.1 -p "/terse:audit"` — exit 0 after interruption; emitted `Execution error`
COMMAND `env -u CLAUDECODE claude --plugin-dir $TMPDIR/terse-ta.I7F5yq/claude-config/plugins/cache/nowely/terse/0.1.1` — exit 0 after `/terse:audit` reached its first question and `/exit` closed the session
FIRST ASK: The documented first exchange settles (1) which files are documentation, (2) which repository backs them, and (3) the reader entry file (`skills/audit/SKILL.md:23-28`). Terse proposed `README.md`, no backing repository, and `README.md`, then its first direct question was: “Does Glint's code exist anywhere else, or a binary I could be pointed at? If not, I proceed in the weak form.” It also requested corrections to the proposed scope/profile and answers to four further profile questions. I did not answer.
OUTPUT: The eventual report is `$RUN/audit.md`, where `RUN="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}/terse}/runs/<timestamp>"` (`skills/audit/SKILL.md:30-38,149`). It is outside the audited repository because line 40 forbids writing anything into that repository. No run directory was created before the first question, and the exact expansion of `CLAUDE_PLUGIN_DATA` inside this launch was not observed.
GUESS — `~/Git/agent-skills` could replace the documented remote marketplace name in `claude plugin marketplace add`; made at `README.md:47`, correct.
GUESS — prefixing both installation commands with `CLAUDE_CONFIG_DIR=<scratch>/claude-config` was the isolation mechanism; made at `README.md:47-48`, correct for installation.
GUESS — `claude -p "/terse:audit"` was a valid shell rendering of the documented slash invocation; made at `README.md:10-11`, syntactically correct but unusable initially because the isolated profile was unauthenticated and later because repository trust blocked print mode.
GUESS — copying `~/.claude.json` into the isolated configuration would transfer authentication; made after `README.md:48` said nothing else was needed, wrong.
GUESS — the installed cache could be launched with the authenticated profile through `--plugin-dir` without installing into the real profile; made from `README.md:47-48`, correct.
GUESS — the inherited `CLAUDECODE` marker caused the authenticated child CLI hang, so removing it was safe; made while applying the invocation shown at `README.md:10-11`, correct for a control prompt, though print-mode audit still waited on trust.
GUESS — trusting the newly created repository was appropriate; forced by an undocumented setup prompt after the invocation at `README.md:10-11`, correct.
GUESS — allowing the installed plugin to read its own files and selecting auto mode would let Step 1 reach its question; forced by omissions around `README.md:47-48` and required to apply `skills/audit/SKILL.md:23-28`, correct.
GUESS — the exact output root would use the fallback `$TMPDIR/terse` when launched through `--plugin-dir`; considered at `skills/audit/SKILL.md:33-38`, unresolved because the plugin environment value was not observed.

### evidence

- Opened 2 allowed Markdown files directly: plugin README.md (90 lines) and audit SKILL.md (169 lines).
- Listed 17 Markdown paths under the terse plugin without opening their contents.
- Ran 24 shell commands: 19 exited 0 normally, 2 exited 0 after interruption, 2 exited 1, and 1 exited 127.
- Created one README containing a heading and three prose paragraphs; committed 7 lines in commit 7141aa8.
- Observed successful marketplace addition and successful `terse@nowely` installation, reporting version 0.1.1 from the installed cache path.
- Observed the live `/terse:audit` response through its first substantive question; supplied no audit answer.

### artifacts

- $TMPDIR/terse-ta.I7F5yq/repo
- $TMPDIR/terse-ta.I7F5yq/claude-config

### open

- The exact audit run directory is unknown and was not created because execution stopped at the first question, as requested.
- The isolated Claude configuration cannot authenticate independently; the successful audit launch used the isolated installed cache through `--plugin-dir` with the machine's authenticated Claude profile.
- No audit findings, score, ledger, or `audit.md` exist yet because scope/profile questions remain unanswered.


## TB — task reader — commands: 12

### status

done

### result

Codex Sol TB: done, reconstructed the audit-to-candidate workflow without running rewrite or changing any file.

PLAN — one invocation/action per line
1. Invoke `/terse:rewrite`; the documented chain is audit run file → rewrite → candidate and diff (`plugins/terse/README.md:10-12`). No argument syntax is documented.
2. When asked, provide `<AUDIT_RUN_ABS>`; rewrite explicitly asks for the audit run directory and reads `audit.md` there (`plugins/terse/skills/rewrite/SKILL.md:27-30`).
3. Read the audit’s `Reader profile` and `What broke` sections (`plugins/terse/skills/rewrite/SKILL.md:29-30`).
4. Assemble the audit-route brief in the documented order (`plugins/terse/skills/rewrite/SKILL.md:32-50`).
5. Approve or refuse the announced first fan-out before any agents spawn; if refused, rewrite produces one candidate itself (`plugins/terse/skills/rewrite/SKILL.md:52-62`).
6. Run the adversarial whole-document read first, then the three-writer/two-judge bake-off (`plugins/terse/skills/rewrite/SKILL.md:52-58`; `plugins/terse/skills/rewrite/references/bake-off.md:17-31`).
7. Choose the winning candidate by repaired failures, using re-audit only to break a real tie, and graft any unique repairs from losers (`plugins/terse/skills/rewrite/references/bake-off.md:134-148`).
8. Before repository output begins, create `research/<date>-<slug>/`, copy the audit file into it, and place the original and candidate rounds there (`plugins/terse/skills/rewrite/SKILL.md:64-71`).
9. Invoke `node "$S/selftest.mjs"` once for the session (`plugins/terse/skills/rewrite/SKILL.md:73-75`).
10. Create the per-document control files and local skeleton described in Step 4 (`plugins/terse/skills/rewrite/SKILL.md:80-93`).
11. From the rewrite run directory invoke `node "$A/ledger-seed.mjs" audit.md ledger.json` (`plugins/terse/skills/rewrite/SKILL.md:90-93`).
12. For each subsequent round, write `edits/NN.json` (`plugins/terse/skills/rewrite/SKILL.md:94-105`).
13. Invoke `node "$S/round.mjs" <NN-1>-<pass>.md <NN>-<pass>.md edits/NN.json --ledger ledger.json` (`plugins/terse/skills/rewrite/SKILL.md:106`).
14. Invoke `node "$S/rule1.mjs" "$R" --cut "<technical section heading>" --except "<section that may carry paths>"` (`plugins/terse/skills/rewrite/SKILL.md:107-109`).
15. Invoke `node "$S/dup.mjs" "$R" concepts.json` (`plugins/terse/skills/rewrite/SKILL.md:109-110`).
16. Invoke `node "$S/sections.mjs" "$R" budgets.json` (`plugins/terse/skills/rewrite/SKILL.md:110-111`).
17. Invoke `node "$S/ledger.mjs" ledger.json $(ls [0-9][0-9]-*.md | sort)` (`plugins/terse/skills/rewrite/SKILL.md:111`).
18. If a new check fails, discard that round, restore `ledger.NN.json`, repair its edits, and repeat invocations 13–17 (`plugins/terse/skills/rewrite/SKILL.md:112-117`).
19. Approve and size the announced verifier/critic wave; the verifier runs first, followed by the selected lenses and dedup (`plugins/terse/skills/rewrite/SKILL.md:118-135`).
20. Verify and route findings, requesting owner decisions for structural, vocabulary, or unanswered-question findings (`plugins/terse/skills/rewrite/SKILL.md:136-140`; `plugins/terse/skills/rewrite/references/loop.md:30-47`).
21. Record the round in `rounds.md` and repeat invocations 12–20 until the handoff condition or announced cap (`plugins/terse/skills/rewrite/SKILL.md:141-175`).
22. Read the handed-over candidate and `diff-NN.patch`, then answer whether it is sendable (`plugins/terse/skills/rewrite/SKILL.md:162-177`).
23. Decline application to `README.md`; applying the candidate requires a separate word from the owner (`plugins/terse/skills/rewrite/SKILL.md:173-177`). This preserves tracked files.

FILES AND DIRECTORIES
OUTSIDE repository, already produced by audit: `<AUDIT_RUN_ABS>/`; audit creates it under `CLAUDE_PLUGIN_DATA` or the TMPDIR fallback and writes nothing into the audited repository (`plugins/terse/skills/audit/SKILL.md:30-40`).
OUTSIDE repository, already produced by audit: `<AUDIT_RUN_ABS>/audit.md` (`plugins/terse/skills/audit/SKILL.md:149-152`; `plugins/terse/skills/audit/references/ledgers.md:7-10`).
OUTSIDE repository, already produced by audit: `<AUDIT_RUN_ABS>/ledger.json` (`plugins/terse/skills/audit/SKILL.md:154-158`).
OUTSIDE repository: one temporary directory per writer, containing `01-reader-pass`, `02-writing-pass`, `03-prerequisite-pass`, and a final candidate; writers are told to put every file there (`plugins/terse/skills/rewrite/references/bake-off.md:42-58`). The final filename is unspecified.
OUTSIDE repository, conditional: `$TMPDIR/critic-config/` when host-application commands need isolated configuration (`plugins/terse/skills/rewrite/references/critic-briefs.md:21-27`).
OUTSIDE repository, conditional: task-reader starting states and outputs under `$TMPDIR` (`plugins/terse/skills/rewrite/references/critic-briefs.md:135-147`).
INSIDE repository: `research/<date>-<slug>/`, the rewrite run directory at repository root (`plugins/terse/skills/rewrite/SKILL.md:64-67`).
INSIDE repository run: copied `audit.md` (`plugins/terse/skills/rewrite/SKILL.md:66-67`).
INSIDE repository run: `00-original.md` and every `NN-<pass>.md`, including the candidate rounds (`plugins/terse/skills/rewrite/SKILL.md:68-69`).
INSIDE repository run: `concepts.json`, `budgets.json`, `tasks.json`, `questions.json`, and `skeleton.md` (`plugins/terse/skills/rewrite/SKILL.md:80-93`).
INSIDE repository run: `ledger.json` (`plugins/terse/skills/rewrite/SKILL.md:90-105`).
INSIDE repository run: `edits/NN.json` and its `edits/` directory (`plugins/terse/skills/rewrite/SKILL.md:94-106`).
INSIDE repository run: `ledger.NN.json` rollback snapshots (`plugins/terse/skills/rewrite/SKILL.md:112-115`).
INSIDE repository run: `reviews/NN/`, including `verifier.md`, critic reports, and dedup output (`plugins/terse/skills/rewrite/SKILL.md:123-135,181-187`). Exact critic-report filenames are unspecified.
INSIDE repository run: `rounds.md` (`plugins/terse/skills/rewrite/SKILL.md:141-144,181-187`).
INSIDE repository run: `diff-NN.patch` against `00-original.md` (`plugins/terse/skills/rewrite/SKILL.md:173-177,188-191`).
INSIDE repository run: a cut ledger, invisible-prerequisite inventory, unreached-sections report, and—conditionally—a structure map (`plugins/terse/skills/rewrite/SKILL.md:188-191`). Their filenames are unspecified.
INSIDE repository, conditional and potentially tracked: `ISSUES.md` receives verified code defects (`plugins/terse/skills/rewrite/SKILL.md:136-140`; `plugins/terse/skills/rewrite/references/loop.md:35-42`). To meet the no-tracked-change requirement, I would not authorize this write.
INSIDE repository, unchanged: `README.md`; applying anything to user files needs the owner’s word (`plugins/terse/README.md:31-36`; `plugins/terse/skills/rewrite/SKILL.md:173-177`).

APPROVAL POINTS
Already passed during the prior audit: correction of the reader profile before the truth pass (`plugins/terse/skills/audit/SKILL.md:42-48`).
Already passed during the prior audit: reader fan-out after count, model, and approximate cost are announced (`plugins/terse/skills/audit/SKILL.md:80-96`).
Before rewrite’s first agents spawn: approve the announced agent count, models, unmeasured writer/judge cost, and round cap; refusal falls back to one self-written candidate (`plugins/terse/skills/rewrite/SKILL.md:52-62,173-175`).
Before every verifier/critic wave: choose each lens’s size, possibly zero, after seeing verifier, lenses, models, sizes, and costs; lenses 1 and 2 are the minimum valid round (`plugins/terse/skills/rewrite/SKILL.md:118-122,146-157`).
Conditionally during routing: answer structural duplication, vocabulary, or unanswered-document questions (`plugins/terse/skills/rewrite/references/loop.md:35-47`).
At handoff: read the round and say whether it is sendable (`plugins/terse/skills/rewrite/SKILL.md:162-177`).
After handoff only: separately approve applying it to `README.md`; I would withhold this approval (`plugins/terse/skills/rewrite/SKILL.md:173-177`).

STOPPING POINT
For nothing at all to be written inside the repository, stop after the writers have returned candidates in their temporary directories (`plugins/terse/skills/rewrite/references/bake-off.md:47-58`) and before Step 4 creates `research/<date>-<slug>/` at repository root (`plugins/terse/skills/rewrite/SKILL.md:64-67`). There is no documented consent gate immediately before that directory creation, so the safest zero-repository-write choice is not to invoke rewrite at all unless the coordinator can enforce this stop.

GUESSES / INVENTIONS
`<AUDIT_RUN_ABS>` — the scenario supplies no literal path, so I introduced a placeholder where the guide says to ask for the audit directory (`plugins/terse/skills/rewrite/SKILL.md:27-30`).
Bare `/terse:rewrite` followed by an interactive path response — the README names the invocation but no Markdown defines argument syntax (`plugins/terse/README.md:7-12`; `plugins/terse/skills/rewrite/SKILL.md:27-30`).
`<date>` formatting and `<slug>` content — the directory pattern requires both but defines neither (`plugins/terse/skills/rewrite/SKILL.md:64-69`).
A numeric round cap — a cap must be set in the first announcement, but no default or selection rule is given (`plugins/terse/skills/rewrite/SKILL.md:173-175`).
Whether the first announcement includes the preceding adversarial reader — the adversarial read is said to run first, but the following announcement language discusses writer/judge spawning (`plugins/terse/skills/rewrite/SKILL.md:52-62`).
How the bake-off winner becomes `01-candidate.md`, and whether `edits/01.json` exists — both the candidate and per-round edit rules are required, but the bridge between them is absent (`plugins/terse/skills/rewrite/SKILL.md:52-58,68-69,94-106`).
The audit-route `skeleton.md` contents and section budgets — Step 4 requires them but only explains their source cleanly for a rethink skeleton (`plugins/terse/skills/rewrite/SKILL.md:80-93`).
Exact filenames for the cut ledger, prerequisite inventory, unreached-sections report, structure map, graft record, final writer draft, and critic reports — the artifacts are required, but filenames are not (`plugins/terse/skills/rewrite/SKILL.md:181-191`; `plugins/terse/skills/rewrite/references/bake-off.md:47-58,147-148`).
The command that creates `diff-NN.patch` — the output is required but no invocation is documented (`plugins/terse/skills/rewrite/SKILL.md:173-177,188-191`).
Withholding the `ISSUES.md` write — routing says to write there, while the skill’s contract says repository-tree writes require the owner’s word; no dedicated approval point is defined (`plugins/terse/skills/rewrite/SKILL.md:3-7,136-140`).
Treating the `research/` outputs as untracked — their repository location is documented, but Markdown does not guarantee that those paths are untracked or collision-free (`plugins/terse/skills/rewrite/SKILL.md:64-69`).

### evidence

- Opened 10 Markdown files, 1,256 lines total; no source or configuration files were opened.
- plugins/terse/README.md — 90 lines; opened first.
- plugins/terse/skills/audit/SKILL.md — 169 lines.
- plugins/terse/skills/audit/references/ledgers.md — 136 lines.
- plugins/terse/skills/audit/references/truth-pass.md — 80 lines.
- plugins/terse/skills/rewrite/SKILL.md — 212 lines.
- plugins/terse/skills/rewrite/references/bake-off.md — 148 lines.
- plugins/terse/skills/rewrite/references/critic-briefs.md — 183 lines.
- plugins/terse/skills/rewrite/references/writing-rules.md — 51 lines.
- plugins/terse/skills/rewrite/references/curse-of-knowledge.md — 42 lines.
- plugins/terse/skills/rewrite/references/loop.md — 145 lines.
- Listed 17 eligible `.md` paths under `plugins/terse/`; opened only the 10 needed for this reconstruction.
- No rewrite, agent fan-out, generated-file command, or repository mutation was performed.

### artifacts



### open

- Actual absolute audit run-directory path: unknown.
- Rewrite run slug and collision status: unknown.
- Whether the `entrust` plugin is available, hence the exact announced model mix: unknown.
- Exact artifact filenames where the documentation supplies only artifact descriptions: unknown.
- How the initial bake-off winner is converted into the first formal round and edit ledger: unknown.
- Whether `research/<date>-<slug>/` or `ISSUES.md` would collide with tracked paths in the reader’s repository: unknown.
- A documented no-repository-write mode for rewrite: none found.
