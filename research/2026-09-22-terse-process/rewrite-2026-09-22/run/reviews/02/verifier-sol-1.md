# Codex Sol verification — round 02

Codex Sol verifier: done, 18 claims, 1 not holding

1. **G1 all three skills announce agents and model, then wait for your word — HOLDS.** Enclosing ranges opened: `audit/SKILL.md:84-92`, `audit/references/measure.md:28-42`, `rethink/SKILL.md:25-32,54-61`, `rewrite/SKILL.md:52-62,131-148`. Each skill requires count/model announcement before its wave and a wait. No function is named in these Markdown ranges.
2. **G4 version boundary: the write boundary below is this checkout's, not 8c041b7's — HOLDS.** Opened `8c041b7:rewrite/SKILL.md:64-71`, checked-out `rewrite/SKILL.md:64-79`, and `audit/SKILL.md:21-44`: 8c041b7 writes in the document repository, while this checkout writes outside and audit forbids repository writes. `git diff --exit-code 2f29a8f f677303 -- plugins/terse .claude-plugin/marketplace.json` exited 0. No function is named.
3. **G3a lifecycle: installed, claude plugin uninstall deletes the data directory and its runs unless --keep-data — HOLDS.** Opened/ran `probe-02/uninstall-probe.sh:1-27`, opened `audit/SKILL.md:21-44` and CLI help. The planted run marker disappeared without `--keep-data` and remained with it; both uninstalls exited 0. Whole-script call-site search: function `run` has 6 calls; `state` has 5.
4. **G3b lifecycle: from a checkout the operating system may purge the runs; copy a run to keep it — HOLDS.** Opened `audit/SKILL.md:21-44` and `rewrite/SKILL.md:64-79`; both use `${TMPDIR:-/tmp}/terse` absent plugin data and say the OS may purge it and the user must copy a run that must survive. No function is named.
5. **G2 chain, as its pages report: departures one to zero, neither control broken — HOLDS.** Opened `audit/references/measure.md:123-132` and `research/README.md:1-16`: they report 3/6 to 6/6, departures 1 to 0, neither control broken, six questions, one trial each. No function is named.
6. **C01 terse is a Claude Code plugin whose — HOLDS.** Opened `.claude-plugin/plugin.json:1-11` and `audit/SKILL.md:1-19`: the manifest names the plugin and descriptions state the reader-answer and code-agreement rulers. No function is named.
7. **C03 the plugin ships three skills. — HOLDS.** Opened/ran `probe-02/details-probe.sh:1-14`, opened the three skill frontmatters and manifests. The isolated install listed exactly audit, rethink and rewrite; all three declare `disable-model-invocation: true`. The probe defines no function.
8. **C06 audit builds a profile of the project's — HOLDS.** Opened `audit/SKILL.md:13-16,46-92` and `audit/references/measure.md:8-60`: profile, ledger/truth pass and answer key precede readers; one fresh reader per question starts at the entry file and may open only `.md`. No function is named.
9. **C07 audit returns a score, the questions that — HOLDS.** Opened `audit/SKILL.md:1-11,84-105,118-147`: it returns profile, ledger, scores and failures, reports the no-document delta, and assigns each wrong answer one of five causes. No function is named.
10. **C09 rethink decides, before any prose is written — HOLDS.** Opened `rethink/SKILL.md:1-23,25-68`: it works before prose, surveys comparable documents including the exact genre, settles terms and explores structures. No function is named.
11. **C10 rethink hands over a skeleton, each section — HOLDS.** Opened `rethink/SKILL.md:13-23,70-83`: each section's title, purpose, exclusions and budget are specified, then it stops and waits. No function is named.
12. **C11 rewrite starts from a skeleton `rethink` agr — HOLDS.** Opened `rewrite/SKILL.md:14-30`: an agreed rethink skeleton starts at Step 2; an audit run starts at Step 1, reading its `audit.md`. No function is named.
13. **C15 rewrite writes its rounds and artefacts into — HOLDS.** Opened `audit/SKILL.md:21-44` and `rewrite/SKILL.md:64-84`: rewrite uses audit's formula, selecting plugin data when installed and temporary fallback from checkout. No function is named.
14. **C24 on the one 2026-09-10 README the chain — HOLDS.** Opened `research/2026-09-10-chain/README.md:14-34` and `chain/audit.md:7-31`; counts 2725, 2482, 2377, 2482, 2571 give pass two -105, pass three +105, whole chain -154 (-5.65%, about six percent). No function is named.
15. **C33 three discordant pairs, all improvements, an — HOLDS.** Opened `references/prior-art.md:87-107` and `research/README.md:1-16`; inline exact-binomial calculation printed p = 0.25. Its only defined function `C` has one `C(n,k)` call; searched in the edit JSON.
16. **C42 the passage result rests on ten agents — HOLDS.** Opened `run-2x5/v04PR6HL.prompt.txt:5-28` and `research/2026-09-10-chain/README.md:36-48`: four writing-standard conditions (one draft) plus one control, two agents each, ten total. No function is named.
17. **C43 nothing in the record isolates which of — HOLDS.** Opened `audit/references/measure.md:123-132` and `rewrite/references/bake-off.md:1-15`: the pass-isolating experiment was not run and a bake-off beating one careful pass was not measured. No function is named.
18. **C44 the 2026-09-10 measurement had no arm that — DOES NOT ANSWER.** Opened `research/README.md:1-16`, `references/prior-art.md:87-112`, `chain/validation.json:1-22`, `research/2026-09-10-chain/README.md:14-62`, and `audit/references/measure.md:28-81,123-132`. They answer the no-document-arm clause, but evidence for “the repository holds no records of its individual readers” only counts files containing literal line-leading `departed:`. Records with another field/schema are left out; `live_reader_experiments_run: 0` describes the archived rewrite turn, not necessarily the prior experiment supplying 3/6 and 6/6. Rerunning the exact check printed count 1, not ledger `saw`'s 0, because its exclusion regex fails to exclude `measure.md`; corrected listing showed that file was the only literal match, but that still does not prove broader absence. No function is named.

## Duty 1 — behaviour sentences without a claim in their edit

These occur in an edit's `new` without a claim in that edit. C15 later covers quote 3, but the move edit itself does not.

- “When you re-audit a temporary candidate, keep it at the same relative location in a copy of its Markdown tree so its links still resolve. Use the same questions, answer key, entry file, and model; changing one makes it a new measurement rather than a comparison.” (Only its final clause is in G1's `new`; G1 claims only the announcement.)
- “The `audit` instructions create the run under the plugin data directory when installed, or under `$TMPDIR/terse` from a checkout, and forbid writing into the audited repository.”
- “The `rewrite` instructions create their run there too.” (Claimed only by separate C15 re-pin.)
- “They instruct the agent to record a code defect in `code-defects.md` in the run and offer it to you.”
- “Copying that defect into the repository's `ISSUES.md`, or applying the candidate to your document, requires your word.”
- “The `rethink` page does not specify where its skeleton is stored.”

## Duties 2 and 3

The first 17 `asks` retain the sentences' what/for-whom/condition scope and their `saw` answers it at the named ranges. C44 retains both clauses, but `saw` answers only the no-document clause and a narrower `departed:` search. Every verdict above names the enclosing ranges opened. Most are Markdown/JSON and name no implementation function; executable evidence has 6 `run` calls, 5 `state` calls, 1 inline `C` call, and no function in `details-probe.sh`.

## Duty 4 — guarantee-word search

The round's `new` fields contain one listed guarantee word: **only**, in “Readers start at the entry file and may open only Markdown.” I searched with `rg -n -i -g '*.md' '(may open only|open only|may (also )?open|can open|source files|non-markdown|\.md files|only markdown)'` in these 19 files:

`02-grafts.md`; `plugins/terse/CHANGELOG.md`; `plugins/terse/README.md`; `plugins/terse/references/practices-full.md`; `plugins/terse/references/prior-art.md`; `plugins/terse/skills/audit/SKILL.md`; `audit/references/ledgers.md`; `audit/references/measure.md`; `audit/references/reader-profile.md`; `audit/references/truth-pass.md`; `rethink/SKILL.md`; `rethink/references/stages.md`; `rewrite/SKILL.md`; `rewrite/references/bake-off.md`; `rewrite/references/critic-briefs.md`; `rewrite/references/curse-of-knowledge.md`; `rewrite/references/loop.md`; `rewrite/references/measurements.md`; `rewrite/references/writing-rules.md`. Plugin-relative names are under `~/Git/agent-skills/plugins/terse/`; `02-grafts.md` is in this run.

Result: **none in the 19 named files says otherwise**. Supporting matches: `02-grafts.md:23-25`, `audit/SKILL.md:89-92`, `audit/references/measure.md:33-38,44-60`; all restrict readers to Markdown and prohibit source/tests/configuration.

## Command evidence

- JSON counts: 19 edits, 18 claims, 13 re-pins, 18 checks; exit 0.
- Supplied-check loop: 18 commands, 18 per-command exit 0; loop exit 0. C44 printed 1 rather than recorded 0.
- Uninstall probe: 2 uninstall cases, both CLI exit 0; marker absent without keep-data, present with it; script exit 0.
- Details probe: marketplace 0, install 0, details 0, 3 skills, 3 disable lines; script exit 0.
- Five-file `wc -w`: 2725, 2482, 2377, 2482, 2571; exit 0.
- Node calculation: 1 p-value, 0.25; exit 0.
- Tree comparison: 0 plugin/marketplace differences between 2f29a8f and f677303; exit 0.
- Call-site grep: 2 definitions, 6 `run`, 5 `state`, 1 `C(n,k)`; exit 0.
- Guarantee extraction: 1 occurrence; contradiction search over 19 files found 3 supporting locations and no contrary sentence; exit 0.
- Repository unchanged: `git status --short` 0 paths; `git diff -- plugins/terse` 0 lines; exit 0.
- Failed command: `jq -r '.[].new' edits/02.json | rg ... | wc -l` started from temp cwd; pipeline status 0 because `wc` succeeded; exact diagnostic `zsh:1: command not found: rg`; printed 0. Discarded; prior repository-cwd `rg` and `/usr/bin/grep` established 1.
- First two report-write attempts using `/private/var/...` started and were rejected before patch application with exact diagnostic `patch rejected by user`; retry using the requested `/var/...` path succeeded.

## Open

None. C44 is definitely DOES NOT ANSWER because its run omits alternative individual-record schemas, even if the broader absence may be true.
