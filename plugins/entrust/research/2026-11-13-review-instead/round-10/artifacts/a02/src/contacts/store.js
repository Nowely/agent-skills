import { normalizeEmail } from "./email.js";

// The contacts of one address book, found by email whatever its case and spacing.
export class ContactStore {
  #byEmail = new Map();
  #nextId = 1;

  findByEmail(email) {
    return this.#byEmail.get(normalizeEmail(email)) ?? null;
  }

  insert({ name, email }) {
    const key = normalizeEmail(email);
    if (this.#byEmail.has(key)) throw new Error(`a contact with ${key} exists`);
    const contact = { id: this.#nextId++, name, email: key };
    this.#byEmail.set(key, contact);
    return contact;
  }

  rename(id, name) {
    for (const contact of this.#byEmail.values()) if (contact.id === id) contact.name = name;
  }

  all() {
    return [...this.#byEmail.values()];
  }
}
