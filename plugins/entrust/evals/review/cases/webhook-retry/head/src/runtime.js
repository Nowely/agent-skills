import { setTimeout as sleep } from "node:timers/promises";

// The dependencies the queue worker and the admin commands are started with.
export const deps = {
  transport: {
    post: (url, body, headers) => fetch(url, { method: "POST", body: JSON.stringify(body), headers }),
  },
  sleep,
};
