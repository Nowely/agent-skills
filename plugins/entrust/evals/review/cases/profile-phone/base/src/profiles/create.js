// A new profile, or the reason it was refused.
export function createProfile(input, store) {
  const name = (input.name ?? "").trim();
  if (!name) return { ok: false, reason: "name is empty" };
  return { ok: true, profile: store.insert({ name }) };
}
