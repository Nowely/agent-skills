# Skeleton — none agreed

This run is on the audit route: no `rethink` skeleton exists for `plugins/terse/README.md`. The budgets in
`budgets.json` are the README's section sizes at `1a24018` (words per `##` section, the opening counted as
`(opening)`), set by the coordinator as the starting numbers (the opening is 99 words); `sections.mjs` reports growth against them
and gates nothing. Decisions taken after this file was written are appended below.

## Open decisions

- 2026-09-23, round 01/02: the winner added a section "Where it writes" (the audit's cause `missing` for Q2's neighbourhood and the judges' lifetime finding); round 02 moved it below "Install" so that rule 1 holds (a flag name and an environment variable sat before the technical section); its budget in `budgets.json` is its size at round 02, set by the coordinator.
- 2026-09-23, round 03: the coordinator's five decisions on the round-02 wave's SCOPE and UNSETTLED items
  (`reviews/02/routing.md`), as applied in `03-review.md`:
  - (a) register (L6-25): "the instructions say" or "the page says" where the source is a page (level 2),
    direct where a script does it (level 3). Applied as one sentence at the head of *What each one does* —
    "Each skill is a page of instructions for Claude; below is what each page says." (round 04, L6.3-17:
    "…what each page and its references say.", R03a re-pinned) — so the pinned
    sentences under it keep their words; the attributed sentences elsewhere keep their attribution (W9 not
    applied); the script sentence ("The shipped check rejects…") stays direct.
  - (b) L98-99 (L6-08): the six before-readers of 2026-09-10 are recorded one by one
    (`research/2026-09-10-chain/chain-source-prompt.txt:103-132`); no record of the after-readers exists.
  - (c) no scope mechanics in the README (L6-06, F9): the lifetime sentence says "the plugin's last
    installation", and names no `--scope`.
  - (d) the version-boundary sentence stays in *Install* (L6-04), worded without editing history (lens 2 W2):
    no branch name, no "still", the date and both commits kept; no repeat at the head of *Where it writes*.
  - (e) the audit key's Q7 is the coordinator's matter, not the text's: the language sentence is left as it
    is (L6-24, W8, not applied).
  Budgets are unchanged; `sections.mjs` reports four sections over (see `rounds.md`, round 03).
- 2026-09-23, round 04: the coordinator's decisions on the round-03 wave's UNSETTLED and SCOPE items
  (`reviews/03/routing.md`), as applied in `04-terms.md`:
  - (f) the regression count (L6.3-08): the definition of `rewrite/SKILL.md:181-182` and `loop.md:52-55`
    is kept as written — a sentence the round introduced, shown false or overstated — and a sentence an
    earlier round wrote that this round re-pins counts as introduced only in the words the round changed.
  - (g) decision (d) covers every branch name (L6.3-15): the boundary sentence carries the date and the
    two commits and no branch, not even the one the install resolves; its last sentence, a repeat of the
    first, is cut (G4 dropped; R03i and R03j re-pinned).
  - (h) decision (a) reaches its own section (L6.3-16): the frame sentence governs *What each one does*;
    attributed sentences elsewhere keep their attribution, unattributed ones are not changed for it.
  - (i) the three dated findings round 01 cut (L6.3-22; `00-original.md:70-72`, `:73-75`, `:84`) stay
    cut: the audit left C34–C37 unconfirmed at levels 1–2 (`audit.md:331-361`; the readers' answers and
    the cause per failure are not in the record) and an unconfirmed claim is not restored; C45 was
    refuted. The reasons are recorded in `cuts.md`.
  - (j) the README does not name rewrite's guess route (L6.3-12): the sentence names the skeleton, the
    audit's run file, and a resumed run of rewrite's own.
  - (k) the install line for this checkout (L6.3-02, carried from L6-04) is added at level 3: the
    install performed from the checkout's path into an isolated configuration, and the installed tree
    compared with the checkout's.
  - (l) the gate reads Q7's GUESSED as the key's answer (L6.3-28, E14): a confident yes or no is the
    failure; the language sentence stays (decision (e)).
