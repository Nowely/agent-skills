import { Client, ApiError } from "./client.mjs";
import { sleep } from "./config.mjs";

const PAGE = 200, HISTORY_PAGE = 100, CAP = 10000;
const PACKAGES = new Set(["@ai-sdk/openai", "@ai-sdk/anthropic", "@ai-sdk/openai-compatible"]);
const ACTIONS = new Set(["read", "glob", "grep", "bash", "edit", "write", "apply_patch", "todowrite", "question"]);
const data = (r) => r && Object.hasOwn(r, "data") ? r.data : r;
const session = (r) => r && typeof r === "object" ? { ...r, directory: r.location?.directory } : r;

export function validateProfile(agent) {
  const rules = agent?.permissions;
  if (!agent || !["primary", "all"].includes(agent.mode) || !Array.isArray(rules)
    || rules[0]?.action !== "*" || rules[0]?.resource !== "*" || rules[0]?.effect !== "deny"
    || rules.slice(1).some((r) => !ACTIONS.has(r.action) || r.resource !== "*"
      || !(r.effect === "ask" || (r.action === "question" && r.effect === "allow"))))
    throw new ApiError("V2 requires a native agent profile with default deny and explicit builtin ask rules");
  return agent;
}

export function normalizeMessages(messages, events, sid) {
  const parents = new Map(), positions = new Map();
  let parent = null, promptSeq = null, previous = 0;
  for (const e of events) {
    const seq = e?.durable?.seq;
    if (e?.durable?.aggregateID !== sid || !Number.isInteger(seq) || seq <= previous)
      throw new ApiError("V2 history has an invalid aggregate sequence");
    previous = seq;
    if (e.type === "session.next.prompted") {
      parent = e.data?.messageID ?? null; promptSeq = seq;
      if (parent) positions.set(parent, seq);
    }
    if (e.type === "session.next.step.started" && e.data?.assistantMessageID) {
      const aid = e.data.assistantMessageID;
      positions.set(aid, seq);
      if (parent) parents.set(aid, { parentID: parent, promptSeq, stepSeq: seq });
    }
  }
  return messages.map((m) => {
    if (typeof m?.id !== "string" || !["user", "assistant", "system", "synthetic", "shell", "agent-switched", "model-switched", "compaction"].includes(m.type))
      throw new ApiError("V2 returned an unsupported message shape");
    const binding = parents.get(m.id);
    const info = { id: m.id, role: m.type, time: m.time, ...(m.type === "assistant" ? {
      parentID: binding?.parentID ?? null, providerID: m.model?.providerID, modelID: m.model?.id,
      variant: m.model?.variant ?? null, agent: m.agent, finish: m.finish, error: m.error, tokens: m.tokens, cost: m.cost,
      attribution: binding ? { source: "v2_durable_prompt_sequence", promptSeq: binding.promptSeq, stepSeq: binding.stepSeq } : null,
    } : {}) };
    const parts = m.type === "user" ? [{ type: "text", text: m.text }] : (m.content ?? []).map((p) =>
      p.type !== "tool" ? p : { ...p, tool: p.name, callID: p.id, state: { ...p.state,
        metadata: p.state?.structured,
        output: (p.state?.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("\n"),
      } });
    return { info, parts, native: m, _sequence: positions.get(m.id) ?? null };
  }).sort((a, b) => (a._sequence ?? Infinity) - (b._sequence ?? Infinity));
}

export class V2Client extends Client {
  url(route) {
    const u = new URL(this.config.url + route);
    if (this.cwd) u.searchParams.set("location[directory]", this.cwd);
    return u;
  }
  async pages(route, { parentID = null } = {}) {
    const u = new URL(route, "http://local");
    u.searchParams.delete("parentID"); u.searchParams.set("limit", String(PAGE)); u.searchParams.set("order", "asc");
    if (u.pathname === "/api/session" && this.cwd && !parentID) u.searchParams.set("directory", this.cwd);
    const out = [], ids = new Set(), cursors = new Set();
    for (let n = 0; n <= CAP / PAGE; n++) {
      const r = await super.call("GET", u.pathname + u.search);
      if (!Array.isArray(r?.data) || !r.cursor || typeof r.cursor !== "object")
        throw new ApiError("V2 pagination envelope is missing");
      if (!r.data.length) return parentID ? out.filter((s) => s.parentID === parentID).map(session) : out;
      for (const item of r.data) {
        if (typeof item?.id !== "string" || ids.has(item.id)) throw new ApiError("V2 pagination repeated or omitted an identity");
        ids.add(item.id); out.push(item);
      }
      if (out.length > CAP) throw new ApiError("V2 pagination exceeds the adapter limit");
      const cursor = r.cursor.next;
      if (typeof cursor !== "string" || !cursor || cursors.has(cursor)) throw new ApiError("V2 pagination has no forward cursor");
      cursors.add(cursor); u.searchParams.delete("order"); u.searchParams.set("cursor", cursor);
    }
    throw new ApiError("V2 pagination did not reach its end");
  }
  async history(sid) {
    const out = []; let after = 0;
    for (let n = 0; n <= CAP / HISTORY_PAGE; n++) {
      const r = await super.call("GET", `/api/session/${encodeURIComponent(sid)}/history?limit=${HISTORY_PAGE}&after=${after}`);
      if (!Array.isArray(r?.data)) throw new ApiError("V2 history envelope is missing");
      if (!r.data.length) return out;
      for (const e of r.data) {
        if (e?.durable?.aggregateID !== sid || !Number.isInteger(e.durable.seq) || e.durable.seq <= after)
          throw new ApiError("V2 history did not advance");
        after = e.durable.seq; out.push(e);
      }
      if (out.length > CAP) throw new ApiError("V2 history exceeds the adapter limit");
    }
    throw new ApiError("V2 history did not reach its end");
  }
  async admitted(sid, id, text) {
    return (await this.history(sid)).some((e) => e.type === "session.next.prompt.admitted"
      && e.data?.messageID === id && e.data?.sessionID === sid && e.data?.prompt?.text === text && e.data?.delivery === "queue");
  }
  async call(method, route, body, options = {}) {
    const u = new URL(route, "http://local"), p = u.pathname;
    const match = /^\/api\/session\/([^/]+)\/message$/.exec(p);
    if (method === "GET" && match) {
      const messages = await this.pages(route), sid = decodeURIComponent(match[1]);
      return normalizeMessages(messages, await this.history(sid), sid);
    }
    if (method === "GET" && p === "/api/session") return this.pages(route, { parentID: u.searchParams.get("parentID") });
    if (method === "GET" && ["/api/permission/request", "/api/question/request"].includes(p) && this.ownedSessions) {
      const kind = p.includes("permission") ? "permission" : "question", out = [];
      for (const sid of this.ownedSessions()) {
        const rows = data(await super.call("GET", `/api/session/${encodeURIComponent(sid)}/${kind}`));
        if (!Array.isArray(rows) || rows.some((q) => q?.sessionID !== sid))
          throw new ApiError(`V2 ${kind} list does not match its owned session`);
        out.push(...rows);
      }
      return out;
    }
    const reply = method === "POST" && /\/((permission|question)\/[^/]+\/(reply|reject)|interrupt|model)$/.test(p);
    const r = await super.call(method, route, body, { ...options, ...(reply ? { expectedStatus: 204 } : {}) });
    if (method === "POST" && /\/prompt$/.test(p) && (r?.data?.id !== body?.id
      || r.data?.prompt?.text !== body?.prompt?.text || r.data?.delivery !== body?.delivery))
      throw new ApiError("V2 prompt acknowledgement does not match the submitted input; outcome unknown");
    const value = data(r);
    if (method === "GET" && p === "/api/session/active"
      && (!value || typeof value !== "object" || Array.isArray(value)))
      throw new ApiError("V2 active-session state is unknown");
    return /^\/api\/session(?:\/[^/]+)?$/.test(p) && !Array.isArray(value) ? session(value) : value;
  }
  async model(ref) {
    for (let i = 0; i < 6; i++) {
      const rows = await this.call("GET", "/api/model");
      if (!Array.isArray(rows)) throw new ApiError("V2 model catalogue is not an array");
      const m = rows.find((m) => m.providerID === ref.providerID && m.id === ref.modelID && m.enabled === true);
      if (m) {
        if (!PACKAGES.has(m.api?.package)) throw new ApiError(`V2 model SDK ${m.api?.package ?? "unknown"} has no verified native dispatch`);
        return { ...ref, name: m.name, variants: (m.variants ?? []).map((v) => v.id), capabilities: m.capabilities ?? {}, api: m.api };
      }
      if (i < 5) await sleep(800);
    }
    throw new ApiError(`V2 model ${ref.providerID}/${ref.modelID} is unavailable; no substitute selected`);
  }
  async profile(name) {
    const rows = await this.call("GET", "/api/agent");
    if (!Array.isArray(rows)) throw new ApiError("V2 agent catalogue is not an array");
    return validateProfile(rows.find((agent) => agent.id === name));
  }
  async events(onEvent, signal) {
    return super.events(onEvent, signal, { route: "/api/event", mapEvent: (e) => ({ ...e, properties: e.data }) });
  }
}
