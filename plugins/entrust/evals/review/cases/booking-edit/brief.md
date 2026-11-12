# Task given to the author

Add `previewEdit(booking, draft, context)` in `src/bookings/edit.js` to the room-booking edit flow. Export it as a named function. The input contract is documented in the repository README.

Return these decisions in order:

1. A user without edit access gets `{kind: "blocked", reason: "forbidden"}`.
2. A cancelled booking gets `{kind: "blocked", reason: "closed"}`.
3. If room, start, end and number of people are unchanged, return `{kind: "unchanged"}`.
4. If end is not later than start, return `{kind: "blocked", reason: "invalid-window"}`.
5. If the selected room is absent from the current catalog, return `{kind: "blocked", reason: "room-unavailable"}`.
6. If the number of people exceeds the selected room's capacity, return `{kind: "blocked", reason: "capacity"}`.
7. Otherwise return `ready`, including the price, whether price confirmation is required, and an update command.

A slot is 30 minutes. The price is the room's one-time setup charge plus its hourly rate for each started hour. Confirmation is required only if the new price is strictly greater than the amount previously paid.

The ready result has exactly this shape:

```js
{
  kind: "ready",
  totalCents: /* price in integer cents */,
  requiresPriceConfirmation: /* boolean */,
  command: {
    bookingId: /* booking.id */,
    expectedRevision: /* booking.revision, unchanged */,
    roomId: /* draft.roomId */,
    start: /* draft.start */,
    end: /* draft.end */,
    people: /* draft.people */,
  },
}
```

Blocked and unchanged results contain only the fields shown above. Do not mutate inputs. Previewing does not save the command or contact any service.
