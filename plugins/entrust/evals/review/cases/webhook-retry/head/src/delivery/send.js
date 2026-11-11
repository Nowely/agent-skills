// One HTTP attempt, mapped to a result kind. A network error or a timeout is "temporary": the endpoint
// may have processed the request before the connection broke, which is what the idempotency key is for.
export async function send(message, { idempotencyKey, transport }) {
  try {
    const response = await transport.post(message.url, message.body, { "Idempotency-Key": idempotencyKey });
    if (response.status >= 200 && response.status < 300) return { kind: "ok" };
    if (response.status === 429 || response.status >= 500) return { kind: "temporary" };
    return { kind: "permanent", status: response.status };
  } catch {
    return { kind: "temporary" };
  }
}
