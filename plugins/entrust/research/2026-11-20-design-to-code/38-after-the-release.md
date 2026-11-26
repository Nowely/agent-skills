# After entrust 0.45.0: the plan for the rest of the quota

Written before the runs, after the release, with Fable's reading. The skill ships as experimental in entrust 0.45.0
(`bc54fde` on main): draft 28.3, the joined-text type fix, and the line that a ledger entry is written without asking
([the release decision](35-iteration-7.md#the-release-decision)). Of the five iterations of
[the plan](33-five-iterations-plan.md), 5, 6 and 7 are spent; 8 and 9 remain. The goal and the success clause are
unchanged: the owner accepts Terra's first submission on the real task, as seen and as read, without finding the
defect himself.

## Step 0: the Terra rerun (part B of iteration 7, no new quota)

[36-terra-dry-run.md](36-terra-dry-run.md), repinned to the shipped skill (`bc54fde`): the prebuilt planted card, 60
calls at most, the plan's approval in the first message as a recorded changed condition.

- **The owner:** appends the Codex rule, starts Terra, sends back the record.
- **The coordinator:** grades it with the planted grader, which compares the inputs with the case's originals.
- **What it decides:**
  - **E147:** does Terra write the ledger entry? If it still waits for approval, iteration 8's prompt carries the
    approval line too.
  - **E146:** does Terra bend the inputs? `INPUTS CHANGED` or `HACKED` means the handover procedure below is mandatory
    in 8. `QUESTION NOT SURFACED` means draft 29 is weighed before 8.
  - **E153:** does the review pass run inside the run at `pending`? If not, 8 registers a separate review session.
  - **The context:** from Terra's rollout log, the first request's input, the input per call at calls 1, 15, 30 and
    60, and the ten largest tool outputs. The context is trimmed only in iteration 9, and only if the check's output
    is among those ten or the skill's share is over a quarter. The page and the references are about 10k tokens
    against about 66k per call.

## Iteration 8: the real task on 0.45.0

**Registered before it starts:**
- the budget: about 200 calls and 40 minutes for the builder, with every role's cost beside it;
- the criteria: the success clause of the plan;
- the record's eight fields ([30-terra-run.md](30-terra-run.md#the-record-every-run-keeps));
- the hashes of the owner's originals: references, specs if given, the data contract and the frames' data.

**The owner:**
- runs it;
- gives the verdict on the first checkpoint, as seen and as read;
- marks each question as fair or unfinished;
- notes his review minutes.

**The coordinator, after:**
- diffs the inputs against the originals (E146, a procedure, not a detector);
- runs the blind review with the five code questions;
- counts every role's cost.

**Done when** the plan's success clause holds.

## Iteration 9: the reserve

- **If 8 was accepted:** a second run. Two acceptances remove "experimental", and the release is 0.46.0.
- **If 8 was returned:** fix only the class Terra showed, with a failing bench control first, as 0.45.x, and rerun
  once.
- **If the return is on cost or a consumer path again:** the plan's honest stop. The skill stays experimental and the
  reasons are written down.

## Left as they are before the real run

- **E152, story-page openers:** fixed only if the real task's frames sit on such a page.
- **E150, per-text type at 1×:** Figma specs where possible; the blind reviewer covers the rest.
- **E151 and E149, broad ledger entries and bench misses:** not a first-submission return on their own.
- **E148, cost on a contradictory design:** measured, not fixed; no draft moved it.

No architecture critic after iteration 8, as the plan says.
