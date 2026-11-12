import { SLOT_MINUTES, withinHours } from "./hours.js";

// The slots a courier can be given on a day: every whole hour inside the zone's hours.
export function slotsOf(zone, day) {
  const slots = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += SLOT_MINUTES) {
    const start = new Date(`${day}T00:00:00Z`);
    start.setUTCMinutes(minutes);
    if (withinHours(zone, start)) slots.push(start.toISOString());
  }
  return slots;
}
