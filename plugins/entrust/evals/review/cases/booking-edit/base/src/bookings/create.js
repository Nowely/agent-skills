import { quoteRoom } from "./quote.js";

export function previewCreate(room, draft) {
  if (draft.end <= draft.start) return { kind: "blocked", reason: "invalid-window" };
  if (draft.people > room.capacity) return { kind: "blocked", reason: "capacity" };

  return { kind: "ready", totalCents: quoteRoom(room, draft.start, draft.end) };
}
