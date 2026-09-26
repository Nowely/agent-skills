# Questions and answer key — draft for step 4

Written from `claim-ledger.md` beside this file (C01–C46, plugins/terse/README.md at 1a24018). Where the
right answer needs a fact the README never claims, the page line is cited directly and marked as
outside the ledger. "README answers it" is about the README alone, as a reader starting there would read it.

Controls: Q1 holds. Q2 does not: the current text answers it wrongly (C16 refuted, C15 Position), so it
cannot serve as a control. Q4 and Q6 are answered correctly by the current text and can stand in; Q3 is
answered only by inference.

## Q1. What do I type to install this? — control named by the profile

Answer: inside Claude Code, `/plugin marketplace add Nowely/agent-skills`, then `/plugin install terse@nowely`;
from a terminal, `claude plugin marketplace add Nowely/agent-skills`, then `claude plugin install terse@nowely`
(C18, C19; the same commands with the checkout's path as the source ran in an isolated config). Nothing
else is typed to install. To run, the skills need `node` on `PATH` whether installed or run from a
checkout; the package declares 22 or newer (C20, C21, both refuted as the README words them).

Scoring: right = both commands of either form. An answer that adds "nothing else is needed" or "Node only
for a checkout" is right on this question and repeats C20/C21.

README answers it: yes — README.md:42-45, :47-48. Its prerequisite sentences, README.md:48-49, are
refuted (C20, C21), outside this question.

## Q2. If I run it, can it change my files? — control named by the profile; does not hold

Answer: yes, `rewrite` does, without a word about files. It works in `research/<date>-<slug>/` at the root
of the repository that holds your document and writes every round, its edits, the ledgers, the reviews
and the diff there (C15; rewrite/SKILL.md:66-67, 181-191), and it writes a code defect it finds into that
repository's `ISSUES.md` (C16). What waits for your word is applying the rewritten document over yours
(rewrite/SKILL.md:176-177). `audit` writes nothing into your repository: its run directory is under the
plugin's data directory, or `$TMPDIR/terse` when that is empty (audit/SKILL.md:30-40, run under this
audit's run directory; outside the ledger, since the README claims nothing about it). `rethink` returns
one file and its page does not say where it is written (rethink/SKILL.md:70-83) — unsettled. No skill
starts itself (C04, level 2 only).

Scoring: right = rewrite writes into your repository (its run directory, `ISSUES.md`) without asking, and
only applying the candidate needs your word. Wrong = "no, nothing reaches my files without my word".

README answers it: no — README.md:35-36, "It writes into its own run directory. Applying anything to your
files needs your word." (C15 Position, C16 refuted). A reader concludes that nothing reaches their tree.

## Q3. My README feels wrong but I don't know whether it is worth touching — which of the three do I run first?

Answer: `/terse:audit`. It measures whether fresh readers get the right answers from the README and why
each failure happened (C06, C07), proposes no wording (C08), and writes nothing into the repository
(audit/SKILL.md:40, outside the ledger). A baseline with every answer right is reported as such and the
audit stops (audit/SKILL.md:145-147, outside the ledger) — the "not worth touching" outcome. `rethink` is for
a document whose shape is wrong or that does not exist yet (rethink/SKILL.md:6; C09), and `rewrite` starts
from either one's output (C05, C11).

README answers it: yes, by inference only — README.md:3-4 (measures, then repairs), :11 (audit → run file
→ rewrite) and :17-22 point to audit; no sentence says which to run first or what a perfect baseline does,
and README.md:10 shows rethink as a first step too. Weak as a control.

## Q4. It found problems. Do I get fixes, or does it rewrite the whole file on me?

Answer: the audit gives no fixes: it returns each failure with its cause and proposes no wording (C07, C08).
Fixes come from `/terse:rewrite`, which you invoke yourself (C04, C11). It does rewrite the whole file —
three writers each rewrite all of it, and the judged winner is then edited in rounds (C12;
bake-off.md:47) — but as a candidate in its run directory, handed over with a diff against your original
(C05, C14), and it replaces your file only on your word (rewrite/SKILL.md:176-177). That run directory is
inside your repository (C15 Position).

README answers it: yes — README.md:21-22, :31-36. README.md:35 does not say where the run directory is
(C15 Position) and README.md:36's "anything" is refuted (C16); neither changes the answer to the either/or.

## Q5. Will a second pass undo what the first one fixed?

Answer: it is guarded against, not ruled out. Every verified sentence is pinned in `ledger.json` — on the
audit route from the first round, seeded from the audit's confirmed and refuted claims — and `ledger.mjs`
fails any round that loses a pinned sentence or brings a retired one back (rewrite/SKILL.md:88-93, 111;
loop.md:68-73; run on this ledger: a paraphrased pin read LOST, a removed refuted sentence read "-", exit 1).
A failing round is regenerated before its critics see it, and a round is not handed over with a
regression its critics found (rewrite/SKILL.md:112-117, 164-167). The pins are literal sentences
(ledger-seed.mjs:15-17): a fix reworded without re-pinning reads LOST, and a new wrong sentence that no pin
covers passes the ledger unless a critic catches it (loop.md:74-76; C14). The recorded rounds of
2026-09-11 had regressions 1, 2, 1, 0, 6, 5, 10 (research/README.md:12). Running `audit` again shows whether
the result held (C05; measure.md:106-115).

README answers it: no — the nearest sentence, README.md:31-34, "until a round finds nothing new and nothing
got worse", is refuted as the stop rule (C12) and reads as a guarantee; README.md:34-35, "Every round is
kept as its own file", is refuted (C13); the ledger that does the guarding is not in the README.

## Q6. Is it going to cut my long document down?

Answer: not as an aim. Length never picks a candidate and section budgets are reported, never enforced
(C23); every removal of twenty words or more carries a reason (C14). It cuts sentences that carry nothing
and arguments restated beside their instruction (writing-rules.md:6-10), and it does not cut or weaken a
condition, a limit or a warning where a reader decides, though it may reword or correct one (C27). The one
measured file went from 2,725 to 2,571 words, six percent (C24).

README answers it: yes — README.md:53-55, "It is not a compressor" and the 2,725 → 2,571 figure (C23, C24).
The two predictions after them are unconfirmed (C25, C26), and README.md:58 overstates the safeguard as
"will not touch" (C27).

## Q7. My documentation is in Russian — do the readers go through it the same way? — planted, unanswerable

Key: UNANSWERABLE from the documentation. Neither the README nor any page of the plugin says anything about
the language of the text being audited, or whether the readers, the checks or the scripts treat a
non-English document the same way; no ledger entry bears on it. A confident yes or no is a failure. The
right answer is that the documentation does not say.

README answers it: not at all.

Scoring note: audit/references/reader-profile.md:19 asks for the readers' words "in their languages", and
its worked example quotes Russian phrases (reader-profile.md:73-75). A reader who leaves the README may
take that as an answer; it is about the profile's vocabulary, not about how the readers go through the text.
