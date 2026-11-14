# Tournament result desk

The local scorekeeper records decisive games for one small tournament round.
The baseline handles normal score entry. Extend it so an operator can safely
retry a submission after losing its receipt, and seal a round before exporting.

## Inputs and integration contract

- Node >=20, ESM, no dependencies; run `npm test` in the repository.
- `createRound(tableIds, persist)` receives 1–32 unique nonempty string table IDs
  and a synchronous function. These constructor inputs are trusted.
- `submit(command)` receives a plain object with nonempty string `id` and
  `table`, nonnegative safe integer `expectedRevision`, and numeric `home` /
  `away`. No coercion is requested. Extra fields are ignored.
- Scores must be integers from 0 through 99, with unequal scores. In particular
  NaN, infinity, fractions, negative numbers and ties are invalid.
- Calls are serial. `persist` does not invoke `submit` or `seal`, or mutate its
  inputs; it may read `snapshot()`.
  It either durably appends the supplied receipt and returns normally, or throws
  without appending anything. Asynchronous persistence and ambiguous commits
  are outside this adapter's contract.
- IDs are scoped to one round. The desk lives in memory; restart recovery,
  corrections, standings and networking are outside this change.

## Required behavior

Revision begins at zero. Each successful **new** submission appends exactly one
receipt `{id, table, home, away, revision}` with the next revision, then publishes
it in local state. Return that receipt. Existing field names remain compatible.

Evaluate conflicts in this order (error messages below are stable API codes):

1. If the ID was already accepted, compare table and both scores. Identical
   payload returns the original receipt without persisting or changing revision.
   `expectedRevision` is transport metadata, not part of replay identity.
   A changed payload throws `ID_REUSED`.
2. A new ID on a sealed round throws `ROUND_SEALED`.
3. A new ID whose expected revision differs from current revision throws
   `STALE_REVISION`.
4. An unknown table throws `UNKNOWN_TABLE`.
5. A table with a result already accepted under another ID throws
   `TABLE_RECORDED`.
6. Invalid scores throw `INVALID_SCORE`.

All failures leave observable state unchanged and never call `persist`, except
that a persistence exception itself is propagated unchanged. That exception
must leave local state and ID availability unchanged, permitting a retry.

`seal()` is idempotent, blocks new IDs, leaves revision unchanged and has no
persistence effect. It can be called before every table has a result. Accepted
replays continue working after sealing, even with an old expected revision.

`snapshot()` returns `{revision, results}` in acceptance order. A caller changing
a returned snapshot or receipt must not corrupt future snapshots, duplicate
matching or returned receipts. Frozen receipts or defensive copies both satisfy
this requirement. No object-identity guarantee is required.

## Acceptance sequences

- Submit A at revision 0 → revision 1. Submit B at revision 0 → stale. Submit B
  at revision 1 → revision 2. Replay A at revision 0 → original revision 1.
- Seal, replay A → success; changed A → ID conflict; new C → sealed.
- Persistence fails for A → revision 0, empty results; retry A → one accepted
  result at revision 1.
- An otherwise invalid request that also conflicts must report the earliest
  applicable code above.

Preserve the baseline's successful score-entry behavior and tests. The API and
effects above are requirements; the implementation is not the only correct
architecture. Equivalent cohesive implementations are welcome.
