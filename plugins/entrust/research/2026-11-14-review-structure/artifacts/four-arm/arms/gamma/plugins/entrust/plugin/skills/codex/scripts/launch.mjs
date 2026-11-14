// What the shared launcher, orchestrate/scripts/agent-run.mjs, takes from the Codex adapter: its driver, the
// name a status line gives a Codex model, and the plan's pins an invocation records. Its requests are command
// approvals, the launcher's own kind.
import path from "node:path";
import { fileURLToPath } from "node:url";

export const driver = path.join(path.dirname(fileURLToPath(import.meta.url)), "driver.mjs");

// The short names the page uses for the catalogue's slugs, whatever the generation: the status line says
// what the coordinator retells, and the slug stays in the report. Any other model stays as written.
export const SHORT_NAMES = ["Astra", "Sol", "Terra", "Luna"];
export const shortName = (slug) =>
  SHORT_NAMES.find((n) => new RegExp(`^gpt-\\d+(?:\\.\\d+)*-${n}$`, "i").test(slug)) ?? slug;

// --new: what an invocation records in agent/backend.json and keeps. The plan row, when there is one, pins
// the model and the writes, which the driver enforces at --check-prompt-file and again at launch.
export function prepare({ adapter, row, saved, refuse }) {
  const record = { adapter, planModel: row?.model ?? null, planWrites: row?.writes ?? null };
  if (saved && JSON.stringify(saved) !== JSON.stringify(record))
    refuse("the Codex backend and the approved plan are immutable for this invocation; use a fresh report path");
  return record;
}
