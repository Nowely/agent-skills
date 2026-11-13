import { isEmail } from "./email.js";

// The single-contact form.
export function createContact(store, { name, email }) {
  if (!name.trim()) return { error: "name is empty" };
  if (!isEmail(email)) return { error: "email is not an address" };
  if (store.findByEmail(email)) return { error: "a contact with this email exists" };
  return { contact: store.insert({ name: name.trim(), email }) };
}
