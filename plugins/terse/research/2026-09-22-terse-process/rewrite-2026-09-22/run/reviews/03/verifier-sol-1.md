Codex Sol verifier: done, 24 claims, 1 not holding

C01 terse is a Claude Code plugin whose — HOLDS — plugin.json:4 and audit/SKILL.md:3-7 establish the two measurements, while rewrite/SKILL.md:3-7 says rewrite proposes/writes the text.
R03a register: each skill is a page of instructions for Claude, and the section says what each page says — HOLDS — audit/SKILL.md:1-16, rethink/SKILL.md:1-8 and rewrite/SKILL.md:1-25 are the three skill instruction pages, and audit/SKILL.md:13-16, rethink/SKILL.md:30 and rewrite/SKILL.md:27-30 supply the sampled page behavior summarized below the register sentence.
C07 audit returns a score, the questions that — HOLDS — audit/SKILL.md:3-6 returns the profile, ledger, scores and failures; audit/SKILL.md:94-100 and :118-131 define the no-document delta and all five exhaustive wrong-answer causes.
R03c the claim ledger excludes voice and ordering, illustrative examples, arguments for instructions, unshipped tools' recipes — HOLDS — audit/references/truth-pass.md:61-71 lists all four exclusions and says they do not enter the ledger; audit/SKILL.md:54-59 defines what does enter it.
R03d for an existing document an adversarial read precedes a bake-off of three whole-file candidates and two judges — HOLDS — rewrite/SKILL.md:52-62 says the adversarial read runs first, then three whole candidates and two judges.
R03e later rounds are checked against the claim ledger, the audit's on its route; tasks and questions before a round reaches you — HOLDS — rewrite/SKILL.md:52-58 makes later rounds edit the prior round, :93-130 seeds and checks the audit ledger on every round, and :177-192 gates user reading on the ledger, task readers, and question readers.
R03f the loop stops when you read a round and say whether you would send it as it is — HOLDS — rewrite/SKILL.md:177-192 states this stop condition verbatim and distinguishes hand-over signals and caps from a finish.
R03g every cut of twenty words or more carries a reason, every declared behavioural claim its source and evidence — HOLDS — rewrite/SKILL.md:44-47 requires an evidence level for every behavior statement, :107-118 requires claims and their checks, :194-208 requires reasons for every 20-word cut, and rewrite/references/bake-off.md:65-73,108-120 requires file/line backing and judges the cut ledger.
R03h install needs Claude Code; running a skill needs sign-in; audit and rewrite also need Node 22 or newer on PATH — HOLDS — install-probe.sh's full level-3 run exited 0: install operations succeeded without login/Node, each of audit/rethink/rewrite was refused with “Please run /login,” a skill script without Node exited 127, only audit and rewrite pages invoke Node, and package.json:1 declares node >=22; the relevant instruction blocks are audit/SKILL.md:153-165 and rewrite/SKILL.md:81-130.
R03i this page describes commit 2f29a8f — HOLDS — the opened blocks audit/SKILL.md:21-44 and rewrite/SKILL.md:64-79 are unchanged from 2f29a8f, and `git diff --quiet 2f29a8f -- plugins/terse .claude-plugin/marketplace.json` exited 0.
R03j at the 2026-09-22 audit the install commands resolved main at 8c041b7, whose rewrite page wrote into the document repository unasked — HOLDS — brief.md:198 and audit.md:209 identify the installed main as 8c041b7; the opened historical blocks 8c041b7:rewrite/SKILL.md:66-67,112-113 place the run and ISSUES.md inside the document repository without a consent condition, contrasted with 2f29a8f:rewrite/SKILL.md:64-79.
G4 version boundary: the write boundary below is this checkout's, not 8c041b7's — HOLDS — audit/SKILL.md:21-44 and rewrite/SKILL.md:64-79 are the 2f29a8f outside-repository/no-write blocks, while 8c041b7:rewrite/SKILL.md:66-67,112-113 is the contrary historical block; the scoped tree diff from 2f29a8f exited 0.
G3b lifecycle: from a checkout the operating system may purge the runs; copy a run to keep it — HOLDS — despite the stale claim name, its asks correctly covers only placement; rundir-probe.sh's level-3 run exited 0 and exercised the formula from audit/SKILL.md:21-42 with supplied data, TMPDIR fallback, and /tmp fallback.
R03b installed, the runs land in plugins/data/terse-nowely/runs/ inside Claude Code's configuration directory — HOLDS — rundir-probe.sh's level-3 run exited 0 and observed the installed line begin with `<probe>/config-installed/plugins/data/terse-nowely`; the enclosing explanation is audit/SKILL.md:21-42.
R02a audit's run: plugin data directory installed, ${TMPDIR:-/tmp}/terse from a checkout, nothing written into the audited repository — HOLDS — the sentence's actual asks includes the no-write rule and its explicit score exception: audit/SKILL.md:21-44 forbids repository writes, while audit/references/measure.md:117-121 permits storing the score there only with the user's word.
C15 rewrite writes its rounds and artefacts into — HOLDS — audit/SKILL.md:21-42 defines the shared placement formula and rewrite/SKILL.md:64-84 adopts it with a document slug; rewrite/SKILL.md:194-208 enumerates the run artifacts.
R02c rewrite records a code defect in code-defects.md in the run and offers it to the user — HOLDS — rewrite/SKILL.md:149-155 routes checked defects to run-local code-defects.md and to the user as proposals, and :194-204 repeats the return contract.
G3a lifecycle: installed, claude plugin uninstall deletes the data directory and its runs unless --keep-data — HOLDS — lifetime-probe.sh's level-3 run exited 0 and observed ordinary uninstall delete data, --keep-data preserve it, removal of a non-last scoped install preserve it, removal of the last delete it, and marketplace remove delete it; the enclosing documented lifecycle is audit/SKILL.md:36-42 and rewrite/SKILL.md:74-79.
G3c lifecycle: runs in the temporary directory may be purged by the operating system; copy a run to keep it — DOES NOT ANSWER — the check opens only the neighboring instruction assertions at audit/SKILL.md:36-42 and rewrite/SKILL.md:74-79; it does not exercise or cite an operating-system purge policy, so it leaves out the claimed temporary-run lifecycle, and rewrite/SKILL.md:44-47 explicitly says a lifecycle claim at level 2 is a guess.
C24 on the one 2026-09-10 README the chain — HOLDS — research/2026-09-10-chain/README.md:1-34 identifies the four-pass chain and missing-framing restoration; wc over chain/00-original.md, 01-reader-pass.md, 02-writing-pass.md, 03-prerequisite-pass.md and README.md returned 2725, 2482, 2377, 2482 and 2571, hence pass two -105, pass three +105 and total -5.65% (six percent).
R03l the writing rules forbid cutting a condition, limit or warning; the bake-off vetoes a candidate that cuts or weakens one — HOLDS — rewrite/references/writing-rules.md:1-25 contains the prohibition and rewrite/references/bake-off.md:106-120 makes a protected-passage failure one of the first two vetoes.
C44 the 2026-09-10 measurement had no arm that — HOLDS — research/README.md:9-10 and plugins/terse/references/prior-art.md:92-107 say no no-document arm ran; chain-source-prompt.txt:103-132 records the six before-readers individually; the repository-wide follow-up search opened chain/validation.json:20 and chain/return.json:113-133, which report zero live reader experiments and no fresh readers after the rewrite, rather than an after-reader record.
C33 three discordant pairs, all improvements, an — HOLDS — the calculation command reran and printed exact two-sided McNemar p = 0.25 for b=3,c=0; plugins/terse/references/prior-art.md:92-95 and research/README.md:9 give the same three improvements, zero reversals, six-pair context and value.
R03k ranking on wording one judge put both controls above every entry of the three published standards; ranking on verified findings the other did not — HOLDS — the opened prompts run-2x5/o8eHzS6U.prompt.txt:14-24 and v04PR6HL.prompt.txt:34-37 establish the two criteria; parsed answer ranges o8eHzS6U.answer.md:1 and v04PR6HL.answer.md:1 place controls P9/P10 above P1-P4/P7-P8 only for the wording judge.

Duty 1 — unclaimed behavior sentences

None. Every nonempty `new` behavior sentence is covered by at least one of the 24 claims; the empty deletion edits state no new behavior.

Duty 2 — asks and saw scope

All asks retain the sentence's actor, condition and object. G3b's ledger name is stale and mentions purge, but its asks correctly matches the edit's placement sentence; verdicts are based on asks. G3c's asks retains the OS-purge and user-copy scope, but its saw supplies only repeated prose rather than evidence for the OS behavior, producing the sole non-holding verdict.

Duty 3 — enclosing blocks and named-function call sites

I opened the enclosing blocks named in every verdict, not only the edit's narrow sed slices. The cited prose ranges contain script filenames/commands but no function declaration. I nevertheless searched function definitions and call sites across all seven scripts under `plugins/terse/skills/*/scripts/`: 15 function-valued declarations and 90 matching definition/call occurrences were returned. In the McNemar inline program, the only named function value, `C`, is called in the summation in the same command. No multi-call-site contradiction was found.

Duty 4 — guarantee words

The new text contains exactly three listed guarantee-word occurrences, all `every`:

- “Every cut of twenty words or more must carry a reason” — no contrary sentence found. Supporting quote: rewrite/SKILL.md:205-206, “the cut ledger — every removed passage of twenty words or more, with its reason”; audit/references/ledgers.md:118 says the same.
- “every declared behavioural claim its source and evidence” — no contrary sentence found. Supporting quote: rewrite/SKILL.md:44-47, “every statement about behaviour must be true ... writer records the level of evidence”; bake-off.md:67, “Back every behavioural claim with a file and line.”
- “both controls above every entry of the three published standards” — no contrary sentence found. The two parsed ranking answers support the scoped statement.

Files searched by the duty-4 command: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260922-233021-terse-readme/03-review.md`; `plugins/terse/CHANGELOG.md`; `plugins/terse/README.md`; `plugins/terse/references/practices-full.md`; `plugins/terse/references/prior-art.md`; `plugins/terse/skills/audit/SKILL.md`; `plugins/terse/skills/audit/references/ledgers.md`; `plugins/terse/skills/audit/references/measure.md`; `plugins/terse/skills/audit/references/reader-profile.md`; `plugins/terse/skills/audit/references/truth-pass.md`; `plugins/terse/skills/rethink/SKILL.md`; `plugins/terse/skills/rethink/references/stages.md`; `plugins/terse/skills/rewrite/SKILL.md`; `plugins/terse/skills/rewrite/references/bake-off.md`; `plugins/terse/skills/rewrite/references/critic-briefs.md`; `plugins/terse/skills/rewrite/references/curse-of-knowledge.md`; `plugins/terse/skills/rewrite/references/loop.md`; `plugins/terse/skills/rewrite/references/measurements.md`; `plugins/terse/skills/rewrite/references/writing-rules.md`. The search returned 657 matching lines and exited 0.

Commands and observed status

- `git diff --quiet 2f29a8f -- plugins/terse .claude-plugin/marketplace.json`: exit 0.
- All 20 edit check commands were rerun: 20 exited 0; output line counts in edit order were 11, 15, 15, 13, 5, 16, 3, 12, 12, 18, 20, 7, 11, 26, 9, 13, 9, 19, 6, 17.
- `install-probe.sh`: exit 0, 12 lines.
- `rundir-probe.sh`: exit 0, 17 lines.
- `lifetime-probe.sh`: exit 0, 27 lines when run directly (26 lines through command substitution, which strips the final newline).
- scoped function-definition/call-site searches: both exit 0; 15 declarations and 90 matching declaration/call lines.
- after-reader/no-document repository search: exit 0; it reached chain/validation.json:20 and chain/return.json:113-133 among the relevant results.
- guarantee-word extraction from all edits: exit 0, 3 occurrences; contradiction search over the review plus all 18 plugin Markdown files: exit 0, 657 matching lines.

Open/uncertain

None. G3c is not uncertain: it is DOES NOT ANSWER because its level-2 run omits the lifecycle behavior it asserts.
