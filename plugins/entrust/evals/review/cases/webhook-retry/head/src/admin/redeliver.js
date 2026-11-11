import { deliver } from "../delivery/deliver.js";
import { loadMessage } from "../delivery/outbox.js";

// Operators run this for a message whose endpoint rejected it, once the endpoint has been fixed.
export async function redeliver(messageId, deps) {
  const result = await deliver(loadMessage(messageId), deps);
  return result.kind === "ok" ? "delivered" : `failed: ${result.kind}`;
}
