# Freight intake

A small dependency-free library for checking freight crates against rules supplied by a loader.

```js
import { createIntake } from './src/intake.js';

const intake = createIntake({
  loadRule: async kind => rules[kind],
  emit: event => console.log(event)
});

const result = await intake.processShipment(shipment);
```

The result contains `shipmentId`, `count`, `totalKg`, and a sorted `kinds` array.
