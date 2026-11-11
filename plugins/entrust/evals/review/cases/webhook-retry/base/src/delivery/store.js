const acknowledged = new Set();

export function wasAcknowledged(messageId) {
  return acknowledged.has(messageId);
}

export function markAcknowledged(messageId) {
  acknowledged.add(messageId);
}
