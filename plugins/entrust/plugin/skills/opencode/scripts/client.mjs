import { SERVER_USER } from "./config.mjs";

export class ApiError extends Error {
  constructor(message, status = null) { super(message); this.status = status; }
}

// A route read against a directory's configuration: the model catalogue, the default and the configuration
// itself answer for the server's own directory unless asked for another.
const located = (route, cwd) => (cwd ? `${route}?location[directory]=${encodeURIComponent(cwd)}` : route);

export class Client {
  constructor({ config, timeoutMs = 20000 }) {
    this.config = config; this.timeoutMs = timeoutMs;
  }
  headers() {
    return { "Content-Type": "application/json", ...(this.config.password ? {
      Authorization: `Basic ${Buffer.from(`${SERVER_USER}:${this.config.password}`).toString("base64")}`,
    } : {}) };
  }
  // V2 wraps most operation results as { "data": ... }; `unwrap` returns the inner value,
  // falling back to the whole body for the routes that answer in the clear (/api/info, interrupt).
  async call(method, route, body, { timeoutMs = this.timeoutMs, expectedStatus = null, unwrap = false } = {}) {
    let r;
    try {
      r = await fetch(new URL(this.config.url + route), { method, headers: this.headers(),
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
  // The models a directory's configuration leaves enabled. A provider that is disabled, denied by a policy or
  // not connected is not in the catalogue at all.
  async models(cwd) {
    const models = await this.call("GET", located("/api/model", cwd), undefined, { unwrap: true });
    if (!Array.isArray(models)) throw new ApiError("/api/model: expected a model array");
    return models.filter((m) => m?.enabled === true && typeof m.providerID === "string" && typeof m.id === "string");
  }
  // A model is named by its catalogue id, which an alias (a `-fast` entry) does not share with its modelID.
  async model(ref, cwd) {
    this.catalogue ??= await this.models(cwd);
    const m = this.catalogue.find((m) => m.providerID === ref.providerID && m.id === ref.modelID);
    if (!m) throw new ApiError(`model ${ref.providerID}/${ref.modelID} is unavailable; no substitute selected`);
    return { ...ref, variants: (m.variants ?? []).map((v) => v?.id).filter(Boolean) };
  }
  // The configuration's own `model`, or null when no document sets one: the server then names a default
  // nobody selected.
  async defaultModel(cwd) {
    const docs = await this.call("GET", located("/api/config", cwd));
    if (!Array.isArray(docs)) throw new ApiError("/api/config: expected a configuration array");
    if (!docs.some((d) => d?.type === "document" && d.info?.model)) return null;
    const m = await this.call("GET", located("/api/model/default", cwd), undefined, { unwrap: true });
    return typeof m?.providerID === "string" && typeof m?.id === "string" ? { providerID: m.providerID, modelID: m.id } : null;
  }
}
