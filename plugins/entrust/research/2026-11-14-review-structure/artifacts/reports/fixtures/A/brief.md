# Workshop orders

Add rush handling to `submitOrder`. A rush order costs 4 extra units and records a `rush` event after the existing events. All orders must still reserve one kit, charge the calculated amount, and record their events. Members receive a 2-unit discount; fragile kits cost 3 extra units for protective packing. The base price is 10. The stock must be positive before any effect occurs. An out-of-stock order throws `Out of stock` without effects. Effects are synchronous and may be assumed to succeed. Inputs are boolean flags and a nonnegative integer stock.
