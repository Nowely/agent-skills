import { closePaidInvoices } from "./closePaid.js";
import { ChannelRegistry } from "../notifications/ChannelRegistry.js";
import { EmailChannel } from "../notifications/EmailChannel.js";
import { TemplateEngine } from "../notifications/TemplateEngine.js";
import { NotificationService } from "../notifications/NotificationService.js";
import { loadConfig } from "../notifications/config.js";
import { EventBus } from "../events/bus.js";
import { detectOverdue } from "../invoices/overdue.js";

// Everything the nightly job does, one step after another. `now` is passed in so a night can be replayed.
export async function runNightly({ repo, mailer, now, config }) {
  const today = now.toISOString().slice(0, 10);

  const registry = new ChannelRegistry();
  registry.register("email", () => new EmailChannel(mailer));
  const engine = new TemplateEngine();
  const service = new NotificationService({ registry, engine, config: loadConfig(config) });
  const bus = new EventBus();
  bus.on("invoice.overdue", (payload) => service.notify("invoice.overdue", payload));

  const closed = closePaidInvoices(repo, today);
  await detectOverdue(repo, bus, today);
  return { closed };
}
