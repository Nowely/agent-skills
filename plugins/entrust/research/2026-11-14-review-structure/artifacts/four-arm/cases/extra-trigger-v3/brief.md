# Freight intake

Implement the freight-intake API in `src/intake.js`. The project must remain dependency-free and run on Node.js 20 or newer.

## API

`createIntake({ loadRule, emit })` returns an object with an async `processShipment(shipment)` method.

- `loadRule(kind)` returns a rule object, or a promise for one. A valid rule has a finite, positive numeric `maxKg`. Rule data is stable for the duration of one `processShipment` call, but availability need not be: individual load attempts may reject transiently.
- `emit(event)` receives events synchronously and in call order. It may be omitted; the default is a no-op.
- `loadRule` is required. Export both `createIntake` and `IntakeError` from `src/intake.js`.

A shipment has a non-empty string `id` and a `crates` array. An empty array is valid. Each crate has a non-empty string `id`, a non-empty string `kind`, and a finite, positive numeric `kg`.

## Successful processing

Process acceptance decisions in crate-array order. A crate may be accepted only after its rule has loaded. For a successful shipment, resolve to:

```js
{
  shipmentId,
  count,
  totalKg,
  kinds
}
```

`totalKg` is the sum of all crate weights, `count` is the number of crates, and `kinds` contains each accepted kind once, sorted with the default JavaScript string ordering.

Emit exactly these events:

1. `intake.started` once before any crate decision:
   `{ type, shipmentId, count }`
2. `crate.accepted` once for each accepted crate, in input order:
   `{ type, shipmentId, crateId, kind, kg }`
3. `intake.completed` once after the final acceptance:
   `{ type, shipmentId, count, totalKg }`

For an empty shipment, the start and completion events are adjacent.

## Failures

All processing failures reject with an `IntakeError`. Its `code` property is one of the values below.

- An invalid shipment envelope rejects with `INVALID_SHIPMENT` and emits no events.
- An invalid crate rejects with `INVALID_CRATE`.
- A crate ID repeated within one shipment rejects with `DUPLICATE_CRATE`.
- A rejection of the rule-loading attempt awaited for a crate's acceptance rejects with `RULE_LOAD_FAILED`. Preserve the original error as `cause` and expose `kind` and `crateId` properties.
- A rule with an invalid `maxKg` rejects with `INVALID_RULE`.
- A crate heavier than its rule permits rejects with `OVERWEIGHT`. A crate exactly at the limit is accepted.

After processing has started, a failure emits exactly one final event and no completion event:

```js
{ type: 'intake.failed', shipmentId, code, crateId }
```

Use `crateId: null` when no crate is associated with the failure. Do not emit acceptance events for crates after the failing crate. Prior acceptance events remain in the event log.

For rule loading, an attempt that rejects while acceptance is awaiting it follows the `RULE_LOAD_FAILED` requirement above. A rejection that settled before acceptance began awaiting that attempt is not itself an intake failure and emits no intake event. The earlier attempt may be discarded; when a rule for that kind is subsequently awaited, a fresh attempt may be started and may succeed. Work whose result is not awaited for a crate decision adds no intake events by itself.
