import { send } from "./send.js";
import { backoffMs } from "./backoff.js";
import { wasAcknowledged, markAcknowledged } from "./store.js";

const MAX_ATTEMPTS = 3;

export async function deliver(message, { transport, sleep }) {
  if (wasAcknowledged(message.id)) return { kind: "ok", skipped: true };

  let result;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    result = await send(message, { idempotencyKey: message.id, transport });
    if (result.kind !== "temporary") break;
    await sleep(backoffMs(attempt));
  }

  if (result.kind !== "temporary") markAcknowledged(message.id);
  return result;
}
