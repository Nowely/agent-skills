import test from "node:test";
import assert from "node:assert/strict";
import { ChannelRegistry } from "../src/notifications/ChannelRegistry.js";
import { TemplateEngine } from "../src/notifications/TemplateEngine.js";
import { EventBus } from "../src/events/bus.js";
import { NotificationService } from "../src/notifications/NotificationService.js";

test("ChannelRegistry resolve creates the channel once and caches it", () => {
  const registry = new ChannelRegistry();
  let created = 0;
  registry.register("fake", () => {
    created++;
    return { kind: "fake" };
  });
  assert.equal(registry.has("fake"), true);
  assert.deepEqual(registry.list(), ["fake"]);
  const first = registry.resolve("fake");
  const second = registry.resolve("fake");
  assert.equal(first, second);
  assert.equal(created, 1);
});

test("ChannelRegistry throws for an unknown channel type", () => {
  const registry = new ChannelRegistry();
  assert.throws(() => registry.resolve("nope"), /Unknown channel type/);
  assert.equal(registry.has("nope"), false);
});

test("TemplateEngine resolves dotted paths and renders unknown paths as empty", () => {
  const engine = new TemplateEngine();
  assert.equal(engine.render("{{ a.b.c }}|{{ missing.path }}", { a: { b: { c: "deep" } } }), "deep|");
});

test("TemplateEngine applies upper, lower and money filters", () => {
  const engine = new TemplateEngine();
  const vars = { name: "Mixed Case", amount: { minor: 12000, currency: "EUR" } };
  assert.equal(engine.render("{{ name | upper }}", vars), "MIXED CASE");
  assert.equal(engine.render("{{ name | lower }}", vars), "mixed case");
  assert.equal(engine.render("{{ amount | money }}", vars), "EUR 120.00");
});

test("TemplateEngine uses a registered custom filter", () => {
  const engine = new TemplateEngine();
  engine.registerFilter("twice", (value) => `${value}${value}`);
  assert.equal(engine.render("{{ word | twice }}", { word: "ab" }), "abab");
});

test("EventBus runs middleware before handlers", async () => {
  const bus = new EventBus();
  const order = [];
  bus.use(async (event, payload, next) => {
    order.push(`middleware:${event}`);
    await next();
    order.push("middleware:after");
  });
  bus.on("thing", async (payload) => {
    order.push(`handler:${payload.id}`);
  });
  bus.on("thing", () => {
    order.push("second-handler");
  });
  await bus.emit("thing", { id: 7 });
  assert.deepEqual(order, [
    "middleware:thing",
    "handler:7",
    "second-handler",
    "middleware:after",
  ]);
});

function fakeChannel() {
  const sent = [];
  return {
    sent,
    async send(message) {
      sent.push(message);
    },
  };
}

function fakeRegistry(channel) {
  return { resolve: () => channel };
}

const silentLogger = { error() {} };

test("NotificationService sends once for an enabled event", async () => {
  const channel = fakeChannel();
  const service = new NotificationService({
    registry: fakeRegistry(channel),
    engine: new TemplateEngine(),
    config: { events: { "invoice.overdue": { enabled: true, channels: ["email"] } } },
    logger: silentLogger,
  });
  await service.notify("invoice.overdue", {
    to: "buyer@example.com",
    invoice: { number: "INV-9", amount: { minor: 500, currency: "EUR" }, dueDate: "2026-01-01" },
  });
  assert.equal(channel.sent.length, 1);
  assert.equal(channel.sent[0].to, "buyer@example.com");
});

test("NotificationService does not send for a disabled event", async () => {
  const channel = fakeChannel();
  const service = new NotificationService({
    registry: fakeRegistry(channel),
    engine: new TemplateEngine(),
    config: { events: { "invoice.overdue": { enabled: false, channels: ["email"] } } },
    logger: silentLogger,
  });
  await service.notify("invoice.overdue", { to: "buyer@example.com", invoice: {} });
  assert.equal(channel.sent.length, 0);
});
