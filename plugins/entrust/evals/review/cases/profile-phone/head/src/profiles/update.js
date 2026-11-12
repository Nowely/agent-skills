// A profile with some of its fields changed, or the reason the change was refused.
export function updateProfile(id, changes, store) {
  const fields = {};
  if (changes.name !== undefined) {
    const name = changes.name.trim();
    if (!name) return { ok: false, reason: "name is empty" };
    fields.name = name;
  }
  return { ok: true, profile: store.update(id, fields) };
}
