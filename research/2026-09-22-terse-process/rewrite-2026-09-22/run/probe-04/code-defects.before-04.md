# Code defects — rewrite of plugins/terse/README.md, run 20260922-233021-terse-readme

These are findings the rounds routed to the code, per `rewrite/SKILL.md` step 4 item 6 (:149-155) and
`loop.md:41`. Each is a defect with its check, offered to the owner as a proposal. Nothing here is in the
repository: its `ISSUES.md` takes an entry only on the owner's word (`rewrite/SKILL.md:153-154`). Each
entry is written in that file's register (`ISSUES.md:1-5`: evidence at file:line, an evidence level, and
wording that can become an issue unchanged). On the owner's word each would go there as the next number,
in this file's order: at `1af4160`, whose last entry is E14, D1 as E15 and D2–D6 (round 03) as E16–E20.

## D1. `rewrite` keeps its candidate outside the repository, and no page says where the candidate stands when it is re-audited, whose readers open only the repository's `.md` files

**Evidence, level 2.** `plugins/terse/skills/audit/references/measure.md:35-37` (the reader's rights):
a reader opens "the `.md` files in the repository", starts "at the entry file" and follows "links it
finds in the text". `:49` (the reader's brief): "You may open only .md files in <REPO>". `:106-109`
("Re-measuring after a rewrite"): "Same questions, same key, same entry file, same model."
`plugins/terse/skills/rewrite/SKILL.md:66-67` writes every round into "a run directory of the document's
own, outside the repository that holds it", and `:190-192` hands the round over with its diff and
applies it to the user's files only on their word. `plugins/terse/skills/rewrite/references/bake-off.md:138-139`
breaks a tie "by re-auditing each surviving candidate". A candidate in the run directory is neither the
entry file nor one of the repository's `.md` files, and no page of the three skills says where it stands
for that re-audit, or for the one the README's pipeline ends with (`plugins/terse/README.md:10-12`,
"candidate + diff → /terse:audit again").

This was found on 2026-09-22 by the adversarial whole-document read (Codex Astra, F4, plausible:
`research/2026-09-22-terse-process/rewrite-2026-09-22/l3-adversarial-findings.md:91-124`). That read
also ran the link failure: a copy of the README outside the repository resolves `references/prior-art.md`
to nothing. It was found again on 2026-09-23 by the verifier of round 02 (Codex Sol, R02f1 does not
answer), which refused a README sentence that filled the gap with advice no page gives.

**Check.** From any directory:

    sed -n '35,37p;49p;106,109p' ~/Git/agent-skills/plugins/terse/skills/audit/references/measure.md; sed -n '66,67p;190,192p' ~/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; sed -n '138,139p' ~/Git/agent-skills/plugins/terse/skills/rewrite/references/bake-off.md; echo "pages saying where a candidate stands for its re-audit: $(grep -rl -i -E 'temporary candidate|copy of (the|its) (markdown )?tree|relative (link|location)|links? (still )?resolve' ~/Git/agent-skills/plugins/terse/skills | wc -l | tr -d ' ')"

It prints the lines quoted above and ends `pages saying where a candidate stands for its re-audit: 0`
(run on 2026-09-23 at `f677303`, exit 0; the output is kept at `probe-02/d1-check.out`). The regex this
output must match:

    the `\.md` files in the repository[\s\S]*starting at the entry file[\s\S]*You may open only \.md files in <REPO>\.[\s\S]*Same questions, same key, same entry file, same model\.[\s\S]*outside the repository that holds it[\s\S]*re-auditing each surviving candidate[\s\S]*re-audit: 0

**Issue text.** `rewrite` keeps every candidate outside the user's repository and applies it only on
their word. `audit` re-measures with the same entry file and lets its readers open only the repository's
`.md` files. Between the two, no page says how a candidate is re-audited before it is applied: where it
must stand, and what keeps its relative links pointing where the original's did. The README's pipeline
ends with that re-audit, and `bake-off.md` calls for one to break a tie. A user who re-audits the
candidate where `rewrite` leaves it gives the readers a file outside the repository, with relative links
that resolve against the run directory. The pages should say where a candidate stands for its re-audit
(for example, at the original's path in a copy of the repository's Markdown tree), and `rewrite`'s
hand-over should say so next to the diff.

## D2. A retired phrase is matched case-sensitively, because `ledger.mjs` reads a `flags` field that no script writes

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/ledger.mjs:3-4` documents an optional
`"flags": "i"` per entry, and `:19` builds each pattern as `new RegExp(pattern, flags ?? "")`. The two
scripts that write ledger entries never set it: `round.mjs:118` writes a retirement as
`{ name: c.name, pattern: c.pattern, want: false }`, and `ledger-seed.mjs:61-62` writes
`{ name, pattern, want, level, how }`. Every retired phrase in a ledger those scripts built is therefore
matched with its case as written, and the same wording brought back with a capital letter — at the start
of a sentence, in a table cell — passes the ratchet. `plugins/terse/skills/rewrite/references/measurements.md:44-46`
(M8) records that miss once already: a retired phrase "survived in a table cell with a capital letter;
the ledger's pattern did not match". Found by the round-02 wave's lens 1 (Claude Opus, F4), re-run by
lens 6 and by the coordinator, and re-run for this entry on 2026-09-23 on planted rounds under
`probe-03/d2/`.

**Check.** From any directory:

    sh $TMPDIR/terse/runs/20260922-233021-terse-readme/probe-03/d-probes.sh

A ledger with one pinned phrase and one retired phrase (`nothing else is needed`, `want: false`) over two
rounds that carry the pin, then a third that revives the retired phrase: with a capital, `ledger.mjs`
exits 0 and the retired row reads `- - -`; in lower case it exits 1 and the row reads `YES`; neither
`round.mjs` nor `ledger-seed.mjs` contains `flags`. The output (exit 0, kept at `probe-03/d-probes.log`)
must match:

    D2 retired phrase with a capital: ledger\.mjs exit 0; retired row: retired L\? - - -\s*\nD2 retired phrase in lower case: ledger\.mjs exit 1; retired row: retired L\? - - YES[\s\S]*D2 scripts that write a flags field: 0 of 2

**Issue text.** `ledger.mjs` supports a `flags` field on a ledger entry, but neither `round.mjs` nor
`ledger-seed.mjs` writes one, so every retired phrase is matched case-sensitively. A round that brings a
retired wording back with a capital letter — the first word of a sentence, a table cell — passes the
ratchet with exit 0, the miss M8 already records. Retirements should be matched without regard to case
(`round.mjs` and `ledger-seed.mjs` writing `flags: "i"` on `want: false` entries, or `ledger.mjs`
defaulting them to it), and `selftest.mjs` should plant a capitalised revival.

## D3. An audit whose claim ledger is honestly empty cannot be seeded, so its document has no audit route into `rewrite`

**Evidence, level 3.** `plugins/terse/skills/audit/scripts/ledger-seed.mjs:41-42` refuses a `## Claim
ledger` with no `### C..` entries: "no ### C.. entries under ## Claim ledger; the block is the machine
half of entries a reader reads, not a replacement for them", exit 1, and no ledger is written.
`plugins/terse/skills/audit/references/truth-pass.md:61-71` keeps out of the ledger the argument for an
instruction, voice, tone and ordering, illustrative examples and recipes for tools the repository does
not ship, and `plugins/terse/skills/audit/SKILL.md:26-27` audits text with no code behind it; a document
made only of such sentences has a claim ledger with no entries, truthfully. `plugins/terse/skills/rewrite/SKILL.md:103-106`
seeds `ledger.json` from the audit on the audit route and starts it empty only on the skeleton route, and
`audit/SKILL.md:158-162` requires the seed command. Found by the round-02 wave's adversarial read (Codex
Astra, C3 F2, CONFIRMED), re-run by lens 6, and re-run for this entry on 2026-09-23 on a planted run
file under `probe-03/d3/`.

**Check.** The same command as D2. Its D3 lines (kept at `probe-03/d-probes.log`) must match:

    D3 empty claim ledger: ledger-seed\.mjs exit 1: <probe>/d3/audit\.md: no ### C\.\. entries under ## Claim ledger[\s\S]*D3 ledger\.json written: no

**Issue text.** An audit whose truth pass finds no sentence that states a behaviour — a document made only
of what `truth-pass.md` keeps out of the ledger, which the plugin's stated scope invites — cannot be handed
to `rewrite`. `ledger-seed.mjs` refuses a Claim ledger with no entries and writes nothing; `rewrite` seeds
its ledger from the audit on that route and starts empty only from a skeleton. Either the seed should
accept a ledger that is empty and says so, writing `[]`, or `rewrite`'s audit route should say how to
start without a seed.

## D4. `rule1.mjs` does not report a bare environment-variable name or the braced `${VAR:-default}` form

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/rule1.mjs:28`, the environment-variable
pattern, is `/\$[A-Z_]{2,}|(?<![\w$])[A-Z][A-Z0-9]*_[A-Z0-9_]+(?![\w])/g`: it matches `$TMPDIR` and a
name with an underscore, such as `CLAUDE_PLUGIN_DATA`, and neither a bare name without one (`PATH`) nor
the braced form `${TMPDIR:-/tmp}`, where `$` is followed by `{` and `TMPDIR` has no underscore.
`plugins/terse/skills/rewrite/scripts/selftest.mjs:11-13` plants only a flag and a tilde path. So a
section before the technical cut that names `PATH` or `${TMPDIR:-/tmp}` passes rule 1: round 02's clean
verdict on this README rested on the section's move below the cut, not on the check. Found by the
round-02 wave's lens 2 (Claude Opus, R6), re-run by lens 6, and re-run for this entry on 2026-09-23 on
a planted file under `probe-03/d4/`.

**Check.** The same command as D2. Four lines before a `## How it works` cut — `PATH`, `${TMPDIR:-/tmp}/terse`,
`$TMPDIR/terse`, `--keep-data` — and only lines 3 and 4 are reported. The D4 line must match:

    D4 rule1 on planted lines 1-4: exit 1; reported: ! line 3 env var \$TMPDIR;! line 4 flag name --keep-data;\s*$

**Issue text.** Rule 1 keeps environment variables out of the sections a reader meets first, and
`rule1.mjs` checks it with a pattern that needs either `$NAME` or an underscore in the name. A bare
`PATH`, `HOME` or `EDITOR` and the braced `${TMPDIR:-/tmp}` pass unreported, and the self-test plants
neither, so a clean result on those forms is not evidence. The pattern should cover `${…}` and a
backticked bare upper-case name, and `selftest.mjs` should plant both.

## D5. A checkout loaded with `claude --plugin-dir` puts its runs in a data directory the pages do not name, and `claude plugin uninstall` cannot remove it

**Evidence, level 3.** `plugins/terse/skills/audit/SKILL.md:36-38`: "`D` is empty when this skill runs
from a source checkout rather than an installed plugin, which is why the fallback is there: installed,
Claude Code writes the plugin's data directory into that line before it runs." The lifetime sentences,
`audit/SKILL.md:39-42` and `plugins/terse/skills/rewrite/SKILL.md:74-77`, name two places a run can be:
under the plugin's data directory, deleted by `claude plugin uninstall` unless `--keep-data`, or in the
temporary directory, which the operating system may purge. A checkout loaded with `claude --plugin-dir
plugins/terse` is neither: Claude Code 2.1.280 loads it as `terse@inline` and writes
`<configuration>/plugins/data/terse-inline` into the line, and creates that directory; the run lands
there, not in the temporary directory; and `claude plugin uninstall terse@inline` exits 1, "This plugin
is loaded via --plugin-dir for this session with no marketplace backing — it cannot be uninstalled", so a
run placed there survives it. Found by the round-02 wave's lens 1 (Claude Opus, F8, level 3), and re-run
for this entry on 2026-09-23 in a Claude configuration isolated under `probe-03/`, not signed in: the
invocation exits 1 "Not logged in" before any model is reached, and the page as Claude Code handed it
over is read from the session record.

**Check.** From any directory:

    sh $TMPDIR/terse/runs/20260922-233021-terse-readme/probe-03/plugindir-probe.sh; sed -n '36,42p' ~/Git/agent-skills/plugins/terse/skills/audit/SKILL.md; sed -n '74,77p' ~/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md

It prints (exit 0; kept at `probe-03/plugindir-probe.log`) the lines this regex matches:

    "source":"terse@inline"[\s\S]*the page's line as received begins D="<probe>/config-pdir/plugins/data/terse-inline";[\s\S]*data directory terse-inline: exists; temporary directory runs: absent[\s\S]*claude plugin uninstall terse@inline -> exit 1: [^\n]*it cannot be uninstalled[\s\S]*stub run after that uninstall: present[\s\S]*`D` is empty when this skill runs\s+from a source checkout[\s\S]*deleted by `claude plugin uninstall`\s+unless `--keep-data` is passed

**Issue text.** `audit` and `rewrite` tell the agent where a run lives and how long it lasts in two cases:
an installed plugin, whose data directory `claude plugin uninstall` deletes unless `--keep-data`, and a
source checkout, whose data directory is empty so the run falls back to the temporary directory. A
checkout loaded with `claude --plugin-dir` is a third case the pages call the second: Claude Code writes
`plugins/data/terse-inline` under its configuration directory into the run line, the run lands there,
and `claude plugin uninstall` refuses that plugin, so the run outlives the session and no command the
pages name removes it. The pages should state the rule by what the line does — the data directory when
Claude Code supplies one, the temporary directory otherwise — and say that a `--plugin-dir` run is the
user's to remove.

## D6. `audit`'s task readers are told to act and have their state checked, and nothing tells them where that state lives

**Evidence, level 2.** `plugins/terse/skills/audit/SKILL.md:107-116` (Step 5b) sends two readers with "a
starting state and an outcome they want, acting from the documentation alone", and says "Check the state
they produce, not what they say"; the step names no place for that state and no isolated configuration
for a host application's commands, and the page's own dated case at `:112-113` is a recipe that
"reverted a reader's tree". `rewrite`'s brief for the same kind of reader has both:
`plugins/terse/skills/rewrite/references/critic-briefs.md:141-142`, "Starting state: <STATE — create it
under $TMPDIR; for a host-application task, an isolated configuration under $TMPDIR>", and `:147`,
"Write nothing outside $TMPDIR." A task reader of a document that installs or configures something acts
on the machine it runs on unless its brief says otherwise. Found by the round-02 wave's lens 1 (Claude
Opus, note b, level 2; "not a finding" against the README).

**Check.** From any directory:

    sed -n '107,116p' ~/Git/agent-skills/plugins/terse/skills/audit/SKILL.md | grep -c -E 'TMPDIR|isolated|CONFIG_DIR'; sed -n '141,142p;147p' ~/Git/agent-skills/plugins/terse/skills/rewrite/references/critic-briefs.md

It prints `0` (the grep exits 1: step 5b names neither) and then the three lines of the lens-4 brief
quoted above (run on 2026-09-23 at `1af4160`, whose plugin tree is `2f29a8f`'s). The regex this output must match:

    ^0\n[\s\S]*create it\s+under \$TMPDIR; for a host-application task, an isolated[\s\S]*Write nothing outside \$TMPDIR\.

**Issue text.** `audit`'s step 5b sends two task readers to act from the documentation and checks the
state they produce, but does not say where that state lives: no `$TMPDIR`, no isolated host configuration.
`rewrite`'s lens-4 brief, the same kind of reader, requires both. A task reader of a document that
installs a plugin, edits a configuration or runs a recipe that resets a tree acts on the user's real
machine. Step 5b should carry lens 4's isolation: the starting state under `$TMPDIR`, a host application's
commands in an isolated configuration there, and nothing written outside it.
