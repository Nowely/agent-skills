# Cut ledger — rewrite of plugins/terse/README.md, run 20260922-233021-terse-readme

Every passage of twenty words or more that a round removed, with its reason, per `rewrite/SKILL.md` step 6
(:205-206). Written in round 04 (2026-09-23) for rounds 01–04. Word counts are whitespace-delimited tokens
of the quoted sentences, the bullet dash not counted (`probe-04/cut-counts.mjs`, output in
`probe-04/cut-counts.log`). Line numbers are those of the round file named. A passage said in other words
in the next round is not a cut and is not listed; the sentences each round changed are listed by
`probe-04/sentences-gone.mjs <round> <next round>`.

No writer's cut ledger exists for round 01: the three judges were given none (`j2-astra-sheets.md:10`,
`j3-fable-sheets.md:365`, `j1-opus-sheets.md:5`, in `research/2026-09-22-terse-process/rewrite-2026-09-22/`).
The reasons for round 01 are the coordinator's decision (i) where it applies, otherwise the audit's
verdicts and the judges' derivations, each cited; none is invented here.

## Round 01 — candidate B taken whole (`00-original.md` → `01-candidate.md`)

### Removed, the content absent from the round

| Passage | Words | What it said | Reason | Source of the reason |
|---|---|---|---|---|
| `00-original.md:70-72` | 34 | "Two of the six failures were lies rather than findability. A reader repeated two guarantees from `README.md:5-9` that the code does not make. A structural rewrite would have carried both forward in better prose." | The audit left its claims unconfirmed: C34 and C35 at level 2 (`audit.md:331-345`); the readers' answers and a cause per failure are not in the record. An unconfirmed claim is not restored. | The coordinator's decision (i). J1: "unconfirmed C34/C35, though a dated measurement" (`j1-opus-sheets.md:143`) |
| `00-original.md:73-75` | 38 | "A reader's own sense of clarity ran against the truth. Two who reported no confusion answered wrong; the one who called a section scattered and confusing answered right. Neither skill asks a reader whether the text was clear." | The audit left its claims unconfirmed: C36 and C37 at level 1, stated by the pages only, with no record of the readers (`audit.md:347-361`); C38, the bullet's last sentence, at level 2 (`audit.md:363-369`). An unconfirmed claim is not restored. | The coordinator's decision (i), which cites `audit.md:331-361` (C34–C37); C38 is added here from `audit.md:363-369`. J1: "unconfirmed C36-C38" (`j1-opus-sheets.md:144`) |
| `00-original.md:84-86` | 27 | "Two published benchmarks that did run that arm found it large. The reference files say so where it matters, and [references/prior-art.md](references/prior-art.md) collects every finding against these numbers." | C45 refuted (`audit.md:420-426`: one of the two benchmarks found prior knowledge near chance) and C46 refuted (`audit.md:428-434`: prior-art.md leaves out two of the seat's findings); both retired in `ledger.json` (`want: false`). | The coordinator: ":84, refuted (C45, retired)". **Open:** the half of C46 the audit held ("The first half holds: audit/SKILL.md:90-96 and measure.md:70-81 state the missing arm") and the link to `prior-art.md` left with it and no recorded reason (J1, `j1-opus-sheets.md:147`); the missing arm itself is carried by C44. The link is round 02's L6-31, carried un-routed as L6.3-30 (`reviews/03/lens6-fable-dedup.md:258-259`) |
| `00-original.md:27-29` | 44 | "It exists because a draft written at ordinary quality was abandoned by its reader at the third section, and nine of his nine objections were about what the document contained, where it sat and how much of it there was. None was about phrasing." | The argument for an instruction, whose case lives in one place: `writing-rules.md:9-10` ("Cut first: the argument for an instruction, restated wherever the instruction appears. Give the instruction; the case for it lives in one place."); the case is `rethink/SKILL.md:17-21`, dated 2026-09-11 there. Not a claim about behaviour (`truth-pass.md:66`), so the audit ledgered none. | Not in the coordinator's list. J1's derivation (`j1-opus-sheets.md:79`, for A; `:140` for B, "with a reason"); J3: "rationale", not a limit (`j3-fable-sheets.md:327, 359`) |
| `00-original.md:55-56` | 29 | "If your text is long because it is wrong, this shortens it. If it is long because it explains something hard, it will stay long and start being right." Cut with `00-original.md:53`'s first sentence, "It makes documentation truer and easier to answer from." (9 words) | The audit left C25, C26 and C22 unconfirmed at level 2 (`audit.md:235-241, 259-273`; C26: "a prediction no recorded run tested"); "a sentence at level 2 stays at level 2 or is cut" (`candidates/what-broke.md:60`). | Not in the coordinator's list. J1: "unconfirmed" (`j1-opus-sheets.md:80`, `:141`); J3: "untested predictions", not a limit (`j3-fable-sheets.md:327, 360`) |

### Removed as false, the subject kept in corrected words

Each passage's claims were refuted by the audit and retired in `ledger.json`; the round states the subject
as the code has it. J3 counted these as corrections, not cuts; J1 counted the first as a cut with a reason.

| Passage | Words | Claims | Reason | Corrected at |
|---|---|---|---|---|
| `00-original.md:31-34` ("Three writers produce candidates … nothing got worse. Every round is kept as its own file.") | 62 | C12, C13 | refuted at level 2 and level 3 (`audit.md:154-168`); J1: "refuted" (`j1-opus-sheets.md:81`, `:142`) | `01-candidate.md:36-38` |
| `00-original.md:48-49` ("Nothing else is needed — no dependencies, no configuration file, no account anywhere. Node 22 or newer if you run the checkout directly.") | 23 | C20, C21 | refuted at level 3 (`audit.md:219-233`) | `01-candidate.md:60-61` |
| `00-original.md:76-78` ("Five published writing standards … was a control.") | 48 | C39, C40, C41 | C39 and C41 refuted, C40 unconfirmed (`audit.md:371-393`) | `01-candidate.md:97-101` |

### Compressed in round 01, restored in round 03

| Passage | Words | What it said | Record |
|---|---|---|---|
| `00-original.md:19-21` | 32 | the five causes in plain words: "the text lied, the answer was nowhere, the true sentence sat where it misleads, it was there and unfindable, or every sentence was true and the sequence left the reader worse off." | Compressed to the five labels at `01-candidate.md:27-28`. J1: a cut with no derivable reason, C07 being confirmed (`j1-opus-sheets.md:146`); J3: a replacement, not a cut (`j3-fable-sheets.md:364-365`). Restored in round 03 in plain words (`03-review.md:29-32`, L6-17/L6-19, C07 re-pinned), so no cut stands. |

## Round 02 — `edits/02.json` (`01-candidate.md` → `02-grafts.md`)

| Passage | Words | What it said | Reason | Source |
|---|---|---|---|---|
| `01-candidate.md:45-46` | 25 | "When you re-audit a temporary candidate, keep it at the same relative location in a copy of its Markdown tree so its links still resolve." | Its claim R02f1 DOES NOT ANSWER: placement advice for re-auditing a temporary candidate that no page states (`reviews/02-verifier-sol-rerun.md:15, 67`). The sentence was cut and its gap routed to `code-defects.md` as D1. | `rounds.md`, row 02 |

The rest of round 02's changed sentences of twenty words or more were said again in other words: the
re-measurement rule (21 words, now "When you re-audit after a rewrite, use …"), the run-directory sentence
(26 words, rebuilt below *Install*).

## Round 03 — `edits/03.json` (`02-grafts.md` → `03-review.md`)

None. The passages the round removed are under twenty words: "Both feed `/terse:rewrite`; audit the
candidate again to see whether it held up." (13, lens 2 W1: the diagram carries both routes), "Node is
required for an installed plugin and for a source checkout." (12, folded into R03h), "From those reported
counts," (4, W7). Every changed sentence of twenty words or more was said again in other words (C01, R03c,
R03g, R03h, R03j, G3b, C24).

## Round 04 — `edits/04.json` (`03-review.md` → `04-terms.md`)

None. The passages the round removed are under twenty words: "A writer may reword one or correct it when it
is false." (`03-review.md:101-102`, 12, L6.3-01: no page grants it; the pages' own conflict is D8), "The
section below describes this commit, not that one." (`03-review.md:75`, 9, L6.3-03: it repeated l73; G4
dropped), "works before prose." (l36, 3 and the skill's name, L6.3-14: carried by l11 and l37), "The
instructions say to" (l47, 4, L6.3-21: the frame at l23 says it). Every changed sentence of twenty words or
more was said again in other words (C06, R03g, R03j, C44, C42).
