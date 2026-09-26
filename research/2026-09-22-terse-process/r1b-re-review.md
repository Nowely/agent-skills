# Codex Sol R1 — re-review after the fixes, 2026-09-22

The five fields of the driver report, verbatim. Commands: 17.

## status

done

## result

Codex Sol R1: fail, re-reviewed the six fixes from a fresh temporary copy and found three new correctness problems plus an E4 wording defect.
1. RESOLVED — rewrite/SKILL.md:103-104: “kept in the ledger as `saw`”; lines 123-124 give the verifier both `edits/NN.json` and the relevant `ledger.json` entries.
2. RESOLVED — critic-briefs.md:38-41: “Two files and the code: <edits/NN.json> … <ledger.json> … each with its `asks` … and its `saw`.”
3. RESOLVED — CHANGELOG.md:34-36: the verifier receives `edits/NN.json` and `ledger.json`, and “`saw` lives there, not in the edits file.”
4. RESOLVED — rewrite/SKILL.md:128-130: an `unreachable` claim has its check rewritten or is removed before the round freezes.
5. RESOLVED — round.mjs:22-23 now says “the verifier of step 4’s wave”; `rg 'step 4b' plugins/terse` found no match.
6. RESOLVED — rewrite/SKILL.md:94-97 explicitly defines `drop` and requires each dropped entry in the round’s `rounds.md` row.
7. RESOLVED — ledgers.md:82-86 says the block sits under Claim ledger; the planted outside-section block exited 1.
8. RESOLVED — ledgers.md:82-86 requires adjacent `### C..` entries; the planted block-only ledger exited 1.
9. RESOLVED — ledgers.md:82-86 requires every field for every verdict; planted missing-source, missing-level and missing-claim entries each exited 1.
10. RESOLVED — rewrite/SKILL.md:117-121 makes the verifier user-sized and optional, restores the minimum to lenses 1 and 2, and states what omitting the verifier gives up.
RERUN selftest — PASS: exit 0, 44 ok, 0 MISS.
RERUN replay — PASS: rounds 04–09 each exited 0 under `--allow-unrun`; all 6 recorded-file comparisons exited 0.
RERUN snapshot — PASS: round exit 0; snapshot cmp exit 0; restore cp exit 0; restored-ledger cmp exit 0 against a deliberately differently formatted original.
RERUN seed refusals — PASS: all 6 planted cases exited 1, produced the expected diagnostic and wrote no ledger; aggregate harness exit 0.
NEW FINDING critic-briefs.md:38-41 — “A claim’s name is what joins the two,” but claim names are not required to be unique. A two-edit fixture using the same name exited 0 and silently collapsed both claims to the second ledger entry, leaving no `saw` for the first claim.
NEW FINDING critic-briefs.md:38-40 — “each edit with its `old`, its `new` and its `check`” contradicts rewrite/SKILL.md:97 and round.mjs:55-56, which require a check only for edits carrying claims. A claimless edit without a check exited 0.
NEW FINDING rewrite/SKILL.md:148-150 — under the column “Where it ran best,” verifier row 0 names Sol, while measurements.md:127-134 says only Astra was measured and “nothing here is evidence about Sol.” The Agent rename and cost caption are otherwise consistent, but the table as a whole is not.
NEW FINDING critic-briefs.md:33-34 and CHANGELOG.md:43-44 call the single blind run a “catch rate,” while measurements.md:131-133 explicitly calls it “a hypothesis … not a rate.”
E4 — counts and cited paths resolve: replay=40, shipped ledger=66, record-only=26; loop.md:68-70 says round.mjs grows the ledger from claims and retire. Its wording is not yet issue-ready: ISSUES.md:61-64 says step 4 gives round.mjs as “the only writer,” but rewrite/SKILL.md:90-93 also gives ledger-seed.mjs as the audit-route initializer. “Only post-initialization writer” would be accurate. The issue text’s claim that “nothing documents” the format is also too broad because ledger.mjs and round.mjs headers document fields, even though the executor page gives no hand-edit procedure.
MERGE — not mergeable as written: the verifier’s two-file join is ambiguous for duplicate claim names, its brief misstates which edits carry checks, and the table attributes an unmeasured “ran best” result to Sol.

## evidence

- `node plugins/terse/skills/rewrite/scripts/selftest.mjs` → exit 0; 44 `ok`, 0 `MISS`.
- Replay harness invoking `node round.mjs PREV NEXT edits/NN.json --ledger ledger.json --allow-unrun` for NN 04–09 → harness exit 0; six round exits 0 and six `cmp` exits 0.
- Snapshot fixture: `node round.mjs ...` → exit 0; `cmp ledger.before.json ledger.04.json` → exit 0; `cp ledger.04.json ledger.json` → exit 0; final `cmp` → exit 0.
- Six independent `node ledger-seed.mjs AUDIT OUTPUT` commands: IDs disagree, block outside section, no prose entries, missing sources, missing level and missing claim → each exit 1; each diagnostic assertion exit 0; aggregate harness exit 0.
- Duplicate-name probe: `node round.mjs duplicate-join-head/from.md ...` → exit 0; assertion that two claims collapsed to one carrying only the second `asks` and `saw` → exit 0.
- Claimless-edit probe: `node round.mjs claimless-head/from.md ...` with no check → exit 0; output-file assertion exit 0.
- E4 count assertion → exit 0: record=66, replay=40, record_only=26, replay_only=0. Referenced record-path existence check → exit 0.
- `rg -n 'step 4b' plugins/terse` → exit 1, meaning no match.
- Repository `git status --short --branch` → exit 0 and clean.
- One attempted evidence command ran its searches, then the `tee head-text-search.result` segment tried to write in the read-only repository and exited 1 with exact diagnostic `tee: head-text-search.result: Operation not permitted`; no repository file was written. It was rerun from the temporary directory, where the step-4b search exited 1 and the positive term search exited 0.

## open

- Unknown: whether duplicate claim names were intended to be forbidden. No page states that rule, and round.mjs currently accepts and collapses them.
- Taste: “The lenses are fixed” and the post-table “Lenses differ” remain reasonable because both refer only to lenses 1–6; changing the table’s first header to Agent correctly accommodates verifier row 0.
