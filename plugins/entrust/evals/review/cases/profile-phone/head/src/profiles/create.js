import { parsePhone } from "@acme/phone";
import { ALLOWED } from "./countries.js";

// A new profile, or the reason it was refused.
export function createProfile(input, store, options = {}) {
  const strict = options.strict ?? true;
  const name = (input.name ?? "").trim();
  if (!name) return { ok: false, reason: "name is empty" };

  let parsed = null;
  let phoneValid = false;
  const stripped = (input.phone ?? "").replace(/[\s\-()]/g, "");
  if (stripped) {
    try {
      parsed = parsePhone(stripped);
      phoneValid = true;
    } catch (error) {
      return { ok: false, reason: "phone is not a number" };
    }
  }

  if (strict && !ALLOWED.includes(parsed.country.toUpperCase())) {
    return { ok: false, reason: "country is not allowed" };
  }
  for (const other of store.all()) {
    if (other.phone === input.phone) return { ok: false, reason: "phone is taken" };
  }

  const profile = store.insert({ name, phone: input.phone, phoneE164: parsed.e164, phoneValid });
  return { ok: true, profile };
}
