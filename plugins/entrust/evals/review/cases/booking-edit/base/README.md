# Room bookings

The booking editor works with slots within one day. Each slot is 30 minutes. All amounts are integer cents. A room's price consists of its setup charge once, plus its hourly charge for each started hour.

## Input boundary

These functions are called after input shape and primitive-value validation. They receive ordinary data objects and arrays with the following guarantees; validating these guarantees again inside a preview is not part of its contract.

```text
Room     { id, capacity, hourCents, setupCents }
Draft    { roomId, start, end, people }
Booking  { id, revision, state, paidCents, roomId, start, end, people }
Context  { mayEdit, rooms }
```

- All required properties exist. IDs are non-empty strings. `mayEdit` is a boolean. `state` is either `confirmed` or `cancelled`.
- `start` and `end` are integers from 0 through 48. A saved Booking always has `end > start`. A Draft may have an equal or reversed interval; its preview must handle that condition.
- `people` and `capacity` are integers from 1 through 30.
- `hourCents`, `setupCents` and `paidCents` are integers from 0 through 100,000, inclusive. A zero price is valid. A calculated total may exceed 100,000.
- `revision` is a positive safe integer.
- Room IDs in `context.rooms` are unique. The array is the current catalog snapshot. A room may have disappeared or changed since the booking was saved. Neither a saved room ID nor a draft room ID is guaranteed to be present. The saved headcount may now exceed that room's capacity.
- Inputs are stable during a call. Functions must leave them unchanged. There is no network work or persistence in these previews.

Missing properties, null objects, non-finite numbers, unsupported states, duplicate catalog IDs, accessors and concurrent input changes are outside this boundary. It does not guarantee a draft's room exists, that its interval is positive, or that its headcount fits its room.

## Existing creation flow

`src/bookings/create.js` exports `previewCreate(room, draft)`. Creation receives an existing selected Room; the draft's interval and capacity still need checking. Its result is blocked for an invalid interval or excess capacity, otherwise it returns the total price.

`src/bookings/quote.js` exports the pure `quoteRoom(room, start, end)` used by creation. Its caller must supply an existing Room and a positive interval. It does not validate these prerequisites or perform I/O.
