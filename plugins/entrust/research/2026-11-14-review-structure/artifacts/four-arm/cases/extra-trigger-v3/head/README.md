# Freight intake

A small dependency-free library for checking freight crates against rules supplied by a loader.

```js
import { createIntake } from './src/intake.js';

const intake = createIntake({
  loadRule: async kind => rules[kind],
  emit: event => console.log(event),
  schedule: callback => queueMicrotask(callback)
});

const result = await intake.processShipment(shipment);
```

The result contains `shipmentId`, `count`, `totalKg`, and a sorted `kinds` array. Events report the start, individual crate decisions, completion, and failures.

`schedule(callback)` arranges read-ahead of shipment rules and defaults to `queueMicrotask`. Callbacks take no arguments. Read-ahead failures do not themselves emit intake events. A failed attempt is removed; a later on-demand load may retry. If acceptance is already awaiting that attempt, its rejection is reported as `RULE_LOAD_FAILED`. Rules and in-flight loads are shared within each shipment.
