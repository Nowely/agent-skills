# Delivery slots and zones

A delivery slot is one hour long and is named by its start, an ISO time in UTC. All times in this service are UTC.

Every address belongs to a zone. A zone has delivery hours, `opens` and `closes`, and may be an express zone.

An order's address has `zoneId`. Load the zone with `client.getZone(zoneId)` to learn its hours; the zone service
is slow, so keep what it returns for a few minutes.
