# The answer

## Before it goes out

The answer names every agent that ran, or names it as dropped, and a success claim names the evidence behind it or says it is unverified. Before it goes out, check the run against the card: every launch, every write and every dropped agent. Your own inline reads, the runner's `--summary` of the run's ledger, stand beside the agents' tokens, and `unknown` where nothing counted them.

## A recommendation

Recommend only what an analysis stands behind. For each item the user must decide: the problem, what it costs the user, two or more options with closing it among them, what each removes or moves and who relies on it, and an outside critic's view of the recommendation. An item with no such analysis goes to the user as a question with the options known so far, never as a recommendation.

## The completeness critic

One fresh strong-row reader, named in the plan, reads the user's request, the final answer and its evidence once before the answer goes out, never per return. A publication (a README, a changelog, a synthesis) is read the same way.

1. Freeze the linted draft after the last owner decision and the last return, with a manifest beside it: `shasum -a 256` over the draft, every artifact it cites, the run's ledger and the runner's log behind each number it states.
2. The critic returns done, partial or not done, with what is missing, unverified or unread, and the manifest's sha256 as the first line of its `evidence`. For each gap it writes the fix into a copy of the draft under its temporary directory and returns the copy's path and one diff hunk per gap, each citing the line of a return or artifact it rests on and changing nothing outside the gap.
3. Before the answer goes out, compute the manifest's sha256 again and run `shasum -a 256 -c` on the manifest. A different digest or a failed check voids the verdict, and the critic reads again.
4. Take the copy whole, or without the hunks you object to, and send each objection with its source into the critic's next read. The citations stay in its return, never in the draft; never restate a fix in your own words. A later read covers the changed lines, the lines that state the same facts, and the rest for anything they contradict.
5. Count the reads of one answer or publication across its drafts, voided ones included. After the third, or after two that repeat the same gap, take the critic's copy, name its remaining gaps as open in the answer (or in a publication's own open items), lint it and send it without another read. These reads are not the fix rounds under Verification.

The answer carries the critic's verdict. A `not done` verdict means you fix the answer or name the gap in it.
The answer the user receives is the copy the critic read: a shorter message sent instead, such as a summary with
a link to the copy, quotes it and restates nothing, or it is a new draft for steps 1 to 4. In two runs on
2026-10-09 the critic read a draft and a different, shorter text went out unread.
