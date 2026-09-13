# Verifying the defects ledger against a moved main

**Question.** `ISSUES.md` recorded nine defects in `codex-delegate` on 2026-09-12, minutes before the
0.14.0 release. Which of them are still true of the released tree, which were written against something
that has since moved, and which were never true?

**Result.** Of the nine, one is struck, six need rewriting and two stand. None was fixed by the release.
Four of the nine cited a page the release had shifted by about 44 lines, and two quoted an unshipped
research draft as if it were the shipped documentation. Five findings from the [0.13.0 reflection
round](#the-earlier-round) were re-judged: two join the ledger, three do not. Seven new candidates were
raised against the release itself and three join. The ledger the round proposes holds thirteen entries.

The two heaviest are new. A write seat's declared directory does not bound its writes: a live
`thread/start` on codex-cli 0.153.4 returned the grant with both temporary-directory exclusions false, so
`/tmp` and `$TMPDIR` come with it. And the wrapper this release introduced returns a previous run's report
as the current invocation's result when a report path is reused — the driver refuses the taken path before
it records the path or prints its pid, and the wrapper's fixed loop tests for the file first.

## Files

| File | What it is |
|---|---|
| [00-ledger-as-found.md](00-ledger-as-found.md) | the ledger as the round found it, nine entries |
| [01-marked-up.md](01-marked-up.md) | the judge's markup: one instruction per entry, with the evidence |
| [02-proposed.md](02-proposed.md) | the ledger the round proposes, thirteen entries |
| [claims.json](claims.json) | the thirty-five atomic claims the document was broken into |
| [seat-returns/](seat-returns/) | every agent return, Codex and Claude |
| [rounds.md](rounds.md) | what each wave produced and what it got wrong |

## The earlier round

Seven findings came from a 2026-09-11 audit of 0.13.0 that never reached the ledger. This round re-judged
them against 0.14.0: the write boundary and the undocumented declined-approval record join the ledger; the
exit-two wording was fixed by the release and credited in the changelog; the shared temporary directory,
the repeated rights field, the packed task row and the technical status block were not established as
defects of the released plugin, each for a reason [rounds.md](rounds.md) records.
