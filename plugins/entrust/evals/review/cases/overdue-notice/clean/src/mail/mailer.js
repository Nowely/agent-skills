// The one way the app sends mail. `transport.deliver` rejects when the message was not accepted.
export function createMailer(transport, from = "billing@shop.example") {
  return { send: (to, subject, body) => transport.deliver({ from, to, subject, body }) };
}
