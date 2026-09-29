# Opus lens 1: the code, with the right to run it. Round 04, `04-terms.md`

- **HEAD read:** `b7a17dafa4c35fa73f437179241ba951af6e95ef`, branch `terse-process-2026-09-22`; `git diff --stat 2f29a8f HEAD -- plugins/terse` is empty, so the plugin read is 2f29a8f's. Research: `research/2026-09-10-chain/`.
- **Standard:** level 2 = an independent reader of the code says the same; level 3 = made to happen. Lifecycle sentences were run.
- **Repository untouched:** `git -C ~/Git/agent-skills status --porcelain` printed nothing before the work and nothing after it.
- **Where host commands ran:** `claude` 2.1.280 ran under `env -i` with `HOME` and `CLAUDE_CONFIG_DIR` set to `$X/home{,2,3,4}` and `$X/config{,2,3,4}`, where `X=$TMPDIR/terse-r04-lens1-opus`. No config was ever signed in, and no credentials were copied. The wrapper is `$X/cl.sh`, plus `clw.sh`, which first `cd`s to `$WD`. Model calls went only to a local stub, `node $X/stub.mjs 48123 $X/stub.log`, reached with `EXTRA_ENV="ANTHROPIC_BASE_URL=http://127.0.0.1:48123 ANTHROPIC_API_KEY=sk-ant-stub-000"`. The stub logs each request body and answers "STUB-REPLY". Plugin sources are scratch clones: `$X/clone-2f29a8f`, `$X/clone-21a225b`, `$X/clone-live` (`git clone --no-hardlinks` of this repo). GitHub was only read: `git ls-remote`, a fetch by SHA, and `claude plugin marketplace add Nowely/agent-skills` in config3.

## Findings

**F1. Lines 74-76. FALSE as of 2026-09-23. Level 3.**
"To install that commit, run `claude plugin marketplace add` with the path of a local clone checked out at it in place of `Nowely/agent-skills`, then `claude plugin install terse@nowely`."
Only this machine has 2f29a8f.
- `git branch -a --contains 2f29a8f` → only the local `terse-process-2026-09-22`.
- `git ls-remote https://github.com/Nowely/agent-skills.git` → main `8c041b7`, `refs/pull/2..14/head`, tags. `git merge-base --is-ancestor 2f29a8f <sha>` → "no" for all 13 PR heads.
- `git -C $X/fetch-probe fetch --depth 1 https://github.com/Nowely/agent-skills.git 2f29a8fecec8d74c43a805cc580b7052a69b9523` → `fatal: remote error: upload-pack: not our ref 2f29a8f…` (exit 128). The same fetch of `21a225b1…` succeeds.
- Hypothesis: a squash merge would leave 2f29a8f off main anyway. `git log --merges main` is empty; PRs landed as single commits (`dcde485 … (#13)`).

**F2. Lines 74-76 (with line 74, "This README describes commit `2f29a8f`"). UNDERSTATED. Level 3.**
Same sentence. Installing from a local path does not pin the commit. Claude Code loads the plugin from the clone's working tree at every session start.
1. In config4: `plugin marketplace add $X/clone-live` (clone at 2f29a8f), then `plugin install terse@nowely`. `installed_plugins.json` records `gitCommitSha 2f29a8f…`.
2. A stub session `-p "/terse:rewrite"` sends "Base directory for this skill: $X/clone-live/plugins/terse/skills/rewrite" and the `D=".../plugins/data/terse-nowely"` run line.
3. Then `git -C $X/clone-live checkout -q 21a225b`, with no plugin command. The next stub session's rewrite page reads "Work in a run directory of the document's own — `research/<date>-<slug>/` at the root of the …". That is the page lines 78-79 say wrote into the document repository.
4. `installed_plugins.json` still says `2f29a8f`.

The CLI says the same when the plugin is already installed: "it loads in place from …/clone-2f29a8f/plugins/terse, so edits there take effect at the next session start or /reload-plugins" (config2, config3). The pinned commit holds only while the clone stays on it. A pull or checkout in the clone changes the installed pages without any message. No finding for doing lines 74-76 after lines 66-72 (config3): re-adding `nowely` from the clone replaced the GitHub source without error, kept `plugins/data/terse-nowely`, and the next session loaded 2f29a8f's rewrite page.

**F3. Lines 50-51. OVERSTATED. Level 3.**
"The shipped check rejects a new round that loses a sentence an earlier round verified, or brings back wording one retired as false."
In `$X/ratchet` (2f29a8f's `round.mjs` and `ledger.mjs`), round 01 pins `keeps-until-uninstall` (pattern `keeps runs until uninstall`) and retires `for ever`. Four versions of round 02 were each checked with `node ledger.mjs ledger.json 00-original.md 01-a.md 02-b.md`:

| Round 02 | Result | Exit |
|---|---|---|
| loses the sentence | `1 failure(s)` | 1 |
| brings back "for ever" | `1 failure(s)` | 1 |
| loses it with `"drop":["keeps-until-uninstall"]` in the same edit | `0 failure(s)` | 0 |
| loses it and re-declares the same name with pattern `keeps runs` | `0 failure(s)` | 0 |

Why: `round.mjs:119` deletes a dropped entry, `round.mjs:112` replaces an entry under a reused name, and `ledger.mjs:18-22` checks only the entries still in the ledger. A round that drops or re-pins an entry in its own edits passes, even though it lost the sentence. The next sentence, "That guard is not a promise…", does not name this way through.

**F4. Line 61. OVERSTATED. Level 3, against the stub.**
"Running a skill needs you signed in to it;"
Configs `config` and `config3` were never signed in (no `.credentials.json`).
- With `ANTHROPIC_API_KEY` set, `-p "/terse:audit"` returned `"subtype":"success","result":"STUB-REPLY"` (config). `-p "/terse:rewrite"` returned `STUB-REPLY` (config3). The stub received the expanded page each time.
- With no key, it printed `Not logged in · Please run /login`.

Signing in is one way to authenticate. An API key also runs a skill.

**F5. Lines 61-62. OVERSTATED. Level 3.**
"for `audit` and `rewrite`, also put Node 22 or newer on `PATH`."
Command: `env -i PATH=~/.nvm/versions/node/v20.10.0/bin:/usr/bin:/bin /bin/sh -c 'node --version; node "$0/rewrite/scripts/selftest.mjs"' $X/skills-copy`
Output: `v20.10.0`, `selftest exit=0`, 45 `ok` lines, "all checks caught their planted violation".
The selftest starts `node` from `PATH` (`selftest.mjs:6,8`), and v20.10.0 is the only node on that `PATH`. A grep of the six scripts for APIs newer than Node 20 finds none. The 22 comes from the declared floor (`package.json:4-6`, `"node": ">=22"`), not from anything the code needs.

**F6. Lines 61-62. UNDERSTATED. Level 2. Not run: no Windows host.**
Same sentence. `rewrite` also needs a POSIX shell at `/bin/sh`. `round.mjs:86` runs every check with `spawnSync("/bin/sh", ["-c", e.check.run], …)`. Where `/bin/sh` does not exist, `r.error` is set and `round.mjs:87` refuses the round ("check.run did not run in …"). On a host without `/bin/sh`, native Windows for example, every round whose edits carry a claim is refused.

**F7. Lines 5-6. OVERSTATED. Level 3.**
"The intended scope is Markdown in any language, whether or not the document is about software."
Two shipped checks depend on English or on spaces between words:
- `node rule1.mjs en.md` on "The tool exits 2 when the flag --force is missing." flags `--force` and `exits 2`.
- On "Инструмент завершается с кодом 2, если нет флага --force." it flags only `--force`. The exit-code words at `rule1.mjs:29` are English.
- `node sections.mjs zh.md` counts a 26-character Chinese sentence as `1 介绍`, because `sections.mjs:13` splits on whitespace. Budgets and per-section growth mean nothing for languages written without spaces.

The next sentence says the no-code truth pass has not been measured. Nothing says the same for other languages.

**F8. Lines 40-41. UNDERSTATED. Level 2.**
"`/terse:rewrite` starts from that skeleton or an audit's run file, or resumes a run of its own that already holds rounds."
`rewrite/SKILL.md:21` has a fourth way in: "neither | say so, offer `/terse:audit` or `/terse:rethink`; if the user declines both, continue on your own guesses and say so in the report".

**F9. Lines 41-42. UNDERSTATED, minor. Level 2.**
"For an existing document, an adversarial read precedes a bake-off: three whole-file candidates and two judges."
- `bake-off.md:22`: "judges | 2 | a third only when the two split".
- `rewrite/SKILL.md:61-62`: if the user refuses the fan-out, "write one candidate yourself from the same brief and report that the comparison was skipped".

**F10. Line 87 and line 96. UNDERSTATED, minor. Level 2.**
"The `rewrite` instructions place their run by the same rule" … "copy a run you want to keep."
Some of what rewrite writes never reaches the run directory:
- Writers put their candidates and drafts in "your own temporary directory" (`bake-off.md:57-58, 87`).
- Critics write under `$TMPDIR` (`critic-briefs.md:44, 80, 132, 147`).
- The run directory's contents (`rewrite/SKILL.md:196-208`) are the rounds, ledgers and reviews. They do not include the three candidates, the writers' drafts or the judges' sheets.

Copying the run does not keep those.

## Claims reached only at level 1

1. Lines 64-69: the in-app `/plugin marketplace add` and `/plugin install` were not run, because they need an interactive session. Their shell forms (lines 71-72) reached level 3 in config3, which recorded `gitCommitSha 21a225b…`.
2. Line 110, for the chain half: "Two experiments ran on 2026-09-10." No date of 2026-09-10 appears in `chain/` or in `chain-source-prompt.txt` (grep). The date rests on `research/2026-09-10-chain/README.md:1,38`. The 2×5 half reaches level 2: `EKalWntb.answer.md` and `rCYUALAd.answer.md` carry 2026-09-10.
3. Line 121: "Models were hidden from the judges." The judges' prompts say so (`v04PR6HL.prompt.txt:22`, `o8eHzS6U.prompt.txt:10`), but the dossier they read (`/tmp/bakeoff/dossier.txt`) is not archived.
4. Lines 121-123: the sentence matches judge J2's own counts (`o8eHzS6U.answer.md:10-19`): P1, P2, P4, P5 and P6 at 116→116; P8 punctuation only; P3 126, P7 125, P10 137; P9 97. What the entrants actually did cannot be re-counted. `run-2x5/` holds only the Codex half of the ten, and the P labels are not mapped to returns.
5. Lines 14-15, the diagram's "candidate + diff → /terse:audit again": no page says how audit measures a candidate that is still in the run directory. Audit readers start at the entry file in the repository (`measure.md:49`), and the candidate reaches the repository only on the user's word (`rewrite/SKILL.md:191-192`).
6. Lines 56-57, for rewrite's first agent: the adversarial read "is the first thing that runs" (`rewrite/SKILL.md:54-56`), and the paragraph telling the coordinator to announce comes after it (`:60-62`). Only the parenthesis "(the critics' costs have; see the table)" suggests the announcement covers that read.
7. Lines 5-6: no shipped file states the "intended scope". Only `ISSUES.md:119-120` records the owner's intent.

## Held at level 3 (no finding; checks for the ledger)

- **Lines 83-85:** the installed audit page arrives with `D="<CLAUDE_CONFIG_DIR>/plugins/data/terse-nowely"` filled in. Running that line created `…/plugins/data/terse-nowely/runs/20260923-171553`. Rewrite's line arrives with the same `D` (config3). With `D` empty the formula gives `${TMPDIR:-/tmp}/terse/runs`.
- **Lines 93-94:** the data directory, run included, was removed or kept as follows.

  | Action | Data directory |
  |---|---|
  | `plugin uninstall terse@nowely`, no `--keep-data` | removed |
  | same, with `--keep-data` | kept |
  | `plugin marketplace remove nowely`, plugin installed | removed, including runs kept by `--keep-data` |
  | installed at user and project scope; uninstall user | kept |
  | then uninstall project | removed |
  | `plugin update`, `marketplace update`, `disable` | kept |

- **Line 19:** the model-facing skill list in the stub request names 12 skills, none of them audit, rethink or rewrite.
- **Lines 77-78:** a fresh GitHub install today records `21a225b`. Local `FETCH_HEAD` (2026-09-23 16:11) and the `origin/main` reflog (at 21a225b since 2026-09-18 10:42) put it there on 2026-09-22. `21a225b:plugins/terse/skills/rewrite/SKILL.md:66-67,112-113` sends runs into `research/<date>-<slug>/` and defects into `ISSUES.md` without asking.
- **Lines 101-102:** `wc -w` gives 2725, 2482, 2377, 2482, 2571.
- **Lines 117-118:** exact two-sided McNemar with b=3, c=0 gives 0.25.
- **Lines 49-50:** `round.mjs` refuses a claim without a check ("an edit that declares claims needs a check…", no file written).
- **Line 100:** `sections.mjs` exits 0 with a section 4 words over budget.

## Code, not the document

- **`audit/SKILL.md:36-37` and `CHANGELOG.md:34-35, 63-64`:** they say the run falls back to `$TMPDIR/terse` from a source checkout. Under `claude --plugin-dir $X/clone-2f29a8f/plugins/terse` (config4, stub) the page instead arrives with `D="<CLAUDE_CONFIG_DIR>/plugins/data/terse-inline"`. A checkout loaded as a plugin writes its runs there. Level 3.
- **`audit/SKILL.md:159` and `rewrite/SKILL.md:83`:** the bare `$CLAUDE_PLUGIN_ROOT` arrives unsubstituted in the expanded page (line 149 of the audit text the stub received). Level 3 for the substitution half of ISSUES.md E10. Whether the shell exports it was not run.
