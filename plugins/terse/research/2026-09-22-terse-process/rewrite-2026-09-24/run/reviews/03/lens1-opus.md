# Opus lens 1: the code, with the right to run it. Round 03, `03-routes.md`

- **HEAD read:** `0dc7cf6` on `terse-process-2026-09-22` (`git -C /Users/ruliny/Git/agent-skills log --oneline -1`). Code paths are relative to `/Users/ruliny/Git/agent-skills`; `audit/`, `rewrite/`, `rethink/` stand for `plugins/terse/skills/<name>/`.
- **Standard:** level 2, an independent reader of the code would state the same thing; level 3, the behaviour made to happen, wherever it could be run without cost or risk.
- **Repository not modified:** `git -C /Users/ruliny/Git/agent-skills status --porcelain` before the first command and after the last one, identical: ` M research/2026-09-22-terse-process/rounds.md` and `?? research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md`, both already there before I started.
- **Where host-application commands ran:** only under `$W` = `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/lens1-opus-r3`, through `$W/iso.sh`: `env -i`, with `HOME` and `CLAUDE_CONFIG_DIR` inside `$W/<iso>/`, and telemetry and non-essential traffic turned off. Never signed in, no credentials copied, no `--dangerously-skip-permissions`; `claude` 2.1.280.
  - `iso1`: the README's own commands, against GitHub `Nowely/agent-skills` (main `8c041b7`, terse 0.1.1).
  - `iso2`, `iso2-keep`, `iso3`, `iso4`: a local marketplace from `$W/repo-head`, a clone of `0dc7cf6`. For the update test, the version was bumped in the clone and nowhere else.
  - `iso-nogit`: a `PATH` holding only `claude` and `node`.
  - Print-mode runs went to a local stub (`node $W/stub.mjs <port> <logdir>`, with `ANTHROPIC_BASE_URL=http://127.0.0.1:<port>` and a dummy key). The stub logs each request and answers "ok", so no model was called.
  - The plugin's scripts ran from the checkout, on scratch files under `$W`.
- **Read besides the code:** `R/00-original.md`. For the dated claims, `research/2026-09-10-chain/` and `research/2026-09-22-terse-process/audit-2026-09-22/audit.md`, which `cmp` shows is byte-identical to `R/audit.md`. I opened nothing else under R.

## Findings

### F1: line 3, OVERSTATED, levels 2 and 3

> A Claude Code plugin for assessing and improving any text, in rounds of edits by several AI agents working from rules and best practices.

The code assesses Markdown documentation. Its readers cannot open code or non-`.md` text, and two of rewrite's mechanical checks only recognise English.

- `sed -n '25p;91,92p' plugins/terse/skills/audit/SKILL.md` prints "Which files are the documentation. Default to every tracked `.md`." and "Each one starts at the entry file, may open only `.md` files, may not read source". `audit/references/measure.md:35` forbids "source code, tests, config", and `:49` says "You may open only .md files in <REPO>". `rewrite/scripts/dup.mjs:13` and `sections.mjs:15` cut the text at `^##\s`.
- The owner states his own scope in `rethink/references/stages.md:46-47`: "the README now, documentation and code later". `plugins/terse/.claude-plugin/plugin.json:4` says "Three user-invoked skills for documentation", and the document's own line 14 says "where the Markdown files are".
- Run on "The driver exits 2 when the state directory is missing.":
  - `node rewrite/scripts/rule1.mjs $W/lang/en.md` prints `! line 3  exit code      exits 2` and exits 1.
  - The same sentence in Russian, `$W/lang/ru.md`, prints `0 violation(s)` and exits 0.
- Run with an added caveat:
  - `node rewrite/scripts/round.mjs $W/lang/from.md $W/lang/to-en.md $W/lang/e-en.json` (adds "unless you pass --prune") refuses the round: `en: adds "unless you pass --prune" — a qualification is not a fix…`, exit 1.
  - The same with `e-ru.json` (adds "если только вы не передадите --prune") prints `ok  ru` and `wrote …/to-ru.md`, exit 0.
  - The word lists are English only: `rule1.mjs:29`, `round.mjs:93`.

### F2: line 12, UNDERSTATED, level 3

> You need: Node 22 or newer.

The first command on line 8 also needs git.

- Without git: `env -i HOME=$W/iso-nogit/home CLAUDE_CONFIG_DIR=$W/iso-nogit/config PATH=$W/nogit-bin claude plugin marketplace add Nowely/agent-skills` (`$W/nogit-bin` holds only `claude` and `node`) fails with `✘ Failed to add marketplace: Failed to clone marketplace repository: Command failed with ERR_STREAM_PREMATURE_CLOSE: git … clone --depth 1 … git@github.com:Nowely/agent-skills.git …`, exit 1.
- With `/usr/bin` on `PATH`: `$W/iso.sh $W/iso1 claude plugin marketplace add Nowely/agent-skills` prints `SSH not configured, cloning via HTTPS … ✔ Successfully added marketplace: nowely`, exit 0.
- Git is Claude Code's requirement for a GitHub marketplace, not the plugin's.

### F3: line 12, OVERSTATED, level 3

> You need: Node 22 or newer.

22 is only the declared floor; nothing in the plugin needs it.

- `env TMPDIR=$W/ PATH=/Users/ruliny/.nvm/versions/node/v20.10.0/bin:/usr/bin:/bin node rewrite/scripts/selftest.mjs` prints 50 `ok` lines and `all checks caught their planted violation`, exit 0 (log in `$W/selftest-v20.10.0.log`). The self-test runs rule1, dup, ledger, round, sections and `audit/scripts/ledger-seed.mjs` through whichever `node` is on `PATH` (`selftest.mjs:6`).
- The floor is only the line `engines.node ">=22"` (`plugins/terse/package.json:4-6`). `grep -rn -E "process\.version|engines" plugins/terse/` finds no version check anywhere.

### F4: line 20, UNDERSTATED, level 2

> It asks which files and where your readers start, and waits for your answer.

The first exchange asks three things, not two, and a second exchange comes before any report.

- `audit/SKILL.md:23-28`: "Settle three things … Which files are the documentation … Which repository backs them, if any … Where a reader arrives."
- `audit/SKILL.md:48-51`: "One line of it is the user's alone, in their own words: what this document is for, and what it must make its reader able to do. Show the profile and ask for corrections before Step 3." The same is in `audit/references/reader-profile.md:22, 24-25`.

### F5: line 35, UNDERSTATED, level 2

> Before starting agents, audit says how many and on which model, and waits until you say so; rewrite does so before its writers and judges, and before a round's reviewers.

rethink also announces and waits, twice. Every one of these announcements also states the cost, which the sentence leaves out.

- `rethink/SKILL.md:60`: "Announce the count and the models before spawning, and wait for the user's word". This is the survey.
- `rethink/SKILL.md:97`: "Announce the count and the models, and wait." This is the structures, by default ten writers and three critics (`rethink/references/briefs.md:176, 188-192`). The only other sentence in the document about rethink's agents, line 64, covers the survey alone.
- `audit/SKILL.md:88`: "how many readers, which model, roughly what it costs". `rewrite/SKILL.md:70-71`: "the count, the models, and that the cost of a writer or a judge has not been measured". `rewrite/SKILL.md:150`: "the models, the cost".

### F6: line 50, UNDERSTATED, level 2

> A report: which questions the text answers wrong, why, file and line; no rewording

The audit's second ruler, which checks every behavioural sentence against the code, is missing. The report names each refuted sentence whether or not a reader failed on it. The document never says the audit checks its sentences against the code; line 61 says only that the answer key is written from the code.

- `audit/SKILL.md:4-5`: "Measures a document against two rulers: whether fresh readers get the right answer, and whether every claim about behaviour is true of the code". `:58-61`: one ledger entry per behavioural sentence, with its level and verdict. `:166`: "Report to the user: the score, the failures with their causes, the refuted claims, …".
- On 2026-09-22, `grep -c '"verdict": "refuted"' research/2026-09-22-terse-process/audit-2026-09-22/audit.md` gives 11 refuted claims, while its *What broke* holds only one wrong answer caused by a refuted claim (`audit.md:999`, "### Q2 — refuted — README.md:35-36").

### F7: lines 54-57, OVERSTATED, level 2

> You start each one yourself, and both orders end in audit:
> - `/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions
> - `/terse:rethink` → `/terse:rewrite` → `/terse:audit`

Run in the listed order, the closing audit measures the document in the repository, which the draft has not replaced. Nothing gives it the first run's questions either.

- The readers "Start at <ENTRY FILE>. You may open only .md files in <REPO>." (`audit/references/measure.md:49`). A re-measure keeps "Same questions, same key, same entry file, same model." (`measure.md:108`).
- The draft stays in the run directory outside the repository (`rewrite/SKILL.md:76-78, 88-89`). It reaches the user's files only on their word (`rewrite/SKILL.md:221-223`; the document's own line 33). Neither route lists that step. On the rethink route with "No document yet" (line 51), the closing audit has no document to read.
- Step 1 of the audit asks for files, repository and entry (`audit/SKILL.md:23-28`), and step 4 writes the questions from the profile (`:71-84`). No step reads an earlier run, yet the re-measure needs that run's questions, key and no-document score (`measure.md:108`; `audit/SKILL.md:100-102`).

### F8: line 64, UNDERSTATED, level 2

> rethink starts by reading documents like yours, with as many agents as you allow.

Before the survey, rethink reads the user's Claude Code session history, and the document never says so.

- `rethink/references/briefs.md:12-18`: "Before the survey, once: the owner's own words on this genre … collected verbatim into `<R>/owner-words.md` … To make it, grep the owner's sessions for the genre's words — for Claude Code, the `*.jsonl` files under `~/.claude/projects/<project>/`". See also `rethink/SKILL.md:42, 77-78`. Every structure writer and critic reads the file (`briefs.md:154, 197-198`).
- Before anyone is spawned, it also asks for the documents the user names as good (`rethink/SKILL.md:62-64`). When rethink is entered from an audit, the survey may be sized to zero (`:25-27`), and then it reads no document like yours at all.

### F9: line 66, OVERSTATED, levels 2 and 3

> A round that silently loses a sentence checked true, or repeats one found false, is refused before you see it.

Only sentences pinned in `ledger.json` are protected, and nothing pins the first candidate's sentences.

- `rewrite/scripts/ledger.mjs:17-25` checks the ledger's entries and nothing else. The ledger holds the audit's confirmed and refuted sentences, word for word (`audit/scripts/ledger-seed.mjs:60-62`), plus whatever the edits declare (`round.mjs:144-158`). `rewrite/SKILL.md:117-118`: "With no audit it starts empty. Either way it grows from the rounds."
- The candidate's sentences carry the level the writer recorded (`rewrite/references/bake-off.md:71-73, 94`), and lens 1 checks them, but no step pins them. `rewrite/references/loop.md:69` says the ledger "carries every verified claim", which the mechanism does not do; that defect predates this document.
- Run in `$W/ratchet/`: `01-candidate.md` holds "Runs live in the data folder." and "Uninstall deletes every run.", and `02-edit.md` drops the second sentence.
  - With the empty ledger of the skeleton route with no audit (`[]`), `node rewrite/scripts/ledger.mjs ledger-empty.json 01-candidate.md 02-edit.md` prints `0 failure(s)`, exit 0.
  - With a ledger that pins only the first sentence, it prints `data folder   L3   yes  yes` and `0 failure(s)`, exit 0.
- Where a sentence is pinned, the refusal does hold. The self-test prints `ok a round that drops the seeded sentence fails the ledger` and `ok ledger reports an unwanted phrase`.

### F10: line 67, UNDERSTATED, level 3

> Each run is written in the plugin's own folder; nothing in your repository changes until you say so.

The folder is named correctly, but its lifetime is left out: two commands delete it together with every run inside.

- With the plugin installed from `$W/repo-head` (`0dc7cf6`), `claude -p "/terse:audit"`, `"/terse:rewrite"` and `"/terse:rethink"` were sent to the stub. In each page the run line arrives as `D="$W/iso4/config/plugins/data/terse-nowely"; RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/…"` (`$W/evidence-runlines.txt`, from `$W/stublog2/req-002.json`, `-004`, `-006`). Running the rewrite line as it arrived in `iso2` (`$W/stublog1/req-005.json`, saved as `$W/rewrite-runline.sh`, run with `/bin/sh`) created `…/plugins/data/terse-nowely/runs/20260924-043605-demo-readme`.
- A marker run in that folder survived `claude plugin update terse@nowely`. The version was 0.1.1 → 0.1.2 in the clone, and the command printed `✔ Plugin "terse" updated from 0.1.1 to 0.1.2 for scope user. Restart to apply changes.`
- `claude plugin uninstall terse@nowely` left `plugins/data/` empty. The same command with `--keep-data` (`iso2-keep`) kept the folder.
- `claude plugin marketplace remove nowely` (`iso3`) also left `plugins/data/` empty, and its `--help` offers only `--scope`.
- The pages state this and tell the skill to repeat it at hand-over (`audit/SKILL.md:39-42`; `rewrite/SKILL.md:84-87`; `rethink/SKILL.md:48-53`). The document sends the reader to that folder for the draft (line 33) but never says it.

## Claims reached only at level 1

1. Line 71, "AI readers' right answers 3 of 6 → 6 of 6".
   - "3 of 6" comes from the writer's brief, not from a reader record: `research/2026-09-10-chain/run-2x5/Faf2geGl.prompt.txt:105-106`, "Three of six answered correctly."
   - "6 of 6" appears only in the plugin's own text: `audit/references/measure.md:4, 125`; `rewrite/references/measurements.md:100-101`; `plugins/terse/references/prior-art.md:93`; `research/README.md:9`.
   - No prompt in `run-2x5/` carries the reader brief. The chain seat's return ends "No project tests, model calls or new reader experiment were run." (`run-2x5/Faf2geGl.answer.md`, field `result`).
   - `prior-art.md:911` says "Every 2026-09-10 number quoted anywhere in this file traces there", which fails for this number. That defect predates this document.
2. Line 71, "the questions it already answered right stayed right": `measure.md:126`, "broke neither control"; `prior-art.md:92`, "zero reversals". No record behind either.
3. Line 71, "The same questions were not run without the text.": `prior-art.md:104-107`, "Both ran the control. We did not."; `research/2026-09-22-terse-process/audit-2026-09-22/audit.md:995`, "the no-document arm ran for the first time in this repository".
4. Line 71, "the method this plugin was built from": `research/2026-09-10-chain/README.md:3`.
5. Line 72, "The same run", meaning that the word counts and the reader numbers come from a single run. The counts themselves reach level 3: `wc -w research/2026-09-10-chain/chain/00-original.md research/2026-09-10-chain/chain/README.md` prints 2725 and 2571, and `chain/validation.json` has 2725 and 2571.
6. Line 73, "5 of 7 right with the text, 0 of 7 without": `audit.md:993`, "docs 5/7, no-document 0/7". The audited README is the previous one: `git show 1a24018:plugins/terse/README.md | diff - plugins/terse/README.md` prints nothing.
7. Lines 20-25, the quoted report line: `audit.md:1014-1015`, word for word.
8. Line 74, "Never measured: whether a person reads the improved text better — only whether a model does.": `plugins/terse/CHANGELOG.md:214-215`; `prior-art.md:131`; `audit.md:995`.

The plugin's own rule (`audit/references/truth-pass.md:23-25`) requires level 3 for guarantee words. Three of the document's guarantee words reached only level 2:

- Line 65, "Word count never selects a draft": `bake-off.md:118, 131, 136-138`. The judges were not run.
- Line 66, "is refused before you see it": the ledger's exit 1 is level 3. That the coordinator fixes the round before the critics see it, and gates it before the user reads it (`rewrite/SKILL.md:144-148, 202-206`), is level 2.
- Line 67, "nothing in your repository changes until you say so": `audit/SKILL.md:44`; `rewrite/SKILL.md:88-89, 172-173`; `rethink/SKILL.md:46`. The only agent whose working place the pages leave unstated is the audit's task reader, "acting from the documentation alone" (`audit/SKILL.md:111-113`). Rewrite's lens 4, by contrast, says "create it under $TMPDIR" (`rewrite/references/critic-briefs.md:146-147`).

Not counted, because the brief says to judge against HEAD: line 9 installs GitHub main `8c041b7`, which is terse 0.1.1 (`$W/iso1/config/plugins/installed_plugins.json`, `gitCommitSha` 8c041b7…). That release's rewrite page makes its run in "`research/<date>-<slug>/` at the root of the" repository (`git show 8c041b7:plugins/terse/skills/rewrite/SKILL.md`, line 66). Lines 33 and 67 are therefore false of that release.

Counts: 42 behaviour sentences checked. By verdict: FALSE 0, OVERSTATED 4 (F1, F3, F7, F9), UNDERSTATED 6 (F2, F4, F5, F6, F8, F10). Claims at level 1 only: 8.
