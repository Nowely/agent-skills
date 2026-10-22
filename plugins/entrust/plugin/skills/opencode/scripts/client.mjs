import { sleep } from "./config.mjs";

export class ApiError extends Error {
  constructor(message, status = null) { super(message); this.status = status; }
}
export class Client {
  constructor({ config, cwd = null, timeoutMs = 20000 }) {
    this.config = config; this.cwd = cwd; this.timeoutMs = timeoutMs;
  }
  headers() {
    return { "Content-Type": "application/json", ...(this.config.password ? {
      Authorization: `Basic ${Buffer.from(`opencode:${this.config.password}`).toString("base64")}`,
    } : {}) };
  }
  url(route) {
    const u = new URL(this.config.url + route);
    return u;
  }
  // V2 wraps most operation results as { "data": ... }; `unwrap` returns the inner value,
  // falling back to the whole body for the routes that answer in the clear (/api/info, interrupt).
  async call(method, route, body, { timeoutMs = this.timeoutMs, expectedStatus = null, unwrap = false } = {}) {
    let r;
    try {
      r = await fetch(this.url(route), { method, headers: this.headers(),
        ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(timeoutMs), redirect: "error" });
    } catch (e) { throw new ApiError(`${method} ${route}: transport outcome unknown (${e.name})`); }
    if (r.ok && expectedStatus !== null && r.status !== expectedStatus) {
      await r.body?.cancel();
      throw new ApiError(`${method} ${route}: unexpected success status ${r.status}; outcome unknown`);
    }
    const size = Number(r.headers.get("content-length"));
    if (size > 32 * 1024 * 1024) { await r.body?.cancel(); throw new ApiError(`${route}: response exceeds 32 MiB`); }
    const raw = await r.text();
    if (Buffer.byteLength(raw) > 32 * 1024 * 1024) throw new ApiError(`${route}: response exceeds 32 MiB`);
    if (!r.ok) throw new ApiError(`${method} ${route}: HTTP ${r.status}: ${raw.slice(0, 1000)}`, r.status);
    if (!raw) return null;
    let parsed;
    try { parsed = JSON.parse(raw); } catch { throw new ApiError(`${route}: response is not JSON`, r.status); }
    if (unwrap && parsed && typeof parsed === "object" && "data" in parsed) return parsed.data ?? null;
    return parsed;
  }
  async probe() {
    const info = await this.call("GET", "/api/info");
    if (typeof info?.version !== "string" || typeof info?.pid !== "number")
      throw new ApiError("endpoint is not a healthy OpenCode V2 server");
    const doc = await this.call("GET", "/openapi.json");
    const paths = doc?.paths ?? {};
    return { url: this.config.url, version: info.version, paths };
  }
  async model(ref) {
    const models = await (this.catalogue ??= this.call("GET", "/api/model", undefined, { unwrap: true })) ?? [];
    const m = (Array.isArray(models) ? models : []).find((m) =>
      m?.providerID === ref.providerID && m?.modelID === ref.modelID);
    if (!m || m.enabled !== true) throw new ApiError(`model ${ref.providerID}/${ref.modelID} is unavailable; no substitute selected`);
    if (this.providers == null) this.providers = await this.call("GET", "/api/provider", undefined, { unwrap: true });
    const p = (Array.isArray(this.providers) ? this.providers : []).find((p) => p?.id === ref.providerID);
    if (!p || p.activation === "disabled")
      throw new ApiError(`provider ${ref.providerID} is not active; no substitute selected`);
    return { ...ref, variants: (m.variants ?? []).map((v) => v?.id).filter(Boolean) };
  }
  async events(onEvent, signal, { route = "/api/event", mapEvent = (e) => e } = {}) {
    while (!signal.aborted) {
      try {
        const r = await fetch(this.url(route), { headers: this.headers(), signal, redirect: "error" });
        if (!r.ok || !r.body) throw new Error(`event HTTP ${r.status}`);
        const reader = r.body.getReader(), decoder = new TextDecoder();
        let pending = "";
        try {
          while (!signal.aborted) {
            const { done, value } = await reader.read();
            if (done) break;
            pending += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
            if (pending.length > 1024 * 1024) throw new Error("event frame exceeds 1 MiB");
            let i;
            while ((i = pending.indexOf("\n\n")) >= 0) {
              const frame = pending.slice(0, i); pending = pending.slice(i + 2);
              const data = frame.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trimStart()).join("\n");
              if (data) {
                try {
                  // V2's data is a JSON-encoded string; unwrap one level before the event object.
                  let e = JSON.parse(data);
                  if (typeof e === "string") { try { e = JSON.parse(e); } catch {} }
                  onEvent(mapEvent(e));
                } catch {}
              }
            }
          }
        } finally { await reader.cancel().catch(() => {}); }
      } catch (e) { if (!signal.aborted) onEvent({ type: "entrust.event.disconnected", properties: { reason: e.name } }); }
      if (!signal.aborted) await sleep(500);
    }
  }
}