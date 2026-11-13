import { parseCsv } from "../lib/csv.js";
import { isEmail, normalizeEmail } from "./email.js";

export function importContacts(text, store) {
  const records = parseCsv(text);
  const result = { created: 0, updated: 0, rejected: [] };
  const contacts = new Map();

  for (const record of records) {
    const name = (record.name ?? "").trim();
    const email = record.email ?? "";

    if (name === "") {
      result.rejected.push({ line: record.line, reason: "name is empty" });
    } else if (!isEmail(email)) {
      result.rejected.push({ line: record.line, reason: "email is not an address" });
    } else {
      contacts.set(normalizeEmail(email), name);
    }
  }

  for (const [email, name] of contacts) {
    const existing = store.findByEmail(email);
    if (existing) {
      if (existing.name !== name) store.rename(existing.id, name);
      result.updated++;
    } else {
      store.insert({ name, email });
      result.created++;
    }
  }

  return result;
}
