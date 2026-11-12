# Draft: booking-edit review case

Status: design draft. This case has not been implemented or run. Examples were reasoned through by hand; they are proposed expected results, not observed test results. Names, numbers and rules are fictional and unrelated to the private target. The case is an additional public synthetic example, not a disguised copy of that target.

## What the reviewer receives

A normal task and one change against its base, without a rubric, a comparison solution, a label such as “bad” or “good”, or hints about the desired findings.

> Add `previewEdit(booking, draft, context)` to the booking edit flow. Return a blocked reason, an unchanged result, or the price and an update command. Apply these decisions in order:
>
> 1. A user without edit access gets `forbidden`.
> 2. A cancelled booking gets `closed`.
> 3. When room, start, end and number of people are unchanged, return `unchanged`.
> 4. If end is not later than start, return `invalid-window`.
> 5. If the selected room is absent from the current catalog, return `room-unavailable`.
> 6. If the number of people exceeds the selected room's capacity, return `capacity`.
> 7. Otherwise return `ready`, including the price, whether the price has increased, and the update command.
>
> A time slot is 30 minutes. Price is the room's one-time setup charge plus its hourly rate for each started hour. Price confirmation is required only if the new price is strictly greater than the amount previously paid. The update command carries the booking ID, its original revision and all four editable fields.

These are product behavior requirements, not instructions to add specific helper functions, classes, caches or review findings.

## Existing code and contracts available to the reviewer

```ts
type Room = {
    id: string;
    capacity: number;
    hourCents: number;
    setupCents: number;
};

type Draft = {
    roomId: string;
    start: number;
    end: number;
    people: number;
};

type Booking = Draft & {
    id: string;
    revision: number;
    state: 'confirmed' | 'cancelled';
    paidCents: number;
};

type Context = {mayEdit: boolean; rooms: readonly Room[]};

// Existing helper, already used when creating bookings.
function quoteRoom(room: Room, start: number, end: number): number {
    return room.setupCents + Math.ceil((end - start) / 2) * room.hourCents;
}

type BlockReason =
    | 'forbidden'
    | 'closed'
    | 'invalid-window'
    | 'room-unavailable'
    | 'capacity';

type UpdateCommand = Draft & {bookingId: string; expectedRevision: number};

type Preview =
    | {kind: 'blocked'; reason: BlockReason}
    | {kind: 'unchanged'}
    | {
          kind: 'ready';
          totalCents: number;
          requiresPriceConfirmation: boolean;
          command: UpdateCommand;
      };
```

The fixture's ordinary input-boundary code/documentation must establish these guarantees:

- Required properties exist; strings are non-empty, and enum/boolean values are validated.
- `start` and `end` are integers from 0 to 48. The saved booking guarantees `end > start`; the draft does **not** guarantee that relation.
- `people` and `capacity` are integers from 1 to 30. Money is an integer from 0 to 100,000; zero is allowed. Revision is a positive safe integer.
- Room IDs in the catalog are unique. The catalog is a current snapshot: a room may have been removed or changed since the booking was loaded, so a saved or newly selected ID is not guaranteed to be present.
- Inputs do not change during the call. `quoteRoom` is pure, expects `end > start`, and does no network work.

Therefore the missing-room and interval checks are necessary. `null`, `NaN`, unrecognized booking states and duplicate room IDs are outside this fixture's supported input domain.

## Proposed `head`: valid behavior, difficult to follow

The following is conceptual source for the new change. It must not carry an explanatory comment telling the reviewer what to find.

```ts
function previewEdit(booking: Booking, draft: Draft, context: Context): Preview {
    const room = context.rooms.find(item => item.id === draft.roomId);
    const rangeOk = draft.end > draft.start;
    const same =
        booking.roomId === draft.roomId &&
        booking.start === draft.start &&
        booking.end === draft.end &&
        booking.people === draft.people;

    let blocked = false;
    let unchanged = false;
    let reason: BlockReason | null = null;
    let totalCents = 0;
    let requiresPriceConfirmation = false;
    const quoteCache = new Map<string, number>();

    if (room && rangeOk) {
        const key = `${room.id}:${draft.start}:${draft.end}`;
        if (!quoteCache.has(key)) {
            quoteCache.set(
                key,
                room.setupCents + Math.ceil((draft.end - draft.start) / 2) * room.hourCents,
            );
        }
        totalCents = quoteCache.get(key)!;
        requiresPriceConfirmation = totalCents > booking.paidCents;
    }

    if (room && draft.people > room.capacity) {
        blocked = true;
        reason = 'capacity';
    }
    if (!room) {
        blocked = true;
        reason = 'room-unavailable';
    }
    if (!rangeOk) {
        blocked = true;
        reason = 'invalid-window';
    }
    if (same) {
        blocked = false;
        reason = null;
        unchanged = true;
    }
    if (booking.state === 'cancelled') {
        blocked = true;
        reason = 'closed';
        unchanged = false;
    }
    if (!context.mayEdit) {
        blocked = true;
        reason = 'forbidden';
        unchanged = false;
    }

    if (blocked) return {kind: 'blocked', reason: reason!};
    if (unchanged) return {kind: 'unchanged'};
    return {
        kind: 'ready',
        totalCents,
        requiresPriceConfirmation,
        command: {
            bookingId: booking.id,
            expectedRevision: booking.revision,
            roomId: draft.roomId,
            start: draft.start,
            end: draft.end,
            people: draft.people,
        },
    };
}
```

The rules are sequential, not literally alternating. The readability issue to assess is concrete: final precedence depends on later writes to the shared `blocked`, `reason` and `unchanged` flags. For example, a reader must follow later branches to see why an unchanged booking still returns `unchanged` if its room has since disappeared. Reusing `quoteRoom` and eliminating the per-call map can remove unnecessary duplication and machinery. These are potential maintainability findings; they do not establish a runtime failure. The `reason!` assertion alone does not prove a defect: establish the invariant before criticizing it.

## Proposed control: same task, clearly expressed decisions

```ts
function previewEdit(booking: Booking, draft: Draft, context: Context): Preview {
    if (!context.mayEdit) return {kind: 'blocked', reason: 'forbidden'};
    if (booking.state === 'cancelled') return {kind: 'blocked', reason: 'closed'};

    const same =
        booking.roomId === draft.roomId &&
        booking.start === draft.start &&
        booking.end === draft.end &&
        booking.people === draft.people;
    if (same) return {kind: 'unchanged'};

    if (draft.end <= draft.start) return {kind: 'blocked', reason: 'invalid-window'};
    const room = context.rooms.find(item => item.id === draft.roomId);
    if (!room) return {kind: 'blocked', reason: 'room-unavailable'};
    if (draft.people > room.capacity) return {kind: 'blocked', reason: 'capacity'};

    const totalCents = quoteRoom(room, draft.start, draft.end);
    return {
        kind: 'ready',
        totalCents,
        requiresPriceConfirmation: totalCents > booking.paidCents,
        command: {
            bookingId: booking.id,
            expectedRevision: booking.revision,
            roomId: draft.roomId,
            start: draft.start,
            end: draft.end,
            people: draft.people,
        },
    };
}
```

This is one acceptable control, not a mandatory shape. An `if/else if` chain, a decision helper returning the selected room, or a small group of domain helpers may be equally sound. One coherent function is also acceptable. Neither a specific helper count nor matching these names is a success criterion.

## Organizer's proposed oracle

Base data:

```text
cedar  capacity 4, hour 1200, setup 300
birch  capacity 8, hour  900, setup   0
elm    capacity 2, hour 1500, setup 500
willow capacity 4, hour    0, setup   0

booking: id="demo-booking", revision=7, state=confirmed,
         roomId=cedar, start=20, end=24, people=3, paidCents=2700
context: mayEdit=true; rooms=[cedar, birch, elm, willow]
draft: initially copies the four editable booking fields
```

Every `ready` command contains `bookingId: demo-booking`, `expectedRevision: 7`, and the four fields of that scenario's draft. Neither `blocked` nor `unchanged` contains price, confirmation or command fields.

| ID | Change from base input | Expected |
| --- | --- | --- |
| P1 | `people=4` | ready, 2700, confirmation false |
| P2 | `roomId=birch` | ready, 1800, false |
| P3 | `end=25` | ready, 3900, true |
| P4 | `end=23` | ready, 2700, false |
| P5 | `roomId=willow` | ready, 0, false |
| P6 | `start=0`, `end=1` | ready, 1500, false |
| N1 | no changes | unchanged |
| N2 | `people=4`, `mayEdit=false` | blocked: forbidden |
| N3 | `people=4`, booking cancelled | blocked: closed |
| N4 | `start=24`, `end=24` | blocked: invalid-window |
| N5 | `start=25`, `end=24` | blocked: invalid-window |
| N6 | `roomId=orchid`, not in catalog | blocked: room-unavailable |
| N7 | `roomId=elm` | blocked: capacity |
| Q1 | no edit access; cancelled; missing room; invalid window | blocked: forbidden |
| Q2 | cancelled, draft unchanged | blocked: closed |
| Q3 | draft unchanged, cedar absent from current catalog | unchanged |
| Q4 | draft unchanged, cedar capacity has fallen to 2 | unchanged |
| Q5 | room orchid absent, `start=end=24` | blocked: invalid-window |
| Q6 | room elm, `start=end=24`, `people=3` | blocked: invalid-window |

The price checks use `setup + ceil((end - start) / 2) * hour`. In particular, duration 4 yields 2700 for cedar, duration 5 yields 3900, duration 3 yields 2700, and duration 1 yields 1500. A missing room and excess capacity are not simultaneous computable checks. An unchanged draft and invalid interval cannot coincide because the saved booking's interval is valid; do not make either an invented test.

## Draft review rubric

Assess the following axes separately. For a relevant demonstrated finding, use `0 = missing or wrong`, `1 = promising but incomplete`, `2 = evidence-backed and actionable`. If an axis cannot be observed from the answer, record `not demonstrated` rather than inventing evidence. On the good control, an accurately justified absence of findings can be a good outcome; do not require improvements simply to award points. Findings against either version must be examined on their actual merits, not accepted or rejected based on the version label.

1. **Behavior.** A valid review preserves the documented priorities, result shape, zero price and original revision. Any asserted bug must name a reachable supported input and wrong result. A hypothetical or contradicted defect is not a real finding.
2. **Readability diagnosis.** Full credit on the difficult variant explains the effect of late writes to shared flags on understanding precedence, with a concrete example such as Q3. “Long function” or listing rule names is insufficient. No blanket finding is required on the control.
3. **Boundaries and proposed solution.** A good proposal makes the decision order and data flow clear and keeps price computation behind its prerequisites. A single function, a decision helper or small useful helpers can all qualify. Listing “validate, price, return” without showing how decisions and data fit together is incomplete.
4. **Reuse.** Identify `quoteRoom`, verify its formula and prerequisites, and explain which duplicate can be removed without changing prices. Do not manufacture a duplicate on the control.
5. **Necessity.** For the difficult variant, explain that the fresh map stores one key and is discarded per call. Keep the reachable missing-room and invalid-window guards, valid zero pricing, and revision in the command. A recommendation for a new rule engine, retry layer or cache needs a supported reason.
6. **Whole-target consistency.** `2` means the proposed changes and the retained code work together and preserve precedence, required guards, price and command; a good control with an honest “no findings” also gets `2`, since no change is proposed. `1` means a substantial unresolved design choice can affect the contract; the judge must name the choice. `0` requires a concrete contradiction or reachable scenario broken by the combined recommendations. This is distinct from verifying the reviewer used the right Git snapshot.
7. **Calibration.** Distinguish design judgment, demonstrated behavior, unresolved assumption and optional idea. Do not demand tests for values the input boundary excludes or report unexecuted checks as passed. A justified “no substantive findings” is acceptable on the control.

Separately record each unsupported claim, harmful recommendation, unresolved contract, and proposed optional work. Do not count a single remark as several independent production defects just because it relates to multiple axes. Do not combine the axes into an overall quality percentage.

## What is checked and what is judged

- Once fixture implementation is separately approved, contract tests compare both candidate variants independently with this oracle, check exact result fields and inputs are not mutated, and cover boundaries and priority collisions. Matching the two variants is useful but not a sufficient oracle: both could share the same bug.
- Independent reviewers or judges evaluate the proposed structure and concrete reading/change cost. A passing test does not prove maintainability; a brief review of a good case is not a failure.
- A follow-up implementer may receive the task, the actual change and one review, without the rubric or alternative solution. Compare with a task-only implementer. Verify behavior and use blinded reviewers to judge clarity, locality and unnecessary mechanisms. Do not grade similarity to the control's code, identifiers or function count.
- Freeze the brief, oracle and rubric before the model run. Prepare isolated synthetic repositories containing one assigned change against the same base. Conceal other variants, arm labels and past results. The reviewer should receive the same neutral instruction in each arm, with the skill as the only intended instruction difference.
