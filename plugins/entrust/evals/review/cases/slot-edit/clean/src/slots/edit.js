import { createForm } from "@acme/forms";
import { everyMinute } from "../lib/ticker.js";
import { withinHours } from "./hours.js";

const HOUR = 60 * 60 * 1000;

// The message for a slot that is refused, or null. The rules stand in the order they win.
export function slotError(order, slot) {
  if (order.slotChanges >= 3) return "This order's slot can no longer be changed.";
  if (!slot) return "Choose a slot.";
  const start = new Date(slot), { zone } = order.address;
  if (start - Date.now() < (zone.express ? 1 : 2) * HOUR) return "This slot is too soon.";
  if (!withinHours(zone, start)) return "This slot is outside delivery hours.";
  if (order.weightKg > 30 && start.getUTCHours() >= 12) return "Orders over 30 kg are delivered before noon.";
  return null;
}

export function createSlotForm(order) {
  const form = createForm({ slot: order.slot });
  form.setValidator("slot", (slot) => slotError(order, slot));
  // The form reads stored errors on submit and does not validate: a slot that was fine when chosen is checked again as time passes.
  const close = everyMinute(() => form.validate("slot"));
  return { form, close };
}
