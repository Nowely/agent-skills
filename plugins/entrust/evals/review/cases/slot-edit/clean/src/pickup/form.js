import { createForm } from "@acme/forms";
import { everyMinute } from "../lib/ticker.js";

const NOTICE = 30 * 60 * 1000;

export function pickupError(time) {
  if (!time) return "Choose a pickup time.";
  if (new Date(time) - Date.now() < NOTICE) return "A pickup needs thirty minutes' notice.";
  return null;
}

export function createPickupForm(order) {
  const form = createForm({ time: order.pickup });
  form.setValidator("time", pickupError);
  const close = everyMinute(() => form.validate("time"));
  return { form, close };
}
