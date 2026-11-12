import { parseCsv } from "../lib/csv.js";
import { isEmail, normalizeEmail } from "./email.js";

export function importContacts(text, store) {
  // Parse the whole file before changing the address book.
  const records = parseCsv(text);
  const result = { created: 0, updated: 0, rejected: [], rows: [] };
  const contacts = new Map();

  for (const record of records) {
    // The previous importer accepted column names regardless of case.
    const columns = Object.entries(record);
    const name = (columns.find(([key]) => key.toLowerCase() === "name")?.[1] ?? "").trim();
    const email = columns.find(([key]) => key.toLowerCase() === "email")?.[1] ?? "";

    if (!name) {
      result.rejected.push({ line: record.line, reason: "name is empty" });
    } else if (!isEmail(email)) {
      result.rejected.push({ line: record.line, reason: "email is not an address" });
    } else {
      contacts.set(normalizeEmail(email), name);
      result.rows.push({ line: record.line, name, email });
    }
  }

  for (const [email, name] of contacts) {
    const existing = store.findByEmail(email);
    if (existing) {
      store.rename(existing.id, name);
      result.updated++;
    } else {
      store.insert({ name, email });
      result.created++;
    }
  }

  return result;
}
