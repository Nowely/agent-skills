import { parsePhone } from "@acme/phone";
import { isAllowed } from "./countries.js";

// The phone a profile may have, from what a person typed: { e164 }, or { reason } when it is refused.
// `ownId` is the profile being edited, which may keep its own number.
export function checkPhone(typed, store, ownId) {
  if (!typed?.trim()) return { reason: "phone is required" };
  // parsePhone ignores spaces, dashes and brackets itself, and returns null for what is not a number.
  const phone = parsePhone(typed);
  if (!phone) return { reason: "phone is not a number" };
  // @acme/phone gives the country in lower case, as its types say, and our codes are upper case.
  if (!isAllowed(phone.country.toUpperCase())) return { reason: "country is not allowed" };
  const holder = store.findByPhone(phone.e164);
  if (holder && holder.id !== ownId) return { reason: "phone is taken" };
  return { e164: phone.e164 };
}
