# Measuring with fresh readers

A fresh reader is the only ruler in this plugin that has been shown to move. Standards produced audits;
readers produced a number that changed from 3/6 to 6/6 when the text was repaired. That was one run on
one README, six questions, one trial each — McNemar two-sided *p* = 0.25, which is not distinguishable
from chance. Everything else here exists to make that number trustworthy, and it is not there yet.

## Before any reader exists

Two things must already be written, and both come from earlier steps:

- **The questions.** One per decision the reader must make, in the reader's words, from the profile.
  Five to eight. The measured run used six.
- **The answer key**, derived from the claim ledger. Written from the code, not from the documentation.

The order is the whole point. A key written after reading the readers' answers is a key written to agree
with them, and the earlier ruler this one replaces failed exactly there: it assumed a correct answer
without ever saying where the answer came from.

At least two questions must be ones the current text already answers correctly. They are the controls.
A rewrite that raises the score while breaking a control has traded one failure for another, and without
controls that trade is invisible.

Plant at least one question the documentation does not answer at all, keyed as not answered there, with
the true answer where the code gives one. A confident answer to it is a failure of the reader, not of the text, and it is the cheapest way to catch a reader
answering from what it already knew rather than from what it read.

## The reader's rights

Each reader gets brief 8 of [roles.md](../../../references/roles.md), in its form for a set of documents,
one reader per question, and nothing else.

| Allowed | Forbidden |
|---|---|
| the `.md` files in the repository | source code, tests, config |
| starting at the entry file | starting anywhere else |
| following links it finds in the text | a table of contents you supply |
| saying it could not find the answer | another reader's output, or yours |

The model is the question readers' in roles.md, a cheap one: the 2026-09-10 run used Haiku and the
failures it found were real. Announce the count and the model to the user and wait for their word before
spawning. A measurement the user did not agree to pay for is not a measurement they asked for.

## The no-document arm

Every audit runs every question twice: once through the documentation, once with no files at all, same
model, same brief minus the corpus. **The score this audit reports is the difference.**

Without it a document that teaches cannot be told from a document about something the reader has already
seen. Two benchmarks that ran this arm found the gap large — one scored between .56 and .68
closed-book on tasks built to require documentation, and treats a high closed-book score as contamination. A third of
our questions could plausibly sit there, which is more than the whole effect we have ever measured.

It doubles the reader agents.

## Scoring

Right answers over questions, and then the delta against the no-document arm. Beside it, two numbers that
are not the score but predict it: steps taken, and how many readers departed from the documentation. A
right answer found by reading the source is a documentation failure with a correct answer attached.

On the planted question a reader in either arm is right when it says it cannot tell, and wrong when it
answers with confidence; when both arms say so, the question adds nothing to the difference.

Then give every wrong answer a cause — refuted, missing, placement, findability or harmful. The five are defined
in Step 6 of [SKILL.md](../SKILL.md), the evidence rules behind `refuted` are in
[truth.md](../../../references/truth.md), and the ledger entry in [ledgers.md](ledgers.md) records which one.
`missing` is the one most easily mistaken for `findability`: if the answer is nowhere in the `.md` files,
no path leads to it and no rewrite of the path will help.

**Say when the instrument has no room.** A score of every question right cannot register an
improvement; report that and stop rather than producing a number that cannot move. A zero can rise.

## Establishing this instrument's own noise floor

Optional. Run the unchanged document through the same questions two or
three times under blinded version labels and count how many answers flip. That flip rate is **this**
instrument's noise floor, and until it exists, "the score fell" after a rewrite is being judged against a
threshold borrowed from somebody else's benchmark. Six questions × two labels × three repeats is 36
cheap calls.

## Each audit stands alone

An audit takes no earlier audit as input, and a later one writes questions of its own. A before and after
on the same questions is `rewrite`'s, inside its own run: given this report, it asks these questions of the
text as it was and of its own, [its Step 2b](../../rewrite/SKILL.md#step-2b-the-questions-and-the-text-before).

## What is measured and what is not

**Measured, at the size of one run:** the four-part chain moved one README from 3/6 to 6/6, took
departures from 1 to 0, and broke neither control. One trial per question; the result does not survive a
significance test and must not be quoted as a rate. Two of the six failures were refuted claims rather
than findability failures.

**Not measured:** which part of the chain produced the gain. The experiment that would isolate it —
three writers given different subsets, eighteen readers — was designed and deliberately not run. Do not
report a single part as the cause.
