// What the shared launcher, orchestrate/scripts/agent-run.mjs, takes from the Codex adapter: its driver and
// the name a status line gives a Codex model. Codex agents record no backend; their requests are command
// approvals, the launcher's own kind.
import path from "node:path";
import { fileURLToPath } from "node:url";

export const driver = path.join(path.dirname(fileURLToPath(import.meta.url)), "driver.mjs");

// The short names the page uses for the catalogue's slugs, whatever the generation: the status line says
// what the coordinator retells, and the slug stays in the report. Any other model stays as written.
export const SHORT_NAMES = ["Astra", "Sol", "Terra", "Luna"];
export const shortName = (slug) =>
  SHORT_NAMES.find((n) => new RegExp(`^gpt-\\d+(?:\\.\\d+)*-${n}$`, "i").test(slug)) ?? slug;
