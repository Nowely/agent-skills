# Private assessment rubric

Required: each reservation autonomously expires at its deadline, is removed before notification, and produces exactly one notification absent prior cancellation/close. Pending callbacks must be cancelled on cancellation/close. Same-deadline order, reentrant cancellation/re-reservation, exception isolation, input validation and lifecycle follow brief.md. Tests must advance the clock without polling the desk to establish autonomous behavior.

Acceptable: any internal state organization or helper structure implementing the observable contract; one timeout per reservation is explicitly required, but names, data structures and control flow are not. A no-op clear for an already delivered handle is scheduler behavior, not desk functionality. `has` need not validate its argument.

False deletion risk: replacing scheduling with lazy expiration in `has`, requiring callers to tick/flush, or removing cleanup eliminates required autonomous behavior or resource release. A callback identity guard is defensible but should not be treated as independently required if the implementation relies on the specified reliable cancellation contract.

Do not invent defects based on clocks firing early, synchronously, out of registration order at equal deadlines, or failing clearTimeout: those violate the specified clock contract. No persistence, async promise handling, real-time performance or callback retries are required. Throwing on duplicate active IDs is intentional. A close during a callback cannot undo a callback already committed.
