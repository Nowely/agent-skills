const nativeScheduler = {
  schedule(delayMs, callback) {
    return setTimeout(callback, delayMs);
  },

  cancel(handle) {
    clearTimeout(handle);
  },
};

export function createReminder({
  text,
  delayMs,
  onSend,
  scheduler = nativeScheduler,
}) {
  if (typeof text !== "string" || text.length === 0) {
    throw new TypeError("text must be a non-empty string");
  }
  if (typeof onSend !== "function") {
    throw new TypeError("onSend must be a function");
  }
  if (
    !Number.isInteger(delayMs) ||
    delayMs < 0 ||
    delayMs > 2147483647
  ) {
    throw new RangeError("delayMs must be an integer from 0 to 2147483647");
  }

  let state = "pending";
  let timer = null;

  function finish(nextState) {
    if (state !== "pending") {
      return false;
    }

    state = nextState;
    if (timer !== null) {
      scheduler.cancel(timer);
      timer = null;
    }
    if (state === "sent") {
      onSend(text);
    }
    return true;
  }

  timer = scheduler.schedule(delayMs, () => {
    timer = null;
    finish("sent");
  });

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

    toString() {
      return `[${state}] ${text}`;
    },
  };
}
