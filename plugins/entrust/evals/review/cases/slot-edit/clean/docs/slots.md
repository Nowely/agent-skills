# Delivery slots and zones

A delivery slot is one hour long and is named by its start, an ISO time in UTC. All times in this service are UTC.

Every address belongs to a zone. A zone has delivery hours, `opens` and `closes`, and may be an express zone.

An order comes with its zone: `order.address.zone`, since `@acme/orders-client` 4.0. `client.getZone` is for code
that holds a zone's id and no order.
