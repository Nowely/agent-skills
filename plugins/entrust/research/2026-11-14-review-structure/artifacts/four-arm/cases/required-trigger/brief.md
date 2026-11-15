# Dock reservations

Implement an in-memory reservation desk for a fictional freight terminal. Consumers call `createDesk({clock, onExpire, onError})`, then `reserve(id, duration)`, `cancel(id)`, `has(id)` and `close()`. IDs are nonempty strings; duration is a finite positive number of milliseconds. Invalid inputs throw `TypeError`. A reservation starts at `clock.now()`; an already active ID cannot be reserved again and throws `Error`. `reserve` and `cancel` throw after close; `has` returns false after close. Cancel returns whether an active reservation was removed; close is idempotent.

An active reservation expires at its deadline without any further consumer call. At expiration the desk removes it and calls `onExpire(id)` exactly once. It must release pending work when a reservation is cancelled or the desk closes. Closing silently removes all reservations. An expired ID can be reserved again, including from its own expiration callback.

## Scheduler and callback contract

`clock.now()` returns monotonic milliseconds. `clock.setTimeout(fn, delay)` returns a handle and queues `fn` for no earlier than `now()+delay`; it never invokes `fn` inline. `clock.clearTimeout(handle)` prevents an undelivered callback, and is safe for an already delivered handle. The clock delivers equal-deadline callbacks in registration order. The desk registers one deadline per reservation. An expiration is committed (removed) before its callback runs. Once committed it cannot be cancelled, even reentrantly; cancelling another not-yet-delivered reservation suppresses its callback. If `onExpire` throws, call `onError(error, id)` once and continue processing other reservations. If `onError` throws, swallow that exception. Neither callback is invoked for cancellations or close. Callback functions are supplied by the caller.

Run acceptance tests with `node --test` on Node 20 or newer. No packages are required.
