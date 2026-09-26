# Opus lens 1: the code, with the right to run it. Round 03, `03-review.md`

Target: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/03-review.md`
(126 lines), read whole; `00-original.md` read beside it. Code: `/Users/ruliny/Git/agent-skills`, branch
`terse-process-2026-09-22`, HEAD `1af4160`; `git diff --stat 2f29a8f HEAD -- plugins/terse` is empty, so
the plugin tree is the one at `2f29a8f`. Standard: level 2, and level 3 wherever it could be run without
cost. No repository file was modified (`git status --porcelain`: 0 lines after the run). Every
host-application command ran under `CLAUDE_CONFIG_DIR` in the scratch directory
`$T=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//opus-lens1.mg3MOi`. No model was called: the
skill-rendering runs point `ANTHROPIC_BASE_URL` at a local stub (`$T/stub.mjs`). The stub records
request bodies only and answers every request with HTTP 400.

60 sentences that state a behaviour were checked, and 6 findings are below. Line numbers are
`03-review.md` lines.

## Findings

### F1: 3-5, OVERSTATED (level 2)

> `terse` is a Claude Code plugin that measures whether readers get the right answer and whether a
> document's claims agree with the code behind it, and proposes a rewrite.

The readers are spawned model agents, and the plugin's own record says its ruler does not measure
human readers. The README never says this: `grep -n -i -E 'human|model reader' 03-review.md` finds no
such line. Lines 114-115 list two limits of the pilot and leave out this one.

Check:
- `sed -n '100,103p' plugins/terse/CHANGELOG.md`, under "Known limits": "The audit's ruler measures
  whether a model can answer from the text, not whether a human reader improved."
- `sed -n '131p' plugins/terse/references/prior-art.md`: "terse currently measures model
  answerability, and its numbers are not valid evidence of" human improvement.
- `sed -n '86p' plugins/terse/skills/audit/SKILL.md`: "how many readers, which model".
- `sed -n '40p' plugins/terse/skills/audit/references/measure.md`: "Use a cheap model; the 2026-09-10
  run used Haiku".

A person asking "Is my README any good?" reads "readers" as their own human readers.

### F2: 36-37, UNDERSTATED (level 2, minor)

> It compares documents in the same genre, settles terms, and explores structures.

Check: `sed -n '27,32p' plugins/terse/skills/rethink/SKILL.md`. The default survey has six slices:
"the exact genre, the same structural position, the most used regardless of genre, vendor guidance,
whatever this document's hard part is, and one slice whose job is what *not* to copy". Four of the six
look outside the genre.

### F3: 37, UNDERSTATED (level 2)

> Its output is a skeleton: each section's title, purpose, exclusions, and word budget.

Check: `sed -n '13,15p;76,80p' plugins/terse/skills/rethink/SKILL.md`. The page's own definition
lists five items, the fifth being "the rules that will gate the writing". Its hand-over list adds:

- the mechanical rules the writing must pass;
- the terminology decisions, including the ones rejected;
- what was deleted outright, with its cost;
- any edit required in a file that is not the document.

`rewrite` reads the rules from the skeleton: `sed -n '100,101p'
plugins/terse/skills/rewrite/references/critic-briefs.md` gives "<skeleton.md> — its per-section
purpose, exclusions and budget, and its mechanical rules".

### F4: 40, UNDERSTATED (level 2)

> **`/terse:rewrite`** starts from that skeleton or an audit run.

Check: `sed -n '16,21p' plugins/terse/skills/rewrite/SKILL.md`. There are four ways in, not two:

1. A run directory that already holds rounds: the run resumes at step 4, and steps 1-3 are not
   repeated.
2. A skeleton.
3. An audit run file.
4. Neither: "offer /terse:audit or /terse:rethink; if the user declines both, continue on your own
   guesses and say so in the report".

This line and the diagram at 13-17 imply that one of the two inputs is required, and give no way back
into a run.

### F5: 73-75, UNDERSTATED (level 3 for a and c, level 2 for b)

> At the 2026-09-22 audit, the install commands resolved the marketplace's `main` at `8c041b7`, whose
> rewrite page wrote into the document repository without asking. The section below describes this
> commit, not that one.

(a) This is still true, not only at the audit. On 2026-09-23 a fresh isolated install resolves
`8c041b7`:

```
T2=$(mktemp -d); export CLAUDE_CONFIG_DIR=$T2/cfg
claude plugin marketplace add Nowely/agent-skills    # exit 0
claude plugin install terse@nowely                   # exit 0
grep gitCommitSha $T2/cfg/plugins/installed_plugins.json
#   "gitCommitSha": "8c041b76d7f30196441285d77985b81ae9c9e59f"
```

`git -C /Users/ruliny/Git/agent-skills log -1 --format='%H %cI' origin/main` gives `8c041b7…`,
committed 2026-09-18. Both commits declare version `0.1.1`.

(b) The difference reaches past "the section below" and past the rewrite page.
`git diff --stat 8c041b7 2f29a8f -- plugins/terse` shows 10 files, +487/−50:

- `audit/SKILL.md`, `ledgers.md`, `rewrite/SKILL.md`, `critic-briefs.md`, `loop.md`,
  `measurements.md`, `round.mjs` and `selftest.mjs` all change.
- `ledger-seed.mjs` does not exist at `8c041b7`:
  `git ls-tree -r --name-only 8c041b7 -- plugins/terse/skills/audit/scripts` prints nothing.
- `git show 8c041b7:plugins/terse/skills/rewrite/SKILL.md | sed -n '90,94p'` gives "`ledger.json`
  starts empty and grows from the rounds", and a check `{"level", "how"}` that nothing runs.

So for the plugin these install commands deliver:

- line 41-42 ("checked against the claim ledger, the audit's when rewrite starts from one") is false;
- there is no verifier;
- `audit` runs no Node, which line 60-61 says it needs.

(c) Inside the section, the audit page also differs, and the page does not say so. This makes line
80-81 ("Installed, the runs land in `plugins/data/terse-nowely/runs/`") false for the install the page
itself gives. Stub runs, each `claude -p "/terse:audit" --max-turns 1` with the working directory set
to `$T/doc-a`, exit 1 after the stub's 400:

- `8c041b7` (local marketplace from `git archive 8c041b7`, config `$T/cfg3`): the body sent carries
  `RUN="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}/terse}/runs/$(date +%Y%m%d-%H%M%S)"` unsubstituted, and
  no `$T/cfg3/plugins/data/terse-nowely` is created.
- `2f29a8f` (config `$T/cfg2`): the body carries
  `D="$T/cfg2/plugins/data/terse-nowely"; RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/…"`, and the directory
  is created.

The Claude Code 2.1.280 binary substitutes only the exact placeholder. `strings -n 8 claude.exe | grep -o 'function vX(e,r){.\{0,260\}'`
shows function `vX`, whose pattern is `/\$\{CLAUDE_PLUGIN_DATA\}/g → KSe(source)`, and `KSe` is the call
that runs `mkdirSync`.
`sed -n '60,64p' plugins/terse/CHANGELOG.md` states the same.

A reader who follows Install therefore gets:

- `audit` runs under `${TMPDIR:-/tmp}/terse`;
- `rewrite` runs under `research/<date>-<slug>/` in the document's own repository
  (`8c041b7` rewrite:66-67), with code defects sent to its `ISSUES.md` (:112-113).

Line 80-81 is true of `2f29a8f` once installed (level 3, "Held at level 3" below) and is scoped by line
75. I charge the gap to lines 74-75, not to lines 80-81.

### F6: 101-102, OVERSTATED (level 2; the pages contradict each other)

> A writer may reword one or correct it when it is false.

No page grants either permission.

- `grep -rn -i -E 'reword|rephrase' plugins/terse/skills` finds nothing.
- `sed -n '21p' plugins/terse/skills/rewrite/references/writing-rules.md` gives "Never cut a condition,
  a limit or a warning where a reader decides", with no exception.
- `sed -n '114p' plugins/terse/skills/rewrite/references/bake-off.md` makes it a veto: "was a
  condition, limit or warning at a decision point cut or weakened?". There is no exception for a false
  one, so a bake-off candidate that corrects a false warning by narrowing it is vetoed as written.
- The only support for "correct" is the general accuracy floor, bake-off.md:60-62 ("Correct what the
  current file gets wrong"), and truth-pass.md:23-25.

The conflict between the pages is older than this round (P4 below). Line 100-101 of the README itself
says a weakened warning is vetoed, and the next sentence grants the correction without saying so.

## Held at level 3: lifecycle and script claims

These hold and were made to happen. They are listed so that no one re-runs them.

- **89-90, uninstall.** Run in config `$T/cfg`, installed from GitHub, with
  `mkdir -p $T/cfg/plugins/data/terse-nowely/runs/X` created first:
  - `claude plugin uninstall terse@nowely --keep-data` exits 0 and the directory stays.
  - `claude plugin uninstall terse@nowely` exits 0 and the directory is gone.
  - With installs at user and project scope (working directory `$T/proj`), `uninstall -s project`
    leaves the directory, and `uninstall -s user`, the last installation, removes it.
  - `claude plugin marketplace remove nowely` exits 0 and the directory is gone. This held for one
    installation (`$T/cfg`) and for two (`$T/cfg2`, user and project).
- **79-81 and 83-84, the run directory at `2f29a8f`.** Stub renders of `/terse:audit` and
  `/terse:rewrite` both carry `D="$T/cfg2/plugins/data/terse-nowely"`, and rewrite adds `…-<slug>`.
  Running the rendered line creates `$T/cfg2/plugins/data/terse-nowely/runs/<ts>`. With `D` empty the
  path is `${TMPDIR}/terse/runs/<ts>`. As a control, a render of `/terse:rethink`, whose text has no
  placeholder, creates no data directory.
- **49-50, the ratchet.** A ledger holding one pin and one retired phrase:
  - `ledger.mjs` over `01` alone exits 0;
  - over `01 02-lost` it prints `LOST` and exits 1;
  - over `01 03-revived` it prints `YES` and exits 1.

  On what stays on disk: `round.mjs` writes the round and grows the ledger (exit 0) before
  `ledger.mjs` fails it, and `ledger.02.json` equals the ledger as it was before the round. So
  "rejects" means an exit status, and the page's undo procedure (rewrite:125-128) is what removes the
  round.
- **96, the budgets.** `sections.mjs` exits 0 with a section 4 words over budget. `selftest.mjs` exits
  0, with 45 `ok` lines and "all checks caught their planted violation".
- **97-98, the word counts.** `wc -w` on `research/2026-09-10-chain/chain/{00-original, 01-reader-pass,
  02-writing-pass, 03-prerequisite-pass, README}.md` gives 2725, 2482, 2377, 2482 and 2571. That is
  −105 then +105, and −5.65% overall.
- **113-114, McNemar.** With 3 changes one way and 0 the other, the exact two-sided p is
  2 × 0.5^3 = 0.25.
- **19, three user-invoked skills.** `claude plugin details terse@nowely` lists "Skills (3) audit,
  rethink, rewrite". The rendered request's `system` and `tools` do not mention `terse:`, so the model
  is not offered the skills. All three pages set `disable-model-invocation: true`.
- **70-71, install from a shell.** Both commands exit 0.
- **109-121, the record.** Level 2 against the raw record, and all of it holds:
  - `chain-source-prompt.txt:103-132` lists the six earlier readers one at a time.
  - `chain/validation.json` gives `"live_reader_experiments_run": 0`.
  - A grep of the tree for the six question texts finds no record of any reader after the rewrite.
  - `research/README.md:10` says "no arm ever ran without the document".
  - The 2×5 design is in `run-2x5/v04PR6HL.prompt.txt` and `o8eHzS6U.prompt.txt`: Diataxis P1-2,
    verification P3-4, a draft CLAUDE.md block P5-6 ("It has no website", `EKalWntb.prompt.txt`),
    riekelt P7-8 and CONTROL P9-10, with the models hidden.
  - J2's evidence in `o8eHzS6U.answer.md`, on README.md:3-9 at 116 words: P1, P2, P4, P5 and P6
    unchanged; P8 changed punctuation only; P3 went to 126, P7 to 125 and P10 to 137; P9, a control,
    went to 97.
  - J2 ranks P6, P9, P10, P5, P2, P3, P7, P8, P4, P1, so both controls sit above every published
    entry. J1 (`v04PR6HL.answer.md`) ranks P3 first, above both controls.

## Claims reached only at level 1: 2

1. 5-6, "The intended scope is Markdown in any language". This is intent. No page states a language
   scope: grep `any language|languages` over the pages finds only reader-profile.md:19, "in their
   languages". Nothing in the scripts restricts language.
2. 63-68, the in-app forms `/plugin marketplace add Nowely/agent-skills` and
   `/plugin install terse@nowely`. They run only in an interactive session and were not run. The shell
   forms were run, at level 3.

## Found in passing: page and code defects, not charged to the README

- **P1.** Three places say "five (published) writing standards" and "seven of the ten proposed nothing,
  two produced a longer text": writing-rules.md:37-40, measurements.md:97-99 (M19) and
  research/README.md:9. The raw record shows four standards, three published and one an unpublished
  draft, plus one control condition. Its counts are five unchanged, one punctuation-only, three longer
  and one shorter; the evidence is under 109-121 above. Lines 37-42 lie outside the frozen block: the
  SHA-256 of `sed -n '6,25p' writing-rules.md` is still `7a577b29…f635d`. The README has these numbers
  right and the pages have them wrong.
- **P2.** audit/SKILL.md:39-41 and rewrite/SKILL.md:74-76 say the data is "deleted by
  `claude plugin uninstall` unless `--keep-data` is passed". At level 3, removing one of two
  installations keeps the data, and `claude plugin marketplace remove` also deletes it, which neither
  page mentions.
- **P3.** audit/SKILL.md:107-116, step 5b, gives task readers no place to act: no `$TMPDIR` and no
  isolated configuration. Compare critic-briefs.md:141-142 for rewrite's lens 4. Yet audit:44 says
  "Write nothing into the audited repository". Level 2: a task reader who follows a documented
  workflow could act on the user's real tree or configuration.
- **P4.** bake-off.md:114 vetoes any weakened warning, while truth-pass.md:23-25 and
  bake-off.md:60-62 require a false claim to be weakened or corrected. No rule says which wins for a
  false warning at a decision point. Level 2. This is the root of F6.
- **P5 (hypothesis).** The rendered audit and rewrite pages keep `$CLAUDE_PLUGIN_ROOT/skills/…/scripts`
  literal. This is level 3, from the `$T/stub-out-audit` and `$T/stub-out-rewrite` request bodies.
  CHANGELOG.md:61-62 says Claude Code exports nothing to the shell for `CLAUDE_PLUGIN_DATA`. If
  `CLAUDE_PLUGIN_ROOT` is also missing from the Bash tool's environment, then
  `S="$CLAUDE_PLUGIN_ROOT/skills/rewrite/scripts"` resolves to `/skills/rewrite/scripts`. The rendered
  text does begin with "Base directory for this skill: <path>". The Bash environment of a live skill
  session was not observed.

## Method and evidence

Read, all in whole:

- the target and `00-original.md` (126 and 90 lines);
- the 3 SKILL.md pages;
- all 11 references (audit ×4, rewrite ×6, rethink ×1);
- the 7 scripts and the 3 manifests;
- `CHANGELOG.md`;
- in `research/2026-09-10-chain/`: `README.md`, `chain-source-prompt.txt`, `chain/validation.json`,
  `run-2x5/index.json`, 7 `run-2x5` prompts and 2 answers (J1, J2);
- `research/README.md`;
- 8c041b7's audit and rewrite pages, through `git show` and `git diff`;
- Claude Code 2.1.280, through `strings`.

Ran, with exit codes:

| Command | Result |
|---|---|
| `selftest.mjs` | 0 |
| `ledger.mjs`, 3 runs | 0, 1, 1 |
| `sections.mjs` | 0 |
| `round.mjs`, then `ledger.mjs` | 0, then 1 |
| `wc -w` | 5 files |
| McNemar, in node | p = 0.25 |
| isolated-config CLI | 20 commands: marketplace add ×3, install ×8, uninstall ×4, marketplace remove ×2, list ×2, details ×1, all exit 0 |
| stub skill runs | 5, each exit 1 as intended: audit ×2 on 2f29a8f (the first, with an API key, said "Not logged in"; a bearer token then reached the stub), rethink ×1, rewrite ×1, audit ×1 on 8c041b7 |

A repository-wide grep for `6/6|3/6` printed a few lines from
`research/2026-09-22-terse-process/rewrite-2026-09-22/run/{edits/,reviews/02/,grafts.md}`, the
repository's copy of this run's records. I opened none of those files and nothing here rests on them.

## Not reached

- No skill ran on a live model, because that costs tokens. So "the coordinator runs the rendered line
  as written" is level 2. I ran the rendered line myself.
- The Bash environment of a live plugin-skill session was not observed. The 8c041b7 fallback and P5
  rest on the binary's code and the CHANGELOG.
- Interactive `/plugin` commands were not run.
- The 6/6 after-readers: their absence rests on a search, and their numbers cannot be checked.
- `/tmp/bakeoff/dossier.txt` is not kept, so "model names stripped" rests on the judges' prompts.
- Main at 8c041b7 was observed on 2026-09-23 against a commit dated 2026-09-18, not observed on
  2026-09-22 itself.
