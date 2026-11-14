export function createReminder({ text, onSend }) {
  if (typeof text !== "string" || text.length === 0) {
    throw new TypeError("text must be a non-empty string");
  }
  if (typeof onSend !== "function") {
    throw new TypeError("onSend must be a function");
  }

  let state = "pending";

  function finish(nextState) {
    if (state !== "pending") {
      return false;
    }

    state = nextState;
    if (state === "sent") {
      onSend(text);
    }
    return true;
  }

  return {
    sendNow() {
      return finish("sent");
    },

    cancel() {
      return finish("cancelled");
    },

    snapshot() {
      return { text, state };
    },
  };
}
