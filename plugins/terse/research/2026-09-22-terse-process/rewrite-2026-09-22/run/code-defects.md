# Code defects — rewrite of plugins/terse/README.md, run 20260922-233021-terse-readme

These are findings the rounds routed to the code, per `rewrite/SKILL.md` step 4 item 6 (:149-155) and
`loop.md:41`. Each is a defect with its check, offered to the owner as a proposal. Nothing here is in the
repository: its `ISSUES.md` takes an entry only on the owner's word (`rewrite/SKILL.md:153-154`). Each
entry is written in that file's register (`ISSUES.md:1-5`: evidence at file:line, an evidence level, and
wording that can become an issue unchanged). On the owner's word each would go there as the next number,
in this file's order: at `1af4160`, whose last entry is E14, D1 as E15, D2–D6 (round 03) as E16–E20, and D7–D13 (round 04) as E21–E27.

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

    sed -n '35,37p;49p;106,109p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md; sed -n '66,67p;190,192p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; sed -n '138,139p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/bake-off.md; echo "pages saying where a candidate stands for its re-audit: $(grep -rl -i -E 'temporary candidate|copy of (the|its) (markdown )?tree|relative (link|location)|links? (still )?resolve' /Users/ruliny/Git/agent-skills/plugins/terse/skills | wc -l | tr -d ' ')"

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

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03/d-probes.sh

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

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03/plugindir-probe.sh; sed -n '36,42p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md; sed -n '74,77p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md

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

    sed -n '107,116p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md | grep -c -E 'TMPDIR|isolated|CONFIG_DIR'; sed -n '141,142p;147p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/critic-briefs.md

It prints `0` (the grep exits 1: step 5b names neither) and then the three lines of the lens-4 brief
quoted above (run on 2026-09-23 at `1af4160`, whose plugin tree is `2f29a8f`'s). The regex this output must match:

    ^0\n[\s\S]*create it\s+under \$TMPDIR; for a host-application task, an isolated[\s\S]*Write nothing outside \$TMPDIR\.

**Issue text.** `audit`'s step 5b sends two task readers to act from the documentation and checks the
state they produce, but does not say where that state lives: no `$TMPDIR`, no isolated host configuration.
`rewrite`'s lens-4 brief, the same kind of reader, requires both. A task reader of a document that
installs a plugin, edits a configuration or runs a recipe that resets a tree acts on the user's real
machine. Step 5b should carry lens 4's isolation: the starting state under `$TMPDIR`, a host application's
commands in an isolated configuration there, and nothing written outside it.

## D7. The pages give a run's lifetime as "deleted by `claude plugin uninstall` unless `--keep-data`", and it is not: removing one of two installations keeps the runs, and `claude plugin marketplace remove` deletes them with no `--keep-data`

**Evidence, level 3.** `plugins/terse/skills/audit/SKILL.md:39-42` and `plugins/terse/skills/rewrite/SKILL.md:74-77`
state a run's lifetime in one clause each: under the plugin's data directory a run "survives plugin updates
and is deleted by `claude plugin uninstall` unless `--keep-data` is passed". Neither page names a scope, the
last installation, or `claude plugin marketplace remove` (the grep below over the two pages: 0). Claude Code
2.1.280, in Claude configurations isolated under the run directory and not signed in, with the plugin
installed from this checkout's marketplace and a run planted in `plugins/data/terse-nowely/runs/` beside a
decoy directory: `uninstall` deletes the data directory and the run (case A); `uninstall --keep-data` keeps
both (B); with the plugin installed at user and at project scope, uninstalling the user installation keeps
both, and uninstalling the last one deletes them (C); `claude plugin marketplace remove nowely` exits 0,
deletes both, and leaves no plugin installed, and its `--help` offers no option but `--scope` (D). The decoy
survives every case. Found by the round-02 wave's lens 1 (Claude Opus, F9 and F10, level 3,
`reviews/02/lens1-opus.md:67-79`; F10 re-run by the coordinator), recorded in round 03 as
`probe-03/lifetime-probe.sh` with its log (claim G3a), raised again by the round-03 wave's lens 1 (P2,
`reviews/03/lens1-opus.md:228-231`), and re-run for this entry on 2026-09-23 as `probe-04/lifetime-probe.sh`:
the same script with its probe directory under `probe-04/` and the sign-in gate of `probe-03/install-probe.sh`
added, whose log is byte-identical to round 03's (`diff` exit 0). The README already states the rule the pages
lack (`04-terms.md:93-94`, G3a).

**Check.** From any directory:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/lifetime-probe.sh; sed -n '39,42p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md; sed -n '74,77p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; echo "page lines naming marketplace remove, a scope or the last installation: $(cat /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md | grep -c -E 'marketplace remove|last (installation|scope)|--scope')"

It prints (run on 2026-09-23 at `b7a17da`, whose plugin tree is `2f29a8f`'s, exit 0; kept at
`probe-04/d7-check.out`, the probe's own log at `probe-04/lifetime-probe.log`) the lines this regex matches:

    A state after uninstall: terse-nowely absent, run marker absent[\s\S]*B state after uninstall --keep-data: terse-nowely present, run marker present[\s\S]*C state after uninstall of the user installation, the project one left: terse-nowely present, run marker present[\s\S]*C state after uninstall of the last installation: terse-nowely absent, run marker absent[\s\S]*D \$ claude plugin marketplace remove nowely -> exit 0\nD state after marketplace remove: terse-nowely absent, run marker absent[\s\S]*marketplace remove options: --help --scope\s*\n[\s\S]*deleted by `claude plugin uninstall` unless `--keep-data` is passed[\s\S]*deleted by `claude plugin uninstall`\s+unless `--keep-data` is passed[\s\S]*page lines naming marketplace remove, a scope or the last installation: 0\s*$

**Issue text.** `audit` and `rewrite` tell the agent that a run under the plugin's data directory is deleted
by `claude plugin uninstall` unless `--keep-data` is passed, and the agent passes that on as the run's
lifetime. Measured on Claude Code 2.1.280, it is wrong in two directions. With the plugin installed at two
scopes, uninstalling one keeps the data directory and its runs; they go only when the last installation is
removed. And `claude plugin marketplace remove` deletes them as well, with no `--keep-data` to stop it. A
user who removes the marketplace to tidy up loses every run without being warned, and a user who reads
"uninstall deletes it" while a second installation remains expects a deletion that does not happen. Both
pages should say that the runs are deleted when the plugin's last installation is removed, by
`claude plugin uninstall` without `--keep-data` or by `claude plugin marketplace remove`, which has no such
option.

## D8. The bake-off vetoes any weakened warning, the accuracy floor and the rule on guarantee words require a false one to be corrected or weakened, and no page says which wins

**Evidence, level 2.** `plugins/terse/skills/rewrite/references/bake-off.md:114`, one of the sheet's two veto
rows ("a candidate that fails either is out", `:108-109`), asks "was a condition, limit or warning at a
decision point cut or weakened?", with no exception for one that is false. The same file's writer brief
says "Correct what the current file gets wrong rather than carrying it forward" (`:60-62`; the accuracy
floor of `plugins/terse/skills/rewrite/SKILL.md:44-47`), and `plugins/terse/skills/audit/references/truth-pass.md:23-25`
leaves a guarantee-shaped claim two options only: "reach level 3 or be weakened to what levels 1 and 2
support. There is no third option". A warning that is false at a decision point falls under both: to
correct it is to cut or weaken it, which fails the veto row. The only sentence on precedence,
`rewrite/SKILL.md:212-215`, puts the safeguards of `writing-rules.md` — "Never cut a condition, a limit or a
warning where a reader decides" (`plugins/terse/skills/rewrite/references/writing-rules.md:21`) — above "the
rest of the rules wherever they collide", without saying whether the accuracy floor or the rule on guarantee
words is among them; read literally, it keeps the false warning. No line of the three skills speaks of a
false or refuted condition, limit or warning (the search below: 0). The round-01 judges already resolved it
both ways: one read the veto as permitting the correction of a false claim
(`research/2026-09-22-terse-process/rewrite-2026-09-22/j2-astra-sheets.md:66, 184, 302`), another applied
`rewrite/SKILL.md:212-213`'s override against the audit's "stays at level 2 or is cut" and vetoed a candidate
on it (`j3-fable-sheets.md:303-314`, the same directory). The README carried the conflict as a permission no page grants, "A
writer may reword one or correct it when it is false" (`03-review.md:101-102`, cut in round 04). Found by
the round-02 wave's lens 1 (Claude Opus, note c, `reviews/02/lens1-opus.md:140`) and not recorded then, and
again by the round-03 wave's lens 1 (P4, `reviews/03/lens1-opus.md:236-238`) and lens 2 (P2,
`reviews/03/lens2-opus.md:222-225`).

**Check.** From any directory:

    sed -n '60,62p;108,109p;114p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/bake-off.md; sed -n '23,25p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/truth-pass.md; sed -n '21p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/writing-rules.md; sed -n '44,47p;212,215p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; echo "page lines on a false or refuted condition, limit or warning: $(grep -rh -i -E '(false|refuted|wrong) (condition|limit|warning)|(condition|limit|warning)[^.]{0,40}(is|are|was) (false|refuted|wrong)' /Users/ruliny/Git/agent-skills/plugins/terse/skills | wc -l | tr -d ' ')"

It prints (run on 2026-09-23 at `b7a17da`, whose plugin tree is `2f29a8f`'s, exit 0; kept at
`probe-04/d8-check.out`) the lines this regex matches:

    Correct what the current file gets wrong rather than\s+carrying it forward[\s\S]*The first two rows are vetoes: a candidate that fails either is out[\s\S]*\| protected passages \| was a condition, limit or warning at a decision point cut or weakened\?[\s\S]*\| veto \|[\s\S]*must reach level 3 or be\s+weakened to what levels 1 and 2 support\. There is no third option[\s\S]*Never cut a condition, a limit or a warning where a reader decides\.[\s\S]*The accuracy floor\*\*: every statement about behaviour must be true of the code in this checkout[\s\S]*override the\s+rest of the rules wherever they collide: never cut a condition, a limit or a warning where a reader\s+decides[\s\S]*page lines on a false or refuted condition, limit or warning: 0\s*$

**Issue text.** The bake-off's judging sheet vetoes any candidate that cuts or weakens a condition, limit or
warning at a decision point, and nothing excepts one that is false. The writer brief beside it tells the
writer to correct what the current file gets wrong, and the truth pass leaves a guarantee-shaped claim
that cannot reach level 3 no option but to be weakened. A false warning at a decision point is caught
between them: correcting it fails a veto row, keeping it fails the accuracy floor. The one precedence
sentence, in `rewrite`'s step 6, ranks the writing rules' safeguards above "the rest of the rules" without
saying whether the accuracy floor is one of them, and the judges of one bake-off have already read it both
ways. The veto row should except a warning the claim ledger holds as refuted, and say that correcting it to
what the evidence supports is not weakening it; or the precedence sentence should name the accuracy floor as
the rule the safeguards do not override.

## D9. A pinned claim's evidence is run once, when its round is written, and never again: a citation that stops resolving is reported by no script

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/round.mjs` executes every edit's `check.run`
before the round is written, refuses the round when an `expect` finds nothing, and keeps `run`, `expect`
and `saw` in the ledger entry (its header, and the check loop). `plugins/terse/skills/rewrite/scripts/ledger.mjs:18-22`
reads only `pattern` and `want` of every entry against the round files and never executes `run`. So an
entry whose `run` cites a file by line — the form `rewrite/SKILL.md` step 4 item 2 recommends for levels
1 and 2, `sed -n 'A,Bp' <file>` — keeps passing the ratchet after the cited file changes under it. In this
run, R02e (round 02) cited `ISSUES.md:183-188` for entry E13; commit `1af4160` (E14 added above it) moved
those lines and `b7a17da` moved them again. R02e's `run` executed on 2026-09-23 prints nothing E13 says
and its `expect` does not match, while `ledger.mjs` over the ledger that holds that entry exits 0 with
"0 failure(s)". Found by the coordinator by re-running every pinned entry's `run` (40 of 41 matched);
C44's citation had rotted the same way and was caught only because round 04 re-pinned it. Round 04 re-pinned
R02e under its name with a run that finds E13 by its heading.

**Check.** From any directory:

    node /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/rot-check.mjs

It prints (exit 0; kept at `probe-04/rot-check.log`) lines this regex matches:

    R02e as written in round 02, run today: expect matches: false\n[^\n]*rounds 00-03: exit 0 \| 0 failure\(s\)

**Issue text.** `round.mjs` runs a claim's check once, when the round that declares it is written, and
`ledger.mjs` afterwards checks only that the pinned sentence is still present. The evidence behind a pin can
therefore stop resolving — the cited file edited, its lines shifted by a commit above them — and nothing
reports it: the pin stays green while its `saw` describes a file that no longer says that at those lines.
The page's own advice to cite by `sed -n 'A,Bp'` makes this the common case. `ledger.mjs`, or `round.mjs`
at every round, should re-run every pinned entry's `run` and report the entries whose `expect` no longer
matches, as a report before it is a gate; and the page should prefer anchors that survive a line shift — a
heading, a phrase — over line numbers wherever the cited file is one that changes.

## D10. The hand-over gives every round's diff "against `00-original.md`", and the route that starts from a skeleton has no original

**Evidence, level 2.** `plugins/terse/skills/rewrite/SKILL.md:190-191` hands over "`diff-NN.patch`, the diff
against `00-original.md`" with no distinction of route, and `:16-21`, which names the routes a run starts
from — a run that already holds rounds, a skeleton, an audit run file, or neither — says nothing of an
original on the skeleton route, where the document is being written for the first time
(`rethink/SKILL.md:6`, "or when starting one"). The README's sentence "A round is handed over as a candidate
and its diff from the original" (R04a, level 2) restates the page and inherits the gap. Found by the
round-04 wave's lens 2 (Claude Opus, P5, level 2).

**Check.** From any directory:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/d10-d13-check.sh

Its D10 lines (kept at `probe-04/d10-d13-check.log`) must match:

    D10 rewrite/SKILL\.md:190-191:\n[\s\S]*?`diff-NN\.patch`, the diff against `00-original\.md`[\s\S]*D10 rethink route named at rewrite/SKILL\.md:16-21, 'original' mentions there: 0

**Issue text.** `rewrite`'s hand-over names one artefact for every run, the diff against `00-original.md`,
and one of its routes has no original: a document written from a skeleton `rethink` agreed. The page should
say what the hand-over is on that route — the round file alone, or a diff against the skeleton — and what
`00-original.md` holds there, if anything.

## D11. `sections.mjs` drops a renamed section from its over-budget count and says nothing when a budgeted section disappears

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/sections.mjs:19-24` reports each heading it
finds against `budgets.json` and counts the sections over budget among them; a heading not in the budget
file is printed as "(no budget)" and leaves the count, and a budgeted heading absent from the document is
never mentioned. On a copy of round 04 with `## Install` renamed to `## Installing` the report reads
"3 section(s) over budget" where the frozen file reads 4; on a copy with the `## Licence` section removed
no line names it. A report the coordinator reads for growth per section per round can therefore show a
section's growth vanish with its heading. Found by the round-04 wave's lens 2 (Claude Opus, R6, level 3,
planted and run), reproduced by lens 6 and for this entry on 2026-09-23.

**Check.** The same command as D10. Its D11 lines must match:

    D11 sections\.mjs on a copy whose Install heading is renamed:\s+119 Installing\s+\(no budget\); 1140 TOTAL, 3 section\(s\) over budget;\s*\nD11 sections\.mjs on a copy without the Licence section, lines naming Licence or a missing section: 0

**Issue text.** `sections.mjs` is the report that shows a section swelling round by round. It loses a section
from the over-budget count the moment its heading changes, and it is silent when a budgeted section is
gone. It should print every budgeted heading the document lacks, and count a "(no budget)" heading as a
section the writer must map or the coordinator must budget, so that a rename cannot hide growth.

## D12. `sections.mjs` counts space-separated words, so its budgets and growth mean nothing for text without spaces

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/sections.mjs:13` counts words as
`buf.join(" ").split(/\s+/).filter(Boolean).length`. A Chinese sentence of twenty-six characters with no
spaces counts as one word, so a section written in such a script is never over budget and never grows. The
README's scope sentence, "Markdown in any language", is inherited from round 02 and measured by the round-04
wave's lens 1 as overstated at level 3 on this and on `rule1.mjs`'s English exit-code words (the latter
recorded as ISSUES E8). Found by lens 1 (Claude Opus, F7, level 3), reproduced by lens 6 and for this entry.

**Check.** The same command as D10. Its D12 lines must match:

    D12 sections\.mjs on a Chinese sentence with no spaces:\s+1 介绍[\s\S]*D12 sections\.mjs:13: const flush = \(\) => \{ const w = buf\.join\(" "\)\.split\(/\\s\+/\)\.filter\(Boolean\)\.length;

**Issue text.** The plugin says its scope is Markdown in any language, and its budget report counts words
by splitting on whitespace, which counts a sentence in Chinese, Japanese or Thai as one word. `sections.mjs`
should count by a unit that exists in every script — characters, or graphemes by `Intl.Segmenter` — or the
pages should say the budgets are measured in space-separated words and hold for such languages only.

## D13. Two things a task reader needed that no page states: whether an audit run from one commit is input to another commit's `rewrite`, and who applies the candidate after the word

**Evidence, level 2.** `plugins/terse/skills/rewrite/SKILL.md:190-192` says that applying the candidate to
the user's files "needs their word", and no line of the page says who performs it, the user or the agent,
or with what command; no line of the page says whether an audit run made under one commit of the plugin is
valid input to a `rewrite` run under another, though the README at `2f29a8f` describes a commit its install
commands do not fetch. Found by the round-04 wave's task reader 2 (Claude Sonnet, `reviews/04/c4-2.md`,
guesses 8 and 9, GOAL partly), classed by lens 6 as page gaps the README may not fill.

**Check.** The same command as D10. Its D13 lines must match:

    D13 rewrite/SKILL\.md lines saying who applies the candidate: 191:[^\n]*Then stop: applying;\s*\nD13 rewrite/SKILL\.md lines on whether an audit run from another commit is valid input: 0

**Issue text.** A reader planning the audit-to-candidate path from the README stops at two questions the pages
do not answer: after they give the word, who writes the candidate over their file and how; and whether the
audit run they already have is usable when the plugin they run `rewrite` with is not the commit that made
it. `rewrite`'s hand-over should say what happens after the word — the agent applies `NN-<pass>.md` over
the document's path, or the user applies `diff-NN.patch` — and step 1 should say what a run from another
commit is worth: accepted, re-seeded, or refused.
