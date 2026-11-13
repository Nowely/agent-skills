import { parseCsv } from "../lib/csv.js";
import { isEmail, normalizeEmail } from "./email.js";

export function importContacts(text, store) {
  const rows = parseCsv(text);
  const result = { created: 0, updated: 0, rejected: [], rows: [] };
  const contacts = new Map();

  for (const row of rows) {
    const columns = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]));
    const name = (columns.name ?? "").trim();
    const email = columns.email ?? "";

    if (!name) {
      result.rejected.push({ line: row.line, reason: "name is empty" });
    } else if (!isEmail(email)) {
      result.rejected.push({ line: row.line, reason: "email is not an address" });
    } else {
      result.rows.push({ line: row.line, name, email });
      contacts.set(normalizeEmail(email), { name, email });
    }
  }

  for (const [email, contact] of contacts) {
    const existing = store.findByEmail(email);
    if (existing) {
      if (existing.name !== contact.name) store.rename(existing.id, contact.name);
      result.updated++;
    } else {
      store.insert({ name: contact.name, email });
      result.created++;
    }
  }

  return result;
}
