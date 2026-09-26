# Opus lens 1: the code, with the right to run it. Round 02, `02-grafts.md`

**HEAD read:** `b5a082b` on `terse-process-2026-09-22`. The brief's premise does not hold:
`git diff --stat 2f29a8f HEAD -- plugins/terse` is not empty — 14 files, 811 insertions, 103 deletions
(the three SKILL.md pages, `round.mjs`, `selftest.mjs`, `briefs.md`, `stages.md`, …). Verdicts below are
against HEAD. Where 2f29a8f differs: F3 does not hold there (rewrite had no shape gate), and line 27's shape
step and line 65 for rethink have nothing behind them there (audit returned no shape verdict; rethink named
no run directory: `git show 2f29a8f:plugins/terse/skills/rethink/SKILL.md | grep -c CLAUDE_PLUGIN_DATA` → 0).

**Standard:** level 2, and level 3 wherever the code or the CLI could run without cost or risk.

**Repository:** `git -C ~/Git/agent-skills status --porcelain` printed nothing before (02:35)
and after (03:01). Nothing in the repository was modified.

**Host-application commands:** `claude` 2.1.280, three isolated configurations under `$TMPDIR/lens1-opus/`,
each with its own `HOME` and `CLAUDE_CONFIG_DIR`, started with `env -i` or a Node launcher that sets the
environment explicitly (no `CLAUDECODE`). None was signed in, no credentials were copied, and
`--dangerously-skip-permissions` was never used. `cfg` ran the Quick start's commands against GitHub.
`cfg2` used a `--no-local` clone of HEAD as a path marketplace. `cfg3` used a temporary bare repository
served over local smart HTTP, for update and uninstall. The `-p` runs pointed `ANTHROPIC_BASE_URL` at a
local stub (`$TMPDIR/lens1-opus/stub/server.mjs`, `launch.mjs`) with a fake key, so no model was called.

**Level-3 facts outside the verdicts:**
- The Quick start's install (lines 8–9) fetched GitHub main `8c041b7` (`installed_plugins.json`
  `gitCommitSha`). That copy's rewrite works in "`research/<date>-<slug>/` at the root of the repository
  that holds the document" (cache `skills/rewrite/SKILL.md:66-67`). So lines 33 and 65 describe HEAD's
  tree and are true only after it is released.
- The update (lines 38–39) is gated on the version number. With HEAD's tree pushed to the temporary
  marketplace at the unchanged 0.1.1, `claude plugin update terse@nowely` printed "✔ terse is already at
  the latest version (0.1.1)." and kept the old copy. After a version bump in the temporary copy it printed
  "✔ Plugin "terse" updated from 0.1.1 to 0.1.2-lens1probe for scope user. Restart to apply changes." A
  planted run in `plugins/data/terse-nowely/runs/` survived that update. `claude plugin uninstall
  terse@nowely` then deleted `plugins/data/terse-nowely/`, runs included, without asking.

**Behaviour sentences checked:** 43 — lines 3 (2), 8, 9, 12, 14/17, 20 (2), 27 (2), 30, 33 (2), 38, 39,
42, 48, 49, 50, 52 (2), 54, 55, 59 (3), 60, 61 (2), 62 (2), 63 (2), 64, 65 (2), 69 (3), 70, 71, 72 (2).

## Findings

### F1 — line 3 — OVERSTATED — level 3

> A Claude Code plugin for assessing and improving any text, a README first, in rounds of edits …

Readers may open Markdown and nothing else: `audit/SKILL.md:92` "may open only `.md` files, may not read
source"; `audit/references/measure.md:49` "You may open only .md files in <REPO>". Text with no code behind
it gets a weaker truth pass that nobody has measured: `truth-pass.md:79` "This weaker form has not been measured." The
owner's statement is an aim, in stages: `rethink/references/stages.md:46-47` "the README now, documentation
and code later". The per-round check `rule1.mjs` (`rewrite/SKILL.md:140`) reads English only, because its
`\w` and `\b` are ASCII:

```
$ printf '# t\n\nThe tool exits 2 and writes ~/.cache/tool/state when --force is set.\n\nИнструмент выходит с кодом 2 и пишет в ~/.кэш/инструмент/состояние при флаге --сила.\n\n## How it works\n' > $TMPDIR/lens1-opus/rule1-lang.md
$ node plugins/terse/skills/rewrite/scripts/rule1.mjs $TMPDIR/lens1-opus/rule1-lang.md
! line 3  absolute path  ~/.cache/tool/state
! line 3  flag name      --force
! line 3  exit code      exits 2
! line 5  absolute path  ~/.
4 violation(s), 0 excused
```

On the same sentence in Russian it misses the flag and the exit code, and cuts the path to `~/.`. The
document's own lines 23–24 quote the audit that found this intent "appears in no page".

### F2 — line 12 — OVERSTATED — level 3

> You need: Node 22 or newer, and a signed-in Claude Code.

22 is the version `package.json:4-5` declares (`"node": ">=22"`), not a version anything was shown to
need. The self-test of every shipped script passes on Node 20.10.0, child processes included:

```
$ env PATH=~/.nvm/versions/node/v20.10.0/bin:/usr/bin:/bin node plugins/terse/skills/rewrite/scripts/selftest.mjs
… 50 lines "ok", 0 lines "MISS", "all checks caught their planted violation", exit 0
```

A grep over `skills/*/scripts/*.mjs` for Node-22-only APIs (`globSync`, `import.meta.dirname`, `groupBy`,
`withResolvers`, `findLast`, `toSorted`, …) finds none.

### F3 — lines 50 and 54 — OVERSTATED — level 2

> `| /terse:rewrite | After audit, or a skeleton you agreed to | …` (line 50)
> `- /terse:audit → /terse:rewrite → /terse:audit again with the same questions` (line 54)

After an audit, rewrite starts only if the shape was agreed: `rewrite/SKILL.md:14-20` "Nothing is written
on a shape the user has not agreed to in their own words … A run file or run directory with no verdict is
not agreed … Not agreed, stop and offer `/terse:rethink`". The audit records `shape: not agreed` unless the
user's word is on record, and then offers `/terse:rethink` and ends with "Run neither."
(`audit/SKILL.md:166-174`). Line 27 states this condition. Lines 50 and 54, where a reader picks the next
skill, leave it out.

### F4 — line 61 — FALSE — level 2

> … then rounds of edits, checked by AI reviewers, each checking one thing.

Lens 2 is one agent with three lenses: `rewrite/references/critic-briefs.md:102` "You are the critic for the
mechanical rules, the water, and the contradictions"; `:110` "Three lenses, reported separately". Its table
row is "2. the mechanical rules and the water" (`rewrite/SKILL.md:190`). Lens 3 has five duties, A to E
(`critic-briefs.md:128-135`). `rewrite/SKILL.md:197`: "Lenses differ; they are not disjoint".

### F5 — line 62 — OVERSTATED — level 2

> … rethink reads documents like yours first.

The survey is a fan-out the user sizes. `rethink/SKILL.md:60`: "Announce the count and the models before
spawning, and wait for the user's word". On the route line 27 sends a reader down, entry from an audit,
`rethink/SKILL.md:25-27` says "step 1 at the size the user gives, zero included".

### F6 — line 63 — OVERSTATED — level 2

> Length never picks a draft; …

The rule is that word count never selects. The same page says the judges' bias toward length is not
controlled: `rewrite/references/bake-off.md:13-15` "One more thing this sheet does not yet control. Model
judges are measured to prefer longer answers and to prefer their own writing, and this bake-off defaults to
a panel drawn from one model family; word count is reported and never selects. Read a narrow win on length
as a tie."

### F7 — line 64 — OVERSTATED — level 3

> A round that drops a claim checked true, or brings back one found false, is refused before you see it.

Run with `$TMPDIR/lens1-opus/ratchet-repro.sh`, which writes a fresh `mktemp -d` directory and seeds a
ledger through `ledger-seed.mjs` from an audit with two claims: C01 confirmed, "It writes into your tree
only on your word."; C02 refuted, "Every run leaves a receipt.". Output:

```
-- B2: remove the sentence checked true, with drop declared
wrote …/02-drop.md
ledger exit=0
-- B3: bring the false claim back in other words          (new text: "Each run always leaves a receipt.")
wrote …/03-revive.md
ledger exit=0
-- B3': the same false claim word for word
wrote …/03-verbatim.md
ledger exit=1
```

- An edit that declares `drop` deletes the pin (`round.mjs:157`), and the round passes.
- A pattern is the sentence itself as a literal (`audit/scripts/ledger-seed.mjs:15-17`: "a sentence
  paraphrased does not" match). A false claim brought back in new words passes.
- Only pinned claims are covered, meaning those seeded from an audit or declared by an edit
  (`round.mjs:144-158`). Without an audit the ledger "starts empty" (`rewrite/SKILL.md:118`).
- The refusal is a step the coordinator takes, not the script: `round.mjs` writes the round file whatever
  the ledger says ("wrote …" above and in F8). `rewrite/SKILL.md:143-149` tells the coordinator to remove
  it and regenerate.

### F8 — line 64 — UNDERSTATED — level 3

> … or brings back one found false, is refused …

A round that only keeps a sentence the audit refuted, bringing nothing back, is refused too. Same script:

```
-- A: round keeps the refuted sentence, brings nothing back
wrote …/A1.md
1 failure(s) in …/A1.md
ledger exit=1
```

So the first round is refused until every refuted sentence is gone. The 2026-09-22 record says the same:
"`ledger.mjs` over the unchanged README is red by design: every refuted sentence reads YES"
(`research/2026-09-22-terse-process/audit-2026-09-22/audit.md:1034`).

### F9 — line 71 — OVERSTATED — level 2

> 2026-09-22, this plugin's audit of its own README: 5 of 7 right with the text, 0 of 7 without.

The record's score line has these numbers (`audit-2026-09-22/audit.md:993`), and right beside it the record
gives two other readings of the same returns. `:1032-1033`: "Q4 and Q5 were scored right … over an
imprecise word ("proposed fixes") and an overstated "No"; a stricter scorer gives 3/7". `:1029-1031`: the
no-document "I do not know" on the planted Q7 "is the honest answer to a planted question … scored here as
not right". Re-reading the raw returns against the key (`audit.md:987`) finds the same: Q4d
`readers.md:94` "You get proposed fixes, not an automatic rewrite"; Q5d `readers.md:122` "No. … the round
fails"; Q7n `readers.md:195` "I do not know.". The text measured is also not this one. The score is for
"README at 1a24018" (`audit.md:993`), and `git show 1a24018:plugins/terse/README.md` is byte-identical
(`cmp`) to `plugins/terse/README.md`, which is byte-identical to `R/00-original.md`. That is the README this
draft replaces.

## Reached only level 1

1. **Line 69**: "AI readers' right answers 3 of 6 → 6 of 6; the questions it already answered right stayed
   right. One small trial". The reader returns are not in `research/2026-09-10-chain/`:
   `grep -rlE '3/6|6/6' research/2026-09-10-chain/` finds only two unrelated seat answers
   (`run-2x5/SYjOzmzM`, `run-2x5/fYDiYZUN`); `chain/validation.json:20` has `"live_reader_experiments_run": 0`;
   `chain/audit.md:533` says "No new six-reader experiment was run". The numbers appear only in summaries
   (`research/README.md:9`, `plugins/terse/references/prior-art.md:92-93`, `audit/references/measure.md:4-5`).
   The 2026-09-22 audit left them unconfirmed as "numbers whose readers' data is not in the record"
   (`audit-2026-09-22/audit.md:1040`). Only *p* = 0.25 reaches level 3, as arithmetic on those counts: exact
   two-sided McNemar, three discordant pairs all one way, 2 × 0.5³ = 0.25.
2. **Line 27**: whether the user's word on the shape, given after the report as the line has it, reaches
   the verdict rewrite reads. The audit writes the run file and then reports the verdict
   (`audit/SKILL.md:155-174`), and no step rewrites *Score* afterwards. Rewrite takes the verdict from
   `audit.md` (`rewrite/SKILL.md:16-20`, `37-38`). Only a live turn would settle this. None was run.
3. **Line 54**: "again with the same questions". `audit/references/measure.md:108` requires "Same
   questions, same key, same entry file, same model", but no audit step takes an earlier run as input.
   Step 1 settles files, repository and entry file and makes a new run directory (`audit/SKILL.md:23-34`);
   Step 4 writes the questions from the profile (`:73-77`).
   `grep -n -i -E 'previous run|earlier run' plugins/terse/skills/audit/SKILL.md` finds nothing.
