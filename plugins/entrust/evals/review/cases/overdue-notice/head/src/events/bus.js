export class EventBus {
  #handlers = new Map();
  #middleware = [];

  on(event, handler) {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, []);
    }
    this.#handlers.get(event).push(handler);
  }

  use(middleware) {
    this.#middleware.push(middleware);
  }

  async emit(event, payload) {
    const handlers = this.#handlers.get(event) ?? [];
    const dispatch = async (index) => {
      if (index < this.#middleware.length) {
        const middleware = this.#middleware[index];
        return middleware(event, payload, () => dispatch(index + 1));
      }
      for (const handler of handlers) {
        await handler(payload);
      }
    };
    return dispatch(0);
  }
}
