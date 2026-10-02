import { connection, sleep } from "./config.mjs";

export class ApiError extends Error {
  constructor(message, status = null) { super(message); this.status = status; }
}
export class Client {
  constructor({ config = connection(), cwd = null, timeoutMs = 20000 } = {}) {
    this.config = config; this.cwd = cwd; this.timeoutMs = timeoutMs;
  }
  headers() {
    return { "Content-Type": "application/json", ...(this.config.password ? {
      Authorization: `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString("base64")}`,
    } : {}) };
  }
  url(route) {
    const u = new URL(this.config.url + route);
    if (this.cwd) u.searchParams.set("directory", this.cwd);
    return u;
  }
  async call(method, route, body, { timeoutMs = this.timeoutMs, expectedStatus = null } = {}) {
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
    try { return JSON.parse(raw); } catch { throw new ApiError(`${route}: response is not JSON`, r.status); }
  }
  async probe() {
    const health = await this.call("GET", "/global/health");
    if (health?.healthy !== true || typeof health.version !== "string") throw new ApiError("endpoint is not a healthy OpenCode server");
    const doc = await this.call("GET", "/doc");
    const paths = doc?.paths ?? {};
    return { url: this.config.url, version: health.version, paths, schemas: doc?.components?.schemas ?? {},
      legacy: Boolean(paths["/session/{sessionID}/prompt_async"]?.post),
      v2: Boolean(paths["/api/session/{sessionID}/prompt"]?.post),
      strictSteer: false };
  }
  async model(ref) {
    const catalogue = await (this.catalogue ??= this.call("GET", "/provider"));
    const p = (catalogue?.all ?? []).find((p) => p.id === ref.providerID);
    const m = p?.models?.[ref.modelID];
    if (!m || !Array.isArray(catalogue.connected) || !catalogue.connected.includes(ref.providerID))
      throw new ApiError(`model ${ref.providerID}/${ref.modelID} is unavailable; no substitute selected`);
    return { ...ref, name: m.name ?? ref.modelID, variants: Object.keys(m.variants ?? {}), capabilities: m.capabilities ?? {} };
  }
  async events(onEvent, signal, { route = "/event", mapEvent = (e) => e } = {}) {
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
              if (data) { try { onEvent(mapEvent(JSON.parse(data))); } catch {} }
            }
          }
        } finally { await reader.cancel().catch(() => {}); }
      } catch (e) { if (!signal.aborted) onEvent({ type: "entrust.event.disconnected", properties: { reason: e.name } }); }
      if (!signal.aborted) await sleep(500);
    }
  }
}
