import { parseCsv } from "../lib/csv.js";
import { isEmail, normalizeEmail } from "./email.js";

function rejection({ name = "", email = "" }) {
  if (!name.trim()) return "name is empty";
  if (!isEmail(email)) return "email is not an address";
  return null;
}

// What an import will do, decided before anything is written. The last row for an email wins.
export function planImport(rows, store) {
  const rejected = [];
  const names = new Map();
  for (const row of rows) {
    const reason = rejection(row);
    if (reason) rejected.push({ line: row.line, reason });
    else names.set(normalizeEmail(row.email), row.name.trim());
  }

  const create = [];
  const rename = [];
  for (const [email, name] of names) {
    const existing = store.findByEmail(email);
    if (existing) rename.push({ id: existing.id, name });
    else create.push({ name, email });
  }
  return { create, rename, rejected };
}

export function importContacts(text, store) {
  const plan = planImport(parseCsv(text), store);
  for (const contact of plan.create) store.insert(contact);
  for (const { id, name } of plan.rename) store.rename(id, name);
  return { created: plan.create.length, updated: plan.rename.length, rejected: plan.rejected };
}

export function previewImport(text, store) { return importContacts(text, store); }
