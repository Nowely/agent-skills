# Author's rubric — keep outside reviewer repository

This is a fictional independent case, not a report about a working project.
Expected baseline judgment: head satisfies the brief; no known mandatory defect.
The implementation is one valid architecture, not a canonical decomposition.

## Counterexample

Ordered guards encode real conflict priority, not unrelated responsibilities.
Their proximity makes the submit protocol easy to follow. The shared receipt map
supports replay, table occupancy and snapshots without parallel mutable indexes.
The bounded round size makes its linear occupancy scan reasonable. Revision and
seal state carry distinct contract requirements. A class or helper per guard
would add navigation without an established correctness benefit.

The small `receipt(id)` convenience is deliberately outside the requested API.
Its genuine benefit is lookup after an operator loses a receipt without
reconstructing the original score payload. Its modest cost is one public method,
a null-on-miss convention and a separate test to maintain. It uses existing
state, has no effects and exposes frozen receipts.

Keeping it is reasonable. A low-priority scope-reduction idea to remove the
method together with its own test is also reasonable. There is no evidence for
an obligatory correction, runtime performance alarm, or repeated owner questions.
Do not score every optional suggestion as a false positive. Distinguish an idea
from a blocker or a demand presented as necessary.

## Functional boundaries

Required: replay ahead of seal/stale; payload comparison of all three fields;
expected revision excluded from identity; exact ordered error codes; score
domain; table uniqueness; one append before publication; unchanged local state
and identical thrown exception on adapter failure; receipt/snapshot isolation;
round-local state and idempotent sealing.

Removing required functionality to shorten the diff is not simplification.
Tests exercise API behavior and effects, not source layout. Alternative maps,
copies instead of freezing, or extracted helpers are valid if the contract holds.
The mutation runner uses textual changes only to construct negative examples;
it is not an architecture checker.

## Evidence and scoring

- `logs/head-tests.log`: normal full suite, including convenience test.
- `logs/mutants.log`: negative mutants run baseline plus acceptance tests,
  explicitly excluding the convenience test.
- `logs/optional-removal.log`: removal of receipt lookup and its test leaves
  every required test green. This is a scope tradeoff, not a negative mutant.
- `logs/base-tests.log`: the original baseline's tests pass.
- `logs/verification.json`: commit count, clean status, refs/remotes, file hashes.
- `manifest.sha256`: input snapshots, brief, diff and private evidence hashes.

A good review can have no findings or one measured optional lookup-scope note.
Flag unsupported mandatory decomposition, deleting guards/replay/effect ordering,
invented async/reentrant adapter requirements, or treating trusted constructor
inputs as unspecified. Architectural alternatives remain legitimate suggestions.

Limits: synthetic small synchronous in-memory adapter, no restart/durability
implementation, no async races, bounded tables, finite mutation sample. Passing
mutants is evidence for tested properties, not proof of universal correctness.
