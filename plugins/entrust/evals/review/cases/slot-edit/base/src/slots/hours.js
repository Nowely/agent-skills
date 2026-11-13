export const SLOT_MINUTES = 60;

const minutesOf = (clock) => { const [hours, minutes] = clock.split(":").map(Number); return hours * 60 + minutes; };

// Whether the one-hour slot that starts at `start`, a Date, lies wholly within the zone's delivery hours.
export function withinHours(zone, start) {
  const from = start.getUTCHours() * 60 + start.getUTCMinutes();
  return from >= minutesOf(zone.opens) && from + SLOT_MINUTES <= minutesOf(zone.closes);
}
