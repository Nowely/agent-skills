# Draft 26 pilot: the controls it lacks

An addition to [the pilot plan](draft26-plan.md), not a replacement. Nothing here has been run. [The protocol](protocol.md) defers synthetic cases until a named question needs one; this page names three, with the scope and cost of each.

## Why the pilot alone cannot decide

- **It runs on the task the draft was written from.** Draft 26 speaks of timers, a file named `utils`, and a short coordinator with named rules, which are features of the private change and of its later solution. A pass on that change does not show the draft works on other code.
- **Its gate rewards an added finding and measures no cost.** A draft that makes reviewers say more passes it more easily. Draft 18 demanded a merge on a clean import this way.
- **Round 6 had no unaided arm.** Both arms removed the lookup in 3 of 3 once the installed dependency was in the packet. Whether a reviewer with no skill does the same on that packet is unknown, so the skill's own part in the result is unknown.

## Three questions

| | Question | Target | Arms | Reviews |
|---|---|---|---|---:|
| A | On the full packet, does an unaided reviewer recommend the removal, and does an unaided implementer make it? | the private flawed snapshot, round 6's packet unchanged | `control` reviews; `task-only` implementers | 3 + 3 |
| B | Does draft 26 ask for removals or splits on code that is already good more often than draft 25? | `slot-edit/clean`, `profile-phone/clean` | draft 25, draft 26 | 12 |
| C | Where the fact is not handed over, does `instead` help find the needless mechanism, and does draft 26 see the tangled rules on code it was not written from? | `slot-edit/head` | `control`, draft 23, draft 25, draft 26 | 12 |

No implementers in B and C: their reviews are read first, and an implementer stage follows only where the reviews of two arms differ.

### A. The unaided arm on the private change

Three reviews with the control prompt and three implementers given the task and the source and no review, same model and effort as round 6, judged by the same two judges on round 6's questions. If two of three unaided reviews recommend the removal, or two of three unaided implementers make it, the lookup no longer separates anything on this packet, and round 6 shows what the packet does, not what the skill does. The remaining gap that draft 26 aims at is then the only thing this change can still measure.

### B. Good code left alone

`slot-edit/clean` needs its timer, and its five rules already stand in the order they win in one function. `profile-phone/clean` is one ten-line check. Their rubrics carry the traps: removing the periodic check, requiring the rule function to be split, guards for what the contract excludes, reporting the accepted minute as a defect.

Measured two ways: `blocks.mjs` gives the lines of code each record marks `remove`, with no judge; the two judges rule on the traps, and a violation counts where both rule it.

### C. A case the drafts were not written from

`slot-edit/head` has a lookup of what the order already carries, justified by a stale page and by the author's note, and a validator whose rules win by overwriting one variable. Three unaided reviewers of the earlier form of this case read the client's contract and none reported the lookup. This is the scenario `instead` was written for and round 6 did not contain; it is also draft 26's subject on code its wording was not drawn from.

`blocks.mjs` gives the chain for the three arms with a record: mechanism listed, alternative named, superfluous lines marked, needed lines marked. The judges rule on the rubric, of which F2 and F3 (the lookup and what exists only for it) answer for `instead` and F5 (the rules cannot be read one at a time) for draft 26. The `control` arm is the case's admission: if two of three unaided reviews hit F2, the case does not separate arms on the lookup either.

## The gate, with its second half

Draft 26 becomes the working reference only if both hold:

1. The pilot's own gate on the private change: at least two of three reviews keep the baseline diagnosis and add a substantiated, actionable item beyond it.
2. On the six clean reviews per arm of B, draft 26 has at most one more trap violation ruled by both judges than draft 25, and marks no more lines of code `remove` in total.

A draft that passes the first and fails the second found more by saying more. It goes back with the violated traps as its evidence, not forward to implementations.

`instead` is decided by C alone: it stays if draft 25's records name the existing alternative or mark the lookup's lines in more runs than draft 23's, or the judges rule F2 and F3 hit in more. If the two arms do not differ here either, the field goes.

These are pilot rules for a handful of runs. They decide what to do next, not how reliable a draft is.

## Order and cost

1. **A**, six sessions. It is the cheapest and changes how everything after it is read.
2. **The pilot's first phase**, three draft 26 reviews on the private change, as planned.
3. **B**, twelve reviews, only if the pilot's gate passes: a draft that added nothing need not be checked for harm.
4. **C**, twelve reviews, whichever way the gate went: it answers for `instead` and for transfer.

At most 33 reviewer and implementer sessions and the two judges on four packets, against 3 in the pilot as planned. Steps 1 and 2 together are nine.

## Preparing B and C

- `node evals/review/round.mjs <directory> --cases slot-edit,profile-phone control draft-23=… draft-25=… draft-26=…` prepares repositories and prompts; run it three times for three repetitions, and drop the runs this page does not ask for.
- Each arm is a complete package, as [the protocol](protocol.md) requires: draft 23 from `entrust@0.37.0`; draft 25 from `9ee0189c`; draft 26 as that package with [its entrypoint](drafts/26-structure.md) and [examples](drafts/26-structure-examples.md). Each record is checked with its own arm's scripts.
- Give every reviewer with a skill a directory outside the repository for its record, and save it as `returns/<run>.json`.
- Judges get the case's rubric and `judge.md`, never the other judge's rulings.
