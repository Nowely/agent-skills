// The adapters this plugin installs. Each declares itself in skills/<id>/adapter.json, its directory name
// being its id: a read-only status probe, the entry point that launches its external workers, the hooks the
// shared launcher takes from it (launch), the models a plan row may give it (plan, native when its agents are
// the host's own), its swarm defaults and the shape of its model slugs, each optional. Paths in a declaration
// are relative to the adapter's directory.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SKILLS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function adapters(root = SKILLS_ROOT) {
  let names;
  try { names = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort(); }
  catch { return []; }
  const found = [];
  for (const id of names) {
    const dir = path.join(root, id), file = path.join(dir, "adapter.json");
    let text;
    try { text = fs.readFileSync(file, "utf8"); } catch { continue; }
    const a = JSON.parse(text);
    if (a?.schemaVersion !== 1) throw new Error(`invalid adapter declaration: ${file}`);
    const at = (rel) => (typeof rel === "string" ? path.join(dir, rel) : null);
    found.push({ id, dir,
      status: a.status ? { script: at(a.status.script), args: a.status.args ?? [] } : null,
      launcher: at(a.launcher), launch: at(a.launch), plan: a.plan ?? null,
      swarm: a.swarm ?? {}, modelSlug: a.modelSlug ?? null });
  }
  return found;
}
