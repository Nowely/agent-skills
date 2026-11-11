const messages = new Map();

export function saveMessage(message) {
  messages.set(message.id, message);
}

export function loadMessage(messageId) {
  const message = messages.get(messageId);
  if (!message) throw new Error(`no message ${messageId}`);
  return message;
}
