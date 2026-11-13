export class ChannelRegistry {
  #factories = new Map();
  #instances = new Map();

  register(type, factory) {
    this.#factories.set(type, factory);
  }

  resolve(type) {
    if (this.#instances.has(type)) {
      return this.#instances.get(type);
    }
    const factory = this.#factories.get(type);
    if (!factory) {
      throw new Error(`Unknown channel type: ${type}`);
    }
    const instance = factory();
    this.#instances.set(type, instance);
    return instance;
  }

  has(type) {
    return this.#factories.has(type);
  }

  list() {
    return [...this.#factories.keys()];
  }
}
