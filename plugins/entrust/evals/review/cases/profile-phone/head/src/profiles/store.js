// The profiles of this process, by id.
export class ProfileStore {
  #profiles = new Map();
  #next = 1;

  insert(fields) {
    const profile = { id: this.#next++, ...fields };
    this.#profiles.set(profile.id, profile);
    return profile;
  }

  update(id, fields) {
    const profile = this.#profiles.get(id);
    if (!profile) throw new Error(`no profile ${id}`);
    return Object.assign(profile, fields);
  }

  all() {
    return [...this.#profiles.values()];
  }
}
