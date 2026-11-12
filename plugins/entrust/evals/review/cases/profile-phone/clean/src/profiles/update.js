import { checkPhone } from "./phone.js";

// A profile with some of its fields changed, or the reason the change was refused.
export function updateProfile(id, changes, store) {
  const fields = {};
  if (changes.name !== undefined) {
    const name = changes.name.trim();
    if (!name) return { ok: false, reason: "name is empty" };
    fields.name = name;
  }
  if (changes.phone !== undefined) {
    const phone = checkPhone(changes.phone, store, id);
    if (phone.reason) return { ok: false, reason: phone.reason };
    fields.phone = phone.e164;
  }
  return { ok: true, profile: store.update(id, fields) };
}
