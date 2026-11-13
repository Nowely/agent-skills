import { createForm } from "@acme/forms";

const SLOT = 60;
const TTL = 5 * 60 * 1000;
const zones = new Map();

async function loadZone(client, id) {
  const cached = zones.get(id);
  if (cached && Date.now() - cached.at < TTL) return cached.zone;
  let zone;
  try {
    zone = await client.getZone(id);
  } catch {
    // The zone service is slow and sometimes drops a request: try once more.
    zone = await client.getZone(id);
  }
  zones.set(id, { zone, at: Date.now() });
  return zone;
}

export function createSlotForm(order, client) {
  const form = createForm({ slot: order.slot });
  const state = { zone: null, loading: true, failed: false };

  function validate(value) {
    let message = null;
    if (!value) message = "Choose a slot.";
    const start = new Date(value);
    const minutes = start.getUTCHours() * 60 + start.getUTCMinutes();
    let lead = 120;
    if (state.zone) {
      if (state.zone.express) lead = 60;
      const [openHours, openMinutes] = state.zone.opens.split(":").map(Number);
      const [closeHours, closeMinutes] = state.zone.closes.split(":").map(Number);
      if (minutes < openHours * 60 + openMinutes || minutes + SLOT > closeHours * 60 + closeMinutes) {
        message = "This slot is outside delivery hours.";
      }
      if (order.weightKg > 30) {
        if (minutes >= 720 && !message) message = "Orders over 30 kg are delivered before noon.";
      }
    } else if (order.weightKg > 30 && minutes >= 720) {
      message = "Orders over 30 kg are delivered before noon.";
    }
    if (start.getTime() - Date.now() < lead * 60000) message = "This slot is too soon.";
    if (!value) message = "Choose a slot.";
    if (order.slotChanges >= 3) return "This order's slot can no longer be changed.";
    return message;
  }

  form.setValidator("slot", validate);
  loadZone(client, order.address.zone.id).then((zone) => {
    state.zone = zone;
    state.loading = false;
    form.setValidator("slot", validate);
  }, () => {
    state.loading = false;
    state.failed = true;
  });

  // Time passes while the form is open: run the validation again.
  const timer = setInterval(() => form.setValidator("slot", (value) => validate(value)), 30000);
  timer.unref(); // so that the tests can exit

  form.loading = () => state.loading;
  form.failed = () => state.failed;
  return form;
}
