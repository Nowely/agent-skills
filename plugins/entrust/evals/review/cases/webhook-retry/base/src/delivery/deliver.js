import { send } from "./send.js";
import { wasAcknowledged, markAcknowledged } from "./store.js";

export async function deliver(message, { transport }) {
  if (wasAcknowledged(message.id)) return { kind: "ok", skipped: true };

  const result = await send(message, { idempotencyKey: message.id, transport });
  if (result.kind === "ok") markAcknowledged(message.id);
  return result;
}
