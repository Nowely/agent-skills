import { checkPhone } from "./phone.js";

// A new profile, or the reason it was refused.
export function createProfile(input, store) {
  const name = (input.name ?? "").trim();
  if (!name) return { ok: false, reason: "name is empty" };
  const phone = checkPhone(input.phone, store);
  if (phone.reason) return { ok: false, reason: phone.reason };
  return { ok: true, profile: store.insert({ name, phone: phone.e164 }) };
}
