# The benchmark on sharpdeveye/maestro — 2026-09-24

The protocol is `plugins/terse/references/benchmark.md`; this directory is its first run. The question: on a
popular repository whose README the owner named as good (2026-09-12), does a README written with the skills
come out better or worse than one a bare agent writes, and how far is either from the repository's own?

- **Snapshot**: `sharpdeveye/maestro` at `00f9115d446a8ba26b8f18f6ed306bc4a21807c3` (2026-04-29), 141 tracked
  files, cloned on 2026-09-24; the root `README.md` (346 lines, 1478 words) removed from what the writers see
  and kept aside as C.
- **What the coordinator had seen of C before the run**: its headings and its first lines (the banner, the
  badges, the version line) on 2026-09-23/24, from the copy the rethink survey of this plugin's README fetched
  (`../2026-09-22-terse-process/rethink-2026-09-23/maestro-README.fetched.md`). Noted in passing and left to
  the audit: the README says 25 commands and version 2.0.0, the root manifest 21 commands and 1.4.2.
## Result

**On the owner's blind read, the skills beat the bare agent and sit at parity with the repository's own README**: C first, B second — "1 и 2 хороши … я бы поставил им паритет" — and A third: "3й плох: форматирование, многословность". Premise 3 of the protocol (a bare agent beating the skills means they fail their main task) did not come true on this repository. One read, not a deep one, by an owner who had seen C before; one repository, one A.

| Ruler | A, bare Opus | B, the skills | C, the reference |
|---|---|---|---|
| the owner's read | 3rd, "bad: formatting, wordiness" | 2nd, parity with C | 1st |
| visible words | 2,104 | 1,175 | 1,001 |
| truth pass: claims, refuted | 121, 12 (9.9%) | 69, 11 (15.9%) | 105, 25 (23.8%) |
| question readers, 7 questions: right / partly / wrong | 7 / 0 / 0 | 7 / 0 / 0 | 3 / 2 / 2 |
| the no-document arm | 1 / 0 / 6 | | |
| task 1, install and reach the first command | achieved | achieved, no guess | achieved |
| task 2, find the commands for the next problems | partly | partly | achieved |
| water in words; facts in three sections or more | 5; 12 | 48; 7 | 87; 11 |
| blind judges: Codex Sol · Codex Astra · Claude Opus | 2nd · 1st · 1st | 1st · 2nd · 2nd | 3rd · 3rd · 3rd |
| wall time to the text | 14 min | 6 h 38 min | — |

- **The model judges and the owner disagree at both ends.** Two of three judges put the longest text first, which the owner put last for its wordiness; all three put the reference last for its false claims, which the owner put first. `bake-off.md` warns that model judges prefer longer answers; here the preference ran against the owner's read.
- **Truth**: B has the fewest refuted claims by count, one fewer than A; by share A is ahead, having run the code at every turn. Of B's refuted claims, the one FALSE sentence and the `@maestro` cluster came through the skeleton from the stand-in owner's must-says, which no step checked against the code before the owner agreed.
- **The reference**: 25 of its 105 claims are refuted against its own code (stale counts, a manual install that copies directories the repository does not contain, a VS Code configuration in the wrong shape); the audit finds real defects in a README its owner holds up as good, and the owner still reads it first.
- **Hypotheses**: H1 holds by count (B 11, A 12, C 25) and fails by share against A; H2 holds; H3 fails on the owner's read — A is behind on form — while the water ruler, counting filler phrases, placed A first: the owner's wordiness is length and coverage, which that ruler does not count.

- **Files**: `rounds.md`, every agent with its cost; `prompts/`, every brief as sent; `rethink/`, arm B's rethink run
  (`…/20260924-125421-maestro-readme-rethink` under `$TMPDIR/terse/runs/`) — the stand-in's answers, the purpose, the
  three surveys and the synthesis, the words, ten structures, two critics, the base, skeletons 01 and 02 with their
  reads; the documents the surveys fetched are named by URL in the reports and not copied. A, B and C go in when B
  is frozen, so no writer of B can reach A here.
- **Status**: run to the owner's read on 2026-09-24. Texts: `texts/A.md`, `texts/B.md`, `texts/C.md` (C is sharpdeveye/maestro's README at `00f9115`, MIT). The rulers' reports: `rulers/`; the owner's read: `owner-read/README.md`.
