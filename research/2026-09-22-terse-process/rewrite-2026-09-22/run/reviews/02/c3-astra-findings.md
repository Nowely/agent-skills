# Codex Astra lens 3: done, 3 findings

Document: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260922-233021-terse-readme/02-grafts.md` (114 lines).
Original compared: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260922-233021-terse-readme/00-original.md` (90 lines).
Code: `/Users/ruliny/Git/agent-skills`; branch `terse-process-2026-09-22`; HEAD `f677303f365d2b2f480879ab78d260168a100bac`.
The HEAD plugin tree and `2f29a8f:plugins/terse` both resolve to `dd4a149fcc7c14606dd97f8ce7a89d1d947f7b2d`.

All artifact paths below are under `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky`. Repository paths are relative to `/Users/ruliny/Git/agent-skills`. No repository changes were made. The final recorded `git status --short` has zero lines. Host commands used `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/run.py`, which sets `CLAUDE_CONFIG_DIR` and `XDG_CACHE_HOME` under this temporary directory and runs from it. No paid model turn or agent fan-out was launched.

## F1 — CONFIRMED — Install supplies no operational route to the revision it describes

Document lines 53–69, especially commands at 59–64 and the boundary at 66–69.

The only installation recipe installs the revision whose rewrite instructions put run artifacts in the document repository. The caveat acknowledges this, but the page never tells the reader how to load the reviewed revision instead. The reader must either accept the old write behavior or invent a source-loading procedure. Both revisions call themselves 0.1.1, so the installed version number does not resolve the choice. This is an incomplete action path, not a claim that the caveat is absent or false.

Reproducible check, performed on 2026-09-23:

```sh
P='/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky'
python3 "$P/run.py" published-marketplace-add claude plugin marketplace add Nowely/agent-skills
python3 "$P/run.py" published-install claude plugin install terse@nowely
```

Both commands started and exited 0. Exact relevant output:

```text
SSH not configured, cloning via HTTPS: https://github.com/Nowely/agent-skills.git
✔ Successfully added marketplace: nowely (declared in user settings)
✔ Successfully installed plugin: terse@nowely (scope: user)
```

`installed_plugins.json` recorded `gitCommitSha: 8c041b76d7f30196441285d77985b81ae9c9e59f`, version `0.1.1`. `git -C "$P/claude-config/plugins/marketplaces/nowely" rev-parse HEAD` returned the same hash. The fetched source is **https://github.com/Nowely/agent-skills.git**; no other external source was fetched.

The fetched `plugins/terse/skills/rewrite/SKILL.md:66–67` says:

```text
Work in a run directory of the document's own — `research/<date>-<slug>/` at the root of the
repository that holds the document; `audit` writes its run file elsewhere, and you copy `audit.md` in.
```

By contrast the reviewed `plugins/terse/skills/rewrite/SKILL.md:66–79` locates the run outside the repository and requires the user's word for repository writes. `claude --help` in the isolated configuration exposes `--plugin-dir <path>` as a session loader, but the entire reviewed README, lines 1–114, gives no source-loading command. This is evidence of the missing route, not a proposed README rewrite.

Logs: `published-marketplace-add.json`, `published-install.json`, `cli-help.json`, `verified-facts.json`. The fetched marketplace source remains under `claude-config/plugins/marketplaces/nowely/` after the uninstall probes. Actual model compliance with either instruction set is unknown; this probe verifies the installed instructions and revision.

## F2 — CONFIRMED — The broad scope omits a mandatory failure for an audit with zero eligible claims

Document lines 5–7 and 9–15 invite auditing nonsoftware Markdown and handing its audit to rewrite; lines 29–30 explicitly exclude voice, illustrative examples and other categories from the ledger.

A document can consist entirely of those excluded categories. Its honest claim ledger is empty. The required seed command refuses that state, so the documented audit-to-rewrite path cannot complete its prescribed seeding step without an exception or an invented claim. The README's “intended scope” does not disclose this boundary. This finding is limited to the mandatory script step; it does not claim that an agent cannot improvise a workaround.

Source checks:

- `plugins/terse/skills/audit/references/truth-pass.md:61–71` excludes arguments for instructions, voice/tone/ordering, illustrative examples and recipes for unshipped tools.
- `plugins/terse/skills/audit/SKILL.md:153–165` requires the JSON claim block and seed command, then reporting its printed count.
- `plugins/terse/skills/audit/scripts/ledger-seed.mjs:38–42` accepts an array but refuses a Claim ledger with no `### C..` entries, including `[]`.
- `plugins/terse/skills/rewrite/SKILL.md:103–106` requires seeding on the audit route. The empty-ledger alternative is specified for the skeleton route only.

Fixture: `zero-claim-document.md` contains formatting instructions and an illustrative note. `empty-audit.md` includes all eight section headings of the run-file contract and an empty `json claims` array under Claim ledger. It makes no claim to have run model readers; it isolates the seed step.

Reproduce:

```sh
P='/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky'
python3 "$P/run.py" zero-claims-probe node '/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/scripts/ledger-seed.mjs' "$P/empty-audit.md" "$P/seed-output.json"
```

Started: yes. Exit: 1. Exact diagnostic:

```text
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/empty-audit.md: no ### C.. entries under ## Claim ledger; the block is the machine half of entries a reader reads, not a replacement for them
```

Output ledger exists: `False`, checked after the command. Log: `zero-claims-probe.json`. The full audit's behavior after this refusal is unknown; no paid end-to-end run was performed.

## F3 — CONFIRMED — The two judge results conceal a change in the question being judged

Document lines 104–108, especially “One judge put both controls above both entries for the two published standards; the other did not.”

The ranking difference is reported without the crucial experimental condition: these judges were instructed to rank on different axes. One checked factual accuracy and defect coverage; the other was explicitly told to judge wording, redundancy and relevance rather than factual accuracy. Readers cannot interpret their difference as a replication or a disagreement about the same outcome. The sentence's ordering facts are not refuted; the omitted criterion makes their comparison under-specified.

Reproducible file-and-line checks:

```sh
nl -ba '/Users/ruliny/Git/agent-skills/research/2026-09-10-chain/run-2x5/o8eHzS6U.prompt.txt'
nl -ba '/Users/ruliny/Git/agent-skills/research/2026-09-10-chain/run-2x5/v04PR6HL.prompt.txt'
```

`o8eHzS6U.prompt.txt:20–27` states:

```text
So: wording, redundancy, and relevance. Not factual accuracy. A separate judge already ranked these ten on
whether their findings were true, and this seat exists because that was the wrong question. Accuracy enters
here in one way only, as a floor...
```

`v04PR6HL.prompt.txt:32–45` instead orders verification of at least twelve findings against the repository, comparison of defect convergence, resolution of factual contradictions and evaluation of coverage. These are two different grading instructions.

The result fields in `o8eHzS6U.answer.md:3` and `v04PR6HL.answer.md:3` preserve the respective rankings: J2 puts P9/P10 at 2/3 and J1 puts P10/P9 at 3/7. The artifact records establish different criteria; the README's omission is visible at lines 104–108. Neither a new reader study nor an inference about hidden model reasoning is needed for this check.

## B — Contradictions within the document

No strict pair of sentences that cannot both be true was established. In particular, lines 66–69 explicitly restrict the outside-repository write boundary at 73–78 to the checkout, so the installed-revision problem is F1's incomplete action path, not an internal contradiction. F3 is an omitted experimental condition, not a false statement of the recorded ranks.

## D — Two weakest sections

1. **Install** (51–69): its commands install the revision its own caveat warns about, and it supplies no way to run the reviewed revision. Check: F1's actual install and the two rewrite instruction locations.
2. **What was measured** (94–110): it omits the change in judging criteria, and a first-time reader has no direct source pointer for resolving the omission. Check: F3's two prompt files; a Markdown-link extraction over all 114 README lines yields **0 links** (`verified-facts.json`). The absence of a source pointer is an evidence-navigation gap, not a new claim that the stated counts are false.

## E — What a new reader still cannot answer

- **How do I actually run the reviewed revision with the described write boundary?** CONFIRMED missing action path; check F1, README 53–69 versus the observed installed revision.
- **Can I complete an audit when the text has no claims eligible for its ledger?** CONFIRMED undisclosed refusal; check F2, README 5–7 and 29–30 versus the mandatory seed's exit 1.
- **What question did each judge answer, and where do I inspect that evidence?** CONFIRMED missing explanation/navigation; check F3, README 104–108, the two archived prompt files and the zero-link count.

D and E refer to the three findings above; they do not add to the finding count.

## Commands, counts and limits

Fourteen top-level subprocess invocations have complete command/output/exit records in `command-log.json`: **9 Claude CLI commands**, **4 direct Node script commands** and **1 Python facts command**; 11 exited 0 and 3 exited 1. Counts do not include read-only inspection commands or the self-test's internal child processes.

- `claude --version`: 2.1.280, exit 0.
- `claude --help`, `claude plugin marketplace add --help`, `claude plugin uninstall --help`: 3 help calls, all exit 0.
- Marketplace add and plugin install: 2 calls, both exit 0; observed revision `8c041b7` from the GitHub source cited in F1.
- `node plugins/terse/skills/rewrite/scripts/selftest.mjs`: exit 0; **45 `ok` lines, 0 `MISS` lines**, counted from the output obtained in this turn. Summary: `all checks caught their planted violation`. Its expected planted refusals are retained in `selftest.json` stderr. This is not evidence of general model compliance.
- Three direct seed probes: 3 exit-1 refusals. Two observed the empty-claim rejection. One intervening invocation encountered the logger filename collision described below; it is not evidence for F2.
- `claude plugin uninstall terse@nowely --keep-data`, reinstall, ordinary uninstall: 3 commands, all exit 0. A temporary sentinel at `claude-config/plugins/data/terse-nowely/runs/probe/sentinel.md` existed before uninstall, remained after `--keep-data`, and was absent after ordinary uninstall. No uninstall defect is counted.
- `wc -w` on 5 archived chain files returned **2725, 2482, 2377, 2482, 2571** (12637 total); the facts command independently obtained those 5 counts by whitespace splitting. Exact two-sided McNemar for three discordant pairs all in one direction computed **0.25**.
- Parsed J2's archived answer: **10** README comparison rows; **5** no proposal, **1** punctuation operation, **3** longer, **1** shorter. This checks the README against the archived judge's report; it is not a rerun of the original experiment.
- Read/search scope included the 3 skill pages, their 11 reference pages, 7 scripts, 3 named manifests, and relevant research records. No repository test suite was claimed beyond the actually executed 45-check self-test.

Command failures/refusals, one line each with exact diagnostic:

- Command: `node /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/scripts/ledger-seed.mjs /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/empty-audit.md /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/empty-ledger.json`; started: true; exit: 1; exact diagnostic: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/empty-ledger.json exists; the seed is written once, then the rounds grow it`.

- Command: `node /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/scripts/ledger-seed.mjs /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/empty-audit.md /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/empty-ledger.json`; started: true; exit: 1; exact diagnostic: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/empty-audit.md: no ### C.. entries under ## Claim ledger; the block is the machine half of entries a reader reads, not a replacement for them`.

- Command: `node /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/scripts/ledger-seed.mjs /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/empty-audit.md /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/seed-output.json`; started: true; exit: 1; exact diagnostic: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-astra-lens3-et48Ky/empty-audit.md: no ### C.. entries under ## Claim ledger; the block is the machine half of entries a reader reads, not a replacement for them`.

The intervening `empty-ledger-full-contract` refusal was a harness naming mistake: the first invocation's **log** was named `empty-ledger.json`, also used as that probe's requested output. The seed correctly refused to overwrite it. F2 uses the subsequent fresh destination `seed-output.json`; its command and diagnostic are recorded separately. No file was deleted to evade that refusal.

Unknown: paid audit/rethink/rewrite behavior; whether a host agent recovers from the zero-claim refusal; runtime enforcement of the prose vetoes and approval pauses; compatibility with Claude Code versions other than 2.1.280; independent original chain-reader outcomes (individual records were not in the supplied archive). Reproducing the bake-off and reader measurements was outside this no-paid-run inspection. The first two unknowns qualify the scope of F1/F2; they do not replace the observed command results.
