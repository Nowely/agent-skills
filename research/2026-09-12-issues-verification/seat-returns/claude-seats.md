# The three Claude returns, and the coordinator's own checks

## Fable 5.1, ARCH — critique of the decomposition, run BEFORE the fan-out

Verdict: the decomposition was sound for 22 of 32 claims but must not be sent as written. Two claims (exit-two
wording; the escalation rung's help text) are proven true at 0.13.0 and false at 0.14.0, so sending them against
main would have returned "false" and merged "false on this version" with "false as a finding" — erasing a correct
audit finding and leaving the fix uncredited. One claim quotes README text that exists in no version. One named
the wrong placeholder. The audit finding about concurrent read seats sharing a temporary directory had no claim at
all, and the write-boundary finding had claims only for the documentation contradiction, not for the mechanism.

Addresses it corrected: seat/SKILL.md 55→80, 70→114, 62-64→99-101, 61,96→99,140, 156→200. One unlocatable.

Split errors it named: one claim was two claims; one was another's second clause; one was a fragment of its
neighbour; one served two ledger entries while tagged to one.

Not tree-verifiable, so not to be sent to a reading agent: the comparison-table claims (need the codex binary),
the placeholder-substitution claim (needs Claude Code), the synthetic-response claim (needs a run), and the audit
findings about a proven write, a harm, an exploitation, a task row and a user-facing paragraph.

Its own defects-in-passing, not filed: the ledger's C3 omits that the README documents the substitution at both
versions; C5's README quote is unlocatable; C1's closing sentence describes research rounds, not the shipped
README; C3 calls an extended-help block "--help".

## Opus 5, W1 — nine entries re-derived whole, most re-measured live today

Tally: five HOLD (C4, C5, C6, C7, C9), four MOVED (C1, C2, C3, C8), none FIXED, WEAKENED or FAILS.

Root cause of the drift, proven by blob: the ledger was written against commit a0f7ee8; the wrapper commit
312e2df shifted seat/SKILL.md by about 44 lines and the ledger was never rebased. All four MOVED entries are that
one shift.

Re-measured today on this tree: C2 (a seeded report and a seeded answer produced no row and both files survived);
C3 (TMPDIR unset gives a private directory under the state root, exit 0); C6 (without TMPDIR the cleanup exits 2
with the quoted sentence, with it exit 0); C7 (`codex login status` is governed by CODEX_HOME: logged in by
default, "Not logged in" under a custom empty home); C8 (a worktree seat cut before its thread exits 3, prints
"worktree PRESERVED at ... (run ended before disposition)" on stderr, and its report carries only the seven
pre-turn fields); C9 (no state directory, and separately a bogus flag, both exit 2 AND write the report file,
with stdout empty in both).

Two ledger entries quote an unshipped research draft as if it were the shipped documentation:
- C1's closing sentence says the README's clone route no longer symlinks cleanup. The shipped README symlinks it
  at line 89, at this version and at 0.13.0. Only the research draft drops it.
- C5's quoted README sentence, "the run stops if the server grants anything else", appears in twenty places
  across the whole history and every one is under research/. Restricted to README files across all commits it
  returns nothing. The shipped README says something different and weaker.

C9 is broader than written: a plain flag-parser error also writes the report, which refutes the entry's own
proposed repair. Its defensible reading is that the help means stdout, which was empty in every measured run;
the entry should be filed as "help and --report-file use the word report for different surfaces".

Levels after its reading: C2, C6, C8, C9 re-measured today, level 3 still right. C4 should rise to 3. C1 stays 2.
C3 and C7 stay 2 for the half that is a reading. C5 is labelled 2 while reporting a synthetic run through the
function, which is a level-3 act reported at level 2.

Found in passing, not in the ledger: the cleanup script's guard list is ["answers","jobs","tmp","pasted","locks",
"worktrees","home"] — reports is absent, although the seat page now sends every run's report to a reports
directory under the state root.

CORRECTION BY THE COORDINATOR: W1 states that this machine has no installed codex-delegate and therefore C1
cannot be measured here. That is wrong; I checked the installed-plugin registry myself and codex-delegate is
installed from the nowely marketplace at version 0.14.0, updated today. C1 is measurable on this machine.

## Opus 5, W2 — what the release fixed, failed to credit, and broke

0.14.0 fixes ZERO of C1..C9: all nine still resolve in the released tree, verified against the tagged tree rather
than the ledger's prose. So no entry is stranded by an uncredited fix — but two line references went stale in the
same release that could have rebased them.

Of the seven audit findings: the task-row finding is wholly fixed and credited at length. The exit-two finding is
fixed on the pages but not in the driver's help, and that remaining half is ledger entry C9. The escalation
finding is fixed in three driver hunks and half-done: the field that records a refused approval is still
documented nowhere, the seat page has no row for that exit code and its only mention still frames it as a refused
write, and the removed cause — "the sandbox was sized too small" — survives in two comments in the same file. The
narration finding is partly addressed. The write-boundary, shared-temporary-directory and extra-rights-line
findings are UNTOUCHED: those passages are byte-identical across the two tags.

Seven new candidates, two of them measured at level 3, and both are in the wrapper this release introduced:

N5. A relaunched seat returns the previous run's report as its own. The driver refuses an existing report path
before it records that path, so it writes no report of its own and never prints its pid line. The wrapper's wait
loop tests for the file first, finds the stale one, and reports success at once; the next step prints the stale
answer. The page's own guard against trusting a report you did not see written is unreachable, because the
wrapper is forbidden to return anything but its five lines and stderr is not among them. Measured: a seeded
report with a previous answer was returned as the new seat's result.

N6. The wrapper's wait never ends when the driver refuses before announcing its pid. With no report and no pid
line the loop's guard variable stays empty forever, and the instruction orders the wrapper to repeat it as many
times as needed and never end its turn. Measured: a report path under an unwritable directory produced exactly
that, still spinning after fourteen seconds.

N1. A reference page calls the wrapper a Sonnet wrapper; the shipped agent file pins it to Haiku, and the
changelog says Haiku is the pin.
N2. The README's clone route clones the marketplace repository and then changes into a directory that does not
exist at that level, so every symlink below it, including the new one for the wrapper agent, points at nothing.
N3. A test file states that there is no such agent, in the release that ships it, while another case in the same
file exempts it by name.
N4. The page says the wrapper's block has four placeholders; it has three, plus two shell expansions the sentence
does not count.
N7. The wrapper's mandated final message is a status block with an absolute path, on the card the same release
put in front of the user, against that page's own rule about what reaches a person.

Also noticed, not filed: the orchestrate page still tells the coordinator to wait with a tool the same release's
changelog says a subagent does not have; a reference page still describes stopping a seat as stopping its task;
and the preserved-tree guidance now sends the coordinator to a field the refusal report also lacks.

W2's open question, which the coordinator can settle: whether the two shell placeholders in the wrapper's first
command are substituted in the page as the coordinator reads it, or left for the wrapper's shell.

ANSWER BY THE COORDINATOR, from direct evidence: they are substituted. When this session loaded the seat skill
through the Skill tool, the rendered page carried the literal values — the data directory and the absolute driver
path under the installed plugin — not the placeholders. So a coordinator copying the block gets a working
command. W2's hang scenario by that route does not arise; its measured hang by the refused-path route does.

## The coordinator's own checks, run by hand

- The ledger's addresses were spot-checked before any fan-out: of four, three no longer pointed at what the entry
  said. This matched Fable's fuller count of five drifted and one unlocatable.
- The installed plugin is codex-delegate from the nowely marketplace at 0.14.0, updated 2026-09-12 18:36, and it
  ships the wrapper agent file.
- The wrapper agent type does NOT resolve in this session: the session began 2026-09-11, before the plugin was
  updated, and its agent registry was never refreshed. The twenty bulk seats therefore ran as background shell
  tasks rather than through the wrapper. This is a property of the session, not a defect in the plugin, but it
  means a long-running session cannot pick up a newly installed plugin's agents.
- The user-level agents directory holds a symlink for the wrapper created on 2026-08-31 pointing into the
  pre-marketplace standalone checkout, a path that no longer exists. The link is dangling. Anyone who followed
  the clone route before the repository moved has a broken wrapper and no signal that it is broken.
- The shipped README does symlink the cleanup skill at line 89, confirming that C1's closing sentence is false of
  what a user reads.
