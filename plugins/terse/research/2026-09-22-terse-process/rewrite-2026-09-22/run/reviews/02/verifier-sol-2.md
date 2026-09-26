# Codex Sol verification — regenerated round 02

Codex Sol verifier: done, 24 claims, 1 not holding

1. **G1 all three skills announce agents and model, then wait for your word — HOLDS (earlier verdict stands; new edit).** Opened the enclosing wave blocks at `plugins/terse/skills/audit/SKILL.md:84-92`, `audit/references/measure.md:28-42`, `rethink/SKILL.md:25-32,54-61`, and `rewrite/SKILL.md:52-62,131-148`; each skill announces count/model before spawning and waits. No implementation function is named.
2. **G4 version boundary: the write boundary below is this checkout's, not 8c041b7's — HOLDS (earlier verdict stands; new edit).** Opened `8c041b7:plugins/terse/skills/rewrite/SKILL.md:64-71`, checked-out `rewrite/SKILL.md:64-79`, and `audit/SKILL.md:21-44`; the old revision writes inside the document repository and this checkout writes outside. No function is named.
3. **R02a audit's run: plugin data directory installed, `${TMPDIR:-/tmp}/terse` from a checkout, nothing written into the audited repository — HOLDS (new).** Opened all of audit Step 1, `audit/SKILL.md:21-44`: line 33 has the exact fallback, lines 36-38 distinguish checkout/installed execution, and line 44 forbids repository writes. No function is named.
4. **C15 rewrite writes its rounds and artefacts into — HOLDS (re-pin; earlier verdict stands).** Opened `audit/SKILL.md:21-44` and `rewrite/SKILL.md:64-84`; rewrite invokes audit's formula and repeats the same plugin-data/temporary fallback. No function is named.
5. **R02c rewrite records a code defect in code-defects.md in the run and offers it to the user — HOLDS (new).** Opened the complete routing and return blocks at `rewrite/SKILL.md:149-155,194-208`; a code finding with its check goes into run-local `code-defects.md` and to the user as a proposal. No function is named.
6. **R02d copying a defect into ISSUES.md, or applying the candidate, waits for the user's word — HOLDS (new).** Opened `rewrite/SKILL.md:74-79,149-155,177-192`; it says neither candidate nor defect enters the repository without the user's word, explicitly gates `ISSUES.md`, and separately gates applying the candidate. No function is named.
7. **R02e the rethink page does not say where its skeleton is stored — HOLDS (new).** Opened all of `rethink/SKILL.md:1-89`, especially the handover block at `:70-83`, and `ISSUES.md:183-194`; the page identifies one file and its contents but no path, directory, storage location, or repository boundary. The supplied whole-page grep printed 0. No function is named.
8. **G3a lifecycle: installed, claude plugin uninstall deletes the data directory and its runs unless --keep-data — HOLDS (earlier verdict stands; new edit).** Opened and ran `probe-02/uninstall-probe.sh:1-27`, opened `audit/SKILL.md:21-44`, and opened CLI help; the marker was deleted without keep-data and preserved with it. Functions searched through the whole probe: `run` has 6 calls, `state` 5.
9. **G3b lifecycle: from a checkout the operating system may purge the runs; copy a run to keep it — HOLDS (earlier verdict stands; new edit).** Opened `audit/SKILL.md:21-44` and `rewrite/SKILL.md:64-79`; both state the temporary fallback, purge risk and durable-copy instruction. No function is named.
10. **G2 chain, as its pages report: departures one to zero, neither control broken — HOLDS (earlier verdict stands; new edit).** Opened `audit/references/measure.md:123-132` and `research/README.md:1-16`; the pages report all scoped numbers and controls. No function is named.
11. **R02f1 a re-audited temporary candidate keeps its relative place in a copy of its Markdown tree, so its links resolve — DOES NOT ANSWER (new).** Opened the complete rights/brief blocks at `audit/references/measure.md:28-60`. They say readers may open repository Markdown and follow links, but do not mention a temporary candidate, copying its Markdown tree, preserving the candidate's relative location, or observing that its links resolve after copying. The check covers a neighboring reader-permission rule, not the sentence's condition and result. No function is named.
12. **R02f2 a re-audit uses the same questions, answer key, entry file and model, or it is a new measurement — HOLDS (new).** Opened the complete remeasurement block at `audit/references/measure.md:106-115`; it names the same four inputs and says changing any makes the scores incomparable and the result a new measurement. No function is named.
13. **C01 terse is a Claude Code plugin whose — HOLDS (re-pin; earlier verdict stands).** Opened `.claude-plugin/plugin.json:1-11` and `audit/SKILL.md:1-19`; both measurement rulers are stated. No function is named.
14. **C03 the plugin ships three skills — HOLDS (re-pin; earlier verdict stands).** Opened/ran `probe-02/details-probe.sh:1-14` and opened all three skill frontmatters; the isolated installation listed three skills and each disables model invocation. The probe defines no function.
15. **C06 audit builds a profile of the project's — HOLDS (re-pin; earlier verdict stands).** Opened `audit/SKILL.md:13-16,46-92` and `audit/references/measure.md:8-60`; profile, ledger and key precede one fresh Markdown-only reader per question. No function is named.
16. **C07 audit returns a score, the questions that — HOLDS (re-pin; earlier verdict stands).** Opened `audit/SKILL.md:1-11,84-105,118-147`; it returns the named artifacts, reports the no-document delta, and classifies every wrong answer with the five causes. No function is named.
17. **C09 rethink decides, before any prose is written — HOLDS (re-pin; earlier verdict stands).** Opened `rethink/SKILL.md:1-68`; it works before prose and covers comparable documents, terminology and structures. No function is named.
18. **C10 rethink hands over a skeleton, each section — HOLDS (re-pin; earlier verdict stands).** Opened `rethink/SKILL.md:13-23,70-83`; each requested skeleton field is present and it then stops and waits. No function is named.
19. **C11 rewrite starts from a skeleton rethink agreed or an audit run — HOLDS (re-pin; earlier verdict stands).** Opened `rewrite/SKILL.md:14-30`; its route table and Step 1 provide both starts. No function is named.
20. **C24 on the one 2026-09-10 README the chain — HOLDS (re-pin; earlier verdict stands).** Opened `research/2026-09-10-chain/README.md:14-34` and `chain/audit.md:7-31`; executed counts are 2725, 2482, 2377, 2482 and 2571, yielding -105, +105 and -5.65%. No function is named.
21. **C33 three discordant pairs, all improvements, an — HOLDS (re-pin; earlier verdict stands).** Opened `references/prior-art.md:87-107` and `research/README.md:1-16`; the executed exact calculation printed p=0.25. Inline function `C` has one call, `C(n,k)`, found in the edit JSON.
22. **C42 the passage result rests on ten agents — HOLDS (re-pin; earlier verdict stands).** Opened `research/2026-09-10-chain/run-2x5/v04PR6HL.prompt.txt:5-28` and `research/2026-09-10-chain/README.md:36-48`; four writing-standard conditions, including the draft, plus one two-agent control make ten. No function is named.
23. **C43 nothing in the record isolates which of — HOLDS (re-pin; earlier verdict stands).** Opened `audit/references/measure.md:123-132` and `rewrite/references/bake-off.md:1-15`; both unmeasured comparisons are stated explicitly. No function is named.
24. **C44 the 2026-09-10 measurement had no arm that — HOLDS (re-pin; earlier DOES NOT ANSWER no longer stands).** Opened `research/README.md:1-16`, `audit/references/measure.md:123-132`, `ISSUES.md:92-101`, and the whole archive inventory at `research/2026-09-10-chain/README.md:14-62`. The revised run identifies the 3/6→6/6 measurement, states no arm ever ran without the document, and directly distinguishes the archived summaries from missing individual reader returns. Independent inventory found 15 `chain/` files and 40 separately identified bake-off answers, consistent with E7. No function is named.

## Duty 1 — claim coverage

No behaviour sentence in any regenerated `new` is left without a claim. The rebuilt Where-it-writes section has R02a, C15, R02c, R02d and R02e; its lifetime sentences have G3a/G3b; the re-audit paragraph has R02f1/R02f2; G1 and G4 cover their own sentences. No duty-1 quote remains.

## Duty 2 — asks and saw

Twenty-three `asks` retain and receive evidence for their sentence's what/for-whom/condition scope. R02f1's `asks` correctly retains temporary candidate, copied Markdown tree, same relative location, link resolution and re-audit readers, but its `saw` contains only generic permissions to open Markdown and follow links. That dropped evidence scope is the single non-holding finding.

## Duty 3 — blocks and call sites

Every verdict above names the enclosing ranges opened. The cited repository ranges are Markdown/JSON and name no implementation function. In executable evidence, whole-file grep found 2 shell function definitions: 6 calls to `run`, 5 to `state`; the C33 inline helper `C` has 1 call; `details-probe.sh` defines none.

## Duty 4 — guarantee-word search

The regenerated `new` fields contain one word from the required list: **only**, in C06's “Readers start at the entry file and may open only Markdown.” I searched the following 19 files using `rg -n -i -g '*.md' '(may open only|open only|may (also )?open|can open|source files|non-markdown|\.md files|only markdown)'`:

`02-grafts.md`; `plugins/terse/CHANGELOG.md`; `plugins/terse/README.md`; `plugins/terse/references/practices-full.md`; `plugins/terse/references/prior-art.md`; `plugins/terse/skills/audit/SKILL.md`; `audit/references/ledgers.md`; `audit/references/measure.md`; `audit/references/reader-profile.md`; `audit/references/truth-pass.md`; `rethink/SKILL.md`; `rethink/references/stages.md`; `rewrite/SKILL.md`; `rewrite/references/bake-off.md`; `rewrite/references/critic-briefs.md`; `rewrite/references/curse-of-knowledge.md`; `rewrite/references/loop.md`; `rewrite/references/measurements.md`; `rewrite/references/writing-rules.md`. Plugin-relative paths are under `~/Git/agent-skills/plugins/terse/`; `02-grafts.md` is in this run.

Result: **none in the 19 named files says otherwise**. Supporting matches are `02-grafts.md:23-25`, `audit/SKILL.md:89-92`, and `audit/references/measure.md:33-38,44-60`.

## Command evidence

- Corrected JSON counts: 23 edits, 24 claims, 13 old=new re-pins, 23 checks; exit 0. Ledger count: 39; exit 0.
- All supplied checks: 23 commands, 23 per-command exit 0; loop exit 0.
- Lifecycle probe: 2 uninstall cases, both CLI exit 0; data marker deleted without keep-data and preserved with it; script exit 0.
- Details probe: marketplace 0, install 0, details 0; 3 skills and 3 disable lines; script exit 0.
- C44 inventory: 15 files in `chain/`, 40 `.answer.md` bake-off returns, and E7 distinguishes summaries from absent reader returns; exit 0.
- Five-file word count: 2725, 2482, 2377, 2482, 2571; exit 0.
- Inline McNemar calculation: 1 result, p=0.25; exit 0.
- Function grep: 2 definitions, 6 `run` calls, 5 `state` calls, 1 `C(n,k)`; exit 0.
- Guarantee search: 19 named files searched, 3 direct supporting locations, no contrary sentence; exit 0.
- Repository unchanged: `git status --short` printed 0 paths and scoped diff exited 0.
- Failed count command: `jq 'length, [.[]|.claims[]?]|length, ...' edits/02.json` started, printed 23, then exited 5 with exact diagnostic `Cannot iterate over number (23)`; corrected commands above were used.
- Failed temp-cwd guarantee commands: both `rg` processes failed to start, with exact diagnostic `zsh:1: command not found: rg`; the surrounding command exited 0 after `find`. Searches were rerun successfully from repository cwd.

## Open

None. R02f1 is a definite DOES NOT ANSWER because the cited run omits the sentence's copied-tree/location/link-resolution behavior.
