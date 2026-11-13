import { getTemplate } from "./templates.js";

export class NotificationService {
  #registry;
  #engine;
  #config;
  #logger;

  constructor({ registry, engine, config, logger = console }) {
    this.#registry = registry;
    this.#engine = engine;
    this.#config = config;
    this.#logger = logger;
  }

  async notify(eventName, payload) {
    const event = this.#config.events?.[eventName];
    if (!event || !event.enabled) {
      return;
    }
    const template = getTemplate(eventName);
    const vars = { ...payload, event: eventName };
    for (const type of event.channels) {
      try {
        const channel = this.#registry.resolve(type);
        await channel.send({
          to: payload.to,
          subject: this.#engine.render(template.subject, vars),
          body: this.#engine.render(template.body, vars),
        });
      } catch (err) {
        this.#logger.error(`notify ${eventName} via ${type} failed: ${err?.message}`);
      }
    }
  }
}
