import { parseCsv } from "../lib/csv.js";
import { isEmail, normalizeEmail } from "./email.js";

export function importContacts(text, store, options = {}) {
  const records = parseCsv(text, options.mode === "legacy" ? ";" : ",");
  const result = { created: 0, updated: 0, rejected: [], rows: [] };
  const contacts = new Map();

  for (const record of records) {
    const column = (name) => Object.entries(record).find(([key]) => key.toLowerCase() === name)?.[1] ?? "";
    const name = column("name").trim();
    const email = column("email");

    if (!name) {
      result.rejected.push({ line: record.line, reason: "name is empty" });
    } else if (!isEmail(email)) {
      result.rejected.push({ line: record.line, reason: "email is not an address" });
    } else {
      contacts.set(normalizeEmail(email), { line: record.line, name, email });
    }
  }

  for (const [email, row] of contacts) {
    const existing = store.findByEmail(email);
    if (existing) {
      if (existing.name !== row.name) store.rename(existing.id, row.name);
      result.updated++;
    } else {
      store.insert({ name: row.name, email });
      result.created++;
    }
    result.rows.push(row);
  }

  return result;
}
